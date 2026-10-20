import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import { useLang, useT } from '@/i18n/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';
import NavMedallion, { NAV_MEDALLION_CSS } from '@/components/lab/NavMedallion';
import { HandTail } from '@/components/pack/HandIcons';
import { SNIFFER_HEART } from '@/components/pack/buddy/SnifferLogo';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import {
  FONT_TITLE, FONT_UI, PACK_BOX, PACK_HEAD, PACK_R, PACK_SHADOW, PACK_SPACE, PACK_TEXT, PACK_THEME,
  PACK_VEIL, PAGE_AIR, PF_FIELD_CSS, PILL_CSS,
} from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { sizedUrl } from '@/services/cloudinaryService';
import ainubisFace from '@/assets/ainubis-head.webp';
import doorImg from '@/assets/app/brana-dvere.webp';
import pawImg from '@/assets/app/dotyk-labka.webp';
import handImg from '@/assets/app/dotyk-ruka.webp';
import logo2026 from '@/assets/app/logo-2026.svg';

// ════════════════════════════════════════════════════════════════════════════
// PRVÉ OTVORENIE APPKY (20. 10. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Zdroj pravdy = hárok `plany/nakres-appka-prve-otvorenie-v2.html` (schválený),
// zadanie `plany/zadanie-appka-prve-otvorenie-2026-10-20.md`.
// Tok LOCKED 20. 10.: BRÁNA → DOTYK → ČÍSLO → KÓD → POVOLENIA → (wizard v /pack) → DOMOV.
//
// Kedy: appka bez session (`/pack` bez session pošle na `/login`, Login.tsx sem).
// So session sa brána nekreslí vôbec — človek ide rovno DOMOV.
// Na webe ju ukáže `/login?app=1` (náhľad); bežný web /login sa nemení.
//
// Prihlásenie = edge funkcia `app-login`: číslo psa → kód na mail majiteľa → overenie
// na serveri → session. E-mail majiteľa appka nikdy nedostane, len zamaskovaný tvar.
// Hosť dostane namiesto kódu mail s odkazom na platbu — appka to nevie a neukáže.
// ════════════════════════════════════════════════════════════════════════════

type Step = 'gate' | 'touch' | 'number' | 'code' | 'perm';
type PubDog = { n: number; name: string | null; photo: string | null };
type Sent = { masked: string; codeLength: number; dogs: PubDog[]; entered?: number; email?: string };

/** Povolenia sa pýtajú raz na zariadení — potom už len DOMOV. */
const PERM_KEY = 'dogypt_app_perm_v1';
const permAsked = () => { try { return localStorage.getItem(PERM_KEY) === '1'; } catch { return false; } };
const markPermAsked = () => { try { localStorage.setItem(PERM_KEY, '1'); } catch { /* súkromné okno */ } };

/** ROZPRACOVANÝ KÓD PREŽIJE ODCHOD DO MAILU (Matej 20. 10.: „vždy keď odídem zo safari a prídem,
 *  tak stratím postup a kód tam nedokážem dať"). Človek MUSÍ odísť do schránky — a keď sa medzitým
 *  stránka či WebView načíta znova, krok KÓD sa vráti sám. Platí hodinu (dlhšie kód aj tak neplatí).
 *  Ukladá sa len zamaskovaný mail a verejné psy; pri ceste mailom aj zadaný mail — ten je človekov. */
const PENDING_KEY = 'dogypt_app_pending_v1';
const PENDING_MS = 60 * 60_000;
const savePending = (s: Sent | null) => {
  try {
    if (s) localStorage.setItem(PENDING_KEY, JSON.stringify({ s, at: Date.now() }));
    else localStorage.removeItem(PENDING_KEY);
  } catch { /* súkromné okno */ }
};
const readPending = (): Sent | null => {
  try {
    const j = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null') as { s: Sent; at: number } | null;
    return j && Date.now() - j.at < PENDING_MS ? j.s : null;
  } catch { return null; }
};

/** Dvere = obraz 9:16, prikrytý na celú obrazovku (cover). Stred a polomer medailónu sú
 *  zlomky ŠÍRKY obrazu — odmerané v hárku (variant 4 VITRÁŽ · PSY: cx .5 · cy .44 · r .29).
 *  Geometria je ROVNICA z rozmeru okna, nie meranie vykresleného obrazu. */
const DOOR = { aspectW: 9, aspectH: 16, cx: 0.5, cy: 0.44, r: 0.29 };
/** Časy z hárku: medailón sa pootočí (0,9 s) → krídla odídu (1,1 s) · dotyk 2,2 s. */
const T_MEDAL = 900;
const T_LEAVES = 1100;
const T_TOUCH = 2200;

