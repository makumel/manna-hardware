from playwright.sync_api import sync_playwright

def test_search():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()
        page.goto('https://manna.mikabiz.space/', wait_until='networkidle')
        page.wait_for_timeout(2000)

        # Find search input
        search_input = page.locator('input').first
        
        # 1. Search Pylox
        search_input.fill('Pylox')
        page.wait_for_timeout(1000)
        page.screenshot(path='live_search_pylox.png')
        print("Saved live_search_pylox.png")

        # 2. Search Bosny
        search_input.fill('Bosny')
        page.wait_for_timeout(1000)
        page.screenshot(path='live_search_bosny.png')
        print("Saved live_search_bosny.png")

        # 3. Search Blind Rivets
        search_input.fill('Blind Rivets')
        page.wait_for_timeout(1000)
        page.screenshot(path='live_search_rivets.png')
        print("Saved live_search_rivets.png")

        browser.close()

if __name__ == '__main__':
    test_search()
