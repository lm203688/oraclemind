const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Monitor all image requests
  const imgUrls = [];
  page.on('response', async (res) => {
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('image') || res.url().includes('qrcode') || res.url().includes('qr')) {
      imgUrls.push(res.url().substring(0, 200));
    }
    if (res.url().includes('passport') && res.url().includes('login')) {
      try {
        const text = await res.text().catch(() => '');
        if (text.includes('qr') || text.includes('code')) {
          console.log('LOGIN_API:', res.url().substring(0, 150));
          console.log('BODY:', text.substring(0, 300));
        }
      } catch(e) {}
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(6000);
  
  // List all images on page
  const allImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src.substring(0, 150),
      alt: img.alt,
      w: img.naturalWidth,
      h: img.naturalHeight,
      visible: img.offsetParent !== null
    }));
  });
  console.log('\nAll images on page:');
  allImgs.forEach(i => console.log(JSON.stringify(i)));
  
  // Try to find and screenshot the QR code
  const qrEl = await page.$('img[alt="二维码"]');
  if (qrEl) {
    await qrEl.screenshot({ path: '/home/z/my-project/qrcode.png' });
    console.log('\nQR code screenshot saved to qrcode.png');
  } else {
    console.log('\nNo QR code element found');
  }
  
  await browser.close();
})();
