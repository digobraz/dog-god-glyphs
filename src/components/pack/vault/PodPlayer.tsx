// ── PREHRÁVAČ PODCASTOV (22. 11. 2026) ──────────────────────────────────────────────────────────
// Matej: *„musíme postaviť aj prehrávač na podcasty ako má napr spotify = obrázok 15 s dopredu dozadu a vymyslieť
// ako to bude fungovať ked bude človek v apke alebo ak apku zatvorí“* · *„dá sa na zamknutú obrazovku dať tlačidlo
// náhodný výber hracia kocka … inak by sa prehrávali podcasty postupne … chýba tam tlačítko dozadu a dopredu“*.
// Nákres: plany/nakresy/prehravac-podcastov-2026-11-22/.
//
// JEDEN `<audio>` pre celú appku (nie v zvitku) ⇒ podcast hrá ďalej, keď človek zo zvitku odíde.
//   · MINI = D-BLOK (pás 64 px, r14) nad spodným navom: ⏮ ▶ ⏭, len keď niečo počúvaš a nie si v tom zvitku.
//   · CELÁ obrazovka = obraz, posuvník, ⏮ ⟲15 ▶ 15⟳ ⏭, rýchlosť, jazyk, kocka, prepis.
//   · ZAMKNUTÁ obrazovka = Media Session: obrázok, názov, ⏮ ▶ ⏭ (iPhone ukáže buď ⏮⏭, alebo ±15 s —
//     Matej nechal na mne, vybrané ⏮⏭). KOCKA je prepínač poradia: zapnutá ⇒ ⏭ a koniec podcastu
//     skočia na náhodný zvitok z INÉHO okruhu, takže funguje aj zo zamknutej obrazovky bez vlastného tlačidla.
//   · Postup (kam došiel, dopočúvané, denník) zapisuje prehrávač, nie zvitok — inak by sa po odchode zo
//     zvitku prestal ukladať.
// ⚠️ Hranie pri zamknutom telefóne chce natívny build: iOS `UIBackgroundModes: audio` (Info.plist), Android
//    WebView Media Session nemá — tam treba natívny plugin. OTA kanál testovacej appky to nedoručí.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, PROGRESS_CSS } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
import {
  type DemoScroll, podLang, pickText, fmtSec, scrollThumb, saveListen, markScroll, logEvent, useDemoScrolls, useFullScroll,
} from './vaultScrolls';
import { VAULT_CIRCLES } from './circles';

type S = {
  z: DemoScroll | null; lang: string; appLang: string;
  playing: boolean; t: number; dur: number; rate: number; shuffle: boolean; full: boolean;
  /** Zvitok, ktorého článok je práve otvorený — v ňom mini prehrávač nekreslíme (prehrávač je tam priamo). */
  inView: string | null;
};
let s: S = { z: null, lang: 'sk', appLang: 'sk', playing: false, t: 0, dur: 0, rate: 1, shuffle: false, full: false, inView: null };
const subs = new Set<() => void>();
const set = (p: Partial<S>) => { s = { ...s, ...p }; subs.forEach((f) => f()); };
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const usePod = () => useSyncExternalStore(sub, () => s, () => s);

const RATES = [1, 1.25, 1.5, 0.75];
/** Meno okruhu v jazyku člena — to isté ako `circleName` v ScrollParts (ten sem neťaháme: je to celý článok). */
const circleOf = (z: DemoScroll, lang: string) => {
  const c = VAULT_CIRCLES[z.world]?.[z.okruh - 1];
  return c ? (lang === 'sk' || lang === 'cs' ? c.sk : c.en) : (typeof z.circle === 'string' ? z.circle : '');
};
const POD_TAG: Record<string, string> = { sk: 'SK', en: 'EN', cs: 'CZ', de: 'DE' };

// zoznam pre ⏮ ⏭ a kocku (ľahké riadky z `useDemoScrolls`, podcast v nich je)
let list: DemoScroll[] = [];
const history: string[] = [];
const hasPod = (z: DemoScroll) => Object.keys(z.pod || {}).length > 0;

