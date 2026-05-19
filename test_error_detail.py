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
        
        # Test 1: user_profiles with email
        print("\n[2] user_profiles with email...")
        result = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('user_profiles')
                    .select('user_id, full_name, email')
                    .limit(1)
                return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null }
            }
        """)
        print(f"  Result: {result}")
        
        # Test 2: subscription_purchases with users join
        print("\n[3] subscription_purchases with users join...")
        result2 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('subscription_purchases')
                    .select('*, users:user_id(full_name, email)')
                    .limit(1)
                return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null }
            }
        """)
        print(f"  Result: {result2}")
        
        # Test 3: purchase_addons with subscription_purchases join
        print("\n[4] purchase_addons with subscription_purchases join...")
        result3 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('purchase_addons')
                    .select('*, subscription_purchases(user_id, expires_at)')
                    .limit(1)
                return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null }
            }
        """)
        print(f"  Result: {result3}")
        
        # Test 4: referrals with users join
        print("\n[5] referrals with users join...")
        result4 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('referrals')
                    .select('*, referrer:referrer_id(full_name, email)')
                    .limit(1)
                return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null }
            }
        """)
        print(f"  Result: {result4}")
        
        # Test 5: self_value_registrations with users join
        print("\n[6] self_value_registrations with users join...")
        result5 = await page.evaluate("""
            async () => {
                const { data, error } = await window.__supabaseAdminClient
                    .from('self_value_registrations')
                    .select('*, user:users!user_id(id, email, full_name)')
                    .limit(1)
                return { data, error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null }
            }
        """)
        print(f"  Result: {result5}")
        
        await browser.close()

asyncio.run(test())
