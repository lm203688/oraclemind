const { chromium } = require('playwright');

const cookieStr = `hevc_supported=true; live_use_vvc=%22false%22; enter_pc_once=1; __druidClientInfo=JTdCJTIyY2xpZW50V2lkdGglMjIlM0EyOTglMkMlMjJjbGllbnRIZWlnaHQlMjIlM0EzNzYlMkMlMjJ3aWR0aCUyMiUzQTI5OCUyQyUyMmhlaWdodCUyMiUzQTM3NiUyQyUyMmRldmljZVBpeGVsUmF0aW8lMjIlM0ExLjUlMkMlMjJ1c2VyQWdlbnQlMjIlM0ElMjJNb3ppbGxhJTJGNS4wJTIwKFdpbmRvd3MlMjBOVCUyMDEwLjAlM0IlMjFXaW42NCUzQiUyMHg2NCklMjBBcHBsZVdlYktpdCUyRjUzNy4zNiUyMChLSFRNTCUyQyUyMGxpa2UlMjBHZWNrbyklMjBDaHJvbWUlMkYxMzcuMC4wLjAlMjBTYWZhcmklMkY1MzcuMzYlMjBFZGclMkYxMzcuMC4wLjAlMjIlN0Q=; SEARCH_RESULT_LIST_TYPE=%22single%22; oc_login_type=LOGIN_PERSON; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Afalse%2C%22volume%22%3A0.445%7D; UIFID_TEMP=4015c499a3bc1f891e3545aff6854b8d6b607a7d41f92affc21a7a75b0f3b1a1407acb8cf7239601772ed88581a1ec4ca6a0405acb97284cf9d9b411efea85d6bacddfb335737ef55af1d0196374a518; passport_csrf_token=d77a883f13ac23ac52276249283ac8c6; passport_csrf_token_default=d77a883f13ac23ac52276249283ac8c6; bd_ticket_guard_client_web_domain=2; passport_mfa_token=CjVXoJgdDm22EPEaocUjPBsBITfIlgdUxKInkKFMFh%2FEMvAk1ozVvsjkyWlwAngrPBIGkhktxBpKCjwAAAAAAAAAAAAAUFbIfS1HGHhpNort9uRdwXnOT6eREkCmrgOanWQbF3Ve89xh8JDesw%2FyTL4qjp9hpicQstCPDhj2sdFsIAIiAQMNUjvK; d_ticket=125b3d5483de440fef802329a213fff56d764; n_mh=N53k6sUp5Y8uBSHUhGzw9DnM-EMplLvyCly1QYkFMwA; is_staff_user=false; has_biz_token=false; __security_server_data_status=1; login_time=1776990483770; my_rd=2; is_support_rtm_web_ts=1; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1280%2C%5C%22screen_height%5C%22%3A800%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A12%2C%5C%22device_memory%5C%22%3A16%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A100%7D%22; SelfTabRedDotControl=%5B%7B%22id%22%3A%227629729295309244422%22%2C%22u%22%3A7%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227622975292999403546%22%2C%22u%22%3A11%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227519198993897752626%22%2C%22u%22%3A60%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227453082023570196492%22%2C%22u%22%3A62%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227546983872376408064%22%2C%22u%22%3A7%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227600779528826259483%22%2C%22u%22%3A2%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227580205461530478626%22%2C%22u%22%3A3%2C%22c%22%3A0%7D%5D; publish_badge_show_info=%220%2C0%2C0%2C1779154021814%22; FOLLOW_LIVE_POINT_INFO=%22MS4wLjABAAAAMLZuj-5pduXDinAl9Fly_uUieSkAvjzOUgBymJl01WM%2F1779206400000%2F0%2F1779154021925%2F0%22; strategyABtestKey=%221779154025.965%22; x-web-secsdk-uid=452fb3fe-87e9-4ab2-a9c3-4ec82e87c9a0; gfkadpd=2906,33638; _tea_utm_cache_2906=undefined; csrf_session_id=8701e510ad9ed0b38430012a1c9041d9; home_can_add_dy_2_desktop=%221%22; download_guide=%221%2F20260519%2F0%22; is_dash_user=1; _tea_utm_cache_1128=undefined; IsDouyinActive=false; gd_random=eyJtYXRjaCI6ZmFsc2UsInBlcmNlbnQiOjAuNTc5OTk0MDU2MjI2OTU1fQ==.YHpEAUJpmc4zMQE1Rh2PySG0Qxtj4KccACt+02uNpMc=; biz_trace_id=0c97b5b0; passport_assist_user=Cjztoqrt7wtkhqqgIYy2AXR2wJOylTSEzYHNe4fhkxKgAqxCSg_81S8C5hq9qEPeQArdfHe1Mdp0M1AzntcaSgo8AAAAAAAAAAAAAFBwOE8a3sOVtr8i-WLoI7bCWUO5dBEQgenqcGDi3MQ8yDo_SaAw5rrDeXOcEBSv8BDeELrtkQ4Yia_WVCABIgEDplvJiw%3D%3D; sid_guard=66640f8aad00df3a20707d02158aac22%7C1779162658%7C5184000%7CSat%2C+18-Jul-2026+03%3A50%3A58+GMT; uid_tt=764cbd53ebd5c6316a3dfdd5713aa3ed; uid_tt_ss=764cbd53ebd5c6316a3dfdd5713aa3ed; sid_tt=66640f8aad00df3a20707d02158aac22; sessionid=6640f8aad00df3a20707d02158aac22; sessionid_ss=6640f8aad00df3a20707d02158aac22; session_tlb_tag=sttt%7C19%7CZmQPiq0A3zogcH0CFYqsIv_________Ku-aciL7Ay9Aqo9OzfOYw3aw01j3F-RW0xyQFmq4M3JM%3D; sid_ucp_v1=1.0.0-KGNkZThhNzhhNDYyOTdiMjZlN2U3NDQ4Y2YwNmU1NjFiM2EyMjc4MzIKHwiVhJX13wEQoryv0AYY2hYgDDDj9M7IBTgHQPQHSAQaAmhsIiA2NjY0MGY4YWFkMDBkZjNhMjA3MDdkMDIxNThhYWMyMg; ssid_ucp_v1=1.0.0-KGNkZThhNzhhNDYyOTdiMjZlN2U3NDQ4Y2YwNmU1NjFiM2EyMjc4MzIKHwiVhJX13wEQoryv0AYY2hYgDDDj9M7IBTgHQPQHSAQaAmhsIiA2NjY0MGY4YWFkMDBkZjNhMjA3MDdkMDIxNThhYWMyMg; _bd_ticket_crypt_doamin=2; _bd_ticket_crypt_cookie=f9f6632e49dfac621046c30b85c23be7; ttwid=1%7CpABDGS6Iw1oq5efRAeGl-XOyN8IYhC6JUDF9nMnI_hI%7C1779163359%7C49870962537b74fa5a1bb0e62d7c04499772fe78bcc2f3e63da45426fd1c30a0; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCUDhWb09YM2Z0R3BONHpyb29QdENvbDMwaXZHejBOUlBOL2xlNEx5cHhaVHphaFFDNDFrdTNCaWRwK3dKb0crbXQ1cmVVOGtUd2JUNFNZS0ViTEttSzg9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ%3D%3D; odin_tt=8621e71aaaf8397f4e0828571d00a4b6e4e44e88d21d9274fb4723e157a58c3ac144257a189e2bfa3d36a7aef3387584; __security_mc_1_s_sdk_crypt_sdk=9fa119f0-4e73-a87c; __security_mc_1_s_sdk_cert_key=640009fc-459e-b169; __security_mc_1_s_sdk_sign_data_key_web_protect=0a29d7b2-462f-8da4; bd_ticket_guard_client_data_v2=eyJyZWVfcHVibGljX2tleSI6IkJQOFZvT1gzZnRHcE40enJvb1B0Q29sMzBpdkd6ME5SUE4vbGU0THlweFpUemFoUUM0MWt1M0JpZHArd0pvRyttdDVyZVU4a1R3YlQ0U1lLRWJMS21LOD0iLCJ0c19zaWduIjoidHMuMi5jMmI0Y2Q2MWY1YzFhYTllYmQyYjVhYmRhMTA3ZDJjMTBmMzFlN2VkMzQ1Mjk1Y2RhOGJkNDdmOThmMmM1ZGJiYzRmYmU4N2QyMzE5Y2YwNTMxODYyNGNlZGExNDkxMWNhNDA2ZGVkYmViZWRkYjJlMzBmY2U4ZDRmYTAyNTc1ZCIsInJlcV9jb250ZW50Ijoic2VjX3RzIiwicmVxX3NpZ24iOiJZNENEaDJlQXNpV21rQjVvWG4rdnAxTWVWdUFKNkJhYVFEbzg5eHR5UTA0PSIsInNlY190cyI6IiNWWnNwOHpwLzVYTHFudDZYbUJFVEExSGl0ZURKUDE0d3hkUUVqMFM1SUhWVmpSa0kveTljTEdXLzF4YTcifQ%3D%3D; passport_fe_beating_status=false`;

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

  // Quick login check
  await page.goto('https://creator.douyin.com/creator-micro/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);
  const login = await page.evaluate(async () => {
    const r = await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' });
    return await r.json();
  });
  console.log('登录:', login.status_code === 0 ? '✅' : '❌ ' + login.status_code);
  if (login.status_code !== 0) { await browser.close(); return; }

  // Go to upload page (same URL as the cURL)
  console.log('打开上传页...');
  await page.goto('https://creator.douyin.com/creator-micro/content/upload?default-tab=5', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  // Close popups
  try { await page.click('button:has-text("我知道了")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("放弃")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("继续编辑")', { timeout: 2000 }); } catch(e) {}
  await page.waitForTimeout(2000);

  // Check state
  const hasVideo = await page.$('video');
  const hasInput = await page.$('input[accept*="video"]');
  console.log('视频:', !!hasVideo, '输入框:', !!hasInput);

  if (hasVideo) {
    console.log('视频已存在，直接填写信息');
  } else if (hasInput) {
    console.log('上传视频...');
    await hasInput.setInputFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(5000);
      if (await page.$('video')) { console.log('✅ 上传完成'); break; }
    }
  } else {
    console.log('❌ 页面未加载');
    await page.screenshot({ path: '/home/z/my-project/debug3.png' });
    await browser.close();
    return;
  }

  // Fill info
  await page.fill('input[placeholder*="标题"]', '基因技术前沿速递｜2025年5月19日');
  const descEl = await page.$('div[contenteditable=true]');
  if (descEl) {
    await descEl.click();
    await page.keyboard.type('基因技术前沿速递｜2025年5月19日 #基因技术 #科技前沿 #基因编辑 #生物科技', { delay: 30 });
  }
  console.log('✅ 信息已填写');

  await page.waitForTimeout(3000);

  // Close popups aggressively
  for (let i = 0; i < 5; i++) {
    try { await page.click('button:has-text("我知道了")', { timeout: 500 }); } catch(e) {}
    try { await page.click('.semi-modal-close', { timeout: 500 }); } catch(e) {}
    try { await page.click('.semi-icon-close', { timeout: 500 }); } catch(e) {}
    await page.waitForTimeout(300);
  }

  // Click publish
  console.log('点击发布...');
  const publishBtn = await page.$('button.primary-cECiOJ');
  if (publishBtn) {
    await publishBtn.click();
    console.log('✅ 已点击发布');
  } else {
    // Try any primary button
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      if (text.includes('发布')) {
        await btn.click();
        console.log('✅ 点击发布按钮:', text);
        break;
      }
    }
  }

  // Wait for result
  let createResult = null;
  page.on('response', async res => {
    if (res.url().includes('aweme/create') || res.url().includes('media/aweme/create')) {
      try { createResult = await res.text(); } catch(e) {}
    }
  });

  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(3000);
    try { await page.click('button:has-text("确认")', { timeout: 1000 }); } catch(e) {}
    if (createResult) {
      console.log('🎉 API:', createResult.substring(0, 300));
      break;
    }
    const t = await page.evaluate(() => document.body.innerText.substring(0, 200));
    if (t.includes('发布成功') || t.includes('审核')) {
      console.log('🎉🎉🎉 发布成功！');
      break;
    }
  }

  await page.screenshot({ path: '/home/z/my-project/final_fast.png' });
  await browser.close();
})();
