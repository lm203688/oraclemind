const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  let qrBase64 = null;
  let scanToken = null;
  
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('get_qrcode') && url.includes('douyin.com')) {
      try {
        const data = await res.json().catch(() => null);
        if (data && data.data && data.data.qrcode && data.data.error_code === 0) {
          qrBase64 = data.data.qrcode;
          scanToken = data.data.token;
          // IMMEDIATELY save QR code
          fs.writeFileSync('/home/z/my-project/qr_now.png', Buffer.from(qrBase64, 'base64'));
          console.log('QR_SAVED');
          console.log('TOKEN:' + scanToken);
        }
      } catch(e) {}
    }
  });
  
  await page.goto('https://sso.douyin.com/?aid=2906&app_id=2906&service=https%3A%2F%2Fcreator.douyin.com&is_front=1', { 
    waitUntil: 'domcontentloaded', timeout: 15000 
  });
  await page.waitForTimeout(3000);
  
  if (!qrBase64) {
    await page.waitForTimeout(5000);
  }
  
  if (qrBase64) {
    console.log('READY_TO_SEND');
  } else {
    console.log('NO_QR');
  }
  
  // Now poll for scan status - keep running
  console.log('POLLING_START');
  for (let i = 0; i < 36; i++) {  // 3 minutes
    await page.waitForTimeout(5000);
    const currentUrl = page.url();
    
    // Check if we've been redirected to creator center (login success)
    if (currentUrl.includes('creator.douyin.com') && !currentUrl.includes('login')) {
      console.log('LOGGED_IN');
      await context.storageState({ path: '/home/z/my-project/douyin_logged_in.json' });
      
      // Navigate to creator center and save final state
      await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      await context.storageState({ path: '/home/z/my-project/douyin_logged_in.json' });
      console.log('STATE_SAVED');
      break;
    }
    
    if (i % 6 === 0) console.log('POLL_' + i + ':' + currentUrl.substring(0, 80));
  }
  
  await browser.close();
})();
