# GeneTech 12站知识引擎

12个前沿科学领域结构化知识库，Agent可读的JSON API。

## 站点

| # | 领域 | 域名 | 实体数 |
|---|------|------|--------|
| 1 | 基因技术 | genetech.tools | 525 |
| 2 | 中医药 | tcm.genetech.tools | 63 |
| 3 | Agent生态 | agent.genetech.tools | 447 |
| 4 | 机器人 | robot.genetech.tools | 260 |
| 5 | 量子计算 | quantum.genetech.tools | 365 |
| 6 | 脑科学 | brain.genetech.tools | 390 |
| 7 | 核能 | nuclear.genetech.tools | 309 |
| 8 | 地外科学 | exo.genetech.tools | 345 |
| 9 | 外星矿物 | mineral.genetech.tools | 292 |
| 10 | 深海科技 | deepsea.genetech.tools | 333 |
| 11 | 新能源 | energy.genetech.tools | 492 |
| 12 | 生命科学 | life.genetech.tools | 511 |

## 目录结构

```
genetech-tools/          # 每站目录
├── knowledge-base/      # 结构化知识数据 (JSON)
├── website/             # 前端页面 + API (Cloudflare Pages)
├── config/              # 关键词/数据源配置
└── scripts/             # 部署脚本

kb-workflow/             # 12站工作流
├── agent-distribution/  # GEO/Agent原生分发
├── agent-layer/         # Agent API配置
├── credits-system/      # Creem支付集成
├── deep-mine/           # 数据深挖脚本
├── scripts/             # 通用脚本
├── templates/           # 模板
├── promo-content/       # 推广内容
├── workers/             # CF Workers
├── logs/                # 日志
└── reports/             # 报告
```

## 技术栈

- 前端: 纯静态HTML + JS (Cloudflare Pages)
- API: Cloudflare Pages Functions
- 支付: Creem (共享商户)
- 数据: JSON (知识库 + OpenAPI schema)
- Agent接口: llms.txt + agent-discovery.json + ai-plugin.json

## 合作伙伴

- [ATEX](../atex/) — Agent工具交易平台 (独立项目)
