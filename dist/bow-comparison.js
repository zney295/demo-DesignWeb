(() => {
  'use strict';
  const start = () => {
    const footer = document.querySelector('#comparison-footer');
    document.querySelectorAll('[data-compare-variant]').forEach(link => {
      link.addEventListener('click', () => {
        // Compare the footer state directly when switching after the photo.
        const switching = link.dataset.compareVariant !== document.body.dataset.bowVariant;
        link.hash = switching && footer?.getBoundingClientRect().top < innerHeight * .6 ? 'comparison-footer' : 'footer-reveal';
      });
    });
    if (document.body.dataset.bowVariant !== 'header') return;
    const origin = document.querySelector('.bow-comparison__origin');
    const bow = origin?.querySelector('.bow-comparison__bow');
    const header = document.querySelector('.main-header--inner');
    if (!origin || !bow || !header) return;
    let scheduled = false;
    let pinned = false;
    let lastY = Math.max(0, scrollY);
    let direction = 0;
    let travel = 0;
    const measure = () => document.documentElement.style.setProperty('--reveal-header-height', header.offsetHeight + 'px');
    const hideHeader = hidden => {
      document.body.classList.toggle('is-header-hidden', hidden);
      header.inert = hidden;
    };
    const update = () => {
      scheduled = false;
      const height = header.offsetHeight;
      const originTop = origin.getBoundingClientRect().top;
      const nextPinned = originTop <= height;
      if (nextPinned !== pinned) {
        pinned = nextPinned;
        (pinned ? header : origin).append(bow);
        document.body.classList.toggle('is-bow-header-pinned', pinned);
      }
      const maxY = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const y = Math.max(0, Math.min(scrollY, maxY));
      const delta = y - lastY;
      if (Math.abs(delta) > 1) {
        const nextDirection = Math.sign(delta);
        travel = direction === nextDirection ? travel + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;
      }
      lastY = y;
      const interacting = document.body.matches('.open-menumobile, .open-search, .open-sidebar-cart') ||
        (header.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
      // Reveal the bar just before the bow catches it, and retain both through the footer.
      if (pinned || originTop <= height + 96 || interacting || y < height) hideHeader(false);
      else if (direction < 0 && travel >= 80) hideHeader(false);
      else if (direction > 0 && travel >= 32 && y > height * 2) hideHeader(true);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    document.body.classList.add('has-smart-header');
    hideHeader(lastY > header.offsetHeight * 2);
    new ResizeObserver(() => {measure(); schedule();}).observe(header);
    new MutationObserver(schedule).observe(document.body, {attributes: true, attributeFilter: ['class']});
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', () => {measure(); lastY = Math.max(0, scrollY); direction = 0; travel = 0; schedule();}, {passive: true});
    addEventListener('pageshow', schedule);
    addEventListener('focusin', schedule);
    measure();
    update();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
