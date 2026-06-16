const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  let qrBase64 = null;
  let qrToken = null;
  let frontierParams = null;
  
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('get_qrcode') && url.includes('douyin.com')) {
      try {
        const data = await res.json().catch(() => null);
        if (data && data.data && data.data.qrcode) {
          qrBase64 = data.data.qrcode;
          qrToken = data.data.token;
          frontierParams = data.data.frontier_params;
          console.log('QR_CODE_CAPTURED');
          console.log('EXPIRE:', data.data.expire_time);
          console.log('TOKEN:', data.data.token || 'no token field');
          console.log('ACCESS_KEY:', frontierParams ? frontierParams.access_key : 'no frontier');
          console.log('ERROR_CODE:', data.data.error_code);
        }
      } catch(e) {}
    }
  });
  
  // Go to SSO page which triggers QR code generation
  await page.goto('https://sso.douyin.com/?aid=2906&app_id=2906&service=https%3A%2F%2Fcreator.douyin.com&is_front=1', { 
    waitUntil: 'domcontentloaded', timeout: 15000 
  });
  await page.waitForTimeout(5000);
  
  if (qrBase64) {
    // Save QR code image
    fs.writeFileSync('/home/z/my-project/qr_latest.png', Buffer.from(qrBase64, 'base64'));
    console.log('QR image saved');
  } else {
    console.log('No QR code captured from API');
    // Try to get from page
    const pageQr = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const qr = Array.from(imgs).find(i => i.naturalWidth === 512 && i.naturalHeight === 512);
      return qr ? qr.src.replace('data:image/png;base64,', '') : null;
    });
    if (pageQr) {
      fs.writeFileSync('/home/z/my-project/qr_latest.png', Buffer.from(pageQr, 'base64'));
      console.log('QR from page saved');
    }
  }
  
  // Save cookies and state for session persistence
  await context.storageState({ path: '/home/z/my-project/douyin_sso_state.json' });
  
  // Keep browser open and poll for scan status
  console.log('\nWaiting for scan... polling for 90 seconds');
  for (let i = 0; i < 18; i++) {
    await page.waitForTimeout(5000);
    
    // Check if redirected (login success)
    const currentUrl = page.url();
    if (!currentUrl.includes('sso.douyin.com')) {
      console.log('LOGIN_SUCCESS! Redirected to:', currentUrl);
      await context.storageState({ path: '/home/z/my-project/douyin_logged_in_state.json' });
      break;
    }
    
    // Try to check scan status via API
    const status = await page.evaluate(async () => {
      try {
        const resp = await fetch('/passport/web/scan_qrcode_connect/?aid=6383&token=&is_front=1', {
          credentials: 'include'
        });
        return await resp.text();
      } catch(e) {
        return 'error: ' + e.message;
      }
    }).catch(() => 'eval error');
    
    if (i % 3 === 0) console.log(`Poll ${i}: URL=${currentUrl.substring(0, 80)}`);
  }
  
  await browser.close();
})();
