/**
 * 搜索引擎提交工具
 * - IndexNow: 自动提交到Bing/Yandex
 * - 百度: 需要token，预留接口
 */
const https = require('https');

const SITE = 'genetech.tools';
const INDEXNOW_KEY = '57ad357901185fe04aede5441e7883d7';

function submitIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      host: SITE,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE}/${INDEXNOW_KEY}.txt`,
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
        console.log(`IndexNow: ${res.statusCode} - ${urls.length} URLs submitted`);
        resolve(res.statusCode);
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Run
const urls = process.argv.slice(2);
if (urls.length === 0) {
  urls.push(`https://${SITE}/`);
}
submitIndexNow(urls).catch(console.error);
