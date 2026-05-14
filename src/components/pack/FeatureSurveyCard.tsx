import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  Stethoscope,
  MapPin,
  MessageCircle,
  GraduationCap,
  Hourglass,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from './PackLayout';

const T = PACK_THEME;

const EDGE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/toggle-feature-vote';

interface Feature {
  key: string;
  title: string;
  blurb: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const FEATURES: Feature[] = [
  { key: 'vet_network', title: 'Vet network', blurb: 'Trusted clinics, reviewed by the pack.', Icon: Stethoscope },
  { key: 'dog_map', title: 'Dog-friendly map', blurb: 'Cafés, trails, beaches — verified.', Icon: MapPin },
  { key: 'pack_chat', title: 'Pack messaging', blurb: 'Local packs, walks, meetups.', Icon: MessageCircle },
  { key: 'training', title: 'Training', blurb: 'Bite-size guides from real trainers.', Icon: GraduationCap },
  { key: 'eternal', title: 'Eternal blueprint', blurb: 'Plan your dog’s long life.', Icon: Hourglass },
  { key: 'merch', title: 'Merch & accessoires', blurb: 'Heroglyph print, collars, books.', Icon: ShoppingBag },
];

interface FeatureSurveyCardProps {
  votes: Record<string, number>;
  onVotesChange?: (next: Record<string, number>) => void;
}

export function FeatureSurveyCard({ votes, onVotesChange }: FeatureSurveyCardProps) {
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>(votes ?? {});

  useEffect(() => {
    setCounts(votes ?? {});
  }, [votes]);

  // Load my votes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => Promise<{ data: { feature_key: string }[] | null }>;
          };
        };
      })
        .from('feature_votes')
        .select('feature_key')
        .eq('user_id', user.id);
      if (mounted && data) setMyVotes(new Set(data.map((r) => r.feature_key)));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalVotes = useMemo(
    () => Object.values(counts).reduce((s, n) => s + n, 0),
    [counts],
  );

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(counts)),
    [counts],
  );

  const toggle = async (key: string) => {
    if (busy) return;
    setBusy(key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(EDGE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
        },
        body: JSON.stringify({ feature_key: key }),
      });
      const j = await res.json();
      if (!res.ok) return;

      setMyVotes((prev) => {
        const next = new Set(prev);
        if (j.voted) next.add(key);
        else next.delete(key);
        return next;
      });
      const nextCounts = { ...counts, [key]: j.count ?? 0 };
      setCounts(nextCounts);
      onVotesChange?.(nextCounts);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      style={{
        background: T.ink,
        color: T.card,
        borderRadius: 24,
        padding: '0',
        boxShadow: '0 25px 60px -20px rgba(31, 26, 14, 0.55)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Hero strip — gradient + icon collage */}
      <div
        className="relative flex items-center justify-center"
        style={{
          padding: '28px 24px 22px',
          background:
            'radial-gradient(ellipse at top, rgba(201, 154, 63, 0.28) 0%, transparent 60%), linear-gradient(180deg, rgba(255,251,242,0.04) 0%, transparent 100%)',
          borderBottom: `1px solid rgba(255, 251, 242, 0.08)`,
        }}
      >
        <BrandStrip />
      </div>

      <div style={{ padding: '20px 22px 24px' }}>
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(255, 251, 242, 0.7)',
              marginBottom: 10,
            }}
          >
            <Sparkles className="h-3 w-3" />
            DOGYPT App · Coming soon
          </div>
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.15,
            }}
          >
            Tell us what you want first
          </h3>
          <p
            className="mx-auto"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: 'rgba(255, 251, 242, 0.7)',
              marginTop: 8,
              maxWidth: '40ch',
            }}
          >
            Pick everything you'd actually use. Your votes shape what ships in v1.
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {FEATURES.map((f) => {
            const c = counts[f.key] ?? 0;
            const pct = maxCount > 0 ? (c / maxCount) * 100 : 0;
            const isMine = myVotes.has(f.key);
            const isBusy = busy === f.key;
            return (
              <li key={f.key}>
                <button
                  type="button"
                  onClick={() => toggle(f.key)}
                  disabled={isBusy}
                  className="group relative w-full text-left"
                  style={{
                    background: 'rgba(255, 251, 242, 0.05)',
                    border: `1px solid ${
                      isMine ? 'rgba(201, 154, 63, 0.55)' : 'rgba(255, 251, 242, 0.1)'
                    }`,
                    borderRadius: 14,
                    padding: '12px 14px',
                    color: T.card,
                    cursor: isBusy ? 'progress' : 'pointer',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  {/* fill bar */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(90deg, ${
                        isMine ? 'rgba(201, 154, 63, 0.18)' : 'rgba(255, 251, 242, 0.06)'
                      } 0%, transparent 100%)`,
                      clipPath: `inset(0 ${100 - pct}% 0 0)`,
                      transition: 'clip-path 0.4s ease',
                    }}
                  />
                  <div className="relative flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isMine ? T.accentGold : 'rgba(255, 251, 242, 0.08)',
                        color: isMine ? T.ink : T.card,
                      }}
                    >
                      {isMine ? <Check className="h-4 w-4" /> : <f.Icon className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: T.card,
                        }}
                      >
                        {f.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 11,
                          color: 'rgba(255, 251, 242, 0.6)',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.blurb}
                      </div>
                    </div>
                    <span
                      className="shrink-0 inline-flex items-center"
                      style={{
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        fontSize: 12,
                        color: isMine ? T.accentGold : 'rgba(255, 251, 242, 0.65)',
                        minWidth: 30,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {c}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          className="mt-5 text-center"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'rgba(255, 251, 242, 0.5)',
            textTransform: 'uppercase',
          }}
        >
          {totalVotes.toLocaleString('en-US')} total votes · multi-select
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  const icons = [Stethoscope, MapPin, MessageCircle, GraduationCap, Hourglass, ShoppingBag];
  return (
    <div className="flex items-center gap-4 opacity-70">
      {icons.map((I, i) => (
        <span
          key={i}
          className="inline-flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 251, 242, 0.06)',
            color: 'rgba(255, 251, 242, 0.78)',
          }}
        >
          <I className="h-4 w-4" />
        </span>
      ))}
    </div>
  );
}
