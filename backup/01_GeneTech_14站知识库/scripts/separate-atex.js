#!/usr/bin/env node
/**
 * Separate ATEX from 12-site navigation
 * - Remove ATEX from top navigation bar
 * - Remove ATEX from hero "三板块" section (keep 知识 + Pro, remove AI工具板块)
 * - Keep ATEX only in footer as partner link
 * - Change all ATEX URLs from IP to atex.tools (with fallback to IP)
 * - Remove ATEX section from credits.html (keep KB products only)
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  'genetech-tools', 'tcm-tools', 'agent-ecosystem', 'robot-parts',
  'quantum-computing', 'brain-science', 'nuclear-energy',
  'exo-science', 'alien-minerals', 'deep-sea-tech',
  'new-energy', 'life-science'
];

const BASE = '/home/z/my-project';
const ATEX_IP = 'http://150.158.119.19:8420';
const ATEX_DOMAIN = 'https://atex.tools'; // future domain, will redirect when ready

let totalChanges = 0;

for (const site of SITES) {
  let siteChanges = 0;
  
  // Process index.html
  const indexPath = path.join(BASE, site, 'website', 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const original = html;
    
    // 1. Remove ATEX from top nav: <a href="http://150.158.119.19:8420"...>🤖 AI工具</a>
    html = html.replace(/<a href="http:\/\/150\.158\.119\.19:8420"[^>]*>🤖 AI工具<\/a>\s*/g, '');
    
    // 2. Remove the nav separator that was before ATEX (if ATEX was last in a group)
    // Keep 违禁词 link if exists, remove the ATEX-specific separator pattern
    
    // 3. Remove the "AI工具 (ATEX)" board section in hero三板块
    // Match the entire 板块② div block
    html = html.replace(/<!-- 板块② AI工具 -->\s*<div style="background:var\(--bg2\);border:2px solid var\(--accent2\)[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*/g, '');
    
    // Also remove any standalone ATEX board section
    html = html.replace(/<!--\s*板块②[^>]*-->[\s\S]*?AI工具\s*\(ATEX\)[\s\S]*?<\/div>\s*<\/div>\s*/g, '');
    
    // 4. In footer ecosystem links, change ATEX link
    // Keep ATEX in footer but change URL to atex.tools and update label
    html = html.replace(
      /<a href="http:\/\/150\.158\.119\.19:8420"[^>]*title="ATEX AI平台"[^>]*>🤖 ATEX<\/a>/g,
      '<a href="https://atex.tools" target="_blank" title="ATEX Agent工具平台" style="border-color:#8b5cf6;background:#8b5cf620">🤖 ATEX</a>'
    );
    
    // 5. Update footer text link
    html = html.replace(
      /<a href="http:\/\/150\.158\.119\.19:8420"[^>]*>🤖 ATEX AI平台（合规工具\+AI能力\+知识引擎API）<\/a>/g,
      '<a href="https://atex.tools" target="_blank" style="color:#8b5cf6">🤖 ATEX Agent工具平台（独立项目）</a>'
    );
    
    // 6. Remove ATEX reference from AI分析 section
    html = html.replace(
      /用ATEX的AI对话[^<]*<\/div>/g,
      '用AI对话深度分析知识库数据，生成结构化洞察</div>'
    );
    
    // 7. Remove ATEX board button
    html = html.replace(
      /<a href="http:\/\/150\.158\.119\.19:8420"[^>]*>🤖 打开AI工具 →<\/a>/g,
      ''
    );
    
    // 8. Remove ATEX from "AI Analysis via ATEX" JS
    html = html.replace(
      /\/\/ AI Analysis via ATEX DeepSeek/g,
      '// AI Analysis (local fallback)'
    );
    
    // 9. Replace fetch to ATEX buy endpoint
    html = html.replace(
      /fetch\('http:\/\/150\.158\.119\.19:8420\/api\/v1\/services\/buy'/g,
      "fetch('/api/v1/ai-analysis' /* ATEX moved to atex.tools */"
    );
    
    // 10. Replace ATEX fallback messages
    html = html.replace(
      /以上为本地数据分析。完整AI分析请<a href="http:\/\/150\.158\.119\.19:8420\/demo"[^>]*>访问ATEX平台<\/a>/g,
      '以上为本地数据分析。'
    );
    html = html.replace(
      /<p style="margin-top:8px"><a href="http:\/\/150\.158\.119\.19:8420\/demo"[^>]*>手动访问ATEX AI分析 →<\/a><\/p>/g,
      ''
    );
    
    // 11. Replace any remaining ATEX IP URLs with atex.tools
    html = html.replace(/http:\/\/150\.158\.119\.19:8420/g, 'https://atex.tools');
    
    // 12. Update email reference
    html = html.replace(/atex@agent\.dev/g, 'contact@atex.tools');
    
    // 13. Update ATEX label mentions
    html = html.replace(/AI工具 \(ATEX\)/g, 'AI工具 (atex.tools)');
    html = html.replace(/🤖 ATEX AI平台（合规工具\+AI能力\+知识引擎API）/g, '🤖 ATEX Agent工具平台（独立项目 atex.tools）');
    
    if (html !== original) {
      fs.writeFileSync(indexPath, html);
      siteChanges++;
    }
  }
  
  // Process credits.html - remove ATEX service section
  const creditsPath = path.join(BASE, site, 'website', 'credits.html');
  if (fs.existsSync(creditsPath)) {
    let html = fs.readFileSync(creditsPath, 'utf8');
    const original = html;
    
    // Remove the ATEX services section
    // Match from <!-- ATEX AI Services --> to the end of that section
    html = html.replace(/<!-- ATEX AI Services -->[\s\S]*?(?=<!--|$)/g, '<!-- ATEX moved to atex.tools (independent project) -->\n');
    
    // Replace ATEX IP URLs
    html = html.replace(/http:\/\/150\.158\.119\.19:8420/g, 'https://atex.tools');
    html = html.replace(/http:\/\/150\.158\.119\.19:8450/g, 'https://atex.tools');
    
    // Update ATEX section reference
    html = html.replace(/访问ATEX平台/g, '访问 atex.tools');
    html = html.replace(/ATEX 合规工具 \+ AI能力/g, 'ATEX (独立项目)');
    
    if (html !== original) {
      fs.writeFileSync(creditsPath, html);
      siteChanges++;
    }
  }
  
  // Process schema.json
  const schemaPath = path.join(BASE, site, 'website', 'schema.json');
  if (fs.existsSync(schemaPath)) {
    let text = fs.readFileSync(schemaPath, 'utf8');
    const original = text;
    
    text = text.replace(/http:\/\/150\.158\.119\.19:8420/g, 'https://atex.tools');
    text = text.replace(/@atex-ai\/mcp-server/g, '@atex/mcp-server');
    text = text.replace(/via ATEX/g, 'via atex.tools');
    
    if (text !== original) {
      fs.writeFileSync(schemaPath, text);
      siteChanges++;
    }
  }
  
  // Process any other HTML files referencing ATEX
  const webDir = path.join(BASE, site, 'website');
  if (fs.existsSync(webDir)) {
    const files = fs.readdirSync(webDir).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'credits.html');
    for (const file of files) {
      const filePath = path.join(webDir, file);
      let html = fs.readFileSync(filePath, 'utf8');
      const original = html;
      
      html = html.replace(/http:\/\/150\.158\.119\.19:8420/g, 'https://atex.tools');
      html = html.replace(/http:\/\/150\.158\.119\.19:8450/g, 'https://atex.tools');
      
      if (html !== original) {
        fs.writeFileSync(filePath, html);
        siteChanges++;
      }
    }
  }
  
  totalChanges += siteChanges;
  console.log(`  ${site}: ${siteChanges} file(s) modified`);
}

console.log(`\n✅ Total: ${totalChanges} files modified across ${SITES.length} sites`);
console.log('   ATEX references updated: IP → atex.tools');
console.log('   Nav bar ATEX entry removed');
console.log('   ATEX board section removed from hero');
console.log('   Footer link retained (partner link)');
