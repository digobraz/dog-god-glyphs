// ODZNAKY v rozkliku SLUŽOBNÍKA (30. 10. 2026, len za TEST_BUILD cez RANK_BADGE_ON).
// Matej 30. 10.: *„odznaky … dal do toho panela, kde je služobník detaily — pod to"* +
// *„oprav, aby to fungovalo aj pri slabých miestach"*. Nákres `plany/nakresy/odznaky-profil-2026-10-30/nakres.html`.
//
// Odznaky sú za skutky ČLOVEKA so psom (všetci jeho psi spolu), nie za psa — preto JA, nie DOG ID.
// Počty sa rátajú LEN z toho, čo appka už zapisuje; 13 rodín čaká na ZÁPIS DŇA (rad „Pribudnú").
// Ráta sa POČET ZÁZNAMOV, nie body (body DEVOTION sú zrušené).
//
// 🔴 DEŇ = deň, keď človek v appke niečo zapísal — JEDNO meranie pre DNI SO PSOM, DNI V RADE
//    aj zlato SLUŽOBNÍKA (`useActiveDays`). Dovtedy zlato čítalo len `devotion_events` a dni so psom
//    by čítali niečo iné. Import 66 výletov zakladateľa z 4. 8. je 1 deň, nie 66.
import { useEffect, useState, type CSSProperties } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PACK_R, PACK_SPACE as S, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { BADGE_FAMILIES, badgeTier, badgeImg, type BadgeFamily } from './badgeRegister';

type Tx = (key: string, fallback: string) => string;

/** Rodiny, ktoré majú zdroj UŽ DNES. Ostatné prídu so ZÁPISOM DŇA. */
const LIVE = new Set(['rad', 'dni', 'vencenie', 'prechadzky', 'vylety', 'pritomnost', 'vault', 'zahranicie', 'kronika', 'tvorca']);

/** EN fallback mien a „za čo". SK = sk.ts (pack.badge.<id> · pack.badge.<id>.for), mená z register.json. */
const EN: Record<string, [string, string]> = {
  rad: ['Days in a row', 'how many days in a row you were active (at least 1 entry)'],
  dni: ['Days with a dog', 'how many days together in total (not necessarily in a row)'],
  vencenie: ['Quick walks', 'a short walk under 20 min'],
  prechadzky: ['Walks', 'a walk of 20+ min'],
  vylety: ['Trips', 'a logged trip'],
  pritomnost: ['Presence', 'the prayer of presence'],
  ocuchanie: ['Sniffing', 'a new dog, a new friend'],
  veterina: ['Vet', 'a visit, a vaccination, a check-up'],
  kliest: ['Ticks', 'a tick pulled out'],
  plavanie: ['Swimming', 'river, lake, sea'],
  spa: ['Salon & spa', 'grooming, a bath at the salon, wellness'],
  leny: ['Lazy day', 'just slept — that is a day too'],
  prusvih: ['Mischief', 'stole, chewed, ran off, pooped on the carpet'],
  hovienko: ['Poop event', 'only the exceptional: diarrhoea, ate something, in the rain, a record…'],
  vault: ['Wisdom', 'scrolls read in the VAULT'],
  zahranicie: ['Abroad', 'a country visited with the dog'],
  kronika: ['Chronicle', 'an entry in the dog’s chronicle'],
  tvorca: ['Creator', 'a post in the feed'],
  hra: ['Play', 'fetch, tug of war, chasing'],
  trening: ['Training', 'any training (agility, obedience, running…)'],
  sutaz: ['Competition', 'taking part in a competition or race'],
  zajac: ['Rabbit', 'hunting instinct — chasing a rabbit'],
  krmenie: ['Feeding', 'the routine set in DOG ID'],
};
const badgeName = (id: string, tx: Tx) => tx(`pack.badge.${id}`, EN[id]?.[0] ?? id);
const badgeFor = (id: string, tx: Tx) => tx(`pack.badge.${id}.for`, EN[id]?.[1] ?? '');

// ── POČTY ────────────────────────────────────────────────────────────────────

