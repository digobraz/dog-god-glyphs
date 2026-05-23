import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import dogyptLogo from '@/assets/dogypt-logo-gold.png';
import { PageNav } from '@/components/PageNav';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="dark-bg flex flex-col h-[100dvh] overflow-hidden relative">
      {/* Radial vignette — identical to /heroglyph & /vision */}
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
        .about-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.4vh, 22px);
          width: 100%;
          max-width: 1120px;
          text-align: center;
        }
        @media (min-width: 768px) {
          .about-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: clamp(28px, 4.5vw, 64px);
            align-items: center;
            text-align: left;
          }
        }

        .about-left {
          display: flex;
          flex-direction: column;
          gap: clamp(14px, 2.2vh, 22px);
        }
        @media (max-width: 767px) {
          .about-left { display: contents; }
          .about-eyebrow  { order: 1; }
          .about-headline { order: 2; }
          .about-para     { order: 3; }
          .about-cta      { order: 4; }
          .about-photo    { order: 5; }
        }

        .about-eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(250,244,236,0.45);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }
        .about-eyebrow::before {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(201,154,63,0.45);
        }

        .about-para {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.85rem, 1.15vw, 0.98rem);
          font-weight: 400;
          color: rgba(250,244,236,0.78);
          line-height: 1.65;
          letter-spacing: 0.005em;
          margin: 0;
          max-width: 520px;
        }
        @media (max-width: 767px) {
          .about-para {
            font-size: 11px;
            line-height: 1.55;
            max-width: 92%;
            text-wrap: balance;
          }
        }

        .about-photo {
          position: relative;
          width: 100%;
          max-width: min(62vh, 560px);
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 0 72px rgba(201,154,63,0.22),
            0 0 0 1px rgba(250,244,236,0.10) inset;
          margin: 0 auto;
          background: #0a0705;
        }
        @media (max-width: 767px) {
          .about-photo { max-width: min(44vh, 300px); }
        }
        .about-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .about-cta {
          padding: clamp(11px, 1.7vh, 15px) clamp(28px, 4.4vw, 44px);
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.84rem, 1.2vw, 0.98rem);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s;
          align-self: flex-start;
        }
        @media (max-width: 767px) {
          .about-cta {
            align-self: center;
            padding: 9px 26px;
            font-size: 0.78rem;
            letter-spacing: 0.12em;
          }
        }
        .about-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .about-cta:active { transform: scale(0.98); }
      `}</style>

      {/* Top bar — same pattern as Vision */}
      <div
        className="flex-shrink-0 relative flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[39px] md:pt-[34px]"
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

      {/* Main 2-col area */}
      <div
        className="flex-1 flex items-center justify-center px-5 md:px-10 relative min-h-0"
        style={{ zIndex: 2 }}
      >
        <div className="about-grid">
          {/* LEFT — text block */}
          <div className="about-left">
            <p className="about-eyebrow">Our Origin</p>

            <h1
              className="about-headline"
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 'clamp(1.9rem, 4.4vw, 3.4rem)',
                letterSpacing: '0.02em',
                lineHeight: 1.05,
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              <span style={{ color: '#FAF4EC' }}>Blame it on a</span>
              <br />
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter:
                    'drop-shadow(0 0 22px rgba(245,199,61,0.42)) drop-shadow(0 0 7px rgba(230,158,26,0.5))',
                }}
              >
                Black Shelter Dog.
              </span>
            </h1>

            <p className="about-para">
              In 2017 a black shelter dog named Hekthor walked into Matej's life and never left. Together they crossed Slovakia — 42 days, 800 kilometres, one quiet promise. That walk became a book. The book became a question we couldn't put down: what if doglovers shared more than photos?
              <br />
              <br />
              DOGYPT is the answer. A movement built on the oldest, most honest relationship on Earth. Hekthor is founder #1. The Pack is growing. You are next.
            </p>

            <button
              onClick={() => navigate('/heroglyph')}
              className="about-cta"
              style={{ marginTop: 4 }}
            >
              Become Dogyptian
            </button>
          </div>

          {/* RIGHT — photo */}
          <div className="about-photo" aria-label="Matej and Hekthor">
            <img src="/images/email-pic-matej-hektor.png" alt="Matej and Hekthor" />
          </div>
        </div>
      </div>
    </div>
  );
}
