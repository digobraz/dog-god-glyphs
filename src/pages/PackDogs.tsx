import { Link } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { usePackIdentity } from '@/components/pack/usePackIdentity';
import { PACK_THEME } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';

const T = PACK_THEME;

export default function PackDogs() {
  const { dogs } = usePackIdentity();

  return (
    <PackLayout title="MY DOGS" subtitle="Every dog in your pack">
      {dogs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-2.5">
          {dogs.map((dog) => (
            <Link
              key={dog.id}
              to={`/pack/dogs/${dog.id}`}
              className="flex items-center gap-4"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: '0 6px 20px rgba(10,10,10,0.06)',
              }}
            >
              {dog.cloudinary_main_url ? (
                <img
                  src={dog.cloudinary_main_url}
                  alt={dog.dog_name || ''}
                  style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${T.accentGold}66`, flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(201,154,63,0.16)', border: `2px solid ${T.accentGold}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>🐕</div>
              )}
              <div style={{
                fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15,
                letterSpacing: '0.04em', color: T.ink, flex: 1, minWidth: 0,
              }}>
                {dog.dog_name || 'Unnamed'}
              </div>
              <span aria-hidden style={{ color: T.inkFaint, fontSize: 18, flexShrink: 0 }}>›</span>
            </Link>
          ))}
        </div>
      )}
    </PackLayout>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center text-center gap-4"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: '36px 24px',
        boxShadow: '0 8px 28px rgba(10,10,10,0.06)',
      }}
    >
      <BrandIcon name="bone" size={30} tint="dark" />
      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 14.5, lineHeight: 1.6, color: T.inkDim, margin: 0, maxWidth: 320,
      }}>
        No dog on your leash yet. Give one a heroglyph and it'll show up here.
      </p>
      <Link
        to="/heroglyph"
        style={{
          background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
          border: '1px solid rgba(250, 244, 236, 0.30)',
          borderRadius: 8,
          color: '#000',
          padding: '13px 26px',
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          boxShadow: '0 0 28px rgba(230, 158, 26, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        Get a heroglyph
      </Link>
    </div>
  );
}
