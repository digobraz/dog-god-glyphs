// ── PREHRÁVAČ PODCASTOV (22. 11. 2026) ──────────────────────────────────────────────────────────
// Matej: *„musíme postaviť aj prehrávač na podcasty ako má napr spotify = obrázok 15 s dopredu dozadu a vymyslieť
// ako to bude fungovať ked bude človek v apke alebo ak apku zatvorí“* · *„dá sa na zamknutú obrazovku dať tlačidlo
// náhodný výber hracia kocka … inak by sa prehrávali podcasty postupne … chýba tam tlačítko dozadu a dopredu“*.
// Nákres: plany/nakresy/prehravac-podcastov-2026-11-22/.
//
// JEDEN `<audio>` pre celú appku (nie v zvitku) ⇒ podcast hrá ďalej, keď človek zo zvitku odíde.
//   · MINI = pás 64 px (r14) v šate AINUBIS 3D nad spodným navom: ⏮ ▶ ⏭, len keď niečo počúvaš a nie si v tom zvitku.
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
import { toast } from 'sonner';
import { SysIcon } from '@/components/pack/SysIcon';
import { PACK_R, PACK_SPACE, PACK_TEXT, FONT_TITLE, FONT_UI, PROGRESS_CSS } from '@/components/pack/packTheme';
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3, svetImg } from '@/components/pack/ainubis/3d/zaklad';
import { useSheetSwipe } from '@/components/pack/useSheetSwipe';
import {
  type DemoScroll, podLang, pickText, fmtSec, scrollThumb, saveListen, markScroll, logEvent, useDemoScrolls, useFullScroll,
} from './vaultScrolls';
import { VAULT_CIRCLES } from './circles';
import { VAULT_WORLDS } from './worlds';
import { useT } from '@/i18n/LanguageContext';

type S = {
  z: DemoScroll | null; lang: string; appLang: string;
  playing: boolean; t: number; dur: number; rate: number; shuffle: boolean; full: boolean;
  /** Jazýček stiahnutý dole — na nave ostane len kapsula postupu. */
  tucked: boolean;
  /** Zvitok, ktorého článok je práve otvorený — v ňom mini prehrávač nekreslíme (prehrávač je tam priamo). */
  inView: string | null;
};
let s: S = { z: null, lang: 'sk', appLang: 'sk', playing: false, t: 0, dur: 0, rate: 1, shuffle: false, full: false, tucked: false, inView: null };
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
const POD_LANGS_ORDER = ['sk', 'cs', 'en', 'de'];

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
// Hláška po ťuknutí na kocku (Matej 22. 11.: „po kliknutí napíš že náhodné prehrávanie zapnuté“)
const SHUFFLE_MSG: Record<string, [string, string]> = {
  sk: ['Náhodné prehrávanie zapnuté', 'Náhodné prehrávanie vypnuté'],
  cs: ['Náhodné přehrávání zapnuto', 'Náhodné přehrávání vypnuto'],
  de: ['Zufallswiedergabe an', 'Zufallswiedergabe aus'],
  en: ['Shuffle on', 'Shuffle off'],
};
export function podShuffle() {
  const on = !s.shuffle;
  set({ shuffle: on });
  // „lepšie aplikovať náhodný výber“ (Matej 22. 11.): zapnutá kocka hneď pustí náhodný zvitok, nečaká na koniec
  if (on) podNext();
  const m = SHUFFLE_MSG[s.appLang] || SHUFFLE_MSG.en;
  toast(on ? m[0] : m[1], { id: 'pod-shuffle', duration: 2000, position: 'top-center' });
}
export function podFull(full: boolean) { set({ full }); }
export function podTuck(tucked: boolean) { set({ tucked }); }
const langFor = (z: DemoScroll) => (z.pod[s.lang] ? s.lang : podLang(z, s.appLang));
/** Výber sveta v prehrávači: vypne kocku a pustí prvý zvitok sveta (ďalej ide po poradí). */
export function podWorld(world: string) {
  if (s.shuffle) set({ shuffle: false });
  if (s.z?.world === world) return;
  const z = list.find((x) => x.world === world && hasPod(x));
  const l = z && langFor(z);
  if (z && l) load(z, l);
}
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

