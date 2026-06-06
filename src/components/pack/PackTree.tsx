import { Link } from 'react-router-dom';
import { Plus, ScrollText } from 'lucide-react';
import { PACK_THEME } from './PackLayout';
import heroglyphFrame from '@/assets/heroglyph-frame.svg';

const T = PACK_THEME;

interface DogNode {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_code: string | null;
  heroglyph_png_url?: string | null;
  breed: string | null;
  pack_number?: number | null;
}

interface PackTreeProps {
  ownerAvatarUrl: string | null;
  ownerInitial: string;
  dogs: DogNode[];
  hideOwner?: boolean;
}

export function PackTree({ ownerAvatarUrl, ownerInitial, dogs, hideOwner }: PackTreeProps) {
  return (
    <section
      className="pack-card-hover h-full"
      style={{
        // Hekthor fialovo-zlatá (paywall/welcome gradient) — psy = posvätné
        background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
        borderRadius: 24,
        padding: '26px 22px 22px',
        border: '1px solid hsl(45 80% 60% / 0.28)',
        boxShadow: '0 20px 50px -22px rgba(40, 18, 60, 0.55)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="text-center"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '0.30em',
          textTransform: 'uppercase',
          color: 'hsl(45 75% 92%)',
          marginBottom: 20,
        }}
      >
        My Pack
      </div>

      <div className="flex flex-col items-center flex-1 justify-center">
        {/* Owner node — hidden in 2-col layout where owner sits in HeroCard */}
        {!hideOwner && <OwnerNode avatarUrl={ownerAvatarUrl} initial={ownerInitial} />}

        {/* 1 pes = hero karta · 2+ psov = kompaktný stack riadkov */}
        {dogs.length === 0 ? (
          <div
            className="text-center"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'hsl(45 70% 90% / 0.78)',
              padding: '18px 8px',
            }}
          >
            No heroglyphs yet
          </div>
        ) : dogs.length === 1 ? (
          <PrimaryDog dog={dogs[0]} />
        ) : (
          <div className="w-full flex flex-col gap-3">
            {dogs.map((d) => (
              <DogRow key={d.id} dog={d} />
            ))}
          </div>
        )}
      </div>

      {/* Action footer — Add dog (gold, brand manuál) + Invite friend (outline) */}
      <PackActions />
    </section>
  );
}

function PrimaryDog({ dog }: { dog: DogNode }) {
  const name = (dog.dog_name || 'Unnamed').toUpperCase();
  const founder = dog.pack_number ? `#${dog.pack_number}` : null;

  // Bledá karta vo fialovom bloku — foto + meno(+#) + čierny horizontálny heroglyf
  return (
    <div
      className="relative flex flex-col items-center w-full"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        border: `1px solid rgba(201, 154, 63, 0.30)`,
        borderRadius: 20,
        padding: '24px 20px',
        boxShadow: '0 16px 40px -20px rgba(20, 8, 40, 0.55)',
      }}
    >
        {/* # poradové číslo v Dogypte — badge v ľavom hornom rohu */}
        {founder && (
          <span
            className="absolute inline-flex items-center"
            style={{
              top: 14,
              left: 14,
              padding: '5px 11px',
              borderRadius: 999,
              background: 'rgba(201, 154, 63, 0.14)',
              border: '1px solid rgba(201, 154, 63, 0.50)',
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: T.accentGold,
              lineHeight: 1,
            }}
          >
            {founder}
          </span>
        )}

        {/* Profil link — ikonka vpravo hore (certifikáty / PDF / foto / protokol) */}
        <Link
          to={`/pack/dogs/${dog.id}`}
          title="Open dog profile — certificates, PDFs, photos"
          aria-label="Open dog profile"
          className="absolute inline-flex items-center justify-center"
          style={{
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(201, 154, 63, 0.12)',
            border: `1px solid rgba(201, 154, 63, 0.45)`,
            color: T.accentGold,
            textDecoration: 'none',
          }}
        >
          <ScrollText className="h-4 w-4" />
        </Link>

        {/* Foto — kruh, zlatý prsteň */}
        <div
          className="relative"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: T.bg,
            overflow: 'hidden',
            border: `2px solid ${T.accentGold}`,
            boxShadow: '0 0 0 1px rgba(201, 154, 63, 0.45), 0 8px 24px rgba(201, 154, 63, 0.28)',
          }}
        >
          {dog.cloudinary_main_url ? (
            <img
              src={dog.cloudinary_main_url}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="flex items-center justify-center h-full"
              style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.2em' }}
            >
              NO PHOTO
            </div>
          )}
        </div>

        {/* Meno — decorative Cinzel */}
        <div
          className="text-center"
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: T.ink,
            marginTop: 16,
          }}
        >
          {name}
        </div>

        {/* Heroglyf — čierny horizontálny na bledej karte */}
        <div className="flex items-center justify-center w-full" style={{ marginTop: 16 }}>
          {dog.heroglyph_png_url ? (
            <img
              src={dog.heroglyph_png_url}
              alt={`${name} heroglyph`}
              style={{ width: '100%', maxWidth: 260, height: 'auto', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <img
              src={heroglyphFrame}
              alt=""
              style={{ height: 88, width: 'auto', objectFit: 'contain', filter: 'brightness(0) opacity(0.7)' }}
            />
          )}
        </div>
      </div>
  );
}

