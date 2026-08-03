// Messaging jadro (dátová vrstva, ŽIADNE UI) — design:
// plany/zadanie-profil-messaging-2026-07-23.md §12 (MESSAGING MODEL v2 — DM +
// OPEN GROUPS, nahrádza pôvodný §4.1 tvar).
//
// ── 2026-08-03, issue #53: DM SÚ V DB, SKUPINY OSTÁVAJÚ MOCK ──────────────────
// Matej 25.7.: „správy chcem v launchi". Do dnes bol backend 100 % localStorage —
// napíšeš správu, zavrieš tab a je preč; druhému nikdy nedôjde.
//
// Vrstva je odteraz HYBRID a delí sa presne podľa toho, či na druhej strane je
// SKUTOČNÝ ČLOVEK:
//   • `kind='dm'`   → Supabase (`pack_conversations` / `pack_conv_members` /
//                     `pack_messages`, migrácia 20260803_pack_messaging.sql),
//                     realtime doručenie, prežije odhlásenie aj výmenu zariadenia.
//   • `kind='group'`→ ostáva mock v localStorage. Sú to fiktívne vlákna
//                     s MOCK_MEMBER_POOL; zapísať ich do DB by znamenalo vyrobiť
//                     dáta o neexistujúcich ľuďoch. Skupinový čet = issue #62
//                     (PO LAUNCHI) a vtedy vzniknú nanovo, s reálnymi členmi.
//
// Dôsledok, ktorý si treba všimnúť: `maybeAutoReply()` beží LEN nad skupinami.
// V DM by fabrikoval správy menom skutočného človeka — to nie je demo, to je
// podvrh. Stráži to podmienka priamo v tej funkcii.
//
// Verejné API sa nezmenilo (UI komponenty ho volajú rovnako), pribudlo len
// `startTripDM()` — založenie vlákna nad výletom.
//
// Model: 1:1 DM + otvorené obsahové skupiny (voľný join, kedykoľvek). Trip =
// jeden podtyp skupiny. Skupiny sa z UI NEzakladajú, len sa seedujú (§12) a
// pripájaš sa k nim (joinGroup) — skupina žije aj bez teba.
import { MOCK_MEMBER_POOL } from '@/components/pack/packCommunity';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { HERO_JOURNEYS } from '@/data/heroJourneys';
import { supabase } from '@/integrations/supabase/client';

// ── typy (§12, presné znenie zo zadania) ──
export type ConvKind = 'dm' | 'group';
export type Membership = 'open' | 'invite'; // group: open = free-join
export type PostPolicy = 'all' | 'admins';

export interface MsgTag {
  kind: 'trip' | 'region' | 'interest' | 'ritual' | 'general';
  id?: string;
  label?: string;
}

export interface Message {
  id: string;
  convId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  packNumber?: number;
  kind: 'me' | 'member';
}

export interface Conversation {
  id: string;
  kind: ConvKind;
  title?: string;              // group only
  membership?: Membership;     // group only
  postPolicy?: PostPolicy;     // group only, default 'all'
  members: Participant[];      // DM=2, group=N (vrátane 'me' po join)
  memberIds: string[];         // rýchly join-check
  // Nie v pôvodnom typovom bloku §12, ale explicitne vyžiadané seed-správaním
  // ("memberCount odvoď väčší než reálny members[] ... na 'X members' label").
  // group only — flag pre volajúceho, ak sa toto rozhodnutie nepáči, ľahko sa zmaže.
  memberCount?: number;
  tag?: MsgTag;                // štítok (trip/region/…) — nesie sa aj do budúceho feedu
  messages: Message[];
  lastReadAt: Record<string, string>; // per participant id
  updatedAt: string;
}

// ── deterministický hash → PRNG (mulberry32 + FNV-1a) — rovnaký vzor ako
// packCommunity.ts / packProfile.ts, zámerne duplikovaný (nie import) — modul
// stojí samostatne, mock skupinové dáta musia byť stabilné medzi rendermi. ──
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickN<T>(pool: readonly T[], n: number, rnd: () => number): T[] {
  const remaining = [...pool];
  const out: T[] = [];
  const count = Math.min(n, remaining.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rnd() * remaining.length);
    out.push(remaining.splice(idx, 1)[0]);
  }
  return out;
}

