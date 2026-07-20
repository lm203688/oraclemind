-- OracleMind Supabase初始化SQL
-- 在Supabase Dashboard → SQL Editor → New Query → 粘贴执行

-- 1. Users
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    gender TEXT,
    "birthYear" INTEGER,
    "birthMonth" INTEGER,
    "birthDay" INTEGER,
    "birthHour" INTEGER,
    "birthMinute" INTEGER,
    "birthPlace" TEXT,
    "subscriptionTier" TEXT DEFAULT 'free',
    "subscriptionStatus" TEXT,
    "subscriptionEndsAt" TIMESTAMP(3),
    "bonusPredictions" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 2. LifeEvent
CREATE TABLE IF NOT EXISTS "LifeEvent" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    "happenedAt" TIMESTAMP(3),
    "emotionalValence" DOUBLE PRECISION DEFAULT 0,
    "relatedPersons" TEXT,
    metadata TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "LifeEvent_userId_idx" ON "LifeEvent"("userId");
CREATE INDEX IF NOT EXISTS "LifeEvent_type_idx" ON "LifeEvent"(type);

-- 3. GraphNode
CREATE TABLE IF NOT EXISTS "GraphNode" (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    "simulationId" TEXT,
    "nodeType" TEXT NOT NULL,
    name TEXT NOT NULL,
    attributes TEXT,
    centrality DOUBLE PRECISION DEFAULT 0,
    community INTEGER
);

-- 4. GraphEdge
CREATE TABLE IF NOT EXISTS "GraphEdge" (
    id TEXT PRIMARY KEY,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    weight DOUBLE PRECISION DEFAULT 0
);

-- 5. Simulation
CREATE TABLE IF NOT EXISTS "Simulation" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    "seedInput" TEXT NOT NULL,
    "graphSnapshot" TEXT,
    "baziSnapshot" TEXT,
    "agentCount" INTEGER DEFAULT 10,
    rounds INTEGER,
    status TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- 6. AgentTrace
CREATE TABLE IF NOT EXISTS "AgentTrace" (
    id TEXT PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agentCategory" TEXT,
    round INTEGER,
    output TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("simulationId") REFERENCES "Simulation"(id) ON DELETE CASCADE
);

-- 7. ScenarioOutcome
CREATE TABLE IF NOT EXISTS "ScenarioOutcome" (
    id TEXT PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    label TEXT NOT NULL,
    probability DOUBLE PRECISION,
    reasoning TEXT,
    FOREIGN KEY ("simulationId") REFERENCES "Simulation"(id) ON DELETE CASCADE
);

-- 8. WhatIfBranch
CREATE TABLE IF NOT EXISTS "WhatIfBranch" (
    id TEXT PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "hypotheticalChange" TEXT NOT NULL,
    outcome TEXT,
    FOREIGN KEY ("simulationId") REFERENCES "Simulation"(id) ON DELETE CASCADE
);

-- 9. UserMemory
CREATE TABLE IF NOT EXISTS "UserMemory" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    importance DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- 10. VerificationFeedback
CREATE TABLE IF NOT EXISTS "VerificationFeedback" (
    id TEXT PRIMARY KEY,
    "userId" TEXT,
    "simulationId" TEXT,
    accuracy INTEGER,
    comment TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 11. PublicAccuracy
CREATE TABLE IF NOT EXISTS "PublicAccuracy" (
    id TEXT PRIMARY KEY,
    "totalPredictions" INTEGER DEFAULT 0,
    "verifiedCount" INTEGER DEFAULT 0,
    "accurateCount" INTEGER DEFAULT 0,
    "accuracyRate" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 12. Prediction
CREATE TABLE IF NOT EXISTS "Prediction" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    question TEXT NOT NULL,
    prediction TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- 13. DailyForecast
CREATE TABLE IF NOT EXISTS "DailyForecast" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    date TIMESTAMP(3) NOT NULL,
    forecast TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "DailyForecast_userId_date_key" ON "DailyForecast"("userId", date);
CREATE INDEX IF NOT EXISTS "DailyForecast_userId_idx" ON "DailyForecast"("userId");

-- 14. Referral
CREATE TABLE IF NOT EXISTS "Referral" (
    id TEXT PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    reward TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("referrerId") REFERENCES "User"(id),
    FOREIGN KEY ("referredId") REFERENCES "User"(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_referrerId_referredId_key" ON "Referral"("referrerId", "referredId");
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");

-- 15. LicenseKey
CREATE TABLE IF NOT EXISTS "LicenseKey" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    "productId" TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "LicenseKey_userId_idx" ON "LicenseKey"("userId");
