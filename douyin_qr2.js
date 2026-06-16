const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Screenshot the QR code area
  await page.screenshot({ path: '/home/z/my-project/douyin_qr.png', clip: { x: 0, y: 0, width: 1280, height: 720 } });
  console.log('Screenshot saved');
  
  await browser.close();
})();
