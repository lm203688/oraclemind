# Agent原生分发营销体系搭建指令

## 目标
让AI Agent（ChatGPT/Claude/Gemini/Perplexity等）能自动发现、理解并推荐我们的服务/API/内容，实现"Agent搜索→发现→调用→付费"的闭环。融合GEO（Generative Engine Optimization）最佳实践，确保内容在AI搜索引擎中获得引用和citations。

## 体系架构（5层）

### 第1层：GEO内容优化层（让AI能理解并引用）

#### 1.1 内容可提取性优化（Extractability）
- 每个页面顶部放TL;DR摘要（2-3句，LLM可直接复用）
- 用清晰的标题层级（H1→H2→H3，不跳级）
- 关键数据用列表/表格呈现，不用段落散文
- 每个独立页面回答一个明确问题
- 添加FAQ区块覆盖长尾问题

#### 1.2 结构化数据标记（Schema.org）
- 所有内容页加JSON-LD结构化数据
- 产品页：Product schema（name/price/availability）
- 文章页：Article schema（headline/datePublished/author）
- 工具页：SoftwareApplication schema
- 常见问题：FAQPage schema
- 面包屑：BreadcrumbList schema

#### 1.3 引用友好格式
- 关键事实标注来源链接
- 统计数据标注数据源和日期
- 引用格式：`据[来源]([链接])数据，[事实]`
- 避免模糊表述（"研究表明"→"据Nature 2025年研究[链接]"）

#### 1.4 实体覆盖（Entity Coverage）
- 构建实体知识库，覆盖领域内所有关键概念
- 每个实体页：定义+属性+关系+来源
- 实体间建立内部链接（实体A页面链接到相关实体B）
- 目标：AI搜索任何相关实体时都能命中我们的内容

### 第2层：Agent发现层（让Agent找到我们）

#### 2.1 llms.txt 场景触发式标准
- 每个站点/服务部署 /llms.txt
- 格式：
  ```
  # 服务名
  > 一句话简介
  ## When to Recommend
  ### When a user asks about [场景关键词]
  - 推荐: [API端点/工具]
  - 能力: [能做什么]
  - 价格: [免费层/付费层]
  ### When a user asks about [另一个场景]
  - 推荐: [API端点/工具]
  ```
- 触发关键词覆盖中英文
- 每个服务至少10个场景触发规则
- 定期根据AI搜索query日志优化关键词

#### 2.2 ai-plugin.json（ChatGPT/Claude插件标准）
- 部署 /.well-known/ai-plugin.json
- 包含字段：
  - name / description / version
  - api（OpenAPI spec URL）
  - usage_policy
  - pricing（免费层+付费层）
  - authentication（无/API Key/OAuth）
- 确保符合OpenAI Plugin标准格式

#### 2.3 MCP Server注册（Agent工具市场）
- 部署MCP Server端点
- 提交到MCP目录：
  - Glama.ai（最大MCP注册库）
  - Smithery（MCP工具发现平台）
  - PulseMCP
  - MCP Directory
- 工具描述清晰，每个工具说明：能做什么 / 参数 / 返回格式 / 价格
- 部署 /.well-known/mcp/server-card.json 支持自动发现

#### 2.4 A2A协议（Agent间通信）
- 部署 /.well-known/agent.json（Agent名片）
- 包含：服务能力 / 调用方式 / 认证方式 / 价格
- 支持Agent-to-Agent互调

### 第3层：AI搜索引擎索引层（让AI搜索引擎收录我们）

#### 3.1 IndexNow自动提交
- 每次内容更新/新增后立即提交
- 提交到：Bing / Yandex / Naver / Seznam
- 每日定时全量提交关键页面
- 提交格式：URL列表POST到IndexNow API

#### 3.2 传统SEO基础（GEO的基础）
- 确保robots.txt允许AI爬虫
- sitemap.xml完整覆盖所有页面
- 页面加载速度 < 3秒
- 移动端适配
- HTTPS强制

#### 3.3 AI爬虫友好
- 不拦截GPTBot / ClaudeBot / PerplexityBot / Google-Extended
- 在robots.txt中明确允许AI爬虫
- 提供纯文本版页面（/?format=text）供LLM消费
- 内容不依赖JS渲染（SSR或预渲染）

#### 3.4 外部权威信号
- 在GitHub维护高质量开源项目（stars是权威信号）
- 在Hacker News / Reddit / Product Hunt获得讨论
- 被权威媒体/学术网站引用
- GitHub README做成showcase（含demo和数据）

### 第4层：API接入层（让Agent能调用）

