#!/usr/bin/env node
/**
 * 周六深挖批处理 - 使用小乌(xiaowu-agent)进行LLM提取
 * 小乌负责: 搜索结果→结构化实体提取（简单重复任务）
 * Eve负责: 审核+入库+API更新
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';
const MINE_DIR = '/tmp/kb-mine';

// 小乌API配置
const XIAOWU_URL = 'http://150.158.119.19:3003/v1/chat/completions';
const XIAOWU_KEY = 'xiaowu-internal-2026';
const XIAOWU_MODEL = 'xiaowu-agent';

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

function xiaowuExtract(snippets, domain, entityFields) {
  // Truncate snippets to keep prompt under 4K chars for xiaowu reliability
  const truncated = snippets.slice(0, 3500);
  const prompt = 'From these search results about ' + domain + ', extract 5 real entities as JSON array. Each needs: ' + entityFields + '. Return ONLY JSON array.\n\n' + truncated;
  
  const payload = JSON.stringify({
    model: XIAOWU_MODEL,
    messages: [{ role: 'user', content: prompt.slice(0, 4000) }],
    temperature: 0.1,
    max_tokens: 3000
  });
  const tmpPayload = '/tmp/xw_payload_' + Date.now() + '.json';
  fs.writeFileSync(tmpPayload, payload);
  
  try {
    const cmd = `curl -s -m 120 -X POST "${XIAOWU_URL}" -H "Content-Type: application/json" -H "Authorization: Bearer ${XIAOWU_KEY}" -d @"${tmpPayload}"`;
    const output = execSync(cmd, { encoding: 'utf8', timeout: 130000 });
    try { fs.unlinkSync(tmpPayload); } catch(e) {}
    
    // Parse OpenAI-format response
    const resp = JSON.parse(output);
    const content = resp.choices?.[0]?.message?.content || '';
    
    // Strip markdown code fences if present
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); }
      catch(e) {
        const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        try { return JSON.parse(fixed); } catch(e2) { return []; }
      }
    }
    return [];
  } catch(e) {
    try { fs.unlinkSync(tmpPayload); } catch(e2) {}
    console.log('  小乌API error: ' + (e.message||'').slice(0, 100));
    return [];
  }
}

function saveEntities(fpath, entities, prefix, startNum, isArrayFormat) {
  const raw = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let existing;
  if (Array.isArray(raw)) {
    existing = raw;
  } else if (raw && Array.isArray(raw.entities)) {
    existing = raw.entities;
  } else {
    existing = [];
  }
  
  let nextId = startNum;
  existing.forEach(e => {
    if (e.id && e.id.startsWith(prefix + '-')) {
      const n = parseInt(e.id.replace(prefix + '-', '').replace(/\D/g, ''));
      if (n >= nextId) nextId = n + 1;
    }
  });
  
  const existingNames = existing.map(e => (e.name||'').toLowerCase());
  let added = 0;
  for (const e of entities) {
    if (e && e.name && !existingNames.includes(e.name.toLowerCase())) {
      e.id = prefix + '-' + String(nextId++).padStart(3, '0');
      existing.push(e);
      existingNames.push(e.name.toLowerCase());
      added++;
    }
  }
  
  if (added > 0) {
    if (Array.isArray(raw)) {
      fs.writeFileSync(fpath, JSON.stringify(raw, null, 2));
    } else {
      raw.entities = existing;
      raw.last_updated = '2026-06-20T07:30:00Z';
      fs.writeFileSync(fpath, JSON.stringify(raw, null, 2));
    }
  }
  return added;
}

// ========== TASK DEFINITIONS ==========
const tasks = [
  // --- 新能源 ---
  { name: 'solar', files: ['solar1.json','solar2.json'], domain: 'solar photovoltaic technology',
    fields: 'name, type, efficiency, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/solar.json', prefix: 'SE', start: 115 },
  { name: 'storage', files: ['storage1.json','storage2.json'], domain: 'energy storage technology',
    fields: 'name, type, capacity, technology, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/storage.json', prefix: 'ST', start: 96 },
  { name: 'hydrogen', files: ['hydrogen1.json','hydrogen2.json'], domain: 'hydrogen energy technology',
    fields: 'name, type, technology, efficiency, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/hydrogen_energy.json', prefix: 'HYD', start: 79 },
  { name: 'wind', files: ['wind1.json','wind2.json'], domain: 'wind energy technology',
    fields: 'name, type, capacity, technology, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/wind_energy.json', prefix: 'WIND', start: 63 },
  { name: 'grid', files: ['grid1.json','grid2.json'], domain: 'grid technology',
    fields: 'name, type, technology, capacity, developer, status, description (3-5 sentences)',
    file: '/new-energy/knowledge-base/entities/grid_tech.json', prefix: 'GRID', start: 68 },
  // --- 生命科学 ---
  { name: 'synbio', files: ['synbio1.json','synbio2.json'], domain: 'synthetic biology',
    fields: 'name, type, applications array, companies array, maturity, description (3-5 sentences), trend, sources array',
    file: '/life-science/knowledge-base/entities/synbio.json', prefix: 'SB', start: 79 },
  { name: 'cell', files: ['cell1.json','cell2.json'], domain: 'cell therapy and regenerative medicine',
    fields: 'name, type, target, technology, status, description (3-5 sentences), sources array',
    file: '/life-science/knowledge-base/entities/cell_therapy.json', prefix: 'CT', start: 79 },
  { name: 'longevity', files: ['long1.json','long2.json'], domain: 'longevity and anti-aging technology',
    fields: 'name, type, mechanism, target, status, description (3-5 sentences), sources array',
    file: '/life-science/knowledge-base/entities/longevity.json', prefix: 'LG', start: 109 },
  { name: 'bioinf', files: ['bioinf1.json','bioinf2.json'], domain: 'bioinformatics and computational biology',
    fields: 'name, type, technology, application, status, description (3-5 sentences), sources array',
    file: '/life-science/knowledge-base/entities/bioinformatics.json', prefix: 'BINF', start: 71 },
  { name: 'biomanuf', files: ['biomanuf1.json','biomanuf2.json'], domain: 'biomanufacturing',
    fields: 'name, type, technology, application, status, description (3-5 sentences), sources array',
    file: '/life-science/knowledge-base/entities/biomanufacturing.json', prefix: 'BM', start: 79 },
  // --- Agent生态 ---
  { name: 'mcp', files: ['mcp1.json','mcp2.json'], domain: 'MCP (Model Context Protocol) servers',
    fields: 'name, full_name, category, description, protocol_version, auth, hosts array, security, stars, maintainer, status, language, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/mcp_servers.json', prefix: 'MCP', start: 165 },
  { name: 'sdk', files: ['sdk1.json','sdk2.json'], domain: 'AI agent SDKs and frameworks',
    fields: 'name, type, language, features array, description (3-5 sentences), license, github_stars, status, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/sdks.json', prefix: 'SDK', start: 33 },
  { name: 'proto', files: ['proto1.json','proto2.json'], domain: 'AI agent communication protocols',
    fields: 'name, type, description, status, maintainers array, features array, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/protocols.json', prefix: 'PROTO', start: 67 },
  { name: 'vdb', files: ['vdb1.json','vdb2.json'], domain: 'vector databases',
    fields: 'name, type, description, features array, performance, license, github_stars, status, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/vector_dbs.json', prefix: 'VDB', start: 36 },
  { name: 'mem', files: ['mem1.json','mem2.json'], domain: 'AI agent memory systems',
    fields: 'name, type, description, features array, integration, status, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/memory_systems.json', prefix: 'MEM', start: 24 },
  { name: 'bench', files: ['bench1.json','bench2.json'], domain: 'AI agent benchmarks and evaluation',
    fields: 'name, type, description, metrics array, leaderboard_url, status, sources array',
    file: '/agent-ecosystem/knowledge-base/entities/benchmarks.json', prefix: 'BENCH', start: 9 },
];

// ========== MAIN ==========
console.log('🚀 周六深挖批处理 (小乌LLM提取)');
console.log('📅 2026-06-20\n');

const summary = {};
let grandTotal = 0;

for (const task of tasks) {
  console.log('[' + task.name + ']');
  const results = readSearchResults(task.files);
  console.log('  Results: ' + results.length);
  if (results.length === 0) { console.log('  ⚠️ No results, skipping\n'); summary[task.name] = 0; continue; }
  
  const snippets = results.slice(0, 10).map((res, i) => 
    '[' + (i+1) + '] ' + (res.name||res.title||'').slice(0, 80) + ' | ' + (res.snippet||'').slice(0, 200) + ' | ' + (res.url||'')
  ).join('\n');
  
  console.log('  Asking 小乌 to extract...');
  const entities = xiaowuExtract(snippets, task.domain, task.fields);
  console.log('  Extracted: ' + entities.length + ' entities');
  
  const fpath = BASE + task.file;
  const added = saveEntities(fpath, entities, task.prefix, task.start);
  console.log('  ✅ +' + added + ' new\n');
  
  summary[task.name] = added;
  grandTotal += added;
}

// Group totals
const neTotal = (summary.solar||0) + (summary.storage||0) + (summary.hydrogen||0) + (summary.wind||0) + (summary.grid||0);
const lsTotal = (summary.synbio||0) + (summary.cell||0) + (summary.longevity||0) + (summary.bioinf||0) + (summary.biomanuf||0);
const aeTotal = (summary.mcp||0) + (summary.sdk||0) + (summary.proto||0) + (summary.vdb||0) + (summary.mem||0) + (summary.bench||0);

console.log('='.repeat(50));
console.log('🎉 深挖完成! (小乌提取)');
console.log('  新能源: +' + neTotal);
console.log('  生命科学: +' + lsTotal);
console.log('  Agent生态: +' + aeTotal);
console.log('  总计新增: ' + grandTotal);
console.log('='.repeat(50));

const report = {
  date: '2026-06-20',
  day: 'Saturday',
  executor: 'xiaowu-agent (LLM extraction) + Eve (orchestration)',
  domains: ['new-energy', 'life-science', 'agent-ecosystem'],
  new_entities: summary,
  totals: { new_energy: neTotal, life_science: lsTotal, agent_ecosystem: aeTotal },
  total_new: grandTotal
};
const reportsDir = path.join(BASE, 'kb-workflow', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(path.join(reportsDir, 'deep-mine-2026-06-20.json'), JSON.stringify(report, null, 2));
console.log('Report saved.');
