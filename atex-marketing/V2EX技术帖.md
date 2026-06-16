# V2EX 技术帖

## 标题：[分享] 开源了一个 MCP Server — 23 个 AI 服务 + 12 个知识库，一个 API Key 搞定

### 正文

大家好，最近在做 AI Agent 相关的项目，需要一个统一的后端来调用各种 AI 能力，于是做了 ATEX —— 一个 MCP 协议兼容的 AI 服务市场。

### 它是什么

ATEX 是一个自托管的 AI 服务市场，支持 MCP 协议（Streamable HTTP + Stdio），可以给 Claude Desktop / Cursor / Windsurf 等任何 MCP 客户端即插即用。

### 它能做什么

**23 个 AI 服务：**
- 4 个合规工具：中文违禁词检测(¥0.1)、AI搜索可见度(¥2)、出海合规(¥8)、SEO合规(¥1)
- 8 个 AI 能力：TTS/ASR/VLM/图片生成/编辑/视频生成/Web搜索/阅读
- 6 个专业工具：书籍蒸馏/向量优化/Token压缩/浏览器自动化/安全技能查询/生成
- LLM 代理：一个 Key 切换 DeepSeek/GPT-4o/Claude 等 6 个模型

**12 个前沿科技知识库（4700+ 实体）：**
基因技术/中医药/Agent生态/量子计算/脑科学/核能/系外行星/外星矿物/深海科技/新能源/生命科学/机器人

每天自动深挖最新突破，数据结构化入库。

### 怎么用

**1. MCP 接入（推荐）：**

Claude Desktop 配置：
```json
{
  "mcpServers": {
    "atex": {
      "command": "npx",
      "args": ["-y", "github:lm203688/atex/mcp-server"],
      "env": { "ATEX_API_KEY": "your-key" }
    }
  }
}
```

**2. REST API：**
```bash
# 违禁词检测
curl -X POST http://150.158.119.19:8420/api/v1/services/buy \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"service_id":"svc_046","args":{"text":"全网最低价","platform":"douyin"}}'

# 知识库搜索
curl -X POST http://150.158.119.19:8420/mcp \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"knowledge_search","arguments":{"query":"CRISPR","engine":"genetech"}}}'
```

**3. OpenAI 兼容接口：**
```python
from openai import OpenAI
client = OpenAI(base_url="http://150.158.119.19:8420/v1", api_key="YOUR_KEY")
```

### 定价

按次计费，无月费，余额永不过期。最便宜的违禁词检测 1 毛钱一次。

### 链接

- GitHub: https://github.com/lm203688/atex
- MCP Server: https://github.com/lm203688/atex/tree/main/mcp-server
- 在线体验: https://lm203688.github.io/atex/
- 充值: https://genetech.tools/credits.html

欢迎试用和反馈！
