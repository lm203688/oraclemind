/**
 * User Memory — 用户长期记忆（Zep模式）
 *
 * 三种记忆类型：
 *   - episodic: 事件记忆（具体的对话/交互记录）
 *   - semantic: 语义记忆（关于用户的事实，如"用户是产品经理"）
 *   - summary:  摘要记忆（定期压缩的长周期总结）
 *
 * 混合记忆视界：
 *   - 短期：最近10条episodic明细
 *   - 长期：semantic + summary（用LLM定期压缩）
 *
 * 用SQLite存储，embedding字段用base64编码（语义检索的轻量实现）。
 */

import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MemoryType = 'episodic' | 'semantic' | 'summary';

export interface UserMemoryData {
  id: string;
  userId: string;
  memoryType: MemoryType;
  content: string;
  summary?: string;
  embedding?: string;  // base64-encoded float32 array
  relevance: number;
  lastAccessedAt: Date;
  createdAt: Date;
}

export interface MemoryQueryOptions {
  limit?: number;
  type?: MemoryType;
  /** 语义检索查询文本（如果提供，会按相关性排序） */
  semanticQuery?: string;
  /** 最小相关性阈值 */
  minRelevance?: number;
}

// ---------------------------------------------------------------------------
// 写入记忆
// ---------------------------------------------------------------------------

export async function addMemory(data: {
  userId: string;
  memoryType: MemoryType;
  content: string;
  summary?: string;
  embedding?: number[];  // float32 array
}): Promise<string> {
  // 确保 user 存在
  await db.user.upsert({
    where: { id: data.userId },
    update: {},
    create: { id: data.userId },
  });

  let embeddingStr: string | undefined;
  if (data.embedding) {
    const buf = Buffer.alloc(data.embedding.length * 4);
    for (let i = 0; i < data.embedding.length; i++) {
      buf.writeFloatLE(data.embedding[i], i * 4);
    }
    embeddingStr = buf.toString('base64');
  }

  const memory = await db.userMemory.create({
    data: {
      userId: data.userId,
      memoryType: data.memoryType,
      content: data.content,
      summary: data.summary,
      embedding: embeddingStr,
      relevance: 1.0,
    },
  });

  return memory.id;
}

// ---------------------------------------------------------------------------
// 读取记忆
// ---------------------------------------------------------------------------

export async function getUserMemories(
  userId: string,
  options?: MemoryQueryOptions,
): Promise<UserMemoryData[]> {
  const limit = options?.limit ?? 10;
  const minRelevance = options?.minRelevance ?? 0;

  const memories = await db.userMemory.findMany({
    where: {
      userId,
      ...(options?.type && { memoryType: options.type }),
      relevance: { gte: minRelevance },
    },
    orderBy: [
      ...(options?.type === 'summary' ? [{ relevance: 'desc' as const }] : [{ createdAt: 'desc' as const }]),
    ],
    take: limit,
  });

  // 更新访问时间（异步，不阻塞返回）
  if (memories.length > 0) {
    db.userMemory.updateMany({
      where: { id: { in: memories.map(m => m.id) } },
      data: { lastAccessedAt: new Date() },
    }).catch(() => {});
  }

  return memories.map(m => ({
    id: m.id,
    userId: m.userId,
    memoryType: m.memoryType as MemoryType,
    content: m.content,
    summary: m.summary ?? undefined,
    embedding: m.embedding ?? undefined,
    relevance: m.relevance,
    lastAccessedAt: m.lastAccessedAt,
    createdAt: m.createdAt,
  }));
}

// ---------------------------------------------------------------------------
// 混合记忆视界（短期+长期）
// ---------------------------------------------------------------------------

export interface MemoryHorizon {
  /** 短期：最近N条episodic */
  shortTerm: UserMemoryData[];
  /** 长期：semantic + summary */
  longTerm: UserMemoryData[];
  /** 综合上下文文本（喂给Agent） */
  contextText: string;
}

export async function getMemoryHorizon(userId: string): Promise<MemoryHorizon> {
  const [shortTerm, semantic, summaries] = await Promise.all([
    getUserMemories(userId, { limit: 10, type: 'episodic' }),
    getUserMemories(userId, { limit: 5, type: 'semantic' }),
    getUserMemories(userId, { limit: 3, type: 'summary' }),
  ]);

  const longTerm = [...semantic, ...summaries];

  // 构建上下文文本
  const parts: string[] = [];

  if (summaries.length > 0) {
    parts.push('## 历史摘要');
    for (const s of summaries) {
      parts.push(`- ${s.summary ?? s.content}`);
    }
  }

  if (semantic.length > 0) {
    parts.push('\n## 已知事实');
    for (const s of semantic) {
      parts.push(`- ${s.content}`);
    }
  }

  if (shortTerm.length > 0) {
    parts.push('\n## 近期互动');
    for (const s of shortTerm.slice(0, 5)) {
      parts.push(`- ${s.summary ?? s.content.slice(0, 100)}`);
    }
  }

  return {
    shortTerm,
    longTerm,
    contextText: parts.join('\n'),
  };
}

// ---------------------------------------------------------------------------
// 记忆衰减（长期未访问的记忆相关性降低）
// ---------------------------------------------------------------------------

export async function decayMemories(userId: string): Promise<void> {
  const now = new Date();
  const memories = await db.userMemory.findMany({ where: { userId } });

  for (const m of memories) {
    const daysSinceAccess = (now.getTime() - m.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24);
    // 每天衰减0.02，最低0.1
    const newRelevance = Math.max(0.1, m.relevance - daysSinceAccess * 0.02);
    if (newRelevance !== m.relevance) {
      await db.userMemory.update({
        where: { id: m.id },
        data: { relevance: newRelevance },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 删除记忆
// ---------------------------------------------------------------------------

export async function deleteMemory(memoryId: string): Promise<void> {
  await db.userMemory.delete({ where: { id: memoryId } });
}

export async function clearUserMemories(userId: string): Promise<void> {
  await db.userMemory.deleteMany({ where: { userId } });
}
