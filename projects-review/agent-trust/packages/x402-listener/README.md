# agent-trust-x402-listener

> x402 payment events → trust score updates — the missing link in agent economy

[![npm version](https://img.shields.io/npm/v/agent-trust-x402-listener.svg)](https://www.npmjs.com/package/agent-trust-x402-listener) [![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## The Problem

Agent A pays Agent B via x402 protocol — but there's no way to record the transaction, verify its authenticity, or evaluate the quality of what was delivered. Every payment is a black box. Without a trust signal, agents can't distinguish reliable counterparties from bad actors.

**agent-trust-x402-listener** bridges this gap: it receives x402 payment webhooks, verifies cryptographic signatures, normalizes events, and feeds them directly into the [AgentTrust](https://www.npmjs.com/package/agent-trust-core) scoring engine — turning raw transactions into reputation.

## Features

- **Webhook Receiver** — HTTP endpoint that ingests x402 payment events in real time
- **HMAC Signature Verification** — every event is cryptographically verified before processing
- **Event Normaliser** — maps heterogeneous x402 payloads to a unified `TrustEvent` format
- **Score Auto-Update** — feeds verified events into `agent-trust-core`, automatically updating trust scores

## Quick Start

### Install

```bash
npm install agent-trust-x402-listener agent-trust-core
```

### Environment Setup

```bash
cp .env.example .env
```

```dotenv
# .env
X402_WEBHOOK_SECRET=your-hmac-secret-here
X402_WEBHOOK_PORT=3100
TRUST_DB_PATH=./trust.db          # optional, defaults to in-memory
LOG_LEVEL=info                     # debug | info | warn | error
```

### Run

```typescript
import { createListener } from 'agent-trust-x402-listener';

const listener = createListener({
  webhookSecret: process.env.X402_WEBHOOK_SECRET!,
  port: Number(process.env.X402_WEBHOOK_PORT) || 3100,
});

listener.start();
// → Listening for x402 webhooks on http://localhost:3100/x402/webhook
```

Or via CLI:

```bash
npx agent-trust-x402-listener
```

## Webhook API Spec

### Endpoint

```
POST /x402/webhook
```

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `X-X402-Signature` | Yes | HMAC-SHA256 signature of the payload body |
| `X-X402-Timestamp` | Yes | Unix timestamp (seconds) — rejects >5 min drift |
| `Content-Type` | Yes | `application/json` |

### Payload Format

```json
{
  "event_id": "evt_0x7f3a…c9b2",
  "event_type": "payment.completed",
  "payment": {
    "from_agent": "did:agent:alice",
    "to_agent": "did:agent:bob",
    "amount": "0.005",
    "token": "USDC",
    "tx_hash": "0xabc123…def456"
  },
  "metadata": {
    "service": "data-enrichment",
    "quality_rating": 4.5,
    "latency_ms": 230
  },
  "timestamp": 1718083200
}
```

### Response

| Status | Body | Meaning |
|--------|------|---------|
| `200` | `{"ok": true, "event_id": "evt_0x7f3a…c9b2"}` | Event accepted and processed |
| `202` | `{"ok": true, "event_id": "evt_0x7f3a…c9b2", "queued": true}` | Event accepted, processing async |
| `400` | `{"error": "invalid_payload"}` | Malformed JSON or missing fields |
| `401` | `{"error": "invalid_signature"}` | HMAC verification failed |
| `408` | `{"error": "timestamp_expired"}` | Timestamp drift exceeds tolerance |

## How It Connects to the Scoring Engine

```
┌──────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│  x402 Agent  │─────▶│  x402-listener       │─────▶│  agent-trust-core│
│  (payer)     │ POST │                      │      │  (scoring engine)│
│              │      │  1. Verify HMAC      │      │                  │
└──────────────┘      │  2. Normalise event  │      │  4. Update score │
                      │  3. Emit TrustEvent  │─────▶│  5. Persist      │
                      └──────────────────────┘      └──────────────────┘
```

1. **Webhook hits** `/x402/webhook` with a signed payload
2. **HMAC is verified** against `X402_WEBHOOK_SECRET` — invalid signatures are rejected
3. **Event is normalised** into a `TrustEvent` with canonical fields (`from`, `to`, `amount`, `timestamp`, `metadata`)
4. **TrustEvent is fed** into `agent-trust-core`'s `recordEvent()` method
5. **Trust scores are updated** — both payer and payee scores reflect the verified transaction

## What Is x402?

[x402](https://x402.dev) is an open protocol for machine-to-machine payments on the internet. It enables AI agents to pay each other for services, data, and compute — autonomously, in real time, using stablecoins on-chain.

**Why x402 matters for agent trust:**

- Agents transact at machine speed — humans can't review every payment
- Without trust scores, a bad agent can drain budgets with low-quality responses
- x402 provides the **payment rail**; `agent-trust-x402-listener` provides the **trust rail**

The x402 protocol defines standard payment event payloads and webhook delivery, making it a natural data source for trust scoring.

## FAQ

**Q: Do I need to run a blockchain node?**
No. The listener receives webhooks from x402-compatible payment gateways. No on-chain interaction required.

**Q: What happens if a webhook is delivered twice?**
Each event is deduplicated by `event_id` before processing. Duplicate deliveries are acknowledged with `200` but not re-scored.

**Q: Can I use this without `agent-trust-core`?**
Yes. You can subscribe to verified events via the `onEvent` callback and route them to any system:

```typescript
const listener = createListener({
  webhookSecret: '...',
  onEvent: (event) => {
    // your custom handler
    console.log(event);
  },
});
```

**Q: What if my x402 gateway uses a different payload format?**
The normaliser is pluggable. Implement the `PayloadNormaliser` interface and pass it via `createListener({ normaliser: myNormaliser })`.

**Q: Is there replay protection?**
Yes. The `X-X402-Timestamp` header is checked against a configurable drift window (default 5 minutes). Replayed events with expired timestamps are rejected.

## Related Packages

| Package | Purpose |
|---------|---------|
| [agent-trust-core](https://www.npmjs.com/package/agent-trust-core) | Core scoring & verification engine |
| [agent-trust-mcp-server](https://www.npmjs.com/package/agent-trust-mcp-server) | MCP server for trust queries |
| [agent-trust-xunhupay](https://www.npmjs.com/package/agent-trust-xunhupay) | WeChat/Alipay payment SDK for Chinese developers |

## License

[Apache-2.0](https://opensource.org/licenses/Apache-2.0)
