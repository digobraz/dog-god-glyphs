import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useDogyptStore } from '@/store/dogyptStore';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { useFlowKeyboardFix } from '@/hooks/useFlowKeyboardFix';
import { PageTopBar } from '@/components/PageTopBar';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { FlowModal, FLOW_PANEL_CSS } from '@/components/screens/flowPanel';
import { LAPIS, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT } from '@/components/pack/packTheme';
import { B3_CSS } from '@/lib/papyrus3d';
import { LAB } from '@/lib/labTheme';
import { IS_APP } from '@/lib/isApp';
import { track } from '@/lib/analytics';
import { callLogin, readPending, registerFreeInApp, savePending, type Sent } from '@/lib/appRegister';
import { FARAO_AMOUNTS, RANK_OF_CARD, paidRank, startCheckout } from '@/pages/appWeb/vstupne';
import { AI_LOGO } from '@/components/pack/ainubis/3d/zaklad';

// ════════════════════════════════════════════════════════════════════════════
// KONIEC FLOWU NA WEBE — DOBROVOĽNÉ VSTUPNÉ (11. 11. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Nahrádza pokladňu €11 (`FlowCheckoutScreen`) a zadržanie (`FlowStayScreen`).
// Matej 11. 11.: *„nakonci je pokladne s 11eurami a to potrebujeme prerobiť"*.
// Nákres `plany/nakresy/heroflow-cela-obrazovka-2026-11-07/` (obrazovky Ulož heroglyf,
// Dobrovoľné vstupné, Vitaj), texty v `texty-vstupne.json`, platby
// `plany/zadanie-platby-2026-11-11.md`.
//
// TOK DÁT (pes sa NIKDY neplatí; platí sa hodnosť, a tá patrí človeku):
//   odhalenie → [mail, ak ho človek v kroku e-mail preskočil]
//             → ULOŽENIE: `registerFreeInApp` = `create-checkout tier:'guest'` (pes ako hosť, €0)
//               + kód na e-mail (`app-login send`)
//             → KÓD: `app-login verify` → `setSession` (vznikne účet; hodnosť potrebuje prihláseného)
//             → VSTUPNÉ: Veriaci €0 = ďalej zadarmo · Akolyta/Kňaz/Vezír mesačne · Faraón mesačne/raz
//               (`pages/appWeb/vstupne.ts` → edge `vstupne`, TEN ISTÝ volaný ako web `/app#badges`)
//             → `/heroglyph/welcome?free=1` (alebo `?rank=` po zaplatení).
//   Návrat zo Stripe = `?vstupne=cs_…` (úspech) / `?vstupne=zrusene` na tejto istej routе.
//   Store sa po návrate obnoví zo `sessionStorage` konceptu (`lib/flowDraft.ts`, vrátane `guestIds`).
//
// 🔴 V APPKE (Apple 3.1.1, verzia 1.0 bez IAP) sa táto obrazovka NEOTVÁRA: nákup tu nemá miesto,
//    appka ide odhalenie → hosť + kód → `/login` (`FlowRevealScreen.saveInApp`). Stráž ciest ju
//    medzi nákupné adresy zaraďuje tiež (`AppRouteGuard`).
// 🔢 Číslo patrí psovi, nie platbe: hosť ho dostane pri schválení fotky (`seal_pack_number`) a po
//    zaplatení hodnosti ho nesie ďalej. Preto nič z tejto obrazovky číslo nepridelí.
// ════════════════════════════════════════════════════════════════════════════

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const K = 'heroglyph.flow.vstupne.';
const BACK = '/heroglyph/vstupne';

type Phase = 'boot' | 'mail' | 'saving' | 'code' | 'ranks';
type SaveErr = 'photo' | 'email' | 'save' | 'send';

const eur = (n: string, lang: string) => (lang === 'sk' || lang === 'cs' ? n : n.replace(',', '.'));
/** Cena riadku (Faraón „od €111", kým nie je vybraný). */
const PRICES = ['', '3,99', '7,99', '11,99'];

export function FlowVstupneScreen() {
  // 🔴 V appke sa nekupuje — appka na túto routu nepatrí.
  if (IS_APP) return <Navigate to={readPending() ? '/login' : '/pack'} replace />;
  return <Vstupne />;
}

