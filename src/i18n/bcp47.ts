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
