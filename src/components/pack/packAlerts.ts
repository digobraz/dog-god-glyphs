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
// ── PREČÍTANOSŤ: LOKÁLNE + ZRKADLO NA SERVERI (30. 10. 2026) ─────────────────────────────
// `localStorage` pod `pack-alerts-seen` ostáva rýchly zdroj pre `readSeen`. Od 30. 10. sa `markSeen` zapisuje aj na
// server (`mark_alerts_seen`, migrácia 20261109_feed_appka.sql) a `loadAlerts` ho pri každom načítaní zlúči späť
// (`syncSeen`) — prečítané na telefóne je prečítané aj na druhom zariadení. Bez migrácie RPC padne a všetko ide ako dovtedy.
//
// ── TRETÍ DRUH: „NIEKTO Z PARTIE UŽ VÝLET ZAPÍSAL" (Matej 4. 9. 2026) ────────────────────
// Kto výlet prejde, potvrdí ho ZA SEBA; ostatní z partie dostanú upozornenie a svoj záznam
// si spravia sami tým istým tokom, akoby výlet našli. Appka nikomu nezapisuje, kde bol —
// vedomý dôsledok je, že kto neklikne, výlet mať nebude (Matej: „podme to zjednodušiť nie
// komplikovať"). Zdroj = RPC `get_walked_alerts()` (20260904_trip_walked_alerts.sql), lebo
// cudzí riadok `trip_walked` je pod RLS neviditeľný — a má byť.
//
// ── ID UPOZORNENIA NESIE ČAS ─────────────────────────────────────────────────────────────
// `req|<slug>|<čas najnovšej žiadosti>`. Keby id bolo len `req|<slug>`, druhá žiadosť na ten
// istý výlet by sa už nikdy nerozsvietila — človek ju označil za prečítanú pri prvej.
import { shared } from '@/lib/sharedFetch';
import { supabase } from '@/integrations/supabase/client';
import { currentTripId, tripPathById } from '@/components/pack/tripShared';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { EVENTS_LIVE, WISHES_LIVE } from '@/lib/packFlags';
import { iso2ToISO3 } from '@/lib/countryGeo';
import { loadSosActive } from '@/components/pack/sosKit';
import { sosMine } from '@/lib/sos';
import { SOS_ON } from '@/lib/env';
import { fetchMemberProfiles, memberAvatarUrl, memberDisplayName } from '@/components/pack/profile/memberProfile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rovnaký dôvod ako v packStore.ts:
// `types.ts` tabuľky /packu nepozná (migrácie sú novšie než generovaný súbor).
const db = supabase as any;

/** Najviac jedna obnova upozornení za minútu (okrem `loadAlerts(true)`). */
const ALERTS_TTL_MS = 60_000;
const SEEN_KEY = 'pack-alerts-seen';
/** Koľko id si pamätáme. Nad tým sa najstaršie zahadzujú — upozornenie spred stoviek udalostí
 *  už aj tak nie je čo „znovu ukázať", a neorezaný zoznam by rástol donekonečna. */
const SEEN_MAX = 200;

