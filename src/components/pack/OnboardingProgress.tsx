import { Check, Circle, Sparkles } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
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
      className="pack-card-hover"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
        height: '100%',
      }}
    >
      <div
        className="flex items-center gap-2 mb-2"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: T.inkDim,
        }}
      >
        <BrandIcon name="clipboard" size={14} tint="gold" />
        Your Profile
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <h4
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 20,
            letterSpacing: '0.04em',
            fontWeight: 700,
            color: T.ink,
          }}
        >
          First Steps
        </h4>
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
              fontWeight: s.done ? 600 : 400,
              color: s.done ? T.accentGold : T.inkDim,
              transition: 'color 0.25s ease',
            }}
          >
            {s.done ? (
              <span
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                  boxShadow: '0 2px 6px -1px rgba(201,154,63,0.55)',
                }}
              >
                <Check className="h-3 w-3" strokeWidth={3} style={{ color: '#3A2A06' }} />
              </span>
            ) : (
              <Circle className="h-4 w-4 shrink-0" style={{ color: T.inkFaint }} />
            )}
            <span>{s.label}</span>
          </li>
        ))}
      </ul>

      {/* Reward note — completing First Steps grants profile points.
          Plný DOGYPT hodnotiaci systém = ďalšia session (zatiaľ len táto hláška). */}
      <div
        className="flex items-center gap-2.5"
        style={{
          marginTop: 16,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
          border: '1px solid rgba(250,244,236,0.30)',
          boxShadow: '0 6px 18px -6px rgba(201,154,63,0.6)',
        }}
      >
        <Sparkles className="h-5 w-5 shrink-0" style={{ color: '#3A2A06' }} />
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#3A2A06',
          }}
        >
          Complete all First Steps ={' '}
          <strong style={{ fontWeight: 800 }}>+10 ☥ Devotion</strong> to your profile.
        </span>
      </div>
    </div>
  );
}
