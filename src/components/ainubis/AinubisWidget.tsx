import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, Paperclip, Mic, Square, Move, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLang } from '@/i18n/LanguageContext';
import { getAinubisCopy } from './ainubisCopy';
import { AINUBIS_OPEN_EVENT } from '@/lib/ainubisBus';
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
/** Ručne posunutý panel (Matej 2026-08-09: „ikonku kríž so šípkami ktorý po kliknutí
 *  bude vedieť premiestniť chatovacie okno rozne po obrazovke"). Pozícia prežije reload —
 *  keby sa po každom otvorení vrátila do rohu, presúvanie by nemalo zmysel. */
const LS_POS = 'ainubis.pos';

const MAX_IMAGE_DIM = 1568; // px, dlhšia strana — zhoduje sa s limitom na backende
const JPEG_QUALITY = 0.82;
const TYPEWRITER_MS = 14; // ms/znak

/** Uvítanie naživo — kým vyskočí prvá bublina, AINUBIS chvíľu „píše". */
const WELCOME_FIRST_PAUSE_MS = 1100;
/** Pauza pred každou ďalšou bublinou (počíta sa od dopísania predošlej). */
const WELCOME_PAUSE_MS = 700;
/** Ako dlho po odoslaní bubliny sa znovu rozsvieti „…píše". */
const WELCOME_GAP_MS = 260;

// Render routy pre PDF/OG obrázky — widget by sa zapiekol do výstupu.
const HIDDEN_EXACT_PREFIXES = ['/cert-render', '/invoice-render', '/share-render'];

// Matej 2026-07-29: verejný web zatiaľ NEpúšťame (anonymné konverzácie bez
// e-mailu nechceme na public route) — AINUBIS beží len v /pack, kým sa
// nedorieši email-gate pre anonymov. Otoč na false, keď sa public launch schváli.
const PUBLIC_LAUNCH_PAUSED = true;

