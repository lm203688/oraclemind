# agent-trust-protocol 完整备份

**备份日期**: 2026-07-01
**备份人**: 用户本人
**项目路径**: `C:\Users\ThinkPad\WorkBuddy\2026-06-04-17-04-47\agent-trust-protocol`

---

## ⚠️ 安全警告

本备份包含以下敏感信息，请妥善保管：
- npm Auth Token
- Agnes AI API Key
- 虎皮椒支付密钥
- Git 账户信息

**不要将此备份上传到任何公开仓库或云盘共享链接！**

---

## 1. 账户与凭证

### GitHub
- **仓库**: https://github.com/lm203688/agent-trust-protocol
- **用户名**: lm203688
- **Git 配置用户名**: 基因养生
- **Git 配置邮箱**: jiyin@genesmart.app
- **推送方式**: `git push origin main`（HTTPS，已验证可用）

### npm
- **用户名**: lm203688
- **已启用 2FA**: 是
- **Auth Token**: `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`
- **Token 存储位置**: `.npmrc` 和 `packages/core/.npmrc`
- **发布方式**: Granular Token + 浏览器授权（每次按 ENTER 确认）
- **包名策略**: unscoped（`agent-trust-*`），不用 scoped（`@agent-trust/*`）

### Agnes AI API
- **API Key**: `sk-KBSFxJBTWxZtA8G4nFRWjvzBwxBDbkPy9Y5tAcNLavqgoZso`
- **Base URL**: `https://apihub.agnes-ai.com/v1`
- **文本模型**: `agnes-2.0-flash`
- **图片模型**: `agnes-image-2.1-flash`
- **视频模型**: `agnes-video-v2.0`
- **用途**: Distributor Agent 周报生成（每周一 09:00 自动运行）
- **Key 管理页面**: https://platform.agnes-ai.com/settings/apiKeys
- **配置文件**: `.env`

### 虎皮椒支付
- **AppID**: `201906181178`
- **Secret**: `d856af3cab45ce0b0ae5d491a2ac94b0`
- **支付方式**: 支付宝/微信
- **回调**: 已配好（用户基础设施已有）
- **npm 包名**: `agent-trust-xunhupay`

---

## 2. 已发布的 npm 包

| 包名 | 版本 | 目录 | 状态 |
|------|------|------|------|
| `agent-trust-core` | v0.2.0 | `packages/core/` | ✅ 已发布 |
| `agent-trust-mcp-server` | v0.2.0 | `packages/mcp-server/` | ✅ 已发布 |
| `agent-trust-init` | v0.2.0 | `packages/init/` | ✅ 已发布 |
| `agent-trust-x402-listener` | v0.1.0 | `packages/x402-listener/` | ✅ 已发布 |
| `agent-trust-xunhupay` | v0.1.0 | `packages/xunhupay/` | ✅ 已发布 |
| `agent-trust` (Python) | - | `packages/python-sdk/` | 🟡 未发布到 PyPI |

> **注意**: `agent-trust-core` 和 `agent-trust-mcp-server` 已升级到 v0.2.0 代码，但 npm 上可能还是旧版本，需要手动 `npm publish`。

---

## 3. 项目当前版本 (v0.2.0)

### 核心特性
- **Ed25519 真实密钥对** (`packages/core/src/identity.ts`): 纯 JS 实现，零外部依赖
- **EWMA 时间衰减评分** (`packages/core/src/scoring.ts`): 30天半衰期
- **8 个 MCP 工具**: get_agent_trust_score / get_scoring_formula / submit_transaction / register_agent / verify_identity / vouch_for / get_trust_path / revoke_agent
- **30秒 Quick Start**: `npx agent-trust-init`
- **Python SDK**: `ensure_identity()` 一行接入 LangChain/CrewAI/AutoGen
- **微信小程序**: 5页面暗色主题骨架（`miniprogram/`），待注册 AppID
- **Agent 原生分销**: `_ecosystem` 字段注入到所有 MCP 工具响应
- **Distributor Agent**: 每周一 09:00 自动生成周报（`scripts/distributor_agent.py`）

