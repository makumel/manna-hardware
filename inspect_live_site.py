from playwright.sync_api import sync_playwright

def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ]
        )
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()

        print("Navigating to https://manna.mikabiz.space/ ...")
        page.goto("https://manna.mikabiz.space/", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)

        # 1. Top Section
        page.screenshot(path="manna_live_hero.png")
        print("Captured manna_live_hero.png")

        # 2. Scroll Section 2
        page.evaluate("window.scrollBy(0, 800)")
        page.wait_for_timeout(1000)
        page.screenshot(path="manna_live_paints_fasteners.png")
        print("Captured manna_live_paints_fasteners.png")

        # 3. Scroll Section 3
        page.evaluate("window.scrollBy(0, 800)")
        page.wait_for_timeout(1000)
        page.screenshot(path="manna_live_hardware_tools.png")
        print("Captured manna_live_hardware_tools.png")

        browser.close()

if __name__ == '__main__':
    inspect()
