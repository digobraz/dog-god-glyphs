// ── TENKÁ ŠÍPKA — JEDNA PRE CELÚ APPKU (Matej 9. 11. 2026) ──────────────────────────────────────────
// *„Veľké šípky sú neprimerane veľké a hrubé: navrhnúť tenšie a menšie, všade rovnaké. V Misii ideálne malé
//  systémové bez obrysu."* Dovtedy `spat`/`sipka`/`rozbalit` = hrubé samolepky (modrá výplň + zlatý obrys).
// Teraz čistá SVG čiara farby inkoustu papyrusu (`--p3d-ink`), JEDNA hrúbka (`THIN_ARROW.stroke` px, `non-scaling-stroke`,
// takže je rovnaká pri 14 aj 28 px), zaoblené konce. Smer: left = späť, right = ďalej/otvor, down/up = rozbaliť/zbaliť.
//
// KDE JE TO ZAPOJENÉ (nič ďalšie netreba):
//   · `SysIcon name="spat|sipka|rozbalit"` (SysIcon.tsx) kreslí TOTO pod APP_NEW ⇒ všetky doterajšie miesta
//     (`BackIcon`/`ExpandIcon`/`BackLinkIcon`, `BackIc`/`NextIc`, galérie, kvízy, kalendár, feed…) sú tenké samé.
//   · `ChevDown` (SysIcon.tsx) — rozbaľovanie riadkov.
//   · Nové miesto s šípkou: `<ThinArrow dir="right" size={20} />`. NIKDY nové `ArrowLeft`/`ChevronRight`/samolepku.
// `size` je krabica (ako u samolepky, glyph zaberá ~60 % výšky). Farbu prepíš len cez `style.color`.
import type { CSSProperties } from 'react';

export const THIN_ARROW = { stroke: 1.75 } as const;

export type ThinArrowDir = 'left' | 'right' | 'down' | 'up' | 'expand';

const PATH: Record<ThinArrowDir, string> = {
  left: 'M14.5 6 L8.5 12 L14.5 18',
  right: 'M9.5 6 L15.5 12 L9.5 18',
  down: 'M6 9.5 L12 15.5 L18 9.5',
  up: 'M6 14.5 L12 8.5 L18 14.5',
  // „väčší detail": dva rohy so šípkami (dvojica úsečiek)
  expand: 'M14 5 H19 V10 M19 5 L13.5 10.5 M10 19 H5 V14 M5 19 L10.5 13.5',
};

export function ThinArrow({ dir = 'right', size = 20, style, className }: { dir?: ThinArrowDir; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
      style={{ display: 'block', flexShrink: 0, color: 'var(--p3d-ink, #2a1608)', ...style }}
    >
      <path d={PATH[dir]} fill="none" stroke="currentColor" strokeWidth={THIN_ARROW.stroke} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Mená samolepiek, ktoré sa pod APP_NEW kreslia ako tenká šípka (SysIcon.tsx). */
export const THIN_ARROW_NAMES: Record<string, ThinArrowDir> = { spat: 'left', sipka: 'right', rozbalit: 'expand' };
