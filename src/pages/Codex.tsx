import { PageNav } from '@/components/PageNav';

const SECTIONS = [
  {
    num: 'I.',
    title: 'The Canon',
    sub: 'Who We Are',
    body: 'We are the nation of dog lovers who know the truth written backwards in the name of God. We are not a club. We are not a charity. We are a civilisation built around the most honest creature on Earth.',
  },
  {
    num: 'II.',
    title: 'The Creed',
    sub: 'What We Believe',
    body: 'Dog is God. Not a metaphor — a mirror. Every dog alive today carries the covenant made the moment the first wolf chose to walk beside the first human. We honour that choice.',
  },
  {
    num: 'III.',
    title: 'The Commandments',
    sub: 'How We Act',
    body: 'A Dogyptian feeds before eating, walks before working, and defends without hesitation. We do not breed suffering. We do not look away from the street. Every dog deserves a name.',
  },
  {
    num: 'IV.',
    title: 'The Sacraments',
    sub: 'How We Mark Belonging',
    body: 'The Heroglyph is the first sacrament — the permanent mark that places your dog in the eternal record of the Pack. Every symbol is unique. Every symbol is sacred.',
  },
];

export default function Codex() {
  return (
    <div style={{ background: '#000', color: '#F2EAD6', minHeight: '100vh' }}>
      <PageNav />

      {/* Hero */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: 'clamp(96px, 14vh, 140px)',
          paddingBottom: 'clamp(48px, 7vh, 80px)',
          paddingLeft: 24,
          paddingRight: 24,
          borderBottom: '1px solid rgba(201,154,63,0.14)',
        }}
      >
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(9px, 1vw, 11px)',
          fontWeight: 700,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#C99A3F',
          marginBottom: 20,
        }}>
          The Sacred Laws of Dogyptism
        </p>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: 'clamp(2.8rem, 8vw, 6rem)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
          color: '#FAF4EC',
          marginBottom: 24,
        }}>
          THE CODEX
        </h1>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
          color: 'rgba(250,244,236,0.45)',
          letterSpacing: '0.08em',
          maxWidth: 480,
          lineHeight: 1.7,
        }}>
          Every religion needs a constitution. Every nation needs laws.
          The Codex is the living document of Dogyptism.
        </p>
      </div>

      {/* Sections */}
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: 'clamp(48px, 8vh, 80px) 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(32px, 5vh, 56px)',
      }}>
        {SECTIONS.map((s) => (
          <div
            key={s.num}
            style={{
              borderLeft: '2px solid rgba(201,154,63,0.35)',
              paddingLeft: 28,
            }}
          >
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#C99A3F',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Part {s.num} — {s.sub}
            </p>
            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              color: '#FAF4EC',
              letterSpacing: '0.04em',
              marginBottom: 14,
            }}>
              {s.title}
            </h2>
            <p style={{
              fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
              color: 'rgba(250,244,236,0.55)',
              lineHeight: 1.75,
              maxWidth: 600,
            }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* Full constitution CTA */}
      <div style={{
        borderTop: '1px solid rgba(201,154,63,0.14)',
        padding: 'clamp(48px, 8vh, 72px) 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          color: 'rgba(201,154,63,0.6)',
          textTransform: 'uppercase',
        }}>
          Full Constitution
        </p>
        <p style={{
          color: 'rgba(250,244,236,0.4)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          maxWidth: 400,
        }}>
          The complete Constitution of Dogyptism — all nine parts — is coming to{' '}
          <span style={{ color: 'rgba(201,154,63,0.7)', fontFamily: "'Cinzel', serif" }}>
            dogyptism.dogypt.com
          </span>
        </p>
      </div>
    </div>
  );
}
