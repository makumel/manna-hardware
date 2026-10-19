import urllib.request
import os
import json
from playwright.sync_api import sync_playwright

os.makedirs('storefront-app/public/images', exist_ok=True)

# 1. Clean Island ColorQuick paint can (the one user approved on the right of image 1)
island_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYcFzw8ePk8A201uOpTp5d4CG7Uf6TSVALnLOkiUgC2w&s=10'
req = urllib.request.Request(island_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp, open('storefront-app/public/images/island_color_quick_clean.jpg', 'wb') as f:
    f.write(resp.read())
print("Saved island_color_quick_clean.jpg")

# 2. Search for clean Boysen Roofgard and Boysen paint cans with no store logos
with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = browser.new_page()
    
    # Official boysen website or clean product packshot
    page.goto('https://www.google.com/search?q=Boysen+Roofgard+B-2550+isolated+can+white+background&udm=2', wait_until='domcontentloaded')
    page.wait_for_timeout(2000)

    imgs = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('img'))
            .filter(i => i.src && i.src.startsWith('https://encrypted-tbn0.gstatic.com') && (i.width > 120 || i.naturalWidth > 120))
            .slice(0, 10)
            .map(i => ({ src: i.src, alt: i.alt || '', w: i.width, h: i.height }));
    }""")
    
    print(f"Found {len(imgs)} candidate Boysen Roofgard cans:")
    for idx, im in enumerate(imgs):
        print(f"[{idx+1}] {im['alt']} ({im['w']}x{im['h']}) -> {im['src']}")

    # Check official Boysen site directly: boysen.com.ph
    print("\nNavigating to boysen.com.ph product page...")
    try:
        page.goto('https://www.boysen.com.ph/products.do', timeout=15000)
        page.wait_for_timeout(2000)
        boysen_official_imgs = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('img'))
                .filter(i => i.src && (i.src.includes('products') || i.src.includes('upload')))
                .map(i => ({ src: i.src, alt: i.alt }));
        }""")
        print(f"Found {len(boysen_official_imgs)} images on boysen.com.ph:")
        for b_im in boysen_official_imgs[:5]:
            print(f"  {b_im['src']} ({b_im['alt']})")
    except Exception as e:
        print("Could not load boysen.com.ph:", e)

    browser.close()
