const { chromium } = require('playwright');

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
  
  console.log("Opening Douyin Creator...");
  await page.goto('https://creator.douyin.com/', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Click "扫码登录"
  console.log("Looking for QR code login...");
  const qrLoginBtn = page.locator('text=扫码登录').first();
  await qrLoginBtn.click().catch(() => {});
  await page.waitForTimeout(2000);
  
  // Take screenshot of QR code
  await page.screenshot({ path: '/home/z/my-project/gene_tech_video/pw_qrcode2.png' });
  console.log("QR_CODE_READY");
  
  // Wait for user to scan - poll every 2 seconds for up to 5 minutes
  console.log("Waiting for login...");
  for (let i = 0; i < 150; i++) {
    await page.waitForTimeout(2000);
    
    // Check if login succeeded
    const cookies = await context.cookies();
    const hasSession = cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
    
    // Also check if page redirected away from login
    const currentUrl = page.url();
    const hasLoginModal = await page.locator('text=扫码登录').count().catch(() => 0);
    
    if (hasSession || (hasLoginModal === 0 && !currentUrl.includes('login'))) {
      console.log("✅ LOGIN_SUCCESS");
      
      // Save storage state for future use
      await context.storageState({ path: '/home/z/my-project/gene_tech_video/douyin_auth.json' });
      console.log("AUTH_SAVED");
      
      // Navigate to upload page
      await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({ path: '/home/z/my-project/gene_tech_video/pw_upload_page.png' });
      console.log("UPLOAD_PAGE_READY");
      
      break;
    }
    
    if (i % 10 === 0 && i > 0) {
      console.log(`Waiting... (${i * 2}s) cookies:${cookies.length} url:${currentUrl.substring(0,50)}`);
    }
  }
  
  const cookies = await context.cookies();
  const hasSession = cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
  if (!hasSession) {
    console.log("❌ LOGIN_TIMEOUT");
  }
  
  await browser.close();
})();
