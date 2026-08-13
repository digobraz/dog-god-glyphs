import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from './packTheme';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { EDGE_BASE } from '@/lib/env';
import { useT, useLang } from '@/i18n/LanguageContext';

const T = PACK_THEME;

// Currency — €11 for launch (Europe first). One-line switch back to '$' for the US.
const CUR = '€';
const PRICE = '€11';

// ─────────────────────────────────────────────────────────────────────────
// TRANSPARENT STATS — the money, in the open, Stripe-style. Same numbers as the
// HQ dashboard: both read the SAME edge fn (get-dashboard-stats), so a member
// sees the real treasury state 1:1 with what we see internally.
//
// €11 heroglyph splits 5 development · 3 affiliate · 2 direct help · 1 Hekthor.
// Discounted/tester payments (€1 promo) go ENTIRELY into Hekthor's bowl — the
// server does the split (incl. that exception); we just render treasuries.*.
// ─────────────────────────────────────────────────────────────────────────

// field = kľúč v API `treasuries{}`, labelKey = popiska dlaždice. Podiel (×5/×3/×2/×1),
// farba aj poznámka „kam to ide" prichádzajú z `TRANSPARENCY_SPLIT` — jediný zdroj pravdy
// (zdieľaný s `PaymentScreen`). Poradie MUSÍ sedieť: dev · affiliate · help · Hekthor.
const FIELDS = [
  { key: 'dev',  field: 'dev',       labelKey: 'pack.stats.development' },
  { key: 'mkt',  field: 'affiliate', labelKey: 'pack.stats.affiliate'   },
  { key: 'help', field: 'help',      labelKey: 'pack.stats.directHelp'  },
  { key: 'hek',  field: 'hektor',    labelKey: 'pack.stats.hekthorBowl' },
] as const;

const ALLOC = FIELDS.map((f, i) => ({
  ...f,
  share: TRANSPARENCY_SPLIT[i].share,
  color: TRANSPARENCY_SPLIT[i].color,
  noteKey: TRANSPARENCY_SPLIT[i].noteKey,
}));

type Treasuries = { dev: number; affiliate: number; help: number; hektor: number };
type Stats = { dogyptians: number; revenue_total: number; treasuries: Treasuries };

function money(n: number): string {
  return `${CUR}${(n ?? 0).toLocaleString('en-US')}`;
}

