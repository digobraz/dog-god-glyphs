// ── MAPA: AKTÍVNE PÁTRANIA (SOS, 4. 11. 2026) ───────────────────────────────────────────────
// Značka = fotka psa v červenom obruči so špičkou (variant kruhu z `mapnotes/circleMark.ts`, geometria má jediný zdroj),
// ťuk → `/pack/sos/<slug>`. Dáta: `sosActive()` cez `sosKit` (krajina člena, bez telefónu).
// KRUHY okolo miesta, kde sa pes stratil — skutočné METRE (`L.circle`, nie pixely): 500 m tmavý, 10 km svetlý.
//   · polomer NEROSTIE s časom, žiadny slajder — člen vidí, kde hľadať, nie ako dlho sa hľadá,
//   · pre MOJU aj CUDZIU stratu rovnako (cudzí člen má vedieť, kam sa pozrieť),
//   · kruhy sa kreslia až od priblíženia `SOS_CIRCLES_ZOOM`: na menšom 500 m kruh nemá ani 3 px a desať kilometrov
//     by len špinilo mapu krajiny. Kruhy sú `interactive={false}` — neberú kliky mape ani značke.
// react-leaflet `Circle` mení vlastnosti na jednej inštancii (žiadne opakované `L.circle` pri prekreslení).
// Mount len za `TEST_BUILD` (PackMap). Mimo `isCleanMode`.
import { useMemo, useState } from 'react';
import L from 'leaflet';
import { Circle, Marker, useMap, useMapEvent } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { sizedUrl } from '@/services/cloudinaryService';
import { circlePhotoHtml } from './mapnotes/circleMark';
import { useSosActive } from './sosKit';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;
/** Od tohto priblíženia sa kreslia kruhy (10 km má pri z9 ~50 px; pod tým je to bodka). */
export const SOS_CIRCLES_ZOOM = 9;
export const SOS_NEAR_M = 500;
export const SOS_FAR_M = 10_000;

export function SosMapLayer({ interactive = true }: { interactive?: boolean }) {
  const rows = useSosActive();
  const nav = useNavigate();
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvent('zoomend', () => setZoom(map.getZoom()));
  // Ikona sa stavia raz na záznam — nový `L.divIcon` pri každom renderi by značku bez dôvodu prekreslil.
  const icons = useMemo(() => new Map(rows.map((r) => [r.id, L.divIcon({
    className: 'mk-wrap',
    html: circlePhotoHtml(r.photo ? sizedUrl(r.photo, 120) : null, T.sosRed),
  })])), [rows]);
  if (!rows.length) return null;
  const showCircles = zoom >= SOS_CIRCLES_ZOOM;
  return (
    <>
      {showCircles && rows.map((r) => (
        <Circle key={`far-${r.id}`} center={[r.lat, r.lng]} radius={SOS_FAR_M} interactive={false}
          pathOptions={{ color: T.sosRed, weight: 1.5, opacity: 0.55, fillColor: T.sosRed, fillOpacity: 0.07 }} />
      ))}
      {showCircles && rows.map((r) => (
        <Circle key={`near-${r.id}`} center={[r.lat, r.lng]} radius={SOS_NEAR_M} interactive={false}
          pathOptions={{ color: T.sosRedDark, weight: 2, opacity: 0.9, fillColor: T.sosRedDark, fillOpacity: 0.28 }} />
      ))}
      {rows.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={icons.get(r.id)!} interactive={interactive} zIndexOffset={1000}
          eventHandlers={{ click: () => nav(`/pack/sos/${r.slug}`) }} />
      ))}
    </>
  );
}
