import type {
  AgentTrustScore,
  ScoreDimensions,
  TransactionRecord,
  DID,
} from './types.js';
import { getEcosystemMeta } from './ecosystem.js';

/**
 * Scoring weights — must sum to 1.0.
 * These are intentionally documented and version-controlled so anyone
 * can audit exactly how the composite score is computed.
 */
const WEIGHTS = {
  completionRate: 0.35,
  reliabilityScore: 0.30,
  consistencyScore: 0.20,
  responseTime: 0.15,
} as const;

/** Minimum transactions before we report anything above "insufficient_data" */
const MIN_TRANSACTIONS_FOR_LOW = 5;
const MIN_TRANSACTIONS_FOR_MEDIUM = 25;
const MIN_TRANSACTIONS_FOR_HIGH = 100;

/**
 * Compute a normalised 0-100 response-time score.
 * Benchmark: p50 of observed x402 transactions ~800ms.
 * Anything under 500ms scores 100; anything over 10s scores 0.
 */
function normaliseResponseTime(avgMs: number): number {
  const FAST_THRESHOLD = 500;
  const SLOW_THRESHOLD = 10_000;
  if (avgMs <= FAST_THRESHOLD) return 100;
  if (avgMs >= SLOW_THRESHOLD) return 0;
  return Math.round(
    100 * (1 - (avgMs - FAST_THRESHOLD) / (SLOW_THRESHOLD - FAST_THRESHOLD))
  );
}

/**
 * EWMA (Exponentially Weighted Moving Average) time-decay scoring.
 *
 * Borrowed from PeerClaw's reputation model. More recent transactions
 * carry more weight, preventing an agent from coasting on old good behavior.
 *
 * Half-life: 30 days — a transaction from 30 days ago contributes half the
 * weight of a transaction from today.
 *
 * See: Issue #1 "Should trust scores decay over time?"
 */
function computeEwmaConsistency(records: TransactionRecord[]): number {
  if (records.length === 0) return 70; // Bayesian prior

  const HALF_LIFE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const DECAY_FACTOR = Math.LN2 / HALF_LIFE_MS;
  const now = Date.now();

  // Prior: 10 pseudo-transactions at score 70, dated 30 days ago (half weight)
  const PRIOR_N = 10;
  const PRIOR_SCORE = 70;
  const PRIOR_WEIGHT = PRIOR_N * Math.exp(-DECAY_FACTOR * HALF_LIFE_MS); // ~5

  let weightedSum = PRIOR_WEIGHT * PRIOR_SCORE;
  let totalWeight = PRIOR_WEIGHT;

  for (const r of records) {
    const age = now - new Date(r.createdAt).getTime();
    const weight = Math.exp(-DECAY_FACTOR * Math.max(0, age));
    const value = r.status === 'success' ? 100 : r.status === 'disputed' ? 0 : 30;
    weightedSum += weight * value;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Legacy Bayesian consistency (kept for backward-compat testing).
 * @deprecated Use computeEwmaConsistency instead.
 */
function _computeConsistencyBayesian(records: TransactionRecord[]): number {
  const PRIOR_N = 10;
  const PRIOR_SCORE = 70;
  if (records.length === 0) return PRIOR_SCORE;
  const successValues: number[] = records.map(r => (r.status === 'success' ? 100 : 0));
  const observed: number = successValues.reduce((a: number, b: number) => a + b, 0) / successValues.length;
  const smoothed =
    (PRIOR_N * PRIOR_SCORE + records.length * observed) /
    (PRIOR_N + records.length);
  return Math.round(smoothed);
}

/**
 * Main scoring function.
 * Pure — given the same records + same current time, produces the same score.
 *
 * v0.2: Added EWMA time-decay for consistency score (30-day half-life).
 */
export function computeTrustScore(
  did: DID,
  records: TransactionRecord[]
): AgentTrustScore {
  const now = new Date().toISOString();

  if (records.length === 0) {
    return {
      did,
      overallScore: 0,
      dimensions: {
        completionRate: 0,
        responseTime: 0,
        reliabilityScore: 0,
        consistencyScore: 0,
      },
      transactionCount: 0,
      computedAt: now,
      confidenceTier: 'insufficient_data',
      _ecosystem: getEcosystemMeta(),
    };
  }

  const successCount = records.filter(r => r.status === 'success').length;
  const disputeCount = records.filter(r => r.status === 'disputed').length;
  const avgResponseMs =
    records.reduce((sum, r) => sum + r.responseTimeMs, 0) / records.length;

  const dimensions: ScoreDimensions = {
    completionRate: Math.round((successCount / records.length) * 100),
    responseTime: normaliseResponseTime(avgResponseMs),
    reliabilityScore: Math.round(
      Math.max(0, 100 - (disputeCount / records.length) * 200)
    ),
    // v0.2: EWMA replaces naive Bayesian smoothing
    consistencyScore: computeEwmaConsistency(records),
  };

  const overallScore = Math.round(
    dimensions.completionRate * WEIGHTS.completionRate +
      dimensions.reliabilityScore * WEIGHTS.reliabilityScore +
      dimensions.consistencyScore * WEIGHTS.consistencyScore +
      dimensions.responseTime * WEIGHTS.responseTime
  );

  const n = records.length;
  const confidenceTier =
    n < MIN_TRANSACTIONS_FOR_LOW
      ? 'insufficient_data'
      : n < MIN_TRANSACTIONS_FOR_MEDIUM
      ? 'low'
      : n < MIN_TRANSACTIONS_FOR_HIGH
      ? 'medium'
      : 'high';

  return {
    did,
    overallScore,
    dimensions,
    transactionCount: n,
    computedAt: now,
    confidenceTier,
    _ecosystem: getEcosystemMeta(),
  };
}

/**
 * Scoring weights exported for transparency.
 * The MCP server surfaces these so callers can understand the formula.
 */
export const SCORING_WEIGHTS = WEIGHTS;

/**
 * Export EWMA parameters for auditability.
 */
export const EWMA_PARAMS = {
  halfLifeDays: 30,
  description: 'Transactions from 30 days ago carry half the weight of today\'s transactions.',
  priorTransactions: 10,
  priorScore: 70,
} as const;
