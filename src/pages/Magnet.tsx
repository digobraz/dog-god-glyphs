/**
 * /magnet — PREDAJNÁ STRÁNKA (12. 10. 2026). Verejná, ale NEINDEXOVANÁ a nikde
 * neprelinkovaná: chodí sa na ňu len odkazom (mail H3). Matej: *„bude verejná,
 * ale bude na ňu odkazovať odkaz, nenájdu ju na webe"*.
 *
 * 🔴 SKLADÁ SA LEN Z BRANDU (Matej 12. 10.: *„musí to byť alfa omega, že tvoríš len
 *    na základe nášho brandingu a konzistentne podľa dizajnu značky"*). Nákres v3
 *    v statickom HTML bol vymyslený štýl a Matej ho vrátil. Odtiaľto preto:
 *    · stránka = papyrus /onepage (`LAB`), nadpis + pilulky appiek = `APPS_TYPE_CSS`
 *      z filmu, telefóny = `Iphone15Pro` z filmu, CTA = lapis ako `.op-nxt-cta`;
 *    · bloky = katalóg `PACK_BLOCKS` (KARTA, PODBLOK, RIADOK, D-BLOK, PILULKA, POLE,
 *      PROGRES, FOTKA) — žiadny vlastný tvar;
 *    · AINUBIS = AI-PALUBA (`ainubisSkin`), zvitky = `ScrollCard`/`ScrollView`
 *      z /pack, mozog = `mountBrain` z /pack;
 *    · mapa = Mapy.com outdoor + svetelný meč (`TRAIL_SABER_LAYERS`) ako na /map;
 *    · kvíz = otázky a vyhodnotenie z `natureQuiz.ts` (ten istý kvíz ako /pack/nature).
 *
 * Tvar (Matej 12. 10. večer): VÝSLOVNE MOBIL, „link in bio" ako odkazy tvorcov na IG —
 * medailón, nadpis, krátky text, počty, BLOKY ODKAZOV (D-BLOK) + lapis CTA; obsah sekcií
 * je až POD blokmi a každá sekcia končí pilulkou späť na odkazy. Na PC ostáva stĺpec `COL`.
 * Sekcie: DOGTRIP s mapou (10 výletov) → AINUBIS (mozog nad zoznamom, všetko otvorené) →
 * DOG ID kvíz, výsledok za e-mail → myšlienka (pes z útulku, heroglyf) → svorka → CTA.
 */
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngTuple } from 'leaflet';
import { useT, useLang } from '@/i18n/LanguageContext';
import { Seo } from '@/components/Seo';
import { PageTopBar } from '@/components/PageTopBar';
import Iphone15Pro from '@/components/ui/iphone-15-pro';
import { LAB } from '@/lib/labTheme';
import { APPS_TYPE_CSS } from '@/components/lab/filmAppsType';
import { LAPIS, LAPIS_BTN_SHADOW, goldFrameCSS, pickTintCSS } from '@/components/pack/navGoldSkin';
import {
  PACK_BOX, PACK_THEME as T, PACK_SPACE, PACK_R, PACK_TEXT, PACK_HEAD, FONT_TITLE, FONT_UI,
  PILL_CSS, PF_FIELD_CSS, PROGRESS_CSS, PHOTO_CSS, MEDALLION_CSS,
} from '@/components/pack/packTheme';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { HERO_TRAILS, type HeroTrail } from '@/data/heroTrails.generated';
import { TRAIL_SABER_LAYERS, SABER_REST_OPACITY, ensureTrailLineCss, GOLD_ICON_FILTER, RatingPaws } from '@/components/pack/tripShared';
import { mapyTiles } from '@/lib/env';
import { BackButton } from '@/components/pack/BackButton';
import { MapAttribution, MAP_ATTR_CSS } from '@/components/pack/mapAttribution';
import { ScrollCard, ScrollView, SCROLL_CSS } from '@/components/pack/vault/ScrollParts';
import { usePublicScrolls, pickText, type DemoScroll } from '@/components/pack/vault/vaultScrolls';
import { VAULT_WORLDS } from '@/components/pack/vault/worlds';
import { VAULT_CIRCLES } from '@/components/pack/vault/circles';
import { mountBrain, type BrainHandle } from '@/components/pack/vault/brainEngine';
import ainubisHead from '@/assets/ainubis-head.webp';
import {
  ELEMENT_QUESTIONS, ROLE_QUESTIONS, NATURE_ELEMENTS, NATURE_ROLES, scoreNature, type NatureResult,
} from '@/components/pack/natureQuiz';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { openPhotoInvite } from '@/lib/photoInvite';
import { gridFetch, GRID_URL_MEMBERS } from '@/lib/earlyFetch';
import { supabase } from '@/integrations/supabase/client';
import symDog from '@/assets/chinese/CHINESE_SIGN-DOG.svg';
import symLover from '@/assets/character/CHARACTER-LOVER.svg';
import symPlayer from '@/assets/character/CHARACTER-PLAYER.svg';
import symGuardian from '@/assets/character/CHARACTER-GUARDIAN.svg';
import symGourmet from '@/assets/character/CHARACTER-GOURMET.svg';
import symWater from '@/assets/character/CHARACTER-WATERLOVER.svg';
import symChiller from '@/assets/character/CHARACTER-CHILLER.svg';

