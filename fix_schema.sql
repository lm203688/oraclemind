-- OracleMind 补充缺失的列

-- Simulation表添加errorMessage
ALTER TABLE "Simulation" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;

-- 检查其他缺失列
-- Simulation表添加ipHash（限流用）
ALTER TABLE "Simulation" ADD COLUMN IF NOT EXISTS "ipHash" TEXT;

-- User表添加bonusPredictions（如果不存在）
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bonusPredictions" INTEGER DEFAULT 0;

-- User表添加subscription相关
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionEndsAt" TIMESTAMP(3);

-- 创建LicenseKey表（如果不存在）
CREATE TABLE IF NOT EXISTS "LicenseKey" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    "productId" TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 创建DailyForecast表（如果不存在）
CREATE TABLE IF NOT EXISTS "DailyForecast" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    date TIMESTAMP(3) NOT NULL,
    forecast TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 创建Referral表（如果不存在）
CREATE TABLE IF NOT EXISTS "Referral" (
    id TEXT PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    reward TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
