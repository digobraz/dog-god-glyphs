// ŠAT AINUBIS 3D — karta a článok zvitku, Fórum, Zdroje, Moje znalosti (hárok plany/nakresy/ainubis-3d-2026-11-09, základ `zaklad.ts`). Len pod APP_NEW.
// Prevlečenie existujúcich tried (`.akv-zv*`, `.zv-*`, `.vk-*`), štruktúra a texty ostávajú. Fórum a Zdroje (`VaultWall`) sú na LIVE zamknuté.
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3 } from './zaklad';

const H = 'html.papyrus3d';
const UI = `'Space Grotesk',sans-serif`;
const MU = `'LT Museum',serif`;
const CY = A.cyanRGB;
const CA = A.ctaA;
/** Okrúhle tlačidlo na neutrálnej 3D ploche (šípka, krížik, tlačidlo v galérii). `!important`: BackButton nesie vlastný inline šat. */
const ROUND = (sel: string) => `${sel}{width:52px !important;height:52px !important;border:2.5px solid var(--ai-edge) !important;border-radius:50% !important;background:linear-gradient(180deg,#16324A,#0A1622) !important;color:${A.ink} !important;box-shadow:inset 0 2px 0 rgba(${CY},.32),inset 0 -4px 0 rgba(0,0,0,.18),0 6px 0 #020509,0 11px 14px var(--ai-sh) !important;transition:transform .07s,box-shadow .07s;}
${sel}:active{transform:translateY(5px);box-shadow:inset 0 2px 0 rgba(${CY},.32),inset 0 -2px 0 rgba(0,0,0,.18),0 1px 0 #020509,0 2px 4px var(--ai-sh) !important;}`;
/** Položka zoznamu s bodkou výberu (`.opt` z hárku): cyan bodka = vybrané. */
const OPT = `min-height:56px;width:100%;display:flex;align-items:center;justify-content:flex-start;gap:8px;padding:0 14px;font:500 16px ${UI};text-align:left;`;
const OPT_DOT = `content:'';margin-left:auto;flex:none;width:24px;height:24px;border-radius:50%;border:2.5px solid var(--ai-edge);`;