/** Desať výletov na ochutnanie — výber z nákresu 12. 10. (5 regiónov SR + 3 krajiny). */
const TRIP_IDS = [
  'sulovske-skaly-strazovske-vrchy', 'bielovodska-dolina-vysoke-tatry', 'sutovsky-vodopad-buchta-mala-fatra',
  'gaderska-dolina-velka-fatra', 'chtelnica-rajska-zahrada-male-karpaty', 'seealpsee', 'sivy-vrch-zapadne-tatry',
  'majdan-klasicky-okruh-male-karpaty', 'velky-choc-chocske-vrchy', 'vintgar-radovna-tiesnava',
];
const APP_IMG = (f: string) => `/images/onepage/apps/${f}.webp?v=10`;
const QUIZ = [...ELEMENT_QUESTIONS, ...ROLE_QUESTIONS];
/** FRESKY z Hektorovej knihy (Matej 12. 10.: *„vymyslime nejaku egyptsku fresku ako mame
 *  v hektorovom pribehu"*). Žiadny nový obraz — každý blok dostal výrez z kapitoly, ktorá
 *  hovorí to isté: zrkadlo = kto je môj pes, krabica šteniat = útulok, túra = výlety,
 *  učenie od psa = znalosti, glóbus so svorkou = komunita. `pos` = object-position výrezu. */
const FRESCO = (f: string) => `/images/hektor-kniha/${f}.webp`;
/** Pás symbolov heroglyfu v lapise s egyptským rámom — ten istý ako dole v knihe (`.hb-band`). */
const BAND = [symDog, symLover, symPlayer, symGuardian, symGourmet, symWater, symChiller];
function Band() {
  return <div className="mg-band" aria-hidden>{BAND.map((src, i) => <img key={i} src={src} alt="" />)}</div>;
}
/** Stĺpec telefónu — stránka je VÝSLOVNE mobilná (Matej 12. 10.: „link in bio" ako na IG).
 *  Na PC sa neroztiahne; ostane úzky stĺpec v strede papyrusu. */
const COL = 480;

/** `**tučné**` z datasetu kvízu → <b>. */
function Bold({ text }: { text: string }) {
  return <>{text.split(/\*\*/).map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <Fragment key={i}>{p}</Fragment>))}</>;
}