async function callLogin(body: Record<string, unknown>): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${EDGE_BASE}/app-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* prázdne telo */ }
  return { status: res.status, data };
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useWindowSize() {
  const [s, setS] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setS({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return s;
}

// ── 1 · BRÁNA ────────────────────────────────────────────────────────────────
function Gate({ onDone }: { onDone: () => void }) {
  const t = useT();
  const { w, h } = useWindowSize();
  const [open, setOpen] = useState(false);
  // Na výšku dvere prikryjú celú obrazovku (cover); na širokom okne (PC, tablet na šírku) by cover
  // nafúkol medailón cez celé okno — tam stoja dvere celé na výšku v strede, po bokoch papyrus.
  const s = w / h > 0.75 ? h / DOOR.aspectH : Math.max(w / DOOR.aspectW, h / DOOR.aspectH);
  const iw = DOOR.aspectW * s, ih = DOOR.aspectH * s;
  const ox = (w - iw) / 2, oy = (h - ih) / 2;
  const cx = ox + DOOR.cx * iw, cy = oy + DOOR.cy * ih, r = DOOR.r * iw;
  // Výrez v pravom krídle o 1 px menší ako medailón — inak cez vyhladený okraj presvitá podklad.
  const hole = `radial-gradient(circle ${r - 1}px at ${cx}px ${cy}px, transparent ${r - 1}px, #000 ${r - 0.5}px)`;
  const bg = { backgroundImage: `url(${doorImg})`, backgroundSize: `${iw}px ${ih}px`, backgroundPosition: `${ox}px ${oy}px` };

  const enter = () => {
    if (open) return;
    setOpen(true);
    window.setTimeout(onDone, reduced() ? 200 : T_MEDAL + T_LEAVES);
  };

  return (
    <div className={`ae-gate${open ? ' is-open' : ''}`}>
      <div className="ae-leaf ae-leaf--r" style={{ WebkitMaskImage: hole, maskImage: hole }}>
        <i style={{ ...bg, clipPath: `inset(0 0 0 ${cx}px)` }} />
      </div>
      <div className="ae-leaf ae-leaf--l">
        <i style={{ ...bg, clipPath: `inset(0 ${w - cx}px 0 0)` }} />
        <div className="ae-medal" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <div className="ae-medal-at" style={{ left: cx, top: cy, ['--medal-k' as string]: (2 * r / 100).toFixed(3) }}>
            <NavMedallion still flat face={<b className="ae-medal-logo" style={{ WebkitMaskImage: `url(${logo2026})`, maskImage: `url(${logo2026})` }} />} />
          </div>
        </div>
      </div>
      <button type="button" className="pk-pill pk-pill--tap ae-enter" onClick={enter}>
        {t('appEntry.enter')}
      </button>
    </div>
  );
}

// ── 2 · DOTYK ────────────────────────────────────────────────────────────────
function Touch({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, reduced() ? 300 : T_TOUCH + 400);
    return () => window.clearTimeout(id);
  }, [onDone]);
  return (
    <div className="ae-touch" onClick={onDone}>
      <div className="ae-touch-glow" />
      <div className="ae-touch-img ae-touch-paw" style={{ backgroundImage: `url(${pawImg})` }} />
      <div className="ae-touch-img ae-touch-hand" style={{ backgroundImage: `url(${handImg})` }} />
    </div>
  );
}

