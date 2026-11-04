"""Download the public storefront for local editing. Standard library only."""
from __future__ import annotations

import concurrent.futures as futures
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import time
from urllib.parse import urljoin, urlsplit, urlunsplit, unquote, parse_qs, urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SOURCE = ROOT / 'source'
ORIGIN = 'https://mandy-crimson.myharavan.com'
HOST = urlsplit(ORIGIN).netloc
ASSET_HOSTS = {'cdn.hstatic.net', 'theme.hstatic.net', 'product.hstatic.net',
               'file.hstatic.net', 'hstatic.net', 'fonts.googleapis.com',
               'fonts.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com',
               'cdn.plyr.io', 'i.ytimg.com'}
URL_RE = re.compile(r'''(?:https?:)?//[a-zA-Z0-9][^\s<>"'`\\)\]}]*''')
CSS_RE = re.compile(r'''url\(\s*["']?([^\s)"']+)''')
failures = {}
assets = {}
pages = {}


def fetch(url):
    for attempt in range(3):
        try:
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; LocalFrontendMirror/1.0)',
                                       'Accept-Encoding': 'identity'})
            with urlopen(req, timeout=40) as response:
                return response.read(), response.headers.get('Content-Type', ''), response.geturl()
        except HTTPError as exc:
            if exc.code < 500:
                raise
        except Exception:
            if attempt == 2:
                raise
        time.sleep(attempt + 1)
    raise RuntimeError('Download failed')


def clean_url(raw, base):
    raw = html.unescape(raw).replace('\\/', '/').strip()
    if not raw or raw.startswith(('data:', 'blob:', '#', 'mailto:', 'tel:', 'javascript:')):
        return None
    if any(c in raw for c in ('{', '}', '|', '${')):
        return None
    try:
        u = urlsplit(urljoin(base, raw))
    except ValueError:
        return None
    if u.scheme not in ('http', 'https'):
        return None
    return urlunsplit(('https', u.netloc.lower(), u.path or '/', u.query, ''))


def asset_path(url):
    u = urlsplit(url)
    path = unquote(u.path).replace(':', '_')
    parts = [p for p in path.split('/') if p and p not in ('.', '..')]
    if not parts:
        parts = ['index']
    if u.netloc == 'fonts.googleapis.com':
        parts[-1] += '-' + hashlib.sha256(u.query.encode()).hexdigest()[:12] + '.css'
    return Path('assets', u.netloc, *parts)


def page_path(url):
    u = urlsplit(url)
    parts = [p for p in unquote(u.path).split('/') if p and p not in ('.', '..')]
    q = parse_qs(u.query)
    if 'page' in q:
        parts += ['__page_' + re.sub(r'\D', '', q['page'][0])]
    return Path(*parts, 'index.html') if parts else Path('index.html')


def normalize_page(raw, base):
    url = clean_url(raw, base)
    if not url or urlsplit(url).netloc != HOST:
        return None
    u = urlsplit(url)
    p = u.path.rstrip('/') or '/'
    if re.match(r'^/collections/[^/]+/products/', p):
        p = '/products/' + p.rsplit('/', 1)[1]
    if not (p == '/' or re.match(r'^/(products|pages|collections|blogs)(/|$)', p)
            or p in ('/search', '/cart', '/account/login', '/account/register', '/account')):
        return None
    if Path(p).suffix or '+' in p or '%2b' in p.lower() or '{' in p:
        return None
    q = parse_qs(u.query)
    query = urlencode({'page': q['page'][0]}) if 'page' in q and q['page'][0].isdigit() else ''
    return ORIGIN + p + ('?' + query if query else '')


class Links(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base, self.links, self.resources = base, set(), set()

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'a' and d.get('href'):
            p = normalize_page(d['href'], self.base)
            if p:
                self.links.add(p)
        for key, value in attrs:
            if not value:
                continue
            if key in ('src', 'data-src', 'data-original', 'poster', 'data-background', 'data-bg', 'data-zoom-image') or (tag == 'link' and key == 'href' and any(s in d.get('rel', '') for s in ('stylesheet', 'icon', 'preload'))):
                self.add_resource(value)
            if key in ('srcset', 'data-srcset'):
                for item in value.split(','):
                    self.add_resource(item.strip().split(' ')[0])

    def add_resource(self, raw):
        u = clean_url(raw, self.base)
        if u and urlsplit(u).netloc in ASSET_HOSTS:
            self.resources.add(u)


def discover_assets(text, base, css=False):
    result = set()
    for raw in URL_RE.findall(text.replace('\\/', '/').replace('|', ' ')):
        u = clean_url(raw, base)
        if u and urlsplit(u).netloc in ASSET_HOSTS and urlsplit(u).path != '/':
            result.add(u)
    if css:
        for raw in CSS_RE.findall(text):
            u = clean_url(raw, base)
            if u and urlsplit(u).netloc in ASSET_HOSTS:
                result.add(u)
    return result


def download_page(url):
    dest = SOURCE / 'pages' / page_path(url)
    if dest.exists():
        return url, dest.read_text(encoding='utf-8'), None
    try:
        b, content_type, final = fetch(url)
        if 'html' not in content_type:
            return url, None, 'Not HTML: ' + content_type
        text = b.decode('utf-8-sig')
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding='utf-8')
        return url, text, None
    except Exception as exc:
        return url, None, str(exc)


