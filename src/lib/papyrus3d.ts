// PÍSMO ŠATU PAPYRUS 3D — len pod `APP_NEW` (Matej 9. 11. 2026, rozhodnutie 3), volá sa z `main.tsx`. Web ostáva na Cinzeli.
// Licencia LT Museum: SIL OFL 1.1 (overené v súbore písma), text ide s appkou v `public/fonts/LT-Museum-OFL.txt`.
// Písmo: LT Museum Black namiesto Cinzelu aj Cinzel Decorative; rodiny ostávajú, stačí prekryť ich váhy.
// Veľkosť: Matej: „celkovo by som nadpisy zväčšil aj na CTA aj výlety a podobne (okrem mien vo feede alebo
// nepodstatných vecí, v ainubisovi je celkom dobrá veľkosť, ale pri /map zoznam je to dosť malé)".
// `size-adjust` na rodine Cinzel zväčší každý nadpis a CTA naraz bez zásahu do 375 miest v kóde.
// Decorative ho nemá, takže čo má ostať malé, stačí prehodiť naň (`BEZ_ZVACSENIA`).
const SUBOR = '/fonts/g/ltmuseum-black-test-v1.woff2';
const VAHY = [400, 500, 600, 700, 800, 900];
const ZVACSENIE = '116%'; // 12 → 14 · 14 → 16 · 16 → 18,5 · 20 → 23

const face = (rodina: string, navyse = '') => VAHY
  .map((w) => `@font-face{font-family:'${rodina}';font-weight:${w};font-style:normal;font-display:swap;${navyse}src:url(${SUBOR}) format('woff2')}`)
  .join('');

/** Cinzel, ktorý ostáva vo svojej veľkosti: mená vo feede, AINUBIS a čísla na mapových značkách. */
const BEZ_ZVACSENIA = [
  '.pfp-who b', '.pfm-who b', '.pft-who b', '.pfs-dog b', '.msg-row-name',
  '.wp-name', '.akc-railname', '.akc-seth h5', '.akc-srchd b', '.akv-sttl', '.akv-title', '.akv-zvn',
  '.akw-doc h2', '.akw-htop h1', '.zv-h', '.fai-q q', '.fai-b h3',
  '.leaflet-marker-icon [style*="Cinzel"]',
].join(',');

/** Space Grotesk tam, kde bol nadpis alebo údaj priveľmi malý. Stupnica: 10 → 12, 12 → 14. */
const VACSI_TEXT = `
.trp-bigcard-loc,.trp-mheader-cats button,.comm-mpill,.pkf-th,.pfs-row h2,.dv2-title,.dv2-eb,.wp-label{font-size:12px !important;}
.trp-bigcard-author,.tr-row,.tr-together,.vp-body,.vp-src,.vp-note{font-size:14px !important;}
.tr-sheet{max-height:100dvh;overflow-y:auto;}
/* AUDIT /pack 9. 11. 2026 (pripomienka 20): riadok „chýba: …“ v dlaždiciach DOG ID bol orezaný trojbodkou, text sa zalomí. */
.dic-ttl p{white-space:normal !important;overflow:visible !important;text-overflow:clip !important;}
/* AUDIT 2 (pripomienka 20, najdlhší preklad DE/FR/CS na 360): záložky Štatistiky | Triplist, záložky profilu a tlačidlá výletu. */
.tl-tabs{grid-template-columns:repeat(2,minmax(0,1fr)) !important;}
.tl-tab{min-width:0;}
.tl-tab-label{min-width:0;overflow-wrap:anywhere;hyphens:auto;text-align:center;}
@media (max-width:400px){.tl-tab-label{font-size:16px !important;}}
.me-tabs>button{min-width:0;white-space:normal !important;overflow-wrap:anywhere;hyphens:auto;line-height:1.1;}
.pta-acts .pta-actbtn{padding-left:8px;padding-right:8px;}
/* AUDIT 2: dlhé mená psov (24 znakov) sa zalomia namiesto orezania trojbodkou alebo pretečenia. */
html.papyrus3d .dv2-st .dv2-nm{white-space:normal;max-width:100%;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;text-align:center;line-height:1.1;}
html.papyrus3d .did-namelast{white-space:normal;}
html.papyrus3d .me-hg .ba b{white-space:normal;overflow-wrap:anywhere;text-align:center;line-height:1.05;font-size:16px;min-width:0;max-width:100%;}
${BEZ_ZVACSENIA}{font-family:'Cinzel Decorative',serif !important;}
`;

// ── TLAČIDLO 3D — ŠAT PAPYRUS 3D (Matej 9. 11. 2026, hárok plany/nakresy/map-herne-2026-11-09) ──
// Len pod `APP_NEW`, web tieto triedy nikde nemá. V katalógu `PACK_BLOCKS` sa volá TLAČIDLO 3D.
// Tmavý obrys, svetlá hrana hore, spodná pera, pri stlačení klesne. Rodina `LT Museum` je tu menom
// schválne: nesmie dostať `size-adjust` z rodiny Cinzel (lib/papyrus3d.ts), inak by CTA narástlo o 16 %.
const P3D_PAGE = { ink: '#2a1608', gold: '#C99A3F', goldInk: '#8a5a14', goldSolid: '#A3782B', paper: '#F3E4C4', paperHi: '#F9F2E3' };

