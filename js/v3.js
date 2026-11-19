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
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
  /* Gallery carousel: arrows and mouse drag */
  $$('[data-car]').forEach(car => {
    const track = car.querySelector('.car__track');
    const step = () => { const im = track.querySelector('img'); return im ? im.getBoundingClientRect().width + 22 : 300; };
    const prev = car.querySelector('[data-prev]'), next = car.querySelector('[data-next]');
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: motion ? 'smooth' : 'auto' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: motion ? 'smooth' : 'auto' }));
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    track.querySelectorAll('img').forEach(im => im.addEventListener('load', sync));
    setTimeout(sync, 300);
    sync();
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add('is-drag');
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false; track.classList.remove('is-drag');
      if (moved) { const target = Math.round(track.scrollLeft / step()) * step(); track.scrollTo({ left: target, behavior: 'smooth' }); }
    });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* Testimonials: dots and gentle rotation */
  $$('.rev').forEach(rev => {
    const qs = $$('.rev__q', rev), dots = $$('.dots i', rev);
    if (qs.length < 2) return;
    let i = 0, timer = 0;
    const show = n => {
      qs[i].hidden = true; dots[i].classList.remove('on');
      i = n; qs[i].hidden = false; dots[i].classList.add('on');
      if (motion) qs[i].animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)' });
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => show((i + 1) % qs.length), 8000); };
    dots.forEach((d, n) => d.addEventListener('click', () => { if (n !== i) show(n); start(); }));
    start();
  });
})();
