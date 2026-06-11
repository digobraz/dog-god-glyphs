// ============================================================================
// VisionRoadmap — "What we're building, together". The last block of the page.
// Six roadmap projects, each with a want / not-for-me vote that persists to
// Supabase (save-vision-vote). Voting all six grants a one-time +5 ☥ bonus
// (grant-devotion) and completes the "Discover the vision" First Step.
//
// Lives on /pack, /vision and the homepage grid. Emoji icons are placeholders —
// KIE-generated photos land later.
// ============================================================================
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import './VisionRoadmap.css';

const SAVE_VOTE = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/save-vision-vote';
const GRANT = 'https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/grant-devotion';
const APIKEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ?? '';

interface Tile { key: string; icon: string; name: string; status: string; desc: string; }

const TILES: Tile[] = [
  { key: 'dogyptland', icon: '🏛️', name: 'Dogyptland', status: 'Dreaming', desc: 'A grass pyramid — a Disneyland for dogs.' },
  { key: 'longevity', icon: '🧬', name: 'Longevity Research', status: 'In research', desc: 'Funding science to give our dogs more years.' },
  { key: 'shelters', icon: '🏠', name: 'Modern Shelters', status: 'Building', desc: 'Rebuilding shelters into homes worthy of gods.' },
  { key: 'map', icon: '🗺️', name: 'The Living Map', status: 'Coming', desc: 'Every Dogyptian dog on one world map.' },
  { key: 'collar', icon: '📡', name: 'Heroglyph Collar', status: 'Designing', desc: "Sacred tech — your dog's symbol, worn. GPS inside." },
  { key: 'firstaid', icon: '⛑️', name: 'First Aid Network', status: 'Dreaming', desc: 'Help for any dog in need, anywhere.' },
];

type Counts = Record<string, { want: number; no: number }>;

interface Props {
  /** Fires with how many of the 6 the user has voted on (for the First Steps task). */
  onVotedCountChange?: (n: number) => void;
}

export function VisionRoadmap({ onVotedCountChange }: Props) {
  const [mine, setMine] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<Counts>({});
  const [busy, setBusy] = useState<string | null>(null);
  const bonusDone = useState({ v: false })[0]; // ref-like guard, survives re-render

  const voted = Object.keys(mine).length;

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
      apikey: APIKEY,
    };
  }

  // Pre-fill on mount.
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const res = await fetch(SAVE_VOTE, { method: 'POST', headers: await authHeaders(), body: '{}' });
        if (!res.ok) return;
        const j = await res.json();
        if (!on) return;
        setMine(j.mine ?? {});
        setCounts(j.counts ?? {});
        onVotedCountChange?.(Object.keys(j.mine ?? {}).length);
        if (Object.keys(j.mine ?? {}).length >= TILES.length) bonusDone.v = true;
      } catch { /* offline / not signed in — leave empty */ }
    })();
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function grantBonus() {
    if (bonusDone.v) return;
    bonusDone.v = true;
    try {
      await fetch(GRANT, { method: 'POST', headers: await authHeaders(), body: JSON.stringify({ kind: 'vision_bonus' }) });
    } catch { /* non-blocking */ }
  }

  async function vote(key: string, v: 'want' | 'no') {
    if (busy) return;
    setBusy(key);
    const nextMine = { ...mine, [key]: v };
    setMine(nextMine); // optimistic
    try {
      const res = await fetch(SAVE_VOTE, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ vision_key: key, vote: v }),
      });
      if (res.ok) {
        const j = await res.json();
        setMine(j.mine ?? nextMine);
        setCounts(j.counts ?? counts);
        const n = Object.keys(j.mine ?? nextMine).length;
        onVotedCountChange?.(n);
        if (n >= TILES.length) grantBonus();
      }
    } catch { /* keep optimistic state */ } finally {
      setBusy(null);
    }
  }

  const allVoted = voted >= TILES.length;

  return (
    <section className="vroad" aria-label="What we're building together">
      <div className="vroad-head">
        <h3>What we're building — together</h3>
        <p>Tell us what you want to see. Your vote counts — and it's the last of your First Steps.</p>
      </div>

      <div className="vroad-tiles">
        {TILES.map((t) => {
          const c = counts[t.key] ?? { want: 0, no: 0 };
          const my = mine[t.key];
          return (
            <div className="vtile" key={t.key}>
              <div className="vtile-icon" aria-hidden>{t.icon}</div>
              <div className="vtile-body">
                <div className="vtile-name">{t.name} <span className="vtile-status">{t.status}</span></div>
                <div className="vtile-desc">{t.desc}</div>
                {(c.want > 0 || c.no > 0) && (
                  <div className="vtile-tally">{c.want} want · {c.no} pass</div>
                )}
              </div>
              <div className="vtile-vote">
                <button
                  className={`vbtn want${my === 'want' ? ' sel' : ''}`}
                  onClick={() => vote(t.key, 'want')}
                  aria-pressed={my === 'want'}
                  aria-label={`I want ${t.name}`}
                  disabled={busy === t.key}
                >♥</button>
                <button
                  className={`vbtn no${my === 'no' ? ' sel' : ''}`}
                  onClick={() => vote(t.key, 'no')}
                  aria-pressed={my === 'no'}
                  aria-label={`Not for me: ${t.name}`}
                  disabled={busy === t.key}
                >✕</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`vroad-foot${allVoted ? ' done' : ''}`}>
        {allVoted ? <>All in. <b>+5 ☥ for voting</b></> : <>Voted {voted} / {TILES.length}</>}
      </div>
    </section>
  );
}
