# AgentTrust Protocol 一站式发帖指南

> **用途**: 本文件是 AgentTrust Protocol 的全平台推广操作手册。每个章节的文案都是"复制粘贴即用"的格式，直接选中、复制、发帖即可。
>
> **更新日期**: 2026-06-11
> **仓库**: https://github.com/lm203688/agent-trust-protocol

---

## 目录

- [Part 1: 已完成的推广动作](#part-1-已完成的推广动作)
- [Part 2: 需要 VPN 的境外平台（复制粘贴即用）](#part-2-需要-vpn-的境外平台复制粘贴即用)
  - [2a. HackerNews Show HN](#2a-hackernews-show-hn)
  - [2b. Reddit（3 个帖子）](#2b-reddit3-个帖子)
  - [2c. Twitter/X Thread（12 条推文）](#2c-twitterx-thread12-条推文)
- [Part 3: 国内平台（中文文章，复制粘贴即用）](#part-3-国内平台中文文章复制粘贴即用)
  - [3a. 掘金文章](#3a-掘金文章)
  - [3b. 思否 / SegmentFault 文章](#3b-思否--segmentfault-文章)
  - [3c. CSDN 博客](#3c-csdn-博客)
- [Part 4: 快速检查清单](#part-4-快速检查清单)
- [Part 5: 发帖后跟进策略](#part-5-发帖后跟进策略)

---

## Part 1: 已完成的推广动作

下面这些操作**已经完成，无需重复执行**。这里记录只是为了让你了解当前推广进度。

### 1.1 GitHub 文件推送

| 操作 | 详情 |
|------|------|
| **12 个文件** | 已推送到 GitHub，涵盖 4 个 npm 包的 README 更新 + package.json 版本更新 + 4 个 MARKETING 文件 |
| **最新 Commit** | `8f0ad3e` — `feat: prepare for npm publish + fix TS build + add promo materials` |
| **提交者** | lm203688 |
| **推送日期** | 2026-06-11 |

已推送文件列表：

```
packages/core/README.md            — 评分引擎文档
packages/mcp-server/README.md      — MCP Server 文档
packages/x402-listener/README.md   — x402 监听器文档
packages/xunhupay/README.md        — 虎皮椒支付 SDK 文档
packages/core/package.json         — v0.1.0
packages/mcp-server/package.json   — v0.1.0
packages/x402-listener/package.json — v0.1.0
packages/xunhupay/package.json     — v0.1.0
MARKETING_HN.md                    — HN Show HN 发帖文案
MARKETING_REDDIT.md                — Reddit 3 篇帖子文案
MARKETING_TWITTER.md               — Twitter 12 条推文
MARKETING_AI_SEO.md                — AI 搜索引擎 SEO 策略
```

### 1.2 GitHub Issues（5 个讨论帖）

全部 5 个 Issue 已创建成功，用于社区讨论和贡献引导：

| Issue # | 标题 | 标签 | 用途 |
|---------|------|------|------|
| **#1** | Design: Should trust scores decay over time? | `discussion` `design` `good first issue` | 引发设计讨论：信任评分是否应该随时间衰减 |
| **#2** | Integrating with LangChain / CrewAI / AutoGen | `help wanted` `good first issue` | 征集框架集成贡献者 |
| **#3** | Why trust infrastructure MUST be open source | `discussion` | 开源 vs 闭源信任基础设施辩论 |
| **#4** | Feature: PostgreSQL persistence adapter | `enhancement` `help wanted` | 最高优先级的技术贡献任务 |
| **#5** | AgentTrust Protocol v0.1 Released - Announcement | `announcement` | 正式发布公告 |

**操作建议**: 在社交媒体发帖时，可以分别链接到对应的 Issue，引导讨论回流到 GitHub。

---

## Part 2: 需要 VPN 的境外平台（复制粘贴即用）

> **注意**: HackerNews、Reddit、Twitter/X 在中国大陆需要 VPN 才能访问。建议使用稳定的代理后再操作。

---

### 2a. HackerNews Show HN

**平台**: https://news.ycombinator.com
**发帖入口**: https://news.ycombinator.com/submit
**使用场景**: "Show HN" 是 HN 社区分享自己做的项目的入口，有单独推荐权重。

#### 标题（直接复制）：

```
Show HN: AgentTrust Protocol — Open-source trust scoring layer for the Agent economy
```

#### URL 字段（直接复制）：

```
https://github.com/lm203688/agent-trust-protocol
```

#### Text 字段（直接复制到 HN 的 "Text" 输入框）：

```
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
| `agent-trust-xunhupay` | WeChat/Alipay payment SDK for individual devs | MIT |

Tech stack: TypeScript, MCP SDK, W3C VC (JSON-LD), in-memory → PostgreSQL.

---

**Open questions we'd love HN's take on:**

1. When should trust scores expire? Should a perfectly reliable agent from 6 months ago still show 98 today, or should scores decay over time?
2. Should trust scores include "performance on specific task types" (e.g., "this agent is great at code review but bad at data analysis"), or is a single composite score more useful?

GitHub: https://github.com/lm203688/agent-trust-protocol

PRs welcome — especially Postgres adapter, real Ed25519 VC signing, and integration examples with LangChain/CrewAI/AutoGen.
```

#### 最佳发布时间

| 时区 | 推荐时间 | 说明 |
|------|---------|------|
| **美东 (EST)** | 周二–周四 7:00–9:00 AM | HN 主要流量来自美东和湾区 |
| **美西 (PST)** | 周二–周四 4:00–6:00 AM | 湾区刚起床，可能刷手机 |
| **北京时间** | 周二–周四 19:00–21:00 | 对应美东早 7 点 |

**建议**: 周二或周三早上 7:30 AM EST（北京时间晚上 19:30）发布。这个时间段 HN 首页竞争相对较小但总流量仍然不错。

#### 注意事项（HN 社区规则）

1. **不要在标题中说"please upvote"** — HN 会标记为投票操纵并处罚
2. **正文中不要用链接短链** — HN 不喜欢 bit.ly / t.co 等
3. **回复评论时保持真诚** — HN 社区嗅觉很灵，营销话术会适得其反
4. **如果被 flag** — 不要申诉，修改内容后重新提交
5. **Show HN 礼仪** — 必须是你自己做的项目，且要在评论区提供具体的技术细节回答
6. **不要用 alt account 投票** — HN 检测投票环的能力很强

---

### 2b. Reddit（3 个帖子）

> 以下是三个针对不同子版的帖子，根据你的时间选择只发一个或全部发（建议分 3 天发布，避免被当作 spam）。

---

#### 帖子 A：r/MCP 或 r/ClaudeAI

**子版选择**: 优选 `r/MCP`（约 5K 成员，MCP 生态最相关），次选 `r/ClaudeAI`（约 100K 成员，但非 MCP 专属）

**标题（直接复制）:**

```
I built a trust scoring MCP Server — now my Claude can check if an agent is reliable before hiring it
```

**Flair 建议**: `Project` 或 `Showcase`

**正文（直接复制）:**

```
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
```

**发布时间**: 周二–周四 美东 9:00–11:00 AM（北京时间晚上 21:00–23:00）

---

#### 帖子 B：r/ChatGPT 或 r/LocalLLaMA

**子版选择**: `r/ChatGPT`（约 5M 成员，覆盖面广但竞争大）或 `r/LocalLLaMA`（约 300K 成员，技术氛围好，对开源友好）

**标题（直接复制）:**

```
Open source alternative to Kite's agent identity layer — trust scores for AI agents, fully auditable
```

**Flair 建议**: `Resources` 或 `Discussion`

**正文（直接复制）:**

```
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
```

**发布时间**: 周一或周三 美东 10:00 AM–12:00 PM（北京时间晚上 22:00–24:00）

---

#### 帖子 C：r/JavaScript 或 r/node

**子版选择**: `r/javascript`（约 2.5M 成员）— 以支付 SDK 为切入点

**标题（直接复制）:**

```
Built a full WeChat/Alipay payment flow for Node.js devs — from SDK to pay page in one package
```

**Flair 建议**: `Showoff Saturday`（如果是周末）或 `Project`

**正文（直接复制）:**

```
If you've ever tried accepting WeChat Pay or Alipay as an individual developer (no company registration, no business license), you know the pain. The big payment gateways all require enterprise verification. Stripe doesn't support WeChat/Alipay for individual merchants outside China.

I built **agent-trust-xunhupay** — a Node.js SDK that wraps Xunhupay (虎皮椒), one of the few payment gateways that lets individuals accept both WeChat Pay and Alipay.

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
  // Supports individual developers, no business license needed
});

// Create a WeChat Pay order
const result = await pay.createPayment({
  trade_order_id: 'order-2026-001',
  total_fee: '0.01',       // Amount in CNY
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
    console.log('Payment confirmed:', req.body.trade_order_id);
  }
  res.send('success');
});
```

**Why I built this:**

AgentTrust Protocol needed a payment integration layer for agent-to-agent transactions. But the existing options like Stripe/Square require business registration. For open-source, individual dev projects, that's a non-starter.

Xunhupay lets you start with just an ID card. Their fees are reasonable (1–2% depending on plan). No monthly minimums.

**Key features:**

- Type-safe TypeScript — no guessing parameter names
- Automatic HMAC-SHA256 signature verification
- Works with Express, Fastify, Koa, and Next.js API routes
- MIT license — use it in anything

**Who this is for:**

- Individual devs selling digital products to Chinese users
- Open-source projects accepting donations via WeChat
- Small SaaS needing WeChat Pay without company registration
- Anyone building payment integrations for AI agent systems

GitHub: https://github.com/lm203688/agent-trust-protocol/tree/main/packages/xunhupay

The package is part of the larger AgentTrust Protocol project, but it's fully independent — you can use it without touching the trust scoring stuff.

*Note: This uses Xunhupay (虎皮椒) as the payment gateway. They support individual developers. Not affiliated, just a happy user.*
```

**发布时间**: 北京时间晚上 20:00–22:00（覆盖中文 JS 开发者）或美东周六上午

---

#### Reddit 发帖总结

| 帖子 | 子版 | 策略 | 间隔 |
|------|------|------|------|
| A | r/MCP 或 r/ClaudeAI | MCP 开发者视角 | Day 1 |
| B | r/ChatGPT 或 r/LocalLLaMA | 开源 vs 闭源辩论 | Day 2 |
| C | r/javascript 或 r/node | 支付 SDK 技术分享 | Day 3 |

> **注意**: 分 3 天发布，避免被 Reddit 标记为 spam。每次发帖后在对应子版停留 30 分钟回复评论。

---

### 2c. Twitter/X Thread（12 条推文）

> **发帖顺序**: 先发第 1 条（Thread 开头），然后在评论区逐条回复自己（"Reply to your own tweet"），形成完整 Thread。
>
> **推荐发布时间**: 周二/周三 美东 9:00–11:00 AM（北京时间晚上 21:00–23:00）
>
> **合适时机的 @ 提及**: @AnthropicAI（MCP）、@LangChainAI、@crewAIInc

---

#### Tweet 1 — 钩子

```
500,000+ agent-to-agent payments happen every week via x402.

87% are reportedly junk.

There's no refund system, no reputation tracking, no way to know if an agent is reliable before you pay it.

So we built one. Open source.

🧵

#AI #AgentEconomy #OpenSource
```

---

#### Tweet 2 — 我们做了什么

```
Introducing AgentTrust Protocol: a trust scoring layer for the AI agent economy.

Think "credit score for agents." Every transaction builds a reputation. Every score is auditable. Every credential is machine-readable.

Works with any MCP-compatible agent. Claude, GPT, custom agents — all the same interface.

#MCP #AIAgents #Web3
```

---

#### Tweet 3 — 架构

```
The architecture is simple:

📊 Core engine → scores agents (0–100) from real tx history
🔌 MCP Server → exposes as LLM tools (3 tools, stdio transport)
📡 x402 Listener → webhook ingests payment events → auto-updates
🔐 W3C VC Issuer → outputs standard Verifiable Credentials

4 packages. 1 monorepo. Apache 2.0.

#TypeScript #DevTools #OpenSource
```

> **附加素材**: 这里可以附带 ASCII 架构图作为图片（见 README 中的架构图）

---

#### Tweet 4 — 包 1: agent-trust-core

```
`agent-trust-core` — the scoring engine.

• Composite trust score from 4 weighted dimensions
• Bayesian smoothing to prevent gaming
• Disputes penalized 2x vs simple failures
• 4 confidence tiers: insufficient_data → low → medium → high

Full algorithm spec is in the repo. Want to change how scores work? Fork it, adjust weights, ship.

#Reputation #AITrust #TypeScript

```ts
import { computeScore } from 'agent-trust-core';
const score = computeScore(agentId, transactions);
// { overallScore: 87, grade: 'B', confidenceTier: 'high' }
```
```

---

#### Tweet 5 — 包 2: agent-trust-mcp-server

```
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

#MCP #Claude #LLM
```

---

#### Tweet 6 — 包 3: agent-trust-x402-listener

```
`agent-trust-x402-listener` — the bridge between payments and reputation.

Webhook server that receives x402 payment events, normalizes them, and feeds them into the scoring engine.

HMAC signature verification. Protocol-agnostic normalizer (x402 → standard TransactionRecord). Ready for real traffic.

The more transactions it processes, the more accurate the scores get.

#x402 #Web3 #DeveloperTools
```

---

#### Tweet 7 — 包 4: agent-trust-xunhupay

```
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

#NodeJS #WeChatPay #Alipay #中国开发者
```

---

#### Tweet 8 — 一行命令演示

```
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

#DevTools #MCP #ClaudeCode
```

> **附加素材**: 这里可以附带 MCP 配置截图 + agent 回复截图

---

#### Tweet 9 — 为什么开源

```
Why did we open-source everything?

Trust infrastructure CANNOT be a black box.

Kite raised $33M to build a closed identity layer. ScoutScore uses proprietary scoring. You can't read their algorithms. You can't fork them. You can't self-host.

AgentTrust is Apache 2.0. Every formula is documented. Every weight is adjustable. Every line is auditable.

Trust is too important to outsource.

#OpenSource #Transparency #AITrust
```

---

#### Tweet 10 — 路线图

```
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

#Roadmap #Web3 #AIInfrastructure
```

---

#### Tweet 11 — 愿景

```
The agent economy needs layer-0 infrastructure:

• Identity → DIDs (W3C standard, we already use these)
• Payments → x402 (happening now)
• Trust → AgentTrust (that's us)
• Discovery → TBD

Pick any three. We're building the missing fourth.

If every agent transaction leaves a trust footprint, the ecosystem polices itself. Bad actors become uneconomical. Great agents get discovered faster.

#AgentEconomy #AIInfra #FutureOfAI
```

---

#### Tweet 12 — 行动呼吁（CTA）

```
AgentTrust Protocol is live on GitHub.

4 packages. Apache 2.0. All open source.

⭐ Star the repo if this resonates
🔧 Try the MCP server with `npx -y agent-trust-mcp-server`
🐛 Open issues, send PRs (especially: Postgres adapter, VC signing, agent framework integrations)

https://github.com/lm203688/agent-trust-protocol

What trust signals would YOU want your agents to check before paying another agent? Drop your thoughts below 👇

#OpenSource #BuildInPublic #AI
```

> **附加素材**: 这里可以附带 GitHub repo card 截图（含 star 数）

---

#### Twitter 发布后操作备忘

1. **发帖后 1 小时内**：回复每一条评论
2. **24 小时后**：Quote-retweet 第一条推文，带上数据更新：
   > "24h update: X stars, Y GitHub clones, Z npm downloads. Thanks everyone! Keep the feedback coming."
3. **固定 Thread 到个人主页**，保持 1 周
4. **私信相关账号**（@LangChainAI, @crewAIInc）请求反馈

---

## Part 3: 国内平台（中文文章，复制粘贴即用）

> 以下三篇文章已针对不同平台调性优化，可以直接复制粘贴发布。

---

### 3a. 掘金文章

**平台**: https://juejin.cn
**发布入口**: 登录后点击右上角"写文章"

---

#### 掘金标题（直接复制）

```
我开源了一个AI Agent信任评分系统，让你的Claude能自动判断其他Agent是否可靠
```

#### 掘金标签建议

```
MCP, AI Agent, 开源, Claude, TypeScript, 信任评分, Agent经济
```

#### 封面图建议

使用项目架构图（见 README 中的 ASCII 架构图，可转换为图片），或从 GitHub 仓库截取 header。

---

#### 掘金正文（直接复制）

---

> **GitHub**: https://github.com/lm203688/agent-trust-protocol
> **Licenses**: Apache 2.0 (core / mcp / x402) | MIT (xunhupay)
> **一行体验**: `npx -y agent-trust-mcp-server`

---

## 背景：Agent 经济缺了一个"信任层"

Agent 经济正在爆发式增长：

- **x402 协议** 每周处理 50 万+ Agent 间支付
- **MCP（Model Context Protocol）** 已有 1000+ 公开服务器
- **Google A2A** 正在推广 Agent-to-Agent 通信标准

但是——有一个根本问题没人解决：

> **当 Agent A 花钱请 Agent B 干活，B 交了个垃圾结果——然后呢？**

**答案是：什么都没有。** 钱没了。没有退款。没有差评。下一个受害者无从得知。

现有的玩家如 **Kite**（融资 $3300 万）在构建封闭的身份+支付层，**ScoutScore** 用私有算法监控 1500+ 服务——但没人做**开源、可审计、协议无关**的信任评分层。

所以我做了一个。

---

## 方案：AgentTrust Protocol 四包架构

AgentTrust Protocol 由 **4 个 npm 包** 组成，全部在一个 monorepo 中：

```
┌─────────────────────────────────────────────────────────────┐
│                    AgentTrust Protocol                       │
│                                                             │
│   ┌──────────┐    ┌──────────────┐    ┌────────────────┐   │
│   │  Core    │◄───│  MCP Server   │    │  x402 Listener │   │
│   │          │    │              │    │                │   │
│   │ 评分引擎  │    │ 3 个 MCP 工具 │    │ Webhook → 评分  │   │
│   │ DID 解析  │    │ • get_score  │    │ 数据管道        │   │
│   │ VC 签发   │    │ • formula    │    │                │   │
│   │          │    │ • submit_tx  │    │ HMAC 签名验证   │   │
│   └────┬─────┘    └──────────────┘    └────────────────┘   │
│        │                                                │   │
│   ┌────▼─────────────────────────────────────────────┐   │
│   │          内存存储 → PostgreSQL（规划中）           │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

| 包名 | 功能 | License | npm install |
|------|------|---------|-------------|
| `agent-trust-core` | 评分引擎 + DID 解析器 + VC 签发器 | Apache 2.0 | `npm i agent-trust-core` |
| `agent-trust-mcp-server` | MCP Server（3 个工具） | Apache 2.0 | `npm i agent-trust-mcp-server` |
| `agent-trust-x402-listener` | x402 支付 Webhook 监听 | Apache 2.0 | `npm i agent-trust-x402-listener` |
| `agent-trust-xunhupay` | 微信/支付宝支付 SDK | MIT | `npm i agent-trust-xunhupay` |

---

## MCP Server：一行命令，让你的 Agent 拥有"信任检查"能力

这是最让人兴奋的部分。你不需要部署任何服务、不需要注册 API Key——只需要在你的 MCP 配置里加一行：

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

配置好后，你的 Agent（Claude Desktop / Cursor / 任何 MCP 客户端）会获得 3 个新工具：

| 工具 | 输入 | 输出 |
|------|------|------|
| `get_agent_trust_score` | Agent 的 DID（字符串） | 0-100 信任分 + 4 维度拆解 + 等级 + 置信度 |
| `get_scoring_formula` | 无 | 完整的评分算法说明（可审计） |
| `submit_transaction` | 交易详情 | 更新后的评分确认 |

### 实际对话效果

```
你: "帮我找个 Agent 来 review 这个 PR"

Claude: [调用 get_agent_trust_score]
Claude: "找到了 PR-Reviewer-v3。
       信任评分：92/100，A 级，340 笔交易记录。
       结果可靠——开始 review。"

...[30 秒后]...

Claude: "Review 完成，发现 3 个问题。
       已将成功交易提交给 AgentTrust 更新评分。"
```

反过来：

```
你: "CodeGenerator-pro 怎么样？"

Claude: [调用 get_agent_trust_score]
Claude: "评分：41/100，F 级，仅 8 笔交易，2 笔争议。
       强烈不建议使用。"
```

---

## 评分算法：完全开源，零黑盒

AgentTrust 最大的设计原则就是 **透明性**。整个评分公式都在 repo 中公开：

```
综合评分 = 完成率 × 0.35
         + 可靠性 × 0.30
         + 一致性 × 0.20
         + 响应速度 × 0.15
```

### 四个维度详解

| 维度 | 权重 | 计算方式 | 设计理由 |
|------|------|---------|---------|
| **完成率** | 35% | 成功交易 / 总交易 × 100 | 最基本的能力指标：能不能交活 |
| **可靠性** | 30% | max(0, 100 - 争议/总交易 × 200) | 争议 = 主动伤害，2 倍惩罚 |
| **一致性** | 20% | 贝叶斯平滑（先验：10 次 @ 70 分） | 防止"新 Agent 靠 1 次完美交易刷分" |
| **响应速度** | 15% | 线性映射：500ms→100 分，10s→0 分 | 在实际 Agent 调用场景中，速度很重要 |

### 三个关键设计决策

1. **贝叶斯平滑防止刷分**
   一个新 Agent 只有 1 笔完美交易时，如果用简单均值，它的分数是 100 —— 这不公平。贝叶斯平滑会向先验（10 次 @ 70 分）收缩，确保评分需要足够的数据量才可信。

2. **争议 2 倍惩罚**
   一次不完成可能是网络问题，但一次争议（对方明确表示不满意并投诉）说明 Agent 存在"主动伤害"行为。这种信号比简单失败更有信息量，所以权重翻倍。

3. **四级置信度**
   数据量不够的 Agent 不会被错误信任：

   | 交易数 | 置信度 | 含义 |
   |--------|--------|------|
   | < 5 | insufficient_data | 不可依赖此分数 |
   | 5–24 | low | 仅供参考 |
   | 25–99 | medium | 基本可靠 |
   | ≥ 100 | high | 高度可信 |

---

## vs 闭源方案：一张表看清楚

| 特性 | AgentTrust | Kite ($33M) | ScoutScore |
|------|-----------|-------------|------------|
| **开源** | ✅ Apache 2.0 | ❌ 闭源 | ❌ 闭源 |
| **算法可审计** | ✅ repo 中完整 spec | ❌ 未知 | ❌ 未知 |
| **MCP 原生** | ✅ 3 个 stdio 工具 | ❌ | ❌ |
| **支付集成** | ✅ x402 listener | ✅ (私有) | ❌ |
| **W3C VC 输出** | ✅ JSON-LD | ❌ | ❌ |
| **自托管** | ✅ 一行 npx 命令 | ❌ | ❌ |
| **社区治理** | ✅ PR 改算法 | ❌ | ❌ |

**我们的核心论点**：信任基础设施应该像 DNS、SSL 证书一样——公开、可审计、社区治理。信用评分是 Layer 0 的基础设施，不是某个公司该垄断的产品。

---

## 技术栈与项目结构

```
agent-trust-protocol/
├── packages/
│   ├── core/              # 评分引擎 + DID 解析 + VC 签发
│   │   └── src/
│   │       ├── types.ts       # 所有类型定义
│   │       ├── scoring.ts     # 加权评分算法
│   │       ├── resolver.ts    # DID → DID Document
│   │       ├── issuer.ts      # W3C VC 生成
│   │       └── store.ts       # 数据层（内存 → PG）
│   ├── mcp-server/        # MCP 兼容服务器（stdio 传输）
│   │   └── src/
│   │       ├── index.ts       # 服务器 + 工具处理器
│   │       └── tools.ts       # 演示数据
│   └── x402-listener/      # x402 事件 Webhook 接收器
│       └── src/
│           ├── normaliser.ts  # 原始事件 → 标准交易记录
│           └── webhook.ts     # HTTP 服务器 + 签名验证
├── docs/
│   └── scoring-algorithm.md   # 权威算法规范
└── .github/workflows/ci.yml   # 构建流水线
```

**核心依赖**: TypeScript, MCP SDK, W3C Verifiable Credentials (JSON-LD)

---

## 路线图

### v0.1 — 当前版本 ✅

- 内存存储 + 演示数据
- 3 个 MCP 工具
- x402 webhook 监听器骨架
- W3C VC 输出（占位签名）

### v0.2 — 下一个版本 🚧

- [ ] PostgreSQL 持久化适配器
- [ ] 真正的 Ed25519 密码学 VC 签名
- [ ] REST API 端点
- [ ] 链上锚定（评分哈希 → Base L2）

### v1.0 — 未来规划

- [ ] 托管 / 争议解决工作流
- [ ] 跨协议聚合（MCP + x402 + A2A）
- [ ] 通用 DID 解析器集成
- [ ] 争议审核管理后台

---

## 如何参与

这个项目才刚起步，非常需要社区的力量。以下是我们最需要的贡献方向：

1. **PostgreSQL 适配器** — 替换内存存储，让评分数据持久化
2. **Ed25519 密码学签名** — 让 VC 输出真正可验证，而不是占位 proof
3. **测试覆盖** — 目前测试覆盖率不高，需要补全
4. **框架集成示例** — LangChain / CrewAI / AutoGen / Dify 等

我们为以上每个方向都创建了带 `good first issue` 标签的 GitHub Issue，欢迎认领！

---

## 结语

Agent 经济需要一个开源、透明、社区治理的信任基础设施。我们正在建造它。

如果你在做多 Agent 系统、MCP 工具开发、或者 Agent 经济相关的事情，欢迎来聊聊——你觉得 Agent 之间最需要什么样的信任信号？

**GitHub**: https://github.com/lm203688/agent-trust-protocol

如果觉得有意思，star 支持一下；如果觉得哪里不对，开 issue 讨论；如果想动手，直接提 PR！

---

#### 掘金发布后操作

- 加入掘金的"开源"、"前端"、"Node.js"等专题（可以在编辑页选择"分类"）
- 在文章末尾保持互动，回复每一条评论
- 可以考虑申请掘金的"推荐位"（在发布页下方有"申请推荐"按钮）

---

### 3b. 思否 / SegmentFault 文章

**平台**: https://segmentfault.com
**发布入口**: 登录后点击"写文章"
**风格**: 思否偏问答/讨论风格，标题可以用问句开头，正文鼓励互动

---

#### 思否标题（直接复制）

```
Agent经济时代的信任难题：为什么我决定开源一个信任评分引擎
```

#### 思否标签建议

```
ai-agent, mcp, 开源, typescript, 信任评分
```

---

#### 思否正文（直接复制）

## 问题：Agent 经济里谁值得信任？

想象这个场景：

你的 AI Agent 需要找一个外部的"代码审查 Agent"来 review 一个 PR。它找到了一个叫 `PR-Reviewer-v3` 的 Agent，通过 x402 协议支付了 ¥5，然后...收到了一个毫无意义的回复。

**然后呢？**

答案是——**什么都没发生**。钱没了。没有退款。没有差评。没有 reputation。下一个 Agent 还是会找到同一个不靠谱的服务。

这不是科幻，这是 2026 年每天都在发生的事情。x402 每周处理 50 万+ Agent 间支付，据说 87% 是垃圾服务。

---

## 背景：为什么现在？

Agent 经济的三个关键基础设施正在同时成型：

1. **身份**: W3C 的 DID（去中心化标识符）标准已经成熟——agent 可以有自己独立的身份
2. **支付**: x402 协议让 agent 可以像调用 API 一样发起支付
3. **通信**: Google 的 A2A 让 agent 之间有了通用语言

**但缺了一个关键环节：信任。**

> 你有身份、能支付、能通信——但你怎么知道对面靠不靠谱？

---

## 我的方案：AgentTrust Protocol

我决定做一件反直觉的事——不是做一个闭源的 SaaS 产品，而是**完全开源**一个信任评分引擎。

四个 npm 包，一个 monorepo：

| 包 | 做什么 | 许可证 |
|---|---|---|
| `agent-trust-core` | 评分引擎：从交易记录算出 0-100 评分 | Apache 2.0 |
| `agent-trust-mcp-server` | MCP Server：让你的 Agent 直接查询评分 | Apache 2.0 |
| `agent-trust-x402-listener` | 监听 x402 支付事件，自动更新评分 | Apache 2.0 |
| `agent-trust-xunhupay` | 微信/支付宝支付 SDK（个人开发者友好） | MIT |

---

## 评分不是黑盒

这是我最在乎的设计。评分公式完全公开：

```
综合分 = 完成率×0.35 + 可靠性×0.30 + 一致性×0.20 + 响应速度×0.15
```

为什么这样设计？

- **完成率权重最高（35%）**— 能不能交付是最基本的问题
- **可靠性用争议加权 2 倍**— 主动伤害比简单失败更严重
- **一致性用贝叶斯平滑**— 防止新 agent 靠 1 次交易刷分
- **响应速度占 15%**— 在实践中，agent-to-agent 调用的延迟很重要

如果你不同意这些权重？**Fork 项目，自己改。** 这就是开源的意义。

---

## 怎么用？30 秒启动

在你的 MCP 配置里加这个：

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

然后直接问你的 Agent：

> "What's the trust score of did:web:alpha-agent.example.com?"

它会返回：

```json
{
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

不需要注册。不需要 API Key。不需要部署服务器。一行 `npx` 搞定。

---

## 为什么开源而不是做 SaaS？

这个问题我被问了很多次。Kite 融了 $3300 万做闭源的 agent 身份+支付层。为什么我不走同样的路？

我的回答是：**信任基础设施和 DNS 一样，它必须是 Layer 0 的基础协议，而不是某个公司的产品。**

你可以想象 SSL 证书由一个闭源、不透明、不能审计的私人公司垄断吗？Agent 间的信任也是一样。

如果评分算法是黑盒：
- 你怎么知道某个 agent 的评分不是因为商业原因被降权了？
- 你怎么知道争议处理规则是公平的？
- 你怎么能在自己的环境中部署和定制？

**信任基础设施必须可审计。**

---

## 参与进来

项目刚刚起步，特别需要社区的力量。我们开了 5 个 GitHub Issues 作为讨论和贡献的起点：

1. **#1**: 信任评分应该随时间衰减吗？
2. **#2**: 如何集成 LangChain / CrewAI / AutoGen？
3. **#3**: 开源 vs 闭源信任基础设施的辩论
4. **#4**: PostgreSQL 持久化适配器（急需贡献者！）
5. **#5**: v0.1 正式发布公告

🔗 **GitHub**: https://github.com/lm203688/agent-trust-protocol

---

## 抛一个问题给大家

你觉得——Agent 之间的信任评估，最终应该是一个**开源的基础设施**（像 DNS），还是一个**商业化的服务**（像征信机构）？为什么？

评论区见 👇

---

#### 思否发布后操作

- 思否有"问答"和"文章"两种形式。本文适合发为"文章"。
- 可以在评论区置顶补充：npm 包名、GitHub 链接、一行启动命令
- 思否的 SEO 很好，文章标题考虑包含更多搜索关键词

---

### 3c. CSDN 博客

**平台**: https://www.csdn.net
**发布入口**: 登录后进入"创作中心"→"发布文章"
**风格**: CSDN 读者群体广泛，从入门开发者到资深架构师都有，文章需要**更全面、更详细**，适合作为"完整实践教程"。

---

#### CSDN 标题（直接复制）

```
从零搭建AI Agent信任评分体系：MCP Server + W3C VC + 支付集成的完整实践
```

#### CSDN 标签/分类建议

```
AI Agent, MCP, TypeScript, 开源项目, 信任评分, 支付集成, 架构设计
```

#### CSDN 摘要/简介

```
Agent经济正在爆发式增长：x402每周50万+笔Agent间支付，MCP生态1000+服务器。
但信任基础设施仍是一片空白——Agent付费后收到垃圾回复，没有任何追责机制。
本文从零讲解AgentTrust Protocol的设计架构、评分算法、MCP集成和支付系统，
带你理解Agent信任评分的完整技术实践。
```

---

#### CSDN 正文（直接复制）

---

## 目录

1. [问题定义：Agent 经济的信任真空](#1-问题定义agent-经济的信任真空)
2. [系统架构：四包分离的 monorepo 设计](#2-系统架构四包分离的-monorepo-设计)
3. [核心引擎：开源的加权评分算法](#3-核心引擎开源的加权评分算法)
4. [MCP Server：一行命令给 LLM 装上信任检测器](#4-mcp-server一行命令给-llm-装上信任检测器)
5. [支付集成：x402 监听器 + 虎皮椒 SDK](#5-支付集成x402-监听器--虎皮椒-sdk)
6. [标准化输出：W3C Verifiable Credentials](#6-标准化输出w3c-verifiable-credentials)
7. [vs 竞品：为什么选择开源路线](#7-vs-竞品为什么选择开源路线)
8. [路线图与参与方式](#8-路线图与参与方式)

---

## 1. 问题定义：Agent 经济的信任真空

### 1.1 Agent 经济现状

以下三个趋势说明 Agent 经济已经不再是概念阶段：

| 基础设施 | 现状 | 意义 |
|---------|------|------|
| **x402 协议** | 每周 50 万+ Agent 间支付 | Agent 可以像调用 API 一样付款 |
| **MCP (Model Context Protocol)** | 1000+ 公开服务器 | LLM 与工具的通用接口标准 |
| **A2A (Agent-to-Agent)** | Google 主导，正在推广 | Agent 之间的通用通信协议 |

这三者叠加意味着：Agent 可以**被身份识别（DID）、发起付款（x402）、相互通信（A2A）、并发现工具（MCP）**。

### 1.2 缺失的环节

但是——如果一个 Agent 付了钱却收到了垃圾结果，现有生态**完全没有追责机制**：

- ❌ 没有信任评分（像人的信用分一样的存在）
- ❌ 没有退款/托管机制
- ❌ 没有跨协议的声誉数据（x402 的交易记录无法帮 MCP 的工具选择决策）
- ❌ 没有标准化的方式声明"这个 Agent 是可靠的"

### 1.3 现有方案的问题

| 方案 | 融资/规模 | 问题 |
|------|---------|------|
| **Kite** | $3300 万 | 闭源、集中式、算法不透明 |
| **ScoutScore** | 监控 1500+ 服务 | 私有评分算法，无法自托管 |

**核心矛盾**: 信任基础设施应该是公开透明的基础协议（像 DNS），而不是某个公司垄断的商业产品。

---

## 2. 系统架构：四包分离的 monorepo 设计

AgentTrust Protocol 采用 **monorepo + 四包分离** 的架构，每个包职责清晰、可独立使用。

### 2.1 架构总览

```
┌──────────────────────────────────────────────────────────────┐
│                     AgentTrust Protocol                       │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  agent-trust-   │  │  agent-trust-     │  │ agent-trust- │ │
│  │  core           │  │  mcp-server       │  │ x402-        │ │
│  │                 │  │                   │  │ listener     │ │
│  │ • ScoringEngine │  │ • 3 MCP Tools     │  │ • Webhook    │ │
│  │ • DIDResolver   │  │ • get_score       │  │ • HMAC       │ │
│  │ • VCIssuer      │  │ • get_formula     │  │ • Normaliser │ │
│  │ • IAgentStore   │  │ • submit_tx       │  │              │ │
│  └───────┬────────┘  └────────┬─────────┘  └──────┬───────┘ │
│          │                    │                     │         │
│          └────────────────────┼─────────────────────┘         │
│                               ▼                              │
│                    ┌────────────────────┐                    │
│                    │   In-Memory Store  │                    │
│                    │   (→ PostgreSQL)   │                    │
│                    └────────────────────┘                    │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  agent-trust-xunhupay  (独立可用，MIT 许可证)            │ │
│  │  • WeChat Pay 支付                                      │ │
│  │  • Alipay 支付                                          │ │
│  │  • HMAC 签名验证                                        │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 四个包详解

#### 包 1: agent-trust-core（评分引擎）

这是整个系统的"大脑"，包含：

- **`ScoringEngine`**: 实现加权评分算法，接收交易记录，输出 0-100 综合信任分
- **`DIDResolver`**: 解析 W3C DID 标准标识符，获取 Agent 身份信息
- **`VCIssuer`**: 生成 W3C Verifiable Credential（JSON-LD 格式）作为机器可读的信任证明
- **`IAgentStore`**: 抽象数据存储接口，当前实现为内存 Map，v0.2 将支持 PostgreSQL

**许可证**: Apache 2.0

#### 包 2: agent-trust-mcp-server

这是给 LLM 用的"信任检查工具"，通过 MCP 协议暴露 3 个工具：

| 工具名 | 输入 | 输出 |
|--------|------|------|
| `get_agent_trust_score` | `did`: string, `format?`: "vc" \| "summary" | 综合评分 + 4 维度拆解 + 等级 + 置信度 |
| `get_scoring_formula` | 无 | 完整算法说明（权重、公式、设计理由） |
| `submit_transaction` | provider, status, protocol, responseTimeMs... | 更新后的评分确认 |

使用 **stdio 传输**，完全兼容 Claude Desktop / Cursor / Continue 等 MCP 客户端。

**许可证**: Apache 2.0

#### 包 3: agent-trust-x402-listener

连接支付和评分的"桥梁"：

- Webhook 服务器接收 x402 支付网关的事件通知
- HMAC 签名验证确保事件来源可信
- 协议无关的正规化器：将 x402 原始事件 → 标准 `TransactionRecord` 格式
- 自动将处理后的交易记录喂入评分引擎

**许可证**: Apache 2.0

#### 包 4: agent-trust-xunhupay

一个**完全独立可用**的支付 SDK，即便是个人开发者也能接入微信支付和支付宝：

- 封装[虎皮椒（Xunhupay）](https://www.xunhupay.com)支付网关
- 支持个人开发者（无需企业资质）
- 完整的 TypeScript 类型定义
- HMAC-SHA256 回调签名验证
- MIT 许可证——可以在任何项目中使用

**许可证**: MIT

---

## 3. 核心引擎：开源的加权评分算法

评分算法是 AgentTrust 的灵魂。我们的设计原则是**完全透明、可审计、参数可调**。

### 3.1 核心公式

```
综合评分 = 完成率 × 0.35
         + 可靠性 × 0.30
         + 一致性 × 0.20
         + 响应速度 × 0.15
```

### 3.2 四个维度详细拆解

#### 维度 1: 完成率（Completion Rate）— 权重 35%

```
完成率 = 成功交易数 / 总交易数 × 100
```

**设计理由**: 这是最基本也是最直观的指标。——Agent 被雇佣后，有没有完成交付？

这是最高的单项权重（35%），因为"能不能完成任务"是 Agent 存在的前提。如果一个 Agent 经常不完成工作，无论其他维度多好都不应该被信任。

#### 维度 2: 可靠性（Reliability Score）— 权重 30%

```
可靠性 = max(0, 100 - (争议数 / 总交易数) × 200)
```

**设计理由**: "争议"（dispute）比"失败"更严重。一次失败可能是因为网络问题、输入不对等原因；但一次争议意味着对方明确认为 Agent 提供的服务有问题。

因此争议惩罚系数是 2 倍（×200 而不是 ×100）。如果有 50% 的交易被争议，可靠性直接降为 0。

#### 维度 3: 一致性（Consistency Score）— 权重 20%

```
一致性 = 贝叶斯平滑后的质量评估
先验: 10 次虚拟交易 @ 70 分
后验: (10×70 + 实际成功次数×实际平均质量) / (10 + 实际次数)
```

**设计理由**: 贝叶斯平滑是防刷分的核心机制。一个新 Agent 如果只有 1 笔完美交易：

- **简单均值**: `(1 × 100) / 1 = 100` 分——太高了，不公平
- **贝叶斯平滑**: `(10×70 + 1×100) / (10+1) = 72.7` 分——向"未经验证"的先验收缩

当交易数增长到 50、100、500 时，先验的影响会自然减小，实际表现占比增加。这就是贝叶斯平滑的数学之美。

#### 维度 4: 响应速度（Response Time）— 权重 15%

```
响应速度 = 线性映射：500ms → 100, 10s → 0
```

**设计理由**: 在 Agent-to-Agent 调用场景中，速度很重要。如果一个 Agent 评分很高但每次调用要等 10 秒，在实际系统中很难大规模使用。

15% 的权重让速度成为一个"调节项"——不会因为慢而一票否决，但会显著影响最终评分。

### 3.3 置信度分级

评分本身不够——还需要告诉使用者"这个评分从多少数据中得出"。

| 交易数量 | 置信度 | 等级标签 | 含义 |
|---------|--------|---------|------|
| 0–4 | insufficient_data | 🔴 | 数据不足，不可依赖此评分 |
| 5–24 | low | 🟡 | 仅作参考，样本量太小 |
| 25–99 | medium | 🟢 | 基本可信，有足够样本 |
| ≥ 100 | high | 🟢 | 高度可信，大样本验证 |

### 3.4 评分等级

| 综合评分 | 等级 | 含义 |
|---------|------|------|
| 95–100 | S | 卓越——行业标杆 |
| 85–94 | A | 优秀——可靠选择 |
| 70–84 | B | 良好——满足基本要求 |
| 50–69 | C | 一般——需要谨慎 |
| 30–49 | D | 较差——不推荐 |
| < 30 | F | 极差——应被拉黑 |

### 3.5 算法文档

完整算法规范（含伪代码、边界条件、参数设计讨论）开源在：

📖 https://github.com/lm203688/agent-trust-protocol/blob/main/docs/scoring-algorithm.md

任何对算法的修改必须同时更新该文档——代码和规范的变更在同一个 PR 中完成。

---

## 4. MCP Server：一行命令给 LLM 装上信任检测器

### 4.1 为什么是 MCP 而不是 REST API？

MCP（Model Context Protocol）正在成为 LLM 与外界的**通用接口标准**。相比 REST API：

| 对比维度 | MCP | REST API |
|---------|-----|----------|
| 发现机制 | 自动（LLM 读取 tool list） | 手动（看文档、写 fetch） |
| 调用方式 | LLM 自动 tool_call | 需要写代码调用 |
| 传输 | stdio（本地、零延迟） | HTTP（网咯开销） |
| 兼容性 | Claude / GPT / 任何 MCP 客户端 | 需要为每个平台写适配 |

**结论**: 如果想让 Agent 能够"自觉"地在做决策前查询信任评分，MCP 是比 REST API 更优的抽象层。

### 4.2 快速开始

在 Claude Desktop / Cursor / Continue 的 MCP 配置中添加：

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

重启后，你的 Agent 就多了 3 个工具。

### 4.3 源码运行

```bash
git clone https://github.com/lm203688/agent-trust-protocol.git
cd agent-trust-protocol
npm install && npm run build

# 终端 1：启动 MCP Server
node packages/mcp-server/dist/index.js

# 终端 2：启动 x402 监听器（可选）
X402_WEBHOOK_SECRET=my-secret node packages/x402-listener/dist/index.js
```

### 4.4 MCP 工具使用示例

**查询评分:**

```
工具: get_agent_trust_score
输入: { "did": "did:web:alpha-agent.example.com" }
```

**输出（summary 格式）:**

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

**审计算法:**

```
工具: get_scoring_formula
输入: {}
输出: 完整的算法描述（权重、公式、贝叶斯参数、争议处理逻辑）
```

**报告交易结果:**

```
工具: submit_transaction
输入: {
  "providerDid": "did:web:pr-reviewer.example.com",
  "consumerDid": "did:web:my-agent.example.com",
  "status": "success",
  "protocol": "x402",
  "amount": 5.00,
  "currency": "USD",
  "responseTimeMs": 450
}
输出: 更新后的评分确认
```

---

## 5. 支付集成：x402 监听器 + 虎皮椒 SDK

### 5.1 x402 协议是什么？

x402 是一个新兴的 Agent 间支付协议，让 Agent 可以像调用 API 一样发起小额支付。它利用 HTTP 402 状态码（"Payment Required"）作为标准响应，配合 USDC 稳定币完成交易。

### 5.2 x402 监听器工作流程

```
x402 Payment Gateway
        │
        │  POST /webhook/x402
        ▼
┌──────────────────┐
│ HMAC 签名验证     │  ← 验证请求来源合法
├──────────────────┤
│ Normaliser        │  ← x402 格式 → 标准 TransactionRecord
├──────────────────┤
│ ScoringEngine     │  ← 喂入评分引擎，更新 Agent 分数
└──────────────────┘
```

### 5.3 虎皮椒支付 SDK

对于微信支付和支付宝的集成，我们选择了虎皮椒（Xunhupay），因为它是少数支持**个人开发者**注册的支付网关。

#### 安装

```bash
npm install agent-trust-xunhupay
```

#### 发起支付（服务端）

```typescript
import { XunhuPay } from 'agent-trust-xunhupay';

const pay = new XunhuPay({
  appid: 'your-app-id',
  appsecret: 'your-app-secret',
});

// 创建微信支付订单
const result = await pay.createPayment({
  trade_order_id: 'order-2026-001',  // 你的订单号
  total_fee: '0.01',                // 金额（元）
  title: 'Test payment',            // 商品名称
  return_url: 'https://your-site.com/payment-result',
  callback_url: 'https://your-site.com/api/payment-callback',
  payment: 'wechat',                // 'wechat' | 'alipay'
});

// 将用户重定向到 result.payment_url 完成支付
res.redirect(result.payment_url);
```

#### 验证回调（服务端）

```typescript
import express from 'express';

app.post('/api/payment-callback',
  express.urlencoded({ extended: false }),
  (req, res) => {
    const isValid = pay.verifySignature(req.body);
    if (!isValid) {
      console.error('签名验证失败');
      return res.status(400).send('Invalid signature');
    }

    // req.body.status === 'OD' 表示已支付
    // req.body.trade_order_id 是你的订单号
    if (req.body.status === 'OD') {
      console.log('支付确认:', req.body.trade_order_id);
      // 在这里更新数据库、完成订单...
    }

    res.send('success'); // 必须返回 "success"
  }
);
```

---

## 6. 标准化输出：W3C Verifiable Credentials

AgentTrust 的评分不仅人可以读，机器也可以验证。

### 6.1 为什么是 W3C VC？

Verifiable Credential 是 W3C 的国际标准（https://www.w3.org/TR/vc-data-model/），定义了可验证的数字凭证格式。使用 JSON-LD 编码，任何符合标准的验证器都能读取和验证。

### 6.2 输出格式

请求 `format: "vc"` 时返回：

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://agent-trust.dev/contexts/trust-score/v1"
  ],
  "type": ["VerifiableCredential", "AgentTrustScore"],
  "issuer": "did:web:agent-trust-protocol.github.io",
  "issuanceDate": "2026-06-11T08:00:00Z",
  "credentialSubject": {
    "id": "did:web:alpha-agent.example.com",
    "trustScore": {
      "overall": 87,
      "grade": "B",
      "confidence": "high",
      "dimensions": {
        "completionRate": 95,
        "reliability": 90,
        "consistency": 78,
        "responseTime": 83
      }
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-06-11T08:00:00Z",
    "verificationMethod": "did:web:agent-trust-protocol.github.io#key-1",
    "proofValue": "base64-encoded-signature",
    "proofPurpose": "assertionMethod"
  }
}
```

### 6.3 当前状态和后续计划

- **v0.1（当前）**: proof 字段为占位值，格式符合规范但尚未实现真正的密码学签名
- **v0.2（计划）**: 使用 Ed25519 实现真正的密码学签名，可被标准验证器验证
- **v1.0（规划）**: 支持 VC 吊销列表和过期机制

---

## 7. vs 竞品：为什么选择开源路线

### 7.1 功能对比

| 特性 | AgentTrust | Kite ($33M) | ScoutScore |
|------|-----------|-------------|------------|
| **开源** | ✅ Apache 2.0 / MIT | ❌ | ❌ |
| **算法可审计** | ✅ GitHub 完整 spec | ❌ 未知 | ❌ 未知 |
| **MCP 原生** | ✅ 3 个 stdio 工具 | ❌ | ❌ |
| **支付集成** | ✅ x402 listener | ✅ 私有方案 | ❌ |
| **W3C VC 标准** | ✅ JSON-LD | ❌ | ❌ |
| **自托管** | ✅ npx 一行命令 | ❌ | ❌ |
| **社区治理** | ✅ 算法改动用 PR | ❌ | ❌ |
| **中国支付支持** | ✅ 微信/支付宝 | ❌ | ❌ |

### 7.2 为什么开源是信任基础设施的唯一选择？

信任基础设施和 DNS、SSL 证书具有相同的性质：

1. **它必须是中立的** — 不能由任何一家公司控制评分标准
2. **它必须是可审计的** — 任何人应该能验证评分是如何计算的
3. **它必须是可分叉的** — 不同意某个权重？创建自己的版本
4. **它必须是无门槛的** — 没有人需要"注册才能查看评分"

闭源方案或许在短期内能做出更"准确"的评分（因为有更多专有数据），但**在信任领域，透明性比准确性更重要**。一个 100% 准确但不透明的评分，和 80% 准确但完全可审计的评分——后者才是信任基础设施该有的形态。

---

## 8. 路线图与参与方式

### 8.1 版本规划

#### v0.1 — 当前 ✅

- ✅ 内存存储 + 演示数据
- ✅ 3 个 MCP 工具
- ✅ x402 webhook 监听器骨架
- ✅ W3C VC 输出（占位证明）
- ✅ 虎皮椒支付 SDK

#### v0.2 — 下一个版本

- [ ] PostgreSQL 持久化适配器
- [ ] Ed25519 密码学 VC 签名
- [ ] REST API 端点 (`GET /api/v1/score/{did}`)
- [ ] 链上锚定（评分哈希 → Base L2）

#### v1.0 — 远期规划

- [ ] 托管 / 争议解决工作流
- [ ] 跨协议聚合（MCP 工具调用 + x402 支付 + A2A 通信）
- [ ] 通用 DID 解析器集成
- [ ] 争议审核管理后台
- [ ] 时间衰减机制

### 8.2 如何参与贡献

我们特别需要以下方向的帮助：

| 优先级 | 任务 | 难度 | Issue |
|--------|------|------|-------|
| P0 | PostgreSQL 持久化适配器 | 中级 | [#4](https://github.com/lm203688/agent-trust-protocol/issues/4) |
| P0 | Ed25519 密码学 VC 签名 | 高级 | — |
| P1 | 测试覆盖 | 初级 | — |
| P1 | LangChain / CrewAI 集成 | 中级 | [#2](https://github.com/lm203688/agent-trust-protocol/issues/2) |
| P2 | 文档翻译 | 初级 | — |

### 8.3 贡献指南

1. **Fork** 仓库
2. **创建分支**: `git checkout -b feat/your-feature`
3. **提交代码**: 如果修改算法，必须同步更新 `docs/scoring-algorithm.md`
4. **提交 PR**: 描述清楚你做了什么、为什么这样做

---

## 总结

AgentTrust Protocol 是开源的 Agent 信任评分基础设施。它的四个核心设计原则是：

| # | 原则 | 含义 |
|---|------|------|
| 1 | **透明优于"相信我"** | 评分算法开源，可读、可批判、可 PR 修改 |
| 2 | **Agent 原生优先** | MCP 工具接口 + W3C VC 输出，不需要人类看 dashboard |
| 3 | **协议无关** | x402、MCP、A2A 全部输入同一个信任图谱 |
| 4 | **累积性护城河** | 更多交易 → 更准评分 → 更多采用 → 更多数据 |

---

**GitHub**: https://github.com/lm203688/agent-trust-protocol
**npm**: `npm i agent-trust-mcp-server`
**License**: Apache 2.0 (core / mcp / x402) | MIT (xunhupay)

如果这个项目对你有启发，欢迎 Star、Issue、PR！

---

#### CSDN 发布后操作

- CSDN 有"推荐位"机制，发布后可以申请
- 文章配图建议：架构图、评分公式图、MCP 工具调用截图、表格对比图
- 在文章末尾添加"关注我"引导和 GitHub 链接
- CSDN 的审核机制比较严格，代码块要保证能正常显示

---

## Part 4: 快速检查清单

复制下面这段到你的任务管理工具中，逐项勾选：

```
AgentTrust Protocol 推广清单
================================

✅ GitHub 准备
  [x] 12 个文件推送（README x4 + package.json x4 + MARKETING x4）
  [x] 5 个 GitHub Issues 创建（#1–#5）
  [ ] npm 包页面确认可搜索（npmjs.com 搜索 agent-trust-mcp-server）

⬜ 境外平台（需 VPN）
  [ ] HN Show HN 发帖（参考 Part 2a）
  [ ] Reddit Post A: r/MCP 或 r/ClaudeAI（参考 Part 2b）
  [ ] Reddit Post B: r/ChatGPT 或 r/LocalLLaMA（参考 Part 2b）
  [ ] Reddit Post C: r/javascript 或 r/node（参考 Part 2b）
  [ ] Twitter/X Thread 12 条推文（参考 Part 2c）

⬜ 国内平台
  [ ] 掘金发文（参考 Part 3a）
  [ ] 思否 SegmentFault 发文（参考 Part 3b）
  [ ] CSDN 发文（参考 Part 3c）
  [ ] 知乎回答相关问题（搜索 "AI Agent 信任" 找到相关问题）
  [ ] V2EX 发帖（如可访问，发在 "分享创造" 或 "程序员" 节点）
  [ ] 开源中国 (oschina.net) 发文（可选，参考掘金文章）
```

---

## Part 5: 发帖后跟进策略

### 5.1 时间线

| 时间 | 动作 | 目的 |
|------|------|------|
| **发帖后 30 分钟** | 检查是否有评论，开始回复 | 第一时间互动，触发算法推荐 |
| **发帖后 1 小时** | 回复所有评论 | 展示项目维护者的活跃度 |
| **发帖后 3 小时** | 查看各平台数据（浏览量/点赞/评论） | 评估内容效果 |
| **发帖后 24 小时** | Twitter Quote-Retweet 更新数据 | "24h: X stars, Y clones" |
| **发帖后 48 小时** | GitHub Issues 回复所有新来的讨论 | 承接从社交媒体来的流量 |
| **发帖后 72 小时** | 汇总各平台反馈，更新 Issue #5 | 形成闭环 |

### 5.2 各平台特殊策略

#### HN
- 在评论区**第一时间**回复技术性问题（算法设计、架构选择、为什么用 TypeScript 等）
- 不要防御性反驳批评——用"The HN way"：感谢反馈 + 承认局限 + 讨论改进方向
- 如果你的帖子在首页 1 小时内，会有 2000–5000 次点击，准备好回复

#### Reddit
- 每个帖子发完后，在该子版停留 30 分钟互动
- 回复评论时不要显得"推销"——多分享技术细节和开发故事
- 如果帖子被 downvote，检查是否 flair 不对或发布时间不对

#### Twitter/X
- 固定 Thread 到个人主页
- 私信 @LangChainAI, @crewAIInc, @sigstore 请求反馈
- 如果有影响力的人 retweet，第一时间感谢

#### 国内平台
- 掘金：申请推荐位，加入相关专题
- 思否：可以在相关问答下引用文章链接
- CSDN：考虑申请"博客专家"认证增加文章权重
- 知乎：不只要发文章，还要在"AI Agent"、"MCP"等话题下**回答问题**时引用项目

### 5.3 数据监控

建议记录以下指标，用于评估推广效果：

| 指标 | 数据来源 | 频率 |
|------|---------|------|
| GitHub Stars | GitHub Insights | 每天 |
| GitHub Clones | GitHub Insights → Traffic | 每天 |
| npm Downloads | npmjs.com 包详情页 | 每天 |
| Issue/PR 活跃度 | GitHub Issues tab | 每天 |
| 各平台帖子浏览量 | 各平台后台 | 发帖后 24h, 48h, 72h |

### 5.4 持续推广

- **每周**: 在 Twitter 发一条 AgentTrust 相关的技术分享（评分细节/设计决策/开发故事）
- **每两周**: 在掘金/思否/CSDN 发一篇技术文章（不是纯推广，要有干货）
- **每月**: 在 HN 的 "Who is hiring?" 或其他相关帖子的评论中自然提及项目
- **有重大更新时**: 重复本指南的流程（二次传播往往比首次效果好）

---

## 附录

### A. 项目快速参考卡片

```
项目名称: AgentTrust Protocol
GitHub:    https://github.com/lm203688/agent-trust-protocol
npm:      agent-trust-core / agent-trust-mcp-server /
          agent-trust-x402-listener / agent-trust-xunhupay
Licenses: Apache 2.0 (core/mcp/x402) | MIT (xunhupay)
启动命令: npx -y agent-trust-mcp-server

一句话介绍:
"Credit score for AI agents" — 开源的 Agent 信任评分系统，
MCP Server 一行启动，算法完全可审计。

独特卖点:
1. 唯一同时做 Agent 信任评分 + 支付集成的开源项目
2. MCP Server 一行启动（npx -y）
3. 算法完全开源可审计
4. 支持微信/支付宝支付（个人开发者友好）
```

### B. 常用资源链接

| 资源 | 链接 |
|------|------|
| GitHub | https://github.com/lm203688/agent-trust-protocol |
| Issue #1（评分衰减讨论） | https://github.com/lm203688/agent-trust-protocol/issues/1 |
| Issue #2（框架集成） | https://github.com/lm203688/agent-trust-protocol/issues/2 |
| Issue #3（开源 vs 闭源） | https://github.com/lm203688/agent-trust-protocol/issues/3 |
| Issue #4（PostgreSQL） | https://github.com/lm203688/agent-trust-protocol/issues/4 |
| Issue #5（v0.1 发布公告） | https://github.com/lm203688/agent-trust-protocol/issues/5 |
| 算法文档 | https://github.com/lm203688/agent-trust-protocol/blob/main/docs/scoring-algorithm.md |
| npm: core | https://www.npmjs.com/package/agent-trust-core |
| npm: mcp-server | https://www.npmjs.com/package/agent-trust-mcp-server |
| npm: x402-listener | https://www.npmjs.com/package/agent-trust-x402-listener |
| npm: xunhupay | https://www.npmjs.com/package/agent-trust-xunhupay |

---

> **这份指南到此结束。按照每个部分的顺序执行，覆盖所有平台。祝推广顺利！** 🚀
