const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(8000);
  
  // Take screenshot - QR code should render in headed mode
  await page.screenshot({ path: '/home/z/my-project/headed_qr.png' });
  console.log('QR_SCREENSHOT_TAKEN');
  
  // Check if QR code rendered
  const hasQR = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.naturalWidth > 100 && img.naturalHeight > 100 && img.naturalWidth === img.naturalHeight) {
        return { found: true, src: img.src.substring(0, 100), w: img.naturalWidth };
      }
    }
    return { found: false };
  });
  console.log('QR found:', JSON.stringify(hasQR));
  
  await browser.close();
})().catch(e => { console.log('ERROR:', e.message); });
