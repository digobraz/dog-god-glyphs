// Read-profil majiteľa — /pack/u/:id (zadanie-profil-read-dog-2026-07-25 §3). JEDEN profil =
// MAJITEĽ (klik na psa aj človeka vedie sem, žiadny samostatný psí profil). v1 rozsah: dáta žijú
// v localStorage (CentralProfile) → funguje len pre SELF a MOCK_MEMBER_POOL členov. Reálny cudzí
// user (iný prehliadač/zariadenie) = graceful fallback, čaká na Supabase perzistenciu profilu
// (ďalší slice).
//
// D3 visibility: owner hlavička tu ukazuje len bazálne identity polia (avatar/meno/nickname/
// nationalita/pack#/badges) — ŽIADNE z nich nemá tier v ProfileFieldKey/DEFAULT_VISIBILITY, takže
// sú vždy viditeľné (rovnaké ako v TripProfileCard-e). Zámerne NEreuseujeme TripProfileCard 1:1:
// ten renderuje `trip`-tier pilulky (personality/smoke/languages) bez ohľadu na vzťah k viewerovi —
// správne pre jeho pôvodný kontext (embed NA tripe, kde je viewer trip-connected), ale nesprávne
// pre všeobecný verejný read-profil, kde viewer nemusí mať s majiteľom žiadny vzťah. Preto tu
// žiadne `trip`-tier polia nerenderujeme vôbec (viď report — spĺňa „skry trip-tier" bez potreby
// shared-trip výpočtu). Psí BIO + tagy = vždy verejné (fixné pravidlo, nie cez getTier()).
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import { usePackUser } from '@/hooks/usePackUser';
import { useProfile, deriveDefaultDogAttrs, NATIONALITY_OPTIONS } from '@/components/pack/profile/packProfile';
import { MOCK_MEMBER_POOL, computeCompletion } from '@/components/pack/packCommunity';
import { DogGalleryAccordion, type DogGalleryEntry } from '@/components/pack/profile/DogGallery';
import { readWalkedIds } from '@/components/pack/tripShared';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { flagUrl, countryISO2 } from '@/lib/countryGeo';

const T = PACK_THEME;

