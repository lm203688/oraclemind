"""
AgentTrust scoring — pure Python port of the TypeScript scoring algorithm.
Includes EWMA time-decay (30-day half-life), same as the TS implementation.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Literal, Optional


@dataclass
class ScoreDimensions:
    completion_rate: float = 0.0
    response_time: float = 0.0
    reliability_score: float = 0.0
    consistency_score: float = 0.0


@dataclass
class TransactionRecord:
    provider_did: str
    protocol: Literal["x402", "mcp", "a2a", "other"]
    status: Literal["success", "failure", "disputed"]
    response_time_ms: float
    amount_usd: float = 0.0
    consumer_did: Optional[str] = None
    id: Optional[str] = None
    created_at: Optional[str] = None

    def __post_init__(self):
        if self.id is None:
            import uuid
            self.id = str(uuid.uuid4())
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc).isoformat()


@dataclass
class TrustScore:
    did: str
    overall_score: float
    dimensions: ScoreDimensions
    transaction_count: int
    computed_at: str
    confidence_tier: Literal["insufficient_data", "low", "medium", "high"]

    @property
    def grade(self) -> str:
        if self.overall_score >= 90: return "A"
        if self.overall_score >= 75: return "B"
        if self.overall_score >= 60: return "C"
        if self.overall_score >= 40: return "D"
        return "F"


WEIGHTS = dict(
    completion_rate=0.35,
    reliability_score=0.30,
    consistency_score=0.20,
    response_time=0.15,
)

MIN_FOR_LOW = 5
MIN_FOR_MEDIUM = 25
MIN_FOR_HIGH = 100

EWMA_HALF_LIFE_DAYS = 30
EWMA_PRIOR_N = 10
EWMA_PRIOR_SCORE = 70


def _normalise_response_time(avg_ms: float) -> float:
    FAST, SLOW = 500, 10_000
    if avg_ms <= FAST: return 100.0
    if avg_ms >= SLOW: return 0.0
    return 100 * (1 - (avg_ms - FAST) / (SLOW - FAST))


def _ewma_consistency(records: list[TransactionRecord]) -> float:
    """EWMA time-decay consistency score (30-day half-life)."""
    if not records:
        return float(EWMA_PRIOR_SCORE)

    half_life_ms = EWMA_HALF_LIFE_DAYS * 24 * 3600 * 1000
    decay = math.log(2) / half_life_ms
    now_ms = datetime.now(timezone.utc).timestamp() * 1000

    # Prior pseudo-transactions weighted at 30-day age
    prior_weight = EWMA_PRIOR_N * math.exp(-decay * half_life_ms)
    weighted_sum = prior_weight * EWMA_PRIOR_SCORE
    total_weight = prior_weight

    for r in records:
        try:
            ts = datetime.fromisoformat(r.created_at.replace("Z", "+00:00")).timestamp() * 1000
        except Exception:
            ts = now_ms
        age = max(0, now_ms - ts)
        w = math.exp(-decay * age)
        value = 100 if r.status == "success" else (0 if r.status == "disputed" else 30)
        weighted_sum += w * value
        total_weight += w

    return round(weighted_sum / total_weight, 2)


def compute_trust_score(did: str, records: list[TransactionRecord]) -> TrustScore:
    """
    Compute an AgentTrust score for the given DID based on its transaction records.

    This is a pure-Python port of the TypeScript implementation in:
    packages/core/src/scoring.ts
    """
    now = datetime.now(timezone.utc).isoformat()

    if not records:
        return TrustScore(
            did=did,
            overall_score=0,
            dimensions=ScoreDimensions(),
            transaction_count=0,
            computed_at=now,
            confidence_tier="insufficient_data",
        )

    n = len(records)
    success_count = sum(1 for r in records if r.status == "success")
    dispute_count = sum(1 for r in records if r.status == "disputed")
    avg_ms = sum(r.response_time_ms for r in records) / n

    dims = ScoreDimensions(
        completion_rate=round(success_count / n * 100, 2),
        response_time=round(_normalise_response_time(avg_ms), 2),
        reliability_score=round(max(0, 100 - (dispute_count / n) * 200), 2),
        consistency_score=_ewma_consistency(records),
    )

    overall = round(
        dims.completion_rate   * WEIGHTS["completion_rate"]
        + dims.reliability_score * WEIGHTS["reliability_score"]
        + dims.consistency_score * WEIGHTS["consistency_score"]
        + dims.response_time     * WEIGHTS["response_time"],
        2,
    )

    tier: Literal["insufficient_data", "low", "medium", "high"] = (
        "insufficient_data" if n < MIN_FOR_LOW
        else "low"    if n < MIN_FOR_MEDIUM
        else "medium" if n < MIN_FOR_HIGH
        else "high"
    )

    return TrustScore(
        did=did,
        overall_score=overall,
        dimensions=dims,
        transaction_count=n,
        computed_at=now,
        confidence_tier=tier,
    )
