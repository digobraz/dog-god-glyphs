// Trip mini-karta — ako sa člen ukáže na výlete (payoff „premieta sa na trip",
// zadanie-profil-full-2026-07-24 ČASŤ C). Renderuje LEN polia kde
// getTier(profile,key)==='trip' + fixný základ (avatar/meno/psy).
// Reusable — v tomto kole len ako živý PREVIEW na spodku PackProfile.tsx;
// wiring do reálneho buddy-listu (PackPortal.tsx) je samostatný krok.
import { BrandIcon } from '@/components/pack/BrandIcon';
import { PACK_THEME } from '@/components/pack/packTheme';
import type { PackDogFull } from '@/hooks/usePackUser';
import {
  type CentralProfile,
  type ProfileFieldKey,
  getTier,
  deriveDefaultDogAttrs,
  ENERGY_OPTIONS,
  PERSONALITY_OPTIONS,
  SMOKE_OPTIONS,
} from './packProfile';

// Top-N personality pills shown on the trip mini-card (koncentrát osobnosti
// preview) — kept small so the card doesn't grow (zadanie-profil-koncentrat-
// 2026-07-24 ČASŤ C).
const TRIP_PREVIEW_PERSONALITY_COUNT = 5;

const T = PACK_THEME;

export function TripProfileCard({
  profile,
  name,
  avatarUrl,
  dogs,
  packNumber,
}: {
  profile: CentralProfile;
  name: string;
  avatarUrl?: string | null;
  dogs: PackDogFull[];
  packNumber?: number; // ak nie je v scope (napr. mock/no-auth), vynechá sa gracefully
}) {
  const { human } = profile;
  const isTrip = (key: ProfileFieldKey) => getTier(profile, key) === 'trip';

  // Koncentrát osobnosti — top few pills + Smoke Y/N (zadanie-profil-
  // koncentrat-2026-07-24 ČASŤ C, replaces the old interests/personType/
  // smoking(4) read). `personality` stále nemá tier (žiadny ProfileFieldKey
  // záznam) → zobrazuje sa vždy, keď je vyplnené, ako blok psov nižšie.
  // `smoke` tier UŽ MÁ (opravené 2026-07-26 — predtým tier 'trip' sedel na
  // nepoužívanom poli `smoking`, takže fajčenie sa nedalo skryť).
  const personalityLabels = human.personality
    .slice(0, TRIP_PREVIEW_PERSONALITY_COUNT)
    .map((tag) => {
      const opt = PERSONALITY_OPTIONS.find((o) => o.value === tag);
      return opt ? `${opt.emoji ?? ''} ${opt.labelEN}`.trim() : undefined;
    })
    .filter((v): v is string => Boolean(v));
  const smokeOpt = human.smoke && isTrip('smoke') ? SMOKE_OPTIONS.find((o) => o.value === human.smoke) : undefined;
  const smokeLabel = smokeOpt ? `Smoke: ${smokeOpt.emoji ?? ''} ${smokeOpt.labelEN}`.replace('  ', ' ') : undefined;
  const languageLabels = isTrip('languages') ? human.languages : [];

  const tripPills = [...personalityLabels, smokeLabel, ...languageLabels]
    .filter((v): v is string => Boolean(v));

  const initial = (name?.[0] || 'D').toUpperCase();
  const hasAvatar = !!avatarUrl;

  return (
    <div
      style={{
        background: T.cardSoft,
        border: `1px solid ${T.hairline}`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      {/* header — avatar + name + pack# */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center justify-center overflow-hidden shrink-0"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: T.bg,
            border: `2px solid ${T.accentGold}`,
          }}
        >
          {hasAvatar ? (
            <img src={avatarUrl!} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: T.inkDim }}>
              {initial}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: T.ink }}>
            {name || 'A Dogyptian'}
          </div>
          {packNumber != null && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.inkFaint }}>
              Dogyptian #{packNumber}
            </div>
          )}
        </div>
      </div>

      {/* psy — meno + energy + size + goodWith(dogs) */}
      {dogs.length > 0 && (
        <div className="flex flex-col gap-2" style={{ marginTop: 14 }}>
          {dogs.map((d) => {
            const attrs = profile.dogs[d.id] ?? deriveDefaultDogAttrs(d.id);
            const energyLabel = ENERGY_OPTIONS.find((o) => o.value === attrs.energy)?.labelEN;
            const goodWithDogs = attrs.goodWith.includes('dogs');
            return (
              <div
                key={d.id}
                className="flex items-center gap-2 flex-wrap"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkDim }}
              >
                <BrandIcon name="paw" size={13} tint="dim" />
                <strong style={{ color: T.ink, fontWeight: 600 }}>{d.dog_name || 'Unnamed'}</strong>
                {energyLabel && <span>· {energyLabel}</span>}
                {attrs.sizeClass && <span>· {attrs.sizeClass}</span>}
                <span>· {goodWithDogs ? 'good with dogs' : 'prefers space'}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* trip-tier pilulky */}
      {tripPills.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5"
          style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.hairline}` }}
        >
          {tripPills.map((label, i) => (
            <span
              key={`${label}-${i}`}
              style={{
                background: T.bg,
                border: `1px solid ${T.hairline}`,
                borderRadius: 999,
                padding: '4px 10px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 11.5,
                color: T.inkDim,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
