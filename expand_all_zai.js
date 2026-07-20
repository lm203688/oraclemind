const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');
const path = require('path');

const SITES = [
  // robot-parts (actuators +15 pending, chips done, sensors pending)
  {dir:'robot-parts', file:'actuators.json', count:30, prefix:'ACT', start:118,
   prompt:'Generate $$count robot actuator entities (servos, motors, hydraulics, pneumatics, SMA, piezo). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","category":"...","manufacturer":"...","type":"..."}. Return ONLY JSON array.'},
  {dir:'robot-parts', file:'sensors.json', count:30, prefix:'SENS', start:13,
   prompt:'Generate $$count robot sensor entities (LiDAR, IMU, cameras, tactile, ultrasonic, force torque). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","range":"...","description":"..."}. Return ONLY JSON array.'},
  
  // quantum-computing
  {dir:'quantum-computing', file:'processors.json', count:30, prefix:'QPU', start:102,
   prompt:'Generate $$count quantum processor entities (IBM, Google, IonQ, Quantinuum, PsiQuantum). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","manufacturer":"...","qubits":100,"technology":"..."}. Return ONLY JSON array.'},
  {dir:'quantum-computing', file:'algorithms.json', count:30, prefix:'ALG', start:94,
   prompt:'Generate $$count quantum algorithm entities (Shor, Grover, VQE, QAOA, HHL). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","complexity":"...","application":"..."}. Return ONLY JSON array.'},
  {dir:'quantum-computing', file:'quantum_software.json', count:30, prefix:'QSW', start:57,
   prompt:'Generate $$count quantum software frameworks (Qiskit, Cirq, PennyLane, Q#). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","language":"...","features":"..."}. Return ONLY JSON array.'},
  
  // brain-science
  {dir:'brain-science', file:'bci.json', count:30, prefix:'BCI', start:85,
   prompt:'Generate $$count BCI tech entities (Neuralink, Synchron, EEG, fNIRS). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","company":"...","type":"...","channels":100}. Return ONLY JSON array.'},
  {dir:'brain-science', file:'brain_disorders.json', count:30, prefix:'BD', start:51,
   prompt:'Generate $$count brain disorder entities (Alzheimer, Parkinson, depression, epilepsy). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","prevalence":"...","brain_regions":"..."}. Return ONLY JSON array.'},
  {dir:'brain-science', file:'neural_implants.json', count:30, prefix:'NI', start:52,
   prompt:'Generate $$count neural implant entities (Neuralink, Utah Array, DBS, retinal implants). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","company":"...","type":"...","material":"..."}. Return ONLY JSON array.'},
  
  // nuclear-energy
  {dir:'nuclear-energy', file:'reactors.json', count:30, prefix:'REA', start:96,
   prompt:'Generate $$count nuclear reactor entities (PWR, BWR, HTGR, MSR). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","status":"...","capacity":"..."}. Return ONLY JSON array.'},
  {dir:'nuclear-energy', file:'fusion.json', count:30, prefix:'FUS', start:75,
   prompt:'Generate $$count fusion technology entities (tokamak, stellarator, ICF, magnetic confinement). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","approach":"...","organization":"...","status":"..."}. Return ONLY JSON array.'},
  {dir:'nuclear-energy', file:'smr.json', count:30, prefix:'SMR', start:53,
   prompt:'Generate $$count Small Modular Reactor entities (NuScale, Terrapower, Rolls-Royce SMR). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","capacity":"...","status":"..."}. Return ONLY JSON array.'},
  
  // exo-science
  {dir:'exo-science', file:'exoplanets.json', count:30, prefix:'EXO', start:112,
   prompt:'Generate $$count exoplanet entities (gas giants, super-Earths, habitable zone). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","distance":"...","mass":"..."}. Return ONLY JSON array.'},
  {dir:'exo-science', file:'space_missions.json', count:30, prefix:'MIS', start:77,
   prompt:'Generate $$count space mission entities (NASA, ESA, JAXA, CNSA). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","agency":"...","type":"...","target":"..."}. Return ONLY JSON array.'},
  {dir:'exo-science', file:'space_telescopes.json', count:30, prefix:'TEL', start:34,
   prompt:'Generate $$count space telescope entities (JWST, Hubble, Kepler, TESS). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","wavelength":"...","launch_year":"2024"}. Return ONLY JSON array.'},
  
  // alien-minerals
  {dir:'alien-minerals', file:'minerals.json', count:30, prefix:'MIN', start:74,
   prompt:'Generate $$count mineral entities (silicates, oxides, sulfides, carbonates). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","formula":"...","crystal_system":"...","hardness":5}. Return ONLY JSON array.'},
  {dir:'alien-minerals', file:'asteroids.json', count:30, prefix:'AST', start:54,
   prompt:'Generate $$count asteroid entities (C-type, S-type, M-type, near-Earth, main belt). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","designation":"...","type":"...","diameter_km":1}. Return ONLY JSON array.'},
  {dir:'alien-minerals', file:'mining_tech.json', count:30, prefix:'MINE', start:58,
   prompt:'Generate $$count space mining technology entities. IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","description":"...","trl":5}. Return ONLY JSON array.'},
  
  // deep-sea-tech
  {dir:'deep-sea-tech', file:'submersibles.json', count:30, prefix:'SUB', start:97,
   prompt:'Generate $$count submersible entities (Alvin, Nautile, Jiaolong, Deepsea Challenger). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","max_depth":4000,"operator":"..."}. Return ONLY JSON array.'},
  {dir:'deep-sea-tech', file:'deep_sea_resources.json', count:30, prefix:'DSR', start:64,
   prompt:'Generate $$count deep sea resource entities (manganese nodules, hydrothermal vents, gas hydrates). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","resource_type":"...","location":"...","depth":"..."}. Return ONLY JSON array.'},
  {dir:'deep-sea-tech', file:'ocean_energy.json', count:30, prefix:'OCE', start:39,
   prompt:'Generate $$count ocean energy entities (tidal, wave, OTEC, current). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","depth":"...","power_potential":"..."}. Return ONLY JSON array.'},
  
  // new-energy
  {dir:'new-energy', file:'solar.json', count:30, prefix:'SOL', start:137,
   prompt:'Generate $$count solar tech entities (perovskite, tandem, CPV, thin film). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","efficiency":"...","cost":"..."}. Return ONLY JSON array.'},
  {dir:'new-energy', file:'energy_storage.json', count:30, prefix:'STO', start:114,
   prompt:'Generate $$count energy storage entities (Li-ion, solid-state, flow batteries, gravity, CAES). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","energy_density":"...","cycles":1000}. Return ONLY JSON array.'},
  {dir:'new-energy', file:'hydrogen_energy.json', count:30, prefix:'HYD', start:96,
   prompt:'Generate $$count hydrogen energy entities (electrolysis, fuel cells, storage, transport). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","efficiency":"...","cost":"..."}. Return ONLY JSON array.'},
  
  // life-science
  {dir:'life-science', file:'longevity.json', count:30, prefix:'LON', start:119,
   prompt:'Generate $$count longevity/anti-aging research entities (senolytics, NAD+, mTOR, telomerase). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","mechanism":"...","clinical_stage":"..."}. Return ONLY JSON array.'},
  {dir:'life-science', file:'cell_therapy.json', count:30, prefix:'CELL', start:92,
   prompt:'Generate $$count cell therapy entities (CAR-T, stem cell, NK cell, TIL). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","mechanism":"...","clinical_stage":"..."}. Return ONLY JSON array.'},
  {dir:'life-science', file:'synbio.json', count:30, prefix:'SYN', start:110,
   prompt:'Generate $$count synthetic biology entities (CRISPR, metabolic engineering, cell-free). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","type":"...","applications":"...","companies":"..."}. Return ONLY JSON array.'},
  
  // genetech-tools
  {dir:'genetech-tools', file:'genes.json', count:30, prefix:'GENE', start:132,
   prompt:'Generate $$count human gene entities (BRCA1, TP53, EGFR, APOE, CFTR). IDs: $$prefix-$$num+. Each: {"id":"...","symbol":"...","first_seen":"2024","last_updated":"2024","source_count":10}. Return ONLY JSON array.'},
  {dir:'genetech-tools', file:'diseases.json', count:30, prefix:'DIS', start:183,
   prompt:'Generate $$count genetic disease entities (cystic fibrosis, sickle cell, Huntingtons, hemophilia). IDs: $$prefix-$$num+. Each: {"id":"...","name":"...","first_seen":"2024","last_updated":"2024","source_count":10}. Return ONLY JSON array.'},
  {dir:'genetech-tools', file:'gene_therapies.json', count:30, prefix:'GT', start:74,
   prompt:'Generate $$count gene therapy entities (AAV, lentivirus, CRISPR therapies). IDs: $$prefix-$$num+. Each: {"id":"...","target_genes":"...","target_diseases":"...","therapy_type":"...","therapy_types":"..."}. Return ONLY JSON array.'},
];

