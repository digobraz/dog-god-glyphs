// ═══════════════════════════════════════════════════════════════════════════
// HEKTHOROVE KSICHTY VO FLOW (23. 9. 2026)
//
// Matej: „napadlo mi vy každom kroku flow dať iný hektorov ksicht mám ich veľa
// = bolo by to zaujímavejšie a človek by chcel vidieť čo bude nasledovať."
//
// Zdroj: `vstupy/vizualna-identita/ksichty heky flow/` (26 × 500×500 PNG).
// Kruh je v origináloch presne 400×400 v strede (zmerané cez canvas, offset 50 px
// na každej strane), preto sa vyrezal presne on — vďaka tomu `border-radius:50%`
// sadne na pixel a nezostane biely lem. Prevedené na 260×260 webp (12 kB kus,
// 319 kB celá sada) a ležia v `public/`, teda MIMO bundlu: načíta sa len ten
// ksicht, ktorý krok naozaj ukáže.
//
// ⚠️ Ksicht je viazaný na KROK, nie na poradie v sade — kroky sa budú presúvať
// a človek, ktorý sa vráti späť, musí vidieť ten istý obrázok, aký tam bol.
// ═══════════════════════════════════════════════════════════════════════════

export const N = 26;

/** Adresa i-teho ksichtu (1–26). Exportované pre `/lab/heroflow` — mriežka
 *  náhľadov potrebuje adresu KAŽDÉHO ksichtu, nie len toho pre aktuálny krok. */
export const face = (i: number) => `/images/hekt-flow/${String(i).padStart(2, '0')}.webp`;

/** Krok flow → ksicht. Kľúč je časť cesty za `/heroglyph/`. */
// ⚠️ KSICHT 02 JE VÄČŠÍ NEŽ ZVYŠOK SADY — 400×400 (46 kB) proti 260×260 (12 kB).
//    Krok e-mailu ho od 24. 9. 2026 ukazuje takmer cez celú bublinu (Matej: *„tu
//    musí byť čo najväčšie Hektorova fotka, najlepšie tá kde má vycerené zuby"*),
//    a 260 px by na retine bolo rozmazané. 400 je strop: presne toľko meria kruh
//    v origináli (`4OK.png`, 500×500 s okrajom 50 px), väčšie by sa už dopočítavalo.
export const BY_STEP: Record<string, number> = {
  name: 1,
  // Matej 24. 9.: „pri tvoja svorka si nezmenil fotku... a tam byť profil
  // hektora" — v sade sú dva kandidáti, `04` (čelný portrét) a `07` (jediný
  // BOČNÝ PROFIL); obe som si otvoril a profil sedí ku „svorke" tematicky
  // lepšie (rad psov z boku), takže krok `dogs` dostáva `07`.
  dogs: 7,
  // Matejov výber z troch fotiek, ktoré označil príponou OK (2OK · 3OK · 4OK):
  // tá s vycerenými zubami = `4OK.png` = `02.webp`. Predtým tu stálo 7 (profil).
  email: 2,
  // `essence` (24. 9.) v mape chýbal, takže padal na ksicht kroku 1 — ten istý,
  // aký má krok `name`. `17` bola priradená starej routе `dog-gender`, ktorú
  // podstata pohltila (pohlavie je teraz jedna z otázok podstaty) — je preto
  // voľná a tematicky sedí.
  essence: 17,
  why: 9,
  breed: 11,
  ranking: 13,
  'owner-info': 14,
  'owner-zodiac': 15,
  'owner-final': 16,
  'dog-gender': 17,
  'dog-fate': 18,
  'dog-colour': 19,
  'dog-bloodline': 20,
  'dog-character': 21,
  crop: 23,
  reveal: 25,
  message: 26,
  // C · ZADRŽANIE (25. 9. 2026) — voľný ksicht, žiadny iný krok ho nemá.
  stay: 24,
  // Ďakovačka hosťa €0 — vlastný kľúč, aby sa v dielni dala meniť zvlášť od popupu.
  'stay-done': 24,
};

// ─────────────────────────────────────────────────────────────────────────
// DEV NÁHĽAD FOTIEK V DIELNI (26. 9. 2026)
//
// Matej: „pridaj do labu možnosť kde budem môcť naklikať fotky aj si pozrieť
// náhľad" — `/lab/heroflow` má vlastný rám (iframe na tom istom origin), takže
// override ide cez `localStorage` presne ako `devSeed.ts`: dielňa zapíše,
// nová stránka v ráme si to pri štarte znova prečíta.
//
// 🔴 CELÉ JE TO DEV-ONLY, rovnako ako `devSeed.ts`. `import.meta.env.DEV` je
//    prvá podmienka skôr, než sa čo i len skúsi čítať localStorage — produkčný
//    build tento kód nevykoná ani keď mu niekto kľúč podstrčí.
// ─────────────────────────────────────────────────────────────────────────

export const DEV_FACES_KEY = 'dogypt-dev-faces';

function devFaceOverride(step: string): number | undefined {
  if (!import.meta.env.DEV) return undefined;
  try {
    const raw = localStorage.getItem(DEV_FACES_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw) as Record<string, number>;
    const n = map[step];
    return n && n >= 1 && n <= N ? n : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Ksicht pre daný krok. Neznámy krok dostane prvý — nikdy nie prázdno,
 * lebo bublina bez obrázka spadne do seba.
 */
export function hekthorFace(step: string): string {
  const n = devFaceOverride(step) ?? BY_STEP[step];
  return face(n && n >= 1 && n <= N ? n : 1);
}

/** Ksicht podľa cesty (`/heroglyph/name` → ksicht kroku `name`). */
export function hekthorFaceForPath(pathname: string): string {
  const m = pathname.match(/^\/heroglyph\/([^/?#]+)/);
  return hekthorFace(m ? m[1] : 'name');
}
