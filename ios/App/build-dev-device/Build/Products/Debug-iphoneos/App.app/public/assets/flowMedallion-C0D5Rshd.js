import{j as s,r as $}from"./index-B-BQrD2y.js";const A=e=>`conic-gradient(from ${e}deg,#FCF0C2,#EDCE7C 8%,#D8B052 22%,#AA8129 34%,#C09636 46%,#F7E4A8 58%,#D8B052 72%,#A97F27 86%,#FCF0C2 100%)`,u={ow:8,segs:22,wall:.9,dome:1,light:59,lapis:"#0A1A4A",lapisHi:"#2A4BA8",lapisLo:"#050D26"},f=(e,t)=>[50+t*Math.cos((e-90)*Math.PI/180),50+t*Math.sin((e-90)*Math.PI/180)],j=(e,t,o,n)=>{const x=f(e,o),m=f(t,o),w=f(t,n),r=f(e,n);return`M${x} A${o} ${o} 0 0 1 ${m} L${w} A${n} ${n} 0 0 0 ${r} Z`},C=e=>(Math.cos((e-u.light)*Math.PI/180)+1)/2;function M(){const{ow:e,segs:t,wall:o,dome:n,lapis:x,lapisHi:m,lapisLo:w}=u,r=50,b=r-e,h=360/t,k=-h/2,a=1.15,p=[];for(let i=0;i<t;i+=2){const d=i*h+k,l=d+h,c=(d+l)/2,g=C(c),y=j(d+o/2,l-o/2,r-a,b+a),v=(e-2*a)*.42;p.push(s.jsx("path",{d:y,fill:x},`s${i}`)),p.push(s.jsx("path",{d:j(d+o/2,l-o/2,r-a,r-a-v),fill:m,opacity:(.18+.55*g)*n},`hi${i}`)),p.push(s.jsx("path",{d:j(d+o/2,l-o/2,b+a+v,b+a),fill:w,opacity:(.55-.22*g)*n},`lo${i}`)),p.push(s.jsx("path",{d:y,fill:"none",stroke:"url(#fmWall)",strokeWidth:o,opacity:.55+.45*g},`w${i}`));const F=f(c-h*.22,r-a-(e-2*a)*.26);p.push(s.jsx("ellipse",{cx:F[0],cy:F[1],rx:.55*n,ry:.34*n,transform:`rotate(${c} 50 50)`,fill:"#FFFFFF",opacity:.1+.3*g},`sp${i}`))}for(let i=1;i<t;i+=2){const d=i*h+h/2+k,l=f(d,r-1.8),c=f(d,b+1.8);p.push(s.jsx("line",{x1:l[0],y1:l[1],x2:c[0],y2:c[1],stroke:"rgba(72,44,4,.55)",strokeWidth:.5,strokeLinecap:"round"},`r${i}`)),p.push(s.jsx("line",{x1:l[0]+.35,y1:l[1],x2:c[0]+.35,y2:c[1],stroke:"rgba(255,244,205,.6)",strokeWidth:.35,strokeLinecap:"round"},`rh${i}`))}return s.jsxs("svg",{className:"fm-deco",viewBox:"0 0 100 100","aria-hidden":!0,focusable:"false",children:[s.jsxs("defs",{children:[s.jsxs("linearGradient",{id:"fmWall",x1:"0",y1:"0",x2:"1",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#FCF0C2"}),s.jsx("stop",{offset:"55%",stopColor:"#D8B052"}),s.jsx("stop",{offset:"100%",stopColor:"#8A6318"})]}),s.jsxs("linearGradient",{id:"fmRail",x1:"0",y1:"0",x2:"0.7",y2:"1",children:[s.jsx("stop",{offset:"0%",stopColor:"#FFF7DA"}),s.jsx("stop",{offset:"50%",stopColor:"#C79A35"}),s.jsx("stop",{offset:"100%",stopColor:"#7A5613"})]})]}),s.jsx("circle",{cx:50,cy:50,r:r-.55,fill:"none",stroke:"url(#fmRail)",strokeWidth:1.1}),s.jsx("circle",{cx:50,cy:50,r:b+.55,fill:"none",stroke:"url(#fmRail)",strokeWidth:1.1}),p]})}function E(){const[e,t]=$.useState(()=>typeof window>"u"?{w:1024,h:768}:{w:window.innerWidth,h:window.innerHeight});return $.useEffect(()=>{const o=()=>t({w:window.innerWidth,h:window.innerHeight});return window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),e.w<560&&e.h>=700?104:e.h<600?60:80}function W({src:e,size:t=132,alt:o="HEKTHOR",className:n}){const x=Math.max(4,Math.round(u.ow/100*t));return s.jsxs("span",{className:`fm${n?` ${n}`:""}`,style:{width:t,height:t},children:[s.jsx("span",{className:"fm-ring",style:{background:A(u.light)}}),s.jsx(M,{}),s.jsx("span",{className:"fm-bevel"}),s.jsx("span",{className:"fm-gloss"}),s.jsx("span",{className:"fm-face",style:{inset:x},children:s.jsx("img",{className:"fm-img",src:e,alt:o})}),s.jsx("span",{className:"fm-well",style:{inset:x}})]})}const D=`
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
  position: absolute; border-radius: 50%; overflow: hidden; background: ${u.lapis};
}
.fm-face img.fm-img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Zapustenie — tieň, ktorý obruč hádže DO stredu. Bez neho fotka leží NA obruči. */
.fm-well {
  position: absolute; border-radius: 50%; pointer-events: none;
  box-shadow: inset 0 5px 10px rgba(0,0,0,.62), inset 0 -2px 6px rgba(0,0,0,.35),
              0 0 0 1px rgba(255,240,200,.30);
}
`;export{D as F,W as a,E as u};
