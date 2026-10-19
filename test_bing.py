from playwright.sync_api import sync_playwright
import urllib.parse
import json

def test_engines():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Test Bing Images
        page = browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        query = "Island Paint QDE Nile Green Philippines"
        url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(2000)
        
        bing_imgs = page.evaluate("""
            () => {
                const results = [];
                const cards = document.querySelectorAll('a.iusc, div.imgpt');
                for (const c of cards) {
                    const m = c.getAttribute('m');
                    if (m) {
                        try {
                            const parsed = JSON.parse(m);
                            results.push({
                                img_url: parsed.murl,
                                title: parsed.t,
                                page_url: parsed.purl
                            });
                        } catch(e) {}
                    }
                }
                return results.slice(0, 5);
            }
        """)
        print(f"Bing found {len(bing_imgs)} actual high-res product photos!")
        for i, b in enumerate(bing_imgs[:3]):
            print(f"  [{i}] Photo: {b['img_url']}")
            print(f"      Title: {b['title']}")
            print(f"      Store/Page: {b['page_url']}")

        browser.close()

if __name__ == '__main__':
    test_engines()
