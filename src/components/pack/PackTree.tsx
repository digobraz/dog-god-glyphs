import { Link } from 'react-router-dom';
import { PACK_THEME } from './packTheme';
import { BrandIcon } from './BrandIcon';
import heroglyphFrame from '@/assets/heroglyph-frame.svg';
import { useT } from '@/i18n/LanguageContext';

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
  const t = useT();
  return (
    <section
      className="pack-card-hover h-full"
      style={{
        // Hekthor fialovo-zlatá (paywall/welcome gradient) — psy = posvätné
        background: 'var(--brand-gradient)',
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
        {t('pack.tree.title')}
      </div>

      <div className="flex flex-col items-center flex-1 justify-center">
        {/* Owner node — hidden in 2-col layout where owner sits in HeroCard */}
        {!hideOwner && <OwnerNode avatarUrl={ownerAvatarUrl} initial={ownerInitial} />}

        {/* Adaptívna hustota — 1 hero · 2-4 riadky · 5-12 mriežka foto+meno · 13+ stena len foto */}
        <DogCollection dogs={dogs} />
      </div>

      {/* Action footer — Add dog (gold, brand manuál) + Invite friend (outline) */}
      <PackActions />
    </section>
  );
}

function PrimaryDog({ dog }: { dog: DogNode }) {
  const t = useT();
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
          title={t('pack.tree.openDogProfileTitle')}
          aria-label={t('pack.tree.openDogProfileAriaLabel')}
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
          <BrandIcon name="document" size={16} tint="gold" />
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
              {t('pack.tree.noPhoto')}
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

// Adaptívna hustota podľa počtu psov — všetko v jednom rámci bez scrollu.
function DogCollection({ dogs }: { dogs: DogNode[] }) {
  const t = useT();
  if (dogs.length === 0) {
    return (
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
        {t('pack.tree.emptyState')}
      </div>
    );
  }

  const ordered = [...dogs].sort(
    (a, b) =>
      (a.pack_number ?? Number.MAX_SAFE_INTEGER) - (b.pack_number ?? Number.MAX_SAFE_INTEGER),
  );

  // 1 pes = hero karta (foto + meno + plný heroglyf)
  if (ordered.length === 1) return <PrimaryDog dog={ordered[0]} />;

  // 2–4 = plné riadky (foto + meno + # + heroglyf + ikonka)
  if (ordered.length <= 4) {
    return (
      <div className="w-full flex flex-col gap-3">
        {ordered.map((d) => (
          <DogRow key={d.id} dog={d} />
        ))}
      </div>
    );
  }

  // 5–12 = štvorcová mriežka (foto + meno + malé #)
  if (ordered.length <= 12) {
    return (
      <div className="w-full grid grid-cols-3 gap-2.5">
        {ordered.map((d) => (
          <DogGridCard key={d.id} dog={d} />
        ))}
      </div>
    );
  }

  // 13+ = stena (len foto + # v rohu)
  return (
    <div
      className="w-full grid gap-2"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))' }}
    >
      {ordered.map((d) => (
        <DogAvatar key={d.id} dog={d} />
      ))}
    </div>
  );
}

