/* Your Fave Photobooth v3: menu, cursor, page transitions, scroll reveals. */
(() => {
  'use strict';
  const root = document.documentElement;
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* Menu */
  const menu = $('.menu'), btn = $('.menu-btn');
  const setMenu = open => {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (menu && btn) {
    btn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    $('.menu__x').addEventListener('click', () => setMenu(false));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* Scroll reveals */
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* Hero photo drifts a little as you scroll */
  const heroImg = $('.hero__photo img');
  if (motion && heroImg) {
    let raf = 0;
    addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = heroImg.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        heroImg.style.transform = `translateY(${(-r.top * 0.06).toFixed(1)}px) scale(1.06)`;
      });
    }, { passive: true });
  }

  /* Custom cursor (fine pointers only) */
  if (motion && matchMedia('(pointer: fine)').matches) {
    root.classList.add('has-cursor');
    const c = document.createElement('div');
    c.className = 'cursor';
    c.innerHTML = '<span>View</span>';
    document.body.appendChild(c);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; c.style.opacity = 1; });
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) c.style.opacity = 0; });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor]');
      c.classList.toggle('is-big', !!t);
      if (t) c.querySelector('span').textContent = t.dataset.cursor;
    });
    (function loop() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      c.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* Page transition: navy panel rises, logo shows, then navigate */
  const wipe = $('.wipe');
  const logoIn = () => {};
  addEventListener('pageshow', e => { if (e.persisted && wipe) wipe.style.transform = 'translateY(100%)'; });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !wipe || !motion) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || a.target === '_blank') return;
    e.preventDefault();
    setMenu(false);
    wipe.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.77,0,.18,1)', fill: 'forwards' });
    setTimeout(() => { location.href = url.href; }, 720);
  });
  // Entrance: wipe lifts on load
  if (wipe && motion) {
    wipe.style.transform = 'translateY(0)';
    wipe.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 900, delay: 150, easing: 'cubic-bezier(.77,0,.18,1)', fill: 'forwards' });
  } else if (wipe) {
    wipe.style.display = 'none';
  }
  /* Accordion (FAQ) */
  $$('.acc__q').forEach(b => b.addEventListener('click', () => {
    const item = b.closest('.acc__item'), open = item.classList.toggle('is-open');
    b.setAttribute('aria-expanded', String(open));
    item.querySelector('.acc__a').hidden = !open;
  }));
})();
