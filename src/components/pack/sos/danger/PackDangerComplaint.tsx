// `/pack/sos/nebezpecenstvo/podnet?case=<id>` — PODNET ÚRADU (scr 9, kôš 3 · ROBÍM ÚLOHU).
// Úrad podľa polohy prípadu (`district` → RVPS, CZ → SVS), inak výber zo zoznamu. Adresa a telefón povinné, meno nepovinné
// („DOGYPT za mňa“ = `sign_name` null). AI prepis (`dangerOfficialText`) nič neukladá a nepridáva fakty; čo chýba, vráti v `missing`.
// Funguje aj BEZ prípadu (z /tyranie „Podať podnet“): `case_id` null, adresa sa napíše.
// Po odoslaní časová os: deň 0 odoslané zo sos@dogypt.com, deň 3 otázka + číslo úradu, deň 7 text pre ŠVPS.
// 🔴 Podnet odíde cez `danger-send`; na DEV/testovacej appke ide na sos@ s [DEV]/[TEST], nikdy na skutočný úrad (poistka v edge).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import {
  dangerCase, dangerComplaintCreate, dangerErrorCode, dangerLastPhone, dangerOfficialText,
  type DangerCase, type DangerOfficialTextInput,
} from '@/lib/danger';
import { authorityByCode, rvpsForDistrict } from '@/data/dangerAuthorities';
import { SysIcon } from '@/components/pack/SysIcon';
import { PACK_THEME as T, PACK_SPACE as S } from '@/components/pack/packTheme';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import type { SosKey } from '../sosTexts';
import { AuthorityPick } from './AuthorityPick';

const CSS = `
.dpc-auth b{display:block;font-weight:600;font-size:16px;}
.dpc-row{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.dpc-row .sos-cta{width:auto;flex:1 1 auto;}
.dpc-ai{display:inline-flex;align-items:center;gap:${S.sm}px;}
.dpc-ai i{font-style:normal;}
.dpc-out{display:flex;flex-direction:column;gap:${S.sm}px;}
.dpc-miss{margin:0;padding-left:${S.lg}px;font-size:14px;line-height:1.45;}
.dpc-chk{display:flex;gap:${S.md}px;align-items:flex-start;cursor:pointer;}
.dpc-chk input{width:20px;height:20px;margin-top:2px;flex:none;}
.dpc-chk b{display:block;font-weight:600;font-size:14px;}
.dpc-chk small{display:block;font-size:12px;opacity:.75;line-height:1.4;}
.dpc-tl{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.md}px;font-size:14px;line-height:1.45;}
.dpc-life{border:1.5px solid ${T.sosRed};}
.dpc-fights{background:${T.sosRedSoft};border:1.5px solid ${T.sosRed};}
`;

const COUNTRIES = ['SK', 'CZ'] as const;
type Cc = (typeof COUNTRIES)[number];

