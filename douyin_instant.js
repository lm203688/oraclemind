const { chromium } = require('playwright');
const fs = require('fs');

// Read cookies from file (will be written by the launcher)
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

  // Step 1: Quick login check
  console.log('1. 验证登录...');
  await page.goto('https://creator.douyin.com/creator-micro/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);
  const login = await page.evaluate(async () => {
    const r = await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' });
    return await r.json();
  });
  if (login.status_code !== 0) {
    console.log('❌ 未登录:', login.status_code);
    await browser.close();
    return;
  }
  console.log('✅ 已登录');

  // Step 2: Go to publish page
  console.log('2. 打开发布页...');
  await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  // Close popups
  try { await page.click('button:has-text("我知道了")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("放弃")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('.semi-modal-close', { timeout: 1000 }); } catch(e) {}
  await page.waitForTimeout(2000);

  // Step 3: Upload video
  console.log('3. 上传视频...');
  const videoInput = await page.$('input[accept*="video"]');
  if (!videoInput) {
    console.log('❌ 没找到上传框');
    await browser.close();
    return;
  }
  await videoInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
  await page.evaluate(() => {
    const inp = document.querySelector('input[accept*="video"]');
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Step 4: Wait for upload
  console.log('4. 等待上传...');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    if (await page.$('video')) { console.log('✅ 上传完成'); break; }
    if (i === 29) { console.log('❌ 上传超时'); await browser.close(); return; }
  }

  // Step 5: Fill title and description
  console.log('5. 填写信息...');
  await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  const descEl = await page.$('div[contenteditable=true]');
  if (descEl) {
    await descEl.click();
    await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 30 });
  }
  console.log('✅ 信息已填写');

  await page.waitForTimeout(3000);

  // Step 6: Close ALL popups aggressively (this was the failure point before)
  console.log('6. 关闭弹窗...');
  for (let i = 0; i < 20; i++) {
    let closed = false;
    try { await page.click('button:has-text("我知道了")', { timeout: 500 }); closed = true; console.log('  关:我知道了'); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('[class*="modal"] [class*="close"]', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('[class*="semi-portal"] [class*="close"]', { timeout: 300 }); closed = true; } catch(e) {}
    // Remove overlay portals
    try { await page.evaluate(() => { 
      document.querySelectorAll('.semi-portal').forEach(el => el.remove());
      document.querySelectorAll('.semi-modal-mask').forEach(el => el.remove());
    }); } catch(e) {}
    await page.waitForTimeout(500);
    if (!closed && i > 3) break;
  }

  // Take screenshot to verify state before publishing
  await page.screenshot({ path: '/home/z/my-project/pre_publish.png' });
  console.log('7. 截图已保存，准备发布...');

  // Step 7: Click publish
  try {
    await page.click('button.primary-cECiOJ');
    console.log('✅ 已点击发布');
  } catch(e) {
    // Try alternative
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      if (text.includes('发布')) {
        await btn.click();
        console.log('✅ 点击发布:', text.trim());
        break;
      }
    }
  }

  // Step 8: Wait for result
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(3000);
    
    // Handle confirmation dialogs
    try { await page.click('button:has-text("确认")', { timeout: 1000 }); console.log('✅ 确认'); } catch(e) {}
    try { await page.click('.semi-button-primary', { timeout: 500 }); } catch(e) {}
    // Close more popups that may appear
    try { await page.click('button:has-text("我知道了")', { timeout: 500 }); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 300 }); } catch(e) {}
    
    if (createResult) {
      console.log('🎉 API返回:', createResult.substring(0, 500));
      if (createResult.includes('"status_code":0') || createResult.includes('"aweme_id"')) {
        console.log('🎉🎉🎉 发布成功！');
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
  }

  if (!createResult) {
    console.log('⚠️ 未捕获到API响应，可能弹窗挡住了');
    // Try once more after closing all popups
    for (let i = 0; i < 5; i++) {
      try { await page.click('button:has-text("我知道了")', { timeout: 500 }); } catch(e) {}
      try { await page.click('.semi-modal-close', { timeout: 300 }); } catch(e) {}
      try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
      await page.waitForTimeout(300);
    }
    try { await page.click('button.primary-cECiOJ'); console.log('🔄 重试发布'); } catch(e) {}
    await page.waitForTimeout(15000);
    if (createResult) {
      console.log('🎉 重试API返回:', createResult.substring(0, 300));
    }
  }

  await page.screenshot({ path: '/home/z/my-project/post_publish.png' });
  console.log('DONE');
  await browser.close();
})().catch(e => { console.log('ERROR:', e.message); });
