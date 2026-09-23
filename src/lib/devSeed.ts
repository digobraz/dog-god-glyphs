// ═══════════════════════════════════════════════════════════════════════════
// DEV SEED — ako sa testovacie dáta dostanú DO obrazovky (23. 9. 2026)
//
// Matej: *„chcem to mať na jednom mieste aby som to nemusel simulovať po iných
// stránkach"*. Lab (`/lab/heroflow`) drží obrazovky v ráme (iframe), takže beží
// v inom dokumente než lab — a `dogyptStore` **nepersistuje** nič okrem
// `selectedTier`/`selectedAmount` (`dogyptStore.ts`, partialize + migrate v4,
// zámerne: stale foto/meno medzi kupcami na zdieľanom zariadení). Rám by teda
// dostal prázdny store a `useFlowGuard` by ho okamžite odhodil na prvý krok.
//
// Preto tento súbor: lab zapíše seed do `localStorage`, rám ho pri štarte
// prečíta (`DevSeedBoot`) a vloží do store. localStorage je jediný kanál, ktorý
// prežije načítanie nového dokumentu a nechá lab a rám na tom istom origin.
//
// 🔴 CELÉ JE TO DEV-ONLY. Zápis aj čítanie sa vypínajú `import.meta.env.DEV`;
//    `DevSeedBoot` je v `App.tsx` zavesený za tú istú podmienku. Produkčný build
//    tento kód nevykoná ani keď mu niekto kľúč do localStorage podstrčí.
//
// ⚠️ SEED NIE JE STAV FLOW. Je to ŠTARTOVACIA POLOHA. Keď Matej v ráme klikne
//    ďalej, ďalšie kroky už bežia z reálneho store, nie odtiaľto.
// ═══════════════════════════════════════════════════════════════════════════

export const DEV_SEED_KEY = 'dogypt-dev-seed';

/** Ktorý popup má rám po načítaní otvoriť. `null` = žiadny, ide o obrazovku. */
export type DevSeedPopup = 'photo' | 'crop' | null;

export type DevSeed = {
  /** Meno psa — bez neho guard odhodí každý krok za fotkou. */
  dogName: string;
  email: string;
  /** Poradové číslo do popupu („Yours will be #72"). */
  packNumber: number;
  lifeStatus: 'alive' | 'deceased';
  /** Koľko ďalších psov nasypať do `extraDogs` (multi-pes obrazovka). */
  extraDogs: number;
  /** Fotka ako dataURL alebo cesta k assetu. Prázdne = bez fotky. */
  photoUrl: string;
  /** Aký tvar má seedovaná fotka — len na popis v labe. */
  photoLabel: string;
  popup: DevSeedPopup;
  /** Kedy bol seed zapísaný — rám podľa toho pozná, že je čerstvý. */
  ts: number;
};

export const DEV_SEED_DEFAULT: DevSeed = {
  dogName: 'HEKTHOR',
  email: 'matej@dogypt.com',
  packNumber: 73,
  lifeStatus: 'alive',
  extraDogs: 0,
  photoUrl: '',
  photoLabel: 'bez fotky',
  popup: null,
  ts: 0,
};

export function writeDevSeed(seed: DevSeed): void {
  if (!import.meta.env.DEV) return;
  try {
    localStorage.setItem(DEV_SEED_KEY, JSON.stringify({ ...seed, ts: Date.now() }));
  } catch (err) {
    // Fotka ako dataURL vie prekročiť kvótu localStorage (~5 MB). Nech to
    // nespadne ticho — lab bez seedu vyzerá „pokazený" a príčina by sa hľadala
    // v guarde. `makeTestPhoto` preto drží fotky pod 300 kB.
    console.error('[devSeed] seed sa nezmestil do localStorage:', err);
  }
}

export function readDevSeed(): DevSeed | null {
  if (!import.meta.env.DEV) return null;
  try {
    const raw = localStorage.getItem(DEV_SEED_KEY);
    if (!raw) return null;
    return { ...DEV_SEED_DEFAULT, ...(JSON.parse(raw) as Partial<DevSeed>) };
  } catch {
    return null;
  }
}

export function clearDevSeed(): void {
  try { localStorage.removeItem(DEV_SEED_KEY); } catch { /* prázdne úložisko */ }
}

