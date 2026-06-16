# ATEX 平台诊断报告

**日期**: 2026-06-05  
**版本**: v5.17 (线上) / v5.18 (代码)  
**核心问题**: 0付费用户，6月底需5个付费用户止损线

---

## 一、线上状态速查

| 指标 | 数值 | 备注 |
|------|------|------|
| 注册账户 | 41 | 多数为测试/自注册 |
| 在线服务 | 15个 | 但合规工具4个未注册 |
| 服务订单 | 0 | **零成交** |
| Token交易 | 2笔 | 总佣金66.87 ATEX |
| 日交易量 | 0 | 无流动性 |
| DeepSeek API | ❌ 402 | API Key余额耗尽 |
| GPT-4o/Claude | ⚠️ coming_soon | 未实际接入 |
| 支付宝/微信 | ❌ Bug | `xunhupay_create_order` 变量作用域错误 |
| NOWPayments | ❌ 未配置 | API Key为空 |
| MCP协议 | ✅ 正常 | 但工具列表缺合规工具 |
| 合规SCF API | ✅ 全部可用 | 4个后端均正常响应 |

---

## 二、关键Bug清单

### 🔴 P0 — 阻断付费

**1. 支付宝接口崩溃**
- **端点**: `POST /v1/pay/alipay`
- **错误**: `local variable 'xunhupay_create_order' referenced before assignment`
- **原因**: `server.py` 第987行 `from payment.gateway import xunhupay_create_order` 局部导入，覆盖了第15行的顶层导入，Python将整个函数体内的同名变量视为局部变量
- **修复**: 删除第987行的局部import，或改用别名

**2. DeepSeek API 402**
- **端点**: `POST /v1/chat/completions`
- **错误**: `deepseek_api_error:402` (Payment Required)
- **原因**: `service_executor.py` 第8行硬编码的API Key余额耗尽
- **修复**: 充值DeepSeek账户或更换Key

**3. 合规工具未注册到服务列表**
- **影响**: svc_046~049 在 `service_executor.py` 中有实现，但 `services.json` 中没有注册
- **结果**: 
  - 首页合规工具卡片为空（0个card）
  - `/api/v1/services/buy` 返回 `not_found`
  - 只有 `/api/v1/services/execute` 能调用（但需要知道service_id）
- **修复**: 在 `services.json` 中添加4个合规服务定义

### 🟡 P1 — 影响体验

**4. MCP工具列表缺少合规工具**
- 当前MCP只暴露5个工具：chat, web_search, check_balance, list_models, list_services
- 缺少：banned_word_check, geo_visibility_check, global_compliance_check, seo_compliance_check
- **修复**: 在MCP tools/list中添加4个合规工具

**5. GPT-4o/Claude显示coming_soon但无实际接入**
- `/v1/models` 返回6个模型，4个标记coming_soon
- 代码中 `_proxy_openai_chat` 和 `_proxy_claude_chat` 实际通过DeepSeek中转，非真实调用
- **建议**: 要么接入真实API，要么从模型列表移除，避免误导

**6. NOWPayments未配置**
- `payment_config.json` 中 api_key 和 ipn_secret 均为空
- `enabled: false`
- **修复**: 注册nowpayments.io获取Key

---

## 三、架构问题

### 过度工程 vs 真实需求

| 模块 | 代码量 | 实际使用 | 建议 |
|------|--------|----------|------|
| Token交易/订单簿 | ~300行 | 2笔交易 | **砍掉** — 无流动性，增加复杂度 |
| Job市场 | ~200行 | 0任务 | **砍掉** — 无需求 |
| A2A协议 | ~150行 | 0调用 | **砍掉** — 生态不成熟 |
| 40个规则型假服务 | ~800行 | 0成交 | **砍掉** — 无人付费 |
| AI Gateway | ~400行 | 7次调用 | **保留** — 核心壁垒 |
| 4个合规API | ~80行 | ✅ 后端可用 | **重点推广** — 真实需求 |
| 支付系统 | ~300行 | 未上线 | **修复后上线** — 变现闭环 |
| MCP协议 | ~200行 | ✅ 已注册 | **扩展** — 生态入口 |

### 当前服务列表（15个）中无人付费的原因

1. **定价偏高**: AI安全攻防¥20/次、金融投研¥20/次 — 对个人用户太贵
2. **价值不明确**: "多模型路由与成本优化" — 用户不理解为什么需要
3. **合规工具缺失**: 最有差异化价值的4个工具居然没注册
4. **免费额度太低**: 注册送5元，3天试用 — 不够体验完整流程

