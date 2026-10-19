import urllib.parse
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
        ]
    )
    page = browser.new_page()
    q = 'C-purlins Philippines'
    page.goto(f'https://www.google.com/search?udm=2&q={urllib.parse.quote(q)}', wait_until='domcontentloaded')
    page.wait_for_timeout(2000)
    
    data = page.evaluate("""() => {
        const cards = [];
        const seen = new Set();
        document.querySelectorAll('img').forEach((img) => {
            if (img.src && img.src.startsWith('https://encrypted-tbn0.gstatic.com') && (img.width > 80 || img.naturalWidth > 80)) {
                if (seen.has(img.src)) return;
                seen.add(img.src);
                let container = img.closest('div[data-ri]') || img.closest('a') || img.parentElement;
                let text = '';
                if (container) {
                    text = (container.innerText || container.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim();
                }
                cards.push({
                    src: img.src,
                    alt: img.alt || '',
                    text: text.slice(0, 120),
                    w: img.naturalWidth || img.width,
                    h: img.naturalHeight || img.height
                });
            }
        });
        return cards;
    }""")
    
    print(f"Found cards: {len(data)}")
    for i, c in enumerate(data[:6]):
        print(f"[{i+1}] alt: '{c['alt']}' | text: '{c['text']}' | dim: {c['w']}x{c['h']}")
        print(f"    src: {c['src']}")
    browser.close()
