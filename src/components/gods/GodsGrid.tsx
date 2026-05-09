import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { photoPositions, photos } from './godsData';

const GRID_DOGS_URL = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/get-grid-dogs';

interface RealDog {
  id: string;
  dog_name: string | null;
  pack_number: number | null;
  cloudinary_main_url: string | null;
  patron_svg: string | null;
  country: string | null;
}

function generatePackPositions(count: number): Array<{col: number, row: number}> {
  const skip = new Set(['0,0', '0,-1']);
  const result: Array<{col: number, row: number}> = [];
  let col = 0, row = 0;
  let dx = 1, dy = 0;
  let steps = 1, stepCount = 0, turns = 0;
  while (result.length < count) {
    if (!skip.has(`${col},${row}`)) result.push({col, row});
    col += dx; row += dy;
    stepCount++;
    if (stepCount === steps) {
      stepCount = 0;
      [dx, dy] = [-dy, dx];
      turns++;
      if (turns % 2 === 0) steps++;
    }
  }
  return result;
}

const W  = 360;
const H  = 360;
const GX = W + 64;
const GY = H + 64;

const REVEAL_COL = 3;
const REVEAL_ROW = 1;

const REVEAL_SYMBOL = '/images/dogypt-logo-black-i.png';

const FLAG_NAMES: Record<string, string> = {
  sk: 'Slovensko',
  cz: 'Česko',
  pl: 'Poľsko',
  hu: 'Maďarsko',
  at: 'Rakúsko',
  de: 'Nemecko',
  us: 'USA',
  gb: 'Veľká Británia',
  fr: 'Francúzsko',
  it: 'Taliansko',
};

