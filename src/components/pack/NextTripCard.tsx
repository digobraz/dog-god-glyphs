// NextTripCard — /pack homepage „next up" block (issue #44, 2026-08-03).
//
// SOURCE OF TRUTH: real triplist entries only (`readTriplist()` — @/lib/packStore-backed,
// write-through to Supabase `user_trips`), never the placeholder rows PackTriplist seeds
// into its own `myTrips` when the member hasn't planned anything yet. A countdown for a
// trip that doesn't actually exist in the member's own list would be showing them a lie —
// that's the mismatch this issue flagged (PackTriplist's own `nextUpDays`, ~line 404 there,
// still falls back to placeholders; today it's dead code — no subheader/badge renders it
// anymore, and the old D5 header badge that once did was removed, see PackMap.tsx comment
// near line 1874 — but if either resurfaces it should switch to this same real-only source).
// We don't edit PackTriplist.tsx per the task boundary; noted here as a debt for whoever
// re-adds it.
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { readLocalTrails, readWalkedIds } from './tripShared';
import { readTriplist } from './triplist/triplist';
import { PACK_THEME, FONT_UI } from './packTheme';
import { BrandIcon } from './BrandIcon';

const T = PACK_THEME;
const DAY_MS = 86400000;

// Počet dní = rozdiel KALENDÁRNYCH dní, nie hodín. Pôvodne sa polnoc cieľového dňa
// porovnávala s aktuálnym časom, takže výlet o tri dni ukázal poobede „2 days" —
// človek to vidí ako chybu appky, a právom. Math.round (nie floor) kvôli dňom,
// ktoré majú 23 alebo 25 hodín pri prechode na letný čas.
function daysFromNow(dateStr: string, nowMs: number): number {
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / DAY_MS);
}

// today = 0, tomorrow = 1, else "N days" (singular/plural handled here — the translation
// layer can't pluralize on its own, per this issue's spec).
function countdownLabel(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

export function NextTripCard() {
  const next = useMemo(() => {
    const nowMs = Date.now();
    const allTrails: HeroTrail[] = [...readLocalTrails(), ...HERO_JOURNEYS, ...HERO_TRAILS];
    const walked = readWalkedIds();
    const triplist = readTriplist();
    return Object.values(triplist)
      .filter((entry) => entry.date && !walked.has(entry.tripId) && daysFromNow(entry.date as string, nowMs) >= 0)
      .map((entry) => ({ entry, trail: allTrails.find((tr) => tr.id === entry.tripId) ?? null, nowMs }))
      .filter((x): x is { entry: typeof x.entry; trail: HeroTrail; nowMs: number } => !!x.trail)
      .sort((a, b) => daysFromNow(a.entry.date as string, a.nowMs) - daysFromNow(b.entry.date as string, b.nowMs))[0] ?? null;
  }, []);

  if (!next) {
    return (
      <div
        className="ntc-empty"
        style={{
          background: T.cardGrad,
          border: `1.5px solid ${T.cardEdge}`,
          borderRadius: 16,
          boxShadow: T.cardShadow,
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: T.tileBg,
            border: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BrandIcon name="map" size={20} tint="dark" />
        </span>
        <span style={{ flex: 1, minWidth: 200, fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.5, color: T.inkWarm }}>
          No trip planned yet — find a trail and add it to your list.
        </span>
        <Link
          to="/pack/map"
          className="inline-flex items-center justify-center gap-2"
          style={{
            // .btn-gold (brand manuál v3.2 — LOCKED)
            background: 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)',
            border: '1px solid rgba(250, 244, 236, 0.30)',
            borderRadius: 8,
            color: '#000',
            padding: '11px 16px',
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Explore the map
        </Link>
      </div>
    );
  }

  const { entry, trail } = next;
  const days = daysFromNow(entry.date as string, Date.now());

  return (
    <Link
      to={`/pack/map/${trail.id}`}
      className="pack-card-hover ntc-card"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
        padding: 14,
        textDecoration: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 92,
          height: 92,
          borderRadius: 10,
          backgroundImage: trail.photos[0] ? `url('${trail.photos[0]}')` : undefined,
          backgroundColor: '#1a1a1a',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        <span
          style={{
            fontFamily: FONT_UI,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: T.cardEdge,
          }}
        >
          Next up
        </span>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.25,
            color: T.inkStrong,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {trail.name}
        </span>
        <span style={{ fontFamily: FONT_UI, fontSize: 12, fontWeight: 700, color: T.cardEdge }}>
          {countdownLabel(days)}
        </span>
      </div>
    </Link>
  );
}