function Vstupne() {
  useFlowKeyboardFix();
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  const flowOk = useFlowGuard();
  const [params] = useSearchParams();
  const ret = params.get('vstupne');

  const email = useDogyptStore((s) => s.email);
  const guestIds = useDogyptStore((s) => s.guestIds);

  const [phase, setPhase] = useState<Phase>('boot');
  const [sent, setSent] = useState<Sent | null>(null);
  const [err, setErr] = useState<SaveErr | null>(null);
  const started = useRef(false);

  // ── ULOŽENIE HOSŤA + KÓD ──────────────────────────────────────────────────
  const save = useCallback(async () => {
    setErr(null);
    setPhase('saving');
    const r = await registerFreeInApp(lang);
    if (r.ok) {
      const p = readPending();
      if (p) { setSent(p); setPhase('code'); return; }
      setErr('send'); return;
    }
    if (r.error === 'lost') { navigate('/heroglyph/name', { replace: true }); return; }
    if (r.error === 'email') { setPhase('mail'); setErr('email'); return; }
    setErr((r.error as SaveErr) ?? 'save');
  }, [lang, navigate]);

  // ── NÁVRAT ZO STRIPE: úspech ide rovno na Vitaj ───────────────────────────
  useEffect(() => {
    if (!ret || !/^cs_(test|live)_/.test(ret)) return;
    track('vstupne_paid_return');
    void paidRank(ret).catch(() => null).then((rank) => {
      navigate(`/heroglyph/welcome?${rank ? `rank=${rank}` : 'free=1'}`, { replace: true });
    });
  }, [ret, navigate]);

  // ── VSTUP NA OBRAZOVKU: prihlásený s uloženým psom → rovno hodnosti ────────
  useEffect(() => {
    if (!flowOk || started.current || (ret && /^cs_/.test(ret))) return;
    started.current = true;
    track('vstupne_viewed');
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session && (Object.keys(guestIds).length > 0 || ret === 'zrusene')) { setPhase('ranks'); return; }
      const pending = readPending();
      if (pending?.save) { setSent(pending); setPhase('code'); return; }
      if (EMAIL_RE.test(email.trim())) void save();
      else setPhase('mail');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowOk]);

  if (!flowOk) return null;

  const back = () => navigate('/heroglyph/reveal');

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_CARVE_CSS}{FLOW_PANEL_CSS}{B3_CSS}{VSTUPNE_CSS}</style>
      <div className="hf-topbar flex-shrink-0">
        <PageTopBar brandBack onBack={back} />
      </div>
      <div className="hf-stage">
        <div className="vs-col">
          {phase === 'boot' && <p className="vs-sub" aria-busy>{t(`${K}saving`)}</p>}
          {phase === 'saving' && !err && <p className="vs-sub" aria-busy role="status">{t(`${K}saving`)}</p>}
          {phase === 'saving' && err && <SaveError err={err} onRetry={() => void save()} />}
          {phase === 'mail' && <MailStep err={err === 'email'} onGo={() => void save()} />}
          {phase === 'code' && sent && (
            <CodeStep
              sent={sent}
              onSent={setSent}
              onIn={() => { savePending(null); setPhase('ranks'); }}
            />
          )}
          {phase === 'ranks' && <Ranks cancelled={ret === 'zrusene'} />}
        </div>
      </div>
    </div>
  );
}

// ── CHYBA ULOŽENIA ───────────────────────────────────────────────────────────
function SaveError({ err, onRetry }: { err: SaveErr; onRetry: () => void }) {
  const t = useT();
  const key = err === 'photo' ? 'appEntry.save.errPhoto' : err === 'send' ? 'appEntry.save.errSend' : 'appEntry.save.errSave';
  return (
    <>
      <p role="alert" className="vs-sub vs-err">{t(key)}</p>
      <button type="button" className="pk-b3 pk-b3--lapis vs-dock" onClick={onRetry}>{t(`${K}retry`)}</button>
    </>
  );
}

