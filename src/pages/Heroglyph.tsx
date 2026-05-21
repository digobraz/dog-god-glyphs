import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageNav } from '@/components/PageNav';

type SymbolMeaning = { title: string; value: string };

const MEANINGS: Record<string, SymbolMeaning> = {
  MALE: { title: 'Sex', value: 'Male' },
  'L---LABRADOR': { title: 'Breed', value: 'Labrador' },
  DARK: { title: 'Coat', value: 'Dark' },
  WATER: { title: 'Element', value: 'Water' },
  LEO: { title: 'Western Zodiac', value: 'Leo' },
  ROASTER: { title: 'Chinese Zodiac', value: 'Rooster' },
  SAVAGE: { title: 'Trait', value: 'Savage' },
  TANIER: { title: 'Trait', value: 'Loyal' },
  MAN: { title: 'Owner', value: 'Male' },
  M: { title: 'Owner Initial', value: 'M' },
  FOUNDED: { title: 'Order', value: '#1 — Founder' },
  _1: { title: 'Order', value: '#1 — Founder' },
};

const SYMBOL_IDS = Object.keys(MEANINGS);
const SVG_URL = '/heroglyph/hektor-horizontal.svg';

export default function Heroglyph() {
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
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!svgMarkup || !svgWrapRef.current) return;
    const root = svgWrapRef.current;

    const handlers: Array<{ el: Element; type: string; fn: (e: Event) => void }> = [];

    SYMBOL_IDS.forEach((id) => {
      const el = root.querySelector(`[id="${CSS.escape(id)}"]`);
      if (!el) return;
      el.classList.add('hero-zone');

      const enter = () => setActiveSymbol(id);
      const click = (e: Event) => {
        e.stopPropagation();
        setActiveSymbol((cur) => (cur === id ? null : id));
      };

      el.addEventListener('mouseenter', enter);
      el.addEventListener('click', click);
      handlers.push({ el, type: 'mouseenter', fn: enter });
      handlers.push({ el, type: 'click', fn: click });
    });

    // SVG element itself — leave handler (desktop) + outside tap reset (mobile)
    const svg = root.querySelector('svg');
    const leave = () => {
      if (!window.matchMedia('(max-width: 768px)').matches) {
        setActiveSymbol(null);
      }
    };
    if (svg) {
      svg.addEventListener('mouseleave', leave);
      handlers.push({ el: svg, type: 'mouseleave', fn: leave });
    }

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    };
  }, [svgMarkup]);

  // Tap outside resets on mobile
  useEffect(() => {
    if (!isMobile) return;
    const onDocClick = (e: MouseEvent) => {
      if (!svgWrapRef.current) return;
      const target = e.target as Element;
      const inSvg = target.closest('.heroglyph-svg-wrap');
      if (!inSvg) setActiveSymbol(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [isMobile]);

  // Toggle is-active class on the matching symbol element
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

  return (
    <div style={{ background: '#000', color: '#F2EAD6', minHeight: '100dvh', overflow: 'hidden' }}>
      <PageNav />

      <style>{`
        .heroglyph-svg-wrap svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .heroglyph-svg-wrap svg path,
        .heroglyph-svg-wrap svg rect:not([id="Artboard1"]) {
          fill: #C99A3F !important;
          stroke: #C99A3F !important;
        }
        .heroglyph-svg-wrap svg path[fill-rule="nonzero"],
        .heroglyph-svg-wrap svg [style*="fill-rule:nonzero"] {
          fill: #C99A3F !important;
        }
        .heroglyph-svg-wrap.has-active [id]:not(.hero-zone),
        .heroglyph-svg-wrap.has-active rect[id="Artboard1"] {
          /* leave artboard alone */
        }
        .heroglyph-svg-wrap.has-active .hero-zone {
          opacity: 0.42;
          transition: opacity 0.18s ease, filter 0.18s ease;
        }
        .heroglyph-svg-wrap .hero-zone {
          cursor: pointer;
          transition: opacity 0.18s ease, filter 0.18s ease;
          transform-box: fill-box;
          transform-origin: center;
        }
        .heroglyph-svg-wrap.has-active .hero-zone.is-active {
          opacity: 1;
          filter: drop-shadow(0 0 12px #C99A3F) drop-shadow(0 0 22px rgba(201,154,63,0.55));
        }
        @media (max-width: 768px) {
          .heroglyph-svg-wrap.is-vertical {
            transform: rotate(90deg);
            transform-origin: center center;
          }
        }
        @keyframes meaning-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'stretch',
          paddingTop: 'clamp(72px, 9vh, 96px)',
          paddingBottom: 'clamp(24px, 4vh, 40px)',
          paddingLeft: 'clamp(20px, 4vw, 64px)',
          paddingRight: 'clamp(20px, 4vw, 64px)',
          gap: isMobile ? 'clamp(16px, 2.5vh, 24px)' : 'clamp(24px, 4vw, 72px)',
          boxSizing: 'border-box',
        }}
      >
        {/* LEFT (desktop) / TOP (mobile) — interactive heroglyph */}
        <div
          style={{
            flex: isMobile ? '0 0 auto' : '0 0 40%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            position: 'relative',
          }}
        >
          <div
            ref={svgWrapRef}
            className={`heroglyph-svg-wrap ${activeSymbol ? 'has-active' : ''} ${isMobile ? 'is-vertical' : ''}`}
            style={{
              width: '100%',
              maxWidth: isMobile ? '40vh' : 520,
              height: isMobile ? '54vh' : 'min(72vh, 460px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />

          {/* Founder badge — desktop only, below SVG */}
          {!isMobile && (
            <div
              style={{
                marginTop: 'clamp(12px, 2vh, 24px)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: 0.85,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  border: '1px solid rgba(201,154,63,0.5)',
                  backgroundImage: 'url(/images/hektor-grid.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.12em', color: '#F2EAD6' }}>
                  HEKTOR
                </span>
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.22em', color: '#C99A3F', textTransform: 'uppercase' }}>
                  Founder · #1
                </span>
              </div>
            </div>
          )}

          {!svgMarkup && (
            <div style={{ position: 'absolute', color: 'rgba(242,234,214,0.4)', fontSize: '0.85rem' }}>Loading heroglyph…</div>
          )}
        </div>

        {/* RIGHT (desktop) / BOTTOM (mobile) — manifest + meaning + CTA */}
        <div
          style={{
            flex: isMobile ? '1 1 auto' : '0 0 60%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 'clamp(14px, 2.4vh, 24px)',
            minHeight: 0,
            maxWidth: isMobile ? '100%' : 640,
          }}
        >
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.6vw, 3.4rem)',
              letterSpacing: '0.08em',
              color: '#C99A3F',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            THE HEROGLYPH
          </h1>

          <div
            style={{
              width: 64,
              height: 1,
              background: 'rgba(201,154,63,0.5)',
            }}
          />

          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 400,
              fontSize: 'clamp(0.98rem, 1.5vw, 1.18rem)',
              letterSpacing: '0.04em',
              color: 'rgba(242,234,214,0.86)',
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 540,
            }}
          >
            A symbol for those unashamed to love their dog.
            <br />
            Your ticket into a worldwide movement that worships them back.
          </p>

          {/* Meaning panel */}
          <div
            style={{
              marginTop: 'clamp(4px, 1vh, 12px)',
              minHeight: 96,
              padding: '18px 22px',
              border: '1px solid rgba(201,154,63,0.28)',
              background: 'rgba(201,154,63,0.04)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 6,
              position: 'relative',
            }}
          >
            {meaning ? (
              <div key={activeSymbol} style={{ animation: 'meaning-fade-in 200ms ease' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#C99A3F',
                    marginBottom: 4,
                  }}
                >
                  {meaning.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: '#F2EAD6',
                    letterSpacing: '0.04em',
                  }}
                >
                  {meaning.value}
                </div>
              </div>
            ) : (
              <div style={{ color: 'rgba(242,234,214,0.42)', fontSize: '0.88rem', letterSpacing: '0.06em' }}>
                {isMobile ? 'Tap a symbol to reveal its meaning.' : 'Hover a symbol to reveal its meaning.'}
              </div>
            )}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'clamp(4px, 1vh, 12px)' }}>
            <Link
              to="/heroglyph/name"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                alignSelf: isMobile ? 'stretch' : 'flex-start',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                color: '#1a1208',
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: '0.92rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 8,
                border: '1px solid rgba(250,244,236,0.30)',
                boxShadow: '0 6px 22px rgba(201,154,63,0.32)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(201,154,63,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(201,154,63,0.32)';
              }}
            >
              Claim Your Heroglyph →
            </Link>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(242,234,214,0.52)', textTransform: 'uppercase' }}>
              $11 · Permanent Symbol · 1 of 1
            </div>
          </div>

          {/* Founder badge — mobile only, compact under CTA */}
          {isMobile && (
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                opacity: 0.8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  border: '1px solid rgba(201,154,63,0.5)',
                  backgroundImage: 'url(/images/hektor-grid.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.18em', color: '#C99A3F', textTransform: 'uppercase' }}>
                Hektor · Founder · #1
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