// ── ikonky ovládania (funkčné chrome prehrávača); kocka = samolepka z továrne `kocka.webp` (plany/ikonky/gen-kocka.mjs) ──
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
      {show && !p.tucked && <Jazycek />}
      {show && p.tucked && (
        <button type="button" className="pp-cap pp-cap--tuck" aria-label={x.t} onClick={() => podTuck(false)}>
          <i style={{ transform: `scaleX(${p.dur ? p.t / p.dur : 0})` }} />
        </button>
      )}
      {p.full && <PodFull />}
    </>
  );
}

/** JAZÝČEK (Matej 22. 11. 2026, nákres plany/nakresy/prehravac-podcastov-2026-11-22/jazycek.html kolo 7): tmavý pás
 *  vykukuje spoza spodného navu, packa ho prekrýva. Hore oranžová kapsula postupu, vľavo ikonka sveta + celý názov,
 *  vpravo play, pod nimi čas a zvyšok. Ťuk = celá obrazovka · stiahnuť dole = schová sa (ostane kapsula na nave).
 *  Leží POD navom (z 39 < pás navu 40), takže menu JA aj panel `+` idú nad neho (Matej: „ten drop byť nad tým jazýčkom“). */
function Jazycek() {
  const p = usePod();
  const z = p.z!;
  const x = pickText(z, p.appLang);
  const { handle, drag } = useSheetSwipe(() => podTuck(true));
  return (
    <div className="pp-tab" role="region" aria-label={x.t} {...handle} onClick={() => { if (!drag) podFull(true); }}
      style={{ ...handle.style, ...(drag ? { transform: `translate(-50%, ${drag}px)`, transition: 'none' } : null) }}>
      <span className="pp-cap"><i style={{ transform: `scaleX(${p.dur ? p.t / p.dur : 0})` }} /></span>
      <div className="pp-tab-row">
        <img src={svetImg(z.world)} alt="" />
        <b>{x.t}</b>
        <button type="button" className="pp-play pp-play--s" aria-label={p.playing ? 'Pause' : 'Play'} onClick={(e) => { e.stopPropagation(); podToggle(); }}>
          <Svg d={p.playing ? PAUSE : PLAY} fill size={14} />
        </button>
      </div>
      <span className="pp-tab-t">{fmtSec(Math.floor(p.t))}</span>
      <span className="pp-tab-t pp-tab-t--r">−{fmtSec(Math.max(0, Math.floor(p.dur - p.t)))}</span>
    </div>
  );
}

