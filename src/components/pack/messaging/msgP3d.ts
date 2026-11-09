// SPRÁVY — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, skupina K: K1 až K4).
// Šat je vrstva: `html.papyrus3d` existuje len pod `APP_NEW`, web dogypt.com sa nezmení. Panel moderácie AINUBISA sa NEMENÍ.
import { PACK_R, PACK_TEXT, PACK_SPACE as S } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';

const PERA_SM = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)`;
const LAPIS_BG = `linear-gradient(180deg,color-mix(in srgb,${LAPIS.edge} 72%,white),${LAPIS.deep})`;
const LAPIS_SH = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,${LAPIS.deep} 60%,black)`;

export const MSG_P3D_CSS = `
html.papyrus3d .msg-skin{--msg-title:var(--p3d-ink);--msg-dim:var(--p3d-ink);--msg-bar:transparent;--msg-bar-edge:transparent;--msg-bar-shadow:none;--msg-sep:transparent;--msg-row-hot:transparent;}
html.papyrus3d .msg-inbox-title,html.papyrus3d .msg-thread-title{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
/* K1: riadok správy = karta s perom */
html.papyrus3d .msg-inbox-list{display:flex;flex-direction:column;gap:${S.lg}px;}
html.papyrus3d .msg-row{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:var(--p3d-card);box-shadow:${PERA_SM};padding:${S.md}px;}
html.papyrus3d .msg-row:last-child{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .msg-row-name{font-family:'LT Museum',serif !important;font-weight:400;font-size:${PACK_TEXT.h2}px;}
html.papyrus3d .msg-row-preview,html.papyrus3d .msg-row-time,html.papyrus3d .msg-row-pack{font-size:${PACK_TEXT.body}px;color:var(--p3d-ink);}
html.papyrus3d .msg-avatar{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .msg-tagchip{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
/* K2: prázdny stav = obálka */
html.papyrus3d .msg-emptytitle{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;color:var(--p3d-ink);}
html.papyrus3d .msg-emptyimg{width:96px;height:96px;object-fit:contain;display:block;}
/* K3: bubliny */
html.papyrus3d .msg-bubble{font-size:${PACK_TEXT.lead}px;border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${PERA_SM};}
html.papyrus3d .msg-bubble.me{background:${LAPIS_BG};border-color:${LAPIS.ink};color:${LAPIS.ink};box-shadow:${LAPIS_SH};}
html.papyrus3d .msg-bubble-sender{color:var(--p3d-gold-ink);}
html.papyrus3d .msg-bubbleav{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .msg-thread-dock{border-top:0;background:transparent;}
html.papyrus3d .msg-thread-input{min-height:54px;border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);color:var(--p3d-ink);font-weight:500;}
html.papyrus3d .msg-thread-input:focus{border-color:var(--p3d-ink);box-shadow:var(--p3d-inset);}
html.papyrus3d .msg-sendbtn{width:56px;height:56px;border:2.5px solid ${LAPIS.ink};background:${LAPIS_BG};box-shadow:${LAPIS_SH};}
html.papyrus3d .msg-sendbtn:hover:not(:disabled){background:${LAPIS_BG};}
html.papyrus3d .msg-sendbtn:disabled{background:var(--p3d-card);border-color:var(--p3d-ink);}
html.papyrus3d .msg-joinbtn{min-height:56px;border:2.5px solid ${LAPIS.ink};border-radius:${PACK_R.card}px;background:${LAPIS_BG};color:${LAPIS.ink};box-shadow:${LAPIS_SH};font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:none;}
/* K4: zablokovaný */
html.papyrus3d .msg-blocked{border-top:0;background:transparent;}
html.papyrus3d .msg-blockedtxt{font-size:${PACK_TEXT.lead}px;color:var(--p3d-ink);}
html.papyrus3d .msg-unblock{min-height:56px;padding:0 ${S.lg}px;border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:var(--p3d-b3);font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:none;}
`;