def download_asset(url):
    path = asset_path(url)
    dest = DIST / path
    original = SOURCE / path
    try:
        if original.exists():
            b = original.read_bytes()
        elif dest.exists() and path.suffix.lower() not in ('.css', '.js'):
            b = dest.read_bytes()
        else:
            b, ct, final = fetch(url)
        text = None
        more = set()
        if path.suffix.lower() in ('.css', '.js'):
            text = b.decode('utf-8-sig')
            original.parent.mkdir(parents=True, exist_ok=True)
            original.write_bytes(b)
            more = discover_assets(text, url, css=path.suffix.lower() == '.css')
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b)
        return url, path.as_posix(), more, None
    except Exception as exc:
        return url, None, set(), str(exc)


def rewrite(text, base, css=False):
    # Replace complete URLs first, including protocol-relative and JSON escaped forms.
    candidates = discover_assets(text, base, css)
    for u in sorted(candidates, key=len, reverse=True):
        local = '/' + asset_path(u).as_posix()
        for variant in (u, u.removeprefix('https:'), u.replace('https:', 'http:')):
            text = text.replace(variant, local).replace(html.escape(variant, quote=False), local)
            text = text.replace(variant.replace('/', '\\/'), local.replace('/', '\\/'))
    if css:
        def css_replace(match):
            u = clean_url(match.group(1), base)
            if u in assets:
                return match.group(0).replace(match.group(1), '/' + assets[u])
            return match.group(0)
        text = CSS_RE.sub(css_replace, text)
    # Also cover URLs assembled at runtime by the original theme JavaScript.
    for host in ASSET_HOSTS - {'fonts.googleapis.com'}:
        text = text.replace('https://' + host + '/', '/assets/' + host + '/')
        text = text.replace('http://' + host + '/', '/assets/' + host + '/')
        text = text.replace('//' + host + '/', '/assets/' + host + '/')
        text = text.replace(('https://' + host + '/').replace('/', '\\/'), ('/assets/' + host + '/').replace('/', '\\/'))
    text = re.sub(re.escape(ORIGIN) + r'''(?=["'])''', '/', text)
    text = text.replace(ORIGIN, '').replace('http://' + HOST, '')
    return text


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    DIST.mkdir(exist_ok=True)
    SOURCE.mkdir(exist_ok=True)
    initial = json.loads((SOURCE / 'sitemap-urls.json').read_text(encoding='utf-8'))
    pending = {ORIGIN + '/', *initial}
    visited = set()
    wanted = set()
    for datafile in (SOURCE / 'data').glob('*.json'):
        wanted.update(discover_assets(datafile.read_text(encoding='utf-8'), ORIGIN))
    with futures.ThreadPoolExecutor(max_workers=6) as pool:
        while pending:
            batch = sorted(pending - visited)
            pending = set()
            if not batch:
                break
            for url, text, error in pool.map(download_page, batch):
                visited.add(url)
                if error:
                    failures[url] = error
                    continue
                pages[url] = page_path(url).as_posix()
                parser = Links(url)
                parser.feed(text)
                pending.update(parser.links - visited)
                wanted.update(parser.resources | discover_assets(text, url))
            print(f'Pages: {len(pages)}, next pages: {len(pending)}, assets discovered: {len(wanted)}', flush=True)
        seen = set()
        while wanted - seen:
            batch = sorted(wanted - seen)
            for i, (u, path, more, error) in enumerate(pool.map(download_asset, batch), 1):
                seen.add(u)
                if error:
                    failures[u] = error
                else:
                    assets[u] = path
                    wanted.update(more)
                if i % 100 == 0 or i == len(batch):
                    print(f'Assets: {len(assets)}, failures: {len(failures)}, remaining: {len(wanted - seen)}', flush=True)
    for url, path in pages.items():
        text = (SOURCE / 'pages' / path).read_text(encoding='utf-8')
        # Analytics and platform instrumentation have no purpose in the local copy.
        text = re.sub(r'<script\b[^>]*\bsrc=["\'][^"\']*(?:stats\.hstatic\.net|googletagmanager\.com|google-analytics\.com)[^"\']*["\'][^>]*>\s*</script>', '', text, flags=re.I)
        text = text.replace("setTimeout(() =>{window.shop.getScriptCcd(window.shop.recaptchajs,window.shop.recaptchacallback());},5000);", '/* Local preview: account forms have no connected backend. */')
        text = rewrite(text, url)
        # This small editable stylesheet is always loaded after the original theme.
        text = text.replace('</head>', '<link rel="stylesheet" href="/custom.css">\n</head>')
        dest = DIST / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding='utf-8')
    for url, path in assets.items():
        if Path(path).suffix in ('.css', '.js'):
            source = SOURCE / path
            if source.exists():
                text = rewrite(source.read_text(encoding='utf-8-sig'), url, css=path.endswith('.css'))
                (DIST / path).write_text(text, encoding='utf-8')
    (DIST / 'data').mkdir(exist_ok=True)
    for datafile in (SOURCE / 'data').glob('*.json'):
        (DIST / 'data' / datafile.name).write_text(rewrite(datafile.read_text(encoding='utf-8'), ORIGIN), encoding='utf-8')
    report = {'origin': ORIGIN, 'captured_at': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
              'pages': pages, 'assets': assets, 'failures': failures}
    (ROOT / 'mirror-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'DONE: {len(pages)} pages, {len(assets)} assets, {len(failures)} failures', flush=True)


if __name__ == '__main__':
    main()
