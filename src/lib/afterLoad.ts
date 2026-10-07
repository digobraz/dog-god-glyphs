// Odklad „až po stránke" (perf 7. 10. 2026, Matej: „všetky stránky do 2 sekúnd").
// Veci, ktoré prvý obraz nepotrebuje (Supabase klient pre jazyk v účte a identitu analytiky,
// AINUBIS), sa začnú sťahovať až po `load` + chvíľke nečinnosti, alebo pri prvom dotyku.
// Dovtedy by brali linku obsahu stránky — na pomalom mobile to boli sekundy.
let p: Promise<void> | null = null;
export function afterLoad(): Promise<void> {
  if (p) return p;
  p = new Promise<void>((resolve) => {
    if (typeof window === 'undefined') { resolve(); return; }
    let done = false;
    const go = () => { if (!done) { done = true; resolve(); } };
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
    const idle = () => { if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 300); };
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });
    for (const ev of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(ev, go, { once: true, passive: true });
  });
  return p;
}
