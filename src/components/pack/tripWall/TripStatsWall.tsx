// ─────────────────────────────────────────────────────────────────────────────
// STENA TRIPSTATS (Matej 8. 11. 2026, nákres plany/nakres-tripstats-2026-11-08/).
// *„úvodná stena musí byť krásna a vidno level + progres + štatistiky"*. Hlavička a 3 bloky
// z návrhu B, pod tým všetko dokopy, krajiny až v rozkliku cez filter.
//
// 🔒 CHKO: len účet zakladateľa (*„ja ich chcem mať v mojom profile a s Hektorom objavovať,
//    ale pre všetkých to nepôjde"*). Body za CHKO sa rátajú ďalej, level nesmie klesnúť.
// ⚠️ Ikonky v /icons/tripstats/ sú dočasné z banky, po hárku ikoniek sa vymenia.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { HeroBadges } from '@/components/pack/HeroBadges';
import { PilgrimBadge, RANK_BADGE_CSS } from '@/components/pack/profile/rankBadge';
import { HERO_BADGES } from '@/components/pack/heroBadgesData';
import { PackPopup } from '@/components/pack/PackPopup';
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PROGRESS_CSS, STAGE_CSS, PF_FIELD_CSS, PACK_SHADOW, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { useLang, useT } from '@/i18n/LanguageContext';
import { fmtNum } from '@/i18n/bcp47';
import { flagUrl, countryName } from '@/lib/countryGeo';
import type { LevelProgress } from '@/lib/tripPoints';
import { sizedUrl } from '@/services/cloudinaryService';
import { NP_LOGO, CHKO_LOGO } from '@/components/pack/packCommunity';
import { onPackStoreHydrated, readTripKinds, readTripNights, setTripKind, setTripNights, type TripKind } from '@/lib/packStore';
import { PACK_TIERS, pilgrimImg, pillInk, tierGradient, tierIndexOfLevel, tierRangeLabel } from '@/lib/packTiers';
import { pluralKey } from '@/lib/plural';
import { ascentOf, computeTripWall, derivedKind, kindOf, nightsOf, peakIcon, WALL_UNITS, type TripWallStats, type WallItem, type WaterKind } from './tripWallData';

const T = PACK_THEME;
const S = PACK_SPACE;
const ICO = (n: string) => `/icons/tripstats/${n}.webp`;
/** PODBLOK z matrice, tlačidlá ho berú vykonateľne. */
export const SUBBLOCK = PACK_BOX.subblock;
/** Plagát parku (Matej 8. 11.: *„daj plagát"*): rozmery scény. Mobil vidí stred `VW`, PC celých 832. */
const WALL_H = 332;
/** Nebo navyše nad scénou: výrazný pás levelu nesmie zakryť vrchol s vlajkou. */
const SKY_UP = 44;
const VW = 358;
const SIDE = 237;
const P = { skyTop: '#7CCBD8', skyMid: '#FCE7B0', skyLow: '#F9C873', ray: '#FFF3CF', sunOut: '#F59B3C', sunIn: '#FBB84E', tealLit: '#2E8F97', tealDark: '#1B6470', midLit: '#3F9E8B', midDark: '#2A7A6C', lowLit: '#57A869', lowDark: '#3C8854', snow: '#FFF8E6', hill: '#3F8747', pine: '#17493B', pineDark: '#113A30', trunk: '#6B4A2B' };
/** Výška bloku: polovica ide do scény, polovica pod ňu (Matej 8. 11.: *„zapusti, aby boli v polovici"*). */
const STRIP_H = 120;
/** Stena Tripstats a Triplistu: rovnaký začiatok, výška aj poloha 3 blokov (Matej 8. 11.). */
export const WALL_TOTAL = WALL_H + SKY_UP;
export const STRIP_HALF = STRIP_H / 2;

