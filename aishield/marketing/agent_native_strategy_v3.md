# AIShield Agent原生分发策略 v3.0
## 2026-06-18 | 从"人找工具"到"Agent找Agent"

---

## 核心逻辑转变

| | 传统分发 v2 | Agent原生分发 v3 |
|---|---|---|
| **目标受众** | 人类开发者 | AI Agent |
| **发现方式** | 知乎/掘金文章 | MCP Registry自动发现 |
| **使用方式** | 人打开网页操作 | Agent自动调用API |
| **传播方式** | 人分享文章 | Badge反链+Agent间推荐 |
| **留存方式** | 人记得书签 | Agent写进config/CI |
| **付费触发** | 人决策购买 | Agent扫描超限→提示升级 |

**一句话：不写文章，不做SEO，让Agent在运行时自动发现AIShield、调用AIShield、离不开AIShield。**

---

## Agent原生分发的5层架构

### 第1层：被Agent发现（Registry层）

Agent通过Registry发现工具。不上Registry = 对Agent隐形。

| 渠道 | Agent如何发现 | 提交方式 | 状态 |
|------|--------------|----------|------|
| **MCP官方Registry** | Claude/Cursor内置发现 | registry.modelcontextprotocol.io提交 | ❌未上架 |
| **Smithery** | Agent通过smithery.ai搜索 | smithery.ai/new | ❌未上架 |
| **Glama** | Agent通过glama.ai搜索 | 提交GitHub repo | ❌未上架 |
| **mcp.so** | Agent通过mcp.so搜索 | GitHub issue | ❌未上架 |
| **PulseMCP** | 自动爬取GitHub | 自动收录 | ❌未收录 |
| **MCPMarket** | 开发者浏览 | mcpmarket.com/submit | ❌未上架 |
| **ToolPlex** | 4000+工具，Agent自动搜索安装 | toolplex.ai提交 | ❌未上架 |

**目标：7个Registry全覆盖。Agent在任何Registry搜索"security scan"都能发现我们。**

### 第2层：被Agent调用（协议层）

Agent发现后，必须能无缝调用。3种调用方式：

#### 方式1：MCP Server（已有，需优化）
```
# Agent配置一行就能用
{
  "mcpServers": {
    "aishield": {
      "command": "npx",
      "args": ["aishield-mcp"]
    }
  }
}
```
- ✅ 已有MCP Server（3个工具）
- ❌ 需要发npm包，让`npx aishield-mcp`直接可用
- ❌ 需要支持远程模式（`url`字段，免安装）

#### 方式2：Claude Code Skill（新增）
```
# Agent安装skill后自动在扫描工具前调用AIShield
/plugin install aishield-security-scan
```
- Claude Code已有plugin marketplace
- 发布为Skill → Claude Code用户一键安装
- 每次Agent安装新MCP工具时，自动触发安全扫描

#### 方式3：API（已有，需Agent友好化）
```python
# Agent代码中直接调用
import requests
r = requests.post("https://aishield.ai/api/v1/audit", json={
    "tool_type": "mcp",
    "source_url": "https://github.com/user/repo"
})
```
- ✅ 已有API
- ❌ 需要发布Python SDK：`pip install aishield`
- ❌ 需要发布npm SDK：`npm install @aishield/sdk`

### 第3层：嵌入Agent工作流（集成层）

Agent在什么场景下需要安全扫描？我们要嵌入每个场景。

#### 场景1：Agent安装新工具时（Guardrail模式）
**这是杀手级场景。**

```
Agent: "我要安装@modelcontextprotocol/server-filesystem"
→ AIShield MCP自动拦截: "扫描中... 安全评分85分，可以安装"
→ 或: "⚠️ 安全评分45分，检测到命令执行风险，建议查看报告"
```

实现方式：
- 做一个**Guardrail MCP Server**
- Agent把它放在MCP列表第一个
- 它拦截所有tool_install请求，先调AIShield扫描
- **参考**: Codacy Guardrails、Corridor、Decision Assistant

#### 场景2：CI/CD流水线（GitHub Action）
```yaml
# .github/workflows/aishield.yml
- uses: aishield/scan@v1
  with:
    api_key: ${{ secrets.AISHIELD_KEY }}
    # 自动扫描PR中新增的MCP依赖
```
- ✅ 已有GitHub Action
- ❌ 需要发布到GitHub Marketplace
- **差异化**: AgentAuditKit只做CI扫描，我们还提供SaaS+认证+持续监控

#### 场景3：Agent开发框架集成
```python
# LangGraph/LangChain/CrewAI 集成
from aishield import check_tool_safety

@mcp_tool
def my_tool():
    if check_tool_safety("my_tool") < 60:
        raise SecurityError("Unsafe tool blocked")
    # ... 正常逻辑
```
- 发布SDK，框架开发者一行代码集成
- 开发者社区传播

### 第4层：Agent间传播（病毒层）

#### 机制1：安全徽章 → 反链 → Agent发现
```
# 被扫描的工具README嵌入:
[![AIShield Security](https://aishield.ai/api/v1/badge/xxx)](https://aishield.ai/report/xxx)
```
- Agent爬取GitHub README时发现徽章
- 徽章链接→AIShield报告→发现API→Agent调用
- **病毒循环**: 扫得越多→徽章越多→Agent越容易发现→扫得更多

