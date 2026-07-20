const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';

const SITES = [
  { dir: 'genetech-tools', domain: 'genetech.tools', name: 'GeneTech Tools', nameZh: '基因技术知识引擎', desc: 'Comprehensive gene technology knowledge base covering genes, diseases, therapies, CRISPR applications, genomic diagnostics, gene delivery, gene editing tools, biotech companies, and regenerative medicine', categories: ['genes', 'diseases', 'gene_therapies', 'crispr_applications', 'genomic_diagnostics', 'gene_delivery', 'gene_editing_tools', 'biotech_companies', 'regenerative_medicine'] },
  { dir: 'tcm-tools', domain: 'tcm.genetech.tools', name: 'TCMDB', nameZh: '中药方剂知识引擎', desc: 'Traditional Chinese Medicine knowledge base with herbs, diseases, innovative drugs, pharmacology research, and clinical/market data', categories: ['herbs', 'diseases', 'tcm_innovative_drugs', 'tcm_herb_research', 'tcm_clinical_market'] },
  { dir: 'agent-ecosystem', domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', nameZh: 'AI Agent生态知识引擎', desc: 'AI Agent ecosystem database covering MCP servers, SDKs, protocols, memory systems, and benchmarks', categories: ['mcp_servers', 'agent_sdks', 'protocols', 'memory_systems', 'model_apis', 'vector_dbs', 'benchmarks', 'sdks'] },
  { dir: 'robot-parts', domain: 'robot.genetech.tools', name: 'RobotParts DB', nameZh: '机器人配件协议库', desc: 'Robot parts and protocols database covering actuators, chips, interfaces, LLMs, and communication protocols', categories: ['actuators', 'chips', 'interfaces', 'llms', 'protocols'] },
  { dir: 'quantum-computing', domain: 'quantum.genetech.tools', name: 'QuantumDB', nameZh: '量子计算知识引擎', desc: 'Quantum computing knowledge base covering processors, algorithms, error correction, quantum software, and quantum networking', categories: ['processors', 'algorithms', 'error_correction', 'quantum_software', 'quantum_networking'] },
  { dir: 'brain-science', domain: 'brain.genetech.tools', name: 'BrainDB', nameZh: '脑科学知识引擎', desc: 'Brain science knowledge base covering brain regions, BCI, neural implants, brain disorders, and neuropharmacology', categories: ['brain_regions', 'bci', 'neural_implants', 'brain_disorders', 'neuropharmacology'] },
  { dir: 'nuclear-energy', domain: 'nuclear.genetech.tools', name: 'NuclearDB', nameZh: '核能知识引擎', desc: 'Nuclear energy knowledge base covering reactors, fusion approaches, SMRs, nuclear fuel, and radiation applications', categories: ['reactors', 'fusion', 'smr', 'nuclear_fuel', 'radiation_applications'] },
  { dir: 'exo-science', domain: 'exo.genetech.tools', name: 'ExoDB', nameZh: '地外科学知识引擎', desc: 'Exoplanet and space exploration knowledge base covering exoplanets, missions, telescopes, astrobiology, space mining, planetary science, and space habitats', categories: ['exoplanets', 'space_missions', 'space_telescopes', 'astrobiology', 'space_mining', 'planetary_science', 'space_habitats'] },
  { dir: 'alien-minerals', domain: 'mineral.genetech.tools', name: 'MineralDB', nameZh: '外星矿物知识引擎', desc: 'Extraterrestrial mineral database covering space minerals, asteroids, mining technology, lunar resources, processing methods, resource assessment, and space resources', categories: ['minerals', 'asteroids', 'mining_tech', 'lunar_resources', 'processing_methods', 'resource_assessment', 'space_resources'] },
  { dir: 'deep-sea-tech', domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', nameZh: '深海科技知识引擎', desc: 'Deep sea technology knowledge base covering submersibles, resources, ecology, underwater communication, ocean energy, marine biology, ocean exploration, and underwater tech', categories: ['submersibles', 'deep_sea_resources', 'deep_sea_ecology', 'underwater_communication', 'ocean_energy', 'marine_biology', 'ocean_exploration', 'underwater_tech'] },
  { dir: 'new-energy', domain: 'energy.genetech.tools', name: 'EnergyDB', nameZh: '新能源知识引擎', desc: 'Renewable energy knowledge base covering solar, storage, hydrogen, wind, grid technology, and clean energy', categories: ['solar', 'storage', 'hydrogen_energy', 'wind_energy', 'grid_tech', 'solar_tech', 'energy_storage', 'nuclear_renewable'] },
  { dir: 'life-science', domain: 'life.genetech.tools', name: 'LifeDB', nameZh: '生命科学知识引擎', desc: 'Life science knowledge base covering synthetic biology, longevity tech, cell therapy, bioinformatics, and biomanufacturing', categories: ['synthetic_biology', 'longevity', 'cell_therapy', 'bioinformatics', 'biomanufacturing', 'synbio', 'longevity_tech', 'biotech_tools', 'regenerative_medicine', 'bioethics'] },
  { dir: 'biocomputing', domain: 'biocompute.genetech.tools', name: 'BioComputeDB', nameZh: '生物计算机技术知识引擎', desc: 'Biological computing knowledge base covering DNA computing, organoid intelligence, gene circuits, biochips, neuromorphic computing, and biocomputing platforms', categories: ['biocomputing', 'platforms'] },
  { dir: 'bionic-ai', domain: 'bionic.genetech.tools', name: 'BionicAI DB', nameZh: 'AI仿生技术知识引擎', desc: 'AI bionic technology knowledge base covering neuromorphic computing, bionic sensors, bionic robotics, bionic materials, bionic algorithms, bionic energy, and bionic interfaces', categories: ['bionic_tech', 'bionic_companies', 'bionic_applications'] },
];

const RELATED_MAP = {
  'genetech.tools': [
    { domain: 'tcm.genetech.tools', name: 'TCMDB', relation: 'Pharmacogenomics bridges gene therapy with TCM' },
    { domain: 'life.genetech.tools', name: 'LifeDB', relation: 'Gene editing enables synthetic biology' },
    { domain: 'brain.genetech.tools', name: 'BrainDB', relation: 'Gene therapy for neurological disorders' },
  ],
  'tcm.genetech.tools': [
    { domain: 'genetech.tools', name: 'GeneTech', relation: 'Pharmacogenomics bridges gene therapy with TCM' },
    { domain: 'life.genetech.tools', name: 'LifeDB', relation: 'Natural compounds in synthetic biology' },
  ],
  'agent.genetech.tools': [
    { domain: 'robot.genetech.tools', name: 'RobotParts', relation: 'Agents control robots via protocols' },
    { domain: 'brain.genetech.tools', name: 'BrainDB', relation: 'BCI-agent interfaces' },
    { domain: 'quantum.genetech.tools', name: 'QuantumDB', relation: 'Quantum ML for agents' },
  ],
  'robot.genetech.tools': [
    { domain: 'agent.genetech.tools', name: 'AgentEco', relation: 'Agents control robots via protocols' },
    { domain: 'brain.genetech.tools', name: 'BrainDB', relation: 'Neuro-inspired robotics' },
    { domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', relation: 'Underwater robotics' },
  ],
  'quantum.genetech.tools': [
    { domain: 'agent.genetech.tools', name: 'AgentEco', relation: 'Quantum ML for agents' },
    { domain: 'nuclear.genetech.tools', name: 'NuclearDB', relation: 'Quantum simulation for fusion' },
  ],
  'brain.genetech.tools': [
    { domain: 'genetech.tools', name: 'GeneTech', relation: 'Gene therapy for neurological disorders' },
    { domain: 'robot.genetech.tools', name: 'RobotParts', relation: 'Neuro-inspired robotics' },
    { domain: 'agent.genetech.tools', name: 'AgentEco', relation: 'BCI-agent interfaces' },
  ],
  'nuclear.genetech.tools': [
    { domain: 'quantum.genetech.tools', name: 'QuantumDB', relation: 'Quantum simulation for fusion' },
    { domain: 'energy.genetech.tools', name: 'EnergyDB', relation: 'Nuclear as clean energy source' },
    { domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', relation: 'Deep sea fusion fuel (deuterium)' },
  ],
  'exo.genetech.tools': [
    { domain: 'mineral.genetech.tools', name: 'MineralDB', relation: 'Exoplanet mineralogy' },
    { domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', relation: 'Extremophile life detection' },
  ],
  'mineral.genetech.tools': [
    { domain: 'exo.genetech.tools', name: 'ExoDB', relation: 'Exoplanet mineralogy' },
    { domain: 'nuclear.genetech.tools', name: 'NuclearDB', relation: 'Helium-3 from lunar regolith' },
  ],
  'deepsea.genetech.tools': [
    { domain: 'nuclear.genetech.tools', name: 'NuclearDB', relation: 'Deep sea fusion fuel (deuterium)' },
    { domain: 'robot.genetech.tools', name: 'RobotParts', relation: 'Underwater robotics' },
    { domain: 'exo.genetech.tools', name: 'ExoDB', relation: 'Extremophile life detection' },
  ],
  'energy.genetech.tools': [
    { domain: 'nuclear.genetech.tools', name: 'NuclearDB', relation: 'Nuclear as clean energy source' },
    { domain: 'life.genetech.tools', name: 'LifeDB', relation: 'Biofuels and bioenergy' },
  ],
  'life.genetech.tools': [
    { domain: 'genetech.tools', name: 'GeneTech', relation: 'Gene editing enables synthetic biology' },
    { domain: 'tcm.genetech.tools', name: 'TCMDB', relation: 'Natural compounds in synthetic biology' },
    { domain: 'energy.genetech.tools', name: 'EnergyDB', relation: 'Biofuels and bioenergy' },
    { domain: 'biocompute.genetech.tools', name: 'BioComputeDB', relation: 'Synthetic biology gene circuits for biocomputing' },
  ],
  'biocompute.genetech.tools': [
    { domain: 'life.genetech.tools', name: 'LifeDB', relation: 'Synthetic biology gene circuits' },
    { domain: 'brain.genetech.tools', name: 'BrainDB', relation: 'Organoid intelligence and neuroscience' },
    { domain: 'genetech.tools', name: 'GeneTech', relation: 'CRISPR gene circuit computing' },
    { domain: 'quantum.genetech.tools', name: 'QuantumDB', relation: 'Bio-quantum computing intersection' },
    { domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', relation: 'Bio-inspired AI agents' },
    { domain: 'bionic.genetech.tools', name: 'BionicAI DB', relation: 'Neuromorphic computing intersection' },
  ],
  'bionic.genetech.tools': [
    { domain: 'biocompute.genetech.tools', name: 'BioComputeDB', relation: 'Neuromorphic and bio-computing overlap' },
    { domain: 'brain.genetech.tools', name: 'BrainDB', relation: 'Brain-inspired computing architecture' },
    { domain: 'robot.genetech.tools', name: 'RobotParts DB', relation: 'Bionic robot components' },
    { domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', relation: 'Swarm intelligence for agent coordination' },
    { domain: 'energy.genetech.tools', name: 'EnergyDB', relation: 'Bionic energy harvesting' },
    { domain: 'life.genetech.tools', name: 'LifeDB', relation: 'Biomimetic materials and synthetic biology' },
  ],
};

function loadEntities(siteDir, categories) {
  const entities = {};
  for (const cat of categories) {
    const filePath = path.join(BASE, siteDir, 'knowledge-base/entities', cat + '.json');
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(data)) {
          entities[cat] = data;
        } else {
          entities[cat] = data.entities || data.data || data.items || data.records || [];
        }
      } catch (e) { entities[cat] = []; }
    } else { entities[cat] = []; }
  }
  return entities;
}

function safeWrite(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (e) {
    try {
      fs.writeFileSync(filePath + '.new', content);
      console.log('  ⚠️  Wrote ' + path.basename(filePath) + '.new (original owned by root)');
      return true;
    } catch (e2) {
      console.log('  ❌ Failed: ' + path.basename(filePath) + ': ' + e2.message);
      return false;
    }
  }
}

function generateLLMsTxt(site, entities) {
  const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0);
  let txt = '# ' + site.name + ' - ' + site.nameZh + '\n\n';
  txt += '> ' + site.desc + '\n\n';
  txt += '## API Endpoints (JSON)\n\n';
  txt += '- `GET /api/data.json` - Complete structured data\n';
  txt += '- `GET /api/entities.json` - All entities flat list\n';
  txt += '- `GET /api/openapi.json` - OpenAPI 3.1 specification\n\n';
  txt += '## Stats\n\n';
  txt += '- Total entities: ' + totalEntities + '\n';
  for (const [cat, items] of Object.entries(entities)) {
    txt += '- ' + cat + ': ' + items.length + '\n';
  }
  txt += '\n## Categories\n\n';
  for (const [cat, items] of Object.entries(entities)) {
    txt += '### ' + cat + '\n\n';
    for (const item of items.slice(0, 30)) {
      const name = item.name || item.title || item.id || 'Unknown';
      const desc = item.description || item.desc || item.type || '';
      txt += desc ? '- **' + name + '**: ' + desc + '\n' : '- ' + name + '\n';
    }
    if (items.length > 30) txt += '- ... and ' + (items.length - 30) + ' more\n';
    txt += '\n';
  }
  txt += '## Related Knowledge Bases\n\n';
  const related = RELATED_MAP[site.domain] || [];
  for (const r of related) {
    txt += '- [' + r.name + '](https://' + r.domain + ') - ' + r.relation + '\n';
  }
  return txt;
}

function generateLLMsFullTxt(site, entities) {
  let txt = '# ' + site.name + ' - ' + site.nameZh + '\n\n' + site.desc + '\n\n';
  for (const [cat, items] of Object.entries(entities)) {
    txt += '## ' + cat + '\n\n';
    for (const item of items) {
      txt += '### ' + (item.name || item.title || item.id) + '\n\n';
      for (const [key, val] of Object.entries(item)) {
        if (key === 'id') continue;
        if (Array.isArray(val)) txt += '- ' + key + ': ' + val.join(', ') + '\n';
        else if (typeof val === 'object' && val !== null) txt += '- ' + key + ': ' + JSON.stringify(val) + '\n';
        else txt += '- ' + key + ': ' + val + '\n';
      }
      txt += '\n';
    }
  }
  const related = RELATED_MAP[site.domain] || [];
  if (related.length) {
    txt += '## Related Knowledge Bases\n\n';
    for (const r of related) {
      txt += '- ' + r.name + ' (https://' + r.domain + '): ' + r.relation + '\n';
    }
  }
  return txt;
}

function generateAIPlugin(site) {
  const obj = {
    schema_version: "v1",
    name_for_human: site.name,
    name_for_model: site.name.replace(/[^a-zA-Z]/g, '').toLowerCase(),
    description_for_human: site.desc,
    description_for_model: site.desc + '. Provides structured data via JSON API at /api/data.json.',
    auth: { type: "none" },
    api: { type: "openapi", url: 'https://' + site.domain + '/api/openapi.json', has_user_authentication: false },
    contact_email: "61960005@qq.com",
    legal_info_url: 'https://' + site.domain + '/'
  };
  return JSON.stringify(obj, null, 2);
}

function generateOpenAPI(site) {
  const obj = {
    openapi: "3.1.0",
    info: { title: site.name, description: site.desc, version: "1.0.0", contact: { email: "61960005@qq.com" } },
    servers: [{ url: 'https://' + site.domain }],
    paths: {
      '/api/data.json': {
        get: {
          summary: 'Get all ' + site.name + ' data',
          description: 'Returns complete structured data for ' + site.nameZh,
          responses: { '200': { description: 'Structured knowledge base data' } }
        }
      },
      '/api/entities.json': {
        get: {
          summary: 'Get all entities',
          description: 'Returns flat list of all entities across categories',
          responses: { '200': { description: 'Entity list' } }
        }
      }
    }
  };
  return JSON.stringify(obj, null, 2);
}

function generateRobotsTxt(site) {
  let txt = 'User-agent: *\n';
  txt += 'Allow: /\n';
  txt += 'Allow: /api/\n';
  txt += 'Allow: /llms.txt\n';
  txt += 'Allow: /llms-full.txt\n\n';
  txt += '# AI Agent Crawlers - Explicitly Allowed\n';
  const bots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'Google-Extended', 'Omgili', 'Bytespider', 'PerplexityBot', 'YouBot'];
  for (const bot of bots) {
    txt += 'User-agent: ' + bot + '\nAllow: /\n\n';
  }
  txt += 'Sitemap: https://' + site.domain + '/sitemap.xml\n';
  return txt;
}

// Main
console.log('🔧 Adding Agent API layer to all sites...\n');

for (const site of SITES) {
  const websiteDir = path.join(BASE, site.dir, 'website');
  if (!fs.existsSync(websiteDir)) {
    console.log('⚠️  Skipping ' + site.dir + ' - no website dir');
    continue;
  }

  const entities = loadEntities(site.dir, site.categories);
  const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0);

  // 1. /api/ directory
  const apiDir = path.join(websiteDir, 'api');
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

  const apiData = {
    meta: {
      name: site.name, name_zh: site.nameZh, domain: site.domain,
      description: site.desc, updated: new Date().toISOString(),
      total_entities: totalEntities, categories: site.categories,
      related_sites: (RELATED_MAP[site.domain] || []).map(function(r) {
        return { domain: r.domain, name: r.name, relation: r.relation, url: 'https://' + r.domain };
      })
    },
    data: entities
  };
  fs.writeFileSync(path.join(apiDir, 'data.json'), JSON.stringify(apiData, null, 2));

  const flatEntities = [];
  for (const [cat, items] of Object.entries(entities)) {
    for (const item of items) {
      const copy = Object.assign({}, item);
      copy._category = cat;
      copy._source = site.domain;
      flatEntities.push(copy);
    }
  }
  fs.writeFileSync(path.join(apiDir, 'entities.json'), JSON.stringify({ total: flatEntities.length, entities: flatEntities }, null, 2));
  fs.writeFileSync(path.join(apiDir, 'openapi.json'), generateOpenAPI(site));

  // 2. /llms.txt
  fs.writeFileSync(path.join(websiteDir, 'llms.txt'), generateLLMsTxt(site, entities));

  // 3. /llms-full.txt
  fs.writeFileSync(path.join(websiteDir, 'llms-full.txt'), generateLLMsFullTxt(site, entities));

  // 4. /.well-known/ai-plugin.json
  const wellKnownDir = path.join(websiteDir, '.well-known');
  if (!fs.existsSync(wellKnownDir)) fs.mkdirSync(wellKnownDir, { recursive: true });
  fs.writeFileSync(path.join(wellKnownDir, 'ai-plugin.json'), generateAIPlugin(site));

  // 5. robots.txt
  safeWrite(path.join(websiteDir, 'robots.txt'), generateRobotsTxt(site));

  // 6. sitemap.xml - include all entity pages for SEO
  const sitemapUrls = [
    { url: 'https://' + site.domain + '/', changefreq: 'daily', priority: '1.0' },
    { url: 'https://' + site.domain + '/api/data.json', changefreq: 'daily', priority: '0.5' },
    { url: 'https://' + site.domain + '/api/entities.json', changefreq: 'daily', priority: '0.5' },
    { url: 'https://' + site.domain + '/llms.txt', changefreq: 'daily', priority: '0.6' },
    { url: 'https://' + site.domain + '/llms-full.txt', changefreq: 'daily', priority: '0.6' },
  ];
  // Add all entity detail pages
  const entityDir = path.join(websiteDir, 'entity');
  if (fs.existsSync(entityDir)) {
    const entityFiles = fs.readdirSync(entityDir).filter(f => f.endsWith('.html'));
    entityFiles.forEach(f => {
      sitemapUrls.push({ url: 'https://' + site.domain + '/entity/' + f, changefreq: 'weekly', priority: '0.8' });
    });
  }
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const entry of sitemapUrls) {
    sitemap += '  <url><loc>' + entry.url + '</loc><changefreq>' + entry.changefreq + '</changefreq><priority>' + entry.priority + '</priority></url>\n';
  }
  sitemap += '</urlset>';
  safeWrite(path.join(websiteDir, 'sitemap.xml'), sitemap);

  console.log('✅ ' + site.name + ' (' + site.domain + '): ' + totalEntities + ' entities, API + Agent interfaces added');
}

console.log('\n🎉 All sites updated with Agent API layer!');
