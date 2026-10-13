/**
 * /magnet — PREDAJNÁ STRÁNKA (12. 10. 2026). Verejná, ale NEINDEXOVANÁ a nikde
 * neprelinkovaná: chodí sa na ňu len odkazom (mail H3, IG). Matej: *„bude verejná,
 * ale bude na ňu odkazovať odkaz, nenájdu ju na webe"*.
 *
 * 🔴 SKLADÁ SA LEN Z BRANDU (Matej 12. 10.: *„musí to byť alfa omega, že tvoríš len
 *    na základe nášho brandingu"*): papyrus `LAB`, bloky z katalógu `PACK_BLOCKS`
 *    (KARTA, PODBLOK, PILULKA), CTA lapis, rám fresiek z Hektorovej knihy (`.hb-band`).
 *
 * v8 (12. 10. noc) — Matej: *„stránka bude short, iba 3 sekcie hero/bloky/about — každý
 * blok bude mať svoju stránku"* + *„obrázok (psí štát) · chipy · text · výzva (potrebujeme
 * ťa) · 3 bloky · about · výzva CTA"*:
 *   · ÚVOD — od v9 (13. 10.) obraz „námestie" cez celú šírku bez horného loga, nadpis
 *     s Logom 2026, tri sľuby, cena, tri pilulky (verdikt Roast Room 4 : 0). Pás mien
 *     a pointa „Ak máš psa, patríš sem." z v8 zanikli spolu s ním;
 *   · BLOKY — len nadpis a jedna veta, vedú na `/magnet/vylety|ainubis|kviz`. Tie montujú
 *     SKUTOČNÉ obrazovky `/pack` v režime náhľadu (`components/pack/magnetPreview.tsx`),
 *     žiadna kópia — preto tu už nie je ani mapa, ani zvitky, ani kvíz;
 *   · ABOUT — pes z útulku → cesta SNP → svorka → kam ide 11 € → milión; výzva + CTA.
 * Fresky sú NOVÉ (Matej: *„fresky egyptské ako sú teraz, len vytvor nové, štýl zachovaj"*),
 * `public/images/magnet/*.webp`, generované cez Kie s freskami knihy ako predlohou.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import { Seo } from '@/components/Seo';
import { LAB } from '@/lib/labTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PACK_THEME as T, PACK_SPACE, PACK_R, PACK_TEXT, FONT_TITLE, FONT_UI, PILL_CSS } from '@/components/pack/packTheme';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { openPhotoInvite } from '@/lib/photoInvite';
import { gridFetch, GRID_URL_MEMBERS } from '@/lib/earlyFetch';

/** Hviezdičkou označené slová nadpisu = zlaté Cinzel Decorative (ten istý zápis ako
 *  `wall.hero.l1` na úvode webu, `goldWords` v DogPlanetLab). */
const goldWords = (s: string) => s.split('*').map((p, i) => (i % 2 ? <span className="mg-g" key={i}>{p}</span> : p));
/** Náhľad fotky psa do pásu (ten istý výrez ako pás na /onepage). */
const cldThumb = (u: string) => u.replace('/upload/', '/upload/c_fill,g_auto,w_180,h_180,q_auto,f_auto/');
/** Pás zblízka = prvý obraz pásu na /onepage: os má ~100 psov, takže dnešná svorka
 *  vyplní väčšinu a číslo neklame. Psy medzi koncami sú vybraté ROVNOMERNE. */
const STRIP_DOM = 100;
const STRIP_MID = 9;
type Dog = { n: number; name: string; u: string };

const IMG = (f: string) => `/images/magnet/${f}.webp`;
/** Stĺpec telefónu — stránka je VÝSLOVNE mobilná; na PC ostane úzky stĺpec v strede. */
const COL = 480;