function isAinubisHidden(pathname: string): boolean {
  if (HIDDEN_EXACT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  // Celý heroglyph flow OKREM bare /heroglyph (sales page) — v platobnom
  // flow by widget rušil konverziu.
  if (pathname.startsWith('/heroglyph/')) return true;
  if (PUBLIC_LAUNCH_PAUSED && !pathname.startsWith('/pack')) return true;
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

// ── Hlasovka ─────────────────────────────────────────────────────────────
// Diktovanie beží na Web Speech API prehliadača (Chrome/Edge/Safari), rovnako
// ako hlasovka v DIGOBRAZ prototype. Backend `ainubis-chat` prijíma text +
// obrázok, zvuk nie — preto sa NENAHRÁVA audio súbor, ale rovno prepis, ktorý
// padne do poľa a človek ho pred odoslaním vidí a môže opraviť.
// TS DOM lib tieto typy nemá (je to stále draft), preto minimálne vlastné.
interface SpeechRecognitionAlt {
  transcript: string;
}
interface SpeechRecognitionRes {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlt;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionRes };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
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

// ── Presúvanie panelu ────────────────────────────────────────────────────
/** ⚠️ JEDNA hranica v CSS aj v JS. Pod 768 px je panel fullscreen sheet
 *  (`@media (max-width: 767px)` v AinubisWidget.css) — presúvať celoobrazovkový
 *  sheet nemá čo, takže tam sa tlačidlo nevykreslí a uložená pozícia sa IGNORUJE.
 *  Keby tu bolo iné číslo než v CSS, vznikne pásmo šírok, kde sa inline `left/top`
 *  bije s pravidlami sheetu. */
const MOVE_MIN_WIDTH = 768;
/** Koľko px panelu musí ostať v obraze — chráni pred „zahodením" okna za okraj. */
const PANEL_EDGE_GAP = 8;

type PanelPos = { x: number; y: number };

function readStoredPanelPos(): PanelPos | null {
  const raw = safeLocalStorageGet(LS_POS);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PanelPos>;
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    /* poškodený zápis = žiadna pozícia, panel sa vráti do rohu */
  }
  return null;
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
  // Uvítanie sa NEVKLADÁ do počiatočného stavu (Matej 2026-07-30: „teraz je to
  // ako keby tam už predpísané a to nechceme, chceme aby to vyzeralo ONLINE
  // LIVE"). Bubliny sa prehrajú až po otvorení panela — najprv „…píše", potom
  // text po znakoch, ako keby AINUBIS naozaj sedel na druhej strane.
  // Rozdelenie na viac bublín je zámer (04-copy-a-vizual.md §1).
  const [messages, setMessages] = useState<AinubisMessage[]>([]);
  /** Beží uvítacia sekvencia — drží indikátor „…píše" medzi bublinami. */
  const [welcomeTyping, setWelcomeTyping] = useState(false);
  /** Aby sa uvítanie neprehralo druhýkrát pri zavretí a znovuotvorení panela. */
  const welcomePlayedRef = useRef(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [takeoverActive, setTakeoverActive] = useState(false);
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [sending, setSending] = useState(false);
  const [waitingReply, setWaitingReply] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [typewriter, setTypewriter] = useState<{ id: string; shown: number } | null>(null);

  /** Hlavička ukazuje avatar + meno až KEĎ intro karta odrolovala hore. Matej
   *  2026-07-26: „je zbytočné mať naraz dve fotky v chate — nechaj len tú veľkú
   *  a keď sa konverzácia posunie dolu, až vtedy sa sticky". Kým je intro na
   *  obrazovke, identita v hlavičke je priehľadná (ostáva v layoute, aby stav
   *  ONLINE a krížik neposkakovali). */
  const [headerIdentity, setHeaderIdentity] = useState(false);

  /** Režim presúvania: klik na kríž so šípkami ho zapne, hlavička sa stane úchytom,
   *  druhý klik pozíciu zamkne. Dvojstavovo zámerne — keby bola hlavička úchytom
   *  vždy, každé nechcené potiahnutie pri klikaní na krížik by okno odsunulo. */
  /** Bublina „Dashboard — čoskoro". Na myši ju drží hover, na dotyku klik na 2,2 s —
   *  mobil hover nemá, takže bez kliku by ikonka mlčala. */
  const [dashHint, setDashHint] = useState(false);
  const dashHintTimer = useRef<number | null>(null);

  const [movable, setMovable] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(readStoredPanelPos);
  const [canMove, setCanMove] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= MOVE_MIN_WIDTH,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  /** Odstup kurzora od ľavého horného rohu panelu — bez neho by okno pri chytení
   *  skočilo rohom pod kurzor. */
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null);

  // Hlasovka: tlačidlo sa vôbec nevykreslí tam, kde prehliadač diktovanie nevie
  // (Firefox) — mŕtve tlačidlo je horšie ako žiadne.
  const speechCtor = useState(() => getSpeechRecognitionCtor())[0];
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  /** Text, ktorý bol v poli pred spustením diktovania — prepis sa lepí ZA neho,
   *  aby diktovanie nezmazalo rozpísanú správu. */
  const dictationBaseRef = useRef('');

  const openRef = useRef(open);
  const messagesRef = useRef(messages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const introNameRef = useRef<HTMLParagraphElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // ── Presúvanie panelu ─────────────────────────────────────────────────
  // Hranica je tá istá ako v CSS; pri zúžení okna pod ňu sa režim vypne, inak by
  // ostal zapnutý neviditeľný stav (hlavička ako úchyt bez tlačidla, ktoré ho vráti).
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOVE_MIN_WIDTH}px)`);
    const sync = () => {
      setCanMove(mq.matches);
      if (!mq.matches) setMovable(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /** Drží panel v obraze. Rozmer čítame z DOM (panel má šírku aj výšku z `min()`,
   *  takže ho nemožno predpočítať) — fallbacky sedia s CSS pre prípad, že ešte
   *  nie je vykreslený. */
  const clampPanelPos = (x: number, y: number): PanelPos => {
    const el = panelRef.current;
    const w = el?.offsetWidth ?? 380;
    const h = el?.offsetHeight ?? 560;
    const maxX = Math.max(PANEL_EDGE_GAP, window.innerWidth - w - PANEL_EDGE_GAP);
    const maxY = Math.max(PANEL_EDGE_GAP, window.innerHeight - h - PANEL_EDGE_GAP);
    return {
      x: Math.min(Math.max(x, PANEL_EDGE_GAP), maxX),
      y: Math.min(Math.max(y, PANEL_EDGE_GAP), maxY),
    };
  };

  useEffect(() => {
    if (panelPos) safeLocalStorageSet(LS_POS, JSON.stringify(panelPos));
  }, [panelPos]);

  // Zmenšené okno nesmie nechať panel vonku — po resize ho vtiahneme späť.
  useEffect(() => {
    const onResize = () => setPanelPos((p) => (p ? clampPanelPos(p.x, p.y) : p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!movable || !canMove) return;
    // Tlačidlá v hlavičke (krížik, presun, dashboard) ostávajú klikateľné aj
    // v režime presúvania — bez tejto výnimky by sa panel nedal zavrieť.
    if ((e.target as HTMLElement).closest('button')) return;
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragOffsetRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    // Prechod z CSS kotvy (right/bottom) na súradnice ešte PRED prvým pohybom —
    // inak by prvý `move` prepol pozicovanie a panel by viditeľne poskočil.
    setPanelPos(clampPanelPos(r.left, r.top));
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const off = dragOffsetRef.current;
    if (!off) return;
    setPanelPos(clampPanelPos(e.clientX - off.dx, e.clientY - off.dy));
  };

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffsetRef.current) return;
    dragOffsetRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const pokeDashHint = () => {
    setDashHint(true);
    if (dashHintTimer.current) window.clearTimeout(dashHintTimer.current);
    dashHintTimer.current = window.setTimeout(() => setDashHint(false), 2200);
  };

  useEffect(() => () => {
    if (dashHintTimer.current) window.clearTimeout(dashHintTimer.current);
  }, []);

  const resetPanelPos = () => {
    setPanelPos(null);
    setMovable(false);
    try {
      window.localStorage.removeItem(LS_POS);
    } catch {
      /* privátny režim — pozícia sa aj tak resetuje v stave */
    }
  };

  // Otvorenie zvonku (dlaždica AINUBIS na `/pack` homepage, neskôr wizard) — viď
  // `lib/ainubisBus.ts`. Zámerne len OTVÁRA, netoggluje: keď je panel už otvorený,
  // druhý klik na dlaždicu ho nesmie zavrieť (človek klikol „chcem poradiť", nie
  // „zavri to"). Nezávislé od `handleToggleOpen`, ktoré patrí launcheru.
  useEffect(() => {
    const onOpen = () => {
      if (openRef.current) return;
      setOpen(true);
      setUnreadCount(0);
      safeLocalStorageSet(LS_OPEN, '1');
      safeLocalStorageSet(LS_LAST_SEEN, new Date().toISOString());
      window.setTimeout(() => textareaRef.current?.focus(), 50);
    };
    window.addEventListener(AINUBIS_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(AINUBIS_OPEN_EVENT, onOpen);
  }, []);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Scroll na koniec pri novej správe / postupe typewritera. Pri čerstvej
  // konverzácii ostávame HORE — intro karta je to prvé, čo má človek vidieť,
  // skok na koniec by ju odscrolloval hneď po otvorení.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    if (messages.every((m) => m.id.startsWith('welcome'))) {
      body.scrollTo({ top: 0 });
      return;
    }
    body.scrollTo({ top: body.scrollHeight });
  }, [messages, typewriter?.shown]);

  // Pole rastie s textom (po strop z CSS `max-height`). Bez toho sa nadiktovaná
  // veta schová do jedného riadku a človek nevidí, čo vlastne pošle.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [input, open]);

  // Zavretý panel (alebo odchod zo stránky) nesmie nechať mikrofón bežať.
  useEffect(() => {
    if (!open) stopDictation();
  }, [open]);
  useEffect(
    () => () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* nič nebeží */
      }
    },
    []
  );

  // Sticky identita v hlavičke: zapne sa, až keď veľký badge z intra odrolo-
  // val nad horný okraj tela. Bez intra (rozbehnutá konverzácia) je vždy zapnutá.
  useEffect(() => {
    const body = bodyRef.current;
    if (!open || !body) return;
    const update = () => {
      const mark = introNameRef.current;
      if (!mark) {
        setHeaderIdentity(true);
        return;
      }
      // Rozhoduje spodok MENA v intre, nie badge: keby prepínal badge, meno by
      // ešte chvíľu viselo v tele a v hlavičke by už bolo druhé — presne to
      // zdvojenie, ktoré máme odstrániť. Takto sa hlavička zapne až vtedy, keď
      // z intra nevidno ani fotku, ani meno.
      setHeaderIdentity(mark.getBoundingClientRect().bottom < body.getBoundingClientRect().top + 4);
    };
    update();
    body.addEventListener('scroll', update, { passive: true });
    return () => body.removeEventListener('scroll', update);
  }, [open, messages]);

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

  // ── Uvítanie naživo ─────────────────────────────────────────────────────
  // Otvorenie panela = AINUBIS si všimol, že si prišiel: chvíľu „píše", potom
  // pošle prvú bublinu, znova píše, pošle druhú. Časovanie je odhad ľudského
  // tempa, nie presnosť — dôležité je, že text NIE JE na obrazovke skôr, než ho
  // „napíše". Pri `prefers-reduced-motion` sa obe bubliny vložia naraz.
  useEffect(() => {
    // Uvítanie sa prehrá aj vracajúcemu sa človeku — rovnako ako predtým, keď
    // bolo v počiatočnom stave. Preskočiť ho podľa uloženého `conversationId`
    // sa neosvedčilo: keď sa história nedotiahne (stará alebo zmazaná
    // konverzácia), panel ostane úplne prázdny.
    if (!open || welcomePlayedRef.current) return;
    welcomePlayedRef.current = true;

    const pushWelcome = (i: number) => {
      const id = `welcome-${i}`;
      setMessages((prev) =>
        prev.some((m) => m.id === id)
          ? prev
          : [
              ...prev,
              {
                id,
                role: 'assistant' as const,
                content: copy.welcome[i],
                created_at: new Date().toISOString(),
              },
            ]
      );
      startTypewriter(id, copy.welcome[i]);
    };

    if (reducedMotion) {
      copy.welcome.forEach((_, i) => pushWelcome(i));
      return;
    }

    const timers: number[] = [];
    let at = 0;
    setWelcomeTyping(true);
    copy.welcome.forEach((text, i) => {
      at += i === 0 ? WELCOME_FIRST_PAUSE_MS : WELCOME_PAUSE_MS;
      timers.push(
        window.setTimeout(() => {
          setWelcomeTyping(false);
          pushWelcome(i);
          if (i < copy.welcome.length - 1) {
            timers.push(
              window.setTimeout(() => setWelcomeTyping(true), WELCOME_GAP_MS)
            );
          }
        }, at)
      );
      // Ďalšia bublina čaká, kým sa tá predošlá dopíše (14 ms/znak).
      at += text.length * TYPEWRITER_MS;
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      setWelcomeTyping(false);
    };
  }, [open, copy.welcome, reducedMotion]);

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

  // ── Hlasovka ───────────────────────────────────────────────────────────
  function stopDictation() {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    setListening(false);
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* už skončilo samo */
      }
    }
  }

  function startDictation() {
    if (!speechCtor || recognitionRef.current) return;
    const rec = new speechCtor();
    // Rozpoznávanie musí vedieť jazyk dopredu — berieme ten, v ktorom je web.
    rec.lang = lang === 'sk' ? 'sk-SK' : 'en-US';
    rec.continuous = true;
    // Priebežné výsledky: text pribúda v poli počas hovoru, nie až na konci —
    // inak človek 20 sekúnd pozerá na prázdne pole a nevie, či ho počuť.
    rec.interimResults = true;
    dictationBaseRef.current = input.trim();
    let finalText = '';

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        const chunk = res[0]?.transcript ?? '';
        if (res.isFinal) finalText += (finalText ? ' ' : '') + chunk.trim();
        else interim += chunk;
      }
      const parts = [dictationBaseRef.current, finalText, interim.trim()].filter(Boolean);
      setInput(parts.join(' '));
    };
    rec.onerror = (e) => {
      // `no-speech` je bežné ticho, nie chyba hodná hlášky.
      if (e.error && e.error !== 'no-speech' && e.error !== 'aborted') setMicError(true);
      stopDictation();
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      textareaRef.current?.focus();
    };

    try {
      rec.start();
    } catch {
      setMicError(true);
      return;
    }
    setMicError(false);
    recognitionRef.current = rec;
    setListening(true);
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

  /** Konverzácia je stále čerstvá — človek ešte nenapísal. Intro karta (badge +
   *  meno + rola) drží miesto od prvej sekundy, aj kým uvítanie ešte nabieha:
   *  keby sa dorenderovala až po ňom, bubliny by pod ňou poskočili. */
  const showIntro = messages.every((m) => m.id.startsWith('welcome'));
  /** Návrhy sa ukážu až keď uvítanie dobehlo (vrátane typewritera) — vyskočiť
   *  skôr, než AINUBIS dopíše, vyzerá ako predpripravený formulár. */
  const showSuggestions =
    showIntro &&
    messages.length === copy.welcome.length &&
    !welcomeTyping &&
    !typewriter;

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
          ref={panelRef}
          className={`ainubis-panel${movable ? ' ainubis-panel--movable' : ''}`}
          /* ⚠️ Inline `left/top` MUSÍ vypnúť aj `right/bottom` — základné pravidlo
             kotví panel vpravo dole a `body.has-pack-nav` mu prepisuje `left`.
             Pod hranicou `MOVE_MIN_WIDTH` sa pozícia ignoruje: tam vládne
             fullscreen sheet z CSS. */
          style={
            canMove && panelPos
              ? { left: panelPos.x, top: panelPos.y, right: 'auto', bottom: 'auto' }
              : undefined
          }
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
          <div
            className={`ainubis-panel__header${headerIdentity ? ' ainubis-panel__header--identity' : ''}`}
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            onPointerCancel={handleHeaderPointerUp}
          >
            {/* Dashboard = SĽUB, nie funkcia (Matej 2026-08-09: „to dashboard zvačši a daj
                na lavu stranu headru v chate bez toho dashboard — pri prechode myšou na to
                alebo klikom na mobile = dashboard comming soon"). Stojí PRED portrétom, takže
                sa číta ako nástroj okna, nie ako súčasť identity AINUBISA.
                ⚠️ NIE `disabled` — zakázané tlačidlo v prehliadači nevydá `click` ani
                `mouseenter`, takže by sa bublina nikdy neukázala. Nedostupnosť nesie
                `aria-disabled` + to, že `onClick` nikam nevedie. */}
            <button
              type="button"
              className={`ainubis-panel__dash${dashHint ? ' ainubis-panel__dash--hint' : ''}`}
              aria-disabled="true"
              aria-label={copy.dashboardHint}
              onMouseEnter={() => setDashHint(true)}
              onMouseLeave={() => setDashHint(false)}
              onClick={(e) => {
                e.stopPropagation();
                pokeDashHint();
              }}
            >
              <LayoutDashboard size={20} aria-hidden />
              {dashHint && <span className="ainubis-panel__dashtip">{copy.dashboardHint}</span>}
            </button>
            <img className="ainubis-panel__avatar" src={ainubisFace} alt="" aria-hidden="true" />
            <div className="ainubis-panel__ident">
              <p className="ainubis-panel__title">
                <span className="ainubis-ai">AI</span>NUBIS
              </p>
              <p className="ainubis-panel__subtitle">
                {takeoverActive ? copy.takeoverActive : copy.panelSubtitle}
              </p>
            </div>
            <span className={`ainubis-panel__status${takeoverActive ? ' ainubis-panel__status--takeover' : ''}`}>
              <i />
              {takeoverActive ? copy.statusTakeover : copy.statusOnline}
            </span>
            {/* Kríž so šípkami vľavo od krížika. Na mobile sa nevykreslí — panel je tam
                fullscreen sheet, presúvať ho nie je kam. */}
            {canMove && (
              <button
                type="button"
                className={`ainubis-panel__move${movable ? ' ainubis-panel__move--on' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMovable((v) => !v);
                }}
                title={movable ? copy.moveStop : copy.moveStart}
                aria-label={movable ? copy.moveStop : copy.moveStart}
                aria-pressed={movable}
              >
                <Move size={16} />
              </button>
            )}
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

          {/* Prúžok sa ukáže len v režime presúvania — hovorí, ČÍM sa ťahá (hlavičkou,
              nie tlačidlom) a ponúka návrat do rohu. Bez neho je zapnutý režim
              neviditeľný stav a človek hľadá, prečo mu hlavička uteká pod myšou. */}
          {movable && (
            <div className="ainubis-panel__movehint">
              <span>{copy.moveHint}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetPanelPos();
                }}
              >
                {copy.moveReset}
              </button>
            </div>
          )}

          <div className="ainubis-panel__body" ref={bodyRef}>
            {/* Intro karta — len kým je konverzácia prázdna (rovnaká podmienka
                ako návrhy pod ňou). Akonáhle človek napíše, odscrolluje sa
                s históriou preč a už sa nevracia. */}
            {showIntro && (
              <div className="ainubis-intro">
                <img className="ainubis-intro__badge" src={ainubisFace} alt="" aria-hidden="true" />
                {/* „AI" v mene svieti modrou — meno je značka, nie preklad,
                    preto je rozdelené priamo v markupe, nie v copy súbore. */}
                <p className="ainubis-intro__name">
                  <span className="ainubis-ai">AI</span>NUBIS
                </p>
                <p className="ainubis-intro__role" ref={introNameRef}>{copy.introRole}</p>
                <div className="ainubis-intro__rule" />
              </div>
            )}
            {messages.map((m, i) => {
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
              const bubble = (
                <div className={`ainubis-msg ${isUser ? 'ainubis-msg--user' : 'ainubis-msg--assistant'}`}>
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
              if (isUser) return <div key={m.id} className="ainubis-row ainubis-row--user">{bubble}</div>;

              // Portrét sedí pri POSLEDNEJ bubline súvislej série AINUBISA — tak to
              // robí IG/Messenger. Uvítanie sú dve bubliny po sebe; dva portréty pod
              // sebou by z rozhovoru urobili zoznam. Keď za sériou práve beží „…píše",
              // portrét patrí tomu riadku, nie bubline nad ním.
              const next = messages[i + 1];
              const busy = waitingReply || welcomeTyping;
              const showAvatar =
                (!next || next.role === 'user') && !(i === messages.length - 1 && busy);
              return (
                <div key={m.id} className="ainubis-row">
                  {showAvatar ? (
                    <img className="ainubis-row__avatar" src={ainubisFace} alt="" aria-hidden="true" />
                  ) : (
                    <span className="ainubis-row__avatar ainubis-row__avatar--gap" aria-hidden="true" />
                  )}
                  {bubble}
                </div>
              );
            })}
            {(waitingReply || welcomeTyping) && (
              <div className="ainubis-row">
                <img className="ainubis-row__avatar" src={ainubisFace} alt="" aria-hidden="true" />
                <div className="ainubis-typing">{copy.typing}</div>
              </div>
            )}
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
            {(listening || micError) && (
              <div className={`ainubis-composer__mic-hint${micError ? ' ainubis-composer__mic-hint--error' : ''}`}>
                {listening && <i />}
                {micError ? copy.micDenied : copy.micListening}
              </div>
            )}
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
              {speechCtor && (
                <button
                  type="button"
                  className={`ainubis-composer__icon-btn ainubis-composer__mic${listening ? ' ainubis-composer__mic--live' : ''}`}
                  onClick={() => (listening ? stopDictation() : startDictation())}
                  aria-label={listening ? copy.micStop : copy.micStart}
                  aria-pressed={listening}
                >
                  {listening ? <Square size={13} /> : <Mic size={16} />}
                </button>
              )}
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
