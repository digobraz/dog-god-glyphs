// NAHLÁSIŤ NEBEZPEČENSTVO: označ miesto (nákres scr 4+5 týranie, scr 8 otrava). Jeden súbor, dva režimy.
//   mode='abuse'  → `/pack/sos/nebezpecenstvo/tyranie/miesto` (21. 11. 2026): miesto + podnet v JEDNOM kroku: presný bod, pilulky „Čo sa deje“ (povinná aspoň jedna),
//                   jedno pole „vlastnými slovami“, fotky, telefón povinný, kým krajina nie je s istotou mimo SK/CZ (neznáma = SK). Po `dangerReport` ide hneď aj podnet úradu (`dangerComplaintCreate`, AUTO); „Odoslané“ na tej istej stránke.
//   mode='poison' → `/pack/sos/nebezpecenstvo/otrava`: bod + okruh 100–500 m (predvoľba 150), chipy, text, fotky; značka ide na mapu HNEĎ.
// Kôš 3 (SosTaskShell). Backend VÝHRADNE `lib/danger.ts`. Mapa = dlaždice Mapy.com ako `PackSosNew` (rgeocode vzor `PackSosNew.tsx` `pick`).
// Exporty `DangerMap`, `useGeoPick`, `DANGER_FORM_CSS` používa aj `PackDangerNature`.
// Ikonky len existujúce samolepky (SysIcon): foto `foto`, odstrániť `krizik`; emoji žiadne.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAPY_API_KEY, MAPY_BASE, mapyTiles } from '@/lib/env';
import { useLang } from '@/i18n/LanguageContext';
import { countryISO3 } from '@/lib/countryGeo';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { SysIcon } from '@/components/pack/SysIcon';
import { uploadDangerPhoto } from '@/services/cloudinaryService';
import {
  DANGER_POISON_CHIPS, DANGER_RADIUS, dangerComplaintCreate, dangerErrorCode, dangerIsOffline, dangerLastPhone, dangerPrecheck, dangerReport,
  type DangerGate, type DangerKind,
} from '@/lib/danger';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import type { SosKey } from '../sosTexts';
import { CharCount, addImageFiles, cleanPhone, clearDraft, loadDraft, regionOf, saveDraft, useArmed, useFieldErr, useSubmitLock } from './dangerForm';

const SK_CENTER: [number, number] = [48.7, 19.7];
const MAX_PHOTOS = 5;
const HOME_COUNTRIES = ['SVK', 'CZE'];
// pilulky „Čo sa deje“ pri týraní (Matej 21. 11. 2026): server `what` tieto hodnoty pozná
const ABUSE_PILLS = ['beating', 'dog_fights', 'puppy_mill', 'other'] as const;

// ── MAPA S JEDNÝM BODOM (a voliteľným okruhom v skutočných metroch) ──────────────────────────────
export function DangerMap({ center, zoom, pt, radius, onPick, locateTick, onTiles }: {
  center: [number, number]; zoom: number; pt: [number, number] | null; radius?: number | null;
  onPick: (p: [number, number]) => void; locateTick: number;
  /** `false` = dlaždice sa nenačítali (offline, zlý kľúč), `true` = prvá dlaždica prišla */
  onTiles?: (ok: boolean) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onTilesRef = useRef(onTiles);
  onTilesRef.current = onTiles;

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false }).setView(center, zoom);
    L.control.zoom({ position: 'topright' }).addTo(map);
    const tiles = L.tileLayer(mapyTiles('outdoor'), { maxZoom: 19 }).addTo(map);
    let loaded = 0; let failed = 0;
    tiles.on('tileload', () => { loaded++; onTilesRef.current?.(true); });
    tiles.on('tileerror', () => { failed++; if (!loaded && failed >= 3) onTilesRef.current?.(false); });
    layer.current = L.layerGroup().addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => onPickRef.current([e.latlng.lat, e.latlng.lng]));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stred zvonku (GPS) — nie pri každom prekreslení
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    map.setView(center, Math.max(zoom, map.getZoom()));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, locateTick]);

  // značka (+ okruh); prvý výber z ďalekého zoomu priblíži na miesto
  useEffect(() => {
    const map = mapRef.current; const g = layer.current;
    if (!map || !g) return;
    g.clearLayers();
    if (!pt) return;
    if (radius) L.circle(pt, { radius, color: T.sosRed, weight: 2, fillColor: T.sosRed, fillOpacity: 0.2, interactive: false }).addTo(g);
    L.circleMarker(pt, { radius: 7, color: '#fff', weight: 2, fillColor: T.sosRed, fillOpacity: 1, interactive: false }).addTo(g);
    if (map.getZoom() < 13) map.setView(pt, 15);
  }, [pt, radius]);

  return <div className="dgr-canvas" ref={el} />;
}

