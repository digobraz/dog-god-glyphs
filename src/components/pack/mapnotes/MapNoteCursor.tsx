// PLUSKO PRI KURZORE — PC vstup do zápisu odkazu.
// Zadanie: `plany/zadanie-zapisy-do-mapy-v2-DALSIA-SESSION.md` §8.2 a §8.4
//
// Matej 2026-08-20: „ta plusková ikona by mala byť priamo na kurze myši =
// klasická šípka a vedľa + ktoré sa pri zoomovaní načítava a po načítaní
// vybehne text dlhšie podrž na mieste".
// Matej 2026-08-21: „to plus musí byť výraznejšie aj farebne aj vizuálne".
//
// ── PREČO TO NIE JE `cursor: url(...)` ──────────────────────────────────────
// CSS kurzor je STATICKÝ obrázok. Prstenec, ktorý sa dopĺňa priblížením, sa doň
// nedá vložiť — musel by sa pri každom kroku zoomu vygenerovať nový PNG a nastaviť
// ako kurzor, čo bliká a v Safari sa správa nepredvídateľne. Preto je to bežný
// prvok letiaci za myšou.
//
// ── NIČ, ČO SA MENÍ POČAS ZOOMU, NEJDE CEZ REACT STATE ─────────────────────
// `mousemove` beží desiatky ráz za sekundu a leafletová udalosť `zoom` (bez `end`)
// tiež — padne na KAŽDEJ snímke priblíženia. Keby cez `setState` išla poloha alebo
// prstenec, React by prekresľoval strom v tej istej frekvencii a zoom by sa trhal.
// ⚠️ Presne to sa stalo: `map.on('zoom zoomend', setZoom)` bol jediný súvislý
// listener v appke a Matej to nahlásil ako „extrémne dlho trvá zoom".
// Poloha aj prstenec sa preto zapisujú PRIAMO do DOM cez ref a zarovnávajú na
// snímku (`requestAnimationFrame`). React state drží len to, čo sa mení zriedka —
// či je kurzor nad mapou a či po `zoomend` treba ukázať nápovedu.
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
/**
 * Priblíženie, od ktorého sa prstenec začne uzatvárať.
 * Drží sa 4 stupne pod prahom — pri väčšom rozpätí sa kruh na jeden krok zoomu
 * pohne tak málo, že to vyzerá pokazene.
 */
const RING_START_ZOOM = MIN_ZOOM_FOR_NOTE - 4;
const R = 14;
const PAD = 4;
const BOX = (R + PAD) * 2;
const C = R + PAD;
const CIRC = 2 * Math.PI * R;

function ringProgress(zoom: number): number {
  const span = MIN_ZOOM_FOR_NOTE - RING_START_ZOOM;
  return Math.max(0, Math.min(1, (zoom - RING_START_ZOOM) / span));
}

