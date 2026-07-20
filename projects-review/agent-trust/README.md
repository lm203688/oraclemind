# AgentTrust Protocol

> **An open trust & reputation layer for the Agent economy.**
> Every transaction recorded · Every score auditable · Every credential machine-readable

<p align="center">
  <a href="https://github.com/lm203688/agent-trust-protocol/stargazers"><img src="https://img.shields.io/github/stars/lm203688/agent-trust-protocol?style=flat" alt="Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
  <a href="https://www.w3.org/TR/vc-data-model/"><img src="https://img.shields.io/badge/W3C-Verifiable%20Credentials-green" alt="W3C VC"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Compatible-purple" alt="MCP Compatible"></a>
</p>

---

## What This Is

**AgentTrust Protocol** is an open-source trust scoring layer. Think "credit score for AI Agents."

Today the Agent economy has 500K+ weekly x402 payments, 1,000+ MCP servers, and growing A2A adoption — but **zero trust infrastructure**. When Agent A pays Agent B and the result is garbage, the money is gone. No refund. No reputation hit. No warning for the next victim.

| What exists | What's missing |
|---|---|
| x402 payments | Refund / escrow mechanism |
| MCP tool directory | Trust scores on tools & agents |
| A2A communication | Cross-protocol reputation |

AgentTrust fixes this by computing **auditable trust scores** (0–100) from real transaction history, exposed via **MCP tools** so any LLM can query them, and published as **W3C Verifiable Credentials**.

---

## Quick Start

### Option A: npx (zero setup)

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "agent-trust": {
      "command": "npx",
      "args": ["-y", "agent-trust-mcp-server"]
    }
  }
}
```

Then ask your agent:

> *"What's the trust score of did:web:alpha-agent.example.com?"*

It will respond with a scored, graded, confidence-tiered result.

### Option B: Install from npm

```bash
npm install agent-trust-core agent-trust-mcp-server
```

### Option C: Run from source

```bash
git clone https://github.com/lm203688/agent-trust-protocol.git
cd agent-trust-protocol
npm install && npm run build

# Terminal 1: Start the MCP Server
node packages/mcp-server/dist/index.js

# Terminal 2: Start the x402 listener (optional)
X402_WEBHOOK_SECRET=my-secret node packages/x402-listener/dist/index.js
```

---

## MCP Tools

| Tool | Input | Output |
|------|-------|--------|
| `get_agent_trust_score` | `did` (string), `format?` (`vc` or `summary`) | Composite score + 4 dimensions + grade + confidence |
| `get_scoring_formula` | *(none)* | Full algorithm spec with weights (auditable) |
| `submit_transaction` | provider, status, protocol, responseTimeMs, ... | Updated score confirmation |

### Example output

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

Request `format: "vc"` to get a full [W3C Verifiable Credential](https://www.w3.org/TR/vc-data-model/) (JSON-LD) instead.

---

## Scoring Algorithm

**Fully open-source. Fully auditable. No black box.**

```
overallScore = completionRate × 0.35     ← Did they deliver?
             + reliabilityScore × 0.30   ← Any disputes? (2× weight)
             + consistencyScore × 0.20   ← Bayesian-smoothed quality
             + responseTime × 0.15       ← How fast?
