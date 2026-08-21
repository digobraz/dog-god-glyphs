// Leaflet marker icons built from brand hand-drawn SVGs (NOT the default blue
// pin). `L.divIcon` needs a raw HTML string (not JSX) — this mirrors the
// filter values in `src/components/pack/BrandIcon.tsx` (tint 'dark') so the
// glyph reads the same warm ink brown as the rest of the papyrus UI.
import L from 'leaflet';
import type { TrailPlaceType } from './types';

const DARK_FILTER =
  'brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%)';

const PLACE_ICON_SRC: Record<string, string> = {
  water: '/icons/pack/water.svg',
  cafe: '/icons/pack/cafe.svg',
  vet: '/icons/pack/vet.svg',
  park: '/icons/pack/forest.svg',
  shelter: '/icons/pack/house-heart.svg',
};

function badgeIcon(src: string, opts?: { size?: number; ring?: string; bg?: string }): L.DivIcon {
  const size = opts?.size ?? 28;
  const bg = opts?.bg ?? '#C99A3F';
  const ring = opts?.ring ?? '#FFFBF2';
  const glyph = Math.round(size * 0.5);
  return L.divIcon({
    className: 'dogypt-trail-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid ${ring};box-shadow:0 2px 8px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;">
      <img src="${src}" style="width:${glyph}px;height:${glyph}px;object-fit:contain;filter:${DARK_FILTER};" />
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function placeIcon(placeType: string | null | undefined, selected = false): L.DivIcon {
  const src = PLACE_ICON_SRC[placeType ?? ''] ?? '/icons/pack/paw.svg';
  return badgeIcon(src, selected ? { size: 34, bg: '#F5C73D' } : undefined);
}

export function draftPointIcon(): L.DivIcon {
  return badgeIcon('/icons/pack/plus.svg', { size: 22, bg: '#FFFBF2', ring: '#C99A3F' });
}

export const PLACE_TYPE_LABEL_ICON: Record<TrailPlaceType, string> = {
  water: '/icons/pack/water.svg',
  cafe: '/icons/pack/cafe.svg',
  vet: '/icons/pack/vet.svg',
  park: '/icons/pack/forest.svg',
  shelter: '/icons/pack/house-heart.svg',
};

// ── PILULKA S KM na začiatku trasy (článok výletu) ──────────────────────────
// Matej 2026-08-20: „pri blogovom článku daj preč tú packu a nechaj tam ten pils s km radšej".
// Packa tam bola `placeIcon('walk', true)`, teda plná zlatá — a zlatá na mape znamená „vybraté",
// takže štart sa tváril ako stav. Pilulka namiesto nej nesie ÚDAJ, čo je to isté, čo robí
// značka výletu na `/pack/map`; článok tým prestal mať vlastný slovník.
//
// Štýly sú INLINE, nie cez triedu `.trp-pill`: tá žije v <style> bloku PackMap-u a článok je
// vlastná routa — trieda by sa tam ticho nechytila. Hodnoty sú prepísané 1:1 z `.trp-pill`
// a jej `.hot` varianty, vrátane fialového prsteňa (článok je vždy „tá" trasa, teda aktívna).
// `translate(-50%,-100%)` = pilulka sedí NAD bodom, rovnako ako na mape.
// Dve veci, ktoré sa inline štýlom v `html` nedajú vyriešiť, lebo sedia na KOREŇOVOM elemente
// markera (ten skladá Leaflet, my mu vieme dať len triedu). Obe sú prevzaté z `.trp-pinwrap`
// v PackMap — bez nich pilulka vyzerá rozbito a je to presne ten istý pár chýb ako 2026-07-27:
//  1. Leaflet bez `iconSize` nastaví divIcon-u INLINE `width/height: 12px`, takže pilulka má
//     vnútri 12 px na text a „9.8 km" sa zalomí na dva riadky. Prebiť sa to dá len `!important`.
//  2. `p,li,label,span{text-wrap:pretty}` z index.css sadne aj na náš <span> a PREBIJE zdedené
//     `white-space:nowrap` (priama deklarácia vyhráva nad zdedenou) — čiže druhá príčina toho
//     istého zalomenia. Rieši ju vyššia špecificita `.dogypt-trip-pill span`.
// Idempotentné, štýl sa vloží raz na dokument — rovnaký vzor ako `ensureTrailLineCss`.
function ensureTripPillCss(): void {
  if (typeof document === 'undefined' || document.getElementById('dogypt-trip-pill-css')) return;
  const el = document.createElement('style');
  el.id = 'dogypt-trip-pill-css';
  el.textContent = '.dogypt-trip-pill{background:none;border:0;width:auto!important;height:auto!important;}'
    + '.dogypt-trip-pill span{white-space:nowrap;}';
  document.head.appendChild(el);
}

const DIFF_DOT: Record<string, string> = {
  circle: 'width:9px;height:9px;border-radius:50%;background:#3FA34D;',
  square: 'width:9px;height:9px;background:#E0A020;',
  triangle: 'width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #CE4B3C;',
};
const diffShape = (d?: string) =>
  d === 'Easy' ? 'circle' : (d === 'Hard' || d === 'Odyssey') ? 'triangle' : 'square';

export function tripPillIcon(opts: { km?: string; diff?: string; label?: string; water?: boolean }): L.DivIcon {
  const water = !!opts.water;
  const text = water ? (opts.label ?? '') : (opts.km ? `${opts.km} km` : (opts.label ?? ''));
  const skin = water
    ? 'background:#2E6FD6;color:#fff;border:1px solid rgba(255,255,255,0.55);box-shadow:0 2px 7px rgba(0,0,0,0.34);'
    : 'background:linear-gradient(180deg,#FFFFFF,#F2ECE0);color:#1c160c;border:1px solid rgba(122,47,191,0.55);'
      + 'box-shadow:0 0 0 3px rgba(179,107,255,0.35),0 4px 12px rgba(0,0,0,0.5);';
  // Odyssey má biely trojuholník (viď DIFF_MARK_CSS) — na bielej pilulke by zmizol, preto
  // sa značka náročnosti pri ňom vynecháva, nefabrikuje sa iná farba.
  const showDiff = !water && !!opts.diff && opts.diff !== 'Odyssey';
  const mark = showDiff ? `<i style="display:inline-block;flex-shrink:0;${DIFF_DOT[diffShape(opts.diff)]}"></i>` : '';
  ensureTripPillCss();
  return L.divIcon({
    className: 'dogypt-trip-pill',
    html: `<div style="position:relative;transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:5px;`
      + `padding:5px 9px 5px 7px;border-radius:999px;white-space:nowrap;`
      + `font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:10.5px;letter-spacing:.01em;${skin}">`
      + `${mark}<span>${text}</span></div>`,
  });
}
