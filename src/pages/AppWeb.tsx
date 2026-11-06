/**
 * /app — NOVÝ WEB = výkladná skriňa FREE appky ako HRY so psom (6. 11. 2026).
 *
 * Postavené podľa nákresu v2 `plany/nakres-web-appka-2026-11-06/index.html`,
 * v3 = Matejove pripomienky k prvej stavbe (6. 11.): nadpis na dva riadky so šikmým
 * „psom", hlavička bez čiary prilepená ako sklo, levitujúce odznaky s vysvetlivkou,
 * „Ži psí život" s freskou, Instagram + heroglyf v jednej sekcii, funkcie na rozklik,
 * štyri osi odznakov, živý AINUBIS v telefóne, poďakovanie psom, heroglyf ako vstup,
 * FAQ v dvoch stĺpcoch, Za hrou s videom a živá planétka z `/` na konci.
 *
 * `/` sa NEMENÍ — homepage ostáva film (OnePage), kým Matej výslovne nepovie inak.
 * Stránka je zatiaľ noindex a nikde neprelinkovaná.
 *
 *  · CSS = `appWeb/appWeb.css`, celé pod `.aw` (výrez brandu + CSS nákresu + v3).
 *  · Texty = `appWeb/copy.ts` (COPY z nákresu, COPY3 ich prebíja; ostatné jazyky → EN).
 *  · `?varianty` zobrazí poznámky nákresu a prepínač pozadia; `?bg=1..4` ho vyberie.
 *    (`?nakres` NIE — ten v appke otvára editor nákresov a stránku prekryje.)
 *  · Čísla psy/ľudia/krajiny sú živé z `get-pack-stats`.
 */
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Seo } from '@/components/Seo';
import { HandPaw, HandForward, HandHeart, HandClipboard, HandShare, HandStar, HandArrowLeft } from '@/components/pack/HandIcons';
import AI_HEAD from '@/assets/ainubis-head.webp';
import { AiFlow } from './appWeb/AiFlow';
import { AiScrolls, AiPods, AiChat } from './appWeb/AiLearn';
import { AiBrain } from './appWeb/AiBrain';
import { STAGE_CSS } from '@/components/pack/packTheme';
import { VAULT_COUNTS } from '@/components/pack/vault/vaultRegister';
import { GodsGridLab } from '@/components/gods/GodsGridLab';
import { useLang, useT } from '@/i18n/LanguageContext';
import { getPackStats } from '@/lib/sharedFetch';
import { gridFetch, GRID_URL_ALL } from '@/lib/earlyFetch';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { COPY, COPY3, NOTES, type Lang2 } from './appWeb/copy';
import { IgMock, IgIcon } from './appWeb/IgMock';
import { AlbaCount, AlbaTrio, GlyphZones } from './appWeb/AlbaGlyph';
import { APP_CHIPS, APPS_TYPE_CSS } from '@/components/lab/filmAppsType';
import './appWeb/appWeb.css';

const A = '/web-app';

const CAROUSEL: [string, string][] = [['map', '11-vretenica-mapa'], ['profile', 'B-profil-top'], ['dogid', '9-moja-svorka'], ['ainubis', '8-ainubis'], ['feed', 'feed']];

const SERVANT_YEARS = [1, 4, 9, 14, 19, 24, 29, 34];
/** Pásma UČŇA = % VAULTU (schválené 6. 11., `plany/nakresy/pecat-odznaky-2026-11-06`). */
const UCEN_PCT = ['1.', '2 %', '5 %', '10 %', '20 %', '30 %', '45 %', '60 %', '80 %', '100 %'];

/** Štyri cesty v sekcii Odznaky — `mine` = úroveň vzorového psíčkara, tá istá ako v levitujúcich odznakoch v hero. */
const PATHS = [
  { ax: 'ax0', mine: 'dogyptan-2.svg', lvl: 't2' },
  { ax: 'ax1', mine: 'servant-2.webp', lvl: 'my1' },
  { ax: 'ax2', mine: 'pilgrim-3.webp', lvl: 'my2' },
  { ax: 'ax3', mine: 'ucen-4.webp', lvl: 'my3' },
];

/** Ikonky funkcií = lesklé samolepky z Kie (`public/web-app/ikony/*.webp`, výber Mateja 6. 11. z nákresu
 *  plany/nakresy/ikony-funkcii-2026-11-06). Odrážky `li` sa zatiaľ nekreslia — doladíme ich neskôr. */
