# AgentTrust Protocol — 商业逻辑测试报告

## 测试时间

**执行时间：** 2026-06-13 08:37:28 UTC+8  
**测试脚本：** `_integration_test.mjs`（Node.js ESM，直接从 `packages/core/dist/` 导入）

---

## 测试环境

| 项目 | 详情 |
|------|------|
| 操作系统 | Windows 11 Home China |
| Node.js | v22.22.2（`C:\Users\ThinkPad\.workbuddy\binaries\node\versions\22.22.2\node.exe`） |
| 运行方式 | `node _integration_test.mjs`（直接加载已编译的 `dist/` ESM 模块） |
| 构建状态 | `packages/core/dist/` 已存在，包含完整编译产物 |
| 测试覆盖包 | `@agent-trust/core`（scoring、store、issuer）、`xunhupay`（sign、callback）、`x402-listener`（normaliser）、`mcp-server`（tools 逻辑） |

---

## 总体结果

| 指标 | 数值 |
|------|------|
| 总断言数 | 62 |
| 通过 | **62** ✅ |
| 失败 | 0 |
| 通过率 | **100.0%** |

---

## 1. 评分引擎测试结果（packages/core/src/scoring.ts）

### 1.1 测试用例明细

| 测试 | 输入 | 预期 | 实际 | 状态 |
|------|------|------|------|------|
| T1: 空记录 | records = [] | overallScore=0, confidenceTier=insufficient_data, transactionCount=0 | overallScore=0, confidenceTier=insufficient_data, transactionCount=0 | ✅ PASS |
| T2: 3条成功 | 3x success, responseTimeMs=500 | confidenceTier=insufficient_data（<5条阈值）, overallScore>0 | confidenceTier=insufficient_data, overallScore=95 | ✅ PASS |
| T3: 10成功+2失败 | 10x success(600ms) + 2x failure(1200ms) | confidenceTier=low, transactionCount=12, overallScore∈[60,90], completionRate=83 | confidenceTier=low, transactionCount=12, overallScore=89, completionRate=83 | ✅ PASS |
| T4: 含纠纷记录 | 8x success + 2x disputed | reliabilityScore(无纠纷)=100 > reliabilityScore(有纠纷)=60 | 无纠纷=100, 有纠纷=60 | ✅ PASS |
| T5: 超快vs超慢 | fast=100ms / slow=15000ms | fast.responseTime=100, slow.responseTime=0, 差值>50 | fast=100, slow=0, 差=100 | ✅ PASS |

### 1.2 评分算法验证

| 维度 | 算法 | 权重 | 验证结果 |
|------|------|------|---------|
| completionRate | successCount / totalCount × 100 | 0.35 | ✅ 正确 |
| reliabilityScore | max(0, 100 − disputeCount/totalCount × 200) | 0.30 | ✅ 正确 |
| consistencyScore | Bayesian 平滑（prior: 10条@70分） | 0.20 | ✅ 正确 |
| responseTime | 线性插值（≤500ms→100, ≥10000ms→0） | 0.15 | ✅ 正确 |
| **weights之和** | 0.35+0.30+0.20+0.15 | — | **= 1.0000** ✅ |

### 1.3 置信度分层验证

| 分层 | 阈值 | 验证 |
|------|------|------|
| insufficient_data | n < 5 | ✅ n=0,3 均正确分层 |
| low | 5 ≤ n < 25 | ✅ n=10,12,15 均正确分层 |
| medium | 25 ≤ n < 100 | （逻辑推断正确，超出测试样本范围） |
| high | n ≥ 100 | （逻辑推断正确，超出测试样本范围） |

---

## 2. 虎皮椒（Xunhupay）SDK 测试结果

### 2.1 订单数据流测试

| 测试 | 场景 | 预期 | 实际 | 状态 |
|------|------|------|------|------|
| T6 | createOrder → markPaid → findOrder | status='paid', paidAt 已设置 | status='paid', paidAt='2026-06-13T00:37:28.254Z' | ✅ PASS |
| T7 | 同一订单 markPaid 两次（幂等性） | 不抛异常，状态仍为 paid | 无异常，status='paid' | ✅ PASS |

### 2.2 签名算法测试

| 测试 | 场景 | 预期 | 实际 | 状态 |
|------|------|------|------|------|
| C1-a | 相同参数两次签名 | 结果一致（确定性） | 两次均为 `5624d6b8bd77206094a09f925628112e` | ✅ PASS |
| C1-b | 签名格式 | 32位小写十六进制 MD5 | length=32, `[0-9a-f]{32}` ✅ | ✅ PASS |
| C2-a | 正确签名验证 | verifySign=true | true | ✅ PASS |
| C2-b | 篡改数据后验证 | verifySign=false（total_fee 被篡改） | false | ✅ PASS |

### 2.3 支付状态映射测试

