/* Browser-only demo API. No orders, credentials, or customer data are sent. */
'use strict';
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const STORE = 'designweb-cart-' + BASE;
// Revalidate browser HTTP cache on each request; unchanged files still use 304.
const freshFetch = input => fetch(input, {cache: 'no-cache'});
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'},
});
let catalogPromise;
let configPromise;
const catalog = () => catalogPromise ||= freshFetch(BASE + '/data/products.json').then(r => r.json());
const config = () => configPromise ||= freshFetch(BASE + '/pages-config.json').then(r => r.json());
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

async function cartItems() {
  const saved = await (await caches.open(STORE)).match(self.registration.scope + '__demo_cart');
  return saved ? saved.json() : {};
}
function cart(items) {
  const lines = Object.values(items);
  const total = lines.reduce((sum, item) => sum + item.line_price, 0);
  return {token: 'public-demo', note: '', attributes: {}, currency: 'VND', items: lines,
    item_count: lines.reduce((sum, item) => sum + item.quantity, 0), total_price: total,
    original_total_price: total, total_discount: 0, total_weight: 0, requires_shipping: true};
}
function lineItem(products, id, quantity) {
  const product = products.find(p => p.variants.some(v => String(v.id) === String(id)));
  const variant = product?.variants.find(v => String(v.id) === String(id));
  if (!variant || !Number.isInteger(quantity) || quantity < 0) throw new Error('Invalid variant or quantity');
  return {id: variant.id, key: String(variant.id), variant_id: variant.id, product_id: product.id,
    title: product.title, product_title: product.title, variant_title: variant.title,
    handle: product.handle, url: product.url, image: product.featured_image,
    featured_image: {url: product.featured_image, alt: product.title},
    price: variant.price, original_price: variant.price, final_price: variant.price,
    line_price: variant.price * quantity, final_line_price: variant.price * quantity,
    quantity, sku: variant.sku, vendor: product.vendor, grams: variant.weight || 0,
    properties: {}, discounts: [], options_with_values: product.options.map((name, i) => ({name, value: variant.options[i]})),
    requires_shipping: true, taxable: true, total_discount: 0};
}
let cartQueue = Promise.resolve();
async function updateCart(request, path) {
  const raw = await request.text();
  const data = (request.headers.get('Content-Type') || '').includes('application/json')
    ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
  const items = await cartItems();
  const products = await catalog();
  let added;
  if (path === '/cart/clear.js') {
    for (const id of Object.keys(items)) delete items[id];
  } else if (['/cart/add.js', '/cart/add'].includes(path)) {
    const id = String(data.id);
    const quantity = Number(data.quantity ?? 1) + (items[id]?.quantity || 0);
    added = items[id] = lineItem(products, id, quantity);
  } else if (['/cart/change.js', '/cart/update.js', '/cart'].includes(path)) {
    const updates = typeof data.updates === 'object' ? {...data.updates} : {};
    if (data.id) updates[String(data.id).split(':')[0]] = data.quantity;
    if (data.line) {
      const id = Object.keys(items)[Number(data.line) - 1];
      if (!id) throw new Error('Invalid cart line');
      updates[id] = data.quantity;
    }
    for (const [key, value] of Object.entries(data)) {
      const match = key.match(/^updates\[(\d+)\]$/);
      if (match) updates[match[1]] = value;
    }
    for (const [id, value] of Object.entries(updates)) {
      const quantity = Number(value);
      if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Invalid quantity');
      if (quantity) items[id] = lineItem(products, id, quantity);
      else delete items[id];
    }
  } else return json({error: 'Demo endpoint unavailable'}, 501);
  await (await caches.open(STORE)).put(self.registration.scope + '__demo_cart', json(items));
  return json(added || cart(items));
}

