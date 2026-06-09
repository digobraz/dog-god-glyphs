import { ScrollText, ArrowUpRight } from 'lucide-react';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

export function ConstitutionCard() {
  return (
    <a
      href="https://dogyptism.dogypt.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full transition-all"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
        color: T.ink,
        textDecoration: 'none',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
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
            <ScrollText className="h-3.5 w-3.5" />
            Constitution
          </div>
          <h4
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 20,
              letterSpacing: '0.04em',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Read the Dogyptism
          </h4>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              lineHeight: 1.5,
              color: 'rgba(10, 10, 10, 0.7)',
            }}
          >
            The dog religion — synkretism, satire, and the sacred ordinary.
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0" style={{ opacity: 0.7 }} />
      </div>
    </a>
  );
}