| 状态码 | 含义 | isPaid | isRefunded | 状态 |
|--------|------|--------|-----------|------|
| OD | 已支付 | true | false | ✅ PASS |
| WD | 等待支付 | false | — | ✅ PASS |
| CD | 已退款 | — | true | ✅ PASS |
| RD | 退款中 | — | true | ✅ PASS |
| UD | 退款失败 | — | true | ✅ PASS |

---

## 3. x402 事件规范化测试结果

| 测试 | 输入 | 预期 | 实际 | 状态 |
|------|------|------|------|------|
| T8-a | provider='api.provider.example.com', HTTP 200, latency=350ms | providerDid='did:web:api.provider.example.com', status='success', amountUsd=0.05 | 完全匹配 | ✅ PASS |
| T8-b | provider='did:web:provider.example.com', disputed=true | status='disputed', DID 原样保留 | 完全匹配 | ✅ PASS |
| T8-c | provider='https://api.example.com/agent', HTTP 500 | providerDid='did:web:api.example.com'（提取主机名）, status='failure' | 完全匹配 | ✅ PASS |

**DID 规范化规则验证：**
- ✅ 已是 `did:` 格式 → 原样保留
- ✅ 普通域名 → 包装为 `did:web:<host>`
- ✅ `https://` URL → 提取主机名后包装为 `did:web:<host>`

---

## 4. MCP Server 工具逻辑测试结果

| 工具 | 测试场景 | 预期 | 实际 | 状态 |
|------|---------|------|------|------|
| `submit_transaction` | 初始 0 条 → 添加 10 条成功记录 | 初始 overallScore=0，添加后 >0 | 0 → 97（10条全成功）| ✅ PASS |
| `get_agent_trust_score` | 查询 10 条记录的 Agent | confidenceTier='low', transactionCount=10 | 完全匹配 | ✅ PASS |
| `get_scoring_formula` | 获取权重配置 | weights 之和=1.0，包含4个维度 | sum=0.9999999999999999（浮点正常），4个维度均存在 | ✅ PASS |

> **注：** weights 之和为 `0.9999999999999999`（IEEE 754 浮点精度），绝对误差 < 1e-10，在允许阈值（0.0001）内。

---

## 5. 商业逻辑闭环测试（完整链路）

### 5.1 测试场景

**Agent：** `did:web:agent-a.example.com`  
**交易构成：** 15笔服务（12成功 / 2失败 / 1纠纷）  
**支付金额：** 每笔 5 USD（通过虎皮椒下单）  
**响应时间：** 400~680ms（均在快速区间内）

### 5.2 完整链路执行结果

```
用户支付（15笔）
  ↓ createOrder()      — 15笔订单创建，status='pending'
  ↓ markPaid()         — 15笔订单标记 paid
  ↓ x402 webhook 接收  — 15条 X402PaymentEvent 规范化
  ↓ normaliseX402Event — 转换为 TransactionRecord，写入 transactionStore
  ↓ computeTrustScore  — 评分引擎计算
  ↓ issueScoreCredential — VC 签发
```

### 5.3 评分计算明细

| 维度 | 公式 | 计算过程 | 结果 |
|------|------|---------|------|
| completionRate | success/total × 100 | 12/15 × 100 | **80** |
| reliabilityScore | max(0, 100 − dispute/total × 200) | 100 − (1/15)×200 = 100−13.33 | **87** |
| consistencyScore | Bayesian平滑 | (10×70 + 15×80) / (10+15) = 1900/25 | **76** |
| responseTime | 线性插值（400~680ms均<500ms边界） | avg=540ms → 100×(1-(540-500)/9500) ≈ 100 | **100** |
| **overallScore** | 加权求和 | 80×0.35 + 87×0.30 + 76×0.20 + 100×0.15 | **84** |

> 注：响应时间实际均值约为 540ms（400+14×20/2），> 500ms 阈值，故 responseTime 维度约为 99，最终 overallScore 四舍五入为 84。

### 5.4 最终评分报告

```json
{
  "did": "did:web:agent-a.example.com",
  "overallScore": 84,
  "grade": "B",
  "confidenceTier": "low",
  "transactionCount": 15,
  "dimensions": {
    "completionRate": 80,
    "responseTime": 100,
    "reliabilityScore": 87,
    "consistencyScore": 76
  }
}
```

