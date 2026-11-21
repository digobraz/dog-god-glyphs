// VÝBER ÚRADU pre podnet (scr 9): voliteľná zmena úradu. SK = 40 regionálnych veterinárnych správ (RVPS), CZ = SVS. Dáta: `data/dangerAuthorities.ts`.
// 🔴 Výber NIE JE povinný: prvá položka (`value=""`) je vždy pomenovaná („Vyberieme my podľa miesta“ alebo úrad podľa polohy),
//    nikdy prázdny riadok. Prázdna hodnota = úrad určíme my (server uloží `AUTO`).
import { DANGER_AUTHORITIES } from '@/data/dangerAuthorities';
import { useSosT } from '../sosShared';

export function AuthorityPick({ country, value, defaultLabel, onChange }: { country: 'SK' | 'CZ'; value: string; defaultLabel: string; onChange: (code: string) => void }) {
  const s = useSosT();
  const list = DANGER_AUTHORITIES
    .filter((a) => (country === 'CZ' ? a.kind === 'cz_svs' : a.kind === 'rvps'))
    .sort((a, b) => a.name.localeCompare(b.name, country === 'CZ' ? 'cs' : 'sk'));
  if (!list.length) return <p className="sos-small">{s('pack.sos.danger.complaint.authorityNone')}</p>;
  return (
    <label className="sos-field">
      <span>{s('pack.sos.danger.complaint.authorityPick')}</span>
      <select className="pf-field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{defaultLabel}</option>
        {list.map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
      </select>
    </label>
  );
}

export default AuthorityPick;
