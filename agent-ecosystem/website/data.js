const DB = {
  "updated": "2026-05-29T02:27:01.449Z",
  "stats": {
    "agent_frameworks": 6,
    "tool_platforms": 5
  },
  "agent_frameworks": [
    {
      "id": "AFW-001",
      "name": "LangGraph",
      "description": "Framework for building stateful, multi-actor applications with LLMs. Extends LangChain with graph-based agent orchestration.",
      "developer": "LangChain",
      "language": "Python, JavaScript",
      "features": "Cyclic agent graphs, persistent state, human-in-the-loop, streaming, built-in persistence"
    },
    {
      "id": "AFW-002",
      "name": "CrewAI",
      "description": "Framework for orchestrating role-playing AI agents that work together as a crew to accomplish complex tasks.",
      "developer": "CrewAI",
      "language": "Python",
      "features": "Role-based agents, task delegation, sequential and parallel processes, tool integration, memory"
    },
    {
      "id": "AFW-003",
      "name": "AutoGen (AG2)",
      "description": "Microsoft's multi-agent conversation framework. Agents converse with each other to solve tasks, with optional human participation.",
      "developer": "Microsoft Research",
      "language": "Python",
      "features": "Conversational agents, code execution, group chat, human proxy, Docker execution"
    },
    {
      "id": "AFW-004",
      "name": "OpenAI Agents SDK",
      "description": "OpenAI's official agent framework with built-in guardrails, handoffs, and tracing. Designed for production agent deployments.",
      "developer": "OpenAI",
      "language": "Python",
      "features": "Agent handoffs, guardrails, tracing, function tools, structured output"
    },
    {
      "id": "AFW-005",
      "name": "Google Agent Development Kit (ADK)",
      "description": "Google's framework for building and deploying AI agents with Gemini models. Supports multi-agent systems and tool use.",
      "developer": "Google",
      "language": "Python",
      "features": "Gemini integration, tool use, multi-agent orchestration, deployment to Cloud Run"
    },
    {
      "id": "AFW-006",
      "name": "Anthropic Claude Agent Pattern",
      "description": "Anthropic's recommended patterns for building agents with Claude. Emphasizes tool use, prompt engineering, and agentic loops.",
      "developer": "Anthropic",
      "language": "Python, TypeScript",
      "features": "Tool use, computer use, extended thinking, prompt caching, streaming"
    }
  ],
  "agent_sdks": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:21:42.677Z",
    "description": "agent_sdks库",
    "entities": [
      {
        "id": "ASDK-001",
        "name": "Vercel AI SDK",
        "vendor": "Vercel",
        "language": "TypeScript",
        "type": "AI SDK",
        "version": "4.x",
        "license": "Apache-2.0",
        "features": [
          "统一API",
          "Streaming",
          "Tool Calling",
          "RAG",
          "Middleware",
          "React/Svelte/Vue组件"
        ],
        "pros": [
          "前端集成最好",
          "SSR友好",
          "框架无关"
        ],
        "cons": [
          "JS/TS only",
          "无内置多Agent"
        ],
        "maturity": "生产可用",
        "docs": "https://sdk.vercel.ai/docs"
      },
      {
        "id": "ASDK-002",
        "name": "LangChain",
        "vendor": "LangChain",
        "language": "Python/JS",
        "type": "AI框架",
        "version": "0.3+",
        "license": "MIT",
        "features": [
          "Chain编排",
          "Memory",
          "Retrieval",
          "Agent",
          "Callbacks",
          "200+集成"
        ],
        "pros": [
          "集成最多",
          "社区最大",
          "文档丰富"
        ],
        "cons": [
          "抽象层太多",
          "性能差",
          "调试难"
        ],
        "maturity": "生产可用",
        "docs": "https://python.langchain.com/docs"
      },
      {
        "id": "ASDK-003",
        "name": "LlamaIndex",
        "vendor": "LlamaIndex",
        "language": "Python/TS",
        "type": "RAG框架",
        "version": "0.12+",
        "license": "Apache-2.0",
        "features": [
          "数据摄取",
          "索引构建",
          "查询引擎",
          "Agent",
          "Workflow"
        ],
        "pros": [
          "RAG最强",
          "数据连接器多",
          "灵活"
        ],
        "cons": [
          "RAG外功能弱",
          "学习曲线"
        ],
        "maturity": "生产可用",
        "docs": "https://docs.llamaindex.ai"
      },
      {
        "id": "ASDK-004",
        "name": "Haystack",
        "vendor": "deepset",
        "language": "Python",
        "type": "RAG/搜索框架",
        "version": "2.x",
        "license": "Apache-2.0",
        "features": [
          "Pipeline",
          "组件化",
          "RAG",
          "Agent",
          "搜索"
        ],
        "pros": [
          "组件化设计",
          "生产级",
          "可测试"
        ],
        "cons": [
          "社区比LangChain小",
          "文档一般"
        ],
        "maturity": "生产可用",
        "docs": "https://docs.haystack.deepset.ai"
      },
      {
        "id": "ASDK-005",
        "name": "Semantic Kernel",
        "vendor": "Microsoft",
        "language": "C#/Python/Java",
        "type": "AI SDK",
        "version": "1.x",
        "license": "MIT",
        "features": [
          "Plugin系统",
          "Planner",
          "Memory",
          "Connector"
        ],
        "pros": [
          "企业级",
          ".NET生态",
          "微软背书"
        ],
        "cons": [
          "C#优先",
          "Python版落后",
          "社区小"
        ],
        "maturity": "生产可用",
        "docs": "https://learn.microsoft.com/en-us/semantic-kernel"
      },
      {
        "id": "ASDK-006",
        "name": "Rig",
        "vendor": "0xPlay",
        "language": "Rust",
        "type": "AI SDK",
        "version": "0.8+",
        "license": "MIT",
        "features": [
          "LLM调用",
          "Agent",
          "Tool",
          "RAG",
          "Embedding"
        ],
        "pros": [
          "Rust性能",
          "类型安全",
          "轻量"
        ],
        "cons": [
          "Rust only",
          "生态小",
          "文档少"
        ],
        "maturity": "早期",
        "docs": "https://rig.rs/docs"
      },
      {
        "id": "ASDK-007",
        "name": "Portkey AI Gateway",
        "vendor": "Portkey",
        "language": "TypeScript",
        "type": "AI网关",
        "version": "1.x",
        "license": "MIT",
        "features": [
          "多模型路由",
          "Fallback",
          "缓存",
          "限流",
          "Observability"
        ],
        "pros": [
          "模型无关",
          "生产监控",
          "成本控制"
        ],
        "cons": [
          "网关层开销",
          "依赖第三方"
        ],
        "maturity": "生产可用",
        "docs": "https://portkey.ai/docs"
      },
      {
        "id": "ASDK-008",
        "name": "Helicone",
        "vendor": "Helicone",
        "language": "TypeScript",
        "type": "AI可观测性",
        "version": "2.x",
        "license": "Apache-2.0",
        "features": [
          "日志",
          "监控",
          "缓存",
          "速率限制",
          "实验"
        ],
        "pros": [
          "开箱即用",
          "多模型支持",
          "免费层"
        ],
        "cons": [
          "需代理层",
          "延迟增加"
        ],
        "maturity": "生产可用",
        "docs": "https://docs.helicone.ai"
      }
    ]
  },
  "benchmarks": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:16:26.793Z",
    "description": "benchmarks库",
    "entities": [
      {
        "id": "BENCH-001",
        "name": "SWE-bench",
        "focus": "代码修复",
        "description": "真实GitHub issue自动修复",
        "top_score": "Claude 3.5 Sonnet ~49%",
        "adoption": "广泛"
      },
      {
        "id": "BENCH-002",
        "name": "WebArena",
        "focus": "网页操作",
        "description": "真实网页环境任务完成",
        "top_score": "~35%",
        "adoption": "学术"
      },
      {
        "id": "BENCH-003",
        "name": "AgentBench",
        "focus": "多任务",
        "description": "多场景Agent能力评估",
        "top_score": "GPT-4 ~36.9",
        "adoption": "学术"
      },
      {
        "id": "BENCH-004",
        "name": "BFCL v3",
        "focus": "函数调用",
        "description": "多语言函数调用评估",
        "top_score": "GPT-4o ~90%",
        "adoption": "广泛"
      },
      {
        "id": "BENCH-005",
        "name": "MCP兼容性测试",
        "focus": "MCP",
        "description": "MCP Server兼容性验证",
        "top_score": "N/A",
        "adoption": "新兴"
      }
    ]
  },
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:11:41.770Z",
    "description": "AI agent MCP SDK framework protocol实体库",
    "entities": []
  },
  "mcp_servers": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:16:26.793Z",
    "description": "mcp_servers库",
    "entities": [
      {
        "id": "MCP-001",
        "name": "server-filesystem",
        "full_name": "@modelcontextprotocol/server-filesystem",
        "category": "文件系统",
        "description": "读写本地文件系统",
        "protocol_version": "2025-03-26",
        "auth": "local",
        "hosts": [
          "Claude Desktop",
          "VS Code",
          "Cursor"
        ],
        "security": "本地沙箱",
        "stars": 13000,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "读写文件",
          "目录列表",
          "文件搜索"
        ]
      },
      {
        "id": "MCP-002",
        "name": "server-postgres",
        "full_name": "@modelcontextprotocol/server-postgres",
        "category": "数据库",
        "description": "PostgreSQL 数据库查询",
        "protocol_version": "2025-03-26",
        "auth": "connection_string",
        "hosts": [
          "Claude Desktop",
          "VS Code"
        ],
        "security": "只读查询模式",
        "stars": 8500,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "SQL查询",
          "schema浏览",
          "只读模式"
        ]
      },
      {
        "id": "MCP-003",
        "name": "server-github",
        "full_name": "@modelcontextprotocol/server-github",
        "category": "API",
        "description": "GitHub API 操作",
        "protocol_version": "2025-03-26",
        "auth": "OAuth token",
        "hosts": [
          "Claude Desktop",
          "VS Code",
          "Cursor"
        ],
        "security": "token权限控制",
        "stars": 7200,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "创建PR/Issue",
          "搜索代码",
          "文件操作"
        ]
      },
      {
        "id": "MCP-004",
        "name": "server-puppeteer",
        "full_name": "@modelcontextprotocol/server-puppeteer",
        "category": "浏览器",
        "description": "浏览器自动化",
        "protocol_version": "2025-03-26",
        "auth": "none",
        "hosts": [
          "Claude Desktop"
        ],
        "security": "沙箱浏览器",
        "stars": 6800,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "网页截图",
          "表单填写",
          "点击交互"
        ]
      },
      {
        "id": "MCP-005",
        "name": "server-sqlite",
        "full_name": "@modelcontextprotocol/server-sqlite",
        "category": "数据库",
        "description": "SQLite 本地数据库",
        "protocol_version": "2025-03-26",
        "auth": "none",
        "hosts": [
          "Claude Desktop",
          "VS Code"
        ],
        "security": "本地文件",
        "stars": 5900,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "SQL查询",
          "建表",
          "数据导入"
        ]
      },
      {
        "id": "MCP-006",
        "name": "server-brave-search",
        "full_name": "@modelcontextprotocol/server-brave-search",
        "category": "搜索",
        "description": "Brave 搜索引擎",
        "protocol_version": "2025-03-26",
        "auth": "API key",
        "hosts": [
          "Claude Desktop"
        ],
        "security": "API限流",
        "stars": 4500,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "网页搜索",
          "结果过滤"
        ]
      },
      {
        "id": "MCP-007",
        "name": "server-memory",
        "full_name": "@modelcontextprotocol/server-memory",
        "category": "记忆",
        "description": "Agent 持久化记忆",
        "protocol_version": "2025-03-26",
        "auth": "none",
        "hosts": [
          "Claude Desktop"
        ],
        "security": "本地存储",
        "stars": 5200,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "知识图谱",
          "实体关系",
          "持久化"
        ]
      },
      {
        "id": "MCP-008",
        "name": "firecrawl-mcp-server",
        "full_name": "firecrawl-mcp-server",
        "category": "网页抓取",
        "description": "网页内容提取和爬取",
        "protocol_version": "2025-03-26",
        "auth": "API key",
        "hosts": [
          "Claude Desktop",
          "Cursor"
        ],
        "security": "API限流",
        "stars": 3800,
        "maintainer": "Mendable",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "网页抓取",
          "批量爬取",
          "结构化提取"
        ]
      },
      {
        "id": "MCP-009",
        "name": "server-sequential-thinking",
        "full_name": "@modelcontextprotocol/server-sequential-thinking",
        "category": "推理",
        "description": "结构化思维链推理",
        "protocol_version": "2025-03-26",
        "auth": "none",
        "hosts": [
          "Claude Desktop"
        ],
        "security": "无风险",
        "stars": 4100,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "思维链",
          "分步推理",
          "动态调整"
        ]
      },
      {
        "id": "MCP-010",
        "name": "notion-mcp-server",
        "full_name": "@notionhq/notion-mcp-server",
        "category": "生产力",
        "description": "Notion 页面和数据库操作",
        "protocol_version": "2025-03-26",
        "auth": "OAuth",
        "hosts": [
          "Claude Desktop",
          "Cursor"
        ],
        "security": "token权限",
        "stars": 3200,
        "maintainer": "Notion",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "页面CRUD",
          "数据库查询",
          "搜索"
        ]
      },
      {
        "id": "MCP-011",
        "name": "server-slack",
        "full_name": "@modelcontextprotocol/server-slack",
        "category": "通信",
        "description": "Slack 消息和频道操作",
        "protocol_version": "2025-03-26",
        "auth": "Bot token",
        "hosts": [
          "Claude Desktop"
        ],
        "security": "token权限",
        "stars": 2800,
        "maintainer": "Anthropic",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "发消息",
          "读频道",
          "搜索"
        ]
      },
      {
        "id": "MCP-012",
        "name": "supabase-mcp-server",
        "full_name": "supabase-mcp-server",
        "category": "数据库",
        "description": "Supabase 数据库和认证",
        "protocol_version": "2025-03-26",
        "auth": "Service key",
        "hosts": [
          "Claude Desktop",
          "Cursor"
        ],
        "security": "key权限",
        "stars": 2600,
        "maintainer": "Supabase",
        "status": "active",
        "language": "TypeScript",
        "features": [
          "SQL查询",
          "Auth管理",
          "Storage操作"
        ]
      }
    ]
  },
  "memory_systems": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:16:26.793Z",
    "description": "memory_systems库",
    "entities": [
      {
        "id": "MEM-001",
        "name": "mem0",
        "type": "向量+图谱",
        "architecture": "混合",
        "features": [
          "自动记忆提取",
          "用户画像",
          "时间衰减"
        ],
        "open_source": true,
        "license": "MIT",
        "maturity": "生产可用",
        "pricing": "免费/Pro$29/月",
        "language": "Python"
      },
      {
        "id": "MEM-002",
        "name": "Zep",
        "type": "向量+图谱",
        "architecture": "混合",
        "features": [
          "对话记忆",
          "实体提取",
          "知识图谱"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "生产可用",
        "pricing": "免费/Cloud付费",
        "language": "Python/TS"
      },
      {
        "id": "MEM-003",
        "name": "Letta (MemGPT)",
        "type": "分层记忆",
        "architecture": "上下文+归档",
        "features": [
          "虚拟上下文管理",
          "自动分页",
          "无限上下文"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "生产可用",
        "pricing": "免费/Cloud付费",
        "language": "Python"
      },
      {
        "id": "MEM-004",
        "name": "Cognee",
        "type": "知识图谱",
        "architecture": "Graph RAG",
        "features": [
          "自动知识图谱构建",
          "实体关系推理"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "早期",
        "pricing": "免费",
        "language": "Python"
      },
      {
        "id": "MEM-005",
        "name": "Graphiti",
        "type": "知识图谱",
        "architecture": "时序图谱",
        "features": [
          "自动演化图谱",
          "时间推理",
          "非结构化输入"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "早期",
        "pricing": "免费",
        "language": "Python"
      },
      {
        "id": "MEM-006",
        "name": "Hindsight",
        "type": "对话记忆",
        "architecture": "向量",
        "features": [
          "对话摘要",
          "关键信息提取",
          "上下文窗口"
        ],
        "open_source": true,
        "license": "MIT",
        "maturity": "早期",
        "pricing": "免费",
        "language": "Python"
      }
    ]
  },
  "model_apis": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:21:42.676Z",
    "description": "model_apis库",
    "entities": [
      {
        "id": "API-001",
        "name": "OpenAI API",
        "vendor": "OpenAI",
        "type": "LLM API",
        "models": [
          "GPT-4o",
          "GPT-4o-mini",
          "o1",
          "o3-mini",
          "DALL-E 3",
          "Whisper",
          "TTS"
        ],
        "pricing_input": "$2.5/1M tokens (GPT-4o)",
        "pricing_output": "$10/1M tokens (GPT-4o)",
        "context_window": "128K",
        "features": [
          "Chat Completions",
          "Function Calling",
          "Vision",
          "Structured Output",
          "Batch API",
          "Fine-tuning",
          "Assistants API"
        ],
        "rate_limit": "Tier1: 500 RPM",
        "sdk_languages": [
          "Python",
          "Node.js",
          "Go",
          "Java",
          "C#"
        ],
        "docs": "https://platform.openai.com/docs",
        "status": "生产可用"
      },
      {
        "id": "API-002",
        "name": "Anthropic API",
        "vendor": "Anthropic",
        "type": "LLM API",
        "models": [
          "Claude 3.5 Sonnet",
          "Claude 3.5 Haiku",
          "Claude 3 Opus"
        ],
        "pricing_input": "$3/1M tokens (Sonnet)",
        "pricing_output": "$15/1M tokens (Sonnet)",
        "context_window": "200K",
        "features": [
          "Messages API",
          "Tool Use",
          "Vision",
          "MCP Support",
          "Prompt Caching",
          "Extended Thinking"
        ],
        "rate_limit": "Tier1: 1000 RPM",
        "sdk_languages": [
          "Python",
          "Node.js"
        ],
        "docs": "https://docs.anthropic.com",
        "status": "生产可用"
      },
      {
        "id": "API-003",
        "name": "Google Gemini API",
        "vendor": "Google",
        "type": "LLM API",
        "models": [
          "Gemini 2.0 Flash",
          "Gemini 2.5 Pro",
          "Gemini 1.5 Pro"
        ],
        "pricing_input": "$1.25/1M tokens (Flash)",
        "pricing_output": "$5/1M tokens (Flash)",
        "context_window": "1M-2M",
        "features": [
          "Generate Content",
          "Function Calling",
          "Vision",
          "Code Execution",
          "Grounding",
          "Context Caching"
        ],
        "rate_limit": "Free: 15 RPM, Pay: 2000 RPM",
        "sdk_languages": [
          "Python",
          "Node.js",
          "Go",
          "Java",
          "Dart"
        ],
        "docs": "https://ai.google.dev/docs",
        "status": "生产可用"
      },
      {
        "id": "API-004",
        "name": "DeepSeek API",
        "vendor": "DeepSeek",
        "type": "LLM API",
        "models": [
          "DeepSeek-V3",
          "DeepSeek-R1"
        ],
        "pricing_input": "$0.27/1M tokens",
        "pricing_output": "$1.1/1M tokens",
        "context_window": "128K",
        "features": [
          "Chat Completions",
          "FIM",
          "JSON Output",
          "Function Calling"
        ],
        "rate_limit": "按余额",
        "sdk_languages": [
          "OpenAI兼容"
        ],
        "docs": "https://platform.deepseek.com/api-docs",
        "status": "生产可用"
      },
      {
        "id": "API-005",
        "name": "智谱AI API",
        "vendor": "智谱AI",
        "type": "LLM API",
        "models": [
          "GLM-4",
          "GLM-4V",
          "GLM-4-Flash"
        ],
        "pricing_input": "¥0.1/1M tokens (Flash)",
        "pricing_output": "¥0.1/1M tokens (Flash)",
        "context_window": "128K",
        "features": [
          "Chat Completions",
          "Function Calling",
          "Vision",
          "Web Search",
          "Code Interpreter"
        ],
        "rate_limit": "按套餐",
        "sdk_languages": [
          "Python",
          "Node.js",
          "Java"
        ],
        "docs": "https://open.bigmodel.cn/dev/api",
        "status": "生产可用"
      },
      {
        "id": "API-006",
        "name": "Mistral API",
        "vendor": "Mistral AI",
        "type": "LLM API",
        "models": [
          "Mistral Large",
          "Mistral Medium",
          "Codestral",
          "Pixtral"
        ],
        "pricing_input": "$2/1M tokens (Large)",
        "pricing_output": "$6/1M tokens (Large)",
        "context_window": "128K",
        "features": [
          "Chat Completions",
          "Function Calling",
          "Vision",
          "Embeddings",
          "Agents API"
        ],
        "rate_limit": "按套餐",
        "sdk_languages": [
          "Python",
          "Node.js"
        ],
        "docs": "https://docs.mistral.ai",
        "status": "生产可用"
      },
      {
        "id": "API-007",
        "name": "Cohere API",
        "vendor": "Cohere",
        "type": "LLM/RAG API",
        "models": [
          "Command R+",
          "Command R",
          "Embed v3",
          "Rerank v3"
        ],
        "pricing_input": "$2.5/1M tokens (R+)",
        "pricing_output": "$10/1M tokens (R+)",
        "context_window": "128K",
        "features": [
          "Chat",
          "RAG",
          "Embeddings",
          "Rerank",
          "Connectors",
          "Fine-tuning"
        ],
        "rate_limit": "按套餐",
        "sdk_languages": [
          "Python",
          "Node.js"
        ],
        "docs": "https://docs.cohere.com",
        "status": "生产可用"
      },
      {
        "id": "API-008",
        "name": "Groq API",
        "vendor": "Groq",
        "type": "推理加速API",
        "models": [
          "Llama 3.3 70B",
          "Mixtral 8x7B",
          "Gemma 2 9B"
        ],
        "pricing_input": "$0.59/1M tokens",
        "pricing_output": "$0.79/1M tokens",
        "context_window": "128K",
        "features": [
          "超低延迟推理",
          "OpenAI兼容",
          "Chat Completions",
          "Vision"
        ],
        "rate_limit": "按套餐",
        "sdk_languages": [
          "OpenAI兼容"
        ],
        "docs": "https://console.groq.com/docs",
        "status": "生产可用"
      },
      {
        "id": "API-009",
        "name": "Together AI API",
        "vendor": "Together AI",
        "type": "推理平台",
        "models": [
          "200+开源模型",
          "Llama 3",
          "Qwen 2.5",
          "DeepSeek"
        ],
        "pricing_input": "$0.18/1M tokens (Llama3)",
        "pricing_output": "$0.18/1M tokens",
        "context_window": "128K",
        "features": [
          "Serverless推理",
          "Fine-tuning",
          "Embeddings",
          "Image Gen"
        ],
        "rate_limit": "按余额",
        "sdk_languages": [
          "OpenAI兼容"
        ],
        "docs": "https://docs.together.ai",
        "status": "生产可用"
      },
      {
        "id": "API-010",
        "name": "Fireworks AI API",
        "vendor": "Fireworks AI",
        "type": "推理平台",
        "models": [
          "Llama 3.3",
          "Qwen 2.5",
          "Mixtral",
          "Whisper"
        ],
        "pricing_input": "$0.2/1M tokens",
        "pricing_output": "$0.2/1M tokens",
        "context_window": "128K",
        "features": [
          "Serverless推理",
          "Fine-tuning",
          "Vision",
          "Function Calling"
        ],
        "rate_limit": "按余额",
        "sdk_languages": [
          "OpenAI兼容"
        ],
        "docs": "https://docs.fireworks.ai",
        "status": "生产可用"
      },
      {
        "id": "API-011",
        "name": "Perplexity API",
        "vendor": "Perplexity",
        "type": "搜索AI API",
        "models": [
          "Sonar",
          "Sonar Pro",
          "Sonar Reasoning"
        ],
        "pricing_input": "$1/1M tokens",
        "pricing_output": "$1/1M tokens",
        "context_window": "128K",
        "features": [
          "实时搜索",
          "引用来源",
          "Pro深度搜索"
        ],
        "rate_limit": "按套餐",
        "sdk_languages": [
          "Python",
          "Node.js"
        ],
        "docs": "https://docs.perplexity.ai",
        "status": "生产可用"
      },
      {
        "id": "API-012",
        "name": "ElevenLabs API",
        "vendor": "ElevenLabs",
        "type": "TTS/STT API",
        "models": [
          "eleven_multilingual_v2",
          "eleven_turbo_v2",
          "eleven_monolingual_v1"
        ],
        "pricing_input": "$0.18/1K chars",
        "pricing_output": "N/A",
        "context_window": "N/A",
        "features": [
          "TTS",
          "STT",
          "Voice Cloning",
          "Sound Effects",
          "Dubbing"
        ],
        "rate_limit": "按套餐",
        "sdk_languages": [
          "Python",
          "Node.js"
        ],
        "docs": "https://elevenlabs.io/docs/api-reference",
        "status": "生产可用"
      }
    ]
  },
  "protocols": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:16:26.793Z",
    "description": "protocols库",
    "entities": [
      {
        "id": "PROTO-001",
        "name": "MCP (Model Context Protocol)",
        "vendor": "Anthropic",
        "version": "2025-03-26",
        "layer": "Agent-Tool",
        "description": "让AI Agent连接外部工具和数据源的开放协议",
        "architecture": "Client-Server",
        "transport": "stdio/SSE/StreamableHTTP",
        "security": "进程隔离/权限控制",
        "adoption": "广泛",
        "github_stars": "30000+",
        "status": "事实标准"
      },
      {
        "id": "PROTO-002",
        "name": "A2A (Agent-to-Agent)",
        "vendor": "Google",
        "version": "0.1",
        "layer": "Agent-Agent",
        "description": "让不同框架的AI Agent互相通信和协作",
        "architecture": "P2P/Hub",
        "transport": "HTTP/JSON-RPC",
        "security": "Agent Card认证",
        "adoption": "快速增长(50+合作伙伴)",
        "github_stars": "5000+",
        "status": "快速增长"
      },
      {
        "id": "PROTO-003",
        "name": "ACP (Agent Communication Protocol)",
        "vendor": "IBM/BEA",
        "version": "0.1",
        "layer": "Agent-Agent",
        "description": "IBM主导的Agent通信协议",
        "architecture": "Hub-Spoke",
        "transport": "HTTP/gRPC",
        "security": "企业级安全",
        "adoption": "IBM生态",
        "github_stars": "500",
        "status": "早期"
      },
      {
        "id": "PROTO-004",
        "name": "OpenClaw Skill Protocol",
        "vendor": "OpenClaw",
        "version": "1.0",
        "layer": "Agent-Skill",
        "description": "Agent技能描述和分发协议",
        "architecture": "Registry",
        "transport": "npm/git",
        "security": "沙箱执行/权限声明",
        "adoption": "OpenClaw生态",
        "github_stars": "2000",
        "status": "活跃"
      },
      {
        "id": "PROTO-005",
        "name": "LSP (Language Server Protocol)",
        "vendor": "Microsoft",
        "version": "3.17",
        "layer": "Editor-Language",
        "description": "编辑器与语言服务通信协议",
        "architecture": "Client-Server",
        "transport": "stdio/HTTP",
        "security": "进程隔离",
        "adoption": "广泛",
        "github_stars": "11000",
        "status": "成熟标准"
      }
    ]
  },
  "sdks": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:16:26.793Z",
    "description": "sdks库",
    "entities": [
      {
        "id": "SDK-001",
        "name": "Claude Agent SDK",
        "vendor": "Anthropic",
        "language": "Python",
        "type": "Agent SDK",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "生产可用",
        "features": [
          "原生MCP支持",
          "多步骤agent",
          "guardrails"
        ],
        "pros": [
          "Anthropic官方",
          "MCP原生集成",
          "安全护栏"
        ],
        "cons": [
          "仅Claude模型",
          "较新生态小"
        ]
      },
      {
        "id": "SDK-002",
        "name": "OpenAI Agents SDK",
        "vendor": "OpenAI",
        "language": "Python",
        "type": "Agent SDK",
        "multi_agent": true,
        "tool_use": true,
        "memory": false,
        "streaming": true,
        "maturity": "生产可用",
        "features": [
          "Agent交接",
          "guardrails",
          "tracing"
        ],
        "pros": [
          "OpenAI官方",
          "Agent交接优雅",
          "内置tracing"
        ],
        "cons": [
          "仅OpenAI模型",
          "无内置记忆"
        ]
      },
      {
        "id": "SDK-003",
        "name": "Google ADK",
        "vendor": "Google",
        "language": "Python",
        "type": "Agent SDK",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "早期",
        "features": [
          "A2A协议原生",
          "多Agent编排",
          "内置评估"
        ],
        "pros": [
          "A2A原生",
          "Google生态",
          "多模型支持"
        ],
        "cons": [
          "非常新",
          "文档少",
          "生态小"
        ]
      },
      {
        "id": "SDK-004",
        "name": "LangGraph",
        "vendor": "LangChain",
        "language": "Python/JS",
        "type": "Agent框架",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "生产可用",
        "features": [
          "状态图",
          "持久化",
          "人机协作",
          "时间旅行调试"
        ],
        "pros": [
          "最成熟",
          "社区大",
          "可视化调试"
        ],
        "cons": [
          "学习曲线陡",
          "复杂度高",
          "性能开销大"
        ]
      },
      {
        "id": "SDK-005",
        "name": "CrewAI",
        "vendor": "CrewAI",
        "language": "Python",
        "type": "Agent框架",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "生产可用",
        "features": [
          "角色定义",
          "任务委派",
          "流程编排",
          "记忆系统"
        ],
        "pros": [
          "概念直观",
          "上手快",
          "角色扮演模式"
        ],
        "cons": [
          "灵活性有限",
          "调试困难",
          "企业版收费"
        ]
      },
      {
        "id": "SDK-006",
        "name": "AutoGen/AG2",
        "vendor": "Microsoft",
        "language": "Python",
        "type": "Agent框架",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "生产可用",
        "features": [
          "对话式多Agent",
          "代码执行",
          "人机协作"
        ],
        "pros": [
          "微软背书",
          "研究导向",
          "灵活对话模式"
        ],
        "cons": [
          "API不稳定",
          "文档混乱",
          "版本迁移痛苦"
        ]
      },
      {
        "id": "SDK-007",
        "name": "Smolagents",
        "vendor": "HuggingFace",
        "language": "Python",
        "type": "Agent框架",
        "multi_agent": false,
        "tool_use": true,
        "memory": false,
        "streaming": true,
        "maturity": "早期",
        "features": [
          "轻量级",
          "代码Agent",
          "HF模型集成"
        ],
        "pros": [
          "极简",
          "HF生态",
          "代码优先"
        ],
        "cons": [
          "单Agent",
          "功能少",
          "生态小"
        ]
      },
      {
        "id": "SDK-008",
        "name": "Pydantic AI",
        "vendor": "Pydantic",
        "language": "Python",
        "type": "Agent框架",
        "multi_agent": false,
        "tool_use": true,
        "memory": false,
        "streaming": true,
        "maturity": "早期",
        "features": [
          "类型安全",
          "依赖注入",
          "多模型支持"
        ],
        "pros": [
          "类型安全",
          "Pydantic生态",
          "模型无关"
        ],
        "cons": [
          "单Agent",
          "无记忆",
          "新项目"
        ]
      },
      {
        "id": "SDK-009",
        "name": "Mastra",
        "vendor": "Mastra",
        "language": "TypeScript",
        "type": "Agent框架",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "早期",
        "features": [
          "TypeScript原生",
          "工作流",
          "RAG集成"
        ],
        "pros": [
          "TS开发者友好",
          "全栈方案"
        ],
        "cons": [
          "TS only",
          "新项目",
          "社区小"
        ]
      },
      {
        "id": "SDK-010",
        "name": "Dify",
        "vendor": "LangGenius",
        "language": "Python/TS",
        "type": "Agent平台",
        "multi_agent": true,
        "tool_use": true,
        "memory": true,
        "streaming": true,
        "maturity": "生产可用",
        "features": [
          "可视化编排",
          "插件市场",
          "RAG",
          "工作流"
        ],
        "pros": [
          "低代码",
          "可视化",
          "插件生态",
          "中文友好"
        ],
        "cons": [
          "定制性差",
          "性能开销",
          "复杂场景受限"
        ]
      }
    ]
  },
  "tool_platforms": [
    {
      "id": "TPLAT-001",
      "name": "Composio",
      "description": "Integration platform providing 250+ pre-built tools for AI agents (GitHub, Slack, Salesforce, Gmail, etc.). Handles authentication and API management.",
      "type": "Tool integration platform",
      "features": "250+ tools, managed auth, function calling format, observability"
    },
    {
      "id": "TPLAT-002",
      "name": "Toolhouse",
      "description": "Cloud-based tool execution platform for AI agents. Provides a universal tool API that works with any LLM.",
      "type": "Tool execution platform",
      "features": "Universal tool API, cloud execution, no local setup, browser automation, code execution"
    },
    {
      "id": "TPLAT-003",
      "name": "Browserbase",
      "description": "Headless browser infrastructure for AI agents. Provides scalable browser sessions for web automation, scraping, and testing.",
      "type": "Browser infrastructure",
      "features": "Scalable headless browsers, stealth mode, CAPTCHA handling, session persistence"
    },
    {
      "id": "TPLAT-004",
      "name": "E2B (Code Interpreter SDK)",
      "description": "Secure sandboxed cloud environments for AI agents to execute code. Provides isolated compute with filesystem, process, and network access.",
      "type": "Code execution sandbox",
      "features": "Sandboxed Python/JS execution, filesystem access, package installation, 100ms startup"
    },
    {
      "id": "TPLAT-005",
      "name": "MCP Hub / Smithery",
      "description": "Directories and registries for MCP (Model Context Protocol) servers. Discover and install tools for AI agents.",
      "type": "MCP registry",
      "features": "MCP server discovery, one-click install, community ratings, compatibility info"
    }
  ],
  "vector_dbs": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T06:21:42.677Z",
    "description": "vector_dbs库",
    "entities": [
      {
        "id": "VDB-001",
        "name": "Pinecone",
        "type": "托管向量数据库",
        "pricing": "免费/Starter$25/月",
        "features": [
          "自动扩缩",
          "元数据过滤",
          "命名空间",
          "稀疏向量"
        ],
        "open_source": false,
        "maturity": "生产可用",
        "language": "Python/Node.js"
      },
      {
        "id": "VDB-002",
        "name": "Weaviate",
        "type": "向量+图谱数据库",
        "pricing": "免费/Cloud付费",
        "features": [
          "混合搜索",
          "多模态",
          "RAG模块",
          "GraphQL"
        ],
        "open_source": true,
        "license": "BSD-3",
        "maturity": "生产可用",
        "language": "Python/Node.js/Go/Java"
      },
      {
        "id": "VDB-003",
        "name": "Qdrant",
        "type": "向量数据库",
        "pricing": "免费/Cloud付费",
        "features": [
          "高性嫩过滤",
          "量化压缩",
          "命名空间",
          "Payload过滤"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "生产可用",
        "language": "Python/Node.js/Rust"
      },
      {
        "id": "VDB-004",
        "name": "ChromaDB",
        "type": "嵌入式向量数据库",
        "pricing": "免费",
        "features": [
          "嵌入式/Server",
          "自动嵌入",
          "元数据",
          "相似度搜索"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "生产可用",
        "language": "Python/JS"
      },
      {
        "id": "VDB-005",
        "name": "Milvus",
        "type": "分布式向量数据库",
        "pricing": "免费/Cloud付费",
        "features": [
          "十亿级向量",
          "GPU加速",
          "多索引",
          "标量过滤"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "生产可用",
        "language": "Python/Node.js/Go/Java/C++"
      },
      {
        "id": "VDB-006",
        "name": "pgvector",
        "type": "PostgreSQL扩展",
        "pricing": "免费",
        "features": [
          "SQL集成",
          "IVFFlat/HNSW索引",
          "无需新基础设施"
        ],
        "open_source": true,
        "license": "PostgreSQL",
        "maturity": "生产可用",
        "language": "SQL"
      },
      {
        "id": "VDB-007",
        "name": "LanceDB",
        "type": "Serverless向量数据库",
        "pricing": "免费",
        "features": [
          "嵌入式",
          "列存储",
          "版本管理",
          "零拷贝"
        ],
        "open_source": true,
        "license": "Apache-2.0",
        "maturity": "早期",
        "language": "Python/Node.js/Rust"
      },
      {
        "id": "VDB-008",
        "name": "Neo4j + Vector",
        "type": "图+向量数据库",
        "pricing": "免费/Enterprise",
        "features": [
          "知识图谱+向量",
          "Cypher查询",
          "GDS算法"
        ],
        "open_source": true,
        "license": "GPLv3(社区)",
        "maturity": "生产可用",
        "language": "Python/JS/Java/Go"
      }
    ]
  }
};
