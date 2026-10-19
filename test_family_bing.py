from test_bing_philippines import search_bing
from playwright.sync_api import sync_playwright

test_q = [
    'GI Nipple Philippines',
    'Philips LED Bulb Philippines',
    'Blind Rivets Aluminum Philippines',
    'PVC Blue Coupling Philippines',
    'PPR Pipe Fittings Philippines',
    'Irwin Masonry Drill Bit Philippines',
    'Sandpaper Waterproof Philippines',
    'Wood Chisel Philippines'
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    for q in test_q:
        res = search_bing(page, q)
        print(f"\nQuery: {q}")
        if res:
            for idx, r in enumerate(res[:2]):
                print(f"  [{idx+1}] {r['title'][:55]}")
                print(f"      Store: {r['page_url'][:60]}")
                print(f"      Image: {r['img_url']}")
    browser.close()
