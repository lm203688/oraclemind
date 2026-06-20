# genetech-kb

> 12 frontier science knowledge bases · 4,000+ structured entities · Free REST API

## Install

```bash
npm install genetech-kb
```

## Quick Start

```javascript
import { GeneTech } from 'genetech-kb';

const kb = new GeneTech();

// Get gene technology entities
const genes = await kb.getEntities('genetech');
console.log(genes.total); // 422

// Search across all 12 domains
const results = await kb.searchAll('CRISPR');
console.log(Object.keys(results)); // ['genetech', 'life', ...]
```

## 12 Knowledge Domains

| Key | Domain | Entities |
|-----|--------|----------|
| `genetech` | Gene Technology | 422 |
| `life` | Life Science | 511 |
| `energy` | New Energy | 492 |
| `agent` | AI Agent Ecosystem | 433 |
| `brain` | Brain Science | 347 |
| `exo` | Exo-Science | 336 |
| `deepsea` | Deep-Sea Tech | 322 |
| `quantum` | Quantum Computing | 317 |
| `mineral` | Alien Minerals | 283 |
| `nuclear` | Nuclear Energy | 260 |
| `robot` | Robot Parts | 247 |
| `tcm` | Traditional Chinese Medicine | — |

## Free API Key (optional)

```javascript
const { apiKey } = await GeneTech.register('you@example.com');
const kb = new GeneTech(apiKey); // Higher rate limits
```

## Pricing

- **Free:** 30 calls/hour, no signup
- **Pro:** $29/month — 500 calls/day
- **Lifetime:** $99 one-time

## Links

- [Website](https://genetech.tools)
- [API Docs](https://genetech-tools.pages.dev/api/openapi.json)
- [GitHub](https://github.com/lm203688/kb-ecosystem)
- [Pricing](https://genetech-tools.pages.dev/api-landing)
