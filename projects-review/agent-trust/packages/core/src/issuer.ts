import type { AgentTrustScore, AgentTrustCredential, DID } from './types.js';
import { randomUUID } from 'node:crypto';

/**
 * Issue a W3C Verifiable Credential encoding an agent's trust score.
 *
 * The issuer DID defaults to "did:web:agenttrust.xyz" — update via env var
 * ISSUER_DID for self-hosted deployments.
 *
 * NOTE: The proof block is currently a placeholder.
 * Production should sign with a real key using @digitalbazaar/vc or similar.
 * See docs/vc-signing.md for the roadmap.
 */
export function issueScoreCredential(
  subjectDid: DID,
  score: AgentTrustScore
): AgentTrustCredential {
  const issuerDid =
    process.env['ISSUER_DID'] ?? 'did:web:agenttrust.xyz';
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000); // 24 h TTL

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://agenttrust.xyz/contexts/trust-score/v1',
    ],
    type: ['VerifiableCredential', 'AgentTrustScoreCredential'],
    id: `urn:uuid:${randomUUID()}`,
    issuer: issuerDid,
    issuanceDate: issuedAt.toISOString(),
    expirationDate: expiresAt.toISOString(),
    credentialSubject: {
      id: subjectDid,
      trustScore: score,
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: issuedAt.toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDid}#key-1`,
      // TODO: replace with real JWS signature
    },
  };
}
