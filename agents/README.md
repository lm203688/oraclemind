# Agent团队 v1.0 — 状态报告

> 完成时间：2026-07-01 17:50
> 状态：✅ 框架搭建完成，全部通过健康检查

## 文件结构

```
/home/z/my-project/agents/
├── shared/              # 共享框架
│   ├── base_agent.py    # Agent基类（项目记忆/决策日志/任务记录）
│   ├── llm_client.py    # 统一LLM客户端（glm-4-plus/flash/agnes + web_search + 多模型交叉）
│   └── project_db.py    # 项目数据库查询层（14站知识库+AIShield+ECS服务检查）
├── scout/               # 1. 情报员 (8470)
├── builder/             # 2. 工程师 (8461)
├── strategist/          # 3. 分析师 (8462)
├── growth/              # 4. 营销官 (8463)
├── guardian/            # 5. 审计师 (8450)
├── designer/            # 6. 设计师 (8464)
├── ops/                 # 7. 运营财务官 (8465)
├── researcher/          # 8. 科研员 (8466)
├── eve.py               # Eve总管调度器
└── tests/               # 测试套件
```

## 8个Agent状态

| # | Agent | 端口 | 状态 | 能力数 | 数据库 |
|---|---|---|---|---|---|
| 1 | scout (情报员) | 8470 | ✅ healthy | 6 | ✅ |
| 2 | builder (工程师) | 8461 | ✅ healthy | 6 | ✅ |
| 3 | strategist (分析师) | 8462 | ✅ healthy | 6 | ✅ |
| 4 | growth (营销官) | 8463 | ✅ healthy | 8 | ✅ |
| 5 | guardian (审计师) | 8450 | ✅ healthy | 7 | ✅ |
| 6 | designer (设计师) | 8464 | ✅ healthy | 6 | ✅ |
| 7 | operator (运营财务官) | 8465 | ✅ healthy | 8 | ✅ |
| 8 | researcher (科研员) | 8466 | ✅ healthy | 7 | ✅ |

## 测试结果

### ✅ 健康检查（8/8通过）
所有Agent：status=healthy, db_exists=True

### ✅ 项目注册（6个项目已注册）
- genetech-tools (GeneTech 14站)
- aishield (AIShield安全平台)
- roboparts (RoboParts)
- swarm-research (蜂群科研)
- healthlens (HealthLens)
- agent-trust (AgentTrust Protocol)

### ✅ 核心功能测试
- **Builder deploy_check**: 5个ECS服务 + 14个Pages站点检查
- **Guardian aishield_status**: 21工具/135审计/平均分72.1
- **Operator daily_monitor**: 每日监控+异常检测
- **Eve daily_report**: 8 Agent协调+三维度日报(运营/安全/基础设施)

### 发现的问题（已报告，等用户决策）
- ⚠️ ECS 8460蜂群科研服务不可用
- ⚠️ ECS 8431比特助手返回404

## 各Agent核心能力

### 1. 情报员 (scout)
- 互联网情报搜索（web_search）
- 14站知识库搜索（6354实体）
- 竞品监控/趋势分析/每日简报
- 项目长期情报跟踪（跨时间记忆）

### 2. 工程师 (builder)
- 代码审查（三模型交叉：glm-4-flash+plus+agnes）
- 部署状态检查（ECS 5服务 + 14站Pages）
- 技术债评估/架构建议/Bug诊断
- 项目长期技术跟踪

### 3. 分析师 (strategist)
- 商业模式分析（三模型交叉验证）
- 定价策略/市场调研/竞品分析/ROI评估
- 14站知识库作为行业数据支撑
- 项目长期商业跟踪

### 4. 营销官 (growth) — Agent原生分发执行者
- GEO内容优化（TL;DR/Schema.org/引用格式）
- Agent发现层（llms.txt/ai-plugin.json/MCP注册）
- AI搜索索引（IndexNow/robots.txt）
- API接入层（免费层/付费层/OpenAPI）
- 监控优化（GEO追踪/转化漏斗）
- 社媒内容生成（四平台适配）
- 推广方案+社媒帖子草稿（需用户确认发布）

### 5. 审计师 (guardian)
- 违禁词检测（AIShield 119规则）
- MCP工具安全扫描（21工具）
- 合规审计（GDPR/数据安全法/AI法案）
- 漏洞检查（OWASP Top 10）
- AIShield服务状态监控

### 6. 设计师 (designer)
- 设计策略（agnes分析品牌调性）
- AI图片生成（cogview-3-plus）
- 视觉审查（网页设计评估）
- 落地页优化建议
- 品牌VI系统设计

### 7. 运营财务官 (operator)
- 日常监控（ECS+14站+Creem 6产品）
- 故障响应+月度运营报告
- 收入检查（Creem API）
- 成本分析（ECS/域名/工具）
- 利润分析+定价建议

### 8. 科研员 (researcher)
- 论文深度解读（glm-4-plus+agnes交叉论证）
- 技术可行性分析（TRL评估）
- 专利分析（权利要求+规避建议）
- 前沿技术追踪
- 14站知识库关联

## Eve总管调度器

### 职责
1. 任务拆解 — 用户指令→拆成子任务
2. 分发调度 — 分配给对应Agent
3. 质量把控 — 交叉验证结果
4. 异常升级 — Agent失败时决策
5. 定期报告 — 日报/周报/月报

### 调度路由
| 任务类型 | 分配给 |
|---|---|
| 采集/搜索/监控 | scout |
| 代码/部署/bug | builder |
| 商业/定价/市场 | strategist |
| 推广/SEO/社媒 | growth |
| 安全/合规/审计 | guardian |
| 设计/UI/品牌 | designer |
| 监控/收入/成本 | operator |
| 论文/专利/技术论证 | researcher |

## 共享框架

### BaseAgent基类
- 项目注册/查询
- 决策日志记录
- 任务执行记录
- 项目记忆文件
- 成长日志+路线图
- 健康检查

### LLM客户端
- `call_llm(prompt, model)` — 单次调用
- `call_llm_multi(prompt, models)` — 多模型并行
- `synthesize(results, question)` — 综合判断
- `web_search(query, count)` — 互联网搜索

### 项目数据库
- `query_kb(site, keyword)` — 查询单站知识库
- `query_all_kb(keyword)` — 搜索所有14站
- `check_ecs_services()` — ECS服务健康检查
- `check_pages_sites()` — 14站Pages检查

## 下一步

1. **部署到ECS** — 8个Agent作为服务运行
2. **接入cron** — 运营财务官定时监控
3. **注册项目** — 6个项目注册到所有Agent
4. **实际任务测试** — 明天开始执行真实项目任务
5. **迭代优化** — 根据实际使用完善各Agent能力
