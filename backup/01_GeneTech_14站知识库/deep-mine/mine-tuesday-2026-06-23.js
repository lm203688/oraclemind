#!/usr/bin/env node
/**
 * Tuesday Deep Mine: Quantum Computing + Nuclear Energy + Brain Science
 * Date: 2026-06-23
 * Searches web for latest 2025/2026 breakthroughs and extracts structured entities
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const PROJECT_ROOT = '/home/z/my-project';

let ZAI, client;

async function init() {
  const mod = await import(path.join(NODE_PATH, 'z-ai-web-dev-sdk', 'dist', 'index.js'));
  ZAI = mod.default;
  client = await ZAI.create();
}

async function webSearch(query, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await client.invokeFunction({
        name: 'web_search',
        arguments: JSON.stringify({ query, count: 10 })
      });
      return result;
    } catch (e) {
      if (e.message?.includes('429')) {
        const delay = (i + 1) * 20000;
        console.log(`    ⏳ Rate limited, waiting ${delay/1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error(`    Search error:`, e.message?.slice(0, 200));
        return null;
      }
    }
  }
  return null;
}

async function extractEntities(searchResults, domain, schema, count) {
  const snippets = searchResults
    ? searchResults.map((r, i) => `[${i+1}] ${r.title || ''}\n${r.snippet || r.content || r.body || ''}`).join('\n\n')
    : 'No search results. Use your extensive knowledge.';

  const prompt = `You are a data extraction specialist for a knowledge base about ${domain}.

Extract ${count} NEW entity entries as a JSON array. Focus on the LATEST breakthroughs from 2025-2026.

Schema for each entry:
${schema}

Rules:
- Extract ONLY factual, verifiable information about REAL breakthroughs, products, papers, or milestones
- Each entry MUST have a unique id and name
- Include specific details: dates, numbers, organizations, paper titles where available
- Do NOT fabricate data - only extract what's stated in search results or well-known facts
- Return ONLY the JSON array, no other text
- Make each description 2-4 sentences with specific, verifiable details

Search results:
${snippets}`;

  try {
    const response = await client.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      model: 'glm-4-plus',
      temperature: 0.1,
      max_tokens: 6000
    });

    const content = response.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (e) {
    console.error(`    LLM error:`, e.message?.slice(0, 200));
    return [];
  }
}

function loadExisting(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(data)) return data;
    return data.entities || data.data || data.items || [];
  } catch (e) { return []; }
}

function saveEntities(filePath, newEntities) {
  let existing = loadExisting(filePath);
  const existingIds = new Set(existing.map(e => e.id));
  let added = 0;
  for (const ent of newEntities) {
    if (ent.id && !existingIds.has(ent.id)) {
      existing.push(ent);
      added++;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  return { total: existing.length, added };
}

// ─── Search queries for each domain ───
const SEARCH_PLAN = [
  {
    domain: 'quantum-computing',
    name: 'Quantum Computing',
    searches: [
      {
        query: 'quantum computing breakthrough 2025 2026 latest processor qubit',
        file: 'processors.json',
        schema: `{ id: string, name: string, manufacturer: string, qubits: string, technology: string, gate_fidelity: string, status: string, description: string }`,
        count: 5
      },
      {
        query: 'quantum error correction 2025 2026 logical qubit breakthrough',
        file: 'error_correction.json',
        schema: `{ id: string, name: string, type: string, code: string, threshold: string, description: string }`,
        count: 4
      },
      {
        query: 'quantum networking 2025 2026 quantum internet entanglement distribution',
        file: 'quantum_networking.json',
        schema: `{ id: string, name: string, type: string, description: string, distance: string, organization: string, status: string }`,
        count: 4
      },
      {
        query: 'quantum algorithm 2025 2026 quantum machine learning optimization',
        file: 'algorithms.json',
        schema: `{ id: string, name: string, type: string, complexity: string, application: string, description: string }`,
        count: 4
      },
      {
        query: 'quantum software framework 2025 2026 Qiskit Cirq PennyLane',
        file: 'quantum_software.json',
        schema: `{ id: string, name: string, type: string, language: string, description: string, organization: string }`,
        count: 3
      }
    ]
  },
  {
    domain: 'nuclear-energy',
    name: 'Nuclear Energy',
    searches: [
      {
        query: 'nuclear fusion breakthrough 2025 2026 ITER CFS SPARC Helion',
        file: 'fusion.json',
        schema: `{ id: string, name: string, approach: string, organization: string, status: string, milestone: string, timeline: string, description: string }`,
        count: 5
      },
      {
        query: 'small modular reactor SMR 2025 2026 NuScale X-energy Oklo approval',
        file: 'smr.json',
        schema: `{ id: string, name: string, type: string, capacity: string, developer: string, status: string, location: string, description: string }`,
        count: 5
      },
      {
        query: 'advanced nuclear reactor 2025 2026 molten salt sodium fast reactor',
        file: 'reactors.json',
        schema: `{ id: string, name: string, type: string, status: string, capacity: string, location: string, operator: string, technology: string, description: string }`,
        count: 4
      },
      {
        query: 'nuclear fuel cycle 2025 2026 HALEU uranium enrichment breakthrough',
        file: 'nuclear_fuel.json',
        schema: `{ id: string, name: string, type: string, description: string, enrichment: string, applications: string }`,
        count: 3
      },
      {
        query: 'nuclear radiation application 2025 2026 medical isotope sterilization',
        file: 'radiation_applications.json',
        schema: `{ id: string, name: string, type: string, description: string, application: string, status: string }`,
        count: 3
      }
    ]
  },
  {
    domain: 'brain-science',
    name: 'Brain Science',
    searches: [
      {
        query: 'brain computer interface 2025 2026 Neuralink Synchron Paradromics breakthrough',
        file: 'bci.json',
        schema: `{ id: string, name: string, company: string, type: string, channels: string, status: string, applications: string[], description: string }`,
        count: 5
      },
      {
        query: 'neural implant 2025 2026 flexible electrode brain chip breakthrough',
        file: 'neural_implants.json',
        schema: `{ id: string, name: string, type: string, developer: string, status: string, description: string, breakthrough: string }`,
        count: 4
      },
      {
        query: 'neurotechnology 2025 2026 neuromodulation brain stimulation FDA approval',
        file: 'neurotech.json',
        schema: `{ id: string, name: string, type: string, developer: string, status: string, description: string, breakthrough: string }`,
        count: 4
      },
      {
        query: 'neuropharmacology 2025 2026 brain drug Alzheimer depression breakthrough',
        file: 'neuropharmacology.json',
        schema: `{ id: string, name: string, type: string, target: string, mechanism: string, status: string, developer: string, description: string }`,
        count: 4
      },
      {
        query: 'brain disorders treatment 2025 2026 Parkinson Alzheimer ALS clinical trial',
        file: 'brain_disorders.json',
        schema: `{ id: string, name: string, type: string, affected_region: string, prevalence: string, treatment: string, research_status: string, description: string }`,
        count: 3
      }
    ]
  }
];

async function main() {
  await init();
  console.log('🚀 Tuesday Deep Mine: Quantum Computing + Nuclear Energy + Brain Science\n');
  console.log('📅 Date: 2026-06-23\n');

  let grandTotal = 0;
  const report = { date: '2026-06-23', domains: [] };

  for (const domain of SEARCH_PLAN) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🔍 Domain: ${domain.name}`);
    console.log(`${'═'.repeat(60)}`);

    const domainReport = { name: domain.name, dir: domain.domain, searches: [] };
    let domainTotal = 0;

    for (const search of domain.searches) {
      const filePath = path.join(PROJECT_ROOT, domain.domain, 'knowledge-base', 'entities', search.file);
      console.log(`\n  📡 Searching: ${search.query.slice(0, 60)}...`);

      const results = await webSearch(search.query);
      if (results) {
        console.log(`    Found ${results.length} web results`);
      } else {
        console.log(`    ⚠️ No web results, using LLM knowledge only`);
      }

      console.log(`    🧠 Extracting entities...`);
      const entities = await extractEntities(results, domain.name, search.schema, search.count);

      if (entities.length > 0) {
        const { total, added } = saveEntities(filePath, entities);
        console.log(`    ✅ ${search.file}: +${added} new (total: ${total})`);
        domainTotal += added;
        domainReport.searches.push({ file: search.file, added, total });
      } else {
        console.log(`    ⚠️ No entities extracted for ${search.file}`);
        domainReport.searches.push({ file: search.file, added: 0, total: loadExisting(filePath).length });
      }

      // Rate limit between searches
      await new Promise(r => setTimeout(r, 5000));
    }

    console.log(`\n  📊 ${domain.name} total: +${domainTotal}`);
    domainReport.totalAdded = domainTotal;
    report.domains.push(domainReport);
    grandTotal += domainTotal;
  }

  // Save report
  const reportPath = path.join(PROJECT_ROOT, 'kb-workflow', 'reports', 'deep-mine-2026-06-23.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 Grand total new entities: ${grandTotal}`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