// ── VÝBER MIESTA: bod + reverzný geokód (obec, okres, adresa, krajina) + moja poloha ──────────────
export interface GeoPick { place: string; municipality: string | null; district: string | null; country: string | null }
const EMPTY_GEO: GeoPick = { place: '', municipality: null, district: null, country: null };

type RgItem = {
  name?: string; location?: string;
  regionalStructure?: Array<{ name?: string; type?: string; isoCode?: string }>;
};

export interface GeoInit { pt?: [number, number] | null; geo?: Partial<GeoPick> | null }

export function useGeoPick(init?: GeoInit | null) {
  const { lang } = useLang();
  const [pt, setPt] = useState<[number, number] | null>(init?.pt ?? null);
  const [geo, setGeo] = useState<GeoPick>({ ...EMPTY_GEO, ...(init?.geo ?? {}) });
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [locateTick, setLocateTick] = useState(0);
  const [locErr, setLocErr] = useState<'fail' | 'denied' | null>(null);
  // `fail` = reverzný geokód nič nenašiel alebo zlyhal ⇒ obec si človek napíše sám
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ok' | 'fail'>(init?.pt ? (init?.geo?.municipality ? 'ok' : 'fail') : 'idle');
  const [tilesFail, setTilesFail] = useState(false);
  const seq = useRef(0);
  const touched = useRef(!!init?.geo?.place);

  const pick = useCallback((p: [number, number]) => {
    setPt(p);
    setGeoState('loading');
    const my = ++seq.current;
    fetch(`${MAPY_BASE}/v1/rgeocode?lat=${p[0]}&lon=${p[1]}&lang=${lang}&apikey=${MAPY_API_KEY}`)
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((d) => {
        if (my !== seq.current) return;   // novší klik medzitým
        const it: RgItem | undefined = d?.items?.[0];
        const rs = it?.regionalStructure ?? [];
        const muni = rs.find((x) => x.type === 'regional.municipality')?.name ?? null;
        const reg = rs.find((x) => x.type === 'regional.region')?.name ?? null;
        const district = reg ? reg.replace(/^(mesto\s+)?okres\s+/i, '').trim() : null;
        const iso = rs.find((x) => x.type === 'regional.country')?.isoCode;
        const name = String(it?.name || '');
        const place = name && muni && !name.includes(muni) ? `${name}, ${muni}` : (name || muni || '');
        setGeo((g) => ({ place: touched.current ? g.place : place, municipality: muni, district, country: iso ? countryISO3(iso) : null }));
        setGeoState(muni ? 'ok' : 'fail');
      })
      .catch(() => {
        if (my !== seq.current) return;
        // starý údaj o obci patril predošlému bodu: pri novom bode, ktorý sa nepodarilo zistiť, ho zahodíme
        setGeo((g) => ({ ...g, municipality: null, district: null, country: null }));
        setGeoState('fail');
      });
  }, [lang]);

  const locate = useCallback(() => {
    setLocErr(null);
    if (!navigator.geolocation) { setLocErr('fail'); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { const q: [number, number] = [p.coords.latitude, p.coords.longitude]; setGps(q); setLocateTick((n) => n + 1); pick(q); },
      (e) => setLocErr(e.code === 1 ? 'denied' : 'fail'),
      { timeout: 10000, enableHighAccuracy: true });
  }, [pick]);

  const setPlace = (place: string) => { touched.current = true; setGeo((g) => ({ ...g, place })); };
  // ručne napísaná obec, keď ju geokódovanie nenašlo
  const setMunicipality = (municipality: string) => setGeo((g) => ({ ...g, municipality: municipality || null }));
  // krajinu, ktorú geokód nezistil, vyberá človek (nikdy sa nehádá): 'OTHER' = iná než SK a CZ
  const setCountry = (country: string) => setGeo((g) => ({ ...g, country: country || null }));
  const center = useMemo<[number, number]>(() => gps ?? init?.pt ?? SK_CENTER, [gps]); // eslint-disable-line react-hooks/exhaustive-deps
  const zoom = gps || init?.pt ? 15 : 7;
  const onTiles = useCallback((ok: boolean) => setTilesFail(!ok), []);
  return { pt, geo, center, zoom, locateTick, locErr, pick, locate, setPlace, setMunicipality, setCountry, geoState, tilesFail, onTiles };
}

