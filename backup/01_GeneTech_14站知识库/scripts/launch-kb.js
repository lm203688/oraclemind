/**
 * 新知识库一键启动器
 * - 创建项目结构
 * - 初始化知识库骨架
 * - 生成网站模板
 * - 部署到Cloudflare Pages
 * - 绑定子域名
 * 
 * 用法: node launch-kb.js <project-name> <niche-keyword> <subdomain>
 * 例: node launch-kb.js robot-parts "robot parts protocol" robot
 */
const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';
const PROJECT = process.argv[2];
const NICHE = process.argv[3] || PROJECT;
const SUBDOMAIN = process.argv[4] || PROJECT.replace(/[^a-z0-9]/g, '');

if (!PROJECT) {
  console.log('Usage: node launch-kb.js <project-name> <niche-keyword> <subdomain>');
  process.exit(1);
}

const PROJECT_PATH = path.join(BASE, PROJECT);
const DOMAIN = `${SUBDOMAIN}.genetech.tools`;

console.log(`🚀 Launching: ${PROJECT} → ${DOMAIN}`);
console.log(`   Niche: ${NICHE}`);

// 1. Create project structure
const dirs = [
  'config', 'scripts/collect', 'scripts/validate', 'scripts/audit', 'scripts/deploy',
  'knowledge-base/entities', 'knowledge-base/relations', 'knowledge-base/controversies',
  'knowledge-base/raw', 'knowledge-base/metadata', 'knowledge-base/audit/daily_reports',
  'knowledge-base/audit/weekly_reports', 'knowledge-base/changelog', 'knowledge-base/sources',
  'website'
];

dirs.forEach(d => {
  const fullPath = path.join(PROJECT_PATH, d);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});
console.log('✅ Project structure created');

// 2. Create config files
fs.writeFileSync(path.join(PROJECT_PATH, 'config/sources.json'), JSON.stringify({
  pubmed: { enabled: true, search_terms: [NICHE], max_results: 100, rate_limit_ms: 500 },
  news: { enabled: true, search_terms: [NICHE + ' news', NICHE + ' latest'], rate_limit_ms: 2000 }
}, null, 2));

fs.writeFileSync(path.join(PROJECT_PATH, 'config/keywords.json'), JSON.stringify({
  search_terms: [NICHE],
  categories: []
}, null, 2));

// 3. Initialize knowledge base
const initFiles = {
  'knowledge-base/entities/main.json': { version: '1.0.0', last_updated: new Date().toISOString(), description: `${NICHE}实体库`, entities: [] },
  'knowledge-base/relations/relations.json': { version: '1.0.0', last_updated: new Date().toISOString(), description: '关系库', relations: [] },
  'knowledge-base/controversies/controversies.json': { version: '1.0.0', controversies: [] },
  'knowledge-base/metadata/collection_log.json': { runs: [], last_updated: new Date().toISOString() },
  'knowledge-base/metadata/confidence_scores.json': { scores: {}, last_updated: new Date().toISOString() },
  'knowledge-base/changelog/changelog.json': { entries: [] },
  'knowledge-base/audit/audit_queue.json': { queue: [] },
  'knowledge-base/sources/sources.json': { sources: ['PubMed', 'News'], last_updated: new Date().toISOString() }
};

for (const [file, data] of Object.entries(initFiles)) {
  fs.writeFileSync(path.join(PROJECT_PATH, file), JSON.stringify(data, null, 2));
}
console.log('✅ Knowledge base initialized');

// 4. Create website data.js
fs.writeFileSync(path.join(PROJECT_PATH, 'website/data.js'), `const DB = {updated:"${new Date().toISOString()}",stats:{entities:0,relations:0},entities:[],relations:[]};`);

// 5. Create minimal website
const siteTitle = `${PROJECT} - Knowledge Engine`;
fs.writeFileSync(path.join(PROJECT_PATH, 'website/index.html'), `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${siteTitle}</title><meta name="description" content="${NICHE} knowledge engine">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔬</text></svg>">
<style>:root{--bg:#0a0e17;--bg2:#111827;--text:#e2e8f0;--accent:#06b6d4}*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:var(--bg);color:var(--text);display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}h1{font-size:2em;margin-bottom:16px}p{color:#94a3b8;max-width:500px}</style>
</head><body><div><h1>🔬 ${siteTitle}</h1><p>Coming soon — ${NICHE} structured knowledge base</p><p style="margin-top:24px"><a href="https://genetech.tools" style="color:var(--accent)">← Back to GeneTech Tools</a></p></div></body></html>`);

fs.writeFileSync(path.join(PROJECT_PATH, 'website/robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://${DOMAIN}/sitemap.xml`);
fs.writeFileSync(path.join(PROJECT_PATH, 'website/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${DOMAIN}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url></urlset>`);

console.log('✅ Website template created');
console.log(`\n📋 Next steps:`);
console.log(`   1. cd ${PROJECT_PATH} && node scripts/pipeline.js full  # Initial data collection`);
console.log(`   2. npx wrangler pages project create ${PROJECT.replace(/-/g,'')} --production-branch main`);
console.log(`   3. cd website && npx wrangler pages deploy . --project-name=${PROJECT.replace(/-/g,'')}`);
console.log(`   4. Add CNAME: ${DOMAIN} → ${PROJECT.replace(/-/g,'')}.pages.dev`);
console.log(`   5. Bind custom domain in Pages settings`);
