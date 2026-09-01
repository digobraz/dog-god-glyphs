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
import { createPortal } from 'react-dom';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { MAPY_API_KEY, MAPY_BASE } from '@/lib/env';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { MAP_SKIN, PALE } from '@/components/pack/navGoldSkin';
import { dockPadX } from '@/components/pack/mapDockShape';
import { useT, useLang } from '@/i18n/LanguageContext';

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
// (`NameScreen.tsx`, `--name-prev-ang`).
//
// ⚠️ MODRÉ, NIE ZLATÉ (Matej 2026-08-26: „animácia ktorá obkresľuje text area bude modrou
// akú máme v heroflow aby to bolo lepšie vidieť"). Zlatá verzia obiehala po ráme, ktorý je
// na bledom PC paneli sám zlatý — svetlo teda kĺzalo po vlastnej farbe a nebolo ho vidno.
// Hodnoty sú zdvihnuté 1:1 z `NameScreen.tsx` (rgba(47,107,255) → rgba(156,196,255)), nie
// odhadnuté: je to tá istá animácia z toho istého toku, tak má byť aj tá istá modrá.
const GLOW_DIM = 'rgba(47,107,255,0.55)';
const PLACE_SEARCH_CSS = `
@property --trp-ps-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.trp-ps{position:relative;border-radius:10px;}
.trp-ps.is-attn{box-shadow:0 0 16px rgba(47,107,255,0.22);}
.trp-ps.is-attn::before{
  content:'';position:absolute;inset:-2px;border-radius:12px;z-index:0;pointer-events:none;padding:2px;
  background:conic-gradient(from var(--trp-ps-ang),
    transparent 0deg, transparent 250deg,
    rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
    rgba(47,107,255,0.85) 352deg, transparent 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  filter:blur(1px);
  animation:trpPsSpin 3.8s linear infinite;
}
@keyframes trpPsSpin{ to { --trp-ps-ang:360deg; } }
@media (prefers-reduced-motion: reduce){ .trp-ps.is-attn::before{animation:none;} }
/* Výplň/rám/inkoust poľa a ponuky — v CSS, nie v inline štýle, nech ich bledý skin PC vie
   prebiť bez !important (viď komentár pri <input>). */
.trp-ps-input{background:rgba(10,7,4,0.72);border-color:${T.onDarkBorder};color:${T.onDark};}
.trp-ps.is-attn .trp-ps-input{border-color:${GLOW_DIM};}
.trp-ps-sug{background:rgba(18,13,7,0.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid ${T.onDarkBorder};box-shadow:0 18px 44px rgba(0,0,0,0.55);}
.trp-ps-sugitem{color:${T.onDark};}
.trp-ps-sugitem + .trp-ps-sugitem{border-top:1px solid rgba(245,240,228,0.08);}
.trp-ps-sugsub{color:${T.onDarkDim};}
${MAP_SKIN !== 'pale' ? '' : `
/* ── BLEDÝ SKIN (2026-08-26, mobil doplnený 2026-08-28) — pole stojí v papyrusovom doku,
   tak je z papyrusu tiež. Ponuka je PORTÁL do <body>, teda MIMO .trp-dock — nedá sa
   zakotviť do doku a musí sa prefarbiť sama.
   ⚠️ Media query zanikla 28. 8.: dok je bledý na každej šírke, takže druhá sada tých istých
   farieb pre mobil by sa rozišla pri prvej úprave. */
  .trp-ps-input{background:${PALE.field};border-color:${PALE.border};color:${PALE.ink};}
  .trp-ps-input::placeholder{color:${PALE.dim};opacity:.75;}
  /* Rám poľa drží MODRÚ aj na papyruse — obieha po ňom modré svetlo a zlatý rám
     pod ním by z toho spravil dve rôzne farby na jednom obryse. */
  .trp-ps.is-attn .trp-ps-input{border-color:${GLOW_DIM};}
  .trp-ps-sug{background:linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);border:1.5px solid ${PALE.edge};box-shadow:0 8px 28px rgba(0,0,0,0.45),0 0 0 3px rgba(201,154,63,0.15);backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-ps-sugitem{color:${PALE.ink};}
  .trp-ps-sugitem:hover{background:${PALE.hot};}
  .trp-ps-sugitem + .trp-ps-sugitem{border-top:1px solid ${PALE.hair};}
  .trp-ps-sugsub{color:${PALE.dim};}
