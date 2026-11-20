// `/pack/sos/nebezpecenstvo` — NAHLÁSIŤ NEBEZPEČENSTVO: rozcestník (nákres scr 2). Tri dvere: Týranie · Otrava a nástrahy · Príroda,
// pod nimi odkaz pre inú krajinu než SK/CZ. Kôš 3 (SosTaskShell). Ikonky len existujúce samolepky (SysIcon):
// týranie `sos-tyranie`, otrava `pozor` (náhrada, vlastná ikonka chýba), príroda `zver` (náhrada, vlastná ikonka chýba).
import { useNavigate } from 'react-router-dom';
import { PACK_BOX, PACK_R, PACK_SPACE as S, PACK_TEXT, PACK_THEME as T } from '@/components/pack/packTheme';
import { SysIcon } from '@/components/pack/SysIcon';
import { SosTaskShell } from '../SosTaskShell';
import { useBack, useSosT } from '../sosShared';
import type { SosKey } from '../sosTexts';

const DOORS: { to: string; icon: string; t: SosKey; sub: SosKey; red?: boolean }[] = [
  { to: '/pack/sos/nebezpecenstvo/tyranie', icon: 'sos-tyranie', t: 'pack.sos.danger.hub.abuse', sub: 'pack.sos.danger.hub.abuse.sub', red: true },
  { to: '/pack/sos/nebezpecenstvo/otrava', icon: 'pozor', t: 'pack.sos.danger.hub.poison', sub: 'pack.sos.danger.hub.poison.sub', red: true },
  { to: '/pack/sos/nebezpecenstvo/priroda', icon: 'zver', t: 'pack.sos.danger.hub.nature', sub: 'pack.sos.danger.hub.nature.sub' },
];

const CSS = `
.dgh-door{gap:${S.md}px;}
.dgh-ico{flex:none;display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:${PACK_R.pill}px;border:3px solid ${T.cardEdge};background:${T.card};}
.dgh-ico.red{border-color:${T.sosRed};}
.dgh-door b{font-size:${PACK_TEXT.lead}px;}
`;

export default function PackDangerHub() {
  const s = useSosT();
  const navigate = useNavigate();
  const back = useBack('/pack');
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.danger.hub.title')}</h1>
      {DOORS.map((d) => (
        <button key={d.to} type="button" className="sos-row dgh-door" style={{ ...PACK_BOX.card, padding: S.md }} onClick={() => navigate(d.to)}>
          <span className={`dgh-ico${d.red ? ' red' : ''}`}><SysIcon name={d.icon} size={36} /></span>
          <span className="grow"><b>{s(d.t)}</b><small>{s(d.sub)}</small></span>
        </button>
      ))}
      <p className="sos-p">{s('pack.sos.danger.hub.motto')}</p>
      <button type="button" className="sos-cta sos-cta--ghost sos-cta--sm" onClick={() => navigate('/pack/sos/nebezpecenstvo/krajina')}>{s('pack.sos.danger.hub.country')}</button>
    </SosTaskShell>
  );
}
