/**
 * SEO 自动提交工具
 * - IndexNow: 提交到 Bing/Yandex
 * - 百度: 自动推送（已嵌入网站）
 * - Google: 自然收录+验证标签
 * 
 * 用法: node seo-submit.js [daily|weekly]
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const SITES = [
  { domain: 'genetech.tools', pages: ['/', '/sitemap.xml'] },
  { domain: 'tcm.genetech.tools', pages: ['/'] }
];

const INDEXNOW_KEY = '57ad357901185fe04aede5441e7883d7';

function submitIndexNow(site) {
  return new Promise((resolve) => {
    const urls = site.pages.map(p => `https://${site.domain}${p}`);
    const data = JSON.stringify({
      host: site.domain,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITES[0].domain}/${INDEXNOW_KEY}.txt`,
      urlList: urls
    });
    
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`  IndexNow [${site.domain}]: ${res.statusCode} - ${urls.length} URLs`);
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (e) => { console.log(`  IndexNow [${site.domain}]: Error - ${e.message}`); resolve(0); });
    req.write(data);
    req.end();
  });
}

async function run(mode) {
  console.log(`🔍 SEO Submit [${mode}]`);
  
  // Submit all sites to IndexNow
  for (const site of SITES) {
    await submitIndexNow(site);
  }
  
  if (mode === 'weekly') {
    // Weekly: resubmit sitemap
    console.log('  📋 Sitemaps resubmitted to IndexNow');
  }
  
  console.log('✅ SEO submit complete');
}

const mode = process.argv[2] || 'daily';
run(mode).catch(console.error);
