const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept ALL XHR responses
  page.on('response', async (res) => {
    const url = res.url();
    try {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json')) {
        const data = await res.text().catch(() => '');
        // Log everything that has "token" (not msToken) or "qr" or "code"
        const hasToken = /[^m]token/i.test(data) || /qrcode/i.test(data) || /scan_token/i.test(data);
        if (hasToken && data.length < 3000) {
          console.log('API:', url.substring(0, 120));
          console.log('DATA:', data.substring(0, 800));
          console.log('---');
        }
      }
    } catch(e) {}
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(10000);
  
  // Try to directly call the passport API to get QR code
  console.log('\n=== Direct API call ===');
  const qrResult = await page.evaluate(async () => {
    try {
      const resp = await fetch('/passport/web/get_qrcode/?aid=2906&app_id=2906&device_id=&fp=&token=', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await resp.json();
      return JSON.stringify(data).substring(0, 1000);
    } catch(e) {
      return 'Error: ' + e.message;
    }
  });
  console.log('QR API result:', qrResult);
  
  await browser.close();
})();