const DAY_MS = 86400000;

// ── canned text palettes (EN, deterministicky vybrané — web texty = EN) ──
const SEED_MSG_POOL: string[] = [
  'Just got back from this one — the views up top were worth every step.',
  "Anyone know if the trail is muddy after rain?",
  'My dog loved this route, plenty of shade for the summer.',
  'Doing this again next weekend if anyone wants to join.',
  "Watch out for the last climb, it's steeper than it looks.",
  'Best trail I have done with the pack so far.',
  'Water source about halfway — good to know for the pups.',
  'Perfect for an early morning walk before it gets crowded.',
];

const DM_AUTOREPLY_POOL: string[] = [
  'Sounds good — what time works for you?',
  'Yes! Count me and my dog in.',
  'Let me check the weather and get back to you.',
  'Awesome, see you there!',
];

const GROUP_AUTOREPLY_POOL: string[] = [
  "Same here, can't wait for the next one.",
  "Good question — I'll check the trail conditions.",
  'Following this thread, thinking of doing it too.',
  'Ha, that last climb almost killed my legs.',
];

// ── group seed builders (§12 taxonómia skupín, poradie stavby) ──
// 1) trip-groups (implementované, nula extra dát — každý trip z HERO_TRAILS +
//    HERO_JOURNEYS = jedna otvorená skupina).
// TODO: region (SK_GEO 8 krajov) + ritual (Daily Devotion, Founders' Pack) —
// čaká na Matejovo poradie (§12: "⏳ Na Matejovo slovo"). interest = až po
// profile module (§12), tiež odložené.
function buildTripGroups(nowMs: number): Conversation[] {
  const trips: { id: string; name: string }[] = [...HERO_TRAILS, ...HERO_JOURNEYS];
  return trips.map((trip) => {
    const convId = `group:trip:${trip.id}`;

    const memberRnd = mulberry32(hashStr(`${convId}:members`));
    const memberTarget = 3 + Math.floor(memberRnd() * 4); // 3..6
    const picked = pickN(MOCK_MEMBER_POOL, memberTarget, memberRnd);
    const members: Participant[] = picked.map((m) => ({
      id: m.id, name: m.name, avatarUrl: m.avatarUrl, packNumber: m.packNumber, kind: 'member' as const,
    }));
    const memberIds = members.map((m) => m.id);

    const msgRnd = mulberry32(hashStr(`${convId}:messages`));
    const msgCount = 4 + Math.floor(msgRnd() * 5); // 4..8
    const messages: Message[] = [];
    for (let i = 0; i < msgCount && members.length > 0; i++) {
      const sender = members[Math.floor(msgRnd() * members.length)];
      const text = SEED_MSG_POOL[Math.floor(msgRnd() * SEED_MSG_POOL.length)];
      const offsetMs = Math.floor(msgRnd() * 5 * DAY_MS); // spread over last ~5 days
      const createdAt = new Date(nowMs - offsetMs).toISOString();
      messages.push({ id: `${convId}:seed:${i}`, convId, senderId: sender.id, text, createdAt });
    }
    messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const last = messages[messages.length - 1];

    // display-only "X members" — bigger than the seeded members[] we actually
    // model (5..40 extra, deterministic per trip).
    const memberCount = members.length + 5 + Math.floor(msgRnd() * 36);

    return {
      id: convId,
      kind: 'group',
      title: trip.name,
      membership: 'open',
      postPolicy: 'all',
      members,
      memberIds,
      memberCount,
      tag: { kind: 'trip', id: trip.id, label: trip.name },
      messages,
      lastReadAt: {},
      updatedAt: last ? last.createdAt : new Date(nowMs).toISOString(),
    } satisfies Conversation;
  });
}

