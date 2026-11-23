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
import { Fragment, Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Seo } from '@/components/Seo';
import AI_HEAD from '@/assets/ainubis-head.webp';
import { AiFlow, Ic } from './appWeb/AiFlow';
import { AiScrolls, AiChat } from './appWeb/AiLearn';
import { AiBrain } from './appWeb/AiBrain';
import { STAGE_CSS } from '@/components/pack/packTheme';
import { VAULT_COUNTS } from '@/components/pack/vault/vaultRegister';
/* živá planétka (250 kB JS + 70 kB CSS) sa sťahuje a parsuje až pri blížení sa k nej, nie pri otvorení stránky */
const GodsGridLab = lazy(() => import('@/components/gods/GodsGridLab').then((m) => ({ default: m.GodsGridLab })));
import { useLang, useT } from '@/i18n/LanguageContext';
import { getPackStats } from '@/lib/sharedFetch';
import { gridFetch, GRID_URL_ALL } from '@/lib/earlyFetch';
import { COPY, COPY3, NOTES, type Lang2 } from './appWeb/copy';
import { CLAIM, isClaim } from './appWeb/claim';
import { CLAIM22 } from './appWeb/claim22';
import { GiftSheet, useGiftReturn } from './appWeb/GiftSheet';
import { WebTop, scrollToId } from './appWeb/WebTop';
import { loadLang, WEB_LANGS } from './appWeb/langs';
import { flagUrl } from '@/lib/flagUrl';
import { intlLocale } from '@/i18n/bcp47';
import { IgMock, IgIcon } from './appWeb/IgMock';
import { AlbaCount, AlbaTrio, GlyphZones } from './appWeb/AlbaGlyph';
import { BadgeDock } from './appWeb/BadgeDock';
import { Stores } from './appWeb/Stores';
import { FARAO_AMOUNTS, RANK_OF_CARD, loginUrl, myRank, openPortal, paidRank, startCheckout } from './appWeb/vstupne';
import { APP_CHIPS, APPS_TYPE_CSS } from '@/components/lab/filmAppsType';
import './appWeb/appWeb.css';

const A = '/web-app';
/** Šírka nadpisu v „latinských znakoch“: znak CJK/kana/hangul je široký ako ~1,8 latinského (inak japonský nadpis vyjde o polovicu širší než okno). */
/** `*slovo*` = tučne (podnadpis hero, Matej 22. 11.: „zadarmo daj bold“); `plain` = bez hviezdičiek pre SEO. */
const rich = (s: string) => s.split(/\*([^*]+)\*/).map((x, i) => (i % 2 ? <b key={i}>{x}</b> : x));
const plain = (s: string) => s.replace(/\*/g, '');
const wlen = (s: string) => [...s].reduce((n, ch) => n + (/[\u2E80-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]/.test(ch) ? 1.8 : 1), 0);

const CAROUSEL: [string, string][] = [['map', '11-vretenica-mapa'], ['profile', 'B-profil-top'], ['dogid', '9-moja-svorka'], ['ainubis', 'ai-mozog'], ['feed', 'feed']];
/** CLAIM 2: prvá pomoc hneď vedľa mapy = vážna stránka appky v prvom zábere (Matej 21. 11.: „doplnil mockup prvej pomoci, napr. nedýcha“).
 *  Snímka z testovacej appky /pack/sos/prva-pomoc/nedycha (390×844 @ 900 px, SK + -en). */
/* MOCKUPY 1:1 Z TELEFÓNU (Matej 23. 11.: „potrebujem aby boli 1:1 ako v telefóne“) — testovacia appka, iPhone 393×852 s okrajmi,
   nafotené `plany/nakresy/web-mockupy-2026-11-23/fot.mjs`, súbory `app-*`. Staré snímky ostávajú pre CAROUSEL (v1). */
const CAROUSEL_V2: [string, string][] = [['map', 'app-mapa'], ['list', 'app-mapa-zoznam'], ['aid', 'app-prva-pomoc'], ['sos', 'app-sos-panel'], ['profile', 'app-profil'], ['dogid', 'app-svorka'], ['ainubis', 'app-ainubis-mozog'], ['scroll', 'app-zvitok'], ['feed', 'app-feed']];

const SERVANT_YEARS = ['0–3', '4–8', '9–13', '14–18', '19–23', '24–29', '30–39', '40+'];
const PILGRIM_LEVELS = ['1–3', '4–7', '8–12', '13–18', '19–25', '26–33', '34–42', '43–52', '53+'];
/** Pásma UČŇA = % VAULTU (schválené 6. 11., `plany/nakresy/pecat-odznaky-2026-11-06`). */
/** Jazyky, v ktorých podcasty naozaj hrajú (appka: `POD_LANGS_ORDER` v PodPlayer.tsx); ostatné vlajky sú vyblednuté. */
const POD_LIVE = ['sk', 'cs', 'en', 'deu'];
const UCEN_PCT = ['1.', '2 %', '5 %', '10 %', '20 %', '35 %', '55 %', '80 %', '100 %'];

/** Tri levely pre vlastného psa — `start` = úroveň vzorového psíčkara, tá istá ako v levitujúcich odznakoch v hero. */
const LEVELS: { ax: string; scene: string; start: number; n: number; img: (i: number) => string; cap: (i: number, c: (k: string) => string) => string }[] = [
  { ax: 'ax1', scene: `${A}/vyjavy/sluzobnik.webp`, start: 2, n: SERVANT_YEARS.length, img: (i) => `servant-${i}.webp`, cap: (i, c) => `${SERVANT_YEARS[i]} ${c('cap_ax1')}` },
  { ax: 'ax2', scene: '/images/magnet/vylety.webp', start: 1, n: PILGRIM_LEVELS.length, img: (i) => `pilgrim-${i}.webp`, cap: (i, c) => `${c('cap_ax2a')} ${PILGRIM_LEVELS[i]} ${c('cap_ax2b')}` },  /* zelený: „prevláda modrá, musíme to oživiť“ (Matej 6. 11.) */
  { ax: 'ax3', scene: `${A}/vyjavy/ucen.webp`, start: 0, n: UCEN_PCT.length, img: (i) => `ucen-${i + 1}.webp`, cap: (i, c) => `${c(`uc_n${i + 1}`)} · ${i === 0 ? c('uc_first') : `${UCEN_PCT[i]} ${c('uc_vault')}`}` },
];

/** Vstupné pri Dogypťanovi: index = `dogyptan-N.webp` aj kľúč názvu `tN`. 2 = Apoštol (id knaz), perleť s ružovým rámom (Matej 7. 11.); 4 = Vezír (id farao); 5 = Člen tímu sa do rebríčka nedáva. */
const CITIZEN_PRICES = ['€0', '€3,99', '€7,99', '€11,99', '€111+'];
/** CTA pri Dogypťanovi vedie na víziu v `/story` (Matej 10. 11.). */
const VISION_HREF = '/story#vision';

/** Ikonky funkcií = kartuše z banky (`public/web-app/ikony/*.webp`, Matej 8. 11.: „funkcie na nete v kartuši“,
 *  zdroj plany/nakresy/banka-ikon-2026-11-08/rez/*-kartusa.webp). Odrážky `li` sa zatiaľ nekreslia — doladíme ich neskôr. */
