import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from './packTheme';
import imgMobileApp from '@/assets/pack-survey/mobile-app.webp';
import imgHealth from '@/assets/pack-survey/health.webp';
import imgMerch from '@/assets/pack-survey/merch.webp';
import { EDGE_BASE } from '@/lib/env';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

const EDGE = `${EDGE_BASE}/toggle-feature-vote`;

// Brand Tier 05 · Ceremonial faience (manuál v3.2) — "moments that mark passage"
const FAIENCE = {
  light: '#5BD6D9',
  core: '#1AA39A',
  deep: '#0F7E78',
};
const CREAM = '#FAF4EC';
// Výsekové farby koláča — kontrastné na tyrkysovom pozadí (cream / faience light / brand gold)
const SLICE_COLORS = ['#FAF4EC', '#5BD6D9', '#C99A3F'];

// Dáta sa zbierajú do konca tohto roku, potom sa stavia.
const COLLECT_UNTIL = 'Dec 31, 2026';

interface Feature {
  key: string;
  titleKey: string;
  blurbKey: string;
  image: string;
}

// v2 konsolidované buckety (swipe). ALLOWED_KEYS v toggle-feature-vote musí sedieť.
const FEATURES: Feature[] = [
  {
    key: 'mobile_app',
    titleKey: 'pack.survey.feature.mobileApp.title',
    blurbKey: 'pack.survey.feature.mobileApp.blurb',
    image: imgMobileApp,
  },
  {
    key: 'health_ai',
    titleKey: 'pack.survey.feature.healthAi.title',
    blurbKey: 'pack.survey.feature.healthAi.blurb',
    image: imgHealth,
  },
  {
    key: 'merch',
    titleKey: 'pack.survey.feature.merch.title',
    blurbKey: 'pack.survey.feature.merch.blurb',
    image: imgMerch,
  },
];

interface FeatureSurveyCardProps {
  votes: Record<string, number>;
  onVotesChange?: (next: Record<string, number>) => void;
}

