"""Local static preview and a small offline catalog/cart adapter; no upstream writes."""
from __future__ import annotations

import argparse
import base64
import hashlib
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
import secrets
import threading
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
PRODUCTS = json.loads((DIST / 'data/products.json').read_text(encoding='utf-8'))
BY_ID = {p['id']: p for p in PRODUCTS}
BY_HANDLE = {p['handle']: p for p in PRODUCTS}
VARIANTS = {str(v['id']): (p, v) for p in PRODUCTS for v in p['variants']}
COLLECTIONS = {}
COLLECTION_IDS = {}
for datafile in (DIST / 'data').glob('collection-*.json'):
    handle = datafile.stem.removeprefix('collection-')
    raw = json.loads(datafile.read_text(encoding='utf-8'))['products']
    COLLECTIONS[handle] = [BY_ID[p['id']] for p in raw if p['id'] in BY_ID]
    page = DIST / 'collections' / handle / 'index.html'
    if page.exists():
        m = re.search(r'id="collection-page"[^>]*data-id="(\d+)"', page.read_text(encoding='utf-8'))
        if m:
            COLLECTION_IDS[m.group(1)] = handle
SESSIONS = {}
LOCK = threading.RLock()
SETTINGS_FILE = ROOT / 'local-settings.json'


def local_settings():
    if SETTINGS_FILE.exists():
        return json.loads(SETTINGS_FILE.read_text(encoding='utf-8'))
    return {'plusButtonImage': '/assets/custom/quick-add.svg'}


def cart_json(items):
    return {'token': 'local-preview', 'note': '', 'attributes': {}, 'currency': 'VND',
            'items': list(items.values()), 'item_count': sum(i['quantity'] for i in items.values()),
            'total_price': sum(i['line_price'] for i in items.values()),
            'original_total_price': sum(i['line_price'] for i in items.values()),
            'total_discount': 0, 'total_weight': 0, 'requires_shipping': True}


