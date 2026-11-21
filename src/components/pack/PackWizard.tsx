import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { openAinubis } from '@/lib/ainubisBus';
import { getConsent } from '@/lib/consent';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import ainubisHead from '@/assets/ainubis-head.webp';
import { APP_NEW } from '@/lib/packFlags';
import { AI_LOGO } from '@/components/pack/ainubis/3d/zaklad';
export const ainubisFace = APP_NEW ? AI_LOGO : ainubisHead;
import { WIZ_ROUND } from './wizAnchors';
import { screenFor, stepsFor, WIZ_SCREENS, type WizStep } from './wizSteps';
import { AINUBIS } from './ainubisSkin';
import { MAP_COACH_CSS } from './MapCoach';
import { FONT_TITLE, FONT_UI, PACK_R, PACK_SPACE, PACK_TEXT } from './packTheme';

// PREHLIADKA — AINUBIS ukazuje, čo je kde. Scenár je SKRIPTOVANÝ, nie AI (Matej 23. 8. 2026):
// text je vždy ten istý, žije v prekladoch, AINUBIS je tu hlas a tvár. Mozog zapne až v chate,
// ktorý posledný krok prvého prihlásenia odovzdá.
//
// 🔁 PIPELINE (Matej 6. 10. 2026): ČO sa kde ukáže, nie je v tomto súbore — je to register
//    `wizSteps.ts`. Tento súbor len vykresľuje: zistí obrazovku z cesty, vezme jej kroky,
//    ktoré človek ešte nevidel, a ukáže prvý. Nová funkcia = riadok v registri, nie zásah sem.
//
// 🌑 CELÁ PLOCHA TMAVNE, VRÁTANE SPODNÉHO NAVU (Matej 6. 10.: „vidieteľný bude len ainubisov
//    text a konkrétny výrez toho o čom hovorí"). Preto vrstva visí v `document.body` nad
//    všetkým (z 1500 — nad lištou z-40, nad mapovými ovládačmi z-900), a nie ako `box-shadow`
//    na samotnom prvku: ten by ostal uväznený v stacking kontexte stránky a lišta by svietila.
//    ⚠️ Mapový sprievodca `MapCoach` má plochu BLEDÚ (Matej 28. 8.) — to je iný povrch
//    a rozpor je v hárku ako otázka, nie tichá zmena.
//
// Spúšťač žije v spodnej lište (`PackBottomNav`) — tá je na obrazovkách koša 1 a 2, nie v koši 3
// (úloha). Wizard tak úlohu nikdy nepreruší a nikto to nemusí strážiť zvlášť.

// ─── Čo človek videl ─────────────────────────────────────────────────────────
// Množina ID krokov. Lokálne (hneď) + v účte `user_metadata.wiz_seen` (mobil aj PC vedia to
// isté). Žiadne nové miesto na údaje o človeku — `user_metadata` už je (CLAUDE.md, Identita).
const SEEN_KEY = 'dogypt_wz_seen';
/** Starý stav do 6. 10. 2026: jedno slovo, `done` = celá prvá prehliadka prejdená. */
const LEGACY_KEY = 'dogypt_wz';
const LEGACY_IDS = ['home.welcome', 'home.hero', 'home.dogs', 'home.navOut'];

export function readSeenLocal(): Set<string> {
  try {
    const s = new Set<string>(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') as string[]);
    if (localStorage.getItem(LEGACY_KEY) === 'done') LEGACY_IDS.forEach((id) => s.add(id));
    return s;
  } catch {
    // Zablokované úložisko = radšej nič neukazuj, než ukazovať pri každom načítaní dokola.
    return new Set(WIZ_SCREENS.flatMap((x) => x.steps.map((st) => st.id)));
  }
}
export function writeSeenLocal(s: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); } catch { /* súkromné okno */ }
}
export async function pushSeenToAccount(s: Set<string>) {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.auth.updateUser({ data: { wiz_seen: [...s] } });
  } catch { /* lokálny stav stačí */ }
}

/** `wiz_off` už pri PRVOM vykreslení — z uloženej session, aby privítanie robotovi ani neblyslo. */
export function wizOffLocal(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (!/^sb-.*-auth-token$/.test(k)) continue;
      const j = JSON.parse(localStorage.getItem(k) || 'null');
      if (j?.user?.user_metadata?.wiz_off === true) return true;
    }
  } catch { /* */ }
  return false;
}