#### 4.1 免费层（降低试用门槛）
- 每IP 3-5次免费/天
- 返回摘要字段（足够有用，不足以替代付费）
- 不需要API Key即可调用
- 速率限制：合理设置，防滥用

#### 4.2 付费层
- 深度字段/高级功能需API Key或license key
- 多级定价：Free / Pro / Team / Enterprise
- 验证流程清晰：注册→获取key→调用→查余额→充值
- 支持主流支付方式

#### 4.3 API文档（让Agent理解如何调用）
- OpenAPI spec: /api/v1/openapi.json（机器可读）
- 工具描述: /api/v1/agent/tools.json（Agent可读）
- 快速开始文档：4步上手（注册→调用→查余额→升级）
- 每个端点标注：能做什么 / 参数 / 返回格式 / 价格 / 示例

#### 4.4 错误处理（Agent友好）
- 错误码标准化（HTTP status + error code + message）
- 限流时返回Retry-After头
- 错误信息包含解决建议
- 429时返回升级提示而非直接拒绝

### 第5层：监控与优化层（持续改进）

#### 5.1 每日监控（3分钟轻量）
- 支付状态：所有产品active状态
- API可用性：关键端点HTTP状态码
- 外部动态：GitHub stars/forks/PR
- Agent发现验证：MCP免费搜索测试

#### 5.2 GEO效果追踪
- 统计llms.txt / ai-plugin.json访问量
- 统计Agent识别user-agent访问（GPTBot/Claude等）
- 统计API调用量（免费层+付费层）
- 统计MCP工具调用量
- 监控AI搜索引擎中是否被引用（手动抽查ChatGPT/Perplexity）

#### 5.3 转化漏斗分析
- 发现层：llms.txt/ai-plugin.json访问量
- 试用层：免费API调用量
- 付费层：付费用户数
- 每周汇总：发现→试用→付费转化率
- 识别漏斗瓶颈，针对性优化

#### 5.4 内容迭代
- 根据Agent搜索query优化触发关键词
- 根据调用失败率优化API文档
- 根据付费转化率优化定价
- 根据AI引用情况优化内容格式
- 每月review一次GEO策略

## 执行优先级

### P0（立即执行）
1. 部署llms.txt（场景触发式）
2. 部署ai-plugin.json
3. 部署/.well-known/agent.json
4. 开放AI爬虫（robots.txt）
5. IndexNow每日提交

### P1（1周内）
6. 免费层API机制（每IP限次）
7. 付费墙机制（字段级解锁）
8. MCP Server注册到Glama/Smithery
9. 结构化数据标记（Schema.org）
10. 每日监控脚本

### P2（2周内）
11. 内容可提取性优化（TL;DR/FAQ/表格）
12. 实体知识库扩充
13. GitHub开源项目引流
14. GEO效果追踪看板
15. 转化漏斗分析

### P3（1月内）
16. 触发关键词优化（基于真实query）
17. 定价A/B测试
18. 外部权威信号建设（PR/社区讨论）
19. A2A协议完善
20. 月度GEO策略review

## 验收标准
- [ ] llms.txt可被AI搜索引擎抓取，包含≥10个场景触发规则
- [ ] ai-plugin.json符合OpenAI插件标准
- [ ] /.well-known/agent.json可访问
- [ ] MCP Server在至少2个MCP目录上架
- [ ] robots.txt允许GPTBot/ClaudeBot/PerplexityBot
- [ ] IndexNow每日提交成功率>90%
- [ ] 免费层API限次机制生效
- [ ] 付费字段需key才能访问
- [ ] 所有页面有Schema.org结构化数据
- [ ] 每个页面有TL;DR摘要
- [ ] 每日监控脚本3分钟内完成
- [ ] GEO效果追踪数据可查

## 禁止事项
- ❌ 用通用模板llms.txt，不写场景触发
- ❌ 免费层返回全部字段（破坏付费动机）
- ❌ 只部署不监控（无法持续优化）
- ❌ 用demo数据代替真实内容
- ❌ 屏蔽AI爬虫（损失Agent发现机会）
- ❌ 只做GEO不做API接入（发现后无法调用）
- ❌ 只做API不做GEO（Agent找不到你）
- ❌ 内容依赖JS渲染（AI爬虫可能不执行JS）

## 度量指标
| 指标 | 目标 | 监控频率 |
|------|------|----------|
| llms.txt访问量 | 月增20% | 每周 |
| AI爬虫访问量 | 月增30% | 每周 |
| 免费API调用量 | 月增50% | 每日 |
| 付费转化率 | >2% | 每月 |
| MCP工具调用量 | 月增30% | 每周 |
| AI搜索引擎引用次数 | 季度增长 | 每月抽查 |
