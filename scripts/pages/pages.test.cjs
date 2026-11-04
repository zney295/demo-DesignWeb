const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../_site');
const base = require('node:fs').readFileSync(path.join(root, 'index.html'), 'utf8')
  .match(/src="([^"]*)\/pages-bootstrap\.js"/)[1];
const origin = 'https://example.test';
const saved = new Map();
let context;
async function startWorker() {
  context = vm.createContext({URL, URLSearchParams, Response, Request, console,
    self: {registration: {scope: origin + base + '/'}, location: {origin}, addEventListener() {}},
    caches: {open: async () => ({
      match: async key => saved.get(key)?.clone(),
      put: async (key, response) => saved.set(key, response.clone()),
    })},
    fetch: async input => {
      const url = new URL(typeof input === 'string' ? input : input.url, origin);
      assert.ok(url.pathname.startsWith(base + '/'), 'request stays under the Pages project');
      let file = path.join(root, decodeURIComponent(url.pathname.slice(base.length)));
      try {
        if ((await fs.stat(file)).isDirectory()) {
          assert.ok(url.pathname.endsWith('/'), 'avoid returning directory redirects from the worker');
          file = path.join(file, 'index.html');
        }
        return new Response(await fs.readFile(file));
      } catch { return new Response('Not found', {status: 404}); }
    },
  });
  vm.runInContext(await fs.readFile(path.join(__dirname, 'pages-worker.js'), 'utf8'), context);
}
async function request(route, data) {
  const input = new Request(origin + base + route, data === undefined ? {} : {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data),
  });
  return context.handle(input);
}
test('Pages export serves pages, project URLs, catalog, search and persistent cart', async () => {
  await startWorker();
  for (const route of ['/', '/page-2/', '/checkout/', '/custom.css']) {
    const response = await request(route);
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).length > 100);
  }
  const home = await (await request('/')).text();
  assert.ok(home.includes('src="' + base + '/pages-bootstrap.js"'));
  assert.ok(home.includes('href="' + base + '/"'));
  assert.ok(!home.includes('src="/assets/'));
  const catalog = await (await request('/products.json?limit=250')).json();
  assert.equal(catalog.total, 150);
  const product = catalog.products.find(p => p.available && p.featured_image);
  assert.ok(product.url.startsWith(base + '/products/'));
  assert.equal((await (await request('/products/' + product.handle + '.js')).json()).id, product.id);
  const search = await (await request('/search.js?q=' + encodeURIComponent(product.title))).json();
  assert.ok(search.products.some(p => p.id === product.id));
  const id = product.variants.find(v => v.available).id;
  await request('/cart/clear.js', {});
  assert.equal((await (await request('/cart/add.js', {id, quantity: 2})).json()).quantity, 2);
  let cart = await (await request('/cart.js')).json();
  assert.equal(cart.item_count, 2);
  assert.equal(cart.total_price, cart.items[0].price * 2);
  await startWorker(); // storage survives service-worker suspension/restart
  assert.equal((await (await request('/cart.js')).json()).item_count, 2);
  await request('/cart/change.js', {line: 1, quantity: 1});
  assert.equal((await (await request('/cart.js')).json()).item_count, 1);
  assert.equal((await request('/cart/add.js', {id, quantity: -4})).status, 422);
  assert.equal((await request('/account/login', {email: 'demo@example.test'})).status, 501);
  await request('/cart/clear.js', {});
  assert.equal((await (await request('/cart.js')).json()).item_count, 0);
  const settings = await (await request('/__local/settings')).json();
  assert.ok(settings.plusButtonImage.startsWith(base + '/assets/'));
});
