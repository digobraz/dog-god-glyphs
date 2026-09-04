// ════════════════════════════════════════════════════════════════════════════
// /onepage NA OSTROM WEBE, ALE NIE PRE VEREJNOSŤ (2026-09-04)
// ────────────────────────────────────────────────────────────────────────────
// Matej: *„skús to prepnúť na ostrú verziu ktorá ale nebude viditeľná pre
// verejnosť www.dogypt.com/onepage aby sme vedeli odmerať rýchlosť."*
//
// PREČO TO VÔBEC MUSÍ ÍSŤ VON: `/onepage` visela na `import.meta.env.DEV`, takže
// v produkčnom builde routa NEEXISTOVALA — pri pokuse zmerať rýchlosť sa načítala
// prázdna stránka. Jediné čísla, ktoré sme o filme mali, boli z vývojového servera,
// kde kód beží nezbalený, bez minifikácie a bez rozdelenia na chunky. Tie neplatia.
//
// AKO SA ODOMYKÁ: `dogypt.com/onepage?preview=<TOKEN>` — token sa uloží do
// `localStorage`, takže ďalšie návštevy stačí bez parametra (dôležité: film sa meria
// aj na TEPLEJ cache a `?preview=` v URL by menil kľúč dokumentu). Zamkne sa späť
// cez `?preview=off`. Kto token nemá, dostane 404 ako pri ktorejkoľvek neexistujúcej
// ceste — nie prázdnu bielu stránku, ktorá vyzerá ako pokazený web.
//
// ⚠️ JE TO VIDITEĽNOSŤ, NIE ZÁMOK — presne ako `DEV_FULL` v `packFlags.ts`. Chunk
//    s filmom je v bundli tak či tak (gatuje sa obrazovka, nie kód), takže kto vie
//    čítať JS, odomkne si to aj bez tokenu. Na nedokončenú marketingovú stránku to
//    stačí; nič citlivé za tým nie je.
//
// ⚠️ Vyhodnocuje sa RAZ pri načítaní modulu, synchronne — rovnaký dôvod ako pri
//    `DEV_FULL`: `App.tsx` ho číta ako modulovú konštantu pri stavbe stromu rout.
//    Odomknutie aj zamknutie preto platí HNEĎ pri tom istom načítaní — import sa
//    vyhodnotí skôr, než sa strom rout postaví. Odskúšané na ostrom builde: bez tokenu
//    404, s `?preview=<TOKEN>` film, bez parametra film ďalej, `?preview=off` zase 404.
//
// ZRUŠENIE, KEĎ FILM PÔJDE VEREJNE: v `App.tsx` nechať routu bez podmienky, zmazať
// tento súbor, `Disallow: /onepage` z `public/robots.txt` a `noindex` zo `<Seo>`.
// ════════════════════════════════════════════════════════════════════════════

/** Kľúč v `localStorage`. Prefix `dogypt.` drží zvyšok appky, nech to nie je siroty. */
const STORAGE_KEY = 'dogypt.onepage.preview';

/**
 * Token nie je heslo (viď vyššie — je v bundli), je to zámok proti náhodnému
 * príchodu: proti botovi, preklepu v adrese a proti tomu, aby sa nedokončený film
 * dal niekomu poslať omylom.
 */
const TOKEN = 'hektor2017';

function evaluate(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const q = new URLSearchParams(window.location.search).get('preview');
    if (q === 'off') {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    if (q === TOKEN) {
      localStorage.setItem(STORAGE_KEY, '1');
      return true;
    }
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // Súkromné okno / zablokované úložisko → správame sa ako neodomknutý.
    return false;
  }
}

export const ONEPAGE_PREVIEW = evaluate();
