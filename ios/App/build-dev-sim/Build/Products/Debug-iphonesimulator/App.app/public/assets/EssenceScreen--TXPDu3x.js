import{g as G,u as I,k as d,r as p,M as D,j as a}from"./index-DriUOdZL.js";import{u as q,F as $,a as Z}from"./flowDogPicker-C0gH0xe3.js";import{u as W}from"./useFlowGuard-BnknS19j.js";import{P as Y}from"./PageTopBar-3J3L1b0M.js";import{H as Q}from"./HeroglyphFrame-F7m3K15S.js";import{c as X,a as ee,d as oe}from"./flowPaleSkin-CJNdyjt-.js";import{F as ae,T as te}from"./flowTopicChips-Cvg2sMVx.js";import{u as se,F as ie,a as ne}from"./flowMedallion-C1OBUhVP.js";import{h as re}from"./hekthorFaces-myd4lVXL.js";import{H as le}from"./hektor-DznQ9VDK.js";import{k as pe,q as de,b as ke,d as ce,m as me,r as he,a as ue,c as ve,e as ye}from"./RankingSlot-B9f52iXE.js";import{m as v}from"./proxy-5uIz4xGy.js";import{A as C}from"./index-BPi12Ps7.js";import"./flowMode-B6eboter.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./CHARACTER-WATERLOVER-Be2FY-gi.js";import"./initialLetter-CIe-_dtl.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";import"./labTheme-DLctEqJ2.js";import"./NUMBER-11-BoEzuCvn.js";const fe=1400,T=420;function be(){const o=I();return p.useMemo(()=>[{key:"dogGender",label:o("heroglyph.flow.dogGender.title"),chip:o("heroglyph.flow.essence.chipGender"),ask:`${o("heroglyph.flow.dogGender.questionPrefix")} ${o("heroglyph.flow.dogGender.questionKing")} ${o("heroglyph.flow.dogGender.questionOr")} ${o("heroglyph.flow.dogGender.questionQueen")}${o("heroglyph.flow.dogGender.questionSuffix")}`,opts:[{v:"king",icon:pe,label:o("heroglyph.flow.dogGender.king"),sub:o("heroglyph.flow.essence.subKing")},{v:"queen",icon:de,label:o("heroglyph.flow.dogGender.queen"),sub:o("heroglyph.flow.essence.subQueen")}]},{key:"dogColour",label:o("heroglyph.flow.dogColour.title"),chip:o("heroglyph.flow.essence.chipColour"),ask:`${o("heroglyph.flow.dogColour.questionPrefix")} ${o("heroglyph.flow.dogColour.questionCoat")}${o("heroglyph.flow.dogColour.questionSuffix")}`,opts:[{v:"bright",icon:ke,label:o("heroglyph.flow.dogColour.bright"),sub:o("heroglyph.flow.dogColour.brightSub")},{v:"dark",icon:ce,label:o("heroglyph.flow.dogColour.dark"),sub:o("heroglyph.flow.dogColour.darkSub")},{v:"mix",icon:me,label:o("heroglyph.flow.dogColour.mix"),sub:o("heroglyph.flow.dogColour.mixSub")}]},{key:"dogFate",label:o("heroglyph.flow.dogFate.title"),chip:o("heroglyph.flow.essence.chipOrigin"),ask:o("heroglyph.flow.essence.askOrigin"),opts:[{v:"raised",icon:he,label:o("heroglyph.flow.dogFate.raised"),sub:o("heroglyph.flow.essence.subRaised")},{v:"rescued",icon:ue,label:o("heroglyph.flow.dogFate.rescued"),sub:o("heroglyph.flow.essence.subRescued")}]},{key:"dogBloodline",label:o("heroglyph.flow.dogBloodline.title"),chip:o("heroglyph.flow.essence.chipBloodline"),ask:`${o("heroglyph.flow.dogBloodline.questionPrefix")}${o("heroglyph.flow.dogBloodline.questionPure")}${o("heroglyph.flow.dogBloodline.questionOr")}${o("heroglyph.flow.dogBloodline.questionWild")}${o("heroglyph.flow.dogBloodline.questionSuffix")}`,opts:[{v:"aristocrat",icon:ve,label:o("heroglyph.flow.dogBloodline.aristocrat"),sub:o("heroglyph.flow.essence.subAristocrat")},{v:"mutt",icon:ye,label:o("heroglyph.flow.dogBloodline.mutt"),sub:o("heroglyph.flow.essence.subMutt")}]}],[o])}function Ze(){var N,P;const o=G(),M=I(),R=W(),k=be();d(e=>e.dogName),d(e=>e.dogPhotoUrl),d(e=>e.extraDogs),d(e=>e.mainDogPos);const x=d(e=>e.dogEssence),L=d(e=>e.setDogEssence),V=d(e=>e.setSelection),n=q(),[y,S]=p.useState(0),[m,c]=p.useState(0),[K,B]=p.useState({}),[i,O]=p.useState(null),h=p.useRef(null);p.useEffect(()=>()=>{h.current&&clearTimeout(h.current)},[]);const _=se(),l=n[Math.min(y,n.length-1)],r=(l==null?void 0:l.id)??D,f=x[r]||{},t=k[m];p.useEffect(()=>{i!==null||!t||B(e=>({...e,[r]:{...e[r]||{},[t.key]:!0}}))},[r,t,i]);const b=e=>k.every(s=>(x[e]||{})[s.key]),j=n.every(e=>b(e.id)),z=n.find(e=>!b(e.id)),E=e=>k.findIndex(s=>!(x[e]||{})[s.key]),U=e=>{if(!t)return;L(r,t.key,e),r===D&&V(t.key,e);const s={...f,[t.key]:e},u=k.findIndex(A=>!s[A.key]);if(u>=0){h.current=setTimeout(()=>c(u),T);return}const g=n.findIndex((A,F)=>F!==y&&!b(A.id));g>=0&&(h.current=setTimeout(()=>{O(g),h.current=setTimeout(()=>{S(g),c(Math.max(0,E(n[g].id))),O(null)},fe)},T))},w=e=>{if(e===y||i!==null)return;S(e);const s=E(n[e].id);c(s>=0?s:0)},H=()=>{if(m>0){c(m-1);return}o("/heroglyph/email")};if(!R)return null;const J=e=>{var u;const s=k[e];return f[s.key]?"done":e===m&&i===null?"todo":(u=K[r])!=null&&u[s.key]?"miss":"todo"};return a.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[a.jsxs("style",{children:[X,ie,ee,oe,$,ae,ge]}),a.jsx("div",{className:"hf-topbar flex-shrink-0",children:a.jsx(Y,{brandBack:!0,onBack:H})}),a.jsx("div",{className:"hf-stage",children:a.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center es-col",children:[a.jsxs(v.div,{className:"hf-speak es-speak",layout:!0,transition:{duration:.28},children:[a.jsx(ne,{src:re("essence"),size:_}),a.jsx("span",{className:"say",children:a.jsx(C,{mode:"wait",initial:!1,children:a.jsx(v.h2,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:{duration:.2},children:i!==null?`✓ ${l==null?void 0:l.name}`:t==null?void 0:t.ask},i!==null?"hand":t==null?void 0:t.key)})})]}),a.jsxs(v.div,{className:"hf-block hf-carved es-stack",initial:{opacity:0,top:12},animate:{opacity:1,top:0},transition:{duration:.35},children:[a.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),a.jsxs("div",{className:"hf-plate",children:[a.jsx(Z,{className:"es-who",dogs:n,cur:y,onGo:w,done:b(r)}),a.jsx("span",{className:"fdh-rule","aria-hidden":!0}),a.jsx(Q,{showOwner:!0,dogValues:f,ghostValues:le,pulseSlot:i===null?t==null?void 0:t.key:void 0,className:"hf-glyph es-glyph",style:{width:"var(--flow-glyph-w)"}}),a.jsx(te,{items:k.map((e,s)=>({key:e.key,label:e.chip,state:J(s)})),current:i===null?m:null,onGo:e=>i===null&&c(e)}),a.jsx("span",{className:"fdh-rule","aria-hidden":!0}),a.jsx(C,{mode:"wait",initial:!1,children:i!==null?a.jsxs(v.div,{className:"es-hand",initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0},transition:{duration:.25},children:[a.jsxs("b",{children:["✓ ",l==null?void 0:l.name]}),a.jsxs("span",{className:"es-next",children:[((N=n[i])==null?void 0:N.photo)&&a.jsx("img",{className:"es-face",src:n[i].photo,alt:""}),a.jsx("b",{children:(P=n[i])==null?void 0:P.name})]})]},"handover"):a.jsx(v.div,{className:"es-q",initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:{duration:.22},children:a.jsx("div",{className:`es-picks${((t==null?void 0:t.opts.length)??2)>2?" n3":""}`,children:t==null?void 0:t.opts.map(e=>a.jsxs("button",{type:"button",className:`hf-pick is-pale${f[t.key]===e.v?" on":""}`,onClick:()=>U(e.v),children:[a.jsx("span",{className:"well",children:a.jsx("img",{src:e.icon,alt:""})}),a.jsxs("span",{className:"tx",children:[e.label,e.sub&&a.jsx("em",{children:e.sub})]})]},e.v))})},`q-${t==null?void 0:t.key}`)}),a.jsx("div",{className:"es-act",children:a.jsx("button",{type:"button",className:`hf-cta hf-dock es-cta${j?"":" is-off"}`,"aria-disabled":!j,onClick:()=>{if(j){o("/heroglyph/breed");return}if(i!==null||!z)return;if(z.id!==r){w(n.findIndex(s=>s.id===z.id));return}const e=E(r);e>=0&&c(e)},children:M("heroglyph.flow.name.continue")})})]})]})]})})]})}const ge=`
/* ── VZDUCH NAD OBSAHOM = VZDUCH POD NÍM ──────────────────────────────────
   🔴 Matej 24. 9. (piate kolo): *„vycentroval obsah blokov tak aby bola medzera
   od progres baru po blok a od spodného okraja po blok totožná aby to vyzeralo
   súmerne (na každej obrazovke)"*. Medzitým tu stálo \`margin-top: 0\` (obsah
   ukotvený hore) — bola to odpoveď na *„aby sa to zmestilo hore"*, keď doska
   ešte merala 475 px a visela v strede. Po zoštíhlení na 427 px je súmerné
   rozloženie to isté ako „hore" a navyše to platí pre celý vstup.
   ⚠️ Nič sa tu preto NEPRETLÁČA — súmernosť robí spoločné
   \`.hf-stage > * { margin: auto }\` z \`FLOW_STAGE_CSS\`. Keby tu znova pribudlo
   vlastné pravidlo, rozíde sa táto obrazovka so zvyškom flow. */
/* ── KTO JE OPISOVANÝ ──────────────────────────────────────────────────────
   🔴 RIADOK (fotka · meno · ✓ · šípky) SA 25. 9. 2026 PRESŤAHOVAL do
      \`flowDogPicker.tsx\` — kroky 6 a 8 ho odvtedy majú tiež, a tri kópie
      jedného ovládača sú tri rôzne polohy tej istej šípky. Text sa PRESUNUL,
      nezmenil: \`.es-who\` → \`.fdh-row\`, \`.es-dogphoto\` → \`.fdh-photo\`,
      \`.es-name\` → \`.fdh-name\`, \`.es-rule\` → \`.fdh-rule\`.
   ⚠️ Odôvodnenia (mriežka namiesto centrovania, vlások okolo fotky, ustupujúce
      písmo pri dlhom mene) sú tam, nie tu. Zostáva tu LEN geometria, ktorou sa
      táto obrazovka od ostatných líši. */
/* ── BUBLINA S OTÁZKOU ─────────────────────────────────────────────────────
   Recept je \`.hf-speak\` z kroku 3; tu sa mení len STUPEŇ písma, a to vo
   VLASTNEJ triede. \`SPEAK.title\` (24) je spoločná hodnota pre celý vstup a
   nesie ju aj krok 3 — zdvihnutím či znížením by sa ticho zmenil aj on.
   \`container-type\` dovolí viazať stupeň na ŠÍRKU BUBLINY (cqw), nie na okno. */
.es-speak { container-type: inline-size; margin-bottom: 8px; }

/* ── ⛔️ DVA STĹPCE ZRUŠENÉ (Matej 24. 9., štvrté kolo) ────────────────────
   *„prečo ich dávaš vedľa seba keď majú byť pod sebou?"* — sem patrili od
   tretieho kola: pri šírke ≥ 1000 a výške ≤ 860 išla bublina VEDĽA dosky.
   Nebolo to rozhodnutie o vzhľade, bola to náhrada za výšku — stojatá stavba
   vtedy na jeho okne (1477×724) pretekala o 47 px a hrana vyzerala odseknutá.
   🔑 Dôvod zanikol tým, čo sa stalo o kolo neskôr: doska schudla 475 → 427 px
   a prestala plávať na stred. Premerané po zmene, stojato: **543 px obsahu do
   595 px miesta na jeho okne, rezerva 52 px** — a aj na 1280×700 ešte 28 px.
   ⚠️ Keby sa doska niekedy zase natiahla, riešením NIE JE vrátiť dva stĺpce,
   ale zmenšiť obsah — to je pravidlo \`PAGE_AIR\`. */
/* Doska vstupu má spoločný rozstup 14 px; tu je päť medzier pod sebou, takže
   dva pixely z každej sú na tejto obrazovke rozdiel jedného riadka. */
.es-stack .hf-plate { gap: 10px; }
/* ⚠️ ŽIADNE STUPŇOVANIE PODĽA VÝŠKY OKNA. Ráno tu stálo, že na nízkom okne
   ustúpi hlava aj Hektor (88/108/124/148 px). Matej to zamietol: *„nič sa tu
   nemení veľkosťou = je to súrodé bez zväčšovania alebo scvrkávania
   s minimálnymi okrajmi hore a dolu"*. Obrazovka má JEDNU veľkosť; keď sa
   nezmestí, roluje sa — rezervu od okraja drží \`PAGE_AIR\`. */
/* ⚠️ Spodná hranica 18 (bola 16) — na telefóne je clamp vždy na nej, takže je to
   jediné číslo, ktoré tam platí. Matej 24. 9. na kroku PATRÓN: *„na mobile môžme
   zväčšiť prvý blok aj foto aj písmo"*; prenesené sem, aby sa kroky nerozišli.
   Na PC sa nemení nič — tam 4,6cqw drží strop 20. */

/* ⚠️ Tu stála DRUHÁ definícia \`.es-who\` — ranná pilulka (gradient, plný zlatý
   rám, polomer 999) z prvej verzie prepínača. Po presune riadka do dosky
   prebíjala nový riadok a fotka s menom sedeli v „tabletke" vnútri dosky, teda
   rám v ráme. Dve definície tej istej triedy v jednom šate = ten istý rozchod,
   ktorý si vyžiadal zrušenie druhého \`.hf-pick\`. */
.es-face {
  flex: none; width: 28px; height: 28px; border-radius: 999px; object-fit: cover;
  box-shadow: 0 0 0 1.5px rgba(179, 130, 45, 0.75), inset 0 1px 2px rgba(0, 0, 0, 0.35);
}
.es-face--empty {
  display: grid; place-items: center; background: rgba(120, 86, 26, 0.14);
  font-family: 'Cinzel', serif; font-size: 13px; color: #8a5a14;
}

/* ── PÁS TÉM ───────────────────────────────────────────────────────────────
   Chipy s NÁZVOM, nie bodky (Matej 31. 8.): bodka povie „šesť krokov",
   názov povie „toto som už vybral a toto ešte nie". */
/* ── RÁM ───────────────────────────────────────────────────────────────────
   Farba je INKOUST papyrusu, nie \`--foreground\` z tmavého šatu: rám kreslí
   \`currentColor\`, takže na bledej doske by čierna pôsobila ako tlač, nie rytina. */
/* ⚠️ RÁM JE MENŠÍ, NIE PLNÁ ŠÍRKA (Matej 24. 9.: *„a heroglyf zmenšiť.. či?"* —
   áno). Je to najväčší jediný kus výšky na obrazovke a od chvíle, čo má
   podmalbu, sa dá čítať aj menší. 82 % šírky znamená ~18 % nižšiu výšku, lebo
   pomer strán drží \`viewBox\`. Pod 70 % už symboly v malých slotoch splývajú.
   🔴 **78 % PLATÍ LEN NA ŠIROKOM OKNE.** Na telefóne je doska sama úzka a
   sťahovanie na 78 % dalo rámu 63 px výšky proti 80 px na ostrom webe — symboly
   v malých slotoch zmizli. Do 560 px preto berie rám celú dosku, rovnako ako
   LIVE. Merané 24. 9. (šírka rámu × výška): 1280 → 448×120 (LIVE 516×138) ·
   1477×724 → 448×120 (LIVE 464×124) · 390 → 302×81 (LIVE 298×80).
   ⚠️ Číslo sa podáva ako premenná, lebo šírku zapisuje INLINE \`style\` na
   komponente — pravidlo z hárku by prehralo. */
/* 🔒 Šírku rámu určuje LOCK \`FLOW_GLYPH_CSS\` (\`--flow-glyph-w\`), nie táto
   obrazovka — na každom kroku musí byť heroglyf rovnako veľký (Matej 25. 9.).
   Vlastné percento sa sem NEVRACIA; keď sa obsah nezmestí, ustúpi obsah. */

/* 🔴 NA MOBILE 2×2, NIE RAD (Matej 24. 9.: *„na mobile dať 4 chipy 2 a 2 pod
   seba zarovnané"*). Rad štyroch sa na 390 px zalomil kde sa mu chcelo — raz
   3+1, raz 2+2 podľa dĺžky prekladu, takže pás nikdy nesedel. Mriežka to určí. */
/* Chipy tém sa 26. 9. 2026 presťahovali do \`flowTopicChips.tsx\` (FLOW_TOPIC_CSS)
   — majiteľ má ten istý pás. Tu predtým stáli obrysové chipy so zelenou/červenou
   výplňou a znakmi; nový šat je plná zlatá so zeleným krúžkom. */

/* ── OTÁZKA ────────────────────────────────────────────────────────────────*/
.es-q { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.es-ask {
  margin: 0; text-align: center; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 14px; line-height: 1.35; color: rgba(35, 22, 8, 0.90);
  text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
}
/* 🔴 ODPOVEDE SÚ VEDĽA SEBA A PLOCHA MÁ PEVNÚ VÝŠKU (Matej 24. 9., tretie kolo:
   *„nesedí mi to výškovo na PC, môžeš dať odpovede vedľa seba, nie pod seba"*).
   Pod sebou zaberali o jeden riadok viac, než na jeho okne (1477×724) bolo.
   ⚠️ Pevná výška \`--es-picks-h\` je to, čo drží Matejovo staršie *„nič sa tu
      nemení veľkosťou"*. Dve voľby v jednom rade a tri v dvoch radoch sú dve
      rôzne výšky; plocha je preto rovnaká vždy a dlaždice sa v nej NAŤAHUJÚ
      (\`stretch\`) — pri dvojici sú vyššie, pri trojici nižšie, ale doska stojí.
   ⚠️ Poradie pri farbe je Matejovo: *„tmavý, bledý v jednom riadku, mix
      samostatne v druhom"*. */
/* ⚠️ ROZOSTUP MEDZI DLAŽDICAMI JE VÄČŠÍ NEŽ MEDZI RIADKAMI (Matej 24. 9.:
   *„nemusia byť také veľké urob ich s väčšími rozostupmi"*) — \`gap: 8px 16px\`.
   Stĺpce dýchajú, ale tri voľby sa musia zmestiť do TEJ ISTEJ výšky ako dve,
   takže riadkový rozostup ostáva na 8. Obe čísla sú z \`PACK_SPACE\`. */
.es-picks {
  --es-picks-h: 104px; /* 124 → 104 (Matej 26. 9.: „jemne zmenšiť výšku výberových tlačidiel") */
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%;
  min-height: var(--es-picks-h); align-items: stretch;
}
/* ── TRI VOĽBY: JEDEN RAD TROCH (Matej 24. 9., šieste kolo) ───────────────
   Rozhodnutie padlo nad tromi cestami: *„tri vedľa seba v jednom rade"*. Dôvod
   je jeho vlastné zadanie o kolo skôr — *„ikonky zväčši tie sú podstatné"*.
   Predtým tu boli dva rady (2+1) stlačené do výšky dvojice, takže ikonka pri
   FARBE spadla na 22 px proti 40 px pri ostatných otázkach; rad bol viditeľne
   slabší než zvyšok vstupu, hoci doska stála.
   🔑 V jednom rade má trojica TÚ ISTÚ výšku aj ikonku ako dvojica — doska sa
   ďalej nehýbe a *„nič sa tu nemení veľkosťou"* platí.
   ⚠️ CENA, ktorú Matej odklepol: dlaždica je užšia (~165 px), takže TEXT IDE POD
   IKONKU. Kriesi to výnimku „ikonka nad text", ktorá 24. 9. ráno zanikla — vtedy
   ju rušil OPAČNÝ stav (voľby stáli vedľa seba a na text ostávalo 80 px).
   Platí LEN pre trojicu; dvojica drží riadok, ikonka vedľa textu. */
.es-picks.n3 { grid-template-columns: repeat(3, 1fr); }
.es-picks.n3 .hf-pick {
  flex-direction: column; justify-content: center; gap: 4px;
  padding: 6px 10px; text-align: center;
}
.es-picks.n3 .hf-pick .tx { font-size: 13px; letter-spacing: 0.04em; }
/* Jamka o kúsok menšia než pri dvojici — v stĺpci pod ňou stojí ešte text a do
   80 px sa 52 + riadok nezmestí (odmerané: 102 px, doska by sa hýbala o 22 px). */
.es-picks.n3 .hf-pick .well { width: 44px; height: 44px; }
.es-picks.n3 .hf-pick .well img { width: 34px; height: 34px; }
/* 🔴 PODNADPIS (Sun · Moon · Rainbow) V STĹPCI NEJDE — a nie je to strata:
   je to DOSLOVA to, čo kreslí ikonka nad ním. V riadku (dvojica, mobil) bol
   druhou informáciou vedľa mena; v stĺpci by bol treťou vrstvou pod obrázkom
   toho istého a zobral by presne tú výšku, ktorú potrebuje ikonka. */
/* 26. 9. večer Matej: *„chýba mi vysvetlenie symbolov miniatúrne pod názvy"* —
   podnadpis sa vracia aj do trojice; výška na neho je (104 px, jamka 44). */
.es-picks.n3 .hf-pick .tx em { display: block; }

/* 📱 NA MOBILE OSTÁVA 2+1 (Matej: *„na mobile to môžeš nechať tak aby to bolo ok
   s rozmermi (iné od PC)"*). Tri stĺpce by na 390 px mali po ~90 px a slovo
   RAINBOW sa doň nezmestí ani na dva riadky. */
/* ── 📱 MOBIL: VOĽBY SÚ POD SEBOU, JEDNA NA RIADOK (Matej 24. 9., siedme kolo) ─
   *„na pc je to ok ale na mobile to dajme predsa len do riadkov… aj pohlavie aj
   tam kde sú 3 možnosti na mobile máme rezervu a môžme zväčšiť výšku"*.
   Dovtedy mal mobil dva stĺpce ako PC (a pri troch voľbách 2+1), takže na 302 px
   dosky pripadlo na dlaždicu ~145 px — ikonka aj meno sa tlačili do polovice
   šírky, hoci POD nimi ostávalo 220 px nevyužitej výšky.
   🔑 PLOCHA JE PEVNÁ AJ TU (190 px) a rady sa naťahujú (\`grid-auto-rows: 1fr\`).
   Dve voľby ⇒ dva rady po 91, tri ⇒ tri po 58. Keby plocha rástla s počtom
   volieb, doska by medzi otázkami poskakovala — a to je to jediné, čo sa na
   tejto obrazovke nesmie hýbať.
   ⚠️ Toto je JEDINÉ miesto, kde sa mobil zámerne líši od PC (Matej: *„iné od
   PC"*) — na PC ostávajú dva stĺpce a trojica v jednom rade. */
/* ── 26. 9. 2026: VOĽBY VEDĽA SEBA NA MOBILE AJ PC, IKONKA HORE, NÁPIS DOLE ──
   Matej: *„tlačítka sú moc pri sebe, malé medzery, je treba ich dať vedľa seba aj
   na mobile aj PC, centrovať na stred, hore ikona dolu nápis"*. Prebíja riadky
   na mobile z 24. 9. (siedme kolo) — novší pokyn. Plocha je ďalej PEVNÁ, len
   nižšia: voľné miesto dostala rytina medzi chipmi a voľbami. */
@media (max-width: 559px) {
  .es-picks { --es-picks-h: 104px; gap: 12px; }
  .es-picks.n3 .hf-pick .tx { font-size: 12px; }
}
/* Symbol podstaty je KRESBA, nie ikonka rozhrania — jamka je preto väčšia než
   pri voľbe stavu psa a obrázok v nej dýcha. Riadok je aj vyšší: obrazovka
   pôsobila „scvrknuto" (Matej 24. 9.) a práve toto je jej najväčšia plocha. */
/* ── 🟨 ZLATÁ DLAŽDICA JE ODTERAZ SPOLOČNÁ — .hf-pick.is-gold (25. 9. 2026) ───
   Recept (plná brandová zlatá, tmavý inkoust, papyrusová jamka, lapisový lem pri
   výbere) aj s celým Matejovým odôvodnením sa PRESUNUL do FLOW_CARVE_CSS,
   lebo tú istú dlaždicu dostala aj otázka „žije tvoj pes?" na kroku MENO.
   Text je nezmenený, len sa presťahoval. Tu ostáva LEN geometria PODSTATY. */
.es-picks .hf-pick { flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 8px; gap: 4px; }
/* 🔴 IKONKA JE PODSTATA, NIE OZDOBA (Matej 24. 9.: *„ikonky zväčši tie sú
   podstatné"*). Je to ten istý symbol, aký sa o dva riadky vyššie vkreslí do
   rámu heroglyfu — čím väčší je tu, tým skôr si človek spojí voľbu s tým, čo mu
   pribudne do glyfu. LIVE flow ho má 48–64 px (\`DogGenderScreen\`, ikonka NAD
   textom); v riadku vedľa textu je strop daný výškou dlaždice. */
.es-picks .hf-pick .well { width: 52px; height: 52px; }
.es-picks .hf-pick .well img { width: 40px; height: 40px; object-fit: contain; }
.es-picks .hf-pick .tx { font-size: 14px; letter-spacing: 0.05em; }
.es-picks .hf-pick .tx em {
  display: block; font-style: normal; font-family: 'Space Grotesk', sans-serif;
  font-weight: 400; font-size: 10px; letter-spacing: 0.06em;
  color: rgba(60, 40, 12, 0.52); text-transform: none;
}
/* ⚠️ Výnimka „pri troch voľbách ikonka nad text" ZANIKLA. Bola potrebná, kým
   voľby stáli vedľa seba a na text zostalo 80 px; v riadkoch je miesta dosť,
   takže ikonka je vedľa textu vždy — jedno pravidlo namiesto dvoch. */

/* ── MEDZIKARTA MEDZI PSAMI ───────────────────────────────────────────────*/
.es-hand {
  display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;
  padding: 10px 0;
}
.es-hand > b {
  font-family: 'Cinzel', serif; font-size: 15px; color: #2E5C3B;
  text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
}
.es-next { display: inline-flex; align-items: center; gap: 8px; }
.es-next b { font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 15px; color: rgba(35, 22, 8, 0.90); }

/* ── BRÁNA A CTA ──────────────────────────────────────────────────────────*/
/* Rad akcie: výška je daná VŽDY (CTA 48 px), obsah sa v nej mení. */
.es-act {
  width: 100%; min-height: 40px; display: flex; align-items: center;
  justify-content: center;
}
.es-cta { width: 100%; }
.es-cta.is-off:hover { transform: none; }

/* ── 🔴 KRÁTKE OKNO: JEDNA PEVNÁ POLOHA, NIE STUPŇOVANIE (25. 9. 2026) ───────
   Matej 25. 9.: *„chceme, aby každá obrazovka mobil aj PC mali tie isté zásady
   a boli cca rovnaké, nepretekali a sedeli aj na mobile aj PC."* PODSTATA
   pretekala na iPhone SE (375×667) o 67 px — premerané meračom HRANICA.

   ⚠️ NEODPORUJE TO Matejovmu *„nič sa tu nemení veľkosťou"* z 24. 9. Tam išlo
      o obrazovku, ktorá sa menila PRI ODPOVEDANÍ (výška rástla s počtom volieb).
      Toto je JEDNA pevná poloha pre nízke okno a v nej sa už nič nehýbe — ten
      istý precedens, aký má PATRÓN (media dotaz na max-height 700px).
   🔑 USTUPUJE OBSAH, NIE REZERVA OD OKRAJA (lock PAGE_AIR): plocha odpovedí,
      fotka psa, rám a rozstupy. Hektor sa nezmenšuje — useSpeakMedal mu na
      krátkom okne veľkú polohu nedá tak či tak. */
@media (max-height: 700px) {
  .es-stack .hf-plate { gap: 8px; }
  .es-picks { --es-picks-h: 96px; }
  .es-picks .hf-pick { padding: 8px; gap: 4px; }
  .es-picks .hf-pick .well { width: 44px; height: 44px; }
  .es-picks .hf-pick .well img { width: 34px; height: 34px; }
  /* Premenované 25. 9. s presunom riadka; zmenšenie na krátkom okne ostáva
     vecou TEJTO obrazovky — sem patrí jej rozpočet výšky. */
  .es-act { min-height: 36px; }
  .es-cta { height: 36px; }
}
/* 🔴 3. 10. 2026 — DRUHÁ pevná poloha pre VEĽMI nízke okno (< 600): iPhone SE
   v Safari s lištami = 375×553, PODSTATA tam pretekala o 66 px a POKRAČOVAŤ
   bolo pod okrajom. Ten istý recept ako 700: ustupuje plocha odpovedí,
   nie rezerva od okraja. Hektor ustúpi sám (\`useSpeakMedal\` → 60). */
@media (max-height: 600px) {
  .es-stack .hf-plate { gap: 6px; }
  .es-picks { --es-picks-h: 80px; gap: 8px; }
  .es-speak { margin-bottom: 4px; }
  .es-stack { margin-top: 4px; }
  .es-stack .ftc-chip { min-height: 26px; }
  .es-picks .hf-pick { padding: 6px; gap: 2px; }
  .es-picks .hf-pick .well { width: 36px; height: 36px; }
  .es-picks .hf-pick .well img { width: 28px; height: 28px; }
}
`;export{Ze as EssenceScreen};
