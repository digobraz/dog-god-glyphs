// ════════════════════════════════════════════════════════════════════════════
// DENNÍK PSA — register toho, čo sa dá zapísať. KROK 5 bloku 2.
//
// Zadanie: `plany/zadanie-pack-plus-lista-DALSIA-SESSION.md` §3 KROK 5.
// Register vytvoriteľného: `components/pack/createRegistry.ts` (`diary`, `photo`).
//
// PREČO EXISTUJE. Kalendár (`calendar/PackCalendar.tsx`) je od 12. 9. 2026 hotový
// ČITATEĽ, ktorý zámerne nemal pisateľa — jeho vlastná hlavička to píše: „Denník sa
// dnes nemá kam uložiť v tvare, ktorý kalendár potrebuje." Toto je ten tvar.
//
// ⚠️ ŽIADNE NOVÉ ÚLOŽISKO. Všetko ide do `dog_events` (`lib/dogEvents.ts`), ktorá je
//    na LIVE a je append-only. Fotka NIE JE priečinok ani tabuľka — je to adresa
//    v `value.photo` toho istého riadku. Piate miesto na údaje o psovi nepribudne
//    (CLAUDE.md, identita používateľa).
//
// ⚠️ `source` MUSÍ byť z piatich povolených hodnôt — `dog_events.source` má CHECK
//    `in ('quiz','profile','import','vet','correction')` (migrácia 20260806, r. 44).
//    Denník je zápis majiteľa ⇒ `'profile'`. Šiesta hodnota by si vyžiadala migráciu.
// ════════════════════════════════════════════════════════════════════════════
import type { DogEventInput } from '@/lib/dogEvents';
import type { LogKind } from '@/components/pack/calendar/calendarModel';

/** Čo sa zapisuje. Poradie je poradie čipov v rade. */
export type DiaryKind = 'note' | 'weight' | 'health' | 'milestone';

export type DiaryChip = {
  id: DiaryKind;
  /**
   * Kľúč `dog_events.field`. 🔴 `weight` píše do `health.weightKg`, teda do POĽA,
   * ktoré už appka má a číta ho karta psa aj váhová krivka v kalendári — denník
   * mu nezakladá druhé miesto, len pridáva druhý vchod.
   */
  field: string;
  /** Do akého riadku kalendára to padne, keď je dátum v minulosti. */
  kind: LogKind;
  labelKey: string;
  labelFallback: string;
  hintKey: string;
  hintFallback: string;
  /**
   * 🟡 PREDBEŽNÉ, NIE LOCK. Matej 21. 9. 2026: „tie emoji chcem vedieť aj zmeniť…
   * najprv to musím vidieť v kontexte celej stránky." Emoji sú preto POHROMADE
   * na jednom mieste — výmena je jeden ťah tu, nie hľadanie po komponentoch.
   * Sada je Emoji 1.0 (2015), to isté kritérium ako `markEmoji.ts` a `LOG_TYPES`:
   * značka, ktorú vidno len na novom telefóne, nie je značka.
   */
  emoji: string;
  /** Píše sa text, alebo číslo? Rozhoduje o tvare `value` aj o poli vo formulári. */
  input: 'text' | 'number';
  /**
   * Smie k tomu ísť fotka?
   * ⚠️ VÁHA NIE. `value` váženia MUSÍ ostať holé číslo — kalendár aj karta psa ho
   *    čítajú cez `typeof ev.value === 'number'` a obal `{ kg, photo }` by ich
   *    ticho oslepil. Fotka váhy patrí k poznámke, nie k meraniu.
   */
  photo: boolean;
};

