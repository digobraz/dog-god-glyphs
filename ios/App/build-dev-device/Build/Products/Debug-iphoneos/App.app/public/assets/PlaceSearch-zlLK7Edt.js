import{u as B,e as F,r as s,at as N,au as _,j as i,P as m,T as a,af as H,J as k,c as O}from"./index-B-BQrD2y.js";import{L as K,a5 as W}from"./useLongPressPoint-LSPmhAf7.js";const z="rgba(47,107,255,0.55)",q=`
@property --trp-ps-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.trp-ps{position:relative;border-radius:8px;}
.trp-ps.is-attn{box-shadow:0 0 16px rgba(47,107,255,0.22);}
.trp-ps.is-attn::before{
  content:'';position:absolute;inset:-2px;border-radius:12px;z-index:0;pointer-events:none;padding:4px;
  background:conic-gradient(from var(--trp-ps-ang),
    transparent 0deg, transparent 250deg,
    rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
    rgba(47,107,255,0.85) 352deg, transparent 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  filter:blur(1px);
  animation:trpPsSpin 3.8s linear infinite;
}
@keyframes trpPsSpin{ to { --trp-ps-ang:360deg; } }
@media (prefers-reduced-motion: reduce){ .trp-ps.is-attn::before{animation:none;} }
/* Výplň/rám/inkoust poľa a ponuky — v CSS, nie v inline štýle, nech ich bledý skin PC vie
   prebiť bez !important (viď komentár pri <input>). */
.trp-ps-input{background:rgba(10,7,4,0.72);border-color:${m.onDarkBorder};color:${m.onDark};}
.trp-ps.is-attn .trp-ps-input{border-color:${z};}
.trp-ps-sug{background:rgba(18,13,7,0.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid ${m.onDarkBorder};box-shadow:0 18px 44px rgba(0,0,0,0.55);}
.trp-ps-sugitem{color:${m.onDark};}
.trp-ps-sugitem + .trp-ps-sugitem{border-top:1px solid rgba(245,240,228,0.08);}
.trp-ps-sugsub{color:${m.onDarkDim};}
${`
/* ── BLEDÝ SKIN (2026-08-26, mobil doplnený 2026-08-28) — pole stojí v papyrusovom doku,
   tak je z papyrusu tiež. Ponuka je PORTÁL do <body>, teda MIMO .trp-dock — nedá sa
   zakotviť do doku a musí sa prefarbiť sama.
   ⚠️ Media query zanikla 28. 8.: dok je bledý na každej šírke, takže druhá sada tých istých
   farieb pre mobil by sa rozišla pri prvej úprave. */
  .trp-ps-input{background:${a.field};border-color:${a.border};color:${a.ink};}
  .trp-ps-input::placeholder{color:${a.dim};opacity:.75;}
  /* Rám poľa drží MODRÚ aj na papyruse — obieha po ňom modré svetlo a zlatý rám
     pod ním by z toho spravil dve rôzne farby na jednom obryse. */
  .trp-ps.is-attn .trp-ps-input{border-color:${z};}
  .trp-ps-sug{background:linear-gradient(135deg,${m.card} 0%,#F2E2BD 100%);border:1.5px solid ${a.edge};box-shadow:${H.panel};backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-ps-sugitem{color:${a.ink};}
  .trp-ps-sugitem:hover{background:${a.hot};}
  .trp-ps-sugitem + .trp-ps-sugitem{border-top:1px solid ${a.hair};}
  .trp-ps-sugsub{color:${a.dim};}
`}
`;function U({mapRef:D,zoom:f=14,placeholder:R,onPicked:h}){const C=B(),{lang:y}=F(),[g,v]=s.useState(""),[c,p]=s.useState([]),[A,w]=s.useState(!1),E=s.useRef(""),x=s.useRef(null);s.useEffect(()=>{const e=g.trim();if(e.length<2){p([]);return}if(E.current===e){p([]);return}const t=setTimeout(async()=>{try{const o=N+"/v1/suggest?query="+encodeURIComponent(e)+"&lang="+encodeURIComponent(y)+"&limit=6&apikey="+_,l=((await(await fetch(o)).json()).items||[]).map(r=>{var b,S,L,$,P;return{name:r.name||"",type:r.type,country:(L=(S=(b=r.regionalStructure)==null?void 0:b.find(M=>M.type==="regional.country"))==null?void 0:S.isoCode)==null?void 0:L.toLowerCase(),sub:[r.label,r.location].filter(Boolean).join(" · "),lat:($=r.position)==null?void 0:$.lat,lon:(P=r.position)==null?void 0:P.lon}}).filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lon));p(l)}catch{p([])}},250);return()=>clearTimeout(t)},[g,y]),s.useEffect(()=>{if(c.length===0)return;const e=o=>{var n;(n=x.current)!=null&&n.contains(o.target)||p([])},t=o=>{o.key==="Escape"&&p([])};return document.addEventListener("mousedown",e),document.addEventListener("touchstart",e),document.addEventListener("keydown",t),()=>{document.removeEventListener("mousedown",e),document.removeEventListener("touchstart",e),document.removeEventListener("keydown",t)}},[c.length]);const T=e=>{E.current=e.name,v(e.name),p([]);const t=D.current;if(t){const[o,n]=W(),u=(o-n)/2,l=u?t.unproject(t.project([e.lat,e.lon],f).subtract([u,0]),f):K.latLng(e.lat,e.lon);t.flyTo(l,f,{duration:1.1})}h==null||h(e)},I=!A&&g.trim().length===0,[d,j]=s.useState(null);return s.useEffect(()=>{if(!c.length){j(null);return}const e=()=>{const t=x.current;if(!t)return;const o=t.getBoundingClientRect(),n=6,u=12,l=window.innerHeight-o.bottom-n-u,r=o.top-n-u,b=l<180&&r>l;j({left:o.left,width:o.width,...b?{bottom:window.innerHeight-o.top+n}:{top:o.bottom+n},max:Math.max(120,b?r:l)})};return e(),window.addEventListener("resize",e),window.addEventListener("scroll",e,!0),()=>{window.removeEventListener("resize",e),window.removeEventListener("scroll",e,!0)}},[c]),i.jsxs("div",{ref:x,style:{position:"relative"},children:[i.jsx("style",{children:q}),i.jsx("div",{className:`trp-ps${I?" is-attn":""}`,children:i.jsx("input",{value:g,onChange:e=>v(e.target.value),onFocus:()=>w(!0),onBlur:()=>w(!1),placeholder:R??C("pack.addTrip.geo.searchPlace"),style:{position:"relative",zIndex:1,width:"100%",boxSizing:"border-box",padding:"12px 12px",borderRadius:8,borderWidth:1,borderStyle:"solid",fontFamily:k,fontSize:16,fontWeight:500,outline:"none"},className:"trp-ps-input"})}),c.length>0&&d&&O.createPortal(i.jsx("div",{onMouseDown:e=>e.stopPropagation(),onTouchStart:e=>e.stopPropagation(),style:{position:"fixed",left:d.left,width:d.width,...d.bottom!=null?{bottom:d.bottom}:{top:d.top},zIndex:1300,borderRadius:12,overflowX:"hidden",overflowY:"auto",maxHeight:d.max},className:"trp-ps-sug",children:c.map((e,t)=>i.jsxs("button",{type:"button",onClick:()=>T(e),style:{display:"block",width:"100%",textAlign:"left",cursor:"pointer",padding:"12px 12px",background:"none",border:"none"},className:"trp-ps-sugitem",children:[i.jsx("span",{style:{display:"block",fontFamily:k,fontSize:14,fontWeight:500},children:e.name}),e.sub&&i.jsx("span",{className:"trp-ps-sugsub",style:{display:"block",fontFamily:k,fontSize:12,marginTop:2},children:e.sub})]},t))}),document.body)]})}export{U as P};
