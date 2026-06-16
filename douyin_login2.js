const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Monitor network requests
  const apiRequests = [];
  page.on('request', req => {
    if (req.url().includes('send') || req.url().includes('code') || req.url().includes('sms') || req.url().includes('login') || req.url().includes('captcha')) {
      apiRequests.push({ url: req.url(), method: req.method(), postData: req.postData() });
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('send') || res.url().includes('code') || res.url().includes('sms') || res.url().includes('login') || res.url().includes('captcha')) {
      try {
        const body = await res.text().catch(() => '');
        console.log('RESPONSE:', res.url(), 'Status:', res.status(), 'Body:', body.slice(0, 300));
      } catch(e) {}
    }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click "验证码登录" tab
  const smsTab = page.locator('text=验证码登录').first();
  await smsTab.click();
  await page.waitForTimeout(1000);
  
  // Fill phone number using keyboard
  const phoneInput = page.locator('input[name="normal-input"]');
  await phoneInput.click();
  await phoneInput.fill('');
  await page.keyboard.type('13685790625', { delay: 50 });
  await page.waitForTimeout(1000);
  
  // Click "获取验证码"
  const sendBtn = page.locator('text=获取验证码').first();
  await sendBtn.click();
  await page.waitForTimeout(5000);
  
  // Check button text
  const btnText = await page.textContent('.button_text-HbBhfP').catch(() => 'N/A');
  console.log('Button text after click:', btnText);
  
  // Log all API requests
  console.log('\nAPI Requests captured:');
  apiRequests.forEach(r => console.log(r.method, r.url, r.postData ? 'POST:' + r.postData.slice(0,200) : ''));
  
  await page.screenshot({ path: '/home/z/my-project/douyin_pw2.png', fullPage: false });
  
  await browser.close();
})();
