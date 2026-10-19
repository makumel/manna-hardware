from playwright.sync_api import sync_playwright
import time

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
    page.goto("https://www.google.com", timeout=15000)
    search_box = page.locator("textarea[name='q'], input[name='q']").first
    search_box.fill("Island Paint QDE Nile Green Philippines")
    search_box.press("Enter")
    page.wait_for_load_state("domcontentloaded")
    
    images_tab = page.locator("a:has-text('Images'), a:has-text('Mga Larawan')").first
    images_tab.click()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(2)
    
    # Let's inspect the clickable result tiles
    tiles = page.evaluate("""
        () => {
            // In Google Images with udm=2, search items are inside div[jsname] with role="listitem" or clickable cards
            const clickable = Array.from(document.querySelectorAll('div[data-ri], div[jsname="N5sDrc"], [jsname="DeqBbe"], div[jscontroller] a, div[role="listitem"]'));
            return clickable.map(el => ({
                tag: el.tagName,
                jsname: el.getAttribute('jsname'),
                role: el.getAttribute('role'),
                className: el.className,
                rect: el.getBoundingClientRect(),
                hasImg: !!el.querySelector('img')
            })).filter(x => x.hasImg && x.rect.width > 30).slice(0, 10);
        }
    """)
    print("Clickable tiles with images:", len(tiles))
    for t in tiles[:5]:
        print(t)
        
    browser.close()
