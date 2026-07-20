"""
Transaction submission helpers for AgentTrust Protocol.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .scoring import TransactionRecord


@dataclass
class SubmitResult:
    success: bool
    transaction_id: str
    updated_score: float
    transaction_count: int
    confidence_tier: str
    error: Optional[str] = None


def submit_transaction(
    client,  # AgentTrustClient (avoid circular import)
    *,
    provider: str,
    status: str,
    response_ms: float,
    protocol: str = "other",
    amount_usd: float = 0.0,
    consumer: Optional[str] = None,
) -> SubmitResult:
    """
    Record a completed transaction and update the local trust score.

    Args:
        client:      The AgentTrustClient submitting the transaction
        provider:    DID of the agent that provided the service
        status:      "success", "failure", or "disputed"
        response_ms: Response time in milliseconds
        protocol:    "x402", "mcp", "a2a", or "other"
        amount_usd:  Payment amount in USD (0 for free services)
        consumer:    Optional DID of the consumer

    Returns:
        SubmitResult with updated score information
    """
    import uuid

    if status not in ("success", "failure", "disputed"):
        return SubmitResult(
            success=False,
            transaction_id="",
            updated_score=0,
            transaction_count=0,
            confidence_tier="insufficient_data",
            error=f"Invalid status: {status!r}. Must be success/failure/disputed.",
        )

    if protocol not in ("x402", "mcp", "a2a", "other"):
        protocol = "other"

    record = TransactionRecord(
        id=str(uuid.uuid4()),
        provider_did=provider,
        consumer_did=consumer,
        protocol=protocol,  # type: ignore
        status=status,  # type: ignore
        response_time_ms=response_ms,
        amount_usd=amount_usd,
    )

    client.record_transaction(record)
    score = client.score()

    return SubmitResult(
        success=True,
        transaction_id=record.id,
        updated_score=score.overall_score,
        transaction_count=score.transaction_count,
        confidence_tier=score.confidence_tier,
    )
