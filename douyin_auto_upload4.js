const { chromium } = require('playwright');

const cookieStr = `hevc_supported=true; live_use_vvc=%22false%22; enter_pc_once=1; __druidClientInfo=JTdCJTIyY2xpZW50V2lkdGglMjIlM0EyOTglMkMlMjJjbGllbnRIZWlnaHQlMjIlM0EzNzYlMkMlMjJ3aWR0aCUyMiUzQTI5OCUyQyUyMmhlaWdodCUyMiUzQTM3NiUyQyUyMmRldmljZVBpeGVsUmF0aW8lMjIlM0ExLjUlMkMlMjJ1c2VyQWdlbnQlMjIlM0ElMjJNb3ppbGxhJTJGNS4wJTIwKFdpbmRvd3MlMjBOVCUyMDEwLjAlM0IlMjFXaW42NCUzQiUyMHg2NCklMjBBcHBsZVdlYktpdCUyRjUzNy4zNiUyMChLSFRNTCUyQyUyMGxpa2UlMjBHZWNrbyklMjBDaHJvbWUlMkYxMzcuMC4wLjAlMjBTYWZhcmklMkY1MzcuMzYlMjBFZGclMkYxMzcuMC4wLjAlMjIlN0Q=; SEARCH_RESULT_LIST_TYPE=%22single%22; oc_login_type=LOGIN_PERSON; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Afalse%2C%22volume%22%3A0.445%7D; UIFID_TEMP=4015c499a3bc1f891e3545aff6854b8d6b607a7d41f92affc21a7a75b0f3b1a1407acb8cf7239601772ed88581a1ec4ca6a0405acb97284cf9d9b411efea85d6bacddfb335737ef55af1d0196374a518; passport_csrf_token=d77a883f13ac23ac52276249283ac8c6; passport_csrf_token_default=d77a883f13ac23ac52276249283ac8c6; bd_ticket_guard_client_web_domain=2; passport_mfa_token=CjVXoJgdDm22EPEaocUjPBsBITfIlgdUxKInkKFMFh%2FEMvAk1ozVvsjkyWlwAngrPBIGkhktxBpKCjwAAAAAAAAAAAAAUFbIfS1HGHhpNort9uRdwXnOT6eREkCmrgOanWQbF3Ve89xh8JDesw%2FyTL4qjp9hpicQstCPDhj2sdFsIAIiAQMNUjvK; d_ticket=125b3d5483de440fef802329a213fff56d764; passport_assist_user=CjzaKkUeMoeCSTVkUcKdm5FFkyMWC_y4x91XCN5SsluKQZHfrkQoWFaVSwMUxIfz0z6VGCitJGxeDTls_dIaSgo8AAAAAAAAAAAAAFBW7J4V_MkGjZ6Bq71GliZ7uss-u2idVLbvjD5AyKxzik-VSO3TGbA3dI-YZyXj2iZVENnQjw4Yia_WVCABIgEDb1W6EQ%3D%3D; n_mh=N53k6sUp5Y8uBSHUhGzw9DnM-EMplLvyCly1QYkFMwA; uid_tt=100b02f94026e4fc1191546705cf6ccd; uid_tt_ss=100b02f94026e4fc1191546705cf6ccd; sid_tt=639dd7520c87b43be97d81597f303b79; sessionid=639dd7520c87b43be97d81597f303b79; sessionid_ss=639dd7520c87b43be97d81597f303b79; is_staff_user=false; has_biz_token=false; _bd_ticket_crypt_cookie=024abb8fe19ca4f353a2813bfe0a40e2; __security_server_data_status=1; login_time=1776990483770; my_rd=2; is_support_rtm_web_ts=1; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1280%2C%5C%22screen_height%5C%22%3A800%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A12%2C%5C%22device_memory%5C%22%3A16%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A100%7D%22; SelfTabRedDotControl=%5B%7B%22id%22%3A%227629729295309244422%22%2C%22u%22%3A7%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227622975292999403546%22%2C%22u%22%3A11%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227519198993897752626%22%2C%22u%22%3A60%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227453082023570196492%22%2C%22u%22%3A62%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227546983872376408064%22%2C%22u%22%3A7%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227600779528826259483%22%2C%22u%22%3A2%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227580205461530478626%22%2C%22u%22%3A3%2C%22c%22%3A0%7D%5D; publish_badge_show_info=%220%2C0%2C0%2C1779154021814%22; FOLLOW_LIVE_POINT_INFO=%22MS4wLjABAAAAMLZuj-5pduXDinAl9Fly_uUieSkAvjzOUgBymJl01WM%2F1779206400000%2F0%2F1779154021925%2F0%22; strategyABtestKey=%221779154025.965%22; gd_random=eyJtYXRjaCI6ZmFsc2UsInBlcmNlbnQiOjAuNTc5OTk0MDU2MjI2OTU1fQ==.YHpEAUJpmc4zMQE1Rh2PySG0Qxtj4KccACt+02uNpMc=; x-web-secsdk-uid=452fb3fe-87e9-4ab2-a9c3-4ec82e87c9a0; gfkadpd=2906,33638; _tea_utm_cache_2906=undefined; csrf_session_id=8701e510ad9ed0b38430012a1c9041d9; sid_guard=639dd7520c87b43be97d81597f303b79%7C1779154041%7C5184000%7CSat%2C+18-Jul-2026+01%3A27%3A21+GMT; session_tlb_tag=sttt%7C15%7CY53XUgyHtDvpfYFZfzA7ef_________RuubyqqS7qMRxZtAEIB_r_tMvcOyQNKLAUXJe8L6Nyb8%3D; sid_ucp_v1=1.0.0-KDMzMjY3OTQ1M2EwYmUwOGM1NDAyMzY5NzczMTE4MjYxYjkyOGNmM2QKHwiVhJX13wEQ-fiu0AYY7zEgDDDj9M7IBTgHQPQHSAQaAmhsIiA2MzlkZDc1MjBjODdiNDNiZTk3ZDgxNTk3ZjMwM2I3OQ; ssid_ucp_v1=1.0.0-KDMzMjY3OTQ1M2EwYmUwOGM1NDAyMzY5NzczMTE4MjYxYjkyOGNmM2QKHwiVhJX13wEQ-fiu0AYY7zEgDDDj9M7IBTgHQPQHSAQaAmhsIiA2MzlkZDc1MjBjODdiNDNiZTk3ZDgxNTk3ZjMwM2I3OQ; biz_trace_id=d576bd84; home_can_add_dy_2_desktop=%221%22; download_guide=%221%2F20260519%2F0%22; is_dash_user=1; _tea_utm_cache_1128=undefined; IsDouyinActive=false; ttwid=1%7CpABDGS6Iw1oq5efRAeGl-XOyN8IYhC6JUDF9nMnI_hI%7C1779159449%7C6b13af7e75c2d9370c1664cbd4cba85ff8f8bf4bf4bbfb9b3d61458beba9ad98; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCUDhWb09YM2Z0R3BONHpyb29QdENvbDMwaXZHejBOUlBOL2xlNEx5cHhaVHphaFFDNDFrdTNCaWRwK3dKb0crbXQ1cmVVOGtUd2JUNFNZS0ViTEttSzg9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ%3D%3D; odin_tt=d35e1e6ba4c999f03ca54c4399201da2108b8db5501acdc307bf691ea3dbd5d7f72f2ddc0688a6bf487578870a13e1ed; __security_mc_1_s_sdk_crypt_sdk=648d3342-47cc-ae91; __security_mc_1_s_sdk_cert_key=474817c4-419e-b562; __security_mc_1_s_sdk_sign_data_key_web_protect=33757c00-4a8f-8d65; bd_ticket_guard_client_data_v2=eyJyZWVfcHVibGljX2tleSI6IkJQOFZvT1gzZnRHcE40enJvb1B0Q29sMzBpdkd6ME5SUE4vbGU0THlweFpUemFoUUM0MWt1M0JpZHArd0pvRyttdDVyZVU4a1R3YlQ0U1lLRWJMS21LOD0iLCJ0c19zaWduIjoidHMuMi5jNWE1NjdmNDE1MjgwNzE2OGI0ZTcwNmI2NDRkMzY3MTkwMThlNjRjZmMxZTQzZjU0MGI1NmY4YzkxM2Q5NmJmYzRmYmU4N2QyMzE5Y2YwNTMxODYyNGNlZGExNDkxMWNhNDA2ZGVkYmViZWRkYjJlMzBmY2U4ZDRmYTAyNTc1ZCIsInJlcV9jb250ZW50Ijoic2VjX3RzIiwicmVxX3NpZ24iOiJrV09ldzFpV1hyY3VsbklLaURZMWFlTkhENU90bzJrT2Q0MGE0OFQ1TzNjPSIsInNlY190cyI6IiNwVVRGZkh0eEx0L0cwcithd2RzZENUL1ZSdVRoZzRBT1ZKNnR2MHdjV1V4bXgxMGtsdGNiL09MTVVoMWoifQ%3D%3D; passport_fe_beating_status=false`;

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

  await page.goto('https://creator.douyin.com/creator-micro/content/publish/video/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  // Close popups
  try { await page.click('button:has-text("我知道了")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("继续编辑")', { timeout: 2000 }); } catch(e) {}
  try { await page.click('button:has-text("放弃")', { timeout: 2000 }); } catch(e) {}
  await page.waitForTimeout(1000);

  // Find all clickable upload elements
  const uploadElements = await page.evaluate(() => {
    const results = [];
    // Find all elements that might trigger file upload
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.textContent.includes('上传视频') || el.textContent.includes('点击上传') || el.textContent.includes('上传')) {
        const tag = el.tagName;
        const cls = el.className;
        const text = el.textContent.trim().substring(0, 50);
        const onclick = el.onclick ? 'has_onclick' : '';
        const cursor = getComputedStyle(el).cursor;
        if (cursor === 'pointer' || tag === 'BUTTON' || tag === 'A' || onclick) {
          results.push({ tag, cls: cls.substring(0, 80), text, cursor, onclick });
        }
      }
    }
    return results;
  });
  console.log('可点击的上传元素:', JSON.stringify(uploadElements, null, 2));

  // Try clicking the upload area/container which should trigger the file input
  console.log('\n尝试点击上传区域触发filechooser...');
  
  // The upload area is usually a div that when clicked triggers the hidden file input
  const uploadArea = await page.$('[class*=upload-container], [class*=upload-area], [class*=drag-upload]');
  if (uploadArea) {
    console.log('找到上传区域，点击...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }),
      uploadArea.click()
    ]);
    await fileChooser.setFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
    console.log('✅ 文件已选择');
  } else {
    // Try clicking the video file input's parent/label
    console.log('尝试直接点击video input...');
    const videoInput = await page.$('input[accept*="video"]');
    if (videoInput) {
      // Make it visible temporarily
      await page.evaluate(() => {
        const inp = document.querySelector('input[accept*="video"]');
        if (inp) { inp.style.display = 'block'; inp.style.opacity = '1'; inp.style.position = 'relative'; }
      });
      
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 10000 }),
        videoInput.click()
      ]);
      await fileChooser.setFiles('/home/z/my-project/gene_tech_video/gene_tech_v2_small.mp4');
      console.log('✅ 文件已通过input click选择');
    }
  }

  // Wait for upload
  console.log('等待视频上传...');
  await page.waitForTimeout(30000);
  await page.screenshot({ path: '/home/z/my-project/upload_final.png' });
  
  const hasVideo = await page.$('video');
  console.log('视频预览:', !!hasVideo);

  await browser.close();
})();