export default function Magnet() {
  const t = useT();
  const { lang } = useLang();
  const tx = (k: string, fb: string) => { const v = t(k); return v === k ? fb : v; };
  const [dogs, setDogs] = useState<number | null>(null);
  const scrolls = usePublicScrolls();
  useEffect(() => {
    let on = true;
    gridFetch(GRID_URL_MEMBERS).then((d) => { if (on && Array.isArray(d)) setDogs(d.length); }).catch(() => {});
    return () => { on = false; };
  }, []);
  const join = () => openPhotoInvite();
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const top = () => go('mg-links');
  const back = <button type="button" className="pk-pill pk-pill--tap mg-up" onClick={top}>{t('magnet.back')}</button>;
  const links = [
    { id: 'mg-dogtrip', img: 'k2-kresba', pos: '50% 50%', name: <>{t('heroglyph.flow.more.dogtrip.t')}</>, sub: t('magnet.link.trip') },
    { id: 'mg-ainubis', img: 'k4-kresba', pos: '50% 14%', name: <><span className="mg-ai">AI</span>NUBIS</>, sub: t('magnet.link.ai') },
    { id: 'mg-dogid', img: 'k0-zrkadlo', pos: '50% 45%', name: <>{t('heroglyph.flow.more.dogid.t')}</>, sub: t('magnet.link.dogid') },
    { id: 'mg-idea', img: 'k1-kresba', pos: '50% 62%', name: <>{t('magnet.feat.dogypt.t')}</>, sub: t('magnet.link.idea') },
    { id: 'mg-next', img: 'k4-kresba', pos: '50% 80%', name: <>{t('magnet.link.next.t')}</>, sub: t('magnet.link.next') },
  ];

  return (
    <main className="mg-root">
      <Seo title="DOGYPT — life with your dog in one place" description={t('magnet.hero.lead')} path="/magnet" noindex />
      <style>{CSS}</style>
      <div className="mg-top"><PageTopBar /></div>

      {/* ═══ 1 · PROFIL + ROZCESTNÍK — „link in bio" (Matej 12. 10.: výslovne na mobil,
           nadpis, krátky text, bloky; obsah sekcií až pod nimi) ═══ */}
      <section className="mg-sec mg-hero" id="mg-links">
        <figure className="mg-cover"><img src={FRESCO('k5-kresba')} alt="Hekthor" /></figure>
        <p className="mg-eye">{t('magnet.hero.eye')}</p>
        <h1 className="mg-h1">{t('magnet.hero.h')}</h1>
        <p className="mg-lead">{t('magnet.hero.lead')}</p>
        <div className="mg-stats">
          <div><b>{dogs ?? '—'}</b><span>{t('magnet.stat.dogs')}</span></div>
          <div><b>{HERO_TRAILS.length}</b><span>{t('magnet.stat.trips')}</span></div>
          <div><b>{scrolls.length || '—'}</b><span>{t('magnet.stat.scrolls')}</span></div>
        </div>
        <Band />
        <nav className="mg-links">
          {links.map((l, i) => (
            <button type="button" key={l.id} className="mg-link" style={PACK_BOX.card} onClick={() => go(l.id)}>
              <span className="mg-fresco"><img src={FRESCO(l.img)} alt="" style={{ objectPosition: l.pos }} loading={i < 2 ? 'eager' : 'lazy'} /></span>
              <span className="mg-link-t"><b>{l.name}</b><small>{l.sub}</small></span>
            </button>
          ))}
          <button type="button" className="mg-cta mg-cta--full" onClick={join}>{t('magnet.cta')} · 11 €</button>
        </nav>
      </section>

      <div className="mg-sec mg-sep"><Band /></div>
      {/* ═══ 3 · DOGTRIP ═══ */}
      <section className="mg-sec" id="mg-dogtrip">
        <p className="mg-eye">{t('magnet.trip.eye')}</p>
        <h2 className="op-apps-h2">{t('magnet.trip.h')}</h2>
        <p className="mg-lead">{t('magnet.trip.lead', { n: HERO_TRAILS.length })}</p>
        <TripMap lang={lang} t={t} />
        <div className="mg-pair">
          <div className="mg-ph1"><Iphone15Pro src={APP_IMG('dogtrip-odznaky')} imgProps={{ loading: 'lazy' }} /></div>
          <div className="mg-ph1"><Iphone15Pro src={APP_IMG('dogtrip-stats')} imgProps={{ loading: 'lazy' }} /></div>
          <ul className="mg-ul">
            {[1, 2, 3, 4].map((i) => <li key={i}><i aria-hidden />{t(`onepage.apps.dogtrip.b${i}`)}</li>)}
          </ul>
        </div>
        {back}
      </section>

      {/* ═══ 4 · AINUBIS ═══ */}
      <section className="mg-ai-band" id="mg-ainubis">
        <div className="mg-ai-bg" aria-hidden />
        <div className="mg-sec mg-sec--ai">
          <p className="mg-eye mg-eye--ai"><span className="mg-ai">AI</span>NUBIS · {t('magnet.ai.eye').split('·')[1]?.trim()}</p>
          <h2 className="op-apps-h2">{t('magnet.ai.h')}</h2>
          <p className="mg-lead mg-lead--ai">{t('magnet.ai.lead')}</p>
          <p className="mg-free">{t('magnet.ai.free')}</p>
          <AinubisDeck scrolls={scrolls} lang={lang} t={t} tx={tx} onJoin={join} />
          {back}
        </div>
      </section>

      <div className="mg-sec mg-sep"><Band /></div>
      {/* ═══ 5 · DOG ID KVÍZ ═══ */}
      <section className="mg-sec" id="mg-dogid">
        <p className="mg-eye">{t('magnet.quiz.eye')}</p>
        <h2 className="op-apps-h2">{t('magnet.quiz.h')}</h2>
        <p className="mg-lead">{t('magnet.quiz.lead', { n: QUIZ.length })}</p>
        <div className="mg-quizrow">
          <NatureQuiz t={t} lang={lang} onJoin={join} />
          <ul className="mg-ul">
            {[1, 2, 3, 4].map((i) => <li key={i}><i aria-hidden />{t(`onepage.apps.dogid.b${i}`)}</li>)}
          </ul>
        </div>
        {back}
      </section>

      <div className="mg-sec mg-sep"><Band /></div>
      {/* ═══ 6 · MYŠLIENKA ═══ */}
      <section className="mg-sec" id="mg-idea">
        <div className="mg-idea">
          <div className="mg-idea-ph">
            <span className="pk-photo pk-photo--card"><img src="/images/about-hekthor.webp" alt="Hekthor" loading="lazy" /></span>
            <img className="mg-idea-gl" src="/images/hekthor-heroglyph.webp" alt="" loading="lazy" />
          </div>
          <div>
            <p className="mg-eye mg-left">{t('magnet.idea.eye')}</p>
            <h2 className="op-apps-name mg-wrap">{t('magnet.idea.h')}</h2>
            <p className="mg-p">{t('magnet.idea.p1')}</p>
            <p className="mg-p"><b>{t('magnet.idea.p2')}</b></p>
            <div className="mg-split" style={PACK_BOX.subblock}>
              <div className="mg-split-bar">
                {TRANSPARENCY_SPLIT.map((s) => (
                  <span key={s.labelKey} style={{ flex: s.share, background: s.color }}>{s.share} €</span>
                ))}
              </div>
              <div className="mg-split-l">
                {TRANSPARENCY_SPLIT.map((s) => <span key={s.labelKey}><i style={{ background: s.color }} aria-hidden />{s.share} € · {t(s.labelKey)}</span>)}
              </div>
              <p>{t('magnet.idea.split')}</p>
            </div>
          </div>
        </div>
        {back}
      </section>

      <div className="mg-sec mg-sep"><Band /></div>
      {/* ═══ 7 · KOMUNITA ═══ */}
      <section className="mg-sec" id="mg-next">
        <p className="mg-eye">{t('magnet.next.eye')}</p>
        <h2 className="op-apps-h2">{t('magnet.next.h')}</h2>
        <p className="mg-lead">{t('magnet.next.lead')}</p>
        <div className="mg-next">
          {['app', 'vet', 'longevity', 'eternal'].map((k) => <span key={k} className="pk-pill">{t(`magnet.next.${k}`)}</span>)}
        </div>
        <figure className="mg-quote" style={PACK_BOX.card}>
          <span aria-hidden>“</span>
          <blockquote>Aplikácia je perfektná a chybičky sa doladia postupne. Dnes by som chcela nahrať ďalší výlet. Baví ma to asi tak, ako niekoho jeho obľúbená hra.</blockquote>
          <figcaption>— DANKA</figcaption>
        </figure>
        {back}
      </section>

      <div className="mg-sec mg-sep"><Band /></div>
      {/* ═══ 8 · CTA ═══ */}
      <section className="mg-sec mg-end">
        <h2 className="op-apps-h2">{t('magnet.end.h')}</h2>
        <p className="mg-price">11 €</p>
        <p className="mg-pricesub">{t('magnet.end.sub')}</p>
        <button type="button" className="mg-cta" onClick={join}>{t('magnet.cta')}</button>
        <p className="mg-motto">{t('legal.motto')}</p>
      </section>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAPA — 10 výletov, svetelný meč ako na /map
// ══════════════════════════════════════════════════════════════════════════
type TFn = ReturnType<typeof useT>;

/** Úvodný záber = Slovensko (8 z 10). Zahraničné dva by mapu oddialili na Európu,
 *  kde sa čiary stratia — ukážu sa po ťuknutí v zozname. */
const ABROAD = new Set(['seealpsee', 'vintgar-radovna-tiesnava']);

function FitAll({ paths, ids, pick }: { paths: LatLngTuple[][]; ids: string[]; pick: number | null }) {
  const map = useMap();
  useEffect(() => {
    const pts = pick == null ? paths.filter((_, i) => !ABROAD.has(ids[i])).flat() : paths[pick];
    if (!pts.length) return;
    const lats = pts.map((p) => p[0]), lngs = pts.map((p) => p[1]);
    const b: [LatLngTuple, LatLngTuple] = [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
    if (pick == null) map.fitBounds(b, { padding: [24, 24] });
    else map.flyToBounds(b, { padding: [32, 32], duration: 0.8 });
  }, [map, paths, ids, pick]);
  return null;
}

function TripMap({ lang, t }: { lang: string; t: TFn }) {
  useEffect(() => { ensureTrailLineCss(); }, []);
  const trips = useMemo(() => TRIP_IDS.map((id) => HERO_TRAILS.find((x) => x.id === id)).filter(Boolean) as HeroTrail[], []);
  const ids = useMemo(() => trips.map((x) => x.id), [trips]);
  const paths = useMemo(() => trips.map((x) => x.path as LatLngTuple[]), [trips]);
  const [pick, setPick] = useState<number | null>(null);
  const cur = pick == null ? null : trips[pick];
  const name = (x: HeroTrail) => (lang === 'sk' || lang === 'cs' ? x.name : x.nameEN || x.name);
  return (
    <div className="mg-map">
      <div className="mg-tlist">
        {trips.map((x, i) => (
          <button type="button" key={x.id} className={`mg-trow${pick === i ? ' is-on' : ''}`} style={PACK_BOX.row} onClick={() => setPick(i)}>
            <span className="pk-photo"><img src={x.photos[0]} alt="" loading="lazy" /></span>
            <span><b>{name(x)}</b><small>{[`${x.km} km`, x.region].filter(Boolean).join(' · ')}</small></span>
          </button>
        ))}
      </div>
      <div className="mg-mapbox">
        <MapContainer center={[48.7, 19.2]} zoom={7} zoomControl={false} attributionControl={false} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
          <TileLayer url={mapyTiles('outdoor')} />
          <FitAll paths={paths} ids={ids} pick={pick} />
          {paths.map((p, i) => (
            <Fragment key={trips[i].id}>
              {TRAIL_SABER_LAYERS.map((ly) => (
                <Polyline key={ly.key} positions={p}
                  eventHandlers={{ click: () => setPick(i) }}
                  pathOptions={{
                    color: ly.color, weight: ly.weight,
                    opacity: ly.opacity * (pick === i ? 1 : SABER_REST_OPACITY),
                    className: 'glow' in ly && ly.glow && pick === i ? 'trp-saber-glow' : undefined,
                  }} />
              ))}
              <CircleMarker center={p[0]} radius={6} eventHandlers={{ click: () => setPick(i) }}
                pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: T.tripPurple, fillOpacity: 1 }} />
            </Fragment>
          ))}
        </MapContainer>
        <MapAttribution />
      </div>
      {cur && (
        <div className="mg-tcard" style={PACK_BOX.subblock}>
          <span className="pk-photo"><img src={cur.photos[0]} alt="" /></span>
          <div>
            <h3>{name(cur)}</h3>
            <p className="mg-meta">{[cur.region, `${cur.km} km`, cur.diff ? t(`pack.map.diff.${cur.diff}`) : ''].filter(Boolean).join(' · ')}</p>
            {cur.stars > 0 && <RatingPaws stars={cur.stars} size={16} />}
            <p className="mg-desc">{(lang === 'sk' ? cur.desc : cur.descEN || cur.desc).split(/(?<=\.)\s/).slice(0, 2).join(' ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// AINUBIS — AI-PALUBA: vľavo zvitky (ScrollCard z /pack), vpravo mozog
// ══════════════════════════════════════════════════════════════════════════
function AinubisDeck({ scrolls, lang, t, tx, onJoin }: {
  scrolls: DemoScroll[]; lang: string; t: TFn; tx: (k: string, fb: string) => string; onJoin: () => void;
}) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const brain = useRef<BrainHandle | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [world, setWorld] = useState<string | null>(null);
  const names = VAULT_WORLDS.map((w) => tx(`pack.ainubis.world.${w.key}`, w.en));
  const live = useRef({ scrolls, names, lang });
  live.current = { scrolls, names, lang };
  const sizesKey = scrolls.map((z) => `${z.world}${z.okruh}`).join(',');
  const shown = world ? scrolls.filter((z) => z.world === world) : scrolls;
  const wIdx = (k: string) => VAULT_WORLDS.findIndex((w) => w.key === k);

  useEffect(() => {
    const cv = cvRef.current, tip = tipRef.current;
    if (!cv || !tip) return;
    const find = (wi: number, oi: number, zo: number) =>
      live.current.scrolls.find((z) => z.world === VAULT_WORLDS[wi].key && z.okruh === oi + 1 && z.n === zo + 1);
    const circle = (wi: number, oi: number) => {
      const c = VAULT_CIRCLES[VAULT_WORLDS[wi].key]?.[oi];
      return c ? (live.current.lang === 'sk' ? c.sk : c.en) : '';
    };
    brain.current = mountBrain({
      canvas: cv, tip, worlds: VAULT_WORLDS, head: ainubisHead,
      isMobile: () => true,
      worldName: (wi) => live.current.names[wi],
      circleName: circle,
      insets: () => ({ top: PACK_SPACE.lg, bottom: PACK_SPACE.lg }),
      describe: (role, wi, oi, zo) => {
        if (role === 'root') return { title: 'AINUBIS' };
        if (role === 'z') {
          const z = find(wi, oi, zo ?? 0);
          if (z) return { title: pickText(z, live.current.lang).t, sub: `${live.current.names[wi]} · ${circle(wi, oi)}` };
          return { title: live.current.names[wi], sub: tx('pack.ainubis.tip.scroll', 'A scroll being written') };
        }
        return { title: role === 'o' ? (circle(wi, oi) || live.current.names[wi]) : live.current.names[wi] };
      },
      circleSizes: (wi) => {
        const key = VAULT_WORLDS[wi].key, list = live.current.scrolls.filter((z) => z.world === key);
        if (!list.length) return null;
        const out = Array.from({ length: VAULT_WORLDS[wi].circles }, () => 0);
        list.forEach((z) => { if (z.okruh >= 1 && z.okruh <= out.length) out[z.okruh - 1] += 1; });
        return out;
      },
      onScroll: (wi, oi, zo) => { const z = find(wi, oi, zo); if (z) setOpen(z.id); },
      onWorld: (wi) => { setWorld(VAULT_WORLDS[wi].key); listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); },
      onRoot: () => setWorld(null),
      progress: () => 0,
    });
    const ro = new ResizeObserver(() => brain.current?.resize());
    ro.observe(cv);
    return () => { ro.disconnect(); brain.current?.destroy(); brain.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizesKey]);

  const openZ = open ? scrolls.find((z) => z.id === open) : null;
  const share = (id: string) => {
    const url = `${window.location.origin}/magnet#mg-ainubis`;
    const z = scrolls.find((q) => q.id === id);
    if (navigator.share) void navigator.share({ title: z ? pickText(z, lang).t : 'AINUBIS', url }).catch(() => {});
    else void navigator.clipboard?.writeText(url);
  };

  return (
    <div className="mg-deck">
      <div className="mg-deck-l">
        <div className="mg-deck-h">
          <h3>{tx('pack.ainubis.dogscroll.title', 'Dogscrolling')}</h3>
          <p>{t('magnet.ai.sub')}</p>
          <div className="mg-worlds">
            <button type="button" className={`mg-wchip${world == null ? ' is-on' : ''}`} onClick={() => setWorld(null)}>{scrolls.length}</button>
            {VAULT_WORLDS.map((w, i) => {
              const n = scrolls.filter((z) => z.world === w.key).length;
              if (!n) return null;
              return (
                <button type="button" key={w.key} className={`mg-wchip${world === w.key ? ' is-on' : ''}`} onClick={() => setWorld(w.key)}>
                  {names[i]} <em>{n}</em>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mg-deck-list" ref={listRef}>
          {shown.map((z) => (
            <ScrollCard key={z.id} z={z} lang={lang} worldName={names[wIdx(z.world)]} onOpen={(id) => setOpen(id)} onShare={share} />
          ))}
        </div>
      </div>
      <div className="mg-deck-r">
        <canvas ref={cvRef} />
        <div className="mg-tip" ref={tipRef} />
      </div>
      {openZ && (
        <ScrollView z={openZ} all={scrolls} lang={lang} onClose={() => setOpen(null)} onOpen={(id) => setOpen(id)}
          onUse={onJoin} onShare={share} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// KVÍZ — tie isté otázky a vyhodnotenie ako /pack/nature; výsledok za e-mail
// ══════════════════════════════════════════════════════════════════════════
function NatureQuiz({ t, lang, onJoin }: { t: TFn; lang: string; onJoin: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [mail, setMail] = useState('');
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<NatureResult | null>(null);
  const done = step >= QUIZ.length;
  const q = QUIZ[Math.min(step, QUIZ.length - 1)];
  const pct = Math.round((Math.min(step, QUIZ.length) / QUIZ.length) * 100);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.trim())) { setErr(true); return; }
    setErr(false); setBusy(true);
    const r = scoreNature(answers);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc('magnet_lead', {
      p_email: mail.trim(), p_lang: lang, p_answers: answers,
      p_result: { element: r.element, role: r.role, elementSecond: r.elementSecond, roleSecond: r.roleSecond },
    });
    setBusy(false);
    if (error) { setErr(true); return; }
    setRes(r);
  };
  const reset = () => { setAnswers({}); setStep(0); setRes(null); };

  if (res) {
    const el = NATURE_ELEMENTS[res.element], ro = NATURE_ROLES[res.role];
    return (
      <div className="mg-quiz" style={PACK_BOX.card}>
        <p className="mg-eye mg-left">{t('magnet.quiz.res.eye')}</p>
        <h3 className="mg-res-h">{t(ro.i18n)} {t(`${el.i18n}.of`)}</h3>
        <div className="mg-res">
          <span className="pk-photo"><img src={el.art} alt="" /></span>
          <span className="pk-photo"><img src={ro.art} alt="" /></span>
        </div>
        <p className="mg-p"><Bold text={t(`${el.i18n}.summary`)} /></p>
        <p className="mg-p mg-soft">{t('magnet.quiz.res.save')}</p>
        <div className="mg-ctarow mg-left">
          <button type="button" className="mg-cta" onClick={onJoin}>{t('magnet.cta')}</button>
          <button type="button" className="pk-pill pk-pill--tap" onClick={reset}>{t('magnet.quiz.again')}</button>
        </div>
      </div>
    );
  }
  if (done) {
    return (
      <form className="mg-quiz" style={PACK_BOX.card} onSubmit={submit}>
        <div className="pk-progress"><div className="pk-progress__fill" style={{ width: '100%' }} /></div>
        <h3 className="mg-q">{t('magnet.quiz.gate.h')}</h3>
        <p className="mg-p">{t('magnet.quiz.gate.p')}</p>
        <input className="pf-field mg-field" type="email" autoComplete="email" required value={mail}
          onChange={(e) => setMail(e.target.value)} placeholder="tvoj@email.sk" aria-invalid={err} />
        {err && <p className="mg-err">{t('magnet.quiz.gate.err')}</p>}
        <button type="submit" className="mg-cta mg-cta--full" disabled={busy}>{t('magnet.quiz.gate.btn')}</button>
        <p className="mg-fine">{t('magnet.quiz.gate.fine')} <a href="/privacy" target="_blank" rel="noreferrer">{t('magnet.quiz.gate.privacy')}</a></p>
      </form>
    );
  }
  return (
    <div className="mg-quiz" style={PACK_BOX.card}>
      <div className="mg-qtop">
        <div className="pk-progress"><div className="pk-progress__fill" style={{ width: `${pct}%` }} /></div>
        <span>{t('magnet.quiz.of', { i: step + 1, n: QUIZ.length })}</span>
      </div>
      <h3 className="mg-q">{t(q.i18n)}</h3>
      <div className="mg-opts">
        {q.options.map((o) => (
          <button type="button" key={o.id} className={`mg-opt${answers[q.id] === o.id ? ' is-on' : ''}`} style={PACK_BOX.row}
            onClick={() => { setAnswers((a) => ({ ...a, [q.id]: o.id })); setStep((s) => s + 1); }}>
            {t(o.i18n)}
          </button>
        ))}
      </div>
      {step > 0 && (
        <BackButton tone="pale" className="mg-back" onClick={() => setStep((s) => s - 1)} label={t('magnet.quiz.prev')} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CSS — iba tokeny a recepty. Žiadna farba ani číslo mimo stupníc.
// ══════════════════════════════════════════════════════════════════════════
const S = PACK_SPACE;
/** Červená hlinka z rámu fresiek a knihy (`.hb-band`, `#A8432A`). */
const FRESCO_RED = '#A8432A';
const CSS = `
${APPS_TYPE_CSS}
${PILL_CSS}
${PF_FIELD_CSS}
${PROGRESS_CSS}
${PHOTO_CSS}
${MEDALLION_CSS}
${SCROLL_CSS}
${MAP_ATTR_CSS}
.mg-root{min-height:100vh;background:${LAB.pageBg};background-image:${LAB.pageBackdrop};
  color:${LAB.ink};font-family:${FONT_UI};overflow-x:hidden;}
/* Logo na bledom podklade je TMAVÉ (brand lock 3. 10. 2026) — ten istý filter ako .pk-paper. */
.mg-top img{filter:brightness(.34) sepia(1) saturate(2.2) hue-rotate(-12deg);}
.mg-sec{max-width:${COL}px;margin:0 auto;padding:${S.xxl}px ${S.lg}px;text-align:center;scroll-margin-top:${S.lg}px;}
.mg-hero{padding-top:${S.md}px;}
.mg-up{margin-top:${S.xl}px;}
.mg-eye{margin:0 0 ${S.md}px;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.goldInk};}
.mg-left{text-align:left;}
.mg-lead{margin:${S.lg}px auto 0;max-width:640px;font:400 ${PACK_TEXT.lead}px/1.55 ${FONT_UI};color:${LAB.inkBody};}
.mg-p{margin:${S.md}px 0 0;font:400 ${PACK_TEXT.lead}px/1.55 ${FONT_UI};color:${LAB.inkBody};text-align:left;}
.mg-p b{color:${LAB.ink};font-weight:600;}
.mg-soft{color:${LAB.inkSoft};font-size:${PACK_TEXT.body}px;}
.mg-wrap{white-space:normal !important;}
.mg-ai{color:${AINUBIS.aiInk};text-shadow:${AINUBIS.aiShadow};}

/* CTA — LAPIS, geometria .btn-gold (radius 8), presne ako .op-nxt-cta na /onepage. */
.mg-ctarow{display:flex;flex-wrap:wrap;gap:${S.md}px;justify-content:center;align-items:center;margin-top:${S.xl}px;}
.mg-cta{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  border:1.5px solid rgba(250,244,236,0.30);border-radius:${PACK_R.field}px;padding:${S.lg}px ${S.xl}px;
  background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};
  font:700 ${PACK_TEXT.lead}px/1 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.mg-cta:hover{background:${LAPIS.gradHover};transform:translateY(-1px);}
.mg-cta:disabled{opacity:.6;cursor:wait;}
.mg-cta--full{width:100%;margin-top:${S.md}px;}

/* Film má nadpis plynulý podľa OKNA (vw) — v stĺpci telefónu by na PC narástol na 56 px.
   Stránka je mobilná, takže nadpis drží mobilný stupeň aj na PC. Na papyruse TMAVÝ atrament:
   zlatý gradient na bledom „nie je výrazný" (Matej 12. 10.). V AINUBIS páse ostáva svetlý. */
.mg-root .op-apps-h2,.mg-root .op-apps-name{font-size:${PACK_TEXT.h1}px;background:none;color:${T.inkStrong};-webkit-text-fill-color:currentColor;}
.mg-root .mg-ai-band .op-apps-h2{color:${AINUBIS.ink};}

/* EGYPTSKÝ RÁM z Hektorovej knihy — zlatá · červená hlinka · zlatá (.hb-band). */
.mg-fresco,.mg-band{box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid};}

/* PROFIL — freska ako titulka profilu, nadpis TMAVÝM atramentom. */
.mg-cover{position:relative;margin:0 0 ${S.xl}px;aspect-ratio:3/2;border-radius:${PACK_R.card}px;overflow:hidden;isolation:isolate;
  box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid},${LAB.shadow};}
.mg-cover img,.mg-fresco img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;}
.mg-cover img{object-position:50% 88%;}
.mg-fresco{isolation:isolate;}
.mg-h1{margin:0;font:700 ${PACK_TEXT.h1}px/1.15 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}
.mg-hero .mg-lead{margin-top:${S.md}px;font-size:${PACK_TEXT.body}px;}
.mg-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:${S.sm}px;margin-top:${S.lg}px;}
.mg-stats div{display:flex;flex-direction:column;gap:${S.xs}px;}
.mg-stats b{font:700 ${PACK_TEXT.h1}px/1 ${FONT_TITLE};color:${FRESCO_RED};}
.mg-stats span{font:500 ${PACK_TEXT.micro}px/1.3 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${LAB.inkSoft};}

/* Pás symbolov — lapis s rámom, ako dole v knihe. */
.mg-band{display:flex;align-items:center;justify-content:space-around;height:40px;margin-top:${S.xl}px;
  border-radius:${PACK_R.field}px;background:${LAPIS.grad};}
.mg-band img{height:20px;width:auto;filter:invert(.92) sepia(.6) saturate(2) hue-rotate(5deg);}
.mg-sep{padding-top:0;padding-bottom:0;}
.mg-sep .mg-band{margin:0;}

/* ROZCESTNÍK — KARTA s freskou navrchu a menom pod ňou; akcia = jediné lapis CTA. */
.mg-links{display:flex;flex-direction:column;gap:${S.lg}px;margin-top:${S.xl}px;}
.mg-link{display:block;padding:${S.sm}px;cursor:pointer;text-align:left;font:inherit;color:inherit;transition:transform .15s ease;}
.mg-link:hover{transform:translateY(-2px);}
.mg-fresco{position:relative;display:block;aspect-ratio:12/5;border-radius:${PACK_R.tile}px;overflow:hidden;}
.mg-link-t{display:block;padding:${S.md}px ${S.sm}px ${S.sm}px;}
.mg-link b{display:block;font:700 ${PACK_TEXT.h2}px/1.2 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;color:${T.inkStrong};}
.mg-link small{display:block;margin-top:${S.xs}px;font:400 ${PACK_TEXT.body}px/1.4 ${FONT_UI};color:${T.inkWarm};}
.mg-links .mg-cta--full{margin-top:${S.sm}px;}

/* DOGTRIP — mapa v D-BLOKU, zoznam = RIADKY, detail = PODBLOK. */
.mg-map{display:grid;grid-template-columns:1fr;gap:${S.md}px;margin-top:${S.xl}px;text-align:left;}
.mg-tlist{display:flex;gap:${S.sm}px;overflow-x:auto;padding-bottom:${S.xs}px;}
.mg-trow{display:grid;grid-template-columns:48px 1fr;gap:${S.md}px;align-items:center;padding:${S.sm}px;min-width:240px;cursor:pointer;
  text-align:left;font:inherit;color:inherit;}
.mg-trow .pk-photo{width:48px;height:48px;}
.mg-trow b{display:block;font:700 ${PACK_TEXT.label}px/1.3 ${FONT_TITLE};letter-spacing:.02em;color:${T.inkStrong};}
.mg-trow small{font:400 ${PACK_TEXT.label}px/1.3 ${FONT_UI};color:${T.inkWarm};}
.mg-trow.is-on{${pickTintCSS(LAPIS.edge, LAPIS.deep)}}
.mg-mapbox{position:relative;height:360px;overflow:hidden;${goldFrameCSS()}}
.mg-mapbox .leaflet-container{border-radius:${PACK_R.tile}px;background:${T.tileBg};}
.mg-tcard{display:grid;grid-template-columns:96px 1fr;gap:${S.md}px;padding:${S.md}px;align-items:start;}
.mg-tcard .pk-photo{width:96px;height:96px;}
.mg-tcard h3{margin:0;font:700 ${PACK_TEXT.h2}px/1.2 ${FONT_TITLE};letter-spacing:.02em;color:${T.inkStrong};}
.mg-meta{margin:${S.xs}px 0;font:400 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:${T.inkWarm};}
.mg-desc{margin:${S.sm}px 0 0;font:400 ${PACK_TEXT.body}px/1.55 ${FONT_UI};color:${LAB.inkBody};}
.mg-pair{display:grid;grid-template-columns:1fr 1fr;gap:${S.lg}px;margin-top:${S.xxl}px;align-items:center;}
.mg-ph1{width:100%;max-width:220px;margin:0 auto;}
.mg-ul{grid-column:1/-1;list-style:none;margin:0;padding:0;text-align:left;}
.mg-ul li{display:flex;align-items:center;gap:${S.md}px;padding:${S.md}px 0;border-bottom:1px solid ${LAB.hairline};
  font:400 ${PACK_TEXT.lead}px/1.4 ${FONT_UI};color:${LAB.ink};}
.mg-ul li i{width:8px;height:8px;flex:0 0 auto;border-radius:${PACK_R.pill}px;background:${LAB.goldSolid};}

/* AINUBIS — AI-PALUBA (vlastný brand: tmavá modrá, cyan, CTA zlato-oranžové). */
.mg-ai-band{position:relative;background:${AINUBIS.surfaceBase};color:${AINUBIS.ink};overflow:hidden;}
.mg-ai-bg{position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(${AINUBIS.cyanRGB},0.06) 1px,transparent 1px);
  background-size:24px 24px;}
.mg-sec--ai{position:relative;}
.mg-eye--ai{color:${AINUBIS.inkDim};}
.mg-lead--ai{color:${AINUBIS.inkDim};}
.mg-free{display:inline-block;margin:${S.lg}px 0 0;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;
  border:1px solid ${AINUBIS.ctaEdge};background:${AINUBIS.ctaTint};color:${AINUBIS.ctaA};
  font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};letter-spacing:.14em;text-transform:uppercase;}
.mg-deck{display:grid;grid-template-columns:1fr;margin-top:${S.xl}px;text-align:left;border-radius:${PACK_R.card}px;overflow:hidden;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};}
.mg-deck-l{display:flex;flex-direction:column;min-height:0;order:2;}
.mg-deck-h{padding:${S.lg}px;border-bottom:1px solid ${AINUBIS.edge};}
.mg-deck-h h3{margin:0;font:700 ${PACK_TEXT.h2}px/1.2 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;color:${AINUBIS.ink};}
.mg-deck-h p{margin:${S.xs}px 0 0;font:400 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:${AINUBIS.inkDim};}
.mg-worlds{display:flex;gap:${S.xs}px;overflow-x:auto;margin-top:${S.md}px;padding-bottom:${S.xs}px;}
.mg-wchip{flex:0 0 auto;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;cursor:pointer;white-space:nowrap;
  border:1px solid ${AINUBIS.edge};background:transparent;color:${AINUBIS.inkDim};font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};}
.mg-wchip em{font-style:normal;color:${AINUBIS.inkFaint};margin-left:${S.xs}px;}
.mg-wchip.is-on{background:rgba(${AINUBIS.cyanRGB},0.14);border-color:${AINUBIS.edgeStrong};color:${AINUBIS.ink};}
.mg-deck-list{flex:1;min-height:0;max-height:70vh;overflow-y:auto;padding:${S.md}px;display:flex;flex-direction:column;gap:${S.md}px;}
.mg-deck-r{position:relative;height:360px;order:1;}
.mg-deck-r canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;}
.mg-tip{position:absolute;z-index:5;pointer-events:none;opacity:0;transition:opacity 120ms ease;
  transform:translate(-50%,calc(-100% - ${S.md}px));max-width:260px;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.tile}px;
  background:${AINUBIS.surface};border:1px solid ${AINUBIS.edgeStrong};box-shadow:${AINUBIS.panelShadow};
  font:400 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:${AINUBIS.ink};}

/* KVÍZ — KARTA, PROGRES, RIADKY, POLE. */
.mg-quizrow{display:grid;grid-template-columns:1fr;gap:${S.xl}px;margin-top:${S.xl}px;align-items:start;text-align:left;}
.mg-quiz{padding:${S.xl}px ${S.lg}px;display:flex;flex-direction:column;}
.mg-qtop{display:flex;align-items:center;gap:${S.md}px;}
.mg-qtop span{font:500 ${PACK_TEXT.label}px/1 ${FONT_UI};color:${T.inkWarm};white-space:nowrap;}
.mg-q{margin:${S.lg}px 0 ${S.md}px;font:700 ${PACK_TEXT.h2}px/1.3 ${FONT_TITLE};letter-spacing:.02em;color:${T.inkStrong};}
.mg-opts{display:flex;flex-direction:column;gap:${S.sm}px;}
.mg-opt{padding:${S.md}px ${S.lg}px;text-align:left;cursor:pointer;font:400 ${PACK_TEXT.body}px/1.45 ${FONT_UI};color:${T.inkStrong};}
.mg-opt:hover,.mg-opt.is-on{${pickTintCSS(LAPIS.edge, LAPIS.deep)}}
.mg-back{align-self:flex-start;margin-top:${S.lg}px;}
.mg-field{width:100%;margin-top:${S.md}px;padding:${S.md}px ${S.lg}px;border-radius:${PACK_R.field}px;font:400 ${PACK_TEXT.lead}px/1.4 ${FONT_UI};color:${T.inkStrong};}
.mg-err{margin:${S.sm}px 0 0;font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};color:#B25640;}
.mg-fine{margin:${S.md}px 0 0;font:400 ${PACK_TEXT.label}px/1.5 ${FONT_UI};color:${T.inkWarm};}
.mg-fine a{color:${LAPIS.edge};}
.mg-res-h{margin:0;font:700 ${PACK_TEXT.h1}px/1.2 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;
  background:${LAB.goldText};-webkit-background-clip:text;background-clip:text;color:transparent;}
.mg-res{display:grid;grid-template-columns:1fr 1fr;gap:${S.md}px;margin-top:${S.lg}px;}
.mg-res .pk-photo{aspect-ratio:2/3;}

/* Myšlienka — FOTKA v ráme KARTY, heroglyf v rohu. */
.mg-idea{display:grid;grid-template-columns:1fr;gap:${S.xxl}px;align-items:center;text-align:left;}
.mg-idea-ph{position:relative;max-width:300px;margin:0 auto;}
.mg-idea-ph .pk-photo{aspect-ratio:663/773;border:1.5px solid ${T.cardEdge};box-shadow:${LAB.shadow};}
.mg-idea-gl{position:absolute;right:-${S.lg}px;bottom:-${S.lg}px;width:150px;}
.mg-split{margin-top:${S.xl}px;padding:${S.lg}px;}
.mg-split-bar{display:flex;height:40px;border-radius:${PACK_R.field}px;overflow:hidden;}
.mg-split-bar span{display:grid;place-items:center;font:700 ${PACK_TEXT.body}px/1 ${FONT_TITLE};color:${T.inkStrong};}
/* Legenda pod pásom — na stĺpci telefónu sa popisky pod 1 € nezmestia, preto 2 × 2 s bodkou. */
.mg-split-l{display:grid;grid-template-columns:1fr 1fr;gap:${S.xs}px ${S.md}px;margin-top:${S.md}px;}
.mg-split-l span{display:flex;align-items:center;gap:${S.sm}px;font:400 ${PACK_TEXT.label}px/1.3 ${FONT_UI};color:${T.inkWarm};text-align:left;}
.mg-split-l i{width:8px;height:8px;flex:0 0 auto;border-radius:${PACK_R.pill}px;}
.mg-split p{margin:${S.md}px 0 0;font:400 ${PACK_TEXT.body}px/1.5 ${FONT_UI};color:${LAB.inkBody};}

/* Komunita — PILULKY ako štítky (neinteraktívne), citát v KARTE. */
.mg-next{display:flex;flex-wrap:wrap;gap:${S.sm}px;justify-content:center;margin-top:${S.xl}px;}
.mg-quote{margin:${S.xxl}px auto 0;max-width:640px;padding:${S.xl}px;text-align:center;}
.mg-quote > span{display:block;font:700 48px/.6 ${FONT_TITLE};color:${LAB.goldSolid};}
.mg-quote blockquote{margin:${S.md}px 0;font:300 ${PACK_TEXT.h2}px/1.5 ${FONT_UI};color:${LAB.ink};}
.mg-quote figcaption{font:500 ${PACK_TEXT.micro}px/1 ${FONT_UI};letter-spacing:.26em;color:${LAB.goldInk};}

/* Záver. */
.mg-end{padding-bottom:${S.xxxl * 2}px;}
.mg-price{margin:${S.xl}px 0 0;font:700 48px/1 ${FONT_TITLE};background:${LAB.goldText};-webkit-background-clip:text;background-clip:text;color:transparent;}
.mg-pricesub{margin:${S.sm}px 0 ${S.xl}px;font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${LAB.inkSoft};}
.mg-motto{margin:${S.xxl}px 0 0;font:500 ${PACK_TEXT.micro}px/1 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.inkMuted};}
`;
