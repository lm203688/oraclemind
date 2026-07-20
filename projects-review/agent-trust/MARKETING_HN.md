# Show HN: AgentTrust Protocol — Trust scores for AI Agents (Open-source MCP Server)

## Title (paste this as HN post title):

> **Show HN: AgentTrust Protocol — Open-source trust scoring layer for the Agent economy**

---

## URL:

> **https://github.com/lm203688/agent-trust-protocol**

---

## Body text (paste into HN "Text" field):

500,000+ agent-to-agent payments happen every week via x402. 87% of those are reportedly junk services. There's no refund. No reputation hit. No way to warn the next person.

We built **AgentTrust Protocol** — an open-source trust scoring layer for AI agents. Think "credit score, but for the agent economy."

**What it does:**

- Scores any AI agent (0–100) from real transaction history — completion rate, reliability, consistency, response time
- Exposes scores as an **MCP Server tool** — so any LLM (Claude, GPT, etc.) can call `get_agent_trust_score` before hiring another agent
- Listens to x402 payment webhooks to build live scoring data automatically
- Issues results as **W3C Verifiable Credentials** (JSON-LD) — machine-readable, standard-compliant

**The scoring formula is fully open-source (zero black box):**

```
overallScore = completionRate × 0.35
             + reliabilityScore × 0.30
             + consistencyScore × 0.20
             + responseTime × 0.15
```

Bayesian smoothing prevents new agents from gaming the system with 1 perfect transaction. Disputes are weighted 2× — active harm counts more than simple failure. Scores below 5 transactions carry an "insufficient_data" confidence flag.

**Why now:**

- x402 is growing fast. MCP has 1,000+ servers. A2A from Google is shipping. Agent-to-agent commerce is real — but trust infrastructure doesn't exist.
- Kite raised $33M to build a closed identity + payment layer. ScoutScore monitors 1,500+ services. Both are centralized, both are opaque. We think trust infrastructure needs to be open and auditable.
- MCP has zero trust metadata. No way to know if an MCP tool is reliable before you call it. AgentTrust plugs that gap — with `npx -y`, one line in your config.

**Try it in 30 seconds:**

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

Then ask your agent: *"What's the trust score of did:web:alpha-agent.example.com?"*

**4 packages, one repo:**

| Package | What | License |
|---------|------|---------|
| `agent-trust-core` | Scoring engine, DID resolver, VC issuer | Apache 2.0 |
| `agent-trust-mcp-server` | MCP server with 3 tools (score, formula, submit) | Apache 2.0 |
| `agent-trust-x402-listener` | Webhook receiver for x402 payment events | Apache 2.0 |
| `agent-trust-xunhupay` | WeChat/Alipay payment SDK (individual devs welcome) | MIT |

Tech stack: TypeScript, MCP SDK, W3C VC (JSON-LD), in-memory → PostgreSQL.

---

**Open questions we'd love HN's take on:**

1. When should trust scores expire? Should a perfectly reliable agent from 6 months ago still show 98 today, or should scores decay over time?
2. Should trust scores include "performance on specific task types" (e.g., "this agent is great at code review but bad at data analysis"), or is a single composite score more useful?

GitHub: https://github.com/lm203688/agent-trust-protocol

PRs welcome — especially Postgres adapter, real Ed25519 VC signing, and integration examples with LangChain/CrewAI/AutoGen.
