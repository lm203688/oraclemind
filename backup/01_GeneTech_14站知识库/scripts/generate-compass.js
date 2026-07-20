/**
 * Compass — Smart Filtering API
 * 
 * Inspired by MavenBio's Compass module:
 * - Advanced filters on entities (company, drug, trial, document)
 * - AI-driven filter suggestions
 * - Faceted search
 * 
 * GET /api/compass.json → available filters and facets per site
 */

const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';

// Define filterable fields per category per site
const COMPASS_CONFIG = {
  'genetech-tools': {
    categories: {
      'gene_therapies': {
        filters: ['therapy_type', 'development_stage', 'target_genes', 'target_diseases', 'vectors', 'companies', 'approval_agency'],
        facets: {
          'development_stage': ['approved', 'clinical_trial', 'preclinical', 'research'],
          'therapy_type': ['AAV_delivery', 'CRISPR_editing', 'base_editing', 'prime_editing', 'LNP_delivery', 'ex_vivo'],
          'approval_agency': ['FDA', 'NMPA', 'EMA', 'PMDA']
        },
        sort_options: ['approval_date', 'development_stage', 'company', 'target_disease']
      },
      'crispr_applications': {
        filters: ['editing_type', 'development_stage', 'target_genes', 'target_diseases', 'companies'],
        facets: {
          'editing_type': ['CRISPR_editing', 'base_editing', 'prime_editing', 'epigenome_editing'],
          'development_stage': ['approved', 'clinical_trial', 'preclinical']
        },
        sort_options: ['development_stage', 'editing_type', 'company']
      },
      'biotech_companies': {
        filters: ['focus_area', 'founding_year', 'headquarters', 'stage'],
        facets: {
          'stage': ['public', 'late_private', 'early_private', 'startup'],
          'focus_area': ['gene_editing', 'gene_therapy', 'cell_therapy', 'diagnostics', 'drug_discovery']
        },
        sort_options: ['founding_year', 'stage', 'focus_area']
      }
    }
  },
  'tcm-tools': {
    categories: {
      'tcm_innovative_drugs': {
        filters: ['classification', 'company', 'approval_date', 'approval_agency', 'indication', 'clinical_trial_phase'],
        facets: {
          'classification': ['中药1.1类', '中药1.2类', '2.1类', '3.1类', '已上市品种新适应症'],
          'approval_agency': ['NMPA'],
          'clinical_trial_phase': ['I期', 'II期', 'III期', '上市后研究']
        },
        sort_options: ['approval_date', 'classification', 'company']
      },
      'herbs': {
        filters: ['nature_flavor', 'meridian_tropism', 'family', 'key_compounds', 'clinical_applications'],
        facets: {
          'nature_flavor': ['甘', '苦', '辛', '咸', '酸', '温', '寒', '平', '热'],
          'meridian_tropism': ['肝经', '心经', '脾经', '肺经', '肾经', '胃经', '胆经', '大肠经', '小肠经', '膀胱经']
        },
        sort_options: ['name', 'family', 'nature_flavor']
      }
    }
  }
};

// Default compass config for sites without specific config
function getDefaultCompass(siteDir) {
  const dataPath = path.join(BASE, siteDir, 'website', 'api', 'data.json');
  if (!fs.existsSync(dataPath)) return null;
  
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    if (!data.data) return null;
    
    const categories = {};
    for (const [cat, entities] of Object.entries(data.data)) {
      if (cat === 'main' || !Array.isArray(entities) || entities.length === 0) continue;
      
      // Auto-detect filterable fields from first entity
      const sample = entities[0];
      const filterable = Object.keys(sample).filter(k => 
        typeof sample[k] === 'string' || Array.isArray(sample[k])
      ).slice(0, 8);
      
      categories[cat] = {
        filters: filterable,
        facets: {},
        sort_options: ['name', 'id'],
        entity_count: entities.length
      };
    }
    return { categories };
  } catch(e) {
    return null;
  }
}

const SITE_NAMES = {
  'genetech-tools': 'GeneTech Tools',
  'tcm-tools': 'TCMDB',
  'agent-ecosystem': 'Agent Ecosystem DB',
  'robot-parts': 'RobotParts DB',
  'quantum-computing': 'QuantumDB',
  'brain-science': 'BrainDB',
  'nuclear-energy': 'NuclearDB',
  'exo-science': 'ExoDB',
  'alien-minerals': 'MineralDB',
  'deep-sea-tech': 'DeepSeaDB',
  'new-energy': 'EnergyDB',
  'life-science': 'LifeDB',
  'biocomputing': 'BioComputeDB',
  'bionic-ai': 'BionicAI DB'
};

const SITES = Object.keys(SITE_NAMES);
let count = 0;

for (const site of SITES) {
  const apiDir = path.join(BASE, site, 'website', 'api');
  if (!fs.existsSync(apiDir)) continue;
  
  const config = COMPASS_CONFIG[site] || getDefaultCompass(site);
  if (!config) {
    console.log(`⚠️  ${site}: no data, skip`);
    continue;
  }
  
  const compass = {
    version: '1.0.0',
    last_updated: '2026-06-25',
    site: SITE_NAMES[site],
    description: 'Smart filtering and faceted search — inspired by MavenBio Compass',
    categories: config.categories,
    ai_suggestions: {
      description: 'AI can suggest optimal filters based on user query',
      endpoint: '/api/compass.json?suggest=1&q=user_query',
      enabled: true
    },
    usage_example: {
      filter: 'GET /api/data.json?category=gene_therapies&filter=development_stage:approved',
      search: 'GET /api/entities.json?q=CRISPR',
      facet: 'GET /api/compass.json#categories.gene_therapies.facets'
    }
  };
  
  fs.writeFileSync(path.join(apiDir, 'compass.json'), JSON.stringify(compass, null, 2));
  const catCount = Object.keys(config.categories).length;
  console.log(`✅ ${site}: ${catCount} categories with smart filters`);
  count++;
}

console.log(`\nTotal: ${count} sites with Compass`);
