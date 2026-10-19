import json
import re
import time
import os
import subprocess
from playwright.sync_api import sync_playwright

def get_search_query(item):
    name = item['name'].strip()
    # Normalize brackets, quotes, slashes
    clean = re.sub(r'[\(\)#\"\'/]', ' ', name)
    clean = re.sub(r'\b(GLn|Gln|Gl|pc|box|roll|bot|kg|set)\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\s+', ' ', clean).strip()

    # If it's a branded item or prominent item, make the query tight and precise
    lower = clean.lower()
    if 'c-purlin' in lower or 'purlin' in lower:
        return 'C-purlins Philippines'
    if 'island paint qde' in lower:
        # e.g. Island Paint QDE Nile Green Philippines
        color_match = re.search(r'qde\s+([a-zA-Z\s]+)', clean, re.IGNORECASE)
        color = color_match.group(1).strip() if color_match else ''
        return f"Island Paint QDE {color} Philippines".strip()
    if 'boysen' in lower:
        return f"{clean} Philippines"
    if 'stikwel' in lower:
        return 'Stikwel Glue Philippines'
    if 'shark' in lower:
        if 'faucet' in lower:
            return f"Shark Faucet {clean} Philippines"
        if 'shower' in lower:
            return f"Shark Shower Head Philippines"
        return f"Shark Hardware {clean} Philippines"
    if 'amerilock' in lower:
        return 'Amerilock C-1 Hinge Philippines'
    if 'gypsum' in lower and 'screw' in lower:
        return 'Gypsum Screw Wood Philippines'
    if 'makita' in lower:
        return 'Makita Planer Blade Philippines'
    if 'dewalt' in lower:
        return 'Dewalt Drill Bit Philippines'
    if 'ingco' in lower:
        return f"{clean} Philippines"
    if 'philips' in lower or 'ecolink' in lower:
        return f"{clean} Philippines"

    return f"{clean} Philippines"

def run_google_images_matcher():
    catalog_path = 'catalog.json'
    storefront_catalog_path = os.path.join('storefront-app', 'src', 'catalog.json')
    cache_path = 'google_hardware_images.json'
    
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # Load cache if available
    img_cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                img_cache = json.load(f)
            print(f"Loaded {len(img_cache)} cached Google Image matches.")
        except:
            img_cache = {}

    # Map items to queries
    query_to_items = {}
    for item in catalog:
        q = get_search_query(item)
        query_to_items.setdefault(q, []).append(item['id'])

    queries_to_fetch = [q for q in query_to_items.keys() if q not in img_cache]
    print(f"Total distinct queries: {len(query_to_items)} | Already cached: {len(img_cache)} | To fetch: {len(queries_to_fetch)}")

    if queries_to_fetch:
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

            import urllib.parse

            for i, query in enumerate(queries_to_fetch):
                try:
                    search_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&udm=2"
                    page.goto(search_url, timeout=20000, wait_until="domcontentloaded")
                    time.sleep(1.0)

                    # Extract top 2 images with good dimensions
                    imgs = page.evaluate("""
                        () => {
                            const found = [];
                            const all = Array.from(document.querySelectorAll('img')).filter(img => {
                                if (!img.src || !img.src.startsWith('https://encrypted-tbn0.gstatic.com')) return false;
                                const w = img.naturalWidth || img.width;
                                const h = img.naturalHeight || img.height;
                                return (w > 100 || h > 100) && !img.src.includes('favicon');
                            });
                            for (const im of all.slice(0, 4)) {
                                found.push({
                                    url: im.src,
                                    alt: im.alt || '',
                                    w: im.naturalWidth || im.width,
                                    h: im.naturalHeight || im.height
                                });
                            }
                            return found;
                        }
                    """)

                    if imgs:
                        chosen = imgs[0]
                        # Prefer image with hardware store mentions if present in alt
                        for cand in imgs[:3]:
                            alt_lower = cand['alt'].lower()
                            if any(k in alt_lower for k in ['shopee', 'lazada', 'wilcon', 'handyman', 'hardware', 'philippines', 'paint', 'steel']):
                                chosen = cand
                                break
                        img_cache[query] = chosen['url']
                        print(f"[{i+1}/{len(queries_to_fetch)}] '{query}' -> {chosen['alt'][:40]} ({chosen['w']}x{chosen['h']})")
                    else:
                        # Fallback: take first encrypted-tbn0 image if any
                        first_img = page.locator("img[src^='https://encrypted-tbn0.gstatic.com']").first
                        if first_img.count() > 0:
                            src = first_img.get_attribute("src")
                            if src:
                                img_cache[query] = src
                                print(f"[{i+1}/{len(queries_to_fetch)}] '{query}' -> direct first image")
                        else:
                            print(f"[{i+1}/{len(queries_to_fetch)}] Warning: No Google Image found for '{query}'")

                    # Periodically save cache
                    if (i + 1) % 5 == 0:
                        with open(cache_path, 'w', encoding='utf-8') as f:
                            json.dump(img_cache, f, indent=2)

                except Exception as e:
                    print(f"Error querying '{query}': {e}")
                    time.sleep(1)

            browser.close()

            # Final cache save
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(img_cache, f, indent=2)

    # Apply genuine images to catalog
    updated_count = 0
    for item in catalog:
        q = get_search_query(item)
        if q in img_cache:
            item['image'] = img_cache[q]
            updated_count += 1

    # Save to catalog.json and storefront-app/src/catalog.json
    print(f"\nSaving {len(catalog)} products ({updated_count} with genuine Google hardware photos)...")
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    with open(storefront_catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Sync SQLite
    print("Syncing with SQLite database...")
    subprocess.run(["node", "db.js"], check=True)

    print("Complete!")

if __name__ == '__main__':
    run_google_images_matcher()
