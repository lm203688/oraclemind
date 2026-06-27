# 🧬 GeneTech Knowledge Engine — 12 AI Agent-Native Knowledge Bases

> **4,000+ structured entities across 12 frontier technology domains. Free REST API. MCP-compatible. Built for AI agents.**

[![API Status](https://img.shields.io/badge/API-Live-brightgreen)](https://genetech-tools.pages.dev/api/entities.json)
[![Entities](https://img.shields.io/badge/Entities-4,075+-blue)](https://genetech.tools)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Domains](https://img.shields.io/badge/Domains-12-orange)](#domains)

## 🚀 What is this?

12 specialized knowledge bases covering frontier science & technology domains. Each domain has **hundreds of structured JSON entities** — genes, diseases, quantum algorithms, MCP servers, deep-sea organisms, exoplanets, and more.

**Built for the AI Agent era:** Every entity is machine-readable, cross-referenced, and accessible via REST API + MCP protocol.

## 🔥 Try it right now (no signup)

```bash
# Get all gene therapy entities
curl https://genetech-tools.pages.dev/api/entities.json | jq '.total'

# Search AI agent frameworks
curl https://agentecosystem.pages.dev/api/entities.json | jq '.entities[0]'

# Browse new energy breakthroughs  
curl https://newenergy-nya.pages.dev/api/entities.json | jq '.entities[:3]'
```

## 📊 12 Domains & Entity Counts

| Domain | Site | Entities | Focus |
|--------|------|----------|-------|
| 🧬 GeneTech | [genetech.tools](https://genetech.tools) | 422 | Genes, diseases, CRISPR, gene therapies |
| 🌿 Life Science | [life.genetech.tools](https://life.genetech.tools) | 511 | Synthetic biology, cell therapy, longevity |
| ⚡ New Energy | [energy.genetech.tools](https://energy.genetech.tools) | 492 | Solar, hydrogen, wind, grid, storage |
| 🤖 Agent Ecosystem | [agent.genetech.tools](https://agent.genetech.tools) | 433 | MCP servers, SDKs, protocols, frameworks |
| 🧠 Brain Science | [brain.genetech.tools](https://brain.genetech.tools) | 269 | Neurotech, brain disorders, cognitive science |
| ⚛️ Quantum | [quantum.genetech.tools](https://quantum.genetech.tools) | 317 | Quantum algorithms, hardware, software |
| ☢️ Nuclear | [nuclear.genetech.tools](https://nuclear.genetech.tools) | 260 | Fission, fusion, nuclear fuel, waste |
| 🔭 Exo-Science | [exo.genetech.tools](https://exo.genetech.tools) | 316 | Exoplanets, astrobiology, space exploration |
| 💎 Alien Minerals | [mineral.genetech.tools](https://mineral.genetech.tools) | 283 | Rare minerals, mining tech |
| 🌊 Deep Sea | [deepsea.genetech.tools](https://deepsea.genetech.tools) | 322 | Marine biology, underwater tech, ocean energy |
| 🤖 Robotics | [robot.genetech.tools](https://robot.genetech.tools) | 247 | Sensors, actuators, robot arms, protocols |
| 🌿 TCM | [tcm.genetech.tools](https://tcm.genetech.tools) | 0 | Traditional Chinese medicine (data coming) |

## 🔌 API Access

### Free Tier (no signup)
- **30 requests/hour**
- All endpoints accessible
- No API key needed on `*.pages.dev` domains

### Pro Tier — $29/month
- **500 API calls/day**
- API key authentication
- Priority response times
- Webhook support
- [Subscribe →](https://creem.io/checkout/prod_4EpFVQGKm5vWXChbRiFdbE)

### Lifetime — $99 one-time
- Everything in Pro, forever
- All future updates included
- [Get Lifetime →](https://creem.io/checkout/prod_pny43rzDa0mmBaj7d9k4w)

### Get your free API key
```bash
curl -X POST https://genetech-tools.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

## 🤖 AI Agent Integration

### llms.txt (AI discovery)
Every site has `/llms.txt` and `/llms-full.txt` for AI agents to discover and understand the knowledge base.

### MCP Protocol
Agent Ecosystem DB includes MCP server listings, protocol specs, and SDK references — all machine-readable.

### OpenAPI 3.1
```bash
curl https://genetech-tools.pages.dev/api/openapi.json
```

## 🏗️ Tech Stack

- **Frontend:** Static HTML/CSS/JS on Cloudflare Pages
- **API:** Cloudflare Pages Functions (edge, global)
- **Data:** JSON files (versioned, structured)
- **AI Layer:** llms.txt + agent-discovery.json + schema.org
- **Payment:** Creem (global, supports Alipay)

## 📈 Use Cases

- **RAG pipelines:** Feed structured entities into your LLM
- **AI agents:** Let ChatGPT/Claude call our API via function calling
- **Research:** Export structured data for analysis
- **Education:** Interactive knowledge exploration
- **Content creation:** Cite real entities in articles/videos

## 🌐 Cross-Domain References

Entities link across domains:
- Gene → Disease → Therapy → Company (GeneTech)
- Synthetic biology → Cell therapy → Longevity (Life Science)
- MCP server → SDK → Protocol → Benchmark (Agent Ecosystem)

## 📝 License

Data is licensed under CC BY 4.0. Code is MIT.

## 🤝 Contributing

Found a bug? Want to add entities? Open an issue or PR.

## 💡 Roadmap

- [ ] GraphQL endpoint
- [ ] Vector search (semantic similarity)
- [ ] Real-time data updates
- [ ] More domains (materials science, climate tech)

---

**Built by [lm203688](https://github.com/lm203688)** · [API Docs](https://genetech.tools/api-pricing) · [Get API Key](https://genetech.tools/api-key) · [Pricing](https://genetech.tools/credits)
