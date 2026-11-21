// SOS — VYHLÁSENIE STRATY `/pack/sos/new` (kôš 3 · ROBÍM ÚLOHU: bez lišty, hore šípka späť a nič vpravo).
// Výber psa (`sosMyDogs`, hostia sú v ňom) · mapa s klikom, dva kruhy v skutočných metroch (500 m tmavý, 10 km svetlý)
// · lokalita · dátum a čas (nie v budúcnosti) · telefón predvyplnený · červené CTA. Po úspechu stránka psa.
// Mapa = rovnaký podklad ako PackMap (dlaždice Mapy.com cez `mapyTiles`, atribúcia `MapAttribution`).
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAPY_API_KEY, MAPY_BASE, mapyTiles } from '@/lib/env';
import { useLang } from '@/i18n/LanguageContext';
import { countryCentroid, countryISO3 } from '@/lib/countryGeo';
import { sizedUrl } from '@/services/cloudinaryService';
import { sosDeclare, sosLastPhone, sosMyDogs, sosResume, type SosDog } from '@/lib/sos';
import { sosInvalidate } from '@/components/pack/sosKit';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { APP_NEW } from '@/lib/packFlags';
import { changeDogMainPhoto } from '@/components/pack/profile/mePosts';
import { SosCard, isAuthError, loginPath, sosErrCode, sosPath, useBack, useSosAuth, useSosT } from './sosShared';
import { SosAvatarNone } from './sosNoPhoto';
import { SosTaskShell } from './SosTaskShell';
import type { SosKey } from './sosTexts';

const SK_CENTER: [number, number] = [48.7, 19.7];
// Pátranie funguje v Európe (server `sos_declare` drží rovnaké hranice a 60 dní): bod na Novom Zélande či 0/0 je preklep, nie strata.
const EUROPE = { lat: [34, 72], lng: [-25, 45] } as const;
const inEurope = (p: [number, number]) => p[0] >= EUROPE.lat[0] && p[0] <= EUROPE.lat[1] && p[1] >= EUROPE.lng[0] && p[1] <= EUROPE.lng[1];
const MAX_AGE_DAYS = 60;
const DAY_MS = 86_400_000;

// ROZPÍSANÉ SA NESMIE STRATIŤ: obnovenie stránky v paniku (zhasnutý displej, systém zabil kartu) vráti formulár. Len sessionStorage (zmizne so zatvorením karty),
// po odoslaní sa zmaže. Telefón sa nezapisuje trvale.
const DRAFT_KEY = 'dogypt.sos.new.v1';
type Draft = { dogId?: string | null; pt?: [number, number] | null; place?: string; placeTouched?: boolean; date?: string; time?: string; phone?: string; country?: string | null; skipPhoto?: string[] };
function readDraft(): Draft {
  try { const r = sessionStorage.getItem(DRAFT_KEY); return r ? (JSON.parse(r) as Draft) : {}; } catch { return {}; }
}
function writeDraft(d: Draft) { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* súkromné okno: koncept len v pamäti */ } }
function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* nič */ } }
// Okruh 10 km ako hranice mapy. NIE `L.circle(...).getBounds()` — kruh mimo mapy nemá `_map` a Leaflet spadne
// (Matej 20. 11.: klik do mapy aj Moja poloha = „Something went wrong“). `toBounds` berie stranu štvorca v metroch.
const ringBounds = (p: [number, number]) => L.latLng(p[0], p[1]).toBounds(20000);

