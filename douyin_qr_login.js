const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/home/z/my-project/browser_data';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = context.pages()[0] || await context.newPage();
  
  // Navigate to creator platform
  console.log('STEP: navigating to creator platform...');
  await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 20000 
  });
  await page.waitForTimeout(5000);
  
  const currentUrl = page.url();
  console.log('URL:', currentUrl);
  
  // Check if we need to login
  if (currentUrl.includes('login') || !currentUrl.includes('creator-micro')) {
    console.log('STEP: need login, taking screenshot...');
    await page.screenshot({ path: '/home/z/my-project/qr_login.png', fullPage: false });
    console.log('QR_SCREENSHOT_READY');
    
    // Wait for login (up to 5 minutes)
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(5000);
      const url = page.url();
      if (url.includes('creator-micro')) {
        console.log('LOGIN_SUCCESS');
        break;
      }
      if (i % 6 === 0) console.log('waiting for login...', i * 5, 'seconds');
      if (i === 59) {
        console.log('LOGIN_TIMEOUT');
        await context.close();
        return;
      }
    }
  } else {
    console.log('STEP: already logged in!');
  }
  
  // Now on publish page - close popups
  console.log('STEP: closing popups...');
  try { await page.click('button:has-text("我知道了")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("放弃")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("继续编辑")', { timeout: 2000 }); } catch(e) {}
  await page.waitForTimeout(2000);
  
  // Upload video
  console.log('STEP: uploading video...');
  const videoInput = await page.$('input[accept*="video"]');
  if (!videoInput) {
    console.log('NO_VIDEO_INPUT');
    await page.screenshot({ path: '/home/z/my-project/debug_no_input.png' });
    await context.close();
    return;
  }
  await videoInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
  console.log('VIDEO_UPLOADING');
  
  // Wait for upload
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    if (await page.$('video')) {
      console.log('VIDEO_UPLOADED');
      break;
    }
    if (i === 29) {
      console.log('VIDEO_UPLOAD_TIMEOUT');
      await context.close();
      return;
    }
  }
  
  // Fill info
  console.log('STEP: filling info...');
  await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  const descEl = await page.$('div[contenteditable=true]');
  if (descEl) {
    await descEl.click();
    await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 30 });
  }
  console.log('INFO_FILLED');
  
  await page.waitForTimeout(3000);
  
  // Close ALL popups aggressively
  console.log('STEP: closing all popups...');
  for (let i = 0; i < 10; i++) {
    try { await page.click('button:has-text("我知道了")', { timeout: 500 }); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 500 }); } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 500 }); } catch(e) {}
    try { await page.click('[class*="close"]', { timeout: 300 }); } catch(e) {}
    await page.waitForTimeout(300);
  }
  
  // Click publish
  console.log('STEP: clicking publish...');
  let createResult = null;
  page.on('response', async res => {
    if (res.url().includes('aweme/create') || res.url().includes('media/aweme/create')) {
      try { createResult = await res.text(); } catch(e) {}
    }
  });
  
  await page.click('button.primary-cECiOJ');
  console.log('PUBLISH_CLICKED');
  
  // Wait for result
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(3000);
    try { await page.click('button:has-text("确认")', { timeout: 1000 }); } catch(e) {}
    try { await page.click('.semi-button-primary', { timeout: 500 }); } catch(e) {}
    
    if (createResult) {
      console.log('API_RESULT:', createResult.substring(0, 500));
      if (createResult.includes('"status_code":0') || createResult.includes('"aweme_id"')) {
        console.log('PUBLISH_SUCCESS');
      } else {
        console.log('PUBLISH_MAYBE_FAILED');
      }
      break;
    }
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    if (bodyText.includes('发布成功') || bodyText.includes('审核')) {
      console.log('PUBLISH_SUCCESS');
      break;
    }
  }
  
  if (!createResult) {
    console.log('NO_API_RESPONSE');
    // Try clicking publish again after closing more popups
    for (let i = 0; i < 5; i++) {
      try { await page.click('button:has-text("我知道了")', { timeout: 500 }); } catch(e) {}
      try { await page.click('.semi-modal-close', { timeout: 500 }); } catch(e) {}
      await page.waitForTimeout(300);
    }
    await page.click('button.primary-cECiOJ');
    console.log('PUBLISH_RETRY');
    await page.waitForTimeout(10000);
    
    if (createResult) {
      console.log('API_RESULT_RETRY:', createResult.substring(0, 500));
    }
  }
  
  await page.screenshot({ path: '/home/z/my-project/final_result.png' });
  console.log('DONE');
  
  await context.close();
})();
