import { Link } from 'react-router-dom';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import { PageNav } from '@/components/PageNav';

export default function Codex() {
  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden relative">
      {/* Radial vignette — identical to /heroglyph, /vision, /about */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.5) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <style>{`
        .codex-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.4vh, 22px);
          width: 100%;
          max-width: 720px;
          text-align: center;
        }

        .codex-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(250,244,236,0.50);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }
        .codex-eyebrow::before,
        .codex-eyebrow::after {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(201,154,63,0.45);
        }

        .codex-headline {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5.4vw, 4rem);
          letter-spacing: 0.02em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
          background:
            linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter:
            drop-shadow(0 0 22px rgba(245,199,61,0.42))
            drop-shadow(0 0 7px rgba(230,158,26,0.5));
        }

        .codex-sub {
          font-family: 'Cinzel', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(0.95rem, 1.6vw, 1.2rem);
          letter-spacing: 0.04em;
          color: rgba(250,244,236,0.78);
          margin: 0;
          line-height: 1.3;
        }

        .codex-preamble {
          width: 100%;
          max-width: 640px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 12px;
          padding: clamp(18px, 2.8vh, 28px) clamp(20px, 4vw, 34px);
          font-family: 'Cinzel', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(0.82rem, 1.15vw, 0.98rem);
          line-height: 1.65;
          color: #1a0a05;
          text-align: center;
          letter-spacing: 0.01em;
          box-shadow:
            0 8px 28px rgba(0,0,0,0.55),
            0 0 0 3px rgba(201,154,63,0.18);
        }
        @media (max-width: 767px) {
          .codex-preamble {
            font-size: 11.5px;
            line-height: 1.55;
            padding: 14px 16px;
          }
        }
        .codex-preamble-label {
          font-family: 'Cinzel', serif;
          font-style: normal;
          font-weight: 700;
          font-size: 0.62rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #8a5a14;
          margin: 0 0 10px;
        }

        .codex-question {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: clamp(0.85rem, 1.3vw, 1.05rem);
          line-height: 1.5;
          color: #FAF4EC;
          letter-spacing: 0.02em;
          max-width: 600px;
          margin: 0;
          text-wrap: balance;
        }
        .codex-question .accent {
          color: #C99A3F;
        }
        @media (max-width: 767px) {
          .codex-question { font-size: 12.5px; line-height: 1.45; }
        }

        .codex-footer {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.6rem, 0.9vw, 0.7rem);
          letter-spacing: 0.26em;
          color: rgba(250,244,236,0.40);
          text-transform: uppercase;
          margin: 0;
        }
        .codex-footer .link {
          color: rgba(201,154,63,0.78);
          text-decoration: none;
        }
      `}</style>

      {/* Top bar — same pattern as Vision */}
      <div
        className="flex-shrink-0 relative flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[19px] md:pt-[14px]"
        style={{ zIndex: 2 }}
      >
        <Link to="/grid" aria-label="WALL" className="flex-shrink-0 md:mb-1">
          <img
            src={dogyptLogo}
            alt="DOGYPT"
            className="h-9 md:h-10 object-contain"
          />
        </Link>
        <PageNav />
      </div>

      {/* Main centered */}
      <div
        className="flex-1 flex items-center justify-center px-5 md:px-10 relative min-h-0"
        style={{ zIndex: 2 }}
      >
        <div className="codex-stack">
          <p className="codex-eyebrow">Sacred Laws of Dogyptism</p>
          <h1 className="codex-headline">The Codex</h1>
          <p className="codex-sub">The living constitution of the Pack.</p>

          <div className="codex-preamble" role="note" aria-label="Preamble">
            <p className="codex-preamble-label">Preamble</p>
            <p style={{ margin: 0 }}>
              "We, the nation of doglovers — knowing the infinite loyalty, the true love and the pure soul of every dog on Earth — in order to lift the standing of dogs in human society, build them a community, better their lives, and rewrite the fate of every dog in need, do give ourselves this constitution."
            </p>
          </div>

          <p className="codex-question">
            A billion people hold the cow sacred.{' '}
            <span className="accent">Will enough of us stand for the dog?</span>
          </p>

          <p className="codex-footer">
            Full Constitution →{' '}
            <span className="link">dogyptism.dogypt.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