type GroupSeedBuilder = (nowMs: number) => Conversation[];
export const GROUP_SEED_BUILDERS: GroupSeedBuilder[] = [
  buildTripGroups,
  // TODO: region (SK_GEO 8 krajov) + ritual (Daily Devotion, Founders' Pack) — čaká na Matejovo poradie
];

// ── úložisko ──
// Cache drží OBA druhy vlákien, ale na disk ide len skupinová (mock) časť. DM
// vlákna sa do localStorage nezapisujú zámerne: sú to súkromné správy skutočných
// ľudí a jediný ich zdroj pravdy je DB. Kópia v prehliadači by len zastarávala
// a ostávala tam po odhlásení.
const STORAGE_KEY = 'dogypt.messages.v1';

const isGroupConv = (c: Conversation): boolean => c.kind === 'group';

interface StoredState { conversations: Record<string, Conversation>; }

function loadRaw(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: {} };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const all = parsed.conversations ?? {};
    // staršie verzie appky si sem stihli uložiť aj DM (localStorage éra) —
    // tie sa zahadzujú, DB je jediný zdroj pravdy
    const groups: Record<string, Conversation> = {};
    for (const [id, conv] of Object.entries(all)) if (isGroupConv(conv)) groups[id] = conv;
    return { conversations: groups };
  } catch {
    return { conversations: {} }; // corrupt / private-mode — non-fatal, fall back to empty
  }
}

function persist(): void {
  try {
    const groups: Record<string, Conversation> = {};
    for (const [id, conv] of Object.entries(cache.conversations)) if (isGroupConv(conv)) groups[id] = conv;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations: groups }));
  } catch { /* quota / private mode — non-fatal */ }
}

// in-memory cache = single source of truth for every read/write below (not a
// re-read of localStorage per call) — sets up the same shape a real async
// Supabase backend will need, and is what makes unreadCount() safely sync.
const cache: StoredState = loadRaw();

// Naseeduje skupiny ak je localStorage prázdny (prvý load). Nedotýka sa
// existujúcich dát (user-created DMs / už naseedované skupiny).
export function ensureSeeded(): void {
  // pýtame sa výslovne na SKUPINY — po hydratácii DM z DB by „už tu niečo je"
  // znamenalo, že sa skupiny nenaseedujú nikdy
  if (Object.values(cache.conversations).some(isGroupConv)) return;
  const nowMs = Date.now();
  for (const build of GROUP_SEED_BUILDERS) {
    for (const conv of build(nowMs)) cache.conversations[conv.id] = conv;
  }
  persist();
}
ensureSeeded(); // hydrate at module load — localStorage read is sync, safe here

// ── in-tab event emitter — notifications/badge reagujú bez reloadu ──
type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange(): void { listeners.forEach((l) => l()); }

export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

// ── "me" identity — z usePackIdentity/session ak existuje, inak stabilný dev
// fallback (nikdy nekrachne bez session). getMe() je sync (číta in-memory
// cache); hydratácia zo Supabase session beží na pozadí a async CRUD nižšie
// si pred použitím meId počká na ňu cez ensureMe(), takže konverzácie sa
// vždy zakladajú so správnym id aj keď getMe() na začiatku vráti fallback. ──
function fallbackMe(): Participant { return { id: 'me', name: 'You', kind: 'me' }; }

let meCache: Participant = fallbackMe();
let meHydration: Promise<void> | null = null;

function hydrateMe(): Promise<void> {
  if (meHydration) return meHydration;
  meHydration = (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        const email = user.email ?? '';
        const name = (user.user_metadata?.dog_name as string | undefined) || email.split('@')[0] || 'You';
        meCache = { id: user.id, name, kind: 'me' };
        emitChange();
      }
    } catch {
      // no session / offline / not signed in yet — stay on the stable dev fallback
    }
  })();
  return meHydration;
}
void hydrateMe();

async function ensureMe(): Promise<Participant> {
  await hydrateMe();
  return meCache;
}

export function getMe(): Participant {
  return meCache;
}

