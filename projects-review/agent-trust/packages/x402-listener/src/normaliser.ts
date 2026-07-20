import type { TransactionRecord } from '@agent-trust/core';

/**
 * Raw x402 payment event as emitted by compliant x402 gateways.
 * Spec reference: https://x402.org/protocol
 *
 * Real gateways post these to a webhook URL you configure.
 * This interface covers the fields relevant for trust scoring.
 */
export interface X402PaymentEvent {
  /** Unique payment ID from the gateway */
  paymentId: string;
  /** Unix timestamp (seconds) */
  timestamp: number;
  /** Provider agent identifier — may be DID or plain URL */
  provider: string;
  /** Consumer identifier (optional) */
  consumer?: string;
  /** Payment amount in USDC micro-units (divide by 1_000_000 for USD) */
  amountMicro: number;
  /** HTTP status returned by the provider after payment */
  providerHttpStatus: number;
  /** Latency in ms from payment to provider response */
  latencyMs: number;
  /** Optional dispute flag raised by the consumer */
  disputed?: boolean;
}

/**
 * Normalise an x402 payment event into an AgentTrust TransactionRecord.
 *
 * DID normalisation:
 *   - If provider looks like a DID (starts with "did:"), use as-is.
 *   - Otherwise wrap in did:web: e.g. "api.example.com" → "did:web:api.example.com"
 */
export function normaliseX402Event(event: X402PaymentEvent): TransactionRecord {
  const providerDid = event.provider.startsWith('did:')
    ? event.provider
    : `did:web:${event.provider.replace(/^https?:\/\//, '').split('/')[0]}`;

  const consumerDid =
    event.consumer
      ? event.consumer.startsWith('did:')
        ? event.consumer
        : `did:web:${event.consumer.replace(/^https?:\/\//, '').split('/')[0]}`
      : undefined;

  // Determine outcome from HTTP status and dispute flag
  let status: TransactionRecord['status'];
  if (event.disputed) {
    status = 'disputed';
  } else if (event.providerHttpStatus >= 200 && event.providerHttpStatus < 300) {
    status = 'success';
  } else {
    status = 'failure';
  }

  return {
    id: event.paymentId,
    providerDid,
    consumerDid,
    protocol: 'x402',
    status,
    responseTimeMs: event.latencyMs,
    amountUsd: event.amountMicro / 1_000_000,
    createdAt: new Date(event.timestamp * 1000).toISOString(),
    metadata: {
      providerHttpStatus: event.providerHttpStatus,
      raw: event,
    },
  };
}
