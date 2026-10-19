import urllib.parse
import urllib.request
import os
import json
from playwright.sync_api import sync_playwright

clean_queries = {
    'pressure_switch': 'Square D water pump pressure switch isolated white background',
    'floor_drain': 'PVC floor drain 4x4 clean white background',
    'plumb_bob': 'solid brass plumb bob white background',
    'safety_hasp': 'stainless steel safety hasp latch white background'
}

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = browser.new_page()

    results = {}
    for key, q in clean_queries.items():
        url = 'https://www.google.com/search?q=' + urllib.parse.quote(q) + '&udm=2'
        page.goto(url, wait_until='domcontentloaded')
        page.wait_for_timeout(1500)

        imgs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img'))
                .filter(i => i.src && i.src.startsWith('https://encrypted-tbn0.gstatic.com') && (i.width > 120 || i.naturalWidth > 120))
                .slice(0, 5)
                .map(i => ({ src: i.src, alt: i.alt || '', w: i.width, h: i.height }));
        }""")
        
        print(f"\nQuery [{key}]: found {len(imgs)} candidates")
        for idx, im in enumerate(imgs[:3]):
            print(f"  [{idx+1}] {im['alt'][:45]} ({im['w']}x{im['h']}) -> {im['src']}")
        
        if imgs:
            results[key] = imgs[0]['src']

    browser.close()

with open('clean_hardware_images.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print("\nSaved clean_hardware_images.json")
