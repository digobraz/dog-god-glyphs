const goldStyle: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  fontWeight: 700,
  fontSize: 'clamp(2rem, 6vw, 4rem)',
  letterSpacing: '0.09em',
  lineHeight: 1.1,
  background: 'linear-gradient(90deg, #9A6F10 0%, #C8981A 25%, #F5D97A 50%, #C8981A 75%, #9A6F10 100%)',
  backgroundSize: '300% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'goldShine 3.5s linear infinite',
};

export function MaintenanceScreen() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        @keyframes goldShine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; }
      `}</style>
      <div style={{
        minHeight: '100dvh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', animation: 'pulse 2.5s ease-in-out infinite' }}>
          🐾
        </div>

        <h1 style={goldStyle}>DOGYPT</h1>

        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
          letterSpacing: '0.25em',
          color: '#C8981A',
          textTransform: 'uppercase',
        }}>
          We'll be back soon
        </p>

        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          color: '#888',
          maxWidth: '420px',
          lineHeight: 1.7,
        }}>
          Something great is being prepared for you and your dog.
          We're making a few improvements and will be back shortly.
        </p>

        <div style={{
          marginTop: '1rem',
          padding: '1rem 2rem',
          border: '1px solid #2a2a2a',
          borderRadius: '4px',
          color: '#555',
          fontFamily: 'Georgia, serif',
          fontSize: '0.85rem',
          letterSpacing: '0.05em',
        }}>
          dogypt.com
        </div>
      </div>
    </>
  );
}