// 5–12 psov: štvorcová karta — foto + meno + malé #
function DogGridCard({ dog }: { dog: DogNode }) {
  const t = useT();
  const name = (dog.dog_name || 'Unnamed').toUpperCase();
  const founder = dog.pack_number ? `#${dog.pack_number}` : null;
  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="flex flex-col items-center pack-card-hover"
      style={{
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.cardSoft} 100%)`,
        border: `1px solid rgba(201, 154, 63, 0.30)`,
        borderRadius: 14,
        padding: '14px 8px 12px',
        textDecoration: 'none',
        boxShadow: '0 8px 22px -16px rgba(20, 8, 40, 0.5)',
      }}
    >
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: '50%',
          background: T.bg,
          overflow: 'hidden',
          border: `2px solid ${T.accentGold}`,
          boxShadow: '0 0 0 1px rgba(201, 154, 63, 0.40)',
        }}
      >
        {dog.cloudinary_main_url ? (
          <img src={dog.cloudinary_main_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 7, letterSpacing: '0.14em' }}>
            {t('pack.tree.noPhoto')}
          </div>
        )}
      </div>
      <div
        className="w-full text-center"
        style={{
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          fontSize: 12,
          fontWeight: 700,
          color: T.ink,
          marginTop: 9,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </div>
      {founder && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9.5,
            fontWeight: 700,
            color: T.accentGold,
            marginTop: 3,
            lineHeight: 1,
          }}
        >
          {founder}
        </div>
      )}
    </Link>
  );
}

// 13+ psov: stena — IBA foto (kruh). Bez #, bez mena. Tap = profil.
function DogAvatar({ dog }: { dog: DogNode }) {
  const t = useT();
  const name = (dog.dog_name || 'Unnamed').toUpperCase();
  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      title={name}
      className="relative block pack-card-hover"
      style={{
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: T.bg,
        overflow: 'hidden',
        border: `2px solid ${T.accentGold}`,
        boxShadow: '0 0 0 1px rgba(201, 154, 63, 0.35)',
        textDecoration: 'none',
      }}
    >
      {dog.cloudinary_main_url ? (
        <img src={dog.cloudinary_main_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div className="flex items-center justify-center h-full" style={{ color: T.inkFaint, fontFamily: "'Cinzel', serif", fontSize: 6, letterSpacing: '0.1em' }}>
          {t('pack.tree.noPhoto')}
        </div>
      )}
    </Link>
  );
}

function DogRow({ dog }: { dog: DogNode }) {
  const t = useT();
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
            {t('pack.tree.noPhoto')}
          </div>
        )}
      </div>

      {/* Meno + # pod menom. Mobile = bez mena (škaredý ellipsis „SK…"), len # badge
          + väčší heroglyf. Desktop drží plné meno. */}
      <div className="flex-1 min-w-0">
        <div
          className="hidden sm:block"
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: T.ink,
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </div>
        {founder && (
          <span
            className="inline-flex items-center mt-0 sm:mt-[7px]"
            style={{
              padding: '2px 9px',
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

      {/* Heroglyf — na mobile dostane uvoľnené miesto po mene (väčší), desktop drží 40px */}
      {dog.heroglyph_png_url && (
        <img
          src={dog.heroglyph_png_url}
          alt={`${name} heroglyph`}
          className="h-12 max-w-[170px] sm:h-10 sm:max-w-[132px]"
          style={{ width: 'auto', objectFit: 'contain', display: 'block', flexShrink: 0 }}
        />
      )}

      {/* Profil ikonka — rozklik celého psieho profilu */}
      <BrandIcon name="document" size={16} tint="gold" className="shrink-0" style={{ marginLeft: 2 }} />
    </Link>
  );
}

function PackActions() {
  const t = useT();
  return (
    <div className="w-full mt-5 flex flex-col sm:flex-row gap-2.5">
      <Link
        to="/entry"
        className="flex-1 inline-flex items-center justify-center gap-2"
        style={{
          // .btn-gold (brand manuál v3.2 — LOCKED)
          background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
          border: '1px solid rgba(250, 244, 236, 0.30)',
          borderRadius: 8,
          color: '#000',
          padding: '13px 16px',
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
        <BrandIcon name="plus" size={14} tint="dark" />
        {t('pack.tree.addDog')}
      </Link>

      {/* Add human member — pack roles (Pawtner / Member) prídu s appkou; teraz disabled seed.
          "Coming soon" = hover tooltip (group-hover), nie stály text. */}
      <span className="group relative flex-1">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full inline-flex items-center justify-center gap-2"
          style={{
            border: `1px dashed ${T.border}`,
            borderRadius: 8,
            background: 'transparent',
            color: T.inkDim,
            padding: '13px 16px',
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'not-allowed',
            opacity: 0.65,
            whiteSpace: 'nowrap',
          }}
        >
          <BrandIcon name="add-user" size={14} tint="dim" />
          {t('pack.tree.addHumanMember')}
        </button>

        {/* Tooltip — objaví sa keď naň ukážeš kurzorom */}
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            whiteSpace: 'nowrap',
            background: 'hsl(28 22% 16%)',
            color: 'hsl(45 60% 90%)',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.02em',
            padding: '6px 11px',
            borderRadius: 7,
            border: `1px solid ${T.hairline}`,
            boxShadow: '0 8px 22px -8px rgba(31, 26, 14, 0.6)',
            zIndex: 20,
          }}
        >
          {t('pack.tree.addHumanMemberTooltip')}
          {/* šípka (caret) smerom k tlačidlu */}
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid hsl(28 22% 16%)',
            }}
          />
        </span>
      </span>
    </div>
  );
}

function OwnerNode({ avatarUrl, initial }: { avatarUrl: string | null; initial: string }) {
  const t = useT();
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
        <img src={avatarUrl!} alt={t('pack.tree.ownerAvatarAlt')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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


