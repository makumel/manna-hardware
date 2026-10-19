import urllib.request
import urllib.parse
import json
import ssl
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

pexels_key = 'b0hj9aTCYWLGqm5ZQ6OVn8GfGj9QUaOWk6ETbTnjWxrWA984yU5hWtKZ'
pixabay_key = '58018550-c355c23b647921b788c4c4273'

ARCHETYPE_QUERIES = {
    # Paints & Adhesives
    'paint_can_boysen': {'pexels': 'paint bucket blue', 'pixabay': 'paint can'},
    'paint_can_island': {'pexels': 'paint bucket color', 'pixabay': 'paint tin'},
    'wood_glue_adhesive': {'pexels': 'wood glue bottle', 'pixabay': 'glue bottle'},
    'spray_paint': {'pexels': 'spray paint can', 'pixabay': 'spray paint aerosol'},
    'wood_varnish': {'pexels': 'wood stain varnish', 'pixabay': 'wood varnish'},
    'roof_sealant_paint': {'pexels': 'waterproofing sealant bucket', 'pixabay': 'paint bucket construction'},
    'paint_can_generic': {'pexels': 'paint can tin', 'pixabay': 'paint can'},
    'paint_roller': {'pexels': 'paint roller tray', 'pixabay': 'paint roller'},

    # Plumbing & Fixtures
    'shark_plumbing_fixture': {'pexels': 'modern bathroom faucet chrome', 'pixabay': 'faucet chrome'},
    'water_faucet': {'pexels': 'stainless water faucet', 'pixabay': 'water tap faucet'},
    'shower_and_faucet': {'pexels': 'shower head bathroom stainless', 'pixabay': 'shower head'},
    'pipes_plumbing': {'pexels': 'steel pipe metal industrial', 'pixabay': 'pvc pipe plumbing'},
    'pipe_fittings': {'pexels': 'brass pipe fittings plumbing', 'pixabay': 'pipe fittings plumbing'},
    'plumbing_valve': {'pexels': 'brass ball valve plumbing', 'pixabay': 'ball valve brass'},
    'flexible_plumbing_hose': {'pexels': 'braided water hose plumbing', 'pixabay': 'water hose flexible'},
    'sink_and_drain': {'pexels': 'stainless kitchen sink', 'pixabay': 'stainless sink'},
    'water_pump': {'pexels': 'water pump machinery', 'pixabay': 'water pump industrial'},
    'teflon_tape': {'pexels': 'teflon thread seal tape', 'pixabay': 'tape roll hardware'},
    'plumbing_toilet_fittings': {'pexels': 'toilet valve plumbing', 'pixabay': 'plumbing rubber flapper'},

    # Fasteners & Hardware
    'gypsum_screws': {'pexels': 'black drywall screws gypsum', 'pixabay': 'drywall screws'},
    'screws_hardware': {'pexels': 'wood screws hardware metal', 'pixabay': 'screws metal hardware'},
    'blind_rivets': {'pexels': 'metal rivets fasteners', 'pixabay': 'rivets hardware'},
    'amerilock_door_hardware': {'pexels': 'door lock handle cylinder', 'pixabay': 'door lock handle'},
    'door_hinges': {'pexels': 'stainless steel door hinge', 'pixabay': 'door hinge metal'},
    'padlocks_and_locks': {'pexels': 'brass heavy duty padlock', 'pixabay': 'brass padlock'},
    'construction_nails': {'pexels': 'steel nails carpentry hardware', 'pixabay': 'steel nails construction'},
    'bolts_and_nuts': {'pexels': 'hex bolts and nuts steel', 'pixabay': 'bolts and nuts'},
    'cabinet_door_hardware': {'pexels': 'door hasp latch hardware', 'pixabay': 'metal latch lock'},

    # Structural & Building Materials
    'steel_c_purlins': {'pexels': 'steel beam purlin construction', 'pixabay': 'steel beam construction'},
    'steel_bars_and_beams': {'pexels': 'steel rebar metal bars', 'pixabay': 'steel rebar construction'},
    'roofing_polycarbonate_sheet': {'pexels': 'corrugated roofing sheet polycarbonate', 'pixabay': 'roofing sheet'},
    'masonry_cement_trowel': {'pexels': 'cement trowel bricklayer tool', 'pixabay': 'brick trowel masonry'},

    # Electrical & Lighting
    'led_light_bulb': {'pexels': 'led light bulb modern', 'pixabay': 'led light bulb'},
    'circuit_breaker': {'pexels': 'circuit breaker panel electrical', 'pixabay': 'circuit breaker'},
    'electrical_switch_socket': {'pexels': 'wall socket switch electrical', 'pixabay': 'wall outlet socket'},
    'electrical_wire_cable': {'pexels': 'copper electrical wire cable', 'pixabay': 'electrical wire cable'},
    'junction_box': {'pexels': 'electrical junction box conduit', 'pixabay': 'junction box electrical'},
    'electrical_accessories': {'pexels': 'electrical alligator clips connectors', 'pixabay': 'alligator clip electronics'},

    # Tools & Accessories
    'drill_bits': {'pexels': 'twist drill bit set metal', 'pixabay': 'drill bit metal'},
    'cutting_grinding_disc': {'pexels': 'angle grinder disc cutting', 'pixabay': 'grinding disc abrasive'},
    'wire_cup_brush': {'pexels': 'wire brush tool metal', 'pixabay': 'wire brush cleaning'},
    'handsaw_carpentry': {'pexels': 'handsaw woodworking carpentry tool', 'pixabay': 'hand saw wood'},
    'wood_chisel': {'pexels': 'wood chisel carpentry tool', 'pixabay': 'wood chisel'},
    'hand_tools_wrenches_pliers': {'pexels': 'combination wrench chrome tool', 'pixabay': 'combination wrench'},
    'sandpaper_abrasives': {'pexels': 'sandpaper wood sanding abrasive', 'pixabay': 'sandpaper abrasive'},
    'soldering_iron': {'pexels': 'soldering iron electronics tool', 'pixabay': 'soldering iron tool'},
    'measuring_tools': {'pexels': 'spirit level measuring tool', 'pixabay': 'spirit level tool'},
    'welding_tools': {'pexels': 'welding clamp electrode tool', 'pixabay': 'welding tool industrial'},
    'general_hardware_tool': {'pexels': 'hardware tool workshop', 'pixabay': 'hardware tools toolbox'}
}

