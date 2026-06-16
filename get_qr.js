const { chromium } = require('playwright');

(async () => {
  // Use the same user data dir as the running script
  // But we can't - persistent context locks the dir
  // Instead, let me kill the old script and start fresh with a better approach
  
  // Actually, let me just use the cropped image and enhance it
  // Or better: start a NEW browser, navigate to login, extract QR as base64
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
    viewport: { width: 1280, height: 800 }
  });
  
  await page.goto('https://creator.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(5000);
  
  // Find the QR code image element
  const qrSrc = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    for (const img of imgs) {
      if (img.src && (img.src.includes('qrcode') || img.src.includes('qr') || img.width > 100)) {
        return { src: img.src, width: img.width, height: img.height, alt: img.alt };
      }
    }
    // Also check canvas
    const canvases = document.querySelectorAll('canvas');
    for (const c of canvases) {
      return { canvas: true, width: c.width, height: c.height };
    }
    return null;
  });
  
  console.log('QR element:', JSON.stringify(qrSrc));
  
  if (qrSrc && qrSrc.src) {
    // Download the QR code image
    const resp = await page.goto(qrSrc.src, { timeout: 10000 });
    const buffer = await resp.body();
    require('fs').writeFileSync('/home/z/my-project/qr_direct.png', buffer);
    console.log('QR_DIRECT_SAVED');
  } else if (qrSrc && qrSrc.canvas) {
    // Screenshot the canvas
    const canvas = await page.$('canvas');
    if (canvas) {
      await canvas.screenshot({ path: '/home/z/my-project/qr_direct.png' });
      console.log('QR_CANVAS_SAVED');
    }
  }
  
  // Go back and take a high-quality screenshot of just the login area
  await page.goBack();
  await page.waitForTimeout(3000);
  
  // Find the login container and screenshot just that
  const loginBox = await page.$('[class*="login"]') || await page.$('[class*="Login"]');
  if (loginBox) {
    await loginBox.screenshot({ path: '/home/z/my-project/qr_loginbox.png' });
    console.log('LOGINBOX_SAVED');
  }
  
  await browser.close();
})().catch(e => { console.log('ERROR:', e.message); });
