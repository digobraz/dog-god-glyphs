import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';

// Portal — renders fixed wizard UI directly under <body> so it escapes the
// PackLayout `relative z-10` stacking context. Without this the floating pill
// nav (`fixed z-40`, a root-level sibling of the z-10 content wrapper) paints
// ON TOP of the coach card / welcome overlay — their z-80/z-90 only ranks them
// inside the trapped z-10 context, not globally — hiding the lower text+buttons.
function WizPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

// ─── localStorage state ───────────────────────────────────────────────────────
const KEY = 'dogypt_wz';

export type WizStep = 'welcome' | 0 | 1 | 2 | 3 | 4 | 'done';

export function getWizStep(): WizStep {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return 'welcome';
    if (v === 'done') return 'done';
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0 && n <= 4) return n as 0 | 1 | 2 | 3 | 4;
    return 'welcome';
  } catch {
    return 'done';
  }
}

export function saveWizStep(s: WizStep) {
  try {
    localStorage.setItem(KEY, s === 'done' ? 'done' : String(s));
  } catch { /* ignore */ }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const WIZ_CSS = `
  .wiz-spot {
    box-shadow: 0 0 0 4px #F5C73D, 0 0 0 9999px rgba(0,0,0,0.85) !important;
    position: relative !important;
    z-index: 55 !important;
    border-radius: 18px;
    transition: box-shadow 0.2s;
  }
  @keyframes wiz-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);     }
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
  color: '#9a917f', fontSize: 12.5,
  cursor: 'pointer', textDecoration: 'underline',
  padding: '8px 12px',
  fontFamily: "'Space Grotesk',sans-serif",
};

// ─── Spotlight helper ─────────────────────────────────────────────────────────
function SpotEffect({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.classList.add('wiz-spot');
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80);
    return () => el.classList.remove('wiz-spot');
  }, [targetId]);
  return null;
}

// ─── Coach card shell ─────────────────────────────────────────────────────────
function CoachCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed',
      left: 16, right: 16,
      // Sit above the floating pill nav (bottom: safe-area+16, ~52px tall) so the
      // card + its Skip/Next buttons never collide with the menu.
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
      zIndex: 80,
      background: 'linear-gradient(180deg,#15100a,#0a0805)',
      border: '1px solid #C99A3F',
      borderRadius: 16,
      padding: '16px 18px',
      boxShadow: '0 -10px 40px rgba(0,0,0,.7)',
      animation: 'wiz-in 0.3s ease',
      maxWidth: 480,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      {children}
    </div>
  );
}

function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === active ? 18 : 6, height: 6,
          borderRadius: 4, display: 'inline-block',
          background: i === active ? '#F5C73D' : '#3a3320',
          transition: 'all .3s',
        }} />
      ))}
    </div>
  );
}

// ─── Step definitions for /pack (steps 0, 1, 3, 4) ───────────────────────────
// Fields hold i18n KEYS (not literal text) — the strings are resolved via
// `t()` at render time, since this array lives outside the component (no
// hook access here).
interface StepDef {
  globalStep: number; // 0, 1, 3, 4
  targetId: string;
  titleKey: string;
  bodyKey: string;
  nextLabelKey?: string;
}

const PACK_STEPS: StepDef[] = [
  {
    globalStep: 0,
    targetId: 'wiz-hero',
    titleKey: 'pack.profile.wizard.step.devotion.title',
    bodyKey: 'pack.profile.wizard.step.devotion.body',
  },
  {
    globalStep: 1,
    targetId: 'wiz-pack',
    titleKey: 'pack.profile.wizard.step.myPack.title',
    bodyKey: 'pack.profile.wizard.step.myPack.body',
    nextLabelKey: 'pack.profile.wizard.step.myPack.nextLabel',
  },
  {
    globalStep: 3,
    targetId: 'wiz-globe',
    titleKey: 'pack.profile.wizard.step.yourWorld.title',
    bodyKey: 'pack.profile.wizard.step.yourWorld.body',
  },
  {
    globalStep: 4,
    targetId: 'wiz-steps',
    titleKey: 'pack.profile.wizard.step.startHere.title',
    bodyKey: 'pack.profile.wizard.step.startHere.body',
    nextLabelKey: 'pack.profile.wizard.step.startHere.nextLabel',
  },
];

const TOTAL_STEPS = PACK_STEPS.length; // 4 local steps displayed in dots

// ─── Main PackWizard (used in Pack.tsx) ───────────────────────────────────────
interface PackWizardProps {
  /** ID of the user's primary dog (first listed). Null while loading. */
  primaryDogId: string | null;
  /** Display name of the primary dog (e.g. "Hektor"). */
  primaryDogName: string | null;
}

export function PackWizard({ primaryDogId, primaryDogName }: PackWizardProps) {
  const navigate = useNavigate();
  const t = useT();
  const [step, setStep] = useState<WizStep>(getWizStep);

  // When the user comes back from the dog page (step=2 → now on /pack), re-read from localStorage.
  useEffect(() => {
    const current = getWizStep();
    if (current !== step) setStep(current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount (handles back-navigation from dog page)

  const localDef = typeof step === 'number'
    ? PACK_STEPS.find((s) => s.globalStep === step)
    : null;

  const localIdx = localDef ? PACK_STEPS.indexOf(localDef) : -1;

  const next = useCallback(() => {
    if (step === 'welcome') {
      saveWizStep(0);
      setStep(0);
      return;
    }
    if (typeof step !== 'number' || !localDef) return;

    if (step === 1) {
      // Step 1 → navigate to dog page (wizard continues there as step 2).
      if (primaryDogId) {
        saveWizStep(2);
        setStep(2);
        navigate(`/pack/dogs/${primaryDogId}`);
      } else {
        // No dog yet — skip dog step and go to step 3.
        saveWizStep(3);
        setStep(3);
      }
      return;
    }

    if (step === 4) {
      // Last step.
      saveWizStep('done');
      setStep('done');
      return;
    }

    // Normal advance: 0→1, 3→4.
    const nextGlobal = step + 1 === 2 ? 3 : step + 1;
    saveWizStep(nextGlobal as WizStep);
    setStep(nextGlobal as WizStep);
  }, [step, localDef, primaryDogId, navigate]);

  const skip = useCallback(() => {
    saveWizStep('done');
    setStep('done');
  }, []);

  // Nothing to render: done or on dog-page step.
  if (step === 'done' || step === 2) return null;

  return (
    <WizPortal>
      <style>{WIZ_CSS}</style>

      {/* ── WELCOME OVERLAY ── */}
      {step === 'welcome' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(2,1,0,.96)',
          display: 'flex', flexDirection: 'column',
          padding: '48px 28px 44px',
          animation: 'wiz-in 0.4s ease',
        }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontWeight: 700,
            letterSpacing: '7px', color: '#C99A3F',
            textAlign: 'center', fontSize: 13,
          }}>
            D O G Y P T
          </div>

          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Cinzel',serif",
              color: '#C99A3F', fontSize: 15,
              marginBottom: 14, letterSpacing: '.4px',
            }}>
              {t('pack.profile.wizard.welcome.subtitle')}
            </div>
            <h2
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 23, color: '#F4EFE6',
                lineHeight: 1.3, marginBottom: 18,
              }}
              dangerouslySetInnerHTML={{ __html: t('pack.profile.wizard.welcome.title') }}
            />
            <p style={{
              color: '#a99f88', fontSize: 13.5,
              lineHeight: 1.65, marginBottom: 36,
              maxWidth: 300,
            }}>
              {t('pack.profile.wizard.welcome.body')}
            </p>
            <button
              onClick={next}
              style={{ ...GOLD_BTN, flex: 'none', width: '100%', maxWidth: 300, marginBottom: 14 }}
            >
              {t('pack.profile.wizard.welcome.cta')}
            </button>
            <button onClick={skip} style={GHOST_BTN}>{t('pack.profile.wizard.skipForNow')}</button>
          </div>
        </div>
      )}

      {/* ── SPOTLIGHT + COACH CARD ── */}
      {localDef && (
        <>
          <SpotEffect targetId={localDef.targetId} />

          <CoachCard>
            <ProgressDots total={TOTAL_STEPS} active={localIdx} />

            <div style={{
              fontFamily: "'Cinzel',serif",
              color: '#C99A3F', fontSize: 15,
              letterSpacing: '.4px', marginBottom: 6,
            }}>
              {t(localDef.titleKey)}
            </div>

            <div
              style={{ fontSize: 13, lineHeight: 1.65, color: '#d8cdb4', marginBottom: 14 }}
              dangerouslySetInnerHTML={{ __html: t(localDef.bodyKey) }}
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={skip} style={GHOST_BTN}>{t('pack.profile.wizard.skip')}</button>
              <button onClick={next} style={GOLD_BTN}>
                {step === 1
                  ? t('pack.profile.wizard.openDog', { name: primaryDogName || t('pack.profile.wizard.myDog') })
                  : (localDef.nextLabelKey ? t(localDef.nextLabelKey) : t('pack.profile.wizard.next'))}
              </button>
            </div>
          </CoachCard>
        </>
      )}
    </WizPortal>
  );
}

// ─── PackDogWizard (step 2 — used in PackDogDetail) ──────────────────────────
export function PackDogWizard() {
  const navigate = useNavigate();
  const t = useT();
  const [visible, setVisible] = useState(() => getWizStep() === 2);

  if (!visible) return null;

  const goBack = () => {
    saveWizStep(3);
    setVisible(false);
    navigate('/pack');
  };

  const skip = () => {
    saveWizStep('done');
    setVisible(false);
    navigate('/pack');
  };

  return (
    <WizPortal>
      <style>{WIZ_CSS}</style>
      <SpotEffect targetId="prayers" />
      <CoachCard>
        <ProgressDots total={TOTAL_STEPS} active={1} />

        <div style={{
          fontFamily: "'Cinzel',serif",
          color: '#C99A3F', fontSize: 15,
          letterSpacing: '.4px', marginBottom: 6,
        }}>
          {t('pack.profile.wizard.dogStep.title')}
        </div>

        <div
          style={{ fontSize: 13, lineHeight: 1.65, color: '#d8cdb4', marginBottom: 14 }}
          dangerouslySetInnerHTML={{ __html: t('pack.profile.wizard.dogStep.body') }}
        />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={skip} style={GHOST_BTN}>{t('pack.profile.wizard.skip')}</button>
          <button onClick={goBack} style={GOLD_BTN}>{t('pack.profile.wizard.continue')}</button>
        </div>
      </CoachCard>
    </WizPortal>
  );
}
