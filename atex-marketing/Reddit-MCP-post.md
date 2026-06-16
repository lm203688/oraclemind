# Reddit r/MCP Post

## Title: [New MCP Server] ATEX — 23 AI services + 12 knowledge engines, one API key

### Body

Hey r/MCP! Just open-sourced an MCP Server that gives your AI assistant access to 23 AI services and 12 knowledge engines through a single API key.

## What's included

### 23 AI Services
- **Compliance tools** (for Chinese market): Banned word detection (¥0.1/call), AI search visibility (¥2), Cross-border compliance (¥8), SEO compliance (¥1)
- **AI capabilities**: TTS, ASR, VLM, Image gen/edit, Video gen, Web search/reader
- **Specialized**: Book distillation, Vector optimization, Token compression, Browser automation, Cybersecurity skill lookup/generation
- **LLM proxy**: One key for DeepSeek/GPT-4o/Claude (6 models)

### 12 Knowledge Engines (4700+ entities)
Gene tech, TCM, Agent ecosystem, Quantum computing, Brain science, Nuclear energy, Exoplanets, Alien minerals, Deep sea tech, New energy, Life science, Robotics

Auto-updated daily with latest breakthroughs.

## Quick Start

Add to your Claude Desktop config:
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

Or use the Streamable HTTP endpoint directly:
```
POST http://150.158.119.19:8420/mcp
```

## Pricing

Pay-per-use, no monthly fees, balance never expires. Cheapest tool is ¥0.1/call (~$0.014).

## Links

- GitHub: https://github.com/lm203688/atex
- MCP Server: https://github.com/lm203688/atex/tree/main/mcp-server
- Try it: https://lm203688.github.io/atex/

Feedback welcome!