---

## 四、6月底5个付费用户 — 最短路径

### 核心洞察

**合规工具是唯一有真实需求且已可用的差异化功能。** 4个SCF API后端全部正常，测试结果专业且有价值。这是ATEX最应该卖的东西。

### 行动计划（按优先级）

#### 第1步：修复3个P0 Bug（1天）

1. **修复支付宝Bug** — 删除server.py第987行局部import
2. **注册4个合规服务** — 在services.json添加svc_046~049
3. **充值DeepSeek** — 或更换API Key

#### 第2步：精简架构（1天）

1. 砍掉Token交易、Job市场、A2A协议代码路径
2. 从服务列表移除无人付费的假服务（svc_002~006, svc_010~011）
3. 保留8个真实服务：
   - svc_001: AI Gateway（免费额度引流）
   - svc_046: 违禁词检测 ¥0.5/次（降价新定价）
   - svc_047: AI搜索可见度 ¥3/次
   - svc_048: 出海合规评估 ¥8/次
   - svc_049: SEO合规扫描 ¥1/次
   - svc_012: Web搜索 ¥1/次
   - svc_038: 数据提取 ¥1/次
   - svc_042: 网页监控 ¥0.5/URL/天

#### 第3步：MCP扩展合规工具（0.5天）

在MCP tools/list中添加4个合规工具，让任何MCP客户端（Claude Desktop、Cursor等）可直接调用。

#### 第4步：支付上线（0.5天）

1. 配置虎皮椒app_id/app_secret
2. 测试支付宝/微信支付闭环
3. 可选：配置NOWPayments（面向海外用户）

#### 第5步：引流（持续）

1. **ClawHub Skills** — 已有24个，合规工具Skill优先发布
2. **MCP Registry** — 已注册，更新描述突出合规工具
3. **知乎/小红书** — 发布"广告法违禁词检测"相关内容
4. **Product Hunt** — 合规工具对海外中国出海企业有需求
5. **V2EX/即刻** — 开发者社区推广MCP接入

### 定价建议（从0到付费的关键）

| 服务 | 当前价 | 建议价 | 理由 |
|------|--------|--------|------|
| 违禁词检测 | 未注册 | **免费3次/天，¥0.5/次** | 引流利器，低成本高感知 |
| AI搜索可见度 | 未注册 | **¥3/次** | 竞品¥10+，低价渗透 |
| 出海合规评估 | 未注册 | **¥8/次** | 问卷式评估，成本极低 |
| SEO合规扫描 | 未注册 | **免费1次/天，¥1/次** | 引流 |
| AI Gateway | ¥10/次 | **按token计费** | 对标DeepSeek官方价+10% |

### 5个付费用户获取路径

1. **内容营销** — 知乎写"广告法违禁词避坑指南"，文末引流到ATEX免费检测
2. **MCP生态** — 开发者通过MCP接入，免费额度用完后付费
3. **出海社群** — 微信群/Slack推广出海合规评估
4. **ClawHub** — 合规Skill被调用后转化
5. **Whop** — 已上架3个产品，优化描述突出合规

---

## 五、代码修复清单

### server.py

```python
# Bug 1: 第987行局部import导致变量作用域错误
# 删除这行：
#   from payment.gateway import xunhupay_create_order
# 已在第15行顶层导入，无需重复

# Bug 2: 第992行同理
# 删除这行：
#   from payment.gateway import xunhupay_callback
# 已在第15行顶层导入
```

### services.json

```json
// 需要添加4个合规服务定义：
{
  "id": "svc_046",
  "name": "中文违禁词检测+SEO合规",
  "provider": "platform",
  "description": "检测广告法违禁词（最好/第一/国家级等），覆盖6大平台规则，给出替换建议和法律依据",
  "price": 0.5,
  "unit": "次",
  "category": "合规工具",
  "service_type": "rule",
  "status": "active",
  "total_sold": 0
},
{
  "id": "svc_047",
  "name": "中国AI搜索引擎可见度检测",
  "provider": "platform",
  "description": "检测品牌在DeepSeek/Kimi/豆包/通义/文心等AI引擎中的可见度，给出优化建议",
  "price": 3.0,
  "unit": "次",
  "category": "合规工具",
  "service_type": "hybrid",
  "status": "active",
  "total_sold": 0
},
{
  "id": "svc_048",
  "name": "中国产品出海合规评估",
  "provider": "platform",
  "description": "7维问卷式评估数据出境合规风险，给出合规路径和行动建议",
  "price": 8.0,
  "unit": "次",
  "category": "合规工具",
  "service_type": "rule",
  "status": "active",
  "total_sold": 0
},
{
  "id": "svc_049",
  "name": "中文SEO合规+违禁词扫描(6平台)",
  "provider": "platform",
  "description": "6大平台SEO合规扫描+违禁词检测，一次检测全面覆盖",
  "price": 1.0,
  "unit": "次",
  "category": "合规工具",
  "service_type": "rule",
  "status": "active",
  "total_sold": 0
}
```

