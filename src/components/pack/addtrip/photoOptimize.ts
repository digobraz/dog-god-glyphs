// FOTKY ČLENSKÝCH VÝLETOV — zmenšenie a kódovanie pred uložením do localStorage.
//
// ⚠️ ŽIJE VO VLASTNOM SÚBORE, NIE V `AddTripLog.tsx` (2026-08-25). Tie isté pravidlá potrebuje
// aj úprava už zapísaného výletu (`TripEditPanel.tsx`) — a keby si ich napísala vlastné,
// rozišli by sa v deň, keď sa jedno z čísel doladí. Rozpočet na fotku pritom nie je kozmetika:
// pri jeho prekročení `writeLocalTrails` vráti `false` a NEULOŽÍ SA CELÝ VÝLET.

// 15, nie 10 (Matej 2026-08-23 vybral z galérie 14 a štyri ticho odpadli). Strop drží
// `PHOTO_BUDGET_CHARS` nižšie: 15 × ~100 kB base64 ≈ 1,5 MB, teda pod tretinou kvóty
// localStorage aj s rezervou na zvyšné dáta mapy.
export const MAX_PHOTOS = 15;
/**
 * ROZPOČET NA JEDNU FOTKU (znaky data URL, nie bajty súboru).
 *
 * Matej 2026-08-23: „na záver ked som pridal foto vypísalo že nemožno uložiť ulozisko je plne…
 * dal som 14 fotiek… oprav to ono to musi niečo zvladnuť + ihned po nahrani sa to musí
 * skonsolidovať a optimalizovať velkostne aj formatovo = 80% uspora cca možno aj viac".
 *
 * Prečo strop a nie pevná kvalita: doteraz sa kódovalo JPEG-om s fixným `quality = 0.72`, čo
 * z 12 Mpx fotky z telefónu spraví 200–400 kB a v base64 (+33 %) až pol megabajtu. Desať kusov
 * teda vedelo naplniť `localStorage` (~5 MB) samo, a `writeLocalTrails` vrátil `false` =
 * CELÝ VÝLET sa neuložil. Fixná kvalita nevie, koľko miesta ostalo — strop áno.
 *
 * 100 000 znakov ≈ 73 kB obrázka. Desať fotiek ≈ 1 MB, teda pätina kvóty aj s rezervou na
 * zvyšné dáta mapy.
 */
const PHOTO_BUDGET_CHARS = 100_000;

/** Postupné ústupky, kým sa fotka nezmestí do rozpočtu. Najprv kvalita, až potom rozmer —
 *  rozmazať detail je menšia strata než prísť o šírku záberu. */
const PHOTO_STEPS: Array<{ maxDim: number; quality: number }> = [
  { maxDim: 1280, quality: 0.72 },
  { maxDim: 1280, quality: 0.58 },
  { maxDim: 1080, quality: 0.5 },
  { maxDim: 900, quality: 0.45 },
  { maxDim: 720, quality: 0.4 },
];

/**
 * WEBP, KEĎ HO PREHLIADAČ VIE (Safari od 14, teda aj iPhone, na ktorom sa testuje).
 *
 * `toDataURL` s neznámym typom NEHODÍ chybu — ticho vráti PNG, čo je pri fotke to najhoršie
 * z oboch svetov (veľké aj bez straty). Preto sa výsledok kontroluje podľa prefixu a pri
 * nezhode sa kóduje JPEG-om. Rozdiel je ~30 % pri rovnakej kvalite, teda polovica úspory.
 */
function encodeCanvas(canvas: HTMLCanvasElement, quality: number): string | null {
  try {
    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return null;
  }
}

function drawToCanvas(img: HTMLImageElement, maxDim: number): HTMLCanvasElement | null {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

export function optimizePhoto(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let last: string | null = null;
      for (const step of PHOTO_STEPS) {
        const canvas = drawToCanvas(img, step.maxDim);
        if (!canvas) break;
        const out = encodeCanvas(canvas, step.quality);
        if (!out) break;
        last = out;
        if (out.length <= PHOTO_BUDGET_CHARS) break;
      }
      // Posledný pokus sa vracia aj keď je nad rozpočtom — fotka z panorámy sa pod strop
      // dostať nemusí a zahodiť ju ticho by bolo horšie než uložiť o niečo väčšiu.
      resolve(last);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}
