import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import { BrandIcon } from './BrandIcon';
import { PACK_THEME } from './packTheme';
import { PackNotifications } from './PackNotifications';
import { DEV_FULL } from '@/lib/packFlags';
import { devotionLevel } from '@/lib/devotion';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

const AVATAR_SIZE = 132;
// Ring = náš fialovo-zlatý gradient (rovnaký ako MY PACK blok vedľa)
const STORY_RING = 'var(--brand-gradient)';

// ─────────────────────────────────────────────────────────────────────────────
// HeroCard = blok 1 „JA" na /pack. READ-ONLY od 2026-08-06 (Matej: „na homepage
// musí byť viditeľný absolutny zaklad + linky na editáciu").
//
// Editácia fotky aj mena sa presunula do `/pack/profile` — jediný odchod odtiaľto
// je nenápadná ceruzka vpravo hore. ⚠️ Nevracať sem in-place upload skôr, než sa
// zavrie route `/pack/profile` v App.tsx; inak si člen fotku nezmení nikde.
//
// Badge (Pawtner · level · BONES) a devotion bar sú klikateľné a KAŽDÝ má popup —
// dovtedy to boli nevysvetlené ozdoby.
// ─────────────────────────────────────────────────────────────────────────────

interface HeroCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Faraón line-art placeholder podľa pohlavia majiteľa (selections.ownerGender) keď chýba reálna fotka */
  genderPlaceholder?: 'man' | 'woman' | null;
  /** DEVOTION — sakrálna mena ranku. Zbieranie zamknuté do launchu appky (2027). */
  devotion?: number;
  /** $BONE balance — dnes referral mena (affiliates.points). */
  bones?: number;
  /** Pack pulse pre notifikačný bell (top-right). Nezobrazí sa kým nedôjdu stats. */
  stats?: { last24h: number; last30d: number; total: number } | null;
}

type PopKey = 'pawtner' | 'level' | 'bones' | 'devotion';

