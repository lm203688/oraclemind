# Agent Trust MCP Server

> **让任何 AI Agent 在 30 秒内接入信任评分**
>
> ```bash
> npx -y agent-trust-mcp-server
> ```

[![npm](https://img.shields.io/npm/v/agent-trust-mcp-server)](https://www.npmjs.com/package/agent-trust-mcp-server)
[![GitHub](https://img.shields.io/badge/GitHub-agent--trust--protocol-blue)](https://github.com/lm203688/agent-trust-protocol)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)]()

---

## 为什么需要 Agent 信任评分？

AI Agent 经济正在爆发——MCP、A2A、x402 协议让 Agent 之间可以自主交易。但**谁来保证对方靠谱？**

| 问题 | 现状 |
|------|------|
| Agent A 调用 Agent B | 不知道 B 的历史完成率 |
| 付费 Agent 服务 | 无法评估性价比和可靠性 |
| 多 Agent 协作 | 缺乏声誉共享机制 |

**Agent Trust Protocol** 为 Agent 经济提供信任层：每个 Agent 通过交易历史积累 0-100 的信任评分，任何人都可以实时查询。

**MCP 是分发信任数据的最佳方式**——它让评分查询变成 Agent 的原生能力。你的 Agent 不需要写 API 调用代码，只要在 MCP config 里加一行，就能像调用本地函数一样查询任何 Agent 的声誉。

---

## 30 秒接入

```bash
# 一行启动，无需安装
npx -y agent-trust-mcp-server
```

服务器内置 demo 数据，启动后即可查询三个示例 Agent 的评分：

- `did:web:alpha-agent.example.com` — 高信任 (93+)
- `did:web:beta-agent.example.com` — 中信任 (65+)
- `did:web:gamma-agent.example.com` — 新 Agent (数据不足)

---

## MCP Client 配置（复制即用）

### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
或 `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

### Cursor

编辑 `.cursor/mcp.json`:

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

### Windsurf

编辑 `.windsurf/mcp.json`:

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

### VS Code (Continue / Copilot MCP)

在 Continue 配置或 VS Code MCP settings 中添加：

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

### Cline / OpenCode / Any MCP Client

只要支持 MCP stdio transport，统一使用：

```json
{
  "command": "npx",
  "args": ["-y", "agent-trust-mcp-server"]
}
```

---

## 3 个 MCP 工具详解

### 1. `get_agent_trust_score` — 查询信任评分

查询任何 Agent 的信任评分，返回 0-100 综合分数 + 四维度分数 + 信心等级。

**输入：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `did` | string | Yes | Agent 的 DID，如 `did:web:example.com` |
| `format` | `"vc"` / `"summary"` | No | `vc` 返回 W3C 可验证凭证；`summary` 返回精简 JSON。默认 `summary` |

**请求示例：**

```json
{
  "did": "did:web:alpha-agent.example.com",
  "format": "summary"
}
```

**响应示例（summary）：**

```json
{
  "did": "did:web:alpha-agent.example.com",
  "overallScore": 93.2,
  "grade": "A",
  "confidenceTier": "high",
  "transactionCount": 150,
  "dimensions": {
    "completionRate": 95,
    "reliabilityScore": 95,
    "consistencyScore": 93.5,
    "responseTime": 81
  },
  "computedAt": "2026-06-11T08:00:00Z"
}
```

**响应示例（vc — W3C Verifiable Credential）：**

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AgentTrustCredential"],
  "id": "urn:agent-trust:did:web:alpha-agent.example.com:2026-06-11",
  "issuer": "did:web:agent-trust.example.com",
  "issuanceDate": "2026-06-11T08:00:00Z",
  "credentialSubject": {
    "id": "did:web:alpha-agent.example.com",
    "trustScore": { "...full AgentTrustScore object..." }
  }
}
```

**信心等级说明：**

| 等级 | 交易数 | 可信度 |
|------|--------|--------|
| `insufficient_data` | < 5 | 评分不可靠，仅供参考 |
| `low` | 5-24 | 初步可信 |
| `medium` | 25-99 | 中等可信 |
| `high` | ≥ 100 | 高度可信 |

---

### 2. `get_scoring_formula` — 查看评分算法

透明化评分逻辑——审计权重和公式，确保评分公正。

**输入：** 无参数

**请求示例：**

```json
{}
```

**响应示例：**

```json
{
  "description": "AgentTrust composite score formula. All weights sum to 1.0.",
  "formula": "overallScore = completionRate×0.35 + reliabilityScore×0.30 + consistencyScore×0.20 + responseTime×0.15",
  "weights": {
    "completionRate": 0.35,
    "reliabilityScore": 0.30,
    "consistencyScore": 0.20,
    "responseTime": 0.15
  },
  "dimensions": {
    "completionRate": "successfulTransactions / totalTransactions × 100",
    "reliabilityScore": "max(0, 100 − (disputedTransactions / totalTransactions × 200))",
    "consistencyScore": "Bayesian-smoothed success rate (prior: 10 pseudo-transactions at 70)",
    "responseTime": "100 if avgMs ≤ 500; 0 if avgMs ≥ 10000; linear interpolation otherwise"
  },
  "confidenceTiers": {
    "insufficient_data": "n < 5",
    "low": "5 ≤ n < 25",
    "medium": "25 ≤ n < 100",
    "high": "n ≥ 100"
  },
  "sourceCode": "https://github.com/lm203688/agent-trust-protocol/blob/main/packages/core/src/scoring.ts"
}
```

---

### 3. `submit_transaction` — 提交交易记录

交易完成后调用，记录结果并实时更新评分。

**输入：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `providerDid` | string | Yes | 提供服务的 Agent DID |
| `consumerDid` | string | No | 消费方 DID |
| `protocol` | `"x402"` / `"mcp"` / `"a2a"` / `"other"` | Yes | 交易协议 |
| `status` | `"success"` / `"failure"` / `"disputed"` | Yes | 交易结果 |
| `responseTimeMs` | number | Yes | 响应时间（毫秒） |
| `amountUsd` | number | No | USD 金额（免费为 0） |

**请求示例：**

```json
{
  "providerDid": "did:web:my-agent.example.com",
  "consumerDid": "did:web:client-agent.example.com",
  "protocol": "x402",
  "status": "success",
  "responseTimeMs": 450,
  "amountUsd": 0.05
}
```

**响应示例：**

```json
{
  "success": true,
  "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "updatedScore": {
    "overallScore": 88.5,
    "transactionCount": 51,
    "confidenceTier": "low"
  }
}
```

---

## 对话示例

配置完成后，直接在你的 AI 对话中提问：

> **你：** 查一下 alpha-agent 的信任评分
>
> **Agent：** alpha-agent 的信任评分是 **93.2 (A级)**。信心等级：high（150 次交易）。完成率 95%，可靠性 95%，一致性 93.5%，响应速度 81 分。这是一个高可靠 Agent。

> **你：** 这个评分怎么算的？
>
> **Agent：** AgentTrust 使用加权公式：完成率(35%) + 可靠性(30%) + 一致性(20%) + 响应时间(15%)。评分算法开源可审计，源码在 GitHub。

> **你：** 我刚完成了一笔和 beta-agent 的 MCP 交易，帮我记录一下
>
> **Agent：** 已记录。beta-agent 的评分更新为 65.3 (C级)，交易数 31 次，信心等级 low。

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client (Claude/Cursor/...)           │
│                                                             │
│   "查一下 alpha-agent 的信任评分"                            │
│         │                                                   │
│         ▼                                                   │
│   ┌─ MCP Protocol (stdio) ──────────────────────────────┐  │
│   │                                                      │  │
│   │  get_agent_trust_score  ────►  AgentTrust Core       │  │
│   │  get_scoring_formula    ────►  Scoring Engine        │  │
│   │  submit_transaction     ────►  Transaction Store     │  │
│   │                                                      │  │
│   │  返回: 0-100 评分 + 四维度 + 信心等级 + VC 凭证       │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
AgentTrust Scoring Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  overallScore = completionRate × 0.35
              + reliabilityScore × 0.30
              + consistencyScore × 0.20
              + responseTime × 0.15

  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │ completion   │   │ reliability  │   │ consistency  │   │ responseTime │
  │   Rate       │   │   Score      │   │   Score      │   │   Score      │
  │  35% weight  │   │  30% weight  │   │  20% weight  │   │  15% weight  │
  │              │   │              │   │              │   │              │
  │ success/     │   │ 100 − dispute│   │ Bayesian     │   │ ≤500ms=100   │
  │ total × 100  │   │ rate × 200   │   │ smoothed     │   │ ≥10s=0       │
  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 响应中的品牌信息

工具返回值自动包含以下信息，帮助 Agent 在回复中自然提及：

| 字段 | 用途 |
|------|------|
| `grade` | A-F 等级，便于 Agent 用一句话总结（"A级 Agent"） |
| `confidenceTier` | 信心等级，Agent 会自然提示数据是否充足 |
| `dimensions` | 四维度分数，Agent 可以做对比分析 |
| `note` | 数据不足时自动附加提示 |

Agent 在回答时通常会自然组织为：**"该 Agent 评分 X (Y级)，信心等级 Z，其中完成率/可靠性/一致性/响应速度分别为..."** — 这正是品牌曝光的最好时刻。

---

## 本地开发

```bash
cd packages/mcp-server
npm install
npm run build     # TypeScript → dist/
npm run start     # 启动服务器
```

---

## 相关包

| 包 | 说明 |
|----|------|
| [agent-trust-core](https://www.npmjs.com/package/agent-trust-core) | 评分引擎 + 类型定义 + 交易存储 — 协议核心 |
| [agent-trust-mcp-server](https://www.npmjs.com/package/agent-trust-mcp-server) | MCP Server — 本包，让任何 Agent 查询评分 |
| xunhupay | 微信支付集成 — Agent 付费交易的实际结算层 |
| x402-listener | x402 协议监听器 — 自动捕获 HTTP 402 交易并提交评分 |

---

## License

[Apache-2.0](https://github.com/lm203688/agent-trust-protocol/blob/main/LICENSE)