/** Texty funkcií sú v `appWeb/copy.ts` (kľúče `fx_<ikona>_h`, `fx_<ikona>_<n>`, `sx_<ikona>_h|p`), upravuje sa v balíku webu. */
type B = [string, boolean?];
const FEATS: { p: string; cls?: string; ic: string; li: B[] }[] = [
  { p: 'f1', cls: 'trip', ic: 'vylety',
    li: [['fx_vylety_1'], ['fx_vylety_2'], ['fx_vylety_3'], ['fx_vylety_4'], ['fx_vylety_5']] },
  { p: 'f8', ic: 'mapa',
    li: [['fx_mapa_1'], ['fx_mapa_2'], ['fx_mapa_3'], ['fx_mapa_4']] },
  { p: 'f2', ic: 'dogid',
    li: [['fx_dogid_1'], ['fx_dogid_2'], ['fx_dogid_3'], ['fx_dogid_4']] },
  { p: 'f3', ic: 'zapis',
    li: [['fx_zapis_1'], ['fx_zapis_2'], ['fx_zapis_3'], ['fx_zapis_4']] },
  { p: 'f4', ic: 'ainubis',
    li: [['fx_ainubis_1'], ['fx_ainubis_2'], ['fx_ainubis_3'], ['fx_ainubis_4']] },
  { p: 'f5', ic: 'sniffer',
    li: [['fx_sniffer_1'], ['fx_sniffer_2'], ['fx_sniffer_3']] },
  { p: 'f6', cls: 'sos', ic: 'sos',
    li: [['fx_sos_1'], ['fx_sos_2'], ['fx_sos_3'], ['fx_sos_4', true], ['fx_sos_5', true]] },
  { p: 'f7', ic: 'feed',
    li: [['fx_feed_1'], ['fx_feed_2'], ['fx_feed_3']] },
];
/** CLAIM 2: SOS na webe = to isté, čo SOS v appke (`SosButton.tsx`), aj s pripravovaným. Prvá pomoc bez „čoskoro“ —
 *  pri FLIPe je hotová (Matej 21. 11.); zbierky, útulky a týranie ostávajú „čoskoro“ ako v appke. */
/* 22. 11. (Matej): každý riadok na jeden riadok; nahlásenie týrania je hotové, „čoskoro“ ostáva len pri zbierkach a útulkoch */
const SOS_LI_V2: [string, boolean?][] = [['fx_sos_4'], ['sos_vet'], ['sos_lost2'], ['fx_sos_2'], ['sos_danger2'], ['sos_abuse'], ['sos_fund2', true]];
const SOON: { ic: string }[] = [
  { ic: 'merch' },
  { ic: 'gps' },
  { ic: 'vyskumy' },
  { ic: 'centra' },
];

/** Snímka appky v jazyku webu: SK = `<src>.webp`, inak anglická `<src>-en.webp` (11. 11. 2026). */
const useShot = () => { const { lang } = useLang(); return (src: string) => `${A}/snimky/${src}${lang === 'sk' ? '' : '-en'}.webp`; };

