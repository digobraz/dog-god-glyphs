// ─────────────────────────────────────────────────────────────────────────────
// ROZPAD BODOV — „za čo som ich dostal".
//
// Dáta chodia hotové z `calculateTripPoints()` / `profilePointsFor()` (`@/lib/tripPoints`),
// ktoré vracajú `rows` s i18n kľúčmi. Tento komponent ich len vykreslí — NEPOČÍTA nič.
// Keby si počítal, rozišiel by sa so súčtom, ktorý ukazuje pilulka nad ním.
//
// Používajú ho dva povrchy: ⓘ v reveale po zápise výletu a panel po kliknutí na pilulku
// levelu. Preto sem nepatrí žiadny nadpis ani obal — ten dodá volajúci.
// ─────────────────────────────────────────────────────────────────────────────

import { FONT_TITLE, FONT_UI, PACK_THEME as T } from '@/components/pack/packTheme';
import type { PointsRow } from '@/lib/tripPoints';
import { useT } from '@/i18n/LanguageContext';

export interface PointsBreakdownProps {
  rows: PointsRow[];
  onDark?: boolean;
  /** kľúč riadku, ktorý sa má zvýrazniť (napr. `pack.points.newRange` — nové pohorie) */
  highlightKey?: string;
}

export function PointsBreakdown({ rows, onDark = true, highlightKey }: PointsBreakdownProps) {
  const t = useT();
  const ink = onDark ? 'rgba(245,240,228,0.88)' : T.inkStrong;
  const accent = onDark ? '#F5C73D' : T.cardEdge;

  if (rows.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map((r, i) => {
        const hi = !!highlightKey && r.labelKey === highlightKey;
        return (
          <div
            key={`${r.labelKey}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '5px 10px',
              borderRadius: 9,
              background: hi
                ? 'linear-gradient(90deg, rgba(201,154,63,0.18), rgba(201,154,63,0.04))'
                : (onDark ? 'rgba(245,240,228,0.04)' : 'rgba(31,26,14,0.04)'),
              boxShadow: hi ? 'inset 0 0 0 1px rgba(201,154,63,0.42)' : undefined,
            }}
          >
            <span
              style={{
                flex: '1 1 auto',
                minWidth: 0,
                fontFamily: FONT_UI,
                fontSize: 12.5,
                color: ink,
              }}
            >
              {t(r.labelKey, r.labelParams)}
            </span>
            <b
              style={{
                flex: '0 0 auto',
                fontFamily: FONT_TITLE,
                fontWeight: 700,
                fontSize: 14,
                color: accent,
              }}
            >
              +{r.points}
            </b>
          </div>
        );
      })}
    </div>
  );
}
