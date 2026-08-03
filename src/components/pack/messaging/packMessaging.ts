// Messaging jadro (dátová vrstva, ŽIADNE UI) — design:
// plany/zadanie-profil-messaging-2026-07-23.md §12 (MESSAGING MODEL v2 — DM +
// OPEN GROUPS, nahrádza pôvodný §4.1 tvar).
//
// ── 2026-08-03, issue #53: DM SÚ V DB ─────────────────────────────────────────
// Matej 25.7.: „správy chcem v launchi". Do dnes bol backend 100 % localStorage —
// napíšeš správu, zavrieš tab a je preč; druhému nikdy nedôjde.
//
//   • `kind='dm'`   → Supabase (`pack_conversations` / `pack_conv_members` /
//                     `pack_messages`, migrácia 20260803_pack_messaging.sql),
//                     realtime doručenie, prežije odhlásenie aj výmenu zariadenia.
//
// ── 2026-08-03, "začíname so všetkým do nuly": SKUPINY (mock) PREČ ───────────
// Matej: appka pred launchom nesmie ukazovať vymyslených ľudí ani vymyslené
// správy. Do dnes `kind='group'` žilo ako fiktívne vlákno (jedna skupina na
// výlet, 3–6 vymyslených členov z MOCK_MEMBER_POOL, 4–8 vymyslených správ,
// nafúknutý "X members" label) — generátor (`buildTripGroups`), auto-reply
// (`maybeAutoReply`) aj nafúknutie `memberCount` boli zmazané, vrátane
// jednorazovej migrácie, ktorá tie isté dáta vyčistí aj z localStorage u ľudí,
// čo appku už otvorili predtým (`purgeMockGroupConversations` nižšie).
// `kind='group'` ostáva v type systéme pre issue #62 (skupinový čet PO
// LAUNCHI, s reálnymi členmi) — dnes ho už nič negeneruje.
//
// Verejné API sa nezmenilo (UI komponenty ho volajú rovnako), pribudlo len
// `startTripDM()` — založenie vlákna nad výletom.
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
  // group only. Skutočný počet členov skupiny (nie `members.length`, ktoré nesie len
  // tie, čo appka aktuálne drží in-memory) — kým skupiny negeneruje nič (2026-08-03,
  // zmazaná fabrikácia, viď hlavička súboru), toto pole nikto nenastavuje a UI padá
  // na `members.length`. Keď sa vráti issue #62, sem ide REÁLNY počet z DB, nikdy nie
  // odhad "nech to vyzerá živo".
  memberCount?: number;
  tag?: MsgTag;                // štítok (trip/region/…) — nesie sa aj do budúceho feedu
  messages: Message[];
  lastReadAt: Record<string, string>; // per participant id
  updatedAt: string;
  // DM only (#54) — blok v KTOROMKOĽVEK smere. Server ho vracia ako jeden boolean
  // zámerne: kto koho zablokoval, si už ani jeden druhému nenapíše, takže UI nemá
  // dôvod ten smer poznať (a z blokovaného by sa nemalo dať vyčítať, že blokol on).
  blocked?: boolean;
}

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

