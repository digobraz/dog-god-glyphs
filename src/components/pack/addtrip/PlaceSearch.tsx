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

// Svetlo obiehajúce po ráme — ten istý mechanizmus, aký nesie náhľad mena v hero flow
// (`NameScreen.tsx`, `--name-prev-ang`). Tam je modré, tu zlaté: zlatá je v projekte farba
// výzvy a toto pole je prvá vec, ktorú má človek na mape spraviť.
const GOLD_DIM = 'rgba(201,154,63,0.55)';
const PLACE_SEARCH_CSS = `
@property --trp-ps-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.trp-ps{position:relative;border-radius:10px;}
.trp-ps.is-attn{box-shadow:0 0 16px rgba(201,154,63,0.20);}
.trp-ps.is-attn::before{
  content:'';position:absolute;inset:-2px;border-radius:12px;z-index:0;pointer-events:none;padding:2px;
  background:conic-gradient(from var(--trp-ps-ang),
    transparent 0deg, transparent 250deg,
    rgba(201,154,63,0.85) 312deg, rgba(245,199,61,0.98) 334deg,
    rgba(201,154,63,0.85) 352deg, transparent 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  filter:blur(1px);
  animation:trpPsSpin 3.8s linear infinite;
}
@keyframes trpPsSpin{ to { --trp-ps-ang:360deg; } }
@media (prefers-reduced-motion: reduce){ .trp-ps.is-attn::before{animation:none;} }
`;

export function PlaceSearch({ mapRef, zoom = 14, placeholder, onPicked }: PlaceSearchProps) {
  const t = useT();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<PlaceSug[]>([]);
  // Pole musí SAMO povedať, že sa doň dá písať (Matej 2026-08-23: „okraj tej textarey musí
  // pulzovať… taký istý mechanizmus máme v hero flow"). Svetlo obieha rám LEN kým je pole
  // prázdne a nikto v ňom nestojí — počas písania by to bolo rušenie, nie pozvánka.
  const [focused, setFocused] = useState(false);
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

  const attn = !focused && q.trim().length === 0;

  /**
   * PONUKA SA OTVÁRA TAM, KDE JE MIESTO (Matej 2026-08-24: „dropdown pri vyhľadávaní je mimo
   * obrazovky"). Pevné `top:100%` znamená VŽDY NADOL — a pole stojí v doku, ktorý býva pri
   * spodnej hrane okna (na mobile vždy, na PC to tak bolo do 24. 8.), takže ponuka vytiekla
   * pod okno a spodné položky sa nedali ani prečítať, ani ťuknúť.
   *
   * ⚠️ Riešiť to výnimkou pre jednu platformu by bola chyba: pole žije v doku, v paneli aj
   * vo formulári a všade sa môže ocitnúť nízko. Rozhoduje teda MIESTO POD POĽOM, nie kto
   * komponent volá — jedno pravidlo, ktoré platí aj tam, kde ho zajtra niekto zavolá znova.
   */
  const [dropUp, setDropUp] = useState(false);
  const [dropMax, setDropMax] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!items.length) return;
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const GAP = 6, EDGE = 12;
    const below = window.innerHeight - r.bottom - GAP - EDGE;
    const above = r.top - GAP - EDGE;
    // Nahor sa ide len vtedy, keď je hore VIAC miesta — inak by sa ponuka pri tesnom okne
    // preklápala hore-dole pri každom písmene.
    const up = below < 180 && above > below;
    setDropUp(up);
    setDropMax(Math.max(120, up ? above : below));
  }, [items, focused]);

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <style>{PLACE_SEARCH_CSS}</style>
      <div className={`trp-ps${attn ? ' is-attn' : ''}`}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder ?? t('pack.addTrip.geo.searchPlace')}
          style={{
            position: 'relative', zIndex: 1,
            width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 10,
            background: 'rgba(10,7,4,0.72)', border: '1px solid ' + (attn ? GOLD_DIM : T.onDarkBorder),
            // ⚠️ 16 px JE MINIMUM, NIE VKUS (Matej 2026-08-23: „priblížilo ma na mape a zároveň
            // mi zoomlo aj viewport = nevidím šípku späť ani dolný pill, vyzerá to ako pokazené").
            // iOS Safari pri fokuse do poľa s písmom MENŠÍM než 16 px priblíži celú stránku —
            // a späť sa už sama neoddiali, takže zmiznú prvky ukotvené k okrajom. Riešiť sa to
            // dá aj `maximum-scale=1` v `<meta viewport>`, ale to zakáže priblíženie celej
            // appky každému, kto ho potrebuje. Preto 16 px.
            color: T.onDark, fontFamily: FONT_UI, fontSize: 16, fontWeight: 500, outline: 'none',
          }}
        />
      </div>
      {items.length > 0 && (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, zIndex: 5,
            ...(dropUp ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
            background: 'rgba(18,13,7,0.97)', backdropFilter: 'blur(12px)',
            border: '1px solid ' + T.onDarkBorder, borderRadius: 12,
            // Skrolovanie, nie orezanie: pri nízkom okne sa aj tak nezmestí celá a bez
            // `auto` by boli posledné návrhy neviditeľné a nedosiahnuteľné.
            overflowX: 'hidden', overflowY: 'auto', maxHeight: dropMax,
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
