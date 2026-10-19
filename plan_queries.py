import json
import re

with open('catalog.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

def clean_query(name):
    # Simplify for search
    q = re.sub(r'[\(\)#\"\'/]', ' ', name)
    q = re.sub(r'\b(pc|box|roll|bot|gln|gl|kg|set|asstd)\b', '', q, flags=re.IGNORECASE)
    q = re.sub(r'\s+', ' ', q).strip()
    return f"{q} Philippines"

queries = {}
for item in items:
    q = clean_query(item['name'])
    queries.setdefault(q, []).append(item['id'])

print(f"Total catalog items: {len(items)}")
print(f"Total distinct search queries: {len(queries)}")

sample_queries = list(queries.keys())[:15]
print("\nSample queries:")
for sq in sample_queries:
    print(f"  • '{sq}' ({len(queries[sq])} products)")
