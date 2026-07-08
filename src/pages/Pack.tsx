import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import { HeroCard } from '@/components/pack/HeroCard';
import { PackSettings } from '@/components/pack/PackSettings';
import { PackTree } from '@/components/pack/PackTree';
import { FeatureSurveyCard } from '@/components/pack/FeatureSurveyCard';
import { GlobePulse } from '@/components/pack/GlobePulse';
import { FounderInvite } from '@/components/pack/FounderInvite';
import { OnboardingProgress, type OnboardingStep } from '@/components/pack/OnboardingProgress';
import { ConstitutionCard } from '@/components/pack/ConstitutionCard';
import { BuildNotice } from '@/components/pack/BuildNotice';
import { VerseOfTheDay } from '@/components/pack/VerseOfTheDay';
import { PackWizard } from '@/components/pack/PackWizard';
import { PackShareCard } from '@/components/pack/PackShareCard';
import { EDGE_BASE } from '@/lib/env';

const T = PACK_THEME;

const STATS_EDGE = `${EDGE_BASE}/get-pack-stats`;

interface DogRow {
  id: string;
  user_id: string | null;
  dog_name: string | null;
  owner_name: string | null;
  cloudinary_main_url: string | null;
  cloudinary_extras: string[] | null;
  heroglyph_code: string | null;
  heroglyph_png_url: string | null;
  share_card_url: string | null;
  breed: string | null;
  country: string | null;
  grid_message: string | null;
  stripe_session_id: string | null;
  created_at: string;
  pack_number?: number | null;
  selections?: { ownerGender?: string | null } | null;
}

interface PackStats {
  total: number;
  last24h: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  topBreeds: { breed: string; count: number }[];
  appVotes: number;
  featureVotes: Record<string, number>;
}

interface UserMeta {
  name: string;
  email: string;
  avatarUrl: string | null;
  devotion: number;
  bones: number;
}