export function HeroCard({ name, email, avatarUrl, genderPlaceholder = null, devotion = 100, bones = 0, stats = null }: HeroCardProps) {
  const t = useT();
  const [pop, setPop] = useState<PopKey | null>(null);

  const displayName = name;
  const initial = displayName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'D';
  const hasAvatar = !!avatarUrl;
  const placeholderSrc = genderPlaceholder ? `/images/avatars/pharaoh-${genderPlaceholder}.png` : null;

  // DEVOTION úroveň počítaná z bodov → poháňa LEVEL badge (žiadny hardcode „Pharaoh" pre všetkých).
  const lv = devotionLevel(devotion);
  const topTier = lv.key === 'pharaoh' || lv.key === 'demigod';

  return (
    <section
      className="pack-card-hover h-full"
      style={{
        background: T.cardGrad,
        borderRadius: 16,
        padding: '22px 20px 20px',
        border: `1.5px solid ${T.cardEdge}`,
        boxShadow: T.cardShadow,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* corner ornament */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Notifikácie + správy (coming soon) — vpravo hore. DEV_FULL: presunuté do globálneho
          top-right hubu (PackTopRight, D4 nav rework 2026-07-24) — tu by bol duplikát. LIVE:
          zostáva presne ako predtým (bez zmeny). */}
      {stats && !DEV_FULL && (
        <PackNotifications last24h={stats.last24h} last30d={stats.last30d} total={stats.total} />
      )}

      {/* Odchod na profil — nenápadná ceruzka, NIE veľké zlaté CTA (Matej 2026-08-06:
          „CTA uprav profil pri človeku je zbytočne veľké"). Keď je v rohu bell od
          notifikácií, ceruzka sa posunie vedľa neho, nie pod. */}
      <Link
        to="/pack/profile"
        className="inline-flex items-center gap-1.5"
        style={{
          position: 'absolute',
          top: 14,
          right: stats && !DEV_FULL ? 60 : 14,
          zIndex: 3,
          padding: '7px 12px',
          borderRadius: 999,
          background: 'rgba(201, 154, 63, 0.10)',
          border: '1px solid rgba(201, 154, 63, 0.42)',
          color: T.inkWarm,
          textDecoration: 'none',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <Pencil className="h-3 w-3" />
        <span className="hidden sm:inline">{t('pack.hero.editProfile')}</span>
      </Link>

      <div className="flex flex-col items-center text-center flex-1 justify-center relative">
        {/* Avatar — fialový gradient ring. Read-only: klik už neotvára file picker. */}
        <div className="relative" style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
          {/* pulsing purple glow behind */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              animation: 'pack-breathe 3.8s ease-in-out infinite',
              boxShadow: '0 0 26px 2px rgba(124, 58, 237, 0.30), 0 0 18px 2px rgba(201, 154, 63, 0.22)',
            }}
          />
          {/* gradient ring */}
          <div
            className="relative rounded-full"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, padding: 4, background: STORY_RING }}
          >
            {/* gap ring (papyrus) */}
            <div className="rounded-full h-full w-full" style={{ padding: 3, background: T.card }}>
              <div
                className="relative block h-full w-full"
                style={{
                  borderRadius: '50%',
                  background: hasAvatar
                    ? 'transparent'
                    : `linear-gradient(135deg, ${T.cardSoft} 0%, ${T.bgTop} 100%)`,
                  overflow: 'hidden',
                }}
              >
                {hasAvatar ? (
                  <img
                    src={avatarUrl!}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : placeholderSrc ? (
                  <span className="flex items-center justify-center h-full w-full" style={{ padding: 20 }}>
                    <img
                      src={placeholderSrc}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </span>
                ) : (
                  <span
                    className="flex items-center justify-center h-full w-full"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 54,
                      fontWeight: 700,
                      color: T.inkDim,
                    }}
                  >
                    {initial}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-4"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: T.inkDim,
            marginBottom: 4,
          }}
        >
          {t('pack.hero.welcomeBack')}
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: T.ink,
            lineHeight: 1.1,
            maxWidth: '92%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </div>

        {/* Badge riadok — STATUS (Pawtner) + LEVEL + BONES. Každý = tlačidlo s popupom.
            grid-cols-3 = tri totožné stĺpce; každý badge w-full + centrovaný = rovnaká veľkosť. */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-full">
          {/* STATUS */}
          <button
            type="button"
            onClick={() => setPop('pawtner')}
            className="hc-badge flex w-full items-center justify-center gap-1.5"
            style={{
              padding: '7px 6px',
              borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${T.border}`,
              cursor: 'pointer',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                flexShrink: 0,
                background: T.accentGold ?? 'hsl(40 55% 50%)',
                boxShadow: '0 0 6px rgba(201, 154, 63, 0.6)',
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: T.ink,
              }}
            >
              Pawtner
            </span>
          </button>

          {/* LEVEL — počítaný z DEVOTION (nie natvrdo). Top tier (Pharaoh/Demigod) = zlato-fialový
              gradient + Crown; nižšie úrovne = jemný outline bez koruny. */}
          <button
            type="button"
            onClick={() => setPop('level')}
            className="hc-badge flex w-full items-center justify-center gap-1.5"
            style={{
              padding: '7px 6px',
              borderRadius: 999,
              cursor: 'pointer',
              background: topTier
                ? 'linear-gradient(135deg, hsl(45 80% 48%) 0%, hsl(224 50% 42%) 100%)'
                : 'transparent',
              border: topTier ? '1px solid rgba(201, 154, 63, 0.55)' : `1px solid ${T.border}`,
              boxShadow: topTier
                ? '0 5px 18px -5px rgba(124, 58, 237, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                : 'none',
            }}
          >
            {topTier && <BrandIcon name="trophy" size={12} tint="gold" className="shrink-0" />}
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: topTier ? '#FFF6E6' : T.ink,
                textShadow: topTier ? '0 1px 4px rgba(0,0,0,0.35)' : 'none',
              }}
            >
              {t('pack.ladder.' + lv.key)}
            </span>
          </button>

          {/* BONES — minca + kostička */}
          <button
            type="button"
            onClick={() => setPop('bones')}
            className="hc-badge flex w-full items-center justify-center gap-1.5"
            aria-label={`${bones} BONES`}
            style={{
              padding: '7px 6px',
              borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${T.border}`,
              cursor: 'pointer',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                background: 'radial-gradient(circle at 35% 30%, #F7DD92 0%, #C99A3F 68%, #9A742B 100%)',
                border: '1px solid rgba(120,90,30,0.7)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              <BrandIcon name="bone" size={9} tint="dark" />
            </span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: T.ink }}>
              {bones.toLocaleString('en-US')}
            </span>
          </button>
        </div>

        {/* DEVOTION status bar + progress. Zbieranie je zamknuté do launchu appky —
            zámok a popup to hovoria priamo, namiesto merania prázdna. */}
        <div className="hc-dev mt-3 w-full">
          <style>{`
            .hc-badge{ transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
            .hc-badge:hover{ transform: translateY(-1px); box-shadow: 0 3px 12px rgba(122,90,42,0.24); }
            .hc-bar { position: relative; cursor: pointer; outline: none; width: 100%; padding: 0; }
            .hc-bar .hc-tip {
              position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%);
              white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .2s ease;
              background: rgba(20,16,8,0.96); color: #FAF4EC; z-index: 5;
              font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
              padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(201,154,63,0.45);
              box-shadow: 0 8px 22px -8px rgba(0,0,0,0.6);
            }
            .hc-bar:hover .hc-tip, .hc-bar:focus-visible .hc-tip { opacity: 1; }
          `}</style>

          <button
            type="button"
            className="hc-bar"
            onClick={() => setPop('devotion')}
            aria-label={t('pack.hero.ariaDevotionBar', { points: devotion.toLocaleString('en-US'), index: lv.index, name: t('pack.ladder.' + lv.key) })}
            style={{ position: 'relative', height: 34, borderRadius: 999, overflow: 'hidden', background: T.hairline, border: `1px solid ${T.border}` }}
          >
            <div style={{ position: 'absolute', inset: 0, width: `${lv.pct}%`, background: 'linear-gradient(90deg, hsl(224 42% 42%), hsl(45 82% 55%))', transition: 'width .5s ease' }} />
            <div className="relative h-full flex items-center justify-center gap-1.5">
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: T.ink, lineHeight: 1, letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(250,244,236,0.5)' }}>
                {devotion.toLocaleString('en-US')}
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: T.ink, lineHeight: 1, textShadow: '0 1px 2px rgba(250,244,236,0.5)' }}>☥</span>
            </div>
            {/* zámok = zbieranie zatiaľ nebeží */}
            <span aria-hidden style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 12, opacity: 0.75, lineHeight: 1 }}>🔒</span>
            <span className="hc-tip">Devotion</span>
          </button>

          {/* body do ďalšej úrovne — vpravo pod barom, malým */}
          <div style={{ textAlign: 'right', marginTop: 5 }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: T.inkDim }}>
              {lv.next ? <>{t('pack.hero.devotionToNext', { toNext: lv.toNext.toLocaleString('en-US'), nextName: t('pack.ladder.' + lv.next.key) })}</> : t('pack.hero.devotionMaxReached')}
            </span>
          </div>
        </div>

      </div>

      {pop && <HeroPopup which={pop} bones={bones} level={t('pack.ladder.' + lv.key)} levelIndex={lv.index} onClose={() => setPop(null)} />}
    </section>
  );
}

