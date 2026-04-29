import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Heart, Network, Users, Sparkles } from 'lucide-react';

const PANELS = [
  {
    label: 'The Scale',
    tagline: '500 million dogs without a home.',
    body: 'Right now, while you read this, 500 million dogs are living on streets, in shelters, or in conditions no dog should endure. Not because people don\'t care — but because care isn\'t organized.',
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=900&q=80',
    Icon: PawPrint,
  },
  {
    label: 'The Failure',
    tagline: 'The system is fragmented.',
    body: 'Shelters are overwhelmed. Donations vanish into overhead. Millions of dogs have no digital existence — no record, no identity, no story. Individual rescue is heroic, but it doesn\'t scale.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    Icon: Heart,
  },
  {
    label: 'The Identity',
    tagline: 'A dog with a name gets saved.',
    body: 'Digital identity changes everything. DOGYPT gives every dog a permanent, unique HEROGLYPH — a symbol that creates visibility, ownership, and connection across the entire world.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
    Icon: Sparkles,
  },
  {
    label: 'The Movement',
    tagline: 'Not charity. Infrastructure.',
    body: 'DOGYPT connects dog lovers, shelters, and resources into one permanent system. Every HEROGLYPH purchase funds verified shelters — transparent, traceable, and designed to last.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
    Icon: Network,
  },
  {
    label: 'Your Part',
    tagline: 'It starts with your dog.',
    body: 'Your dog\'s HEROGLYPH is the first act of a revolution 12,000 years in the making. Every legend in this timeline started with one person, one dog, one decision to honor the bond.',
    image: 'https://images.unsplash.com/photo-1534361960057-19f4434a036d?auto=format&fit=crop&w=900&q=80',
    Icon: Users,
    isCTA: true,
  },
];