/** Veta pod mapou: ktorý bod je zvolený (súradnice), a čo robiť, keď mapa alebo adresa nefunguje. Funguje aj bez dlaždíc. */
export function GeoStatus({ pt, geoState, tilesFail, municipality, onMunicipality, muniRef, muniBad, country, onCountry, countryRef, countryBad }: {
  pt: [number, number] | null; geoState: 'idle' | 'loading' | 'ok' | 'fail'; tilesFail: boolean;
  /** `onMunicipality` bez hodnoty = obec sa nepýta (príroda ide cez `addMapNote` bez obce) */
  municipality?: string | null; onMunicipality?: (v: string) => void;
  muniRef?: (el: HTMLElement | null) => void; muniBad?: boolean;
  /** výber krajiny, keď ju geokód nezistil (`country` = vybraté, `onCountry` = zmena) */
  country?: string | null; onCountry?: (v: string) => void; countryRef?: (el: HTMLElement | null) => void; countryBad?: boolean;
}) {
  const s = useSosT();
  const needMuni = !!pt && geoState === 'fail' && !!onMunicipality;
  const needCountry = !!pt && !!onCountry && geoState !== 'loading' && !country;
  return (
    <>
      {tilesFail && <p className="dgr-note dgr-note--red">{s('pack.sos.danger.report.tilesFail')}</p>}
      {pt && <p className="sos-small">{s('pack.sos.danger.report.picked', { lat: pt[0].toFixed(5), lng: pt[1].toFixed(5) })}</p>}
      {needCountry && (
        <>
          {!needMuni && <p className="dgr-note dgr-note--red">{s('pack.sos.danger.report.countryAsk')}</p>}
          <label className="sos-field"><span>{s('pack.sos.danger.report.countryPick')}</span>
            <select ref={countryRef} className={`pf-field${countryBad ? ' is-bad' : ''}`} value="" onChange={(e) => onCountry?.(e.target.value)}>
              <option value="">{s('pack.sos.danger.country.pickPh')}</option>
              <option value="SVK">{s('pack.sos.danger.complaint.countrySK')}</option>
              <option value="CZE">{s('pack.sos.danger.complaint.countryCZ')}</option>
              <option value="OTHER">{s('pack.sos.danger.country.other')}</option>
            </select>
          </label>
        </>
      )}
      {needMuni && (
        <>
          <p className="dgr-note dgr-note--red">{s('pack.sos.danger.report.geoFail')}</p>
          <label className="sos-field"><span>{s('pack.sos.danger.report.muni')}</span>
            <input ref={muniRef} className={`pf-field${muniBad ? ' is-bad' : ''}`} value={municipality ?? ''} maxLength={120} autoComplete="address-level2" placeholder={s('pack.sos.danger.report.muniHint')} onChange={(e) => onMunicipality?.(e.target.value)} />
          </label>
        </>
      )}
    </>
  );
}

// ── FOTKY: ≤5, zmenšené na webp a nahraté do `danger/` až pri odoslaní ──────────────────────────
async function toWebp(file: File, maxSide = 1600): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('img')); i.src = url; });
    const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error('blob'))), 'image/webp', 0.85));
  } finally { URL.revokeObjectURL(url); }
}

// Už nahraté súbory sa pri opakovanom odoslaní (zamietnutie serverom) NEnahrávajú znova: inak by na Cloudinary ostali siroty.
const UPLOADED = new WeakMap<File, string>();

export async function uploadDangerFiles(files: File[]): Promise<string[]> {
  const stamp = Date.now().toString(36);
  const out: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const done = UPLOADED.get(files[i]);
    if (done) { out.push(done); continue; }
    const blob = await toWebp(files[i]);
    const r = await uploadDangerPhoto(blob, `${stamp}-${i}-${Math.random().toString(36).slice(2, 8)}`);
    UPLOADED.set(files[i], r.secureUrl);
    out.push(r.secureUrl);
  }
  return out;
}

