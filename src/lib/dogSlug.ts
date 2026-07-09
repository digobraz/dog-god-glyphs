// ─────────────────────────────────────────────────────────────────────────
// Dog page URL slugs — `/dog/<name>-<pack>` (e.g. /dog/bruno-23).
// The pack number is the KEY (dog names are not unique); the name part is
// cosmetic, Stack Overflow-style. `/dog/23` and legacy `/d/23` must keep
// working — they canonicalize to the full slug once the dog record loads.
// ─────────────────────────────────────────────────────────────────────────

/** Build the canonical slug: "bruno-23". Falls back to "23" when the name
 *  has no ASCII letters/digits (e.g. CJK-only names). */
export function dogSlug(name: string | null | undefined, pack: number): string {
  const s = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (Nelôčka → nelocka)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return s ? `${s}-${pack}` : String(pack);
}

/** Extract the pack number from any accepted slug shape:
 *  "bruno-23" → 23, "23" → 23, "r2-d2-23" → 23. Null when there is no
 *  trailing number. */
export function packFromSlug(slug: string | null | undefined): number | null {
  if (!slug) return null;
  const m = slug.match(/(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Canonical public path for a dog. */
export function dogPagePath(name: string | null | undefined, pack: number): string {
  return `/dog/${dogSlug(name, pack)}`;
}
