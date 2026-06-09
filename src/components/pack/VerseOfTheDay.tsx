import { VERSES } from '@/data/verses';

const GOLD = '#C99A3F';

// Deterministic per calendar day — same verse all day, rotates at midnight.
function verseForToday() {
  if (VERSES.length === 0) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return VERSES[dayOfYear % VERSES.length];
}

export function VerseOfTheDay() {
  const verse = verseForToday();
  if (!verse) return null;

  return (
    <section
      aria-label="Verse of the day"
      className="relative flex flex-col items-center text-center"
      style={{ padding: 'clamp(8px, 1.8vw, 18px) 16px' }}
    >
      {/* eyebrow */}
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          color: GOLD,
          opacity: 0.9,
        }}
      >
        Verse of the day
      </span>

      {/* gold quotation glyph */}
      <span
        aria-hidden
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(30px, 5vw, 46px)',
          lineHeight: 0.6,
          color: GOLD,
          opacity: 0.5,
          margin: '6px 0 2px',
        }}
      >
        “
      </span>

      {/* the verse */}
      <blockquote
        style={{
          margin: 0,
          maxWidth: 760,
          fontFamily: "'Cinzel', serif",
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(20px, 3.4vw, 31px)',
          lineHeight: 1.4,
          letterSpacing: '0.01em',
          color: '#FAF4EC',
          textShadow: '0 2px 24px rgba(0,0,0,0.5)',
        }}
      >
        {verse.text}
      </blockquote>

      {/* attribution */}
      <div
        className="flex items-center gap-3"
        style={{ marginTop: 12 }}
      >
        <span aria-hidden style={{ width: 28, height: 1, background: GOLD, opacity: 0.55 }} />
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(250,244,236,0.62)',
          }}
        >
          The Constitution · {verse.ref}
        </span>
        <span aria-hidden style={{ width: 28, height: 1, background: GOLD, opacity: 0.55 }} />
      </div>
    </section>
  );
}
