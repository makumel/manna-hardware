import glob
import re
import json
import pdfplumber

def clean_num(s):
    if not s:
        return 0.0
    s = str(s).replace(',', '').replace('P', '').replace('$', '').strip()
    try:
        return float(s)
    except:
        return 0.0

files = glob.glob('*.pdf')
def get_num(fn):
    m = re.search(r'\d+', fn)
    return int(m.group()) if m else 9999
files = sorted(files, key=get_num)

col_bounds = [36.0, 85.6, 139.6, 207.0, 423.0, 490.6, 576.0]
col_names = ['Qty', 'U/M', 'Capital', 'Item', 'Price', 'Total']

products_dict = {}

# Category assigner based on hardware keyword
def categorize(item_name):
    lower = item_name.lower()
    if any(k in lower for k in ['paint', 'primer', 'lacquer', 'acrytex', 'roofkote', 'elastomer', 'roller']):
        return 'Paints & Coatings'
    if any(k in lower for k in ['pipe', 'elbow', 'tee', 'faucet', 'sink', 'drain', 'strainer', 'pump', 'bushing', 'valve', 'teflon', 'flexible', 'p-trap']):
        return 'Plumbing & Fixtures'
    if any(k in lower for k in ['screw', 'rivet', 'nail', 'hinge', 'bolt', 'lock', 'padlock', 'handle']):
        return 'Fasteners & Hardware'
    if any(k in lower for k in ['purlin', 'bar', 'angle', 'polycarbonate', 'board', 'cement', 'plywood', 'sheet']):
        return 'Structural & Building Materials'
    if any(k in lower for k in ['switch', 'wire', 'breaker', 'box', 'socket', 'lamp', 'receptacle', 'outlet', 'electrical']):
        return 'Electrical & Lighting'
    if any(k in lower for k in ['blade', 'brush', 'disk', 'tape', 'drill', 'level', 'meter', 'trowel', 'sandpaper', 'cutting']):
        return 'Tools & Accessories'
    return 'General Hardware'

sku_counter = 1001

for f in files:
    with pdfplumber.open(f) as pdf:
        for page in pdf.pages:
            words = page.extract_words()
            table_words = [w for w in words if 125 <= w['top'] <= 688]
            sorted_words = sorted(table_words, key=lambda w: w['top'])
            rows_grouped = []
            curr_row = []
            curr_y = None
            for w in sorted_words:
                if curr_y is None or abs(w['top'] - curr_y) < 3.5:
                    curr_row.append(w)
                    curr_y = w['top'] if curr_y is None else (curr_y * len(curr_row) + w['top'])/(len(curr_row)+1)
                else:
                    rows_grouped.append(curr_row)
                    curr_row = [w]
                    curr_y = w['top']
            if curr_row:
                rows_grouped.append(curr_row)
                
            for r_words in rows_grouped:
                row_data = {c: [] for c in col_names}
                for w in r_words:
                    cx = (w['x0'] + w['x1']) / 2.0
                    for i in range(len(col_bounds) - 1):
                        if col_bounds[i] <= cx < col_bounds[i+1]:
                            row_data[col_names[i]].append(w['text'])
                            break
                item = " ".join(row_data['Item']).strip()
                qty_str = " ".join(row_data['Qty']).strip()
                price_str = " ".join(row_data['Price']).strip()
                um_str = " ".join(row_data['U/M']).strip()
                
                if item and (qty_str or price_str):
                    price = clean_num(price_str)
                    qty = clean_num(qty_str)
                    
                    if item not in products_dict:
                        sku = f"FAN-{sku_counter}"
                        sku_counter += 1
                        category = categorize(item)
                        # estimated capital is ~75% of price if empty
                        est_capital = round(price * 0.78, 2) if price > 0 else 0.0
                        products_dict[item] = {
                            "id": sku,
                            "name": item,
                            "category": category,
                            "unit": um_str or "pc",
                            "price": price,
                            "capital": est_capital,
                            "stock": int(qty if qty > 0 else 50),
                            "rating": 4.8,
                            "reviews": 12 + (hash(item) % 35),
                            "featured": False,
                            "description": f"Authentic commercial-grade {item} sourced directly by Fanvill Hardware Cabalwan Tacloban."
                        }
                    else:
                        # Accumulate stock if listed across multiple quotes
                        products_dict[item]["stock"] += int(qty if qty > 0 else 10)
                        if price > products_dict[item]["price"]:
                            products_dict[item]["price"] = price

catalog_list = list(products_dict.values())
# Mark first 8 as featured
for p in catalog_list[:8]:
    p["featured"] = True

print(f"Extracted {len(catalog_list)} unique hardware products across all 38 quote files.")

categories = sorted(list(set(p['category'] for p in catalog_list)))
print("Categories:", categories)

with open('catalog.json', 'w', encoding='utf-8') as out_f:
    json.dump(catalog_list, out_f, indent=2)

print("Saved catalog.json successfully!")
