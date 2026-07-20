# Scoring Algorithm

> This document is the authoritative specification for how AgentTrust computes trust scores.  
> Any code change to `packages/core/src/scoring.ts` must be reflected here.

## Overview

An agent's trust score is a single number from **0 to 100**, computed as a weighted average of four dimension scores. The algorithm is intentionally simple and auditable — no black-box ML.

---

## Dimensions

### 1. Completion Rate (weight: 35%)

Measures how reliably an agent delivers successful outcomes.

```
completionRate = (successfulTransactions / totalTransactions) × 100
```

- `success`: provider responded with HTTP 2xx and no dispute raised
- `failure`: HTTP error or timeout
- `disputed`: consumer raised a dispute after payment

---

### 2. Reliability Score (weight: 30%)

Measures freedom from disputes. Disputes are weighted 2× because they indicate active harm, not just failure.

```
reliabilityScore = max(0, 100 − (disputedTransactions / totalTransactions × 200))
```

An agent with a 50% dispute rate scores 0. An agent with 0 disputes scores 100.

---

### 3. Consistency Score (weight: 20%)

A **Bayesian-smoothed** success rate that prevents new agents from appearing artificially trustworthy after a handful of lucky transactions.

**Prior**: 10 pseudo-transactions at a score of 70 (slightly below average).

```
observedRate = (successCount / totalCount) × 100
consistencyScore = (10 × 70 + n × observedRate) / (10 + n)
```

With only 1 real transaction, the score stays close to 70 regardless of outcome.  
With 100+ real transactions, the prior becomes negligible.

---

### 4. Response Time Score (weight: 15%)

Converts average response latency to a 0-100 score using a linear mapping.

| Avg latency | Score |
|-------------|-------|
| ≤ 500ms | 100 |
| 1,000ms | 93 |
| 3,000ms | 73 |
| 5,000ms | 52 |
| 8,000ms | 21 |
| ≥ 10,000ms | 0 |

**Benchmark**: median x402 transaction latency observed at ~800ms (June 2026 data).

---

## Composite Score

```
overallScore = completionRate    × 0.35
             + reliabilityScore  × 0.30
             + consistencyScore  × 0.20
             + responseTime      × 0.15
```

Result is rounded to the nearest integer.

---

## Confidence Tiers

The score is only meaningful when backed by sufficient data.

| Tier | Transaction count | Meaning |
|------|-------------------|---------|
| `insufficient_data` | < 5 | Do not rely on this score |
| `low` | 5–24 | Treat as indicative only |
| `medium` | 25–99 | Reasonably reliable |
| `high` | ≥ 100 | High confidence |

Callers should always check `confidenceTier` before acting on a score.

---

## Grade Mapping

| Score | Grade |
|-------|-------|
| 90–100 | A |
| 75–89 | B |
| 60–74 | C |
| 40–59 | D |
| 0–39 | F |

---

## Change History

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-06-08 | Initial algorithm published | v0.1.0 launch |

---

## Proposing Changes

Algorithm changes must:
1. Update this document
2. Update `packages/core/src/scoring.ts`
3. Update or add tests in `packages/core/src/__tests__/scoring.test.ts`
4. Open a GitHub issue explaining the motivation **before** submitting a PR

This ensures the algorithm remains transparent and community-reviewed.
