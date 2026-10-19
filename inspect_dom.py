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
    
    # Click the first image result thumbnail to open the side preview panel (which contains the full-res image URL!)
    # Let's inspect what elements exist around the images
    sample = page.evaluate("""
        () => {
            const el = document.querySelector('h3, [data-lpage], [jsname="DeqBbe"], [jscontroller]');
            const allA = Array.from(document.querySelectorAll('a')).map(a => ({
                href: a.href,
                text: a.innerText.slice(0, 30),
                jsname: a.getAttribute('jsname')
            })).filter(x => x.href && !x.href.includes('google.com/search') && !x.href.includes('google.com/webhp')).slice(0, 10);
            return { allA };
        }
    """)
    print("Links in search results:", sample['allA'])
    browser.close()
