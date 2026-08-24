import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { openAinubis } from '@/lib/ainubisBus';
import { getConsent } from '@/lib/consent';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE, SUPABASE_ANON_KEY } from '@/lib/env';
import ainubisFace from '@/assets/ainubis-badge.png';
import { WIZ, WIZ_ROUND, anchorExists, type WizAnchor } from './wizAnchors';

// PREHLIADKA — AInubis prevedie člena po `/pack`. Scenár je SKRIPTOVANÝ, nie AI
// (Matej 23. 8. 2026): text je vždy ten istý, žije v prekladoch, AInubis je tu hlas
// a tvár. Mozog zapne až v chate (`AinubisWidget`), ktorý prehliadka na konci
// odovzdá. Plán: `plany/wizard-ainubis.md`.
//
// Stav prehliadky je JEDNO ČÍSLOVANÉ SLOVO v localStorage — žiadny orchestrátor.
// Stránky si ho čítajú pri mounte a rozhodnú sa samy.

// Portal — renders fixed wizard UI directly under <body> so it escapes the
// PackLayout `relative z-10` stacking context. Without this the floating pill
// nav (`fixed z-40`, a root-level sibling of the z-10 content wrapper) paints
// ON TOP of the coach card / welcome overlay — their z-80/z-90 only ranks them
// inside the trapped z-10 context, not globally — hiding the lower text+buttons.
function WizPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

// ─── Stav ─────────────────────────────────────────────────────────────────────
const KEY = 'dogypt_wz';

/** Scény prehliadky v poradí scenára. `handoff` = odovzdanie chatu (vlna 2). */
export type WizScene = 'welcome' | 'home' | 'toDogs' | 'toMap' | 'handoff' | 'done';

const ORDER: WizScene[] = ['welcome', 'home', 'toDogs', 'toMap', 'handoff', 'done'];

export function getWizScene(): WizScene {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return 'welcome';
    // Starý číslovaný stav (prehliadka do 22. 6. 2026) — kto ho v prehliadači má,
    // dostane nový scenár od začiatku. Prehliadka bola celý ten čas DEV-only,
    // takže na LIVE toto nikoho nezasiahne.
    return (ORDER as string[]).includes(v) ? (v as WizScene) : 'welcome';
  } catch {
    // Zablokované úložisko = prehliadku radšej neukazuj, než ju ukazovať pri
    // každom načítaní stránky dokola.
    return 'done';
  }
}

export function saveWizScene(s: WizScene) {
  try {
    localStorage.setItem(KEY, s);
  } catch { /* ignore */ }
}

/** Znovuspustenie prehliadky (nastavenia, „ukáž mi to znova"). */
export function startWizard() {
  saveWizScene('welcome');
  window.dispatchEvent(new CustomEvent('dogypt:wizard'));
}

