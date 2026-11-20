// `/pack/sos/nebezpecenstvo/tyranie` — NAHLÁSIŤ TÝRANIE (Matej 20. 11. 2026: „presný postup s číslami na zavolanie na jeden klik! nebudme ľahostajní“).
// Postup a čísla overené 20. 11. 2026: polícia 158 (SK aj CZ), tiesňová 112, mestská polícia SK 159 / CZ 156,
// úradný veterinár = RVPS (svps.sk/rvps, 40 regionálnych správ) · KVS SVS (svs.gov.cz, podľa kraja).
// Zásada „zdokumentuj, oznám, nezverejňuj“ podľa CNN Prima News (CZ) a letáku MZe o ochrane zvierat.
// Texty sú v `danger/txt/reportTexts.ts` (kľúče pack.sos.danger.abuse.*). Čísla a odkaz na úrad sú dáta podľa jazyka: SK, CS, inde len 112.
// Tlačidlá: „Označiť miesto“ → /tyranie/miesto, „Podať podnet úradu“ → /podnet (stavba 20. 11. 2026, scr 3).
import { useNavigate } from 'react-router-dom';
import { PACK_THEME as T, PACK_R, PACK_SPACE as S, PACK_TEXT } from '@/components/pack/packTheme';
import { useLang } from '@/i18n/LanguageContext';
import { openExternal } from '@/lib/appLinks';
import { SysIcon } from '@/components/pack/SysIcon';
import { useBack, useSosT } from './sosShared';
import { SosTaskShell } from './SosTaskShell';
import type { SosKey } from './sosTexts';

type Call = { tel: string; label: SosKey; red?: boolean };

const CALLS: Record<'sk' | 'cs' | 'en', Call[]> = {
  sk: [
    { tel: '158', label: 'pack.sos.danger.abuse.police', red: true },
    { tel: '112', label: 'pack.sos.danger.abuse.emergency', red: true },
    { tel: '159', label: 'pack.sos.danger.abuse.municipal' },
  ],
  cs: [
    { tel: '158', label: 'pack.sos.danger.abuse.police', red: true },
    { tel: '112', label: 'pack.sos.danger.abuse.emergency', red: true },
    { tel: '156', label: 'pack.sos.danger.abuse.municipal' },
  ],
  en: [{ tel: '112', label: 'pack.sos.danger.abuse.emergency', red: true }],
};
const VET_URL: Record<'sk' | 'cs', string> = {
  sk: 'https://svps.sk/rvps/',
  cs: 'https://svs.gov.cz/statni-veterinarni-sprava/organizacni-utvary-statni-veterinarni-spravy/',
};
const STEPS: SosKey[] = ['pack.sos.danger.abuse.step1', 'pack.sos.danger.abuse.step2', 'pack.sos.danger.abuse.step3', 'pack.sos.danger.abuse.step4'];

const CSS = `
.abu-head{display:flex;align-items:center;gap:${S.md}px;}
.abu-lead{margin:0;font-size:${PACK_TEXT.lead}px;font-weight:500;line-height:1.4;color:${T.inkStrong};}
.abu-calls{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:${S.sm}px;}
.abu-calls .sos-cta{flex-direction:column;gap:${S.xs}px;min-height:72px;padding:${S.sm}px;text-decoration:none;}
.abu-calls .sos-cta b{font-size:${PACK_TEXT.h2}px;line-height:1;}
.abu-calls .sos-cta span{font-size:${PACK_TEXT.label}px;line-height:1.2;text-align:center;}
.abu-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.md}px;counter-reset:abu;}
.abu-steps li{display:grid;grid-template-columns:32px 1fr;gap:${S.md}px;align-items:start;font-size:${PACK_TEXT.body}px;line-height:1.45;color:${T.inkStrong};counter-increment:abu;}
.abu-steps li::before{content:counter(abu);display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:${PACK_R.pill}px;border:2px solid ${T.inkStrong};font-weight:600;}
.abu-never{margin:0;font-size:${PACK_TEXT.body}px;line-height:1.45;font-weight:500;color:${T.sosRedDark};}
.abu-help{display:flex;flex-direction:column;gap:${S.sm}px;}
.abu-help .sos-chips a{text-decoration:none;}
`;

export default function PackSosAbuse() {
  const s = useSosT();
  const { lang } = useLang();
  const navigate = useNavigate();
  const back = useBack('/pack/sos/nebezpecenstvo');
  const k = lang === 'sk' || lang === 'cs' ? lang : 'en';
  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <div className="abu-head">
        <SysIcon name="sos-tyranie" size={40} />
        <h1 className="sos-h2">{s('pack.sos.danger.abuse.title')}</h1>
      </div>
      <p className="abu-lead">{s('pack.sos.danger.abuse.lead')}</p>
      <p className="sos-p">{s('pack.sos.danger.abuse.now')}</p>
      <div className="abu-calls">
        {CALLS[k].map((c) => (
          <a key={c.tel} className={`sos-cta${c.red ? ' sos-cta--red' : ' sos-cta--ghost'}`} href={`tel:${c.tel}`}>
            <b>{c.tel}</b><span>{s(c.label)}</span>
          </a>
        ))}
      </div>
      <button type="button" className="sos-cta" onClick={() => navigate('/pack/sos/nebezpecenstvo/tyranie/miesto')}>{s('pack.sos.danger.abuse.mark')}</button>
      <button type="button" className="sos-cta sos-cta--tint" onClick={() => navigate('/pack/sos/nebezpecenstvo/podnet')}>{s('pack.sos.danger.abuse.complaint')}</button>
      <ol className="abu-steps">
        {STEPS.map((key) => <li key={key}>{s(key)}</li>)}
      </ol>
      {k !== 'en' && <button type="button" className="sos-cta sos-cta--ghost" onClick={() => openExternal(VET_URL[k])}>{s('pack.sos.danger.abuse.vet')}</button>}
      <p className="abu-never">{s('pack.sos.danger.abuse.never')}</p>
      {k === 'sk' && (
        <div className="abu-help">
          <p className="sos-eyebrow">{s('pack.sos.danger.abuse.help')}</p>
          <div className="sos-chips">
            <a className="sos-pill" href="tel:+421917662030">{s('pack.sos.danger.abuse.linka')}</a>
            <a className="sos-pill" href="tel:+421907332835">{s('pack.sos.danger.abuse.sosLinka')}</a>
          </div>
        </div>
      )}
    </SosTaskShell>
  );
}
