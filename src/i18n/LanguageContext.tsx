import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
/** Supabase klient sa ťahá až po prvom vykreslení — jazyk v účte je pohodlie, nie podmienka,
 *  a celý klient (~55 kB gzip) by inak sedel v hlavnom balíku každej stránky (perf 7. 10. 2026). */
const getSupabase = () => afterLoad().then(() => import('@/integrations/supabase/client')).then((m) => m.supabase);
import enCore from 'virtual:i18n/en/core';
import { afterLoad } from '@/lib/afterLoad';
import type { en } from './locales/en';

/**
 * DOGYPT i18n — ľahká vlastná vrstva (bez react-i18next, Lovable-friendly).
 *
 * - Locale slovníky = FLAT dotted kľúče (`vision.hero.headline`), aby bol lookup
 *   triviálny a fallback na EN deterministický.
 * - `en` je MASTER / zdroj pravdy typu. Ostatné locale = Partial<Dict> → chýbajúci
 *   kľúč ticho padne na EN (nikdy prázdny string).
 * - Číta `dogypt_lang` z localStorage — ten istý kľúč, ktorý LanguagePicker UŽ zapisuje.
 *   Provider reaguje na zmenu (vrátane `storage` eventu z iného tabu).
 * - Prvá návšteva (bez uloženej voľby) = autodetekcia z `navigator.languages`;
 *   do localStorage zapisuje AŽ explicitný výber v pickeri — detekcia ostáva živá
 *   (zmena jazyka prehliadača sa prejaví, kým si user sám nevyberie).
 *
 * Perf (6. 10. 2026): `sk` (316 kB) už NIE JE v hlavnom balíku — EN návštevník ho nikdy nestiahne.
 * SK návštevník ho dostane PRED prvým renderom (`preloadActiveLang` v main.tsx), takže
 * nikdy nevidí blik anglických textov.
 * Perf (P0 2026-07, staršie): `en` + `sk` boli statické importy (fallback + najčastejší jazyk),
 * zvyšných 16 locale súborov (100-150 kB každý) sa dotiahne dynamickým `import()` až
 * pri reálnom prepnutí/inicializácii jazyka — main chunk nemá ťahať všetkých 18 naraz.
 */

export type Dict = typeof en;
export type LangCode = string;

const STORAGE_KEY = 'dogypt_lang';

/* 🔴 PREKLADY SÚ V DVOCH KUSOCH (perf 7. 10. 2026, Matej: „všetky stránky do 2 sekúnd").
   `core` = verejné stránky, `pack` = texty appky (2/3 objemu). Delí ich vite-plugin-i18n-split.ts,
   súbory locales/*.ts sa NEMENIA. `pack` sa ťahá pred obrazovkou appky (`ensurePackDict`,
   App.tsx `lazyPack`); keby ho niekto chcel skôr, `t()` ho dotiahne sám a po príchode prekreslí. */
const en0 = enCore as Record<string, string>;
const DICTS: Record<string, Record<string, string>> = { en: { ...en0 } };

type Part = () => Promise<{ default: Record<string, string> }>;
// Kľúče musia matchovať LanguagePicker `label` kódy. Virtuálne moduly = literály (Vite ich musí vidieť).
const loaders: Record<string, { core: Part; pack: Part }> = {
  en: { core: () => Promise.resolve({ default: en0 }), pack: () => import('virtual:i18n/en/pack') },
  sk: { core: () => import('virtual:i18n/sk/core'), pack: () => import('virtual:i18n/sk/pack') },
  cs: { core: () => import('virtual:i18n/cs/core'), pack: () => import('virtual:i18n/cs/pack') },
  pol: { core: () => import('virtual:i18n/pol/core'), pack: () => import('virtual:i18n/pol/pack') },
  ukr: { core: () => import('virtual:i18n/ukr/core'), pack: () => import('virtual:i18n/ukr/pack') },
  deu: { core: () => import('virtual:i18n/deu/core'), pack: () => import('virtual:i18n/deu/pack') },
  esp: { core: () => import('virtual:i18n/esp/core'), pack: () => import('virtual:i18n/esp/pack') },
  fra: { core: () => import('virtual:i18n/fra/core'), pack: () => import('virtual:i18n/fra/pack') },
  prt: { core: () => import('virtual:i18n/prt/core'), pack: () => import('virtual:i18n/prt/pack') },
  rus: { core: () => import('virtual:i18n/rus/core'), pack: () => import('virtual:i18n/rus/pack') },
  ita: { core: () => import('virtual:i18n/ita/core'), pack: () => import('virtual:i18n/ita/pack') },
  chn: { core: () => import('virtual:i18n/chn/core'), pack: () => import('virtual:i18n/chn/pack') },
  jpn: { core: () => import('virtual:i18n/jpn/core'), pack: () => import('virtual:i18n/jpn/pack') },
  ind: { core: () => import('virtual:i18n/ind/core'), pack: () => import('virtual:i18n/ind/pack') },
  ara: { core: () => import('virtual:i18n/ara/core'), pack: () => import('virtual:i18n/ara/pack') },
  kor: { core: () => import('virtual:i18n/kor/core'), pack: () => import('virtual:i18n/kor/pack') },
  nld: { core: () => import('virtual:i18n/nld/core'), pack: () => import('virtual:i18n/nld/pack') },
  tur: { core: () => import('virtual:i18n/tur/core'), pack: () => import('virtual:i18n/tur/pack') },
};

