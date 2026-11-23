// AINUBIS CHAT v2 — komunikácia so serverom (`ainubis-chat` v:2, `ainubis-hlas`, `ainubis-poll`).
// Kontrakt servera: `vystupy/supabase/functions/_shared/ainubis-v2.ts` + `ainubis-chat/index.ts` (runV2).
// Odoslanie správy ide cez `fetch` so streamom (`supabase.functions.invoke` nestreamuje), malé akcie cez `invoke`.
// URL a kľúč LEN z `@/lib/env` (pravidlo: `VITE_SUPABASE_*` smie čítať jediné env.ts).
// Pod `DEV_NOAUTH` (dev bez prihlásenia) server odmietne, preto sa tu volá MOCK, aby sa UI dalo preklikať.
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { DEV_NOAUTH } from '@/lib/devMockDogs';

export type V2Tier = 'rychly' | 'bystry' | 'hlboky';
export type V2Pick = 'auto' | V2Tier;
/** `zakladatel` = €11 pred FLIPom: profil Kazateľa + Rýchly bez limitu (Matej 23. 11.). V rebríku nie je, nekupuje sa. */
export type V2RankId = 'veriaci' | 'akolyta' | 'knaz' | 'vezir' | 'farao' | 'zakladatel';
export type V2Effort = 'low' | 'medium' | 'high' | 'max';

export const V2_TIERS: readonly V2Tier[] = ['rychly', 'bystry', 'hlboky'];
export const V2_RANKS: readonly V2RankId[] = ['veriaci', 'akolyta', 'knaz', 'vezir', 'farao'];

export interface V2Scroll { id: string; world: string; title: string; line?: string }
/** Zdroj z webu (len Bystrý a Hlboký); server pustí len URL, ktoré naozaj vrátilo hľadanie. */
export interface V2Web { url: string; title: string; host?: string }
export type V2Status = 'thinking' | 'scrolls' | 'web';
export interface V2Voice { path?: string; sec: number; /** blob: URL čerstvej nahrávky (kým nie je obnovená z histórie) */ url?: string }

export interface V2Msg {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  image?: string;
  voice?: V2Voice;
  tier?: V2Tier;
  credits?: number;
  scrolls?: V2Scroll[];
  sos?: string[];
  web?: V2Web[];
  /** Rýchly bez zvitku: ponuka položiť tú istú otázku Bystrému (s webom). */
  offer?: V2Tier | null;
  rating?: 'up' | 'down' | null;
  reported?: boolean;
  fallback?: string | null;
  streaming?: boolean;
  status?: V2Status | null;
  /** Odpoveď je lokálna (chyba, vyčerpané kredity) a nemá serverové id, takže sa nedá hodnotiť ani prehrať. */
  local?: boolean;
}

export interface V2CreditsState { used: number; allowance: number; remaining: number; enabled: boolean; resets_at?: string }

export interface V2Credits {
  rank: V2RankId;
  top: V2Tier;
  effort: V2Effort;
  allowance: number;
  used: number;
  reserved: number;
  messages: number;
  resets_at: string;
  enabled: boolean;
  price: Record<V2Tier, number>;
  ranks: Record<V2RankId, { top: V2Tier; effort: V2Effort; credits: number }>;
  consent: { version: number; at?: string } | null;
}

export interface V2Done {
  message_id: string | null;
  reply: string;
  tier?: V2Tier;
  why?: string;
  pick?: string;
  rank?: V2RankId;
  effort?: V2Effort;
  credits?: number;
  scrolls?: V2Scroll[];
  sos?: string[];
  web?: V2Web[];
  offer?: V2Tier | null;
  health?: boolean;
  fallback?: string | null;
  credits_state?: V2CreditsState | null;
  komnata?: { id: string; prejdena: boolean } | null;
  error?: string;
  resets_at?: string;
}

