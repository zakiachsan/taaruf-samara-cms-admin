import asyncio
from playwright.async_api import async_playwright

async def test_tab_switch():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        
        # Tab 1: CMS Admin
        page1 = await context.new_page()
        print("[1] Opening taarufsamara.com/admin...")
        await page1.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page1.wait_for_timeout(2000)
        await page1.screenshot(path="tab_01_initial.png")
        
        # Login if login form exists
        email_input = await page1.query_selector('input[type="email"]')
        if email_input:
            print("[2] Login form detected, filling credentials...")
            await page1.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
            await page1.fill('input[type="password"]', '4dmin123!')
            await page1.click('button[type="submit"]')
            await page1.wait_for_timeout(4000)
            await page1.screenshot(path="tab_02_after_login.png")
        else:
            print("[2] No login form (already logged in or bypassed)")
        
        # Navigate to Users page
        print("[3] Navigating to Users...")
        # Try to find Users menu link
        users_link = await page1.query_selector('a[href="/admin/users"], a[href="./users"]')
        if users_link:
            await users_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/users", wait_until="networkidle")
        await page1.wait_for_timeout(3000)
        await page1.screenshot(path="tab_03_users_page.png")
        
        # Check if data loaded
        users_content = await page1.content()
        has_users_data = "user" in users_content.lower() and "loading" not in users_content.lower()
        print(f"[3] Users page has data: {has_users_data}")
        
        # Tab 2: Open new tab (google or anything)
        print("[4] Opening new tab (google.com)...")
        page2 = await context.new_page()
        await page2.goto("https://google.com", wait_until="networkidle")
        await page2.wait_for_timeout(2000)
        await page2.screenshot(path="tab_04_new_tab.png")
        
        # Switch back to tab 1
        print("[5] Switching back to CMS tab...")
        await page1.bring_to_front()
        await page1.wait_for_timeout(2000)
        await page1.screenshot(path="tab_05_back_to_cms.png")
        
        # Now navigate to another menu (e.g. Chats)
        print("[6] Navigating to Chats from switched-back tab...")
        chats_link = await page1.query_selector('a[href="/admin/chats"], a[href="./chats"]')
        if chats_link:
            await chats_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/chats", wait_until="networkidle")
        await page1.wait_for_timeout(3000)
        await page1.screenshot(path="tab_06_chats_page.png")
        
        chats_content = await page1.content()
        has_chats_data = "chat" in chats_content.lower()
        is_loading = "memuat" in chats_content.lower() or "loading" in chats_content.lower()
        print(f"[6] Chats page has data: {has_chats_data}, is_loading: {is_loading}")
        
        # Try navigate to another page (Banners)
        print("[7] Navigating to Banners...")
        banner_link = await page1.query_selector('a[href="/admin/banners"], a[href="./banners"]')
        if banner_link:
            await banner_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/banners", wait_until="networkidle")
        await page1.wait_for_timeout(3000)
        await page1.screenshot(path="tab_07_banners_page.png")
        
        banners_content = await page1.content()
        is_banner_loading = "memuat" in banners_content.lower() or "loading" in banners_content.lower()
        print(f"[7] Banners page is_loading: {is_banner_loading}")
        
        # Check console for errors
        print("[8] Checking console logs...")
        logs = await page1.evaluate("() => { return window.__console_logs || []; }")
        print(f"Console logs count: {len(logs)}")
        
        # Also check network requests for failures
        print("[9] Test complete. Check screenshots for visual evidence.")
        
        await browser.close()

asyncio.run(test_tab_switch())
