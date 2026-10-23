/**
 * /carry — DOBROVOĽNÝ DAR (24. 10. 2026). Nákres `plany/nakres-milodar-2026-10-24.html`.
 * Matej: *„nejakú členskú landing page úprimnú — milodar … úprimne napísať, že z 3 eur koľko ide
 * na poplatky … mesačne 3-5-8-12 … ukážeme výdavky"*. DOGMA §9.2: „Hnutie je financované
 * milodarmi svojich ľudí — príspevkami, ktoré dávajú slobodne, s vedomím, kam idú."
 *
 * 🔴 PRÁVNE (rozbor 24. 10., pamäť project_dogypt_milodar_2026-10-24): obdarovaný je s.r.o.
 *    ⇒ dar NESMIE mať protiplnenie (nič neodomkne) a stránka NESMIE tvrdiť „zbierame pre útulky"
 *    (verejná zbierka smie len o.z./n.o.). Dar podporuje chod DOGYPTu; čo DOGYPT robí so svojimi
 *    peniazmi (aj útulok), je len ukázané.
 * 🔴 NIE JE to druhé CTA k €11 — homepage ani /magnet sem neodkazujú (Fable: dar nesmie zjesť heroglyf).
 *
 * Skladá sa LEN z brandu (lock NÁKRES A NOVÁ STRÁNKA): papyrus `LAB` ako /magnet, PODBLOK
 * `PACK_BOX.subblock`, výber = lapisový tint `pickTintCSS`, jediné plné CTA lapis, PROGRES `.pk-progress`.
 */