/** Ktoré kusy (`<jazyk>:core|pack`) sú už v DICTS. EN jadro je statické. */
const loaded = new Set<string>(['en:core']);
// In-flight promises, aby sa ten istý kus nesťahoval viackrát paralelne.
const pendingParts: Record<string, Promise<void> | undefined> = {};
const dictListeners = new Set<() => void>();

function loadPart(lang: LangCode, part: 'core' | 'pack'): Promise<void> {
  const id = `${lang}:${part}`;
  if (loaded.has(id) || !loaders[lang]) return Promise.resolve();
  if (pendingParts[id]) return pendingParts[id]!;
  const p = loaders[lang][part]()
    .then((m) => {
      DICTS[lang] = { ...(DICTS[lang] ?? {}), ...m.default };
      loaded.add(id);
      dictListeners.forEach((f) => f());
    })
    // Sieť/chunk zlyhal — fallback na EN, skúsi sa znova pri ďalšom volaní.
    .catch(() => {})
    .finally(() => { delete pendingParts[id]; });
  pendingParts[id] = p;
  return p;
}

/** Texty appky /pack pre aktívny jazyk (+ EN ako fallback). App.tsx s nimi čaká pred obrazovkou appky. */
export function ensurePackDict(): Promise<void> {
  return Promise.all([loadPart('en', 'pack'), loadPart(readStoredLang(), 'pack')]).then(() => {});
}

/** Dotiahne jazyk, ktorý sa vykreslí ako prvý — main.tsx s ním počká na prvý render (len pre ne-EN). */
export function preloadActiveLang(): Promise<void> {
  return loadLang(readStoredLang());
}

/** Jadro jazyka; texty appky len vtedy, keď už sú pre EN (človek je v appke). */
function loadLang(lang: LangCode): Promise<void> {
  const core = loadPart(lang, 'core');
  return loaded.has('en:pack') ? Promise.all([core, loadPart(lang, 'pack')]).then(() => {}) : core;
}

// RTL jazyky — pre post-launch (ar). Latinkové/cyrilické launch-set langs ostávajú ltr.
const RTL_LANGS = new Set(['ara', 'ar']);

// Prehliadačový jazyk (BCP-47 primárny subtag) → interný locale kód.
// Kľúče musia pokrývať všetky jazyky v `DICTS`/`loaders` (18 launch-set).
const BROWSER_LANG_MAP: Record<string, LangCode> = {
  en: 'en', sk: 'sk', cs: 'cs', pl: 'pol', uk: 'ukr', de: 'deu',
  es: 'esp', fr: 'fra', pt: 'prt', ru: 'rus', it: 'ita', zh: 'chn',
  ja: 'jpn', hi: 'ind', ar: 'ara', ko: 'kor', nl: 'nld', tr: 'tur',
};

/** Jazyk podľa prehliadača — prvý podporovaný z `navigator.languages`, inak EN. */
function detectBrowserLang(): LangCode {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of candidates) {
    if (!tag) continue;
    const mapped = BROWSER_LANG_MAP[tag.toLowerCase().split('-')[0]];
    if (mapped) return mapped;
  }
  return 'en';
}

function readStoredLang(): LangCode {
  if (typeof window === 'undefined') return 'en';
  try {
    return window.localStorage.getItem(STORAGE_KEY) || detectBrowserLang();
  } catch {
    return detectBrowserLang();
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

  // ── JAZYK PATRÍ K ÚČTU, NIE LEN DO PREHLIADAČA ─────────────────────────────
  // Auth maily (reset hesla, magic link, potvrdenie adresy) posiela edge funkcia
  // `auth-send-email` a jediné, čo o adresátovi vie, je `user_metadata.lang` —
  // localStorage z prehliadača sa k nej nedostane. Bez tohto zápisu by aj Slovák,
  // ktorý má appku po slovensky, dostal reset hesla po anglicky.
  //
  // ⚠️ Zápis je POHODLIE, nie podmienka: bez session sa ticho preskočí a chyba sa
  //    nikde neprejaví. Čítame `getSession()` (lokálne), nie `getUser()` (sieť),
  //    a zapisujeme LEN pri rozdiele — inak by to bolo volanie na každé načítanie.
  const [authTik, setAuthTik] = useState(0);
  useEffect(() => {
    let off: (() => void) | null = null;
    let zrusene = false;
    getSupabase().then((supabase) => {
      if (zrusene) return;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') setAuthTik((n) => n + 1);
      });
      off = () => data.subscription.unsubscribe();
    }).catch(() => {});
    return () => { zrusene = true; off?.(); };
  }, []);

  useEffect(() => {
    let zrusene = false;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user;
        if (!u || zrusene) return;
        if ((u.user_metadata as Record<string, unknown> | undefined)?.lang === lang) return;
        await supabase.auth.updateUser({ data: { lang } });
      } catch {
        /* jazyk v konte je pohodlie — jeho zlyhanie nesmie nič zastaviť */
      }
    })();
    return () => { zrusene = true; };
  }, [lang, authTik]);

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

  // Kus prekladov dorazil (napr. texty appky) ⇒ prekresliť.
  useEffect(() => {
    const f = () => setDictsTick((n) => n + 1);
    dictListeners.add(f);
    return () => { dictListeners.delete(f); };
  }, []);

  const t = useCallback<TFunction>((key, vars) => {
    const dict = DICTS[lang] ?? DICTS.en;
    const value = dict[key] ?? DICTS.en[key];
    // Kľúč appky bez natiahnutého kusu ⇒ dotiahni ho (po príchode prekreslí listener nižšie).
    if (value === undefined && key.startsWith('pack.') && !loaded.has(`${lang}:pack`)) void ensurePackDict();
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