export const DIARY_CHIPS: readonly DiaryChip[] = [
  {
    id: 'note',
    field: 'diary.note',
    kind: 'note',
    labelKey: 'pack.diary.chip.note', labelFallback: 'Note',
    hintKey: 'pack.diary.hint.note', hintFallback: 'What happened today',
    emoji: '📝',
    input: 'text',
    photo: true,
  },
  {
    id: 'weight',
    field: 'health.weightKg',
    kind: 'weigh',
    labelKey: 'pack.diary.chip.weight', labelFallback: 'Weight',
    hintKey: 'pack.diary.hint.weight', hintFallback: 'Kilograms, one number',
    emoji: '⚖️',
    input: 'number',
    photo: false,
  },
  {
    id: 'health',
    field: 'diary.health',
    kind: 'vet',
    labelKey: 'pack.diary.chip.health', labelFallback: 'Health',
    hintKey: 'pack.diary.hint.health', hintFallback: 'Vet, medication, symptom',
    emoji: '💉',
    input: 'text',
    photo: true,
  },
  {
    id: 'milestone',
    field: 'diary.milestone',
    kind: 'milestone',
    labelKey: 'pack.diary.chip.milestone', labelFallback: 'Milestone',
    hintKey: 'pack.diary.hint.milestone', hintFallback: 'First swim, gotcha day, a win',
    emoji: '⭐',
    input: 'text',
    photo: true,
  },
];

export const chipOf = (id: DiaryKind): DiaryChip =>
  DIARY_CHIPS.find((c) => c.id === id) ?? DIARY_CHIPS[0];

/** Polia, ktoré má kalendár načítať. Jeden zdroj — nech si ich neopisuje. */
export const DIARY_FIELDS: readonly string[] = DIARY_CHIPS.map((c) => c.field);

/** `field` → do akého riadku kalendára patrí. Prázdne pole = neznáme, preskoč. */
export const DIARY_KIND_BY_FIELD: Readonly<Record<string, LogKind>> =
  Object.fromEntries(DIARY_CHIPS.map((c) => [c.field, c.kind]));

/** Tvar `value` textového zápisu. Číselné váženie je holé číslo, nie tento objekt. */
export type DiaryValue = { text: string; photo?: string };

/**
 * Je `value` textový zápis denníka? Riadok z DB je `unknown` — a `health.weightKg`
 * má v tej istej tabuľke číslo, takže sa to musí dať rozoznať, nie predpokladať.
 */
export function asDiaryValue(v: unknown): DiaryValue | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.text !== 'string') return null;
  return { text: o.text, photo: typeof o.photo === 'string' ? o.photo : undefined };
}

// ── DÁTUM ROZHODUJE ─────────────────────────────────────────────────────────
// 🔴 PLÁN A ZÁPIS NIE SÚ DVE DLAŽDICE. Rozhoduje dátum VNÚTRI toku: minulý (a dnešok)
// = stalo sa, budúci = plán a v kalendári sa vykreslí ako plán. Platí to pre výlet aj
// pre denník — rovnaké pravidlo dvakrát je zámer (`createRegistry.ts`, `CreateNeed`).
//
// ⚠️ POROVNÁVA SA DEŇ, NIE OKAMIH. Zápis o 14:00 s dátumom „dnes" nesmie byť plán len
//    preto, že `new Date()` je o sekundu neskôr.

/** `YYYY-MM-DD` dnešného dňa v MIESTNOM čase. `toISOString()` je UTC a po 23:00 v SR dá zajtrajšok. */
export function todayKey(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Je ten deň v budúcnosti? Dnešok NIE JE plán. */
export const isPlanDay = (dayKey: string): boolean => dayKey > todayKey();

/**
 * `YYYY-MM-DD` z poľa `<input type="date">` na `recorded_at`.
 *
 * ⚠️ POLUDNIE, NIE POLNOC. `new Date('2026-09-21')` je polnoc UTC, čo je v SR ešte
 *    20. 9. večer — zápis by v kalendári pristál o deň skôr. Poludnie miestneho času
 *    je bezpečné vo všetkých pásmach, v ktorých appka beží.
 */
export function dayToRecordedAt(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0).toISOString();
}

/** Vstup pre `appendDogEvents()`. Jedno miesto, kde sa denník prekladá do udalosti. */
export function diaryEvent(
  dogId: string,
  chip: DiaryChip,
  dayKey: string,
  body: { text: string; photo?: string; number?: number },
): DogEventInput {
  const value: unknown = chip.input === 'number'
    ? (body.number ?? null)
    : ({ text: body.text, ...(body.photo ? { photo: body.photo } : {}) } satisfies DiaryValue);
  return {
    dogId,
    field: chip.field,
    value,
    source: 'profile',
    recordedAt: dayToRecordedAt(dayKey),
  };
}
