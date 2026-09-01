// MINI NÁHĽAD KRAJINY — „kde približne som" + ŤAHADLO VÝREZU (Matej 2026-08-28)
//
// Matej: „medzi ainubisa a blok dať nový blok s náhľadom mapy = zobrazila by sa celá krajina
//  a fialový rámik výrezu kde je aktuálne človek aby sa nestratil a vedel približne kde sa
//  nachádza… online by videli kde cca su a nemuseli by neustale odzoomovať (PC)"
// a o kolo neskôr: „ten rámik naľavo by sa mal dať pohybovať myškou… chytíš rámik myškou
//  klikom podržíš a premiestniš po krajine".
//
// ⚠️ PREČO DRUHÁ MAPA S DLAŽDICAMI A NIE SVG OBRYS KRAJINY.
// Obrys krajín v repe máme (`data/svkBorder.ts`, `COUNTRY_BORDERS`) a náhľad by z neho bol
// zadarmo — ale len dovtedy, kým má náhľad držať CELÚ krajinu. Matej 28. 8. rozhodol opak:
// „nie je podmienkou držať stále celú krajinu na muške = pri veľkom zoome sa automaticky
//  priblíži aj náhľad z celej mapky na segment povedzme západ/stred/východ". Vo výreze
// „západ" už hranica krajiny v zábere nie je a vnútri obrysu ostane prázdna plocha — orientovať
// sa niet podľa čoho. Dlaždice sú jediný podklad, ktorý dáva zmysel na KAŽDEJ úrovni.
//
// ⚠️ NÁHĽAD NESLEDUJE ZOOM 1:1 — RASTIE POMALŠIE (`FOLLOW_K`). Pevný odstup (napr. vždy
// o 5 stupňov menej) by pri základnom pohľade na krajinu ukázal pol Európy a pri kreslení
// stále len okolie. Preto lineárka: pri základnom priblížení mapy drží celú krajinu, ďalej
// sa priťahuje štvrtinovým tempom — z krajiny sa stane segment, zo segmentu okolie.
//
// 🔴 NÁHĽAD SA NESMIE CENTROVAŤ NA STRED HLAVNEJ MAPY (zmena 28. 8. večer, kvôli ťahaniu).
// Prvá verzia robila `mini.setView(main.getCenter())` pri každom pohybe — rámik teda VŽDY
// stál v strede náhľadu a hýbal sa pod ním podklad. Kým bol náhľad iba ukazovateľ, bolo to
// jedno; ako ŤAHADLO to nedáva zmysel: chytíš rámik, ťaháš, a on sa nepohne, lebo si pod ním
// ťahal mapu. Preto má náhľad odteraz VLASTNÝ, stabilný výrez a preposadí sa (`recenter`) len
// keď treba — pri zmene priblíženia alebo keď sa rámik priblíži k okraju plátna. Vedľajší
// zisk: presne toto Matej pýtal v prvej vete („zobrazila by sa celá krajina A rámik kde je
// človek"), teda rámik má po tej krajine putovať, nie stáť v strede.
//
// ⚠️ RÁMIK MÁ SPODNÝ ROZMER (`MIN_BOX_PX`). Práve preto, že náhľad rastie pomalšie, je pri
// veľkom priblížení hlavný výrez v mierke náhľadu menší než pixel. Pod prahom sa preto
// nekreslí obdĺžnik, ale značka pevnej veľkosti — inak by rámik zmizol presne vtedy, keď je
// najviac treba („pri maximálnom sa ešte o čosi aby človek vedel kde je"), a nebolo by čo
// chytiť. Chytacia plocha je preto vždy aspoň `GRAB_MIN_PX`, aj keď je rámik menší.
//
// ⚠️ FARBA JE JEDNA FIALOVÁ — `T.tripPurple`, telo svetelného meča (Matej 28. 8.: „dajme
// toten rámik predsa len fialovou - fialová bude farba tripov" a vzápätí „použime fialovú
// ktorá je v brande, resp je pri svetelnom meči.. je to ona (nepoužívajme viac fialových
// len jednu a tú si definujme)"). Prvé kolo malo v rámiku DVE — svetlú na čiaru a sýtu na
// výplň — a to je presne to, čo Matej zakázal: dva odtiene tej istej farby sa pri prvej
// zmene rozídu. Čiara, výplň aj dosvit dnes stoja na tom istom tokene, líšia sa len krytím.
// (Kolo pred tým tu bola mapová modrá z obranného argumentu „v náhľade značky nie sú, tak
// nekoliduje". Prehrala, lebo fialová niečo ZNAMENÁ — je to farba výletov.)
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { mapyTiles } from '@/lib/env';
import { PACK_THEME as T, FONT_UI } from '@/components/pack/packTheme';
import { goldFrameCSS, PALE } from '@/components/pack/navGoldSkin';
import { useT } from '@/i18n/LanguageContext';

