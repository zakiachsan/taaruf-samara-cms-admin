import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        page = await context.new_page()
        
        network_errors = []
        console_errors = []
        
        def handle_response(resp):
            if resp.status >= 400:
                url = resp.url
                if 'user_profiles' in url or 'subscription_purchases' in url or 'referral' in url:
                    network_errors.append(f"[{resp.status}] {url[:150]}...")
        
        def handle_console(msg):
            if msg.type == 'error':
                text = msg.text
                console_errors.append(text)
                if '400' in text or 'Bad Request' in text:
                    print(f"  [CONSOLE ERROR] {text[:200]}")
        
        page.on("response", handle_response)
        page.on("console", handle_console)
        
        print("[1] Login...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        
        menus = [
            ("/admin/users", "Users"),
            ("/admin/premium", "Premium"),
            ("/admin/packages", "Packages"),
            ("/admin/addons", "Addons"),
            ("/admin/selfvalue", "SelfValue"),
            ("/admin/referral", "Referral"),
            ("/admin/banner", "Banners"),
            ("/admin/chats", "Chats"),
            ("/admin/pendampingan", "Pendampingan"),
            ("/admin/blocked", "Blocked"),
        ]
        
        for path, name in menus:
            print(f"\n[2] Navigate to {name}...")
            await page.goto(f"https://taarufsamara.com{path}", wait_until="networkidle")
            await page.wait_for_timeout(4000)
            
            # Check for stuck loading
            spinner = await page.query_selector('.animate-spin')
            has_table = await page.query_selector('table') is not None
            has_empty = await page.evaluate("() => document.body.innerText.includes('Belum ada') || document.body.innerText.includes('belum ada')")
            
            print(f"  spinner={spinner is not None}, table={has_table}, empty={has_empty}")
        
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Network errors (user_profiles/subscription_purchases/referral): {len(network_errors)}")
        for e in network_errors:
            print(f"  ! {e}")
        
        print(f"\nConsole errors: {len([e for e in console_errors if '400' in e or 'Bad Request' in e])}")
        
        await browser.close()

asyncio.run(test())