type B = [Record<Lang2, string>, boolean?];
const b = (en: string, sk: string, soon = false): B => [{ en, sk }, soon];
const FEATS: { h: Record<Lang2, string>; p: string; cls?: string; ic: string; li: B[] }[] = [
  { h: { en: 'Trails', sk: 'Výlety' }, p: 'f1', cls: 'trip', ic: 'vylety',
    li: [b('Add a trip', 'Pridaj výlet'), b('Rate it in paws', 'Ohodnoť labkami'), b('Save it for later', 'Ulož si ho na neskôr'), b('Collect km and points', 'Zbieraj km a body'), b('Route to your phone', 'Trasa do mobilu')] },
  { h: { en: 'Map', sk: 'Mapa' }, p: 'f8', ic: 'mapa',
    li: [b('Events and group walks', 'Podujatia a spoločné výlety'), b('Dog-friendly places', 'Miesta, kam smie pes'), b('Services for dog people', 'Služby pre psíčkarov'), b('Vets and emergencies', 'Ordinácie a pohotovosti')] },
  { h: { en: 'DOG ID', sk: 'DOG ID' }, p: 'f2', ic: 'dogid',
    li: [b('Your dog’s ID card', 'Preukaz psa'), b('Personality quiz', 'Kvíz povahy'), b('Vaccines and health', 'Očkovanie a zdravie'), b('A will: who takes care of them', 'Závet: kto sa o neho postará')] },
  { h: { en: 'Daily log', sk: 'Zápis dňa' }, p: 'f3', ic: 'zapis',
    li: [b('One tap a day', 'Jeden ťuk denne'), b('A streak that keeps going', 'Séria, ktorá beží'), b('Diary and photos', 'Denník a fotky'), b('A chronicle of your life together', 'Kronika vášho života')] },
  { h: { en: 'AINUBIS', sk: 'AINUBIS' }, p: 'f4', ic: 'ainubis',
    li: [b('7 worlds of dog knowledge', '7 svetov poznania o psoch'), b('Scrolls in plain language', 'Zvitky v ľudskej reči'), b('A chat that knows your dog', 'Chat, ktorý pozná tvojho psa'), b('Verified sources', 'Overené zdroje')] },
  { h: { en: 'Sniffer', sk: 'Sniffer' }, p: 'f5', ic: 'sniffer',
    li: [b('Find a walking buddy', 'Nájdi parťáka na prechádzky'), b('Dog profile with photos', 'Profil psa s fotkami'), b('Swipe, match, walk', 'Swipe, zhoda, prechádzka')] },
  { h: { en: 'SOS', sk: 'SOS' }, p: 'f6', cls: 'sos', ic: 'sos',
    li: [b('Lost dog: the pack around you knows', 'Stratený pes: vie o tom svorka okolo'), b('Poster in one tap', 'Leták jedným ťukom'), b('Emergency vets', 'Pohotovosť'), b('First aid', 'Prvá pomoc', true), b('Report cruelty', 'Nahlás týranie', true)] },
  { h: { en: 'Feed', sk: 'Feed' }, p: 'f7', ic: 'feed',
    li: [b('Stories from the pack', 'Príbehy zo svorky'), b('Paws and comments', 'Labky a komentáre'), b('Tag your buddies', 'Označ parťákov')] },
];
const SOON: { h: Record<Lang2, string>; p: Record<Lang2, string>; ic: string }[] = [
  { h: { en: 'Merch', sk: 'Merch' }, p: { en: 'Things for you and your dog, from the pack.', sk: 'Veci pre teba a psa, zo svorky.' }, ic: 'merch' },
  { h: { en: 'GPS collar', sk: 'GPS obojok' }, p: { en: 'Know where they are. Walks log themselves.', sk: 'Vieš, kde je. Prechádzky sa zapíšu samy.' }, ic: 'gps' },
  { h: { en: 'Our research', sk: 'Naše výskumy' }, p: { en: 'Studies we fund, so dogs live longer.', sk: 'Výskumy, ktoré platíme my — aby psi žili dlhšie.' }, ic: 'vyskumy' },
  { h: { en: 'New-generation shelters', sk: 'Útulky novej generácie' }, p: { en: 'Shelters dogs leave faster — and happier.', sk: 'Útulky, z ktorých psi odchádzajú rýchlejšie a šťastnejší.' }, ic: 'centra' },
];

function Phone({ src }: { src: string }) {
  return (
    <div className="phone">
      <img className="fr" src={`${A}/phone.svg`} alt="" />
      <div className="scr"><img src={`${A}/snimky/${src}.jpg`} alt="" loading="lazy" /></div>
    </div>
  );
}

/** Telefón s náklonom za myšou. Neotvára sa (Matej 6. 11.: „mockupy nechaj len tak bez aktivity“);
 *  v karuseli ťuk na bočný telefón len prepne. */
function Tilt({ set, src, onOpen, className = '' }: { set: string; src: string; onOpen?: (k: string) => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--ry', `${x * 16}deg`);
    ref.current.style.setProperty('--rx', `${-y * 12}deg`);
  };
  const leave = () => { ref.current?.style.setProperty('--ry', '0deg'); ref.current?.style.setProperty('--rx', '0deg'); };
  return (
    <div className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave} onClick={onOpen ? () => onOpen(set) : undefined}>
      <div ref={ref} className="tl"><Phone src={src} /></div>
    </div>
  );
}

function Counter({ to, run, suffix }: { to: number; run: boolean; suffix?: ReactNode }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now(), D = 1200;
    let raf = 0;
    const f = (t: number) => {
      const p = Math.min(1, (t - t0) / D);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{v.toLocaleString('sk-SK')}{suffix}</>;
}

/** Sleduje, či je prvok pri obrazovke (raz = `once`, inak priebežne). */
function useNear<T extends HTMLElement>(margin = '0px', once = true) {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (once) { if (e.isIntersecting) { setNear(true); io.disconnect(); } } else setNear(e.isIntersecting);
    }, { rootMargin: margin, threshold: once ? 0.15 : 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [margin, once]);
  return [ref, near] as const;
}

/** Blok, ktorý sa vynorí pri scrolle (`.rv` → `.in`). */
const VERBS = [HandForward, HandHeart, HandClipboard, HandShare, HandStar, HandPaw];

function Rv({ as = 'div', d = 0, className = '', children }: { as?: 'div' | 'p' | 'details'; d?: number; className?: string; children: ReactNode }) {
  const [ref, seen] = useNear<HTMLDivElement>();
  const Tag = as as 'div';
  return (
    <Tag ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ ['--d' as string]: d } as CSSProperties}>
      {children}
    </Tag>
  );
}

const AppleSvg = () => <svg viewBox="0 0 24 24"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9C5.7 6.8 4 7.8 3.1 9.4c-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.8 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.5 0 2.4-1.3 3.3-2.7 1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-3.3-4.7zM13.8 4.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" /></svg>;
const PlaySvg = () => <svg viewBox="0 0 24 24"><path d="M3.6 1.8 13.5 12l-9.9 10.2c-.4-.2-.6-.7-.6-1.2V3c0-.5.2-1 .6-1.2zm11 11.3 2.6 2.6-11.7 6.7 9.1-9.3zm3.9-3.9 3 1.7c.9.5.9 1.8 0 2.3l-3 1.7-2.9-2.9 2.9-2.8zM5.5 1.6l11.7 6.7-2.6 2.6-9.1-9.3z" /></svg>;

/** Odkazy do obchodov — doplníme, keď bude appka verejne v obchodoch. */
const STORE_IOS = '#';
const STORE_PLAY = '#';

function Stores() {
  return (
    <div className="stores">
      <a className="store" href={STORE_IOS}><AppleSvg /><span><small>Download on the</small><b>App Store</b></span></a>
      <a className="store" href={STORE_PLAY}><PlaySvg /><span><small>GET IT ON</small><b>Google Play</b></span></a>
    </div>
  );
}

