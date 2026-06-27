# Product Hunt / Hacker News Launch Content

## Show HN Title
Show HN: I built 12 AI Agent-native knowledge bases with 4,000+ structured entities

## Body
Hi HN! I've been building a network of 12 frontier science knowledge bases that are designed to be queried by AI agents, not just humans.

**What it is:**
- 12 domains: gene tech, quantum computing, brain science, nuclear energy, exo-science, deep sea tech, AI agents, robotics, new energy, life science, alien minerals, TCM
- 4,000+ structured entities with cross-domain relationships
- REST API + MCP protocol + OpenAPI 3.1 schema
- llms.txt for AI discovery, agent-discovery.json for agent navigation

**Why?**
Wikipedia is great for humans but terrible for AI agents. The data is unstructured, there's no API, and you can't programmatically query "show me all CRISPR applications for sickle cell disease with clinical trial status."

Each knowledge base has:
- Structured JSON entities (not HTML scraping)
- Cross-domain references (gene → disease → therapy → company)
- AI Agent discovery layer (MCP + OpenAPI + llms.txt)
- Free tier: 30 API calls/hour, no signup needed

**Tech stack:** Cloudflare Pages + Functions (edge), pure static JSON files, zero backend server.

**Try it:**
```bash
curl https://genetech-tools.pages.dev/api/entities.json | jq '.total'
curl https://agentecosystem.pages.dev/api/entities.json | jq '.entities[0]'
```

Free API key: https://genetech.tools/api-key

I'd love feedback on the data quality, API design, and what domains you'd want to see next.

## Reddit Title  
12 AI Agent-native knowledge bases with 4,000+ structured entities — free API, no signup

## 即刻/V2EX
12个AI Agent原生知识库，4000+结构化实体，覆盖基因技术/量子计算/脑科学/核能/地外科学/深海科技等12个前沿领域
- REST API + MCP协议 + OpenAPI 3.1
- llms.txt 让AI Agent自动发现
- 免费tier：30次/小时，无需注册
- 跨领域关联：基因→疾病→疗法→公司

试试：
curl https://genetech-tools.pages.dev/api/entities.json
