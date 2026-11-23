/**
 * MembersPanel — záložka MEMBERS v `/admin` (dohľad nad členmi).
 *
 * Šat = AINUBIS brand (tmavomodrý displej, tokeny z `ainubisSkin.ts`), nie zlaté /admin.
 * Dáta: RPC `admin_members`, `admin_member_events`, `admin_member_limits`,
 * `admin_set_member_limit`. Limity nič neblokujú — prekročenie = vlajka.
 * Obsah (mená, e-maily) sa renderuje len ako text, nikdy ako HTML.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { AINUBIS } from '@/components/pack/ainubisSkin';
// Písma ako v Admin.tsx — vlastná kópia, nie import: Admin importuje tento panel a panel ich
// používa už pri načítaní modulu (kruhový import = „Cannot access 'GROTESK' before initialization").
const CINZEL = "'Cinzel', serif";
const GROTESK = "'Space Grotesk', sans-serif";

type Sev = 'red' | 'orange';
type Rank = 'veriaci' | 'akolyta' | 'knaz' | 'vezir' | 'farao';

interface Flag { rule: string; label: string; value: number; lim: number; unit: string; severity: Sev }
interface Member {
  uid: string; email: string | null; name: string | null; since: string | null;
  last_sign_in: string | null; last_active: string | null;
  dogs: { name: string; n: number | null; status: string }[];
  number: number | null; rank: Rank; paid: boolean; founder: boolean;
  life: {
    active_days: number; days_logged: number; walked: string[]; trips_added: number; trips_added_km: number;
    posts: number; comments: number; map_notes: number; bones: number; ai_msgs: number; ai_usd: number; taps: number;
  };
  d7: boolean[]; d30: number;
  app: { platform?: string; version?: string; device?: string; at?: string } | null;
  taps_7d: number;
  ai: {
    msgs_month: number; usd_month: number; usd_today: number; credits_used: number; credits_limit: number;
    down: number; reports: number; models: Record<string, number>;
  };
  protect: { rate_limit_30d: number; login_fail_30d: number };
  flags: Flag[];
}
interface MemberEvent { at: string; kind: string; label: string; detail: string | null; hot: boolean }
interface LimitRow { rule: string; label: string; value: number; unit: string; severity: Sev; enabled: boolean; sort: number }

type View = 'members' | 'boards' | 'ranks';
type Filter = 'all' | 'flag' | 'active' | 'paid';
type SortKey = 'flag' | 'name' | 'rank' | 'd7' | 'life' | 'taps' | 'usd' | 'credits' | 'protect';

const RANK_NAME: Record<Rank, string> = {
  veriaci: 'Veriaci', akolyta: 'Kazateľ', knaz: 'Apoštol', vezir: 'Prorok', farao: 'Vezír',
};
const RANK_ORDER: Rank[] = ['veriaci', 'akolyta', 'knaz', 'vezir', 'farao'];
const RANK_BADGE: Record<Rank, string | null> = {
  veriaci: null,
  akolyta: '/web-app/odznaky/dogyptan-1.webp',
  knaz: '/web-app/odznaky/dogyptan-2.webp',
  vezir: '/web-app/odznaky/dogyptan-3.webp',
  farao: '/web-app/odznaky/dogyptan-4.webp',
};

// ── pomocné ──────────────────────────────────────────────────────────────────
const rpc = (name: string, args?: Record<string, unknown>) => (supabase as any).rpc(name, args);

const sevOf = (m: Member): number =>
  m.flags.some((f) => f.severity === 'red') ? 2 : m.flags.length > 0 ? 1 : 0;
const d7Count = (m: Member) => m.d7.filter(Boolean).length;
const usd = (n: number | null | undefined) => `$${(Number(n) || 0).toFixed(2)}`;
const fmtDT = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' }) : '—';
const fmtD = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('sk-SK', { timeZone: 'Europe/Bratislava' }) : '—';
const ago = (iso: string | null | undefined): string => {
  if (!iso) return 'nikdy';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `pred ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `pred ${Math.round(s / 3600)} h`;
  return `pred ${Math.round(s / 86400)} d`;
};
const dogLine = (m: Member) =>
  m.dogs.map((d) => `${d.name}${d.n != null ? ` #${d.n}` : ''}`).join(', ') || '—';
const who = (m: Member) => m.name || m.email || m.uid.slice(0, 8);

const NUM: CSSProperties = { fontVariantNumeric: 'tabular-nums' };

// ── drobné prvky ─────────────────────────────────────────────────────────────
function Dot({ sev }: { sev: number }) {
  const c = sev === 2 ? AINUBIS.danger : sev === 1 ? AINUBIS.ctaA : AINUBIS.inkFaint;
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: c, flex: 'none' }} />;
}

function Pill({ children, tone = 'plain', style }: { children: ReactNode; tone?: 'plain' | 'cta' | 'danger' | 'ok'; style?: CSSProperties }) {
  const t = {
    plain: { c: AINUBIS.inkDim, b: AINUBIS.edge, bg: 'transparent' },
    cta: { c: AINUBIS.ctaA, b: AINUBIS.ctaEdge, bg: AINUBIS.ctaTint },
    danger: { c: AINUBIS.danger, b: AINUBIS.dangerEdge, bg: AINUBIS.dangerTint },
    ok: { c: AINUBIS.ok, b: AINUBIS.okEdge, bg: AINUBIS.okTint },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 999,
      border: `1px solid ${t.b}`, background: t.bg, color: t.c, fontFamily: GROTESK, fontWeight: 500,
      fontSize: 10, letterSpacing: '.02em', whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

function RankPill({ m }: { m: Member }) {
  const b = RANK_BADGE[m.rank];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <Pill tone={m.rank === 'veriaci' ? 'plain' : 'cta'}>
        {b && <img src={b} alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} />}
        {RANK_NAME[m.rank]}
      </Pill>
      {m.founder && <Pill tone="cta">Zakladateľ</Pill>}
    </span>
  );
}

function Bars7({ d7 }: { d7: boolean[] }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4, height: 16 }}>
      {d7.map((on, i) => (
        <span key={i} style={{
          width: 4, height: on ? 16 : 4, borderRadius: 999,
          background: on ? AINUBIS.cyan : `rgba(${AINUBIS.cyanRGB},0.25)`,
        }} />
      ))}
    </span>
  );
}

/** 1 deň · 2–4 dni · 5 dní */
const dni = (n: number) => `${n} ${n === 1 ? 'deň' : n >= 2 && n <= 4 ? 'dni' : 'dní'}`;

