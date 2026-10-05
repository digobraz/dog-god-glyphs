// Read-profil majiteľa — /pack/u/:id (zadanie-profil-read-dog-2026-07-25 §3). JEDEN profil =
// MAJITEĽ (klik na psa aj človeka vedie sem, žiadny samostatný psí profil).
//
// 2026-08-26 — CUDZÍ ČLEN SA UŽ OTVORÍ. Do vtedy tu bol graceful fallback („profil ešte nie je
// verejný"), lebo `CentralProfile` žil v localStorage a o cudzom človeku nemala appka čo ukázať.
// Migrácia `20260826_pack_profiles.sql` to presunula do DB a stránka to číta cez
// `get_member_profiles()`. Fallback ostáva pre číslo, ktoré nič nevráti.
//
// `:id` má DVA tvary a je to zámerné:
//   • ČÍSLO (`/pack/u/12`) = poradové číslo — jediná adresa člena, ktorú appka o cudzom človeku
//     drží. `user_id` cudzieho človeka nevydáva žiadna funkcia a tento súbor ten zámok neruší.
//   • UUID = ja sám. Ostáva kvôli starým odkazom (`EventsView` posiela `memberId`) a kvôli tomu,
//     že vlastný profil sa číta z `useProfile()`, nie cez RPC.
// 2026-08-03 (Matej: „začíname so všetkým do nuly"): fiktívny MOCK_MEMBER_POOL vetva odstránená.
//
// D3 visibility: owner hlavička tu ukazuje len bazálne identity polia (avatar/meno/nickname/
// nationalita/pack#/badges) — ŽIADNE z nich nemá tier v ProfileFieldKey/DEFAULT_VISIBILITY, takže
// sú vždy viditeľné (rovnaké ako v TripProfileCard-e). Zámerne NEreuseujeme TripProfileCard 1:1:
// ten renderuje `trip`-tier pilulky (personality/smoke/languages) bez ohľadu na vzťah k viewerovi —
// správne pre jeho pôvodný kontext (embed NA tripe, kde je viewer trip-connected), ale nesprávne
// pre všeobecný verejný read-profil, kde viewer nemusí mať s majiteľom žiadny vzťah. Preto tu
// žiadne `trip`-tier polia nerenderujeme vôbec (viď report — spĺňa „skry trip-tier" bez potreby
// shared-trip výpočtu). Psí BIO + tagy = vždy verejné (fixné pravidlo, nie cez getTier()).
import { sizedUrl } from '@/services/cloudinaryService';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useT, useLang } from '@/i18n/LanguageContext';
import { countryLabel } from '@/lib/countryOptions';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME, PF_FIELD_CSS } from '@/components/pack/packTheme';
import { usePackUser } from '@/hooks/usePackUser';
import { useProfile, emptyDogAttrs } from '@/components/pack/profile/packProfile';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName, type MemberProfile } from '@/components/pack/profile/memberProfile';
import { computeCompletion } from '@/components/pack/packCommunity';
import { DogGalleryAccordion, type DogGalleryEntry } from '@/components/pack/profile/DogGallery';
import { readWalkedIds, tripPath } from '@/components/pack/tripShared';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { flagUrl, countryISO2 } from '@/lib/countryGeo';

const T = PACK_THEME;

