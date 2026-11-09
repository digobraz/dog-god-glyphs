// ŠAT AINUBIS 3D — panely a bubliny na mape a pri výletoch (hárok plany/nakresy/ainubis-3d-2026-11-09, základ `zaklad.ts`). Len pod APP_NEW.
// Skupina „Mapa a výlety": bublina nad mapou (`.bub`), panel zdola (`.sheet`), kroky TRIPWISH (STEP/ASK/WCH), nahlásenie, magistrála.
// Povrch sa nekreslí nanovo, preberá existujúce triedy: `.ain-bubble`, `.mcoach-*`, `.ang-*`, `.msg-mod*` (spoločný panel AINUBISA),
// `.ws-*` + `.aw-*` (TRIPWISH), `.gjn-*` (magistrála), `.atl-abort--ainubis` (otázka pri kreslení). Papyrusové okolie ostáva papyrusové.
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3 } from './zaklad';

const CY = A.cyanRGB;
/** Tvár AINUBISA bez kruhu (hárok: logo 48 až 52 px s tieňom). */
const LOGO = (px: number) => `width:${px}px;height:${px}px;flex:none;object-fit:contain;border-radius:0;background:none;box-shadow:none;filter:drop-shadow(0 3px 2px var(--ai-sh));`;
/** Meno v bubline a paneli: písmo šatu, bez verzálok. */
const MENO = (px: number) => `font:400 ${px}px/1.1 'LT Museum',serif;letter-spacing:.06em;text-transform:none;color:${A.ink};`;
const TEXT = `font:500 14px/1.45 'Space Grotesk',sans-serif;color:${A.inkDim};`;
/** Tlačidlo, ktoré prebíja inline štýl (druhé tlačidlo bubliny nesie vlastný `style`). */
const imp = (css: string) => css.replace(/;/g, ' !important;');
const HOVER_OR = `linear-gradient(180deg,#FFD65A,${A.ctaB})`;

