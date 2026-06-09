import { useEffect, useState } from 'react';
import { Copy, Check, Share2, Sparkles, Info, X, Plus, Network } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import hekthorImg from '@/assets/hekthor.png';
import dogyptLogoGold from '@/assets/dogypt-logo-gold.png';
import { PACK_THEME } from './packTheme';

const T = PACK_THEME;

const APP_ORIGIN = 'https://dogypt.com';

// Heroglyph price — €11 for launch (Europe first). Switch back to $ for the US:
// see the price map in the session notes (create-checkout currency + display strings).
const PRICE = '€11';

interface Affiliate {
  code: string;
  points: number;
  referral_count: number;
  // Two-level split — backend may not return these yet (prepared for the network map).
  referral_count_l1?: number;
  referral_count_l2?: number;
}

// Where every €11 heroglyph goes — the Constitution's covenant, in 11 parts.
// 5 development · 3 marketing · 2 direct help · 1 Hekthor. Colors are CANONICAL
// (packTheme partDev/Mkt/Help/Hek) — must match the TransparentStats block.
const SPLIT = [
  { share: 5, label: 'Development', color: T.partDev, note: 'Building the nation and paying the people behind it — programmers, caretakers, trainers — plus the tools and servers that keep DOGYPT alive and growing.' },
  { share: 3, label: 'Affiliate', color: T.partMkt, note: 'Not ads — people. This goes straight into the accounts of Dogyptians who spread the faith (as points for now): spend them later or donate them to dogs in need. DOGYPT invests in the pack, not in expensive marketing — the pack spreads it far better.' },
  { share: 2, label: 'Direct help', color: T.partHelp, note: 'Straight to dogs in need — shelters, food, vet bills, rescue — every cent documented and public. The dream stays simple: become a millionaire by helping dogs, not despite them.' },
  { share: 1, label: "Hekthor's bowl", color: T.partHek, note: 'The founder dog who started it all. His share keeps the original promise alive.' },
] as const;

