const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Make sure we're on the QR code login tab (default)
  // Take screenshot of just the login area
  const qrImg = await page.locator('img[alt="二维码"]');
  if (qrImg) {
    await qrImg.screenshot({ path: '/home/z/my-project/douyin_qrcode.png' });
    console.log('QR code element screenshot saved');
  }
  
  // Also take a full page screenshot as backup
  await page.screenshot({ path: '/home/z/my-project/douyin_qr_full.png' });
  console.log('Full page screenshot saved');
  
  // Save browser state path for later reuse
  console.log('STATE_PATH:/home/z/my-project/douyin_browser_state');
  
  // Keep browser open - save the CDP endpoint
  const cdpUrl = browser.contexts()[0].pages()[0].url();
  console.log('Current URL:', cdpUrl);
  
  // Save storage state
  await context.storageState({ path: '/home/z/my-project/douyin_state.json' });
  
  await browser.close();
})();
