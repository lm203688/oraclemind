/**
 * Rate Limiting — IP-based usage tracking
 *
 * Rules:
 * - Free: 5 L1 predictions per day per IP
 * - IP total: 15 free predictions (including 1 L3 deep)
 * - What-If: 1 free per IP, unlimited for subscribers
 */

import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PredictionLayer = 'L1' | 'L2' | 'L3';
export type SubscriptionTier = 'free' | 'premium' | 'deep';

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remaining: {
    dailyL1: number;
    ipTotal: number;
    ipDeep: number;
    whatIf: number;
  };
  tier: SubscriptionTier;
}

// ---------------------------------------------------------------------------
// Get client IP
// ---------------------------------------------------------------------------

export function getClientIP(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// Check rate limit
// ---------------------------------------------------------------------------

const DAILY_L1_LIMIT = 5;
const IP_TOTAL_LIMIT = 15;
const IP_DEEP_LIMIT = 1;
const IP_WHATIF_LIMIT = 1;

export async function checkRateLimit(
  ip: string,
  userId: string,
  layer: PredictionLayer,
  isWhatIf: boolean = false,
): Promise<RateLimitResult> {
  // Get user's subscription tier
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  const tier = (user?.subscriptionTier as SubscriptionTier) || 'free';

  // Premium/Deep subscribers: unlimited L1, unlimited What-If
  if (tier === 'premium' || tier === 'deep') {
    if (layer === 'L1' || isWhatIf) {
      return {
        allowed: true,
        remaining: { dailyL1: Infinity, ipTotal: Infinity, ipDeep: 1, whatIf: Infinity },
        tier,
      };
    }
  }

  // Count today's L1 predictions by this IP
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPredictions = await db.prediction.count({
    where: {
      ip,
      layer: 'L1',
      createdAt: { gte: today },
    },
  });

  // Count total predictions by this IP
  const totalPredictions = await db.prediction.count({
    where: { ip },
  });

  // Count deep predictions by this IP
  const deepPredictions = await db.prediction.count({
    where: { ip, layer: 'L3' },
  });

  // Count What-If by this IP
  const whatIfCount = await db.whatIfBranch.count({
    where: { ip },
  });

  const remaining = {
    dailyL1: Math.max(0, DAILY_L1_LIMIT - todayPredictions),
    ipTotal: Math.max(0, IP_TOTAL_LIMIT - totalPredictions),
    ipDeep: Math.max(0, IP_DEEP_LIMIT - deepPredictions),
    whatIf: Math.max(0, IP_WHATIF_LIMIT - whatIfCount),
  };

  // Check limits
  if (isWhatIf) {
    if (tier !== 'premium' && tier !== 'deep' && remaining.whatIf <= 0) {
      return { allowed: false, reason: 'What-If limit reached. Subscribe for unlimited.', remaining, tier };
    }
  }

  if (layer === 'L1') {
    if (remaining.dailyL1 <= 0) {
      return { allowed: false, reason: 'Daily free limit reached. Subscribe for unlimited.', remaining, tier };
    }
    if (remaining.ipTotal <= 0) {
      return { allowed: false, reason: 'IP prediction limit reached. Subscribe for unlimited.', remaining, tier };
    }
  }

  if (layer === 'L3') {
    if (tier !== 'deep' && remaining.ipDeep <= 0) {
      return { allowed: false, reason: 'Deep analysis limit reached. Purchase for more.', remaining, tier };
    }
  }

  return { allowed: true, remaining, tier };
}

// ---------------------------------------------------------------------------
// Record prediction
// ---------------------------------------------------------------------------

export async function recordPrediction(
  ip: string,
  userId: string,
  layer: PredictionLayer,
  simulationId: string,
): Promise<void> {
  await db.prediction.create({
    data: {
      ip,
      userId,
      layer,
      simulationId,
    },
  });
}

// ---------------------------------------------------------------------------
// Get free count for UI
// ---------------------------------------------------------------------------

export async function getFreeCount(ip: string, userId: string): Promise<{ used: number; total: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'deep') {
    return { used: 0, total: Infinity };
  }

  const todayCount = await db.prediction.count({
    where: { ip, layer: 'L1', createdAt: { gte: today } },
  });

  return { used: todayCount, total: DAILY_L1_LIMIT };
}
