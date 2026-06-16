const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/home/z/my-project/browser_data';
  
  console.log('Launching browser...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  const pages = context.pages();
  const page = pages[0] || await context.newPage();
  
  // Navigate to publish page
  console.log('Navigating to publish page...');
  await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 20000 
  });
  await page.waitForTimeout(8000);
  
  const currentUrl = page.url();
  console.log('URL:', currentUrl);
  
  // Check if redirected to login
  if (!currentUrl.includes('creator-micro')) {
    console.log('NEED_LOGIN');
    await page.screenshot({ path: '/home/z/my-project/qr_login.png' });
    console.log('QR_SCREENSHOT_READY');
    
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(5000);
      if (page.url().includes('creator-micro')) {
        console.log('LOGIN_SUCCESS');
        break;
      }
      if (i === 59) {
        console.log('LOGIN_TIMEOUT');
        await context.close();
        return;
      }
    }
  }
  
  // Close ALL possible popups
  console.log('Closing popups...');
  for (let attempt = 0; attempt < 5; attempt++) {
    try { await page.click('button:has-text("我知道了")', { timeout: 1500 }); console.log('  closed 我知道了'); } catch(e) {}
    try { await page.click('button:has-text("放弃")', { timeout: 1500 }); console.log('  closed 放弃'); } catch(e) {}
    try { await page.click('button:has-text("继续编辑")', { timeout: 1500 }); console.log('  clicked 继续编辑'); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 1000 }); } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 1000 }); } catch(e) {}
    await page.waitForTimeout(1000);
  }
  
  // Check if video already exists (from previous draft)
  const hasVideo = await page.$('video');
  console.log('Has video:', !!hasVideo);
  
  if (hasVideo) {
    console.log('Video already present (draft)');
  } else {
    // Find file input
    const allInputs = await page.$$('input');
    console.log('Total inputs found:', allInputs.length);
    for (const inp of allInputs) {
      const info = await page.evaluate(el => ({type: el.type, accept: el.accept, name: el.name, id: el.id, className: el.className}), inp);
      console.log('  input:', JSON.stringify(info));
    }
    
    const videoInput = await page.$('input[type="file"]') || await page.$('input[accept*="video"]');
    console.log('Video input found:', !!videoInput);
    
    if (!videoInput) {
      console.log('No file input - trying to click upload area first...');
      // Try clicking the upload zone to trigger file input creation
      const uploadZone = await page.$('[class*="upload"]') || await page.$('[class*="drag"]') || await page.$('[class*="card"]');
      if (uploadZone) {
        console.log('Found upload zone, clicking...');
        await uploadZone.click();
        await page.waitForTimeout(3000);
        
        // Check again
        const videoInput2 = await page.$('input[type="file"]') || await page.$('input[accept*="video"]');
        if (videoInput2) {
          console.log('File input appeared after click!');
          await videoInput2.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
          console.log('VIDEO_UPLOADING');
        } else {
          console.log('STILL_NO_INPUT');
          await page.screenshot({ path: '/home/z/my-project/debug_v5.png' });
          await context.close();
          return;
        }
      } else {
        console.log('NO_UPLOAD_ZONE');
        await page.screenshot({ path: '/home/z/my-project/debug_v5.png' });
        await context.close();
        return;
      }
    } else {
      await videoInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
      console.log('VIDEO_UPLOADING');
    }
    
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
  }
  
  // Fill info
  console.log('Filling info...');
  try {
    await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  } catch(e) {
    console.log('Title fill error:', e.message.substring(0, 100));
  }
  
  try {
    const descEl = await page.$('div[contenteditable=true]');
    if (descEl) {
      await descEl.click();
      await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 30 });
    }
  } catch(e) {
    console.log('Desc fill error:', e.message.substring(0, 100));
  }
  console.log('INFO_FILLED');
  
  await page.waitForTimeout(3000);
  
  // Close ALL popups aggressively before publish
  console.log('Closing popups before publish...');
  for (let i = 0; i < 15; i++) {
    let closed = false;
    try { await page.click('button:has-text("我知道了")', { timeout: 500 }); closed = true; } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('[class*="modal"] [class*="close"]', { timeout: 300 }); closed = true; } catch(e) {}
    // Remove semi-portal overlays
    try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
    await page.waitForTimeout(300);
    if (!closed && i > 3) break; // No more popups
  }
  
  // Click publish
  console.log('Clicking publish...');
  let createResult = null;
  page.on('response', async res => {
    if (res.url().includes('aweme/create') || res.url().includes('media/aweme/create')) {
      try { createResult = await res.text(); } catch(e) {}
    }
  });
  
  try {
    await page.click('button.primary-cECiOJ');
    console.log('PUBLISH_CLICKED');
  } catch(e) {
    // Try alternative selectors
    console.log('Primary button not found, trying alternatives...');
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      if (text.includes('发布')) {
        await btn.click();
        console.log('Clicked publish button:', text.trim());
        break;
      }
    }
  }
  
  // Wait for result
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(3000);
    
    // Handle confirmations
    try { await page.click('button:has-text("确认")', { timeout: 1000 }); console.log('CONFIRMED'); } catch(e) {}
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
    if (bodyText.includes('发布成功') || bodyText.includes('审核中')) {
      console.log('PUBLISH_SUCCESS_PAGE');
      break;
    }
  }
  
  if (!createResult) {
    console.log('NO_API_RESPONSE - retrying...');
    // Close more popups and try again
    for (let i = 0; i < 5; i++) {
      try { await page.click('button:has-text("我知道了")', { timeout: 500 }); } catch(e) {}
      try { await page.click('.semi-modal-close', { timeout: 300 }); } catch(e) {}
      await page.waitForTimeout(300);
    }
    try { await page.click('button.primary-cECiOJ'); } catch(e) {}
    await page.waitForTimeout(15000);
    
    if (createResult) {
      console.log('API_RESULT_RETRY:', createResult.substring(0, 500));
    }
  }
  
  await page.screenshot({ path: '/home/z/my-project/final_v5.png' });
  console.log('DONE');
  
  await context.close();
})().catch(e => {
  console.log('FATAL_ERROR:', e.message);
  process.exit(1);
});