function Phone({ src }: { src: string }) {
  const shot = useShot();
  return (
    <div className="phone">
      <img className="fr" src={`${A}/phone.svg`} alt="" />
      <div className="scr"><img loading="lazy" src={shot(src)} alt="" decoding="async" /></div>
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

/** VÝLETY (nákres 7. 11. 2026, Matej: „krátka sekcia, ako sa nakliká výlet a vysvedčenie, s CTA na verejnú /map“).
 *  Tri kroky na ťuk menia snímku v telefóne; krok 3 je celá karta TRIPSTATS (ŠTATISTIKY), ktorá sa v telefóne
 *  pomaly roluje — vysvedčenie je dlhé a práve tá dĺžka je pointa. Čísla sa rátajú z kurátorských trás
 *  (lazy import — 400 KB dát nesmie zaťažiť prvé načítanie stránky). */
const TRIP_SHOTS = ['11-vretenica-mapa', 'plus-von', 'tripstats-cela'];
const TRIP_SHOTS_V2 = ['app-mapa-bliz', 'app-mapa-pridat', 'app-tripstats'];
function TripsSection({ c }: { c: (k: string) => string }) {
  const shot = useShot();
  const { lang } = useLang();
  const shots = useMemo(() => (isClaim() ? TRIP_SHOTS_V2 : TRIP_SHOTS), []);
  const [ref, near] = useNear<HTMLDivElement>('400px');
  /* Mobil (pod 768 px sú kroky pod telefónom, prepínanie nevidno) začína hneď ŠTATISTIKAMI — Matej 11. 11. */
  const [step, setStep] = useState(() => (window.matchMedia('(max-width: 767px)').matches ? 2 : 0));
  const [nums, setNums] = useState<[number, number, number] | null>(null);
  useEffect(() => {
    if (!near) return;
    let alive = true;
    import('@/data/heroTrails.generated').then(({ HERO_TRAILS }) => {
      if (!alive) return;
      const km = HERO_TRAILS.reduce((a, t) => a + (parseFloat(t.km) || 0), 0);
      const lands = new Set(HERO_TRAILS.map((t) => t.country ?? 'sk')).size;
      setNums([HERO_TRAILS.length, Math.round(km), lands]);
    }).catch(() => { /* čísla sú doplnok, kroky stoja aj bez nich */ });
    return () => { alive = false; };
  }, [near]);
  return (
    <section id="trips" className="trips">
      <div className="wrap" ref={ref}>
        <Rv className="sec-h">
          <p className="eye">{c('e_trips')}</p>
          <h2>{c('h_trips1')} <span className="deco">{c('h_trips2')}</span></h2>
          <p className="lead">{c('l_trips')}</p>
        </Rv>
        <div className="tr-grid">
          <Rv className="tr-steps">
            {[1, 2, 3].map((n, i) => (
              <button key={n} type="button" className={`pk-stage tr-step${step === i ? ' on' : ''}`} aria-pressed={step === i}
                onClick={() => setStep(i)} onPointerEnter={(e) => { if (e.pointerType === 'mouse') setStep(i); }}>
                <span className="tr-ic"><img loading="lazy" src={`${A}/ikony/kroky-${n}.webp`} alt="" /></span>
                <b>{c(`ts${n}`)}</b>
                <span className="tr-p">{c(`ts${n}p`)}</span>
              </button>
            ))}
          {nums && (
            <div className="tr-nums">
              <span><b>{nums[0]}</b>{c('tn1')}</span>
              <span><b>{nums[1].toLocaleString(intlLocale(lang))}</b>{c('tn2')}</span>
              <span><b>{nums[2]}</b>{c('tn3')}</span>
            </div>
          )}
          </Rv>
          <Rv d={1} className={`tr-phone s${step}`}>
            <div className="phone">
              <img className="fr" src={`${A}/phone.svg`} alt="" />
              <div className="scr">
                {shots.map((src, i) => (
                  <img loading="lazy" key={src} className={`tr-shot${i === 2 ? ' tall' : ''}${step === i ? ' on' : ''}`} src={shot(src)} alt="" decoding="async" />
                ))}
              </div>
            </div>
          </Rv>
        </div>
        <Rv className="tr-foot">
          <a className="pk-cta" href="/map" target="_blank" rel="noopener">{c('t_cta')}</a>
          <p className="tr-sub">{c('t_cta_s')}</p>
        </Rv>
      </div>
    </section>
  );
}

function Counter({ to, run, suffix }: { to: number; run: boolean; suffix?: ReactNode }) {
  const { lang } = useLang();
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
  return <>{v.toLocaleString(intlLocale(lang))}{suffix}</>;
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

/** Je prvok pri obrazovke? Vracia REF (nie state), takže zmena nespustí prekreslenie stránky.
 *  Časovače (karusel, Učeň) sa mimo obrazovky nehýbu — inak každý tik prekresľoval celý strom aj počas scrollu. */
function useOnScreen(selector: string) {
  const on = useRef(true);
  useEffect(() => {
    const el = document.querySelector(selector); if (!el) return;
    on.current = false;
    const io = new IntersectionObserver(([e]) => { on.current = e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, [selector]);
  return on;
}

/** Blok, ktorý sa vynorí pri scrolle (`.rv` → `.in`). */
/** Život hrou: bohaté kresby bez kartuše ako triplist (Matej 8. 11.), výber a alternatívy v továrni `plany/ikonky/`, skupina „Web: Život hrou“. */
const VERBS = [1, 2, 3, 4, 5, 6];

function Rv({ as = 'div', d = 0, className = '', children }: { as?: 'div' | 'p' | 'details'; d?: number; className?: string; children: ReactNode }) {
  const [ref, seen] = useNear<HTMLDivElement>();
  const Tag = as as 'div';
  return (
    <Tag ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ ['--d' as string]: d } as CSSProperties}>
      {children}
    </Tag>
  );
}

/** Do živej appky v telefóne sa vstrekne štýl, ktorý skryje predajné prvky /magnet
 *  (kartu a lištu s cenou €11 — appka je od 5. 11. zadarmo) a vývojárske tlačidlá. */

/** PÁS SVORKY (Matej 6. 11.: „progres bar s tvárami psov, ako už máme, aj meno posledného“) — pokojná verzia
 *  pásu z /onepage (tam ho riadi kamera filmu): Hekthor #1 · rovnomerne vybrané psy z celej svorky · posledný pes
 *  s menom a číslom · prerušovaná cesta k 1M. Dáta = ten istý feed steny (`get-grid-dogs`), fotky ako náhľad 180 px. */
type TrailDog = { n: number; name: string; u: string };
const TRAIL_MID = 14;
const cldThumb = (u: string) => u.replace('/upload/', '/upload/c_fill,g_auto,w_180,h_180,q_auto,f_auto/');
/* Dočasne bez použitia: blok Potrebujeme ťa ide do STORY (Matej 10. 11.). */
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
  /* náplň skla siaha presne po posledného psa — šírka zhluku tvárí sa zmeria, nie odhadne */
  const faces = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = faces.current; if (!f) return;
    const set = () => f.parentElement?.style.setProperty('--trail-w', `${f.offsetWidth + 56}px`);
    set(); const ro = new ResizeObserver(set); ro.observe(f);
    return () => ro.disconnect();
  }, [pack.length]);
  const last = pack[pack.length - 1];
  const mid = pack.length > 3 ? Array.from({ length: Math.min(TRAIL_MID, pack.length - 2) }, (_, i) => pack[Math.round(1 + ((i + 1) * (pack.length - 2)) / (Math.min(TRAIL_MID, pack.length - 2) + 1))]) : [];
  return (
    <div className="trail" ref={ref}>
      {/* lesklý „liquid“ pás ako pri leveloch (Matej 6. 11.): oranžová náplň nesie tváre, zvyšok skla čaká na milión */}
      <div className="trail-row">
        <div className="trail-glass" aria-hidden><span className="trail-fill"><i /></span></div>
        <div className="trail-faces" ref={faces}>
          <span className="trail-end"><img src="/images/hektor-grid.webp" alt="" /><em>Hekthor <b>#1</b></em></span>
          <span className="trail-mid">{mid.map((d) => <img key={d.n} src={d.u} alt="" />)}</span>
          {last && <span className="trail-end trail-last"><img src={last.u} alt="" /><em>{last.name} <b>#{last.n}</b></em></span>}
        </div>
        <span className="trail-goal"><b>1M</b><em>{goal}</em></span>
      </div>
    </div>
  );
}

/** Vstup do heroflowu — jediné CTA hlavnej stránky (FLIP 17. 11. 2026). */
const START = '/heroglyph/name';

/** Živá planétka z `/` — montuje sa až pri obrazovke a mimo nej stojí. */
function LivePlanet({ v2 }: { v2?: { enter: string; href: string; find: string; hall: string; back: string; center: string } }) {
  const [mountRef, near] = useNear<HTMLDivElement>('1500px');
  const [visRef, vis] = useNear<HTMLElement>('0px', false);
  return (
    <div ref={mountRef}>
      <section id="join" className={`planet-live theme-light${v2 ? ' v2' : ''}`} ref={visRef}>
        {/* `.aw .pop` (modal /app) zasiahne aj `.planet-root.pop` = guľa s otvorenou kartou psa → display:none, guľa zmizne.
            Tu ju vrátime na pôvodné hodnoty (rovnaké ako `.planet-root` v DogPlanetLab). */}
        {/* iPhone Safari radí 3D dlaždice gule podľa hĺbky a z-index ignoruje → karta sa cez guľu prerezala (Matej 7. 11., snímka WENSDY #103).
            Karta preto ide v 3D dopredu (translate Z, bez perspektívy = bez zmeny veľkosti) v spoločnom 3D priestore s guľou. */}
        <style>{`.aw .planet-live .planet-root.pop{display:flex;position:fixed;inset:0;z-index:80;padding:0;animation:none;align-items:center;justify-content:center}.aw .planet-live .planet-root.pop{transform-style:preserve-3d}.aw .planet-live .planet-root.pop .pp-panel{z-index:20;translate:0 0 2000px}.aw .planet-live .planet-root .planet-stage{z-index:1}`}</style>
        {near && <Suspense fallback={null}><GodsGridLab embedded paused={!vis} planetAnywhere v2={v2} /></Suspense>}
        {/* odkazy do obchodov sa presťahovali z bloku POTREBUJEME ŤA sem, vľavo dole (Matej 6. 11.) */}
        <div className="planet-stores"><Stores /></div>
      </section>
    </div>
  );
}

export default function AppWeb() {
  const { lang } = useLang();
  const t = useT();
  const L: Lang2 = lang === 'sk' ? 'sk' : 'en';
  /* ostatných 16 jazykov: slovník sa stiahne až pri prepnutí; kým nepríde (a pri chýbajúcom kľúči), ide EN */
  const [X, setX] = useState<Record<string, string> | null>(null);
  useEffect(() => { let on = true; setX(null); loadLang(lang).then((d) => { if (on) setX(d); }); return () => { on = false; }; }, [lang]);
  /* CLAIM 2 (Matej 21. 11.) — nový hlavný claim, texty a poradie slajdov. Zatiaľ LEN za `?claim`; na LIVE až po jeho „ok“
     (vtedy V2 = true a staré vetvy preč). Texty `appWeb/claim.ts` prebíjajú všetky jazyky. */
  const V2 = useMemo(isClaim, []);
  /* kolo textov 22. 11. (`claim22.ts`) prebíja CLAIM */
  const cl = (k: string) => (V2 ? CLAIM22[k] ?? CLAIM[k] : undefined);
  const c = (k: string) => (cl(k) ? cl(k)![lang] ?? cl(k)!.en : undefined) ?? X?.[k] ?? COPY3[k]?.[L] ?? COPY[k]?.[L] ?? '';
  const loc = intlLocale(lang);
  /* STENA (GodsGridLab na konci) a jej okná píšu Cinzelom priamo v kóde (vanilla DOM, ~100 miest) —
     na novom webe sa preto prekryje rodina: Cinzel → Museum Medium (nadpisy webu), Cinzel Decorative
     → Museum Black (meno psa = zlaté slovo). Len kým je táto stránka otvorená; po flipe ide s ňou (Matej 11. 11.). */
  useEffect(() => {
    const face = (fam: string, file: string) => [400, 500, 600, 700, 800, 900]
      .map((w) => `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:swap;src:url(/fonts/${file}.woff2) format('woff2')}`).join('');
    const el = document.createElement('style');
    el.id = 'aw-wall-fonts';
    el.textContent = face('Cinzel', 'museum-medium') + face('Cinzel Decorative', 'museum-black');
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
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
  /* vysvetlivka odznaku v hero: ťuk otvorí, druhý ťuk alebo ťuk mimo zavrie (Matej 7. 11.: „pils nejdú zavrieť“) */
  const [tipOn, setTipOn] = useState(0);
  const [vidOn, setVidOn] = useState(false);
  /* dar bez registrácie: „TU“ vo FAQ otvorí okno, návrat zo Stripe (`?dakujeme` / `?zrusene`) ukáže poďakovanie */
  const [giftOn, setGiftOn] = useState(false);
  const gift = useGiftReturn();
  useEffect(() => { if (V2 && location.hash === '#dar') setGiftOn(true); }, [V2]);
  useEffect(() => { if (!tipOn) return; const off = () => setTipOn(0); window.addEventListener('click', off); window.addEventListener('scroll', off, { passive: true }); return () => { window.removeEventListener('click', off); window.removeEventListener('scroll', off); }; }, [tipOn]);
  useEffect(() => {
    const f = () => { setStuck(window.scrollY > 24); };
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);

  const flt = (n: number) => <><span className="tx">{c(`fl${n}a`)}<small>{c(`fl${n}b`)}</small></span><span className="tip">{c(`fl${n}t`)}</span></>;

  /* karusel */
  const [ci, setCi] = useState(0);
  const CAR = V2 ? CAROUSEL_V2 : CAROUSEL;
  const hov = useRef(false);
  const carOn = useOnScreen('.aw .car');
  useEffect(() => {
    const id = setInterval(() => { if (!hov.current && carOn.current) setCi((i) => (i + 1) % CAR.length); }, 4200);
    return () => clearInterval(id);
  }, []);
  const sx = useRef<number | null>(null);
  const pos = (i: number) => {
    const n = CAR.length;
    return i === ci ? 'cur' : i === (ci - 1 + n) % n ? 'prev' : i === (ci + 1) % n ? 'next' : 'off';
  };

  /* funkcie — na dotyk sa karta rozbalí */
  const [vOn, setVOn] = useState<number | null>(null);
  const [tierOn, setTierOn] = useState<number | null>(null);
  const [trOn, setTrOn] = useState(false);

  /* VSTUPNÉ (E4, 11. 11.): ťuk na kartu = výber (lapis rám) + otočenie; CTA platí za vybranú hodnosť.
     Predvolený APOŠTOL (id knaz, odporúčané). Vezír (id farao): suma + mesačne / raz a navždy. */
  const [pick, setPick] = useState(2);
  const [fAmt, setFAmt] = useState<number>(111);
  const [fKind, setFKind] = useState<'month' | 'once'>('month');
  const [payBusy, setPayBusy] = useState(false);
  const [payErr, setPayErr] = useState(false);
  const [rankNow, setRankNow] = useState<string | null>(null);
  const [thanks, setThanks] = useState<string | null>(null);
  // Kotva z inej stránky (`/wall` → `/#join`, odkazy zo /story) — SPA ju sama neodroluje.
  // `/hall` (Sieň psov, 21. 11. 2026) = tá istá stránka otvorená na stene, preto ide rovno na `#join`.
  useEffect(() => {
    const id = window.location.pathname === '/hall' ? 'join' : window.location.hash.slice(1);
    if (!id || qs.get('vstupne')) return;
    const t = setTimeout(() => scrollToId(id, false), 400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const sid = qs.get('vstupne');
    if (sid && /^cs_(test|live)_/.test(sid)) {
      paidRank(sid).then((r) => { if (r) setThanks(r); }).catch(() => {});
      window.history.replaceState(null, '', '/#badges');
      setTimeout(() => document.getElementById('badges')?.scrollIntoView(), 300);
    }
    myRank().then((r) => {
      setRankNow(r);
      const k = RANK_OF_CARD.indexOf(r as never);
      if (k > 0) setPick(k); // platiaci vidí vybranú svoju hodnosť
    }).catch(() => {});
  }, [qs]);
  const pay = async () => {
    const rank = RANK_OF_CARD[pick];
    if (!rank || payBusy) return;
    setPayBusy(true); setPayErr(false);
    const kind = rank === 'farao' ? fKind : 'month';
    const r = await startCheckout(rank, kind, rank === 'farao' ? fAmt : undefined, L).catch(() => 'error' as const);
    if (r === 'login') window.location.href = loginUrl();
    else if (r === 'error') { setPayErr(true); setPayBusy(false); }
  };
  const manage = async () => {
    setPayBusy(true);
    const r = await openPortal().catch(() => 'error' as const);
    if (r === 'login') window.location.href = loginUrl();
    else if (r === 'error') { setPayErr(true); setPayBusy(false); }
  };
  const eur = (n: string) => (L === 'sk' ? n : n.replace(',', '.'));  // suma ostáva v zápise EN mimo SK

  /* odznaky */

  /* ťuk na svet v lieviku doroluje k zvitkom */
  const scrollsRef = useRef<HTMLDivElement>(null);
  const [aiTab, setAiTab] = useState(0);
  const pickWorld = () => { setAiTab(0); scrollsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const [ucOn, setUcOn] = useState(3);
  /* mozog Učňa: kým sa nikto nedotkne odznaku, prechádza úrovne sám (1 → 10 → znova) */
  const ucTouched = useRef(false);
  const [ucLive, setUcLive] = useState<number | null>(null);
  const ucenOn = useOnScreen('.aw .ai-ucen2');
  useEffect(() => {
    const id = setInterval(() => { if (!ucTouched.current && ucenOn.current) setUcOn((i) => (i + 1) % UCEN_PCT.length); }, 2600);
    return () => clearInterval(id);
  }, []);
  const i18nPct = (p: string) => (p === '1.' ? c('uc_first') : `${p} ${c('uc_vault')}`);
  /* hlavička nad tmavou sekciou AINUBIS tmavne (Matej 6. 11.: „header sa pri tejto sekcii zmení na tmavý, s bledým logom“) */
  const aiSecRef = useRef<HTMLElement>(null);
  const [darkHead, setDarkHead] = useState(false);
  const [onPlanet, setOnPlanet] = useState(false);
  useEffect(() => {
    const planet = document.querySelector('.aw .planet-live');
    let raf = 0;
    const f = () => {
      raf = 0;
      const r = aiSecRef.current?.getBoundingClientRect(); setDarkHead(!!r && r.top < 60 && r.bottom > 60);
      /* posledná sekcia (planétka) je ukotvená na celú obrazovku ako na LIVE `/` — hlavička jej ustúpi */
      const pl = planet?.getBoundingClientRect(); setOnPlanet(!!pl && pl.top < innerHeight * 0.35);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(f); };
    f(); addEventListener('scroll', onScroll, { passive: true });
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const vault = Object.values(VAULT_COUNTS);
  const vScrolls = vault.reduce((s, w) => s + w.scrolls, 0);
  const vCircles = vault.reduce((s, w) => s + w.circles, 0);

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

  const secLife = (<>
      {/* 2 · ŽI PSÍ ŽIVOT */}
      <section id="life" className="life">
        <div className="wrap split">
          <Rv className="fresco"><img loading="lazy" src={`${A}/vyjavy/zivot-hrou.webp`} alt="" /></Rv>
          <Rv d={1} className="life-txt">
            <p className="eye">{c('e_life3')}</p>
            <h2 className={V2 ? 'v2' : undefined}><span className="l1">{c('h_life2a')}</span><span className="l1"><span className="deco big">{c('h_life2b')}</span></span>{V2 && <span className="l3">{c('h_life2c')}</span>}</h2>
            <p className="lead">{c('l_life2')}</p>
            <div className="verbs">
              {VERBS.map((n, i) => (
                <Rv key={i} d={i + 1} className="verb-w">
                  <button type="button" className={`pk-stage verb ${vOn === i ? 'on' : ''}`} onClick={() => setVOn(vOn === i ? null : i)}>
                    <span className="ic"><img loading="lazy" src={`${A}/ikony/hra-${n}.webp`} alt="" /></span>
                    <b>{c(`v${i + 1}`)}</b>
                    <span className="vp">{c(`v${i + 1}p`)}</span>
                  </button>
                </Rv>
              ))}
            </div>
          </Rv>
        </div>
      </section>
  </>);
  const secIg = (<>
      {/* 3 · PRE PSOV, S DUŠOU — CLAIM 2: na mobile len jeden IG a jeden DOGYPT (Matej 22. 11.) */}
      <section className={V2 ? 'ig-v2' : undefined}>
        <div className="wrap">
          <Rv className="sec-h">
            <Note k="n_ig" />
            <h2 className="soul-h">{c('h_soul1')} <span className="l2"><span className="deco">DOGYPT</span> {c('h_soul2')}</span></h2>
            {V2
              /* VID, nie VIP (Matej 22. 11.): bodkovane podčiarknuté, ťuk/hover ukáže „Very Important Dog“ */
              ? <p className="lead">{c('soul_a')} <button type="button" className={`tr-dot vid${vidOn ? ' on' : ''}`} aria-expanded={vidOn} onClick={() => setVidOn(!vidOn)}>VID<span className="tip" role="note">{c('vid_t')}</span></button> {c('soul_b')}</p>
              : <p className="lead">{c('l_soul')}</p>}
          </Rv>
          <div className="vs">
            <Rv className="vs-col">
              <IgMock c={c} />
              <div className="vs-tag ig"><IgIcon /><p>{c('cap1')}</p></div>
            </Rv>
            <Rv d={1} className="mid">VS</Rv>
            <Rv d={2} className="vs-col">
              {V2
                /* DOGYPT ako vejár troch telefónov, zrkadlo IG (Matej 23. 11.: zápis dňa a Učeň „skúsme to dať sem“):
                   v strede profil s heroglyfom, po bokoch zápis dňa a otvorený Učeň; mobil = len profil ako pri IG */
                ? <div className="dgrow">
                    <Tilt set="zapis" src="app-zapis" className="dgph dgph1" />
                    <Tilt set="profile" src="app-profil-heroglyf" className="dgph dgph2" />
                    <Tilt set="ucen" src="app-ucen" className="dgph dgph3" />
                  </div>
                : <Tilt set="profile" src="profil-heroglyf" />}  {/* profil s HEROGLYFOM (Matej 11. 11., snímka z jeho telefónu) */}
              <div className="vs-tag dg"><img className="vs-ico" src="/web-app/app-icon.png" alt="DOGYPT" /><p>{c('cap2')}</p></div>
            </Rv>
          </div>
          <Rv className="alba-sec">
            <p className="eye">{c('e_alba')}</p>
            <h2 className="alba-h">{c('h_alba_a')} <span className="deco">{c('h_alba_b')}</span> {c('h_alba_c')}</h2>
            <p className="lead alba-lead">{c('l_alba')}</p>
          </Rv>
          <Rv><AlbaTrio /></Rv>
          <Rv><AlbaCount c={c} /></Rv>
          <Rv className="alba-sec gz-sec">
            <GlyphZones />
          </Rv>
        </div>
      </section>
  </>);
  const secFeat = (<>
      {/* 4 · FUNKCIE */}
      <section id="features">
        <div className="wrap">
          <Rv className="sec-h"><p className="eye">{c('e_feat')}</p><h2>{c('h_feat_a')} <span className="deco">{c('h_feat_b')}</span></h2></Rv>
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
                  <span className="fti"><img loading="lazy" src={`${A}/ikony/${f.ic}.webp`} alt="" /></span>
                  <h3>{c(`fx_${f.ic}_h`)}</h3><p>{c(f.p)}</p>
                </button>
                <ul className={`fmore${V2 && f.ic === 'sos' ? ' dense' : ''}`}>{(V2 && f.ic === 'sos' ? SOS_LI_V2 : f.li).map(([tx, soon], k) => <li key={k} className={soon ? 'soon' : ''}>{c(tx)}{soon && <em>{c('soon')}</em>}</li>)}</ul>
              </Rv>
            ))}
          </div>
          <Rv as="p" className="soon-h">{c('soon_h')}</Rv>
          <div className="fgrid" data-tile={tile}>
            {SOON.map((f, i) => (
              <Rv key={f.ic} d={i} className="fcard soon">
                <div className="fti"><img loading="lazy" src={`${A}/ikony/${f.ic}.webp`} alt="" /></div>
                <h3>{c(`sx_${f.ic}_h`)}</h3><p>{c(`sx_${f.ic}_p`)}</p>
              </Rv>
            ))}
          </div>
          {nakres && <p style={{ textAlign: 'center', marginTop: 16 }}><Note k="n_ikony" flag /></p>}
        </div>
      </section>
  </>);

  return (
    <div className="aw" data-bg={bg} data-pz="0" ref={rootRef}>
      <Seo path="/" title={`DOGYPT · ${c('seo_t')}`} description={plain(c('sub'))} />
      <style>{STAGE_CSS}</style>
      <div className="aw-bg" aria-hidden><i className="glyphs" /><i className="pearl" /><i className="pearl p1" /><i className="pearl p2" /></div>

      <WebTop c={c} v2={V2} cls={`${stuck ? 'stuck' : ''}${darkHead ? ' dark' : ''}${onPlanet ? ' away' : ''}`.trim()} />

      <main>
      {/* 1 · HERO */}
      <section className={`hero${V2 ? ' v2' : ''}`}>
        <div className="wrap">
          <div className="hero-txt">
            <p className="eye">{c('e_life2')}</p>
            {/* DOMINANTA: tri riadky, čo najväčšie písmo — veľkosť z najdlhšieho riadka (Matej 6. 11.: „čo najväčší text
                na dva riadky resp. aj na 3: play the · life with · your dog“). Zlaté slovo psa ostáva na krivo. */}
            <h1 style={{ ['--hc' as string]: Math.max(wlen(c('h1a')), V2 ? 0 : wlen(c('h1b')), (V2 && c('h1b') ? wlen(c('h1b')) + 1 : 0) + (c('h1y') ? wlen(c('h1y')) + 1 : 0) + wlen(c('h1c')) * (V2 ? 1.18 : 1)) } as CSSProperties}>
              {V2 ? (<>
                {/* CLAIM 2 na DVA riadky (Matej 21. 11.: „claim do 2 riadkov, 3 sú už veľa“) */}
                <span className="l1">{c('h1a')}</span>
                <span className="l1">{c('h1b') && <>{c('h1b')} </>}<span className="deco big">{c('h1c')}</span></span>
              </>) : (<>
              <span className="l1">{c('h1a')}</span>
                <span className="l1">{c('h1b')}</span>
                <span className="l1">{c('h1y') && <>{c('h1y')} </>}<span className="deco big">{c('h1c')}</span></span>
              </>)}
            </h1>
            <p className="lead">{rich(c('sub'))}</p>
            {V2 ? (
              /* CTA + cieľ pod ním NA ŠÍRKU TLAČIDLA (Matej 21. 11.: „progresbar pod CTA a na šírku tlačidla, nech to vyzerá súmerne“);
                 odznaky obchodov sú neklikacie, kým appka nie je vonku */
              <div className="hero-go v2">
                <div className="goal-w">
                  <a className="pk-cta" href={START}>{c('start')}</a>
                  <div className="pk-progress"><div className="pk-progress__fill" style={{ width: `${Math.max(3, dogs / 10000)}%` }} /></div>
                  <p className="goal-t">{c('goal')} <b><Counter to={dogs} run={proofRun} /></b> / {(1000000).toLocaleString(loc)} {c('p1')}</p>
                  {/* CTA, cieľ aj odznaky v JEDNEJ šírke (Matej 21. 11.); odznaky nesmú byť lapis, inak CTA zaniká */}
                  <Stores soon={c('soon')} />
                </div>
              </div>
            ) : (<>
            <div className="hero-go">
              <a className="pk-cta" href={START}>{c('start')}</a>
              <a className="hero-login" href="/login">{c('have_acc')} <b>{c('login')}</b></a>
            </div>
            <div className="proof">
              <div><b><Counter to={dogs} run={proofRun} /></b><span>{c('p1')}</span></div>
              <div><b>{stats?.people ? <Counter to={stats.people} run={proofRun} /> : '—'}</b><span>{c('p2')}</span></div>
              <div><b><Counter to={stats?.countries || 8} run={proofRun} /></b><span>{c('p3')}</span></div>
            </div>
            </>)}
          </div>
          <div
            className="car"
            onMouseEnter={() => { hov.current = true; }}
            onMouseLeave={() => { hov.current = false; }}
            onTouchStart={(e) => { sx.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (sx.current == null) return;
              const dx = e.changedTouches[0].clientX - sx.current;
              if (Math.abs(dx) > 40) setCi((i) => (i + (dx < 0 ? 1 : -1) + CAR.length) % CAR.length);
              sx.current = null;
            }}
          >
            {CAR.map(([set, src], i) => (
              <Tilt key={set} set={set} src={src} className={`ph ${pos(i)}`} onOpen={() => setCi(i)} />
            ))}
            {!V2 && <span className={`flt f1${tipOn === 1 ? ' on' : ''}`} tabIndex={0} onClick={(e) => { e.stopPropagation(); setTipOn(tipOn === 1 ? 0 : 1); }}><img className="xl" src={`${A}/odznaky/pilgrim-1.webp`} alt="" />{flt(1)}</span>}
            {!V2 && <span className={`flt f2${tipOn === 2 ? ' on' : ''}`} tabIndex={0} onClick={(e) => { e.stopPropagation(); setTipOn(tipOn === 2 ? 0 : 2); }}><img className="xl" src={`${A}/odznaky/servant-2.webp`} alt="" />{flt(2)}</span>}
            {/* CLAIM 2: odznaky v hero zrušené úplne (Matej 22. 11.: „dajme preč úplne… aj mobil aj pc aj po scrolle“) */}
            {!V2 && <span className={`flt f3${tipOn === 3 ? ' on' : ''}`} tabIndex={0} onClick={(e) => { e.stopPropagation(); setTipOn(tipOn === 3 ? 0 : 3); }}><img className="xl" src={`${A}/odznaky/${V2 ? 'ucen-4' : 'ucen-1'}.webp`} alt="" />{flt(3)}</span>}
          </div>
        </div>
      </section>

      {/* PORADIE SLAJDOV — CLAIM 2: úžitok (funkcie) hneď za hero, hra až po ňom, Instagram za AINUBISOM.
          Sekcie sú konštanty nad `return`, aby sa dali preskladať bez kópie. */}
      {V2 ? <>{secFeat}{secLife}</> : <>{secLife}{secIg}{secFeat}</>}

      {/* 5b · VÝLETY — pilotná funkcia (nákres 7. 11.): tri kroky v telefóne, vysvedčenie = TRIPSTATS, CTA na verejnú /map */}
      <TripsSection c={c} />

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
            <h2 className="ai-h2">{c('h_ai1')}<br />{c('h_ai2')} <span className="ai-deco">{c('h_ai3b')}</span></h2>
            <p className="lead">{c('l_ai')} <span className="ai-still" tabIndex={0}>({c('still')})<span className="tip">{c('still_t')}</span></span></p>
          </Rv>
          <AiFlow L={L} c={c} onWorld={pickWorld} published={['nutrition', 'dogsPath', 'understanding', 'anatomy']} counter={(n, run) => <Counter to={n} run={run} />} learn={
            <div className="ai-learn3 one" ref={scrollsRef}>
              {/* zvitky, podcasty a chat = jedna ukážka so záložkami (Matej 10. 11.: skrátiť AINUBIS); bloky ostávajú pripojené, aby prepnutie nezastavilo podcast */}
              <div className="ai-tabs" role="tablist" data-fa="4">
                {['ai_t1', 'ai_t2', 'ai_t3'].map((k, i) => <button key={k} type="button" role="tab" aria-selected={aiTab === i} className={aiTab === i ? 'on' : ''} onClick={() => setAiTab(i)}>{c(k)}</button>)}
              </div>
              <div className="ai-card ai-paluba wide" hidden={aiTab !== 0}>
                <Ic n="zvitky" cls="ai-cic" /><span className="k">{c('lr1k')}</span><h3 className="ai-ch">{c('lr1h')}</h3><p>{c('lr1p')}</p>
                <AiScrolls L={L} c={c} />
              </div>
              <div className="ai-card ai-paluba" hidden={aiTab !== 1}><Ic n="podcast" cls="ai-cic" /><span className="k">{c('lr2k')}</span><h3 className="ai-ch">{c('lr2h')}</h3><p>{c('lr2p')}</p>
                {/* POČÚVAJ = mockup prehrávača na celú obrazovku + 18 jazykov (Matej 23. 11.: „dáme preč 5 podcastov na vypočutie“; 18 jazykov predbieha appku, tá dnes hrá 4) */}
                <div className="ai-listen">
                  <div className="ai-listen-ph"><Phone src="app-podcast" /></div>
                  <div className="ai-listen-lg">
                    <p className="ai-listen-n"><b>18</b><span>{c('pod18')}</span></p>
                    <div className="ai-listen-fl">{WEB_LANGS.map((x) => <img key={x.code} className={POD_LIVE.includes(x.code) ? undefined : 'off'} loading="lazy" src={flagUrl(x.flag, 40)} alt={x.name} title={x.name} />)}</div>
                    <p className="ai-listen-wip">{c('pod_wip')}</p>
                  </div>
                </div>
              </div>
              <div className="ai-card ai-paluba" hidden={aiTab !== 2}><Ic n="chat" cls="ai-cic" /><span className="k">{c('lr3k')}</span><h3 className="ai-ch">{c('lr3h')}</h3><p>{c('lr3p')}</p><AiChat L={L} c={c} head={AI_HEAD} /></div>
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
                <b>{ucLive == null ? (UCEN_PCT[ucOn] === '1.' ? '1' : UCEN_PCT[ucOn]) : `${(ucLive * 100).toLocaleString(loc, { maximumFractionDigits: 1 })} %`}</b>
                <span>{c(`uc_n${ucOn + 1}`)} · {c('ax3')} {ucOn + 1} · {ucLive == null && UCEN_PCT[ucOn] === '1.' ? c('uc_first') : c('uc_vault')}</span>
              </p>
              <p className="ai-ucscr"><b>{c('uc_scrolled')}: {Math.round((ucLive ?? (UCEN_PCT[ucOn] === '1.' ? 0 : parseFloat(UCEN_PCT[ucOn]) / 100)) * vScrolls).toLocaleString(loc)}</b> {c('uc_of')} {vScrolls.toLocaleString(loc)} {c('uc_scrolls')}</p>
              <div className="ai-ucrow">{UCEN_PCT.map((pc, i) => (
              <button key={i} type="button" aria-label={`${c(`uc_n${i + 1}`)} · ${c('ax3')} ${i + 1}`} title={c(`uc_n${i + 1}`)} className={`${ucOn === i ? 'on' : ''}${ucLive != null && i > ucOn ? ' off' : ''}`} onPointerEnter={() => { if (ucLive != null) return; ucTouched.current = true; setUcOn(i); }} onFocus={() => { if (ucLive != null) return; ucTouched.current = true; setUcOn(i); }} onClick={() => { if (ucLive != null) return; ucTouched.current = true; setUcOn(i); }}>
                <img loading="lazy" src={`${A}/odznaky/ucen-${i + 1}.webp`} alt="" />
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
              <Rv key={ic} d={i} className="ai-b glowb"><img loading="lazy" src={`${A}/ikony/ben-${ic}.webp`} alt="" /><h4>{c(`bn${i + 1}h`)}</h4><p>{c(`bn${i + 1}p`)}</p></Rv>
            ))}
          </div>
          <Rv as="p" className="ai-quote">{c('ai_quote')}<small><span className="ai-name"><b>AI</b>NUBIS</span></small></Rv>
        </div>

      </section>

      {V2 && secIg}

      {/* 5 · ONLINE HRA, KTORÁ POMÁHA OFFLINE — tri levely pre vlastného psa a hneď pod nimi Dogypťan pre ostatných,
          po ňom už len FAQ a planétka (Matej 10. 11.). Rozpad vstupného zatiaľ nie: „zatiaľ nedávajme žiadne delenie“. */}
      <section id="badges">
        <div className="wrap">
          <Rv className="sec-h">
            <p className="eye">{c('h_badge1')} {c('h_badge2')}</p>
            <h2>{c('h_play1')} <span className="deco">{c('h_play2')}</span></h2>
            <p className="lead">{c('l_play')}</p>
          </Rv>
          <Rv className="lv-h"><h3>{c('h_lv_a')} <span className="deco">{c('h_lv_b')}</span> {c('h_lv_c')}</h3></Rv>
          <div className="lv3">
            {LEVELS.map((p, i) => (
              <Rv key={p.ax} d={i} className="lv pk-stage">
                <span className="lv-pic"><img loading="lazy" src={p.scene} alt="" /></span>
                <b>{c(p.ax)}</b>
                <p className="lv-txt">{c(`lt_${p.ax}`)}</p>
                <BadgeDock start={p.start} items={Array.from({ length: p.n }, (_, k) => ({ src: `${A}/odznaky/${p.img(k)}`, cap: p.cap(k, c) }))} />
              </Rv>
            ))}
          </div>

          <Rv className="cit pk-stage">
            <div>
              <h3>{c('h_cit1')} <span className="deco">{c('h_cit2')}</span> {c('h_cit3')}</h3>
              <b className="cit-name">{c('ax0')}</b>
              <p className="lead">{c('l_cit1')}</p>
              <p className="lead">{c('l_cit2')}</p>
              <a className="pk-cta cit-vis" href={VISION_HREF}>{c('cta_vision')}</a>
            </div>
            <div className="pic"><img loading="lazy" src={`${A}/vyjavy/obcan.webp`} alt="" /></div>
          </Rv>
          <Rv className="cit-fee">
            <h3>{c('fee_h')} <span className="deco">{c('fee_h2')}</span></h3>
            {/* 100 % TRANSPARENTNOSŤ — tučne, bodkovane podčiarknuté; dotyk/hover ukáže blok o spoločnej pokladnici (Matej 11. 11.) */}
            <p className="lead">{c('fee_p')}{' '}
              <button type="button" className={`tr-dot${trOn ? ' on' : ''}`} aria-expanded={trOn} onClick={() => setTrOn(!trOn)}>{c('fee_tr')}</button>
            </p>
            <p className={`tr-pop pk-stage${trOn ? ' on' : ''}`} role="note">{c('fee_tr_i')}</p>
          </Rv>
          <div className="cit-ranks">
            {CITIZEN_PRICES.map((price, k) => (
              <Rv key={price} d={k}>
                {/* PREDNÁ strana: pečať + meno + cena + VISAČKA (pootočený štítok v odtieni pečate) · ťuk = karta sa OTOČÍ
                    a na rube sú výhody (Matej 11. 11.: „texting do bloku pootočeného, v odtieni odznaku… taká visačka“,
                    „detaily po ťuknutí sú nemastné neslané… na prvý pohľad veľa textu“). */}
                <button type="button" className={`cit-rank t${k}${k === 2 ? ' rec' : ''}${pick === k ? ' pick' : ''}${tierOn === k ? ' on' : ''}`} onClick={() => { setPick(k); setPayErr(false); setTierOn(tierOn === k ? null : k); }} aria-expanded={tierOn === k} aria-pressed={pick === k}>
                  <span className="cit-face pk-stage">
                    {k === 2 && <span className="cit-rec">{c('rec')}</span>}
                    <img loading="lazy" src={`${A}/odznaky/dogyptan-${k}.webp`} alt="" />
                    <span className="cap"><b>{c(`t${k}`)}</b><i>{L === 'sk' ? price : price.replace(',', '.')}{k > 0 && <small> {c(k < 4 ? 'per_mo' : 'mo_or_once')}</small>}</i></span>
                    <span className="tw">{c(`tw${k}`)}</span>
                  </span>
                  <span className="cit-back">
                    <img loading="lazy" src={`${A}/odznaky/dogyptan-${k}.webp`} alt="" />
                    <b>{c(`t${k}`)}</b>
                    <span className="bk">{c(`bk${k}`).split('|').map((x) => (
                      <span key={x} className={x[0] === '+' ? 'y' : 'n'}>{x.slice(1)}</span>
                    ))}</span>
                  </span>
                </button>
              </Rv>
            ))}
          </div>
          <Rv className="cit-cta">
            <p className="lead" style={{ margin: '0 auto 24px', maxWidth: 640 }}>{c('fee_tiers')}</p>
            {thanks && <p className="cit-thanks pk-stage" role="status">{c('pay_thanks')} <b>{c(`t${RANK_OF_CARD.indexOf(thanks as never)}`)}</b>.</p>}
            {pick === 4 && (
              <div className="cit-opts" role="group" aria-label={c('t4')}>
                <div className="cit-row">{FARAO_AMOUNTS.map((a) => (
                  <button key={a} type="button" className={`cit-opt${fAmt === a ? ' pk-pick' : ''}`} aria-pressed={fAmt === a} onClick={() => setFAmt(a)}>€{a}</button>
                ))}</div>
                <div className="cit-row">{(['month', 'once'] as const).map((k2) => (
                  <button key={k2} type="button" className={`cit-opt${fKind === k2 ? ' pk-pick' : ''}`} aria-pressed={fKind === k2} onClick={() => setFKind(k2)}>{c(k2 === 'month' ? 'pay_month' : 'pay_once')}</button>
                ))}</div>
              </div>
            )}
            {pick === 0
              ? <a className="pk-cta" href="#">{c('give')}</a>
              : RANK_OF_CARD[pick] === rankNow && !(pick === 4 && fKind === 'once')
                ? <p className="cit-mine pk-stage">{c('pay_mine')}</p>
                : (
                <button type="button" className="pk-cta" onClick={pay} disabled={payBusy}>
                  {c('pay_as')} {c(`t${pick}`)} · {pick === 4 ? `€${fAmt}${fKind === 'month' ? ` ${c('per_mo')}` : ''}` : `${eur(CITIZEN_PRICES[pick])} ${c('per_mo')}`}
                </button>
              )}
            {pick > 0 && RANK_OF_CARD[pick] !== rankNow && <p className="tr-sub cit-note">{c(pick === 4 && fKind === 'once' ? 'pay_note_once' : 'pay_note')}</p>}
            {payErr && <p className="tr-sub cit-err" role="alert">{c('pay_err')}</p>}
            {rankNow && rankNow !== 'veriaci' && rankNow !== 'zakladatel' && (
              <p className="cit-manage"><button type="button" className="tr-dot" onClick={manage} disabled={payBusy}>{c('pay_manage')}</button></p>
            )}
            {nakres && <p style={{ margin: '16px 0 0' }}><Note k="n_good" flag /></p>}
          </Rv>
          {/* jednorazová podpora bez konta (Matej 11. 11.): kto nechce hrať, môže prispieť; odkaz čaká na Stripe */}
          {/* CLAIM 2: blok zanikol (Matej 22. 11.) — podpora bez registrácie je jedna veta vo FAQ „Kto to financuje?“ */}
          {!V2 && <Rv className="cit-sup pk-stage">
            <img loading="lazy" className="cit-sup-ic" src={`${A}/ikony/centra.webp`} alt="" />
            <h3>{c('sup_h')} <span className="deco">{c('sup_h2')}</span></h3>
            <p className="lead">{c('sup_p')}</p>
            <a className="pk-cta alt" href="#">{c('sup_cta')}</a>
            <p className="tr-sub">{c('sup_s')}</p>
          </Rv>}
        </div>
      </section>

      {/* 9 · FAQ */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Rv className="sec-h faq-h"><p className="eye">FAQ</p><h2>{c('h_faq1')} <span className="deco">{c('h_faq2')}</span></h2></Rv>
          {/* 4 + 4: Matej 6. 11.: 1. zadarmo, 2. kto platí; vpravo zmysel a ľudia, kontakt posledný */}
          <div className="faq">
            {[['free', 'fund', 'dog', 'off'], ['why', 'who', 'cult']].map((col, i) => (
              <div className="faq-col" key={i}>
                {col.map((k) => (
                  <Rv as="details" key={k} className="pk-stage"><summary>{c(`fq_${k}`)}</summary><p>{c(`fa_${k}`)}
                    {V2 && k === 'fund' && <> <a href="mailto:woof@dogypt.com">{c('fund_mail')}</a> {c('fund_or')} <a href="#dar" onClick={(e) => { e.preventDefault(); setGiftOn(true); }}>{c('fund_here')}</a>{lang === 'chn' || lang === 'jpn' ? '。' : '.'}</>}</p></Rv>
                ))}
                {/* kontakt a odkazy z pätičky — pätička zanikla, posledná je planétka (Matej 6. 11.) */}
                {i === 1 && <Rv as="details" className="pk-stage"><summary>{c('q_contact')}</summary>
              <p>{c('fa_contact')}<br /><a href="mailto:woof@dogypt.com">woof@dogypt.com</a><br />
                <a href="/">{c('ft1')}</a> · <a href={L === 'sk' ? 'https://dogma.dogypt.com/' : 'https://dogma.dogypt.com/en/'}>DOGMA</a> · <a href="/privacy">{c('privacy')}</a><br />
                <small>© DOGYPT</small></p>
            </Rv>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 · ŽIVÁ PLANÉTKA — finále */}
      {V2 && (giftOn || gift.thanks || gift.canceled) && <GiftSheet c={c} thanks={gift.thanks} canceled={gift.canceled} onClose={() => { setGiftOn(false); gift.close(); }} />}
      <LivePlanet v2={V2 ? { enter: c('start'), href: START, find: c('pl_find'), hall: c('pl_hall'), back: c('pl_back'), center: c('pl_center') } : undefined} />
      </main>


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