### Git 提交历史（最近10条）
```
d2becdf feat(v0.2.0): Ed25519 identity, EWMA scoring, 8 MCP tools, Python SDK, CLI init
3e38210 research: competitive analysis 2026-06-22
bb603fd docs: add ecosystem analysis, blog post, CLI demo, and internal spec
2d48310 docs: refresh README + add comprehensive CONTRIBUTING.md
b40cf09 feat: add WeChat Mini Program (agent-trust miniprogram)
cea7c58 feat: add Distributor Agent + update .gitignore
d9abf61 feat: add Agent-native distribution (Mode 1 + Mode 2)
d5c01a0 feat: prepare for npm publish + fix TS build + add promo materials
d1906cd docs: add comprehensive publishing guide for all platforms
6669e5b feat: add AI-optimized READMEs, marketing content & package metadata
```

---

## 4. 定时任务

### Distributor Agent 周报（活跃）
- **Automation ID**: `automation-1781739855724`
- **名称**: agent-trust-distributor-weekly
- **计划**: 每周一 01:00 UTC（北京时间 09:00）
- **RRULE**: `FREQ=WEEKLY;BYDAY=MO;BYHOUR=1;BYMINUTE=0`
- **脚本**: `scripts/distributor_agent.py`
- **输出**: `weekly-suggestions/YYYY-MM-DD.md`
- **状态**: ACTIVE

### 旧任务（已停用）
- **Automation ID**: `automation-1781567055198`
- **名称**: agent-trust-weekly-review
- **状态**: PAUSED

---

## 5. GitHub Issues 状态

| # | 标题 | 状态 | 建议 |
|---|------|------|------|
| #5 | v0.1 Released — 发布公告 | Open | 可关闭（过时通知） |
| #4 | PostgreSQL 持久化适配器 | Open | 保留（有价值，`good first issue`） |
| #3 | 为什么信任基础设施必须开源 | Open | 保留（设计哲学讨论） |
| #2 | 集成 LangChain/CrewAI/AutoGen | Open | 保留（`help wanted`，Python SDK 已部分解决） |
| #1 | 信任分是否应该随时间衰减 | Open | 已在 v0.2.0 实现 EWMA，可关闭 |

---

## 6. 项目目录结构

```
agent-trust-protocol/
├── .env                          # Agnes AI API 密钥
├── .npmrc                        # npm Auth Token
├── .gitignore
├── .github/workflows/ci.yml      # GitHub Actions CI
├── package.json                  # 根 monorepo 配置
├── tsconfig.base.json
├── README.md                     # 项目说明（已更新）
├── CONTRIBUTING.md               # 贡献指南（含 API 接口草案）
├── LICENSE                       # MIT
├── ANNOUNCEMENT.md               # v0.1 发布公告
├── HN_POST.md                    # Hacker News 帖子
├── MARKETING_AI_SEO.md           # AI/SEO 优化营销内容
├── MARKETING_HN.md               # HN 营销稿
├── MARKETING_REDDIT.md           # Reddit 营销稿
├── MARKETING_TWITTER.md          # Twitter 营销稿
├── PUBLISHING_GUIDE.md           # 全平台发布指南
├── PUBLISH_GUIDE.html            # 发布指南 HTML 版
├── TEST_REPORT.md                # 测试报告
├── _integration_test.mjs         # 集成测试
├── gen_icons.py                  # 小程序图标生成脚本
│
├── packages/
│   ├── core/                     # agent-trust-core v0.2.0
│   │   ├── src/
│   │   │   ├── identity.ts       # Ed25519 密钥对 + DID:key
│   │   │   ├── scoring.ts        # EWMA 时间衰减评分
│   │   │   ├── ecosystem.ts      # 分销钩子 _ecosystem
│   │   │   ├── types.ts          # 类型定义
│   │   │   ├── store.ts          # 存储层
│   │   │   ├── issuer.ts         # VC 签发
│   │   │   ├── resolver.ts       # DID 解析
│   │   │   └── index.ts          # 导出入口
│   │   ├── dist/                 # 编译产物
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mcp-server/               # agent-trust-mcp-server v0.2.0
│   │   ├── src/
│   │   │   ├── index.ts          # 8 个 MCP 工具
│   │   │   └── tools.ts          # 工具实现 + 身份注册表
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── init/                     # agent-trust-init v0.2.0
│   │   ├── src/
│   │   │   └── cli.ts            # npx agent-trust-init
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── x402-listener/            # agent-trust-x402-listener v0.1.0
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── normaliser.ts
│   │   │   └── webhook.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── xunhupay/                 # agent-trust-xunhupay v0.1.0
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── callback.ts
│   │   │   ├── sign.ts
│   │   │   └── types.ts
│   │   ├── server/
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   ├── order-store.ts
│   │   │   └── public/pay.html
│   │   ├── data/orders.json      # 支付订单记录
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── python-sdk/               # agent-trust (Python)
│       ├── agent_trust/
│       │   ├── __init__.py       # ensure_identity() 入口
│       │   ├── identity.py       # Ed25519 + DID:key (纯 Python)
│       │   ├── scoring.py        # EWMA 评分
│       │   ├── client.py         # AgentTrustClient
│       │   └── transactions.py   # 交易提交
│       └── pyproject.toml
│
├── scripts/
│   ├── cli-demo.mjs              # CLI 演示工具
│   └── distributor_agent.py      # 周报生成 Agent
│
├── miniprogram/                  # 微信小程序
│   ├── app.js / app.json / app.wxss
│   ├── project.config.json       # AppID 占位符待替换
│   ├── sitemap.json
│   ├── static/                   # tabBar 图标 (8个PNG)
│   └── pages/
│       ├── index/                # 品牌落地页 + 微信登录
│       ├── dashboard/            # 信任分仪表盘
│       ├── agent/                # Agent 管理
│       ├── transactions/         # 交易列表
│       └── profile/              # 个人信息
│
├── docs/
│   ├── internal-spec.md          # 内部技术规范
│   └── scoring-algorithm.md      # 评分算法说明
│
├── weekly-suggestions/           # Distributor Agent 周报
│   ├── 2026-06-18.md             # 首份周报
│   ├── 2026-06-18-blog-post.md   # 技术博客稿
│   ├── 2026-06-18-ecosystem-analysis.md  # 5个目标项目分析
│   ├── 2026-06-22.md             # 第二周周报
│   ├── 2026-06-22-competitive-analysis.md  # 竞品分析
│   └── 2026-06-29.md             # 第三周周报
│
├── posters/                      # 营销海报 + 视频脚本
│   ├── poster-1-hook.html
│   ├── poster-2-code.html
│   ├── poster-3-business.html
│   ├── video-script-1-hook.md
│   ├── video-script-2-demo.md
│   └── video-script-3-story.md
│
├── videos/                       # Remotion 视频项目
│   ├── src/
│   ├── out/                      # 编译好的 MP4
│   ├── audio/                    # 背景音乐
│   └── public/
│
├── generated-images/             # AI 生成的图片素材
│
└── .workbuddy/                   # WorkBuddy 项目配置
    ├── memory/
    │   ├── MEMORY.md             # 项目长期记忆
    │   └── 2026-06-*.md          # 每日工作日志
    └── automations/
        └── automation-1781739855724/
            └── memory.md         # 定时任务执行记录
```

