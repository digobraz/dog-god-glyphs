import { PACK_THEME } from './packTheme';
import { countryFlag } from '@/lib/countryGeo';

const T = PACK_THEME;

interface CountryRow {
  country: string;
  count: number;
}

export function TopCountries({ rows }: { rows: CountryRow[] }) {
  if (!rows?.length) {
    return (
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          color: T.inkDim,
          padding: '18px 16px',
          background: T.card,
          border: `1px dashed ${T.border}`,
          borderRadius: 16,
          textAlign: 'center',
        }}
      >
        Top countries appear once the pack starts growing.
      </div>
    );
  }

  const max = Math.max(...rows.map((r) => r.count));

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
      }}
    >
      {rows.map((r, i) => {
        const pct = max > 0 ? (r.count / max) * 100 : 0;
        const flag = countryFlag(r.country);
        return (
          <div
            key={r.country}
            className="grid items-center"
            style={{
              gridTemplateColumns: '36px 28px 1fr auto',
              gap: 12,
              padding: '14px 18px',
              borderTop: i === 0 ? 'none' : `1px solid ${T.hairline}`,
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                color: T.inkDim,
                letterSpacing: '0.1em',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{flag || '•'}</span>
            <div className="min-w-0">
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 13,
                  letterSpacing: '0.16em',
                  color: T.ink,
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                {r.country}
              </div>
              <div
                style={{
                  height: 4,
                  background: T.hairline,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: T.ink,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 14,
                color: T.ink,
                minWidth: 36,
                textAlign: 'right',
                fontWeight: 600,
              }}
            >
              {r.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
