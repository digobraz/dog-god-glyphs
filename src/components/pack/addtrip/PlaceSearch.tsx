// HĽADANIE LOKALITY NAD MAPOU (Matej 2026-08-22: „otvorí sa mapa… textarea s lokalitou,
// možnosť priblížiť sa pomocou naklikania miesta alebo sa tam človek posunie sám prstami").
//
// Na mobile sa ADD flow otvára rovno na mape a človek stojí nad celým Slovenskom — bez
// vyhľadávania by sa k svojmu kopcu doťahoval prstami cez štyri úrovne zoomu.
//
// ⚠️ TOTO JE TRETIA KÓPIA toho istého Mapy.com `suggest` volania v repe (PackMap.tsx r. ~375,
// AddEvent.tsx r. ~73). Nová vec sa zámerne píše ako samostatný komponent, nech je kam tie dve
// zlúčiť — kým žijú tri, prvá zmena formátu odpovede opraví jedno miesto z troch. Migrácia
// PackMap/AddEvent sem je vlastný, väčší zásah (obe majú vlastný layout aj vlastné dôsledky
// výberu), preto sa nerobí spolu s prestavbou toku.
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';

export type PlaceSug = { name: string; sub: string; lat: number; lon: number };

export type PlaceSearchProps = {
  mapRef: React.MutableRefObject<LeafletMap | null>;
  /** Zoom po výbere. 14 = úroveň, od ktorej appka dovolí zapisovať do mapy (MIN_ZOOM_FOR_NOTE). */
  zoom?: number;
  placeholder?: string;
  /** Zavolá sa PO presune mapy — volajúci si môže napr. skryť vysvetlivku. */
  onPicked?: (s: PlaceSug) => void;
};

export function PlaceSearch({ mapRef, zoom = 14, placeholder, onPicked }: PlaceSearchProps) {
  const t = useT();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<PlaceSug[]>([]);
  const pickedRef = useRef('');
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setItems([]); return; }
    if (pickedRef.current === query) { setItems([]); return; }
    const timer = setTimeout(async () => {
      try {
        const url = MAPY_BASE + '/v1/suggest?query=' + encodeURIComponent(query)
          + '&lang=en&limit=6&apikey=' + MAPY_API_KEY;
        const res = await fetch(url);
        const data = await res.json();
        const next: PlaceSug[] = (data.items || [])
          .map((it: { name?: string; label?: string; location?: string; position?: { lat?: number; lon?: number } }) => ({
            name: it.name || '',
            sub: [it.label, it.location].filter(Boolean).join(' · '),
            lat: it.position?.lat as number,
            lon: it.position?.lon as number,
          }))
          .filter((x: PlaceSug) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
        setItems(next);
      } catch { setItems([]); }
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  // Klik mimo / Esc zavrie ponuku. Bez toho ostane visieť nad mapou a kradne prvý ťuk,
  // ktorý mal položiť kotvu.
  useEffect(() => {
    if (items.length === 0) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setItems([]);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setItems([]); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [items.length]);

  const pick = (s: PlaceSug) => {
    pickedRef.current = s.name;
    setQ(s.name);
    setItems([]);
    mapRef.current?.flyTo([s.lat, s.lon], zoom, { duration: 1.1 });
    onPicked?.(s);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? t('pack.addTrip.geo.searchPlace')}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 10,
          background: 'rgba(10,7,4,0.72)', border: '1px solid ' + T.onDarkBorder,
          color: T.onDark, fontFamily: FONT_UI, fontSize: 14, fontWeight: 500, outline: 'none',
        }}
      />
      {items.length > 0 && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 5,
            background: 'rgba(18,13,7,0.97)', backdropFilter: 'blur(12px)',
            border: '1px solid ' + T.onDarkBorder, borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 18px 44px rgba(0,0,0,0.55)',
          }}
        >
          {items.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(s)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '10px 13px', background: 'none', border: 'none',
                borderTop: i === 0 ? 'none' : '1px solid rgba(245,240,228,0.08)',
              }}
            >
              <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 13.5, fontWeight: 500, color: T.onDark }}>{s.name}</span>
              {s.sub && (
                <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 11.5, color: T.onDarkDim, marginTop: 2 }}>{s.sub}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
