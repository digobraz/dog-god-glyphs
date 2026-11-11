/** Jazyky webu /app (11. 11. 2026) — tých istých 18 ako appka (`LanguagePicker.tsx`), meno v jazyku samom.
 *  Texty: SK + EN v `copy.ts`, ostatné v `copyLangs/<kód>.json` (načítané až pri prepnutí, chýbajúci kľúč → EN). */
export const WEB_LANGS: { code: string; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'sk', name: 'Slovenčina', flag: 'sk' },
  { code: 'cs', name: 'Čeština', flag: 'cz' },
  { code: 'deu', name: 'Deutsch', flag: 'de' },
  { code: 'pol', name: 'Polski', flag: 'pl' },
  { code: 'ukr', name: 'Українська', flag: 'ua' },
  { code: 'esp', name: 'Español', flag: 'es' },
  { code: 'fra', name: 'Français', flag: 'fr' },
  { code: 'ita', name: 'Italiano', flag: 'it' },
  { code: 'prt', name: 'Português', flag: 'pt' },
  { code: 'nld', name: 'Nederlands', flag: 'nl' },
  { code: 'tur', name: 'Türkçe', flag: 'tr' },
  { code: 'rus', name: 'Русский', flag: 'ru' },
  { code: 'ara', name: 'العربية', flag: 'sa' },
  { code: 'chn', name: '中文', flag: 'cn' },
  { code: 'jpn', name: '日本語', flag: 'jp' },
  { code: 'kor', name: '한국어', flag: 'kr' },
  { code: 'ind', name: 'हिन्दी', flag: 'in' },
];

const FILES = import.meta.glob<Record<string, string>>('./copyLangs/*.json', { import: 'default' });

/** Slovník jazyka mimo SK/EN, alebo null (SK/EN žijú v `copy.ts`). */
export const loadLang = (code: string): Promise<Record<string, string> | null> =>
  FILES[`./copyLangs/${code}.json`]?.() ?? Promise.resolve(null);
