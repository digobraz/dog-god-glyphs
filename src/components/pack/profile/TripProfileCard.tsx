// Trip mini-karta — ako sa člen ukáže na výlete (payoff „premieta sa na trip",
// zadanie-profil-full-2026-07-24 ČASŤ C). Renderuje LEN polia kde
// getTier(profile,key)==='trip' + fixný základ (avatar/meno/psy).
// Reusable — v tomto kole len ako živý PREVIEW na spodku PackProfile.tsx;
// wiring do reálneho buddy-listu (PackMap.tsx) je samostatný krok.
import { BrandIcon } from '@/components/pack/BrandIcon';
import { useT } from '@/i18n/LanguageContext';
import { PACK_THEME } from '@/components/pack/packTheme';
import type { PackDogFull } from '@/hooks/usePackUser';
import type { PartyMember } from '@/components/pack/triplist/useTripParty';
import {
  type CentralProfile,
  type ProfileFieldKey,
  getTier,
  emptyDogAttrs,
  ENERGY_OPTIONS,
  PERSONALITY_OPTIONS,
  SMOKE_OPTIONS,
} from './packProfile';
import { useMemberProfile, memberToCentralProfile, memberDisplayName, memberAvatarUrl } from './memberProfile';

// ── Reálny člen partie (whitelist z get_trip_party — meno, pes, fotka, číslo) → props, ktoré
// táto karta žiada (issue #41: „prepoužiť TripProfileCard, nestavať druhú").
//
// ZMENA 26. 8. 2026: trip-tier polia (osobnosť/jazyky/fajčenie) o cudzom človeku UŽ ZDROJ MAJÚ.
// Do vtedy žili len v localStorage jeho vlastného prehliadača, takže karta ostávala prázdna;
// migrácia `20260826_pack_profiles.sql` ich presunula do DB a `useMemberProfile()` ich dotiahne
// podľa poradového čísla. Preto tu pribudlo `remote: true` — je to príznak „toto je CUDZÍ človek,
// dotiahni si ho", nie dáta. Vlastný profil (živý náhľad v `PackProfile.tsx`) ide bez neho a karta
// doňho nesiaha.
//
// Keď člen profil nevyplnil (alebo sa ešte nenačítal), ostáva presne to, čo bolo doteraz: meno,
// pes, fotka, číslo. Nič sa nefabrikuje.
export function partyMemberToProfileCardProps(member: PartyMember): {
  profile: CentralProfile;
  name: string;
  avatarUrl?: string | null;
  dogs: PackDogFull[];
  packNumber?: number;
  remote: true;
} {
  const dogName = member.dogName?.trim();
  return {
    profile: {
      human: { interests: [], vibes: [], languages: [], intents: [], personality: [], visibility: {} },
      dogs: {},
      updatedAt: new Date(0).toISOString(),
    },
    // Fallback text left EMPTY here on purpose — this helper is a plain function
    // (no Reactu, no useT()) so it can't translate. TripProfileCard fills in the
    // translated "A Dogyptian" fallback itself when `name` is falsy.
    name: member.ownerFirst?.trim() || '',
    // appka nemá fotku MAJITEĽA o cudzom človeku, len fotku PSA (get_trip_party whitelist) —
    // rovnaký kompromis ako .pmc-av v PartyMemberCard.tsx.
    avatarUrl: member.dogPhoto,
    dogs: dogName ? [{
      id: `party-${dogName}`,
      dog_name: dogName,
      cloudinary_main_url: member.dogPhoto,
      selections: null,
      created_at: new Date(0).toISOString(),
      pack_number: member.packNumber,
    }] : [],
    packNumber: member.packNumber ?? undefined,
    remote: true,
  };
}

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
  remote,
}: {
  profile: CentralProfile;
  name: string;
  avatarUrl?: string | null;
  dogs: PackDogFull[];
  packNumber?: number; // ak nie je v scope (napr. mock/no-auth), vynechá sa gracefully
  /** `true` = ide o CUDZIEHO člena, dotiahni jeho profil z DB podľa `packNumber`. */
  remote?: boolean;
}) {
  const t = useT();
  // Hook sa volá vždy (pravidlá hookov), ale bez `remote` dostane `undefined` a
  // nič nenačíta — vlastný profil ide výhradne z prop `profile`.
  const member = useMemberProfile(remote ? packNumber : undefined);

  // Server posiela profil UŽ OREZANÝ o skryté polia (`get_member_profiles`), takže
  // tu sa nič nefiltruje — čo prišlo, to sa smie ukázať.
  const effProfile = member ? memberToCentralProfile(member) : profile;
  // Meno a fotka ČLOVEKA — rozhoduje `memberDisplayName` / `memberAvatarUrl`, aby to bolo
  // zhodné s profilom aj s kartou partie. `name`/`avatarUrl` z výletu sú poslednou záchranou
  // (krstné meno a fotka PSA), keď o človeku ešte nič nemáme.
  const effName = remote ? memberDisplayName(member, name) : name;
  const effAvatar = remote ? memberAvatarUrl(member, avatarUrl) : avatarUrl;
  // Psy: z profilu má člen VŠETKY svoje psy, `get_trip_party` vydáva len prvého.
  const effDogs: PackDogFull[] = member && member.dogs.length
    ? member.dogs.map((d) => ({
        id: d.dogId,
        dog_name: d.name,
        cloudinary_main_url: d.photo,
        selections: null,
        created_at: new Date(0).toISOString(),
        pack_number: d.packNumber,
      }))
    : dogs;

  const { human } = effProfile;
  const isTrip = (key: ProfileFieldKey) => getTier(effProfile, key) === 'trip';

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
  // "Smoke:" prefix is local text (translated); the value itself (emoji + labelEN)
  // comes from SMOKE_OPTIONS in packProfile.ts — out of scope, stays EN (see SKIPPED).
  const smokeLabel = smokeOpt
    ? t('pack.profileCard.smokeLabel', { value: `${smokeOpt.emoji ?? ''} ${smokeOpt.labelEN}`.trim() })
    : undefined;
  const languageLabels = isTrip('languages') ? human.languages : [];

  const tripPills = [...personalityLabels, smokeLabel, ...languageLabels]
    .filter((v): v is string => Boolean(v));

  const initial = (effName?.[0] || 'D').toUpperCase();
  const hasAvatar = !!effAvatar;

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
            <img src={effAvatar!} alt={effName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: T.inkDim }}>
              {initial}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: T.ink }}>
            {effName || t('pack.profileCard.aDogyptian')}
          </div>
          {(member?.memberNumber ?? packNumber) != null && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.inkFaint }}>
              {t('pack.profileCard.dogyptianNumber', { n: member?.memberNumber ?? packNumber })}
            </div>
          )}
        </div>
      </div>

      {/* psy — meno + energy + size + goodWith(dogs) */}
      {effDogs.length > 0 && (
        <div className="flex flex-col gap-2" style={{ marginTop: 14 }}>
          {effDogs.map((d) => {
            const attrs = effProfile.dogs[d.id] ?? emptyDogAttrs(d.id);
            const energyLabel = ENERGY_OPTIONS.find((o) => o.value === attrs.energy)?.labelEN;
            const goodWithDogs = attrs.goodWith.includes('dogs');
            return (
              <div
                key={d.id}
                className="flex items-center gap-2 flex-wrap"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, color: T.inkDim }}
              >
                <BrandIcon name="paw" size={13} tint="dim" />
                <strong style={{ color: T.ink, fontWeight: 600 }}>{d.dog_name || t('pack.profileCard.unnamedDog')}</strong>
                {/* energyLabel comes from ENERGY_OPTIONS.labelEN in packProfile.ts (out of
                    scope for this pass) — stays EN, see SKIPPED in report. */}
                {energyLabel && <span>· {energyLabel}</span>}
                {attrs.sizeClass && <span>· {attrs.sizeClass}</span>}
                <span>· {goodWithDogs ? t('pack.profileCard.goodWithDogs') : t('pack.profileCard.prefersSpace')}</span>
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