export const DANGER_FORM_CSS = `
.dgr-map{position:relative;width:100%;height:280px;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px solid ${T.border};}
.dgr-map.is-bad{border:2px solid ${T.sosRed};}
.dgr-bad{outline:2px solid ${T.sosRed};outline-offset:${S.xs}px;border-radius:${PACK_R.tile}px;}
.dgr-canvas{position:absolute;inset:0;cursor:crosshair;}
.dgr-loc{position:absolute;left:${S.sm}px;top:${S.sm}px;z-index:800;width:auto;background:${T.card};}
.dgr-chip{min-height:40px;padding:0 ${S.md}px;font-size:${PACK_TEXT.label}px;font-weight:500;}
.dgr-ta{width:100%;}
.dgr-range{width:100%;accent-color:${T.sosRed};}
.dgr-photos{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.dgr-ph{position:relative;width:72px;height:72px;border-radius:${PACK_R.tile}px;overflow:hidden;border:1.5px solid ${T.cardEdge};background:${T.tileBg};}
.dgr-ph img.dgr-th{width:100%;height:100%;object-fit:cover;display:block;}
.dgr-ph button{position:absolute;right:${S.xs}px;top:${S.xs}px;display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:${PACK_R.pill}px;background:${T.card};cursor:pointer;}
.dgr-note{margin:0;padding:${S.md}px;border-radius:${PACK_R.tile}px;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkStrong};border:1.5px solid ${T.cardEdge};background:${T.tileBg};}
.dgr-note--red{border-color:${T.sosRed};color:${T.sosRedDark};font-weight:500;}
.dgr-ai{border:1.5px solid ${AINUBIS.edgeStrong};}
.dgr-ai b{font-size:${PACK_TEXT.body}px;color:${T.inkStrong};}
.dgr-ai b span{color:${AINUBIS.cyan};}
.dgr-tl{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.md}px;font-size:${PACK_TEXT.body}px;line-height:1.45;}
.dgr-links{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.dgr-links button{all:unset;cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;font-weight:600;color:${T.inkStrong};text-decoration:underline;text-underline-offset:2px;}
`;

const ERRS = ['bad_coords', 'rate_limited', 'no_access', 'bad_text', 'not_authenticated'];
const BODY_MAX = 1200;

interface ReportDraft {
  pt: [number, number] | null; geo: GeoPick; what: string[]; body: string; radius: number; photoCount: number;
}

