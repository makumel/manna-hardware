from playwright.sync_api import sync_playwright
import urllib.parse

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
        ]
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        viewport={"width": 1366, "height": 768},
        locale="en-US",
        timezone_id="Asia/Manila"
    )
    # inject stealth scripts
    context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """)
    page = context.new_page()
    url = f"https://www.google.com/search?q={urllib.parse.quote('C-purlins Philippines')}&udm=2"
    page.goto(url, wait_until="networkidle", timeout=20000)
    print("Page title:", page.title())
    print("Page URL:", page.url)
    
    # check img elements
    imgs = page.evaluate("""
        () => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt
            })).filter(x => x.src && x.src.length > 5);
        }
    """)
    print("Total images found:", len(imgs))
    for i, im in enumerate(imgs[:5]):
        print(f"  Img {i}: {im['src'][:80]} | alt: {im['alt'][:30]}")
        
    browser.close()
