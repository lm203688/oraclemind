/**
 * Generate Atlas (Landscape) pages for all 14 sites
 * Inspired by MavenBio's Atlas module — pre-built indication landscapes
 * 
 * Each site gets 3 atlas pages covering key dimensions
 */

const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';

// Atlas definitions per site
const ATLASES = {
  'genetech-tools': [
    {
      id: 'atlas-gt-therapy-landscape',
      name: '基因治疗管线全景图',
      name_en: 'Gene Therapy Pipeline Landscape',
      description: '所有基因疗法按疾病×疗法类型×开发阶段的矩阵全景',
      dimensions: ['target_diseases', 'therapy_type', 'development_stage'],
      data_source: 'gene_therapies.json',
      filters: { development_stage: ['approved', 'clinical_trial', 'preclinical'] }
    },
    {
      id: 'atlas-gt-crispr-applications',
      name: 'CRISPR应用全景图',
      name_en: 'CRISPR Applications Landscape',
      description: '所有CRISPR应用按编辑类型×靶基因×疾病的矩阵全景',
      dimensions: ['editing_type', 'target_genes', 'target_diseases'],
      data_source: 'crispr_applications.json',
      filters: {}
    },
    {
      id: 'atlas-gt-delivery-tech',
      name: '基因递送技术全景图',
      name_en: 'Gene Delivery Technology Landscape',
      description: '递送技术对比：AAV/LNP/外泌体等，按载体类型×应用×成熟度',
      dimensions: ['category', 'applications', 'maturity'],
      data_source: 'gene_delivery.json',
      filters: {}
    }
  ],
  'tcm-tools': [
    {
      id: 'atlas-tcm-drugs',
      name: '中药新药审批全景',
      name_en: 'TCM Innovative Drugs Approval Landscape',
      description: '所有中药新药按分类×适应症×审批状态',
      dimensions: ['classification', 'indication', 'approval_date'],
      data_source: 'tcm_innovative_drugs.json',
      filters: {}
    },
    {
      id: 'atlas-tcm-herb-research',
      name: '中药药理研究全景',
      name_en: 'TCM Herb Research Landscape',
      description: '中药材研究按药材×活性成分×分子靶点×疾病',
      dimensions: ['herb_name', 'active_compound', 'molecular_target'],
      data_source: 'tcm_herb_research.json',
      filters: {}
    },
    {
      id: 'atlas-tcm-market',
      name: '中医药市场与临床全景',
      name_en: 'TCM Market & Clinical Landscape',
      description: '中医药市场趋势、临床试验进展、AI应用、国际化',
      dimensions: ['category', 'topic'],
      data_source: 'tcm_clinical_market.json',
      filters: {}
    }
  ],
  'brain-science': [
    {
      id: 'atlas-brain-disorders',
      name: '脑疾病研究全景',
      name_en: 'Brain Disorder Research Landscape',
      description: '脑疾病按类型×靶点×疗法×临床试验阶段',
      dimensions: ['disorder_type', 'targets', 'therapies'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'quantum-computing': [
    {
      id: 'atlas-qc-algorithms',
      name: '量子算法全景图',
      name_en: 'Quantum Algorithm Landscape',
      description: '量子算法按类型×应用场景×硬件需求',
      dimensions: ['algorithm_type', 'applications', 'hardware'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'new-energy': [
    {
      id: 'atlas-energy-storage',
      name: '储能技术全景图',
      name_en: 'Energy Storage Technology Landscape',
      description: '储能技术按类型×能量密度×成熟度×成本',
      dimensions: ['technology_type', 'energy_density', 'maturity'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'nuclear-energy': [
    {
      id: 'atlas-nuclear-reactors',
      name: '核反应堆类型全景',
      name_en: 'Nuclear Reactor Types Landscape',
      description: '反应堆按代际×冷却剂×燃料×商业化状态',
      dimensions: ['generation', 'coolant', 'fuel', 'status'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'bionic-ai': [
    {
      id: 'atlas-bionic-tech',
      name: '仿生技术全景图',
      name_en: 'Bionic Technology Landscape',
      description: '仿生技术按类型×生物灵感×成熟度×应用',
      dimensions: ['category', 'biological_inspiration', 'maturity'],
      data_source: 'bionic_tech.json',
      filters: {}
    }
  ],
  'robot-parts': [
    {
      id: 'atlas-robot-components',
      name: '机器人组件全景图',
      name_en: 'Robot Components Landscape',
      description: '机器人组件按类型×应用×供应商',
      dimensions: ['component_type', 'applications', 'manufacturers'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'life-science': [
    {
      id: 'atlas-synbio',
      name: '合成生物学全景图',
      name_en: 'Synthetic Biology Landscape',
      description: '合成生物学按底盘生物×产物×技术平台',
      dimensions: ['chassis', 'product', 'platform'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'agent-ecosystem': [
    {
      id: 'atlas-agent-platforms',
      name: 'Agent平台全景图',
      name_en: 'Agent Platforms Landscape',
      description: 'AI Agent平台按类型×能力×开源/闭源×部署方式',
      dimensions: ['type', 'capabilities', 'license'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'exo-science': [
    {
      id: 'atlas-exo-discoveries',
      name: '系外行星发现全景图',
      name_en: 'Exoplanet Discoveries Landscape',
      description: '系外行星按发现方法×类型×宿主星×宜居性',
      dimensions: ['detection_method', 'planet_type', 'habitability'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'alien-minerals': [
    {
      id: 'atlas-space-minerals',
      name: '太空矿物全景图',
      name_en: 'Space Minerals Landscape',
      description: '太空矿物按来源×类型×开采可行性×稀有度',
      dimensions: ['source', 'mineral_type', 'rarity'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'deep-sea-tech': [
    {
      id: 'atlas-deepsea-tech',
      name: '深海技术全景图',
      name_en: 'Deep Sea Technology Landscape',
      description: '深海技术按类型×深度等级×成熟度×应用',
      dimensions: ['technology_type', 'depth_rating', 'maturity'],
      data_source: 'data.json',
      filters: {}
    }
  ],
  'biocomputing': [
    {
      id: 'atlas-biocompute',
      name: '生物计算全景图',
      name_en: 'Biocomputing Landscape',
      description: '生物计算按类型×成熟度×应用领域',
      dimensions: ['type', 'maturity', 'applications'],
      data_source: 'data.json',
      filters: {}
    }
  ]
};

// Generate atlas.json for a site
function generateAtlasForSite(siteDir) {
  const atlasses = ATLASES[siteDir] || [];
  
  // Load data to compute summaries
  const summaries = [];
  for (const atlas of atlasses) {
    const dataPath = path.join(BASE, siteDir, 'website', 'api', atlas.data_source);
    let entityCount = 0;
    let dimensionSummary = {};
    
    if (fs.existsSync(dataPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        let entities = [];
        if (data.entities) entities = data.entities;
        else if (data.data) {
          // data.json has {data: {cat1: [...], cat2: [...]}}
          const key = atlas.data_source.replace('.json','');
          if (data.data[key]) entities = data.data[key];
          else {
            // Flatten all categories
            for (const [k, v] of Object.entries(data.data)) {
              if (Array.isArray(v)) entities = entities.concat(v);
            }
          }
        }
        entityCount = Array.isArray(entities) ? entities.length : 0;
        
        // Compute dimension distribution
        for (const dim of atlas.dimensions) {
          const values = {};
          for (const e of entities) {
            const val = e[dim];
            if (Array.isArray(val)) {
              for (const v of val) {
                const key = typeof v === 'string' ? v : JSON.stringify(v);
                values[key] = (values[key] || 0) + 1;
              }
            } else if (val) {
              const key = String(val);
              values[key] = (values[key] || 0) + 1;
            }
          }
          dimensionSummary[dim] = Object.entries(values)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([k, v]) => ({ value: k, count: v }));
        }
      } catch (e) {
        console.error(`  Error loading ${atlas.data_source}: ${e.message}`);
      }
    }
    
    summaries.push({
      ...atlas,
      entity_count: entityCount,
      dimension_summary: dimensionSummary,
      generated_at: new Date().toISOString()
    });
  }
  
  return {
    version: '1.0.0',
    last_updated: '2026-06-25',
    total_atlases: summaries.length,
    atlases: summaries,
    usage: {
      description: 'Atlas provides bird\'s-eye view of knowledge base across key dimensions',
      free_tier: 'Atlas summaries are free to browse',
      pro_tier: 'Detailed drill-down requires Pro API key'
    }
  };
}

// Main
const SITES = Object.keys(ATLASES);
let totalAtlas = 0;

for (const site of SITES) {
  const apiDir = path.join(BASE, site, 'website', 'api');
  if (!fs.existsSync(apiDir)) continue;
  
  const data = generateAtlasForSite(site);
  fs.writeFileSync(path.join(apiDir, 'atlas.json'), JSON.stringify(data, null, 2));
  
  console.log(`✅ ${site}: ${data.total_atlases} atlas pages`);
  for (const a of data.atlases) {
    console.log(`   - ${a.id}: ${a.name} (${a.entity_count} entities)`);
  }
  totalAtlas += data.total_atlases;
}

console.log(`\nTotal atlas pages: ${totalAtlas}`);
