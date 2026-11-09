// UPOZORNENIA — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, K5), len pod `APP_NEW`.
// Prázdny stav NEEXISTUJE: hore sú vždy štatistiky DOGYPTu (`getPackStats` v `NotifSheet`), „všetko vybavené" sa neukazuje.
// Chybové a bezpečnostné hlásenia a riadky AINUBISA (`.ntf-row--ai`) ostávajú v jeho tmavom šate, tu sa ich netýka nič.
import { PACK_R, PACK_TEXT, PACK_SPACE as S } from './packTheme';
import { LAPIS } from './navGoldSkin';

const PERA_SM = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)`;

export const NTF_P3D_CSS = `
html.papyrus3d .ntf-sheet.pk-stage{--pk-stage:${LAPIS.deep};background:${LAPIS.deep};color:${LAPIS.ink};}
html.papyrus3d .ntf-ttl{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;text-align:center;color:${LAPIS.ink};}
html.papyrus3d .ntf-top{padding-right:${S.xxl + S.lg}px;}
html.papyrus3d .ntf-pill{border:2px solid ${LAPIS.ink};background:transparent;color:${LAPIS.ink};}
html.papyrus3d .ntf-pill b,html.papyrus3d .ntf-pill--gold b,html.papyrus3d .ntf-pill--up b,html.papyrus3d .ntf-pill--lapis b{color:${LAPIS.ink};}
html.papyrus3d .ntf-stats{border:2.5px solid ${LAPIS.ink};border-radius:${PACK_R.card}px;background:${LAPIS.deep};box-shadow:none;}
html.papyrus3d .ntf-dog{border-radius:${PACK_R.tile}px 0 0 ${PACK_R.tile}px;}
html.papyrus3d .ntf-num b{color:${LAPIS.ink};}
html.papyrus3d .ntf-num span{color:${LAPIS.ink};letter-spacing:.02em;text-transform:none;}
html.papyrus3d .ntf-logo{background:${LAPIS.ink};}
html.papyrus3d .ntf-sec{color:${LAPIS.ink};letter-spacing:.22em;}
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec),html.papyrus3d .ntf-row:not(.ntf-row--ai){border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;background:var(--p3d-card);box-shadow:${PERA_SM};color:var(--p3d-ink);}
html.papyrus3d .ntf-real li button{color:var(--p3d-ink);}
html.papyrus3d .ntf-list{gap:${S.lg}px;}
html.papyrus3d .ntf-real{gap:${S.lg}px;}
html.papyrus3d .ntf-real ul{gap:${S.lg}px;}
html.papyrus3d .ntf-history{color:${LAPIS.ink};text-decoration:underline;font-size:${PACK_TEXT.body}px;}
html.papyrus3d .ntf-empty{display:none;}
`;
