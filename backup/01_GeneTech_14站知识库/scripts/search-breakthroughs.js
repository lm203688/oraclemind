const SDK = require('z-ai-web-dev-sdk').default;
const NODE_PATH = '/home/z/.bun/install/global/node_modules';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const client = await SDK.create();
  
  const queries = [
    // New-Energy
    { domain: 'new-energy', file: 'solar', query: 'perovskite tandem solar cell efficiency record 2025 2026 breakthrough', count: 10 },
    { domain: 'new-energy', file: 'storage', query: 'solid state battery breakthrough 2025 2026 sodium ion battery commercial', count: 10 },
    { domain: 'new-energy', file: 'hydrogen_energy', query: 'green hydrogen electrolyzer breakthrough 2025 2026 PEM SOEC', count: 10 },
    // Life-Science
    { domain: 'life-science', file: 'cell_therapy', query: 'CAR-T cell therapy breakthrough 2025 2026 FDA approval solid tumor', count: 10 },
    { domain: 'life-science', file: 'synbio', query: 'CRISPR gene editing breakthrough 2025 2026 base editing prime editing clinical', count: 10 },
    { domain: 'life-science', file: 'longevity', query: 'longevity aging reversal breakthrough 2025 2026 senolytic epigenetic reprogramming', count: 10 },
    // Agent-Ecosystem
    { domain: 'agent-ecosystem', file: 'mcp_servers', query: 'MCP model context protocol server 2025 2026 new tools ecosystem', count: 10 },
    { domain: 'agent-ecosystem', file: 'agent_frameworks', query: 'AI agent framework 2025 2026 LangGraph CrewAI AutoGen OpenAI Agents SDK', count: 10 },
    { domain: 'agent-ecosystem', file: 'sdks', query: 'AI agent SDK 2025 2026 new release framework tools', count: 10 },
  ];

  const results = {};
  
  for (const q of queries) {
    console.log(`\n=== Searching: ${q.domain}/${q.file} ===`);
    console.log(`Query: ${q.query}`);
    try {
      const res = await client.functions.invoke('web_search', { query: q.query, count: q.count });
      const items = Array.isArray(res) ? res : (res.results || res.data || []);
      console.log(`Got ${items.length} results`);
      for (const item of items.slice(0, 8)) {
        console.log(`  - ${item.name || item.title || 'N/A'}`);
        console.log(`    URL: ${item.url || item.link || 'N/A'}`);
        console.log(`    Date: ${item.date || 'N/A'}`);
        console.log(`    Snippet: ${(item.snippet || item.description || '').substring(0, 200)}`);
      }
      results[`${q.domain}/${q.file}`] = items;
    } catch (e) {
      console.error(`Error: ${e.message}`);
      results[`${q.domain}/${q.file}`] = [];
    }
    // Rate limit: 20 seconds between searches
    await sleep(20000);
  }
  
  // Save raw results
  const fs = require('fs');
  fs.writeFileSync('/tmp/search_results.json', JSON.stringify(results, null, 2));
  console.log('\n=== All searches complete, saved to /tmp/search_results.json ===');
}

main().catch(e => { console.error(e); process.exit(1); });
