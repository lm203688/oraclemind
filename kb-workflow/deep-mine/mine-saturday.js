#!/usr/bin/env node
/**
 * 周六深挖：新能源 + 生命科学 + Agent生态
 * 使用 z-ai CLI 进行搜索 + LLM提取
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';
const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function webSearch(query, num=8) {
  console.log('  Search: ' + query.slice(0, 60));
  try {
    const args = JSON.stringify({ query, num });
    const cmd = `z-ai function --name "web_search" --args '${args.replace(/'/g, "'\\''")}' 2>/dev/null`;
    const output = execSync(cmd, { encoding: 'utf8', timeout: 30000, env: { ...process.env, NODE_PATH } });
    // Extract JSON array from output
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch(e) { return []; }
    }
    return [];
  } catch(e) {
    console.log('  Search error: ' + (e.message||'').slice(0, 80));
    return [];
  }
}

function llmExtract(snippets, domain, numEntities, entityFields) {
  const prompt = 'From these search results about ' + domain + ', extract ' + numEntities + ' real entities as JSON array. Each needs: ' + entityFields + ' Include sources [{source_type:"web", source_credibility:"B", article_url:"", collected_at:"2026-06-20T06:30:00Z"}]. Return ONLY JSON array, no markdown, no explanation.\n\n' + snippets;
  
  try {
    const tmpPrompt = '/tmp/llm_prompt_' + Date.now() + '.txt';
    fs.writeFileSync(tmpPrompt, prompt.slice(0, 12000));
    const output = execSync(
      `cat "${tmpPrompt}" | NODE_PATH=${NODE_PATH} node ${BASE}/kb-workflow/deep-mine/llm-extract.js 2>/dev/null`,
      { encoding: 'utf8', timeout: 60000, maxBuffer: 1024*1024, env: { ...process.env, NODE_PATH } }
    );
    try { fs.unlinkSync(tmpPrompt); } catch(e) {}
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); }
      catch(e) {
        const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        try { return JSON.parse(fixed); } catch(e2) { return []; }
      }
    }
    return [];
  } catch(e) {
    console.log('  LLM error: ' + (e.message||'').slice(0, 80));
    return [];
  }
}

async function searchAndExtract(queries, domain, numEntities, entityFields) {
  let allResults = [];
  for (const q of queries) {
    const results = webSearch(q, 8);
    allResults = allResults.concat(results);
    await sleep(1500);
  }
  console.log('  Total results: ' + allResults.length);
  if (allResults.length === 0) return [];
  
  const snippets = allResults.map((res, i) => 
    '[' + (i+1) + '] ' + (res.name||res.title||'') + ' | ' + (res.snippet||'').slice(0, 400) + ' | URL: ' + res.url
  ).join('\n\n');
  
  return llmExtract(snippets, domain, numEntities, entityFields);
}

function saveEntitiesArray(fpath, entities, idPrefix, startNum) {
  try {
    const existing = JSON.parse(fs.readFileSync(fpath, 'utf8'));
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
        e.id = idPrefix + '-' + String(nextId++).padStart(3, '0');
        existing.push(e);
        existingNames.push(e.name.toLowerCase());
        added++;
      }
    }
    if (added > 0) {
      fs.writeFileSync(fpath, JSON.stringify(existing, null, 2));
      console.log('  ✅ +' + added + ' new → ' + existing.length + ' total');
    } else {
      console.log('  ⚠️ 0 new (all duplicates)');
    }
    return added;
  } catch(e) {
    console.log('  Save error: ' + e.message.slice(0, 80));
    return 0;
  }
}

function saveEntitiesObject(fpath, entities, idPrefix, startNum) {
  try {
    const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    const existing = data.entities || data;
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
        e.id = idPrefix + '-' + String(nextId++);
        existing.push(e);
        existingNames.push(e.name.toLowerCase());
        added++;
      }
    }
    if (added > 0) {
      data.entities = existing;
      data.last_updated = new Date().toISOString();
      fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
      console.log('  ✅ +' + added + ' new → ' + existing.length + ' total');
    } else {
      console.log('  ⚠️ 0 new (all duplicates)');
    }
    return added;
  } catch(e) {
    console.log('  Save error: ' + e.message.slice(0, 80));
    return 0;
  }
}

async function main() {
  console.log('🚀 周六深挖: 新能源 + 生命科学 + Agent生态');
  console.log('📅 2026-06-20\n');
  
  let grandTotal = 0;
  const summary = {};
  
  // ============= NEW ENERGY =============
  console.log('\n=== 新能源 (new-energy) ===');
  let neTotal = 0;
  
  console.log('\n[Solar PV]');
  let ents = await searchAndExtract([
    'solar cell efficiency breakthrough 2025 2026 perovskite tandem record',
    'photovoltaic technology 2025 2026 new silicon perovskite commercial'
  ], 'solar photovoltaic technology', 5, 
  'name, type, efficiency, developer, status, description (3-5 sentences)');
  neTotal += saveEntitiesArray(BASE+'/new-energy/knowledge-base/entities/solar.json', ents, 'SE', 115);
  await sleep(2000);
  
  console.log('\n[Energy Storage]');
  ents = await searchAndExtract([
    'battery energy storage breakthrough 2025 2026 solid state lithium',
    'grid scale storage technology 2025 2026 flow battery sodium ion'
  ], 'energy storage technology', 5, 
  'name, type, capacity, technology, developer, status, description (3-5 sentences)');
  neTotal += saveEntitiesArray(BASE+'/new-energy/knowledge-base/entities/storage.json', ents, 'ST', 96);
  await sleep(2000);
  
  console.log('\n[Hydrogen]');
  ents = await searchAndExtract([
    'hydrogen energy breakthrough 2025 2026 electrolyzer green hydrogen',
    'hydrogen fuel cell 2025 2026 new technology deployment'
  ], 'hydrogen energy technology', 5, 
  'name, type, technology, efficiency, developer, status, description (3-5 sentences)');
  neTotal += saveEntitiesArray(BASE+'/new-energy/knowledge-base/entities/hydrogen_energy.json', ents, 'HYD', 79);
  await sleep(2000);
  
  console.log('\n[Wind Energy]');
  ents = await searchAndExtract([
    'wind energy breakthrough 2025 2026 offshore turbine record',
    'wind turbine technology 2025 2026 larger capacity floating'
  ], 'wind energy technology', 5, 
  'name, type, capacity, technology, developer, status, description (3-5 sentences)');
  neTotal += saveEntitiesArray(BASE+'/new-energy/knowledge-base/entities/wind_energy.json', ents, 'WIND', 63);
  await sleep(2000);
  
  console.log('\n[Grid Technology]');
  ents = await searchAndExtract([
    'smart grid technology 2025 2026 microgrid virtual power plant',
    'grid modernization 2025 2026 HVDC transmission DC'
  ], 'grid technology', 5, 
  'name, type, technology, capacity, developer, status, description (3-5 sentences)');
  neTotal += saveEntitiesArray(BASE+'/new-energy/knowledge-base/entities/grid_tech.json', ents, 'GRID', 68);
  
  console.log('\n📊 新能源: +' + neTotal);
  summary['new-energy'] = neTotal;
  grandTotal += neTotal;
  
  // ============= LIFE SCIENCE =============
  console.log('\n\n=== 生命科学 (life-science) ===');
  let lsTotal = 0;
  
  console.log('\n[Synthetic Biology]');
  ents = await searchAndExtract([
    'synthetic biology breakthrough 2025 2026 AI genome design',
    'synthetic biology 2025 2026 CRISPR cell factory new development'
  ], 'synthetic biology', 5, 
  'name, type, applications array, companies array, maturity, description (3-5 sentences), trend, sources array');
  lsTotal += saveEntitiesObject(BASE+'/life-science/knowledge-base/entities/synbio.json', ents, 'SB', 79);
  await sleep(2000);
  
  console.log('\n[Cell Therapy]');
  ents = await searchAndExtract([
    'cell therapy breakthrough 2025 2026 CAR-T CAR-NK clinical trial',
    'regenerative medicine stem cell 2025 2026 FDA approval new'
  ], 'cell therapy and regenerative medicine', 5, 
  'name, type, target, companies array, maturity, description (3-5 sentences)');
  lsTotal += saveEntitiesObject(BASE+'/life-science/knowledge-base/entities/cell_therapy.json', ents, 'CT', 79);
  await sleep(2000);
  
  console.log('\n[Longevity]');
  ents = await searchAndExtract([
    'longevity anti-aging breakthrough 2025 2026 senolytic drug',
    'aging research 2025 2026 telomerase epigenetic reprogramming'
  ], 'longevity and anti-aging technology', 5, 
  'name, type, mechanism, companies array, maturity, description (3-5 sentences)');
  lsTotal += saveEntitiesObject(BASE+'/life-science/knowledge-base/entities/longevity.json', ents, 'LG', 109);
  await sleep(2000);
  
  console.log('\n[Bioinformatics]');
  ents = await searchAndExtract([
    'bioinformatics breakthrough 2025 2026 AI protein structure prediction',
    'computational biology 2025 2026 AlphaFold genomics new tool'
  ], 'bioinformatics and computational biology', 5, 
  'name, type, technology, companies array, maturity, description (3-5 sentences)');
  lsTotal += saveEntitiesObject(BASE+'/life-science/knowledge-base/entities/bioinformatics.json', ents, 'BINF', 71);
  await sleep(2000);
  
  console.log('\n[Biomanufacturing]');
  ents = await searchAndExtract([
    'biomanufacturing breakthrough 2025 2026 bioprocess automation',
    'precision fermentation 2025 2026 cell-free synthesis scale-up'
  ], 'biomanufacturing', 5, 
  'name, type, technology, companies array, maturity, description (3-5 sentences)');
  lsTotal += saveEntitiesObject(BASE+'/life-science/knowledge-base/entities/biomanufacturing.json', ents, 'BM', 79);
  
  console.log('\n📊 生命科学: +' + lsTotal);
  summary['life-science'] = lsTotal;
  grandTotal += lsTotal;
  
  // ============= AGENT ECOSYSTEM =============
  console.log('\n\n=== Agent生态 (agent-ecosystem) ===');
  let aeTotal = 0;
  
  console.log('\n[MCP Servers]');
  ents = await searchAndExtract([
    'MCP model context protocol server 2025 2026 new release',
    'model context protocol 2025 2026 Anthropic Claude new server tool'
  ], 'MCP (Model Context Protocol) servers', 5, 
  'name, full_name, category, description, protocol_version, auth, hosts array, security, stars, maintainer, status, language, features array, sources array');
  aeTotal += saveEntitiesObject(BASE+'/agent-ecosystem/knowledge-base/entities/mcp_servers.json', ents, 'MCP', 60);
  await sleep(2000);
  
  console.log('\n[Agent SDKs]');
  ents = await searchAndExtract([
    'AI agent SDK framework 2025 2026 new release LangChain CrewAI',
    'agent framework 2025 2026 AutoGen OpenAI Agents SDK new'
  ], 'AI agent SDKs and frameworks', 5, 
  'name, full_name, category, description, language, companies array, maturity, features array, sources array');
  aeTotal += saveEntitiesObject(BASE+'/agent-ecosystem/knowledge-base/entities/sdks.json', ents, 'SDK', 33);
  await sleep(2000);
  
  console.log('\n[Agent Protocols]');
  ents = await searchAndExtract([
    'AI agent protocol 2025 2026 A2A MCP interoperability',
    'agent communication protocol 2025 2026 new standard open'
  ], 'AI agent protocols and standards', 5, 
  'name, type, description, developer, status, maturity, features array, sources array');
  aeTotal += saveEntitiesObject(BASE+'/agent-ecosystem/knowledge-base/entities/protocols.json', ents, 'PROTO', 50);
  await sleep(2000);
  
  console.log('\n[Vector Databases]');
  ents = await searchAndExtract([
    'vector database 2025 2026 new release embedding search',
    'vector database 2025 2026 Pinecone Weaviate Milvus new feature'
  ], 'vector databases', 5, 
  'name, type, description, technology, companies array, maturity, features array, sources array');
  aeTotal += saveEntitiesObject(BASE+'/agent-ecosystem/knowledge-base/entities/vector_dbs.json', ents, 'VDB', 30);
  await sleep(2000);
  
  console.log('\n[Memory Systems]');
  ents = await searchAndExtract([
    'AI agent memory system 2025 2026 persistent long-term memory',
    'LLM memory 2025 2026 mem0 letta zep new development'
  ], 'AI agent memory systems', 5, 
  'name, type, description, technology, companies array, maturity, features array, sources array');
  aeTotal += saveEntitiesObject(BASE+'/agent-ecosystem/knowledge-base/entities/memory_systems.json', ents, 'MEM', 24);
  await sleep(2000);
  
  console.log('\n[Benchmarks]');
  ents = await searchAndExtract([
    'AI agent benchmark 2025 2026 evaluation SWE-bench GAIA',
    'LLM agent benchmark 2025 2026 new evaluation tool'
  ], 'AI agent benchmarks and evaluations', 5, 
  'name, type, description, technology, companies array, maturity, features array, sources array');
  aeTotal += saveEntitiesObject(BASE+'/agent-ecosystem/knowledge-base/entities/benchmarks.json', ents, 'BENCH', 9);
  
  console.log('\n📊 Agent生态: +' + aeTotal);
  summary['agent-ecosystem'] = aeTotal;
  grandTotal += aeTotal;
  
  // ============= SUMMARY =============
  console.log('\n' + '='.repeat(50));
  console.log('🎉 深挖完成!');
  console.log('  新能源: +' + neTotal);
  console.log('  生命科学: +' + lsTotal);
  console.log('  Agent生态: +' + aeTotal);
  console.log('  总计新增: ' + grandTotal);
  console.log('='.repeat(50));
  
  const report = {
    date: '2026-06-20',
    day: 'Saturday',
    domains: ['new-energy', 'life-science', 'agent-ecosystem'],
    new_entities: summary,
    total_new: grandTotal
  };
  const reportsDir = path.join(BASE, 'kb-workflow', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'deep-mine-2026-06-20.json'), JSON.stringify(report, null, 2));
  console.log('Report saved.');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