export interface V2Handlers {
  onMeta?: (m: { conversation_id: string; session_token: string; user_message_id: string | null; branch: string | null }) => void;
  onStatus?: (s: V2Status, tier?: V2Tier) => void;
  onDelta?: (t: string) => void;
  onDone?: (d: V2Done) => void;
  onError?: (error: string) => void;
}

export interface V2SendBody {
  v: 2;
  message: string;
  conversation_id?: string;
  session_token?: string;
  lang: string;
  page: string;
  pick: V2Pick;
  for_dog: string | null;
  image_b64?: string;
  image_mime?: string;
  voice?: { path: string; sec: number };
}

/** Výsledok `streamV2`: `ok` = prúd dobehol, inak HTTP chyba (stav + telo) alebo výpadok siete. */
export type V2StreamResult =
  | { kind: 'ok' }
  | { kind: 'http'; status: number; body: { error?: string; reply?: string } | null }
  | { kind: 'network' }
  | { kind: 'aborted' };

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Rozloží `event:` + `data:` blok na jednu udalosť. */
function parseBlock(block: string): { event: string; data: unknown } | null {
  let event = 'message';
  const data: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
  }
  if (!data.length) return null;
  try { return { event, data: JSON.parse(data.join('\n')) }; } catch { return null; }
}

function dispatch(ev: { event: string; data: unknown }, h: V2Handlers) {
  const d = ev.data as Record<string, unknown>;
  if (ev.event === 'meta') h.onMeta?.(d as never);
  else if (ev.event === 'status') h.onStatus?.(d.s as V2Status, d.tier as V2Tier | undefined);
  else if (ev.event === 'delta') h.onDelta?.(String(d.t ?? ''));
  else if (ev.event === 'done') h.onDone?.(d as unknown as V2Done);
  else if (ev.event === 'error') h.onError?.(String(d.error ?? 'error'));
}

export async function streamV2(body: V2SendBody, h: V2Handlers, signal: AbortSignal): Promise<V2StreamResult> {
  if (DEV_NOAUTH) return mockStream(body, h, signal);
  try {
    const token = await accessToken();
    if (!token) return { kind: 'http', status: 401, body: { error: 'unauthorized' } };
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ainubis-chat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    const isStream = (res.headers.get('content-type') ?? '').includes('text/event-stream');
    if (!res.ok || !isStream || !res.body) {
      let parsed: { error?: string; reply?: string } | null = null;
      try { parsed = await res.json(); } catch { parsed = null; }
      return { kind: 'http', status: res.status, body: parsed };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let i: number;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const ev = parseBlock(buf.slice(0, i));
        buf = buf.slice(i + 2);
        if (ev) dispatch(ev, h);
      }
    }
    const tail = parseBlock(buf);
    if (tail) dispatch(tail, h);
    return { kind: 'ok' };
  } catch (e) {
    return (e as { name?: string })?.name === 'AbortError' ? { kind: 'aborted' } : { kind: 'network' };
  }
}

/** supabase-js na non-2xx vráti `FunctionsHttpError` s `.context` = Response — telo je inak nedostupné. */
async function errBody(error: unknown): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const ctx = (error as { context?: unknown } | null)?.context;
  if (ctx instanceof Response) {
    let body: Record<string, unknown> | null = null;
    try { body = await ctx.clone().json(); } catch { body = null; }
    return { status: ctx.status, body };
  }
  return { status: 0, body: null };
}

export async function v2Credits(): Promise<V2Credits | null> {
  if (DEV_NOAUTH) return mockCredits();
  try {
    const { data, error } = await supabase.functions.invoke('ainubis-chat', { body: { action: 'credits' } });
    if (error || !data || (data as { error?: string }).error) return null;
    return data as V2Credits;
  } catch { return null; }
}

export async function v2Consent(): Promise<boolean> {
  if (DEV_NOAUTH) { mockConsent = true; return true; }
  try {
    const { data, error } = await supabase.functions.invoke('ainubis-chat', { body: { action: 'consent', accept: true } });
    return !error && !!(data as { consent?: unknown } | null)?.consent;
  } catch { return false; }
}

