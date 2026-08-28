/**
 * Slovenské (a české) tvary počítaného podstatného mena: 1 bod · 2–4 body · 5+ bodov.
 *
 * ⚠️ ŽIJE V `lib/`, NIE V `tripShared.tsx` (2026-08-25). Potrebuje ju aj `lib/tripPoints.ts`
 * (rozpad bodov skladá kľúče prekladu), a ten je zámerne čistá knižnica bez väzby na React —
 * import z `tripShared` by doň vtiahol témy, `packStore` aj model pridávania výletu.
 * Napísať si druhú kópiu je horšia možnosť: tvary by sa rozišli v deň, keď sa jedna opraví.
 * `tripShared` ju re-exportuje, takže staršie volajúce netreba prepisovať.
 *
 * Kľúče v slovníku majú tvar `<základ>One` / `<základ>Few` / `<základ>Many`
 * (vzor `pack.addTrip.step.pts*`).
 */
export function pluralKey(n: number): 'One' | 'Few' | 'Many' {
  if (n === 1) return 'One';
  return n >= 2 && n <= 4 ? 'Few' : 'Many';
}
