/**
 * Add GEO (Generative Engine Optimization) enhancements to all KB sites
 * Based on Princeton research: citing sources +40%, statistics +37%, quotations +30%
 */

const fs = require('fs');
const path = require('path');
const BASE = '/home/z/my-project';

const SITES = [
  { dir: 'genetech-tools', domain: 'genetech.tools', name: 'GeneTech Tools', nameZh: '基因技术知识引擎', tagline: '全球基因技术前沿知识引擎，覆盖基因治疗、CRISPR编辑、基因-疾病关系' },
  { dir: 'tcm-tools', domain: 'tcm.genetech.tools', name: 'TCMDB', nameZh: '中药方剂知识引擎', tagline: '中药方剂与疾病关系知识引擎，涵盖1393种疾病与347种中药' },
  { dir: 'agent-ecosystem', domain: 'agent.genetech.tools', name: 'Agent Ecosystem DB', nameZh: 'AI Agent生态知识引擎', tagline: 'AI Agent生态全景数据库，覆盖MCP服务器、SDK、协议、框架' },
  { dir: 'robot-parts', domain: 'robot.genetech.tools', name: 'RobotParts DB', nameZh: '机器人配件知识引擎', tagline: '机器人配件与协议对比数据库，执行器/芯片/通信协议一站式查询' },
  { dir: 'quantum-computing', domain: 'quantum.genetech.tools', name: 'QuantumDB', nameZh: '量子计算知识引擎', tagline: '量子计算全景知识引擎，覆盖处理器、算法、纠错、软件栈' },
  { dir: 'brain-science', domain: 'brain.genetech.tools', name: 'BrainDB', nameZh: '脑科学知识引擎', tagline: '脑科学知识引擎，涵盖脑区、神经递质、BCI、脑疾病' },
  { dir: 'nuclear-energy', domain: 'nuclear.genetech.tools', name: 'NuclearDB', nameZh: '核能知识引擎', tagline: '核能技术知识引擎，覆盖反应堆、聚变、SMR、核燃料循环' },
  { dir: 'exo-science', domain: 'exo.genetech.tools', name: 'ExoDB', nameZh: '地外科学知识引擎', tagline: '地外科学知识引擎，系外行星、天体生物学、行星探测' },
  { dir: 'alien-minerals', domain: 'mineral.genetech.tools', name: 'MineralDB', nameZh: '外星矿物知识引擎', tagline: '外星矿物知识引擎，月球矿物、小行星资源、太空采矿' },
  { dir: 'deep-sea-tech', domain: 'deepsea.genetech.tools', name: 'DeepSeaDB', nameZh: '深海科技知识引擎', tagline: '深海科技知识引擎，潜水器、海底矿产、深海生物' },
  { dir: 'new-energy', domain: 'energy.genetech.tools', name: 'EnergyDB', nameZh: '新能源知识引擎', tagline: '新能源技术知识引擎，光伏、储能、氢能、风电' },
  { dir: 'life-science', domain: 'life.genetech.tools', name: 'LifeDB', nameZh: '生命科学知识引擎', tagline: '生命科学知识引擎，长寿技术、合成生物学、基因治疗' },
];

