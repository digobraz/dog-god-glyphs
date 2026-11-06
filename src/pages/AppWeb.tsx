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
import { HandPaw, HandForward, HandHeart, HandClipboard, HandShare, HandStar, HandCycle } from '@/components/pack/HandIcons';
import AI_HEAD from '@/assets/ainubis-head.webp';
import { AiFunnel, RINGS } from './appWeb/AiFunnel';
import { STAGE_CSS } from '@/components/pack/packTheme';
import { VAULT_COUNTS } from '@/components/pack/vault/vaultRegister';
import { GodsGridLab } from '@/components/gods/GodsGridLab';
import { useLang, useT } from '@/i18n/LanguageContext';
import { getPackStats } from '@/lib/sharedFetch';
import { COPY, COPY3, NOTES, type Lang2 } from './appWeb/copy';
import { IgMock, IgIcon } from './appWeb/IgMock';
import { AlbaCount, AlbaTrio, GlyphZones } from './appWeb/AlbaGlyph';
import { APP_CHIPS, APPS_TYPE_CSS } from '@/components/lab/filmAppsType';
import './appWeb/appWeb.css';

const A = '/web-app';

const CAROUSEL: [string, string][] = [['map', '11-vretenica-mapa'], ['profile', 'B-profil-top'], ['dogid', '9-moja-svorka'], ['ainubis', '8-ainubis'], ['feed', 'feed']];

/** Zdroje lievika — snímka chrámu AINUBIS (`scripts/svet/harvest-data.json`, 26. 10. 2026; štúdie = Chrám › Znalosti).
 *  [číslo, kľúč názvu, kľúč podnadpisu] */
const AI_SRC: [number, string, string][] = [
  [532, 'src1', 'src1s'], [337, 'src2', 'src2s'], [1996, 'src3', 'src3s'], [1158, 'src4', 'src4s'], [16, 'src5', 'src5s'],
];

const SERVANT_YEARS = [1, 4, 9, 14, 19, 24, 29, 34];
/** Pásma UČŇA = % VAULTU (schválené 6. 11., `plany/nakresy/pecat-odznaky-2026-11-06`). */
const UCEN_PCT = ['1.', '2 %', '5 %', '10 %', '20 %', '30 %', '45 %', '60 %', '80 %', '100 %'];

