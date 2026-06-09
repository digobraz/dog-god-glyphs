import { Check, Circle } from 'lucide-react';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

export interface OnboardingStep {
  label: string;
  done: boolean;
}

export function OnboardingProgress({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          Your Profile
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 22,
            fontWeight: 700,
            color: T.ink,
            letterSpacing: '0.02em',
          }}
        >
          {pct}%
        </div>
      </div>

      <div
        style={{
          height: 6,
          background: T.hairline,
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: T.ink,
            transition: 'width 0.4s ease',
            borderRadius: 3,
          }}
        />
      </div>

      <ul className="flex flex-col gap-3">
        {steps.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              color: s.done ? T.ink : T.inkDim,
            }}
          >
            {s.done ? (
              <Check className="h-4 w-4 shrink-0" style={{ color: T.ink }} />
            ) : (
              <Circle className="h-4 w-4 shrink-0" style={{ color: T.inkFaint }} />
            )}
            <span>{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