// ── PODUJATIA (vlna 2, 25. 9. 2026) ──────────────────────────────────────────────────────
// Päť druhov zo `get_event_alerts()` (20260925_events_v2.sql): organizátorovi „niekto sa
// pridal" a „uskutočnilo sa?" (+10 bodov), účastníkom „zmenené", „zrušené" a pripomienka
// deň vopred. Odkaz vedie na mapu s otvorenou kartou (`/pack/map?event=<id>`) — objekt má
// jednu kartu a upozornenie neotvára novú obrazovku.
export type EventAlertKind = 'event_rsvp' | 'event_changed' | 'event_cancelled' | 'event_reminder' | 'event_held_ask';
// ── PRIANIA 🎯 (26. 9. 2026) ─────────────────────────────────────────────────────────────
// Štyri druhy z `get_wish_alerts()` (20260926_wish_life.sql): B3 „niekto chce tiež" · C1
// „ešte platí?" · C4 „ušlo ti" · C5 „neodkladaj to". Odkaz vedie na mapu, kde otázku položí
// AINUBIS (`WishAsk.tsx`) — upozornenie len zavolá, odpovedá sa tam, kde je pin.
export type WishAlertKind = 'wish_me_too' | 'wish_ask' | 'wish_missed' | 'wish_nudge';
// `walk_invite` (15. 10. 2026): člen ma označil na výlete — potvrdím alebo odmietnem priamo v NOS.
// `pawmate_joined` (26. 10. 2026): pawmate prijal pozvánku. Matej: *„email že pawmate prijal
// nemusí byť, stačí upozornenie v apke notifikácia"* — preto mail E nevznikol a je to tu.
// `follow_new` (27. 10. 2026): „X ťa začal sledovať" — ako IG. Zdroj = `get_follow_list(null,
// 'followers')` zo `20261105_sledovanie.sql`, žiadna nová tabuľka ani migrácia.
// `ainubis_reply` (27. 10. 2026): AINUBIS odpísal na môj komentár pod citátom dňa. Matej: *„samozrejme A"*
// = CYAN číslo na chvoste (nie červené — to je od členov), ťuk otvorí vlákno. Zdroj `my_ainubis_replies()`
// zo `20261105_ainubis_reply_alert.sql`.
// `post_like` · `post_comment` · `trip_like` · `trip_comment` · `quote_reply` (28. 10. 2026): upozornenia AKO NA IG — niekto
// lajkol / okomentoval môj príspevok či výlet, alebo odpovedal na môj komentár pod citátom. ČERVENÉ (od členov).
// Zdroj `get_social_alerts()` zo `20261107_social_alerts.sql` (zoskupené: „Jana a 4 ďalší“).
export type SocialAlertKind = 'post_like' | 'post_comment' | 'trip_like' | 'trip_comment' | 'quote_reply';
// `trip_published` · `trip_returned` (1. 11. 2026): môj výlet sme v chate zverejnili / vrátili na úpravu. Matej po
// zverejnení Rosuchova: *„neprišlo mi upozornenie na chvostíku"* — správa išla len do AINUBIS rozhovoru. CYAN (systém).
// Zdroj = vlastné `pack_trips` (RLS `pack_trips_read` pustí autora), žiadna RPC ani migrácia.
export type ReviewAlertKind = 'trip_published' | 'trip_returned';
// `sos_lost` · `sos_still` (4. 11. 2026): stratený pes v mojej krajine / „Stále hľadáš MENO?" (majiteľ, keď 14-dňová otázka
// `asked_at` visí). Zdroj = `sosActive()` + `sosMine()` (len SOS_ON). Keď pátranie skončí (NAŠIEL SA), zo zdroja zmizne
// ⇒ riadok zanikne sám. Prečítanie = id v `seen` ⇒ zmizne z počtu, riadok v zozname ostáva (nič trvalé).
export type SosAlertKind = 'sos_lost' | 'sos_still';
export type AlertKind = SosAlertKind | 'trip_request' | 'trip_accepted' | 'trip_walked' | 'walk_invite' | 'pawmate_joined' | 'follow_new' | 'ainubis_reply' | ReviewAlertKind | SocialAlertKind | EventAlertKind | WishAlertKind;

/** Koľko dní svieti „{meno} je v tvojej svorke" — potom je to už stav, nie správa. */
const PAWMATE_ALERT_DAYS = 30;
/** Nový sledujúci svieti rovnako dlho; staršie sú už len v zozname „sledujúci". */
const FOLLOW_ALERT_DAYS = 30;
/** Zverejnený / vrátený výlet svieti rovnako dlho. */
const REVIEW_ALERT_DAYS = 30;
/** Staršie posudky upozornenie nedostanú — autorom by po vydaní naraz zasvietili výlety spred mesiaca. */
const REVIEW_ALERT_FROM = '2026-11-01T00:00:00Z';

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
  /** B3: kto chce tiež — krstné meno + pes (ako na pine). Pri ostatných druhoch prázdne. */
  who?: string;
  /** SOS: fenka, text podľa rodu. */
  whoFem?: boolean;
  /** `walk_invite`: id pozvánky pre `respond_walk_invite` */
  inviteId?: string;
  /** sociálne druhy: náhľad fotky príspevku / výletu (jednoriadkový, môže chýbať) */
  photo?: string;
  /** sociálne komentáre: telo najnovšieho komentára, už skrátené serverom */
  preview?: string;
  /** fotka človeka, od ktorého upozornenie je (IG: vľavo tvár, vpravo náhľad) */
  whoPhoto?: string;
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
  pushSeen(ids);
}

