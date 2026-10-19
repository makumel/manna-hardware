from playwright.sync_api import sync_playwright
import time
import json

queries = [
    "C-purlins Philippines",
    "Island Paint QDE Nile Green Philippines",
    "Shark SF2408 Faucet Philippines",
    "Amerilock C-1 Hinge Philippines",
    "Stikwel Glue Philippines",
    "Makita Planer Blade Philippines",
    "Dewalt Drill Bit Philippines"
]

def run():
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
        
        # 1. Start from google.com
        print("Navigating to Google...")
        page.goto("https://www.google.com", timeout=15000)
        
        # 2. Search first item
        box = page.locator("textarea[name='q'], input[name='q']").first
        box.fill(queries[0])
        box.press("Enter")
        page.wait_for_load_state("domcontentloaded")
        
        # 3. Click Images tab
        images_tab = page.locator("a:has-text('Images'), a:has-text('Mga Larawan')").first
        images_tab.click()
        page.wait_for_load_state("domcontentloaded")
        time.sleep(2)
        
        for q in queries:
            print(f"\nSearching: '{q}'...")
            # On Google Images, the search input has name='q'
            img_search_box = page.locator("input[name='q'], textarea[name='q']").first
            img_search_box.fill(q)
            img_search_box.press("Enter")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2)
            
            # Extract top 2 images
            imgs = page.evaluate("""
                () => {
                    const list = [];
                    const allImgs = Array.from(document.querySelectorAll('img')).filter(i => {
                        if (!i.src) return false;
                        if (!i.src.startsWith('https://encrypted-tbn0.gstatic.com')) return false;
                        const w = i.naturalWidth || i.width;
                        const h = i.naturalHeight || i.height;
                        return (w > 120 || h > 120) && !i.src.includes('favicon');
                    });
                    return allImgs.slice(0, 3).map(i => ({
                        src: i.src,
                        alt: i.alt || '',
                        w: i.naturalWidth || i.width,
                        h: i.naturalHeight || i.height
                    }));
                }
            """)
            
            print(f"  Found {len(imgs)} images on Google Images:")
            for idx, im in enumerate(imgs[:2]):
                print(f"    [{idx+1}] {im['alt'][:60]} ({im['w']}x{im['h']})")
                print(f"        {im['src']}")
                
        browser.close()

if __name__ == '__main__':
    run()
