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
import { PACK_THEME, PACK_BOX, PACK_R, PACK_SPACE, PACK_TEXT, PROGRESS_CSS, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import type { HeroTrail } from '@/data/heroTrails.generated';
import { useLang, useT } from '@/i18n/LanguageContext';
import { fmtNum } from '@/i18n/bcp47';
import { flagUrl, countryName } from '@/lib/countryGeo';
import type { LevelProgress } from '@/lib/tripPoints';
import { sizedUrl } from '@/services/cloudinaryService';
import { computeTripWall, WALL_UNITS, type TripWallStats, type WallItem, type WaterKind } from './tripWallData';

const T = PACK_THEME;
const S = PACK_SPACE;
const ICO = (n: string) => `/icons/tripstats/${n}.webp`;
/** PODBLOK z matrice, tlačidlá ho berú vykonateľne. */
export const SUBBLOCK = PACK_BOX.subblock;
/** Deň v horách (Matej 8. 11.: *„zmenil na deň s nebom, zelenou, skrátka príroda"*). Farby scény, nie brandu. */
const DAY = { sky: 'linear-gradient(180deg,#5DB2EC 0%,#A8DBF5 62%,#DDF2F5 100%)', sun: '#FFD95A', haze: '#8FBBD6', ridgeHi: '#67AE5C', ridgeLo: '#2F7D3F', forest: '#1F5A2E', meadow: '#86C94F', near: '#5BA83D', pineA: '#1F6B37', pineB: '#2B7F42' };

export const TW_CSS = `${PROGRESS_CSS}
.tw-root{--tw-ink:${LAPIS.ink};--tw-deep:${LAPIS.deep};--tw-gold:${T.cardEdge};}
.tw-wall{position:relative;margin-top:${S.md}px;border-radius:${PACK_R.card}px;overflow:hidden;background:${DAY.sky};border:1.5px solid ${T.cardEdge};box-shadow:${LAPIS_BTN_SHADOW};}
.tw-hud{display:flex;align-items:center;gap:${S.sm}px;padding:${S.md}px;color:${LAPIS.deep};}
.tw-hudb{display:flex;align-items:center;gap:${S.md}px;flex:1;min-width:0;padding:0;background:none;border:0;color:inherit;cursor:pointer;text-align:left;font-family:${FONT_UI};}
.tw-av{width:56px;height:56px;flex:none;border-radius:${PACK_R.pill}px;object-fit:cover;border:2px solid ${T.cardEdge};box-shadow:0 0 0 2px ${T.card},0 0 0 3px ${T.inkStrong};}
.tw-who{flex:1;min-width:0;}
.tw-who b{display:block;font-family:${FONT_TITLE};font-weight:700;font-size:${PACK_TEXT.lead}px;letter-spacing:.14em;text-transform:uppercase;overflow-wrap:anywhere;} /* písmo: meno */
.tw-who small{display:block;margin-top:${S.xs}px;font-size:${PACK_TEXT.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;opacity:.82;}
.tw-xp{padding:0 ${S.md}px;color:${LAPIS.deep};}
.tw-xp .pk-progress{background:rgba(10,26,74,.2);}
.tw-xp .pk-progress__fill{transition:width 1.1s cubic-bezier(.2,.7,.2,1) .2s;}
.tw-xpt{display:flex;justify-content:space-between;margin-top:${S.xs}px;font-size:${PACK_TEXT.micro}px;font-weight:500;opacity:.86;}
.tw-skyb{display:block;width:100%;padding:0;background:none;border:0;cursor:pointer;}
.tw-sky{display:block;width:100%;height:168px;}
.tw-sky text{font:600 ${PACK_TEXT.micro}px ${FONT_UI};fill:${LAPIS.deep};paint-order:stroke;stroke:rgba(255,255,255,.75);stroke-width:3px;}
.tw-sky .tw-a{animation:tw-drift 9s ease-in-out infinite alternate;}
.tw-sky .tw-b{animation:tw-drift 13s ease-in-out infinite alternate-reverse;}
@keyframes tw-drift{from{transform:translateX(-8px);}to{transform:translateX(10px);}}
.tw-edge{fill:none;stroke:${DAY.forest};stroke-width:1.5;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:tw-draw 1.5s ease-out .15s forwards;}
@keyframes tw-draw{to{stroke-dashoffset:0;}}
.tw-strip{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:${S.sm}px;margin:-${S.xxl}px ${S.sm}px 0;}
.tw-strip button{display:flex;flex-direction:column;align-items:center;gap:${S.xs}px;padding:${S.sm}px ${S.xs}px ${S.md}px;cursor:pointer;font-family:${FONT_UI};background:${LAPIS.grad};border:1.5px solid ${T.cardEdge};border-radius:${PACK_R.tile}px;box-shadow:${LAPIS_BTN_SHADOW};}
.tw-strip .tw-num{color:${LAPIS.ink};}
.tw-strip .tw-lbl{color:${LAPIS.ink};opacity:.86;}
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
.tw-soon{position:absolute;right:${S.sm}px;top:${S.sm}px;padding:${S.xs}px ${S.sm}px;border-radius:${PACK_R.pill}px;border:1px dashed ${T.cardEdge};font-size:${PACK_TEXT.micro}px;font-weight:600;line-height:1;color:${T.inkWarm};}
.tw-tile:disabled{cursor:default;opacity:.72;}
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
@media (prefers-reduced-motion:reduce){.tw-sky .tw-a,.tw-sky .tw-b{animation:none;}.tw-edge{animation:none;stroke-dashoffset:0;}.tw-xp .pk-progress__fill{transition:none;}}
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

/** Pohorie zo skutočných vrcholov člena: najvyšší do stredu, výška = metre. */
function Skyline({ peaks }: { peaks: WallItem[] }) {
  const svg = useMemo(() => {
    const W = 358, H = 168, base = 168, top = 30, floor = base - 56;
    const used = peaks.slice(0, 24);
    const maxH = used[0]?.value ?? 0;
    const minH = Math.max(0, (used[used.length - 1]?.value ?? 0) - 50);
    const span = Math.max(1, maxH - minH);
    const y = (h: number) => floor - ((h - minH) / span) * (floor - top);
    const order: WallItem[] = [];
    used.forEach((p, i) => { if (i % 2) order.push(p); else order.unshift(p); });
    const step = W / (order.length + 1);
    const pts = order.map((p, i) => ({ h: p.value ?? 0, name: p.name, x: step * (i + 1) + ((i * 37) % 7) - 3, y: y(p.value ?? 0) }));
    const ws = [{ x: 0, y: floor + 6 }, ...pts, { x: W, y: floor + 10 }];
    const sad = ws.slice(1).map((p, i) => {
      const q = ws[i];
      return { x: q.x + (p.x - q.x) * (0.42 + (((i * 13) % 5) * 0.04)), y: Math.min(Math.max(q.y, p.y) + 8 + ((i * 11) % 5) * 5, floor + 20) };
    });
    let d = `M${ws[0].x} ${ws[0].y}`;
    ws.slice(1).forEach((p, i) => { d += ` L${sad[i].x.toFixed(1)} ${sad[i].y.toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`; });
    const faces = pts.map((p, i) => {
      const r = sad[i + 1];
      return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${r.x.toFixed(1)} ${r.y.toFixed(1)} L${(p.x + (r.x - p.x) * 0.28).toFixed(1)} ${base}Z`;
    });
    const snowFrom = maxH - span * 0.35;
    const snow = pts.filter((p) => p.h >= snowFrom).map((p) => {
      const i = pts.indexOf(p), l = sad[i], r = sad[i + 1];
      const L = ((p.h - snowFrom) / (maxH - snowFrom || 1)) * 15 + 5;
      const ax = p.x + (l.x - p.x) * (L / (l.y - p.y)), bx = p.x + (r.x - p.x) * (L / (r.y - p.y)), yy = p.y + L, mx = (ax + bx) / 2;
      return `M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${ax.toFixed(1)} ${yy.toFixed(1)} L${((ax + mx) / 2).toFixed(1)} ${(yy - 3).toFixed(1)} L${mx.toFixed(1)} ${(yy + 2).toFixed(1)} L${((mx + bx) / 2).toFixed(1)} ${(yy - 3).toFixed(1)} L${bx.toFixed(1)} ${yy.toFixed(1)}Z`;
    });
    let back = `M0 ${floor - 10}`;
    for (let i = 1; i <= 15; i++) back += ` L${((i * W) / 15).toFixed(1)} ${(floor - 14 - ((i * 7) % 5) * 6 - (i % 2 ? 16 : 0)).toFixed(1)}`;
    back += ` L${W} ${base} L0 ${base} Z`;
    const hill = (x: number) => floor + 12 + Math.sin(x / 58) * 7 + Math.sin(x / 23 + 1) * 3;
    const land = (f: (x: number) => number) => {
      let l = `M0 ${f(0).toFixed(1)}`;
      for (let x = 6; x <= W; x += 6) l += ` L${x} ${f(x).toFixed(1)}`;
      return `${l} L${W} ${base} L0 ${base} Z`;
    };
    const meadow = land(hill);
    const near = land((x) => hill(x) + 24 + Math.sin(x / 40 + 2) * 5);
    const pines = Array.from({ length: 13 }, (_, i) => {
      const x = i * 29 + ((i * 17) % 13) + 8, s = 0.75 + ((i * 7) % 4) * 0.16, b = hill(x) + 3;
      const pt = (dx: number, dy: number) => `${(x + dx * s).toFixed(1)} ${(b - dy * s).toFixed(1)}`;
      return { d: `M${pt(0, 24)} L${pt(5, 16)} L${pt(2.5, 16)} L${pt(7, 8)} L${pt(3.5, 8)} L${pt(9, 0)} L${pt(-9, 0)} L${pt(-3.5, 8)} L${pt(-7, 8)} L${pt(-2.5, 16)} L${pt(-5, 16)}Z`, f: i % 2 ? DAY.pineB : DAY.pineA };
    });
    return { W, H, base, top, d, back, faces, snow, meadow, near, pines, peak: pts.find((p) => p.h === maxH) };
  }, [peaks]);
  const { lang } = useLang();
  const { W, H, base, top, d, back, faces, snow, meadow, near, pines, peak } = svg;
  const labelLeft = peak && peak.x > W * 0.45;
  const sunX = labelLeft ? W - 44 : 44;
  const cloud = (x: number, cy: number, s: number, c: string) => (
    <g className={c} fill="#fff" opacity=".92">
      <ellipse cx={x} cy={cy} rx={22 * s} ry={8 * s} /><ellipse cx={x - 9 * s} cy={cy - 5 * s} rx={9 * s} ry={7 * s} /><ellipse cx={x + 7 * s} cy={cy - 7 * s} rx={11 * s} ry={9 * s} />
    </g>
  );
  return (
    <svg className="tw-sky" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <radialGradient id="tw-glow"><stop offset="0" stopColor={DAY.sun} stopOpacity=".55" /><stop offset="1" stopColor={DAY.sun} stopOpacity="0" /></radialGradient>
        <linearGradient id="tw-ridge" gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={base - 40}><stop offset="0" stopColor={DAY.ridgeHi} /><stop offset="1" stopColor={DAY.ridgeLo} /></linearGradient>
        <linearGradient id="tw-face" gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={base - 40}><stop offset="0" stopColor={DAY.forest} stopOpacity=".42" /><stop offset="1" stopColor={DAY.forest} stopOpacity=".08" /></linearGradient>
      </defs>
      <circle cx={sunX} cy="30" r="44" fill="url(#tw-glow)" />
      <circle cx={sunX} cy="30" r="15" fill={DAY.sun} />
      {cloud(labelLeft ? 58 : 300, 30, 1, 'tw-a')}
      {cloud(256, 50, 0.75, 'tw-b')}
      {cloud(330, 18, 0.6, 'tw-a')}
      <path d={back} fill={DAY.haze} fillOpacity=".6" />
      {peak && <>
        <path d={`${d} L${W} ${base} L0 ${base} Z`} fill="url(#tw-ridge)" />
        {faces.map((f, i) => <path key={i} d={f} fill="url(#tw-face)" />)}
        {snow.map((f, i) => <path key={i} d={f} fill="#fff" />)}
        <path className="tw-edge" pathLength={1} d={d} />
        <path d={`M${peak.x} ${peak.y} v-15 l10 3.5 l-10 3.5`} fill={T.cardEdge} stroke={T.cardEdge} />
        <text x={labelLeft ? peak.x - 8 : peak.x + 14} y={peak.y - 4} textAnchor={labelLeft ? 'end' : 'start'}>{peak.name} {fmtNum(peak.h, lang)} m</text>
      </>}
      <path d={meadow} fill={DAY.meadow} />
      {pines.map((p, i) => <path key={i} d={p.d} fill={p.f} />)}
      <path d={near} fill={DAY.near} />
    </svg>
  );
}