export interface MyActivity {
  /** Dni (YYYY-MM-DD, miestny čas), keď človek niečo zapísal. */
  days: Set<string>;
  kinds: Record<string, number>;
  posts: number;
  scrolls: number;
  diary: number;
}

type Rows<T> = Promise<{ data: T[] | null }>;
const day = (iso: string) => new Date(iso).toLocaleDateString('sv');

/** Jedno načítanie na minútu — kapsula SLUŽOBNÍKA aj panel sa pýtajú naraz. Vlastné riadky (RLS). */
let cache: { at: number; p: Promise<MyActivity | null> } | null = null;
export function loadMyActivity(): Promise<MyActivity | null> {
  if (cache && Date.now() - cache.at < 60_000) return cache.p;
  const p = (async () => {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user?.id;
    if (!uid) return null;
    const db = supabase as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
    const [ev, po, tw, vr, di] = await Promise.all([
      db.from('devotion_events').select('kind, created_at').eq('user_id', uid).neq('kind', 'baptism').limit(20000) as Rows<{ kind: string; created_at: string }>,
      db.from('posts').select('created_at').eq('author_id', uid).is('hidden_at', null).limit(20000) as Rows<{ created_at: string }>,
      db.from('trip_walked').select('walked_at').eq('user_id', uid).limit(20000) as Rows<{ walked_at: string | null }>,
      db.from('vault_reads').select('read_at').eq('user_id', uid).not('read_at', 'is', null).limit(20000) as Rows<{ read_at: string }>,
      db.from('dog_events').select('recorded_at').eq('user_id', uid).like('field', 'diary.%').limit(20000) as Rows<{ recorded_at: string }>,
    ]);
    const days = new Set<string>();
    const kinds: Record<string, number> = {};
    for (const r of ev.data ?? []) { kinds[r.kind] = (kinds[r.kind] ?? 0) + 1; days.add(day(r.created_at)); }
    for (const r of po.data ?? []) days.add(day(r.created_at));
    for (const r of tw.data ?? []) if (r.walked_at) days.add(day(r.walked_at));
    for (const r of vr.data ?? []) days.add(day(r.read_at));
    for (const r of di.data ?? []) days.add(day(r.recorded_at));
    return { days, kinds, posts: po.data?.length ?? 0, scrolls: vr.data?.length ?? 0, diary: di.data?.length ?? 0 };
  })();
  cache = { at: Date.now(), p };
  return p;
}

export function useMyActivity(enabled: boolean): MyActivity | null {
  const [a, setA] = useState<MyActivity | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadMyActivity().then((r) => { if (alive) setA(r); }).catch(() => {});
    return () => { alive = false; };
  }, [enabled]);
  return a;
}

/** Dni so zápisom za posledných `n` dní. */
export function daysWithin(a: MyActivity, n: number): number {
  const since = new Date(Date.now() - n * 864e5).toLocaleDateString('sv');
  let c = 0;
  for (const d of a.days) if (d >= since) c++;
  return c;
}

/** Najdlhšia séria dní za sebou. */
function longestStreak(days: Set<string>): number {
  const ts = [...days].map((d) => Date.parse(`${d}T12:00:00Z`)).sort((x, y) => x - y);
  let best = 0, run = 0, prev = NaN;
  for (const t of ts) { run = t - prev === 864e5 ? run + 1 : 1; best = Math.max(best, run); prev = t; }
  return best;
}

/** VÝLETY a ZAHRANIČIE berú ČÍSLA PÚTNIKA (to isté, čo ukazuje jeho panel) — druhý výpočet by sa rozišiel. */
export function badgeCounts(a: MyActivity, trips: number, abroad: number): Record<string, number> {
  return {
    rad: longestStreak(a.days),
    dni: a.days.size,
    vencenie: a.kinds.walk_short ?? 0,
    prechadzky: a.kinds.walk ?? 0,
    vylety: trips,
    pritomnost: a.kinds.presence ?? 0,
    vault: a.scrolls,
    zahranicie: abroad,
    kronika: a.diary,
    tvorca: a.posts,
  };
}