// ── DM vrstva nad Supabase (issue #53) ──────────────────────────────────────
// Vzor je rovnaký ako `packStore.ts`: hydrate-once + write-through, čítačky
// ostávajú synchrónne nad in-memory cache (preto `unreadCount()` nemusí byť
// async a badge sa nemusí prekresľovať cez await).
//
// DM konverzácia má v cache uuid od servera (žiadny `dm:` prefix) — vlákno
// poznáme podľa `kind`, nie podľa tvaru id.

/** riadok z `list_my_conversations()` (SQL definuje presné stĺpce) */
interface ConvRow {
  conv_id: string;
  kind: string;
  tag_kind: string | null;
  tag_id: string | null;
  tag_label: string | null;
  updated_at: string;
  last_read_at: string;
  other_key: number | null;
  other_first: string | null;
  other_dog: string | null;
  other_photo: string | null;
  last_body: string | null;
  last_sender_me: boolean | null;
  last_at: string | null;
  unread: number | null;
  blocked: boolean | null;
}

interface MsgRow { id: string; conv_id: string; sender_id: string; body: string; created_at: string }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** protistrana DM — meno psa je to, čo človek v packu pozná (D1: účet, pes = zobrazenie) */
function otherFromRow(row: ConvRow): Participant {
  const name = row.other_dog?.trim() || row.other_first?.trim() || 'Dogyptian';
  return {
    // cudzí `user_id` appka nedostáva (get_trip_party ani list_my_conversations ho
    // nevydávajú) — na rozlíšenie „ja vs. on" v bubline stačí stabilný kľúč vlákna
    id: `other:${row.conv_id}`,
    name,
    avatarUrl: row.other_photo ?? undefined,
    packNumber: row.other_key ?? undefined,
    kind: 'member',
  };
}

function convFromRow(row: ConvRow, meId: string): Conversation {
  const other = otherFromRow(row);
  // preview v Inboxe číta poslednú správu z `messages` — zo zoznamu prichádza len
  // jej text a čas, plné vlákno dotiahne `getConversation()` až pri otvorení
  const preview: Message[] = row.last_body && row.last_at
    ? [{
        id: `${row.conv_id}:preview`,
        convId: row.conv_id,
        senderId: row.last_sender_me ? meId : other.id,
        text: row.last_body,
        createdAt: row.last_at,
      }]
    : [];
  // `lastReadAt` prepočítaný tak, aby sedel s `unread` zo servera: keď server
  // hlási neprečítané, preview správa MUSÍ vyjsť ako neprečítaná aj lokálne
  const readAt = (row.unread ?? 0) > 0 && row.last_at
    ? new Date(new Date(row.last_at).getTime() - 1000).toISOString()
    : row.last_read_at;
  return {
    id: row.conv_id,
    kind: 'dm',
    members: [{ ...meCache }, other],
    memberIds: [meId, other.id],
    tag: row.tag_kind
      ? { kind: row.tag_kind as MsgTag['kind'], id: row.tag_id ?? undefined, label: row.tag_label ?? undefined }
      : undefined,
    messages: preview,
    lastReadAt: { [meId]: readAt },
    updatedAt: row.updated_at,
  };
}

let dmHydration: Promise<void> | null = null;

/** natiahne moje DM vlákna z DB — raz; ďalšie kolá cez `refreshDMs()` */
function hydrateDMs(): Promise<void> {
  if (dmHydration) return dmHydration;
  dmHydration = refreshDMs();
  return dmHydration;
}

async function refreshDMs(): Promise<void> {
  const me = await ensureMe();
  if (me.id === 'me') return; // bez session nie je čo naťahovať
  try {
    const { data, error } = await db.rpc('list_my_conversations') as { data: ConvRow[] | null; error: unknown };
    if (error || !data) return;
    // zmaž staré DM z cache — server je jediný zdroj pravdy (vlákno mohlo zmiznúť)
    for (const [id, conv] of Object.entries(cache.conversations)) {
      if (conv.kind === 'dm') delete cache.conversations[id];
    }
    for (const row of data) {
      const fresh = convFromRow(row, me.id);
      cache.conversations[fresh.id] = fresh;
    }
    emitChange();
  } catch {
    // offline / RLS / neprihlásený — vlákna sa jednoducho neukážu, appka beží ďalej
  }
}