/** Štyri cesty v sekcii Odznaky — `mine` = úroveň vzorového psíčkara, tá istá ako v levitujúcich odznakoch v hero. */
const PATHS = [
  { ax: 'ax0', mine: 'dogyptan-0.svg', lvl: 't0' },
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
const AI_FRAME_CSS = '.pk-veil--modal:has(.mgp-card--ai),.akv-pvinfo,.akv-pvdock,.mgp-bar,[class*=onsent],a.fixed.bottom-3,button.fixed.bottom-3{display:none!important}';

/** Živá planétka z `/` — montuje sa až pri obrazovke a mimo nej stojí. */
function LivePlanet() {
  const [mountRef, near] = useNear<HTMLDivElement>('600px');
  const [visRef, vis] = useNear<HTMLElement>('0px', false);
  return (
    <div ref={mountRef}>
      <section className="planet-live theme-light" ref={visRef}>
        {near && <GodsGridLab embedded paused={!vis} />}
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

  /* AINUBIS — živá appka sa načíta až pri obrazovke */
  const [aiRef, aiNear] = useNear<HTMLDivElement>('400px');
  const [funRef, funNear] = useNear<HTMLDivElement>('-15% 0px');
  const [funVisRef, funVis] = useNear<HTMLDivElement>('200px', false);
  const vault = Object.values(VAULT_COUNTS);
  const vScrolls = vault.reduce((s, w) => s + w.scrolls, 0);
  const vCircles = vault.reduce((s, w) => s + w.circles, 0);
  const injectAi = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const d = e.currentTarget.contentDocument;
      if (d) { const s = d.createElement('style'); s.textContent = AI_FRAME_CSS; d.head.appendChild(s); }
    } catch { /* iný pôvod — nechaj tak */ }
  };

  /* Za hrou — text na rozklik */
  const [loreOpen, setLoreOpen] = useState(false);

  const [proofRun, setProofRun] = useState(false);
  useEffect(() => { if (stats) setProofRun(true); }, [stats]);
  useEffect(() => { const t = setTimeout(() => setProofRun(true), 1500); return () => clearTimeout(t); }, []);

  return (
    <div className="aw" data-bg={bg}>
      <Seo path="/app" title="DOGYPT — Play the life with your dog." description={c('sub')} noindex />
      <style>{STAGE_CSS}</style>
      <div className="aw-bg" aria-hidden><i className="glyphs" /><i className="pearl" /></div>

      <header className={`top${stuck ? ' stuck' : ''}`}>
        <div className="wrap">
          <a className="logo" href="#" aria-label="DOGYPT"><img src="/images/magnet/logo-2026-kartusa.svg" alt="DOGYPT" /></a>
          <nav>
            <a href="#life">{c('nav1')}</a><a href="#features">{c('nav2')}</a><a href="#badges">{c('nav3')}</a><a href="#ainubis">AINUBIS</a><a href="#lore">{c('nav5')}</a>
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
              <Rv key={p.ax} d={i} className={`path${ax === i ? ' on' : ''}`}>
                <button type="button" aria-expanded={ax === i} onClick={() => setAx(ax === i ? null : i)}>
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
              {ax === 0 && <div className="medals m4">{[0, 1, 2, 3].map((i) => <figure key={i} className={i > 0 ? 'lock' : ''}><img src={`${A}/odznaky/dogyptan-${i}.svg`} alt="" /><span>{c(`t${i}`)}</span></figure>)}</div>}
              {ax === 1 && <div className="medals">{SERVANT_YEARS.map((y, i) => <figure key={i} className={i > 2 ? 'lock' : ''}><img src={`${A}/odznaky/servant-${i}.webp`} alt="" /><span>{y}</span></figure>)}</div>}
              {ax === 2 && <div className="medals">{SERVANT_YEARS.map((_, i) => <figure key={i} className={i > 3 ? 'lock' : ''}><img src={`${A}/odznaky/pilgrim-${i}.webp`} alt="" /><span>{i + 1}</span></figure>)}</div>}
              {ax === 3 && <div className="medals m10">{UCEN_PCT.map((p, i) => <figure key={i} className={i > 3 ? 'lock' : ''}><img src={`${A}/odznaky/ucen-${i + 1}.webp`} alt="" /><span>{p}</span></figure>)}</div>}
            </div>
          )}
        </div>
      </section>

      {/* 6 · AINUBIS — osobný mentor (nákres plany/nakresy/ainubis-sekcia-2026-11-06, Matej 6. 11.: „nákres je super,
          aplikuj ho“). Úvod → znalostný lievik → A4 → ako sa učíš → čo ti to dá → mockup POSLEDNÝ. */}
      <section id="ainubis" className="ai-band" data-paw="ai">
        <div className="wrap ai-sec c">
          <Rv>
            <div className="ai-who"><img src={AI_HEAD} alt="" /><span className="ai-name"><b>AI</b>NUBIS</span></div>
            <p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_ai')}</p>
            <h2>{c('h_ai_a')} <span className="ai-deco">{c('h_ai_b')}</span> {c('h_ai_c')}</h2>
            <p className="lead">{c('l_ai')}</p>
          </Rv>
        </div>

        <div className="wrap ai-sec c" ref={funRef}>
          <Rv><p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_fun')}</p><h3 className="ai-h3">{c('h_fun')}</h3></Rv>
          <div className="ai-src">
            {AI_SRC.map(([n, k, s2], i) => (
              <Rv key={k} d={i} className="ai-tile"><b><Counter to={n} run={funNear} /></b><span>{c(k)}</span><small>{c(s2)}</small></Rv>
            ))}
          </div>
          <div className="ai-cv">
            <AiFunnel run={funVis} />
            <div className="ai-rings">{RINGS.map((r, i) => <span key={i} style={{ top: `${r * 100}%` }}>{c(`ring${i + 1}`)}</span>)}</div>
          </div>
          <div className="ai-out">
            <div><b><Counter to={vault.length} run={funNear} /></b><small>{c('ai_worlds')}</small></div>
            <div><b><Counter to={vCircles} run={funNear} /></b><small>{c('ai_circles')}</small></div>
            <div><b><Counter to={vScrolls} run={funNear} /></b><small>{c('ai_scrolls')}</small></div>
          </div>
          <Rv className="ai-one ai-paluba"><b>{c('one_a')} <em>{c('one_b')}</em> {c('one_c')}</b></Rv>
          <Rv className="ai-a4">
            <div><b>≈ 12 500</b><span>{c('a4_1')}</span></div>
            <div><b>1,25 m</b><span>{c('a4_2')}</span></div>
            <div><b>3,7 km</b><span>{c('a4_3')}</span></div>
            <div><b>47</b><span>{c('a4_4')}</span></div>
          </Rv>
        </div>

        <div className="wrap ai-sec c">
          <Rv><p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_learn')}</p><h3 className="ai-h3">{c('h_learn')}</h3></Rv>
          <div className="ai-learn">
            <Rv d={0} className="ai-card ai-paluba"><span className="k">{c('lr1k')}</span><h4>{c('lr1h')}</h4><p>{c('lr1p')}</p><div className="ai-shot"><img src={`${A}/snimky/8-zvitok-top.jpg`} alt="" loading="lazy" /></div></Rv>
            <Rv d={1} className="ai-card ai-paluba"><span className="k">{c('lr2k')}</span><h4>{c('lr2h')}</h4><p>{c('lr2p')}</p><div className="ai-wave">{Array.from({ length: 36 }, (_, i) => <i key={i} style={{ animationDelay: `${(Math.sin(i * 1.7) * 0.6 - 0.6).toFixed(2)}s` }} />)}</div></Rv>
            <Rv d={2} className="ai-card ai-paluba"><span className="k">{c('lr3k')}</span><h4>{c('lr3h')}</h4><p>{c('lr3p')}</p>
              <div className="ai-chat"><div className="q">{c('q1')}</div><div className="a"><span className="ai-name"><b>AI</b>NUBIS</span>{c('a1x')}</div></div></Rv>
          </div>
          <Rv className="ai-ucen"><span className="bs"><img src={`${A}/odznaky/ucen-1.webp`} alt="" /><img className="m" src={`${A}/odznaky/ucen-4.webp`} alt="" /><img className="l" src={`${A}/odznaky/ucen-10.webp`} alt="" /></span><p><b>{c('uc_a')}</b> {c('uc_b')}</p></Rv>
        </div>

        <div className="wrap ai-sec c">
          <Rv><p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_ben')}</p><h3 className="ai-h3">{c('h_ben')}</h3></Rv>
          <div className="ai-ben">
            {[HandClipboard, HandStar, HandHeart, HandCycle].map((Ic, i) => (
              <Rv key={i} d={i} className="ai-b"><Ic /><h4>{c(`bn${i + 1}h`)}</h4><p>{c(`bn${i + 1}p`)}</p></Rv>
            ))}
          </div>
          <Rv as="p" className="ai-quote">{c('ai_quote')}<small><span className="ai-name"><b>AI</b>NUBIS</span></small></Rv>
        </div>

        <div className="wrap split rev ai-sec">
          <Rv>
            <p className="eye" style={{ color: 'var(--ai-cyan)' }}>{c('e_try')}</p>
            <h3 className="ai-h3">{c('h_try')}</h3>
            <p className="lead">{c('l_try')}</p>
            <div className="ai-chips">{['w7', 'w5', 'w6', 'w4', 'w3', 'w2', 'w1'].map((k) => <span key={k}>{c(k)}</span>)}</div>
            <a className="ai-cta" href="#join">{c('ai_cta')}</a>
          </Rv>
          <div ref={aiRef} className="ai-live">
            {aiNear && <iframe src="/magnet/ainubis" title="AINUBIS" loading="lazy" onLoad={injectAi} />}
            <img src={`${A}/phone.svg`} alt="" />
            <span className="cap">{c('ai_try')}</span>
          </div>
        </div>
      </section>

      {/* 7 · NAVŽDY ZADARMO — poďakovanie psom */}
      <section id="good">
        <div className="wrap">
          <Rv className="good2 pk-card">
            <div className="pic"><img src="/images/vision/vision-unity.webp" alt="" loading="lazy" /></div>
            <div>
              <p className="eye">{c('e_good')}</p>
              <h2>{c('h_good1')} <span className="deco">{c('h_good2')}</span></h2>
              <p className="lead">{c('l_good')}</p>
              <p>{c('l_good2')}</p>
              <div className="bowls">
                <div className="pk-subblock"><b>€0</b><span>{c('b1')}</span></div>
                <div className="pk-subblock"><b>{c('b2v')}</b><span>{c('b2')}</span></div>
                <div className="pk-subblock"><b>{c('b3v')}</b><span>{c('b3')}</span></div>
              </div>
              <a className="pk-cta" href="#">{c('give')}</a>
              {nakres && <p style={{ margin: '16px 0 0' }}><Note k="n_good" flag /></p>}
            </div>
          </Rv>
        </div>
      </section>

      {/* 8 · VSTÚP — heroglyf ako kľúč */}
      <section id="join" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="join">
            <div>
              <p className="eye" style={{ color: 'var(--lapis-ink)' }}>{c('e_join')}</p>
              <h2>{c('h_join')}</h2>
              <p className="lead">{c('l_join')}</p>
              <a className="pk-cta" href="/heroglyph/name">{c('cta_glyph')}</a>
              <p className="or">{c('or_app')}</p>
              <Stores />
            </div>
            <div className="glyph-k"><img src="/images/hekthor-heroglyph.webp" alt="" loading="lazy" /></div>
          </Rv>
        </div>
      </section>

      {/* 9 · FAQ */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">FAQ</p></Rv>
          <div className="faq">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Rv as="details" key={n} className="pk-stage"><summary>{c(`q_${n}`)}</summary><p>{c(`a_${n}`)}</p></Rv>
            ))}
          </div>
        </div>
      </section>

      {/* 10 · ZA HROU — video, príbeh na rozklik, cieľ */}
      <section id="lore" className="lore">
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">{c('e_lore')}</p><h2>{c('h_lore')}</h2></Rv>
          <div className="lore2">
            <Rv><video src="/videos/vision-intro-montage.mp4" poster="/images/mission/intro-poster.webp" controls playsInline preload="none" /></Rv>
            <Rv d={1} className="pk-dblock">
              <p>{c('l_lore')}</p>
              {loreOpen && <p>{c('l_lore2')}</p>}
              <button className="more" onClick={() => setLoreOpen(!loreOpen)}>{loreOpen ? c('less') : c('more')}</button>
              <p className="eye" style={{ marginTop: 24 }}>{c('goal')}</p>
              <div className="big">{dogs.toLocaleString('sk-SK')} <small>/ 1 000 000</small></div>
              <div className="pk-progress"><div className="pk-progress__fill" style={{ width: `${Math.max(2, (dogs / 1_000_000) * 100)}%` }} /></div>
              <div className="links">
                <a className="link-gold" href="/">{c('story_cta')}</a>
                <a className="link-gold" href={L === 'sk' ? 'https://dogma.dogypt.com/' : 'https://dogma.dogypt.com/en/'}>{c('dogma_cta')}</a>
              </div>
            </Rv>
          </div>
          <Rv as="p" className="motto">{c('motto')}</Rv>
        </div>
      </section>

      {/* 11 · ŽIVÁ PLANÉTKA — finále */}
      <LivePlanet />

      <footer>
        <div className="wrap">
          <span>© DOGYPT · woof@dogypt.com</span>
          <span><a href="/">{c('ft1')}</a> · <a href="https://dogma.dogypt.com/">DOGMA</a> · <a href="#good">{c('ft3')}</a> · <a href="/privacy">Privacy</a></span>
        </div>
      </footer>

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