`}
`;

export function PlaceSearch({ mapRef, zoom = 14, placeholder, onPicked }: PlaceSearchProps) {
  const t = useT();
  const { lang } = useLang();   // jazyk pre Mapy.com suggest (viď url nižšie)
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
        // ⚠️ JAZYK PODĽA APPKY, nie natvrdo `en` (opravené 27. 8. 2026 — tá istá chyba bola
        // aj v hľadaní na `/pack/map`). Mapy.com vracia v `label` TYP miesta, takže slovenský
        // člen dostal „Shelter" namiesto „Útulňa, bivak" — teda presne to slovo, podľa ktorého
        // miesto hľadá. Práve toto hľadanie ruší kopírovanie súradníc z mapy.cz.
        const url = MAPY_BASE + '/v1/suggest?query=' + encodeURIComponent(query)
          + '&lang=' + encodeURIComponent(lang) + '&limit=6&apikey=' + MAPY_API_KEY;
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
  }, [q, lang]);

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

  /**
   * ── VYBRATÉ MIESTO PATRÍ DO STREDU VIDITEĽNEJ MAPY, NIE DO STREDU OKNA (Matej 2026-08-26) ─
   *
   * „mapu treba vycentrovať nie na stred obrazovky ale na stred obrazovky medzi ľavým panelom
   *  a pravým okrajom, lebo teraz ľavá časť mapy nie je vidno vo viewporte."
   *
   * `flyTo` posadí bod do stredu OKNA — lenže na PC prekrýva ľavých ~480 px stĺpec s doksom,
   * takže okolie miesta naľavo od neho skončí pod panelom presne vtedy, keď si ho človek
   * ide obkresliť. Stred sa preto posunie o polovicu rozdielu rezerv (`dockPadX`) — tie isté
   * čísla, akými sa rámuje hotová trasa, aby hľadanie a rámovanie nemierili inam.
   * Na telefóne sú rezervy zhodné, rozdiel je 0 a `flyTo` ostáva presne taký, aký bol.
   */
  const pick = (s: PlaceSug) => {
    pickedRef.current = s.name;
    setQ(s.name);
    setItems([]);
    const map = mapRef.current;
    if (map) {
      const [padL, padR] = dockPadX();
      const shift = (padL - padR) / 2;
      // project/unproject v CIEĽOVOM zoome — posun v pixeloch znamená v inej mierke inú
      // vzdialenosť, takže prepočet cez aktuálny zoom by po prílete minul.
      const target = shift
        ? map.unproject(map.project([s.lat, s.lon], zoom).subtract([shift, 0]), zoom)
        : L.latLng(s.lat, s.lon);
      map.flyTo(target, zoom, { duration: 1.1 });
    }
    onPicked?.(s);
  };

  const attn = !focused && q.trim().length === 0;

  /**
   * PONUKA ŽIJE NA <body>, NIE V PANELI (Matej 2026-08-24: „pri naťukaní miesta nie je vidno
   * výber, je to schované pod mapou — vidno len posledné").
   *
   * ⚠️ NEBOL TO Z-INDEX, BOL TO OREZ. Pole stojí v doku (`.trp-dstart`), ktorý má v krokoch
   * 1–2 pevnú výšku 33vh a `overflow-y:auto` — a skrolovací kontajner OREŽE každé absolútne
   * dieťa, ktoré z neho vytŕča, nech má akékoľvek `z-index`. Ponuka sa otvára nahor (dole
   * je hrana displeja), takže jej z panela trčalo všetko okrem posledného riadku tesne
   * nad poľom. Presne to Matej videl.
   *
   * Preto `position:fixed` a portál na `<body>`: ponuka prestane patriť panelu a súradnice
   * si berie z rámčeka poľa. Šírku drží poľa, nie okna — inak by sa na PC roztiahla cez
   * celý ľavý blok.
   *
   * Smer sa ďalej rozhoduje podľa MIESTA POD POĽOM, nie podľa platformy: pole žije v doku,
   * v paneli aj vo formulári a všade sa môže ocitnúť nízko. Nahor sa ide len vtedy, keď je
   * hore VIAC miesta — inak by sa ponuka pri tesnom okne preklápala pri každom písmene.
   */
  const [box, setBox] = useState<{ left: number; width: number; top?: number; bottom?: number; max: number } | null>(null);
  useEffect(() => {
    if (!items.length) { setBox(null); return; }
    const measure = () => {
      const el = boxRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const GAP = 6, EDGE = 12;
      const below = window.innerHeight - r.bottom - GAP - EDGE;
      const above = r.top - GAP - EDGE;
      const up = below < 180 && above > below;
      setBox({
        left: r.left,
        width: r.width,
        ...(up ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }),
        max: Math.max(120, up ? above : below),
      });
    };
    measure();
    // Klávesnica na telefóne mení výšku okna AŽ PO fokuse — bez prepočtu by ponuka ostala
    // visieť tam, kde bolo pole pred jej vysunutím.
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [items]);

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
            // ⚠️ Výplň, rám a inkoust NIE SÚ tu, ale v PLACE_SEARCH_CSS (.trp-ps-input).
            // Bledý skin PC ich musí vedieť prebiť a inline štýl sa z CSS prebiť nedá —
            // musel by na to !important na piatich miestach. Zvýraznený stav (is-attn) je
            // preto tiež trieda, nie ternár v štýle.
            borderWidth: 1, borderStyle: 'solid',
            // ⚠️ 16 px JE MINIMUM, NIE VKUS (Matej 2026-08-23: „priblížilo ma na mape a zároveň
            // mi zoomlo aj viewport = nevidím šípku späť ani dolný pill, vyzerá to ako pokazené").
            // iOS Safari pri fokuse do poľa s písmom MENŠÍM než 16 px priblíži celú stránku —
            // a späť sa už sama neoddiali, takže zmiznú prvky ukotvené k okrajom. Riešiť sa to
            // dá aj `maximum-scale=1` v `<meta viewport>`, ale to zakáže priblíženie celej
            // appky každému, kto ho potrebuje. Preto 16 px.
            fontFamily: FONT_UI, fontSize: 16, fontWeight: 500, outline: 'none',
          }}
          className="trp-ps-input"
        />
      </div>
      {items.length > 0 && box && createPortal(
        <div
          // ⚠️ Ťuk do ponuky nesmie prebublať na mapu ani zavrieť sám seba. Ponuka už nie je
          // potomkom `boxRef`, takže „klik mimo" ju bez tejto výnimky zatvorí skôr, než sa
          // stihne vykonať výber — preto sa `mousedown`/`touchstart` zastaví tu.
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', left: box.left, width: box.width,
            ...(box.bottom != null ? { bottom: box.bottom } : { top: box.top }),
            // Nad dokom (1200) aj nad panelom značiek — je to vrstva, ktorá ich prekrýva zámerne.
            zIndex: 1300,
            borderRadius: 12,
            // Skrolovanie, nie orezanie: pri nízkom okne sa aj tak nezmestí celá a bez
            // `auto` by boli posledné návrhy neviditeľné a nedosiahnuteľné.
            overflowX: 'hidden', overflowY: 'auto', maxHeight: box.max,
          }}
          className="trp-ps-sug"
        >
          {items.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(s)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '10px 13px', background: 'none', border: 'none',
              }}
              className="trp-ps-sugitem"
            >
              <span style={{ display: 'block', fontFamily: FONT_UI, fontSize: 13.5, fontWeight: 500 }}>{s.name}</span>
              {s.sub && (
                <span className="trp-ps-sugsub" style={{ display: 'block', fontFamily: FONT_UI, fontSize: 11.5, marginTop: 2 }}>{s.sub}</span>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