/** Zápis na server — zlepené do jedného volania (otvorenie panela môže označiť desiatky id naraz). */
let pendingSeen: string[] = [];
let seenTimer: number | undefined;
function pushSeen(ids: string[]): void {
  pendingSeen.push(...ids);
  if (seenTimer !== undefined) return;
  seenTimer = window.setTimeout(() => {
    seenTimer = undefined;
    const batch = [...new Set(pendingSeen)].slice(-200);
    pendingSeen = [];
    void Promise.resolve(db.rpc('mark_alerts_seen', { p_ids: batch })).catch(() => { /* prečítanosť je pohodlie, nie dáta */ });
  }, 400);
}

/** Stiahne prečítané zo servera a pridá ich do lokálneho zoznamu. Vracia, či sa niečo pridalo. */
async function syncSeen(): Promise<boolean> {
  try {
    const { data, error } = await db.rpc('get_alerts_seen');
    if (error || !Array.isArray(data)) return false;
    const have = readSeen();
    const add = (data as unknown[]).filter((x): x is string => typeof x === 'string' && !have.has(x));
    if (!add.length) return false;
    const next = [...have, ...add];
    localStorage.setItem(SEEN_KEY, JSON.stringify(next.slice(-SEEN_MAX)));
    return true;
  } catch { return false; }
}

export const unseen = (alerts: PackAlert[], seen: Set<string>): PackAlert[] =>
  alerts.filter((a) => !seen.has(a.id));

// ── načítanie ──────────────────────────────────────────────────────────────────────────────

interface RequestRow {
  trip_slug: string;
  created_at: string;
  decided_at: string | null;
}

/** riadok z `get_walked_alerts()` — bez identity, len počet a čas (viď migráciu) */
interface WalkedRow {
  trip_slug: string;
  walkers: number;
  at: string;
}

interface WalkInviteRow {
  id: string;
  trip_slug: string;
  trip_name: string;
  who: string;
  at: string;
}

interface WishAlertRow {
  kind: WishAlertKind;
  wish_id: string;
  place: string;
  who_first: string | null;
  who_dog: string | null;
  at: string;
}

/** riadok `my_pawmates()` — len polia, ktoré upozornenie potrebuje */
interface PawmateAlertRow {
  kind: string;
  user_id: string | null;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  dogs: Array<{ dog_name?: string | null }> | null;
  since: string;
}

/** riadok `my_ainubis_replies` — telo je už skrátené na 140 znakov */
interface AinubisReplyRow {
  id: string;
  quote_key: string;
  body: string;
  created_at: string;
}

/** riadok `get_follow_list` — len číslo a čas, meno dodá `fetchMemberProfiles` */
interface FollowAlertRow {
  pack_number: number;
  followed_at: string;
}

/** riadok `get_social_alerts` — už zoskupený: n rôznych ľudí, who = najnovší z nich */
interface SocialAlertRow {
  kind: SocialAlertKind;
  target: string;
  ref: string | null;
  n: number;
  who: string | null;
  preview: string | null;
  photo: string | null;
  at: string;
  /** tvár toho, kto reagoval (avatar, inak jeho pes) — `20261108_social_alerts_tvar.sql` */
  who_photo?: string | null;
  who_n?: number | null;
}

/** riadok vlastného `pack_trips` — len polia z payloadu, ktoré upozornenie ukáže (čiara trasy je ťažká) */
interface ReviewAlertRow {
  slug: string;
  status: 'approved' | 'rejected';
  reviewed_at: string;
  name: string | null;
  urlSlug: string | null;
  country: string | null;
  photo: string | null;
}

interface EventAlertRow {
  kind: EventAlertKind;
  edition_id: string;
  title: string;
  starts_at: string;
  cnt: number;
  at: string;
}

/**
 * Všetky upozornenia pre prihláseného člena, najnovšie prvé.
 *
 * Tri dotazy — dva nad `trip_requests`, tretí RPC na prejdenia partie. Políčka sú úzke
 * zámerne: kto ten človek je, vydáva
 * len `get_trip_party()` a to je dotaz na výlet, nie na schránku. Upozornenie preto hovorí
 * „dvaja ľudia žiadajú o Rokoš", nie mená; mená uvidí organizátor v zozname výletov, kam ho
 * upozornenie pošle. Menej dotazov aj menej cudzej identity rozsypanej po appke.
 */
