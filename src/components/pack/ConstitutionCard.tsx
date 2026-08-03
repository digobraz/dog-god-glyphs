import { PACK_THEME } from './packTheme';
import { useT } from '@/i18n/LanguageContext';
import { markConstitutionOpened } from '@/lib/constitutionRead';

const T = PACK_THEME;

export function ConstitutionCard() {
  const t = useT();
  return (
    <a
      href="https://dogma.dogypt.com"
      target="_blank"
      rel="noopener noreferrer"
      // Opening the DOGMA from the dashboard counts as the "Flip through the
      // Constitution" First Step (Pack.tsx reads this flag). Without this, the
      // step — and the +10 ☥ for 100% completion — was only reachable via the
      // /religion flipbook, which /pack members have no link to.
      onClick={markConstitutionOpened}
      className="pack-card-hover cbc block w-full"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
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
        alt={t('pack.dogma.imgAlt')}
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
          {t('pack.dogma.cta')}
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
          {t('pack.dogma.description')}
        </div>
      </div>
    </a>
  );
}