// ─── Odmena za dokončenie ─────────────────────────────────────────────────────
// `grant-devotion { kind: 'first_steps' }` (+10 ☥) je na serveri idempotentné
// (`first_steps:${user.id}`), takže opakovaná prehliadka body nerozdáva druhýkrát.
// Odmena ležela nepoužitá od 5. 8., keď z homepage zmizol zoznam „First Steps".
async function grantFirstSteps() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch(`${EDGE_BASE}/grant-devotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ kind: 'first_steps' }),
    });
    if (!res.ok) return;
    const j = await res.json();
    if (typeof j.total === 'number') {
      window.dispatchEvent(new CustomEvent('dogypt:devotion', { detail: { total: j.total } }));
    }
  } catch { /* odmena je bonus, nie podmienka dokončenia */ }
}

// ─── Štýly ────────────────────────────────────────────────────────────────────
// Povrch prehliadky je CYBORG, nie chrámový — hovorí ním AInubis, a ten má vlastnú
// paletu (vedomá výnimka z brand v3.2, `AinubisWidget.css` hlavička, Matej 26. 7.):
// **cyan `#5BE0F0` = stroj, zlatá `#F5C73D→#E69E1A` = človek.** Preto je bublina
// modrá a tlačidlá ostávajú zlaté — klikne ich človek. Logo DOGYPT na povrchu
// AInubisa NEPATRÍ (Matej 30. 7.: „logo dogyptu možeš dať preč — nechaj iba AINUBIS").
const CY = '#5BE0F0';
const WIZ_CSS = `
  /* Spotlight: cieľ nesvieti zlatým rámom appky, ale CYAN prstencom — ukazuje naň
     stroj. Okolie tmavne na 93 %, aby v zornom poli ostala naozaj jedna vec
     (Matej 24. 8.: „zasvietiť v navigácii tú ikonku a všetko ostatné bude tmavé"). */
  .wiz-spot {
    box-shadow:
      0 0 0 3px rgba(91,224,240,.85),
      0 0 30px rgba(91,224,240,.55),
      0 0 0 9999px rgba(1,5,10,0.93) !important;
    position: relative !important;
    z-index: 55 !important;
    border-radius: 18px;
    transition: box-shadow .25s ease;
    animation: wiz-pulse 2.4s ease-in-out infinite;
  }
  /* Ikonka v lište je pilulka — 18px radius by jej urobil roh navyše. */
  .wiz-spot--round { border-radius: 999px !important; }
  @keyframes wiz-pulse {
    0%,100% { box-shadow: 0 0 0 3px rgba(91,224,240,.85), 0 0 30px rgba(91,224,240,.55), 0 0 0 9999px rgba(1,5,10,.93); }
    50%     { box-shadow: 0 0 0 3px rgba(91,224,240,1),   0 0 46px rgba(91,224,240,.80), 0 0 0 9999px rgba(1,5,10,.93); }
  }
  @keyframes wiz-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);     }
  }
  @keyframes wiz-face-in {
    from { opacity: 0; transform: scale(.86); }
    to   { opacity: 1; transform: scale(1);   }
  }
`;

const GOLD_BTN: React.CSSProperties = {
  flex: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'linear-gradient(135deg,#F5C73D,#E69E1A)',
  color: '#1c160c', fontWeight: 700,
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 14,
  border: '1px solid rgba(250,244,236,.30)',
  borderRadius: 8,
  padding: '11px 18px',
  cursor: 'pointer',
};

const GHOST_BTN: React.CSSProperties = {
  background: 'none', border: 'none',
  color: 'rgba(226,240,248,.45)', fontSize: 12.5,
  cursor: 'pointer', textDecoration: 'underline',
  padding: '8px 12px',
  fontFamily: "'Space Grotesk',sans-serif",
};

/** Tvár = `assets/ainubis-badge.png`, kopíruje sa TENTO súbor (nekresliť variantu).
 *  Prstenec a aura sú z `.ainubis-intro__badge`, aby sfinx vyzeral rovnako ako
 *  v chate — je to tá istá postava, nie druhá ikonka.
 *
 *  ⚠️ VEĽKÁ tvár (privítanie) má prstenec PLNOU cyanou, nie priesvitnou
 *  (Matej 24. 8.: „chcelo by to zvýrazniť okraj toho kruhu, nemôže byť priesvitný
 *  musí byť krajší"). Priesvitný 1px rám sa na tmavom pozadí strácal a kruh
 *  vyzeral nedokončený — tá istá chyba ako `T.hairline` použitý ako rám
 *  (pozri lock o bledých blokoch v CLAUDE.md). Malá tvár v bubline ostáva
 *  jemná zámerne — tam je ikonka, nie portrét. */
function face(size: number): React.CSSProperties {
  const big = size > 40;
  return {
    borderRadius: '50%',
    objectFit: 'contain',
    flex: 'none',
    background: 'radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)',
    border: big ? `3px solid ${CY}` : '1px solid rgba(91,224,240,.45)',
    boxShadow: big
      // Prstenec → tmavá medzera → slabší vonkajší prsteň → aura. Medzera je to,
      // čo dáva hrane ostrosť; bez nej sa cyan zlije so žiarou do rozmazaného kruhu.
      ? `0 0 0 5px #01050A, 0 0 0 6.5px rgba(91,224,240,.30), 0 0 34px rgba(91,224,240,.45)`
      : '0 0 14px rgba(59,158,255,.35)',
  };
}

/** Wordmark. „AI" je cyan a ťažšie — meno je vtip AI + Anubis a tá časť sa má
 *  prečítať prvá (kánon `reference_dogypt_ainubis_cyborg_palette`). Nie je to
 *  obyčajný text zlatou, ako to mala prehliadka do 24. 8. */
function Wordmark({ size = 13 }: { size?: number }) {
  return (
    <span style={{
      fontFamily: "'Cinzel',serif", fontWeight: 700,
      fontSize: size, letterSpacing: '.30em', textIndent: '.30em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: CY, fontWeight: 900, fontSize: '1.16em', textShadow: `0 0 18px rgba(91,224,240,.75)` }}>AI</span>
      <span style={{ color: 'rgba(226,240,248,.58)' }}>NUBIS</span>
    </span>
  );
}

// ─── Spotlight ────────────────────────────────────────────────────────────────
function SpotEffect({ targetId }: { targetId: WizAnchor }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.classList.add('wiz-spot');
    if (WIZ_ROUND.includes(targetId)) el.classList.add('wiz-spot--round');
    const tm = setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
    return () => {
      clearTimeout(tm);
      el.classList.remove('wiz-spot', 'wiz-spot--round');
    };
  }, [targetId]);
  return null;
}

// ─── Bublina ──────────────────────────────────────────────────────────────────
function CoachCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed',
      left: 16, right: 16,
      // Sit above the floating pill nav (bottom: safe-area+16, ~52px tall) so the
      // card + its Skip/Next buttons never collide with the menu.
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
      zIndex: 80,
      background: 'linear-gradient(180deg,#071019 0%,#03070C 100%)',
      border: '1px solid rgba(91,224,240,.30)',
      borderRadius: 14,
      padding: '15px 17px 16px',
      boxShadow: '0 20px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(91,224,240,.10), 0 0 44px rgba(59,158,255,.20)',
      animation: 'wiz-in 0.3s ease',
      maxWidth: 480,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      {children}
    </div>
  );
}

