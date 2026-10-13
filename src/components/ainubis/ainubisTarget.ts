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

/**
 * Prvok celý POD spodným okrajom okna — na snímku aj tak nepadne, tak sa ani nekreslí.
 *
 * ⚠️ PREČO (8. 10. 2026, testerka na Android Chrome): na `/pack/dogs` (stránka ~3 900 px,
 *    plná fotiek) vyšla trikrát len tapeta a spodná lišta, kým na krátkom kvíze celá
 *    snímka. Desktop Chromium tú istú stránku nakreslí. Odhad: kópia celej stránky
 *    s vloženými obrázkami je pre mobilný prehliadač priveľká a obsah vypadne.
 *    Stránka pod oknom tvorí väčšinu objemu, preto ide preč ako prvá.
 * ⚠️ LEN POD OKNOM, NIE NAD NÍM. Záber sa posúva záporným okrajom o `scrollY` —
 *    zahodený prvok nad oknom by obsah v toku posunul hore a snímka by ukázala iné miesto.
 */
function belowFold(node: HTMLElement, viewH: number): boolean {
  const r = node.getBoundingClientRect();
  return r.height > 0 && r.top > viewH;
}

/**
 * POSUNUTÉ PÁSY → POSUN DETÍ. Vráti funkciu, ktorá všetko vráti späť.
 *
 * ⚠️ PREČO (13. 10. 2026, testerka na Android Chrome): v Tripliste odsunula riadok PREJDENÉ
 *    na Zugersee, ťukla naň a snímka ukázala Fälensee. `html-to-image` (1.11.13) kopíruje DOM
 *    bez `scrollLeft`/`scrollTop` vnútorných kontajnerov, takže každý vodorovný pás
 *    (`.tl-hscroll` a pod.) vyjde na snímke od začiatku — a krúžok ukazuje na inú kartu.
 *    Posun kontajnera = posun jeho detí opačným smerom: kontajner vrátime na 0 a deťom dáme
 *    `translate` o ten istý kus. Človek nevidí zmenu a kópia nesie posun v štýle.
 */
function bakeScroll(): () => void {
  const undo: Array<() => void> = [];
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
    const sl = el.scrollLeft;
    const st = el.scrollTop;
    if (!sl && !st) continue;
    if (SKIP_CLASSES.some((c) => el.closest(`.${c}`))) continue;
    const kids = Array.from(el.children).filter((k): k is HTMLElement => k instanceof HTMLElement);
    const prev = kids.map((k) => k.style.translate);
    el.scrollLeft = 0;
    el.scrollTop = 0;
    kids.forEach((k) => { k.style.translate = `${-sl}px ${-st}px`; });
    undo.push(() => {
      kids.forEach((k, i) => { k.style.translate = prev[i]; });
      el.scrollLeft = sl;
      el.scrollTop = st;
    });
  }
  return () => undo.reverse().forEach((f) => f());
}

export async function captureViewport(mark: TargetMark): Promise<File> {
  const { toCanvas } = await import('html-to-image');
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const bg = getComputedStyle(document.body).backgroundColor || '#000';

  // ⚠️ VSTUPNÉ ANIMÁCIE VYPNÚŤ (11. 10. 2026, príčina snímky bez obsahu na DOG ID): karty majú
  //    `animation: did-in … both` s `from{opacity:0}`. Kópia stránky sa kreslí ako statický obrázok
  //    a animácia v ňom stojí na čase 0 = priehľadná, takže ostala len tapeta a pevná lišta.
  //    Kým ide kópia, živému DOM-u animácie vypneme (stav `to` = to, čo človek vidí).
  const freeze = document.createElement('style');
  //    `scroll-behavior:auto` — inak by návrat pásov na pôvodné miesto (bakeScroll) išiel plynulo.
  freeze.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}';
  document.head.appendChild(freeze);
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  let canvas: HTMLCanvasElement;
  const unbake = bakeScroll();
  try {
    canvas = await toCanvas(document.documentElement, {
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
        (node.tagName === 'NOSCRIPT' || SKIP_CLASSES.some((c) => node.classList.contains(c)) ||
          belowFold(node, h))),
    });
  } finally {
    unbake();
    freeze.remove();
  }

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
