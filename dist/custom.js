/* Changes requested in the six-page Canva feedback. Original theme stays in assets/. */
(() => {
  'use strict';
  const defaultPlus = '/assets/custom/quick-add.svg';
  let plusImage = defaultPlus;
  const products = new Map();
  let previewMedia = [];
  fetch('/data/preview-media.json').then(r => r.json()).then(items => {
    previewMedia = items;
    decorate(document);
  }).catch(() => {});
  const catalogReady = fetch('/data/products.json').then(r => r.json()).then(items => {
    items.forEach(p => products.set(p.handle, p));
    decorate(document);
  }).catch(() => {});
  function toast(message) {
    document.querySelector('.local-feedback-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'local-feedback-toast';
    node.setAttribute('role', 'status');
    node.textContent = message;
    document.body.append(node);
    setTimeout(() => node.remove(), 4500);
  }
  function decorate(root) {
    decorateMedia(root);
    root.querySelectorAll('.product-btn--plus:not([data-quick-add])').forEach(old => {
      const url = old.getAttribute('href') || old.closest('.product-loop--wrap')?.querySelector('a[href*="/products/"]')?.getAttribute('href');
      if (!url) return;
      const handle = url.split('/products/')[1]?.split(/[?#/]/)[0];
      if (!handle) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = old.className + ' has-img';
      button.dataset.quickAdd = handle;
      button.setAttribute('aria-label', 'Thêm ' + (old.getAttribute('aria-label') || products.get(handle)?.title || 'sản phẩm') + ' vào giỏ hàng');
      const img = document.createElement('img');
      img.src = plusImage;
      img.alt = '';
      img.width = 32;
      img.height = 32;
      button.append(img);
      old.replaceWith(button);
    });
    root.querySelectorAll('[data-quick-add]').forEach(button => {
      const product = products.get(button.dataset.quickAdd);
      if (product && !product.variants.some(v => v.available)) {
        button.disabled = true;
        button.setAttribute('aria-label', product.title + ' — Hết hàng');
      }
      const card = button.closest('.product-loop--wrap');
      if (!card) return;
      if (card.closest('#slider-newarrival')) {
        const plus = button.closest('.product-loop--btn.plus');
        const head = card.querySelector('.product-loop--head');
        if (plus && head && plus.parentElement !== head) head.append(plus);
      }
      const colourIndex = product?.options.findIndex(name => /màu|color|colour/i.test(name));
      if (!product || colourIndex < 0 || card.querySelector('[data-colour-palette]')) return;
      const palette = document.createElement('div');
      palette.className = 'product-loop--swatch';
      palette.dataset.colourPalette = '';
      palette.setAttribute('role', 'group');
      palette.setAttribute('aria-label', 'Màu sắc ' + product.title);
      const colours = {'xanh':'#81becd','cam':'#f3ab65','vang':'#f4dc7b','hong':'#efb8cc','trang':'#fff','den':'#252125','do':'#bd3e55','nau':'#9c775e','tim':'#b6a1cf','be':'#dbccb2','xam':'#b6b6b6','mint':'#bde1d1','pink':'#efb8cc','white':'#fff','black':'#252125','yellow':'#f4dc7b','blue':'#81becd','green':'#bdd4a3'};
      [...new Set(product.variants.map(v => v.options[colourIndex]))].forEach(value => {
        const swatch = document.createElement('button');
        swatch.type = 'button'; swatch.className = 'swatch-item';
        swatch.title = value; swatch.setAttribute('aria-label', value); swatch.setAttribute('aria-pressed', 'false');
        const available = product.variants.some(v => v.available && v.options[colourIndex] === value);
        swatch.disabled = !available;
        const colour = document.createElement('span');
        const key = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
        colour.style.backgroundColor = colours[key] || '#ece4e8';
        swatch.append(colour);
        swatch.addEventListener('click', event => {
          event.stopPropagation();
          card.dataset.quickColour = value;
          palette.querySelectorAll('button').forEach(item => {item.classList.toggle('selected', item === swatch); item.setAttribute('aria-pressed', String(item === swatch));});
        });
        palette.append(swatch);
      });
      card.querySelector('.product-loop--body')?.append(palette);
    });
  }
  const imageKey = url => (url || '').replace(/_(compact|grande|master|1024x1024)(?=\.)/, '');
  function decorateMedia(root) {
    if (!previewMedia.length) return;
    const cards = [...root.querySelectorAll('.product-loop--wrap')];
    const lists = new Set(cards.map(card => card.closest('.products-slide, .products-grid, .products-list, .grid-products') || card.closest('.product-loop')?.parentElement || card.parentElement));
    const known = new Map(previewMedia.map(item => [imageKey(item.image), item]));
    lists.forEach(list => {
      const entries = [...list.querySelectorAll('.product-loop--wrap')].map(card => {
        const link = card.querySelector('.product-loop--link');
        const handle = link?.getAttribute('href')?.split('/products/')[1]?.split(/[?#/]/)[0];
        const product = products.get(handle);
        return {card, product, original: known.get(imageKey(product?.featured_image))};
      });
      // Keep genuine photos for their own products before assigning demo photos.
      const reserved = new Set(entries.map(entry => entry.original?.image).filter(Boolean));
      const used = new Set();
      entries.forEach(({card, product, original}, index) => {
        const item = original && !used.has(original.image) ? original :
          previewMedia.find(photo => !used.has(photo.image) && !reserved.has(photo.image)) ||
          previewMedia.find(photo => !used.has(photo.image)) || previewMedia[index % previewMedia.length];
        used.add(item.image);
        const illustration = !original || item.image !== original.image;
        const poolIndex = previewMedia.indexOf(item);
        const second = previewMedia[(poolIndex + Math.floor(previewMedia.length / 2)) % previewMedia.length];
        const title = product?.title || card.querySelector('.product-loop--link')?.getAttribute('aria-label') || '';
        [['.img-first', item.image, title + (illustration ? ' — ảnh minh họa' : '')],
         ['.img-second', second.image, 'Ảnh minh họa hiệu ứng']].forEach(([selector, src, alt]) => {
          const picture = card.querySelector(selector);
          const img = picture?.querySelector('img');
          if (!img) return;
          picture.querySelectorAll('source').forEach(source => source.remove());
          img.removeAttribute('srcset');
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          img.classList.remove('lazyload', 'lazyloading');
          img.classList.add('lazyloaded');
          img.alt = alt;
          img.decoding = 'async';
          if (img.getAttribute('src') !== src) img.src = src;
        });
        const label = card.querySelector('.preview-image-label');
        if (illustration && !label) {
          const node = document.createElement('span');
          node.className = 'preview-image-label';
          node.textContent = 'Ảnh minh họa';
          card.querySelector('.product-loop--head')?.append(node);
        } else if (!illustration) label?.remove();
      });
    });
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-quick-add]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.disabled || button.classList.contains('is-adding')) return;
    button.classList.add('is-adding');
    button.setAttribute('aria-busy', 'true');
    try {
      await catalogReady;
      const handle = button.dataset.quickAdd;
      let product = products.get(handle);
      if (!product) {
        const response = await fetch('/products/' + encodeURIComponent(handle) + '.js');
        if (!response.ok) throw new Error('Không tải được sản phẩm. Vui lòng thử lại.');
        product = await response.json();
      }
      const selectedColour = button.closest('.product-loop--wrap')?.dataset.quickColour;
      const colourIndex = product.options.findIndex(name => /màu|color|colour/i.test(name));
      const variant = product.variants.find(v => v.available && (!selectedColour || v.options[colourIndex] === selectedColour));
      if (!variant) throw new Error('Sản phẩm đã hết hàng.');
      const response = await fetch('/cart/add.js', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id: variant.id, quantity: 1})});
      if (!response.ok) throw new Error('Chưa thể thêm sản phẩm vào giỏ hàng.');
      if (window.WEBDS?.Helper?.getSidebarCart) window.WEBDS.Helper.getSidebarCart();
      toast('Đã thêm ' + product.title + ' vào giỏ hàng');
    } catch (error) {
      toast(error.message);
    } finally {
      button.classList.remove('is-adding');
      button.removeAttribute('aria-busy');
    }
  }, true);
  function instantHelp() {
    const shell = document.querySelector('.js-help-shell[data-help-mode="panels"]');
    if (!shell) return;
    const menu = shell.querySelector('.menuList-support');
    const panels = [...shell.querySelectorAll('.help-panel')];
    menu.setAttribute('role', 'tablist');
    menu.setAttribute('aria-label', 'Help');
    const tabs = [...menu.querySelectorAll('a[data-help-handle]')];
    const select = (tab, push) => {
      const handle = tab.dataset.helpHandle;
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => {
        const active = panel.dataset.helpHandle === handle;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
      const label = tab.textContent.trim();
      document.title = label + ' – Mandy Crimson';
      const breadcrumb = shell.querySelector('.breadcrumb .active strong');
      if (breadcrumb) breadcrumb.textContent = label;
      if (push) history.pushState({helpNav: true}, '', tab.getAttribute('href'));
    };
    tabs.forEach(tab => {
      const handle = tab.dataset.helpHandle;
      tab.id = 'help-tab-' + handle;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'help-panel-' + handle);
      const panel = panels.find(p => p.dataset.helpHandle === handle);
      if (panel) {
        panel.id = 'help-panel-' + handle;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
      }
    });
    menu.addEventListener('click', event => {
      const tab = event.target.closest('a[data-help-handle]');
      if (!tab || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      select(tab, true);
    }, true);
    menu.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      const index = tabs.indexOf(event.target);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next], true);
      tabs[next].focus();
    });
    const sync = () => select(tabs.find(t => t.getAttribute('href') === location.pathname) || tabs[0], false);
    addEventListener('popstate', sync);
    sync();
  }
  function autumnLeaves() {
    if (document.getElementById('leaves')) return;
    const leaves = document.createElement('div');
    leaves.id = 'leaves';
    leaves.setAttribute('aria-hidden', 'true');
    const leafCount = 24;
    const cycleSeconds = 20;
    leaves.style.setProperty('--leaf-cycle', cycleSeconds + 's');
    for (let index = 0; index < leafCount; index++) {
      const leaf = document.createElement('span');
      leaf.className = 'autumn-leaf';
      leaf.style.left = ((index * 37 + 11) % 100) + '%';
      // Equal phases keep arrivals continuous. Mobile hides alternating leaves.
      leaf.style.setProperty('--leaf-phase', -(index * cycleSeconds / leafCount) + 's');
      leaf.style.setProperty('--leaf-size', (26 + index * 7 % 17) + 'px');
      leaf.style.setProperty('--leaf-drift', (index * 31 % 150 - 75) + 'px');
      leaf.style.setProperty('--leaf-tilt', ((index * 67 + 23) % 360 - 180) + 'deg');
      leaf.style.setProperty('--leaf-opacity', .6 + index % 4 * .07);
      leaf.style.setProperty('--sway-duration', (2.2 + index % 5 * .35) + 's');
      leaf.style.setProperty('--sway-phase', -(index * .73 % 3) + 's');
      const wind = document.createElement('span');
      wind.className = 'autumn-leaf__wind';
      const sprite = document.createElement('img');
      sprite.className = 'autumn-leaf__sprite';
      sprite.src = '/assets/custom/autumn/maple-leaf-red-brown.webp';
      sprite.alt = '';
      sprite.width = 192;
      sprite.height = 192;
      sprite.decoding = 'async';
      sprite.draggable = false;
      wind.append(sprite);
      leaf.append(wind);
      leaves.append(leaf);
    }
    document.body.append(leaves);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let gustTimer;
    function scheduleGust() {
      clearTimeout(gustTimer);
      leaves.querySelectorAll('.is-caught').forEach(leaf => leaf.classList.remove('is-caught'));
      if (document.hidden || reducedMotion.matches) return;
      gustTimer = setTimeout(() => {
        if (document.hidden || reducedMotion.matches) return scheduleGust();
        const candidates = [...leaves.children].filter(leaf => {
          if (getComputedStyle(leaf).display === 'none') return false;
          const box = leaf.getBoundingClientRect();
          return box.top > 80 && box.bottom < innerHeight * .65 && box.right > 0 && box.left < innerWidth;
        });
        const mobile = innerWidth < 768;
        const count = Math.min(candidates.length, (mobile ? 1 : 2) + Math.floor(Math.random() * 2));
        for (let index = 0; index < count; index++) {
          const leaf = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
          const direction = leaf.getBoundingClientRect().left < innerWidth / 2 ? 1 : -1;
          const width = direction * (mobile ? 35 + Math.random() * 35 : 60 + Math.random() * 55);
          const lift = 40 + Math.random() * 35;
          // A closed curved path returns to the ongoing fall without a jump.
          const path = `path('M 0 0 C ${width * .2} ${-lift} ${width} ${-lift} ${width} 0 C ${width} ${lift * .35} ${width * .25} ${lift * .6} 0 0')`;
          leaf.style.setProperty('--gust-path', path);
          leaf.style.setProperty('--gust-spin', direction * 360 + 'deg');
          leaf.style.setProperty('--gust-duration', (2.8 + Math.random()) + 's');
          leaf.style.setProperty('--gust-delay', Math.random() * .45 + 's');
          leaf.classList.add('is-caught');
        }
        gustTimer = setTimeout(scheduleGust, 4500);
      }, 8000 + Math.random() * 10000);
    }
    const syncMotion = () => {
      leaves.classList.toggle('is-paused', document.hidden);
      scheduleGust();
    };
    document.addEventListener('visibilitychange', syncMotion);
    reducedMotion.addEventListener('change', syncMotion);
    syncMotion();
  }
  function ready() {
    autumnLeaves();
    decorate(document);
    // Start loading a full screen before an image scrolls into view, including
    // cards returned by AJAX. This also works if the old lazy loader is delayed.
    const promote = img => {
      if (!img.dataset.src) return;
      img.closest('picture')?.querySelectorAll('source[data-srcset]').forEach(source => {
        source.srcset = source.dataset.srcset;
        source.removeAttribute('data-srcset');
      });
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      img.classList.remove('lazyload', 'lazyloading');
      img.classList.add('lazyloaded');
      img.decoding = 'async';
    };
    const observedImages = new WeakSet();
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {promote(entry.target); imageObserver.unobserve(entry.target);}
      });
    }, {rootMargin: '800px 0px'});
    const watchImages = root => {
      const images = root.matches?.('img[data-src]') ? [root] : [...root.querySelectorAll('img[data-src]')];
      images.forEach(img => {
        if (!observedImages.has(img)) {observedImages.add(img); imageObserver.observe(img);}
      });
    };
    watchImages(document);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        watchImages(node);
        if (node.matches('.product-loop, .product-loop--wrap') || node.querySelector('.product-btn--plus')) decorate(node.parentElement || node);
      }));
    }).observe(document.querySelector('.main-body') || document.body, {childList: true, subtree: true});
    instantHelp();
    if (!document.querySelector('#collection-page')) {
      document.querySelectorAll('.collection-colorbar, .colorbar.is-fixed').forEach(node => node.remove());
    }
    fetch('/__local/settings').then(r => r.json()).then(settings => {
      plusImage = settings.plusButtonImage || defaultPlus;
      document.querySelectorAll('[data-quick-add] img').forEach(img => {img.src = plusImage;});
    }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
