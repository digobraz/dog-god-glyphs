// VRSTVA VETERINÁROV na mape — Matej 17. 11. 2026. Zadanie: `plany/zadanie-veterinari-mapa-2026-11-17.md`.
//
// ── DVA ZDROJE, JEDNA ZNAČKA ────────────────────────────────────────────────
// BEŽNÝ VETERINÁR  — `public/vet/mapa-v1.json` (⚙️ `plany/veterinari/gen-vet-mapa.mjs`), stiahne
//                    sa raz, až keď je mapa priblížená nad prah.
// POHOTOVOSŤ       — `VET_EMERGENCY` z balíka appky (tá istá, čo v SOS). Na mape nesie červený
//                    lem žiary a ťuk ponúkne aj cestu do SOS, kde je karta s fotkou a časom jazdy.
// Značka je samolepka `sos-vet` (domček s krížom). NIE je to bod zo sveta (OSM) — preto žiadny
// hnedý lem a žiadna atribúcia OSM; hodnotenie a preklik nesie Google.
//
// ── BUBLINKA 24/7 (nákres `plany/nakresy/veterinar-znacka-2026-11-17`, variant B) ───────────
// Pod značkou, červená = farba SOS. Dostane ju len nonstop potvrdený webom ambulancie alebo SOS;
// Google „otvorené 24 h" sa do dát ako nonstop nedostane (rozhoduje generátor, nie táto vrstva).
//
// ⚠️ Len pod `MAP_STICKERS_ON` (appka) — web pre členov samolepky na mape nekreslí.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { FONT_UI, PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT as TX } from '@/components/pack/packTheme';
import { MAP_STICKERS_ON, stickerImg, poiStickerPx } from '@/components/pack/mapnotes/mapStickers';
import { CIRCLE_MARK_CSS } from '@/components/pack/mapnotes/circleMark';
import { PLACE_CARD_CSS } from './PlaceCard';
import { useSosT, type SosT } from '@/components/pack/sos/sosShared';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { VET_EMERGENCY, closesAt, distanceKm, isOpenAt, opensAt, vetNavUrl, type VetPlace } from '@/lib/vetEmergency';
import { driveTimes, type DriveTime } from '@/components/pack/addtrip/mapProxyClient';
import { AINUBIS } from '@/components/pack/ainubisSkin';

/** Od tohto priblíženia sa veterinári kreslia. Nižšie než spacie miesta (15): veterinára človek
 *  hľadá na úrovni mesta, nie chodníka — a rozostup v pixeloch nedovolí, aby sa nakopili. */
export const VET_MIN_ZOOM = 12;
const VET_MAX_RENDER = 120;
const MARK_PX = 34; // rozostup dvoch značiek, o kus menej než samolepka: mesto má ambulancie husto
const STICKER = '/icons/sys/sos-vet.webp';
const DATA_URL = '/vet/mapa-v1.json';
const PAN_TL: [number, number] = [20, 180];
const PAN_BR: [number, number] = [20, 110];

type Sched = NonNullable<VetPlace['sched']>;
/** Riadok `mapa-v1.json` — krátke kľúče, súbor ide po sieti. */
/** `p` = fotka v `public/vet/m/` (z webu ambulancie alebo z Google profilu); bez nej kreslený obrázok. */
type Raw = { p?: string; id: string; n: string; a: string; at: [number, number]; t?: string[]; h?: 'nonstop' | 'onsite' | 'ask'; s?: Sched; r?: number; c?: number; g: string; w?: string };
type MapVet = {
  id: string; name: string; address: string; at: [number, number]; tels: string[];
  /** tvar, ktorému rozumejú `isOpenAt` / `closesAt` / `opensAt` z pohotovosti */
  clock: Pick<VetPlace, 'hours' | 'sched' | 'weekdays'>;
  google?: { rating: number; count?: number }; googleUrl?: string; navUrl: string | null;
  sos: boolean; nonstop: boolean; photo: string;
};
// Ambulancia bez vlastnej fotky: tá istá zjavne vymyslená kresba ako v SOS (Matej 5. 11. 2026).
const NO_PHOTO = '/vet/_bez-fotky.jpg';

