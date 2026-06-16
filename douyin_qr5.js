const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Click "我是创作者" to enter login page
  await page.click('text=我是创作者').catch(() => {});
  await page.waitForTimeout(3000);
  
  // Check current page state
  const title = await page.title();
  console.log('Title:', title);
  
  // Take screenshot
  await page.screenshot({ path: '/home/z/my-project/douyin_qr5.png' });
  console.log('Screenshot saved');
  
  // Look for QR code
  const allImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).filter(i => i.offsetParent !== null).map(img => ({
      src: img.src.substring(0, 100),
      alt: img.alt,
      w: img.naturalWidth,
      h: img.naturalHeight
    }));
  });
  console.log('Visible images:', JSON.stringify(allImgs, null, 2));
  
  // Look for canvas elements (QR might be rendered on canvas)
  const canvases = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('canvas')).map(c => ({
      w: c.width, h: c.height, visible: c.offsetParent !== null
    }));
  });
  console.log('Canvases:', JSON.stringify(canvases));
  
  await browser.close();
})();
