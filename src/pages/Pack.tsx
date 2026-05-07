import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ScrollText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';

/**
 * Local Dog row type — `dogs` table is added by sub-agent #1 (Issue #13).
 * Once the migration lands and Supabase types are regenerated this can be
 * replaced with `Tables<'dogs'>` from `@/integrations/supabase/types`.
 */
interface DogRow {
  id: string;
  user_id: string | null;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_code: string | null;
  breed: string | null;
  created_at: string;
}

export default function Pack() {
  const [dogs, setDogs] = useState<DogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // We bypass typed client since `dogs` schema isn't in types.ts yet.
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              order: (col: string, opts: { ascending: boolean }) => Promise<{ data: DogRow[] | null; error: { message: string } | null }>;
            };
          };
        };
      })
        .from('dogs')
        .select('id, user_id, dog_name, cloudinary_main_url, heroglyph_code, breed, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        setError(error.message);
        setDogs([]);
      } else {
        setDogs((data ?? []) as DogRow[]);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PackLayout title="My Heroglyphs" subtitle="The Pack">
      {dogs === null && !error ? (
        <SkeletonGrid />
      ) : error ? (
        <PaperCard>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#3a1f00' }}>
            We couldn’t load your pack right now. Please try again in a moment.
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#7a4c08', marginTop: 8 }}>
            {error}
          </p>
        </PaperCard>
      ) : dogs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {dogs.map((d) => (
            <DogCard key={d.id} dog={d} />
          ))}
        </div>
      )}
    </PackLayout>
  );
}

function DogCard({ dog }: { dog: DogRow }) {
  const name = (dog.dog_name || 'Unnamed').toUpperCase();
  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="group block rounded-md border border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--papyrus)/0.04)] p-3 transition-all hover:border-[hsl(var(--gold))] hover:bg-[hsl(var(--gold)/0.05)]"
    >
      <div className="aspect-square w-full overflow-hidden rounded-md bg-[#0c0a05] border border-[hsl(var(--gold)/0.25)]">
        {dog.cloudinary_main_url ? (
          <img
            src={dog.cloudinary_main_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[hsl(var(--gold)/0.5)]">
            <ScrollText className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="mt-3 px-1">
        <div
          className="text-[hsl(var(--gold))]"
          style={{
            fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {name}
        </div>
        {dog.heroglyph_code && (
          <div
            className="mt-1 text-[hsl(var(--gold)/0.7)] truncate"
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: '0.08em',
            }}
            title={dog.heroglyph_code}
          >
            {dog.heroglyph_code}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          {dog.breed ? (
            <span
              className="text-[hsl(var(--gold)/0.6)]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 11,
                letterSpacing: '0.08em',
              }}
            >
              {dog.breed}
            </span>
          ) : (
            <span />
          )}
          <span
            className="inline-flex items-center gap-1 text-[hsl(var(--gold))]"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
            }}
          >
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <PaperCard>
      <h2
        style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#1a0900',
          marginBottom: 12,
        }}
      >
        Your Pack Is Empty
      </h2>
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#3a1f00',
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        No heroglyphs are bound to this account yet. Forge one to begin the pack.
      </p>
      <Link
        to="/heroglyph/name"
        className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--gold))] px-5 py-3 text-black hover:bg-[hsl(var(--gold-light))] transition-colors"
        style={{
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.22em',
          fontSize: 12,
          textTransform: 'uppercase',
          fontWeight: 700,
          borderRadius: 8,
        }}
      >
        Forge Heroglyph
        <ArrowRight className="h-3 w-3" />
      </Link>
    </PaperCard>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-md border border-[hsl(var(--gold)/0.2)] bg-[hsl(var(--gold)/0.02)] p-3 animate-pulse"
        >
          <div className="aspect-square w-full rounded-md bg-[hsl(var(--gold)/0.06)]" />
          <div className="mt-3 h-4 w-2/3 rounded bg-[hsl(var(--gold)/0.1)]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[hsl(var(--gold)/0.07)]" />
        </div>
      ))}
    </div>
  );
}

function PaperCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="papyrus-bg mx-auto max-w-xl rounded-md border border-[hsl(var(--gold)/0.5)] p-6 md:p-8"
      style={{ borderRadius: 8 }}
    >
      {children}
    </div>
  );
}
