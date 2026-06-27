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
    'MavenBio YC biopharma intelligence platform',
    'MavenBio AI drug development assessment agentic',
    'MavenBio token usage 55.6B top 15',
  ];
  
  const all = {};
  for (const q of queries) {
    console.log(`Searching: ${q}`);
    const res = await search(client, q, 8);
    all[q] = res;
    for (const r of res.slice(0, 5)) {
      console.log(`  - ${r.name?.slice(0,80)} | ${r.host_name} | ${r.date||''}`);
      console.log(`    ${r.snippet?.slice(0,200)}`);
    }
    await sleep(18000);
  }
  
  fs.writeFileSync('/tmp/mavenbio_search.json', JSON.stringify(all, null, 2));
  console.log('\nSaved to /tmp/mavenbio_search.json');
}

main().catch(e => { console.error(e); process.exit(1); });