export function MapNoteCursor({ map, hidden }: { map: LeafletMap | null; hidden?: boolean }) {
  const t = useT();
  const elRef = useRef<HTMLDivElement | null>(null);
  const arcRef = useRef<SVGCircleElement | null>(null);
  const [over, setOver] = useState(false);
  // Mení sa LEN na `zoomend`, takže nápoveda nebliká počas štipnutia.
  const [ready, setReady] = useState(() => (map?.getZoom() ?? 0) >= MIN_ZOOM_FOR_NOTE);

  useEffect(() => {
    if (!map || hidden) { setOver(false); return; }
    const el = map.getContainer();
    let raf = 0;
    let x = 0;
    let y = 0;

    /** Jediné miesto, kde sa saha na DOM — poloha aj prstenec naraz, raz za snímku. */
    const paint = () => {
      raf = 0;
      const node = elRef.current;
      if (!node) return;
      node.style.transform = `translate3d(${x}px,${y}px,0)`;
      const p = ringProgress(map.getZoom());
      if (arcRef.current) arcRef.current.style.strokeDashoffset = String(CIRC * (1 - p));
      node.classList.toggle('is-ready', p >= 1);
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(paint); };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      schedule();
    };
    const onEnter = () => setOver(true);
    const onLeave = () => setOver(false);
    // `zoom` (súvislý) hýbe len prstencom cez DOM; React sa dozvie až na konci.
    const onZoomEnd = () => { schedule(); setReady(map.getZoom() >= MIN_ZOOM_FOR_NOTE); };

    map.on('zoom', schedule);
    map.on('zoomend', onZoomEnd);
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
      map.off('zoom', schedule);
      map.off('zoomend', onZoomEnd);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [map, hidden]);

  if (!map || hidden || !over) return null;

  const p0 = ringProgress(map.getZoom());

  return (
    <div className={`mnc${p0 >= 1 ? ' is-ready' : ''}`} ref={elRef} aria-hidden>
      <style>{MAP_NOTE_CURSOR_CSS}</style>
      <svg className="mnc-mark" width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`}>
        <defs>
          {/* Tá istá dvojica ako `.btn-gold` — plusko je CTA, nie dekorácia. */}
          <linearGradient id="mncGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5C73D" />
            <stop offset="100%" stopColor="#E69E1A" />
          </linearGradient>
        </defs>
        {/* výplň — tmavá, kým sa nedá klikať; zlatá, keď áno */}
        <circle className="mnc-disc" cx={C} cy={C} r={R} />
        {/* nedokončená časť prstenca, aby bolo vidieť, koľko chýba */}
        <circle className="mnc-track" cx={C} cy={C} r={R} fill="none" />
        {/* dokončená časť — rastie priblížením */}
        <circle
          ref={arcRef}
          className="mnc-arc"
          cx={C}
          cy={C}
          r={R}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: CIRC * (1 - p0) }}
          transform={`rotate(-90 ${C} ${C})`}
        />
        {/* samotné + ako kresba, nie text: hrúbku vieme nastaviť presne a Space
            Grotesk je aj tak načítaný len do váhy 600, takže tučnejšie by nebolo */}
        <path className="mnc-plus" d={`M ${C - 6} ${C} H ${C + 6} M ${C} ${C - 6} V ${C + 6}`} strokeLinecap="round" />
      </svg>
      {/* Text vybehne až keď je prstenec hotový — dovtedy by radil gesto, ktoré
          sa v tej chvíli nedá spustiť. */}
      {ready && <span className="mnc-tip">{t('pack.mapNotes.cursor.hold')}</span>}
    </div>
  );
}

export const MAP_NOTE_CURSOR_CSS = `
/* Celý prvok je „mimo dosahu" — nesmie ukradnúť ani klik, ani hover z mapy pod ním. */
.mnc{position:absolute;top:0;left:0;z-index:640;pointer-events:none;will-change:transform;}
/* Tieň drží plusko čitateľné nad svetlou mapou aj nad lesom — bez neho zlatá na
   zelenej splýva. Nad mapou nikdy nespoliehaj na farbu samotnú. */
.mnc-mark{position:absolute;left:13px;top:4px;overflow:visible;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.55));transition:filter .18s ease,transform .18s ease;}
.mnc-disc{fill:rgba(5,5,5,0.88);transition:fill .18s ease;}
.mnc-track{stroke:rgba(201,154,63,0.28);stroke-width:3;}
.mnc-arc{stroke:${GOLD};stroke-width:3;}
.mnc-plus{stroke:rgba(201,154,63,0.85);stroke-width:2.6;transition:stroke .18s ease;}

/* HOTOVO = dá sa klikať. Zlatá je STAV, nie farba veci — rovnaké pravidlo ako
   pri značkách na mape. Vypnutý stav ostáva tmavý, aby bol rozdiel na prvý pohľad. */
.mnc.is-ready .mnc-disc{fill:url(#mncGold);}
.mnc.is-ready .mnc-plus{stroke:#3d1f00;stroke-width:3.2;}
.mnc.is-ready .mnc-track{stroke:rgba(61,31,0,0.22);}
.mnc.is-ready .mnc-arc{stroke:rgba(61,31,0,0.35);}
.mnc.is-ready .mnc-mark{filter:drop-shadow(0 0 10px rgba(245,199,61,0.55)) drop-shadow(0 2px 6px rgba(0,0,0,0.45));transform:scale(1.08);}

.mnc-tip{position:absolute;left:${13 + BOX + 8}px;top:${4 + C}px;transform:translateY(-50%);white-space:nowrap;padding:5px 9px;border-radius:999px;background:rgba(5,5,5,0.92);border:1px solid rgba(201,154,63,0.45);font-family:${FONT_UI};font-size:10.5px;letter-spacing:.02em;color:${T.onDark};box-shadow:0 4px 14px rgba(0,0,0,0.45);}
/* Dotykové zariadenia kurzor nemajú — tam nápovedu nesie MapNoteHint. */
@media (hover:none){.mnc{display:none;}}
`;
