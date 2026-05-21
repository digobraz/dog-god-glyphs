import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';

type SymbolMeaning = { label: string; name: string; value: string };

const MEANINGS: Record<string, SymbolMeaning> = {
  MALE:           { label: 'Gender',          name: "Man Figure",      value: 'Male' },
  'L---LABRADOR': { label: 'Breed',           name: 'Hound',           value: 'Labrador' },
  DARK:           { label: 'Coat',            name: 'Crescent Moon',   value: 'Dark' },
  WATER:          { label: 'Element',         name: 'Wave',            value: 'Water' },
  LEO:            { label: 'Western Zodiac',  name: 'Lion',            value: 'Leo' },
  ROASTER:        { label: 'Chinese Zodiac',  name: 'Rooster',         value: 'Year of the Rooster' },
  SAVAGE:         { label: 'Trait I',         name: 'Fang',            value: 'Savage' },
  TANIER:         { label: 'Trait II',        name: 'Bowl',            value: 'Loyal' },
  MAN:            { label: 'Owner',           name: 'Figure',          value: 'Male' },
  M:              { label: 'Owner Initial',   name: 'Letter M',        value: 'Matej' },
  FOUNDED:        { label: 'Rank',            name: 'Ankh',            value: '#1 — Founder' },
  _1:             { label: 'Rank',            name: 'Numeral',         value: '#1 — Founder' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

export default function Heroglyph() {
  const navigate = useNavigate();
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>('');
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(SVG_URL)
      .then((r) => r.text())
      .then((text) => { if (!cancelled) setSvgMarkup(text); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!svgMarkup || !svgWrapRef.current) return;
    const root = svgWrapRef.current;
    const handlers: Array<{ el: Element; type: string; fn: (e: Event) => void }> = [];

    SYMBOL_IDS.forEach((id, idx) => {
      const el = root.querySelector(`[id="${CSS.escape(id)}"]`);
      if (!el) return;
      el.classList.add('hero-zone');
      (el as SVGElement).style.animationDelay = `${(idx * 0.28).toFixed(2)}s`;

      const click = (e: Event) => {
        e.stopPropagation();
        setActiveSymbol((cur) => (cur === id ? null : id));
      };
      el.addEventListener('click', click);
      handlers.push({ el, type: 'click', fn: click });
    });

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    };
  }, [svgMarkup]);

  // Tap outside resets
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.heroglyph-svg-wrap') && !target.closest('.heroglyph-pill')) {
        setActiveSymbol(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Toggle is-active class on the matching symbol
  useEffect(() => {
    if (!svgWrapRef.current) return;
    const root = svgWrapRef.current;
    root.querySelectorAll('.hero-zone.is-active').forEach((el) => el.classList.remove('is-active'));
    if (activeSymbol) {
      const el = root.querySelector(`[id="${CSS.escape(activeSymbol)}"]`);
      if (el) el.classList.add('is-active');
    }
  }, [activeSymbol, svgMarkup]);

  const meaning = activeSymbol ? MEANINGS[activeSymbol] : null;

  const HeroglyphCard = (
    <div
      className="w-full rounded-2xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
      }}
    >
      <div
        ref={svgWrapRef}
        className={`heroglyph-svg-wrap ${activeSymbol ? 'has-active' : ''} ${isMobile ? 'is-vertical' : ''}`}
        style={{
          width: '100%',
          padding: isMobile ? '24px 12px' : '28px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '56vh' : 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />

      {/* Pill tooltip overlay */}
      {meaning && (
        <div
          className="heroglyph-pill"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 16,
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)))',
            color: '#1a1208',
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.04em',
            borderRadius: 999,
            boxShadow: '0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
            border: '1px solid rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 32px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            animation: 'pill-pop 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5a3a0a' }}>
            {meaning.label}:
          </span>
          <span>{meaning.name}</span>
          <span style={{ opacity: 0.7 }}>({meaning.value})</span>
        </div>
      )}

      {!svgMarkup && (
        <div style={{ padding: 60, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>Loading…</div>
      )}
    </div>
  );

  const TextBlock = (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: isMobile ? 'clamp(1.6rem, 7vw, 2.1rem)' : 'clamp(2rem, 3.6vw, 2.8rem)',
          letterSpacing: '0.1em',
          color: 'hsl(var(--gold))',
          margin: 0,
          lineHeight: 1.05,
        }}
      >
        THE HEROGLYPH
      </h1>

      <div style={{ width: 64, height: 1, background: 'hsl(var(--gold) / 0.45)' }} />

      <p
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: isMobile ? '1rem' : '1.1rem',
          letterSpacing: '0.04em',
          color: '#F5E8C8',
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 540,
          textShadow: '0 2px 12px rgba(0,0,0,0.65)',
        }}
      >
        A symbol for those unashamed to love their dog.
        <br />
        Your ticket into a worldwide movement that worships them back.
      </p>
    </div>
  );

  const CtaBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
      <Button
        onClick={() => navigate('/heroglyph/name')}
        className="rounded-xl gap-2 h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform"
        style={{
          fontFamily: "'Cinzel', serif",
          background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))',
          color: '#000',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)',
          letterSpacing: '0.18em',
          padding: '0 28px',
          width: isMobile ? '100%' : 'auto',
          minWidth: isMobile ? 'auto' : 280,
        }}
      >
        Claim Your Heroglyph →
      </Button>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', color: 'hsl(var(--gold) / 0.75)', textTransform: 'uppercase', fontFamily: "'Cinzel', serif", textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
        $11 · Permanent Symbol · 1 of 1
      </div>
    </div>
  );

  return (
    <div className="dark-bg flex flex-col min-h-[100dvh]">
      <style>{`
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: auto;
          display: block;
          max-height: ${isMobile ? '70vh' : '320px'};
        }
        .heroglyph-svg-wrap.is-vertical svg {
          transform: rotate(90deg);
          transform-origin: center center;
          max-height: none;
          width: auto;
          height: 70vh;
        }
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]) {
          fill: #1a0a05 !important;
          stroke: #1a0a05 !important;
        }
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          fill: #1a0a05 !important;
          stroke: #1a0a05 !important;
          transition: opacity 0.22s ease, filter 0.22s ease, transform 0.22s ease;
          transform-box: fill-box;
          transform-origin: center;
          animation: hero-pulse 2.8s ease-in-out infinite;
        }
        .heroglyph-svg-wrap.has-active .hero-zone {
          opacity: 0.35;
          animation: none;
        }
        .heroglyph-svg-wrap.has-active .hero-zone.is-active {
          opacity: 1;
          fill: #FFF6E0 !important;
          stroke: #FFF6E0 !important;
          filter: drop-shadow(0 0 12px rgba(255,255,255,0.85)) drop-shadow(0 0 22px rgba(255,220,140,0.6));
          animation: hero-tap 0.4s ease-out;
        }
        @keyframes hero-pulse {
          0%, 100% { opacity: 0.78; filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
          50%      { opacity: 1;    filter: drop-shadow(0 0 6px rgba(255,255,255,0.35)); }
        }
        @keyframes hero-tap {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes pill-pop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.92); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>

      {/* Top logo (matches /heroglyph/name) */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-2 md:pt-5">
        <img src={dogyptLogo} alt="DOGYPT" className="h-8 md:h-12 object-contain" />
      </div>

      {/* Centered content stack */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8 md:justify-center md:pb-12">
        <div
          className="w-full flex flex-col items-center"
          style={{
            maxWidth: isMobile ? '100%' : 720,
            gap: isMobile ? 20 : 24,
          }}
        >
          {isMobile ? (
            <>
              {TextBlock}
              {HeroglyphCard}
              {CtaBlock}
            </>
          ) : (
            <>
              {HeroglyphCard}
              {TextBlock}
              {CtaBlock}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
