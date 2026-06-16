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

  // Step 1: Visit home first to initialize session (THIS IS KEY!)
  console.log('1. 初始化会话...');
  await page.goto('https://creator.douyin.com/creator-micro/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Verify login
  const login = await page.evaluate(async () => {
    const r = await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' });
    return await r.json();
  });
  console.log('登录:', login.status_code === 0 ? '✅' : '❌ ' + login.status_code);
  if (login.status_code !== 0) { await browser.close(); return; }

  // Step 2: Navigate to publish page
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
  if (!videoInput) { console.log('❌ 没找到上传框'); await browser.close(); return; }
  await videoInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
  await page.evaluate(() => {
    const inp = document.querySelector('input[accept*="video"]');
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Step 4: Wait for upload WITH HEARTBEAT
  console.log('4. 等待上传（带心跳）...');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    
    // Heartbeat every 30s to keep session alive
    if (i % 6 === 0) {
      try {
        const hb = await page.evaluate(async () => {
          const r = await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' });
          return await r.json();
        });
        console.log('  ❤️ 心跳:', hb.status_code === 0 ? 'ok' : 'EXPIRED!');
        if (hb.status_code !== 0) {
          console.log('❌ Session expired during upload!');
          await browser.close();
          return;
        }
      } catch(e) { console.log('  ❤️ 心跳: error', e.message.substring(0, 50)); }
    }
    
    if (await page.$('video')) { console.log('✅ 上传完成'); break; }
    if (i === 29) { console.log('❌ 超时'); await browser.close(); return; }
  }

  // Step 5: Fill info FAST
  console.log('5. 填写信息...');
  await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  const descEl = await page.$('div[contenteditable=true]');
  if (descEl) {
    await descEl.click();
    await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 10 });
  }
  console.log('✅ 已填写');

  await page.waitForTimeout(1000);

  // Step 6: Close ALL popups aggressively
  console.log('6. 关闭弹窗...');
  for (let i = 0; i < 15; i++) {
    let closed = false;
    try { await page.click('button:has-text("我知道了")', { timeout: 300 }); closed = true; } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 200 }); closed = true; } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 200 }); closed = true; } catch(e) {}
    try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
    await page.waitForTimeout(200);
    if (!closed && i > 2) break;
  }

  // Step 7: PUBLISH
  console.log('7. 发布！');
  await page.click('button.primary-cECiOJ');
  console.log('✅ 已点击发布');

  // Step 8: Wait for result - keep closing popups and checking
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    
    // Close popups that may block
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

  // If no API response yet, try once more
  if (!createResult) {
    console.log('8. 重试发布...');
    for (let i = 0; i < 5; i++) {
      try { await page.click('button:has-text("我知道了")', { timeout: 300 }); } catch(e) {}
      try { await page.click('.semi-modal-close', { timeout: 200 }); } catch(e) {}
      try { await page.evaluate(() => { document.querySelectorAll('.semi-portal').forEach(el => el.remove()); }); } catch(e) {}
      await page.waitForTimeout(200);
    }
    try { await page.click('button.primary-cECiOJ'); console.log('🔄 重试点击发布'); } catch(e) {}
    await page.waitForTimeout(15000);
    if (createResult) {
      console.log('🎉 重试API返回:', createResult.substring(0, 300));
    }
  }

  await page.screenshot({ path: '/home/z/my-project/heartbeat_result.png' });
  console.log('DONE');
  await browser.close();
})().catch(e => { console.log('ERROR:', e.message); });
