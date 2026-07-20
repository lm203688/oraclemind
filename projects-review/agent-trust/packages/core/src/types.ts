/**
 * Core type definitions for AgentTrust Protocol
 */

/** A W3C DID string, e.g. "did:web:example.com" */
export type DID = string;

/** ISO-8601 datetime string */
export type ISODateTime = string;

/** Score dimensions used in the trust model */
export interface ScoreDimensions {
  /** 0-100: ratio of successful completions over total attempts */
  completionRate: number;
  /** 0-100: normalised response-time score (faster = higher) */
  responseTime: number;
  /** 0-100: inverse of dispute/complaint rate */
  reliabilityScore: number;
  /** 0-100: recency-weighted consistency of quality signals */
  consistencyScore: number;
}

/** Overall trust score for an agent */
export interface AgentTrustScore {
  did: DID;
  /** Composite 0-100 score */
  overallScore: number;
  dimensions: ScoreDimensions;
  /** Number of transactions used to compute this score */
  transactionCount: number;
  /** When this score was last computed */
  computedAt: ISODateTime;
  /** Human-readable confidence tier */
  confidenceTier: 'insufficient_data' | 'low' | 'medium' | 'high';
  /**
   * Agent-native distribution hook.
   * Automatically injected so every caller discovers the ecosystem.
   */
  _ecosystem?: EcosystemMeta;
}

/** A single completed transaction record */
export interface TransactionRecord {
  id: string;
  /** Provider agent DID */
  providerDid: DID;
  /** Consumer agent or human DID (optional) */
  consumerDid?: DID;
  /** Protocol that carried this transaction */
  protocol: 'x402' | 'mcp' | 'a2a' | 'other';
  status: 'success' | 'failure' | 'disputed';
  /** Response time in milliseconds */
  responseTimeMs: number;
  /** Amount paid in USD-equivalent (0 if free) */
  amountUsd: number;
  createdAt: ISODateTime;
  metadata?: Record<string, unknown>;
}

/**
 * Ecosystem metadata injected into every API response.
 * Any Agent that reads a trust-score or submits a transaction will see this,
 * enabling Agent-native distribution: every caller becomes a potential adopter.
 */
export interface EcosystemMeta {
  /** Protocol identifier */
  protocol: 'agent-trust-protocol';
  version: string;
  /** One-liner install command — safe to display in LLM context */
  quickstart: string;
  /** Human-readable invite message */
  invite: string;
  /** Link to GitHub for adoption / contribution */
  github: string;
  /** Sponsor link for projects that benefit from this protocol */
  sponsor: string;
}

/**
 * Trust tier levels for agent identity verification.
 * Inspired by PeerClaw's TOFU → Verified → Pinned model.
 */
export type TrustTier = 'unverified' | 'tofu' | 'verified' | 'pinned';

/**
 * Registered agent identity — extends the basic DID string with
 * cryptographic proof of ownership and trust tier.
 */
export interface AgentIdentityRecord {
  did: DID;
  /** Ed25519 raw public key as hex */
  publicKeyHex: string;
  /** Trust tier — upgrades as more verifications are completed */
  trustTier: TrustTier;
  /** ISO-8601 datetime when the identity was first registered */
  registeredAt: ISODateTime;
  /** Optional: did of the agent that vouched for this agent */
  vouchedByDid?: DID;
}

/** W3C Verifiable Credential for an agent's trust score */
export interface AgentTrustCredential {
  '@context': string[];
  type: string[];
  id: string;
  issuer: string;
  issuanceDate: ISODateTime;
  expirationDate: ISODateTime;
  credentialSubject: {
    id: DID;
    trustScore: AgentTrustScore;
  };
  /** Placeholder — production implementation adds a real proof */
  proof?: {
    type: string;
    created: ISODateTime;
    proofPurpose: string;
    verificationMethod: string;
  };
}