export default function PublicProfile() {
  const t = useT();
  const { id } = useParams<{ id: string }>();

  // Session — potrebujeme vedieť KTO sa pozerá (isSelf porovnáva session.user.id s :id).
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      const meta = (data.session?.user.user_metadata ?? {}) as Record<string, string | undefined>;
      setAvatarUrl(meta.avatar_url || meta.avatar || null);
      setFullName(meta.full_name || meta.name || '');
      setSessionChecked(true);
    });
    return () => { mounted = false; };
  }, []);

  const isSelf = sessionChecked && !!session?.user && session.user.id === id;
  const { dogs, loading: dogsLoading } = usePackUser(isSelf ? session!.user.id : null);
  const { profile } = useProfile();

  const mockMember = useMemo(() => MOCK_MEMBER_POOL.find((m) => m.id === id), [id]);

  // Aggregované badges (trips walked + NP medaily) — reálne dáta pre self (sessionStorage
  // walked-ids, per-browser), placeholder pre mock (žiadna walked-história v MockMember model).
  const selfBadges = useMemo(() => {
    if (!isSelf) return null;
    try {
      const walkedIds = readWalkedIds();
      const allTrails = [...HERO_JOURNEYS, ...HERO_TRAILS];
      const walkedTrails = allTrails.filter((tr) => walkedIds.has(tr.id));
      const npCount = computeCompletion(walkedTrails).categories.find((c) => c.key === 'parks')?.done.length ?? 0;
      return { trips: walkedTrails.length, np: npCount, walkedTrails };
    } catch {
      return null;
    }
  }, [isSelf]);

  if (!sessionChecked) {
    return (
      <PackLayout>
        <div className="flex items-center justify-center py-16" style={{ color: T.inkDim }}>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.28em', fontSize: 11 }}>
            {t('pack.dog.loading')}
          </span>
        </div>
      </PackLayout>
    );
  }

  // ── Fallback — reálny cudzí user, žiadne dáta na serveri (zámerný v1 limit, §3.4) ──
  if (!isSelf && !mockMember) {
    return (
      <PackLayout>
        <BackLink />
        <div
          className="flex flex-col items-center text-center gap-3"
          style={{
            background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
            boxShadow: T.cardShadow,
            padding: '48px 24px', marginTop: 16,
          }}
        >
          <span style={{ fontSize: 30 }}>🐾</span>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: T.inkDim, maxWidth: 340 }}>
            {t('pack.publicProfile.notPublic')}
          </p>
          <Link
            to="/pack"
            style={{
              marginTop: 8, fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: T.ink, padding: '9px 18px', border: `1px solid ${T.border}`,
              borderRadius: 999, textDecoration: 'none',
            }}
          >
            {t('pack.publicProfile.backToPack')}
          </Link>
        </div>
      </PackLayout>
    );
  }

  const human = profile?.human;
  const displayName = isSelf
    ? (human?.displayAs === 'nickname' && human?.nickname ? human.nickname : (fullName || 'A Dogyptian'))
    : (mockMember?.name ?? 'A Dogyptian');
  const headerAvatar = isSelf ? avatarUrl : (mockMember?.avatarUrl ?? null);
  const packNumber = isSelf ? (dogs[0]?.pack_number ?? null) : (mockMember?.packNumber ?? null);
  // Národnosť je VŽDY viditeľná — nedá sa skryť (Matej 2026-07-25: „nechaj
  // viditeľné furt"). Mock členovia národnosť v dátach nemajú.
  const nationality = isSelf ? (human?.nationality ?? 'SK') : null;
  const nationalityLabel = nationality ? NATIONALITY_OPTIONS.find((o) => o.value === nationality)?.labelEN : undefined;

  const dogEntries: DogGalleryEntry[] = isSelf
    ? dogs.map((d) => ({
        id: d.id,
        name: d.dog_name || 'Unnamed',
        photoUrl: d.cloudinary_main_url,
        packNumber: d.pack_number,
        attrs: profile?.dogs[d.id] ?? deriveDefaultDogAttrs(d.id),
        heroglyph: {
          gender: d.selections?.dogGender,
          colour: d.selections?.dogColour,
          bloodline: d.selections?.dogBloodline,
        },
      }))
    : mockMember
      ? [{
          id: `${mockMember.id}-dog`,
          name: mockMember.dog,
          photoUrl: mockMember.avatarUrl ?? null,
          packNumber: mockMember.packNumber,
          attrs: mockMember.attrs,
        }]
      : [];

  const loadingDogs = isSelf && dogsLoading;

  return (
    <PackLayout wide>
      <div className="flex flex-col gap-5">
        <BackLink />

        {/* Owner hlavička — avatar · meno/nickname · nationalita · pack# · badges */}
        <section
          style={{
            background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
            padding: 24, boxShadow: T.cardShadow,
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="inline-flex items-center justify-center overflow-hidden shrink-0"
              style={{ width: 72, height: 72, borderRadius: '50%', background: T.bg, border: `2px solid ${T.accentGold}` }}
            >
              {headerAvatar ? (
                <img src={headerAvatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 700, color: T.inkDim }}>
                  {(displayName?.[0] || 'D').toUpperCase()}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 19, fontWeight: 700, color: T.ink, margin: 0 }}>
                  {displayName}
                </h1>
                {nationality && (
                  <img
                    src={flagUrl(countryISO2(nationality) || 'sk', 80)}
                    alt={nationalityLabel || nationality}
                    title={nationalityLabel || nationality}
                    style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(201,154,63,0.55)' }}
                  />
                )}
              </div>
              {packNumber != null && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.inkFaint, marginTop: 3 }}>
                  Dogyptian #{packNumber}
                </div>
              )}
            </div>
            {isSelf && (
              <Link
                to="/pack/profile"
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: T.ink, padding: '8px 14px', border: `1px solid ${T.border}`, borderRadius: 999,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                {t('pack.publicProfile.editButton')}
              </Link>
            )}
          </div>

          {/* Badges — agregované (trips walked + NP medaily); mock = placeholder „—" (žiadna
              walked-história v MockMember modeli, viď report). */}
          <div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: 18, paddingTop: 16 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: T.inkFaint, display: 'block', marginBottom: 10 }}>
              {t('pack.publicProfile.badgesLabel')}
            </span>
            <div className="flex items-center gap-6">
              <BadgeStat value={selfBadges ? String(selfBadges.trips) : '—'} label="Trips" />
              <BadgeStat value={selfBadges ? String(selfBadges.np) : '—'} label="NP medals" />
            </div>
          </div>
        </section>

        {/* Moja svorka — read-only galéria (rovnaký accordion ako editor, bez edit polí) */}
        <section
          style={{
            background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
            padding: 22, boxShadow: T.cardShadow,
          }}
        >
          <div className="flex items-center gap-2.5" style={{ color: T.inkDim, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
              {t('pack.publicProfile.myPack')}
            </span>
          </div>
          {loadingDogs ? (
            <div className="flex items-center gap-2 py-2" style={{ color: T.inkFaint }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>{t('pack.dog.loading')}</span>
            </div>
          ) : (
            <DogGalleryAccordion dogs={dogEntries} editable={false} />
          )}
        </section>

        {/* Kadiaľ šli — voliteľné, vynechá sa ak nemáme dáta (mock nemá walked-históriu v1) */}
        {isSelf && selfBadges && selfBadges.walkedTrails.length > 0 && (
          <section
            style={{
              background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
              padding: 22, boxShadow: T.cardShadow,
            }}
          >
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: T.inkDim, display: 'block', marginBottom: 14 }}>
              {t('pack.publicProfile.walkedSection')}
            </span>
            <div className="flex flex-col gap-2">
              {selfBadges.walkedTrails.map((tr) => (
                <Link
                  key={tr.id}
                  to={`/pack/map/${tr.id}`}
                  className="flex items-center justify-between"
                  style={{
                    padding: '9px 12px', border: `1px solid ${T.hairline}`, borderRadius: 10,
                    textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
                  }}
                >
                  <span style={{ color: T.ink, fontWeight: 600 }}>{tr.name}</span>
                  <span style={{ color: T.inkFaint, fontSize: 11.5 }}>{tr.region} · {tr.km} km</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div style={{ height: 24 }} />
      </div>
    </PackLayout>
  );
}

function BackLink() {
  const t = useT();
  return (
    <Link
      to="/pack"
      className="inline-flex items-center gap-2"
      style={{
        fontFamily: "'Cinzel', serif", letterSpacing: '0.22em', fontSize: 11, textTransform: 'uppercase',
        color: T.inkDim, textDecoration: 'none',
      }}
    >
      <ArrowLeft className="h-3 w-3" />
      {t('pack.publicProfile.backToPack')}
    </Link>
  );
}

function BadgeStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: value === '—' ? T.inkFaint : T.accentGold }}>
        {value}
      </span>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.inkFaint, marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}
