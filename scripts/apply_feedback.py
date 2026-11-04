"""Idempotently apply feedback markup after mirroring. Does not overwrite custom CSS/JS."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
BOW = '/assets/cdn.hstatic.net/themes/200001179192/1001519910/14/logo-bow.png'
banner = '''<section class="footer-reveal" id="footer-reveal" aria-label="Mandy Crimson">
  <div class="footer-reveal__bow"><img src="/assets/cdn.hstatic.net/files/200001179192/file/logo-no.webp" alt="" width="168" height="125"></div>
  <div class="footer-reveal__window"><div class="footer-reveal__background" role="img" aria-label="Girlhood — bên bờ biển cùng những nốt nhạc"></div></div>
  <div class="footer-reveal__hold" aria-hidden="true"></div>
'''


def remove_block(text, tag, class_name, unwrap=False):
    """Remove a complete HTML block, accounting for nested div/section tags."""
    opening = re.compile(r'<' + tag + r'\b[^>]*class=["\'][^"\']*\b' + re.escape(class_name) + r'\b[^"\']*["\'][^>]*>', re.I)
    while match := opening.search(text):
        depth = 0
        for token in re.finditer(r'</?' + tag + r'\b[^>]*>', text[match.start():], re.I):
            depth += -1 if token.group().startswith('</') else 1
            if depth == 0:
                inner = text[match.end():match.start() + token.start()] if unwrap else ''
                text = text[:match.start()] + inner + text[match.start() + token.end():]
                break
        else:
            raise ValueError('Unbalanced ' + class_name)
    return text

for path in DIST.rglob('*.html'):
    if '__editor' in path.parts or 'checkout' in path.parts or 'page-2' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'<link\b[^>]*rel=["\'](?:shortcut )?icon["\'][^>]*>', f'<link rel="icon" href="{BOW}" type="image/png">', text)
    if '<script src="/custom.js" defer></script>' not in text:
        text = text.replace('</body>', '<script src="/custom.js" defer></script>\n</body>')
    if 'layout-aboutus' in text:
        text = re.sub(r'<section\b[^>]*class="[^"]*section-counter[^"]*"[^>]*>.*?</section>', '', text, flags=re.S)
    text = re.sub(r'<li\b[^>]*>\s*<a\b[^>]*aria-label="Facebook"[^>]*>.*?</a>\s*</li>', '', text, flags=re.S|re.I)
    text = text.replace('href="/" title="Terms"', 'href="/pages/terms" title="Terms"')
    text = re.sub(r'href="/"(\s*>Terms</a>)', r'href="/pages/terms"\1', text)
    path.write_text(text, encoding='utf-8')

home = (DIST / 'index.html').read_text(encoding='utf-8')
# Comparison controls belong to the two home variants, not generated content pages.
home = re.sub(r'<nav\b[^>]*id="bow-comparison"[^>]*>.*?</nav>\s*', '', home, flags=re.S)
home = re.sub(r'\s*data-bow-variant="[^"]*"', '', home)
home = re.sub(r'<link rel="stylesheet" href="/bow-comparison\.css(?:\?[^\"]*)?">\s*', '', home)
home = re.sub(r'<script src="/bow-comparison\.js(?:\?[^\"]*)?" defer></script>\s*', '', home)
coming = re.sub(r'<main\b[^>]*>.*?</main>', '<main class="main-body coming-soon-page"><h1>Coming soon</h1></main>', home, count=1, flags=re.S)
coming = re.sub(r'<title>.*?</title>', '<title>Coming soon – Mandy Crimson</title>', coming, count=1, flags=re.S)
coming = coming.replace('temp-index', 'temp-page')
coming = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>/pages/coming-soon', coming)
target = DIST / 'pages/coming-soon/index.html'
target.parent.mkdir(exist_ok=True)
target.write_text(coming, encoding='utf-8')

# One fixed-background reveal replaces the old Girlblogging background AND the
# mistakenly added image banner. Place it immediately before the real footer.
count = 0
for path in DIST.rglob('*.html'):
    if '__editor' in path.parts or 'page-2' in path.parts:
        continue
    text = path.read_text(encoding='utf-8')
    text = remove_block(text, 'div', 'banner-thanks')
    text = remove_block(text, 'section', 'section-bannerfull')
    # Preserve the footer inside the shared scene when refreshing its markup.
    text = remove_block(text, 'section', 'footer-reveal', unwrap=True)
    text = remove_block(text, 'div', 'footer-reveal__bow')
    text = remove_block(text, 'div', 'footer-reveal__window')
    text = remove_block(text, 'div', 'footer-reveal__hold')
    if 'href="/footer-reveal.css"' not in text:
        text = text.replace('</head>', '<link rel="stylesheet" href="/footer-reveal.css">\n</head>')
    if 'src="/footer-reveal.js"' not in text:
        text = text.replace('</body>', '<script src="/footer-reveal.js" defer></script>\n</body>')
    if '<footer' not in text:
        text = text.replace('</body>', '<footer class="main-footer footer-reveal--simple"><a href="/">Mandy Crimson</a><a href="/pages/faqs">Help</a><a href="/pages/coming-soon">Coming soon</a></footer>\n</body>')
    text = re.sub(r'[\t \r\n]+(?=<footer\b)', '\n', text)
    text = re.sub(r'(</footer>)[\t \r\n]*', r'\1\n', text)
    text = text.replace('<footer', banner + '\n<footer', 1)
    text = text.replace('</footer>', '</footer>\n</section>', 1)
    if 'checkout' in path.parts:
        text = text.replace('<header>', '<header class="checkout-header">')
    path.write_text(text, encoding='utf-8')
    count += 1
print(f'Applied Canva feedback; one pinned photo scene on {count} storefront pages.')
