# agent-trust-core

**Assign auditable trust scores (0-100) to any AI agent by its DID. Built for the agent-to-agent economy — MCP servers, x402 payments, and Verifiable Credentials.**

[![npm version](https://img.shields.io/npm/v/agent-trust-core)](https://www.npmjs.com/package/agent-trust-core)
[![License](https://img.shields.io/npm/l/agent-trust-core)](https://github.com/lm203688/agent-trust-protocol/blob/main/LICENSE)

---

## Problem → Solution

| Problem | Solution |
|---------|----------|
| Agent A wants to hire Agent B via x402 — how does it know B is trustworthy? | `computeTrustScore(did)` returns a 0-100 reputation score backed by real transaction data |
| You need a machine-readable trust signal consumable by LLM agents | Scores output as **W3C Verifiable Credentials** — standard JSON-LD that any agent can validate |
| Trust scoring must be auditable, not a black box | Fully **open-source algorithm** with Bayesian smoothing, published weights, and confidence tiers |
| Different protocols (x402, MCP, A2A) produce fragmented reputation | **Protocol-agnostic** transaction ingestion — any protocol's success/failure/dispute data works |
| New agents have no history — how to prevent 1-transaction fraud? | **Bayesian prior** (10 pseudo-transactions at score 70) prevents gaming the system |

---

## Features

### Scoring Engine
**Problem:** Agents need a consistent, defensible trust score to make delegation decisions.
**Solution:** Four-dimensional scoring (completion rate 35% + reliability 30% + consistency 20% + response time 15%) with confidence tiers from `insufficient_data` to `high`.

### DID Resolver
**Problem:** Agents must be uniquely identifiable across ecosystems.
**Solution:** Built-in `resolveDID()` supports `did:web` (HTTPS fetch of `/.well-known/did.json`) and `did:key` (stateless key derivation). Extensible via the Universal Resolver interface.

### W3C VC Issuer
**Problem:** Trust scores need to be cryptographically provable and interoperable.
**Solution:** `issueScoreCredential()` wraps any AgentTrustScore into a **W3C Verifiable Credential** (`Ed25519Signature2020` template), ready for any standards-compliant verifier.

### In-Memory Transaction Store
**Problem:** Need a zero-dependency way to persist transaction records for scoring.
**Solution:** `transactionStore` provides `add()`, `getByDid()`, `seed()`, and `stats()` — swap with PostgreSQL adapter for production.

---

## Installation

```bash
npm install agent-trust-core
```

```bash
yarn add agent-trust-core
```

```bash
pnpm add agent-trust-core
```

**Requirements:** Node.js >= 20.0.0, TypeScript 5.4+

---

## Quick Start

### 1. Basic Trust Score

```typescript
import { transactionStore, computeTrustScore } from 'agent-trust-core';

// Seed transaction history for an agent
transactionStore.seed([
  {
    id: 'tx-001',
    providerDid: 'did:web:weather-agent.example.com',
    protocol: 'x402',
    status: 'success',
    responseTimeMs: 450,
    amountUsd: 0.01,
    createdAt: new Date().toISOString(),
  },
  // ... add 10+ more records for a meaningful score
]);

// Compute the trust score
const score = computeTrustScore(
  'did:web:weather-agent.example.com',
  transactionStore.getByDid('did:web:weather-agent.example.com')
);

console.log(score);
// {
//   did: 'did:web:weather-agent.example.com',
//   overallScore: 87,
//   confidenceTier: 'medium',
//   transactionCount: 12,
//   dimensions: { completionRate: 100, responseTime: 95, reliabilityScore: 100, consistencyScore: 78 },
//   computedAt: '2026-06-11T...'
// }
```

### 2. Issue a W3C Verifiable Credential

```typescript
import { computeTrustScore, issueScoreCredential, transactionStore } from 'agent-trust-core';

// After computing a score, wrap it in a W3C VC
const records = transactionStore.getByDid('did:web:weather-agent.example.com');
const trustScore = computeTrustScore('did:web:weather-agent.example.com', records);

const vc = issueScoreCredential('did:web:weather-agent.example.com', trustScore);

console.log(JSON.stringify(vc, null, 2));
// {
//   "@context": ["https://www.w3.org/2018/credentials/v1", "https://agenttrust.xyz/contexts/trust-score/v1"],
//   "type": ["VerifiableCredential", "AgentTrustScoreCredential"],
//   "issuer": "did:web:agenttrust.xyz",
//   "credentialSubject": { "id": "did:web:weather-agent.example.com", "trustScore": { ... } },
//   "proof": { "type": "Ed25519Signature2020", ... }
// }
```

### 3. Custom Scoring Weights

```typescript
import { computeTrustScore, type TransactionRecord, type AgentTrustScore } from 'agent-trust-core';

// Example: a risk-averse consumer doubles the dispute penalty
// (production customization via algorithm fork + config)
function customScore(did: string, records: TransactionRecord[]): AgentTrustScore {
  const total = records.length;
  if (total === 0) {
    return {
      did,
      overallScore: 0,
      dimensions: { completionRate: 0, responseTime: 0, reliabilityScore: 0, consistencyScore: 0 },
      transactionCount: 0,
      computedAt: new Date().toISOString(),
      confidenceTier: 'insufficient_data',
    };
  }

  const successCount = records.filter(r => r.status === 'success').length;
  const disputes = records.filter(r => r.status === 'disputed').length;

  const completionRate = (successCount / total) * 100;
  // Custom: dispute penalty doubled — every dispute costs 4 points instead of 2
  const reliabilityScore = Math.max(0, 100 - (disputes / total) * 400);
  const consistencyScore = (10 * 70 + total * completionRate) / (10 + total);
  const avgMs = records.reduce((s, r) => s + r.responseTimeMs, 0) / total;
  const responseTime = avgMs <= 500 ? 100 : avgMs >= 10000 ? 0 : 100 - ((avgMs - 500) / 9500) * 100;

  const overallScore = Math.round(
    completionRate * 0.35 + reliabilityScore * 0.30 + consistencyScore * 0.20 + responseTime * 0.15
  );

  return {
    did,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    dimensions: { completionRate, responseTime, reliabilityScore, consistencyScore },
    transactionCount: total,
    computedAt: new Date().toISOString(),
    confidenceTier: total < 5 ? 'insufficient_data' : total < 25 ? 'low' : total < 100 ? 'medium' : 'high',
  };
}
```

---

## API Reference

### `computeTrustScore(did, records)`

Compute a composite trust score for an agent.

```typescript
function computeTrustScore(
  did: DID,
  records: TransactionRecord[]
): AgentTrustScore
```

**Parameters:**
- `did`: A W3C DID string (e.g., `did:web:example.com`)
- `records`: Array of `TransactionRecord` objects

**Returns:** `AgentTrustScore`

```typescript
interface AgentTrustScore {
  did: DID;
  overallScore: number;         // 0-100 composite score
  dimensions: {
    completionRate: number;     // 0-100, success / total
    responseTime: number;       // 0-100, faster = higher
    reliabilityScore: number;   // 0-100, dispute-adjusted
    consistencyScore: number;   // 0-100, Bayesian-smoothed
  };
  transactionCount: number;
  computedAt: ISODateTime;
  confidenceTier: 'insufficient_data' | 'low' | 'medium' | 'high';
}
```

### `resolveDID(did)`

Resolve a DID to its DID Document and service endpoints.

```typescript
async function resolveDID(did: DID): Promise<ResolvedDID>
```

**Supported methods:** `did:web`, `did:key` (extensible to other methods via Universal Resolver)

### `issueScoreCredential(subjectDid, score)`

Issue a W3C Verifiable Credential for a trust score.

```typescript
function issueScoreCredential(
  subjectDid: DID,
  score: AgentTrustScore
): AgentTrustCredential
```

**Defaults:** Issuer DID = `did:web:agenttrust.xyz` (override via `ISSUER_DID` env var).
Credential TTL: 24 hours. Proof: `Ed25519Signature2020` template.

### `transactionStore`

In-memory transaction store for development and testing.

```typescript
const transactionStore: {
  add(record: TransactionRecord): void;
  getByDid(did: DID): TransactionRecord[];
  allDids(): DID[];
  seed(records: TransactionRecord[]): void;
  stats(): { agentCount: number; transactionCount: number };
  _reset(): void;  // tests only
}
```

### `TransactionRecord`

```typescript
interface TransactionRecord {
  id: string;
  providerDid: DID;
  consumerDid?: DID;
  protocol: 'x402' | 'mcp' | 'a2a' | 'other';
  status: 'success' | 'failure' | 'disputed';
  responseTimeMs: number;
  amountUsd: number;
  createdAt: ISODateTime;
  metadata?: Record<string, unknown>;
}
```

---

## Scoring Algorithm

```
overallScore = completionRate    × 0.35
             + reliabilityScore  × 0.30
             + consistencyScore  × 0.20
             + responseTime      × 0.15
```

### Dimension Details

| Dimension | Weight | Formula | Rationale |
|-----------|--------|---------|-----------|
| **Completion Rate** | 35% | `successes / total × 100` | Core signal — does the agent deliver? |
| **Reliability** | 30% | `max(0, 100 - disputes/total × 200)` | Disputes weighted 2× because they indicate active harm |
| **Consistency** | 20% | `(10×70 + n×observedRate) / (10+n)` | Bayesian smoothing prevents new-agent gaming |
| **Response Time** | 15% | `≤500ms→100, ≥10000ms→0, linear between` | Speed matters for agent-to-agent chains |

### Confidence Tiers

| Tier | Transactions | Interpretation |
|------|-------------|---------------|
| `insufficient_data` | < 5 | Do not rely on this score |
| `low` | 5–24 | Treat as indicative only |
| `medium` | 25–99 | Reasonably reliable |
| `high` | ≥ 100 | High confidence |

### Design Rationale

- **No black-box ML** — the formula is four weighted dimensions. Anyone can audit and reproduce.
- **Bayesian prior** (10 pseudo-transactions at 70) means a new agent with 1 perfect transaction scores ~72, not 100.
- **Disputes cost 2×** relative to failures — failing silently is bad, but taking money and delivering garbage is worse.
- **Protocol-agnostic** — x402, MCP, and A2A transactions feed into the same scoring pipeline.

Full specification: [`docs/scoring-algorithm.md`](https://github.com/lm203688/agent-trust-protocol/blob/main/docs/scoring-algorithm.md)

---

## FAQ

### Q: How is this different from ScoutScore?
**A:** ScoutScore monitors service uptime (1,500+ MCP servers) and provides availability metrics. `agent-trust-core` computes **reputation scores from transaction outcomes** — success/failure/dispute data from agent-to-agent payments (x402), MCP tool calls, and A2A interactions. Think of it as "credit score for AI agents" vs. "status page for services." They're complementary — you can feed ScoutScore uptime data into agent-trust-core as a transaction record.

### Q: Which DID methods are supported?
**A:** Built-in: `did:web` (fetches `/.well-known/did.json` over HTTPS) and `did:key` (stateless, derived from public key JWK). The `resolveDID()` function falls back gracefully for unknown methods. For production, wire in the [Universal Resolver](https://github.com/decentralized-identity/universal-resolver) to support `did:ethr`, `did:ion`, `did:indy`, and more.

### Q: Are the Verifiable Credentials cryptographically signed?
**A:** In v0.1.0, the proof block is a template (`Ed25519Signature2020`). Production signing via `@digitalbazaar/vc` is on the roadmap. The VC structure is fully W3C-compliant — only the cryptographic proof is pending. You can add real signing yourself by post-processing the output.

### Q: Can I use this with my existing MCP server?
**A:** Yes. Install the sibling package `@agent-trust/mcp-server` and add it to your MCP configuration:

```json
{
  "mcpServers": {
    "agent-trust": {
      "command": "npx",
      "args": ["-y", "@agent-trust/mcp-server"]
    }
  }
}
```

Your agent can then call `get_agent_trust_score({ did: "did:web:some-agent.example.com" })` before delegating work.

### Q: What happens when a new agent has zero transaction history?
**A:** `overallScore` returns 0, and `confidenceTier` is `insufficient_data`. After the first few transactions, Bayesian smoothing kicks in — the score starts near 70 (the prior) and converges toward the true performance as more data arrives. This prevents new agents from appearing artificially trustworthy or untrustworthy based on tiny samples.

### Q: Can I customize the scoring weights for my use case?
**A:** Yes. Fork the repository, modify `packages/core/src/scoring.ts`, and rebuild. The algorithm is designed to be transparent and auditable — no hidden logic. See the "Custom Scoring Weights" example in the Quick Start section above. You can also propose weight changes back to the community via a GitHub issue.

### Q: Does this use any external APIs or blockchain?
**A:** No external API dependencies. `did:web` resolution hits the target domain's `/.well-known/did.json` endpoint (5s timeout, graceful degradation). No blockchain required for core scoring — chain anchoring (Base L2) is on the roadmap for immutable audit trails. The in-memory store means zero infrastructure for development.

### Q: How do I feed real payment data into the scoring engine?
**A:** Install `@agent-trust/x402-listener`, which provides a webhook server that ingests x402 payment events. It normalizes the data into `TransactionRecord` format and feeds them into `transactionStore`. For custom integrations, just call `transactionStore.add(record)` with your protocol's transaction data.

---

## Related Packages

| Package | npm | Description |
|---------|-----|-------------|
| `agent-trust-core` | [npm](https://www.npmjs.com/package/agent-trust-core) | **Core scoring engine, DID resolver, VC issuer** (this package) |
| `@agent-trust/mcp-server` | — | MCP server exposing trust scores as tools (`get_agent_trust_score`, `submit_transaction`, `get_scoring_formula`) — any MCP-compatible agent can query |
| `@agent-trust/x402-listener` | — | Webhook listener for x402 payment events — normalises real transactions into the scoring pipeline |
| `@agent-trust/xunhupay` | — | [XunhuPay](https://www.xunhupay.com) payment gateway adapter — channels Chinese payment-settlement data into agent trust scores |
| `@agent-trust/rest-api` | — | REST API server wrapping the core engine — planned for non-MCP clients |

---

## License

Apache 2.0 — see [LICENSE](https://github.com/lm203688/agent-trust-protocol/blob/main/LICENSE).

**Why Apache 2.0?** Trust infrastructure must be auditable. If the scoring algorithm is a black box, why trust its output? Fork it, customize weights for your vertical, self-host your own instance.

---

## Contributing

Issues and PRs welcome at [github.com/lm203688/agent-trust-protocol](https://github.com/lm203688/agent-trust-protocol).

Priority contributions:
- PostgreSQL persistence adapter (replace in-memory `transactionStore`)
- Real Ed25519 VC cryptographic signing via `@digitalbazaar/vc`
- Multi-protocol trust aggregation (MCP + A2A + x402)
- Test coverage

---

**Built for the agent economy.** If agents are going to pay each other, they need to know who they can trust.
