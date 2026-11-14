/* Your Fave Photobooth: menu, tile transitions, reveals, hero scroll, cursor, FAQ and reviews. */
(() => {
  'use strict';

  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const SLOW = 'cubic-bezier(.16,1,.3,1)';
  const SWEEP = 'cubic-bezier(.77,0,.18,1)';
  const NAV_KEY = 'yfp:curtain';
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* ---------- Reveals: boxes wipe up, hero copy rises ---------- */

  let pending = [];
  let revealing = false;

  function prime() {
    $$('main [data-box], footer [data-box], .hero__copy > div').forEach(el => {
      let a;
      if (el.hasAttribute('data-box')) {
        a = el.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, easing: SWEEP, fill: 'both' });
        const media = el.querySelector('[data-media]');
        if (media) {
          el._media = media.animate([{ transform: 'scale(1.4)' }, { transform: 'none' }], { duration: 1700, easing: SWEEP, fill: 'both' });
          el._media.pause();
          el._media.onfinish = () => el._media.cancel();
        }
      } else if (el.querySelector('h1')) {
        a = el.animate([{ opacity: 0, transform: 'translateY(90px)', filter: 'blur(14px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1500, easing: SLOW, fill: 'both' });
      } else {
        a = el.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, easing: SLOW, fill: 'both' });
      }
      a.pause();
      a.onfinish = () => a.cancel();
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
      if (r.top < vh && r.bottom > 0) { go.push([el, r]); return false; }
      return true;
    });
    go.sort((x, y) => x[1].top - y[1].top || x[1].left - y[1].left).forEach(([el], i) => {
      const delay = Math.min(i * 120, 720);
      el._reveal.effect.updateTiming({ delay });
      el._reveal.play();
      if (el._media) { el._media.effect.updateTiming({ delay }); el._media.play(); }
    });
  }

  function startReveals() { revealing = true; check(); }

  /* ---------- Tile curtain: intro and page transitions ---------- */

  const curtain = document.querySelector('.curtain');
  const STEP = 55;

  // Each tile's diagonal position (column + row) sets its delay.
  function tiles() {
    const cols = innerWidth < 760 ? 3 : 6;
    const rows = innerWidth < 760 ? 6 : 4;
    return $$('span', curtain).slice(0, cols * rows).map((t, i) => [t, (i % cols) + Math.floor(i / cols)]);
  }

  function clearCurtain() {
    curtain.getAnimations({ subtree: true }).forEach(a => a.cancel());
  }

  function openCurtain() {
    const logo = curtain.querySelector('img');
    const ts = tiles();
    const max = ts.reduce((m, [, d]) => Math.max(m, d), 0);
    logo.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: .85 }], { duration: 300, fill: 'both' });
    ts.forEach(([t, d]) => t.animate([{ transform: 'none' }, { transform: 'scale(0) rotate(90deg)' }], { duration: 650, delay: 120 + d * STEP, easing: SWEEP, fill: 'both' }));
    setTimeout(() => { root.classList.add('curtain-done'); clearCurtain(); }, 120 + max * STEP + 700);
    setTimeout(startReveals, 250);
  }

  function intro() {
    let fromNav = false;
    try { fromNav = sessionStorage.getItem(NAV_KEY) === '1'; sessionStorage.removeItem(NAV_KEY); } catch (e) { /* storage blocked */ }
    const header = document.querySelector('.site-header');
    if (header) {
      header.animate([{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: fromNav ? 500 : 1300, easing: SLOW, fill: 'backwards' });
    }
    const logo = curtain.querySelector('img');
    logo.animate([{ opacity: 0, scale: 1.3, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0)' }],
      { duration: fromNav ? 250 : 900, easing: SLOW, fill: 'both' })
      .onfinish = () => setTimeout(openCurtain, fromNav ? 0 : 200);
  }

  function leaveTo(href) {
    root.classList.remove('curtain-done');
    clearCurtain();
    const ts = tiles();
    const max = ts.reduce((m, [, d]) => Math.max(m, d), 0);
    ts.forEach(([t, d]) => t.animate([{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'none' }], { duration: 550, delay: d * STEP, easing: SWEEP, fill: 'both' }));
    setTimeout(() => {
      try { sessionStorage.setItem(NAV_KEY, '1'); } catch (e) { /* storage blocked */ }
      location.href = href;
    }, max * STEP + 560);
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

  addEventListener('pageshow', e => {
    if (!e.persisted || !curtain) return;
    clearCurtain();
    root.classList.add('curtain-done');
  });

  /* ---------- Menu ---------- */

  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.hbtn--menu');

  function openMenu() {
    menu.hidden = false;
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.hbtn__label').textContent = 'Close';
    if (motion) {
      $$('.mtile', menu).forEach((t, i) => t.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 800, delay: i * 55, easing: SWEEP, fill: 'backwards' }));
    }
  }

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.hbtn__label').textContent = 'Menu';
  }

  if (menu && toggle) {
    toggle.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
  }

  /* ---------- Hero scroll: the photo insets into a frame and the copy drifts away ---------- */

  const hero = document.querySelector('.hero');
  const heroMedia = hero && hero.querySelector('.hero__media');
  const heroFill = heroMedia && heroMedia.querySelector('img, video');
  const heroCopy = hero && hero.querySelector('.hero__copy');
  const boxMedia = $$('main [data-box] [data-media]');

  function onScrollFrame() {
    const vh = innerHeight;
    if (hero) {
      const q = Math.min(1, Math.max(0, scrollY / vh));
      const p = Math.min(1, scrollY / (vh * 0.3));
      const e = 1 - Math.pow(1 - p, 3);
      const ins = (e * Math.min(innerWidth * 0.07, 96)).toFixed(1);
      heroMedia.style.clipPath = `inset(${ins}px)`;
      if (heroFill) {
        heroFill.style.translate = `0 ${(q * vh * 0.1).toFixed(1)}px`;
        heroFill.style.scale = String(1 + e * 0.06);
      }
      heroCopy.style.left = heroCopy.style.right = heroCopy.style.bottom = ins + 'px';
      heroCopy.style.transformOrigin = 'left bottom';
      heroCopy.style.scale = String(1 - e * 0.06);
      heroCopy.style.translate = `0 ${(-q * vh * 0.12).toFixed(1)}px`;
      heroCopy.style.opacity = String(Math.max(0, 1 - Math.max(0, q - 0.25) * 1.6));
    }
    boxMedia.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const lim = r.height * 0.07;
      el.style.translate = `0 ${Math.max(-lim, Math.min(lim, (r.top + r.height / 2 - vh / 2) * -0.07)).toFixed(1)}px`;
    });
  }

  /* ---------- Cursor (mouse only) ---------- */

  if (motion && matchMedia('(pointer: fine)').matches) {
    const c = document.createElement('div');
    c.className = 'cursor';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span>Open</span>';
    document.body.appendChild(c);
    root.classList.add('yfp-cursor');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; c.style.opacity = 1; });
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) c.style.opacity = 0; });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest && e.target.closest('[data-cursor]');
      const big = !!t && !(t.classList.contains('faq') && t.classList.contains('is-open'));
      c.classList.toggle('is-big', big);
      if (big) c.firstChild.textContent = t.dataset.cursor;
    });
    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      c.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- FAQ: one card open at a time, opened card spans the row ---------- */

  const faqs = $$('.faq');
  faqs.forEach(card => card.querySelector('.faq__btn').addEventListener('click', () => {
    const open = card.classList.contains('is-open');
    faqs.forEach(f => {
      f.classList.remove('is-open');
      f.querySelector('.faq__btn').setAttribute('aria-expanded', 'false');
      f.querySelector('.faq__sign').textContent = '+';
      f.querySelector('.faq__a').hidden = true;
    });
    if (open) return;
    card.classList.add('is-open');
    card.querySelector('.faq__btn').setAttribute('aria-expanded', 'true');
    card.querySelector('.faq__sign').textContent = '−';
    card.querySelector('.faq__a').hidden = false;
    requestAnimationFrame(() => scrollTo({ top: card.getBoundingClientRect().top + scrollY - 90, behavior: motion ? 'smooth' : 'auto' }));
  }));

  /* ---------- Reviews ---------- */

  const reviews = $$('.review');
  const qdots = $$('.qdot');
  const idx = document.querySelector('.box-quote__idx');
  let current = 0;
  let timer = 0;

  function showReview(i) {
    if (i === current) return;
    reviews[current].hidden = true;
    qdots[current].setAttribute('aria-current', 'false');
    current = i;
    reviews[i].hidden = false;
    qdots[i].setAttribute('aria-current', 'true');
    if (idx) idx.textContent = `0${i + 1} / 0${reviews.length}`;
    if (motion) {
      reviews[i].querySelector('p').animate([{ opacity: 0, transform: 'translateY(24px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: 800, easing: SLOW });
    }
  }

  function autoplay() {
    clearInterval(timer);
    timer = setInterval(() => showReview((current + 1) % reviews.length), 8000);
  }

  if (reviews.length > 1) {
    qdots.forEach((d, i) => d.addEventListener('click', () => { showReview(i); autoplay(); }));
    autoplay();
  }

  /* ---------- Background videos ---------- */

  const videos = $$('video[data-bgvideo]');
  const playVideos = () => videos.forEach(v => {
    v.muted = true;
    v.defaultMuted = true;
    if (v.paused) v.play().catch(() => {});
  });
  playVideos();
  // Some phones only allow autoplay after the first touch or scroll.
  ['touchstart', 'click', 'scroll'].forEach(ev => addEventListener(ev, playVideos, { passive: true, once: true }));

  /* ---------- Wire up ---------- */

  let raf = 0;
  addEventListener('scroll', () => {
    if (raf || !motion) return;
    raf = requestAnimationFrame(() => { raf = 0; onScrollFrame(); check(); });
  }, { passive: true });
  addEventListener('resize', () => { if (motion) { onScrollFrame(); check(); } });

  if (motion) {
    prime();
    onScrollFrame();
    if (curtain) intro(); else startReveals();
  }
})();