// ── E-MAIL (krok e-mail sa dá preskočiť, pes sa bez neho uložiť nedá) ────────
function MailStep({ err, onGo }: { err: boolean; onGo: () => void }) {
  const t = useT();
  const email = useDogyptStore((s) => s.email);
  const setEmail = useDogyptStore((s) => s.setEmail);
  const ok = EMAIL_RE.test(email.trim());
  return (
    <form className="vs-form" onSubmit={(e) => { e.preventDefault(); if (ok) { setEmail(email.trim()); onGo(); } }}>
      <img className="vs-guard" src={AI_LOGO} alt="AINUBIS" />
      <h1 className="vs-h1">{t(`${K}mailTitle`)}</h1>
      <p className="vs-sub">{t(`${K}mailSub`)}</p>
      <input
        className="vs-input" type="email" inputMode="email" autoComplete="email" autoFocus
        value={email} onChange={(e) => setEmail(e.target.value)}
      />
      {err && <p role="alert" className="vs-err">{t('appEntry.save.badMail')}</p>}
      <button type="submit" className="pk-b3 pk-b3--lapis vs-dock" disabled={!ok}>{t(`${K}mailCta`)}</button>
    </form>
  );
}

// ── KÓD Z E-MAILU = VZNIK ÚČTU ───────────────────────────────────────────────
function CodeStep({ sent, onSent, onIn }: { sent: Sent; onSent: (s: Sent) => void; onIn: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [again, setAgain] = useState(false);
  const [fix, setFix] = useState(false);
  const [fixMail, setFixMail] = useState(sent.email ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const N = sent.codeLength;

  const submit = async (c: string) => {
    if (c.length !== N || busy) return;
    setBusy(true); setErr('');
    try {
      const { status, data } = await callLogin({ action: 'verify', code: c, email: sent.email });
      if (data.ok && data.access_token && data.refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token: String(data.access_token), refresh_token: String(data.refresh_token) });
        if (error) throw error;
        onIn();
        return;
      }
      setErr(status === 429 ? t('appEntry.err.rate') : t('appEntry.err.badCode'));
      setCode('');
    } catch { setErr(t('appEntry.err.net')); }
    setBusy(false);
  };
  const resend = async () => {
    setErr('');
    try { await callLogin({ action: 'send', lang, email: sent.email }); setAgain(true); } catch { setErr(t('appEntry.err.net')); }
  };
  // Oprava preklepu: edge prepíše e-mail hosťovského psa (id psa + pôvodný e-mail), store flowu žije.
  const sendFixed = async () => {
    const m = fixMail.trim();
    if (!EMAIL_RE.test(m) || busy) { setErr(t('appEntry.save.badMail')); return; }
    setBusy(true); setErr('');
    if (m.toLowerCase() === (sent.email ?? '').toLowerCase()) { await resend(); setFix(false); setBusy(false); return; }
    useDogyptStore.getState().setEmail(m);
    const r = await registerFreeInApp(lang);
    if (r.ok) {
      const p = readPending();
      if (p) onSent(p);
      setFix(false); setAgain(true); setCode('');
    } else setErr(t(r.error === 'lost' ? 'appEntry.save.lost' : r.error === 'email' ? 'appEntry.save.badMail' : 'appEntry.err.net'));
    setBusy(false);
  };
  const [before, after = ''] = t('appEntry.save.sub').split('{mail}');

  return (
    <form className="vs-form" onSubmit={(e) => { e.preventDefault(); void submit(code); }}>
      <img className="vs-guard" src={AI_LOGO} alt="AINUBIS" />
      <h1 className="vs-h1">{t('appEntry.save.title')}</h1>
      {!fix ? (
        <>
          <p className="vs-sub">
            {before}<b>{sent.email}</b>{after} ·{' '}
            <button type="button" className="vs-link vs-link--inl" onClick={() => { setFixMail(sent.email ?? ''); setErr(''); setFix(true); }}>{t('appEntry.save.fix')}</button>
          </p>
          {/* Jedno skutočné pole pod N políčkami — kód sa dá vložiť naraz a prehliadač ho ponúkne sám. */}
          <label className="vs-code" onClick={() => inputRef.current?.focus()}>
            {Array.from({ length: N }, (_, i) => (
              <i key={i} className={`vs-cell${i === code.length ? ' is-cur' : ''}`}>{code[i] ?? ''}</i>
            ))}
            <input
              ref={inputRef} className="vs-code-input" inputMode="numeric" autoComplete="one-time-code" autoFocus
              aria-label={t('appEntry.code.title')} value={code}
              onChange={(e) => {
                const c = e.target.value.replace(/\D/g, '').slice(0, N);
                setCode(c);
                if (c.length === N) void submit(c);
              }}
            />
          </label>
          {err && <p role="alert" className="vs-err">{err}</p>}
          <button type="button" className="vs-link" onClick={resend} disabled={again}>{again ? t('appEntry.code.sent') : t('appEntry.code.again')}</button>
          <button type="submit" className="pk-b3 pk-b3--lapis vs-dock" disabled={code.length !== N || busy}>{t('appEntry.save.confirm')}</button>
        </>
      ) : (
        <>
          <input
            className="vs-input" type="email" inputMode="email" autoComplete="email" autoFocus
            value={fixMail} onChange={(e) => setFixMail(e.target.value)}
          />
          {err && <p role="alert" className="vs-err">{err}</p>}
          <button type="button" className="pk-b3 pk-b3--lapis vs-dock" disabled={busy} onClick={() => void sendFixed()}>{t('appEntry.save.resendFixed')}</button>
        </>
      )}
    </form>
  );
}