/** Priblíženie hlavnej mapy, pri ktorom náhľad drží celú krajinu (= štartovací pohľad `/pack/map`). */
const BASE_MAIN_ZOOM = 9;
/** Priblíženie náhľadu v tom bode — celé Slovensko sa doň zmestí. */
const BASE_MINI_ZOOM = 6;
/** Ako rýchlo náhľad nasleduje hlavnú mapu. 1 = 1:1, 0 = stojí na mieste. */
const FOLLOW_K = 0.45;
const MINI_MIN_ZOOM = 3;
const MINI_MAX_ZOOM = 12;
/** Najväčší podiel plátna, ktorý smie výrez zabrať. Zvyšok je kontext — kvôli nemu tu náhľad je. */
const MAX_FILL = 0.6;
/** Pod týmto rozmerom (px) sa namiesto obdĺžnika kreslí značka pevnej veľkosti. */
const MIN_BOX_PX = 16;
/** Najmenšia chytacia plocha rámika. Vizuál smie byť menší, cieľ pre myš nie. */
const GRAB_MIN_PX = 22;
/** Odstup od hrany plátna, pod ktorým sa náhľad preposadí. Bez neho by rámik vyšiel von. */
const EDGE_PAD = 12;
/** Výška plátna náhľadu. */
const CANVAS_H = 150;

/**
 * Priblíženie náhľadu pre dané priblíženie hlavnej mapy.
 *
 * DVE PODMIENKY NARAZ, berie sa PRÍSNEJŠIA:
 *  1. `FOLLOW_K` — Matejovo tempo: pri základnom pohľade celá krajina, ďalej sa náhľad
 *     priťahuje pomalšie než mapa (z krajiny segment, zo segmentu okolie).
 *  2. ⚠️ VÝREZ SA MUSÍ ZMESTIŤ DO PLÁTNA. Hlavná mapa je niekoľkonásobne väčšia než
 *     náhľad (1568 × 698 proti 406 × 150), takže pri pevnom odstupe dvoch stupňov je
 *     obdĺžnik výrezu ŠIRŠÍ než celý náhľad — v prvom behu z neho ostali dve zvislé
 *     čiary pri okrajoch a fialová výplň cez celé plátno. Potrebný odstup preto nie je
 *     konštanta, ale vyplýva z pomeru plátien: každý stupeň delí rozmer dvomi.
 *
 * Zaokrúhľuje sa na CELÝ stupeň zámerne — dlaždice sa tak sťahujú len pri prekročení
 * stupňa, nie pri každom otočení kolieskom.
 */
export const miniZoomFor = (
  mainZoom: number,
  mainSize?: { x: number; y: number },
  miniSize?: { x: number; y: number },
): number => {
  const follow = BASE_MINI_ZOOM + (mainZoom - BASE_MAIN_ZOOM) * FOLLOW_K;
  let z = follow;
  if (mainSize && miniSize && miniSize.x > 0 && miniSize.y > 0) {
    const need = Math.max(
      Math.log2(mainSize.x / (miniSize.x * MAX_FILL)),
      Math.log2(mainSize.y / (miniSize.y * MAX_FILL)),
    );
    z = Math.min(z, mainZoom - Math.max(0, need));
  }
  return Math.max(MINI_MIN_ZOOM, Math.min(MINI_MAX_ZOOM, Math.floor(z)));
};

