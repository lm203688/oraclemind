const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept ALL responses, looking for the QR code generation
  let allApiData = [];
  page.on('response', async (res) => {
    const url = res.url();
    try {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json') && url.includes('douyin.com')) {
        const data = await res.text().catch(() => '');
        // Look for anything with qrcode, scan, connect, or token that's not msToken
        if ((data.includes('qrcode') || data.includes('scan') || data.includes('connect')) && data.length < 2000) {
          allApiData.push({ url: url.substring(0, 150), data: data.substring(0, 800) });
        }
      }
    } catch(e) {}
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(8000);
  
  // Also try to get the QR code data from the canvas
  const canvasData = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    return Array.from(canvases).map(c => ({ w: c.width, h: c.height }));
  });
  
  // Try to find the QR code via the passport SDK
  const passportData = await page.evaluate(() => {
    // The passport SDK might have the token
    if (window.byted_acrawler) return 'byted_acrawler found';
    if (window.TTAccountSdk) return 'TTAccountSdk found: ' + JSON.stringify(Object.keys(window.TTAccountSdk)).substring(0, 200);
    if (window.__PASSPORT__) return '__PASSPORT__ found';
    return 'no passport SDK found';
  });
  console.log('Passport SDK:', passportData);
  
  console.log('\nAPI data with scan/connect:');
  allApiData.forEach(d => {
    console.log('URL:', d.url);
    console.log('DATA:', d.data);
    console.log('---');
  });
  
  await browser.close();
})();