const CSS = `
.sos-card.sos-card--flat{padding:${PACK_SPACE.sm}px 0;}
.sos-card.sos-card--flat:last-child{border-bottom:0;}
.sosn-dogs{display:flex;gap:${PACK_SPACE.sm}px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:${PACK_SPACE.xs}px 0;}
.sosn-dogs::-webkit-scrollbar{display:none;}
.sosn-dogs .sosn-dog{flex:0 0 auto;width:200px;scroll-snap-align:start;}
.sosn-dog{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.md}px ${PACK_SPACE.sm}px ${PACK_SPACE.sm}px;min-height:56px;
  border-radius:${PACK_R.tile}px;min-width:0;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;}
.sosn-dog > span:not(.sosn-av){flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;} /* písmo: meno */
.sosn-av{width:40px;height:40px;border-radius:${PACK_R.pill}px;object-fit:cover;background:${T.tileBg};border:2px solid ${T.cardEdge};flex:none;}
.sosn-av--none{display:flex;align-items:center;justify-content:center;overflow:hidden;}
.sosn-av--none img{width:68%;height:68%;object-fit:contain;display:block;opacity:.85;}
.sosn-map{position:relative;width:100%;height:320px;border-radius:${PACK_R.tile}px;overflow:hidden;border:1px solid ${T.border};}
.sosn-map .sosn-canvas{position:absolute;inset:0;cursor:crosshair;}
.sosn-loc{position:absolute;left:${PACK_SPACE.sm}px;top:${PACK_SPACE.sm}px;z-index:800;}
/* minmax(0,1fr) + min-width:0: iOS dáva dátumu a času vlastnú šírku väčšiu než stĺpec, s holým 1fr pole vytieklo z karty (Matej 5. 11.). */
.sosn-when{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${PACK_SPACE.sm}px;}
.sosn-when .sos-field{min-width:0;}
.sosn-when .pf-field{display:flex;align-items:center;height:48px;min-width:0;max-width:100%;-webkit-appearance:none;appearance:none;line-height:normal;}
/* DÁTUM A ČAS V iOS/ANDROID WEBVIEW (Matej 9. 11. 2026: „pri prihlásení pátrania dátum a čas na hornom okraji polička“).
   Natívne pole kreslí hodnotu do vnútorného prvku, ktorý pri min-height (bez pevnej výšky) sedí hore. Preto PEVNÁ výška
   (v šate Papyrus 3D 54, sosP3d.ts), flex na poli a vynulované okraje vnútorného prvku. */
.sosn-when .pf-field::-webkit-date-and-time-value{margin:0;min-height:0;text-align:left;display:flex;align-items:center;}
.sosn-when .pf-field::-webkit-datetime-edit{padding:0;margin:0;display:flex;align-items:center;}
.sosn-when .pf-field::-webkit-datetime-edit-fields-wrapper{padding:0;}
.sosn-when .pf-field::-webkit-calendar-picker-indicator{margin:0;}
.sosn-warn{margin:0;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.md}px;border-radius:${PACK_R.tile}px;background:${T.sosRedSoft};border:1px solid ${T.sosRed};}
.sosn-warn b{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.lead}px;line-height:1.3;color:${T.sosRedDark};}
.sosn-warn p{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkStrong};}
.sosn-need{margin:0;font-size:${PACK_TEXT.body}px;font-weight:600;line-height:1.4;color:${T.sosRedDark};}
.sosn-swatch{display:inline-block;width:12px;height:12px;border-radius:${PACK_R.pill}px;border:1px solid ${T.sosRed};vertical-align:-1px;margin-right:${PACK_SPACE.xs}px;}
`;

const pad = (n: number) => String(n).padStart(2, '0');
const todayStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeStr = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function PickMap({ center, zoom, pt, onPick, locateTick, onTiles }: {
  center: [number, number]; zoom: number; pt: [number, number] | null;
  onPick: (p: [number, number]) => void; locateTick: number;
  /** `false`, keď sa dlaždice nenačítali (bez siete, kľúč, blokátor); `true`, keď prišla aspoň jedna. */
  onTiles?: (ok: boolean) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layers = useRef<{ g: L.LayerGroup } | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const onTilesRef = useRef(onTiles);
  onTilesRef.current = onTiles;

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false }).setView(center, zoom);
    L.control.zoom({ position: 'topright' }).addTo(map);
    const tiles = L.tileLayer(mapyTiles('outdoor'), { maxZoom: 19 }).addTo(map);
    // Bez dlaždíc je mapa sivá plocha: človek nevidí, kam klikol. Hlási sa hore, formulár ukáže súradnice a výzvu napísať lokalitu.
    let loaded = 0; let failed = 0;
    tiles.on('tileload', () => { loaded++; onTilesRef.current?.(true); });
    tiles.on('tileerror', () => { failed++; if (!loaded && failed >= 3) onTilesRef.current?.(false); });
    const tilesTimer = window.setTimeout(() => { if (!loaded) onTilesRef.current?.(false); }, 8000);
    layers.current = { g: L.layerGroup().addTo(map) };
    map.on('click', (e: L.LeafletMouseEvent) => onPickRef.current([e.latlng.lat, e.latlng.lng]));
    mapRef.current = map;
    return () => { window.clearTimeout(tilesTimer); map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stred zvonku (GPS, výber psa) — nie pri každom prekreslení
  // Pri GPS sa ukáže CELÝ okruh 10 km s rezervou (Matej 19. 11.: kruh nesmie vyplniť celú mapu).
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    if (zoom >= 14) map.fitBounds(ringBounds(center), { padding: [PACK_SPACE.xl, PACK_SPACE.xl] });
    else map.setView(center, zoom);
  }, [center, zoom, locateTick]);

  // značka + dva kruhy v SKUTOČNÝCH METROCH (L.circle): 10 km svetlý pod 500 m tmavým
  useEffect(() => {
    const map = mapRef.current; const g = layers.current?.g;
    if (!map || !g) return;
    g.clearLayers();
    if (!pt) return;
    L.circle(pt, { radius: 10000, color: T.sosRed, weight: 1.5, opacity: 0.55, fillColor: T.sosRed, fillOpacity: 0.1, interactive: false }).addTo(g);
    L.circle(pt, { radius: 500, color: T.sosRed, weight: 2, fillColor: T.sosRed, fillOpacity: 0.35, interactive: false }).addTo(g);
    L.circleMarker(pt, { radius: 6, color: '#fff', weight: 2, fillColor: T.sosRed, fillOpacity: 1, interactive: false }).addTo(g);
    // celý 10 km kruh s rezervou; len ak je mapa bližšie (užívateľ si odzoomovať smie sám)
    const bounds = ringBounds(pt);
    const pad = L.point(PACK_SPACE.xl, PACK_SPACE.xl);
    if (map.getZoom() > map.getBoundsZoom(bounds, false, pad)) map.fitBounds(bounds, { padding: [PACK_SPACE.xl, PACK_SPACE.xl] });
  }, [pt]);

  return <div className="sosn-canvas" ref={el} />;
}

