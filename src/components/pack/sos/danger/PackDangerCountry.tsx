// `/pack/sos/nebezpecenstvo/krajina?c=PL` — INÁ KRAJINA než SK/CZ (scr 10 + 11, kôš 3 · ROBÍM ÚLOHU).
// Všeobecná kostra postupu + 112 + jedno textové pole „pomôž krajine“ + kontakt → `dangerTip` (tabuľka `danger_tips`).
// Krajina sa berie z `?c=` (ISO-2), inak sa vyberie; meno krajiny dá `Intl.DisplayNames` v jazyku rozhrania.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { dangerTip } from '@/lib/danger';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import type { SosKey } from '../sosTexts';

const CODES = ['PL', 'HU', 'AT', 'DE', 'UA', 'RO', 'HR', 'SI', 'IT', 'ES', 'FR', 'GB', 'NL', 'BE', 'PT', 'GR', 'BG', 'RS'];

const CSS = `
.dpk-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;counter-reset:dpk;}
.dpk-steps li{display:grid;grid-template-columns:32px 1fr;gap:12px;align-items:start;font-size:14px;line-height:1.45;counter-increment:dpk;}
.dpk-steps li::before{content:counter(dpk);display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;border:2px solid currentColor;font-weight:600;}
.dpk-call{flex-direction:column;gap:4px;min-height:72px;text-decoration:none;}
.dpk-call b{font-size:24px;line-height:1;}
.dpk-call span{font-size:12px;}
`;

export default function PackDangerCountry() {
  const s = useSosT();
  const { lang } = useLang();
  const back = useBack('/pack/sos/nebezpecenstvo/tyranie');
  const [qs, setQs] = useSearchParams();
  const code = (qs.get('c') ?? '').toUpperCase().slice(0, 2);
  const [step, setStep] = useState<'info' | 'form'>('info');
  const [body, setBody] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const names = useMemo(() => {
    try { return new Intl.DisplayNames([intlLocale(lang)], { type: 'region' }); } catch { return null; }
  }, [lang]);
  const country = (c: string) => (names?.of(c) ?? c);
  const label = code ? country(code) : s('pack.sos.danger.country.other');
  const sorted = useMemo(() => [...CODES].sort((a, b) => country(a).localeCompare(country(b), lang)), [names, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async () => {
    if (busy) return;
    if (body.trim().length < 5) { setErr(s('pack.sos.danger.country.err.body')); return; }
    if (!contact.trim()) { setErr(s('pack.sos.danger.country.err.contact')); return; }
    setBusy(true); setErr('');
    try { await dangerTip(code || 'XX', body.trim(), contact.trim()); setDone(true); }
    catch { setErr(s('pack.sos.danger.country.err.error')); }
    finally { setBusy(false); }
  };

  return (
    <SosTaskShell onBack={step === 'form' && !done ? () => setStep('info') : back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      {step === 'info' && (
        <>
          <h1 className="sos-h2">{label}</h1>
          {!code && (
            <label className="sos-field">
              <span>{s('pack.sos.danger.country.pick')}</span>
              <select className="pf-field" value="" onChange={(e) => e.target.value && setQs({ c: e.target.value }, { replace: true })}>
                <option value="" />
                {sorted.map((c) => <option key={c} value={c}>{country(c)}</option>)}
              </select>
            </label>
          )}
          <p className="sos-p">{s('pack.sos.danger.country.lead')}</p>
          <a className="sos-cta sos-cta--red dpk-call" href="tel:112"><b>112</b><span>{s('pack.sos.danger.country.emergency')}</span></a>
          <ol className="dpk-steps">
            {(['s1', 's2', 's3', 's4'] as const).map((k) => <li key={k}>{s(`pack.sos.danger.country.${k}` as SosKey)}</li>)}
          </ol>
          <SosCard>
            <p className="sos-p"><b>{s('pack.sos.danger.country.know', { country: label })}</b></p>
            <button type="button" className="sos-cta" onClick={() => setStep('form')}>{s('pack.sos.danger.country.help')}</button>
          </SosCard>
        </>
      )}
      {step === 'form' && (
        <>
          <h1 className="sos-h2">{s('pack.sos.danger.country.formTitle', { country: label })}</h1>
          {done ? (
            <SosCard><p className="sos-p">{s('pack.sos.danger.country.thanks')}</p></SosCard>
          ) : (
            <>
              <p className="sos-p">{s('pack.sos.danger.country.formLead')}</p>
              <label className="sos-field">
                <textarea className="pf-field" rows={8} maxLength={4000} value={body} placeholder={s('pack.sos.danger.country.bodyPh')} onChange={(e) => setBody(e.target.value)} />
              </label>
              <label className="sos-field">
                <span>{s('pack.sos.danger.country.contact')}</span>
                <input className="pf-field" maxLength={200} value={contact} autoComplete="email" onChange={(e) => setContact(e.target.value)} />
              </label>
              {err && <p className="sos-err" role="alert">{err}</p>}
              <button type="button" className="sos-cta" disabled={busy} onClick={() => void send()}>{s('pack.sos.danger.country.send')}</button>
            </>
          )}
        </>
      )}
    </SosTaskShell>
  );
}
