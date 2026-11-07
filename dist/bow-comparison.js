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
    let pinned = false;
    let lastOffset = 0;
    const approachDistance = 72;
    let geometry = {pinStart: Infinity, maxY: Infinity};
    const measure = () => {
      // Geometry is read only after a layout change, never on ordinary scroll frames.
      const height = header.offsetHeight;
      const bowHeight = bow.offsetHeight;
      const top = Math.max(0, height * .75 + 2 - bowHeight / 2);
      const regionTop = region.getBoundingClientRect().top + scrollY;
      geometry = {
        pinStart: regionTop - top,
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
      const nextPinned = y >= geometry.pinStart;
      if (nextPinned !== pinned) {
        pinned = nextPinned;
        body.classList.toggle('is-bow-scene-active', pinned);
        body.classList.toggle('is-bow-header-pinned', pinned);
        header.inert = pinned;
      }

      // Ease out of normal scroll speed before sticky takes over at the seam.
      const distance = geometry.pinStart - y;
      let offset = 0;
      if (geometry.pinStart <= geometry.maxY && distance > 0 && distance < approachDistance) {
        const progress = 1 - distance / approachDistance;
        offset = -distance * progress ** 2;
      }
      if (offset !== lastOffset) {
        bowImage.style.setProperty('--bow-approach-offset', offset + 'px');
        lastOffset = offset;
      }
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    const invalidateGeometry = () => {geometryDirty = true; schedule();};
    const initialHeight = header.offsetHeight;
    body.style.setProperty('--reveal-header-height', initialHeight + 'px');
    const resizeObserver = new ResizeObserver(invalidateGeometry);
    [header, region, document.querySelector('.main-body')].filter(Boolean).forEach(node => resizeObserver.observe(node));
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', invalidateGeometry, {passive: true});
    addEventListener('pageshow', invalidateGeometry);
    document.fonts?.ready.then(invalidateGeometry);
    region.querySelector('.bow-comparison__photo')?.addEventListener('load', invalidateGeometry, {once: true});
    bowImage.decode?.().catch(() => {});
    schedule();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
