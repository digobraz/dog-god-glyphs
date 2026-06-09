import { useState } from 'react';
import { X } from 'lucide-react';
import { PACK_THEME } from './packTheme';
import { countryFlag } from '@/lib/countryGeo';

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
}: {
  title: string;
  rows: RankRow[];
  slots?: number;
  kind: 'country' | 'breed';
}) {
  const [open, setOpen] = useState(false);
  const all = rows ?? [];
  const filled = all.slice(0, slots);
  const max = Math.max(1, ...filled.map((r) => r.count));
  const placeholders = Math.max(0, slots - filled.length);

  return (
    <div>
      {/* header — title + view all */}
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: T.inkDim,
          }}
        >
          {title}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
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
          View all →
        </button>
      </div>

      <div
        style={{
          background: T.card,
          border: `1px solid ${T.hairline}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(10,10,10,0.05)',
        }}
      >
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
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
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
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
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
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div
      onClick={onClose}
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
          maxWidth: 420,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(180deg, #FFFBF2, #FCF4DF)`,
          borderRadius: 20,
          border: `1px solid ${T.hairline}`,
          boxShadow: '0 40px 90px -30px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
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
            <span style={{ color: T.inkFaint, marginLeft: 8, fontSize: 11 }}>{rows.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: 'rgba(31,26,14,0.06)',
              border: 'none',
              cursor: 'pointer',
              color: T.inkDim,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {rows.length === 0 ? (
            <div
              style={{
                padding: '28px 20px',
                textAlign: 'center',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                color: T.inkDim,
              }}
            >
              No data yet — the board fills as the pack grows.
            </div>
          ) : (
            rows.map((r, i) => <RankRowView key={i} rank={i + 1} row={r} max={max} kind={kind} first={i === 0} />)
          )}
        </div>
      </div>
    </div>
  );
}
