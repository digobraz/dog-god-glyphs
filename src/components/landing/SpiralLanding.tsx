import { useEffect, useRef, useState } from 'react';
import './SpiralLanding.css';

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd0TkuULnE1R-dbYO0_yfnOhxMQBjOmPZmuRaA-9cjDIMMYnA/formResponse';
const ENTRY_ID = 'entry.2054138710';
const TOTAL_PHOTOS = 31;

const SPIRAL_K = 42;
const SPIRAL_SP = 0.15;
const MIN_SCALE = 0.28;
const MAX_SCALE = 1.0;
const FRAME_MS = 1000 / 30;

export function SpiralLanding() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<'idle' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const N_CARDS = isMobile ? 18 : 26;
    const BASE_W = isMobile ? 168 : 200;
    const BASE_H = isMobile ? 130 : 154;

    type Card = { el: HTMLDivElement; thetaBase: number; rotDeg: number };
    let cards: Card[] = [];
    let raf = 0;
    let start = 0;
    let lastDraw = 0;
    let resizeT: number | undefined;

    const build = () => {
      field.innerHTML = '';
      cards = [];
      const diag = Math.sqrt((window.innerWidth / 2) ** 2 + (window.innerHeight / 2) ** 2);
      for (let i = 0; i < N_CARDS; i++) {
        const thetaBase = (i / N_CARDS) * (diag * 1.1 / SPIRAL_K);
        const photoIdx = (i % TOTAL_PHOTOS) + 1;
        const rotDeg = Math.random() * 32 - 16;

        const card = document.createElement('div');
        card.className = 'spiral-card';
        card.style.width = BASE_W + 'px';
        card.style.height = BASE_H + 'px';

        const img = document.createElement('img');
        img.src = `/spiral/img/${photoIdx}.webp`;
        img.alt = '';
        img.decoding = 'async';
        img.draggable = false;
        if (i < 4) {
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high';
        } else {
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'low';
          img.loading = 'lazy';
        }

        card.appendChild(img);
        field.appendChild(card);
        cards.push({ el: card, thetaBase, rotDeg });
      }
    };

    const draw = (ts: number) => {
      if (ts - lastDraw < FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = ts;
      if (!start) start = ts;
      const t = (ts - start) / 1000;

      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;
      const TMAX = Math.sqrt(cx * cx + cy * cy) * 1.1 / SPIRAL_K;

      for (let i = 0; i < cards.length; i++) {
        const { el, thetaBase, rotDeg } = cards[i];
        const theta = (thetaBase + SPIRAL_SP * t) % TMAX;
        const progress = theta / TMAX;
        const r = SPIRAL_K * theta;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
        const tx = (x - BASE_W / 2).toFixed(1);
        const ty = (y - BASE_H / 2).toFixed(1);
        el.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${scale.toFixed(3)}) rotate(${rotDeg.toFixed(1)}deg)`;
      }

      raf = requestAnimationFrame(draw);
    };

    const drawStaticFrame = () => {
      lastDraw = 0;
      start = performance.now();
      const ts = start;
      lastDraw = ts - FRAME_MS;
      draw(ts);
      cancelAnimationFrame(raf);
    };

    const startAnim = () => {
      cancelAnimationFrame(raf);
      lastDraw = 0;
      raf = requestAnimationFrame(draw);
    };

    const stopAnim = () => {
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stopAnim();
      else startAnim();
    };

    const onResize = () => {
      stopAnim();
      build();
      if (reducedMotion) drawStaticFrame();
      else startAnim();
    };

    const debouncedResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(onResize, 250);
    };

    build();
    if (reducedMotion) {
      drawStaticFrame();
    } else {
      startAnim();
      document.addEventListener('visibilitychange', onVisibility);
    }
    window.addEventListener('resize', debouncedResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', debouncedResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(resizeT);
      field.innerHTML = '';
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ [ENTRY_ID]: trimmed }),
      });
      setFormState('success');
    } catch {
      setFormState('error');
    }
  };

  return (
    <section className="dogypt-spiral-root">
      <div className="cards-field" ref={fieldRef} />
      <div className="cards-fade" />
      <div className="vignette" />
      <div className="hero-content">
        <img
          className="hero-logo"
          src="/spiral/img/dogypt-logo-icon.png"
          alt="DOGYPT"
          width={132}
          height={132}
          {...({ fetchpriority: 'high' } as Record<string, string>)}
        />
        <h1 className="hero-h1 hero-shine">In Dog<br />We Trust</h1>
        <p className="hero-sub">A new era for dogs and humans is about to begin.</p>
        {formState !== 'success' ? (
          <form onSubmit={onSubmit} noValidate>
            <input
              id="dogypt-email"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Your email"
            />
            <button type="submit" className="btn-gold">I'm In</button>
            {formState === 'error' && (
              <p className="form-msg error">Something went wrong. Try again.</p>
            )}
          </form>
        ) : (
          <p className="success">You're in. We'll be in touch.</p>
        )}
      </div>
    </section>
  );
}