// ───────────────────────────────────────────────────────────────────────────
// TESTOVACIE FOTKY
//
// 🔴 V REPE NIE JE ANI JEDNA LEŽATÁ PSIA FOTKA (premerané 23. 9. 2026 cez
//    `sips` nad `public/images` + `src/assets` — všetko je štvorec alebo na
//    výšku). A práve ležatá fotka je ten prípad, kvôli ktorému výrez vôbec
//    zostal v popupe: Matej 23. 9. *„čo ak človek pošle fotku na šírku a nebude
//    ju vedieť posunúť? a odide radšej"*. Bez nej sa auto-výrez nedá posúdiť.
//
// Preto sa testovacie fotky KRESLIA na plátne: pes (Hektorova hlava) sedí
// zámerne MIMO stredu, takže stredový `c_fill` bez gravitácie ho odreže — a je
// na prvý pohľad vidno, či `g_auto` zabralo. Mriežka a popis hrán hovoria, čo
// z fotky výrez ukrojil.
// ───────────────────────────────────────────────────────────────────────────

export type TestPhotoShape = 'portrait' | 'landscape' | 'square' | 'panorama';

export const TEST_PHOTO_SHAPES: { id: TestPhotoShape; label: string; w: number; h: number }[] = [
  { id: 'portrait',  label: 'na výšku 3:4',   w: 900,  h: 1200 },
  { id: 'landscape', label: 'na šírku 4:3',   w: 1200, h: 900  },
  { id: 'square',    label: 'štvorec 1:1',    w: 1000, h: 1000 },
  { id: 'panorama',  label: 'panoráma 16:5',  w: 1600, h: 500  },
];

/**
 * Nakreslí testovaciu fotku daného tvaru a vráti ju ako dataURL (JPEG).
 *
 * `dogSrc` je obrázok psa, ktorý sa vloží do ĽAVEJ TRETINY (nie do stredu) —
 * to je celá pointa. Keď sa obrázok nenačíta, kreslí sa len mriežka; fotka bez
 * psa je stále platný test rámu a rozmerov.
 */
export async function makeTestPhoto(shape: TestPhotoShape, dogSrc: string): Promise<string> {
  const spec = TEST_PHOTO_SHAPES.find((s) => s.id === shape) ?? TEST_PHOTO_SHAPES[0];
  const { w, h } = spec;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d');
  if (!ctx) return '';

  // Podklad + mriežka po 100 px: po výreze je hneď vidno, koľko sa ukrojilo.
  ctx.fillStyle = '#1B1710';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(201,154,63,.22)';
  ctx.lineWidth = 1;
  for (let x = 100; x < w; x += 100) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
  }
  for (let y = 100; y < h; y += 100) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
  }

  // Pes mimo stredu — vľavo, zvisle na tretine. Stredový výrez ho musí odrezať.
  const dog = await loadImage(dogSrc).catch(() => null);
  if (dog) {
    const side = Math.min(w, h) * 0.52;
    const dx = w * 0.06;
    const dy = h * 0.5 - side * 0.5;
    ctx.drawImage(dog, dx, dy, side, side);
  }

  // Popis hrán — aby sa po výreze dalo povedať, ČO zmizlo.
  ctx.fillStyle = 'rgba(239,215,154,.92)';
  ctx.font = `600 ${Math.round(Math.min(w, h) * 0.045)}px 'Space Grotesk', sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(`${w}×${h} · ${spec.label}`, 24, 20);
  ctx.textBaseline = 'bottom';
  ctx.fillText('DOLNÁ HRANA', 24, h - 18);
  ctx.textAlign = 'right';
  ctx.fillText('PRAVÁ HRANA', w - 24, h - 18);

  // Kvalita 0.72 drží aj panorámu pod ~200 kB, teda hlboko pod kvótou úložiska.
  return cv.toDataURL('image/jpeg', 0.72);
}

/** Zmenší vlastnú fotku od Mateja tak, aby sa zmestila do localStorage. */
export async function shrinkForSeed(file: File, maxSide = 1400): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    cv.getContext('2d')?.drawImage(img, 0, 0, w, h);
    return cv.toDataURL('image/jpeg', 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
