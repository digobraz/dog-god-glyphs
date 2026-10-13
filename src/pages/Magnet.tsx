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

const IMG = (f: string) => `/images/magnet/${f}.webp`;
/** Stĺpec telefónu — stránka je VÝSLOVNE mobilná; na PC ostane úzky stĺpec v strede. */
const COL = 480;

/** Matejových šesť mien pod úvodom (13. 10.) — jeden riadok dokola. */
const CHIPS = ['eco', 'journal', 'social', 'school', 'community', 'meaning'];

const BLOCKS = [
  { to: '/magnet/vylety', img: 'vylety', h: 'magnet.q.trip', p: 'magnet.b.trip' },
  { to: '/magnet/ainubis', img: 'ainubis', h: 'magnet.q.ai', p: 'magnet.b.ai' },
  { to: '/magnet/kviz', img: 'kviz', h: 'magnet.q.dogid', p: 'magnet.b.dogid' },
];

export default function Magnet() {
  const t = useT();
  const [dogs, setDogs] = useState<number | null>(null);
  useEffect(() => {
    let on = true;
    gridFetch(GRID_URL_MEMBERS).then((d) => { if (on && Array.isArray(d)) setDogs(d.length); }).catch(() => {});
    return () => { on = false; };
  }, []);
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
          <h1 className="mg-h1">{t('magnet.hero.h')}<span className="mg-logo" role="img" aria-label="DOGYPT" /></h1>
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
        <p className="mg-sub">{t('magnet.chip.sub')}</p>
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

      {/* ═══ 3 · ABOUT — pes z útulku → svorka → psy v núdzi → milión ═══ */}
      <section className="mg-sec mg-about">
        <p className="mg-eye">{t('magnet.idea.eye')}</p>
        <h2 className="mg-h2">{t('magnet.idea.h')}</h2>
        <ol className="mg-story">
          <li>{t('magnet.idea.p1')}</li>
          <li>{t('magnet.about.snp')}</li>
          <li>{t('magnet.about.pack', { n: dogs ?? '—' })}</li>
        </ol>
        <div className="mg-split" style={PACK_BOX.subblock}>
          <div className="mg-split-bar">
            {TRANSPARENCY_SPLIT.map((sp) => (
              <span key={sp.labelKey} style={{ flex: sp.share, background: sp.color }}>{sp.share} €</span>
            ))}
          </div>
          <div className="mg-split-l">
            {TRANSPARENCY_SPLIT.map((sp) => <span key={sp.labelKey}><i style={{ background: sp.color }} aria-hidden />{sp.share} € · {t(sp.labelKey)}</span>)}
          </div>
          <p>{t('magnet.about.help')}</p>
        </div>
        <p className="mg-goal">{t('magnet.about.goal')}</p>
        <p className="mg-call">{t('magnet.end.call')}</p>
        <p className="mg-price">11 €</p>
        <p className="mg-pricesub">{t('magnet.end.sub')}</p>
        <button type="button" className="mg-cta" onClick={join}>{t('magnet.cta')}</button>
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
.mg-sub{position:relative;margin:${S.sm}px 0 0;text-align:center;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.mg-eye{margin:0 0 ${S.md}px;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.goldInk};}
.mg-lead{margin:0 auto;max-width:640px;font:400 ${PACK_TEXT.body}px/1.55 ${FONT_UI};color:${LAB.inkBody};}

/* EGYPTSKÝ RÁM z Hektorovej knihy — zlatá · červená hlinka · zlatá (.hb-band). */
.mg-frame{position:relative;overflow:hidden;isolation:isolate;
  box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid};}
.mg-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;}
.mg-h1{margin:0;font:700 ${PACK_TEXT.h1}px/1.15 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}
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

/* ABOUT — príbeh v troch krokoch, kam ide 11 €, cieľ, CTA. */
.mg-story{list-style:none;margin:${S.xl}px 0 0;padding:0;display:flex;flex-direction:column;gap:${S.md}px;text-align:left;}
.mg-story li{position:relative;padding-left:${S.lg}px;font:400 ${PACK_TEXT.body}px/1.55 ${FONT_UI};color:${LAB.inkBody};}
.mg-story li::before{content:'';position:absolute;left:0;top:8px;width:8px;height:8px;border-radius:${PACK_R.pill}px;background:${LAB.goldSolid};}
.mg-split{margin-top:${S.xl}px;padding:${S.lg}px;text-align:left;}
.mg-split-bar{display:flex;height:40px;border-radius:${PACK_R.field}px;overflow:hidden;}
.mg-split-bar span{display:grid;place-items:center;font:700 ${PACK_TEXT.body}px/1 ${FONT_TITLE};color:${T.inkStrong};}
.mg-split-l{display:grid;grid-template-columns:1fr 1fr;gap:${S.xs}px ${S.md}px;margin-top:${S.md}px;}
.mg-split-l span{display:flex;align-items:center;gap:${S.sm}px;font:400 ${PACK_TEXT.label}px/1.3 ${FONT_UI};color:${T.inkWarm};}
.mg-split-l i{width:8px;height:8px;flex:0 0 auto;border-radius:${PACK_R.pill}px;}
.mg-split p{margin:${S.md}px 0 0;font:400 ${PACK_TEXT.body}px/1.5 ${FONT_UI};color:${LAB.inkBody};}
.mg-goal{margin:${S.xl}px 0 0;font:700 ${PACK_TEXT.h2}px/1.3 ${FONT_TITLE};letter-spacing:.06em;color:${FRESCO_RED};}
.mg-about{padding-bottom:${S.xxxl * 2}px;}
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
