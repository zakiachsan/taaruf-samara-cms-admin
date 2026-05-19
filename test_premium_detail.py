import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        page = await context.new_page()
        
        all_400s = []
        def handle_response(resp):
            if resp.status >= 400:
                all_400s.append(f"[{resp.status}] {resp.url}")
        
        page.on("response", handle_response)
        
        print("[1] Login...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        
        print("\n[2] Navigate to Premium...")
        await page.goto("https://taarufsamara.com/admin/premium", wait_until="networkidle")
        await page.wait_for_timeout(5000)
        
        print(f"\nAll 4xx/5xx requests ({len(all_400s)}):")
        for e in all_400s:
            print(f"  {e}")
        
        # Also check console
        logs = await page.evaluate("() => { const logs = []; const orig = console.error; console.error = (...args) => { logs.push(args.join(' ')); orig.apply(console, args); }; return logs; }")
        
        await browser.close()

asyncio.run(test())
