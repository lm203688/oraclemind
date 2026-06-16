const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept QR code API
  let qrToken = null;
  let qrUrl = null;
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('get_qrcode') || url.includes('qrcode_connect') || url.includes('scan')) {
      try {
        const data = await res.json().catch(() => null);
        if (data) {
          console.log('QR_API:', url.substring(0, 150));
          console.log('QR_DATA:', JSON.stringify(data).substring(0, 500));
          if (data.data) {
            if (data.data.token) qrToken = data.data.token;
            if (data.data.qrcode_index_url) qrUrl = data.data.qrcode_index_url;
            if (data.data.url) qrUrl = data.data.url;
          }
        }
      } catch(e) {}
    }
    // Also check passport APIs
    if (url.includes('passport') && (url.includes('login') || url.includes('auth'))) {
      try {
        const data = await res.json().catch(() => null);
        if (data && data.data) {
          console.log('PASSPORT_API:', url.substring(0, 150));
          console.log('PASSPORT_DATA:', JSON.stringify(data.data).substring(0, 500));
        }
      } catch(e) {}
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(8000);
  
  console.log('\n--- RESULTS ---');
  console.log('QR Token:', qrToken);
  console.log('QR URL:', qrUrl);
  
  await browser.close();
})();
