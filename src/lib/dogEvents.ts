// dog_events — append-only denník údajov o psovi.
// Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §4 (krok 1 poradia stavby).
// Migrácia: vystupy/supabase/migrations/20260806_dog_events.sql
//
// ⚠️ JEDINÉ PRAVIDLO TOHTO MODULU: zápis je VŽDY prírastok, nikdy prepis.
//    Oprava hodnoty = nový riadok s novším `recordedAt` (a `source: 'correction'`).
//    Preto tu neexistuje `updateDogEvent()` ani `deleteDogEvent()` — a ani vzniknúť
//    nesmú. Karta psa ukazuje aktuálny stav, ale veterinár aj longevity protokol
//    potrebujú PRIEBEH (váha v čase, dátumy očkovaní, zmeny liekov); ten sa spätne
//    nedopočíta, keď sa raz prepíše stĺpec.
//
// KDE dáta ležia sa ešte môže meniť (§3 zadania — DB vs. localStorage je odložiteľný
// swap), AKÝM TVAROM sa zapisujú nie. Preto lokálny fallback nižšie drží presne ten
// istý append tvar ako tabuľka — pri swape sa dá naliať do DB bez straty histórie.
import { supabase } from '@/integrations/supabase/client';

// `dog_events` nie je v generovanom `integrations/supabase/types.ts` — ten je zosnímaný
// z LIVE schémy, kde tabuľka zatiaľ nie je (migrácia beží najprv na DEV). Rovnaký prípad
// a rovnaké riešenie ako 7 trip/messaging tabuliek v `lib/packStore.ts`: pretypovanie
// VÝHRADNE na hranici volania, nie v logike modulu. Po nasadení na LIVE + regenerácii
// typov sa `sb` zmaže a volania sa vrátia na `supabase`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type DogEventSource = 'quiz' | 'profile' | 'import' | 'vet' | 'correction';

export interface DogEventInput {
  dogId: string;
  /** `<sekcia>.<pole>` — napr. 'health.weightKg', 'food.feeding', 'card.recall'. */
  field: string;
  /** Čokoľvek serializovateľné. `null` = „majiteľ pole vyprázdnil" (legitímny zápis). */
  value: unknown;
  source?: DogEventSource;
  /** KEDY SA TO STALO. Default = teraz. Očkovanie z minulého roka sa zapisuje s dátumom vlaňajška. */
  recordedAt?: string;
}

export interface DogEvent extends DogEventInput {
  id: string;
  source: DogEventSource;
  recordedAt: string;
  createdAt: string;
}

/** Posledná známa hodnota jedného poľa — to, čo renderuje karta psa. */
export interface LatestValue {
  value: unknown;
  recordedAt: string;
  source: DogEventSource;
}

// ── lokálny fallback ────────────────────────────────────────────────────────
// Používa sa, keď nie je session (DEV_NOAUTH) alebo keď insert zlyhá (offline PWA).
// Nie je to „druhá pravda": je to tá istá append fronta, len v prehliadači. Čítanie
// oba zdroje ZLUČUJE a novší `recordedAt` vyhráva — takže sa lokálny zápis prejaví
// na karte okamžite aj bez servera.
const LOCAL_KEY = 'dogypt.dogEvents.v1';

function readLocal(): DogEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as DogEvent[]) : [];
  } catch {
    return []; // corrupt / private mode — non-fatal
  }
}

function writeLocal(rows: DogEvent[]): void {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(rows)); } catch { /* quota — non-fatal */ }
}

function localId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// in-tab listeners — hub a karta psa sa prekreslia hneď po zápise z kvízu
type Listener = () => void;
const listeners = new Set<Listener>();
export function onDogEventsChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function emitChange(): void { listeners.forEach((l) => l()); }

// ── zápis ───────────────────────────────────────────────────────────────────
/**
 * Zapíše prírastky. Jeden krok kvízu pri troch psoch = tri vstupy v JEDNOM volaní
 * (a jednom round-tripe) — preto pole, nie jeden objekt.
 */
export async function appendDogEvents(inputs: DogEventInput[]): Promise<void> {
  if (inputs.length === 0) return;
  const now = new Date().toISOString();

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;

  if (userId) {
    const rows = inputs.map((i) => ({
      dog_id: i.dogId,
      user_id: userId,
      field: i.field,
      value: i.value === undefined ? null : i.value,
      source: i.source ?? 'quiz',
      recorded_at: i.recordedAt ?? now,
    }));
    const { error } = await sb.from('dog_events').insert(rows);
    if (!error) { emitChange(); return; }
    // Insert padol (offline / RLS / tabuľka ešte nie je na tomto projekte) — zápis
    // sa NESMIE stratiť, ide do lokálnej fronty. Preto tu nie je `throw`.
    console.warn('[dogEvents] insert failed, falling back to local queue:', error.message);
  }

  writeLocal([
    ...readLocal(),
    ...inputs.map((i) => ({
      ...i,
      id: localId(),
      value: i.value === undefined ? null : i.value,
      source: i.source ?? ('quiz' as DogEventSource),
      recordedAt: i.recordedAt ?? now,
      createdAt: now,
    })),
  ]);
  emitChange();
}

