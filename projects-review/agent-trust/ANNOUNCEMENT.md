# AgentTrust Protocol: Open-source trust scoring for AI Agents (MCP Server + x402 listener)

## TL;DR

**Agent A wants to hire Agent B to do a job. How does Agent A know if Agent B is trustworthy?**

We built **AgentTrust Protocol** — an open-source trust & reputation layer for the Agent economy.

- **MCP Server**: Any MCP-compatible agent can query trust scores via `tool_call`
- **x402 Listener**: Ingests real payment events to build live scoring data
- **W3C Verifiable Credentials**: Machine-readable, standard-compliant output
- **Fully auditable algorithm**: Open-source scoring formula, no black-box

**Repo: https://github.com/lm203688/agent-trust-protocol**

---

## The Problem

The Agent economy is growing fast:

- **x402 protocol** processes 500,000+ agent-to-agent payments per week
- **MCP (Model Context Protocol)** has 1,000+ public servers
- **A2A (Agent-to-Agent)** from Google is gaining adoption

But here's the gap: **when Agent A pays Agent B via x402, and the result is garbage — what happens?**

There's no:
- ✗ Trust score for agents (like a credit score, but for AI)
- ✗ Dispute / escrow mechanism
- ✗ Cross-protocol reputation (x402 + MCP + A2A data in one place)
- ✗ Standardized way to say "this agent is reliable"

Existing players like **Kite** ($33M funded) are building identity + payment layers, and **ScoutScore** monitors 1,500+ services — but nobody is building an **open, protocol-agnostic trust scoring layer** that any framework can plug into.

---

## What We Built

### 1. Trust Score API (`GET /agent/{did}/score`)

Query any agent's trust score by its DID (Decentralized Identifier):

```json
{
  "did": "did:web:alpha-agent.example.com",
  "overallScore": 87,
  "grade": "B",
  "confidenceTier": "high",
  "transactionCount": 150,
  "dimensions": {
    "completionRate": 95,
    "responseTime": 83,
    "reliabilityScore": 90,
    "consistencyScore": 78
  }
}
```

### 2. MCP Server Integration

Add to your MCP config:

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

Your agent can now call `get_agent_trust_score({ did: "did:web:some-agent.example.com" })`.

### 3. x402 Transaction Listener

Webhook server that ingests real payment events from x402 gateways and feeds them into the scoring engine. Supports HMAC signature verification.

### 4. W3C Verifiable Credentials

Scores are issued as standard VC JSON-LD documents — any W3C-compliant verifier can validate them.

---

## Scoring Algorithm (Fully Auditable)

```
overallScore = completionRate × 0.35
             + reliabilityScore × 0.30
             + consistencyScore × 0.20
             + responseTime × 0.15
```

Key design decisions:
- **Bayesian smoothing** on consistency score prevents new agents from gaming the system with 1 perfect transaction
- **Disputes weighted 2×** — a disputed transaction hurts more than a simple failure
- **Confidence tiers** — scores below 5 transactions are marked "insufficient_data"

Full spec: [docs/scoring-algorithm.md](https://github.com/lm203688/agent-trust-protocol/blob/main/docs/scoring-algorithm.md)

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  AgentTrust Protocol                  │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Core       │  │  MCP Server   │  │ x402       │  │
│  │  - Scoring  │◄─┤  - 3 tools    │  │ Listener   │  │
│  │  - DID      │  │  - stdio      │  │ - Webhook  │  │
│  │  - VC Issuer│  │  - npx ready  │  │ - Normaliser│ │
│  └──────┬──────┘  └──────────────┘  └─────┬──────┘  │
│         │                                │          │
│         ▼                                ▼          │
│  ┌──────────────────────────────────────────┐       │
│  │         In-Memory Store (→ PG)           │       │
│  └──────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

---

## What's Next (Roadmap)

- [ ] PostgreSQL persistence (replace in-memory store)
- [ ] Real Ed25519 VC cryptographic signing
- [ ] Chain anchoring — hash score updates to Base L2
- [ ] Escrow / dispute resolution workflow
- [ ] Cross-protocol trust aggregation (MCP + A2A + x402)
- [ ] REST API endpoint

---

## Why Open Source?

Trust infrastructure **must be auditable**. If you can't read the code that computes an agent's trust score, why would you trust it?

We chose Apache 2.0 so anyone can:
- Self-host their own trust instance
- Fork and customize scoring weights for their vertical
- Contribute back improvements

---

## Get Involved

- **GitHub Issues**: https://github.com/lm203688/agent-trust-protocol/issues
- **PRs welcome** — especially for Postgres adapter, real VC signing, and test coverage
- **Discussions**: Tell us what trust signals matter most for YOUR agent use case

---

**Built with**: TypeScript, MCP SDK, W3C Verifiable Credentials
**License**: Apache 2.0
