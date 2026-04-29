import { useState } from 'react';

const VIDEO_URL = 'https://res.cloudinary.com/dz8lolmod/video/upload/q_auto/f_auto/v1775590313/STORY-9_ajc1mz.mp4';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIrlyBAjsD7zU9OSbJfE9EuvsQLmSKFn5suJddOuOgZFCWh8qJ51UsfOj7qxVirIDR/exec';

const shineStyle: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  fontWeight: 700,
  fontSize: 'clamp(2.1rem, 6.75vw, 4.875rem)',
  letterSpacing: '0.09em',
  lineHeight: 1.1,
  margin: 0,
  background: 'linear-gradient(90deg, #9A6F10 0%, #C8981A 25%, #F5D97A 50%, #C8981A 75%, #9A6F10 100%)',
  backgroundSize: '300% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'goldShine 3.5s linear infinite',
};

export function EmailLanding() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ email }),
      });
      setSubmitted(true);
    } catch {
      setError(true);
    }
  };

  return (
    <>
      <style>{`
        @keyframes goldShine {
          0%   { background-position: 100% center; }
          100% { background-position: -100% center; }
        }
      `}</style>

      <div className="relative w-screen h-dvh overflow-hidden bg-black">
        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          src={VIDEO_URL}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 gap-10" style={{ paddingTop: '38vh' }}>

          {/* Tagline – 2 riadky */}
          <div className="text-center">
            <h1 style={shineStyle}>
              IN DOG<br />WE TRUST
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(245,240,232,0.62)',
              fontSize: 'clamp(0.85rem, 2vw, 1rem)',
              letterSpacing: '0.06em',
              marginTop: '20px',
            }}>
              Leave your email. A new era for dogs and humans is about to begin.
            </p>
          </div>

          {/* Form */}
          {submitted ? (
            <p
              style={{
                fontFamily: 'Cinzel, serif',
                color: '#C8981A',
                fontSize: '1.05rem',
                letterSpacing: '0.08em',
              }}
            >
              YOU'RE IN. WE'LL BE IN TOUCH.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap justify-center gap-3 w-full"
              style={{ maxWidth: '500px' }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: '1 1 200px',
                  padding: '13px 20px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(200,152,26,0.45)',
                  borderRadius: '4px',
                  color: '#F5F0E8',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '13px 28px',
                  background: 'transparent',
                  border: '1px solid #C8981A',
                  borderRadius: '4px',
                  color: '#C8981A',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.82rem',
                  letterSpacing: '0.2em',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#C8981A';
                  (e.currentTarget as HTMLButtonElement).style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#C8981A';
                }}
              >
                I'M IN
              </button>
              {error && (
                <p
                  className="w-full text-center"
                  style={{ color: 'rgba(245,100,100,0.8)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}
                >
                  Something went wrong. Try again.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
