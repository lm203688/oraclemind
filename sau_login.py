import asyncio
from patchright.async_api import async_playwright
from pathlib import Path
import json

async def login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True, 
            executable_path="/tmp/chrome_extract/opt/google/chrome/chrome",
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context()
        page = await context.new_page()
        
        print("打开抖音创作者中心...")
        await page.goto("https://creator.douyin.com/", timeout=20000)
        await page.wait_for_timeout(5000)
        
        # Take screenshot
        await page.screenshot(path="/home/z/my-project/sau_qr.png")
        print("QR_READY")
        
        # Wait for QR scan (5 minutes)
        for i in range(60):
            await page.wait_for_timeout(5000)
            url = page.url
            if "creator-micro" in url or ("home" in url and "douyin" in url):
                print("SCANNED_OK")
                
                # Save cookies
                cookies = await context.cookies()
                cookie_file = Path("/home/z/my-project/social-auto-upload/cookies/douyin_uploader/gene_tech.json")
                cookie_file.parent.mkdir(parents=True, exist_ok=True)
                with open(cookie_file, "w") as f:
                    json.dump(cookies, f, ensure_ascii=False, indent=2)
                print(f"COOKIES_SAVED")
                
                await browser.close()
                return True
            if i % 6 == 0:
                print(f"WAITING {i*5}s")
        
        print("TIMEOUT")
        await browser.close()
        return False

result = asyncio.run(login())
print("Result:", result)
