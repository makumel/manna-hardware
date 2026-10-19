from playwright.sync_api import sync_playwright
import time

def test_google_search_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ]
        )
        context = browser.new_context()
        page = context.new_page()
        
        # Navigate to Google homepage
        page.goto("https://www.google.com", timeout=15000)
        
        # Type into search input
        search_box = page.locator("textarea[name='q'], input[name='q']").first
        search_box.fill("C-purlins Philippines")
        search_box.press("Enter")
        page.wait_for_load_state("domcontentloaded")
        print("Search results Title:", page.title())
        print("Search results URL:", page.url)
        
        # Now click on "Images" tab
        images_tab = page.locator("a:has-text('Images'), a:has-text('Mga Larawan')").first
        if images_tab.count() > 0:
            print("Found Images tab! Clicking...")
            images_tab.click()
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2)
            print("Images page Title:", page.title())
            print("Images page URL:", page.url)
            
            # Extract image elements
            imgs = page.evaluate("""
                () => {
                    return Array.from(document.querySelectorAll('div[data-ri] img, div[role="listitem"] img, img[data-src], img[src*="http"]'))
                        .map(i => ({
                            src: i.src || i.getAttribute('data-src'),
                            alt: i.alt
                        })).filter(x => x.src && !x.src.includes('google.com/images/branding'));
                }
            """)
            print(f"Extracted {len(imgs)} Google Images!")
            for i, im in enumerate(imgs[:5]):
                print(f"  [{i}] {im['src'][:70]}... | {im['alt']}")
        else:
            print("Images tab not found, trying direct udm=2 navigation with current cookies...")
            page.goto(page.url + "&udm=2")
            print("URL with udm=2:", page.url)
            
        browser.close()

if __name__ == '__main__':
    test_google_search_flow()
