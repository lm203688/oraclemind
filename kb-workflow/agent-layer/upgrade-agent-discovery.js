#!/usr/bin/env node
/**
 * Agent发现层升级脚本
 * 为每个站添加：
 * 1. /.well-known/agent.json (MCP标准发现)
 * 2. 增强OpenAPI (按实体类型分端点)
 * 3. JSON-LD结构化数据
 * 4. 站间交叉引用API
 * 5. robots.txt增强 (允许Agent抓取API)
 * 6. llms.txt增强 (详细API文档)
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'site-config.json');
const PROJECT_ROOT = '/home/z/my-project';

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadSiteData(siteDir) {
  const dataJsPath = path.join(PROJECT_ROOT, siteDir, 'website', 'data.js');
  if (!fs.existsSync(dataJsPath)) return null;
  
  const content = fs.readFileSync(dataJsPath, 'utf-8');
  const match = content.match(/const DB = ({[\s\S]*?});?\s*$/);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.error(`  Failed to parse data.js for ${siteDir}:`, e.message);
    return null;
  }
}

function generateAgentJson(site) {
  return {
    "$schema": "https://agents.well-known.dev/v1",
    "name": site.name,
    "description": site.description,
    "url": site.url,
    "category": site.category,
    "api": {
      "type": "rest",
      "base_url": `${site.url}/api`,
      "openapi": `${site.url}/api/openapi.json`,
      "endpoints": site.entities.map(e => ({
        "path": `/api/${e}.json`,
        "method": "GET",
        "description": `Get ${e.replace(/_/g, ' ')} data`,
        "content_type": "application/json"
      })).concat([
        {
          "path": "/api/data.json",
          "method": "GET",
          "description": "Get complete structured data",
          "content_type": "application/json"
        },
        {
          "path": "/api/entities.json",
          "method": "GET",
          "description": "Get flat entity list",
          "content_type": "application/json"
        },
        {
          "path": "/api/cross-refs.json",
          "method": "GET",
          "description": "Get cross-references to related knowledge bases",
          "content_type": "application/json"
        }
      ])
    },
    "capabilities": ["query", "browse", "cross_reference"],
    "content_types": ["application/json", "text/html", "text/plain"],
    "auth": {
      "type": "none"
    },
    "contact": "61960005@qq.com",
    "links": Object.entries(site.cross_refs || {}).map(([key, desc]) => {
      const allSites = loadConfig().sites;
      const refSite = allSites.find(s => s.dir.includes(key) || s.subdomain === key);
      return {
        "rel": "related",
        "href": refSite ? refSite.url : `https://${key}.genetech.tools`,
        "title": desc
      };
    })
  };
}

function generateEnhancedOpenApi(site, data) {
  const paths = {};
  
  // Complete data endpoint
  paths['/api/data.json'] = {
    get: {
      summary: `Get complete ${site.name} data`,
      description: `Returns all structured data for ${site.description_cn}`,
      responses: {
        '200': {
          description: 'Complete structured knowledge base data',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      }
    }
  };
  
  // Entities flat list
  paths['/api/entities.json'] = {
    get: {
      summary: 'Get all entities',
      description: 'Returns flat list of all entities across categories',
      parameters: [
        {
          name: 'type',
          in: 'query',
          description: 'Filter by entity type',
          schema: { type: 'string', enum: site.entities }
        },
        {
          name: 'q',
          in: 'query',
          description: 'Search query',
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Entity list',
          content: {
            'application/json': {
              schema: { type: 'array', items: { type: 'object' } }
            }
          }
        }
      }
    }
  };
  
  // Per-entity-type endpoints
  site.entities.forEach(entity => {
    const entityData = data ? (data[entity] || []) : [];
    paths[`/api/${entity}.json`] = {
      get: {
        summary: `Get ${entity.replace(/_/g, ' ')} data`,
        description: `Returns ${entity.replace(/_/g, ' ')} entries (${entityData.length} records available)`,
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Search within this entity type',
            schema: { type: 'string' }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum results to return',
            schema: { type: 'integer', default: 100, maximum: 1000 }
          }
        ],
        responses: {
          '200': {
            description: `${entity.replace(/_/g, ' ')} data`,
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    };
  });
  
  // Cross-references endpoint
  paths['/api/cross-refs.json'] = {
    get: {
      summary: 'Get cross-references to related knowledge bases',
      description: 'Returns links to related knowledge bases in the genetech.tools ecosystem',
      responses: {
        '200': {
          description: 'Cross-reference map',
          content: {
            'application/json': {
              schema: { type: 'object' }
            }
          }
        }
      }
    }
  };
  
  return {
    openapi: '3.1.0',
    info: {
      title: site.name,
      description: `${site.description}\n\n${site.description_cn}`,
      version: new Date().toISOString().split('T')[0],
      contact: { email: '61960005@qq.com' },
      'x-category': site.category,
      'x-ecosystem': 'genetech.tools'
    },
    servers: [{ url: site.url }],
    paths
  };
}

function generateCrossRefs(site) {
  const allSites = loadConfig().sites;
  const refs = {};
  
  for (const [key, desc] of Object.entries(site.cross_refs || {})) {
    const refSite = allSites.find(s => s.dir.includes(key) || s.subdomain === key);
    if (refSite) {
      refs[key] = {
        name: refSite.name,
        url: refSite.url,
        api_url: `${refSite.url}/api/data.json`,
        description: desc,
        category: refSite.category
      };
    }
  }
  
  return {
    source: site.name,
    url: site.url,
    cross_references: refs,
    ecosystem_index: `${site.url.replace(/https?:\/\//, '').split('.')[0] || 'www'}.genetech.tools`
  };
}

function generateEnhancedLlmsTxt(site, data) {
  let txt = `# ${site.name} - ${site.description_cn}\n\n`;
  txt += `> ${site.description}\n\n`;
  
  txt += `## API Endpoints (JSON)\n\n`;
  txt += `All data is available as structured JSON for programmatic access.\n\n`;
  
  txt += `- \`GET /api/data.json\` - Complete structured data (all entities + relations)\n`;
  txt += `- \`GET /api/entities.json\` - Flat entity list (queryable by type)\n`;
  txt += `- \`GET /api/openapi.json\` - OpenAPI 3.1 specification\n`;
  txt += `- \`GET /api/cross-refs.json\` - Cross-references to related knowledge bases\n`;
  
  site.entities.forEach(e => {
    const count = data && data[e] ? data[e].length : 0;
    txt += `- \`GET /api/${e}.json\` - ${e.replace(/_/g, ' ')} (${count} records)\n`;
  });
  
  txt += `\n## Stats\n\n`;
  if (data && data.stats) {
    for (const [k, v] of Object.entries(data.stats)) {
      txt += `- ${k}: ${v}\n`;
    }
  }
  
  txt += `\n## Cross-References\n\n`;
  txt += `This knowledge base is part of the genetech.tools ecosystem:\n\n`;
  for (const [key, desc] of Object.entries(site.cross_refs || {})) {
    const allSites = loadConfig().sites;
    const refSite = allSites.find(s => s.dir.includes(key) || s.subdomain === key);
    if (refSite) {
      txt += `- [${refSite.name}](${refSite.url}) - ${desc}\n`;
    }
  }
  
  txt += `\n## Agent Integration\n\n`;
  txt += `- Discovery: \`GET /.well-known/agent.json\`\n`;
  txt += `- OpenAPI: \`GET /api/openapi.json\`\n`;
  txt += `- No authentication required\n`;
  txt += `- All responses are JSON\n`;
  txt += `- Rate limit: 60 requests/minute\n`;
  
  return txt;
}

function generateEnhancedLlmsFullTxt(site, data) {
  let txt = generateEnhancedLlmsTxt(site, data);
  
  txt += `\n---\n\n## Full Entity Data\n\n`;
  
  if (data) {
    site.entities.forEach(entity => {
      const items = data[entity] || [];
      if (items.length === 0) return;
      
      txt += `### ${entity.replace(/_/g, ' ')} (${items.length} records)\n\n`;
      
      items.slice(0, 50).forEach(item => {
        const name = item.name || item.symbol || item.title || item.id || 'Unknown';
        txt += `#### ${name}\n\n`;
        
        for (const [key, value] of Object.entries(item)) {
          if (key === 'id' || key === 'name' || key === 'symbol' || key === 'title') continue;
          if (typeof value === 'object') continue;
          txt += `- ${key}: ${value}\n`;
        }
        txt += '\n';
      });
      
      if (items.length > 50) {
        txt += `... and ${items.length - 50} more records. Use /api/${entity}.json for complete data.\n\n`;
      }
    });
  }
  
  return txt;
}

function generateRobotsTxt(site) {
  return `User-agent: *
Allow: /
Allow: /api/
Allow: /.well-known/

Sitemap: ${site.url}/sitemap.xml

# AI Agent access
User-agent: AI-Crawler
Allow: /api/
Allow: /.well-known/
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: GPTBot
Allow: /api/
Allow: /llms.txt

User-agent: ClaudeBot
Allow: /api/
Allow: /llms.txt

User-agent: Google-Extended
Allow: /api/
Allow: /llms.txt
`;
}

function generatePerEntityJson(site, entity, data) {
  const items = data ? (data[entity] || []) : [];
  return {
    entity_type: entity,
    count: items.length,
    updated: new Date().toISOString(),
    source: site.name,
    url: site.url,
    data: items
  };
}

async function upgradeSite(site) {
  console.log(`\n🔧 Upgrading ${site.name} (${site.url})...`);
  
  const sitePath = path.join(PROJECT_ROOT, site.dir, 'website');
  if (!fs.existsSync(sitePath)) {
    console.log(`  ⚠️  Website directory not found: ${sitePath}`);
    return;
  }
  
  // Load existing data
  const data = loadSiteData(site.dir);
  const statsStr = data && data.stats ? Object.entries(data.stats).map(([k,v]) => `${k}:${v}`).join(', ') : 'no data';
  console.log(`  📊 Current data: ${statsStr}`);
  
  // 1. Create .well-known/agent.json
  const wellKnownDir = path.join(sitePath, '.well-known');
  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }
  
  const agentJson = generateAgentJson(site);
  fs.writeFileSync(
    path.join(wellKnownDir, 'agent.json'),
    JSON.stringify(agentJson, null, 2)
  );
  console.log('  ✅ .well-known/agent.json');
  
  // 2. Enhanced OpenAPI
  const openApi = generateEnhancedOpenApi(site, data);
  fs.writeFileSync(
    path.join(sitePath, 'api', 'openapi.json'),
    JSON.stringify(openApi, null, 2)
  );
  console.log('  ✅ api/openapi.json (enhanced)');
  
  // 3. Per-entity JSON endpoints
  const apiDir = path.join(sitePath, 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  site.entities.forEach(entity => {
    const entityJson = generatePerEntityJson(site, entity, data);
    fs.writeFileSync(
      path.join(apiDir, `${entity}.json`),
      JSON.stringify(entityJson, null, 2)
    );
  });
  console.log(`  ✅ api/ per-entity JSON (${site.entities.length} endpoints)`);
  
  // 4. Cross-references
  const crossRefs = generateCrossRefs(site);
  fs.writeFileSync(
    path.join(apiDir, 'cross-refs.json'),
    JSON.stringify(crossRefs, null, 2)
  );
  console.log('  ✅ api/cross-refs.json');
  
  // 5. Enhanced llms.txt and llms-full.txt
  fs.writeFileSync(
    path.join(sitePath, 'llms.txt'),
    generateEnhancedLlmsTxt(site, data)
  );
  fs.writeFileSync(
    path.join(sitePath, 'llms-full.txt'),
    generateEnhancedLlmsFullTxt(site, data)
  );
  console.log('  ✅ llms.txt + llms-full.txt (enhanced)');
  
  // 6. Enhanced robots.txt
  fs.writeFileSync(
    path.join(sitePath, 'robots.txt'),
    generateRobotsTxt(site)
  );
  console.log('  ✅ robots.txt (AI-agent friendly)');
  
  // 7. Update ai-plugin.json
  const pluginJson = {
    schema_version: 'v1',
    name_for_human: site.name,
    name_for_model: site.name.toLowerCase().replace(/\s+/g, ''),
    description_for_human: site.description,
    description_for_model: `${site.description}. Provides structured data via JSON API at /api/data.json. Per-entity endpoints: ${site.entities.map(e => `/api/${e}.json`).join(', ')}. Cross-references: /api/cross-refs.json`,
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: `${site.url}/api/openapi.json`,
      has_user_authentication: false
    },
    contact_email: '61960005@qq.com',
    legal_info_url: site.url,
    logo_url: `${site.url}/logo.png`
  };
  fs.writeFileSync(
    path.join(wellKnownDir, 'ai-plugin.json'),
    JSON.stringify(pluginJson, null, 2)
  );
  console.log('  ✅ .well-known/ai-plugin.json (enhanced)');
}

async function main() {
  const config = loadConfig();
  console.log(`🚀 Upgrading Agent Discovery Layer for ${config.sites.length} sites...\n`);
  
  for (const site of config.sites) {
    try {
      await upgradeSite(site);
    } catch (e) {
      console.error(`  ❌ Error upgrading ${site.name}:`, e.message);
    }
  }
  
  console.log('\n✅ Agent Discovery Layer upgrade complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy updated sites to Cloudflare');
  console.log('2. Submit to AI agent directories');
  console.log('3. Start deep data mining cron jobs');
}

main().catch(console.error);