type CatKey = 'ranges' | 'parks' | 'chko' | 'peaks' | 'waters' | 'journeys' | 'stays' | 'ascent' | 'km' | 'trips';
type Sheet = { kind: 'cat'; cat: CatKey; iso: string; water: 'all' | WaterKind } | { kind: 'countries' } | { kind: 'level' };

const Chev = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;
const TileChev = () => <svg className="tw-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;

/** Šírka výplne PROGRESU (recept `.pk-progress`). */
const fillW = (pct: number) => {
  const w = `${Math.min(100, Math.max(0, pct))}%`;
  return { display: 'block', width: w };
};

const WATER_ICON: Record<WaterKind, string> = { pond: 'jazierko', reservoir: 'priehrada', lake: 'jazero' };

export function TripStatsWall({ walkedTrails, ownerName, avatarUrl, lvl, dogStats, showChko, onOpenTrip, levelSheet }: {
  walkedTrails: HeroTrail[];
  ownerName: string;
  avatarUrl: string | null | undefined;
  lvl: LevelProgress;
  dogStats: { id: string; name: string; photo?: string | null; trips: number; km: number }[];
  showChko: boolean;
  onOpenTrip: (id: string) => void;
  levelSheet: ReactNode;
}) {
  const t = useT();
  const { lang } = useLang();
  const s = useMemo<TripWallStats>(() => computeTripWall(walkedTrails), [walkedTrails]);
  const [stack, setStack] = useState<Sheet[]>([]);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [barOn, setBarOn] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => setBarOn(true)); return () => cancelAnimationFrame(r); }, []);

  const n = (v: number) => fmtNum(Math.round(v), lang);
  const top = stack[stack.length - 1];
  const push = (x: Sheet) => { setOpenRow(null); setStack((c) => [...c, x]); };
  const pop = () => { setOpenRow(null); setStack((c) => c.slice(0, -1)); };
  const patch = (p: Partial<Extract<Sheet, { kind: 'cat' }>>) => {
    setOpenRow(null);
    setStack((c) => c.map((x, i) => (i === c.length - 1 && x.kind === 'cat' ? { ...x, ...p } : x)));
  };
  const openCat = (cat: CatKey, iso = 'all') => push({ kind: 'cat', cat, iso, water: 'all' });

  const trailItem = (tr: HeroTrail, value: number): WallItem => ({ name: tr.name, iso: tr.country || 'sk', value, trails: [tr] });
  const CATS: Record<CatKey, { title: string; ic: string; items: WallItem[]; units?: Record<string, string[]>; meta: (x: WallItem) => string; sum?: boolean; unit?: string; direct?: boolean }> = {
    ranges: { title: t('pack.stats.geo.ranges'), ic: ICO('pohoria'), items: s.ranges, units: WALL_UNITS.ranges, meta: (x) => (x.trails.length > 1 ? `${x.trails.length}×` : '') },
    parks: { title: t('pack.stats.geo.parks'), ic: ICO('narodny-park'), items: s.parks, units: WALL_UNITS.parks, meta: (x) => (x.trails.length > 1 ? `${x.trails.length}×` : '') },
    chko: { title: 'CHKO', ic: '/icons/chko/biele-karpaty.png', items: s.chko, units: WALL_UNITS.chko, meta: (x) => (x.trails.length > 1 ? `${x.trails.length}×` : '') },
    peaks: { title: t('pack.wall.peaks'), ic: ICO('vrcholy'), items: s.peaks, meta: (x) => `${n(x.value ?? 0)} m` },
    waters: { title: t('pack.stats.geo.waters'), ic: ICO('jazero'), items: s.waters, meta: (x) => (x.water ? t(`pack.wall.water.${x.water}`) : '') },
    journeys: { title: t('pack.stats.geo.journeys'), ic: ICO('pridane'), items: s.journeys, units: WALL_UNITS.journeys, meta: (x) => `${n(x.value ?? 0)} km` },
    stays: { title: t('pack.wall.stays'), ic: ICO('stanovacky'), items: s.stays, meta: (x) => t('pack.wall.nights', { n: x.value ?? 0 }) },
    ascent: { title: t('pack.wall.ascent'), ic: ICO('najvyssi'), items: s.byAscent.map((x) => trailItem(x, x.ascentM ?? 0)), meta: (x) => `${n(x.value ?? 0)} m`, sum: true, unit: 'm', direct: true },
    km: { title: t('pack.wall.kmTitle'), ic: ICO('km'), items: s.byKm.map((x) => trailItem(x, Number(x.km) || 0)), meta: (x) => `${n(x.value ?? 0)} km`, sum: true, unit: 'km', direct: true },
    trips: { title: t('pack.wall.tripsTitle'), ic: ICO('vylety'), items: [...walkedTrails].sort((a, b) => a.name.localeCompare(b.name, lang)).map((x) => trailItem(x, Number(x.km) || 0)), meta: (x) => (x.value ? `${n(x.value)} km` : t('pack.wall.place')), direct: true },
  };

  const isoList = s.countries.map((c) => c.iso);
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
    const head = c.sum ? `${n(inC.reduce((a, x) => a + (x.value ?? 0), 0))} ${c.unit}` : n(inC.length);
    const note = st.cat === 'ascent' && st.iso === 'all' ? t('pack.wall.everest', { n: fmtNum(s.everest, lang) })
      : st.cat === 'stays' && st.iso === 'all' && s.nights > 0 ? t('pack.wall.nights', { n: s.nights }) : '';
    const hasList = !!c.units && st.iso !== 'all' && !units;
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
                <img src={ICO(WATER_ICON[w])} alt="" />{t(`pack.wall.waters.${w}`)} <b>{inC.filter((x) => x.water === w).length}</b>
              </button>
            ))}
          </div>
        )}
        {hasList && <span className="tw-note">{t('pack.wall.listSoon')}</span>}
        <div className="tw-ls">
          {list.map((x) => {
            const flag = st.iso === 'all' ? <img src={flagUrl(x.iso)} alt="" /> : null;
            if (c.direct) {
              return <button key={x.trails[0].id} type="button" className="tw-row" onClick={() => onOpenTrip(x.trails[0].id)}>{flag}<span className="nm">{x.name}</span><span className="mt">{c.meta(x)}</span></button>;
            }
            if (!x.trails.length || st.cat === 'waters') {
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
          })}
          {locked.map((u) => <div key={u} className="tw-row lock"><span className="nm">{u}</span></div>)}
          {!list.length && !locked.length && <p className="tw-none">{t('pack.wall.nothing')}</p>}
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
  const longest = s.byKm[0];
  const steepest = s.byAscent[0];

  return (
    <div className="tw-root">
      <style>{TW_CSS + RANK_BADGE_CSS}</style>
      <div className="tw-wall">
        <div className="tw-hud">
          <button type="button" className="tw-hudb" onClick={() => push({ kind: 'level' })} aria-label={t('pack.stats.howPointsWork')}>
            {avatarUrl ? <img className="tw-av" src={sizedUrl(avatarUrl, 160)} alt="" /> : <span className="tw-av" />}
            <span className="tw-who"><b>{ownerName}</b><small>{t('pack.map.rankPilgrim')}</small></span>
          </button>
          <PilgrimBadge level={lvl.level} pct={lvl.pct} onClick={() => push({ kind: 'level' })} label={t('pack.stats.howPointsWork')} />
        </div>
        <div className="tw-xp">
          <div className="pk-progress"><div className="pk-progress__fill" style={fillW(barOn ? lvl.pct : 0)} /></div>
          <div className="tw-xpt"><span>{t('pack.stats.pts', { n: lvl.points })}</span><span>{t('pack.stats.ptsToLevel', { n: lvl.toNext, level: lvl.level + 1 })}</span></div>
        </div>
        <button type="button" className="tw-skyb" onClick={() => openCat('peaks')} aria-label={t('pack.wall.peaks')}><Skyline peaks={s.peaks} /></button>
      </div>

      <div className="tw-strip">
        <button type="button" onClick={() => openCat('km')}><img src={ICO('km')} alt="" /><span className="tw-num"><WallCount n={Math.round(s.km)} /></span><span className="tw-lbl">km</span></button>
        <button type="button" onClick={() => openCat('trips')}><img src={ICO('vylety')} alt="" /><span className="tw-num"><WallCount n={walkedTrails.length} /></span><span className="tw-lbl">{t('pack.wall.trips')}</span></button>
        <button type="button" onClick={() => push({ kind: 'countries' })}><img src={ICO('krajiny')} alt="" /><span className="tw-num"><WallCount n={s.countries.length} /></span><span className="tw-lbl">{t('pack.wall.countries')}</span></button>
      </div>

      <div className="tw-sec">{t('pack.wall.total')}</div>
      <div className="tw-grid">
        {tile('ranges', ICO('pohoria'), <WallCount n={s.ranges.length} />, t('pack.stats.geo.ranges'))}
        {tile('parks', ICO('narodny-park'), <WallCount n={s.parks.length} />, t('pack.stats.geo.parks'))}
        {tile('peaks', ICO('vrcholy'), <WallCount n={s.peaks.length} />, t('pack.wall.peaks'))}
        {tile('waters', ICO('jazero'), <WallCount n={s.waters.length} />, t('pack.stats.geo.waters'))}
        {tile('journeys', ICO('pridane'), <WallCount n={s.journeys.length} />, t('pack.stats.geo.journeys'))}
        {tile('ascent', ICO('najvyssi'), `${fmtNum(s.everest, lang)}×`, t('pack.wall.everestTile'))}
        {tile('stays', ICO('stanovacky'), <WallCount n={s.stays.length} />, t('pack.wall.stays'))}
        <button type="button" className="tw-tile" style={SUBBLOCK} disabled>
          <img src={ICO('roadtrip')} alt="" /><span><span className="tw-num">0</span><span className="tw-t2">{t('pack.wall.roadtrips')}</span></span><span className="tw-soon">{t('pack.wall.soon')}</span>
        </button>
        {showChko && tile('chko', '/icons/chko/biele-karpaty.png', <WallCount n={s.chko.length} />, 'CHKO', true)}
      </div>

      {s.peaks.length + s.byKm.length > 0 && <>
        <div className="tw-sec">{t('pack.wall.records')}</div>
        <div className="tw-grid">
          {s.peaks[0] && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('peaks')}><img src={ICO('najvyssi-lapis')} alt="" /><span><b>{n(s.peaks[0].value ?? 0)} m</b><small>{s.peaks[0].name}</small></span></button>}
          {longest && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('km')}><img src={ICO('km-lapis')} alt="" /><span><b>{n(Number(longest.km))} km</b><small>{longest.name}</small></span></button>}
          {steepest && <button type="button" className="tw-rec" style={SUBBLOCK} onClick={() => openCat('ascent')}><img src={ICO('vrcholy-lapis')} alt="" /><span><b>{n(steepest.ascentM ?? 0)} m</b><small>{steepest.name}</small></span></button>}
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
        <PackPopup onClose={pop} label={top.kind === 'cat' ? CATS[top.cat].title : top.kind === 'countries' ? t('pack.wall.countriesTitle') : t('pack.stats.howPointsWork')}>
          {top.kind === 'cat' ? renderCat(top) : top.kind === 'countries' ? renderCountries() : levelSheet}
        </PackPopup>
      )}
    </div>
  );
}