import { useEffect, useMemo, useState } from 'react';
import { useT, useLang } from '@/i18n/LanguageContext';
import { Seo } from '@/components/Seo';
import { LAB } from '@/lib/labTheme';
import { LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PACK_THEME as T, PACK_SPACE as S, PACK_R, PACK_TEXT, FONT_TITLE, FONT_UI, PILL_CSS, PROGRESS_CSS, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { EDGE_BASE } from '@/lib/env';
import { supabase } from '@/integrations/supabase/client';
import { pokladnica, type PrijemMesiac } from '@/lib/pokladnica';
import { GIFT_TIERS, GIFT_DEFAULT, GIFT_MIN, GIFT_MAX, giftFee, prevadzkaMesacne, CARD_EU, CARD_NON_EU, BILLING_PCT } from '@/lib/prispevok';

/** Ďalší útulok a hranica výplaty — tie isté čísla ako šuplík PRIAMA POMOC (`PokladnicaSheet.tsx`). */
const UTULOK = 'Pes a mačka, Kremnica';
const VYPLATA = 200;
const TEXT_COL = 640;

const goldWords = (s: string) => s.split('*').map((p, i) => (i % 2 ? <span className="cy-g" key={i}>{p}</span> : p));

type Stats = { supporters: number; monthly_eur: number; month_net_eur: number; total_net_eur: number };
type Dash = { dogyptians?: number; revenue_by_month?: PrijemMesiac[]; treasuries?: { help?: number } };
type Thanks = { paid: boolean; amount: number; interval: 'month' | 'once'; next: string | null; manage: string | null };

async function call<R>(body: Record<string, unknown>, auth?: string): Promise<R> {
  const r = await fetch(`${EDGE_BASE}/prispevok`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? `http_${r.status}`);
  return j as R;
}

/** Token prihláseného — dar sa mu priradí k účtu. Nikdy nečaká dlhšie než 1,5 s (zaseknutý navigator.locks). */
async function sessionToken(): Promise<string | undefined> {
  try {
    const r = await Promise.race([
      supabase.auth.getSession().then((x) => x.data.session?.access_token),
      new Promise<undefined>((res) => setTimeout(() => res(undefined), 1500)),
    ]);
    return r ?? undefined;
  } catch { return undefined; }
}

export default function Carry() {
  const t = useT();
  const { lang } = useLang();
  const gl = lang === 'sk' || lang === 'cs' ? lang : 'en';
  const loc = gl === 'sk' ? 'sk-SK' : gl === 'cs' ? 'cs-CZ' : 'en-IE';
  const eur = (n: number, dec = n % 1 !== 0) =>
    `${n.toLocaleString(loc, { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 })} €`;
  const tf = (k: string, v: Record<string, string | number>) =>
    Object.entries(v).reduce((s, [a, b]) => s.split(`{${a}}`).join(String(b)), t(k));

  const params = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), []);
  const [monthly, setMonthly] = useState(true);
  const [amount, setAmount] = useState<number>(GIFT_DEFAULT);
  const [own, setOwn] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(params.get('zrusene') ? t('carry.canceled') : null);
  const [fees, setFees] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dash, setDash] = useState<Dash | null>(null);
  const [thanks, setThanks] = useState<Thanks | null>(null);
  const [manageOpen, setManageOpen] = useState(params.has('odkaz'));
  const [manageMail, setManageMail] = useState('');
  const [manageSent, setManageSent] = useState(false);

  useEffect(() => {
    call<Stats>({ action: 'stats' }).then(setStats).catch(() => {});
    fetch(`${EDGE_BASE}/get-dashboard-stats`).then((r) => r.json()).then(setDash).catch(() => {});
    const sid = params.get('dakujeme');
    if (sid) call<Thanks>({ action: 'session', session_id: sid }).then(setThanks).catch(() => {});
  }, [params]);

  const run = useMemo(() => prevadzkaMesacne(), []);
  const ledger = useMemo(() => (dash?.revenue_by_month ? pokladnica(dash.revenue_by_month) : null), [dash]);
  const help = (dash?.treasuries?.help ?? 0) % VYPLATA;
  const members = dash?.dogyptians ?? 0;
  const netOf5 = GIFT_DEFAULT - giftFee(GIFT_DEFAULT, true);
  const need = Math.ceil(run.spolu / netOf5);
  // Mesačné dary po poplatku (server dáva hrubé súčty aktívnych predplatných).
  const monthlyNet = stats ? Math.max(0, stats.monthly_eur - stats.supporters * CARD_EU.fix - (stats.monthly_eur * (CARD_EU.pct + BILLING_PCT)) / 100) : 0;

  const ownNum = own ? Math.round(Number(own.replace(',', '.'))) : NaN;
  const value = own ? ownNum : amount;
  const valid = Number.isFinite(value) && value >= GIFT_MIN && value <= GIFT_MAX;
  const fee = valid ? giftFee(value, monthly) : 0;

  const give = async () => {
    if (!valid || busy) return;
    setBusy(true); setErr(null);
    try {
      const { url } = await call<{ url: string }>({ action: 'checkout', amount: value, interval: monthly ? 'month' : 'once', lang: gl }, await sessionToken());
      window.location.href = url;
    } catch {
      setErr(t('carry.err')); setBusy(false);
    }
  };
  const sendManage = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manageMail.trim())) return;
    try { await call({ action: 'manage', email: manageMail.trim(), lang: gl }); } catch { /* odpoveď je rovnaká vždy */ }
    setManageSent(true);
  };

  const nextDate = thanks?.next ? new Date(thanks.next).toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' }) : '';

  return (
    <main className="cy-root">
      <Seo title={t('carry.seo.title')} description={t('carry.lead')} path="/carry" />
      <style>{CSS}</style>

      {thanks ? (
        // ═══ PO PLATBE ═══
        <section className="cy-sec cy-thanks">
          <p className="cy-eye">{t('carry.eye')}</p>
          <h1 className="cy-h1">{t('carry.thanks.h')}</h1>
          <p className="cy-lead">{t('carry.thanks.p')}</p>
          <span className="pk-pill cy-badge">{t('carry.thanks.badge')}</span>
          <div className="cy-facts" style={{ ...PACK_BOX.subblock }}>
            <div className="cy-f"><span>{t(thanks.interval === 'month' ? 'carry.monthly' : 'carry.once')}</span><b>{eur(thanks.amount)}</b></div>
            {nextDate && <div className="cy-f"><span>{t('carry.thanks.next')}</span><b>{nextDate}</b></div>}
            <div className="cy-f"><span>{t('carry.thanks.receipt')}</span><b>{t('carry.thanks.inMail')}</b></div>
          </div>
          <a className="cy-cta" href="/">{t('carry.thanks.back')}</a>
          {thanks.manage && <a className="cy-link" href={thanks.manage}>{t('carry.thanks.manage')}</a>}
        </section>
      ) : (
        // ═══ 1 · ÚVOD + DAR ═══
        <section className="cy-sec cy-hero">
          <p className="cy-eye">{t('carry.eye')}</p>
          <h1 className="cy-h1">{goldWords(t('carry.h'))}</h1>
          <p className="cy-lead">{t('carry.lead')}</p>

          <div className="cy-facts" style={{ ...PACK_BOX.subblock }}>
            <div className="cy-f"><span>{t('carry.f.run')}</span><b>~{eur(Math.round(run.spolu))}</b></div>
            {ledger && <div className="cy-f"><span>{t('carry.f.work')}</span><b>{tf('carry.f.workV', { h: ledger.praca.mesacne })}</b></div>}
            {ledger && <div className="cy-f"><span>{t('carry.f.ledger')}</span><b>{eur(Math.round(ledger.prijem))} / {eur(Math.round(ledger.naklady))}</b></div>}
          </div>

          <div className="cy-tog" role="tablist">
            <button type="button" role="tab" aria-selected={monthly} className={monthly ? 'on' : ''} onClick={() => setMonthly(true)}>{t('carry.monthly')}</button>
            <button type="button" role="tab" aria-selected={!monthly} className={!monthly ? 'on' : ''} onClick={() => setMonthly(false)}>{t('carry.once')}</button>
          </div>

          <div className="cy-tiers">
            {GIFT_TIERS.map((g) => {
              const on = !own && amount === g.eur;
              return (
                <button key={g.eur} type="button" className={`cy-tier${on ? ' on' : ''}`} aria-pressed={on}
                  onClick={() => { setAmount(g.eur); setOwn(''); }}>
                  <span>{t(`carry.tier.${g.key}`)}</span>
                  <b>{eur(g.eur)}</b>
                  <i>{tf('carry.arrives', { x: eur(g.eur - giftFee(g.eur, monthly), true) })}</i>
                </button>
              );
            })}
            <label className={`cy-tier cy-own${own ? ' on' : ''}`}>
              <span>{t('carry.own')}</span>
              <span className="cy-own-in">
                <input className="pf-field" inputMode="numeric" placeholder="20" value={own} aria-label={t('carry.own')}
                  onChange={(e) => setOwn(e.target.value.replace(/[^\d.,]/g, '').slice(0, 4))} />
                <b>€</b>
              </span>
            </label>
          </div>

          <p className="cy-fee">
            {valid
              ? <>{tf('carry.fee', { a: eur(value), f: eur(fee, true) })} · <button type="button" className="cy-inline" onClick={() => setFees((f) => !f)}>{t('carry.fees.open')}</button></>
              : tf('carry.min', { min: GIFT_MIN, max: GIFT_MAX })}
          </p>

          {fees && (
            <div className="cy-fees" style={{ ...PACK_BOX.subblock }}>
              <div className="cy-tbl">
                <span className="h">{t('carry.fees.give')}</span><span className="h">Stripe</span><span className="h">{t('carry.fees.arrive')}</span>
                {GIFT_TIERS.map((g) => {
                  const f = giftFee(g.eur, monthly);
                  return [<span key={`a${g.eur}`}>{eur(g.eur)}</span>, <span key={`f${g.eur}`}>{eur(f, true)}</span>, <span key={`n${g.eur}`}><b>{eur(g.eur - f, true)}</b></span>];
                })}
              </div>
              <p className="cy-note">{tf('carry.fees.note', { eu: `${CARD_EU.pct.toLocaleString(loc)} % + ${eur(CARD_EU.fix, true)}`, b: `${BILLING_PCT.toLocaleString(loc)} %`, non: `${CARD_NON_EU.pct.toLocaleString(loc)} % + ${eur(CARD_NON_EU.fix, true)}` })}</p>
              <p className="cy-q"><b>{t('carry.why1.h')}</b> {t('carry.why1.p')}</p>
              <p className="cy-q"><b>{t('carry.member.h')}</b> {t('carry.member.p')}</p>
            </div>
          )}

          {err && <p className="cy-err" role="alert">{err}</p>}
          <button type="button" className="cy-cta" disabled={!valid || busy} onClick={give}>
            {busy ? '…' : tf(monthly ? 'carry.cta.month' : 'carry.cta.once', { a: valid ? eur(value) : '' })}
          </button>
          <p className="cy-hint">{t('carry.hint')}</p>
        </section>
      )}

      {/* ═══ 2 · ČO DOGYPT ROBÍ SO SVOJIMI PENIAZMI ═══ */}
      <section className="cy-sec">
        <hr className="cy-rule" />
        <p className="cy-eye">{t('carry.where.eye')}</p>
        <div className="cy-steps" style={{ ...PACK_BOX.subblock }}>
          <div className="cy-step">
            <i>1</i><span className="nm">{t('carry.run')}</span><span className="v">{eur(Math.round(monthlyNet))} / {eur(Math.round(run.spolu))}</span>
            <span className="pk-progress"><span className="pk-progress__fill" style={{ display: 'block', width: `${Math.min(100, Math.max(2, (monthlyNet / run.spolu) * 100))}%` }} /></span>
            <span className="s2">{tf('carry.run.s', { n: stats?.supporters ?? 0 })}</span>
          </div>
          <div className="cy-step">
            <i>2</i><span className="nm">{t('carry.help')}</span><span className="v">{eur(help)} / {eur(VYPLATA)}</span>
            <span className="pk-progress"><span className="pk-progress__fill cy-fill-help" style={{ display: 'block', width: `${Math.min(100, (help / VYPLATA) * 100)}%` }} /></span>
            <span className="s2">{tf('carry.help.s', { shelter: UTULOK })}</span>
          </div>
          <div className="cy-step">
            <i>3</i><span className="nm">{t('carry.grow')}</span><span className="v">{t('carry.grow.v')}</span>
            <span className="s2">{t('carry.grow.s')}</span>
          </div>
        </div>

        {members > 0 && (
          <div className="cy-vision" style={{ ...PACK_BOX.subblock }}>
            <p className="cy-eye">{t('carry.vision.eye')}</p>
            <b>{tf('carry.vision.n', { n: need, m: members })}</b>
            <p>{tf('carry.vision.p', { a: eur(GIFT_DEFAULT) })}</p>
          </div>
        )}

        <p className="cy-eye cy-eye--gap">{t('carry.costs.eye')}</p>
        <div className="cy-facts" style={{ ...PACK_BOX.row }}>
          {run.mesacne.map((s) => <div className="cy-f" key={s.id}><span>{s.nazov}</span><b>~{eur(Math.round(s.eur))}</b></div>)}
          <div className="cy-f"><span>{run.rocneNazvy.join(' · ')} {t('carry.costs.yearly')}</span><b>~{eur(Math.round(run.rocne))}</b></div>
          <div className="cy-f cy-f--sum"><span>{t('carry.costs.sum')}</span><b>~{eur(Math.round(run.spolu))}</b></div>
        </div>
        <p className="cy-note">{t('carry.costs.live')}</p>
      </section>

      {/* ═══ 3 · UŽ DÁVAŠ? ═══ */}
      <section className="cy-sec cy-manage">
        {!manageOpen ? (
          <button type="button" className="cy-inline" onClick={() => setManageOpen(true)}>{t('carry.manage.q')}</button>
        ) : manageSent ? (
          <p className="cy-hint">{t('carry.manage.sent')}</p>
        ) : (
          <div className="cy-manage-f">
            {params.get('odkaz') && <p className="cy-hint">{t('carry.badlink')}</p>}
            <input className="pf-field" type="email" placeholder={t('carry.manage.ph')} value={manageMail} onChange={(e) => setManageMail(e.target.value)} />
            <button type="button" className="cy-cta cy-cta--small" onClick={sendManage}>{t('carry.manage.send')}</button>
          </div>
        )}
        <p className="cy-legal">{t('carry.legal')}</p>
      </section>
    </main>
  );
}

