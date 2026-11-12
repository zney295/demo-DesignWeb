"""Export the captured storefront for GitHub Pages without changing dist/."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]


def build(base: str) -> Path:
    base = '/' + base.strip('/') if base.strip('/') else ''
    if base and not re.fullmatch(r'/[A-Za-z0-9._-]+', base):
        raise ValueError('Use a single repository name as the base path')
    target = ROOT / '_site'
    # Only remove our generated output, never the editable storefront or sources.
    if target.is_symlink() or target.resolve() != ROOT.resolve() / '_site':
        raise ValueError('Unexpected export directory')
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(ROOT / 'dist', target, ignore=shutil.ignore_patterns('__editor'))

    roots = {p.name for p in target.iterdir()}
    roots.update(['search', 'search.js', 'products.json', 'cart.js', 'account.js',
                  '__local', '__editor', 'checkouts'])
    route = '|'.join(re.escape(name) for name in sorted(roots, key=len, reverse=True))
    pattern = re.compile(r'(?P<lead>[\'"`(=\s])/(?=(?:' + route + r')(?:[/?.#\'"`\s<)]|$))')

    versions = {
        '/' + path.name: hashlib.sha256(path.read_bytes()).hexdigest()[:12]
        for path in target.iterdir() if path.suffix in {'.css', '.js'}
    }

    def rewrite(text: str) -> str:
        for url, version in versions.items():
            text = re.sub(r'([\'"])' + re.escape(url) + r'(?:\?[^\'"\s]*)?\1',
                          lambda m: m[1] + url + '?v=' + version + m[1], text)
        if not base:
            return text
        text = pattern.sub(lambda m: m['lead'] + base + '/', text)
        text = re.sub(r'(\b(?:href|action)\s*=\s*[\'"])/(?=[\'"?#])',
                      lambda m: m[1] + base + '/', text, flags=re.I)
        # String concatenation after location.pathname already includes the base.
        text = re.sub(r'(\b(?:url|check_pathname)\s*\+\s*[\'"])' + re.escape(base) + r'/products\.json',
                      lambda m: m[1] + '/products.json', text)
        return text

    bootstrap = '<script src="' + base + '/pages-bootstrap.js"></script>'
    for path in target.rglob('*'):
        if path.is_file() and path.suffix in {'.html', '.css', '.js', '.json', '.svg', '.xml'}:
            text = rewrite(path.read_text(encoding='utf-8'))
            if path.suffix == '.html':
                text = re.sub(r'(<head\b[^>]*>)', lambda m: m[1] + bootstrap, text, count=1, flags=re.I)
            path.write_text(text, encoding='utf-8')

    collections = {}
    for path in (ROOT / 'dist/collections').glob('*/index.html'):
        match = re.search(r'id="collection-page"[^>]*data-id="(\d+)"', path.read_text(encoding='utf-8'))
        if match:
            collections[match[1]] = path.parent.name
    settings = json.loads((ROOT / 'local-settings.json').read_text(encoding='utf-8'))
    (target / 'pages-config.json').write_text(rewrite(json.dumps({
        'settings': settings, 'collections': collections,
    }, ensure_ascii=False)), encoding='utf-8')
    for name in ['pages-bootstrap.js', 'pages-worker.js']:
        shutil.copyfile(ROOT / 'scripts/pages' / name, target / name)
    (target / '.nojekyll').touch()
    print(f'GitHub Pages export: {target} (base path: {base or "/"})')
    return target


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-path', default='/demo-DesignWeb')
    build(parser.parse_args().base_path)
