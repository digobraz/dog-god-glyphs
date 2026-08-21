import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PACK_THEME, FONT_UI } from './packTheme';
import { countryFlag } from '@/lib/countryGeo';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

export interface RankRow {
  label: string;
  count: number;
}

function glyphFor(kind: 'country' | 'breed', label: string) {
  return kind === 'country' ? countryFlag(label) || '•' : '🐾';
}

// ─────────────────────────────────────────────────────────────────────────
// Generic pack ranking. Renders `slots` rows (real data top, empty = "—"), a
// header with title + "View all" trigger, and a modal listing the full board.
// ─────────────────────────────────────────────────────────────────────────
export function Ranking({
  title,
  rows,
  slots = 5,
  kind,
  onViewAll,
}: {
  title: string;
  rows: RankRow[];
  slots?: number;
  kind: 'country' | 'breed';
  /** Keď je zadané, „Zobraziť všetko" NEOTVÁRA vlastný modál tejto tabuľky, ale zavolá
   *  rodiča — ten ukáže OBA rebríčky naraz (Matej 13.8.: „je jedno kam človek klikne").
   *  Bez neho si komponent otvorí svoj jednotabuľkový modál ako predtým. */
  onViewAll?: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const all = rows ?? [];
  const filled = all.slice(0, slots);
  const max = Math.max(1, ...filled.map((r) => r.count));
  const placeholders = Math.max(0, slots - filled.length);

  return (
    <div>
      <div
        style={{
          background: T.cardGrad,
          border: `1.5px solid ${T.cardEdge}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: T.cardShadow,
        }}
      >
        {/* Hlavička ŽIJE VNÚTRI karty (Matej 2026-08-12: „nepáčia sa mi tie nadpisy ako sú
            zle viditelné a pod sú tabuľky — schovajme to do tej tabuľky, oddelme to čiarou").
            Predtým plávala nad kartou v Cinzel 10 px / inkDim a strácala sa na pozadí.
            Teraz: Space Grotesk 500 (eyebrow lock z 26.7.), tmavší inkWarm, a pod ňou
            zlatá `T.rule` — NIE šedý hairline, ten je na riadky tabuľky. */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '13px 16px 11px' }}
        >
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: T.inkWarm,
            }}
          >
            {title}
          </div>
          <button
            type="button"
            onClick={() => (onViewAll ? onViewAll() : setOpen(true))}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: T.accentGold,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {t('pack.rank.viewAll')}
          </button>
        </div>

        {/* deliaca čiara hlavička ↔ tabuľka (papyrus lock: zlatá, vyblednutá do strán, 2px) */}
        <div style={{ height: 2, background: T.rule }} />

        {filled.map((r, i) => (
          <RankRowView key={`f-${i}`} rank={i + 1} row={r} max={max} kind={kind} first={i === 0} />
        ))}
        {Array.from({ length: placeholders }).map((_, i) => (
          <PlaceholderRow
            key={`p-${i}`}
            rank={filled.length + i + 1}
            first={filled.length === 0 && i === 0}
          />
        ))}
      </div>

      {open && (
        <RankingModal title={title} rows={all} kind={kind} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

function RankRowView({
  rank,
  row,
  max,
  kind,
  first,
}: {
  rank: number;
  row: RankRow;
  max: number;
  kind: 'country' | 'breed';
  first: boolean;
}) {
  const pct = (row.count / max) * 100;
  const glyph = glyphFor(kind, row.label);
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: '30px 26px 1fr auto',
        gap: 11,
        padding: '13px 16px',
        borderTop: first ? 'none' : `1px solid ${T.hairline}`,
      }}
    >
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: T.inkDim, letterSpacing: '0.1em' }}>
        {String(rank).padStart(2, '0')}
      </span>
      <span style={{ fontSize: kind === 'country' ? 19 : 16, lineHeight: 1 }}>{glyph}</span>
      <div className="min-w-0">
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: T.ink,
            marginBottom: 5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {row.label}
        </div>
        <div style={{ height: 4, background: T.hairline, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: T.ink, borderRadius: 2 }} />
        </div>
      </div>
      <span
        style={{
          // JetBrains Mono odišiel 13.8.2026 — rovnako ako z `GlobePulse` a `TransparentStats`:
          // je to hlas AINUBISA (stroj) a tu bol štvrtým fontom na stránke. Číslo = dáta → FONT_UI.
          // Weight 600 je strop, Space Grotesk je načítaný len 300–600.
          fontFamily: FONT_UI,
          fontSize: 14,
          color: T.ink,
          minWidth: 30,
          textAlign: 'right',
          fontWeight: 600,
        }}
      >
        {row.count}
      </span>
    </div>
  );
}

function PlaceholderRow({ rank, first }: { rank: number; first: boolean }) {
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: '30px 26px 1fr auto',
        gap: 11,
        padding: '13px 16px',
        borderTop: first ? 'none' : `1px solid ${T.hairline}`,
        opacity: 0.45,
      }}
    >
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: T.inkFaint, letterSpacing: '0.1em' }}>
        {String(rank).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 16, lineHeight: 1, color: T.inkFaint }}>—</span>
      <div className="min-w-0">
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13.5, fontWeight: 600, color: T.inkFaint }}>
          —
        </div>
      </div>
      <span
        style={{
          fontFamily: FONT_UI,
          fontSize: 14,
          color: T.inkFaint,
          minWidth: 30,
          textAlign: 'right',
        }}
      >
        —
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Obal modálov rebríčkov — portál, Esc, klik mimo, centrovanie.
//
// ⚠️ `createPortal(…, document.body)` je POVINNÝ, nie kozmetika. Karty homepage majú
//    `.pack-card-hover { will-change: transform }` a to z karty robí containing block
//    pre `position: fixed`. Modál vykreslený vnútri karty preto pristál na `top: 1253px`
//    pri okne 885 px, zatváracie tlačidlo na 1758 px, a `overflow: hidden` na karte
//    zvyšok orezal — človek nevidel nič a musel reloadnúť stránku. Presne toto bol
//    blocker z auditu 12. 8. 2026. Ak sa portál niekedy zruší, porucha sa vráti.
// ─────────────────────────────────────────────────────────────────────────
function ModalShell({
  onClose,
  maxWidth,
  children,
}: {
  onClose: () => void;
  maxWidth: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Pozadie sa pod modálom nesmie scrollovať — inak sa pri swipe na mobile hýbe
    // stránka a modál pôsobí zaseknuto.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(20,16,8,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: T.panelGrad,
          borderRadius: 14,
          border: `1.5px solid ${T.cardEdge}`,
          boxShadow: T.panelShadow,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ModalHeader({ title, count, onClose }: { title: string; count?: number; onClose: () => void }) {
  const t = useT();
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: '18px 20px', borderBottom: `1px solid ${T.hairline}` }}
    >
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 13,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: T.ink,
        }}
      >
        {title}
        {count !== undefined && (
          <span style={{ color: T.inkFaint, marginLeft: 8, fontSize: 11 }}>{count}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('pack.rank.ariaClose')}
        className="inline-flex items-center justify-center"
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: T.tileBg,
          border: 'none',
          cursor: 'pointer',
          color: T.inkDim,
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function RankList({ rows, kind }: { rows: RankRow[]; kind: 'country' | 'breed' }) {
  const t = useT();
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: '28px 20px',
          textAlign: 'center',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          color: T.inkDim,
        }}
      >
        {t('pack.rank.noData')}
      </div>
    );
  }
  return (
    <>
      {rows.map((r, i) => (
        <RankRowView key={i} rank={i + 1} row={r} max={max} kind={kind} first={i === 0} />
      ))}
    </>
  );
}

/** Jednotabuľkový modál — ostáva pre povrchy, ktoré `onViewAll` nepoužívajú. */
function RankingModal({
  title,
  rows,
  kind,
  onClose,
}: {
  title: string;
  rows: RankRow[];
  kind: 'country' | 'breed';
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} maxWidth={420}>
      <ModalHeader title={title} count={rows.length} onClose={onClose} />
      <div style={{ overflowY: 'auto' }}>
        <RankList rows={rows} kind={kind} />
      </div>
    </ModalShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// OBA rebríčky v JEDNOM modáli (Matej 13.8.2026: „prerob na velky popup ktorý ukáže
// top krajiny a top plemená naraz = je jedno kam človek klikne na zobraziť všetko").
// Nad 720 px dva stĺpce vedľa seba, pod tým pod sebou. Scrolluje CELÉ telo, nie
// každý stĺpec zvlášť — dva nezávislé scrolly v jednom okne sa na mobile navzájom
// kradnú a človek nevie, čo práve ťahá.
// ─────────────────────────────────────────────────────────────────────────
export function RankingBoardsModal({
  title,
  boards,
  onClose,
}: {
  title: string;
  boards: { title: string; rows: RankRow[]; kind: 'country' | 'breed' }[];
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} maxWidth={820}>
      <ModalHeader title={title} onClose={onClose} />
      <div style={{ overflowY: 'auto', padding: 16 }}>
        <div className="rank-boards">
          {boards.map((b) => (
            <div
              key={b.title}
              style={{
                background: T.cardGrad,
                border: `1.5px solid ${T.cardEdge}`,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: T.cardShadow,
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ padding: '13px 16px 11px' }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: T.inkWarm,
                  }}
                >
                  {b.title}
                </div>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 11,
                    fontWeight: 500,
                    color: T.inkFaint,
                  }}
                >
                  {b.rows.length}
                </span>
              </div>
              <div style={{ height: 2, background: T.rule }} />
              <RankList rows={b.rows} kind={b.kind} />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .rank-boards{ display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:721px){ .rank-boards{ grid-template-columns:1fr 1fr; align-items:start; } }
      `}</style>
    </ModalShell>
  );
}
