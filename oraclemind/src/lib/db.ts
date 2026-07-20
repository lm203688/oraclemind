import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 安全的PrismaClient——所有操作失败时返回null而非抛出异常
function createSafePrismaClient(): PrismaClient {
  let client: PrismaClient
  try {
    client = new PrismaClient({ log: ['error'] })
  } catch {
    // 如果PrismaClient创建失败——返回noop代理
    return createNoopClient()
  }
  
  // 包装所有方法——try-catch降级
  return new Proxy(client, {
    get(target, prop) {
      const orig = (target as any)[prop]
      if (typeof orig === 'object' && orig !== null) {
        // 对user/prediction/simulation等model做递归代理
        return new Proxy(orig, {
          get(modelTarget, modelProp) {
            const modelMethod = (modelTarget as any)[modelProp]
            if (typeof modelMethod === 'function') {
              return async function(...args: any[]) {
                try {
                  return await modelMethod.apply(modelTarget, args)
                } catch (e) {
                  console.error(`[DB] ${String(prop)}.${String(modelProp)} failed:`, (e as Error).message?.slice(0, 100))
                  return null
                }
              }
            }
            return modelMethod
          }
        })
      }
      if (typeof orig === 'function') {
        return async function(...args: any[]) {
          try {
            return await orig.apply(target, args)
          } catch (e) {
            console.error(`[DB] ${String(prop)} failed:`, (e as Error).message?.slice(0, 100))
            return null
          }
        }
      }
      return orig
    }
  }) as unknown as PrismaClient
}

function createNoopClient(): PrismaClient {
  return new Proxy({}, {
    get: () => new Proxy({}, {
      get: () => async () => null
    })
  }) as unknown as PrismaClient
}

export const db = globalForPrisma.prisma ?? createSafePrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
