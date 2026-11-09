// ŠAT AINUBIS 3D — chat a guľa (hárok plany/nakresy/ainubis-3d-2026-11-09, skupina „Chat“, základ `zaklad.ts`). Len pod APP_NEW.
// Všetko visí na `html.papyrus3d`, takže web na dogypt.com sa nezmení ani o pixel (`AinubisWidget.css` platí aj tam).
// Značkovanie dodáva `components/ainubis/AinubisWidget.tsx`; tu sa len prekrýva vzhľad existujúcich tried `.ainubis-*`.
// Tvary a farby berie `M3` a `b3()` zo základu. Veľkosti z hárku sú zaokrúhlené na stupnice (15→14, 19→20, 21→20).
import { AINUBIS as A } from '@/components/pack/ainubisSkin';
import { M3, b3 } from './zaklad';

const P = 'html.papyrus3d';
const UI = `'Space Grotesk',sans-serif`;
const W = '.ainubis-panel';
/** Obrazovka chatu = celá plocha bez rámu (v hárku telefón; panel v rovine nemá vlastný okraj). */
const PLANE = `${P} ${W}.ainubis-panel--plane`;

export const AI3D_CHAT_CSS = `
/* ── Panel v rovine: bez rámu, pozadie dáva stránka ── */
${PLANE}{background:transparent;border:0;border-radius:0;box-shadow:none;}
${P} ${W}{border-color:var(--ai-edge);}
/* Rovinu už odsadzuje stránka (PAGE_AIR 16): panel si vodorovné odsadenie nepridáva druhýkrát. */
${PLANE} .ainubis-panel__header,${PLANE} .ainubis-composer{padding-left:0;padding-right:0;}
${PLANE} .ainubis-panel__learning,${PLANE} .ainubis-panel__takeover,${PLANE} .ainubis-topics,${PLANE} .ainubis-gate{margin-left:0;margin-right:0;}
${PLANE} .ainubis-panel__body{padding-left:0;padding-right:0;}

/* ── Horný rad: späť, história, nový rozhovor | nastavenia (3D neutrálne guľaté tlačidlá 52) ── */
${P} .ainubis-panel__header{border:0;border-image:none;padding:12px 16px 8px;gap:8px;}
${P} .ainubis-panel__tools{gap:8px;}
${b3(`${P} .ainubis-panel__tool`, 'nt', '50%', 5)}
${P} .ainubis-panel__tool{width:52px;height:52px;flex:none;padding:0;}
${P} .ainubis-panel__tool:hover{background:linear-gradient(180deg,#16324A,#0A1622);color:${A.ink};}
${P} .ainubis-panel__tool .ainubis-tool-ico.ainubis-sys{width:30px;height:30px;margin:0;}
${b3(`${P} .ainubis-panel__close`, 'nt', '50%', 5)}
${P} .ainubis-panel__close{width:44px;height:44px;padding:0;color:${A.ink};}
${P} .ainubis-panel__move{color:${A.cyan};}

/* ── Beta riadok: zlatý ako .beta ── */
${P} .ainubis-panel__learning{margin:0 16px;padding:8px 12px;border:1.5px solid rgba(245,199,61,.45);border-radius:12px;background:rgba(245,199,61,.10);font:500 12px/1.4 ${UI};letter-spacing:0;text-transform:none;color:var(--ainubis-cta-a);text-align:center;}

/* ── Telo, úvod ── */
${P} .ainubis-panel__body{padding:16px;gap:12px;}
${P} .ainubis-intro{padding:0;gap:8px;}
${P} .ainubis-intro__badge{width:132px;height:132px;border-radius:0;background:none;border:0;margin:0;box-shadow:none;filter:drop-shadow(0 6px 14px rgba(${A.cyanRGB},.5));}
${P} .ainubis-intro__name{${M3.h}letter-spacing:.08em;text-indent:0;text-shadow:none;}
${P} .ainubis-intro__name .ainubis-ai{text-shadow:0 0 14px rgba(${A.cyanRGB},.75);}
${P} .ainubis-intro__rule{display:none;}

/* ── Bubliny: stroj bbAi, človek bbMe ── */
${P} .ainubis-msg{padding:12px 14px;border-radius:16px;font:500 14px/1.45 ${UI};}
${P} .ainubis-msg--assistant{${M3.bbAi}}
${P} .ainubis-msg--user{${M3.bbMe}}
${P} .ainubis-panel--left .ainubis-msg--assistant{${M3.bbAi}}
${P} .ainubis-panel--left .ainubis-msg--user{${M3.bbMe}}
${P} .ainubis-msg__link{color:${A.cyan};}
${P} .ainubis-msg--user .ainubis-msg__link{color:#04121A;}
/* Výpadok: bublina stroja so zlatým lemom */
${P} .ainubis-msg--system{align-self:flex-start;${M3.bbAi}border-color:var(--ainubis-cta-a);box-shadow:0 0 0 1.5px var(--ai-out),0 4px 0 1.5px #8A5A0E;color:${A.ink};text-align:left;font:500 14px/1.45 ${UI};}
${P} .ainubis-msg__devotion{display:none;}
${P} .ainubis-msg__image{border-radius:12px;}
/* Avatar v rade a riadok „ňuchá stopu“: pes bez kruhu */
${P} .ainubis-row{gap:8px;}
${P} .ainubis-row__avatar{width:32px;height:32px;border:0;border-radius:0;background:none;margin:0;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .ainubis-row__avatar--gap{filter:none;}
${P} .ainubis-typing{font:500 12px/1.4 ${UI};letter-spacing:0;text-transform:none;color:${A.cyan};align-self:center;}
${P} .ainubis-day{font:600 12px ${UI};letter-spacing:.18em;color:${A.cyan};}
${P} .ainubis-panel__takeover{margin:0 16px;border:1.5px solid rgba(245,199,61,.45);border-radius:12px;}
/* Terč v uvítacej bubline = malé neutrálne 3D tlačidlo */
${b3(`${P} .ainubis-msg__target`, 'nt', '14px', 4)}
${P} .ainubis-msg__target{width:44px;height:44px;margin:0 12px 4px 0;color:${A.ink};}
${P} .ainubis-msg__target .ainubis-target-ico.ainubis-sys{width:30px;height:30px;margin:0;}

/* ── Čipy tém a e-mail hosťa ── */
${P} .ainubis-topics{margin:0 16px 16px;justify-content:center;gap:10px;}
${b3(`${P} .ainubis-topic`, 'nt', '14px', 4)}
${P} .ainubis-topic{height:44px;padding:0 14px;gap:8px;font-size:16px;}
${P} .ainubis-topic:hover{transform:none;border-color:var(--ai-edge);background:linear-gradient(180deg,#16324A,#0A1622);}
${P} .ainubis-topic__ico.ainubis-sys{width:28px;height:28px;margin:0;}
${P} .ainubis-gate{margin:0 16px 12px;padding:0;gap:8px;border:0;background:none;align-items:center;}
${P} .ainubis-gate__input{${M3.field}flex:1 1 160px;height:auto;padding:0 14px;}
${P} .ainubis-gate__input--err{border-color:#FF8A7A;}
${b3(`${P} .ainubis-gate__btn`, 'or', '14px', 6)}
${P} .ainubis-gate__btn{height:54px;padding:0 16px;font-size:16px;}
${P} .ainubis-gate__err{color:#FF8A7A;}
${P} .ainubis-suggestion{border-radius:14px;}

/* ── Vstupný pás dole: foto, poloha (označ problém), pole, odoslať ── */
${P} .ainubis-composer{border-top:3px solid var(--ai-edge);background:var(--ai-sheet);padding:12px 16px 20px;gap:8px;}
${P} .ainubis-composer__row{gap:8px;align-items:flex-end;}
${b3(`${P} .ainubis-composer__icon-btn`, 'nt', '14px', 5)}
${P} .ainubis-composer__icon-btn{width:52px;height:52px;padding:0;color:${A.ink};}
${P} .ainubis-composer__icon-btn:hover{border-color:var(--ai-edge);color:${A.ink};}
${b3(`${P} .ainubis-composer__send`, 'or', '14px', 5)}
${P} .ainubis-composer__send:hover{color:${A.ctaInk};border-color:${A.ctaInk};}
${P} .ainubis-composer__send:disabled{opacity:.45;box-shadow:inset 0 2px 0 var(--ai-glow),inset 0 -4px 0 rgba(0,0,0,.18),0 5px 0 #8A5A0E;}
${P} span.ainubis-attach-ico.ainubis-sys,${P} span.ainubis-target-ico.ainubis-sys,${P} span.ainubis-send-ico.ainubis-sys{width:30px;height:30px;margin:0;}
${P} .ainubis-composer__textarea{${M3.field}flex:1 1 auto;min-height:52px;max-height:104px;padding:14px;}
${P} .ainubis-composer__textarea:focus{border-color:var(--ainubis-cta-a);box-shadow:var(--ai-inset),0 0 16px rgba(245,199,61,.2);}
${P} .ainubis-composer__preview img{border-radius:12px;}
${P} .ainubis-composer__mic-hint{font:500 12px/1.4 ${UI};}

/* ── Schváliť úpravu: zelené / neutrálne, námietka oranžová ── */
${P} .ainubis-review{gap:12px;margin-top:12px;}
${P} .ainubis-review__row{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:12px;}
${b3(`${P} .ainubis-review__btn`, 'nt', '16px', 5)}
${b3(`${P} .ainubis-review__btn--cta`, 'gr', '16px', 5)}
${b3(`${P} .ainubis-review__field ~ .ainubis-review__row .ainubis-review__btn--cta`, 'or', '16px', 5)}
${P} .ainubis-review__btn{min-height:52px;height:auto;padding:8px 12px;font-size:16px;line-height:1.1;letter-spacing:0;text-transform:none;}
${P} .ainubis-review__btn:disabled{opacity:.5;}
${P} .ainubis-review__field{${M3.field}min-height:104px;padding:12px 16px;resize:none;}
${P} .ainubis-review__err{color:#FF8A7A;font:500 12px/1.4 ${UI};}
${P} .ainubis-review__state{${M3.lab}}

/* ── Panely Rozhovory a Čo smie vidieť = panel zdola so závojom ── */
${P} .ainubis-layer{${M3.scrim}justify-content:flex-end;padding-top:0;border-radius:0;}
${P} .ainubis-layer__head{${M3.sheet}background:#0E2133;position:relative;justify-content:center;padding:28px 16px 8px;max-height:none;}
${P} .ainubis-layer__head::before{content:'';position:absolute;left:50%;top:10px;width:44px;height:5px;margin-left:-22px;border-radius:999px;${M3.grab}}
${P} .ainubis-layer__head .ainubis-panel__tool{display:none;}
${P} .ainubis-layer__head b{${M3.hSm}text-align:center;}
${P} .ainubis-layer__body{background:var(--ai-sheet);border-left:0;flex:0 1 auto;max-height:calc(92% - 80px);padding:12px 16px 28px;gap:12px;}
${P} .ainubis-layer__note{font:500 14px/1.4 ${UI};color:var(--ainubis-ink);opacity:.82;}
${P} .ainubis-layer__note--err{color:#FF8A7A;opacity:1;}
${P} .ainubis-layer__body .ainubis-day{align-self:flex-start;margin:4px 0 0;}
${b3(`${P} .ainubis-hist`, 'nt', '16px', 4)}
${P} .ainubis-hist{min-height:56px;padding:8px 14px;align-items:center;font:500 16px/1.3 ${UI};color:${A.ink};}
${P} .ainubis-hist small{font:500 12px ${UI};color:${A.cyan};}
${P} .ainubis-hist--on{background:linear-gradient(180deg,#123C4C,#0B2733);border-color:${A.cyan};box-shadow:inset 0 0 0 1px rgba(${A.cyanRGB},.45),0 4px 0 var(--ai-lip);}
/* prepínače: riadok s .tg */
${P} .ainubis-sw{padding:10px 0;border:0;border-bottom:1.5px solid rgba(${A.cyanRGB},.16);border-radius:0;background:none;min-height:56px;}
${P} .ainubis-sw:last-of-type{border-bottom:0;}
${P} .ainubis-sw__txt b{font:500 16px/1.3 ${UI};}
${P} .ainubis-sw__txt small{font:500 12px/1.4 ${UI};color:var(--ainubis-ink);opacity:.6;}
${P} .ainubis-sw i{box-sizing:content-box;width:43px;height:23px;border:2.5px solid var(--ai-edge);background:var(--ai-fld);}
${P} .ainubis-sw i::after{top:2px;left:2px;width:19px;height:19px;background:rgba(207,243,250,.55);}
${P} .ainubis-sw--on i{background:rgba(${A.cyanRGB},.22);}
${P} .ainubis-sw--on i::after{transform:translateX(20px);background:${A.cyan};box-shadow:0 0 8px ${A.cyan};}
/* zmazať = červené, zrušiť = neutrálne */
${b3(`${P} .ainubis-layer__danger`, 'rd', '16px', 6)}
${b3(`${P} .ainubis-layer__ghost`, 'nt', '16px', 6)}
${P} .ainubis-layer__danger,${P} .ainubis-layer__ghost{display:flex;align-items:center;justify-content:center;gap:8px;align-self:stretch;margin:8px 0 0;min-height:58px;padding:0 16px;font-size:20px;line-height:1;letter-spacing:0;text-transform:none;}
${P} .ainubis-layer__danger:disabled,${P} .ainubis-layer__ghost:disabled{opacity:.5;}
${P} .ainubis-layer__danger::before{content:'';width:30px;height:30px;flex:none;background:url(/icons/sys/kos.webp) center/contain no-repeat;}
${P} .ainubis-layer__confirm{margin:0;}
${P} .ainubis-layer__confirm p{font:500 14px/1.4 ${UI};color:var(--ainubis-ink);opacity:.82;margin:0 0 4px;}
${P} .ainubis-layer__confirm > div{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
${P} .ainubis-layer__confirm .ainubis-layer__danger::before{display:none;}

/* Šípka späť = tá istá tenká čiara ako v celej appke (ThinArrow, lock 9. 11.), nie hrubá samolepka. */
${P} span.ainubis-sys--spat{background-image:none;background-color:${A.ink};-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 6 L8.5 12 L14.5 18'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 6 L8.5 12 L14.5 18'/%3E%3C/svg%3E") center/contain no-repeat;}

/* ── Označ problém: bublina hore nad obsahom ── */
${P} .ainubis-target-bar{display:grid;grid-template-columns:52px minmax(0,1fr) minmax(0,1fr);gap:8px 12px;align-items:center;width:calc(100vw - 24px);max-width:480px;padding:12px;text-align:left;${M3.bub}font:500 14px/1.4 ${UI};color:${A.inkDim};}
${P} .ainubis-target-face{grid-row:1 / 3;width:52px;height:52px;filter:drop-shadow(0 3px 2px var(--ai-sh));}
${P} .ainubis-target-bar span{grid-column:2 / -1;flex-basis:auto;}
${b3(`${P} .ainubis-target-bar button`, 'nt', '14px', 4)}
${b3(`${P} .ainubis-target-bar span + button`, 'or', '14px', 4)}
${P} .ainubis-target-bar button{min-height:44px;padding:4px 8px;font-size:16px;line-height:1.1;}

/* ── Guľa v rohu: pes bez kruhu, cyan bodka pri neprečítanom ── */
${P} .ainubis-launcher{width:70px;height:70px;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible;animation:none;filter:drop-shadow(0 4px 3px var(--ai-sh));}
${P} .ainubis-launcher:hover,${P} .ainubis-launcher:focus-visible{box-shadow:none;transform:scale(1.04);}
${P} .ainubis-launcher .ainubis-eye{width:70px;height:70px;}
${P} .ainubis-launcher .ainubis-badge{top:6px;right:6px;min-width:0;width:14px;height:14px;padding:0;font-size:0;border:0;background:${A.cyan};box-shadow:0 0 0 2px #071019,0 0 8px ${A.cyan};}
`;
