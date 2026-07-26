import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLang } from '@/i18n/LanguageContext';
import { getAinubisCopy } from './ainubisCopy';
import ainubisFace from '@/assets/ainubis-badge.png';
import './AinubisWidget.css';

// ── Konštanty ────────────────────────────────────────────────────────────
const LS_CONV = 'ainubis.conv';
const LS_TOK = 'ainubis.tok';
const LS_LAST_SEEN = 'ainubis.lastSeen';
const LS_OPEN = 'ainubis.open';
// Nie je v zozname kľúčov zo zadania, ale visitor_id musí niekde prežiť reload
// (posiela sa v každom requeste na ainubis-chat) — vlastný kľúč v tom istom
// „ainubis.*" mennom priestore.
const LS_VISITOR = 'ainubis.visitor';

const MAX_IMAGE_DIM = 1568; // px, dlhšia strana — zhoduje sa s limitom na backende
const JPEG_QUALITY = 0.82;
const TYPEWRITER_MS = 14; // ms/znak

// Render routy pre PDF/OG obrázky — widget by sa zapiekol do výstupu.
const HIDDEN_EXACT_PREFIXES = ['/cert-render', '/invoice-render', '/share-render'];

function isAinubisHidden(pathname: string): boolean {
  if (HIDDEN_EXACT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  // Celý heroglyph flow OKREM bare /heroglyph (sales page) — v platobnom
  // flow by widget rušil konverziu.
  if (pathname.startsWith('/heroglyph/')) return true;
  return false;
}

// ── Typy ─────────────────────────────────────────────────────────────────
type AinubisRole = 'user' | 'assistant' | 'matej' | 'system';

interface AinubisMeta {
  type?: 'bug' | 'idea' | 'question' | 'praise' | 'complaint' | 'spam';
  severity?: 'low' | 'medium' | 'high';
  devotion?: number;
  needs_matej?: boolean;
}

interface AinubisMessage {
  id: string;
  role: AinubisRole;
  content: string;
  created_at: string;
  meta?: AinubisMeta | null;
  imagePreviewUrl?: string;
}

interface AinubisChatResponse {
  conversation_id: string;
  session_token: string;
  reply: string;
  takeover: boolean;
  meta?: AinubisMeta | null;
}

interface AinubisWireMessage {
  id: string;
  created_at: string;
  role: AinubisRole;
  content: string;
  meta?: AinubisMeta | null;
}

interface AinubisPollResponse {
  messages: AinubisWireMessage[];
  takeover: boolean;
  status?: string;
}

interface AinubisErrorBody {
  error?: string;
  reply?: string;
}

interface PendingImage {
  base64: string;
  mime: string;
  previewUrl: string;
}

// ── Drobné pomocníky ─────────────────────────────────────────────────────

function safeLocalStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / plný storage — chat funguje ďalej, len bez perzistencie */
  }
}

function getOrCreateVisitorId(): string {
  const existing = safeLocalStorageGet(LS_VISITOR);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  safeLocalStorageSet(LS_VISITOR, id);
  return id;
}

/**
 * Bubliny, ktoré sme vykreslili lokálne (optimisticky, hneď po odoslaní), majú
 * vlastné klientske id — serverové sú UUID. Rozlíšenie potrebujeme na dvoch
 * miestach: pri deduplikácii výsledkov pollu a pri počítaní `after`.
 */
function isLocalId(id: string): boolean {
  return id.startsWith('welcome') || /^(user|assistant|system)-/.test(id);
}

/**
 * Kurzor pre poll. Počíta sa LEN zo serverových správ — lokálne bubliny nesú
 * čas z hodín prehliadača, ktoré vedia ísť napred oproti serveru, a taký `after`
 * by potom preskočil skutočné správy (napr. Matejovu odpoveď) a tie by neprišli
 * nikdy.
 */
function latestKnownAt(list: AinubisMessage[]): string | undefined {
  const fromServer = list.filter((m) => !isLocalId(m.id));
  if (fromServer.length === 0) return undefined;
  let max = fromServer[0].created_at;
  for (const m of fromServer) if (m.created_at > max) max = m.created_at;
  return max;
}

