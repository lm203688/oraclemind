const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1344, height: 768 } });
    const page = await context.newPage();
    
    console.log("Opening page...");
    await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log("Clicking QR login...");
    await page.locator('text=扫码登录').first().click().catch(() => {});
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: '/home/z/my-project/gene_tech_video/qr_now.png' });
    console.log("QR_READY");
    fs.writeFileSync('/home/z/my-project/gene_tech_video/signal.txt', 'QR_READY');
    
    // Wait for login
    console.log("Waiting for scan...");
    for (let i = 0; i < 300; i++) {
      await page.waitForTimeout(2000);
      const cookies = await context.cookies();
      if (cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss')) {
        console.log("LOGGED_IN!");
        fs.writeFileSync('/home/z/my-project/gene_tech_video/signal.txt', 'LOGGED_IN');
        await context.storageState({ path: '/home/z/my-project/gene_tech_video/douyin_auth.json' });
        
        await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '/home/z/my-project/gene_tech_video/upload_page.png' });
        fs.writeFileSync('/home/z/my-project/gene_tech_video/signal.txt', 'UPLOAD_READY');
        console.log("UPLOAD_READY");
        await browser.close();
        return;
      }
      if (i % 15 === 0) console.log("Polling... " + (i*2) + "s");
    }
    
    console.log("TIMEOUT");
    fs.writeFileSync('/home/z/my-project/gene_tech_video/signal.txt', 'TIMEOUT');
    await browser.close();
  } catch(e) {
    console.error("ERROR:", e.message);
    fs.writeFileSync('/home/z/my-project/gene_tech_video/signal.txt', 'ERROR:' + e.message);
  }
})();
