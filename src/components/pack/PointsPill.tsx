// ── PILULKA BODOV — JEDEN komponent pre celú appku (2026-08-05) ──────────────
//
// Matej 5. 8.: „vidím to ale je to nevýrazné… tie body musia byť výrazné to rate it +3? je
// úplne stratené… treba to zvýrazniť, centrovať urobiť z toho prvok ktorý padne do očí napr
// do bieleho pills alebo niečo obdobné" → a k farbe: „daj bezovu rob všetko v brande".
//
// Preto: papyrusová/béžová pilulka (#F5F0E4) s tmavým inkoustom (T.inkStrong). Na tmavej fotke
// aj na tmavom paneli je to najsvetlejšia plocha na obrazovke — padne do očí bez toho, aby
// vznikla nová farba mimo brand v3.2. Biela sa zámerne NEPOUŽÍVA.
//
// ⚠️ Toto MUSÍ ostať jediná implementácia. Predtým to boli tri kópie v troch súboroch
// (`.trp-photoact-pts` v PackMap, `.pta-actbtn-pts` v PackTripArticle, číslo v nadpise
// WalkedPopupu) a všetky tri vyzerali inak. Rovnaká chyba ako PawInput/PawPicker/PawRating.
//
// DVE FARBY = DVA DRUHY BODOV (zadanie §3b):
//   base  → béžová · body zarobené nohami (5 + km + stúpanie). Vieš ich dopredu, sľubuje ich
//           tlačidlo, padnú VŽDY.
//   bonus → zlatá  · objavenie (nové pohorie / NP / CHKO / voda / krajina / zbierka). Padne
//           LEN prvýkrát, preto na tlačidle nesmie byť — odhalí sa až po ✓.
//
// Použitie si musí injektnúť `POINTS_PILL_CSS` (rovnaký vzor ako GLASS_CSS v packTheme.ts).

import { useEffect, useRef, useState } from 'react';
import { PACK_THEME as T, FONT_UI } from './packTheme';

/** Papyrusová béžová — najsvetlejšia plocha v tmavom UI. Zhodná s `onDark` rodinou. */
const PILL_BEIGE = '#F5F0E4';

export const POINTS_PILL_CSS = `
.pts-pill{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:${FONT_UI};font-weight:600;line-height:1;letter-spacing:.01em;
  border-radius:999px;white-space:nowrap;font-variant-numeric:tabular-nums;
}
/* ZÁKLAD — béžová. border v tej istej farbe, nie priehľadný okraj: pilulka leží aj na
   zlatom podklade (chip .on), kde by tmavý rám urobil dieru. */
.pts-pill--base{
  background:${PILL_BEIGE};color:${T.inkStrong};
  border:1px solid rgba(42,22,8,0.14);
  box-shadow:0 1px 4px rgba(0,0,0,0.35);
}
/* BONUS — zlatá. Rovnaký gradient ako .btn-gold / level pilulka, žiadny nový. */
.pts-pill--bonus{
  background:linear-gradient(135deg,#F5C73D,#E69E1A);color:#241a06;
  border:1px solid rgba(250,244,236,0.30);
  box-shadow:0 2px 10px rgba(230,158,26,0.45);
}
.pts-pill--sm{font-size:10.5px;padding:3px 7px;}
.pts-pill--md{font-size:13px;padding:6px 13px;}
.pts-pill--lg{font-size:17px;padding:8px 16px;}
/* Prílet bonusu — odmena sa má „objaviť", nie tam len ticho byť (zadanie §3b: animácia patrí
   BONUSU, nie základu — základ si vedel dopredu). prefers-reduced-motion ju vypína. */
@keyframes pts-pop{0%{transform:scale(.72);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
.pts-pill--pop{animation:pts-pop .34s cubic-bezier(.34,1.56,.64,1) both;}
@media (prefers-reduced-motion:reduce){ .pts-pill--pop{animation:none;} }
`;

/**
 * Dopočítanie 0 → value. Vracia hotové číslo, keď je animácia vypnutá (reduced motion)
 * alebo `animate` nie je zapnuté — nikdy nezostane visieť na nule.
 */
function useCountUp(value: number, animate: boolean, ms = 620): number {
  const [shown, setShown] = useState(animate ? 0 : value);
  const raf = useRef<number>();
  useEffect(() => {
    if (!animate) { setShown(value); return; }
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || value <= 0) { setShown(value); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      // easeOutCubic — rýchly nábeh, mäkké dosadnutie na finálne číslo
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value, animate, ms]);
  return shown;
}

export interface PointsPillProps {
  /** Kladné celé číslo bodov. `+` sa dopisuje sám. */
  value: number;
  /** base = zarobené nohami (béžová) · bonus = objavenie (zlatá). */
  tone?: 'base' | 'bonus';
  size?: 'sm' | 'md' | 'lg';
  /** Dopočítať 0 → value pri objavení sa (len bonus po ✓). */
  animate?: boolean;
  className?: string;
  title?: string;
}

export function PointsPill({ value, tone = 'base', size = 'sm', animate = false, className = '', title }: PointsPillProps) {
  const shown = useCountUp(value, animate);
  return (
    <span
      className={`pts-pill pts-pill--${tone} pts-pill--${size}${animate ? ' pts-pill--pop' : ''}${className ? ` ${className}` : ''}`}
      title={title}
    >
      +{shown}
    </span>
  );
}

export default PointsPill;
