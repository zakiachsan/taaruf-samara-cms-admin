import asyncio
from playwright.async_api import async_playwright

async def test_network():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        
        page = await context.new_page()
        
        network_logs = []
        def handle_response(response):
            status = response.status
            url = response.url
            if status >= 400:
                network_logs.append(f"[{status}] {url}")
        
        page.on("response", handle_response)
        
        print("[1] Opening taarufsamara.com/admin...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2500)
        
        # Check service workers
        sw = await page.evaluate("() => navigator.serviceWorker?.controller?.scriptURL || 'none'")
        print(f"[SW] Service Worker: {sw}")
        
        # Login
        email_input = await page.query_selector('input[type="email"]')
        if email_input:
            print("[2] Logging in...")
            await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
            await page.fill('input[type="password"]', '4dmin123!')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
        
        # Navigate through menus
        menus = ["/admin/users", "/admin/chats", "/admin/banner", "/admin/selfvalue"]
        for menu in menus:
            print(f"[3] Navigating to {menu}...")
            await page.goto(f"https://taarufsamara.com{menu}", wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            # Check for stuck loading
            spinner = await page.query_selector('.animate-spin')
            table = await page.query_selector('table')
            print(f"    Spinner: {spinner is not None}, Table: {table is not None}")
        
        print("\n--- Network Errors ---")
        for log in network_logs:
            print(log)
        
        await browser.close()

asyncio.run(test_network())
