import asyncio
from playwright.async_api import async_playwright

async def test_long_idle():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        
        page = await context.new_page()
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_logs.append(f"[PAGE_ERROR] {err}"))
        
        print("[1] Login...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        
        # Navigate to Users
        print("[2] Navigate to Users...")
        await page.click('a[href="/admin/users"]')
        await page.wait_for_timeout(4000)
        await page.screenshot(path="idle_01_users.png")
        
        # Idle 45 seconds in CMS tab
        print("[3] Idling 45s in CMS tab...")
        await page.wait_for_timeout(45000)
        
        # Open new tab and stay there
        print("[4] Opening new tab and idling 45s...")
        page2 = await context.new_page()
        await page2.goto("https://example.com", wait_until="networkidle")
        await page2.wait_for_timeout(45000)
        
        # Switch back to CMS
        print("[5] Switching back to CMS tab...")
        await page.bring_to_front()
        await page.wait_for_timeout(3000)
        await page.screenshot(path="idle_02_after_return.png")
        
        # Try navigate to Chats
        print("[6] Navigate to Chats...")
        await page.click('a[href="/admin/chats"]')
        await page.wait_for_timeout(6000)
        await page.screenshot(path="idle_03_chats.png")
        
        spinner = await page.query_selector('.animate-spin')
        table = await page.query_selector('table')
        print(f"    Chats - Spinner: {spinner is not None}, Table: {table is not None}")
        
        # Try navigate to Banners
        print("[7] Navigate to Banners...")
        await page.click('a[href="/admin/banner"]')
        await page.wait_for_timeout(6000)
        await page.screenshot(path="idle_04_banners.png")
        
        spinner = await page.query_selector('.animate-spin')
        table = await page.query_selector('table')
        print(f"    Banners - Spinner: {spinner is not None}, Table: {table is not None}")
        
        print("\n--- Console Logs ---")
        for log in console_logs[-30:]:
            print(log)
        
        await browser.close()

asyncio.run(test_long_idle())
