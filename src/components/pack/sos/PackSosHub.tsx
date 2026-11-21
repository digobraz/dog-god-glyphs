// SOS → ROZCESTNÍK `/pack/sos` (kôš 3). Odhlásený človek z prvej pomoci či pohotovosti sa nemá vracať na prihlásenie:
// ostáva v SOS a vidí, čo smie bez účtu (prvá pomoc, pohotovosť, 112). Prihlásený tu nájde aj vyhlásenie straty a núdzovú kartičku.
// Skladá sa z existujúcich prvkov (`sos-row`, `sos-cta`, ikonky z `SosButton`); žiadny nový vizuál.
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { AID_ON, SOS_ON, VET_ER_ON } from '@/lib/env';
import { APP_NEW } from '@/lib/packFlags';
import { PACK_BOX } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { SysIcon } from '@/components/pack/SysIcon';
import { SosTaskShell } from './SosTaskShell';
import { SOS_HUB, loginPath, useBack, useSosAuth, useSosT } from './sosShared';

export default function PackSosHub() {
  const s = useSosT();
  const t = useT();
  // názvy riadkov z ručných kľúčov appky (nie z `sosTexts`) s EN poistkou, ako v `SosButton`
  const tx = (key: string, fb: string) => { const v = t(key); return v === key ? fb : v; };
  const nav = useNavigate();
  const auth = useSosAuth();
  const back = useBack(auth === 'out' ? '/' : '/pack');
  const row = (to: string, sys: string, hand: string, label: string) => (
    <button key={to} type="button" className="sos-row" style={{ ...PACK_BOX.row }} onClick={() => nav(to)}>
      {APP_NEW ? <SysIcon name={sys} size={32} /> : <BrandIcon name={hand} size={24} tint="gold" />}
      <span className="grow"><b>{label}</b></span>
    </button>
  );
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <h1 className="sos-h2">{s('pack.sos.hub.title')}</h1>
      <a className="sos-cta sos-cta--red" href="tel:112">{s('pack.sos.hub.call112')}</a>
      <div className="sos-stack" style={{ gap: 8 }}>
        {AID_ON && row('/pack/sos/prva-pomoc', 'sos-pomoc', 'bolt', tx('pack.sos.firstAid', 'First aid'))}
        {VET_ER_ON && row('/pack/sos/pohotovost', 'sos-vet', 'vet', s('pack.sos.er.btn'))}
        {auth === 'in' && SOS_ON && row('/pack/sos/new', 'sos-strateny', 'dogposter', tx('pack.sos.btn.lost', 'My dog is lost'))}
        {auth === 'in' && APP_NEW && row('/pack/sos/karticka', 'sos-karta', 'attention-head', s('pack.sos.card.title'))}
      </div>
      {auth === 'out' && (
        <>
          <p className="sos-p">{s('pack.sos.hub.text')}</p>
          <button type="button" className="sos-cta" onClick={() => nav(loginPath(SOS_HUB))}>{s('pack.sos.login.btn')}</button>
        </>
      )}
    </SosTaskShell>
  );
}
