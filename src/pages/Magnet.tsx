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
 *   · ÚVOD — nová freska „štát psov", mená DOGYPTU v dvoch riadkoch, ktoré idú dokola
 *     proti sebe, text, pointa, výzva;
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
import { PageTopBar } from '@/components/PageTopBar';
import { LAB } from '@/lib/labTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PACK_BOX, PACK_THEME as T, PACK_SPACE, PACK_R, PACK_TEXT, FONT_TITLE, FONT_UI, PILL_CSS } from '@/components/pack/packTheme';
import { TRANSPARENCY_SPLIT } from '@/lib/transparency';
import { openPhotoInvite } from '@/lib/photoInvite';
import { gridFetch, GRID_URL_MEMBERS } from '@/lib/earlyFetch';

const IMG = (f: string) => `/images/magnet/${f}.webp`;
/** Stĺpec telefónu — stránka je VÝSLOVNE mobilná; na PC ostane úzky stĺpec v strede. */
const COL = 480;

/** Mená DOGYPTU — Matejove tri z v7 + jeho „digitálny člen svorky, psí zápisník" + „psie
 *  náboženstvo, globálna komunita psíčkarov, psia kultúra" (12. 10. noc). Dva riadky po osem. */
const NAMES = [
  ['member', 'journal', 'school', 'idcard', 'chronicle', 'glyph', 'religion', 'culture'],
  ['eco', 'social', 'map', 'buddy', 'library', 'pilgrim', 'global', 'help'],
];

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
      <div className="mg-top"><PageTopBar /></div>

      {/* ═══ 1 · ÚVOD — štát psov ═══ */}
      <section className="mg-sec mg-hero">
        <figure className="mg-cover mg-frame"><img src={IMG('statpsov')} alt="" fetchPriority="high" /></figure>
        <h1 className="mg-h1">{t('magnet.hero.h')}</h1>
      </section>
      <div className="mg-names" aria-label={NAMES.flat().map((k) => t(`magnet.name.${k}`)).join(' · ')}>
        {NAMES.map((row, r) => (
          <div key={r} className={`mg-marquee${r ? ' mg-marquee--rev' : ''}`} aria-hidden>
            {/* Obsah dvakrát za sebou — posun o polovicu = bezšvová slučka. */}
            <div className="mg-track">
              {[...row, ...row].map((k, i) => <span key={i} className="pk-pill">{t(`magnet.name.${k}`)}</span>)}
            </div>
          </div>
        ))}
      </div>
      <section className="mg-sec mg-intro">
        <p className="mg-lead">{t('magnet.hero.lead')}</p>
        <p className="mg-punch">{t('magnet.hero.punch')}</p>
        <p className="mg-call">{t('magnet.call')}</p>
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
/* Logo na bledom podklade je TMAVÉ (brand lock 3. 10. 2026) — ten istý filter ako .pk-paper. */
.mg-top img{filter:brightness(.34) sepia(1) saturate(2.2) hue-rotate(-12deg);}
.mg-sec{max-width:${COL}px;margin:0 auto;padding:${S.xxl}px ${S.lg}px;text-align:center;}
.mg-hero{padding-top:${S.md}px;padding-bottom:${S.lg}px;}
.mg-eye{margin:0 0 ${S.md}px;font:500 ${PACK_TEXT.micro}px/1.4 ${FONT_UI};letter-spacing:.26em;text-transform:uppercase;color:${LAB.goldInk};}
.mg-lead{margin:0 auto;max-width:640px;font:400 ${PACK_TEXT.body}px/1.55 ${FONT_UI};color:${LAB.inkBody};}

/* EGYPTSKÝ RÁM z Hektorovej knihy — zlatá · červená hlinka · zlatá (.hb-band). */
.mg-frame{position:relative;overflow:hidden;isolation:isolate;
  box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid};}
.mg-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;}
.mg-cover{margin:0 0 ${S.xl}px;aspect-ratio:4/3;border-radius:${PACK_R.card}px;
  box-shadow:inset 0 0 0 2px ${LAB.goldSolid},inset 0 0 0 5px ${FRESCO_RED},inset 0 0 0 7px ${LAB.goldSolid},${LAB.shadow};}
.mg-h1{margin:0;font:700 ${PACK_TEXT.h1}px/1.15 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}
.mg-h2{margin:0;font:700 ${PACK_TEXT.h1}px/1.2 ${FONT_TITLE};letter-spacing:.06em;text-transform:uppercase;color:${T.inkStrong};}

/* MENÁ — dva riadky PILULIEK, idú dokola proti sebe. Pás je širší ako stĺpec, kraje sa
   strácajú v maske. Kto nechce pohyb, dostane ich zalomené a bez opakovania. */
.mg-names{display:flex;flex-direction:column;gap:${S.sm}px;max-width:${COL + 2 * S.xxl}px;margin:0 auto;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);}
.mg-marquee{overflow:hidden;padding:${S.xs}px 0;}
.mg-track{display:flex;gap:${S.sm}px;width:max-content;animation:mg-roll 48s linear infinite;}
.mg-marquee--rev .mg-track{animation-direction:reverse;animation-duration:56s;}
.mg-track .pk-pill{flex:0 0 auto;white-space:nowrap;}
@keyframes mg-roll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - ${S.sm / 2}px))}}
@media (prefers-reduced-motion:reduce){
  .mg-names{-webkit-mask-image:none;mask-image:none;padding:0 ${S.lg}px;}
  .mg-track{animation:none;width:auto;flex-wrap:wrap;justify-content:center;}
  .mg-track .pk-pill:nth-child(n+9){display:none;}
}

.mg-intro{padding-top:${S.xl}px;padding-bottom:${S.lg}px;}
.mg-punch{margin:${S.lg}px 0 0;font:700 ${PACK_TEXT.h2}px/1.3 ${FONT_TITLE};letter-spacing:.06em;color:${FRESCO_RED};}
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
