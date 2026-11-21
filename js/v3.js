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
    $$('.reveal, .wall').forEach(el => io.observe(el));
  } else {
    $$('.reveal, .wall').forEach(el => el.classList.add('is-in'));
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
  const radius = (x, y) => Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  /* Arriving page: the navy cover is already in place from the first paint (html.entering),
     then it opens from the tap point once the page has loaded */
  let from = null;
  try { from = JSON.parse(sessionStorage.getItem(ENTER) || 'null'); sessionStorage.removeItem(ENTER); } catch (err) {}
  if (wipe && motion) {
    wipe.style.display = 'block';
    if (from) {
      /* runs once only: the load event and the fallback timer must not both open the cover */
      let opened = false, fallback = 0;
      const open = () => {
        if (opened) return;
        opened = true;
        clearTimeout(fallback);
        root.classList.remove('entering');
        wipe.animate([{ clipPath: `circle(${radius(from.x, from.y)}px at ${from.x}px ${from.y}px)` }, { clipPath: `circle(0px at ${from.x}px ${from.y}px)` }],
          { duration: 800, delay: 60, easing: EASE, fill: 'both' });
      };
      if (document.readyState === 'complete') open();
      else { addEventListener('load', open, { once: true }); fallback = setTimeout(open, 2500); }
    } else root.classList.remove('entering');
  } else root.classList.remove('entering');
  /* Back/forward from the browser cache: the cover from the last click is still held by its finished animation, so clear it */
  addEventListener('pageshow', e => {
    if (!e.persisted || !wipe) return;
    wipe.getAnimations({ subtree: true }).forEach(a => a.cancel());
    wipe.style.clipPath = '';
    wipe.style.display = 'none';
    root.classList.remove('entering');
    try { sessionStorage.removeItem(ENTER); } catch (err) {}
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || !wipe || !motion) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || a.target === '_blank') return;
    e.preventDefault();
    setMenu(false);
    const cx = e.clientX || innerWidth / 2, cy = e.clientY || innerHeight / 2;
    sessionStorage.setItem(ENTER, JSON.stringify({ x: cx, y: cy }));
    wipe.style.display = 'block';
    wipe.animate([{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${radius(cx, cy)}px at ${cx}px ${cy}px)` }],
      { duration: 550, easing: EASE, fill: 'forwards' });
    const logo = wipe.querySelector('img');
    if (logo) logo.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 200, fill: 'both' });
    /* navigate as soon as the circle covers the screen; the next page opens from the same spot */
    setTimeout(() => { location.href = url.href; }, 560);
  });

  /* Accordion (FAQ) */
  $$('.acc__q').forEach(b => b.addEventListener('click', () => {
    const item = b.closest('.acc__item'), open = item.classList.toggle('is-open');
    b.setAttribute('aria-expanded', String(open));
    item.querySelector('.acc__a').hidden = !open;
  }));
  /* Pinned carousels: the section holds still while the cards slide sideways, then the page carries on.
     The row is moved with a GPU transform (no layout work per frame), and sizes come from a stable screen height,
     so fast scrolling, the iPhone address bar collapsing, and video cards all stay smooth. */
  const pins = [];
  $$('.sec').forEach(sec => {
    const track = sec.querySelector('.svc, .car__track, .incl, .types');
    if (!track) return;
    const wrap = document.createElement('div');
    wrap.className = 'pin';
    sec.parentNode.insertBefore(wrap, sec);
    wrap.appendChild(sec);
    pins.push({ wrap, sec, track, max: 0, stick: 0, x: 0, linked: false });
  });
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  let lastW = 0;
  const layout = () => {
    lastW = innerWidth;
    const vh = probe.offsetHeight || innerHeight;
    const hdr = document.querySelector('.hdr');
    const hh = hdr && getComputedStyle(hdr).position === 'fixed' ? hdr.offsetHeight : 0;
    pins.forEach(p => {
      const t = p.track;
      t.style.transform = ''; t.style.overflowX = ''; t.style.willChange = '';
      p.sec.style.position = ''; p.sec.style.top = ''; p.wrap.style.height = '';
      p.max = Math.max(0, t.scrollWidth - t.clientWidth);
      p.linked = motion && p.max > 2;
      if (p.linked) {
        const sh = p.sec.offsetHeight;
        p.stick = hh + Math.max(0, (vh - hh - sh) / 2);
        t.scrollLeft = 0;
        t.style.overflowX = 'visible';
        t.style.touchAction = 'pan-y';
        t.style.willChange = 'transform';
        p.sec.style.position = 'sticky';
        p.sec.style.top = p.stick + 'px';
        p.wrap.style.height = (sh + p.stick + p.max) + 'px';
        p.x = -1;
      } else {
        t.style.touchAction = '';
      }
    });
    update();
  };
  const update = () => {
    pins.forEach(p => {
      if (!p.linked) return;
      const top = p.wrap.getBoundingClientRect().top;
      const x = Math.min(p.max, Math.max(0, p.stick - top));
      if (Math.abs(x - p.x) < 0.25) return;
      p.x = x;
      p.track.style.transform = `translate3d(${-x}px,0,0)`;
      const prev = p.sec.querySelector('[data-prev]'), next = p.sec.querySelector('[data-next]');
      if (prev) prev.disabled = x <= 2;
      if (next) next.disabled = x >= p.max - 2;
    });
  };
  // Arrow buttons move the page to the matching point in the pin, so both controls stay in step
  $$('.car__btn').forEach(btn => btn.addEventListener('click', () => {
    const p = pins.find(q => q.sec.contains(btn));
    if (!p || !p.linked) return;
    const first = p.track.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + 22 : 300;
    const dir = btn.hasAttribute('data-next') ? 1 : -1;
    const target = Math.max(0, Math.min(p.max, p.x + dir * step));
    const wrapTop = p.wrap.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: wrapTop - p.stick + target, behavior: 'smooth' });
  }));
  /* A sideways swipe (or trackpad scroll) on a pinned row scrolls the page itself. The row only ever moves with
     the page, so it can't be dragged out of step, and scrolling up or down carries on from wherever it was left. */
  pins.forEach(p => {
    let x = 0, y = 0, axis = null, t = 0, v = 0, glide = 0;
    const stopGlide = () => { if (glide) cancelAnimationFrame(glide); glide = 0; };
    p.track.addEventListener('touchstart', e => {
      if (!p.linked) return;
      stopGlide();
      x = e.touches[0].clientX; y = e.touches[0].clientY; axis = null; t = performance.now(); v = 0;
    }, { passive: true });
    p.track.addEventListener('touchmove', e => {
      if (!p.linked) return;
      const nx = e.touches[0].clientX, ny = e.touches[0].clientY, dx = nx - x, dy = ny - y;
      if (axis === null && Math.abs(dx) + Math.abs(dy) > 6) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis !== 'x') return;
      e.preventDefault();
      const now = performance.now();
      v = 0.8 * v + 0.2 * (-dx / Math.max(1, now - t));
      t = now; x = nx; y = ny;
      window.scrollBy(0, -dx);
    }, { passive: false });
    p.track.addEventListener('touchend', () => {
      if (!p.linked || axis !== 'x' || !motion) return;
      let speed = v * 16;
      const step = () => {
        speed *= 0.95;
        if (Math.abs(speed) < 0.3) { glide = 0; return; }
        window.scrollBy(0, speed);
        glide = requestAnimationFrame(step);
      };
      glide = requestAnimationFrame(step);
    }, { passive: true });
    p.track.addEventListener('wheel', e => {
      if (!p.linked || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      window.scrollBy(0, e.deltaX);
    }, { passive: false });
  });
  let pinRaf = 0;
  const tick = () => { if (pinRaf) return; pinRaf = requestAnimationFrame(() => { pinRaf = 0; update(); }); };
  addEventListener('scroll', tick, { passive: true });
  // Height-only resizes (the iPhone address bar showing or hiding) do not re-measure, so nothing jumps mid-scroll
  addEventListener('resize', () => { if (innerWidth !== lastW) layout(); });
  addEventListener('load', layout);
  layout();

  /* Testimonials: previous/next buttons, dots and swipe. No auto-advance, so readers stay on the one they chose */
  $$('[data-qz]').forEach(z => {
    const qs = $$('.rev__q', z), dots = $$('.dots i', z), track = $('.rev__qs', z);
    if (!qs.length) return;
    let i = 0, x0 = null;
    const show = n => {
      i = (n + qs.length) % qs.length;
      qs.forEach((q, k) => q.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      if (motion) qs[i].animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    };
    $('[data-prev]', z).addEventListener('click', () => show(i - 1));
    $('[data-next]', z).addEventListener('click', () => show(i + 1));
    dots.forEach((d, n) => {
      d.addEventListener('click', () => show(n));
      d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(n); } });
    });
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    }, { passive: true });
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
