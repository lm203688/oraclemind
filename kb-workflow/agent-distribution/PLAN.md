# Agent原生分发机制营销 — 改造方案

## 核心逻辑
让AI Agent（ChatGPT/Claude/Perplexity/Cursor等）能：
1. **发现** → 通过MCP目录/Plugin Store/搜索引擎找到我们的知识库
2. **理解** → 通过llms.txt/OpenAPI/schema.org理解API能力
3. **调用** → 通过MCP Server/Function Calling直接调用
4. **推荐** → Agent在回答用户问题时主动引用我们的数据
5. **变现** → 免费tier引流 → 超出跳转ATEX付费

## 分工

### Eve负责（架构/代码/审核）
1. 改造llms.txt为FAQ格式（AI更容易引用）
2. 创建schema.org结构化数据（FAQPage/Dataset）
3. 创建agent-discovery.json（统一发现入口）
4. 改造MCP Server增加branding和变现层
5. 创建MCP目录提交脚本

### 小乌负责（重复性/提交/数据整理）
1. 向Smithery.ai提交MCP Server
2. 向Glama.ai提交MCP Server  
3. 向mcp.so提交MCP Server
4. 向Google AI提交llms.txt（GSC）
5. 向各AI搜索引擎提交sitemap
6. 生成各站的FAQ内容

## 具体任务清单

### Phase 1: 基础设施改造（Eve）
- [ ] 改造12站llms.txt为FAQ格式
- [ ] 12站添加schema.org FAQPage JSON-LD
- [ ] 12站添加agent-discovery.json
- [ ] 12站API响应添加branding header

### Phase 2: MCP Server增强（Eve）
- [ ] MCP Server增加free-tier限制逻辑
- [ ] MCP Server响应添加affiliate链接
- [ ] MCP Server添加12站的search工具
- [ ] MCP Server发布到npm

### Phase 3: 分发渠道提交（小乌）
- [ ] Smithery.ai提交
- [ ] Glama.ai提交
- [ ] mcp.so提交
- [ ] Google Search Console提交sitemap
- [ ] Bing Webmaster提交
- [ ] 向AI搜索引擎（Perplexity/You.com）提交

### Phase 4: GEO优化（小乌）
- [ ] 生成12站FAQ内容
- [ ] 生成12站结构化摘要
- [ ] 提交到Google AI模式
- [ ] 监控AI搜索引擎引用情况
