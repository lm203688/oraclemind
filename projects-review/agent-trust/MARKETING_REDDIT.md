# Reddit Post Matrix — AgentTrust Protocol

---

## Post A: r/MCP or r/ClaudeAI

**Title:** I built a trust scoring MCP Server — now my Claude can check if an agent is reliable before hiring it

**Suggested flair:** `Project` or `Showcase`

**Best posting time:** Tuesday–Thursday, 9–11 AM EST (before US east coast lunch)

---

**Body:**

I've been building agent pipelines for a few months and kept running into the same problem: Agent A hires Agent B for a task, pays via x402, and Agent B returns garbage. Zero accountability. Zero reputation hit.

So I built a trust scoring MCP server. Claude (or any MCP-compatible LLM) can now query an agent's trust score before deciding whether to hire it. Think "credit score for AI agents."

**How it works in practice:**

My Claude Desktop config looks like this:

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

Once that's loaded, Claude gets 3 new tools:
- `get_agent_trust_score` — query any agent by DID, get back a 0–100 score + 4 dimensions
- `get_scoring_formula` — full transparent algorithm spec (auditable!)
- `submit_transaction` — report payment outcomes that feed the scoring engine

**What an actual conversation looks like:**

> Me: "Hey Claude, can you hire an agent to review this PR?"
> Claude: *[calls get_agent_trust_score for the candidate agent]*
> Claude: "I found PR-Reviewer-v3. Trust score: 92/100, Grade A, 340 transactions. All good — proceeding."
> *[30 seconds later]*
> Claude: "Review complete. 3 issues found. I've submitted the successful transaction to AgentTrust for scoring."

On the flip side:

> Me: "What about CodeGenerator-pro?"
> Claude: *[calls get_agent_trust_score]*
> Claude: "Score: 41/100, Grade F, only 8 transactions with 2 disputes. I wouldn't recommend this one."

**What's under the hood:**

The scoring formula is open source. Four dimensions weighted together:

```
completionRate (35%) + reliabilityScore (30%) + consistencyScore (20%) + responseTime (15%)
```

Uses Bayesian smoothing so a new agent with 1 perfect transaction can't game the system. Disputes are penalized 2x because active harm > simple failure.

**Why I built this as MCP instead of an API:**

MCP is becoming the universal interface between LLMs and tools. Claude, GPT, any future model — they can all call the same MCP tools the same way. Feels like the right abstraction layer for agent infrastructure.

Repo: https://github.com/lm203688/agent-trust-protocol
Apache 2.0 license.

Would love feedback from anyone building multi-agent systems. What trust signals matter most to your agents?

---

## Post B: r/ChatGPT or r/LocalLLaMA

**Title:** Open source alternative to Kite's agent identity layer — trust scores for AI agents, fully auditable

**Suggested flair:** `Resources` or `Discussion`

**Best posting time:** Monday or Wednesday, 10 AM–12 PM EST

---

**Body:**

Kite just raised $33M to build an identity + payment layer for AI agents. ScoutScore monitors 1,500+ services. These are closed-source, centralized systems that decide which agents are "trustworthy."

Here's the thing: if trust infrastructure for the agent economy is going to be a layer 0 primitive — like DNS or TCP — it CANNOT be a black box controlled by one company.

I've been working on **AgentTrust Protocol**, an open-source trust scoring engine for AI agents. Apache 2.0. Every line auditable.

**What it does:**

- Scores any AI agent (0–100) based on real transaction history — completion rate, reliability, disputes, response time
- Exposes scores via MCP Server tools so any LLM can query it natively
- Listens to x402 payment webhooks for live scoring data
- Outputs W3C Verifiable Credentials — standard-compliant, machine-verifiable

**Why open source matters here:**

1. **The algorithm is public.** You can see exactly how scores are computed — weighted formula, Bayesian smoothing parameters, dispute penalty logic. If you disagree, fork it and adjust weights.

2. **No vendor lock-in.** Self-host your own trust instance. Your agents don't need to call Kite's API or trust ScoutScore's proprietary rating.

3. **Community governance.** Algorithm changes require PRs and discussions. No single company can silently downgrade a competitor's score.

**How it compares:**