interface BadgeState { f: BadgeFamily; c: number; i: number | null; tier: number; next: number | null }
function stateOf(f: BadgeFamily, c: number): BadgeState {
  let i: number | null = null;
  f.prahy.forEach((p, j) => { if (c >= p) i = j; });
  const tier = i == null ? 1 : badgeTier(i, f.prahy.length);
  const next = i == null ? f.prahy[0] : i + 1 < f.prahy.length ? f.prahy[i + 1] : null;
  return { f, c, i, tier, next };
}

// ── VZHĽAD ───────────────────────────────────────────────────────────────────

export const BADGE_SHELF_CSS = `
.bd-sec{ margin-top:${S.lg}px; padding-top:${S.md}px; } /* čiara = RANK_PANEL_CSS (.rkp-lad, .bd-sec) */
.bd-hd{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:${S.sm}px; }
.bd-hd span{ font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px; letter-spacing:.22em; text-transform:uppercase; color:rgba(243,230,200,.75); }
.bd-hd b{ font-family:${FONT_UI}; font-weight:600; font-size:${PACK_TEXT.body}px; color:#E7C46C; }
.bd-tip{ margin:0 0 ${S.sm}px; font-size:${PACK_TEXT.label}px; line-height:1.45; color:#F3E6C8; }
.bd-grid{ display:grid; grid-template-columns:repeat(5, 1fr); gap:${S.sm}px ${S.xs}px; }
@media (min-width:768px){ .bd-grid{ grid-template-columns:repeat(10, 1fr); } }
.bd{ display:flex; flex-direction:column; align-items:center; min-width:0; padding:${S.xs}px 0; border:0; background:none; cursor:pointer;
  border-radius:${PACK_R.tile}px; color:#F3E6C8; -webkit-tap-highlight-color:transparent; }
.bd:focus{ outline:none; }
/* Kresba má priehľadný okraj — 56 px obrázok je opticky ~40 px kruh (ako rebrík SLUŽOBNÍKA). */
.bd img{ width:56px; height:56px; margin:-${S.xs}px 0; object-fit:contain; }
.bd b{ max-width:100%; margin-top:${S.xs}px; font-family:${FONT_UI}; font-weight:500; font-size:${PACK_TEXT.micro}px; letter-spacing:.02em;
  line-height:1.2; min-height:2.4em; overflow-wrap:anywhere; display:flex; align-items:center; }
.bd small{ font-family:${FONT_UI}; font-weight:600; font-size:${PACK_TEXT.micro}px; color:#E7C46C; }
.bd.off img{ filter:grayscale(1) brightness(.45); opacity:.6; }
.bd.off b, .bd.off small{ color:rgba(243,230,200,.5); }
.bd-later{ display:flex; flex-direction:column; gap:${S.xs}px; margin-top:${S.md}px; }
.bd-later span{ font-size:${PACK_TEXT.micro}px; color:rgba(243,230,200,.5); }
.bd-later div{ display:flex; flex-wrap:wrap; gap:${S.xs}px; }
.bd-later img{ width:24px; height:24px; object-fit:contain; filter:grayscale(1) brightness(.4); opacity:.5; }
.bd-back{ display:inline-flex; align-items:center; gap:${S.xs}px; margin-bottom:${S.md}px; padding:0; border:0; background:none; cursor:pointer;
  font-family:${FONT_UI}; font-weight:600; font-size:${PACK_TEXT.label}px; color:#E7C46C; }
`;

