#!/usr/bin/env node
/**
 * 周五深挖脚本：量子计算 + 核能 + 脑科学
 * 使用 z-ai SDK functions.invoke('web_search') + chat 提取真实数据
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const PROJECT_ROOT = '/home/z/my-project';

let ZAI;
async function initSDK() {
  if (ZAI) return ZAI;
  const mod = await import(path.join(NODE_PATH, 'z-ai-web-dev-sdk', 'dist', 'index.js'));
  ZAI = mod.default;
  return ZAI;
}

async function createClient() {
  const SDK = await initSDK();
  return await SDK.create();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadEntities(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(d) ? d : (d.entities || d.data || d.items || d.records || []);
  } catch (e) { return []; }
}

function saveEntities(filePath, entities) {
  fs.writeFileSync(filePath, JSON.stringify(entities, null, 2));
}

function nextId(items, prefix, startNum) {
  let max = startNum;
  for (const item of items) {
    if (item.id && item.id.startsWith(prefix)) {
      const num = parseInt(item.id.replace(prefix, ''));
      if (num > max) max = num;
    }
  }
  return max + 1;
}

// Search web using functions.invoke
async function searchWeb(client, query, maxResults = 8) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await client.functions.invoke('web_search', {
        query: query,
        count: maxResults
      });
      // Result is already an array from the SDK
      if (Array.isArray(result)) return result;
      if (typeof result === 'string') {
        const parsed = JSON.parse(result);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (result && Array.isArray(result.results)) return result.results;
      if (result && Array.isArray(result.data)) return result.data;
      return [];
    } catch (e) {
      if (e.message.includes('429') || e.message.includes('Too many')) {
        const wait = (attempt + 1) * 5000;
        console.log(`    ⏳ Rate limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      console.error(`  Web search error: ${e.message.slice(0, 100)}`);
      return [];
    }
  }
  return [];
}

// Search academic papers (using web_search with academic site filters)
async function searchAcademic(client, query, maxResults = 5) {
  const acadQuery = `${query} site:nature.com OR site:science.org OR site:arxiv.org OR pubmed.ncbi.nlm.nih.gov`;
  return await searchWeb(client, acadQuery, maxResults);
}

// Extract structured entities using LLM
async function extractEntities(client, searchResults, domain, idPrefix, idStartNum, existingIds) {
  if (!searchResults || searchResults.length === 0) return [];

  const snippets = searchResults.map((r, i) =>
    `[${i+1}] ${(r.title || r.name || '').slice(0, 200)}\n${(r.snippet || r.content || r.abstract || '').slice(0, 500)}\nURL: ${r.url || r.link || r.pdf_url || ''}`
  ).join('\n\n');

  const prompt = `You are a data extraction specialist for a knowledge base about ${domain}.

From the following search results, extract real, factual entries as structured JSON.

CRITICAL RULES:
- Extract ONLY real, verifiable information from the search results
- Each entry MUST reference real source URLs from the search results
- Do NOT fabricate data - only use what's in the search results
- Each entry must have an "id" field starting with "${idPrefix}-${idStartNum}" incrementing
- Include a "sources" array with objects: {source_type:"web", source_credibility:"B", article_url:"<real url>", collected_at:"2026-06-19T06:45:00Z"}
- Make descriptions detailed and factual (3-5 sentences minimum)
- Include domain-specific fields as appropriate (manufacturer, technology, status, etc.)
- Return ONLY a valid JSON array, no markdown, no explanation

Existing IDs to avoid: ${existingIds.slice(-20).join(', ')}

Search results:
${snippets}

Return ONLY the JSON array:`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: 'glm-4-plus',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000
      });

      const content = response.choices?.[0]?.message?.content || '';
      // Try to extract JSON array from response
      let jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch(e) {
          // Try to fix common JSON issues
          try {
            const fixed = jsonMatch[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
            const parsed = JSON.parse(fixed);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch(e2) {}
        }
      }
      return [];
    } catch (e) {
      if (e.message.includes('429') || e.message.includes('Too many')) {
        const wait = (attempt + 1) * 5000;
        console.log(`    ⏳ LLM rate limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      console.error(`  LLM extraction error: ${e.message.slice(0, 100)}`);
      return [];
    }
  }
  return [];
}

async function mineCategory(client, opts) {
  try {
    const { name, dir, file, entityFile, idPrefix, idStartNum, queries, domain, acadQueries } = opts;
    const filePath = path.join(PROJECT_ROOT, dir, 'knowledge-base', 'entities', entityFile);
    const items = loadEntities(filePath);
    const existingIds = items.map(e => e.id).filter(Boolean);
    console.log(`  ${name}: ${items.length} existing`);

    let allResults = [];
    for (const q of queries) {
      console.log(`    📡 Web: "${q.slice(0, 50)}..."`);
      const results = await searchWeb(client, q, 8);
      allResults = [...allResults, ...results];
      await sleep(3000); // Rate limit between searches
    }

    // Academic search
    if (acadQueries && acadQueries.length > 0) {
      for (const aq of acadQueries) {
        console.log(`    📚 Academic: "${aq.slice(0, 50)}..."`);
        const acResults = await searchAcademic(client, aq, 5);
        allResults = [...allResults, ...acResults];
        await sleep(3000);
      }
    }

    console.log(`    Total results: ${allResults.length}`);

    if (allResults.length === 0) return 0;

    const newEntities = await extractEntities(client, allResults, domain, idPrefix, idStartNum, existingIds);
    if (newEntities.length > 0) {
      // Assign IDs and merge
      let nextNum = nextId(items, idPrefix + '-', idStartNum - 1);
      let added = 0;
      for (const e of newEntities) {
        // Ensure unique
        const candidateId = `${idPrefix}-${nextNum}`;
        const existingNames = items.map(i => (i.name || '').toLowerCase());
        if (!existingIds.includes(candidateId) && !existingNames.includes((e.name || '').toLowerCase())) {
          e.id = candidateId;
          items.push(e);
          existingIds.push(candidateId);
          nextNum++;
          added++;
        }
      }
      if (added > 0) {
        saveEntities(filePath, items);
        console.log(`    ✅ ${name}: +${added} new → ${items.length} total`);
        return added;
      }
    }
    console.log(`    ⚠️ ${name}: no new entities extracted`);
    return 0;
  } catch(e) {
    console.error(`    ❌ ${opts.name} error: ${e.message.slice(0, 150)}`);
    return 0;
  }
}

// ============= QUANTUM COMPUTING =============
async function mineQuantumComputing(client) {
  console.log('\n🔍 === 量子计算 (quantum-computing) ===\n');
  const dir = 'quantum-computing';
  let total = 0;

  total += await mineCategory(client, {
    name: 'Processors', dir, entityFile: 'processors.json',
    idPrefix: 'QPU', idStartNum: 281,
    queries: [
      'quantum computing processor breakthrough 2025 2026 new qubit record',
      'IBM Google Microsoft quantum chip 2025 2026 latest'
    ],
    acadQueries: ['quantum processor superconducting qubit 2025 2026'],
    domain: 'quantum computing processors (QPU hardware - superconducting, trapped ion, photonic, neutral atom)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Algorithms', dir, entityFile: 'algorithms.json',
    idPrefix: 'QALG', idStartNum: 23,
    queries: [
      'quantum algorithm breakthrough 2025 2026 new quantum speedup',
      'quantum machine learning algorithm 2025 2026 paper'
    ],
    acadQueries: ['quantum algorithm optimization machine learning 2025 2026'],
    domain: 'quantum algorithms (Shor, Grover, VQE, QAOA, quantum ML, quantum simulation)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Error Correction', dir, entityFile: 'error_correction.json',
    idPrefix: 'QEC', idStartNum: 11,
    queries: [
      'quantum error correction breakthrough 2025 2026 logical qubit',
      'quantum error correction surface code 2025 2026'
    ],
    domain: 'quantum error correction (surface code, color code, LDPC, logical qubits)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Quantum Networking', dir, entityFile: 'quantum_networking.json',
    idPrefix: 'QNET', idStartNum: 11,
    queries: [
      'quantum networking quantum internet breakthrough 2025 2026',
      'quantum key distribution QKD satellite 2025 2026'
    ],
    domain: 'quantum networking and quantum internet (QKD, entanglement distribution, quantum repeaters)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Quantum Software', dir, entityFile: 'quantum_software.json',
    idPrefix: 'QSW', idStartNum: 13,
    queries: [
      'quantum software framework SDK 2025 2026 new release',
      'quantum compiler optimization tool 2025 2026'
    ],
    domain: 'quantum software and development frameworks (Qiskit, Cirq, PennyLane, quantum compilers)'
  });

  console.log(`\n  📊 Quantum Computing total new: ${total}`);
  return total;
}

// ============= NUCLEAR ENERGY =============
async function mineNuclearEnergy(client) {
  console.log('\n🔍 === 核能 (nuclear-energy) ===\n');
  const dir = 'nuclear-energy';
  let total = 0;

  total += await mineCategory(client, {
    name: 'Reactors', dir, entityFile: 'reactors.json',
    idPrefix: 'NR', idStartNum: 78,
    queries: [
      'nuclear reactor breakthrough 2025 2026 new design approval NRC',
      'advanced fission reactor 2025 2026 construction deployment'
    ],
    acadQueries: ['advanced nuclear reactor design 2025 2026'],
    domain: 'nuclear fission reactors (PWR, BWR, fast reactors, molten salt, gas-cooled)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Fusion', dir, entityFile: 'fusion.json',
    idPrefix: 'FUS', idStartNum: 16,
    queries: [
      'nuclear fusion breakthrough 2025 2026 tokamak stellarator record',
      'fusion energy milestone 2025 2026 ITER CFS Helion TAE'
    ],
    acadQueries: ['nuclear fusion plasma confinement 2025 2026'],
    domain: 'nuclear fusion energy (tokamak, stellarator, inertial confinement, magnetic confinement, aneutronic fusion)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'SMR', dir, entityFile: 'smr.json',
    idPrefix: 'SMR', idStartNum: 13,
    queries: [
      'small modular reactor SMR 2025 2026 deployment construction progress',
      'SMR design certification licensing 2025 2026 NuScale GE Hitachi'
    ],
    domain: 'small modular reactors (SMR) - microreactors, modular nuclear, factory-built reactors'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Nuclear Fuel', dir, entityFile: 'nuclear_fuel.json',
    idPrefix: 'NFUEL', idStartNum: 9,
    queries: [
      'nuclear fuel cycle 2025 2026 HALEU uranium enrichment breakthrough',
      'nuclear fuel TRISO accident tolerant fuel 2025 2026'
    ],
    domain: 'nuclear fuel cycle (uranium enrichment, HALEU, TRISO, accident tolerant fuel, reprocessing)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Radiation Applications', dir, entityFile: 'radiation_applications.json',
    idPrefix: 'RAD', idStartNum: 11,
    queries: [
      'radiation technology application 2025 2026 medical industrial',
      'nuclear medicine isotope production 2025 2026 breakthrough'
    ],
    domain: 'radiation applications (nuclear medicine, radioisotopes, industrial irradiation, food safety)'
  });

  console.log(`\n  📊 Nuclear Energy total new: ${total}`);
  return total;
}

// ============= BRAIN SCIENCE =============
async function mineBrainScience(client) {
  console.log('\n🔍 === 脑科学 (brain-science) ===\n');
  const dir = 'brain-science';
  let total = 0;

  total += await mineCategory(client, {
    name: 'BCI', dir, entityFile: 'bci.json',
    idPrefix: 'BCI', idStartNum: 69,
    queries: [
      'brain computer interface breakthrough 2025 2026 Neuralink Synchron',
      'BCI clinical trial 2025 2026 human implant neural decoding speech'
    ],
    acadQueries: ['brain computer interface neural decoding 2025 2026'],
    domain: 'brain-computer interfaces (BCI) - invasive, semi-invasive, non-invasive, neural decoding, speech BCI'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Brain Regions', dir, entityFile: 'brain_regions.json',
    idPrefix: 'BREG', idStartNum: 26,
    queries: [
      'brain region mapping discovery 2025 2026 neuroscience connectome',
      'brain circuit neural pathway 2025 2026 new finding'
    ],
    domain: 'brain regions and neural circuits (cortex, hippocampus, thalamus, basal ganglia, connectome mapping)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Neuropharmacology', dir, entityFile: 'neuropharmacology.json',
    idPrefix: 'NPHARM', idStartNum: 13,
    queries: [
      'neuropharmacology drug breakthrough 2025 2026 brain disease treatment',
      'Alzheimer Parkinson drug approval 2025 2026 FDA'
    ],
    domain: 'neuropharmacology (neurological drugs, psychopharmacology, Alzheimer drugs, Parkinson drugs, antidepressants)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Neurotech', dir, entityFile: 'neurotech.json',
    idPrefix: 'NTECH', idStartNum: 8,
    queries: [
      'neurotechnology breakthrough 2025 2026 brain monitoring stimulation',
      'neurotech device EEG fNIRS 2025 2026 wearable'
    ],
    domain: 'neurotechnology (EEG, fNIRS, TMS, tDCS, brain monitoring, neural stimulation devices)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Neural Implants', dir, entityFile: 'neural_implants.json',
    idPrefix: 'NIMP', idStartNum: 13,
    queries: [
      'neural implant device 2025 2026 brain electrode Utah array',
      'brain implant flexible electrode 2025 2026 new development'
    ],
    domain: 'neural implants (Utah array, neural dust, flexible electrodes, brain-machine interfaces, cortical implants)'
  });
  await sleep(2000);

  total += await mineCategory(client, {
    name: 'Brain Disorders', dir, entityFile: 'brain_disorders.json',
    idPrefix: 'BDIS', idStartNum: 16,
    queries: [
      'brain disorder treatment breakthrough 2025 2026 Alzheimer Parkinson depression',
      'neurological disease therapy 2025 2026 clinical trial gene therapy'
    ],
    domain: 'brain disorders (Alzheimer, Parkinson, depression, epilepsy, stroke, TBI, neurodegenerative diseases)'
  });

  console.log(`\n  📊 Brain Science total new: ${total}`);
  return total;
}

// ============= MAIN =============
async function main() {
  console.log('🚀 周五深挖任务启动: 量子计算 + 核能 + 脑科学');
  console.log('📅 2026-06-19\n');

  // Global error handlers to prevent silent crashes
  process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection:', reason?.message?.slice(0, 200) || reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err?.message?.slice(0, 200) || err);
  });

  const client = await createClient();

  let qcCount = 0, neCount = 0, bsCount = 0;
  try { qcCount = await mineQuantumComputing(client); } catch(e) { console.error('QC error:', e.message); }
  console.log('\n⏳ 休息10秒避免限流...');
  await sleep(10000);

  try { neCount = await mineNuclearEnergy(client); } catch(e) { console.error('NE error:', e.message); }
  console.log('\n⏳ 休息10秒避免限流...');
  await sleep(10000);

  try { bsCount = await mineBrainScience(client); } catch(e) { console.error('BS error:', e.message); }

  const total = qcCount + neCount + bsCount;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🎉 深挖完成!`);
  console.log(`  量子计算: +${qcCount}`);
  console.log(`  核能: +${neCount}`);
  console.log(`  脑科学: +${bsCount}`);
  console.log(`  总计新增: ${total}`);
  console.log(`${'='.repeat(50)}`);

  // Save summary
  const summary = {
    date: '2026-06-19',
    day: 'Friday',
    domains: ['quantum-computing', 'nuclear-energy', 'brain-science'],
    new_entities: { 'quantum-computing': qcCount, 'nuclear-energy': neCount, 'brain-science': bsCount },
    total_new: total
  };
  const reportsDir = path.join(PROJECT_ROOT, 'kb-workflow', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'deep-mine-2026-06-19.json'), JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
