// ════════════════════════════════════════════════════════════════════════════
// DOG ID = MODULY (Matej 8. 10. 2026 nad nákresom
// `plany/nakres-dogs-konsolidacia-2026-10-08.html`, lock `plany/locky/dogs-dogid.md`
// §REVÍZIA 8. 10.).
//
// *„DOG ID = moduly. VYPLNIŤ → zoznam modulov: ZÁKLAD · OSOBNOSŤ · neskôr Kŕmna
// dávka, Doplnky…"* · *„% v psom bloku = VŠETKY moduly spolu"*.
//
// Modul je ZOZNAM POLÍ, nie druhá definícia otázok — labely, typy a pohľady si každé
// pole naďalej nesie v `QUIZ_SECTIONS` (dogQuiz.ts). Preto sa nemôžu rozísť.
//
// 🔴 SÚČET MODULOV = `PROGRESS_STEPS`. Percento v psom bloku sa tým, že vznikli
//    moduly, NEMENÍ — len sa dá rozložiť na časti. Keby pole z progresu nepatrilo
//    žiadnemu modulu, 100 % by sa z obrazovky modulov nedalo dosiahnuť (pole by
//    nemalo kde sa vyplniť). V deve na to kričí kontrola na konci súboru.
// ⚠️ ZÁVET je modul, hoci v nákrese nie je: jeho tri polia sa do percenta rátajú
//    od 13. 8. 2026. Bez modulu by ostal skrytý ako „chýbajúcich 8 %".
// ════════════════════════════════════════════════════════════════════════════
import {
  QUIZ_BY_KEY, PROGRESS_STEPS, type QuizSection, type QuizStep,
} from '@/components/pack/dogQuiz';
import { hasValue, type LatestValue } from '@/lib/dogEvents';

type LatestOfDog = Record<string, LatestValue> | undefined;

/** Sekcie kvízu, ktoré tvoria ZÁKLAD — v poradí, v akom ich flow prechádza. */
export const BASE_SECTION_KEYS = ['basics', 'howWorks', 'social', 'temperament', 'health', 'food'] as const;

export type DogIdModuleKey = 'base' | 'nature' | 'will' | 'feeding';

export interface DogIdModule {
  key: DogIdModuleKey;
  labelEN: string; i18n: string;
  /** Jeden riadok: ČO modul rieši. Počet otázok píše obrazovka z dát. */
  subEN: string; subI18n: string;
  /** Kresba z hand-drawn kitu (`public/icons/pack/<icon>.svg`, `<BrandIcon>`). Emoji mimo
   *  mapy je mimo brandu — stráž `check:ikony`. */
  icon: string;
  /** Polia, ktoré sa rátajú do percenta. Prázdne = modul ešte nie je (ČOSKORO). */
  steps: QuizStep[];
  /** Počet otázok, ktoré človek uvidí (aj tie, čo sa do % nerátajú). 0 = nevie sa z polí. */
  questions: number;
  soon?: boolean;
}

const sectionSteps = (keys: readonly string[]): QuizStep[] =>
  keys.flatMap((k) => QUIZ_BY_KEY[k]?.steps ?? []);

const PROGRESS_FIELDS = new Set(PROGRESS_STEPS.map((s) => s.field));
const inProgress = (steps: QuizStep[]): QuizStep[] => steps.filter((s) => PROGRESS_FIELDS.has(s.field));

const BASE_ALL = sectionSteps(BASE_SECTION_KEYS);
const NATURE_ALL = QUIZ_BY_KEY.nature?.steps ?? [];
const WILL_ALL = QUIZ_BY_KEY.will?.steps ?? [];