export function FounderInvite() {
  const [aff, setAff] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [openTile, setOpenTile] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase
      .rpc('get_or_create_my_affiliate')
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('get_or_create_my_affiliate failed:', error.message);
        } else if (data && data[0]) {
          setAff(data[0] as Affiliate);
        }
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const link = aff ? `${APP_ORIGIN}/?ref=${aff.code}` : '';

  // Two-level network counts. referral_count = direct (Level 1) until the backend
  // splits levels; Level 2 (their brings) stays 0 until the network map ships.
  const level1 = aff?.referral_count_l1 ?? aff?.referral_count ?? 0;
  const level2 = aff?.referral_count_l2 ?? 0;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast('Link copied', { description: 'Share it and grow the pack.' });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast('Could not copy', { description: link });
    }
  };

  const handleShare = async () => {
    if (!link) return;
    const shareData = {
      title: 'DOGYPT',
      text: 'Join the pack. Become Dogyptian.',
      url: link,
    };
    // Native share sheet on mobile (Instagram, WhatsApp, Facebook, Messages…);
    // desktops without the API fall back to copy.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled — no-op */
      }
    }
    handleCopy();
  };

  return (
    <section
      className="pack-card-hover w-full h-full"
      style={{
        background: 'linear-gradient(135deg, hsl(270 40% 25%), hsl(45 80% 45%))',
        border: '1px solid hsl(45 80% 60% / 0.22)',
        borderRadius: 24,
        padding: '28px 24px',
        boxShadow: '0 24px 55px -28px rgba(31, 26, 14, 0.45)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* soft glow top-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 88% 0%, rgba(245,199,61,0.30) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* (i) — DOGYPT transparency model (same pattern as the heroglyph flow) */}
      <button
        type="button"
        onClick={() => {
          setShowInfo((p) => !p);
          setOpenTile(null);
        }}
        aria-label={showInfo ? 'Close' : 'Where every euro goes'}
        className="absolute top-3 right-3 z-30 flex items-center justify-center"
        style={{ width: 40, height: 40 }}
      >
        <span
          className="flex items-center justify-center transition-colors"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1.5px solid rgba(245,199,61,0.55)',
            color: 'hsl(45 95% 88%)',
          }}
        >
          {showInfo ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
        </span>
      </button>

      <div className="relative flex flex-col items-center text-center gap-4 h-full justify-center">
        {/* Hekthor with his heroglyph — same asset as the flow */}
        <div
          className="shrink-0"
          style={{
            width: 116,
            height: 116,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={hekthorImg}
            alt="Hekthor — founder #1"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.45))',
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
        </div>

        <div className="text-center">
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(18px, 3.6vw, 22px)',
              fontWeight: 700,
              lineHeight: 1.25,
              color: 'hsl(45 95% 92%)',
              marginBottom: 8,
            }}
          >
            Grow the pack.
          </h3>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: 'hsl(45 40% 90% / 0.9)',
              marginBottom: 4,
            }}
          >
            Every Dogyptian you bring earns you{' '}
            <strong style={{ color: 'hsl(45 95% 88%)' }}>Apostle Points</strong> — and so does everyone
            they bring after. Paw to paw, we reach the million.
          </p>
        </div>

        {/* Network stats — Points · Level 1 · Level 2 (your whole tree) */}
        <div className="grid grid-cols-3 gap-2 w-full" style={{ maxWidth: 340 }}>
          <StatTile
            value={loading ? '—' : (aff?.points ?? 0).toLocaleString('sk-SK')}
            label="Apostle Points"
            highlight
          />
          <StatTile value={loading ? '—' : String(level1)} label="Level 1" sub="direct" />
          <StatTile value={loading ? '—' : String(level2)} label="Level 2" sub="their brings" />
        </div>

        {/* View network — prepared hook for the future people+dogs map (not yet live) */}
        <button
          type="button"
          disabled
          aria-label="View your network — coming soon"
          className="inline-flex items-center justify-center gap-1.5"
          style={{
            background: 'transparent',
            border: '1px dashed rgba(245,199,61,0.4)',
            borderRadius: 999,
            color: 'hsl(45 60% 88% / 0.72)',
            padding: '5px 14px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10.5,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'default',
          }}
        >
          <Network className="h-3.5 w-3.5" />
          View your network · soon
        </button>

        {/* Referral link box */}
        <div className="w-full" style={{ maxWidth: 320 }}>
          <div
            className="flex items-center gap-1"
            style={{
              background: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(245,199,61,0.32)',
              borderRadius: 10,
              padding: '4px 4px 4px 12px',
            }}
          >
            <span
              className="flex-1 truncate text-left"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12.5,
                color: 'hsl(45 60% 92%)',
                letterSpacing: '0.01em',
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
                background: 'linear-gradient(to right, hsl(45 92% 62%), hsl(45 96% 52%))',
                border: 'none',
                borderRadius: 8,
                color: '#1F1A0E',
                width: 38,
                height: 34,
                cursor: link ? 'pointer' : 'default',
                opacity: link ? 1 : 0.5,
                boxShadow: '0 6px 16px -8px rgba(0,0,0,0.6)',
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
              border: '1px solid rgba(245,199,61,0.45)',
              borderRadius: 8,
              color: 'hsl(45 95% 90%)',
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
            <Share2 className="h-4 w-4" />
            Share your link
          </button>
        </div>

        <div
          className="inline-flex items-center gap-1.5"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            color: 'hsl(45 40% 88% / 0.7)',
          }}
        >
          <Sparkles className="h-3 w-3" />
          Rewards for top apostles unlock as the religion grows.
        </div>
      </div>

      {/* ── Back of the card: DOGYPT TRANSPARENCY (inšpirované nation blokom) ── */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            key="transparency-model"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="absolute inset-0 z-20 flex flex-col"
            style={{
              background: 'linear-gradient(160deg, #14101f 0%, #1d1530 100%)',
              padding: '24px 22px 20px',
              overflow: 'hidden',
            }}
          >
            {/* Header — gold DOGYPT wordmark (rovnaké ako /vision /religion header) */}
            <div className="relative flex flex-col items-center" style={{ marginBottom: 14, zIndex: 1 }}>
              <img
                src={dogyptLogoGold}
                alt="DOGYPT"
                style={{
                  height: 'clamp(29px, 5.9vw, 37px)',
                  width: 'auto',
                }}
              />
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(15px, 3.2vw, 19px)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'hsl(45 90% 80%)',
                  marginTop: 7,
                  lineHeight: 1,
                }}
              >
                Transparency
              </span>
              <div
                aria-hidden
                style={{ width: 48, height: 1, background: 'hsl(45 80% 60%)', opacity: 0.5, margin: '11px auto 0' }}
              />
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12.5,
                  color: 'hsl(45 35% 88% / 0.82)',
                  textAlign: 'center',
                  margin: '10px 0 0',
                }}
              >
                Where every {PRICE} goes?
              </p>
            </div>

            {/* 11-segment share bar — the parts, graphically */}
            <div className="relative flex w-full gap-[3px]" style={{ marginBottom: 14, zIndex: 1 }}>
              {SPLIT.flatMap((s, si) =>
                Array.from({ length: s.share }).map((_, i) => (
                  <span
                    key={`${si}-${i}`}
                    style={{ flex: 1, height: 7, borderRadius: 2, background: s.color }}
                  />
                )),
              )}
            </div>

            {/* 4 blocks, 2×2 — vyplnia výšku karty; name visible, click reveals detail */}
            <div
              className="relative grid grid-cols-2 gap-2.5"
              style={{ zIndex: 1, flex: 1, minHeight: 0, gridTemplateRows: '1fr 1fr' }}
            >
              {SPLIT.map((s, si) => {
                const open = openTile === si;
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setOpenTile(si)}
                    className="text-left flex flex-col"
                    style={{
                      background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.045)',
                      border: `1px solid ${open ? s.color : 'rgba(245,240,228,0.14)'}`,
                      borderRadius: 16,
                      padding: '16px 16px 15px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                  >
                    {/* top — share dots + tap affordance */}
                    <div className="flex items-center justify-between">
                      <span className="flex gap-[4px]">
                        {Array.from({ length: s.share }).map((_, i) => (
                          <span
                            key={i}
                            style={{ width: 7, height: 7, borderRadius: 999, background: s.color }}
                          />
                        ))}
                      </span>
                      <span
                        className="flex items-center justify-center"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          border: `1px solid ${s.color}`,
                          color: s.color,
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </span>
                    </div>

                    {/* bottom — big share + label, anchored to floor */}
                    <div style={{ marginTop: 'auto' }}>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 'clamp(30px, 6.6vw, 40px)',
                          fontWeight: 700,
                          lineHeight: 1,
                          color: s.color,
                        }}
                      >
                        {s.share}
                        <span style={{ fontSize: '0.42em', opacity: 0.65 }}>/11</span>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: 13.5,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'hsl(45 92% 90%)',
                          marginTop: 7,
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              className="relative"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 10.5,
                color: 'hsl(45 30% 84% / 0.55)',
                textAlign: 'center',
                marginTop: 14,
                zIndex: 1,
              }}
            >
              Tap a block to see where it goes.
            </div>

            {/* Detail popup — full note, no scroll/clip regardless of length */}
            <AnimatePresence>
              {openTile !== null && (
                <motion.div
                  key="tile-popup"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setOpenTile(null)}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    zIndex: 40,
                    background: 'rgba(8, 6, 16, 0.74)',
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)',
                    padding: 22,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.92, y: 8 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 300,
                      background: 'linear-gradient(160deg, #1b1530 0%, #241a3c 100%)',
                      border: `1px solid ${SPLIT[openTile].color}`,
                      borderRadius: 18,
                      padding: '22px 20px 20px',
                      boxShadow: '0 24px 60px -20px rgba(0,0,0,0.7)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenTile(null)}
                      aria-label="Close"
                      className="absolute flex items-center justify-center"
                      style={{ top: 12, right: 12, width: 26, height: 26, borderRadius: 999, border: '1px solid rgba(245,240,228,0.25)', color: 'hsl(45 40% 86% / 0.8)' }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <span className="flex gap-[5px]" style={{ marginBottom: 10 }}>
                      {Array.from({ length: SPLIT[openTile].share }).map((_, i) => (
                        <span
                          key={i}
                          style={{ width: 8, height: 8, borderRadius: 999, background: SPLIT[openTile].color }}
                        />
                      ))}
                    </span>
                    <div
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 30,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: SPLIT[openTile].color,
                      }}
                    >
                      {SPLIT[openTile].share}
                      <span style={{ fontSize: '0.42em', opacity: 0.65 }}>/11</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'hsl(45 95% 92%)',
                        margin: '6px 0 10px',
                      }}
                    >
                      {SPLIT[openTile].label}
                    </div>
                    <p
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 12.5,
                        lineHeight: 1.55,
                        color: 'hsl(45 28% 86% / 0.88)',
                        margin: 0,
                      }}
                    >
                      {SPLIT[openTile].note}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function StatTile({
  value,
  label,
  sub,
  highlight,
}: {
  value: string;
  label: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        background: highlight ? 'rgba(245,199,61,0.16)' : 'rgba(0,0,0,0.22)',
        border: `1px solid ${highlight ? 'rgba(245,199,61,0.4)' : 'rgba(245,240,228,0.18)'}`,
        borderRadius: 12,
        padding: '12px 6px',
      }}
    >
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
          color: highlight ? 'hsl(45 96% 78%)' : 'hsl(45 90% 92%)',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 9.5,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'hsl(45 40% 88% / 0.78)',
          marginTop: 5,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 8.5,
            color: 'hsl(45 35% 86% / 0.5)',
            marginTop: 2,
            textAlign: 'center',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
