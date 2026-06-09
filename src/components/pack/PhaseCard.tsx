import { useEffect, useRef, useState } from 'react';
import { Sparkles, Flame, Globe2 } from 'lucide-react';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

interface PhaseCardProps {
  total: number;
}

const PHASE_TARGET = 1_000_000;

function useCountUp(target: number, duration = 1400): number {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    let start: number | null = null;
    const from = 0;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);
  return val;
}

export function PhaseCard({ total }: PhaseCardProps) {
  const animated = useCountUp(total);
  const pct = Math.max(0.5, Math.min(100, (total / PHASE_TARGET) * 100));
  const pctLabel =
    pct < 1 ? pct.toFixed(2) + '%' : pct < 10 ? pct.toFixed(1) + '%' : Math.round(pct) + '%';

  return (
    <section
      className="pack-card-hover h-full"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        borderRadius: 24,
        padding: '22px 22px 22px',
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 20px 50px -25px rgba(31, 26, 14, 0.18)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 90% 0%, rgba(201, 154, 63, 0.14) 0%, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              color: T.accentGold,
            }}
          >
            <Flame className="h-3 w-3" />
            Phase 01 — Active
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              color: T.inkFaint,
              textTransform: 'uppercase',
            }}
          >
            01 / 03
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: T.ink,
            lineHeight: 1.2,
            marginBottom: 14,
          }}
        >
          Collecting 1,000,000 doglovers
        </h3>

        {/* Big number with count-up */}
        <div className="flex items-baseline gap-2 mb-3">
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: T.ink,
              lineHeight: 1,
            }}
          >
            {animated.toLocaleString('en-US')}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: T.inkDim,
              paddingBottom: 4,
            }}
          >
            of 1M
          </span>
        </div>

        {/* Progress bar with shimmer */}
        <div
          className="relative"
          style={{
            height: 12,
            borderRadius: 999,
            background: 'rgba(31, 26, 14, 0.08)',
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${T.accentGold} 0%, #E0B85A 100%)`,
              borderRadius: 999,
              transition: 'width 1s ease-out',
              boxShadow: '0 0 14px rgba(201, 154, 63, 0.55)',
              overflow: 'hidden',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                animation: 'pack-shimmer 2.4s linear infinite',
              }}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            color: T.inkDim,
            letterSpacing: '0.04em',
            marginBottom: 10,
          }}
        >
          <span>doglovers so far</span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: T.accentGold,
            }}
          >
            {pctLabel}
          </span>
        </div>

        <div className="flex-1" style={{ minHeight: 12 }} />

        {/* Next phases preview */}
        <div
          className="pt-3"
          style={{
            borderTop: `1px solid ${T.hairline}`,
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: '0.34em',
              textTransform: 'uppercase',
              color: T.inkFaint,
              marginBottom: 8,
            }}
          >
            What comes next
          </div>
          <div className="flex flex-col gap-2">
            <NextPhaseRow
              n="02"
              Icon={Sparkles}
              label="Build the app you vote for →"
            />
            <NextPhaseRow n="03" Icon={Globe2} label="Spread the religion globally" />
          </div>
        </div>
      </div>
    </section>
  );
}

function NextPhaseRow({
  n,
  Icon,
  label,
}: {
  n: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: 'rgba(201, 154, 63, 0.12)',
          color: T.accentGold,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        {n}
      </span>
      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: T.inkDim }} />
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          color: T.ink,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}