export default function PackDangerComplaint() {
  const s = useSosT();
  const nav = useNavigate();
  const { lang } = useLang();
  const [qs] = useSearchParams();
  const caseId = qs.get('case');
  const back = useBack(caseId ? `/pack/sos/nebezpecenstvo/p/${caseId}` : '/pack/sos/nebezpecenstvo/tyranie');

  const [c, setC] = useState<DangerCase | null | undefined>(caseId ? undefined : null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [tick, setTick] = useState(0);
  const [country, setCountry] = useState<Cc>('SK');
  const [picked, setPicked] = useState('');
  const [manual, setManual] = useState(false);
  const [address, setAddress] = useState('');
  const [raw, setRaw] = useState('');
  const [official, setOfficial] = useState('');
  const [missing, setMissing] = useState<string[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');
  const [phone, setPhone] = useState('');
  const [signed, setSigned] = useState(false);
  const [name, setName] = useState('');
  const [linka, setLinka] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    let alive = true;
    setC(undefined); setLoadFailed(false);
    dangerCase(caseId).then((r) => {
      if (!alive) return;
      setC(r);
      if (r) { setAddress((a) => a || r.place_label || ''); setCountry(r.country === 'CZ' ? 'CZ' : 'SK'); if (r.body) setRaw((x) => x || r.body || ''); }
    }).catch(() => { if (alive) { setC(null); setLoadFailed(true); } });
    return () => { alive = false; };
  }, [caseId, tick]);
  useEffect(() => { dangerLastPhone().then((p) => p && setPhone((x) => x || p)).catch(() => undefined); }, []);

  const auto = useMemo(() => (country === 'CZ' ? authorityByCode('CZ-SVS') : rvpsForDistrict(c?.district)), [country, c?.district]);
  const code = picked || (manual ? '' : auto?.code ?? '');
  const authority = authorityByCode(code);
  const fights = !!c?.what.includes('dog_fights');
  const photos = (c?.photos ?? []).slice(0, 5);

  const askAi = async () => {
    if (aiBusy) return;
    if (raw.trim().length < 5) { setAiErr(s('pack.sos.danger.complaint.aiNeedRaw')); return; }
    setAiBusy(true); setAiErr(''); setMissing([]);
    try {
      const input: DangerOfficialTextInput = {
        kind: c?.kind ?? 'abuse', raw: raw.trim(), what: c?.what ?? [], how_often: c?.how_often ?? null,
        place_label: address.trim(), municipality: c?.municipality ?? null, country,
        authority_name: authority?.name ?? '', lang,
      };
      const r = await dangerOfficialText(input);
      setOfficial(r.text);
      setMissing(r.missing ?? []);
    } catch (e) {
      setAiErr(String((e as Error)?.message) === 'rate_limited' ? s('pack.sos.danger.complaint.aiLimit') : s('pack.sos.danger.complaint.aiError'));
    } finally { setAiBusy(false); }
  };

  const errText = (k: string) => {
    const key = `pack.sos.danger.complaint.err.${k}` as SosKey;
    return ['authority', 'address', 'text', 'phone', 'rate_limited', 'no_access'].includes(k) ? s(key) : s('pack.sos.danger.complaint.err.error');
  };

  const send = async () => {
    if (busy) return;
    const text = official.trim() || raw.trim();
    const tel = phone.trim();
    if (!code) { setErr(errText('authority')); return; }
    if (!address.trim()) { setErr(errText('address')); return; }
    if (!text) { setErr(errText('text')); return; }
    if (tel.replace(/\D/g, '').length < 6) { setErr(errText('phone')); return; }
    setBusy(true); setErr('');
    try {
      await dangerComplaintCreate({
        case_id: c?.id ?? null, country, place_label: address.trim(), authority_code: code,
        raw: raw.trim(), official: text, phone: tel, sign_name: signed && name.trim() ? name.trim() : null,
        cc_linka: linka, photos,
      });
      setSent(true);
    } catch (e) {
      const k = dangerErrorCode(e);
      setErr(errText(k === 'bad_phone' ? 'phone' : k === 'bad_text' ? 'text' : k));
    } finally { setBusy(false); }
  };

  // ── Odoslané: časová os ───────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <style>{CSS}</style>
        <h1 className="sos-h2">{s('pack.sos.danger.complaint.sentTitle')}</h1>
        <p className="sos-p">{s('pack.sos.danger.complaint.sentSub')}</p>
        <SosCard>
          <p className="sos-eyebrow">{s('pack.sos.danger.complaint.nextEyebrow')}</p>
          <ul className="dpc-tl">
            <li>{s('pack.sos.danger.complaint.t0', { authority: authority?.name ?? '' })}</li>
            <li>{s('pack.sos.danger.complaint.t3')}</li>
            <li>{s('pack.sos.danger.complaint.t7')}</li>
          </ul>
        </SosCard>
        <button type="button" className="sos-cta" onClick={() => nav(caseId ? `/pack/sos/nebezpecenstvo/p/${caseId}` : '/pack/sos/nebezpecenstvo', { replace: true })}>
          {s('pack.sos.danger.complaint.done')}
        </button>
      </SosTaskShell>
    );
  }

  return (
    <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
      <style>{CSS}</style>
      <h1 className="sos-h2">{s('pack.sos.danger.complaint.title')}</h1>

      {c === undefined && <p className="sos-p">{s('pack.sos.loading')}</p>}
      {c === null && loadFailed && (
        <SosCard>
          <p className="sos-err">{s('pack.sos.danger.complaint.loadErr')}</p>
          <button type="button" className="sos-cta" onClick={() => setTick((n) => n + 1)}>{s('pack.sos.retry')}</button>
        </SosCard>
      )}

      {c !== undefined && (
        <>
          {fights && (
            <section className="sos-card dpc-fights">
              <p className="sos-p"><b>{s('pack.sos.danger.complaint.fights')}</b></p>
              <a className="sos-cta sos-cta--red" href="tel:158">{s('pack.sos.danger.complaint.call158')}</a>
            </section>
          )}

          {!c && (
            <div className="sos-chips" role="group" aria-label={s('pack.sos.danger.complaint.country')}>
              {COUNTRIES.map((k) => (
                <button key={k} type="button" className={`sos-pill sos-pick${country === k ? ' is-on' : ''}`} aria-pressed={country === k}
                  onClick={() => { setCountry(k); setPicked(''); setManual(false); }}>
                  {s(`pack.sos.danger.complaint.country${k}` as SosKey)}
                </button>
              ))}
            </div>
          )}

          <SosCard className="dpc-auth">
            <p className="sos-eyebrow">{s('pack.sos.danger.complaint.authority')}</p>
            {authority ? (
              <>
                <b>{authority.name}</b>
                <div className="dpc-row">
                  {authority.phone && <a className="sos-cta sos-cta--tint sos-cta--sm" href={`tel:${authority.phone.replace(/\s/g, '')}`}>{authority.phone}</a>}
                  {authority.email && <span className="sos-pill">{authority.email}</span>}
                </div>
              </>
            ) : null}
            {(!auto || manual) && <AuthorityPick country={country} value={code} onChange={setPicked} />}
            {auto && !manual && (
              <button type="button" className="sos-small" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => setManual(true)}>
                {s('pack.sos.danger.complaint.authorityPick')}
              </button>
            )}
          </SosCard>

          <label className="sos-field">
            <span>{s('pack.sos.danger.complaint.address')}</span>
            <input className="pf-field" value={address} maxLength={200} autoComplete="street-address" placeholder={s('pack.sos.danger.complaint.addressPh')}
              onChange={(e) => setAddress(e.target.value)} />
          </label>

          <label className="sos-field">
            <span>{s('pack.sos.danger.complaint.rawEyebrow')}</span>
            <textarea className="pf-field" rows={4} maxLength={1200} value={raw} placeholder={s('pack.sos.danger.complaint.rawPh')}
              onChange={(e) => setRaw(e.target.value)} />
          </label>
          <button type="button" className="sos-cta sos-cta--tint" disabled={aiBusy} onClick={() => void askAi()}>
            <span className="dpc-ai">
              <SysIcon name="ainubis" size={24} />
              <span><span>AI</span>NUBIS{aiBusy ? ' ' + s('pack.sos.danger.complaint.aiBusy') : s('pack.sos.danger.complaint.aiBtn')}</span>
            </span>
          </button>
          {aiErr && <p className="sos-err">{aiErr}</p>}

          <label className="sos-field">
            <span>{s('pack.sos.danger.complaint.official')}</span>
            <textarea className="pf-field" rows={7} maxLength={4000} value={official} placeholder={s('pack.sos.danger.complaint.officialPh')}
              onChange={(e) => setOfficial(e.target.value)} />
          </label>
          {official && !aiErr && <p className="sos-small">{s('pack.sos.danger.complaint.aiNote')}</p>}
          {missing.length > 0 && (
            <SosCard className="dpc-out">
              <p className="sos-p">{s('pack.sos.danger.complaint.aiMissing')}</p>
              <ul className="dpc-miss">{missing.map((m, i) => <li key={i}>{m}</li>)}</ul>
            </SosCard>
          )}
          {photos.length > 0 && <p className="sos-small">{s('pack.sos.danger.complaint.photos', { n: photos.length })}</p>}

          <label className="sos-field">
            <span>{s('pack.sos.danger.complaint.phone')}</span>
            <input className="pf-field" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <p className="sos-small">{s('pack.sos.danger.complaint.phoneHint')}</p>

          <p className="sos-eyebrow">{s('pack.sos.danger.complaint.who')}</p>
          <div className="sos-chips" role="group">
            <button type="button" className={`sos-pill sos-pick${!signed ? ' is-on' : ''}`} aria-pressed={!signed} onClick={() => setSigned(false)}>{s('pack.sos.danger.complaint.whoDogypt')}</button>
            <button type="button" className={`sos-pill sos-pick${signed ? ' is-on' : ''}`} aria-pressed={signed} onClick={() => setSigned(true)}>{s('pack.sos.danger.complaint.whoName')}</button>
          </div>
          {signed && (
            <input className="pf-field" style={{ minHeight: 48, padding: '0 12px' }} value={name} maxLength={80} autoComplete="name"
              placeholder={s('pack.sos.danger.complaint.namePh')} onChange={(e) => setName(e.target.value)} />
          )}
          <p className="sos-small">{s('pack.sos.danger.complaint.whoHint')}</p>

          <label className="dpc-chk">
            <input type="checkbox" checked={linka} onChange={(e) => setLinka(e.target.checked)} />
            <span><b>{s('pack.sos.danger.complaint.linka')}</b><small>{s('pack.sos.danger.complaint.linkaHint')}</small></span>
          </label>

          {err && <p className="sos-err" role="alert">{err}</p>}
          <button type="button" className="sos-cta" disabled={busy} onClick={() => void send()}>
            {busy ? s('pack.sos.danger.complaint.sending') : s('pack.sos.danger.complaint.send')}
          </button>

          <SosCard>
            <p className="sos-eyebrow">{s('pack.sos.danger.complaint.nextEyebrow')}</p>
            <ul className="dpc-tl">
              <li>{s('pack.sos.danger.complaint.t0', { authority: authority?.name ?? '' })}</li>
              <li>{s('pack.sos.danger.complaint.t3')}</li>
              <li>{s('pack.sos.danger.complaint.t7')}</li>
            </ul>
          </SosCard>
          <section className="sos-card dpc-life"><p className="sos-p"><b>{s('pack.sos.danger.complaint.life')}</b></p></section>
          <button type="button" className="sos-cta sos-cta--ghost" onClick={() => nav('/pack/sos/nebezpecenstvo/krajina')}>{s('pack.sos.danger.complaint.otherCountry')}</button>
        </>
      )}
    </SosTaskShell>
  );
}
