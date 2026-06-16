const { chromium } = require('playwright');
const fs = require('fs');

const cookieStr = fs.readFileSync('/tmp/douyin_cookies.txt', 'utf8').trim();
const cookies = cookieStr.split('; ').map(pair => {
  const idx = pair.indexOf('=');
  return { name: pair.substring(0, idx), value: pair.substring(idx + 1), domain: '.douyin.com', path: '/' };
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  let createResult = null;
  page.on('response', async res => {
    if (res.url().includes('aweme/create')) {
      try { createResult = await res.text(); } catch(e) {}
    }
  });

  // Step 1: Go to publish page
  console.log('1. 打开发布页...');
  await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Check URL - might be redirected to login
  const url = page.url();
  console.log('URL:', url);
  
  // Check if we're on login page
  const isLoginPage = await page.evaluate(() => {
    return !!document.querySelector('input[name="normal-input"]') || document.body.innerText.includes('扫码登录');
  });
  console.log('登录页:', isLoginPage);
  
  if (isLoginPage) {
    console.log('❌ 被重定向到登录页，cookies无效');
    await browser.close();
    return;
  }

  // Close popups
  try { await page.click('button:has-text("我知道了")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("放弃")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('.semi-modal-close', { timeout: 1000 }); } catch(e) {}
  await page.waitForTimeout(2000);

  // Step 2: Upload video
  console.log('2. 上传视频...');
  const videoInput = await page.$('input[accept*="video"]');
  if (!videoInput) { 
    console.log('❌ 没找到上传框'); 
    // Debug: list all inputs
    const inputs = await page.$$('input');
    for (const inp of inputs) {
      const info = await page.evaluate(el => ({type:el.type, accept:el.accept, name:el.name}), inp);
      console.log('  input:', JSON.stringify(info));
    }
    await browser.close(); 
    return; 
  }
  await videoInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
  await page.evaluate(() => {
    const inp = document.querySelector('input[accept*="video"]');
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Step 3: Wait for upload WITH HEARTBEAT to keep session alive
  console.log('3. 等待上传（带心跳保活）...');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    
    // Heartbeat: keep session alive every 30 seconds
    if (i % 6 === 0) {
      try {
        await page.evaluate(async () => {
          await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' });
        });
        console.log('  ❤️ 心跳');
      } catch(e) {}
    }
    
    if (await page.$('video')) { console.log('✅ 上传完成'); break; }
    if (i === 29) { console.log('❌ 超时'); await browser.close(); return; }
  }

  // Step 4: Fill info FAST
  console.log('4. 填写信息...');
  await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  const descEl = await page.$('div[contenteditable=true]');
  if (descEl) {
    await descEl.click();
    await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 10 });
  }
  console.log('✅ 已填写');

  await page.waitForTimeout(1000);

  // Step 5: Close popups FAST
  console.log('5. 关弹窗...');
  for (let i = 0; i < 10; i++) {
    let closed = false;
    try { await page.click('button:has-text("我知道了")', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 200 }); closed = true; } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 200 }); closed = true; } catch(e) {}
    try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
    await page.waitForTimeout(200);
    if (!closed && i > 2) break;
  }

  // Step 6: PUBLISH
  console.log('6. 发布！');
  await page.click('button.primary-cECiOJ');
  console.log('✅ 已点击发布');

  // Step 7: Wait for result
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    
    // Handle confirmations & close popups
    try { await page.click('button:has-text("确认")', { timeout: 500 }); console.log('✅ 确认'); } catch(e) {}
    try { await page.click('.semi-button-primary', { timeout: 300 }); } catch(e) {}
    try { await page.click('button:has-text("我知道了")', { timeout: 300 }); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 200 }); } catch(e) {}
    try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
    
    if (createResult) {
      console.log('🎉 API返回:', createResult.substring(0, 500));
      if (createResult.includes('"status_code":0') || createResult.includes('"aweme_id"')) {
        console.log('🎉🎉🎉 发布成功！！！');
      } else {
        console.log('⚠️ 发布可能失败');
      }
      break;
    }
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    if (bodyText.includes('发布成功') || bodyText.includes('审核中')) {
      console.log('🎉🎉🎉 发布成功！');
      break;
    }
    if (bodyText.includes('扫码登录')) {
      console.log('❌ 被踢回登录页');
      break;
    }
  }

  await page.screenshot({ path: '/home/z/my-project/heartbeat_result.png' });
  console.log('DONE');
  await browser.close();
})().catch(e => { console.log('ERROR:', e.message); });
