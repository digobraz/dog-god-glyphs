import { useEffect, useState } from 'react';
import { Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout, PACK_THEME } from '@/components/pack/PackLayout';
import { HeroCard } from '@/components/pack/HeroCard';
import { PackTree } from '@/components/pack/PackTree';
import { StatTicker } from '@/components/pack/StatTicker';
import { FeatureSurveyCard } from '@/components/pack/FeatureSurveyCard';
import { TopCountries } from '@/components/pack/TopCountries';
import { OnboardingProgress, type OnboardingStep } from '@/components/pack/OnboardingProgress';
import { Announcements } from '@/components/pack/Announcements';
import { ConstitutionCard } from '@/components/pack/ConstitutionCard';
import { PhaseCard } from '@/components/pack/PhaseCard';

const T = PACK_THEME;

const STATS_EDGE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/get-pack-stats';

interface DogRow {
  id: string;
  user_id: string | null;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  cloudinary_extras: string[] | null;
  heroglyph_code: string | null;
  breed: string | null;
  grid_message: string | null;
  stripe_session_id: string | null;
  created_at: string;
  pack_number?: number | null;
}

interface PackStats {
  total: number;
  last24h: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  appVotes: number;
  featureVotes: Record<string, number>;
}

interface UserMeta {
  name: string;
  email: string;
  avatarUrl: string | null;
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
  const [dogs, setDogs] = useState<DogRow[] | null>(null);
  const [stats, setStats] = useState<PackStats | null>(null);
  const [user, setUser] = useState<UserMeta | null>(null);
  const [featureVotes, setFeatureVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;

      const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>;
      const fullName = meta.full_name || meta.name;
      const avatarUrl = meta.avatar_url || meta.avatar || null;
      const display = firstNameFrom(u.email ?? '', fullName);
      if (mounted) setUser({ name: display, email: u.email ?? '', avatarUrl: avatarUrl ?? null });

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
        .select('id, user_id, dog_name, cloudinary_main_url, cloudinary_extras, heroglyph_code, breed, grid_message, stripe_session_id, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      const list = (data ?? []) as DogRow[];
      const sids = list.map((d) => d.stripe_session_id).filter(Boolean) as string[];
      if (sids.length) {
        const { data: pm } = await (supabase as unknown as {
          from: (t: string) => {
            select: (cols: string) => {
              in: (col: string, vals: string[]) => Promise<{ data: { stripe_session_id: string; pack_number: number }[] | null }>;
            };
          };
        })
          .from('pack_members')
          .select('stripe_session_id, pack_number')
          .in('stripe_session_id', sids);
        if (pm && mounted) {
          const map = new Map(pm.map((r) => [r.stripe_session_id, r.pack_number]));
          for (const d of list) {
            if (d.stripe_session_id) d.pack_number = map.get(d.stripe_session_id) ?? null;
          }
        }
      }
      setDogs(list);
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
    const hasMessage = list.some((d) => (d.grid_message ?? '').trim().length > 0);
    const hasExtras = list.some((d) => (d.cloudinary_extras ?? []).length > 0);
    const hasAvatar = !!user?.avatarUrl;
    return [
      { label: 'Forge your first heroglyph', done: hasDog },
      { label: 'Add your photo', done: hasAvatar },
      { label: 'Write a message on the Grid', done: hasMessage },
      { label: 'Add extra photos of your dog', done: hasExtras },
    ];
  })();

  const ownerInitial = (user?.name?.[0] || user?.email?.[0] || 'D').toUpperCase();
  const treeDogs = (dogs ?? []).map((d) => ({
    id: d.id,
    dog_name: d.dog_name,
    cloudinary_main_url: d.cloudinary_main_url,
    heroglyph_code: d.heroglyph_code,
    breed: d.breed,
    pack_number: d.pack_number ?? null,
  }));

  const tickerStats = stats
    ? {
        total: stats.total,
        last24h: stats.last24h,
        last30d: stats.last30d,
        topCountry: stats.topCountries?.[0]?.country,
      }
    : undefined;