/**
 * Upozornenia — JEDNO volanie pre všetkých, ktorí sa pýtajú naraz (audit /pack/map B6,
 * 26. 9. 2026). Mapa má hlavičku dvakrát (mobilná + PC, jedna skrytá cez CSS) a každá
 * si pýtala 5 dotazov sama. Okno 1,5 s pokryje súbežný mount; po akcii (prijatie žiadosti)
 * ide ďalšie volanie už na sieť.
 */
export function loadAlerts(force = false): Promise<PackAlert[]> {
  // Audit 14. 11. 2026: 12 dotazov pri KAŽDOM prechode obrazovky. Teraz jeden zdieľaný výsledok
  // na 60 s (mount hlavičky aj návrat do appky ho berú z pamäte); `force` = po vlastnej akcii.
  return shared('pack-alerts', loadAlertsNow, force ? 0 : ALERTS_TTL_MS);
}

async function loadAlertsNow(): Promise<PackAlert[]> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return []; // odhlásený / DEV_NOAUTH — RLS by aj tak nevydala nič
  // Prečítané z iného zariadenia sa zlúčia do lokálneho zoznamu skôr, než volajúci spočíta neprečítané.
  await syncSeen();

  const reviewAgo = new Date(Date.now() - REVIEW_ALERT_DAYS * 864e5).toISOString();
  const reviewSince = reviewAgo > REVIEW_ALERT_FROM ? reviewAgo : REVIEW_ALERT_FROM;
  const [incoming, mine, walked, events, wishes, invites, mates, follows, aiReplies, social, reviewed] = await Promise.all([
    db.from('trip_requests').select('trip_slug,created_at,decided_at')
      .eq('organizer_id', uid).eq('status', 'requested') as
      Promise<{ data: RequestRow[] | null }>,
    db.from('trip_requests').select('trip_slug,created_at,decided_at')
      .eq('from_user_id', uid).eq('status', 'accepted') as
      Promise<{ data: RequestRow[] | null }>,
    // Tretí dotaz je RPC, nie select — `trip_walked` cudzieho človeka je pod RLS neviditeľný.
    // Chyba sa prehltne na prázdno: upozornenia sú chrome na každej stránke /packu a jedna
    // nedostupná funkcia (napr. migrácia ešte nenasadená na DEV) nesmie zhasnúť celý panel.
    db.rpc('get_walked_alerts') as Promise<{ data: WalkedRow[] | null }>,
    // Podujatia len keď sú zapnuté — na LIVE do FLIPu funkcia neexistuje (404 v konzole
    // na každej stránke by bol šum, nie informácia).
    (EVENTS_LIVE ? db.rpc('get_event_alerts') : Promise.resolve({ data: [] })) as Promise<{ data: EventAlertRow[] | null }>,
    // Priania rovnako — na LIVE do FLIPu funkcia neexistuje.
    (WISHES_LIVE ? db.rpc('get_wish_alerts') : Promise.resolve({ data: [] })) as Promise<{ data: WishAlertRow[] | null }>,
    // Pozvánky „bol si so mnou" — chyba (migrácia ešte nie je na LIVE) padne na prázdno.
    db.rpc('get_walk_invite_alerts') as Promise<{ data: WalkInviteRow[] | null }>,
    // Pawmati — tá istá RPC ako editor svorky (`listMyPawmates`), žiadna nová tabuľka.
    // Kto psa nemá, dostane prázdno; chyba padne na prázdno ako ostatné.
    db.rpc('my_pawmates') as Promise<{ data: PawmateAlertRow[] | null }>,
    // Noví sledujúci — tá istá RPC ako zoznam po ťuknutí na číslo (`follow.tsx`). Chyba = prázdno.
    db.rpc('get_follow_list', { p_pack_number: null, p_kind: 'followers' }) as Promise<{ data: FollowAlertRow[] | null }>,
    // Odpovede AINUBISA pod citátom. Pred LIVE migráciou RPC chýba ⇒ chyba ⇒ prázdno, nič nespadne.
    db.rpc('my_ainubis_replies') as Promise<{ data: AinubisReplyRow[] | null }>,
    // Lajky / komentáre / odpovede ako na IG. Pred LIVE migráciou RPC chýba ⇒ chyba ⇒ prázdno.
    db.rpc('get_social_alerts') as Promise<{ data: SocialAlertRow[] | null }>,
    // Moje výlety po schválení v chate. `eq(author_id)` je nutné aj pri RLS — admin účet vidí všetky.
    db.from('pack_trips')
      .select('slug,status,reviewed_at,name:payload->>name,urlSlug:payload->>urlSlug,country:payload->>country,photo:payload->photos->>0')
      .eq('author_id', uid).in('status', ['approved', 'rejected']).gte('reviewed_at', reviewSince) as
      Promise<{ data: ReviewAlertRow[] | null }>,
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

  // VÝLET PREŠIEL NIEKTO ZO SVORKY, ja ho zapísaný nemám — pozvánka zapísať si ho tiež.
  // Čas v id je najnovší cudzí zápis: keď potvrdí ďalší človek, upozornenie sa rozsvieti
  // znova (rovnaký dôvod ako pri žiadostiach — inak by druhého už nikto nevidel).
  for (const w of walked.data ?? []) {
    out.push({ id: `walk|${w.trip_slug}|${w.at}`, kind: 'trip_walked', tripSlug: w.trip_slug, tripName: nameOf(w.trip_slug), tripPath: pathOf(w.trip_slug), count: w.walkers, at: w.at });
  }

  // PODUJATIA — `tripSlug` ostáva prázdny, názov a cesta sú z DB. Id nesie čas: druhá zmena
  // termínu alebo ďalší prihlásený sa rozsvieti znova.
  for (const e of events.data ?? []) {
    out.push({ id: `${e.kind}|${e.edition_id}|${e.at}`, kind: e.kind, tripSlug: '', tripName: e.title, tripPath: `/pack/map?event=${e.edition_id}`, count: e.cnt, at: e.at });
  }

  // PRIANIA — `tripName` nesie miesto („Nórsko"). Id nesie čas: C5 sa o rok rozsvieti znova,
  // posunutý termín dá novú otázku C1.
  for (const w of wishes.data ?? []) {
    const who = [w.who_first, w.who_dog].filter(Boolean).join(' + ');
    out.push({ id: `${w.kind}|${w.wish_id}|${w.at}`, kind: w.kind, tripSlug: '', tripName: w.place, tripPath: `/pack/map?wish=${w.wish_id}&ask=${w.kind}`, count: 1, at: w.at, who });
  }

  // POZVÁNKY — názov z DB (výlet môže čakať na schválenie a v datasete ešte nie je).
  for (const v of invites.data ?? []) {
    out.push({ id: `inv|${v.id}`, kind: 'walk_invite', tripSlug: v.trip_slug, tripName: v.trip_name || nameOf(v.trip_slug), tripPath: pathOf(v.trip_slug), count: 1, at: v.at, who: v.who, inviteId: v.id });
  }

  // PAWMATE PRIJAL — id nesie človeka aj čas: keď ho pawtner vyradí a znova pozve,
  // rozsvieti sa nanovo. Meno, inak začiatok e-mailu (pawtner ho zadal sám).
  const since = Date.now() - PAWMATE_ALERT_DAYS * 864e5;
  for (const m of mates.data ?? []) {
    if (m.kind !== 'human' || !m.user_id || Date.parse(m.since) < since) continue;
    const dogNames = (m.dogs ?? []).map((d) => d.dog_name).filter(Boolean).join(' & ');
    out.push({
      id: `mate|${m.user_id}|${m.since}`, kind: 'pawmate_joined', tripSlug: '', tripName: dogNames,
      tripPath: '/pack/profile/edit', count: 1, at: m.since,
      who: m.name || (m.email ?? '').split('@')[0] || undefined,
      whoPhoto: m.avatar_url ?? undefined,
    });
  }

  // NOVÝ SLEDUJÚCI — id nesie číslo aj čas: kto prestane a znova začne, rozsvieti sa nanovo.
  // Meno = to isté „Zobraziť ako", aké vidí v zozname; pes ide do zlatého riadku.
  const folSince = Date.now() - FOLLOW_ALERT_DAYS * 864e5;
  const fresh = (follows.data ?? []).filter((f) => Date.parse(f.followed_at) >= folSince);
  if (fresh.length) {
    const prof = await fetchMemberProfiles(fresh.map((f) => f.pack_number));
    for (const f of fresh) {
      const m = prof.get(f.pack_number) ?? null;
      const num = m?.memberNumber ?? f.pack_number;
      out.push({
        id: `fol|${num}|${f.followed_at}`, kind: 'follow_new', tripSlug: '',
        tripName: (m?.dogs ?? []).map((d) => d.name).filter(Boolean).join(' & '),
        tripPath: `/pack/u/${num}`, count: 1, at: f.followed_at,
        who: memberDisplayName(m, `#${num}`) || undefined,
        whoPhoto: memberAvatarUrl(m) ?? undefined,
      });
    }
  }

  // AINUBIS ODPÍSAL — id = id odpovede, takže každá svieti raz. Ťuk otvorí vlákno toho dňa vo feede.
  for (const r of aiReplies.data ?? []) {
    out.push({
      id: `air|${r.id}`, kind: 'ainubis_reply', tripSlug: '',
      tripName: r.body, tripPath: `/pack?cm=${encodeURIComponent(r.quote_key)}`, count: 1, at: r.created_at,
    });
  }

  // VÝLET ZVEREJNENÝ / VRÁTENÝ — id nesie čas posudku: opravený a znova zverejnený výlet sa rozsvieti nanovo.
  // Zverejnený → článok výletu (cesta ako `zivyOdkaz` v chate), vrátený → môj zoznam výletov (AINUBIS routa na LIVE nie je).
  for (const r of reviewed.data ?? []) {
    const ok = r.status === 'approved';
    out.push({
      id: `rev|${r.slug}|${r.reviewed_at}`, kind: ok ? 'trip_published' : 'trip_returned', tripSlug: r.slug,
      tripName: r.name || r.slug, count: 1, at: r.reviewed_at, photo: r.photo ?? undefined,
      tripPath: ok ? `/pack/map/${iso2ToISO3(r.country || 'sk').toLowerCase()}/${r.urlSlug || r.slug}` : '/pack/map/triplist',
    });
  }

  // SOCIÁLNE (IG) — id nesie druh, cieľ a čas najnovšej reakcie: ďalší lajk rozsvieti zoskupený riadok znova.
  // Odkaz: príspevok `?post=<id>` (+ `&c=` komentár), citát `?cm=<kľúč>&c=<komentár>` (vlákno, odroluje na komentár),
  // výlet = jeho článok (`?c=<id>` odroluje na otázku/recenziu v `TripComments`). Fotka výletu je z klientskeho datasetu (server ju nenesie).
  for (const r of social.data ?? []) {
    const isTrip = r.kind === 'trip_like' || r.kind === 'trip_comment';
    const tripPhoto = isTrip ? trails.find((t) => t.id === currentTripId(r.target))?.photos?.[0] : undefined;
    const c = r.ref ? `&c=${encodeURIComponent(r.ref)}` : '';
    const path = r.kind === 'quote_reply' ? `/pack?cm=${encodeURIComponent(r.target)}${c}`
      : isTrip ? `${pathOf(r.target)}${r.kind === 'trip_comment' && r.ref ? `?c=${encodeURIComponent(r.ref)}` : ''}`
      : `/pack?post=${encodeURIComponent(r.target)}${r.kind === 'post_comment' ? c : ''}`;
    out.push({
      id: `soc|${r.kind}|${r.target}|${r.at}`, kind: r.kind, tripSlug: isTrip ? r.target : '',
      tripName: r.preview ?? '', tripPath: path, count: r.n, at: r.at, who: r.who ?? undefined,
      photo: r.photo ?? tripPhoto ?? undefined, preview: r.preview ?? undefined,
      whoPhoto: r.who_photo ?? undefined,
    });
  }

  // SOS — prioritné riadky (v paneli idú navrch). Len SOS_ON; chyba = žiadne riadky.
  if (SOS_ON) {
    try {
      const lost = await loadSosActive();
      for (const r of lost) {
        out.push({ id: `sos|${r.id}`, kind: 'sos_lost', tripSlug: '', tripName: r.place_label ?? '', tripPath: `/pack/sos/${r.slug}`, count: 1, at: r.created_at, who: r.dog_name, whoFem: r.dog_gender === 'queen', photo: r.photo ?? undefined });
      }
      for (const r of lost.filter((x) => x.is_mine)) {
        const m = await sosMine(r.id).catch(() => null);
        if (m?.status === 'active' && m.asked_at) {
          out.push({ id: `sosq|${m.id}|${m.asked_at}`, kind: 'sos_still', tripSlug: '', tripName: m.place_label ?? '', tripPath: `/pack/sos/${m.slug}`, count: 1, at: m.asked_at, who: m.dog_name, photo: m.photo ?? undefined });
        }
      }
    } catch { /* SOS je prídavok, chvost nesmie spadnúť */ }
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}