function countryToISO2(country?: string | null): string {
  if (!country) return 'sk';
  const MAP: Record<string, string> = {
    'slovakia':'sk','slovensko':'sk','svk':'sk','sk':'sk',
    'czechia':'cz','czech republic':'cz','česko':'cz','cze':'cz','cz':'cz',
    'hungary':'hu','maďarsko':'hu','hun':'hu',
    'austria':'at','rakúsko':'at','aut':'at',
    'poland':'pl','poľsko':'pl','pol':'pl',
    'germany':'de','nemecko':'de','deu':'de',
    'france':'fr','francúzsko':'fr','fra':'fr',
    'italy':'it','taliansko':'it','ita':'it',
    'spain':'es','španielsko':'es','esp':'es',
    'united states':'us','usa':'us',
    'united kingdom':'gb','uk':'gb','gbr':'gb',
    'ireland':'ie','irl':'ie',
    'netherlands':'nl','nld':'nl',
    'switzerland':'ch','che':'ch',
    'sweden':'se','swe':'se',
    'norway':'no','nor':'no',
    'denmark':'dk','dnk':'dk',
    'finland':'fi','fin':'fi',
    'australia':'au','aus':'au',
    'canada':'ca','can':'ca',
    'ukraine':'ua','ukr':'ua',
    'romania':'ro','rou':'ro',
    'croatia':'hr','hrv':'hr',
  };
  return MAP[country.trim().toLowerCase()] || 'sk';
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getPos(filename: string): string {
  const key = decodeURIComponent(filename).normalize('NFC');
  return photoPositions[key] || '50% 50%';
}

function cellHash(col: number, row: number): number {
  const c = col + 500;
  const r = row + 500;
  let h = (c * 374761393 + r * 1013904223 + (c ^ r) * 2246822519) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function photoFor(col: number, row: number) {
  return photos[cellHash(col, row) % photos.length];
}


export function GodsGrid() {
  const navigate = useNavigate();
  const appRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [revealStep, setRevealStep] = useState<0|1|2|3|4>(0);
  const [dogsReady, setDogsReady] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const realDogMapRef = useRef<Map<string, RealDog>>(new Map());
  const navigateToRef = useRef<((n: number) => void) | null>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  const revealData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('reveal');
    const isDemo = mode === 'demo';
    const active = mode === 'true' || isDemo;
    const patronFile = params.get('patronSvg') || '';
    return {
      active,
      dogName: isDemo ? 'Toby' : (params.get('dogName') || 'Your Dog'),
      photoUrl: isDemo ? '/dogs/toby.jpg' : (params.get('photoUrl') || ''),
      packNumber: isDemo ? String(photos.length) : (params.get('packNumber') || String(photos.length + 1)),
      revealSymbol: patronFile ? `/patrons/${patronFile}` : REVEAL_SYMBOL,
    };
  }, []);

  // Load real dogs for the grid
  useEffect(() => {
    fetch(GRID_DOGS_URL)
      .then(r => r.ok ? r.json() : [])
      .then((dogs: RealDog[]) => {
        if (dogs.length > 0) {
          const maxN = dogs.reduce((m, d) => Math.max(m, d.pack_number ?? 0), 0);
          const positions = generatePackPositions(maxN + 5);
          const map = new Map<string, RealDog>();
          for (const dog of dogs) {
            const n = dog.pack_number;
            if (n && n >= 1 && n - 1 < positions.length) {
              map.set(`${positions[n - 1].col},${positions[n - 1].row}`, dog);
            }
          }
          realDogMapRef.current = map;
        }
        setDogsReady(true);
      })
      .catch(() => setDogsReady(true));
  }, []);

  // Reveal sequence timing
  // step 1: black screen + symbol burns in
  // step 2: only dog photo visible on black (symbol fades, grid still hidden)
  // step 3: grid appears around dog (+2s after photo)
  // step 4: done, overlay removed
  useEffect(() => {
    if (!revealData.active) return;
    setRevealStep(1);
    const t1 = setTimeout(() => setRevealStep(2), 2000);
    const t2 = setTimeout(() => setRevealStep(3), 4200);
    const t3 = setTimeout(() => {
      setRevealStep(4);
      window.history.replaceState(null, '', '/grid');
    }, 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [revealData.active]);

  useEffect(() => {
    if (filterOpen) filterInputRef.current?.focus();
  }, [filterOpen]);

  useEffect(() => {
    if (revealStep === 2) {
      const card = document.querySelector('.reveal-card');
      card?.classList.add('reveal-active');
    }
  }, [revealStep]);

  useEffect(() => {
    if (!dogsReady) return;
    const app = appRef.current;
    const canvas = canvasRef.current;
    if (!app || !canvas) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let ox = revealData.active
      ? vw / 2 - REVEAL_COL * GX - W / 2
      : vw / 2 - W / 2;
    let oy = revealData.active
      ? vh / 2 - REVEAL_ROW * GY - H / 2
      : vh / 2 - H / 2;
    let dragging = false;
    let startX = 0, startY = 0;
    let prevX = 0, prevY = 0, prevT = 0;
    let vx = 0, vy = 0;
    let raf: number | null = null;
    const cells = new Map<string, HTMLElement>();

    // Click/tap tracking
    let downX = 0, downY = 0;
    let touchDownX = 0, touchDownY = 0;
    let openCardEl: HTMLElement | null = null;

    function toggleCard(card: HTMLElement) {
      const opening = !card.classList.contains('is-open');
      if (openCardEl && openCardEl !== card) openCardEl.classList.remove('is-open');
      if (opening) {
        card.classList.add('is-open');
        openCardEl = card;
      } else {
        card.classList.remove('is-open');
        openCardEl = null;
      }
    }

    function makeHeroCard() {
      const el = document.createElement('div');
      el.className = 'center-hero';
      el.style.left = (W / 2) + 'px';
      el.style.top  = (H / 2) + 'px';
      el.style.transform = 'translate(-50%, -50%)';
      el.innerHTML = `
        <img src="/images/dogypt-gold-logo.png" alt="DOGYPT" class="hero-logo-icon">
        <p class="hero-tagline">The place where<br><span class="gold">Dog is God.</span></p>
        <button class="join-btn" data-join>Become Dogyptian</button>
        <span class="hero-count"><span class="hero-count-num">${photos.length}</span><span class="hero-count-sep"> / </span><span class="hero-count-total">1 000 000</span> DOGS</span>
      `;
      const btn = el.querySelector('[data-join]');
      btn?.addEventListener('click', () => navigate('/heroglyph/name'));
      return el;
    }

    function makeHektorCard() {
      const el = document.createElement('article');
      el.className = 'dog-card hektor-card';
      el.style.left = '0px';
      el.style.top  = (-1 * GY) + 'px';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('/images/hektor-grid.jpg');background-position:50% 35%"></div>
        <div class="card-open-overlay">
          <div class="card-open-rank">#1</div>
          <div class="card-open-name">HEKTHOR</div>
        </div>
        <button class="card-info" aria-label="Info">i</button>
        <img class="card-flag" src="https://flagcdn.com/w40/sk.png" alt="Slovensko" title="Slovensko" loading="lazy" draggable="false">
        <div class="hektor-heroglyph-wrap">
          <img class="hektor-heroglyph" src="/images/hekthor-heroglyph.png" alt="Hektor heroglyph" draggable="false">
        </div>
        <div class="card-name-block">
          <div class="card-rank card-rank-gold">#1</div>
          <div class="card-label hektor-label">HEKTHOR</div>
        </div>
      `;
      el.querySelector('.card-info')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard(el);
      });
      return el;
    }

    function makeRevealCard() {
      const el = document.createElement('article');
      el.className = 'dog-card reveal-card';
      el.style.left = (REVEAL_COL * GX) + 'px';
      el.style.top  = (REVEAL_ROW * GY) + 'px';
      const safeName = (revealData.dogName || 'DOGYPTIAN')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const inner = revealData.photoUrl
        ? `<div class="reveal-card-inner" style="background-image:url('${revealData.photoUrl}')"></div>`
        : `<div class="reveal-card-inner reveal-card-fallback"><span class="cartouche">${safeName}</span></div>`;
      el.innerHTML = `
        ${inner}
        <div class="card-label">${safeName} · #${revealData.packNumber}</div>
      `;
      if (revealData.photoUrl) {
        const probe = new Image();
        probe.src = revealData.photoUrl;
        probe.onerror = () => {
          const node = el.querySelector('.reveal-card-inner') as HTMLElement | null;
          if (!node) return;
          node.style.backgroundImage = '';
          node.classList.add('reveal-card-fallback');
          node.innerHTML = `<span class="cartouche">${safeName}</span>`;
        };
      }
      return el;
    }

    function makeRealDogCard(dog: RealDog, col: number, row: number) {
      const cc = countryToISO2(dog.country);
      const flagName = FLAG_NAMES[cc] || cc;
      const safeName = esc((dog.dog_name || 'DOGYPTIAN').toUpperCase());
      const packNum = dog.pack_number ?? '?';

      const el = document.createElement('article');
      el.className = 'dog-card';
      el.style.left = (col * GX) + 'px';
      el.style.top  = (row * GY) + 'px';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('${dog.cloudinary_main_url || ''}');background-position:50% 30%"></div>
        <div class="card-open-overlay">
          <div class="card-open-rank">#${packNum}</div>
          <div class="card-open-name">${safeName}</div>
        </div>
        <button class="card-info" aria-label="Info">i</button>
        <img class="card-flag" src="https://flagcdn.com/w40/${cc}.png" alt="${flagName}" title="${flagName}" loading="lazy" draggable="false">
        ${dog.patron_svg ? `
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="/patrons/${esc(dog.patron_svg)}" alt="${safeName} heroglyph" draggable="false">
        </div>` : ''}
        <div class="card-name-block">
          <div class="card-rank">#${packNum}</div>
          <div class="card-label">${safeName}</div>
        </div>
      `;
      el.querySelector('.card-info')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard(el);
      });
      return el;
    }

    function makeCard(col: number, row: number) {
      if (col === 0 && row === 0) return makeHeroCard();
      if (col === 0 && row === -1) return makeHektorCard();
      if (revealData.active && col === REVEAL_COL && row === REVEAL_ROW) return makeRevealCard();

      const realDog = realDogMapRef.current.get(`${col},${row}`);
      if (realDog) return makeRealDogCard(realDog, col, row);

      const hash = cellHash(col, row);
      const p = photos[hash % photos.length];
      const packNum = (hash % 950) + 50;
      const cc = 'sk';
      const flagName = FLAG_NAMES[cc] || cc;
      const safeName = esc(p.n.toUpperCase());
      const pos = getPos(p.f);

      const el = document.createElement('article');
      el.className = 'dog-card';
      el.style.left = (col * GX) + 'px';
      el.style.top  = (row * GY) + 'px';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('/dogs/${p.f}');background-position:${pos}"></div>
        <div class="card-open-overlay">
          <div class="card-open-rank">#${packNum}</div>
          <div class="card-open-name">${safeName}</div>
        </div>
        <button class="card-info" aria-label="Info">i</button>
        <img class="card-flag" src="https://flagcdn.com/w40/${cc}.png" alt="${flagName}" title="${flagName}" loading="lazy" draggable="false">
        <div class="card-name-block">
          <div class="card-rank">#${packNum}</div>
          <div class="card-label">${safeName}</div>
        </div>
      `;
      el.querySelector('.card-info')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard(el);
      });
      return el;
    }

    function updateTransform() {
      canvas!.style.transform = `translate(${ox}px,${oy}px)`;
    }

    function updateCells() {
      const c0 = Math.floor(-ox / GX) - 2;
      const c1 = c0 + Math.ceil(vw / GX) + 4;
      const r0 = Math.floor(-oy / GY) - 2;
      const r1 = r0 + Math.ceil(vh / GY) + 4;

      for (const [key, el] of cells) {
        const [c, r] = key.split(',').map(Number);
        if (c < c0 || c > c1 || r < r0 || r > r1) {
          el.remove();
          cells.delete(key);
        }
      }

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const key = `${c},${r}`;
          if (cells.has(key)) continue;
          const el = makeCard(c, r);
          if (!el) continue;
          canvas!.appendChild(el);
          cells.set(key, el as HTMLElement);
        }
      }
    }

    function render() {
      updateTransform();
      updateCells();
    }

    function inertia() {
      vx *= 0.95;
      vy *= 0.95;
      if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
      ox += vx;
      oy += vy;
      render();
      raf = requestAnimationFrame(inertia);
    }

    const onMouseDown = (e: MouseEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const target = e.target as HTMLElement;
      // Close open card if clicking outside it
      if (openCardEl && !openCardEl.contains(target)) {
        openCardEl.classList.remove('is-open');
        openCardEl = null;
      }
      if (target.closest('.center-hero') || target.closest('.center-btn') || target.closest('.main-nav') || target.closest('.subscribe-btn') || target.closest('.filter-btn') || target.closest('.filter-panel')) return;
      dragging = true;
      downX = e.clientX;
      downY = e.clientY;
      startX = e.clientX - ox;
      startY = e.clientY - oy;
      prevX = e.clientX; prevY = e.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
      document.body.style.cursor = 'pointer';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - prevT || 1;
      vx = (e.clientX - prevX) / dt * 16;
      vy = (e.clientY - prevY) / dt * 16;
      prevX = e.clientX; prevY = e.clientY; prevT = now;
      ox = e.clientX - startX;
      oy = e.clientY - startY;
      render();
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging) return;
      dragging = false;
      app!.classList.remove('is-dragging');
      document.body.style.cursor = 'default';

      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist < 6) {
        // Click: find dog card (not hero widget, not card-info which has its own handler)
        const target = e.target as HTMLElement;
        if (!target.closest('.card-info')) {
          const card = target.closest('.dog-card:not(.center-hero)') as HTMLElement | null;
          if (card) { toggleCard(card); return; }
        }
        return; // don't start inertia on click
      }
      raf = requestAnimationFrame(inertia);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const t = e.touches[0];
      dragging = true;
      touchDownX = t.clientX;
      touchDownY = t.clientY;
      startX = t.clientX - ox;
      startY = t.clientY - oy;
      prevX = t.clientX; prevY = t.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const t = e.touches[0];
      const now = performance.now();
      const dt = now - prevT || 1;
      vx = (t.clientX - prevX) / dt * 16;
      vy = (t.clientY - prevY) / dt * 16;
      prevX = t.clientX; prevY = t.clientY; prevT = now;
      ox = t.clientX - startX;
      oy = t.clientY - startY;
      render();
    };
    const onTouchEnd = (e: TouchEvent) => {
      dragging = false;
      app!.classList.remove('is-dragging');

      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - touchDownX, t.clientY - touchDownY);
        if (dist < 12) {
          // Tap: close open card if tapping outside, or toggle tapped card
          if (openCardEl) {
            const el = document.elementFromPoint(t.clientX, t.clientY);
            if (el && openCardEl.contains(el)) {
              // tap inside open card → close it
              openCardEl.classList.remove('is-open');
              openCardEl = null;
              return;
            }
            openCardEl.classList.remove('is-open');
            openCardEl = null;
          }
          const el = document.elementFromPoint(t.clientX, t.clientY);
          const card = (el as HTMLElement | null)?.closest?.('.dog-card:not(.center-hero)') as HTMLElement | null;
          if (card) { toggleCard(card); return; }
          return;
        }
      }
      raf = requestAnimationFrame(inertia);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let dx = e.deltaX, dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 24; dy *= 24; }
      if (e.deltaMode === 2) { dx *= vh; dy *= vh; }
      ox -= dx;
      oy -= dy;
      render();
    };

    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      render();
    };

    const onCenter = () => {
      if (raf) cancelAnimationFrame(raf);
      const tx = vw / 2 - W / 2;
      const ty = vh / 2 - H / 2;
      const sx = ox, sy = oy;
      const t0 = performance.now();
      const dur = 600;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = ease(p);
        ox = sx + (tx - sx) * e;
        oy = sy + (ty - sy) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    };

    app.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    app.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    app.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    function navigateTo(n: number) {
      if (n < 1) return;
      if (raf) cancelAnimationFrame(raf);
      const positions = generatePackPositions(n + 5);
      if (n - 1 >= positions.length) return;
      const { col, row } = positions[n - 1];
      const tx = vw / 2 - col * GX - W / 2;
      const ty = vh / 2 - row * GY - H / 2;
      const sx = ox, sy = oy;
      const t0 = performance.now();
      const dur = 800;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = ease(p);
        ox = sx + (tx - sx) * e;
        oy = sy + (ty - sy) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    navigateToRef.current = navigateTo;

    const centerBtn = document.getElementById('gods-center-btn');
    centerBtn?.addEventListener('click', onCenter);

    render();

    return () => {
      app.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      app.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      app.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      centerBtn?.removeEventListener('click', onCenter);
      if (raf) cancelAnimationFrame(raf);
      cells.forEach(el => el.remove());
      cells.clear();
    };
  }, [navigate, dogsReady]);

  return (
    <>
      <style>{`
        body { overflow: hidden; }

        .gods-root {
          position: fixed;
          inset: 0;
          background-color: #050505;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: -0.02em;
          user-select: none;
          overflow: hidden;
        }
        .gods-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/images/bg-dark.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(3px);
          z-index: 0;
          pointer-events: none;
        }
        #gods-canvas { z-index: 1; }

        .nav-left {
          position: fixed;
          top: 12px;
          left: 20px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .main-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(163,163,163,0.8);
          backdrop-filter: blur(12px);
          padding: 6px 16px;
          border-radius: 999px;
        }
        .main-nav a, .main-nav button {
          font-weight: 500;
          color: white;
          text-decoration: none;
          font-size: 0.9rem;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: -0.02em;
          padding: 0;
        }
        .main-nav a:hover, .main-nav button:hover { opacity: 0.8; }

        .info-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(8,8,8,0.96);
          backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }
        .info-overlay.open { opacity: 1; pointer-events: all; }
        .info-close {
          position: absolute;
          top: 20px; right: 20px;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          cursor: pointer;
          color: white;
          font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: background 150ms;
        }
        .info-close:hover { background: rgba(255,255,255,0.2); }
        .info-content {
          max-width: 680px;
          width: 90%;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .info-content h2 {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .info-content p {
          font-size: 1rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.55);
          max-width: 520px;
        }

        .nav-right {
          position: fixed;
          top: 12px; right: 20px;
          z-index: 50;
        }
        .subscribe-btn {
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(163,163,163,0.8);
          backdrop-filter: blur(12px);
          color: white;
          font-weight: 500;
          display: flex; align-items: center; gap: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-family: inherit;
          letter-spacing: -0.02em;
        }
        .subscribe-btn:hover { opacity: 0.85; }

        .center-btn {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(163,163,163,0.8);
          backdrop-filter: blur(12px);
          color: white;
          display: flex; align-items: center; gap: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          font-size: 0.875rem;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .center-btn:hover { opacity: 0.85; }

        #gods-canvas {
          position: absolute;
          top: 0; left: 0;
          will-change: transform;
        }

        /* ── Dog card base ── */
        .dog-card {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .is-dragging .dog-card { cursor: pointer; transition: none; }

        /* Hover: scale + gradient darkening (suppressed on open card & during drag) */
        .dog-card:not(.is-open):hover {
          transform: scale(1.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          z-index: 5;
        }
        .is-dragging .dog-card:hover { transform: none; box-shadow: none; }

        /* Overlay — appears on hover, uniform dark */
        .dog-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.62);
          opacity: 0;
          will-change: opacity;
          transition: opacity 220ms ease;
          pointer-events: none;
          z-index: 1;
        }
        .dog-card:not(.is-open):hover::after { opacity: 1; }
        .is-dragging .dog-card::after { opacity: 0 !important; }

        /* Elements that hide on hover (and on open) */
        .card-info, .card-flag, .card-name-block {
          will-change: opacity;
          transition: opacity 160ms ease;
        }
        .dog-card:not(.is-open):hover .card-info,
        .dog-card:not(.is-open):hover .card-flag,
        .dog-card:not(.is-open):hover .card-name-block { opacity: 0; }
        .is-dragging .dog-card .card-info,
        .is-dragging .dog-card .card-flag,
        .is-dragging .dog-card .card-name-block { opacity: 1 !important; }

        .card-img {
          width: 100%; height: 100%;
          background-size: cover;
          background-color: #1a1a1a;
        }

        /* Name block (default state, bottom-left) */
        .card-name-block {
          position: absolute;
          bottom: 8px; left: 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          z-index: 2;
        }
        .card-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          color: #C99A3F;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 6px rgba(0,0,0,0.9);
          line-height: 1;
        }
        .card-rank-gold { color: #C99A3F; }
        .card-label {
          height: 28px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: flex; align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }



        /* Click (open) overlay */
        .card-open-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.88);
          border-radius: inherit;
          z-index: 6;
          opacity: 0;
          pointer-events: none;
          will-change: opacity;
          transition: opacity 220ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          overflow: hidden;
        }
        .dog-card.is-open .card-open-overlay { opacity: 1; pointer-events: auto; }
        .dog-card.is-open { z-index: 8; }
        .dog-card.is-open .card-info,
        .dog-card.is-open .card-flag,
        .dog-card.is-open .card-name-block { opacity: 0; }

        .card-open-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #C99A3F;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .card-open-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.08em;
          text-align: center;
        }
        .card-open-msg {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.6);
          text-align: center;
          line-height: 1.55;
          max-width: 280px;
          font-style: italic;
          margin-top: 2px;
        }

        .card-flag {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.45);
          pointer-events: auto;
          cursor: help;
          background: #1a1a1a;
          z-index: 2;
        }
        .card-info {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(20,20,20,0.55);
          backdrop-filter: blur(6px);
          color: #fff;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-size: 13px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.25);
          cursor: pointer;
          padding: 0;
          transition: background 150ms ease, opacity 160ms ease;
          z-index: 2;
        }
        .card-info:hover { background: rgba(60,60,60,0.75); }

        /* ── Center hero ── */
        .center-hero {
          position: absolute;
          z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          text-align: center;
          pointer-events: auto;
          width: max-content;
        }
        .center-hero::before {
          content: '';
          position: absolute;
          inset: -200px -320px;
          background: radial-gradient(ellipse at center, rgba(8,8,8,0.92) 20%, transparent 68%);
          z-index: -1;
          pointer-events: none;
        }
        .hero-logo-icon {
          width: 120px; height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 0 32px rgba(196,155,66,0.5));
        }
        .hero-tagline {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.78rem, 1.4vw, 0.9rem);
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.2em;
          line-height: 1.8;
          text-transform: uppercase;
          text-align: center;
        }
        .hero-tagline .gold {
          display: inline;
          white-space: nowrap;
          font-weight: 700;
          background: linear-gradient(100deg, #A3782B 0%, #C49B42 30%, #FFF4C2 50%, #C49B42 70%, #A3782B 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shimmer 6s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(196,155,66,0.5));
        }
        @keyframes gold-shimmer {
          0%   { background-position: -100% 0; }
          60%  { background-position: 200% 0; }
          100% { background-position: 200% 0; }
        }
        .join-btn {
          margin-top: 6px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.30);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 0 40px rgba(230, 158, 26, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: transform 0.2s, box-shadow 0.22s, opacity 0.22s;
        }
        .join-btn:hover {
          transform: scale(1.04);
          box-shadow: 0 0 56px rgba(230, 158, 26, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        .join-btn:active { transform: scale(0.98); }
        .hero-count {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.16em;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          text-transform: uppercase;
          text-shadow: 0 0 14px rgba(0,0,0,0.85);
        }
        .hero-count-num {
          background: linear-gradient(180deg, #F4C75A 0%, #D8821F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }
        .hero-count-sep { color: rgba(255,255,255,0.55); margin: 0 4px; }
        .hero-count-total { color: rgba(255,255,255,0.7); }

        /* ── Hektor — fixed founder card, gold frame + glow ── */
        .hektor-card {
          box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28);
          animation: hektor-glow-loop 4.5s ease-in-out infinite;
          z-index: 4;
        }
        .hektor-card:not(.is-open):hover {
          transform: scale(1.06);
          box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 90px rgba(216,130,31,0.85),
            0 0 200px rgba(216,130,31,0.45);
        }
        @keyframes hektor-glow-loop {
          0%, 100% { box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28); }
          50%      { box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 80px rgba(216,130,31,0.75),
            0 0 170px rgba(216,130,31,0.38); }
        }
        .hektor-label {
          background: linear-gradient(180deg, rgba(196,155,66,0.92) 0%, rgba(154,114,40,0.92) 100%);
          color: #15080a;
          font-weight: 900;
          letter-spacing: 0.12em;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* ── Hektor heroglyph — hover only, centered ── */
        .hektor-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 1; }
        .is-dragging .hektor-heroglyph-wrap { opacity: 0 !important; }
        .hektor-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Real dog heroglyph — hover only, centered ── */
        .dog-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .dog-card:not(.is-open):hover .dog-heroglyph-wrap { opacity: 1; }
        .is-dragging .dog-heroglyph-wrap { opacity: 0 !important; }
        .dog-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Reveal card (in grid) ── */
        .reveal-card-inner {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: 50% 30%;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0ms;
        }
        .reveal-card.reveal-active .reveal-card-inner {
          opacity: 1;
          transition: opacity 800ms ease;
        }
        .reveal-card-fallback {
          background: linear-gradient(135deg, hsl(270 40% 18%), hsl(45 60% 30%));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .reveal-card-fallback .cartouche {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 6vw, 2rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: hsl(45 90% 60%);
        }

        /* Card gold glow on reveal */
        @keyframes card-entrance {
          0%   { box-shadow: none; transform: scale(0.9); }
          40%  { transform: scale(1.07);
                 box-shadow: 0 0 0 3px rgba(196,155,66,0.9),
                             0 0 100px rgba(196,155,66,0.95),
                             0 0 200px rgba(196,155,66,0.5); }
          70%  { transform: scale(0.98); }
          100% { transform: scale(1);
                 box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                             0 0 50px rgba(196,155,66,0.45),
                             0 0 100px rgba(196,155,66,0.2); }
        }
        @keyframes card-glow-loop {
          0%,100% { box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                                0 0 50px rgba(196,155,66,0.45),
                                0 0 100px rgba(196,155,66,0.2); }
          50%     { box-shadow: 0 0 0 3px rgba(196,155,66,0.75),
                                0 0 70px rgba(196,155,66,0.65),
                                0 0 140px rgba(196,155,66,0.3); }
        }
        .reveal-card.reveal-active {
          animation: card-entrance 1.4s cubic-bezier(0.34,1.3,0.64,1) forwards,
                     card-glow-loop 4s ease-in-out 1.4s infinite;
          z-index: 10;
        }

        /* ── Reveal sequence overlay ── */
        .rev-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080808;
          pointer-events: none;
          transition: none;
        }
        .rev-overlay.step-2 { background: transparent; }
        .rev-overlay.step-3 { background: transparent; }

        .rev-spotlight {
          position: absolute;
          top: 50%; left: 50%;
          width: 360px; height: 360px;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 9999px #080808;
          pointer-events: none;
          opacity: 0;
          border-radius: 12px;
        }
        .rev-overlay.step-2 .rev-spotlight {
          opacity: 1;
          transition: none;
        }
        .rev-overlay.step-3 .rev-spotlight {
          opacity: 0;
          transition: opacity 1400ms ease;
        }

        .rev-big-symbol {
          width: 420px;
          height: auto;
          object-fit: contain;
          pointer-events: none;
          animation: symbol-burn 2s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
          will-change: transform, opacity, filter;
        }
        .rev-overlay.step-2 .rev-big-symbol,
        .rev-overlay.step-3 .rev-big-symbol {
          opacity: 0 !important;
          transition: opacity 400ms ease;
          animation: none;
        }

        /* ── Filter / find dog by number ── */
        .filter-btn {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(12,12,12,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(201,154,63,0.35);
          color: rgba(201,154,63,0.9);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: border-color 150ms;
        }
        .filter-btn:hover { border-color: rgba(201,154,63,0.7); }
        .filter-btn.active { border-color: rgba(201,154,63,0.9); }

        .filter-panel {
          position: fixed;
          bottom: 68px;
          left: 50%;
          transform: translateX(-50%) translateY(6px);
          z-index: 51;
          background: rgba(12,12,12,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,154,63,0.45);
          border-radius: 12px;
          padding: 6px 14px 6px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease, transform 200ms ease;
          min-width: 130px;
        }
        .filter-panel.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        .filter-input {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          width: 80px;
          -moz-appearance: textfield;
        }
        .filter-input::-webkit-outer-spin-button,
        .filter-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .filter-input::placeholder { color: rgba(255,255,255,0.28); font-weight: 400; font-family: inherit; }

        @keyframes symbol-burn {
          0%   { opacity: 0;
                 filter: invert(1) brightness(0.2) blur(20px);
                 transform: scale(0.15); }
          12%  { opacity: 0.4;
                 filter: invert(1) brightness(0.6) blur(6px);
                 transform: scale(0.55); }
          28%  { opacity: 1;
                 filter: invert(1) brightness(4)
                   drop-shadow(0 0 50px #FFF)
                   drop-shadow(0 0 100px #FFD700)
                   drop-shadow(0 0 200px rgba(196,155,66,0.9));
                 transform: scale(1.25); }
          48%  { filter: invert(1) brightness(2.5)
                   drop-shadow(0 0 35px rgba(255,210,60,0.9))
                   drop-shadow(0 0 90px rgba(196,155,66,0.6));
                 transform: scale(0.9); }
          70%  { transform: scale(1.05); }
          85%  { transform: scale(0.98); }
          100% { opacity: 1;
                 filter: invert(1) brightness(1.4)
                   drop-shadow(0 0 25px rgba(196,155,66,0.8))
                   drop-shadow(0 0 70px rgba(196,155,66,0.4));
                 transform: scale(1); }
        }
      `}</style>

      <div className="gods-root">
        <div className="nav-left">
          <nav className="main-nav">
            <a href="/">DOGYPT</a>
            <button onClick={() => setInfoOpen(true)}>Info</button>
          </nav>
        </div>

        <div className={`info-overlay ${infoOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setInfoOpen(false); }}>
          <button className="info-close" onClick={() => setInfoOpen(false)}>✕</button>
          <div className="info-content">
            <h2>1,000,000 dogs.<br/>Will we make it?</h2>
            <p>DOGYPT is a movement for dog lovers. Every dog gets a unique Heroglyph — their permanent place in the global pack. We're collecting one million heroes. Be among the first.</p>
          </div>
        </div>

        <div className="nav-right">
          <button className="subscribe-btn" id="gods-center-btn">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M8 2V8M8 14V8M8 8H2M8 8H14"/>
            </svg>
            Center
          </button>
        </div>

        <button
          className={`filter-btn${filterOpen ? ' active' : ''}`}
          onClick={() => setFilterOpen(f => !f)}
          aria-label="Find dog by number"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6.5" cy="6.5" r="4"/>
            <path d="M10 10L14 14"/>
          </svg>
        </button>

        <div className={`filter-panel${filterOpen ? ' open' : ''}`}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(201,154,63,0.7)" strokeWidth="2" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4"/>
            <path d="M10 10L14 14"/>
          </svg>
          <input
            ref={filterInputRef}
            className="filter-input"
            type="number"
            min="1"
            placeholder="Dog #"
            value={filterValue}
            onChange={e => setFilterValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const n = parseInt(filterValue, 10);
                if (!isNaN(n) && n >= 1) {
                  navigateToRef.current?.(n);
                  setFilterOpen(false);
                  setFilterValue('');
                }
              }
              if (e.key === 'Escape') {
                setFilterOpen(false);
                setFilterValue('');
              }
            }}
          />
        </div>

        <div ref={appRef} role="application" style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
          <div ref={canvasRef} id="gods-canvas" />
        </div>

        {revealData.active && revealStep > 0 && revealStep < 4 && (
          <div className={`rev-overlay step-${revealStep}`}>
            <div className="rev-spotlight" />
            <img className="rev-big-symbol" src={revealData.revealSymbol} alt={revealData.dogName} />
          </div>
        )}
      </div>
    </>
  );
}
