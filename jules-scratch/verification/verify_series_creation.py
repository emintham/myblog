
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:4321/admin/posts/create")

        # Fill in the title to enable the form
        await page.locator("#title").fill("Test Post")

        # Interact with the SeriesComponent
        series_input = page.locator("#series")
        await series_input.click()
        await series_input.type("A New Series")
        await page.keyboard.press("Enter")

        # Verify the new series is selected
        await expect(page.locator(".series-component-field .react-select__single-value")).to_have_text("A New Series")

        await page.screenshot(path="jules-scratch/verification/verification.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
