const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept ALL responses with interesting data
  page.on('response', async (res) => {
    const url = res.url();
    try {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json') || url.includes('api') || url.includes('passport')) {
        const data = await res.text().catch(() => '');
        if (data.includes('token') || data.includes('qrcode') || data.includes('scan') || data.includes('connect')) {
          console.log('URL:', url.substring(0, 150));
          console.log('DATA:', data.substring(0, 400));
          console.log('===');
        }
      }
    } catch(e) {}
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(10000);
  
  await browser.close();
})();
