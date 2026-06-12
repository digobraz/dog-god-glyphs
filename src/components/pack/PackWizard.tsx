import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

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
interface StepDef {
  globalStep: number; // 0, 1, 3, 4
  targetId: string;
  title: string;
  body: string;
  nextLabel?: string;
}

const PACK_STEPS: StepDef[] = [
  {
    globalStep: 0,
    targetId: 'wiz-hero',
    title: 'Devotion',
    body: "This is your bond, made visible. Stray → Pup → … → Demigod. You don't buy levels — you earn them by showing up for your dog.",
  },
  {
    globalStep: 1,
    targetId: 'wiz-pack',
    title: 'My Pack',
    body: 'Every dog you walk beside lives here. Tap your dog — prayers happen there, that\'s where Devotion is actually earned.',
    nextLabel: 'Open My Dog →',
  },
  {
    globalStep: 3,
    targetId: 'wiz-globe',
    title: 'Your world',
    body: 'The pack grows worldwide. A verse each day, your founder link to bring other dog lovers in.',
  },
  {
    globalStep: 4,
    targetId: 'wiz-steps',
    title: 'Start here',
    body: "A short checklist — finish all seven and earn <strong style=\"color:#F5C73D\">+10 ☥</strong>. Last task: discover what we're building in the block just below.",
    nextLabel: 'Enter the Pack 🐾',
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
              Welcome to the Pack.
            </div>
            <h2 style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 23, color: '#F4EFE6',
              lineHeight: 1.3, marginBottom: 18,
            }}>
              You're not a user here.<br />You're a Dogyptian.
            </h2>
            <p style={{
              color: '#a99f88', fontSize: 13.5,
              lineHeight: 1.65, marginBottom: 36,
              maxWidth: 300,
            }}>
              Take 30 seconds — let me show you how your bond becomes visible.
            </p>
            <button
              onClick={next}
              style={{ ...GOLD_BTN, flex: 'none', width: '100%', maxWidth: 300, marginBottom: 14 }}
            >
              Show me
            </button>
            <button onClick={skip} style={GHOST_BTN}>Skip for now</button>
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
              {localDef.title}
            </div>

            <div
              style={{ fontSize: 13, lineHeight: 1.65, color: '#d8cdb4', marginBottom: 14 }}
              dangerouslySetInnerHTML={{ __html: localDef.body }}
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={skip} style={GHOST_BTN}>Skip</button>
              <button onClick={next} style={GOLD_BTN}>
                {step === 1
                  ? (primaryDogName ? `Open ${primaryDogName} →` : 'Open My Dog →')
                  : (localDef.nextLabel ?? 'Next →')}
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
          The daily ritual
        </div>

        <div style={{ fontSize: 13, lineHeight: 1.65, color: '#d8cdb4', marginBottom: 14 }}>
          Show up — Presence, a walk — and Devotion grows. Try tapping{' '}
          <strong style={{ color: '#F5C73D' }}>Prayer of Presence</strong> and watch
          your XP rise in the bar above. ↑
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={skip} style={GHOST_BTN}>Skip</button>
          <button onClick={goBack} style={GOLD_BTN}>Continue →</button>
        </div>
      </CoachCard>
    </WizPortal>
  );
}