/** plné vlákno správ jednej DM konverzácie */
async function loadDMMessages(convId: string): Promise<void> {
  const me = await ensureMe();
  const conv = cache.conversations[convId];
  if (!conv || conv.kind !== 'dm') return;
  const { data, error } = await db
    .from('pack_messages')
    .select('id, conv_id, sender_id, body, created_at')
    .eq('conv_id', convId)
    .order('created_at', { ascending: true }) as { data: MsgRow[] | null; error: unknown };
  if (error || !data) return;
  const other = conv.members.find((p) => p.id !== me.id);
  conv.messages = data.map((m) => ({
    id: m.id,
    convId: m.conv_id,
    // v DB je skutočný uuid odosielateľa; UI pozná len „ja" a „on"
    senderId: m.sender_id === me.id ? me.id : (other?.id ?? m.sender_id),
    text: m.body,
    createdAt: m.created_at,
  }));
  emitChange();
}

// ── realtime: doručenie na druhé zariadenie bez refreshu ──
// `postgres_changes` rešpektuje RLS na SELECT, takže sem dorazia výhradne
// správy z vlákien, ktorých som člen — filter na klientovi by bol clona.
let realtimeStarted = false;

function startRealtime(): void {
  if (realtimeStarted) return;
  realtimeStarted = true;
  try {
    db.channel('pack-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pack_messages' },
        (payload: { new: MsgRow }) => {
          const row = payload.new;
          const conv = cache.conversations[row.conv_id];
          if (!conv) { void refreshDMs(); return; } // nové vlákno od niekoho iného
          if (conv.messages.some((m) => m.id === row.id)) return; // vlastná, už pridaná
          const meId = meCache.id;
          const other = conv.members.find((p) => p.id !== meId);
          conv.messages = [
            // preview riadok zo zoznamu nahradí skutočná správa, ak je to tá istá
            ...conv.messages.filter((m) => !m.id.endsWith(':preview') || m.createdAt !== row.created_at),
            {
              id: row.id,
              convId: row.conv_id,
              senderId: row.sender_id === meId ? meId : (other?.id ?? row.sender_id),
              text: row.body,
              createdAt: row.created_at,
            },
          ];
          conv.updatedAt = row.created_at;
          emitChange();
        })
      .subscribe();
  } catch {
    // realtime nedostupný (offline / blokovaný websocket) — správy stále chodia
    // pri každom otvorení Inboxu cez refreshDMs(), len nie okamžite
    realtimeStarted = false;
  }
}

/**
 * Založí (alebo nájde) DM vlákno nad výletom. Cudzí `user_id` appka nemá a mať
 * nemá — adresátom je buď ORGANIZÁTOR (`packNumber` vynechaný), alebo účastník
 * podľa poradového čísla psa. Kto sa s adresátom nad tým výletom nestretol,
 * dostane `null` (SQL `start_dm()` to strážii, nie táto funkcia).
 *
 * @returns id konverzácie, alebo null keď vlákno vzniknúť nesmie
 */
export async function startTripDM(opts: {
  tripSlug: string;
  organizerId: string;
  packNumber?: number | null;
}): Promise<string | null> {
  const me = await ensureMe();
  if (me.id === 'me') return null;
  const { data, error } = await db.rpc('start_dm', {
    p_trip_slug: opts.tripSlug,
    p_organizer: opts.organizerId,
    p_pack_number: opts.packNumber ?? null,
  }) as { data: string | null; error: unknown };
  if (error || !data) return null;
  await refreshDMs();
  startRealtime();
  return data;
}

// ── CRUD ──
// Accessory vracajú vždy NOVÚ referenciu (shallow clone), nie objekt z cache.
// Inak by React `setConv(sameRef)` zahodil cez Object.is → Thread by sa neprekreslil
// po send/join/auto-reply (bug 2026-07-23: view sa aktualizoval "o udalosť neskoro",
// lebo mutácie boli in-place a vracali rovnakú referenciu). Vnorené polia (messages,
// members, memberIds, lastReadAt) sú pri každej mutácii už nahradené novým arrayom,
// takže top-level `{ ...conv }` stačí.
const snapshot = (c: Conversation): Conversation => ({ ...c });

