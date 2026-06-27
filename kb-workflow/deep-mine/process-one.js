#!/usr/bin/env node
/**
 * Process all domains one at a time, saving results after each
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
      try { results = results.concat(JSON.parse(jsonMatch[0])); } catch(e) {}
    }
  }
  return results;
}

function llmExtract(snippets, domain, entityFields) {
  const prompt = 'From these search results about ' + domain + ', extract 5 real entities as JSON array. Each needs: ' + entityFields + ' Include sources [{source_type:"web", source_credibility:"B", article_url:"", collected_at:"2026-06-20T06:30:00Z"}]. Return ONLY JSON array, no markdown.\n\n' + snippets;
  
  fs.writeFileSync('/tmp/llm_prompt.txt', prompt.slice(0, 12000));
  try {
    const output = execSync(
      `cat /tmp/llm_prompt.txt | NODE_PATH=${NODE_PATH} node ${BASE}/kb-workflow/deep-mine/llm-extract.js 2>/dev/null`,
      { encoding: 'utf8', timeout: 90000, maxBuffer: 2*1024*1024, env: { ...process.env, NODE_PATH } }
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
    return [];
  }
}

function saveArray(fpath, entities, idPrefix, startNum) {
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
  if (added > 0) fs.writeFileSync(fpath, JSON.stringify(existing, null, 2));
  return added;
}

function saveObject(fpath, entities, idPrefix, startNum) {
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
  }
  return added;
}

// Process one domain at a time, get args from command line
const taskName = process.argv[2];
if (!taskName) {
  console.error('Usage: node process-one.js <task_name>');
  process.exit(1);
}

const tasks = {
  solar: { files: ['solar1.json','solar2.json'], domain: 'solar photovoltaic technology',
    fields: 'name, type, efficiency, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/solar.json', prefix: 'SE', start: 115, isArray: false },
  storage: { files: ['storage1.json','storage2.json'], domain: 'energy storage technology',
    fields: 'name, type, capacity, technology, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/storage.json', prefix: 'ST', start: 96, isArray: false },
  hydrogen: { files: ['hydrogen1.json','hydrogen2.json'], domain: 'hydrogen energy technology',
    fields: 'name, type, technology, efficiency, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/hydrogen_energy.json', prefix: 'HYD', start: 79, isArray: false },
  wind: { files: ['wind1.json','wind2.json'], domain: 'wind energy technology',
    fields: 'name, type, capacity, technology, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/wind_energy.json', prefix: 'WIND', start: 63, isArray: false },
  grid: { files: ['grid1.json','grid2.json'], domain: 'grid technology',
    fields: 'name, type, technology, capacity, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/grid_tech.json', prefix: 'GRID', start: 68, isArray: false },
  synbio: { files: ['synbio1.json','synbio2.json'], domain: 'synthetic biology',
    fields: 'name, type, applications array, companies array, maturity, description (3-5 sentences), trend, sources array',
    file: '/life-science/knowledge-base/entities/synbio.json', prefix: 'SB', start: 79, isArray: false },
  cell: { files: ['cell1.json','cell2.json'], domain: 'cell therapy and regenerative medicine',
    fields: 'name, type, target, companies array, maturity, description (3-5 sentences)',
    file: '/life-science/knowledge-base/entities/cell_therapy.json', prefix: 'CT', start: 79, isArray: false },
  long: { files: ['long1.json','long2.json'], domain: 'longevity and anti-aging technology',
    fields: 'name, type, mechanism, companies array, maturity, description (3-5 sentences)',
    file: '/life-science/knowledge-base/entities/longevity.json', prefix: 'LG', start: 109, isArray: false },
  bioinf: { files: ['bioinf1.json','bioinf2.json'], domain: 'bioinformatics and computational biology',
    fields: 'name, type, technology, companies array, maturity, description (3-5 sentences)',
    file: '/life-science/knowledge-base/entities/bioinformatics.json', prefix: 'BINF', start: 71, isArray: false },
  biomanuf: { files: ['biomanuf1.json','biomanuf2.json'], domain: 'biomanufacturing',
    fields: 'name, type, technology, companies array, maturity, description (3-5 sentences)',
    file: '/life-science/knowledge-base/entities/biomanufacturing.json', prefix: 'BM', start: 79, isArray: false },
  mcp: { files: ['mcp1.json','mcp2.json'], domain: 'MCP (Model Context Protocol) servers',
    fields: 'name, full_name, category, description, protocol_version, auth, hosts array, security, stars, maintainer, status, language, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/mcp_servers.json', prefix: 'MCP', start: 60, isArray: false },
  sdk: { files: ['sdk1.json','sdk2.json'], domain: 'AI agent SDKs and frameworks',
    fields: 'name, full_name, category, description, language, companies array, maturity, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/sdks.json', prefix: 'SDK', start: 33, isArray: false },
  proto: { files: ['proto1.json','proto2.json'], domain: 'AI agent protocols and standards',
    fields: 'name, type, description, developer, status, maturity, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/protocols.json', prefix: 'PROTO', start: 50, isArray: false },
  vdb: { files: ['vdb1.json','vdb2.json'], domain: 'vector databases',
    fields: 'name, type, description, technology, companies array, maturity, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/vector_dbs.json', prefix: 'VDB', start: 30, isArray: false },
  mem: { files: ['mem1.json','mem2.json'], domain: 'AI agent memory systems',
    fields: 'name, type, description, technology, companies array, maturity, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/memory_systems.json', prefix: 'MEM', start: 24, isArray: false },
  bench: { files: ['bench1.json','bench2.json'], domain: 'AI agent benchmarks and evaluations',
    fields: 'name, type, description, technology, companies array, maturity, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/benchmarks.json', prefix: 'BENCH', start: 9, isArray: false },
};

const task = tasks[taskName];
if (!task) {
  console.error('Unknown task: ' + taskName);
  process.exit(1);
}

console.log('[' + taskName + ']');
const results = readSearchResults(task.files);
console.log('  Results: ' + results.length);
if (results.length === 0) { console.log('  0 results, skipping'); process.exit(0); }

const snippets = results.map((res, i) => 
  '[' + (i+1) + '] ' + (res.name||res.title||'') + ' | ' + (res.snippet||'').slice(0, 400) + ' | URL: ' + res.url
).join('\n\n');

const entities = llmExtract(snippets, task.domain, task.fields);
console.log('  Extracted: ' + entities.length + ' entities');

const fpath = BASE + task.file;
let added;
if (task.isArray) {
  added = saveArray(fpath, entities, task.prefix, task.start);
} else {
  added = saveObject(fpath, entities, task.prefix, task.start);
}
console.log('  Added: ' + added);
