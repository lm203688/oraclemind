# GeneTech MCP Server

> Access 12 frontier science knowledge bases (4,000+ entities) from Claude Desktop, Cursor, or any MCP-compatible AI agent.

## Install

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent:

```json
{
  "mcpServers": {
    "genetech": {
      "command": "npx",
      "args": ["-y", "@frontierkb/mcp-server"]
    }
  }
}
```

### Cursor

Add to Cursor MCP settings:

```json
{
  "mcpServers": {
    "genetech": {
      "command": "npx",
      "args": ["-y", "@frontierkb/mcp-server"]
    }
  }
}
```

## Tools

### `search_knowledge`
Search across 12 knowledge domains. Returns matching entities with full structured data.

```javascript
// Search for CRISPR across all domains
{ "query": "CRISPR" }

// Search only in gene technology
{ "query": "CRISPR", "domain": "genetech", "limit": 5 }
```

### `list_domains`
List all 12 available knowledge domains with descriptions.

### `get_entity`
Get a specific entity by ID.

```javascript
{ "domain": "genetech", "entity_id": "GENE-001" }
```

## 12 Domains

| Domain | Key | Entities |
|--------|-----|----------|
| Gene Technology | `genetech` | 422 |
| Life Science | `life` | 511 |
| New Energy | `energy` | 492 |
| Agent Ecosystem | `agent` | 433 |
| Brain Science | `brain` | 347 |
| Exo-Science | `exo` | 336 |
| Deep-Sea Tech | `deepsea` | 322 |
| Quantum | `quantum` | 317 |
| Alien Minerals | `mineral` | 283 |
| Nuclear | `nuclear` | 260 |
| Robot Parts | `robot` | 247 |
| TCM | `tcm` | — |

## Free API

No API key needed for basic usage (30 calls/hour). Get a free key at [genetech.tools/api-key](https://genetech.tools/api-key) for higher limits.

## Links

- [Website](https://genetech.tools)
- [GitHub](https://github.com/lm203688/kb-ecosystem)
- [Pricing](https://genetech-tools.pages.dev/api-landing)