const CSS = `
${PILL_CSS}
${PROGRESS_CSS}
${PF_FIELD_CSS}
.cy-root{min-height:100vh;background:${LAB.pageBg};background-image:${LAB.pageBackdrop};color:${LAB.ink};font-family:${FONT_UI};overflow-x:hidden;}
.cy-sec{max-width:${TEXT_COL}px;margin:0 auto;padding:${S.xxl}px ${S.lg}px 0;text-align:center;display:flex;flex-direction:column;gap:${S.md}px;}
.cy-hero,.cy-thanks{padding-top:${S.xxxl}px;}
.cy-eye{margin:0;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.goldInk};}
.cy-eye--gap{margin-top:${S.lg}px;}
.cy-h1{margin:0;font:700 clamp(32px, 9vw, 56px)/1.1 ${FONT_TITLE};letter-spacing:.04em;text-transform:uppercase;color:${T.inkStrong};padding-top:.2em;}
.cy-g{background:${LAB.goldText};-webkit-background-clip:text;background-clip:text;color:transparent;font-family:'Cinzel Decorative','Cinzel',serif;font-weight:900;}
.cy-lead{margin:0 auto;max-width:520px;font:400 ${PACK_TEXT.lead}px/1.55 ${FONT_UI};color:${LAB.inkBody};white-space:pre-line;}
.cy-facts{display:flex;flex-direction:column;padding:${S.sm}px ${S.md}px;text-align:left;}
.cy-f{display:flex;justify-content:space-between;gap:${S.md}px;padding:${S.sm}px 0;border-top:1px solid ${LAB.hairline};font:400 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:${T.inkStrong};}
.cy-f:first-child{border-top:0;}
.cy-f b{font-weight:600;white-space:nowrap;}
.cy-f--sum{font-weight:600;}
.cy-tog{display:grid;grid-template-columns:1fr 1fr;gap:${S.xs}px;padding:${S.xs}px;border-radius:${PACK_R.pill}px;border:1px solid ${LAB.edge};margin-top:${S.sm}px;}
.cy-tog button{border:1px solid transparent;background:transparent;cursor:pointer;border-radius:${PACK_R.pill}px;padding:${S.sm}px;
  font:600 ${PACK_TEXT.label}px/1 ${FONT_UI};letter-spacing:.08em;text-transform:uppercase;color:${T.inkWarm};}
.cy-tog button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.cy-tiers{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
@media (min-width:640px){.cy-tiers{grid-template-columns:repeat(4,1fr);}.cy-own{grid-column:1/-1;}}
.cy-tier{display:flex;flex-direction:column;align-items:flex-start;gap:${S.xs}px;padding:${S.md}px;cursor:pointer;text-align:left;
  border-radius:${PACK_R.tile}px;border:1px solid ${LAB.edge};background:transparent;color:${T.inkStrong};font-family:${FONT_UI};}
.cy-tier span{font:500 ${PACK_TEXT.micro}px/1.2 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.cy-tier b{font:700 ${PACK_TEXT.h2}px/1 ${FONT_TITLE};letter-spacing:.04em;}
.cy-tier i{font-style:normal;font-size:${PACK_TEXT.micro}px;color:${LAB.inkSoft};}
.cy-tier.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.cy-own{grid-column:1/-1;flex-direction:row;align-items:center;justify-content:space-between;cursor:text;}
.cy-own-in{display:flex;align-items:center;gap:${S.sm}px;}
.cy-own-in input{width:96px;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.field}px;font:600 ${PACK_TEXT.lead}px/1 ${FONT_UI};color:${T.inkStrong};text-align:right;}
.cy-fee{margin:0;font:400 ${PACK_TEXT.label}px/1.5 ${FONT_UI};color:${LAB.inkSoft};}
.cy-inline{border:0;background:none;padding:0;cursor:pointer;font:500 ${PACK_TEXT.label}px/1.5 ${FONT_UI};color:${LAPIS.edge};text-decoration:underline;text-underline-offset:3px;}
.cy-fees{padding:${S.md}px;text-align:left;display:flex;flex-direction:column;gap:${S.sm}px;}
.cy-tbl{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;font:400 ${PACK_TEXT.label}px/1.4 ${FONT_UI};}
.cy-tbl span{padding:${S.xs}px 0;border-top:1px solid ${LAB.hairline};}
.cy-tbl .h{border-top:0;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.cy-note{margin:0;font:400 ${PACK_TEXT.micro}px/1.5 ${FONT_UI};color:${LAB.inkSoft};text-align:center;}
.cy-q{margin:0;font:400 ${PACK_TEXT.label}px/1.5 ${FONT_UI};color:${LAB.inkBody};}
.cy-q b{font-weight:600;color:${T.inkStrong};}
.cy-err{margin:0;font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:${PICK_INK.red};}
/* CTA — LAPIS, geometria .btn-gold (radius 8), ten istý recept ako .mg-cta na /magnet. */
.cy-cta{display:flex;align-items:center;justify-content:center;width:100%;cursor:pointer;text-decoration:none;margin-top:${S.sm}px;
  border:1.5px solid rgba(250,244,236,0.30);border-radius:${PACK_R.field}px;padding:${S.lg}px ${S.xl}px;
  background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};
  font:700 ${PACK_TEXT.body}px/1 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.cy-cta:hover{background:${LAPIS.gradHover};transform:translateY(-1px);}
.cy-cta:disabled{opacity:.5;cursor:default;transform:none;}
.cy-cta--small{width:auto;padding:${S.md}px ${S.lg}px;margin-top:0;font-size:${PACK_TEXT.label}px;}
.cy-hint{margin:0;font:500 ${PACK_TEXT.micro}px/1.5 ${FONT_UI};letter-spacing:.12em;text-transform:uppercase;color:${LAB.inkSoft};}
.cy-link{font:500 ${PACK_TEXT.label}px/1.5 ${FONT_UI};color:${LAPIS.edge};text-decoration:underline;text-underline-offset:3px;}
.cy-badge{align-self:center;background:rgba(201,154,63,0.18);border-color:${LAB.goldSolid};color:${LAB.goldInk};}
.cy-rule{border:0;height:2px;margin:0 auto ${S.md}px;width:100%;background:${T.rule};}
.cy-steps{padding:${S.sm}px ${S.md}px;text-align:left;}
.cy-step{display:grid;grid-template-columns:24px 1fr auto;gap:${S.sm}px ${S.md}px;align-items:center;padding:${S.md}px 0;border-top:1px solid ${LAB.hairline};}
.cy-step:first-child{border-top:0;}
.cy-step i{width:24px;height:24px;border-radius:${PACK_R.pill}px;display:grid;place-items:center;font:600 ${PACK_TEXT.micro}px/1 ${FONT_UI};font-style:normal;background:${LAPIS.grad};color:${LAPIS.ink};}
.cy-step .nm{font:600 ${PACK_TEXT.label}px/1.3 ${FONT_UI};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}
.cy-step .v{font:600 ${PACK_TEXT.label}px/1 ${FONT_UI};white-space:nowrap;color:${T.inkStrong};}
.cy-step .pk-progress,.cy-step .s2{grid-column:2/4;}
.cy-step .s2{font:400 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};color:${LAB.inkSoft};}
.cy-fill-help{background:${T.partHelp};}
.cy-vision{padding:${S.lg}px;display:flex;flex-direction:column;gap:${S.xs}px;margin-top:${S.sm}px;}
.cy-vision b{font:700 ${PACK_TEXT.h1}px/1.1 ${FONT_TITLE};letter-spacing:.04em;color:${T.inkStrong};}
.cy-vision p:last-child{margin:0;font:400 ${PACK_TEXT.body}px/1.5 ${FONT_UI};color:${LAB.inkBody};}
.cy-manage{padding-bottom:${S.xxxl * 2}px;}
.cy-manage-f{display:flex;gap:${S.sm}px;flex-wrap:wrap;justify-content:center;}
.cy-manage-f .cy-hint{width:100%;}
.cy-manage-f input{flex:1 1 200px;padding:${S.md}px;border-radius:${PACK_R.field}px;font:400 ${PACK_TEXT.body}px/1 ${FONT_UI};color:${T.inkStrong};}
.cy-legal{margin:${S.lg}px 0 0;font:400 ${PACK_TEXT.micro}px/1.5 ${FONT_UI};color:${LAB.inkMuted};}
`;
