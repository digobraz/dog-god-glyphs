// RIADOK PACIEK DOGYPŤANOV pri klinike — jedna karta objektu na mape (`VetLayer`) aj v SOS (`PackSosVet`).
// Zadanie: `plany/zadanie-veterinar-profil-admin-hodnotenie-2026-11-17.md` §STAVBA 3. Číslo ide von až od
// `CLINIC_MIN_RATINGS` hodnotení (`shownAverage`), dovtedy tichá výzva „Boli ste tu?". Oba tvary vedú na profil.
import { Link } from 'react-router-dom';
import { RatingPaws } from '@/components/pack/tripShared';
import { PACK_TEXT as TX, PACK_SPACE as S, PACK_THEME as T } from '@/components/pack/packTheme';
import { clinicPath } from '@/lib/clinics';
import type { SosT } from '@/components/pack/sos/sosShared';
import { shownAverage, type PawStat } from './clinicPosts';

export const CLINIC_PAWS_CSS = `
.cpl{align-self:flex-start;display:inline-flex;align-items:center;flex-wrap:wrap;gap:${S.xs}px ${S.sm}px;font-size:${TX.label}px;font-weight:600;line-height:1.35;color:${T.inkStrong};text-decoration:none;}
.cpl i{font-style:normal;color:${T.inkWarm};}
.cpl--ask{font-weight:500;color:${T.inkWarm};text-decoration:underline;}
`;

export function ClinicPawsLine({ cid, stat, s, loc }: { cid: string; stat: PawStat | undefined; s: SosT; loc: string }) {
  const shown = shownAverage(stat);
  if (!shown) return <Link className="cpl cpl--ask" to={clinicPath(cid)}>{s('pack.sos.er.clBeenQ')}</Link>;
  const cat = new Intl.PluralRules(loc).select(shown.n);
  const key = cat === 'one' ? 'pack.sos.er.clRateOne' : cat === 'few' ? 'pack.sos.er.clRateFew' : 'pack.sos.er.clRateMany';
  return (
    <Link className="cpl" to={clinicPath(cid)}>
      <i>{s('pack.sos.er.clOurs')}</i>
      <RatingPaws stars={shown.avg} size={12} gap={2} />
      {shown.avg.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      <i>· {s(key, { count: shown.n.toLocaleString(loc) })}</i>
    </Link>
  );
}
