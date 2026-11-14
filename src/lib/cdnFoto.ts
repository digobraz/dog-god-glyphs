// ── FOTKY Z CLOUDINARY IDÚ CEZ CACHE CLOUDFLARE (14. 11. 2026) ─────────────────────
// Matej: „prečo mi nejde znížiť členstvo?“ — Cloudinary Free má 25 kreditov, za 30 dní
// sme minuli 35, z toho 23,6 PRENOS: každé zobrazenie fotky šlo znova z res.cloudinary.com.
// Každá URL `res.cloudinary.com/dz8lolmod/…` sa preto prepíše na `<dogypt>/cdn/…`
// a Worker (scripts/cloudflare/worker.js, `cdn`) ju vydá z okraja Cloudflare.
//
// Prepis je na JEDNOM mieste ako `devUsporneFoto.ts` (setAttribute, src/srcset, štýly, fetch),
// lebo URL fotiek prichádzajú z DB v desiatkach polí a komponentov.
// Mimo: DEV (tam šetrí devUsporneFoto), robot (`navigator.webdriver` — LIVE stráže idú priamo,
// nech nemíňajú požiadavky Workera) a `localStorage.priamoFoto = '1'` (núdzový vypínač) — rozhoduje index.html.

const PRIAMO = 'https://res.cloudinary.com/dz8lolmod/';
const VSETKY = /https:\/\/res\.cloudinary\.com\/dz8lolmod\//g;

// Základ adresy aj vypínače rozhoduje skript v index.html (`window.__cdn`) — to isté pravidlo
// potrebuje už predbežné sťahovanie dlaždíc, ktoré beží pred týmto modulom. Prázdny = priamo.
const CDN = typeof window !== 'undefined' ? ((window as Window & { __cdn?: string }).__cdn || '') : '';

if (import.meta.env.PROD && CDN) {
  const prepis = (v: unknown): unknown =>
    typeof v === 'string' && v.includes(PRIAMO) ? v.replace(VSETKY, CDN) : v;
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
}
