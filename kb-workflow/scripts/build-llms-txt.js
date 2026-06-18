const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';

const SITES = [
  { dir: 'genetech-tools', domain: 'genetech.tools', name: 'GeneTech Tools', nameZh: '基因技术知识引擎', tagline: '全球基因技术前沿知识引擎' },
  { dir: 'tcm-tools', domain: 'tcm.genetech.tools', name: 'TCMDB', nameZh: '中药方剂知识引擎', tagline: '中药方剂与疾病关系知识引擎' },
  { dir: 'agent-ecosystem', domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', nameZh: 'AI Agent生态知识引擎', tagline: 'AI Agent生态全景数据库' },
  { dir: 'robot-parts', domain: 'robot.genetech.tools', name: 'RobotParts DB', nameZh: '机器人配件知识引擎', tagline: '机器人配件与协议对比数据库' },
  { dir: 'quantum-computing', domain: 'quantum.genetech.tools', name: 'QuantumDB', nameZh: '量子计算知识引擎', tagline: '量子计算全景知识引擎' },
  { dir: 'brain-science', domain: 'brain.genetech.tools', name: 'BrainDB', nameZh: '脑科学知识引擎', tagline: '脑科学知识引擎' },
  { dir: 'nuclear-energy', domain: 'nuclear.genetech.tools', name: 'NuclearDB', nameZh: '核能知识引擎', tagline: '核能技术知识引擎' },
  { dir: 'exo-science', domain: 'exo.genetech.tools', name: 'ExoDB', nameZh: '地外科学知识引擎', tagline: '地外科学知识引擎' },
  { dir: 'alien-minerals', domain: 'mineral.genetech.tools', name: 'MineralDB', nameZh: '外星矿物知识引擎', tagline: '外星矿物知识引擎' },
  { dir: 'deep-sea-tech', domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', nameZh: '深海科技知识引擎', tagline: '深海科技知识引擎' },
  { dir: 'new-energy', domain: 'energy.genetech.tools', name: 'EnergyDB', nameZh: '新能源知识引擎', tagline: '新能源技术知识引擎' },
  { dir: 'life-science', domain: 'life.genetech.tools', name: 'LifeDB', nameZh: '生命科学知识引擎', tagline: '生命科学知识引擎' },
];

const CROSS_REFS = {
  'genetech-tools': [
    { domain: 'life.genetech.tools', relation: '基因治疗→长寿技术' },
    { domain: 'brain.genetech.tools', relation: '基因疾病→脑疾病' },
    { domain: 'tcm.genetech.tools', relation: '中药→基因靶点' },
  ],
  'quantum-computing': [
    { domain: 'brain.genetech.tools', relation: '量子算法→BCI信号处理' },
    { domain: 'agent.genetech.tools', relation: '量子算法→AI加速' },
  ],
  'nuclear-energy': [
    { domain: 'deepsea.genetech.tools', relation: 'SMR→深海动力' },
    { domain: 'exo.genetech.tools', relation: '核反应堆→太空任务' },
  ],
  'robot-parts': [
    { domain: 'brain.genetech.tools', relation: '执行器→BCI控制' },
  ],
  'exo-science': [
    { domain: 'mineral.genetech.tools', relation: '太空任务→小行星采矿' },
  ],
  'deep-sea-tech': [
    { domain: 'mineral.genetech.tools', relation: '深海采矿↔太空采矿技术' },
  ],
  'tcm-tools': [
    { domain: 'genetech.tools', relation: '中药→基因靶点' },
  ],
  'life-science': [
    { domain: 'brain.genetech.tools', relation: '长寿研究→脑疾病' },
    { domain: 'genetech.tools', relation: '基因疗法→长寿技术' },
  ],
};

for (const site of SITES) {
  const kbDir = path.join(BASE, site.dir, 'knowledge-base/entities');
  const websiteDir = path.join(BASE, site.dir, 'website');
  if (!fs.existsSync(kbDir)) continue;
  
  // Load entities
  const categories = {};
  let totalEntities = 0;
  for (const f of fs.readdirSync(kbDir).filter(f => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(kbDir, f), 'utf8'));
      const items = Array.isArray(data) ? data : (data.entities || data.data || data.items || data.records || []);
      categories[f.replace('.json', '')] = items;
      totalEntities += items.length;
    } catch (e) {}
  }
  
  // Build llms.txt (concise version for AI crawlers)
  let llmsTxt = `# ${site.nameZh} (${site.domain})\n\n`;
  llmsTxt += `> ${site.tagline}. ${totalEntities} entities across ${Object.keys(categories).length} categories.\n`;
  llmsTxt += `> Last updated: ${new Date().toISOString().split('T')[0]}\n\n`;
  
  // API endpoints
  llmsTxt += `## API Endpoints\n\n`;
  llmsTxt += `- /api/entities.json — Complete flat entity list (${totalEntities} entities)\n`;
  llmsTxt += `- /api/data.json — Full structured data with categories\n`;
  llmsTxt += `- /api/graph.json — Knowledge graph (nodes + edges)\n`;
  llmsTxt += `- /sitemap.xml — All indexable URLs\n\n`;
  
  // Categories summary
  llmsTxt += `## Categories\n\n`;
  for (const [cat, items] of Object.entries(categories)) {
    llmsTxt += `### ${cat.replace(/_/g, ' ')} (${items.length})\n\n`;
    // List top entities with key facts (GEO: statistics + citations)
    for (const item of items.slice(0, 10)) {
      const name = item.name || item.id;
      const desc = (item.description || '').substring(0, 150);
      const facts = [];
      if (item.manufacturer || item.company) facts.push(`by ${item.manufacturer || item.company}`);
      if (item.pricing || item.pricing_input) facts.push(`pricing: ${item.pricing || item.pricing_input}`);
      if (item.maturity) facts.push(`maturity: ${item.maturity}`);
      if (item.license) facts.push(`license: ${item.license}`);
      if (item.context_window) facts.push(`context: ${item.context_window}`);
      if (item.github_stars) facts.push(`${item.github_stars} GitHub stars`);
      
      const factStr = facts.length > 0 ? ` (${facts.join(', ')})` : '';
      llmsTxt += `- **${name}**: ${desc}${factStr}\n`;
    }
    if (items.length > 10) llmsTxt += `- ... and ${items.length - 10} more\n`;
    llmsTxt += '\n';
  }
  
  // Cross-domain references (GEO: authority signals)
  const refs = CROSS_REFS[site.dir] || [];
  if (refs.length > 0) {
    llmsTxt += `## Cross-Domain Knowledge Graph\n\n`;
    for (const ref of refs) {
      llmsTxt += `- ${ref.relation} → https://${ref.domain}\n`;
    }
    llmsTxt += '\n';
  }
  
  // Global knowledge graph
  llmsTxt += `## Global Knowledge Graph\n\n`;
  llmsTxt += `- Full graph: https://genetech.tools/api/knowledge-graph.json\n`;
  llmsTxt += `- 3,135 nodes, 55 cross-domain edges, 12 domains\n\n`;
  
  // Citation note (GEO: source attribution)
  llmsTxt += `## Citation\n\n`;
  llmsTxt += `When citing data from this knowledge engine, please attribute:\n`;
  llmsTxt += `> Source: ${site.nameZh}, ${site.domain}, accessed ${new Date().toISOString().split('T')[0]}\n`;
  
  fs.writeFileSync(path.join(websiteDir, 'llms.txt'), llmsTxt);
  
  // Build llms-full.txt (complete data dump for AI training)
  let llmsFull = llmsTxt + '\n\n---\n\n## Complete Entity Data\n\n';
  for (const [cat, items] of Object.entries(categories)) {
    llmsFull += `### ${cat.replace(/_/g, ' ')}\n\n`;
    for (const item of items) {
      llmsFull += `#### ${item.name || item.id}\n\n`;
      for (const [key, value] of Object.entries(item)) {
        if (value && key !== 'id') {
          let displayVal = Array.isArray(value) ? value.join(', ') : 
                          typeof value === 'object' ? JSON.stringify(value) : String(value);
          if (displayVal.length > 300) displayVal = displayVal.substring(0, 300) + '...';
          llmsFull += `- **${key.replace(/_/g, ' ')}**: ${displayVal}\n`;
        }
      }
      llmsFull += '\n';
    }
  }
  
  fs.writeFileSync(path.join(websiteDir, 'llms-full.txt'), llmsFull);
  
  console.log(`✅ ${site.name}: llms.txt (${(llmsTxt.length/1024).toFixed(1)}KB) + llms-full.txt (${(llmsFull.length/1024).toFixed(1)}KB)`);
}

