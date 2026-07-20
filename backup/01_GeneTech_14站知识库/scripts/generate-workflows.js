/**
 * Workflow Templates API for GeneTech 14 Sites
 * 
 * Inspired by MavenBio's Workflow module:
 * - Pre-built research workflow templates per site
 * - AI executes step-by-step API calls
 * - Results tracked and auditable
 * 
 * Usage: GET /api/workflows.json → list all workflows
 *        POST /api/workflows/{id}/execute → run workflow (future)
 */

const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';

// Workflow templates for all 14 sites
const WORKFLOW_TEMPLATES = {
  // === GeneTech Tools ===
  'genetech-tools': [
    {
      id: 'wf-gt-pipeline-eval',
      name: '基因治疗管线评估',
      name_en: 'Gene Therapy Pipeline Evaluation',
      description: '评估某个靶点/疾病的基因治疗管线全貌：现有疗法、开发阶段、竞争格局',
      category: 'gene_therapy',
      steps: [
        { step: 1, action: 'search_diseases', api: '/api/diseases.json', description: '搜索目标疾病实体' },
        { step: 2, action: 'search_therapies', api: '/api/gene_therapies.json', description: '查找该疾病的所有基因疗法' },
        { step: 3, action: 'search_crispr', api: '/api/crispr_applications.json', description: '查找相关CRISPR应用' },
        { step: 4, action: 'search_companies', api: '/api/biotech_companies.json', description: '识别开发公司' },
        { step: 5, action: 'search_delivery', api: '/api/gene_delivery.json', description: '分析递送技术' },
        { step: 6, action: 'synthesize', api: null, description: 'AI汇总：管线成熟度、竞争格局、技术路线对比' }
      ],
      inputs: { disease: 'string', target_gene: 'string?' },
      output: 'structured_report',
      estimated_time: '30s',
      tier: 'pro'
    },
    {
      id: 'wf-gt-crispr-feasibility',
      name: 'CRISPR应用可行性分析',
      name_en: 'CRISPR Application Feasibility Analysis',
      description: '分析某基因的CRISPR编辑可行性：编辑类型、递送方式、脱靶风险、临床进展',
      category: 'crispr',
      steps: [
        { step: 1, action: 'search_gene', api: '/api/genes.json', description: '查找靶基因信息' },
        { step: 2, action: 'search_crispr_apps', api: '/api/crispr_applications.json', description: '查找已有CRISPR应用' },
        { step: 3, action: 'search_editing_tools', api: '/api/gene_editing_tools.json', description: '匹配编辑工具(Cas9/Cas12/Prime/Base)' },
        { step: 4, action: 'search_delivery', api: '/api/gene_delivery.json', description: '评估递送方案(AAV/LNP)' },
        { step: 5, action: 'synthesize', api: null, description: 'AI汇总：可行性评分、推荐编辑策略、风险提示' }
      ],
      inputs: { target_gene: 'string', disease: 'string?' },
      output: 'feasibility_report',
      estimated_time: '25s',
      tier: 'pro'
    },
    {
      id: 'wf-gt-competitive-landscape',
      name: '生物技术竞争格局',
      name_en: 'Biotech Competitive Landscape',
      description: '分析某领域的生物技术公司竞争格局：管线、融资、技术平台',
      category: 'competitive',
      steps: [
        { step: 1, action: 'search_companies', api: '/api/biotech_companies.json', description: '列出相关公司' },
        { step: 2, action: 'search_therapies', api: '/api/gene_therapies.json', description: '各公司管线产品' },
        { step: 3, action: 'search_diagnostics', api: '/api/genomic_diagnostics.json', description: '诊断平台对比' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：竞争矩阵、技术差异化、市场定位' }
      ],
      inputs: { therapy_area: 'string' },
      output: 'competitive_matrix',
      estimated_time: '20s',
      tier: 'pro'
    }
  ],

  // === TCM Tools ===
  'tcm-tools': [
    {
      id: 'wf-tcm-evidence-analysis',
      name: '中药方剂循证分析',
      name_en: 'TCM Formula Evidence-Based Analysis',
      description: '分析中药方剂的循证医学证据：药材→活性成分→靶点→临床证据',
      category: 'evidence',
      steps: [
        { step: 1, action: 'search_herbs', api: '/api/herbs.json', description: '查找方剂中药材' },
        { step: 2, action: 'search_research', api: '/api/tcm_herb_research.json', description: '查找活性成分和分子靶点' },
        { step: 3, action: 'search_drugs', api: '/api/tcm_innovative_drugs.json', description: '查找相关中成药' },
        { step: 4, action: 'search_clinical', api: '/api/tcm_clinical_market.json', description: '查找临床试验和市场数据' },
        { step: 5, action: 'synthesize', api: null, description: 'AI汇总：循证证据等级、机制通路、临床验证状态' }
      ],
      inputs: { formula_name: 'string', herbs: 'string[]?' },
      output: 'evidence_report',
      estimated_time: '25s',
      tier: 'pro'
    },
    {
      id: 'wf-tcm-drug-tracking',
      name: '中药新药审批追踪',
      name_en: 'TCM Drug Approval Tracking',
      description: '追踪中药新药审批状态：分类、临床试验、NMPA审批进度',
      category: 'regulatory',
      steps: [
        { step: 1, action: 'search_drugs', api: '/api/tcm_innovative_drugs.json', description: '查找目标新药' },
        { step: 2, action: 'search_clinical', api: '/api/tcm_clinical_market.json', description: '查找审批政策和临床试验' },
        { step: 3, action: 'search_research', api: '/api/tcm_herb_research.json', description: '查找相关研究支持' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：审批进度、临床证据强度、市场前景' }
      ],
      inputs: { drug_name: 'string', company: 'string?' },
      output: 'regulatory_tracker',
      estimated_time: '15s',
      tier: 'free'
    },
    {
      id: 'wf-tcm-herb-pharmacology',
      name: '单味药药理深度分析',
      name_en: 'Single Herb Pharmacology Deep Dive',
      description: '深度分析单味中药的药理：性味归经→活性成分→分子靶点→现代研究',
      category: 'pharmacology',
      steps: [
        { step: 1, action: 'search_herb', api: '/api/herbs.json', description: '获取药材基本信息' },
        { step: 2, action: 'search_research', api: '/api/tcm_herb_research.json', description: '查找药理研究' },
        { step: 3, action: 'search_diseases', api: '/api/diseases.json', description: '关联适应症' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：药理全景、靶点通路、临床应用建议' }
      ],
      inputs: { herb_name: 'string' },
      output: 'pharmacology_report',
      estimated_time: '20s',
      tier: 'free'
    }
  ],

  // === Quantum Computing ===
  'quantum-computing': [
    {
      id: 'wf-qc-algorithm-assessment',
      name: '量子算法应用评估',
      name_en: 'Quantum Algorithm Application Assessment',
      description: '评估某量子算法的实际应用可行性：硬件需求、纠错、对比经典算法优势',
      category: 'algorithm',
      steps: [
        { step: 1, action: 'search_algorithms', api: '/api/data.json', description: '查找目标量子算法' },
        { step: 2, action: 'search_hardware', api: '/api/data.json', description: '评估硬件需求(量子比特数/纠错)' },
        { step: 3, action: 'search_applications', api: '/api/data.json', description: '查找应用场景' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：可行性评分、量子优势分析、时间线预测' }
      ],
      inputs: { algorithm: 'string', application: 'string?' },
      output: 'assessment_report',
      estimated_time: '20s',
      tier: 'pro'
    }
  ],

  // === Brain Science ===
  'brain-science': [
    {
      id: 'wf-brain-disorder-research',
      name: '脑疾病研究全景',
      name_en: 'Brain Disorder Research Landscape',
      description: '某脑疾病的研究全景：机制、靶点、在研疗法、临床试验',
      category: 'research',
      steps: [
        { step: 1, action: 'search_disorders', api: '/api/data.json', description: '查找目标脑疾病' },
        { step: 2, action: 'search_targets', api: '/api/data.json', description: '识别分子靶点' },
        { step: 3, action: 'search_therapies', api: '/api/data.json', description: '查找在研疗法' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：机制通路图、研发管线、未满足需求' }
      ],
      inputs: { disorder: 'string' },
      output: 'landscape_report',
      estimated_time: '25s',
      tier: 'pro'
    }
  ],

  // === Nuclear Energy ===
  'nuclear-energy': [
    {
      id: 'wf-nuclear-reactor-comparison',
      name: '核反应堆技术对比',
      name_en: 'Nuclear Reactor Technology Comparison',
      description: '对比不同核反应堆技术：安全性、经济性、燃料循环、商业化进度',
      category: 'technology',
      steps: [
        { step: 1, action: 'search_reactors', api: '/api/data.json', description: '查找反应堆类型' },
        { step: 2, action: 'search_fuel', api: '/api/data.json', description: '分析燃料循环' },
        { step: 3, action: 'synthesize', api: null, description: 'AI汇总：技术对比矩阵、商业化时间线' }
      ],
      inputs: { reactor_type: 'string?' },
      output: 'comparison_matrix',
      estimated_time: '15s',
      tier: 'free'
    }
  ],

  // === New Energy ===
  'new-energy': [
    {
      id: 'wf-energy-storage-assessment',
      name: '储能技术评估',
      name_en: 'Energy Storage Technology Assessment',
      description: '评估储能技术：能量密度、循环寿命、成本、商业化进度',
      category: 'storage',
      steps: [
        { step: 1, action: 'search_tech', api: '/api/data.json', description: '查找储能技术' },
        { step: 2, action: 'search_materials', api: '/api/data.json', description: '分析关键材料' },
        { step: 3, action: 'synthesize', api: null, description: 'AI汇总：技术成熟度、成本趋势、应用场景' }
      ],
      inputs: { technology: 'string' },
      output: 'assessment_report',
      estimated_time: '15s',
      tier: 'free'
    }
  ],

  // === Life Science ===
  'life-science': [
    {
      id: 'wf-life-synbio-design',
      name: '合成生物学设计评估',
      name_en: 'Synthetic Biology Design Assessment',
      description: '评估合成生物学设计：基因回路、底盘生物、产物收率、商业化潜力',
      category: 'synbio',
      steps: [
        { step: 1, action: 'search_organisms', api: '/api/data.json', description: '查找底盘生物' },
        { step: 2, action: 'search_tools', api: '/api/data.json', description: '分析基因工具' },
        { step: 3, action: 'synthesize', api: null, description: 'AI汇总：设计可行性、收率预测、监管风险' }
      ],
      inputs: { product: 'string', chassis: 'string?' },
      output: 'design_assessment',
      estimated_time: '20s',
      tier: 'pro'
    }
  ],

  // === Robot Parts ===
  'robot-parts': [
    {
      id: 'wf-robot-component-selection',
      name: '机器人组件选型',
      name_en: 'Robot Component Selection',
      description: '根据应用场景推荐机器人组件：执行器、传感器、控制器、末端执行器',
      category: 'selection',
      steps: [
        { step: 1, action: 'search_actuators', api: '/api/data.json', description: '匹配执行器' },
        { step: 2, action: 'search_sensors', api: '/api/data.json', description: '匹配传感器' },
        { step: 3, action: 'synthesize', api: null, description: 'AI汇总：BOM推荐、成本估算、兼容性检查' }
      ],
      inputs: { application: 'string', payload: 'number?' },
      output: 'component_list',
      estimated_time: '15s',
      tier: 'free'
    }
  ],

  // === Bionic AI (new) ===
  'bionic-ai': [
    {
      id: 'wf-bio-inspired-solution',
      name: '仿生方案发现',
      name_en: 'Bio-Inspired Solution Discovery',
      description: '从自然界寻找工程问题的仿生解决方案：生物原型→机制→技术转化',
      category: 'discovery',
      steps: [
        { step: 1, action: 'search_tech', api: '/api/bionic_tech.json', description: '查找相关仿生技术' },
        { step: 2, action: 'search_apps', api: '/api/bionic_applications.json', description: '查找应用案例' },
        { step: 3, action: 'search_companies', api: '/api/bionic_companies.json', description: '识别供应商' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：仿生方案推荐、技术成熟度、供应商列表' }
      ],
      inputs: { problem: 'string', domain: 'string?' },
      output: 'solution_report',
      estimated_time: '20s',
      tier: 'free'
    }
  ],

  // === Cross-site workflows (unique advantage - MavenBio can't do this) ===
  '_cross-site': [
    {
      id: 'wf-cross-bio-pharma',
      name: '跨领域：中药-基因治疗交叉分析',
      name_en: 'Cross-Domain: TCM × Gene Therapy Intersection',
      description: '分析中药活性成分与基因治疗靶点的交叉：中药调控的基因是否也是基因治疗靶点',
      category: 'cross_domain',
      steps: [
        { step: 1, action: 'search_tcm_targets', api: 'tcm-tools:/api/tcm_herb_research.json', description: '获取中药靶点' },
        { step: 2, action: 'search_gene_targets', api: 'genetech-tools:/api/genes.json', description: '匹配基因治疗靶点' },
        { step: 3, action: 'search_therapies', api: 'genetech-tools:/api/gene_therapies.json', description: '查找相关基因疗法' },
        { step: 4, action: 'synthesize', api: null, description: 'AI汇总：交叉靶点列表、协同治疗潜力、新药开发机会' }
      ],
      inputs: { disease: 'string' },
      output: 'cross_domain_report',
      estimated_time: '30s',
      tier: 'pro',
      is_cross_site: true
    },
    {
      id: 'wf-cross-brain-bionic',
      name: '跨领域：脑科学-仿生AI交叉',
      name_en: 'Cross-Domain: Brain Science × Bionic AI',
      description: '脑科学发现→仿生AI应用：从脑机制研究推导仿生计算和仿生传感器灵感',
      category: 'cross_domain',
      steps: [
        { step: 1, action: 'search_brain', api: 'brain-science:/api/data.json', description: '查找脑机制研究' },
        { step: 2, action: 'search_bionic', api: 'bionic-ai:/api/bionic_tech.json', description: '匹配仿生技术' },
        { step: 3, action: 'synthesize', api: null, description: 'AI汇总：脑启发技术机会、研发现状、商业化路径' }
      ],
      inputs: { brain_function: 'string' },
      output: 'cross_domain_report',
      estimated_time: '25s',
      tier: 'pro',
      is_cross_site: true
    },
    {
      id: 'wf-cross-energy-materials',
      name: '跨领域：新能源-外星矿物交叉',
      name_en: 'Cross-Domain: New Energy × Alien Minerals',
      description: '新能源材料需求→外星矿物供给：哪些太空矿物可以解决地球新能源材料短缺',
      category: 'cross_domain',
      steps: [
        { step: 1, action: 'search_energy', api: 'new-energy:/api/data.json', description: '识别关键材料需求' },
        { step: 2, action: 'search_minerals', api: 'alien-minerals:/api/data.json', description: '匹配太空矿物' },
        { step: 3, action: 'synthesize', api: null, description: 'AI汇总：材料匹配度、太空采矿可行性、经济性分析' }
      ],
      inputs: { material: 'string?' },
      output: 'cross_domain_report',
      estimated_time: '25s',
      tier: 'pro',
      is_cross_site: true
    }
  ]
};

// Generate workflows.json for each site
function generateWorkflowsForSite(siteDir) {
  const siteWorkflows = WORKFLOW_TEMPLATES[siteDir] || [];
  const crossSiteWorkflows = WORKFLOW_TEMPLATES['_cross-site'] || [];
  
  // Each site gets its own + cross-site workflows
  const all = [...siteWorkflows, ...crossSiteWorkflows];
  
  return {
    version: '1.0.0',
    last_updated: '2026-06-25',
    total_workflows: all.length,
    site_workflows: siteWorkflows.length,
    cross_site_workflows: crossSiteWorkflows.length,
    workflows: all,
    usage: {
      free_tier: 'Free workflows are accessible without API key',
      pro_tier: 'Pro workflows require API key with credits',
      endpoint: 'GET /api/workflows.json — list all workflows\nPOST /api/workflows/{id}/execute — execute (coming soon)'
    }
  };
}

// Main: generate workflows.json for all 14 sites
const SITES = [
  'genetech-tools', 'tcm-tools', 'agent-ecosystem', 'robot-parts',
  'quantum-computing', 'brain-science', 'nuclear-energy', 'exo-science',
  'alien-minerals', 'deep-sea-tech', 'new-energy', 'life-science',
  'biocomputing', 'bionic-ai'
];

let totalWorkflows = 0;
for (const site of SITES) {
  const apiDir = path.join(BASE, site, 'website', 'api');
  if (!fs.existsSync(apiDir)) {
    console.error(`  Skip ${site}: no api dir`);
    continue;
  }
  
  const data = generateWorkflowsForSite(site);
  const outPath = path.join(apiDir, 'workflows.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  
  console.log(`✅ ${site}: ${data.total_workflows} workflows (${data.site_workflows} site + ${data.cross_site_workflows} cross-site)`);
  totalWorkflows += data.site_workflows;
}

console.log(`\nTotal site-specific workflows: ${totalWorkflows}`);
console.log(`Cross-site workflows: ${WORKFLOW_TEMPLATES['_cross-site'].length}`);
console.log(`Grand total: ${totalWorkflows + WORKFLOW_TEMPLATES['_cross-site'].length}`);