export async function v2Rate(message_id: string, rating: 'up' | 'down' | null, report?: string): Promise<boolean> {
  if (DEV_NOAUTH) return true;
  try {
    const { error } = await supabase.functions.invoke('ainubis-chat', { body: { action: 'rate', message_id, rating, ...(report ? { report } : {}) } });
    return !error;
  } catch { return false; }
}

export type V2Poll = { id: string; created_at: string; role: string; content: string; meta?: { v2?: { tier?: V2Tier; credits?: number; scrolls?: V2Scroll[]; sos?: string[]; web?: V2Web[]; offer?: V2Tier | null }; voice?: { path?: string; sec?: number } } | null }[];

/** Otvorenie vlákna z histórie (ten istý `ainubis-poll` ako starý widget). */
export async function v2LoadThread(conversation_id: string, session_token: string): Promise<{ ok: boolean; status: number; messages: V2Poll }> {
  if (DEV_NOAUTH) return { ok: true, status: 200, messages: mockThread() };
  try {
    const { data, error } = await supabase.functions.invoke('ainubis-poll', { body: { conversation_id, session_token, seen: true } });
    if (error) { const { status } = await errBody(error); return { ok: false, status, messages: [] }; }
    return { ok: true, status: 200, messages: ((data as { messages?: V2Poll } | null)?.messages ?? []) };
  } catch { return { ok: false, status: 0, messages: [] }; }
}

export type V2HlasResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function hlas<T>(body: Record<string, unknown>): Promise<V2HlasResult<T>> {
  try {
    const { data, error } = await supabase.functions.invoke('ainubis-hlas', { body });
    if (error) {
      const { body: b } = await errBody(error);
      return { ok: false, error: String(b?.error ?? 'error') };
    }
    const e = (data as { error?: string } | null)?.error;
    return e ? { ok: false, error: e } : { ok: true, data: data as T };
  } catch { return { ok: false, error: 'network' }; }
}

