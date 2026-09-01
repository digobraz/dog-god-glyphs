// UPOZORNENIA (NOS) — dátová vrstva, žiadne UI.
//
// Matej 2026-08-26: „zvonček už nemáme, máme nos, a nos sú upozornenie a obálka sú správy".
// Dva samostatné povrchy v hornej lište, ktoré sa NESMÚ prekrývať:
//   · OBÁLKA = neprečítané konverzácie (`packMessaging.unreadCount`) → otvára Inbox
//   · NOS    = všetko ostatné, o čom sa má človek dozvedieť sám (tento súbor)
// Správy sem preto zámerne NEPATRIA — inak by to isté číslo svietilo dvakrát vedľa seba.
//
// ── ČO NOS HLÁSIL DO DNES ────────────────────────────────────────────────────────────────
// Jedinú vec: koľko Dogypťanov pribudlo za 24 h (`PackNotifications.tsx` — `bellCount =
// last24h`). Žiadosť o pridanie na výlet ani jej prijatie nikde nebliklo, takže organizátor
// sa o nej dozvedel len tak, že sám otvoril zoznam výletov, a žiadateľ sa nedozvedel vôbec,
// že ho vzali. Databáza pritom bola v poriadku — chýbalo len to, že o nej nikto nedal vedieť.
//
// ── PREČÍTANOSŤ JE LOKÁLNA (vedomý kompromis) ────────────────────────────────────────────
// `localStorage` pod `pack-alerts-seen`. Dôsledok: kto si upozornenie prečíta na telefóne,
// uvidí ho na počítači ešte raz. Alternatíva je nová tabuľka so stavom per člen — to je
// samostatná stavba a nie je to podmienka pre to, aby NOS začal fungovať. Keď taký stĺpec
// raz vznikne, mení sa telo `readSeen`/`markSeen`, nič iné.
//
// ── ID UPOZORNENIA NESIE ČAS ─────────────────────────────────────────────────────────────
// `req|<slug>|<čas najnovšej žiadosti>`. Keby id bolo len `req|<slug>`, druhá žiadosť na ten
// istý výlet by sa už nikdy nerozsvietila — človek ju označil za prečítanú pri prvej.
import { supabase } from '@/integrations/supabase/client';
import { currentTripId, tripPathById } from '@/components/pack/tripShared';
import type { HeroTrail } from '@/data/heroTrails.generated';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rovnaký dôvod ako v packStore.ts:
// `types.ts` tabuľky /packu nepozná (migrácie sú novšie než generovaný súbor).
const db = supabase as any;

const SEEN_KEY = 'pack-alerts-seen';
/** Koľko id si pamätáme. Nad tým sa najstaršie zahadzujú — upozornenie spred stoviek udalostí
 *  už aj tak nie je čo „znovu ukázať", a neorezaný zoznam by rástol donekonečna. */
const SEEN_MAX = 200;

export type AlertKind = 'trip_request' | 'trip_accepted';

/**
 * Dataset trás — LAZY, rovnaký dôvod ako v `messaging/tripLabel.ts`: `heroTrails.generated.ts`
 * má rádovo megabajt a upozornenia sú globálny chrome. Prvé volanie stiahne, ďalšie sú zadarmo.
 *
 * ⚠️ ODKAZ SKLADÁ `tripPathById`, NIE reťazec. Cesta výletu je `/pack/map/:country/:slug`
 * (CLAUDE.md, LOCKED 3. 8. 2026) — ručne poskladané `/pack/map/<slug>` stratí krajinu
 * a skončí na presmerovaní.
 */
let trailsCache: readonly HeroTrail[] | null = null;
let trailsLoading: Promise<readonly HeroTrail[]> | null = null;
function loadTrails(): Promise<readonly HeroTrail[]> {
  if (trailsCache) return Promise.resolve(trailsCache);
  if (trailsLoading) return trailsLoading;
  trailsLoading = import('@/data/heroTrails.generated')
    .then((m) => { trailsCache = m.HERO_TRAILS; return trailsCache; })
    .catch(() => {
      // Dataset sa nestiahol — prázdno sa NEcachuje, aby to ďalšie otvorenie skúsilo znova.
      // Upozornenie potom ukáže slug a odkaz padne na `tripPathById` fallback.
      trailsLoading = null;
      return [] as readonly HeroTrail[];
    });
  return trailsLoading;
}

