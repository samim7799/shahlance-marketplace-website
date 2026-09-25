import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGEERROR: {err}"))
        
        await page.goto("https://bonus-verify-lock.preview.emergentagent.com/sms-marketplace", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        print("Clicking Services...")
        await page.click('button[data-testid="sms-nav-services"]')
        await page.wait_for_timeout(1000)
        
        state = await page.evaluate("""() => {
            return {
                servicesCount: document.querySelectorAll('[data-testid="sms-services-list"]').length,
                bodyHtmlSample: document.querySelector('main').innerHTML.substring(0, 300)
            };
        }""")
        print("STATE AFTER CLICK:", state)
        await page.screenshot(path="/tmp/sms_click_test.png")
        await browser.close()

asyncio.run(main())
