// ZNAČKA NA KURZORE počas označovania miesta (MapPlaceCursor).
//
// ⛔ PLUSKO PRI KURZORE (`MapNoteCursor`, 20. 8. 2026) ZRUŠENÉ 3. 10. 2026 spolu s dlhým
// podržaním — Matej: zápis do mapy len cez `+` v lište, panel pri prste netreba.
// Pôvodný text a kód: git log tohto súboru pred 3. 10. 2026.
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { noteMarkHtml } from './MapNotesLayer';
import { circleMarkHtml } from './circleMark';
import { GROUP_EMOJI } from './markEmoji';
import { GROUP_TINT } from './NotePalette';
import type { NoteGroup, NoteKind } from './mapNotesData';

/**
 * ── ZNAČKA NA KURZORE POČAS OZNAČOVANIA (Matej 2026-08-27) ──────────────────
 * „na PC ak mám vybraté Parkovisko a kliknem na označ, kurzor myši by sa mi mal zmeniť
 *  na emoji Parkingu, aby to bolo zrejmé pri pridávaní."
 *
 * Do 27. 8. tu v tej chvíli nebolo NIČ: `MapNoteCursor` sa pri `notePlacing` schová
 * (plusko by pozývalo do druhého zápisu) a ostala holá šípka nad mapou. Jediné, čo
 * hovorilo „ideš klikať parkovisko", bola veta hore pri AInubisovi — teda na opačnom
 * konci obrazovky než oko, ktoré hľadá miesto.
 *
 * ⚠️ ZNAČKU NEKRESLÍ TENTO SÚBOR — volá `noteMarkHtml()`, teda presne to, čo po kliknutí
 * na mape zostane. Vlastná kresba by bola štvrtá kópia kruhu a rozišla by sa pri prvej
 * zmene (dôvod je rozpísaný v `circleMark.ts`).
 *
 * ⚠️ Kým druh NIE JE vybraný, nesie kurzor ROZCESTNÍK skupiny (⚠️ / 🐶 / 🅿️), nie prvý
 * podtyp. `GROUP_KINDS.warning[0]` sú kliešte — a 🩸 pod kurzorom by sľuboval kliešte
 * človeku, ktorý ide označiť medveďa. Rovnaká úvaha ako pri `GROUP_EMOJI`.
 *
 * ⚠️ Natívny kurzor sa skrýva (`cursor:none` na kontajneri mapy), lebo Matej si pýtal
 * ZMENU kurzora, nie druhý prvok vedľa šípky. Značka preto sedí PRESNE na bode, kam
 * klik dopadne — je to náhľad, nie ozdoba. Na dotyku sa nekreslí vôbec.
 */
export function MapPlaceCursor({
  map,
  group,
  kind,
  ready,
}: {
  map: LeafletMap | null;
  group: NoteGroup;
  kind?: NoteKind | null;
  /** mapa je dosť priblížená na to, aby klik zabral */
  ready: boolean;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    if (!map) { setOver(false); return; }
    const el = map.getContainer();
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      const node = elRef.current;
      if (node) node.style.transform = `translate3d(${x}px,${y}px,0)`;
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
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    // Trieda na kontajneri, nie inline štýl: Leaflet si `cursor` na kontajneri prepisuje
    // sám (`leaflet-grab` / `leaflet-dragging`), takže inline hodnota by pri prvom ťahnutí
    // zmizla. Trieda s vyššou špecificitou to prežije.
    el.classList.add('mn-placing');
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.classList.remove('mn-placing');
    };
  }, [map]);

  if (!map || !over) return null;

  const html = kind
    ? noteMarkHtml(kind)
    : group === 'parking'
      ? `<div class="mn-mark mn-mark--emoji"><i>${GROUP_EMOJI.parking}</i></div>`
      : circleMarkHtml(GROUP_EMOJI[group], GROUP_TINT[group]);

  return (
    <div className={`mpc${ready ? '' : ' is-far'}`} ref={elRef} aria-hidden>
      <style>{MAP_NOTE_CURSOR_CSS}</style>
      <span className="mpc-mark" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export const MAP_NOTE_CURSOR_CSS = `
/* ── ZNAČKA NA KURZORE POČAS OZNAČOVANIA ──────────────────────────────────── */
.mpc{position:absolute;top:0;left:0;z-index:641;pointer-events:none;will-change:transform;}
/* Značka sa centruje sama (mk-circle aj mn-mark majú translate(-50%,-50%)), takže
   obal nič neposúva — bod pod kurzorom JE bod, kam značka dopadne. */
.mpc-mark{position:absolute;left:0;top:0;filter:drop-shadow(0 2px 7px rgba(0,0,0,0.55));}
/* Málo priblížené = klik nezaberie. Značka to musí povedať sama, inak človek klope
   do mapy a nič sa nedeje (tú vetu má AInubis hore, ale oko je pri kurzore). */
.mpc.is-far{opacity:.45;}
.leaflet-container.mn-placing,.leaflet-container.mn-placing .leaflet-grab{cursor:none;}
@media (hover:none){.mpc{display:none;}.leaflet-container.mn-placing{cursor:auto;}}
`;
