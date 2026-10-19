import json
import hashlib
from classify_items import get_product_archetype

with open('catalog.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

with open('image_bank.json', 'r', encoding='utf-8') as f:
    image_bank = json.load(f)

default_generic = [
    "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
    "https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
]

updated_items = []
for p in items:
    # 1. Clean Rebrand ID
    old_id = p.get('id', '')
    new_id = old_id.replace('FAN-', 'MNA-')
    
    # 2. Clean Rebrand Description
    desc = p.get('description', '')
    desc = desc.replace('Fanvill Hardware Cabalwan Tacloban', 'Manna Hardware & Building Supply')
    desc = desc.replace('Fanvill', 'Manna')
    
    # 3. Determine Archetype & Assign Verified Image
    arch = get_product_archetype(p)
    imgs = image_bank.get(arch) or default_generic
    
    # Consistent hash-based selection so each product gets a stable photo from the pool
    name_hash = int(hashlib.md5(p['name'].encode('utf-8')).hexdigest(), 16)
    assigned_img = imgs[name_hash % len(imgs)] if imgs else default_generic[0]
    
    item_copy = {
        **p,
        'id': new_id,
        'description': desc,
        'image': assigned_img,
        'archetype': arch
    }
    updated_items.append(item_copy)

# Save to root catalog.json
with open('catalog.json', 'w', encoding='utf-8') as f:
    json.dump(updated_items, f, indent=2)

# Save to storefront-app/src/catalog.json
with open('storefront-app/src/catalog.json', 'w', encoding='utf-8') as f:
    json.dump(updated_items, f, indent=2)

print(f"Successfully enriched all {len(updated_items)} items with Pexels/Pixabay stock images and MNA- IDs!")
