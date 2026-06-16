const { chromium } = require('playwright');

(async () => {
  const userDataDir = '/home/z/my-project/browser_data6';
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = context.pages()[0] || await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);
  
  // Save QR code screenshot for sending to user
  await page.screenshot({ path: '/home/z/my-project/qr_send.png' });
  console.log('QR_SAVED');
  
  // Wait for scan (5 min)
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    const url = page.url();
    if (url.includes('creator-micro') || url.includes('home')) {
      console.log('SCANNED_OK');
      
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
        if (await page.$('video')) { console.log('UPLOADED'); break; }
        if (k === 29) { console.log('UPLOAD_TIMEOUT'); await context.close(); return; }
      }
      
      await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
      const d = await page.$('div[contenteditable=true]');
      if (d) { await d.click(); await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 30 }); }
      console.log('FILLED');
      
      await page.waitForTimeout(3000);
      for (let k = 0; k < 15; k++) {
        let c = false;
        try { await page.click('button:has-text("我知道了")', { timeout: 500 }); c = true; } catch(e) {}
        try { await page.click('.semi-modal-close', { timeout: 300 }); c = true; } catch(e) {}
        try { await page.click('.semi-icon-close', { timeout: 300 }); c = true; } catch(e) {}
        try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
        await page.waitForTimeout(300);
        if (!c && k > 3) break;
      }
      
      let result = null;
      page.on('response', async res => {
        if (res.url().includes('aweme/create')) { try { result = await res.text(); } catch(e) {} }
      });
      
      await page.click('button.primary-cECiOJ');
      console.log('PUBLISH_CLICKED');
      
      for (let k = 0; k < 25; k++) {
        await page.waitForTimeout(3000);
        try { await page.click('button:has-text("确认")', { timeout: 1000 }); } catch(e) {}
        if (result) {
          console.log('API:', result.substring(0, 300));
          console.log(result.includes('"status_code":0') ? 'SUCCESS' : 'FAILED');
          break;
        }
      }
      
      await page.screenshot({ path: '/home/z/my-project/scan_result.png' });
      console.log('DONE');
      await context.close();
      return;
    }
    if (i % 6 === 0) console.log('WAITING', i * 5, 's');
  }
  console.log('SCAN_TIMEOUT');
  await context.close();
})().catch(e => { console.log('ERROR:', e.message); });