/** Matejových päť mien (13. 10.: Zápisník von, Vyšší zmysel → Dobročinnosť) pod úvodom (13. 10.) — jeden riadok dokola. */
const CHIPS = ['eco', 'social', 'school', 'community', 'meaning'];

/** Menovky rozpadu len pre /magnet (Matej 13. 10.: „Útulky", „Hekthor"). Zvyšok webu
 *  drží `transparency.part.*` — či zmeniť všade, čaká na Mateja. */
const SPLIT_LABEL: Record<string, string> = {
  'transparency.part.directHelp': 'magnet.split.help',
  'transparency.part.hekthorBowl': 'magnet.split.bowl',
};

const BLOCKS = [
  { to: '/magnet/vylety', img: 'vylety', h: 'magnet.q.trip', p: 'magnet.b.trip' },
  { to: '/magnet/ainubis', img: 'ainubis', h: 'magnet.q.ai', p: 'magnet.b.ai' },
  { to: '/magnet/kviz', img: 'kviz', h: 'magnet.q.dogid', p: 'magnet.b.dogid' },
];

export default function Magnet() {
  const t = useT();
  const [dogs, setDogs] = useState<number | null>(null);
  const [pack, setPack] = useState<Dog[]>([]);
  useEffect(() => {
    let on = true;
    gridFetch(GRID_URL_MEMBERS).then((d) => {
      if (!on || !Array.isArray(d)) return;
      setDogs(d.length);
      type Row = { pack_number?: number; dog_name?: string; cloudinary_main_url?: string | null };
      setPack((d as Row[])
        .filter((r) => typeof r.cloudinary_main_url === 'string' && r.cloudinary_main_url)
        .map((r) => ({ n: r.pack_number ?? 0, name: r.dog_name ?? '', u: cldThumb(r.cloudinary_main_url as string) }))
        .sort((a, b) => a.n - b.n));
    }).catch(() => {});
    return () => { on = false; };
  }, []);
  const head = pack[pack.length - 1];
  const mids = pack.length < 3 ? [] : Array.from({ length: STRIP_MID }, (_, i) =>
    pack[Math.round(1 + ((i + 1) * (pack.length - 2)) / (STRIP_MID + 1))]);
  const fill = Math.min(1, (dogs ?? 0) / STRIP_DOM);
  const join = () => openPhotoInvite();

  return (
    <main className="mg-root">
      <Seo title="DOGYPT — if dogs had a country" description={t('magnet.hero.lead')} path="/magnet" noindex />
      <style>{CSS}</style>
      {/* ═══ 1 · ÚVOD — v9 (13. 10.): obraz cez celú šírku, ktorý sa stráca do papyrusu,
           BEZ horného loga; nadpis „Iba psy a my" (Matej 13. 10.) + kartuša LOGO 2026
           (tmavý atrament, hlavné logo A) + tri otázky + šesť mien v JEDNOM riadku dokola.
           Cena 11 € z úvodu VON (Matej 13. 10., proti verdiktu rady). ═══ */}
      <section className="mg-hero">
        <img className="mg-hero-bg" src={IMG('hero-namestie')} alt="" fetchPriority="high" />
        <div className="mg-hero-in">
          <h1 className="mg-h1">{goldWords(t('magnet.hero.h'))}</h1>
          <span className="mg-logo" role="img" aria-label="DOGYPT" />
          <p className="mg-lead">{t('magnet.hero.promise')}</p>
        </div>
        {/* Šesť mien DOGYPTU v JEDNOM riadku, ktorý ide dokola (Matej 13. 10.). */}
        <div className="mg-names" aria-label={CHIPS.map((k) => t(`magnet.chip.${k}`)).join(' · ')}>
          <div className="mg-marquee" aria-hidden>
            {/* Obsah dvakrát za sebou — posun o polovicu = bezšvová slučka. */}
            <div className="mg-track">
              {[...CHIPS, ...CHIPS].map((k, i) => <span key={i} className="pk-pill">{t(`magnet.chip.${k}`)}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2 · BLOKY — každý vedie na vlastnú stránku (darček 1:1 s /pack) ═══ */}
      <section className="mg-sec mg-blocks">
        <nav className="mg-links">
          {BLOCKS.map((b) => (
            <Link key={b.to} to={b.to} className="mg-link" style={PACK_BOX.card}>
              <span className="mg-fresco mg-frame"><img src={IMG(b.img)} alt="" loading="lazy" /></span>
              <span className="mg-link-t">
                <b>{t(b.h)}</b>
                <small>{t(b.p)}</small>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      {/* ═══ 3 · VÍZIA — psíčkari spolu + pes, ktorý to začal (Matej 13. 10.) ═══ */}
      <section className="mg-sec mg-about">
        <p className="mg-eye">{t('magnet.idea.eye')}</p>
        <h2 className="mg-h2">{t('magnet.idea.h')}</h2>
        <p className="mg-lead mg-vision">{t('magnet.idea.p1')}</p>
        <figure className="mg-photo">
          <span className="mg-frame"><img src="/images/hektor-kniha/k1-f1.webp" alt="" loading="lazy" /></span>
          <figcaption>{t('magnet.idea.photo')}</figcaption>
        </figure>
      </section>

      {/* ═══ 4 · CIEĽ — pás svorky z /onepage (prvý obraz, zblízka) + CTA ═══ */}
      <section className="mg-sec mg-goalsec">
        <p className="mg-goal">{t('magnet.about.goal')}</p>
        <div className="mg-strip" style={{ ['--fill' as string]: fill }} aria-label={`${dogs ?? ''} / 1 000 000`}>
          <div className="mg-groove"><span className="mg-fill" /></div>
          {mids.map((d, i) => (
            <span key={i} className="mg-dog mg-dog--mid" style={{ left: `${(((i + 1) / (STRIP_MID + 1)) * fill) * 100}%` }}>
              <img src={d.u} alt="" loading="lazy" />
            </span>
          ))}
          <span className="mg-dog mg-dog--anchor" style={{ left: 0 }}>
            <img src="/images/hektor-grid.webp" alt="" loading="lazy" />
            <i className="mg-tie" />
            <span className="mg-pill"><em>Hekthor</em><b>#1</b></span>
          </span>
          {head && (
            <span className="mg-dog mg-dog--head" style={{ left: `${fill * 100}%` }}>
              <img src={head.u} alt="" loading="lazy" />
              <i className="mg-tie" />
              <span className="mg-pill"><em>{head.name}</em><b>#{head.n}</b></span>
            </span>
          )}
        </div>
        <p className="mg-call">{t('magnet.end.call')}</p>
        <p className="mg-price">11 €</p>
        <p className="mg-pricesub">{t('magnet.end.sub')}</p>
        <button type="button" className="mg-cta" onClick={join}>{t('magnet.cta')}</button>
      </section>

      {/* ═══ 5 · KAM IDE 11 € — úplne na konci (Matej 13. 10.) ═══ */}
      <section className="mg-sec mg-money">
        <div className="mg-split" style={PACK_BOX.subblock}>
          <div className="mg-split-bar">
            {TRANSPARENCY_SPLIT.map((sp) => (
              <span key={sp.labelKey} style={{ flex: sp.share, background: sp.color }}>{sp.share} €</span>
            ))}
          </div>
          <div className="mg-split-l">
            {TRANSPARENCY_SPLIT.map((sp) => <span key={sp.labelKey}><i style={{ background: sp.color }} aria-hidden />{sp.share} € · {t(SPLIT_LABEL[sp.labelKey] ?? sp.labelKey)}</span>)}
          </div>
          <p>{t('magnet.about.help')}</p>
        </div>
        <p className="mg-motto">{t('legal.motto')}</p>
      </section>
    </main>
  );
}

const S = PACK_SPACE;
/** Červená hlinka z rámu fresiek a knihy (`.hb-band`, `#A8432A`). */
const FRESCO_RED = '#A8432A';
const CSS = `
${PILL_CSS}
.mg-root{min-height:100vh;background:${LAB.pageBg};background-image:${LAB.pageBackdrop};
  color:${LAB.ink};font-family:${FONT_UI};overflow-x:hidden;}
.mg-sec{max-width:${COL}px;margin:0 auto;padding:${S.xxl}px ${S.lg}px;text-align:center;}
.mg-hero{position:relative;--mg-hero-h:480px;}
@media (min-width:768px){.mg-hero{--mg-hero-h:520px;}}
/* Obraz sa stráca MASKOU, nie farebným prechodom — pod ním je radiálny papyrus LAB,
   ktorý nemá v tej výške jednu farbu, prechod do jedného odtieňa by na PC robil pás. */
.mg-hero-bg{position:absolute;top:0;left:0;width:100%;height:var(--mg-hero-h);object-fit:cover;object-position:center 22%;
  -webkit-mask-image:linear-gradient(180deg,#000 55%,rgba(0,0,0,.35) 82%,transparent);
  mask-image:linear-gradient(180deg,#000 55%,rgba(0,0,0,.35) 82%,transparent);}
.mg-hero-in{position:relative;max-width:${COL}px;margin:0 auto;padding:calc(var(--mg-hero-h) - 80px) ${S.lg}px ${S.lg}px;text-align:center;}
/* LOGO 2026 (vektor z Affinity, 13. 10.) — kartuša DOG|YPT, farba = atrament cez masku. */
.mg-logo{display:block;width:210px;aspect-ratio:1830/503;margin:${S.sm}px auto 0;background:${T.inkStrong};
  -webkit-mask:url(/images/magnet/logo-2026-kartusa.svg) center/contain no-repeat;
  mask:url(/images/magnet/logo-2026-kartusa.svg) center/contain no-repeat;}
.mg-hero .mg-lead{margin-top:${S.lg}px;max-width:340px;}
.mg-hero-in{padding-bottom:0;}
/* MENÁ — jeden riadok PILULIEK dokola; kraje sa strácajú v maske. Kto nechce pohyb,
   dostane ich zalomené na stred. */
.mg-names{position:relative;max-width:${COL + 2 * S.xxl}px;margin:${S.lg}px auto 0;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);}
.mg-marquee{overflow:hidden;padding:${S.xs}px 0;}
.mg-track{display:flex;gap:${S.sm}px;width:max-content;animation:mg-roll 32s linear infinite;}
.mg-track .pk-pill{flex:0 0 auto;white-space:nowrap;}
@keyframes mg-roll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - ${S.sm / 2}px))}}
@media (prefers-reduced-motion:reduce){
  .mg-names{-webkit-mask-image:none;mask-image:none;padding:0 ${S.lg}px;}
  .mg-track{animation:none;width:auto;flex-wrap:wrap;justify-content:center;}
  .mg-track .pk-pill:nth-child(n+7){display:none;}
}
.mg-eye{margin:0 0 ${S.md}px;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.goldInk};}
.mg-lead{margin:0 auto;max-width:640px;font:400 ${PACK_TEXT.body}px/1.55 ${FONT_UI};color:${LAB.inkBody};}

/* EGYPTSKÝ RÁM z Hektorovej knihy — zlatá · červená hlinka · zlatá (.hb-band). */
.mg-frame{position:relative;overflow:hidden;isolation:isolate;
  box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid};}
.mg-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;}
.mg-h1{margin:0;font:700 ${PACK_TEXT.h1}px/1.15 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}
/* PSY A MY — recept nadpisu z úvodu webu (DogPlanetLab .ph-h1): Cinzel, tmavý atrament,
   zlaté slová Cinzel Decorative 900 #6E4A12 s papyrusovým halo. Dominantný: veľkosť
   z ŠÍRKY okna, jeden riadok (Matej 13. 10.: „veľké cez celú šírku, dominantný text"). */
.mg-hero .mg-h1{white-space:nowrap;text-wrap:nowrap;margin-inline:calc(50% - 50vw);font-size:min(calc((100vw - 32px) / 6.3), 160px);line-height:1;letter-spacing:.005em;color:#23150a;
  text-shadow:0 0 6px ${LAB.pageBg},0 0 14px ${LAB.pageBg},0 0 28px ${LAB.pageBg};}
.mg-hero .mg-h1 .mg-g{text-wrap:nowrap;color:#6E4A12;font-family:'Cinzel Decorative','Cinzel',serif;font-weight:900;}
.mg-h2{margin:0;font:700 ${PACK_TEXT.h1}px/1.2 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}

.mg-call{margin:${S.lg}px 0 0;font:700 ${PACK_TEXT.lead}px/1.4 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}

/* BLOKY — KARTA: freska vľavo, nadpis + jedna veta vpravo. */
.mg-blocks{padding-top:${S.lg}px;}
.mg-links{display:flex;flex-direction:column;gap:${S.md}px;}
.mg-link{display:grid;grid-template-columns:112px 1fr;gap:${S.md}px;align-items:center;padding:${S.sm}px;
  text-align:left;color:inherit;text-decoration:none;transition:transform .15s ease;}
.mg-link:hover{transform:translateY(-2px);}
.mg-fresco{display:block;aspect-ratio:1;border-radius:${PACK_R.tile}px;}
.mg-link-t{display:flex;flex-direction:column;justify-content:center;gap:${S.xs}px;padding-right:${S.xs}px;}
.mg-link b{font:700 ${PACK_TEXT.lead}px/1.2 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}
.mg-link small{font:400 ${PACK_TEXT.label}px/1.45 ${FONT_UI};color:${T.inkWarm};}

/* VÍZIA — text + fotka šteniat v krabici z Hektorovej knihy v ráme fresiek. */
.mg-vision{margin-top:${S.lg}px;}
.mg-photo{margin:${S.xl}px auto 0;max-width:320px;}
.mg-photo .mg-frame{display:block;aspect-ratio:4/5;border-radius:${PACK_R.card}px;box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid},${LAB.shadow};}
.mg-photo figcaption{margin-top:${S.md}px;font:700 ${PACK_TEXT.lead}px/1.3 ${FONT_TITLE};letter-spacing:.06em;color:${T.inkStrong};}

/* PÁS SVORKY — statický prvý obraz pásu z /onepage (.op-nxt-*): drážka, lapisová výplň,
   Hekthor #1 na začiatku, posledný pes na hlave, medzi nimi rovnomerný výber svorky. */
.mg-goalsec{padding-top:${S.lg}px;}
.mg-strip{position:relative;height:14px;margin:${S.xxxl + S.lg}px ${S.xl}px ${S.xxxl + S.lg}px;}
.mg-groove{position:absolute;left:0;right:0;top:2px;height:9px;border-radius:${PACK_R.pill}px;overflow:hidden;
  background:rgba(122,90,42,0.16);border:1px solid ${LAB.edge};
  box-shadow:inset 0 2px 5px rgba(90,58,12,0.42),inset 0 -1.5px 0 rgba(255,255,255,0.70);}
.mg-fill{position:absolute;left:0;top:0;bottom:0;width:calc(var(--fill) * 100%);background:linear-gradient(180deg,${LAPIS.lite},${LAPIS.deep});}
.mg-dog{position:absolute;top:50%;width:0;}
.mg-dog img{position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:var(--d,44px);height:var(--d,44px);max-width:none;
  border-radius:${PACK_R.pill}px;object-fit:cover;border:2.5px solid ${LAB.goldSolid};box-shadow:0 4px 14px rgba(60,40,10,0.35);background:${LAB.pageBg};}
.mg-dog--mid{--d:28px;}
.mg-dog--mid img{border-width:2px;box-shadow:0 2px 8px rgba(60,40,10,0.3);}
.mg-dog--anchor{z-index:2;}
.mg-dog--head{z-index:3;}
.mg-pill{position:absolute;left:0;transform:translateX(-50%);top:30px;display:inline-flex;align-items:baseline;gap:${S.xs}px;white-space:nowrap;
  padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;background:rgba(22,48,122,0.13);border:1.5px solid rgba(22,48,122,0.62);}
.mg-dog--head .mg-pill{top:auto;bottom:30px;}
/* Menovky pri krajoch pásu nesmú vyjsť z okna: Hekthor visí doprava od kotvy,
   posledný pes doľava (na /onepage to rieši réžia cez --pdx). */
.mg-dog--anchor .mg-pill{transform:translateX(-16px);}
.mg-dog--head .mg-pill{transform:translateX(calc(-100% + 16px));}
.mg-pill em{font:700 ${PACK_TEXT.body}px/1 'Cinzel Decorative','Cinzel',serif;font-style:normal;color:${LAPIS.deep};}
.mg-pill b{font:700 ${PACK_TEXT.lead}px/1 ${FONT_TITLE};color:${LAPIS.edge};}
.mg-tie{position:absolute;left:0;transform:translateX(-50%);width:2px;background:rgba(22,48,122,0.5);top:20px;height:10px;}
.mg-dog--head .mg-tie{top:auto;bottom:20px;}

/* KAM IDE 11 € — úplne na konci. */
.mg-money{padding-top:0;padding-bottom:${S.xxxl * 2}px;}
.mg-split{margin-top:${S.xl}px;padding:${S.lg}px;text-align:left;}
.mg-split-bar{display:flex;height:40px;border-radius:${PACK_R.field}px;overflow:hidden;}
.mg-split-bar span{display:grid;place-items:center;font:700 ${PACK_TEXT.body}px/1 ${FONT_TITLE};color:${T.inkStrong};}
.mg-split-l{display:grid;grid-template-columns:1fr 1fr;gap:${S.xs}px ${S.md}px;margin-top:${S.md}px;}
.mg-split-l span{display:flex;align-items:center;gap:${S.sm}px;font:400 ${PACK_TEXT.label}px/1.3 ${FONT_UI};color:${T.inkWarm};}
.mg-split-l i{width:8px;height:8px;flex:0 0 auto;border-radius:${PACK_R.pill}px;}
.mg-split p{margin:${S.md}px 0 0;font:400 ${PACK_TEXT.body}px/1.5 ${FONT_UI};color:${LAB.inkBody};}
.mg-goal{margin:${S.xl}px 0 0;font:700 ${PACK_TEXT.h2}px/1.3 ${FONT_TITLE};letter-spacing:.06em;color:${FRESCO_RED};}
.mg-price{margin:${S.xl}px 0 0;font:700 48px/1 ${FONT_TITLE};background:${LAB.goldText};-webkit-background-clip:text;background-clip:text;color:transparent;}
.mg-pricesub{margin:${S.sm}px 0 ${S.xl}px;font:500 ${PACK_TEXT.label}px/1.4 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${LAB.inkSoft};}
/* CTA — LAPIS, geometria .btn-gold (radius 8), presne ako .op-nxt-cta na /onepage. */
.mg-cta{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  border:1.5px solid rgba(250,244,236,0.30);border-radius:${PACK_R.field}px;padding:${S.lg}px ${S.xl}px;
  background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};
  font:700 ${PACK_TEXT.lead}px/1 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.mg-cta:hover{background:${LAPIS.gradHover};transform:translateY(-1px);}
.mg-motto{margin:${S.xxl}px 0 0;font:500 ${PACK_TEXT.micro}px/1 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.inkMuted};}
`;
