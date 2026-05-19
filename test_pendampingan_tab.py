import asyncio
from playwright.async_api import async_playwright

async def test_pendampingan():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        
        page = await context.new_page()
        
        # Capture ALL console logs
        all_logs = []
        def handle_console(msg):
            text = msg.text
            all_logs.append(f"[{msg.type}] {text}")
            # Print pendampingan-related logs immediately
            if 'pendampingan' in text.lower() or 'purchase' in text.lower() or 'user id' in text.lower():
                print(f"  [CONSOLE] {text}")
        
        page.on("console", handle_console)
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))
        
        # Capture network requests
        def handle_request(req):
            if 'purchase_addons' in req.url or 'subscription_purchases' in req.url:
                print(f"  [NETWORK] {req.method} {req.url[:120]}...")
        
        page.on("request", handle_request)
        
        print("[1] Login...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        
        # Navigate to Pendampingan directly (no tab switch)
        print("\n[2] Navigate to Pendampingan (fresh)...")
        await page.goto("https://taarufsamara.com/admin/pendampingan", wait_until="networkidle")
        await page.wait_for_timeout(5000)
        await page.screenshot(path="pend_01_fresh.png")
        
        content1 = await page.content()
        has_data_fresh = "Belum ada user" not in content1 and "Memuat" not in content1
        print(f"  Has data (fresh): {has_data_fresh}")
        
        # Open new tab
        print("\n[3] Opening new tab...")
        page2 = await context.new_page()
        await page2.goto("https://example.com", wait_until="networkidle")
        await page2.wait_for_timeout(3000)
        
        # Switch back
        print("\n[4] Switch back to CMS...")
        await page.bring_to_front()
        await page.wait_for_timeout(2000)
        
        # Navigate to Pendampingan again after tab switch
        print("\n[5] Navigate to Pendampingan (after tab switch)...")
        await page.goto("https://taarufsamara.com/admin/pendampingan", wait_until="networkidle")
        await page.wait_for_timeout(5000)
        await page.screenshot(path="pend_02_after_switch.png")
        
        content2 = await page.content()
        has_data_after = "Belum ada user" not in content2 and "Memuat" not in content2
        print(f"  Has data (after switch): {has_data_after}")
        
        # Try clicking sidebar link instead of direct goto
        print("\n[6] Click Pendampingan from sidebar...")
        await page.goto("https://taarufsamara.com/admin/users", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        pend_link = await page.query_selector('a[href="/admin/pendampingan"]')
        if pend_link:
            await pend_link.click()
        else:
            await page.goto("https://taarufsamara.com/admin/pendampingan", wait_until="networkidle")
        
        await page.wait_for_timeout(5000)
        await page.screenshot(path="pend_03_sidebar_click.png")
        
        content3 = await page.content()
        has_data_sidebar = "Belum ada user" not in content3 and "Memuat" not in content3
        print(f"  Has data (sidebar click): {has_data_sidebar}")
        
        print("\n--- All Console Logs ---")
        for log in all_logs:
            print(log)
        
        await browser.close()

asyncio.run(test_pendampingan())
