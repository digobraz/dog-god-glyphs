// LOKALITA PRÍSPEVKU (25. 10. 2026). Matej: *„pri zadávaní fotky bude lokalita a pri písaní sa vie vybrať
// alebo označiť bod na mapy.cz"*. Dve cesty k tomu istému `{name, lat, lon}` (ide do `posts.attach.place`):
//   · PÍŠEM → našeptávač Mapy.com `suggest` (ten istý endpoint ako `addtrip/PlaceSearch.tsx`,
//     `events/AddEvent.tsx`; ⚠️ toto je ŠTVRTÁ kópia volania — zlúčenie čaká v PlaceSearch hlavičke),
//   · NA MAPE → celé okno s mapou Mapy.com, ťuk = bod, názov navrhne `rgeocode`.
// 🔴 Názov po ťuku je len NÁVRH a ostáva v poli na prepísanie — geokóder vracia najbližší OSM objekt,
//    nie miesto, kde človek stál (pamäť `feedback_nazov_miesta_z_geokodera_over`, „Tarajka").
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAPY_API_KEY, MAPY_BASE, mapyTiles } from '@/lib/env';
import { BackButton } from '@/components/pack/BackButton';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { PACK_THEME, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI, PAPER_BG } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { useT, useLang } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const S = PACK_SPACE;
const TX = PACK_TEXT;
/** Stred Slovenska — mapa sa otvorí tu, kým človek nemá bod. */
const SK_CENTER: [number, number] = [48.7, 19.5];

export type PostPlace = { name: string; lat?: number; lon?: number };
type Sug = { name: string; sub: string; lat: number; lon: number };

const CSS = `
.plf{position:relative;}
.plf-row{display:flex;gap:${S.sm}px;align-items:stretch;}
.plf-row .pf-field{flex:1;min-width:0;}
.plf-map{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;padding:0 ${S.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;
  border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong};font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;}
.plf-sug{position:absolute;left:0;right:0;top:calc(100% + ${S.xs}px);z-index:5;margin:0;padding:${S.xs}px 0;list-style:none;
  background:${T.card};border:1px solid ${T.border};border-radius:${PACK_R.tile}px;box-shadow:${T.panelShadow};}
.plf-sug button{display:block;width:100%;text-align:left;background:none;border:0;cursor:pointer;padding:${S.sm}px ${S.md}px;font-family:${FONT_UI};color:${T.inkStrong};}
.plf-sug b{display:block;font-weight:600;font-size:${TX.body}px;}
.plf-sug small{display:block;font-size:${TX.label}px;color:${T.inkWarm};}
.plf-ov{position:fixed;inset:0;z-index:1400;background:${PAPER_BG};display:flex;flex-direction:column;}
.plf-top{display:flex;align-items:center;gap:${S.sm}px;padding:calc(env(safe-area-inset-top,0px) + ${S.sm}px) ${S.lg}px ${S.sm}px;font-family:${FONT_UI};font-size:${TX.body}px;color:${T.inkStrong};}
.plf-canvas{flex:1;min-height:0;}
.plf-foot{display:flex;gap:${S.sm}px;align-items:center;padding:${S.md}px ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.md}px);}
.plf-foot .pf-field{flex:1;min-width:0;}
.plf-ok{flex:none;border:0;border-radius:${PACK_R.field}px;padding:${S.md}px ${S.lg}px;cursor:pointer;background:${LAPIS.grad};color:${LAPIS.ink};box-shadow:${LAPIS_BTN_SHADOW};
  font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;letter-spacing:.14em;text-transform:uppercase;}
.plf-ok:disabled{opacity:.45;cursor:default;}
`;