function addGEOToEntityPage(html, site, entity, category) {
  const name = entity.name || entity.id || 'Unknown';
  const description = entity.description || entity.key_findings?.join('. ') || '';
  const url = `https://${site.domain}/entity/${entity.id?.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}.html`;
  
  // Generate TL;DR (2-3 sentences an LLM can reuse)
  const tldr = description.length > 20 ? description.substring(0, 200) : `${name} is a ${category.replace(/_/g, ' ')} entry in the ${site.nameZh} database.`;
  
  // Generate FAQ section
  const faqItems = [];
  faqItems.push({
    q: `What is ${name}?`,
    a: description.substring(0, 300) || `${name} is a ${category.replace(/_/g, ' ')} documented in the ${site.nameZh}.`
  });
  
  // Add specific FAQs based on entity data
  if (entity.manufacturer || entity.company || entity.developer) {
    faqItems.push({
      q: `Who makes ${name}?`,
      a: `${name} is made by ${entity.manufacturer || entity.company || entity.developer}.`
    });
  }
  if (entity.features || entity.key_features) {
    const feats = entity.features || entity.key_features;
    if (Array.isArray(feats) && feats.length > 0) {
      faqItems.push({
        q: `What are the key features of ${name}?`,
        a: `Key features include: ${feats.slice(0, 5).join(', ')}.`
      });
    }
  }
  if (entity.pricing || entity.pricing_input) {
    faqItems.push({
      q: `How much does ${name} cost?`,
      a: `Pricing: ${entity.pricing || entity.pricing_input || 'See official documentation for current pricing.'}`
    });
  }
  
  // Build FAQ Schema.org
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };
  
  // Add FAQ schema to existing schemas
  const faqScript = `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>\n`;
  
  // Add TL;DR section after entity-header
  const tldrHtml = `
<div class="tldr" style="background:#f0fdf4;border-left:4px solid #22c55e;padding:1rem 1.5rem;margin:1.5rem 2rem;border-radius:0 8px 8px 0">
  <strong>TL;DR:</strong> ${tldr}
</div>`;
  
  // Add FAQ section before footer
  const faqHtml = `
<div class="faq-section" style="padding:1.5rem 2rem;border-top:1px solid #e2e8f0">
  <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:1rem;color:#0f172a">Frequently Asked Questions</h3>
  ${faqItems.map(f => `
  <div class="faq-item" style="margin-bottom:1rem">
    <h4 style="font-size:1rem;font-weight:600;color:#334155">${f.q}</h4>
    <p style="color:#475569;font-size:.9rem;margin-top:.25rem">${f.a}</p>
  </div>`).join('\n  ')}
</div>`;
  
  // Add last updated date
  const lastUpdated = new Date().toISOString().split('T')[0];
  const dateHtml = `<meta itemprop="dateModified" content="${lastUpdated}">`;
  
  // Insert TL;DR after entity-header
  if (html.includes('class="entity-desc"')) {
    html = html.replace('<div class="entity-desc"', tldrHtml + '\n<div class="entity-desc"');
  }
  
  // Insert FAQ before footer
  if (html.includes('class="footer"')) {
    html = html.replace('<div class="footer"', faqHtml + '\n<div class="footer"');
  }
  
  // Insert FAQ schema after last schema script
  html = html.replace('</head>', faqScript + dateHtml + '\n</head>');
  
  return html;
}

// Process all sites
let totalUpdated = 0;

for (const site of SITES) {
  const websiteDir = path.join(BASE, site.dir, 'website');
  const entityDir = path.join(websiteDir, 'entity');
  const kbDir = path.join(BASE, site.dir, 'knowledge-base/entities');
  
  if (!fs.existsSync(entityDir) || !fs.existsSync(kbDir)) continue;
  
  // Load all entities
  const entities = {};
  for (const f of fs.readdirSync(kbDir).filter(f => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(kbDir, f), 'utf8'));
      const items = Array.isArray(data) ? data : (data.entities || data.data || data.items || data.records || []);
      entities[f.replace('.json', '')] = items;
    } catch (e) {}
  }
  
  let siteUpdated = 0;
  
  // Update each entity page
  for (const f of fs.readdirSync(entityDir).filter(f => f.endsWith('.html'))) {
    const filePath = path.join(entityDir, f);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has GEO
    if (html.includes('class="tldr"')) continue;
    
    // Find matching entity
    const entityId = f.replace('.html', '').replace(/-/g, '-');
    let matchedEntity = null;
    let matchedCat = null;
    
    for (const [cat, items] of Object.entries(entities)) {
      for (const item of items) {
        if (item.id) {
          const slug = item.id.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
          if (slug === f.replace('.html', '')) {
            matchedEntity = item;
            matchedCat = cat;
            break;
          }
        }
      }
      if (matchedEntity) break;
    }
    
    if (matchedEntity) {
      html = addGEOToEntityPage(html, site, matchedEntity, matchedCat);
      fs.writeFileSync(filePath, html);
      siteUpdated++;
    }
  }
  
  // Update index.html with GEO enhancements
  const indexPath = path.join(websiteDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    if (!indexHtml.includes('class="tldr"')) {
      // Add site-level TL;DR and FAQ
      const siteTldr = `
<div class="tldr" style="background:#f0fdf4;border-left:4px solid #22c55e;padding:1rem 1.5rem;margin:1rem auto;max-width:900px;border-radius:0 8px 8px 0">
  <strong>TL;DR:</strong> ${site.tagline}. Source: ${site.nameZh} (${site.domain}), updated ${new Date().toISOString().split('T')[0]}.
</div>`;
      indexHtml = indexHtml.replace('</header>', siteTldr + '\n</header>');
      fs.writeFileSync(indexPath, indexHtml);
      siteUpdated++;
    }
  }
  
  totalUpdated += siteUpdated;
  console.log(`✅ ${site.name}: ${siteUpdated} pages GEO-optimized`);
}

console.log(`\n📊 Total: ${totalUpdated} pages with GEO enhancements`);
