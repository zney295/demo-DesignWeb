"""Build a local comparison: current bow on / and a header-mounted bow on /page-2."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
home_path = DIST / 'index.html'
home = home_path.read_text(encoding='utf-8')
home = re.sub(r'<nav\b[^>]*id="bow-comparison"[^>]*>.*?</nav>\s*', '', home, flags=re.S)
home = re.sub(r'\s*data-bow-variant="[^"]*"', '', home)
home = re.sub(r'<link rel="stylesheet" href="/bow-comparison\.css(?:\?[^\"]*)?">\s*', '', home)
home = re.sub(r'<script src="/bow-comparison\.js(?:\?[^\"]*)?" defer></script>\s*', '', home)
if 'id="comparison-footer"' not in home:
    home = home.replace('<footer ', '<footer id="comparison-footer" ', 1)


def controls(variant):
    def link(label, target, name):
        selected = ' aria-current="page"' if name == variant else ''
        return f'<a href="{target}#footer-reveal" data-compare-variant="{name}"{selected}>{label}</a>'
    return ('<nav id="bow-comparison" aria-label="So sánh cách ghim nơ">'
            + link('1 · Nơ hiện tại', '/', 'current')
            + link('2 · Ghim top bar', '/page-2', 'header')
            + '<a href="#comparison-footer" class="bow-comparison__footer">Xem footer ↓</a></nav>\n')


def finish(text, variant):
    text = text.replace('<body ', f'<body data-bow-variant="{variant}" ', 1)
    text = text.replace('</head>', '<link rel="stylesheet" href="/bow-comparison.css?v=3">\n</head>', 1)
    return text.replace('</body>', controls(variant) + '<script src="/bow-comparison.js?v=3" defer></script>\n</body>', 1)


# Keep the current photograph, header behavior and bow as the reference version.
home_path.write_text(finish(home, 'current'), encoding='utf-8')
second = home.replace('<script src="/footer-reveal.js" defer></script>', '')
second = second.replace('<link rel="stylesheet" href="/footer-reveal.css">', '')
second = re.sub(r'<title>.*?</title>', '<title>Trang 2 — Nơ ghim top bar | Mandy Crimson</title>', second, count=1, flags=re.S)
second = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>/page-2', second, count=1)
photo_section = '''<section class="bow-photo-section" id="footer-reveal" aria-label="Girlhood">
  <div class="bow-comparison__origin"><div class="bow-comparison__bow"><img src="/assets/cdn.hstatic.net/files/200001179192/file/logo-no.webp" alt="" width="168" height="125"></div></div>
  <img class="bow-comparison__photo" src="/assets/custom/girlhood-seaside.jpg" alt="Girlhood — bên bờ biển cùng những nốt nhạc" width="1280" height="720" loading="eager" decoding="async">
</section>'''
second, count = re.subn(
    r'<section class="footer-reveal" id="footer-reveal"[^>]*>.*?(<footer\b.*?</footer>)\s*</section>',
    lambda match: photo_section + '\n' + match[1], second, count=1, flags=re.S)
if count != 1:
    raise ValueError('Expected one shared photo scene to replace with a standalone image section.')
target = DIST / 'page-2/index.html'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(finish(second, 'header'), encoding='utf-8')
print('Bow comparison ready: / (current) and /page-2 (header-mounted bow, standalone photograph).')
