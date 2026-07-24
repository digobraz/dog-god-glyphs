// Messaging jadro (dátová vrstva, ŽIADNE UI) — design:
// plany/zadanie-profil-messaging-2026-07-23.md §12 (MESSAGING MODEL v2 — DM +
// OPEN GROUPS, nahrádza pôvodný §4.1 tvar). MOCK vrstva: localStorage kľúč
// 'dogypt.messages.v1', async-tvarované CRUD API kvôli budúcemu drop-in swapu
// na Supabase (žiadne priame localStorage v komponentoch — vždy cez toto API).
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

// ── localStorage CRUD (async-tvarované kvôli budúcemu Supabase swapu) ──
const STORAGE_KEY = 'dogypt.messages.v1';

interface StoredState { conversations: Record<string, Conversation>; }

function loadRaw(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { conversations: {} };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return { conversations: parsed.conversations ?? {} };
  } catch {
    return { conversations: {} }; // corrupt / private-mode — non-fatal, fall back to empty
  }
}

function persist(): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* quota / private mode — non-fatal */ }
}

// in-memory cache = single source of truth for every read/write below (not a
// re-read of localStorage per call) — sets up the same shape a real async
// Supabase backend will need, and is what makes unreadCount() safely sync.
let cache: StoredState = loadRaw();

// Naseeduje skupiny ak je localStorage prázdny (prvý load). Nedotýka sa
// existujúcich dát (user-created DMs / už naseedované skupiny).
export function ensureSeeded(): void {
  if (Object.keys(cache.conversations).length > 0) return;
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

// ── CRUD ──
// Accessory vracajú vždy NOVÚ referenciu (shallow clone), nie objekt z cache.
// Inak by React `setConv(sameRef)` zahodil cez Object.is → Thread by sa neprekreslil
// po send/join/auto-reply (bug 2026-07-23: view sa aktualizoval "o udalosť neskoro",
// lebo mutácie boli in-place a vracali rovnakú referenciu). Vnorené polia (messages,
// members, memberIds, lastReadAt) sú pri každej mutácii už nahradené novým arrayom,
// takže top-level `{ ...conv }` stačí.
const snapshot = (c: Conversation): Conversation => ({ ...c });

export async function listConversations(): Promise<Conversation[]> {
  return Object.values(cache.conversations)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(snapshot);
}

// jedna konverzácia podľa id — Thread si po mutácii (send/join) alebo emitteri
// vie okamžite dotiahnuť len "svoju" konverzáciu bez zbytočného listovania všetkých.
export async function getConversation(convId: string): Promise<Conversation | undefined> {
  const c = cache.conversations[convId];
  return c ? snapshot(c) : undefined;
}

export async function getOrCreateConversation(opts: {
  withMember: Participant;
  tag?: MsgTag;
}): Promise<Conversation> {
  const me = await ensureMe();
  const id = `dm:${[me.id, opts.withMember.id].sort().join('_')}`;
  const existing = cache.conversations[id];
  if (existing) {
    if (opts.tag && !existing.tag) { existing.tag = opts.tag; persist(); emitChange(); }
    return snapshot(existing);
  }
  const conv: Conversation = {
    id,
    kind: 'dm',
    members: [{ ...me }, opts.withMember],
    memberIds: [me.id, opts.withMember.id],
    tag: opts.tag,
    messages: [],
    lastReadAt: {},
    updatedAt: new Date().toISOString(),
  };
  cache.conversations[id] = conv;
  persist();
  emitChange();
  return snapshot(conv);
}

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
  persist();
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

// SWAP: localStorage → supabase.from('conversations'/'messages'/'conv_members'/'message_reads') — verejné API sa nemení.