  const founderNumber = treeDogs
    .map((d) => d.pack_number)
    .filter((n): n is number => typeof n === 'number' && n > 0)
    .sort((a, b) => a - b)[0] ?? null;

  return (
    <PackLayout wide topStrip={<StatTicker stats={tickerStats} />}>
      <PackAnimations />

      <div className="relative flex flex-col gap-6">
        {/* Ambient drifting orbs */}
        <AmbientOrbs />

        {/* Row 1 — Owner LEFT, Pack RIGHT — equal heights */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-stretch">
          {user && (
            <HeroCard
              name={user.name}
              email={user.email}
              avatarUrl={user.avatarUrl}
              founderNumber={founderNumber}
              dogCount={treeDogs.length}
            />
          )}

          {/* Mobile bond — between hero and pack */}
          <BondMarker className="md:hidden -my-2" />

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

          {/* Desktop bond — animated link between cards */}
          <BondMarker desktop className="hidden md:flex" />
        </div>

        {/* Row 2 — Phase LEFT, Survey RIGHT — equal heights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 items-stretch">
          <PhaseCard total={stats?.total ?? 0} />
          <FeatureSurveyCard votes={featureVotes} onVotesChange={setFeatureVotes} />
        </div>

        <OnboardingProgress steps={onboardingSteps} />

        <section>
          <SectionLabel>Top countries</SectionLabel>
          <TopCountries rows={stats?.topCountries ?? []} />
        </section>

        <ConstitutionCard />
        <Announcements />

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

function BondMarker({ className, desktop }: { className?: string; desktop?: boolean }) {
  if (desktop) {
    return (
      <>
        {/* Animated flow line connecting the two cards */}
        <span
          aria-hidden
          className="pointer-events-none absolute hidden md:block"
          style={{
            top: 92,
            left: 'calc(50% - 60px)',
            width: 120,
            height: 2,
            background:
              'repeating-linear-gradient(90deg, rgba(201, 154, 63, 0.75) 0 6px, transparent 6px 12px)',
            backgroundSize: '18px 100%',
            animation: 'pack-bond-flow 1.2s linear infinite',
            opacity: 0.7,
            zIndex: 1,
          }}
        />
        <span
          aria-hidden
          className={`${className ?? ''} pointer-events-none absolute left-1/2 items-center justify-center`}
          style={{
            top: 70,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `linear-gradient(135deg, #FFFBF2 0%, #F3E5BD 100%)`,
            border: `1px solid ${T.accentGold}`,
            color: T.accentGold,
            animation: 'pack-bond-pulse 3s ease-in-out infinite',
            zIndex: 2,
          }}
        >
          <Link2 className="h-4 w-4" />
        </span>
      </>
    );
  }

  return (
    <div
      aria-hidden
      className={`${className ?? ''} flex items-center justify-center gap-2 relative`}
      style={{ zIndex: 2 }}
    >
      <span
        style={{
          flex: 1,
          maxWidth: 80,
          height: 2,
          background:
            'repeating-linear-gradient(90deg, rgba(201, 154, 63, 0.7) 0 5px, transparent 5px 10px)',
          backgroundSize: '15px 100%',
          animation: 'pack-bond-flow 1s linear infinite',
        }}
      />
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: `linear-gradient(135deg, #FFFBF2 0%, #F3E5BD 100%)`,
          border: `1px solid ${T.accentGold}`,
          color: T.accentGold,
          animation: 'pack-breathe 3s ease-in-out infinite',
          boxShadow: '0 0 22px rgba(201, 154, 63, 0.35)',
        }}
      >
        <Link2 className="h-4 w-4" />
      </span>
      <span
        style={{
          flex: 1,
          maxWidth: 80,
          height: 2,
          background:
            'repeating-linear-gradient(90deg, rgba(201, 154, 63, 0.7) 0 5px, transparent 5px 10px)',
          backgroundSize: '15px 100%',
          animation: 'pack-bond-flow 1s linear infinite',
        }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-center mb-3"
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 11,
        letterSpacing: '0.34em',
        textTransform: 'uppercase',
        color: T.inkDim,
      }}
    >
      {children}
    </h2>
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