export function FeatureSurveyCard({ votes, onVotesChange }: FeatureSurveyCardProps) {
  const t = useT();
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>(votes ?? {});
  const [idx, setIdx] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setCounts(votes ?? {});
  }, [votes]);

  // Load my votes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => Promise<{ data: { feature_key: string }[] | null }>;
          };
        };
      })
        .from('feature_votes')
        .select('feature_key')
        .eq('user_id', user.id);
      if (mounted && data) setMyVotes(new Set(data.map((r) => r.feature_key)));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const hasVoted = myVotes.size > 0;
  const totalVotes = useMemo(
    () => FEATURES.reduce((s, f) => s + (counts[f.key] ?? 0), 0),
    [counts],
  );

  // SINGLE CHOICE — môžeš hlasovať len za jednu možnosť. Hlas za novú najprv
  // odhlasuje predošlú (toggle off → toggle on). Edge fn ostáva toggle, single
  // choice je vynútené na FE. Re-klik na vlastnú možnosť = odhlasovanie.
  const toggle = async (key: string) => {
    if (busy) return;
    setBusy(key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const apiToggle = async (k: string): Promise<{ voted: boolean; count: number } | null> => {
        const res = await fetch(EDGE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
          },
          body: JSON.stringify({ feature_key: k }),
        });
        if (!res.ok) return null;
        const j = await res.json();
        return { voted: !!j.voted, count: j.count ?? 0 };
      };

      const nextMine = new Set(myVotes);
      const nextCounts = { ...counts };

      if (myVotes.has(key)) {
        // Re-klik na vlastnú možnosť → odhlasovať.
        const j = await apiToggle(key);
        if (!j) return;
        if (!j.voted) nextMine.delete(key);
        nextCounts[key] = j.count;
      } else {
        // Single choice: najprv zhoď všetky predošlé hlasy.
        for (const prev of Array.from(myVotes)) {
          const j = await apiToggle(prev);
          if (j && !j.voted) {
            nextMine.delete(prev);
            nextCounts[prev] = j.count;
          }
        }
        // Potom pridaj nový.
        const j = await apiToggle(key);
        if (!j) return;
        if (j.voted) {
          nextMine.add(key);
          setShowResults(true);
        }
        nextCounts[key] = j.count;
      }

      setMyVotes(nextMine);
      setCounts(nextCounts);
      onVotesChange?.(nextCounts);
    } finally {
      setBusy(null);
    }
  };

  // Swipe handling — pointer drag; klik na tlačidlo nesmie spustiť swipe (threshold).
  // Infinity scroll — wrap-around, aby sa človek nemusel vracať.
  const next = () => setIdx((i) => (i + 1) % FEATURES.length);
  const prev = () => setIdx((i) => (i - 1 + FEATURES.length) % FEATURES.length);

  const dragStart = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    dragDelta.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current !== null) dragDelta.current = e.clientX - dragStart.current;
  };
  const onPointerUp = () => {
    const d = dragDelta.current;
    if (Math.abs(d) > 45) {
      if (d < 0) next();
      else prev();
    }
    dragStart.current = null;
    dragDelta.current = 0;
  };

  // Touchpad — horizontálny wheel (deltaX) listne medzi slajdami, s lockom proti preskakovaniu.
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
    if (Math.abs(dx) < 14) return;
    const now = e.timeStamp;
    if (now - wheelLock.current < 450) return;
    wheelLock.current = now;
    if (dx > 0) next();
    else prev();
  };

  return (
    <section
      className="pack-card-hover h-full"
      style={{
        background: `linear-gradient(150deg, ${FAIENCE.light} -12%, ${FAIENCE.core} 42%, ${FAIENCE.deep} 112%)`,
        color: CREAM,
        borderRadius: 24,
        padding: '20px 20px 18px',
        boxShadow: '0 25px 60px -20px rgba(15, 126, 120, 0.55)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — centrovaný */}
      <div className="relative text-center">
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(20px, 5vw, 26px)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            textShadow: '0 1px 8px rgba(8,60,57,0.35)',
          }}
        >
          {t('pack.survey.heading')}
        </h3>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12.5,
            letterSpacing: '0.01em',
            color: 'rgba(250,244,236,0.82)',
            marginTop: 5,
          }}
        >
          {t('pack.survey.subheading')}
        </div>

        {/* Results/Vote toggle — centrovaný pod podnadpisom (NIE absolute cez nadpis,
            inak sa na mobile prekrýval so „Shape the app"). */}
        {hasVoted && (
          <button
            type="button"
            onClick={() => setShowResults((v) => !v)}
            className="mt-3"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: T.ink,
              background: FAIENCE.light,
              borderRadius: 999,
              padding: '6px 14px',
              boxShadow: '0 4px 12px -4px rgba(0,0,0,0.4)',
            }}
          >
            {showResults ? t('pack.survey.toggle.vote') : t('pack.survey.toggle.results')}
          </button>
        )}
      </div>

      {/* Body — carousel drží výšku; results sa prekreslí cez neho (žiadny height jump) */}
      <div className="mt-4 flex-1 relative">
        {/* Swipe carousel — ostáva v toku (drží výšku), len skryté keď results */}
        <div style={{ visibility: showResults ? 'hidden' : 'visible' }} aria-hidden={showResults}>
          {/* Slides viewport */}
          <div
            style={{ overflow: 'hidden', borderRadius: 16, touchAction: 'pan-y' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          >
            <div
              className="flex"
              style={{
                transform: `translateX(-${idx * 100}%)`,
                transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {FEATURES.map((f) => {
                const isMine = myVotes.has(f.key);
                const isBusy = busy === f.key;
                return (
                  <div key={f.key} className="shrink-0" style={{ width: '100%', padding: '0 1px' }}>
                    {/* Image — šípky overlay na obrázku */}
                    <div
                      style={{
                        position: 'relative',
                        aspectRatio: '16 / 9',
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: 'rgba(8,60,57,0.32)',
                      }}
                    >
                      <img
                        src={f.image}
                        alt={t(f.titleKey)}
                        loading="lazy"
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          userSelect: 'none',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* navigačné šípky na obrázku */}
                      <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
                        <NavArrow dir="left" disabled={false} onClick={prev} />
                      </div>
                      <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                        <NavArrow dir="right" disabled={false} onClick={next} />
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 16,
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          textShadow: '0 1px 8px rgba(8,60,57,0.35)',
                        }}
                      >
                        {t(f.titleKey)}
                      </div>
                      <p
                        className="mx-auto"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: 'rgba(250,244,236,0.82)',
                          marginTop: 5,
                          maxWidth: '34ch',
                          minHeight: 36,
                        }}
                      >
                        {t(f.blurbKey)}
                      </p>

                      <button
                        type="button"
                        onClick={() => toggle(f.key)}
                        disabled={isBusy}
                        className="mt-3 inline-flex items-center gap-2"
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          padding: '9px 20px',
                          borderRadius: 999,
                          cursor: isBusy ? 'progress' : 'pointer',
                          color: isMine ? T.ink : CREAM,
                          background: isMine ? FAIENCE.light : 'rgba(250,244,236,0.10)',
                          border: `1px solid ${isMine ? FAIENCE.light : 'rgba(250,244,236,0.35)'}`,
                          boxShadow: isMine ? '0 5px 16px -5px rgba(0,0,0,0.45)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isMine ? <Check className="h-3.5 w-3.5" /> : null}
                        {isMine ? t('pack.survey.voted') : t('pack.survey.voteForThis')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {FEATURES.map((f, i) => (
              <button
                key={f.key}
                type="button"
                aria-label={t('pack.survey.dot.goTo', { name: t(f.titleKey) })}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === idx ? CREAM : 'rgba(250,244,236,0.4)',
                  transition: 'width 0.3s, background 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Results overlay — cez carousel, rovnaká výška */}
        {showResults && (
          <div style={{ position: 'absolute', inset: 0 }} className="flex flex-col items-center justify-center">
            <ResultsGraph counts={counts} total={totalVotes} myVotes={myVotes} />
          </div>
        )}
      </div>

      {/* Footer — dátum zberu + total */}
      <div
        className="mt-4 pt-3 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(250,244,236,0.15)' }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9.5,
            letterSpacing: '0.1em',
            color: 'rgba(250,244,236,0.7)',
          }}
        >
          {t('pack.survey.footer.collecting', { date: COLLECT_UNTIL })}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9.5,
            letterSpacing: '0.1em',
            color: 'rgba(250,244,236,0.55)',
          }}
        >
          {t('pack.survey.footer.votes', { count: totalVotes.toLocaleString('en-US') })}
        </span>
      </div>
    </section>
  );
}

// Polárny bod na kruhu (0° = hore, po smere hod. ručičiek).
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
// Path vyplneného výseku koláča.
function wedge(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, endDeg);
  const e = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${e.x} ${e.y} A ${r} ${r} 0 ${large} 0 ${s.x} ${s.y} Z`;
}

// Výsledkový koláč (plný) — viditeľný každému prihlásenému (counts sú globálne z get-pack-stats).
function ResultsGraph({
  counts,
  total,
  myVotes,
}: {
  counts: Record<string, number>;
  total: number;
  myVotes: Set<string>;
}) {
  const t = useT();
  const CX = 60;
  const CY = 60;
  const R = 56;
  let acc = 0;
  const segments = FEATURES.map((f, i) => {
    const c = counts[f.key] ?? 0;
    const frac = total > 0 ? c / total : 0;
    const start = acc * 360;
    acc += frac;
    const end = acc * 360;
    return { f, c, color: SLICE_COLORS[i % SLICE_COLORS.length], start, end, frac, pct: Math.round(frac * 100) };
  });
  const single = segments.find((s) => s.frac >= 0.999);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Plný koláč */}
      <div style={{ flexShrink: 0 }}>
        <svg width={187} height={187} viewBox="0 0 120 120">
          {total === 0 ? (
            <circle cx={CX} cy={CY} r={R} fill="rgba(8,60,57,0.4)" />
          ) : single ? (
            <circle cx={CX} cy={CY} r={R} fill={single.color} />
          ) : (
            segments
              .filter((s) => s.frac > 0)
              .map((s) => (
                <path
                  key={s.f.key}
                  d={wedge(CX, CY, R, s.start, s.end)}
                  fill={s.color}
                  stroke="rgba(8,60,57,0.45)"
                  strokeWidth={1}
                />
              ))
          )}
        </svg>
      </div>

      {/* Legenda */}
      <div className="flex flex-col gap-2.5">
        {segments.map((s) => {
          const isMine = myVotes.has(s.f.key);
          return (
            <div key={s.f.key} className="flex items-center gap-2.5">
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: s.color,
                  flexShrink: 0,
                  boxShadow: isMine ? `0 0 0 2px rgba(250,244,236,0.5)` : 'none',
                }}
              />
              <span
                className="inline-flex items-center gap-1"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: CREAM,
                }}
              >
                {t(s.f.titleKey)}
                {isMine && <Check className="h-3 w-3" style={{ color: FAIENCE.light }} />}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  color: 'rgba(250,244,236,0.78)',
                  marginLeft: 'auto',
                  paddingLeft: 8,
                }}
              >
                {s.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavArrow({ dir, disabled, onClick }: { dir: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'left' ? t('pack.survey.nav.previous') : t('pack.survey.nav.next')}
      className="inline-flex items-center justify-center"
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'rgba(8,60,57,0.55)',
        border: '1px solid rgba(250,244,236,0.45)',
        color: CREAM,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: disabled ? 0.25 : 1,
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: '0 3px 10px -3px rgba(0,0,0,0.5)',
        transition: 'opacity 0.2s',
      }}
    >
      {dir === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );
}