export default function PackDangerReport({ mode }: { mode: 'abuse' | 'poison' }) {
  const s = useSosT();
  const navigate = useNavigate();
  const back = useBack('/pack/sos/nebezpecenstvo');
  const kind: DangerKind = mode;
  const draftKey = `report.${mode}`;
  // rozpísané sa vráti po „späť → vpred“ aj po obnovení stránky (sessionStorage); fotky sa obnoviť nedajú
  const draft = useMemo(() => loadDraft<ReportDraft>(draftKey), [draftKey]);
  const { pt, geo, center, zoom, locateTick, locErr, pick, locate, setPlace, setMunicipality, setCountry, geoState, tilesFail, onTiles } = useGeoPick(draft ? { pt: draft.pt ?? null, geo: draft.geo ?? null } : null);
  const [what, setWhat] = useState<string[]>((draft?.what ?? []).filter((c) => (mode === 'abuse' ? (ABUSE_PILLS as readonly string[]) : DANGER_POISON_CHIPS as readonly string[]).includes(c)));
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState<'sent' | 'fail' | null>(null);
  const [body, setBody] = useState(draft?.body ?? '');
  const [radius, setRadius] = useState<number>(draft?.radius ?? DANGER_RADIUS.def);
  const [files, setFiles] = useState<File[]>([]);
  // koľko fotiek malo rozpísané pred obnovením (fotky sa obnoviť nedajú, veta to povie)
  const [lostPhotos] = useState(Math.max(0, Number(draft?.photoCount) || 0));
  const [photoMsg, setPhotoMsg] = useState('');
  const [busy, setBusy] = useState<'upload' | 'send' | null>(null);
  const [err, setErr] = useState('');
  const [gate, setGate] = useState<DangerGate>('ok');
  const [errLink, setErrLink] = useState(false);
  const lock = useSubmitLock();
  const fe = useFieldErr();
  const [sent, setSent] = useState<{ id: string; slug: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const chips: readonly string[] = mode === 'abuse' ? ABUSE_PILLS : DANGER_POISON_CHIPS;
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // predbežná kontrola hneď pri vstupe: nečlen alebo odhlásený sa to dozvie PRED vyplnením, nie po ňom
  useEffect(() => {
    let alive = true;
    dangerPrecheck(kind).then((g) => { if (alive && g !== 'offline') setGate(g); });
    return () => { alive = false; };
  }, []);

  // telefón z posledného podnetu (ako `PackDangerComplaint`)
  useEffect(() => { dangerLastPhone().then((p) => p && setPhone((x) => x || p)).catch(() => undefined); }, []);

  // rozpísané do sessionStorage (po odoslaní sa zmaže)
  const snap = { pt, geo, what, body, radius, photoCount: files.length || lostPhotos } satisfies ReportDraft;
  const snapRef = useRef(snap);
  snapRef.current = snap;
  useEffect(() => {
    if (sent) return;
    saveDraft(draftKey, snap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent, draftKey, pt, geo, what, body, radius, files.length, lostPhotos]);
  // aj pri zatvorení karty / obnovení: posledný stav (napr. písmeno napísané tesne pred reloadom)
  const sentRef = useRef(false);
  sentRef.current = !!sent;
  useEffect(() => {
    const h = () => { if (!sentRef.current) saveDraft(draftKey, snapRef.current); };
    window.addEventListener('pagehide', h);
    return () => window.removeEventListener('pagehide', h);
  }, [draftKey]);

  const toggle = (c: string) => { fe.clear('what'); toggleWhat(c); };
  const toggleWhat = (c: string) => setWhat((w) => (w.includes(c) ? w.filter((x) => x !== c) : [...w, c]));
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    // 🔴 `FileList` je ŽIVÝ: vyčistením `input.value` sa vyprázdni, preto ho skopíruj do poľa HNEĎ, pred čímkoľvek iným
    const picked = Array.from(list);
    if (fileRef.current) fileRef.current.value = '';
    const r = addImageFiles(files, picked, MAX_PHOTOS);
    setFiles(r.files);
    setPhotoMsg(r.notImage ? s('pack.sos.danger.report.err.fileType') : r.tooMany ? s('pack.sos.danger.report.err.photoMax') : '');
  };

  const armed = useArmed(!!sent);
  const fail = (field: string | null, msg: string, link = false) => {
    setErr(msg); setErrLink(link);
    if (field) fe.flag(field);
  };

  // týranie: neznáma krajina = SK, podnet úradu ide všade okrem istého OTHER
  const abuseHome = geo.country ? regionOf(geo.country) !== 'OTHER' : true;
  const submit = () => lock(async () => {
    if (busy) return;
    if (gate !== 'ok') { window.scrollTo?.({ top: 0, behavior: 'smooth' }); return; }
    setErrLink(false); fe.clear();
    if (!pt) { fail('map', s('pack.sos.danger.report.err.bad_coords')); return; }
    if (!what.length) { fail('what', s('pack.sos.danger.report.err.what')); return; }
    if (mode === 'abuse' && body.trim().length < 5) { fail('body', s('pack.sos.danger.report.err.ownWords')); return; }
    // krajinu NEHÁDAME (žiadne `?? 'SVK'`): kým ju geokód nezistil, vyberá ju človek
    // pri týraní ostáva neznáma krajina ako SK (telefón a podnet sa ukazujú vždy, kým nie je mimo SK/CZ); otrava krajinu stále vyžaduje
    if (!geo.country && mode !== 'abuse') { fail('country', s('pack.sos.danger.report.err.country')); return; }
    if (geo.country === 'OTHER') { fail('country', s('pack.sos.danger.report.otherCountry'), true); return; }
    if (geoState === 'fail' && !geo.municipality?.trim()) { fail('muni', s('pack.sos.danger.report.err.muni')); return; }
    // podnet úradu ide pri týraní VŽDY (SK/CZ): telefón je povinný ešte pred odoslaním
    const tel = mode === 'abuse' && abuseHome ? cleanPhone(phone) : null;
    if (mode === 'abuse' && abuseHome && !tel) { fail('phone', s('pack.sos.danger.complaint.err.phone')); return; }
    setErr('');
    setBusy('send');
    try {
      // pred nahrávaním fotiek: server odmietne nečlena a limit až po nahraní, a na Cloudinary by ostala sirota
      const g = await dangerPrecheck(kind);
      if (g === 'offline') { setErr(s('pack.sos.offline')); return; }   // nenahrávaj, koncept ostáva
      if (g !== 'ok') { setGate(g); window.scrollTo?.({ top: 0 }); return; }
      let photos: string[] = [];
      try {
        if (files.length) { setBusy('upload'); photos = await uploadDangerFiles(files); }
      } catch { setErr(s('pack.sos.danger.report.err.photo')); return; }
      setBusy('send');
      try {
        const r = await dangerReport({
          kind, lat: pt[0], lng: pt[1], country: geo.country ?? 'SVK',
          place_label: geo.place.trim() || null, municipality: geo.municipality?.trim() || null, district: geo.district,
          radius_m: mode === 'poison' ? radius : null, what,
          how_often: null, body: body.trim() || null, photos,
        });
        if (tel) {
          // prípad je už uložený: keď podnet zlyhá, ukáže sa „Odoslané“ s jemnou hláškou a odkazom na /podnet?case=<id>
          try {
            await dangerComplaintCreate({
              case_id: r.id, country: (geo.country ?? 'SK') === 'CZE' ? 'CZ' : 'SK',
              place_label: geo.place.trim() || geo.municipality?.trim() || `${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}`,
              authority_code: 'AUTO', raw: body.trim(), phone: tel, sign_name: null, cc_linka: regionOf(geo.country) === 'SK', photos,
            });
            setComplaint('sent');
          } catch { setComplaint('fail'); }
        }
        clearDraft(draftKey);
        sentRef.current = true;
        setSent(r);
        window.scrollTo?.({ top: 0 });
      } catch (x) {
        const code = dangerErrorCode(x);
        if (code === 'bad_coords') { fail('map', s('pack.sos.danger.report.err.place'), true); return; }   // bod je vybraný, server ho neprijal
        setErr(dangerIsOffline(x) ? s('pack.sos.offline') : ERRS.includes(code) ? s(`pack.sos.danger.report.err.${code}` as SosKey) : s('pack.sos.danger.report.err.error'));
        if (code === 'bad_text') fe.flag('body');
      }
    } finally { setBusy(null); }
  });

  // ── PO ODOSLANÍ (scr 5): ostáva sa na tej istej stránke ────────────────────────────────────
  if (sent) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <style>{DANGER_FORM_CSS}</style>
        <h1 className="sos-h2">{s('pack.sos.danger.report.sent')}</h1>
        {mode === 'abuse' ? (
          <>
            <p className="sos-p">{s('pack.sos.danger.report.sentThanks')}</p>
            {complaint === 'sent' && (
              <SosCard>
                <p className="sos-eyebrow">{s('pack.sos.danger.complaint.nextEyebrow')}</p>
                <ul className="dgr-tl">
                  <li>{s('pack.sos.danger.complaint.t0auto')}</li>
                  <li>{s('pack.sos.danger.complaint.t3')}</li>
                  <li>{s(geo.country === 'CZE' ? 'pack.sos.danger.complaint.t7cz' : 'pack.sos.danger.complaint.t7')}</li>
                </ul>
              </SosCard>
            )}
            {complaint === 'fail' && (
              <>
                <p className="dgr-note">{s('pack.sos.danger.report.sentComplaintFail')}</p>
                <button type="button" className="sos-cta" disabled={!armed} onClick={() => navigate(`/pack/sos/nebezpecenstvo/podnet?case=${sent.id}`)}>{s('pack.sos.danger.report.sentComplaintRetry')}</button>
              </>
            )}
            <SosCard>
              <p className="sos-p">{s('pack.sos.danger.report.sent.poster')}</p>
              <button type="button" className="sos-cta sos-cta--ghost" disabled={!armed} onClick={() => navigate(`/pack/sos/nebezpecenstvo/p/${sent.id}/plagat`)}>{s('pack.sos.danger.report.sent.posterBtn')}</button>
            </SosCard>
            <button type="button" className={`sos-cta${complaint === 'fail' ? ' sos-cta--ghost' : ''}`} disabled={!armed} onClick={() => navigate('/pack/sos/nebezpecenstvo', { replace: true })}>{s('pack.sos.danger.complaint.done')}</button>
          </>
        ) : (
          <>
            <SosCard className="dgr-ai">
              <b><span>AI</span>NUBIS</b>
              <p className="sos-p">{s(regionOf(geo.country) === 'OTHER' ? 'pack.sos.danger.report.sent.poison.other' : 'pack.sos.danger.report.sent.poison')}</p>
            </SosCard>
            <button type="button" className="sos-cta" disabled={!armed} onClick={() => navigate(`/pack/sos/nebezpecenstvo/p/${sent.id}`)}>{s('pack.sos.danger.report.sent.open')}</button>
          </>
        )}
      </SosTaskShell>
    );
  }

  const outside = !!geo.country && !HOME_COUNTRIES.includes(geo.country);
  const showComplaint = mode === 'abuse' && abuseHome;
  const locText = locErr === 'denied' ? s('pack.sos.danger.report.locDenied') : locErr === 'fail' ? s('pack.sos.danger.report.locFail') : '';
  const label = busy === 'upload' ? s('pack.sos.danger.report.uploading') : busy === 'send' ? s('pack.sos.danger.report.sending') : s(`pack.sos.danger.report.submit.${mode}` as SosKey);

  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{DANGER_FORM_CSS}</style>
      <style>{MAP_ATTR_CSS}</style>
      <h1 className="sos-h2">{s(`pack.sos.danger.report.title.${mode}` as SosKey)}</h1>
      {gate !== 'ok' && <p className="dgr-note dgr-note--red" role="alert">{s(`pack.sos.danger.report.err.${gate}` as SosKey)}</p>}

      <SosCard>
        <p className="sos-p">{s('pack.sos.danger.report.mapHint')}</p>
        <div className={`dgr-map${fe.bad === 'map' ? ' is-bad' : ''}`} ref={fe.reg('map')}>
          <DangerMap center={center} zoom={zoom} pt={pt} radius={mode === 'poison' ? radius : null} onPick={(p) => { fe.clear('map'); setErr(''); setErrLink(false); pick(p); }} locateTick={locateTick} onTiles={onTiles} />
          <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm dgr-loc" onClick={locate}>{s('pack.sos.danger.report.myLocation')}</button>
          <MapAttribution />
        </div>
        {locText && <p className="sos-err">{locText}</p>}
        <GeoStatus pt={pt} geoState={geoState} tilesFail={tilesFail} municipality={geo.municipality} onMunicipality={(v) => { fe.clear('muni'); setMunicipality(v); }} muniRef={fe.reg('muni')} muniBad={fe.bad === 'muni'}
          country={geo.country} onCountry={(v) => { fe.clear('country'); setErr(''); setCountry(v); }} countryRef={fe.reg('country')} countryBad={fe.bad === 'country'} />
        <label className="sos-field"><span>{s('pack.sos.danger.report.place')}</span>
          <input className="pf-field" value={geo.place} maxLength={200} placeholder={s('pack.sos.danger.report.placeHint')} onChange={(e) => setPlace(e.target.value)} />
        </label>
        {mode === 'abuse' && <p className="sos-small">{s('pack.sos.danger.report.exact')}</p>}
        {outside && (
          <>
            <p className="dgr-note">{s('pack.sos.danger.report.otherCountry')}</p>
            <div className="dgr-links"><button type="button" onClick={() => navigate('/pack/sos/nebezpecenstvo/krajina')}>{s('pack.sos.danger.report.otherCountryLink')}</button></div>
          </>
        )}
      </SosCard>

      <SosCard>
        <>
            <p className="sos-eyebrow">{s('pack.sos.danger.report.what')}</p>
            <div className={`sos-chips${fe.bad === 'what' ? ' dgr-bad' : ''}`} ref={fe.reg('what')}>
              {chips.map((c) => (
                <button key={c} type="button" className={`sos-pill sos-pick dgr-chip${what.includes(c) ? ' is-on' : ''}`} aria-pressed={what.includes(c)} onClick={() => toggle(c)}>
                  {s(`pack.sos.danger.report.${mode === 'abuse' ? 'pill' : 'chip'}.${c}` as SosKey)}
                </button>
              ))}
            </div>
        </>
        <label className="sos-field"><span>{s(mode === 'abuse' ? 'pack.sos.danger.report.ownWords' : 'pack.sos.danger.report.body')}</span>
          <textarea ref={fe.reg('body')} className={`pf-field dgr-ta${fe.bad === 'body' ? ' is-bad' : ''}`} rows={4} maxLength={BODY_MAX} value={body} onChange={(e) => { fe.clear('body'); setBody(e.target.value); }}
            placeholder={s(mode === 'abuse' ? 'pack.sos.danger.report.ownWordsPh' : 'pack.sos.danger.report.bodyPoison')} />
          <CharCount len={body.length} max={BODY_MAX} />
        </label>
        {mode === 'abuse' && <p className="sos-small">{s('pack.sos.danger.report.ownWordsHint')}</p>}
        {mode === 'poison' && (
          <label className="sos-field"><span>{s('pack.sos.danger.report.radius', { n: radius })}</span>
            <input className="dgr-range" type="range" min={DANGER_RADIUS.min} max={DANGER_RADIUS.max} step={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
            <small className="sos-small">{s('pack.sos.danger.report.radiusHint')}</small>
          </label>
        )}
      </SosCard>

      <SosCard>
        <p className="sos-eyebrow">{s('pack.sos.danger.report.photos')} · {s('pack.sos.danger.report.photoCount', { n: files.length })}</p>
        {files.length > 0 && (
          <div className="dgr-photos">
            {previews.map((u, i) => (
              <div className="dgr-ph" key={u}>
                <img className="dgr-th" src={u} alt="" />
                <button type="button" aria-label={s('pack.sos.danger.report.photoRemove')} onClick={() => { setFiles((f) => f.filter((_, j) => j !== i)); setPhotoMsg(''); }}><SysIcon name="krizik" size={16} /></button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        {files.length < MAX_PHOTOS && (
          <button type="button" className="sos-cta sos-cta--ghost" onClick={() => fileRef.current?.click()}>
            <SysIcon name="foto" size={24} />{s('pack.sos.danger.report.photoAdd')}
          </button>
        )}
        {photoMsg && <p className="sos-err" role="alert">{photoMsg}</p>}
        {lostPhotos > 0 && files.length === 0 && <p className="sos-small" role="status">{s('pack.sos.danger.report.photosLost', { n: lostPhotos })}</p>}
        <p className="sos-small">{s(`pack.sos.danger.report.photoPrivacy.${mode}` as SosKey)}</p>
      </SosCard>

      {showComplaint && (
        <SosCard>
          <p className="sos-p"><b>{s('pack.sos.danger.report.complaintAlways')}</b></p>
          <p className="sos-small">{s('pack.sos.danger.report.complaintWho')}{regionOf(geo.country ?? 'SVK') === 'SK' ? ` ${s('pack.sos.danger.report.complaintCopySK')}` : ''}</p>
          <label className="sos-field"><span>{s('pack.sos.danger.complaint.phone')}</span>
            <input ref={fe.reg('phone')} className={`pf-field${fe.bad === 'phone' ? ' is-bad' : ''}`} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={phone} onChange={(e) => { fe.clear('phone'); setPhone(e.target.value); }} />
          </label>
          <p className="sos-small">{s('pack.sos.danger.report.phoneHint')}</p>
        </SosCard>
      )}

      {mode === 'poison' && (
        <SosCard>
          <p className="sos-p"><b>{s('pack.sos.danger.report.poisonHelp')}</b></p>
          <div className="dgr-links">
            <button type="button" onClick={() => navigate('/pack/sos/prva-pomoc')}>{s('pack.sos.danger.report.firstAid')}</button>
            <button type="button" onClick={() => navigate('/pack/sos/pohotovost')}>{s('pack.sos.danger.report.er')}</button>
          </div>
        </SosCard>
      )}

      {err && <p className="sos-err" role="alert">{err}</p>}
      {errLink && <div className="dgr-links"><button type="button" onClick={() => navigate('/pack/sos/nebezpecenstvo/krajina')}>{s('pack.sos.danger.report.otherCountryLink')}</button></div>}
      <button type="button" className={`sos-cta${mode === 'poison' ? ' sos-cta--red' : ''}`} disabled={!!busy || gate !== 'ok'} onClick={submit}>{label}</button>
    </SosTaskShell>
  );
}
