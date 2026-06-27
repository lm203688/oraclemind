const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function search(client, query, count = 8) {
  try {
    const res = await client.functions.invoke('web_search', { query, count });
    return Array.isArray(res) ? res : [];
  } catch (e) {
    console.error(`Search error: ${e.message?.slice(0,100)}`);
    return [];
  }
}

async function main() {
  const client = await SDK.create();
  const queries = [
    'AI bionic technology 2025 2026 breakthrough biomimicry',
    'bio-inspired AI neural network neuromorphic 2025 2026',
    'biomimetic robot AI 2025 2026 innovation',
    'AI仿生技术 2025 2026 突破 应用',
    'neuromorphic computing chip 2025 2026 Intel IBM',
    'biomimicry AI design optimization 2025 2026',
  ];
  
  const all = {};
  for (const q of queries) {
    console.log(`Searching: ${q}`);
    const res = await search(client, q, 8);
    all[q] = res;
    for (const r of res.slice(0, 3)) {
      console.log(`  - ${r.name?.slice(0,80)} | ${r.host_name}`);
      console.log(`    ${r.snippet?.slice(0,200)}`);
    }
    await sleep(15000);
  }
  
  fs.writeFileSync('/tmp/bionic_search.json', JSON.stringify(all, null, 2));
  console.log('\nSaved');
}

main().catch(e => { console.error(e); process.exit(1); });
