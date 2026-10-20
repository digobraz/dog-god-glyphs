import{k as f,B as t,u as y,r as s,j as r}from"./index-B-BQrD2y.js";import{a as u}from"./HandIcons-nK6bMixK.js";function L({children:v,rowClass:k,measureKey:j,centerSel:l}){const i=y(),n=s.useRef(null),[h,d]=s.useState(!1),[m,p]=s.useState(!1);s.useEffect(()=>{const e=n.current;if(!e)return;const a=()=>{d(e.scrollLeft>2),p(e.scrollLeft+e.clientWidth<e.scrollWidth-2)};a(),e.addEventListener("scroll",a,{passive:!0});const o=new ResizeObserver(a);return o.observe(e),()=>{e.removeEventListener("scroll",a),o.disconnect()}},[]),s.useEffect(()=>{const e=n.current;if(!e)return;const a=requestAnimationFrame(()=>{d(e.scrollLeft>2),p(e.scrollLeft+e.clientWidth<e.scrollWidth-2);const o=e.querySelector(l);if(!o)return;const b=o.offsetLeft-e.clientWidth/2+o.clientWidth/2;e.scrollTo({left:Math.max(0,b),behavior:"smooth"})});return()=>cancelAnimationFrame(a)},[j,l]);const c=e=>{var a;return(a=n.current)==null?void 0:a.scrollBy({left:e,behavior:"smooth"})};return r.jsxs("div",{className:"hf-scroll",children:[h&&r.jsx("button",{type:"button",className:"hf-snav l","aria-label":i("whatNext.prev"),onClick:()=>c(-190),children:r.jsx(u,{size:14,solid:!0})}),m&&r.jsx("button",{type:"button",className:"hf-snav r","aria-label":i("whatNext.next"),onClick:()=>c(190),children:r.jsx(u,{size:14,solid:!0,style:{transform:"rotate(180deg)"}})}),r.jsx("div",{ref:n,className:`hf-srow ${k}`,children:v})]})}const z=`
/* ── VODOROVNÉ RADY ───────────────────────────────────────────────────────
   Rad roluje, šípky visia nad ním. Vodorovná lišta rolovania je skrytá zámerne:
   na papyrusovej doske je to šedý pás cez celú šírku a rad pod ním prestane byť
   rad — „pokračuje to" hovoria šípky. */
.hf-scroll { position: relative; width: 100%; }
.hf-srow {
  display: flex; align-items: center; gap: 8px; width: 100%;
  overflow-x: auto; scrollbar-width: none;
  /* Miesto na tieň dlaždice, lem výberu a na jej stlačenie pri ťuknutí.
     3 px nestačilo — POVAHE sa orezal lem vybranej dlaždice (Matej 26. 9.). */
  padding: 6px 4px; margin: -6px -4px;
}
.hf-srow::-webkit-scrollbar { display: none; }
/* 🟨 ŠÍPKA JE PLNÁ BRANDOVÁ ZLATÁ (Matej 24. 9.: *„šípky sú moc na kraji a možno by
   som ich dal zlaté alebo inej farby, lebo splývajú"*). Papyrusová šípka na
   papyrusovej doske je papyrus na papyruse — presne to splývanie.
   🔑 A je to POLOHA V LOCKU, nie výnimka: brand lock hovorí *„ZLATO = konštrukcia
      a poloha"* (rám, nav, aktívna pilulka) a *„LAPIS = moja voľba a akcia"*.
      Posun radu je nábytok — nič si ním nevyberám, len sa presúvam. Zlatá je preto
      jediná správna odpoveď a zároveň odlíši šípku od všetkého, čo sa NA rade vyberá.
   ⚠️ Recept sa neopisuje: \`BRAND_GOLD_BTN\` (rampa #C99A3F→#A3782B, rám #8C6014,
      TMAVÝ inkoust). Svetlá zlato-oranžová \`GOLD_BTN\` sem NEPATRÍ — je svetlejšia
      než papyrus a patrí AINUBISOVI. */
.hf-snav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
  width: 26px; height: 26px; border-radius: ${f.pill}px; cursor: pointer;
  display: grid; place-items: center;
  /* 🔴 ŠÍPKA JE BLEDÁ A PLNÁ, KRUH OSTÁVA ZLATÝ (Matej 24. 9. 2026: *„tie šípky daj
     bledé a kruh nechaj zlatý, najlepšie ak by si ich vyplnil bledou farbou, nie len
     obrys ako sú teraz"*). Kresba z kitu je OBRYS — plnú siluetu robí poloha
     \`solid\` na \`HandArrowLeft\`, nie iná kresba.
     ⚠️ Brand lock píše, že KRÉMOVÝ inkoust na brandovej zlatej padá pod 3:1 (jas
        zlatej ~0,36). Platí to a Matej to rozhodol s tým vedome — plná silueta je
        však oveľa čitateľnejšia než obrys a kontrast dvíha tmavá spodná hrana
        (\`drop-shadow\`), tá istá rytina „svetlo zhora", akú nesie celý vstup. */
  color: #FDF7E7;
  background: ${t.grad};
  border: 1px solid ${t.edge};
  box-shadow: ${t.glow};
}
.hf-snav:hover { background: ${t.gradHover}; box-shadow: ${t.glowHover}; }
/* Tmavá hrana pod bledou šípkou — nie ozdoba, ale to, čo ju na zlate udrží čitateľnú. */
.hf-snav svg { filter: drop-shadow(0 1px 0 rgba(72, 44, 4, 0.55)); }
/* ⚠️ −8, NIE −18 (Matej 24. 9.: *„šípky sú moc na kraji"*). Pri −18 sedeli celé vo
   výplni dosky, teda tesne pri rytej obrube, a čítali sa ako ozdoba rámu. Pri −8
   stoja NAD radom ako ovládač, ktorý k nemu patrí — presah 18 px je cena za to a
   padne vždy na okrajovú dlaždicu, ktorá je aj tak odrezaná scrollom.
   ⚠️ Fade pod šípkou by musel trafiť odtieň mramorovanej dosky — a tú žiadna plná
      farba netrafí (ten istý dôvod, prečo koliesko rokov dostalo masku namiesto
      prekryvu). */
.hf-snav.l { left: -8px; }
.hf-snav.r { right: -8px; }
/* 🔴 NA DOTYKOVOM ZARIADENÍ ŠÍPKY NIE SÚ. Existujú kvôli MYŠI (koliesko ide
   zvislo, vodorovný rad sa ňou posunúť nedá); prst rad odroluje sám a na 390 px
   by šípky sedeli na prvej a poslednej dlaždici. Že rad pokračuje, hovorí na
   telefóne polovičná dlaždica na okraji — to je jeho vlastná reč. */
@media (pointer: coarse) { .hf-snav { display: none; } }
/* Na krátkom okne ustupuje rezerva na tieň — dlaždica ostáva. */
@media (max-height: 700px) { .hf-srow { padding: 2px; margin: -2px; } }
`;export{z as F,L as S};
