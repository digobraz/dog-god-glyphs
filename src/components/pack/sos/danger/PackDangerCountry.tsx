// `/pack/sos/nebezpecenstvo/krajina?c=PL` — INÁ KRAJINA než SK/CZ (scr 10 + 11, kôš 3 · ROBÍM ÚLOHU).
// Všeobecná kostra postupu + 112 + jedno textové pole „pomôž krajine“ + kontakt → `dangerTip` (tabuľka `danger_tips`).
// Krajina sa berie z `?c=` (ISO-2), inak sa vyberie; meno krajiny dá `Intl.DisplayNames` v jazyku rozhrania.
// 21. 11. 2026: krajina je POVINNÁ (nikdy sa neuloží `XX`) a dá sa kedykoľvek zmeniť; kontakt = platný telefón ALEBO e-mail;
// rozpísané ostáva v `sessionStorage`.
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import { intlLocale } from '@/i18n/bcp47';
import { dangerErrorCode, dangerIsOffline, dangerPrecheck, dangerTip, type DangerGate } from '@/lib/danger';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import type { SosKey } from '../sosTexts';
import { CharCount, cleanContact, clearDraft, loadDraft, saveDraft, useFieldErr, useSubmitLock } from './dangerForm';

const CODES = ['PL', 'HU', 'AT', 'DE', 'UA', 'RO', 'HR', 'SI', 'IT', 'ES', 'FR', 'GB', 'NL', 'BE', 'PT', 'GR', 'BG', 'RS'];

const CSS = `
.dpk-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;counter-reset:dpk;}
.dpk-steps li{display:grid;grid-template-columns:32px 1fr;gap:12px;align-items:start;font-size:14px;line-height:1.45;counter-increment:dpk;}
.dpk-steps li::before{content:counter(dpk);display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;border:2px solid currentColor;font-weight:600;}
.dpk-call{flex-direction:column;gap:4px;min-height:72px;text-decoration:none;}
.dpk-call b{font-size:24px;line-height:1;}
.dpk-call span{font-size:12px;}
`;

const BODY_MAX = 4000;
const DRAFT_KEY = 'country';
interface CountryDraft { step: 'info' | 'form'; body: string; contact: string }

export default function PackDangerCountry() {
  const s = useSosT();
  const { lang } = useLang();
  const back = useBack('/pack/sos/nebezpecenstvo/tyranie');
  const [qs, setQs] = useSearchParams();
  const rawCode = (qs.get('c') ?? '').toUpperCase();
  const code = /^[A-Z]{2}$/.test(rawCode) ? rawCode : '';
  const draft = useMemo(() => loadDraft<CountryDraft>(DRAFT_KEY), []);
  const [step, setStep] = useState<'info' | 'form'>(draft?.step === 'form' ? 'form' : 'info');
  const [body, setBody] = useState(draft?.body ?? '');
  const [contact, setContact] = useState(draft?.contact ?? '');
  const [gate, setGate] = useState<DangerGate>('ok');
  const lock = useSubmitLock();
  const fe = useFieldErr();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) saveDraft(DRAFT_KEY, { step, body, contact } satisfies CountryDraft);
  }, [done, step, body, contact]);
  // predbežná kontrola pri vstupe na formulár (nečlen sa to dozvie hneď, nie po napísaní)
  useEffect(() => {
    if (step !== 'form') return;
    let alive = true;
    dangerPrecheck('tip').then((g) => { if (alive && g !== 'offline') setGate(g); });
    return () => { alive = false; };
  }, [step]);

  const names = useMemo(() => {
    try { return new Intl.DisplayNames([intlLocale(lang)], { type: 'region' }); } catch { return null; }
  }, [lang]);
  const country = (c: string) => (names?.of(c) ?? c);
  const label = code ? country(code) : s('pack.sos.danger.country.other');
  // krajina z `?c=` mimo zoznamu (napr. SK) sa pridá, aby sa vybraná hodnota nikdy nestratila
  const sorted = useMemo(() => [...new Set(code ? [...CODES, code] : CODES)].sort((a, b) => country(a).localeCompare(country(b), lang)), [names, lang, code]); // eslint-disable-line react-hooks/exhaustive-deps
  const pickCountry = (c: string) => setQs(c ? { c } : {}, { replace: true });
  const countrySelect = (
    <label className="sos-field">
      <span>{s('pack.sos.danger.country.pick')}</span>
      <select ref={fe.reg('country')} className={`pf-field${fe.bad === 'country' ? ' is-bad' : ''}`} value={code} onChange={(e) => { fe.clear('country'); pickCountry(e.target.value); }}>
        <option value="">{s('pack.sos.danger.country.pickPh')}</option>
        {sorted.map((c) => <option key={c} value={c}>{country(c)}</option>)}
      </select>
    </label>
  );

  const send = () => lock(async () => {
    if (busy) return;
    if (gate !== 'ok') return;
    fe.clear();
    if (!code) { setErr(s('pack.sos.danger.country.err.country')); fe.flag('country'); return; }
    if (body.trim().length < 5) { setErr(s('pack.sos.danger.country.err.body')); fe.flag('body'); return; }
    const kontakt = cleanContact(contact);
    if (!kontakt) { setErr(s('pack.sos.danger.country.err.contact')); fe.flag('contact'); return; }
    setBusy(true); setErr('');
    try {
      const g = await dangerPrecheck('tip');
      if (g === 'offline') { setErr(s('pack.sos.offline')); return; }
      if (g !== 'ok') { setGate(g); return; }
      await dangerTip(code, body.trim(), kontakt);
      clearDraft(DRAFT_KEY);
      setDone(true);
    } catch (e) {
      const k = dangerErrorCode(e);
      setErr(dangerIsOffline(e) ? s('pack.sos.offline') : k === 'rate_limited' || k === 'no_access' || k === 'not_authenticated' ? s(`pack.sos.danger.complaint.err.${k}` as SosKey) : s('pack.sos.danger.country.err.error'));
    } finally { setBusy(false); }
  });

  return (
    <SosTaskShell onBack={step === 'form' && !done ? () => setStep('info') : back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      {step === 'info' && (
        <>
          <h1 className="sos-h2">{label}</h1>
          {countrySelect}
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
              {gate !== 'ok' && <p className="sos-err" role="alert">{s(`pack.sos.danger.complaint.err.${gate}` as SosKey)}</p>}
              {countrySelect}
              <label className="sos-field">
                <textarea ref={fe.reg('body')} className={`pf-field${fe.bad === 'body' ? ' is-bad' : ''}`} rows={8} maxLength={BODY_MAX} value={body} placeholder={s('pack.sos.danger.country.bodyPh')} onChange={(e) => { fe.clear('body'); setBody(e.target.value); }} />
                <CharCount len={body.length} max={BODY_MAX} />
              </label>
              <label className="sos-field">
                <span>{s('pack.sos.danger.country.contact')}</span>
                <input ref={fe.reg('contact')} className={`pf-field${fe.bad === 'contact' ? ' is-bad' : ''}`} maxLength={200} value={contact} autoComplete="email" inputMode="email" onChange={(e) => { fe.clear('contact'); setContact(e.target.value); }} />
              </label>
              {err && <p className="sos-err" role="alert">{err}</p>}
              <button type="button" className="sos-cta" disabled={busy || gate !== 'ok'} onClick={() => void send()}>{s('pack.sos.danger.country.send')}</button>
            </>
          )}
        </>
      )}
    </SosTaskShell>
  );
}
