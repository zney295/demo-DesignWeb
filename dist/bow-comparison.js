(() => {
  'use strict';
  const start = () => {
    if (document.body.dataset.bowVariant !== 'header') return;
    const region = document.querySelector('.bow-comparison__region');
    const bow = region?.querySelector('.bow-comparison__bow');
    const bowImage = bow?.querySelector('img');
    const header = document.querySelector('.main-header--inner');
    if (!region || !bow || !bowImage || !header) return;
    const body = document.body;
    let scheduled = false;
    let geometryDirty = true;
    let headerHidden = null;
    let pinned = false;
    let lastY = Math.max(0, scrollY);
    let direction = 0;
    let travel = 0;
    let lastScale = -1;
    let geometry = {height: 64, sceneStart: Infinity, pinStart: Infinity, dockScale: .5, maxY: Infinity};
    const overlayIsOpen = () => body.matches('.open-menumobile, .open-search, .open-sidebar-cart');
    let overlayOpen = overlayIsOpen();
    let keyboardFocus = false;
    const hideHeader = hidden => {
      if (hidden === headerHidden) return;
      headerHidden = hidden;
      body.classList.toggle('is-header-hidden', hidden);
      header.inert = hidden;
    };
    const measure = () => {
      // Geometry is read only after a layout change, never on ordinary scroll frames.
      const height = header.offsetHeight;
      const bowHeight = bow.offsetHeight;
      const bowWidth = bowImage.offsetWidth;
      const dockWidth = parseFloat(getComputedStyle(body).getPropertyValue('--bow-docked-width')) || 40;
      const top = height + 2 - bowHeight / 2;
      const regionTop = region.getBoundingClientRect().top + scrollY;
      geometry = {
        height,
        sceneStart: regionTop - innerHeight,
        pinStart: regionTop - top,
        dockScale: dockWidth / bowWidth,
        maxY: Math.max(0, document.documentElement.scrollHeight - innerHeight)
      };
      body.style.setProperty('--reveal-header-height', height + 'px');
      body.style.setProperty('--bow-sticky-top', top + 'px');
      geometryDirty = false;
    };
    const update = () => {
      scheduled = false;
      if (geometryDirty) measure();
      const y = Math.max(0, Math.min(scrollY, geometry.maxY));
      // The bow has its own strip throughout the photo/footer scene, in either
      // scroll direction. Navigation only returns before this scene is visible.
      const sceneActive = y >= geometry.sceneStart;
      body.classList.toggle('is-bow-scene-active', sceneActive);
      const nextPinned = y >= geometry.pinStart;
      if (nextPinned !== pinned) {
        pinned = nextPinned;
        body.classList.toggle('is-bow-header-pinned', pinned);
      }
      // Native sticky handles position. Only the image's compositor transform
      // changes over the final 96px of approach, with no time-based scroll lag.
      const progress = Math.max(0, Math.min(1, (y - geometry.pinStart + 96) / 96));
      const eased = progress * progress * (3 - 2 * progress);
      const scale = Math.round((1 + (geometry.dockScale - 1) * eased) * 10000) / 10000;
      if (scale !== lastScale) {
        bowImage.style.setProperty('--bow-scale', String(scale));
        lastScale = scale;
      }
      const delta = y - lastY;
      if (Math.abs(delta) > 1) {
        const nextDirection = Math.sign(delta);
        travel = direction === nextDirection ? travel + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;
      }
      lastY = y;
      if (sceneActive) hideHeader(true);
      else if (overlayOpen || keyboardFocus || y < geometry.height) hideHeader(false);
      else if (direction < 0 && travel >= 80) hideHeader(false);
      else if (direction > 0 && travel >= 32 && y > geometry.height * 2) hideHeader(true);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    const invalidateGeometry = () => {geometryDirty = true; schedule();};
    const initialHeight = header.offsetHeight;
    body.style.setProperty('--reveal-header-height', initialHeight + 'px');
    body.classList.add('has-smart-header');
    hideHeader(lastY > initialHeight * 2);
    const resizeObserver = new ResizeObserver(invalidateGeometry);
    [header, region, document.querySelector('.main-body')].filter(Boolean).forEach(node => resizeObserver.observe(node));
    // Own state classes do not enqueue another frame; only UI overlays matter.
    new MutationObserver(() => {
      const next = overlayIsOpen();
      if (next !== overlayOpen) {overlayOpen = next; schedule();}
    }).observe(body, {attributes: true, attributeFilter: ['class']});
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', () => {lastY = Math.max(0, scrollY); direction = 0; travel = 0; invalidateGeometry();}, {passive: true});
    addEventListener('pageshow', invalidateGeometry);
    const focusChanged = () => {
      keyboardFocus = header.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      schedule();
    };
    addEventListener('focusin', focusChanged);
    addEventListener('focusout', focusChanged);
    document.fonts?.ready.then(invalidateGeometry);
    region.querySelector('.bow-comparison__photo')?.addEventListener('load', invalidateGeometry, {once: true});
    bowImage.decode?.().catch(() => {});
    schedule();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
