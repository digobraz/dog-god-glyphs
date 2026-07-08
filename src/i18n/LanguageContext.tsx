import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { sk } from './locales/sk';

/**
 * DOGYPT i18n — ľahká vlastná vrstva (bez react-i18next, Lovable-friendly).
 *
 * - Locale slovníky = FLAT dotted kľúče (`vision.hero.headline`), aby bol lookup
 *   triviálny a fallback na EN deterministický.
 * - `en` je MASTER / zdroj pravdy typu. Ostatné locale = Partial<Dict> → chýbajúci
 *   kľúč ticho padne na EN (nikdy prázdny string).
 * - Číta `dogypt_lang` z localStorage — ten istý kľúč, ktorý LanguagePicker UŽ zapisuje.
 *   Provider reaguje na zmenu (vrátane `storage` eventu z iného tabu).
 *
 * Perf (P0 2026-07): `en` + `sk` sú statické importy (fallback + najčastejší jazyk),
 * zvyšných 16 locale súborov (100-150 kB každý) sa dotiahne dynamickým `import()` až
 * pri reálnom prepnutí/inicializácii jazyka — main chunk nemá ťahať všetkých 18 naraz.
 */

export type Dict = typeof en;
export type LangCode = string;

const STORAGE_KEY = 'dogypt_lang';

// Registry zapnutých locale slovníkov. `en`/`sk` sú vždy dostupné synchrónne,
// ostatné sa dopĺňajú do cache po dotiahnutí (viď `loaders` nižšie).
const DICTS: Record<string, Partial<Dict>> = { en, sk };

// Lazy loaders pre ostatné jazyky. Pridať jazyk = import() sem + zápis do DICTS
// po vyriešení promise (loadLang). Kľúče musia matchovať LanguagePicker `label` kódy.
const loaders: Record<string, () => Promise<Partial<Dict>>> = {
  cs: () => import('./locales/cs').then((m) => m.cs),
  // Launch-set strojové preklady (machine, pending human review cez review-prekladov.html).
  pol: () => import('./locales/pol').then((m) => m.pol),
  ukr: () => import('./locales/ukr').then((m) => m.ukr),
  deu: () => import('./locales/deu').then((m) => m.deu),
  esp: () => import('./locales/esp').then((m) => m.esp),
  fra: () => import('./locales/fra').then((m) => m.fra),
  prt: () => import('./locales/prt').then((m) => m.prt),
  rus: () => import('./locales/rus').then((m) => m.rus),
  ita: () => import('./locales/ita').then((m) => m.ita),
  // Full machine translations 2026-06-17 (680 keys each), pending human review.
  chn: () => import('./locales/chn').then((m) => m.chn),
  jpn: () => import('./locales/jpn').then((m) => m.jpn),
  ind: () => import('./locales/ind').then((m) => m.ind),
  ara: () => import('./locales/ara').then((m) => m.ara),
  kor: () => import('./locales/kor').then((m) => m.kor),
  nld: () => import('./locales/nld').then((m) => m.nld),
  tur: () => import('./locales/tur').then((m) => m.tur),
};

// In-flight promises, aby sa ten istý jazyk nesťahoval viackrát paralelne.
const pendingLoads: Record<string, Promise<void> | undefined> = {};

/** Dotiahne locale do `DICTS` cache (no-op ak už je natiahnutý alebo statický). */
function loadLang(lang: LangCode): Promise<void> {
  if (DICTS[lang] || !loaders[lang]) return Promise.resolve();
  if (pendingLoads[lang]) return pendingLoads[lang]!;
  const p = loaders[lang]()
    .then((dict) => {
      DICTS[lang] = dict;
    })
    .catch(() => {
      // Sieť/chunk zlyhal — necháme fallback na EN, skúsi sa znova pri ďalšom setLang/mount.
    })
    .finally(() => {
      delete pendingLoads[lang];
    });
  pendingLoads[lang] = p;
  return p;
}

// RTL jazyky — pre post-launch (ar). Latinkové/cyrilické launch-set langs ostávajú ltr.
const RTL_LANGS = new Set(['ara', 'ar']);

function readStoredLang(): LangCode {
  if (typeof window === 'undefined') return 'en';
  try {
    return window.localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

// key je `string` (nie `keyof Dict`), aby fungovali dynamické kľúče
// (napr. `vision.beat.${id}.tag`). Chýbajúci kľúč → fallback na EN, inak na samotný kľúč.
type TFunction = (key: string, vars?: Record<string, string | number>) => string;

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: TFunction;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(readStoredLang);

  // Aplikuj jazyk na <html> (lang + dir) pri každej zmene.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  // Sync naprieč tabmi.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setLangState(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Dotiahni locale chunk pri každej zmene jazyka (no-op pre en/sk/už-natiahnuté).
  // `dictsTick` len vynúti re-render (a novú identitu `t`) po dorazení chunku —
  // dovtedy `t()` transparentne fallbackuje na EN vďaka lookupu nižšie.
  const [dictsTick, setDictsTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    loadLang(lang).then(() => {
      if (!cancelled) setDictsTick((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  const t = useCallback<TFunction>((key, vars) => {
    const dict = (DICTS[lang] ?? en) as Record<string, string>;
    const value = dict[key] ?? (en as Record<string, string>)[key];
    return interpolate(value ?? key, vars);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dictsTick force-refreshes `t` identity once a lazy locale chunk lands
  }, [lang, dictsTick]);

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage/useT must be used within <LanguageProvider>');
  return ctx;
}

/** `const t = useT();  t('vision.hero.headline')` */
export function useT(): TFunction {
  return useLanguageContext().t;
}

/** `const { lang, setLang } = useLang();` — pre LanguagePicker / PageNav menu. */
export function useLang(): { lang: LangCode; setLang: (lang: LangCode) => void } {
  const { lang, setLang } = useLanguageContext();
  return { lang, setLang };
}
