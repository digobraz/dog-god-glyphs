import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoPositions, photos } from './godsData';

const W  = 360;
const H  = 360;
const GX = W + 64;
const GY = H + 64;

function getPos(filename: string): string {
  const key = decodeURIComponent(filename).normalize('NFC');
  return photoPositions[key] || '50% 50%';
}

function photoFor(col: number, row: number) {
  const c = col + 500;
  const r = row + 500;
  let h = (c * 374761393 + r * 1013904223 + (c ^ r) * 2246822519) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return photos[h % photos.length];
}

export function GodsGrid() {
  const navigate = useNavigate();
  const appRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const app = appRef.current;
    const canvas = canvasRef.current;
    if (!app || !canvas) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let ox = vw / 2 - W / 2;
    let oy = vh / 2 - H / 2;
    let dragging = false;
    let startX = 0, startY = 0;
    let prevX = 0, prevY = 0, prevT = 0;
    let vx = 0, vy = 0;
    let raf: number | null = null;
    const cells = new Map<string, HTMLElement>();

    function makeHeroCard() {
      const el = document.createElement('div');
      el.className = 'center-hero';
      el.style.left = (W / 2) + 'px';
      el.style.top  = (H / 2) + 'px';
      el.style.transform = 'translate(-50%, -50%)';
      el.innerHTML = `
        <img src="/images/dogypt-gold-logo.png" alt="DOGYPT" class="hero-logo-icon">
        <p class="hero-tagline">The place where <span class="gold">Dog is God.</span></p>
        <button class="join-btn" data-join>Create Your Heroglyph</button>
        <span class="hero-count">${photos.length} gods here</span>
      `;
      const btn = el.querySelector('[data-join]');
      btn?.addEventListener('click', () => navigate('/name'));
      return el;
    }

    function makeCard(col: number, row: number) {
      if (col === 0 && row === 0) return makeHeroCard();
      const p = photoFor(col, row);
      const el = document.createElement('article');
      el.className = 'dog-card';
      el.style.left = (col * GX) + 'px';
      el.style.top  = (row * GY) + 'px';
      const pos = getPos(p.f);
      el.innerHTML = `
        <div class="card-img" style="background-image:url('/dogs/${p.f}');background-position:${pos}"></div>
        <div class="card-label">${p.n}</div>
      `;
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
      if (target.closest('.center-hero') || target.closest('.center-btn') || target.closest('.main-nav') || target.closest('.subscribe-btn')) return;
      dragging = true;
      startX = e.clientX - ox;
      startY = e.clientY - oy;
      prevX = e.clientX; prevY = e.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
      document.body.style.cursor = 'grabbing';
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
    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      app!.classList.remove('is-dragging');
      document.body.style.cursor = 'default';
      raf = requestAnimationFrame(inertia);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const t = e.touches[0];
      dragging = true;
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
    const onTouchEnd = () => {
      dragging = false;
      app!.classList.remove('is-dragging');
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
  }, [navigate]);

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

        .dog-card {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 12px;
          overflow: hidden;
          cursor: grab;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .is-dragging .dog-card { cursor: grabbing; transition: none; }
        .dog-card:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 5; }
        .is-dragging .dog-card:hover { transform: none; box-shadow: none; }

        .card-img {
          width: 100%; height: 100%;
          background-size: cover;
          background-color: #1a1a1a;
        }
        .card-label {
          position: absolute;
          bottom: 8px; left: 8px;
          height: 28px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex; align-items: center;
          backdrop-filter: blur(6px);
        }

        .center-hero {
          position: absolute;
          z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          text-align: center;
          pointer-events: auto;
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
          white-space: nowrap;
        }
        .hero-tagline .gold {
          display: inline;
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
          height: 54px;
          padding: 0 52px;
          border-radius: 999px;
          background: linear-gradient(180deg, #EDD06A 0%, #C49B42 55%, #9A7228 100%);
          color: #1a0d00;
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-size: 0.82rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 0 40px rgba(196,155,66,0.4), 0 4px 20px rgba(0,0,0,0.5),
                      inset 0 1px 0 rgba(255,255,255,0.25);
          transition: box-shadow 250ms, transform 150ms;
        }
        .join-btn:hover {
          box-shadow: 0 0 70px rgba(196,155,66,0.65), 0 6px 28px rgba(0,0,0,0.5),
                      inset 0 1px 0 rgba(255,255,255,0.25);
          transform: scale(1.04);
        }
        .hero-count {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.14em;
          font-family: 'Cinzel', serif;
          text-transform: uppercase;
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
          <button className="subscribe-btn" onClick={() => navigate('/name')}>
            Join
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M8 2V14M2 8H14"/>
            </svg>
          </button>
        </div>

        <button className="center-btn" id="gods-center-btn">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M8 2V8M8 14V8M8 8H2M8 8H14"/>
          </svg>
          Center
        </button>

        <div ref={appRef} role="application" style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
          <div ref={canvasRef} id="gods-canvas" />
        </div>
      </div>
    </>
  );
}
