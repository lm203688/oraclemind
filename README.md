# 🧬 GeneTech Knowledge Engine — 12 AI Agent-Native Knowledge Bases

> **4,000+ structured entities across 12 frontier technology domains. Free REST API. MCP-compatible. Built for AI agents.**

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://genetech-tools.pages.dev/api/entities.json)
[![Entities](https://img.shields.io/badge/Entities-4,075+-blue)](https://genetech.tools)
[![MCP Server](https://img.shields.io/badge/MCP-Available-purple)](#mcp-server)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 What is this?

12 specialized knowledge bases covering frontier science & technology domains. Each domain has hundreds of structured JSON entities — genes, diseases, quantum algorithms, MCP servers, deep-sea organisms, exoplanets, and more.

**Built for the AI Agent era:** Every entity is machine-readable, cross-referenced, and accessible via REST API + MCP protocol.

## 🔥 Try it right now (no signup)

```bash
curl https://genetech-tools.pages.dev/api/entities.json | jq '.total'
# → 422

curl -X POST https://genetech-tools.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
# → {"api_key":"gtk_...","plan":"free"}
```

## 🤖 MCP Server

Use in Claude Desktop, Cursor, or any MCP-compatible AI agent:

```json
{
  "mcpServers": {
    "genetech": {
      "command": "npx",
      "args": ["@frontierkb/mcp-server"]
    }
  }
}
```

See [`mcp-server/`](mcp-server/) directory.

## 📦 SDK

```bash
npm install github:lm203688/kb-ecosystem
```

```javascript
import { GeneTech } from 'genetech-kb';
const kb = new GeneTech();
const entities = await kb.getEntities('genetech');
```

See [`sdk/`](sdk/) directory.

## 📊 12 Knowledge Domains

| Domain | Entities | API Base |
|--------|----------|----------|
| 🧬 Gene Technology | 422 | `genetech-tools.pages.dev/api/` |
| 🧪 Life Science | 511 | `lifescience-epe.pages.dev/api/` |
| ⚡ New Energy | 492 | `newenergy-nya.pages.dev/api/` |
| 🤖 Agent Ecosystem | 433 | `agentecosystem.pages.dev/api/` |
| 🧠 Brain Science | 347 | `brainscience.pages.dev/api/` |
| 🚀 Exo-Science | 336 | `exoscience.pages.dev/api/` |
| 🌊 Deep-Sea Tech | 322 | `deepseatech.pages.dev/api/` |
| ⚛️ Quantum | 317 | `quantumcomputing.pages.dev/api/` |
| 💎 Alien Minerals | 283 | `alienminerals.pages.dev/api/` |
| ☢️ Nuclear | 260 | `nuclearenergy.pages.dev/api/` |
| 🦾 Robot Parts | 247 | `robotparts.pages.dev/api/` |
| 🌿 TCM | — | `tcm-tools.pages.dev/api/` |

## 💰 Pricing

- **Free:** 30 API calls/hour, no signup
- **Pro:** $29/month — 500 calls/day + webhook
- **Lifetime:** $99 one-time — forever access
- **Full Database:** $499 — all 12 domains download

[Pricing Page](https://genetech-tools.pages.dev/api-landing) · [Get API Key](https://genetech.tools/api-key)

## 🔗 Links

- [Website](https://genetech.tools)
- [GitHub Pages](https://lm203688.github.io/kb-ecosystem/)
- [API Docs (OpenAPI 3.1)](https://genetech-tools.pages.dev/api/openapi.json)
- [Tutorial](https://github.com/lm203688/kb-ecosystem/issues/2)

---

**Built by AI, for AI 🤖**
