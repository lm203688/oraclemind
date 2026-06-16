const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Only intercept JSON API responses (not JS files)
  page.on('response', async (res) => {
    const url = res.url();
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('application/json')) {
      try {
        const data = await res.text().catch(() => '');
        console.log('JSON_API:', url.substring(0, 150));
        console.log('RESP:', data.substring(0, 500));
        console.log('===');
      } catch(e) {}
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(10000);
  
  await browser.close();
})();
