// ── ŠUPLÍK S ÚCHYTOM SA DÁ VŽDY STIAHNUŤ (Matej 25. 10. 2026) ─────────────────────────────────
// *„pri detaile bones by sa malo dať odísť nie len klikom vedľa, ale aj stiahnutím, lebo je to taký popup,
//  ktorý má tú pomlčku hore = to by sa malo dať vždy aj stiahnuť"*. Úchyt je sľub gesta — kto ho kreslí,
// ťahá cez tento hook. Logika je z panela „+" (`AddTripEntry`, 21. 9. 2026), vytiahnutá, aby sa
// šuplíky neťahali každý inak.
// ⚠️ PRAH 96 px ALEBO RÝCHLY ŠVIH (nad 0,6 px/ms) — bez rýchlosti treba ťahať cez pol obrazovky,
//    bez prahu by zavrelo aj zachvenie prsta.
// ⚠️ Ťahá sa VRCH šuplíka (úchyt + hlavička), nie telo — telo roluje. Tlačidlá a polia vo vrchu
//    gesto nezačnú, inak by `setPointerCapture` zhltol ich klik.
// ⚠️ Posun je `transform`, nie výška — výška by pri každom prste prepočítala celý obsah.
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const CLOSE_PX = 96;
const FLICK = 0.6;

export function useSheetSwipe(onClose: () => void) {
  const [drag, setDrag] = useState(0);
  const start = useRef<{ y: number; t: number } | null>(null);

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    start.current = { y: e.clientY, t: e.timeStamp };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!start.current) return;
    setDrag(Math.max(0, e.clientY - start.current.y));
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dy = e.clientY - s.y;
    if (dy > CLOSE_PX || dy / Math.max(1, e.timeStamp - s.t) > FLICK) { onClose(); return; }
    setDrag(0);
  };

  return {
    drag,
    /** Na vrch šuplíka (úchyt + hlavička). */
    handle: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, style: { touchAction: 'none' } as CSSProperties },
    /** Na šuplík — počas ťahu ide s prstom, bez animácie. */
    sheetStyle: drag ? ({ transform: `translateY(${drag}px)`, transition: 'none', animation: 'none' } as CSSProperties) : undefined,
  };
}
