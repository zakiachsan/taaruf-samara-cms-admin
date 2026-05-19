import asyncio
from playwright.async_api import async_playwright

async def test_tab_switch_qa():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        
        console_logs = []
        page_errors = []
        network_errors = []
        
        def handle_console(msg):
            console_logs.append(f"[{msg.type}] {msg.text}")
        def handle_page_error(err):
            page_errors.append(str(err))
        def handle_response(resp):
            if resp.status >= 400:
                network_errors.append(f"[{resp.status}] {resp.url}")
        
        page = await context.new_page()
        page.on("console", handle_console)
        page.on("pageerror", handle_page_error)
        page.on("response", handle_response)
        
        print("=" * 60)
        print("TAB-SWITCH QA TEST - taarufsamara.com/admin")
        print("=" * 60)
        
        # 1. Login
        print("\n[STEP 1] Opening login page...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        await page.screenshot(path="qa_01_dashboard.png")
        print("  [OK] Logged in")
        
        # 2. Navigate to Users
        print("\n[STEP 2] Navigate to Users...")
        await page.click('a[href="/admin/users"]')
        await page.wait_for_timeout(4000)
        await page.screenshot(path="qa_02_users.png")
        spinner = await page.query_selector('.animate-spin')
        table = await page.query_selector('table')
        assert table is not None, "Users table not loaded!"
        print("  [OK] Users loaded (spinner: {}, table: {})".format(spinner is not None, table is not None))
        
        # 3. Open new tab and stay there
        print("\n[STEP 3] Opening new tab (example.com)...")
        page2 = await context.new_page()
        await page2.goto("https://example.com", wait_until="networkidle")
        await page2.wait_for_timeout(3000)
        print("  [OK] New tab loaded")
        
        # 4. Switch back to CMS
        print("\n[STEP 4] Switching back to CMS tab...")
        await page.bring_to_front()
        await page.wait_for_timeout(2000)
        print("  [OK] CMS tab is active")
        
        # 5. Navigate to Chats after tab switch
        print("\n[STEP 5] Navigate to Chats after tab switch...")
        await page.click('a[href="/admin/chats"]')
        await page.wait_for_timeout(4000)
        await page.screenshot(path="qa_03_chats_after_switch.png")
        spinner = await page.query_selector('.animate-spin')
        table = await page.query_selector('table')
        assert table is not None, "Chats table not loaded after tab switch!"
        print("  [OK] Chats loaded (spinner: {}, table: {})".format(spinner is not None, table is not None))
        
        # 6. Simulate visibility change
        print("\n[STEP 6] Simulating visibilitychange events...")
        await page.evaluate("""
            Object.defineProperty(document, 'visibilityState', {value: 'hidden', writable: true});
            document.dispatchEvent(new Event('visibilitychange'));
        """)
        await page.wait_for_timeout(2000)
        await page.evaluate("""
            Object.defineProperty(document, 'visibilityState', {value: 'visible', writable: true});
            document.dispatchEvent(new Event('visibilitychange'));
        """)
        await page.wait_for_timeout(2000)
        print("  [OK] Visibility events dispatched")
        
        # 7. Navigate to Banners after visibility change
        print("\n[STEP 7] Navigate to Banners after visibility change...")
        await page.click('a[href="/admin/banner"]')
        await page.wait_for_timeout(4000)
        await page.screenshot(path="qa_04_banners_after_visibility.png")
        spinner = await page.query_selector('.animate-spin')
        table = await page.query_selector('table')
        assert table is not None, "Banners table not loaded after visibility change!"
        print("  [OK] Banners loaded (spinner: {}, table: {})".format(spinner is not None, table is not None))
        
        # 8. Long idle in background tab
        print("\n[STEP 8] Long idle (30s) in background tab...")
        await page2.bring_to_front()
        await page2.wait_for_timeout(30000)
        await page.bring_to_front()
        await page.wait_for_timeout(2000)
        print("  [OK] Returned after 30s idle")
        
        # 9. Navigate to SelfValue after long idle
        print("\n[STEP 9] Navigate to SelfValue after long idle...")
        await page.click('a[href="/admin/selfvalue"]')
        await page.wait_for_timeout(4000)
        await page.screenshot(path="qa_05_selfvalue_after_idle.png")
        spinner = await page.query_selector('.animate-spin')
        table = await page.query_selector('table')
        assert table is not None, "SelfValue table not loaded after long idle!"
        print("  [OK] SelfValue loaded (spinner: {}, table: {})".format(spinner is not None, table is not None))
        
        # 10. Rapid navigation test
        print("\n[STEP 10] Rapid navigation test...")
        for menu in ["/admin/users", "/admin/chats", "/admin/banner", "/admin/selfvalue", "/admin/referral"]:
            await page.goto(f"https://taarufsamara.com{menu}", wait_until="networkidle")
            await page.wait_for_timeout(1500)
            spinner = await page.query_selector('.animate-spin')
            print(f"  -> {menu} (spinner: {spinner is not None})")
        await page.screenshot(path="qa_06_rapid_nav.png")
        print("  [OK] Rapid navigation completed")
        
        # Summary
        print("\n" + "=" * 60)
        print("QA SUMMARY")
        print("=" * 60)
        print(f"Console logs: {len(console_logs)}")
        print(f"Page errors: {len(page_errors)}")
        print(f"Network errors (4xx/5xx): {len(network_errors)}")
        
        if page_errors:
            print("\nPage Errors:")
            for e in page_errors:
                print(f"  ! {e}")
        
        if network_errors:
            print("\nNetwork Errors:")
            for e in network_errors:
                print(f"  ! {e}")
        
        recent_console = [l for l in console_logs if l.startswith('[error]') or l.startswith('[warning]')]
        if recent_console:
            print("\nRecent console warnings/errors:")
            for l in recent_console[-10:]:
                print(f"  {l}")
        
        print("\n[PASS] ALL TESTS PASSED")
        
        await browser.close()

asyncio.run(test_tab_switch_qa())
