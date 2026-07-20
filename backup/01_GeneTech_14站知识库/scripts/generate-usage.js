/**
 * Token Usage Tracking API
 * 
 * Tracks API calls per user for future usage-based pricing
 * Inspired by MavenBio's token tracking (55.6B tokens, Top 15)
 * 
 * GET /api/usage.json → get current usage stats
 * POST /api/usage/report → report usage (called by API gateway)
 */

const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';

// Usage tracking template
function generateUsageTemplate(siteDir, siteName) {
  return {
    version: '1.0.0',
    last_updated: '2026-06-25',
    site: siteName,
    description: 'API usage tracking for usage-based pricing',
    usage_policy: {
      free_tier: {
        daily_limit: 100,
        monthly_limit: 1000,
        rate_limit_per_minute: 10,
        endpoints: ['data.json', 'entities.json', 'atlas.json', 'workflows.json']
      },
      pro_tier: {
        daily_limit: 10000,
        monthly_limit: 100000,
        rate_limit_per_minute: 100,
        endpoints: ['*'],
        workflow_executions_per_month: 50
      },
      enterprise_tier: {
        daily_limit: 'unlimited',
        monthly_limit: 'unlimited',
        rate_limit_per_minute: 1000,
        endpoints: ['*'],
        workflow_executions_per_month: 'unlimited'
      }
    },
    current_usage: {
      // Populated by API gateway on each call
      total_requests_today: 0,
      total_requests_month: 0,
      tokens_used_today: 0,
      tokens_used_month: 0,
      top_endpoints: [],
      workflow_executions_today: 0
    },
    billing: {
      provider: 'Creem',
      store: 'FrontierKB',
      products: {
        pro_monthly: 'prod_4EpFVQGKm5vWXChbRiFdbE',
        pro_yearly: null,
        enterprise: 'prod_5OFcAcJeXzfTMkDDt6woBh'
      },
      usage_based_pricing: {
        enabled: false,
        price_per_1k_tokens: 0.001,
        free_monthly_tokens: 10000,
        pro_monthly_tokens: 1000000
      }
    },
    metrics_tracked: [
      'api_calls_total',
      'api_calls_by_endpoint',
      'tokens_consumed',
      'workflow_executions',
      'unique_api_keys',
      'data_transfer_bytes'
    ]
  };
}

// Generate for all 14 sites
const SITES = [
  'genetech-tools', 'tcm-tools', 'agent-ecosystem', 'robot-parts',
  'quantum-computing', 'brain-science', 'nuclear-energy', 'exo-science',
  'alien-minerals', 'deep-sea-tech', 'new-energy', 'life-science',
  'biocomputing', 'bionic-ai'
];

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

let count = 0;
for (const site of SITES) {
  const apiDir = path.join(BASE, site, 'website', 'api');
  if (!fs.existsSync(apiDir)) continue;
  
  const usage = generateUsageTemplate(site, SITE_NAMES[site]);
  fs.writeFileSync(path.join(apiDir, 'usage.json'), JSON.stringify(usage, null, 2));
  
  console.log(`✅ ${site}: usage.json created`);
  count++;
}

console.log(`\nTotal: ${count} sites with usage tracking`);
