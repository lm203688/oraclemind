#!/usr/bin/env node
/**
 * 从knowledge-base/entities/重建网站data.js和API文件
 * 然后部署到Cloudflare
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = '/home/z/my-project';
const CONFIG_PATH = path.join(__dirname, '..', 'agent-layer', 'site-config.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadEntities(siteDir) {
  const entitiesDir = path.join(PROJECT_ROOT, siteDir, 'knowledge-base', 'entities');
  if (!fs.existsSync(entitiesDir)) return {};
  
  const entities = {};
  const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const name = file.replace('.json', '');
    try {
      entities[name] = JSON.parse(fs.readFileSync(path.join(entitiesDir, file), 'utf-8'));
    } catch (e) {
      console.error(`  Error loading ${file}:`, e.message);
    }
  }
  
  return entities;
}

function rebuildDataJs(siteDir, site, entities) {
  const websiteDir = path.join(PROJECT_ROOT, siteDir, 'website');
  if (!fs.existsSync(websiteDir)) {
    console.error(`  No website dir for ${siteDir}`);
    return false;
  }
  
  // Build stats
  const stats = {};
  for (const [name, data] of Object.entries(entities)) {
    if (Array.isArray(data)) {
      stats[name] = data.length;
    }
  }
  
  // Build DB object
  const db = {
    updated: new Date().toISOString(),
    stats,
    ...entities
  };
  
  // Write data.js
  const dataJsContent = `const DB = ${JSON.stringify(db, null, 2)};\n`;
  fs.writeFileSync(path.join(websiteDir, 'data.js'), dataJsContent);
  
  // Write API files
  const apiDir = path.join(websiteDir, 'api');
  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
  
  // data.json
  fs.writeFileSync(path.join(apiDir, 'data.json'), JSON.stringify({
    meta: {
      name: site.name,
      name_zh: site.description_cn,
      domain: site.url.replace('https://', ''),
      description: site.description,
      updated: db.updated,
      stats
    },
    data: entities
  }, null, 2));
  
  // entities.json (flat list)
  const allEntities = [];
  for (const [type, items] of Object.entries(entities)) {
    if (Array.isArray(items)) {
      for (const item of items) {
        allEntities.push({ ...item, _type: type });
      }
    }
  }
  fs.writeFileSync(path.join(apiDir, 'entities.json'), JSON.stringify({
    meta: { total: allEntities.length, updated: db.updated },
    entities: allEntities
  }, null, 2));
  
  // Per-entity JSON files
  for (const [name, data] of Object.entries(entities)) {
    if (Array.isArray(data)) {
      fs.writeFileSync(path.join(apiDir, `${name}.json`), JSON.stringify({
        count: data.length,
        updated: db.updated,
        data
      }, null, 2));
    }
  }
  
  // Update llms.txt
  const entityList = Object.entries(stats).map(([k, v]) => `- ${k}: ${v}`).join('\n');
  const llmsTxt = `# ${site.name} - ${site.description_cn}\n\n> ${site.description}\n\n## API Endpoints (JSON)\n\n- \`GET /api/data.json\` - Complete structured data\n- \`GET /api/entities.json\` - All entities flat list\n- \`GET /api/openapi.json\` - OpenAPI 3.1 specification\n${Object.keys(entities).map(e => `- \`GET /api/${e}.json\` - ${e} data`).join('\n')}\n\n## Stats\n\n- Total entities: ${allEntities.length}\n${entityList}\n\n## Cross-references\n\n- \`GET /api/cross-refs.json\` - Links to related knowledge bases\n\n## Agent Discovery\n\n- \`GET /.well-known/agent.json\` - Machine-readable API description\n- \`GET /.well-known/ai-plugin.json\` - ChatGPT plugin manifest\n- \`GET /llms.txt\` - This file\n- \`GET /llms-full.txt\` - Complete data in text format\n`;
  fs.writeFileSync(path.join(websiteDir, 'llms.txt'), llmsTxt);
  
  // Update llms-full.txt
  let fullTxt = `# ${site.name} - ${site.description_cn}\n\n${site.description}\n\n`;
  for (const [name, items] of Object.entries(entities)) {
    if (!Array.isArray(items)) continue;
    fullTxt += `## ${name}\n\n`;
    for (const item of items) {
      fullTxt += `### ${item.id || item.name}\n\n`;
      for (const [key, val] of Object.entries(item)) {
        if (key === 'id') continue;
        fullTxt += `- ${key}: ${val}\n`;
      }
      fullTxt += '\n';
    }
  }
  fs.writeFileSync(path.join(websiteDir, 'llms-full.txt'), fullTxt);
  
  return true;
}

async function main() {
  const config = loadConfig();
  const targetSite = process.argv[2];
  
  let sites = config.sites;
  if (targetSite) {
    sites = sites.filter(s => s.dir === targetSite);
  }
  
  console.log(`🔧 Rebuilding ${sites.length} site(s)...\n`);
  
  for (const site of sites) {
    const entities = loadEntities(site.dir);
    const totalEntities = Object.values(entities).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
    
    if (totalEntities === 0) {
      console.log(`⏭️  ${site.name}: no entity data, skipping`);
      continue;
    }
    
    console.log(`🔧 ${site.name}: ${totalEntities} entities across ${Object.keys(entities).length} types`);
    const success = rebuildDataJs(site.dir, site, entities);
    if (success) {
      console.log(`  ✅ data.js + API files rebuilt`);
    }
  }
  
  console.log('\n✅ Rebuild complete!');
  console.log('\nRun deploy to push changes to Cloudflare.');
}

main().catch(console.error);
