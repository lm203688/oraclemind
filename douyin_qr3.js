const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept the QR code API response
  let qrDataUrl = null;
  page.on('response', async (res) => {
    if (res.url().includes('get_qrcode')) {
      try {
        const data = await res.json();
        if (data.data && data.data.qrcode) {
          qrDataUrl = 'data:image/png;base64,' + data.data.qrcode;
          console.log('QR_CODE_FOUND');
        }
      } catch(e) {}
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Try to get QR image src from page
  const qrSrc = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.alt === '二维码' || img.src.includes('qrcode')) {
        return img.src;
      }
    }
    // Try to find any reasonably sized image that could be QR
    for (const img of imgs) {
      if (img.naturalWidth > 100 && img.naturalWidth < 400 && img.naturalHeight > 100 && img.naturalHeight < 400) {
        return img.src;
      }
    }
    return null;
  });
  
  console.log('QR_SRC:', qrSrc ? qrSrc.substring(0, 200) : 'not found');
  
  // Save the QR code image directly
  if (qrSrc) {
    // If it's a data URL or blob, screenshot the element
    const qrElement = await page.locator('img[alt="二维码"]').first();
    if (qrElement) {
      await qrElement.screenshot({ path: '/home/z/my-project/qrcode.png' });
      console.log('QR element screenshot saved');
    }
  }
  
  await page.screenshot({ path: '/home/z/my-project/douyin_full.png' });
  
  // Save state for session persistence
  await context.storageState({ path: '/home/z/my-project/douyin_state.json' });
  
  await browser.close();
})();
