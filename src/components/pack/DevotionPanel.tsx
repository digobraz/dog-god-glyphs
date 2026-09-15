import { devotionLevel } from '@/lib/devotion';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

// ─────────────────────────────────────────────────────────────────────────
// Devotion panel — profile block 1. Devotion level + progress to next level.
// (12 achievement badges removed 2026-06-22 — badge economy rebuilt on DEV
// per the new ranking sim: 3 paths Devotion/Influence/Generosity.)
// ─────────────────────────────────────────────────────────────────────────

export function DevotionPanel({ devotion }: { devotion: number }) {
  const t = useT();
  const lv = devotionLevel(devotion);

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
          {t('pack.devotion.heading')}
        </span>
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(224 50% 42%) 100%)',
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
            {t('pack.ladder.' + lv.key)}
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
            background: 'linear-gradient(90deg, hsl(224 42% 42%), hsl(45 82% 55%))',
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
            t('pack.hero.devotionToNext', { toNext: lv.toNext.toLocaleString('en-US'), nextName: t('pack.ladder.' + lv.next.key) })
          ) : (
            t('pack.hero.devotionMaxReached')
          )}
        </span>
      </div>

      {/* Badges ODSTRÁNENÉ (2026-06-22) — badge ekonomika sa stavia odznova na DEV
          podľa nového ranking sim (3 cesty: Devotion/Influence/Generosity). */}
    </div>
  );
}