def line_item(variant_id, quantity):
    p, v = VARIANTS[str(variant_id)]
    return {'id': v['id'], 'key': str(v['id']), 'variant_id': v['id'], 'product_id': p['id'],
            'title': p['title'], 'product_title': p['title'], 'variant_title': v['title'],
            'handle': p['handle'], 'url': p['url'], 'image': p['featured_image'],
            'featured_image': {'url': p['featured_image'], 'alt': p['title']},
            'price': v['price'], 'original_price': v['price'], 'final_price': v['price'],
            'line_price': v['price'] * quantity, 'final_line_price': v['price'] * quantity,
            'quantity': quantity, 'sku': v.get('sku'), 'vendor': p['vendor'], 'grams': v.get('weight', 0),
            'properties': {}, 'discounts': [], 'options_with_values': [
                {'name': name, 'value': value} for name, value in zip(p['options'], v['options'])],
            'requires_shipping': True, 'taxable': True, 'total_discount': 0}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.new_cookie = None
        super().__init__(*args, directory=str(DIST), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        if self.new_cookie:
            self.send_header('Set-Cookie', self.new_cookie)
        super().end_headers()

    def reply(self, data, status=200, content_type='application/json; charset=utf-8'):
        body = (json.dumps(data, ensure_ascii=False) if not isinstance(data, str) else data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def session(self):
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get('Cookie', ''))
        except Exception:
            pass
        token = cookie['mandy_local'].value if 'mandy_local' in cookie else ''
        with LOCK:
            if token not in SESSIONS:
                token = secrets.token_hex(16)
                SESSIONS[token] = {}
                self.new_cookie = f'mandy_local={token}; Path=/; HttpOnly; SameSite=Lax'
            return SESSIONS[token]

    def filtered(self, query, collection=None):
        products = list(COLLECTIONS.get(collection, []) if collection else PRODUCTS)
        q = query.get('q', [''])[0]
        ids = re.search(r'id:product in ([\d,]+)', q)
        if ids:
            wanted = {int(i) for i in ids[1].split(',')}
            products = [p for p in products if p['id'] in wanted]
        coll = re.search(r'collectionid:product=(\d+)', q)
        if coll:
            products = list(COLLECTIONS.get(COLLECTION_IDS.get(coll[1], ''), []))
        terms = re.findall(r'(?:title|tag|sku|barcode):product \*\* ([^)]*)', q)
        if not terms and q and not q.startswith('filter='):
            terms = [q]
        if terms and terms[0] != '*':
            key = terms[0].casefold()
            products = [p for p in products if key in (p['title'] + ' ' + ' '.join(p.get('tags') or []) + ' ' + ' '.join(v.get('sku') or '' for v in p['variants'])).casefold()]
        variants = re.findall(r'variant:product=([^)]*)', q)
        if variants:
            products = [p for p in products if any(value.casefold() in ' '.join(v['options']).casefold() for v in p['variants'] for value in variants)]
        prices = [(op, float(value) * 100) for op, value in re.findall(r'price:product([<>]=?|=)(\d+(?:\.\d+)?)', q)]
        for op, value in prices:
            products = [p for p in products if {'>': p['price'] > value, '>=': p['price'] >= value, '<': p['price'] < value, '<=': p['price'] <= value, '=': p['price'] == value}[op]]
        sort = query.get('sortby', query.get('sort_by', ['']))[0]
        if 'price' in sort:
            products.sort(key=lambda p: p['price'], reverse=('desc' in sort))
        elif 'title' in sort:
            products.sort(key=lambda p: p['title'].casefold(), reverse=('desc' in sort))
        elif 'created' in sort:
            products.sort(key=lambda p: p['created_at'], reverse=('desc' in sort))
        total = len(products)
        try:
            limit = max(1, min(250, int(query.get('limit', ['50'])[0])))
            page = max(1, int(query.get('page', ['1'])[0]))
        except ValueError:
            limit, page = 50, 1
        return {'products': products[(page - 1) * limit:page * limit], 'total': total}

    def do_GET(self):
        u = urlsplit(self.path)
        path = unquote(u.path).rstrip('/') or '/'
        query = parse_qs(u.query)
        if path == '/__local/settings':
            return self.reply(local_settings())
        if path == '/cart.js':
            return self.reply(cart_json(self.session()))
        if path == '/account.js':
            return self.reply({'customer': None})
        if path in ('/search.js', '/products.json'):
            return self.reply(self.filtered(query))
        if re.fullmatch(r'/collections/[^/]+/products.json', path):
            return self.reply(self.filtered(query, path.split('/')[2]))
        if re.fullmatch(r'/products/[^/]+\.(js|json)', path):
            p = BY_HANDLE.get(path.split('/')[2].rsplit('.', 1)[0])
            return self.reply(p or {'error': 'Product not found'}, 200 if p else 404)
        if path.startswith('/collections/') and '/products/' in path:
            path = '/products/' + path.rsplit('/', 1)[1]
        if query.get('view') == ['pagination']:
            collection = path.split('/')[2] if path.startswith('/collections/') else None
            total = self.filtered({**query, 'limit': ['250'], 'page': ['1']}, collection)['total']
            page = max(1, int(query.get('page', ['1'])[0]))
            count = max(1, (total + 35) // 36)
            links = ['<div id="pagination" class="pagination-wrapper">']
            for number in range(1, count + 1):
                if number == page:
                    links.append(f'<span class="page-node current">{number}</span>')
                else:
                    links.append(f'<a class="page-node" href="{path}?page={number}" data-link="{number}" data-page="{number}">{number}</a>')
            links.append('</div>')
            return self.reply(''.join(links), content_type='text/html; charset=utf-8')
        if path.startswith('/checkouts/'):
            path = '/checkout'
        relative = Path(path.lstrip('/'))
        dest = (DIST / relative).resolve()
        if not dest.is_relative_to(DIST.resolve()):
            return self.send_error(403)
        if 'page' in query and query['page'][0].isdigit():
            paged = dest / ('__page_' + query['page'][0]) / 'index.html'
            if paged.exists():
                dest = paged
        if dest.is_dir():
            dest = dest / 'index.html'
        # Haravan creates responsive image URLs dynamically. Serve the captured original.
        if not dest.exists() and path.startswith('/assets/'):
            original = re.sub(r'_(?:pico|icon|thumb|small|compact|medium|large|grande|master|\d+x\d*)(?:_crop_[a-z]+)?(?=\.[^.]+$)', '', dest.name)
            if original != dest.name and dest.with_name(original).exists():
                dest = dest.with_name(original)
        if dest.is_file():
            self.path = '/' + dest.relative_to(DIST).as_posix()
            return super().do_GET()
        return self.send_error(404, 'Page or asset unavailable in captured source. See mirror-report.json.')

    def do_POST(self):
        path = urlsplit(self.path).path
        length = int(self.headers.get('Content-Length', '0'))
        if length > 3 * 1024 * 1024:
            return self.reply({'error': 'Ảnh tối đa 2 MB.'}, 413)
        size = length
        raw = self.rfile.read(size).decode('utf-8')
        try:
            data = json.loads(raw) if 'application/json' in self.headers.get('Content-Type', '') else {k: v[0] for k, v in parse_qs(raw, keep_blank_values=True).items()}
        except (ValueError, TypeError):
            return self.reply({'error': 'Invalid request'}, 400)
        if path == '/__local/settings':
            # Settings can only be saved by our local editor page.
            origin = self.headers.get('Origin', '')
            if origin != 'http://' + self.headers.get('Host', ''):
                return self.reply({'error': 'Invalid origin'}, 403)
            if data.get('reset'):
                settings = {'plusButtonImage': '/assets/custom/quick-add.svg'}
            else:
                try:
                    match = re.fullmatch(r'data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)', data.get('image', ''))
                    if not match:
                        raise ValueError('Dùng ảnh PNG, JPG hoặc WebP.')
                    kind, payload = match.groups()
                    image = base64.b64decode(payload, validate=True)
                    valid = (kind == 'png' and image.startswith(b'\x89PNG\r\n\x1a\n')) or (kind == 'jpeg' and image.startswith(b'\xff\xd8\xff')) or (kind == 'webp' and image.startswith(b'RIFF') and image[8:12] == b'WEBP')
                    if not valid or not image or len(image) > 2 * 1024 * 1024:
                        raise ValueError('Ảnh không hợp lệ hoặc vượt quá 2 MB.')
                    name = 'quick-add-upload.' + {'jpeg': 'jpg'}.get(kind, kind)
                    (DIST / 'assets/custom' / name).write_bytes(image)
                    settings = {'plusButtonImage': '/assets/custom/' + name + '?v=' + hashlib.sha256(image).hexdigest()[:10]}
                except (ValueError, TypeError) as exc:
                    return self.reply({'error': str(exc)}, 400)
            SETTINGS_FILE.write_text(json.dumps(settings, ensure_ascii=False, indent=2), encoding='utf-8')
            return self.reply(settings)
        if not path.startswith('/cart/') and path != '/cart':
            return self.reply({'error': 'Bản frontend cục bộ chưa kết nối đăng nhập hay gửi biểu mẫu.'}, 501)
        items = self.session()
        try:
            with LOCK:
                result = None
                if path in ('/cart/add.js', '/cart/add'):
                    variant_id = str(data['id'])
                    quantity = max(0, int(data.get('quantity', 1))) + items.get(variant_id, {}).get('quantity', 0)
                    result = items[variant_id] = line_item(variant_id, quantity)
                elif path == '/cart/clear.js':
                    items.clear()
                elif path in ('/cart/change.js', '/cart/update.js', '/cart'):
                    updates = data.get('updates', {})
                    if 'id' in data:
                        updates[str(data['id'])] = int(data.get('quantity', 0))
                    if 'line' in data:
                        updates[list(items)[int(data['line']) - 1]] = int(data.get('quantity', 0))
                    for key, value in data.items():
                        m = re.fullmatch(r'updates\[(\d+)\]', key)
                        if m:
                            updates[m[1]] = int(value)
                    for variant_id, quantity in updates.items():
                        variant_id, quantity = str(variant_id), max(0, int(quantity))
                        if quantity:
                            items[variant_id] = line_item(variant_id, quantity)
                        else:
                            items.pop(variant_id, None)
                else:
                    return self.reply({'error': 'Local preview endpoint unavailable'}, 501)
                return self.reply(result if result else cart_json(items))
        except (KeyError, ValueError, IndexError, TypeError):
            return self.reply({'status': 422, 'description': 'Sản phẩm hoặc số lượng không hợp lệ.'}, 422)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4173)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Local: http://127.0.0.1:{args.port}', flush=True)
    print('Edit dist/ files and refresh the browser. Ctrl+C to stop.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