// ── postup a denník (to isté, čo robil PodcastBox v zvitku) ──
let lastSave = 0;
let doneId: string | null = null;
let playedFrom: number | null = null;
let endHook: { id: string; fn: () => void } | null = null;
const keep = (force = false) => {
  const a = audio; const z = s.z;
  if (!a || !z) return;
  if (!force && a.currentTime - lastSave < 15) return;
  lastSave = a.currentTime;
  saveListen(z.id, a.currentTime, s.lang);
};
const flush = () => {
  if (playedFrom == null || !s.z) return;
  const sec = Math.round((Date.now() - playedFrom) / 1000);
  playedFrom = null;
  if (sec >= 3) logEvent(s.z.id, 'listen', { sec, lang: s.lang, at: Math.round(audio?.currentTime || 0) });
};

let audio: HTMLAudioElement | null = null;
let posAt = 0;
function el(): HTMLAudioElement {
  if (audio) return audio;
  const a = new Audio();
  a.preload = 'metadata';
  a.addEventListener('play', () => { playedFrom = Date.now(); set({ playing: true }); media(); });
  a.addEventListener('pause', () => { flush(); keep(true); set({ playing: false }); media(); });
  a.addEventListener('loadedmetadata', () => set({ dur: a.duration || 0 }));
  a.addEventListener('timeupdate', () => {
    set({ t: a.currentTime });
    keep();
    if (s.z && doneId !== s.z.id && a.duration && a.currentTime / a.duration >= 0.9) { doneId = s.z.id; markScroll(s.z.id, 2, 'listen'); }
    if (Date.now() - posAt > 1000) { posAt = Date.now(); position(); }
  });
  a.addEventListener('ended', () => {
    flush(); keep(true);
    if (s.z && doneId !== s.z.id) { doneId = s.z.id; markScroll(s.z.id, 2, 'listen'); }
    // POČÚVAJ ZA SEBOU v otvorenom článku si ďalší zvitok otvorí sám (aj s článkom), inak ide prehrávač
    if (endHook && s.z && endHook.id === s.z.id) endHook.fn(); else podNext();
  });
  audio = a;
  return a;
}

function load(z: DemoScroll, lang: string, at = 0, play = true) {
  const a = el();
  const pod = z.pod[lang];
  if (!pod) return;
  if (s.z) flush();
  if (s.z && s.z.id !== z.id) history.push(s.z.id);
  lastSave = at;
  a.src = pod.src;
  a.playbackRate = s.rate;
  a.addEventListener('loadedmetadata', () => { if (at > 0) a.currentTime = at; a.playbackRate = s.rate; }, { once: true });
  set({ z, lang, t: at, dur: pod.sec || 0 });
  media();
  if (play) void a.play().catch(() => undefined);
}

