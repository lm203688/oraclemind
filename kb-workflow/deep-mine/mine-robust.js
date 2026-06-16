#!/usr/bin/env node
/**
 * Robust deep data mining with rate limit handling
 * Uses z-ai-web-dev-sdk invokeFunction for web search
 * Falls back to LLM knowledge when rate limited
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const PROJECT_ROOT = '/home/z/my-project';
const CONFIG_PATH = path.join(__dirname, '..', 'agent-layer', 'site-config.json');

let ZAI, client;

async function init() {
  const mod = await import(path.join(NODE_PATH, 'z-ai-web-dev-sdk', 'dist', 'index.js'));
  ZAI = mod.default;
  client = await ZAI.create();
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadExistingData(siteDir) {
  const dataJsPath = path.join(PROJECT_ROOT, siteDir, 'website', 'data.js');
  if (!fs.existsSync(dataJsPath)) return {};
  const content = fs.readFileSync(dataJsPath, 'utf-8');
  const match = content.match(/const DB = ({[\s\S]*?});?\s*$/);
  if (!match) return {};
  try { return JSON.parse(match[1]); } catch (e) { return {}; }
}

function saveEntities(siteDir, entityName, data) {
  const entitiesDir = path.join(PROJECT_ROOT, siteDir, 'knowledge-base', 'entities');
  if (!fs.existsSync(entitiesDir)) fs.mkdirSync(entitiesDir, { recursive: true });
  const filePath = path.join(entitiesDir, `${entityName}.json`);
  let existing = [];
  if (fs.existsSync(filePath)) {
    try { existing = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (e) {}
  }
  const existingMap = new Map(existing.map(e => [e.id || e.name, e]));
  for (const item of data) {
    const key = item.id || item.name;
    if (key) existingMap.set(key, { ...existingMap.get(key), ...item, last_updated: new Date().toISOString() });
  }
  const merged = Array.from(existingMap.values());
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  return merged.length;
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
        const delay = (i + 1) * 15000;
        console.log(`    Rate limited, waiting ${delay/1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error(`    Search error:`, e.message);
        return null;
      }
    }
  }
  return null;
}

async function extractWithLLM(searchResults, entityType, domain, entitySchema) {
  const snippets = searchResults 
    ? searchResults.map((r, i) => `[${i+1}] ${r.title || ''}\n${r.snippet || r.content || r.body || ''}`).join('\n\n')
    : 'No search results available. Use your knowledge.';
  
  const prompt = `You are a data extraction specialist for a knowledge base about ${domain}.

Extract ${entityType} entries as structured JSON array.

Schema for each entry:
${entitySchema}

Rules:
- Extract ONLY factual, verifiable information
- Each entry MUST have: id (format: "${entityType.toUpperCase().replace(/S$/, '')}-xxxx" where xxxx is random 6 chars), name
- Add ALL relevant domain-specific fields
- Do NOT fabricate data - only extract what's explicitly stated or well-known
- Aim for 5-15 entries per extraction
- Return ONLY the JSON array, no other text

${searchResults ? 'Search results:\n' + snippets : 'Use your extensive knowledge about this domain.'}`;

  try {
    const response = await client.createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      model: 'glm-4-plus',
      temperature: 0.1,
      max_tokens: 4000
    });
    
    const content = response.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (e) {
    console.error(`    LLM error:`, e.message);
    return [];
  }
}

const ENTITY_SCHEMAS = {
  // Alien Minerals
  minerals: `{
    id: string, name: string, formula: string, crystal_system: string,
    hardness: string, density: string, occurrence: string,
    significance: string, source: string, description: string
  }`,
  asteroids: `{
    id: string, name: string, designation: string, type: string,
    diameter_km: string, composition: string, orbit: string,
    mining_potential: string, mission: string, description: string
  }`,
  mining_tech: `{
    id: string, name: string, type: string, description: string,
    trl: string, organization: string, target: string,
    status: string, breakthrough: string
  }`,
  space_resources: `{
    id: string, name: string, resource_type: string, location: string,
    estimated_quantity: string, extraction_method: string,
    economic_value: string, description: string
  }`,
  processing_methods: `{
    id: string, name: string, method_type: string, description: string,
    input_material: string, output: string, efficiency: string,
    space_viability: string
  }`,
  resource_assessment: `{
    id: string, name: string, body: string, resource: string,
    assessment_method: string, confidence: string, estimated_value: string,
    description: string
  }`,
  // Deep Sea
  submersibles: `{
    id: string, name: string, type: string, max_depth: string,
    operator: string, country: string, year: string,
    capabilities: string, description: string
  }`,
  deep_sea_resources: `{
    id: string, name: string, resource_type: string, location: string,
    depth: string, estimated_quantity: string, extraction_status: string,
    description: string
  }`,
  marine_biology: `{
    id: string, name: string, species: string, depth_range: string,
    habitat: string, discovery_year: string, unique_features: string,
    description: string
  }`,
  underwater_tech: `{
    id: string, name: string, type: string, depth_rating: string,
    description: string, organization: string, status: string,
    breakthrough: string
  }`,
  deep_sea_ecology: `{
    id: string, name: string, ecosystem_type: string, depth: string,
    location: string, key_species: string, description: string
  }`,
  ocean_exploration: `{
    id: string, name: string, mission_type: string, organization: string,
    year: string, location: string, discoveries: string, description: string
  }`,
  // Brain Science
  brain_regions: `{
    id: string, name: string, location: string, function: string,
    associated_disorders: string, neurotransmitters: string, description: string
  }`,
  bci_devices: `{
    id: string, name: string, type: string, invasiveness: string,
    channels: string, developer: string, status: string,
    clinical_trial: string, description: string
  }`,
  neurotech: `{
    id: string, name: string, type: string, description: string,
    developer: string, status: string, breakthrough: string
  }`,
  neurotransmitters: `{
    id: string, name: string, type: string, function: string,
    associated_regions: string, disorders: string, drugs_targeting: string,
    description: string
  }`,
  brain_disorders: `{
    id: string, name: string, type: string, affected_region: string,
    prevalence: string, treatment: string, research_status: string,
    description: string
  }`,
  consciousness_research: `{
    id: string, name: string, theory: string, proponent: string,
    evidence: string, status: string, description: string
  }`,
  // Nuclear
  reactors: `{
    id: string, name: string, type: string, status: string,
    capacity: string, location: string, operator: string,
    technology: string, description: string
  }`,
  fusion_projects: `{
    id: string, name: string, approach: string, organization: string,
    status: string, milestone: string, timeline: string, description: string
  }`,
  fission_tech: `{
    id: string, name: string, type: string, generation: string,
    description: string, developer: string, status: string
  }`,
  nuclear_fuel: `{
    id: string, name: string, type: string, description: string,
    enrichment: string, applications: string
  }`,
  nuclear_policy: `{
    id: string, name: string, country: string, type: string,
    description: string, year: string, impact: string
  }`,
  radiation_safety: `{
    id: string, name: string, type: string, description: string,
    standard: string, application: string
  }`,
  // Quantum
  processors: `{
    id: string, name: string, manufacturer: string, qubits: string,
    technology: string, gate_fidelity: string, status: string,
    description: string
  }`,
  algorithms: `{
    id: string, name: string, type: string, complexity: string,
    application: string, description: string
  }`,
  error_correction: `{
    id: string, name: string, type: string, code: string,
    threshold: string, description: string
  }`,
  quantum_software: `{
    id: string, name: string, type: string, language: string,
    description: string, organization: string
  }`,
  quantum_applications: `{
    id: string, name: string, field: string, description: string,
    advantage: string, status: string
  }`,
  quantum_networking: `{
    id: string, name: string, type: string, description: string,
    distance: string, organization: string, status: string
  }`,
  // Exo Science
  exoplanets: `{
    id: string, name: string, type: string, distance: string,
    mass: string, radius: string, orbital_period: string,
    habitable: string, discovery_method: string, description: string
  }`,
  space_missions: `{
    id: string, name: string, agency: string, type: string,
    target: string, launch_year: string, status: string,
    description: string
  }`,
  astrobiology: `{
    id: string, name: string, type: string, description: string,
    significance: string, evidence: string
  }`,
  space_telescopes: `{
    id: string, name: string, type: string, wavelength: string,
    launch_year: string, status: string, description: string
  }`,
  planetary_science: `{
    id: string, name: string, body: string, type: string,
    description: string, findings: string
  }`,
  space_habitats: `{
    id: string, name: string, type: string, location: string,
    capacity: string, description: string, status: string
  }`,
  // Energy
  solar_tech: `{
    id: string, name: string, type: string, efficiency: string,
    description: string, developer: string, status: string
  }`,
  energy_storage: `{
    id: string, name: string, type: string, capacity: string,
    efficiency: string, description: string, developer: string
  }`,
  hydrogen_energy: `{
    id: string, name: string, type: string, description: string,
    efficiency: string, status: string
  }`,
  grid_tech: `{
    id: string, name: string, type: string, description: string,
    capability: string, status: string
  }`,
  wind_energy: `{
    id: string, name: string, type: string, capacity: string,
    description: string, developer: string
  }`,
  nuclear_renewable: `{
    id: string, name: string, type: string, description: string,
    integration: string, status: string
  }`,
  // Life Science
  synthetic_biology: `{
    id: string, name: string, type: string, description: string,
    organization: string, status: string, breakthrough: string
  }`,
  longevity_tech: `{
    id: string, name: string, type: string, description: string,
    mechanism: string, status: string, developer: string
  }`,
  regenerative_medicine: `{
    id: string, name: string, type: string, description: string,
    application: string, status: string
  }`,
  biotech_tools: `{
    id: string, name: string, type: string, description: string,
    application: string, developer: string
  }`,
  bioethics: `{
    id: string, name: string, topic: string, description: string,
    controversy: string, regulation: string
  }`,
  bioinformatics: `{
    id: string, name: string, type: string, description: string,
    application: string, tool: string
  }`,
  // Robot
  actuators: `{
    id: string, name: string, type: string, torque: string,
    description: string, manufacturer: string, application: string
  }`,
  chips: `{
    id: string, name: string, manufacturer: string, architecture: string,
    process_node: string, description: string, application: string
  }`,
  protocols: `{
    id: string, name: string, type: string, description: string,
    standard: string, application: string
  }`,
  llms: `{
    id: string, name: string, developer: string, parameters: string,
    description: string, robot_integration: string
  }`,
  interfaces: `{
    id: string, name: string, type: string, description: string,
    standard: string, application: string
  }`,
  sensors: `{
    id: string, name: string, type: string, range: string,
    description: string, manufacturer: string
  }`,
  platforms: `{
    id: string, name: string, type: string, description: string,
    manufacturer: string, application: string
  }`,
  // Agent Ecosystem
  mcp_servers: `{
    id: string, name: string, description: string, developer: string,
    category: string, stars: string, url: string
  }`,
  agent_sdks: `{
    id: string, name: string, description: string, developer: string,
    language: string, url: string
  }`,
  model_apis: `{
    id: string, name: string, provider: string, description: string,
    pricing: string, capabilities: string
  }`,
  vector_dbs: `{
    id: string, name: string, description: string, type: string,
    features: string, pricing: string
  }`,
  benchmarks: `{
    id: string, name: string, description: string, metric: string,
    leaderboard: string
  }`,
  agent_frameworks: `{
    id: string, name: string, description: string, developer: string,
    language: string, features: string
  }`,
  tool_platforms: `{
    id: string, name: string, description: string, type: string,
    features: string
  }`,
  // GeneTech
  genes: `{
    id: string, symbol: string, full_name: string, chromosome: string,
    function: string, associated_diseases: string, therapies: string,
    description: string
  }`,
  diseases: `{
    id: string, name: string, type: string, prevalence: string,
    genetic_cause: string, available_therapies: string,
    clinical_trials: string, description: string
  }`,
  gene_therapies: `{
    id: string, name: string, type: string, target_disease: string,
    delivery_method: string, status: string, developer: string,
    description: string
  }`,
  crispr_applications: `{
    id: string, name: string, type: string, target_gene: string,
    application: string, status: string, developer: string,
    description: string
  }`,
  // TCM
  herbs: `{
    id: string, name_cn: string, name_en: string, name_latin: string,
    category: string, properties: string, meridian: string,
    key_compounds: string, indications: string, description: string
  }`,
  formulas: `{
    id: string, name_cn: string, name_en: string, composition: string,
    indication: string, mechanism: string, description: string
  }`,
  ingredients: `{
    id: string, name: string, source_herb: string, type: string,
    pharmacology: string, description: string
  }`,
  pharmacology: `{
    id: string, name: string, mechanism: string, evidence_level: string,
    description: string
  }`
};

async function deepMineSite(site) {
  console.log(`\n🔍 Deep mining: ${site.name}`);
  
  const existingData = loadExistingData(site.dir);
  let totalNew = 0;
  
  for (const entity of site.entities) {
    const schema = ENTITY_SCHEMAS[entity] || `{ id: string, name: string, description: string }`;
    const existingCount = (existingData[entity] || []).length;
    console.log(`  📡 Mining ${entity} (current: ${existingCount})...`);
    
    // Try web search first
    let searchResults = null;
    const query = `${site.category} ${entity.replace(/_/g, ' ')} latest 2025 2026`;
    try {
      searchResults = await webSearch(query);
      if (searchResults) {
        console.log(`    Web results: ${searchResults.length || 0}`);
      }
    } catch (e) {
      console.log(`    Search failed, using LLM knowledge`);
    }
    
    // Extract entities
    const extracted = await extractWithLLM(searchResults, entity, site.description_cn, schema);
    if (extracted.length > 0) {
      const count = saveEntities(site.dir, entity, extracted);
      console.log(`    ✅ ${entity}: +${extracted.length} → ${count} total`);
      totalNew += extracted.length;
    } else {
      console.log(`    ⚠️  No entities extracted for ${entity}`);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log(`  📊 Total new: ${totalNew}`);
  return totalNew;
}

async function main() {
  await init();
  const config = loadConfig();
  
  // Accept site name as argument for targeted mining
  const targetSite = process.argv[2];
  
  let sites = config.sites;
  if (targetSite) {
    sites = sites.filter(s => s.dir === targetSite || s.name === targetSite);
    if (sites.length === 0) {
      console.error(`Site "${targetSite}" not found. Available: ${config.sites.map(s => s.dir).join(', ')}`);
      process.exit(1);
    }
  } else {
    // Sort by data volume (ascending) - mine weakest first
    sites = sites.map(site => {
      const data = loadExistingData(site.dir);
      const total = Object.values(data.stats || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      return { site, total };
    }).sort((a, b) => a.total - b.total).map(s => s.site);
  }
  
  console.log(`🚀 Deep Mining: ${sites.length} site(s)\n`);
  
  let grandTotal = 0;
  for (const site of sites) {
    try {
      const count = await deepMineSite(site);
      grandTotal += count;
    } catch (e) {
      console.error(`  ❌ Error: ${e.message}`);
    }
  }
  
  console.log(`\n🎉 Done! Total new entries: ${grandTotal}`);
}

main().catch(console.error);
