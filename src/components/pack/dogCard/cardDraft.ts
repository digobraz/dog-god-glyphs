// Koncept núdzovej kartičky žije len v tomto telefóne. Kľúč nesie `user.id`, aby ho na zdieľanom zariadení
// nevidel iný účet, a maže sa pri odhlásení aj pri zmazaní účtu (`clearCardDrafts`).
const PREFIX = 'dogypt.ecard.';

export const cardDraftKey = (userId: string, dogId: string) => `${PREFIX}${userId}.${dogId}`;

/** Zmaže všetky koncepty kartičiek (aj starý tvar kľúča bez `user.id`). */
export function clearCardDrafts(): void {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  } catch { /* súkromné okno */ }
}
