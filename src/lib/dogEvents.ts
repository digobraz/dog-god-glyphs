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
  /** K4: hodnotu zapísal pawmate (meno pri čine) — štítok pri poli DOG ID. */
  actedBy?: string | null;
  actedName?: string | null;
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
// 🔴 ODMIETNUTIE SERVEROM ≠ VÝPADOK SIETE (audit 5. 10. 2026). Do vtedy išlo do lokálnej
//    fronty KAŽDÉ zlyhanie a fronta sa NIKDY neodoslala — nikde nebol kód, ktorý by ju
//    vyprázdnil. Člen videl „Uložené", DOG ID ukazovalo 100 %, server nemal nič a na inom
//    zariadení bol pes prázdny. Najčastejší prípad: pawmate (RLS `dog_events_insert_own`
//    pustí len majiteľa) — jeho zápis sa nikdy nemohol podariť.
//    Teraz: PostgREST/Postgres vráti kód (`42501` RLS, `23…` integrita, `42P01` tabuľka,
//    `PGRST…`) ⇒ je to odpoveď servera a opakovanie nepomôže ⇒ THROW, volajúci ukáže chybu.
//    Bez kódu (fetch padol, offline PWA) ⇒ fronta, ktorú `flushDogEventsQueue` dopošle.
function isServerRejection(error: { code?: string } | null | undefined): boolean {
  return !!error?.code && /^([0-9A-Z]{5}|PGRST\d+)$/.test(error.code);
}

let flushing = false;
/**
 * Dopošle lokálnu frontu na server. Volá sa pred každým zápisom a pri načítaní hubu.
 * Rows, ktoré server ODMIETNE, sa z fronty zahodia (opakovanie by nepomohlo a len by
 * držali falošné percento DOG ID); pri výpadku siete fronta ostáva na ďalší pokus.
 */
export async function flushDogEventsQueue(userId?: string | null): Promise<void> {
  if (flushing) return;
  const queued = readLocal();
  if (queued.length === 0) return;
  let uid = userId;
  if (uid === undefined) {
    const { data } = await supabase.auth.getSession();
    uid = data?.session?.user?.id ?? null;
  }
  if (!uid) return; // DEV_NOAUTH — fronta je jediné úložisko, nechaj ju tak
  flushing = true;
  try {
    const { error } = await sb.from('dog_events').insert(queued.map((r) => ({
      dog_id: r.dogId,
      user_id: uid,
      field: r.field,
      value: r.value === undefined ? null : r.value,
      source: r.source,
      recorded_at: r.recordedAt,
    })));
    if (!error) { writeLocal([]); emitChange(); return; }
    if (isServerRejection(error)) {
      console.warn('[dogEvents] server rejected queued rows, dropping them:', error.message);
      writeLocal([]);
      emitChange();
    }
  } finally {
    flushing = false;
  }
}

