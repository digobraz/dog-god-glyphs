// ŠAT AINUBIS 3D — domov, DOG ID, správy, vstup, oznamy (hárok plany/nakresy/ainubis-3d-2026-11-09, základ `zaklad.ts`). Len pod APP_NEW.
// Papyrusové okolie ostáva papyrusové, tmavý je len AINUBISOV blok. Rámy, boxy a tlačidlá berie `M3` a `b3()` zo základu.
// Texty, funkcie a poradie sa nemenia, mení sa len vzhľad. Logo v JSX = `AI_LOGO` pod `APP_NEW`.
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3 } from './zaklad';

const P = 'html.papyrus3d';
/** Meno AINUBISA: písmo šatu, „AI“ cyan (hárok `.who2 b`). */
const MENO = `font:400 20px/1 'LT Museum',serif;letter-spacing:.06em;text-transform:none;color:${A.ink};`;
const AI = `color:${A.cyan};font-weight:400;text-shadow:none;`;
const POD = `font:500 12px/1.2 'Space Grotesk',sans-serif;letter-spacing:0;text-transform:none;color:${A.inkFaint};`;
const TEXT = `font:500 14px/1.4 'Space Grotesk',sans-serif;color:${A.inkDim};`;

export const AI3D_OSTATNE_CSS = `
/* ── CITÁT, PRÍBEH A ODLOŽENÉ ZVITKY VO FEEDE (+ hlavička zvitku) ── */
${P} .fai{${M3.card}overflow:hidden;display:flex;flex-direction:column;}
${P} .fai-h{padding:14px 14px 0;gap:10px;}
${P} .fai-av{width:48px;height:48px;border:0;border-radius:0;box-shadow:none;background-color:transparent !important;background-size:contain;background-position:center;background-repeat:no-repeat;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .fai-who b{${MENO}}
${P} .fai-who b .ai{${AI}}
${P} .fai-who small{margin-top:4px;${POD}}
${P} .fai-b{padding:10px 14px 14px;gap:10px;}
${P} .fai-b h3{${M3.hSm}margin:0;}
${P} .fai-b p{${TEXT}}
${P} .fai-more{font:500 14px/1.4 'Space Grotesk',sans-serif;color:${A.cyan};text-decoration:underline;}
/* Citát ostáva na svojej maľbe, šat mu dáva len rám. */
${P} .fai-q{width:auto;margin:10px 14px 0;overflow:hidden;border-radius:16px;border:2px solid rgba(${A.cyanRGB},.32);}
${P} .fai-v{aspect-ratio:auto;height:240px;order:-1;}
${P} .fai .zv-acts{padding:0;border:0;background:none;border-radius:0;justify-content:flex-start;gap:8px;}
${b3(`${P} .fai .zv-act`, 'nt', '14px', 4)}
${P} .fai .zv-act{height:46px;min-width:44px;padding:0 12px;gap:4px;font-size:16px;opacity:1;}
${P} .fai .zv-act .zv-n{color:${A.ink};font:400 16px/1 'LT Museum',serif;}
${P} .fai .zv-act[data-k="save"]{margin-left:auto;}
${b3(`${P} .fai-cta`, 'or', '16px')}
${P} .fai-cta{height:54px;font-size:16px;}
${P} .fai-sv{padding:10px 0;border:0;border-bottom:1.5px solid rgba(${A.cyanRGB},.16);border-radius:0;background:none;gap:10px;font:500 16px 'Space Grotesk',sans-serif;}
${P} .fai-sv:last-of-type{border-bottom:0;}
${P} .fai-sv img{width:30px;height:30px;border-radius:8px;}
${P} .fai-sv b{font-weight:500;font-size:16px;}
@media (max-width:639px){
  ${P} .pkf-it .fai{margin:0 16px;border-width:3px;border-radius:20px;}
}

/* ── BRÁNA NA DOMOVE: veľké meno, text, logo vpravo ── */
${P} .gw-ainubis{${M3.card}min-height:0;padding:16px;gap:8px;filter:none;}
${P} .gw-ainubis:hover,${P} .gw-ainubis:focus-visible{${M3.card}}
${P} .gw-ainubis::before,${P} .gw-ainubis::after{display:none;}
${P} .gw-ainubis .gw-body{order:1;flex:1;width:auto;margin:0;}
${P} .gw-ainubis .gw-title{font:400 32px/1.05 'LT Museum',serif;letter-spacing:.06em;text-transform:none;text-indent:0;text-shadow:none;color:${A.ink};filter:none;}
${P} .gw-ainubis .gw-ai{${AI}}
${P} .gw-ainubis .gw-lead{${TEXT}margin-top:6px;text-shadow:none;filter:none;}
${P} .gw-ainubis .gw-art{order:2;position:static;flex:none;width:120px;height:120px;right:auto;top:auto;transform:none;filter:none;}
${P} .gw-ainubis .gw-art img{filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .gw-ainubis:hover .gw-art{transform:none;}

/* ── DOG ID: rada (blok s nadpisom) a potvrdenie (bublina), rada v popupe má rail ── */
${b3(`${P} .dfl-tip`, 'nt', '16px', 4)}
${P} .dfl-tip{min-height:56px;gap:10px;padding:8px 14px;margin-top:12px;margin-bottom:4px;}
${P} .dfl-tip .who{${MENO}font-size:16px;color:${A.ink};}
${P} .dfl-tip .who span{${AI}}
${P} .dfl-tip .tt{${TEXT}color:${A.ink};}
${P} .dfl-logo{width:36px;height:36px;flex:none;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .dfl-say{display:grid;grid-template-columns:52px minmax(0,1fr);column-gap:10px;align-items:start;margin-top:12px;padding:12px;${M3.bub}}
${P} .dfl-say .dfl-logo{grid-row:1 / span 2;width:52px;height:52px;}
${P} .dfl-say .who{font:400 16px/1 'LT Museum',serif;letter-spacing:.06em;margin-bottom:4px;color:${A.ink};}
${P} .dfl-say .who span{${AI}}
${P} .dfl-say > span:last-child{${TEXT}}
${P} .dfl-tipx{position:relative;padding-left:14px;${TEXT}}
${P} .dfl-tipx::before{content:'';position:absolute;left:0;top:2px;bottom:2px;width:3px;border-radius:999px;background:linear-gradient(180deg,${A.cyan},rgba(${A.cyanRGB},.05));box-shadow:0 0 12px rgba(${A.cyanRGB},.6);}

/* ── LONGEVITY PROTOKOL (kalendár) ── */
${P} .cal-longev{${M3.card}padding:14px;gap:10px;}
${P} .cal-longev-face{width:48px;height:48px;border-radius:0;background:none;box-shadow:none;overflow:visible;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .cal-longev-face img{width:100%;height:100%;object-fit:contain;}
${P} .cal-longev-txt b{${M3.hXs}}
${P} .cal-longev-txt p{${TEXT}}
${P} .cal-ai{${MENO}font-size:14px;}
${P} .cal-ai > span{${AI}}
${P} .cal-soon{padding:4px 10px;border:1.5px solid rgba(245,199,61,.7);background:rgba(245,199,61,.14);color:#F5C73D;font:600 12px 'Space Grotesk',sans-serif;letter-spacing:0;text-transform:none;}

/* ── ODCHOD ZO SVORKY ── */
${P} .pd-msg{${M3.card}display:grid;grid-template-columns:48px minmax(0,1fr);column-gap:10px;row-gap:10px;align-items:center;padding:14px;}
${P} .pd-msg > *{grid-column:1 / -1;}
${P} .pd-msg > .pd-logo{grid-column:1;grid-row:1;width:48px;height:48px;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .pd-msg > .pd-name{grid-column:2;grid-row:1;${MENO}}
${P} .pd-name span{${AI}}
${P} .pd-msg p{${TEXT}}
${P} .pd-days{${M3.hSm}}
${b3(`${P} .pd-cta`, 'rd', '16px')}
${P} .pd-cta{height:54px;font-size:16px;padding:0 16px;}
${P} .pd-out{border:0;background:none;font:500 12px 'Space Grotesk',sans-serif;letter-spacing:0;text-transform:none;color:${A.inkFaint};min-height:44px;}

/* ── SPRIEVODCA: úvod ── */
${P} .wzc-welcome img{width:132px;height:132px;filter:drop-shadow(0 6px 14px rgba(${A.cyanRGB},.5));}
${P} .wzc-welcome .wm{${MENO}font-size:20px;letter-spacing:.06em;}
${P} .wzc-welcome .wm span{${AI}}
${P} .wzc-welcome h2{${M3.h}}
${P} .wzc-welcome p{${TEXT}font-size:14px;}
${b3(`${P} .wzc-welcome .mcoach-ok`, 'or', '16px')}
${P} .wzc-welcome .mcoach-ok{height:54px;font-size:16px;}
${P} .wzc-welcome .mcoach-mute{font:500 12px 'Space Grotesk',sans-serif;letter-spacing:0;text-transform:none;color:${A.inkFaint};min-height:44px;}

/* ── PRIHLÁSENIE: logo bez kruhu a rámu ── */
${P} .lg-crest{background:none;border:0;box-shadow:none;border-radius:0;}
${P} .lg-face{background:none;box-shadow:none;animation:none;border-radius:0;overflow:visible;filter:drop-shadow(0 6px 14px rgba(${A.cyanRGB},.5));}
${P} .lg-face img{width:100%;height:100%;margin-top:0;}

/* ── PRAVIDLÁ: riadok AINUBISA ── */
${P} .tr-row:has(.tr-ib--ai){${M3.bub}grid-template-columns:52px minmax(0,1fr);column-gap:10px;align-items:start;padding:12px;color:${A.inkDim};}
${P} .tr-row:has(.tr-ib--ai) .tr-ib{width:52px;height:52px;border:0;border-radius:0;background:none;overflow:visible;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .tr-row:has(.tr-ib--ai) .tr-ib img{width:100%;height:100%;object-fit:contain;}
${P} .tr-row:has(.tr-ib--ai) .tr-head{${MENO}font-size:16px;display:block;margin-bottom:4px;}
${P} .tr-row:has(.tr-ib--ai) .tr-head > span{${AI}}
${P} .tr-row:has(.tr-ib--ai) b:not(.tr-head){font-weight:600;color:${A.ink};}

/* ── POVOLENIA: tmavý riadok s logom a prepínačom ── */
${P} .ae-perm--ai{${M3.box}grid-template-columns:48px minmax(0,1fr) auto;column-gap:10px;padding:12px;background:#071019;border:2px solid var(--ai-edge);}
${P} .ae-ib--ai{width:48px;height:48px;border:0;border-radius:0;background:none;overflow:visible;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .ae-ib--ai img{width:100%;height:100%;object-fit:contain;}
${P} .ae-perm--ai .ae-perm-title{${MENO}}
${P} .ae-ai-name > span{${AI}}
${P} .ae-perm--ai small{${POD}font-size:12px;}
${P} .ae-perm--ai .ae-sw{width:48px;height:28px;border:2.5px solid var(--ai-edge);background:#03090F;box-shadow:none;}
${P} .ae-perm--ai .ae-sw i{top:2px;left:2px;width:19px;height:19px;background:${A.inkFaint};box-shadow:none;}
${P} .ae-perm--ai.is-on .ae-sw{background:rgba(${A.cyanRGB},.22);border-color:var(--ai-edge);box-shadow:none;}
${P} .ae-perm--ai.is-on .ae-sw i{left:22px;background:${A.cyan};box-shadow:0 0 8px ${A.cyan};}

/* ── OZNAMY V ZVONČEKU: riadok AINUBISA ── */
${P} .ntf-row--ai{${M3.box}background:var(--ai-card);border:2.5px solid var(--ai-edge);}
${P} .ntf-av{width:40px;height:40px;border-radius:0;background:none;box-shadow:none;overflow:visible;}
${P} .ntf-av img{width:100%;height:100%;object-fit:contain;}
${P} .ntf-row--ai .ntf-ai span{${AI}}
`;
