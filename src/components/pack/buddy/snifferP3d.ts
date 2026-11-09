// SNIFFER — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, skupina P), len pod `APP_NEW`.
// Šat je vrstva: `html.papyrus3d` existuje len pod `APP_NEW`, web dogypt.com sa nezmení. Wrapper stránky ho nesie v `PackBuddy.tsx`.
// Logo = P1 z hárku (srdce s nosom `icons/sys/pridaj-sniffer.webp` + nápis Museum), bez výsledkov = jazvečík `icons/jazvecik-zadok.webp`.
import { PACK_R, PACK_TEXT, PACK_SPACE as S, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';

/** Titulný nápis loga: väčší než stupnica písma (hárok 58), preto token, nie číslo v pravidle. */
const WM_SIZE = 56;
const PERA_SM = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)`;
const LAPIS_BG = `linear-gradient(180deg,color-mix(in srgb,${LAPIS.edge} 72%,white),${LAPIS.deep})`;
const LAPIS_SH = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 color-mix(in srgb,${LAPIS.deep} 60%,black),0 11px 14px var(--p3d-sh)`;
const RED_BG = `linear-gradient(180deg,color-mix(in srgb,${T.sosRed} 62%,white),${T.sosRed})`;
const CARD = `border:2.5px solid var(--p3d-ink) !important;border-radius:${PACK_R.card}px !important;background:var(--p3d-card) !important;box-shadow:var(--p3d-b3) !important;`;
const INSET = `background:var(--p3d-paper-hi);border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;box-shadow:var(--p3d-inset);`;

