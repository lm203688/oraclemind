# ATEX × AgentMore 融合方案

**日期**: 2026-06-05  
**目标**: 两个平台融合为一个，形成三大功能体系，6月底前实现5个付费用户

---

## 一、两平台资产盘点

### AgentMore/ClawHub（当前平台）

| 资产 | 状态 | 价值 |
|------|------|------|
| 50+ Skills | ✅ 真实可用 | 高 — 执行层完整 |
| z-ai-web-dev-sdk | ✅ 已集成 | 高 — LLM/TTS/ASR/VLM/image/video/web |
| 内容生成 | ✅ pdf/docx/ppt/xlsx/charts/podcast | 高 — 差异化能力 |
| 研究分析 | ✅ qingyan-research/aminer/finance | 中 — 专业场景 |
| 自动化 | ✅ agent-browser/social-media-publish | 中 — 工作流闭环 |
| 支付系统 | ❌ 无 | 阻断变现 |
| 合规工具 | ❌ 无 | 缺差异化 |
| MCP Server | ❌ 无 | 缺生态入口 |
| 订阅系统 | ❌ 无 | 缺持续收入 |

### ATEX（ECS 150.158.119.19:8420）

| 资产 | 状态 | 价值 |
|------|------|------|
| 4个合规SCF API | ✅ 真实可用 | **极高** — 唯一差异化 |
| 支付网关 | ⚠️ 代码有，未配置 | 高 — 变现闭环 |
| MCP Server | ✅ 已注册Smithery/Registry | 高 — 生态入口 |
| 订阅系统 | ✅ 4档方案 | 高 — 持续收入 |
| SaaS用户管理 | ✅ 注册/认证/扣费/试用 | 高 — 用户体系 |
| DeepSeek代理 | ❌ 402 | 低 — 充值即可恢复 |
| 15个注册服务 | ⚠️ 多为LLM包装 | 低 — 0成交 |
| Token交易 | ❌ 0流动性 | 无 — 砍掉 |
| Job市场 | ❌ 0流动性 | 无 — 砍掉 |
| A2A协议 | ❌ 生态不成熟 | 无 — 砍掉 |

---

## 二、融合架构：三大功能体系