async function filtered(params, collection) {
  let products = await catalog();
  const conf = await config();
  const query = params.get('q') || '';
  const collectionId = query.match(/collectionid:product=(\d+)/);
  collection ||= conf.collections[collectionId?.[1]];
  if (collection) {
    const response = await freshFetch(BASE + '/data/collection-' + encodeURIComponent(collection) + '.json');
    const raw = response.ok ? await response.json() : {products: []};
    const ids = new Set(raw.products.map(p => p.id));
    products = products.filter(p => ids.has(p.id));
  }
  const ids = query.match(/id:product in ([\d,]+)/);
  if (ids) products = products.filter(p => ids[1].split(',').includes(String(p.id)));
  const terms = [...query.matchAll(/(?:title|tag|sku|barcode):product \*\* ([^)]*)/g)].map(m => m[1]);
  if (!terms.length && query && !query.startsWith('filter=')) terms.push(query);
  if (terms[0] && terms[0] !== '*') {
    const key = terms[0].toLocaleLowerCase();
    products = products.filter(p => [p.title, ...(p.tags || []), ...p.variants.map(v => v.sku || '')]
      .join(' ').toLocaleLowerCase().includes(key));
  }
  const variants = [...query.matchAll(/variant:product=([^)]*)/g)].map(m => m[1].toLocaleLowerCase());
  if (variants.length) products = products.filter(p => p.variants.some(v => variants.some(value => v.options.join(' ').toLocaleLowerCase().includes(value))));
  for (const match of query.matchAll(/price:product([<>]=?|=)(\d+(?:\.\d+)?)/g)) {
    const value = Number(match[2]) * 100;
    products = products.filter(p => ({'>': p.price > value, '>=': p.price >= value,
      '<': p.price < value, '<=': p.price <= value, '=': p.price === value})[match[1]]);
  }
  const sort = params.get('sortby') || params.get('sort_by') || '';
  products = [...products];
  if (sort.includes('price')) products.sort((a, b) => (a.price - b.price) * (sort.includes('desc') ? -1 : 1));
  else if (sort.includes('title')) products.sort((a, b) => a.title.localeCompare(b.title) * (sort.includes('desc') ? -1 : 1));
  else if (sort.includes('created')) products.sort((a, b) => a.created_at.localeCompare(b.created_at) * (sort.includes('desc') ? -1 : 1));
  const total = products.length;
  const limit = Math.max(1, Math.min(250, Number(params.get('limit')) || 50));
  const page = Math.max(1, Number(params.get('page')) || 1);
  return {products: products.slice((page - 1) * limit, page * limit), total};
}

async function handle(request) {
  const url = new URL(request.url);
  let path = decodeURIComponent(url.pathname);
  if (BASE && (path === BASE || path.startsWith(BASE + '/'))) path = path.slice(BASE.length);
  path = path.replace(/\/$/, '') || '/';
  if (request.method === 'POST') {
    if (path.startsWith('/cart/') || path === '/cart') {
      const task = cartQueue.then(() => updateCart(request, path));
      cartQueue = task.catch(() => {});
      return task.catch(() => json({status: 422, description: 'Sản phẩm hoặc số lượng không hợp lệ.'}, 422));
    }
    return json({error: 'Bản demo chưa kết nối gửi biểu mẫu hoặc thanh toán.'}, 501);
  }
  if (request.method !== 'GET') return fetch(request);
  if (path === '/__local/settings') return json((await config()).settings);
  if (path === '/account.js') return json({customer: null});
  if (path === '/cart.js') { await cartQueue; return json(cart(await cartItems())); }
  if (['/search.js', '/products.json'].includes(path)) return json(await filtered(url.searchParams));
  const collection = path.match(/^\/collections\/([^/]+)\/products\.json$/);
  if (collection) return json(await filtered(url.searchParams, collection[1]));
  const product = path.match(/^\/products\/([^/]+)\.(js|json)$/);
  if (product) {
    const found = (await catalog()).find(p => p.handle === product[1]);
    return json(found || {error: 'Product not found'}, found ? 200 : 404);
  }
  if (url.searchParams.get('view') === 'pagination') {
    const params = new URLSearchParams(url.searchParams);
    params.set('limit', '250'); params.set('page', '1');
    const {total} = await filtered(params, path.match(/^\/collections\/([^/]+)/)?.[1]);
    const page = Number(url.searchParams.get('page')) || 1;
    const links = Array.from({length: Math.max(1, Math.ceil(total / 36))}, (_, i) => i + 1).map(n =>
      n === page ? `<span class="page-node current">${n}</span>` :
        `<a class="page-node" href="${BASE + path}?page=${n}" data-link="${n}" data-page="${n}">${n}</a>`);
    return new Response('<div id="pagination" class="pagination-wrapper">' + links.join('') + '</div>', {headers: {'Content-Type': 'text/html; charset=utf-8'}});
  }
  if (path.startsWith('/collections/') && path.includes('/products/')) path = '/products/' + path.split('/').pop();
  if (path.startsWith('/checkouts/')) path = '/checkout';
  if (/^\d+$/.test(url.searchParams.get('page') || '')) {
    const paged = await freshFetch(BASE + path + '/__page_' + url.searchParams.get('page') + '/index.html');
    if (paged.ok) return paged;
  }
  // Fetch the actual HTML file. Returning a directory redirect from a worker
  // would fail navigations whose redirect mode is manual (e.g. /checkout).
  const resource = path === '/' ? '/index.html' : /\.[^/]+$/.test(path) ? path : path + '/index.html';
  const response = await freshFetch(BASE + resource + url.search);
  if (response.status === 404 && path.startsWith('/assets/')) {
    const original = path.replace(/_(?:pico|icon|thumb|small|compact|medium|large|grande|master|\d+x\d*)(?:_crop_[a-z]+)?(?=\.[^.]+$)/, '');
    if (original !== path) return freshFetch(BASE + original);
  }
  return response;
}
self.addEventListener('fetch', event => {
  if (new URL(event.request.url).origin === self.location.origin) event.respondWith(handle(event.request));
});