export const SNIFFER_P3D_CSS = `
html.papyrus3d .bd-root.pk-paper::after{background:linear-gradient(180deg,var(--p3d-paper-hi),var(--p3d-paper));}
html.papyrus3d .bd-root.pk-paper::before{background:radial-gradient(circle at 50% 30%,var(--p3d-paper-hi) 0%,transparent 70%);}
/* kontajnery kariet */
html.papyrus3d .bd-card:not(.bd-hero--bare),html.papyrus3d .sp-card,html.papyrus3d .sh-sheet,html.papyrus3d .sh-row{${CARD}}
html.papyrus3d .bd-h2,html.papyrus3d .sp-title,html.papyrus3d .sh-sheet h3{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .bd-eyebrow,html.papyrus3d .sp-sec{color:var(--p3d-gold-ink);}
html.papyrus3d .bd-lead,html.papyrus3d .bd-note,html.papyrus3d .sp-sub,html.papyrus3d .sh-note,html.papyrus3d .bd-onbox small,html.papyrus3d .bd-tagline{color:var(--p3d-ink);}
/* P1: logo + nápis */
html.papyrus3d .bd-logo3d{display:flex;flex-direction:column;align-items:center;margin:0 auto;}
html.papyrus3d .bd-logo3d img{width:150px;height:150px;margin-bottom:-${S.md}px;position:relative;z-index:1;}
html.papyrus3d .bd-wm{display:block;font-family:'LT Museum',serif;font-weight:400;font-size:${WM_SIZE}px;line-height:1;letter-spacing:.02em;color:${LAPIS.ink};-webkit-text-stroke:7px var(--p3d-ink);paint-order:stroke fill;filter:drop-shadow(0 5px 0 var(--p3d-gold-ink));}
/* tlačidlá: lapis b3, ostatné paper b3 */
html.papyrus3d .bd-cta,html.papyrus3d .bd-ghost,html.papyrus3d .sh-ghost{min-height:56px;display:inline-flex;align-items:center;justify-content:center;border:2.5px solid ${LAPIS.ink};border-radius:${PACK_R.card}px;background:${LAPIS_BG};color:${LAPIS.ink};box-shadow:${LAPIS_SH};font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:none;}
html.papyrus3d .bd-cta:hover{background:${LAPIS_BG};}
html.papyrus3d .bd-cta:active:not(:disabled){transform:translateY(5px);}
html.papyrus3d .bd-cta--small{min-height:48px;font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .bd-dock .bd-cta:disabled{background:var(--p3d-card);border-color:var(--p3d-ink);color:var(--p3d-ink);opacity:.6;box-shadow:var(--p3d-b3);}
html.papyrus3d .bd-ghost,html.papyrus3d .sh-ghost,html.papyrus3d .sh-ghost--dark{border-color:var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);box-shadow:var(--p3d-b3);}
html.papyrus3d .bd-gear{width:44px;height:44px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${PERA_SM};}
/* pole */
html.papyrus3d .bd-col .pf-field,html.papyrus3d .bd-field,html.papyrus3d .sh-area{${INSET}color:var(--p3d-ink);font-weight:500;}
/* pilulky: papier, vybraná lapis */
html.papyrus3d .bd-pills .pk-pill{min-height:44px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${PERA_SM};}
html.papyrus3d .bd-pills .pk-pill.is-on{border-color:${LAPIS.ink};background:${LAPIS_BG};color:${LAPIS.ink};box-shadow:${PERA_SM};}
html.papyrus3d .bd-todo,html.papyrus3d .sp-kv > button > b.is-todo,html.papyrus3d .sp-miss{border:2.5px solid ${LAPIS.ink};background:${LAPIS_BG};color:${LAPIS.ink};}
html.papyrus3d .bd-link{color:${LAPIS.edge};}
/* prepínač zapnuté/vypnuté */
html.papyrus3d .bd-sw{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
html.papyrus3d .bd-sw.is-on{background:${LAPIS_BG};border-color:var(--p3d-ink);}
html.papyrus3d .bd-sw i{background:var(--p3d-card);border:2px solid var(--p3d-ink);box-shadow:none;}
html.papyrus3d .bd-onbox{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
/* riadky profilu */
html.papyrus3d .sp-kv,html.papyrus3d .bd-item + .bd-item{border-top:1.5px solid var(--p3d-gold);}
html.papyrus3d .sp-kv > button,html.papyrus3d .sp-static,html.papyrus3d .bd-row{color:var(--p3d-ink);}
html.papyrus3d .sp-kv > button > b,html.papyrus3d .sp-static b{color:var(--p3d-ink);}
html.papyrus3d .sp-slot{border:2.5px dashed var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .sp-arrow{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);}
html.papyrus3d .bd-mark{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .bd-edit{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
/* P7: prepínač Sniffuj · Hľadať · Zhody */
html.papyrus3d .sh-tabs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:${S.xs}px;padding:${S.xs}px;border-radius:${PACK_R.card}px;border:2.5px solid var(--p3d-ink);background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .sh-tabs button{min-height:50px;border-radius:${PACK_R.frame}px;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .sh-tabs button.is-on{color:${LAPIS.ink};background:${LAPIS_BG};border:2.5px solid ${LAPIS.ink};box-shadow:inset 0 2px 0 color-mix(in srgb,white 28%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 4px 0 color-mix(in srgb,${LAPIS.deep} 60%,black);}
html.papyrus3d .ss-segs{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .ss-seg{border-radius:${PACK_R.frame}px;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.lead}px;color:var(--p3d-ink);}
html.papyrus3d .ss-seg.is-on{background:${LAPIS_BG};color:${LAPIS.ink};border:2.5px solid ${LAPIS.ink};}
html.papyrus3d .ss-flt,html.papyrus3d .ss-flag{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${PERA_SM};}
html.papyrus3d .ss-drop{${CARD}}
html.papyrus3d .ss-ctry{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);}
/* P7: karta psa v zlatom ráme s perom */
html.papyrus3d .sn-card,html.papyrus3d .sh-skel-card{border:3px solid var(--p3d-gold);border-radius:${PACK_R.card}px;box-shadow:0 0 0 2px var(--p3d-ink),0 7px 0 2px var(--p3d-gold-ink),0 13px 16px var(--p3d-sh);}
html.papyrus3d .sn-card.is-back{box-shadow:none;}
html.papyrus3d .sn-nm{font-family:'LT Museum',serif;font-weight:400;}
html.papyrus3d .sn-dogs em{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .sh-deck{margin-bottom:${S.md}px;}
/* P7: SNIFF = lapis, ✕ = červené (negatívne CTA celé červené) */
html.papyrus3d .sh-act{font-size:0;gap:0;}
html.papyrus3d .sh-btn{height:64px;border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;}
html.papyrus3d .sh-btn--no{width:64px;border-radius:50%;background:${RED_BG};box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 ${T.sosRedDark},0 11px 14px var(--p3d-sh);}
html.papyrus3d .sh-btn--yes{width:auto;min-width:176px;gap:${S.sm}px;padding:0 ${S.lg}px;border-color:${LAPIS.ink};background:${LAPIS_BG};box-shadow:${LAPIS_SH};color:${LAPIS.ink};}
html.papyrus3d .sh-btn--yes img{width:40px;height:40px;}
html.papyrus3d .sh-sniff{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:uppercase;}
html.papyrus3d .sh-stamp{font-family:'LT Museum',serif;font-weight:400;}
html.papyrus3d .sh-errbar{border:2.5px solid ${T.sosRed};}
html.papyrus3d .sh-mini{color:${LAPIS.edge};font-size:${PACK_TEXT.body}px;}
html.papyrus3d .sh-new{border:2px solid var(--p3d-ink);}
/* P9: nikto tu nie je = jazvečík, Ups… a karta s oznamom */
html.papyrus3d .se-p3d{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;gap:${S.md}px;text-align:center;width:100%;max-width:440px;margin:0 auto;}
html.papyrus3d .se-p3d img{width:160px;height:auto;display:block;}
html.papyrus3d .se-p3d .se-oops{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .se-p3d strong{font-weight:500;font-size:${PACK_TEXT.lead}px;line-height:1.4;color:var(--p3d-ink);}
html.papyrus3d .se-p3d .se-note{align-self:stretch;text-align:left;padding:${S.md}px;${CARD}}
html.papyrus3d .se-p3d .se-note i{color:var(--p3d-gold-ink);}
html.papyrus3d .se-p3d .se-note p{font-size:${PACK_TEXT.body}px;color:var(--p3d-ink);}
`;