// ── Popup — papyrusový panel (T.panelGrad / radius 14 / T.panelShadow) ────────
function HeroPopup({
  which, bones, level, levelIndex, onClose,
}: { which: PopKey; bones: number; level: string; levelIndex: number; onClose: () => void }) {
  const t = useT();

  const COPY: Record<PopKey, { eyebrow: string; title: string; body: string[]; stamp?: string }> = {
    pawtner: {
      eyebrow: t('pack.hero.popStatusEyebrow'),
      title: 'Pawtner',
      body: [t('pack.hero.popPawtner1'), t('pack.hero.popPawtner2')],
    },
    level: {
      eyebrow: t('pack.hero.popLevelEyebrow'),
      title: t('pack.hero.popLevelTitle', { name: level, index: levelIndex }),
      body: [t('pack.hero.popLevel1'), t('pack.hero.popLevel2')],
    },
    bones: {
      eyebrow: t('pack.hero.popBonesEyebrow'),
      title: `BONES · ${bones.toLocaleString('en-US')}`,
      body: [t('pack.hero.popBones1'), t('pack.hero.popBones2')],
    },
    devotion: {
      eyebrow: t('pack.hero.popDevotionEyebrow'),
      title: t('pack.hero.popDevotionTitle'),
      body: [t('pack.hero.popDevotion1'), t('pack.hero.popDevotion2')],
      stamp: t('pack.hero.popDevotionStamp'),
    },
  };
  const c = COPY[which];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 22, background: 'rgba(5,5,5,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 430, color: T.ink,
          background: T.panelGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 14,
          boxShadow: T.panelShadow, padding: '26px 24px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('pack.hero.popClose')}
          style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 0, cursor: 'pointer', color: T.inkFaint, lineHeight: 1 }}
        >
          <X className="h-5 w-5" />
        </button>

        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.cardEdge }}>
          {c.eyebrow}
        </span>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 17, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.inkStrong, margin: '8px 0 10px' }}>
          {c.title}
        </h3>
        {c.body.map((line, i) => (
          <p key={i} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, lineHeight: 1.65, color: T.inkWarm, margin: '0 0 10px' }}>
            {line}
          </p>
        ))}
        {c.stamp && (
          <span style={{
            display: 'inline-block', marginTop: 6, padding: '5px 12px', borderRadius: 999,
            border: '1px dashed rgba(179,130,45,0.6)', color: T.inkWarm,
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {c.stamp}
          </span>
        )}
      </div>
    </div>
  );
}
