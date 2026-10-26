// KRSTNÉ MENO, KTORÝM SA PÁRUJE AUTOR VÝLETU (`addedByMeIds`) — jeden zdroj (audit FEED+profil 26. 10. 2026).
// Výlet nesie v `author` presne toto meno (ADD TRIP ho zapisuje z hlavičky mapy), takže každý,
// kto ráta body PÚTNIKA, musí párovať tým istým. Dovtedy ho rátali štyri miesta trojako
// (profil s menom z objednávky, úprava profilu tiež, mapa a AINUBIS z e-mailu) — kto nemal
// `full_name`, mal na profile iný level než na mape a zverejnené číslo skákalo.

/** Krstné meno z `full_name`, inak odvodené z e-mailu (bez čísel, `+tagu` a bodiek). */
export function firstNameFrom(email: string, fullName?: string | null): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const base = (email.split('@')[0] || '').split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/** Meno autora výletu pre prihláseného človeka — `user_metadata.full_name || name`, inak e-mail. */
export function pilgrimAuthorName(email: string | null | undefined, meta: Record<string, unknown> | null | undefined): string {
  const full = (meta?.full_name || meta?.name) as string | undefined;
  return firstNameFrom(email ?? '', full);
}
