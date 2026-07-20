#!/usr/bin/env node
/**
 * 深度数据挖掘脚本
 * 使用web搜索+学术搜索采集每个领域的真实数据
 * 输出结构化JSON到各站的knowledge-base/entities/
 */

const fs = require('fs');
const path = require('path');

const NODE_PATH = '/home/z/.bun/install/global/node_modules';
const PROJECT_ROOT = '/home/z/my-project';
const CONFIG_PATH = path.join(__dirname, '..', 'agent-layer', 'site-config.json');

// Dynamic import for z-ai-web-dev-sdk
let ZAI;
async function initSDK() {
  if (ZAI) return ZAI;
  const mod = await import(path.join(NODE_PATH, 'z-ai-web-dev-sdk', 'dist', 'index.js'));
  ZAI = mod.default;
  return ZAI;
}

async function createClient() {
  const SDK = await initSDK();
  return await SDK.create();
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadExistingData(siteDir) {
  const dataJsPath = path.join(PROJECT_ROOT, siteDir, 'website', 'data.js');
  if (!fs.existsSync(dataJsPath)) return {};
  
  const content = fs.readFileSync(dataJsPath, 'utf-8');
  const match = content.match(/const DB = ({[\s\S]*?});?\s*$/);
  if (!match) return {};
  
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return {};
  }
}

function saveEntities(siteDir, entityName, data) {
  const entitiesDir = path.join(PROJECT_ROOT, siteDir, 'knowledge-base', 'entities');
  if (!fs.existsSync(entitiesDir)) {
    fs.mkdirSync(entitiesDir, { recursive: true });
  }
  
  const filePath = path.join(entitiesDir, `${entityName}.json`);
  let existing = [];
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {}
  }
  
  // Merge: update existing by id, add new
  const existingMap = new Map(existing.map(e => [e.id, e]));
  for (const item of data) {
    if (item.id) {
      existingMap.set(item.id, { ...existingMap.get(item.id), ...item });
    } else {
      existing.push(item);
    }
  }
  
  const merged = Array.from(existingMap.values());
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  return merged.length;
}

/**
 * Search web for latest data in a domain
 */
async function searchWeb(client, query, maxResults = 10) {
  try {
    const results = await client.webSearch({
      query: query,
      count: maxResults,
      searchDepth: 'advanced'
    });
    return results || [];
  } catch (e) {
    console.error(`  Web search error for "${query}":`, e.message);
    return [];
  }
}

/**
 * Search academic papers
 */
async function searchAcademic(client, query, maxResults = 10) {
  try {
    const results = await client.webSearch({
      query: `site:pubmed.ncbi.nlm.nih.gov OR site:nature.com OR site:science.org ${query}`,
      count: maxResults,
      searchDepth: 'advanced'
    });
    return results || [];
  } catch (e) {
    console.error(`  Academic search error for "${query}":`, e.message);
    return [];
  }
}

/**
 * Extract structured data from search results using LLM
 */
async function extractEntities(client, searchResults, entityType, domain) {
  if (!searchResults || searchResults.length === 0) return [];
  
  const snippets = searchResults.map((r, i) => 
    `[${i+1}] ${r.title || ''}\n${r.snippet || r.content || ''}`
  ).join('\n\n');
  
  const prompt = `You are a data extraction specialist for a knowledge base about ${domain}.

From the following search results, extract ${entityType} entries as structured JSON.

Rules:
- Extract ONLY factual, verifiable information
- Each entry must have: id (format: "${entityType.toUpperCase()}-xxxx"), name, description, source_url, source_name, confidence (high/medium/low)
- Add domain-specific fields as appropriate
- Do NOT fabricate data - only extract what's explicitly stated
- Return a JSON array

Search results:
${snippets}

Return ONLY the JSON array, no other text:`;

  try {
    const response = await client.chat({
      messages: [{ role: 'user', content: prompt }],
      model: 'glm-4-plus',
      temperature: 0.1
    });
    
    const content = response.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (e) {
    console.error(`  LLM extraction error:`, e.message);
    return [];
  }
}

/**
 * Deep mine a single site
 */
async function deepMineSite(client, site) {
  console.log(`\n🔍 Deep mining: ${site.name} (${site.url})`);
  
  const existingData = loadExistingData(site.dir);
  const existingCount = {};
  for (const entity of site.entities) {
    const items = existingData[entity] || [];
    existingCount[entity] = items.length;
  }
  console.log(`  Current data: ${Object.entries(existingCount).map(([k,v]) => `${k}:${v}`).join(', ')}`);
  
  let totalNew = 0;
  
  for (const query of site.search_queries) {
    console.log(`  📡 Searching: "${query}"`);
    
    // Web search
    const webResults = await searchWeb(client, query, 10);
    console.log(`    Web results: ${webResults.length}`);
    
    // Academic search
    const acadResults = await searchAcademic(client, query, 5);
    console.log(`    Academic results: ${acadResults.length}`);
    
    // Combine results
    const allResults = [...webResults, ...acadResults];
    
    if (allResults.length === 0) {
      console.log(`    No results, skipping`);
      continue;
    }
    
    // Extract entities for each entity type
    for (const entity of site.entities) {
      const extracted = await extractEntities(client, allResults, entity, site.description_cn);
      if (extracted.length > 0) {
        const count = saveEntities(site.dir, entity, extracted);
        console.log(`    ✅ ${entity}: +${extracted.length} new → ${count} total`);
        totalNew += extracted.length;
      }
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`  📊 Total new entries: ${totalNew}`);
  return totalNew;
}

/**
 * Main
 */
async function main() {
  const config = loadConfig();
  const client = await createClient();
  
  console.log(`🚀 Deep Data Mining - ${config.sites.length} sites\n`);
  console.log('Priority: Sites with least data first\n');
  
  // Sort by data volume (ascending)
  const sitesWithData = config.sites.map(site => {
    const data = loadExistingData(site.dir);
    const total = Object.values(data.stats || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
    return { site, total };
  }).sort((a, b) => a.total - b.total);
  
  let grandTotal = 0;
  
  for (const { site, total } of sitesWithData) {
    try {
      const newCount = await deepMineSite(client, site);
      grandTotal += newCount;
    } catch (e) {
      console.error(`  ❌ Error mining ${site.name}:`, e.message);
    }
  }
  
  console.log(`\n🎉 Deep mining complete! Total new entries: ${grandTotal}`);
  console.log('\nNext: Run rebuild-and-deploy.js to update websites with new data');
}

main().catch(console.error);