export async function listConversations(): Promise<Conversation[]> {
  await hydrateDMs();   // prvé volanie natiahne DM z DB, ďalšie sú zadarmo
  startRealtime();
  return Object.values(cache.conversations)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(snapshot);
}

// jedna konverzácia podľa id — Thread si po mutácii (send/join) alebo emitteri
// vie okamžite dotiahnuť len "svoju" konverzáciu bez zbytočného listovania všetkých.
export async function getConversation(convId: string): Promise<Conversation | undefined> {
  let c = cache.conversations[convId];
  if (!c) {                       // deep-link na vlákno, ktoré ešte nie je v cache
    await hydrateDMs();
    c = cache.conversations[convId];
  }
  if (!c) return undefined;
  if (c.kind === 'dm') {
    startRealtime();
    await loadDMMessages(convId);  // Inbox drží len preview, vlákno chce celú históriu
    c = cache.conversations[convId] ?? c;
  }
  return snapshot(c);
}

// `getOrCreateConversation({ withMember })` tu bolo v localStorage ére: DM sa
// adresovala priamo `Participant.id`. Na serveri to nejde a ísť nemá — appka
// cudzí `user_id` nepozná. Nahradilo ju `startTripDM()` (vyššie), ktoré adresuje
// kontextom výletu a poradovým číslom. Volajúceho stará funkcia nikdy nemala.

export async function joinGroup(convId: string): Promise<Conversation> {
  const me = await ensureMe();
  const conv = cache.conversations[convId];
  if (!conv) throw new Error(`[packMessaging] joinGroup: conversation not found: ${convId}`);
  if (!conv.memberIds.includes(me.id)) {
    conv.memberIds = [...conv.memberIds, me.id];
    conv.members = [...conv.members, { ...me }];
    conv.updatedAt = new Date().toISOString();
    persist();
    emitChange();
  }
  return snapshot(conv);
}