const SHUFFLE_LABEL: Record<string, string> = { sk: 'Náhodne', cs: 'Náhodně', de: 'Zufällig', en: 'Shuffle' };
/** CELÁ obrazovka — šípka dole, Esc alebo stiahnutie za vrch.
 *  Matej 22. 11.: rad svetov (vybraný s názvom, ostatné len ikonka) + kocka „Náhodne“ v tom istom rade,
 *  jazyk v roletke hore pri prepise, šípka späť výraznejšia. */
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
  const t = useT();
  const all = useDemoScrolls();
  const [langMenu, setLangMenu] = useState(false);
  const x = pickText(z, p.appLang);
  const lines = z.pod[p.lang]?.tr || [];
  const pct = p.dur ? (p.t / p.dur) * 100 : 0;
  const worlds = VAULT_WORLDS.filter((w) => all.some((a) => a.world === w.key && hasPod(a)));
  const wName = (key: string) => { const k = `pack.ainubis.world.${key}`; const v = t(k); return v === k ? (VAULT_WORLDS.find((w) => w.key === key)?.en || key) : v; };
  const langs = POD_LANGS_ORDER.filter((l) => z.pod[l]);
  return createPortal(
    <div className="pp-full" role="dialog" aria-modal="true" aria-label={x.t} style={sheetStyle}>
      <div className="pp-top" {...handle}>
        <button type="button" className="pp-down" aria-label="Close" onClick={close}><Svg d="M6 9l6 6 6-6" size={26} /></button>
        <span className="pp-tools">
          <button type="button" className="pp-pill" onClick={podRate}>{String(p.rate).replace('.', ',')}×</button>
          <span className="pp-dd">
            <button type="button" className="pp-pill" aria-haspopup="listbox" aria-expanded={langMenu} onClick={() => setLangMenu(!langMenu)}>
              {POD_TAG[p.lang] || p.lang.toUpperCase()} <Svg d="M6 9l6 6 6-6" size={14} />
            </button>
            {langMenu && (
              <span className="pp-menu" role="listbox">
                {langs.map((l) => (
                  <button key={l} type="button" role="option" aria-selected={l === p.lang} className={`pp-pill${l === p.lang ? ' is-on' : ''}`}
                    onClick={() => { podLangTo(l); setLangMenu(false); }}>{POD_TAG[l]}</button>
                ))}
              </span>
            )}
          </span>
          {lines.length > 0 && <button type="button" className={`pp-pill${tr ? ' is-on' : ''}`} aria-pressed={tr} onClick={() => setTr(!tr)}>Aa</button>}
        </span>
      </div>
      {tr ? (
        <div className="pp-tr">
          {lines.map((r, i) => <p key={i}>{r.s === 'A' ? <b className="is-ai"><span>AI</span>NUBIS</b> : <b>Matej</b>} {r.t}</p>)}
        </div>
      ) : (z.img ? <img className="pp-art" src={z.img} alt="" /> : <div className="pp-art" />)}
      <h2 className="pp-h">{x.t}</h2>
      <span className="pp-sub">{circleOf(z, p.appLang)} · {z.n} / {z.total}</span>
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
      {/* ČO POČÚVAM: kocka (náhodne zo všetkých) alebo svet. Vybraný kus nesie aj meno, ostatné len ikonku. */}
      <div className="pp-scope" role="radiogroup">
        <button type="button" role="radio" aria-checked={p.shuffle} className={`pp-chip${p.shuffle ? ' is-on' : ''}`} onClick={podShuffle}
          aria-label={SHUFFLE_LABEL[p.appLang] || SHUFFLE_LABEL.en}>
          <SysIcon name="kocka" size={26} />{p.shuffle && <b>{SHUFFLE_LABEL[p.appLang] || SHUFFLE_LABEL.en}</b>}
        </button>
        {worlds.map((w) => {
          const on = !p.shuffle && z.world === w.key;
          return (
            <button key={w.key} type="button" role="radio" aria-checked={on} className={`pp-chip${on ? ' is-on' : ''}`} onClick={() => podWorld(w.key)} aria-label={wName(w.key)}>
              <img src={svetImg(w.key)} alt="" />{on && <b>{wName(w.key)}</b>}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

// Šat AINUBIS 3D (ainubis/3d/zaklad.ts: `M3` karty, `b3` tlačidlá) — podcasty hovorí AINUBIS, prehrávač je jeho povrch
// (Matej 22. 11.: „nebolo by to lepšie v tmavom - ainubis je predsa tmavý … prerobiť to všade na tmavo“).
// Play = jeho CTA (zlato-oranžové `or`), vybraná voľba = cyan (`cy`), ostatné tlačidlá = tmavé (`nt`). Lapis tu nie je.
const POD_CSS = `${PROGRESS_CSS}
${b3('.pp-play', 'or', `${PACK_R.pill}px`, 4)}
${b3('.pp-pill', 'nt', `${PACK_R.pill}px`, 3)}
${b3('.pp-pill.is-on', 'cy', `${PACK_R.pill}px`, 3)}
${b3('.pp-down', 'nt', `${PACK_R.pill}px`, 3)}
${b3('.pp-chip', 'nt', `${PACK_R.pill}px`, 3)}
${b3('.pp-chip.is-on', 'cy', `${PACK_R.pill}px`, 3)}
.pp-tab{position:fixed;z-index:39;left:var(--pack-nav-cx,50vw);transform:translateX(-50%);
  width:calc(var(--pack-nav-half,171px) * 2 - ${PACK_SPACE.xl}px);max-width:calc(100vw - ${PACK_SPACE.xxl + PACK_SPACE.xl}px);
  bottom:calc(var(--pack-nav-bottom,${PACK_SPACE.lg}px) + var(--pack-nav-h,64px) - ${PACK_SPACE.lg}px);height:84px;cursor:pointer;
  ${M3.card}border-bottom:0;border-radius:${PACK_R.card}px ${PACK_R.card}px 0 0;color:${A.ink};font-family:${FONT_UI};transition:transform .24s ease;}
.pp-tab-row{display:grid;grid-template-columns:32px minmax(0,1fr) 32px;align-items:center;gap:${PACK_SPACE.md}px;height:40px;padding:${PACK_SPACE.sm}px ${PACK_SPACE.sm}px 0;}
.pp-tab-row img{width:30px;height:30px;object-fit:contain;}
/* line-height 1.3: pri 1 orezal overflow:hidden spodnú paličku „p“, „y“, „j“ (Matej 22. 11.) */
.pp-tab-row b{font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} /* písmo: nadpis */
.pp-play.pp-play--s{width:32px;height:32px;}
.pp-tab-t{position:absolute;left:52px;bottom:${PACK_SPACE.xl}px;font-size:${PACK_TEXT.label}px;color:${A.inkFaint};font-variant-numeric:tabular-nums;}
.pp-tab-t--r{left:auto;right:52px;}
/* kapsula postupu: na hornej hrane jazýčka, výplň = AINUBISova CTA (Matej: „progres pole dajme oranžovou“) */
.pp-cap{position:absolute;left:${PACK_SPACE.xl}px;right:${PACK_SPACE.xl}px;top:-8px;height:10px;display:block;overflow:hidden;padding:0;
  border-radius:${PACK_R.pill}px;background:${A.bgDeep};border:2px solid ${A.edge};box-shadow:var(--ai-inset);}
.pp-cap i{display:block;width:100%;height:100%;border-radius:${PACK_R.pill}px;transform-origin:left;background:${A.ctaGrad};box-shadow:${A.ctaShadow};}
.pp-cap--tuck{position:fixed;z-index:39;top:auto;cursor:pointer;left:calc(var(--pack-nav-cx,50vw) - var(--pack-nav-half,171px) + ${PACK_SPACE.xxl}px);
  right:auto;width:calc(var(--pack-nav-half,171px) * 2 - ${PACK_SPACE.xxl * 2}px);bottom:calc(var(--pack-nav-bottom,${PACK_SPACE.lg}px) + var(--pack-nav-h,64px) - 2px);}
.pp-ic{flex:none;display:grid;place-items:center;width:40px;height:40px;border:0;padding:0;background:none;color:${A.ink};cursor:pointer;}
.pp-play{flex:none;display:grid;place-items:center;width:44px;height:44px;padding:0;cursor:pointer;}
.pp-skip{position:relative;display:grid;place-items:center;}
.pp-skip b{position:absolute;font-size:${PACK_TEXT.micro}px;font-weight:600;padding-top:${PACK_SPACE.xs}px;}
.pp-full{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;
  padding:calc(env(safe-area-inset-top) + ${PACK_SPACE.lg}px) ${PACK_SPACE.xl}px calc(env(safe-area-inset-bottom) + ${PACK_SPACE.xl}px);
  background:${A.surface};color:${A.ink};font-family:${FONT_UI};animation:pp-up .24s ease;}
@keyframes pp-up{from{transform:translateY(100%)}to{transform:none}}
.pp-top{display:flex;align-items:center;justify-content:space-between;gap:${PACK_SPACE.sm}px;padding-bottom:${PACK_SPACE.sm}px;}
.pp-down{width:44px;height:44px;flex:none;display:grid;place-items:center;cursor:pointer;padding:0;}
/* šípka späť: Matej 22. 11. „je nejaké bledé“ — plný inkoust a cyan lem, nie tmavá na tmavom */
.pp-full .pp-down{color:${A.ink};border-color:${A.cyan};box-shadow:0 0 0 2px ${A.bgDeep},0 0 16px -4px ${A.cyan};}
.pp-down svg{stroke-width:3;}
.pp-tools{display:flex;align-items:center;gap:${PACK_SPACE.sm}px;}
.pp-dd{position:relative;}
.pp-dd .pp-pill{gap:${PACK_SPACE.xs}px;display:inline-flex;}
.pp-menu{position:absolute;right:0;top:calc(100% + ${PACK_SPACE.sm}px);z-index:2;display:flex;flex-direction:column;gap:${PACK_SPACE.sm}px;padding:${PACK_SPACE.sm}px;${M3.bub}}
.pp-scope{display:flex;align-items:center;justify-content:center;gap:${PACK_SPACE.sm}px;padding-top:${PACK_SPACE.lg}px;flex-wrap:nowrap;}
.pp-chip{height:44px;min-width:44px;padding:0 ${PACK_SPACE.sm}px;display:inline-flex;align-items:center;justify-content:center;gap:${PACK_SPACE.sm}px;cursor:pointer;flex:none;}
.pp-chip.is-on{padding:0 ${PACK_SPACE.md}px 0 ${PACK_SPACE.sm}px;flex:0 1 auto;min-width:0;}
.pp-chip img{width:28px;height:28px;object-fit:contain;flex:none;}
.pp-chip b{font-size:${PACK_TEXT.body}px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
.pp-art{flex:1 1 0;min-height:0;width:auto;max-width:100%;align-self:center;aspect-ratio:3/4;object-fit:cover;${M3.card}border-radius:${PACK_R.card}px;}
.pp-tr{flex:1 1 0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:${PACK_SPACE.md}px;padding:${PACK_SPACE.lg}px;font-size:${PACK_TEXT.lead}px;line-height:1.45;color:${A.inkDim};${M3.box}}
.pp-tr p{margin:0;}
.pp-tr b{color:${A.ink};}
.pp-tr .is-ai span{color:${A.cyan};}
.pp-h{margin:${PACK_SPACE.md}px 0 0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;color:${A.ink};} /* písmo: nadpis */
.pp-sub{font-size:${PACK_TEXT.body}px;color:${A.inkFaint};}
.pp-seek{width:100%;margin:${PACK_SPACE.md}px 0 0;height:24px;appearance:none;-webkit-appearance:none;background:none;cursor:pointer;}
.pp-seek::-webkit-slider-runnable-track{height:4px;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,${A.cyan} var(--p),${A.edge} var(--p));}
.pp-seek::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-6px;border-radius:${PACK_R.pill}px;background:${A.cyan};border:2px solid ${A.ink};box-shadow:0 0 12px ${A.cyan};}
.pp-seek::-moz-range-track{height:4px;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,${A.cyan} var(--p),${A.edge} var(--p));}
.pp-seek::-moz-range-thumb{width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${A.cyan};border:2px solid ${A.ink};}
.pp-times{display:flex;justify-content:space-between;font-size:${PACK_TEXT.label}px;color:${A.inkFaint};font-variant-numeric:tabular-nums;}
.pp-ctrl{display:flex;align-items:center;justify-content:space-between;}
.pp-ctrl .pp-ic{width:48px;height:48px;}
.pp-big{width:72px;height:72px;}
.pp-pill{min-width:40px;height:32px;padding:0 ${PACK_SPACE.md}px;display:inline-grid;place-items:center;cursor:pointer;font-size:${PACK_TEXT.label}px;font-weight:600;font-family:${FONT_UI};}
`;
