// MOST SNIFFER ↔ DOG ID (Matej 5. 10. 2026, voľba „prepojiť obojsmerne").
//
// SNIFFER má vlastné uloženie psa v `dog_profiles.attrs` — z neho čítajú SQL funkcie balíčka
// kariet a brány (`20260928_sniffer_deck.sql` a nasl.), takže ho pred FLIPom nemeníme.
// DOG ID žije v `dog_events`. Bez mosta člen vypĺňa povahu, kondíciu a „so psami" DVAKRÁT.
//
//   DOG ID → SNIFFER: `prefillFromDogId` — keď je v SNIFFERI pole prázdne a DOG ID ho má,
//                     zapíše ho do `dog_profiles` (aby ho videl aj balíček kariet v SQL).
//   SNIFFER → DOG ID: `mirrorToDogId` — volá `saveDogAttrs`; zmenené polia zapíše aj do DOG ID.
//
// ⚠️ Prázdne pole SNIFFERA NIKDY neprepíše DOG ID a naopak — most dopĺňa, nemaže.
// ⚠️ Zápis cez most je VEDĽAJŠÍ: keď padne, hlavný zápis (ten, ktorý človek práve urobil)
//    už prebehol, takže sa len zaloguje. Chybu hlavného zápisu hlási jeho volajúci.
// ⚠️ Po FLIPe: jeden zdroj (SNIFFER SQL číta `dog_events`), `dog_profiles` a tento súbor preč.
import { appendDogEvents, readLatestForDogs, hasValue, type DogEventInput } from '@/lib/dogEvents';
import type { DogProfileAttrs } from '@/components/pack/profile/packProfile';

type Attrs = Partial<DogProfileAttrs>;

/** Polia, ktoré SNIFFER aj DOG ID nesú v rovnakej sade hodnôt. */
const BRIDGE: Array<{
  field: string;
  get: (a: Attrs) => unknown;
  put: (a: DogProfileAttrs, v: unknown) => Partial<DogProfileAttrs>;
}> = [
  {
    field: 'temperament.tags',
    get: (a) => a.tags?.temperament,
    put: (a, v) => ({ tags: { ...a.tags, temperament: v as DogProfileAttrs['tags']['temperament'] } }),
  },
  {
    field: 'howWorks.fitness',
    get: (a) => a.card?.fitness,
    put: (a, v) => ({ card: { ...a.card, fitness: v as DogProfileAttrs['card']['fitness'] } }),
  },
  {
    field: 'social.dogs',
    get: (a) => a.card?.compat?.dogs_overall,
    put: (a, v) => ({ card: { ...a.card, compat: { ...a.card.compat, dogs_overall: v as never } } }),
  },
  {
    field: 'temperament.joys',
    get: (a) => a.card?.joys,
    put: (a, v) => ({ card: { ...a.card, joys: v as string[] } }),
  },
];

const filled = (v: unknown) => hasValue({ value: v, recordedAt: '', source: 'profile' });
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** SNIFFER → DOG ID. `before` = stav pred zápisom, `after` = po ňom. */
export async function mirrorToDogId(dogId: string, before: Attrs, after: Attrs): Promise<void> {
  const inputs: DogEventInput[] = [];
  for (const b of BRIDGE) {
    const v = b.get(after);
    if (!filled(v) || same(v, b.get(before))) continue;
    inputs.push({ dogId, field: b.field, value: v, source: 'profile' });
  }
  if (!inputs.length) return;
  try {
    await appendDogEvents(inputs);
  } catch (e) {
    console.warn('[dogIdBridge] mirror to DOG ID failed:', (e as Error).message);
  }
}

/**
 * DOG ID → SNIFFER. Vráti záplatu pre každého psa, ktorému niečo doplnil (volajúci ju uloží
 * cez `saveDogAttrs` — tak ide do `dog_profiles` aj do lokálneho stavu naraz).
 */
export async function prefillFromDogId(
  dogIds: string[],
  attrsOf: (id: string) => DogProfileAttrs,
): Promise<Array<{ dogId: string; patch: Partial<DogProfileAttrs> }>> {
  if (!dogIds.length) return [];
  const latest = await readLatestForDogs(dogIds);
  const out: Array<{ dogId: string; patch: Partial<DogProfileAttrs> }> = [];
  for (const id of dogIds) {
    let cur = attrsOf(id);
    let patch: Partial<DogProfileAttrs> = {};
    for (const b of BRIDGE) {
      const fromId = latest[id]?.[b.field];
      if (filled(b.get(cur)) || !hasValue(fromId)) continue;
      const p = b.put(cur, fromId!.value);
      cur = { ...cur, ...p };
      patch = { ...patch, ...p };
    }
    if (Object.keys(patch).length) out.push({ dogId: id, patch });
  }
  return out;
}
