"""Capture catalog membership and extract the product JSON already in public HTML."""
import concurrent.futures as futures
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit
from mirror import ROOT, SOURCE, ORIGIN, fetch

sys.stdout.reconfigure(encoding='utf-8')
out = SOURCE / 'data'
out.mkdir(exist_ok=True)
products = []
for path in sorted((SOURCE / 'pages' / 'products').glob('*/index.html')):
    text = path.read_text(encoding='utf-8')
    match = re.search(r'productjson:\s*(\{[^\n]+\}),?\s*\n', text)
    if match:
        products.append(json.loads(match.group(1)))
(out / 'products.json').write_text(json.dumps(products, ensure_ascii=False), encoding='utf-8')
print('Extracted products:', len(products), flush=True)
urls = json.loads((SOURCE / 'sitemap-urls.json').read_text(encoding='utf-8'))
handles = sorted({urlsplit(u).path.rsplit('/', 1)[1] for u in urls if '/collections/' in u} | {'all'})

def capture(handle):
    dest = out / ('collection-' + handle + '.json')
    products = []
    seen = set()
    for page in range(1, 30):
        body, ct, final = fetch(f'{ORIGIN}/collections/{handle}/products.json?limit=250&page={page}')
        data = json.loads(body)
        batch = data.get('products', [])
        fresh = [p for p in batch if p['id'] not in seen]
        products.extend(fresh)
        seen.update(p['id'] for p in fresh)
        if not fresh:
            break
    dest.write_text(json.dumps({'products': products}, ensure_ascii=False), encoding='utf-8')
    return handle, len(products)

with futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(capture, handles):
        print('Collection:', *result, flush=True)
