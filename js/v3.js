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

  /* Page transition: a circle opens from the click point, shows the logo, then the next page opens from the same spot */
  const wipe = $('.wipe');
  const ENTER = 'yfp:enter';
  const EASE = 'cubic-bezier(.77,0,.18,1)';
  if (wipe && motion && sessionStorage.getItem(ENTER)) {
    sessionStorage.removeItem(ENTER);
    wipe.animate([{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0px at 50% 50%)' }],
      { duration: 900, delay: 120, easing: EASE, fill: 'both' });
  }
  if (wipe && !motion) wipe.style.display = 'none';
  addEventListener('pageshow', e => { if (e.persisted && wipe) wipe.style.clipPath = 'circle(0px at 50% 50%)'; });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !wipe || !motion) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || a.target === '_blank') return;
    e.preventDefault();
    setMenu(false);
    const cx = e.clientX || innerWidth / 2, cy = e.clientY || innerHeight / 2;
    const r = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    sessionStorage.setItem(ENTER, '1');
    wipe.animate([{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${r}px at ${cx}px ${cy}px)` }],
      { duration: 700, easing: EASE, fill: 'forwards' });
    const logo = wipe.querySelector('img');
    if (logo) logo.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 300, fill: 'both' });
    setTimeout(() => { location.href = url.href; }, 950);
  });

  /* Carousels: they move sideways as the page scrolls past them, so every card gets seen */
  const linked = $$('.car__track, .svc').filter(t => t.scrollWidth > t.clientWidth + 2);
  linked.forEach(t => {
    t.addEventListener('touchstart', () => { t.__touch = true; }, { passive: true });
    t.addEventListener('touchend', () => { setTimeout(() => { t.__touch = false; }, 1200); }, { passive: true });
    t.addEventListener('pointerdown', () => { t.__hold = Date.now() + 1500; }, true);
    t.closest('.car, .sec') && (t.__box = t.closest('.car, .sec'));
  });
  $$('.car__btn').forEach(btn => btn.addEventListener('click', () => {
    const track = btn.closest('.car').querySelector('.car__track');
    track.__hold = Date.now() + 1500;
  }));
  const drive = () => {
    linked.forEach(t => {
      if (t.__touch || t.classList.contains('is-drag') || (t.__hold && Date.now() < t.__hold)) return;
      const box = (t.__box || t.parentElement).getBoundingClientRect();
      const max = t.scrollWidth - t.clientWidth;
      const p = Math.min(1, Math.max(0, (innerHeight - box.top) / (innerHeight + box.height)));
      t.scrollLeft = p * max;
    });
  };
  let driveRaf = 0;
  if (motion && linked.length) {
    const tick = () => { if (driveRaf) return; driveRaf = requestAnimationFrame(() => { driveRaf = 0; drive(); }); };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    drive();
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