let filePromise: Promise<MapVet[]> | null = null;
function loadFile(): Promise<MapVet[]> {
  filePromise ||= fetch(DATA_URL)
    .then((r) => (r.ok ? r.json() : { vets: [] }))
    .then((j: { vets: Raw[] }) => j.vets.map((v): MapVet => ({
      id: v.id, name: v.n, address: v.a, at: v.at, tels: v.t ?? [],
      clock: v.s ? { hours: [0, 0], sched: v.s } : { hours: v.h ?? 'ask' },
      ...(v.r ? { google: { rating: v.r, count: v.c } } : {}),
      googleUrl: v.g,
      navUrl: `https://www.google.com/maps/dir/?api=1&destination=${v.at[0]},${v.at[1]}`,
      sos: false, nonstop: v.h === 'nonstop' || v.h === 'onsite', photo: v.p ? `/vet/m/${v.p}` : NO_PHOTO,
    })))
    // Zlyhanie je tiché: chýbajúci veterinár na mape je menšie zlo než hlásenie o sieti nad mapou.
    // Sľub sa zahodí, aby sa pri ďalšom priblížení skúsilo znova.
    .catch(() => { filePromise = null; return []; });
  return filePromise;
}

/** Pohotovosti zo SOS. Výjazdoví veterinári (`home`) nemajú miesto, kam sa dá prísť — na mapu nejdú. */
const SOS_VETS: MapVet[] = VET_EMERGENCY.filter((p) => !p.home).map((p) => ({
  id: p.id, name: p.name, address: p.address, at: p.at, tels: [p.tel, ...(p.telBy?.map((x) => x.tel) ?? [])],
  clock: { hours: p.hours, sched: p.sched, weekdays: p.weekdays },
  ...(p.google ? { google: { rating: p.google.rating, count: p.google.count }, googleUrl: p.google.url } : {}),
  navUrl: vetNavUrl('google', p),
  sos: true, nonstop: p.hours === 'onsite' || p.hours === 'nonstop', photo: p.photo?.src ?? NO_PHOTO,
}));

const icon = (v: MapVet, zoom: number) => {
  const px = poiStickerPx(zoom);
  return L.divIcon({
    className: 'mk-wrap',
    html: stickerImg(STICKER, v.sos ? ' vm-sos' : '', px) + (v.nonstop ? `<i class="vm-247" style="top:${px / 2 - 4}px">24/7</i>` : ''),
  });
};

