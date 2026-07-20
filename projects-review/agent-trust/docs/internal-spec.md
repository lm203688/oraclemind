# AgentTrust Protocol 内部技术规范

> 定义核心信任指标、签名验证、权限隔离等关键技术规范。
> 版本: v0.1
> 状态: 草案（征求社区意见）

---

## 目录

1. [核心信任指标](#核心信任指标)
2. [DID 身份系统](#did-身份系统)
3. [签名验证规范](#签名验证规范)
4. [权限隔离模型](#权限隔离模型)
5. [交易事件规范](#交易事件规范)
6. [W3C Verifiable Credential 格式](#w3c-verifiable-credential-格式)
7. [数据存储安全](#数据存储安全)
8. [MCP 工具安全](#mcp-工具安全)
9. [合规与隐私](#合规与隐私)

---

## 核心信任指标

AgentTrust 的评分体系基于四个可观测、可验证的维度。

### 维度定义

| 维度 | 权重 | 计算方式 | 信任含义 |
|------|------|----------|----------|
| **Completion Rate** | 35% | `success / total × 100` | 履约能力：承诺的服务是否兑现 |
| **Reliability Score** | 30% | `max(0, 100 − disputed/total × 200)` | 诚信度：是否主动欺骗或恶意行为 |
| **Consistency Score** | 20% | 贝叶斯平滑 | 稳定性：长期表现是否一致 |
| **Response Time** | 15% | 线性映射 | 效率：响应是否及时 |

### 指标设计原则

1. **可观测性**：每个指标必须能从交易日志中直接计算，不需要主观判断。
2. **抗操纵性**：单一维度难以刷分。例如，不能通过大量快速失败交易来刷 Response Time。
3. **渐进可信**：新 Agent 不会立刻获得高分或低分，需要积累足够交易数据。
4. **争议优先**：`disputed` 比 `failure` 更严重（权重 2×），因为争议意味着主动伤害而非被动失败。

### 置信度分级

| 级别 | 交易数 | 使用建议 |
|------|--------|----------|
| `insufficient` | < 5 | 不依赖，仅作参考 |
| `low` | 5–24 | 指示性，需人工复核 |
| `medium` | 25–99 | 较为可靠，关键决策建议复核 |
| `high` | ≥ 100 | 高度可信，可直接用于自动化决策 |

---

## DID 身份系统

### DID 方法

当前支持：`did:web`

规划支持：`did:ethr`, `did:key`, `did:pkh`

### did:web 解析规范

```
did:web:example.com
→ https://example.com/.well-known/did.json

did:web:sub.example.com
→ https://sub.example.com/.well-known/did.json
```

### DID Document 必需字段

```json
{
  "@context": ["https://www.w3.org/ns/did/v1"],
  "id": "did:web:example.com",
  "verificationMethod": [{
    "id": "did:web:example.com#keys-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:example.com",
    "publicKeyMultibase": "z6Mkq..."
  }],
  "authentication": ["did:web:example.com#keys-1"],
  "assertionMethod": ["did:web:example.com#keys-1"],
  "service": [{
    "id": "did:web:example.com#agent-trust",
    "type": "AgentTrustEndpoint",
    "serviceEndpoint": "https://example.com/agent-trust"
  }]
}
```

### 密钥管理要求

1. **密钥生成**：使用 Ed25519 或 secp256k1，禁止 RSA（太大，不适合 Agent 场景）。
2. **密钥轮换**：支持 `verificationMethod` 数组，旧密钥保留至少 30 天过渡期。
3. **密钥丢失**：Agent 所有者通过控制域名重新发布 DID Document，但历史交易记录保留。
4. **密钥泄露**：立即撤销旧密钥，生成新密钥对，重新发布 DID Document。

---

## 签名验证规范

### 签名算法

| 场景 | 算法 | 规范 |
|------|------|------|
| 交易事件 | Ed25519 | JWS (RFC 7515) |
| VC 凭证 | Ed25519 | W3C Data Integrity v1.0 |
| DID Document | 域名 TLS | HTTPS + 证书验证 |

### 交易事件签名流程

```
1. 构造事件 JSON
2. 使用提供者的私钥对 JSON 进行签名
3. 将签名附加到事件（sig 字段）
4. 存储/传播事件
5. 验证者用提供者的 DID 公钥验证签名
```

### 签名验证失败处理

| 失败原因 | 处理方式 | 记录 |
|----------|----------|------|
| 签名格式错误 | 拒绝事件，返回错误 | 日志记录 |
| 公钥找不到 | 拒绝事件，提示更新 DID Document | 日志记录 |
| 签名不匹配 | 拒绝事件，标记为潜在伪造 | 日志 + 告警 |
| 密钥已撤销 | 拒绝事件，提示使用新密钥 | 日志记录 |

---

## 权限隔离模型

### 三层隔离

```
┌─────────────────────────────────────┐
│  Layer 3: Agent 运行时隔离           │
│  - 每个 Agent 独立的进程/容器        │
│  - 沙箱执行，限制系统调用            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Layer 2: 协议层隔离                 │
│  - DID 级别的身份验证                │
│  - 交易签名验证                      │
│  - 信任分阈值控制                    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Layer 1: 数据层隔离                 │
│  - 每个 DID 独立的数据分区           │
│  - 交易记录不可篡改（签名保护）       │
│  - 查询权限按 DID 隔离               │
└─────────────────────────────────────┘
```

### 最小权限原则

1. **MCP Server 只暴露必要工具**：不提供直接修改交易历史的功能。
2. **查询权限**：任何 Agent 可以查询任何 DID 的公开信任分（只读）。
3. **提交权限**：只有交易中的 `consumer`（消费者）或受信任的 oracle 可以提交交易事件。
4. **管理权限**：DID 的所有者可以更新自己的 DID Document，但不能修改历史交易记录。

### 沙箱要求（部署时）

- MCP Server 应以非 root 用户运行
- 文件系统只读（除存储目录外）
- 网络访问限制（仅出站 HTTPS）
- 内存限制（防止资源耗尽攻击）

---

## 交易事件规范

### 事件 Schema

```typescript
interface TransactionEvent {
  // 必需字段
  id: string;           // 全局唯一：tx-{timestamp}-{random}
  provider: string;     // DID of service provider
  consumer: string;     // DID of consumer
  status: "success" | "failure" | "disputed";
  protocol: "x402" | "mcp" | "a2a" | string;
  timestamp: string;    // ISO 8601

  // 可选字段
  responseTimeMs?: number;
  amount?: string;      // Decimal string (e.g., "0.001")
  currency?: string;    // "ETH", "USD", etc.
  metadata?: Record<string, unknown>;

  // 签名
  signature: string;    // JWS compact serialization
}
```

### 事件 ID 生成规则

```
tx-{unixTimestamp}-{randomBase36}

示例: tx-1750224000000-a7x9k2
```

### 事件不可变性

- 一旦提交，事件内容不可修改。
- 如果事件有误，提交新的更正事件（带有 `correctionOf: "original-id"` 字段）。
- 评分算法处理更正事件时，降低原始事件的权重（×0.5）。

### 争议处理流程

```
1. Consumer 提交 status: "disputed" 事件
2. 事件进入 "pending_dispute" 状态
3. 争议窗口期：7 天
4. 期间可提交证据（附加事件）
5. 7 天后：
   - 如果 Provider 无回应 → 争议成立，影响评分
   - 如果 Provider 提交反驳证据 → 社区/仲裁者裁决
6. 最终裁决事件标记为 "dispute_resolved"
```

---

## W3C Verifiable Credential 格式

### 信任分 VC 结构

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://agent-trust.dev/v1"
  ],
  "id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
  "type": ["VerifiableCredential", "AgentTrustScore"],
  "issuer": "did:web:agent-trust-registry.example.com",
  "issuanceDate": "2026-06-18T09:00:00Z",
  "credentialSubject": {
    "id": "did:web:agent-b.example.com",
    "agentTrustScore": {
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
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-06-18T09:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:agent-trust-registry.example.com#keys-1",
    "proofValue": "z58D..."
  }
}
```

### VC 验证要求

1. 验证 VC 的 JSON-LD 结构
2. 验证 `issuer` 的 DID 和签名
3. 验证 `credentialSubject.id` 与查询的 DID 匹配
4. 验证 `proof.created` 时间戳（拒绝过期超过 7 天的 VC）
5. 验证 VC 未被撤销（检查撤销列表）

---

## 数据存储安全

### 存储层抽象

```typescript
interface Store {
  // 写入
  addTransaction(event: TransactionEvent): Promise<void>;
  updateDIDDocument(did: string, doc: DIDDocument): Promise<void>;

  // 读取
  getTransactions(did: string): Promise<TransactionEvent[]>;
  getDIDDocument(did: string): Promise<DIDDocument | null>;
  getScore(did: string): Promise<AgentTrustScore>;

  // 管理
  backup(): Promise<Buffer>;
  restore(data: Buffer): Promise<void>;
}
```

### 存储实现

| 实现 | 适用场景 | 安全特性 |
|------|----------|----------|
| `MemoryStore` | 开发测试 | 数据在内存，进程退出丢失 |
| `SQLiteStore` | 单节点生产 | 文件权限 600，定期备份 |
| `PostgreSQLStore` | 多节点生产 | TLS 连接，行级安全策略 |
| `RedisStore` | 缓存层 | TTL 过期，只读副本 |

### 数据保留政策

- 原始交易事件：永久保留（签名保护完整性）
- 评分快照：保留 90 天（用于历史趋势分析）
- DID Document 历史：保留所有版本（用于密钥历史审计）
- 访问日志：保留 30 天（用于安全审计）

### 加密要求

- 传输中：TLS 1.3（最低 TLS 1.2）
- 静止时：AES-256-GCM（PostgreSQL 透明加密或应用层加密）
- 备份：加密后存储，密钥分离管理

---

## MCP 工具安全

### 工具暴露策略

```typescript
// 当前暴露的 3 个工具
const tools = [
  {
    name: "get_agent_trust_score",
    access: "public",        // 任何连接者可以调用
    rateLimit: "100/min",  // 防止滥用
  },
  {
    name: "get_scoring_formula",
    access: "public",        // 只读，无风险
    rateLimit: "1000/min",
  },
  {
    name: "submit_transaction",
    access: "authenticated", // 需要验证 consumer DID
    rateLimit: "10/min",     // 严格限制，防止垃圾事件
  }
];
```

### 身份验证模型

MCP 协议本身不提供内置身份验证。AgentTrust MCP Server 采用以下策略：

1. **连接级**：通过环境变量 `ALLOWED_DIDS` 限制哪些 DID 可以连接（可选）。
2. **事件级**：`submit_transaction` 要求事件中的 `consumer` 字段与连接者的 DID 匹配（通过签名验证）。
3. **Oracle 模式**：受信任的第三方 Oracle 可以提交事件（通过 `ORACLE_DIDS` 环境变量配置）。

### 速率限制

| 工具 | 限制 | 触发后处理 |
|------|------|------------|
| `get_agent_trust_score` | 100/min/IP | 返回 429，建议缓存 |
| `get_scoring_formula` | 1000/min/IP | 返回 429，公式几乎不变 |
| `submit_transaction` | 10/min/DID | 返回 429，防止垃圾事件 |

---

## 合规与隐私

### GDPR 合规

1. **数据最小化**：只收集评分必需的字段（provider, consumer, status, protocol）。不收集个人身份信息。
2. **匿名化**：DID 本身不包含个人身份信息。如果 DID 关联到真实身份，是用户的主动选择。
3. **被遗忘权**：用户可以请求删除自己的 DID 关联数据。但已签名的交易事件保留（完整性需要），仅删除与真实身份的映射。
4. **数据可携**：用户可以随时导出自己 DID 的所有交易记录和评分数据。

### 数据主权

1. 用户可以选择数据存储位置（本地、私有服务器、云服务）。
2. 跨区域传输时，遵守目标司法管辖区的数据本地化要求。
3. 不提供"全局排名"或"公开 leaderboard"，避免数据聚合风险。

### 审计日志

所有管理操作记录审计日志：

```
[2026-06-18T09:00:00Z] INFO  DID:did:web:admin.example.com ACTION:config_update FIELD:rate_limit BEFORE:100/min AFTER:50/min
[2026-06-18T09:05:00Z] WARN  DID:did:web:oracle.example.com ACTION:transaction_submit RESULT:rate_limited
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.1 | 2026-06-18 | 初始草案 |

---

## 征求意见

本规范为草案，以下问题需要社区讨论：

1. **DID 方法选择**：`did:web` 之外，应优先支持哪种 DID 方法？（`did:ethr` vs `did:key`）
2. **争议仲裁**：7 天窗口是否足够？是否需要去中心化仲裁机制？
3. **隐私保护**：是否支持零知识证明验证信任分（不暴露具体交易）？
4. **跨链互操作**：x402 之外，是否需要支持其他支付协议（如 Solana Pay）？

请在 [Discussions](https://github.com/lm203688/agent-trust-protocol/discussions) 中留言。

---

*AgentTrust Protocol 内部技术规范 v0.1*
