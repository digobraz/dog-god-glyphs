// ════════════════════════════════════════════════════════════════════════════
// VLASTNÉ PORADIE PSOV — 13. 10. 2026 (Danka #42: „pri mojom profile nech je Belga").
//
// Predvolené poradie je PSIE ČÍSLO vzostupne — človek nesie svoje najnižšie číslo,
// takže pes vedľa neho je ten, ktorého číslo nesie (CLAUDE.md, identita majiteľa).
// Kto si poradie zmení na `/pack/dogs` (pilulka PORADIE), má ho uložené v
// `pack_profiles.human.dogOrder` — k človeku, nie k psovi: žiadne nové miesto na údaje.
// Nákres: plany/nakres-poradie-psov-2026-10-13/ (Matej: „ok A").
// ════════════════════════════════════════════════════════════════════════════
import { getProfile, saveHuman } from '@/components/pack/profile/packProfile';

/** Psy zo zoznamu `order` idú prvé v jeho poradí; ostatné (napr. nový pes) za nimi v pôvodnom. */
export function applyDogOrder<T extends { id: string }>(dogs: T[], order: string[] | null | undefined): T[] {
  if (!order || order.length === 0) return dogs;
  const rank = new Map(order.map((id, i) => [id, i]));
  return dogs
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (rank.get(a.d.id) ?? order.length + a.i) - (rank.get(b.d.id) ?? order.length + b.i))
    .map((x) => x.d);
}

export async function readDogOrder(): Promise<string[]> {
  try {
    const p = await getProfile();
    const o = p.human.dogOrder;
    return Array.isArray(o) ? o.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Zápis vyhodí chybu, keď ho server neprijme — obrazovka ju musí ukázať, nie prehltnúť. */
export async function saveDogOrder(ids: string[]): Promise<void> {
  await saveHuman({ dogOrder: ids }, { throwOnError: true });
}
