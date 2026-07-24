import { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapyTiles } from '@/lib/env';
import { PACK_THEME } from '@/components/pack/packTheme';
import { placeIcon, draftPointIcon } from './trailIcons';
import type { Trail, TrailPlace } from './types';

const T = PACK_THEME;

// Centrum Slovenska.
const SK_CENTER: LatLngTuple = [48.7, 19.7];
const SK_ZOOM = 8;

// GeoJSON = [lng,lat]; Leaflet chce [lat,lng] — vždy prehodiť poradie tu, na
// jednom mieste, nech to nikto nezabudne urobiť inde.
function toLatLngs(path: Trail['path']): LatLngTuple[] {
  return (path?.coordinates ?? []).map(([lng, lat]) => [lat, lng] as LatLngTuple);
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// POVINNÁ Mapy.com atribúcia + logo (licenčná podmienka). Vlastný absolute
// div namiesto L.Control — jednoduchšie, sedí nad mapovými panami (z-index).
function MapyAttribution() {
  return (
    <div
      style={{
        position: 'absolute', left: 8, bottom: 8, zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.85)', borderRadius: 4,
        padding: '3px 8px', fontSize: 10, lineHeight: 1.2,
        fontFamily: 'system-ui,-apple-system,Arial,sans-serif', color: '#333',
      }}
    >
      <a href="https://mapy.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="https://api.mapy.com/img/api/logo.svg" alt="Mapy.com" style={{ height: 14, display: 'block' }} />
      </a>
      <span>© Seznam.cz a.s.</span>
    </div>
  );
}

interface TrailsMapProps {
  trails: Trail[];
  places: TrailPlace[];
  selectedTrailId?: string | null;
  selectedPlaceId?: string | null;
  onSelectTrail?: (trail: Trail) => void;
  onSelectPlace?: (place: TrailPlace) => void;
  // Draft mode (AddTrailFlow): points being placed by the member, plus a
  // click handler that appends/replaces them. When set, existing trails still
  // render (context) but underneath the draft line.
  draftPoints?: LatLngTuple[];
  onMapClick?: (lat: number, lng: number) => void;
  height?: number | string;
}

export function TrailsMap({
  trails, places, selectedTrailId, selectedPlaceId,
  onSelectTrail, onSelectPlace, draftPoints, onMapClick, height = 420,
}: TrailsMapProps) {
  const tileUrl = useMemo(() => mapyTiles('outdoor'), []);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.onDarkBorder}` }}>
      <MapContainer center={SK_CENTER} zoom={SK_ZOOM} style={{ width: '100%', height: '100%' }} attributionControl={false}>
        <TileLayer url={tileUrl} />

        {trails.map((trail) => {
          const positions = toLatLngs(trail.path);
          if (positions.length < 2) return null;
          const isSelected = trail.id === selectedTrailId;
          return (
            <Polyline
              key={trail.id}
              positions={positions}
              pathOptions={{
                color: isSelected ? '#F5C73D' : T.accentGold,
                weight: isSelected ? 6 : 4,
                opacity: isSelected ? 0.95 : 0.75,
              }}
              eventHandlers={{ click: () => onSelectTrail?.(trail) }}
            />
          );
        })}

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={placeIcon(place.place_type, place.id === selectedPlaceId)}
            eventHandlers={{ click: () => onSelectPlace?.(place) }}
          />
        ))}

        {draftPoints && draftPoints.length > 0 && (
          <>
            {draftPoints.length >= 2 && (
              <Polyline positions={draftPoints} pathOptions={{ color: '#F5C73D', weight: 4, dashArray: '6 6' }} />
            )}
            {draftPoints.map((pos, i) => (
              <Marker key={i} position={pos} icon={draftPointIcon()} />
            ))}
          </>
        )}

        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      </MapContainer>
      <MapyAttribution />
    </div>
  );
}
