const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click "验证码登录" tab
  await page.click('text=验证码登录');
  await page.waitForTimeout(1000);
  
  // Fill phone number
  await page.fill('input[name="normal-input"]', '13685790625');
  await page.waitForTimeout(1000);
  
  // Click "获取验证码"
  await page.click('text=获取验证码');
  await page.waitForTimeout(5000);
  
  // Check button text
  const btnText = await page.textContent('.button_text-HbBhfP').catch(() => 'N/A');
  console.log('Button text after click:', btnText);
  
  // Take screenshot
  await page.screenshot({ path: '/home/z/my-project/douyin_pw_login.png', fullPage: true });
  console.log('Screenshot saved');
  
  // Check for any captcha/modal
  const hasCaptcha = await page.locator('[class*=captcha], [class*=verify_img], [class*=slider]').count();
  console.log('Captcha elements found:', hasCaptcha);
  
  // Check for any error messages or toasts
  const bodyText = await page.textContent('body');
  if (bodyText.includes('验证码已发送') || bodyText.includes('发送成功')) {
    console.log('SUCCESS: Verification code sent!');
  } else if (bodyText.includes('频繁') || bodyText.includes('稍后')) {
    console.log('RATE LIMITED: Too frequent requests');
  } else if (bodyText.includes('图形验证') || bodyText.includes('滑块')) {
    console.log('CAPTCHA: Image/slider verification required');
  } else {
    console.log('STATUS: Unknown - no clear success/failure message detected');
  }
  
  // Save state for later use
  await page.context().storageState({ path: '/home/z/my-project/douyin_state.json' });
  
  // Keep browser open for a bit
  await page.waitForTimeout(2000);
  await browser.close();
})();
