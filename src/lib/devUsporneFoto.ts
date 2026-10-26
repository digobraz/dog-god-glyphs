// ── ROBOT NA LOKÁLE NEŤAHÁ PLNÉ FOTKY (19. 10. 2026) ─────────────────────────────
// Cloudinary účet 18. 10. strhol $29: z 32 GB prenosu za mesiac išlo 61 % na
// localhost/127.0.0.1 a 67 % pýtal HeadlessChrome — testy, snímky a sondy sessions,
// nie ľudia. Skutoční návštevníci dogypt.com sa zmestia do Free (25 kreditov).
//
// Keď v DEVe ovláda prehliadač automat (Playwright, Puppeteer, DevTools MCP ⇒
// `navigator.webdriver`), každá URL z `res.cloudinary.com/dz8lolmod/image/upload/`
// dostane na KONIEC reťaze strop `c_limit,w_40` (do 26. 10. 2026 w_480). Fotka ostane rozpoznateľná na
// snímke, ale má desiatky kB namiesto 1–2,4 MB originálu.
// Plné fotky pre robota: `?plneFoto` v URL alebo `localStorage.plneFoto = '1'`.
//
// Produkcie sa to NEDOTKNE — celé telo je za `import.meta.env.DEV`. Robotov, ktoré
// merajú LIVE, šetrí `scripts/lib/setri-cloudinary.mjs`.

const UPLOAD = 'res.cloudinary.com/dz8lolmod/image/upload/';
const STROP = 'c_limit,w_40,f_auto,q_auto:low'; // 26. 10. 2026: 480 → 40 px, stráž meria len naturalWidth > 0
const VSETKY = /https:\/\/res\.cloudinary\.com\/dz8lolmod\/image\/upload\/[^\s"'()<>,]+/g;

/** Strop ako posledná fáza reťaze — rovnaké pravidlo vsuvky ako `sizedUrl`. */
export const zmensiCloudinary = (url: string): string => {
  const i = url.indexOf(UPLOAD);
  if (i < 0 || url.includes(STROP) || /\.pdf($|\?)/i.test(url)) return url;
  const pred = url.slice(0, i + UPLOAD.length);
  const casti = url.slice(i + UPLOAD.length).split('/');
  let k = 0;
  while (k < casti.length - 1 && !/^v\d+$/.test(casti[k]) && /(^|,)[a-z]{1,3}_/.test(casti[k])) k++;
  casti.splice(k, 0, STROP);
  return pred + casti.join('/');
};

const prepis = (v: unknown): unknown =>
  typeof v === 'string' && v.includes(UPLOAD) ? v.replace(VSETKY, zmensiCloudinary) : v;

const zapnute = (): boolean => {
  if (!navigator.webdriver) return false;
  try {
    if (new URLSearchParams(location.search).has('plneFoto')) return false;
    if (localStorage.getItem('plneFoto') === '1') return false;
  } catch { /* bez úložiska šetríme */ }
  return true;
};

const obal = (proto: object, meno: string) => {
  const d = Object.getOwnPropertyDescriptor(proto, meno);
  if (!d?.set) return;
  Object.defineProperty(proto, meno, { ...d, set(v: unknown) { d.set!.call(this, prepis(v)); } });
};

if (import.meta.env.DEV && typeof window !== 'undefined' && zapnute()) {
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
  console.info('[devUsporneFoto] robot v DEVe — fotky z Cloudinary idú zmenšené (?plneFoto vypne)');
}
