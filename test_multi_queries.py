from playwright.sync_api import sync_playwright
import time
import json

TEST_QUERIES = [
    "C-purlins Philippines",
    "Shark SF2408 Faucet Philippines",
    "Amerilock C-1 Hinge Philippines",
    "Stikwel Glue Philippines",
    "Makita Planer Blade Philippines",
    "Dewalt Drill Bit Philippines",
    "GI Pipe S-40 Philippines",
    "Gypsum Screw Wood Philippines"
]

def search_google_images(page, query):
    # Navigate to search query with udm=2
    # Typing in search box preserves Google session
    search_box = page.locator("textarea[name='q'], input[name='q']").first
    search_box.fill(query)
    search_box.press("Enter")
    page.wait_for_load_state("domcontentloaded")
    time.sleep(1.2)
    
    # Extract top image results
    results = page.evaluate("""
        () => {
            const imgs = Array.from(document.querySelectorAll('img')).map(i => ({
                src: i.src,
                alt: i.alt || '',
                w: i.naturalWidth || i.width,
                h: i.naturalHeight || i.height
            })).filter(x => {
                if (!x.src || !x.src.startsWith('https://encrypted-tbn0.gstatic.com')) return false;
                return x.w > 100 || x.h > 100;
            });
            return imgs.slice(0, 5);
        }
    """)
    return results

def run_tests():
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
        
        # Init google session on images
        page.goto("https://www.google.com/search?q=hardware+store+Philippines&udm=2", timeout=15000)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(1.5)
        
        for q in TEST_QUERIES:
            imgs = search_google_images(page, q)
            print(f"\nQuery: {q} (Found {len(imgs)} images)")
            for idx, im in enumerate(imgs[:2]):
                print(f"  [{idx+1}] {im['alt'][:50]} ({im['w']}x{im['h']})")
                print(f"      URL: {im['src']}")
                
        browser.close()

if __name__ == '__main__':
    run_tests()