function Meter({ used, limit }: { used: number; limit: number }) {
  const over = limit > 0 && used > limit;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: 80 }}>
      <span style={{ ...NUM, fontSize: 12, color: over ? AINUBIS.danger : AINUBIS.inkDim }}>{Math.round(Number(used) || 0)} / {limit || '—'}</span>
      <span style={{ height: 4, borderRadius: 999, background: `rgba(${AINUBIS.cyanRGB},0.15)`, overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: over ? AINUBIS.danger : AINUBIS.cyan }} />
      </span>
    </span>
  );
}

const eyebrow: CSSProperties = {
  fontFamily: GROTESK, fontWeight: 500, fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: AINUBIS.inkFaint,
};
const cardTitle: CSSProperties = {
  fontFamily: CINZEL, fontWeight: 700, fontSize: 16, letterSpacing: '.14em', color: AINUBIS.ink, margin: 0,
};

// ── hlavný panel ─────────────────────────────────────────────────────────────
export default function MembersPanel({ initialUserId, onFlagged }: { initialUserId?: string | null; onFlagged?: (n: number) => void }) {
  const isMobile = useIsMobile();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [err, setErr] = useState('');
  const [view, setView] = useState<View>('members');
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const [openUid, setOpenUid] = useState<string | null>(initialUserId || null);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [kmMap, setKmMap] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    const { data, error } = await rpc('admin_members');
    if (error) { setErr(error.message || String(error)); return; }
    setErr('');
    setMembers(Array.isArray(data) ? (data as Member[]) : []);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (initialUserId) setOpenUid(initialUserId); }, [initialUserId]);

  // HERO_TRAILS má 400 KB — dynamicky, nech nezaťaží zvyšok /admin.
  useEffect(() => {
    let alive = true;
    import('@/data/heroTrails.generated').then((mod) => {
      const map: Record<string, number> = {};
      for (const t of (mod as any).HERO_TRAILS || []) map[t.id] = Number(t.km) || 0;
      if (alive) setKmMap(map);
    }).catch(() => { /* km ostanú len z pridaných výletov */ });
    return () => { alive = false; };
  }, []);

  const kmOf = useCallback(
    (m: Member) => m.life.walked.reduce((s, slug) => s + (kmMap[slug] || 0), 0) + (Number(m.life.trips_added_km) || 0),
    [kmMap],
  );

  const flaggedRed = useMemo(() => (members || []).filter((m) => sevOf(m) === 2).length, [members]);
  useEffect(() => { if (members) onFlagged?.(flaggedRed); }, [members, flaggedRed, onFlagged]);

  const kpi = useMemo(() => {
    const ms = members || [];
    return {
      total: ms.length,
      active7: ms.filter((m) => d7Count(m) > 0).length,
      usd: ms.reduce((s, m) => s + (Number(m.ai.usd_month) || 0), 0),
      flagged: ms.filter((m) => sevOf(m) > 0).length,
    };
  }, [members]);

  const rows = useMemo(() => {
    let ms = (members || []).slice();
    if (filter === 'flag') ms = ms.filter((m) => sevOf(m) > 0);
    if (filter === 'active') ms = ms.filter((m) => d7Count(m) > 0);
    if (filter === 'paid') ms = ms.filter((m) => m.paid);
    const needle = q.trim().toLowerCase();
    if (needle) {
      ms = ms.filter((m) =>
        (m.name || '').toLowerCase().includes(needle) || (m.email || '').toLowerCase().includes(needle)
        || m.dogs.some((d) => String(d.n ?? '') === needle.replace('#', '') || d.name.toLowerCase().includes(needle)));
    }
    const val = (m: Member): number | string => {
      switch (sort?.key) {
        case 'name': return who(m).toLowerCase();
        case 'rank': return RANK_ORDER.indexOf(m.rank);
        case 'd7': return d7Count(m);
        case 'life': return m.life.active_days;
        case 'taps': return m.taps_7d;
        case 'usd': return Number(m.ai.usd_month) || 0;
        case 'credits': return m.ai.credits_limit > 0 ? m.ai.credits_used / m.ai.credits_limit : 0;
        case 'protect': return m.protect.rate_limit_30d + m.protect.login_fail_30d;
        default: return sevOf(m);
      }
    };
    if (sort && sort.key !== 'flag') {
      ms.sort((a, b) => {
        const x = val(a), y = val(b);
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
      });
    } else {
      const dir = sort?.dir ?? -1;
      ms.sort((a, b) => (sevOf(a) - sevOf(b)) * dir || (Number(b.ai.usd_month) || 0) - (Number(a.ai.usd_month) || 0));
    }
    return ms;
  }, [members, filter, q, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s && s.key === key ? { key, dir: (s.dir === 1 ? -1 : 1) as 1 | -1 } : { key, dir: key === 'name' ? 1 : -1 }));

  const pad = isMobile ? 16 : 24;
  const opened = members?.find((m) => m.uid === openUid) || null;

  const pillBtn = (active: boolean): CSSProperties => ({
    padding: '8px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: GROTESK, fontWeight: 500, fontSize: 12,
    letterSpacing: '.02em', border: `1px solid ${active ? AINUBIS.edgeStrong : AINUBIS.edge}`,
    background: active ? `rgba(${AINUBIS.cyanRGB},0.14)` : 'transparent', color: active ? AINUBIS.ink : AINUBIS.inkDim,
  });

  return (
    <div style={{
      background: AINUBIS.surface, border: `1px solid ${AINUBIS.edge}`, borderRadius: 16, padding: pad,
      color: AINUBIS.inkDim, fontFamily: GROTESK, display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
        {([
          ['Members', String(kpi.total), false],
          ['Active 7 d', String(kpi.active7), false],
          ['AI this month', usd(kpi.usd), false],
          ['Flagged', String(kpi.flagged), kpi.flagged > 0],
        ] as [string, string, boolean][]).map(([l, v, warn]) => (
          <div key={l} style={{
            background: AINUBIS.raised, border: `1px solid ${warn ? AINUBIS.dangerEdge : AINUBIS.edge}`,
            borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={eyebrow}>{l}</span>
            <span style={{ ...NUM, fontFamily: CINZEL, fontWeight: 700, fontSize: 24, color: warn ? AINUBIS.danger : AINUBIS.ink }}>{v}</span>
          </div>
        ))}
      </div>

      {/* prepínač pohľadu + Limits */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {([['members', 'Členovia'], ['boards', 'Rebríčky'], ['ranks', 'Hodnosti']] as [View, string][]).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setView(k)} style={pillBtn(view === k)}>{l}</button>
        ))}
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => setLimitsOpen(true)} style={pillBtn(false)}>Limits</button>
      </div>

      {err && <div style={{ color: AINUBIS.danger, fontSize: 14 }}>DB error: {err}</div>}
      {!err && members === null && <div style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Načítavam…</div>}

      {members && view === 'members' && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {([['all', 'Všetci'], ['flag', 'S vlajkou'], ['active', 'Aktívni 7 d'], ['paid', 'Platiaci']] as [Filter, string][]).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} style={pillBtn(filter === k)}>{l}</button>
            ))}
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hľadať: meno, e-mail, číslo psa"
              style={{
                flex: 1, minWidth: 160, padding: '8px 12px', borderRadius: 12, border: `1px solid ${AINUBIS.edge}`,
                background: AINUBIS.raised, color: AINUBIS.ink, fontFamily: GROTESK, fontSize: 14, outline: 'none',
              }}
            />
          </div>
          {rows.length === 0 && <div style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Nikto nevyhovuje.</div>}
          {rows.length > 0 && (isMobile
            ? <MemberCards rows={rows} onOpen={setOpenUid} />
            : <MemberTable rows={rows} sort={sort} onSort={toggleSort} onOpen={setOpenUid} kmOf={kmOf} />)}
        </>
      )}

      {members && view === 'boards' && <Boards members={members} kmOf={kmOf} isMobile={isMobile} onOpen={setOpenUid} />}
      {members && view === 'ranks' && <Ranks members={members} kmOf={kmOf} />}

      {opened && (
        <MemberDrawer m={opened} km={kmOf(opened)} isMobile={isMobile} onClose={() => setOpenUid(null)} />
      )}
      {limitsOpen && (
        <LimitsDrawer isMobile={isMobile} onClose={() => setLimitsOpen(false)} onSaved={load} />
      )}
    </div>
  );
}

