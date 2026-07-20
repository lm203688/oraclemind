# Competitive Analysis — Agent Trust Protocol
**Date:** 2026-06-22 | **Analyst:** Distributor Agent (manual trigger)

---

## 1. 竞品全景

经扫描 GitHub / Hugging Face / npm / 官网，发现 4 个直接竞品：

### 1.1 atprotocol-org/agent-trust-protocol
- **定位**：区块链锚定身份，比特币永久铭文
- **技术**：AIP 11项规范文档（Draft→Review→Final），无SDK实现
- **亮点**：自我主权身份（无注册无审批）、密钥超时/撤销/继承
- **弱点**：纯规范无代码，无支付，开发者需自行实现
- **威胁等级**：低（不同路线，协议互补而非竞争）

### 1.2 PeerClaw (github.com/peerclaw/peerclaw)
- **定位**：AI Agent P2P信任基础设施
- **技术**：Ed25519身份 + WebRTC/Nostr通信 + EWMA声誉评分 + 多协议(A2A/MCP/ACP)
- **亮点**：服务器永远看不到消息（端对端加密）、跨协议统一、5分钟Demo
- **弱点**：无支付、无中国适配、Server用BSL 1.1（商业限制至2029年）
- **威胁等级**：**高** — 功能最完整，技术深度远超我们

### 1.3 AIP - Agent Identity Protocol (The Nexus Guard)
- **定位**：30秒部署密码学身份，开发者体验优先
- **技术**：Ed25519 + DID文档 + MCP Server 8工具 + `pip install aip-identity`
- **亮点**：30秒Quick Start、`ensure_identity()`一行接入LangChain/CrewAI/AutoGen、完整信任路径审计
- **弱点**：无支付、无动态评分、无中国适配
- **威胁等级**：**高** — 开发者体验碾压我们，MCP工具直接竞争

### 1.4 Sovr ATP (agenttrustprotocol.com)
- **定位**：量子安全AI Agent协议，企业级商业产品
- **技术**：Ed25519 + ML-DSA(Dilithium混合) + 零知识证明 + 可视化策略编辑器
- **亮点**：`npm install atp-sdk`、1行初始化、447 commits（最成熟）、企业SOC2合规
- **弱点**：商业产品（不完全开源）、无中国支付、云平台延期至Q2 2026
- **威胁等级**：**高** — 商业资源最足，但走企业路线，与我们错位

---

## 2. 能力差距分析

| 能力维度 | 我们的现状 | 竞品最优 | 差距 |
|---------|-----------|---------|------|
| **密码学身份** | DID字段（字符串，无签名） | Ed25519真实密钥对 | 🔴 严重缺失 |
| **行为信任评分** | 贝叶斯+4维（领先） | PeerClaw EWMA | 🟢 领先 |
| **支付集成** | x402 + 微信/支付宝（唯一） | 竞品全无 | 🟢 绝对优势 |
| **开发者体验** | `npm install agent-trust-core` | AIP 30秒Quick Start | 🔴 明显落后 |
| **MCP工具数量** | 3个工具 | AIP 8个工具 | 🟡 需补充 |
| **中国市场** | 唯一支持（虎皮椒支付） | 全部缺席 | 🟢 护城河 |
| **框架集成** | 无一键接入 | Sovr ATP 1行代码 | 🔴 缺失 |
| **加密通信** | 无 | PeerClaw E2E加密 | 🟡 非核心但加分 |

---

## 3. Hugging Face 生态观察

Hugging Face 2026-06-18 发布了新的 **Agent Leaderboard v2**，重点：
- 评估维度：任务完成率、工具调用准确性、多步推理、错误恢复
- **尚无信任/身份/声誉**评估维度 → 机会窗口

ATBench (arxiv 2026-04) 专注 Agent 安全行为评估，但无协议标准化层。

**结论：HuggingFace 生态目前只做能力评估，无信任基础设施，这是我们的白地。**

---

## 4. 改进优先级建议

### P0 — 补上致命短板（开发者不会用我们）

**A. Quick Start 从 5 步压缩到 1 步**
```bash
# 现在：需要理解 DID、records、x402 等概念
# 目标：
npx agent-trust-init
# ✓ 生成Ed25519密钥对
# ✓ 创建did:key身份  
# ✓ 写入 .agent-trust.json
# ✓ 就绪
```

**B. `agent-trust-core` 加入真实密钥对生成**
- 用 `@noble/ed25519` 生成真实 Ed25519 keypair
- DID 从 `did:web:example.com` 改为 `did:key:z6Mk...`（由公钥派生）
- 签名验证 → 让信任评分"值得信赖"

### P1 — 扩大护城河

**C. MCP 工具从3个扩展到8个**（对标AIP）
- `register_agent` — 注册新Agent，返回DID+密钥
- `verify_identity` — 验证Agent签名
- `vouch_for` — 为另一个Agent背书
- `get_trust_path` — 查询信任链路径
- 现有：check_score / submit_transaction / get_formula

**D. LangChain/CrewAI 一键集成**
```python
from agent_trust import ensure_identity
client = ensure_identity("my-agent", platform="langchain")
```

**E. Hugging Face Space 部署**
- 把评分算法做成一个可交互的 HF Space
- 让 HF 社区直接体验信任分计算
- 引流到 npm 包

### P2 — 差异化强化

**F. 中国生态专属文档**
- 专门针对国内开发者的中文 README
- Dify / FastGPT / 智谱清言 集成示例
- 虎皮椒支付"1分钟配置"视频教程

**G. 发布信任分 Playground**
- 在线演示：输入 Agent 行为数据，实时看信任分变化
- 比所有竞品都直观

---

## 5. 对竞品的借鉴清单

| 竞品特性 | 我们是否应该借鉴 | 优先级 |
|---------|----------------|--------|
| PeerClaw：EWMA时间衰减 | 是，补充到现有贝叶斯评分 | P1 |
| PeerClaw：信任层级(TOFU→Verified→Pinned) | 是，v0.2加入 | P1 |
| AIP：30秒Quick Start | 是，立刻优化README | P0 |
| AIP：`ensure_identity()`一行接入 | 是，Python SDK | P1 |
| AIP：信任链审计（Isnad Chain） | 是，可作为高级功能 | P2 |
| Sovr ATP：量子安全（Dilithium） | 否，时机未到，过度工程 | N/A |
| Sovr ATP：零知识证明 | 否，研究方向，非MVP | N/A |
| Sovr ATP：可视化策略编辑器 | 是，微信小程序可以做 | P2 |
| atprotocol：AIP改进提案流程 | 是，建立我们的 ATP-IIP 机制 | P2 |

---

## 6. 一句话战略建议

**用xunhupay锁死中国市场 + 补上Ed25519身份层 + 压缩到30秒Quick Start → 形成竞品无法模仿的组合优势。**

不要追量子安全（Sovr ATP的方向），不要追P2P通信（PeerClaw的方向）。  
我们的差异化是：**真实支付数据驱动的信任评分 + 中国开发者原生体验**。

---

*下一次自动扫描：2026-06-29（Distributor Agent每周一运行）*
