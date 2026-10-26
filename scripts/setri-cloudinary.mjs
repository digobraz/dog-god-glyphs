// ROBOTI NEŤAHAJÚ PLNÉ FOTKY Z CLOUDINARY (19. 10. 2026)
//
// Cloudinary 18. 10. strhol $29 (Small PAYG). Za 30 dní 32 GB prenosu, z toho
// HeadlessChrome 67 % a stránky localhost/127.0.0.1 61 % — naše stráže, snímky,
// prerender a sondy. Ľudia na dogypt.com ~6 GB, to sa zmestí do Free (25 kreditov).
//
// Použitie:  const browser = setriCloudinary(await chromium.launch());
// Každá požiadavka na res.cloudinary.com/dz8lolmod/image/upload/ dostane na KONIEC
// reťaze strop `c_limit,w_40` (do 26. 10. 2026 w_480) (rovnaké pravidlo vsuvky ako `sizedUrl` v appke).
// Fotka ostane na snímke rozpoznateľná a živá (401 „cloud disabled" stráž stále vidí),
// len má desiatky kB namiesto 1–2,4 MB originálu.
// Plné fotky (meranie váhy, snímka na schválenie):  PLNE_FOTO=1 node …
//
// ⚠️ Kópia z DOGYPT repa: scripts/lib/setri-cloudinary.mjs — meň obe.

const UPLOAD = 'res.cloudinary.com/dz8lolmod/image/upload/';
const STROP = 'c_limit,w_40,f_auto,q_auto:low'; // 26. 10. 2026: 480 → 40 px, stráž meria len naturalWidth > 0
const CIEL = /^https:\/\/res\.cloudinary\.com\/dz8lolmod\/image\/upload\//;

export function zmensiCloudinary(url) {
  const i = url.indexOf(UPLOAD);
  if (i < 0 || url.includes(STROP) || /\.pdf($|\?)/i.test(url)) return url;
  const pred = url.slice(0, i + UPLOAD.length);
  const casti = url.slice(i + UPLOAD.length).split('/');
  let k = 0;
  while (k < casti.length - 1 && !/^v\d+$/.test(casti[k]) && /(^|,)[a-z]{1,3}_/.test(casti[k])) k++;
  casti.splice(k, 0, STROP);
  return pred + casti.join('/');
}

const presmeruj = (route) => {
  const u = route.request().url();
  const z = zmensiCloudinary(u);
  return z === u ? route.continue() : route.continue({ url: z });
};

/** Obalí Browser (alebo BrowserContext z launchPersistentContext). Vracia ten istý objekt. */
export function setriCloudinary(ciel, { plne = process.env.PLNE_FOTO === '1' } = {}) {
  if (plne || !ciel) return ciel;
  if (typeof ciel.newContext === 'function') {
    const nc = ciel.newContext.bind(ciel);
    ciel.newContext = async (...a) => { const c = await nc(...a); await c.route(CIEL, presmeruj); return c; };
    const np = ciel.newPage.bind(ciel);
    ciel.newPage = async (...a) => { const p = await np(...a); await p.context().route(CIEL, presmeruj); return p; };
  } else if (typeof ciel.route === 'function') {
    ciel.route(CIEL, presmeruj);
  }
  return ciel;
}
