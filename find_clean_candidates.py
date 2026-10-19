from playwright.sync_api import sync_playwright
import urllib.parse
import urllib.request
import os

queries = {
    'hasp': 'Amerilock barrel bolt hasp lock stainless',
    'pressure_switch': 'Square D water pump pressure switch 9013FSG2',
    'flexible_hose': 'stainless flexible hose 1/2 x 1/2 for lavatory',
    'two_way_faucet': 'two way faucet chrome dual bibcock',
    'gooseneck': 'flexible gooseneck kitchen faucet 360 rotatable',
    'swing_check': 'brass swing check valve 1/2 3/4 1 inch',
    'plumb_bob': 'brass plumb bob with string 200g',
    'rosco_faucet': 'Rosco water jug faucet 3/8 blue'
}

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        ]
    )
    context = browser.new_context()
    page = context.new_page()

    for key, q in queries.items():
        url = f"https://www.google.com/search?q={urllib.parse.quote(q)}&udm=2"
        page.goto(url, wait_until='domcontentloaded', timeout=15000)
        page.wait_for_timeout(1500)
        
        imgs = page.evaluate("""() => {
            const list = [];
            const elements = document.querySelectorAll('div[data-ved] img');
            for (const el of elements) {
                if (el.src && el.src.startsWith('http') && !el.src.includes('google.com')) {
                    list.push({ src: el.src, alt: el.alt || '' });
                }
            }
            return list;
        }""")
        
        print(f"{key}: found {len(imgs)} candidate images")
        count = 0
        for idx, item in enumerate(imgs):
            if count >= 4:
                break
            fname = f"{key}_{count+1}.jpg"
            try:
                urllib.request.urlretrieve(item['src'], fname)
                alt_text = item['alt'][:40].replace('\n', ' ')
                print(f"  saved {fname} (alt: {alt_text})")
                count += 1
            except Exception as e:
                pass

    browser.close()
