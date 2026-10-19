import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1600, 'height': 1100},
            device_scale_factor=2
        )
        page = await context.new_page()

        print("1. Navigating to https://manna.mikabiz.space ...")
        await page.goto("https://manna.mikabiz.space", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        print("2. Clicking 'Merchant Centre' button...")
        # Target the explicit Merchant Centre button in the top bar
        merchant_btn = page.locator("button:has-text('Merchant Centre')").first
        await merchant_btn.click()
        await page.wait_for_timeout(1000)

        # Check if the password input is displayed
        pw_input = page.locator("input[placeholder*='merchant password']")
        if await pw_input.count() > 0 and await pw_input.is_visible():
            print("3. Password gate detected. Typing asenso123...")
            await pw_input.fill("asenso123")
            await page.locator("button:has-text('Unlock Merchant Centre')").click()
            await page.wait_for_timeout(1500)
            print("   Unlocked successfully!")
        else:
            print("3. Password gate not shown (already unlocked or bypassed).")

        # Now click the 'Cost & Potential Report' subtab
        print("4. Clicking 'Cost & Potential Report' subtab...")
        report_btn = page.locator("button:has-text('Cost & Potential Report')")
        await report_btn.wait_for(state="visible", timeout=10000)
        await report_btn.click()
        await page.wait_for_timeout(2000)

        # Hide any floating fixed overlays at bottom if any
        await page.evaluate("""() => {
            const bottoms = document.querySelectorAll('.fixed.bottom-0');
            bottoms.forEach(b => b.style.display = 'none');
        }""")

        # 5. Capture main dashboard view
        output_1 = "proof_owner_inventory_report.png"
        await page.screenshot(path=output_1, full_page=False)
        print(f"5. Screenshot captured: {output_1}")

        # 6. Scroll down to show the spreadsheet table
        print("6. Scrolling table into view...")
        table = page.locator("table").first
        if await table.count() > 0:
            await table.scroll_into_view_if_needed()
            await page.wait_for_timeout(1000)
            output_2 = "proof_owner_table_detail.png"
            await page.screenshot(path=output_2, full_page=False)
            print(f"   Table detail screenshot captured: {output_2}")

        # 7. Full page screenshot
        output_full = "proof_owner_full_page.png"
        await page.screenshot(path=output_full, full_page=True)
        print(f"7. Full page screenshot captured: {output_full}")

        # 8. Copy to brain artifact directory
        artifact_dir = r"C:\Users\mic fano\.gemini\antigravity\brain\90db5fdd-3e5e-4d03-bad4-058636244449"
        if os.path.exists(artifact_dir):
            shutil.copy(output_1, os.path.join(artifact_dir, "proof_owner_inventory_report.png"))
            if os.path.exists("proof_owner_table_detail.png"):
                shutil.copy("proof_owner_table_detail.png", os.path.join(artifact_dir, "proof_owner_table_detail.png"))
            if os.path.exists("proof_owner_full_page.png"):
                shutil.copy("proof_owner_full_page.png", os.path.join(artifact_dir, "proof_owner_full_page.png"))
            print(f"8. Successfully copied screenshots to {artifact_dir}")

        await browser.close()
        print("Done!")

if __name__ == '__main__':
    asyncio.run(main())
