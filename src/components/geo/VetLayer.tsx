// VRSTVA VETERINÁROV na mape — Matej 17. 11. 2026. Zadanie: `plany/zadanie-veterinari-mapa-2026-11-17.md`.
//
// ── DVA ZDROJE, JEDNA ZNAČKA ────────────────────────────────────────────────
// BEŽNÝ VETERINÁR  — `public/vet/mapa-v2.json` cez `lib/clinics.ts` (⚙️ `plany/veterinari/gen-vet-mapa.mjs`), stiahne
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Marker, useMap, useMapEvent } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { FONT_UI, PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT as TX } from '@/components/pack/packTheme';
import { MAP_STICKERS_ON, stickerImg, poiStickerPx } from '@/components/pack/mapnotes/mapStickers';
import { CIRCLE_MARK_CSS } from '@/components/pack/mapnotes/circleMark';
import { PLACE_CARD_CSS } from './PlaceCard';
import { kmText, useSosT } from '@/components/pack/sos/sosShared';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { distanceKm } from '@/lib/vetEmergency';
import { ER_CLINICS, clinicPath, googleReviews, hoursLabel, loadMapVets, type MapVet } from '@/lib/clinics';
import { driveTimes, type DriveTime } from '@/components/pack/addtrip/mapProxyClient';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { ClinicPawsLine, CLINIC_PAWS_CSS } from './ClinicPawsLine';
import { useClinicStats } from './clinicPosts';
import { clusterByPixels } from '@/components/pack/mapnotes/clusterPoints';

/** Od tohto priblíženia sa veterinári kreslia — z diaľky v ZHLUKOCH (Matej 17. 11. 2026: „mohli by sme ich
 *  zobrazovať už s väčšej diaľky v zhluku nech je mapa viac plná"). Pôvodne 12 a čo sa prekrylo, zmizlo. */
export const VET_MIN_ZOOM = 8;
const VET_MAX_RENDER = 160;
/** Odstup zhluku v pixeloch: zblízka o kus menej než samolepka (mesto má ambulancie husto), z diaľky viac. */
const clusterR = (z: number) => (z >= 12 ? 34 : z >= 10 ? 44 : 52);
const STICKER = '/icons/sys/sos-vet.webp';
/** Karta ide cez portál do `.trp-root` nad ovládače mapy a štítok Mapy.com — `MAP_Z.popup` v `PackMap.tsx`. */
const CARD_Z = 1300;

/** Pohotovosti zo SOS. Výjazdoví veterinári (`home`) nemajú miesto, kam sa dá prísť — na mapu nejdú. */
const SOS_VETS: MapVet[] = ER_CLINICS.filter((c) => !c.er?.home);

const icon = (v: MapVet, zoom: number) => {
  const px = poiStickerPx(zoom);
  return L.divIcon({
    className: 'mk-wrap',
    html: stickerImg(STICKER, v.sos ? ' vm-sos' : '', px) + (v.nonstop ? `<i class="vm-247" style="top:${px / 2 - 4}px">24/7</i>` : ''),
  });
};

