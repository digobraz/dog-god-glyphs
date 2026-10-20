import{a3 as u,j as a}from"./index-B-BQrD2y.js";const f="/images/dogypt-logo-black-i.png",e={d:100,slot:112,ow:8,iw:5,blue:"#0A1A4A",face:"plate",metalAngle:59,segs:22,deco:.95,rot:0,logoW:67,logoY:-2,logoTint:"lapisDeep",gloss:.6,glossX:34,glossY:18,shadow:.6,grain:.18},$=t=>`conic-gradient(from ${t}deg,#FCF0C2,#EDCE7C 8%,#D8B052 22%,#AA8129 34%,#C09636 46%,#F7E4A8 58%,#D8B052 72%,#A97F27 86%,#FCF0C2 100%)`,k={black:"radial-gradient(72% 72% at 34% 24%, #241a10, #0c0906 70%)",plate:"linear-gradient(180deg,#F1DFB6,#D6BC85)",lapis:"linear-gradient(180deg,#16307A,#0A1A4A)",gold:"linear-gradient(180deg,#F4DC97,#C99A33)",clear:"transparent"},j={none:void 0,gold:"brightness(0) saturate(100%) invert(78%) sepia(38%) saturate(660%) hue-rotate(357deg) brightness(94%) contrast(90%)",dark:"brightness(0) saturate(100%) invert(9%) sepia(38%) saturate(1200%) hue-rotate(346deg) brightness(96%) contrast(95%)",lapis:"brightness(0) saturate(100%) invert(41%) sepia(94%) saturate(708%) hue-rotate(198deg) brightness(48%) contrast(123%)",lapisDeep:"brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(541%) hue-rotate(191deg) brightness(32%) contrast(116%)",white:"brightness(0) invert(1)"};function c(t,s){const o=parseInt(t.slice(1),16);return`rgb(${[o>>16&255,o>>8&255,o&255].map(n=>Math.max(0,Math.min(255,n+s))).join(",")})`}function w(){const t=e,s=50,o=t.ow/t.d*100,p=[];{const n=Math.max(4,t.segs),g=360/n,i=s-o,l=(r,d)=>[50+d*Math.cos((r-90)*Math.PI/180),50+d*Math.sin((r-90)*Math.PI/180)];for(let r=0;r<n;r+=2){const d=r*g+t.rot,h=d+g,m=l(d,s),x=l(h,s),b=l(h,i),v=l(d,i);p.push(a.jsx("path",{d:`M${m} A${s} ${s} 0 0 1 ${x} L${b} A${i} ${i} 0 0 0 ${v} Z`,fill:t.blue,opacity:t.deco},`alt${r}`))}}return a.jsxs("svg",{className:"nav-medal-deco",viewBox:"0 0 100 100","aria-hidden":!0,focusable:"false",children:[a.jsx("defs",{children:a.jsxs("radialGradient",{id:"navMedalGem",cx:"35%",cy:"28%",children:[a.jsx("stop",{offset:"0%",stopColor:c(e.blue,90)}),a.jsx("stop",{offset:"55%",stopColor:e.blue}),a.jsx("stop",{offset:"100%",stopColor:c(e.blue,-45)})]})}),p]})}function F({onClick:t,face:s,flat:o,still:p}){const n=e,g=a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"nav-medal-rim",children:a.jsxs("span",{className:"nav-medal-face",children:[s??a.jsx("img",{src:f,alt:"",style:{width:`${n.logoW}%`,transform:`translateY(${n.logoY}px)`,filter:j[n.logoTint]}}),a.jsx("span",{className:"nav-medal-grain"}),a.jsx("span",{className:"nav-medal-gloss"})]})}),a.jsx(w,{})]}),i=`nav-medal${o?" nav-medal--flat":""}`;return p?a.jsx("span",{className:i,"aria-hidden":!0,children:g}):a.jsx("a",{href:"/",className:i,"aria-label":"DOGYPT",onClick:l=>{t&&(l.preventDefault(),t())},children:g})}const y=`
/* Medailón visí V MEDZERE (trieda nav-medal-slot), nie v lište ako celku: stred lišty
   je stredom medzery len vtedy, keď sú obe strany rovnako široké, a to sa mení
   s jazykom. Zvisle je centrovaný na lištu, takže vystupuje rovnako hore aj dole. */
/* ⚠️ DVOJTRIEDNY SELEKTOR JE NUTNOSŤ, NIE ŠTÝL. Medailón je <a> a odkedy visí
   v medzere, stojí VNÚTRI .main-nav — kde platí pravidlo
   ".main-nav a, .main-nav button { background: none; border: none; padding: 0 }".
   To mu zmazalo zlatú obruč aj lem (zostal len modrý vnútrajšok) a vyzeralo to ako
   chyba farieb, nie ako prebitý selektor. Tú istú daň platí .nav-login v OnePage.tsx. */
.nav-medal.nav-medal {
  position: absolute; left: 50%; top: 50%; z-index: 9;
  width: ${e.d}px; height: ${e.d}px;
  transform: translate(-50%, -50%) scale(var(--medal-k, 1));
  border-radius: 50%;
  padding: ${e.ow}px;
  background: ${$(e.metalAngle)};
  box-shadow:
    0 ${(6+e.shadow*14).toFixed(0)}px ${(14+e.shadow*30).toFixed(0)}px -6px rgba(0,0,0,${(e.shadow*.95).toFixed(2)}),
    0 3px 0 -1px rgba(70,46,12,${(e.shadow*.6).toFixed(2)}),
    inset 0 1.5px 0 rgba(255,250,228,0.9),
    inset 0 -2px 3px rgba(84,56,14,0.55);
}
.nav-medal.nav-medal:hover { opacity: 1; }
/* Bez horného lesku obruče — ten istý tieň, len bez riadku inset 0 1.5px (voľba flat). */
.nav-medal.nav-medal.nav-medal--flat {
  box-shadow:
    0 ${(6+e.shadow*14).toFixed(0)}px ${(14+e.shadow*30).toFixed(0)}px -6px rgba(0,0,0,${(e.shadow*.95).toFixed(2)}),
    0 3px 0 -1px rgba(70,46,12,${(e.shadow*.6).toFixed(2)}),
    inset 0 -2px 3px rgba(84,56,14,0.55);
}
.nav-medal-rim {
  display: block; width: 100%; height: 100%; border-radius: 50%;
  padding: ${e.iw}px;
  background: linear-gradient(180deg, ${c(e.blue,26)}, ${e.blue} 45%, ${c(e.blue,-30)});
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.35);
}
.nav-medal-face {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
  background: ${k[e.face]};
  box-shadow:
    inset 0 2px 4px rgba(255,250,228,0.55),
    inset 0 -8px 14px -6px rgba(0,0,0,0.65),
    inset 0 0 0 1px rgba(0,0,0,0.4);
}
.nav-medal-face img { display: block; height: auto; }
.nav-medal-gloss {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  mix-blend-mode: screen;
  background:
    radial-gradient(60% 45% at ${e.glossX}% ${e.glossY}%, rgba(255,255,255,${e.gloss}), transparent 70%),
    linear-gradient(150deg, rgba(255,255,255,${(e.gloss*.35).toFixed(2)}) 0%, transparent 42%);
}
.nav-medal-grain {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: ${u}; background-size: 120px 120px;
  mix-blend-mode: multiply; opacity: ${e.grain};
}
/* ⚠️ Rozmer napísaný výslovne — SVG si ho z insetov nevezme (viď hlavička súboru). */
.nav-medal-deco {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%; overflow: visible; pointer-events: none; z-index: 3;
}
/* Miesto, ktoré si medailón drží v lište. Škáluje sa spolu s ním. */
.nav-medal-slot {
  position: relative; align-self: stretch; flex-shrink: 0;
  width: calc(${e.slot}px * var(--medal-k, 1));
}
`;export{y as N,F as a};
