// SOS — šat PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09, skupina J).
// Šat je vrstva: `html.papyrus3d` existuje len pod `APP_NEW`, web dogypt.com tieto pravidlá nikdy nezasiahnu.
// 🔴 ČERVENÁ JE VÝZNAM (`T.sosRed*`): vyhlásiť pátranie, ZAVOLAŤ, pás STRATIL SA zostávajú červené, šat im mení len tvar.
// Tlačidlá majú v kóde svoje triedy (`.sos-cta*`, `.sos-opt*`), preto ich nesie CSS rovnakým receptom ako `.pk-b3` (premenné --b3-*).
import { PACK_R, PACK_TEXT, PACK_SPACE as S, PACK_THEME as T } from '@/components/pack/packTheme';
import { LAPIS } from '@/components/pack/navGoldSkin';

const V = (a: string, b: string, p: string, l: string, i: string) => `--b3-a:${a};--b3-b:${b};--b3-p:${p};--b3-l:${l};--b3-i:${i};`;
const PAPER = V('var(--p3d-paper-hi)', 'var(--p3d-paper)', 'var(--p3d-gold-solid)', 'var(--p3d-ink)', 'var(--p3d-ink)');
const LAPIS_V = V(`color-mix(in srgb,${LAPIS.edge} 72%,white)`, LAPIS.deep, `color-mix(in srgb,${LAPIS.deep} 60%,black)`, LAPIS.ink, LAPIS.ink);
const RED_V = V(`color-mix(in srgb,${T.sosRed} 62%,white)`, T.sosRed, T.sosRedDark, 'var(--p3d-ink)', 'white');
const GREEN_V = V(`color-mix(in srgb,${T.growGreen} 66%,white)`, T.growGreen, `color-mix(in srgb,${T.growGreen} 62%,black)`, 'var(--p3d-ink)', 'white');
const GOLD_V = V('color-mix(in srgb,var(--p3d-gold) 60%,white)', 'var(--p3d-gold)', 'var(--p3d-gold-ink)', 'var(--p3d-ink)', 'var(--p3d-ink)');

/** Tlačidlo 3D: tvar a perá; farbu nesú premenné --b3-*. */
const B3 = `border:2.5px solid var(--b3-l);border-radius:${PACK_R.card}px;background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 var(--b3-p),0 11px 14px var(--p3d-sh);`;
const PRESS = `transform:translateY(5px);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -2px 0 color-mix(in srgb,black 15%,transparent),0 1px 0 var(--b3-p),0 2px 4px var(--p3d-sh);`;
const PERA_SM = `inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)`;
const LAPIS_ON = `background:linear-gradient(180deg,color-mix(in srgb,${LAPIS.edge} 72%,white),${LAPIS.deep});border-color:${LAPIS.ink};color:${LAPIS.ink};box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,${LAPIS.deep} 60%,black);`;
const CARD = `border:2.5px solid var(--p3d-ink) !important;border-radius:${PACK_R.card}px !important;background:var(--p3d-card) !important;box-shadow:var(--p3d-b3) !important;`;
const ROW = `border:2.5px solid var(--p3d-ink) !important;border-radius:${PACK_R.card}px !important;background:var(--p3d-card) !important;box-shadow:${PERA_SM} !important;`;
const INSET = `background:var(--p3d-paper-hi);border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;box-shadow:var(--p3d-inset);`;

