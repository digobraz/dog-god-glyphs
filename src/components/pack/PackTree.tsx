import { Link } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { PACK_THEME } from './PackLayout';
import heroglyphFrame from '@/assets/heroglyph-frame.svg';

const T = PACK_THEME;

interface DogNode {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_code: string | null;
  breed: string | null;
  pack_number?: number | null;
}

interface PackTreeProps {
  ownerAvatarUrl: string | null;
  ownerInitial: string;
  dogs: DogNode[];
}

export function PackTree({ ownerAvatarUrl, ownerInitial, dogs }: PackTreeProps) {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        borderRadius: 24,
        padding: '26px 22px 22px',
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 20px 50px -25px rgba(31, 26, 14, 0.18)',
        position: 'relative',
      }}
    >
      <div
        className="text-center"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.34em',
          textTransform: 'uppercase',
          color: T.inkDim,
          marginBottom: 18,
        }}
      >
        My Pack
      </div>

      <div className="flex flex-col items-center">
        {/* Owner node */}
        <OwnerNode avatarUrl={ownerAvatarUrl} initial={ownerInitial} />

        {/* Tree connector + dog rows */}
        {dogs.length === 0 ? (
          <>
            <Connector />
            <AddDogButton label="Forge your first heroglyph" />
          </>
        ) : (
          <>
            {dogs.map((d, i) => (
              <div key={d.id} className="flex flex-col items-center w-full">
                <Connector />
                <DogRow dog={d} isLast={i === dogs.length - 1} />
              </div>
            ))}
            <Connector dashed />
            <AddDogButton label="Add another" small />
          </>
        )}
      </div>
    </section>
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

function Connector({ dashed }: { dashed?: boolean }) {
  return (
    <div
      style={{
        width: 2,
        height: 22,
        background: dashed
          ? `repeating-linear-gradient(to bottom, ${T.border} 0 4px, transparent 4px 8px)`
          : T.border,
      }}
    />
  );
}

function DogRow({ dog }: { dog: DogNode; isLast: boolean }) {
  const name = (dog.dog_name || 'Unnamed').toUpperCase();
  const founder = dog.pack_number ? `#${String(dog.pack_number).padStart(5, '0')}` : null;

  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="group flex items-center gap-4 w-full"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 18,
        padding: '12px 14px',
        textDecoration: 'none',
        color: T.ink,
        boxShadow: '0 6px 18px -10px rgba(31, 26, 14, 0.16)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Dog circle photo */}
      <div
        className="shrink-0"
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: T.bg,
          overflow: 'hidden',
          border: `1px solid ${T.hairline}`,
          position: 'relative',
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
            style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.2em' }}
          >
            NO PHOTO
          </div>
        )}
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: T.ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div
          className="flex items-center gap-2 mt-1"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.16em',
            color: T.inkDim,
            textTransform: 'uppercase',
          }}
        >
          {founder && <span>{founder}</span>}
          {founder && dog.breed && <span style={{ color: T.inkFaint }}>·</span>}
          {dog.breed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dog.breed}</span>}
        </div>
      </div>

      {/* Heroglyph frame icon */}
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 44,
          height: 56,
          borderRadius: 8,
          background: T.bg,
          border: `1px solid ${T.hairline}`,
          padding: 6,
        }}
        title="Heroglyph"
      >
        <img
          src={heroglyphFrame}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'brightness(0) saturate(1) opacity(0.75)',
          }}
        />
      </div>

      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: T.inkFaint }} />
    </Link>
  );
}

function AddDogButton({ label, small }: { label: string; small?: boolean }) {
  return (
    <Link
      to="/heroglyph/name"
      className="inline-flex items-center gap-2"
      style={{
        background: small ? 'transparent' : T.ink,
        color: small ? T.ink : T.card,
        border: small ? `1px solid ${T.border}` : 'none',
        padding: small ? '10px 18px' : '14px 22px',
        borderRadius: 999,
        fontFamily: "'Cinzel', serif",
        fontSize: small ? 10 : 11,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      <Plus className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </Link>
  );
}