export const TW_CSS = `${PROGRESS_CSS}
${STAGE_CSS}
${PF_FIELD_CSS}
.tw-strip{--pk-stage:rgba(255,255,255,.58);--pk-stage-edge:rgba(255,255,255,.85);}
.tw-root{--tw-ink:${LAPIS.ink};--tw-deep:${LAPIS.deep};--tw-gold:${T.cardEdge};}
.tw-wall{position:relative;display:flex;flex-direction:column;height:${WALL_TOTAL}px;margin-top:${S.md}px;border-radius:${PACK_R.card}px;overflow:hidden;background:${P.skyTop};border:1.5px solid ${T.cardEdge};box-shadow:${LAPIS_BTN_SHADOW};}
.tw-poster{position:absolute;inset:0;width:100%;height:100%;display:block;}
.tw-poster text{font:600 ${PACK_TEXT.micro}px ${FONT_UI};fill:${T.inkStrong};}
.tw-hud{position:relative;z-index:2;display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;color:${LAPIS.deep};}
.tw-hudb{display:flex;align-items:center;gap:${S.md}px;flex:1;min-width:0;padding:0;background:none;border:0;color:inherit;cursor:pointer;text-align:left;font-family:${FONT_UI};}
.tw-av{width:56px;height:56px;flex:none;border-radius:${PACK_R.pill}px;object-fit:cover;border:2px solid ${T.cardEdge};box-shadow:0 0 0 2px ${T.card},0 0 0 3px ${T.inkStrong};}
.tw-avs{display:flex;align-items:flex-end;flex:none;}
.tw-avs .tw-av{width:48px;height:48px;}
.tw-avs .tw-avd{width:36px;height:36px;margin-left:-${S.md}px;}
.tw-who.tight b{font-size:${PACK_TEXT.body}px;letter-spacing:.02em;}
.tw-who{flex:1;min-width:0;}
.tw-who b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;overflow-wrap:anywhere;} /* písmo: meno */
.tw-who small{display:block;margin-top:${S.xs}px;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;opacity:.82;}
.tw-xp{position:relative;z-index:2;display:block;width:auto;margin:0 ${S.md}px;padding:${S.sm}px ${S.md}px;border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.tile}px;background:${LAPIS.grad};box-shadow:${PACK_SHADOW.card};color:${LAPIS.ink};font-family:${FONT_UI};cursor:pointer;}
.tw-xpr{display:flex;align-items:center;gap:${S.sm}px;}
.tw-xpl{flex:none;min-width:${S.lg}px;font-size:${PACK_TEXT.lead}px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;text-align:center;-webkit-text-stroke:.5px currentColor;}
.tw-xpl.nx{opacity:.6;}
.tw-xp .pk-progress{flex:1;width:auto;height:12px;background:rgba(255,255,255,.2);}
.tw-xp .pk-progress__fill{transition:width 1.1s cubic-bezier(.2,.7,.2,1) .2s;}
.tw-xpt{display:flex;justify-content:space-between;gap:${S.sm}px;margin-top:${S.xs}px;font-size:${PACK_TEXT.label}px;font-weight:500;font-variant-numeric:tabular-nums;}
.tw-skyb{position:relative;z-index:1;display:block;width:100%;flex:1;min-height:0;padding:0;background:none;border:0;cursor:pointer;}
.tw-strip{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:${S.sm}px;margin:-${S.xxl}px ${S.sm}px 0;}
.tw-strip button{display:flex;flex-direction:column;align-items:center;gap:${S.xs}px;padding:${S.sm}px ${S.xs}px ${S.md}px;cursor:pointer;font-family:${FONT_UI};box-shadow:${PACK_SHADOW.card};}
.tw-wall + .tw-strip,.tw-wallw + .tw-strip{margin-top:-${STRIP_H / 2}px;}
.tw-wall + .tw-strip button,.tw-wallw + .tw-strip button{height:${STRIP_H}px;justify-content:center;padding:${S.xs}px;}
.tw-wall + .tw-strip .tw-lbl,.tw-wallw + .tw-strip .tw-lbl{line-height:1.2;}
.tw-strip img{width:48px;height:48px;object-fit:contain;}
.tw-num,.tw-rec b,.tw-m b{-webkit-text-stroke:.5px currentColor;}
.tw-num{font-size:${PACK_TEXT.h1}px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;color:${T.inkStrong};white-space:nowrap;}
.tw-lbl{font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.tw-sec{display:flex;align-items:center;gap:${S.sm}px;margin:${S.xl}px 0 ${S.md}px;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.tw-sec::after{content:'';flex:1;height:1px;background:${T.hairline};}
.tw-sec em{order:2;font-style:normal;font-weight:600;letter-spacing:.02em;}
.tw-grid{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
.tw-tile{position:relative;display:flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px;min-height:72px;text-align:left;cursor:pointer;font-family:${FONT_UI};transition:transform .12s ease;}
.tw-tile:active,.tw-strip button:active,.tw-rec:active{transform:scale(.97);}
.tw-tile.wide{grid-column:1/-1;}
.tw-tile img{width:56px;height:56px;flex:none;object-fit:contain;}
.tw-tile span{display:block;min-width:0;}
.tw-tile .tw-t2{margin-top:${S.xs}px;font-size:${PACK_TEXT.label}px;font-weight:500;line-height:1.2;color:${T.inkStrong};}
.tw-chev{position:absolute;right:${S.sm}px;top:${S.sm}px;width:12px;height:12px;stroke:${T.inkWarm};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.tw-rec{display:flex;align-items:center;gap:${S.sm}px;padding:${S.sm}px;text-align:left;cursor:pointer;font-family:${FONT_UI};transition:transform .12s ease;}
.tw-rec img{width:44px;height:44px;flex:none;object-fit:contain;}
.tw-rec b{display:block;font-size:${PACK_TEXT.body}px;font-weight:600;line-height:1.15;font-variant-numeric:tabular-nums;color:${T.inkStrong};}
.tw-rec small{display:block;margin-top:${S.xs}px;font-size:${PACK_TEXT.micro}px;color:${T.inkWarm};}
.tw-dog{display:flex;align-items:center;gap:${S.md}px;padding:${S.sm}px ${S.md}px;margin-bottom:${S.sm}px;}
.tw-dog img{width:48px;height:48px;flex:none;border-radius:${PACK_R.pill}px;object-fit:cover;border:2px solid ${T.cardEdge};box-shadow:0 0 0 2px ${T.card},0 0 0 3px ${T.inkStrong};}
.tw-dog b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: meno */
.tw-dog small{display:block;margin-top:${S.xs}px;font-size:${PACK_TEXT.label}px;color:${T.inkWarm};font-variant-numeric:tabular-nums;}
.tw-badges{display:flex;flex-direction:column;}
.tw-badges .comm-dash-section-title{order:0;}
.tw-next{order:1;display:flex;align-items:center;gap:${S.md}px;margin-bottom:${S.md}px;}
.tw-next .pk-progress{flex:1;width:auto;}
.tw-next span{font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};white-space:nowrap;}
.tw-badges .comm-heroes{order:2;grid-template-columns:repeat(3,1fr);gap:${S.md}px ${S.sm}px;margin-top:0;}
.tw-badges .comm-hero img{width:88px;}
.tw-sh{display:flex;align-items:center;gap:${S.md}px;}
.tw-sh img{width:64px;height:64px;flex:none;object-fit:contain;}
.tw-sh h3{margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h2}px;line-height:1.15;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.tw-sh .tw-num{display:block;margin-top:${S.xs}px;}
.tw-sh small{font-size:${PACK_TEXT.body}px;font-weight:500;color:${T.inkWarm};}
.tw-sh .tw-hd2{display:block;margin-top:${S.xs}px;font-size:${PACK_TEXT.label}px;font-weight:500;color:${T.inkWarm};}
.tw-prg{margin-top:${S.md}px;}
.tw-fl{display:flex;gap:${S.sm}px;overflow-x:auto;scrollbar-width:none;margin:${S.md}px -${S.lg}px 0;padding:${S.xs}px ${S.lg}px;}
.tw-fl::-webkit-scrollbar{display:none;}
.tw-fl button{flex:none;display:inline-flex;align-items:center;gap:${S.xs}px;padding:${S.sm}px ${S.md}px;border-radius:${PACK_R.pill}px;border:1.5px solid ${T.border};background:${T.card};color:${T.inkStrong};font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:500;line-height:1;cursor:pointer;font-variant-numeric:tabular-nums;}
.tw-fl button b{font-weight:600;}
.tw-fl button.zero{opacity:.5;}
.tw-fl button.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.tw-fl img{width:18px;height:18px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.tw-fl.sub{margin-top:${S.sm}px;}
.tw-fl.sub button{padding:${S.xs}px ${S.md}px;}
.tw-fl.sub img{width:24px;height:24px;border-radius:0;object-fit:contain;}
.tw-ls{display:flex;flex-direction:column;gap:${S.xs}px;margin-top:${S.md}px;}
.tw-row{display:flex;align-items:center;gap:${S.sm}px;width:100%;min-height:44px;padding:${S.md}px;border-radius:${PACK_R.tile}px;border:1px solid ${T.border};background:${T.tileBg};color:${T.inkStrong};font-family:${FONT_UI};text-align:left;}
button.tw-row{cursor:pointer;}
.tw-row img{width:18px;height:18px;flex:none;border-radius:${PACK_R.pill}px;object-fit:cover;}
.tw-row .nm{flex:1;min-width:0;font-size:${PACK_TEXT.body}px;font-weight:500;line-height:1.2;}
.tw-row .mt{flex:none;font-size:${PACK_TEXT.label}px;font-weight:600;line-height:1;color:${T.inkWarm};font-variant-numeric:tabular-nums;}
.tw-row svg{flex:none;width:12px;height:12px;stroke:${T.inkWarm};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s ease;}
.tw-row.open svg{transform:rotate(90deg);}
.tw-row.lock{border-style:dashed;background:none;color:${T.inkWarm};}
.tw-row.lock .nm{font-weight:400;}
.tw-row img.tw-logo{width:48px;height:48px;border-radius:0;object-fit:contain;}
.tw-row.lock img.tw-logo{filter:grayscale(1);opacity:.5;}
.tw-row img.tw-oth{width:24px;height:24px;border-radius:0;object-fit:contain;}
.tw-row.on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}}
.tw-tick{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:${PACK_R.pill}px;border:1.5px solid ${T.border};}
.tw-row svg.tw-ck{width:14px;height:14px;stroke:${LAPIS.edge};stroke-width:3;}
.tw-nt{display:flex;align-items:center;gap:${S.sm}px;padding:${S.xs}px ${S.md}px ${S.sm}px;}
.tw-nt > span{flex:1;font-size:${PACK_TEXT.label}px;font-weight:500;color:${T.inkWarm};}
.tw-nt button{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex:none;border-radius:${PACK_R.field}px;border:1.5px solid ${T.border};background:${T.card};cursor:pointer;}
.tw-nt svg{width:16px;height:16px;stroke:${T.inkStrong};fill:none;stroke-width:2.5;stroke-linecap:round;}
.tw-nt input{width:56px;height:44px;flex:none;text-align:center;font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;font-weight:600;color:${T.inkStrong};font-variant-numeric:tabular-nums;}
.tw-lvh{position:relative;display:flex;align-items:center;gap:${S.md}px;padding:${S.lg}px;border-radius:${PACK_R.card}px;border:1.5px solid ${T.cardEdge};background:linear-gradient(180deg,${P.skyTop},${P.skyMid} 70%,${P.skyLow});color:${LAPIS.deep};overflow:hidden;}
.tw-lvh img{width:96px;height:96px;flex:none;object-fit:contain;}
.tw-lvh small{display:block;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.26em;text-transform:uppercase;}
.tw-lvh h3{margin:${S.xs}px 0 ${S.sm}px;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.h1}px;line-height:1.1;letter-spacing:.14em;text-transform:uppercase;} /* písmo: nadpis */
.tw-lvh i{display:inline-block;padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.cardEdge};font-style:normal;font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:.02em;}
.tw-why{margin:${S.md}px 0;font-size:${PACK_TEXT.body}px;line-height:1.4;text-align:center;color:${T.inkStrong};}
.tw-xp.static{margin:${S.md}px 0 0;cursor:default;}
.tw-lvb .comm-pts-rule{display:none;}
.tw-lvb .comm-pts-cols{margin-top:${S.xl}px;}
.tw-lvb .comm-pts-eyebrow{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
.tw-lvb .comm-pts-row,.tw-lvb .comm-pts-none{font-size:${PACK_TEXT.label}px;}
.tw-mark{display:block;width:100%;margin-top:${S.md}px;padding:${S.md}px;border:0;border-radius:${PACK_R.field}px;background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:${LAPIS.ink};font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.body}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;} /* písmo: cta */
.tw-find{display:block;width:100%;margin-top:${S.md}px;padding:${S.md}px;font-family:${FONT_UI};font-size:${PACK_TEXT.lead}px;color:${T.inkStrong};}
.tw-cs{display:flex;align-items:center;gap:${S.sm}px;margin-top:${S.lg}px;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.1;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.tw-cs img{width:24px;height:24px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.tw-cs b{margin-left:auto;font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.body}px;letter-spacing:.02em;font-variant-numeric:tabular-nums;white-space:nowrap;}
.tw-cs + .tw-prg{margin-top:${S.sm}px;}
.tw-cs ~ .tw-ls{margin-top:${S.sm}px;}
.tw-sub{display:flex;flex-direction:column;padding:0 ${S.md}px ${S.sm}px ${S.xl}px;}
.tw-sub button{display:flex;justify-content:space-between;gap:${S.sm}px;padding:${S.xs}px 0;background:none;border:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkStrong};text-align:left;cursor:pointer;}
.tw-sub i{font-style:normal;color:${T.inkWarm};font-variant-numeric:tabular-nums;white-space:nowrap;}
.tw-none{margin:${S.xl}px 0;text-align:center;color:${T.inkWarm};font-size:${PACK_TEXT.body}px;}
.tw-note{display:inline-flex;margin-top:${S.md}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px solid ${T.border};font-size:${PACK_TEXT.micro}px;font-weight:600;color:${T.inkWarm};}
.tw-cc{padding:${S.md}px;margin-top:${S.sm}px;}
.tw-sh + .tw-cc{margin-top:${S.md}px;}
.tw-cc h4{display:flex;align-items:center;gap:${S.sm}px;margin:0;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;line-height:1.1;letter-spacing:.02em;color:${T.inkStrong};} /* písmo: nadpis */
.tw-cc h4 img{width:24px;height:24px;border-radius:${PACK_R.pill}px;object-fit:cover;}
.tw-cc h4 small{margin-left:auto;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;letter-spacing:.02em;color:${T.inkWarm};font-variant-numeric:tabular-nums;white-space:nowrap;}
.tw-m{display:grid;grid-template-columns:repeat(4,1fr);gap:${S.xs}px;margin-top:${S.md}px;}
.tw-m button{padding:${S.xs}px 0;border:0;border-radius:${PACK_R.tile}px;background:none;font-family:${FONT_UI};text-align:center;cursor:pointer;color:${T.inkStrong};}
.tw-m img{display:block;width:36px;height:36px;margin:0 auto ${S.xs}px;object-fit:contain;}
.tw-m b{display:block;font-size:${PACK_TEXT.lead}px;font-weight:600;line-height:1;}
.tw-m span{font-size:${PACK_TEXT.micro}px;color:${T.inkWarm};}
@media (prefers-reduced-motion:reduce){.tw-xp .pk-progress__fill{transition:none;}}
`;

