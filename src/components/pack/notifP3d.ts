// UPOZORNENIA — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, skupina K, rám K5), len pod `APP_NEW`.
// Prázdny stav NEEXISTUJE: hore sú vždy štatistiky DOGYPTu (`getPackStats` v `NotifSheet`), „všetko vybavené" sa neukazuje.
// Chybové a bezpečnostné hlásenia a riadky AINUBISA (`.ntf-row--ai`: odpoveď pod citátom, oznam) ostávajú v jeho tmavom šate
// (brand.md §AINUBIS, cyan = systém), tu sa ich netýka nič. Podstránky: zoznam, „Všetky štatistiky" (`.sd-*` zo `StatsDetail`).
// Tmavá strana: bodkovaný lapis, papierové karty s čiernou perou (na tmavom podklade zlatá pera zaniká, preto `PERA_DARK`).
import { PACK_R, PACK_TEXT, PACK_SPACE as S, PACK_THEME as T } from './packTheme';
import { AINUBIS } from './ainubisSkin';
import { LAPIS } from './navGoldSkin';
import { BACK } from './BackButton';
import { SNIFFER_HEART } from './buddy/SnifferLogo';

const PERA_DARK = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,black 55%,transparent)`;
const AV = 64;
const GOLD_HI = '#F5C73D';
const CARD_DARK = `border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.frame}px;background:var(--p3d-card);box-shadow:${PERA_DARK};color:var(--p3d-ink);`;

export const NTF_P3D_CSS = `
html.papyrus3d .ntf-sheet.pk-stage{--pk-stage:${LAPIS.deep};background:radial-gradient(circle at 1px 1px,color-mix(in srgb,${LAPIS.ink} 22%,transparent) 1px,transparent 1.6px) 0 0/22px 22px,linear-gradient(180deg,${LAPIS.edge},${LAPIS.deep});color:${LAPIS.ink};}
html.papyrus3d .ntf-ttl{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;text-align:center;color:${LAPIS.ink};}
html.papyrus3d .ntf-top{padding-right:${BACK.dia + S.lg}px;}
/* pás správ: farebné tónované pilulky (zelená = rast, zlatá = míľnik, cyan = oznam AINUBISA, svetlý lapis = krajiny) — Matej 9. 11.: „fádne“ */
html.papyrus3d .ntf-pill{--c:${LAPIS.ink};border:1.5px solid color-mix(in srgb,var(--c) 70%,transparent);background:color-mix(in srgb,var(--c) 16%,transparent);color:${LAPIS.ink};}
html.papyrus3d .ntf-pill--up{--c:#8EE0A8;}
html.papyrus3d .ntf-pill--gold{--c:${GOLD_HI};}
html.papyrus3d .ntf-pill--lapis{--c:#A9BEFF;}
html.papyrus3d .ntf-pill--news{--c:${AINUBIS.cyan};}
html.papyrus3d .ntf-pill b,html.papyrus3d .ntf-pill--gold b,html.papyrus3d .ntf-pill--up b,html.papyrus3d .ntf-pill--lapis b{color:var(--c);}
/* panel v zozname: výška podľa obsahu, nie celá strana — hore štvrtina s prírastkom, pod ňou len to, čo je naozaj nové */
html.papyrus3d .ntf-sheet.ntf-compact{height:auto;max-height:100%;align-self:flex-start;border-radius:0 0 ${PACK_R.card}px ${PACK_R.card}px;box-shadow:0 8px 0 color-mix(in srgb,black 45%,transparent);}
html.papyrus3d .ntf-compact .ntf-top{padding-top:calc(env(safe-area-inset-top,0px) + ${S.sm}px);padding-bottom:0;}
html.papyrus3d .ntf-compact .ntf-tick{margin-top:${S.xs}px;}
html.papyrus3d .ntf-compact .ntf-history{padding:${S.xs}px ${S.md}px;}
html.papyrus3d .ntf-compact .ntf-list{flex:0 1 auto;min-height:0;padding-top:${S.sm}px;padding-bottom:${S.sm}px;gap:${S.md}px;}
@media (max-height:700px){html.papyrus3d .ntf-tick{display:none;}}
/* BLOK NAJNOVŠÍ PRÍRASTOK: kruhová fotka so zlatým svitom, štítok + meno, dve farebné čísla, dolu pás míľnika (hárok .nst) */
html.papyrus3d .ntf-stats{margin-top:${S.sm}px;display:flex;flex-wrap:wrap;align-items:center;gap:${S.sm}px ${S.md}px;height:auto;padding:${S.sm}px ${S.md}px;border:2.5px solid ${LAPIS.ink};border-radius:${PACK_R.card}px;
  background:radial-gradient(90% 150% at 0% 0%,color-mix(in srgb,${GOLD_HI} 34%,transparent),transparent 62%),radial-gradient(80% 130% at 100% 100%,color-mix(in srgb,${AINUBIS.cyan} 24%,transparent),transparent 66%),color-mix(in srgb,black 30%,transparent);
  box-shadow:inset 0 2px 0 color-mix(in srgb,white 30%,transparent),0 4px 0 color-mix(in srgb,black 55%,transparent);}
html.papyrus3d .ntf-dogwrap{position:relative;left:auto;top:auto;bottom:auto;z-index:auto;aspect-ratio:auto;max-width:none;flex:1;min-width:0;display:grid;grid-template-columns:${AV}px minmax(0,1fr);column-gap:${S.md}px;align-items:center;align-content:center;}
html.papyrus3d .ntf-dog{grid-column:1;grid-row:1 / 3;width:${AV}px;height:${AV}px;border-radius:${PACK_R.pill}px;border:2.5px solid ${GOLD_HI};-webkit-mask-image:none;mask-image:none;animation:ntf-glow 2.6s ease-in-out infinite;}
@keyframes ntf-glow{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,${GOLD_HI} 55%,transparent);}50%{box-shadow:0 0 0 7px color-mix(in srgb,${GOLD_HI} 0%,transparent);}}
@media (prefers-reduced-motion:reduce){html.papyrus3d .ntf-dog{animation:none;}}
html.papyrus3d .ntf-dog::after{display:none;}
html.papyrus3d .ntf-dog-new{position:static;grid-column:2;grid-row:1;align-self:end;justify-self:start;padding:${S.xs}px ${S.sm}px;border:1.5px solid ${GOLD_HI};background:color-mix(in srgb,${GOLD_HI} 18%,transparent);color:${GOLD_HI};font-weight:600;letter-spacing:.22em;}
html.papyrus3d .ntf-dog-cap{position:static;grid-column:2;grid-row:2;align-self:start;flex-wrap:wrap;}
html.papyrus3d .ntf-dog-name{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:.02em;color:${LAPIS.ink};}
html.papyrus3d .ntf-dog-num{background:${GOLD_HI};color:${LAPIS.deep};border:1.5px solid ${LAPIS.ink};box-shadow:none;font-weight:700;}
html.papyrus3d .ntf-dog-flag{border-color:${LAPIS.ink};}
html.papyrus3d .ntf-arr--prev{left:-${S.sm}px;transform:translateY(-50%);}
html.papyrus3d .ntf-arr--next{left:${AV - S.lg - S.xs}px;transform:translateY(-50%);}
html.papyrus3d .ntf-logo-clip{display:none;}
html.papyrus3d .ntf-nums{position:static;margin-left:auto;flex:0 1 auto;flex-direction:row;align-items:flex-start;justify-content:flex-end;gap:${S.md}px;}
html.papyrus3d .ntf-nums{flex:0 1 auto;min-width:0;}
html.papyrus3d .ntf-num{flex-direction:column;align-items:center;gap:${S.xs}px;min-width:0;}
html.papyrus3d .ntf-num span{max-width:100%;overflow-wrap:anywhere;hyphens:auto;text-align:center;}
html.papyrus3d .ntf-num b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;color:${GOLD_HI};}
html.papyrus3d .ntf-num + .ntf-num b{color:${AINUBIS.cyan};}
html.papyrus3d .ntf-num span{font-size:${PACK_TEXT.label}px;font-weight:500;letter-spacing:.02em;text-transform:none;color:${LAPIS.ink};}
/* PÁS MÍĽNIKA pod fotkou: zlatý gradient na tmavej koľajnici, text vľavo názov fázy, vpravo „135 / 1 000“ */
html.papyrus3d .ntf-prog{flex:0 0 100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:${S.sm}px;font-size:${PACK_TEXT.label}px;color:${LAPIS.ink};}
/* hero je dvere do všetkých štatistík — šípka to ukazuje, odkaz pod blokom v zozname zaniká (štvrtina obrazovky) */
html.papyrus3d .ntf-compact .ntf-allstats{display:none;}
html.papyrus3d .ntf-prog b{font-weight:600;white-space:nowrap;color:${GOLD_HI};}
html.papyrus3d .ntf-prog-bar{display:block;height:12px;border-radius:${PACK_R.pill}px;border:2px solid ${LAPIS.ink};background:color-mix(in srgb,black 45%,transparent);overflow:hidden;}
html.papyrus3d .ntf-prog-bar .pk-progress__fill{display:block;height:100%;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,#E69E1A,${GOLD_HI});}
/* nadpisy zoznamov (Čaká na teba, Pre teba, Nové, Skôr) */
html.papyrus3d .ntf-sec{font-size:${PACK_TEXT.label}px;font-weight:600;color:${LAPIS.ink};opacity:.8;letter-spacing:.22em;}
/* riadok upozornenia = papierová karta s čiernou perou (hárok .nt); červená bodka = nové */
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec),html.papyrus3d .ntf-row:not(.ntf-row--ai){position:relative;min-height:68px;padding:${S.sm}px ${S.md}px;${CARD_DARK}}
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec){display:flex;align-items:center;}
html.papyrus3d .ntf-real li.ntf-li-sos > button{width:100%;padding:0;border:0 !important;background:none !important;border-radius:0 !important;}
html.papyrus3d .ntf-real li > button{flex:1;min-width:0;color:var(--p3d-ink);}
html.papyrus3d .ntf-real li.ntf-new::before{content:'';position:absolute;z-index:1;left:-5px;top:-5px;width:16px;height:16px;border-radius:${PACK_R.pill}px;background:${SNIFFER_HEART};border:2.5px solid var(--p3d-ink);}
html.papyrus3d .ntf-row--tip{--acc:${T.accentGold};overflow:hidden;padding-left:${S.lg}px !important;}
html.papyrus3d .ntf-row--tip::before{content:'';position:absolute;left:0;top:0;bottom:0;width:${S.sm}px;background:var(--acc);}
html.papyrus3d .ntf-tip-sniffer{--acc:${SNIFFER_HEART};}
html.papyrus3d .ntf-tip-trip{--acc:${T.tripPurple};}
html.papyrus3d .ntf-tip-test{--acc:${AINUBIS.cyan};}
html.papyrus3d .ntf-row--tip .ntf-txt{font-weight:600;color:var(--p3d-ink);}
html.papyrus3d .ntf-row--tip .ntf-txt small{font-weight:400;color:${T.inkDim};}
/* akcia tipu = malé 3D tlačidlo vo farbe tipu */
html.papyrus3d .ntf-act{flex:0 0 auto;border:2px solid var(--p3d-ink);border-radius:${PACK_R.field}px;background:linear-gradient(180deg,color-mix(in srgb,var(--acc,${T.accentGold}) 55%,white),var(--acc,${T.accentGold}));box-shadow:var(--p3d-lift);padding:${S.sm}px ${S.md}px;cursor:pointer;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.body}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .ntf-tip-sniffer .ntf-act,html.papyrus3d .ntf-tip-trip .ntf-act{color:#fff;}
html.papyrus3d .ntf-list{gap:${S.lg}px;}
html.papyrus3d .ntf-real{gap:${S.lg}px;}
html.papyrus3d .ntf-real ul{gap:${S.lg}px;}
html.papyrus3d .ntf-history{color:${LAPIS.ink};text-decoration:underline;font-size:${PACK_TEXT.body}px;font-weight:500;}
html.papyrus3d .ntf-allstats{display:block;flex:0 0 auto;margin:${S.sm}px auto 0;padding:${S.sm}px ${S.md}px;}
html.papyrus3d .ntf-empty{display:none;}
/* PODSTRÁNKA „Všetky štatistiky" (StatsDetail): karty papierové s perou, pilulky tempa obrysom na lapise */
html.papyrus3d .ntf-all .sd-sub{${CARD_DARK.replace(/;/g, ' !important;')}border-radius:${PACK_R.card}px !important;}
`;
