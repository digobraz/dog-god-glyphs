import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from '@/components/pack/packTheme';

const T = PACK_THEME;

// ─────────────────────────────────────────────────────────────────────────
// "Your Network" — the member's two-level apostle tree, shown on the profile.
// Level 1 = Dogyptians you brought in (+2 Apostle Points each).
// Level 2 = Dogyptians THEY brought in (+1 Apostle Point each).
// Mirrors the Constitution "Odmeňovací systém", in points (no money yet).
// Data: get_my_network() (award books a row for me at both levels) +
//       get_or_create_my_affiliate() for the headline points total.
// ─────────────────────────────────────────────────────────────────────────

interface Member {
  dog_name: string | null;
  owner_name: string | null;
  created_at: string;
  points: number;
}
interface Network {
  level1: Member[];
  level2: Member[];
  level1_count: number;
  level2_count: number;
  is_root?: boolean;
  founder_points?: number;
}

export function PackNetwork() {
  const [net, setNet] = useState<Network | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      supabase.rpc('get_my_network'),
      supabase.rpc('get_or_create_my_affiliate'),
    ]).then(([netRes, affRes]) => {
      if (!mounted) return;
      if (netRes.error) console.error('get_my_network:', netRes.error.message);
      else setNet(netRes.data as unknown as Network);
      if (!affRes.error && affRes.data?.[0]) setPoints(affRes.data[0].points as number);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const l1 = net?.level1 ?? [];
  const l2 = net?.level2 ?? [];
  const isEmpty = !loading && l1.length === 0 && l2.length === 0;

  return (
    <section
      style={{
        background: T.card,
        border: `1px solid ${T.hairline}`,
        borderRadius: 20,
        padding: 22,
        boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5" style={{ color: T.inkDim }}>
          <BrandIcon name="people" size={16} tint="gold" />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            Your Network
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1,
            color: T.accentGold,
          }}
        >
          {points == null ? '—' : points.toLocaleString('sk-SK')}
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 9.5,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: T.inkFaint,
              marginLeft: 6,
            }}
          >
            pts
          </span>
        </span>
      </div>

      {/* Explainer */}
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12.5,
          lineHeight: 1.5,
          color: T.inkDim,
          margin: '8px 0 18px',
        }}
      >
        <strong style={{ color: T.ink }}>Level 1</strong> — everyone you bring earns you{' '}
        <strong style={{ color: T.ink }}>+2</strong>. <strong style={{ color: T.ink }}>Level 2</strong> —
        everyone <em>they</em> bring earns you <strong style={{ color: T.ink }}>+1</strong>.
      </p>

      {/* Founder points — root only, separate from the affiliate network above */}
      {net?.is_root && (
        <div
          className="flex items-center justify-between gap-3"
          style={{
            background: T.cardSoft,
            border: `1px solid ${T.accentGold}33`,
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 18,
          }}
        >
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: T.inkDim,
              }}
            >
              Founder Points
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 11,
                color: T.inkFaint,
                marginTop: 2,
              }}
            >
              1 for every heroglyph ever forged
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1,
              color: T.accentGold,
            }}
          >
            {(net.founder_points ?? 0).toLocaleString('sk-SK')}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-4" style={{ color: T.inkFaint }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>Loading your pack…</span>
        </div>
      ) : isEmpty ? (
        <div
          className="flex flex-col items-center text-center gap-2 py-6"
          style={{ color: T.inkFaint }}
        >
          <BrandIcon name="link" size={20} tint="gold" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5 }}>
            No apostles yet. Share your link from the Home tab —
            <br />
            every Dogyptian you bring grows your network.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Tier
            label="Level 1"
            sub={`${net?.level1_count ?? l1.length} direct · +2 each`}
            members={l1}
          />
          {l2.length > 0 && (
            <Tier
              label="Level 2"
              sub={`${net?.level2_count ?? l2.length} extended · +1 each`}
              members={l2}
              indented
            />
          )}
        </div>
      )}
    </section>
  );
}

function Tier({
  label,
  sub,
  members,
  indented,
}: {
  label: string;
  sub: string;
  members: Member[];
  indented?: boolean;
}) {
  return (
    <div style={{ marginLeft: indented ? 16 : 0 }}>
      <div className="flex items-baseline gap-2 mb-2">
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: T.ink,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            color: T.inkFaint,
          }}
        >
          {sub}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {members.map((m, i) => (
          <Row key={i} member={m} indented={indented} />
        ))}
      </div>
    </div>
  );
}

function Row({ member, indented }: { member: Member; indented?: boolean }) {
  const name = member.dog_name?.trim() || 'A new Dogyptian';
  return (
    <div
      className="flex items-center gap-2.5"
      style={{
        background: T.cardSoft,
        border: `1px solid ${T.hairline}`,
        borderRadius: 10,
        padding: '9px 12px',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: indented ? T.inkFaint : T.accentGold,
          flexShrink: 0,
        }}
      />
      <span
        className="flex-1 truncate"
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, color: T.ink }}
      >
        {name}
        {member.owner_name && (
          <span style={{ color: T.inkFaint }}> · {member.owner_name}</span>
        )}
      </span>
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 12,
          fontWeight: 700,
          color: T.accentGold,
          flexShrink: 0,
        }}
      >
        +{member.points}
      </span>
    </div>
  );
}
