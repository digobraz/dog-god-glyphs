// TARGET — snímka obrazovky priamo do chatu AINUBISA (Matej 26. 9. 2026: „tlačítko s označením
// target… človek by vedel urobiť screenshot obrazovky priamo do chatu, aby nemusel ukladať k sebe").
//
// PREČO TAKTO. Prehliadač vie odfotiť obrazovku dvoma spôsobmi:
//   · `getDisplayMedia` — pýta povolenie „zdieľať obrazovku" a na mobile NEEXISTUJE. Zamietnuté.
//   · prekreslenie DOM do obrázka (`html-to-image`, v appke už je kvôli share karte) — bez
//     povolenia, na mobile aj PC. Toto.
// ⚠️ Knižnica sa načíta až po kliknutí na terč (`import()`), nie s chatom.
// ⚠️ Obrázky z cudzích serverov bez CORS (dlaždice mapy) môžu na snímke ostať prázdne —
//    `imagePlaceholder` ich nahradí priehľadným pixelom, snímka sa nezlomí.
// ⚠️ ZÁBER = VIDITEĽNÉ OKNO, nie celá stránka. Koreň sa posunie záporným okrajom o `scrollY`:
//    obsah v toku sa posunie, `position: fixed` (lišta, hlavička) ostane tam, kde ho človek vidí.
//    `transform` by to pokazil — fixné prvky by sa posunuli s ním.

/** Priehľadný 1×1 GIF namiesto obrázka, ktorý sa nedá prečítať. */
const BLANK =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Prvky, ktoré na snímku nepatria: samotný chat, jeho guľa a závoj terča. */
const SKIP_CLASSES = ['ainubis-panel', 'ainubis-launcher', 'ainubis-target-veil'];

export type TargetMark = { x: number; y: number } | null;

export async function captureViewport(mark: TargetMark): Promise<File> {
  const { toCanvas } = await import('html-to-image');
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const bg = getComputedStyle(document.body).backgroundColor || '#000';

  const canvas = await toCanvas(document.documentElement, {
    width: w,
    height: h,
    pixelRatio: ratio,
    backgroundColor: bg,
    imagePlaceholder: BLANK,
    style: { marginTop: `-${window.scrollY}px`, marginLeft: `-${window.scrollX}px` },
    // ⚠️ `<noscript>` VON: kópia stránky sa kreslí ako obrázok BEZ JavaScriptu, takže jeho
    //    obsah sa v nej ZOBRAZÍ — na /pack pridal hore ~96 px a celý záber sa posunul.
    filter: (node) =>
      !(node instanceof HTMLElement &&
        (node.tagName === 'NOSCRIPT' || SKIP_CLASSES.some((c) => node.classList.contains(c)))),
  });

  // KRÚŽOK NA MIESTE, KAM ČLOVEK ŤUKOL — AINUBISOVA zlatá, s tmavým lemom, aby bol vidno
  // na bledom papyruse aj na čiernej.
  if (mark) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const x = mark.x * ratio;
      const y = mark.y * ratio;
      const r = 28 * ratio;
      ctx.lineWidth = 7 * ratio;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 4 * ratio;
      ctx.strokeStyle = '#F5C73D';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
  if (!blob) throw new Error('capture-empty');
  return new File([blob], `obrazovka-${Date.now()}.png`, { type: 'image/png' });
}

/**
 * Riadok s okolnosťami pod správu — kde to človek videl. Pri hľadaní chyby povie viac než
 * samotný obrázok. Ide do POĽA na písanie, nie potajme na server: človek ho vidí a môže zmazať.
 */
export function targetContext(): string {
  const ua = navigator.userAgent;
  const device = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'iné';
  const browser = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return `— ${location.pathname}${location.search} · ${window.innerWidth}×${window.innerHeight} · ${device}${browser ? ' ' + browser : ''}`;
}
