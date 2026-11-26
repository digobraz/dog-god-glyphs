import{g as L,u as I,k as g,r as S,M as A,j as a,m as T,L as M}from"./index-DriUOdZL.js";import{u as R,F as D,a as V}from"./flowDogPicker-C0gH0xe3.js";import{u as F}from"./useFlowGuard-BnknS19j.js";import{P as _}from"./PageTopBar-3J3L1b0M.js";import{H}from"./HeroglyphFrame-F7m3K15S.js";import{c as K,a as G,d as B}from"./flowPaleSkin-CJNdyjt-.js";import{u as $,F as Y,a as W}from"./flowMedallion-C1OBUhVP.js";import{F as U,S as Z}from"./flowScroller-saaV6RfO.js";import{L as h}from"./labTheme-DLctEqJ2.js";import{h as q}from"./hekthorFaces-myd4lVXL.js";import{H as J}from"./hektor-DznQ9VDK.js";import{s as X,a as Q,b as aa,c as ea,d as oa,e as ta}from"./CHARACTER-WATERLOVER-Be2FY-gi.js";import{f as ia,g as ra}from"./RankingSlot-B9f52iXE.js";import{m as c}from"./proxy-5uIz4xGy.js";import{A as sa}from"./index-BPi12Ps7.js";import"./flowMode-B6eboter.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./initialLetter-CIe-_dtl.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";import"./HandIcons-BI9sYdb3.js";import"./NUMBER-11-BoEzuCvn.js";const l=2,na=[{v:"guardian",img:X},{v:"player",img:Q},{v:"energizer",img:ia},{v:"maverick",img:ra},{v:"waterlover",img:aa},{v:"gourmet",img:ea},{v:"lover",img:oa},{v:"chiller",img:ta}];function Va(){const k=L(),o=I(),w=F(),C=$(),u=g(e=>e.setSelection),x=g(e=>e.dogEssence),v=g(e=>e.setDogEssence),p=R(),[f,y]=S.useState(0),s=p[Math.min(f,Math.max(0,p.length-1))],r=(s==null?void 0:s.id)??A,j=e=>{const i=x[e]||{};return[i.dogCharacter1,i.dogCharacter2].filter(Boolean)},t=j(r),[N,O]=S.useState({}),n=N[r]||t[0]||null,E=e=>{v(r,"dogCharacter1",e[0]||""),v(r,"dogCharacter2",e[1]||""),r===A&&(u("dogCharacter1",e[0]||""),u("dogCharacter2",e[1]||""))},P=e=>{const i=t.includes(e)?t.filter(m=>m!==e):t.length<l?[...t,e]:[...t.slice(1),e];O(m=>({...m,[r]:e})),E(i)},d=t.length===l,b=p.findIndex(e=>j(e.id).length<l),z=d&&b>=0;return w?a.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[a.jsxs("style",{children:[K,Y,G,B,U,D,la]}),a.jsx("div",{className:"hf-topbar flex-shrink-0",children:a.jsx(_,{brandBack:!0,onBack:()=>k("/heroglyph/breed")})}),a.jsx("div",{className:"hf-stage",children:a.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center",children:[a.jsxs(c.div,{className:"hf-speak ch-speak",initial:{opacity:0,y:-8},animate:{opacity:1,y:0},transition:{duration:.28},children:[a.jsx(W,{src:q("dog-character"),size:C}),a.jsxs("span",{className:"say",children:[a.jsxs("h2",{children:[o("heroglyph.flow.dogCharacter.questionPrefix"),a.jsx("b",{children:o("heroglyph.flow.dogCharacter.questionWord")}),o("heroglyph.flow.dogCharacter.questionSuffix")]}),a.jsx("p",{children:o("heroglyph.flow.dogCharacter.chooseTwo")})]})]}),a.jsxs(c.div,{className:"hf-block hf-carved ch-stack",initial:{opacity:0,top:12},animate:{opacity:1,top:0},transition:{duration:.35},children:[a.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),a.jsxs("div",{className:"hf-plate",children:[a.jsx(V,{className:"ch-who",dogs:p,cur:f,onGo:y,done:t.length===l}),a.jsx("span",{className:"fdh-rule","aria-hidden":!0}),a.jsx(H,{showOwner:!0,dogValues:x[r]||{},ghostValues:J,pulseSlot:d?void 0:"dogCharacter",className:"hf-glyph ch-glyph",style:{width:"var(--flow-glyph-w)"}}),a.jsx("p",{className:"hf-legend",children:o("heroglyph.flow.dogCharacter.title")}),a.jsx(Z,{rowClass:"ch-traits",measureKey:n||"",centerSel:`.ch-trait[data-v="${n||""}"]`,children:na.map(e=>{const i=t.indexOf(e.v);return a.jsxs("button",{type:"button","data-v":e.v,className:`hf-pick is-pale ch-trait${i>=0?" on":""}`,"aria-pressed":i>=0,onClick:()=>P(e.v),children:[i>=0&&a.jsx("i",{className:"ord",children:i+1}),a.jsx("img",{src:e.img,alt:""}),a.jsx("span",{className:"lb",children:o(`heroglyph.flow.dogCharacter.trait.${e.v}`)})]},e.v)})}),a.jsx("div",{className:"ch-say",children:a.jsx(sa,{mode:"wait",initial:!1,children:n?a.jsxs(c.p,{initial:{opacity:0,y:6},animate:{opacity:1,y:0},exit:{opacity:0,y:-4},transition:{duration:.18},children:[a.jsx("b",{children:o(`heroglyph.flow.dogCharacter.slide.${n}.title`)}),o(`heroglyph.flow.dogCharacter.slide.${n}.desc`)]},n):a.jsx(c.p,{className:"dim",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.18},children:o("heroglyph.flow.dogCharacter.infoBody")},"hint")})}),a.jsx("button",{type:"button",className:"hf-cta hf-dock",disabled:!d,onClick:()=>{d&&(z?y(b):k("/heroglyph/owner-info"))},children:d?o(z?"heroglyph.flow.multi.nextDog":"heroglyph.flow.breed.continue"):p.length>1?o("heroglyph.flow.dogCharacter.pickMoreDog",{dog:(s==null?void 0:s.name)||"",n:String(l-t.length)}):o("heroglyph.flow.dogCharacter.pickMore",{n:String(l-t.length)})})]})]})]})})]}):null}const la=`
/* Bublina: stupeň písma viazaný na ŠÍRKU BUBLINY (cqw), nie na okno — inak
   nadpis pri zmene šírky ticho pretečie. Tá istá dvojica hodnôt ako PODSTATA
   a PATRÓN, aby tri susedné kroky mali to isté písmo. */
.ch-speak { container-type: inline-size; margin-bottom: 8px; }
/* Zlaté slovo v otázke je zvýraznenie vnútri vety, nie druhá farba textu —
   ten istý zvyk, aký mala otázka v starom šate (\`text-amber-300\`). */
/* Farbu slova drží \`.hf-speak b\` (HF_HIGHLIGHT) — tu sa neprepisuje. */
/* ⚠️ ROZSTUP 12, NIE 10 (25. 9.). Desiatku si vzali PODSTATA a PATRÓN preto,
   že sa im obsah nezmestil — táto obrazovka ten problém nemá, takže sa dýcha. */
.ch-stack .hf-plate { gap: 12px; }

/* ── RÁM ──────────────────────────────────────────────────────────────────
   Tá istá šírka ako na PODSTATE a PATRÓNOVI: 78 % od 560 px, 100 % pod tým. Na
   telefóne je doska sama úzka a sťahovanie na 78 % zrazilo symboly v malých
   slotoch na nečitateľné.
   ⚠️ Číslo je premenná, lebo šírku zapisuje INLINE \`style\` na komponente. */
/* 🔒 Šírku rámu určuje LOCK \`FLOW_GLYPH_CSS\` (\`--flow-glyph-w\`), nie táto
   obrazovka — na každom kroku musí byť heroglyf rovnako veľký (Matej 25. 9.).
   Vlastné percento sa sem NEVRACIA; keď sa obsah nezmestí, ustúpi obsah. */

/* ── DLAŽDICA VLASTNOSTI ──────────────────────────────────────────────────
   🔴 MATERIÁL JE \`.hf-pick\`, mení sa LEN GEOMETRIA: stĺpec (kresba, pod ňou
      meno) namiesto riadka. Opísať tu papyrusový gradient či lapisový tint by
      znamenalo tretiu podobu tej istej voľby vo vstupe.
   ⚠️ NEDOSTÁVA PLNÚ ZLATÚ VÝPLŇ, akú majú dlaždice PODSTATY. Tam sú dve až tri
      a zlato ich odlíši od chipov nad nimi; tu ich je OSEM v rade a plná zlatá
      by z radu urobila zlatý pás, v ktorom čierna kresba prestane byť tým, na čo
      sa oko pozerá. Je to tá istá poloha, akú má rad siluet na PATRÓNOVI —
      🚩 a tá istá otvorená otázka na Mateja (do 3 volieb zlato, od 4 tint). */
/* 26. 9. 2026 ~16:15 Matej na povahe: *„aj tu sú tie výbery inak farebné!"* ⇒
   \`.is-pale\` + \`FLOW_PICK_ON\`, tá istá dlaždica ako silueta na PATRÓNOVI a voľby
   PODSTATY. Vlastný sivomodrý výber zanikol. */
.ch-trait {
  position: relative;
  flex: 0 0 auto; width: 104px; padding: 10px 4px;
  flex-direction: column; justify-content: center; gap: 4px;
  text-align: center; border-radius: ${T.tile}px;
}
.ch-trait img { width: 56px; height: 56px; object-fit: contain; }
/* Meno je POPISOK, nie nadpis: najmenší stupeň zo stupnice a tesné sledovanie,
   aby sa aj „Hyperaktív" zmestilo do dlaždice bez zalomenia. */
.ch-trait .lb {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.02em; line-height: 1.1; text-transform: uppercase;
  color: ${h.inkSoft}; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  /* 3. 10. 2026 — riadok 1,1 s orezom odstrihol diakritiku VEĽKÝCH písmen
     (Matej: „chýbajú mäkčene STRÁŽCA, HRÁČ"). Háček nad Ž/Č trčí nad výšku
     riadku. Vankúš pridá miesto do orezu, záporný okraj vráti rozmer dlaždice. */
  padding: 4px 0 2px; margin: -4px 0 -2px;
}
.ch-trait.on .lb { color: #16307A; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.55); }
/* Poradové číslo = ktorý slot rámu vlastnosť obsadila. Plná lapisová plocha je tu
   v poriadku: je to ZNAČKA veľkosti 18 px, nie plocha, ktorá by konkurovala CTA. */
.ch-trait .ord {
  /* VNÚTRI dlaždice, nie cez jej hranu — rad roluje (overflow), takže
     čokoľvek nad hranou orezal (Matej 26. 9.: „modré čísielka orezané"). */
  position: absolute; top: 4px; right: 4px; z-index: 1;
  width: 18px; height: 18px; border-radius: ${T.pill}px;
  display: grid; place-items: center; font-style: normal;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px; line-height: 1;
  color: #FDF7E7; background: ${M.edge};
  box-shadow: 0 1px 2px rgba(20, 50, 90, 0.35);
}

/* ── POPIS VYBRANEJ VLASTNOSTI ────────────────────────────────────────────
   Výška je daná VŽDY (dva riadky na PC), obsah sa v nej mení. */
.ch-say {
  position: relative; width: 100%; min-height: 44px;
  display: flex; align-items: flex-start;
}
/* ⚠️ 14 px, nie 12 (25. 9.) — je to jediný súvislý text obrazovky a mal
   najmenší stupeň zo stupnice, hoci miesto bolo. Obe čísla sú z PACK_TEXT. */
.ch-say p {
  margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px;
  line-height: 1.4; color: ${h.inkSoft};
}
.ch-say p.dim { color: ${h.inkMuted}; }
/* Meno symbolu pred popisom — Cinzel, o stupeň menej výrazné než popisok
   dlaždice, aby to ostala VETA, nie nadpis. */
.ch-say p b {
  font-family: 'Cinzel', serif; font-weight: 700; color: ${h.ink};
  letter-spacing: 0.02em; margin-right: 6px;
}

/* ── ZAMKNUTÉ CTA NESIE MATERIÁL, NIE PRIESVITNOSŤ ────────────────────────
   \`.hf-cta:disabled\` má \`opacity: .4\` — a 40 % lapisu je na papyruse ŠEDÁ
   PLOCHA cez celú šírku dosky (Matej to zamietol 31. 8. 2026: *„šedé tlačítko
   a tieň presvitá"*). Ten istý recept ako na PATRÓNOVI: plochý papyrus, tlmený
   inkoust, žiadny tieň. Tvar ostáva, takže je vidno, čo pribudne. */
/* ⚠️ 27. 9. 2026: pravidlo zaniklo — neaktívne CTA má vzhľad z E-MAILU, drží ho .hf-cta:disabled vo flowPaleSkin. */


/* ── 📱 NA TELEFÓNE JE DLAŽDICA VÄČŠIA ────────────────────────────────────
   Tá istá úvaha ako pri siluetách patróna (Matej 24. 9.: *„na mobile to má
   rezervy = zväčši"*): Matej pozerá rám 500 px, doska v ňom má 412 px, takže
   ŠTYRI dlaždice s rozstupom 8 vyjdú na (412 − 3×8) / 4 = **97 px**.
   Popis pod radom potrebuje na 302 px tri riadky, nie dva. */
@media (max-width: 559px) {
  .ch-trait { width: 116px; }
  .ch-trait img { width: 68px; height: 68px; }
  .ch-say { min-height: 66px; }
}
/* 🔴 KRÁTKE OKNO + TELEFÓN NARAZ — a MUSÍ to stáť AŽ TU. Obe podmienky majú
   rovnakú špecificitu, takže rozhoduje poradie; keď pravidlo stálo vyššie,
   iPhone SE si bral mobilnú veľkosť a zmenšenie sa ticho nedialo (presne to sa
   24. 9. stalo siluetám na PATRÓNOVI). */
@media (max-height: 700px) {
  .ch-stack .hf-plate { gap: 8px; }
  .ch-stack .hf-cta { height: 36px; }
  .ch-speak { margin-bottom: 4px; }
}
@media (max-width: 559px) and (max-height: 700px) {
  .ch-trait { width: 96px; padding: 8px 4px; }
  .ch-trait img { width: 52px; height: 52px; }
  .ch-say { min-height: 60px; }
}

/* ── 📱 VYSOKÝ TELEFÓN — pravidlo ZANIKLO 28. 9. 2026 ─────────────────────────
   25. 9. tu rástol vzduch v blokoch od výšky 701 px (padding 32, medzery 16).
   Merané bolo len na 390×844; na 390×740 (telefón s lištou prehliadača) tým
   obrazovka pretiekla o 72 px a CTA zmizlo pod okrajom. Matej 28. 9.: *„horná
   časť 2. bloku kde je meno je tu zbytočne vysoká — premeraj výšky na každej
   obrazovke a zjednoť ich na také ako sú pri essence"*. Novší pokyn prebil
   „daj na 85 %" z 25. 9.; bloky majú odteraz rozmery PODSTATY. */
`;export{Va as CharacterScreen};