// ── 3 · ČÍSLO ────────────────────────────────────────────────────────────────
function NumberStep({ onSent }: { onSent: (s: Sent) => void }) {
  const t = useT();
  const { lang } = useLang();
  const [num, setNum] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sheet, setSheet] = useState(false);
  const [mail, setMail] = useState('');

  const errOf = (status: number, e: unknown) =>
    status === 429 ? t('appEntry.err.rate') : e === 'not_found' ? t('appEntry.err.notFound') : t('appEntry.err.net');

  const sendNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = num.replace(/\D/g, '');
    if (!n || busy) return;
    setBusy(true); setErr('');
    try {
      const { status, data } = await callLogin({ action: 'send', number: Number(n), lang });
      if (data.ok) onSent({ masked: String(data.masked), codeLength: Number(data.codeLength) || 8, dogs: (data.dogs as PubDog[]) ?? [], entered: Number(n) });
      else setErr(errOf(status, data.error));
    } catch { setErr(t('appEntry.err.net')); }
    setBusy(false);
  };

  const sendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = mail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) || busy) return;
    setBusy(true); setErr('');
    try {
      const { status, data } = await callLogin({ action: 'send', email: m, lang });
      if (data.ok) onSent({ masked: String(data.masked), codeLength: Number(data.codeLength) || 8, dogs: [], email: m });
      else setErr(errOf(status, data.error));
    } catch { setErr(t('appEntry.err.net')); }
    setBusy(false);
  };

  return (
    <div className="ae-screen">
      {/* Jazyk len na tomto kroku — klasická pilulka s vlajkou (krúžok patrí fotke psa). */}
      <div className="ae-flag"><LanguagePicker variant="flow" /></div>
      <form className="ae-body" onSubmit={sendNumber}>
        <p className="ae-eyebrow">{t('appEntry.eyebrow')}</p>
        <h1 className="ae-title">{t('appEntry.number.title')}</h1>
        <p className="ae-sub">{t('appEntry.number.sub')}</p>
        <label className="ae-num pf-field">
          <span aria-hidden>#</span>
          <input
            inputMode="numeric" pattern="[0-9]*" autoComplete="off" aria-label={t('appEntry.number.title')}
            value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, '').slice(0, 7))}
          />
        </label>
        {err && !sheet && <p className="ae-err" role="alert">{err}</p>}
        <button type="submit" className="ae-cta" disabled={!num || busy}>{t('appEntry.continue')}</button>
        <button type="button" className="ae-link" onClick={() => { setErr(''); setSheet(true); }}>{t('appEntry.noNumber')}</button>
      </form>

      {sheet && (
        <div className="ae-veil" onClick={() => setSheet(false)}>
          <form className="ae-sheet" onClick={(e) => e.stopPropagation()} onSubmit={sendMail}>
            <span className="ae-grip" />
            <h2 className="ae-title ae-title--sheet">{t('appEntry.mail.title')}</h2>
            <p className="ae-sub">{t('appEntry.mail.sub')}</p>
            <input
              className="ae-mail pf-field" type="email" inputMode="email" autoComplete="email" autoFocus
              placeholder="meno@mail.com" value={mail} onChange={(e) => setMail(e.target.value)}
            />
            {err && <p className="ae-err" role="alert">{err}</p>}
            <button type="submit" className="ae-cta" disabled={busy}>{t('appEntry.mail.send')}</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── 4 · KÓD ──────────────────────────────────────────────────────────────────
function Dogs({ dogs, me }: { dogs: PubDog[]; me?: number }) {
  if (!dogs.length) return null;
  // Veľkosti z hárku: 1 pes 72 · do 4 v rade 46 · viac v dvoch radoch 44.
  const dw = dogs.length === 1 ? 72 : dogs.length <= 4 ? 46 : 44;
  return (
    <div className="ae-dogs" style={{ ['--dw' as string]: `${dw}px` }}>
      {dogs.map((d) => (
        <div key={d.n} className="ae-dog">
          <span
            className={`ae-av${d.n === me ? ' is-me' : ''}`}
            style={d.photo ? { backgroundImage: `url(${sizedUrl(d.photo, 216)})` } : undefined}
          >
            <b>#{d.n}</b>
          </span>
          <span className="ae-dog-name">{(d.name ?? '').toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function CodeStep({ sent, onIn, onOther }: { sent: Sent; onIn: () => void; onOther: () => void }) {
  const t = useT();
  const { lang } = useLang();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [again, setAgain] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const N = sent.codeLength;
  const who = sent.entered !== undefined ? { number: sent.entered } : { email: sent.email };

  const submit = useCallback(async (c: string) => {
    if (c.length !== N || busy) return;
    setBusy(true); setErr('');
    try {
      const { status, data } = await callLogin({ action: 'verify', code: c, ...who });
      if (data.ok && data.access_token && data.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: String(data.access_token), refresh_token: String(data.refresh_token),
        });
        if (error) throw error;
        onIn();
        return;
      }
      setErr(status === 429 ? t('appEntry.err.rate') : t('appEntry.err.badCode'));
      setCode('');
    } catch { setErr(t('appEntry.err.net')); }
    setBusy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `who` je odvodené zo `sent`, ktoré sa na tomto kroku nemení
  }, [N, busy, onIn, t, sent]);

  // iOS nad neviditeľným poľom neponúkne „Vložiť“ — kód zo schránky preto berie tlačidlo.
  const paste = async () => {
    try {
      const c = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, N);
      if (!c) return;
      setCode(c);
      if (c.length === N) void submit(c);
    } catch { inputRef.current?.focus(); }
  };

  const resend = async () => {
    setErr('');
    try {
      await callLogin({ action: 'send', lang, ...who });
      setAgain(true);
    } catch { setErr(t('appEntry.err.net')); }
  };

  return (
    <div className="ae-screen">
      <form className="ae-body" onSubmit={(e) => { e.preventDefault(); void submit(code); }}>
        <Dogs dogs={sent.dogs} me={sent.entered} />
        <h1 className="ae-title">{t('appEntry.code.title')}</h1>
        <p className="ae-sub">{t('appEntry.code.sub', { mail: sent.masked })}</p>
        {/* Jedno skutočné pole pod N políčkami — kód z mailu sa dá vložiť naraz
            a iOS ho ponúkne sám (`one-time-code`). */}
        <label className="ae-code" style={{ ['--n' as string]: N }} onClick={() => inputRef.current?.focus()}>
          {Array.from({ length: N }, (_, i) => (
            <i key={i} className={`pf-field${i === code.length ? ' is-cur' : ''}${i === N / 2 - 1 ? ' is-half' : ''}`}>{code[i] ?? ''}</i>
          ))}
          <input
            ref={inputRef} className="ae-code-input" inputMode="numeric" autoComplete="one-time-code" autoFocus
            aria-label={t('appEntry.code.title')} value={code}
            onChange={(e) => {
              const c = e.target.value.replace(/\D/g, '').slice(0, N);
              setCode(c);
              if (c.length === N) void submit(c);
            }}
          />
        </label>
        {err && <p className="ae-err" role="alert">{err}</p>}
        <button type="submit" className="ae-cta" disabled={code.length !== N || busy}>{t('appEntry.code.enter')}</button>
        <button type="button" className="ae-link" onClick={paste}>{t('appEntry.code.paste')}</button>
        <button type="button" className="ae-link" onClick={resend} disabled={again}>
          {again ? t('appEntry.code.sent') : t('appEntry.code.again')}
        </button>
        {/* Krok sa po návrate z mailu otvorí sám — bez tohto by preklep v čísle zamkol človeka na hodinu. */}
        <button type="button" className="ae-link ae-link--quiet" onClick={onOther}>{t('appEntry.code.other')}</button>
      </form>
    </div>
  );
}

// ── 5 · POVOLENIA ────────────────────────────────────────────────────────────
type PermKey = 'push' | 'geo' | 'ai';

function PermStep({ onDone }: { onDone: () => void }) {
  const t = useT();
  // 🔴 AINUBIS predvolene VYPNUTÝ — súhlas s prístupom k údajom nesmie byť predklikaný (GDPR).
  const [on, setOn] = useState<Record<PermKey, boolean>>({ push: true, geo: true, ai: false });
  const [openK, setOpenK] = useState<PermKey | null>(null);

  const finish = async (accept: boolean) => {
    const choice = accept ? on : { push: false, geo: false, ai: false };
    markPermAsked();
    // Voľba ide do `user_metadata` — miesto, ktoré už existuje (CLAUDE.md §Identita), nie nové.
    try { await supabase.auth.updateUser({ data: { app_perm: { ...choice, at: new Date().toISOString() } } }); } catch { /* lokálne stačí */ }
    // Poloha: systémové okno sa pýta až teraz, po vysvetlení (plán appky: vždy PRED systémovým oknom).
    if (choice.geo && 'geolocation' in navigator) {
      try { navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 8000 }); } catch { /* */ }
    }
    onDone();
  };

  const row = (k: PermKey, icon: JSX.Element, title: JSX.Element | string, text: string, ai = false) => (
    <div
      className={`ae-perm${ai ? ' ae-perm--ai' : ''}${on[k] ? ' is-on' : ''}${openK === k ? ' is-open' : ''}`}
      onClick={() => setOpenK((x) => (x === k ? null : k))}
    >
      {icon}
      <span className="ae-perm-title">{title}</span>
      <button
        type="button" role="switch" aria-checked={on[k]} className="ae-sw"
        onClick={(e) => { e.stopPropagation(); setOn((o) => ({ ...o, [k]: !o[k] })); }}
      ><i /></button>
      <small>{text}</small>
    </div>
  );

  return (
    <div className="ae-screen">
      <div className="ae-body">
        <p className="ae-eyebrow">{t('appEntry.perm.eyebrow')}</p>
        <h1 className="ae-title ae-title--perm">{t('appEntry.perm.title')}</h1>
        {row('push',
          <span className="ae-ib"><HandTail size={22} /><em className="ae-dot ae-dot--b">3</em><em className="ae-dot ae-dot--r">2</em></span>,
          t('appEntry.perm.push'), t('appEntry.perm.pushText'))}
        {row('geo',
          <span className="ae-ib"><img src="/icons/pack/world-grid.svg" alt="" /></span>,
          t('appEntry.perm.geo'), t('appEntry.perm.geoText'))}
        {row('ai',
          <span className="ae-ib ae-ib--ai"><img src={ainubisFace} alt="" /></span>,
          <span className="ae-ai-name"><span>AI</span>NUBIS</span>, t('appEntry.perm.aiText'), true)}
        <button type="button" className="ae-cta ae-cta--perm" onClick={() => void finish(true)}>{t('appEntry.continue')}</button>
        <button type="button" className="ae-link" onClick={() => void finish(false)}>{t('appEntry.perm.later')}</button>
      </div>
    </div>
  );
}

// ── RIADENIE ─────────────────────────────────────────────────────────────────
export default function AppEntry() {
  const [params] = useSearchParams();
  const [sent, setSent] = useState<Sent | null>(readPending);
  const [step, setStep] = useState<Step>(() => (readPending() ? 'code' : 'gate'));

  const nextParam = params.get('next') ?? params.get('return');
  const target = nextParam && nextParam.startsWith('/pack') ? nextParam : '/pack';


  // Po prihlásení TVRDÝ presun (ako Login.tsx pri zakladateľovi): prechod vnútri SPA hneď po
  // `setSession` sa s `/pack` hádal — `/pack` ↔ `/login` dookola (zmerané 20. 10. na DEV),
  // čerstvé načítanie s uloženou session prejde čisto. V appke je balík lokálny, reload je okamžitý.
  const goHome = useCallback(() => window.location.replace(target), [target]);

  // So session sa brána nekreslí — rovno DOMOV (alebo povolenia, ak sa ešte nepýtali).
  useEffect(() => {
    let off = false;
    void supabase.auth.getSession().then(({ data }) => {
      if (off || !data.session) return;
      if (permAsked()) goHome();
      else setStep('perm');
    });
    return () => { off = true; };
  }, [goHome]);
  const goTouch = useCallback(() => setStep('touch'), []);
  const goNumber = useCallback(() => setStep('number'), []);
  const signedIn = useCallback(() => {
    savePending(null);
    if (permAsked()) goHome();
    else setStep('perm');
  }, [goHome]);

  return (
    <div className="ae-root">
      <style>{NAV_MEDALLION_CSS + PILL_CSS + PF_FIELD_CSS + APP_ENTRY_CSS}</style>
      {/* Pod bránou už čaká papyrus — krídla odchádzajú do neho, nie do čierna. */}
      {step === 'gate' && <Gate onDone={goTouch} />}
      {step === 'touch' && <Touch onDone={goNumber} />}
      {step === 'number' && <NumberStep onSent={(s) => { savePending(s); setSent(s); setStep('code'); }} />}
      {step === 'code' && sent && <CodeStep sent={sent} onIn={signedIn} onOther={() => { savePending(null); setSent(null); setStep('number'); }} />}
      {step === 'perm' && <PermStep onDone={goHome} />}
    </div>
  );
}

const APP_ENTRY_CSS = `
.ae-root {
  position: fixed; inset: 0; overflow: hidden;
  background: ${LAB.pageBackdrop}; background-color: ${LAB.pageBg};
  color: ${LAB.ink}; font-family: ${FONT_UI};
}

/* ── 1 · BRÁNA ─────────────────────────────────────────────────────────── */
.ae-gate { position: absolute; inset: 0; cursor: pointer; }
.ae-leaf { position: absolute; inset: 0; transition: transform ${T_LEAVES / 1000}s cubic-bezier(.7,0,.2,1) ${T_MEDAL / 1000}s; }
.ae-leaf > i { position: absolute; inset: 0; background-repeat: no-repeat; }
.ae-medal { position: absolute; inset: 0; transition: transform ${T_MEDAL / 1000}s cubic-bezier(.5,0,.3,1); }
.ae-medal-at { position: absolute; width: 0; height: 0; }
.ae-gate.is-open .ae-medal { transform: rotate(-90deg); }
.ae-gate.is-open .ae-leaf--l { transform: translateX(-102%); }
.ae-gate.is-open .ae-leaf--r { transform: translateX(102%); }
/* Logo 2026 v LAPISE (Matej 20. 10.: „asi by som ho dal v lapise"), maska SVG = kresba 1:1. */
.ae-medal-logo {
  display: block; width: 78%; aspect-ratio: 1; transform: translateY(-2px);
  background: ${LAPIS.deep};
  -webkit-mask-position: center; mask-position: center;
  -webkit-mask-size: contain; mask-size: contain;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
}
.ae-enter {
  position: absolute; left: 50%; transform: translateX(-50%); z-index: 5;
  bottom: calc(env(safe-area-inset-bottom, 0px) + ${PACK_SPACE.xxxl}px);
  padding: ${PACK_SPACE.sm}px ${PACK_SPACE.xl}px;
  font-family: ${FONT_TITLE}; font-weight: 700; font-size: ${PACK_TEXT.body}px; letter-spacing: ${PACK_HEAD.card.letterSpacing};
  transition: opacity .3s;
}
.ae-gate.is-open .ae-enter { opacity: 0; pointer-events: none; }

/* ── 2 · DOTYK ─────────────────────────────────────────────────────────── */
.ae-touch { position: absolute; inset: 0; cursor: pointer; }
.ae-touch-img { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat;
  animation: aeMeet ${T_TOUCH / 1000}s cubic-bezier(.4,0,.2,1) forwards; }
.ae-touch-paw { transform: translate(18%, -22%); }
.ae-touch-hand { transform: translate(-14%, 22%); }
.ae-touch-glow {
  position: absolute; left: 54%; top: 45.6%; width: ${PACK_SPACE.xl}px; height: ${PACK_SPACE.xl}px;
  margin: -${PACK_SPACE.md}px; border-radius: ${PACK_R.pill}px; background: ${PACK_THEME.card};
  box-shadow: 0 0 40px 20px rgba(201,154,63,.7); opacity: 0; transform: scale(.2);
  animation: aeSpark ${T_TOUCH / 1000}s forwards;
}
@keyframes aeMeet { to { transform: none; } }
@keyframes aeSpark { 0%,70% { opacity: 0; transform: scale(.2); } 85% { opacity: 1; transform: scale(1); } 100% { opacity: .85; transform: scale(1.6); } }

/* ── OBRAZOVKY (ČÍSLO · KÓD · POVOLENIA) — papyrus, bez D-BLOKU, loga a šípky späť ── */
.ae-screen { position: absolute; inset: 0; overflow-y: auto; display: flex; flex-direction: column;
  padding: calc(env(safe-area-inset-top, 0px) + ${PAGE_AIR.min}px) ${PAGE_AIR.side}px calc(env(safe-area-inset-bottom, 0px) + ${PAGE_AIR.min}px); }
/* Centrovanie margin:auto na dieťati, nie justify-center (pasca PAGE_AIR: horná časť by sa nedala odrolovať). */
.ae-body { margin: auto; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.ae-flag { display: flex; justify-content: center; padding-top: ${PACK_SPACE.xxl}px; }
.ae-flag .lang-trigger {
  display: inline-flex; align-items: center; gap: ${PACK_SPACE.sm}px;
  padding: ${PACK_SPACE.xs}px ${PACK_SPACE.md}px; border-radius: ${PACK_R.pill}px;
  background: linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%); border: 1.5px solid rgba(179,130,45,0.42);
  color: ${LAB.inkSoft}; cursor: pointer;
}
.ae-eyebrow { margin: 0 0 ${PACK_SPACE.sm}px; font-family: ${PACK_HEAD.label.fontFamily}; font-weight: ${PACK_HEAD.label.fontWeight};
  font-size: ${PACK_HEAD.label.fontSize}px; letter-spacing: ${PACK_HEAD.label.letterSpacing}; text-transform: uppercase; color: ${LAB.goldInk}; }
.ae-title { margin: 0 0 ${PACK_SPACE.sm}px; font-family: ${PACK_HEAD.card.fontFamily}; font-weight: 700; font-size: ${PACK_TEXT.h1}px;
  letter-spacing: ${PACK_HEAD.card.letterSpacing}; line-height: 1.2; text-transform: uppercase; color: ${LAB.ink}; }
.ae-title--sheet { font-size: ${PACK_TEXT.h2}px; }
.ae-title--perm { margin-bottom: ${PACK_SPACE.xl}px; }
.ae-sub { margin: 0 0 ${PACK_SPACE.xl}px; font-size: ${PACK_TEXT.body}px; line-height: 1.5; color: ${LAB.inkSoft}; text-wrap: pretty; }
.ae-err { margin: -${PACK_SPACE.sm}px 0 ${PACK_SPACE.md}px; font-size: ${PACK_TEXT.label}px; line-height: 1.4; color: ${PACK_THEME.ink}; }

.ae-num { width: 100%; height: 56px; border-radius: ${PACK_R.tile}px; margin-bottom: ${PACK_SPACE.lg}px;
  display: flex; align-items: center; justify-content: center; gap: ${PACK_SPACE.sm}px;
  font-size: ${PACK_TEXT.h1}px; letter-spacing: ${PACK_HEAD.card.letterSpacing}; color: ${LAB.ink}; }
.ae-num:focus-within { border-color: ${LAPIS.edge}; box-shadow: inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px ${LAPIS.halo}; }
.ae-num input { width: 6ch; border: 0; background: none; outline: none; font: inherit; letter-spacing: inherit; color: inherit; padding: 0; }
.ae-mail { width: 100%; height: 56px; border-radius: ${PACK_R.tile}px; margin-bottom: ${PACK_SPACE.lg}px; padding: 0 ${PACK_SPACE.lg}px;
  text-align: center; font-family: ${FONT_UI}; font-size: ${PACK_TEXT.lead}px; color: ${LAB.ink}; }

.ae-cta { width: 100%; height: 48px; border: 0; border-radius: ${PACK_R.field}px; cursor: pointer;
  background: ${LAPIS.grad}; color: ${LAPIS.ink}; box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: ${FONT_TITLE}; font-weight: 700; font-size: ${PACK_TEXT.body}px; letter-spacing: ${PACK_HEAD.card.letterSpacing}; text-transform: uppercase; }
.ae-cta:hover:not(:disabled) { background: ${LAPIS.gradHover}; }
.ae-cta:disabled { opacity: .4; cursor: default; box-shadow: none; }
.ae-cta--perm { margin-top: ${PACK_SPACE.lg}px; }
.ae-link { margin-top: ${PACK_SPACE.lg}px; border: 0; background: none; padding: ${PACK_SPACE.xs}px; cursor: pointer;
  font-family: ${FONT_UI}; font-size: ${PACK_TEXT.label}px; color: ${LAB.inkSoft}; }
.ae-link:disabled { cursor: default; }
.ae-link--quiet { margin-top: ${PACK_SPACE.xs}px; color: ${LAB.inkMuted}; }

/* šuplík zdola */
.ae-veil { position: absolute; inset: 0; z-index: 10; background: ${PACK_VEIL.modal}; display: flex; align-items: flex-end; }
.ae-sheet {
  width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;
  background: ${PACK_BOX.panel.background}; border-top: ${PACK_BOX.panel.border}; box-shadow: ${PACK_SHADOW.panel};
  border-radius: ${PACK_R.card}px ${PACK_R.card}px 0 0;
  padding: ${PACK_SPACE.md}px ${PACK_SPACE.xl}px calc(env(safe-area-inset-bottom, 0px) + ${PACK_SPACE.xxl}px);
  animation: aeUp .28s cubic-bezier(.2,.8,.2,1);
}
.ae-sheet > * { max-width: 400px; }
.ae-grip { width: 40px; height: 4px; border-radius: ${PACK_R.pill}px; background: ${PACK_THEME.border}; margin-bottom: ${PACK_SPACE.lg}px; }
@keyframes aeUp { from { transform: translateY(100%); } to { transform: none; } }

/* ── avatary psov — KRÚŽOK patrí fotke psa ─────────────────────────────── */
.ae-dogs { display: flex; flex-wrap: wrap; justify-content: center; gap: ${PACK_SPACE.md}px ${PACK_SPACE.sm}px;
  margin: 0 auto ${PACK_SPACE.xl}px; max-width: calc(4 * var(--dw) + 3 * ${PACK_SPACE.sm}px + 1px); }
.ae-dog { display: flex; flex-direction: column; align-items: center; gap: ${PACK_SPACE.sm}px; width: var(--dw); }
.ae-av { position: relative; display: block; width: var(--dw); height: var(--dw); border-radius: ${PACK_R.pill}px;
  background: ${PACK_THEME.cardGrad} center / cover; border: 2px solid ${PACK_THEME.cardEdge}; box-shadow: ${PACK_SHADOW.card}; }
.ae-av.is-me { border-color: ${LAPIS.edge}; box-shadow: 0 0 0 3px ${LAPIS.halo}; }
.ae-av b { position: absolute; left: 50%; bottom: -${PACK_SPACE.sm}px; transform: translateX(-50%);
  background: ${LAPIS.grad}; color: ${LAPIS.ink}; border-radius: ${PACK_R.pill}px; padding: 1px ${PACK_SPACE.sm}px;
  font: 600 ${PACK_TEXT.micro}px/1.4 ${FONT_UI}; white-space: nowrap; }
.ae-dog-name { margin-top: ${PACK_SPACE.xs}px; max-width: calc(var(--dw) + ${PACK_SPACE.lg}px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font: 700 ${PACK_TEXT.micro}px/1.2 'Cinzel Decorative', ${FONT_TITLE}; letter-spacing: .1em; color: ${LAB.ink}; }

/* ── políčka kódu: N okienok nad jedným poľom ─────────────────────────── */
.ae-code { position: relative; display: flex; gap: ${PACK_SPACE.xs}px;
  justify-content: center; width: 100%; margin-bottom: ${PACK_SPACE.lg}px; cursor: text; }
.ae-code i { flex: 0 1 36px; min-width: 0; height: 48px; border-radius: ${PACK_R.field}px; display: grid; place-items: center; font-style: normal;
  font-size: ${PACK_TEXT.h2}px; color: ${LAB.ink}; }
.ae-code i.is-half { margin-right: ${PACK_SPACE.sm}px; }
.ae-code i.is-cur { border-color: ${LAPIS.edge}; box-shadow: 0 0 0 3px ${LAPIS.halo}; }
.ae-code-input { position: absolute; inset: 0; opacity: .01; width: 100%; height: 100%; border: 0; font-size: ${PACK_TEXT.lead}px; color: transparent; caret-color: transparent; }

/* ── povolenia: ikonka · nadpis · prepínač (recept .bd-sw zo SNIFFERa) ─── */
.ae-perm { width: 100%; display: grid; grid-template-columns: 36px minmax(0,1fr) auto; align-items: center; column-gap: ${PACK_SPACE.sm}px;
  text-align: left; margin-bottom: ${PACK_SPACE.sm}px; padding: ${PACK_SPACE.md}px ${PACK_SPACE.sm}px; cursor: pointer;
  background: ${PACK_BOX.subblock.background}; border: ${PACK_BOX.subblock.border}; border-radius: ${PACK_BOX.subblock.borderRadius}px;
  box-shadow: ${PACK_BOX.subblock.boxShadow}; }
.ae-perm small { grid-column: 1 / -1; display: none; margin-top: ${PACK_SPACE.sm}px; font: 400 ${PACK_TEXT.label}px/1.45 ${FONT_UI}; color: ${LAB.inkSoft}; }
.ae-perm.is-open small { display: block; }
.ae-perm-title { min-width: 0; font: 700 ${PACK_TEXT.label}px/1.2 ${FONT_TITLE}; letter-spacing: .1em; text-transform: uppercase; }
.ae-ib { position: relative; width: 36px; height: 36px; border-radius: ${PACK_R.pill}px; display: grid; place-items: center;
  background: ${PACK_THEME.card}; border: 1px solid ${PACK_THEME.hairline}; color: ${LAB.ink}; }
.ae-ib img { width: 22px; height: 22px; display: block; }
.ae-dot { position: absolute; right: -${PACK_SPACE.xs}px; min-width: 16px; height: 16px; padding: 0 ${PACK_SPACE.xs}px; border-radius: ${PACK_R.pill}px;
  font: 600 ${PACK_TEXT.micro}px/13px ${FONT_UI}; font-style: normal; text-align: center; color: ${PACK_THEME.card}; border: 1.5px solid ${PACK_THEME.card}; }
/* Hore CYAN (systémové oznámenia = AINUBIS, Matej 20. 10.: „modra bublinka cyan“), dole sociálna červená. */
.ae-dot--b { top: -${PACK_SPACE.xs}px; background: ${AINUBIS.cyan}; color: ${AINUBIS.bgDeep}; }
.ae-dot--r { bottom: -${PACK_SPACE.xs}px; background: ${SNIFFER_HEART}; }
.ae-sw { position: relative; flex: 0 0 auto; width: ${PACK_SPACE.xxxl + PACK_SPACE.xs}px; height: ${PACK_SPACE.xl + PACK_SPACE.sm}px; border-radius: ${PACK_R.pill}px;
  border: 1px solid ${PACK_THEME.border}; background: ${PACK_THEME.hairline}; cursor: pointer; padding: 0; transition: background .2s ease; }
.ae-sw i { position: absolute; top: ${PACK_SPACE.xs}px; left: ${PACK_SPACE.xs}px; width: ${PACK_SPACE.xl}px; height: ${PACK_SPACE.xl}px; border-radius: ${PACK_R.pill}px;
  background: ${PACK_THEME.card}; box-shadow: ${PACK_SHADOW.card}; transition: left .2s ease; }
.ae-perm.is-on .ae-sw { background: ${LAPIS.grad}; border-color: ${LAPIS.deep}; }
.ae-perm.is-on .ae-sw i { left: calc(100% - ${PACK_SPACE.xl + PACK_SPACE.xs}px); }

/* AINUBIS v jeho šate — gulička oranžovo-zlatá, zapnutý svieti cyan */
.ae-perm--ai { background: ${AINUBIS.surface}; border: 1px solid ${AINUBIS.edgeStrong}; box-shadow: ${AINUBIS.panelShadow}; color: ${AINUBIS.ink}; }
.ae-perm--ai small { color: ${AINUBIS.inkDim}; }
.ae-ib--ai { background: ${AINUBIS.faceBg}; border-color: ${AINUBIS.edgeStrong}; overflow: hidden; }
.ae-ib--ai img { width: 92%; height: 92%; object-fit: contain; }
.ae-ai-name > span { color: ${AINUBIS.aiInk}; text-shadow: ${AINUBIS.aiShadow}; }
.ae-perm--ai .ae-sw { background: rgba(${AINUBIS.cyanRGB},.12); border-color: ${AINUBIS.edge}; }
.ae-perm--ai .ae-sw i { background: ${AINUBIS.ctaGrad}; box-shadow: 0 0 8px rgba(${AINUBIS.cyanRGB},.45); }
.ae-perm--ai.is-on .ae-sw { background: rgba(${AINUBIS.cyanRGB},.35); border-color: ${AINUBIS.cyan}; box-shadow: 0 0 12px rgba(${AINUBIS.cyanRGB},.45); }

@media (prefers-reduced-motion: reduce) {
  .ae-leaf, .ae-medal { transition-duration: .01s; transition-delay: 0s; }
  .ae-touch-img, .ae-touch-glow, .ae-sheet { animation-duration: .01s; }
}
`;