export function WallCount({ n }: { n: number }) {
  const { lang } = useLang();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) { setV(n); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1000);
      setV(n * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n]);
  return <>{fmtNum(Math.round(v), lang)}</>;
}

/** Plagát národného parku z vrcholov člena: najvyšší v strede pred slnkom, výška = metre. */
function Poster({ peaks }: { peaks: WallItem[] }) {
  const { lang } = useLang();
  const sc = useMemo(() => {
    const f = (v: number) => v.toFixed(1);
    let seed = 7;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const top = peaks[0]?.value ?? 2000, lo = top - 843;
    const seq = [0, -1, 1, -2, 2, -3, 3];
    const main = peaks.slice(0, 7).map((p, i) => ({ name: p.name, h: p.value ?? 0, x: VW / 2 + seq[i] * 60 + (i ? ((i * 37) % 11) - 5 : 0), y: Math.min(250, 258 - (((p.value ?? 0) - lo) / 843) * 112) }));
    const apex = main[0] ?? { name: '', h: 0, x: VW / 2, y: 146 };
    const faces: { d: string; c: string }[] = [];
    const big = (x: number, y: number, w: number, lit: string, dark: string, snow: number) => {
      const base = 300, tall = base - y;
      faces.push({ d: `M${f(x)} ${f(y)} L${f(x + w)} ${base} L${f(x - w)} ${base}Z`, c: lit });
      faces.push({ d: `M${f(x)} ${f(y)} L${f(x + w)} ${base} L${f(x + w * 0.12)} ${base} L${f(x + w * 0.2)} ${f(y + tall * 0.55)} L${f(x - w * 0.08)} ${f(y + tall * 0.32)}Z`, c: dark });
      if (!snow) return;
      const sy = y + tall * snow, sx = w * snow;
      faces.push({ d: `M${f(x)} ${f(y)} L${f(x + sx)} ${f(sy)} L${f(x + sx * 0.5)} ${f(sy - 7)} L${f(x + sx * 0.18)} ${f(sy + 7)} L${f(x - sx * 0.22)} ${f(sy - 6)} L${f(x - sx * 0.6)} ${f(sy + 6)} L${f(x - sx)} ${f(sy)}Z`, c: P.snow });
    };
    peaks.slice(7, 15).forEach((p, i) => big(VW / 2 + (i % 2 ? 1 : -1) * (230 + (i >> 1) * 58), Math.min(250, 258 - (((p.value ?? 0) - lo) / 843) * 112) + 24, 72, P.lowLit, P.lowDark, 0));
    big(apex.x, apex.y, 128, P.tealLit, P.tealDark, 0.3);
    main.slice(1, 3).forEach((p) => big(p.x < apex.x ? p.x - 16 : p.x + 16, p.y + 14, 92, P.midLit, P.midDark, 0.2));
    main.slice(3, 5).forEach((p) => big(p.x < apex.x ? p.x - 36 : p.x + 36, p.y + 24, 72, P.lowLit, P.lowDark, 0));
    const cx = apex.x, cy = apex.y + 34;
    const rays = Array.from({ length: 18 }, (_, i) => {
      const a0 = (i * Math.PI) / 9 - 0.08, a1 = a0 + 0.17;
      return `M${f(cx)} ${f(cy)} L${f(cx + Math.cos(a0) * 900)} ${f(cy + Math.sin(a0) * 900)} L${f(cx + Math.cos(a1) * 900)} ${f(cy + Math.sin(a1) * 900)}Z`;
    });
    const hill = (x: number) => 262 + Math.sin(x / 58 + 1) * 8;
    let land = `M${-SIDE - 6} ${f(hill(-SIDE - 6))}`;
    for (let x = -SIDE; x <= VW + SIDE + 6; x += 6) land += ` L${x} ${f(hill(x))}`;
    land += ` L${VW + SIDE + 6} ${WALL_H} L${-SIDE - 6} ${WALL_H}Z`;
    const pines: { x: number; b: number; s: number; tiers: [string, string][] }[] = [];
    const addPine = (x: number, s: number) => {
      const b = hill(x) + 4;
      const tier = (a: number, w: number, h: number): [string, string] => {
        const y0 = b - a * s, yT = y0 - h * s;
        return [`M${f(x)} ${f(yT)} L${f(x + w * s)} ${f(y0)} L${f(x - w * s)} ${f(y0)}Z`, `M${f(x)} ${f(yT)} L${f(x + w * s)} ${f(y0)} L${f(x)} ${f(y0)}Z`];
      };
      pines.push({ x, b, s, tiers: [tier(3, 10, 14), tier(11, 8, 12), tier(19, 5.6, 11)] });
    };
    for (let i = 0; i < 20; i++) {
      const x = i * 19 + r() * 10 - 4, s = 0.8 + ((i * 7) % 5) * 0.14;
      if (!(x > 130 && x < 230 && s < 1.2)) addPine(x, s);
    }
    for (let i = 1; i <= 13; i++) { addPine(-i * 19 + r() * 8, 0.8 + ((i * 3) % 5) * 0.14); addPine(VW + i * 19 - r() * 8, 0.8 + ((i * 4) % 5) * 0.14); }
    return { apex, faces, rays, land, pines, cx, cy, hasPeak: main.length > 0 };
  }, [peaks]);
  const { apex, faces, rays, land, pines, cx, cy, hasPeak } = sc;
  const label = `${apex.name} ${fmtNum(apex.h, lang)} m`;
  const labelW = label.length * 5.7 + 18, labelX = apex.x + 24;
  return (
    <svg className="tw-poster" viewBox={`${-SIDE} ${-SKY_UP} ${VW + 2 * SIDE} ${WALL_H + SKY_UP}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs><linearGradient id="tw-psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.skyTop} /><stop offset=".62" stopColor={P.skyMid} /><stop offset="1" stopColor={P.skyLow} /></linearGradient></defs>
      <rect x={-SIDE} y={-SKY_UP} width={VW + 2 * SIDE} height={WALL_H + SKY_UP} fill="url(#tw-psky)" />
      {rays.map((d, i) => <path key={i} d={d} fill={P.ray} opacity=".42" />)}
      <circle cx={cx} cy={cy} r="58" fill={P.sunOut} />
      <circle cx={cx} cy={cy} r="46" fill={P.sunIn} />
      {faces.map((x, i) => <path key={i} d={x.d} fill={x.c} />)}
      <path d={land} fill={P.hill} />
      {pines.map((p, i) => (
        <g key={i}>
          <rect x={p.x - 1.4 * p.s} y={p.b - 4 * p.s} width={2.8 * p.s} height={5 * p.s} fill={P.trunk} />
          {p.tiers.map(([a, b], j) => <g key={j}><path d={a} fill={P.pine} /><path d={b} fill={P.pineDark} /></g>)}
        </g>
      ))}
      {[[70, 150], [92, 142], [80, 132]].map(([x, y], i) => <path key={i} d={`M${x - 7} ${y} q3.5 -5 7 0 q3.5 -5 7 0`} fill="none" stroke={P.pine} strokeWidth="1.6" strokeLinecap="round" />)}
      {hasPeak && <>
        <path d={`M${apex.x} ${apex.y + 1} v-25`} stroke={P.pine} strokeWidth="2" strokeLinecap="round" />
        <path d={`M${apex.x} ${apex.y - 24} l16 5 l-16 5z`} fill={T.cardEdge} stroke={P.pine} strokeWidth="1.4" strokeLinejoin="round" />
        <rect x={labelX} y={apex.y - 30} width={labelW} height="20" rx="10" fill={T.card} opacity=".95" />
        <text x={labelX + 9} y={apex.y - 16.5}>{label}</text>
      </>}
    </svg>
  );
}

type CatKey = 'ranges' | 'parks' | 'chko' | 'peaks' | 'waters' | 'journeys' | 'roadtrips' | 'stays' | 'ascent' | 'km' | 'trips';
type MarkKind = 'stay' | 'roadtrip';
type Sheet = { kind: 'cat'; cat: CatKey; iso: string; water: 'all' | WaterKind } | { kind: 'countries' } | { kind: 'level' } | { kind: 'mark'; mark: MarkKind };

const Chev = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
const Check = () => <svg className="tw-ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>;
const Minus = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>;
const Plus = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg>;
const TileChev = () => <svg className="tw-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;

/** Šírka výplne PROGRESU (recept `.pk-progress`). */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

const WATER_ICON: Record<WaterKind, string> = { pond: 'jazierko', reservoir: 'priehrada', lake: 'jazero' };

export function TripStatsWall({ walkedTrails, ownerName, avatarUrl, dogs, lvl, dogStats, showChko, onOpenTrip, levelSheet }: {
  walkedTrails: HeroTrail[];
  ownerName: string;
  avatarUrl: string | null | undefined;
  dogs: { id: string; photo: string }[];
  lvl: LevelProgress;
  dogStats: { id: string; name: string; photo?: string | null; trips: number; km: number }[];
  showChko: boolean;
  onOpenTrip: (id: string) => void;
  levelSheet: ReactNode;
}) {
  const t = useT();
  const { lang } = useLang();
  const [kinds, setKinds] = useState<Record<string, TripKind>>(readTripKinds);
  useEffect(() => onPackStoreHydrated(() => { setKinds(readTripKinds()); setNights(readTripNights()); }), []);
  const [nights, setNights] = useState<Record<string, number>>(readTripNights);
  const s = useMemo<TripWallStats>(() => computeTripWall(walkedTrails, kinds, nights), [walkedTrails, kinds, nights]);
  const [find, setFind] = useState('');
  const [stack, setStack] = useState<Sheet[]>([]);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [barOn, setBarOn] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setBarOn(true)); return () => cancelAnimationFrame(r); }, []);

  const n = (v: number) => fmtNum(Math.round(v), lang);
  const top = stack[stack.length - 1];
  const push = (x: Sheet) => { setOpenRow(null); setFind(''); setStack((c) => [...c, x]); };
  const pop = () => { setOpenRow(null); setStack((c) => c.slice(0, -1)); };
  const patch = (p: Partial<Extract<Sheet, { kind: 'cat' }>>) => {
    setOpenRow(null);
    setStack((c) => c.map((x, i) => (i === c.length - 1 && x.kind === 'cat' ? { ...x, ...p } : x)));
  };
  const openCat = (cat: CatKey, iso = 'all') => push({ kind: 'cat', cat, iso, water: 'all' });

  const trailItem = (tr: HeroTrail, value: number): WallItem => ({ name: tr.name, iso: tr.country || 'sk', value, trails: [tr] });
  const CATS: Record<CatKey, { title: string; ic: string; items: WallItem[]; units?: Record<string, string[]>; logos?: Record<string, string>; icon?: (x: WallItem) => string; meta: (x: WallItem) => string; sum?: boolean; unit?: string; direct?: boolean }> = {
    ranges: { title: t('pack.stats.geo.ranges'), ic: ICO('pohoria'), items: s.ranges, units: WALL_UNITS.ranges, meta: (x) => (x.trails.length > 1 ? `${x.trails.length}×` : '') },
    parks: { title: t('pack.stats.geo.parks'), ic: ICO('narodny-park'), items: s.parks, units: WALL_UNITS.parks, logos: NP_LOGO, meta: (x) => (x.trails.length > 1 ? `${x.trails.length}×` : '') },
    chko: { title: 'CHKO', ic: '/icons/chko/biele-karpaty.png', items: s.chko, units: WALL_UNITS.chko, logos: CHKO_LOGO, meta: (x) => (x.trails.length > 1 ? `${x.trails.length}×` : '') },
    peaks: { title: t('pack.wall.peaks'), ic: ICO('vrcholy'), items: s.peaks, icon: (x) => ICO(peakIcon(x.value ?? 0)), meta: (x) => `${n(x.value ?? 0)} m` },
    waters: { title: t('pack.stats.geo.waters'), ic: ICO('jazero'), items: s.waters, icon: (x) => (x.water ? ICO(`voda-${WATER_ICON[x.water]}`) : ''), meta: (x) => (x.water ? t(`pack.wall.water.${x.water === 'lake' && /pleso/i.test(x.name) ? 'tarn' : x.water}`) : '') },
    journeys: { title: t('pack.stats.geo.journeys'), ic: ICO('pridane'), items: s.journeys, units: WALL_UNITS.journeys, meta: (x) => `${n(x.value ?? 0)} km` },
    roadtrips: { title: t('pack.wall.roadtrips'), ic: ICO('roadtrip'), items: s.roadtrips, meta: (x) => `${n(x.value ?? 0)} km` },
    stays: { title: t('pack.wall.stays'), ic: ICO('stanovacky'), items: s.stays, meta: (x) => t(`pack.wall.nights${pluralKey(x.value ?? 0)}`, { n: x.value ?? 0 }) },
    ascent: { title: t('pack.wall.ascent'), ic: ICO('najvyssi'), items: s.byAscent.map((x) => trailItem(x, ascentOf(x))), meta: (x) => `${n(x.value ?? 0)} m`, sum: true, unit: 'm', direct: true },
    km: { title: t('pack.wall.kmTitle'), ic: ICO('km'), items: s.byKm.map((x) => trailItem(x, Number(x.km) || 0)), meta: (x) => `${n(x.value ?? 0)} km`, sum: true, unit: 'km', direct: true },
    trips: { title: t('pack.wall.tripsTitle'), ic: ICO('vylety'), items: [...walkedTrails].sort((a, b) => a.name.localeCompare(b.name, lang)).map((x) => trailItem(x, Number(x.km) || 0)), meta: (x) => (x.value ? `${n(x.value)} km` : t('pack.wall.place')), direct: true },
  };

  const isoList = s.countries.map((c) => c.iso);
  const home = isoList[0];
  /** `countryName` vie len anglicky, stena hovorí jazykom člena. */
  const regionName = (iso: string) => {
    try { return new Intl.DisplayNames([lang], { type: 'region' }).of(iso.toUpperCase()) ?? countryName(iso); } catch { return countryName(iso); }
  };

  const renderCat = (st: Extract<Sheet, { kind: 'cat' }>) => {
    const c = CATS[st.cat];
    const inC = c.items.filter((x) => st.iso === 'all' || x.iso === st.iso);
    const list = st.water === 'all' ? inC : inC.filter((x) => x.water === st.water);
    const units = st.iso !== 'all' ? c.units?.[st.iso] : undefined;
    const locked = units ? units.filter((u) => !inC.some((x) => x.name === u)) : [];
    const nightSum = n(inC.reduce((a, x) => a + (x.value ?? 0), 0));
    const head = st.cat === 'stays' ? nightSum : c.sum ? `${n(inC.reduce((a, x) => a + (x.value ?? 0), 0))} ${c.unit}` : n(inC.length);
    const note = st.cat === 'ascent' && st.iso === 'all' ? t('pack.wall.everest', { n: fmtNum(s.everest, lang) })
      : st.cat === 'stays' ? t('pack.wall.tentNights') : '';
    const hasList = !!c.units && st.iso !== 'all' && !units;
    const mark: MarkKind | null = st.cat === 'stays' ? 'stay' : st.cat === 'roadtrips' ? 'roadtrip' : null;
    /* Vlajka len pri výlete mimo domova: slovenská v každom riadku nehovorí nič (Matej 8. 11.). */
    const lead = (x: WallItem, inCountry: boolean, lock = false) => {
      const pic = c.logos?.[x.name] ?? c.icon?.(x);
      return <>{pic && <img className="tw-logo" src={pic} alt="" />}{!lock && !inCountry && x.iso !== home && <img src={flagUrl(x.iso)} alt="" />}</>;
    };
    const rows = (items: WallItem[], inCountry: boolean) => items.map((x) => {
      const flag = lead(x, inCountry);
      if (c.direct) {
        return <button key={x.trails[0].id} type="button" className="tw-row" onClick={() => onOpenTrip(x.trails[0].id)}>{flag}<span className="nm">{x.name}</span><span className="mt">{c.meta(x)}</span></button>;
      }
      if (!x.trails.length || st.cat === 'waters' || mark) {
        const only = x.trails[0];
        return only
          ? <button key={x.name} type="button" className="tw-row" onClick={() => onOpenTrip(only.id)}>{flag}<span className="nm">{x.name}</span><span className="mt">{c.meta(x)}</span></button>
          : <div key={x.name} className="tw-row">{flag}<span className="nm">{x.name}</span><span className="mt">{c.meta(x)}</span></div>;
      }
      const isOpen = openRow === x.name;
      return (
        <div key={x.name}>
          <button type="button" className={`tw-row${isOpen ? ' open' : ''}`} aria-expanded={isOpen} onClick={() => setOpenRow(isOpen ? null : x.name)}>
            {flag}<span className="nm">{x.name}</span><span className="mt">{c.meta(x)}</span><Chev />
          </button>
          {isOpen && (
            <div className="tw-sub">
              {x.trails.map((tr) => (
                <button key={tr.id} type="button" onClick={() => onOpenTrip(tr.id)}>
                  <span>{tr.name}</span><i>{Number(tr.km) ? `${n(Number(tr.km))} km` : t('pack.wall.place')}</i>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    });
    const lockRow = (u: string, iso: string) => <div key={u} className="tw-row lock">{lead({ name: u, iso, trails: [] }, true, true)}<span className="nm">{u}</span></div>;
    /* Parky bez filtra: každá krajina zvlášť, koľko z koľkých (Matej 8. 11.). */
    const byCountry = st.iso === 'all' && !!c.logos && !!c.units;
    const countrySecs = byCountry ? isoList.filter((iso) => iso === home || c.items.some((x) => x.iso === iso)).map((iso) => {
      const have = c.items.filter((x) => x.iso === iso);
      const all = c.units?.[iso];
      const miss = all ? all.filter((u) => !have.some((x) => x.name === u)) : [];
      return (
        <div key={iso}>
          <div className="tw-cs"><img src={flagUrl(iso)} alt="" />{regionName(iso)}<b>{n(have.length)}{all && ` / ${all.length}`}</b></div>
          {all && <div className="tw-prg"><div className="pk-progress"><div className="pk-progress__fill" style={fillW((have.length / all.length) * 100)} /></div></div>}
          <div className="tw-ls">{rows(have, true)}{miss.map((u) => lockRow(u, iso))}</div>
        </div>
      );
    }) : null;
    return (
      <>
        <div className="tw-sh">
          <img src={c.ic} alt="" />
          <div>
            <h3>{c.title}</h3>
            <span className="tw-num">{head}{units && <small> / {units.length}</small>}</span>
            {note && <span className="tw-hd2">{note}</span>}
          </div>
        </div>
        {units && <div className="tw-prg"><div className="pk-progress"><div className="pk-progress__fill" style={fillW((inC.length / units.length) * 100)} /></div></div>}
        <div className="tw-fl">
          <button type="button" className={st.iso === 'all' ? 'on' : ''} onClick={() => patch({ iso: 'all', water: 'all' })}>{t('pack.wall.all')}{!c.sum && <b>{c.items.length}</b>}</button>
          {isoList.map((iso) => {
            const k = c.items.filter((x) => x.iso === iso).length;
            return (
              <button key={iso} type="button" className={`${st.iso === iso ? 'on' : ''}${k ? '' : ' zero'}`} onClick={() => patch({ iso, water: 'all' })} aria-label={regionName(iso)}>
                <img src={flagUrl(iso)} alt="" />{!c.sum && <b>{k}</b>}
              </button>
            );
          })}
        </div>
        {st.cat === 'waters' && (
          <div className="tw-fl sub">
            <button type="button" className={st.water === 'all' ? 'on' : ''} onClick={() => patch({ water: 'all' })}>{t('pack.wall.allKinds')} <b>{inC.length}</b></button>
            {(['pond', 'reservoir', 'lake'] as WaterKind[]).map((w) => (
              <button key={w} type="button" className={st.water === w ? 'on' : ''} onClick={() => patch({ water: w })}>
                <img src={ICO(`voda-${WATER_ICON[w]}`)} alt="" />{t(`pack.wall.waters.${w}`)} <b>{inC.filter((x) => x.water === w).length}</b>
              </button>
            ))}
          </div>
        )}
        {hasList && <span className="tw-note">{t('pack.wall.listSoon')}</span>}
        {mark && <button type="button" className="tw-mark" onClick={() => push({ kind: 'mark', mark })}>{t('pack.wall.markTrips')}</button>}
        {countrySecs}
        {!byCountry && (
          <div className="tw-ls">
            {rows(list, st.iso !== 'all')}
            {locked.map((u) => lockRow(u, st.iso))}
            {!list.length && !locked.length && <p className="tw-none">{t('pack.wall.nothing')}</p>}
          </div>
        )}
      </>
    );
  };

  const toggleKind = (tr: HeroTrail, mark: MarkKind) => {
    const on = kindOf(tr, kinds) === mark;
    setKinds(setTripKind(tr.id, on ? (derivedKind(tr) ? 'none' : null) : mark));
  };

  const renderMark = (mark: MarkKind) => {
    const q = find.trim().toLocaleLowerCase(lang);
    const list = walkedTrails.filter((x) => !q || x.name.toLocaleLowerCase(lang).includes(q)).sort((a, b) => a.name.localeCompare(b.name, lang));
    const c = CATS[mark === 'stay' ? 'stays' : 'roadtrips'];
    return (
      <>
        <div className="tw-sh"><img src={c.ic} alt="" /><div><h3>{c.title}</h3><span className="tw-num">{n(mark === 'stay' ? s.nights : c.items.length)}</span>{mark === 'stay' && <span className="tw-hd2">{t('pack.wall.tentNights')}</span>}</div></div>
        <input className="pf-field tw-find" type="search" value={find} onChange={(e) => setFind(e.target.value)} placeholder={t('pack.wall.searchTrip')} aria-label={t('pack.wall.searchTrip')} />
        <div className="tw-ls">
          {list.map((x) => {
            const k = kindOf(x, kinds);
            const on = k === mark;
            return (
              <div key={x.id}>
                <button type="button" className={`tw-row${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggleKind(x, mark)}>
                  <span className="nm">{x.name}</span>
                  {k && !on && <img className="tw-oth" src={ICO(k === 'stay' ? 'stanovacky' : 'roadtrip')} alt="" />}
                  {Number(x.km) > 0 && <span className="mt">{n(Number(x.km))} km</span>}
                  <span className="tw-tick">{on && <Check />}</span>
                </button>
                {on && mark === 'stay' && (() => {
                  const v = nightsOf(x, nights);
                  const put = (next: number) => setNights(setTripNights(x.id, Math.min(365, Math.max(1, next))));
                  return (
                    <div className="tw-nt">
                      <span>{t('pack.wall.tentNights')}</span>
                      <button type="button" onClick={() => put(v - 1)} aria-label="-1"><Minus /></button>
                      <input className="pf-field" type="number" inputMode="numeric" min={1} max={365} value={v} onChange={(e) => { const p = parseInt(e.target.value, 10); if (p >= 1) put(p); }} aria-label={t('pack.wall.tentNights')} />
                      <button type="button" onClick={() => put(v + 1)} aria-label="+1"><Plus /></button>
                    </div>
                  );
                })()}
              </div>
            );
          })}
          {!list.length && <p className="tw-none">{t('pack.wall.nothing')}</p>}
        </div>
      </>
    );
  };

  const renderCountries = () => (
    <>
      <div className="tw-sh"><img src={ICO('krajiny')} alt="" /><div><h3>{t('pack.wall.countriesTitle')}</h3><span className="tw-num">{s.countries.length}</span></div></div>
      {s.countries.map(({ iso, trails }) => {
        const kmC = trails.reduce((a, x) => a + (Number(x.km) || 0), 0);
        const m = (cat: CatKey, ic: string, items: WallItem[], label: string) => (
          <button type="button" onClick={() => openCat(cat, iso)}>
            <img src={ic} alt="" /><b>{items.filter((x) => x.iso === iso).length}</b><span>{label}</span>
          </button>
        );
        return (
          <div key={iso} className="tw-cc" style={SUBBLOCK}>
            <h4><img src={flagUrl(iso)} alt="" />{regionName(iso)}<small>{n(trails.length)} · {n(kmC)} km</small></h4>
            <div className="tw-m">
              {m('ranges', ICO('pohoria'), s.ranges, t('pack.stats.geo.ranges'))}
              {m('parks', ICO('narodny-park'), s.parks, t('pack.wall.parksShort'))}
              {m('peaks', ICO('vrcholy'), s.peaks, t('pack.wall.peaks'))}
              {m('waters', ICO('jazero'), s.waters, t('pack.stats.geo.waters'))}
            </div>
          </div>
        );
      })}
    </>
  );

  const tile = (cat: CatKey, ic: string, count: ReactNode, label: string, wide?: boolean) => (
    <button type="button" className={`tw-tile${wide ? ' wide' : ''}`} style={SUBBLOCK} onClick={() => openCat(cat)}>
      <img src={ic} alt="" /><span><span className="tw-num">{count}</span><span className="tw-t2">{label}</span></span><TileChev />
    </button>
  );

  const next = HERO_BADGES.find((b) => b.trips > walkedTrails.length);
  const prevAt = [...HERO_BADGES].reverse().find((b) => b.trips <= walkedTrails.length)?.trips ?? 0;
  const topRange = s.ranges[0];
  const xpBody = (
    <>
      <span className="tw-xpr">
        <span className="tw-xpl">{lvl.level}</span>
        <span className="pk-progress"><span className="pk-progress__fill" style={fillW(barOn ? lvl.pct : 0)} /></span>
        <span className="tw-xpl nx">{lvl.level + 1}</span>
      </span>
      <span className="tw-xpt"><span>{t('pack.stats.pts', { n: lvl.points })}</span><span>{t('pack.stats.ptsToLevel', { n: lvl.toNext, level: lvl.level + 1 })}</span></span>
    </>
  );
  const tierIdx = tierIndexOfLevel(lvl.level);
  const tier = PACK_TIERS[tierIdx];
  const renderLevel = () => (
    <>
      <div className="tw-lvh">
        <img src={pilgrimImg(tierIdx)} alt="" />
        <div>
          <small>{t('pack.map.rankPilgrim')}</small>
          <h3>{t('pack.wall.level', { n: lvl.level })}</h3>
          <i style={{ background: tierGradient(tier), color: pillInk(tier) }}>{t('pack.wall.levelArea', { area: t(`pack.tier.area.${tier.key}`), range: tierRangeLabel(tier) })}</i>
        </div>
      </div>
      <div className="tw-xp static">{xpBody}</div>
      <p className="tw-why">{t('pack.wall.levelWhy')}</p>
      <div className="tw-sec">{t('pack.wall.levelBands')}</div>
      <div className="tw-lvb">{levelSheet}</div>
    </>
  );
  const longest = s.byKm[0];
  const steepest = s.byAscent[0];

  return (
    <div className="tw-root">
      <style>{TW_CSS + RANK_BADGE_CSS}</style>
      <div className="tw-wall">
        <Poster peaks={s.peaks} />
        <div className="tw-hud">
          <button type="button" className="tw-hudb" onClick={() => push({ kind: 'level' })} aria-label={t('pack.stats.howPointsWork')}>
            <span className="tw-avs">
              {avatarUrl ? <img className="tw-av" src={sizedUrl(avatarUrl, 160)} alt="" /> : <span className="tw-av" />}
              {dogs.slice(0, 3).map((d) => <img key={d.id} className="tw-av tw-avd" src={sizedUrl(d.photo, 120)} alt="" />)}
            </span>
            <span className={`tw-who${dogs.length > 1 ? ' tight' : ''}`}><b>{ownerName}</b><small>{t('pack.map.rankPilgrim')}</small></span>
          </button>
          <PilgrimBadge level={lvl.level} pct={lvl.pct} onClick={() => push({ kind: 'level' })} label={t('pack.stats.howPointsWork')} />
        </div>
        <button type="button" className="tw-xp" onClick={() => push({ kind: 'level' })} aria-label={t('pack.stats.howPointsWork')}>
          {xpBody}
        </button>
        <button type="button" className="tw-skyb" onClick={() => openCat('peaks')} aria-label={t('pack.wall.peaks')} />
      </div>

      <div className="tw-strip">
        <button type="button" className="pk-stage" onClick={() => openCat('km')}><img src={ICO('km-bez')} alt="" /><span className="tw-num"><WallCount n={Math.round(s.km)} /></span><span className="tw-lbl">km</span></button>
        <button type="button" className="pk-stage" onClick={() => openCat('trips')}><img src={ICO('vylety-bez')} alt="" /><span className="tw-num"><WallCount n={walkedTrails.length} /></span><span className="tw-lbl">{t('pack.wall.trips')}</span></button>
        <button type="button" className="pk-stage" onClick={() => push({ kind: 'countries' })}><img src={ICO('krajiny-bez')} alt="" /><span className="tw-num"><WallCount n={s.countries.length} /></span><span className="tw-lbl">{t('pack.wall.countries')}</span></button>
      </div>

      <div className="tw-sec">{t('pack.wall.total')}</div>
      <div className="tw-grid">
        {tile('ranges', ICO('pohoria'), <WallCount n={s.ranges.length} />, t('pack.stats.geo.ranges'))}
        {tile('parks', ICO('narodny-park'), <WallCount n={s.parks.length} />, t('pack.stats.geo.parks'))}
        {tile('peaks', ICO('vrcholy'), <WallCount n={s.peaks.length} />, t('pack.wall.peaks'))}
        {tile('waters', ICO('jazero'), <WallCount n={s.waters.length} />, t('pack.stats.geo.waters'))}
        {tile('journeys', ICO('pridane'), <WallCount n={s.journeys.length} />, t('pack.stats.geo.journeys'))}
        {tile('ascent', ICO('najvyssi'), `${fmtNum(s.everest, lang)}×`, t('pack.wall.everestTile'))}
        {tile('stays', ICO('stanovacky'), <WallCount n={s.nights} />, t('pack.wall.tentNights'))}
        {tile('roadtrips', ICO('roadtrip'), <WallCount n={s.roadtrips.length} />, t('pack.wall.roadtrips'))}
        {showChko && tile('chko', '/icons/chko/biele-karpaty.png', <WallCount n={s.chko.length} />, 'CHKO', true)}
      </div>

      {s.peaks.length + s.byKm.length > 0 && <>
        <div className="tw-sec">{t('pack.wall.records')}</div>
        <div className="tw-grid">
          {s.peaks[0] && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('peaks')}><img src={ICO('najvyssi-lapis')} alt="" /><span><b>{n(s.peaks[0].value ?? 0)} m</b><small>{s.peaks[0].name}</small></span></button>}
          {longest && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('km')}><img src={ICO('km-lapis')} alt="" /><span><b>{n(Number(longest.km))} km</b><small>{longest.name}</small></span></button>}
          {steepest && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('ascent')}><img src={ICO('vrcholy-lapis')} alt="" /><span><b>{n(ascentOf(steepest))} m</b><small>{steepest.name}</small></span></button>}
          {topRange && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('ranges')}><img src={ICO('pohoria-lapis')} alt="" /><span><b>{topRange.trails.length}×</b><small>{topRange.name}</small></span></button>}
        </div>
      </>}

      {dogStats.length > 0 && <>
        <div className="tw-sec">{t('pack.wall.dogs')}</div>
        {dogStats.map((d) => (
          <div key={d.id} className="tw-dog" style={SUBBLOCK}>
            {d.photo ? <img src={sizedUrl(d.photo, 96)} alt="" /> : <span className="tw-av" style={{ width: 48, height: 48 }} />}
            <div><b>{d.name}</b><small>{t('pack.wall.dogLine', { trips: n(d.trips), km: n(d.km) })}</small></div>
          </div>
        ))}
      </>}

      <div className="tw-badges">
        {next && (
          <div className="tw-next">
            <div className="pk-progress"><div className="pk-progress__fill" style={fillW(((walkedTrails.length - prevAt) / (next.trips - prevAt)) * 100)} /></div>
            <span>{t('pack.wall.nextBadge', { name: next.name, n: next.trips - walkedTrails.length })}</span>
          </div>
        )}
        <HeroBadges walkedCount={walkedTrails.length} />
      </div>

      {top && (
        <PackPopup onClose={pop} label={top.kind === 'cat' ? CATS[top.cat].title : top.kind === 'mark' ? t('pack.wall.markTrips') : top.kind === 'countries' ? t('pack.wall.countriesTitle') : t('pack.stats.howPointsWork')}>
          {top.kind === 'cat' ? renderCat(top) : top.kind === 'mark' ? renderMark(top.mark) : top.kind === 'countries' ? renderCountries() : renderLevel()}
        </PackPopup>
      )}
    </div>
  );
}
