const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const context = await browser.newContext({ 
    viewport: { width: 1344, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  // Step 1: Open page and get QR code
  console.log("STEP1: Opening page...");
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  console.log("STEP1: Clicking QR login...");
  await page.locator('text=扫码登录').first().click().catch(() => {});
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/home/z/my-project/gene_tech_video/qr_live.png' });
  console.log("QR_READY");
  
  // Write a signal file so external script knows QR is ready
  fs.writeFileSync('/home/z/my-project/gene_tech_video/qr_status.txt', 'READY');
  
  // Step 2: Wait for login - poll for up to 5 minutes
  console.log("WAITING_FOR_SCAN...");
  for (let i = 0; i < 150; i++) {
    await page.waitForTimeout(2000);
    
    const cookies = await context.cookies();
    const hasSession = cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
    
    if (hasSession) {
      console.log("LOGIN_SUCCESS");
      fs.writeFileSync('/home/z/my-project/gene_tech_video/qr_status.txt', 'LOGGED_IN');
      
      // Save auth state
      await context.storageState({ path: '/home/z/my-project/gene_tech_video/douyin_auth.json' });
      console.log("AUTH_SAVED");
      
      // Navigate to upload page and screenshot
      await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/home/z/my-project/gene_tech_video/upload_page.png' });
      console.log("UPLOAD_PAGE_READY");
      
      await browser.close();
      return;
    }
    
    if (i % 10 === 0) {
      console.log(`POLL ${i * 2}s...`);
    }
  }
  
  console.log("LOGIN_TIMEOUT");
  fs.writeFileSync('/home/z/my-project/gene_tech_video/qr_status.txt', 'TIMEOUT');
  await browser.close();
})();