/** Spustí podcast zvitku (alebo ho pozastaví/pustí, keď je to ten istý). */
export function podStart(z: DemoScroll, lang: string, appLang: string, resumeAt = 0) {
  if (s.z?.id === z.id && s.lang === lang) { podToggle(); return; }
  set({ appLang });
  const sec = z.pod[lang]?.sec || 0;
  load(z, lang, resumeAt > 5 && (!sec || resumeAt < sec * 0.9) ? resumeAt : 0);
}
export function podToggle() { const a = el(); if (!s.z) return; if (a.paused) void a.play().catch(() => undefined); else a.pause(); }
export function podSeek(sec: number) { const a = el(); a.currentTime = Math.max(0, Math.min(a.duration || sec, sec)); set({ t: a.currentTime }); position(); }
export function podSkip(d: number) { podSeek((audio?.currentTime || 0) + d); }
/** Iný jazyk toho istého zvitku — pozícia ide pomerom (preklady majú inú dĺžku). */
export function podLangTo(l: string) {
  if (!s.z || l === s.lang || !s.z.pod[l]) return;
  const a = el();
  const r = a.duration ? a.currentTime / a.duration : 0;
  const playing = !a.paused;
  flush();
  a.src = s.z.pod[l].src;
  a.addEventListener('loadedmetadata', () => { a.currentTime = r * a.duration; a.playbackRate = s.rate; if (playing) void a.play().catch(() => undefined); }, { once: true });
  set({ lang: l });
}
export function podRate() { const r = RATES[(RATES.indexOf(s.rate) + 1) % RATES.length]; el().playbackRate = r; set({ rate: r }); }
export function podShuffle() { set({ shuffle: !s.shuffle }); }
export function podFull(full: boolean) { set({ full }); }
const langFor = (z: DemoScroll) => (z.pod[s.lang] ? s.lang : podLang(z, s.appLang));
export function podNext() {
  const cur = s.z; if (!cur) return;
  const ok = list.filter(hasPod);
  let nx: DemoScroll | undefined;
  if (s.shuffle) {
    // KOCKA = iná téma: náhodný zvitok z iného okruhu (svet + okruh)
    const other = ok.filter((z) => z.world !== cur.world || z.okruh !== cur.okruh);
    nx = other[Math.floor(Math.random() * other.length)];
  } else {
    const i = ok.findIndex((z) => z.id === cur.id);
    nx = ok[(i + 1) % ok.length];
  }
  const l = nx && langFor(nx);
  if (nx && l) load(nx, l);
}
export function podPrev() {
  const a = el();
  // ako Spotify: v strede podcastu ⏮ najprv skočí na začiatok
  if (a.currentTime > 5 || !s.z) { podSeek(0); return; }
  const ok = list.filter(hasPod);
  const backId = history.pop();
  const cur = s.z;
  const pv = (backId && ok.find((z) => z.id === backId)) || ok[(ok.findIndex((z) => z.id === cur.id) - 1 + ok.length) % ok.length];
  const l = pv && langFor(pv);
  if (pv && l) { load(pv, l); history.pop(); }
}
/** Otvorený článok: mini sa v ňom skryje a POČÚVAJ ZA SEBOU dostane koniec podcastu. */
export function podInView(id: string | null) { if (s.inView !== id) set({ inView: id }); }
export function podEndHook(id: string, fn: (() => void) | null) {
  if (fn) endHook = { id, fn }; else if (endHook?.id === id) endHook = null;
}

// ── ZAMKNUTÁ OBRAZOVKA / slúchadlá / auto (Media Session) ──
function media() {
  const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
  if (!ms || !s.z) return;
  const x = pickText(s.z, s.appLang);
  const img = s.z.img ? scrollThumb(s.z.img).src : '';
  try {
    ms.metadata = new MediaMetadata({
      title: x.t, artist: 'DOGYPT · AINUBIS', album: circleOf(s.z, s.appLang),
      artwork: img ? [{ src: img, sizes: '512x512' }] : [],
    });
  } catch { /* MediaMetadata chýba */ }
  ms.playbackState = s.playing ? 'playing' : 'paused';
  const h: [MediaSessionAction, MediaSessionActionHandler | null][] = [
    ['play', () => podToggle()], ['pause', () => podToggle()],
    ['previoustrack', () => podPrev()], ['nexttrack', () => podNext()],
    ['seekto', (d) => { if (d.seekTime != null) podSeek(d.seekTime); }],
    // ±15 s ZÁMERNE nie: iPhone by namiesto ⏮ ⏭ ukázal skoky (jedno alebo druhé, nie oboje)
    ['seekbackward', null], ['seekforward', null],
  ];
  for (const [k, fn] of h) { try { ms.setActionHandler(k, fn); } catch { /* prehliadač akciu nepozná */ } }
}
function position() {
  const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
  const a = audio;
  if (!ms?.setPositionState || !a || !a.duration || !Number.isFinite(a.duration)) return;
  try { ms.setPositionState({ duration: a.duration, position: Math.min(a.currentTime, a.duration), playbackRate: a.playbackRate }); } catch { /* starý prehliadač */ }
}