export const B3_CSS = `
html.papyrus3d{--p3d-ink:${P3D_PAGE.ink};--p3d-gold:${P3D_PAGE.gold};--p3d-gold-ink:${P3D_PAGE.goldInk};--p3d-gold-solid:${P3D_PAGE.goldSolid};--p3d-paper:${P3D_PAGE.paper};--p3d-paper-hi:${P3D_PAGE.paperHi};
  --p3d-card:linear-gradient(180deg,${P3D_PAGE.paperHi},${P3D_PAGE.paper});--p3d-inset:inset 0 4px 5px rgba(42,22,8,.26);--p3d-pera:0 6px 0 ${P3D_PAGE.goldSolid},0 11px 14px rgba(0,0,0,.34);--p3d-lift:0 3px 0 ${P3D_PAGE.goldSolid};--p3d-sh:rgba(0,0,0,.34);--p3d-b3:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -4px 0 rgba(0,0,0,.15),var(--p3d-pera)}
html.papyrus3d .pdel-btn,html.papyrus3d .pdel-yes,html.papyrus3d .pdel-no{height:48px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;border-radius:16px;font:400 16px/1 'LT Museum',serif;text-transform:none;letter-spacing:0;cursor:pointer;box-shadow:inset 0 2px 0 rgba(255,255,255,.4),inset 0 -4px 0 rgba(0,0,0,.15),0 4px 0 var(--pdel-p)}
html.papyrus3d .pdel-btn,html.papyrus3d .pdel-yes{--pdel-p:#9E1522;color:#fff;border:2.5px solid ${P3D_PAGE.ink};background:linear-gradient(180deg,color-mix(in srgb,#C8202F 62%,white),#C8202F)}
html.papyrus3d .pdel-no{--pdel-p:${P3D_PAGE.goldSolid};color:${P3D_PAGE.ink};border:2.5px solid ${P3D_PAGE.ink};background:linear-gradient(180deg,#fff,${P3D_PAGE.paper})}
.pk-p3d-tops{display:flex;align-items:center;gap:0;padding:4px 6px;border-radius:999px;border:2.5px solid rgba(42,22,8,.45);background:color-mix(in srgb,${P3D_PAGE.gold} 24%,${P3D_PAGE.paper});box-shadow:inset 0 3px 4px rgba(42,22,8,.26)}
.pk-p3d-input{height:54px;display:flex;align-items:center;gap:8px;padding:0 16px;border-radius:16px;border:2.5px solid ${P3D_PAGE.ink};background:${P3D_PAGE.paperHi};box-shadow:var(--p3d-inset);font:500 16px 'Space Grotesk',sans-serif;color:${P3D_PAGE.ink}}
.pk-p3d-sw{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:4px;border-radius:16px;border:2.5px solid ${P3D_PAGE.ink};background:color-mix(in srgb,${P3D_PAGE.gold} 34%,${P3D_PAGE.paper});box-shadow:inset 0 4px 5px rgba(42,22,8,.3)}
.pk-p3d-sw>button.on{color:#EFD79A;background:linear-gradient(180deg,color-mix(in srgb,#16307A 72%,white),#0A1A4A);border:2.5px solid #EFD79A;box-shadow:inset 0 2px 0 rgba(255,255,255,.28),inset 0 -4px 0 rgba(0,0,0,.15),0 4px 0 #060F2C}
.pk-p3d-sw>button{height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;font:400 20px/1 'LT Museum',serif;color:${P3D_PAGE.ink}}
.pk-b3{--b3-r:16px;--b3-a:#fff;--b3-b:${P3D_PAGE.paper};--b3-p:${P3D_PAGE.goldSolid};--b3-l:${P3D_PAGE.ink};--b3-i:${P3D_PAGE.ink};
  position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;
  border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);
  font:400 20px/1 'LT Museum',serif;text-decoration:none;
  box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -4px 0 rgba(0,0,0,.15),0 6px 0 var(--b3-p),0 11px 14px rgba(0,0,0,.34);
  transition:transform .07s,box-shadow .07s}
.pk-b3:active:not(:disabled),.pk-b3.is-down{transform:translateY(5px);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -2px 0 rgba(0,0,0,.15),0 1px 0 var(--b3-p),0 2px 4px rgba(0,0,0,.34)}
.pk-b3:disabled{opacity:.55;cursor:default}
.pk-b3--round{--b3-r:50%}
.pk-b3--gold{--b3-a:color-mix(in srgb,#EFD79A 72%,white);--b3-b:${P3D_PAGE.gold};--b3-p:${P3D_PAGE.goldInk}}
.pk-b3--lapis{--b3-a:color-mix(in srgb,#16307A 72%,white);--b3-b:#0A1A4A;--b3-p:color-mix(in srgb,#0A1A4A 60%,black);--b3-l:#EFD79A;--b3-i:#EFD79A}
.pk-b3--paper{--b3-a:#fff;--b3-b:${P3D_PAGE.paper};--b3-p:${P3D_PAGE.goldSolid}}
.pk-b3--green{--b3-a:color-mix(in srgb,#3D7A4E 66%,white);--b3-b:#3D7A4E;--b3-p:color-mix(in srgb,#3D7A4E 62%,black);--b3-i:#fff}
.pk-b3--red{--b3-a:color-mix(in srgb,#C8202F 62%,white);--b3-b:#C8202F;--b3-p:#9E1522;--b3-i:#fff}
.pk-p3d-dock{position:absolute;inset:0;border-radius:20px;pointer-events:none;border:2.5px solid ${P3D_PAGE.ink};
  background:linear-gradient(180deg,${P3D_PAGE.paperHi},${P3D_PAGE.paper});box-shadow:inset 0 0 0 3px ${P3D_PAGE.gold},0 6px 0 ${P3D_PAGE.goldInk},0 12px 16px rgba(0,0,0,.34)}
`;

export function zapniPapyrus3d() {
  document.documentElement.classList.add('papyrus3d');
  const s = document.createElement('style');
  s.textContent = face('Cinzel', `size-adjust:${ZVACSENIE};`) + face('Cinzel Decorative') + face('LT Museum') + VACSI_TEXT + B3_CSS;
  document.head.appendChild(s);
}
