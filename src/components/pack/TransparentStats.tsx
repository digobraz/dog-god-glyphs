import { useState } from 'react';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

// Currency — €11 for launch (Europe first). One-line switch back to '$' for the US.
const CUR = '€';

// ─────────────────────────────────────────────────────────────────────────
// TRANSPARENT STATS — the money, in the open, Stripe-style. Every €11 heroglyph
// splits 5 development · 3 marketing · 2 direct help · 1 Hekthor. Switch the
// period (per-month or all-time) and see where it went, plus the live balance.
//
// PLACEHOLDER DATA — illustrative until the finance ledger exists. Swap PERIODS
// + BALANCE for an edge-fn fetch (get-pack-finance or similar); layout stays.
// ─────────────────────────────────────────────────────────────────────────
const PERIODS = [
  { key: 'jun26', label: 'June 2026', short: 'Jun', heroglyphs: 128, affiliatePoints: 1240 },
  { key: 'may26', label: 'May 2026', short: 'May', heroglyphs: 86, affiliatePoints: 720 },
  { key: 'all', label: 'All time', short: 'All time', heroglyphs: 214, affiliatePoints: 1960 },
] as const;

// Current balance held in the public DOGYPT account (placeholder).
const BALANCE = 1860;

const ALLOC = [
  {
    key: 'dev',
    share: 5,
    label: 'Development',
    color: T.partDev,
    detail: 'App build · servers · design tools — the road to the million.',
  },
  { key: 'mkt', share: 3, label: 'Marketing', color: T.partMkt },
  { key: 'help', share: 2, label: 'Direct help', color: T.partHelp },
  { key: 'hek', share: 1, label: "Hekthor's bowl", color: T.partHek },
] as const;

function money(n: number): string {
  return `${CUR}${n.toLocaleString('en-US')}`;
}

export function TransparentStats() {
  const [pIdx, setPIdx] = useState(0);
  const period = PERIODS[pIdx];

  return (
    <div style={{ marginTop: 26, paddingTop: 24, borderTop: `1px solid ${T.hairline}` }}>
      {/* Header — title + period switcher (Stripe-style segmented control) */}
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(14px, 2.6vw, 17px)',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.ink,
            margin: 0,
          }}
        >
          Transparent Stats
        </h3>

        <div
          className="flex items-center"
          style={{
            background: T.cardSoft,
            border: `1px solid ${T.hairline}`,
            borderRadius: 999,
            padding: 3,
            gap: 2,
          }}
        >
          {PERIODS.map((p, i) => {
            const active = i === pIdx;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPIdx(i)}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.02em',
                  color: active ? T.card : T.inkDim,
                  background: active ? T.ink : 'transparent',
                  border: 'none',
                  borderRadius: 999,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                }}
              >
                {p.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top row — account balance + heroglyphs forged (this period) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ marginBottom: 14 }}>
        {/* Live account balance */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.ink} 0%, #2b2410 100%)`,
            borderRadius: 14,
            padding: '14px 18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center gap-1.5" style={{ marginBottom: 5 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: T.growGreen,
                boxShadow: `0 0 0 3px ${T.growGreenSoft}`,
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,228,0.7)',
              }}
            >
              On the account now
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(26px, 6vw, 34px)',
              fontWeight: 700,
              lineHeight: 1,
              color: '#FCF4DF',
            }}
          >
            {money(BALANCE)}
          </div>
        </div>

        {/* Heroglyphs forged this period */}
        <div
          className="flex items-baseline gap-3"
          style={{
            background: T.cardSoft,
            border: `1px solid ${T.hairline}`,
            borderRadius: 14,
            padding: '14px 18px',
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(26px, 6vw, 34px)',
              fontWeight: 700,
              lineHeight: 1,
              color: T.ink,
            }}
          >
            {period.heroglyphs}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: T.inkDim,
            }}
          >
            heroglyphs
            <br />
            {period.key === 'all' ? 'all time' : 'this month'}
          </span>
        </div>
      </div>

      {/* Allocation tiles — where the money went (this period) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {ALLOC.map((a) => (
          <div
            key={a.key}
            style={{
              background: T.card,
              border: `1px solid ${T.hairline}`,
              borderRadius: 14,
              padding: '13px 13px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              aria-hidden
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: a.color }}
            />
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: T.inkDim,
                }}
              >
                {a.label}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: a.color,
                  background: `${a.color}1F`,
                  borderRadius: 999,
                  padding: '1px 6px',
                }}
              >
                ×{a.share}
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(19px, 4.4vw, 24px)',
                fontWeight: 700,
                lineHeight: 1,
                color: T.ink,
              }}
            >
              {money(period.heroglyphs * a.share)}
            </div>
            {'detail' in a && a.detail && (
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 10,
                  lineHeight: 1.4,
                  color: T.inkFaint,
                  margin: '7px 0 0',
                }}
              >
                {a.detail}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer — apostle points + total raised (this period) */}
      <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginTop: 14 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, color: T.inkDim }}>
          <strong style={{ color: T.accentGold, fontWeight: 700 }}>
            {period.affiliatePoints.toLocaleString('en-US')}
          </strong>{' '}
          Apostle Points distributed to the pack
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            color: T.inkDim,
          }}
        >
          {money(period.heroglyphs * 11)} raised
        </span>
      </div>
    </div>
  );
}
