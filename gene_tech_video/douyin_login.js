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
  await page.screenshot({ path: '/home/z/my-project/gene_tech_video/pw_qrcode.png' });
  console.log("QR code screenshot saved!");
  
  // Wait for user to scan - poll every 3 seconds for up to 3 minutes
  console.log("Waiting for login (up to 3 minutes)...");
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(3000);
    
    // Check if login succeeded by looking for session cookies
    const cookies = await context.cookies();
    const hasSession = cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
    
    if (hasSession) {
      console.log("✅ Login successful!");
      
      // Save storage state for future use
      await context.storageState({ path: '/home/z/my-project/gene_tech_video/douyin_auth.json' });
      console.log("Auth state saved!");
      
      // Navigate to upload page
      await page.goto('https://creator.douyin.com/creator-micro/content/upload', { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({ path: '/home/z/my-project/gene_tech_video/pw_upload_page.png' });
      console.log("Upload page screenshot saved!");
      
      break;
    }
    
    if (i % 5 === 0) {
      console.log(`Still waiting... (${i * 3}s)`);
    }
  }
  
  const cookies = await context.cookies();
  const hasSession = cookies.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
  if (!hasSession) {
    console.log("❌ Login timed out. Please try again.");
  }
  
  await browser.close();
})();
