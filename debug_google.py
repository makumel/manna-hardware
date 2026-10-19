from playwright.sync_api import sync_playwright
import urllib.parse

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    url = f"https://www.google.com/search?q={urllib.parse.quote('C-purlins Philippines')}&udm=2"
    page.goto(url, wait_until="networkidle", timeout=20000)
    print("Page title:", page.title())
    print("Page URL:", page.url)
    
    # Check all img elements
    all_imgs = page.evaluate("""
        () => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt,
                className: img.className,
                id: img.id
            }));
        }
    """)
    print("Total img tags on page:", len(all_imgs))
    for i, im in enumerate(all_imgs[:10]):
        print(f"Img {i}: src={im['src'][:70]}... id={im['id']} class={im['className']} alt={im['alt']}")
        
    # Check links
    links = page.evaluate("""
        () => {
            return Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('http')).map(a => ({
                href: a.href,
                text: a.innerText.slice(0, 50)
            })).slice(0, 15);
        }
    """)
    print("Sample links:", links[:5])
    
    browser.close()