export default function PackSosNew() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const back = useBack('/pack/map');
  const [dogs, setDogs] = useState<SosDog[] | null>(null);
  const auth = useSosAuth();
  const draft0 = useMemo(readDraft, []);
  // chyba načítania ≠ „nemáš psa“; `auth` (chýba prihlásenie, 401) ≠ `net` (bez siete) ≠ `other` (server)
  const [dogsErr, setDogsErr] = useState<'' | 'auth' | 'net' | 'other'>('');
  const [tick, setTick] = useState(0);
  const [locErr, setLocErr] = useState('');
  const [pickCountry, setPickCountry] = useState<string | null>(draft0.country ?? null);   // ISO3 z miesta straty (rgeocode)
  const pickSeq = useRef(0);
  const [dogId, setDogId] = useState<string | null>(draft0.dogId ?? null);
  const [pt, setPt] = useState<[number, number] | null>(draft0.pt ?? null);
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [locateTick, setLocateTick] = useState(0);
  const [place, setPlace] = useState(draft0.place ?? '');
  const placeTouched = useRef(!!draft0.placeTouched);
  const [date, setDate] = useState(draft0.date || todayStr());
  const [time, setTime] = useState(draft0.time || timeStr());
  const [phone, setPhone] = useState(draft0.phone ?? '');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [mapFail, setMapFail] = useState(false);
  const [skipPhoto, setSkipPhoto] = useState<string[]>(draft0.skipPhoto ?? []);   // psi, pri ktorých človek vedome pokračuje bez fotky
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const sent = useRef(false);   // po odoslaní sa koncept už nezapisuje

  const dog = useMemo(() => dogs?.find((d) => d.id === dogId) ?? null, [dogs, dogId]);
  const s = useSosT(dog?.dog_gender);

  // rozpísané do sessionStorage (viď DRAFT_KEY)
  useEffect(() => {
    if (sent.current) return;
    writeDraft({ dogId, pt, place, placeTouched: placeTouched.current, date, time, phone, country: pickCountry, skipPhoto });
  }, [dogId, pt, place, date, time, phone, pickCountry, skipPhoto]);

  useEffect(() => {
    if (auth === 'loading') return;
    // Bez prihlásenia sa dotaz ani nepošle: server by vrátil 401 a vyzeralo by to ako „Bez pripojenia“.
    if (auth === 'out') { setDogs([]); return; }
    let alive = true;
    setDogsErr('');
    sosMyDogs().then((d) => {
      if (!alive) return;
      setDogs(d);
      setDogId((cur) => (cur && d.some((x) => x.id === cur) ? cur : (d.find((x) => !x.active_slug) ?? d[0])?.id ?? null));
    }).catch((e: unknown) => {
      if (!alive) return;
      setDogs([]);
      const msg = String((e as { message?: string } | null)?.message ?? '');
      setDogsErr(isAuthError(e) ? 'auth' : (typeof navigator !== 'undefined' && navigator.onLine === false) || /fetch|network|load failed/i.test(msg) ? 'net' : 'other');
    });
    sosLastPhone().then((p) => { if (alive && p) setPhone((cur) => cur || p); }).catch(() => {});
    // GPS len ak je už povolená — povolenie sa tu nevypytuje samo (tlačidlo MOJA POLOHA to robí vedome)
    (async () => {
      try {
        const st = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
        if (st?.state === 'granted') navigator.geolocation.getCurrentPosition(
          (p) => { if (alive) { setGps([p.coords.latitude, p.coords.longitude]); setLocateTick((n) => n + 1); } }, () => {}, { timeout: 8000 });
      } catch { /* bez Permissions API zostane stred krajiny */ }
    })();
    return () => { alive = false; };
  }, [tick, auth]);

  const center = useMemo<[number, number]>(() => gps ?? countryCentroid(dog?.country) ?? SK_CENTER, [gps, dog?.country]);
  const zoom = gps ? 14 : 7;

  // reverzný geokód: NÁVRH lokality (ručne napísané sa neprepisuje) + KRAJINA z miesta straty (isoCode → ISO3)
  const pick = useCallback((p: [number, number]) => {
    setPt(p);
    setPickCountry(null);
    setErrs((e) => { const { coords: _c, ...rest } = e; return rest; });
    const seq = ++pickSeq.current;
    fetch(`${MAPY_BASE}/v1/rgeocode?lat=${p[0]}&lon=${p[1]}&lang=${lang}&apikey=${MAPY_API_KEY}`)
      .then((r) => r.json())
      .then((d) => {
        if (seq !== pickSeq.current) return;   // novší klik medzitým
        const it = d?.items?.[0];
        if (it && !placeTouched.current) setPlace(String(it.name || it.location || ''));
        const iso = (it?.regionalStructure as Array<{ type?: string; isoCode?: string }> | undefined)?.find((x) => x.type === 'regional.country')?.isoCode;
        setPickCountry(iso ? countryISO3(iso) : null);
      })
      .catch(() => {});
  }, [lang]);

  // MOJA POLOHA: stred mapy + vybraný bod (a reverzný geokód). Zlyhanie / zamietnutie ukáže hlášku; Permissions API sa tu nepoužíva.
  const locate = () => {
    setLocErr('');
    if (!navigator.geolocation) { setLocErr(s('pack.sos.new.locFail')); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { const q: [number, number] = [p.coords.latitude, p.coords.longitude]; setGps(q); setLocateTick((n) => n + 1); pick(q); },
      (e) => setLocErr(e.code === 1 ? s('pack.sos.new.locDenied') : s('pack.sos.new.locFail')),
      { timeout: 10000, enableHighAccuracy: true });
  };

  const errText = (code: string) => {
    const k = `pack.sos.err.${code}` as SosKey;
    return ['bad_phone', 'bad_coords', 'bad_region', 'bad_time', 'too_old', 'rate_limited', 'no_access', 'bad_state'].includes(code) ? s(k) : s('pack.sos.error');
  };

  // HĽADÁM ĎALEJ pri psovi s ukončeným pátraním: obnoví tú istú stratu a otvorí jej stránku
  const resumeEnded = async () => {
    if (!dog?.ended_id || !dog.ended_slug || busy) return;
    setBusy(true);
    try {
      await sosResume(dog.ended_id);
      sosInvalidate();
      navigate(sosPath.page(dog.ended_slug), { replace: true });
    } catch (x) {
      setErrs({ resume: errText(sosErrCode(x)) });
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!dog || busy) return;
    const e: Record<string, string> = {};
    if (!pt) e.coords = s('pack.sos.err.bad_coords');
    else if (!inEurope(pt)) e.coords = s('pack.sos.err.bad_region');
    if (!place.trim()) e.place = s('pack.sos.err.place');
    const when = new Date(`${date}T${time || '00:00'}`);
    if (!date || Number.isNaN(when.getTime()) || when.getTime() > Date.now() + 5 * 60_000) e.when = s('pack.sos.err.bad_time');
    else if (when.getTime() < Date.now() - MAX_AGE_DAYS * DAY_MS) e.when = s('pack.sos.err.too_old');
    if (!phone.trim()) e.phone = s('pack.sos.err.bad_phone');
    // pes bez fotky: človek sa rozhodne vedome (pridá ju, alebo pokračuje bez nej), nie omylom
    if (!dog.photo && !skipPhoto.includes(dog.id)) e.photo = s('pack.sos.new.photoNeeded');
    setErrs(e);
    if (Object.keys(e).length || !pt) return;
    setBusy(true);
    try {
      const r = await sosDeclare({ dogId: dog.id, lat: pt[0], lng: pt[1], lastSeen: when, place: place.trim(), phone: phone.trim(), country: pickCountry });
      sent.current = true;
      clearDraft();
      sosInvalidate();
      navigate(sosPath.page(r.slug), { replace: true });
    } catch (x) {
      const code = sosErrCode(x);
      const map: Record<string, string> = { bad_phone: 'phone', bad_coords: 'coords', bad_region: 'coords', bad_time: 'when', too_old: 'when' };
      setErrs({ [map[code] ?? 'form']: errText(code) });
      setBusy(false);
    }
  };

  // Pridanie hlavnej fotky psa priamo z vyhlásenia: tá istá cesta ako Upraviť profil (`changeDogMainPhoto`), žiadne nové úložisko.
  const onPhoto = async (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    ev.target.value = '';
    if (!f || !dog || photoBusy) return;
    setPhotoBusy(true); setPhotoErr('');
    try {
      const url = await changeDogMainPhoto(dog.id, f);
      setDogs((ds) => (ds ?? []).map((x) => (x.id === dog.id ? { ...x, photo: url } : x)));
      setErrs((e) => { const { photo: _p, ...rest } = e; return rest; });
    } catch { setPhotoErr(s('pack.sos.new.photoFail')); }
    finally { setPhotoBusy(false); }
  };
  const needPhoto = !!dog && !dog.photo && !skipPhoto.includes(dog.id);
  const photoNote = !!dog && !dog.photo;

  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <style>{MAP_ATTR_CSS}</style>
      <SosCard flat={APP_NEW}>
        <h1 className="sos-h2">{s('pack.sos.new.title')}</h1>
        {auth === 'out' || dogsErr === 'auth' ? (
          // Bez prihlásenia: 401 nie je „Bez pripojenia“. Prvá pomoc a pohotovosť ostávajú dostupné bez účtu.
          <>
            <h2 className="sos-eyebrow">{s('pack.sos.login.title')}</h2>
            <p className="sos-p">{s('pack.sos.login.text')}</p>
            <button type="button" className="sos-cta" onClick={() => navigate(loginPath(sosPath.new))}>{s('pack.sos.login.btn')}</button>
          </>
        ) : dogs === null || auth === 'loading' ? <p className="sos-p">{s('pack.sos.loading')}</p> : dogsErr ? (
          <>
            <p className="sos-p">{dogsErr === 'net' ? s('pack.sos.offline') : s('pack.sos.error')}</p>
            <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>
          </>
        ) : dogs.length === 0 ? (
          <p className="sos-p">{s('pack.sos.new.noDogs')}</p>
        ) : (
          <>
            <div className="sosn-dogs">
              {dogs.map((d) => (
                <button key={d.id} type="button" className={`sosn-dog sos-pick${d.id === dogId ? ' is-on' : ''}`} aria-pressed={d.id === dogId} onClick={() => setDogId(d.id)}>
                  {d.photo ? <img className="sosn-av" src={sizedUrl(d.photo, 160)} alt="" /> : <SosAvatarNone breed={d.breed} cls="sosn-av" />}
                  <span>{d.dog_name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </SosCard>

      {dog?.active_slug ? (
        <SosCard flat={APP_NEW}>
          <p className="sos-p"><b>{dog.dog_name}</b> {s('pack.sos.new.searching')}</p>
          <button type="button" className="sos-cta" onClick={() => navigate(sosPath.page(dog.active_slug!))}>{s('pack.sos.new.openPage')}</button>
        </SosCard>
      ) : dog && (
        <>
          {dog.ended_slug && dog.ended_id && (
            <SosCard flat={APP_NEW}>
              <p className="sos-p"><b>{dog.dog_name}</b> · {s('pack.sos.new.endedHint')}</p>
              <button type="button" className="sos-cta" disabled={busy} onClick={resumeEnded}>{s('pack.sos.det.resume')}</button>
              {errs.resume && <p className="sos-err">{errs.resume}</p>}
            </SosCard>
          )}
          {photoNote && (
            <SosCard flat={APP_NEW}>
              <div className="sosn-warn" role="group" aria-label={s('pack.sos.new.noPhotoTitle')}>
                <b>{s('pack.sos.new.noPhotoTitle')}</b>
                <p>{s('pack.sos.new.noPhotoText')}</p>
                <button type="button" className="sos-cta" disabled={photoBusy} onClick={() => fileRef.current?.click()}>{photoBusy ? s('pack.sos.new.addingPhoto') : s('pack.sos.new.addPhoto')}</button>
                {needPhoto && <button type="button" className="sos-cta sos-cta--ghost" disabled={photoBusy} onClick={() => { setSkipPhoto((a) => [...a, dog.id]); setErrs((e) => { const { photo: _p, ...rest } = e; return rest; }); }}>{s('pack.sos.new.skipPhoto')}</button>}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
                {photoErr && <p className="sos-err">{photoErr}</p>}
              </div>
              {errs.photo && <p className="sos-err">{errs.photo}</p>}
            </SosCard>
          )}
          <SosCard flat={APP_NEW}>
            <h2 className="sos-h2">{s('pack.sos.new.mapTitle')}</h2>
            <p className="sos-p">{s('pack.sos.new.mapHint')}</p>
            <div className="sosn-map">
              <PickMap center={center} zoom={zoom} pt={pt} onPick={pick} locateTick={locateTick} onTiles={(ok) => setMapFail(!ok)} />
              <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm sosn-loc" style={{ width: 'auto', background: T.card }} onClick={locate}>{s('pack.sos.new.myLocation')}</button>
              <MapAttribution />
            </div>
            {locErr && <p className="sos-err">{locErr}</p>}
            {pt && <p className="sos-small" aria-live="polite">{s('pack.sos.new.picked', { coords: `${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}` })}</p>}
            {mapFail && <p className="sosn-warn" role="status">{s('pack.sos.new.mapFail')}</p>}
            <p className="sos-small"><i className="sosn-swatch" style={{ background: T.sosRed }} />{s('pack.sos.new.legend')}</p>
            {errs.coords && <p className="sos-err">{errs.coords}</p>}
            {mapFail && !place.trim() && <p className="sosn-need">{s('pack.sos.new.placeManual')}</p>}
            <label className="sos-field"><span>{s('pack.sos.new.place')}</span>
              <input className={`pf-field${errs.place || (mapFail && !place.trim()) ? ' is-bad' : ''}`} value={place} maxLength={200} placeholder={s('pack.sos.new.placeHint')}
                onChange={(e) => { placeTouched.current = true; setPlace(e.target.value); }} />
            </label>
            {errs.place && <p className="sos-err">{errs.place}</p>}
          </SosCard>

          <SosCard flat={APP_NEW}>
            <div>
              <p className="sos-eyebrow">{s('pack.sos.new.when')}</p>
              <div className="sosn-when">
                <label className="sos-field"><span>{s('pack.sos.new.date')}</span>
                  <input className={`pf-field${errs.when ? ' is-bad' : ''}`} type="date" value={date} min={todayStr(new Date(Date.now() - MAX_AGE_DAYS * DAY_MS))} max={todayStr()} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className="sos-field"><span>{s('pack.sos.new.time')}</span>
                  <input className={`pf-field${errs.when ? ' is-bad' : ''}`} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
              </div>
              {errs.when && <p className="sos-err">{errs.when}</p>}
            </div>
            <label className="sos-field"><span>{s('pack.sos.new.phone')}</span>
              <input className={`pf-field${errs.phone ? ' is-bad' : ''}`} type="tel" inputMode="tel" autoComplete="tel" value={phone} maxLength={20}
                onChange={(e) => setPhone(e.target.value)} placeholder="+421 900 000 000" />
            </label>
            {errs.phone ? <p className="sos-err">{errs.phone}</p> : <p className="sos-small">{s('pack.sos.new.phoneHint')}</p>}
          </SosCard>

          {errs.form && <p className="sos-err">{errs.form}</p>}
          <button type="button" className="sos-cta sos-cta--red" disabled={busy} onClick={submit}>{busy ? s('pack.sos.new.sending') : s('pack.sos.new.submit')}</button>
        </>
      )}
    </SosTaskShell>
  );
}
