// ŠAT AINUBIS 3D — Psí rozum: hlavička, svety, zoznam, mozog (hárok plany/nakresy/ainubis-3d-2026-11-09, základ `zaklad.ts`). Len pod APP_NEW.
// Všetko visí na `html.papyrus3d .akv-root`, takže web na dogypt.com sa nezmení ani o pixel. Značkovanie dodáva `PackAinubis.tsx` a `PackIdentityBar.tsx`
// (pod APP_NEW); tu sa len prekrýva vzhľad existujúcich tried. Tvary a farby berie `M3` a `b3()` zo základu, nič sa nepíše druhýkrát.
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3 } from './zaklad';

const R = 'html.papyrus3d .akv-root';
const CY = A.cyanRGB;
const MOB = '@media (max-width:1023px)';
const PC = '@media (min-width:1024px)';

export const AI3D_VAULT_CSS = `
/* ── HLAVIČKA = hlavička mapy (hárok .hd, .me, .av, .dg, .lv) ───────────────────────────────────── */
${MOB}{
  ${R} .akv-top{left:0;right:0;top:0;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 16px) 16px 18px;pointer-events:auto;${M3.head}}
  ${R} .akv-top::before,${R}[data-view="scroll"] .akv-top::before{display:none;}
  ${R} .akv-top:has(.akv-pos-dd){z-index:962;}
}
${R} .pkid--app{top:0;gap:8px;}
${R} .pkid-app{position:relative;display:block;flex:none;width:104px;height:66px;padding:0;}
${R} .pkid-app-av{position:absolute;left:0;top:0;box-sizing:border-box;width:66px;height:66px;border-radius:50%;object-fit:cover;border:3px solid rgb(${CY});
  box-shadow:0 0 0 2px var(--ai-out);background:radial-gradient(circle at 35% 28%,#12233a,#01050A 74%);}
${R} .pkid-app-av--init{display:grid;place-items:center;font:400 24px/1 'LT Museum',serif;color:${A.cyan};}
${R} .pkid-app-dg{position:absolute;left:54px;top:38px;box-sizing:border-box;width:42px;height:42px;border-radius:50%;object-fit:cover;border:2.5px solid rgb(${CY});
  box-shadow:0 0 0 1.5px var(--ai-out);background:#000;z-index:1;}
${R} .pkid-app-lv{position:absolute;left:38px;top:-25px;width:74px;height:74px;z-index:2;pointer-events:none;}
${R} .pkid-app-lv img{width:74px;height:74px;max-width:none;transform:scale(1.14);filter:drop-shadow(0 3px 2px var(--ai-sh));}
${R} .pkid-app-lv b{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:400 20px/1 'LT Museum',serif;color:#fff;text-shadow:0 1px 2px #000,0 2px 5px #000;}
/* Kapsula SOS / správy / zvonček: ten istý komponent ako na mape (TopActions), len cyan lem na tmavom (hárok .tops). */
${R} .pk-p3d-tops.pk-tops{border-color:rgba(${CY},.45);background:rgba(${CY},.10);box-shadow:inset 0 3px 4px rgba(0,0,0,.5);}

/* Hľadanie + Filtre (hárok .srch, .filt) */
${R} .akv-search{min-height:54px;padding:0 16px;gap:8px;border-radius:16px;border:2.5px solid var(--ai-edge);background:var(--ai-fld);box-shadow:var(--ai-inset);}
${R} .akv-search:focus-within{box-shadow:var(--ai-inset),0 0 0 2px rgba(${CY},.45);}
${R} .akv-search input{font:500 16px/1.35 'Space Grotesk',sans-serif;padding:0;}
${b3(`${R} .akv-fbtn`, 'or', '16px')}
${R} .akv-fbtn{min-height:54px;padding:0 16px;gap:8px;font-size:20px;}
${R} .akv-fbtn.is-set{filter:none;}
${R} .akv-fbtn i{width:30px;height:30px;margin:0;}

/* Prepínač 4 záložiek (hárok .sw): Fórum a Zdroje ostávajú vyblednuté, kým sú zamknuté */
${R} .akv-planes{${M3.sw}flex:1 1 auto;min-width:0;}
${R} .akv-plane{${M3.swBtn}padding:0 4px;flex:1 1 0;line-height:1;font-size:14px;overflow:visible;}
${R} .akv-plane img,${R} .akv-plane svg{width:22px;height:22px;flex:none;}
${R} .akv-plane[aria-current="page"]{${M3.swOn}}
${R} .akv-plane:disabled{color:${A.inkFaint};opacity:.6;}
@media (max-width:380px){${R} .akv-search{padding:0 12px;gap:6px;}${R} .akv-fbtn{padding:0 12px;gap:4px;font-size:16px;}${R} .akv-fbtn i{width:24px;height:24px;}
  ${R} .akv-plane{font-size:12px;gap:2px;}${R} .akv-plane img,${R} .akv-plane svg{width:18px;height:18px;}}

/* ── VÝBER SVETA: karta so svetovou kresbou, názvom, upútavkou, progresom a šípkou (hárok wcard) ─── */
${R} .wp-label{${M3.lab}}
${R} .akv-world{${M3.card}overflow:hidden;backdrop-filter:none;}
${R} .akv-world::after,${R} .wp-card:not(.is-soon)::before{content:none;}
${R} .akv-world.is-flash{outline:2px solid ${A.cyan};outline-offset:2px;}
${R} .wp-card{grid-template-columns:64px minmax(0,1fr);column-gap:12px;row-gap:4px;padding:12px 14px;}
${R} .wp-img{grid-row:1 / 4;width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${R} .wp-card.is-soon .wp-img{filter:saturate(.4) opacity(.6);}
${R} .wp-name{font-family:'LT Museum',serif;font-weight:400;font-size:20px;line-height:1.15;letter-spacing:0;text-transform:none;color:${A.ink};}
${R} .is-soon .wp-name{color:${A.inkDim};}
${R} .wp-tease{font:500 14px/1.4 'Space Grotesk',sans-serif;color:${A.inkFaint};}
${R} .wp-go,${R} .wp-lock{color:${A.cyan};}
/* Šípka je tenká SVG čiara s farbou zapísanou priamo na prvku (ThinArrow), na tmavom ju prebije len !important. */
${R} .wp-go svg,${R} .wp-lock svg,${R} .akv-pos-back svg,${R} .akv-pos-b svg,${R} .akv-plane svg{color:currentColor !important;}
${R} .wp-row .pk-progress{height:8px;box-shadow:inset 0 1px 2px rgba(0,0,0,.6);}
${R} .wp-row .pk-progress__fill{box-shadow:0 0 8px rgb(var(--ai-w,${CY}));}
${R} .wp-num{font-size:12px;}

/* ── PRUH POLOHY (hárok .pos) ─────────────────────────────────────────────────────────────────────── */
${R} .akv-pos{min-height:54px;padding:0 8px 4px;gap:8px;border-radius:16px;border:2.5px solid rgb(var(--ai-w,${CY}));background:var(--ai-fld);
  box-shadow:0 0 18px -6px rgb(var(--ai-w,${CY})),inset 0 3px 4px rgba(0,0,0,.6);}
${b3(`${R} .akv-pos-b`, 'nt', '12px', 3)}
${R} .akv-pos-b{height:38px;padding:0 10px;gap:4px;font-size:14px;}
${R} .akv-pos-b:hover{border-color:var(--ai-edge);color:${A.ink};}
${R} .akv-pos-b[aria-pressed="true"]:not(.wp-back),${R} .akv-pos-b[aria-expanded="true"]{color:${A.ink};background:linear-gradient(180deg,#123C4C,#0B2733);border-color:${A.cyan};}
${R} .akv-pos-back{width:38px;padding:0;}
${R} .akv-pos-img{width:34px;height:34px;flex:none;object-fit:contain;}
${R} .akv-pos-w3{flex:0 1 auto;min-width:0;font:400 16px/1.1 'LT Museum',serif;color:rgb(var(--ai-w,${CY}));}
${R} .akv-pos-c{display:none;}
${R} .akv-pos-n{font:600 14px/1 'Space Grotesk',sans-serif;color:${A.ink};}
${R} .akv-pos-acts{margin-left:auto;}
${R} .akv-pos-bar{left:16px;right:16px;bottom:5px;gap:3px;}
${R} .akv-pos-bar .pk-progress{height:3px;}
${R} .akv-pos-b i{width:22px;height:22px;margin:0;}

/* ── PANELY ZDOLA: Filtre a Okruhy (hárok .sheet, .grab, .scrim) ─────────────────────────────────── */
${R} .akv-sback{${M3.scrim}}
${R} .akv-sheet{${M3.sheet}gap:14px;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 28px);}
${R} .akv-grab{--pk-grab:var(--ai-edge);}
${R} .akv-sttl{${M3.h}text-align:center;}
${R} .akv-sgrp > b{${M3.lab}}
${R} .akv-chip{${M3.swBtn}height:44px;padding:0 14px;border:2.5px solid var(--ai-edge);background:var(--ai-fld);}
${MOB}{
  ${R} .akv-pos-dd{position:fixed;left:0;right:0;bottom:0;top:auto;z-index:961;max-height:84vh;gap:14px;overflow-y:auto;
    padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 28px);${M3.sheet}border-radius:24px 24px 0 0;
    box-shadow:0 -3px 0 var(--ai-out),0 -12px 30px rgba(${CY},.28),0 0 0 100vmax rgba(2,6,11,.72);}
}
${PC}{${R} .akv-pos-dd .akv-stop{display:none;}}
${b3(`${R} .akv-pos-dd button`, 'nt', '16px', 4)}
${R} .akv-pos-dd button{min-height:56px;height:auto;width:100%;flex:none;padding:8px 14px;font:500 16px/1.2 'Space Grotesk',sans-serif;}
${R} .akv-pos-dd button > span{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;}
${b3(`${R} .akv-pos-dd button.is-cur`, 'cy', '16px', 4)}
${R} .akv-pos-dd button.is-cur{font-weight:600;}
${R} .akv-pos-dd button:disabled{opacity:.45;}
${R} .akv-pos-dd button.is-done > b{color:${A.cyan};}
${R} .akv-pos-dd .akv-pos-sec{color:${A.cyan};}

/* ── MOZOG: prepínač dole (hárok .go), tlačidlo Vrstvy (.bic) a panel Vrstvy (.bx) ──────────────── */
${b3(`${R} .akv-mtoggle`, 'or', '16px')}
${R} .akv-mtoggle{height:62px;padding:0 24px;gap:8px;font-size:24px;}
${R} .akv-mactions{bottom:calc(env(safe-area-inset-bottom,0px) + 132px);}
${b3(`${R} .akv-ctlbtn`, 'nt', '16px')}
${R} .akv-ctlbtn{width:52px;height:52px;}
${R} .akv-ctlbtn[aria-expanded="true"]{background:linear-gradient(180deg,#123C4C,#0B2733);}
${R} .akv-ctlbtn i,${R} .akv-ctlbtn[aria-expanded="true"] i{width:30px;height:30px;}
${R} .akv-lpanel{${M3.box}width:230px;padding:14px;background:#071019;border:2px solid var(--ai-edge);gap:0;right:calc(100% + 12px);}
${R} .akv-lpanel > b{${M3.lab}margin:0 0 4px;font-weight:600;}
${R} .akv-lyr{padding:10px 0;gap:10px;border:0;border-radius:0;border-bottom:1.5px solid rgba(${CY},.16);font:500 16px/1.2 'Space Grotesk',sans-serif;color:${A.ink};}
${R} .akv-lyr[aria-pressed="true"]{background:none;color:${A.ink};}
${R} .akv-lyr:disabled{opacity:.55;color:${A.ink};}
${R} .akv-lyr u{width:10px;height:10px;}
${R} .akv-lyr:not(:disabled)::after{content:'';margin-left:auto;flex:none;width:48px;height:28px;box-sizing:border-box;border-radius:999px;border:2.5px solid var(--ai-edge);
  background:radial-gradient(circle at 14px 50%,${A.inkFaint} 9px,transparent 10px),#03090F;}
${R} .akv-lyr[aria-pressed="true"]:not(:disabled)::after{background:radial-gradient(circle at calc(100% - 14px) 50%,${A.cyan} 9px,transparent 10px),rgba(${CY},.22);}
${R} .akv-leg{margin:0 0 6px 20px;}

/* ── SPODNÁ LIŠTA: tmavé telo, lapisové plus ostáva, aktívny slot AINUBIS = oranžová guľa (hárok .dock, .here) ── */
${R} .pk-p3d-dock{border:2.5px solid var(--ai-out);background:linear-gradient(180deg,#14304A,#071019);
  box-shadow:inset 0 0 0 3px var(--ai-edge),0 6px 0 var(--ai-lip),0 12px 16px var(--ai-sh),0 0 34px -10px rgba(${CY},.7);}
${R} .pk-dock-band .pk-b3--gold.pk-b3--round{--b3-a:#FFD65A;--b3-b:${A.ctaB};--b3-p:#8A5A0E;--b3-l:${A.ctaInk};--b3-i:${A.ctaInk};}

/* ── PANEL + (otvára AddTripEntry v tomto koreni): tmavý šat ──────────────────────────────────────── */
${R} .att-entry-backdrop{${M3.scrim}}
${R} .att-entry-panel{background:var(--ai-sheet);border:3px solid var(--ai-edge);border-radius:20px;box-shadow:0 0 0 2px var(--ai-out),0 7px 0 2px var(--ai-lip),0 13px 16px var(--ai-sh),0 0 40px -14px rgba(${CY},.7);}
${R} .att-entry-panel::before,${R} .att-entry-panel::after{content:none;}
${R} .att-entry-row{background:linear-gradient(180deg,#16324A,#0A1622);border:2.5px solid var(--ai-edge);box-shadow:inset 0 2px 0 rgba(${CY},.32),0 6px 0 #020509,0 11px 14px var(--ai-sh);}
${R} .att-entry-row:hover,${R} .att-entry-row:focus-visible{border-color:var(--ai-edge);}
${R} .att-entry-row:active{box-shadow:inset 0 2px 0 rgba(${CY},.32),0 1px 0 #020509;}
${R} .att-entry-title{color:${A.ink};}
${R} .att-entry-num{color:${A.inkDim};}
${R} .att-entry-grab span,${R} .att-entry-grab i{background:var(--ai-edge);}
`;
