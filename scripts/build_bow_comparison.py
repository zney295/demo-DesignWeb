"""Share the selected bow, photo and footer across storefront pages."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
home_path = DIST / 'index.html'
home = home_path.read_text(encoding='utf-8')
home = re.sub(r'<nav\b[^>]*id="bow-comparison"[^>]*>.*?</nav>\s*', '', home, flags=re.S)
home = re.sub(r'\s*data-bow-variant="[^"]*"', '', home)
home = re.sub(r'<link rel="stylesheet" href="/(?:bow-comparison|footer-reveal)\.css(?:\?[^\"]*)?">\s*', '', home)
home = re.sub(r'<script src="/(?:bow-comparison|footer-reveal)\.js(?:\?[^\"]*)?" defer></script>\s*', '', home)
if 'id="comparison-footer"' not in home:
    home = home.replace('<footer ', '<footer id="comparison-footer" ', 1)

photo_section = '''<div class="bow-comparison__region">
  <div class="bow-comparison__bar" aria-hidden="true"></div>
  <div class="bow-comparison__bow" aria-hidden="true"><img src="/assets/cdn.hstatic.net/files/200001179192/file/logo-no.webp" alt="" width="168" height="125" decoding="async"></div>
<section class="bow-photo-section" id="footer-reveal" aria-label="Autumn">
  <img class="bow-comparison__photo" src="/assets/custom/autumn/leaves.jpg" alt="Chân dung giữa lá mùa thu" width="3264" height="2450" loading="eager" decoding="async">
</section>'''

home, count = re.subn(
    r'<section class="footer-reveal" id="footer-reveal"[^>]*>.*?(<footer\b.*?</footer>)\s*</section>',
    lambda match: photo_section + '\n' + match[1] + '\n</div>', home, count=1, flags=re.S)
if not count:
    # Rebuilding is idempotent; refresh may also restore the original scene.
    home, count = re.subn(
        r'<div class="bow-comparison__region">.*?(<footer\b.*?</footer>)\s*</div>',
        lambda match: photo_section + '\n' + match[1] + '\n</div>', home, count=1, flags=re.S)
if count != 1:
    raise ValueError('Expected one photo/footer scene.')

home = home.replace('<body ', '<body data-bow-variant="header" ', 1)
home = re.sub(r'<title>.*?</title>', '<title>Mandy Crimson</title>', home, count=1, flags=re.S)
home = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>/', home, count=1)
home = home.replace('</head>', '<link rel="stylesheet" href="/bow-comparison.css?v=6">\n</head>', 1)
home = home.replace('</body>', '<script src="/bow-comparison.js?v=6" defer></script>\n</body>', 1)
home_path.write_text(home, encoding='utf-8')

# Use the same scene and controller on collections, products and content pages.
# Retain the dedicated checkout and local image editor layouts.
footer = re.search(r'<footer\b.*?</footer>', home, re.S)[0]
scene = photo_section + '\n' + footer + '\n</div>'
shared_pages = 0
for page in DIST.rglob('*.html'):
    if page == home_path or any(part in page.parts for part in ('page-2', 'checkout', '__editor')):
        continue
    text = page.read_text(encoding='utf-8')
    if 'class="main-header"' not in text:
        continue
    page_scene = scene
    if page == DIST / 'pages/about-us-1/index.html':
        page_scene = re.sub(r'<section class="bow-photo-section".*?</section>', '', scene, count=1, flags=re.S)
    text, changed = re.subn(
        r'<section class="footer-reveal" id="footer-reveal"[^>]*>.*?<footer\b.*?</footer>\s*</section>'
        r'|<div class="bow-comparison__region">.*?<footer\b.*?</footer>\s*</div>',
        lambda match: page_scene, text, count=1, flags=re.S)
    if changed != 1:
        raise ValueError(f'Expected one footer scene in {page}')
    text = re.sub(r'\s*data-bow-variant="[^"]*"', '', text)
    text = text.replace('<body ', '<body data-bow-variant="header" ', 1)
    text = re.sub(r'<link rel="stylesheet" href="/(?:bow-comparison|footer-reveal)\.css(?:\?[^\"]*)?">\s*', '', text)
    text = re.sub(r'<script src="/(?:bow-comparison|footer-reveal)\.js(?:\?[^\"]*)?" defer></script>\s*', '', text)
    text = text.replace('</head>', '<link rel="stylesheet" href="/bow-comparison.css?v=6">\n</head>', 1)
    text = text.replace('</body>', '<script src="/bow-comparison.js?v=6" defer></script>\n</body>', 1)
    page.write_text(text, encoding='utf-8')
    shared_pages += 1
second = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>/page-2', home, count=1)
target = DIST / 'page-2/index.html'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(second, encoding='utf-8')

# Restore the original theme's navigation controller. The bow script only owns
# the photo/footer scene and never forces navigation above drawers or dialogs.
theme_path = DIST / 'assets/cdn.hstatic.net/themes/200001179192/1001519910/14/general.js'
theme = theme_path.read_text(encoding='utf-8')
guard = "if (document.body.dataset.bowVariant === 'header') return;"
if guard in theme:
    theme = theme.replace('\n\t\t\t' + guard, '', 1)
    theme_path.write_text(theme, encoding='utf-8')
print(f'Shared bow/footer ready on home, /page-2 and {shared_pages} storefront pages.')
