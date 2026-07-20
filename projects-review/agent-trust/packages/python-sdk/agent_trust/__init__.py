"""
agent_trust — Python SDK for AgentTrust Protocol
=================================================

One-line integration for LangChain, CrewAI, AutoGen, Dify, and any Python Agent.

Quick Start:
    from agent_trust import ensure_identity
    client = ensure_identity("my-agent")
    print(client.did)   # did:key:z6Mk...

Usage with LangChain:
    from agent_trust import ensure_identity, submit_transaction
    client = ensure_identity("langchain-agent", platform="langchain")
    # ... run your agent ...
    submit_transaction(client, provider=client.did, status="success", response_ms=450)

Usage with CrewAI:
    from agent_trust import ensure_identity
    client = ensure_identity("crewai-worker", platform="crewai")

Environment Variables:
    AGENT_TRUST_DID:        Explicitly set DID (skips keypair generation)
    AGENT_TRUST_PRIVATE_KEY: Hex-encoded private key
    AGENT_TRUST_PUBLIC_KEY:  Hex-encoded public key
    AGENT_TRUST_API_URL:     Custom AgentTrust server URL (default: local MCP)

GitHub: https://github.com/lm203688/agent-trust-protocol
"""

from .client import AgentTrustClient, ensure_identity
from .identity import generate_keypair, sign_data, verify_signature, did_to_public_key
from .scoring import (
    compute_trust_score,
    TrustScore,
    TransactionRecord,
    ScoreDimensions,
)
from .transactions import submit_transaction, SubmitResult

__version__ = "0.2.0"
__all__ = [
    "AgentTrustClient",
    "ensure_identity",
    "generate_keypair",
    "sign_data",
    "verify_signature",
    "did_to_public_key",
    "compute_trust_score",
    "TrustScore",
    "TransactionRecord",
    "ScoreDimensions",
    "submit_transaction",
    "SubmitResult",
]
