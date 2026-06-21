# 🧬 GeneTech Knowledge Engine

> Free API for 12 frontier science domains. 4,000+ structured entities. MCP-compatible. No signup needed.

[![Website](https://img.shields.io/badge/Website-genetech.tools-cyan)](https://genetech.tools)
[![API](https://img.shields.io/badge/API-REST%20%2B%20MCP-blue)](https://genetech-tools.pages.dev/api/entities.json)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-green)](LICENSE)
[![Entities](https://img.shields.io/badge/Entities-4%2C136%2B-orange)](https://genetech-tools.pages.dev)

## 🎯 What is this?

A free knowledge base API covering **12 frontier science domains** with structured JSON entities. Built for RAG, AI agents, and MCP integration.

## 🚀 Quick Start

```bash
# Get all entities from GeneTech domain
curl https://genetech-tools.pages.dev/api/entities.json | jq .total
# → 422

# Search across all domains
curl https://genetech-tools.pages.dev/api/search?q=CRISPR

# Use as MCP Server (23 AI services + 12 knowledge engines)
npx @atex-ai/mcp-server
```

## 📚 12 Domains

| Domain | URL | Entities | Topics |
|--------|-----|----------|--------|
| 🧬 Gene Technology | [genetech-tools.pages.dev](https://genetech-tools.pages.dev) | 422 | Genes, diseases, CRISPR, gene therapies |
| 🌿 TCM | [tcm-tools.pages.dev](https://tcm-tools.pages.dev) | 1,778 | Herbs, prescriptions, diseases |
| 🤖 Agent Ecosystem | [agentecosystem.pages.dev](https://agentecosystem.pages.dev) | 433 | MCP servers, SDKs, protocols |
| ⚛️ Quantum Computing | [quantumcomputing.pages.dev](https://quantumcomputing.pages.dev) | 322 | Processors, algorithms, error correction |
| 🧠 Brain Science | [brainscience.pages.dev](https://brainscience.pages.dev) | 356 | BCI, neuroimaging, neurotech |
| ☢️ Nuclear Energy | [nuclearenergy.pages.dev](https://nuclearenergy.pages.dev) | 265 | Reactors, fusion, safety |
| 🪐 Exo-Science | [exoscience.pages.dev](https://exoscience.pages.dev) | 345 | Exoplanets, missions, telescopes |
| 💎 Alien Minerals | [alienminerals.pages.dev](https://alienminerals.pages.dev) | 292 | Minerals, asteroids, mining tech |
| 🌊 Deep Sea Tech | [deepseatech.pages.dev](https://deepseatech.pages.dev) | 333 | Submersibles, resources, ecology |
| ⚡ New Energy | [newenergy-nya.pages.dev](https://newenergy-nya.pages.dev) | 492 | Solar, hydrogen, wind, grid |
| 🧫 Life Science | [lifescience-epe.pages.dev](https://lifescience-epe.pages.dev) | 511 | CRISPR, cell therapy, longevity |
| 🦾 Robot Parts | [robotparts.pages.dev](https://robotparts.pages.dev) | 260 | Actuators, sensors, chips, platforms |

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 30 calls/hour, no signup |
| Pro | $29/mo | 1,000 calls/hour, API key, priority |
| Enterprise | $199/mo | Unlimited, SLA, custom data |

**Data packages:** Single domain $49 | All 12 domains $499

## 🔗 Links

- 🌐 [Website](https://genetech.tools)
- 📖 [API Docs](https://genetech-tools.pages.dev/api/entities.json)
- 🤖 [MCP Server](https://github.com/lm203688/atex)
- 💬 [Discussions](https://github.com/lm203688/kb-ecosystem/issues)

## ⭐ Star History

If you find this useful, please star the repo!

---

*Built with ❤️ for the AI agent community. Data updated daily.*
