from playwright.sync_api import sync_playwright
import time
import json

def test_cards():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ]
        )
        context = browser.new_context()
        page = context.new_page()
        
        # Navigate and search
        page.goto("https://www.google.com", timeout=15000)
        search_box = page.locator("textarea[name='q'], input[name='q']").first
        search_box.fill("Island Paint QDE Nile Green Philippines")
        search_box.press("Enter")
        page.wait_for_load_state("domcontentloaded")
        
        images_tab = page.locator("a:has-text('Images'), a:has-text('Mga Larawan')").first
        images_tab.click()
        page.wait_for_load_state("domcontentloaded")
        time.sleep(2)
        
        cards = page.evaluate("""
            () => {
                const results = [];
                // Look for image search result containers
                // In modern Google Images: div[data-id], div[data-ri], or a[href*="imgres"] or a[target="_blank"]
                const links = Array.from(document.querySelectorAll('a[href*="imgurl="], a[href*="imgres"], div[data-ri] a, div[role="listitem"] a'));
                for (const a of links) {
                    const href = a.href;
                    let imgUrl = null;
                    let site = null;
                    if (href.includes('imgurl=')) {
                        try {
                            const u = new URL(href);
                            imgUrl = u.searchParams.get('imgurl');
                            site = u.searchParams.get('imgrefurl');
                        } catch(e) {}
                    }
                    const img = a.querySelector('img');
                    const src = img ? (img.src || img.getAttribute('data-src')) : null;
                    const title = a.innerText || (img ? img.alt : '');
                    if (imgUrl || src) {
                        results.push({
                            direct_img_url: imgUrl,
                            thumb_src: src && src.startsWith('http') ? src : null,
                            site_url: site || href,
                            title: title.trim()
                        });
                    }
                }
                return results;
            }
        """)
        
        print(f"Total cards parsed: {len(cards)}")
        for i, c in enumerate(cards[:6]):
            print(f"[{i}] direct: {c['direct_img_url']}")
            print(f"    thumb: {c['thumb_src']}")
            print(f"    site:  {c['site_url'][:80]}")
            print(f"    title: {c['title'][:60]}")
            
        browser.close()

if __name__ == '__main__':
    test_cards()
