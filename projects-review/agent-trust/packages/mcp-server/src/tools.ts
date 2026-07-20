/**
 * Re-export core utilities for use within mcp-server,
 * and add demo seed data + identity registry so the server is immediately useful.
 */
import {
  computeTrustScore,
  issueScoreCredential,
  transactionStore,
  SCORING_WEIGHTS,
  EWMA_PARAMS,
  getEcosystemMeta,
  verifySignatureByDid,
} from 'agent-trust-core';
import type { AgentIdentityRecord, TrustTier } from 'agent-trust-core';
import { randomUUID } from 'node:crypto';

export {
  computeTrustScore,
  issueScoreCredential,
  transactionStore,
  SCORING_WEIGHTS,
  EWMA_PARAMS,
  getEcosystemMeta,
  verifySignatureByDid,
};

// ── Identity Registry (in-memory) ────────────────────────────────────────────

const identityRegistry = new Map<string, AgentIdentityRecord>();
const vouchRecords: Array<{ voucherDid: string; subjectDid: string; createdAt: string }> = [];

export const agentRegistry = {
  register(did: string, publicKeyHex: string): AgentIdentityRecord {
    const existing = identityRegistry.get(did);
    if (existing) return existing;
    const record: AgentIdentityRecord = {
      did,
      publicKeyHex,
      trustTier: 'tofu',
      registeredAt: new Date().toISOString(),
    };
    identityRegistry.set(did, record);
    return record;
  },

  get(did: string): AgentIdentityRecord | undefined {
    return identityRegistry.get(did);
  },

  upgrade(did: string, tier: TrustTier, vouchedBy?: string): boolean {
    const record = identityRegistry.get(did);
    if (!record) return false;
    record.trustTier = tier;
    if (vouchedBy) record.vouchedByDid = vouchedBy;
    identityRegistry.set(did, record);
    return true;
  },

  vouch(voucherDid: string, subjectDid: string): boolean {
    const voucher = identityRegistry.get(voucherDid);
    const subject = identityRegistry.get(subjectDid);
    if (!voucher || !subject) return false;
    // Vouching upgrades subject if voucher is at least 'verified'
    if (voucher.trustTier === 'verified' || voucher.trustTier === 'pinned') {
      subject.trustTier = 'verified';
      subject.vouchedByDid = voucherDid;
      identityRegistry.set(subjectDid, subject);
    }
    vouchRecords.push({ voucherDid, subjectDid, createdAt: new Date().toISOString() });
    return true;
  },

  getTrustPath(did: string): string[] {
    const path: string[] = [did];
    let current = identityRegistry.get(did);
    const visited = new Set<string>([did]);
    while (current?.vouchedByDid && !visited.has(current.vouchedByDid)) {
      path.push(current.vouchedByDid);
      visited.add(current.vouchedByDid);
      current = identityRegistry.get(current.vouchedByDid);
    }
    return path;
  },

  allDids(): string[] {
    return Array.from(identityRegistry.keys());
  },

  revoke(did: string): boolean {
    return identityRegistry.delete(did);
  },

  stats() {
    const tiers = { unverified: 0, tofu: 0, verified: 0, pinned: 0 };
    for (const r of identityRegistry.values()) tiers[r.trustTier]++;
    return { total: identityRegistry.size, tiers, vouchCount: vouchRecords.length };
  },
};

/**
 * Seed demo data representing three fictional agents with varying track records.
 * Also registers their identities so the 5 new tools work out of the box.
 */
export function seedDemoData(): void {
  if (transactionStore.stats().transactionCount > 0) return; // already seeded

  const now = Date.now();
  const msPerDay = 86_400_000;

  // Register demo agents with fake (but structurally valid) public keys
  agentRegistry.register(
    'did:web:alpha-agent.example.com',
    'aabbccdd' + '0'.repeat(56) // fake hex pubkey for demo
  );
  agentRegistry.register(
    'did:web:beta-agent.example.com',
    '11223344' + '0'.repeat(56)
  );
  agentRegistry.register(
    'did:web:gamma-agent.example.com',
    '55667788' + '0'.repeat(56)
  );

  // Upgrade alpha to 'pinned' (highest trust)
  agentRegistry.upgrade('did:web:alpha-agent.example.com', 'pinned');
  // Vouch for beta
  agentRegistry.upgrade('did:web:beta-agent.example.com', 'verified');

  // High-trust agent — 150 transactions, mostly successful
  for (let i = 0; i < 150; i++) {
    transactionStore.add({
      id: `demo-alpha-${i}`,
      providerDid: 'did:web:alpha-agent.example.com',
      protocol: 'x402',
      status: i % 20 === 0 ? 'failure' : 'success',
      responseTimeMs: 300 + Math.floor(Math.random() * 400),
      amountUsd: 0.05,
      createdAt: new Date(now - (150 - i) * msPerDay * 0.1).toISOString(),
    });
  }

  // Medium-trust agent — 30 transactions, some disputes
  for (let i = 0; i < 30; i++) {
    transactionStore.add({
      id: `demo-beta-${i}`,
      providerDid: 'did:web:beta-agent.example.com',
      protocol: 'mcp',
      status: i % 5 === 0 ? 'disputed' : i % 8 === 0 ? 'failure' : 'success',
      responseTimeMs: 800 + Math.floor(Math.random() * 1200),
      amountUsd: 0,
      createdAt: new Date(now - (30 - i) * msPerDay * 0.5).toISOString(),
    });
  }

  // New agent — 3 transactions, insufficient data
  for (let i = 0; i < 3; i++) {
    transactionStore.add({
      id: `demo-gamma-${i}`,
      providerDid: 'did:web:gamma-agent.example.com',
      protocol: 'a2a',
      status: 'success',
      responseTimeMs: 600,
      amountUsd: 0.1,
      createdAt: new Date(now - i * msPerDay).toISOString(),
    });
  }
}

// Re-export for use in index.ts
export { randomUUID };