export function TransparentStats() {
  const t = useT();
  const { lang } = useLang();
  const [stats, setStats] = useState<Stats | null>(null);
  // Otvorený detail podielu (index v ALLOC) — presunuté sem z `FounderInvite` 12.8.2026.
  const [openTile, setOpenTile] = useState<number | null>(null);

  // Live treasury state — SAME source as dashboard.dogypt.com (get-dashboard-stats).
  useEffect(() => {
    let active = true;
    fetch(`${EDGE_BASE}/get-dashboard-stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && !d.error) setStats(d as Stats);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const heroglyphs = stats?.dogyptians ?? 0;
  const revenue = stats?.revenue_total ?? 0;
  const treasuries: Treasuries = stats?.treasuries ?? { dev: 0, affiliate: 0, help: 0, hektor: 0 };

  return (
    <div style={{ marginTop: 26, paddingTop: 24, borderTop: `1px solid ${T.hairline}`, position: 'relative' }}>
      {/* Header — title */}
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: FONT_TITLE,
            fontSize: 'clamp(14px, 2.6vw, 17px)',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.ink,
            margin: 0,
          }}
        >
          {t('pack.stats.title')}
        </h3>
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 10.5,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.inkDim,
            background: T.tileBg,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            padding: '4px 11px',
          }}
        >
          {t('pack.stats.allTime')}
        </span>
      </div>

      {/* Top row — heroglyphs forged so far (full width) */}
      <div
        className="flex items-center justify-center gap-4"
        style={{
          background: T.tileBg,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: '18px 24px',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: FONT_TITLE,
            fontSize: 'clamp(32px, 7vw, 44px)',
            fontWeight: 700,
            lineHeight: 1,
            color: T.ink,
          }}
        >
          {heroglyphs.toLocaleString('en-US')}
        </span>
        <span
          style={{
            fontFamily: FONT_TITLE,
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          {t('pack.stats.heroglyphsTotal')}
        </span>
      </div>

      {/* ── ROZPAD €11 — pás 11 dielov (presunuté z `FounderInvite` 12.8.2026, Matej:
          „ten rozpad 11 eur sa hodí skôr do bloku nad týmto"). Patrí k POKLADNICI:
          pás hovorí, ako sa €11 DELÍ, dlaždice pod ním ukazujú, koľko v tých šuflíkoch
          reálne je. Predtým stáli tie dve polovice jednej vety v dvoch rôznych blokoch.
          ⚠️ Kľúče `pack.invite.*` sú zámerne PONECHANÉ napriek presunu — majú preklad
          vo všetkých 18 jazykoch; nový kľúč by 16 z nich zhodil na angličtinu. */}
      <p
        style={{
          fontFamily: FONT_TITLE,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.inkDim,
          margin: '0 0 9px',
        }}
      >
        {t('pack.invite.transparencySubtitle', { price: PRICE })}
      </p>

      <div className="flex w-full gap-[3px]" style={{ marginBottom: 12 }}>
        {ALLOC.flatMap((a, ai) =>
          Array.from({ length: a.share }).map((_, i) => (
            <span
              key={`${ai}-${i}`}
              style={{ flex: 1, height: 7, borderRadius: 2, background: a.color }}
            />
          )),
        )}
      </div>

      {/* Allocation tiles — where the money went (live treasuries).
          ⚠️ Suma je HLAVNÝ údaj dlaždice (Matej 12.8.: „tie položky kde sú peniaze v
          jednotlivých šuflíkoch treba to tročku zvýrazniť… je to také fádne"). Predtým
          mala rovnakú vizuálnu váhu ako popiska nad ňou: 24px Cinzel v `T.ink` na
          jednofarebnom `T.tileBg`, teda štyri rovnaké béžové obdĺžniky. Teraz nesie
          dlaždica jemný nádych SVOJEJ farby (rovnaká farba ako prúžok aj badge ×N),
          suma je väčšia a v `T.inkStrong`. */}
      <div className="grid grid-cols-2 gap-2.5">
        {ALLOC.map((a, ai) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setOpenTile(ai)}
            className="text-left"
            style={{
              background: `linear-gradient(180deg, ${a.color}1A 0%, ${a.color}08 46%, ${T.tileBg} 100%)`,
              border: `1px solid ${a.color}59`,
              borderRadius: 10,
              padding: '13px 13px 12px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45)`,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span
              aria-hidden
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: a.color }}
            />
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span
                style={{
                  fontFamily: FONT_TITLE,
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: T.inkDim,
                }}
              >
                {t(a.labelKey)}
              </span>
              <span
                style={{
                  // JetBrains Mono odišiel 12.8.2026 (font AINUBISA, nie chrámového povrchu).
                  // Váha 600 = strop Space Grotesku, 700 by bol fake bold.
                  fontFamily: FONT_UI,
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: a.color,
                  background: `${a.color}1F`,
                  borderRadius: 999,
                  padding: '1px 6px',
                }}
              >
                ×{a.share}
              </span>
            </div>
            {/* Suma = DÁTA → Space Grotesk (typografický lock: Cinzel = identita, Grotesk =
                čísla). ⚠️ Váha STROP 600 — Grotesk je načítaný len v 300–600. */}
            <div
              style={{
                fontFamily: FONT_UI,
                fontSize: 'clamp(23px, 5.2vw, 29px)',
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                color: T.inkStrong,
              }}
            >
              {money(treasuries[a.field])}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 10.5,
          color: T.inkDim,
          opacity: 0.75,
          marginTop: 9,
          textAlign: 'center',
        }}
      >
        {t('pack.invite.tapBlockHint')}
      </div>

      {/* Constitution link — Money is an Energy chapter.
          Odkaz ide do jazyka, v ktorom je pack (Matej 2026-08-12). Ústava existuje LEN v SK
          (root) a EN (`/en/`) — každý ďalší jazyk teda mieri na EN, nie na neexistujúcu mutáciu. */}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a
          href={`https://dogma.dogypt.com/${lang === 'sk' ? '' : 'en/'}#address`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: FONT_UI,
            fontSize: 11,
            color: T.inkDim,
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.accentGold)}
          onMouseLeave={e => (e.currentTarget.style.color = T.inkDim)}
        >
          {t('pack.stats.split')}
        </a>
      </div>

      {/* Footer — total raised so far (live) */}
      <div className="flex items-center justify-center" style={{ marginTop: 14 }}>
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 11,
            color: T.inkDim,
          }}
        >
          {t('pack.stats.raised', { amount: money(revenue) })}
        </span>
      </div>

      {/* Detail podielu — plná poznámka `transparency.part.*.note`, bez orezania.
          Papyrusový panel podľa locku: `T.panelGrad`, radius 14, `T.panelShadow`;
          rám nesie farbu svojho podielu, aby bolo jasné, na ktorý šuflík si klikol.
          ⚠️ PORTÁL DO `body` + `position:fixed`: karta `GlobePulse` má triedu
          `.pack-card-hover` s `will-change: transform`, čo z nej robí containing block —
          `fixed` vnútri by sa počítalo od karty, nie od okna. A `absolute` v tejto vysokej
          sekcii posadí panel do jej stredu, teda pri kratšom okne MIMO obrazovku (overené:
          po kliknutí bolo vidno len spodný riadok textu). */}
      {createPortal(
      <AnimatePresence>
        {openTile !== null && (
          <motion.div
            key="stats-tile-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpenTile(null)}
            className="fixed inset-0 flex items-center justify-center"
            style={{
              zIndex: 120,
              background: 'rgba(31, 26, 14, 0.55)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              padding: 18,
            }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 320,
                background: T.panelGrad,
                border: `1.5px solid ${ALLOC[openTile].color}`,
                borderRadius: 14,
                padding: '20px 18px 18px',
                boxShadow: T.panelShadow,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenTile(null)}
                aria-label={t('pack.invite.close')}
                className="absolute flex items-center justify-center"
                style={{
                  top: 10,
                  right: 10,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  border: `1px solid ${T.border}`,
                  color: T.inkWarm,
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <span className="flex gap-[5px]" style={{ marginBottom: 10 }}>
                {Array.from({ length: ALLOC[openTile].share }).map((_, i) => (
                  <span
                    key={i}
                    style={{ width: 8, height: 8, borderRadius: 999, background: ALLOC[openTile].color }}
                  />
                ))}
              </span>

              <div
                style={{
                  fontFamily: FONT_TITLE,
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: ALLOC[openTile].color,
                }}
              >
                {ALLOC[openTile].share}
                <span style={{ fontSize: '0.42em', opacity: 0.65 }}>/11</span>
              </div>
              <div
                style={{
                  fontFamily: FONT_TITLE,
                  fontSize: 13.5,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: T.inkStrong,
                  margin: '6px 0 9px',
                }}
              >
                {t(ALLOC[openTile].labelKey)}
              </div>
              <p
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: T.inkWarm,
                  margin: 0,
                }}
              >
                {t(ALLOC[openTile].noteKey)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body)}
    </div>
  );
}