/** Znovuspustenie prehliadky obrazovky (nastavenia, „ukáž mi to znova"). */
export function startWizard(screenKey = 'home') {
  const s = readSeenLocal();
  const scr = WIZ_SCREENS.find((x) => x.key === screenKey);
  scr?.steps.forEach((st) => s.delete(st.id));
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* */ }
  writeSeenLocal(s);
  void pushSeenToAccount(s);
  window.dispatchEvent(new CustomEvent('dogypt:wizard'));
}

// ─── Denník prehliadky (Matej 16. 10. 2026: „kto si wizarda pozrel a kto preskočil") ──────
// Každý okamih = riadok v `wizard_events` (migrácia 20261029). Stav „videné" ostáva v
// `wiz_seen`; denník je len história — bez neho sa „ďalej" a „preskočil" nedajú rozlíšiť.
// Zlyhanie zápisu prehliadku nikdy nezastaví.
// Komnaty (18. 11. 2026) pridali `tap` (splnený ťukací krok), `done` (komnata dokončená, step_id = id odznaku)
// a `replay` (↺ znova / Prejsť znova); `screen` je `kom:<komnata>`.
export type WizAction = 'shown' | 'next' | 'skip' | 'missing' | 'chat' | 'later' | 'tap' | 'done' | 'replay';
const loggedShown = new Set<string>();
/** Nový beh komnaty (↺ znova) ukáže krok ešte raz — „shown“ sa má zapísať znova. */
export function forgetShown(screen: string) { [...loggedShown].filter((k) => k.startsWith(`${screen}|`)).forEach((k) => loggedShown.delete(k)); }
export function logWiz(screen: string, stepId: string, action: WizAction) {
  if (action === 'shown') { const key = `${screen}|${stepId}`; if (loggedShown.has(key)) return; loggedShown.add(key); }
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const viewport = `${window.innerWidth}x${window.innerHeight}`;
      // Tabuľka nie je v generovaných typoch — zápis je jednosmerný, typ netreba.
      await (supabase as unknown as { from: (t: string) => { insert: (r: object) => Promise<unknown> } })
        .from('wizard_events').insert({ screen, step_id: stepId, action, viewport });
    } catch { /* denník je bonus, nie podmienka */ }
  })();
}