export const DOGID_MODULES: DogIdModule[] = [
  {
    key: 'base', icon: 'clipboard',
    labelEN: 'Basics', i18n: 'pack.dogid.mod.base',
    subEN: 'Body, health, food and how they work', subI18n: 'pack.dogid.mod.baseSub',
    steps: inProgress(BASE_ALL), questions: BASE_ALL.length,
  },
  {
    key: 'nature', icon: 'yinyang',
    labelEN: 'Personality', i18n: 'pack.dogid.mod.nature',
    subEN: 'Who your dog is — pack role and element', subI18n: 'pack.dogid.mod.natureSub',
    // Kvíz osobnosti zapisuje len polia zo scoringu, takže dĺžka `steps` nie je počet
    // otázok. `0` = obrazovka berie popis z `pack.hub.nature.meta` („22 otázok · ~3 min"),
    // ktorý drží kvíz sám — druhé číslo by sa s ním rozišlo pri prvej úprave kvízu.
    steps: inProgress(NATURE_ALL), questions: 0,
  },
  {
    key: 'will', icon: 'feather',
    labelEN: 'Will', i18n: 'pack.dogid.mod.will',
    subEN: 'Who takes them, if you can’t', subI18n: 'pack.dogid.mod.willSub',
    steps: inProgress(WILL_ALL), questions: WILL_ALL.length,
  },
  {
    // DOPLNKY ako samostatný modul ZANIKLI (Matej 8. 10. 2026: *„suplements vymaž, to bude
    // vo feeding plane"*) — kŕmna dávka ich ponesie v sebe.
    key: 'feeding', icon: 'food', soon: true,
    labelEN: 'Feeding plan', i18n: 'pack.dogid.mod.feeding',
    subEN: 'Daily portion and supplements, worked out for their body', subI18n: 'pack.dogid.mod.feedingSub',
    steps: [], questions: 0,
  },
];

export const LIVE_MODULES = DOGID_MODULES.filter((m) => !m.soon);

/**
 * ZÁKLAD ako JEDEN súvislý flow pre kvízový engine (`/pack/dogs/quiz/base`).
 * Matej 8. 10.: *„jeden súvislý flow cez všetky sekcie — vidno sekciu aj celkový
 * progres"*. NIE JE v `QUIZ_SECTIONS` zámerne: tam by zdvojil polia v
 * `STEP_BY_FIELD`, `sectionOfField` aj na doklade.
 */
export const BASE_FLOW: QuizSection = {
  key: 'base',
  labelEN: 'Basics', i18n: 'pack.dogid.mod.base',
  subEN: '', subI18n: '',
  emoji: '', kind: 'quiz',
  steps: BASE_ALL,
};

export interface FlowSegment { key: string; section: QuizSection; start: number; count: number }

/** Kde vo flow ZÁKLAD sekcia začína — pre pás sekcií a „ZDRAVIE · 3 / 10". */
export const BASE_SEGMENTS: FlowSegment[] = (() => {
  let at = 0;
  return BASE_SECTION_KEYS.map((k) => {
    const section = QUIZ_BY_KEY[k];
    const seg = { key: k, section, start: at, count: section.steps.length };
    at += section.steps.length;
    return seg;
  });
})();

export function segmentAt(idx: number): FlowSegment {
  return BASE_SEGMENTS.find((s) => idx >= s.start && idx < s.start + s.count) ?? BASE_SEGMENTS[0];
}

/** Vyplnené / všetky polia modulu naprieč vybranými psami. */
export function moduleProgress(mod: DogIdModule, latest: Record<string, LatestOfDog>, dogIds: string[]) {
  let filled = 0;
  for (const id of dogIds) for (const s of mod.steps) if (hasValue(latest[id]?.[s.field])) filled += 1;
  const total = mod.steps.length * dogIds.length;
  return {
    filled, total,
    pct: total === 0 ? 0 : Math.round((filled / total) * 100),
    done: total > 0 && filled >= total,
  };
}

/** Je celé DOG ID psa hotové? To isté meradlo, aké nesie percento v psom bloku. */
export function dogIdDone(latest: LatestOfDog): boolean {
  return PROGRESS_STEPS.every((s) => hasValue(latest?.[s.field]));
}

/**
 * Prvá otázka, na ktorú niektorý z psov ešte nemá odpoveď — alebo -1.
 * Matej 8. 10.: *„návrat = prvá nevyplnená otázka, nie začiatok"*.
 * Rátajú sa aj nepovinné polia: preskočená otázka je stále otázka, ku ktorej sa vrátiš.
 */
export function firstOpenStep(steps: QuizStep[], latest: Record<string, LatestOfDog>, dogIds: string[]): number {
  return steps.findIndex((s) => dogIds.some((id) => !hasValue(latest[id]?.[s.field])));
}

if (import.meta.env.DEV) {
  const covered = new Set(LIVE_MODULES.flatMap((m) => m.steps.map((s) => s.field)));
  const orphans = PROGRESS_STEPS.filter((s) => !covered.has(s.field)).map((s) => s.field);
  if (orphans.length) console.warn('[dogIdModules] pole v % bez modulu — 100 % sa nedá dosiahnuť:', orphans);
}
