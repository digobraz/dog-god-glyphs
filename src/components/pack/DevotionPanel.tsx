import { useState } from 'react';
import { Lock } from 'lucide-react';
import { devotionLevel } from '@/lib/devotion';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

// ─────────────────────────────────────────────────────────────────────────
// Devotion panel — profile block 1. Mirrors the HeroCard devotion display
// (level + progress + the 12 achievement badges) but browseable: tap a badge
// to read what it is / how to earn it. Badges are PLACEHOLDER (locked) until
// the badge economy is confirmed — they map to the old Constitution (dog
// races, obedience, journeys across countries…) and grant devotion ☥.
// ─────────────────────────────────────────────────────────────────────────

const BADGE_COUNT = 12;

export function DevotionPanel({ devotion }: { devotion: number }) {
  const lv = devotionLevel(devotion);
  const [openBadge, setOpenBadge] = useState<number | null>(null);

  return (
    <div>
      {/* ── Devotion level + progress ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          Devotion
        </span>
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(270 50% 42%) 100%)',
            border: '1px solid rgba(201,154,63,0.55)',
            boxShadow: '0 5px 18px -6px rgba(124,58,237,0.5)',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,246,230,0.85)',
            }}
          >
            Lvl {lv.index}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#FFF6E6',
              textShadow: '0 1px 4px rgba(0,0,0,0.35)',
            }}
          >
            {lv.name}
          </span>
        </span>
      </div>

      {/* progress bar — number + ☥ centered, fill = progress to next level */}
      <div
        style={{
          position: 'relative',
          height: 32,
          borderRadius: 999,
          overflow: 'hidden',
          background: T.hairline,
          border: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${lv.pct}%`,
            background: 'linear-gradient(90deg, hsl(270 42% 42%), hsl(45 82% 55%))',
            transition: 'width .5s ease',
          }}
        />
        <div className="relative h-full flex items-center justify-center gap-1.5">
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 16,
              fontWeight: 700,
              color: T.ink,
              lineHeight: 1,
              textShadow: '0 1px 2px rgba(250,244,236,0.5)',
            }}
          >
            {devotion.toLocaleString('en-US')}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 15,
              fontWeight: 700,
              color: T.ink,
              lineHeight: 1,
              textShadow: '0 1px 2px rgba(250,244,236,0.5)',
            }}
          >
            ☥
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: 5 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, color: T.inkDim }}>
          {lv.next ? (
            <>{lv.toNext.toLocaleString('en-US')} ☥ to {lv.next.name}</>
          ) : (
            'Highest devotion reached'
          )}
        </span>
      </div>

      {/* ── Badges — browseable, locked placeholders ──────────────────── */}
      <div className="flex items-center justify-between gap-3 mt-5 mb-2.5">
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          Badges
        </span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.inkFaint,
          }}
        >
          0 / {BADGE_COUNT}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-1.5">
        {Array.from({ length: BADGE_COUNT }).map((_, i) => {
          const active = openBadge === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenBadge(active ? null : i)}
              aria-label={`Badge ${i + 1} — locked`}
              className="flex items-center justify-center"
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                border: active ? `1px solid ${T.accentGold}` : `1px dashed ${T.border}`,
                background: active ? 'rgba(201,154,63,0.14)' : 'rgba(201,154,63,0.05)',
                color: active ? T.accentGold : T.inkFaint,
                cursor: 'pointer',
                transition: 'border-color .15s ease, background .15s ease',
              }}
            >
              <Lock style={{ width: 10, height: 10 }} />
            </button>
          );
        })}
      </div>

      {/* Detail strip — appears on tap. Honest placeholder until the badge economy lands. */}
      <div
        style={{
          background: T.cardSoft,
          border: `1px solid ${T.hairline}`,
          borderRadius: 12,
          padding: '11px 13px',
          marginTop: 12,
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: T.ink,
            marginBottom: 4,
          }}
        >
          {openBadge == null ? 'Devotion badges' : `Badge ${openBadge + 1} · Locked`}
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            lineHeight: 1.5,
            color: T.inkDim,
            margin: 0,
          }}
        >
          {openBadge == null
            ? 'Tap a badge to preview it. Badges unlock as you collect devotion — through prayers, obedience, journeys across countries and deeds for dogs in need. Coming soon.'
            : 'This badge is still locked. The full badge path — what it stands for and how to earn it — arrives with the devotion badge system. Each badge you earn grants devotion ☥.'}
        </p>
      </div>
    </div>
  );
}
