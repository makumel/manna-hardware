from playwright.sync_api import sync_playwright
import time

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
    page.goto("https://www.google.com", timeout=15000)
    search_box = page.locator("textarea[name='q'], input[name='q']").first
    search_box.fill("Island Paint QDE Nile Green Philippines")
    search_box.press("Enter")
    page.wait_for_load_state("domcontentloaded")
    
    images_tab = page.locator("a:has-text('Images'), a:has-text('Mga Larawan')").first
    images_tab.click()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(2)
    
    # Find all clickable image containers on the images tab
    # In modern Google Images with udm=2:
    # Each image result is an element with an img tag inside a main container
    img_elements = page.locator("div[data-ri] img, div[role='listitem'] img, div[data-id] img, img[alt]").all()
    print("Found img locator count:", len(img_elements))
    
    # Click the first or second image to open preview panel
    for idx in range(min(3, len(img_elements))):
        try:
            print(f"Clicking image #{idx}...")
            img_elements[idx].click(timeout=3000)
            time.sleep(1.5)
            # Find the large preview image that appears on the right panel
            preview_imgs = page.evaluate("""
                () => {
                    const imgs = Array.from(document.querySelectorAll('img[src^="http"]')).filter(i => {
                        // ignore google logos
                        if (i.src.includes('google.com') || i.src.includes('gstatic.com')) return false;
                        return i.naturalWidth > 150 || i.width > 150 || (i.src.includes('http') && !i.src.includes('data:'));
                    });
                    return imgs.map(i => ({
                        src: i.src,
                        alt: i.alt,
                        width: i.width,
                        height: i.height
                    }));
                }
            """)
            print(f"Preview images after click {idx}:", preview_imgs[:3])
            if preview_imgs:
                break
        except Exception as e:
            print(f"Click error: {e}")
            
    browser.close()
