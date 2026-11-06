"""Restore the lace divider and populate a preview carousel from existing photos.

Catalog data is unchanged. Products without photos receive preview-only imagery
in custom.js, including cards inserted by filtering and pagination.
"""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
products = json.loads((DIST / 'data/products.json').read_text(encoding='utf-8'))
by_handle = {product['handle']: product for product in products}


def block_end(text, start, tag='div'):
    depth = 0
    for token in re.finditer(r'</?' + tag + r'\b[^>]*>', text[start:]):
        depth += -1 if token[0].startswith('</') else 1
        if depth == 0:
            return start + token.end()
    raise ValueError(f'Unclosed {tag}')


def canonical(url):
    return re.sub(r'_(?:compact|grande|master|1024x1024)(?=\.)', '', url)


home_path = DIST / 'index.html'
home = home_path.read_text(encoding='utf-8')
banner = '''<section class="section section-bannergif">
  <a href="/collections/all"><img src="/assets/cdn.hstatic.net/files/200001179192/file/bannergif.png" alt="Mandy Crimson — pink lace" width="1726" height="140" loading="eager" decoding="async"></a>
</section>'''
home, count = re.subn(r'<section class="section section-bannergif">.*?</section>', lambda match: banner, home, count=1, flags=re.S)
if count != 1:
    raise ValueError('Expected one lace banner')

# Preserve the original sample card and its real three-colour selector. Its
# first photo is the yellow hat, so omit that duplicate card from this demo.
preferred = ['san-pham-mau', 'sailor-hat-mint', 'smocked-mini-skirt',
             'suki-bolero-aquamarine', 'suki-bolero-pink', 'suki-bolero-white',
             'suki-bolero-yellow', 'tailor-rosette']
ordered = [by_handle[handle] for handle in preferred]
ordered += [product for product in products if product['handle'] not in preferred]
pool, seen = [], set()
for product in ordered:
    if product['handle'] == 'sailor-hat-yellow':
        continue
    images = product['images'][:1] if product['handle'] == 'san-pham-mau' else product['images']
    for image in images:
        image = canonical(image)
        if image in seen or not (DIST / image.lstrip('/')).is_file():
            continue
        seen.add(image)
        sized = re.sub(r'(\.[^.]+)$', r'_grande\1', image)
        pool.append({'handle': product['handle'], 'image': sized if (DIST / sized.lstrip('/')).is_file() else image})
if not pool:
    raise ValueError('No existing product photographs')
(DIST / 'data/preview-media.json').write_text(json.dumps(pool, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

wishlist = re.search(r'<button\b[^>]*class="product-btn glass js-wishlist"[^>]*>(.*?)</button>', home, re.S)[1]
plus = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M6.5 0h3v6.5H16v3H9.5V16h-3V9.5H0v-3h6.5z" fill="currentColor"/></svg>'


def card(item, index):
    product = by_handle[item['handle']]
    title = html.escape(product['title'], quote=True)
    handle, product_id = product['handle'], product['id']
    url = '/products/' + handle
    price = f"{round(product['price'] / 100):,}".replace(',', '.') + '₫'
    badge = '' if product['available'] else '<span class="badge-soldout glass">Hết hàng</span>'
    compare = product.get('compare_at_price') or 0
    if compare > product['price']:
        discount = round((1 - product['price'] / compare) * 100)
        badge += f'<span class="badge-percent-sale glass">-{discount}%</span>'
    second = pool[(index + len(pool) // 2) % len(pool)]['image']
    return f'''<div class="swiper-slide"><div class="product-loop normal"><div class="product-loop--wrap" data-prid="{product_id}">
  <div class="product-loop--head">
    <div class="product-loop--badges">{badge}</div>
    <div class="product-loop--img">
      <picture class="img-first"><img class="img-default" src="{item['image']}" alt="{title}" loading="eager" decoding="async"></picture>
      <picture class="img-second"><img class="img-default" src="{second}" alt="Ảnh minh họa hiệu ứng" loading="eager" decoding="async"></picture>
    </div>
    <a href="{url}" class="product-loop--link" aria-label="{title}"></a>
    <div class="product-loop--btn"><button class="product-btn glass js-wishlist" data-id="{product_id}" data-handle="{handle}" aria-label="Wishlist">{wishlist}</button></div>
  </div>
  <div class="product-loop--body"><div class="product-loop--info">
    <div class="product-loop--detail"><h3 class="product-loop--name"><a href="{url}" title="{title}">{title}</a></h3><div class="product-loop--prices"><div class="price-current normal"><span>{price}</span></div></div></div>
    <div class="product-loop--btn plus"><a href="{url}" class="product-btn product-btn--plus" aria-label="{title}">{plus}</a></div>
  </div></div>
</div></div></div>'''


match = re.search(r'<div class="products-slide swiper-wrapper"[^>]*>', home)
if not match:
    raise ValueError('Expected New Arrivals carousel')
end = block_end(home, match.start())
home = home[:match.end()] + '\n' + '\n'.join(card(item, index) for index, item in enumerate(pool)) + '\n</div>' + home[end:]
home_path.write_text(home, encoding='utf-8')
# Preserve the existing compatibility alias after updating homepage content.
alias = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>/page-2', home, count=1)
(DIST / 'page-2/index.html').write_text(alias, encoding='utf-8')
print(f'Restored lace divider; {len(pool)} distinct existing product photos in New Arrivals.')