def search_pexels(query, count=4):
    url = f"https://api.pexels.com/v1/search?query={urllib.parse.quote(query)}&per_page={count}"
    req = urllib.request.Request(url, headers={**headers, 'Authorization': pexels_key})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            data = json.loads(r.read().decode())
            # prioritize medium/large clean images
            return [p['src']['medium'] or p['src']['large'] for p in data.get('photos', [])]
    except Exception as e:
        print(f"  [Pexels fail for '{query}']: {e}")
        return []

def search_pixabay(query, count=4):
    url = f"https://pixabay.com/api/?key={pixabay_key}&q={urllib.parse.quote(query)}&image_type=photo&per_page={count}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            data = json.loads(r.read().decode())
            return [h.get('webformatURL') or h.get('largeImageURL') for h in data.get('hits', [])]
    except Exception as e:
        print(f"  [Pixabay fail for '{query}']: {e}")
        return []

image_bank = {}

print("Fetching images for all archetypes from Pexels & Pixabay...")
for archetype, qcfg in ARCHETYPE_QUERIES.items():
    images = []
    # Query Pexels
    pex_imgs = search_pexels(qcfg['pexels'], count=4)
    images.extend(pex_imgs)
    # Query Pixabay
    pix_imgs = search_pixabay(qcfg['pixabay'], count=3)
    images.extend(pix_imgs)
    
    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for img in images:
        if img and img not in seen:
            seen.add(img)
            deduped.append(img)
            
    image_bank[archetype] = deduped
    print(f"[OK] {archetype:30}: {len(deduped)} images (Pexels: {len(pex_imgs)}, Pixabay: {len(pix_imgs)})")
    time.sleep(0.15) # gentle pacing

with open('image_bank.json', 'w', encoding='utf-8') as f:
    json.dump(image_bank, f, indent=2)

print("\nSaved image bank to image_bank.json!")
