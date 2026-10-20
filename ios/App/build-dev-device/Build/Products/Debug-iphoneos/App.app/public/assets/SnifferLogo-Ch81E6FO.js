import{r as t,j as s}from"./index-B-BQrD2y.js";const o=[{file:"smile",color:"#E86FB0"},{file:"trees",color:"#3E8E5A"},{file:"sun",color:"#F08A3C"},{file:"heart",color:"#E8493F"},{file:"ball",color:"#72B83A"},{file:"mountains",color:"#2F5DB8"},{file:"apple",color:"#A33A32"},{file:"map",color:"#7D7466"}],i="#E8493F",f=5700,k=8e3,d="#1F1A0E",h=`
@property --snl-t { syntax:'<angle>'; inherits:false; initial-value:0deg; }
@property --snl-r { syntax:'<length>'; inherits:false; initial-value:0px; }
.snl{position:relative;width:var(--snl-size);height:var(--snl-size);margin:0 auto;cursor:pointer;
  -webkit-tap-highlight-color:transparent;}
.snl > *{position:absolute;left:50%;top:50%;}
.snl-mask{display:block;-webkit-mask:var(--snl-src) center/contain no-repeat;mask:var(--snl-src) center/contain no-repeat;}
/* SRDCE = ZADOK (Matej: „srdce musí vyznieť ako zadok — jedna a druhá pola sa zatrasú").
   Dve polovice, každá sa trasie sama a o chvíľu neskôr než druhá. */
.snl-heart{width:92%;height:92%;margin:-46% 0 0 -46%;transform:scale(0);transform-origin:50% 60%;
  animation:snl-heart .7s cubic-bezier(.3,1.5,.5,1) 5s forwards;}
.snl-heart svg{width:100%;height:100%;display:block;overflow:visible;}
.snl-cheek{transform-box:fill-box;transform-origin:50% 20%;}
.snl-cheek--l{animation:snl-jig .42s ease-in-out 5.8s 3;}
.snl-cheek--r{animation:snl-jig .42s ease-in-out 5.95s 3;}
@keyframes snl-jig{0%,100%{transform:none;}30%{transform:translateY(2.5%) scale(1.03,.95);}65%{transform:translateY(-1.5%) scale(.98,1.04);}}
.snl-ring{width:0;height:0;}
/* KRESBY — presne rozloženie z Matejovho obrázka: smajlík hore, v smere hodín stromy, slnko,
   srdce, loptička, hory, jablko, mapa. Obehnú VŠETKY NARAZ rovnomerne (linear) a ZASEKNÚ sa
   — plynulé dobrzďovanie vyzeralo, že sa ešte hýbu („nestoja nehybne!"). Stoja 1,2 s. */
.snl-ico{position:absolute;left:0;top:0;width:calc(var(--snl-size) * .13);height:calc(var(--snl-size) * .13);background:var(--snl-c);opacity:0;
  --snl-r:calc(var(--snl-size) * .31);--snl-t:-150deg;
  transform:translate(-50%,-50%) rotate(calc(var(--snl-a) + var(--snl-t))) translateY(calc(-1 * var(--snl-r))) rotate(calc(-1 * (var(--snl-a) + var(--snl-t))));
  animation:snl-fade .5s ease-out calc(.8s + var(--snl-i) * .1s) forwards, snl-orbit 2.4s linear .8s forwards,
    snl-merge .7s cubic-bezier(.6,0,.9,.4) 4.4s forwards;}
/* Nos: JEDEN pulz pri nástupe (bez čuchania), na konci si sadne do polohy znaku. */
.snl-nose{width:44%;height:44%;margin:-22% 0 0 -22%;background:${d};transform:scale(0);
  animation:snl-nose-in .6s cubic-bezier(.3,1.6,.5,1) .1s forwards, snl-nose-sit .7s ease-in-out 5s forwards,
    snl-sniff2 .55s ease-in-out 7.2s 1;}
@keyframes snl-nose-in{0%{transform:scale(0);}60%{transform:scale(.92);}100%{transform:scale(.82);}}
@keyframes snl-nose-sit{from{transform:scale(.82);}to{transform:translateY(4.2%) scale(1.086,1.004);}}
@keyframes snl-sniff2{0%,100%{transform:translateY(4.2%) scale(1.086,1.004);}50%{transform:translateY(4.2%) scale(1.14,.95);}}
@keyframes snl-fade{to{opacity:1;}}
@keyframes snl-orbit{from{--snl-t:-150deg;}to{--snl-t:0deg;}}
@keyframes snl-merge{from{opacity:1;--snl-r:calc(var(--snl-size) * .31);--snl-t:0deg;}to{opacity:0;--snl-r:0px;--snl-t:0deg;}}
@keyframes snl-heart{to{transform:scale(1);}}
@media (prefers-reduced-motion: reduce){
  .snl *{animation:none!important;}
  .snl-heart{transform:scale(1);} .snl-nose{transform:translateY(4.2%) scale(1.086,1.004);} .snl-ico{opacity:0;}
}
`,p="M51 10.7 L50 10 C20 32 4 48 4 66 C4 82 15 92 28 92 C38 92 46 86 50 78 L51 79.6 Z",u="M49 10.7 L50 10 C80 32 96 48 96 66 C96 82 85 92 72 92 C62 92 54 86 50 78 L49 79.6 Z";function v({size:c=200,onDone:n}){const[r,m]=t.useState(0);return t.useEffect(()=>{var l;if(!n)return;const e=(l=window.matchMedia)==null?void 0:l.call(window,"(prefers-reduced-motion: reduce)").matches,a=window.setTimeout(n,e?0:f);return()=>window.clearTimeout(a)},[r,n]),s.jsxs(s.Fragment,{children:[s.jsx("style",{children:h}),s.jsxs("div",{className:"snl",style:{"--snl-size":`${c}px`},onClick:()=>m(e=>e+1),role:"img","aria-label":"SNIFFER",children:[s.jsx("span",{className:"snl-heart","aria-hidden":!0,children:s.jsxs("svg",{viewBox:"0 0 100 100",children:[s.jsx("path",{className:"snl-cheek snl-cheek--l",d:p,fill:i}),s.jsx("path",{className:"snl-cheek snl-cheek--r",d:u,fill:i})]})}),s.jsx("span",{className:"snl-ring","aria-hidden":!0,children:o.map((e,a)=>s.jsx("span",{className:"snl-ico snl-mask",style:{"--snl-src":`url(/icons/sniffer/${e.file}.svg)`,"--snl-c":e.color,"--snl-a":`${360/o.length*a}deg`,"--snl-i":a}},e.file))}),s.jsx("span",{className:"snl-nose snl-mask",style:{"--snl-src":"url(/icons/sniffer/nose.svg)"},"aria-hidden":!0})]},r)]})}export{i as S,k as a,v as b};
