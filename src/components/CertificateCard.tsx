import { forwardRef } from 'react';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';

interface CertificateCardProps {
  dogName: string;
  ownerName: string;
  photoUrl?: string;
  heroglyphCode: string;
  certNumber: string;
  issuedDate: string;
}

export const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(
  ({ dogName, ownerName, photoUrl, heroglyphCode, certNumber, issuedDate }, ref) => {
    const gold = '#c9922a';
    const goldDark = '#8a5c10';
    const ink = '#1a0900';
    const inkLight = '#5a3a0a';
    const bgLine = 'rgba(122,80,16,0.28)';

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          position: 'relative',
          overflow: 'hidden',
          background: `
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(180,120,30,.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 35% at 50% 100%, rgba(150,100,20,.10) 0%, transparent 70%),
            linear-gradient(170deg, #f6edd8 0%, #f0e3c4 25%, #ecdbb8 55%, #f2e4c8 80%, #eee0c0 100%)
          `,
          fontFamily: "'Cinzel', serif",
          flexShrink: 0,
        }}
      >
        {/* Paper grain via SVG filter */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23f)' opacity='0.055'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
          pointerEvents: 'none',
        }} />
        {/* Edge vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'radial-gradient(ellipse 90% 95% at 50% 50%, transparent 60%, rgba(80,45,5,.28) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Outer border */}
        <div style={{ position: 'absolute', inset: 28, border: `3px solid ${goldDark}`, zIndex: 10, pointerEvents: 'none' }} />
        {/* Inner border */}
        <div style={{ position: 'absolute', inset: 40, border: `1px solid ${bgLine}`, zIndex: 10, pointerEvents: 'none' }} />

        {/* Corner ornaments */}
        {(['tl','tr','bl','br'] as const).map((pos) => (
          <svg key={pos} width="52" height="52" viewBox="0 0 52 52" fill="none"
            style={{
              position: 'absolute', zIndex: 11,
              top: pos.startsWith('t') ? 22 : undefined,
              bottom: pos.startsWith('b') ? 22 : undefined,
              left: pos.endsWith('l') ? 22 : undefined,
              right: pos.endsWith('r') ? 22 : undefined,
              transform: pos === 'tr' ? 'scaleX(-1)' : pos === 'bl' ? 'scaleY(-1)' : pos === 'br' ? 'scale(-1)' : undefined,
            }}>
            <circle cx="5" cy="5" r="4" fill={goldDark} />
            <line x1="5" y1="9" x2="5" y2="42" stroke={goldDark} strokeWidth="2.2" />
            <line x1="9" y1="5" x2="42" y2="5" stroke={goldDark} strokeWidth="2.2" />
            <line x1="5" y1="5" x2="17" y2="17" stroke={goldDark} strokeWidth="1" opacity="0.4" />
            <circle cx="42" cy="5" r="1.8" fill={goldDark} opacity="0.5" />
            <circle cx="5" cy="42" r="1.8" fill={goldDark} opacity="0.5" />
          </svg>
        ))}

        {/* CONTENT */}
        <div style={{
          position: 'relative', zIndex: 8,
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '65px 110px 70px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}>

          {/* Header */}
          <div style={{ font: `700 26px/1.2 'Cinzel', serif`, letterSpacing: '.2em', color: ink, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>
            Official Heroglyph Certificate
          </div>
          <div style={{ font: `400 18px/1.5 'IM Fell English', serif`, fontStyle: 'italic', color: inkLight, textAlign: 'center', opacity: .82, marginBottom: 16, maxWidth: 620 }}>
            This is unique, eternal connection between <strong style={{ fontStyle: 'normal' }}>DOG</strong> and human.
          </div>

          {/* Divider */}
          <Divider />

          {/* Photo */}
          <div style={{ margin: '22px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 264, height: 264, borderRadius: '50%',
              background: `conic-gradient(${gold} 0deg, #f5d97a 60deg, #8a5c10 120deg, #f0cc60 180deg, #7a4c08 240deg, #e8c060 300deg, ${gold} 360deg)`,
              padding: 5,
              boxShadow: `0 0 80px rgba(180,120,20,.4), 0 0 160px rgba(180,120,20,.12)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f0e0b0', padding: 4, overflow: 'hidden' }}>
                {photoUrl ? (
                  <img src={photoUrl} alt={dogName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', filter: 'sepia(.1) contrast(1.08) brightness(1.02)' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #d4a94a, #8a5c10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 72, color: '#f0e0b0', fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
                      {dogName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dog name */}
          <div style={{
            font: `900 88px/1 'Cinzel', serif`,
            color: ink,
            letterSpacing: '.15em',
            textAlign: 'center',
            textShadow: `2px 3px 0 rgba(120,70,0,.16), 0 0 60px rgba(180,120,20,.12)`,
            margin: '4px 0 18px',
          }}>
            {dogName.toUpperCase()}
          </div>

          <Divider style={{ marginBottom: 16 }} />

          {/* Heroglyph */}
          <div style={{ width: '100%', marginBottom: 8 }}>
            <div style={{ textAlign: 'center', font: `400 12px/1 'Cinzel', serif`, letterSpacing: '.35em', color: goldDark, textTransform: 'uppercase', marginBottom: 10, opacity: .65 }}>
              · Heroglyph ·
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <HeroglyphFrame showOwner className="" style={{ width: '100%', height: 'auto', mixBlendMode: 'multiply', filter: 'contrast(1.08) sepia(.06)', color: ink } as React.CSSProperties} />
            </div>
          </div>

          {/* Code */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, margin: '12px 0 6px' }}>
            <div style={{ font: `400 12px/1 'Cinzel', serif`, letterSpacing: '.35em', color: goldDark, textTransform: 'uppercase', opacity: .65 }}>
              Heroglyph Code
            </div>
            <div style={{
              font: `600 14px/1 'Cinzel', serif`,
              letterSpacing: '.16em',
              color: '#2d1400',
              background: 'rgba(122,80,16,.08)',
              border: `1px solid rgba(122,80,16,.26)`,
              borderRadius: 12,
              padding: '10px 32px',
              textAlign: 'center',
            }}>
              {heroglyphCode}
            </div>
          </div>

          {/* Meta 3 cols */}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', alignItems: 'center', margin: '10px 0 14px' }}>
            {[
              { lbl: 'Guardian', val: ownerName || 'Unknown' },
              null,
              { lbl: 'Certificate', val: certNumber },
              null,
              { lbl: 'Issued', val: issuedDate },
            ].map((item, i) =>
              item === null ? (
                <div key={i} style={{ background: bgLine, height: 36, width: 1 }} />
              ) : (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 12px' }}>
                  <span style={{ font: `400 12px/1 'Cinzel', serif`, letterSpacing: '.28em', color: goldDark, textTransform: 'uppercase', opacity: .65 }}>{item.lbl}</span>
                  <span style={{ font: `600 14px/1 'Cinzel', serif`, letterSpacing: '.1em', color: ink, textAlign: 'center' }}>{item.val}</span>
                </div>
              )
            )}
          </div>

          <Divider />

          {/* Bottom 3 cols */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', paddingTop: 10 }}>

              {/* Left: paw */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/images/packa.png"
                  alt="paw"
                  style={{ width: 240, height: 240, objectFit: 'contain', mixBlendMode: 'darken', filter: 'contrast(1.15) brightness(0.92)', transform: 'rotate(-16deg)' }}
                />
              </div>

              {/* Center: signature */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                <span style={{ font: `400 12px/1 'Cinzel', serif`, letterSpacing: '.28em', color: goldDark, textTransform: 'uppercase', opacity: .65 }}>Verified by</span>
                <span style={{ font: `400 12px/1 'IM Fell English', serif`, fontStyle: 'italic', color: goldDark, opacity: .75 }}>the first dogyptian</span>
                <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${goldDark}, transparent)` }} />
                <span style={{ font: `700 15px/1 'Cinzel', serif`, letterSpacing: '.2em', color: ink }}>HEKTHOR I.</span>
                <HeroglyphFrame showOwner={false} style={{ height: 36, width: 'auto', mixBlendMode: 'multiply', filter: 'contrast(1.08)', color: ink } as React.CSSProperties} />
              </div>

              {/* Right: seal */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, transform: 'translateY(-10px)' }}>
                <img
                  src="/images/peciat-dogypt.png"
                  alt="DOGYPT Seal"
                  style={{ width: 175, height: 175, objectFit: 'contain', mixBlendMode: 'multiply', transform: 'rotate(14deg)', filter: 'drop-shadow(0 4px 16px rgba(140,90,10,.25))' }}
                />
                <div style={{ font: `700 14px/1 'Cinzel', serif`, letterSpacing: '.4em', color: '#3d1f00', textTransform: 'uppercase', textAlign: 'center' }}>
                  · In Dog We Trust ·
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
);

CertificateCard.displayName = 'CertificateCard';

function Divider({ style }: { style?: React.CSSProperties }) {
  const goldDark = '#8a5c10';
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${goldDark}, transparent)` }} />
      <div style={{ width: 3, height: 3, background: goldDark, transform: 'rotate(45deg)', flexShrink: 0, opacity: .5 }} />
      <div style={{ width: 5, height: 5, background: goldDark, transform: 'rotate(45deg)', flexShrink: 0 }} />
      <div style={{ width: 3, height: 3, background: goldDark, transform: 'rotate(45deg)', flexShrink: 0, opacity: .5 }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${goldDark}, transparent)` }} />
    </div>
  );
}

export function buildHeroglyphCode(selections: Record<string, string>): string {
  const s = (key: string, len: number) => {
    const val = (selections[key] || '').replace(/-/g, '').toUpperCase();
    return val.substring(0, len).padEnd(len, 'X');
  };
  return [
    'H',
    s('dogGender', 1),
    s('dogColour', 1),
    s('dogFate', 1),
    s('dogBloodline', 1),
    s('dogShape', 2),
    s('dogCharacter1', 3),
    s('dogCharacter2', 3),
    s('ownerGender', 1),
    s('ownerChineseZodiac', 2),
    s('ownerZodiac', 3),
    s('ranking', 2),
  ].join('-');
}
