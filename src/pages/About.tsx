import { Link } from 'react-router-dom';
import { PageNav } from '@/components/PageNav';

export default function About() {
  return (
    <div style={{ background: '#000', color: '#F2EAD6', minHeight: '100vh' }}>
      <PageNav />

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(96px, 14vh, 140px) clamp(24px, 5vw, 60px) clamp(60px, 10vh, 100px)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 'clamp(40px, 6vw, 80px)',
        flexWrap: 'wrap',
      }}>

        {/* Left — video placeholder */}
        <div style={{ flex: '1 1 360px', maxWidth: 560 }}>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            background: 'rgba(201,154,63,0.04)',
            border: '1px solid rgba(201,154,63,0.32)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(201,154,63,0.08)',
          }}>
            {/* Corner accents */}
            {(['tl','tr','bl','br'] as const).map((c) => (
              <div key={c} style={{
                position: 'absolute',
                width: 18, height: 18,
                top: c.startsWith('t') ? 12 : 'auto',
                bottom: c.startsWith('b') ? 12 : 'auto',
                left: c.endsWith('l') ? 12 : 'auto',
                right: c.endsWith('r') ? 12 : 'auto',
                borderTop: c.startsWith('t') ? `2px solid rgba(201,154,63,0.6)` : 'none',
                borderBottom: c.startsWith('b') ? `2px solid rgba(201,154,63,0.6)` : 'none',
                borderLeft: c.endsWith('l') ? `2px solid rgba(201,154,63,0.6)` : 'none',
                borderRight: c.endsWith('r') ? `2px solid rgba(201,154,63,0.6)` : 'none',
              }} />
            ))}
            {/* Play button */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: '50%',
                border: '1.5px solid rgba(201,154,63,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(201,154,63,0.08)',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M6 4L14 9L6 14V4Z" fill="rgba(201,154,63,0.8)" />
                </svg>
              </div>
              <p style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.68rem',
                letterSpacing: '0.22em',
                color: 'rgba(201,154,63,0.45)',
                textTransform: 'uppercase',
              }}>
                Coming Soon
              </p>
            </div>
          </div>
        </div>

        {/* Right — text */}
        <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(9px, 1vw, 11px)',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#C99A3F',
            marginBottom: 18,
          }}>
            Our Story
          </p>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            lineHeight: 1.1,
            color: '#FAF4EC',
            letterSpacing: '0.02em',
            marginBottom: 24,
          }}>
            Dog is God.<br />
            <span style={{ color: 'rgba(250,244,236,0.45)' }}>It started with Hektor.</span>
          </h1>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            color: 'rgba(250,244,236,0.55)',
            fontSize: 'clamp(0.85rem, 1.1vw, 0.95rem)',
            lineHeight: 1.75,
          }}>
            <p>
              In 2017, Matej adopted Hektor — a rescue dog who became the reason for everything. Together they walked 42 days and 800 km across Slovakia. That journey became a book. The book became a question: what if dog lovers worldwide shared more than photos?
            </p>
            <p>
              What if they shared a philosophy?
            </p>
            <p>
              DOGYPT is that answer. A movement built on one truth — the bond between a human and a dog is the oldest, most honest relationship on Earth. Hektor is #1. The Pack is growing. You are next.
            </p>
          </div>

          <div style={{ marginTop: 36 }}>
            <Link
              to="/heroglyph"
              style={{
                display: 'inline-block',
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
                color: '#000',
                border: '1px solid rgba(250,244,236,0.30)',
                borderRadius: 8,
                textDecoration: 'none',
                boxShadow: '0 0 40px rgba(230,158,26,0.35)',
              }}
            >
              Become Dogyptian
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
