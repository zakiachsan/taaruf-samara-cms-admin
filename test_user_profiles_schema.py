import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        page = await context.new_page()
        
        print("[1] Login...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        
        # Get one row from user_profiles to see columns
        print("\n[2] Query user_profiles columns...")
        result = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('user_profiles')
                    .select('*')
                    .limit(1)
                    .single()
                return { data, error, keys: data ? Object.keys(data) : [] }
            }
        """)
        print(f"  Columns: {result['keys']}")
        
        # Check if 'users' table exists and its columns
        print("\n[3] Query users table...")
        result2 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('users')
                    .select('*')
                    .limit(1)
                    .single()
                return { data, error, keys: data ? Object.keys(data) : [] }
            }
        """)
        print(f"  Columns: {result2['keys']}")
        if result2['error']:
            print(f"  Error: {result2['error']}")
        
        await browser.close()

asyncio.run(test())
