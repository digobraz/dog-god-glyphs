// ─────────────────────────────────────────────────────────────────────────────
// LEVEL PILL — číslo levelu vo farbe svojho pásma. Jeden komponent pre všetky miesta,
// kde sa objaví ČLOVEK: kto pridal výlet, recenzie a komentáre, účastníci, správy.
//
// Matej 24. 8. 2026 (na otázku, či pri cudzích menách ukazovať level): *„meno a číslo vo
// farebnej pils"* — teda nie jemná bodka, ale plná pilulka s číslom.
//
// ⚠️ Level patrí MAJITEĽOVI, nie psovi. Na povrchoch, kde sa meno berie ako `pes || majiteľ`
//    (správy, účastníci), pilulku pripínaj k menu človeka — pri mene psa nemá zmysel.
// ⚠️ Farbu si komponent NEVYMÝŠĽA — berie ju z `@/lib/packTiers`, rovnako ako hlavička mapy
//    a karta na `/pack`. Keby si ju písal sám, po prvej zmene sady by ukazoval iné pásmo.
// ─────────────────────────────────────────────────────────────────────────────

import { FONT_UI } from '@/components/pack/packTheme';
import { tierPillStyle } from '@/lib/packTiers';

export interface LevelPillProps {
  level: number;
  /** `sm` = pri menách v zoznamoch (default) · `md` = pri nadpisoch a v paneloch */
  size?: 'sm' | 'md';
  /** doplní `aria-label`; bez neho je to pre čítačku holé číslo bez významu */
  ariaLabel?: string;
  className?: string;
}

const SIZES = {
  sm: { padding: '2px 8px 3px', fontSize: 11 },
  md: { padding: '3px 11px 4px', fontSize: 14 },
} as const;

export function LevelPill({ level, size = 'sm', ariaLabel, className }: LevelPillProps) {
  const tier = tierPillStyle(level);
  const dim = SIZES[size];
  return (
    <span
      className={className}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        border: `1px solid ${tier.borderColor}`,
        background: tier.background,
        color: tier.color,
        fontFamily: FONT_UI,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        flex: '0 0 auto',
        ...dim,
      }}
    >
      {Math.max(1, Math.floor(level || 1))}
    </span>
  );
}
