// `/pack/sos/nebezpecenstvo/podnet?case=<id>` — ODOVZDAŤ PRÍPAD (scr 9, kôš 3 · ROBÍM ÚLOHU).
// 🔴 ROZHODNUTIE 21. 11. 2026 (Matej): človek napíše VLASTNÝMI SLOVAMI, čo videl, a prípad odovzdá nám. Úradnou rečou ho píšeme MY
//    (pred overením, dispečer) a úradu ho odosielame MY. Z klienta preto zmizol AI prepis aj tlačidlo „napíš to úradne“.
// Úrad: ak ho vieme z polohy (`district` → RVPS, CZ → SVS), ukáže sa ako informácia „Pôjde na: …“ so zmenou; ak nie, výber nie je
//    povinný („Úrad vyberieme my podľa miesta“, server uloží `AUTO`). Adresa a telefón povinné (jedno číslo, 9 až 15 číslic),
//    meno nepovinné („DOGYPT za mňa“ = `sign_name` null). Funguje aj BEZ prípadu (z /tyranie): `case_id` null, adresa sa napíše.
// Rozpísané ostáva v `sessionStorage` (späť → vpred, obnovenie). Neexistujúci prípad (`?case=abc`) formulár nepustí ďalej.
// Po odoslaní časová os: deň 0 prepis a odoslanie zo sos@dogypt.com, deň 3 otázka + číslo úradu, deň 7 text pre ŠVPS (SK) / SVS (CZ).
// 🔴 Podnet odíde cez `danger-send`; na DEV/testovacej appke ide na sos@ s [DEV]/[TEST], nikdy na skutočný úrad (poistka v edge).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DANGER_TEST_NOTE } from '@/lib/env';
import {
  dangerCase, dangerComplaintCreate, dangerErrorCode, dangerLastPhone, dangerNotFound, dangerPrecheck, isDangerUuid,
  type DangerCase, type DangerGate,
} from '@/lib/danger';
import { authorityByCode, rvpsForDistrict } from '@/data/dangerAuthorities';
import { PACK_THEME as T, PACK_SPACE as S, PACK_TEXT } from '@/components/pack/packTheme';
import { SosCard, useBack, useSosT } from '../sosShared';
import { SosTaskShell } from '../SosTaskShell';
import type { SosKey } from '../sosTexts';
import { AuthorityPick } from './AuthorityPick';
import { CharCount, cleanPhone, clearDraft, loadDraft, saveDraft } from './dangerForm';

const CSS = `
.dpc-auth b{display:block;font-weight:600;font-size:${PACK_TEXT.lead}px;}
.dpc-row{display:flex;flex-wrap:wrap;gap:${S.sm}px;}
.dpc-row .sos-cta{width:auto;flex:1 1 auto;}
.dpc-link{all:unset;cursor:pointer;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};text-decoration:underline;text-underline-offset:2px;}
.dpc-hints{display:flex;flex-direction:column;gap:${S.xs}px;}
.dpc-hints span{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};line-height:1.4;}
.dpc-chk{display:flex;gap:${S.md}px;align-items:flex-start;cursor:pointer;}
.dpc-chk input{width:20px;height:20px;margin-top:2px;flex:none;}
.dpc-chk b{display:block;font-weight:600;font-size:${PACK_TEXT.body}px;}
.dpc-chk small{display:block;font-size:${PACK_TEXT.label}px;opacity:.75;line-height:1.4;}
.dpc-tl{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:${S.md}px;font-size:${PACK_TEXT.body}px;line-height:1.45;}
.dpc-life{border:1.5px solid ${T.sosRed};}
.dpc-fights{background:${T.sosRedSoft};border:1.5px solid ${T.sosRed};}
.dpc-calls{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
`;

const COUNTRIES = ['SK', 'CZ'] as const;
type Cc = (typeof COUNTRIES)[number];
const RAW_MAX = 3000;
const ERR_KEYS = ['authority', 'address', 'text', 'phone', 'sign', 'rate_limited', 'no_access', 'not_authenticated', 'duplicate_open'];