export function WhySection() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Trigger stagger animation when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="why"
      ref={sectionRef}
      style={{ backgroundColor: '#0a0a0a' }}
      className="py-20 md:py-28 flex flex-col items-center"
    >
      {/* Section header */}
      <motion.div
        className="text-center mb-10 md:mb-12 px-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        <span
          className="block text-[10px] md:text-xs tracking-[0.3em] uppercase mb-3"
          style={{ fontFamily: "'Cinzel', serif", color: '#C49B42', opacity: 0.7 }}
        >
          The Challenge & The Answer
        </span>
        <h2
          className="text-2xl md:text-4xl font-black leading-tight"
          style={{ fontFamily: "'Cinzel', serif", color: '#FAF4EC' }}
        >
          Why DOGYPT exists.
        </h2>
      </motion.div>

      {/* Desktop: horizontal expanding panels */}
      {!isMobile ? (
        <div
          className="flex items-stretch overflow-hidden"
          style={{
            width: '88vw',
            maxWidth: 1000,
            height: 'clamp(300px, 42vh, 420px)',
          }}
        >
          {PANELS.map((panel, i) => {
            const { Icon } = panel;
            const isActive = i === active;
            return (
              <div
                key={i}
                onClick={() => setActive(i)}
                style={{
                  backgroundImage: `url('${panel.image}')`,
                  backgroundSize: isActive ? 'auto 100%' : 'auto 125%',
                  backgroundPosition: 'center',
                  flex: isActive ? '7 1 0%' : '1 1 0%',
                  transition: 'flex 0.7s cubic-bezier(0.4,0,0.2,1), background-size 0.7s ease, opacity 0.5s ease, transform 0.5s ease, box-shadow 0.4s ease, border-color 0.4s ease',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-50px)',
                  transitionDelay: visible ? `${i * 0.09}s` : '0s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 54,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: isActive ? '#C49B42' : '#1e1e1e',
                  boxShadow: isActive
                    ? '0 20px 60px rgba(0,0,0,0.6)'
                    : '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: isActive
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.92) 100%)'
                    : 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 100%)',
                  transition: 'background 0.7s ease',
                  pointerEvents: 'none',
                }} />

                {/* Vertical label — collapsed */}
                {!isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    fontFamily: "'Cinzel', serif",
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(250,244,236,0.35)',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}>
                    {panel.label}
                  </div>
                )}

                {/* Bottom label row */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 18,
                  display: 'flex', alignItems: 'flex-end', gap: 12,
                  padding: '0 16px', zIndex: 3,
                }}>
                  <div style={{
                    width: 38, height: 38, flexShrink: 0,
                    borderRadius: '50%',
                    background: 'rgba(196,155,66,0.15)',
                    backdropFilter: 'blur(12px)',
                    border: `1.5px solid ${isActive ? 'rgba(196,155,66,0.6)' : 'rgba(196,155,66,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.4s ease',
                  }}>
                    <Icon size={17} color="#C49B42" />
                  </div>

                  <div style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateX(0)' : 'translateX(18px)',
                    transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
                    overflow: 'hidden',
                    flex: 1,
                  }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif",
                      fontWeight: 700, fontSize: 13,
                      color: '#C49B42',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 3,
                    }}>
                      {panel.label}
                    </div>
                    <div style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 14, color: '#FAF4EC',
                      fontWeight: 600, lineHeight: 1.3,
                      marginBottom: 8,
                    }}>
                      {panel.tagline}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: 'rgba(250,244,236,0.65)',
                      lineHeight: 1.65,
                      maxWidth: 360,
                    }}>
                      {panel.body}
                    </div>
                    {panel.isCTA && (
                      <a
                        href="/name"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-block', marginTop: 14,
                          padding: '8px 22px',
                          fontFamily: "'Cinzel', serif",
                          fontSize: 11, fontWeight: 700,
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                          color: '#000', borderRadius: 2, textDecoration: 'none',
                          boxShadow: '0 0 24px hsl(39 80% 50% / 0.35)',
                        }}
                      >
                        Create Heroglyph
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile: vertical accordion */
        <div className="w-full px-4 space-y-2">
          {PANELS.map((panel, i) => {
            const { Icon } = panel;
            const isActive = i === active;
            return (
              <div
                key={i}
                onClick={() => setActive(isActive ? -1 : i)}
                style={{
                  borderRadius: 6,
                  border: `1.5px solid ${isActive ? '#C49B42' : '#1e1e1e'}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.35s ease',
                  backgroundColor: isActive ? 'rgba(196,155,66,0.06)' : 'rgba(255,255,255,0.02)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 0.07}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
                  <div style={{
                    width: 34, height: 34, flexShrink: 0,
                    borderRadius: '50%',
                    background: 'rgba(196,155,66,0.1)',
                    border: `1px solid ${isActive ? 'rgba(196,155,66,0.5)' : 'rgba(196,155,66,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'border-color 0.3s ease',
                  }}>
                    <Icon size={15} color="#C49B42" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700,
                      color: '#C49B42', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2,
                    }}>
                      {panel.label}
                    </div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: '#FAF4EC', fontWeight: 600 }}>
                      {panel.tagline}
                    </div>
                  </div>
                  <div style={{
                    color: 'rgba(196,155,66,0.4)',
                    transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: 20, lineHeight: 1,
                  }}>›</div>
                </div>

                {isActive && (
                  <div style={{ padding: '0 14px 14px 60px', borderTop: '1px solid rgba(196,155,66,0.1)', paddingTop: 12 }}>
                    <p style={{ fontSize: 13, color: 'rgba(250,244,236,0.65)', lineHeight: 1.65, margin: 0 }}>
                      {panel.body}
                    </p>
                    {panel.isCTA && (
                      <a
                        href="/name"
                        onClick={e => e.stopPropagation()}
                        style={{
                          display: 'inline-block', marginTop: 12,
                          padding: '8px 20px',
                          fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700,
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          background: 'linear-gradient(135deg, hsl(45 90% 60%), hsl(39 80% 50%))',
                          color: '#000', borderRadius: 2, textDecoration: 'none',
                        }}
                      >
                        Create Heroglyph
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dot navigation */}
      <div className="flex gap-2 mt-8">
        {PANELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 20 : 6,
              height: 6, borderRadius: 3,
              backgroundColor: i === active ? '#C49B42' : 'rgba(196,155,66,0.25)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.35s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
