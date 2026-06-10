import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

export function ConstitutionCard() {
  return (
    <a
      href="https://dogyptism.dogypt.com"
      target="_blank"
      rel="noopener noreferrer"
      className="pack-card-hover cbc block w-full"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
        color: T.ink,
        textDecoration: 'none',
        height: '100%',
        minHeight: 380,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
    >
      <style>{`
        .cbc-img { transition: transform .45s ease; }
        .cbc:hover .cbc-img { transform: scale(1.05); }
        .cbc-ov {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; text-align: center; padding: 28px;
          background: radial-gradient(circle at center, rgba(8,6,3,0.80) 0%, rgba(8,6,3,0.58) 58%, rgba(8,6,3,0.34) 100%);
          opacity: 0; transition: opacity .35s ease; pointer-events: none;
        }
        @media (hover: hover) { .cbc:hover .cbc-ov { opacity: 1; } }
        /* touch devices have no hover → keep a soft bottom label always visible */
        @media (hover: none) {
          .cbc-ov {
            opacity: 1; justify-content: flex-end; padding-bottom: 26px;
            background: linear-gradient(0deg, rgba(8,6,3,0.78) 0%, rgba(8,6,3,0.32) 38%, transparent 62%);
          }
        }
      `}</style>

      {/* DOGMA — the sacred book, enlarged (same cover as the /religion flipbook) */}
      <img
        className="cbc-img"
        src="/images/dogma-cover.png"
        alt="DOGMA — the Dogyptian Constitution"
        style={{
          height: '100%',
          width: 'auto',
          maxWidth: '100%',
          maxHeight: 440,
          objectFit: 'contain',
          filter: 'drop-shadow(0 18px 38px rgba(10,10,10,0.32))',
        }}
      />

      {/* Hover reveal */}
      <div className="cbc-ov">
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            color: '#F5C73D',
            textShadow: '0 2px 16px rgba(0,0,0,0.55)',
          }}
        >
          Read the DOGMA
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13.5,
            lineHeight: 1.5,
            color: 'rgba(250,244,236,0.88)',
            maxWidth: 240,
          }}
        >
          The foundation of the whole faith — every Dogyptian should read it.
          The philosophy, the logic, and how devotion works all begin here.
        </div>
      </div>
    </a>
  );
}
