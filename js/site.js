/* Your Fave Photobooth: menu, motion, pinned carousels, FAQ and reviews. */
(() => {
  'use strict';

  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const SLOW = 'cubic-bezier(.16,1,.3,1)';
  const SWEEP = 'cubic-bezier(.77,0,.18,1)';
  const NAV_KEY = 'yfp:curtain';
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* ---------- Scroll-in reveals ---------- */

  const REVEAL = 'h1, .hero-title, .hero-sub, h2, p, li, img, .btn, .booth, .script, .label, .stars, .footer-col';
  const SKIP = '.site-header, .menu, .curtain, .marquee, [data-static]';
  const seen = new WeakSet();
  let pending = [];
  let revealing = false;

  function keyframes(el) {
    const tag = el.tagName;
    const t = getComputedStyle(el).transform;
    const rot = t === 'none' ? '' : t;
    if (tag === 'IMG' && el.closest('.hero')) {
      return [[{ transform: 'scale(1.45)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 2000, SWEEP];
    }
    if (tag === 'IMG' && rot) {
      return [[{ transform: `translateY(160px) ${rot} rotate(14deg) scale(.7)`, opacity: 0 }, { transform: rot, opacity: 1 }], 1500, SLOW];
    }
    if (tag === 'IMG') {
      return [[{ clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.3)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }], 1400, SWEEP];
    }
    if (el.matches('.hero-title') || (tag === 'H1' && !el.querySelector('.hero-title'))) {
      return [[{ opacity: 0, transform: 'translateY(90px) scale(1.2)', filter: 'blur(16px)', letterSpacing: '.12em' },
        { opacity: 1, transform: 'none', filter: 'blur(0)', letterSpacing: '0em' }], 1500, SLOW];
    }
    if (el.matches('.hero-sub')) {
      return [[{ opacity: 0, letterSpacing: '.45em', filter: 'blur(10px)' }, { opacity: 1, letterSpacing: '0em', filter: 'blur(0)' }], 1700, SLOW];
    }
    if (tag === 'H2') {
      return [[{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(70px) skewY(4deg)' }, { clipPath: 'inset(0 0 -20% 0)', transform: 'none' }], 1300, SLOW];
    }
    if (el.matches('.script')) {
      return [[{ clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -5% -20% 0)' }], 1800, 'cubic-bezier(.45,0,.2,1)'];
    }
    if (el.matches('.btn, .booth, .pill, .menu-mob__reserve')) {
      return [[{ opacity: 0, transform: `${rot} scale(.6)` }, { opacity: 1, transform: rot || 'none' }], 900, 'cubic-bezier(.34,1.7,.64,1)'];
    }
    if (tag === 'LI' || el.closest('nav')) {
      return [[{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }], 1000, SLOW];
    }
    return [[{ opacity: 0, transform: 'translateY(46px)' }, { opacity: 1, transform: 'none' }], 1100, SLOW];
  }

  function animate(el, delay = 0) {
    const [frames, duration, easing] = keyframes(el);
    const a = el.animate(frames, { duration, easing, delay, fill: 'both' });
    a.onfinish = () => a.cancel();
    return a;
  }

  // Hold each element at its first frame until it scrolls into view.
  function prime(scope) {
    $$(REVEAL, scope).forEach(el => {
      if (seen.has(el) || el.closest(SKIP) || el.closest('[hidden]')) return;
      if (el.closest('.site-footer') && !el.matches('.footer-col')) return;
      if (el.parentElement && el.parentElement.closest('h1') && !el.matches('.hero-title, .hero-sub')) return;
      if (el.tagName === 'H1' && el.querySelector('.hero-title')) return;
      seen.add(el);
      const a = animate(el);
      a.pause();
      a.currentTime = 0;
      el._reveal = a;
      pending.push(el);
    });
  }

  function check() {
    if (!revealing || !pending.length) return;
    const vh = innerHeight * 0.92;
    const go = [];
    pending = pending.filter(el => {
      if (!el.isConnected) return false;
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > -50) { go.push([el, r]); return false; }
      return true;
    });
    go.sort((x, y) => x[1].top - y[1].top || x[1].left - y[1].left)
      .forEach(([el], i) => {
        el._reveal.effect.updateTiming({ delay: Math.min(i * 90, 700) });
        el._reveal.play();
      });
  }

  function startReveals() {
    revealing = true;
    check();
  }

  // Play a group of elements in reading order, one after another.
  function cascade(els) {
    els.map(el => [el, el.getBoundingClientRect()])
      .sort((x, y) => x[1].top - y[1].top || x[1].left - y[1].left)
      .forEach(([el], i) => animate(el, Math.min(i * 90, 700)));
  }

  /* ---------- Curtain: intro and page transitions ---------- */

  const curtain = document.querySelector('.curtain');
  const curtainLogo = curtain && curtain.querySelector('img');

  function liftCurtain() {
    curtainLogo.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.85)' }], { duration: 350, fill: 'both' });
    curtain.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 900, delay: 200, easing: SWEEP, fill: 'both' })
      .onfinish = () => {
        root.classList.add('curtain-done');
        curtain.getAnimations().forEach(a => a.cancel());
        curtainLogo.getAnimations().forEach(a => a.cancel());
      };
    setTimeout(startReveals, 200);
  }

  function intro() {
    let fromNav = false;
    try { fromNav = sessionStorage.getItem(NAV_KEY) === '1'; sessionStorage.removeItem(NAV_KEY); } catch (e) { /* storage blocked */ }
    const header = document.querySelector('.site-header');
    if (header) {
      header.animate([{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, delay: fromNav ? 500 : 1500, easing: SLOW, fill: 'both' });
    }
    if (fromNav) { liftCurtain(); return; }
    curtainLogo.animate([{ opacity: 0, transform: 'scale(1.4)', filter: 'blur(12px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' }],
      { duration: 1000, easing: SLOW, fill: 'both' })
      .onfinish = () => setTimeout(liftCurtain, 250);
  }

  function leaveTo(href) {
    root.classList.remove('curtain-done');
    curtain.getAnimations().forEach(a => a.cancel());
    curtain.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 650, easing: SWEEP, fill: 'both' })
      .onfinish = () => {
        try { sessionStorage.setItem(NAV_KEY, '1'); } catch (e) { /* storage blocked */ }
        location.href = href;
      };
    curtainLogo.animate([{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: 250, fill: 'both' });
  }

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) {
      if (url.hash) return;
      e.preventDefault();
      closeMenu();
      scrollTo(0, 0);
      return;
    }
    if (!motion || !curtain) return;
    e.preventDefault();
    leaveTo(url.href);
  });

  // Coming back through the browser's back/forward cache: drop the covering curtain.
  addEventListener('pageshow', e => {
    if (!e.persisted || !curtain) return;
    curtain.getAnimations().forEach(a => a.cancel());
    root.classList.add('curtain-done');
  });

  /* ---------- Menu ---------- */

  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.menu-toggle');

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    const panel = $$('.menu-desk, .menu-mob', menu).find(p => getComputedStyle(p).display !== 'none');
    if (panel) {
      const close = panel.querySelector('.menu-close, .menu-mob__close');
      if (close) close.focus();
      if (motion) cascade($$('img, nav a, .script, .menu-places, .menu-mob__reserve', panel));
    }
  }

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  if (menu && toggle) {
    toggle.addEventListener('click', openMenu);
    $$('[data-menu-close]', menu).forEach(b => b.addEventListener('click', closeMenu));
    addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Pinned carousels ----------
     Each [data-pin] wrapper is made as tall as its section plus the carousel's
     overflow. The section sticks while the page scrolls through that extra
     height, and the vertical scroll drives the carousel sideways. */

  const pins = $$('[data-pin]').map(w => ({ w, sec: w.firstElementChild, c: w.querySelector('.carousel') }))
    .filter(p => p.sec && p.c);

  function layoutPins() {
    const vh = innerHeight;
    pins.forEach(p => {
      if (!p.ready) {
        p.ready = true;
        p.c.classList.add('is-pinned');
        p.sec.style.position = 'sticky';
      }
      const dist = Math.max(0, p.c.scrollWidth - p.c.clientWidth);
      const H = p.sec.offsetHeight;
      const off = H > vh ? vh - H : Math.round((vh - H) / 2);
      const wh = Math.round(H + dist);
      if (p.h !== wh) { p.w.style.height = wh + 'px'; p.h = wh; }
      if (p.off !== off) { p.sec.style.top = off + 'px'; p.off = off; }
      const wt = p.w.getBoundingClientRect().top;
      p.c.scrollLeft = Math.min(dist, Math.max(0, off - wt));
      p.start = scrollY + wt - off;
      p.dist = dist;
    });
  }

  function pinFor(el) {
    const w = el.closest('[data-pin]');
    return pins.find(p => p.w === w);
  }

  $$('[data-car-prev], [data-car-next]').forEach(btn => btn.addEventListener('click', () => {
    const p = pinFor(btn);
    if (!p) return;
    const first = p.c.firstElementChild;
    const gap = parseFloat(getComputedStyle(p.c).columnGap) || 0;
    const step = first ? first.getBoundingClientRect().width + gap : p.c.clientWidth * 0.8;
    const dir = btn.hasAttribute('data-car-next') ? 1 : -1;
    const target = Math.max(0, Math.min(p.dist, p.c.scrollLeft + dir * step));
    scrollTo({ top: p.start + target, behavior: 'smooth' });
  }));

  // Mouse drag on a carousel scrolls the page, which moves the carousel.
  let drag = null;
  let dragged = false;
  addEventListener('pointerdown', e => {
    const c = e.target.closest && e.target.closest('.carousel.is-pinned');
    if (!c || e.pointerType !== 'mouse') return;
    drag = { c, x: e.clientX, s: scrollY, moved: false };
    c.classList.add('is-dragging');
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) drag.moved = true;
    scrollTo(0, drag.s - dx);
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    drag.c.classList.remove('is-dragging');
    dragged = drag.moved;
    drag = null;
    setTimeout(() => { dragged = false; }, 50);
  });
  // A drag must not count as a click on the card under the pointer.
  addEventListener('click', e => {
    if (dragged && e.target.closest('.carousel')) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ---------- Parallax ---------- */

  const heroImgs = $$('.hero img');
  const floats = $$('.collage__tilt, .statement__float');

  function parallax() {
    const vh = innerHeight;
    heroImgs.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      img.style.translate = `0 ${(-r.top * 0.35).toFixed(1)}px`;
    });
    floats.forEach(img => {
      const shift = img._shift || 0;
      const r = img.getBoundingClientRect();
      const top = r.top - shift;
      if (r.bottom < -200 || top > vh + 200) return;
      img._shift = (top + r.height / 2 - vh / 2) * -0.18;
      img.style.translate = `0 ${img._shift.toFixed(1)}px`;
    });
  }

  /* ---------- FAQ accordion ---------- */

  const faqButtons = $$('.faq__q');
  faqButtons.forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    faqButtons.forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.querySelector('.faq__sign').textContent = '+';
      document.getElementById(b.getAttribute('aria-controls')).hidden = true;
    });
    if (open) return;
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', 'true');
    btn.querySelector('.faq__sign').textContent = '−';
    panel.hidden = false;
    if (motion) cascade($$('p, .pill', panel));
  }));

  /* ---------- Reviews ---------- */

  const reviews = $$('.review');
  const dots = $$('.dot');
  let current = 0;
  let timer = 0;

  function showReview(i) {
    if (i === current) return;
    reviews[current].hidden = true;
    dots[current].setAttribute('aria-current', 'false');
    current = i;
    reviews[i].hidden = false;
    dots[i].setAttribute('aria-current', 'true');
    if (motion) {
      reviews[i].querySelector('p').animate([{ opacity: 0, transform: 'translateX(60px)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: 900, easing: SLOW });
    }
  }

  function autoplay() {
    clearInterval(timer);
    timer = setInterval(() => showReview((current + 1) % reviews.length), 8000);
  }

  if (reviews.length > 1) {
    dots.forEach((d, i) => d.addEventListener('click', () => { showReview(i); autoplay(); }));
    autoplay();
  }

  /* ---------- Background video (/dp) ---------- */

  const video = document.querySelector('video[data-bgvideo]');
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    if (video.paused) video.play().catch(() => {});
  }

  /* ---------- Wire up ---------- */

  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      layoutPins();
      if (motion) { parallax(); check(); }
    });
  }, { passive: true });
  addEventListener('resize', () => { layoutPins(); if (motion) check(); });
  addEventListener('load', layoutPins);
  if (document.fonts) document.fonts.ready.then(layoutPins);
  layoutPins();

  if (motion) {
    const marquee = document.querySelector('.marquee');
    if (marquee) marquee.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 32000, iterations: Infinity });
    prime(document);
    parallax();
    if (curtain) intro(); else startReveals();
  }
})();
