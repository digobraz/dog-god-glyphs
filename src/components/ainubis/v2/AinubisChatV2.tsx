// AINUBIS CHAT v2 (23. 11. 2026) — klientska časť. Predloha: plany/nakresy/ainubis-chat-2026-11-23 (nakres.md, kolá 1–10).
// Zapína ho `AINUBIS_V2` (lib/packFlags.ts); `AinubisWidget` ho pre člena v `/pack` vykreslí namiesto starého panela
// (rovina CHAT aj šuplík). Vlákno žije v tých istých `localStorage` kľúčoch ako starý widget (`ainubis.conv` / `ainubis.tok`),
// takže história a odkaz z mailu ďalej fungujú. Odoslanie ide cez stream (`v2Api.streamV2`), kontrakt servera je v v2Api.ts.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { SysIcon } from '@/components/pack/SysIcon';
import { AI_LOGO } from '@/components/pack/ainubis/3d/zaklad';
import { listHistory, type HistoryItem } from '../ainubisHistory';
import { useT } from '@/i18n/LanguageContext';
import { useRecorder } from './useRecorder';
import { useV2Dogs } from './useV2Dogs';
import {
  blobToBase64, streamV2, v2Consent, v2Credits, v2LoadThread, v2Rate, v2Stt, v2Tts, v2VoiceUrl,
  type V2Credits, type V2Done, type V2Msg, type V2Pick, type V2SendBody,
} from './v2Api';
import { AINUBIS_V2_CSS } from './v2Css';
import { RANK_CTA_ROUTE, markNoVoice, useRankName, useV2Copy, useV2Lang } from './v2Meta';
import { AssistantBlock, Disclaimer, UserBubble, type MsgActions, type PlayState } from './V2Messages';
import { ConsentSheet, RankSheet } from './V2Panels';
import { V2Composer } from './V2Composer';
import { V2Access } from './V2Access';
import { keyboardInset } from '@/lib/keyboardInset';
import { DEV_NOAUTH } from '@/lib/devMockDogs';

const LS_CONV = 'ainubis.conv';
const LS_TOK = 'ainubis.tok';
const lsGet = (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string | null) => { try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch { /* bez perzistencie */ } };

export interface V2Image { base64: string; mime: string; previewUrl: string }

export interface AinubisChatV2Props {
  variant: 'plane' | 'sheet';
  /** Beží výber miesta (terč): chat sa skryje, ale ostane zmontovaný (drží vlákno a rozpísané). */
  away: boolean;
  pathname: string;
  /** Rozpísaný text žije vo widgete (prefill z `openAinubis`, riadok s okolnosťami zo snímky). */
  input: string;
  setInput: (s: string) => void;
  image: V2Image | null;
  onClearImage: () => void;
  onPickFile: (file: File) => void;
  /** „Označiť problém v appke“ → terč widgetu. */
  onAim: () => void;
  /** Šípka späť (rovina → VAULT) / zavrieť (šuplík). */
  onBack: () => void;
}

const DOG_ID_RE = /^\/pack\/dogs\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/|$)/i;

let seq = 0;
const lid = (p: string) => `${p}-${Date.now()}-${seq++}`;

