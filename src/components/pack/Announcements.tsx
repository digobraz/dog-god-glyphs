import { announcements, type Announcement } from '@/data/announcements';
import { Megaphone, Shield, CalendarDays } from 'lucide-react';
import { PACK_THEME } from './PackLayout';

const T = PACK_THEME;

function iconFor(kind?: Announcement['kind']) {
  if (kind === 'security') return Shield;
  if (kind === 'event') return CalendarDays;
  return Megaphone;
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

export function Announcements() {
  if (!announcements.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: T.inkDim,
        }}
      >
        From the Temple
      </div>
      {announcements.map((a, i) => {
        const Icon = iconFor(a.kind);
        return (
          <article
            key={`${a.date}-${i}`}
            style={{
              background: T.card,
              border: `1px solid ${T.hairline}`,
              borderRadius: 16,
              padding: 18,
              boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
            }}
          >
            <header className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4" style={{ color: T.inkDim }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  color: T.inkDim,
                  textTransform: 'uppercase',
                }}
              >
                {fmtDate(a.date)}
              </span>
            </header>
            <h4
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 17,
                letterSpacing: '0.04em',
                color: T.ink,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              {a.title}
            </h4>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                lineHeight: 1.55,
                color: 'rgba(10, 10, 10, 0.72)',
              }}
            >
              {a.body}
            </p>
          </article>
        );
      })}
    </div>
  );
}
