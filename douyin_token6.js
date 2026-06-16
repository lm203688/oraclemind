const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept ALL requests/responses related to login
  page.on('request', req => {
    if (req.url().includes('passport')) {
      console.log('REQ:', req.method(), req.url().substring(0, 200));
    }
  });
  
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('passport')) {
      try {
        const ct = res.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const data = await res.json().catch(() => null);
          if (data) {
            console.log('PASSPORT_RESP:', url.substring(0, 150));
            console.log('DATA:', JSON.stringify(data).substring(0, 800));
            console.log('---');
          }
        }
      } catch(e) {}
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(8000);
  
  await browser.close();
})();
