// Naše jazykové kódy → BCP-47, pre `Intl` / `toLocale*`.
//
// ⚠️ PREČO TO NEJDE BEZ MAPY: časť našich kódov je trojpísmenová (`esp`, `deu`,
// `chn`, …), lebo tak sa volajú súbory v `i18n/locales/`. `Intl` ich nepozná —
// `new Date().toLocaleDateString('esp')` hodí RangeError a zhodí komponent.
// Preto sa jazyk nikdy neposiela do `Intl` priamo, vždy cez `intlLocale()`.
//
// Mapa bola pôvodne skrytá v `components/DateDropdowns.tsx`; vytiahnutá sem
// 2026-08-12, keď ju potreboval aj Inbox (dátumy správ mal natvrdo `en-US`,
// takže Slovák videl „Aug 9" aj v slovenskom rozhraní).
//
// ⚠️ `ind` = hindčina (`hi`), nie indonézština — známy nesúlad názvu súboru
// s obsahom, vedený v KONTEXTe. Mapa kopíruje realitu, nie názov.
const LANG_TO_BCP47: Record<string, string> = {
  ara: 'ar',
  chn: 'zh',
  cs:  'cs',
  deu: 'de',
  en:  'en',
  esp: 'es',
  fra: 'fr',
  ind: 'hi',
  ita: 'it',
  jpn: 'ja',
  kor: 'ko',
  nld: 'nl',
  pol: 'pl',
  prt: 'pt',
  rus: 'ru',
  sk:  'sk',
  tur: 'tr',
  ukr: 'uk',
};

/** BCP-47 kód pre `Intl`. Neznámy jazyk padá na `en` — nikdy nehodí výnimku. */
export function intlLocale(lang: string): string {
  return LANG_TO_BCP47[lang] ?? 'en';
}

/**
 * Desatinné číslo v jazyku rozhrania — SK/CS „11,3", EN „11.3" (audit /pack/map, 26. 9. 2026).
 * Dáta ostávajú s bodkou (`tr.km` = "11.3", tak ich píše generátor aj zápis výletu);
 * formátuje sa AŽ pri vykreslení. `min` drží pevné desatinné miesto tam, kde patrí
 * k tvaru údaja (hodnotenie „5,0", nie „5"). Formátovače sa kešujú — pilulky na mape
 * sa kreslia po stovkách pri každom posune.
 */
const NUM_FMT = new Map<string, Intl.NumberFormat>();
export function fmtNum(v: number | string, lang: string, max = 1, min = 0): string {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!Number.isFinite(n)) return String(v);
  const key = `${lang}|${max}|${min}`;
  let f = NUM_FMT.get(key);
  if (!f) {
    f = new Intl.NumberFormat(intlLocale(lang), { maximumFractionDigits: max, minimumFractionDigits: min });
    NUM_FMT.set(key, f);
  }
  return f.format(n);
}