/** Downscale na max. dlhšiu stranu 1568px + JPEG q=0.82 → base64 bez `data:` prefixu. */
function resizeImageForAinubis(file: File): Promise<PendingImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error('ainubis: canvas 2d context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      const base64 = dataUrl.split(',')[1] ?? '';
      if (!base64) {
        reject(new Error('ainubis: image encode failed'));
        return;
      }
      resolve({ base64, mime: 'image/jpeg', previewUrl: dataUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ainubis: image load failed'));
    };
    img.src = objectUrl;
  });
}

/** supabase-js vracia na non-2xx `FunctionsHttpError` s `.context` = Response.
 *  Telo (napr. 429 `{error:"rate_limited", reply}`) je inak nedostupné. */
async function readFunctionsErrorStatus(
  error: unknown
): Promise<{ status: number; body: AinubisErrorBody | null }> {
  if (error && typeof error === 'object' && 'context' in error) {
    const ctx = (error as { context?: unknown }).context;
    if (ctx instanceof Response) {
      let body: AinubisErrorBody | null = null;
      try {
        body = (await ctx.clone().json()) as AinubisErrorBody;
      } catch {
        body = null;
      }
      return { status: ctx.status, body };
    }
  }
  return { status: 0, body: null };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/** Pasívne — NIKDY nenavigovať/presmerovať (na rozdiel od usePackIdentity, ktorý
 *  je stavaný pre gated /pack stránky). Widget beží aj na verejných routách,
 *  takže smie len TICHO zistiť, či je niekto prihlásený. */
function useOptionalMemberEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return email;
}

// AVATAR — finálny badge (KIE render `b6-trojstvrt`, zlatá verzia), orezaný na
// obsah a zmenšený na 160 px (`assets/ainubis-badge.png`). Nahradil dočasné SVG
// oko. Blink trieda na wrapperi tlačidla zostáva, len sa na rastri neprejaví.
function AinubisEyePlaceholder() {
  return <img src={ainubisFace} className="ainubis-eye" alt="" aria-hidden="true" />;
}

