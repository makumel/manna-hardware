import urllib.request
import urllib.parse
import json
import re

def search_ddg(query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = 'https://duckduckgo.com/?q=' + urllib.parse.quote_plus(query) + '&iax=images&ia=images'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'vqd=([0-9-_]+)', html) or re.search(r'vqd="([^"]+)"', html)
            if not m:
                return []
            vqd = m.group(1)
            api_url = f'https://duckduckgo.com/i.js?l=wt-wt&o=json&q={urllib.parse.quote_plus(query)}&vqd={vqd}&f=,,,&p=1'
            req2 = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req2, timeout=5) as resp2:
                data = json.loads(resp2.read().decode('utf-8'))
                return data.get('results', [])
    except Exception as e:
        print('Error:', e)
        return []

if __name__ == '__main__':
    for q in ['C-purlins Philippines', 'Island Paint QDE Nile Green Philippines', 'Shark SF2408 Faucet Philippines']:
        res = search_ddg(q)
        print(f"=== {q} ({len(res)} results) ===")
        for r in res[:2]:
            print(f"  URL: {r.get('image')}\n  Title: {r.get('title')}\n")
