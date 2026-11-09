// Vzhľad kvízov DOG ID podľa nákresu: jednoliaty papyrus, jemný výjav v pozadí, odpovede hore, nič sa nenaťahuje.
import { PACK_THEME as T, FONT_TITLE, FONT_UI, PAPER_BG, PACK_R as R, PACK_SPACE as S, PACK_TEXT as X, PACK_COL_INNER } from '@/components/pack/packTheme';
import { LAPIS, LAPIS_BTN_SHADOW, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { AINUBIS } from '@/components/pack/ainubisSkin';
import { FONT_EMOJI } from '@/components/pack/mapnotes/markEmoji';

const PICK = pickTintCSS(LAPIS.edge, PICK_INK.lapis);
const WHITE = '#fff';

export const FLOW_CSS = `
.dfl{position:fixed;inset:0;overflow:hidden;overscroll-behavior:none;background:${PAPER_BG};color:${T.ink};container-type:size;font-family:${FONT_UI};}
:where(.dfl) :where(button,input,textarea){font-family:inherit;color:inherit;}
:where(.dfl) :where(button){cursor:pointer;}
.dfl-sc{position:absolute;inset:0;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + ${S.md}px) ${S.lg}px calc(env(safe-area-inset-bottom,0px) + ${S.lg}px);overflow:hidden;}
.dfl-sc>*:not(.dfl-art){position:relative;z-index:1;}
.dfl-art{position:absolute;left:0;right:0;bottom:0;height:64cqh;background-size:cover;background-position:center bottom;opacity:.11;filter:sepia(.55) saturate(.75);mix-blend-mode:multiply;-webkit-mask-image:linear-gradient(180deg,transparent 0%,black 42%);mask-image:linear-gradient(180deg,transparent 0%,black 42%);z-index:0;pointer-events:none;}
.dfl-top{display:flex;align-items:center;gap:${S.sm}px;min-height:40px;}
.dfl-sec{margin-left:auto;font-weight:500;font-size:${X.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkStrong};background:${T.card};border:1px solid ${T.cardEdge};border-radius:${R.pill}px;padding:${S.sm}px ${S.md}px;white-space:nowrap;}
.dfl-em{font-family:${FONT_EMOJI};filter:drop-shadow(0 0 .5px rgba(58,34,8,.95)) drop-shadow(0 0 .5px rgba(58,34,8,.55));} /* obrys: bledé emoji (sneh, kosť, stetoskop, ❓) na papyruse nezanikajú — Matej 9. 11. 2026 */
.dfl-lq{height:12px;background:${T.hairline};}
.dfl-lq.sm{height:8px;}
.dfl-lq .pk-progress__fill{position:relative;min-width:12px;background:${LAPIS.grad};overflow:hidden;}
.dfl-lq .pk-progress__fill::after{content:'';position:absolute;top:0;bottom:0;width:48px;left:-48px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:dflsh 3.2s ease-in-out infinite;}
.dfl-lq s{position:absolute;top:2px;bottom:2px;width:2px;background:${T.cardEdge};opacity:.7;}
@keyframes dflsh{to{left:100%;}}
@media (prefers-reduced-motion:reduce){.dfl-lq .pk-progress__fill::after{animation:none;opacity:0;}}
.dfl-prog{margin-top:${S.sm}px;}
.dfl-progl{display:flex;justify-content:space-between;font-weight:500;font-size:${X.label}px;color:${T.inkStrong};margin-bottom:${S.xs}px;font-variant-numeric:tabular-nums;}
.dfl-dogs{display:flex;gap:${S.sm}px;margin-top:${S.sm}px;overflow-x:auto;scrollbar-width:none;}
.dfl-dog{flex:none;display:flex;align-items:center;gap:${S.xs}px;border:1px solid ${T.border};border-radius:${R.pill}px;padding:${S.xs}px ${S.md}px ${S.xs}px ${S.xs}px;font-size:${X.label}px;font-weight:600;background:transparent;white-space:nowrap;}
.dfl-dog.on{${PICK}}
.dfl-dog i{width:24px;height:24px;border-radius:${R.pill}px;background:${T.cardEdge} center/cover;display:block;}
.dfl-q{font:700 ${X.h1}px/1.2 ${FONT_TITLE};color:${T.inkStrong};letter-spacing:.02em;margin:${S.lg}px 0 0;text-wrap:balance;} /* písmo: nadpis */
.dfl-s{font-size:${X.body}px;line-height:1.4;color:${T.inkWarm};margin:${S.sm}px 0 0;}
.dfl-main{flex:0 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;margin-top:${S.lg}px;padding:0;-webkit-overflow-scrolling:touch;}
.dfl-ans{display:grid;gap:${S.sm}px;}
.dfl-a{display:flex;align-items:center;gap:${S.md}px;width:100%;text-align:left;border:1px solid ${T.border};border-radius:${R.tile}px;background:${T.card};padding:${S.md}px;min-height:48px;transition:transform .12s;}
.dfl-a:active{transform:scale(.985);}
.dfl-a .dfl-em{font-size:${X.h2}px;line-height:1;width:24px;text-align:center;flex:none;}
.dfl-a .tx{flex:1;min-width:0;font-weight:500;font-size:${X.lead}px;line-height:1.25;color:${T.inkStrong};}
.dfl-a small{display:block;font-weight:400;font-size:${X.label}px;line-height:1.3;color:${T.inkWarm};margin-top:${S.xs}px;}
.dfl-a .dot{width:20px;height:20px;border-radius:${R.pill}px;border:1.5px solid ${T.cardEdge};flex:none;display:grid;place-items:center;}
.dfl-a.on{${PICK}}
.dfl-a.on .tx{color:${PICK_INK.lapis};}
.dfl-a.on .dot{background:${LAPIS.grad};border-color:${LAPIS.edge};}
.dfl-a.on .dot::after{content:'';width:8px;height:4px;border-left:2px solid ${WHITE};border-bottom:2px solid ${WHITE};transform:rotate(-45deg) translate(1px,-1px);}
.dfl-a.none{background:transparent;border-style:dashed;}
.dfl-a.none .tx{font-weight:400;color:${T.inkWarm};}
.dfl-rv{grid-column:1/-1;flex:0 0 100%;min-width:0;display:flex;flex-direction:column;gap:${S.sm}px;margin-left:${S.md}px;padding:${S.xs}px 0 ${S.xs}px ${S.md}px;border-left:2px solid ${LAPIS.edge};}
.dfl-chips>.dfl-rv{flex-basis:calc(100% - ${S.md}px);}
.dfl-rv .dfl-c.small{min-height:40px;padding:${S.sm}px ${S.md}px;font-size:${X.body}px;}
.dfl-sizes{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
.dfl-sz{height:clamp(136px,21cqh,184px);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:${S.xs}px;border:1px solid ${T.border};border-radius:${R.tile}px;background:${T.card};padding:${S.sm}px;overflow:hidden;}
.dfl-sz .pic{flex:1;min-height:0;width:100%;position:relative;}
.dfl-sz img{position:absolute;left:0;right:0;bottom:0;width:100%;object-fit:contain;object-position:bottom;}
.dfl-sz b{font:700 ${X.h2}px/1 ${FONT_TITLE};color:${T.inkStrong};} /* písmo: nadpis */
.dfl-sz em{font-weight:500;font-size:${X.body}px;font-style:normal;color:${T.inkStrong};}
.dfl-sz small{font-size:${X.label}px;color:${T.inkWarm};text-align:center;}
.dfl-sz.on{${PICK}}
.dfl-chips{display:flex;flex-wrap:wrap;gap:${S.sm}px;align-content:flex-start;}
.dfl-c{flex:0 1 auto;min-height:40px;border:1.5px solid ${T.border};border-radius:${R.pill}px;background:${T.card};padding:${S.sm}px ${S.md}px;font-weight:500;font-size:${X.body}px;line-height:1.15;color:${T.inkStrong};text-align:center;}
.dfl-c.small{min-height:32px;padding:${S.xs}px ${S.sm}px;font-size:${X.label}px;}
.dfl-c.on{${PICK}}
.dfl-c.none{background:transparent;border-style:dashed;color:${T.inkWarm};}
.dfl-c:disabled{opacity:.45;cursor:not-allowed;}
.dfl-count{font-weight:500;font-size:${X.label}px;color:${T.inkWarm};margin-top:${S.sm}px;}
.dfl-add{display:flex;gap:${S.sm}px;margin-top:${S.sm}px;}
.dfl-add input{flex:1;min-width:0;}
.dfl-add button{border:1px solid ${LAPIS.edge};color:${PICK_INK.lapis};background:rgba(22,48,122,.16);border-radius:${R.field}px;padding:${S.sm}px ${S.md}px;font-weight:600;font-size:${X.label}px;}
.dfl-in{width:100%;min-height:44px;border:1px solid ${T.cardEdge};border-radius:${R.field}px;background:${T.card};padding:${S.sm}px ${S.md}px;font-size:${X.lead}px;line-height:1.4;color-scheme:light;display:block;resize:none;}
.dfl-in:focus{outline:2px solid ${LAPIS.edge};outline-offset:1px;}
textarea.dfl-in{min-height:64px;}
/* iPhone dáva dátumu vlastnú šírku a riadok sa dal ťahať do strán. */
.dfl-in[type=date]{-webkit-appearance:none;appearance:none;min-width:0;max-width:100%;}
.dfl-flds label{display:block;min-width:0;}
.dfl-in.big{font-weight:500;font-size:${X.h1}px;text-align:center;}
.dfl-mx{display:grid;gap:${S.sm}px;}
.dfl-mr{display:flex;flex-direction:column;justify-content:center;gap:${S.sm}px;border:1px solid ${T.border};border-radius:${R.tile}px;background:${T.card};padding:${S.sm}px ${S.md}px;}
.dfl-mr b{font-weight:500;font-size:${X.body}px;line-height:1.2;color:${T.inkStrong};}
.dfl-mo{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:${S.xs}px;}
.dfl-mo button{border:1px solid ${T.border};border-radius:${R.pill}px;background:transparent;padding:${S.sm}px ${S.xs}px;font-weight:500;font-size:${X.label}px;line-height:1;color:${T.inkStrong};}
.dfl-mo button.on{${PICK}}
.dfl-mo button.on.green{${pickTintCSS(T.growGreen, PICK_INK.green)}}
.dfl-mo button.on.amber{${pickTintCSS(T.accentGold, T.inkStrong)}}
.dfl-mo button.on.red{${pickTintCSS(T.alertRed, PICK_INK.red)}}
.dfl-flds{display:flex;flex-direction:column;gap:${S.md}px;}
.dfl-lab{display:block;font-weight:500;font-size:${X.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};margin-bottom:${S.xs}px;}
.dfl-tip{display:flex;align-items:center;gap:${S.sm}px;width:100%;text-align:left;margin-top:${S.sm}px;min-height:48px;border:1px solid ${AINUBIS.edgeStrong};border-radius:${R.tile}px;background:${AINUBIS.surface};padding:${S.sm}px ${S.md}px;color:#fff;}
.dfl-tip .who{flex:none;font:700 ${X.micro}px/1.4 ${FONT_TITLE};letter-spacing:.14em;color:#fff;} /* písmo: meno */
.dfl-tip .who span{color:${AINUBIS.cyan};}
.dfl-tip .tt{flex:1;min-width:0;font-weight:500;font-size:${X.body}px;line-height:1.25;color:#fff;}
.dfl-say{margin-top:${S.sm}px;border:1px solid ${AINUBIS.edgeStrong};border-radius:${R.tile}px;background:${AINUBIS.surface};padding:${S.sm}px ${S.md}px;font-size:${X.body}px;line-height:1.35;color:rgba(255,255,255,.82);}
.dfl-say .who{display:block;font:700 ${X.micro}px/1.4 ${FONT_TITLE};letter-spacing:.14em;color:#fff;margin-bottom:${S.xs}px;} /* písmo: meno */
.dfl-say .who span{color:${AINUBIS.cyan};}
.dfl-tipx{margin:${S.sm}px 0 0;font-size:${X.body}px;line-height:1.45;color:${AINUBIS.inkDim};}
.dfl-tipx b{color:${AINUBIS.ink};font-weight:600;}
.dfl-note{margin-top:${S.sm}px;}
.dfl-noteb{background:none;border:0;padding:${S.xs}px 0;color:${PICK_INK.lapis};font-weight:500;font-size:${X.body}px;}
.dfl-foot{display:flex;align-items:center;gap:${S.md}px;margin-top:auto;padding-top:${S.sm}px;}
.dfl-skip{background:none;border:0;font-weight:500;font-size:${X.body}px;color:${T.inkWarm};padding:${S.md}px;margin-left:auto;}
.dfl-cta{border:1px solid ${LAPIS.edge};border-radius:${R.field}px;background:${LAPIS.grad};box-shadow:${LAPIS_BTN_SHADOW};color:#fff;font:700 ${X.body}px/1 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;padding:${S.lg}px ${S.xl}px;white-space:nowrap;} /* písmo: cta */
.dfl-cta.w{width:100%;}
.dfl-cta.sm{padding:${S.md}px ${S.lg}px;font-size:${X.label}px;}
.dfl-cta:disabled{opacity:.45;}
.dfl-lnk{background:none;border:0;font-weight:500;font-size:${X.body}px;color:${T.inkWarm};padding:${S.md}px;}
.dfl-err{font-size:${X.label}px;color:${T.alertRed};text-align:center;margin:${S.sm}px 0 0;}
.dfl-ax{display:grid;grid-template-columns:repeat(5,1fr);gap:${S.sm}px;margin-bottom:${S.md}px;}
.dfl-ax figure{margin:0;text-align:center;font-size:${X.micro}px;line-height:1.15;color:${T.inkWarm};}
.dfl-ax img{width:100%;aspect-ratio:1;object-fit:contain;display:block;}
.dfl-attr{font-size:${X.micro}px;line-height:1.35;color:${T.inkWarm};margin:${S.sm}px 0;}
.dfl-res{display:flex;flex-direction:column;align-items:center;text-align:center;gap:${S.sm}px;margin-top:${S.sm}px;}
.dfl-res .nm{font:900 ${X.h1}px/1.1 'Cinzel Decorative','Cinzel',serif;color:${T.inkStrong};} /* písmo: meno */
.dfl-res .tt{font:700 ${X.h2}px/1.2 ${FONT_TITLE};letter-spacing:.14em;text-transform:uppercase;color:${T.inkWarm};} /* písmo: nadpis */
.dfl-badges{height:clamp(160px,30cqh,240px);width:100%;display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;}
.dfl-bd{min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.xs}px;border:1px solid ${T.border};border-radius:${R.tile}px;background:${T.card};padding:${S.sm}px;overflow:hidden;}
.dfl-bd img{flex:1;min-height:0;max-width:100%;object-fit:contain;}
.dfl-bd small{font-weight:500;font-size:${X.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
.dfl-bd b{font:700 ${X.body}px/1.1 ${FONT_TITLE};color:${T.inkStrong};} /* písmo: nadpis */
.dfl-ph{display:grid;grid-template-columns:1fr 1fr;gap:${S.sm}px;margin-top:${S.sm}px;}
.dfl-phb{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${S.xs}px;height:136px;padding:${S.sm}px;text-align:center;border:1.5px dashed ${T.cardEdge};border-radius:${R.tile}px;font-size:${X.label}px;color:${T.inkWarm};overflow:hidden;cursor:pointer;}
.dfl-phb img{height:64px;max-width:100%;object-fit:contain;}
.dfl-phb b{font-weight:600;font-size:${X.body}px;color:${T.inkStrong};}
.dfl-phb small{font-size:${X.micro}px;line-height:1.2;}
.dfl-phb img.full{position:absolute;inset:0;width:100%;height:100%;max-height:none;object-fit:cover;opacity:1;}
.dfl-phb input{position:absolute;inset:0;opacity:0;}
.dfl-vet{display:flex;flex-direction:column;gap:${S.xs}px;margin-top:${S.sm}px;}
/* MODULY: čisté pozadie bez reliéfov, postup je kruh vedľa nadpisu. */
.dfm-head{display:flex;align-items:center;justify-content:space-between;gap:${S.lg}px;margin-top:${S.md}px;}
.dfm-h1{font:700 ${X.h1}px/1.1 ${FONT_TITLE};letter-spacing:.14em;color:${T.inkStrong};margin:0;text-transform:uppercase;} /* písmo: nadpis */
.dfm-sub{font-size:${X.lead}px;line-height:1.35;color:${T.inkWarm};margin:${S.xs}px 0 0;}
.dfm-ring{position:relative;width:72px;height:72px;flex:none;}
.dfm-ring svg{width:100%;height:100%;transform:rotate(-90deg);}
.dfm-ring b{position:absolute;inset:0;display:grid;place-items:center;font-weight:600;font-size:${X.lead}px;color:${T.inkStrong};font-variant-numeric:tabular-nums;}
.dfm-mods{flex:0 1 auto;min-height:0;display:flex;flex-direction:column;gap:${S.md}px;margin-top:${S.lg}px;overflow-y:auto;padding:0;}
.dfm{position:relative;flex:none;display:flex;flex-direction:column;gap:${S.sm}px;overflow:hidden;border:1.5px solid ${T.cardEdge};border-radius:${R.card}px;background:${T.card};padding:${S.md}px ${S.lg}px;}
.dfm .bg{position:absolute;right:0;top:0;bottom:0;width:58%;background-size:cover;background-position:center;-webkit-mask-image:linear-gradient(270deg,black 10%,transparent 100%);mask-image:linear-gradient(270deg,black 10%,transparent 100%);opacity:.2;}
.dfm .mt,.dfm .mb{display:flex;align-items:center;gap:${S.md}px;position:relative;}
.dfm .ic{width:48px;height:48px;border-radius:${R.pill}px;border:1.5px solid ${T.cardEdge};display:grid;place-items:center;flex:none;}
.dfm h3{font:700 ${X.h2}px/1.1 ${FONT_TITLE};letter-spacing:.14em;margin:0;color:${T.inkStrong};text-transform:uppercase;} /* písmo: nadpis */
.dfm p{margin:${S.xs}px 0 0;font-size:${X.label}px;line-height:1.3;color:${T.inkWarm};}
.dfm p b{font-weight:600;color:${PICK_INK.lapis};}
.dfm .pct{font-weight:500;font-size:${X.body}px;color:${T.inkStrong};min-width:32px;font-variant-numeric:tabular-nums;}
.dfm .dfl-lq{flex:1;}
.dfm-edit{background:none;border:0;padding:${S.sm}px;margin-left:auto;font:500 ${X.label}px/1 ${FONT_UI};color:${T.inkStrong};text-decoration:underline;text-underline-offset:3px;}
.dfm.mute{background:transparent;border-style:dashed;padding:${S.sm}px ${S.lg}px;}
.dfm.mute h3{font-size:${X.body}px;}
.dfm .soon{margin-left:auto;font-weight:500;font-size:${X.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${T.inkWarm};}
/* PC: jeden centrovaný stĺpec 832, odpovede v dvoch stĺpcoch. */
@container (min-width:720px){
 .dfl-sc{padding:${S.lg}px max(48px,calc((100cqw - ${PACK_COL_INNER}px)/2)) ${S.xl}px;}
 .dfl-art{height:80cqh;background-position:center 40%;}
 .dfl-ans{grid-template-columns:1fr 1fr;}
 .dfm-mods{flex-direction:row;flex-wrap:wrap;}
 .dfm{flex:1 1 calc(50% - 8px);}
}
/* ── ŠAT PAPYRUS 3D (hárok map-herne-2026-11-09, O1 a O7 až O9) — len pod html.papyrus3d ── */
html.papyrus3d .dfl{background:var(--p3d-paper);}
html.papyrus3d .dfl-main{padding-bottom:${S.sm}px;}
html.papyrus3d .dfl-q,html.papyrus3d .dfm-h1{font-family:'LT Museum',serif;font-weight:400;font-size:${X.h1}px;letter-spacing:0;text-transform:none;} /* písmo: nadpis */
html.papyrus3d .dfl-sec{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .dfl-lq{height:16px;border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
html.papyrus3d .dfl-lq .pk-progress__fill{background:linear-gradient(90deg,var(--p3d-gold-solid),var(--p3d-gold));}
html.papyrus3d .dfl-a,html.papyrus3d .dfl-sz,html.papyrus3d .dfl-bd,html.papyrus3d .dfl-mr{border:2.5px solid var(--p3d-ink);border-radius:${R.card}px;background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .dfl-a .tx{font-family:'LT Museum',serif;font-weight:400;font-size:${X.h2}px;color:var(--p3d-ink);} /* písmo: nadpis */
html.papyrus3d .dfl-c,html.papyrus3d .dfl-mo button,html.papyrus3d .dfl-dog{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-lift);color:var(--p3d-ink);}
html.papyrus3d .dfl-a.on,html.papyrus3d .dfl-c.on,html.papyrus3d .dfl-sz.on,html.papyrus3d .dfl-dog.on,html.papyrus3d .dfl-mo button.on{background:linear-gradient(180deg,color-mix(in srgb,${LAPIS.edge} 72%,white),${LAPIS.deep});border-color:var(--p3d-ink);color:${LAPIS.ink};box-shadow:var(--p3d-lift);}
html.papyrus3d .dfl-a.on .tx{color:${LAPIS.ink};}
html.papyrus3d .dfl-a.none,html.papyrus3d .dfl-c.none{border-style:dashed;box-shadow:none;}
html.papyrus3d .dfl-in{min-height:54px;border:2.5px solid var(--p3d-ink);border-radius:${R.card}px;background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);font-weight:500;}
html.papyrus3d .dfl-in:focus{outline:2.5px solid ${LAPIS.edge};}
html.papyrus3d .dfl-cta,html.papyrus3d .dfl-skip.pk-b3{min-height:56px;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);box-shadow:var(--p3d-b3);font:400 ${X.h2}px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;padding:0 ${S.xl}px;} /* písmo: cta */
html.papyrus3d .dfl-cta.sm{min-height:48px;padding:0 ${S.lg}px;font-size:${X.lead}px;}
html.papyrus3d .dfl-skip.pk-b3{margin-left:0;padding:0 ${S.lg}px;}
html.papyrus3d .dfl-foot{gap:${S.md}px;padding-bottom:${S.sm}px;}
html.papyrus3d .dfl-foot .dfl-cta{flex:1;}
html.papyrus3d .dfm{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-b3);}
html.papyrus3d .dfm h3{font-family:'LT Museum',serif;font-weight:400;font-size:${X.h2}px;letter-spacing:0;text-transform:none;} /* písmo: nadpis */
html.papyrus3d .dfm .ic{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .dfm.mute{border-style:dashed;box-shadow:none;}
html.papyrus3d .dfm-ring b{font-family:'LT Museum',serif;font-weight:400;}
html.papyrus3d .dfl-res .nm{font-family:'LT Museum',serif;font-weight:400;} /* písmo: meno */
html.papyrus3d .dfl-res .tt{font-family:'LT Museum',serif;font-weight:400;letter-spacing:0;text-transform:none;} /* písmo: nadpis */
html.papyrus3d .dfl-noteb{color:${LAPIS.edge};text-decoration:underline;}
`;
