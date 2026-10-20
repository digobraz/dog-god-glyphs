import{A as b,a as w,r as h,j as t}from"./index-B-BQrD2y.js";const x="dogypt-hranica",y="dogypt-flow-fill";function E(c){const e=document.querySelector(".hf-stage");if(!e)return null;const d=getComputedStyle(e),n=parseFloat(d.paddingTop)||0,s=Math.round(e.clientHeight-n-(parseFloat(d.paddingBottom)||0)),r=Math.round([...e.children].reduce((u,p)=>u+p.getBoundingClientRect().height,0));return{path:c,javisko:e.clientHeight,vzduch:n,miesto:s,obsah:r,vyplnPct:s>0?Math.round(r/s*100):0,pretecie:Math.max(0,e.scrollHeight-e.clientHeight),sirka:window.innerWidth}}function L(){const{pathname:c}=w(),[e,d]=h.useState(null),[n,s]=h.useState(()=>{try{return localStorage.getItem(x)==="1"}catch{return!1}});if(h.useEffect(()=>{const o=a=>{a.key===x&&s(a.newValue==="1")};return window.addEventListener("storage",o),()=>window.removeEventListener("storage",o)},[]),h.useEffect(()=>{if(!n&&window.parent===window)return;let o;const a=()=>{const g=E(c);d(g),g&&window.parent!==window&&window.parent.postMessage({type:y,fill:g},"*")},l=()=>{clearTimeout(o),o=setTimeout(a,0)};l();const v=setTimeout(a,450),i=document.querySelector(".hf-stage"),f=new ResizeObserver(l);i&&(f.observe(i),i.firstElementChild&&f.observe(i.firstElementChild)),window.addEventListener("resize",l);const m=new MutationObserver(l);return i&&m.observe(i,{childList:!0,subtree:!0}),()=>{clearTimeout(o),clearTimeout(v),f.disconnect(),m.disconnect(),window.removeEventListener("resize",l)}},[c,n]),!n||!e)return null;const r=e.pretecie>0,u=e.vyplnPct<78,p=r?"#B25640":u?"#B3822D":"#3D7A4E";return t.jsxs(t.Fragment,{children:[t.jsx("style",{children:j}),t.jsxs("span",{className:"hr-line",style:{top:e.javisko===0?0:void 0},"aria-hidden":!0,children:[t.jsx("i",{style:{top:`calc(100% - ${e.javisko-e.vzduch}px)`}}),t.jsx("i",{style:{top:`calc(100% - ${e.vzduch}px)`}})]}),t.jsxs("span",{className:"hr-badge",style:{borderColor:p,color:p},"aria-hidden":!0,children:[t.jsxs("b",{children:[e.vyplnPct," %"]}),t.jsxs("em",{children:["obsah ",e.obsah," / miesto ",e.miesto," · vzduch ",e.vzduch,r?` · PRETEKÁ o ${e.pretecie}`:""]})]})]})}const j=`
.hr-line {
  position: fixed; left: 0; right: 0; bottom: 0; top: 0;
  z-index: 3000; pointer-events: none;
}
.hr-line i {
  position: absolute; left: 0; right: 0; height: 0;
  border-top: 1px dashed rgba(178, 86, 64, 0.75);
}
/* ⚠️ VĽAVO DOLE, nie vpravo: vpravo dole sedí chip „Dev nav" a štítok sa pod
   ním stratil (merané 25. 9. v dielni). */
.hr-badge {
  position: fixed; left: 8px; bottom: 8px; z-index: 3001; pointer-events: none;
  display: flex; flex-direction: column; gap: 1px;
  padding: 5px 9px; border-radius: 8px;
  background: rgba(255, 253, 247, 0.94); border: 1.5px solid;
  font-family: 'Space Grotesk', sans-serif; text-align: left;
  box-shadow: 0 4px 12px rgba(60, 40, 10, 0.22);
}
.hr-badge b { font-size: 14px; font-weight: 700; line-height: 1; }
.hr-badge em {
  font-style: normal; font-size: 10px; line-height: 1.3;
  color: rgba(60, 40, 12, 0.62);
}
`,A={min:85,max:100},S=b;export{S as FILL_AIR,A as FILL_BAND,y as FILL_MSG,L as FlowFillProbe,x as HRANICA_KEY};
