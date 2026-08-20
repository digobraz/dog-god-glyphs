// PLUSKO PRI KURZORE — PC vstup do zápisu odkazu.
// Zadanie: `plany/zadanie-zapisy-do-mapy-v2-DALSIA-SESSION.md` §8.2 a §8.4
//
// Matej 2026-08-20: „ta plusková ikona by mala byť priamo na kurze myši =
// klasická šípka a vedľa + ktoré sa pri zoomovaní načítava a po načítaní
// vybehne text dlhšie podrž na mieste".
//
// ── PREČO TO NIE JE `cursor: url(...)` ──────────────────────────────────────
// CSS kurzor je STATICKÝ obrázok. Prstenec, ktorý sa dopĺňa priblížením, sa doň
// nedá vložiť — musel by sa pri každom kroku zoomu vygenerovať nový PNG a nastaviť
// ako kurzor, čo bliká a v Safari sa správa nepredvídateľne. Preto je to bežný
// prvok letiaci za myšou.
//
// ── PREČO SA NEPOUŽÍVA REACT STATE NA POLOHU ───────────────────────────────
// `mousemove` beží desiatky ráz za sekundu; keby každá poloha išla cez setState,
// prekresľoval by sa strom nad mapou v tej istej frekvencii. Poloha sa preto
// zapisuje priamo do `style.transform` cez ref a zarovnáva na snímku
// (`requestAnimationFrame`). React state drží len to, čo sa mení zriedka —
// priblíženie a či je kurzor nad mapou.
//
// ── PRSTENEC JE STAV, NIE ANIMÁCIA ─────────────────────────────────────────
// `stroke-dashoffset` sa počíta z AKTUÁLNEHO priblíženia. Keď človek odzoomuje,
// kruh sa zase rozpojí. Prehrávaná animácia by po odzoomovaní klamala.
// (Myšlienka je Matejova, presunutá zo zrušeného tlačidla `MapNoteFab`.)
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { useT } from '@/i18n/LanguageContext';
import { MIN_ZOOM_FOR_NOTE } from './useLongPressPoint';

const GOLD = '#C99A3F';
/** Priblíženie, od ktorého sa prstenec začne uzatvárať (prehľad krajiny). */
const RING_START_ZOOM = 9;
const R = 11;
const CIRC = 2 * Math.PI * R;

function ringProgress(zoom: number): number {
  const span = MIN_ZOOM_FOR_NOTE - RING_START_ZOOM;
  return Math.max(0, Math.min(1, (zoom - RING_START_ZOOM) / span));
}

export function MapNoteCursor({ map, hidden }: { map: LeafletMap | null; hidden?: boolean }) {
  const t = useT();
  const elRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(() => map?.getZoom() ?? RING_START_ZOOM);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (!map || hidden) { setOver(false); return; }
    const el = map.getContainer();
    let raf = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      raf = 0;
      if (elRef.current) elRef.current.style.transform = `translate3d(${x}px,${y}px,0)`;
    };
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!raf) raf = window.requestAnimationFrame(paint);
    };
    const onEnter = () => setOver(true);
    const onLeave = () => setOver(false);
    const sync = () => setZoom(map.getZoom());

    sync();
    map.on('zoom zoomend', sync);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    // ⚠️ Viditeľnosť NESMIE viset na `movestart`/`moveend`. Vyzeralo to lákavo
    // („počas ťahania plusko prekáža"), lenže mapa sa hýbe aj sama — `flyTo` na
    // vybraný výlet — a `moveend` potom plusko zapol na mieste, kde už myš dávno
    // nebola. Ostávalo visieť v rohu s nápovedou, ktorá sa nedala odkliknúť.
    // Poloha aj viditeľnosť patria výhradne myši.

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      map.off('zoom zoomend', sync);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [map, hidden]);

  if (!map || hidden || !over) return null;

  const p = ringProgress(zoom);
  const ready = p >= 1;

  return (
    <div className="mnc" ref={elRef} aria-hidden>
      <style>{MAP_NOTE_CURSOR_CSS}</style>
      <svg className="mnc-ring" width={(R + 3) * 2} height={(R + 3) * 2} viewBox={`0 0 ${(R + 3) * 2} ${(R + 3) * 2}`}>
        <circle
          cx={R + 3}
          cy={R + 3}
          r={R}
          fill="rgba(5,5,5,0.82)"
          stroke={ready ? GOLD : 'rgba(201,154,63,0.55)'}
          strokeWidth={ready ? 2 : 1.6}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - p)}
          transform={`rotate(-90 ${R + 3} ${R + 3})`}
        />
      </svg>
      <span className={`mnc-plus${ready ? ' on' : ''}`}>+</span>
      {/* Text vybehne až keď je prstenec hotový — dovtedy by radil gesto, ktoré
          sa v tej chvíli nedá spustiť. */}
      {ready && <span className="mnc-tip">{t('pack.mapNotes.cursor.hold')}</span>}
    </div>
  );
}

export const MAP_NOTE_CURSOR_CSS = `
/* Celý prvok je „mimo dosahu" — nesmie ukradnúť ani klik, ani hover z mapy pod ním. */
.mnc{position:absolute;top:0;left:0;z-index:640;pointer-events:none;will-change:transform;}
.mnc-ring{position:absolute;left:14px;top:6px;}
.mnc-plus{position:absolute;left:${14 + R + 3}px;top:${6 + R + 3}px;transform:translate(-50%,-50%);font-family:${FONT_UI};font-weight:600;font-size:15px;line-height:1;color:rgba(245,240,228,0.55);}
.mnc-plus.on{color:${GOLD};}
.mnc-tip{position:absolute;left:${14 + (R + 3) * 2 + 6}px;top:${6 + R + 3}px;transform:translateY(-50%);white-space:nowrap;padding:5px 9px;border-radius:999px;background:rgba(5,5,5,0.92);border:1px solid rgba(201,154,63,0.45);font-family:${FONT_UI};font-size:10.5px;letter-spacing:.02em;color:${T.onDark};box-shadow:0 4px 14px rgba(0,0,0,0.45);}
/* Dotykové zariadenia kurzor nemajú — tam nápovedu nesie MapNoteHint. */
@media (hover:none){.mnc{display:none;}}
`;