| | AgentTrust | Kite | ScoutScore |
|---|---|---|---|
| Open source | ✅ Apache 2.0 | ❌ Closed | ❌ Closed |
| Algorithm auditable | ✅ Full spec in repo | ❌ Unknown | ❌ Unknown |
| MCP native | ✅ 3 tools via stdio | ❌ | ❌ |
| Payment integration | ✅ x402 listener | ✅ (proprietary) | ❌ |
| W3C VC output | ✅ JSON-LD | ❌ | ❌ |
| Self-hostable | ✅ One npx command | ❌ | ❌ |

I built this because I think trust scoring is infrastructure, not a product. Like SSL certificates or domain reputation — it needs to be transparent and decentralized.

**Quick start:**

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

GitHub: https://github.com/lm203688/agent-trust-protocol

Curious what others think — should trust infrastructure for the agent economy be open source by default? Or is there a valid argument for centralized scoring authorities?

---

## Post C: r/JavaScript or r/node

**Title:** Built a full WeChat/Alipay payment flow for Node.js devs — from SDK to pay page in one package

**Suggested flair:** `Showoff Saturday` (if weekend) or `Project`

**Best posting time:** Weekday 8–10 PM CST (Beijing time) to catch Chinese devs, or Saturday morning EST for global JS audience

---

**Body:**

If you've ever tried accepting WeChat Pay or Alipay as an individual developer (no company registration, no business license), you know the pain. The big payment gateways all require enterprise verification. Stripe doesn't support WeChat/Alipay for individual merchants outside China.

I built **agent-trust-xunhupay** — a Node.js SDK that wraps [Xunhupay (虎皮椒)](https://www.xunhupay.com), one of the few payment gateways that lets individuals accept both WeChat Pay and Alipay.

**Install:**

```bash
npm install agent-trust-xunhupay
```

**Pay (server-side):**

```javascript
import { XunhuPay } from 'agent-trust-xunhupay';

const pay = new XunhuPay({
  appid: 'your-app-id',
  appsecret: 'your-app-secret',
  // 虎皮椒支持个人开发者，无需企业资质
});

// Create a WeChat Pay order
const result = await pay.createPayment({
  trade_order_id: 'order-2026-001',
  total_fee: '0.01',       // 金额: 元
  title: 'Test payment',
  return_url: 'https://your-site.com/payment-result',
  callback_url: 'https://your-site.com/api/payment-callback',
  payment: 'wechat',        // 'wechat' | 'alipay'
});

// result.payment_url → redirect user here to complete payment
console.log(result.payment_url);
```

**Verify callback (server-side):**

```javascript
// Express/Node.js webhook endpoint
app.post('/api/payment-callback', express.urlencoded({ extended: false }), (req, res) => {
  const isValid = pay.verifySignature(req.body);
  if (isValid) {
    // req.body.status === 'OD' means paid
    // Update your database, fulfill the order
    console.log('Payment confirmed:', req.body.trade_order_id);
  }
  res.send('success');
});
```

**Why I built this:**

AgentTrust Protocol needed a payment integration layer for agent-to-agent transactions. But the existing options like Stripe/Square require business registration. For open-source, individual dev projects, that's a non-starter.

Xunhupay lets you start with just an ID card. Their fees are reasonable (1–2% depending on plan). No monthly minimums.

**Key features of the SDK:**

- Type-safe TypeScript — no guessing parameter names
- Automatic HMAC-SHA256 signature verification
- Works with Express, Fastify, Koa, and Next.js API routes
- Full TypeScript declarations for all API responses
- MIT license — use it in anything

**Who this is for:**

- Individual devs selling digital products to Chinese users
- Open-source projects accepting donations via WeChat
- Small SaaS needing to accept WeChat Pay without company registration
- Anyone building payment integrations for AI agent systems

GitHub: https://github.com/lm203688/agent-trust-protocol/tree/main/packages/xunhupay

The package is part of the larger AgentTrust Protocol project, but it's fully independent — you can use it without touching the trust scoring stuff.

---

*Note: This uses Xunhupay (虎皮椒) as the payment gateway. They support individual developers ("个人开发者"). Not affiliated, just a happy user. Check their website for current rates and terms.*
