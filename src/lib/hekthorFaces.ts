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
const BY_STEP: Record<string, number> = {
  name: 1,
  dogs: 4,
  email: 7,
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