export default function PublicProfile() {
  const t = useT();
  const { lang } = useLang();
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

  // Šípka späť v hornom rade (audit 27. 9.) — dovtedy tu bol tmavý odkaz „‹ PACK“ na tmavom
  // podklade, iný tvar než na každej inej obrazovke. Cudzí profil sa otvára z partie výletu
  // alebo podujatia, takže späť = tam, odkiaľ človek prišiel; priamy odkaz spadne na /pack.
  const navigate = useNavigate();
  const goBack = () => { if (window.history.state?.idx > 0) navigate(-1); else navigate('/pack'); };

  const isSelf = sessionChecked && !!session?.user && session.user.id === id;
  const { dogs, loading: dogsLoading } = usePackUser(isSelf ? session!.user.id : null);
  const { profile } = useProfile();

  // Cudzí člen — adresovaný poradovým číslom. `undefined` = ešte sa načítava,
  // `null` = také číslo nič nevrátilo. Rozdiel je dôležitý: bez neho by stránka
  // v prvom okamihu tvrdila „taký člen nie je" a až potom sa opravila.
  const askedNumber = id && /^\d+$/.test(id) ? Number(id) : null;
  const [member, setMember] = useState<MemberProfile | null | undefined>(undefined);
  useEffect(() => {
    if (!sessionChecked || isSelf || askedNumber == null) { setMember(null); return; }
    let alive = true;
    setMember(undefined);
    fetchMemberProfiles([askedNumber]).then((m) => { if (alive) setMember(m.get(askedNumber) ?? null); });
    return () => { alive = false; };
  }, [sessionChecked, isSelf, askedNumber]);

  // Aggregované badges (trips walked + NP medaily) — reálne dáta pre self (sessionStorage
  // walked-ids, per-browser).
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
          <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.26em', fontSize: 10 }}>
            {t('pack.dog.loading')}
          </span>
        </div>
      </PackLayout>
    );
  }

  // Cudzí člen sa ešte načítava — ticho, nie fallback. Fallback by na okamih tvrdil,
  // že taký človek neexistuje, a potom sa sám opravil.
  if (!isSelf && member === undefined) {
    return (
      <PackLayout>
        <div className="flex items-center justify-center py-16" style={{ color: T.inkDim }}>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.26em', fontSize: 10 }}>
            {t('pack.dog.loading')}
          </span>
        </div>
      </PackLayout>
    );
  }

  // ── Fallback — číslo, ktoré nič nevrátilo (neexistuje / neplatiaci / nie je členom).
  // Odpoveď je zámerne rovnaká pre všetky tri prípady, ako v `get_trip_party()`. ──
  if (!isSelf && !member) {
    return (
      <PackLayout onBack={goBack} backLabel={t('pack.publicProfile.backToPack')}>
        <div
          className="flex flex-col items-center text-center gap-3"
          style={{
            background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
            boxShadow: T.cardShadow,
            padding: '48px 24px', marginTop: 16,
          }}
        >
          {/* GUMENÉ KÁČATKO z ručného kitu (Matej 3. 10. 2026, bod 7B: najprv emoji 🐾, potom labka,
              potom *„niečo iné než packu, napr. káčatko, niečo funny čo sme ešte nepoužili"*).
              Zdroj: kit `bird-hand-drawn-animal-toy` → `/icons/pack/duck.svg`. */}
          <span aria-hidden style={{
            width: 48, height: 48, background: T.cardEdge,
            WebkitMaskImage: 'url(/icons/pack/duck.svg)', maskImage: 'url(/icons/pack/duck.svg)',
            WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskSize: 'contain', maskSize: 'contain',
            WebkitMaskPosition: 'center', maskPosition: 'center',
          }} />
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, color: T.inkDim, maxWidth: 340 }}>
            {t('pack.publicProfile.notPublic')}
          </p>
          <Link
            to="/pack"
            style={{
              marginTop: 8, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: LAPIS.ink, background: LAPIS.grad, boxShadow: LAPIS_BTN_SHADOW,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44,
              padding: '0 24px', border: 'none', borderRadius: 8, textDecoration: 'none',
            }}
          >
            {t('pack.publicProfile.backToPack')}
          </Link>
        </div>
      </PackLayout>
    );
  }

  // Odtiaľto beží JEDNA vetva renderu pre seba aj pre cudzieho člena. Dve kópie tej istej
  // stránky by sa rozišli pri prvej zmene — rovnaký dôvod, prečo `TripProfileCard` neexistuje
  // v dvoch verziách.
  const human = member ? member.human : profile?.human;
  // Meno: prezývka → meno z profilu → meno z objednávky. Pri sebe samom je meno z profilu
  // `fullName` (user_metadata), lebo vlastný profil sa nečíta cez RPC.
  const displayName = member
    ? (memberDisplayName(member) || 'A Dogyptian')
    : ((human?.displayAs === 'nickname' && human?.nickname) || fullName || 'A Dogyptian');
  const headerAvatar = member ? memberAvatarUrl(member) : avatarUrl;
  const packNumber = member ? member.memberNumber : (dogs[0]?.pack_number ?? null);
  // Národnosť je VŽDY viditeľná — nedá sa skryť (Matej 2026-07-25: „nechaj viditeľné furt").
  const nationality = human?.nationality ?? 'SK';
  // Zoznam krajín už nie je ručných 19 — názov sa preloží podľa aktívneho jazyka
  // (`lib/countryOptions.ts`). Bez toho by profil s krajinou mimo pôvodného zoznamu
  // ukázal prázdno, nie „iná krajina".
  const nationalityLabel = countryLabel(nationality, lang);

  const dogEntries: DogGalleryEntry[] = member
    ? member.dogs.map((d) => ({
        id: d.dogId,
        name: d.name || 'Unnamed',
        photoUrl: d.photo,
        packNumber: d.packNumber,
        attrs: d.attrs,
        // farba (`colour`) a línia (`bloodline`) sa o cudzom psovi nevydávajú — zobrazovací
        // blok „From the heroglyph" je zrušený a používa sa už len `gender` na farbu pilulky
        heroglyph: { gender: d.gender },
        heroglyphUrl: d.heroglyphUrl,
        dogIdValues: d.dogIdPublic,
      }))
    : dogs.map((d) => ({
        id: d.id,
        name: d.dog_name || 'Unnamed',
        photoUrl: d.cloudinary_main_url,
        packNumber: d.pack_number,
        attrs: profile?.dogs[d.id] ?? emptyDogAttrs(d.id),
        heroglyph: {
          gender: d.selections?.dogGender,
          colour: d.selections?.dogColour,
          bloodline: d.selections?.dogBloodline,
        },
      }));

  const loadingDogs = isSelf && dogsLoading;

  return (
    <PackLayout onBack={goBack} backLabel={t('pack.publicProfile.backToPack')}>
      <div className="flex flex-col gap-5">
        {/* `.pf-field`/`.pf-pill` (packTheme.ts) — DogGalleryAccordion tu renderuje
            tie isté chipy/polia ako PackProfile.tsx (editor), takže potrebujú tú
            istú CSS triedu aj na read-only profile. */}
        <style>{PF_FIELD_CSS}</style>

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
                <img src={sizedUrl(headerAvatar, 240)} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700, color: T.inkDim }}>
                  {(displayName?.[0] || 'D').toUpperCase()}
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: T.ink, margin: 0 }}>
                  {displayName}
                </h1>
                {nationality && (
                  <img
                    src={flagUrl(countryISO2(nationality) || 'sk', 80)}
                    alt={nationalityLabel || nationality}
                    title={nationalityLabel || nationality}
                    style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${PACK_THEME.border}` }}
                  />
                )}
              </div>
              {packNumber != null && (
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: T.inkFaint, marginTop: 3 }}>
                  Dogyptian #{packNumber}
                </div>
              )}
            </div>
            {isSelf && (
              <Link
                to="/pack/profile"
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: T.ink, padding: '8px 12px', border: `1px solid ${T.border}`, borderRadius: 8,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                {t('pack.publicProfile.editButton')}
              </Link>
            )}
          </div>

          {/* Badges — agregované (trips walked + NP medaily). Len keď ich máme: o cudzom
              človeku appka výlety nevydáva, takže riadok „— —“ stál na KAŽDOM cudzom profile
              ako mŕtvy údaj (audit 27. 9.). */}
          {selfBadges && (<div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: 18, paddingTop: 16 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkFaint, display: 'block', marginBottom: 10 }}>
              {t('pack.publicProfile.badgesLabel')}
            </span>
            <div className="flex items-center gap-6">
              <BadgeStat value={String(selfBadges.trips)} label={t('pack.publicProfile.trips')} />
              <BadgeStat value={String(selfBadges.np)} label={t('pack.publicProfile.npMedals')} />
            </div>
          </div>)}
        </section>

        {/* Moja svorka — read-only galéria (rovnaký accordion ako editor, bez edit polí) */}
        <section
          style={{
            background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
            padding: 24, boxShadow: T.cardShadow,
          }}
        >
          <div className="flex items-center gap-2.5" style={{ color: T.inkDim, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase' }}>
              {member ? t('pack.publicProfile.theirPack') : t('pack.publicProfile.myPack')}
            </span>
          </div>
          {loadingDogs ? (
            <div className="flex items-center gap-2 py-2" style={{ color: T.inkFaint }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12 }}>{t('pack.dog.loading')}</span>
            </div>
          ) : (
            <DogGalleryAccordion dogs={dogEntries} editable={false} />
          )}
        </section>

        {/* Kadiaľ šli — voliteľné, vynechá sa ak nemáme walked dáta (selfBadges null/prázdne) */}
        {isSelf && selfBadges && selfBadges.walkedTrails.length > 0 && (
          <section
            style={{
              background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
              padding: 24, boxShadow: T.cardShadow,
            }}
          >
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.inkDim, display: 'block', marginBottom: 14 }}>
              {t('pack.publicProfile.walkedSection')}
            </span>
            <div className="flex flex-col gap-2">
              {selfBadges.walkedTrails.map((tr) => (
                <Link
                  key={tr.id}
                  to={tripPath(tr)}
                  className="flex items-center justify-between"
                  style={{
                    padding: '8px 12px', border: `1px solid ${T.hairline}`, borderRadius: 8,
                    textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12,
                  }}
                >
                  <span style={{ color: T.ink, fontWeight: 600 }}>{tr.name}</span>
                  {/* vodná plocha (isWaterTrail) má km: '' — bez podmienky by sa vykreslilo holé
                      "region ·  km" (rovnaký audit #45 fix ako PackTripArticle/PublicProfile). */}
                  <span style={{ color: T.inkFaint, fontSize: 12 }}>{tr.region}{tr.km?.trim() ? ` · ${tr.km} km` : ''}</span>
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

function BadgeStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: value === '—' ? T.inkFaint : T.accentGold }}>
        {value}
      </span>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkFaint, marginTop: 2 }}>
        {label}
      </span>
    </div>
  );
}