// ── čítanie ─────────────────────────────────────────────────────────────────
function foldLatest(rows: Array<{ field: string; value: unknown; recordedAt: string; source: DogEventSource }>): Record<string, LatestValue> {
  const out: Record<string, LatestValue> = {};
  for (const r of rows) {
    const cur = out[r.field];
    if (!cur || r.recordedAt >= cur.recordedAt) {
      out[r.field] = { value: r.value, recordedAt: r.recordedAt, source: r.source };
    }
  }
  return out;
}

/** Posledná hodnota každého poľa jedného psa — hlavná čítacia cesta karty psa. */
export async function readLatest(dogId: string): Promise<Record<string, LatestValue>> {
  const local = readLocal()
    .filter((r) => r.dogId === dogId)
    .map((r) => ({ field: r.field, value: r.value, recordedAt: r.recordedAt, source: r.source }));

  const { data, error } = await sb
    .from('dog_events')
    .select('field, value, recorded_at, source')
    .eq('dog_id', dogId)
    .order('recorded_at', { ascending: true });

  const remote = error || !data
    ? []
    : data.map((r) => ({
        field: r.field as string,
        value: r.value as unknown,
        recordedAt: r.recorded_at as string,
        source: r.source as DogEventSource,
      }));

  // Poradie je zámerné: lokálne najprv, vzdialené potom — pri ZHODNOM `recordedAt`
  // (napr. zápis, ktorý sa práve podaril na server aj do fronty) vyhrá serverová
  // verzia, lebo `foldLatest` berie >= .
  return foldLatest([...local, ...remote]);
}

/** Priebeh jedného poľa v čase — váhová krivka, história očkovaní, trend na karte. */
export async function readSeries(dogId: string, field: string): Promise<DogEvent[]> {
  const local = readLocal().filter((r) => r.dogId === dogId && r.field === field);

  const { data, error } = await sb
    .from('dog_events')
    .select('id, field, value, recorded_at, created_at, source')
    .eq('dog_id', dogId)
    .eq('field', field)
    .order('recorded_at', { ascending: true });

  const remote: DogEvent[] = error || !data ? [] : data.map((r) => ({
    id: r.id as string,
    dogId,
    field: r.field as string,
    value: r.value as unknown,
    source: r.source as DogEventSource,
    recordedAt: r.recorded_at as string,
    createdAt: r.created_at as string,
  }));

  return [...local, ...remote].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}

/** Posledné hodnoty pre viac psov naraz — progres v hube MY PACK (jeden dotaz, nie N). */
export async function readLatestForDogs(dogIds: string[]): Promise<Record<string, Record<string, LatestValue>>> {
  if (dogIds.length === 0) return {};

  const local = readLocal().filter((r) => dogIds.includes(r.dogId));

  const { data, error } = await sb
    .from('dog_events')
    .select('dog_id, field, value, recorded_at, source')
    .in('dog_id', dogIds)
    .order('recorded_at', { ascending: true });

  const byDog: Record<string, Array<{ field: string; value: unknown; recordedAt: string; source: DogEventSource }>> = {};
  for (const id of dogIds) byDog[id] = [];

  for (const r of local) {
    byDog[r.dogId]?.push({ field: r.field, value: r.value, recordedAt: r.recordedAt, source: r.source });
  }
  if (!error && data) {
    for (const r of data) {
      const id = r.dog_id as string;
      byDog[id]?.push({
        field: r.field as string,
        value: r.value as unknown,
        recordedAt: r.recorded_at as string,
        source: r.source as DogEventSource,
      });
    }
  }

  return Object.fromEntries(Object.entries(byDog).map(([id, rows]) => [id, foldLatest(rows)]));
}

/** Má pole vyplnenú hodnotu? Prázdny reťazec a prázdne pole sa NErátajú ako vyplnené. */
export function hasValue(v: LatestValue | undefined): boolean {
  if (!v) return false;
  const x = v.value;
  if (x === null || x === undefined || x === '') return false;
  if (Array.isArray(x)) return x.length > 0;
  return true;
}
