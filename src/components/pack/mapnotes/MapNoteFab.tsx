// TLAČIDLO „+" NA ZÁPIS DO MAPY — S PRSTENCOM, KTORÝ SA UZAVRIE PRIBLÍŽENÍM.
// Zadanie: `plany/zadanie-zapisy-do-mapy-2026-08-20.md` §4
//
// Matej 2026-08-20: „bude viditeľné stále ale pri zoome sa zfunkční = na kraji
// bude mať tlačítko obrys a pri každom zoome sa pomaly po obvode bude spájať
// až sa v istom momente obrys tlačítka spojí a stane sa funkčným."
//
// ── PREČO JE TO LEPŠIE NEŽ HLÁŠKA „PRIBLÍŽ SI MAPU" ─────────────────────────
// Hláška príde AŽ PO neúspešnom pokuse a človeka poučuje. Prstenec je vidieť
// dopredu: tlačidlo tam je od začiatku, len nie je hotové, a každé priblíženie
// ho viditeľne dokončuje. Človek sa nedozvie, že spravil chybu — vidí, že si
// niečo odomyká. To isté obmedzenie, opačný pocit.
//
// ── PREČO SA KRESLÍ Z DÁT, A NIE CSS ANIMÁCIOU ──────────────────────────────
// Prstenec je `stroke-dasharray`/`-dashoffset` počítaný z AKTUÁLNEHO priblíženia,
// nie prehrávaná animácia. Keď človek odzoomuje, kruh sa zase rozpojí — obrys
// je STAV, nie efekt. Animácia by po odzoomovaní klamala.
//
// Plynulosť drží leafletový `zoom` (priebežný počas gesta), nie `zoomend` —
// s `zoomend` by prstenec poskakoval po celých krokoch namiesto plynulého
// napĺňania, ktoré Matej opísal ako „pomaly po obvode sa bude spájať".
import { useEffect, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { MIN_ZOOM_FOR_NOTE } from './useLongPressPoint';

const GOLD = '#C99A3F';
/** Priblíženie, od ktorého sa prstenec začne uzatvárať (prehľad krajiny). */
const RING_START_ZOOM = 9;

const R = 17;                       // polomer prstenca
const CIRC = 2 * Math.PI * R;

/** 0 = otvorený obrys, 1 = uzavretý (a tlačidlo funguje). */
function ringProgress(zoom: number): number {
  const span = MIN_ZOOM_FOR_NOTE - RING_START_ZOOM;
  return Math.max(0, Math.min(1, (zoom - RING_START_ZOOM) / span));
}

export type MapNoteFabProps = {
  map: LeafletMap | null;
  /** klik na hotové tlačidlo — dostane STRED výrezu ako miesto pre značku */
  onPlace: (lat: number, lon: number) => void;
  /** klik na nehotové tlačidlo — nech človek vie, čo mu chýba */
  onLocked?: () => void;
  hidden?: boolean;
};

export function MapNoteFab({ map, onPlace, onLocked, hidden }: MapNoteFabProps) {
  const t = useT();
  const [zoom, setZoom] = useState(() => map?.getZoom() ?? RING_START_ZOOM);

  useEffect(() => {
    if (!map) return;
    const sync = () => setZoom(map.getZoom());
    sync();
    map.on('zoom zoomend', sync);
    return () => { map.off('zoom zoomend', sync); };
  }, [map]);

  if (hidden || !map) return null;

  const p = ringProgress(zoom);
  const ready = p >= 1;

  // Klik na hotové tlačidlo položí značku do STREDU výrezu — nie do režimu
  // „teraz klikni miesto". Jeden krok namiesto dvoch, a presnosť si človek
  // doladí ťahaním značky (viď AddMapNotePin). Dlhé podržanie ostáva druhou
  // cestou pre toho, kto mieri na konkrétny bod mimo stredu.
  const click = () => {
    if (!ready) { onLocked?.(); return; }
    const c = map.getCenter();
    onPlace(c.lat, c.lng);
  };

  return (
    <button
      type="button"
      className={`mnf${ready ? ' mnf--ready' : ''}`}
      onClick={click}
      aria-label={t(ready ? 'pack.mapNotes.fab.ready' : 'pack.mapNotes.fab.locked')}
      title={t(ready ? 'pack.mapNotes.fab.ready' : 'pack.mapNotes.fab.locked')}
    >
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        {/* podklad prstenca — kde obrys ešte NIE JE, aby bolo vidno, koľko chýba */}
        <circle cx="20" cy="20" r={R} className="mnf-track" />
        {/* Kreslí sa od 12 h doprava: rotácia -90° okolo stredu. Bez nej by kruh
            začínal na 3 h a „spájanie" by opticky začínalo z boku. */}
        <circle
          cx="20" cy="20" r={R}
          className="mnf-ring"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - p)}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="mnf-plus" aria-hidden="true">+</span>
    </button>
  );
}

export const MAP_NOTE_FAB_CSS = `
.mnf{position:absolute;right:14px;bottom:96px;z-index:850;width:40px;height:40px;padding:0;border:0;background:${T.glass};border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,0.45);}
.mnf svg{position:absolute;inset:0;}
.mnf-track{fill:none;stroke:${T.onDarkBorder};stroke-width:1.5;}
/* Obrys sa dopĺňa PLYNULE — prechod na dashoffset nesie Matejovo „pomaly po
   obvode sa bude spájať". Bez neho by pri kroku zoomu preskočil. */
.mnf-ring{fill:none;stroke:${T.onDarkDim};stroke-width:1.5;stroke-linecap:round;transition:stroke-dashoffset .35s ease,stroke .3s ease;}
.mnf-plus{position:relative;font-family:${FONT_UI};font-weight:600;font-size:20px;line-height:1;color:${T.onDarkDim};transition:color .3s ease;margin-top:-2px;}
/* Uzavretý kruh = tlačidlo je hotové. Zlatá je tu STAV („odomknuté"), nie farba
   veci — to je to isté pravidlo ako pri značkách na mape. */
.mnf--ready .mnf-ring{stroke:${GOLD};}
.mnf--ready .mnf-plus{color:${GOLD};}
.mnf--ready{box-shadow:0 4px 14px rgba(0,0,0,0.45),0 0 0 4px rgba(201,154,63,0.14);}
.mnf--ready:hover{background:rgba(201,154,63,0.16);}
@media (max-width:720px){.mnf{bottom:118px;}}
`;
