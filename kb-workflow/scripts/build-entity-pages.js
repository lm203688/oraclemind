/**
 * Build entity detail pages + knowledge graph for all KB sites
 * - Generates /entity/<id>.html for each entity (SEO-indexable)
 * - Generates /graph.json with cross-domain relationships
 * - Updates sitemap.xml with entity pages
 * - Adds Schema.org structured data (JSON-LD)
 */

const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';

const SITES = [
  { dir: 'genetech-tools', domain: 'genetech.tools', name: 'GeneTech Tools', nameZh: '基因技术知识引擎', color: '#2563eb' },
  { dir: 'tcm-tools', domain: 'tcm.genetech.tools', name: 'TCMDB', nameZh: '中药方剂知识引擎', color: '#dc2626' },
  { dir: 'agent-ecosystem', domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', nameZh: 'AI Agent生态知识引擎', color: '#7c3aed' },
  { dir: 'robot-parts', domain: 'robot.genetech.tools', name: 'RobotParts DB', nameZh: '机器人配件知识引擎', color: '#ea580c' },
  { dir: 'quantum-computing', domain: 'quantum.genetech.tools', name: 'QuantumDB', nameZh: '量子计算知识引擎', color: '#0891b2' },
  { dir: 'brain-science', domain: 'brain.genetech.tools', name: 'BrainDB', nameZh: '脑科学知识引擎', color: '#be185d' },
  { dir: 'nuclear-energy', domain: 'nuclear.genetech.tools', name: 'NuclearDB', nameZh: '核能知识引擎', color: '#16a34a' },
  { dir: 'exo-science', domain: 'exo.genetech.tools', name: 'ExoDB', nameZh: '地外科学知识引擎', color: '#4f46e5' },
  { dir: 'alien-minerals', domain: 'mineral.genetech.tools', name: 'MineralDB', nameZh: '外星矿物知识引擎', color: '#a16207' },
  { dir: 'deep-sea-tech', domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', nameZh: '深海科技知识引擎', color: '#0e7490' },
  { dir: 'new-energy', domain: 'energy.genetech.tools', name: 'EnergyDB', nameZh: '新能源知识引擎', color: '#ca8a04' },
  { dir: 'life-science', domain: 'life.genetech.tools', name: 'LifeDB', nameZh: '生命科学知识引擎', color: '#059669' },
];

// Cross-domain relationship rules
const CROSS_DOMAIN_RULES = [
  // Quantum ↔ Brain (BCI signal processing)
  { from: 'quantum-computing', fromCat: 'algorithms', to: 'brain-science', toCat: 'bci', relation: 'enables', label: '量子算法→BCI信号处理' },
  // Nuclear ↔ Deep Sea (power for underwater)
  { from: 'nuclear-energy', fromCat: 'smr', to: 'deep-sea-tech', toCat: 'submersibles', relation: 'powers', label: 'SMR→深海动力' },
  // Nuclear ↔ Space (space nuclear power)
  { from: 'nuclear-energy', fromCat: 'reactors', to: 'exo-science', toCat: 'missions', relation: 'powers', label: '核反应堆→太空任务' },
  // Gene Tech ↔ Life Science (shared biology)
  { from: 'genetech-tools', fromCat: 'gene_therapies', to: 'life-science', toCat: 'longevity', relation: 'enables', label: '基因疗法→长寿技术' },
  // Gene Tech ↔ Brain (neurogenetics)
  { from: 'genetech-tools', fromCat: 'diseases', to: 'brain-science', toCat: 'brain_disorders', relation: 'related', label: '基因疾病→脑疾病' },
  // Robot ↔ Brain (BCI control)
  { from: 'robot-parts', fromCat: 'actuators', to: 'brain-science', toCat: 'bci', relation: 'controlled_by', label: '执行器→BCI控制' },
  // Energy ↔ Nuclear (nuclear renewable)
  { from: 'new-energy', fromCat: 'solar', to: 'nuclear-energy', fromCat2: 'nuclear_fuel', relation: 'complements', label: '太阳能↔核能互补' },
  // Quantum ↔ AI Agent (quantum ML)
  { from: 'quantum-computing', fromCat: 'algorithms', to: 'agent-ecosystem', toCat: 'sdks', relation: 'accelerates', label: '量子算法→AI加速' },
  // Space ↔ Minerals (asteroid mining)
  { from: 'exo-science', fromCat: 'missions', to: 'alien-minerals', toCat: 'asteroids', relation: 'explores', label: '太空任务→小行星采矿' },
  // Deep Sea ↔ Minerals (seabed mining)
  { from: 'deep-sea-tech', fromCat: 'resources', to: 'alien-minerals', toCat: 'mining_tech', relation: 'shares_tech', label: '深海采矿↔太空采矿技术' },
  // TCM ↔ Gene Tech (pharmacogenomics)
  { from: 'tcm-tools', fromCat: 'herbs', to: 'genetech-tools', toCat: 'genes', relation: 'targets', label: '中药→基因靶点' },
  // Life Science ↔ Brain (neurodegeneration)
  { from: 'life-science', fromCat: 'longevity', to: 'brain-science', toCat: 'brain_disorders', relation: 'addresses', label: '长寿研究→脑疾病' },
];

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

function getAllCategories(siteDir) {
  const entDir = path.join(BASE, siteDir, 'knowledge-base/entities');
  if (!fs.existsSync(entDir)) return [];
  return fs.readdirSync(entDir)
    .filter(f => f.endsWith('.json') && f !== 'main.json')
    .map(f => f.replace('.json', ''));
}

function slugify(id) {
  return id.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

function generateEntityPage(site, entity, category) {
  const name = entity.name || entity.id || 'Unknown';
  const description = entity.description || entity.key_findings?.join('. ') || '';
  const url = `https://${site.domain}/entity/${slugify(entity.id)}.html`;
  
  // Build key-value pairs for detail display
  const skipKeys = new Set(['id', 'name', 'description', 'sources', 'confidence', 'first_seen', 'last_updated']);
  const details = [];
  for (const [key, value] of Object.entries(entity)) {
    if (skipKeys.has(key) || !value) continue;
    let displayVal = value;
    if (Array.isArray(value)) {
      displayVal = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ');
    } else if (typeof value === 'object') {
      displayVal = JSON.stringify(value);
    }
    if (displayVal.length > 500) displayVal = displayVal.substring(0, 500) + '...';
    details.push({ key: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: displayVal });
  }

  // Schema.org structured data
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Thing",
    "name": name,
    "description": description.substring(0, 500),
    "url": url,
    "identifier": entity.id,
    "category": category
  };

  // Breadcrumb
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": site.nameZh, "item": `https://${site.domain}/` },
      { "@type": "ListItem", "position": 2, "name": category.replace(/_/g, ' '), "item": `https://${site.domain}/#${category}` },
      { "@type": "ListItem", "position": 3, "name": name, "item": url }
    ]
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} - ${site.nameZh}</title>
<meta name="description" content="${description.substring(0, 160).replace(/"/g, '&quot;')}">
<meta name="keywords" content="${name}, ${category.replace(/_/g, ' ')}, ${site.nameZh}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${name} - ${site.nameZh}">
<meta property="og:description" content="${description.substring(0, 200).replace(/"/g, '&quot;')}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${site.nameZh}">
<script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.6}
.header{background:linear-gradient(135deg,${site.color},${site.color}dd);color:#fff;padding:1.5rem 2rem;display:flex;align-items:center;gap:1rem}
.header a{color:#fff;text-decoration:none;opacity:.8;font-size:.9rem}
.header a:hover{opacity:1}
.header h1{font-size:1.5rem;font-weight:700}
.container{max-width:900px;margin:2rem auto;padding:0 1.5rem}
.breadcrumb{font-size:.85rem;color:#64748b;margin-bottom:1.5rem}
.breadcrumb a{color:${site.color};text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.entity-card{background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden}
.entity-header{padding:1.5rem 2rem;border-bottom:1px solid #e2e8f0}
.entity-header h2{font-size:1.8rem;font-weight:700;color:#0f172a}
.entity-header .category{display:inline-block;margin-top:.5rem;padding:.25rem .75rem;background:${site.color}15;color:${site.color};border-radius:20px;font-size:.8rem;font-weight:600}
.entity-desc{padding:1.5rem 2rem;color:#475569;font-size:1rem;line-height:1.8;border-bottom:1px solid #e2e8f0}
.entity-desc:empty{display:none}
.details{padding:1.5rem 2rem}
.detail-row{display:flex;padding:.75rem 0;border-bottom:1px solid #f1f5f9}
.detail-row:last-child{border-bottom:none}
.detail-key{width:180px;flex-shrink:0;font-weight:600;color:#334155;font-size:.9rem}
.detail-val{flex:1;color:#475569;font-size:.9rem;word-break:break-word}
.footer{margin-top:2rem;padding:1.5rem;text-align:center;color:#94a3b8;font-size:.8rem}
.footer a{color:${site.color};text-decoration:none}
</style>
</head>
<body>
<div class="header">
  <a href="/">← ${site.nameZh}</a>
  <h1>${name}</h1>
</div>
<div class="container">
  <div class="breadcrumb">
    <a href="/">首页</a> / <a href="/#${category}">${category.replace(/_/g, ' ')}</a> / ${name}
  </div>
  <div class="entity-card">
    <div class="entity-header">
      <h2>${name}</h2>
      <span class="category">${category.replace(/_/g, ' ')}</span>
    </div>
    ${description ? `<div class="entity-desc">${description}</div>` : ''}
    <div class="details">
      ${details.map(d => `<div class="detail-row"><div class="detail-key">${d.key}</div><div class="detail-val">${d.value}</div></div>`).join('\n      ')}
    </div>
  </div>
  <div class="footer">
    <p>${site.nameZh} · <a href="https://${site.domain}">${site.domain}</a> · Powered by Knowledge Engine</p>
  </div>
</div>
</body>
</html>`;
}

// Main execution
let totalPages = 0;
let totalGraphEdges = 0;
const allGraphData = { nodes: [], edges: [], domains: [] };

for (const site of SITES) {
  const categories = getAllCategories(site.dir);
  const entities = loadEntities(site.dir, categories);
  const websiteDir = path.join(BASE, site.dir, 'website');
  const entityDir = path.join(websiteDir, 'entity');
  
  // Create entity directory
  fs.mkdirSync(entityDir, { recursive: true });
  
  let sitePages = 0;
  const siteNodes = [];
  const siteEdges = [];
  const sitemapUrls = [`https://${site.domain}/`, `https://${site.domain}/api/data.json`, `https://${site.domain}/api/entities.json`];
  
  for (const [cat, items] of Object.entries(entities)) {
    for (const entity of items) {
      if (!entity.id) continue;
      const html = generateEntityPage(site, entity, cat);
      const filename = slugify(entity.id) + '.html';
      fs.writeFileSync(path.join(entityDir, filename), html);
      sitemapUrls.push(`https://${site.domain}/entity/${filename}`);
      sitePages++;
      
      // Add to graph
      const node = {
        id: entity.id,
        name: entity.name || entity.id,
        category: cat,
        domain: site.domain,
        url: `https://${site.domain}/entity/${filename}`
      };
      siteNodes.push(node);
    }
  }
  
  // Generate sitemap
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of sitemapUrls) {
    sitemap += `  <url><loc>${url}</loc><changefreq>weekly</changefreq></url>\n`;
  }
  sitemap += '</urlset>';
  try {
    fs.writeFileSync(path.join(websiteDir, 'sitemap.xml'), sitemap);
  } catch(e) {
    fs.writeFileSync(path.join(websiteDir, 'sitemap_new.xml'), sitemap);
  }
  
  // Generate site-level graph
  const siteGraph = { nodes: siteNodes, edges: siteEdges, domain: site.domain, name: site.nameZh };
  const graphPath = path.join(websiteDir, 'api', 'graph.json');
  fs.mkdirSync(path.join(websiteDir, 'api'), { recursive: true });
  fs.writeFileSync(graphPath, JSON.stringify(siteGraph, null, 2));
  
  allGraphData.nodes.push(...siteNodes);
  allGraphData.domains.push({ domain: site.domain, name: site.nameZh, nameZh: site.nameZh, entityCount: sitePages, categories: Object.keys(entities) });
  
  totalPages += sitePages;
  console.log(`✅ ${site.name} (${site.domain}): ${sitePages} entity pages, sitemap with ${sitemapUrls.length} URLs`);
}

// Build cross-domain knowledge graph edges
for (const rule of CROSS_DOMAIN_RULES) {
  const fromSite = SITES.find(s => s.dir === rule.from);
  const toSite = SITES.find(s => s.dir === rule.to);
  if (!fromSite || !toSite) continue;
  
  const fromCats = getAllCategories(rule.from);
  const toCats = getAllCategories(rule.to);
  const fromEntities = loadEntities(rule.from, fromCats);
  const toEntities = loadEntities(rule.to, toCats);
  
  const fromItems = fromEntities[rule.fromCat] || [];
  const toItems = toEntities[rule.toCat] || [];
  
  // Create representative edges (max 5 per rule to keep graph manageable)
  let edgeCount = 0;
  for (const fromItem of fromItems.slice(0, 5)) {
    for (const toItem of toItems.slice(0, 5)) {
      if (edgeCount >= 5) break;
      allGraphData.edges.push({
        source: fromItem.id,
        sourceDomain: fromSite.domain,
        target: toItem.id,
        targetDomain: toSite.domain,
        relation: rule.relation,
        label: rule.label
      });
      edgeCount++;
    }
    if (edgeCount >= 5) break;
  }
  totalGraphEdges += edgeCount;
}

// Write global knowledge graph
const globalGraphPath = path.join(BASE, 'kb-workflow', 'knowledge-graph.json');
fs.writeFileSync(globalGraphPath, JSON.stringify(allGraphData, null, 2));

// Also write to genetech.tools main site
const mainGraphPath = path.join(BASE, 'genetech-tools', 'website', 'api', 'knowledge-graph.json');
fs.mkdirSync(path.join(BASE, 'genetech-tools', 'website', 'api'), { recursive: true });
fs.writeFileSync(mainGraphPath, JSON.stringify(allGraphData, null, 2));

console.log(`\n📊 Summary:`);
console.log(`  Entity pages generated: ${totalPages}`);
console.log(`  Knowledge graph nodes: ${allGraphData.nodes.length}`);
console.log(`  Knowledge graph edges: ${allGraphData.edges.length}`);
console.log(`  Cross-domain relationships: ${totalGraphEdges}`);
console.log(`  Domains: ${allGraphData.domains.length}`);
