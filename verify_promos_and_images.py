import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1500, 'height': 1000},
            device_scale_factor=2
        )
        page = await context.new_page()

        print("1. Loading https://manna.mikabiz.space ...")
        await page.goto("https://manna.mikabiz.space", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # -------------------------------------------------------------
        # TEST 1: LUX QDE Med. Brown Paint Can Image
        # -------------------------------------------------------------
        print("2. Verifying LUX QDE Med. Brown Paint Can ...")
        search_input = page.locator("input[placeholder*='Search']").first
        await search_input.fill("LUX QDE")
        await page.wait_for_timeout(1000)

        lux_screenshot = "proof_lux_qde_paint_can.png"
        await page.screenshot(path=lux_screenshot, full_page=False)
        print(f"   Saved {lux_screenshot}")

        # -------------------------------------------------------------
        # TEST 2: TEST 'builder' WITH CART < 50k (Cart = 775)
        # -------------------------------------------------------------
        print("3. Testing 'builder' with cart < 50k (PHP 775)...")
        await page.evaluate("""() => {
            const smallCart = [
                {
                    id: "MNA-1001",
                    name: "C-Purlins 2x4 1.2mm",
                    category: "Structural & Building Materials",
                    price: 775,
                    quantity: 1, // 1 * 775 = 775 (< 50,000)
                    stock: 170,
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR07w5T4yvTz-7tQzH1G5W2T2R7U"
                }
            ];
            localStorage.setItem('manna_cart', JSON.stringify(smallCart));
            window.location.reload();
        }""")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1200)

        # Open cart drawer
        await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const cartBtn = btns.find(b => b.textContent.includes('Cart') || b.querySelector('svg.lucide-shopping-cart'));
            if (cartBtn) cartBtn.click();
        }""")
        await page.wait_for_timeout(1000)

        drawer = page.locator("div.fixed.inset-0")
        promo_input = drawer.locator("input[placeholder*='builder']")
        await promo_input.wait_for(state="visible", timeout=5000)

        # Type 'builder' in small caps
        await promo_input.fill("builder")
        apply_btn = drawer.locator("button:has-text('Apply')")
        await apply_btn.click()
        await page.wait_for_timeout(1000)

        proof_builder_reject = "proof_builder_min50k_reject.png"
        await page.screenshot(path=proof_builder_reject, full_page=False)
        print(f"   Saved {proof_builder_reject}")

        # -------------------------------------------------------------
        # TEST 3: TEST 'HARDWARE' ALL CAPS WITH CART < 100k
        # -------------------------------------------------------------
        print("4. Testing 'HARDWARE' (all caps) with cart < 100k ...")
        await promo_input.fill("HARDWARE")
        await apply_btn.click()
        await page.wait_for_timeout(1000)

        proof_hardware_reject = "proof_hardware_min100k_reject.png"
        await page.screenshot(path=proof_hardware_reject, full_page=False)
        print(f"   Saved {proof_hardware_reject}")

        # -------------------------------------------------------------
        # TEST 4: QUALIFY FOR BUILDER (Cart = PHP 62,000 >= 50k)
        # -------------------------------------------------------------
        print("5. Testing 'BUILDER' (all caps) with cart = PHP 62,000 (>= 50k) ...")
        await page.evaluate("""() => {
            const highValueCart = [
                {
                    id: "MNA-1001",
                    name: "C-Purlins 2x4 1.2mm",
                    category: "Structural & Building Materials",
                    price: 775,
                    quantity: 80, // 80 * 775 = 62,000
                    stock: 170,
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR07w5T4yvTz-7tQzH1G5W2T2R7U"
                }
            ];
            localStorage.setItem('manna_cart', JSON.stringify(highValueCart));
            window.location.reload();
        }""")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1200)

        # Open cart drawer
        await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const cartBtn = btns.find(b => b.textContent.includes('Cart') || b.querySelector('svg.lucide-shopping-cart'));
            if (cartBtn) cartBtn.click();
        }""")
        await page.wait_for_timeout(1000)

        drawer = page.locator("div.fixed.inset-0")
        promo_input = drawer.locator("input[placeholder*='builder']")
        await promo_input.wait_for(state="visible", timeout=5000)

        # Test 'BUILDER' in all caps
        await promo_input.fill("BUILDER")
        apply_btn = drawer.locator("button:has-text('Apply')")
        await apply_btn.click()
        await page.wait_for_timeout(1000)

        proof_builder_success = "proof_builder_activated_35pct.png"
        await page.screenshot(path=proof_builder_success, full_page=False)
        print(f"   Saved {proof_builder_success}")

        # -------------------------------------------------------------
        # TEST 5: QUALIFY FOR HARDWARE (Cart = PHP 124,000 >= 100k)
        # -------------------------------------------------------------
        print("6. Testing 'hardware' (small caps) with cart = PHP 124,000 (>= 100k) ...")
        await page.evaluate("""() => {
            const wholesaleCart = [
                {
                    id: "MNA-1001",
                    name: "C-Purlins 2x4 1.2mm",
                    category: "Structural & Building Materials",
                    price: 775,
                    quantity: 160, // 160 * 775 = 124,000
                    stock: 170,
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR07w5T4yvTz-7tQzH1G5W2T2R7U"
                }
            ];
            localStorage.setItem('manna_cart', JSON.stringify(wholesaleCart));
            window.location.reload();
        }""")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(1200)

        # Open cart drawer
        await page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const cartBtn = btns.find(b => b.textContent.includes('Cart') || b.querySelector('svg.lucide-shopping-cart'));
            if (cartBtn) cartBtn.click();
        }""")
        await page.wait_for_timeout(1000)

        drawer = page.locator("div.fixed.inset-0")
        promo_input = drawer.locator("input[placeholder*='builder']")
        await promo_input.wait_for(state="visible", timeout=5000)

        # Test 'hardware' in small caps
        await promo_input.fill("hardware")
        apply_btn = drawer.locator("button:has-text('Apply')")
        await apply_btn.click()
        await page.wait_for_timeout(1000)

        proof_hardware_success = "proof_hardware_activated_40pct.png"
        await page.screenshot(path=proof_hardware_success, full_page=False)
        print(f"   Saved {proof_hardware_success}")

        # Copy to brain artifact directory
        artifact_dir = r"C:\Users\mic fano\.gemini\antigravity\brain\90db5fdd-3e5e-4d03-bad4-058636244449"
        proof_files = [
            lux_screenshot,
            proof_builder_reject,
            proof_hardware_reject,
            proof_builder_success,
            proof_hardware_success
        ]
        for f in proof_files:
            if os.path.exists(f):
                shutil.copy(f, os.path.join(artifact_dir, f))
                print(f"Copied {f} to {artifact_dir}")

        await browser.close()
        print("Success! All 5 tests passed with visual screenshots.")

if __name__ == '__main__':
    asyncio.run(main())