async function expandOne(client, siteDir, filename, count, prefix, startNum, promptTpl) {
  const BASE = '/home/z/my-project';
  let edir = path.join(BASE, siteDir, 'knowledge-base', 'entities');
  if (!fs.existsSync(edir)) edir = path.join(BASE, siteDir, 'entities');
  const fpath = path.join(edir, filename);
  
  let existing = [];
  let isDict = false;
  let rawDict = null;
  if (fs.existsSync(fpath)) {
    const raw = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    if (Array.isArray(raw)) existing = raw;
    else if (typeof raw === 'object') {
      isDict = true;
      rawDict = raw;
      existing = raw.entities || raw.data || [];
    }
  }
  
  const oldCount = existing.length;
  const newEnts = [];
  const bs = 15;
  const batches = Math.ceil(count / bs);
  
  for (let b = 0; b < batches; b++) {
    const bc = Math.min(bs, count - b * bs);
    const bst = startNum + b * bs;
    const prompt = promptTpl.replace(/\$\$count/g, String(bc)).replace(/\$\$prefix/g, prefix).replace(/\$\$num/g, String(bst));
    
    try {
      const resp = await client.chat.completions.create({
        model: 'glm-4-flash',
        messages: [{role: 'user', content: prompt}],
        max_tokens: 2000,
        temperature: 0.7
      });
      const content = resp.choices[0].message.content;
      let ents = [];
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const m = clean.match(/\[[\s\S]*\]/);
      if (m) {
        try { ents = JSON.parse(m[0]); }
        catch { try { ents = JSON.parse(m[0].replace(/,]/g, ']').replace(/,}/g, '}')); } catch {} }
      }
      newEnts.push(...ents);
      console.log(`  batch ${b+1}/${batches}: +${ents.length}`);
    } catch(e) {
      console.log(`  batch ${b+1}/${batches}: error: ${e.message}`);
    }
    if (b < batches - 1) await new Promise(r => setTimeout(r, 3000));
  }
  
  const allEnts = [...existing, ...newEnts];
  if (isDict && rawDict) {
    rawDict.entities = allEnts;
    if ('last_updated' in rawDict) rawDict.last_updated = '2026-06-28';
    fs.writeFileSync(fpath, JSON.stringify(rawDict, null, 2));
  } else {
    fs.writeFileSync(fpath, JSON.stringify(allEnts, null, 2));
  }
  console.log(`✅ ${siteDir}/${filename}: ${oldCount} → ${allEnts.length} (+${newEnts.length})`);
  return newEnts.length;
}

async function main() {
  // Parse args: optional site filter
  const filter = process.argv[2];
  const tasks = filter ? SITES.filter(s => s.dir === filter) : SITES;
  
  console.log(`Expanding ${tasks.length} files...\n`);
  const client = await SDK.create();
  
  let grand = 0;
  for (const t of tasks) {
    console.log(`--- ${t.dir}/${t.file} ---`);
    try {
      grand += await expandOne(client, t.dir, t.file, t.count, t.prefix, t.start, t.prompt);
    } catch(e) {
      console.log(`❌ error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 2000)); // 2s between files
  }
  console.log(`\nGRAND TOTAL: +${grand}`);
}

main().catch(e => { console.error(e); process.exit(1); });