// ── Vnútorná implementácia (mountuje sa len na povolených routách) ───────
function AinubisWidgetInner() {
  const { lang } = useLang();
  const { pathname } = useLocation();
  const copy = getAinubisCopy(lang);
  const reducedMotion = useReducedMotion();
  const memberEmail = useOptionalMemberEmail();
  // pack_number zámerne NEposielame: jediná typovaná tabuľka je `pack_members`
  // (email+pack_number), ale nie je isté, že je to živý zdroj pravdy pre
  // aktuálne prihláseného člena (ten beží cez `dogs`, netypované v generated
  // types.ts → vyžadovalo by `any` cast). Radšej pole vynechať než poslať
  // Matejovi do /admin nesprávne číslo psa. Flag pre Mateja v reporte.
  const visitorId = useState(() => getOrCreateVisitorId())[0];

  const [open, setOpen] = useState(() => safeLocalStorageGet(LS_OPEN) === '1');
  const [conversationId, setConversationId] = useState<string | null>(() => safeLocalStorageGet(LS_CONV));
  const [sessionToken, setSessionToken] = useState<string | null>(() => safeLocalStorageGet(LS_TOK));
  const [messages, setMessages] = useState<AinubisMessage[]>(() => [
    // Uvítanie je zámerne rozdelené na viac bublín (04-copy-a-vizual.md §1) —
    // jedna päťveta na úvod odradí skôr, než sa človek dostane k otázke.
    ...copy.welcome.map((text, i) => ({
      id: `welcome-${i}`,
      role: 'assistant' as const,
      content: text,
      created_at: new Date().toISOString(),
    })),
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [takeoverActive, setTakeoverActive] = useState(false);
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [sending, setSending] = useState(false);
  const [waitingReply, setWaitingReply] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [typewriter, setTypewriter] = useState<{ id: string; shown: number } | null>(null);

  const openRef = useRef(open);
  const messagesRef = useRef(messages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Scroll na koniec pri novej správe / postupe typewritera.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, typewriter?.shown]);

  // ── Idle „žmurknutie" — náhodne každých 6–12 s, vypnuté pri reduced-motion.
  useEffect(() => {
    if (reducedMotion) return;
    let blinkTimer: number;
    let resetTimer: number;
    function scheduleBlink() {
      const delay = 6000 + Math.random() * 6000;
      blinkTimer = window.setTimeout(() => {
        setBlinking(true);
        resetTimer = window.setTimeout(() => setBlinking(false), 160);
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();
    return () => {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(resetTimer);
    };
  }, [reducedMotion]);

  // ── Typewriter — 14 ms/znak, klik kdekoľvek do panelu preskočí (skipTypewriter).
  useEffect(() => {
    if (!typewriter) return;
    const msg = messagesRef.current.find((m) => m.id === typewriter.id);
    if (!msg || typewriter.shown >= msg.content.length) {
      setTypewriter(null);
      return;
    }
    const t = window.setTimeout(() => {
      setTypewriter((tw) => (tw ? { ...tw, shown: tw.shown + 1 } : tw));
    }, TYPEWRITER_MS);
    return () => window.clearTimeout(t);
  }, [typewriter]);

  function startTypewriter(id: string, content: string) {
    if (reducedMotion || content.length === 0) {
      setTypewriter(null);
      return;
    }
    setTypewriter({ id, shown: 0 });
  }

  function skipTypewriter() {
    if (!typewriter) return;
    const msg = messagesRef.current.find((m) => m.id === typewriter.id);
    setTypewriter(msg ? { id: msg.id, shown: msg.content.length } : null);
  }

  function pushSystemMessage(content: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `system-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role: 'system',
        content,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function resetSession() {
    setConversationId(null);
    setSessionToken(null);
    try {
      window.localStorage.removeItem(LS_CONV);
      window.localStorage.removeItem(LS_TOK);
    } catch {
      /* best effort */
    }
  }

  function applyPollResult(res: AinubisPollResponse) {
    setTakeoverActive(res.takeover);
    if (!res.messages || res.messages.length === 0) return;
    let additions: AinubisWireMessage[] = [];
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id));
      additions = res.messages.filter((m) => {
        if (known.has(m.id)) return false;
        // Server nám vracia aj kópiu bubliny, ktorú už lokálne zobrazujeme
        // (optimistické vykreslenie po odoslaní) — bez tohto sa každá správa
        // v paneli objaví dvakrát. Necháme lokálnu verziu, nie serverovú:
        // má rozbehnutý typewriter a náhľad obrázka, ktoré by výmenou zmizli.
        // Porovnávame len proti lokálnym bublinám, aby sa neprehltla skutočná
        // druhá správa od Mateja s rovnakým textom.
        return !prev.some((p) => isLocalId(p.id) && p.role === m.role && p.content === m.content);
      });
      if (additions.length === 0) return prev;
      return [...prev, ...additions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    const fromGuardian = additions.filter((m) => m.role === 'assistant' || m.role === 'matej');
    if (fromGuardian.length === 0) return;
    if (openRef.current) {
      const last = fromGuardian[fromGuardian.length - 1];
      startTypewriter(last.id, last.content);
    } else {
      setUnreadCount((c) => c + fromGuardian.length);
    }
  }

  // ── Poll ainubis-poll: 3s otvorené / 20s zavreté, zastavené keď je tab skrytý.
  useEffect(() => {
    if (!conversationId || !sessionToken) return;
    let cancelled = false;
    let timer: number | undefined;
    let initialFetchDone = false;

    async function poll() {
      try {
        const after = initialFetchDone ? latestKnownAt(messagesRef.current) : undefined;
        const { data, error } = await supabase.functions.invoke('ainubis-poll', {
          body: { conversation_id: conversationId, session_token: sessionToken, after },
        });
        initialFetchDone = true;
        if (cancelled) return;
        if (error) {
          const { status } = await readFunctionsErrorStatus(error);
          if (status === 403) resetSession();
        } else if (data) {
          applyPollResult(data as AinubisPollResponse);
        }
      } catch {
        /* sieťový výpadok — skús pri ďalšom tiku, netreba desivú hlášku */
      }
    }

    function scheduleNext() {
      if (cancelled) return;
      if (document.hidden) {
        timer = undefined; // poll sa zastavuje, kým je záložka skrytá
        return;
      }
      timer = window.setTimeout(runOnce, openRef.current ? 3000 : 20000);
    }

    async function runOnce() {
      timer = undefined;
      await poll();
      scheduleNext();
    }

    function onVisibility() {
      if (!document.hidden && timer === undefined && !cancelled) runOnce();
    }

    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) runOnce();

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (timer !== undefined) window.clearTimeout(timer);
    };
    // `open` saníma cez openRef (interval len prepína frekvenciu, netreba
    // reštartovať celý poll cyklus — malá cena je jeden extra full-fetch pri
    // prepnutí, zneškodnený dedup podľa id v applyPollResult).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, sessionToken]);

  async function sendToBackend(text: string, image: PendingImage | null, isRetry: boolean): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('ainubis-chat', {
        body: {
          conversation_id: isRetry ? undefined : conversationId ?? undefined,
          session_token: isRetry ? undefined : sessionToken ?? undefined,
          message: text,
          image_b64: image?.base64,
          image_mime: image?.mime,
          page: pathname,
          lang,
          visitor_id: visitorId,
          member_email: memberEmail ?? undefined,
        },
      });

      if (error) {
        const { status, body } = await readFunctionsErrorStatus(error);
        if (status === 403 && !isRetry) {
          // Neplatný token — zahoď a skús znova ako nová konverzácia (ticho, bez pádu).
          resetSession();
          await sendToBackend(text, image, true);
          return;
        }
        if (status === 429) {
          pushSystemMessage(body?.reply || copy.errors.rateLimited);
          return;
        }
        pushSystemMessage(copy.errors.generic);
        return;
      }

      const res = data as AinubisChatResponse;
      setConversationId(res.conversation_id);
      setSessionToken(res.session_token);
      safeLocalStorageSet(LS_CONV, res.conversation_id);
      safeLocalStorageSet(LS_TOK, res.session_token);
      setTakeoverActive(res.takeover);

      const replyId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'assistant', content: res.reply, created_at: new Date().toISOString(), meta: res.meta ?? null },
      ]);
      startTypewriter(replyId, res.reply);
      if (!openRef.current) setUnreadCount((c) => c + 1);
    } catch {
      pushSystemMessage(copy.errors.offline);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if ((!text && !pendingImage) || sending) return;
    setSending(true);
    const imageToSend = pendingImage;
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
        imagePreviewUrl: imageToSend?.previewUrl,
      },
    ]);
    setInput('');
    setPendingImage(null);
    setWaitingReply(true);
    await sendToBackend(text, imageToSend, false);
    setWaitingReply(false);
    setSending(false);
  }

  async function processImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    try {
      const resized = await resizeImageForAinubis(file);
      setPendingImage(resized);
    } catch {
      pushSystemMessage(copy.errors.imageTooBig);
    }
  }

  function handleToggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        safeLocalStorageSet(LS_LAST_SEEN, new Date().toISOString());
        window.setTimeout(() => textareaRef.current?.focus(), 50);
      }
      safeLocalStorageSet(LS_OPEN, next ? '1' : '0');
      return next;
    });
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData.items).find((it) => it.type.startsWith('image/'));
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    void processImageFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processImageFile(file);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processImageFile(file);
    e.target.value = '';
  }

  function handleSuggestionClick(text: string) {
    setInput(text);
    textareaRef.current?.focus();
  }

  const showSuggestions = messages.every((m) => m.id.startsWith('welcome'));

  return (
    <>
      <button
        type="button"
        className={`ainubis-launcher${unreadCount > 0 ? ' ainubis-launcher--unread' : ''}${
          blinking ? ' ainubis-launcher--blink' : ''
        }`}
        onClick={handleToggleOpen}
        aria-label={open ? copy.closeAria : copy.openAria}
        aria-expanded={open}
      >
        <AinubisEyePlaceholder />
        {!open && unreadCount > 0 && (
          <span className="ainubis-badge" aria-label={copy.unreadBadgeLabel(unreadCount)}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="ainubis-panel"
          role="dialog"
          aria-label={copy.panelTitle}
          onClick={skipTypewriter}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="ainubis-panel__header">
            <img className="ainubis-panel__avatar" src={ainubisFace} alt="" aria-hidden="true" />
            <div className="ainubis-panel__ident">
              <p className="ainubis-panel__title">{copy.panelTitle}</p>
              <p className="ainubis-panel__subtitle">
                {takeoverActive ? copy.takeoverActive : copy.panelSubtitle}
              </p>
            </div>
            <span className={`ainubis-panel__status${takeoverActive ? ' ainubis-panel__status--takeover' : ''}`}>
              <i />
              {takeoverActive ? copy.statusTakeover : copy.statusOnline}
            </span>
            <button
              type="button"
              className="ainubis-panel__close"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOpen();
              }}
              aria-label={copy.closeAria}
            >
              <X size={18} />
            </button>
          </div>

          <div className="ainubis-panel__body" ref={bodyRef}>
            {/* Intro karta — len kým je konverzácia prázdna (rovnaká podmienka
                ako návrhy pod ňou). Akonáhle človek napíše, odscrolluje sa
                s históriou preč a už sa nevracia. */}
            {showSuggestions && (
              <div className="ainubis-intro">
                <img className="ainubis-intro__badge" src={ainubisFace} alt="" aria-hidden="true" />
                <p className="ainubis-intro__name">{copy.panelTitle}</p>
                <p className="ainubis-intro__role">{copy.introRole}</p>
                <p className="ainubis-intro__tagline">{copy.introTagline}</p>
                <div className="ainubis-intro__rule" />
              </div>
            )}
            {messages.map((m) => {
              if (m.role === 'system') {
                return (
                  <div key={m.id} className="ainubis-msg ainubis-msg--system">
                    {m.content}
                  </div>
                );
              }
              const isUser = m.role === 'user';
              const isTypingThis = typewriter?.id === m.id;
              const shownContent = isTypingThis ? m.content.slice(0, typewriter.shown) : m.content;
              return (
                <div key={m.id} className={`ainubis-msg ${isUser ? 'ainubis-msg--user' : 'ainubis-msg--assistant'}`}>
                  {m.imagePreviewUrl && (
                    <img className="ainubis-msg__image" src={m.imagePreviewUrl} alt={copy.imagePreviewAlt} />
                  )}
                  {shownContent}
                  {/* Pozor na `&&` s číslom: pri devotion === 0 vracia `0`, a React
                      nulu vykreslí — na konci odpovede potom visela holá „0".
                      Preto explicitné porovnanie, nie truthy test. */}
                  {!isUser && (m.meta?.devotion ?? 0) > 0 && (
                    <div className="ainubis-msg__devotion">{copy.devotionGranted(m.meta.devotion)}</div>
                  )}
                </div>
              );
            })}
            {waitingReply && <div className="ainubis-typing">{copy.typing}</div>}
          </div>

          {showSuggestions && (
            <div className="ainubis-suggestions">
              <button type="button" className="ainubis-suggestion" onClick={() => handleSuggestionClick(copy.suggestions.problem)}>
                {copy.suggestions.problem}
              </button>
              <button type="button" className="ainubis-suggestion" onClick={() => handleSuggestionClick(copy.suggestions.idea)}>
                {copy.suggestions.idea}
              </button>
              <button type="button" className="ainubis-suggestion" onClick={() => handleSuggestionClick(copy.suggestions.question)}>
                {copy.suggestions.question}
              </button>
            </div>
          )}

          <div className={`ainubis-composer${dragOver ? ' ainubis-composer--dragover' : ''}`}>
            {pendingImage && (
              <div className="ainubis-composer__preview">
                <img src={pendingImage.previewUrl} alt={copy.imagePreviewAlt} />
                <button
                  type="button"
                  className="ainubis-composer__preview-remove"
                  onClick={() => setPendingImage(null)}
                  aria-label={copy.removeImage}
                >
                  <X size={11} />
                </button>
              </div>
            )}
            <div className="ainubis-composer__row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                className="ainubis-composer__icon-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label={copy.attachImage}
              >
                <Paperclip size={16} />
              </button>
              <textarea
                ref={textareaRef}
                className="ainubis-composer__textarea"
                placeholder={copy.inputPlaceholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                onPaste={handlePaste}
                rows={1}
              />
              <button
                type="button"
                className="ainubis-composer__icon-btn ainubis-composer__send"
                onClick={() => void handleSend()}
                disabled={sending || (!input.trim() && !pendingImage)}
                aria-label={copy.send}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * AINUBIS chatový widget — mount vedľa <ConsentBanner /> v App.tsx.
 * Skryté na render routách (/cert-render, /invoice-render, /share-render) a
 * v celom heroglyph flow okrem bare /heroglyph (viď isAinubisHidden vyššie).
 *
 * Split na outer/inner: outer volá len useLocation() a pri skrytej route
 * vráti null PRED mountom vnútornej komponenty — poll timery, blink
 * interval aj idle pulz sa tak na skrytých routách vôbec nespustia (nie je
 * to len vizuálne schované cez CSS).
 */
export function AinubisWidget() {
  const { pathname } = useLocation();
  if (isAinubisHidden(pathname)) return null;
  return <AinubisWidgetInner />;
}
