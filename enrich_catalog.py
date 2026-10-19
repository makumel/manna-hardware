import json
import re
import hashlib
import os

def load_catalog(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_image_bank(filepath='image_bank.json'):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_product_archetype(item):
    name = item['name'].lower()
    cat = item.get('category', '').lower()

    # 1. High-priority Brand Matches
    if 'stikwel' in name or 'wood glue' in name:
        return 'wood_glue_adhesive'
    if 'boysen' in name:
        return 'paint_can_boysen'
    if 'island' in name:
        return 'paint_can_island'
    if 'shark' in name:
        return 'shark_plumbing_fixture'
    if 'amerilock' in name:
        return 'amerilock_door_hardware'
    if 'gypsum' in name and 'screw' in name:
        return 'gypsum_screws'
    if 'pylox' in name or 'bosny' in name or 'spray' in name:
        return 'spray_paint'
    if 'roofkote' in name or 'elastomer' in name:
        return 'roof_sealant_paint'
    if 'varnish' in name or 'timberguard' in name or 'lacquer' in name:
        return 'wood_varnish'
    if 'makita' in name:
        return 'cutting_grinding_disc'
    if 'dewalt' in name or 'doormer' in name or 'irwin' in name:
        return 'drill_bits'
    if 'ingco' in name:
        if 'disc' in name or 'c-disc' in name:
            return 'cutting_grinding_disc'
        return 'hand_tools_wrenches_pliers'
    if 'philips' in name or 'ecolink' in name or 'kantt' in name or 'fsl' in name or 'bulb' in name or 'led' in name:
        return 'led_light_bulb'

    # 2. Category & Item Type Detection
    # Paints & Coatings
    if 'roller' in name:
        return 'paint_roller'
    if any(k in name for k in ['paint', 'primer', 'qde', 'enamel']):
        return 'paint_can_generic'

    # Plumbing & Fixtures
    if 'shower' in name or 'gooseneck' in name:
        return 'shower_and_faucet'
    if any(k in name for k in ['faucet', 'bibcock', 'lavatory hose', 'hose']):
        if 'hose' in name:
            return 'flexible_plumbing_hose'
        return 'water_faucet'
    if 'pump' in name:
        return 'water_pump'
    if any(k in name for k in ['sink', 'strainer', 'drain', 'p-trap']):
        return 'sink_and_drain'
    if 'flapper' in name:
        return 'plumbing_toilet_fittings'
    if 'teflon' in name or 'mesh tape' in name:
        return 'teflon_tape'
    if 'valve' in name:
        return 'plumbing_valve'
    if any(k in name for k in ['gi pipe', 'pvc pipe', 'ppr pipe', 'pipe s-40', 'pipe']):
        return 'pipes_plumbing'
    if any(k in name for k in ['coupling', 'elbow', 'tee', 'nipple', 'adaptor', 'plug', 'cap', 'union', 'bushing', 'flange', 'connector', 'mta', 'fta']):
        return 'pipe_fittings'

    # Fasteners & Hardware
    if 'screw' in name or 'tek' in name:
        return 'screws_hardware'
    if 'rivet' in name:
        return 'blind_rivets'
    if 'hinge' in name:
        return 'door_hinges'
    if any(k in name for k in ['lock', 'padlock', 'hasp']):
        return 'padlocks_and_locks'
    if 'nail' in name:
        return 'construction_nails'
    if any(k in name for k in ['bolt', 'nut', 'washer']):
        return 'bolts_and_nuts'
    if any(k in name for k in ['handle', 'catch', 'spring', 'hook & eye', 'hook and eye']):
        return 'cabinet_door_hardware'

    # Structural & Building Materials
    if 'purlin' in name:
        return 'steel_c_purlins'
    if any(k in name for k in ['angle bar', 'plain bar', 'i-bar', 't-bar', 'rebar', 'bar']):
        return 'steel_bars_and_beams'
    if any(k in name for k in ['polycarbonate', 'board', 'sheet', 'plywood']):
        return 'roofing_polycarbonate_sheet'
    if any(k in name for k in ['cement', 'trowel']):
        return 'masonry_cement_trowel'

    # Electrical & Lighting
    if 'breaker' in name or 'fuse' in name:
        return 'circuit_breaker'
    if any(k in name for k in ['switch', 'outlet', 'receptacle', 'socket', 'plate', 'splitter', 'adaptor']):
        return 'electrical_switch_socket'
    if any(k in name for k in ['wire', 'cable', 'cord']):
        return 'electrical_wire_cable'
    if 'box' in name and any(k in name for k in ['junction', 'utility', 'square']):
        return 'junction_box'
    if any(k in name for k in ['clip', 'alligator', 'insulator', 'terminal']):
        return 'electrical_accessories'

    # Tools & Accessories
    if any(k in name for k in ['drill', 'drillbit']):
        return 'drill_bits'
    if any(k in name for k in ['blade', 'disc', 'disk', 'cutting', 'grinding']):
        return 'cutting_grinding_disc'
    if 'saw' in name:
        return 'handsaw_carpentry'
    if 'chisel' in name:
        return 'wood_chisel'
    if 'brush' in name and 'cup' in name:
        return 'wire_cup_brush'
    if any(k in name for k in ['wrench', 'plier', 'snip']):
        return 'hand_tools_wrenches_pliers'
    if any(k in name for k in ['sandpaper', 'carborandum', 'carburandum']):
        return 'sandpaper_abrasives'
    if 'soldering' in name:
        return 'soldering_iron'
    if any(k in name for k in ['plumb bob', 'meter', 'level']):
        return 'measuring_tools'
    if any(k in name for k in ['welding', 'electrode']):
        return 'welding_tools'

    # Generic hardware fallback
    return 'general_hardware_tool'

def optimize_image_url(url):
    """Ensure images have crisp high-resolution parameters."""
    if 'images.pexels.com' in url:
        # Pexels dynamic resizing: w=800 for crystal-clear catalog card display
        base = url.split('?')[0]
        return f"{base}?auto=compress&cs=tinysrgb&w=800"
    return url

def rebrand_and_enrich():
    catalog_path = 'catalog.json'
    storefront_catalog_path = os.path.join('storefront-app', 'src', 'catalog.json')
    
    print(f"Reading catalog from {catalog_path}...")
    items = load_catalog(catalog_path)
    image_bank = load_image_bank('image_bank.json')

    print(f"Total items to process: {len(items)}")

    archetype_stats = {}
    brand_stats = {'Boysen': 0, 'Island': 0, 'Stikwel': 0, 'Shark': 0, 'Amerilock': 0, 'Gypsum': 0}
    rebranded_sku_count = 0
    rebranded_desc_count = 0

    enriched_items = []

    for item in items:
        new_item = dict(item)

        # 1. Rebrand SKU ID: FAN-XXXX -> MNA-XXXX
        old_id = new_item.get('id', '')
        if old_id.startswith('FAN-'):
            new_item['id'] = 'MNA-' + old_id[4:]
            rebranded_sku_count += 1

        # 2. Rebrand Description
        old_desc = new_item.get('description', '')
        if 'Fanvill Hardware Cabalwan Tacloban' in old_desc:
            new_item['description'] = old_desc.replace(
                'Fanvill Hardware Cabalwan Tacloban',
                'Manna Hardware & Building Supply'
            )
            rebranded_desc_count += 1
        elif 'Fanvill' in old_desc:
            new_item['description'] = old_desc.replace('Fanvill', 'Manna')
            rebranded_desc_count += 1

        # Track branded product occurrences
        name_lower = new_item.get('name', '').lower()
        if 'boysen' in name_lower:
            brand_stats['Boysen'] += 1
        if 'island' in name_lower:
            brand_stats['Island'] += 1
        if 'stikwel' in name_lower:
            brand_stats['Stikwel'] += 1
        if 'shark' in name_lower:
            brand_stats['Shark'] += 1
        if 'amerilock' in name_lower:
            brand_stats['Amerilock'] += 1
        if 'gypsum' in name_lower and 'screw' in name_lower:
            brand_stats['Gypsum'] += 1

        # 3. Determine archetype and assign image
        archetype = get_product_archetype(new_item)
        archetype_stats[archetype] = archetype_stats.get(archetype, 0) + 1

        img_list = image_bank.get(archetype) or image_bank.get('general_hardware_tool', [])
        if not img_list:
            img_list = ["https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=800"]

        # Deterministic index selection based on item name hash
        h = int(hashlib.md5(new_item['name'].encode('utf-8')).hexdigest(), 16)
        chosen_img = img_list[h % len(img_list)]
        optimized_img = optimize_image_url(chosen_img)

        new_item['image'] = optimized_img
        new_item['archetype'] = archetype

        enriched_items.append(new_item)

    # 4. Save to catalog.json
    print(f"Writing updated catalog to {catalog_path}...")
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(enriched_items, f, indent=2, ensure_ascii=False)

    # 5. Save to storefront-app/src/catalog.json
    print(f"Writing updated catalog to {storefront_catalog_path}...")
    with open(storefront_catalog_path, 'w', encoding='utf-8') as f:
        json.dump(enriched_items, f, indent=2, ensure_ascii=False)

    print("\n--- ENRICHMENT COMPLETE ---")
    print(f"Total Products: {len(enriched_items)}")
    print(f"SKUs Rebranded (FAN- -> MNA-): {rebranded_sku_count}")
    print(f"Descriptions Rebranded: {rebranded_desc_count}")
    print("\nBranded Products Handled:")
    for brand, cnt in brand_stats.items():
        print(f"  • {brand}: {cnt} items")
    print(f"\nArchetypes Covered: {len(archetype_stats)}")
    for arch, cnt in sorted(archetype_stats.items(), key=lambda x: x[1], reverse=True)[:15]:
        print(f"  • {arch:28}: {cnt} items")

if __name__ == '__main__':
    rebrand_and_enrich()
