// UPOZORNENIA — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, skupina K, rám K5), len pod `APP_NEW`.
// Prázdny stav NEEXISTUJE: hore sú vždy štatistiky DOGYPTu (`getPackStats` v `NotifSheet`), „všetko vybavené" sa neukazuje.
// Chybové a bezpečnostné hlásenia a riadky AINUBISA (`.ntf-row--ai`: odpoveď pod citátom, oznam) ostávajú v jeho tmavom šate
// (brand.md §AINUBIS, cyan = systém), tu sa ich netýka nič. Podstránky: zoznam, „Všetky štatistiky" (`.sd-*` zo `StatsDetail`).
// Tmavá strana: bodkovaný lapis, papierové karty s čiernou perou (na tmavom podklade zlatá pera zaniká, preto `PERA_DARK`).
import { PACK_R, PACK_TEXT, PACK_SPACE as S, PACK_THEME as T, FONT_UI } from './packTheme';
import { AINUBIS } from './ainubisSkin';
import { LAPIS } from './navGoldSkin';
import { BACK } from './BackButton';
import { SNIFFER_HEART } from './buddy/SnifferLogo';

const PERA_DARK = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,black 55%,transparent)`;
const AV = 64;
const P3D_INK = '#2a1608';
const P3D_GOLD_SOLID = '#A3782B';
const GOLD_HI = '#F5C73D';
const CARD_DARK = `border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.frame}px;background:var(--p3d-card);box-shadow:${PERA_DARK};color:var(--p3d-ink);`;

export const NTF_P3D_CSS = `
html.papyrus3d .ntf-sheet.pk-stage{--pk-stage:${LAPIS.deep};background:radial-gradient(circle at 1px 1px,color-mix(in srgb,${LAPIS.ink} 22%,transparent) 1px,transparent 1.6px) 0 0/22px 22px,linear-gradient(180deg,${LAPIS.edge},${LAPIS.deep});color:${LAPIS.ink};}
html.papyrus3d .ntf-ttl{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;text-align:center;color:${LAPIS.ink};}
html.papyrus3d .ntf-top{padding-right:${BACK.dia + S.lg}px;}
/* pás pilulky (23. 11. 2026): PLNÉ farby podľa významu (zlatá = psy a míľnik, lapis = krajiny, zelená = prírastok, fialová = výlety, terakota = SOS, cyan = oznam AINUBISA), biely text okrem zlatej. Ťuk zastaví / pustí točenie. */
html.papyrus3d .ntf-tick{cursor:pointer;}
html.papyrus3d .ntf-tick.is-paused .ntf-tick-track{animation-play-state:paused;}
html.papyrus3d .ntf-pill{--bg:${LAPIS.grad};height:32px;gap:${S.sm}px;padding:0 ${S.md}px 0 ${S.xs}px;border:2px solid color-mix(in srgb,white 35%,transparent);background:var(--bg);color:#fff;font-weight:600;box-shadow:0 2px 0 color-mix(in srgb,black 25%,transparent);}
html.papyrus3d .ntf-pill img{width:24px;height:24px;object-fit:contain;flex:none;}
html.papyrus3d .ntf-pill--gold{--bg:linear-gradient(180deg,#D8AE55,${P3D_GOLD_SOLID});color:${P3D_INK};}
html.papyrus3d .ntf-pill--lapis{--bg:linear-gradient(180deg,#2D5BC4,#1F3A8A);}
html.papyrus3d .ntf-pill--up{--bg:linear-gradient(180deg,#4F9462,${T.growGreen});}
html.papyrus3d .ntf-pill--red{--bg:linear-gradient(180deg,#C4694F,${T.alertRed});}
html.papyrus3d .ntf-pill--purple{--bg:linear-gradient(180deg,#9147D6,${T.tripPurple});}
html.papyrus3d .ntf-pill--news{--bg:linear-gradient(180deg,${AINUBIS.cyan},#0E8FA8);color:${P3D_INK};cursor:pointer;}
html.papyrus3d .ntf-pill b,html.papyrus3d .ntf-pill--gold b,html.papyrus3d .ntf-pill--up b,html.papyrus3d .ntf-pill--lapis b{color:inherit;font-weight:600;}
/* ZÁLOŽKY: pilulky, aktívna = zlatá plocha */
html.papyrus3d .ntf-tabs{display:flex;flex-wrap:wrap;gap:${S.sm}px;flex:0 0 auto;margin:${S.sm}px 0 0;padding:${S.xs}px ${S.lg}px;scrollbar-width:none;}
html.papyrus3d .ntf-tabs::-webkit-scrollbar{display:none;}
html.papyrus3d .ntf-tabs button{flex:none;height:32px;padding:0 ${S.md}px;border-radius:${PACK_R.pill}px;border:2px solid color-mix(in srgb,${LAPIS.ink} 45%,transparent);background:transparent;color:${LAPIS.ink};cursor:pointer;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;white-space:nowrap;}
html.papyrus3d .ntf-tabs button.on{background:${GOLD_HI};border-color:${GOLD_HI};color:${P3D_INK};}
/* panel v zozname: výška podľa obsahu, nie celá strana — hore štvrtina s prírastkom, pod ňou len to, čo je naozaj nové */
html.papyrus3d .ntf-sheet.ntf-compact{height:auto;max-height:100%;align-self:flex-start;border-radius:0 0 ${PACK_R.card}px ${PACK_R.card}px;box-shadow:0 8px 0 color-mix(in srgb,black 45%,transparent);}
html.papyrus3d .ntf-compact .ntf-top{padding-top:calc(env(safe-area-inset-top,0px) + ${S.sm}px);padding-bottom:0;}
html.papyrus3d .ntf-compact .ntf-tick{margin-top:${S.lg}px;} /* Matej 23. 11.: pilulky boli nalepené pod nadpisom a dotýkali sa šípky späť */
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
html.papyrus3d .ntf-prog b{font-weight:600;white-space:nowrap;color:${GOLD_HI};}
html.papyrus3d .ntf-prog-bar{display:block;height:12px;border-radius:${PACK_R.pill}px;border:2px solid ${LAPIS.ink};background:color-mix(in srgb,black 45%,transparent);overflow:hidden;}
html.papyrus3d .ntf-prog-bar .pk-progress__fill{display:block;height:100%;border-radius:${PACK_R.pill}px;background:linear-gradient(90deg,#E69E1A,${GOLD_HI});}
/* nadpisy zoznamov (Čaká na teba, Pre teba, Nové, Skôr) */
html.papyrus3d .ntf-sec{font-size:${PACK_TEXT.label}px;font-weight:600;color:${LAPIS.ink};opacity:.8;letter-spacing:.22em;}
/* riadok upozornenia = papierová karta s čiernou perou (hárok .nt); červená bodka = nové */
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec),html.papyrus3d .ntf-row:not(.ntf-row--ai),html.papyrus3d .ntf-card{position:relative;min-height:68px;padding:${S.sm}px ${S.md}px;${CARD_DARK}border-color:var(--p3d-gold);box-shadow:var(--p3d-lift),0 8px 14px var(--p3d-sh);}
html.papyrus3d .ntf-real li:not(.ntf-li-ai):not(.ntf-li-sec){display:flex;align-items:center;}
html.papyrus3d .ntf-real li.ntf-li-sos > button{width:100%;padding:0;border:0 !important;background:none !important;border-radius:0 !important;}
html.papyrus3d .ntf-real li > button{flex:1;min-width:0;color:var(--p3d-ink);}
/* NOVÉ: zlatý lem s prstencom, pásik na ľavom okraji a pulzujúca bublinka na ikonke (červená = od členov, cyan = systém a AINUBIS, trieda ntf-cy) */
html.papyrus3d .ntf-real li.ntf-new{--bub:${SNIFFER_HEART};border-color:${GOLD_HI};box-shadow:var(--p3d-lift),0 0 0 3px color-mix(in srgb,${GOLD_HI} 35%,transparent),0 8px 14px var(--p3d-sh);}
html.papyrus3d .ntf-real li.ntf-cy{--bub:${AINUBIS.cyan};}
html.papyrus3d .ntf-real li.ntf-new::before{content:'';position:absolute;z-index:1;left:-2px;top:${S.md}px;bottom:${S.md}px;width:5px;border-radius:0 4px 4px 0;background:var(--bub);}
html.papyrus3d .ntf-bub{position:absolute;z-index:2;left:44px;top:${S.xs}px;width:14px;height:14px;border-radius:${PACK_R.pill}px;background:var(--bub,${SNIFFER_HEART});border:2px solid ${T.card};animation:ntf-bub 1.8s ease-out infinite;}
@keyframes ntf-bub{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--bub,${SNIFFER_HEART}) 60%,transparent);}100%{box-shadow:0 0 0 10px transparent;}}
@media (prefers-reduced-motion:reduce){html.papyrus3d .ntf-bub{animation:none;}}
html.papyrus3d .ntf-r{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:${S.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};white-space:nowrap;}
html.papyrus3d .ntf-nw{padding:0 ${S.sm}px;border-radius:${PACK_R.pill}px;background:var(--bub,${SNIFFER_HEART});color:#fff;font-size:${PACK_TEXT.micro}px;line-height:16px;}
html.papyrus3d .ntf-cy .ntf-nw{color:${P3D_INK};}
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
/* NAJNOVŠÍ ČLEN: fotka s #číslom vľavo, meno, tlačidlo Vitaj NAPRAVO; labka máva ako ruka (kýve sa okolo spodku, ~2,6 s, potom pauza) */
html.papyrus3d .ntf-wel{display:grid;grid-template-columns:96px minmax(0,1fr) auto;gap:${S.md}px;align-items:center;padding:${S.md}px;margin-top:${S.md}px;border-radius:${PACK_R.card}px;position:relative;background:linear-gradient(135deg,#F7E9C6,#EBD3A0);color:var(--p3d-ink);border:2.5px solid ${GOLD_HI};
  box-shadow:var(--p3d-lift),0 0 0 3px color-mix(in srgb,${GOLD_HI} 35%,transparent),0 10px 18px var(--p3d-sh);max-height:220px;overflow:visible;transition:opacity .5s,transform .5s,max-height .5s .3s,margin .5s .3s,padding .5s .3s;}
html.papyrus3d .ntf-wel-ph{position:relative;width:96px;height:96px;margin:-${S.lg}px 0 -${S.sm}px -${S.lg}px;padding:0;border:0;background:none;cursor:pointer;transform:rotate(-3deg);} /* Matej 23. 11.: fotka hranatá, väčšia, trošku presahuje kartu */
html.papyrus3d .ntf-wel-ph img{width:96px;height:96px;border-radius:${PACK_R.tile}px;object-fit:cover;border:3px solid var(--p3d-gold);display:block;box-shadow:0 6px 0 var(--p3d-gold),0 10px 16px var(--p3d-sh);}
html.papyrus3d .ntf-wel-ph b{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);padding:0 ${S.sm}px;border-radius:${PACK_R.pill}px;background:${LAPIS.grad};color:${LAPIS.ink};font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;line-height:18px;white-space:nowrap;}
html.papyrus3d .ntf-wel-tx{min-width:0;display:flex;flex-direction:column;gap:${S.xs}px;}
html.papyrus3d .ntf-wel-nm{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;line-height:1.1;overflow-wrap:anywhere;}
html.papyrus3d .ntf-wel-tx small{font-size:${PACK_TEXT.label}px;color:${T.inkWarm};}
html.papyrus3d .ntf-wel-ok{display:none;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.growGreen};}
html.papyrus3d .ntf-wel-btn{display:flex;flex-direction:column;align-items:center;gap:${S.xs}px;padding:${S.xs}px;border-radius:${PACK_R.tile}px;border:0;background:none;color:var(--p3d-ink);cursor:pointer;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.body}px;line-height:1;} /* Matej 23. 11.: labka nie v modrom bloku, normálne na bledej ploche */
html.papyrus3d .ntf-wel-btn img{width:48px;height:48px;filter:drop-shadow(0 3px 0 rgba(0,0,0,.18));object-fit:contain;transform-origin:50% 90%;animation:ntf-mav 2.6s ease-in-out infinite;}
@keyframes ntf-mav{0%,55%,100%{transform:rotate(0);}8%{transform:rotate(18deg);}16%{transform:rotate(-10deg);}24%{transform:rotate(18deg);}32%{transform:rotate(-6deg);}40%{transform:rotate(10deg);}48%{transform:rotate(0);}}
html.papyrus3d .ntf-wel-btn:active img{animation-duration:.6s;}
html.papyrus3d .ntf-wel.thx{grid-template-columns:96px minmax(0,1fr);}
html.papyrus3d .ntf-wel.thx .ntf-wel-btn{display:none;}
html.papyrus3d .ntf-wel.thx .ntf-wel-ok{display:block;}
html.papyrus3d .ntf-wel.done{opacity:0;transform:scale(.96);max-height:0;overflow:hidden;margin:-${S.sm}px 0;padding-top:0;padding-bottom:0;border-width:0;}
@media (prefers-reduced-motion:reduce){html.papyrus3d .ntf-wel-btn img{animation:none;}html.papyrus3d .ntf-wel{transition:none;}}
/* VÍZIA / PRÁVE PRACUJEME / HOTOVO: karta s bohatou ikonkou 52 px, nadpis, text max 3 riadky, vpravo počty alebo dátum */
html.papyrus3d .ntf-vz-list{display:flex;flex-direction:column;gap:${S.md}px;}
html.papyrus3d .ntf-vz{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:${S.md}px;align-items:center;width:100%;text-align:left;cursor:pointer;font:inherit;}
html.papyrus3d .ntf-vz-ico{width:52px;height:52px;object-fit:contain;display:block;}
html.papyrus3d .ntf-vz-tx{min-width:0;display:flex;flex-direction:column;gap:${S.xs}px;}
html.papyrus3d .ntf-vz-tx b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.lead}px;line-height:1.15;overflow-wrap:anywhere;}
html.papyrus3d .ntf-vz-p{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;line-height:1.35;color:${T.inkWarm};display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}
html.papyrus3d .ntf-vz-r{display:flex;flex-direction:column;align-items:flex-end;gap:${S.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${T.inkWarm};white-space:nowrap;}
html.papyrus3d .ntf-vz-r span{display:inline-flex;align-items:center;gap:${S.xs}px;}
html.papyrus3d .ntf-vz-more{font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;font-weight:600;color:${LAPIS.edge};text-decoration:underline;text-underline-offset:2px;} /* Matej 23. 11.: len prvý riadok + Čítať viac, ťuk = príspevok vo FEEDe */
html.papyrus3d .ntf-vz-ms{margin:${S.sm}px 0 0;}
html.papyrus3d .ntf-vz-empty{margin:0;padding:${S.lg}px;text-align:center;font-family:${FONT_UI};font-size:${PACK_TEXT.body}px;line-height:1.4;color:${LAPIS.ink};}
html.papyrus3d .ntf-vz-sk{height:72px;border-radius:${PACK_R.tile}px;}
`;
