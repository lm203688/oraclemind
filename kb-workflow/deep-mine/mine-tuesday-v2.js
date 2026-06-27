#!/usr/bin/env node
/**
 * Tuesday Deep Mine v2: Direct LLM extraction (no web search, avoids rate limits)
 * Quantum Computing + Nuclear Energy + Brain Science
 * Date: 2026-06-23
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

async function extractEntities(domain, context, schema, count) {
  const prompt = `You are a data extraction specialist for a knowledge base about ${domain}.

${context}

Extract ${count} NEW entity entries as a JSON array. Focus on the LATEST breakthroughs from 2025-2026 that are NOT already in the existing entries.

Schema for each entry:
${schema}

Rules:
- Extract ONLY factual, verifiable information about REAL breakthroughs, products, papers, or milestones
- Each entry MUST have a unique id and name
- Include specific details: dates, numbers, organizations, paper titles where available
- Do NOT fabricate data - only state well-known facts
- Return ONLY the JSON array, no other text
- Make each description 2-4 sentences with specific, verifiable details
- Focus on 2025-2026 developments`;

  try {
    const response = await client.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      model: 'glm-4-plus',
      temperature: 0.3,
      max_tokens: 8000
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

// ─── Entity extraction plan ───
const PLAN = [
  {
    domain: 'quantum-computing',
    name: 'Quantum Computing',
    tasks: [
      {
        file: 'processors.json',
        context: `Focus on quantum processor breakthroughs from mid-2025 to mid-2026. Key topics:
- IBM Nighthawk and Loon processors (Nov 2025 announcements)
- Google Willow follow-up and Quantum Echoes algorithm (Oct 2025, 13000x speedup)
- Quantinuum Helios 98-qubit trapped-ion (Nov 2025, 99.921% fidelity)
- Microsoft Majorana 1 topological qubit (Feb 2025)
- Amazon Ocelot cat-qubit processor (Feb 2025)
- Atom Computing 1225-qubit neutral atom + NVIDIA partnership
- PsiQuantum photonic processor and Brisbane facility ($940M)
- Xanadu IPO Q1 2026, 304% revenue increase
- QuantWare VIO-40K 10000-qubit announcement
- Princeton 1.68ms coherence silicon spin (Nov 2025 Nature)
- D-Wave Advantage2 7000+ qubit annealer
- Chinese Zuchongzhi 3.0 105-qubit
- JUPITER 50-qubit full quantum simulation (May 2026, Jülich)
- IonQ 99.99% gate fidelity milestone (Oct 2025)
- Fujitsu/RIKEN 256-qubit (April 2025)`,
        schema: `{ id: string, name: string, manufacturer: string, qubits: string, technology: string, gate_fidelity: string, status: string, description: string }`,
        count: 6
      },
      {
        file: 'error_correction.json',
        context: `Focus on quantum error correction breakthroughs 2025-2026:
- Google Willow below-threshold QEC (Dec 2024, exponential error suppression)
- Quantinuum Helios real-time QEC decoder (Nov 2025)
- IBM qLDPC codes on Loon processor (Nov 2025, <480ns decoding)
- Alice & Bob cat qubit biased-noise error correction
- Logical qubit milestones: multiple groups achieving 10+ logical qubits
- Amazon Ocelot hardware-level error correction with cat qubits
- Surface code threshold improvements
- New qLDPC (quantum low-density parity-check) code experiments`,
        schema: `{ id: string, name: string, type: string, code: string, threshold: string, description: string }`,
        count: 5
      },
      {
        file: 'quantum_networking.json',
        context: `Focus on quantum networking and quantum internet developments 2025-2026:
- Chinese quantum satellite network expansions (Micius follow-ups)
- DARPA quantum network testbed initiatives
- Entanglement distribution over 1000+ km fiber
- Quantum repeater demonstrations
- Toshiba quantum key distribution commercial deployments
- EU Quantum Internet Alliance progress
- US DOE quantum network blueprint
- Metropolitan quantum networks operational in multiple cities`,
        schema: `{ id: string, name: string, type: string, description: string, distance: string, organization: string, status: string }`,
        count: 4
      },
      {
        file: 'algorithms.json',
        context: `Focus on quantum algorithm breakthroughs 2025-2026:
- Google Quantum Echoes algorithm (Oct 2025, 13000x speedup over classical)
- Quantum machine learning algorithms with provable advantage
- Variational quantum eigensolver improvements for chemistry
- Quantum approximate optimization algorithm (QAOA) benchmarks
- Shor's algorithm implementations on near-term hardware
- Quantum phase estimation for drug discovery
- Quantum-enhanced Monte Carlo for finance`,
        schema: `{ id: string, name: string, type: string, complexity: string, application: string, description: string }`,
        count: 4
      },
      {
        file: 'quantum_software.json',
        context: `Focus on quantum software frameworks and tools 2025-2026:
- Qiskit 2.0 with dynamic circuits
- NVIDIA CUDA-Q platform for hybrid quantum-classical
- Cirq updates and Google quantum software stack
- PennyLane quantum machine learning framework
- Classiq quantum algorithm design platform
- Quantum compiler optimizations
- AWS Braket and Azure Quantum platform updates`,
        schema: `{ id: string, name: string, type: string, language: string, description: string, organization: string }`,
        count: 4
      }
    ]
  },
  {
    domain: 'nuclear-energy',
    name: 'Nuclear Energy',
    tasks: [
      {
        file: 'fusion.json',
        context: `Focus on nuclear fusion breakthroughs mid-2025 to mid-2026:
- CFS SPARC 75% complete, 106000-lb vacuum vessel installed (2026), targeting Q≥2 by 2027
- Helion Polaris D-T fusion at 150M°C, first private D-T fusion, Microsoft PPA for 2028
- China EAST dual 100 million degrees milestone (both electron and ion)
- TAE Technologies Norm NBI-only FRC breakthrough (Nature Communications April 2025)
- Pacific Fusion pulser-driven ICF breakthrough (Feb 2026)
- Proxima Fusion stellarator featured at Davos 2026
- IAEA World Fusion Outlook 2025: $10B global investment
- IEA State of Energy Innovation 2026 features fusion for first time
- DOE Fusion S&T Roadmap (October 2025)
- NRC published proposed fusion framework February 2026
- CFS ARC 400MW commercial plant in Virginia, Eni B+ offtake
- General Fusion UK demonstration facility
- Zap Energy 37M°C sheared-flow Z-pinch`,
        schema: `{ id: string, name: string, approach: string, organization: string, status: string, milestone: string, timeline: string, description: string }`,
        count: 6
      },
      {
        file: 'smr.json',
        context: `Focus on Small Modular Reactor (SMR) developments 2025-2026:
- NuScale VOYGR status and regulatory updates
- X-energy Xe-100 construction progress
- Oklo Aurora powerhouse NRC licensing
- GE Hitachi BWRX-300 deployment in Canada
- Rolls-Royce SMR UK deployment
- Holtec SMR-160 NRC certification
- Westinghouse AP300 developments
- China's Linglong One (ACP100) operational status
- Russia's floating SMR Akademik Lomonosov follow-ups
- Korean SMART reactor exports
- Microreactor developments (eVinci, Project Pele)`,
        schema: `{ id: string, name: string, type: string, capacity: string, developer: string, status: string, location: string, description: string }`,
        count: 5
      },
      {
        file: 'reactors.json',
        context: `Focus on advanced nuclear reactor developments 2025-2026:
- Terrapower Natrium sodium-cooled fast reactor construction (Wyoming)
- Kairos Power Hermes fluoride salt-cooled reactor
- Bill Gates TerraPower construction start
- China's HTR-PM high-temperature gas reactor operational
- Molten salt reactor demonstrations
- Fast reactor programs (Russia BN-1200, China CFR600)
- MIT Technology Review 2026 Breakthrough: Next-Gen Nuclear
- Advanced reactor licensing modernization
- European lead-cooled fast reactor (ALFRED) progress`,
        schema: `{ id: string, name: string, type: string, status: string, capacity: string, location: string, operator: string, technology: string, description: string }`,
        count: 5
      },
      {
        file: 'nuclear_fuel.json',
        context: `Focus on nuclear fuel cycle developments 2025-2026:
- HALEU (high-assay low-enriched uranium) production ramp-up
- Centrus Energy HALEU production in Ohio
- Uranium enrichment capacity expansions
- Accident tolerant fuel (ATF) deployments
- TRISO particle fuel for high-temperature reactors
- Thorium fuel cycle research
- Nuclear fuel recycling and reprocessing
- Uranium mining and supply chain developments
- International uranium supply security initiatives`,
        schema: `{ id: string, name: string, type: string, description: string, enrichment: string, applications: string }`,
        count: 4
      },
      {
        file: 'radiation_applications.json',
        context: `Focus on nuclear radiation applications 2025-2026:
- Medical isotope production (Mo-99, Lu-177, Ac-225)
- Radiotherapy advances (proton therapy, BNCT, alpha therapy)
- Food irradiation and sterilization applications
- Industrial radiography and non-destructive testing
- Radiation materials science research
- Nuclear desalination projects
- Space nuclear power (RTGs, fission surface power)
- Radiation processing for polymer modification`,
        schema: `{ id: string, name: string, type: string, description: string, application: string, status: string }`,
        count: 4
      }
    ]
  },
  {
    domain: 'brain-science',
    name: 'Brain Science',
    tasks: [
      {
        file: 'bci.json',
        context: `Focus on brain-computer interface breakthroughs mid-2025 to mid-2026:
- Neuralink high-volume production announcement 2026, $650M funding, UAE-PRIME trial
- China NMPA approved world's first BCI medical device (March 2026) for cervical spinal cord injury quadriplegia
- CAS CEBSIT invasive BCI first-in-human trial (26mm implant, <6mm thick, half Neuralink N1 size)
- Synchron Stentrode + AI integration for thought-to-AI-assistant communication
- Paradromics Connexus clinical trial start (Nov 2025, Nature)
- 65536-electrode wireless subdural BCI (Nature Electronics Dec 2025)
- ALS patient 19-month independent BCI use, 56.1 wpm, 99.2% accuracy (bioRxiv)
- Bidirectional BCI for walking exoskeleton with sensory feedback (UC Irvine)
- FDA breakthrough device designations wave for multiple BCI companies
- Consumer EEG wave: Neurable, Emotiv, Guardian 4 ear-EEG (CES 2026)
- First FDA-cleared in-ear EEG device (2026)
- Ultrasound neuromodulation inflection point for depression/OCD
- China national BCI strategy targeting 2027 breakthroughs`,
        schema: `{ id: string, name: string, company: string, type: string, channels: string, status: string, applications: string[], description: string }`,
        count: 6
      },
      {
        file: 'neural_implants.json',
        context: `Focus on neural implant breakthroughs 2025-2026:
- 65536-electrode wireless epidural BCI (Nature Electronics Dec 2025, 256x256 array, 50μm thick)
- New coating extending neural implant lifespan (reduces foreign body response)
- Nonsurgical brain implant via cell-electronics interface (Nature Biotechnology 2025)
- Flexible electrode maturation: polymer threads minimizing tissue scarring
- Columbia University next-gen silicon chip BCI for brain surface
- Precision Neuroscience Layer 7 thin-film microelectrode array (1024 channels, subdural)
- Neuralink polymer thread improvements
- Closed-loop DBS electrode advances for depression`,
        schema: `{ id: string, name: string, type: string, developer: string, status: string, description: string, breakthrough: string }`,
        count: 5
      },
      {
        file: 'neurotech.json',
        context: `Focus on neurotechnology breakthroughs 2025-2026:
- Focused ultrasound neuromodulation FDA advances for depression, OCD, pain
- Closed-loop deep brain stimulation for treatment-resistant depression (UCSF)
- NeuroPace RNS expansion to depression and OCD
- Multimodal EEG analyzers with AI cleared by FDA (2025-2026)
- BCI neurofeedback for cortical state switching (2026 breakthrough)
- Agentic AI scribes in neurology clinics (2026)
- Neurotech devices market $15.1B in 2026 → $31B by 2033 (CAGR 10.7%)
- UNESCO neurotechnology ethics standard implementation (2025)
- Neural data privacy legislation (Chile neurorights, others considering)
- Ear-EEG consumer neurotechnology wave (Guardian 4, etc.)
- LumiMind LumiSleep real-time auditory feedback for sleep (CES 2026)`,
        schema: `{ id: string, name: string, type: string, developer: string, status: string, description: string, breakthrough: string }`,
        count: 5
      },
      {
        file: 'neuropharmacology.json',
        context: `Focus on neuropharmacology breakthroughs 2025-2026:
- New Alzheimer's disease drug approvals (lecanemab, donanemab follow-ups)
- Psychedelic-assisted therapy (psilocybin, MDMA) clinical trial results and FDA decisions
- Depression drug breakthroughs: new mechanisms beyond SSRIs
- Parkinson's disease disease-modifying therapies in trials
- ALS drug developments (QRSO, tofersen follow-ups)
- Novel antipsychotics with fewer side effects
- Cannabis-derived neuropharmaceuticals (CBD, rare cannabinoids)
- Gene therapy for neurological disorders
- AI-driven drug discovery for brain diseases`,
        schema: `{ id: string, name: string, type: string, target: string, mechanism: string, status: string, developer: string, description: string }`,
        count: 5
      },
      {
        file: 'brain_disorders.json',
        context: `Focus on brain disorder treatment breakthroughs 2025-2026:
- Alzheimer's disease: lecanemab/donanemab real-world outcomes, blood-based biomarkers
- Parkinson's disease: alpha-synuclein targeting therapies, early detection
- ALS: SOD1 gene therapy, C9orf72 trials, disease-modifying approaches
- Depression: treatment-resistant depression new options (esketamine follow-ups, DBS)
- Epilepsy: responsive neurostimulation expansion, gene therapy for genetic epilepsies
- Multiple sclerosis: B-cell depletion therapies, remyelination approaches
- Stroke recovery: BCI-assisted rehabilitation, brain stimulation
- Traumatic brain injury: biomarker-based diagnosis, neuroprotective strategies`,
        schema: `{ id: string, name: string, type: string, affected_region: string, prevalence: string, treatment: string, research_status: string, description: string }`,
        count: 4
      }
    ]
  }
];

async function main() {
  await init();
  console.log('🚀 Tuesday Deep Mine v2 (LLM-direct)\n');
  console.log('📅 Date: 2026-06-23\n');

  let grandTotal = 0;
  const report = { date: '2026-06-23', domains: [] };

  for (const domain of PLAN) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`🔍 Domain: ${domain.name}`);
    console.log(`${'═'.repeat(60)}`);

    const domainReport = { name: domain.name, dir: domain.domain, tasks: [] };
    let domainTotal = 0;

    for (const task of domain.tasks) {
      const filePath = path.join(PROJECT_ROOT, domain.domain, 'knowledge-base', 'entities', task.file);
      console.log(`\n  🧠 Extracting: ${task.file}`);

      const entities = await extractEntities(domain.name, task.context, task.schema, task.count);

      if (entities.length > 0) {
        const { total, added } = saveEntities(filePath, entities);
        console.log(`    ✅ ${task.file}: +${added} new (total: ${total})`);
        domainTotal += added;
        domainReport.tasks.push({ file: task.file, added, total });
      } else {
        console.log(`    ⚠️ No entities extracted for ${task.file}`);
        domainReport.tasks.push({ file: task.file, added: 0, total: loadExisting(filePath).length });
      }

      // Brief pause between LLM calls
      await new Promise(r => setTimeout(r, 3000));
    }

    console.log(`\n  📊 ${domain.name} total: +${domainTotal}`);
    domainReport.totalAdded = domainTotal;
    report.domains.push(domainReport);
    grandTotal += domainTotal;
  }

  // Save report
  const reportDir = path.join(PROJECT_ROOT, 'kb-workflow', 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, 'deep-mine-2026-06-23.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎉 Grand total new entities: ${grandTotal}`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