/** Sekcia ODZNAKY pod rebríkom SLUŽOBNÍKA. `counts == null` = ešte sa načítava. */
export function BadgeShelf({ counts, onOpen, tx }: { counts: Record<string, number> | null; onOpen: (id: string) => void; tx: Tx }) {
  if (!counts) return null;
  const live = BADGE_FAMILIES.filter((f) => LIVE.has(f.id)).map((f) => stateOf(f, counts[f.id] ?? 0));
  const later = BADGE_FAMILIES.filter((f) => !LIVE.has(f.id));
  const won = live.filter((s) => s.i != null).length;
  // Získané dopredu (vyšší stupeň prvý), potom to, čomu chýba najmenej.
  const rank = (s: BadgeState) => (s.i == null ? 0 : s.tier);
  const order = [...live].sort((a, b) => rank(b) - rank(a) || ((a.next ?? Infinity) - a.c) - ((b.next ?? Infinity) - b.c));
  return (
    <div className="bd-sec">
      <div className="bd-hd"><span>{tx('pack.badge.title', 'Badges')}</span><b>{won} / {BADGE_FAMILIES.length}</b></div>
      {won === 0 && <p className="bd-tip">{tx('pack.badge.first', 'Your first badge comes with your first entry — a walk, a trip or the prayer of presence.')}</p>}
      <div className="bd-grid">
        {order.map((s) => (
          <button type="button" key={s.f.id} className={`bd${s.i == null ? ' off' : ''}`} onClick={() => onOpen(s.f.id)}>
            <img src={badgeImg(s.f.symbol, s.tier)} alt="" />
            <b>{badgeName(s.f.id, tx)}</b>
            <small>{s.next != null ? `${s.c} / ${s.next}` : `${s.c} ✓`}</small>
          </button>
        ))}
      </div>
      <div className="bd-later">
        <span>{tx('pack.badge.later', 'Coming with the daily log')}</span>
        <div>{later.map((f) => <img key={f.id} src={badgeImg(f.symbol, 1)} alt={badgeName(f.id, tx)} title={badgeName(f.id, tx)} />)}</div>
      </div>
    </div>
  );
}

/** Detail jednej rodiny — v tom istom paneli (akcia neodnesie človeka preč). Triedy = RANK_PANEL_CSS. */
export function BadgeDetail({ id, counts, fill, onBack, tx }: { id: string; counts: Record<string, number>; fill: CSSProperties; onBack: () => void; tx: Tx }) {
  const f = BADGE_FAMILIES.find((x) => x.id === id);
  if (!f) return null;
  const s = stateOf(f, counts[id] ?? 0);
  const prev = s.i == null ? 0 : f.prahy[s.i];
  const pct = s.next == null ? 100 : Math.max(0, Math.min(100, ((s.c - prev) / (s.next - prev)) * 100));
  const za = badgeFor(id, tx);
  return (
    <>
      <button type="button" className="bd-back" onClick={onBack}><BrandIcon name="back" size={12} tint="gold" />{tx('pack.badge.title', 'Badges')}</button>
      <div className="rkp-hd">
        <span className="im" style={{ ['--k' as string]: 1.4 }}><img src={badgeImg(f.symbol, s.tier)} alt="" style={s.i == null ? { filter: 'grayscale(1) brightness(.45)', opacity: .6 } : undefined} /></span>
        <div className="tx"><h3>{badgeName(id, tx)}</h3>{za && <p>{za.charAt(0).toUpperCase() + za.slice(1)}</p>}</div>
      </div>
      <div className="rkp-lbl"><span>{s.next != null ? tx('pack.badge.toNext', 'To the next badge') : tx('pack.badge.top', 'The whole row is yours.')}</span><b>{s.next != null ? `${s.c} / ${s.next}` : s.c}</b></div>
      <div className="rkp-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i className={`fl${s.next == null ? ' full' : ''}`} style={{ width: `max(${pct}%, 20px)`, ...fill }} />
        {s.next != null && <span>{tx('pack.badge.left', '{n} to go').replace('{n}', String(s.next - s.c))}</span>}
      </div>
      <div className="rkp-lad" style={{ ['--n' as string]: f.prahy.length }}>
        {f.prahy.map((p, j) => (
          <div key={p} className={s.i == null ? '' : j === s.i ? 'on' : j < s.i ? 'done' : ''}>
            <img src={badgeImg(f.symbol, badgeTier(j, f.prahy.length))} alt="" />
            <small>{p}</small>
          </div>
        ))}
      </div>
    </>
  );
}
