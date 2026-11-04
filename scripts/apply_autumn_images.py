"""Use the six supplied campaign photos in marketing slots, preserving catalog photos."""
from pathlib import Path
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SOURCE = Path('C:/Users/HP/Downloads/IgAutumn')
ASSETS = DIST / 'assets/custom/autumn'
ASSETS.mkdir(parents=True, exist_ok=True)
photos = {
    'leaves': 'end of autumn but it’s 2022.jpg',
    'wardrobe': 'end of autumn but it’s 2022 (1).jpg',
    'park': 'end of autumn but it’s 2022 (2).jpg',
    'bookshop': 'end of autumn but it’s 2022 (3).jpg',
    'kitchen': 'end of autumn but it’s 2022 (4).jpg',
    'lockets': 'end of autumn but it’s 2022 (5).jpg',
}
for name, filename in photos.items():
    source = SOURCE / filename
    if source.exists():
        shutil.copy2(source, ASSETS / (name + '.jpg'))
    elif not (ASSETS / (name + '.jpg')).exists():
        raise FileNotFoundError(source)

PREFIX = '/assets/custom/autumn/'
OLD = '/assets/cdn.hstatic.net/files/200001179192/file/'
replacements = {
    OLD + 'home_newarrival_img.webp': PREFIX + 'wardrobe.jpg',
    OLD + 'bannergif.png': PREFIX + 'lockets.jpg',
    OLD + 'rectangle_16.jpg': PREFIX + 'wardrobe.jpg',
    OLD + 'rectangle_16.png': PREFIX + 'lockets.jpg',
    OLD + 'rectangle_16__2_.jpg': PREFIX + 'kitchen.jpg',
    OLD + 'rectangle_16__1_.jpg': PREFIX + 'bookshop.jpg',
    '/assets/cdn.hstatic.net/files/200001060995/file/banner-1.jpg': PREFIX + 'park.jpg',
    OLD + 'frame_267__1_.jpg': PREFIX + 'bookshop.jpg',
    OLD + 'rectangle_35__1_.jpg': PREFIX + 'kitchen.jpg',
}
attribute = re.compile(r'([\w:-]+)\s*=\s*(["\'])(.*?)\2', re.S)


def eager_campaign_image(match):
    raw = match.group()
    attrs = {name: html.unescape(value) for name, quote, value in attribute.findall(raw)}
    src = attrs.get('data-src', attrs.get('src', ''))
    if not src.startswith(PREFIX):
        return raw
    attrs['src'] = src
    attrs.pop('data-src', None)
    attrs['loading'] = 'eager'
    attrs['decoding'] = 'async'
    attrs['class'] = ' '.join(c for c in attrs.get('class', '').split() if c not in ('lazyload', 'lazyloading', 'lazyloaded'))
    if not attrs['class']:
        del attrs['class']
    return '<img ' + ' '.join(f'{key}="{html.escape(value, quote=True)}"' for key, value in attrs.items()) + '>'


def finish_home_campaign(text):
    """Give campaign photos intentional destinations and preserve each card's subject."""
    text = text.replace('https://www.mandycrimson.com/collections/new-arrivals', '/collections/hot-products')
    text = re.sub(
        r'(<section\b[^>]*class="[^"]*section-bannergif[^"]*"[^>]*>\s*<a\b[^>]*href=")[^"]*',
        r'\g<1>/collections/all', text)
    text = text.replace('alt="Banner GIF"', 'alt="Autumn details — heart lockets"')
    text = text.replace('Autumn details — les médaillons en cœur', 'Autumn details — heart lockets')
    destinations = {'kitchen': '/collections/set', 'bookshop': '/collections/all', 'park': '/collections/hot-products'}
    def card(match):
        markup = match.group()
        photo = re.search(r'/assets/custom/autumn/(\w+)\.jpg', markup)
        if not photo or photo[1] not in destinations:
            return markup
        markup = re.sub(r'href="[^"]*"', f'href="{destinations[photo[1]]}"', markup, count=1)
        # An unrelated close-up on every hover obscures the story in these photos.
        return re.sub(r'<img\b[^>]*class="lookbook-card--hover"[^>]*>\s*', '', markup)
    return re.sub(r'<a\b[^>]*class="lookbook-card[^\"]*"[^>]*>.*?</a>', card, text, flags=re.S)


for path in DIST.rglob('*.html'):
    if '__editor' in path.parts or 'checkout' in path.parts or 'page-2' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    for old, new in replacements.items():
        text = text.replace(old, new)
    if path == DIST / 'index.html':
        hero = re.search(r'<section\b[^>]*class="[^"]*section-mainslider[^"]*"[^>]*>.*?</section>', text, re.S)
        if hero:
            images = iter([('leaves', 'Autumn — sắc lá mùa thu'), ('park', 'Autumn — buổi chiều dưới tán cây'), ('bookshop', 'Autumn — những ngày ở hiệu sách')])
            def picture(match):
                name, alt = next(images)
                priority = ' fetchpriority="high"' if name == 'leaves' else ''
                return f'<picture><img src="{PREFIX}{name}.jpg" alt="{alt}" data-campaign-image="{name}" width="3264" height="2450" loading="eager" decoding="async"{priority}></picture>'
            updated = re.sub(r'<picture>.*?</picture>', picture, hero.group(), flags=re.S)
            updated = updated.replace('href=""', 'href="/collections/all"')
            text = text[:hero.start()] + updated + text[hero.end():]
        text = text.replace('aria-label="Banner GIF"', 'aria-label="Autumn details"')
        text = finish_home_campaign(text)
    text = re.sub(r'<img\b[^>]*>', eager_campaign_image, text)
    path.write_text(text, encoding='utf-8')

manifest = {'source_directory': str(SOURCE), 'photos': {name: {'original': filename, 'local': PREFIX + name + '.jpg'} for name, filename in photos.items()},
            'placements': {'hero': ['leaves', 'park', 'bookshop'], 'new_arrivals': 'wardrobe', 'detail_banner': 'lockets', 'lookbook': ['wardrobe', 'kitchen', 'bookshop', 'park'], 'about_us': ['bookshop', 'kitchen']}}
(ROOT / 'feedback/autumn-images.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print('Applied all 6 supplied autumn photos to hero, New Arrivals, banner, lookbook and About us.')