// ── KM A MINÚTY (Matej 17. 11. 2026: „koľko km/min sú od človeka ako pri pohotovosti") ─────
// Poloha sa berie LEN keď ju človek appke už povolil — bublina na mape nesmie sama vyvolať
// systémovú otázku na polohu (v SOS je to núdza a pýta sa rovno; tu si človek len prezerá mapu).
let mePromise: Promise<[number, number] | null> | null = null;
function myPosition(): Promise<[number, number] | null> {
  mePromise ||= (async () => {
    try {
      if (!navigator.geolocation || !navigator.permissions) return null;
      const st = await navigator.permissions.query({ name: 'geolocation' });
      if (st.state !== 'granted') return null;
      return await new Promise<[number, number] | null>((res) => navigator.geolocation.getCurrentPosition(
        (p) => res([p.coords.latitude, p.coords.longitude]), () => res(null), { timeout: 8000, maximumAge: 300000 }));
    } catch { return null; }
  })();
  return mePromise;
}
/** „8 km · 12 min" — zhodné s kartou pohotovosti; kým trasa nedorazí, vzdušná čiara. */
function etaLabel(d: DriveTime, loc: string): string {
  const km = d.lengthM / 1000;
  const dist = km < 1 ? km.toLocaleString(loc, { maximumFractionDigits: 1 }) : String(Math.round(km));
  const min = Math.max(1, Math.round(d.durationS / 60));
  return `${dist} km · ${min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`}`;
}

const hm = (h: number) => { const x = h % 24; return `${Math.floor(x)}:${String(Math.round((x % 1) * 60)).padStart(2, '0')}`; };

/** Stav hodín pre pilulku. `on` = zelená (teraz otvorené), inak tichá. */
function hoursLabel(v: MapVet, s: SosT, now: Date): { text: string; on: boolean } {
  const p = v.clock as VetPlace;
  if (p.hours === 'onsite') return { text: s('pack.sos.er.onsite'), on: true };
  if (p.hours === 'nonstop') return { text: s('pack.sos.er.nonstop'), on: true };
  if (p.hours === 'call') return { text: s('pack.sos.er.call'), on: true };
  if (p.hours === 'ask') return { text: s('pack.sos.er.ask'), on: false };
  const open = isOpenAt(p, now);
  const at = open ? closesAt(p, now) : opensAt(p, now);
  if (at == null) return { text: s('pack.sos.er.closed'), on: false };
  return { text: s(open ? 'pack.sos.er.until' : 'pack.sos.er.from', { time: hm(at) }), on: open };
}

function reviews(n: number, s: SosT, loc: string): string {
  const cat = new Intl.PluralRules(loc).select(n);
  return s(cat === 'one' ? 'pack.sos.er.gRevOne' : cat === 'few' ? 'pack.sos.er.gRevFew' : 'pack.sos.er.gRevMany', { count: n.toLocaleString(loc) });
}

export function VetLayer({ minZoom = VET_MIN_ZOOM }: { minZoom?: number } = {}) {
  const map = useMap();
  const s = useSosT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const navigate = useNavigate();
  // DEV: rukoväť na mapu pre kontrolu z konzoly — to isté ako v `PoiLayer.tsx`, do produkcie nejde.
  if (import.meta.env.DEV) (window as unknown as { __MAP?: unknown }).__MAP = map;
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  const [file, setFile] = useState<MapVet[]>([]);
  // Handlery so stabilnou referenciou a posun mapy zadržaný počas otvoreného popupu — obe z toho
  // istého dôvodu ako v `PoiLayer.tsx` (stratená udalosť · slučka autopanu).
  const popupOpen = useRef(false);
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  const onMoveEnd = useCallback(() => { if (!popupOpen.current) setMoveTick((n) => n + 1); }, []);
  const onPopupOpen = useCallback(() => { popupOpen.current = true; }, []);
  // Otvorená karta: poloha (ak je povolená) → hneď vzdušná čiara, potom čas autom. Jeden dopyt na kartu.
  const [me, setMe] = useState<[number, number] | null>(null);
  const [drive, setDrive] = useState<Record<string, DriveTime>>({});
  const askDrive = useCallback((v: MapVet) => {
    void myPosition().then((pos) => {
      if (!pos) return;
      setMe(pos);
      void driveTimes(pos, [v.at]).then(([d]) => { if (d) setDrive((x) => ({ ...x, [v.id]: d })); });
    });
  }, []);
  const onPopupClose = useCallback(() => { popupOpen.current = false; setMoveTick((n) => n + 1); }, []);
  useMapEvent('zoomend', onZoomEnd);
  useMapEvent('moveend', onMoveEnd);
  useMapEvent('popupopen', onPopupOpen);
  useMapEvent('popupclose', onPopupClose);

  const on = MAP_STICKERS_ON && zoom >= minZoom;
  useEffect(() => {
    if (!on || file.length) return;
    let alive = true;
    loadFile().then((v) => { if (alive) setFile(v); });
    return () => { alive = false; };
  }, [on, file.length]);

  const items = useMemo(() => {
    if (!on) return [];
    const bounds = map.getBounds().pad(0.2);
    // Pohotovosť pred bežnou ambulanciou, nonstop pred ostatnými: pri kolízii ostane to, čo človek v núdzi hľadá.
    const vis = [...SOS_VETS, ...file].filter((v) => bounds.contains(v.at))
      .sort((a, b) => Number(b.sos) - Number(a.sos) || Number(b.nonstop) - Number(a.nonstop) || (b.google?.count ?? 0) - (a.google?.count ?? 0));
    const placed: { x: number; y: number }[] = [];
    const out: MapVet[] = [];
    for (const v of vis) {
      const pt = map.latLngToContainerPoint(v.at);
      if (placed.some((q) => Math.abs(q.x - pt.x) < MARK_PX && Math.abs(q.y - pt.y) < MARK_PX)) continue;
      placed.push({ x: pt.x, y: pt.y });
      out.push(v);
      if (out.length >= VET_MAX_RENDER) break;
    }
    return out;
    // moveTick je zámerná závislosť: posun mapy nemení `map`, ale mení viditeľný výrez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, on, zoom, moveTick, file]);

  if (!on) return null;
  const now = new Date();
  return (
    <>
      <style>{CIRCLE_MARK_CSS}</style>
      <style>{PLACE_CARD_CSS}</style>
      <style>{VET_CSS}</style>
      {items.map((v) => {
        const hours = hoursLabel(v, s, now);
        return (
          <Marker key={`vet-${v.id}`} position={v.at} icon={icon(v, zoom)} zIndexOffset={v.sos ? -400 : -500} title={v.name} eventHandlers={{ popupopen: () => askDrive(v) }}>
            <Popup className="poi-popup vm-popup" closeButton={false} autoPanPaddingTopLeft={PAN_TL} autoPanPaddingBottomRight={PAN_BR}>
              <div className="pcard">
                <div className="vm-photo">
                  <img className="pcard-photo" src={v.photo} alt="" loading="lazy" decoding="async" />
                  {me && (
                    <span className="vm-eta">{drive[v.id] ? etaLabel(drive[v.id], loc) : s('pack.sos.er.airKm', { km: Math.round(distanceKm(me, v.at)) })}</span>
                  )}
                </div>
                <div className="pcard-body">
                  <div className="pcard-kind">{s(v.sos ? 'pack.sos.er.title' : 'pack.sos.er.mapKind')}</div>
                  <div className="pcard-name">{v.name}</div>
                  <div className="pcard-meta">{v.address}</div>
                  <span className={`vm-pill${hours.on ? ' on' : ''}`}>{hours.text}</span>
                  {v.google && v.googleUrl && (
                    <a className="vm-g" href={v.googleUrl} target="_blank" rel="noopener noreferrer">
                      {v.google.rating.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      <img src="/nav-apps/google-g.svg" alt="Google" />
                      {v.google.count ? <>· {reviews(v.google.count, s, loc)}</> : null}
                    </a>
                  )}
                  {!v.google && v.googleUrl && (
                    <a className="vm-g" href={v.googleUrl} target="_blank" rel="noopener noreferrer">
                      <img src="/nav-apps/google-g.svg" alt="" />{s('pack.sos.er.mapGoogle')}
                    </a>
                  )}
                  <div className="vm-acts">
                    {v.tels.map((t) => (
                      <a key={t} className="pk-b3 pk-b3--lapis vm-btn" href={`tel:${t.replace(/\s/g, '')}`}>{t}</a>
                    ))}
                    {!v.tels.length && <p className="pcard-empty">{s('pack.sos.er.mapNoTel')}</p>}
                    {v.navUrl && (
                      <a className="pk-b3 pk-b3--paper vm-btn" href={v.navUrl} target="_blank" rel="noopener noreferrer">{s('pack.sos.er.navBtn')}</a>
                    )}
                    {v.sos && (
                      <button type="button" className="pk-b3 pk-b3--red vm-btn" onClick={() => navigate('/pack/sos/pohotovost')}>{s('pack.sos.er.mapSos')}</button>
                    )}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

/** Bublina preberá papyrusový rám od `.poi-popup` (PoiLayer); tu je len to, čo má veterinár navyše. */
const VET_CSS = `
.vm-popup .leaflet-popup-content-wrapper{background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.tile}px;box-shadow:${T.panelShadow};padding:0;overflow:hidden;}
.vm-popup .leaflet-popup-content{margin:0;padding:0;width:auto!important;min-width:260px;}
.vm-popup .leaflet-popup-tip{background:${T.cardGrad};border:1.5px solid ${T.cardEdge};}
.vm-popup a.leaflet-popup-close-button{display:none;}
.mk-sticker.vm-sos{filter:drop-shadow(0 0 2px ${T.sosRed}) drop-shadow(0 0 2px ${T.sosRed});}
.vm-247{position:absolute;left:0;transform:translateX(-50%);pointer-events:none;font-style:normal;font-family:${FONT_UI};font-weight:600;font-size:${TX.micro}px;line-height:1;white-space:nowrap;
  padding:${S.xs}px ${S.xs}px;border-radius:${PACK_R.pill}px;color:#fff;background:${T.sosRed};border:1.5px solid var(--p3d-paper-hi);}
.vm-photo{position:relative;}
.vm-eta{position:absolute;left:${S.sm}px;top:${S.sm}px;display:inline-flex;align-items:center;min-height:24px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;background:${AINUBIS.ctaGrad};color:${T.inkStrong};font-size:${TX.label}px;line-height:1.2;font-weight:600;white-space:nowrap;}
.vm-pill{align-self:flex-start;display:inline-flex;align-items:center;min-height:24px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;
  font-size:${TX.micro}px;font-weight:600;letter-spacing:.02em;line-height:1.2;background:${T.tileBg};border:1px solid ${T.cardEdge};color:${T.inkWarm};}
.vm-pill.on{background:${T.growGreen};border-color:${T.growGreen};color:#fff;}
.vm-g{align-self:flex-start;display:inline-flex;align-items:center;gap:${S.xs}px;font-size:${TX.label}px;font-weight:600;line-height:1.35;color:${T.inkStrong};text-decoration:underline;white-space:nowrap;}
.vm-g img{display:block;width:14px;height:14px;}
.vm-acts{display:flex;flex-direction:column;gap:${S.md}px;margin-top:${S.sm}px;padding-bottom:${S.sm}px;}
.vm-acts .vm-btn{min-height:48px;padding:0 ${S.md}px;font-size:${TX.lead}px;}
.vm-acts a.vm-btn{color:var(--b3-i);}
`;
