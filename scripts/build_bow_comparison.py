"""Keep the selected bow treatment on the home page and its /page-2 alias."""
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
<section class="bow-photo-section" id="footer-reveal" aria-label="Girlhood">
  <img class="bow-comparison__photo" src="/assets/custom/girlhood-seaside.jpg" alt="Girlhood — bên bờ biển cùng những nốt nhạc" width="1280" height="720" loading="eager" decoding="async">
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
home = home.replace('</head>', '<link rel="stylesheet" href="/bow-comparison.css?v=5">\n</head>', 1)
home = home.replace('</body>', '<script src="/bow-comparison.js?v=5" defer></script>\n</body>', 1)
home_path.write_text(home, encoding='utf-8')
second = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>/page-2', home, count=1)
target = DIST / 'page-2/index.html'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(second, encoding='utf-8')

# The selected treatment owns header state, including after a fresh mirror.
theme_path = DIST / 'assets/cdn.hstatic.net/themes/200001179192/1001519910/14/general.js'
theme = theme_path.read_text(encoding='utf-8')
guard = "if (document.body.dataset.bowVariant === 'header') return;"
if guard not in theme:
    hook = 'scrollFixedHeader: function(){'
    if hook not in theme:
        raise ValueError('Theme header controller entry point was not found.')
    theme = theme.replace(hook, hook + '\n\t\t\t' + guard, 1)
    theme_path.write_text(theme, encoding='utf-8')
print('Selected bow ready on / and /page-2: plain white strip, no comparison controls.')
