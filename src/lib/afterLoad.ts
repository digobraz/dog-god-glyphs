// Odklad „až po stránke" (perf 7. 10. 2026, Matej: „všetky stránky do 2 sekúnd").
// Veci, ktoré prvý obraz nepotrebuje (Supabase klient pre jazyk v účte a identitu analytiky,
// AINUBIS), sa začnú sťahovať až po `load` + vykreslení obsahu (LCP + 1,2 s), alebo pri prvom dotyku.
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
    // 🔴 `load` NESTAČÍ (fáza 2, 7. 10. 2026): padne skôr, než React nakreslí obsah stránky, a
    // AINUBIS + Supabase + ich ikonky (~150 kB) potom brali linku textu /terms či /login.
    // Čaká sa preto aj na vykreslenie: posledný záznam LCP + 1,2 s pokoja, strop 6 s po `load`.
    const settled = () => {
      let t = window.setTimeout(idle, 1200);
      const cap = window.setTimeout(idle, 6000);
      try {
        new PerformanceObserver(() => { window.clearTimeout(t); t = window.setTimeout(() => { window.clearTimeout(cap); idle(); }, 1200); })
          .observe({ type: 'largest-contentful-paint', buffered: true });
      } catch { /* Safari bez LCP — ostane 1,2 s po load */ }
    };
    if (document.readyState === 'complete') settled(); else window.addEventListener('load', settled, { once: true });
    for (const ev of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(ev, go, { once: true, passive: true });
  });
  return p;
}
