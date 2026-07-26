import { useEffect, useState } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { supabase } from '@/integrations/supabase/client';
import { PACK_THEME } from '@/components/pack/packTheme';

const T = PACK_THEME;

// ─────────────────────────────────────────────────────────────────────────
// "Bones & Network" — profile block 2, split two columns:
//   LEFT  = bones balance (affiliates.points) + what bones are + referral link
//   RIGHT = how levels reward you + the people in your line
// BONES = affiliate currency. 10 bones = €1.
//   You bring a dog lover (L1) → +20 bones (+30 if you're root/orphan)
//   They bring someone (L2)    → +10 bones
// NOTE: Hekthor's Bowl (root-only €-counter) PARKED 2026-06-16 — odstránené z UI,
//   data (net.founder_points / is_root) ostávajú. Re-add keď bude pripravené.
// Data: get_my_network() + get_or_create_my_affiliate().
// ─────────────────────────────────────────────────────────────────────────

const APP_ORIGIN = 'https://dogypt.com';
const BONES_PER_EUR = 10;
const eur = (bones: number) => (bones / BONES_PER_EUR).toFixed(2);

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
  const [bones, setBones] = useState<number | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      if (!affRes.error && affRes.data?.[0]) {
        setBones(affRes.data[0].points as number);
        setCode(affRes.data[0].code as string);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const l1 = net?.level1 ?? [];
  const l2 = net?.level2 ?? [];
  const isEmpty = !loading && l1.length === 0 && l2.length === 0;
  const link = code ? `${APP_ORIGIN}/?ref=${code}` : '';

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast('Link copied', { description: 'Share it and grow your line.' });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Could not copy', { description: link });
    }
  };

  const handleShare = async () => {
    if (!link) return;
    const shareData = { title: 'DOGYPT', text: 'Join the pack. Become Dogyptian.', url: link };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* cancelled */
      }
    }
    handleCopy();
  };

  return (
    <section
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        padding: 22,
        boxShadow: T.cardShadow,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* ════════ LEFT — Bones + referral link ════════ */}
        <div>
          {/* Bones balance */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5" style={{ color: T.inkDim }}>
              <span
                aria-hidden
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    'radial-gradient(circle at 35% 30%, #F7DD92 0%, #C99A3F 68%, #9A742B 100%)',
                  border: '1px solid rgba(120,90,30,0.6)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.18)',
                }}
              >
                <BrandIcon name="bone" size={15} tint="dark" />
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                }}
              >
                Your BONES
              </span>
            </div>
            <div className="text-right">
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: T.accentGold,
                }}
              >
                {bones == null ? '—' : bones.toLocaleString('en-US')}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: T.inkFaint,
                    marginLeft: 7,
                  }}
                >
                  BONES
                </span>
              </span>
              {bones != null && bones > 0 && (
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 11,
                    color: T.inkFaint,
                    marginTop: 3,
                  }}
                >
                  ≈ €{eur(bones)}
                </div>
              )}
            </div>
          </div>

          {/* Beta + what bones are */}
          <div
            className="flex items-start gap-2"
            style={{
              background: T.tileBg,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '11px 13px',
              marginTop: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 8.5,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: T.accentGold,
                border: `1px solid ${T.accentGold}55`,
                borderRadius: 999,
                padding: '3px 8px',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              Beta
            </span>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12.5,
                lineHeight: 1.5,
                color: T.inkDim,
                margin: 0,
              }}
            >
              BONES are your DOGYPT currency — <strong style={{ color: T.ink }}>10 BONES = €1</strong>.
              Soon you'll spend them <em>inside DOGYPT only</em> — help dogs in need, claim merch, and more.
            </p>
          </div>

          {/* Referral link */}
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: T.inkDim,
                marginBottom: 8,
              }}
            >
              Your Invite Link
            </div>
            <div
              className="flex items-center gap-1"
              style={{
                background: T.bg,
                border: `1px solid ${T.hairline}`,
                borderRadius: 10,
                padding: '4px 4px 4px 12px',
              }}
            >
              <span
                className="flex-1 truncate text-left"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12.5,
                  color: T.ink,
                }}
              >
                {loading ? 'Generating your link…' : link.replace(/^https?:\/\//, '')}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!link}
                aria-label="Copy invite link"
                className="inline-flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(to right, #F5C73D, #E69E1A)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#1F1A0E',
                  width: 38,
                  height: 34,
                  cursor: link ? 'pointer' : 'default',
                  opacity: link ? 1 : 0.5,
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleShare}
              disabled={!link}
              className="inline-flex items-center justify-center gap-2 w-full mt-2"
              style={{
                background: 'transparent',
                border: `1px solid ${T.accentGold}66`,
                borderRadius: 8,
                color: T.ink,
                padding: '10px 18px',
                fontFamily: "'Cinzel', serif",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: link ? 'pointer' : 'default',
                opacity: link ? 1 : 0.5,
              }}
            >
              <BrandIcon name="link" size={16} tint="gold" />
              Share your link
            </button>
          </div>
        </div>

        {/* ════════ RIGHT — Levels + Hekthor's Bowl + people ════════ */}
        {/* Mobile: top border (columns stack). Desktop: left border in the gap. */}
        <style>{`@media (min-width:768px){.pack-net-right{border-top:none !important;padding-top:0 !important;border-left:1px solid ${T.hairline};padding-left:2rem;}}`}</style>
        <div
          className="pack-net-right"
          style={{ borderTop: `1px solid ${T.hairline}`, paddingTop: 18 }}
        >
          <div>
            {/* How levels reward you */}
            <div
              className="flex items-center gap-2.5 mb-2"
              style={{ color: T.inkDim }}
            >
              <BrandIcon name="cycle" size={16} tint="gold" />
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                }}
              >
                How you earn
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12.5,
                lineHeight: 1.5,
                color: T.inkDim,
                margin: '0 0 14px',
              }}
            >
              Bring a dog lover and you earn <strong style={{ color: T.ink }}>+20 BONES</strong>. When{' '}
              <em>they</em> bring someone, you earn <strong style={{ color: T.ink }}>+10</strong> more.
            </p>

            {/* Your line */}
            <div className="flex items-center gap-2.5 mb-3" style={{ color: T.inkDim }}>
              <BrandIcon name="people" size={16} tint="gold" />
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                }}
              >
                Your Line
              </span>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-2" style={{ color: T.inkFaint }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>Loading your line…</span>
              </div>
            ) : isEmpty ? (
              <div
                className="flex flex-col items-center text-center gap-2 py-5"
                style={{ color: T.inkFaint }}
              >
                <BrandIcon name="link" size={20} tint="gold" />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, lineHeight: 1.5 }}>
                  No one in your line yet. Share your link —
                  <br />
                  every dog lover you bring earns you BONES.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Tier
                  label="Level 1"
                  sub={`${net?.level1_count ?? l1.length} direct · +20 BONES`}
                  members={l1}
                />
                {l2.length > 0 && (
                  <Tier
                    label="Level 2"
                    sub={`${net?.level2_count ?? l2.length} extended · +10 BONES`}
                    members={l2}
                    indented
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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
  const initial = (member.owner_name?.[0] || member.dog_name?.[0] || '?').toUpperCase();
  return (
    <div
      className="flex items-center gap-2.5"
      style={{
        background: T.tileBg,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: '8px 11px',
      }}
    >
      {/* profile dot — avatar placeholder (parking for real profile pics) */}
      <span
        aria-hidden
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          flexShrink: 0,
          background: indented ? 'rgba(201,154,63,0.16)' : 'rgba(201,154,63,0.24)',
          border: `1.5px solid ${T.accentGold}55`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Cinzel', serif",
          fontSize: 11,
          fontWeight: 700,
          color: T.inkDim,
        }}
      >
        {initial}
      </span>
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
        className="inline-flex items-center gap-1"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 12,
          fontWeight: 700,
          color: T.accentGold,
          flexShrink: 0,
        }}
      >
        +{member.points}
        <BrandIcon name="bone" size={11} tint="gold" />
      </span>
    </div>
  );
}
