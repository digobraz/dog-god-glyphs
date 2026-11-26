import{r as j,j as e}from"./index-DriUOdZL.js";const C=s=>`conic-gradient(from ${s}deg,#FCF0C2,#EDCE7C 8%,#D8B052 22%,#AA8129 34%,#C09636 46%,#F7E4A8 58%,#D8B052 72%,#A97F27 86%,#FCF0C2 100%)`,g={ow:8,segs:22,wall:.9,dome:1,light:59,lapis:"#0A1A4A",lapisHi:"#2A4BA8",lapisLo:"#050D26"},x=(s,t)=>[50+t*Math.cos((s-90)*Math.PI/180),50+t*Math.sin((s-90)*Math.PI/180)],k=(s,t,o,n)=>{const a=x(s,o),h=x(t,o),m=x(t,n),r=x(s,n);return`M${a} A${o} ${o} 0 0 1 ${h} L${m} A${n} ${n} 0 0 0 ${r} Z`},A=s=>(Math.cos((s-g.light)*Math.PI/180)+1)/2;function M(){const{ow:s,segs:t,wall:o,dome:n,lapis:a,lapisHi:h,lapisLo:m}=g,r=50,b=r-s,u=360/t,y=-u/2,l=1.15,d=[];for(let i=0;i<t;i+=2){const c=i*u+y,p=c+u,f=(c+p)/2,w=A(f),v=k(c+o/2,p-o/2,r-l,b+l),$=(s-2*l)*.42;d.push(e.jsx("path",{d:v,fill:a},`s${i}`)),d.push(e.jsx("path",{d:k(c+o/2,p-o/2,r-l,r-l-$),fill:h,opacity:(.18+.55*w)*n},`hi${i}`)),d.push(e.jsx("path",{d:k(c+o/2,p-o/2,b+l+$,b+l),fill:m,opacity:(.55-.22*w)*n},`lo${i}`)),d.push(e.jsx("path",{d:v,fill:"none",stroke:"url(#fmWall)",strokeWidth:o,opacity:.55+.45*w},`w${i}`));const F=x(f-u*.22,r-l-(s-2*l)*.26);d.push(e.jsx("ellipse",{cx:F[0],cy:F[1],rx:.55*n,ry:.34*n,transform:`rotate(${f} 50 50)`,fill:"#FFFFFF",opacity:.1+.3*w},`sp${i}`))}for(let i=1;i<t;i+=2){const c=i*u+u/2+y,p=x(c,r-1.8),f=x(c,b+1.8);d.push(e.jsx("line",{x1:p[0],y1:p[1],x2:f[0],y2:f[1],stroke:"rgba(72,44,4,.55)",strokeWidth:.5,strokeLinecap:"round"},`r${i}`)),d.push(e.jsx("line",{x1:p[0]+.35,y1:p[1],x2:f[0]+.35,y2:f[1],stroke:"rgba(255,244,205,.6)",strokeWidth:.35,strokeLinecap:"round"},`rh${i}`))}return e.jsxs("svg",{className:"fm-deco",viewBox:"0 0 100 100","aria-hidden":!0,focusable:"false",children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"fmWall",x1:"0",y1:"0",x2:"1",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:"#FCF0C2"}),e.jsx("stop",{offset:"55%",stopColor:"#D8B052"}),e.jsx("stop",{offset:"100%",stopColor:"#8A6318"})]}),e.jsxs("linearGradient",{id:"fmRail",x1:"0",y1:"0",x2:"0.7",y2:"1",children:[e.jsx("stop",{offset:"0%",stopColor:"#FFF7DA"}),e.jsx("stop",{offset:"50%",stopColor:"#C79A35"}),e.jsx("stop",{offset:"100%",stopColor:"#7A5613"})]})]}),e.jsx("circle",{cx:50,cy:50,r:r-.55,fill:"none",stroke:"url(#fmRail)",strokeWidth:1.1}),e.jsx("circle",{cx:50,cy:50,r:b+.55,fill:"none",stroke:"url(#fmRail)",strokeWidth:1.1}),d]})}function q(){const[s,t]=j.useState(()=>typeof window>"u"?{w:1024,h:768}:{w:window.innerWidth,h:window.innerHeight});return j.useEffect(()=>{const o=()=>t({w:window.innerWidth,h:window.innerHeight});return window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),s.w<560&&s.h>=700?104:s.h<600?60:80}function L({src:s,size:t=132,alt:o="HEKTHOR",className:n,ask:a}){const h=Math.max(4,Math.round(g.ow/100*t)),[m]=j.useState(()=>{if(!a)return!1;try{const r=`fq-seen:${a.id}`;return sessionStorage.getItem(r)?!1:(sessionStorage.setItem(r,"1"),!0)}catch{return!1}});return e.jsxs("span",{className:`fm${n?` ${n}`:""}`,style:{width:t,height:t},children:[e.jsx("span",{className:"fm-ring",style:{background:C(g.light)}}),e.jsx(M,{}),e.jsx("span",{className:"fm-bevel"}),e.jsx("span",{className:"fm-gloss"}),e.jsx("span",{className:"fm-face",style:{inset:h},children:e.jsx("img",{className:"fm-img",src:s,alt:o})}),e.jsx("span",{className:"fm-well",style:{inset:h}}),a&&e.jsx("button",{type:"button",className:`fq-mark${m?" fq-pulse":""}`,"aria-label":a.label,"aria-expanded":a.expanded,onClick:a.onClick,children:e.jsx("img",{src:"/icons/sys/otaznik.webp",alt:"",draggable:!1})})]})}const D=`
/* Otáznik na pravej hrane obruče (Matej 11. 11. 2026): brandová ikonka z kitu, 3D zdvih, ťukací cieľ 44+ px. */
.fq-mark {
  position: absolute; z-index: 6; top: -2px; right: -16px; width: 44px; height: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  filter: drop-shadow(0 3px 0 rgba(138, 90, 20, .95)) drop-shadow(0 7px 6px rgba(0, 0, 0, .28)); transition: transform .08s;
}
.fq-mark img { width: 100%; height: 100%; display: block; pointer-events: none; }
.fq-mark:active { transform: translateY(2px); }
@media (min-width: 900px) { .fq-mark { width: 48px; height: 48px; right: -20px; } }
@keyframes fq-pulse { 0%, 100% { transform: scale(1); } 35% { transform: scale(1.22); } 65% { transform: scale(1); } }
.fq-pulse { animation: fq-pulse 1.1s ease-in-out 2; }
@media (prefers-reduced-motion: reduce) { .fq-pulse { animation: none; } }
.fm { position: relative; display: block; border-radius: 50%; flex: none; }
.fm-ring {
  position: absolute; inset: 0; border-radius: 50%;
  box-shadow: 0 10px 26px -6px rgba(0,0,0,.55), 0 3px 0 -1px rgba(70,46,12,.55),
              inset 0 0 0 1px rgba(255,240,200,.35);
}
.fm-deco { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
/* Fazeta — vypuklý kov: svetlo zhora, tieň zdola po celom obvode. */
.fm-bevel {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: linear-gradient(170deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 34%,
              rgba(0,0,0,0) 62%, rgba(40,22,0,.45) 100%);
  mix-blend-mode: soft-light;
}
.fm-bevel::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  box-shadow: inset 0 2px 2px rgba(255,248,222,.85), inset 0 -2px 3px rgba(52,30,2,.6);
}
/* Lesk — úzky svetelný pás cez ľavý horný kvadrant a teplý dosvit zospodu. */
.fm-gloss { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; overflow: hidden; }
.fm-gloss::before {
  content: ''; position: absolute; left: -18%; top: -34%; width: 78%; height: 120%;
  transform: rotate(24deg); filter: blur(3px);
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.52) 46%, rgba(255,255,255,0) 100%);
}
.fm-gloss::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  box-shadow: inset 0 -6px 12px -4px rgba(255,226,150,.65);
}
.fm-face {
  position: absolute; border-radius: 50%; overflow: hidden; background: ${g.lapis};
}
.fm-face img.fm-img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Zapustenie — tieň, ktorý obruč hádže DO stredu. Bez neho fotka leží NA obruči. */
.fm-well {
  position: absolute; border-radius: 50%; pointer-events: none;
  box-shadow: inset 0 5px 10px rgba(0,0,0,.62), inset 0 -2px 6px rgba(0,0,0,.35),
              0 0 0 1px rgba(255,240,200,.30);
}
`;export{D as F,L as a,q as u};