function DogRow({ dog }: { dog: DogNode }) {
  const name = (dog.dog_name || 'Unnamed').toUpperCase();
  const founder = dog.pack_number ? `#${dog.pack_number}` : null;

  // Kompaktná bledá karta — foto + meno(+#) + heroglyf thumb + profil link. Celý riadok = link.
  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="relative flex items-center gap-3.5 w-full pack-card-hover"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        border: `1px solid rgba(201, 154, 63, 0.30)`,
        borderRadius: 16,
        padding: '13px 15px',
        boxShadow: '0 10px 26px -16px rgba(20, 8, 40, 0.5)',
        textDecoration: 'none',
      }}
    >
      {/* Foto — kruh, zlatý prsteň */}
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: T.bg,
          overflow: 'hidden',
          flexShrink: 0,
          border: `2px solid ${T.accentGold}`,
          boxShadow: '0 0 0 1px rgba(201, 154, 63, 0.40)',
        }}
      >
        {dog.cloudinary_main_url ? (
          <img
            src={dog.cloudinary_main_url}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: '0.16em' }}
          >
            NO PHOTO
          </div>
        )}
      </div>

      {/* Meno + # + heroglyf thumb */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: T.ink,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </span>
          {founder && (
            <span
              className="inline-flex items-center shrink-0"
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(201, 154, 63, 0.14)',
                border: '1px solid rgba(201, 154, 63, 0.50)',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11,
                fontWeight: 700,
                color: T.accentGold,
                lineHeight: 1,
              }}
            >
              {founder}
            </span>
          )}
        </div>
        {dog.heroglyph_png_url && (
          <img
            src={dog.heroglyph_png_url}
            alt={`${name} heroglyph`}
            style={{ height: 22, width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block', marginTop: 9 }}
          />
        )}
      </div>

      {/* Profil ikonka */}
      <ScrollText className="h-4 w-4 shrink-0" style={{ color: T.accentGold }} />
    </Link>
  );
}

function PackActions() {
  return (
    <div className="w-full mt-5">
      <Link
        to="/heroglyph"
        className="w-full inline-flex items-center justify-center gap-2"
        style={{
          // .btn-gold (brand manuál v3.2 — LOCKED)
          background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
          border: '1px solid rgba(250, 244, 236, 0.30)',
          borderRadius: 8,
          color: '#000',
          padding: '13px 16px',
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          boxShadow: '0 0 28px rgba(230, 158, 26, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Add dog
      </Link>
    </div>
  );
}

function OwnerNode({ avatarUrl, initial }: { avatarUrl: string | null; initial: string }) {
  const hasAvatar = !!avatarUrl;
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: hasAvatar ? `2px solid ${T.accentGold}` : `2px dashed ${T.border}`,
        background: hasAvatar
          ? 'transparent'
          : `linear-gradient(135deg, ${T.cardSoft} 0%, ${T.bgTop} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: hasAvatar ? '0 6px 20px rgba(201, 154, 63, 0.2)' : 'none',
      }}
    >
      {hasAvatar ? (
        <img src={avatarUrl!} alt="owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 24,
            fontWeight: 700,
            color: T.inkDim,
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}