// ── jednorazová migrácia: fiktívne skupinové vlákna preč z localStorage ──────
// (2026-08-03, "začíname so všetkým do nuly"). Predtým sem `ensureSeeded()`
// zapisovala vymyslené trip-skupiny pri prvom otvorení appky; ten generátor je
// zmazaný (viď hlavička súboru), ale u ľudí, čo appku medzičasom otvorili, tie
// isté dáta ešte ležia v localStorage a treba ich stiahnuť aj odtiaľ.
//
// Prečo je bezpečné mazať bez rozlišovania per-konverzácia: `loadRaw()`/`persist()`
// vyššie filtrujú VŠETKO pod STORAGE_KEY na `isGroupConv` — DM sa do localStorage
// od issue #53 nikdy nezapisujú (žijú výhradne v Supabase, `pack_conversations` /
// `pack_messages`) a staršie DM z localStorage éry loadRaw() zahadzuje ešte pred
// touto migráciou. Zároveň appka dnes nemá ŽIADNU legitímnu cestu, ako by
// `kind='group'` vlákno mohlo vzniknúť inak než cez zmazaný `buildTripGroups()`
// (skupiny sa z UI nezakladajú, len sa seedovali). Preto: čokoľvek `isGroupConv`
// pod STORAGE_KEY = 100 % fabrikované, nikdy reálna správa skutočného človeka.
// Guard flag = beží raz; keby niekedy pribudol reálny skupinový čet (issue #62),
// táto migrácia už dávno doběhla predtým, než by mohla vzniknúť prvá reálna
// skupina, takže riziko zámeny nehrozí.
const MOCK_GROUPS_PURGED_KEY = 'dogypt.messages.mockgroups-purged.v1';
function purgeMockGroupConversations(): void {
  try {
    if (localStorage.getItem(MOCK_GROUPS_PURGED_KEY)) return;
    for (const [id, conv] of Object.entries(cache.conversations)) {
      if (isGroupConv(conv)) delete cache.conversations[id];
    }
    persist();
    localStorage.setItem(MOCK_GROUPS_PURGED_KEY, '1');
  } catch { /* private mode / quota — non-fatal, appka beží aj bez migrácie */ }
}
purgeMockGroupConversations(); // hydrate at module load — localStorage read is sync, safe here

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
    blocked: row.blocked ?? false,
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

// ── blok a nahlásenie (issue #54) ───────────────────────────────────────────
// Obe idú cez `security definer` RPC, lebo appka **nepozná cudzí `user_id`** —
// `list_my_conversations()` ho zámerne nevydáva. Protistranu si odvodí server
// z vlákna, ktorého som členom (`conv_peer()`); klient posiela len `convId`.

export type ReportReason = 'spam' | 'harassment' | 'unsafe' | 'not_dog_related' | 'other';

/** zablokuje / odblokuje protistranu DM; vracia stav PO operácii */
export async function setPeerBlocked(convId: string, blocked: boolean): Promise<boolean> {
  const me = await ensureMe();
  if (me.id === 'me') return false;          // bez session nie je koho blokovať
  const { data, error } = await db.rpc('block_conv_peer', { p_conv_id: convId, p_block: blocked });
  if (error) throw error;                     // volajúci musí vedieť, že zámok NEplatí
  const state = Boolean(data);
  const conv = cache.conversations[convId];
  if (conv) { conv.blocked = state; emitChange(); }
  void refreshDMs();                          // server je zdroj pravdy aj pre zvyšok Inboxu
  return state;
}

/**
 * Nahlási obsah alebo človeka. Poradie je zámerné: najprv zápis do DB (to je
 * zámok — musí platiť aj keď mail nikam nedôjde), až potom ping Matejovi.
 * Zlyhaný mail preto nikdy nezhodí nahlásenie.
 */
export async function reportContent(
  kind: 'member' | 'conversation' | 'comment' | 'trip',
  ref: string,
  reason: ReportReason,
  note?: string,
): Promise<void> {
  const me = await ensureMe();
  if (me.id === 'me') throw new Error('[packMessaging] reportContent: no session');
  const { data, error } = await db.rpc('report_content', {
    p_kind: kind, p_ref: ref, p_reason: reason, p_note: note ?? null,
  });
  if (error) throw error;

  try {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (token) {
      await supabase.functions.invoke('notify-report', {
        body: { report_id: data },
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // mail je len ping — nahlásenie je zapísané a Matej ho vidí v admin pohľade
  }
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

// Bývalé `maybeAutoReply()`/`MSG_AUTOREPLY` (§4.4 + Fable amendment §10) —
// canned odpoveď od "iného člena" 2–4s po odoslaní — zmazané 2026-08-03
// ("začíname so všetkým do nuly"): kým bežalo len nad mock skupinami, bola to
// fabrikovaná správa od vymysleného človeka a Matej presne také dáta chce preč
// pred launchom. DM to nikdy nesmelo robiť (canned odpoveď menom skutočného
// človeka by bol podvrh) a od issue #53 aj tak ide výhradne cez DB.

// SWAP HOTOVÝ pre DM (2026-08-03, #53): `pack_conversations` / `pack_conv_members`
// / `pack_messages` + realtime. Skupiny (mock) sú od toho istého dňa zmazané —
// zostáva čakať na issue #62 (skupinový čet po launchi, s reálnymi členmi).
