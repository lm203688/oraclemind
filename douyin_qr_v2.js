const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/home/z/my-project/browser_data2';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = context.pages()[0] || await context.newPage();
  
  // Go to login page directly
  console.log('Opening login page...');
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);
  
  // Take screenshot of login page
  await page.screenshot({ path: '/home/z/my-project/login_page.png' });
  console.log('LOGIN_SCREENSHOT_SAVED');
  
  // Check if there's a QR code - try to find and click "扫码登录" tab
  try {
    const qrTab = await page.$('text=扫码登录') || await page.$('[class*="qrcode"]') || await page.$('text=扫码');
    if (qrTab) {
      console.log('Found QR login tab, clicking...');
      await qrTab.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/home/z/my-project/qr_code.png' });
      console.log('QR_CODE_SAVED');
    }
  } catch(e) {
    console.log('No QR tab found');
  }
  
  // Also take a cropped screenshot of just the QR code area
  const qrImg = await page.$('img[src*="qrcode"]') || await page.$('img[src*="qr"]') || await page.$('[class*="qrcode"] img') || await page.$('canvas');
  if (qrImg) {
    console.log('Found QR code element');
    await qrImg.screenshot({ path: '/home/z/my-project/qr_only.png' });
    console.log('QR_ONLY_SAVED');
  }
  
  // Now wait for user to scan QR code (up to 5 minutes)
  console.log('WAITING_FOR_SCAN');
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    const url = page.url();
    if (url.includes('creator-micro') || url.includes('home')) {
      console.log('LOGIN_SUCCESS at', url);
      break;
    }
    if (i % 12 === 0) console.log('Still waiting...', (i*5), 's');
    if (i === 59) {
      console.log('LOGIN_TIMEOUT');
      await context.close();
      return;
    }
  }
  
  // Login successful! Now navigate to publish page
  console.log('Navigating to publish page...');
  await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { 
    waitUntil: 'domcontentloaded', timeout: 20000 
  });
  await page.waitForTimeout(8000);
  
  // Close popups
  for (let attempt = 0; attempt < 5; attempt++) {
    try { await page.click('button:has-text("我知道了")', { timeout: 1500 }); } catch(e) {}
    try { await page.click('button:has-text("放弃")', { timeout: 1500 }); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 1000 }); } catch(e) {}
    await page.waitForTimeout(1000);
  }
  
  // Find and upload video
  console.log('Looking for video input...');
  const videoInput = await page.$('input[type="file"]') || await page.$('input[accept*="video"]');
  console.log('Video input:', !!videoInput);
  
  if (!videoInput) {
    // List all inputs for debugging
    const inputs = await page.$$('input');
    for (const inp of inputs) {
      const info = await page.evaluate(el => ({type:el.type, accept:el.accept, name:el.name, className:el.className}), inp);
      console.log('Input:', JSON.stringify(info));
    }
    await page.screenshot({ path: '/home/z/my-project/debug_publish.png' });
    console.log('NO_INPUT_DEBUG_SAVED');
    await context.close();
    return;
  }
  
  await videoInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
  console.log('VIDEO_UPLOADING');
  
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    if (await page.$('video')) { console.log('VIDEO_UPLOADED'); break; }
    if (i === 29) { console.log('UPLOAD_TIMEOUT'); await context.close(); return; }
  }
  
  // Fill info
  await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  const descEl = await page.$('div[contenteditable=true]');
  if (descEl) {
    await descEl.click();
    await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 30 });
  }
  console.log('INFO_FILLED');
  
  await page.waitForTimeout(3000);
  
  // Close ALL popups
  for (let i = 0; i < 15; i++) {
    let closed = false;
    try { await page.click('button:has-text("我知道了")', { timeout: 500 }); closed = true; } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
    await page.waitForTimeout(300);
    if (!closed && i > 3) break;
  }
  
  // Publish
  console.log('PUBLISHING...');
  let createResult = null;
  page.on('response', async res => {
    if (res.url().includes('aweme/create')) {
      try { createResult = await res.text(); } catch(e) {}
    }
  });
  
  await page.click('button.primary-cECiOJ');
  console.log('PUBLISH_CLICKED');
  
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(3000);
    try { await page.click('button:has-text("确认")', { timeout: 1000 }); } catch(e) {}
    if (createResult) {
      console.log('API_RESULT:', createResult.substring(0, 500));
      console.log(createResult.includes('"status_code":0') ? 'PUBLISH_SUCCESS' : 'PUBLISH_FAILED');
      break;
    }
  }
  
  await page.screenshot({ path: '/home/z/my-project/final_qr.png' });
  console.log('DONE');
  await context.close();
})().catch(e => { console.log('ERROR:', e.message); process.exit(1); });
