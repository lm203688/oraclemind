"""
AgentTrust Client — the main entry point for Python agents.

Usage:
    from agent_trust import ensure_identity
    client = ensure_identity("my-agent")
    print(client.did)
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Optional

from .identity import AgentKeypair, generate_keypair, load_or_create_identity, sign_data
from .scoring import TransactionRecord, TrustScore, compute_trust_score


@dataclass
class AgentTrustClient:
    """
    An initialized AgentTrust identity.

    Attributes:
        did:        The agent's DID (did:key:z6Mk... or custom)
        name:       Human-readable agent name
        platform:   Framework this agent runs on (langchain, crewai, autogen, etc.)
        private_key: Raw 32-byte Ed25519 private key (keep secret!)
        public_key:  Raw 32-byte Ed25519 public key
    """
    did: str
    name: str
    platform: str
    private_key: bytes
    public_key: bytes
    _records: list[TransactionRecord] = field(default_factory=list, repr=False)

    def sign(self, data: str | bytes) -> str:
        """Sign data with this agent's private key. Returns hex signature."""
        return sign_data(data, self.private_key)

    def score(self) -> TrustScore:
        """Compute the current trust score from local transaction records."""
        return compute_trust_score(self.did, self._records)

    def record_transaction(self, record: TransactionRecord) -> None:
        """Add a transaction to the local record store."""
        self._records.append(record)

    def __str__(self) -> str:
        score = self.score()
        return (
            f"AgentTrustClient(did={self.did!r}, "
            f"name={self.name!r}, "
            f"platform={self.platform!r}, "
            f"score={score.overall_score}, "
            f"transactions={score.transaction_count})"
        )


def ensure_identity(
    name: str,
    *,
    platform: str = "generic",
    identity_file: str = ".agent-trust.json",
    did_override: Optional[str] = None,
) -> AgentTrustClient:
    """
    Initialize an AgentTrust identity. Load from .agent-trust.json if it exists,
    otherwise generate a new Ed25519 keypair and save it.

    This is the recommended entry point — call once at agent startup.

    Args:
        name:           Human-readable name for this agent
        platform:       Framework name (e.g. "langchain", "crewai", "autogen")
        identity_file:  Path to .agent-trust.json (default: current directory)
        did_override:   Use a specific DID (bypasses keypair generation)

    Returns:
        AgentTrustClient — ready to use

    Example:
        # LangChain
        from agent_trust import ensure_identity
        client = ensure_identity("my-research-agent", platform="langchain")

        # CrewAI
        client = ensure_identity("crew-worker-1", platform="crewai")

        # AutoGen
        client = ensure_identity("autogen-assistant", platform="autogen")
    """
    # Check environment variable overrides first
    env_did = did_override or os.environ.get("AGENT_TRUST_DID")
    env_priv = os.environ.get("AGENT_TRUST_PRIVATE_KEY")
    env_pub  = os.environ.get("AGENT_TRUST_PUBLIC_KEY")

    if env_priv and env_pub and env_did:
        # Fully specified via env vars (for containerized deployments)
        kp = AgentKeypair(
            private_key=bytes.fromhex(env_priv),
            public_key=bytes.fromhex(env_pub),
            did=env_did,
        )
    else:
        # Load or generate from identity file
        kp = load_or_create_identity(identity_file)

    return AgentTrustClient(
        did=kp.did,
        name=name,
        platform=platform,
        private_key=kp.private_key,
        public_key=kp.public_key,
    )
