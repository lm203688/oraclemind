const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Go to SSO login page directly
  page.on('response', async (res) => {
    const url = res.url();
    try {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json') && (url.includes('qrcode') || url.includes('scan') || url.includes('token'))) {
        const data = await res.text().catch(() => '');
        console.log('API:', url.substring(0, 150));
        console.log('DATA:', data.substring(0, 800));
        console.log('---');
      }
    } catch(e) {}
  });
  
  // Navigate to SSO login page
  await page.goto('https://sso.douyin.com/?aid=2906&app_id=2906&service=https%3A%2F%2Fcreator.douyin.com&is_front=1', { 
    waitUntil: 'domcontentloaded', timeout: 15000 
  });
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: '/home/z/my-project/sso_login.png' });
  console.log('Screenshot saved');
  
  // Check for QR code on this page
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).filter(i => i.offsetParent !== null).map(i => ({
      src: i.src.substring(0, 100),
      alt: i.alt,
      w: i.naturalWidth,
      h: i.naturalHeight
    }));
  });
  console.log('Images:', JSON.stringify(imgs));
  
  await browser.close();
})();
