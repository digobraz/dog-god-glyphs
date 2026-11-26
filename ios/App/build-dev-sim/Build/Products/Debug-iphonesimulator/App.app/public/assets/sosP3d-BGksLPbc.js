import{m as o,v as r,s as a,L as s,b as p}from"./index-DriUOdZL.js";const t=(c,g,y,x,v)=>`--b3-a:${c};--b3-b:${g};--b3-p:${y};--b3-l:${x};--b3-i:${v};`,h=t("var(--p3d-paper-hi)","var(--p3d-paper)","var(--p3d-gold-solid)","var(--p3d-ink)","var(--p3d-ink)"),m=t(`color-mix(in srgb,${s.edge} 72%,white)`,s.deep,`color-mix(in srgb,${s.deep} 60%,black)`,s.ink,s.ink),u=t(`color-mix(in srgb,${p.sosRed} 62%,white)`,p.sosRed,p.sosRedDark,"var(--p3d-ink)","white"),k=t(`color-mix(in srgb,${p.growGreen} 66%,white)`,p.growGreen,`color-mix(in srgb,${p.growGreen} 62%,black)`,"var(--p3d-ink)","white"),f=t("color-mix(in srgb,var(--p3d-gold) 60%,white)","var(--p3d-gold)","var(--p3d-gold-ink)","var(--p3d-ink)","var(--p3d-ink)"),b=`border:2.5px solid var(--b3-l);border-radius:${o.card}px;background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 var(--b3-p),0 11px 14px var(--p3d-sh);`,$="transform:translateY(5px);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -2px 0 color-mix(in srgb,black 15%,transparent),0 1px 0 var(--b3-p),0 2px 4px var(--p3d-sh);",n="inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)",i=`background:linear-gradient(180deg,color-mix(in srgb,${s.edge} 72%,white),${s.deep});border-color:${s.ink};color:${s.ink};box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,${s.deep} 60%,black);`,l=`border:2.5px solid var(--p3d-ink) !important;border-radius:${o.card}px !important;background:var(--p3d-card) !important;box-shadow:var(--p3d-b3) !important;`,d=`border:2.5px solid var(--p3d-ink) !important;border-radius:${o.card}px !important;background:var(--p3d-card) !important;box-shadow:${n} !important;`,e=`background:var(--p3d-paper-hi);border:2.5px solid var(--p3d-ink);border-radius:${o.card}px;box-shadow:var(--p3d-inset);`,S=`
html.papyrus3d .sos-cta,html.papyrus3d .sos-opt{${h}${m}${b}font-family:'LT Museum',serif;font-weight:400;font-size:${r.h2}px;letter-spacing:0;text-transform:none;min-height:56px;}
html.papyrus3d .sos-cta:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta:active:not([disabled]),html.papyrus3d .sos-opt:active:not([disabled]){${$}transform:translateY(5px);}
html.papyrus3d .sos-cta--red{${u}}
html.papyrus3d .sos-cta--red:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--green,html.papyrus3d .sos-opt--alive{${k}}
html.papyrus3d .sos-cta--green:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--gold{${f}}
html.papyrus3d .sos-cta--tint{${m}}
html.papyrus3d .sos-cta--tint:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--ghost,html.papyrus3d .sos-opt--calm,html.papyrus3d .sos-opt--none{${h}}
html.papyrus3d .sos-opt--none{color:var(--p3d-ink);min-height:56px;}
html.papyrus3d .sos-cta--ghost:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .sos-cta--sm{min-height:44px;font-size:${r.lead}px;}
html.papyrus3d .sos-cta[disabled],html.papyrus3d .sos-opt[disabled]{opacity:.55;}
html.papyrus3d .sos-two{gap:${a.md}px;}
html.papyrus3d .sos-two .sos-cta{padding:0 ${a.sm}px;}
/* nadpisy, texty */
html.papyrus3d .sos-h2{font-family:'LT Museum',serif;font-weight:400;font-size:${r.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .sos-eyebrow,html.papyrus3d .sosp-lbl,html.papyrus3d .vet-sec{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-p,html.papyrus3d .sos-small,html.papyrus3d .sos-dogsub,html.papyrus3d .vet-more{color:var(--p3d-ink);}
html.papyrus3d .sos-field > span{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-dogname{color:var(--p3d-ink);}
/* karta, riadok, fakt */
html.papyrus3d .sos-card:not(.sos-card--flat){${l}}
html.papyrus3d .sos-card--flat{border-bottom:0;}
html.papyrus3d .sos-row,html.papyrus3d .sos-diaryrow,html.papyrus3d .sos-ret{${d}}
html.papyrus3d .sos-num{${d}}
html.papyrus3d .sos-row b,html.papyrus3d .sos-diaryrow b{font-family:'LT Museum',serif;font-weight:400;font-size:${r.h2}px;color:var(--p3d-ink);}
html.papyrus3d .sos-row small,html.papyrus3d .sos-diaryrow small{color:var(--p3d-ink);}
html.papyrus3d .sos-num b{font-size:${r.h1}px;color:var(--p3d-ink);}
html.papyrus3d .sos-num small{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-fact{border-top:1.5px solid var(--p3d-gold);}
html.papyrus3d .sos-fact small{color:var(--p3d-gold-ink);}
html.papyrus3d .sos-pill{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
/* výber: dlaždica papyrus, vybraná lapis */
html.papyrus3d .sos-pick{border:2.5px solid var(--p3d-ink);border-radius:${o.tile}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${n};}
html.papyrus3d .sos-pick.is-on{${i}}
html.papyrus3d .sosn-dog span{font-family:'LT Museum',serif;font-weight:400;font-size:${r.lead}px;}
html.papyrus3d .sosn-dog{min-height:56px;}
html.papyrus3d .sosn-av{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .sosf-look{${e}padding:${a.xs}px;gap:${a.xs}px;}
html.papyrus3d .sosf-look button.sos-pick{border:0;box-shadow:none;background:none;border-radius:${o.tile}px;min-height:48px;font-family:'LT Museum',serif;font-weight:400;font-size:${r.h2}px;}
html.papyrus3d .sosf-look button.sos-pick.is-on{border:2.5px solid ${s.ink};${i}}
html.papyrus3d .sosf-dirs button{min-height:48px;}
html.papyrus3d .sosf-dirs svg{stroke:currentColor;}
/* pole */
html.papyrus3d .sos-field .pf-field,html.papyrus3d .vet-where select.pf-field{${e}min-height:54px;color:var(--p3d-ink);font-weight:500;}
html.papyrus3d .sos-field textarea.pf-field{min-height:96px;}
html.papyrus3d .sosn-when .pf-field{height:54px;}
html.papyrus3d .sos-field .pf-field.is-bad{border-color:${p.sosRed};}
/* fotka, mapa */
html.papyrus3d .sos-photo,html.papyrus3d .sosn-map{border:2.5px solid var(--p3d-ink);border-radius:${o.card}px;}
html.papyrus3d .sosn-map{box-shadow:var(--p3d-b3);}
html.papyrus3d .sosn-loc.sos-cta{min-height:44px;}
/* pás STRATIL SA je červený blok na fotke: červená je význam */
html.papyrus3d .sos-hero{border:2.5px solid var(--p3d-ink);border-radius:${o.card}px;overflow:hidden;box-shadow:var(--p3d-b3);}
html.papyrus3d .sos-hero .sos-photo{border:0;border-radius:0;}
html.papyrus3d .sos-hero .sos-band{border-radius:0;border-top:2.5px solid var(--p3d-ink);text-align:center;}
html.papyrus3d .sos-band{border-radius:${o.card}px;text-align:center;}
html.papyrus3d .sos-band b{font-family:'LT Museum',serif;font-weight:400;font-size:${r.h1}px;letter-spacing:.02em;}
/* plán krokov */
html.papyrus3d .sosp-step{${d}}
html.papyrus3d .sosp-step.is-open{${l}}
html.papyrus3d .sosp-head b{font-family:'LT Museum',serif;font-weight:400;font-size:${r.h2}px;color:var(--p3d-ink);}
html.papyrus3d .sosp-ring i{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .sosp-step.is-done .sosp-ring i{background:${p.growGreen};border-color:var(--p3d-ink);}
html.papyrus3d .sosp-say{${e}color:var(--p3d-ink);}
html.papyrus3d .sosp-prog b{color:var(--p3d-gold-ink);}
html.papyrus3d .sosp-prog .pk-progress{height:16px;border:2px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .sosp-prog .pk-progress__fill{background:linear-gradient(90deg,${s.edge},color-mix(in srgb,${s.edge} 40%,white) 70%,white);}
html.papyrus3d .sosp-link,html.papyrus3d .sosp-report{color:${s.edge};}
/* pohotovosť */
html.papyrus3d .vet-chips{${e}padding:${a.xs}px;gap:${a.xs}px;}
html.papyrus3d .vet-chip{border:0;border-radius:${o.tile}px;color:var(--p3d-ink);font-family:'LT Museum',serif;font-weight:400;font-size:${r.lead}px;}
html.papyrus3d .vet-chip.on{border:2.5px solid ${s.ink};${i}}
html.papyrus3d .vet-row{${l}}
html.papyrus3d .vet-tap b{font-family:'LT Museum',serif;font-weight:400;font-size:${r.h2}px;color:var(--p3d-ink);}
html.papyrus3d .vet-tap small,html.papyrus3d .vet-g,html.papyrus3d .vet-web{color:var(--p3d-ink);}
html.papyrus3d .vet-eta{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .vet-pill--soft{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);color:var(--p3d-ink);}
html.papyrus3d .vet-acts .sos-cta{font-size:${r.lead}px;}
html.papyrus3d .vet-nav a{border:2.5px solid var(--p3d-ink);border-radius:${o.tile}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${n};}
html.papyrus3d .vet-warn{border:2.5px solid ${p.sosRed};}
`,T=`
html.papyrus3d .sos-list{gap:${a.lg}px;}
html.papyrus3d .sos-list .sos-row{${d}min-height:64px;}
html.papyrus3d .sos-list .sos-row.red{${u}${b.replace(/;/g," !important;")}}
html.papyrus3d .sos-list .sos-row.red:active{filter:none;transform:translateY(5px);}
html.papyrus3d .sos-list .sos-row b{font-family:'LT Museum',serif;font-weight:400;font-size:${r.h2}px;color:var(--p3d-ink);}
html.papyrus3d .sos-list .sos-row.red b{color:white;}
html.papyrus3d .sos-list .sos-row.red small.sos-offl{background:transparent;border:1.5px solid white;color:white;}
html.papyrus3d .sos-list .sos-row small{padding:${a.xs}px ${a.md}px;border-radius:${o.pill}px;background:${s.deep};color:${s.ink};font-weight:600;}
html.papyrus3d .sos-list .sos-row.act{${d}}
html.papyrus3d .sos-list .sos-mine{color:${s.edge};font-size:${r.body}px;}
html.papyrus3d .sos-ph{border:2.5px solid ${p.sosRed};}
`;export{T as S,S as a};