/** Prepis nahrávky (ElevenLabs Scribe na serveri). `lang` = jazyk appky (SK↔CS zámena). */
export async function v2Stt(audio_b64: string, mime: string, lang: string, sec: number): Promise<V2HlasResult<{ path: string; text: string; sec: number }>> {
  if (DEV_NOAUTH) return { ok: true, data: { path: 'dev/mock.webm', text: 'Môj pes zjedol kúsok čokolády, čo mám robiť?', sec } };
  return hlas({ action: 'stt', audio_b64, mime, lang, sec });
}
/** Hlas AINUBISA k odpovedi (mp3). `no_voice` = v tomto jazyku hlas nemá. */
export async function v2Tts(message_id: string): Promise<V2HlasResult<{ url: string }>> {
  if (DEV_NOAUTH) return { ok: false, error: 'no_voice' };
  return hlas({ action: 'tts', message_id });
}
/** Podpísaná adresa vlastnej nahrávky (prehranie bubliny z histórie). */
export async function v2VoiceUrl(path: string): Promise<string | null> {
  if (DEV_NOAUTH) return null;
  const r = await hlas<{ url: string }>({ action: 'url', path });
  return r.ok ? r.data.url : null;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// ── MOCK (len `DEV_NOAUTH`, do produkčného buildu sa nedostane — `DEV_NOAUTH` je tam natvrdo false) ─────────────
let mockConsent = false;
let mockUsed = 3;
const MOCK_RANK: V2RankId = ((typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('rank')) as V2RankId) || 'akolyta';
const MOCK_RANKS: V2Credits['ranks'] = {
  veriaci: { top: 'rychly', effort: 'medium', credits: 20 },
  akolyta: { top: 'bystry', effort: 'medium', credits: 360 },
  knaz: { top: 'hlboky', effort: 'medium', credits: 720 },
  vezir: { top: 'hlboky', effort: 'high', credits: 1080 },
  farao: { top: 'hlboky', effort: 'max', credits: 10400 },
  zakladatel: { top: 'bystry', effort: 'medium', credits: 360 },
};

function mockCredits(): V2Credits {
  const r = MOCK_RANKS[V2_RANKS.includes(MOCK_RANK) ? MOCK_RANK : 'akolyta'];
  const rank = V2_RANKS.includes(MOCK_RANK) ? MOCK_RANK : 'akolyta';
  const d = new Date(); const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return {
    rank, top: r.top, effort: r.effort, allowance: r.credits, used: rank === 'akolyta' ? 132 + mockUsed : mockUsed, reserved: 0, messages: 4,
    resets_at: next.toISOString(), enabled: true,
    price: { rychly: 1, bystry: 12, hlboky: r.effort === 'max' ? 52 : r.effort === 'high' ? 36 : 24 },
    ranks: MOCK_RANKS, consent: mockConsent ? { version: 1 } : null,
  };
}

function mockThread(): V2Poll {
  return [
    { id: 'm1', created_at: new Date(Date.now() - 3600_000).toISOString(), role: 'user', content: 'Môj pes zjedol kúsok čokolády, čo mám robiť?' },
    { id: 'm2', created_at: new Date(Date.now() - 3500_000).toISOString(), role: 'assistant', content: MOCK_REPLY, meta: { v2: { tier: 'bystry', credits: 12, scrolls: MOCK_SCROLLS, sos: ['jed', 'pohotovost'] } } },
  ];
}

const MOCK_REPLY = 'Čokoláda je pre psa jed, škodí teobromín. Čím je horkejšia a čím menší pes, tým horšie.\n\nZisti, akú a koľko jej pes zjedol, a hneď zavolaj veterinárovi. Nečakaj na príznaky a vracanie nevyvolávaj sám bez jeho pokynu.';
const MOCK_SCROLLS: V2Scroll[] = [
  { id: 'prevention-O1-1', world: 'prevention', title: 'Kuchyňa', line: 'Prevencia · Jedy v domácnosti · 3 min' },
  { id: 'prevention-O1-2', world: 'prevention', title: 'Prvá hodina po otrave', line: 'Prevencia · Jedy v domácnosti · 4 min' },
];

const sleep = (ms: number, signal: AbortSignal) => new Promise<void>((res, rej) => {
  const t = window.setTimeout(res, ms);
  signal.addEventListener('abort', () => { window.clearTimeout(t); rej(Object.assign(new Error('abort'), { name: 'AbortError' })); }, { once: true });
});

async function mockStream(body: V2SendBody, h: V2Handlers, signal: AbortSignal): Promise<V2StreamResult> {
  try {
    const health = /čokol|otrav|zdrav|krv|vrac|chocol|poison/i.test(body.message);
    h.onMeta?.({ conversation_id: body.conversation_id ?? 'dev-conv', session_token: body.session_token ?? 'dev-token', user_message_id: 'dev-u', branch: null });
    h.onStatus?.('thinking');
    await sleep(500, signal);
    h.onStatus?.('scrolls');
    await sleep(700, signal);
    const reply = health ? MOCK_REPLY : 'Dobrá otázka. Vo zvitkoch sa k tomu dá nájsť pár krokov, začni pokojne a po malých dávkach.';
    for (const w of reply.split(/(?<= )/)) { h.onDelta?.(w); await sleep(35, signal); }
    const rank = mockCredits().rank;
    const tier: V2Tier = body.pick === 'auto' ? (health ? MOCK_RANKS[rank].top : 'rychly') : body.pick;
    const credits = { rychly: 1, bystry: 12, hlboky: 24 }[tier];
    mockUsed += credits;
    const c = mockCredits();
    h.onDone?.({
      message_id: '00000000-0000-4000-8000-0000000000d0', reply, tier, credits, scrolls: health ? MOCK_SCROLLS : [], sos: health ? ['jed', 'pohotovost'] : [],
      health, fallback: null, credits_state: { used: c.used, allowance: c.allowance, remaining: c.allowance - c.used, enabled: true, resets_at: c.resets_at },
    });
    return { kind: 'ok' };
  } catch { return { kind: 'aborted' }; }
}