export function PlaceField({ value, onChange }: { value: PostPlace | null; onChange: (p: PostPlace | null) => void }) {
  const t = useT();
  const { lang } = useLang();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  const [q, setQ] = useState(value?.name ?? '');
  const [sug, setSug] = useState<Sug[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const picked = useRef(value?.name ?? '');

  // Našeptávač (debounce 250 ms). Po výbere sa ten istý text znova nehľadá.
  useEffect(() => {
    const s = q.trim();
    if (s.length < 2 || picked.current === s) { setSug([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${MAPY_BASE}/v1/suggest?query=${encodeURIComponent(s)}&lang=${lang}&limit=5&apikey=${MAPY_API_KEY}`);
        const data = await res.json();
        setSug(((data.items || []) as Array<{ name?: string; location?: string; label?: string; position?: { lat?: number; lon?: number } }>)
          .map((it) => ({ name: it.name || '', sub: [it.label, it.location].filter(Boolean).join(' · '), lat: Number(it.position?.lat), lon: Number(it.position?.lon) }))
          .filter((x) => x.name && Number.isFinite(x.lat) && Number.isFinite(x.lon)));
      } catch { setSug([]); }
    }, 250);
    return () => clearTimeout(timer);
  }, [q, lang]);

  const type = (v: string) => {
    setQ(v);
    // Ručne napísaný text bez bodu je platná lokalita („u babky na záhrade").
    onChange(v.trim() ? { name: v.trim() } : null);
  };
  const pick = (s: Sug) => {
    picked.current = s.name;
    setQ(s.name);
    setSug([]);
    onChange({ name: s.name, lat: s.lat, lon: s.lon });
  };

  return (
    <div className="plf">
      <style>{CSS}</style>
      <div className="plf-row">
        <input className="pf-field" value={q} maxLength={80} onChange={(e) => type(e.target.value)}
          placeholder={tx('pack.compose.place', 'Add location')} aria-label={tx('pack.compose.place', 'Add location')} />
        <button type="button" className="plf-map" onClick={() => setMapOpen(true)}>
          <BrandIcon name="locate" size={16} tint="dark" />{tx('pack.compose.onMap', 'Map')}
        </button>
      </div>
      {sug.length > 0 && (
        <ul className="plf-sug">
          {sug.map((s, i) => (
            <li key={i}><button type="button" onClick={() => pick(s)}><b>{s.name}</b>{s.sub && <small>{s.sub}</small>}</button></li>
          ))}
        </ul>
      )}
      {mapOpen && (
        <MapPick start={value?.lat != null && value?.lon != null ? [value.lat, value.lon] : null} lang={lang} tx={tx}
          onClose={() => setMapOpen(false)}
          onPick={(p) => { picked.current = p.name; setQ(p.name); setSug([]); onChange(p); setMapOpen(false); }} />
      )}
    </div>
  );
}

function MapPick({ start, lang, tx, onClose, onPick }: {
  start: [number, number] | null; lang: string;
  tx: (k: string, f: string) => string;
  onClose: () => void; onPick: (p: PostPlace) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState<[number, number] | null>(start);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false }).setView(start ?? SK_CENTER, start ? 14 : 7);
    L.tileLayer(mapyTiles('outdoor'), { maxZoom: 19 }).addTo(map);
    let mark: L.CircleMarker | null = start
      ? L.circleMarker(start, { radius: 8, color: LAPIS.deep, weight: 3, fillColor: LAPIS.edge, fillOpacity: 1 }).addTo(map) : null;
    map.on('click', (e: L.LeafletMouseEvent) => {
      const p: [number, number] = [e.latlng.lat, e.latlng.lng];
      if (mark) mark.setLatLng(p);
      else mark = L.circleMarker(p, { radius: 8, color: LAPIS.deep, weight: 3, fillColor: LAPIS.edge, fillOpacity: 1 }).addTo(map);
      setPt(p);
    });
    return () => { map.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Návrh názvu k bodu — len návrh, pole ostáva na prepísanie.
  useEffect(() => {
    if (!pt) return;
    let alive = true;
    fetch(`${MAPY_BASE}/v1/rgeocode?lat=${pt[0]}&lon=${pt[1]}&lang=${lang}&apikey=${MAPY_API_KEY}`)
      .then((r) => r.json())
      .then((d) => { const it = d?.items?.[0]; if (alive && it) setName(it.name || it.location || ''); })
      .catch(() => {});
    return () => { alive = false; };
  }, [pt, lang]);

  return createPortal(
    <div className="plf-ov" role="dialog" aria-modal="true" aria-label={tx('pack.compose.onMap', 'Map')}>
      <style>{CSS}</style>
      <div className="plf-top">
        <BackButton tone="pale" onClick={onClose} label={tx('pack.network.close', 'Close')} />
        <span>{tx('pack.compose.mapHint', 'Tap the map where it was')}</span>
      </div>
      <div className="plf-canvas" ref={el} />
      <div className="plf-foot">
        <input className="pf-field" value={name} maxLength={80} onChange={(e) => setName(e.target.value)}
          placeholder={tx('pack.compose.placeName', 'Name of the place')} disabled={!pt} />
        <button type="button" className="plf-ok" disabled={!pt || !name.trim()}
          onClick={() => pt && onPick({ name: name.trim(), lat: pt[0], lon: pt[1] })}>
          {tx('pack.compose.usePlace', 'Use')}
        </button>
      </div>
    </div>,
    document.body,
  );
}
