const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');

async function search(query, count) {
  const client = await SDK.create();
  try {
    const res = await client.functions.invoke('web_search', { query, count });
    const items = Array.isArray(res) ? res : (res.results || res.data || []);
    return items;
  } catch (e) {
    console.error('  Error: ' + e.message);
    return [];
  }
}

const query = process.argv[2];
const outFile = process.argv[3];

async function main() {
  console.log('Searching: ' + query);
  const items = await search(query, 10);
  console.log('Got ' + items.length + ' results');
  for (const item of items.slice(0, 8)) {
    console.log('  - ' + (item.name || item.title || 'N/A'));
    console.log('    Date: ' + (item.date || 'N/A'));
    console.log('    Snippet: ' + (item.snippet || '').substring(0, 200));
  }
  fs.writeFileSync(outFile, JSON.stringify(items, null, 2));
  console.log('Saved to ' + outFile);
}

main().catch(e => { console.error(e); process.exit(1); });
