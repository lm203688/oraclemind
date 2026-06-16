const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const userDataDir = '/home/z/my-project/browser_data7';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = context.pages()[0] || await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(8000);
  
  // Take screenshot
  await page.screenshot({ path: '/home/z/my-project/headed_login.png' });
  
  // Find ALL images and their sizes
  const imgInfo = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('img').forEach(img => {
      const rect = img.getBoundingClientRect();
      results.push({
        src: img.src.substring(0, 80),
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        displayW: rect.width,
        displayH: rect.height,
        x: rect.x,
        y: rect.y
      });
    });
    return results;
  });
  console.log('Images:', JSON.stringify(imgInfo, null, 2));
  
  // Look for QR code specifically - it's usually a square image > 100px
  for (const img of imgInfo) {
    if (img.naturalW === img.naturalH && img.naturalW > 100 && img.displayW > 80) {
      console.log('Potential QR:', img.src, img.displayW, 'x', img.displayH);
    }
  }
  
  // Try to find QR code by looking for canvas or specific class names
  const qrElements = await page.evaluate(() => {
    const results = [];
    // Check for canvas
    document.querySelectorAll('canvas').forEach(c => {
      const rect = c.getBoundingClientRect();
      results.push({tag: 'canvas', w: rect.width, h: rect.height, x: rect.x, y: rect.y});
    });
    // Check for elements with qr in class
    document.querySelectorAll('[class*="qr"], [class*="QR"], [class*="Qr"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      results.push({tag: el.tagName, class: el.className.substring(0, 50), w: rect.width, h: rect.height});
    });
    // Check for the login container
    document.querySelectorAll('[class*="login"], [class*="Login"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 100) {
        results.push({tag: el.tagName, class: el.className.substring(0, 50), w: rect.width, h: rect.height, x: rect.x, y: rect.y});
      }
    });
    return results;
  });
  console.log('QR elements:', JSON.stringify(qrElements, null, 2));
  
  // Wait for QR scan
  console.log('WAITING_FOR_SCAN');
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    const url = page.url();
    if (url.includes('creator-micro') || url.includes('home')) {
      console.log('SCANNED_OK');
      
      // Full publish flow
      await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { 
        waitUntil: 'domcontentloaded', timeout: 20000 
      });
      await page.waitForTimeout(8000);
      
      for (let j = 0; j < 5; j++) {
        try { await page.click('button:has-text("我知道了")', { timeout: 1500 }); } catch(e) {}
        try { await page.click('button:has-text("放弃")', { timeout: 1500 }); } catch(e) {}
        try { await page.click('.semi-modal-close', { timeout: 1000 }); } catch(e) {}
        await page.waitForTimeout(1000);
      }
      
      const vi = await page.$('input[type="file"]') || await page.$('input[accept*="video"]');
      if (!vi) { console.log('NO_INPUT'); await context.close(); return; }
      await vi.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
      console.log('UPLOADING');
      
      for (let k = 0; k < 30; k++) {
        await page.waitForTimeout(5000);
        if (k % 6 === 0) {
          try { await page.evaluate(async () => { await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' }); }); } catch(e) {}
        }
        if (await page.$('video')) { console.log('UPLOADED'); break; }
        if (k === 29) { console.log('UPLOAD_TIMEOUT'); await context.close(); return; }
      }
      
      await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
      const d = await page.$('div[contenteditable=true]');
      if (d) { await d.click(); await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 10 }); }
      console.log('FILLED');
      
      await page.waitForTimeout(1000);
      for (let k = 0; k < 15; k++) {
        let c = false;
        try { await page.click('button:has-text("我知道了")', { timeout: 300 }); c = true; } catch(e) {}
        try { await page.click('.semi-modal-close', { timeout: 200 }); c = true; } catch(e) {}
        try { await page.click('.semi-icon-close', { timeout: 200 }); c = true; } catch(e) {}
        try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
        await page.waitForTimeout(200);
        if (!c && k > 2) break;
      }
      
      let result = null;
      page.on('response', async res => {
        if (res.url().includes('aweme/create')) { try { result = await res.text(); } catch(e) {} }
      });
      
      await page.click('button.primary-cECiOJ');
      console.log('PUBLISH_CLICKED');
      
      for (let k = 0; k < 30; k++) {
        await page.waitForTimeout(2000);
        try { await page.click('button:has-text("确认")', { timeout: 500 }); } catch(e) {}
        try { await page.click('.semi-modal-close', { timeout: 200 }); } catch(e) {}
        try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
        if (result) {
          console.log('API:', result.substring(0, 300));
          console.log(result.includes('"status_code":0') ? 'SUCCESS' : 'FAILED');
          break;
        }
      }
      
      await page.screenshot({ path: '/home/z/my-project/headed_result.png' });
      console.log('DONE');
      await context.close();
      return;
    }
    if (i % 6 === 0) console.log('WAITING', i * 5, 's');
  }
  console.log('SCAN_TIMEOUT');
  await context.close();
})().catch(e => { console.log('ERROR:', e.message); });
