import { useEffect, useState } from 'react';
import { PACK_THEME } from './packTheme';
import { EDGE_BASE } from '@/lib/env';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

// Currency — €11 for launch (Europe first). One-line switch back to '$' for the US.
const CUR = '€';

// ─────────────────────────────────────────────────────────────────────────
// TRANSPARENT STATS — the money, in the open, Stripe-style. Same numbers as the
// HQ dashboard: both read the SAME edge fn (get-dashboard-stats), so a member
// sees the real treasury state 1:1 with what we see internally.
//
// €11 heroglyph splits 5 development · 3 affiliate · 2 direct help · 1 Hekthor.
// Discounted/tester payments (€1 promo) go ENTIRELY into Hekthor's bowl — the
// server does the split (incl. that exception); we just render treasuries.*.
// ─────────────────────────────────────────────────────────────────────────

// share = policy ratio badge (×5/×3/×2/×1); field = key in API treasuries{}.
const ALLOC = [
  { key: 'dev',  share: 5, field: 'dev',       labelKey: 'pack.stats.development', color: T.partDev  },
  { key: 'mkt',  share: 3, field: 'affiliate', labelKey: 'pack.stats.affiliate',   color: T.partMkt  },
  { key: 'help', share: 2, field: 'help',      labelKey: 'pack.stats.directHelp',  color: T.partHelp },
  { key: 'hek',  share: 1, field: 'hektor',    labelKey: 'pack.stats.hekthorBowl', color: T.partHek  },
] as const;

type Treasuries = { dev: number; affiliate: number; help: number; hektor: number };
type Stats = { dogyptians: number; revenue_total: number; treasuries: Treasuries };

function money(n: number): string {
  return `${CUR}${(n ?? 0).toLocaleString('en-US')}`;
}

export function TransparentStats() {
  const t = useT();
  const [stats, setStats] = useState<Stats | null>(null);

  // Live treasury state — SAME source as dashboard.dogypt.com (get-dashboard-stats).
  useEffect(() => {
    let active = true;
    fetch(`${EDGE_BASE}/get-dashboard-stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && !d.error) setStats(d as Stats);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const heroglyphs = stats?.dogyptians ?? 0;
  const revenue = stats?.revenue_total ?? 0;
  const treasuries: Treasuries = stats?.treasuries ?? { dev: 0, affiliate: 0, help: 0, hektor: 0 };

  return (
    <div style={{ marginTop: 26, paddingTop: 24, borderTop: `1px solid ${T.hairline}` }}>
      {/* Header — title */}
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
          {t('pack.stats.title')}
        </h3>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10.5,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.inkDim,
            background: T.tileBg,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: '4px 11px',
          }}
        >
          {t('pack.stats.allTime')}
        </span>
      </div>

      {/* Top row — heroglyphs forged so far (full width) */}
      <div
        className="flex items-center justify-center gap-4"
        style={{
          background: T.tileBg,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: '18px 24px',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(32px, 7vw, 44px)',
            fontWeight: 700,
            lineHeight: 1,
            color: T.ink,
          }}
        >
          {heroglyphs.toLocaleString('en-US')}
        </span>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          heroglyphs
          <br />
          {t('pack.stats.forged')}
        </span>
      </div>

      {/* Allocation tiles — where the money went (live treasuries) */}
      <div className="grid grid-cols-2 gap-2.5">
        {ALLOC.map((a) => (
          <div
            key={a.key}
            style={{
              background: T.tileBg,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
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
                {t(a.labelKey)}
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
              {money(treasuries[a.field])}
            </div>
          </div>
        ))}
      </div>

      {/* Constitution link — Money is an Energy chapter */}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a
          href="https://dogma.dogypt.com/en/#address"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            color: T.inkDim,
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.accentGold)}
          onMouseLeave={e => (e.currentTarget.style.color = T.inkDim)}
        >
          {t('pack.stats.split')}
        </a>
      </div>

      {/* Footer — total raised so far (live) */}
      <div className="flex items-center justify-center" style={{ marginTop: 14 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            color: T.inkDim,
          }}
        >
          {t('pack.stats.raised', { amount: money(revenue) })}
        </span>
      </div>
    </div>
  );
}
