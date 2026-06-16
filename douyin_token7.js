const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept ALL XHR/fetch responses
  page.on('response', async (res) => {
    const url = res.url();
    try {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json') && (url.includes('creator.douyin.com') || url.includes('sso'))) {
        const data = await res.text().catch(() => '');
        if (data.includes('token') && !data.includes('msToken')) {
          console.log('TOKEN_API:', url.substring(0, 150));
          console.log('DATA:', data.substring(0, 600));
          console.log('===');
        }
      }
    } catch(e) {}
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(8000);
  
  // Try to find the QR token from the page JS
  const result = await page.evaluate(() => {
    // Search for token in all script tags and inline scripts
    const scripts = document.querySelectorAll('script');
    let found = [];
    scripts.forEach(s => {
      const text = s.textContent || '';
      if (text.includes('qrcode') || text.includes('scan_token') || text.includes('connect_token')) {
        found.push(text.substring(0, 300));
      }
    });
    
    // Also check localStorage and sessionStorage
    const ls = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes('token') || key.includes('qr') || key.includes('scan') || key.includes('login')) {
        ls[key] = localStorage.getItem(key).substring(0, 200);
      }
    }
    const ss = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.includes('token') || key.includes('qr') || key.includes('scan') || key.includes('login')) {
        ss[key] = sessionStorage.getItem(key).substring(0, 200);
      }
    }
    
    return { scripts: found, localStorage: ls, sessionStorage: ss };
  });
  console.log('Page data:', JSON.stringify(result, null, 2));
  
  await browser.close();
})();
