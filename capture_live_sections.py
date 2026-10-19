from playwright.sync_api import sync_playwright

def capture_sections():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ]
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 900})
        page.goto("https://manna.mikabiz.space/", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)

        # 1. Top Section
        page.screenshot(path="live_section1_top.png")

        # 2. Scroll down 900px
        page.evaluate("window.scrollBy(0, 850)")
        page.wait_for_timeout(1000)
        page.screenshot(path="live_section2_mid.png")

        # 3. Scroll down another 850px
        page.evaluate("window.scrollBy(0, 850)")
        page.wait_for_timeout(1000)
        page.screenshot(path="live_section3_hardware.png")

        # 4. Filter by Plumbing & Fixtures
        plumbing_btn = page.locator("button:has-text('Plumbing'), a:has-text('Plumbing'), div:has-text('Plumbing & Fixtures')").first
        if plumbing_btn.count() > 0:
            plumbing_btn.click()
            page.wait_for_timeout(1500)
            page.screenshot(path="live_section_plumbing.png")

        browser.close()
        print("Captured live sections 1, 2, 3 and plumbing")

if __name__ == '__main__':
    capture_sections()