/** Do živej appky v telefóne sa vstrekne štýl, ktorý skryje predajné prvky /magnet
 *  (kartu a lištu s cenou €11 — appka je od 5. 11. zadarmo) a vývojárske tlačidlá. */

/** Vodorovný pás snímok (blok poďakovania): natívny scroll so snap — prst, trackpad aj šípky; pilulky hore = poloha. */
function GoodSlides({ labels, children }: { labels: string[]; children: ReactNode }) {
  const tr = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  /* snímka je užšia než pás (ďalšia vykukuje „na rade“), krok sa preto berie z polohy snímky, nie zo šírky pásu */
  const kids = () => [...(tr.current?.children ?? [])] as HTMLElement[];
  const go = (i: number) => { const el = tr.current, k = kids()[i]; if (el && k) el.scrollTo({ left: k.offsetLeft - kids()[0].offsetLeft, behavior: 'smooth' }); };
  const onScroll = () => {
    const el = tr.current; if (!el) return;
    const x0 = kids()[0]?.offsetLeft ?? 0;
    let best = 0; kids().forEach((k, i) => { if (Math.abs(k.offsetLeft - x0 - el.scrollLeft) < Math.abs(kids()[best].offsetLeft - x0 - el.scrollLeft)) best = i; });
    setAt(best);
  };
  return (
    <div className="gs">
      <div className="gs-tabs" role="tablist">
        {labels.map((l, i) => <button key={l} role="tab" aria-selected={at === i} className={at === i ? 'on' : ''} onClick={() => go(i)}>{l}</button>)}
      </div>
      <div className="gs-tr" ref={tr} onScroll={onScroll}>{children}</div>
      <button className="sl-btn l" aria-label="Späť" disabled={at === 0} onClick={() => go(at - 1)}><HandArrowLeft size={18} /></button>
      <button className="sl-btn r" aria-label="Ďalej" disabled={at === labels.length - 1} onClick={() => go(at + 1)}><HandArrowLeft size={18} style={{ transform: 'scaleX(-1)' }} /></button>
    </div>
  );
}

/** PÁS SVORKY (Matej 6. 11.: „progres bar s tvárami psov, ako už máme, aj meno posledného“) — pokojná verzia
 *  pásu z /onepage (tam ho riadi kamera filmu): Hekthor #1 · rovnomerne vybrané psy z celej svorky · posledný pes
 *  s menom a číslom · prerušovaná cesta k 1M. Dáta = ten istý feed steny (`get-grid-dogs`), fotky ako náhľad 180 px. */
