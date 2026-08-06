// DENNÝ RITUÁL (modlitby) — vytiahnuté z `PackDogDetail.tsx` 2026-08-06.
// Zadanie: plany/zadanie-mypack-petpas-2026-08-06.md §2/12 — „Modlitby zostávajú na
// homepage `/pack`, na karte psa len výsledok (streak)."
//
// PREČO KOMPONENT A NIE ZMAZANIE: karta psa sa mení na PET PAS (výstup, read-only) a
// modlitbový panel z nej odchádza. Keby sa len zmazal, denný rituál by z appky zmizol
// úplne — homepage ho ešte nemá. Preto je to presun, nie odstránenie: kód nižšie je
// 1:1 pôvodný blok, mení sa len to, KDE je namountovaný a odkiaľ berie psa.
//
// Zbieranie devotion je zamknuté do 2027 (project_dogypt_devotion_ekonomika_stav_2026-08-06)
// — táto komponenta sa preto nerozširuje, len sťahuje.
import React, { useState } from 'react';
import { Check, ChevronDown, Lock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_BASE } from '@/lib/env';
import { PACK_THEME } from './packTheme';
import { useT } from '@/i18n/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { DEV_FULL } from '@/lib/packFlags';

const T = PACK_THEME;

export function DailyPrayers({ dogId, dogName }: { dogId: string; dogName: string }) {
  const t = useT();

  // DAILY PRAYERS — the three acts of devotion from the Constitution (Part IV).
  const [presenceDone, setPresenceDone] = useState(false);
  const [walkHours, setWalkHours] = useState<number | null>(null); // 0..5, 0 = under 1 h, null = untouched
  const [prayersSubmitted, setPrayersSubmitted] = useState(false); // locks the block once logged
  const [prayerLockedPoints, setPrayerLockedPoints] = useState<number | null>(null);
  const [showPrayerConfirm, setShowPrayerConfirm] = useState(false);

  const WALK_LEVELS = getWalkLevels(t);
  const todayLabel = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  const walkPts = walkHours !== null ? walkPointsFor(walkHours) : 0;
  const todayPoints = (presenceDone ? 3 : 0) + walkPts;

  // Log today's prayer → grant-devotion (idempotent: one credit per dog per day).
  const confirmAndSubmitPrayers = async () => {
    setShowPrayerConfirm(false);
    const pts = (presenceDone ? 3 : 0) + (walkHours !== null ? walkPointsFor(walkHours) : 0);
    setPrayersSubmitted(true); // optimistic lock
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${EDGE_BASE}/grant-devotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          apikey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ?? '',
        },
        body: JSON.stringify({ kind: 'prayer', dog_id: dogId, presence: presenceDone, walk_hours: walkHours }),
      });
      if (res.ok) {
        const j = await res.json();
        setPrayerLockedPoints(j.points ?? pts);
        if (typeof j.total === 'number') {
          window.dispatchEvent(new CustomEvent('dogypt:devotion', { detail: { total: j.total } }));
        }
      } else {
        setPrayersSubmitted(false); // revert optimistic lock
        toast({ title: t('pack.dog.toastCouldntLog'), variant: 'destructive' });
      }
    } catch {
      setPrayersSubmitted(false);
      toast({ title: t('pack.dog.toastCouldntLog'), variant: 'destructive' });
    }
  };

  // LIVE = coming-soon karta, DEV_FULL = plný blok. Presne ako to bolo na karte psa —
  // zbieranie devotion je zamknuté do 2027, tento gate sa nesmie otvoriť „mimochodom".
  if (!DEV_FULL) return <PrayersComingSoon dogName={dogName} />;

  return (
          <section
            id="prayers"
            className="flex flex-col"
            style={{
              background: T.cardGrad,
              border: `1.5px solid ${T.cardEdge}`,
              borderRadius: 16,
              padding: '22px 20px',
              boxShadow: T.cardShadow,
            }}
          >
            {/* Date eyebrow */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.accentGold,
                marginBottom: 8,
              }}
            >
              {todayLabel}
            </div>
            {/* Title */}
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 19,
                lineHeight: 1.2,
                fontWeight: 700,
                color: T.ink,
                marginBottom: 6,
              }}
            >
              {t('pack.dog.prayersTitle')}
            </h2>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                lineHeight: 1.5,
                color: T.inkDim,
                marginBottom: 16,
              }}
            >
              {t('pack.dog.prayersSubtitle', { dogName })}
            </p>

            {/* Prayer checklist — rows stacked, purple→gold gradient, big green check.
                Single-line rows of equal height; status/value sits next to the row. */}
            <div className="flex flex-col gap-2.5">
              {/* 1 — Prayer of Presence (tap to check) */}
              <PrayerRow
                checked={presenceDone}
                onToggle={() => setPresenceDone((v) => !v)}
                disabled={prayersSubmitted}
                title={t('pack.dog.prayerPresenceTitle')}
                hint={t('pack.dog.prayerPresenceHint')}
                right={<span style={PTS_PILL}>+3</span>}
              />

              {/* 2 — Prayer of the Path (slider: < 1 h → all day, max 5 pts) */}
              <PrayerRow
                checked={walkHours !== null}
                disabled={prayersSubmitted}
                title={t('pack.dog.prayerWalkTitle')}
                hint={t('pack.dog.prayerWalkHint')}
                right={
                  <div className="w-[180px] md:w-[272px]" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={1}
                        value={walkHours ?? 0}
                        disabled={prayersSubmitted}
                        onChange={(e) => setWalkHours(Number(e.target.value))}
                        style={{ flex: 1, minWidth: 0, accentColor: '#F5C73D', cursor: prayersSubmitted ? 'default' : 'pointer' }}
                      />
                      <span style={{ ...PTS_PILL, minWidth: 44, textAlign: 'center' }}>
                        {walkHours !== null ? `+${walkPointsFor(walkHours)}` : '+0'}
                      </span>
                    </div>
                    {/* Mierka */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingRight: 52,
                        fontFamily: "'Cinzel', serif",
                        fontSize: 7.5,
                        letterSpacing: '0.02em',
                        color: 'rgba(250,244,236,0.62)',
                      }}
                    >
                      {WALK_LEVELS.map((lv) => (
                        <span key={lv.h} style={{ color: walkHours === lv.h ? '#FAF4EC' : undefined }}>
                          {lv.label}
                        </span>
                      ))}
                    </div>
                  </div>
                }
              />

              {/* Open Ritual (dropdown, coming soon) */}
              <PrayerRow
                locked
                faded
                disabled={prayersSubmitted}
                title={t('pack.dog.prayerOpenRitualTitle')}
                hint={t('pack.dog.prayerOpenRitualHint')}
                onRowClick={() =>
                  toast({
                    title: t('pack.dog.comingSoon'),
                    description: t('pack.dog.prayerOpenRitualComingSoon'),
                  })
                }
                right={
                  <span style={{ ...PTS_PILL, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {t('pack.dog.prayerChoose')} <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                }
              />
            </div>

            {/* Today's devotion — summary badge + Submit; once submitted the block locks for the day */}
            <div className="flex flex-col items-center" style={{ marginTop: 18 }}>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <span
                  className="inline-flex items-center gap-2"
                  style={{
                    background: prayersSubmitted
                      ? 'linear-gradient(180deg, #34D27B 0%, #22A35E 100%)'
                      : 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
                    color: prayersSubmitted ? '#06301c' : '#3d1f00',
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '0.02em',
                    padding: '9px 20px',
                    borderRadius: 999,
                    boxShadow: '0 10px 24px -10px rgba(201, 154, 63, 0.7)',
                  }}
                >
                  {prayersSubmitted ? <Check className="h-4 w-4" strokeWidth={3} /> : <Sparkles className="h-4 w-4" />}
                  {prayersSubmitted
                    ? t('pack.dog.prayersLogged', { points: String(prayerLockedPoints ?? todayPoints) })
                    : t('pack.dog.prayersTotal', { points: String(todayPoints) })}
                </span>

                {!prayersSubmitted && (
                  <button
                    type="button"
                    onClick={() => setShowPrayerConfirm(true)}
                    disabled={!presenceDone && walkHours === null}
                    className="inline-flex items-center gap-1.5"
                    style={{
                      background: (presenceDone || walkHours !== null) ? '#22C55E' : 'rgba(34,197,94,0.35)',
                      color: '#fff',
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: '0.04em',
                      padding: '9px 18px',
                      borderRadius: 999,
                      cursor: (presenceDone || walkHours !== null) ? 'pointer' : 'not-allowed',
                      boxShadow: (presenceDone || walkHours !== null) ? '0 10px 24px -10px rgba(34, 197, 94, 0.7)' : 'none',
                    }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    {t('pack.dog.submit')}
                  </button>
                )}
              </div>
              <span
                style={{
                  marginTop: 7,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: T.inkFaint,
                }}
              >
                {prayersSubmitted ? t('pack.dog.prayersLockedDesc') : t('pack.dog.prayersAddsStats')}
              </span>
            </div>

            {/* Confirm dialog — modal overlay */}
            {showPrayerConfirm && (
              <div
                className="fixed inset-0 flex items-center justify-center"
                style={{ zIndex: 50, background: 'rgba(10,8,20,0.72)', backdropFilter: 'blur(3px)' }}
                onClick={() => setShowPrayerConfirm(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: T.panelGrad,
                    border: `1.5px solid ${T.cardEdge}`,
                    borderRadius: 14,
                    padding: '28px 26px',
                    maxWidth: 360,
                    width: '90vw',
                    boxShadow: T.panelShadow,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: T.ink,
                      marginBottom: 10,
                    }}
                  >
                    {t('pack.dog.confirmPrayersTitle')}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: T.inkDim,
                      marginBottom: 22,
                    }}
                  >
                    {t('pack.dog.confirmPrayersBody')}
                  </p>
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPrayerConfirm(false)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: 10,
                        background: 'transparent',
                        border: `1px solid ${T.border}`,
                        fontFamily: "'Cinzel', serif",
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: T.inkDim,
                        cursor: 'pointer',
                      }}
                    >
                      {t('pack.dog.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={confirmAndSubmitPrayers}
                      style={{
                        padding: '9px 20px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                        border: '1px solid rgba(250, 244, 236, 0.30)',
                        fontFamily: "'Cinzel', serif",
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: '#3d1f00',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px -8px rgba(201, 154, 63, 0.65)',
                      }}
                    >
                      {t('pack.dog.logPrayers')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
  );
}

function walkPointsFor(h: number): number {
  return h <= 0 ? 0.5 : Math.min(5, h);
}
// Walk picker buttons — h-value 0..5 (0 = under an hour, 5 = all-day). Same on
// every screen size, no slider.
function getWalkLevels(t: ReturnType<typeof useT>): { h: number; label: string }[] {
  return [
    { h: 0, label: t('pack.dog.walkLevelUnder1h') },
    { h: 1, label: t('pack.dog.walkLevel1h') },
    { h: 2, label: t('pack.dog.walkLevel2h') },
    { h: 3, label: t('pack.dog.walkLevel3h') },
    { h: 4, label: t('pack.dog.walkLevel4h') },
    { h: 5, label: t('pack.dog.walkLevelDay') },
  ];
}

// Purple→gold gradient — matches FounderInvite (brand milestone card).
const PRAYER_GRADIENT = 'var(--brand-gradient)';
// Points pill — light text on the gradient row.
const PTS_PILL: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 11,
  fontWeight: 700,
  color: '#FAF4EC',
  background: 'rgba(0,0,0,0.22)',
  borderRadius: 999,
  padding: '3px 9px',
  whiteSpace: 'nowrap',
};

// PrayerRow — one act of devotion as a checklist row on the purple→gold card.
// Big green check on the left (tap via onToggle, or driven by `checked`);

function PrayerRow({
  checked,
  onToggle,
  onRowClick,
  locked,
  disabled,
  faded,
  eyebrow,
  title,
  sub,
  hint,
  right,
}: {
  checked?: boolean;
  onToggle?: () => void;
  onRowClick?: () => void;
  locked?: boolean;
  disabled?: boolean;
  faded?: boolean;
  eyebrow?: string;
  title: string;
  sub?: string;
  hint: string;
  right?: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const rowClickable = !!onRowClick && !disabled;
  const checkClickable = !!onToggle && !disabled;
  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        onClick={rowClickable ? onRowClick : undefined}
        className="flex items-center gap-3"
        style={{
          background: PRAYER_GRADIENT,
          borderRadius: 14,
          padding: '0 14px',
          minHeight: 58,
          boxShadow: '0 10px 28px -16px rgba(40, 16, 70, 0.6)',
          cursor: rowClickable ? 'pointer' : 'default',
          opacity: disabled ? 0.82 : faded ? 0.55 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {/* Big check — left */}
        <button
          type="button"
          onClick={
            checkClickable
              ? (e) => {
                  e.stopPropagation();
                  onToggle!();
                }
              : undefined
          }
          disabled={!checkClickable}
          className="inline-flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            flexShrink: 0,
            background: checked ? '#22C55E' : 'rgba(255,255,255,0.10)',
            border: checked ? 'none' : '2px solid rgba(250,244,236,0.55)',
            color: checked ? '#fff' : 'rgba(250,244,236,0.7)',
            cursor: checkClickable ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          {checked ? <Check className="h-4 w-4" strokeWidth={3} /> : locked ? <Lock className="h-3.5 w-3.5" /> : null}
        </button>

        {/* Text — middle */}
        <div className="flex-1" style={{ minWidth: 0 }}>
          {eyebrow && (
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 8,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245, 222, 170, 0.92)',
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: '#FAF4EC', lineHeight: 1.15 }}>
            {title}
          </div>
          {sub && (
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: 'rgba(250,244,236,0.72)', marginTop: 1 }}>
              {sub}
            </div>
          )}
        </div>

        {/* Right — points / slider / dropdown */}
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>

      {/* Hover tooltip — the Constitution description */}
      {hover && (
        <span
          className="absolute"
          style={{
            left: 8,
            right: 8,
            bottom: 'calc(100% + 6px)',
            zIndex: 6,
            background: T.ink,
            color: T.card,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10.5,
            lineHeight: 1.4,
            padding: '8px 10px',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

function PrayersComingSoon({ dogName }: { dogName: string }) {
  const t = useT();
  return (
    <section
      className="flex flex-col items-center justify-center text-center"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        padding: '32px 24px',
        boxShadow: T.cardShadow,
        gap: 14,
      }}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(201,154,63,0.08)', border: '1px solid rgba(201,154,63,0.28)' }}
      >
        <Lock className="h-6 w-6" style={{ color: T.accentGold }} />
      </span>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 19, fontWeight: 700, color: T.ink, lineHeight: 1.2 }}>
        {t('pack.dog.dailyPrayers')}
      </h2>
      <span
        className="inline-flex items-center gap-1.5"
        style={{
          padding: '4px 12px',
          borderRadius: 999,
          background: T.tileBg,
          fontFamily: "'Cinzel', serif",
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.inkDim,
        }}
      >
        <Lock className="h-2.5 w-2.5" />
        {t('pack.dog.comingSoon')}
      </span>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5, color: T.inkDim, maxWidth: 280 }}>
        {t('pack.dog.prayersComingSoonDesc', { dogName })}
      </p>
    </section>
  );
}
