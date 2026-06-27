#!/usr/bin/env node
/** Mine a single category - args: site_dir entity_file id_prefix start_num domain num_entities fields query1 query2 */
const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const args = process.argv.slice(2);
  const siteDir = args[0];
  const entityFile = args[1];
  const idPrefix = args[2];
  const startNum = parseInt(args[3]);
  const domain = args[4];
  const numEntities = parseInt(args[5]);
  const fields = args[6];
  const queries = args.slice(7);
  
  const fpath = path.join(BASE, siteDir, 'knowledge-base', 'entities', entityFile);
  
  const client = await SDK.create();
  console.log('[' + entityFile + '] Searching...');
  
  let allResults = [];
  for (const q of queries) {
    console.log('  Search: ' + q.slice(0, 60));
    try {
      const r = await client.functions.invoke('web_search', { query: q, count: 8 });
      if (Array.isArray(r)) allResults = allResults.concat(r);
    } catch(e) { console.log('  Search error: ' + e.message.slice(0, 80)); }
    await sleep(2500);
  }
  console.log('  Total results: ' + allResults.length);
  if (allResults.length === 0) { console.log('  No results, skipping'); return; }
  
  const snippets = allResults.map((res, i) => 
    '[' + (i+1) + '] ' + (res.name||res.title||'') + ' | ' + (res.snippet||'').slice(0, 400) + ' | URL: ' + res.url
  ).join('\n\n');
  
  const prompt = 'From these search results about ' + domain + ', extract ' + numEntities + ' real entities as JSON array. Each needs: ' + fields + ' Include sources [{source_type:"web", source_credibility:"B", article_url, collected_at:"2026-06-19T06:45:00Z"}]. Return ONLY JSON array, no markdown.\n\n' + snippets;
  
  console.log('  Extracting via LLM...');
  const resp = await client.chat.completions.create({
    model: 'glm-4-plus',
    messages: [{role: 'user', content: prompt}],
    temperature: 0.1,
    max_tokens: 4000
  });
  
  const content = resp.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  let entities = [];
  if (jsonMatch) {
    try { entities = JSON.parse(jsonMatch[0]); }
    catch(e) {
      const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      try { entities = JSON.parse(fixed); } catch(e2) { console.log('  JSON parse failed'); }
    }
  }
  
  console.log('  Extracted: ' + entities.length + ' entities');
  
  // Save - handle both array and {entities:[...]} formats
  const raw = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let existing, wrapper = null;
  if (Array.isArray(raw)) {
    existing = raw;
  } else if (raw && Array.isArray(raw.entities)) {
    existing = raw.entities;
    wrapper = raw;
  } else {
    existing = [];
  }
  
  let nextId = startNum;
  existing.forEach(e => { 
    if (e.id && e.id.startsWith(idPrefix + '-')) { 
      const n = parseInt(e.id.replace(idPrefix + '-', '')); 
      if (n >= nextId) nextId = n + 1; 
    } 
  });
  const existingNames = existing.map(e => (e.name||'').toLowerCase());
  let added = 0;
  for (const e of entities) {
    if (e && e.name && !existingNames.includes(e.name.toLowerCase())) {
      e.id = idPrefix + '-' + nextId++;
      existing.push(e);
      existingNames.push(e.name.toLowerCase());
      added++;
    }
  }
  if (added > 0) {
    if (wrapper) {
      wrapper.entities = existing;
      wrapper.last_updated = '2026-06-19T08:00:00Z';
      fs.writeFileSync(fpath, JSON.stringify(wrapper, null, 2));
    } else {
      fs.writeFileSync(fpath, JSON.stringify(existing, null, 2));
    }
    console.log('  ✅ +' + added + ' new → ' + existing.length + ' total');
  } else {
    console.log('  ⚠️ 0 new');
  }
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
