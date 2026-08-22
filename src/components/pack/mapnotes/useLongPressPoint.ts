// DLHÉ PODRŽANIE V MAPE → BOD PRE NOVÝ ZÁPIS.
// Zadanie: `plany/zadanie-zapisy-do-mapy-2026-08-20.md` §4 (vstup 3)
//
// Matej 2026-08-20: „pri určitom zoome by sa pri kurzore myši objavilo plusko
// a pri podržaní 1-2s by sa zobrazila ponuka na rýchlu poznámku… na mobile by sa
// len prstom dlhšie podržalo."
//
// ── PREČO ZOOMOVÝ PRAH ──────────────────────────────────────────────────────
// Pri z9 (prehľad Slovenska) je jeden pixel ~300 m — poznámka naklikaná na
// prehľadovej mape by ležala pol kilometra vedľa a bola by horšia než žiadna.
// Pri z14 je to ~9 m, čo stačí na konkrétnu odbočku aj parkovisko. Pod prahom
// sa gesto ani nespustí a namiesto zápisu vyskočí výzva priblížiť mapu.
//
// ── TRI VECI, BEZ KTORÝCH TO „RAZ IDE, RAZ NIE" ─────────────────────────────
// 1. POHYB PRSTA. Prst sa počas držania VŽDY trochu pohne. Bez tolerancie by sa
//    gesto raz spustilo a raz nie — a nespoľahlivé gesto je horšie než žiadne.
//    Do `MOVE_TOLERANCE_PX` = zápis, nad ňu = používateľ posúva mapu a gesto sa
//    ruší.
// 2. SYSTÉMOVÉ MENU. iOS Safari (a desktop pravý klik) na dlhé podržanie otvorí
//    vlastné kontextové menu a prekryje naše. Preto `contextmenu` preventDefault.
// 3. ZOOM GESTOM. Dva prsty = zoom, nie zápis — pri druhom dotyku sa gesto ruší.
//
// ── PREČO NIE `map.on('contextmenu')` ───────────────────────────────────────
// Leaflet síce `contextmenu` emituje aj pri dlhom podržaní na mobile, ale bez
// kontroly nad časom držania aj nad toleranciou pohybu — a na iOS ho prehliadač
// vôbec nemusí poslať. Vlastné meranie je dlhšie, ale správa sa rovnako na
// všetkých zariadeniach.
import { useEffect, useRef } from 'react';
import type { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';

/**
 * Priblíženie, od ktorého má klik zmysel.
 *
 * ⚠️ 14 → 16 (Matej 2026-08-21: *„+ by sa malo dať ešte z vačšieho zoomu lebo teraz
 * je to dosť z výšky, nepresné"*). Pri z14 padne na pixel ~9 m, takže na 500 px širokom
 * okne vidíš pás skoro 5 km — parkovisko sa v ňom trafí na desiatky metrov a značka
 * potom klame. Pri z16 je to ~2,3 m na pixel a v okne je ~1,2 km, čo je mierka, v ktorej
 * je vidieť samotné odbočenie z cesty.
 *
 * Je to JEDINÉ číslo pre celý vstup — kontroluje ho klik, dlhé podržanie, pravý klik,
 * lišta „ukáž miesto", nápoveda aj prstenec pri kurzore. Neduplikuj ho.
 */
export const MIN_ZOOM_FOR_NOTE = 16;
/** Ako dlho treba držať. Matejovo „1-2s" — 600 ms je spodná hranica toho pásma. */
const HOLD_MS = 600;
/** Koľko sa smie prst pohnúť, aby to ešte bolo držanie a nie posun mapy. */
const MOVE_TOLERANCE_PX = 10;

export type LongPressHandlers = {
  /** dosť priblížené — vráti kliknutý bod */
  onPoint: (lat: number, lng: number) => void;
  /**
   * Primálo priblížené — na výzvu „priblíž si mapu".
   *
   * ⚠️ NESIE POLOHU V PIXELOCH KONTAJNERA MAPY (Matej 2026-08-21: „ten oznam
   * vieme dať aj v mieste kliku? nech je to vidno hneď… a nie pri spodnom
   * okraji"). Do 21. 8. bol handler bezparametrový, hoci klik polohu má —
   * výzva teda musela visieť pri spodnej hrane, ďaleko od miesta, ktorého sa
   * týkala. Súradnice sú CONTAINER, nie client: bublina sa kreslí do toho
   * istého kontajnera, takže by inak bola posunutá o polohu mapy na stránke.
   */
  onTooFar?: (x: number, y: number) => void;
};

export function useLongPressPoint(
  map: LeafletMap | null,
  enabled: boolean,
  { onPoint, onTooFar }: LongPressHandlers,
) {
  // Handlery cez ref, nie cez závislosti efektu: inak by každý render odhlásil
  // a znova prihlásil listenery — tá istá pasca, na ktorej v `TripMarkers`
  // padal `useMapEvent` (viď komentár tam).
  const cb = useRef({ onPoint, onTooFar });
  cb.current = { onPoint, onTooFar };

  useEffect(() => {
    if (!map || !enabled) return;
    const el = map.getContainer();

    let timer: number | null = null;
    let startX = 0;
    let startY = 0;
    let armed = false;

    const cancel = () => {
      if (timer !== null) { window.clearTimeout(timer); timer = null; }
      armed = false;
      el.classList.remove('mn-holding');
    };

    const start = (clientX: number, clientY: number) => {
      cancel();
      armed = true;
      startX = clientX;
      startY = clientY;
      el.classList.add('mn-holding');
      timer = window.setTimeout(() => {
        timer = null;
        if (!armed) return;
        armed = false;
        el.classList.remove('mn-holding');
        const rect = el.getBoundingClientRect();
        const cx = startX - rect.left;
        const cy = startY - rect.top;
        if (map.getZoom() < MIN_ZOOM_FOR_NOTE) { cb.current.onTooFar?.(cx, cy); return; }
        const pt = map.containerPointToLatLng([cx, cy]);
        cb.current.onPoint(pt.lat, pt.lng);
      }, HOLD_MS);
    };

    const moved = (clientX: number, clientY: number) => {
      if (!armed) return;
      if (Math.hypot(clientX - startX, clientY - startY) > MOVE_TOLERANCE_PX) cancel();
    };

    const onTouchStart = (e: TouchEvent) => {
      // Druhý prst = zoom, nie zápis.
      if (e.touches.length !== 1) { cancel(); return; }
      const t0 = e.touches[0];
      start(t0.clientX, t0.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) { cancel(); return; }
      const t0 = e.touches[0];
      moved(t0.clientX, t0.clientY);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;   // pravý klik má vlastnú cestu nižšie
      start(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => moved(e.clientX, e.clientY);

    // Pravý klik = tá istá akcia bez čakania (PC skratka). Zároveň to potláča
    // systémové menu, ktoré by inak prekrylo náš panel.
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      cancel();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      if (map.getZoom() < MIN_ZOOM_FOR_NOTE) { cb.current.onTooFar?.(cx, cy); return; }
      const pt = map.containerPointToLatLng([cx, cy]);
      cb.current.onPoint(pt.lat, pt.lng);
    };

    // Nad zoomovým prahom je kurzor KLASICKÁ ŠÍPKA (Matej 2026-08-20: „klasická
    // šípka a vedľa +") — plusko s prstencom vedľa nej kreslí `MapNoteCursor`.
    // Predtým tu bol `crosshair`, ktorý sa s pluskom bil o tú istú úlohu.
    // Na mobile kurzor neexistuje a nápovedu tam nesie `MapNoteHint`.
    const syncArmed = () => el.classList.toggle('mn-armed', map.getZoom() >= MIN_ZOOM_FOR_NOTE);
    syncArmed();
    map.on('zoomend', syncArmed);

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
    el.addEventListener('contextmenu', onContextMenu);
    // Zoom/pan počas držania gesto ruší — inak by sa bod zapísal inam, než kam
    // človek mieril.
    map.on('movestart zoomstart', cancel);

    return () => {
      cancel();
      el.classList.remove('mn-armed');
      map.off('zoomend', syncArmed);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', cancel);
      el.removeEventListener('touchcancel', cancel);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', cancel);
      el.removeEventListener('mouseleave', cancel);
      el.removeEventListener('contextmenu', onContextMenu);
      map.off('movestart zoomstart', cancel);
    };
  }, [map, enabled]);
}

// `.mn-holding` = vizuálna spätná väzba počas držania (kurzor), aby človek videl,
// že sa niečo deje, a nepustil to o 200 ms skôr.
export const LONG_PRESS_CSS = `
.leaflet-container.mn-armed{cursor:default;}
.leaflet-container.mn-holding{cursor:progress;}
/* Režim „ukáž miesto" — typ je vybraný a čaká sa na jediný klik. Zameriavač je
   tu na mieste (na rozdiel od stavu vyššie): mapa v tej chvíli neposúva, ale
   MIERI. */
.leaflet-container.mn-placing{cursor:crosshair;}
`;

/**
 * Režim „ukáž miesto": typ odkazu je už vybraný a čaká sa na JEDINÝ klik.
 *
 * Je to samostatný hook, nie prepínač v `useLongPressPoint`, lebo ide o opačné
 * poradie krokov (typ → miesto vs. miesto → typ) a miešanie oboch do jedného
 * efektu by znamenalo, že sa počas držania rieši aj klik.
 *
 * ⚠️ Leafletový `click` sa neemituje pri ťahaní mapy ani pri dvojkliku (zoom),
 * takže sa nemusí rozlišovať ručne — na rozdiel od natívneho `click` na elemente.
 */
export function useMapClickPoint(
  map: LeafletMap | null,
  enabled: boolean,
  { onPoint, onTooFar }: LongPressHandlers,
) {
  const cb = useRef({ onPoint, onTooFar });
  cb.current = { onPoint, onTooFar };

  useEffect(() => {
    if (!map || !enabled) return;
    const el = map.getContainer();
    el.classList.add('mn-placing');
    const onClick = (e: LeafletMouseEvent) => {
      // `containerPoint` dáva Leaflet rovno — netreba prepočet cez getBoundingClientRect.
      if (map.getZoom() < MIN_ZOOM_FOR_NOTE) { cb.current.onTooFar?.(e.containerPoint.x, e.containerPoint.y); return; }
      cb.current.onPoint(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', onClick);
    return () => {
      el.classList.remove('mn-placing');
      map.off('click', onClick);
    };
  }, [map, enabled]);
}
