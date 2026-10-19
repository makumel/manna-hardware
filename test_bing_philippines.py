from playwright.sync_api import sync_playwright
import urllib.parse
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

def search_bing(page, q):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(q)}"
    page.goto(url, wait_until="domcontentloaded", timeout=15000)
    page.wait_for_timeout(1500)
    
    results = page.evaluate("""
        () => {
            const list = [];
            const cards = document.querySelectorAll('a.iusc, div.imgpt');
            for (const c of cards) {
                const m = c.getAttribute('m');
                if (m) {
                    try {
                        const parsed = JSON.parse(m);
                        list.push({
                            img_url: parsed.murl,
                            title: parsed.t || '',
                            page_url: parsed.purl || '',
                            thumb_url: parsed.turl || ''
                        });
                    } catch(e) {}
                }
            }
            return list;
        }
    """)
    
    # Priority for popular hardware stores / marketplaces in Philippines:
    # Shopee, Lazada, Wilcon, Handyman, Cebu Home Builders, Alpha Steel, Metalink
    def store_score(item):
        purl = (item.get('page_url') or '').lower()
        title = (item.get('title') or '').lower()
        score = 0
        if any(k in purl for k in ['shopee.ph', 'lazada.com.ph', 'wilcon.com.ph', 'handyman.com.ph', 'cebuhomebuilders', 'topmosthardware.ph', 'metalink.com.ph', 'islandpaints.com', 'boysen.com.ph']):
            score += 10
        if 'philippines' in purl or 'philippines' in title:
            score += 3
        return score
        
    sorted_results = sorted(results, key=store_score, reverse=True)
    return sorted_results[:2]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    )
    for q in queries:
        matches = search_bing(page, q)
        print(f"\nQuery: '{q}'")
        for idx, m in enumerate(matches):
            print(f"  Match #{idx+1}:")
            print(f"    Image: {m['img_url']}")
            print(f"    Title: {m['title'][:65]}")
            print(f"    Store: {m['page_url'][:75]}")
            
    browser.close()