```
┌─────────────────────────────────────────────────────┐
│                   统一平台 ATEX                       │
│              https://atex.ai (待备案)                 │
│           http://150.158.119.19:8420 (当前)           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐ ┌───────────────┐ ┌────────────┐ │
│  │  1. AI能力层   │ │ 2. 合规工具层  │ │ 3. 交易层  │ │
│  │               │ │               │ │            │ │
│  │ LLM对话       │ │ 违禁词检测     │ │ 订阅制     │ │
│  │ TTS语音合成   │ │ AI搜索可见度   │ │ 按次计费   │ │
│  │ ASR语音识别   │ │ 出海合规评估   │ │ 支付宝/微信 │ │
│  │ VLM视觉理解   │ │ SEO合规扫描   │ │ 加密货币   │ │
│  │ 图片生成/编辑  │ │               │ │ MCP计费    │ │
│  │ 视频生成/理解  │ │               │ │            │ │
│  │ Web搜索/阅读  │ │               │ │            │ │
│  │ 文档生成      │ │               │ │            │ │
│  │ (pdf/docx/   │ │               │ │            │ │
│  │  ppt/xlsx)   │ │               │ │            │ │
│  └───────────────┘ └───────────────┘ └────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │              统一基础设施                         │ │
│  │  SaaS用户管理 │ MCP协议 │ API Gateway │ 日志监控  │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 三、三大功能体系详解

### 体系1：AI能力层

**定位**: 开发者和Agent的AI基础设施，一个API Key调全部能力

**保留的能力**（从AgentMore Skills映射为ATEX服务）:

| 服务ID | 名称 | 来源 | 定价 | 类型 |
|--------|------|------|------|------|
| svc_101 | AI对话(DeepSeek) | ATEX已有 | ¥0.001/1k token | llm |
| svc_102 | AI推理(DeepSeek Reasoner) | ATEX已有 | ¥0.004/1k token | llm |
| svc_103 | 语音合成(TTS) | AgentMore Skill | ¥0.5/次 | sdk |
| svc_104 | 语音识别(ASR) | AgentMore Skill | ¥0.5/次 | sdk |
| svc_105 | 图片理解(VLM) | AgentMore Skill | ¥1/次 | sdk |
| svc_106 | 图片生成 | AgentMore Skill | ¥2/次 | sdk |
| svc_107 | 图片编辑 | AgentMore Skill | ¥1/次 | sdk |
| svc_108 | 视频生成 | AgentMore Skill | ¥5/次 | sdk |
| svc_109 | 视频理解 | AgentMore Skill | ¥1/次 | sdk |
| svc_110 | Web搜索 | AgentMore Skill | ¥0.5/次 | sdk |
| svc_111 | Web阅读 | AgentMore Skill | ¥0.3/次 | sdk |

**砍掉的**:
- svc_001 多模型路由（LLM包装，无真实多模型）
- svc_002 AI安全攻防（LLM包装，0成交）
- svc_003 AI法律合规（LLM包装，0成交）
- svc_004 实时语音翻译（LLM包装，0成交）
- svc_005 金融投研分析（LLM包装，0成交）
- svc_006 内容质量审核（LLM包装，0成交）
- svc_010 AI信息情报收集（LLM包装，0成交）
- svc_011 信息渠道健康审核（LLM包装，0成交）
- svc_013 网页自动化操作（LLM包装，0成交）
- svc_040 工作流编排（LLM包装，0成交）
- svc_041 Agent服务发现（LLM包装，0成交）

### 体系2：合规工具层

**定位**: 中国内容创作者和出海企业的合规刚需，ATEX核心差异化

| 服务ID | 名称 | 后端 | 定价 | 免费额度 |
|--------|------|------|------|----------|
| svc_201 | 违禁词检测+SEO合规 | 腾讯云SCF ✅ | ¥0.1/次 | 5次/月 |
| svc_202 | AI搜索可见度检测 | 腾讯云SCF ✅ | ¥0.5/次 | 3次/月 |
| svc_203 | 产品出海合规评估 | 腾讯云SCF ✅ | ¥1/次 | 2次/月 |
| svc_204 | SEO合规+违禁词扫描(6平台) | 腾讯云SCF ✅ | ¥0.2/次 | 5次/月 |

**这是唯一有真实付费需求的层。** 广告法违禁词罚款20-100万，¥0.1/次的检测是白菜价。

### 体系3：交易变现层

**定位**: 让前两层能力变成钱

**保留**:
- SaaS订阅制（4档：免费/基础¥49/专业¥199/企业¥999）
- 按次计费（余额永不过期）
- 支付宝/微信（虎皮椒，修Bug后配置上线）
- 加密货币（NOWPayments，配置上线）
- MCP计费（MCP调用自动扣费）
- 充值优惠（充100送20等）

**砍掉**:
- Token交易/订单簿撮合（0流动性，过度工程）
- Job市场（0流动性）
- A2A协议（生态不成熟）
- ATEX Token作为可交易资产（改为纯平台积分Credits）

---

## 四、代码改造清单

### Phase 1: 修Bug + 注册合规服务（1天）

**1.1 修复支付宝Bug**
- 文件: `server.py` 第987行
- 改动: 删除 `from payment.gateway import xunhupay_create_order` 局部导入
- 原因: 局部导入覆盖顶层导入，导致UnboundLocalError

**1.2 注册4个合规服务**
- 文件: `services/services.json`
- 改动: 添加svc_201-204四个服务定义（见上方表格）
- 同时在`service_executor.py`中更新映射（svc_046→svc_201等）

**1.3 修复ECS首页**
- 文件: `server.py` `_landing_page()`
- 改动: 合规工具卡片现在会自动显示（因为服务已注册）

**1.4 修复GitHub Pages**
- 文件: `docs/index.html`
- 改动: 将合规工具section从footer后移到主内容区，添加交互表单

### Phase 2: 融合AI能力层（2-3天）

**2.1 新增SDK服务执行器**
- 文件: `service_executor.py`
- 改动: 添加svc_103-111的执行函数，调用z-ai-web-dev-sdk
- 每个函数封装对应Skill的核心逻辑为API调用

**2.2 更新MCP工具列表**
- 文件: `server.py` MCP handler
- 改动: 从5个工具扩展到15+个（4合规+11 AI能力）

**2.3 更新订阅方案**
- 文件: `config.json` subscription_plans
- 改动: 免费版包含合规工具免费额度；基础版增加AI能力额度

### Phase 3: 精简+部署（1天）

**3.1 删除死代码**
- 删除: `a2a_protocol.py`, `job_market.py`, `skill_market.py`
- 删除: `atex.py`中Token交易相关代码（order_book, trade等）
- 删除: `stubs/` 目录
- 删除: `agent-tool-platform/` 目录

**3.2 重构services.json**
- 从15个服务精简到15个（4合规+11 AI能力）
- 删除所有LLM包装假服务

**3.3 统一品牌**
- 平台名: ATEX
- 定位: "AI能力 + 中国合规工具，一个API Key全搞定"
- 域名: 保持 150.158.119.19:8420，后续考虑atex.ai

---

## 五、订阅方案（融合后）

| 方案 | 月费 | AI能力 | 合规工具 | 适合 |
|------|------|--------|----------|------|
| 免费版 | ¥0 | 按次计费 | 5次/月 | 试用 |
| 基础版 | ¥49 | DeepSeek无限+其他按次 | 50次/月 | 个人创作者 |
| 专业版 | ¥199 | 全部AI能力折扣+合规无限 | 无限 | 企业/团队 |
| 企业版 | ¥999 | 全部无限+专属支持 | 无限+定制 | 大企业 |

---

## 六、引流策略

### 6.1 ClawHub Skills引流（免费→付费）

创建4个合规ClawHub Skills:
- `banned-word-check` — 免费调用3次，第4次引导到ATEX付费
- `geo-visibility-check` — 同上
- `global-compliance-check` — 同上
- `seo-compliance-check` — 同上

每个Skill的SKILL.md中包含ATEX API调用说明和注册链接。

### 6.2 MCP生态引流

已注册Smithery和MCP Registry，扩展工具列表后重新提交。

### 6.3 内容营销

- CSDN/知乎: "广告法违禁词检测API，¥0.1/次"
- V2EX: "做了个合规检测平台，注册送5元"
- 小红书/抖音: 违禁词检测演示视频

---

## 七、6月底5个付费用户路径

| 周 | 动作 | 目标 |
|----|------|------|
| 第1周 | Phase 1: 修Bug+注册合规+配置支付 | 平台可用 |
| 第2周 | Phase 2: 融合AI能力+MCP扩展 | 功能完整 |
| 第3周 | Phase 3: 精简+4个ClawHub Skills+内容营销 | 引流启动 |
| 第4周 | 持续推广+优化转化 | 5个付费用户 |

---

## 八、风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| DeepSeek API持续402 | 中 | 充值或切换到z-ai-web-dev-sdk的LLM |
| 虎皮椒审核不通过 | 低 | 备选：NOWPayments加密货币先行 |
| 合规工具无付费转化 | 中 | 免费额度降低，增加内容营销 |
| ECS服务器不稳定 | 低 | 监控+自动重启脚本 |

---

## 九、文件结构（融合后）

```
atex/
├── api/
│   └── server.py              # 统一HTTP服务器（精简后）
├── core/
│   ├── atex.py                # 精简：删除Token交易，保留账户/服务管理
│   ├── service_executor.py    # 扩展：合规+AI能力执行器
│   └── realtime.py            # 保留：SSE通知
├── compliance/
│   ├── banned_word.py         # 违禁词检测（调用SCF）
│   ├── geo_visibility.py      # AI搜索可见度（调用SCF）
│   ├── global_compliance.py   # 出海合规评估（调用SCF）
│   └── seo_compliance.py      # SEO合规扫描（调用SCF）
├── ai_capabilities/
│   ├── llm.py                 # AI对话（DeepSeek/z-ai SDK）
│   ├── tts.py                 # 语音合成
│   ├── asr.py                 # 语音识别
│   ├── vlm.py                 # 视觉理解
│   ├── image_gen.py           # 图片生成
│   ├── image_edit.py          # 图片编辑
│   ├── video_gen.py           # 视频生成
│   ├── video_understand.py    # 视频理解
│   ├── web_search.py          # Web搜索
│   └── web_reader.py          # Web阅读
├── payment/
│   ├── gateway.py             # 支付网关（修复后）
│   └── subscription.py        # 订阅管理
├── mcp/
│   └── handler.py             # MCP协议处理（扩展工具列表）
├── data/
│   ├── services.json          # 15个真实服务
│   ├── payment_config.json    # 支付配置
│   └── saas_data/             # SaaS用户数据
├── docs/
│   └── index.html             # 统一前端（含合规工具交互表单）
├── config.json                # 平台配置
├── Dockerfile                 # 容器化部署
└── requirements.txt           # Python依赖
```

---

*融合原则：有用的留下，没用的砍掉，两个平台互补形成完整闭环。*
