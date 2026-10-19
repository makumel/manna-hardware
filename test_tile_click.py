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
    
    # Click the first tile <a> tag
    first_tile = page.locator("a").filter(has=page.locator("img")).filter(has_not=page.locator("text='Google'")).nth(1)
    print("Clicking first image tile...")
    first_tile.click()
    time.sleep(2)
    
    # Inspect what opened in the side preview or new element
    preview_info = page.evaluate("""
        () => {
            // Find all image elements on the page that have an http source
            const imgs = Array.from(document.querySelectorAll('img')).map(i => ({
                src: i.src,
                alt: i.alt,
                w: i.naturalWidth || i.width,
                h: i.naturalHeight || i.height,
                parentA: i.closest('a') ? i.closest('a').href : null
            })).filter(x => x.src && x.src.startsWith('http') && !x.src.includes('google.com/images/branding'));
            return imgs;
        }
    """)
    print("Preview images after click:", len(preview_info))
    for p_img in preview_info[:5]:
        print(f"  src: {p_img['src'][:80]} | w={p_img['w']} h={p_img['h']} | alt: {p_img['alt']}")
        
    browser.close()