```

| Dimension | Formula | Why it matters |
|-----------|---------|----------------|
| Completion Rate | success / total × 100 | Basic reliability |
| Reliability Score | max(0, 100 − disputes/total × 200) | Disputes = active harm |
| Consistency Score | Bayesian smoothing (prior: 10 @ 70) | Prevents gaming |
| Response Time | Linear 500ms→100 down to 10s→0 | Speed matters |

**Confidence tiers** prevent false trust:

| Tier | Transactions | Interpretation |
|------|-------------|----------------|
| 🔴 insufficient_data | < 5 | Do not rely on this score |
| 🟡 low | 5–24 | Indicative only |
| 🟢 medium | 25–99 | Reasonably reliable |
| 🟢 high | ≥ 100 | High confidence |

📖 [Full algorithm specification](docs/scoring-algorithm.md) — version-controlled, PR-required for changes.

---

## Design Principles

| # | Principle | What it means |
|---|-----------|---------------|
| 1 | **Transparency over trust-me** | Algorithm is open source. Read it. Critique it. PR it. |
| 2 | **Agent-native first** | MCP tool interface. W3C VC output. No human dashboard needed. |
| 3 | **Protocol-agnostic** | x402, MCP, A2A all feed the same trust graph. |
| 4 | **Accumulative moat** | More transactions → more accurate scores → more adoption → more data. |

---

## Roadmap

### v0.1 — Current ✅
- In-memory store with demo data
- 3 MCP tools (`get_score`, `formula`, `submit_tx`)
- x402 webhook listener skeleton
- W3C VC output (placeholder proof)
- Weekly ecosystem reports via Distributor Agent

### v0.2 — Next
- [ ] PostgreSQL persistence adapter
- [ ] Real Ed25519 cryptographic signing on VCs
- [ ] REST API endpoint (`GET /api/v1/score/{did}`)
- [ ] Chain anchoring (score hash → Base L2)

### v1.0
- [ ] Escrow / dispute resolution workflow
- [ ] Cross-protocol aggregation (MCP tool calls + x402 payments)
- [ ] Universal DID Resolver integration
- [ ] Admin dashboard for dispute review

---

## Project Structure

```
agent-trust-protocol/
├── packages/
│   ├── core/              # Scoring engine + DID resolver + VC issuer
│   │   └── src/
│   │       ├── types.ts       # All type definitions
│   │       ├── scoring.ts     # Weighted scoring algorithm
│   │       ├── resolver.ts    # DID → DID Document
│   │       ├── issuer.ts      # W3C VC generation
│   │       └── store.ts       # Data layer (memory → PG)
│   ├── mcp-server/        # MCP-compatible server (stdio transport)
│   │   └── src/
│   │       ├── index.ts       # Server + tool handlers
│   │       └── tools.ts       # Demo data seeding
│   └── x402-listener/      # Webhook receiver for x402 events
│       └── src/
│           ├── normaliser.ts  # Raw event → TransactionRecord
│           └── webhook.ts     # HTTP server + signature verification
├── docs/
│   └── scoring-algorithm.md  # Authoritative algorithm spec
├── scripts/
│   └── distributor_agent.py  # Weekly ecosystem report generator
├── weekly-suggestions/      # Auto-generated reports
├── miniprogram/             # WeChat Mini Program (WIP)
└── .github/workflows/ci.yml  # Build pipeline
```

---

## Community & Contributing

We welcome contributions of all kinds — code, docs, tests, integrations, or feedback.

📖 **[Contributing Guide](CONTRIBUTING.md)** — how to set up, where to start, how to propose changes.  
🐛 **[Issues](https://github.com/lm203688/agent-trust-protocol/issues)** — bug reports, feature requests, questions.  
💬 **[Discussions](https://github.com/lm203688/agent-trust-protocol/discussions)** — design proposals, use-case sharing, general chat.

**We especially need help with:**

- PostgreSQL adapter (replace in-memory store)
- Real cryptographic VC signing (`@digitalbazaar/vc` or similar)
- Test coverage (currently at 0% — let's fix that)
- Integration examples with popular agent frameworks (LangChain, CrewAI, AutoGen)
- WeChat Mini Program UI polish and integration

Algorithm changes must update [docs/scoring-algorithm.md](docs/scoring-algorithm.md) in the same PR so the spec always matches code.

---

## License

Apache 2.0 — see [LICENSE](LICENSE).

---

<p align="center">
  <sub>Built with ❤️ for the open Agent ecosystem</sub><br>
  <sub>TypeScript · MCP SDK · W3C Verifiable Credentials</sub>
</p>