### 5.5 签发的可验证凭证（VC）

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://agenttrust.xyz/contexts/trust-score/v1"
  ],
  "type": ["VerifiableCredential", "AgentTrustScoreCredential"],
  "id": "urn:uuid:3c2396bb-22ac-49d6-9528-d4f976c760a0",
  "issuer": "did:web:agenttrust.xyz",
  "issuanceDate": "2026-06-13T00:37:28.256Z",
  "expirationDate": "2026-06-14T00:37:28.256Z",
  "credentialSubject": {
    "id": "did:web:agent-a.example.com",
    "trustScore": { "overallScore": 84, "confidenceTier": "low", ... }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:agenttrust.xyz#key-1"
  }
}
```

### 5.6 链路断言结果

| 链路节点 | 验证项 | 状态 |
|---------|-------|------|
| 用户支付 → 订单创建 | 15笔 createOrder 正常 | ✅ |
| 虎皮椒回调 → 订单标记已付 | markPaid 后 status='paid' | ✅ |
| x402 Listener → 事件规范化 | normaliseX402Event 字段正确 | ✅ |
| 评分引擎更新 | computeTrustScore 输出正确 | ✅ |
| MCP Server 可查询 | transactionStore 数据可查 | ✅ |
| VC 签发 | issueScoreCredential 结构合规 | ✅ |

---

## 6. 发现的问题

### 6.1 潜在问题（代码审查发现，非断言失败）

| 严重性 | 位置 | 问题描述 | 建议 |
|--------|------|---------|------|
| 中 | `packages/core/src/issuer.ts:38` | VC proof 字段为占位符，未包含真实 JWS 签名（代码注释 `// TODO: replace with real JWS signature`） | 生产环境需接入 `@digitalbazaar/vc` 或等效库进行 Ed25519 签名 |
| 中 | `packages/core/src/store.ts:7` | 使用内存 Map 存储，服务重启后数据全部丢失 | 生产环境需替换为 PostgreSQL 或 Redis 持久化存储 |
| 低 | `packages/xunhupay/src/sign.ts:12` | 签名依赖 `crypto-js`（第三方库），Node.js 内置 `crypto` 可直接实现 MD5，引入额外依赖增加攻击面 | 可替换为 `node:crypto` 的 `createHash('md5')` |
| 低 | `packages/x402-listener/src/webhook.ts:55-91` | 每次 POST 都重新监听 `data` 事件，但外层 `req` 已有一个 `data` 监听器（`readJson` 未被使用），实际代码直接用 `rawBody` 拼接，无双重监听问题，但 `readJson` 函数定义后从未调用 — 为死代码 | 删除未使用的 `readJson` 函数 |
| 低 | scoring.ts 测试5 | T3 测试中 responseTimeMs=600ms，边界值在 500~10000 之间，overallScore=89 符合预期但接近 90 上限 — 说明评分对"略慢"不够敏感（权重仅15%） | 可根据业务需要调整 responseTime 权重 |

### 6.2 边界情况说明

| 场景 | 当前行为 | 是否符合预期 |
|------|---------|------------|
| 100% 纠纷率（全部 disputed） | reliabilityScore = max(0, 100-200) = 0 | ✅ 正确，不会出现负数 |
| n=5 时 confidenceTier | = 'low'（5 ≥ MIN_TRANSACTIONS_FOR_LOW）| ✅ 边界正确 |
| responseTime = 500ms（边界） | normaliseResponseTime(500) = 100 | ✅ 符合"≤500ms得100" |
| responseTime = 10000ms（边界） | normaliseResponseTime(10000) = 0 | ✅ 符合"≥10000ms得0" |

---

## 7. 结论

### 7.1 总体评估

> **AgentTrust Protocol 商业逻辑链路完整，评分引擎准确，数据流正确，VC 结构合规。**

| 模块 | 评估 | 备注 |
|------|------|------|
| 评分引擎（computeTrustScore） | ✅ 正确 | 纯函数，确定性输出，数学逻辑无误 |
| 虎皮椒 SDK（sign/callback） | ✅ 正确 | 签名算法正确，状态映射准确，防篡改验证有效 |
| x402 事件规范化（normaliser） | ✅ 正确 | DID 规范化、状态映射、金额换算均正确 |
| MCP Server 工具逻辑 | ✅ 正确 | 三个工具（submit/query/formula）逻辑正确 |
| VC 签发（issuer） | ✅ 结构正确 | Proof 为占位符，生产需替换真实签名 |
| 数据流完整性（全链路） | ✅ 闭环 | 支付→回调→评分→查询→签发链路贯通 |

### 7.2 生产就绪度

| 能力 | MVP | 生产 |
|------|-----|------|
| 评分算法 | ✅ 完整 | 可直接使用 |
| 数据持久化 | ⚠️ 内存 | 需接入数据库 |
| VC 签名 | ⚠️ 占位符 | 需实现真实签名 |
| Webhook 安全 | ✅ HMAC-SHA256 | 已实现 |
| 签名防篡改 | ✅ MD5 | 基本满足要求 |

### 7.3 建议优先级

1. **[高]** 接入持久化存储（PostgreSQL）— 当前内存 store 重启即清空
2. **[高]** 实现真实 VC 签名（Ed25519）— 当前 proof 为占位符
3. **[中]** 补充 medium/high 置信度层测试（需 25+/100+ 条记录）
4. **[低]** 清理 `readJson` 死代码
5. **[低]** 替换 crypto-js 为 node:crypto（减少依赖）

---

*报告由集成测试脚本 `_integration_test.mjs` 自动验证，人工整理输出。测试脚本已存于项目根目录，可随时重新运行。*
