import json
from playwright.sync_api import sync_playwright

def capture_expanded_vision_grid():
    with open('catalog.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # 8 distinct hardware items from different categories
    sample_queries = [
        'C-Purlins',
        'Island Paint QDE Nile Green',
        'GI Pipe S-40 3/4 Samurai',
        'Plain Bar 16mm',
        'PHILIPS LED BULB 13W',
        'Pylox Lazer 705 Gold',
        'PVC Blue Plain Elbow',
        'Electrode Holder 500A'
    ]
    
    selected_items = []
    for q in sample_queries:
        for item in catalog:
            if q.lower() in item['name'].lower() and item not in selected_items:
                selected_items.append(item)
                break

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = browser.new_page(viewport={'width': 1200, 'height': 800})

        cards_html = ""
        for it in selected_items:
            cards_html += f"""
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 12px; width: 250px; text-align: center; box-sizing: border-box;">
                <div style="background: #0f172a; border-radius: 6px; height: 160px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 8px;">
                    <img src="{it['image']}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
                <div style="font-size: 10px; font-weight: bold; color: #38bdf8; text-transform: uppercase;">{it['category']}</div>
                <div style="font-size: 13px; font-weight: bold; color: #f8fafc; height: 36px; overflow: hidden; margin: 4px 0;">{it['name']}</div>
                <div style="font-size: 15px; font-weight: 800; color: #4ade80;">&#8369;{it['price']}</div>
            </div>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 24px; background: #0b1120; font-family: sans-serif; color: white;">
            <h2 style="margin: 0 0 6px 0; font-size: 20px;">Visual Quality Assurance: Image vs Product Name</h2>
            <div style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">Direct inspection of rendered images in catalog and store</div>
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                {cards_html}
            </div>
        </body>
        </html>
        """
        page.set_content(html)
        page.wait_for_timeout(1000)
        page.screenshot(path='proof_vision_qa_multicategory.png')
        print("Saved proof_vision_qa_multicategory.png")
        browser.close()

if __name__ == '__main__':
    capture_expanded_vision_grid()