#### 机制2：Agent配置传播
```
# 当Agent推荐工具时，附带安全评分
Agent: "推荐使用filesystem MCP，AIShield评分85分"
```
- Agent把安全评分纳入推荐逻辑
- 被推荐的用户也会装AIShield MCP

#### 机制3：批量扫描→数据库→Agent查询
```
Agent: "filesystem MCP安全吗？"
→ AIShield API: {"score": 85, "badge": "gold", "issues": [...]}
```
- Agent不需要每次都全量扫描
- 查询已有结果（缓存），秒级响应
- 需要积累1000+工具的扫描数据库

### 第5层：Agent付费转化（商业化层）

Agent原生分发的付费转化逻辑：

```
免费: Agent每天扫描5次（够个人开发者用）
→ 团队Agent每天扫描50次 → 触发限额
→ Agent提示: "今日扫描额度已用完，升级Pro ¥29/月解锁200次/天"
→ 开发者付费 → 不用销售，Agent自己卖
```

关键设计：
- 免费额度够个人用（5次/天）
- 团队/CI场景必然超限（CI每天跑多次）
- Agent自动提示升级（不需要人推销）
- 按次付费兜底（不想包月的自动扣¥1/次）

---

## 执行计划

### Phase 1：Registry全覆盖（3天）

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1 | MCP官方Registry提交 + Smithery提交 | 2个渠道上架 |
| Day 2 | Glama + mcp.so + MCPMarket提交 | 3个渠道上架 |
| Day 3 | ToolPlex + PulseMCP确认 | 7个渠道全覆盖 |

**提交内容统一**:
- 名称: AIShield - AI Tool Security Scanner
- 描述: Scan MCP servers, AI skills, and agent tools for security risks. OWASP-aligned, 4-dimensional scoring, certified badge.
- MCP Server URL: https://aishield.ai/mcp
- GitHub: https://github.com/aishield/aishield (需创建公开repo)

### Phase 2：Agent调用层（5天）

| 天 | 任务 | 产出 |
|----|------|------|
| Day 4 | npm包`aishield-mcp`发布 | `npx aishield-mcp`可用 |
| Day 5 | PyPI包`aishield`发布 | `pip install aishield`可用 |
| Day 6 | Claude Code Skill制作+提交 | Claude marketplace上架 |
| Day 7 | MCP远程模式支持 | 免安装调用 |
| Day 8 | GitHub Action发布到Marketplace | CI/CD渠道 |

### Phase 3：Guardrail模式（7天）

| 天 | 任务 | 产出 |
|----|------|------|
| Day 9-10 | Guardrail MCP Server开发 | 拦截tool_install |
| Day 11-12 | 拦截逻辑+AIShield扫描集成 | 自动扫描新安装工具 |
| Day 13-14 | 文档+示例+Smithery上架Guardrail | 可用产品 |
| Day 15 | 批量扫描Smithery TOP 100工具 | 扫描数据库积累 |

### Phase 4：病毒循环启动（持续）

- 每个被扫描的工具→自动生成徽章→推送到工具作者
- 批量扫描热门MCP工具→数据库→Agent可查询
- 接入ToolPlex信号网络→Agent使用工具时贡献数据

---

## 与v2策略的对比

| 维度 | v2传统分发 | v3 Agent原生分发 |
|------|-----------|-----------------|
| 知乎长文 | ✅必须发 | ❌不发 |
| 掘金技术文 | ✅必须发 | ❌不发 |
| V2EX/Reddit | ✅必须发 | ❌不发（可选） |
| MCP Registry | 部分覆盖 | **7个全覆盖** |
| npm/PyPI包 | 可选 | **必须发布** |
| Claude Skill | 未规划 | **必须发布** |
| Guardrail MCP | 未规划 | **核心产品** |
| GitHub Action | 可选 | **必须上架Marketplace** |
| Badge反链 | 有 | **核心传播机制** |
| 批量扫描数据库 | 未规划 | **核心数据资产** |

---

## 成功指标

| 指标 | 1个月目标 | 3个月目标 |
|------|-----------|-----------|
| Registry上架数 | 7 | 7+ |
| npm周下载量 | 50 | 500 |
| PyPI周下载量 | 30 | 300 |
| Claude Skill安装数 | 20 | 200 |
| GitHub Action使用数 | 10 | 100 |
| 扫描数据库工具数 | 500 | 3000 |
| 徽章展示数 | 50 | 500 |
| 付费用户 | 3 | 20 |
| 月收入 | ¥87 | ¥580 |

**核心指标**：不是"文章阅读量"，而是"Agent调用量"（API requests/day）。

---

## 需要开发的东西

| 优先级 | 产出 | 工作量 |
|--------|------|--------|
| P0 | npm包 `aishield-mcp` | 1天 |
| P0 | MCP远程模式（`url`字段支持） | 0.5天 |
| P0 | GitHub公开repo（aishield/aishield） | 0.5天 |
| P1 | PyPI包 `aishield` SDK | 1天 |
| P1 | Claude Code Skill | 1天 |
| P1 | GitHub Action Marketplace发布 | 0.5天 |
| P2 | Guardrail MCP Server | 3天 |
| P2 | 批量扫描脚本（Smithery TOP 100） | 1天 |
| P2 | Agent友好的API文档（机器可读） | 0.5天 |
