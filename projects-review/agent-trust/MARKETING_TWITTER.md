# Twitter/X Thread — AgentTrust Protocol

**Thread length:** 12 tweets
**Tone:** Technical, optimistic, founder-energy
**Primary audience:** AI/ML engineers, MCP devs, agent infra builders
**Posting time:** Tuesday/Wednesday 9–11 AM PST

---

## Tweet 1 — Hook

500,000+ agent-to-agent payments happen every week via x402.

87% are reportedly junk.

There's no refund system, no reputation tracking, no way to know if an agent is reliable before you pay it.

So we built one. Open source.

🧵

**Hashtags:** #AI #AgentEconomy #OpenSource

---

## Tweet 2 — What We Built

Introducing AgentTrust Protocol: a trust scoring layer for the AI agent economy.

Think "credit score for agents." Every transaction builds a reputation. Every score is auditable. Every credential is machine-readable.

Works with any MCP-compatible agent. Claude, GPT, custom agents — all the same interface.

**Hashtags:** #MCP #AIAgents #Web3

---

## Tweet 3 — Architecture

The architecture is simple:

📊 Core engine → scores agents (0–100) from real tx history
🔌 MCP Server → exposes as LLM tools (3 tools, stdio transport)
📡 x402 Listener → webhook ingests payment events → auto-updates
🔐 W3C VC Issuer → outputs standard Verifiable Credentials

4 packages. 1 monorepo. Apache 2.0.

**Hashtags:** #TypeScript #DevTools #OpenSource

---

## Tweet 4 — Package 1: agent-trust-core

`agent-trust-core` — the scoring engine.

• Composite trust score from 4 weighted dimensions
• Bayesian smoothing to prevent gaming
• Disputes penalized 2x vs simple failures
• 4 confidence tiers: insufficient_data → low → medium → high

Full algorithm spec is in the repo. Want to change how scores work? Fork it, adjust weights, ship.

**Hashtags:** #Reputation #AITrust #TypeScript

```ts
import { computeScore } from 'agent-trust-core';
const score = computeScore(agentId, transactions);
// { overallScore: 87, grade: 'B', confidenceTier: 'high' }
```

---

## Tweet 5 — Package 2: agent-trust-mcp-server

`agent-trust-mcp-server` — give your LLM agent a trust checker.

One line in your MCP config:

```json
{ "command": "npx", "args": ["-y", "agent-trust-mcp-server"] }
```

Your agent now has 3 tools:
• `get_agent_trust_score` — check any agent by DID
• `get_scoring_formula` — audit the algorithm
• `submit_transaction` — report outcomes

No API keys. No signup. Just npx -y.

**Hashtags:** #MCP #Claude #LLM

---

## Tweet 6 — Package 3: agent-trust-x402-listener

`agent-trust-x402-listener` — the bridge between payments and reputation.

Webhook server that receives x402 payment events, normalizes them, and feeds them into the scoring engine.

HMAC signature verification. Protocol-agnostic normalizer (x402 → standard TransactionRecord). Ready for real traffic.

The more transactions it processes, the more accurate the scores get.

**Hashtags:** #x402 #Web3 #DeveloperTools

---

## Tweet 7 — Package 4: agent-trust-xunhupay

`agent-trust-xunhupay` — WeChat Pay & Alipay for Node.js devs.

Because paying agents in the agent economy shouldn't require a Stripe business account.

• Individual developers welcome (no enterprise verification)
• Full TypeScript types
• HMAC callback verification
• MIT license — use it anywhere

```ts
const pay = new XunhuPay({ appid, appsecret });
const result = await pay.createPayment({ payment: 'wechat', total_fee: '0.01' });
```

**Hashtags:** #NodeJS #WeChatPay #Alipay #中国开发者

---

## Tweet 8 — Demo (npx one-liner)

This is all it takes to try it:

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

Response:
• Score: 87/100
• Grade: B
• Confidence: high (150+ transactions)
• 4 dimension breakdown

30 seconds. No API keys. Free. Open source.

**Hashtags:** #DevTools #MCP #ClaudeCode

---

## Tweet 9 — Why Open Source

Why did we open-source everything?

Trust infrastructure CANNOT be a black box.

Kite raised $33M to build a closed identity layer. ScoutScore uses proprietary scoring. You can't read their algorithms. You can't fork them. You can't self-host.

AgentTrust is Apache 2.0. Every formula is documented. Every weight is adjustable. Every line is auditable.

Trust is too important to outsource.

**Hashtags:** #OpenSource #Transparency #AITrust

---

## Tweet 10 — Roadmap

What's next for AgentTrust:

v0.2:
• PostgreSQL persistence (replace in-memory store)
• Real Ed25519 VC cryptographic signing
• REST API endpoint
• Chain anchoring → Base L2

v1.0:
• Escrow / dispute resolution workflow
• Cross-protocol aggregation (MCP + x402 + A2A)
• Admin dashboard for dispute review

**Hashtags:** #Roadmap #Web3 #AIInfrastructure

---

## Tweet 11 — The Vision

The agent economy needs layer-0 infrastructure:

• Identity → DIDs (W3C standard, we already use these)
• Payments → x402 (happening now)
• Trust → AgentTrust (that's us)
• Discovery → TBD

Pick any three. We're building the missing fourth.

If every agent transaction leaves a trust footprint, the ecosystem polices itself. Bad actors become uneconomical. Great agents get discovered faster.

**Hashtags:** #AgentEconomy #AIInfra #FutureOfAI

---

## Tweet 12 — CTA

AgentTrust Protocol is live on GitHub.

4 packages. Apache 2.0. All open source.

⭐ Star the repo if this resonates
🔧 Try the MCP server with `npx -y agent-trust-mcp-server`
🐛 Open issues, send PRs (especially: Postgres adapter, VC signing, agent framework integrations)

https://github.com/lm203688/agent-trust-protocol

What trust signals would YOU want your agents to check before paying another agent? Drop your thoughts below 👇

**Hashtags:** #OpenSource #BuildInPublic #AI

---

## Publishing Notes

**Engagement strategy after posting:**
1. Reply to every comment within the first hour
2. Quote-retweet the first tweet 24h later with "24h update: X stars, Y clones, Z comments"
3. DM relevant accounts (MCP team, LangChain, CrewAI) asking for feedback
4. Pin the thread to profile for 1 week

**Visual assets to attach:**
- Tweet 3: Post the ASCII architecture diagram as an image
- Tweet 8: Screenshot of MCP config + agent response
- Tweet 12: Repo card with star count

**Relevant accounts to tag (if contextually appropriate):**
- @AnthropicAI (MCP)
- @LangChainAI
- @crewAIInc
- @sigstore (W3C VC adjacent)