/** `'queued'` = zápis čaká vo fronte (offline) a dopošle sa, až bude spojenie — UI to povie vetou. */
export async function appendDogEvents(inputs: DogEventInput[]): Promise<'saved' | 'queued'> {
  if (inputs.length === 0) return 'saved';
  const now = new Date().toISOString();

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;

  if (userId) {
    await flushDogEventsQueue(userId);
    const rows = inputs.map((i) => ({
      dog_id: i.dogId,
      user_id: userId,
      field: i.field,
      value: i.value === undefined ? null : i.value,
      source: i.source ?? 'quiz',
      recorded_at: i.recordedAt ?? now,
    }));
    const { error } = await sb.from('dog_events').insert(rows);
    if (!error) { emitChange(); return 'saved'; }
    if (isServerRejection(error)) {
      console.warn('[dogEvents] insert rejected:', error.code, error.message);
      throw new Error(error.message);
    }
    // Výpadok siete — zápis sa NESMIE stratiť, ide do fronty a dopošle sa neskôr.
    console.warn('[dogEvents] insert failed (offline?), queued:', error.message);
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
  return 'queued';
}

// ── čítanie ─────────────────────────────────────────────────────────────────
function foldLatest(rows: Array<{ field: string; value: unknown; recordedAt: string; source: DogEventSource; actedBy?: string | null; actedName?: string | null }>): Record<string, LatestValue> {
  const out: Record<string, LatestValue> = {};
  for (const r of rows) {
    const cur = out[r.field];
    if (!cur || r.recordedAt >= cur.recordedAt) {
      out[r.field] = { value: r.value, recordedAt: r.recordedAt, source: r.source, actedBy: r.actedBy ?? null, actedName: r.actedName ?? null };
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
    .select('field, value, recorded_at, source, acted_by, acted_name')
    .eq('dog_id', dogId)
    .order('recorded_at', { ascending: true });

  const remote = error || !data
    ? []
    : data.map((r) => ({
        field: r.field as string,
        value: r.value as unknown,
        recordedAt: r.recorded_at as string,
        source: r.source as DogEventSource,
        actedBy: (r.acted_by as string | null) ?? null,
        actedName: (r.acted_name as string | null) ?? null,
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

  // Hub MY PACK je prvé miesto po prihlásení — tu sa dopošle, čo ostalo vo fronte offline.
  await flushDogEventsQueue().catch(() => { /* ďalší pokus pri ďalšom zápise */ });
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

/**
 * VŠETKY zápisy vymenovaných polí pre viac psov naraz — JEDEN dotaz.
 *
 * Čitateľ kalendára. `readSeries()` vyššie sa pýta na JEDNO pole JEDNÉHO psa, takže
 * kalendár s tromi psami a štyrmi poľami by spravil dvanásť round-tripov na blok,
 * ktorý je na konci stránky. Tvar výstupu je zhodný s `readSeries` (plné `DogEvent`
 * zoradené podľa `recordedAt`), len sa nefoldne — denník potrebuje VŠETKY riadky,
 * nie posledný.
 *
 * ⚠️ NEFOLDUJE. To je celý rozdiel oproti `readLatest*`: denník má v jeden deň
 *    pokojne tri zápisy toho istého poľa a všetky tri sú pravda.
 */
export async function readEvents(dogIds: string[], fields: string[]): Promise<DogEvent[]> {
  if (dogIds.length === 0 || fields.length === 0) return [];

  const local = readLocal().filter((r) => dogIds.includes(r.dogId) && fields.includes(r.field));

  const { data, error } = await sb
    .from('dog_events')
    .select('id, dog_id, field, value, recorded_at, created_at, source')
    .in('dog_id', dogIds)
    .in('field', fields)
    .order('recorded_at', { ascending: true });

  const remote: DogEvent[] = error || !data ? [] : data.map((r) => ({
    id: r.id as string,
    dogId: r.dog_id as string,
    field: r.field as string,
    value: r.value as unknown,
    source: r.source as DogEventSource,
    recordedAt: r.recorded_at as string,
    createdAt: r.created_at as string,
  }));

  return [...local, ...remote].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}

// ── ÚPRAVA A ZMAZANIE ZÁPISU DENNÍKA (audit appky 30. 10. 2026, D·9) ────────────────────────
// Výnimka z append-only, zdôvodnená v migrácii `20261110_dog_events_diary_edit.sql`: smie sa to LEN pre
// textové zápisy `diary.*` (server to vynúti RLS + triggerom). Údaje (váha, očkovanie…) ostávajú
// prírastkom — preto tieto dve funkcie zámerne odmietnu iné pole než `diary.*`.
const isDiaryField = (f: string) => f.startsWith('diary.');

/** Zmení text/fotku a deň zápisu. Lokálny zápis z fronty sa upraví priamo v nej. */
export async function updateDiaryEvent(id: string, patch: { value: unknown; recordedAt: string }): Promise<void> {
  if (id.startsWith('local-')) {
    const rows = readLocal();
    const hit = rows.find((r) => r.id === id);
    if (!hit || !isDiaryField(hit.field)) throw new Error('not editable');
    writeLocal(rows.map((r) => (r.id === id ? { ...r, value: patch.value, recordedAt: patch.recordedAt } : r)));
    emitChange();
    return;
  }
  const { data, error } = await sb.from('dog_events')
    .update({ value: patch.value === undefined ? null : patch.value, recorded_at: patch.recordedAt })
    .eq('id', id).like('field', 'diary.%').select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('not editable');   // RLS: cudzí alebo nie-denníkový riadok
  emitChange();
}

/** Zmaže zápis denníka naozaj (nie tombstone). */
export async function deleteDiaryEvent(id: string): Promise<void> {
  if (id.startsWith('local-')) {
    const rows = readLocal();
    const hit = rows.find((r) => r.id === id);
    if (!hit || !isDiaryField(hit.field)) throw new Error('not deletable');
    writeLocal(rows.filter((r) => r.id !== id));
    emitChange();
    return;
  }
  const { data, error } = await sb.from('dog_events').delete().eq('id', id).like('field', 'diary.%').select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('not deletable');
  emitChange();
}

/** Čaká niečo vo fronte offline? (pre vetu „Uloží sa, keď budeš online".) */
export function hasQueuedDogEvents(): boolean { return readLocal().length > 0; }