/** Hovorí AInubis — tvár + wordmark nad textom. Bez tohto riadku je bublina
 *  anonymná systémová hláška; s ním je to postava (Matej 23. 8.). */
function Speaker() {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'center',
      paddingBottom: 10, marginBottom: 11,
      borderBottom: '1px solid rgba(91,224,240,0)',
      backgroundImage: 'linear-gradient(90deg, rgba(91,224,240,0) 0%, rgba(91,224,240,.35) 45%, rgba(91,224,240,0) 100%)',
      backgroundSize: '100% 1px', backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat',
    }}>
      <img src={ainubisFace} alt="" aria-hidden width={30} height={30} style={face(30)} />
      <Wordmark size={12} />
    </div>
  );
}

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 11 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === active ? 18 : 6, height: 5,
          borderRadius: 3, display: 'inline-block',
          background: i === active ? CY : 'rgba(91,224,240,.18)',
          boxShadow: i === active ? `0 0 10px rgba(91,224,240,.75)` : 'none',
          transition: 'all .3s',
        }} />
      ))}
    </div>
  );
}

// ─── Scény na `/pack` ─────────────────────────────────────────────────────────
// Kotva ide z registra (`wizAnchors.ts`) — voľný string tu bol príčina, prečo
// posledný krok starej prehliadky svietil do prázdna po redizajne homepage 5. 8.
interface SceneDef {
  id: Exclude<WizScene, 'welcome' | 'handoff' | 'done'>;
  anchor: WizAnchor;
  /** Text sa vetví podľa toho, či člen už má psa. */
  bodyKey: (hasDog: boolean) => string;
  ctaKey: string;
}

const SCENES: SceneDef[] = [
  {
    id: 'home',
    anchor: WIZ.hero,
    bodyKey: () => 'pack.wizard.home.body',
    ctaKey: 'pack.wizard.next',
  },
  {
    id: 'toDogs',
    anchor: WIZ.dogsRow,
    // Bez psa nemá zmysel pozývať „tam bývajú tvoji psi" — pozveme ho psa pridať.
    bodyKey: (hasDog) => (hasDog ? 'pack.wizard.toDogs.body' : 'pack.wizard.toDogs.bodyNoDog'),
    ctaKey: 'pack.wizard.toDogs.cta',
  },
  {
    // Spotlight na IKONKU v spodnej lište, nie na blok stránky — obrazovka
    // stmavne a svieti jedna vec, ktorú má človek stlačiť.
    id: 'toMap',
    anchor: WIZ.navMap,
    bodyKey: () => 'pack.wizard.toMap.body',
    ctaKey: 'pack.wizard.toMap.cta',
  },
];