---

## 7. 竞品分析摘要

| 竞品 | 路线 | 威胁等级 | 我们的优势 |
|------|------|---------|-----------|
| PeerClaw | P2P通信+EWMA声誉 | 高 | 我们也有 EWMA + 支付层 |
| AIP (Nexus Guard) | 30秒Ed25519身份 | 高 | 我们也有 Ed25519 + 30秒 Quick Start |
| Sovr ATP | 量子安全+企业云 | 高 | 我们有中国市场+微信/支付宝 |
| atprotocol ATP | 纯规范文档 | 低 | 我们有完整 SDK |

**核心护城河**: xunhupay 支付集成（唯一支持微信/支付宝的 Agent 信任协议）

---

## 8. 待办事项

### 需要用户做的
- [ ] 关闭 GitHub Issue #5（发布公告，已过时）
- [ ] 发布技术博客（稿子在 `weekly-suggestions/2026-06-18-blog-post.md`）
- [ ] 注册微信小程序 AppID 并上传
- [ ] 如需发布 v0.2.0 到 npm，手动执行 `npm publish`

### 可以继续做的
- [ ] 实现 PostgreSQL 适配器（Issue #4）
- [ ] Hugging Face Space 演示页面
- [ ] Python SDK 发布到 PyPI
- [ ] CLI 工具打包为独立 npm 包

---

## 9. 恢复指南

如果需要从备份恢复：

1. **解压备份**到目标目录
2. **安装依赖**: `npm install`（根目录）+ 各子包 `npm install`
3. **编译**: 各子包 `npx tsc`
4. **配置凭证**:
   - 复制 `.env` 到项目根目录（Agnes API Key）
   - 复制 `.npmrc` 到项目根目录和 `packages/core/`（npm Token）
5. **验证**: `npx agent-trust-init` 应能生成密钥对
6. **Git**: `git remote add origin https://github.com/lm203688/agent-trust-protocol.git`

---

*本文件由 WorkBuddy 自动生成，备份日期 2026-07-01*
