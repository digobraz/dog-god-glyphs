// Chyby SPAM STRÁŽE (`content_guard()`, migrácia 20261106_content_guard.sql) → hláška pre človeka.
//   P0429 = príliš rýchlo / rovnaký text dvakrát · P0422 = viac ako 2 odkazy alebo zakázaný vzor.
// Kód nie vždy dôjde ako `error.code` (dátové vrstvy ho zabalia do `new Error(message)`), preto sa hľadá aj v texte.
const SLOW = /P0429|rate_limited|duplicate/i;
const REJECTED = /P0422|too_many_links|blocked/i;

/** Hláška pre stráž, alebo null, keď chyba stráž nie je. `tx` = (kľúč, EN záloha). */
export function guardMessage(err: unknown, tx: (key: string, fallback: string) => string): string | null {
  const e = err as { code?: string; message?: string } | null | undefined;
  const probe = `${e?.code ?? ''} ${e?.message ?? ''}`;
  if (SLOW.test(probe)) return tx('pack.guard.slow', 'Slow down — try again in a moment.');
  if (REJECTED.test(probe)) return tx('pack.guard.rejected', "This can't be posted.");
  return null;
}
