// UPOZORNENIA — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, skupina K, rám K5), len pod `APP_NEW`.
// Prázdny stav NEEXISTUJE: hore sú vždy štatistiky DOGYPTu (`getPackStats` v `NotifSheet`), „všetko vybavené" sa neukazuje.
// Chybové a bezpečnostné hlásenia a riadky AINUBISA (`.ntf-row--ai`: odpoveď pod citátom, oznam) ostávajú v jeho tmavom šate
// (brand.md §AINUBIS, cyan = systém), tu sa ich netýka nič. Podstránky: zoznam, „Všetky štatistiky" (`.sd-*` zo `StatsDetail`).
// Tmavá strana: bodkovaný lapis, papierové karty s čiernou perou (na tmavom podklade zlatá pera zaniká, preto `PERA_DARK`).
import { PACK_R, PACK_TEXT, PACK_SPACE as S, PACK_THEME as T } from './packTheme';
import { LAPIS } from './navGoldSkin';
import { BACK } from './BackButton';
import { SNIFFER_HEART } from './buddy/SnifferLogo';

const PERA_DARK = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,black 55%,transparent)`;
const AV = 84;
const CARD_DARK = `border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.frame}px;background:var(--p3d-card);box-shadow:${PERA_DARK};color:var(--p3d-ink);`;

export const NTF_P3D_CSS = `
html.papyrus3d .ntf-sheet.pk-stage{--pk-stage:${LAPIS.deep};background:radial-gradient(circle at 1px 1px,color-mix(in srgb,${LAPIS.ink} 22%,transparent) 1px,transparent 1.6px) 0 0/22px 22px,linear-gradient(180deg,${LAPIS.edge},${LAPIS.deep});color:${LAPIS.ink};}
html.papyrus3d .ntf-ttl{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;text-align:center;color:${LAPIS.ink};}
html.papyrus3d .ntf-top{padding-right:${BACK.dia + S.lg}px;}
/* pás správ: obrys, nie plná pilulka */
html.papyrus3d .ntf-pill{border:1.5px solid color-mix(in srgb,${LAPIS.ink} 50%,transparent);background:transparent;color:${LAPIS.ink};}
html.papyrus3d .ntf-pill b,html.papyrus3d .ntf-pill--gold b,html.papyrus3d .ntf-pill--up b,html.papyrus3d .ntf-pill--lapis b{color:${LAPIS.ink};}
/* BLOK NAJNOVŠÍ PRÍRASTOK: kruhová fotka, štítok + meno, dve čísla vedľa seba (hárok .nst) */
html.papyrus3d .ntf-stats{margin-top:${S.md}px;display:flex;align-items:center;gap:${S.md}px;height:auto;padding:${S.md}px;border:2px solid ${LAPIS.ink};border-radius:${PACK_R.card}px;background:color-mix(in srgb,black 28%,transparent);box-shadow:none;}
html.papyrus3d .ntf-dogwrap{position:relative;left:auto;top:auto;bottom:auto;z-index:auto;aspect-ratio:auto;max-width:none;flex:1;min-width:0;display:grid;grid-template-columns:${AV}px minmax(0,1fr);column-gap:${S.md}px;align-items:center;align-content:center;}
html.papyrus3d .ntf-dog{grid-column:1;grid-row:1 / 3;width:${AV}px;height:${AV}px;border-radius:${PACK_R.pill}px;border:2.5px solid var(--p3d-gold);-webkit-mask-image:none;mask-image:none;}
html.papyrus3d .ntf-dog::after{display:none;}
html.papyrus3d .ntf-dog-new{position:static;grid-column:2;grid-row:1;align-self:end;padding:0;border:0;background:none;color:${LAPIS.ink};opacity:.8;font-weight:600;letter-spacing:.22em;}
html.papyrus3d .ntf-dog-cap{position:static;grid-column:2;grid-row:2;align-self:start;flex-wrap:wrap;}
html.papyrus3d .ntf-dog-name{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:.02em;color:${LAPIS.ink};}
html.papyrus3d .ntf-dog-num{background:none;color:${LAPIS.ink};border:1.5px solid ${LAPIS.ink};box-shadow:none;}
html.papyrus3d .ntf-dog-flag{border-color:${LAPIS.ink};}
html.papyrus3d .ntf-arr--prev{left:-${S.sm}px;transform:translateY(-50%);}
html.papyrus3d .ntf-arr--next{left:${AV - S.lg - S.xs}px;transform:translateY(-50%);}
html.papyrus3d .ntf-logo-clip{display:none;}
html.papyrus3d .ntf-nums{position:static;margin-left:auto;flex-direction:row;align-items:flex-start;justify-content:flex-end;gap:${S.md}px;}
html.papyrus3d .ntf-nums{flex:0 1 auto;min-width:0;}
html.papyrus3d .ntf-num{flex-direction:column;align-items:center;gap:${S.xs}px;min-width:0;}
html.papyrus3d .ntf-num span{max-width:100%;overflow-wrap:anywhere;hyphens:auto;text-align:center;}
html.papyrus3d .ntf-num b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;color:${LAPIS.ink};}
html.papyrus3d .ntf-num span{font-size:${PACK_TEXT.label}px;font-weight:500;letter-spacing:.02em;text-transform:none;color:${LAPIS.ink};}
/* nadpisy zoznamov (Čaká na teba, Pre teba, Nové, Skôr) */
html.papyrus3d .ntf-sec{font-size:${PACK_TEXT.label}px;font-weight:600;color:${LAPIS.ink};opacity:.8;letter-spacing:.22em;}
/* riadok upozornenia = papierová karta s čiernou perou (hárok .nt); červená bodka = nové */
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec),html.papyrus3d .ntf-row:not(.ntf-row--ai){position:relative;min-height:68px;padding:${S.sm}px ${S.md}px;${CARD_DARK}}
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec){display:flex;align-items:center;}
html.papyrus3d .ntf-real li.ntf-li-sos > button{width:100%;padding:0;border:0 !important;background:none !important;border-radius:0 !important;}
html.papyrus3d .ntf-real li > button{flex:1;min-width:0;color:var(--p3d-ink);}
html.papyrus3d .ntf-real li.ntf-new::before{content:'';position:absolute;z-index:1;left:-5px;top:-5px;width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${SNIFFER_HEART};border:2.5px solid var(--p3d-ink);}
html.papyrus3d .ntf-row--tip .ntf-txt{font-weight:500;color:var(--p3d-ink);}
html.papyrus3d .ntf-row--tip .ntf-txt small{color:${T.inkDim};}
html.papyrus3d .ntf-act{flex:0 0 auto;border:0;background:none;padding:${S.xs}px 0 ${S.xs}px ${S.sm}px;cursor:pointer;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.lead}px;letter-spacing:0;text-transform:none;color:${LAPIS.edge};}
html.papyrus3d .ntf-list{gap:${S.lg}px;}
html.papyrus3d .ntf-real{gap:${S.lg}px;}
html.papyrus3d .ntf-real ul{gap:${S.lg}px;}
html.papyrus3d .ntf-history{color:${LAPIS.ink};text-decoration:underline;font-size:${PACK_TEXT.body}px;font-weight:500;}
html.papyrus3d .ntf-allstats{display:block;flex:0 0 auto;margin:${S.sm}px auto 0;padding:${S.sm}px ${S.md}px;}
html.papyrus3d .ntf-empty{display:none;}
/* PODSTRÁNKA „Všetky štatistiky" (StatsDetail): karty papierové s perou, pilulky tempa obrysom na lapise */
html.papyrus3d .ntf-all .sd-sub{${CARD_DARK.replace(/;/g, ' !important;')}border-radius:${PACK_R.card}px !important;}
html.papyrus3d .ntf-all .sd-pills .pk-pill{border:1.5px solid color-mix(in srgb,${LAPIS.ink} 50%,transparent);background:transparent;color:${LAPIS.ink};}
html.papyrus3d .ntf-all .sd-pills .pk-pill b{color:${LAPIS.ink} !important;}
`;