export interface PackAlert {
  /** stabilný kľúč prečítanosti — obsahuje čas, viď hlavička */
  id: string;
  kind: AlertKind;
  /** slug výletu, ktorého sa upozornenie týka (kvôli odkazu aj názvu) */
  tripSlug: string;
  /** názov výletu; keď sa dataset nestiahne, ostáva slug (rovnako ako v `tripLabel`) */
  tripName: string;
  /** hotová cesta na výlet — skladá ju `tripPathById`, volajúci ju len použije */
  tripPath: string;
  /** koľkých ľudí sa upozornenie týka — pri prijatí vždy 1 */
  count: number;
  /** ISO čas najnovšej udalosti v tomto upozornení */
  at: string;
}

// ── prečítanosť ────────────────────────────────────────────────────────────────────────────

export function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>(); // poškodený zápis / private mode — radšej ukázať znova než spadnúť
  }
}

/** Označí dané id za prečítané. Poradie v poli = poradie príchodu, orezáva sa zľava. */
export function markSeen(ids: string[]): void {
  if (!ids.length) return;
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const prev = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [...prev.filter((id) => !ids.includes(id)), ...ids];
    localStorage.setItem(SEEN_KEY, JSON.stringify(next.slice(-SEEN_MAX)));
  } catch { /* kvóta — prečítanosť je pohodlie, nie dáta; strata nič nerozbije */ }
}

export const unseen = (alerts: PackAlert[], seen: Set<string>): PackAlert[] =>
  alerts.filter((a) => !seen.has(a.id));

// ── načítanie ──────────────────────────────────────────────────────────────────────────────

interface RequestRow {
  trip_slug: string;
  created_at: string;
  decided_at: string | null;
}

/**
 * Všetky upozornenia pre prihláseného člena, najnovšie prvé.
 *
 * Dva dotazy, obe nad `trip_requests` — políčka sú úzke zámerne: kto ten človek je, vydáva
 * len `get_trip_party()` a to je dotaz na výlet, nie na schránku. Upozornenie preto hovorí
 * „dvaja ľudia žiadajú o Rokoš", nie mená; mená uvidí organizátor v zozname výletov, kam ho
 * upozornenie pošle. Menej dotazov aj menej cudzej identity rozsypanej po appke.
 */
export async function loadAlerts(): Promise<PackAlert[]> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return []; // odhlásený / DEV_NOAUTH — RLS by aj tak nevydala nič

  const [incoming, mine] = await Promise.all([
    db.from('trip_requests').select('trip_slug,created_at,decided_at')
      .eq('organizer_id', uid).eq('status', 'requested') as
      Promise<{ data: RequestRow[] | null }>,
    db.from('trip_requests').select('trip_slug,created_at,decided_at')
      .eq('from_user_id', uid).eq('status', 'accepted') as
      Promise<{ data: RequestRow[] | null }>,
  ]);

  const trails = await loadTrails();
  // Slug v DB môže byť spred premenovania (3. 8.: `<pohorie>-<lokalita>` → `<lokalita>-<pohorie>`)
  // a `RENAMED_TRIP_IDS` je len klientská mapa — bez `currentTripId` by sa taký výlet v datasete
  // nenašiel a upozornenie by ukazovalo holý slug. Rovnaká pasca ako v `messaging/tripLabel.ts`.
  const nameOf = (slug: string) => trails.find((t) => t.id === currentTripId(slug))?.name ?? slug;
  const pathOf = (slug: string) => tripPathById(currentTripId(slug), trails);

  const out: PackAlert[] = [];

  // žiadosti NA MOJE výlety — zoskupené podľa výletu, čas = najnovšia z nich
  const bySlug = new Map<string, RequestRow[]>();
  for (const r of incoming.data ?? []) {
    const arr = bySlug.get(r.trip_slug);
    if (arr) arr.push(r); else bySlug.set(r.trip_slug, [r]);
  }
  for (const [slug, rows] of bySlug) {
    const at = rows.reduce((max, r) => (r.created_at > max ? r.created_at : max), rows[0].created_at);
    out.push({ id: `req|${slug}|${at}`, kind: 'trip_request', tripSlug: slug, tripName: nameOf(slug), tripPath: pathOf(slug), count: rows.length, at });
  }

  // MOJE žiadosti, ktoré prešli — každá zvlášť, je to jednorazová správa „si vo svorke"
  for (const r of mine.data ?? []) {
    const at = r.decided_at ?? r.created_at;
    out.push({ id: `acc|${r.trip_slug}|${at}`, kind: 'trip_accepted', tripSlug: r.trip_slug, tripName: nameOf(r.trip_slug), tripPath: pathOf(r.trip_slug), count: 1, at });
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}
