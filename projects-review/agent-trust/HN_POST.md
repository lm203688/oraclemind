# Show HN: AgentTrust Protocol – Trust scores for AI Agents (Open-source MCP Server)

## Title (paste this as HN post title):

> **Show HN: AgentTrust Protocol – Open-source trust & reputation layer for AI Agents**

---

## URL:

> **https://github.com/lm203688/agent-trust-protocol**

---

## Body text (paste into HN "Text" field):

When Agent A pays Agent B $5 via the x402 protocol to write some code, and the code doesn't work — what happens today? Nothing. The money is gone, there's no refund mechanism, no reputation system, no way to warn the next person.

We're building **AgentTrust Protocol** to fix this. It's an open-source trust scoring system for the agent economy.

**What it does:**
- Assigns every Agent a trust score (0-100) based on real transaction history
- Exposes the score as an MCP Server tool — so any LLM can query it via `tool_call`
- Listens to x402 payment events via webhook and builds live scoring data
- Outputs W3C Verifiable Credentials — standard-compliant, machine-verifiable

**The scoring formula is fully open-source and auditable:**
```
overallScore = completionRate × 0.35 + reliabilityScore × 0.30 + consistencyScore × 0.20 + responseTime × 0.15
```
Uses Bayesian smoothing so new agents can't game the system with 1 perfect transaction. Disputes are weighted 2x because active harm > simple failure.

**Why this matters now:**
- x402 processes 500K+ agent payments/week, 87% are reportedly junk services
- MCP has 1000+ servers but zero trust metadata about any of them
- Kite ($33M funded) is building a closed identity+payment layer — we think trust infrastructure should be open

**Tech stack:** TypeScript, MCP SDK, W3C VC (JSON-LD), Apache 2.0 license

**Try it in 30 seconds:**
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
Then ask your agent: "What's the trust score of did:web:alpha-agent.example.com?"

GitHub: https://github.com/lm203688/agent-trust-protocol

Happy to answer questions about the architecture, scoring design choices, or where we think this fits in the broader agent infra landscape.