function firstNameFrom(email: string, fullName?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const local = email.split('@')[0] || '';
  const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export default function Pack() {
  const t = useT();
  const [dogs, setDogs] = useState<DogRow[] | null>(null);
  const [stats, setStats] = useState<PackStats | null>(null);
  const [user, setUser] = useState<UserMeta | null>(null);
  const [featureVotes, setFeatureVotes] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;

      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const fullName = (meta.full_name || meta.name) as string | undefined;
      const avatarUrl = (meta.avatar_url || meta.avatar || null) as string | null;
      // DEVOTION per-user (user_metadata, set adminom/service). Nový člen = 100 (Stray).
      // BONES = affiliate currency (affiliates.points) — fetched below, not metadata.
      const devotion = Number(meta.devotion) || 100;
      const display = firstNameFrom(u.email ?? '', fullName);
      if (mounted) setUser({ name: display, email: u.email ?? '', avatarUrl: avatarUrl ?? null, devotion, bones: 0 });

      // First Steps — extra completion signals (best-effort, non-blocking).
      // "Cast your vote in Shape" → any row in feature_votes for this user.
      (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => Promise<{ data: { feature_key: string }[] | null }>;
          };
        };
      })
        .from('feature_votes')
        .select('feature_key')
        .eq('user_id', u.id)
        .then(({ data }) => { if (mounted) setHasVoted((data ?? []).length > 0); });

      // Affiliate → referral signal + BONES balance (affiliates.points).
      supabase
        .rpc('get_or_create_my_affiliate')
        .then(({ data }) => {
          const row = (data as { referral_count?: number; points?: number }[] | null)?.[0];
          if (!mounted) return;
          setHasReferral((row?.referral_count ?? 0) > 0);
          setUser((u) => (u ? { ...u, bones: Number(row?.points) || 0 } : u));
        });

      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              order: (col: string, opts: { ascending: boolean }) => Promise<{ data: DogRow[] | null }>;
            };
          };
        };
      })
        .from('dogs')
        .select('id, user_id, dog_name, owner_name, cloudinary_main_url, cloudinary_extras, heroglyph_code, heroglyph_png_url, share_card_url, breed, country, grid_message, stripe_session_id, pack_number, created_at, selections')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      // pack_number is stored directly on dogs row (seal_pack_number at payment time).
      // No pack_members lookup needed.
      setDogs((data ?? []) as DogRow[]);
    }

    async function loadStats() {
      try {
        const res = await fetch(STATS_EDGE);
        const j = (await res.json()) as PackStats;
        if (!mounted) return;
        setStats(j);
        setFeatureVotes(j.featureVotes ?? {});
      } catch {
        // best-effort
      }
    }

    load();
    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  const onboardingSteps: OnboardingStep[] = (() => {
    const list = dogs ?? [];
    const hasDog = list.length > 0;
    const hasExtras = list.some((d) => (d.cloudinary_extras ?? []).length > 0);
    const hasAvatar = !!user?.avatarUrl;
    let constitutionOpened = false;
    try { constitutionOpened = localStorage.getItem('dogypt_constitution_opened') === '1'; } catch { /* ignore */ }
    return [
      { label: t('pack.steps.forgeHeroglyph'), done: hasDog },
      { label: t('pack.steps.addPhoto'), done: hasAvatar },
      { label: t('pack.steps.addExtraPhotos'), done: hasExtras },
      { label: t('pack.steps.castVote'), done: hasVoted },
      { label: t('pack.steps.flipConstitution'), done: constitutionOpened },
      { label: t('pack.steps.inviteDogLover'), done: hasReferral },
    ];
  })();

  // When every First Step is done, credit the one-time +10 ☥ (idempotent server-side).
  const allStepsDone = onboardingSteps.every((s) => s.done);
  const firstStepsGranted = useRef(false);
  useEffect(() => {
    if (!allStepsDone || firstStepsGranted.current) return;
    firstStepsGranted.current = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${EDGE_BASE}/grant-devotion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
            apikey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ?? '',
          },
          body: JSON.stringify({ kind: 'first_steps' }),
        });
        if (res.ok) {
          const json = await res.json();
          if (typeof json?.total === 'number') {
            window.dispatchEvent(new CustomEvent('dogypt:devotion', { detail: { total: json.total } }));
          }
        }
      } catch { /* non-blocking */ }
    })();
  }, [allStepsDone]);

  const ownerInitial = (user?.name?.[0] || user?.email?.[0] || 'D').toUpperCase();
  const treeDogs = (dogs ?? []).map((d) => ({
    id: d.id,
    dog_name: d.dog_name,
    cloudinary_main_url: d.cloudinary_main_url,
    heroglyph_code: d.heroglyph_code,
    heroglyph_png_url: d.heroglyph_png_url,
    breed: d.breed,
    pack_number: d.pack_number ?? null,
  }));

  // Meno majiteľa = owner_name z primárneho psa (fallback na email-derived)
  const ownerName = (dogs ?? [])
    .map((d) => (d.owner_name ?? '').trim())
    .find((n) => n.length > 0);
  const displayName = ownerName
    ? ownerName.split(' ')[0].charAt(0).toUpperCase() + ownerName.split(' ')[0].slice(1).toLowerCase()
    : (user?.name ?? 'Dogyptian');

  // Faraón placeholder podľa pohlavia majiteľa (z heroglyph selections), keď chýba reálna fotka
  const ownerGender = (dogs ?? [])
    .map((d) => d.selections?.ownerGender)
    .find((g): g is 'man' | 'woman' => g === 'man' || g === 'woman') ?? null;

  // Krajina majiteľa = country z prvého psa s vyplnenou krajinou → pin na globe.
  const ownerCountry = (dogs ?? [])
    .map((d) => (d.country ?? '').trim())
    .find((c) => c.length > 0) ?? null;

  // Primary dog for wizard navigation (lowest pack_number, else first loaded).
  const primaryDog = (dogs ?? []).reduce<DogRow | null>((best, d) => {
    if (!best) return d;
    return (d.pack_number ?? Infinity) < (best.pack_number ?? Infinity) ? d : best;
  }, null);

  return (
    <PackLayout wide>
      <PackAnimations />
      {/* PackWizard PARKED z launchu (2026-06-22) — DEV-only, v produkčnom Lovable builde
          sa nevykreslí. NEMAZAŤ: po launchi sa vráti (možno upravený). Návrat = zmaž import.meta.env.DEV gate. */}
      {import.meta.env.DEV && (
        <PackWizard primaryDogId={primaryDog?.id ?? null} primaryDogName={primaryDog?.dog_name ?? null} />
      )}

      <div className="relative flex flex-col gap-6">
        {/* Ambient drifting orbs */}
        <AmbientOrbs />

        {/* Row 1 — Owner LEFT, Pack RIGHT — equal heights */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-stretch">
          <div id="wiz-hero" style={{ display: 'flex', flexDirection: 'column' }}>
            {user && (
              <HeroCard
                name={displayName}
                email={user.email}
                avatarUrl={user.avatarUrl}
                genderPlaceholder={ownerGender}
                devotion={user.devotion}
                bones={user.bones}
                stats={stats ? { last24h: stats.last24h, last30d: stats.last30d, total: stats.total } : null}
              />
            )}
          </div>

          <div id="wiz-pack" style={{ display: 'flex', flexDirection: 'column' }}>
            {dogs === null ? (
              <TreeSkeleton />
            ) : (
              <PackTree
                ownerAvatarUrl={user?.avatarUrl ?? null}
                ownerInitial={ownerInitial}
                dogs={treeDogs}
                hideOwner
              />
            )}
          </div>
        </div>

        {/* Share card — primary dog's ready-made social image (SHARE + DOWNLOAD) */}
        {primaryDog && (
          <PackShareCard dogName={primaryDog.dog_name} packNumber={primaryDog.pack_number ?? null} shareCardUrl={primaryDog.share_card_url} />
        )}

        {/* Sacred interlude — verse of the day from the Constitution (rotates daily) */}
        <VerseOfTheDay />

        {/* Full-width — planéta + počítadlo + TOP krajiny */}
        <div id="wiz-globe">
          <GlobePulse total={stats?.total ?? 0} topCountries={stats?.topCountries ?? []} topBreeds={stats?.topBreeds ?? []} ownerCountry={ownerCountry} />
        </div>

        {/* Row 2 — dotazník (blok 4) LEFT | Hekthor pozvánka (blok 5) RIGHT.
            Mobile: survey nad Hekthorom. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 items-stretch">
          <FeatureSurveyCard votes={featureVotes} onVotesChange={setFeatureVotes} />
          <FounderInvite />
        </div>

        {/* Row 3 — First Steps | Constitution (DOGMA) | Build notice — rovnaké výšky */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 items-stretch">
          <div id="wiz-steps" style={{ display: 'flex', flexDirection: 'column' }}>
            <OnboardingProgress steps={onboardingSteps} />
          </div>
          <ConstitutionCard />
          <BuildNotice ownerName={displayName} email={user?.email ?? null} />
        </div>

        {/* Account / settings — celý profil presunutý sem (profil stránka zrušená z live) */}
        <PackSettings />

        <div style={{ height: 32 }} />
      </div>
    </PackLayout>
  );
}

function AmbientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <span
        className="absolute"
        style={{
          top: '8%',
          left: '-6%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.16) 0%, transparent 70%)',
          filter: 'blur(8px)',
          animation: 'pack-drift-a 22s ease-in-out infinite',
        }}
      />
      <span
        className="absolute"
        style={{
          top: '35%',
          right: '-8%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.10) 0%, transparent 70%)',
          filter: 'blur(10px)',
          animation: 'pack-drift-b 28s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function PackAnimations() {
  return (
    <style>{`
      @keyframes pack-breathe {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.06); opacity: 1; }
      }
      @keyframes pack-shimmer {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(120%); }
      }
      @keyframes pack-live-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        80% { transform: scale(2.4); opacity: 0; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes pack-bond-pulse {
        0%, 100% { transform: translate(-50%, 0) scale(1); box-shadow: 0 6px 18px -6px rgba(201, 154, 63, 0.35), 0 0 0 0 rgba(201, 154, 63, 0.4); }
        50% { transform: translate(-50%, 0) scale(1.08); box-shadow: 0 6px 22px -4px rgba(201, 154, 63, 0.55), 0 0 0 8px rgba(201, 154, 63, 0); }
      }
      @keyframes pack-bond-flow {
        0% { background-position: 0 0; }
        100% { background-position: 18px 0; }
      }
      @keyframes pack-drift-a {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(40px, 30px); }
      }
      @keyframes pack-drift-b {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-50px, -40px); }
      }
      @keyframes ms-fade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pack-card-hover {
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        will-change: transform;
      }
      .pack-card-hover:hover {
        transform: translateY(-3px);
        box-shadow: 0 28px 60px -25px rgba(31, 26, 14, 0.28);
      }
    `}</style>
  );
}


function TreeSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 24,
        padding: 26,
      }}
    >
      <div
        className="mx-auto"
        style={{ width: 72, height: 72, borderRadius: '50%', background: T.bg }}
      />
      <div className="mx-auto mt-3" style={{ width: 2, height: 22, background: T.border }} />
      <div className="mt-3" style={{ height: 76, background: T.bg, borderRadius: 18 }} />
    </div>
  );
}
