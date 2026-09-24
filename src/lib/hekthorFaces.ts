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

const N = 26;

const face = (i: number) => `/images/hekt-flow/${String(i).padStart(2, '0')}.webp`;

/** Krok flow → ksicht. Kľúč je časť cesty za `/heroglyph/`. */
// ⚠️ KSICHT 02 JE VÄČŠÍ NEŽ ZVYŠOK SADY — 400×400 (46 kB) proti 260×260 (12 kB).
//    Krok e-mailu ho od 24. 9. 2026 ukazuje takmer cez celú bublinu (Matej: *„tu
//    musí byť čo najväčšie Hektorova fotka, najlepšie tá kde má vycerené zuby"*),
//    a 260 px by na retine bolo rozmazané. 400 je strop: presne toľko meria kruh
//    v origináli (`4OK.png`, 500×500 s okrajom 50 px), väčšie by sa už dopočítavalo.
const BY_STEP: Record<string, number> = {
  name: 1,
  dogs: 4,
  // Matejov výber z troch fotiek, ktoré označil príponou OK (2OK · 3OK · 4OK):
  // tá s vycerenými zubami = `4OK.png` = `02.webp`. Predtým tu stálo 7 (profil).
  email: 2,
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
};

/**
 * Ksicht pre daný krok. Neznámy krok dostane prvý — nikdy nie prázdno,
 * lebo bublina bez obrázka spadne do seba.
 */
export function hekthorFace(step: string): string {
  const n = BY_STEP[step];
  return face(n && n >= 1 && n <= N ? n : 1);
}

/** Ksicht podľa cesty (`/heroglyph/name` → ksicht kroku `name`). */
export function hekthorFaceForPath(pathname: string): string {
  const m = pathname.match(/^\/heroglyph\/([^/?#]+)/);
  return hekthorFace(m ? m[1] : 'name');
}