// ── HODNOSTI ─────────────────────────────────────────────────────────────────
function Ranks({ cancelled }: { cancelled: boolean }) {
  const navigate = useNavigate();
  const t = useT();
  const { lang } = useLang();
  /** Predvolený KŇAZ (Matej 7. 11.); Veriaci = pokračovanie zadarmo. */
  const [pick, setPick] = useState(2);
  const [amt, setAmt] = useState<number>(FARAO_AMOUNTS[0]);
  const [kind, setKind] = useState<'month' | 'once'>('month');
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const [kam, setKam] = useState(false);
  const names = ['veriaci', 'akolyta', 'knaz', 'vezir', 'farao'];

  const suma = useMemo(() => {
    if (pick === 0) return '';
    if (pick === 4) return `€${amt}${kind === 'month' ? ` ${t(`${K}perMonth`)}` : ''}`;
    return `€${eur(PRICES[pick], lang)} ${t(`${K}perMonth`)}`;
  }, [pick, amt, kind, lang, t]);

  const go = (qs: string) => navigate(`/heroglyph/welcome?${qs}`);
  const proceed = async () => {
    if (busy) return;
    if (pick === 0) { track('vstupne_free'); go('free=1'); return; }
    const rank = RANK_OF_CARD[pick];
    if (!rank) return;
    setBusy(true); setFail(false);
    track('vstupne_pay_initiated', { rank, kind: pick === 4 ? kind : 'month' });
    const r = await startCheckout(rank, pick === 4 ? kind : 'month', pick === 4 ? amt : undefined, lang, BACK).catch(() => 'error' as const);
    if (r === 'owned') { go(`rank=${rank}`); return; } // už platí mesačne → hodnosť má, ďalej
    if (r === 'login' || r === 'error') { setFail(true); setBusy(false); }
  };

  return (
    <>
      <h1 className="vs-h1">{t(`${K}title`)}</h1>
      <p className="vs-sub">{t(`${K}intro`)}</p>
      <div className="vs-tiers">
        {names.map((n, k) => {
          const on = pick === k;
          return (
            <div key={n} className={`vs-tier${on ? ' is-on' : ''}`}>
              <button type="button" className="vs-row" aria-pressed={on} onClick={() => { setPick(k); setFail(false); }}>
                <img src={`/web-app/odznaky/dogyptan-${k}.webp`} width={44} height={44} alt="" />
                <b>{t(`pack.seal.${n}`)}</b>
                <span className="vs-price">
                  {k === 0 ? '€0' : k === 4 ? (on ? suma : `${t(`${K}from`)} €111`) : `€${eur(PRICES[k], lang)}`}
                </span>
              </button>
              {on && (
                <div className="vs-drawer">
                  <span>{t(k === 0 ? `${K}d0` : `${K}tw${k}`)}</span>
                  {k === 4 && (
                    <>
                      <div className="vs-chips" role="group" aria-label={t('pack.seal.farao')}>
                        {FARAO_AMOUNTS.map((a) => (
                          <button key={a} type="button" className={`vs-chip${amt === a ? ' is-on' : ''}`} aria-pressed={amt === a} onClick={() => setAmt(a)}>€{a}</button>
                        ))}
                      </div>
                      <div className="vs-seg" role="group">
                        {(['month', 'once'] as const).map((x) => (
                          <button key={x} type="button" className={`vs-chip${kind === x ? ' is-on' : ''}`} aria-pressed={kind === x} onClick={() => setKind(x)}>{t(`${K}${x === 'month' ? 'monthly' : 'once'}`)}</button>
                        ))}
                      </div>
                    </>
                  )}
                  {k > 0 && <span className="vs-tiny">{t(`${K}${k === 4 && kind === 'once' ? 'noteOnce' : 'noteMonth'}`)}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {(cancelled || fail) && <p role="alert" className="vs-err">{t(`${K}${fail ? 'err' : 'cancelled'}`)}</p>}
      <p className="vs-fine">{t(`${K}fine`)}<button type="button" className="vs-link vs-link--inl" onClick={() => setKam(true)}>{t(`${K}fineLink`)}</button></p>
      <motion.button
        type="button" className="pk-b3 pk-b3--lapis vs-dock" disabled={busy} onClick={() => void proceed()}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        {pick === 0 ? t(`${K}ctaFree`) : t(`${K}ctaPay`, { suma })}
      </motion.button>

      {/* KAM IDÚ PENIAZE — popup „Financovanie" (texty z nákresu, bez čísel). */}
      <FlowModal open={kam} label={t(`${K}kamTitle`)} onClose={() => setKam(false)} className="vs-kam">
        <h2 className="vs-kam-h">{t(`${K}kamTitle`)}</h2>
        <p className="vs-sub">{t(`${K}kamIntro`)}</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="vs-kam-row"><b>{t(`${K}k${i}`)}</b><span>{t(`${K}k${i}n`)}</span></div>
        ))}
        <button type="button" className="pk-b3 pk-b3--paper vs-kam-x" onClick={() => setKam(false)}>{t(`${K}close`)}</button>
      </FlowModal>
    </>
  );
}

const SUBBLOCK = `background:${PACK_BOX.subblock.background};border:${PACK_BOX.subblock.border};border-radius:${PACK_R.tile}px;box-shadow:${PACK_BOX.subblock.boxShadow};`;

const VSTUPNE_CSS = `
.vs-col { width: 100%; max-width: 576px; display: flex; flex-direction: column; gap: ${PACK_SPACE.sm}px; }
.vs-form { display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.md}px; text-align: center; }
.vs-h1 { margin: 0; text-align: center; font-size: ${PACK_TEXT.h1}px; line-height: 1.1; text-transform: uppercase; color: #000; }
.vs-sub { margin: 0; text-align: center; font-size: ${PACK_TEXT.body}px; line-height: 1.4; color: ${LAB.ink}; }
.vs-sub b { color: #000; }
.vs-guard { width: 72px; height: 72px; object-fit: contain; }
.vs-err { margin: 0; text-align: center; font-size: ${PACK_TEXT.label}px; line-height: 1.4; color: #8E2A20; }
.vs-fine { margin: 0; text-align: center; font-size: ${PACK_TEXT.label}px; line-height: 1.4; color: ${LAB.inkBody}; }
.vs-link { background: none; border: 0; padding: ${PACK_SPACE.xs}px; cursor: pointer; font-size: ${PACK_TEXT.body}px; color: ${LAB.goldInk};
  text-decoration: underline; text-underline-offset: 3px; }
.vs-link--inl { display: inline; padding: 0; font-size: inherit; }
.vs-link:disabled { opacity: .55; cursor: default; text-decoration: none; }
/* ── HODNOSTI: riadok = papyrusový podblok, vybraný = lapisový tint, šuplík je JEDEN blok s riadkom ── */
.vs-tiers { display: flex; flex-direction: column; gap: ${PACK_SPACE.sm}px; }
.vs-tier { ${SUBBLOCK} overflow: hidden; }
.vs-tier.is-on { ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.vs-row { width: 100%; display: flex; align-items: center; gap: ${PACK_SPACE.md}px; padding: ${PACK_SPACE.sm}px ${PACK_SPACE.md}px;
  min-height: 56px; background: none; border: 0; cursor: pointer; text-align: left; color: inherit; }
.vs-row img { flex: none; width: 40px; height: 40px; object-fit: contain; }
.vs-row b { flex: 1; min-width: 0; font-size: ${PACK_TEXT.lead}px; text-transform: uppercase; letter-spacing: .02em; color: #000; }
.vs-price { flex: none; font-size: ${PACK_TEXT.lead}px; font-weight: 900; color: #000; white-space: nowrap; }
.vs-tier.is-on .vs-price, .vs-tier.is-on .vs-row b { color: ${PICK_INK.lapis}; }
.vs-drawer { display: flex; flex-direction: column; gap: ${PACK_SPACE.sm}px; padding: ${PACK_SPACE.sm}px ${PACK_SPACE.md}px ${PACK_SPACE.md}px;
  border-top: 1px dashed rgba(22, 48, 122, 0.35); font-size: ${PACK_TEXT.body}px; line-height: 1.35; color: ${LAB.ink}; }
.vs-tiny { font-size: ${PACK_TEXT.label}px; color: ${LAB.inkBody}; }
.vs-chips, .vs-seg { display: flex; gap: ${PACK_SPACE.xs}px; }
.vs-chip { flex: 1; min-width: 0; min-height: 40px; padding: 0 ${PACK_SPACE.xs}px; border-radius: ${PACK_R.tile}px; cursor: pointer;
  ${SUBBLOCK} font-size: ${PACK_TEXT.body}px; font-weight: 900; color: #000; }
.vs-chip.is-on { ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
/* ── KÓD A POLE ── */
.vs-code { position: relative; background: none; display: flex; gap: ${PACK_SPACE.xs}px; justify-content: center; width: 100%; cursor: text; }
.vs-cell { flex: 0 1 44px; min-width: 0; height: 56px; display: grid; place-items: center; font-style: normal; font-size: ${PACK_TEXT.h2}px;
  border-radius: ${PACK_R.field}px; ${SUBBLOCK} border-radius: ${PACK_R.field}px; color: #000; }
.vs-cell.is-cur { border-color: ${LAPIS.edge}; box-shadow: 0 0 0 3px ${LAPIS.halo}; }
.vs-code-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .01; border: 0; color: transparent; caret-color: transparent; font-size: ${PACK_TEXT.lead}px; }
.vs-input { width: 100%; height: 56px; padding: 0 ${PACK_SPACE.md}px; border-radius: ${PACK_R.field}px; ${SUBBLOCK} border-radius: ${PACK_R.field}px;
  font-size: ${PACK_TEXT.lead}px; color: #000; text-align: center; }
.vs-input:focus { outline: none; border-color: ${LAPIS.edge}; box-shadow: 0 0 0 3px ${LAPIS.halo}; }
/* ── HLAVNÉ CTA: 3D lapis dole cez šírku (geometria dokovania ako \`.hf-dock\`) ── */
.vs-dock { position: fixed; z-index: 40; height: 52px; font-weight: 900;
  left: max(${PACK_SPACE.lg}px, calc(50% - 320px)); right: max(${PACK_SPACE.lg}px, calc(50% - 320px));
  bottom: max(${PACK_SPACE.xl}px, env(safe-area-inset-bottom)); }
/* ── POPUP FINANCOVANIE ── */
.vs-kam { display: flex; flex-direction: column; gap: ${PACK_SPACE.md}px; }
.vs-kam-h { margin: 0; text-align: center; font-size: ${PACK_TEXT.h2}px; text-transform: uppercase; color: #000; }
.vs-kam-row { ${SUBBLOCK} padding: ${PACK_SPACE.md}px; display: flex; flex-direction: column; gap: ${PACK_SPACE.xs}px; font-size: ${PACK_TEXT.body}px; line-height: 1.4; color: ${LAB.ink}; }
.vs-kam-row b { font-size: ${PACK_TEXT.lead}px; text-transform: uppercase; color: #000; }
.vs-kam-x { align-self: stretch; height: 48px; }
/* Nízke okno (1477×724) a SE: obsah ustúpi, vzduch od okraja nie. */
@media (max-height: 800px) {
  .vs-sub { font-size: ${PACK_TEXT.label}px; line-height: 1.3; }
  .vs-h1 { font-size: ${PACK_TEXT.h2}px; }
  .vs-row { min-height: 48px; padding-top: ${PACK_SPACE.xs}px; padding-bottom: ${PACK_SPACE.xs}px; }
  .vs-row img { width: 32px; height: 32px; }
  .vs-drawer { gap: ${PACK_SPACE.xs}px; padding-bottom: ${PACK_SPACE.sm}px; font-size: ${PACK_TEXT.label}px; }
  .vs-chip { min-height: 32px; font-size: ${PACK_TEXT.label}px; }
}
`;
