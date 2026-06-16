const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Intercept the QR code generation API
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('qrcode') || url.includes('scan_code') || url.includes('connect')) {
      try {
        const data = await res.json().catch(() => null);
        if (data) {
          console.log('QR_URL:', url);
          console.log('QR_RESP:', JSON.stringify(data).substring(0, 1000));
        }
      } catch(e) {}
    }
  });
  
  // Also intercept the passport send_code API
  page.on('request', req => {
    if (req.url().includes('send_code') || req.url().includes('send_sms') || req.url().includes('qrcode')) {
      console.log('REQ:', req.method(), req.url().substring(0, 200));
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Try to find the QR code token from the page's JavaScript context
  const tokenInfo = await page.evaluate(() => {
    // Check window.__NEXT_DATA__ or similar
    const keys = Object.keys(window).filter(k => k.includes('token') || k.includes('qr') || k.includes('scan'));
    return { windowKeys: keys };
  });
  console.log('Window keys:', JSON.stringify(tokenInfo));
  
  // Try to find the QR code image data and its associated token
  const qrData = await page.evaluate(() => {
    // The QR code is rendered as an img with base64 data
    // The token might be stored in a React/Vue state
    const imgs = document.querySelectorAll('img');
    const qrImg = Array.from(imgs).find(i => i.width === 248 && i.height === 248);
    if (qrImg) {
      // Try to find the parent component's state
      let el = qrImg;
      for (let i = 0; i < 10; i++) {
        el = el.parentElement;
        if (!el) break;
        const reactKey = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
        if (reactKey) {
          let fiber = el[reactKey];
          // Walk up the fiber tree to find state with token
          for (let j = 0; j < 20; j++) {
            if (fiber && fiber.memoizedState) {
              const state = fiber.memoizedState;
              const stateStr = JSON.stringify(state).substring(0, 500);
              if (stateStr.includes('token') || stateStr.includes('qr')) {
                return { found: true, state: stateStr };
              }
            }
            fiber = fiber ? fiber.return : null;
          }
        }
      }
    }
    return { found: false };
  });
  console.log('QR data from React:', JSON.stringify(qrData));
  
  await browser.close();
})();
