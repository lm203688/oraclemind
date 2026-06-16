const { chromium } = require('playwright');
const fs = require('fs');

const cookieStr = `hevc_supported=true; live_use_vvc=%22false%22; enter_pc_once=1; __druidClientInfo=JTdCJTIyY2xpZW50V2lkdGglMjIlM0EyOTglMkMlMjJjbGllbnRIZWlnaHQlMjIlM0EzNzYlMkMlMjJ3aWR0aCUyMiUzQTI5OCUyQyUyMmhlaWdodCUyMiUzQTM3NiUyQyUyMmRldmljZVBpeGVsUmF0aW8lMjIlM0ExLjUlMkMlMjJ1c2VyQWdlbnQlMjIlM0ElMjJNb3ppbGxhJTJGNS4wJTIwKFdpbmRvd3MlMjBOVCUyMDEwLjAlM0IlMjBXaW42NCUzQiUyMHg2NCklMjBBcHBsZVdlYktpdCUyRjUzNy4zNiUyMChLSFRNTCUyQyUyMGxpa2UlMjBHZWNrbyklMjBDaHJvbWUlMkYxMzcuMC4wLjAlMjBTYWZhcmklMkY1MzcuMzYlMjBFZGclMkYxMzcuMC4wLjAlMjIlN0Q=; SEARCH_RESULT_LIST_TYPE=%22single%22; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Afalse%2C%22volume%22%3A0.445%7D; UIFID_TEMP=4015c499a3bc1f891e3545aff6854b8d6b607a7d41f92affc21a7a75b0f3b1a1407acb8cf7239601772ed88581a1ec4ca6a0405acb97284cf9d9b411efea85d6bacddfb335737ef55af1d0196374a518; passport_csrf_token=d77a883f13ac23ac52276249283ac8c6; passport_csrf_token_default=d77a883f13ac23ac52276249283ac8c6; bd_ticket_guard_client_web_domain=2; passport_assist_user=CjzaKkUeMoeCSTVkUcKdm5FFkyMWC_y4x91XCN5SsluKQZHfrkQoWFaVSwMUxIfz0z6VGCitJGxeDTls_dIaSgo8AAAAAAAAAAAAAFBW7J4V_MkGjZ6Bq71GliZ7uss-u2idVLbvjD5AyKxzik-VSO3TGbA3dI-YZyXj2iZVENnQjw4Yia_WVCABIgEDb1W6EQ%3D%3D; _bd_ticket_crypt_cookie=024abb8fe19ca4f353a2813bfe0a40e2; __security_mc_1_s_sdk_sign_data_key_web_protect=5ebb20cb-4d6b-ad9e; __security_mc_1_s_sdk_cert_key=84cc3168-4ecf-a28f; __security_mc_1_s_sdk_crypt_sdk=2eaf4cb1-4db1-a374; __security_server_data_status=1; login_time=1776990483770; my_rd=2; is_support_rtm_web_ts=1; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1280%2C%5C%22screen_height%5C%22%3A800%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A12%2C%5C%22device_memory%5C%22%3A16%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A100%7D%22; SelfTabRedDotControl=%5B%7B%22id%22%3A%227629729295309244422%22%2C%22u%22%3A7%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227622975292999403546%22%2C%22u%22%3A11%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227519198993897752626%22%2C%22u%22%3A60%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227453082023570196492%22%2C%22u%22%3A62%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227546983872376408064%22%2C%22u%22%3A7%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227600779528826259483%22%2C%22u%22%3A2%2C%22c%22%3A0%7D%2C%7B%22id%22%3A%227580205461530478626%22%2C%22u%22%3A3%2C%22c%22%3A0%7D%5D; publish_badge_show_info=%220%2C0%2C0%2C1779154021814%22; FOLLOW_LIVE_POINT_INFO=%22MS4wLjABAAAAMLZuj-5pduXDinAl9Fly_uUieSkAvjzOUgBymJl01WM%2F1779206400000%2F0%2F1779154021925%2F0%22; strategyABtestKey=%221779154025.965%22; x-web-secsdk-uid=452fb3fe-87e9-4ab2-a9c3-4ec82e87c9a0; gfkadpd=2906,33638; _tea_utm_cache_2906=undefined; csrf_session_id=8701e510ad9ed0b38430012a1c9041d9; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCUDhWb09YM2Z0R3BONHpyb29QdENvbDMwaXZHejBOUlBOL2xlNEx5cHhaVHphaFFDNDFrdTNCaWRwK3dKb0crbXQ1cmVVOGtUd2JUNFNZS0ViTEttSzg9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ%3D%3D; passport_fe_beating_status=true; biz_trace_id=d576bd84; home_can_add_dy_2_desktop=%221%22; download_guide=%221%2F20260519%2F0%22; is_dash_user=1; bd_ticket_guard_client_data_v2=eyJyZWVfcHVibGljX2tleSI6IkJQOFZvT1gzZnRHcE40enJvb1B0Q29sMzBpdkd6ME5SUE4vbGU0THlweFpUemFoUUM0MWt1M0JpZHArd0pvRyttdDVyZVU4a1R3YlQ0U1lLRWJMS21LOD0iLCJ0c19zaWduIjoidHMuMi5jNWE1NjdmNDE1MjgwNzE2OGI0ZTcwNmI2NDRkMzY3MTkwMThlNjRjZmMxZTQzZjU0MGI1NmY4YzkxM2Q5NmJmYzRmYmU4N2QyMzE5Y2YwNTMxODYyNGNlZGExNDkxMWNhNDA2ZGVkYmViZWRkYjJlMzBmY2U4ZDRmYTAyNTc1ZCIsInJlcV9jb250ZW50Ijoic2VjX3RzIiwicmVxX3NpZ24iOiJZODRFaFJ3R01WSW5VRThWWEcvUC9ML1hKYTByU3pLRkdrRExvNUJ0aU9vPSIsInNlY190cyI6IiNHZFZhVWlOcDIzK2dYVDkwZ0xSWmVTQWxUV1FQTnNVanZqMlRYdVZIVk9DMUxwWTRjdEx3eWZ2Rm9HeDkifQ%3D%3D; IsDouyinActive=false`;

// Parse cookies
const cookies = cookieStr.split('; ').map(pair => {
  const idx = pair.indexOf('=');
  const name = pair.substring(0, idx);
  const value = pair.substring(idx + 1);
  return {
    name,
    value,
    domain: '.douyin.com',
    path: '/',
  };
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 Edg/137.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  // Add cookies
  await context.addCookies(cookies);
  
  const page = await context.newPage();
  
  // Navigate to creator center
  await page.goto('https://creator.douyin.com/creator-micro/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Check if logged in
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check login status via API
  const userInfo = await page.evaluate(async () => {
    try {
      const resp = await fetch('/aweme/v1/creator/pc/user/info/', { credentials: 'include' });
      return await resp.json();
    } catch(e) {
      return { error: e.message };
    }
  });
  console.log('User info status:', userInfo.status_code, userInfo.status_msg || '');
  
  if (userInfo.status_code === 0) {
    console.log('LOGGED IN! User:', JSON.stringify(userInfo.data?.user || {}).substring(0, 200));
  } else {
    console.log('NOT LOGGED IN - status:', userInfo.status_code);
  }
  
  await page.screenshot({ path: '/home/z/my-project/douyin_cookie_login.png' });
  
  await browser.close();
})();
