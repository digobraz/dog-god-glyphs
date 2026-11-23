// AINUBIS CHAT v2 — vzhľad. Predloha 1:1: plany/nakresy/ainubis-chat-2026-11-23/index.html.
// Šat AINUBIS 3D (`components/pack/ainubis/3d/zaklad.ts`): mixiny `M3` a tlačidlá `.pk-b3.pk-b3--ai-*` sú tie z appky,
// nákresové `.ai3-*` triedy tu nahrádzajú selektory `.av2-*` s tým istým mixinom. Všetko visí na `html.papyrus3d`.
// Mimo `components/pack/`, takže `check:pack` ho nemeria; stupnice sú napriek tomu AINUBISOVE (radius 12/14/16/20, text 12–24).
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3 } from '@/components/pack/ainubis/3d/zaklad';

const P = 'html.papyrus3d';
const UI = `'Space Grotesk',sans-serif`;
const MUSEUM = `'LT Museum',serif`;
/** Šírka stĺpca histórie na PC a hranica PC/mobil (rovnaká ako `MOVE_MIN_WIDTH` widgetu a `PAGE_AIR`). */
export const AV2_PC_MIN = 768;
const PC = `@media (min-width:${AV2_PC_MIN}px)`;

export const AINUBIS_V2_CSS = `
${P} .av2{position:relative;display:flex;width:100%;height:100%;min-height:0;box-sizing:border-box;color:${A.ink};font-family:${UI};overflow:hidden;
  padding-bottom:var(--av2-bottom,0px);}
${P} .av2 *{box-sizing:border-box;}
${P} .av2 button{font-family:inherit;}
${P} .av2 .pk-b3{display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;padding:0;font-size:16px;flex:none;}
${P} .av2 .pk-b3[disabled]{opacity:.45;cursor:default;}
${P} .av2 .ico{width:28px;height:28px;object-fit:contain;flex:none;pointer-events:none;display:block;}
${P} .av2--away{visibility:hidden;}
/* šuplík (len keď je AINUBIS_FULL vypnuté): celá obrazovka na mobile, panel vpravo dole na PC */
${P} .av2--sheet{position:fixed;inset:0;z-index:60;height:100dvh;background:${A.surfaceBase};}
${PC}{${P} .av2--sheet{inset:auto 24px 24px auto;width:min(980px,calc(100vw - 48px));height:min(720px,calc(100dvh - 48px));border-radius:24px;border:3px solid var(--ai-edge);box-shadow:${A.panelShadow};}}
${P} .av2-veil{position:fixed;inset:0;z-index:59;${M3.scrim}}

/* ── História: stĺpec (PC) / šuplík zľava (mobil) ── */
${P} .av2-side{display:flex;flex-direction:column;gap:12px;min-height:0;background:var(--ai-sheet);border-right:3px solid var(--ai-edge);box-shadow:2px 0 0 var(--ai-out),0 0 30px -10px ${A.cyan};padding:16px;}
${P} .av2-side-top{display:flex;align-items:center;gap:8px;}
${P} .av2-side-top img{width:40px;height:40px;}
${P} .av2-name{font:400 24px ${MUSEUM};letter-spacing:.06em;color:${A.ink};}
${P} .av2-name b{font-weight:400;color:${A.cyan};text-shadow:0 0 14px ${A.cyan};}
${P} .av2-newc{height:52px;--b3-r:14px;width:100%;font-size:18px;}
${P} .av2-hist{flex:1 1 auto;overflow:auto;display:flex;flex-direction:column;gap:4px;min-height:0;}
${P} .av2-day{${M3.lab}margin:12px 0 4px;}
${P} .av2-hi{display:block;text-align:left;width:100%;border:0;background:none;color:${A.ink};font:500 14px/1.35 ${UI};padding:10px 12px;border-radius:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
${P} .av2-hi:hover{background:rgba(${A.cyanRGB},.10);}
${P} .av2-hi.on{background:rgba(${A.cyanRGB},.18);box-shadow:inset 0 0 0 1.5px ${A.edgeStrong};}
${P} .av2-note{font:500 14px/1.4 ${UI};color:${A.inkDim};padding:8px 4px;}
${P} .av2-side-foot{display:flex;align-items:center;gap:8px;padding-top:12px;border-top:1.5px solid var(--ai-edge);}
${P} .av2-side-foot button{height:44px;--b3-r:12px;padding:0 12px;font-size:14px;flex:1;}
${P} .av2-side-foot .ico{width:24px;height:24px;}
${P} .av2-scrim{position:absolute;inset:0;z-index:8;opacity:0;pointer-events:none;transition:opacity .2s;${M3.scrim}}
${P} .av2-scrim.on{opacity:1;pointer-events:auto;}
@media (max-width:${AV2_PC_MIN - 1}px){
  ${P} .av2-side{position:absolute;top:0;bottom:0;left:0;width:86%;max-width:340px;z-index:9;transform:translateX(-102%);transition:transform .22s ease;}
  ${P} .av2-side.on{transform:none;}
}
${PC}{${P} .av2-side{width:304px;flex:none;} ${P} .av2-scrim{display:none;}}

/* ── Rozhovor ── */
${P} .av2-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;position:relative;}
${P} .av2-top{display:flex;align-items:center;gap:8px;padding:8px 0;flex:none;}
${P} .av2-top .ttl{flex:1;min-width:0;text-align:center;font:400 20px ${MUSEUM};letter-spacing:.06em;color:${A.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
${P} .av2-top .ttl b{font-weight:400;color:${A.cyan};}
${P} .av2-round{width:48px;height:48px;--b3-r:50%;}
${P} .av2-round .ico{width:28px;height:28px;}
${P} .av2-top .only-pc{display:none;}
${PC}{${P} .av2-top .ttl{font:500 14px ${UI};letter-spacing:0;color:${A.inkDim};} ${P} .av2-top .only-mob{display:none;} ${P} .av2-top .only-pc{display:inline;}}
${P} .av2-back .thin{width:26px;height:26px;color:${A.ink};}
${P} .av2-feed{flex:1 1 auto;overflow:auto;padding:8px 0 16px;display:flex;flex-direction:column;min-height:0;overscroll-behavior:contain;}
${P} .av2-col{width:100%;max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:12px;}
${P} .av2-empty{margin:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:8px 0;}
${P} .av2-empty>img{width:112px;height:112px;filter:drop-shadow(0 6px 14px ${A.cyan});}
${P} .av2-h{${M3.h}}
${P} .av2-sugg{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:560px;}
${P} .av2-sugg button{height:44px;--b3-r:14px;padding:0 14px;font:500 14px ${UI};}
${P} .av2-sugg button .ico{width:24px;height:24px;}
${P} .av2-msg{padding:12px 14px;font:500 15px/1.45 ${UI};max-width:86%;overflow-wrap:anywhere;}
${P} .av2-me{${M3.bbMe}align-self:flex-end;}
${P} .av2-bbai{${M3.bbAi}}
${P} .av2-sysmsg{${M3.bbAi}border-color:${A.ctaA};align-self:flex-start;max-width:100%;}
${P} .av2-msg p{margin:0 0 8px;}${P} .av2-msg p:last-child{margin:0;}
${P} .av2-msg img.pic{display:block;max-width:100%;max-height:220px;border-radius:12px;margin:0 0 8px;}
${P} .av2-row{display:flex;gap:8px;align-items:flex-start;}
${P} .av2-row>img{width:32px;height:32px;flex:none;margin-top:4px;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .av2-ai{display:flex;flex-direction:column;gap:12px;flex:1;min-width:0;}
${P} .av2-ai .av2-msg{max-width:100%;}
${P} .av2-typing{font:500 12px ${UI};color:${A.cyan};padding:8px 0;align-self:center;}
${P} .av2-typing::after{content:'';display:inline-block;width:1.4em;text-align:left;animation:av2dots 1.2s steps(4,end) infinite;}
@keyframes av2dots{0%{content:'';}25%{content:'.';}50%{content:'..';}75%{content:'...';}}
${P} .av2-typing{animation:av2pulse 1.6s ease-in-out infinite;}
@keyframes av2pulse{50%{opacity:.55;}}
${P} .av2-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:${A.cyan};animation:av2bl 1s steps(2) infinite;}
@keyframes av2bl{50%{opacity:0}}
${P} .av2-lab{${M3.lab}}
${P} .av2-srcs{display:grid;grid-template-columns:1fr;gap:8px;}
${PC}{${P} .av2-srcs{grid-template-columns:1fr 1fr;}}
${P} .av2-src{display:flex;align-items:center;gap:12px;padding:10px 12px;cursor:pointer;text-align:left;color:${A.ink};border-radius:16px;min-width:0;font-family:${UI};}
${P} .av2-src.scroll,${P} .av2-src.web{${M3.card}}
${P} .av2-src.sos{border-radius:16px;border:3px solid #FF6A5B;background:var(--ai-card);box-shadow:0 0 0 2px var(--ai-out),0 6px 0 2px #7A2418,0 0 30px -12px #FF6A5B;}
${P} .av2-src img{width:40px;height:40px;flex:none;}
${P} .av2-src span{min-width:0;}
${P} .av2-src b{display:block;font:400 18px/1.15 ${MUSEUM};overflow-wrap:anywhere;}
${P} .av2-src small{display:block;font:500 12px/1.35 ${UI};color:${A.inkDim};}
${P} .av2-acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
${P} .av2-acts button{height:40px;--b3-r:12px;padding:0 12px;font:500 14px ${UI};}
${P} .av2-acts button.on{border-color:${A.cyan};box-shadow:inset 0 2px 0 rgba(${A.cyanRGB},.32),0 0 14px rgba(${A.cyanRGB},.45),0 6px 0 #020509;}
${P} .av2-acts .ico{width:22px;height:22px;}
${P} .av2-acts .flip{transform:scaleY(-1);}
${P} .av2-who{font:500 12px ${UI};color:${A.inkDim};margin-right:auto;order:9;}
${P} .av2-play{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:12px;background:var(--ai-fld);border:2px solid var(--ai-edge);}
${P} .av2-play .bar{flex:1;height:6px;border-radius:999px;background:rgba(${A.cyanRGB},.2);overflow:hidden;}
${P} .av2-play .bar i{display:block;height:100%;width:0;background:${A.cyan};box-shadow:0 0 8px ${A.cyan};transition:width .25s linear;}
${P} .av2-play small{font:500 12px ${UI};color:${A.inkDim};font-variant-numeric:tabular-nums;}
${P} .av2-play button{width:40px;height:40px;--b3-r:50%;}
${P} .av2-report{display:flex;flex-direction:column;gap:8px;}
${P} .av2-report textarea{${M3.field}min-height:72px;padding:10px 12px;resize:none;width:100%;outline:0;}
${P} .av2-report button{height:44px;--b3-r:12px;font-size:16px;padding:0 16px;align-self:flex-start;}
${P} .av2-thanks{font:500 12px ${UI};color:${A.ok};}
${P} .av2-disc{font:500 12px/1.45 ${UI};color:${A.inkDim};padding:8px 12px;border-radius:12px;border:1.5px solid ${A.ctaEdge};background:${A.ctaTint};}
${P} .av2-disc b{font-weight:600;color:${A.ctaA};}
${P} .av2-disc button{border:0;background:none;color:${A.ctaA};font:600 12px ${UI};text-decoration:underline;padding:0;cursor:pointer;}
${P} .av2-retry{align-self:flex-start;height:40px;--b3-r:12px;padding:0 14px;font:500 14px ${UI};}
/* hlasová správa človeka */
${P} .av2-vmsg{display:flex;align-items:center;gap:8px;margin:0 0 8px;}
${P} .av2-vmsg button{width:36px;height:36px;--b3-r:50%;}
${P} .av2-vmsg .ico{width:20px;height:20px;}
${P} .av2-vw{display:flex;align-items:center;gap:2px;height:24px;flex:1;min-width:90px;}
${P} .av2-vw i{flex:1;max-width:3px;border-radius:2px;background:#1C7C8C;}
${P} .av2-vmsg small{font:600 12px ${UI};font-variant-numeric:tabular-nums;}

/* ── Riadok na písanie ── */
${P} .av2-comp{position:relative;flex:none;padding:8px 0 0;}
${PC}{${P} .av2-comp{width:100%;max-width:792px;margin:0 auto;}}
${P} .av2-cbox{display:flex;flex-direction:column;gap:8px;padding:12px 12px 10px;border-radius:20px;border:2.5px solid var(--ai-edge);background:var(--ai-fld);box-shadow:var(--ai-inset),0 0 0 2px var(--ai-out);}
${P} .av2-cbox:focus-within{border-color:${A.ctaA};box-shadow:var(--ai-inset),0 0 18px rgba(${A.ctaRGB},.25);}
${P} .av2-cbox textarea{width:100%;min-height:56px;max-height:160px;resize:none;border:0;outline:0;background:none;color:${A.ink};font:500 16px/1.4 ${UI};padding:4px 6px;}
${P} .av2-cbox textarea::placeholder{color:${A.inkDim};opacity:.7;}
${P} .av2-opts{display:flex;align-items:center;gap:8px;}
${P} .av2-opts .sp{flex:1;}
${P} .av2-o44{width:44px;height:44px;--b3-r:14px;}
${P} .av2-o44 .ico{width:26px;height:26px;}
${P} .av2-mode{height:44px;--b3-r:14px;padding:0 12px 0 6px;font:500 14px ${UI};min-width:0;max-width:170px;}
${P} .av2-mode.mdl{padding:0 12px;max-width:120px;}
${P} .av2-mode img.av{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid ${A.cyan};}
${P} .av2-mode span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
${P} .av2-mode .pre{display:none;font-style:normal;}
${PC}{${P} .av2-mode .pre{display:inline;}}
@media (max-width:${AV2_PC_MIN - 1}px){${P} .av2-opts{gap:6px;} ${P} .av2-mode{max-width:112px;} ${P} .av2-mode.mdl{max-width:96px;}}
${P} .av2-send{width:48px;height:44px;--b3-r:14px;}
${P} .av2-att{display:flex;align-items:center;gap:8px;padding:2px 2px 0;}
${P} .av2-att button{width:36px;height:36px;--b3-r:50%;}
${P} .av2-att .ico{width:20px;height:20px;}
${P} .av2-shot{display:inline-flex;align-items:center;justify-content:center;width:64px;height:84px;border-radius:10px;border:2px solid ${A.cyan};overflow:hidden;background:var(--ai-fld);box-shadow:0 0 10px rgba(${A.cyanRGB},.4);}
${P} .av2-shot img{width:100%;height:100%;object-fit:cover;}
${P} .av2-rec{display:flex;align-items:center;gap:12px;min-height:56px;padding:4px 6px;}
${P} .av2-rec .dot{width:12px;height:12px;border-radius:50%;background:#FF6A5B;box-shadow:0 0 10px #FF6A5B;animation:av2bl 1s infinite;}
${P} .av2-wave{flex:1;display:flex;align-items:center;gap:3px;height:36px;overflow:hidden;}
${P} .av2-wave i{flex:1;max-width:4px;border-radius:2px;background:${A.cyan};animation:av2wv .9s ease-in-out infinite;}
@keyframes av2wv{0%,100%{height:15%}50%{height:90%}}
${P} .av2-rec small{font:500 14px ${UI};color:${A.inkDim};font-variant-numeric:tabular-nums;}
${P} .av2-hint{font:500 12px ${UI};color:${A.inkDim};text-align:center;margin-top:6px;}
${P} .av2-err{font:500 12px/1.4 ${UI};color:${A.danger};text-align:center;margin-top:6px;}
/* pás pod riadkom: pečať + hodnosť + progres kreditov */
${P} .av2-strip{display:flex;align-items:center;gap:8px;width:100%;margin-top:8px;padding:4px 6px;border:0;background:none;color:${A.inkDim};font:500 12px ${UI};cursor:pointer;}
${P} .av2-strip .seal{width:22px;height:22px;flex:none;display:inline-flex;}
${P} .av2-strip .qm{white-space:nowrap;}
${P} .av2-qbar{flex:1;height:6px;border-radius:999px;background:rgba(${A.cyanRGB},.18);overflow:hidden;}
${P} .av2-qbar i{display:block;height:100%;background:${A.cyan};box-shadow:0 0 8px ${A.cyan};}
${P} .av2-qbar.big{height:10px;width:100%;flex:none;}
${P} .av2-qn{font-variant-numeric:tabular-nums;white-space:nowrap;}
/* ponuky nad riadkom */
${P} .av2-pop{position:absolute;left:0;bottom:calc(100% - 4px);width:300px;max-width:100%;padding:8px;display:flex;flex-direction:column;gap:4px;z-index:5;${M3.bub}}
${P} .av2-pop.r{left:56px;}
${P} .av2-pop.r2{left:auto;right:0;}
${P} .av2-pop button.it{display:flex;align-items:center;gap:12px;border:0;background:none;color:${A.ink};font:500 16px ${UI};padding:10px;border-radius:12px;cursor:pointer;text-align:left;}
${P} .av2-pop button.it:hover{background:rgba(${A.cyanRGB},.12);}
${P} .av2-pop button.it.on{background:rgba(${A.cyanRGB},.20);box-shadow:inset 0 0 0 1.5px ${A.cyan};}
${P} .av2-pop button.it[disabled]{opacity:.5;cursor:default;}
${P} .av2-pop .av{width:32px;height:32px;border-radius:50%;object-fit:cover;flex:none;}
${P} .av2-pop .lock{width:20px;height:20px;margin-left:auto;flex:none;}
${P} .av2-pop .ico{width:28px;height:28px;}
${P} .av2-pop .note{padding:8px 10px 4px;font:500 12px/1.4 ${UI};color:${A.inkDim};}
${P} .av2-pop .lab2{${M3.lab}padding:6px 10px 2px;}
${P} .av2-pop .mn{display:flex;flex-direction:column;gap:2px;}
${P} .av2-pop .mn b{font:400 18px ${MUSEUM};}
${P} .av2-pop .mn small{font:500 12px/1.35 ${UI};color:${A.inkDim};}

/* ── Panel Tvoja hodnosť + súhlas (panel zdola, na PC karta vpravo dole) ── */
${P} .av2-sheet{position:absolute;left:0;right:0;bottom:0;max-height:92%;overflow:auto;z-index:12;padding:12px 16px 24px;display:flex;flex-direction:column;gap:12px;${M3.sheet}}
${PC}{${P} .av2-sheet{left:auto;right:24px;bottom:24px;width:440px;max-height:calc(100% - 48px);border-radius:24px;border:3px solid var(--ai-edge);}}
${P} .av2-grab{width:44px;height:5px;border-radius:999px;margin:0 auto;flex:none;${M3.grab}}
${P} .av2-hold{${M3.card}display:flex;align-items:center;gap:12px;padding:12px 14px;position:relative;}
${P} .av2-hold .seal{width:52px;height:52px;flex:none;display:inline-flex;}
${P} .av2-hold .mtx{flex:1;min-width:0;}
${P} .av2-hxs{${M3.hXs}}
${P} .av2-hold small{display:block;font:500 14px/1.4 ${UI};color:${A.inkDim};margin-top:4px;}
${P} .av2-hold small b{color:${A.cyan};font-weight:600;}
${P} .av2-info{width:40px;height:40px;--b3-r:50%;flex:none;align-self:flex-start;}
${P} .av2-ii{display:block;width:22px;height:22px;background:${A.ink};-webkit-mask:var(--av2-ii) center/contain no-repeat;mask:var(--av2-ii) center/contain no-repeat;}
${P} .av2-sheet{--av2-ii:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='M12 11v6'/%3E%3Ccircle cx='12' cy='7.6' r='.6' fill='black'/%3E%3C/svg%3E");
  --av2-chev:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9.5 L12 15.5 L18 9.5'/%3E%3C/svg%3E");}
${P} .av2-infobox{${M3.box}padding:12px;display:flex;flex-direction:column;gap:10px;font:500 13px/1.45 ${UI};}
${P} .av2-infobox p{margin:0;color:${A.ink};}
${P} .av2-mrow{display:grid;grid-template-columns:84px 1fr;gap:10px;align-items:start;}
${P} .av2-mrow small{font:500 12px/1.45 ${UI};color:${A.inkDim};}
${P} .av2-mrow.cur small{color:${A.ink};}
${P} .av2-mchip{justify-self:start;font:600 11px ${UI};padding:2px 8px;border-radius:999px;border:1.5px solid var(--ai-edge);color:${A.inkDim};white-space:nowrap;}
${P} .av2-mchip.so{color:${A.cyan};border-color:${A.cyan};}
${P} .av2-mchip.op{color:#2a1608;background:linear-gradient(180deg,#FFD65A,#E69E1A);border-color:#2a1608;}
${P} .av2-mdesc{font:500 14px/1.45 ${UI};color:${A.inkDim};}
${P} .av2-row2{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
${P} .av2-row2 .av2-lab{flex:0 0 100%;}
${P} .av2-row2.col{flex-direction:column;align-items:stretch;gap:6px;}
${P} .av2-row2 small{font:500 12px ${UI};color:${A.inkDim};}
${P} .av2-lim{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
${P} .av2-lim .av2-lab{flex:none;}
${P} .av2-lim b{font:600 14px ${UI};font-variant-numeric:tabular-nums;}
${P} .av2-dots{display:inline-flex;gap:5px;}
${P} .av2-dots i{width:10px;height:10px;border-radius:50%;border:1.5px solid ${A.cyan};opacity:.5;}
${P} .av2-dots i.on{background:${A.cyan};opacity:1;box-shadow:0 0 6px ${A.cyan};}
${P} .av2-el{font:500 12px ${UI};color:${A.cyan};}
${P} .av2-costs{display:flex;gap:6px;flex-wrap:wrap;}
${P} .av2-warn{padding:10px 12px;border:1.5px solid ${A.ctaEdge};border-radius:12px;background:${A.ctaTint};font:500 12px/1.45 ${UI};color:${A.ctaA};}
${P} .av2-drop{display:flex;align-items:center;justify-content:space-between;width:100%;border:0;background:none;padding:6px 0;cursor:pointer;border-top:1.5px solid rgba(${A.cyanRGB},.16);}
${P} .av2-drop .chev{display:block;width:22px;height:22px;transition:transform .2s;background:${A.cyan};-webkit-mask:var(--av2-chev) center/contain no-repeat;mask:var(--av2-chev) center/contain no-repeat;}
${P} .av2-drop.on .chev{transform:rotate(180deg);}
${P} .av2-ladder{display:flex;flex-direction:column;gap:6px;}
${P} .av2-rung{display:grid;grid-template-columns:30px 1fr auto 44px;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;border:1.5px solid rgba(${A.cyanRGB},.16);}
${P} .av2-rung .seal{width:30px;height:30px;display:inline-flex;}
${P} .av2-rung.cur{border-color:${A.cyan};background:rgba(${A.cyanRGB},.12);}
${P} .av2-rn b{display:block;font:400 16px ${MUSEUM};}
${P} .av2-rn small,${P} .av2-rl small{font:500 11px ${UI};color:${A.inkDim};}
${P} .av2-rm{display:flex;flex-direction:column;align-items:flex-end;gap:5px;}
${P} .av2-rung .av2-dots i{width:7px;height:7px;}
${P} .av2-rl{text-align:right;}
${P} .av2-rl b{display:block;font:600 16px ${UI};font-variant-numeric:tabular-nums;}
${P} .av2-up{min-height:52px;--b3-r:16px;font-size:18px;padding:0 16px;}
${P} .av2-consent{display:flex;flex-direction:column;gap:12px;}
${P} .av2-consent p{margin:0;font:500 14px/1.5 ${UI};color:${A.inkDim};}
${P} .av2-consent .btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
${P} .av2-consent button{min-height:52px;--b3-r:16px;font-size:18px;padding:0 12px;}
${P} .av2-dim{position:absolute;inset:0;z-index:11;${M3.scrim}}
`;
