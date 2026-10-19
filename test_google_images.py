from playwright.sync_api import sync_playwright
import urllib.parse
import json

def test_query(q):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        url = f"https://www.google.com/search?q={urllib.parse.quote(q)}&udm=2"
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        page.wait_for_timeout(2000)

        # Inspect images or links
        # Google Images results are typically in img tags inside result containers
        imgs = page.evaluate("""
            () => {
                const results = [];
                // Look for image elements in the main search results
                const imgElements = document.querySelectorAll('div[data-ri] img, div[role="listitem"] img, h3 img, a img');
                for (const img of imgElements) {
                    const src = img.src || img.getAttribute('data-src') || img.getAttribute('src');
                    const alt = img.alt || '';
                    const parentA = img.closest('a');
                    const href = parentA ? parentA.href : '';
                    if (src && (src.startsWith('http') || src.startsWith('data:image'))) {
                        results.push({ src, alt, href });
                    }
                }
                return results.slice(0, 10);
            }
        """)
        print(f"Found {len(imgs)} images for query: {q}")
        for i, img in enumerate(imgs[:4]):
            src_preview = img['src'][:80] + '...' if len(img['src']) > 80 else img['src']
            print(f"  [{i}] src: {src_preview} | alt: {img['alt'][:40]} | href: {img['href'][:60]}")
        
        browser.close()

if __name__ == '__main__':
    test_query("C-purlins Philippines")
    test_query("Island Paint QDE Nile Green Philippines")