### MCP tools/list 扩展

在MCP handler中添加4个合规工具定义，让MCP客户端可直接发现和调用。

---

## 六、总结

| 维度 | 现状 | 修复后 |
|------|------|--------|
| 可用服务 | 15个（0成交） | 8个（精简+合规） |
| 合规工具 | 代码有但未注册 | ✅ 注册+MCP暴露 |
| 支付 | 支付宝Bug+未配置 | ✅ 修复+配置 |
| AI Gateway | DeepSeek 402 | ✅ 充值后可用 |
| MCP工具 | 5个 | 9个（+4合规） |
| 首页 | 0个合规卡片 | 4个合规卡片 |

**最短路径**: 修3个Bug → 注册合规服务 → 配置支付 → 引流 → 5个付费用户

---

## 七、Skills包诊断

### 现状
- 43个Skills，0个ATEX合规工具Skill
- 12个已发布到ClawHub（有_meta.json）
- 4个Z-AI SDK Skills（ASR/TTS/VLM/LLM）— 通用能力，非ATEX独占
- 平台文档声称"24个ClawHub Skills发布" — 实际lite包中只有12个有发布记录

### 关键缺失
**没有合规工具Skill！** 这是最大的引流缺口：
- 违禁词检测Skill → 可在ClawHub被任何Agent调用 → 引流到ATEX付费
- AI搜索可见度Skill → 内容营销场景高频需求
- 出海合规评估Skill → 出海企业刚需
- SEO合规扫描Skill → 内容创作者刚需

### 建议：创建4个合规ClawHub Skills

每个Skill结构：
```
skills/banned-word-check/
├── SKILL.md          # 触发词+工作流
├── _meta.json        # ClawHub发布元数据
└── references/
    └── api-spec.md   # ATEX API调用说明
```

SKILL.md核心逻辑：
1. 免费调用3次（ATEX注册送5元余额）
2. 第4次起提示"ATEX Pro ¥99/月无限次"
3. 每次调用展示ATEX品牌水印

---

## 八、Web App (GitHub Pages) 诊断

### Bug: 合规工具区域在footer之后

`docs/index.html` 中合规工具section（第506-527行）位于 `</div class="footer">` 之后，导致：
- 合规工具卡片在页面底部footer下方渲染
- 用户看不到或需要滚动到页面最底部才能发现
- 与ECS首页同样的问题：合规工具"存在但不可见"

### 修复
将合规工具section（第506-527行）移到footer之前，放在页面主内容区域。

---

## 九、完整Bug/问题汇总

| # | 严重度 | 问题 | 位置 | 修复方案 |
|---|--------|------|------|----------|
| 1 | 🔴 P0 | 支付宝接口崩溃 | server.py:987 | 删除局部import |
| 2 | 🔴 P0 | DeepSeek API 402 | service_executor.py:8 | 充值/换Key |
| 3 | 🔴 P0 | 合规工具未注册 | services.json | 添加4个服务定义 |
| 4 | 🟡 P1 | MCP缺合规工具 | server.py MCP handler | 添加4个tool定义 |
| 5 | 🟡 P1 | GitHub Pages合规区在footer后 | docs/index.html:506 | 移到footer前 |
| 6 | 🟡 P1 | ECS首页合规卡片为空 | server.py:247 | 依赖Bug#3修复 |
| 7 | 🟡 P1 | NOWPayments未配置 | payment_config.json | 注册获取Key |
| 8 | 🟢 P2 | GPT-4o/Claude假接入 | service_executor.py | 接入真实API或移除 |
| 9 | 🟢 P2 | 无合规ClawHub Skills | skills/ | 创建4个Skill |
| 10 | 🟢 P2 | 订阅端点路径错误 | /api/v1/subscribe → /v1/subscription/subscribe | 文档更新 |
