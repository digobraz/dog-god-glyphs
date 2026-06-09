import { useEffect, useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

const EDGE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/submit-app-vote';

export function AppVoteCard({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              maybeSingle: () => Promise<{ data: { user_id: string } | null }>;
            };
          };
        };
      })
        .from('app_votes')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (mounted && data) setVoted(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleVote = async () => {
    if (voted || busy) return;
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setBusy(false);
        return;
      }
      const res = await fetch(EDGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
        },
        body: JSON.stringify({}),
      });
      const j = await res.json();
      if (res.ok) {
        setVoted(true);
        if (typeof j.total === 'number') setCount(j.total);
      }
    } catch {
      // silent
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      style={{
        background: T.ink,
        color: T.card,
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 20px 60px rgba(10,10,10,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* faint glow accent */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,237,216,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="flex items-center gap-2 relative"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(245, 237, 216, 0.6)',
        }}
      >
        <Sparkles className="h-3 w-3" />
        Coming soon
      </div>

      <h3
        className="mt-2 relative"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1.1,
        }}
      >
        DOGYPT App
      </h3>
      <p
        className="mt-2 relative"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          lineHeight: 1.55,
          color: 'rgba(245, 237, 216, 0.78)',
        }}
      >
        iOS &amp; Android. Heroglyph in your pocket, the pack feed, Constitution updates.
      </p>

      <button
        type="button"
        onClick={handleVote}
        disabled={voted || busy}
        className="mt-5 inline-flex items-center justify-center gap-2 w-full relative"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 12,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          fontWeight: 700,
          padding: '14px 18px',
          borderRadius: 12,
          border: voted ? `1px solid rgba(245, 237, 216, 0.3)` : 'none',
          background: voted ? 'transparent' : T.card,
          color: voted ? 'rgba(245, 237, 216, 0.65)' : T.ink,
          cursor: voted ? 'default' : busy ? 'progress' : 'pointer',
          opacity: busy ? 0.6 : 1,
          transition: 'all 0.15s',
        }}
      >
        {voted ? (
          <>
            <Check className="h-3.5 w-3.5" />
            You're in
          </>
        ) : (
          <>
            I want this
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div
        className="mt-3 text-center relative"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: '0.16em',
          color: 'rgba(245, 237, 216, 0.55)',
        }}
      >
        <span style={{ color: T.card, fontWeight: 700, fontSize: 13 }}>
          {count.toLocaleString('en-US')}
        </span>{' '}
        dogyptian{count === 1 ? '' : 's'} voted
      </div>
    </article>
  );
}
