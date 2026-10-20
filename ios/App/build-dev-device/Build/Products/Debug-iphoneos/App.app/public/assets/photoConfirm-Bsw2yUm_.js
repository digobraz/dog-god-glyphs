import{P as r,L as l,J as v,K as E,b as L}from"./index-B-BQrD2y.js";const S={eyebrow:"Yours will be",lead:"Three minutes and your dog is on the wall.",cta:"Continue",another:"Choose another photo",later:"You can change the photo later.",zoom:"Zoom"},C="photo-confirm-css",j=`
.pfc-back {
  position: fixed; inset: 0; z-index: 9000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  background: rgba(10, 7, 3, 0.72);
  opacity: 0;
  transition: opacity .18s ease-out;
}
.pfc-back.is-in { opacity: 1; }

/* Papyrusový panel — úroveň 4 matrice PACK_BOX (panel/modal): panelGrad,
   1.5px zlatý rám, radius 14, panelShadow. Hodnoty sa NEOPISUJÚ, berú sa
   z tokenov (packTheme.ts) — inak sa pri prvej zmene rozídu.
   ⚠️ Bez spätných apostrofov: toto je CSS vnútri template literalu, kde by
   ktorýkoľvek z nich literal ukončil (CLAUDE.md, pasca HUB_CSS). */
.pfc-card {
  position: relative;
  width: min(360px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  display: flex; flex-direction: column; align-items: center;
  gap: 14px;
  padding: 22px 22px 20px;
  background: ${r.panelGrad};
  border: 1.5px solid ${r.cardEdge};
  border-radius: 14px;
  box-shadow: ${r.panelShadow};
  transform: scale(.965);
  transition: transform .18s ease-out;
}
.pfc-back.is-in .pfc-card { transform: scale(1); }

/* Náhľad má TVAR DLAŽDICE, z ktorej vyskočil — zaoblený štvorec, nie kruh.
   Kruh by sľuboval výrez do kruhu, ktorý tu zámerne nie je. Zaoblenie 24 %
   je tá istá hodnota ako --ph-r v dogPortal.ts. */
.pfc-shot {
  position: relative;
  width: min(58vw, 232px); aspect-ratio: 1 / 1;
  border-radius: 24%;
  overflow: hidden;
  touch-action: none;
  border: 1.5px solid ${r.cardEdge};
  box-shadow: 0 6px 20px rgba(0,0,0,.28);
  background: #1a140c;
}
/* Obraz sa hýbe v SVOJOM pomere strán, nie ako štvorcový prvok s cover —
   len tak sa dá pri 1× dostať k ľavému okraju ležatej fotky. Kratšia strana
   sedí na ráme (to je cover pri 1×), dlhšia presahuje a presah sa dá ťahať. */
.pfc-shot img {
  position: absolute; left: 50%; top: 50%;
  transform-origin: center;
  display: block; max-width: none;
  user-select: none; -webkit-user-drag: none;
  cursor: grab;
}
.pfc-shot.is-drag img { cursor: grabbing; }
.pfc-shot::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
}

/* Posuvník je TICHÝ — výrez je ponuka, nie úkon. Preto žiadny nadpis nad ním
   a farba len na úchyte, ktorý je „moja voľba" (lapis). */
.pfc-zoom {
  width: min(58vw, 232px);
  display: flex; align-items: center; gap: 8px;
  margin-top: -4px;
}
.pfc-zoom input {
  flex: 1; height: 3px; -webkit-appearance: none; appearance: none;
  background: ${r.cardEdge}; border-radius: 999px; outline: none; cursor: pointer;
}
.pfc-zoom input::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 16px; height: 16px; border-radius: 50%;
  background: ${l.grad}; border: 1px solid ${l.edge};
  box-shadow: 0 1px 4px rgba(0,0,0,.35); cursor: pointer;
}
.pfc-zoom input::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: ${l.edge}; border: 1px solid ${l.edge}; cursor: pointer;
}
.pfc-zoom i {
  font-style: normal; font-family: ${v}; font-size: 11px;
  color: ${r.inkWarm}; opacity: .7; flex: none;
}

/* Poznámka pod CTA (Matej 23. 9.): o platbe tu ani slovo. */
.pfc-later {
  font-family: ${v}; font-size: 11px; color: ${r.inkWarm};
  opacity: .75; margin: -6px 0 0; text-align: center;
}

.pfc-num { display: flex; flex-direction: column; align-items: center; gap: 1px; }
/* Eyebrow presne podľa bledého locku: Space Grotesk 500, .26em, veľké písmená,
   farba cardEdge. */
.pfc-eyebrow {
  font-family: ${v}; font-weight: 500; font-size: 10px;
  letter-spacing: .26em; text-transform: uppercase; color: ${r.cardEdge};
}
.pfc-n {
  font-family: ${E}; font-weight: 700;
  font-size: clamp(30px, 11vw, 40px); line-height: 1;
  color: ${r.inkStrong};
}
.pfc-lead {
  font-family: ${v}; font-size: 12.5px; line-height: 1.5;
  color: ${r.inkWarm}; text-align: center; max-width: 260px;
  margin: -4px 0 0;
}

/* HLAVNÉ CTA = LAPIS, ale GEOMETRIU si berie od .btn-gold (radius 8, nie pilulka).
   Zmena farby nie je povolenie na iný tvar. Zlaté písmo na modrom nie je ozdoba —
   lapis + zlato je pôvodná egyptská dvojica. */
.pfc-go {
  width: 100%;
  padding: 12px 18px;
  border: 1px solid ${l.edge};
  border-radius: 8px;
  background: ${l.grad};
  color: ${l.ink};
  box-shadow: ${L};
  font-family: ${E}; font-weight: 700; font-size: 14px;
  letter-spacing: .12em; text-transform: uppercase;
  cursor: pointer;
  transition: transform .12s ease-out, background .15s ease-out;
}
.pfc-go:hover { background: ${l.gradHover}; }
.pfc-go:active { transform: translateY(1px); }
.pfc-go:focus-visible { outline: 2px solid ${l.edge}; outline-offset: 2px; }

/* Druhá akcia je TICHÁ. Dve plné plochy vedľa seba znamenajú, že obrazovka
   nevedie nikam — plná farebná výplň patrí jedinému hlavnému CTA. */
.pfc-alt {
  border: 0; background: none; cursor: pointer;
  font-family: ${v}; font-size: 11.5px; color: ${r.inkWarm};
  text-decoration: underline; text-underline-offset: 3px;
  opacity: .8; margin-top: -4px;
}
.pfc-alt:hover { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .pfc-back, .pfc-card { transition: none; }
  .pfc-card { transform: none; }
}
`;function A(){if(typeof document>"u"||document.getElementById(C))return;const e=document.createElement("style");e.id=C,e.textContent=j,document.head.appendChild(e)}function M(e,s){const t=e.querySelector("img");let a=1,d=0,c=0,f=!1,o=0,u=0,i=0;const h=()=>{o=e.getBoundingClientRect().width;const n=t.naturalWidth||1,p=t.naturalHeight||1,x=Math.max(o/n,o/p);u=n*x,i=p*x,t.style.width=`${u}px`,t.style.height=`${i}px`,b()},m=()=>({mx:Math.max(0,(u*a-o)/2),my:Math.max(0,(i*a-o)/2)}),b=()=>{const{mx:n,my:p}=m();d=Math.min(n,Math.max(-n,d)),c=Math.min(p,Math.max(-p,c)),t.style.transform=`translate(-50%, -50%) translate(${d}px, ${c}px) scale(${a})`};t.complete&&t.naturalWidth&&h(),t.addEventListener("load",h);const y=new ResizeObserver(h);y.observe(e);let k=null,w=0,$=0;e.addEventListener("pointerdown",n=>{k=n.pointerId,w=n.clientX-d,$=n.clientY-c,e.classList.add("is-drag"),e.setPointerCapture(n.pointerId)}),e.addEventListener("pointermove",n=>{k===n.pointerId&&(d=n.clientX-w,c=n.clientY-$,f=!0,b())});const z=n=>{k===n.pointerId&&(k=null,e.classList.remove("is-drag"))};return e.addEventListener("pointerup",z),e.addEventListener("pointercancel",z),s.addEventListener("input",()=>{a=Number(s.value)/100,f=!0,b()}),{destroy:()=>y.disconnect(),result:()=>{if(!f)return null;const n=t.naturalWidth||1,p=t.naturalHeight||1,x=1/(u/n*a),g=o*x;return{sx:Math.max(0,Math.min(n-g,(n-g)/2-d*x)),sy:Math.max(0,Math.min(p-g,(p-g)/2-c*x)),size:Math.max(1,Math.min(g,Math.min(n,p)))}}}}function I(e){var h;A();const s={...S,...e.copy||{}},t=document.createElement("div");t.className="pfc-back",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("data-film-free","");const a=document.createElement("div");a.className="pfc-card";const d=e.packNumber!=null?`<span class="pfc-num">
         <span class="pfc-eyebrow">${s.eyebrow}</span>
         <span class="pfc-n">#${e.packNumber}</span>
       </span>`:"";a.innerHTML=`
    <span class="pfc-shot"><img src="${e.photoUrl}" alt=""></span>
    <span class="pfc-zoom"><i>−</i><input type="range" min="100" max="300" value="100" aria-label="${s.zoom}"><i>+</i></span>
    ${d}
    <p class="pfc-lead">${s.lead}</p>
    <button type="button" class="pfc-go">${s.cta}</button>
    <p class="pfc-later">${s.later}</p>
    <button type="button" class="pfc-alt">${s.another}</button>
  `,t.appendChild(a);const c=M(a.querySelector(".pfc-shot"),a.querySelector(".pfc-zoom input"));let f=!1;const o=(m=!0)=>{var b;f||(f=!0,c.destroy(),document.removeEventListener("keydown",u),t.classList.remove("is-in"),window.setTimeout(()=>t.remove(),200),m&&((b=e.onClose)==null||b.call(e)))},u=m=>{m.key==="Escape"&&o()};t.addEventListener("click",m=>{m.target===t&&o()}),(h=a.querySelector(".pfc-alt"))==null||h.addEventListener("click",()=>{o(!1),e.onPickAnother()});const i=a.querySelector(".pfc-go");return i==null||i.addEventListener("click",()=>{o(!1),e.onContinue(c.result())}),document.addEventListener("keydown",u),document.body.appendChild(t),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("is-in"))),i==null||i.focus({preventScroll:!0}),{close:()=>o()}}export{I as o};