/** Zhluk = tá istá samolepka + počet. Ťuk priblíži na ambulancie v ňom. */
const clusterIcon = (n: number, zoom: number) => {
  const px = poiStickerPx(zoom);
  return L.divIcon({
    className: 'mk-wrap',
    html: stickerImg(STICKER, '', px) + `<i class="vm-n" style="left:${px / 2 - 6}px;top:${-px / 2 - 6}px">${n}</i>`,
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
  const dist = kmText(d.lengthM / 1000, loc);
  const min = Math.max(1, Math.round(d.durationS / 60));
  return `${dist} km · ${min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`}`;
}

export function VetLayer({ minZoom = VET_MIN_ZOOM }: { minZoom?: number } = {}) {
  const map = useMap();
  const s = useSosT();
  const { lang } = useLang();
  const loc = intlLocale(lang);
  const navigate = useNavigate();
  const stats = useClinicStats(); // jedno volanie pre všetky karty
  // DEV: rukoväť na mapu pre kontrolu z konzoly — to isté ako v `PoiLayer.tsx`, do produkcie nejde.
  if (import.meta.env.DEV) (window as unknown as { __MAP?: unknown }).__MAP = map;
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [moveTick, setMoveTick] = useState(0);
  const [file, setFile] = useState<MapVet[]>([]);
  // KARTA V STREDE (Matej 17. 11. 2026: „musí byť vpredu nad pilsami mapy.com + musí sa centrovať vždy do stredu
  // obrazovky ako keby od tej strednej packy"). Leaflet popup žil vo vrstve mapy (z 0) pod ovládačmi (800)
  // a autopan ho tlačil k okraju. Teraz portál do `.trp-root`, os = stred spodnej lišty (`--pack-nav-cx`).
  const [sel, setSel] = useState<MapVet | null>(null);
  const onZoomEnd = useCallback(() => setZoom(map.getZoom()), [map]);
  const onMoveEnd = useCallback(() => setMoveTick((n) => n + 1), []);
  // Otvorená karta: poloha (ak je povolená) → hneď vzdušná čiara, potom čas autom. Jeden dopyt na kartu.
  const [me, setMe] = useState<[number, number] | null>(null);
  const [drive, setDrive] = useState<Record<string, DriveTime>>({});
  const askDrive = useCallback((v: MapVet) => {
    void myPosition().then((pos) => {
      if (!pos) return;
      setMe(pos);
      void driveTimes(pos, [v.at]).then(([d]) => { if (d) setDrive((x) => ({ ...x, [v.cid]: d })); });
    });
  }, []);
  const openVet = useCallback((v: MapVet) => { setSel(v); askDrive(v); }, [askDrive]);
  const close = useCallback(() => setSel(null), []);
  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sel, close]);
  useMapEvent('zoomend', onZoomEnd);
  useMapEvent('moveend', onMoveEnd);

  const on = MAP_STICKERS_ON && zoom >= minZoom;
  useEffect(() => {
    if (!on || file.length) return;
    let alive = true;
    loadMapVets().then((v) => { if (alive) setFile(v); });
    return () => { alive = false; };
  }, [on, file.length]);

  const items = useMemo(() => {
    if (!on) return [];
    const bounds = map.getBounds().pad(0.2);
    // Pohotovosť pred bežnou ambulanciou, nonstop pred ostatnými: v zhluku je ich zástupca ten, čo človek v núdzi hľadá.
    const rank = (v: MapVet) => Number(v.sos) * 4 + Number(v.nonstop) * 2;
    const proj = [...SOS_VETS, ...file].filter((v) => bounds.contains(v.at)).map((v) => {
      const pt = map.latLngToContainerPoint(v.at);
      return { v, x: pt.x, y: pt.y };
    });
    return clusterByPixels(proj, clusterR(zoom)).slice(0, VET_MAX_RENDER).map((c) => {
      const lead = c.items.reduce((a, b) => (rank(b.v) > rank(a.v) || (rank(b.v) === rank(a.v) && (b.v.google?.count ?? 0) > (a.v.google?.count ?? 0)) ? b : a)).v;
      return c.items.length === 1 ? { kind: 'one' as const, v: lead } : { kind: 'many' as const, v: lead, all: c.items.map((i) => i.v) };
    });
    // moveTick je zámerná závislosť: posun mapy nemení `map`, ale mení viditeľný výrez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, on, zoom, moveTick, file]);

  const zoomInto = useCallback((all: MapVet[]) => {
    map.flyToBounds(L.latLngBounds(all.map((v) => v.at)), { padding: [64, 64], maxZoom: 16, duration: 0.6 });
  }, [map]);

  if (!on) return null;
  const now = new Date();
  const v = sel;
  const hours = v ? hoursLabel(v, s, now) : null;
  const host = (map.getContainer().closest('.trp-root') as HTMLElement | null) ?? document.body;
  return (
    <>
      <style>{CIRCLE_MARK_CSS}</style>
      <style>{PLACE_CARD_CSS}</style>
      <style>{VET_CSS}</style>
      <style>{CLINIC_PAWS_CSS}</style>
      {items.map((it) => it.kind === 'one' ? (
        <Marker key={`vet-${it.v.cid}`} position={it.v.at} icon={icon(it.v, zoom)} zIndexOffset={it.v.sos ? -400 : -500} title={it.v.name}
          eventHandlers={{ click: () => openVet(it.v) }} />
      ) : (
        <Marker key={`vetc-${it.v.cid}-${it.all.length}`} position={it.v.at} icon={clusterIcon(it.all.length, zoom)} zIndexOffset={-450}
          eventHandlers={{ click: () => zoomInto(it.all) }} />
      ))}
      {v && hours && createPortal(
        <>
          <span className="vm-veil" style={{ zIndex: CARD_Z - 1 }} onClick={close} aria-hidden />
          <div className="vm-stage" style={{ zIndex: CARD_Z }}>
            <div className="pcard vm-card" role="dialog" aria-label={v.name}>
              <div className="vm-photo">
                <img className="pcard-photo" src={v.photo} alt="" loading="lazy" decoding="async" />
                {me && (
                  <span className="vm-eta">{drive[v.cid] ? etaLabel(drive[v.cid], loc) : s('pack.sos.er.airKm', { km: kmText(distanceKm(me, v.at), loc) })}</span>
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
                    {v.google.count ? <>· {googleReviews(v.google.count, s, loc)}</> : null}
                  </a>
                )}
                {!v.google && v.googleUrl && (
                  <a className="vm-g" href={v.googleUrl} target="_blank" rel="noopener noreferrer">
                    <img src="/nav-apps/google-g.svg" alt="" />{s('pack.sos.er.mapGoogle')}
                  </a>
                )}
                <ClinicPawsLine cid={v.cid} stat={stats[v.cid]} s={s} loc={loc} />
                <div className="vm-acts">
                  {v.tels.map((t) => (
                    <a key={t} className="pk-b3 pk-b3--lapis vm-btn" href={`tel:${t.replace(/\s/g, '')}`}>{t}</a>
                  ))}
                  {!v.tels.length && <p className="pcard-empty">{s('pack.sos.er.mapNoTel')}</p>}
                  {v.navUrl && (
                    <a className="pk-b3 pk-b3--paper vm-btn" href={v.navUrl} target="_blank" rel="noopener noreferrer">{s('pack.sos.er.navBtn')}</a>
                  )}
                  <button type="button" className="pk-b3 pk-b3--paper vm-btn" onClick={() => navigate(clinicPath(v.cid))}>{s('pack.sos.er.clOpen')}</button>
                  {v.sos && (
                    <button type="button" className="pk-b3 pk-b3--red vm-btn" onClick={() => navigate('/pack/sos/pohotovost')}>{s('pack.sos.er.mapSos')}</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        host,
      )}
    </>
  );
}

/** Karta preberá papyrusovú kartu `.pcard` (PlaceCard); tu je len to, čo má veterinár navyše.
 *  STAGE = zvislý pás od vrchu okna po hornú hranu spodnej lišty, nulovej šírky na osi strednej packy —
 *  flex karta v ňom sa vycentruje na tú os (aj na PC, kde lišta stojí v strede plochy vedľa panela). */
const VET_CSS = `
.vm-veil{position:fixed;inset:0;}
.vm-stage{position:fixed;left:var(--pack-nav-cx,50vw);width:0;top:calc(env(safe-area-inset-top,0px) + ${S.md}px);
  bottom:calc(var(--pack-nav-bottom,0px) + var(--pack-nav-h,84px) + ${S.md}px);display:flex;align-items:center;justify-content:center;pointer-events:none;}
.vm-card{pointer-events:auto;flex:none;width:min(340px,calc(100vw - ${S.xxl}px));max-height:100%;overflow-y:auto;overscroll-behavior:contain;
  background:${T.cardGrad};border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.tile}px;box-shadow:${T.panelShadow};}
.vm-n{position:absolute;font-style:normal;pointer-events:none;min-width:24px;height:24px;padding:0 ${S.xs}px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;
  font-family:${FONT_UI};font-weight:600;font-size:${TX.label}px;line-height:1;border-radius:${PACK_R.pill}px;color:${T.inkStrong};background:var(--p3d-paper-hi,#fff);border:1.5px solid ${T.inkStrong};}
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