interface ComplaintDraft { country: Cc; picked: string; address: string; raw: string; phone: string; signed: boolean; name: string; linka: boolean }

export default function PackDangerComplaint() {
  const s = useSosT();
  const nav = useNavigate();
  const [qs] = useSearchParams();
  const caseId = qs.get('case');
  const back = useBack(caseId ? `/pack/sos/nebezpecenstvo/p/${caseId}` : '/pack/sos/nebezpecenstvo/tyranie');
  const draftKey = `complaint.${caseId ?? 'none'}`;
  const draft = useMemo(() => loadDraft<ComplaintDraft>(draftKey), [draftKey]);

  // `undefined` = načítava sa · `null` = prípad neexistuje (alebo chyba siete, vtedy `loadFailed`) · inak prípad
  const [c, setC] = useState<DangerCase | null | undefined>(caseId ? (isDangerUuid(caseId) ? undefined : null) : null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [tick, setTick] = useState(0);
  const [country, setCountry] = useState<Cc>(draft?.country === 'CZ' ? 'CZ' : 'SK');
  const [picked, setPicked] = useState(draft?.picked ?? '');
  const [chooseOwn, setChooseOwn] = useState(!!draft?.picked);
  const [address, setAddress] = useState(draft?.address ?? '');
  const [raw, setRaw] = useState(draft?.raw ?? '');
  const [phone, setPhone] = useState(draft?.phone ?? '');
  const [signed, setSigned] = useState(!!draft?.signed);
  const [name, setName] = useState(draft?.name ?? '');
  const [linka, setLinka] = useState(draft?.linka ?? true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [gate, setGate] = useState<DangerGate>('ok');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!caseId || !isDangerUuid(caseId)) return;
    let alive = true;
    setC(undefined); setLoadFailed(false);
    dangerCase(caseId).then((r) => {
      if (!alive) return;
      setC(r);
      if (r) { setAddress((a) => a || r.place_label || ''); setCountry(r.country === 'CZ' || r.country === 'CZE' ? 'CZ' : 'SK'); if (r.body) setRaw((x) => x || r.body || ''); }
    }).catch((e) => { if (alive) { setC(null); setLoadFailed(!dangerNotFound(e)); } });
    return () => { alive = false; };
  }, [caseId, tick]);
  useEffect(() => { dangerLastPhone().then((p) => p && setPhone((x) => x || p)).catch(() => undefined); }, []);
  useEffect(() => {
    let alive = true;
    dangerPrecheck('complaint').then((g) => { if (alive) setGate(g); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (sent) return;
    saveDraft(draftKey, { country, picked, address, raw, phone, signed, name, linka } satisfies ComplaintDraft);
  }, [sent, draftKey, country, picked, address, raw, phone, signed, name, linka]);

  const auto = useMemo(() => (country === 'CZ' ? authorityByCode('CZ-SVS') : rvpsForDistrict(c?.district)), [country, c?.district]);
  const code = picked || auto?.code || '';
  const authority = authorityByCode(code);
  const fights = !!c?.what.includes('dog_fights');
  const photos = (c?.photos ?? []).slice(0, 5);
  const missingCase = !!caseId && c === null && !loadFailed;

  const errText = (k: string) => (ERR_KEYS.includes(k) ? s(`pack.sos.danger.complaint.err.${k}` as SosKey) : s('pack.sos.danger.complaint.err.error'));

  const send = async () => {
    if (busy || gate !== 'ok') return;
    const text = raw.trim();
    const tel = cleanPhone(phone);
    if (!address.trim()) { setErr(errText('address')); return; }
    if (text.length < 5) { setErr(errText('text')); return; }
    if (!tel) { setErr(errText('phone')); return; }
    if (signed && !name.trim()) { setErr(errText('sign')); return; }
    setBusy(true); setErr('');
    try {
      const g = await dangerPrecheck('complaint');
      if (g !== 'ok') { setGate(g); window.scrollTo?.({ top: 0 }); return; }
      await dangerComplaintCreate({
        case_id: c?.id ?? null, country, place_label: address.trim(), authority_code: code || null,
        raw: text, phone: tel, sign_name: signed && name.trim() ? name.trim() : null,
        cc_linka: country === 'SK' && linka, photos,
      });
      clearDraft(draftKey);
      setSent(true);
      window.scrollTo?.({ top: 0 });
    } catch (e) {
      const k = dangerErrorCode(e);
      setErr(errText(k === 'bad_phone' ? 'phone' : k === 'bad_text' ? 'text' : k));
    } finally { setBusy(false); }
  };

  const timeline = (
    <SosCard>
      <p className="sos-eyebrow">{s('pack.sos.danger.complaint.nextEyebrow')}</p>
      <ul className="dpc-tl">
        <li>{authority ? s('pack.sos.danger.complaint.t0', { authority: authority.name }) : s('pack.sos.danger.complaint.t0auto')}</li>
        <li>{s('pack.sos.danger.complaint.t3')}</li>
        <li>{s(country === 'CZ' ? 'pack.sos.danger.complaint.t7cz' : 'pack.sos.danger.complaint.t7')}</li>
      </ul>
    </SosCard>
  );

  // ── Odovzdané: časová os ──────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <SosTaskShell onBack={back} backLabel={s('pack.sos.back')}>
        <style>{CSS}</style>
        <h1 className="sos-h2">{s('pack.sos.danger.complaint.sentTitle')}</h1>
        <p className="sos-p">{s('pack.sos.danger.complaint.sentSub')}</p>
        {/* Kým nie je DANGER_SEND_REAL, podnet ide len na sos@ (inkvizítor 20. 11.): človek to musí vedieť. */}
        {DANGER_TEST_NOTE && <p className="sos-p"><b>{s('pack.sos.danger.complaint.testNote')}</b></p>}
        {timeline}
        <section className="sos-card dpc-life">
          <p className="sos-p"><b>{s('pack.sos.danger.complaint.sentLife')}</b></p>
          <div className="dpc-calls">
            <a className="sos-cta sos-cta--red" href="tel:158">{s('pack.sos.danger.complaint.call158')}</a>
            <a className="sos-cta sos-cta--red" href="tel:112">{s('pack.sos.danger.complaint.call112')}</a>
          </div>
        </section>
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
      {missingCase && (
        <SosCard>
          <p className="sos-p">{s('pack.sos.danger.complaint.caseMissing')}</p>
          <button type="button" className="sos-cta" onClick={() => nav('/pack/sos/nebezpecenstvo', { replace: true })}>{s('pack.sos.back')}</button>
        </SosCard>
      )}

      {c !== undefined && !missingCase && !(c === null && loadFailed) && (
        <>
          {gate !== 'ok' && <p className="sos-err" role="alert">{errText(gate)}</p>}
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
                  onClick={() => { setCountry(k); setPicked(''); setChooseOwn(false); }}>
                  {s(`pack.sos.danger.complaint.country${k}` as SosKey)}
                </button>
              ))}
            </div>
          )}

          <SosCard className="dpc-auth">
            <p className="sos-eyebrow">{s('pack.sos.danger.complaint.authority')}</p>
            {authority ? (
              <>
                <b>{s('pack.sos.danger.complaint.authorityTo', { authority: authority.name })}</b>
                {authority.phone && (
                  <div className="dpc-row">
                    <a className="sos-cta sos-cta--tint sos-cta--sm" href={`tel:${authority.phone.replace(/\s/g, '')}`}>{authority.phone}</a>
                  </div>
                )}
              </>
            ) : (
              <p className="sos-p">{s('pack.sos.danger.complaint.authorityAuto')}</p>
            )}
            {chooseOwn ? (
              <AuthorityPick country={country} value={picked} defaultLabel={auto?.name ?? s('pack.sos.danger.complaint.authorityDefault')} onChange={setPicked} />
            ) : (
              <button type="button" className="dpc-link" onClick={() => setChooseOwn(true)}>
                {s(auto ? 'pack.sos.danger.complaint.authorityChange' : 'pack.sos.danger.complaint.authorityOwn')}
              </button>
            )}
          </SosCard>

          <label className="sos-field">
            <span>{s('pack.sos.danger.complaint.address')}</span>
            <input className="pf-field" value={address} maxLength={200} autoComplete="street-address" placeholder={s('pack.sos.danger.complaint.addressPh')}
              onChange={(e) => setAddress(e.target.value)} />
          </label>

          <SosCard>
            <p className="sos-p">{s('pack.sos.danger.complaint.lead')}</p>
            <label className="sos-field">
              <span>{s('pack.sos.danger.complaint.rawEyebrow')}</span>
              <textarea className="pf-field" rows={6} maxLength={RAW_MAX} value={raw} placeholder={s('pack.sos.danger.complaint.rawPh')}
                onChange={(e) => setRaw(e.target.value)} />
              <CharCount len={raw.length} max={RAW_MAX} />
            </label>
            <div className="dpc-hints">
              <span>{s('pack.sos.danger.complaint.hintsTitle')}</span>
              {(['hint1', 'hint2', 'hint3', 'hint4'] as const).map((k) => <span key={k}>{s(`pack.sos.danger.complaint.${k}` as SosKey)}</span>)}
            </div>
            {photos.length > 0 && <p className="sos-small">{s('pack.sos.danger.complaint.photos', { n: photos.length })}</p>}
          </SosCard>

          <label className="sos-field">
            <span>{s('pack.sos.danger.complaint.phone')}</span>
            <input className="pf-field" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <p className="sos-small">{s('pack.sos.danger.complaint.phoneHint')}</p>

          <p className="sos-eyebrow">{s('pack.sos.danger.complaint.who')}</p>
          <div className="sos-chips" role="group">
            <button type="button" className={`sos-pill sos-pick${!signed ? ' is-on' : ''}`} aria-pressed={!signed} onClick={() => setSigned(false)}>{s('pack.sos.danger.complaint.whoDogypt')}</button>
            <button type="button" className={`sos-pill sos-pick${signed ? ' is-on' : ''}`} aria-pressed={signed} onClick={() => setSigned(true)}>{s('pack.sos.danger.complaint.whoName')}</button>
          </div>
          {signed && (
            <input className="pf-field" style={{ minHeight: 48, padding: `0 ${S.md}px` }} value={name} maxLength={80} autoComplete="name"
              placeholder={s('pack.sos.danger.complaint.namePh')} onChange={(e) => setName(e.target.value)} />
          )}
          <p className="sos-small">{s('pack.sos.danger.complaint.whoHint')}</p>

          {/* Linka proti krutosti je slovenská: pri CZ podnete sa neponúka. */}
          {country === 'SK' && (
            <label className="dpc-chk">
              <input type="checkbox" checked={linka} onChange={(e) => setLinka(e.target.checked)} />
              <span><b>{s('pack.sos.danger.complaint.linka')}</b><small>{s('pack.sos.danger.complaint.linkaHint')}</small></span>
            </label>
          )}

          {err && <p className="sos-err" role="alert">{err}</p>}
          <button type="button" className="sos-cta" disabled={busy || gate !== 'ok'} onClick={() => void send()}>
            {busy ? s('pack.sos.danger.complaint.sending') : s('pack.sos.danger.complaint.send')}
          </button>

          {timeline}
          <section className="sos-card dpc-life"><p className="sos-p"><b>{s('pack.sos.danger.complaint.life')}</b></p></section>
          <button type="button" className="sos-cta sos-cta--ghost" onClick={() => nav('/pack/sos/nebezpecenstvo/krajina')}>{s('pack.sos.danger.complaint.otherCountry')}</button>
        </>
      )}
    </SosTaskShell>
  );
}