// ── ikonky ovládania (funkčné chrome prehrávača; kocka v kite nie je — kreslená tu) ──
const Svg = ({ d, fill, size = 24 }: { d: string; fill?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const PLAY = 'M8 5v14l11-7z';
const PAUSE = 'M7 5h4v14H7zM13 5h4v14h-4z';
const NEXT = 'M5 5l10 7-10 7zM17 5h2v14h-2z';
const PREV = 'M19 5L9 12l10 7zM5 5h2v14H5z';
const Skip = ({ fwd }: { fwd?: boolean }) => (
  <span className="pp-skip">
    <Svg size={32} d={fwd ? 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5' : 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5'} />
    <b>15</b>
  </span>
);
const Dice = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="4" />
    {[[9, 9], [15, 9], [12, 12], [9, 15], [15, 15]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" stroke="none" />)}
  </svg>
);

/** Zoznam pre ⏮ ⏭ a kocku — načíta sa až keď niečo hrá (prvá obrazovka appky ho netiahne). */
function ListFeed() {
  const all = useDemoScrolls();
  useEffect(() => { list = all; }, [all]);
  return null;
}

/** MINI — D-BLOK nad spodným navom. Montuje ho spodný nav (`PackBottomNavBar`). */
export function PodMini() {
  const p = usePod();
  if (!p.z) return null;
  const x = pickText(p.z, p.appLang);
  const show = p.inView !== p.z.id && !p.full && (p.playing || p.t > 0);
  return (
    <>
      <ListFeed />
      <style>{POD_CSS}</style>
      {show && (
        <div className="pp-mini" role="region" aria-label={x.t} onClick={() => podFull(true)}>
          {p.z.img && <img {...scrollThumb(p.z.img)} alt="" />}
          <div className="pp-meta">
            <b>{x.t}</b>
            <small>{fmtSec(Math.floor(p.t))} / {fmtSec(Math.floor(p.dur))} · {POD_TAG[p.lang] || p.lang.toUpperCase()}</small>
          </div>
          <button type="button" className="pp-ic" aria-label="Previous" onClick={(e) => { e.stopPropagation(); podPrev(); }}><Svg d={PREV} fill /></button>
          <button type="button" className="pp-play" aria-label={p.playing ? 'Pause' : 'Play'} onClick={(e) => { e.stopPropagation(); podToggle(); }}><Svg d={p.playing ? PAUSE : PLAY} fill /></button>
          <button type="button" className="pp-ic" aria-label="Next" onClick={(e) => { e.stopPropagation(); podNext(); }}><Svg d={NEXT} fill /></button>
          <div className="pk-progress pp-bar"><div className="pk-progress__fill" style={{ transform: `scaleX(${p.dur ? p.t / p.dur : 0})` }} /></div>
        </div>
      )}
      {p.full && <PodFull />}
    </>
  );
}

/** CELÁ obrazovka — šípka dole, Esc alebo stiahnutie za vrch. */
function PodFull() {
  const p = usePod();
  const { z } = useFullScroll(p.z!); // prepis je len v celom článku
  const [tr, setTr] = useState(false);
  const close = () => podFull(false);
  const { handle, sheetStyle } = useSheetSwipe(close);
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') podFull(false); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
  const x = pickText(z, p.appLang);
  const lines = z.pod[p.lang]?.tr || [];
  const pct = p.dur ? (p.t / p.dur) * 100 : 0;
  return createPortal(
    <div className="pp-full" role="dialog" aria-modal="true" aria-label={x.t} style={sheetStyle}>
      <div className="pp-top" {...handle}>
        <button type="button" className="pp-down" aria-label="Close" onClick={close}><Svg d="M6 9l6 6 6-6" /></button>
        <span className="pp-eb">{circleOf(z, p.appLang)}</span>
        {lines.length > 0
          ? <button type="button" className={`pp-pill${tr ? ' is-on' : ''}`} aria-pressed={tr} onClick={() => setTr(!tr)}>Aa</button>
          : <span className="pp-pill pp-ghost" aria-hidden />}
      </div>
      {tr ? (
        <div className="pp-tr">
          {lines.map((r, i) => <p key={i}>{r.s === 'A' ? <b className="is-ai"><span>AI</span>NUBIS</b> : <b>Matej</b>} {r.t}</p>)}
        </div>
      ) : (z.img ? <img className="pp-art" src={z.img} alt="" /> : <div className="pp-art" />)}
      <h2 className="pp-h">{x.t}</h2>
      <span className="pp-sub">{z.n} / {z.total}</span>
      <input type="range" className="pp-seek" min={0} max={Math.max(1, Math.floor(p.dur))} step={1} value={Math.floor(p.t)} aria-label={x.t}
        style={{ ['--p' as string]: `${pct}%` }} onChange={(e) => podSeek(Number(e.target.value))} />
      <div className="pp-times"><span>{fmtSec(Math.floor(p.t))}</span><span>−{fmtSec(Math.max(0, Math.floor(p.dur - p.t)))}</span></div>
      <div className="pp-ctrl">
        <button type="button" className="pp-ic" aria-label="Previous" onClick={podPrev}><Svg d={PREV} fill size={32} /></button>
        <button type="button" className="pp-ic" aria-label="-15 s" onClick={() => podSkip(-15)}><Skip /></button>
        <button type="button" className="pp-play pp-big" aria-label={p.playing ? 'Pause' : 'Play'} onClick={podToggle}><Svg d={p.playing ? PAUSE : PLAY} fill size={32} /></button>
        <button type="button" className="pp-ic" aria-label="+15 s" onClick={() => podSkip(15)}><Skip fwd /></button>
        <button type="button" className="pp-ic" aria-label="Next" onClick={podNext}><Svg d={NEXT} fill size={32} /></button>
      </div>
      <div className="pp-row">
        <button type="button" className="pp-pill" onClick={podRate}>{String(p.rate).replace('.', ',')}×</button>
        <span className="pp-langs">
          {['sk', 'cs', 'en', 'de'].filter((l) => z.pod[l]).map((l) => (
            <button key={l} type="button" className={`pp-pill${l === p.lang ? ' is-on' : ''}`} aria-pressed={l === p.lang} onClick={() => podLangTo(l)}>{POD_TAG[l]}</button>
          ))}
        </span>
        <button type="button" className={`pp-pill pp-dice${p.shuffle ? ' is-on' : ''}`} aria-pressed={p.shuffle} aria-label="Shuffle" onClick={podShuffle}><Dice /></button>
      </div>
    </div>,
    document.body,
  );
}

// Šat Papyrus 3D (lib/papyrus3d.ts, premenné --p3d-*) · LAPIS = akcia (play, vybraná voľba) · PROGRES = recept.
const POD_CSS = `${PROGRESS_CSS}
.pp-mini{position:fixed;z-index:40;left:var(--pack-nav-cx,50vw);transform:translateX(-50%);
  width:calc(var(--pack-nav-half,171px) * 2);max-width:calc(100vw - ${PACK_SPACE.xxl}px);
  bottom:calc(var(--pack-nav-bottom,${PACK_SPACE.lg}px) + var(--pack-nav-h,64px) + ${PACK_SPACE.xl}px);
  height:64px;display:flex;align-items:center;gap:${PACK_SPACE.sm}px;padding:0 ${PACK_SPACE.sm}px;overflow:hidden;cursor:pointer;
  border-radius:${PACK_R.frame}px;border:2.5px solid var(--p3d-ink,#2a1608);background:var(--p3d-card,#F3E4C4);box-shadow:var(--p3d-pera);
  color:var(--p3d-ink,#2a1608);font-family:${FONT_UI};}
.pp-mini img{width:44px;height:44px;flex:none;object-fit:cover;border-radius:${PACK_R.field}px;border:1.5px solid var(--p3d-ink,#2a1608);}
.pp-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:${PACK_SPACE.xs}px;}
.pp-meta b{font-size:${PACK_TEXT.body}px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pp-meta small{font-size:${PACK_TEXT.label}px;opacity:.72;}
.pp-bar{position:absolute;left:0;right:0;bottom:0;width:auto;height:4px;border-radius:0;}
.pp-bar .pk-progress__fill{width:100%;border-radius:0;transform-origin:left;transition:none;}
.pp-ic{flex:none;display:grid;place-items:center;width:40px;height:40px;border:0;padding:0;background:none;color:inherit;cursor:pointer;}
.pp-play{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:${PACK_R.pill}px;border:0;cursor:pointer;padding:0;
  color:${LAPIS.ink};background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};}
.pp-skip{position:relative;display:grid;place-items:center;}
.pp-skip b{position:absolute;font-size:${PACK_TEXT.micro}px;font-weight:600;padding-top:${PACK_SPACE.xs}px;}
.pp-full{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;
  padding:calc(env(safe-area-inset-top) + ${PACK_SPACE.lg}px) ${PACK_SPACE.xl}px calc(env(safe-area-inset-bottom) + ${PACK_SPACE.xl}px);
  background:radial-gradient(120% 80% at 50% 0%,var(--p3d-paper-hi,#F9F2E3),var(--p3d-paper,#F3E4C4));color:var(--p3d-ink,#2a1608);font-family:${FONT_UI};
  animation:pp-up .24s ease;}
@keyframes pp-up{from{transform:translateY(100%)}to{transform:none}}
.pp-top{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.sm}px;padding-bottom:${PACK_SPACE.sm}px;}
.pp-down{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:${PACK_R.pill}px;cursor:pointer;padding:0;color:inherit;
  border:2.5px solid var(--p3d-ink,#2a1608);background:linear-gradient(180deg,#fff,var(--p3d-paper,#F3E4C4));box-shadow:var(--p3d-lift);}
.pp-eb{flex:1;min-width:0;text-align:center;font-size:${PACK_TEXT.micro}px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--p3d-gold-solid,#A3782B);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pp-art{flex:1 1 0;min-height:0;width:auto;max-width:100%;align-self:center;aspect-ratio:3/4;object-fit:cover;
  border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink,#2a1608);box-shadow:var(--p3d-pera);}
.pp-tr{flex:1 1 0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;font-size:${PACK_TEXT.lead}px;line-height:1.45;}
.pp-tr p{margin:0;}
.pp-tr .is-ai span{color:#0E8FA8;}
.pp-h{margin:${PACK_SPACE.md}px 0 0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;} /* písmo: nadpis */
.pp-sub{font-size:${PACK_TEXT.body}px;opacity:.72;}
.pp-seek{width:100%;margin:${PACK_SPACE.md}px 0 0;height:24px;appearance:none;-webkit-appearance:none;background:none;cursor:pointer;}
.pp-seek::-webkit-slider-runnable-track{height:4px;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,${LAPIS.edge} var(--p),rgba(42,22,8,.14) var(--p));}
.pp-seek::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-6px;border-radius:${PACK_R.pill}px;background:${LAPIS.edge};border:2px solid ${LAPIS.ink};}
.pp-seek::-moz-range-track{height:4px;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,${LAPIS.edge} var(--p),rgba(42,22,8,.14) var(--p));}
.pp-seek::-moz-range-thumb{width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${LAPIS.edge};border:2px solid ${LAPIS.ink};}
.pp-times{display:flex;justify-content:space-between;font-size:${PACK_TEXT.label}px;opacity:.72;font-variant-numeric:tabular-nums;}
.pp-ctrl{display:flex;align-items:center;justify-content:space-between;}
.pp-ctrl .pp-ic{width:48px;height:48px;}
.pp-big{width:72px;height:72px;}
.pp-row{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.sm}px;padding-top:${PACK_SPACE.md}px;}
.pp-langs{display:flex;gap:${PACK_SPACE.xs}px;}
.pp-pill{min-width:40px;height:32px;padding:0 ${PACK_SPACE.md}px;display:inline-grid;place-items:center;border-radius:${PACK_R.pill}px;cursor:pointer;color:inherit;
  border:1.5px solid var(--p3d-gold,#C99A3F);background:var(--p3d-paper-hi,#F9F2E3);font-size:${PACK_TEXT.label}px;font-weight:600;font-family:${FONT_UI};}
.pp-pill.is-on{border-color:${LAPIS.edge};color:${LAPIS.edge};background:rgba(22,48,122,.14);}
.pp-ghost{visibility:hidden;}
.pp-dice{padding:0 ${PACK_SPACE.sm}px;}
`;
