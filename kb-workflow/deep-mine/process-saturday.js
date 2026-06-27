#!/usr/bin/env node
/**
 * Process search results and extract entities for all domains
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';
const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const MINE_DIR = '/tmp/kb-mine';

function readSearchResults(files) {
  let results = [];
  for (const f of files) {
    const fpath = path.join(MINE_DIR, f);
    if (!fs.existsSync(fpath)) continue;
    const raw = fs.readFileSync(fpath, 'utf8');
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const arr = JSON.parse(jsonMatch[0]);
        results = results.concat(arr);
      } catch(e) {}
    }
  }
  return results;
}

function llmExtract(snippets, domain, numEntities, entityFields) {
  const prompt = 'From these search results about ' + domain + ', extract ' + numEntities + ' real entities as JSON array. Each needs: ' + entityFields + ' Include sources [{source_type:"web", source_credibility:"B", article_url:"", collected_at:"2026-06-20T06:30:00Z"}]. Return ONLY JSON array, no markdown, no explanation.\n\n' + snippets;
  
  try {
    const tmpPrompt = '/tmp/llm_prompt.txt';
    fs.writeFileSync(tmpPrompt, prompt.slice(0, 12000));
    const output = execSync(
      `cat "${tmpPrompt}" | NODE_PATH=${NODE_PATH} node ${BASE}/kb-workflow/deep-mine/llm-extract.js 2>/dev/null`,
      { encoding: 'utf8', timeout: 60000, maxBuffer: 1024*1024, env: { ...process.env, NODE_PATH } }
    );
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

function processDomain(label, searchFiles, domain, entityFields, entityFile, idPrefix, startNum, isArray) {
  console.log('\n[' + label + ']');
  const results = readSearchResults(searchFiles);
  console.log('  Results: ' + results.length);
  if (results.length === 0) return 0;
  
  const snippets = results.map((res, i) => 
    '[' + (i+1) + '] ' + (res.name||res.title||'') + ' | ' + (res.snippet||'').slice(0, 400) + ' | URL: ' + res.url
  ).join('\n\n');
  
  const entities = llmExtract(snippets, domain, 5, entityFields);
  console.log('  Extracted: ' + entities.length + ' entities');
  
  if (isArray) {
    return saveEntitiesArray(BASE + entityFile, entities, idPrefix, startNum);
  } else {
    return saveEntitiesObject(BASE + entityFile, entities, idPrefix, startNum);
  }
}

function main() {
  console.log('🚀 周六深挖: 新能源 + 生命科学 + Agent生态');
  console.log('📅 2026-06-20');
  
  let grandTotal = 0;
  const summary = {};
  
  // === NEW ENERGY ===
  console.log('\n=== 新能源 (new-energy) ===');
  let neTotal = 0;
  
  neTotal += processDomain('Solar PV', ['solar1.json','solar2.json'], 'solar photovoltaic technology',
    'name, type, efficiency, developer, status, description (3-5 sentences)',
    '/new-energy/knowledge-base/entities/solar.json', 'SE', 115, true);
  
  neTotal += processDomain('Energy Storage', ['storage1.json','storage2.json'], 'energy storage technology',
    'name, type, capacity, technology, developer, status, description (3-5 sentences)',
    '/new-energy/knowledge-base/entities/storage.json', 'ST', 96, true);
  
  neTotal += processDomain('Hydrogen', ['hydrogen1.json','hydrogen2.json'], 'hydrogen energy technology',
    'name, type, technology, efficiency, developer, status, description (3-5 sentences)',
    '/new-energy/knowledge-base/entities/hydrogen_energy.json', 'HYD', 79, true);
  
  neTotal += processDomain('Wind Energy', ['wind1.json','wind2.json'], 'wind energy technology',
    'name, type, capacity, technology, developer, status, description (3-5 sentences)',
    '/new-energy/knowledge-base/entities/wind_energy.json', 'WIND', 63, true);
  
  neTotal += processDomain('Grid Technology', ['grid1.json','grid2.json'], 'grid technology',
    'name, type, technology, capacity, developer, status, description (3-5 sentences)',
    '/new-energy/knowledge-base/entities/grid_tech.json', 'GRID', 68, true);
  
  console.log('\n📊 新能源: +' + neTotal);
  summary['new-energy'] = neTotal;
  grandTotal += neTotal;
  
  // === LIFE SCIENCE ===
  console.log('\n=== 生命科学 (life-science) ===');
  let lsTotal = 0;
  
  lsTotal += processDomain('Synthetic Biology', ['synbio1.json','synbio2.json'], 'synthetic biology',
    'name, type, applications array, companies array, maturity, description (3-5 sentences), trend, sources array',
    '/life-science/knowledge-base/entities/synbio.json', 'SB', 79, false);
  
  lsTotal += processDomain('Cell Therapy', ['cell1.json','cell2.json'], 'cell therapy and regenerative medicine',
    'name, type, target, companies array, maturity, description (3-5 sentences)',
    '/life-science/knowledge-base/entities/cell_therapy.json', 'CT', 79, false);
  
  lsTotal += processDomain('Longevity', ['long1.json','long2.json'], 'longevity and anti-aging technology',
    'name, type, mechanism, companies array, maturity, description (3-5 sentences)',
    '/life-science/knowledge-base/entities/longevity.json', 'LG', 109, false);
  
  lsTotal += processDomain('Bioinformatics', ['bioinf1.json','bioinf2.json'], 'bioinformatics and computational biology',
    'name, type, technology, companies array, maturity, description (3-5 sentences)',
    '/life-science/knowledge-base/entities/bioinformatics.json', 'BINF', 71, false);
  
  lsTotal += processDomain('Biomanufacturing', ['biomanuf1.json','biomanuf2.json'], 'biomanufacturing',
    'name, type, technology, companies array, maturity, description (3-5 sentences)',
    '/life-science/knowledge-base/entities/biomanufacturing.json', 'BM', 79, false);
  
  console.log('\n📊 生命科学: +' + lsTotal);
  summary['life-science'] = lsTotal;
  grandTotal += lsTotal;
  
  // === AGENT ECOSYSTEM ===
  console.log('\n=== Agent生态 (agent-ecosystem) ===');
  let aeTotal = 0;
  
  aeTotal += processDomain('MCP Servers', ['mcp1.json','mcp2.json'], 'MCP (Model Context Protocol) servers',
    'name, full_name, category, description, protocol_version, auth, hosts array, security, stars, maintainer, status, language, features array, sources array',
    '/agent-ecosystem/knowledge-base/entities/mcp_servers.json', 'MCP', 60, false);
  
  aeTotal += processDomain('Agent SDKs', ['sdk1.json','sdk2.json'], 'AI agent SDKs and frameworks',
    'name, full_name, category, description, language, companies array, maturity, features array, sources array',
    '/agent-ecosystem/knowledge-base/entities/sdks.json', 'SDK', 33, false);
  
  aeTotal += processDomain('Agent Protocols', ['proto1.json','proto2.json'], 'AI agent protocols and standards',
    'name, type, description, developer, status, maturity, features array, sources array',
    '/agent-ecosystem/knowledge-base/entities/protocols.json', 'PROTO', 50, false);
  
  aeTotal += processDomain('Vector Databases', ['vdb1.json','vdb2.json'], 'vector databases',
    'name, type, description, technology, companies array, maturity, features array, sources array',
    '/agent-ecosystem/knowledge-base/entities/vector_dbs.json', 'VDB', 30, false);
  
  aeTotal += processDomain('Memory Systems', ['mem1.json','mem2.json'], 'AI agent memory systems',
    'name, type, description, technology, companies array, maturity, features array, sources array',
    '/agent-ecosystem/knowledge-base/entities/memory_systems.json', 'MEM', 24, false);
  
  aeTotal += processDomain('Benchmarks', ['bench1.json','bench2.json'], 'AI agent benchmarks and evaluations',
    'name, type, description, technology, companies array, maturity, features array, sources array',
    '/agent-ecosystem/knowledge-base/entities/benchmarks.json', 'BENCH', 9, false);
  
  console.log('\n📊 Agent生态: +' + aeTotal);
  summary['agent-ecosystem'] = aeTotal;
  grandTotal += aeTotal;
  
  // === SUMMARY ===
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

main();
