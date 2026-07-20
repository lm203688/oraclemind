/**
 * RoboParts 搜索引擎自动Ping脚本
 * 
 * 每次新内容发布后调用，通知搜索引擎重新抓取
 * 支持 Google 和百度
 * 
 * 用法：node scripts/ping-search-engines.js
 */

const https = require('https');
const http = require('http');

const SITEMAPS = [
  'https://roboparts.cc/sitemap.xml',
  'https://roboparts.cc/seo/sitemap-seo.xml',
  'https://roboparts.cc/blog/sitemap.xml',
];

// ===== Google Ping =====
async function pingGoogle(sitemapUrl) {
  const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ engine: 'Google', url: sitemapUrl, status: res.statusCode, ok: res.statusCode === 200 });
      });
    }).on('error', (e) => {
      resolve({ engine: 'Google', url: sitemapUrl, status: 'error', ok: false, error: e.message });
    });
  });
}

// ===== 百度 Ping =====
async function pingBaidu(siteUrl, token) {
  if (!token) {
    return { engine: 'Baidu', url: siteUrl, status: 'skipped', ok: false, error: '未配置百度token' };
  }
  
  const postData = siteUrl;
  return new Promise((resolve) => {
    const url = new URL(`http://data.zz.baidu.com/urls?site=${encodeURIComponent(siteUrl)}&token=${token}`);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ engine: 'Baidu', url: siteUrl, status: res.statusCode, ok: result.success > 0, remaining: result.remain });
        } catch {
          resolve({ engine: 'Baidu', url: siteUrl, status: res.statusCode, ok: false, error: data });
        }
      });
    });
    req.on('error', (e) => {
      resolve({ engine: 'Baidu', url: siteUrl, status: 'error', ok: false, error: e.message });
    });
    req.write(postData);
    req.end();
  });
}

// ===== Bing/IndexNow =====
async function pingIndexNow() {
  const key = 'b7a8c9d0e1f2a3b4c5d6e7f8a9b0c1d2'; // 生成一个固定的 IndexNow key
  const urls = [
    'https://roboparts.cc/',
    'https://roboparts.cc/blog/',
    'https://roboparts.cc/#compat',
    'https://roboparts.cc/#stl',
  ];
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      host: 'roboparts.cc',
      key: key,
      keyLocation: `https://roboparts.cc/${key}.txt`,
      urlList: urls
    });
    
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/IndexNow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      resolve({ engine: 'IndexNow(Bing/Yandex/Seznam)', status: res.statusCode, ok: res.statusCode === 200 || res.statusCode === 202 });
    });
    req.on('error', (e) => {
      resolve({ engine: 'IndexNow', status: 'error', ok: false, error: e.message });
    });
    req.write(postData);
    req.end();
  });
}

// ===== 主流程 =====
async function main() {
  const BAIDU_TOKEN = process.env.BAIDU_ZZ_TOKEN || '';
  
  console.log('🔔 RoboParts 搜索引擎Ping工具');
  console.log('================================\n');
  
  const results = [];
  const startTime = Date.now();
  
  // Google Ping (所有sitemap)
  for (const sitemap of SITEMAPS) {
    console.log(`📡 Pinging Google: ${sitemap}...`);
    const result = await pingGoogle(sitemap);
    results.push(result);
    console.log(`   ${result.ok ? '✅' : '❌'} ${result.status}`);
  }
  
  // 百度 Ping (站点URL)
  if (BAIDU_TOKEN) {
    console.log(`\n📡 Pinging Baidu...`);
    const result = await pingBaidu('https://roboparts.cc', BAIDU_TOKEN);
    results.push(result);
    console.log(`   ${result.ok ? '✅' : '❌'} ${result.status} (剩余配额: ${result.remaining || 'N/A'})`);
  } else {
    console.log(`\n⚠️ 跳过百度Ping（未配置 BAIDU_ZZ_TOKEN）`);
  }
  
  // IndexNow (Bing/Yandex/Seznam)
  console.log(`\n📡 Pinging IndexNow (Bing/Yandex)...`);
  const indexNowResult = await pingIndexNow();
  results.push(indexNowResult);
  console.log(`   ${indexNowResult.ok ? '✅' : '❌'} ${indexNowResult.status}`);
  
  // 汇总
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const okCount = results.filter(r => r.ok).length;
  
  console.log('\n================================');
  console.log(`✅ Ping完成: ${okCount}/${results.length} 成功 (${duration}s)`);
  console.log(`📋 详情:`);
  results.forEach(r => {
    console.log(`   ${r.ok ? '✅' : '❌'} [${r.engine}] ${r.url || ''} → ${r.status}${r.error ? ' (' + r.error + ')' : ''}`);
  });
  
  return results;
}

main().catch(console.error);