export const AI3D_ZVITOK_CSS = `
/* ── KARTA ZVITKU V ZOZNAME ── */
${H} .akv-zv{padding:0;gap:0;overflow:hidden;${M3.card}}
${H} .akv-zv::before{box-shadow:none;}
${H} .akv-zvimg img{border-radius:0;}
${H} .akv-zvimg .zv-acts{padding:14px 14px 0;}
${H} .akv-zvt{position:static;padding:14px;gap:10px;}
${H} .akv-zvlbl{font:600 12px ${UI};letter-spacing:.14em;text-transform:uppercase;color:rgb(var(--ai-w,${CY}));padding-right:48px;}
${H} .akv-zvn{font:400 24px/1.14 ${MU};letter-spacing:0;text-transform:none;color:${A.ink};padding-right:0 !important;}
${H} .akv-zvv{font:500 16px/1.5 ${UI};color:${A.ink};}
${H} .zv-mid{gap:10px;}
${H} .zv-rule{height:3px;max-width:120px;background:linear-gradient(90deg,${CA},transparent);}
${H} .zv-ctas{gap:12px;}
${b3(`${H} .zv-read`, 'or')}
${b3(`${H} .zv-read.is-done`, 'gr')}
${b3(`${H} .akv-zvsec`, 'nt')}
${H} .zv-read,${H} .akv-zvsec{flex:none;width:100%;min-height:58px;padding:8px 12px;gap:8px;font-size:20px;line-height:1.1;white-space:normal;text-align:center;}
${H} .zv-read.is-done{outline:0;}
${H} .zv-read img,${H} .akv-zvsec img,${H} .akv-zvsec .zv-ic{width:32px;height:32px;margin:0;transform:none;}
${H} .zv-ic--sys{transform:none;width:28px;height:28px;margin:0;background-color:transparent;-webkit-mask:none;mask:none;}
${H} .zv-take{${M3.box}border-left:3px solid ${CA};padding:14px;font:500 16px/1.5 ${UI};font-style:normal;color:${A.ink};}

/* známka: roh karty, plná plocha, zlatý rám */
${H} .zv-sd{background:#1A1305;color:${CA};border:2.5px solid ${CA};font:400 24px ${MU};}
${H} .zv-sd[data-g]{--zv-g:${CA};--zv-gt:transparent;}
${H} .zv-sd--corner{top:0;right:0;width:48px;height:48px;border-width:0 0 2.5px 2.5px;border-radius:0 0 0 14px;}
${H} .akv-zv .akv-zvt > .zv-sd--corner{top:0;right:0;width:48px;height:48px;border-width:0 0 2.5px 2.5px;border-radius:0 0 0 14px;}

/* akcie: 3D tlačidlá, uložiť vpravo */
${H} .zv-acts{justify-content:flex-start;gap:8px;margin-top:0;padding:0;border:0;border-radius:0;background:none;}
${b3(`${H} .zv-act`, 'nt', '14px', 4)}
${H} .zv-act{height:46px;min-width:44px;padding:0 12px 0 6px;gap:4px;font-size:16px;opacity:1;filter:none !important;color:${A.ink};}
${H} .zv-act[data-k="save"]{margin-left:auto;padding:0 7px;}
${H} .zv-act.is-on{filter:none;}
${H} .zv-n{font:400 16px ${MU};color:${A.ink};}
${H} .zv-act img{width:32px;height:32px;}

/* ── ČLÁNOK ── */
${H} .zv-veil{background:linear-gradient(180deg,#071019,#03070C);}
${H} .zv-wrap.pk-stage{background:none;}
${H} .zv-bar{${M3.head}padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px;}
/* článok: šípka a kapsula plávajú na obraze (BAR z hárku), Moje znalosti majú hlavičku v toku */
${H} .zv-veil:has(.zv-hero) > .zv-bar{background:none;border:0;box-shadow:none;padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 0;height:calc(env(safe-area-inset-top,0px) + 64px);margin-bottom:calc(-1 * (env(safe-area-inset-top,0px) + 64px));pointer-events:none;}
${H} .zv-bar > *{pointer-events:auto;}
${ROUND(`${H} .zv-bar > button`)}
${ROUND(`${H} .zv-back`)}
/* Kapsula na obraze článku: tmavá s cyan lemom, nie papyrusová. */
html.papyrus3d .zv-bar .pk-p3d-tops.pk-tops{border-color:rgba(${A.cyanRGB},.45);background:rgba(7,16,25,.86);box-shadow:inset 0 3px 4px rgba(0,0,0,.5);}
${H} .zv-bar > button svg,${H} .zv-back svg,${H} .zv-gback svg,${H} .zv-gnav svg{color:${A.ink} !important;}
@media (max-width:767px){
  ${H} .zv-wrap.pk-stage{padding:0 16px 24px;}
  ${H} .zv-hero{margin:0 -16px;}
  ${H} .zv-hero img{border-radius:0;}
  ${H} .zv-hero .zv-acts{padding:0 16px;margin-top:16px;}
}
${H} .zv-head{padding:16px 0 0;border-radius:0;background:none;border:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;gap:16px;}
${H} .zv-head > .zv-grp + .zv-grp{padding-top:0;border-top:0;}
${H} .zv-grp{gap:12px;}
${H} .zv-head .zv-meta{padding-right:56px;}
${H} .zv-head .zv-h{padding-right:0;}
${H} .zv-meta{font:600 12px ${UI};letter-spacing:.14em;text-transform:uppercase;color:${A.cyan};}
${H} .zv-h{font:400 28px/1.12 ${MU};letter-spacing:0;text-transform:none;color:${A.ink};}
${H} .zv-v{font:500 16px/1.5 ${UI};color:${A.ink};}
${H} .zv-head > .zv-sd--corner{top:0;right:0;width:48px;height:48px;border-width:2.5px;border-radius:14px;}
${H} .zv-badge{background:linear-gradient(180deg,#A8E8BC,#4FB070);border:2.5px solid #04210F;color:#04210F;outline:0;font:400 14px ${MU};letter-spacing:0;text-transform:none;}

/* podcast */
${H} .zv-pod{${M3.card}padding:14px;filter:none;gap:12px;display:flex;flex-direction:column;}
${H} .zv-pod.is-play{filter:none;}
${H} .zv-pod small{${M3.lab}margin:0;}
${H} .zv-player{gap:12px;padding:0;border-radius:0;background:none;color:${A.ink};filter:none;}
${b3(`${H} .zv-pbtn`, 'or', '50%')}
${H} .zv-pbtn{width:52px;height:52px;padding:0;}
${H} .zv-pbtn .zv-ic{width:30px;height:30px;margin:0;}
${H} .zv-pause i{background:${A.ctaInk};}
${H} .zv-ptime{font:500 12px ${UI};color:${A.inkFaint};}
${H} .zv-pbar{height:28px;border-radius:0;background:linear-gradient(90deg,${CA} var(--p,0%),rgba(${CY},.32) var(--p,0%));
  -webkit-mask-image:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 5px);mask-image:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 5px);}
${H} .zv-pbar::-webkit-slider-thumb{background:transparent;width:2px;height:28px;}
${H} .zv-pbar::-moz-range-thumb{background:transparent;width:2px;height:28px;}
${b3(`${H} .zv-plang`, 'cy', '14px', 4)}
${b3(`${H} .zv-ptr`, 'nt', '14px', 4)}
${H} .zv-plang,${H} .zv-ptr{height:44px;padding:0 14px;font-size:16px;background-image:none;}
${H} .zv-plang{background:linear-gradient(180deg,#B4F4FB,${A.cyan});}
${H} .zv-ptr.is-on{border-color:${A.cyan};color:${A.cyan};}
${H} .zv-pmenu{${M3.bub}padding:8px;gap:4px;min-width:200px;}
${H} .zv-pmenu button{white-space:nowrap;}
${H} .zv-pmenu button{font:500 16px ${UI};min-height:44px;border-radius:12px;}
${H} .zv-pmenu button:hover,${H} .zv-pmenu button.is-on{background:rgba(${CY},.16);color:${A.cyan};}
${H} .zv-tr{position:relative;padding:0 0 0 14px;max-height:360px;font:500 14px/1.5 ${UI};color:${A.inkDim};}
${H} .zv-tr::before{content:'';position:absolute;left:0;top:2px;bottom:2px;width:3px;border-radius:999px;background:linear-gradient(180deg,${A.cyan},rgba(${CY},.05));box-shadow:0 0 12px rgba(${CY},.6);}
${H} .zv-tr b{font:400 14px ${MU};letter-spacing:0;text-transform:none;color:${CA};}
${H} .zv-tr b.is-ai{color:${A.ink};}
${H} .zv-tr b.is-ai span{color:${A.cyan};text-shadow:0 0 14px rgba(${CY},.75);}
${H} .zv-req{${M3.box}padding:14px;gap:12px;}
${H} .zv-req select{${M3.field}min-height:54px;padding:0 12px;}
${b3(`${H} .zv-req button`, 'or')}
${H} .zv-req button{min-height:54px;padding:0 16px;font-size:16px;}

/* telo článku */
${H} .zv-body{font:500 16px/1.55 ${UI};color:${A.inkDim};}
${H} .zv-body b,${H} .zv-body strong{font-weight:600;color:${A.ink};}
${H} .zv-body .zv-sec{${M3.hSm}background:none;padding:0;margin:24px 0 12px;}
${H} .zv-yr{color:${CA};}
${H} .zv-fact{${M3.box}position:relative;margin:24px 0;padding:14px 14px 14px 28px;border-left-width:2px;font:500 16px/1.5 ${UI};color:${A.ink};}
${H} .zv-fact::before{content:'';position:absolute;left:14px;top:16px;bottom:16px;width:3px;border-radius:999px;background:linear-gradient(180deg,${CA},rgba(${A.ctaRGB},.05));box-shadow:0 0 12px rgba(${A.ctaRGB},.6);}
${H} .zv-tl{border-left-color:rgba(${CY},.32);}
${H} .zv-tl li::before{background:${CA};box-shadow:0 0 8px ${CA};}
${H} .zv-tl b{font:400 16px ${MU};letter-spacing:0;text-transform:none;color:${CA};}
${H} .zv-tl span{font-size:14px;}
${H} .zv-fig img{border-radius:16px;border:2px solid rgba(${CY},.32);}

/* boxy pod článkom */
${H} .zv-box{${M3.box}padding:14px;border-top:2px solid rgba(${CY},.32);filter:none;}
${H} .zv-box .zv-sec{${M3.lab}background:none;padding:0;margin:0 0 12px;line-height:1.25;}
${H} .zv-box--src,${H} .zv-box--add,${H} .zv-box--talk{--zv-bx:${A.cyan};}
${H} .zv-box--you{border-color:rgba(255,138,122,.45);border-top-color:rgba(255,138,122,.45);}
${H} .zv-add{padding:0;border:0;border-radius:0;background:none;font:500 14px/1.4 ${UI};color:${A.inkDim};}
${H} .zv-src{padding-left:20px;font:500 14px/1.4 ${UI};}
${H} .zv-src li::marker{color:${A.cyan};font-weight:700;}
${H} .zv-rel{gap:12px;}
${b3(`${H} .zv-chip`, 'nt', '14px', 4)}
${H} .zv-chip{height:44px;padding:0 14px;font-size:16px;color:${A.ink};}
${H} .zv-cform .zv-chip{background:linear-gradient(180deg,#FFD65A,${A.ctaB});color:${A.ctaInk};border-color:${A.ctaInk};}
${H} .zv-chip:disabled{opacity:.5;}
${b3(`${H} .zv-prop`, 'nt')}
${H} .zv-prop{min-height:58px;width:100%;padding:8px 12px;gap:8px;font-size:20px;line-height:1.1;justify-content:center;}
${H} .zv-prop.is-open{border-color:${CA};}
${H} .zv-prop img{width:32px;height:32px;margin:0;}
${H} .zv-kinds{flex-direction:column;gap:12px;}
${b3(`${H} .zv-kind`, 'nt')}
${H} .zv-kind{${OPT}}
${H} .zv-kind::after{${OPT_DOT}}
${H} .zv-kind.is-on{background:linear-gradient(180deg,#123C4C,#0B2733);border-color:${A.cyan};color:${A.ink};}
${H} .zv-kind.is-on::after{background:${A.cyan};border-color:#04121A;box-shadow:0 0 10px ${A.cyan};}
${H} .zv-cform textarea{${M3.field}min-height:104px;padding:12px 16px;resize:none;}
${H} .zv-cform textarea:focus{border-color:${A.cyan};}
${H} .zv-ok{font:500 14px ${UI};color:${A.ok};}
${b3(`${H} .zv-done`, 'or')}
${b3(`${H} .zv-done.is-done`, 'gr')}
${H} .zv-done{min-height:58px;padding:8px 12px;gap:4px;width:100%;margin-top:24px;transform:none;}
${H} .zv-done b{font:400 20px ${MU};letter-spacing:0;text-transform:none;}
${H} .zv-done small{font:500 12px ${UI};}

/* diskusia */
${H} .zv-cmt{${M3.box}padding:14px;margin-bottom:12px;gap:12px;border-bottom:2px solid rgba(${CY},.32);}
${H} .zv-cmt p{font:500 14px/1.4 ${UI};color:${A.inkDim};margin:8px 0 0;}
${H} .zv-cmt small{font:500 12px ${UI};}
${H} .zv-cav{width:36px;height:36px;background:#071019;border:2.5px solid ${A.cyan};font:400 16px ${MU};color:${A.cyan};}
${b3(`${H} .zv-clike`, 'nt', '14px', 4)}
${H} .zv-clike{height:38px;padding:0 10px;gap:4px;font-size:14px;color:${A.ink};}
${H} .zv-clike.is-on{border-color:${A.cyan};}
${H} .zv-cdel{opacity:1;}
${b3(`${H} .zv-cdel.is-go`, 'rd', '14px', 4)}
${H} .zv-cdel.is-go{height:38px;padding:0 12px;color:#2A0805;}
${H} .zv-cdel-ask{gap:8px;color:${A.ink};}
${b3(`${H} .zv-cpic`, 'nt', '14px', 4)}
${H} .zv-cpic{height:44px;padding:0 14px;gap:8px;font-size:16px;color:${A.ink};}
${H} .zv-cimg,${H} .zv-cprev{border-radius:12px;}
${H} .zv-toast{${M3.bub}padding:12px 16px;font:500 14px ${UI};color:${A.ink};}

/* galéria */
${H} .zv-gal{background:#01050A;}
${H} .zv-gal img{border-radius:0;}
${ROUND(`${H} .zv-gnav`)}
${ROUND(`${H} .zv-gback`)}

/* ── MOJE ZNALOSTI ── */
${H} .vk-head{gap:12px;}
${H} .vk-head .vk-lv{width:72px;height:72px;flex:none;object-fit:contain;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${H} .vk-head .zv-meta{${M3.lab}}
${H} .vk-head .zv-h{${M3.h}}
${H} .vk-who{font:500 12px ${UI};color:${A.inkFaint};}
${H} .vk-ucen{${M3.box}padding:14px;}
${H} .vk-kpis{gap:8px;margin-top:16px;}
${H} .vk-kpi{align-items:center;padding:12px 4px;border-radius:14px;background:var(--ai-fld);border:2px solid rgba(${CY},.28);backdrop-filter:none;-webkit-backdrop-filter:none;text-align:center;}
${H} .vk-kpi b{font:600 24px ${UI};color:${A.ink};}
${H} .vk-kpi b small{font-size:14px;}
${H} .vk-kpi span{font:600 10px ${UI};letter-spacing:.14em;text-transform:uppercase;color:${A.inkFaint};}
${H} .vk-kpi i{font:500 10px ${UI};}
${H} .vk-kpi--read b{color:${A.ink};}
${H} .vk-dot{width:44px;height:44px;border-radius:50%;font:400 16px ${MU};border:2.5px solid var(--ai-edge);background:var(--ai-fld);color:${A.ink};}
${H} .vk-dot[data-s="1"]{border-color:${CA};color:${CA};}
${H} .vk-dot[data-s="2"]{background:linear-gradient(180deg,#A8E8BC,#4FB070);border-color:#04210F;color:#04210F;}
${H} .vk-circle header{font:400 16px ${MU};}
${H} .vk-world{--ai-w:var(--vk-w);${M3.card}display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:4px 12px;padding:12px 14px;margin-top:12px;border-top-width:3px;}
${H} .vk-world + .vk-world{border-top:3px solid rgb(var(--vk-w));}
${H} .vk-world img{width:48px;height:48px;object-fit:contain;filter:drop-shadow(0 3px 2px var(--ai-sh));grid-row:1 / 3;}
${H} .vk-world .pk-progress{grid-column:2 / 4;background:rgba(var(--vk-w),.2);box-shadow:inset 0 1px 2px rgba(0,0,0,.6);height:8px;}
${H} .vk-world em{font:400 20px ${MU};}
${H} .vk-badges{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
${H} .vk-badge{padding:12px 6px;border-radius:16px;background:var(--ai-fld);border:2px solid rgba(${CY},.28);}
${H} .vk-badge.is-got{background:var(--ai-fld);border-color:rgba(${CY},.28);}
${H} .vk-badge .vk-bic{width:52px;height:52px;background:none;border:0;filter:none;}
${H} .vk-badge .vk-bic img{width:52px;height:52px;}
${H} .vk-badge:not(.is-got) .vk-bic img{filter:grayscale(1) opacity(.4);}
${H} .vk-badge b,${H} .vk-badge.is-got b{font:400 14px/1.15 ${MU};letter-spacing:0;text-transform:none;color:${A.ink};}
${H} .vk-badge small{font:600 10px/1.3 ${UI};color:${A.inkFaint};}
${H} .vk-list{gap:12px;}
${b3(`${H} .vk-row`, 'nt')}
${H} .vk-row{width:100%;min-height:70px;padding:8px 12px;gap:12px;justify-content:flex-start;text-align:left;border-bottom:2.5px solid var(--ai-edge);}
${H} .vk-row img{width:42px;border-radius:8px;}
${H} .vk-row em{font:400 16px/1.2 ${MU};color:${A.ink};}
${H} .vk-row small{font:600 12px ${UI};color:${A.inkFaint};}
${H} .vk-row .vk-ok{color:${A.ok};}
${H} .vk-req{${M3.box}display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;margin-bottom:12px;border-bottom:2px solid rgba(${CY},.32);}
${H} .vk-req > div{min-width:0;flex:1;}
${H} .vk-st{flex:none;display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;border:1.5px solid rgba(var(--st,${CY}),.7);background:rgba(var(--st,${CY}),.14);font:600 12px ${UI};color:rgb(var(--st,${CY}));white-space:nowrap;}
${H} .vk-st[data-s="new"]{--st:${A.ctaRGB};}
${H} .vk-st[data-s="accepted"],${H} .vk-st[data-s="done"]{--st:127,215,154;}
${H} .vk-st[data-s="rejected"]{--st:255,138,122;}
${H} .vk-none{font:500 12px ${UI};}
/* ── FÓRUM A ZDROJE (VaultWall; na LIVE zamknuté, prevlečenie úmerné) ── */
${H} .akw-find{${M3.field}min-height:54px;padding:0 16px;border-radius:16px;backdrop-filter:none;-webkit-backdrop-filter:none;}
${H} .akw-find input{font:500 16px ${UI};}
${b3(`${H} .akw-new`, 'or')}
${H} .akw-new{width:100%;min-height:58px;justify-content:center;gap:8px;padding:8px 12px;font-size:20px;line-height:1.1;margin-bottom:16px;}
${H} .akw-post,${H} .akw-my,${H} .akw-doc{${M3.card}backdrop-filter:none;-webkit-backdrop-filter:none;}
${H} .akw-post:hover{transform:translateY(-2px);}
${H} .akw-post::before,${H} .akw-my::before{box-shadow:none;}
${H} .akw-sheet{${M3.sheet}backdrop-filter:none;-webkit-backdrop-filter:none;}
${H} .akw-scrim{${M3.scrim}}
${ROUND(`${H} .akw-x`)}
${ROUND(`${H} .akw-back`)}
${H} .akw-x{width:44px !important;height:44px !important;}
${H} .akw-back svg,${H} .akw-x svg{color:${A.ink} !important;}
${H} .akw-who b{font:400 18px ${MU};}
${H} .akw-ptxt,${H} .akw-vd,${H} .akw-aibody{font:500 16px/1.5 ${UI};}
${H} .akw-ai,${H} .akw-advice,${H} .akw-why,${H} .akw-stops{${M3.box}}
${b3(`${H} .akw-act`, 'nt', '14px', 4)}
${H} .akw-act{min-height:44px;padding:0 14px;gap:8px;font:400 16px ${MU};color:${A.ink};}
${H} .akw-act.is-on{border-color:${CA};color:${CA};}
${H} .akw-tag,${H} .akw-kind,${H} .akw-myst{border:1.5px solid rgba(${A.ctaRGB},.7);background:rgba(${A.ctaRGB},.14);color:${CA};font:600 12px ${UI};}
${H} .akw-doc h2{${M3.hSm}}
${H} .akw-pill-list li{${M3.box}}
${H} .akw-tally b{font:600 24px ${UI};}
`;
