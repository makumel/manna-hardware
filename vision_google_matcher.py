import json
import os
import re
import sys
import time
import subprocess
import urllib.parse
from playwright.sync_api import sync_playwright

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')


def get_clean_query(item):
    name = item['name'].strip()
    
    # Strip brackets, parentheses, quotes
    clean = re.sub(r'[\(\)#\"\'/]', ' ', name)
    clean = re.sub(r'\b(GLn|Gln|Gl|pc|box|roll|bot|kg|set|pcs)\b', ' ', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\s+', ' ', clean).strip()

    lower = clean.lower()
    if 'c-purlin' in lower or 'purlin' in lower:
        return 'C-purlins Philippines', ['purlin', 'steel', 'c-purlin', 'roofing']
    if 'island paint qde' in lower:
        color_match = re.search(r'qde\s+([a-zA-Z\s]+)', clean, re.IGNORECASE)
        color = color_match.group(1).strip() if color_match else ''
        q = f"Island Paint QDE {color} Philippines".strip()
        return q, ['island', 'paint', 'qde', color.lower()]
    if 'roofkote' in lower:
        color_match = re.search(r'roofkote\s+([a-zA-Z\s]+)', clean, re.IGNORECASE)
        color = color_match.group(1).strip() if color_match else ''
        q = f"Boysen Roofkote {color} Philippines".strip()
        return q, ['boysen', 'roofkote', color.lower()]
    if 'boysen' in lower:
        return f"{clean} Philippines", ['boysen', 'paint']
    if 'stikwel' in lower:
        return 'Stikwel Glue Philippines', ['stikwel', 'glue', 'wood']
    if 'shark' in lower:
        if 'faucet' in lower:
            return f"Shark Faucet {clean} Philippines", ['shark', 'faucet']
        return f"Shark Shower Faucet Philippines", ['shark', 'shower', 'faucet']
    if 'amerilock' in lower:
        return 'Amerilock Hinge Philippines', ['amerilock', 'hinge']
    if 'makita' in lower:
        return f"Makita {clean} Philippines", ['makita', 'blade', 'tool']
    if 'dewalt' in lower:
        return f"Dewalt {clean} Philippines", ['dewalt', 'drill', 'bit']
    
    # General hardware query
    keywords = [w.lower() for w in clean.split() if len(w) > 2]
    return f"{clean} Philippines", keywords

def match_candidate(candidates, query, keywords):
    """
    Selects the best matching item from the first 2-3 images or popular source.
    Validates alt text and card snippet against the item keywords.
    """
    if not candidates:
        return None

    # Check candidates for keyword and popularity alignment
    scored_candidates = []
    for idx, cand in enumerate(candidates[:4]):
        text = (cand['alt'] + " " + cand['text']).lower()
        score = 0
        
        # Matches any required keyword
        matched_kw = sum(1 for kw in keywords if kw in text)
        score += matched_kw * 10
        
        # Rank priority: earlier search results (first 2 images) are naturally more relevant
        if idx == 0:
            score += 5
        elif idx == 1:
            score += 4
        elif idx == 2:
            score += 2

        # Popular hardware retail indicators (Shopee, Lazada, Wilcon, Handyman, hardware store)
        if any(h in text for h in ['shopee', 'lazada', 'wilcon', 'handyman', 'hardware', 'store', 'online']):
            score += 3

        # Penalize obvious logos or irrelevant banners
        if any(bad in text for bad in ['logo', 'icon', 'vector', 'transparent png', 'clipart', 'profile picture']):
            score -= 20

        scored_candidates.append((score, cand))

    # Sort descending by score
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    best = scored_candidates[0][1]
    return best

def run_vision_playwright_matcher(max_queries=None):
    catalog_path = 'catalog.json'
    storefront_catalog_path = os.path.join('storefront-app', 'src', 'catalog.json')
    verified_cache_path = 'verified_google_images.json'

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    # Load cache
    cache = {}
    if os.path.exists(verified_cache_path):
        try:
            with open(verified_cache_path, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            print(f"Loaded {len(cache)} previously verified images from {verified_cache_path}.")
        except Exception:
            cache = {}

    # Build unique queries
    query_map = {}
    for item in catalog:
        q, kws = get_clean_query(item)
        if q not in query_map:
            query_map[q] = {'keywords': kws, 'item_ids': []}
        query_map[q]['item_ids'].append(item['id'])

    queries_to_process = [q for q in query_map.keys() if q not in cache]
    if max_queries:
        queries_to_process = queries_to_process[:max_queries]

    print(f"Total queries: {len(query_map)} | In Cache: {len(cache)} | To Process: {len(queries_to_process)}")

    if queries_to_process:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
                ]
            )
            page = browser.new_page()

            # Initialize session on Google Images
            print("Connecting to Google Images...")
            page.goto("https://www.google.com", timeout=20000)
            search_box = page.locator("textarea[name='q'], input[name='q']").first
            search_box.fill(queries_to_process[0])
            search_box.press("Enter")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(1)

            images_tab = page.locator("a:has-text('Images'), a:has-text('Mga Larawan')").first
            if images_tab.count() > 0:
                images_tab.click()
                page.wait_for_load_state("domcontentloaded")
                time.sleep(1.5)

            for i, query in enumerate(queries_to_process):
                try:
                    search_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}&udm=2"
                    page.goto(search_url, wait_until="domcontentloaded", timeout=15000)
                    time.sleep(1.0)

                    # Extract top candidate cards with Playwright
                    candidates = page.evaluate("""() => {
                        const items = [];
                        const seen = new Set();
                        document.querySelectorAll('img').forEach((img) => {
                            if (img.src && img.src.startsWith('https://encrypted-tbn0.gstatic.com')) {
                                const w = img.naturalWidth || img.width;
                                const h = img.naturalHeight || img.height;
                                if ((w > 100 || h > 100) && !img.src.includes('favicon')) {
                                    if (seen.has(img.src)) return;
                                    seen.add(img.src);
                                    let container = img.closest('div[data-ri]') || img.closest('a') || img.parentElement;
                                    let text = '';
                                    if (container) {
                                        text = (container.innerText || container.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim();
                                    }
                                    items.push({
                                        src: img.src,
                                        alt: img.alt || '',
                                        text: text.slice(0, 150),
                                        w: w,
                                        h: h
                                    });
                                }
                            }
                        });
                        return items.slice(0, 5);
                    }""")

                    kws = query_map[query]['keywords']
                    best = match_candidate(candidates, query, kws)
                    if best:
                        cache[query] = {
                            'image_url': best['src'],
                            'matched_title': best['alt'] or best['text'][:60],
                            'dimensions': f"{best['w']}x{best['h']}"
                        }
                        print(f"[{i+1}/{len(queries_to_process)}] '{query}' -> MATCH: '{best['alt'][:45]}' ({best['w']}x{best['h']})")
                    else:
                        print(f"[{i+1}/{len(queries_to_process)}] '{query}' -> No valid candidate found")

                    # Periodically save cache
                    if (i + 1) % 2 == 0:
                        with open(verified_cache_path, 'w', encoding='utf-8') as f:
                            json.dump(cache, f, indent=2)

                except Exception as e:
                    print(f"Error querying '{query}': {e}")
                    time.sleep(2)

            browser.close()

            # Save full cache
            with open(verified_cache_path, 'w', encoding='utf-8') as f:
                json.dump(cache, f, indent=2)

    # Apply matched images to catalog.json and storefront-app
    print(f"\nApplying verified image matches to catalog...")
    updated_items = 0
    for item in catalog:
        q, _ = get_clean_query(item)
        if q in cache and 'image_url' in cache[q]:
            item['image'] = cache[q]['image_url']
            updated_items += 1

    print(f"Updated {updated_items}/{len(catalog)} catalog products with verified Google hardware images.")

    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    with open(storefront_catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    # Sync SQLite
    print("Syncing SQLite database...")
    subprocess.run(["node", "db.js"], check=True)
    print("Database sync complete!")

if __name__ == '__main__':
    run_vision_playwright_matcher()