export const MINI_OVERVIEW_CSS = `
/* Ten istý materiál ako prevýšenie o kus nižšie v stĺpci — jeden zdroj (goldFrameCSS()),
   nie druhá sada čísel. Náhľad sa renderuje len na PC, takže tu nie je media query;
   keby raz zliezol na telefón, dostane vetvu, nie prepísané hodnoty. */
.trp-mini{${goldFrameCSS()}align-self:stretch;width:auto;margin:0;flex:0 0 auto;position:relative;overflow:hidden;padding:9px 11px 11px;}
.trp-mini-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;font-family:${FONT_UI};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${PALE.dim};}
.trp-mini-canvas{position:relative;width:100%;height:${CANVAS_H}px;border-radius:10px;overflow:hidden;background:${T.pageBg};}
/* Náhľad sa NEZOOMUJE ani neposúva vlastnými gestami — jediné, čo v ňom človek robí, je
   ťahanie výrezu (nižšie). Bez tohto by koliesko nad ním odzoomovalo náhľad a hlavná mapa
   by ostala, kde bola.
   ⚠️ ROZMER SEM NEPATRÍ. Triedu leaflet-container si Leaflet pridá na SAMO plátno, takže
   toto pravidlo je špecifickejšie než pravidlo nad ním — height:100% by prebilo pevnú výšku,
   nemalo by sa o čo oprieť (rodič výšku nemá) a plátno by spadlo na 21 px. */
.trp-mini-canvas.leaflet-container{background:${T.pageBg};cursor:default;}
.trp-mini-canvas.is-grab{cursor:grab;}
.trp-mini-canvas.is-drag{cursor:grabbing;}
/* ⚠️ OBDĹŽNIK JE SVG path, NIE BOX — border/box-shadow naň neplatia a rámik by ostal
   neviditeľný. Farbu a hrúbku nesú Leaflet options, dosvit (aby fialová držala aj na
   svetlých dlaždiciach) sa dá pripísať len filtrom — je to ten istý recept, akým svieti
   trasa na mape (.trp-saber-glow v tripShared). */
.trp-mini-box{filter:drop-shadow(0 0 1px rgba(0,0,0,0.65)) drop-shadow(0 0 6px rgba(${T.tripPurpleRGB},0.85));}
/* Značka pod prahom rozmeru — tá istá jedna fialová, len bez rozmeru výrezu. */
.trp-mini-dot{width:${MIN_BOX_PX}px;height:${MIN_BOX_PX}px;box-sizing:border-box;border:2px solid ${T.tripPurple};border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,0.65),0 0 8px rgba(${T.tripPurpleRGB},0.85);background:rgba(${T.tripPurpleRGB},0.22);}
`;

/**
 * Náhľad polohy nad hlavnou mapou, ktorý sa dá chytiť a preložiť inam.
 *
 * ARCHITEKTÚRA: hlavnú mapu tento komponent NEVYTVÁRA — dostane ju cez `mapRef`, počúva ju
 * a kreslí do svojej vlastnej. Jediný zásah späť je `setView` počas ťahania; nič iné o mape
 * nerozhoduje.
 */