type TrailDog = { n: number; name: string; u: string };
const TRAIL_MID = 14;
const cldThumb = (u: string) => u.replace('/upload/', '/upload/c_fill,g_auto,w_180,h_180,q_auto,f_auto/');
function DogTrail({ goal }: { goal: string }) {
  const [ref, near] = useNear<HTMLDivElement>('400px');
  const [pack, setPack] = useState<TrailDog[]>([]);
  useEffect(() => {
    if (!near) return;
    let alive = true;
    gridFetch(GRID_URL_ALL).then((d: unknown[]) => {
      if (!alive || !Array.isArray(d)) return;
      type Row = { pack_number?: number | null; dog_name?: string; cloudinary_main_url?: string | null };
      setPack((d as Row[]).filter((r) => (r.pack_number ?? 0) > 0 && r.cloudinary_main_url)
        .sort((a, b) => (a.pack_number ?? 0) - (b.pack_number ?? 0))
        .map((r) => ({ n: r.pack_number ?? 0, name: r.dog_name ?? '', u: cldThumb(r.cloudinary_main_url as string) })));
    }).catch(() => { /* pás je ozdoba, číslo nad ním stojí aj bez neho */ });
    return () => { alive = false; };
  }, [near]);
  const last = pack[pack.length - 1];
  const mid = pack.length > 3 ? Array.from({ length: Math.min(TRAIL_MID, pack.length - 2) }, (_, i) => pack[Math.round(1 + ((i + 1) * (pack.length - 2)) / (Math.min(TRAIL_MID, pack.length - 2) + 1))]) : [];
  return (
    <div className="trail" ref={ref}>
      <div className="trail-row">
        <span className="trail-end"><img src="/images/hektor-grid.webp" alt="" /><em>Hekthor <b>#1</b></em></span>
        <span className="trail-mid">{mid.map((d) => <img key={d.n} src={d.u} alt="" />)}</span>
        {last && <span className="trail-end trail-last"><img src={last.u} alt="" /><em>{last.name} <b>#{last.n}</b></em></span>}
        <span className="trail-road" aria-hidden><i /></span>
        <span className="trail-goal"><b>1M</b><em>{goal}</em></span>
      </div>
    </div>
  );
}

/** Živá planétka z `/` — montuje sa až pri obrazovke a mimo nej stojí. */
function LivePlanet() {
  const [mountRef, near] = useNear<HTMLDivElement>('600px');
  const [visRef, vis] = useNear<HTMLElement>('0px', false);
  return (
    <div ref={mountRef}>
      <section className="planet-live theme-light" ref={visRef}>
        {near && <GodsGridLab embedded paused={!vis} planetAnywhere />}
        {/* odkazy do obchodov sa presťahovali z bloku POTREBUJEME ŤA sem, vľavo dole (Matej 6. 11.) */}
        <div className="planet-stores"><Stores /></div>
      </section>
    </div>
  );
}

export default function AppWeb() {
  const { lang, setLang } = useLang();
  const t = useT();
  const L: Lang2 = lang === 'sk' ? 'sk' : 'en';
  const c = (k: string) => COPY3[k]?.[L] ?? COPY[k]?.[L] ?? '';
  const qs = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), []);
  const nakres = qs.has('varianty');
  const Note = ({ k, flag }: { k: string; flag?: boolean }) => (nakres ? <span className={`note${flag ? ' flag' : ''}`}>{NOTES[k]}</span> : null);

  /* pozadie — varianty v štýle MysteryHike (matné sklo, perleť, heroglyfy) */
  const [bg, setBg] = useState(() => (/^[1-4]$/.test(qs.get('bg') ?? '') ? qs.get('bg')! : '1'));
  /* dlaždica pod ikonkami funkcií — skúšame lapis aj papyrus (Matej 6. 11.) */
  const [openFeat, setOpenFeat] = useState<number | null>(null);
  /* stĺpce mriežky funkcií (CSS: 4 od 900 px, inak 2) — posun radu pri otvorenej karte */
  const [fcols, setFcols] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches ? 4 : 2));
  useEffect(() => {
    const m = window.matchMedia('(min-width: 900px)');
    const f = () => { setFcols(m.matches ? 4 : 2); setOpenFeat(null); };
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  /** strana stĺpca: posledná karta v rade vysúva doľava */
  const featSide = (i: number) => (i % fcols === fcols - 1 ? 'l' : 'r');
  /** posun karty i, keď je otvorená iná karta v tom istom rade (o šírku karty + medzeru) → trieda */
  const featShift = (i: number) => {
    if (openFeat === null || openFeat === i || Math.floor(openFeat / fcols) !== Math.floor(i / fcols)) return '';
    if (featSide(openFeat) === 'r') return i > openFeat ? ' sh-r' : '';
    return i < openFeat ? ' sh-l' : '';
  };
  const [tile, setTile] = useState(() => (qs.get('tile') === 'papyrus' ? 'papyrus' : 'lapis'));

  /* živé čísla */
  const [stats, setStats] = useState<{ dogs: number; people: number; countries: number } | null>(null);
  useEffect(() => {
    getPackStats<{ dogs?: number; total?: number; people?: number; topCountries?: { country: string }[] }>()
      .then((s) => setStats({ dogs: s.dogs ?? s.total ?? 0, people: s.people ?? 0, countries: s.topCountries?.length ?? 0 }))
      .catch(() => setStats(null));
  }, []);
  const dogs = stats?.dogs || 135;

  /* hlavička — priesvitná, po scrolle sklo */
  const [stuck, setStuck] = useState(false);
  const [mbar, setMbar] = useState(false);
  useEffect(() => {
    const f = () => { setStuck(window.scrollY > 24); setMbar(window.scrollY > 600); };
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);

  /* karusel */
  const [ci, setCi] = useState(0);
  const hov = useRef(false);
  useEffect(() => {
    const id = setInterval(() => { if (!hov.current) setCi((i) => (i + 1) % CAROUSEL.length); }, 4200);
    return () => clearInterval(id);
  }, []);
  const sx = useRef<number | null>(null);
  const pos = (i: number) => {
    const n = CAROUSEL.length;
    return i === ci ? 'cur' : i === (ci - 1 + n) % n ? 'prev' : i === (ci + 1) % n ? 'next' : 'off';
  };

  /* funkcie — na dotyk sa karta rozbalí */
  const [vOn, setVOn] = useState<number | null>(null);

  /* odznaky */
  const [ax, setAx] = useState<number | null>(null);

  /* ťuk na svet v lieviku doroluje k zvitkom */
  const scrollsRef = useRef<HTMLDivElement>(null);
  const pickWorld = () => { scrollsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const [ucOn, setUcOn] = useState(3);
  /* mozog Učňa: kým sa nikto nedotkne odznaku, prechádza úrovne sám (1 → 10 → znova) */
  const ucTouched = useRef(false);
  const [ucLive, setUcLive] = useState<number | null>(null);
  useEffect(() => {
    const id = setInterval(() => { if (!ucTouched.current) setUcOn((i) => (i + 1) % UCEN_PCT.length); }, 2600);
    return () => clearInterval(id);
  }, []);
  const i18nPct = (p: string) => (p === '1.' ? c('uc_first') : `${p} ${c('uc_vault')}`);
  /* hlavička nad tmavou sekciou AINUBIS tmavne (Matej 6. 11.: „header sa pri tejto sekcii zmení na tmavý, s bledým logom“) */
  const aiSecRef = useRef<HTMLElement>(null);
  const [darkHead, setDarkHead] = useState(false);
  const [onPlanet, setOnPlanet] = useState(false);
  useEffect(() => {
    const f = () => {
      const r = aiSecRef.current?.getBoundingClientRect(); setDarkHead(!!r && r.top < 60 && r.bottom > 60);
      /* posledná sekcia (planétka) je ukotvená na celú obrazovku ako na LIVE `/` — hlavička jej ustúpi */
      const pl = document.querySelector('.aw .planet-live')?.getBoundingClientRect(); setOnPlanet(!!pl && pl.top < innerHeight * 0.35);
    };
    f(); addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);
  const vault = Object.values(VAULT_COUNTS);
  const vScrolls = vault.reduce((s, w) => s + w.scrolls, 0);
  const vCircles = vault.reduce((s, w) => s + w.circles, 0);

  /* Za hrou — text na rozklik */
  const [loreOpen, setLoreOpen] = useState(false);

  const [proofRun, setProofRun] = useState(false);
  useEffect(() => { if (stats) setProofRun(true); }, [stats]);
  useEffect(() => { const t = setTimeout(() => setProofRun(true), 1500); return () => clearTimeout(t); }, []);

  /* sekcia mimo obrazovky = jej nekonečné animácie stoja (.idle) · perleť pod stránkou sa mení podľa sekcie
     v strede okna (data-pz 0–2, prelínanie troch vrstiev cez opacity) — Matej 6. 11.: „strašne to seká“
     a „perleť by sa mala meniť, nie furt tá istá“. Bez Reactu, aby scroll neprekresľoval strom. */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const secs = [...root.querySelectorAll<HTMLElement>(':scope > section')];
    const idle = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('idle', !e.isIntersecting)), { rootMargin: '100px 0px' });
    const mid = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) root.dataset.pz = String(secs.indexOf(e.target as HTMLElement) % 3); }), { rootMargin: '-50% 0px -50% 0px' });
    secs.forEach((s) => { idle.observe(s); mid.observe(s); });
    return () => { idle.disconnect(); mid.disconnect(); };
  }, []);

  return (
    <div className="aw" data-bg={bg} data-pz="0" ref={rootRef}>
      <Seo path="/app" title="DOGYPT — Play the life with your dog." description={c('sub')} noindex />
      <style>{STAGE_CSS}</style>
      <div className="aw-bg" aria-hidden><i className="glyphs" /><i className="pearl" /><i className="pearl p1" /><i className="pearl p2" /></div>

      <header className={`top${stuck ? ' stuck' : ''}${darkHead ? ' dark' : ''}${onPlanet ? ' away' : ''}`}>
        <div className="wrap">
          <a className="logo" href="#" aria-label="DOGYPT"><img src="/images/magnet/logo-2026-kartusa.svg" alt="DOGYPT" /></a>
          <nav>
            <a href="#life">{c('nav1')}</a><a href="#features">{c('nav2')}</a><a href="#badges">{c('nav3')}</a><a href="#ainubis">AINUBIS</a><a href="#good">{c('nav5')}</a>
          </nav>
          <button className="lang" onClick={() => setLang(L === 'sk' ? 'en' : 'sk')}>{L === 'sk' ? 'EN' : 'SK'}</button>
          <a className="pk-cta" href="#join">{c('getapp')}</a>
        </div>
      </header>

      {/* 1 · HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-txt">
            <p className="eye">{c('e_life2')}</p>
            {/* DOMINANTA: tri riadky, čo najväčšie písmo — veľkosť z najdlhšieho riadka (Matej 6. 11.: „čo najväčší text
                na dva riadky resp. aj na 3: play the · life with · your dog“). Zlaté slovo psa ostáva na krivo. */}
            <h1 style={{ ['--hc' as string]: Math.max(c('h1a').length, c('h1b').length, (c('h1y') ? c('h1y').length + 1 : 0) + c('h1c').length * 0.9) } as CSSProperties}>
              <span className="l1">{c('h1a')}</span>
              <span className="l1">{c('h1b')}</span>
              <span className="l1">{c('h1y') && <>{c('h1y')} </>}<span className="deco big">{c('h1c')}</span></span>
            </h1>
            <p className="lead">{c('sub')}</p>
            <Stores />
            <div className="proof">
              <div><b><Counter to={dogs} run={proofRun} /></b><span>{c('p1')}</span></div>
              <div><b>{stats?.people ? <Counter to={stats.people} run={proofRun} /> : '—'}</b><span>{c('p2')}</span></div>
              <div><b><Counter to={stats?.countries || 8} run={proofRun} /></b><span>{c('p3')}</span></div>
            </div>
          </div>
          <div
            className="car"
            onMouseEnter={() => { hov.current = true; }}
            onMouseLeave={() => { hov.current = false; }}
            onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (sx.current == null) return;
              const dx = e.changedTouches[0].clientX - sx.current;
              if (Math.abs(dx) > 40) setCi((i) => (i + (dx < 0 ? 1 : -1) + CAROUSEL.length) % CAROUSEL.length);
              sx.current = null;
            }}
          >
            {CAROUSEL.map(([set, src], i) => (
              <Tilt key={set} set={set} src={src} className={`ph ${pos(i)}`} onOpen={() => setCi(i)} />
            ))}
            <span className="flt f1" tabIndex={0}><img className="xl" src={`${A}/odznaky/pilgrim-3.webp`} alt="" /><span className="tx">{c('fl1a')}<small>{c('fl1b')}</small></span><span className="tip">{c('fl1t')}</span></span>
            <span className="flt f2" tabIndex={0}><img className="xl" src={`${A}/odznaky/servant-2.webp`} alt="" /><span className="tx">{c('fl2a')}<small>{c('fl2b')}</small></span><span className="tip">{c('fl2t')}</span></span>
            <span className="flt f3" tabIndex={0}><img className="xl" src={`${A}/odznaky/ucen-4.webp`} alt="" /><span className="tx">{c('fl3a')}<small>{c('fl3b')}</small></span><span className="tip">{c('fl3t')}</span></span>
          </div>
        </div>
      </section>

      {/* 2 · ŽI PSÍ ŽIVOT */}
      <section id="life" className="life">
        <div className="wrap split">
          <Rv className="fresco"><img src="/images/magnet/vylety.webp" alt="" loading="lazy" /></Rv>
          <Rv d={1} className="life-txt">
            <p className="eye">{c('e_life3')}</p>
            <h2><span className="l1">{c('h_life2a')}</span><span className="l1"><span className="deco big">{c('h_life2b')}</span></span></h2>
            <p className="lead">{c('l_life2')}</p>
            <div className="verbs">
              {VERBS.map((Ic, i) => (
                <Rv key={i} d={i + 1} className="verb-w">
                  <button type="button" className={`pk-stage verb ${vOn === i ? 'on' : ''}`} onClick={() => setVOn(vOn === i ? null : i)}>
                    <span className="ic"><Ic size={34} /></span>
                    <b>{c(`v${i + 1}`)}</b>
                    <span className="vp">{c(`v${i + 1}p`)}</span>
                  </button>
                </Rv>
              ))}
            </div>
          </Rv>
        </div>
      </section>

      {/* 3 · PRE PSOV, S DUŠOU */}
      <section>
        <div className="wrap">
          <Rv className="sec-h">
            <Note k="n_ig" />
            <h2 className="soul-h">{c('h_soul1')} <span className="l2"><span className="deco">DOGYPT</span> {c('h_soul2')}</span></h2>
            <p className="lead">{c('l_soul')}</p>
          </Rv>
          <div className="vs">
            <Rv className="vs-col">
              <IgMock c={c} />
              <div className="vs-tag ig"><IgIcon /><p>{c('cap1')}</p></div>
            </Rv>
            <Rv d={1} className="mid">VS</Rv>
            <Rv d={2} className="vs-col">
              <Tilt set="profile" src="svorka-danka" />
              <div className="vs-tag dg"><img className="vs-ico" src="/web-app/app-icon.png" alt="DOGYPT" /><p>{c('cap2')}</p></div>
            </Rv>
          </div>
          <Rv className="alba-sec">
            <p className="eye">{c('e_alba')}</p>
            <h2 className="alba-h">{c('h_alba_a')} <span className="deco">{c('h_alba_b')}</span> {c('h_alba_c')}</h2>
          </Rv>
          <Rv><AlbaTrio /></Rv>
          <Rv><AlbaCount c={c} /></Rv>
          <Rv className="alba-sec gz-sec">
            <GlyphZones />
          </Rv>
        </div>
      </section>

      {/* 4 · FUNKCIE */}
      <section id="features">
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">{c('e_feat')}</p><h2>{c('h_feat_a')} <span className="blk">{c('h_feat_b')}</span></h2></Rv>
          {/* karty B — ikonka na dlaždici trčí nad kartou, bez animácie (Matej 6. 11.); dlaždica lapis (Matej 6. 11.: „toto vráť do lapisu“) / papyrus = `?tile=papyrus` */}
          {/* slučka appiek ako na /onepage (FilmApps) — jeden zdroj APP_CHIPS + APPS_TYPE_CSS, zmena pohne oboma.
              Nadpisy skonsolidované (Matej 6. 11., návrh A): nadnadpis · nadpis · „aj to, o čom ešte ani nevie.“ (nad pásom, Matej 6. 11.) · pilulky */}
          <style>{APPS_TYPE_CSS}</style>
          <div className="apps-loop">
            <p className="op-apps-lead">{c('h_feat2')}</p>
            <div className="op-apps-marq">
              <ul className="op-apps-chips">
                {[0, 1].map(copy => (
                  <Fragment key={copy}>
                    {APP_CHIPS.map(ch => (
                      <li key={ch.name} className={copy ? 'op-apps-clone' : undefined} aria-hidden={copy ? true : undefined}>
                        {ch.icon && <i style={{ ['--m' as string]: `url(/icons/brands/${ch.icon}.svg)` }} aria-hidden />}
                        {ch.name}
                      </li>
                    ))}
                    <li className={`op-apps-chip-more${copy ? ' op-apps-clone' : ''}`} aria-hidden={copy ? true : undefined}>{t('onepage.apps.chips.more')}</li>
                  </Fragment>
                ))}
              </ul>
            </div>
          </div>
          {/* odrážky = hover (PC) / ťuk (mobil): otvorená karta STOJÍ, ostatné karty v jej rade sa odsunú o jednu kartu
              (aj mimo obraz) a do uvoľneného miesta sa vysunie stĺpec — nič sa neprekrýva (Matej 6. 11.). Posledná karta
              v rade vysúva doľava. Ikonka sa pootočí. */}
          <div className="fgrid" data-tile={tile} onPointerLeave={e => { if (e.pointerType === 'mouse') setOpenFeat(null); }}>
            {FEATS.map((f, i) => (
              <Rv key={f.p} d={i % 4} className={`fcard pk-stage ${f.cls ?? ''}${openFeat === i ? ' open' : ''}${featSide(i) === 'l' ? ' side-l' : ''}${featShift(i)}`}>
                <button type="button" className="fhit" aria-expanded={openFeat === i}
                  onPointerEnter={e => { if (e.pointerType === 'mouse') setOpenFeat(i); }}
                  onClick={() => setOpenFeat(openFeat === i ? null : i)}>
                  <span className="fti"><img src={`${A}/ikony/${f.ic}.webp`} alt="" loading="lazy" /></span>
                  <h3>{f.h[L]}</h3><p>{c(f.p)}</p>
                </button>
                <ul className="fmore">{f.li.map(([tx, soon], k) => <li key={k} className={soon ? 'soon' : ''}>{tx[L]}{soon && <em>{c('soon')}</em>}</li>)}</ul>
              </Rv>
            ))}
          </div>
          <Rv as="p" className="soon-h">{c('soon_h')}</Rv>
          <div className="fgrid" data-tile={tile}>
            {SOON.map((f, i) => (
              <Rv key={f.h.en} d={i} className="fcard soon">
                <div className="fti"><img src={`${A}/ikony/${f.ic}.webp`} alt="" loading="lazy" /></div>
                <h3>{f.h[L]}</h3><p>{f.p[L]}</p>
              </Rv>
            ))}
          </div>
          {nakres && <p style={{ textAlign: 'center', marginTop: 16 }}><Note k="n_ikony" flag /></p>}
        </div>
      </section>

      {/* 5 · ODZNAKY — štyri cesty vedľa seba (každá ukazuje MOJU úroveň), ťuk = celý rebríček tej cesty.
          Matej 6. 11.: „dôležité je, aby ich človek videl najprv všetky“. */}
      <section id="badges">
        <div className="wrap">
          <Rv className="sec-h">
            <p className="eye">{c('e_badge')}</p>
            <h2>{c('h_badge1')} <span className="deco">{c('h_badge2')}</span></h2>
          </Rv>
          <div className="paths">
            {PATHS.map((p, i) => (
              <Rv key={p.ax} d={i} className={`path p${i}${ax === i ? ' on' : ''}`}>
                <button type="button" aria-expanded={ax === i}
                  onPointerEnter={e => { if (e.pointerType === 'mouse') setAx(i); }}
                  onClick={e => { if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === 'mouse') return; setAx(ax === i ? null : i); }}>
                  <img src={`${A}/odznaky/${p.mine}`} alt="" loading="lazy" />
                  <b>{c(p.ax)}</b>
                  <small>{c(p.lvl)}</small>
                </button>
              </Rv>
            ))}
          </div>
          {ax !== null && (
            <div className="axis pk-stage on" key={ax}>
              <h3>{c(PATHS[ax].ax)}</h3><p className="what">{c(`${PATHS[ax].ax}p`)}</p>
              {ax === 0 && <div className="medals m4">{[0, 1, 2, 3].map((i) => <figure key={i} className={i > 2 ? 'lock' : ''}><img src={`${A}/odznaky/dogyptan-${i}.svg`} alt="" /><span>{c(`t${i}`)}</span></figure>)}</div>}
              {ax === 1 && <div className="medals">{SERVANT_YEARS.map((y, i) => <figure key={i} className={i > 2 ? 'lock' : ''}><img src={`${A}/odznaky/servant-${i}.webp`} alt="" /><span>{y}</span></figure>)}</div>}
              {ax === 2 && <div className="medals">{SERVANT_YEARS.map((_, i) => <figure key={i} className={i > 3 ? 'lock' : ''}><img src={`${A}/odznaky/pilgrim-${i}.webp`} alt="" /><span>{i + 1}</span></figure>)}</div>}
              {ax === 3 && <div className="medals m10">{UCEN_PCT.map((p, i) => <figure key={i} className={i > 3 ? 'lock' : ''}><img src={`${A}/odznaky/ucen-${i + 1}.webp`} alt="" /><span>{p}</span></figure>)}</div>}
            </div>
          )}
        </div>
      </section>

      {/* 6 · AINUBIS — osobný mentor. v2 (Matej 6. 11. večer): logo s krúžiacim prstencom (ako VAULT) → nadpis →
          text so „(still learning)“ → LIEVIK 5·4·2·7 svetov·46/547 → prúd do celého zvitku (vľavo) + podcast a chat
          pod sebou → Učeň (interaktívny) → benefity → mockup POSLEDNÝ. Hlavička nad sekciou tmavne. */}
      <section id="ainubis" className="ai-band" data-paw="ai" ref={aiSecRef} onPointerMove={(e) => {
        /* SVETLO ZA MYŠOU: blok `.glowb` pod kurzorom dostane polohu myši — okraj a vnútro sa podsvietia v tom mieste */
        const g = (e.target as HTMLElement).closest<HTMLElement>('.glowb'); if (!g) return;
        const r = g.getBoundingClientRect();
        g.style.setProperty('--mx', `${e.clientX - r.left}px`); g.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}>
        <div className="wrap ai-sec c">
          <Rv>
            <div className="ai-logo" aria-hidden><span className="r2" /><span className="r1" /><img src={AI_HEAD} alt="" /></div>
            <div className="ai-logo-nm"><span className="ai-name"><b>AI</b>NUBIS</span></div>
            <p className="ai-kick">{c('ai_kick')}</p>
            <h2 className="ai-h2">{c('h_ai1')}<br />{c('h_ai2')}<br />{c('h_ai3a')} <span className="ai-deco">{c('h_ai3b')}</span></h2>
            <p className="lead">{c('l_ai')} <span className="ai-still" tabIndex={0}>({c('still')})<span className="tip">{c('still_t')}</span></span></p>
          </Rv>
          <AiFlow L={L} c={c} onWorld={pickWorld} published={['nutrition', 'dogsPath', 'understanding', 'anatomy']} counter={(n, run) => <Counter to={n} run={run} />} learn={
            <div className="ai-learn3">
              <div className="ai-card ai-paluba wide" data-fa="5" ref={scrollsRef}>
                <span className="k">{c('lr1k')}</span><h4>{c('lr1h')}</h4><p>{c('lr1p')}</p>
                <AiScrolls L={L} c={c} />
              </div>
              <div className="ai-card ai-paluba"><span className="k">{c('lr2k')}</span><h4>{c('lr2h')}</h4><p>{c('lr2p')}</p><AiPods L={L} c={c} /><div className="ai-wave fill" aria-hidden>{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ animationDelay: `${(Math.sin(i * 1.7) * 0.6 - 0.6).toFixed(2)}s` }} />)}</div></div>
              <div className="ai-card ai-paluba"><span className="k">{c('lr3k')}</span><h4>{c('lr3h')}</h4><p>{c('lr3p')}</p><AiChat L={L} c={c} head={AI_HEAD} /></div>
            </div>
          } />
          {/* PC: mozog vľavo veľký, vedľa text, veľké % a 2 rady po 5 odznakov (Matej 6. 11.: „aby to bolo vidno“) */}
          <div className="ai-ucen2">
            <AiBrain share={UCEN_PCT[ucOn] === '1.' ? 0 : parseFloat(UCEN_PCT[ucOn]) / 100} head={AI_HEAD} onShare={(n, total) => {
              /* najvyšší Učeň, na ktorého labka už nazbierala (1. = prvé zrno) */
              ucTouched.current = true;
              let lvl = 0;
              UCEN_PCT.forEach((p, i) => { if (i && n / total >= parseFloat(p) / 100) lvl = i; });
              setUcOn(lvl); setUcLive(n / total);
            }} />
            <div className="ai-ucside">
              <p className="ai-uctx"><b>{c('uc_a')}</b> {c('uc_b')}</p>
              <p className="ai-ucbig">
                <b>{ucLive == null ? (UCEN_PCT[ucOn] === '1.' ? '1' : UCEN_PCT[ucOn]) : `${(ucLive * 100).toLocaleString(L === 'sk' ? 'sk-SK' : 'en-GB', { maximumFractionDigits: 1 })} %`}</b>
                <span>{c('ax3')} {ucOn + 1} · {ucLive == null && UCEN_PCT[ucOn] === '1.' ? c('uc_first') : c('uc_vault')}</span>
              </p>
              <div className="ai-ucrow">{UCEN_PCT.map((pc, i) => (
              <button key={i} type="button" className={`${ucOn === i ? 'on' : ''}${ucLive != null && i > ucOn ? ' off' : ''}`} onPointerEnter={() => { if (ucLive != null) return; ucTouched.current = true; setUcOn(i); }} onFocus={() => { if (ucLive != null) return; ucTouched.current = true; setUcOn(i); }} onClick={() => { if (ucLive != null) return; ucTouched.current = true; setUcOn(i); }}>
                <img src={`${A}/odznaky/ucen-${i + 1}.webp`} alt="" loading="lazy" />
              </button>
            ))}</div>
              <p className="ai-uchint">{c('uc_hint')}</p>
            </div>
          </div>
        </div>

        <div className="wrap ai-sec c">
          <Rv><p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_ben')}</p><h3 className="ai-h3">{c('h_ben')}</h3></Rv>
          <div className="ai-ben">
            {/* ikonky z Kie vo farbách AINUBISa (výber Mateja 6. 11., plany/nakresy/ikony-benefity-2026-11-06) */}
            {['vet', 'conf', 'calm', 'roky'].map((ic, i) => (
              <Rv key={ic} d={i} className="ai-b glowb"><img src={`${A}/ikony/ben-${ic}.webp`} alt="" loading="lazy" /><h4>{c(`bn${i + 1}h`)}</h4><p>{c(`bn${i + 1}p`)}</p></Rv>
            ))}
          </div>
          <Rv as="p" className="ai-quote">{c('ai_quote')}<small><span className="ai-name"><b>AI</b>NUBIS</span></small></Rv>
        </div>

      </section>

      {/* 7 · POĎAKOVANIE — tri snímky vodorovne: poďakovanie + počet psov · intro video · DOGMA
          (Matej 6. 11.: „blok poďakovanie bude mať 3 časti na horizontálny scroll“; „Za hrou“ sa v ňom rozpustil) */}
      <section id="good">
        <div className="wrap">
          <GoodSlides labels={[c('sl_good'), c('sl_video'), c('sl_dogma')]}>
            <div className="gs-slide good2 pk-card">
              <div className="pic"><img src="/images/vision/vision-unity.webp" alt="" loading="lazy" /></div>
              <div>
                <p className="eye">{c('e_good')}</p>
                <h2>{c('h_good1')} <span className="deco">{c('h_good2')}</span></h2>
                <p className="lead">{c('l_good')}</p>
                {/* rozpad vstupného navonok 8 · 2 · 1 (lib/transparency.ts) — počet psov je v bloku POTREBUJEME ŤA */}
                <div className="gs-split">
                  <small>{c('split_h')}</small>
                  <div className="gs-bar">{TRANSPARENCY_SPLIT.map((p) => <i key={p.labelKey} style={{ flex: p.share, background: p.color }} />)}</div>
                  <ul>{TRANSPARENCY_SPLIT.map((p) => <li key={p.labelKey}><i style={{ background: p.color }} />{t(p.labelKey)}</li>)}</ul>
                </div>
                <div className="bowls">
                  <div className="pk-subblock"><b>€0</b><span>{c('b1')}</span></div>
                  <div className="pk-subblock"><b>{c('b2v')}</b><span>{c('b2')}</span></div>
                  <div className="pk-subblock"><b>{c('b3v')}</b><span>{c('b3')}</span></div>
                </div>
                <a className="pk-cta" href="#">{c('give')}</a>
                {nakres && <p style={{ margin: '16px 0 0' }}><Note k="n_good" flag /></p>}
              </div>
            </div>
            <div className="gs-slide gs-video pk-card">
              <video src="/videos/vision-intro-montage.mp4" poster="/images/mission/intro-poster.webp" controls playsInline preload="none" />
              <div>
                <p className="eye">{c('e_lore')}</p>
                <h2>{c('h_lore1')} <span className="deco">{c('h_lore2')}</span></h2>
                <p className="lead">{c('l_lore')}</p>
                {loreOpen && <p>{c('l_lore2')}</p>}
                <button className="more" onClick={() => setLoreOpen(!loreOpen)}>{loreOpen ? c('less') : c('more')}</button>
                <p><a className="link-gold" href="/">{c('story_cta')}</a></p>
              </div>
            </div>
            <div className="gs-slide gs-dogma pk-card">
              <div className="pic"><img src="/images/dogma-cover-lapis.webp" alt="DOGMA" loading="lazy" /></div>
              <div>
                <p className="eye">{c('e_dogma')}</p>
                <h2>{c('h_dogma1')} <span className="deco">{c('h_dogma2')}</span></h2>
                <p className="lead">{c('l_dogma')}</p>
                <a className="pk-cta" href={L === 'sk' ? 'https://dogma.dogypt.com/' : 'https://dogma.dogypt.com/en/'}>{c('dogma_cta')}</a>
                <p className="motto">{c('motto')}</p>
              </div>
            </div>
          </GoodSlides>
        </div>
      </section>

      {/* 8 · VSTÚP — faraón s ukazovákom „potrebujeme ťa“ z /onepage namiesto heroglyfu (Matej 6. 11.) */}
      <section id="join" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="join">
            <div>
              <p className="eye" style={{ color: 'var(--lapis-ink)' }}>{c('e_need')}</p>
              <h2>{c('h_need1')} <span className="deco">{c('h_need2')}</span></h2>
              <p className="lead">{c('l_need')}</p>
              <div className="join-goal">
                <p><b>{dogs.toLocaleString('sk-SK')}</b> <span>/ 1 000 000</span></p>
                <small>{c('dogs_now')}</small>
              </div>
              <DogTrail goal={c('goal')} />
              <a className="pk-cta" href="/heroglyph/name">{c('cta_join')}</a>
            </div>
            <div className="join-ph"><img src="/images/council-pharaoh.webp" alt="" loading="lazy" /></div>
          </Rv>
        </div>
      </section>

      {/* 9 · FAQ */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="sec-h faq-h"><p className="eye">FAQ</p><h2>{c('h_faq1')} <span className="deco">{c('h_faq2')}</span></h2></Rv>
          <div className="faq">
            {[1, 2, 3, 4, 5].map((n) => (
              <Rv as="details" key={n} className="pk-stage"><summary>{c(`q_${n}`)}</summary><p>{c(`a_${n}`)}</p></Rv>
            ))}
            {/* kontakt a odkazy z pätičky — pätička zanikla, posledná je planétka (Matej 6. 11.) */}
            <Rv as="details" className="pk-stage"><summary>{c('q_contact')}</summary>
              <p><a href="mailto:woof@dogypt.com">woof@dogypt.com</a><br />
                <a href="/">{c('ft1')}</a> · <a href={L === 'sk' ? 'https://dogma.dogypt.com/' : 'https://dogma.dogypt.com/en/'}>DOGMA</a> · <a href="/privacy">{c('privacy')}</a><br />
                <small>© DOGYPT</small></p>
            </Rv>
          </div>
        </div>
      </section>

      {/* 11 · ŽIVÁ PLANÉTKA — finále */}
      <LivePlanet />

      <div className={`mbar${mbar ? ' on' : ''}`}><a className="pk-cta" href="#join">{c('mbar')}</a></div>

      {nakres && (
        <div className="bgpick">
          {[['1', 'PERLEŤ ZLATÁ'], ['2', 'HEROGLYFY ROZMAZANÉ'], ['3', 'HEROGLYFY JEMNÉ'], ['4', 'PAPYRUS']].map(([k, n]) => (
            <button key={k} className={bg === k ? 'on' : ''} onClick={() => setBg(k)}>{n}</button>
          ))}
          {[['lapis', 'IKONKY LAPIS'], ['papyrus', 'IKONKY PAPYRUS']].map(([k, n]) => (
            <button key={k} className={tile === k ? 'on' : ''} onClick={() => setTile(k)}>{n}</button>
          ))}
        </div>
      )}

    </div>
  );
}
