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
import { PALE } from '@/components/pack/navGoldSkin';
import type { PointsRow } from '@/lib/tripPoints';
import { useT } from '@/i18n/LanguageContext';

export interface PointsBreakdownProps {
  rows: PointsRow[];
  onDark?: boolean;
  /** kľúč riadku, ktorý sa má zvýrazniť (napr. `pack.points.newRange` — nové pohorie) */
  highlightKey?: string;
  /**
   * Riadky nabehnú po jednom zdola (Matej 28. 8. 2026 o rozpade v reveale: „je to
   * najnudnejší screen… oživ to trochu"). Poradie je zámerne to isté, v akom sa body
   * pripisovali na obrazovke pred ním — zoznam tak dopovie pohyb, ktorý človek videl.
   * ⚠️ Vypína sa pri `prefers-reduced-motion` — inak by tam pár okamihov nebolo nič.
   */
  stagger?: boolean;
}

/** Keyframes si nesie komponent sám — používajú ho dva povrchy a ani jeden by ich nemal dodávať. */
const PB_CSS = `
@keyframes pbrk-in{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:none;}}
.pbrk-row--anim{opacity:0;animation:pbrk-in .34s cubic-bezier(.22,.9,.3,1) forwards;}
@media (prefers-reduced-motion:reduce){.pbrk-row--anim{opacity:1;animation:none;}}
`;

export function PointsBreakdown({ rows, onDark = true, highlightKey, stagger }: PointsBreakdownProps) {
  const t = useT();
  const ink = onDark ? 'rgba(245,240,228,0.88)' : T.inkStrong;
  // ⚠️ NA PAPYRUSE TMAVŠIE ZLATO (2026-08-28). `T.cardEdge` (#C99A3F) je farba RÁMU — ako
  // inkoust na pieskovcovej doske je to svetlé na svetlom a čísla, teda jediný obsah tohto
  // zoznamu, sa strácajú. Rovnaký dôvod, pre ktorý má reveal tmavší gradient čísla bodov.
  const accent = onDark ? '#F5C73D' : PALE.deep;

  if (rows.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {stagger && <style>{PB_CSS}</style>}
      {rows.map((r, i) => {
        const hi = !!highlightKey && r.labelKey === highlightKey;
        return (
          <div
            key={`${r.labelKey}-${i}`}
            className={stagger ? 'pbrk-row--anim' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '7px 11px',
              borderRadius: 10,
              animationDelay: stagger ? `${60 + i * 55}ms` : undefined,
              // ⚠️ NA PAPYRUSE JE RIADOK PAPYRUS SO ZLATÝM VLASOM, nie šedý štvorec s krytím
              // (CLAUDE.md, úroveň 3 matrice). Priehľadná čierna dala riadku špinavý nádych
              // a rozpad tým vyzeral ako tabuľka, nie ako doklad.
              background: hi
                ? 'linear-gradient(90deg, rgba(201,154,63,0.22), rgba(201,154,63,0.05))'
                : (onDark
                    ? 'rgba(245,240,228,0.04)'
                    : 'linear-gradient(180deg,rgba(255,251,240,0.70),rgba(246,233,205,0.42))'),
              boxShadow: hi
                ? 'inset 0 0 0 1px rgba(201,154,63,0.42)'
                : (onDark ? undefined : 'inset 0 0 0 1px rgba(179,130,45,0.26)'),
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
                fontSize: 15.5,
                color: accent,
                fontVariantNumeric: 'tabular-nums',
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