export async function sendMessage(convId: string, text: string): Promise<Conversation> {
  const me = await ensureMe();
  const conv = cache.conversations[convId];
  if (!conv) throw new Error(`[packMessaging] sendMessage: conversation not found: ${convId}`);
  const trimmed = text.trim();
  if (!trimmed) return conv;

  // DM: zapisuje sa do DB a až POTOM do cache. Optimistický zápis by pri
  // odmietnutí (blok, vypadnuté členstvo, offline) ukázal správu ako odoslanú,
  // hoci druhej strane nikdy nedôjde — pri správach je to horšie než čakanie.
  if (conv.kind === 'dm') {
    const { data, error } = await db
      .from('pack_messages')
      .insert({ conv_id: convId, sender_id: me.id, body: trimmed })
      .select('id, conv_id, sender_id, body, created_at')
      .single() as { data: MsgRow | null; error: { message?: string } | null };
    if (error || !data) {
      throw new Error(`[packMessaging] správa neodišla: ${error?.message ?? 'unknown'}`);
    }
    if (!conv.messages.some((m) => m.id === data.id)) {   // realtime mohol predbehnúť
      conv.messages = [
        ...conv.messages.filter((m) => !m.id.endsWith(':preview')),
        { id: data.id, convId, senderId: me.id, text: data.body, createdAt: data.created_at },
      ];
    }
    conv.updatedAt = data.created_at;
    conv.lastReadAt = { ...conv.lastReadAt, [me.id]: data.created_at };
    void db.rpc('mark_conv_read', { p_conv_id: convId });
    emitChange();
    return snapshot(conv);
  }

  const msg: Message = {
    id: `${convId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    convId, senderId: me.id, text: trimmed, createdAt: new Date().toISOString(),
  };
  conv.messages = [...conv.messages, msg];
  conv.updatedAt = msg.createdAt;
  conv.lastReadAt = { ...conv.lastReadAt, [me.id]: msg.createdAt }; // sender implicitly "read" their own message
  persist();
  emitChange();
  maybeAutoReply(convId); // demo obojsmernosť (§4.4) — no-op ak MSG_AUTOREPLY=false
  return snapshot(conv);
}

export async function markRead(convId: string): Promise<void> {
  const me = await ensureMe();
  const conv = cache.conversations[convId];
  if (!conv) return;
  conv.lastReadAt = { ...conv.lastReadAt, [me.id]: new Date().toISOString() };
  // DM: čas určuje server (`mark_conv_read`), lokálna hodnota je len okamžitá
  // odozva pre badge. Rozladené hodiny v prehliadači by inak vyrobili trvalo
  // neprečítané alebo trvalo prečítané vlákno.
  if (conv.kind === 'dm') void db.rpc('mark_conv_read', { p_conv_id: convId });
  else persist();
  emitChange();
}

// sync badge helper — počet konverzácií (nie správ) s nejakou neprečítanou
// správou od niekoho iného. Group konverzácie počítajú len ak som joinnutý
// (memberIds obsahuje me) — nejoinnutá open group nie je "moja" pre badge.
export function unreadCount(): number {
  const meId = meCache.id;
  let count = 0;
  for (const conv of Object.values(cache.conversations)) {
    if (!conv.memberIds.includes(meId)) continue;
    const readAt = conv.lastReadAt[meId] ?? '';
    const hasUnread = conv.messages.some((m) => m.senderId !== meId && m.createdAt > readAt);
    if (hasUnread) count += 1;
  }
  return count;
}

// ── demo obojsmernosť (§4.4 + Fable amendment §10) — po sendMessage od "me"
// pošle po 2–4s canned odpoveď: DM = druhý účastník, group = náhodný člen
// skupiny. 3–4 varianty per typ, vybrané deterministicky podľa convId + počet
// správ (nie 1 veta — inak to pri viacerých konverzáciách vyzerá ako bot).
// Vypnuteľné cez MSG_AUTOREPLY. ──
export const MSG_AUTOREPLY = true;

export function maybeAutoReply(convId: string): void {
  if (!MSG_AUTOREPLY) return;
  const conv = cache.conversations[convId];
  if (!conv) return;
  // 🔒 NIKDY v DM. Na druhej strane je skutočný človek — canned odpoveď jeho
  // menom nie je demo, je to podvrh, a od 2026-08-03 by sa navyše tvárila ako
  // správa z DB. Autoreply žije výhradne v mock skupinách.
  if (conv.kind !== 'group') return;
  const meId = meCache.id;
  const seed = `${convId}:${conv.messages.length}`;
  const delay = 2000 + Math.floor(mulberry32(hashStr(`${seed}:delay`))() * 2000); // 2–4s

  setTimeout(() => {
    const c = cache.conversations[convId];
    if (!c) return;
    let senderId: string;
    let text: string;
    if (c.kind === 'dm') {
      const other = c.members.find((p) => p.id !== meId) ?? c.members[0];
      if (!other) return;
      senderId = other.id;
      text = DM_AUTOREPLY_POOL[hashStr(`${seed}:dm-text`) % DM_AUTOREPLY_POOL.length];
    } else {
      const others = c.members.filter((p) => p.id !== meId);
      if (others.length === 0) return;
      senderId = others[hashStr(`${seed}:group-sender`) % others.length].id;
      text = GROUP_AUTOREPLY_POOL[hashStr(`${seed}:group-text`) % GROUP_AUTOREPLY_POOL.length];
    }
    const msg: Message = { id: `${convId}:auto:${Date.now()}`, convId, senderId, text, createdAt: new Date().toISOString() };
    c.messages = [...c.messages, msg];
    c.updatedAt = msg.createdAt;
    persist();
    emitChange();
  }, delay);
}

// SWAP HOTOVÝ pre DM (2026-08-03, #53): `pack_conversations` / `pack_conv_members`
// / `pack_messages` + realtime. Zostáva swap SKUPÍN — ten čaká na issue #62
// (skupinový čet po launchi), lebo dnešné skupiny sú fikcia s MOCK_MEMBER_POOL.
