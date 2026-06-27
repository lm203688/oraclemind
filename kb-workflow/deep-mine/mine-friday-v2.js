#!/usr/bin/env node
/**
 * 周五深挖：量子计算 + 核能 + 脑科学
 * 使用 require() 加载 SDK（import 方式有问题）
 */
const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function searchAndExtract(client, queries, domain, numEntities, entityFields) {
  let allResults = [];
  for (const q of queries) {
    console.log('  Search: ' + q.slice(0, 60));
    try {
      const r = await client.functions.invoke('web_search', { query: q, count: 8 });
      if (Array.isArray(r)) allResults = allResults.concat(r);
    } catch(e) {
      console.log('  Search error: ' + e.message.slice(0, 80));
    }
    await sleep(2500);
  }
  console.log('  Total results: ' + allResults.length);
  if (allResults.length === 0) return [];
  
  const snippets = allResults.map((res, i) => 
    '[' + (i+1) + '] ' + (res.name||res.title||'') + ' | ' + (res.snippet||'').slice(0, 400) + ' | URL: ' + res.url
  ).join('\n\n');
  
  const prompt = 'From these search results about ' + domain + ', extract ' + numEntities + ' real entities as JSON array. Each needs: ' + entityFields + ' Include sources [{source_type:"web", source_credibility:"B", article_url, collected_at:"2026-06-19T06:45:00Z"}]. Return ONLY JSON array, no markdown.\n\n' + snippets;
  
  try {
    const resp = await client.chat.completions.create({
      model: 'glm-4-plus',
      messages: [{role: 'user', content: prompt}],
      temperature: 0.1,
      max_tokens: 4000
    });
    const content = resp.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); }
      catch(e) {
        const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        try { return JSON.parse(fixed); } catch(e2) { return []; }
      }
    }
    return [];
  } catch(e) {
    console.log('  LLM error: ' + e.message.slice(0, 80));
    return [];
  }
}

