from playwright.sync_api import sync_playwright
import urllib.parse
import json

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        query = 'C-purlins Philippines'
        url = f'https://www.google.com/search?udm=2&q={urllib.parse.quote_plus(query)}'
        print(f"Navigating to {url}...")
        page.goto(url, wait_until='domcontentloaded')
        page.wait_for_timeout(2000)
        
        js_code = """
        () => {
            const results = [];
            const links = document.querySelectorAll('a[href*="imgres"]');
            for (const a of links) {
                try {
                    const u = new URL(a.href);
                    const imgurl = u.searchParams.get('imgurl');
                    const title = a.innerText || a.getAttribute('aria-label') || '';
                    const img = a.querySelector('img');
                    const thumb = img ? img.src : '';
                    if (imgurl && (imgurl.startsWith('http://') || imgurl.startsWith('https://'))) {
                        results.push({ imgurl, thumb, title: title.trim().slice(0, 100) });
                    }
                } catch(e) {}
            }
            return results;
        }
        """
        items = page.evaluate(js_code)
        print(f"Found {len(items)} items:")
        for idx, it in enumerate(items[:5]):
            print(f"[{idx+1}] {it['imgurl']} - {it['title']}")
        browser.close()

if __name__ == '__main__':
    test()
