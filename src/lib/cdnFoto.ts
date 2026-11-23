// ── FOTKY Z CLOUDINARY IDÚ CEZ CACHE CLOUDFLARE (14. 11. 2026) ─────────────────────
// Matej: „prečo mi nejde znížiť členstvo?“ — Cloudinary Free má 25 kreditov, za 30 dní
// sme minuli 35, z toho 23,6 PRENOS: každé zobrazenie fotky šlo znova z res.cloudinary.com.
// Každá URL `res.cloudinary.com/dz8lolmod/…` sa preto prepíše na `<dogypt>/cdn/…`
// a Worker (scripts/cloudflare/worker.js, `cdn`) ju vydá z okraja Cloudflare.
//
// Prepis je na JEDNOM mieste ako `devUsporneFoto.ts` (setAttribute, src/srcset, štýly, fetch),
// lebo URL fotiek prichádzajú z DB v desiatkach polí a komponentov.
// Mimo: DEV (tam šetrí devUsporneFoto), robot (`navigator.webdriver` — LIVE stráže idú len cez `/cdn-cgi/image`,
// bez Workera, nech nemíňajú jeho požiadavky) a `localStorage.priamoFoto = '1'` (núdzový vypínač) — rozhoduje index.html.

const PRIAMO = 'https://res.cloudinary.com/dz8lolmod/';
const VSETKY = /https:\/\/res\.cloudinary\.com\/dz8lolmod\/(image\/upload\/)?/g;

// Základ adresy aj vypínače rozhoduje skript v index.html (`window.__cdn`) — to isté pravidlo
// potrebuje už predbežné sťahovanie dlaždíc, ktoré beží pred týmto modulom. Prázdny = priamo.
const CDN = typeof window !== 'undefined' ? ((window as Window & { __cdn?: string }).__cdn || '') : '';
const CDN_I = typeof window !== 'undefined' ? ((window as Window & { __cdnI?: string }).__cdnI || '') : '';
// 15. 11. 2026: fotky (`image/upload/`) idú cez Cloudflare Image Transformations (`/cdn-cgi/image/format=auto/<cloudinary>`,
// bez Workera), video a ostatné cez Worker `/cdn/`. Už prepísaná URL nesie pôvodnú za `format=auto/` — preskočiť.
const SPAT = /https:\/\/[^/\s"')]+\/cdn-cgi\/image\/format=auto\/(https:\/\/res\.cloudinary\.com\/dz8lolmod\/)/g;
let bezPrepisu = false;

if (import.meta.env.PROD && (CDN || CDN_I)) {
  const prepis = (v: unknown): unknown =>
    typeof v === 'string' && !bezPrepisu && v.includes(PRIAMO)
      ? v.replace(VSETKY, (m: string, img: string | undefined, off: number, str: string) => {
          if (str.slice(Math.max(0, off - 12), off) === 'format=auto/') return m;
          return (img && CDN_I ? CDN_I : CDN) || m;
        })
      : v;
  const obal = (proto: object, meno: string) => {
    const d = Object.getOwnPropertyDescriptor(proto, meno);
    if (!d?.set) return;
    Object.defineProperty(proto, meno, { ...d, set(v: unknown) { d.set!.call(this, prepis(v)); } });
  };
  // React kladie `src` cez setAttribute, vanilla GodsGrid cez vlastnosť, film cez štýl.
  const setAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (meno: string, hodnota: string) {
    return setAttr.call(this, meno, prepis(hodnota) as string);
  };
  obal(HTMLImageElement.prototype, 'src');
  obal(HTMLImageElement.prototype, 'srcset');
  obal(HTMLSourceElement.prototype, 'srcset');
  obal(HTMLLinkElement.prototype, 'href');
  obal(Element.prototype, 'innerHTML');
  const css = CSSStyleDeclaration.prototype;
  for (const p of ['background', 'backgroundImage', 'cssText', 'maskImage', 'webkitMaskImage', 'content']) obal(css, p);
  const setProp = css.setProperty;
  css.setProperty = function (meno: string, hodnota: string | null, priorita?: string) {
    return setProp.call(this, meno, prepis(hodnota) as string | null, priorita);
  };
  const f = window.fetch;
  window.fetch = (vstup: RequestInfo | URL, init?: RequestInit) =>
    f(typeof vstup === 'string' ? (prepis(vstup) as string) : vstup, init);

  // Záloha: fotka cez /cdn-cgi/image sa nenačíta (chyba 9422 nad limitom, výpadok) → raz priamo z res.cloudinary.com.
  const spat = (v: string) => v.replace(SPAT, '$1');
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement) || t.dataset.cdnZaloha === '2') return;
    // Aj fotka cez Worker `/cdn/` má zálohu (21. 11. 2026): pri záplave Worker nové (necachované) fotky
    // odmieta 503, aby útok nepálil Cloudinary cez nás — návštevník ju vtedy dostane raz priamo.
    const cezWorker = !!CDN && (t.src.startsWith(CDN) || t.srcset.includes(CDN));
    if (!cezWorker && !t.src.includes('/cdn-cgi/image/') && !t.srcset.includes('/cdn-cgi/image/')) return;
    // Poradie (23. 11. 2026, šetrenie prenosu Cloudinary): 1. chyba `/cdn-cgi/image` → Worker `/cdn/`,
    // 2. chyba (Worker alebo už zálohovaný) → priamo res.cloudinary.com. `cdnZaloha='2'` = koniec, žiadna slučka.
    const nasledujuci = cezWorker || !CDN ? '2' : '1';
    t.dataset.cdnZaloha = nasledujuci;
    bezPrepisu = true;
    const priamo = (v: string) => (nasledujuci === '1' ? spat(v).split(PRIAMO).join(CDN) : cezWorker ? spat(v).split(CDN).join(PRIAMO) : spat(v));
    try { if (t.srcset) t.srcset = priamo(t.srcset); t.src = priamo(t.src); } finally { bezPrepisu = false; }
  }, true);
}
