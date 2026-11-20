// VÝBER ÚRADU pre podnet (scr 9): keď poloha prípadu nezodpovedá žiadnej RVPS (alebo prípad nie je), vyberie sa zo zoznamu.
// SK = 40 regionálnych veterinárnych správ (RVPS), CZ = SVS. Dáta: `data/dangerAuthorities.ts`.
import { DANGER_AUTHORITIES } from '@/data/dangerAuthorities';
import { useSosT } from '../sosShared';

export function AuthorityPick({ country, value, onChange }: { country: 'SK' | 'CZ'; value: string; onChange: (code: string) => void }) {
  const s = useSosT();
  const list = DANGER_AUTHORITIES
    .filter((a) => (country === 'CZ' ? a.kind === 'cz_svs' : a.kind === 'rvps'))
    .sort((a, b) => a.name.localeCompare(b.name, 'sk'));
  if (!list.length) return <p className="sos-small">{s('pack.sos.danger.complaint.authorityNone')}</p>;
  return (
    <label className="sos-field">
      <span>{s('pack.sos.danger.complaint.authorityPick')}</span>
      <select className="pf-field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" />
        {list.map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
      </select>
    </label>
  );
}

export default AuthorityPick;
