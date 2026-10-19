import urllib.parse
import urllib.request
import json
import os
from playwright.sync_api import sync_playwright

targets = [
    ('Amerilock safety hasp stainless steel white background', 'candidate_hasp'),
    ('Square D water pump pressure switch packshot white background', 'candidate_pressureswitch'),
    ('stainless flexible hose 1/2 x 1/2 packshot white background', 'candidate_hose'),
    ('two way faucet chrome fin handle dual bibcock white background', 'candidate_2way'),
    ('gooseneck faucet flexible kitchen sink 360 chrome white background', 'candidate_gooseneck'),
    ('brass swing check valve threaded white background', 'candidate_swingvalve'),
    ('brass plumb bob pointed weight white background', 'candidate_plumbbob')
]

negative = ['far eastern', 'fareastern', 'lucky', 'gazelle', 'dt-home', 'dthome', 'dt home', 'click n go', 'clickngo', 'comfy', 'baesa', 'ace hardware', 'primetop']

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    )
    for q, filename in targets:
        url = f'https://www.bing.com/images/search?q={urllib.parse.quote(q)}'
        page.goto(url, wait_until='domcontentloaded', timeout=15000)
        page.wait_for_timeout(1000)
        results = page.evaluate('''
            () => {
                const list = [];
                const cards = document.querySelectorAll('a.iusc');
                for (const c of cards) {
                    const m = c.getAttribute('m');
                    if (m) {
                        try {
                            const parsed = JSON.parse(m);
                            list.push({
                                img_url: parsed.murl,
                                title: parsed.t || '',
                                purl: parsed.purl || '',
                                thumb_url: parsed.turl || ''
                            });
                        } catch(e) {}
                    }
                }
                return list;
            }
        ''')
        clean = []
        for r in results:
            text = (r['title'] + ' ' + r['purl']).lower()
            if not any(n in text for n in negative):
                clean.append(r)
        
        print(f"{q} => {len(clean)} clean candidates")
        saved = False
        for c in clean[:5]:
            img_target = c['img_url']
            try:
                req = urllib.request.Request(img_target, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=6) as resp, open(f"{filename}.jpg", 'wb') as f:
                    f.write(resp.read())
                print(f"  Successfully saved {filename}.jpg from {img_target[:60]}")
                saved = True
                break
            except Exception as e:
                # try thumbnail fallback if direct url fails
                try:
                    req = urllib.request.Request(c['thumb_url'], headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=6) as resp, open(f"{filename}.jpg", 'wb') as f:
                        f.write(resp.read())
                    print(f"  Saved thumbnail for {filename}.jpg")
                    saved = True
                    break
                except Exception as e2:
                    pass
        if not saved:
            print(f"  FAILED to save {filename}.jpg")

    browser.close()
