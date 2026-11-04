/* The public demo uses a service worker for the offline catalog/cart API. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  const base = new URL('.', document.currentScript.src);
  const worker = new URL('pages-worker.js', base).href;
  const controlled = navigator.serviceWorker.controller?.scriptURL === worker;
  if (!controlled) {
    document.documentElement.style.visibility = 'hidden';
    const timeout = setTimeout(() => { document.documentElement.style.visibility = ''; }, 10000);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      clearTimeout(timeout);
      location.reload();
    }, {once: true});
  }
  navigator.serviceWorker.register(worker, {scope: base.pathname, updateViaCache: 'none'})
    .catch(() => { document.documentElement.style.visibility = ''; });
})();