function saveEntities(fpath, entities, idPrefix, startNum) {
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
        e.id = idPrefix + '-' + nextId++;
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

async function main() {
  console.log('🚀 周五深挖: 量子计算 + 核能 + 脑科学');
  console.log('📅 2026-06-19\n');
  
  process.on('unhandledRejection', (r) => console.error('⚠️ Unhandled:', r?.message?.slice(0,150)));
  process.on('uncaughtException', (e) => console.error('⚠️ Uncaught:', e?.message?.slice(0,150)));
  
  const client = await SDK.create();
  let grandTotal = 0;
  const summary = {};
  
  // ============= QUANTUM COMPUTING =============
  console.log('\n=== 量子计算 (quantum-computing) ===');
  let qcTotal = 0;
  
  console.log('\n[Processors]');
  let ents = await searchAndExtract(client, [
    'quantum computing processor breakthrough 2025 2026 new qubit record',
    'IBM Google Microsoft quantum chip 2025 2026 latest'
  ], 'quantum computing processors (QPU hardware)', 5, 
  'name, manufacturer, qubits, technology, gate_fidelity, status, description (3-5 sentences)');
  qcTotal += saveEntities(BASE+'/quantum-computing/knowledge-base/entities/processors.json', ents, 'QPU', 281);
  await sleep(3000);
  
  console.log('\n[Algorithms]');
  ents = await searchAndExtract(client, [
    'quantum algorithm breakthrough 2025 2026 new quantum speedup',
    'quantum machine learning algorithm 2025 2026 paper nature'
  ], 'quantum algorithms', 5, 
  'name, type, complexity, speedup, status, description (3-5 sentences), applications array');
  qcTotal += saveEntities(BASE+'/quantum-computing/knowledge-base/entities/algorithms.json', ents, 'QALG', 23);
  await sleep(3000);
  
  console.log('\n[Error Correction]');
  ents = await searchAndExtract(client, [
    'quantum error correction breakthrough 2025 2026 logical qubit',
    'quantum error correction surface code 2025 2026 milestone'
  ], 'quantum error correction', 5, 
  'name, type, code_distance, logical_qubits, status, description (3-5 sentences)');
  qcTotal += saveEntities(BASE+'/quantum-computing/knowledge-base/entities/error_correction.json', ents, 'QEC', 11);
  await sleep(3000);
  
  console.log('\n[Quantum Networking]');
  ents = await searchAndExtract(client, [
    'quantum networking quantum internet breakthrough 2025 2026',
    'quantum key distribution QKD satellite 2025 2026'
  ], 'quantum networking', 5, 
  'name, type, technology, distance, status, description (3-5 sentences)');
  qcTotal += saveEntities(BASE+'/quantum-computing/knowledge-base/entities/quantum_networking.json', ents, 'QNET', 11);
  await sleep(3000);
  
  console.log('\n[Quantum Software]');
  ents = await searchAndExtract(client, [
    'quantum software framework SDK 2025 2026 new release Qiskit Cirq',
    'quantum compiler optimization tool 2025 2026'
  ], 'quantum software', 5, 
  'name, type, language, developer, license, status, description (3-5 sentences)');
  qcTotal += saveEntities(BASE+'/quantum-computing/knowledge-base/entities/quantum_software.json', ents, 'QSW', 13);
  
  console.log('\n📊 量子计算: +' + qcTotal);
  summary['quantum-computing'] = qcTotal;
  grandTotal += qcTotal;
  
  // ============= NUCLEAR ENERGY =============
  console.log('\n\n=== 核能 (nuclear-energy) ===');
  await sleep(8000);
  let neTotal = 0;
  
  console.log('\n[Reactors]');
  ents = await searchAndExtract(client, [
    'nuclear reactor breakthrough 2025 2026 new design approval NRC',
    'advanced fission reactor 2025 2026 construction deployment'
  ], 'nuclear fission reactors', 5, 
  'name, type, technology, power, status, country, description (3-5 sentences)');
  neTotal += saveEntities(BASE+'/nuclear-energy/knowledge-base/entities/reactors.json', ents, 'NR', 78);
  await sleep(3000);
  
  console.log('\n[Fusion]');
  ents = await searchAndExtract(client, [
    'nuclear fusion breakthrough 2025 2026 tokamak stellarator record',
    'fusion energy milestone 2025 2026 ITER CFS Helion TAE'
  ], 'nuclear fusion energy', 5, 
  'name, type, technology, power, status, country, description (3-5 sentences)');
  neTotal += saveEntities(BASE+'/nuclear-energy/knowledge-base/entities/fusion.json', ents, 'FUS', 16);
  await sleep(3000);
  
  console.log('\n[SMR]');
  ents = await searchAndExtract(client, [
    'small modular reactor SMR 2025 2026 deployment construction progress',
    'SMR design certification licensing 2025 2026 NuScale GE Hitachi'
  ], 'small modular reactors (SMR)', 5, 
  'name, type, technology, power, status, country, description (3-5 sentences)');
  neTotal += saveEntities(BASE+'/nuclear-energy/knowledge-base/entities/smr.json', ents, 'SMR', 13);
  await sleep(3000);
  
  console.log('\n[Nuclear Fuel]');
  ents = await searchAndExtract(client, [
    'nuclear fuel cycle 2025 2026 HALEU uranium enrichment breakthrough',
    'nuclear fuel TRISO accident tolerant fuel 2025 2026'
  ], 'nuclear fuel cycle', 5, 
  'name, type, technology, enrichment_level, status, description (3-5 sentences)');
  neTotal += saveEntities(BASE+'/nuclear-energy/knowledge-base/entities/nuclear_fuel.json', ents, 'NFUEL', 9);
  await sleep(3000);
  
  console.log('\n[Radiation Applications]');
  ents = await searchAndExtract(client, [
    'radiation technology application 2025 2026 medical industrial',
    'nuclear medicine isotope production 2025 2026 breakthrough'
  ], 'radiation applications', 5, 
  'name, type, isotope, application, status, description (3-5 sentences)');
  neTotal += saveEntities(BASE+'/nuclear-energy/knowledge-base/entities/radiation_applications.json', ents, 'RAD', 11);
  
  console.log('\n📊 核能: +' + neTotal);
  summary['nuclear-energy'] = neTotal;
  grandTotal += neTotal;
  
  // ============= BRAIN SCIENCE =============
  console.log('\n\n=== 脑科学 (brain-science) ===');
  await sleep(8000);
  let bsTotal = 0;
  
  console.log('\n[BCI]');
  ents = await searchAndExtract(client, [
    'brain computer interface breakthrough 2025 2026 Neuralink Synchron',
    'BCI clinical trial 2025 2026 human implant neural decoding speech'
  ], 'brain-computer interfaces (BCI)', 5, 
  'name, company, type, channels, status, applications array, description (3-5 sentences)');
  bsTotal += saveEntities(BASE+'/brain-science/knowledge-base/entities/bci.json', ents, 'BCI', 69);
  await sleep(3000);
  
  console.log('\n[Brain Regions]');
  ents = await searchAndExtract(client, [
    'brain region mapping discovery 2025 2026 neuroscience connectome',
    'brain circuit neural pathway 2025 2026 new finding'
  ], 'brain regions and neural circuits', 5, 
  'name, location, function, method, description (3-5 sentences)');
  bsTotal += saveEntities(BASE+'/brain-science/knowledge-base/entities/brain_regions.json', ents, 'BREG', 26);
  await sleep(3000);
  
  console.log('\n[Neuropharmacology]');
  ents = await searchAndExtract(client, [
    'neuropharmacology drug breakthrough 2025 2026 brain disease treatment',
    'Alzheimer Parkinson drug approval 2025 2026 FDA'
  ], 'neuropharmacology', 5, 
  'name, type, target, mechanism, status, description (3-5 sentences)');
  bsTotal += saveEntities(BASE+'/brain-science/knowledge-base/entities/neuropharmacology.json', ents, 'NPHARM', 13);
  await sleep(3000);
  
  console.log('\n[Neurotech]');
  ents = await searchAndExtract(client, [
    'neurotechnology breakthrough 2025 2026 brain monitoring stimulation',
    'neurotech device EEG fNIRS 2025 2026 wearable'
  ], 'neurotechnology', 5, 
  'name, type, technology, company, status, description (3-5 sentences)');
  bsTotal += saveEntities(BASE+'/brain-science/knowledge-base/entities/neurotech.json', ents, 'NTECH', 8);
  await sleep(3000);
  
  console.log('\n[Neural Implants]');
  ents = await searchAndExtract(client, [
    'neural implant device 2025 2026 brain electrode Utah array',
    'brain implant flexible electrode 2025 2026 new development'
  ], 'neural implants', 5, 
  'name, type, technology, company, status, description (3-5 sentences)');
  bsTotal += saveEntities(BASE+'/brain-science/knowledge-base/entities/neural_implants.json', ents, 'NIMP', 13);
  await sleep(3000);
  
  console.log('\n[Brain Disorders]');
  ents = await searchAndExtract(client, [
    'brain disorder treatment breakthrough 2025 2026 Alzheimer Parkinson depression',
    'neurological disease therapy 2025 2026 clinical trial gene therapy'
  ], 'brain disorders', 5, 
  'name, type, prevalence, treatment, status, description (3-5 sentences)');
  bsTotal += saveEntities(BASE+'/brain-science/knowledge-base/entities/brain_disorders.json', ents, 'BDIS', 16);
  
  console.log('\n📊 脑科学: +' + bsTotal);
  summary['brain-science'] = bsTotal;
  grandTotal += bsTotal;
  
  // ============= SUMMARY =============
  console.log('\n' + '='.repeat(50));
  console.log('🎉 深挖完成!');
  console.log('  量子计算: +' + qcTotal);
  console.log('  核能: +' + neTotal);
  console.log('  脑科学: +' + bsTotal);
  console.log('  总计新增: ' + grandTotal);
  console.log('='.repeat(50));
  
  const report = {
    date: '2026-06-19',
    day: 'Friday',
    domains: ['quantum-computing', 'nuclear-energy', 'brain-science'],
    new_entities: summary,
    total_new: grandTotal
  };
  const reportsDir = path.join(BASE, 'kb-workflow', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'deep-mine-2026-06-19.json'), JSON.stringify(report, null, 2));
  console.log('Report saved.');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