export const AI3D_MAPA_CSS = `
/* ── Spoločný panel AINUBISA (nahlásenie, Zrušiť podujatie, Mám záujem, správy): hárok .sheet + who + opt + fld + xl ── */
html.papyrus3d .msg-modsheet{${M3.scrim}}
html.papyrus3d .msg-modpanel{${M3.sheet}max-width:460px;display:flex;flex-direction:column;gap:12px;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 24px);--pk-grab:var(--ai-edge);}
html.papyrus3d .msg-modpanel>*{margin-top:0 !important;margin-bottom:0 !important;}
html.papyrus3d .msg-modtop{align-self:stretch;display:flex;justify-content:center;padding:0 0 4px;touch-action:none;}
@media(min-width:600px){
  html.papyrus3d .msg-modpanel{border:3px solid var(--ai-edge);border-radius:24px;box-shadow:0 0 0 2px var(--ai-out),0 12px 30px rgba(${CY},.28);padding:24px;}
  html.papyrus3d .msg-modtop{display:none;}
}
html.papyrus3d .msg-modwho{display:flex;align-items:center;gap:10px;}
html.papyrus3d .msg-modface{${LOGO(48)}}
html.papyrus3d .msg-modwho b{${MENO(20)}}
html.papyrus3d .msg-modtitle{${M3.hSm}}
html.papyrus3d .msg-modsub{${TEXT}}
html.papyrus3d .msg-modrow{gap:12px;}
${b3('html.papyrus3d .msg-modbtn', 'nt')}
html.papyrus3d .msg-modbtn{width:100%;min-height:56px;display:flex;align-items:center;justify-content:flex-start;gap:12px;padding:12px 14px;text-align:left;font:500 16px/1.3 'Space Grotesk',sans-serif;color:${A.ink};}
html.papyrus3d .msg-modbtn::after{content:'';margin-left:auto;flex:none;width:24px;height:24px;border-radius:50%;border:2.5px solid var(--ai-edge);}
html.papyrus3d .msg-modbtn.on{background:linear-gradient(180deg,#123C4C,#0B2733);border-color:${A.cyan};color:${A.ink};box-shadow:inset 0 0 0 1px rgba(${CY},.45),0 4px 0 var(--ai-lip);}
html.papyrus3d .msg-modbtn.on::after{background:${A.cyan};border-color:#04121A;box-shadow:0 0 10px ${A.cyan};}
${b3('html.papyrus3d .msg-modbtn.msg-modbtn--danger', 'rd')}
html.papyrus3d .msg-modbtn.msg-modbtn--danger{color:#2A0805;}
html.papyrus3d .msg-modbtn.msg-modbtn--danger::after{display:none;}
html.papyrus3d .msg-modnote{${M3.field}width:100%;min-height:104px;padding:12px 16px;resize:none;}
html.papyrus3d .msg-modnote::placeholder{color:${A.inkFaint};}
html.papyrus3d .msg-modnote:focus{border-color:${A.cyan};box-shadow:var(--ai-inset),0 0 0 3px rgba(${CY},.2);}
${b3('html.papyrus3d .msg-modsend', 'or')}
html.papyrus3d .msg-modsend{width:100%;min-height:58px;padding:8px 16px;font-size:20px;line-height:1.1;overflow-wrap:anywhere;}
html.papyrus3d .msg-modsend:hover:not(:disabled){background:${HOVER_OR};}
html.papyrus3d .msg-modsend:disabled{opacity:.5;filter:grayscale(.5);cursor:default;}
html.papyrus3d .msg-modcancel{width:100%;min-height:44px;margin:0;padding:12px;font:500 12px/1.4 'Space Grotesk',sans-serif;color:${A.inkFaint};}
/* Zrušiť podujatie: ničivé a neutrálne vedľa seba (hárok g2) */
html.papyrus3d .msg-modg2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
html.papyrus3d .msg-modg2>*{margin:0;}
${b3('html.papyrus3d .msg-modsend.msg-modsend--rd', 'rd')}
html.papyrus3d .msg-modsend.msg-modsend--rd:hover:not(:disabled){background:linear-gradient(180deg,#FF9C8C,#D4503E);}
${b3('html.papyrus3d .msg-modg2 .msg-modcancel.msg-modcancel--nt', 'nt')}
html.papyrus3d .msg-modg2 .msg-modcancel.msg-modcancel--nt{min-height:58px;padding:8px 12px;font-size:20px;line-height:1.1;overflow-wrap:anywhere;color:${A.ink};}
html.papyrus3d .msg-modg2 .msg-modcancel.msg-modcancel--nt:hover{color:${A.ink};}

/* ── Bublina AINUBISA v mieste (hárok .bub): logo bez kruhu 52 px, meno, text, oranžová akcia ── */
html.papyrus3d .ain-bubble{${M3.bub}gap:10px;padding:12px;${TEXT}}
html.papyrus3d .ain-bubble>div{min-width:0;flex:1;}
html.papyrus3d .ain-bubble img{${LOGO(52)}}
html.papyrus3d .ain-face-btn{width:52px;height:52px;border-radius:0;}
html.papyrus3d .ain-bubble b{${MENO(16)}margin-bottom:4px;}
${b3('html.papyrus3d .ain-bubble .ain-cta', 'or', '12px')}
html.papyrus3d .ain-bubble .ain-cta{margin-top:12px;min-height:44px;padding:0 16px;font-size:16px;}
${imp(b3('html.papyrus3d .ain-bubble .ain-cta+.ain-cta', 'nt', '12px'))}

/* ── Tip po zápise (MapCoach): tá istá bublina, papyrusový závoj okolo ostáva ── */
html.papyrus3d .mcoach-bubble{${M3.bub}padding:12px;gap:10px;}
html.papyrus3d .mcoach-face{${LOGO(52)}}
html.papyrus3d .mcoach-txt b{${MENO(16)}margin-bottom:4px;}
html.papyrus3d .mcoach-txt p{${TEXT}margin:0;}
html.papyrus3d .mcoach-mute{min-height:44px;padding:0 8px 0 0;border-bottom:0;font:500 12px/1.4 'Space Grotesk',sans-serif;color:${A.inkFaint};}
${b3('html.papyrus3d .mcoach-ok', 'or', '14px', 4)}
html.papyrus3d .mcoach-ok{min-height:44px;padding:0 14px;font-size:16px;}
html.papyrus3d .mcoach-ok:hover{background:${HOVER_OR};}

/* ── Sprievodca nad mapou (kreslenie, značka, známka výletu): bublina hárku, bez tmavého závoja ── */
html.papyrus3d .ang-wrap{background:none;}
html.papyrus3d .ang-bar{${M3.bub}padding:12px;gap:10px;animation:none;backdrop-filter:none;}
html.papyrus3d .ang-face{${LOGO(52)}}
html.papyrus3d .ang-text{${TEXT}}

/* ── Magistrála na prevzatie: logo + meno v boxe, oranžové CTA pod ním ── */
html.papyrus3d .gjn{${M3.card}padding:12px;margin:12px 0;gap:12px;align-items:flex-start;}
html.papyrus3d .gjn-face{width:48px;height:48px;border-radius:0;background:none;box-shadow:none;overflow:visible;}
html.papyrus3d .gjn-face img{height:100%;width:100%;object-fit:contain;filter:drop-shadow(0 3px 2px var(--ai-sh));}
html.papyrus3d .gjn-txt{${TEXT}margin:0;flex:1 1 0;}
html.papyrus3d .gjn-ai{display:block;margin-bottom:4px;font:600 12px 'Space Grotesk',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${A.ink};}
${b3('html.papyrus3d .gjn-cta', 'or')}
html.papyrus3d .gjn-cta{flex:1 1 100%;min-height:58px;padding:8px 16px;font-size:20px;line-height:1.1;}
html.papyrus3d .gjn-cta:hover{background:${HOVER_OR};}

/* ── Otázka pri kreslení (cudzia trasa, nešiel si naspäť, krátka trasa): karta AINUBISA, oranžová a neutrálna odpoveď ── */
html.papyrus3d .atl-abort--ainubis{${M3.card}padding:24px;max-width:520px;}
html.papyrus3d .atl-abort--ainubis .atl-abort-face{${LOGO(52)}margin:0 auto 12px;display:block;}
html.papyrus3d .atl-abort--ainubis h2{${M3.hXs}text-shadow:none;}
html.papyrus3d .atl-abort--ainubis p{${TEXT}margin:12px 0 0;}
${b3('html.papyrus3d .atl-abort--ainubis .atl-abort-cta', 'or')}
${b3('html.papyrus3d .atl-abort--ainubis .atl-abort-ghost', 'nt')}
html.papyrus3d .atl-abort--ainubis .atl-abort-cta,html.papyrus3d .atl-abort--ainubis .atl-abort-ghost{min-height:56px;padding:8px 16px;font-size:16px;line-height:1.15;overflow-wrap:anywhere;}
html.papyrus3d .atl-abort--ainubis .atl-abort-cta:hover{filter:none;}

/* ── TRIPWISH kroky a otázky (hárok STEP / ASK / WCH): meno, otázka v boxe s lištou, chipy, tlačidlá ── */
html.papyrus3d .ws-deck{${M3.card}gap:12px;padding:16px;}
html.papyrus3d .ws-head{justify-content:space-between;align-items:flex-start;}
html.papyrus3d .ws-x{width:44px;height:44px;margin:-8px -8px 0 0;color:${A.inkDim};}
html.papyrus3d .ws-ask{${M3.box}position:relative;padding:14px 14px 14px 28px;}
html.papyrus3d .ws-ask::before{content:'';position:absolute;left:14px;top:16px;bottom:16px;width:3px;border-radius:999px;background:linear-gradient(180deg,${A.cyan},rgba(${CY},.05));box-shadow:0 0 12px rgba(${CY},.6);}
html.papyrus3d .ws-ask .ws-text{font:500 16px/1.5 'Space Grotesk',sans-serif;color:${A.ink};}
html.papyrus3d .ws-caret{background:${A.cyan};}
html.papyrus3d .ws-pale{padding:0;gap:12px;color:${A.ink};}
${b3('html.papyrus3d .ws-deck .aw-chip', 'nt', '14px', 4)}
html.papyrus3d .ws-deck .aw-chip{min-height:44px;padding:8px 14px;font-size:16px;line-height:1.1;}
${b3('html.papyrus3d .ws-deck .aw-chip.on', 'cy', '14px', 4)}
html.papyrus3d .ws-deck .aw-chips{gap:10px;padding-bottom:4px;}
${b3('html.papyrus3d .ws-deck .aw-cta', 'or')}
html.papyrus3d .ws-deck .aw-cta{min-height:58px;padding:8px 16px;font-size:20px;line-height:1.1;}
html.papyrus3d .ws-deck .aw-cta:hover{background:${HOVER_OR};}
${b3('html.papyrus3d .ws-deck .aw-ghost', 'nt')}
html.papyrus3d .ws-deck .aw-ghost{min-height:58px;padding:8px 12px;font-size:16px;line-height:1.1;overflow-wrap:anywhere;}
html.papyrus3d .ws-deck .aw-ghost:hover{color:${A.ink};}
html.papyrus3d .ws-deck .aw-row{gap:12px;}
html.papyrus3d .ws-deck .aw-col{gap:12px;}
html.papyrus3d .ws-deck .aw-input{${M3.field}padding:12px 16px;width:100%;box-sizing:border-box;}
html.papyrus3d .ws-deck .aw-input::placeholder{color:${A.inkFaint};}
html.papyrus3d .ws-deck .aw-tag{border:2px solid var(--ai-edge);border-radius:999px;background:var(--ai-fld);color:${A.ink};font:500 12px 'Space Grotesk',sans-serif;padding:4px 12px;}
html.papyrus3d .ws-deck .aw-back{width:44px;height:44px;border:2.5px solid var(--ai-edge);color:${A.ink};}
html.papyrus3d .ws-deck .aw-sub{${TEXT}}
html.papyrus3d .ws-deck .aw-pts{border:2px solid ${A.cyan};background:var(--ai-fld);color:${A.cyan};}
html.papyrus3d .ws-deck .aw-err{color:${A.danger};}
`;
