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
  if (wipe && motion) wipe.style.display = 'block';
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

  /* Accordion (FAQ) */
  $$('.acc__q').forEach(b => b.addEventListener('click', () => {
    const item = b.closest('.acc__item'), open = item.classList.toggle('is-open');
    b.setAttribute('aria-expanded', String(open));
    item.querySelector('.acc__a').hidden = !open;
  }));
  /* Pinned carousels: the section holds still while the cards slide sideways, then the page carries on */
  const pins = [];
  $$('.sec').forEach(sec => {
    const track = sec.querySelector('.svc, .car__track');
    if (!track) return;
    const wrap = document.createElement('div');
    wrap.className = 'pin';
    sec.parentNode.insertBefore(wrap, sec);
    wrap.appendChild(sec);
    track.style.scrollSnapType = 'none';
    track.style.scrollBehavior = 'auto';
    pins.push({ wrap, sec, track, max: 0, stick: 0 });
  });
  const layout = () => {
    pins.forEach(p => {
      p.max = Math.max(0, p.track.scrollWidth - p.track.clientWidth);
      const sh = p.sec.offsetHeight;
      if (motion && p.max > 2) {
        p.stick = Math.max(0, (innerHeight - sh) / 2);
        p.sec.style.position = 'sticky';
        p.sec.style.top = p.stick + 'px';
        p.wrap.style.height = (sh + p.stick + p.max) + 'px';
      } else {
        p.sec.style.position = '';
        p.sec.style.top = '';
        p.wrap.style.height = '';
      }
    });
    update();
  };
  const update = () => {
    pins.forEach(p => {
      const track = p.track;
      const prev = p.sec.querySelector('[data-prev]'), next = p.sec.querySelector('[data-next]');
      if (motion && p.max > 2) {
        const r = p.wrap.getBoundingClientRect();
        const prog = Math.min(1, Math.max(0, (p.stick - r.top) / p.max));
        track.scrollLeft = prog * p.max;
      }
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= p.max - 2;
    });
  };
  // Arrow buttons move the page to the matching point in the pin, so both controls stay in step
  $$('.car__btn').forEach(btn => btn.addEventListener('click', () => {
    const p = pins.find(x => x.sec.contains(btn));
    if (!p || !p.max) return;
    const first = p.track.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + 22 : 300;
    const dir = btn.hasAttribute('data-next') ? 1 : -1;
    const target = Math.max(0, Math.min(p.max, p.track.scrollLeft + dir * step));
    const wrapTop = p.wrap.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: wrapTop - p.stick + target, behavior: motion ? 'smooth' : 'auto' });
  }));
  let pinRaf = 0;
  const tick = () => { if (pinRaf) return; pinRaf = requestAnimationFrame(() => { pinRaf = 0; update(); }); };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', layout);
  addEventListener('load', layout);
  layout();

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
  /* Gallery rows: auto-scroll, pause while touched or scrolled by hand, resume when it stops */
  const galHold = { paused: false, t: 0 };
  $$('.mq__row').forEach(row => {
    row.insertAdjacentHTML('beforeend', row.innerHTML);
    const dir = row.dataset.dir === 'rev' ? -1 : 1;
    const speed = 0.6;
    let pos = 0, idle = 0;
    const half = () => row.scrollWidth / 2;
    pos = dir > 0 ? 0 : half();
    row.scrollLeft = pos;
    const hold = () => { galHold.paused = true; clearTimeout(galHold.t); };
    const release = () => { clearTimeout(galHold.t); galHold.t = setTimeout(() => { galHold.paused = false; }, 1500); };
    row.addEventListener('pointerdown', hold);
    row.addEventListener('touchstart', hold, { passive: true });
    row.addEventListener('wheel', () => { hold(); release(); }, { passive: true });
    row.addEventListener('pointerup', release);
    row.addEventListener('pointercancel', release);
    row.addEventListener('touchend', release, { passive: true });
    if (!motion) return;
    const step = () => {
      const h = half();
      if (galHold.paused) {
        pos = row.scrollLeft;
      } else {
        if (Math.abs(row.scrollLeft - pos) > 1.5) pos = row.scrollLeft;
        pos += dir * speed;
        if (pos >= h) pos -= h;
        else if (pos < 0) pos += h;
        row.scrollLeft = pos;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
