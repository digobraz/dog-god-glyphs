// PawRating — hodnotenie výletu "packami" (labkami), nie hviezdičkami. V DOGYPTe je to
// bežná skratka (Matej, zadanie-addtrip-flow §8: "v dogypte je skratka hodnotenie packami").
// Vytvorené 2026-07-27, rozhodol Matej (plany/zadanie-addtrip-flow-2026-07-27.md §8+§14).
//
// Prečo NIE hviezdy: DOGYPT nie je startup-review-widget, je to psie náboženstvo — packa je
// značka príslušnosti (rovnaký duch ako heroglyf/ankh), hviezda je cudzí (Yelp/App Store) vzor.
//
// Rozdiel oproti existujúcemu <RatingPaws> (components/pack/tripShared.tsx, iterácia 16):
// tam je NEvybraná packa tlmená SOLID (biela, opacity .28) — tu Matej explicitne chce OBRYS
// pre nevybrané a vyplnenie farbou až po kliku ("toto je hlavný rozdiel oproti dnešku").
// <RatingPaws> ostáva bez zmeny (len ZOBRAZUJE existujúci rating na kartách/článku) — tento
// súbor je nový INTERAKTÍVNY vstup pre AddTripLog flow (vlna 2 ho zapojí, teraz nezapojený).
//
// IKONKA — riešenie: DVA brand assety, obrysový a plný, tá istá kresba:
//   - `ICON('paw')`      = public/icons/pack/paw.svg      = Hekypaw.svg      → OBRYS
//   - `ICON('paw-full')` = public/icons/pack/paw-full.svg = "Hekypaw full.svg" → PLNÁ
// Plný variant dodal Matej 2026-07-27 (vstupy/vizualna-identita/Icons hand drawn/).
// Geometria je identická, plná verzia je len 4,168× zväčšená (viewBox 1538×1592 vs 369×382,
// rovnaký pomer strán) → pri `mask-size: contain` v rovnakom štvorci sadnú presne na seba,
// takže prepnutie obrys→plná neposkočí.
//
// ⚠️ Predošlá iterácia (2026-07-27 ráno) predpokladala, že `paw.svg` je PLNÝ tvar a obrys
// z neho vyrábala fejkom — tá istá maska 2× (100 % a 76 %) cez `mask-composite: xor`.
// `paw.svg` je ale sám o sebe už obrys (každý prst = vonkajší + vnútorný obrys v jednej
// ceste s `fill-rule: evenodd`), takže z toho vychádzal obrys obrysu = dvojitá kaša,
// v ktorej sa vybraté od nevybratého nedalo rozoznať. Fejk je preč, nevracať ho.
//
// Zafarbenie ide cez CSS **maskovanie**, nie cez `filter`: `mask-image` + `background-color`
// dá presný cieľový hex (nie aproximáciu hue-rotate reťazcom) a vnútro obrysu ostáva REÁLNE
// priehľadné — funguje nad papyrusovým gradientom aj nad sklom, kde by bola „zmenšená kópia
// vo farbe pozadia" vidno ako záplata.
// Farba (feedback_dogypt_gold_cta_bg_rule): tmavé pozadie → #F5C73D (nemá vlastný token v
// packTheme.ts, žije len vnútri .btn-gold gradientu — literál so zdôvodnením v komentári je
// tu correctnejší než vymýšľať nový token mimo zadania), bledé pozadie → `PACK_THEME.accentGold`
// (#C99A3F).
//
// Klávesnica: šípky menia + rovno commitujú hodnotu (WAI-ARIA APG radiogroup vzor — arrow
// vyberá, netreba Tab medzi packami). Enter/Space fungujú "zadarmo", lebo každá packa je
// natívny <button> (default enter/space aktivuje onClick) — netreba duplicitný handler.
import React, { useRef, useState } from 'react';
import { ICON } from '@/components/pack/tripShared';
import { PACK_THEME as T } from '@/components/pack/packTheme';

const GOLD_ON_DARK = '#F5C73D'; // CLAUDE.md gold-cta-bg-rule — tmavé pozadie
const GOLD_ON_LIGHT = T.accentGold; // '#C99A3F' — bledé pozadie

const PACKS = [1, 2, 3, 4, 5];

export interface PawRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  onDark?: boolean;
  readOnly?: boolean;
}

// Nevybraný obrys drží tú istú zlatú, len stlmenú — aby rad packiek čítal ako jedna vec
// a nie ako dve rôzne ikonky. Na bledom papyruse treba vyššiu hodnotu, tam je kontrast menší.
const EMPTY_OPACITY_ON_DARK = 0.45;
const EMPTY_OPACITY_ON_LIGHT = 0.55;

// Jedna packa. `filled` prepína medzi plným a obrysovým assetom (viď hlavičkový komentár);
// farbu dáva `background-color` presvitajúci cez masku.
function PawShape({ filled, color, size, emptyOpacity }: {
  filled: boolean; color: string; size: number; emptyOpacity: number;
}) {
  const url = `url(${ICON(filled ? 'paw-full' : 'paw')})`;
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, display: 'block', backgroundColor: color,
        opacity: filled ? 1 : emptyOpacity,
        WebkitMaskImage: url, maskImage: url,
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
        transition: 'opacity .12s ease',
      }}
    />
  );
}

export function PawRating({ value, onChange, size = 26, onDark = false, readOnly = false }: PawRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const gold = onDark ? GOLD_ON_DARK : GOLD_ON_LIGHT;
  const emptyOpacity = onDark ? EMPTY_OPACITY_ON_DARK : EMPTY_OPACITY_ON_LIGHT;
  const gap = Math.round(size * 0.22);

  if (readOnly) {
    return (
      <div
        role="img"
        aria-label={`${value} out of 5 packs`}
        style={{ display: 'inline-flex', alignItems: 'center', gap }}
      >
        {PACKS.map((n) => (
          <PawShape key={n} filled={n <= value} color={gold} size={size} emptyOpacity={emptyOpacity} />
        ))}
      </div>
    );
  }

  const display = hover ?? value;

  const commit = (n: number) => onChange?.(n);

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(4, idx + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, idx - 1);
    else return;
    e.preventDefault();
    commit(next + 1);
    refs.current[next]?.focus();
  };

  // roving tabindex (APG radiogroup): fokusovateľná je len aktuálne vybraná packa, prípadne
  // prvá, kým nie je vybraná žiadna (value 0).
  const tabStop = value > 0 ? value - 1 : 0;

  return (
    <div
      role="radiogroup"
      aria-label="Rate this trip in packs"
      style={{ display: 'inline-flex', alignItems: 'center', gap }}
      onMouseLeave={() => setHover(null)}
    >
      {PACKS.map((n, idx) => (
        <button
          key={n}
          ref={(el) => (refs.current[idx] = el)}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} pack${n > 1 ? 's' : ''}`}
          tabIndex={idx === tabStop ? 0 : -1}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => commit(n)}
          onKeyDown={(e) => onKeyDown(e, idx)}
          style={{ background: 'none', border: 0, padding: 0, margin: 0, lineHeight: 0, cursor: 'pointer' }}
        >
          <PawShape filled={n <= display} color={gold} size={size} emptyOpacity={emptyOpacity} />
        </button>
      ))}
    </div>
  );
}
