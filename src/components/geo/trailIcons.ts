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