export const SOS_P3D_CSS = `
html.papyrus3d .sos-cta,html.papyrus3d .sos-opt{${PAPER}${LAPIS_V}${B3}font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;letter-spacing:0;text-transform:none;min-height:56px;}
html.papyrus3d .sos-cta:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta:active:not([disabled]),html.papyrus3d .sos-opt:active:not([disabled]){${PRESS}transform:translateY(5px);}
html.papyrus3d .sos-cta--red{${RED_V}}
html.papyrus3d .sos-cta--red:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--green,html.papyrus3d .sos-opt--alive{${GREEN_V}}
html.papyrus3d .sos-cta--green:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--gold{${GOLD_V}}
html.papyrus3d .sos-cta--tint{${LAPIS_V}}
html.papyrus3d .sos-cta--tint:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--ghost,html.papyrus3d .sos-opt--calm,html.papyrus3d .sos-opt--none{${PAPER}}
html.papyrus3d .sos-opt--none{color:var(--p3d-ink);min-height:56px;}
html.papyrus3d .sos-cta--ghost:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--sm{min-height:44px;font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .sos-cta[disabled],html.papyrus3d .sos-opt[disabled]{opacity:.55;}
html.papyrus3d .sos-two{gap:${S.md}px;}
html.papyrus3d .sos-two .sos-cta{padding:0 ${S.sm}px;}
/* nadpisy, texty */
html.papyrus3d .sos-h2{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .sos-eyebrow,html.papyrus3d .sosp-lbl,html.papyrus3d .vet-sec{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-p,html.papyrus3d .sos-small,html.papyrus3d .sos-dogsub,html.papyrus3d .vet-more{color:var(--p3d-ink);}
html.papyrus3d .sos-field > span{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-dogname{color:var(--p3d-ink);}
/* karta, riadok, fakt */
html.papyrus3d .sos-card:not(.sos-card--flat){${CARD}}
html.papyrus3d .sos-card--flat{border-bottom:0;}
html.papyrus3d .sos-row,html.papyrus3d .sos-diaryrow,html.papyrus3d .sos-ret{${ROW}}
html.papyrus3d .sos-num{${ROW}}
html.papyrus3d .sos-row b,html.papyrus3d .sos-diaryrow b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;color:var(--p3d-ink);}
html.papyrus3d .sos-row small,html.papyrus3d .sos-diaryrow small{color:var(--p3d-ink);}
html.papyrus3d .sos-num b{font-size:${PACK_TEXT.h1}px;color:var(--p3d-ink);}
html.papyrus3d .sos-num small{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-fact{border-top:1.5px solid var(--p3d-gold);}
html.papyrus3d .sos-fact small{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-pill{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
/* výber: dlaždica papyrus, vybraná lapis */
html.papyrus3d .sos-pick{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.tile}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${PERA_SM};}
html.papyrus3d .sos-pick.is-on{${LAPIS_ON}}
html.papyrus3d .sosn-dog span{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .sosn-dog{min-height:112px;}
html.papyrus3d .sosn-av{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .sosf-look{${INSET}padding:${S.xs}px;gap:${S.xs}px;}
html.papyrus3d .sosf-look button.sos-pick{border:0;box-shadow:none;background:none;border-radius:${PACK_R.tile}px;min-height:48px;font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;}
html.papyrus3d .sosf-look button.sos-pick.is-on{border:2.5px solid ${LAPIS.ink};${LAPIS_ON}}
html.papyrus3d .sosf-dirs button{min-height:48px;}
html.papyrus3d .sosf-dirs svg{stroke:currentColor;}
/* pole */
html.papyrus3d .sos-field .pf-field,html.papyrus3d .vet-where select.pf-field{${INSET}min-height:54px;color:var(--p3d-ink);font-weight:500;}
html.papyrus3d .sos-field textarea.pf-field{min-height:96px;}
html.papyrus3d .sosn-when .pf-field{height:54px;}
html.papyrus3d .sos-field .pf-field.is-bad{border-color:${T.sosRed};}
/* fotka, mapa */
html.papyrus3d .sos-photo,html.papyrus3d .sosn-map{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;}
html.papyrus3d .sosn-map{box-shadow:var(--p3d-b3);}
html.papyrus3d .sosn-loc.sos-cta{min-height:44px;}
/* pás STRATIL SA je červený blok na fotke: červená je význam */
html.papyrus3d .sos-hero{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.card}px;overflow:hidden;box-shadow:var(--p3d-b3);}
html.papyrus3d .sos-hero .sos-photo{border:0;border-radius:0;}
html.papyrus3d .sos-hero .sos-band{border-radius:0;border-top:2.5px solid var(--p3d-ink);text-align:center;}
html.papyrus3d .sos-band{border-radius:${PACK_R.card}px;text-align:center;}
html.papyrus3d .sos-band b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h1}px;letter-spacing:.02em;}
/* plán krokov */
html.papyrus3d .sosp-step{${ROW}}
html.papyrus3d .sosp-step.is-open{${CARD}}
html.papyrus3d .sosp-head b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;color:var(--p3d-ink);}
html.papyrus3d .sosp-ring i{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .sosp-step.is-done .sosp-ring i{background:${T.growGreen};border-color:var(--p3d-ink);}
html.papyrus3d .sosp-say{${INSET}color:var(--p3d-ink);}
html.papyrus3d .sosp-prog b{color:var(--p3d-gold-ink);}
html.papyrus3d .sosp-prog .pk-progress{height:16px;border:2px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .sosp-prog .pk-progress__fill{background:linear-gradient(90deg,${LAPIS.edge},color-mix(in srgb,${LAPIS.edge} 40%,white) 70%,white);}
html.papyrus3d .sosp-link,html.papyrus3d .sosp-report{color:${LAPIS.edge};}
/* pohotovosť */
html.papyrus3d .vet-chips{${INSET}padding:${S.xs}px;gap:${S.xs}px;}
html.papyrus3d .vet-chip{border:0;border-radius:${PACK_R.tile}px;color:var(--p3d-ink);font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .vet-chip.on{border:2.5px solid ${LAPIS.ink};${LAPIS_ON}}
html.papyrus3d .vet-row{${CARD}}
html.papyrus3d .vet-tap b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;color:var(--p3d-ink);}
html.papyrus3d .vet-tap small,html.papyrus3d .vet-g,html.papyrus3d .vet-web{color:var(--p3d-ink);}
html.papyrus3d .vet-eta{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .vet-pill--soft{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
html.papyrus3d .vet-acts .sos-cta{font-size:${PACK_TEXT.lead}px;}
html.papyrus3d .vet-nav a{border:2.5px solid var(--p3d-ink);border-radius:${PACK_R.tile}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${PERA_SM};}
html.papyrus3d .vet-warn{border:2.5px solid ${T.sosRed};}
`;

/** Výskyt SosButton popupu (šuplík SOS na každej obrazovke): rovnaká reč, červený riadok STRATIL SA zostáva červený. */
export const SOS_BUTTON_P3D_CSS = `
html.papyrus3d .sos-list{gap:${S.lg}px;}
html.papyrus3d .sos-list .sos-row{${ROW}min-height:64px;}
html.papyrus3d .sos-list .sos-row.lost{${RED_V}${B3.replace(/;/g, ' !important;')}}
html.papyrus3d .sos-list .sos-row.lost:active{filter:none;transform:translateY(5px);}
html.papyrus3d .sos-list .sos-row b{font-family:'LT Museum',serif;font-weight:400;font-size:${PACK_TEXT.h2}px;color:var(--p3d-ink);}
html.papyrus3d .sos-list .sos-row.lost b{color:white;}
html.papyrus3d .sos-list .sos-row small{padding:${S.xs}px ${S.md}px;border-radius:${PACK_R.pill}px;background:${LAPIS.deep};color:${LAPIS.ink};font-weight:600;}
html.papyrus3d .sos-list .sos-row.act{${ROW}}
html.papyrus3d .sos-list .sos-mine{color:${LAPIS.edge};font-size:${PACK_TEXT.body}px;}
html.papyrus3d .sos-ph{border:2.5px solid ${T.sosRed};}
`;