export function MiniOverview({ mapRef }: { mapRef: React.MutableRefObject<LeafletMap | null> }) {
  const t = useT();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const miniRef = useRef<LeafletMap | null>(null);
  const markRef = useRef<L.Rectangle | L.Marker | null>(null);
  /** Rozmer výrezu v pixeloch náhľadu — z neho sa počíta, či myš stojí na rámiku. */
  const boxRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  /** Odsadenie úchopu od stredu výrezu; `null` = neťahá sa. */
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const main = mapRef.current;
    if (!host || !main) return;

    const mini = L.map(host, {
      attributionControl: false,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      inertia: false,
    }).setView(main.getCenter(), miniZoomFor(main.getZoom()));
    L.tileLayer(mapyTiles('outdoor')).addTo(mini);
    miniRef.current = mini;

    /** Stred hlavnej mapy vyjadrený v pixeloch náhľadu. */
    const centerPt = () => mini.latLngToContainerPoint(main.getCenter());

    /** Stojí bod na rámiku? Chytacia plocha nikdy nie je menšia než `GRAB_MIN_PX`. */
    const onMark = (p: L.Point) => {
      const c = centerPt();
      const w = Math.max(boxRef.current.w, GRAB_MIN_PX) / 2;
      const h = Math.max(boxRef.current.h, GRAB_MIN_PX) / 2;
      return Math.abs(p.x - c.x) <= w && Math.abs(p.y - c.y) <= h;
    };

    const drawMark = () => {
      if (markRef.current) { mini.removeLayer(markRef.current); markRef.current = null; }
      const b = main.getBounds();
      // Rozmer výrezu v PIXELOCH NÁHĽADU — nie v stupňoch. O tom, či sa obdĺžnik ešte dá
      // nakresliť, rozhoduje jeho veľkosť na obrazovke, a tá závisí od rozdielu priblížení.
      const nw = mini.latLngToContainerPoint(b.getNorthWest());
      const se = mini.latLngToContainerPoint(b.getSouthEast());
      const wPx = Math.abs(se.x - nw.x);
      const hPx = Math.abs(se.y - nw.y);
      boxRef.current = { w: wPx, h: hPx };
      markRef.current = (wPx >= MIN_BOX_PX && hPx >= MIN_BOX_PX)
        ? L.rectangle(b, {
            className: 'trp-mini-box',
            color: T.tripPurple, weight: 2, opacity: 1,
            fillColor: T.tripPurple, fillOpacity: 0.14,
            interactive: false,
          })
        : L.marker(main.getCenter(), {
            interactive: false,
            icon: L.divIcon({
              className: '',
              html: '<div class="trp-mini-dot"></div>',
              iconSize: [MIN_BOX_PX, MIN_BOX_PX],
              iconAnchor: [MIN_BOX_PX / 2, MIN_BOX_PX / 2],
            }),
          });
      markRef.current.addTo(mini);
    };

    /**
     * Prekreslenie sa zlučuje do jedného snímku — `move` chodí pri každom pixeli ťahu
     * a bez tohto by sa obdĺžnik prepočítaval desiatky ráz za sekundu.
     */
    let raf = 0;
    const sync = () => {
      raf = 0;
      const m = mapRef.current;
      if (!m || !miniRef.current) return;
      const wanted = miniZoomFor(m.getZoom(), m.getSize(), mini.getSize());
      let recenter = mini.getZoom() !== wanted;
      // ⚠️ POČAS ŤAHANIA SA NÁHĽAD NEPREPOSADÍ. Inak by rámik pod kurzorom utekal: každý
      // posun mapy by posunul aj podklad a ťah by sa zrýchľoval sám od seba.
      if (!recenter && !dragRef.current) {
        const b = m.getBounds();
        const nw = mini.latLngToContainerPoint(b.getNorthWest());
        const se = mini.latLngToContainerPoint(b.getSouthEast());
        const size = mini.getSize();
        recenter = nw.x < EDGE_PAD || nw.y < EDGE_PAD
          || se.x > size.x - EDGE_PAD || se.y > size.y - EDGE_PAD;
      }
      if (recenter) mini.setView(m.getCenter(), wanted, { animate: false });
      drawMark();
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };

    // ── ŤAHANIE VÝREZU ────────────────────────────────────────────────────────────────
    // Vlastné listenery, nie Leaflet drag: obdĺžnik je `path` a Leaflet ťahanie tvarov
    // v jadre nemá. Zároveň tak vieme dať chytacej ploche vlastný (väčší) rozmer.
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const p = mini.mouseEventToContainerPoint(e);
      if (!onMark(p)) return;
      e.preventDefault();
      const c = centerPt();
      dragRef.current = { dx: p.x - c.x, dy: p.y - c.y };
      host.classList.add('is-drag');
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onUp);
    };
    const onDragMove = (e: MouseEvent) => {
      const d = dragRef.current;
      const m = mapRef.current;
      if (!d || !m) return;
      e.preventDefault();
      const p = mini.mouseEventToContainerPoint(e);
      const target = mini.containerPointToLatLng(L.point(p.x - d.dx, p.y - d.dy));
      m.setView(target, m.getZoom(), { animate: false });
    };
    const onUp = () => {
      dragRef.current = null;
      host.classList.remove('is-drag');
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onUp);
      // Až teraz sa smie preposadiť — počas ťahania to bolo zakázané.
      schedule();
    };
    // Kurzor musí povedať, že sa rámik dá chytiť, EŠTE než ho človek skúsi chytiť —
    // inak je to skrytá funkcia a nikto ju nenájde.
    const onHover = (e: MouseEvent) => {
      if (dragRef.current) return;
      host.classList.toggle('is-grab', onMark(mini.mouseEventToContainerPoint(e)));
    };
    const onLeave = () => { if (!dragRef.current) host.classList.remove('is-grab'); };

    host.addEventListener('mousedown', onDown);
    host.addEventListener('mousemove', onHover);
    host.addEventListener('mouseleave', onLeave);

    sync();
    main.on('move', schedule);
    main.on('zoom', schedule);
    return () => {
      main.off('move', schedule);
      main.off('zoom', schedule);
      host.removeEventListener('mousedown', onDown);
      host.removeEventListener('mousemove', onHover);
      host.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onUp);
      if (raf) cancelAnimationFrame(raf);
      dragRef.current = null;
      markRef.current = null;
      miniRef.current = null;
      mini.remove();
    };
  }, [mapRef]);

  return (
    <div className="trp-mini">
      <div className="trp-mini-head"><span>{t('pack.addTrip.geo.overview')}</span></div>
      <div className="trp-mini-canvas" ref={hostRef} />
    </div>
  );
}
