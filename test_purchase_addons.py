import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1366, 'height': 768})
        page = await context.new_page()
        
        logs = []
        page.on("console", lambda msg: logs.append(msg.text))
        
        print("[1] Login...")
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        
        # Run JS to query purchase_addons directly
        print("\n[2] Querying purchase_addons directly via supabaseAdmin...")
        result = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('purchase_addons')
                    .select('*')
                    .limit(10)
                return { data, error, count: data?.length || 0 }
            }
        """)
        print(f"  purchase_addons * (no filter): {result}")
        
        # Query with addon_name filter
        result2 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('purchase_addons')
                    .select('*')
                    .eq('addon_name', 'Premium Pendampingan')
                    .limit(10)
                return { data, error, count: data?.length || 0 }
            }
        """)
        print(f"  purchase_addons with filter: {result2}")
        
        # Query subscription_purchases
        result3 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('subscription_purchases')
                    .select('*')
                    .limit(10)
                return { data, error, count: data?.length || 0 }
            }
        """)
        print(f"  subscription_purchases: {result3}")
        
        # Query with embedded join
        result4 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('purchase_addons')
                    .select('*, subscription_purchases(user_id, expires_at)')
                    .eq('addon_name', 'Premium Pendampingan')
                    .limit(10)
                return { data, error, count: data?.length || 0, first: data?.[0] || null }
            }
        """)
        print(f"  with embedded join: {result4}")
        
        await browser.close()

asyncio.run(test())
