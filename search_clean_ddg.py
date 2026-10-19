import urllib.parse
from playwright.sync_api import sync_playwright
import json

queries = {
    'plumb_bob': 'brass plumb bob tool white background',
    'safety_hasp': 'stainless steel safety hasp latch white background',
    'pressure_switch': 'Square D FSG2 water pump pressure switch white background',
    'floor_drain': 'stainless steel floor drain 4x4 white background'
}

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = browser.new_page(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    found = {}
    for k, q in queries.items():
        url = 'https://duckduckgo.com/?q=' + urllib.parse.quote(q) + '&t=h_&iar=images&iax=images&ia=images'
        page.goto(url, wait_until='domcontentloaded', timeout=15000)
        page.wait_for_timeout(2000)
        
        imgs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img.tile--img__img, img[src*="external-content"]'))
                .slice(0, 5)
                .map(i => i.src);
        }""")
        print(f"{k}: found {len(imgs)} images")
        for im in imgs[:2]:
            print(f"  {im}")
        if imgs:
            found[k] = imgs[0]
            
    browser.close()

with open('ddg_clean_images.json', 'w') as f:
    json.dump(found, f, indent=2)