// ─── PackWizard (mount v `Pack.tsx`) ──────────────────────────────────────────
interface PackWizardProps {
  /** ID primárneho psa (najnižšie číslo vo svorke). `null` = načítava sa alebo pes nie je. */
  primaryDogId: string | null;
  /** Meno primárneho psa — do textu kroku „poď do svorky". */
  primaryDogName: string | null;
}

export function PackWizard({ primaryDogId, primaryDogName }: PackWizardProps) {
  const t = useT();
  const [scene, setScene] = useState<WizScene>(getWizScene);

  // Znovuspustenie z nastavení / návrat z inej routy.
  useEffect(() => {
    const sync = () => setScene(getWizScene());
    sync();
    window.addEventListener('dogypt:wizard', sync);
    return () => window.removeEventListener('dogypt:wizard', sync);
  }, []);

  // DEV náhľad: `/pack?wiz=1` pustí prehliadku od začiatku aj vtedy, keď je v tomto
  // prehliadači už dobehnutá (`dogypt_wz = done`). Bez toho sa dá zopakovať jedine
  // ručným čistením úložiska — teda nie na telefóne. Precedens: `?reveal=` v `PackMap`.
  // ⚠️ `import.meta.env.DEV` je vo `vite build` `false` → vetva sa do prod buildu
  //    nedostane (tá istá stráž ako `devMockDogs.ts`).
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!new URLSearchParams(location.search).get('wiz')) return;
    saveWizScene('welcome');
    setScene('welcome');
  }, []);

  // ⚠️ Prehliadka POČKÁ na cookie lištu. `ConsentBanner` má z-9999, bublina z-80 —
  // kým je lišta dole, prekrýva jej tlačidlá „Preskočiť/Ďalej" a prehliadka vyzerá
  // rozbito. Zasiahne to práve nového člena, ktorý voľbu ešte neurobil, teda presne
  // toho, komu je prehliadka určená. Kontroluje sa priebežne — voľba padne na tej
  // istej obrazovke, bez reloadu (rovnaká pasca ako AINUBIS badge, KONTEXT 26. 7.).
  const [consentDone, setConsentDone] = useState(() => !!getConsent());
  useEffect(() => {
    if (consentDone) return;
    const iv = setInterval(() => {
      if (getConsent()) { setConsentDone(true); clearInterval(iv); }
    }, 400);
    return () => clearInterval(iv);
  }, [consentDone]);

  const hasDog = !!primaryDogId;
  const sceneIdx = SCENES.findIndex((s) => s.id === scene);
  const def = sceneIdx >= 0 ? SCENES[sceneIdx] : null;

  const advance = useCallback(() => {
    setScene((cur) => {
      const i = ORDER.indexOf(cur);
      const nextScene = ORDER[Math.min(i + 1, ORDER.length - 1)];
      saveWizScene(nextScene);
      return nextScene;
    });
  }, []);

  // Kotva chýba (blok za flagom, iný layout) → krok sa PRESKOČÍ. Bublina bez
  // spotlightu je horšia než žiadna: hovorí o niečom, čo na obrazovke nesvieti.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!def) { setReady(false); return; }
    // Blok sa môže domountovať o snímku neskôr (dáta psov), preto sa kotva
    // doťahuje v kolách, nie jedným pokusom pri mounte.
    if (anchorExists(def.anchor)) { setReady(true); return; }
    setReady(false);
    let tries = 0;
    const iv = setInterval(() => {
      tries += 1;
      if (anchorExists(def.anchor)) { setReady(true); clearInterval(iv); }
      else if (tries > 12) { clearInterval(iv); advance(); } // ~1,5 s a kotva nikde
    }, 120);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def?.anchor, advance]);

  // ⚠️ Krok „poď do svorky" zatiaľ NENAVIGUJE. Scéna svorky (nákres 04) sa stavia
  // v ďalšom kroku; keby sme človeka poslali preč už teraz, `PackWizard` sa
  // odmountuje s ním a prehliadka by na `/pack/dogs` ticho zmizla. Kým scéna
  // neexistuje, krok len ukáže, kde svorka žije, a odovzdá chatu.
  const next = advance;

  const finish = useCallback(() => {
    saveWizScene('done');
    setScene('done');
    void grantFirstSteps();
  }, []);

  const skip = useCallback(() => {
    saveWizScene('done');
    setScene('done');
  }, []);

  if (scene === 'done' || !consentDone) return null;

  return (
    <WizPortal>
      <style>{WIZ_CSS}</style>

      {/* ── PRIVÍTANIE — celá obrazovka, sfinx, jeden gombík ──
          Bez loga DOGYPT: na povrchu AInubisa nemá čo robiť (Matej 30. 7.), a pri
          prehliadke by naviac súťažilo s tým jediným, čo tu má hovoriť — postavou. */}
      {scene === 'welcome' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'radial-gradient(120% 80% at 50% 34%, #0c1c2b 0%, #030A12 46%, #01050A 100%)',
          display: 'flex', flexDirection: 'column',
          padding: '48px 28px 44px',
          animation: 'wiz-in 0.4s ease',
          overflowY: 'auto',
        }}>
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            <img
              src={ainubisFace} alt="" aria-hidden
              width={112} height={112}
              style={{ ...face(112), animation: 'wiz-face-in .5s ease' }}
            />
            <div style={{ margin: '18px 0 0' }}>
              <Wordmark size={20} />
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono',ui-monospace,monospace",
              fontSize: 9.5, letterSpacing: '.22em', textTransform: 'uppercase',
              color: 'rgba(91,224,240,.7)', margin: '9px 0 0',
            }}>
              {t('pack.wizard.welcome.role')}
            </div>
            <div style={{
              width: 'min(320px, 100%)', height: 1, margin: '18px 0 20px',
              background: 'linear-gradient(90deg, rgba(91,224,240,0) 0%, rgba(91,224,240,.40) 50%, rgba(91,224,240,0) 100%)',
            }} />
            <h2 style={{
              fontFamily: "'Cinzel',serif", fontWeight: 700,
              fontSize: 23, color: '#E6FAFF',
              textShadow: '0 0 26px rgba(91,224,240,.28)',
              lineHeight: 1.3, marginBottom: 14,
            }}>
              {t('pack.wizard.welcome.title')}
            </h2>
            <p style={{
              color: 'rgba(226,240,248,.62)', fontSize: 13.5,
              lineHeight: 1.65, marginBottom: 32,
              maxWidth: 320,
            }}>
              {t('pack.wizard.welcome.body')}
            </p>
            <button
              onClick={next}
              style={{ ...GOLD_BTN, flex: 'none', width: '100%', maxWidth: 300, marginBottom: 14 }}
            >
              {t('pack.wizard.welcome.cta')}
            </button>
            <button onClick={skip} style={GHOST_BTN}>{t('pack.wizard.skipForNow')}</button>
          </div>
        </div>
      )}

      {/* ── SPOTLIGHT + BUBLINA ── */}
      {def && ready && (
        <>
          <SpotEffect targetId={def.anchor} />

          <CoachCard>
            <ProgressDots total={SCENES.length} active={sceneIdx} />
            <Speaker />

            <div
              style={{ fontSize: 13, lineHeight: 1.65, color: '#d8cdb4', marginBottom: 14 }}
              dangerouslySetInnerHTML={{
                __html: t(def.bodyKey(hasDog), { dog: primaryDogName || t('pack.wizard.myDog') }),
              }}
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={skip} style={GHOST_BTN}>{t('pack.wizard.skip')}</button>
              <button onClick={next} style={GOLD_BTN}>{t(def.ctaKey)}</button>
            </div>
          </CoachCard>
        </>
      )}

      {/* ── ODOVZDANIE — od tejto chvíle je AInubis chat, nie sprievodca ── */}
      {scene === 'handoff' && (
        <CoachCard>
          <Speaker />
          <div style={{ fontSize: 13, lineHeight: 1.65, color: '#d8cdb4', marginBottom: 14 }}>
            {t('pack.wizard.handoff.body')}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={finish} style={GHOST_BTN}>{t('pack.wizard.handoff.later')}</button>
            <button
              onClick={() => { finish(); openAinubis(); }}
              style={GOLD_BTN}
            >
              {t('pack.wizard.handoff.cta')}
            </button>
          </div>
        </CoachCard>
      )}
    </WizPortal>
  );
}
