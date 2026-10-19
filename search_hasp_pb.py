from playwright.sync_api import sync_playwright
import urllib.parse
import urllib.request
import json

queries = [
    ('https://www.bing.com/images/search?q=' + urllib.parse.quote('stainless steel safety hasp and staple heavy duty lock latch hardware'), 'hasp_search'),
    ('https://www.bing.com/images/search?q=' + urllib.parse.quote('brass plumb bob pointed weight with string tool hardware'), 'pb_search')
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    for url, prefix in queries:
        page.goto(url, wait_until='domcontentloaded')
        page.wait_for_timeout(1000)
        items = page.evaluate('''() => {
            return Array.from(document.querySelectorAll('a.iusc'))
                .slice(0, 15)
                .map(a => {
                    try {
                        const m = JSON.parse(a.getAttribute('m'));
                        return { murl: m.murl, t: m.t || '', purl: m.purl || '', turl: m.turl || '' };
                    } catch(e) { return null; }
                }).filter(Boolean);
        }''')
        print(f"{prefix}: found {len(items)} items")
        saved_count = 0
        for idx, item in enumerate(items):
            text = (item['t'] + ' ' + item['purl']).lower()
            if any(bad in text for bad in ['far eastern', 'fareastern', 'lucky', 'gazelle', 'dt-home', 'baesa', 'click n go']):
                continue
            
            # try download murl
            success = False
            for target_url in [item['murl'], item['turl']]:
                if not target_url:
                    continue
                try:
                    fname = f"{prefix}_{saved_count+1}.jpg"
                    req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=8) as resp, open(fname, 'wb') as f:
                        f.write(resp.read())
                    print(f"  Saved {fname}: {item['t'][:50]}")
                    saved_count += 1
                    success = True
                    break
                except Exception as e:
                    pass
            if saved_count >= 3:
                break
    browser.close()
