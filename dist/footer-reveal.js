(() => {
  'use strict';
  const start = () => {
    const reveal = document.querySelector('.footer-reveal');
    if (!reveal) return;
    const header = document.querySelector('.main-header--inner, .checkout-header');
    const photo = reveal.querySelector('.footer-reveal__window');
    const bow = reveal.querySelector('.footer-reveal__bow');
    const footer = reveal.querySelector('footer');
    let scheduled = false;
    let lastY = Math.max(0, scrollY);
    let direction = 0;
    let travel = 0;
    let headerHidden;
    const overlayIsOpen = () => document.body.matches('.open-menumobile, .open-search, .open-sidebar-cart');
    let overlayOpen = overlayIsOpen();
    const setHeaderHidden = hidden => {
      if (hidden === headerHidden) return;
      headerHidden = hidden;
      document.body.classList.toggle('is-header-hidden', hidden);
      if (header) header.inert = hidden;
    };
    const measureHeader = () => {
      const height = header?.offsetHeight || 0;
      document.documentElement.style.setProperty('--reveal-header-height', height + 'px');
    };
    const update = () => {
      scheduled = false;
      const box = reveal.getBoundingClientRect();
      const height = header?.offsetHeight || 0;
      const pin = parseFloat(getComputedStyle(photo).top) || 0;
      const photoBox = photo.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      const readingPhoto = photoBox.top <= pin + 1 && footerBox.top > pin + bow.offsetHeight && box.bottom > 0;
      document.body.classList.toggle('is-footer-revealing', box.top < innerHeight && box.bottom > 0);
      document.body.classList.toggle('is-viewing-footer-photo', readingPhoto);
      const maxY = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const y = Math.max(0, Math.min(scrollY, maxY));
      const delta = y - lastY;
      if (Math.abs(delta) > 1) {
        const nextDirection = Math.sign(delta);
        travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;
      }
      lastY = y;
      const interacting = overlayOpen ||
        (header?.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
      // Keep the bar stable throughout this scene. Its lower edge and the
      // photograph's upper edge are the same line, with the bow centered on it.
      const sceneAtHeader = box.top <= pin + 160 && box.bottom > 0;
      if (interacting || y < height || sceneAtHeader) setHeaderHidden(false);
      else if (direction < 0 && travel >= 80) setHeaderHidden(false);
      else if (readingPhoto && direction >= 0) setHeaderHidden(true);
      else if (direction > 0 && travel >= 32 && y > height * 2) setHeaderHidden(true);
    };
    const scroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    if (header) new ResizeObserver(() => {measureHeader(); scroll();}).observe(header);
    addEventListener('scroll', scroll, {passive: true});
    addEventListener('resize', () => {
      measureHeader();
      lastY = Math.max(0, scrollY);
      direction = 0;
      travel = 0;
      scroll();
    }, {passive: true});
    addEventListener('pageshow', scroll);
    addEventListener('focusin', scroll);
    new MutationObserver(() => {
      const next = overlayIsOpen();
      if (next !== overlayOpen) {overlayOpen = next; scroll();}
    }).observe(document.body, {attributes: true, attributeFilter: ['class']});
    document.body.classList.add('has-smart-header');
    document.body.classList.toggle('has-checkout-header', !!header?.classList.contains('checkout-header'));
    setHeaderHidden(lastY > (header?.offsetHeight || 0) * 2);
    measureHeader();
    update();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
