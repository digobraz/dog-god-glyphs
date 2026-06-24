import { quoteForDay } from '@/data/dailyQuotes';
import { useT } from '@/i18n/LanguageContext';

const GOLD = '#C99A3F';

export function VerseOfTheDay() {
  const t = useT();
  // 365-day curated calendar — same quote all day, rotates at midnight, holiday-anchored.
  const verse = quoteForDay();
  if (!verse) return null;

  return (
    <section
      aria-label={t('pack.verse.ariaLabel')}
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
        {t('pack.verse.eyebrow')}
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
          {verse.author || t('pack.verse.unknownAuthor')}
        </span>
        <span aria-hidden style={{ width: 28, height: 1, background: GOLD, opacity: 0.55 }} />
      </div>
    </section>
  );
}