// ─── Odmena za dokončenie prvého prihlásenia ─────────────────────────────────
// `grant-devotion { kind: 'first_steps' }` (+10 ☥) je na serveri idempotentné.
async function grantFirstSteps() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch(`${EDGE_BASE}/grant-devotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ kind: 'first_steps' }),
    });
    if (!res.ok) return;
    const j = await res.json();
    if (typeof j.total === 'number') window.dispatchEvent(new CustomEvent('dogypt:devotion', { detail: { total: j.total } }));
  } catch { /* odmena je bonus, nie podmienka */ }
}

// ─── Vzhľad ──────────────────────────────────────────────────────────────────
// Bublina = recept `MapCoach` (`.mcoach-bubble` …), ktorý Matej schválil 28. 8. („peknú menšiu
// bublinku… s pekným rozložením") — jeden recept pre každé miesto, kde AINUBIS na niečo ukazuje.
// Vlastná je tu len TMA s dierou a privítanie.
const DIM = 'rgba(1,5,10,0.93)';
/** Vzduch okolo výrezu, aby ho prstenec neorezal. */
const PAD = PACK_SPACE.sm;
export const WIZ_CSS = `
.wzc{position:fixed;inset:0;z-index:1500;}
.wzc-hole{position:fixed;pointer-events:none;border-radius:${PACK_R.card}px;
  box-shadow:0 0 0 9999px ${DIM},0 0 0 2px ${AINUBIS.edgeStrong},0 0 30px rgba(${AINUBIS.cyanRGB},0.45);
  animation:wzc-ring 2.4s ease-in-out infinite;transition:top .25s ease,left .25s ease,width .25s ease,height .25s ease;}
.wzc-hole.is-round{border-radius:${PACK_R.pill}px;}
@keyframes wzc-ring{
  0%,100%{box-shadow:0 0 0 9999px ${DIM},0 0 0 2px ${AINUBIS.edgeStrong},0 0 26px rgba(${AINUBIS.cyanRGB},0.40);}
  50%{box-shadow:0 0 0 9999px ${DIM},0 0 0 3px ${AINUBIS.cyan},0 0 44px rgba(${AINUBIS.cyanRGB},0.75);}
}
.wzc-dim{position:fixed;inset:0;background:${DIM};}
.wzc .mcoach-bubble{animation:wzc-in .3s ease;}
.wzc .mcoach-txt b span{color:${AINUBIS.cyan};}
.wzc-dots{grid-column:1 / -1;display:flex;gap:${PACK_SPACE.xs}px;justify-content:center;}
.wzc-dots i{display:block;width:6px;height:4px;border-radius:${PACK_R.pill}px;background:rgba(${AINUBIS.cyanRGB},0.20);transition:width .3s;}
.wzc-dots i.on{width:16px;background:${AINUBIS.cyan};}
.wzc-welcome{position:fixed;inset:0;z-index:1500;display:flex;align-items:center;justify-content:center;overflow-y:auto;
  padding:${PACK_SPACE.xxxl}px ${PACK_SPACE.xxl}px;text-align:center;
  background:radial-gradient(120% 80% at 50% 34%,${AINUBIS.bg} 0%,${AINUBIS.bgDeep} 60%,#01050A 100%);animation:wzc-in .4s ease;}
.wzc-welcome > div{margin:auto;display:flex;flex-direction:column;align-items:center;max-width:320px;}
.wzc-welcome img{width:128px;height:128px;object-fit:contain;filter:drop-shadow(0 0 30px rgba(${AINUBIS.cyanRGB},0.55));}
.wzc-welcome .wm{margin-top:${PACK_SPACE.lg}px;font:700 ${PACK_TEXT.h2}px ${FONT_TITLE};letter-spacing:.26em;color:${AINUBIS.inkFaint};}
.wzc-welcome .wm span{color:${AINUBIS.cyan};text-shadow:0 0 18px rgba(${AINUBIS.cyanRGB},0.75);}
.wzc-welcome h2{margin:${PACK_SPACE.xl}px 0 ${PACK_SPACE.md}px;font:700 ${PACK_TEXT.h1}px ${FONT_TITLE};color:${AINUBIS.ink};}
.wzc-welcome p{margin:0 0 ${PACK_SPACE.xxl}px;font:400 ${PACK_TEXT.body}px/1.6 ${FONT_UI};color:${AINUBIS.inkDim};}
.wzc-welcome .mcoach-ok{width:100%;}
.wzc-welcome .mcoach-mute{margin-top:${PACK_SPACE.lg}px;}
@keyframes wzc-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
/* ŤUKACÍ KROK (nákres wizard-v2, 18. 11. 2026): šípka skáče k cieľu, prst príde, stlačí a z miesta ide vlna — dokola, kým človek neťukne. */
.wzc-tuk .mcoach-arrow{display:none;}
.wzc-hint{font:600 ${PACK_TEXT.label}px ${FONT_UI};color:${AINUBIS.cyan};}
.wzc-arrow{position:fixed;width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;pointer-events:none;filter:drop-shadow(0 0 6px rgba(${AINUBIS.cyanRGB},0.8));}
.wzc-arrow.dn{border-top:20px solid ${AINUBIS.cyan};animation:wzc-hop-d 1s ease-in-out infinite;}
.wzc-arrow.up{border-bottom:20px solid ${AINUBIS.cyan};animation:wzc-hop-u 1s ease-in-out infinite;}
@keyframes wzc-hop-d{0%,100%{transform:translateY(0);}50%{transform:translateY(8px);}}
@keyframes wzc-hop-u{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
.wzc-tap{position:fixed;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:${PACK_R.pill}px;border:3px solid ${AINUBIS.cyan};pointer-events:none;opacity:0;animation:wzc-vlna 2s ease-out infinite;}
.wzc-tap.t2{animation-delay:.25s;}
@keyframes wzc-vlna{0%,45%{transform:scale(.4);opacity:0;}50%{opacity:1;}100%{transform:scale(3);opacity:0;}}
.wzc-prst{position:fixed;width:44px;height:52px;margin:0 0 0 -18px;pointer-events:none;animation:wzc-prst 2s cubic-bezier(.3,.7,.3,1) infinite;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.6));z-index:2;}
.wzc-prst.zhora{animation-name:wzc-prst-h;}
@keyframes wzc-prst{0%{transform:translate(40px,90px);opacity:0;}15%{opacity:1;}40%{transform:translate(0,0) scale(1);}48%{transform:translate(0,2px) scale(.86);}58%{transform:translate(0,0) scale(1);}85%{opacity:1;}100%{transform:translate(0,0);opacity:0;}}
@keyframes wzc-prst-h{0%{transform:translate(40px,-90px);opacity:0;}15%{opacity:1;}40%{transform:translate(0,0) scale(1);}48%{transform:translate(0,2px) scale(.86);}58%{transform:translate(0,0) scale(1);}85%{opacity:1;}100%{transform:translate(0,0);opacity:0;}}
@media (prefers-reduced-motion:reduce){.wzc-arrow,.wzc-tap,.wzc-prst{animation:none;}.wzc-tap{opacity:.8;}}
`;

/** Posledná poloha výrezu. Medzi krokmi sa nový prvok ešte hľadá (~120 ms) — tma musí OSTAŤ
 *  a výrez sa z tejto polohy presunie na nový prvok. Bez toho stránka pri každom ĎALEJ blikla
 *  naplno (video prvého prihlásenia 16. 10. 2026: jas 20 → 111 na 2–3 snímky). */
let lastHole: { top: number; left: number; w: number; h: number } | null = null;

const hasSize = (n: Element) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
/** Viditeľný cieľ kotvy. Keď je obal bez rozmeru (kotúč `+` je absolútne polohovaný a obal
 *  ho neobjíme), svieti prvý potomok, ktorý rozmer má — inak by výrez sedel v prázdnom bode. */
function findTarget(id: string): HTMLElement | null {
  /* Prednosť má prvok V OKNE — zhluky na mape (`.trp-cluster`) ležia aj mimo výrezu mapy
     a prvý v DOM-e svietil do rohu obrazovky (snímka map.note, 7. 10. 2026). */
  if (id.startsWith('.')) {
    const all = [...document.querySelectorAll(id)].filter(hasSize) as HTMLElement[];
    const inView = all.find((n) => { const r = n.getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
    return inView ?? all[0] ?? null;
  }
  const el = document.getElementById(id);
  if (!el) return null;
  if (hasSize(el)) return el;
  return ([...el.querySelectorAll('*')].find(hasSize) as HTMLElement | undefined) ?? null;
}

// ─── Spúšťač ─────────────────────────────────────────────────────────────────
export function PackWizard({ dogName, hasDog }: { dogName: string | null; hasDog: boolean }) {
  const t = useT();
  const { pathname, search } = useLocation();
  const screen = useMemo(() => screenFor(pathname), [pathname]);
  const [seen, setSeen] = useState<Set<string>>(readSeenLocal);
  /** `user_metadata.wiz_off` = účet bez prehliadky (roboty a stráže na `hekthorsk` a
   *  `hekthorsk+straz` — inak by im tma zakryla obrazovku a stráž by hlásila poplach). */
  const [off, setOff] = useState(wizOffLocal);
  /** Kroky, ktorých kotva v tejto návšteve obrazovky chýbala — preskočené, nie videné. */
  const [missing, setMissing] = useState<Set<string>>(new Set());

  // Stav z účtu (iné zariadenie) sa prileje k lokálnemu — zjednotenie, nikdy nie prepis.
  useEffect(() => {
    let off = false;
    // DEV `?wiz=1` = náhľad odznova; stav z účtu by ho hneď prebil.
    if (import.meta.env.DEV && /[?&]wiz(preview)?=/.test(window.location.search)) off = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.user_metadata?.wiz_off === true) setOff(true);
      const remote = data.session?.user?.user_metadata?.wiz_seen;
      if (off || !Array.isArray(remote)) return;
      setSeen((cur) => {
        const m = new Set(cur);
        (remote as string[]).forEach((id) => m.add(id));
        writeSeenLocal(m);
        return m;
      });
    });
    const sync = () => setSeen(readSeenLocal());
    window.addEventListener('dogypt:wizard', sync);
    return () => { off = true; window.removeEventListener('dogypt:wizard', sync); };
  }, []);

  // Nová obrazovka = nové pokusy o kotvy (a výrez začína odznova, nie na mieste z inej stránky).
  useEffect(() => { setMissing(new Set()); lastHole = null; }, [pathname]);

  // DEV náhľad: `?wiz=1` pustí kroky TEJTO obrazovky odznova. Vo `vite build` je vetva mŕtva.
  useEffect(() => {
    if (!import.meta.env.DEV || !screen) return;
    if (!new URLSearchParams(search).get('wiz')) return;
    setSeen((cur) => {
      const m = new Set(cur);
      screen.steps.forEach((st) => m.delete(st.id));
      writeSeenLocal(m);
      return m;
    });
  }, [screen, search]);

  // Prehliadka POČKÁ na cookie lištu (z-9999) — inak by človek nevedel, čo stlačiť skôr.
  const [consentDone, setConsentDone] = useState(() => !!getConsent());
  useEffect(() => {
    if (consentDone) return;
    const iv = setInterval(() => { if (getConsent()) { setConsentDone(true); clearInterval(iv); } }, 400);
    return () => clearInterval(iv);
  }, [consentDone]);

  // DEV `?wizpreview=1` = náhľad aj čakajúcich obrazoviek (snímky do tabule textov).
  const preview = import.meta.env.DEV && new URLSearchParams(search).has('wizpreview');
  const all = stepsFor(screen, preview);
  const pending = all.filter((s) => !seen.has(s.id) && !missing.has(s.id));
  const step: WizStep | undefined = pending[0];

  const mark = useCallback((ids: string[]) => {
    setSeen((cur) => {
      const m = new Set(cur);
      ids.forEach((id) => m.add(id));
      writeSeenLocal(m);
      void pushSeenToAccount(m);
      return m;
    });
  }, []);

  const screenKey = screen?.key ?? '?';
  const next = useCallback((action: WizAction = 'next') => {
    if (!step) return;
    logWiz(screenKey, step.id, action);
    mark([step.id]);
    if (step.handoff) void grantFirstSteps();
  }, [step, mark, screenKey]);
  // „Preskočiť" zavrie celú obrazovku — aj kroky, ktoré ešte len prídu.
  const skipAll = useCallback(() => {
    if (step) logWiz(screenKey, step.id, 'skip');
    mark(pending.map((s) => s.id));
  }, [step, pending, mark, screenKey]);

  // Privítanie je na obrazovke hneď; výrez až keď nájde prvok (`onShown` v Spot).
  useEffect(() => {
    if (step && consentDone && !off && step.anchor === 'welcome') logWiz(screenKey, step.id, 'shown');
  }, [step, consentDone, off, screenKey]);

  if (!step || !consentDone || off) return null;

  // `body` ide do dangerouslySetInnerHTML (preklady nesú <b>) ⇒ meno psa z DB sa musí escapovať,
  // inak by prvý preklad s `{dog}` spustil HTML z mena psa (bezpečnostná previerka 21. 11. 2026).
  const escDog = (dogName || t('pack.wizard.myDog')).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  const body = t(hasDog || !step.textNoDog ? step.text : step.textNoDog, { dog: escDog });

  if (step.anchor === 'welcome') {
    lastHole = null;
    return createPortal(
      <div className="wzc-welcome" role="dialog" aria-modal="true">
        <style>{MAP_COACH_CSS}{WIZ_CSS}</style>
        <div>
          <img src={ainubisFace} alt="" aria-hidden="true" />
          <div className="wm"><span>AI</span>NUBIS</div>
          <h2>{t('pack.wizard.welcome.title')}</h2>
          <p>{body}</p>
          <button type="button" className="mcoach-ok" onClick={() => next()}>{t('pack.wizard.welcome.cta')}</button>
          <button type="button" className="mcoach-mute" onClick={skipAll}>{t('pack.wizard.skipForNow')}</button>
        </div>
      </div>,
      document.body,
    );
  }

  const spots = all.filter((s) => s.anchor !== 'welcome');
  return (
    <Spot
      key={step.id}
      step={step}
      body={body}
      dots={spots.length > 1 ? { n: spots.length, at: spots.findIndex((s) => s.id === step.id) } : null}
      onNext={next}
      onSkip={skipAll}
      onShown={() => logWiz(screenKey, step.id, 'shown')}
      onMissing={() => { logWiz(screenKey, step.id, 'missing'); setMissing((m) => new Set(m).add(step.id)); }}
    />
  );
}

// ─── Výrez + bublina ─────────────────────────────────────────────────────────
export function Spot({ step, body, dots, onNext, onSkip, onShown, onMissing, okLabel, tuk }: {
  step: Pick<WizStep, 'id' | 'anchor' | 'handoff'>; body: string; dots: { n: number; at: number } | null;
  onNext: (action?: WizAction) => void; onSkip: () => void; onShown: () => void; onMissing: () => void;
  /** Komnaty (17. 11. 2026): vlastný nápis tlačidla („Hotovo“). */
  okLabel?: string;
  /** ŤUKACÍ KROK: bez „Ďalej“, ťuk na prvok vo výreze prejde do appky a posunie krok (`onNext('tap')`);
   *  mimo výrezu sa ťuk zahodí. Výrez nesie šípku, prst a vlnu. */
  tuk?: boolean;
}) {
  const t = useT();
  const naostro = !!tuk;
  const [box, setBox] = useState<DOMRect | null>(null);
  const missRef = useRef(onMissing);
  useEffect(() => { missRef.current = onMissing; }, [onMissing]);
  const shownRef = useRef(onShown);
  useEffect(() => { shownRef.current = onShown; }, [onShown]);
  const nextRef = useRef(onNext);
  useEffect(() => { nextRef.current = onNext; }, [onNext]);
  const anchor = step.anchor as string;

  // Kotva sa hľadá v kolách (dáta psov dobehnú o chvíľu neskôr); ~1,5 s a nikde → krok sa
  // PRESKOČÍ (nie označí ako videný — keď kotva neskôr pribudne, ukáže sa).
  // Po nájdení: posun do stredu okna a sledovanie polohy — diera sa hýbe s prvkom.
  useEffect(() => {
    let raf = 0; let tries = 0; let el: HTMLElement | null = null; let alive = true;
    // Naostro: ťuk na prvok prejde (odkaz naozaj otvorí), krok sa posunie; ťuk vedľa sa zahodí.
    const tapNaostro = (e: MouseEvent) => {
      const t = e.target as Node;
      if (el && el.contains(t)) { nextRef.current('tap'); return; }
      if ((t as Element).closest?.('.mcoach-bubble')) return;
      e.preventDefault(); e.stopPropagation();
    };
    const follow = () => {
      if (!alive || !el) return;
      // Mapa po dobehnutí dát zhluky PREKRESLÍ — držaný prvok vypadne z DOM-u a jeho rect je 0,0
      // (výrez v rohu obrazovky). Odpojený prvok sa preto hľadá nanovo.
      if (!el.isConnected) { el = findTarget(anchor); if (!el) { raf = requestAnimationFrame(follow); return; } }
      const r = el.getBoundingClientRect();
      setBox((b) => (b && Math.abs(b.top - r.top) < 0.5 && Math.abs(b.left - r.left) < 0.5 && Math.abs(b.width - r.width) < 0.5 && Math.abs(b.height - r.height) < 0.5 ? b : r));
      raf = requestAnimationFrame(follow);
    };
    const iv = setInterval(() => {
      el = findTarget(anchor);
      if (el) {
        clearInterval(iv);
        const r = el.getBoundingClientRect();
        const offscreen = r.top < 0 || r.bottom > window.innerHeight;
        if (offscreen && !WIZ_ROUND.includes(anchor)) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        shownRef.current();
        follow();
        if (naostro) document.addEventListener('click', tapNaostro, true);
      } else if (++tries > 12) { clearInterval(iv); missRef.current(); }
    }, 120);
    return () => { alive = false; clearInterval(iv); cancelAnimationFrame(raf); document.removeEventListener('click', tapNaostro, true); };
  }, [anchor, naostro]);

  if (!box) {
    // Prvok sa ešte hľadá: tma ostáva (výrez stojí na predošlom mieste), bublina zatiaľ nie.
    return createPortal(
      <div className="wzc" role="dialog" aria-modal="true">
        <style>{MAP_COACH_CSS}{WIZ_CSS}</style>
        {lastHole
          ? <div className="wzc-hole" style={{ top: lastHole.top, left: lastHole.left, width: lastHole.w, height: lastHole.h }} />
          : <div className="wzc-dim" />}
      </div>,
      document.body,
    );
  }

  const vw = window.innerWidth; const vh = window.innerHeight;
  // Výrez sa orezáva oknom — vysoký blok (planéta) by inak mal dieru mimo obrazovky.
  const top = Math.max(PACK_SPACE.xs, box.top - PAD);
  const bottom = Math.min(vh - PACK_SPACE.xs, box.bottom + PAD);
  const left = Math.max(PACK_SPACE.xs, box.left - PAD);
  const w = Math.min(vw - PACK_SPACE.xs, box.right + PAD) - left;
  const h = Math.max(0, bottom - top);
  lastHole = { top, left, w, h };
  // Bublina ide na stranu s väčším miestom; keď nie je miesto nikde, sadne na spodok výrezu.
  const below = vh - bottom >= top;
  const bw = Math.min(430, vw - 24);
  const bubbleLeft = Math.min(Math.max(12, left + w / 2 - bw / 2), Math.max(12, vw - bw - 12));
  // Ťukací krok: medzi výrezom a bublinou sa vojde šípka (20 px + skok), preto väčší odstup.
  const gap = tuk ? 44 : 14;
  const pos = below ? { top: Math.min(bottom + gap, vh - 200) } : { bottom: Math.min(vh - top + gap, vh - 200) };
  // Cieľ v dolnej polovici okna: šípka ukazuje zhora nadol a prst prichádza zdola; inak naopak.
  const cx = left + w / 2; const cy = top + h / 2;
  const dole = cy > vh / 2;

  return createPortal(
    <div className={`wzc${tuk ? ' wzc-tuk' : ''}`} role="dialog" aria-modal="true" style={naostro ? { pointerEvents: 'none' } : undefined}>
      <style>{MAP_COACH_CSS}{WIZ_CSS}</style>
      <div className={`wzc-hole${WIZ_ROUND.includes(anchor) ? ' is-round' : ''}`} style={{ top, left, width: w, height: h }} />
      {tuk && (
        <>
          <div className={`wzc-arrow ${dole ? 'dn' : 'up'}`} style={{ left: cx - 14, top: dole ? top - 30 : top + h + 10 }} aria-hidden="true" />
          <div className="wzc-tap" style={{ left: cx, top: cy }} aria-hidden="true" />
          <div className="wzc-tap t2" style={{ left: cx, top: cy }} aria-hidden="true" />
          <svg className={`wzc-prst${dole ? '' : ' zhora'}`} style={{ left: cx, top: cy }} viewBox="0 0 44 52" aria-hidden="true">
            <path d="M14 4a4 4 0 0 1 8 0v18l2-1a4 4 0 0 1 5 2l1-.5a4 4 0 0 1 5 2l1-.3a4 4 0 0 1 5 3.3V40c0 7-5 12-12 12h-5c-4 0-7-2-9-5L5 34a4 4 0 0 1 6-5l3 3z" fill={AINUBIS.ink} stroke={AINUBIS.bgDeep} strokeWidth="2.4" strokeLinejoin="round" />
          </svg>
        </>
      )}
      <div className="mcoach-bubble" style={{ left: bubbleLeft, width: bw, ...pos, ...(naostro ? { pointerEvents: 'auto' } : null) }}>
        <span className={`mcoach-arrow${below ? ' up' : ' down'}`} style={{ left: Math.min(Math.max(left + w / 2, 28), vw - 28) }} aria-hidden="true" />
        {dots && <div className="wzc-dots">{Array.from({ length: dots.n }).map((_, i) => <i key={i} className={i === dots.at ? 'on' : ''} />)}</div>}
        <img className="mcoach-face" src={ainubisFace} alt="" aria-hidden="true" />
        <div className="mcoach-txt">
          <b><span>AI</span>NUBIS</b>
          <p dangerouslySetInnerHTML={{ __html: body }} />
        </div>
        <div className="mcoach-foot">
          {step.handoff ? (
            <>
              <button type="button" className="mcoach-mute" onClick={() => onNext('later')}>{t('pack.wizard.handoff.later')}</button>
              <button type="button" className="mcoach-ok" onClick={() => { onNext('chat'); openAinubis(); }}>{t('pack.wizard.handoff.cta')}</button>
            </>
          ) : (
            <>
              <button type="button" className="mcoach-mute" onClick={onSkip}>{t('pack.wizard.skip')}</button>
              {tuk
                ? <span className="wzc-hint">{t('pack.wizard.k.tukHint')}</span>
                : <button type="button" className="mcoach-ok" onClick={() => onNext()}>{okLabel ?? t('pack.wizard.next')}</button>}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
