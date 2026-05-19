import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://taarufsamara.com/admin", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        reqs = []
        def handle_req(req):
            if "PremiumManagement" in req.url:
                reqs.append(req.url)
        page.on("request", handle_req)
        await page.fill('input[type="email"]', 'taarufsamara2026@gmail.com')
        await page.fill('input[type="password"]', '4dmin123!')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(5000)
        await page.goto("https://taarufsamara.com/admin/premium", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        for r in reqs:
            print("Chunk:", r)
        await browser.close()

asyncio.run(test())
