import asyncio
from playwright.async_api import async_playwright

async def test_tab_switch():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        
        # Listen to console logs
        console_logs = []
        def handle_console(msg):
            console_logs.append(f"[{msg.type}] {msg.text}")
        
        # Tab 1: CMS Admin
        page1 = await context.new_page()
        page1.on("console", handle_console)
        page1.on("pageerror", lambda err: console_logs.append(f"[PAGE_ERROR] {err}"))
        
        print("[1] Opening taarufsamara.com/admin...")
        await page1.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page1.wait_for_timeout(2500)
        await page1.screenshot(path="v2_01_login_page.png")
        
        # Login
        email_input = await page1.query_selector('input[type="email"]')
        if email_input:
            print("[2] Logging in...")
            await page1.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
            await page1.fill('input[type="password"]', '4dmin123!')
            await page1.click('button[type="submit"]')
            await page1.wait_for_timeout(5000)
            await page1.screenshot(path="v2_02_after_login.png")
        
        # Navigate to Dashboard
        print("[3] Checking dashboard...")
        await page1.wait_for_timeout(2000)
        await page1.screenshot(path="v2_03_dashboard.png")
        
        # Navigate to Users via sidebar
        print("[4] Clicking Users menu...")
        # Try multiple selectors for sidebar links
        users_link = await page1.query_selector('a[href="/admin/users"]') \
            or await page1.query_selector('text=Users') \
            or await page1.query_selector('a:has-text("Users")') \
            or await page1.query_selector('nav a:has-text("User")')
        
        if users_link:
            await users_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/users", wait_until="networkidle")
        
        await page1.wait_for_timeout(4000)
        await page1.screenshot(path="v2_04_users.png")
        
        # Check for stuck loading
        loading_spinner = await page1.query_selector('.animate-spin')
        users_table = await page1.query_selector('table')
        print(f"[4] Users page - loading spinner: {loading_spinner is not None}, table: {users_table is not None}")
        
        # Tab 2: Open unrelated site
        print("[5] Opening new tab...")
        page2 = await context.new_page()
        await page2.goto("https://example.com", wait_until="networkidle")
        await page2.wait_for_timeout(2000)
        
        # Switch back to CMS tab
        print("[6] Switching back to CMS tab...")
        await page1.bring_to_front()
        await page1.wait_for_timeout(2000)
        
        # Now navigate to Chats from sidebar
        print("[7] Clicking Chats menu after tab switch...")
        chats_link = await page1.query_selector('a[href="/admin/chats"]') \
            or await page1.query_selector('a:has-text("Chat")') \
            or await page1.query_selector('nav a:has-text("Chat")')
        
        if chats_link:
            await chats_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/chats", wait_until="networkidle")
        
        await page1.wait_for_timeout(4000)
        await page1.screenshot(path="v2_05_chats_after_switch.png")
        
        loading_spinner = await page1.query_selector('.animate-spin')
        chats_table = await page1.query_selector('table')
        print(f"[7] Chats page - loading spinner: {loading_spinner is not None}, table: {chats_table is not None}")
        
        # Check content for loading indicators
        content = await page1.content()
        has_loading = "memuat" in content.lower() or "loading" in content.lower()
        has_empty = "belum ada" in content.lower() or "no data" in content.lower()
        print(f"[7] Content has 'loading': {has_loading}, has 'empty': {has_empty}")
        
        # Navigate to Banners
        print("[8] Clicking Banners menu...")
        banner_link = await page1.query_selector('a[href="/admin/banner"]') \
            or await page1.query_selector('a:has-text("Banner")') \
            or await page1.query_selector('nav a:has-text("Banner")')
        
        if banner_link:
            await banner_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/banner", wait_until="networkidle")
        
        await page1.wait_for_timeout(4000)
        await page1.screenshot(path="v2_06_banners_after_switch.png")
        
        loading_spinner = await page1.query_selector('.animate-spin')
        banner_table = await page1.query_selector('table')
        print(f"[8] Banners page - loading spinner: {loading_spinner is not None}, table: {banner_table is not None}")
        
        # Now simulate browser tab switch using visibility API
        print("[9] Simulating tab visibility change...")
        await page1.evaluate("""
            Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
            document.dispatchEvent(new Event('visibilitychange'));
        """)
        await page1.wait_for_timeout(2000)
        await page1.evaluate("""
            Object.defineProperty(document, 'visibilityState', {value: 'visible', writable: true});
            document.dispatchEvent(new Event('visibilitychange'));
        """)
        await page1.wait_for_timeout(2000)
        
        # Navigate to Self Value
        print("[10] Clicking Self Value menu after visibility change...")
        sv_link = await page1.query_selector('a[href="/admin/selfvalue"]') \
            or await page1.query_selector('a:has-text("Self")') \
            or await page1.query_selector('nav a:has-text("Self")')
        
        if sv_link:
            await sv_link.click()
        else:
            await page1.goto("https://taarufsamara.com/admin/selfvalue", wait_until="networkidle")
        
        await page1.wait_for_timeout(4000)
        await page1.screenshot(path="v2_07_selfvalue_after_visibility.png")
        
        loading_spinner = await page1.query_selector('.animate-spin')
        sv_table = await page1.query_selector('table')
        print(f"[10] SelfValue page - loading spinner: {loading_spinner is not None}, table: {sv_table is not None}")
        
        print("\n--- Console Logs ---")
        for log in console_logs[-20:]:
            print(log)
        
        await browser.close()

asyncio.run(test_tab_switch())