export function AinubisChatV2(props: AinubisChatV2Props) {
  const { variant, away, pathname, input, setInput, image, onClearImage, onPickFile, onAim, onBack } = props;
  const c = useV2Copy();
  const t = useT();
  const lang = useV2Lang();
  const rankName = useRankName();
  const navigate = useNavigate();
  const dogs = useV2Dogs();
  const rec = useRecorder();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };

  const [msgs, setMsgs] = useState<V2Msg[]>([]);
  const [convId, setConvId] = useState<string | null>(() => lsGet(LS_CONV));
  const [tok, setTok] = useState<string | null>(() => lsGet(LS_TOK));
  const [credits, setCredits] = useState<V2Credits | null>(null);
  const [consentOk, setConsentOk] = useState(false);
  const [consentAsk, setConsentAsk] = useState(false);
  const [consentBusy, setConsentBusy] = useState(false);
  const [consentFail, setConsentFail] = useState(false);
  const [sheet, setSheet] = useState<null | 'rank' | 'access'>(null);
  const [side, setSide] = useState(false);
  const [hist, setHist] = useState<HistoryItem[] | null>(null);
  const [histErr, setHistErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [pick, setPick] = useState<V2Pick>('auto');
  const [dogId, setDogId] = useState<string | null | undefined>(undefined); // undefined = ešte nevybral, platí predvolený
  const [voice, setVoice] = useState<{ path: string; sec: number; url: string } | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [play, setPlay] = useState<PlayState | null>(null);
  const [kb, setKb] = useState(0);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsCache = useRef(new Map<string, string>());
  /** Vlákno držíme aj v refe: `send` ho číta po `await`, keď je stav z renderu už starý (403 → nové vlákno). */
  const threadRef = useRef<{ id: string | null; tok: string | null }>({ id: lsGet(LS_CONV), tok: lsGet(LS_TOK) });
  const setThread = (id: string | null, token: string | null) => {
    threadRef.current = { id, tok: token };
    lsSet(LS_CONV, id); lsSet(LS_TOK, token);
    setConvId(id); setTok(token);
  };

  // ── Kredity, súhlas ──
  const refreshCredits = useCallback(async () => {
    const cr = await v2Credits();
    if (cr) { setCredits(cr); if (cr.consent) setConsentOk(true); }
  }, []);
  useEffect(() => { void refreshCredits(); }, [refreshCredits]);

  // Veriaci voľbu modelu nevidí a vyššie než strop hodnosti sa nedá vybrať.
  useEffect(() => {
    if (!credits) return;
    if (credits.rank === 'veriaci') { setPick('auto'); return; }
    const idx = { rychly: 0, bystry: 1, hlboky: 2 } as const;
    setPick((p) => (p !== 'auto' && idx[p] > idx[credits.top] ? 'auto' : p));
  }, [credits]);

  // Predvolený pes: ten z otvorenej karty `/pack/dogs/:id`, inak prvý; Veriaci má psov zamknutých.
  const selectedDog = useMemo(() => {
    if (credits?.rank === 'veriaci' || !credits) return null;
    if (dogId !== undefined) return dogId;
    return DOG_ID_RE.exec(pathname)?.[1] ?? dogs[0]?.id ?? null;
  }, [credits, dogId, pathname, dogs]);

  // ── História ──
  const loadHistory = useCallback(() => {
    if (DEV_NOAUTH) return;
    setHistErr(false);
    listHistory().then(setHist).catch(() => { setHistErr(true); setHist([]); });
  }, []);
  useEffect(() => {
    if (DEV_NOAUTH) { setHist([{ id: 'dev-1', session_token: 't', created_at: new Date().toISOString(), last_message_at: new Date().toISOString(), msg_count: 2, preview: 'Hektor zjedol kúsok čokolády' }]); return; }
    loadHistory();
  }, [loadHistory]);

  const mapThread = useCallback((rows: Awaited<ReturnType<typeof v2LoadThread>>['messages']): V2Msg[] =>
    rows.filter((r) => r.role === 'user' || r.role === 'assistant' || r.role === 'matej').map((r) => ({
      id: r.id,
      role: (r.role === 'user' ? 'user' : 'assistant') as V2Msg['role'],
      content: r.content,
      created_at: r.created_at,
      voice: r.meta?.voice?.path ? { path: r.meta.voice.path, sec: r.meta.voice.sec ?? 0 } : undefined,
      tier: r.meta?.v2?.tier,
      credits: r.meta?.v2?.credits,
      scrolls: r.meta?.v2?.scrolls,
      sos: r.meta?.v2?.sos,
      local: r.role === 'matej',
    })).sort((a, b) => a.created_at.localeCompare(b.created_at)), []);

  const openThread = useCallback(async (id: string, token: string) => {
    abortRef.current?.abort();
    const r = await v2LoadThread(id, token);
    if (!r.ok) { if (r.status === 403) setThread(null, null); return; }
    setThread(id, token);
    setMsgs(mapThread(r.messages));
  }, [mapThread]);

  // Vlákno z minulej návštevy sa obnoví (rovnako ako starý widget).
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (convId && tok) void openThread(convId, tok);
  }, [convId, tok, openThread]);

  // ── Dobiehanie vlákna (poll) ──
  // Ako starý widget: LEN po odoslaní, á 10 s, najviac 5 min, nie keď je záložka skrytá. Prinesie dve veci:
  // odpoveď, ktorú server dopísal po výpadku signálu (server dobehne aj bez klienta), a Matejovu ručnú
  // odpoveď z /admin (prevzatie). Lokálny stav (hodnotenie, nahlásené) sa pri zlúčení zachová.
  const waitUntilRef = useRef(0);
  const msgsRef = useRef<V2Msg[]>([]);
  useEffect(() => { msgsRef.current = msgs; }, [msgs]);
  const syncThread = useCallback(async () => {
    const { id, tok: token } = threadRef.current;
    if (!id || !token || DEV_NOAUTH) return;
    const r = await v2LoadThread(id, token);
    if (!r.ok) return;
    const server = mapThread(r.messages);
    const cur = msgsRef.current;
    if (cur.some((m) => m.streaming)) return;
    const known = cur.filter((m) => !m.local).length;
    if (server.length <= known && !cur.some((m) => m.local)) return;
    const prev = new Map(cur.map((m) => [m.id, m]));
    setMsgs(server.map((m) => { const p = prev.get(m.id); return p ? { ...m, rating: p.rating, reported: p.reported } : m; }));
    setCanRetry(false);
  }, [mapThread]);
  useEffect(() => {
    const iv = window.setInterval(() => {
      if (busy || away || document.hidden || Date.now() > waitUntilRef.current) return;
      void syncThread();
    }, 10_000);
    return () => window.clearInterval(iv);
  }, [busy, away, syncThread]);

  const newConversation = useCallback(() => {
    abortRef.current?.abort();
    stopAudio();
    setThread(null, null); setMsgs([]); setError(null); setCanRetry(false); setBusy(false); setSide(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Klávesnica iPhone: riadok sedí nad ňou (jazýček podcastu a nav počíta CSS cez --pod-dock) ──
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setKb(keyboardInset());
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => { vv.removeEventListener('resize', sync); vv.removeEventListener('scroll', sync); };
  }, []);

  // ── Posun na koniec ──
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [msgs, away]);

  // ── Zvuk: jeden prehrávač pre Vypočuť aj vlastnú nahrávku ──
  function stopAudio() {
    const a = audioRef.current;
    audioRef.current = null;
    if (a) { a.onended = null; a.ontimeupdate = null; a.pause(); }
    setPlay(null);
  }
  useEffect(() => () => stopAudio(), []);
  function playUrl(key: string, url: string) {
    stopAudio();
    const a = new Audio(url);
    audioRef.current = a;
    setPlay({ key, loading: false, cur: 0, dur: 0 });
    a.ontimeupdate = () => setPlay({ key, loading: false, cur: a.currentTime, dur: Number.isFinite(a.duration) ? a.duration : 0 });
    a.onended = () => { audioRef.current = null; setPlay(null); };
    a.play().catch(() => { audioRef.current = null; setPlay(null); setError(c('listenFail')); });
  }
  async function onListen(m: V2Msg) {
    const key = `tts:${m.id}`;
    setPlay({ key, loading: true, cur: 0, dur: 0 });
    let url = ttsCache.current.get(m.id);
    if (!url) {
      const r = await v2Tts(m.id);
      if ('error' in r) {
        setPlay(null);
        if (r.error === 'no_voice') markNoVoice(lang); else setError(c('listenFail'));
        return;
      }
      url = (r as { data: { url: string } }).data.url;
      ttsCache.current.set(m.id, url);
    }
    playUrl(key, url);
  }
  async function onPlayVoice(m: V2Msg) {
    const key = `voice:${m.id}`;
    let url = m.voice?.url;
    if (!url && m.voice?.path) { setPlay({ key, loading: true, cur: 0, dur: 0 }); url = (await v2VoiceUrl(m.voice.path)) ?? undefined; }
    if (!url) { setPlay(null); setError(c('listenFail')); return; }
    playUrl(key, url);
  }

  // ── Hodnotenie a nahlásenie ──
  async function onRate(m: V2Msg, rating: 'up' | 'down') {
    const next = m.rating === rating ? null : rating;
    setMsgs((l) => l.map((x) => (x.id === m.id ? { ...x, rating: next } : x)));
    if (!(await v2Rate(m.id, next))) setMsgs((l) => l.map((x) => (x.id === m.id ? { ...x, rating: m.rating ?? null } : x)));
  }
  async function onReport(m: V2Msg, text: string): Promise<boolean> {
    const ok = await v2Rate(m.id, m.rating ?? null, text);
    if (ok) setMsgs((l) => l.map((x) => (x.id === m.id ? { ...x, reported: true } : x)));
    return ok;
  }

  // ── Diktafón: nahrávka → prepis (server) → text do riadku, NEODOSIELA SA ──
  async function recStart() {
    setError(null);
    const ok = await rec.start();
    if (!ok) setError(c('micDenied'));
  }
  async function recDone() {
    const r = await rec.stop();
    if (!r) return;
    setTranscribing(true);
    try {
      const b64 = await blobToBase64(r.blob);
      const res = await v2Stt(b64, r.mime, lang, r.sec);
      if (!res.ok) { setError(c('micFail')); return; }
      setVoice({ path: res.data.path, sec: res.data.sec || r.sec, url: r.url });
      const txt = res.data.text.trim();
      if (txt) setInput(input.trim() ? `${input.trimEnd()} ${txt}` : txt);
      window.setTimeout(() => taRef.current?.focus(), 50);
    } catch { setError(c('micFail')); } finally { setTranscribing(false); }
  }

  // ── Odoslanie ──
  const patchLast = (fn: (m: V2Msg) => V2Msg) => setMsgs((l) => (l.length ? [...l.slice(0, -1), fn(l[l.length - 1])] : l));

  async function acceptConsent() {
    setConsentBusy(true); setConsentFail(false);
    const ok = await v2Consent();
    setConsentBusy(false);
    if (!ok) { setConsentFail(true); return; }
    setConsentOk(true); setConsentAsk(false);
    void refreshCredits();
    void send(true);
  }

  async function send(afterConsent = false, retried = false) {
    const text = input.trim();
    if ((!text && !image && !voice) || busy || transcribing) return;
    if (!consentOk && !afterConsent) { setConsentFail(false); setConsentAsk(true); return; }
    stopAudio();
    setError(null); setCanRetry(false); setBusy(true);
    const ctl = new AbortController();
    abortRef.current = ctl;
    const now = new Date().toISOString();
    const uMsg: V2Msg = { id: lid('u'), role: 'user', content: text, created_at: now, image: image?.previewUrl, voice: voice ? { sec: voice.sec, path: voice.path, url: voice.url } : undefined };
    const aMsg: V2Msg = { id: lid('a'), role: 'assistant', content: '', created_at: now, streaming: true, status: 'thinking' };
    setMsgs((l) => [...l, uMsg, aMsg]);

    const body: V2SendBody = {
      v: 2, message: text, lang, page: pathname, pick, for_dog: selectedDog,
      ...(threadRef.current.id && threadRef.current.tok ? { conversation_id: threadRef.current.id, session_token: threadRef.current.tok } : {}),
      ...(image ? { image_b64: image.base64, image_mime: image.mime } : {}),
      ...(voice ? { voice: { path: voice.path, sec: voice.sec } } : {}),
    };
    let gotMeta = false;
    let finished = false;
    const finish = (d: V2Done) => {
      finished = true;
      if (d.credits_state) {
        const st = d.credits_state;
        setCredits((cr) => (cr ? { ...cr, used: st.used, allowance: st.allowance, enabled: st.enabled, resets_at: st.resets_at ?? cr.resets_at } : cr));
      }
      if (d.error === 'credits_exhausted') {
        patchLast((m) => ({ ...m, content: d.reply, streaming: false, status: null, local: true, role: 'system' }));
        return;
      }
      patchLast((m) => ({
        ...m, id: d.message_id ?? m.id, content: d.reply || m.content, streaming: false, status: null,
        tier: d.tier, credits: d.credits, scrolls: d.scrolls ?? [], sos: d.sos ?? [], fallback: d.fallback ?? null,
        local: !d.message_id,
      }));
    };

    const res = await streamV2(body, {
      onMeta: (m) => {
        gotMeta = true;
        setThread(m.conversation_id, m.session_token);
        // správa je u servera, koncept sa už nemôže stratiť
        setInput(''); onClearImage(); setVoice(null);
      },
      onStatus: (s) => patchLast((m) => ({ ...m, status: s })),
      onDelta: (tkn) => patchLast((m) => ({ ...m, content: m.content + tkn, status: null })),
      onDone: finish,
      onError: () => { /* rieši sa po dobehnutí prúdu */ },
    }, ctl.signal);

    setBusy(false);
    waitUntilRef.current = Date.now() + 5 * 60_000;
    if (res.kind === 'aborted') return;
    if (res.kind === 'ok' && finished) { loadHistory(); return; }

    // 428 = server chce súhlas (tretia strana AI): karta súhlasu, text ostal v riadku a po „Súhlasím“ sa pošle znova.
    if (res.kind === 'http' && res.status === 428) {
      setMsgs((l) => l.slice(0, -2));
      setConsentOk(false); setConsentFail(false); setConsentAsk(true);
      return;
    }
    // Zlý signál alebo chyba: pred `meta` sa správa vráti do riadku (nič sa nestratí), po `meta` ostane odpoveď s chybou.
    if (res.kind === 'http' && res.status === 403 && threadRef.current.id && !retried) {
      // Vlákno už nie je naše: zahoď ho a pošli tú istú správu ako nový rozhovor (rovnako ako starý widget).
      setThread(null, null);
      setMsgs((l) => l.slice(0, -2));
      void send(true, true);
      return;
    }
    const msg = res.kind === 'http' && res.status === 429 ? (res.body?.reply || c('errRate'))
      : res.kind === 'http' && res.status !== 0 ? c('errGeneric') : c('errOffline');
    if (!gotMeta) {
      setMsgs((l) => l.slice(0, -2));
      setError(msg);
    } else {
      patchLast((m) => ({ ...m, role: 'system', content: m.content ? `${m.content}\n\n${msg}` : msg, streaming: false, status: null, local: true }));
      setCanRetry(true);
    }
  }

  const actions: MsgActions = {
    lang, c, play, onListen, onPlayVoice, onStop: stopAudio, onRate, onReport,
    // Po `meta` je otázka u servera a ten odpoveď dopíše aj bez nás — znova ju NEPOSIELAME (duplikát),
    // len načítame vlákno. Pred `meta` sa text vracia do riadku sám (vetva vyššie).
    onRetry: () => { waitUntilRef.current = Date.now() + 5 * 60_000; void syncThread(); },
    free: credits?.rank === 'veriaci', onRanks: () => setSheet('rank'), canRetry,
  };

  // ── Rozloženie ──
  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((start(new Date()) - start(d)) / 86_400_000);
    if (diff === 0) return tx('ainubis.chat.today', 'Today');
    if (diff === 1) return tx('ainubis.chat.yesterday', 'Yesterday');
    try { return d.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: diff > 300 ? 'numeric' : undefined }); } catch { return d.toLocaleDateString(); }
  };
  const groups = useMemo(() => {
    const out: { day: string; items: HistoryItem[] }[] = [];
    for (const it of hist ?? []) {
      const day = dayLabel(it.last_message_at || it.created_at);
      const g = out[out.length - 1];
      if (g && g.day === day) g.items.push(it); else out.push({ day, items: [it] });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hist, lang]);

  const title = hist?.find((h) => h.id === convId)?.preview;
  const empty = msgs.length === 0;
  const bottom = kb > 0 ? `${kb}px` : variant === 'plane' ? 'calc(var(--pack-nav-h, 0px) + var(--pack-nav-bottom, 0px) + var(--pod-dock, 0px))' : '0px';
  const ask = (q: string) => { setInput(q); window.setTimeout(() => taRef.current?.focus(), 30); };
  const lastIsAssistant = msgs.length > 0 && msgs[msgs.length - 1].role !== 'user';

  return (
    <>
      <style>{AINUBIS_V2_CSS}</style>
      {variant === 'sheet' && !away && <div className="av2-veil" onClick={onBack} aria-hidden />}
      <div className={`av2 av2--${variant}${away ? ' av2--away' : ''}`} style={{ '--av2-bottom': bottom } as CSSProperties} role={variant === 'sheet' ? 'dialog' : undefined} aria-label="AINUBIS">
        <div className={`av2-scrim${side ? ' on' : ''}`} onClick={() => setSide(false)} aria-hidden />
        <aside className={`av2-side${side ? ' on' : ''}`} aria-label={c('history')}>
          <div className="av2-side-top"><img src={AI_LOGO} alt="" /><div className="av2-name"><b>AI</b>NUBIS</div></div>
          <button type="button" className="pk-b3 pk-b3--ai-or av2-newc" onClick={newConversation}><SysIcon name="pridaj-chat" size={28} />{c('newConv')}</button>
          <div className="av2-hist">
            {hist === null && <div className="av2-note">{c('histLoading')}</div>}
            {histErr && <div className="av2-note">{c('histErr')}</div>}
            {hist !== null && !histErr && hist.length === 0 && <div className="av2-note">{c('histEmpty')}</div>}
            {groups.map((g) => (
              <div key={g.day}>
                <div className="av2-day">{g.day}</div>
                {g.items.map((it) => (
                  <button key={it.id} type="button" className={`av2-hi${it.id === convId ? ' on' : ''}`} onClick={() => { setSide(false); if (it.id !== convId) void openThread(it.id, it.session_token); }}>
                    {it.preview || '…'}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="av2-side-foot">
            <button type="button" className="pk-b3 pk-b3--ai-nt" onClick={() => { setSide(false); setSheet('access'); }}><SysIcon name="nastavenia" size={24} />{c('seesettings')}</button>
          </div>
        </aside>

        <section className="av2-main">
          <div className="av2-top">
            <button type="button" className="pk-b3 pk-b3--ai-nt av2-round av2-back" aria-label={variant === 'plane' ? c('backAria') : c('closeAria')} onClick={onBack}>
              <SysIcon name={variant === 'plane' ? 'spat' : 'krizik'} size={28} />
            </button>
            <button type="button" className="pk-b3 pk-b3--ai-nt av2-round only-mob" aria-label={c('openHistoryAria')} onClick={() => setSide((v) => !v)}><SysIcon name="historia" size={28} /></button>
            <div className="ttl"><span className="only-mob"><b>AI</b>NUBIS</span><span className="only-pc">{title || c('newConv')}</span></div>
            <button type="button" className="pk-b3 pk-b3--ai-nt av2-round only-mob" aria-label={c('newConv')} onClick={newConversation}><SysIcon name="pridaj-chat" size={28} /></button>
          </div>

          <div className="av2-feed" ref={feedRef}>
            {empty ? (
              <div className="av2-empty">
                <img src={AI_LOGO} alt="" />
                <div className="av2-h">{c('empty')}</div>
                <div className="av2-sugg">
                  <button type="button" className="pk-b3 pk-b3--ai-nt" onClick={() => ask(c('q1'))}>{c('q1l')}</button>
                  <button type="button" className="pk-b3 pk-b3--ai-nt" onClick={() => ask(c('q2'))}>{c('q2l')}</button>
                  <button type="button" className="pk-b3 pk-b3--ai-nt" onClick={() => ask(c('q3'))}>{c('q3l')}</button>
                  <button type="button" className="pk-b3 pk-b3--ai-nt" onClick={onAim}><SysIcon name="poloha" size={24} />{c('shot')}</button>
                </div>
                <Disclaimer a={actions} />
              </div>
            ) : (
              <div className="av2-col">
                {msgs.map((m, i) => (m.role === 'user'
                  ? <UserBubble key={m.id} m={m} a={actions} />
                  : <AssistantBlock key={m.id} m={m} a={actions} last={i === msgs.length - 1} />))}
                {lastIsAssistant && !busy && <Disclaimer a={actions} />}
              </div>
            )}
          </div>

          <V2Composer
            c={c} lang={lang} rankName={rankName} credits={credits}
            text={input} setText={setInput} onSend={() => void send()} busy={busy}
            draft={{ image, voice: voice ? { sec: voice.sec } : null }}
            onClearImage={onClearImage} onClearVoice={() => setVoice(null)}
            dogs={dogs} dogId={selectedDog} setDogId={setDogId} pick={pick} setPick={setPick}
            onFile={onPickFile} onMark={onAim}
            recActive={rec.active} recSec={rec.sec} transcribing={transcribing}
            onRecStart={() => void recStart()} onRecCancel={rec.cancel} onRecDone={() => void recDone()}
            error={error} onStrip={() => setSheet('rank')} taRef={taRef}
          />
        </section>

        {sheet === 'rank' && credits && (
          <RankSheet credits={credits} c={c} lang={lang} rankName={rankName} onClose={() => setSheet(null)}
            onCta={() => { setSheet(null); navigate(RANK_CTA_ROUTE); }} />
        )}
        {sheet === 'access' && <V2Access onClose={() => setSheet(null)} onCleared={() => { newConversation(); setHist([]); }} />}
        {consentAsk && <ConsentSheet c={c} busy={consentBusy} failed={consentFail} onYes={() => void acceptConsent()} onNo={() => setConsentAsk(false)} />}
      </div>
    </>
  );
}