// ── tabuľka (PC) ─────────────────────────────────────────────────────────────
function MemberTable({ rows, sort, onSort, onOpen, kmOf }: {
  rows: Member[]; sort: { key: SortKey; dir: 1 | -1 } | null; onSort: (k: SortKey) => void;
  onOpen: (uid: string) => void; kmOf: (m: Member) => number;
}) {
  const cols: [SortKey, string][] = [
    ['flag', 'Vlajka'], ['name', 'Člen'], ['rank', 'Členstvo'], ['d7', 'Aktivita 7 d'], ['life', 'Celý život'],
    ['taps', 'Appka'], ['usd', 'AINUBIS mesiac'], ['credits', 'Kredity'], ['protect', 'Ochrana'],
  ];
  const th: CSSProperties = { ...eyebrow, textAlign: 'left', padding: '8px 12px', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none', borderBottom: `1px solid ${AINUBIS.edge}`, background: 'transparent', borderTop: 0, borderLeft: 0, borderRight: 0 };
  const td: CSSProperties = { padding: '12px', verticalAlign: 'top', fontSize: 12, borderBottom: `1px solid rgba(${AINUBIS.cyanRGB},0.12)` };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {cols.map(([k, l]) => (
              <th key={k} style={{ padding: 0 }}>
                <button type="button" onClick={() => onSort(k)} style={{ ...th, width: '100%', color: sort?.key === k ? AINUBIS.cyan : AINUBIS.inkFaint }}>
                  {l}{sort?.key === k ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const sev = sevOf(m);
            return (
              <tr key={m.uid} onClick={() => onOpen(m.uid)} style={{ cursor: 'pointer' }}>
                <td style={td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', color: sev === 2 ? AINUBIS.danger : sev === 1 ? AINUBIS.ctaA : AINUBIS.inkFaint }}>
                    <Dot sev={sev} />{sev === 2 ? 'podozrivé' : sev === 1 ? 'pozor' : '—'}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ color: AINUBIS.ink, fontSize: 14, fontWeight: 600 }}>{who(m)}</div>
                  <div style={{ color: AINUBIS.inkFaint }}>{dogLine(m)}</div>
                </td>
                <td style={td}>
                  <RankPill m={m} />
                  <div style={{ color: AINUBIS.inkFaint, marginTop: 4 }}>od {fmtD(m.since)}</div>
                </td>
                <td style={td}>
                  <Bars7 d7={m.d7} />
                  <div style={{ color: AINUBIS.inkFaint, marginTop: 4 }}>{ago(m.last_active)}</div>
                </td>
                <td style={{ ...td, ...NUM }}>
                  <div>{dni(m.life.active_days)}</div>
                  <div style={{ color: AINUBIS.inkFaint }}>{kmOf(m).toFixed(0)} km · {m.life.walked.length} prejdených</div>
                </td>
                <td style={{ ...td, ...NUM }}>
                  <div>{m.taps_7d} ťukov</div>
                  <div style={{ color: AINUBIS.inkFaint }}>{m.app ? `${m.app.device || m.app.platform || '?'} · ${m.app.version || '?'}` : '—'}</div>
                </td>
                <td style={{ ...td, ...NUM }}>
                  <div>{usd(m.ai.usd_month)}</div>
                  <div style={{ color: AINUBIS.inkFaint }}>dnes {usd(m.ai.usd_today)}</div>
                </td>
                <td style={td}><Meter used={m.ai.credits_used} limit={m.ai.credits_limit} /></td>
                <td style={{ ...td, ...NUM }}>{m.protect.rate_limit_30d + m.protect.login_fail_30d}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── karty (mobil) ────────────────────────────────────────────────────────────
function MemberCards({ rows, onOpen }: { rows: Member[]; onOpen: (uid: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((m) => {
        const sev = sevOf(m);
        return (
          <button key={m.uid} type="button" onClick={() => onOpen(m.uid)} style={{
            textAlign: 'left', cursor: 'pointer', background: AINUBIS.raised, borderRadius: 14, padding: 16,
            border: `1px solid ${sev === 2 ? AINUBIS.dangerEdge : sev === 1 ? AINUBIS.ctaEdge : AINUBIS.edge}`,
            display: 'flex', flexDirection: 'column', gap: 8, fontFamily: GROTESK, color: AINUBIS.inkDim,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dot sev={sev} />
              <span style={{ color: AINUBIS.ink, fontSize: 14, fontWeight: 600, flex: 1 }}>{who(m)}</span>
              <RankPill m={m} />
            </span>
            <span style={{ fontSize: 12, color: AINUBIS.inkFaint }}>{dogLine(m)}</span>
            <span style={{ ...NUM, fontSize: 12, display: 'flex', gap: 16 }}>
              <span>{d7Count(m)}/7 dní</span><span>{usd(m.ai.usd_month)}</span>
            </span>
            {m.flags[0] && (
              <span style={{ fontSize: 12, color: m.flags[0].severity === 'red' ? AINUBIS.danger : AINUBIS.ctaA }}>
                {m.flags[0].label}: {m.flags[0].value}{m.flags[0].unit === '$' ? ' $' : ''}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── šuplík — spoločný obal ───────────────────────────────────────────────────
function Drawer({ title, isMobile, onClose, children }: { title: string; isMobile: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.60)' }} />
      <aside style={{
        position: 'relative', width: isMobile ? '100%' : 480, maxWidth: '100%', height: '100%', overflowY: 'auto',
        background: AINUBIS.surface, borderLeft: `1px solid ${AINUBIS.edgeStrong}`, padding: isMobile ? 16 : 24,
        display: 'flex', flexDirection: 'column', gap: 24, color: AINUBIS.inkDim, fontFamily: GROTESK,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ ...cardTitle, fontSize: 20, flex: 1 }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Zavrieť" style={{
            background: 'transparent', border: `1px solid ${AINUBIS.edge}`, borderRadius: 8, padding: 8, cursor: 'pointer',
            color: AINUBIS.ink, display: 'inline-flex',
          }}><span style={{ position: 'relative', width: 16, height: 16, display: 'block' }}><span style={{ position: 'absolute', left: 0, top: 7, width: 16, height: 2, borderRadius: 999, background: 'currentColor', transform: 'rotate(45deg)' }} /><span style={{ position: 'absolute', left: 0, top: 7, width: 16, height: 2, borderRadius: 999, background: 'currentColor', transform: 'rotate(-45deg)' }} /></span></button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={eyebrow}>{title}</div>
      {children}
    </section>
  );
}

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ background: AINUBIS.raised, border: `1px solid ${AINUBIS.edge}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, color: AINUBIS.inkFaint }}>{k}</span>
      <span style={{ ...NUM, fontSize: 14, color: AINUBIS.ink, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

// ── detail člena ─────────────────────────────────────────────────────────────
function MemberDrawer({ m, km, isMobile, onClose }: { m: Member; km: number; isMobile: boolean; onClose: () => void }) {
  const [events, setEvents] = useState<MemberEvent[] | null>(null);
  const [evErr, setEvErr] = useState('');
  useEffect(() => {
    let alive = true;
    setEvents(null); setEvErr('');
    rpc('admin_member_events', { p_uid: m.uid, p_limit: 50 }).then(({ data, error }: any) => {
      if (!alive) return;
      if (error) setEvErr(error.message || String(error));
      else setEvents(Array.isArray(data) ? data : []);
    });
    return () => { alive = false; };
  }, [m.uid]);

  const L = m.life;
  const models = Object.entries(m.ai.models || {});
  return (
    <Drawer title={who(m)} isMobile={isMobile} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <RankPill m={m} />
        {m.email && <span style={{ fontSize: 12, color: AINUBIS.inkFaint }}>{m.email}</span>}
        <span style={{ fontSize: 12, color: AINUBIS.inkFaint }}>{dogLine(m)}</span>
      </div>

      <Section title="Prečo vlajka">
        {m.flags.length === 0 && <span style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Bez vlajky.</span>}
        {m.flags.map((f) => (
          <div key={f.rule} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, fontSize: 12,
            border: `1px solid ${f.severity === 'red' ? AINUBIS.dangerEdge : AINUBIS.ctaEdge}`,
            background: f.severity === 'red' ? AINUBIS.dangerTint : AINUBIS.ctaTint,
            color: f.severity === 'red' ? AINUBIS.danger : AINUBIS.ctaA,
          }}>
            <Dot sev={f.severity === 'red' ? 2 : 1} />
            <span style={NUM}>{f.label}: {f.value}{f.unit === '$' ? ' $' : ''} · strop {f.lim}{f.unit === '$' ? ' $' : ''}</span>
          </div>
        ))}
      </Section>

      <Section title="Celý život">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <KV k="Člen od" v={fmtD(m.since)} />
          <KV k="Aktívne dni" v={L.active_days} />
          <KV k="Zápisy dní" v={L.days_logged} />
          <KV k="Kilometre" v={`${km.toFixed(0)} km`} />
          <KV k="Prejdené výlety" v={L.walked.length} />
          <KV k="Pridané výlety" v={L.trips_added} />
          <KV k="Príspevky" v={L.posts} />
          <KV k="Komentáre" v={L.comments} />
          <KV k="Značky na mape" v={L.map_notes} />
          <KV k="BONES" v={L.bones} />
          <KV k="Správy AINUBISovi" v={L.ai_msgs} />
          <KV k="AI spolu" v={usd(L.ai_usd)} />
          <KV k="Ťuky" v={L.taps} />
        </div>
      </Section>

      <Section title="Posledných 30 dní">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <KV k="Aktívne dni z 30" v={m.d30} />
          <KV k="Posledná aktivita" v={fmtDT(m.last_active)} />
          <KV k="Zariadenie" v={m.app ? `${m.app.device || m.app.platform || '?'} · ${m.app.version || '?'}` : '—'} />
          <KV k="Ťuky 7 d" v={m.taps_7d} />
        </div>
      </Section>

      <Section title="AINUBIS">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <KV k="Mesiac" v={`${usd(m.ai.usd_month)} (dnes ${usd(m.ai.usd_today)})`} />
          <KV k="Správy" v={m.ai.msgs_month} />
          <KV k="Kredity" v={`${Math.round(Number(m.ai.credits_used) || 0)} / ${m.ai.credits_limit || '—'}`} />
          <KV k="Ochrana 30 d" v={`${m.protect.rate_limit_30d} limit · ${m.protect.login_fail_30d} login`} />
        </div>
        {models.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {models.map(([name, n]) => <Pill key={name}>{name} {n}</Pill>)}
          </div>
        )}
      </Section>

      <Section title="Posledné udalosti">
        {evErr && <span style={{ fontSize: 14, color: AINUBIS.danger }}>DB error: {evErr}</span>}
        {!evErr && events === null && <span style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Načítavam…</span>}
        {events && events.length === 0 && <span style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Žiadne udalosti.</span>}
        {events && events.map((e, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12,
            background: e.hot ? AINUBIS.dangerTint : 'transparent',
            color: e.hot ? AINUBIS.danger : AINUBIS.inkDim,
          }}>
            <span style={{ ...NUM, color: e.hot ? AINUBIS.danger : AINUBIS.inkFaint, flex: 'none', width: 120 }}>{fmtDT(e.at)}</span>
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
              <b style={{ fontWeight: 600 }}>{e.label}</b>{e.detail ? ` · ${e.detail}` : ''}
            </span>
          </div>
        ))}
      </Section>
    </Drawer>
  );
}

// ── rebríčky ─────────────────────────────────────────────────────────────────
function Boards({ members, kmOf, isMobile, onOpen }: { members: Member[]; kmOf: (m: Member) => number; isMobile: boolean; onOpen: (uid: string) => void }) {
  type Board = { title: string; val: (m: Member) => number; fmt: (n: number) => string; tie?: (m: Member) => number };
  const boards: Board[] = [
    { title: 'Najviac km', val: kmOf, fmt: (n) => `${n.toFixed(0)} km` },
    { title: 'Najviac prejdených výletov', val: (m) => m.life.walked.length, fmt: String },
    { title: 'Najviac aktívnych dní', val: (m) => m.life.active_days, fmt: String },
    { title: 'Najviac zápisov dňa', val: (m) => m.life.days_logged, fmt: String },
    { title: 'Najviac príspevkov', val: (m) => m.life.posts, fmt: String },
    { title: 'Najviac BONES', val: (m) => m.life.bones, fmt: String },
    { title: 'Najviac správ AINUBISovi', val: (m) => m.life.ai_msgs, fmt: String },
    { title: 'Najdrahší na AI (celkom)', val: (m) => Number(m.life.ai_usd) || 0, fmt: usd },
    { title: 'Najaktívnejší 7 dní', val: d7Count, fmt: (n) => `${n}/7`, tie: (m) => m.taps_7d },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
      {boards.map((b) => {
        const top = members.map((m) => ({ m, v: b.val(m), t: b.tie ? b.tie(m) : 0 }))
          .filter((x) => x.v > 0)
          .sort((a, c) => c.v - a.v || c.t - a.t)
          .slice(0, 10);
        return (
          <div key={b.title} style={{ background: AINUBIS.raised, border: `1px solid ${AINUBIS.edge}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={cardTitle}>{b.title}</h3>
            {top.length === 0 && <span style={{ fontSize: 12, color: AINUBIS.inkFaint }}>Zatiaľ nikto.</span>}
            {top.map((x, i) => (
              <button key={x.m.uid} type="button" onClick={() => onOpen(x.m.uid)} style={{
                display: 'flex', alignItems: 'baseline', gap: 12, background: 'transparent', border: 0, padding: 0,
                cursor: 'pointer', textAlign: 'left', fontFamily: GROTESK, fontSize: 12, color: AINUBIS.inkDim,
              }}>
                <span style={{ ...NUM, width: 20, fontWeight: 600, color: i < 3 ? AINUBIS.ctaA : AINUBIS.inkDim }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: AINUBIS.ink, fontWeight: 600 }}>{who(x.m)}</span>
                  <span style={{ color: AINUBIS.inkFaint }}> · {dogLine(x.m)}</span>
                </span>
                <span style={{ ...NUM, color: AINUBIS.ink }}>{b.fmt(x.v)}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── hodnosti ─────────────────────────────────────────────────────────────────
function Ranks({ members, kmOf }: { members: Member[]; kmOf: (m: Member) => number }) {
  const total = members.length || 1;
  const groups: { key: string; label: string; list: Member[] }[] = [
    ...RANK_ORDER.map((r) => ({ key: r, label: RANK_NAME[r], list: members.filter((m) => m.rank === r) })),
    { key: 'founder', label: 'Zakladatelia', list: members.filter((m) => m.founder) },
    { key: 'guest', label: 'Hostia (nezaplatili)', list: members.filter((m) => !m.paid) },
  ];
  const avg = (list: Member[], f: (m: Member) => number) =>
    list.length ? list.reduce((s, m) => s + f(m), 0) / list.length : 0;
  const th: CSSProperties = { ...eyebrow, textAlign: 'left', padding: '8px 12px', borderBottom: `1px solid ${AINUBIS.edge}` };
  const td: CSSProperties = { ...NUM, padding: '8px 12px', fontSize: 12, borderBottom: `1px solid rgba(${AINUBIS.cyanRGB},0.12)` };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={cardTitle}>Rozdelenie</h3>
        {groups.map((g) => {
          const pct = (g.list.length / total) * 100;
          return (
            <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
              <span style={{ width: 120, flex: 'none', color: AINUBIS.ink }}>{g.label}</span>
              <span style={{ flex: 1, height: 12, borderRadius: 999, background: `rgba(${AINUBIS.cyanRGB},0.12)`, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: AINUBIS.cyan }} />
              </span>
              <span style={{ ...NUM, width: 80, flex: 'none', textAlign: 'right' }}>{g.list.length} · {pct.toFixed(0)} %</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={cardTitle}>Porovnanie hodností</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Hodnosť', 'Ø aktívne dni', 'Ø AI $ / mesiac', 'Ø km'].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {RANK_ORDER.map((r) => {
                const list = members.filter((m) => m.rank === r);
                return (
                  <tr key={r}>
                    <td style={{ ...td, color: AINUBIS.ink }}>{RANK_NAME[r]} ({list.length})</td>
                    <td style={td}>{avg(list, (m) => m.life.active_days).toFixed(1)}</td>
                    <td style={td}>{usd(avg(list, (m) => Number(m.ai.usd_month) || 0))}</td>
                    <td style={td}>{avg(list, kmOf).toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── limity ───────────────────────────────────────────────────────────────────
function LimitsDrawer({ isMobile, onClose, onSaved }: { isMobile: boolean; onClose: () => void; onSaved: () => void }) {
  const [rows, setRows] = useState<LimitRow[] | null>(null);
  const [orig, setOrig] = useState<LimitRow[]>([]);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    rpc('admin_member_limits').then(({ data, error }: any) => {
      if (error) { setErr(error.message || String(error)); return; }
      const list = (Array.isArray(data) ? data : []) as LimitRow[];
      list.sort((a, b) => a.sort - b.sort);
      setRows(list); setOrig(list);
    });
  }, []);

  const patch = (rule: string, p: Partial<LimitRow>) =>
    setRows((rs) => (rs || []).map((r) => (r.rule === rule ? { ...r, ...p } : r)));

  const save = async () => {
    if (!rows) return;
    setSaving(true); setErr('');
    for (const r of rows) {
      const o = orig.find((x) => x.rule === r.rule);
      if (o && o.value === r.value && o.enabled === r.enabled) continue;
      const { error } = await rpc('admin_set_member_limit', { p_rule: r.rule, p_value: r.value, p_enabled: r.enabled });
      if (error) { setErr(error.message || String(error)); setSaving(false); return; }
    }
    setSaving(false);
    setOrig(rows);
    onSaved();
    onClose();
  };

  return (
    <Drawer title="Limits" isMobile={isMobile} onClose={onClose}>
      {err && <div style={{ color: AINUBIS.danger, fontSize: 14 }}>DB error: {err}</div>}
      {!err && rows === null && <div style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Načítavam…</div>}
      {rows && rows.length === 0 && <div style={{ fontSize: 14, color: AINUBIS.inkFaint }}>Žiadne stropy.</div>}
      {rows && rows.map((r) => (
        <div key={r.rule} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
          background: AINUBIS.raised, border: `1px solid ${AINUBIS.edge}`, opacity: r.enabled ? 1 : 0.6,
        }}>
          <Dot sev={r.severity === 'red' ? 2 : 1} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: AINUBIS.ink }}>{r.label}</span>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: AINUBIS.inkFaint, cursor: 'pointer' }}>
            <input type="checkbox" checked={r.enabled} onChange={(e) => patch(r.rule, { enabled: e.target.checked })} />
            zap.
          </label>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            {r.unit === '$' && '$'}
            <input
              type="number" min={0} step="any" value={Number.isFinite(r.value) ? r.value : 0}
              onChange={(e) => patch(r.rule, { value: Number(e.target.value) })}
              style={{
                width: 80, padding: '4px 8px', borderRadius: 8, border: `1px solid ${AINUBIS.edge}`,
                background: AINUBIS.raised, color: AINUBIS.ink, fontFamily: GROTESK, fontSize: 12, ...NUM,
              }}
            />
          </span>
        </div>
      ))}
      <button type="button" onClick={save} disabled={saving || !rows} style={{
        background: AINUBIS.ctaGrad, color: AINUBIS.ctaInk, border: `1px solid ${AINUBIS.ctaEdge}`, borderRadius: 8,
        padding: '12px 24px', fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: '.14em',
        cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, boxShadow: AINUBIS.ctaShadow,
      }}>{saving ? 'Ukladám…' : 'Uložiť'}</button>
      <p style={{ margin: 0, fontSize: 12, color: AINUBIS.inkFaint }}>
        Nič neblokujú. Prekročenie = vlajka + 1 správa na ADMIN (červená hneď, oranžová v súhrne). Kontrola každú hodinu.
      </p>
    </Drawer>
  );
}
