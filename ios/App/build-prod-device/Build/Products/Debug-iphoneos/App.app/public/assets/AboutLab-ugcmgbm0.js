const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HektorBook-DTKphMlf.js","assets/index-7PctGTam.js","assets/index-BceXV8_0.css","assets/CHINESE_SIGN-DOG-BLwMUyg_.js","assets/CHARACTER-LOVER-PeZ6v7_e.js","assets/CHARACTER-PLAYER-Cv1vUfcU.js","assets/CHARACTER-GUARDIAN-DUFYOjrr.js","assets/CHARACTER-GOURMET-D0Ns93ty.js","assets/CHARACTER-WATERLOVER-B6ix-Wlz.js","assets/CHARACTER-CHILLER-UcQ8Gv72.js"])))=>i.map(i=>d[i]);
import{u as _e,r,j as e,L as Y,b as wt,l as Te,h as Dt,i as Ca,a8 as Ja,ah as qa,aX as ja,aY as To,aZ as Lo,a_ as dn,a1 as hn,aT as mn,aU as un,ae as ot,af as st,ad as gn,aV as bn,aW as xn,ag as fn,aj as Xa,c as Ct,Q as Qa,E as eo,a$ as vn,a as Mo,g as vt,aG as kn,y as Pt,_ as yn,s as wn}from"./index-7PctGTam.js";import{L as za}from"./LanguagePicker--v1cJQg6.js";import{p as to}from"./godsData-kTA2EY6K.js";import{i as ao,a as Ea,b as jn}from"./countryGeo-BaPfaSrG.js";import{t as oo}from"./cloudinaryService-DFfDUqVM.js";import{S as Xt}from"./Seo-B-e2lU-9.js";import{L as Le}from"./labTheme-p7t_6k9Y.js";import{o as Oo}from"./photoConfirm-lfyly4ep.js";import{i as _o,f as Io}from"./photoIntake-cTohUk5s.js";import{d as Do}from"./dogSlug-CB23gDR2.js";import{a as zn,s as En,d as An,f as Nn,w as Sn,c as Cn,m as Pn}from"./constitutionRead-6hPB31zu.js";import{t as Tn}from"./HandIcons-Dh9PgzA0.js";import{D as Ln,a as Ro}from"./DogMessage-DIBP3WES.js";import{S as Mn}from"./sparkles-C-OUu7N_.js";import{useToast as On}from"./use-toast-CpgRElRJ.js";import{B as sa}from"./BrandIcon-C4Fdumu_.js";import{f as la}from"./flagUrl-B21iQI9I.js";import{d as _n}from"./dogypt-logo-gold-D67FOL39.js";import{l as In}from"./dogypt-logo-mobile-B7sCn4Sq.js";import{u as Bo,d as Dn,A as Rn}from"./useBodyScrollLock--CJIKtfn.js";import{m as Fo}from"./proxy-B4ZTxIpr.js";import{g as Bn,f as Fn,e as Hn,d as $n,c as Vn,b as Gn,a as Yn,i as Kn}from"./council-business-BPTub_bd.js";const no=new Map;function Un(o){if(!o||!/^[0-9a-f]{96}$/.test(o))return;const n=no.get(o);if(n)return n;const s=new Uint8Array(102),c=new DataView(s.buffer);s[0]=66,s[1]=77,c.setUint32(2,s.length,!0),c.setUint32(10,54,!0),c.setUint32(14,40,!0),c.setInt32(18,4,!0),c.setInt32(22,-4,!0),c.setUint16(26,1,!0),c.setUint16(28,24,!0),c.setUint32(34,48,!0);for(let f=0;f<16;f++){const m=54+f*3,y=f*6;s[m]=parseInt(o.slice(y+4,y+6),16),s[m+1]=parseInt(o.slice(y+2,y+4),16),s[m+2]=parseInt(o.slice(y,y+2),16)}let p="";s.forEach(f=>{p+=String.fromCharCode(f)});const l=`data:image/bmp;base64,${btoa(p)}`;return no.set(o,l),l}function Pa(){if(typeof document>"u"||document.getElementById("dogypt-dog-vision"))return;const n=document.createElementNS("http://www.w3.org/2000/svg","svg");n.setAttribute("width","0"),n.setAttribute("height","0"),n.setAttribute("aria-hidden","true"),n.style.position="absolute",n.innerHTML='<filter id="dogypt-dog-vision" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.2 0.8 0 0 0  0.2 0.8 0 0 0  0 0.1 0.9 0 0  0 0 0 1 0"/><feColorMatrix type="saturate" values="0.8"/><feGaussianBlur stdDeviation="0.35"/></filter>',document.body.appendChild(n)}const Ft=o=>o.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim(),ca=o=>/[^\d#\s]/.test(o);function io(o,n,s=8){const c=Ft(n);if(!c)return[];const p=o.filter(l=>Ft(l.name).includes(c));return p.sort((l,f)=>{const m=Ft(l.name).startsWith(c)?0:1,y=Ft(f.name).startsWith(c)?0:1;return m!==y?m-y:(l.n??1e9)-(f.n??1e9)}),p.slice(0,s)}function Wn({hits:o,onGo:n,edgeBase:s,anonKey:c}){const p=_e(),[l,f]=r.useState(null),[m,y]=r.useState(""),[N,O]=r.useState("idle");r.useEffect(()=>{Pa()},[]);const x=o.map(v=>v.key).join("|");if(r.useEffect(()=>{f(null),O("idle"),y("")},[x]),!o.length)return e.jsx("div",{className:"ws-none",children:p("wall.search.none")});const F=o.find(v=>v.key===l&&v.wallId),j=async()=>{if(!(!(F!=null&&F.wallId)||!m.includes("@")||N!=="idle")){O("sending");try{await fetch(`${s}/send-guest-mail`,{method:"POST",headers:{"Content-Type":"application/json",apikey:c,Authorization:`Bearer ${c}`},body:JSON.stringify({kind:"resend",dogId:F.wallId,email:m.trim()})})}catch{}O("sent")}};return e.jsxs("div",{className:"ws-root",children:[e.jsx("style",{children:Zn}),F?e.jsxs("div",{className:"ws-join",children:[e.jsxs("div",{className:"ws-row ws-row--head",children:[e.jsx("img",{className:"ws-ph is-vision",src:F.photo,alt:"",draggable:!1}),e.jsx("span",{className:"ws-name",children:F.name})]}),N==="sent"?e.jsx("p",{className:"ws-sent",children:p("wall.search.sent")}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"ws-hint",children:p("wall.search.joinHint")}),e.jsx("input",{className:"ws-mail",type:"email",inputMode:"email",autoComplete:"email",autoFocus:!0,value:m,placeholder:p("wall.search.emailPh"),onChange:v=>y(v.target.value),onKeyDown:v=>{v.key==="Enter"&&(v.stopPropagation(),j())}}),e.jsx("button",{type:"button",className:"ws-cta",disabled:!m.includes("@")||N!=="idle",onClick:j,children:p("wall.search.send")})]}),e.jsx("button",{type:"button",className:"ws-back",onClick:()=>f(null),children:p("wall.search.back")})]}):e.jsx("div",{className:"ws-list",children:o.map(v=>e.jsxs("div",{className:"ws-row",children:[e.jsxs("button",{type:"button",className:"ws-go",onClick:()=>n(v),children:[v.photo?e.jsx("img",{className:`ws-ph${v.n?"":" is-vision"}`,src:v.photo,alt:"",draggable:!1}):e.jsx("span",{className:"ws-ph"}),e.jsxs("span",{className:"ws-tx",children:[e.jsx("span",{className:"ws-name",children:v.name}),e.jsx("span",{className:"ws-sub",children:v.n?v.country:p("wall.search.vision")})]})]}),v.n?e.jsxs("span",{className:"ws-num",children:["#",v.n]}):v.wallId&&e.jsx("button",{type:"button",className:"ws-joinbtn",onClick:()=>f(v.key),children:p("wall.search.join")})]},v.key))})]})}const Zn=`
.ws-root { display: flex; flex-direction: column; min-width: 0; }
.ws-list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 300px; }
.ws-row {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 4px;
  border-radius: 12px; background: rgba(255,255,255,0.34);
  border: 1px solid rgba(201,154,63,0.28);
}
.ws-row--head { background: transparent; border: none; padding: 0; }
.ws-go {
  flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 8px;
  background: none; border: 0; padding: 0; cursor: pointer; text-align: left; color: inherit;
}
.ws-ph {
  flex: none; width: 40px; height: 40px; border-radius: 999px; object-fit: cover;
  background: rgba(201,154,63,0.2); box-shadow: 0 0 0 1.5px rgba(201,154,63,0.9);
}
.ws-ph.is-vision { filter: url(#dogypt-dog-vision); }
.ws-tx { display: flex; flex-direction: column; min-width: 0; }
.ws-name {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.06em;
  color: rgba(0,0,0,0.82); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ws-sub {
  font-family: 'Space Grotesk', sans-serif; font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(0,0,0,0.5); white-space: nowrap;
}
.ws-num {
  flex: none; padding: 2px 8px; border-radius: 999px; background: ${Y.grad};
  color: ${Y.ink}; font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
}
.ws-joinbtn {
  flex: none; height: 28px; padding: 0 8px; border-radius: 8px; cursor: pointer;
  border: 1.5px solid ${Y.edge}; background: transparent; color: ${Y.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px; letter-spacing: 0.06em;
  text-transform: uppercase; white-space: nowrap;
}
.ws-joinbtn:hover { background: ${Y.fill}; }
.ws-join { display: flex; flex-direction: column; gap: 8px; }
.ws-hint, .ws-sent {
  margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4;
  color: rgba(0,0,0,0.62);
}
.ws-sent {
  padding: 8px 12px; border-radius: 12px; color: #2E5C3B;
  background: rgba(61,122,78,0.12); border: 1px solid rgba(61,122,78,0.4);
}
.ws-mail {
  height: 44px; border-radius: 12px; padding: 0 12px; width: 100%;
  border: 1.5px solid ${Y.edge}; background: #fff; color: rgba(0,0,0,0.82);
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; outline: none;
}
.ws-cta {
  height: 44px; border-radius: 8px; border: 0; cursor: pointer; width: 100%;
  background: ${Y.grad}; color: ${Y.ink}; box-shadow: ${wt};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; letter-spacing: 0.1em;
  text-transform: uppercase;
}
.ws-cta:disabled { opacity: 0.45; cursor: default; }
.ws-back {
  align-self: center; background: none; border: 0; cursor: pointer; padding: 4px;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: rgba(0,0,0,0.55);
  text-decoration: underline;
}
.ws-none {
  padding: 12px 8px; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
  color: rgba(0,0,0,0.55); text-align: center;
}
`,ro=7.37,Jn={tur:10.63,deu:8.68,fra:8.63,pol:8.4,prt:8.37,nld:8.21,esp:8.15,ita:7.94};function Aa(o){return Math.max(1,(Jn[o]??ro)/ro)}const so=8.66,qn={deu:13.5,ita:11.99,tur:11.96,fra:11.29,prt:11.17,nld:10.02,esp:9.85,pol:9.67};function Ho(o){return Math.max(1,(qn[o]??so)/so)}const pa=4;function lo(o,n){const s=Math.abs(Math.cos(o)),c=Math.abs(Math.sin(o));return n/Math.pow(Math.pow(s,pa)+Math.pow(c,pa),1/pa)}const Xn=4,Qn=80,$o=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function Vo(o,n={}){const s=n.density??1,c={ctx:null,host:null,hero:null,S:0,pw:0,r0:0,next:0,em:[],ps:[]};return{frame:l=>{const f=o;if(!f)return;const m=c;if(!m.ctx){if(m.ctx=f.getContext("2d"),!m.ctx)return;m.host=f.parentElement,m.hero=f.closest(".planet-hero"),m.em=[1.15,-.78,1.62,-1.28,.92,-1.75].map((v,_)=>({w:v,a:_*1.1}));const j=Math.max(80,Math.round(620*s));m.ps=Array.from({length:j},()=>({on:!1,a:0,h:0,vr:0,L:0,t:0,T:0,sz:1,tr:[]}))}if(m.hero&&m.hero.style.opacity==="0.000")return;const y=m.host?m.host.offsetWidth:0;if(!y)return;if(Math.abs(y-m.pw)>.5){m.pw=y;const j=Math.round(y+2*Qn),v=Math.min(2,window.devicePixelRatio||1);m.S=j,f.width=j*v,f.height=j*v,f.style.width=j+"px",f.style.height=j+"px",m.ctx.setTransform(v,0,0,v,0,0),m.ctx.lineCap="round",m.r0=y/2+Xn}const N=m.ctx,O=m.S,x=O/2,F=O/2;for(N.clearRect(0,0,O,O),m.em.forEach(j=>{j.a+=j.w*l}),m.next+=560*s*l;m.next>=1;){m.next-=1;const j=m.ps.find(t=>!t.on);if(!j)break;const v=m.em[Math.random()*m.em.length|0],_=Math.random()<.36,Z=_?Math.random()*6.2832:v.a;j.on=!0,j.a=Z+(Math.random()-.5)*.14,j.h=Math.random()*4;const L=lo(j.a,m.r0)+j.h;j.L=v.w*(.95+Math.random()*.85)*L*L;const R=Math.random()>.8,z=_?.55:1;j.vr=(R?66+Math.random()*108:9+Math.random()*34)*z,j.t=0,j.T=R?.38+Math.random()*.5:.55+Math.random()*1.05,j.sz=Math.random()<.12?2.8:1.05+Math.random()*1,j.tr.length=0}for(const j of m.ps){if(!j.on)continue;if(j.t+=l,j.t>=j.T){j.on=!1,j.tr.length=0;continue}j.h+=j.vr*l,j.vr*=Math.pow(.3,l);const v=lo(j.a,m.r0)+j.h;j.a+=j.L/(v*v)*l;const _=x+Math.cos(j.a)*v,Z=F+Math.sin(j.a)*v;j.tr.unshift(_,Z),j.tr.length>28&&(j.tr.length=28);const L=1-j.t/j.T,R=j.tr.length/2;if(R>1){N.beginPath(),N.moveTo(j.tr[0],j.tr[1]);for(let z=1;z<R;z++)N.lineTo(j.tr[z*2],j.tr[z*2+1]);N.strokeStyle=`rgba(110,74,18,${(L*.34).toFixed(3)})`,N.lineWidth=j.sz*1.7+1,N.stroke()}for(let z=R-1;z>0;z--){const t=1-z/R,a=L*(.3+.7*t);a<.015||(N.beginPath(),N.moveTo(j.tr[z*2],j.tr[z*2+1]),N.lineTo(j.tr[z*2-2],j.tr[z*2-1]),N.strokeStyle=t>.86?`rgba(255,255,255,${(a*.95).toFixed(3)})`:t>.34?`rgba(255,233,168,${(a*.9).toFixed(3)})`:`rgba(201,154,63,${(a*.7).toFixed(3)})`,N.lineWidth=j.sz*(.55+t*.85),N.stroke())}N.beginPath(),N.arc(_,Z,j.sz*.6,0,6.2832),N.fillStyle=`rgba(255,255,255,${Math.min(1,L).toFixed(3)})`,N.fill()}}}}const ei='<svg viewBox="0 0 414.312 414.312"><path d="M398.932,139.543l-1.133-0.472l-0.944-0.802c-3.316-2.834-7.495-4.268-12.441-4.268H272.546l-0.346-7.432 c-0.69-14.637-1.219-29.28-1.741-43.922c-0.736-20.367-1.493-41.423-2.697-62.075c-0.73-12.355-9.855-18.055-18.158-19.266 l-1.158-0.261C246.12,0.333,244.084,0,242.047,0h-97.71c-10.364,0-15.102,5.949-17.25,10.936l-0.754,1.737l-1.465,1.201 c-4.192,3.443-6.287,8.336-6.23,14.543c0.35,37.719,4.222,75.309,7.967,107.107l0.957,8.097l-37.133,2.724 c-19.999,1.47-39.991,2.943-59.991,4.377c-3.389,0.244-6.416,1.161-9.244,2.793l-0.889,0.515l-0.995,0.264 c-8.765,2.351-15.125,10.494-15.125,19.355v5.583c0,3.031,0.805,6.094,2.397,9.11l0.754,1.427l0.114,1.609 c2.123,27.218,2.303,54.68,2.308,82.771c0,13.441,10.077,17.356,14.414,18.418l0.937,0.289c2.48,0.954,4.951,1.411,7.561,1.411 h102.885l0.17,7.622c0.267,11.827,0.665,23.648,1.066,35.465c0.635,18.591,1.29,37.815,1.384,56.803 c0.066,13.192,9.884,17.219,14.106,18.342l0.919,0.31c2.509,1.01,5.091,1.503,7.889,1.503h94.913c5.474,0,9.973-1.742,13.391-5.18 l1.538-1.523c3.443-3.423,5.189-7.932,5.189-13.416c-0.005-29.178-0.208-63.576-1.676-97.37l-0.355-8.14h113.128 c12.659,0,18.098-9.1,18.981-17.616l0.183-1.777l0.935-1.523c1.889-3.062,2.812-6.454,2.812-10.364V156.904 C410.118,146.396,404.045,141.658,398.932,139.543z M369.885,248.455H253.219c-15.234,0-18.316,12.599-18.905,16.463l-0.3,1.25 c-0.792,2.427-1.097,4.879-0.935,7.5c2.118,34.042,2.569,67.349,2.722,92.561l0.046,7.846h-57.706l-0.208-7.586 c-0.262-9.303-0.584-18.616-0.911-27.919c-0.64-18.332-1.305-37.282-1.404-56c-0.01-1.752-0.249-3.483-0.759-5.454l-0.274-1.076 l0.035-1.112c0.193-6.129-1.825-11.837-5.527-15.665c-3.359-3.474-7.929-5.23-13.591-5.23H49.942l-0.084-7.714 c-0.17-16.849-0.8-33.301-1.866-48.906l-0.536-7.749l36.409-2.671c19.974-1.473,39.941-2.938,59.908-4.373 c1.731-0.127,3.458-0.479,5.423-1.109l1.369-0.437l1.439,0.084c6.251,0.375,11.882-1.612,15.059-5.215 c2.668-3.021,3.687-7.223,3.031-12.484c-5.329-42.754-9.166-78.696-10.555-115.131l-0.312-8.097h69.312l0.319,7.472 c0.473,11.212,0.869,22.427,1.265,33.644c0.772,21.886,1.579,44.521,2.955,66.702c0.087,1.338,0.311,2.704,0.701,4.296 l0.233,1.856c0.036,9.968,5.982,20.035,19.195,20.035h116.676V248.455z"/></svg>';function Go(o={}){const{faces:n=[],label:s="Add photo",labelPicked:c="Change photo",note:p="",subnote:l="",ariaLabel:f="Add a photo of your god",onPick:m}=o,y=document.createElement("span");y.className="ph-portal";const N=document.createElement("span");N.className="ph-halo",N.setAttribute("aria-hidden","true");const O=document.createElement("span");O.className="ph-rim",O.setAttribute("aria-hidden","true");const x=document.createElement("canvas");x.className="ph-spark",x.setAttribute("aria-hidden","true");const F=document.createElement("button");F.type="button",F.className="ph-add",F.setAttribute("aria-label",f),m&&F.addEventListener("click",m);const j=n.slice(0,12),v=j.length?`<span class="ph-add-cyc" aria-hidden="true" style="--ph-cycn:${Math.max(1,j.length)}">`+j.map((Z,L)=>`<img src="${Z}" alt="" style="animation-delay:calc(var(--ph-cyc) * ${L})">`).join("")+"</span>":"",_=Z=>{F.classList.toggle("has-photo",!!Z),F.innerHTML='<span class="ph-bed" aria-hidden="true"></span>'+(Z?"":v)+'<span class="ph-add-veil" aria-hidden="true"></span>'+(Z?`<img class="ph-shot" src="${Z}" alt="">`:"")+`<span class="ph-mark"><span class="ph-ico" aria-hidden="true">${ei}</span><span class="ph-lbl">${Z?c:s}</span>`+(p?`<span class="ph-note">${p}</span>`:"")+(l?`<span class="ph-sub">${l}</span>`:"")+"</span>"};return _(null),y.append(N,O,x,F),{el:y,canvas:x,setPhoto:_}}const Yo=`
/* Miesto, kam sa portál pripne. display:contents nechá .ph-portal stať sa
   priamym prvkom rodičovského rozloženia — bez toho by medzi flex stĺpec a
   portál vliezol obal bez štýlov a rozloženie by sa posunulo. */
.ph-mount { display: contents; }

/* ── PORTÁL = CTA ────────────────────────────────────────────────────
   Matej 27. 8. 2026: *„to políčko na foto je škaredé… chcem aby sme ten
   portál rozanimovali, niečo v duchu doktora Strangeho… toto musí byť
   silný prvok, klikateľný"*. Vyladené v plany/portal-lab.html
   (variant A · Zlatá pečať, paleta Perleť, zaoblený štvorec) — lab je
   zdroj pravdy pre ladenie, sem sa prenášajú len HODNOTY.

   🔴 ČO ZANIKLO 27. 8.: .ph-aura + .ph-aura-2 (dve pulzujúce vrstvy
   žiary), .ph-add-bar (dolný zlatý pás s textom), prerušovaný rám
   a takmer biela výplň. Dôvody, prečo to padlo, sú v labe; sem patrí
   len to, že dolný pás na zaoblenom štvorci ukrajoval štvrtinu fotky
   a text patrí POD ikonku, nie do pruhu.

   ⚠️ VŠETKO SA LADÍ CEZ PREMENNÉ NIŽŠIE, nie prepisom pravidiel.
   Hodnoty sú Matejove z labu (27. 8., 12:49). */
.ph-portal {
  position: relative;
  display: inline-flex;
  isolation: isolate;
  pointer-events: auto;

  --ph-w: clamp(98px, 9.2vw, 118px);  /* šírka portálu */
  --ph-r: 24%;                        /* zaoblenie jadra */
  --ph-rimw: 9px;                     /* tvrdá čiara lemu */
  --ph-glow: 0.45;                    /* rozostrenie žiary lemu */
  --ph-icok: 0.25;                    /* ikonka = násobok šírky */
  --ph-lblk: 0.10;                    /* popisok = násobok šírky */
  --ph-notek: 0.068;                  /* poznámka = násobok šírky */
  --ph-halok: 2.45;                    /* biela žiara = násobok šírky */
  --ph-haloa: 1;                      /* sila bielej žiary */
  --ph-rimo: 0.45;                    /* vonkajší obrys lemu */
  --ph-rimin: 5px;                    /* o koľko lem presahuje jadro */
  --ph-cyc: 2.2s;                     /* ako dlho žije jedna tvár */
  /* Paleta „Perleť": biely hrot, zlatý chvost. */
  --ph-rim1: rgba(255,252,238,1);
  --ph-rim2: rgba(255,226,150,0.5);
}

/* Biela žiara pod portálom. Matej 27. 8. 2026: *„medzi tým tmavým blokom
   a iskrami je priestor, cez ktorý presvitajú fotky, ktoré sú vzadu…
   skúsme vyplniť bielou žiarou"* + *„dlaždice pretekajú cez blok, musia
   ísť ZA CTA blok"*. Sú to tie isté dve vety: portál bol v ploche
   PRIEHĽADNÝ, takže cezeň bolo vidieť otáčajúcu sa guľu.
   ⚠️ ŽIADNY filter blur a žiadny animovaný tieň — jeden statický
   radiálny prechod. Vykreslí sa raz a pri otáčaní gule sa už nedotkne
   (pravidlo č. 1 zadania: sekanie spôsoboval práve prekresľovaný tieň).
   ⚠️ Kruh, nie zaoblený štvorec: koróna iskier je kruhová, takže rohy
   štvorca by trčali von ako biele uši.
   ⚠️ Toto NIE JE tá zamietnutá „hmla pod textom" (Matej 26. 8.: *„prečo
   je logo aj CTA ako keby zahmlené"*) — tá ležala POD PÍSMOM a kalila ho.
   Táto leží pod TMAVOU dlaždicou a kontrast naopak dvíha. */
.ph-halo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--ph-w) * var(--ph-halok));
  height: calc(var(--ph-w) * var(--ph-halok));
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(closest-side,
    rgba(253,248,236,var(--ph-haloa)) 0%,
    rgba(253,248,236,var(--ph-haloa)) 58%,
    rgba(253,248,236,calc(0.94 * var(--ph-haloa))) 72%,
    rgba(253,248,236,calc(0.58 * var(--ph-haloa))) 86%,
    rgba(253,248,236,0) 100%);
}

/* Lem. ⚠️ Tvrdá čiara a jej žiara sú DVE NEZÁVISLÉ veci — Matej 27. 8.:
   *„je veľmi hrubý tá biela časť ten lem"*, a tá hrúbka nebola tá čiara,
   ale jej 16px halo. Preto má halo vlastný násobič --ph-glow.
   ⚠️ STATICKÝ box-shadow, NIKDY animovaný: animovaný tieň sa prekresľuje
   v každom snímku aj s rozostrením a to bolo pôvodné Matejovo
   *„stránka hrozne seká pri točení"*. */
.ph-rim {
  position: absolute;
  /* ⚠️ Presah lemu je PREMENNÁ, nie číslo: to isté číslo potrebuje aj
     maska vodiacich čiar kót (ctaMask v tomto súbore), aby vedela, kde
     končí CTA. Dva zápisy toho istého presahu by sa pri prvej zmene
     rozišli a čiara by zase preťala lem. */
  inset: calc(-1 * var(--ph-rimin));
  border-radius: 26%;
  pointer-events: none;
  z-index: 1;
  box-shadow:
    0 0 0 var(--ph-rimw) var(--ph-rim1),
    /* Vonkajší obrys. Kým bola za lemom otáčajúca sa guľa, lem sa od nej
       odlíšil sám. Odkedy je za ním biela žiara, je to krémová na krémovej
       a lem zmizol — obrys mu vracia hranu. Zadanie, otvorený bod č. 5:
       *„Kontrast lemu proti guli… zvážiť tmavší vonkajší obrys."*
       Nula ho vypne. */
    0 0 0 calc(var(--ph-rimw) + 1.25px) rgba(201,154,63,var(--ph-rimo)),
    0 0 calc(16px * var(--ph-glow)) calc(2px * var(--ph-glow)) var(--ph-rim2),
    inset 0 0 calc(16px * var(--ph-glow)) calc(3px * var(--ph-glow)) var(--ph-rim2);
}

/* Iskry. Plátno je väčšie než portál — vyhodená iskra doletí ďaleko a orezaná
   v polovici vyzerá ako chyba vykreslenia. O koľko väčšie, hovorí SPARK_MARGIN
   vyššie; je to pevný počet pixelov, nie násobok šírky. */
.ph-spark {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

.ph-add {
  pointer-events: auto;
  position: relative;
  z-index: 2;
  width: var(--ph-w);
  height: var(--ph-w);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: 0;
  overflow: hidden;
  border-radius: var(--ph-r);
  background: transparent;
  cursor: pointer;
  transition: transform 0.22s;
}
.ph-portal:hover .ph-add { transform: scale(1.035); }
.ph-portal:active .ph-add { transform: scale(0.98); }

/* Jadro je TMAVÉ zámerne. Na papyruse nesie kontrast tma, nie ďalšie
   svetlo — takmer biela dlaždica sa na svetlej stránke stratila a presne
   to bolo Matejovo *„nevyzerá vôbec dobre, je inej farby"*.
   Tma je LAPIS, priesvitná (guľa 28. 9. 2026: *„nie čierne ale tmavomodré,
   priesvitnosť zachovaj"*) — od 7. 10. 2026 aj na stene, JEDEN tvar pre oba
   povrchy (Matej: *„na wall a na onepage nie je totožný portál… treba aby to
   bolo to isté = jemný tmavomodrý priesvitný tint a meniace sa foto"*). */
.ph-bed {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 120% at 50% 30%, rgba(30,60,144,.9) 0%, rgba(22,48,122,.9) 55%, rgba(10,26,74,.92) 100%);
}

/* Tváre zo steny sa striedajú POMALY. Do 27. 8. bolo v slučke 12 fotiek
   za 12 s, teda strih každú sekundu — Matej: *„rýchlo sa menia fotky"*.
   Dĺžka slučky = počet fotiek × --ph-cyc, takže tempo sa ladí JEDNÝM
   číslom a nezáleží, koľko fotiek je v zozname. */
.ph-add-cyc { position: absolute; inset: 0; }
.ph-add-cyc img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; opacity: 0;
  animation: phCyc calc(var(--ph-cyc) * var(--ph-cycn, 12)) linear infinite;
  will-change: opacity;
}
@keyframes phCyc {
  0%   { opacity: 0 }
  3%   { opacity: 0.5 }
  10%  { opacity: 0.5 }
  13%  { opacity: 0 }
  100% { opacity: 0 }
}
.ph-add-veil {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(10,26,74,0.12), rgba(10,26,74,0.5));
}

/* ── ZNAČKA V STREDE: brandové PLUS a POD NÍM popisok ────────────────
   Matej 27. 8.: *„ADD PHOTO dajme pod + do vnútra a plusko dajme naše
   brandové aj s možnosťou zmeny veľkosti pre text aj ikonku"*.
   Plus je z hand-drawn kitu (plus-hand-drawn-sign), nie dva prúžky —
   kreslené + má rukopis, ktorý dva obdĺžniky nedajú.
   ⚠️ Obe veľkosti sú NÁSOBKY šírky portálu, nie pixely: pri zmene šírky
   by sa pevné pixely s portálom rozišli. */
.ph-mark {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  gap: calc(var(--ph-w) * 0.045);
  /* Strop šírky, aby sa poznámka pod popiskom ZALOMILA a nevytiekla
     z jadra (jadro má overflow: hidden, orezala by sa v pol slova). */
  max-width: calc(var(--ph-w) * 0.86);
  pointer-events: none;
  color: #FFF6DA;
}
.ph-ico {
  width: calc(var(--ph-w) * var(--ph-icok));
  height: calc(var(--ph-w) * var(--ph-icok));
  display: block;
  filter: drop-shadow(0 0 6px rgba(255,235,170,0.8)) drop-shadow(0 0 16px rgba(245,199,61,0.5));
}
.ph-ico svg { width: 100%; height: 100%; display: block; fill: currentColor; }
.ph-lbl {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: calc(var(--ph-w) * var(--ph-lblk));
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 0 8px rgba(0,0,0,0.35);
}

/* Fotka vybraná → portál sa zavrie okolo nej a ZNAČKA CELÁ ZHASNE.
   Matej 28. 8. 2026: *„change photo preblikuje, je slabo vidno, väčšinu času
   je bez textu"*. Popisok stál v svetlom inkouste PRIAMO NA FOTKE, lebo veil
   sa v tomto stave vypína — na tmavej fotke bol vidieť, na svetlej zmizol,
   a keďže sa dlaždica na guli otáča, striedalo sa to. Čitateľnosť by sa dala
   vrátiť clonou, ale tá by zase zatemnila fotku, ktorú si človek práve vybral.
   ⚠️ Zmenu fotky preto NEPONÚKA dlaždica, ale karta, ktorá sa nad ňou otvára
   (photoConfirm.ts, odkaz „Choose another photo"). Klik na dlaždicu s fotkou
   ju otvorí — afordancia nezanikla, len sa presťahovala tam, kde má podklad. */
.ph-add.has-photo .ph-add-cyc,
.ph-add.has-photo .ph-add-veil { display: none; }
.ph-add.has-photo .ph-mark { display: none; }
.ph-shot {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
}

/* Kto má vypnuté animácie, dostane pokojný portál — nie zhasnutý.
   Iskry sa nekreslia vôbec (rieši drawSparks), lem a jadro ostávajú. */
@media (prefers-reduced-motion: reduce) {
  .ph-add-cyc img { animation: none; opacity: 0.5; }
}
.ph-add-file { display: none; }
/* Poznámka je VNÚTRI tmavého jadra, pod popiskom. Matej 27. 8. 2026:
   *„vetu «you can change later» skúsme dať dovnútra toho tmavého bloku
   pod ADD PHOTO"*. Predtým ležala pod portálom priamo na fotkách gule
   a iskry cez ňu preletovali (otvorený bod č. 1 zadania) — presunom
   dovnútra zanikol aj ten spor, nie je čo odsúvať.
   ⚠️ Veľkosť je NÁSOBOK šírky portálu, nie rem: pevná veľkosť by sa pri
   clamp-nutej šírke s jadrom rozišla a text by z neho vytiekol.
   Halo zaniklo — na tmavom jadre nemá čo presvetľovať. */
.ph-note {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 400;
  font-size: calc(var(--ph-w) * var(--ph-notek));
  /* ⚠️ ZALOMENIE JE VOLITEĽNÉ, NIE PEVNÉ. Stena (260 px) veta na jeden riadok
     unesie, guľa (118 px) NIE — pri jej šírke by nowrap vetu vystrčil z jadra,
     ktoré má overflow hidden, teda by sa orezala v pol slova. Prepínač preto
     ostáva na volajúcom: stena si nastaví premennú, guľa nie. */
  white-space: var(--ph-note-ws, normal);
  line-height: 1.25;
  letter-spacing: 0.02em;
  text-align: center;
  color: rgba(255,246,218,0.72);
}
/* Číslo v poznámke je to jediné, čo sa v nej mení — nesie zlato, aby ho oko
   našlo bez toho, aby celý riadok kričal. */
.ph-note b { font-weight: 600; color: #F5C73D; }

/* Podradený riadok pod poznámkou (uistenie „fotku vieš zmeniť neskôr").
   ⚠️ Veľkosť je NÁSOBOK šírky portálu, rovnako ako .ph-note — pevná by sa
   pri clamp-nutej šírke s jadrom rozišla. Na guli (118 px) sa nezapína:
   dva riadky drobného textu by tam ostali nečitateľné. */
.ph-sub {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 400;
  font-size: calc(var(--ph-w) * var(--ph-subk, 0.052));
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-align: center;
  color: rgba(255,246,218,0.46);
}

/* ── PORADOVÉ ČÍSLO = OUTLINE PILULKA NA SPODKU BLOKU ────────────────────
   Matej 27. 8. 2026: *„tá info o počte daj ju naspodok toho bloku do pilsu
   ale outline nie plného"*.
   🔴 OUTLINE JE PRAVIDLO, NIE VKUS. Plná farebná plocha patrí jedinému prvku —
   hlavnému CTA, a tým je práve tento portál. Pilulka stojí VNÚTRI neho, takže
   plnú výplň mať nesmie, inak si tlačidlo konkuruje samo so sebou.
   ⚠️ Zapína ju stena tým, že pošle subnote s týmto obalom; guľa subnote
   nemá (118 px by drobnú pilulku neuniesla), takže sa jej to netýka. */
.ph-nopill {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 1.05em;
  border-radius: 999px;
  border: 1px solid rgba(245,199,61,0.55);
  background: transparent;
  color: rgba(255,246,218,0.80);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1;
}
.ph-nopill b { font-weight: 600; color: #F5C73D; letter-spacing: 0.02em; }

/* Fotka je vybraná → popisok už hovorí „Change photo", poznámka
   o tom istom by bola druhýkrát to isté. */
.ph-add.has-photo .ph-note,
.ph-add.has-photo .ph-sub { display: none; }
`;function ti(o){if(!o)return null;const n=new Date(o);if(Number.isNaN(n.getTime()))return null;const s=Math.floor((Date.now()-n.getTime())/864e5);return s>=0?s:null}function ai(o,n){return!o.guest&&o.n!=null&&o.name?zn(o.n,`${n}-invite`,o.name):o.wallId?`https://dogypt.com/?dog=${encodeURIComponent(o.wallId)}`:null}function Ko({dog:o,where:n,edgeBase:s,anonKey:c}){const p=_e(),[l,f]=r.useState(!1),[m,y]=r.useState(!1),[N,O]=r.useState(""),[x,F]=r.useState("idle");r.useEffect(()=>{o.guest&&Pa()},[o.guest]),r.useEffect(()=>{f(!1),y(!1),O(""),F("idle")},[o.key]),r.useEffect(()=>{if(!l)return;const R=window.setTimeout(()=>f(!1),2200);return()=>window.clearTimeout(R)},[l]);const j=ai(o,n),v=ti(o.birthDate),_=async()=>{var a;if(!j)return;const R=p("wall.inviteText",{name:o.name}),z=(a=window.matchMedia)==null?void 0:a.call(window,"(pointer: coarse)").matches;let t="copy";if(z&&typeof navigator.share=="function")try{await navigator.share({title:`${o.name} · DOGYPT`,text:R,url:j}),t="share"}catch{t="cancel"}else try{await navigator.clipboard.writeText(`${R} ${j}`),f(!0)}catch{t="cancel"}Te("dog_invite",{where:n,how:t,guest:!!o.guest,...o.n!=null?{pack_number:o.n}:{}})},Z=async()=>{if(!(!o.wallId||!s||!c||!N.includes("@")||x!=="idle")){F("sending");try{await fetch(`${s}/send-guest-mail`,{method:"POST",headers:{"Content-Type":"application/json",apikey:c,Authorization:`Bearer ${c}`},body:JSON.stringify({kind:"resend",dogId:o.wallId,email:N.trim()})})}catch{}F("sent")}},L=j&&e.jsxs("button",{type:"button",className:`pp-act ${o.guest?"pp-act--out":"pp-act--cta"}`,onClick:_,children:[e.jsx(Tn,{size:16}),p(l?"wall.inviteCopied":"wall.invite")]});return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"pp-photo-wrap",children:[e.jsx("img",{className:`pp-photo${o.guest?" is-vision":""}`,src:o.photo,alt:"",draggable:!1}),o.n!=null&&!o.guest&&e.jsxs("span",{className:"pp-seal",children:["#",o.n]})]}),e.jsx("div",{className:"pp-name",children:o.name}),v!==null&&e.jsxs("div",{className:"pp-life",children:[e.jsxs("span",{className:"pp-life-label",children:[e.jsx(Mn,{className:"pp-life-spark","aria-hidden":!0}),p("pack.dog.livingBestLife")]}),e.jsx("span",{className:"pp-days",children:p("dogPage.daysCount",{days:v.toLocaleString("en-US")})})]}),e.jsx("div",{className:"pp-rule"}),o.heroglyph&&e.jsx("img",{className:"pp-glyph",src:o.heroglyph,alt:"",draggable:!1}),e.jsx(Ro,{n:o.n,text:o.message,className:"pp-msg"}),o.status&&e.jsx("p",{className:"pp-status",children:o.status}),o.guest&&m?e.jsx("div",{className:"pp-join",children:x==="sent"?e.jsx("p",{className:"pp-sent",children:p("wall.search.sent")}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"pp-status",children:p("wall.search.joinHint")}),e.jsx("input",{className:"pp-mail",type:"email",inputMode:"email",autoComplete:"email",autoFocus:!0,value:N,placeholder:p("wall.search.emailPh"),onChange:R=>O(R.target.value),onKeyDown:R=>{R.stopPropagation(),R.key==="Enter"&&Z()}}),e.jsx("button",{type:"button",className:"pp-act pp-act--cta",disabled:!N.includes("@")||x!=="idle",onClick:Z,children:p("wall.search.send")})]})}):e.jsx("div",{className:"pp-acts",children:o.guest?e.jsxs(e.Fragment,{children:[L,o.wallId&&s&&e.jsx("button",{type:"button",className:"pp-act pp-act--cta",onClick:()=>y(!0),children:p("wall.search.join")})]}):e.jsxs(e.Fragment,{children:[o.n!=null&&o.name&&e.jsx("a",{className:"pp-act pp-act--out",href:Do(o.name,o.n),children:p("wall.dogPage")}),L]})})]})}const Uo=`
.pp-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 34px 38px 36px;
  border-radius: 16px;
}
.pp-svetla {
  color: #2a1608;
  background: linear-gradient(160deg, #FFFEFA 0%, #FFF9EC 52%, #FBF0D8 100%);
  border: 1.5px solid #C99A3F;
  box-shadow:
    0 0 0 5px rgba(201,154,63,0.16),
    0 28px 62px -18px rgba(70,46,12,0.55),
    inset 0 1px 0 #FFFFFF;
}
.pp-svetla .pp-rule { background: rgba(201,154,63,0.45); }

.pp-photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(201,154,63,0.85);
  box-shadow: 0 6px 18px -6px rgba(70,46,12,0.5);
}
.pp-photo.is-vision { filter: url(#dogypt-dog-vision); }
.pp-name {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.2;
}
.pp-rule {
  height: 1px;
  width: 100%;
  background: rgba(201,154,63,0.35);
  flex-shrink: 0;
}
/* HEROGLYF NA SVETLOM JE ČIERNY, nie zlatý so žiarou — brightness(0) drží alfa
   kanál, takže z bieleho glyfu spraví čistý atrament. */
.pp-glyph {
  width: 62%;
  max-width: 190px;
  height: auto;
  display: block;
  flex-shrink: 0;
  pointer-events: none;
  filter: brightness(0) drop-shadow(0 2px 8px rgba(80,55,15,0.18));
}
${Ln}
.pp-msg {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 300;
  font-size: 0.75rem;
  color: rgba(26,26,26,0.7);
  text-align: center;
  line-height: 1.6;
  font-style: italic;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 10;
  overflow: hidden;
}
.pp-status {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(42,22,8,0.62);
  text-align: center;
}

/* FOTKA S PEČAŤOU — nosič je inline-block, inak by sa roztiahol na šírku karty
   a „stred" by prestal byť stredom fotky. */
.pp-photo-wrap {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
}
.pp-seal {
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.86rem;
  line-height: 1.1;
  letter-spacing: 0.02em;
  /* LAPIS (Matej 28. 9. 2026) — to isté číslo ako odznak #1 na homepage. */
  color: ${Y.ink};
  background: ${Y.grad};
  border: 1.5px solid #FFF8E4;
  border-radius: 999px;
  padding: 3px 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px -3px rgba(70,46,12,0.6);
}

/* ŽIVOT PSA — jeden riadok, text VEDĽA pilulky; flex-wrap je poistka pre dlhé
   preklady. Pilulka dní = LAPIS naprieč appkou (lock 12. 9.). */
.pp-life {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 8px;
}
.pp-life-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8C6014;
}
.pp-life-spark { width: 13px; height: 13px; color: #C99A3F; flex-shrink: 0; }
.pp-days {
  padding: 4px 13px;
  border-radius: 999px;
  background: ${Y.grad};
  color: ${Y.ink};
  font-family: 'Cinzel', serif;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.1;
  white-space: nowrap;
  border: none;
  box-shadow: ${wt};
}

/* ── AKCIE ──────────────────────────────────────────────────────────────
   Na bledom = LAPIS. Plná plocha len pre JEDNU akciu na karte (člen: POZVI ·
   hosť: PRIDAJ SA), druhá je obrys. Tvar = CTA 8 px, nie pilulka. */
.pp-acts {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  margin-top: 4px;
  flex-shrink: 0;
}
.pp-act {
  flex: 1 1 0;
  max-width: 200px;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: box-shadow 200ms ease, background 200ms ease;
}
.pp-act--out {
  color: ${Y.edge};
  background: rgba(255,250,236,0.62);
  border: 1px solid ${Y.edge};
}
.pp-act--out:hover { background: ${Y.fill}; box-shadow: 0 0 12px ${Y.halo}; }
.pp-act--cta {
  color: ${Y.ink};
  background: ${Y.grad};
  border: 1px solid ${Y.edge};
  box-shadow: ${wt};
}
.pp-act--cta:hover { background: ${Y.gradHover}; }
.pp-act:disabled { opacity: 0.45; cursor: default; }

.pp-join { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.pp-join .pp-act { max-width: none; width: 100%; }
.pp-mail {
  height: 44px; width: 100%; box-sizing: border-box; border-radius: 12px; padding: 0 12px;
  border: 1.5px solid ${Y.edge}; background: #fff; color: rgba(0,0,0,0.82);
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; outline: none;
}
.pp-sent {
  margin: 0; padding: 8px 12px; border-radius: 12px;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4; text-align: center;
  color: #2E5C3B; background: rgba(61,122,78,0.12); border: 1px solid rgba(61,122,78,0.4);
}
`,oi="0 2px 6px -2px rgba(5,15,48,0.55), inset 0 1px 0 rgba(201,154,63,0.30)",ft=320,ni=.68,ii="svetla",ri="hlbka",co=o=>o.split("*").map((n,s)=>s%2?e.jsx("span",{className:"g",children:n},s):n),si=200;function li(o,n){const s=2*Math.PI*ft*Math.cos(o*Math.PI/180)/n;return Math.max(4,Math.round(s/2)*2)}function ci(o){const n=Math.sqrt(4*Math.PI*ft*ft/Math.max(8,o)),s=Math.max(8,Math.round(n*ni)),c=n/ft*(180/Math.PI),p=[],l=Math.floor(90/c);for(let f=-l;f<=l;f++){const m=f*c;Math.abs(m)<=90-c*.6&&p.push(m)}return{spacing:n,tile:s,lats:p}}const po=3e3,ho=72,pi=96,Wt=4,mo=Wt*2,da=24,di=40,hi=200,mi=330,ui=76,gi=124,bi=110,xi=14;function fi(){const o=window.innerWidth,n=window.innerHeight,c=o/2-ft-di-da,p=Math.min(mi,Math.floor(c));if(p<hi)return null;const l=(n-ho-pi)/Wt,f=Math.min(gi,Math.floor(l-xi));if(f<ui)return null;const m=[];for(let y=0;y<Wt;y++)m.push(Math.round(ho+l*(y+.5)));return{w:p,h:f,photo:Math.min(62,f-30),lines:f>=bi?3:2,lx:da,rx:o-da-p,ys:m}}const vi=(o,n)=>o==="l"?n.lx+n.w:n.rx,ki=r.memo(function({tiles:n}){return e.jsx(e.Fragment,{children:n.map(({key:s,dog:c,lat:p,lon:l},f)=>e.jsx("div",{className:"planet-tile","data-i":f,style:{"--t":`rotateY(${l}deg) rotateX(${-p}deg) translateZ(${ft}px)`,...c.lqip?{backgroundImage:`url(${c.lqip})`}:null},children:e.jsx("img",{src:c.photo,alt:"",draggable:!1,decoding:"async",onLoad:m=>{m.currentTarget.dataset.ok="1"}})},s))})});function yi({dogs:o,open:n,paused:s=!1,onClose:c,pick:p}){const l=_e(),{lang:f}=Dt(),m=Aa(f),y=r.useMemo(()=>o.reduce((k,C)=>Math.max(k,C.n??0),0),[o]),N=e.jsxs(e.Fragment,{children:[e.jsx("b",{children:y})," / ",l("wall.hero.total")," ",l("wall.hero.dogs")]}),O=Ca(),[x,F]=r.useState(null),[j,v]=r.useState(!1),[_,Z]=r.useState(!1),L=r.useRef(typeof document<"u"&&!!document.getElementById("op-boot"));r.useEffect(()=>{if(!j||_||L.current)return;const k=window.setTimeout(()=>Z(!0),700);return()=>window.clearTimeout(k)},[j,_]),r.useEffect(()=>{if(j)return;let k=!1;const C=()=>{var U;if(k)return;if(k=!0,!L.current){v(!0);return}v(!0),Z(!0);const se=((U=document.fonts)==null?void 0:U.ready)??Promise.resolve();Promise.race([se,new Promise(me=>setTimeout(me,1500))]).then(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>window.dispatchEvent(new Event("dogypt:planet-ready"))))})},$=window.setTimeout(C,L.current?3500:1200),P=window.setInterval(()=>{const se=document.querySelectorAll(".planet-ball img");if(!se.length)return;let U=0;se.forEach(me=>{me.complete&&me.naturalWidth>0&&U++}),U>=Math.min(24,se.length)&&C()},90);return()=>{window.clearTimeout($),window.clearInterval(P)}},[j]);const R=o.slice(0,12).map(k=>k.photo).filter(Boolean),z=r.useRef(null),t=r.useRef(null),a=r.useRef(null),i=r.useRef(null),d=r.useRef(null),h=R.join("|"),b=l("wall.hero.addPhoto");r.useEffect(()=>{const k=t.current;if(!k)return;const C=Go({faces:R,label:b,labelPicked:l("wall.photo.change"),note:"",onPick:()=>w.current?B(w.current):H()}),$=Ho(f);return $>1&&C.el.style.setProperty("--ph-lblk",(.1/$).toFixed(4)),k.appendChild(C.el),i.current=C,a.current=C.el,d.current=Vo(C.canvas),()=>{C.el.remove(),i.current=null,a.current=null,d.current=null}},[h,b,f]),r.useEffect(()=>{var k;(k=i.current)==null||k.setPhoto(x)},[x]);const w=r.useRef(null);r.useEffect(()=>{w.current=x},[x]);const A=()=>{var k;z.current&&(z.current.value=""),(k=z.current)==null||k.click()},H=()=>{z.current&&To(z.current,()=>Lo(null))},T=r.useRef(void 0),B=k=>{Te("planet_photo_confirm_shown"),Oo({photoUrl:k,packNumber:o.reduce((C,$)=>Math.max(C,$.n??0),1)+1,onContinue:C=>{Te("cta_become_dogyptian_click",{location:"planet"}),Io(C,T.current),C&&Te("planet_photo_cropped"),O("/heroglyph/name")},onPickAnother:()=>{Te("planet_photo_confirm_another"),A()},onClose:()=>Te("planet_photo_confirm_dismissed"),copy:{eyebrow:l("wall.photo.yoursWillBe"),lead:l("wall.photo.lead"),cta:l("wall.photo.cta"),another:l("wall.photo.another"),zoom:l("wall.photo.zoom"),later:l("wall.photo.laterNote")}})},ne=k=>{var se;const C=(se=k.target.files)==null?void 0:se[0];if(!C)return;k.target.value="";const $=_o(C),P=$.previewUrl;T.current=$.uploaded,F(P),B(P)},ce=r.useRef({x:-24,y:0}),be=r.useRef(null),Ne=si,q=r.useRef(null),he=r.useRef(!0),[pe,ze]=r.useState([]),ve=r.useRef(0),[ie,ke]=r.useState(null),ye=r.useRef(null),Ge=r.useRef(null),Ie=r.useRef(null),Me=.08,Ae=r.useRef(!1),[K,ae]=r.useState(null),De=ii,Ye=ri,Fe=r.useRef(null),xe=k=>{var C;Fe.current!==k&&((C=Fe.current)==null||C.classList.remove("is-hot"),Fe.current=k,k==null||k.classList.add("is-hot"))},{tiles:qe,tile:He}=r.useMemo(()=>{const{tile:k,lats:C,spacing:$}=ci(Ne);if(o.length===0)return{tiles:[],tile:k};const P=[];let se=0;const U=o.find(me=>me.n===1)??o[0];P.push({key:"pole-top",dog:U,lat:-90,lon:0});for(const me of C){const Pe=li(me,$);for(let Oe=0;Oe<Pe;Oe++)P.push({key:`${me}:${Oe}`,dog:o[se%o.length],lat:me,lon:360/Pe*Oe}),se++}return P.push({key:"pole-bottom",dog:o[se%o.length],lat:90,lon:0}),{tiles:P,tile:k}},[o,Ne]);r.useEffect(()=>{if(!n||!p)return;const k=o.find(C=>C.n===p.n);k&&ae(k)},[p==null?void 0:p.seq,n,o]);const Ue=k=>{var $;if(!k)return null;const C=Number(k.dataset.i);return Number.isInteger(C)?(($=qe[C])==null?void 0:$.dog)??null:null},kt=(k,C,$,P)=>{var Oe;const se=new Set($.filter(ue=>ue.side===k).map(ue=>ue.slot)),U=k==="l"?((Oe=document.querySelector(".numpad-overlay--planet.open .numpad"))==null?void 0:Oe.getBoundingClientRect())??null:null;let me=null,Pe=1/0;for(let ue=0;ue<Wt;ue++){if(se.has(ue)||U&&U.left<P.lx+P.w&&Math.abs(P.ys[ue]-(U.top+U.height/2))<(P.h+U.height)/2)continue;const at=Math.abs(P.ys[ue]-C);at<Pe&&(Pe=at,me=ue)}return me},it=()=>{var P,se;if(Ae.current)return;const k=performance.now(),C=Ie.current;let $=null;if(C&&!q.current&&!K){const U=document.elementFromPoint(C.x,C.y),me=((P=U==null?void 0:U.closest)==null?void 0:P.call(U,".planet-tile"))??null;me?$=me:(se=U==null?void 0:U.closest)!=null&&se.call(U,".planet-ball")&&($=Fe.current)}xe($),ze(U=>{let me=U;if($&&!U.some(ue=>ue.el===$)){const ue=Ue($),at=$.getBoundingClientRect(),Xe=at.left+at.width/2,rt=at.top+at.height/2,gt=ye.current;if(ue&&gt){const yt=(C?C.x:Xe)<window.innerWidth/2?"l":"r",Rt=kt(yt,rt,U,gt);Rt!==null&&(me=[...U,{id:ve.current++,dog:ue,side:yt,el:$,x:Xe,y:rt,slot:Rt,leftAt:null}],me.length>mo&&(me=me.slice(me.length-mo)))}}let Pe=me!==U;const Oe=[];for(const ue of me){if(!ue.el.isConnected){Pe=!0;continue}const Xe=ue.el===$||Ge.current===ue.id?null:ue.leftAt??k;if(Xe!==null&&k-Xe>po){Pe=!0;continue}const rt=ue.el.getBoundingClientRect(),gt=rt.left+rt.width/2,yt=rt.top+rt.height/2;Xe!==ue.leftAt||Math.abs(gt-ue.x)>.5||Math.abs(yt-ue.y)>.5?(Oe.push({...ue,x:gt,y:yt,leftAt:Xe}),Pe=!0):Oe.push(ue)}return Pe?Oe:U})};r.useEffect(()=>{if(!n)return;let k=0;const C=4;Ae.current=window.scrollY>C;let $=window.scrollY;const P=()=>{const se=window.scrollY;ce.current.y+=(se-$)*Me,$=se,Ae.current||(Ae.current=!0,Ie.current=null,xe(null),ze(U=>U.length?[]:U)),clearTimeout(k),k=window.setTimeout(()=>{Ae.current=window.scrollY>C},160)};return window.addEventListener("scroll",P,{capture:!0,passive:!0}),()=>{window.removeEventListener("scroll",P,!0),clearTimeout(k),Ae.current=!1}},[n]),r.useEffect(()=>{if(!n||s)return;let k=0,C=0,$=performance.now(),P="";const se=U=>{var ue;const me=U-$;$=U,!Ae.current&&he.current&&(ce.current.y+=me*.006);const Pe=be.current,Oe=`rotateX(${ce.current.x}deg) rotateY(${ce.current.y}deg)`;Pe&&Oe!==P&&(Pe.style.transform=Oe,P=Oe),!Ae.current&&++C%4===0&&it(),!Ae.current&&!$o&&((ue=d.current)==null||ue.frame(Math.min(.05,me/1e3))),k=requestAnimationFrame(se)};return k=requestAnimationFrame(se),()=>cancelAnimationFrame(k)},[n,s,qe,K]);const Se=k=>k.leftAt!==null&&performance.now()-k.leftAt>po-500;r.useEffect(()=>{const k=()=>{const C=fi();ye.current=C,ke(C),C||ze([])};return k(),window.addEventListener("resize",k),()=>window.removeEventListener("resize",k)},[]),r.useEffect(()=>{const $=()=>{document.documentElement.style.setProperty("--ball-fit",String(Math.max(.3,(window.innerWidth-12)/662)))};return $(),window.addEventListener("resize",$),()=>{window.removeEventListener("resize",$),document.documentElement.style.removeProperty("--ball-fit")}},[]),r.useEffect(()=>(document.body.classList.toggle("planet-open",n),()=>document.body.classList.remove("planet-open")),[n]),r.useEffect(()=>{if(!n)return;const k=C=>{C.key==="Escape"&&(K?ae(null):c())};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[n,c,K]),r.useEffect(()=>{xe(null),ze([])},[Ne]),r.useEffect(()=>{n||(xe(null),ze([]),ae(null))},[n]);const ut=k=>{var $,P;const C=k.target.closest(".planet-tile");q.current={x:k.clientX,y:k.clientY,dist:0,tile:C},he.current=!1,(P=($=be.current)==null?void 0:$.setPointerCapture)==null||P.call($,k.pointerId)},fe=k=>{const C=q.current;if(!C){if(k.pointerType!=="mouse")return;Ie.current={x:k.clientX,y:k.clientY},it();return}C.dist+=Math.hypot(k.clientX-C.x,k.clientY-C.y);const $=ce.current;$.x=Math.max(-62,Math.min(62,$.x-(k.clientY-C.y)*.25)),$.y+=(k.clientX-C.x)*.25,C.x=k.clientX,C.y=k.clientY},$e=()=>{const k=q.current;if(q.current=null,he.current=!0,!k||k.dist>=12)return;const C=Ue(k.tile);ae(C),C||xe(null)},Lt=k=>{if(!K||o.length<2)return;const C=o.indexOf(K);C<0||ae(o[(C+k+o.length)%o.length])},tt=(()=>{const k=a.current;if(!k||!pe.length)return null;const C=k.getBoundingClientRect();if(!C.width)return null;const $=getComputedStyle(k),P=C.width/(k.offsetWidth||C.width),se=Oe=>parseFloat($.getPropertyValue(Oe))||0,U=(se("--ph-rimin")+se("--ph-rimw"))*P,me=C.width+U*2,Pe=C.height+U*2;return{x:C.x-U,y:C.y-U,w:me,h:Pe,r:me*((se("--ph-r")||24)/100)}})();return e.jsxs("div",{className:`planet-root v-side d-${De} b-${Ye}${n?" open":""}${K?" pop":""}`,onClick:k=>{if(!K)return;const C=k.target;C.closest(".pp-panel")||C.closest(".planet-ball")||C.closest(".pnote")||ae(null)},"aria-hidden":!n,children:[e.jsx("style",{children:Uo+`
        .planet-root {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          /* 🔴 ZAVRETÁ GUĽA SA AJ SCHOVÁ (7. 10. 2026). Matej: *„slajdovanie po
             /wall nie je plynulé a zasekáva sa"*. Na /wall ležala pod stenou
             guľa s ~200 dlaždicami v 3D s opacity 0 — prehliadač ju skladal na
             každý snímok ťahu. visibility ju z toho vyradí; oneskorená o dĺžku
             hasnutia, aby odchod gule ostal plynulý. */
          visibility: hidden;
          pointer-events: none;
          transition: opacity 420ms ease, visibility 0s linear 420ms;
          background:
            radial-gradient(120% 100% at 50% 42%, #FDF8EC 0%, #F6EAD0 46%, #EBD9B4 100%);
          overflow: hidden;
        }
        .planet-root.open { opacity: 1; visibility: visible; pointer-events: auto; transition: opacity 420ms ease, visibility 0s; }

        /* Scéna: guľa sa pri otvorení „odďaľuje" — nabehne zväčšená a sadne na 1.
           To je celý vtip prechodu zo steny (stena = maximálne priblíženie). */
        .planet-stage {
          position: relative;
          width: ${ft*2}px;
          height: ${ft*2}px;
          perspective: 1400px;
          transform: scale(1.75);
          opacity: 0;
          transition: transform 620ms cubic-bezier(.22,.9,.28,1), opacity 420ms ease;
          touch-action: none;
        }
        /* ⚠️ --op-sc je NÁSOBIČ, nie hotová mierka. Film (/onepage) ním guľu
           posiela do diaľky; keby si zapisoval celý transform priamo na prvok,
           prebil by KAŽDÉ pravidlo nižšie — vrátane toho, ktoré guľu odsúva
           pri otvorení karty psa. Matej 26. 8. 2026: *„pri kliku na psa
           planétu neodsunie dolava… prečo?"* Presne preto.
           Mimo filmu je nenastavená a fallback 1 nechá pôvodné hodnoty. */
        .planet-root.open .planet-stage { transform: scale(var(--op-sc, 1)); opacity: 1; }

        /* Šírka panela detailu má JEDEN zdroj — guľa sa podľa nej uhýba, takže
           dve nezávislé čísla by sa pri prvej zmene rozišli a panel by buď
           prekryl psov, alebo nechal medzeru. */
        .planet-root { --pw: clamp(380px, 43vw, 640px); }

        .planet-ball {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          cursor: grab;
        }
        .planet-ball:active { cursor: grabbing; }

        /* Dlaždica psa. backface-visibility skryje zadnú pologuľu — bez toho by
           sa fotky zozadu prekresľovali cez predné a guľa by bola kaša. */
        .planet-tile {
          position: absolute;
          left: 50%;
          top: 50%;
          /* Veľkosť je dynamická (mení sa s počtom psov) → ide cez premennú
             nastavenú na guli, nie cez konštantu v tomto reťazci. */
          width: var(--tile);
          height: var(--tile);
          margin: calc(var(--tile) / -2) 0 0 calc(var(--tile) / -2);
          border-radius: calc(var(--tile) * 0.17);
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border: 1.5px solid rgba(201,154,63,0.85);
          box-shadow: 0 6px 16px -6px rgba(70,46,12,0.55);
          background: #EADCBB center / cover no-repeat;
          /* Poloha na guli je v premennej, nie priamo v transform — zvýraznenie
             tak vie pridať scale bez toho, aby React prekresľoval dlaždice. */
          transform: var(--t);
          transition: box-shadow 160ms ease, border-color 160ms ease;
        }
        /* Dlaždica pod kurzorom: vystúpi a orámuje sa. Rovnaká úloha ako bledý
           závoj na stene — povedať „táto, nie tá vedľa". */
        .planet-tile.is-hot {
          transform: var(--t) scale(1.18);
          border-color: #F4DC97;
          box-shadow: 0 0 0 2px rgba(244,220,151,0.55), 0 10px 26px -8px rgba(70,46,12,0.8);
          z-index: 4;
        }
        .planet-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
          opacity: 0;
          transition: opacity 420ms ease;
        }
        .planet-tile img[data-ok] { opacity: 1; }

        /* Svetlo: guľa musí mať objem, inak je to plochý koláž-kruh.
           Vrstva NAD dlaždicami — stmaví okraje, presvetlí ľavý horný kvadrant. */
        .planet-shade {
          position: absolute;
          inset: -2%;
          border-radius: 50%;
          pointer-events: none;
          background:
            radial-gradient(65% 65% at 32% 26%, rgba(255,248,228,0.42), transparent 58%),
            radial-gradient(100% 100% at 50% 50%, transparent 52%, rgba(74,48,10,0.42) 100%);
        }

        /* Stred: logo + CTA. Nie je „vnútri" gule — leží pred ňou, aby ostalo
           čitateľné pri každom otočení. */
        .planet-hero {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: min(1320px, 94vw);
          text-align: center;
          pointer-events: none;
        }
        /* ⚠️ ŽIADNA HMLA POD TEXTOM. Tu bol mliečny radial rgba(253,248,236,0.92)
           s dosahom 110×150 px, ktorý mal udržať logo čitateľné nad otáčajúcimi
           sa fotkami — Matej 26. 8.: *„prečo je logo aj CTA ako keby zahmlené
           a nevýrazné?"*. Mal pravdu: na papyruse je to fľak, nie podklad.
           Čitateľnosť teraz drží HALO OKOLO PÍSMEN (text-shadow), ktoré kopíruje
           tvar textu namiesto toho, aby prekrylo kus gule. */
        /* ⚠️ JEDEN RIADOK (Matej 26. 8.: „dajme to do jedného riadku a tagline
           druhý riadok"). Veľkosť preto riadi ŠÍRKA OKNA, nie pevný strop —
           pri nowrap by pevný rem na úzkom okne vystrčil text von z obrazovky.
           Inkoust je plná farba, nie 0.90 alfa: cez fotky gule sa každé percento
           priehľadnosti prejaví ako vyblednutie. */
        .ph-h1 {
          margin: 0;
          white-space: nowrap;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          /* +10 % (Matej 27. 8. 2026: „zvači motto o 10% aj tagline - o 10%“ —
             a po prvom pokuse: *„ja som myslel ale na globe a nie na wall“*).
             Všetky tri body clampu naraz, inak by sa zväčšenie prejavilo len
             v jednom pásme šírok a pri inej šírke okna by zmizlo. */
          font-size: clamp(1.364rem, 5.5vw, 5.28rem);
          line-height: 1.06;
          letter-spacing: 0.005em;
          text-transform: uppercase;
          color: #23150a;
          /* ⚠️ Dosah AJ HUSTOTA. Vrstvy už boli na alfe 1, takže „väčšie halo"
             (Matej 26. 8.) sa dalo spraviť jedine širším rozostrením — a to je
             presne to, čo prestalo stačiť: rozostrené svetlo je pri veľkom
             polomere riedke a fotky gule cezeň presvitajú.
             ⚠️ Preto sa 27. 8. (Matej: *„urob za písmenami výraznejšie halo nech
             sa to lepšie číta"*) pridali BLÍZKE vrstvy, nie ďalšie ďaleké.
             Vrstvy text-shadow sa SČÍTAVAJÚ: dve rozostrenia na 10 a 22 px
             s alfou 1 dajú okolo písmen takmer nepriehľadné jadro, ktoré ďaleké
             vrstvy nikdy nedosiahnu, nech sú akokoľvek široké. Ďaleké ostávajú
             na to, aby halo nemalo viditeľnú hranu. */
          /* ⚠️ 27. 8. druhé pritvrdenie (Matej: *„pridaj ešte halo nech je to
             viac viditeľné"*). Pribudli ďalšie BLÍZKE vrstvy a alfa 1 sa
             posunula až na 96 px — jadro je tým prakticky nepriehľadné. */
          text-shadow:
            0 0 6px rgba(253,248,236,1),
            0 0 14px rgba(253,248,236,1),
            0 0 28px rgba(253,248,236,1),
            0 0 56px rgba(253,248,236,1),
            0 0 96px rgba(253,248,236,1),
            0 0 160px rgba(253,248,236,0.98),
            0 0 240px rgba(253,248,236,0.85);
        }
        /* ⚠️ background shorthand resetuje background-clip — pri gradientovom
           texte sa obe vlastnosti píšu spolu, inak z písmen vznikne plná plocha. */
        /* ⚠️ ŽIADNY ZLATÝ GRADIENT DO PÍSMEN. LAB.goldText má strednú zarážku
           #D8A93F — svetlejšiu než guľa pod textom, takže slovo v strede zmizne.
           Nad fotkami drží jedine plná tmavá zlatá. Gradient si nechaj na povrchy,
           kde je pod textom istá tmavá plocha. */
        /* Riadok nadpisu = blok, ktorý sa NESMIE zalomiť. Toto je jediná
           poistka proti tretiemu riadku — veľkosť písma ju len dopĺňa. */
        .ph-h1 .ph-l { display: block; white-space: nowrap; }
        /* ⚠️ .g, nie „každý span": riadky sú tiež spany a zozlatli by celé. */
        /* 🔶 ODCHÝLKA OD BRAND MANUÁLU, VEDOMÁ (Matej 27. 8. 2026: *„v hero
           nadpise skúsme dať dog a god decoratívom a hrubším"*). Brand v3.2
           vyhradzuje Cinzel Decorative pre MENÁ PSOV na oficiálnych povrchoch
           (DOG ID, certifikát, share karta, GodsGrid, PackTree). Tu ho nesú dve
           slová v nadpise, teda sa signál „toto je meno psa" riedi. Povrch je
           zatiaľ LAB, takže je to vratné jedným riadkom.
           ⚠️ Váha 900 — Cinzel Decorative je načítaný LEN v 700 a 900, čokoľvek
           iné by prehliadač dopočítal falošne. */
        .ph-h1 .g {
          color: #6E4A12;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 900;
          /* ⚠️ O 50 % SILNEJŠIE HALO NEŽ ZVYŠOK NADPISU (Matej 27. 8. 2026:
             *„pridaj o 50% halo viac pri slove dog a god, aby sme to
             zvýraznili"*). Každý polomer je 1,5× oproti .ph-h1 a jadro s alfou 1
             siaha 144 px namiesto 96 — teda +50 % v dosahu aj v hustote.
             ⚠️ PÍŠE SA CELÝ ZOZNAM, NIE PRÍDAVOK. text-shadow sa dedí, ale
             nesčítava: deklarácia na .g nahradí zdedenú, takže vynechať vrstvu
             znamená ju zmazať.
             ⚠️ Tieň sa kreslí za písmenami TOHTO prvku, ale prekrýva glyfy
             susedov vykreslené skôr (Your, IS). Preto sú blízke vrstvy len
             1,5× a nie viac — nad tým začne zlaté slovo vybieľovať čierne
             písmená vedľa seba. */
          /* ⚠️ BIELE HALO, NIE ŽLTÉ (Matej 27. 8. 2026: *„chcem biele halo a
             žiaru nie žltú, aby vyniklo to zlaté písmo, žiara pod nie cez"*).
             Zlatý zážeh z predchádzajúceho pokusu ležal PRI písmenách a farbil
             im okraje — zlato na zlate, takže písmo strácalo hranu namiesto
             toho, aby vyniklo. */
          text-shadow:
            0 0 9px rgba(255,255,255,1),
            0 0 21px rgba(255,255,255,1),
            0 0 42px rgba(255,255,255,0.98),
            0 0 84px rgba(253,248,236,0.9),
            0 0 150px rgba(253,248,236,0.7);
        }
        /* ── ŽIARA POD SLOVOM, NIE CEZ NEHO ──────────────────────────────────
           🔴 TOTO NIE JE text-shadow, A JE TO CELÝ ROZDIEL. Tieň textu sa
           kreslí za vlastnými glyfmi, ale PRES glyfy susedov vykreslené skôr —
           preto pôsobil „cez". Táto vrstva je samostatný prvok so záporným
           z-indexom, teda sa vykreslí PRED celým obsahom hera: leží pod
           písmenami DOG/GOD aj pod tými vedľa a ani jedno nezafarbí.
           ⚠️ Prečo je čisto biela a nie papyrusová: základné halo nadpisu je
           krémové (253,248,236). Pri čisto bielej sa mení ODTIEŇ, nie len jas —
           a to je jediné, čo je na svetlom podklade vidieť (rozšíriť krémovú
           krémovou nezaberá, odmerané: rozdiel 29 z 765 na pixel).
           ⚠️ Rozmery v em — pool musí rásť so slovom, nie s oknom. */
        .ph-h1 .g {
          position: relative;
        }
        /* 🔴 POD OPONOU BEZ HALA (perf mobil 7. 10. 2026). Opona z index.html je plne krycia,
           nadpis sa pod ňou prvý raz vykreslí bez text-shadow a halo dostane o snímky neskôr
           (trieda html.op-booting padne pri zdvihu opony). Človek rozdiel nevidí; meranie LCP
           berie plochu z PRVÉHO vykreslenia a halo ju nafúklo ~9× — PageSpeed potom čakal
           na celú guľu (11 s) namiesto loga opony. Zmazať = späť na 11 s. */
        html.op-booting .planet-hero, html.op-booting .planet-hero * { text-shadow: none !important; }
        .ph-h1 .g::before {
          content: '';
          position: absolute;
          left: -0.44em; right: -0.44em;
          top: -0.60em; bottom: -0.52em;
          z-index: -1;
          pointer-events: none;
          border-radius: 50%;
          background: radial-gradient(closest-side,
            rgba(255,255,255,0.98) 0%,
            rgba(255,255,255,0.93) 36%,
            rgba(255,255,255,0.64) 58%,
            rgba(255,254,250,0.28) 76%,
            rgba(255,254,250,0) 92%);
        }
        .planet-hero .ph-lead {
          margin: 0;
          /* Nad žiarou portálu. Žiara sa rozprestiera cez celé pole iskier,
             teda aj pod tento riadok — a keďže portál je POZICOVANÝ a tagline
             nie, portál by ho inak prekryl a slovo „missing" by vybledlo.
             Iskry tak lietajú ZA písmom, čo je aj tak čitateľnejšie. */
          position: relative;
          z-index: 1;
          /* Druhý riadok bloku — takisto bez zalomenia, inak by z dvojriadku
             vznikol štvorriadok a rozloženie by sa vrátilo tam, odkiaľ išlo preč.
             ⚠️ Space Grotesk je načítaný len do váhy 600 — vyššie je fake bold. */
          white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          /* +10 %, tá istá požiadavka aj to isté pravidlo — celý clamp, nie jeden bod. */
          font-size: clamp(0.682rem, 1.815vw, 1.65rem);
          line-height: 1.4;
          color: ${Le.ink};
          /* To isté zhustenie ako pri nadpise — tagline stojí nad tými istými
             fotkami a je o polovicu menší, takže riedke halo tu chýba ešte viac. */
          text-shadow:
            0 0 5px rgba(253,248,236,1),
            0 0 12px rgba(253,248,236,1),
            0 0 26px rgba(253,248,236,1),
            0 0 52px rgba(253,248,236,1),
            0 0 92px rgba(253,248,236,1),
            0 0 150px rgba(253,248,236,0.9);
        }

        /* ── POČET PSOV „84 / 1 000 000 PSOV" (Matej 17. 10. 2026) ──────────
           *„na homepage mi chýba údaj o počte psov — musím si to pozrieť na
           wall"* → vybral variant B z hárku: *„na mobile sa mi páči B, na PC
           asi tiež hore nad nadpis"*. Štítok (PACK_HEAD.label, .26em), nie
           pilulka — pilulka „71 / 1,000,000 DOGS" tu už raz bola a zanikla
           (27. 8.), lebo ležala na fotkách.
           Dva prvky, jeden text: na PC sedí v hero nad nadpisom, na mobile
           nad guľou vo voľnom páse pod logom (v hero by padol na fotky). */
        .ph-count {
          margin: 0;
          position: relative;
          z-index: 2;
          white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: ${Le.ink};
          text-shadow:
            0 0 5px rgba(253,248,236,1),
            0 0 12px rgba(253,248,236,1),
            0 0 26px rgba(253,248,236,1);
        }
        .ph-count b { font-weight: 600; color: ${Le.goldSolid}; }
        .ph-count--mob { display: none; }

        /* ── PORTÁL = CTA ────────────────────────────────────────────────────
           Tvar aj iskry žijú v components/gods/dogPortal.ts — TÚ ISTÚ dlaždicu
           kreslí aj stena (GodsGridLab), ktorá je vanilla DOM. Dve kópie by sa
           rozišli pri prvej úprave, preto je tu len vloženie. */
        ${Yo}
        .planet-hero .join-btn { pointer-events: auto; }

        /* ── TELEFÓN: NADPIS RASTIE ─────────────────────────────────────────
           Pôvodne tu stálo, že „jeden riadok ustupuje veľkosti" — pri 390 px by
           jednoriadkový nadpis mal ~19 px, teda opak toho, že má byť výrazný.
           Od 27. 8. 2026 je nadpis dvojriadkový už aj na PC (tvrdý zlom v JSX),
           takže tento blok rieši už len VEĽKOSŤ.
           ⚠️ +50 % (Matej 27. 8.: *„a na mobile to zvačši o 50%"*) — násobia sa
           všetky tri čísla clampu, nie len strop: na telefóne vyhráva stredný vw
           člen, takže zmena samotného stropu by nebola vidieť.
           ⚠️ VÝSLEDOK JE +44 %, NIE +50 %, A JE TO STROP DANÝ ŠÍRKOU TELEFÓNU.
           Dlhší riadok „YOUR DOG IS" má v Cinzeli 700 šírku 7,17 em, takže pri
           1,5× (12,9vw) potrebuje 92,5vw z 96vw, ktoré má k dispozícii — a to
           je menej než rozdiel medzi tým, ako písmo vysadzuje prehliadač na
           stole a na telefóne. Presne tam vznikol Matejov tretí riadok.
           12,4vw necháva ~8vw vzduchu; nad ním už riadok nemá kam rásť bez
           toho, aby vytiekol z obrazovky (zalomiť sa nemôže, je nowrap).
           ⚠️ white-space na .ph-h1 tu už nič nerieši — o zalomení rozhodujú
           riadkové bloky .ph-l, ktoré majú nowrap samy. */
        /* ── 🔴 NA MOBILE SA PÍŠU VIDITEĽNÉ VEĽKOSTI, DELENÉ MIERKOU GULE ────
           .planet-hero LEŽÍ VNÚTRI .planet-stage, ktorá je na telefóne zmenšená
           na --ball-k. Číslo napísané v CSS teda NIE JE to, čo človek vidí:
           pri mierke 0,57 má nadpis so 48 px písmom na obrazovke 27 px. Kým sa
           tu písali „layoutové" čísla, každá zmena mierky ticho prepísala aj
           veľkosť písma a naopak (Matej 28. 8. 2026 chcel naraz „NADPIS o 15 %,
           CTA blok o 25 %, tagline o 10 %" A menšiu guľu — dva protichodné
           pohyby na jednom prvku).
           Preto sa clampy píšu v tom, čo je vidno, a delia sa mierkou. Číslo
           v zátvorke je odteraz to, čo si odmeriaš na obrazovke.
           ⚠️ Fallback 0,57 nie je ozdoba — pred prvým behom efektu (--ball-fit)
           by inak delenie prázdnou premennou celé pravidlo zahodilo.
           ⚠️ BREAKPOINT ZJEDNOTENÝ NA 760 px. Text mal 720 a mierka gule 760,
           takže v pásme 721–760 px stálo desktopové písmo v zmenšenej guli —
           nadpis tam mal 25 viditeľných px. Teraz sa oboje prepína naraz. */
        @media (max-width: 760px) {
          /* Menšie z dvoch: strop, ktorý si Matej odsúhlasil, a mierka, pri
             ktorej sa guľa ešte zmestí do okna (viď --ball-fit v efekte). */
          .planet-root { --ball-k: min(0.57, var(--ball-fit, 0.57)); }

          /* 🔴 NADPIS = CELÁ ŠÍRKA OKNA (Matej 5. 10. 2026: *„zväčši písmo, aby bolo
             čo najväčšie a vždy v 2 riadkoch v každom jazyku"*). Rovnica, nie meranie:
             písmo = (okno − 2×16 px) / dĺžka dlhšieho riadka v em. EN „YOUR DOG IS"
             má s Cinzel Decorative na DOG 7,37 em (zmerané 5. 10.), --ph-em 7,5 nechá
             ~2 % na rozdiely v sadzbe medzi prehliadačmi. Riadky sú nowrap bloky,
             takže tretí riadok nevznikne — rovnica len stráži, aby nevytiekli z okna.
             ⚠️ Keď nadpis dostane preklad, jazyk s dlhším riadkom si nastaví vlastné
             --ph-em (dĺžku dlhšieho riadka v em + ~2 %), inak pretečie.
             ⚠️ z-index: biela žiara portálu (.ph-halo, 2,45× portálu) je v DOM-e neskôr
             a ležala CEZ spodok nadpisu — Matej: *„žiara z portálu zakrýva nadpis"*.
             .ph-lead to isté riešil už predtým (z-index 1). */
          .ph-h1 {
            --ph-em: 7.5;
            white-space: normal;
            position: relative;
            z-index: 2;
            font-size: calc((100vw - 32px) / var(--ph-em) / var(--ball-k, 0.57));
            line-height: 1.04;
          }
          .planet-hero .ph-lead {
            white-space: normal;
            max-width: 24ch;
            /* VIDITEĽNE clamp(0.627rem, 2.523vw, 0.75rem) — pôvodok × 1,10 */
            font-size: calc(clamp(0.627rem, 2.523vw, 0.75rem) / var(--ball-k, 0.57));
          }
          /* Počet psov: nad guľou, nie v hero. Sedí v .planet-stage (zmenšenej
             na --ball-k), preto sú čísla VIDITEĽNÉ a delené mierkou. Odstup od
             gule je 48 px, na nízkom okne (667 px) ustúpi až na 12 px, aby
             nevošiel pod medailón v hornej lište. */
          .ph-count--pc { display: none; }
          .ph-count--mob {
            display: block;
            position: absolute;
            left: 50%;
            bottom: calc(100% + min(48px, max(12px, 50dvh - 50vw - 130px)) / var(--ball-k, 0.57));
            transform: translateX(-50%);
            font-size: calc(14px / var(--ball-k, 0.57));
          }
          /* ⚠️ ŠÍRKA MUSÍ RÁSŤ S PÍSMOM, INAK SA REZERVA ZJE. Nadpis je nowrap,
             takže jediné, čo ho drží v obrazovke, je rezerva medzi šírkou riadka
             a šírkou tejto priehradky (~7 %). Preto je aj tu VIDITEĽNÉ číslo
             delené tou istou mierkou — pri pevnej šírke a väčšom písme by riadok
             priehradku prerástol a vytiekol.
             69,9vw = pôvodných 98vw (layout) × 0,62 (vtedajšia mierka) × 1,2509.
             (Historicky: 98vw, nie 92vw, lebo Cinzel Decorative pri DOG a GOD
             je o ~2,8 % širšia než Cinzel a pri 96vw zožrala tretinu rezervy.) */
          /* 5. 10. 2026: priehradka = okno − 2×16 px (VIDITEĽNE), teda presne šírka,
             na ktorú rovnica nadpisu vyššie počíta. */
          .planet-hero {
            gap: calc(10px / var(--ball-k, 0.57));
            width: calc((100vw - 32px) / var(--ball-k, 0.57));
          }
        }

        /* ── KÓTY ────────────────────────────────────────────────────────────
           Bublinka odsadená od gule, spojená s fotkou tenkou vodiacou čiarou.
           Na dlaždici visieť nemôže (je otočená v priestore) — polohuje sa
           v rovine obrazovky z jej getBoundingClientRect. */
        .pn-leads {
          position: fixed;
          inset: 0;
          z-index: 6;
          pointer-events: none;
          overflow: visible;
        }
        .pn-leads polyline {
          fill: none;
          stroke: rgba(140,96,20,0.55);
          stroke-width: 1;
        }
        .pn-leads circle {
          fill: #8C6014;
          stroke: rgba(253,248,236,0.9);
          stroke-width: 1.5;
        }
        /* KÓTA VYSTRELÍ (Matej 25. 8.) — čiara sa vykreslí od psa k bublinke. */
        .pn-leads polyline {
          stroke-dasharray: 1;
          animation: pnShoot 300ms cubic-bezier(.3,.9,.35,1) both;
        }
        .pn-leads circle { animation: pnIn 200ms ease both; }
        .pn-leads g.is-going { opacity: 0; transition: opacity 480ms ease; }
        @keyframes pnShoot {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }

        /* Rozmer aj poloha idú z mriežky (kotovaMriezka) cez premenné —
           v CSS nesmie byť druhé číslo, inak sa mu bublinka a priehradka rozídu. */
        .pnote {
          position: fixed;
          z-index: 7;
          /* Bublinka je cieľ kliku, takže myš CHYTÁ. ⚠️ Dev pult leží pod ňou —
             kým kóta žije, pult sa cez ňu preklikať nedá. Je to dev pomôcka,
             ktorá v produkcii nebude, a kóta zmizne do troch sekúnd. */
          pointer-events: auto;
          cursor: pointer;
          box-sizing: border-box;
          width: var(--pnw);
          height: var(--pnh);
          /* Bublinka je vždy vycentrovaná na strede svojej priehradky. Strana
             určuje LEN stĺpec — ten prichádza hotový v left, nie posunom. */
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 13px;
          border-radius: 16px;
          background: linear-gradient(135deg, #FDF8EC 0%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow: 0 14px 30px -12px rgba(70,46,12,0.6);
          /* Bublinka nabehne AŽ keď kóta dorazí — inak by vyskočila skôr než
             čiara, ktorá ju má priniesť. */
          animation: pnIn 240ms cubic-bezier(.22,.9,.28,1) 240ms both;
        }
        /* Zdvihnutie pri nabehnutí — to jediné povie, že sa dá kliknúť.
           translateY(-50%) musí ostať, nesie centrovanie na priehradku. */
        .pnote:hover {
          transform: translateY(-50%) scale(1.025);
          border-color: #F4DC97;
          box-shadow: 0 18px 38px -12px rgba(70,46,12,0.7);
        }
        .pnote { transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
        /* Dohasínajúca kóta sa už chytať nedá — klik do ducha otvorí kartu psa,
           ktorý na obrazovke o pol sekundy nebude. */
        .pnote.is-going { opacity: 0; pointer-events: none; transition: opacity 480ms ease; }

        @keyframes pnIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Fotka má vlastný rozmer z mriežky — nie zvyšok, čo ostane po texte. */
        .pnote-photo {
          width: var(--pnp);
          height: var(--pnp);
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid rgba(201,154,63,0.9);
          box-shadow: 0 0 16px -6px rgba(140,96,20,0.7);
        }
        .pnote-body { min-width: 0; }
        .pnote-head {
          display: flex;
          /* Bolo baseline — s pilulkou a heroglyfom v rade nemá účaru na čom
             stáť a rad sa rozsype. */
          align-items: center;
          gap: 7px;
          margin-bottom: 3px;
        }
        /* Meno psa = Cinzel Decorative (oficiálny povrch, ako na stene). */
        .pnote-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.04em;
          color: #2a1608;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        /* Poradové číslo = dáta, teda Space Grotesk. Od 27. 8. 2026 v LAPISOVEJ
           pilulke (Matej: *„ten hashtag dajme do lapisového chipu"*). Zlatý inkoust
           na lapise nie je ozdoba — lapis + zlato je pôvodná egyptská dvojica a bez
           písma je z pilulky len tmavá škvrna. Zdroj farieb: LAPIS v navGoldSkin,
           neopisuj hodnoty. */
        .pnote-n {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.58rem;
          letter-spacing: 0.06em;
          font-style: normal;
          flex-shrink: 0;
          padding: 2px 7px 3px;
          border-radius: 999px;
          color: ${Y.ink};
          background: ${Y.grad};
          border: 1px solid ${Y.edge};
          box-shadow: ${oi};
          line-height: 1;
        }
        /* Heroglyf psa vedľa čísla (Matej 27. 8. 2026: *„do blokov, ktoré sa
           otvárajú po bokoch, by sme mohli pridať aj heroglyf vedľa #"*).
           ⚠️ Výška je pevná a šírka auto — heroglyfy nemajú jednotný pomer strán
           a pevná šírka by ich deformovala. brightness(0) je ten istý trik ako
           na paneli detailu (.pp-glyph): glyf príde v ľubovoľnej farbe a na
           papyruse musí byť čierny. */
        .pnote-glyph {
          height: 15px;
          width: auto;
          max-width: 40px;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter: brightness(0);
          opacity: 0.85;
        }
        /* Odkaz majiteľa. Počet riadkov je z mriežky — bublinka má výšku svojej
           priehradky a text, ktorý by z nej vytiekol, by ju roztrhol. */
        .pnote-msg {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: 0.66rem;
          line-height: 1.45;
          font-style: italic;
          color: #7a5a2a;
          display: -webkit-box;
          -webkit-line-clamp: var(--pnl, 3);
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* MOBIL kóty nemá — vznikajú výhradne z pohybu myši a vedľa gule tam
           nie je miesto. Toto je len poistka, keby sa niekam prepašovali. */
        @media (max-width: 760px) {
          .pnote, .pn-leads { display: none; }
        }

        /* ── DETAIL PSA — SPOLOČNÉ ─────────────────────────────────────────
           Rozloženie je pre obe podoby to isté; líši sa iba materiál. */
        /* ⚠️ LEN pod .planet-root — karta steny (DogCard v portáli) nesie tú istú
           triedu a globálne opacity: 0 ju zhasínalo (3. 10. 2026). */
        .planet-root .pp-panel {
          z-index: 9;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          pointer-events: none;
        }
        .planet-root.pop .pp-panel { opacity: 1; pointer-events: auto; }

        /* ── ŠÍPKY PREPÍNANIA (mobil) ────────────────────────────────────────
           Visia cez hranu karty, zvisle na jej strede. Vzhľad je odliatok pečate
           s poradovým číslom (.pp-seal) — tá istá zlatá pilulka s krémovým lemom,
           aby to na karte bola jedna rodina, nie druhý jazyk tlačidiel.
           ⚠️ Základ je display:none — zapína ich až mobilný blok na konci súboru.
           ⚠️ Karta nesmie mať overflow, inak ich odreže (viď tam). */
        .pp-nav {
          display: none;
          position: absolute;
          top: 50%;
          margin-top: -17px;
          width: 34px; height: 34px;
          align-items: center; justify-content: center;
          padding: 0;
          border-radius: 50%;
          /* LAPIS (Matej 28. 8. 2026: „zmeň posuvníky na detaile psa na lapis").
             Sedí to s pravidlom z navGoldSkin.ts — zlato je konštrukcia („kde
             som"), lapis je akcia („čo urobím"), a šípka je jediná akcia na tejto
             karte okrem odkazu na stránku psa. Zlatý inkoust NA lapise nie je
             ozdoba: lapis + zlato je pôvodná egyptská dvojica, bez nej je z toho
             len tmavý krúžok bez príslušnosti k brandu.
             ⚠️ Predtým bola šípka odliatok zlatej pečate .pp-seal — a práve preto
             sa strácala: na papyruse boli pečať, pilulka dní aj šípka tá istá
             zlatá, teda tri rovnako dôležité veci, z ktorých ani jedna neviedla. */
          background: ${Y.grad};
          border: 1.5px solid ${Y.edge};
          box-shadow: ${wt};
          color: ${Y.ink};
          cursor: pointer;
          z-index: 2;
        }
        .pp-nav:hover { background: ${Y.gradHover}; }
        .pp-nav:active { transform: scale(0.94); }
        .pp-nav--prev { left: -13px; }
        .pp-nav--next { right: -13px; }

        /* Karta rastie spolu s panelom — obsah sa neškáluje sám, veľkosti sú
           tu. (Podmienka :not(.d-zvitok) odtiaľto zanikla spolu so zvitkom;
           keby pribudla podoba s pevnou kresbou, výnimku si pýta ONA, nie tieto
           riadky.) */
        .planet-root .pp-panel {
          gap: 14px;
          /* Matejov náčrt bol vyšší než čo dal obsah — panel má teda vlastnú
             výšku a obsah v nej stojí na stred. Bez justify-content by sa nalepil
             hore a spodok by zíval. */
          min-height: min(600px, 68vh);
          justify-content: center;
        }
        .planet-root .pp-photo { width: 132px; height: 132px; }
        .planet-root .pp-name { font-size: 2rem; }
        .planet-root .pp-days { font-size: 1rem; padding: 5px 15px; }
        .planet-root .pp-glyph { width: 74%; max-width: 320px; }
        .planet-root .pp-msg { font-size: 0.88rem; line-height: 1.65; }
        .planet-root .pp-act { font-size: 12px; min-height: 44px; }

        /* ── KARTY: SPOLOČNÝ TVAR ────────────────────────────────────────────
           Všetky štyri podoby sú tá istá karta z /pack (PACK_BOX.card: radius 16,
           zlatý rám 1.5 px, papyrusový jazyk zvyšku appky). Tvar sa NEROZCHÁDZA —
           tu je zapísaný RAZ a podoby menia iba materiál. Kto pridá piatu, píše
           len výplň, rám a tieň. */
        /* ── PODOBA A: KARTA (pôvodná — referencia) ───────────────────────────
           Tá, ktorá sa Matejovi páči tvarom a prepadla kontrastom: jej gradient
           je prakticky zhodný s pozadím planéty. Ostáva vo výbere, aby bolo
           s čím porovnávať. */
        .d-karta .pp-panel {
          color: #2a1608;
          background: linear-gradient(160deg, #FDF8EC 0%, #F7ECD3 46%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow: 0 18px 44px -16px rgba(70,46,12,0.45), inset 0 1px 0 rgba(255,253,246,0.9);
        }

        /* ── PODOBA B: SVETLÁ — ŽIJE V DogCard.tsx (.pp-svetla), je to vybratá podoba ─────────────────────────────────────────────────
           Karta odbočí NAHOR: takmer biela slonovina, teda svetlejšia než
           najsvetlejšie miesto steny, a zlaté halo (box-shadow s nulovým
           rozostrením) — ten istý prstenec, ktorým sa v /pack odlepuje bledý
           blok od papyrusu (Entry.tsx). Kontrast robí SVETLO, nie iný tón:
           papyrusová rodina ostáva nedotknutá. */
        /* ── PODOBA C: PIESOK ─────────────────────────────────────────────────
           Opačný smer: karta odbočí NADOL — pripečený pieskovec tmavší než
           stena, s tmavohnedým zlatým obrysom. Atrament ostáva čierny, takže sa
           neprevracia nič okrem výplne a rámu. */
        .d-piesok .pp-panel {
          color: #2a1608;
          background: linear-gradient(160deg, #EBD5A6 0%, #E0C68E 48%, #D2B375 100%);
          border: 1.5px solid #8C6014;
          box-shadow:
            0 26px 56px -18px rgba(58,38,8,0.6),
            inset 0 1px 0 rgba(255,250,232,0.75);
        }
        .d-piesok .pp-photo { border-color: #8C6014; }
        .d-piesok .pp-rule { background: rgba(110,78,24,0.40); }
        .d-piesok .pp-msg { color: rgba(42,22,8,0.78); }
        .d-piesok .pp-act--out {
          background: rgba(255,250,236,0.62);
          border-color: rgba(110,78,24,0.60);
        }

        /* ── PODOBA D: PAPYRUS (jediná so ŠTRUKTÚROU) ────────────────────────
           Matej 25. 8.: „pridaj ku dizajnu detailu aj papyrus štruktúru."
           Doteraz sa podoby líšili len FARBOU výplne — plocha ostávala v každej
           hladká. Táto je prvá, ktorá má MATERIÁL: zrno + mramorovanie, presne to,
           čím sa v nave pieskovcová doska odlišuje od plochej zlatej.
           Zdroj je pack/navGoldSkin.ts (NAV_GRAIN + NAV_MOTTLE) — hodnoty sa
           NEOPISUJÚ, inak sa doska v nave a karta tu pri prvej úprave rozídu.
           ⚠️ ZRNO POTREBUJE DVE VRSTVY, nie jednu. Tmavé body idú ako vrstva
           pozadia s blend multiply, svetlé sa dokresľujú cez ::after so screen.
           Jedna vrstva s overlay je NEVIDITEĽNÁ — odskúšané pri nave.
           Preto isolation na paneli, pseudovrstva na z-index -1 a obsah na
           relative; bez isolation by záporná vrstva padla až za rám.
           ⚠️ Počet položiek v background-blend-mode MUSÍ sedieť s počtom vrstiev
           pozadia (zrno + 3 gradienty mramoru + výplň = 5). Pri nezhode prehliadač
           blend ticho zahodí a zo štruktúry ostane špinavý flek. */
        .d-papyrus .pp-panel {
          isolation: isolate;
          color: #2a1608;
          background:
            ${Ja} 0 0 / 180px 180px,
            ${qa},
            linear-gradient(160deg, #F7E9CD 0%, #EFDCB4 52%, #E3CA97 100%);
          background-blend-mode: multiply, normal, normal, normal, normal;
          border: 1.5px solid #B3822D;
          box-shadow:
            0 24px 54px -18px rgba(58,38,8,0.55),
            inset 0 1px 0 rgba(255,250,232,0.8);
        }
        .d-papyrus .pp-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          ${ja}
          opacity: 0.30;
          pointer-events: none;
          z-index: -1;
        }
        /* ⚠️ Toto pravidlo je silnejšie než trieda samotného prvku, takže
           absolútne pozicovaným deťom karty prepíše position na relative a tie
           spadnú do toku ako prvá položka. Šípky (.pp-nav) sa mu vyhnú tým, že
           majú vlastnú deklaráciu position s rovnakou váhou nižšie. */
        .d-papyrus .pp-panel > * { position: relative; z-index: 1; }
        .d-papyrus .pp-panel > .pp-nav { position: absolute; }
        .d-papyrus .pp-rule { background: rgba(110,78,24,0.38); }
        .d-papyrus .pp-msg { color: rgba(42,22,8,0.78); }
        .d-papyrus .pp-photo { border-color: #B3822D; }
        .d-papyrus .pp-act--out {
          background: rgba(255,250,236,0.62);
          border-color: rgba(110,78,24,0.60);
        }

        /* ── PODOBA E: NOC ────────────────────────────────────────────────────
           Najväčší možný kontrast — čierna karta na bledej stene. Materiál je
           TMAVÝ PODBLOK z /pack (PACK_BOX.subblockDark), teda jediná povolená
           výnimka z papyrusového locku; siaha sa po nej za význam: karta psa je
           doklad, nie plocha na písanie.
           ⚠️ Prevracia sa CELÝ atrament vrátane HEROGLYFU. Zdrojový obrázok je
           biely: brightness(0) z neho na svetlom robí čistú čerň, na čiernej
           by ostala neviditeľná škvrna. Recept na zlatý glyf sa NEVYMÝŠĽA —
           je to ten istý reťazec filtrov ako .dog-heroglyph na tmavej stene. */
        .d-noc .pp-panel {
          color: #F6ECD4;
          background: linear-gradient(135deg, #1B1209 0%, #0C0805 100%);
          border: 1.5px solid #C99A3F;
          box-shadow:
            0 28px 64px -16px rgba(0,0,0,0.72),
            inset 0 1px 0 rgba(201,154,63,0.25);
        }
        .d-noc .pp-name { color: #F6ECD4; }
        .d-noc .pp-life-label { color: #E8D29C; }
        .d-noc .pp-rule { background: rgba(201,154,63,0.40); }
        .d-noc .pp-msg { color: rgba(246,236,212,0.72); }
        .d-noc .pp-glyph {
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.55))
            drop-shadow(0 0 32px rgba(201,154,63,0.30));
        }
        .d-noc .pp-photo { border-color: rgba(201,154,63,0.9); }
        .d-noc .pp-act--out {
          color: #F0DFB8;
          background: rgba(201,154,63,0.12);
          border-color: rgba(201,154,63,0.55);
        }
        .d-noc .pp-act--out:hover { background: rgba(201,154,63,0.26); box-shadow: 0 0 14px rgba(201,154,63,0.35); }


        /* ══ POZADIE SCÉNY ═══════════════════════════════════════════════════
           Matej 25. 8.: „vytvor prepínač aj na pozadie, lebo planéta a pozadie má
           tu istú farbu, vyskúšajme to vizuálne oddeliť."
           ⚠️ Guľa NEMÁ vlastný obrys — okraj tvoria dlaždice natočené takmer
           bokom (ragged silueta) a .planet-shade ho ešte stmaví. Oddeliť ju sa
           preto nedá rámom ani tieňom, LEN POĽOM ZA ŇOU. */

        /* ── A: BLEDÉ (pôvodné — referencia) ─────────────────────────────────
           Presne ten gradient, ktorý má guľa pod sebou dnes. Ostáva vo výbere,
           aby bolo s čím porovnávať. */
        .planet-root.b-blede {
          background:
            radial-gradient(120% 100% at 50% 42%, #FDF8EC 0%, #F6EAD0 46%, #EBD9B4 100%);
        }

        /* ── B: HĹBKA (oddelenie SVETLOM) ────────────────────────────────────
           Ten istý papyrus, ale guľa stojí v svetle a rohy sú pripečené. Svetlý
           kotúč je zámerne o niečo väčší než guľa (640 px) — keby sedel presne
           na nej, čítal by sa ako svätožiara, nie ako osvetlená plocha. */
        .planet-root.b-hlbka {
          background:
            radial-gradient(34% 52% at 50% 44%, rgba(255,253,246,0.92) 0%, rgba(253,246,229,0.42) 58%, transparent 82%),
            radial-gradient(118% 102% at 50% 44%, #EFE2C2 0%, #DFCB9E 44%, #C2A469 100%);
        }

        /* ── C: PAPYRUS (oddelenie MATERIÁLOM) ───────────────────────────────
           Stena dostane štruktúru, takže fotky prestanú plávať a začnú ležať NA
           niečom. Ten istý zdroj ako podoba karty — NAV_GRAIN + NAV_MOTTLE.
           Zrno je tu jemnejšie než na karte (dlaždica 260 px, opacity 0.5):
           na ploche celého okna by rovnaká hustota robila šum, nie papier. */
        .planet-root.b-papyrus {
          isolation: isolate;
          background:
            ${Ja} 0 0 / 260px 260px,
            ${qa},
            radial-gradient(120% 100% at 50% 42%, #F4E7CB 0%, #EADBB6 46%, #DCC79B 100%);
          background-blend-mode: multiply, normal, normal, normal, normal;
        }
        .planet-root.b-papyrus::before {
          content: '';
          position: absolute;
          inset: 0;
          ${ja}
          background-size: 260px 260px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        /* ── D: NOC (oddelenie TÓNOM — najsilnejšie) ─────────────────────────
           ⚠️ Tmavé pozadie NIE JE zmena jednej vlastnosti. Stred scény je čierny
           atrament na svetlom: logo ide cez brightness(0), popisok je tmavohnedý
           a .planet-hero::before je SVETLÝ závoj, ktorý by na tmavom ostal ako
           biela škvrna. Všetko štyri sa musia prevrátiť naraz, inak to nevyzerá
           ako podoba, ale ako rozbitá stránka. */
        .planet-root.b-noc {
          background:
            radial-gradient(120% 100% at 50% 42%, #211609 0%, #150E06 48%, #0A0704 100%);
        }
        .planet-root.b-noc .planet-hero::before {
          background: radial-gradient(ellipse at center, rgba(12,8,4,0.94) 26%, transparent 70%);
        }
        .planet-root.b-noc .planet-hero img {
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.25)
            drop-shadow(0 0 18px rgba(201,154,63,0.4));
        }
        .planet-root.b-noc .planet-hero .ph-tag { color: rgba(246,236,212,0.66); }
        .planet-root.b-noc .planet-hero .ph-tag b { color: #F5C73D; }
        /* Vodiaca čiara kóty je na tmavom o triedu slabšia — bublinka ostáva
           papyrusová, takže sa mení iba niť medzi ňou a psom. */
        .planet-root.b-noc .pn-leads polyline { stroke: rgba(201,154,63,0.75); }
        .planet-root.b-noc .pn-leads circle { fill: #F5C73D; stroke: rgba(12,8,4,0.9); }

        /* ── MOŽNOSŤ A: BOK ──────────────────────────────────────────────────
           Panel príde sprava, guľa sa točí ďalej A UHNE SA MU — bez toho by
           polovica psov skončila pod panelom. */
        .v-side .pp-panel {
          position: fixed;
          top: 50%;
          right: 22px;
          /* Na PC je vedľa gule veľa voľného miesta (Matej 25. 8.: „na PC tu
             tabulu kludne zvačši priestor tam je velky", potom znova „ten detail
             ešte zvačši" s načrtnutým rámom ≈ 44 % šírky okna). Zvitok ostáva
             užší — kresba navinutých koncov sa pri šírke roztiahne. */
          width: var(--pw);
          max-height: 86vh;
          transform: translate(calc(100% + 46px), -50%);
          transition: transform 460ms cubic-bezier(.22,.9,.28,1), opacity 300ms ease;
        }
        .planet-root.pop.v-side .pp-panel { transform: translate(0, -50%); }
        /* Guľa sa uhýba PODĽA ŠÍRKY PANELA, nie o pevný počet pixelov —
           panel rastie s oknom a pevný posun by ho pri širokom okne nechal
           ležať na psoch. */
        /* 🔴 27. 9. 2026: posun ide cez vlastnosť translate, NIE v transform.
           Film (/onepage) vypína prechod na transform (mierka ide s prstom),
           a tým zabil aj uhnutie gule — detail len „blikol". Oddelený posun si
           drží vlastný prechod nezávisle od mierky. */
        .planet-root.open.pop.v-side .planet-stage {
          translate: calc(-1 * (var(--pw) / 2 + 40px)) 0;
        }
        .planet-stage { transition: transform 620ms cubic-bezier(.22,.9,.28,1), opacity 420ms ease, translate 620ms cubic-bezier(.22,.9,.28,1); }
        /* Panel sa pri prvom otvorení vykreslí rovno s triedou pop — prechod
           nemá odkiaľ štartovať, preto príchod nesie aj animácia. */
        @keyframes ppSideIn { from { transform: translate(calc(100% + 46px), -50%); opacity: 0; } to { transform: translate(0, -50%); opacity: 1; } }
        @media (min-width: 761px) {
          .planet-root.pop.v-side .pp-panel { animation: ppSideIn 520ms cubic-bezier(.22,.9,.28,1) both; }
        }
        /* NAV STENY IDE NAD PLANÉTU (Matej 25. 8.: „namiesto toho sem prehoď
           spodný nav aj vrchné"). Bar aj horné menu sú fixované na z-index 50,
           overlay planéty má 80 — kým je otvorená, dvíhajú sa nad ňu.
           Trieda sa vešia na <body>, lebo tie prvky patria stene, nie planéte.
           ⚠️ Vlastný krížik planéty tu BOL a zanikol: tretia ikonka v bare sa pri
           otvorenej planéte mení na mozaiku, takže cesta späť je na tom istom
           mieste ako cesta tam. Druhý únikový bod v pravom hornom rohu by sa
           navyše kryl s ikonkou LOGIN. */
        body.planet-open .nav-left,
        body.planet-open .nav-login,
        body.planet-open .gods-bottom-bar { z-index: 90; }
        /* TERČ (vycentrovanie mriežky) NA GULI NEEXISTUJE (Matej 25. 8.: „centrácia
           zmizne pri tomto globe zobrazení celkom — je tam zbytočný, budú len dve
           ikonky"). Guľa sa centruje sama tým, že sa vráti do pokojnej rotácie;
           tlačidlo by ukazovalo na akciu, ktorá tu nemá čo vykonať.
           Ostáva v DOM, len sa skryje — patrí stene a tá je pod planétou živá. */
        body.planet-open .center-btn-mobile { display: none; }


        @media (max-width: 760px) {
          .planet-stage { transform: scale(1.75) translateZ(0); }
          /* ── 🔴 GUĽA SA NEZMESTILA DO OBRAZOVKY ─────────────────────────────
             Matej 28. 8. 2026: „posvieť si na chýbajúce dlaždice na mobile."
             Odmerané na 390 px okne pri pôvodnej mierke 0,62: krajné dlaždice
             ležali od −10,3 px do 400,2 px, teda guľa bola 410 px široká na
             390 px obrazovke a 16 zo 194 dlaždíc jej krájala hrana okna.
             Nechýbali — boli useknuté.
             ⚠️ Strop 0,57 sám nestačí: je to pevné číslo a guľa je pevná v px,
             takže na 360 px telefóne by krájalo znova (odskúšané: 13 dlaždíc).
             Preto min() s dopočítaným --ball-fit.
             ⚠️ --op-sc je násobič filmu, nie hotová mierka (viď hlavné pravidlo). */
          .planet-root.open .planet-stage { transform: scale(calc(var(--ball-k, 0.57) * var(--op-sc, 1))); }
          /* ⚠️ Tu stálo .planet-hero img { width: 104px } — pozostatok z čias, keď
             v hero stálo logo (odsťahovalo sa 26. 8.). Pravidlo potom ticho zúžilo
             tváre v portáli na 59 % dlaždice a vpravo ostal holý lapisový pás —
             Matej 5. 10.: *„CTA je pokazené, fotka je ako keby mimo a je vidno
             jednofarebný okraj"*. Zmazané; portál si veľkosti rieši sám (dogPortal.ts). */

          /* CTA BLOK: −25 % (Matej 27. 8.) a teraz +25 % (Matej 28. 8. 2026:
             „CTA blok o 25 %"). Škáluje sa JEDNA premenná — lem, ikonka, popisok
             aj poznámka sú jej násobky, takže sa stiahnu s ňou a nič ďalšie sa
             neladí. VIDITEĽNE clamp(99.7px, 9.36vw, 120px).
             🔴 TRI KOLÁ ZVÄČŠOVANIA V JEDEN DEŇ (27. 8. bol portál na mobile −25 %):
             +25 % → +25 % → +40 %, spolu 2,19× oproti včerajšku. Posledné kolo je
             Matejovo *„stále sa mi zdá malý CTA blok na mobile"*, teda tretie po
             sebe idúce „ešte väčší" — preto je krok výrazný a nie ďalších 25 %.
             Referencia, ktorá tú veľkosť drží: dlaždica psa má na obrazovke 31 px,
             portál teda 3,2× dlaždicu (na PC je pomer 2,15× a tam Matej výhrady nemal).
             ⚠️ Aj tu celý clamp, nie jeden bod: pri zmene len stropu by portál
             na úzkom telefóne ostal v pôvodnej veľkosti. */
          .planet-hero .ph-portal { --ph-w: calc(clamp(99.7px, 9.36vw, 120px) / var(--ball-k, 0.57)); }

          /* ── 🔴 DETAIL PSA = STRED OBRAZOVKY, NIE ZÁSUVKA ZHORA ─────────────
             Matej 28. 8. 2026: „treba opraviť otváranie psov na mobile
             z planétky — zarovnať popup do stredu obrazovky a zmenšiť to, aby
             to celé vošlo, + vytvoriť tam šípky doprava a doľava."
             Zásuvka zhora (25. 8.: „na mobile z vrchu") mala dve chyby, ktoré sa
             ukázali až po tom, čo nad ňu prišiel horný nav: karta začínala na
             y = 0, takže jej fotku aj krížik prekryla lišta, a guľa sa jej musela
             uhýbať o 124 px dole, čím sa z filmu vysunula. Vycentrovaná karta
             nepotrebuje ani jedno.
             ⚠️ ŽIADNY overflow NA PANELI. Šípky visia cez jeho hranu (left/right
             záporné) a scrollovací kontajner by ich odrezal — preto sa výška rieši
             zmenšením obsahu nižšie, nie posúvaním. */
          .v-side .pp-panel {
            top: 50%; left: 50%; right: auto; bottom: auto;
            width: min(320px, 84vw);
            max-height: none;
            transform: translate(-50%, -50%) scale(0.92);
            transition: transform 380ms cubic-bezier(.22,.9,.28,1), opacity 260ms ease;
          }
          .planet-root.pop.v-side .pp-panel { transform: translate(-50%, -50%) scale(1); }
          /* Guľa sa NEUHÝBA — karta jej stojí na strede a cesta späť je ťuknutie
             vedľa nej (obsluha je na .planet-root, guľa je z nej vyňatá). */
          .planet-root.open.pop.v-side .planet-stage { transform: scale(calc(var(--ball-k, 0.57) * var(--op-sc, 1))); }

          /* ── 🔴 JEDNOTNÝ BLOK, DIMENZOVANÝ NA NAJDLHŠÍ TEXT ─────────────────
             Matej 28. 8. 2026: „ujasni jednotný blok na detail psa napr podľa
             hektora ktorý ma najdlhší text… zmenši písmo aj obsah ak je treba
             aby sa to zmestilo."
             Karta mala min-height: 0, takže jej výšku určoval pes — pri prepínaní
             šípkami sa pri každom ďalšom preskladala. Dnes má PEVNÚ výšku a obsah
             v nej stojí na stred (justify-content: center dedí z pravidla pre PC);
             kratší text nechá vzduch, nie iný tvar.
             ROZPOČET (odmerané na 390 px, Hektorov text 340 znakov = najdlhší):
               výplň 38 · 6 medzier 60 · fotka 92 · meno 26 · život 19 · čiara 1 ·
               heroglyf 54 · text 7 riadkov 118 · odkaz 30  = 441 px
             Pri pôvodných veľkostiach mal ten istý text 519 px, teda −15 % na obsahu.
             ⚠️ line-clamp 9 a min-height 473 sú DVE STRANY JEDNEJ HODNOTY a sú
             ZÁMERNE zosúladené: pri strope clampu (9 riadkov) meria karta 475 px,
             teda to isté, čo jej dáva min-height. Hektor tak nechá 2 riadky rezervy
             pre dlhší text a nikto nevidí ani pretečenie, ani prázdno pod odkazom.
             Kto zmení jedno číslo, prepočíta druhé (riadok = 16,8 px).
             ⚠️ Strop 80vh je poistka pre nízke okno; pri bežnom telefóne (780 px)
             je karta 473 px, teda 61 %. */
          .planet-root .pp-panel {
            min-height: min(473px, 80vh);
            gap: 10px; padding: 20px 20px 18px;
          }
          .planet-root .pp-photo { width: 92px; height: 92px; }
          .planet-root .pp-seal { font-size: 0.76rem; padding: 2px 10px; bottom: -9px; }
          .planet-root .pp-name { font-size: 1.35rem; }
          .planet-root .pp-life-label { font-size: 0.56rem; }
          .planet-root .pp-days { font-size: 0.76rem; padding: 3px 11px; }
          .planet-root .pp-glyph { width: 74%; max-width: 200px; }
          .planet-root .pp-msg { font-size: 0.7rem; line-height: 1.5; -webkit-line-clamp: 9; }
          .planet-root .pp-act { font-size: 10px; min-height: 36px; }

          /* ── ŠÍPKY: PREPÍNANIE PSA BEZ NÁVRATU NA GUĽU ──────────────────────
             Existujú LEN na mobile, a je to úmysel, nie nedorobok: na PC stojí
             karta bokom a guľa ostáva celá klikateľná, takže ďalší pes je na
             dosah priamo. Na telefóne karta guľu prekryje, takže bez šípok by
             cesta k ďalšiemu psovi viedla vždy cez zavretie karty. */
          .pp-nav { display: inline-flex; }
        }

        /* ── VÝZVA PRICHÁDZA ZA GUĽOU (Matej 3. 9. 2026) ───────────────────
           Nábeh nesú DETI .planet-hero, nie ona sama — dôvod je pri stave
           heroIn v tomto súbore (film jej zapisuje inline opacity, ktorá by
           pravidlo na ňu prebila).
           Rozostupy čítajú vetu v poradí, v akom má znieť: guľa → *tvoj pes je
           tu boh* → *a stále nám chýba jeho tvár* → dlaždica, kam ho pridať.
           ⚠️ Žiadny transform — pod portálom je plátno s iskrami a vlastná
           vrstva by mu zmenila rasterizáciu. Nábeh je čisté krytie. */
        .planet-hero > * {
          opacity: 0;
          transition: opacity 560ms ease;
        }
        .planet-hero.hero-in > * { opacity: 1; }
        /* Guľa sa vynorí CELÁ naraz — krytie nesie .planet-ball, nie
           .planet-stage (tej film zapisuje inline opacity a transform). */
        .planet-ball { opacity: 0; transition: opacity 900ms ease; }
        .planet-stage.ball-in .planet-ball { opacity: 1; }
        /* Portál na guli VZNIKNE: z bodu sa roztvorí s jemným prekmitom.
           Jednorazová animácia transformu pri príchode — iskry (plátno) sa
           pritom zväčšujú s ním, v pokoji je transform prázdny. */
        .planet-hero .ph-portal { opacity: 0; }
        /* Lapisové jadro portálu (28. 9. 2026) je od 7. 10. 2026 spoločné
           s jadrom na stene — žije v PORTAL_CSS (dogPortal.ts), nie tu. */
        .planet-hero .ph-lbl { text-align: center; line-height: 1.15; }
        .planet-hero.hero-in .ph-portal { animation: phBirth 900ms cubic-bezier(.2,.9,.3,1.12) 240ms both; }
        @keyframes phBirth {
          0% { opacity: 0; transform: scale(.15) rotate(-18deg); }
          45% { opacity: 1; }
          100% { opacity: 1; transform: none; }
        }
        .planet-hero.hero-in .ph-lead { transition-delay: 110ms; }
        .planet-hero.hero-in .ph-mount { transition-delay: 240ms; }
        /* Pod oponou bez nábehov — opona sama je prechod. */
        .planet-stage.no-intro .planet-ball,
        .planet-stage.no-intro .planet-hero > * { transition: none; }
        .planet-stage.no-intro .planet-hero.hero-in .ph-portal { animation: none; opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .planet-hero > * { transition: none; }
          .planet-ball { transition: none; }
          .planet-hero.hero-in .ph-portal { animation: none; opacity: 1; }
        }
      `}),e.jsxs("div",{className:`planet-stage${j?" ball-in":""}${L.current?" no-intro":""}`,children:[y>0&&e.jsx("p",{className:"ph-count ph-count--mob",children:N}),e.jsx("div",{className:"planet-ball",ref:be,style:{transform:`rotateX(${ce.current.x}deg) rotateY(${ce.current.y}deg)`,"--tile":`${He}px`},onPointerDown:ut,onPointerMove:fe,onPointerUp:$e,onPointerCancel:$e,onPointerLeave:()=>{Ie.current=null,xe(null)},children:e.jsx(ki,{tiles:qe})}),e.jsx("div",{className:"planet-shade"}),e.jsxs("div",{className:`planet-hero${_?" hero-in":""}`,children:[y>0&&e.jsx("p",{className:"ph-count ph-count--pc",children:N}),e.jsxs("h1",{className:"ph-h1",style:m>1?{"--ph-em":(7.5*m).toFixed(2)}:void 0,children:[e.jsx("span",{className:"ph-l",children:co(l("wall.hero.l1"))}),e.jsx("span",{className:"ph-l",children:co(l("wall.hero.l2"))})]}),e.jsx("p",{className:"ph-lead",children:l("wall.hero.missingFace")}),e.jsx("span",{className:"ph-mount",ref:t}),e.jsx("input",{ref:z,type:"file",accept:"image/*",className:"ph-add-file",onChange:ne})]})]}),pe.length>0&&!K&&ie&&e.jsxs("svg",{className:"pn-leads",width:"100%",height:"100%","aria-hidden":"true",children:[tt&&e.jsx("defs",{children:e.jsxs("mask",{id:"pn-cta-hole",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"100%",height:"100%",children:[e.jsx("rect",{x:"0",y:"0",width:"100%",height:"100%",fill:"#fff"}),e.jsx("rect",{x:tt.x,y:tt.y,width:tt.w,height:tt.h,rx:tt.r,ry:tt.r,fill:"#000"})]})}),e.jsx("g",{mask:tt?"url(#pn-cta-hole)":void 0,children:pe.map(k=>{const C=vi(k.side,ie),$=ie.ys[k.slot];return e.jsxs("g",{className:Se(k)?"is-going":void 0,children:[e.jsx("polyline",{pathLength:1,points:`${k.x},${k.y} ${k.side==="l"?C+18:C-18},${$} ${C},${$}`}),e.jsx("circle",{cx:k.x,cy:k.y,r:3.5})]},k.id)})})]}),!K&&ie&&pe.map(k=>e.jsxs("div",{className:`pnote${Se(k)?" is-going":""}`,role:"button",tabIndex:-1,"aria-label":k.dog.name,onClick:()=>ae(k.dog),onPointerEnter:()=>{Ge.current=k.id},onPointerLeave:()=>{Ge.current===k.id&&(Ge.current=null)},style:{left:k.side==="l"?ie.lx:ie.rx,top:ie.ys[k.slot],"--pnw":`${ie.w}px`,"--pnh":`${ie.h}px`,"--pnp":`${ie.photo}px`,"--pnl":ie.lines},children:[e.jsx("img",{className:"pnote-photo",src:k.dog.photoBig||k.dog.photo,alt:"",draggable:!1}),e.jsxs("div",{className:"pnote-body",children:[e.jsxs("div",{className:"pnote-head",children:[e.jsx("span",{className:"pnote-name",children:k.dog.name}),k.dog.n!=null&&e.jsxs("i",{className:"pnote-n",children:["#",k.dog.n]}),k.dog.heroglyph&&e.jsx("img",{className:"pnote-glyph",src:k.dog.heroglyph,alt:"",draggable:!1})]}),e.jsx(Ro,{n:k.dog.n,text:k.dog.message||(k.dog.n===1?l("wall.hektor.msg"):""),className:"pnote-msg",toggle:!1})]})]},k.id)),K&&e.jsxs("div",{className:"pp-panel pp-svetla",role:"dialog","aria-label":K.name,children:[o.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"pp-nav pp-nav--prev",onClick:()=>Lt(-1),"aria-label":"Previous dog",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:e.jsx("path",{d:"M15 5l-7 7 7 7"})})}),e.jsx("button",{className:"pp-nav pp-nav--next",onClick:()=>Lt(1),"aria-label":"Next dog",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:e.jsx("path",{d:"M9 5l7 7-7 7"})})})]}),e.jsx(Ko,{where:"planet",dog:{key:K.n===1?"hektor":`n:${K.n??K.name}`,name:K.name,n:K.n,wallId:null,photo:K.photoBig||K.photo,heroglyph:K.heroglyph,message:K.message||(K.n===1?l("wall.hektor.msg"):""),birthDate:K.birthDate}})]})]})}const ha=`${vn}/get-grid-dogs?tiers=all`,Ht=o=>o.split("*").map((n,s)=>s%2?`<span class="g">${lt(n)}</span>`:lt(n)).join(""),Wo=5;function ma(o,n=0){const s=[];let c=0,p=0,l=-1,f=n;for(;s.length<o;){const m=c-1,y=p+1,N=l-1,O=f+1;for(let x=N+1;x<=O;x++)s.push({col:y,row:x});for(let x=y-1;x>=m;x--)s.push({col:x,row:O});for(let x=O-1;x>=N;x--)s.push({col:m,row:x});for(let x=m+1;x<=y;x++)s.push({col:x,row:N});c=m,p=y,l=N,f=O}return s.slice(0,o)}const Ut=.85*.85,Qt=(typeof window<"u"&&window.innerWidth<768?.67:1)*Ut,Je=Math.round(360*Qt),dt=Math.round(360*Qt),nt=Je+Math.round(64*Qt),et=dt+Math.round(64*Qt),wi=Math.min(800,Math.max(320,Math.round(Je*Math.min(typeof window<"u"&&window.devicePixelRatio||1,2)))),ua=3,ga=1,ji="/images/dogypt-logo-black-i.png",zi=5,ba="wall-lab-enroll-v2";function Ei(){if(typeof window>"u")return!1;const o=window.location.hostname;return o.endsWith("lovable.app")||o==="localhost"||o==="127.0.0.1"}const uo=o=>o?et/2:0,Ai=typeof window<"u"&&window.innerWidth<768,Ni=Ai?0:42,Si="light",go={sk:"Slovakia",cz:"Czechia",pl:"Poland",hu:"Hungary",at:"Austria",de:"Germany",us:"USA",gb:"United Kingdom",fr:"France",it:"Italy"};function bo(o){return Ea(o)||""}function lt(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function jt(o){if(!o)return"";try{const n=new URL(o,window.location.origin);return n.protocol==="http:"||n.protocol==="https:"?n.href:""}catch{return""}}function Ta(o){const n="/image/upload/",s=o.indexOf(n);if(s===-1)return null;let c=o.slice(s+n.length);return c=c.replace(/^v\d+\//,""),c=c.replace(/\.[a-zA-Z0-9]+$/,""),c||null}function xa(o){const n=jt(o||"");if(!n)return"";const s=Ta(n);if(!s&&n==="/images/hektor-grid.webp")return"/images/hektor-grid-tile.webp";const c=typeof window<"u"&&window.innerWidth<=768?120:160;return s?La(s,c):n}function Zo(o){const n=jt(o||"");if(!n)return"";const s=Ta(n);return!s&&n==="/images/hektor-grid.webp"?"/images/hektor-grid-320.webp":s?La(s,320):n}function Ci(o){const n=jt(o||"");if(!n)return"";const s=Ta(n);return s?La(s,wi):n}const Pi=/^[a-z]{1,3}_[^/]*$/;function La(o,n){const s=o.split("/"),c=[];for(;s.length>1&&Pi.test(s[0]);)c.push(s.shift());return c.length?oo(s.join("/"),n).replace("/image/upload/",`/image/upload/${c.join("/")}/`):oo(o,n)}const _t={id:"hektor-fill",dog_name:"HEKTHOR",pack_number:1,cloudinary_main_url:"/images/hektor-grid.webp",patron_svg:null,heroglyph_png_url:"/images/hekthor-heroglyph.webp",country:"SVK",owner_message:null,birth_date:null};function It(o,n){const s=o.wall_tier,c=!s||s==="member",p=!!o.wall_pending,l=c&&o.pack_number===1,f=s==="guest"&&!o.owner_message?n(`wall.guestLine.${1+Math.floor(Math.random()*Wo)}`):"";return{key:l?"hektor":o.pack_number!=null?`n:${o.pack_number}`:`g:${o.wall_id}`,name:(o.dog_name||"DOGYPTIAN").toUpperCase(),n:o.pack_number??null,wallId:c?null:o.wall_id||null,photo:Zo(o.cloudinary_main_url),heroglyph:jt(o.heroglyph_png_url||""),message:p?"":o.owner_message||f||(l?n("wall.hektor.msg"):""),birthDate:o.birth_date||null,guest:!c,status:s?p?n("wall.status.pending"):c?"":n(`wall.status.${s}`):""}}const Ti=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];function Jo(o,n,s){return s<=0?0:((o+3*n)%s+s)%s}function Li(o,n,s,c,p=!1){if(o===0&&n===0||p&&o===0&&n===1)return null;if(o===0&&n===-1)return 1;const l=s.get(`${o},${n}`);return l?l.pack_number??null:c.length===0?null:c[Jo(o,n,c.length)].pack_number??null}function Wr({embedded:o=!1,ctaMode:n=!1,ctaLabel:s,ctaHref:c="/heroglyph/name",portalDock:p=!1,dockHostId:l,paused:f=!1,onWallChange:m}={}){const[y,N]=r.useState(null);r.useLayoutEffect(()=>{N(l?document.getElementById(l):null)},[l]);const O=Ca(),x=_e(),F=r.useRef(null),j=r.useRef(null),[v,_]=r.useState(!1);r.useRef(!1);const{toast:Z}=On(),[L,R]=r.useState(null),[z,t]=r.useState(null),[a,i]=r.useState(0),[d,h]=r.useState(()=>new URLSearchParams(window.location.search).get("heroglyphUrl")||ji),[b,w]=r.useState(!1),[A,H]=r.useState(!1),[T,B]=r.useState(()=>{if(!o||window.location.pathname==="/wall")return!1;const u=new URLSearchParams(window.location.search);return!u.get("dog")&&!u.get("focus")&&!u.get("reveal")}),[ne,ce]=r.useState([]),[be,Ne]=r.useState(!T);r.useEffect(()=>{T||Ne(!0)},[T]);const[q,he]=r.useState(null),pe=r.useRef(null);pe.current=q;const ze=r.useRef(new WeakMap),ve=r.useRef(null),ie=r.useRef(null),ke=r.useRef(null),ye=r.useRef(null),Ge=r.useRef(!1),Ie=r.useRef(null),[Me,Ae]=r.useState(null),[K,ae]=r.useState(""),De=Si,[Ye,Fe]=r.useState([]),xe=r.useRef(new Map),qe=r.useRef([]),He=r.useRef(null),[Ue,kt]=r.useState([]),it=r.useRef(new Map),Se=r.useRef(null),ut=r.useRef(null),fe=r.useRef(x);r.useEffect(()=>{fe.current=x},[x]);const[$e,Lt]=r.useState(()=>{try{return localStorage.getItem(ba)!=="0"}catch{return!0}}),tt=r.useRef(null),k=r.useRef($e);r.useEffect(()=>{k.current=$e},[$e]),r.useEffect(()=>{if(!$e||T||$o)return;let u=0,S=0;const M=G=>{u=requestAnimationFrame(M);const W=S?Math.min(.05,(G-S)/1e3):0;S=G;const V=tt.current;W&&V&&V.canvas.isConnected&&V.sparks.frame(W)};return u=requestAnimationFrame(M),()=>cancelAnimationFrame(u)},[$e,T]);const{lang:C}=Dt(),$=r.useRef(C);r.useEffect(()=>{$.current=C},[C]);const P=r.useMemo(()=>{const u=new URLSearchParams(window.location.search),S=u.get("reveal"),M=S==="demo";return{active:S==="true"||M,dogName:M?"Toby":u.get("dogName")||"Your Dog",photoUrl:M?"/dogs/toby.jpg":u.get("photoUrl")||"",packNumber:M?String(to.length):u.get("packNumber")||String(to.length+1),heroglyphUrl:u.get("heroglyphUrl")||"",heroglyphVUrl:u.get("heroglyphVUrl")||""}},[]),se=r.useMemo(()=>{const u=new URLSearchParams(window.location.search).get("focus");if(!u)return null;const S=parseInt(u,10);return Number.isFinite(S)&&S>=1?S:null},[]),U=r.useMemo(()=>{const u=new URLSearchParams(window.location.search).get("dog");return u&&/^[0-9a-f-]{36}$/.test(u)?u:null},[]);r.useEffect(()=>{let u=!0;return(dn(ha)??hn(ha)).then(S=>{if(u){if(S.length>0){const M=S.reduce((D,de)=>Math.max(D,de.pack_number??0),0),G=ma(M+5,k.current?1:0),W=new Map,V=new Map;for(const D of S){const de=D.pack_number;if(!de||de<2)continue;const Ee=de-2;Ee<G.length&&(W.set(`${G[Ee].col},${G[Ee].row}`,D),D.wall_id&&V.set(D.wall_id,{col:G[Ee].col,row:G[Ee].row}))}const we=S.filter(D=>(D.wall_tier==="supporter"||D.wall_tier==="guest")&&D.pack_number==null),Ce=Math.max(0,M-1),Ke=ma(Ce+we.length,k.current?1:0);we.forEach((D,de)=>{const Ee=Ke[Ce+de];Ee&&(W.set(`${Ee.col},${Ee.row}`,D),D.wall_id&&V.set(D.wall_id,{col:Ee.col,row:Ee.row}))}),it.current=V,xe.current=W,qe.current=[_t,...S.filter(D=>(D.pack_number??0)>=2)],ce(qe.current.map(D=>({id:D.id,name:D.dog_name||"",n:D.pack_number,photo:xa(D.cloudinary_main_url),lqip:Un(D.lqip),photoBig:Zo(D.cloudinary_main_url),heroglyph:jt(D.heroglyph_png_url||""),message:D.owner_message||"",birthDate:D.birth_date||null})).filter(D=>D.photo)),kt([_t,...S.filter(D=>(D.pack_number??0)>=2),...we].filter(D=>D.dog_name).map(D=>({key:D.wall_id||D.id,name:(D.dog_name||"").toUpperCase(),n:D.pack_number??null,wallId:D.wall_id||null,photo:xa(D.cloudinary_main_url),country:ao(Ea(D.country)||"")||""})));const Ve=new Map;for(const D of qe.current){const de=Ea(D.country);de&&Ve.set(de,(Ve.get(de)??0)+1)}if(Fe([...Ve.entries()].map(([D,de])=>({iso2:D,iso3:ao(D),count:de})).sort((D,de)=>de.count-D.count)),P.active){const D=parseInt(P.packNumber,10),de=S.find(Ee=>Ee.pack_number===D);!P.heroglyphUrl&&(de!=null&&de.heroglyph_png_url)&&h(de.heroglyph_png_url),de!=null&&de.share_card_url&&R(de.share_card_url)}}w(!0)}}).catch(()=>{u&&w(!0)}),()=>{u=!1}},[P.active,P.packNumber]);const[me,Pe]=r.useState("glyph");r.useEffect(()=>{if(!P.active||!P.heroglyphUrl&&!b)return;const u=document.getElementById("op-boot"),S=u&&!u.classList.contains("out")?1e3:0;S&&window.dispatchEvent(new Event("dogypt:planet-ready")),i(1),Pe(S?"wait":"glyph");const M=[setTimeout(()=>Pe("glyph"),S),setTimeout(()=>Pe("vanish"),S+2800),setTimeout(()=>{Pe("zoom"),i(2)},S+3500),setTimeout(()=>i(3),S+3600),setTimeout(()=>{i(4),window.history.replaceState(null,"",window.location.pathname==="/wall"?"/wall":"/")},S+5600)];return()=>M.forEach(clearTimeout)},[P.active,P.heroglyphUrl,b]);const Oe=r.useMemo(()=>typeof window>"u"?1:Math.max(window.innerWidth,window.innerHeight)/Je,[]),ue=P.active&&a>=1&&a<3,at=r.useMemo(()=>!!P.heroglyphVUrl&&typeof window<"u"&&window.innerHeight>=window.innerWidth,[P.heroglyphVUrl]),Xe=r.useRef(m);Xe.current=m,r.useEffect(()=>{var u;(u=Xe.current)==null||u.call(Xe,!T)},[T]),r.useEffect(()=>{if(!o)return;const u=window.location.pathname;if(u!=="/"&&u!=="/wall")return;const S=T?"/":"/wall";u!==S&&window.history.replaceState(window.history.state,"",S+window.location.search)},[T,o]);const rt=u=>{var S,M;if(u.n)T?Ae(G=>({n:u.n,seq:((G==null?void 0:G.seq)??0)+1})):(S=He.current)==null||S.call(He,u.n);else if(u.wallId){const G=it.current.get(u.wallId);G&&(T?(B(!1),window.setTimeout(()=>{var W;return(W=Se.current)==null?void 0:W.call(Se,G.col,G.row)},450)):(M=Se.current)==null||M.call(Se,G.col,G.row))}(!T||!u.n||window.innerWidth<=760)&&H(!1),ae("")},gt=()=>{var S;if(ca(K)){const M=io(Ue,K,1)[0];M&&rt(M);return}const u=parseInt(K.replace(/[#\s]/g,""),10);!isNaN(u)&&u>=1&&(T?Ae(M=>({n:u,seq:((M==null?void 0:M.seq)??0)+1})):(S=He.current)==null||S.call(He,u)),(!T||!isNaN(u)&&u>=1&&window.innerWidth<=760)&&H(!1),ae("")};r.useEffect(()=>{if(!A||!T)return;const u=S=>{const M=S.target;M.isConnected&&(M.closest(".numpad")||M.closest(".planet-ball")||M.closest(".gods-bottom-bar")||(H(!1),ae("")))};return document.addEventListener("click",u),()=>document.removeEventListener("click",u)},[A,T]),r.useEffect(()=>{if(!A)return;const u=S=>{const M=S.target,G=!!M&&(M.tagName==="INPUT"||M.tagName==="TEXTAREA");G&&(M!=null&&M.classList.contains("ws-mail"))||G&&S.key!=="Enter"&&S.key!=="Escape"||(S.key>="0"&&S.key<="9"?ae(W=>(W+S.key).slice(0,6)):S.key==="Backspace"?ae(W=>W.slice(0,-1)):S.key==="Enter"?gt():S.key==="Escape"&&(H(!1),ae("")))};return window.addEventListener("keydown",u),()=>window.removeEventListener("keydown",u)},[A,K,Ue,T]),r.useEffect(()=>{if(!A||!window.matchMedia("(hover: hover) and (pointer: fine)").matches)return;const u=window.setTimeout(()=>{var S;return(S=ut.current)==null?void 0:S.focus()},60);return()=>window.clearTimeout(u)},[A]),r.useEffect(()=>{if(a>=1){const u=document.querySelector(".reveal-card");u==null||u.classList.add("reveal-active")}},[a]),r.useEffect(()=>{},[a,P.active]),r.useEffect(()=>{if(!P.active||L||!v)return;let u=!0,S=0,M;const G=20,W=parseInt(P.packNumber,10),V=()=>{S+=1,fetch(ha).then(we=>we.ok?we.json():[]).then(we=>{if(!u)return;const Ce=we.find(Ke=>Ke.pack_number===W);Ce!=null&&Ce.share_card_url?R(Ce.share_card_url):S<G&&(M=setTimeout(V,4e3))}).catch(()=>{u&&S<G&&(M=setTimeout(V,4e3))})};return M=setTimeout(V,1500),()=>{u=!1,clearTimeout(M)}},[P.active,P.packNumber,L,v]);const yt=async()=>{if(!(!L||z)){t("share");try{const u=parseInt(P.packNumber,10),S=x("share.dogVoice",{dog:P.dogName.toUpperCase()}),M=await En({pack:u,dogName:P.dogName,imageUrl:L,channel:"native",shareText:S});Te("share_clicked",{channel:M,type:"sharecard",location:"whatnext"}),M==="copied"&&Z({title:x("sharecard.linkCopied")})}catch(u){Z({title:x("sharecard.saved"),description:u instanceof Error?u.message:void 0,variant:"destructive"})}finally{t(null)}}},Rt=()=>{const u=x("share.dogVoice",{dog:P.dogName.toUpperCase()});Nn(parseInt(P.packNumber,10),P.dogName,u),Te("share_clicked",{channel:"facebook",type:"sharecard",location:"whatnext"})},Xo=()=>{const u=x("share.dogVoice",{dog:P.dogName.toUpperCase()});Sn(parseInt(P.packNumber,10),P.dogName,u),Te("share_clicked",{channel:"whatsapp",type:"sharecard",location:"whatnext"})},Qo=async()=>{await Cn(parseInt(P.packNumber,10),P.dogName),Te("share_clicked",{channel:"copy",type:"sharecard",location:"whatnext"}),Z({title:x("sharecard.linkCopied")})},en=async()=>{if(!(!L||z)){t("download");try{await An({imageUrl:L,dogName:P.dogName}),Te("share_clicked",{channel:"download",type:"sharecard",location:"whatnext"}),Z({title:x("sharecard.saved")})}catch(u){Z({title:x("sharecard.saved"),description:u instanceof Error?u.message:void 0,variant:"destructive"})}finally{t(null)}}};return r.useEffect(()=>{if(!v)return;const u=document.querySelector(".wn-card");if(!u)return;const S=u.querySelector(".wn-track"),M=u.querySelectorAll(".wn-slide"),G=u.querySelector(".wn-counter .wn-cur");if(!S||!G||M.length===0)return;const W=M.length;let V=0;const we=We=>{M.forEach(Bt=>Bt.classList.remove("wn-in"));const bt=M[We];bt.offsetWidth,bt.classList.add("wn-in")},Ce=We=>{V=(We+W)%W,S.style.transform=`translateX(-${V*100}%)`,G.textContent=String(V+1),we(V),u.classList.toggle("wn-card--share",V===W-1)},Ke=u.querySelector(".wn-arrow.wn-prev"),Ve=u.querySelector(".wn-arrow.wn-next"),D=()=>Ce(V-1),de=()=>Ce(V+1);Ke==null||Ke.addEventListener("click",D),Ve==null||Ve.addEventListener("click",de);const Ee=We=>{We.key==="ArrowLeft"&&Ce(V-1),We.key==="ArrowRight"&&Ce(V+1),We.key==="Escape"&&_(!1)};window.addEventListener("keydown",Ee);let Qe=null;const re=u.querySelector(".wn-slider"),ct=We=>{Qe=We.touches[0].clientX},Mt=We=>{if(Qe===null)return;const bt=We.changedTouches[0].clientX-Qe;Math.abs(bt)>40&&Ce(bt<0?V+1:V-1),Qe=null};return re==null||re.addEventListener("touchstart",ct,{passive:!0}),re==null||re.addEventListener("touchend",Mt,{passive:!0}),()=>{Ke==null||Ke.removeEventListener("click",D),Ve==null||Ve.removeEventListener("click",de),window.removeEventListener("keydown",Ee),re==null||re.removeEventListener("touchstart",ct),re==null||re.removeEventListener("touchend",Mt)}},[v]),r.useEffect(()=>{if(!b||!(be||P.active))return;const u=F.current,S=j.current;if(!u||!S)return;let M=window.innerWidth,G=window.innerHeight,W=P.active?M/2-ua*nt-Je/2:M/2-Je/2,V=P.active?G/2-ga*et-dt/2:G/2-dt/2-uo(k.current),we=!1,Ce=0,Ke=0,Ve=0,D=0,de=0,Ee=0,Qe=0,re=null;const ct=new Map;let Mt=0,We=0,bt=0,Bt=0,Re=null;function Oa(g){var J,oe,ee;const E=ze.current.get(g);if(E){if(Re&&(Re.classList.remove("is-open"),Re=null),((J=pe.current)==null?void 0:J.key)===E.key){he(null);return}ie.current={col:Math.round(parseFloat(g.style.left)/nt),row:Math.round(parseFloat(g.style.top)/et)},he(E),Te("wall_dog_click",E.n!=null?{pack_number:E.n}:{guest:!0});return}const I=!g.classList.contains("is-open");if(Re&&Re!==g&&Re.classList.remove("is-open"),I){g.classList.add("is-open"),Re=g;const le=(ee=(oe=g.querySelector(".card-open-rank"))==null?void 0:oe.textContent)==null?void 0:ee.replace("#","").trim();Te("wall_dog_click",le?{pack_number:le}:{})}else g.classList.remove("is-open"),Re=null}function ea(){return[...xe.current.values()].reduce((g,E)=>Math.max(g,E.pack_number??0),1)+1}function tn(){const g=document.createElement("div");g.className="center-hero",g.style.left=Je/2+"px",g.style.top=dt/2+Ni+"px",g.style.transform=`translate(-50%, -50%) scale(${Ut})`,g.innerHTML=`
        <h2 class="hero-h1">
          <span class="hero-hl">${Ht(fe.current("wall.hero.l1"))}</span>
          <span class="hero-hl">${Ht(fe.current("wall.hero.l2"))}</span>
        </h2>
        <p class="hero-lead">${fe.current("wall.hero.missingFace")}</p>
        <!-- Chip „Help us reach 1M dogs" zrušený (Matej 5. 10. 2026: *„zruš ho"*). -->
        ${k.current?"":`<a href="/heroglyph/name" class="join-btn" data-join>${fe.current("wall.hero.cta")}</a>`}
      `,g.style.setProperty("--hero-fs",(nt/Ut*.94/(7.25*Aa($.current))).toFixed(2)+"px");const E=g.querySelector("[data-join]");return E==null||E.addEventListener("click",I=>{I.preventDefault(),Te("cta_become_dogyptian_click",{location:"wall"}),O("/heroglyph/name")}),g}function an(){var E;const g=document.createElement("article");return g.className="dog-card hektor-card",g.style.left="0px",g.style.top=-1*et+"px",g.innerHTML=`
        <div class="card-img" style="background-image:url('/images/hektor-grid.webp');background-position:50% 35%"></div>
        <div class="card-rank-top">#1</div>
        <img class="card-flag" src="${la("sk")}" alt="Slovakia" title="Slovakia" loading="lazy" draggable="false">
        <div class="hektor-heroglyph-wrap">
          <img class="hektor-heroglyph" src="/images/hekthor-heroglyph.webp" alt="Hekthor heroglyph" draggable="false">
        </div>
        <div class="card-name-block">
          <div class="card-label hektor-label">HEKTHOR</div>
        </div>
      `,ze.current.set(g,It(_t,fe.current)),((E=pe.current)==null?void 0:E.key)==="hektor"&&g.classList.add("is-picked"),g}function on(){const g=document.createElement("article");g.className="dog-card reveal-card",g.style.left=ua*nt+"px",g.style.top=ga*et+"px";const E=(P.dogName||"DOGYPTIAN").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),I=parseInt(P.packNumber,10);let J="",oe="";for(const Q of xe.current.values())if(Q.pack_number===I){J=bo(Q.country),oe=Q.owner_message?lt(Q.owner_message):"";break}const ee=go[J]||J,le=lt(d),te=jt(P.photoUrl),X=lt(P.packNumber),ge=te?'<div class="reveal-card-inner"></div>':`<div class="reveal-card-inner reveal-card-fallback"><span class="cartouche">${E}</span></div>`;if(g.innerHTML=`
        ${ge}
        <div class="card-open-overlay">
          <div class="card-open-rank">#${X}</div>
          <div class="card-open-name">${E}</div>
          <img class="card-open-heroglyph" src="${le}" alt="${E} heroglyph" draggable="false">
          ${oe?`<div class="card-open-msg">${oe}</div>`:""}
        </div>
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${le}" alt="${E} heroglyph" draggable="false">
        </div>
        <div class="card-rank-top">#${X}</div>
        ${J?`<img class="card-flag" src="${la(J)}" alt="${ee}" title="${ee}" loading="lazy" draggable="false">`:""}
        <div class="card-name-block">
          <div class="card-label">${E}</div>
        </div>
      `,te){const Q=g.querySelector(".reveal-card-inner");Q&&(Q.style.backgroundImage=`url("${te}")`);const Be=new Image;Be.src=te,Be.onerror=()=>{const je=g.querySelector(".reveal-card-inner");je&&(je.style.backgroundImage="",je.classList.add("reveal-card-fallback"),je.innerHTML=`<span class="cartouche">${E}</span>`)}}return g}function ta(g,E,I,J=!1){var Wa,Za;Pa();const oe=bo(g.country),ee=go[oe]||oe,le=lt((g.dog_name||"DOGYPTIAN").toUpperCase()),te=g.pack_number??"?",X=g.wall_tier,ge=!X||X==="member",Q=!!g.wall_pending,Be=X==="guest"&&!g.owner_message?fe.current(`wall.guestLine.${1+Math.floor(Math.random()*Wo)}`):"";Q||g.owner_message,X&&(Q?fe.current("wall.status.pending"):X==="member"||fe.current(`wall.status.${X}`));const je=document.createElement("article");je.className=(J?"dog-card dog-card--fill":"dog-card")+(ge?"":" dog-card--nomember")+(Q?" dog-card--pending":""),je.style.left=E*nt+"px",je.style.top=I*et+"px";const Ze=(Wa=g.heroglyph_png_url)!=null&&Wa.includes("res.cloudinary.com")&&g.heroglyph_png_url.includes("/upload/")?g.heroglyph_png_url.replace("/upload/","/upload/c_fit,w_480,q_auto,f_auto/"):g.heroglyph_png_url,xt=Ze?lt(Ze):"",pn=lt(Ci(g.cloudinary_main_url));g.pack_number!=null&&g.dog_name&&lt(Do(g.dog_name,g.pack_number)),je.innerHTML=`
        <div class="card-img" style="background-image:url('${pn}');background-position:50% 30%"></div>
        ${g.pack_number!=null?`<div class="card-rank-top">#${te}</div>`:""}
        ${oe?`<img class="card-flag" src="${la(oe)}" alt="${ee}" title="${ee}" loading="lazy" draggable="false">`:""}
        ${xt?`
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${xt}" alt="${le} heroglyph" draggable="false">
        </div>`:""}
        <div class="card-name-block">
          <div class="card-label">${le}</div>
        </div>
      `;const Ua=It(g,fe.current);return ze.current.set(je,Ua),!J&&((Za=pe.current)==null?void 0:Za.key)===Ua.key&&je.classList.add("is-picked"),je}function nn(){const g=document.createElement("article");g.className="dog-card enroll-card enroll-card--portal",g.style.left="0px",g.style.top=1*et+"px";const E=[...xe.current.values()].map(ge=>xa(ge.cloudinary_main_url)).filter(Boolean),I=document.createElement("input");I.type="file",I.accept="image/*",I.className="ph-add-file";let J=null,oe;const ee=()=>{I.value="",I.click()},le=()=>To(I,()=>Lo(ea())),te=ge=>{Te("wall_photo_confirm_shown"),Oo({photoUrl:ge,packNumber:ea(),onContinue:Q=>{Te("cta_become_dogyptian_click",{location:"wall_enroll_b"}),Io(Q,oe),Q&&Te("wall_photo_cropped"),O("/heroglyph/name")},onPickAnother:()=>{Te("wall_photo_confirm_another"),ee()},onClose:()=>Te("wall_photo_confirm_dismissed"),copy:{eyebrow:fe.current("wall.photo.yoursWillBe"),lead:fe.current("wall.photo.lead"),cta:fe.current("wall.photo.cta"),another:fe.current("wall.photo.another"),zoom:fe.current("wall.photo.zoom"),later:fe.current("wall.photo.laterNote")}})},X=Go({faces:E,onPick:()=>J?te(J):le(),label:fe.current("wall.hero.addPhoto"),labelPicked:fe.current("wall.photo.change"),note:"",subnote:`<span class="ph-nopill">${lt(fe.current("wall.photo.yoursWillBe"))} <b>#${ea()}</b></span>`});return X.el.style.setProperty("--ph-w",Je+"px"),X.el.style.setProperty("--ph-rimw","6px"),X.el.style.setProperty("--ph-icok","0.185"),X.el.style.setProperty("--ph-lblk",(.072/Ho($.current)).toFixed(4)),X.el.style.setProperty("--ph-notek","0.047"),X.el.style.setProperty("--ph-note-ws","nowrap"),X.el.style.setProperty("--ph-subk","0.0504"),I.addEventListener("change",()=>{var je;const ge=(je=I.files)==null?void 0:je[0];if(!ge)return;const Q=_o(ge),Be=Q.previewUrl;oe=Q.uploaded,J=Be,X.setPhoto(Be),te(Be)}),g.append(X.el,I),tt.current={canvas:X.canvas,sparks:Vo(X.canvas,{density:.42})},g}function rn(g,E){if(g===0&&E===0)return tn();if(k.current&&g===0&&E===1)return nn();if(g===0&&E===-1)return an();if(P.active&&g===ua&&E===ga)return on();const I=xe.current.get(`${g},${E}`);if(I)return ta(I,g,E);const J=qe.current;if(J.length===0)return null;const oe=xe.current,ee=new Set;for(const[te,X]of Ti){const ge=Li(g+te,E+X,oe,J,k.current);ge!=null&&ee.add(ge)}const le=Jo(g,E,J.length);for(let te=0;te<J.length;te++){const X=J[(le+te)%J.length];if(!ee.has(X.pack_number??-1))return ta(X,g,E,!0)}return ta(J[le],g,E,!0)}function sn(){S.style.transform=`translate(${W}px,${V}px)`}function ln(){const g=Math.floor(-W/nt)-1,E=g+Math.ceil(M/nt)+2,I=Math.floor(-V/et)-1,J=I+Math.ceil(G/et)+2;for(const[oe,ee]of ct){const[le,te]=oe.split(",").map(Number);(le<g||le>E||te<I||te>J)&&(ee.remove(),ct.delete(oe))}for(let oe=I;oe<=J;oe++)for(let ee=g;ee<=E;ee++){const le=`${ee},${oe}`;if(ct.has(le))continue;const te=rn(ee,oe);te&&(S.appendChild(te),ct.set(le,te))}}function pt(){sn(),ln()}let Ot=null;function aa(){Ot===null&&(Ot=requestAnimationFrame(()=>{Ot=null,pt()}))}function oa(){Ee*=.95,Qe*=.95,!(Math.abs(Ee)<.3&&Math.abs(Qe)<.3)&&(W+=Ee,V+=Qe,pt(),re=requestAnimationFrame(oa))}const _a=g=>{re&&cancelAnimationFrame(re);const E=g.target;Re&&!Re.contains(E)&&(Re.classList.remove("is-open"),Re=null),!(E.closest(".center-hero")||E.closest(".enroll-card")||E.closest(".center-btn")||E.closest(".main-nav")||E.closest(".nav-login")||E.closest(".lang-panel")||E.closest(".center-btn-mobile")||E.closest(".filter-btn")||E.closest(".gods-bottom-bar")||E.closest(".lang-btn-mobile")||E.closest(".lang-modal-root")||E.closest(".numpad-overlay")||E.closest(".card-open-dogpage-link"))&&(we=!0,Mt=g.clientX,We=g.clientY,Ce=g.clientX-W,Ke=g.clientY-V,Ve=g.clientX,D=g.clientY,de=performance.now(),Ee=Qe=0,u.classList.add("is-dragging"),document.body.style.cursor="pointer")},Ia=g=>{if(!we)return;const E=performance.now(),I=E-de||1;Ee=(g.clientX-Ve)/I*16,Qe=(g.clientY-D)/I*16,Ve=g.clientX,D=g.clientY,de=E,W=g.clientX-Ce,V=g.clientY-Ke,aa()},Da=g=>{if(!we)return;if(we=!1,u.classList.remove("is-dragging"),document.body.style.cursor="default",Math.hypot(g.clientX-Mt,g.clientY-We)<6){const I=g.target;if(!I.closest(".card-info")){const J=I.closest(".dog-card:not(.center-hero):not(.enroll-card)");if(J){Oa(J);return}}pe.current&&he(null);return}re=requestAnimationFrame(oa)},Ra=g=>{re&&cancelAnimationFrame(re);const E=g.touches[0];we=!0,bt=E.clientX,Bt=E.clientY,Ce=E.clientX-W,Ke=E.clientY-V,Ve=E.clientX,D=E.clientY,de=performance.now(),Ee=Qe=0,u.classList.add("is-dragging")},Ba=g=>{if(!we)return;const E=g.touches[0],I=performance.now(),J=I-de||1;Ee=(E.clientX-Ve)/J*16,Qe=(E.clientY-D)/J*16,Ve=E.clientX,D=E.clientY,de=I,W=E.clientX-Ce,V=E.clientY-Ke,aa()},Fa=g=>{var E;if(we){if(we=!1,u.classList.remove("is-dragging"),g.changedTouches.length>0){const I=g.changedTouches[0];if(Math.hypot(I.clientX-bt,I.clientY-Bt)<12){const oe=document.elementFromPoint(I.clientX,I.clientY);if(oe!=null&&oe.closest(".enroll-card, .center-hero, .center-btn, .main-nav, .nav-login, .lang-panel, .center-btn-mobile, .filter-btn, .gods-bottom-bar, .lang-btn-mobile, .lang-modal-root, .numpad-overlay, .card-open-dogpage-link"))return;if(g.preventDefault(),Re){const te=document.elementFromPoint(I.clientX,I.clientY);if(te&&Re.contains(te)){Re.classList.remove("is-open"),Re=null;return}Re.classList.remove("is-open"),Re=null}const ee=document.elementFromPoint(I.clientX,I.clientY),le=(E=ee==null?void 0:ee.closest)==null?void 0:E.call(ee,".dog-card:not(.center-hero):not(.enroll-card)");if(le){Oa(le);return}pe.current&&he(null);return}}re=requestAnimationFrame(oa)}},Ha=g=>{g.preventDefault();let E=g.deltaX,I=g.deltaY;g.deltaMode===1&&(E*=24,I*=24),g.deltaMode===2&&(E*=G,I*=G),W-=E,V-=I,aa()},$a=()=>{M=window.innerWidth,G=window.innerHeight,pt()},Va=()=>{var E;const g=S==null?void 0:S.querySelector(".center-hero");g&&(g.classList.remove("hero-anchor-pulse"),g.offsetWidth,g.classList.add("hero-anchor-pulse")),(E=navigator.vibrate)==null||E.call(navigator,15)},Ga=()=>{re&&cancelAnimationFrame(re);const g=M/2-Je/2,E=G/2-dt/2-uo(k.current);if(Math.hypot(g-W,E-V)<4){let X=function(je){const Ze=Math.min((je-ge)/Q,1);V=E+Be*Math.sin(Ze*Math.PI*2.5)*(1-Ze)*(1-Ze),pt(),Ze<1?re=requestAnimationFrame(X):(V=E,pt())};Va();const ge=performance.now(),Q=480,Be=13;re=requestAnimationFrame(X);return}const I=W,J=V,oe=performance.now(),ee=600,le=X=>1-Math.pow(1-X,3);function te(X){const ge=Math.min((X-oe)/ee,1),Q=le(ge);W=I+(g-I)*Q,V=J+(E-J)*Q,pt(),ge<1?re=requestAnimationFrame(te):Va()}re=requestAnimationFrame(te)};u.addEventListener("mousedown",_a),window.addEventListener("mousemove",Ia),window.addEventListener("mouseup",Da),u.addEventListener("touchstart",Ra,{passive:!0}),window.addEventListener("touchmove",Ba,{passive:!0}),window.addEventListener("touchend",Fa),u.addEventListener("wheel",Ha,{passive:!1}),window.addEventListener("resize",$a);function na(g){if(g<1)return null;if(g===1)return{col:0,row:-1};const E=ma(g+5,k.current?1:0),I=g-2;return I>=0&&I<E.length?E[I]:null}function Ya(g){const E=na(g);if(!E)return;re&&cancelAnimationFrame(re);const{col:I,row:J}=E,oe=M/2-I*nt-Je/2,ee=G/2-J*et-dt/2,le=W,te=V,X=performance.now(),ge=800,Q=je=>1-Math.pow(1-je,3);function Be(je){const Ze=Math.min((je-X)/ge,1),xt=Q(Ze);W=le+(oe-le)*xt,V=te+(ee-te)*xt,pt(),Ze<1&&(re=requestAnimationFrame(Be))}re=requestAnimationFrame(Be)}He.current=Ya;function ia(g,E,I=M/2,J=G/2){re&&cancelAnimationFrame(re);const oe=I-g*nt-Je/2,ee=J-E*et-dt/2,le=W,te=V,X=performance.now(),ge=800,Q=je=>1-Math.pow(1-je,3);function Be(je){const Ze=Math.min((je-X)/ge,1),xt=Q(Ze);W=le+(oe-le)*xt,V=te+(ee-te)*xt,pt(),Ze<1&&(re=requestAnimationFrame(Be))}re=requestAnimationFrame(Be)}Se.current=ia;function cn(g,E,I){const{sheet:J}=I,oe=0,ee=J?M:I.left,le=96,te=J?I.top:G,X=W+g*nt+Je/2,ge=V+E*et+dt/2,Q=Je/2;X-Q>=oe&&X+Q<=ee&&ge-Q>=le&&ge+Q<=te||ia(g,E,(oe+ee)/2,(le+te)/2)}ke.current=cn,ye.current=g=>{const E=pe.current;if(!E)return;const I=[...xe.current.values()],J=I.filter(Q=>Q.pack_number!=null).sort((Q,Be)=>(Q.pack_number??0)-(Be.pack_number??0)),oe=I.filter(Q=>Q.pack_number==null),ee=[_t,...J,...oe],le=Q=>It(Q,fe.current).key,te=ee.findIndex(Q=>le(Q)===E.key),X=ee[((te<0?0:te)+g+ee.length)%ee.length],ge=It(X,fe.current);ie.current=ge.n!=null?na(ge.n):ge.wallId?it.current.get(ge.wallId)??null:null,he(ge)};const Et=document.getElementById("gods-center-btn-mobile");Et==null||Et.addEventListener("click",Ga),pt();let ra=null;const Ka=(g,E)=>{!g||!E||Ge.current||(ra=window.setTimeout(()=>{Ge.current=!0,ie.current=E,he(It(g,fe.current))},850))};if(se!==null&&!P.active){Ya(se);const g=se===1?_t:[...xe.current.values()].find(E=>E.pack_number===se);Ka(g,na(se))}if(U&&se===null&&!P.active){const g=it.current.get(U);g&&(ia(g.col,g.row),Ka([...xe.current.values()].find(E=>E.wall_id===U),g))}return()=>{u.removeEventListener("mousedown",_a),window.removeEventListener("mousemove",Ia),window.removeEventListener("mouseup",Da),u.removeEventListener("touchstart",Ra),window.removeEventListener("touchmove",Ba),window.removeEventListener("touchend",Fa),u.removeEventListener("wheel",Ha),window.removeEventListener("resize",$a),Et==null||Et.removeEventListener("click",Ga),ra!==null&&window.clearTimeout(ra),re&&cancelAnimationFrame(re),Ot!==null&&cancelAnimationFrame(Ot),ct.forEach(g=>g.remove()),ct.clear()}},[O,b,be,se,U,P.active,$e]),r.useEffect(()=>{const u=j.current;u&&(u.querySelectorAll(".dog-card.is-picked").forEach(S=>S.classList.remove("is-picked")),q&&u.querySelectorAll(".dog-card:not(.dog-card--fill)").forEach(S=>{var M;((M=ze.current.get(S))==null?void 0:M.key)===q.key&&S.classList.add("is-picked")}))},[q]),r.useEffect(()=>{const u=ve.current;if(!q||!u)return;const S=()=>{var we;const W=ie.current;if(!W)return;const V=window.matchMedia("(max-width: 767px)").matches;(we=ke.current)==null||we.call(ke,W.col,W.row,{sheet:V,left:V?0:window.innerWidth-24-u.offsetWidth,top:V?window.innerHeight-u.offsetHeight:0})},M=requestAnimationFrame(S),G=new ResizeObserver(S);return G.observe(u),()=>{cancelAnimationFrame(M),G.disconnect()}},[q]),r.useEffect(()=>{if(!q)return;const u=S=>{S.key==="Escape"&&he(null)};return window.addEventListener("keydown",u),()=>window.removeEventListener("keydown",u)},[q]),r.useEffect(()=>{T&&he(null)},[T]),r.useEffect(()=>{var we,Ce;if(!b)return;const u=j.current;if(!u)return;const S=u.querySelectorAll(".hero-h1 .hero-hl");S.length===2&&(S[0].innerHTML=Ht(x("wall.hero.l1")),S[1].innerHTML=Ht(x("wall.hero.l2")));const M=(Ce=(we=S[0])==null?void 0:we.closest(".hero-h1"))==null?void 0:Ce.parentElement;M==null||M.style.setProperty("--hero-fs",(nt/Ut*.94/(7.25*Aa(C))).toFixed(2)+"px");const G=u.querySelector(".hero-lead");G&&(G.textContent=x("wall.hero.missingFace"));const W=u.querySelector(".join-btn");W&&(W.textContent=x("wall.hero.cta"));const V=u.querySelector(".hektor-card .card-open-msg");V&&(V.textContent=x("wall.hektor.msg"))},[x,C,b]),e.jsxs(e.Fragment,{children:[!o&&e.jsx(Xt,{path:"/",title:"DOGYPT — The Place Where DOG is GOD",description:"Transform your dog's essence into a timeless HEROGLYPH. 12 Symbols, 1 Eternal Legacy."}),e.jsx("style",{children:`
        body { overflow: hidden; }

        .gods-root {
          position: fixed;
          inset: 0;
          background-color: #050505;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: -0.02em;
          user-select: none;
          overflow: hidden;
        }
        .gods-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/images/bg-dark.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(3px);
          z-index: 0;
          pointer-events: none;
        }
        #gods-canvas { z-index: 1; }

        /* HORNÝ NAV + LOGIN: CSS odišlo do components/lab/LabShell.tsx
           (jedna kópia baru v projekte). Zlatý odliatok si aj tak obe strany
           ťahajú z components/pack/navGoldSkin.ts. */



        #gods-canvas {
          position: absolute;
          top: 0; left: 0;
          will-change: transform;
        }

        /* ── Dog card base ── */
        .dog-card {
          position: absolute;
          width: ${Je}px;
          height: ${dt}px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .is-dragging .dog-card { cursor: pointer; transition: none; }

        /* 🔒 LOCKED — kánon aktualizovaný 2026-06-25 (Matej: „nechaj plnú farbu aj na live"):
           Placeholder dogs = PLNÁ FARBA (opacity 1, bez filtra). Predtým priesvitné (opacity 0.6 +
           brightness(0.92) contrast(0.97)) — vzhľad „ZEUS" z 2026-06-02, nahradený.
           NEMENIŤ brightness/opacity/grayscale bez výslovného OK. */
        .dog-card--placeholder { cursor: default; }
        .dog-card--placeholder .card-img {
          filter: none;
          opacity: 1;
        }
        .dog-card--placeholder .card-label {
          font-size: 0.7rem !important;
          letter-spacing: 0.22em !important;
        }
        .dog-card--placeholder:hover {
          transform: none !important;
          box-shadow: none !important;
        }
        .dog-card--placeholder .card-open-overlay { display: none; }

        /* Hover: scale + gradient darkening (suppressed on open card & during drag) */
        .dog-card:not(.is-open):hover {
          transform: scale(1.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          z-index: 5;
        }
        .is-dragging .dog-card:hover { transform: none; box-shadow: none; }

        /* Overlay — appears on hover, uniform dark */
        .dog-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.62);
          opacity: 0;
          will-change: opacity;
          transition: opacity 220ms ease;
          pointer-events: none;
          z-index: 1;
        }
        .dog-card:not(.is-open):hover::after { opacity: 1; }
        .is-dragging .dog-card::after { opacity: 0 !important; }

        /* Elements that hide on hover (and on open) */
        .card-rank-top, .card-flag, .card-name-block {
          will-change: opacity;
          transition: opacity 160ms ease;
        }
        .dog-card:not(.is-open):hover .card-rank-top,
        .dog-card:not(.is-open):hover .card-flag,
        .dog-card:not(.is-open):hover .card-name-block { opacity: 0; }
        .is-dragging .dog-card .card-rank-top,
        .is-dragging .dog-card .card-flag,
        .is-dragging .dog-card .card-name-block { opacity: 1 !important; }

        .card-img {
          width: 100%; height: 100%;
          background-size: cover;
          background-color: #1a1a1a;
        }

        /* Name block (default state, bottom-left) */
        .card-name-block {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          z-index: 2;
        }
        .card-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          color: #C99A3F;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 6px rgba(0,0,0,0.9);
          line-height: 1;
        }
        .card-rank-gold { color: #C99A3F; }
        .card-label {
          height: 28px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: flex; align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }



        /* Click (open) overlay */
        .card-open-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.88);
          border-radius: inherit;
          z-index: 6;
          opacity: 0;
          pointer-events: none;
          will-change: opacity;
          transition: opacity 220ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          overflow-y: auto;
        }
        .dog-card.is-open .card-open-overlay { opacity: 1; pointer-events: auto; }
        .dog-card.is-open { z-index: 8; }
        .dog-card.is-open .card-rank-top,
        .dog-card.is-open .card-flag,
        .dog-card.is-open .card-name-block { opacity: 0; }

        .card-open-titlerow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .card-open-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.08em;
          text-align: center;
        }
        .card-open-rank {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #3a2c10;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 999px;
          padding: 2px 11px;
        }
        /* ── HOSŤ NA STENE — prenesené z GodsGrid 3. 10. 2026 (po SWAPe je toto
           homepage). PSIE VIDENIE (Matej 26. 9.): pes bez člena je v spektre, ako
           ho vidia psy, kým človek nezaplatí €11. Čaká na AINUBISA = stmavnutý
           a rozmazaný (25. 9.). Filter definuje ensureDogVisionFilter(). */
        .card-open-status {
          margin-top: 6px; font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(201,154,63,0.85); text-align: center;
        }
        .dog-card--nomember:not(.dog-card--pending) .card-img { filter: url(#dogypt-dog-vision); }
        .dog-card--pending .card-img,
        .dog-card--pending .dog-heroglyph,
        .dog-card--pending .card-open-heroglyph { filter: blur(6px) brightness(0.45); }
        .dog-card--pending .card-label { opacity: .55; }
        .card-open-msg {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.6);
          text-align: center;
          line-height: 1.55;
          max-width: 280px;
          font-style: italic;
          margin-top: 2px;
        }
        .card-open-heroglyph {
          width: 48%;
          height: auto;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
          margin-bottom: 4px;
        }
        .card-open-dogpage-link {
          display: inline-block;
          flex-shrink: 0;
          margin-top: 4px;
          padding: 6px 16px;
          font-family: 'Cinzel', serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C99A3F;
          background: transparent;
          border: 1px solid rgba(201,154,63,0.65);
          border-radius: 8px;
          text-decoration: none;
          /* pointer-events až v otvorenom stave — explicitné auto tu by prerazilo
             pointer-events:none zatvoreného overlay a neviditeľný link by žral kliky */
          pointer-events: none;
          cursor: pointer;
          transition: box-shadow 200ms ease, background 200ms ease;
        }
        .dog-card.is-open .card-open-dogpage-link { pointer-events: auto; }
        .card-open-dogpage-link:hover {
          background: rgba(201,154,63,0.08);
          box-shadow: 0 0 12px rgba(201,154,63,0.45);
        }

        .card-flag {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.45);
          pointer-events: auto;
          cursor: help;
          background: #1a1a1a;
          z-index: 2;
        }
        .card-rank-top {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          height: 24px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: inline-flex;
          align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
          line-height: 1;
          pointer-events: none;
        }

        /* ── Center hero ── */
        .center-hero {
          position: absolute;
          z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          text-align: center;
          pointer-events: auto;
          width: max-content;
        }
        .center-hero::before {
          content: '';
          position: absolute;
          inset: -200px -320px;
          background: radial-gradient(ellipse at center, rgba(8,8,8,0.92) 20%, transparent 68%);
          z-index: -1;
          pointer-events: none;
        }
        /* Zlatý pulz ring — feedback kliku na terč (ukotvenie na stred) */
        .center-hero::after {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          width: 200px; height: 200px;
          margin: -100px 0 0 -100px;
          border-radius: 50%;
          border: 2px solid rgba(201,154,63,0.9);
          box-shadow: 0 0 24px rgba(201,154,63,0.35);
          opacity: 0;
          pointer-events: none;
        }
        .center-hero.hero-anchor-pulse::after {
          animation: heroAnchorPulse 0.9s ease-out;
        }
        @keyframes heroAnchorPulse {
          0%   { opacity: 0;    transform: scale(0.35); }
          15%  { opacity: 0.95; }
          100% { opacity: 0;    transform: scale(1.7); }
        }
        .hero-logo-icon {
          width: 120px; height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 0 32px rgba(196,155,66,0.5));
        }
        .hero-tagline {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.78rem, 1.4vw, 0.9rem);
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.2em;
          line-height: 1.8;
          text-transform: uppercase;
          text-align: center;
          white-space: nowrap;
        }
        .hero-tagline .gold {
          display: inline;
          white-space: nowrap;
          font-weight: 700;
          background: linear-gradient(100deg, #A3782B 0%, #C49B42 30%, #FFF4C2 50%, #C49B42 70%, #A3782B 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shimmer 6s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(196,155,66,0.5));
        }
        @keyframes gold-shimmer {
          0%   { background-position: -100% 0; }
          60%  { background-position: 200% 0; }
          100% { background-position: 200% 0; }
        }
        /* ── NADPIS HERA ────────────────────────────────────────────────
           Tá istá veta a ten istý rez ako na guli (DogPlanetLab.tsx, .ph-h1).
           Rozdiel je len v MIERKE a v PODKLADE: guľa má nadpis cez celú
           obrazovku nad fotkami, stena ho má v bunke mriežky medzi dvoma psami.
           ⚠️ Veľkosť NEURČUJE clamp() — počíta ju makeHeroCard do --hero-fs
           (viď rovnicu tam). Tu je len poistka, keby premenná chýbala. */
        .hero-h1 {
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: var(--hero-fs, 40px);
          line-height: 1.06;
          letter-spacing: 0.005em;
          text-transform: uppercase;
          color: #FFF6DA;
        }
        /* Riadok = blok s nowrap. Jediná poistka proti tretiemu riadku. */
        .hero-h1 .hero-hl { display: block; white-space: nowrap; }
        /* 🔶 ODCHÝLKA OD BRAND MANUÁLU, VEDOMÁ — tá istá ako na guli (Matej
           27. 8.: „v hero nadpise skúsme dať dog a god decoratívom a hrubším").
           Cinzel Decorative je inak vyhradený pre MENÁ PSOV na oficiálnych
           povrchoch; tu ho nesú dve slová v nadpise. Povrch je lab, teda vratné.
           ⚠️ Váha 900 — Decorative je načítaný LEN v 700 a 900. */
        .hero-h1 .g {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 900;
          color: #F5C73D;
        }
        .hero-lead {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          /* ⚠️ Space Grotesk je načítaný len do váhy 600 — vyššie je fake bold. */
          font-weight: 600;
          font-size: calc(var(--hero-fs, 40px) * 0.33);
          line-height: 1.35;
          color: rgba(255,246,218,0.78);
          /* Jeden riadok, rovnako ako na guli. Bezpečné aj na telefóne: veľkosť
             je násobok --hero-fs, ktorá sa počíta z voľnej šírky bunky — takže
             riadok sa zmenšuje spolu s miestom, ktoré má. */
          white-space: nowrap;
        }

        /* ── CIEĽ + TVOJE ČÍSLO ─────────────────────────────────────────
           Matej 27. 8. 2026, druhé kolo: *„nie je to vôbec pekné je to suché…
           potrebujem aby to bolo juicy = najprv bude our tarbet výrazné v pils
           alebo v niečom, osobne by som zvolil outline nie full colour pil
           a pod tým iba text o tom aký pes v poradí bude."*

           🔴 DVE VRSTVY, NIE DVE POLIČKY. Cieľ je NÁŠ a je to vyhlásenie —
           dostal rám. Číslo je TVOJE a je to veta — rám nedostalo, dostalo
           veľkosť a zlato. Dva orámované diely vedľa seba robili tabuľku,
           a to bolo to „suché".
           ⚠️ OUTLINE, NIE PLNÁ VÝPLŇ — Matejova voľba sedí s pravidlom, ktoré
           si sám zapísal 26. 8. pri /map: plná farebná plocha je vyhradená
           hlavnému CTA (tu tmavý portál), všetko ostatné je priesvitný tint.
           A čitateľnosť tintu nesie TMAVÝ INKOUST a PLNÝ farebný rám, nie
           krytie výplne — to je tá istá lekcia z rána 26. 8.
           ⚠️ Veľkosti sú NÁSOBKY --hero-fs: nadpis sa počíta z voľnej šírky
           bunky, takže sa s ním musí zmenšovať aj toto, inak na telefóne
           prerastie to, pod čím stojí. */
        .hero-goal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(var(--hero-fs, 40px) * 0.155);
          /* ── ODSTUP OD MOTTA (Matej 27. 8. 2026) ────────────────────────
             *„motto a chip pôsobí že to je všetko spojene, treba to opticky
             rozdeliť mierne."* Nadpis a tagline sú JEDNA myšlienka, chip
             s číslom je DRUHÁ — pri rovnomernej medzere .center-hero (16 px)
             sa čítali ako štvorriadkový odsek.
             ⚠️ Násobok --hero-fs, nie pixely: medzera musí ustúpiť spolu
             s písmom, inak na telefóne odtlačí chip na susednú fotku. */
          margin-top: calc(var(--hero-fs, 40px) * 0.5);
        }

        /* Chip — PAPYRUS V ZLATOM RÁME, LAPISOVÝ INKOUST.
           Matej 27. 8. 2026: *„nie je to pekné je to divné, skús ten chip
           urobiť krajší."*

           🔴 MODRÝ LEM BOL CHYBA PROTI VLASTNÉMU PRAVIDLU. navGoldSkin.ts:
           *„ZLATO = konštrukcia a poloha — rám, doska, čiary… LAPIS = moja
           voľba a moja akcia."* Rám je konštrukcia, teda zlatý; lapis nesie
           odkaz, teda písmo. S modrým lemom stál na teplej stene studený
           obdĺžnik, ktorý vyzeral ako formulárové pole — odtiaľ to „divné".
           ⚠️ Výplň je LOCKNUTÝ bledý blok z /entry (papyrusový gradient,
           zlatý rám 1,5 px, zlatý halo prstenec, teplý tieň, biela horná
           hrana), nie plochá biela so šedým vlasom.
           ⚠️ Zlatý rám sa nebije s btn-gold pod ním: CTA je PLNÁ zlatá
           plocha, toto je bledá plocha so zlatým VLASOM. */
        /* ── 4. KOLO: CELÁ LAPISOVÁ, TMAVÁ (Matej 27. 8. 2026) ──────────────
           *„pils daj celu lapisom nech je tmavá a namiesto tej planétky daj
           iconu labky v srdiečku"*.

           🔴 VEDOMÁ VÝNIMKA Z VLASTNÉHO PRAVIDLA. 26. 8. si Matej pri /map
           zapísal, že plná farebná plocha patrí JEDINÉMU prvku na doske —
           hlavnému CTA. Tu je hlavné CTA tmavý portál so zlatým lemom, teda
           lapisová plocha mu farbou nekonkuruje; flagnuté pred ním a potvrdené.
           ⚠️ Zlaté písmo NA lapise nie je ozdoba (navGoldSkin.ts): bez neho je
           z lapisu len tmavý obdĺžnik bez príslušnosti k brandu — lapis + zlato
           je pôvodná egyptská dvojica.
           ⚠️ Rám je LAPIS.edge, nie zlato: zlatý vlas okolo tmavej plochy by
           z pilulky spravil druhé tlačidlo vedľa portálu. */
        .hero-goal-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          padding: 0.8em 1.55em;
          border-radius: 999px;
          background: ${Y.grad};
          border: 1.5px solid ${Y.edge};
          box-shadow:
            0 0 0 3.5px rgba(22,48,122,0.14),
            0 10px 26px -10px rgba(5,15,48,0.55),
            inset 0 1px 0 rgba(201,154,63,0.30);
          color: ${Y.ink};
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          /* −10 % (Matej 27. 8.: „ok lepšie ale zmenši to o 10%“). Mení sa JEDEN
             násobok — výplň, ikonka aj medzery sú v em, takže sa stiahnu s ním.
             ⚠️ Kto siahne na rovnicu nadpisu, musí siahnuť aj sem: pilulka je
             odklepnutá vo svojej veľkosti, takže rast nadpisu treba kompenzovať
             delením (0.324 / pomer rastu). */
          font-size: calc(var(--hero-fs, 40px) * 0.324);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1;
        }
        /* Milión je to jediné číslo v pilulke — na tmavom ho nesie ČISTÉ zlato
           (jasnejšie než okolitý text), aby oko vedelo, čo si má odniesť.
           Na papyruse to isté robil najtmavší lapis; princíp je rovnaký —
           dôraz robí kontrast voči podkladu, nie iná farba. */
        .hero-goal-pill b {
          font-weight: 600;
          font-size: 1.14em;
          color: #F5C73D;
          letter-spacing: 0.05em;
        }
        /* Labka v srdiečku z hand-drawn kitu (heartpaw.svg, viewBox 341×306,
           preto NIE je štvorcová — výška sa dopočíta z pomeru strán).
           ⚠️ fill: currentColor na path, aby ikonka dedila inkoust
           pilulky; kit má tvary plné, nie obrysové. */
        .hero-goal-globe {
          width: 1.62em;
          height: calc(1.62em * 306 / 341);
          flex: 0 0 auto;
          color: rgba(239,215,154,0.78);
        }

        /* Riadok pod pilulkou — VETA, nie údaj. Bez rámu, bez pozadia.
           🔴 ČÍSLO JE LAPIS, NIE ZLATO (Matej 27. 8. 2026: *„urob to lapisom
           a výrazné, to číslo # je zlaté a je skoro neviditeľné, to musí byť
           výraznejšie"*).
           ⚠️ A NIE JE TO VKUS, JE TO PRAVIDLO, KTORÉ TU UŽ STOJÍ ZAPÍSANÉ:
           „ŽIADNY ZLATÝ GRADIENT DO PÍSMEN" (DogPlanetLab.tsx, .ph-h1). Zlatý
           prebeh má strednú zarážku svetlejšiu než papyrus, takže presne stred
           slova — pri dvojcifernom čísle prakticky celé — splynie s podkladom.
           Prebeh gold-shimmer tým pádom zanikol aj tu: hýbal niečím, čo nebolo
           vidieť. Zlato na stene ostáva na TMAVOM (portál, nav), na papyruse
           nesie kontrast lapis. */
        .hero-goal-you {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: calc(var(--hero-fs, 40px) * 0.245);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1;
          color: rgba(10,26,74,0.62);
        }
        .hero-goal-you b {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 2.55em;
          letter-spacing: 0.01em;
          margin-left: 0.26em;
          vertical-align: -0.17em;
          color: #16307A;
          /* Halo je BIELE a tesné — dvíha hranu čísla nad papyrusom bez toho,
             aby ho zafarbilo. Nie je to tieň pod textom, je to svetlo za ním. */
          text-shadow:
            0 0 8px rgba(255,255,255,0.95),
            0 0 20px rgba(255,255,255,0.75),
            0 1px 0 rgba(255,255,255,0.9);
        }

        /* ── TELEFÓN ────────────────────────────────────────────────────
           🔴 ČITATEĽNOSŤ, NIE KOZMETIKA. Karty sú pod 768 px menšie o ďalšiu
           tretinu (MScale), takže voľná šírka bunky spadne z 306 na 205 px —
           a s ňou celý hero, ktorý sa z nej počíta. Pri pôvodnom násobku tam
           z pilulky ostalo 6,5 px vysadeného textu.
           Riešenie je pustiť pilulku do DVOCH RIADKOV: berie polovičnú šírku,
           takže písmo môže NARÁSŤ namiesto toho, aby sa zmenšovalo.
           ⚠️ 767.98px, nie 720: hranica MUSÍ sedieť s MScale, ktorá sa v tomto
           súbore počíta z window.innerWidth pod 768. */
        @media (max-width: 767.98px) {
          .hero-goal-pill {
            white-space: normal;
            text-align: center;
            font-size: calc(var(--hero-fs, 40px) * 0.45);
            padding: 0.7em 1.1em;
            letter-spacing: 0.11em;
          }
          .hero-goal-globe { display: none; }
          .hero-goal-you {
            font-size: calc(var(--hero-fs, 40px) * 0.315);
            letter-spacing: 0.11em;
          }
        }

        .join-btn {
          display: inline-block;
          text-decoration: none;
          margin-top: 6px;
          padding: 16px 40px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s, opacity 0.22s;
          animation: joinBtnPulse 3.2s ease-in-out infinite;
        }
        .join-btn:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .join-btn:active { transform: scale(0.98); }

        ${Yo}

        /* ── VARIANT B: PRÁZDNA DLAŽDICA NA ZÁPIS PSA ──────────────────────
           Dedí .dog-card (rozmer + pozícia v mriežke), mení len výplň a obsah.
           Rozmery preto NIE SÚ zapísané znova — to je celý dôvod, prečo je to
           bunka mriežky a nie prvok v hero. */
        .enroll-card {
          overflow: hidden;
          background: linear-gradient(160deg, #2a2014, #12100c);
          border: 2px dashed rgba(201,154,63,0.6);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.45), 0 10px 34px rgba(0,0,0,0.4);
          transition: border-color 0.25s, box-shadow 0.25s;
          cursor: pointer;
        }
        .enroll-card:hover {
          border-color: rgba(245,199,61,0.95);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.45), 0 0 44px rgba(230,158,26,0.35), 0 10px 34px rgba(0,0,0,0.4);
        }

        /* PORTÁL V MRIEŽKE. Bunka prestáva byť kartou a stáva sa len držiakom —
           vlastný rám, výplň aj tieň má portál. Prerušovaný zlatý rám variantu B
           tým zanikol.
           ⚠️ overflow: visible je PODMIENKA, nie preferencia: plátno iskier je
           2,35× širšie než jadro a orezané v polovici vyzerá ako chyba.
           ⚠️ z-index dvíha dlaždicu nad susedov, aby iskry lietali PRES ne —
           bez toho by ich prekryla ktorákoľvek karta vykreslená neskôr. */
        .enroll-card--portal {
          overflow: visible;
          background: none;
          border: 0;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        /* 🔴 PREMENNÉ PATRIA NA .ph-portal, NIE NA KARTU. Portál si ich definuje
           SÁM NA SEBE, a vlastná deklarácia prvku prebije hodnotu zdedenú od
           rodiča — prepis na karte sa teda ticho zahodil a žiara ostala na 2,45×
           (637 px), teda presne to, čo Matej videl: *„nie je vôbec stiahnuté…
           žiara osvetľuje okolité fotky, stlm to."*
           PREČO menej než na guli: na guli má žiara za sebou otáčajúce sa fotky
           a musí ich prekryť; na stene sú susedia nepriehľadné karty, takže cezeň
           nič nepresvitá — a pri 260 px jadre siahala cez pol mriežky. */
        .enroll-card--portal .ph-portal {
          --ph-halok: 1.15;
          --ph-haloa: 0.35;
        }

        /* 🔴 KARTA NEMÁ VLASTNÝ HOVER. Matej 27. 8. 2026: *„pri dotyku myšou je bug"* —
           celá dlaždica zbelela. Nebol to portál: dog-card::after je bledý závoj
           rgba(251,245,230,0.82), ktorý na karte PSA odkrýva heroglyf, a
           dog-card:hover ju zväčšuje na 1,08. Na dlaždici, ktorá sama JE výzvou,
           je závoj cudzí a mierka by ťahala aj plátno iskier.
           Portál má vlastnú, jemnú odozvu (.ph-portal:hover .ph-add, 1,035). */
        .enroll-card--portal::after { content: none; }
        .enroll-card--portal:not(.is-open):hover {
          transform: none;
          box-shadow: none;
        }

        /* Tváre už zapísaných psov — čo tu pribudne, keď to naplníš. */
        .enroll-faces { position: absolute; inset: 0; }
        .enroll-face {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: 50% 40%;
          opacity: 0;
          filter: grayscale(1) contrast(0.85);
          animation: enrollFace ${zi*3}s ease-in-out infinite;
        }
        @keyframes enrollFace {
          0%   { opacity: 0;    transform: scale(1.07); }
          4%   { opacity: 0.22; }
          16%  { opacity: 0.22; }
          20%  { opacity: 0;    transform: scale(1); }
          100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .enroll-face { animation: none; opacity: 0.15; }
        }

        .enroll-body {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          padding: 14px;
          text-align: center;
        }
        .enroll-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.98rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #F5C73D;
          text-shadow: 0 2px 12px rgba(0,0,0,0.8);
          margin: 0;
          transition: opacity 0.2s;
        }

        /* Plus — kreslený, nie znak z fontu (Cinzel má „+" úzke a nízke). */
        .enroll-plus {
          position: relative;
          width: 30%; aspect-ratio: 1;
          transition: opacity 0.2s, transform 0.25s;
        }
        .enroll-plus::before, .enroll-plus::after {
          content: '';
          position: absolute; left: 50%; top: 50%;
          background: #F5C73D;
          border-radius: 3px;
          box-shadow: 0 0 18px rgba(230,158,26,0.6);
        }
        .enroll-plus::before { width: 6px; height: 100%; margin: -50% 0 0 -3px; }
        .enroll-plus::after  { height: 6px; width: 100%; margin: -3px 0 0 -50%; }
        /* :not() je nutné — .enroll-card:hover .enroll-plus má vyššiu špecificitu
           než .is-named .enroll-plus a plus by po zápise svietil CEZ meno psa. */
        .enroll-card:not(.is-named):not(.is-typing):hover .enroll-plus {
          transform: scale(1.08);
        }

        /* Pole leží NA dlaždici — žiadna medzistránka medzi sľubom a splnením. */
        .enroll-input {
          position: absolute;
          left: 10%; width: 80%;
          top: 50%; transform: translateY(-50%);
          padding: 10px 4px;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(245,199,61,0.75);
          outline: none;
          text-align: center;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.45rem;
          color: #FFF4C2;
          opacity: 0; pointer-events: none;
          transition: opacity 0.22s;
        }
        .enroll-input::placeholder {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          letter-spacing: 0.06em;
          color: rgba(255,244,194,0.5);
          text-transform: none;
        }
        .is-typing .enroll-plus, .is-typing .enroll-label, .is-typing .enroll-num { opacity: 0; }
        .is-typing .enroll-input { opacity: 1; pointer-events: auto; }

        /* Meno psa = Cinzel Decorative (brand lock: meno PSA na oficiálnom povrchu). */
        .enroll-name {
          position: absolute;
          left: 8%; width: 84%;
          top: 46%; transform: translateY(-50%);
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.6rem;
          line-height: 1.15;
          color: #FFF4C2;
          text-shadow: 0 0 26px rgba(230,158,26,0.55);
          opacity: 0;
          transition: opacity 0.3s;
          word-break: break-word;
        }
        .enroll-num {
          position: absolute;
          left: 50%; bottom: 10%;
          transform: translateX(-50%);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.12em;
          color: rgba(245,199,61,0.85);
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
          transition: opacity 0.3s;
        }
        .enroll-go {
          position: absolute;
          left: 50%; bottom: 8%;
          transform: translateX(-50%);
          padding: 12px 26px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.84rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 0 24px rgba(255,200,90,0.55), inset 0 1px 0 rgba(255,255,255,0.45);
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s;
        }

        /* Meno je na stene — sľub „zapíš psa" splnený. Až TERAZ sa ide ďalej. */
        .enroll-card.is-named {
          border-style: solid;
          border-color: rgba(245,199,61,0.95);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.45), 0 0 52px rgba(230,158,26,0.45), 0 10px 34px rgba(0,0,0,0.4);
          cursor: default;
        }
        .is-named .enroll-plus, .is-named .enroll-label, .is-named .enroll-num { opacity: 0; }
        .is-named .enroll-name { opacity: 1; }
        .is-named .enroll-face { animation-play-state: paused; opacity: 0.12; }
        .is-named .enroll-go { opacity: 1; pointer-events: auto; }

        /* A/B prepínač (DEV) */
        /* ⚠️ Vľavo DOLE nefunguje — cez celú spodnú hranu leží .consent-banner
           a prepínač sa cezeň nedá kliknúť, kým človek neodklepne cookies
           (chytené Playwrightom: „consent-banner intercepts pointer events"). */
        .ab-switch {
          position: fixed;
          left: 20px; top: 62px;
          z-index: 60;
          display: flex;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(201,154,63,0.55);
          background: rgba(10,8,5,0.88);
          box-shadow: 0 6px 22px rgba(0,0,0,0.45);
        }
        .ab-switch button {
          padding: 7px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255,244,220,0.6);
          transition: background 0.2s, color 0.2s;
        }
        .ab-switch button.is-on {
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          color: #1a1206;
        }
        @keyframes joinBtnPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .join-btn { animation: none; }
        }
        .hero-count {
          display: inline-flex;
          align-items: center;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.16em;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          text-transform: uppercase;
          text-shadow: 0 0 14px rgba(0,0,0,0.85);
          padding: 6px 16px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 999px;
          background: rgba(8,8,8,0.55);
          box-shadow: 0 0 16px rgba(201,154,63,0.2), 0 0 12px rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
        }
        .hero-count-num {
          background: linear-gradient(180deg, #F4C75A 0%, #D8821F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }
        .hero-count-sep { color: rgba(255,255,255,0.55); margin: 0 4px; }
        .hero-count-total { color: rgba(255,255,255,0.7); }
        /* inline-flex oseká holú medzeru pred „DOGS" → vlastná medzera cez margin */
        .hero-count-dogs { margin-left: 0.45em; }

        /* ── Hektor — fixed founder card, gold frame + glow ── */
        .hektor-card {
          box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28);
          animation: hektor-glow-loop 4.5s ease-in-out infinite;
          z-index: 4;
        }
        .hektor-card:not(.is-open):hover {
          transform: scale(1.06);
          box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 90px rgba(216,130,31,0.85),
            0 0 200px rgba(216,130,31,0.45);
        }
        @keyframes hektor-glow-loop {
          0%, 100% { box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28); }
          50%      { box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 80px rgba(216,130,31,0.75),
            0 0 170px rgba(216,130,31,0.38); }
        }
        .hektor-label {
          background: linear-gradient(180deg, rgba(196,155,66,0.92) 0%, rgba(154,114,40,0.92) 100%);
          color: #15080a;
          font-weight: 900;
          letter-spacing: 0.12em;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* ── Hektor heroglyph — hover only, centered ── */
        .hektor-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 1; }
        .is-dragging .hektor-heroglyph-wrap { opacity: 0 !important; }
        .hektor-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Real dog heroglyph — hover only, centered ── */
        .dog-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .dog-card:not(.is-open):hover .dog-heroglyph-wrap { opacity: 1; }
        .is-dragging .dog-heroglyph-wrap { opacity: 0 !important; }
        .dog-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Reveal card (in grid) ── */
        .reveal-card-inner {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: 50% 30%;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0ms;
        }
        .reveal-card.reveal-active .reveal-card-inner {
          opacity: 1;
          transition: opacity 800ms ease;
        }
        .reveal-card-fallback {
          background: linear-gradient(135deg, hsl(224 40% 18%), hsl(45 60% 30%));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .reveal-card-fallback .cartouche {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 6vw, 2rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: hsl(45 90% 60%);
        }

        /* Card gold glow on reveal */
        @keyframes card-entrance {
          0%   { box-shadow: none; transform: scale(0.9); }
          40%  { transform: scale(1.07);
                 box-shadow: 0 0 0 3px rgba(196,155,66,0.9),
                             0 0 100px rgba(196,155,66,0.95),
                             0 0 200px rgba(196,155,66,0.5); }
          70%  { transform: scale(0.98); }
          100% { transform: scale(1);
                 box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                             0 0 50px rgba(196,155,66,0.45),
                             0 0 100px rgba(196,155,66,0.2); }
        }
        @keyframes card-glow-loop {
          0%,100% { box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                                0 0 50px rgba(196,155,66,0.45),
                                0 0 100px rgba(196,155,66,0.2); }
          50%     { box-shadow: 0 0 0 3px rgba(196,155,66,0.75),
                                0 0 70px rgba(196,155,66,0.65),
                                0 0 140px rgba(196,155,66,0.3); }
        }
        .reveal-card.reveal-active {
          animation: card-entrance 1.4s cubic-bezier(0.34,1.3,0.64,1) forwards,
                     card-glow-loop 4s ease-in-out 1.4s infinite;
          z-index: 10;
        }

        /* ── Reveal sequence overlay ── */
        /* ODHALENIE PO PLATBE (Matej 16. 10. 2026 po videu po-platbe-mob-bledy.mp4,
           vybral verziu B): papyrus LAB, ZVISLÝ heroglyf cez celú výšku telefónu
           v tmavom atramente, zlatá žiara po celom okne a za ním veľmi slabo fotka psa
           cez celé okno. Glyf zmizne, fotka nabehne naplno a stena sa z nej odzoomuje
           (fotka = karta na stene). Kruhová fotka zrušená. */
        .rev-overlay {
          position: fixed;
          inset: 0;
          /* Nad horným navom aj spodnou lištou rámu — glyf má celé okno. */
          z-index: 9500;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: ${Le.pageBg};
          background-image: ${Le.pageBackdrop};
          pointer-events: none;
          transition: none;
        }
        .rev-overlay.ph-zoom { opacity: 0; transition: opacity 450ms ease; }
        .rev-overlay.ph-wait > * { visibility: hidden; animation: none !important; }

        .rev-glow {
          position: absolute;
          top: 50%; left: 50%;
          width: 170vmax; height: 170vmax;
          margin: -85vmax 0 0 -85vmax;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,236,170,1) 0%, rgba(240,200,105,0.85) 16%, rgba(214,168,72,0.5) 32%, rgba(201,154,63,0.18) 48%, rgba(201,154,63,0) 62%);
          opacity: 0;
          animation: rev-glow 2400ms cubic-bezier(0.25,0.46,0.45,0.94) forwards;
        }
        /* Žiara po vzplanutí odíde skoro celá, inak by zakryla slabú fotku. */
        @keyframes rev-glow {
          0%   { opacity: 0; transform: scale(0.15); }
          35%  { opacity: 0.85; transform: scale(1); }
          100% { opacity: 0.12; transform: scale(1.08); }
        }
        .rev-overlay.ph-vanish .rev-glow {
          opacity: 0; transition: opacity 700ms ease; animation: none;
        }
        .rev-overlay.ph-zoom .rev-glow { display: none; }

        /* Fotka psa za glyfom. Štvorec 100vmax so stredom v strede okna = presne
           karta na stene pri priblížení max(okno)/W, aby prechod na stenu nepreskočil. */
        .rev-bgphoto {
          position: absolute;
          top: 50%; left: 50%;
          width: 100vmax; height: 100vmax;
          margin: -50vmax 0 0 -50vmax;
          background-size: cover;
          background-position: 50% 30%;
          opacity: 0.24;
          filter: saturate(0.7);
          transition: opacity 700ms ease, filter 700ms ease;
        }
        .rev-overlay.ph-vanish .rev-bgphoto, .rev-overlay.ph-zoom .rev-bgphoto { opacity: 1; filter: none; }

        .rev-big-symbol {
          position: relative;
          height: min(88vh, 88dvh);
          width: auto;
          max-width: 86vw;
          object-fit: contain;
          pointer-events: none;
          animation: symbol-burn 2s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
          will-change: transform, opacity, filter;
        }
        /* Horizontálny (PC, alebo chýba zvislý): cez šírku okna, nie známka v strede. */
        .rev-big-symbol.is-h { height: auto; width: min(82vw, 1100px); max-height: 60vh; }
        .rev-overlay.ph-vanish .rev-big-symbol {
          animation: rev-vanish 650ms ease-in forwards;
        }
        @keyframes rev-vanish {
          0%   { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 14px rgba(201,154,63,0.55)); }
          100% { opacity: 0; transform: scale(1.12); filter: blur(6px) drop-shadow(0 0 40px rgba(255,214,120,0.9)); }
        }
        .rev-overlay.ph-zoom .rev-big-symbol { display: none; }

        /* Stena z priblíženia na kartu. Popisy karty (meno, číslo, vlajka) by pri
           päťnásobku boli obrie — prídu, až keď stena dobehne. */
        .rev-wall { transition: transform 2000ms cubic-bezier(0.65,0,0.35,1); transform-origin: 50% 50%; }
        .rev-wall.rev-zoom { transition: none; }
        .rev-wall .reveal-card .card-name-block,
        .rev-wall .reveal-card .card-rank-top,
        .rev-wall .reveal-card .card-flag { transition: opacity 600ms ease 1500ms; }
        .rev-wall.rev-zoom .reveal-card .card-name-block,
        .rev-wall.rev-zoom .reveal-card .card-rank-top,
        .rev-wall.rev-zoom .reveal-card .card-flag { opacity: 0; transition: none; }
        .rev-wall .reveal-card .reveal-card-inner { transition: none; }
        .rev-wall .reveal-card.reveal-active { animation: card-glow-loop 4s ease-in-out 2s infinite; }

        /* ── Filter / find dog by number ── */
        .filter-btn {
          z-index: 50;
          width: 40px; height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          color: rgba(0,0,0,0.7);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: border-color 150ms, opacity 150ms;
        }
        .filter-btn:hover { opacity: 0.75; }
        .filter-btn.active { border-color: rgba(0,0,0,0.35); }

        /* Numpad overlay — dims the screen, centered beige keypad (no native keyboard) */
        .numpad-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease;
        }
        .numpad-overlay.open { opacity: 1; pointer-events: auto; }
        .numpad {
          width: min(80vw, 290px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 16px 56px rgba(0,0,0,0.55);
          transform: scale(0.92);
          transition: transform 200ms ease;
        }
        .numpad-overlay.open .numpad { transform: scale(1); }
        .numpad-display {
          height: 54px;
          margin-bottom: 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(201,154,63,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.7rem;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.82);
        }
        .numpad-display .ph {
          color: rgba(0,0,0,0.3);
          font-size: 1rem;
          letter-spacing: 0.08em;
        }
        .numpad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .numpad-key {
          height: 52px;
          border-radius: 10px;
          border: 1px solid rgba(201,154,63,0.4);
          background: rgba(255,255,255,0.38);
          color: rgba(0,0,0,0.8);
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: background 120ms, transform 80ms;
        }
        .numpad-key:active {
          transform: scale(0.95);
          background: rgba(201,154,63,0.28);
        }
        .numpad-key--cancel {
          color: #CF3A2E;
          border-color: rgba(207,58,46,0.45);
          background: rgba(207,58,46,0.08);
        }
        .numpad-key--enter {
          color: #2E9E4F;
          border-color: rgba(46,158,79,0.5);
          background: rgba(46,158,79,0.10);
        }

        /* ── Wide numpad: search (numpad) + country stats side by side ── */
        .numpad--wide { width: min(92vw, 560px); }

        .numpad-body {
          display: grid;
          grid-template-columns: 258px 1fr;
          gap: 18px;
          align-items: stretch;
        }
        .numpad-search { min-width: 0; }
        .numpad-countries {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border-left: 1px solid rgba(201,154,63,0.3);
          padding-left: 18px;
        }
        .numpad-countries-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.55);
          margin-bottom: 12px;
        }
        .numpad-countries-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          max-height: 300px;
        }
        .ncountry-row {
          display: grid;
          grid-template-columns: 26px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 9px;
          background: rgba(255,255,255,0.34);
          border: 1px solid rgba(201,154,63,0.28);
        }
        .ncountry-flag { font-size: 1.15rem; line-height: 1; }
        .ncountry-code {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          color: rgba(0,0,0,0.8);
        }
        .ncountry-count {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: rgba(201,154,63,1);
          min-width: 1.4em;
          text-align: right;
        }
        /* ── POLE NA MENO AJ ČÍSLO (3. 10. 2026) — ten istý displej, len sa doň
           dá písať. Číslo ostáva veľké ako predtým; meno je dlhšie, preto menšie. */
        .numpad-input {
          width: 100%; padding: 0 12px; text-align: center; outline: none;
          font-size: 1.3rem; text-transform: uppercase;
        }
        .numpad-input::placeholder {
          color: rgba(0,0,0,0.3); font-size: 0.85rem; letter-spacing: 0.06em; text-transform: none;
        }
        .numpad-input:focus { border-color: ${Y.edge}; box-shadow: 0 0 0 2px rgba(22,48,122,0.18); }
        .numpad--typing .numpad-input { font-size: 1.05rem; letter-spacing: 0.06em; }
                /* Mobile: countries on TOP, numpad below (palec dosiahne numpad → ľahšie písanie) */
        @media (max-width: 520px) {
          .numpad--wide { width: min(88vw, 320px); }
          .numpad-body { grid-template-columns: 1fr; gap: 14px; }
          .numpad-countries {
            order: -1;
            border-left: none;
            padding-left: 0;
          }
          .numpad-countries-list { max-height: 264px; } /* ~5 krajín viditeľných */
          .numpad-search {
            border-top: 1px solid rgba(201,154,63,0.3);
            padding-top: 14px;
          }
          /* 📱 Píšem meno ⇒ vyskočí klávesnica: kalkulačka sa schová a výsledky
             idú POD pole (Matej 3. 10. 2026, hárok nakres-stena-hladanie). */
          .numpad--typing .numpad-grid { display: none; }
          .numpad--typing .numpad-countries { order: 1; }
          .numpad--typing .numpad-search { border-top: none; padding-top: 0; }
          .numpad--typing .numpad-display { margin-bottom: 0; }
        }

        /* ── KALKULAČKA NAD GUĽOU — TEN ISTÝ PANEL, INÉ UKOTVENIE ───────────
           ⚠️ Panel sa NEPREKRESĽUJE (Matej 25. 8.: „kalkulačku si nemal meniť,
           mala ostať taká aká je aj v gride"). Prvé kolo ju tu zúžilo, zmenšilo
           displej a schovalo zoznam krajín — to bola úprava, ktorú nikto nepýtal.
           Mení sa VÝHRADNE ukotvenie: zmizne závoj (inak by nebolo vidno kartu,
           ktorá sa vpravo mení) a panel ide k ľavému okraju, kde má stáť.
           🔴 pointer-events:none na obale je NUTNOSŤ, nie kozmetika: overlay kryje
           celé okno, takže by inak zožral každý klik do gule a psa by sa nedalo
           vybrať myšou. Chytá len samotný panel. */
        /* ⚠️ DVOJITÁ TRIEDA NIE JE OZDOBA. Pravidlo .numpad-overlay.open zapína
           pointer-events: auto a má vyššiu váhu než samotné --planet, takže
           obal ďalej chytal KAŽDÝ klik do gule a psa sa nedalo vybrať myšou
           (dispatch v konzole to nechytí — ten cieľ obchádza). */
        .numpad-overlay.numpad-overlay--planet {
          background: transparent;
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
          justify-content: flex-start;
          padding-left: 16px;
          pointer-events: none;
        }
        /* ⚠️ IBA V OTVORENOM STAVE (Matej 27. 8. 2026: *„ak kliknem na fotku v globe,
           posunie ju doľava a blok s detailom psa doprava, avšak v tomto momente
           nejde kliknúť na CTA"*). Bez triedy .open chytal klik aj ZAVRETÝ pult —
           je priehľadný (opacity 0), ale ako plocha 515 × 336 px stále existuje
           a leží pri ľavom okraji. Kým guľa stojí v strede, nikoho neruší; len čo
           sa pri otvorení detailu psa odsunie doľava, CTA vojde presne pod neho
           a prestane sa dať kliknúť. Zavretý pult si pointer-events none
           zdedí od obalu, takže tu netreba nič dopisovať. */
        .numpad-overlay.numpad-overlay--planet.open .numpad { pointer-events: auto; }
        /* Na mobile príde karta psa ZHORA, takže pult ide dole — inak by si
           stáli na tom istom mieste. */
        /* 🔴 MOBIL: POPUP NAD NAVOM (Matej 7. 10. 2026, snímka z iPhonu: *„treba opraviť nech
           je to popup nad navom"*). Pult bol vnorený v .op-planet (z 1 + transform = vlastná
           vrstva), takže horný nav, dok, šípky aj AINUBIS ležali NAD ním a zoznam krajín
           zaliezal pod lištu. Teraz ide portálom do <body> (z 9000) a na mobile je to modál:
           závoj, stred, ťuk vedľa zavrie, výber psa zavrie (karta psa príde zhora). PC ostáva
           pult vľavo bez závoja (Matej 25. 8.). */
        .numpad-overlay { z-index: 9000; }
        @media (max-width: 760px) {
          .numpad-overlay.numpad-overlay--planet {
            background: rgba(20,12,4,0.55);
            -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
            justify-content: center; align-items: center; padding: 16px;
          }
          .numpad-overlay.numpad-overlay--planet.open { pointer-events: auto; }
          .numpad-overlay--planet .numpad { max-height: calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); overflow-y: auto; overscroll-behavior: contain; }
        }

        /* ── Bottom bar: filter + center (+ flag on mobile), centered as a row ── */
        /* Celá šírka okna + margin auto, NIE left:50% + translateX(-50%) — fixovaný
           prvok s left:50% má k dispozícii len pravú polovicu okna a pri úzkej šírke
           sa zmrští (lock /onepage nav, 28. 8. 2026). Lišta je sama odliatok, preto
           fit-content, nie pás. */
        .gods-bottom-bar {
          position: fixed;
          bottom: 16px;
          left: 0;
          right: 0;
          width: fit-content;
          margin-inline: auto;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .center-btn-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          color: rgba(0,0,0,0.7);
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          padding: 0;
        }
        .center-btn-mobile:hover { opacity: 0.85; }

        /* Flag pill — bottom bar, mobile only (desktop keeps it in the top nav) */
        .lang-btn-mobile {
          display: none;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 10px;
          border-radius: 999px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .lang-btn-mobile .lang-picker--flow .lang-trigger { color: rgba(0,0,0,0.72); padding: 0; }
        .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(0,0,0,0.5); }

        @media (max-width: 768px) {
          /* Horný nav má mobilné pravidlá v ráme (LabShell). Tu ostáva len to,
             čo patrí spodnej lište. */
          .lang-btn-mobile { display: flex; }

          /* Mobil center hero: zmenšené logo + CTA, zvýraznený počet psov */
          .center-hero { gap: 13px; }
          .hero-logo-icon { width: 108px; height: 108px; } /* -10% */
          .join-btn {
            padding: 11px 28px;       /* -30% */
            font-size: 0.69rem;       /* -30% */
            letter-spacing: 0.12em;
          }
          /* počet psov: badge je globálny, mobil len zmenší (menší než CTA) */
          .hero-count {
            font-size: 0.92rem;
            padding: 5px 14px;
          }
          .hero-count-num { font-size: 1.05rem; }

          /* Hekthor open overlay: menšia karta → menší heroglyf + tesnejší text,
             aby sa dlhá osobná správa zmestila bez orezania. */
          .card-open-overlay { padding: 12px; gap: 6px; }
          .card-open-heroglyph { width: 34%; }
          .card-open-name { font-size: 0.82rem; }
          .card-open-msg { font-size: 0.62rem; line-height: 1.45; }
        }
        .hero-count-globe {
          width: 15px; height: 15px;
          color: #E2B45C;
          margin-right: 7px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 5px rgba(201,154,63,0.45));
        }

        /* ── Touch devices: skip hover preview → tap goes straight to info ── */
        @media (hover: none) {
          .dog-card:not(.is-open):hover {
            transform: none !important;
            box-shadow: none !important;
          }
          .dog-card:not(.is-open):hover::after { opacity: 0 !important; }
          .dog-card:not(.is-open):hover .card-rank-top,
          .dog-card:not(.is-open):hover .card-flag,
          .dog-card:not(.is-open):hover .card-name-block { opacity: 1 !important; }
          .dog-card:not(.is-open):hover .dog-heroglyph-wrap,
          .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 0 !important; }
          .hektor-card:not(.is-open):hover { transform: none !important; }
        }

        /* Heroglyf sa VYPAĽUJE do papyrusu v tmavom atramente (bez invert) so zlatou žiarou. */
        @keyframes symbol-burn {
          0%   { opacity: 0; filter: blur(16px); transform: scale(0.4); }
          30%  { opacity: 1; filter: blur(0)
                   drop-shadow(0 0 28px rgba(255,214,120,0.95))
                   drop-shadow(0 0 60px rgba(201,154,63,0.7));
                 transform: scale(1.08); }
          60%  { transform: scale(0.97); }
          100% { opacity: 1; filter: drop-shadow(0 0 14px rgba(201,154,63,0.55)); transform: scale(1); }
        }

        /* ════════════════════════════════════════════════════════════════
           TMAVÁ BEZ ŽIARY ('darkcalm') — kontrolná vzorka k feedbacku
           „vyzerá to ako podvod" (Matej 2026-08-09: povedal PODVOD, nie tmavé).
           Hypotéza: dojem crypto/NFT mintu nerobí čierne pozadie, ale
           čierna + zlatá + PULZUJÚCA ŽIARA + veľký číselník. Tu ostáva
           všetko ako dnes, zhasnú sa len vždy-zapnuté žiary a pulzy.
           Hover žiara heroglyfov ostáva — tá nie je súčasťou prvého dojmu.
           ════════════════════════════════════════════════════════════════ */
        .theme-darkcalm .join-btn {
          box-shadow:
            0 8px 24px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.35);
          text-shadow: none;
          animation: none;
        }
        .theme-darkcalm .join-btn:hover {
          box-shadow:
            0 10px 30px rgba(0,0,0,0.62),
            inset 0 1px 0 rgba(255,255,255,0.45);
        }
        /* Hektor si nechá zlatý rám (jediný signál že je founder), stratí len žiaru a pulz */
        .theme-darkcalm .hektor-card {
          box-shadow: 0 0 0 2px rgba(196,155,66,0.85);
          animation: none;
        }
        .theme-darkcalm .hektor-card:not(.is-open):hover {
          box-shadow: 0 0 0 2px rgba(244,199,90,1);
        }
        .theme-darkcalm .hero-logo-icon { filter: none; }
        .theme-darkcalm .hero-tagline .gold {
          animation: none;
          background-position: 50% 0;
          filter: none;
        }
        .theme-darkcalm .hero-count {
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
        }

        /* ════════════════════════════════════════════════════════════════
           LAB — PAPYRUSOVÁ WALL (25. 8. 2026)
           Beh 1: (a) čisté papyrusové pozadie — žiadna heroglyfová textúra,
           žiadny multiply tint, len náš papyrus; (b) horná aj dolná lišta
           BLEDÁ so zlatým okrajom (tmavé sklo z augustového experimentu je
           preč — Matej: „nie tmavé ale bledé s okrajom").
           Karty psov sú fotky → tie sa nemenia, mení sa iba „chrome".
           ════════════════════════════════════════════════════════════════ */
        .gods-root.theme-light { background-color: #F3E4C4; }
        /* Čistý papyrus: prepisujeme obrázok steny gradientom (background shorthand
           zároveň zruší size/position/repeat zo základu) a vypíname blur. */
        .gods-root.theme-light::before {
          inset: 0;
          background:
            radial-gradient(125% 100% at 50% 38%,
              #FDF8EC 0%,
              #F8EDD6 34%,
              #F1E1BE 64%,
              #E6D2A6 100%);
          filter: none;
        }
        /* ::after (multiply tint nad textúrou) v labe NEEXISTUJE — nie je čo tónovať. */

        /* Hero — BEZ oparu. center-hero::before je elipsa s inset -200px -320px,
           ktorá leží NAD kartami (hero má z-index 2) — v tmavej verzii je čierna a
           splynie s pozadím, v bledej by susedné fotky vybielila (Matej 25. 8.:
           „fotiek sa to nesmie dotýkať"). Susedná karta je od stredu 244 px, závoj
           dosahoval ~465 px. Zmenšovať ho netreba: na čistom papyruse nemá čo
           prekrývať a polomer by sa musel dopočítavať voči MScale na mobile.
           Presvit zo stredu ostáva — ale ako gradient POZADIA, teda pod kartami. */
        .theme-light .center-hero::before { display: none; }
        .theme-light .center-hero::after {
          border-color: rgba(140,96,20,0.9);
          box-shadow: 0 0 24px rgba(140,96,20,0.30);
        }
        /* Logo čierne namiesto zlatého (rovnaký súbor, len odfarbený) */
        .theme-light .hero-logo-icon {
          filter: brightness(0) drop-shadow(0 2px 10px rgba(80,55,15,0.22));
        }
        .theme-light .hero-tagline { color: rgba(35,22,8,0.62); }
        /* ⚠️ background shorthand resetuje background-clip → musí sa zopakovať,
           inak sa z gradientového textu stane plná zlatá plocha. */
        .theme-light .hero-tagline .gold {
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: none;
        }

        /* ── NADPIS HERA NA PAPYRUSE ────────────────────────────────────
           Rovnaký inkoust ako na guli: plná tmavá, nie alfa — cez fotky
           susedných kariet sa každé percento priehľadnosti prejaví ako
           vyblednutie. Halo je krémové a hlavne HUSTÉ (blízke vrstvy s alfou
           1), nie široké: rozostrené svetlo je pri veľkom polomere riedke.
           ⚠️ Polomery sú menšie než na guli úmerne k písmu — nadpis tu má
           ~55 px proti ~74 px a ďaleké vrstvy by inak siahali na fotky.
           ⚠️ ŽIADNY ZLATÝ GRADIENT DO PÍSMEN: LAB.goldText má strednú zarážku
           svetlejšiu než papyrus, takže slovo v strede zmizne. */
        .theme-light .hero-h1 {
          color: #23150a;
          text-shadow:
            0 0 5px rgba(253,248,236,1),
            0 0 11px rgba(253,248,236,1),
            0 0 22px rgba(253,248,236,1),
            0 0 44px rgba(253,248,236,1),
            0 0 76px rgba(253,248,236,0.96),
            0 0 130px rgba(253,248,236,0.8);
        }
        /* Zlaté slová držia o 50 % silnejšie halo — to isté pravidlo ako na
           guli (Matej 27. 8.: „pridaj o 50% halo viac pri slove dog a god").
           ⚠️ Píše sa CELÝ zoznam, nie prídavok: text-shadow sa dedí, ale
           nesčítava — deklarácia tu nahradí zdedenú. */
        .theme-light .hero-h1 .g {
          color: #6E4A12;
          text-shadow:
            0 0 8px rgba(255,255,255,1),
            0 0 17px rgba(255,255,255,1),
            0 0 34px rgba(255,255,255,0.98),
            0 0 66px rgba(253,248,236,0.9),
            0 0 120px rgba(253,248,236,0.7);
        }
        .theme-light .hero-lead {
          color: rgba(35,22,8,0.82);
          text-shadow:
            0 0 4px rgba(253,248,236,1),
            0 0 10px rgba(253,248,236,1),
            0 0 22px rgba(253,248,236,1),
            0 0 44px rgba(253,248,236,0.95);
        }

        /* ── BLEDÉ LIŠTY (horná aj dolná) ────────────────────────────────
           Základná (tmavá) wall má pilulky už papyrusové — na papyrusovom
           podklade by ale splynuli, takže sa dvíha kontrast RÁMOM a TIEŇOM,
           nie prefarbením: výplň o odtieň svetlejšia než pozadie, okraj plná
           zlatá 1.5px + zlatý halo ring (jazyk bledých blokov z /entry),
           tieň teplo-hnedý, nie čierny. */
        /* Bledá pilulka — po nasadení zlatého navu ju nesie už len počítadlo
           pod CTA (nav prvky si berú zlatý odliatok nižšie). */
        .theme-light .hero-count {
          background: linear-gradient(135deg, #FDF8EC 0%, #F7EBD2 55%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow:
            0 6px 20px rgba(96,66,18,0.16),
            0 0 0 3px rgba(201,154,63,0.13),
            inset 0 1px 0 rgba(255,255,255,0.65);
          color: rgba(42,22,8,0.86);
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
        .theme-light .filter-btn,
        .theme-light .center-btn-mobile,
        .theme-light .filter-btn.active { border-color: #8C6014; }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger { color: #2a1608; }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(42,22,8,0.55); }

        /* Počet psov pod CTA — tá istá bledá pilulka, len čísla držia zlatý gradient */
        .theme-light .hero-count { text-shadow: none; }
        .theme-light .hero-count-num {
          background: linear-gradient(180deg, #C9871F 0%, #8C5A11 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .theme-light .hero-count-sep { color: rgba(42,22,8,0.35); }
        .theme-light .hero-count-total { color: rgba(42,22,8,0.62); }
        .theme-light .hero-count-globe { color: #A3782B; }

        /* ══════════════════════════════════════════════════════════════
           ZLATÝ NAV — ten istý, čo má /pack (Matej 25. 8.: „prerob horný nav
           aj spodný na ten čo máme v deve, ten nový druh").
           Tokeny sa NEOPISUJÚ — idú z components/pack/navGoldSkin.ts, aby bar
           na stene a bar v appke ostali JEDEN bar. Skladba je z predlohy:
             RÁM (leštené zlato + tmavý obrys) → DOSKA (pieskovec, vlastný obrys,
             zapustená) → ZRNO (tmavé v pozadí, svetlé cez ::after) → OBSAH.
           V Reacte to sú tri vnorené divy; tu sú to ::before/::after, preto musí
           mať každý nosič position:relative a obsah z-index:1.
           ══════════════════════════════════════════════════════════════ */
        /* ⚠️ position do tejto skupiny NEPATRÍ — spodný bar aj prepínač sú
           fixed (a tým samy tvoria kotvu pre ::before/::after). Keď som im sem
           napísal relative, vypadli z fixovania: bar sa vysypal hore a roztiahol
           na celú šírku. Kotvu potrebuje dorobiť len horný nav (je static). */
        /* ⚠️ Doska aj zrno idú na z-index -1, NIE 0. Text v prepínači tém je HOLÝ
           TEXTOVÝ UZOL (nie element), takže sa nedá zdvihnúť cez z-index a doska
           s kladným indexom ho prekryla — z pilulky ostala prázdna zlatá plocha.
           Záporná vrstva sa kreslí nad pozadím prvku, ale pod jeho textom.
           Podmienka: nosič musí byť vlastný stacking context (isolation), inak
           by záporná vrstva padla až za rám. */
        .theme-light .gods-bottom-bar { isolation: isolate; }
        .theme-light .gods-bottom-bar {
          background: ${mn};
          background-blend-mode: ${un};
          border: ${ot.line}px solid ${st.edge};
          border-radius: ${ot.frame}px;
          box-shadow: ${gn};
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
        /* DOSKA */
        .theme-light .gods-bottom-bar::before {
          content: '';
          position: absolute;
          inset: ${ot.rim}px;
          border-radius: ${ot.plate}px;
          background: ${bn};
          background-blend-mode: ${xn};
          border: ${ot.line}px solid ${st.edge};
          box-shadow: ${fn};
          pointer-events: none;
          z-index: -1;
        }
        /* SVETLÉ ZRNO nad doskou */
        .theme-light .gods-bottom-bar::after {
          content: '';
          position: absolute;
          inset: ${ot.rim}px;
          border-radius: ${ot.plate}px;
          ${ja}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .theme-light .gods-bottom-bar > * { position: relative; z-index: 1; }

        /* Spodný bar — jeden odliatok, tlačidlá v ňom sú pilulky na doske
           (v predlohe kruh „G"), preto strácajú vlastný rám. */
        .theme-light .gods-bottom-bar { padding: ${ot.rim+4}px ${ot.rim+6}px; gap: 10px; }
        .theme-light .gods-bottom-bar .filter-btn,
        .theme-light .gods-bottom-bar .center-btn-mobile,
        .theme-light .gods-bottom-bar .lang-btn-mobile {
          background: ${st.activeFill};
          border: ${ot.line}px solid ${st.edge};
          box-shadow: ${Xa};
          color: ${st.ink};
        }
        .theme-light .gods-bottom-bar .filter-btn.active { border-color: ${st.edge}; }

        /* ── LISTA V REZIME FILMU: NASTROJE ⇄ CTA CHIP ────────────────────
           Ikonky sa NEVYPINAJU cez display — zbalia sa na nulovu sirku a chip
           sa na ich mieste rozvinie. Rozdiel je vidiet: pri display: none by
           lista skocila z jednej sirky na druhu, takto sa preleje a ram pod
           navom posobi ako jediny, ktory tam stal cely cas.
           Chip je odliatok aktivnej pilulky z HORNEHO navu (.main-nav
           button.is-on) — tie iste tokeny, aby to bola jedna rodina. */
        /* Portál lišty (viď prop portalDock) — obal len nesie theme-light,
           sám nesmie nič chytať ani kresliť. */
        .gods-dock-portal { position: relative; z-index: 58; pointer-events: none; }
        .gods-dock-portal .gods-bottom-bar { pointer-events: auto; }
        .gods-bottom-bar { transition: gap 380ms cubic-bezier(.22,.61,.36,1); }
        .gods-bottom-bar.has-cta { gap: 0; }
        .gods-bottom-bar .filter-btn,
        .gods-bottom-bar .center-btn-mobile,
        .gods-bottom-bar .lang-btn-mobile {
          transition: opacity 220ms ease, width 380ms cubic-bezier(.22,.61,.36,1),
                      padding 380ms cubic-bezier(.22,.61,.36,1);
        }
        .gods-bottom-bar.has-cta .filter-btn,
        .gods-bottom-bar.has-cta .center-btn-mobile,
        .gods-bottom-bar.has-cta .lang-btn-mobile {
          opacity: 0;
          width: 0;
          min-width: 0;
          padding-left: 0;
          padding-right: 0;
          border-width: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .gods-bottom-bar .gbb-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          flex-shrink: 0;
          border-radius: 999px;
          white-space: nowrap;
          text-decoration: none;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: ${st.activeFill};
          border: 0 solid ${st.edge};
          box-shadow: ${Xa};
          color: ${st.ink};
          opacity: 0;
          max-width: 0;
          padding: 0;
          overflow: hidden;
          pointer-events: none;
          transition: opacity 240ms ease, max-width 420ms cubic-bezier(.22,.61,.36,1),
                      padding 420ms cubic-bezier(.22,.61,.36,1);
        }
        .gods-bottom-bar.has-cta .gbb-cta {
          opacity: 1;
          max-width: 360px;
          padding: 0 24px;
          border-width: ${ot.line}px;
          pointer-events: auto;
        }
        .gods-bottom-bar.has-cta .gbb-cta:hover { opacity: 0.82; }
        @media (max-width: 768px) {
          .gods-bottom-bar .gbb-cta { font-size: 0.68rem; letter-spacing: 0.1em; }
          .gods-bottom-bar.has-cta .gbb-cta { padding: 0 18px; }
        }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger { color: ${st.ink}; }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(42,22,8,0.6); }

        /* ── HOVER na karte psa: bledý závoj + ČIERNY heroglyf (Matej 25. 8.) ──
           Tmavá stena mala opak: čierny závoj rgba(0,0,0,0.62) a glyf prefarbený
           na zlatú so žiarou. Na papyruse je čierny závoj cudzí prvok a zlatá žiara
           nemá kde svietiť. Alfa 0.82 je ladiaci gombík: nižšia = viac vidno fotku,
           vyššia = glyf čitateľnejší na tmavých fotkách.
           brightness(0) drží alfa kanál, takže z bieleho glyfu spraví čistý atrament. */
        .theme-light .dog-card::after { background: rgba(251,245,230,0.82); }
        .theme-light .dog-heroglyph,
        .theme-light .hektor-heroglyph {
          filter: brightness(0) drop-shadow(0 2px 8px rgba(80,55,15,0.18));
        }
        /* tieň zdvihnutej karty na papyruse — teplý, nie čierny.
           ⚠️ VÝNIMKA PRE PORTÁL: dlaždica CTA je priehľadná (vlastný rám a tieň
           nesie portál vnútri), takže tieň karty by okolo nej nakreslil obdĺžnik
           okolo ničoho. Vyňatie musí byť TU — pravidlo o triedu vyššie
           (.theme-light .dog-card) prebíja každý zápis pri .enroll-card--portal,
           nech je v súbore akokoľvek nižšie. */
        .theme-light .dog-card:not(.is-open):not(.enroll-card--portal):hover {
          box-shadow: 0 10px 34px rgba(96,66,18,0.22);
        }

        /* CTA SVIETI AJ NA PAPYRUSE (Matej 25. 8.: „nechaj gold svietenie na CTA").
           Papyrusová verzia tu mala žiaru stlmenú na obyčajný tieň a pulz vypnutý
           — tlačidlo tým splynulo so stenou rovnako ako predtým karta detailu.
           Override je preto zrušený: platí základná .join-btn so zlatou žiarou
           aj joinBtnPulse. Nič sa nekopíruje, len sa nič neprebíja. */
        /* Info overlay — papyrus namiesto čiernej */

      `}),e.jsxs("div",{className:`gods-root theme-${De}`,children:[Ei()&&e.jsxs("div",{className:"ab-switch",role:"group","aria-label":"Variant steny",children:[e.jsx("button",{type:"button",className:$e?"":"is-on",onClick:()=>{Lt(!1);try{localStorage.setItem(ba,"0")}catch{}},children:"A · CTA"}),e.jsx("button",{type:"button",className:$e?"is-on":"",onClick:()=>{Lt(!0);try{localStorage.setItem(ba,"1")}catch{}},children:"B · ZÁPIS PSA"})]}),p&&l&&!y?null:p?Ct.createPortal(e.jsx("div",{className:"theme-light gods-dock-portal",children:e.jsxs("div",{className:`gods-bottom-bar${n?" has-cta":""}`,children:[e.jsx("button",{className:`filter-btn${A?" active":""}`,onClick:()=>H(u=>!u),"aria-label":x("wall.filter.find"),children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 473.514 473.514",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"}),e.jsx("path",{d:"M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"})]})}),e.jsx("button",{className:"center-btn-mobile",id:"gods-center-btn-mobile","aria-label":x("wall.filter.center"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 503.168 503.168",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"})})}),e.jsx("button",{className:`filter-btn${T?" active":""}`,onClick:()=>B(u=>!u),"aria-label":T?x("nav.wall"):"DOGYPT",children:T?e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 439.164 439.165",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M182.466,29.83c0.213-4.174-0.726-7.751-2.79-10.633c-3.199-6.282-8.623-9.76-15.485-10.138 C117.546,6.519,70.951,6.306,23.348,6.295c-5.264,0-9.704,1.856-12.845,5.368l-0.655,0.531 c-7.503,4.253-11.05,11.745-9.473,20.027c6.832,35.975,10.123,73.902,10.361,119.363c0.01,1.65,0.256,3.298,0.774,5.185 l0.089,0.525c0.546,8.465,6.147,17.311,17.42,17.976c49.478,2.917,94.039,5.756,138.377,11.07 c3.479,0.417,6.485-0.066,9.153-1.419l0.541-0.203c3.727-0.93,12.256-4.372,10.907-16.234 C182.182,117.115,180.366,71.769,182.466,29.83z M146.603,147.852c-34.827-3.608-68.829-5.88-97.497-7.622l-2.392-0.147 l-0.051-2.392c-0.688-32.479-3.156-62.606-7.556-92.1l-0.442-2.991l3.021,0.005c41.053,0.083,72.366,0.64,101.537,1.82l2.56,0.104 l-0.063,2.559c-0.744,31.052,0.48,63.089,3.74,97.939l0.294,3.15L146.603,147.852z"}),e.jsx("path",{d:"M182.466,276.21c0.213-4.174-0.726-7.754-2.79-10.634c-3.199-6.286-8.623-9.77-15.485-10.135 c-46.68-2.539-93.26-2.753-140.848-2.763c-5.263,0-9.704,1.854-12.845,5.362l-0.655,0.528c-7.503,4.26-11.05,11.75-9.476,20.042 c6.835,35.968,10.125,73.896,10.364,119.358c0.01,1.646,0.254,3.29,0.774,5.18l0.089,0.522c0.546,8.476,6.146,17.316,17.42,17.977 c49.477,2.92,94.039,5.764,138.377,11.075c3.484,0.416,6.49-0.071,9.153-1.422l0.541-0.198c3.727-0.93,12.255-4.372,10.907-16.234 C182.182,363.491,180.366,318.144,182.466,276.21z M146.603,394.233c-34.776-3.605-68.799-5.881-97.497-7.627l-2.392-0.152 l-0.051-2.387c-0.688-32.479-3.156-62.602-7.556-92.095l-0.442-2.99l3.021,0.005c41.058,0.081,72.376,0.64,101.537,1.817 l2.56,0.112l-0.063,2.549c-0.744,31.062,0.48,63.099,3.74,97.944l0.294,3.153L146.603,394.233z"}),e.jsx("path",{d:"M433.483,29.83c0.208-4.174-0.731-7.751-2.793-10.633c-3.199-6.282-8.623-9.76-15.488-10.138 c-46.641-2.539-93.236-2.752-140.843-2.763c-5.261,0-9.704,1.856-12.842,5.368l-0.655,0.531 c-7.506,4.253-11.045,11.745-9.471,20.027c6.83,35.975,10.126,73.902,10.364,119.363c0.011,1.65,0.254,3.298,0.771,5.185 l0.092,0.525c0.543,8.465,6.145,17.311,17.417,17.976c49.48,2.917,94.039,5.756,138.381,11.07 c3.483,0.411,6.484-0.066,9.155-1.419l0.543-0.203c3.728-0.93,12.248-4.372,10.907-16.234 C433.193,117.1,431.381,71.75,433.483,29.83z M397.612,147.852c-34.83-3.608-68.832-5.88-97.497-7.622l-2.392-0.147l-0.051-2.392 c-0.686-32.479-3.159-62.606-7.557-92.1l-0.441-2.991l3.021,0.005c41.05,0.083,72.366,0.64,101.534,1.82l2.559,0.104l-0.061,2.559 c-0.746,31.052,0.478,63.089,3.737,97.939l0.295,3.15L397.612,147.852z"}),e.jsx("path",{d:"M433.483,276.21c0.208-4.174-0.731-7.754-2.793-10.634c-3.199-6.286-8.623-9.77-15.488-10.135 c-46.677-2.539-93.257-2.753-140.848-2.763c-5.261,0-9.704,1.854-12.842,5.362l-0.655,0.528 c-7.506,4.26-11.045,11.75-9.471,20.037c6.83,35.973,10.126,73.905,10.364,119.363c0.01,1.646,0.254,3.29,0.771,5.18l0.092,0.522 c0.543,8.476,6.145,17.316,17.417,17.977c49.48,2.92,94.039,5.764,138.38,11.075c3.489,0.416,6.49-0.071,9.156-1.422l0.543-0.198 c3.728-0.93,12.248-4.372,10.907-16.234C433.193,363.481,431.381,318.124,433.483,276.21z M397.612,394.233 c-34.779-3.605-68.802-5.881-97.497-7.627l-2.392-0.152l-0.051-2.387c-0.686-32.479-3.159-62.602-7.557-92.095l-0.441-2.99 l3.021,0.005c41.061,0.081,72.376,0.64,101.534,1.817l2.559,0.112l-0.061,2.549c-0.746,31.062,0.478,63.099,3.737,97.944 l0.295,3.153L397.612,394.233z"})]}):e.jsxs("svg",{width:"21",height:"21",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[e.jsx("circle",{cx:"12",cy:"12",r:"9.5"}),e.jsx("line",{x1:"12",y1:"2.5",x2:"12",y2:"21.5"}),e.jsx("line",{x1:"2.5",y1:"12",x2:"21.5",y2:"12"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"9.5"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9.5",ry:"4"})]})}),e.jsx("div",{className:"lang-btn-mobile",children:e.jsx(za,{variant:"flow"})}),s?e.jsx("a",{className:"gbb-cta",href:c,children:s}):null]})}),y??document.body):e.jsxs("div",{className:`gods-bottom-bar${n?" has-cta":""}`,children:[e.jsx("button",{className:`filter-btn${A?" active":""}`,onClick:()=>H(u=>!u),"aria-label":x("wall.filter.find"),children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 473.514 473.514",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"}),e.jsx("path",{d:"M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"})]})}),e.jsx("button",{className:"center-btn-mobile",id:"gods-center-btn-mobile","aria-label":x("wall.filter.center"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 503.168 503.168",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"})})}),e.jsx("button",{className:`filter-btn${T?" active":""}`,onClick:()=>B(u=>!u),"aria-label":T?x("nav.wall"):"DOGYPT",children:T?e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 439.164 439.165",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M182.466,29.83c0.213-4.174-0.726-7.751-2.79-10.633c-3.199-6.282-8.623-9.76-15.485-10.138 C117.546,6.519,70.951,6.306,23.348,6.295c-5.264,0-9.704,1.856-12.845,5.368l-0.655,0.531 c-7.503,4.253-11.05,11.745-9.473,20.027c6.832,35.975,10.123,73.902,10.361,119.363c0.01,1.65,0.256,3.298,0.774,5.185 l0.089,0.525c0.546,8.465,6.147,17.311,17.42,17.976c49.478,2.917,94.039,5.756,138.377,11.07 c3.479,0.417,6.485-0.066,9.153-1.419l0.541-0.203c3.727-0.93,12.256-4.372,10.907-16.234 C182.182,117.115,180.366,71.769,182.466,29.83z M146.603,147.852c-34.827-3.608-68.829-5.88-97.497-7.622l-2.392-0.147 l-0.051-2.392c-0.688-32.479-3.156-62.606-7.556-92.1l-0.442-2.991l3.021,0.005c41.053,0.083,72.366,0.64,101.537,1.82l2.56,0.104 l-0.063,2.559c-0.744,31.052,0.48,63.089,3.74,97.939l0.294,3.15L146.603,147.852z"}),e.jsx("path",{d:"M182.466,276.21c0.213-4.174-0.726-7.754-2.79-10.634c-3.199-6.286-8.623-9.77-15.485-10.135 c-46.68-2.539-93.26-2.753-140.848-2.763c-5.263,0-9.704,1.854-12.845,5.362l-0.655,0.528c-7.503,4.26-11.05,11.75-9.476,20.042 c6.835,35.968,10.125,73.896,10.364,119.358c0.01,1.646,0.254,3.29,0.774,5.18l0.089,0.522c0.546,8.476,6.146,17.316,17.42,17.977 c49.477,2.92,94.039,5.764,138.377,11.075c3.484,0.416,6.49-0.071,9.153-1.422l0.541-0.198c3.727-0.93,12.255-4.372,10.907-16.234 C182.182,363.491,180.366,318.144,182.466,276.21z M146.603,394.233c-34.776-3.605-68.799-5.881-97.497-7.627l-2.392-0.152 l-0.051-2.387c-0.688-32.479-3.156-62.602-7.556-92.095l-0.442-2.99l3.021,0.005c41.058,0.081,72.376,0.64,101.537,1.817 l2.56,0.112l-0.063,2.549c-0.744,31.062,0.48,63.099,3.74,97.944l0.294,3.153L146.603,394.233z"}),e.jsx("path",{d:"M433.483,29.83c0.208-4.174-0.731-7.751-2.793-10.633c-3.199-6.282-8.623-9.76-15.488-10.138 c-46.641-2.539-93.236-2.752-140.843-2.763c-5.261,0-9.704,1.856-12.842,5.368l-0.655,0.531 c-7.506,4.253-11.045,11.745-9.471,20.027c6.83,35.975,10.126,73.902,10.364,119.363c0.011,1.65,0.254,3.298,0.771,5.185 l0.092,0.525c0.543,8.465,6.145,17.311,17.417,17.976c49.48,2.917,94.039,5.756,138.381,11.07 c3.483,0.411,6.484-0.066,9.155-1.419l0.543-0.203c3.728-0.93,12.248-4.372,10.907-16.234 C433.193,117.1,431.381,71.75,433.483,29.83z M397.612,147.852c-34.83-3.608-68.832-5.88-97.497-7.622l-2.392-0.147l-0.051-2.392 c-0.686-32.479-3.159-62.606-7.557-92.1l-0.441-2.991l3.021,0.005c41.05,0.083,72.366,0.64,101.534,1.82l2.559,0.104l-0.061,2.559 c-0.746,31.052,0.478,63.089,3.737,97.939l0.295,3.15L397.612,147.852z"}),e.jsx("path",{d:"M433.483,276.21c0.208-4.174-0.731-7.754-2.793-10.634c-3.199-6.286-8.623-9.77-15.488-10.135 c-46.677-2.539-93.257-2.753-140.848-2.763c-5.261,0-9.704,1.854-12.842,5.362l-0.655,0.528 c-7.506,4.26-11.045,11.75-9.471,20.037c6.83,35.973,10.126,73.905,10.364,119.363c0.01,1.646,0.254,3.29,0.771,5.18l0.092,0.522 c0.543,8.476,6.145,17.316,17.417,17.977c49.48,2.92,94.039,5.764,138.38,11.075c3.489,0.416,6.49-0.071,9.156-1.422l0.543-0.198 c3.728-0.93,12.248-4.372,10.907-16.234C433.193,363.481,431.381,318.124,433.483,276.21z M397.612,394.233 c-34.779-3.605-68.802-5.881-97.497-7.627l-2.392-0.152l-0.051-2.387c-0.686-32.479-3.159-62.602-7.557-92.095l-0.441-2.99 l3.021,0.005c41.061,0.081,72.376,0.64,101.534,1.817l2.559,0.112l-0.061,2.549c-0.746,31.062,0.478,63.099,3.737,97.944 l0.295,3.153L397.612,394.233z"})]}):e.jsxs("svg",{width:"21",height:"21",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[e.jsx("circle",{cx:"12",cy:"12",r:"9.5"}),e.jsx("line",{x1:"12",y1:"2.5",x2:"12",y2:"21.5"}),e.jsx("line",{x1:"2.5",y1:"12",x2:"21.5",y2:"12"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"9.5"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9.5",ry:"4"})]})}),e.jsx("div",{className:"lang-btn-mobile",children:e.jsx(za,{variant:"flow"})}),s?e.jsx("a",{className:"gbb-cta",href:c,children:s}):null]}),e.jsx(yi,{dogs:ne,open:T,paused:f,onClose:()=>B(!1),pick:Me}),q&&Ct.createPortal(e.jsxs("div",{className:"dc-wall",children:[e.jsx("style",{children:Uo+Mi}),e.jsx("div",{className:"dc-veil","aria-hidden":"true"}),e.jsxs("div",{ref:ve,className:"pp-panel pp-svetla dc-panel",role:"dialog","aria-label":q.name,onTouchStart:u=>{const S=u.touches[0];Ie.current={x:S.clientX,y:S.clientY}},onTouchEnd:u=>{var V;const S=Ie.current;Ie.current=null;const M=u.changedTouches[0];if(!S||!M)return;const G=M.clientX-S.x,W=M.clientY-S.y;Math.abs(G)>60&&Math.abs(G)>Math.abs(W)*1.4?(V=ye.current)==null||V.call(ye,G<0?1:-1):W>70&&Math.abs(W)>Math.abs(G)&&he(null)},children:[e.jsx("span",{className:"dc-grip","aria-hidden":"true"}),e.jsx(Ko,{dog:q,where:"wall",edgeBase:eo,anonKey:Qa})]},q.key)]}),document.body),Ct.createPortal(e.jsx("div",{className:`numpad-overlay${A?" open":""}${T?" numpad-overlay--planet":""}`,onClick:u=>{u.target===u.currentTarget&&(H(!1),ae(""))},children:e.jsx("div",{className:`numpad numpad--wide${ca(K)?" numpad--typing":""}`,role:"dialog","aria-label":x("wall.filter.find"),children:e.jsxs("div",{className:"numpad-body",children:[e.jsxs("div",{className:"numpad-search",children:[e.jsx("input",{ref:ut,className:"numpad-display numpad-input",value:K,onChange:u=>ae(u.target.value.slice(0,40)),placeholder:x("wall.filter.placeholderName"),"aria-label":x("wall.filter.find"),enterKeyHint:"search",autoComplete:"off",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1}),e.jsxs("div",{className:"numpad-grid",children:[["1","2","3","4","5","6","7","8","9"].map(u=>e.jsx("button",{className:"numpad-key",onClick:()=>ae(S=>(S+u).slice(0,6)),children:u},u)),e.jsx("button",{className:"numpad-key numpad-key--cancel",onClick:()=>ae(""),"aria-label":x("wall.filter.clear"),children:e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M7 5 H14.5 L20.5 12 L14.5 19 H7 A2 2 0 0 1 5 17 V7 A2 2 0 0 1 7 5 Z"}),e.jsx("path",{d:"M8.4 9.4 L12.6 14.6 M12.6 9.4 L8.4 14.6"})]})}),e.jsx("button",{className:"numpad-key",onClick:()=>ae(u=>(u+"0").slice(0,6)),children:"0"}),e.jsx("button",{className:"numpad-key numpad-key--enter",onClick:gt,"aria-label":x("wall.filter.confirm"),children:e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M8 12.5 L11 15.5 L16.5 9"})]})})]})]}),ca(K)?e.jsxs("div",{className:"numpad-countries numpad-results",children:[e.jsx("div",{className:"numpad-countries-title",children:x("wall.search.found")}),e.jsx(Wn,{hits:io(Ue,K),onGo:rt,edgeBase:eo,anonKey:Qa})]}):e.jsxs("div",{className:"numpad-countries",children:[e.jsx("div",{className:"numpad-countries-title",children:x("wall.filter.countries")}),e.jsx("div",{className:"numpad-countries-list",children:Ye.map(u=>e.jsxs("div",{className:"ncountry-row",children:[e.jsx("span",{className:"ncountry-flag",children:jn(u.iso2)}),e.jsx("span",{className:"ncountry-code",children:u.iso3}),e.jsx("span",{className:"ncountry-count",children:u.count})]},u.iso2))})]})]})})}),document.body),e.jsx("div",{ref:F,role:"application",className:P.active&&a<4?`rev-wall${ue?" rev-zoom":""}`:void 0,style:{position:"fixed",inset:0,overflow:"hidden",transform:ue?`scale(${Oe})`:void 0},children:e.jsx("div",{ref:j,id:"gods-canvas"})}),P.active&&a>0&&a<4&&Ct.createPortal(e.jsxs("div",{className:`rev-overlay step-${a} ph-${me}`,children:[P.photoUrl&&e.jsx("div",{className:"rev-bgphoto",style:{backgroundImage:`url("${jt(P.photoUrl)}")`}}),e.jsx("div",{className:"rev-glow"}),e.jsx("img",{className:`rev-big-symbol${at?"":" is-h"}`,src:at?P.heroglyphVUrl:d,alt:P.dogName})]}),document.body),v&&e.jsx("div",{className:"wn-root",children:e.jsx("div",{className:"wn-backdrop",onClick:u=>{u.target===u.currentTarget&&_(!1)},children:e.jsxs("div",{className:"wn-card",role:"dialog","aria-label":x("whatNext.title"),children:[e.jsx("button",{className:"wn-close","aria-label":x("whatNext.close"),onClick:()=>_(!1),children:"×"}),e.jsx("div",{className:"wn-stamp",children:x("whatNext.stamp")}),e.jsxs("div",{className:"wn-main",children:[e.jsxs("div",{className:"wn-head-row",children:[e.jsx("h1",{children:x("whatNext.title")}),e.jsxs("span",{className:"wn-counter",children:[e.jsx("span",{className:"wn-cur",children:"1"}),"/5"]})]}),e.jsx("div",{className:"wn-divider"}),e.jsxs("div",{className:"wn-slider",children:[e.jsx("button",{className:"wn-arrow wn-prev","aria-label":x("whatNext.prev"),children:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M15 18l-6-6 6-6"})})}),e.jsx("button",{className:"wn-arrow wn-next","aria-label":x("whatNext.next"),children:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M9 18l6-6-6-6"})})}),e.jsxs("div",{className:"wn-track",children:[e.jsxs("div",{className:"wn-slide wn-in",children:[e.jsx("span",{className:"wn-ic wn-ic-paw"}),e.jsx("h2",{children:x("whatNext.s1.title")}),e.jsx("p",{className:"wn-ital",children:x("whatNext.s1.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:x("whatNext.s1.body")}})]}),e.jsxs("div",{className:"wn-slide",children:[e.jsx("span",{className:"wn-ic wn-ic-sphinx"}),e.jsx("h2",{children:x("whatNext.s2.title")}),e.jsx("p",{className:"wn-ital",children:x("whatNext.s2.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:x("whatNext.s2.body")}})]}),e.jsxs("div",{className:"wn-slide",children:[e.jsx("span",{className:"wn-ic wn-ic-people"}),e.jsx("h2",{children:x("whatNext.s3.title")}),e.jsx("p",{className:"wn-ital",children:x("whatNext.s3.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:x("whatNext.s3.body")}})]}),e.jsxs("div",{className:"wn-slide",children:[e.jsx("span",{className:"wn-ic wn-ic-chat"}),e.jsx("h2",{children:x("whatNext.s4.title")}),e.jsx("p",{className:"wn-ital",children:x("whatNext.s4.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:x("whatNext.s4.body")}})]}),e.jsxs("div",{className:"wn-slide wn-slide-share",children:[e.jsx("h2",{children:x("sharecard.shareTitle",{name:P.dogName})}),L?e.jsxs(e.Fragment,{children:[e.jsx("img",{className:"wn-share-preview",src:L,alt:x("sharecard.shareTitle",{name:P.dogName})}),e.jsxs("div",{className:"wn-share-actions",children:[e.jsxs("button",{type:"button",className:"wn-cta wn-cta-share",onClick:yt,disabled:z!==null,children:[e.jsx(sa,{name:"link",size:13,tint:"dark"}),x("sharecard.shareButton")]}),e.jsxs("button",{type:"button",className:"wn-cta wn-cta-outline",onClick:en,disabled:z!==null,children:[e.jsx(sa,{name:"document",size:13,tint:"gold"}),x("sharecard.download")]})]}),e.jsxs("div",{className:"wn-share-links",children:[e.jsx("button",{type:"button",className:"wn-share-link-btn",onClick:Rt,"aria-label":x("sharecard.facebook"),title:x("sharecard.facebook"),children:e.jsx("svg",{viewBox:"0 0 24 24",width:"15",height:"15",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.6c0-.93.26-1.56 1.59-1.56h1.7V3.18C15.98 3.12 15.06 3 13.98 3c-2.24 0-3.78 1.37-3.78 3.88v2.72H7.44v3.2h2.76V21h3.3z"})})}),e.jsx("button",{type:"button",className:"wn-share-link-btn",onClick:Xo,"aria-label":x("sharecard.whatsapp"),title:x("sharecard.whatsapp"),children:e.jsxs("svg",{viewBox:"0 0 24 24",width:"15",height:"15",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"}),e.jsx("path",{d:"M12.02 2C6.5 2 2.04 6.46 2.04 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.54 22 12S17.53 2 12.02 2zm0 18.1c-1.63 0-3.15-.45-4.45-1.23l-.32-.19-3.02.79.8-2.94-.21-.3A8.09 8.09 0 0 1 3.93 12c0-4.47 3.63-8.1 8.09-8.1 4.46 0 8.08 3.63 8.08 8.1 0 4.47-3.62 8.1-8.08 8.1z"})]})}),e.jsx("button",{type:"button",className:"wn-share-link-btn",onClick:Qo,"aria-label":x("sharecard.copyLink"),title:x("sharecard.copyLink"),children:e.jsx(sa,{name:"link",size:14,tint:"gold"})})]})]}):e.jsx("p",{className:"wn-lead wn-share-preparing",children:x("sharecard.preparing")})]})]})]})]}),e.jsxs("div",{className:"wn-footer",children:[e.jsx("img",{className:"wn-seal",src:"/images/peciat-dogypt.webp",alt:"DOGYPT seal"}),e.jsx("span",{className:"wn-motto-side",children:x("whatNext.motto")})]})]})})})]})]})}const Mi=`
.dc-panel {
  position: fixed;
  z-index: 120;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: clamp(340px, 30vw, 440px);
  max-height: calc(100dvh - 208px);
  overflow-y: auto;
  padding: 32px 24px 24px;
  gap: 12px;
  animation: dcSideIn 420ms cubic-bezier(.22,.9,.28,1) both;
}
@keyframes dcSideIn { from { transform: translate(calc(100% + 48px), -50%); opacity: 0; } to { transform: translateY(-50%); opacity: 1; } }
.dc-panel .pp-photo { width: 112px; height: 112px; }
.dc-panel .pp-glyph { width: 70%; max-width: 240px; }
.dc-panel .pp-msg { font-size: 0.82rem; -webkit-line-clamp: 8; }
.dc-grip, .dc-veil { display: none; }
/* !important: Hektorova karta nesie vlastnú zlatú žiaru, ktorá by prstenec prebila. */
.dog-card.is-picked {
  box-shadow: 0 0 0 3px ${Y.edge}, 0 0 0 8px rgba(22,48,122,0.22) !important;
  z-index: 7;
}
@media (max-width: 767px) {
  .dc-veil {
    display: block; position: fixed; inset: 0; z-index: 119;
    background: rgba(42,22,8,0.28); pointer-events: none;
    animation: dcFade 260ms ease both;
  }
  .dc-panel {
    left: 0; right: 0; bottom: 0; top: auto;
    width: auto; transform: none;
    max-height: 80dvh;
    border-radius: 16px 16px 0 0;
    border-bottom: 0;
    padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
    gap: 8px;
    animation: dcSheetUp 360ms cubic-bezier(.22,.9,.28,1) both;
  }
  .dc-grip {
    display: block; flex-shrink: 0;
    width: 40px; height: 4px; border-radius: 999px;
    background: rgba(110,78,24,0.4);
    margin-bottom: 4px;
  }
  .dc-panel .pp-photo { width: 88px; height: 88px; }
  .dc-panel .pp-name { font-size: 1.35rem; }
  .dc-panel .pp-glyph { width: 70%; max-width: 200px; }
  .dc-panel .pp-msg { font-size: 0.75rem; line-height: 1.5; -webkit-line-clamp: 6; }
}
@keyframes dcSheetUp { from { transform: translateY(100%); } to { transform: none; } }
@keyframes dcFade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .dc-panel, .dc-veil { animation: none; } }
`,qo=[{key:"nav.wall",to:"/wall-lab"},{key:"nav.vision",to:"/vision-lab"},{key:"nav.religion",to:"/religion-lab"},{key:"nav.about",to:"/about-lab"}],Tt=[{code:"en",flag:"🇺🇸",label:"ENG",native:"English",enabled:!0},{code:"esp",flag:"🇪🇸",label:"ESP",native:"Español",enabled:!0},{code:"prt",flag:"🇵🇹",label:"PRT",native:"Português",enabled:!0},{code:"chn",flag:"🇨🇳",label:"CHN",native:"中文",enabled:!0},{code:"jpn",flag:"🇯🇵",label:"JPN",native:"日本語",enabled:!0},{code:"ind",flag:"🇮🇳",label:"IND",native:"हिन्दी",enabled:!0},{code:"ara",flag:"🇸🇦",label:"ARA",native:"العربية",enabled:!0},{code:"rus",flag:"🇷🇺",label:"RUS",native:"Русский",enabled:!0},{code:"kor",flag:"🇰🇷",label:"KOR",native:"한국어",enabled:!0},{code:"sk",flag:"🇸🇰",label:"SVK",native:"Slovenčina",enabled:!0},{code:"cs",flag:"🇨🇿",label:"CZE",native:"Čeština",enabled:!0},{code:"deu",flag:"🇩🇪",label:"DEU",native:"Deutsch",enabled:!0},{code:"nld",flag:"🇳🇱",label:"NLD",native:"Nederlands",enabled:!0},{code:"fra",flag:"🇫🇷",label:"FRA",native:"Français",enabled:!0},{code:"ita",flag:"🇮🇹",label:"ITA",native:"Italiano",enabled:!0},{code:"pol",flag:"🇵🇱",label:"POL",native:"Polski",enabled:!0},{code:"ukr",flag:"🇺🇦",label:"UKR",native:"Українська",enabled:!0},{code:"tur",flag:"🇹🇷",label:"TUR",native:"Türkçe",enabled:!0}];function Oi(){const[o,n]=r.useState(()=>typeof window<"u"&&window.matchMedia("(max-width: 767px)").matches);return r.useEffect(()=>{const s=window.matchMedia("(max-width: 767px)"),c=p=>n(p.matches);return s.addEventListener("change",c),()=>s.removeEventListener("change",c)},[]),o}function _i(){return Oi()?e.jsx(Di,{}):e.jsx(Ii,{})}function Ii(){const{pathname:o}=Mo(),{lang:n,setLang:s}=Dt(),c=_e(),[p,l]=r.useState(!1);r.useEffect(()=>{if(!p)return;const m=y=>{y.key==="Escape"&&l(!1)};return document.addEventListener("keydown",m),()=>document.removeEventListener("keydown",m)},[p]),Bo(p);const f=Tt.find(m=>m.code===n)??Tt[0];return e.jsxs("nav",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:14,padding:"10px 0 6px",position:"relative",zIndex:50},children:[qo.map(({key:m,to:y})=>{const N=y==="/wall-lab"?o==="/wall-lab":o===y;return e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:14},children:[e.jsx(vt,{to:y,style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:"clamp(10px, 1.5vw, 0.78rem)",letterSpacing:"0.15em",textTransform:"uppercase",color:N?"#C99A3F":"rgba(110,71,16,0.62)",textDecoration:"none",borderBottom:N?"1px solid #C99A3F":"1px solid transparent",paddingBottom:2,transition:"color 0.2s, opacity 0.2s",whiteSpace:"nowrap"},children:c(m)}),e.jsx("span",{"aria-hidden":!0,style:{display:"inline-block",width:1,height:12,background:"rgba(201,154,63,0.38)"}})]},y)}),e.jsx("button",{type:"button",onClick:()=>l(!0),"aria-haspopup":"dialog","aria-label":`Change language (current: ${f.label})`,style:{display:"inline-flex",alignItems:"center",padding:"2px 4px",background:"transparent",border:"none",cursor:"pointer",fontSize:"clamp(15px, 1.6vw, 18px)",lineHeight:1},children:e.jsx("span",{children:f.flag})}),p&&Ct.createPortal(e.jsx(Bi,{currentCode:n,onSelect:m=>{s(m),l(!1)},onClose:()=>l(!1)}),document.body)]})}function Di(){const[o,n]=r.useState(!1),{lang:s,setLang:c}=Dt(),p=_e();return r.useEffect(()=>{if(!o)return;const l=f=>{f.key==="Escape"&&n(!1)};return document.addEventListener("keydown",l),()=>document.removeEventListener("keydown",l)},[o]),Bo(o),e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",onClick:()=>n(!0),"aria-label":p("nav.aria.openMenu"),"aria-haspopup":"dialog","aria-expanded":o,style:{background:"transparent",border:"none",padding:"6px 18px 4px",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"},children:[e.jsx("style",{children:`
          @keyframes chevronPulse {
            0%, 100% {
              filter: drop-shadow(0 0 0 rgba(201, 154, 63, 0));
              opacity: 0.88;
              transform: translateY(0);
            }
            50% {
              filter: drop-shadow(0 0 6px rgba(201, 154, 63, 0.60));
              opacity: 1;
              transform: translateY(2px);
            }
          }
          .chevron-svg {
            display: block;
            animation: chevronPulse 2.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .chevron-svg { animation: none; opacity: 1; transform: none; }
          }
        `}),e.jsx("svg",{width:"28",height:"16",viewBox:"0 0 28 16",fill:"none","aria-hidden":!0,className:"chevron-svg",children:e.jsx("path",{d:"M4 4 L14 12.5 L24 4",stroke:"#8a5a14",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})})]}),o&&Ct.createPortal(e.jsx(Ri,{currentLang:s,onSelectLang:l=>c(l),onClose:()=>n(!1)}),document.body)]})}function Ri({currentLang:o,onSelectLang:n,onClose:s}){const{pathname:c}=Mo(),[p,l]=r.useState(!1),f=_e(),m=Tt.find(y=>y.code===o)??Tt[0];return e.jsxs("div",{role:"dialog","aria-modal":"true","aria-label":f("nav.aria.menu"),onClick:s,style:{position:"fixed",inset:0,background:"linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)",zIndex:300,display:"flex",flexDirection:"column",animation:"mobileMenuSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1)",overflowY:"auto"},children:[e.jsx("style",{children:`
        @keyframes mobileMenuSlide {
          from { transform: translateY(-100%); }
          to   { transform: translateY(0); }
        }
        @keyframes mobileMenuFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}),e.jsx("div",{"aria-hidden":!0,style:{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(201,154,63,0.10) 62%, rgba(138,90,20,0.20) 100%)",pointerEvents:"none"}}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:p?"flex-start":"center",gap:p?10:24,padding:p?"12px 24px 16px":"60px 24px 40px",position:"relative",zIndex:1,animation:"mobileMenuFade 0.38s ease-out 0.08s both",transition:"gap 0.32s ease, padding 0.32s ease, justify-content 0.32s ease"},children:[e.jsx(vt,{to:"/",onClick:s,"aria-label":f("nav.aria.wallHome"),style:{display:"inline-flex",transition:"transform 0.32s ease, margin 0.32s ease",transform:p?"scale(0.36)":"scale(1)",transformOrigin:"top center",marginBottom:p?-68:4},children:e.jsx("div",{style:{width:138,height:138,borderRadius:999,border:"2px solid rgba(201,154,63,0.70)",background:"#000",boxShadow:"0 0 44px rgba(201,154,63,0.42), inset 0 0 0 3px rgba(0,0,0,0.6)",display:"inline-flex",alignItems:"center",justifyContent:"center",overflow:"hidden"},children:e.jsx("img",{src:Dn,alt:"DOGYPT",style:{width:"100%",height:"100%",objectFit:"contain"}})})}),qo.map(({key:y,to:N})=>{const O=N==="/"?c==="/"||c==="/grid"||c==="/gods"||c==="/wall":c===N;return e.jsx(vt,{to:N,onClick:s,style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:p?14:22,letterSpacing:"0.18em",textTransform:"uppercase",color:O?"#C99A3F":"rgba(58,34,4,0.80)",textDecoration:"none",borderBottom:O?"1.5px solid #C99A3F":"1.5px solid transparent",paddingBottom:3,WebkitTapHighlightColor:"transparent",transition:"font-size 0.32s ease"},children:f(y)},N)}),e.jsxs("div",{onClick:y=>y.stopPropagation(),style:{marginTop:p?6:18,display:"flex",flexDirection:"column",alignItems:"center",gap:10,width:"100%",maxWidth:280,flex:p?"1 1 auto":"0 0 auto",minHeight:0,transition:"margin 0.32s ease"},children:[e.jsxs("button",{type:"button",onClick:()=>l(y=>!y),"aria-haspopup":"listbox","aria-expanded":p,style:{display:"inline-flex",alignItems:"center",gap:10,padding:"10px 18px",background:"rgba(201,154,63,0.12)",border:"1px solid rgba(201,154,63,0.55)",borderRadius:999,cursor:"pointer",color:"#2a1608",fontFamily:"'Cinzel', serif",fontWeight:600,fontSize:12,letterSpacing:"0.12em",textTransform:"uppercase"},children:[e.jsx("span",{style:{fontSize:18,lineHeight:1},children:m.flag}),e.jsx("span",{children:m.label}),e.jsx("svg",{width:"10",height:"6",viewBox:"0 0 10 6",fill:"none","aria-hidden":!0,style:{transform:p?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"},children:e.jsx("path",{d:"M1 1 L5 5 L9 1",stroke:"#C99A3F",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]}),p&&e.jsx("div",{role:"listbox",style:{width:"100%",flex:"1 1 auto",minHeight:0,overflow:"hidden",display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gridTemplateRows:"repeat(9, 1fr)",gridAutoFlow:"column",gap:6,padding:8,background:"rgba(201,154,63,0.08)",border:"1px solid rgba(201,154,63,0.30)",borderRadius:10,animation:"mobileMenuFade 0.2s ease-out"},children:Tt.map(y=>{const N=y.code===o;return e.jsxs("button",{type:"button",role:"option","aria-selected":N,"aria-disabled":!y.enabled,onClick:()=>{y.enabled&&(n(y.code),l(!1))},style:{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 9px",background:N?"rgba(201,154,63,0.30)":"transparent",border:N?"1px solid #C99A3F":"1px solid rgba(201,154,63,0.25)",borderRadius:6,cursor:y.enabled?"pointer":"not-allowed",color:"#2a1608",opacity:y.enabled?1:.38},children:[e.jsx("span",{style:{fontSize:15,lineHeight:1},children:y.flag}),e.jsx("span",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:10,letterSpacing:"0.08em"},children:y.label})]},y.code)})})]})]})]})}function Bi({currentCode:o,onSelect:n,onClose:s}){const c=_e();return e.jsxs("div",{role:"dialog","aria-modal":"true","aria-label":c("nav.aria.chooseLanguage"),onClick:s,style:{position:"fixed",inset:0,background:"rgba(58,34,4,0.48)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"langModalBackdrop 0.18s ease-out"},children:[e.jsx("style",{children:`
        @keyframes langModalBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes langModalCard {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lang-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 8px;
          max-height: min(60vh, 440px);
          overflow-y: auto;
        }
        @media (max-width: 767px) {
          .lang-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}),e.jsxs("div",{onClick:p=>p.stopPropagation(),style:{width:"100%",maxWidth:520,padding:"20px 22px 24px",background:"linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)",border:"1.5px solid #C99A3F",borderRadius:14,boxShadow:"0 16px 56px rgba(0,0,0,0.7), 0 0 0 4px rgba(201,154,63,0.22)",animation:"langModalCard 0.22s ease-out"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12},children:[e.jsx("div",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:13,letterSpacing:"0.18em",textTransform:"uppercase",color:"#1a0a05"},children:c("nav.langModal.title")}),e.jsx("button",{type:"button",onClick:s,"aria-label":c("nav.aria.close"),style:{background:"transparent",border:"none",cursor:"pointer",fontSize:22,lineHeight:1,color:"#1a0a05",padding:0,width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:"×"})]}),e.jsx("div",{role:"listbox",className:"lang-grid",children:Tt.map(p=>{const l=p.code===o;return e.jsxs("button",{type:"button",role:"option","aria-selected":l,"aria-disabled":!p.enabled,onClick:()=>{p.enabled&&n(p.code)},style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 10px",background:l?"rgba(201,154,63,0.30)":"transparent",border:l?"1.5px solid #C99A3F":"1px solid rgba(201,154,63,0.30)",borderRadius:8,cursor:p.enabled?"pointer":"not-allowed",opacity:p.enabled?1:.42,transition:"background 0.15s, border-color 0.15s"},onMouseEnter:f=>{!l&&p.enabled&&(f.currentTarget.style.background="rgba(201,154,63,0.18)")},onMouseLeave:f=>{l||(f.currentTarget.style.background="transparent")},children:[e.jsx("span",{style:{fontSize:18,lineHeight:1},children:p.flag}),e.jsxs("span",{style:{display:"flex",flexDirection:"column",alignItems:"flex-start"},children:[e.jsx("span",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:11,letterSpacing:"0.10em",textTransform:"uppercase",color:"#1a0a05",lineHeight:1.2},children:p.label}),e.jsx("span",{style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:10,color:"#5c3e10",lineHeight:1.2},children:p.native})]})]},p.code)})})]})]})}function Zt({withNav:o=!1,onBack:n,backAriaLabel:s}){const c=_e(),p=s??c("nav.aria.back"),l=e.jsxs(e.Fragment,{children:[e.jsx("img",{src:In,alt:"DOGYPT",className:"h-10 object-contain md:hidden"}),e.jsx("img",{src:_n,alt:"DOGYPT",className:"hidden md:block md:h-12 object-contain"})]});return o?e.jsxs("div",{className:"flex-shrink-0 relative flex flex-col items-center justify-center gap-1 md:gap-0 px-5 md:px-0 pb-1 md:pb-2 pt-[15px] md:pt-[25px]",style:{zIndex:2},children:[e.jsx(vt,{to:"/wall-lab","aria-label":"WALL",className:"flex-shrink-0 md:mb-1",children:l}),e.jsx(_i,{})]}):e.jsxs("div",{className:"flex-shrink-0 flex items-center justify-center relative pt-[15px] pb-2 px-4 md:pt-[25px]",children:[n&&e.jsx("button",{type:"button",onClick:n,"aria-label":p,className:"absolute left-4 top-[15px] p-2 text-foreground/60 hover:text-foreground transition-colors",children:e.jsx(Rn,{className:"h-5 w-5"})}),l,e.jsx("div",{className:"absolute right-5 top-[12px] md:top-[20px]",children:e.jsx(za,{variant:"flow"})})]})}var Na={exports:{}};(function(o,n){(function(s,c){c(n)})(kn,function(s){class c{constructor(t,a){this.state={angle:0,area:[],position:{x:0,y:0},hardAngle:0,hardDrawingAngle:0},this.createdDensity=a,this.nowDrawingDensity=this.createdDensity,this.render=t}setDensity(t){this.createdDensity=t,this.nowDrawingDensity=t}setDrawingDensity(t){this.nowDrawingDensity=t}setPosition(t){this.state.position=t}setAngle(t){this.state.angle=t}setArea(t){this.state.area=t}setHardDrawingAngle(t){this.state.hardDrawingAngle=t}setHardAngle(t){this.state.hardAngle=t,this.state.hardDrawingAngle=t}setOrientation(t){this.orientation=t}getDrawingDensity(){return this.nowDrawingDensity}getDensity(){return this.createdDensity}getHardAngle(){return this.state.hardAngle}}class p extends c{constructor(t,a,i){super(t,i),this.image=null,this.isLoad=!1,this.loadingAngle=0,this.image=new Image,this.image.src=a}draw(t){const a=this.render.getContext(),i=this.render.convertToGlobal(this.state.position),d=this.render.getRect().pageWidth,h=this.render.getRect().height;a.save(),a.translate(i.x,i.y),a.beginPath();for(let b of this.state.area)b!==null&&(b=this.render.convertToGlobal(b),a.lineTo(b.x-i.x,b.y-i.y));a.rotate(this.state.angle),a.clip(),this.isLoad?a.drawImage(this.image,0,0,d,h):this.drawLoader(a,{x:0,y:0},d,h),a.restore()}simpleDraw(t){const a=this.render.getRect(),i=this.render.getContext(),d=a.pageWidth,h=a.height,b=t===1?a.left+a.pageWidth:a.left,w=a.top;this.isLoad?i.drawImage(this.image,b,w,d,h):this.drawLoader(i,{x:b,y:w},d,h)}drawLoader(t,a,i,d){t.beginPath(),t.strokeStyle="rgb(200, 200, 200)",t.fillStyle="rgb(255, 255, 255)",t.lineWidth=1,t.rect(a.x+1,a.y+1,i-1,d-1),t.stroke(),t.fill();const h={x:a.x+i/2,y:a.y+d/2};t.beginPath(),t.lineWidth=10,t.arc(h.x,h.y,20,this.loadingAngle,3*Math.PI/2+this.loadingAngle),t.stroke(),t.closePath(),this.loadingAngle+=.07,this.loadingAngle>=2*Math.PI&&(this.loadingAngle=0)}load(){this.isLoad||(this.image.onload=()=>{this.isLoad=!0})}newTemporaryCopy(){return this}getTemporaryCopy(){return this}hideTemporaryCopy(){}}class l{constructor(t,a){this.pages=[],this.currentPageIndex=0,this.currentSpreadIndex=0,this.landscapeSpread=[],this.portraitSpread=[],this.render=a,this.app=t,this.currentPageIndex=0,this.isShowCover=this.app.getSettings().showCover}destroy(){this.pages=[]}createSpread(){this.landscapeSpread=[],this.portraitSpread=[];for(let a=0;a<this.pages.length;a++)this.portraitSpread.push([a]);let t=0;this.isShowCover&&(this.pages[0].setDensity("hard"),this.landscapeSpread.push([t]),t++);for(let a=t;a<this.pages.length;a+=2)a<this.pages.length-1?this.landscapeSpread.push([a,a+1]):(this.landscapeSpread.push([a]),this.pages[a].setDensity("hard"))}getSpread(){return this.render.getOrientation()==="landscape"?this.landscapeSpread:this.portraitSpread}getSpreadIndexByPage(t){const a=this.getSpread();for(let i=0;i<a.length;i++)if(t===a[i][0]||t===a[i][1])return i;return null}getPageCount(){return this.pages.length}getPages(){return this.pages}getPage(t){if(t>=0&&t<this.pages.length)return this.pages[t];throw new Error("Invalid page number")}nextBy(t){const a=this.pages.indexOf(t);return a<this.pages.length-1?this.pages[a+1]:null}prevBy(t){const a=this.pages.indexOf(t);return a>0?this.pages[a-1]:null}getFlippingPage(t){const a=this.currentSpreadIndex;if(this.render.getOrientation()==="portrait")return t===0?this.pages[a].newTemporaryCopy():this.pages[a-1];{const i=t===0?this.getSpread()[a+1]:this.getSpread()[a-1];return i.length===1||t===0?this.pages[i[0]]:this.pages[i[1]]}}getBottomPage(t){const a=this.currentSpreadIndex;if(this.render.getOrientation()==="portrait")return t===0?this.pages[a+1]:this.pages[a-1];{const i=t===0?this.getSpread()[a+1]:this.getSpread()[a-1];return i.length===1?this.pages[i[0]]:t===0?this.pages[i[1]]:this.pages[i[0]]}}showNext(){this.currentSpreadIndex<this.getSpread().length&&(this.currentSpreadIndex++,this.showSpread())}showPrev(){this.currentSpreadIndex>0&&(this.currentSpreadIndex--,this.showSpread())}getCurrentPageIndex(){return this.currentPageIndex}show(t=null){if(t===null&&(t=this.currentPageIndex),t<0||t>=this.pages.length)return;const a=this.getSpreadIndexByPage(t);a!==null&&(this.currentSpreadIndex=a,this.showSpread())}getCurrentSpreadIndex(){return this.currentSpreadIndex}setCurrentSpreadIndex(t){if(!(t>=0&&t<this.getSpread().length))throw new Error("Invalid page");this.currentSpreadIndex=t}showSpread(){const t=this.getSpread()[this.currentSpreadIndex];t.length===2?(this.render.setLeftPage(this.pages[t[0]]),this.render.setRightPage(this.pages[t[1]])):this.render.getOrientation()==="landscape"&&t[0]===this.pages.length-1?(this.render.setLeftPage(this.pages[t[0]]),this.render.setRightPage(null)):(this.render.setLeftPage(null),this.render.setRightPage(this.pages[t[0]])),this.currentPageIndex=t[0],this.app.updatePageIndex(this.currentPageIndex)}}class f extends l{constructor(t,a,i){super(t,a),this.imagesHref=i}load(){for(const t of this.imagesHref){const a=new p(this.render,t,"soft");a.load(),this.pages.push(a)}this.createSpread()}}class m{static GetDistanceBetweenTwoPoint(t,a){return t===null||a===null?1/0:Math.sqrt(Math.pow(a.x-t.x,2)+Math.pow(a.y-t.y,2))}static GetSegmentLength(t){return m.GetDistanceBetweenTwoPoint(t[0],t[1])}static GetAngleBetweenTwoLine(t,a){const i=t[0].y-t[1].y,d=a[0].y-a[1].y,h=t[1].x-t[0].x,b=a[1].x-a[0].x;return Math.acos((i*d+h*b)/(Math.sqrt(i*i+h*h)*Math.sqrt(d*d+b*b)))}static PointInRect(t,a){return a===null?null:a.x>=t.left&&a.x<=t.width+t.left&&a.y>=t.top&&a.y<=t.top+t.height?a:null}static GetRotatedPoint(t,a,i){return{x:t.x*Math.cos(i)+t.y*Math.sin(i)+a.x,y:t.y*Math.cos(i)-t.x*Math.sin(i)+a.y}}static LimitPointToCircle(t,a,i){if(m.GetDistanceBetweenTwoPoint(t,i)<=a)return i;const d=t.x,h=t.y,b=i.x,w=i.y;let A=Math.sqrt(Math.pow(a,2)*Math.pow(d-b,2)/(Math.pow(d-b,2)+Math.pow(h-w,2)))+d;i.x<0&&(A*=-1);let H=(A-d)*(h-w)/(d-b)+h;return d-b+h===0&&(H=a),{x:A,y:H}}static GetIntersectBetweenTwoSegment(t,a,i){return m.PointInRect(t,m.GetIntersectBeetwenTwoLine(a,i))}static GetIntersectBeetwenTwoLine(t,a){const i=t[0].y-t[1].y,d=a[0].y-a[1].y,h=t[1].x-t[0].x,b=a[1].x-a[0].x,w=t[0].x*t[1].y-t[1].x*t[0].y,A=a[0].x*a[1].y-a[1].x*a[0].y,H=i*A-d*w,T=h*A-b*w,B=-(w*b-A*h)/(i*b-d*h),ne=-(i*A-d*w)/(i*b-d*h);if(isFinite(B)&&isFinite(ne))return{x:B,y:ne};if(Math.abs(H-T)<.1)throw new Error("Segment included");return null}static GetCordsFromTwoPoint(t,a){const i=Math.abs(t.x-a.x),d=Math.abs(t.y-a.y),h=Math.max(i,d),b=[t];function w(A,H,T,B,ne){return H>A?A+ne*(T/B):H<A?A-ne*(T/B):A}for(let A=1;A<=h;A+=1)b.push({x:w(t.x,a.x,i,h,A),y:w(t.y,a.y,d,h,A)});return b}}class y extends c{constructor(t,a,i){super(t,i),this.copiedElement=null,this.temporaryCopy=null,this.isLoad=!1,this.element=a,this.element.classList.add("stf__item"),this.element.classList.add("--"+i)}newTemporaryCopy(){return this.nowDrawingDensity==="hard"?this:(this.temporaryCopy===null&&(this.copiedElement=this.element.cloneNode(!0),this.element.parentElement.appendChild(this.copiedElement),this.temporaryCopy=new y(this.render,this.copiedElement,this.nowDrawingDensity)),this.getTemporaryCopy())}getTemporaryCopy(){return this.temporaryCopy}hideTemporaryCopy(){this.temporaryCopy!==null&&(this.copiedElement.remove(),this.copiedElement=null,this.temporaryCopy=null)}draw(t){const a=t||this.nowDrawingDensity,i=this.render.convertToGlobal(this.state.position),d=this.render.getRect().pageWidth,h=this.render.getRect().height;this.element.classList.remove("--simple");const b=`
            display: block;
            z-index: ${this.element.style.zIndex};
            left: 0;
            top: 0;
            width: ${d}px;
            height: ${h}px;
        `;a==="hard"?this.drawHard(b):this.drawSoft(i,b)}drawHard(t=""){const a=this.render.getRect().left+this.render.getRect().width/2,i=this.state.hardDrawingAngle,d=t+`
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                clip-path: none;
                -webkit-clip-path: none;
            `+(this.orientation===0?`transform-origin: ${this.render.getRect().pageWidth}px 0; 
                   transform: translate3d(0, 0, 0) rotateY(${i}deg);`:`transform-origin: 0 0; 
                   transform: translate3d(${a}px, 0, 0) rotateY(${i}deg);`);this.element.style.cssText=d}drawSoft(t,a=""){let i="polygon( ";for(const h of this.state.area)if(h!==null){let b=this.render.getDirection()===1?{x:-h.x+this.state.position.x,y:h.y-this.state.position.y}:{x:h.x-this.state.position.x,y:h.y-this.state.position.y};b=m.GetRotatedPoint(b,{x:0,y:0},this.state.angle),i+=b.x+"px "+b.y+"px, "}i=i.slice(0,-2),i+=")";const d=a+`transform-origin: 0 0; clip-path: ${i}; -webkit-clip-path: ${i};`+(this.render.isSafari()&&this.state.angle===0?`transform: translate(${t.x}px, ${t.y}px);`:`transform: translate3d(${t.x}px, ${t.y}px, 0) rotate(${this.state.angle}rad);`);this.element.style.cssText=d}simpleDraw(t){const a=this.render.getRect(),i=a.pageWidth,d=a.height,h=t===1?a.left+a.pageWidth:a.left,b=a.top;this.element.classList.add("--simple"),this.element.style.cssText=`
            position: absolute; 
            display: block; 
            height: ${d}px; 
            left: ${h}px; 
            top: ${b}px; 
            width: ${i}px; 
            z-index: ${this.render.getSettings().startZIndex+1};`}getElement(){return this.element}load(){this.isLoad=!0}setOrientation(t){super.setOrientation(t),this.element.classList.remove("--left","--right"),this.element.classList.add(t===1?"--right":"--left")}setDrawingDensity(t){this.element.classList.remove("--soft","--hard"),this.element.classList.add("--"+t),super.setDrawingDensity(t)}}class N extends l{constructor(t,a,i,d){super(t,a),this.element=i,this.pagesElement=d}load(){for(const t of this.pagesElement){const a=new y(this.render,t,t.dataset.density==="hard"?"hard":"soft");a.load(),this.pages.push(a)}this.createSpread()}}class O{constructor(t,a,i,d){this.direction=t,this.corner=a,this.topIntersectPoint=null,this.sideIntersectPoint=null,this.bottomIntersectPoint=null,this.pageWidth=parseInt(i,10),this.pageHeight=parseInt(d,10)}calc(t){try{return this.position=this.calcAngleAndPosition(t),this.calculateIntersectPoint(this.position),!0}catch{return!1}}getFlippingClipArea(){const t=[];let a=!1;return t.push(this.rect.topLeft),t.push(this.topIntersectPoint),this.sideIntersectPoint===null?a=!0:(t.push(this.sideIntersectPoint),this.bottomIntersectPoint===null&&(a=!1)),t.push(this.bottomIntersectPoint),(a||this.corner==="bottom")&&t.push(this.rect.bottomLeft),t}getBottomClipArea(){const t=[];return t.push(this.topIntersectPoint),this.corner==="top"?t.push({x:this.pageWidth,y:0}):(this.topIntersectPoint!==null&&t.push({x:this.pageWidth,y:0}),t.push({x:this.pageWidth,y:this.pageHeight})),this.sideIntersectPoint!==null?m.GetDistanceBetweenTwoPoint(this.sideIntersectPoint,this.topIntersectPoint)>=10&&t.push(this.sideIntersectPoint):this.corner==="top"&&t.push({x:this.pageWidth,y:this.pageHeight}),t.push(this.bottomIntersectPoint),t.push(this.topIntersectPoint),t}getAngle(){return this.direction===0?-this.angle:this.angle}getRect(){return this.rect}getPosition(){return this.position}getActiveCorner(){return this.direction===0?this.rect.topLeft:this.rect.topRight}getDirection(){return this.direction}getFlippingProgress(){return Math.abs((this.position.x-this.pageWidth)/(2*this.pageWidth)*100)}getCorner(){return this.corner}getBottomPagePosition(){return this.direction===1?{x:this.pageWidth,y:0}:{x:0,y:0}}getShadowStartPoint(){return this.corner==="top"?this.topIntersectPoint:this.sideIntersectPoint!==null?this.sideIntersectPoint:this.topIntersectPoint}getShadowAngle(){const t=m.GetAngleBetweenTwoLine(this.getSegmentToShadowLine(),[{x:0,y:0},{x:this.pageWidth,y:0}]);return this.direction===0?t:Math.PI-t}calcAngleAndPosition(t){let a=t;if(this.updateAngleAndGeometry(a),a=this.corner==="top"?this.checkPositionAtCenterLine(a,{x:0,y:0},{x:0,y:this.pageHeight}):this.checkPositionAtCenterLine(a,{x:0,y:this.pageHeight},{x:0,y:0}),Math.abs(a.x-this.pageWidth)<1&&Math.abs(a.y)<1)throw new Error("Point is too small");return a}updateAngleAndGeometry(t){this.angle=this.calculateAngle(t),this.rect=this.getPageRect(t)}calculateAngle(t){const a=this.pageWidth-t.x+1,i=this.corner==="bottom"?this.pageHeight-t.y:t.y;let d=2*Math.acos(a/Math.sqrt(i*i+a*a));i<0&&(d=-d);const h=Math.PI-d;if(!isFinite(d)||h>=0&&h<.003)throw new Error("The G point is too small");return this.corner==="bottom"&&(d=-d),d}getPageRect(t){return this.corner==="top"?this.getRectFromBasePoint([{x:0,y:0},{x:this.pageWidth,y:0},{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}],t):this.getRectFromBasePoint([{x:0,y:-this.pageHeight},{x:this.pageWidth,y:-this.pageHeight},{x:0,y:0},{x:this.pageWidth,y:0}],t)}getRectFromBasePoint(t,a){return{topLeft:this.getRotatedPoint(t[0],a),topRight:this.getRotatedPoint(t[1],a),bottomLeft:this.getRotatedPoint(t[2],a),bottomRight:this.getRotatedPoint(t[3],a)}}getRotatedPoint(t,a){return{x:t.x*Math.cos(this.angle)+t.y*Math.sin(this.angle)+a.x,y:t.y*Math.cos(this.angle)-t.x*Math.sin(this.angle)+a.y}}calculateIntersectPoint(t){const a={left:-1,top:-1,width:this.pageWidth+2,height:this.pageHeight+2};this.corner==="top"?(this.topIntersectPoint=m.GetIntersectBetweenTwoSegment(a,[t,this.rect.topRight],[{x:0,y:0},{x:this.pageWidth,y:0}]),this.sideIntersectPoint=m.GetIntersectBetweenTwoSegment(a,[t,this.rect.bottomLeft],[{x:this.pageWidth,y:0},{x:this.pageWidth,y:this.pageHeight}]),this.bottomIntersectPoint=m.GetIntersectBetweenTwoSegment(a,[this.rect.bottomLeft,this.rect.bottomRight],[{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}])):(this.topIntersectPoint=m.GetIntersectBetweenTwoSegment(a,[this.rect.topLeft,this.rect.topRight],[{x:0,y:0},{x:this.pageWidth,y:0}]),this.sideIntersectPoint=m.GetIntersectBetweenTwoSegment(a,[t,this.rect.topLeft],[{x:this.pageWidth,y:0},{x:this.pageWidth,y:this.pageHeight}]),this.bottomIntersectPoint=m.GetIntersectBetweenTwoSegment(a,[this.rect.bottomLeft,this.rect.bottomRight],[{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}]))}checkPositionAtCenterLine(t,a,i){let d=t;const h=m.LimitPointToCircle(a,this.pageWidth,d);d!==h&&(d=h,this.updateAngleAndGeometry(d));const b=Math.sqrt(Math.pow(this.pageWidth,2)+Math.pow(this.pageHeight,2));let w=this.rect.bottomRight,A=this.rect.topLeft;if(this.corner==="bottom"&&(w=this.rect.topRight,A=this.rect.bottomLeft),w.x<=0){const H=m.LimitPointToCircle(i,b,A);H!==d&&(d=H,this.updateAngleAndGeometry(d))}return d}getSegmentToShadowLine(){const t=this.getShadowStartPoint();return[t,t!==this.sideIntersectPoint&&this.sideIntersectPoint!==null?this.sideIntersectPoint:this.bottomIntersectPoint]}}class x{constructor(t,a){this.flippingPage=null,this.bottomPage=null,this.calc=null,this.state="read",this.render=t,this.app=a}fold(t){this.setState("user_fold"),this.calc===null&&this.start(t),this.do(this.render.convertToPage(t))}flip(t){if(this.app.getSettings().disableFlipByClick&&!this.isPointOnCorners(t)||(this.calc!==null&&this.render.finishAnimation(),!this.start(t)))return;const a=this.getBoundsRect();this.setState("flipping");const i=a.height/10,d=this.calc.getCorner()==="bottom"?a.height-i:i,h=this.calc.getCorner()==="bottom"?a.height:0;this.calc.calc({x:a.pageWidth-i,y:d}),this.animateFlippingTo({x:a.pageWidth-i,y:d},{x:-a.pageWidth,y:h},!0)}start(t){this.reset();const a=this.render.convertToBook(t),i=this.getBoundsRect(),d=this.getDirectionByPoint(a),h=a.y>=i.height/2?"bottom":"top";if(!this.checkDirection(d))return!1;try{if(this.flippingPage=this.app.getPageCollection().getFlippingPage(d),this.bottomPage=this.app.getPageCollection().getBottomPage(d),this.render.getOrientation()==="landscape")if(d===1){const b=this.app.getPageCollection().nextBy(this.flippingPage);b!==null&&this.flippingPage.getDensity()!==b.getDensity()&&(this.flippingPage.setDrawingDensity("hard"),b.setDrawingDensity("hard"))}else{const b=this.app.getPageCollection().prevBy(this.flippingPage);b!==null&&this.flippingPage.getDensity()!==b.getDensity()&&(this.flippingPage.setDrawingDensity("hard"),b.setDrawingDensity("hard"))}return this.render.setDirection(d),this.calc=new O(d,h,i.pageWidth.toString(10),i.height.toString(10)),!0}catch{return!1}}do(t){if(this.calc!==null&&this.calc.calc(t)){const a=this.calc.getFlippingProgress();this.bottomPage.setArea(this.calc.getBottomClipArea()),this.bottomPage.setPosition(this.calc.getBottomPagePosition()),this.bottomPage.setAngle(0),this.bottomPage.setHardAngle(0),this.flippingPage.setArea(this.calc.getFlippingClipArea()),this.flippingPage.setPosition(this.calc.getActiveCorner()),this.flippingPage.setAngle(this.calc.getAngle()),this.calc.getDirection()===0?this.flippingPage.setHardAngle(90*(200-2*a)/100):this.flippingPage.setHardAngle(-90*(200-2*a)/100),this.render.setPageRect(this.calc.getRect()),this.render.setBottomPage(this.bottomPage),this.render.setFlippingPage(this.flippingPage),this.render.setShadowData(this.calc.getShadowStartPoint(),this.calc.getShadowAngle(),a,this.calc.getDirection())}}flipToPage(t,a){const i=this.app.getPageCollection().getCurrentSpreadIndex(),d=this.app.getPageCollection().getSpreadIndexByPage(t);try{d>i&&(this.app.getPageCollection().setCurrentSpreadIndex(d-1),this.flipNext(a)),d<i&&(this.app.getPageCollection().setCurrentSpreadIndex(d+1),this.flipPrev(a))}catch{}}flipNext(t){this.flip({x:this.render.getRect().left+2*this.render.getRect().pageWidth-10,y:t==="top"?1:this.render.getRect().height-2})}flipPrev(t){this.flip({x:10,y:t==="top"?1:this.render.getRect().height-2})}stopMove(){if(this.calc===null)return;const t=this.calc.getPosition(),a=this.getBoundsRect(),i=this.calc.getCorner()==="bottom"?a.height:0;t.x<=0?this.animateFlippingTo(t,{x:-a.pageWidth,y:i},!0):this.animateFlippingTo(t,{x:a.pageWidth,y:i},!1)}showCorner(t){if(!this.checkState("read","fold_corner"))return;const a=this.getBoundsRect(),i=a.pageWidth;if(this.isPointOnCorners(t))if(this.calc===null){if(!this.start(t))return;this.setState("fold_corner"),this.calc.calc({x:i-1,y:1});const d=50,h=this.calc.getCorner()==="bottom"?a.height-1:1,b=this.calc.getCorner()==="bottom"?a.height-d:d;this.animateFlippingTo({x:i-1,y:h},{x:i-d,y:b},!1,!1)}else this.do(this.render.convertToPage(t));else this.setState("read"),this.render.finishAnimation(),this.stopMove()}animateFlippingTo(t,a,i,d=!0){const h=m.GetCordsFromTwoPoint(t,a),b=[];for(const A of h)b.push(()=>this.do(A));const w=this.getAnimationDuration(h.length);this.render.startAnimation(b,w,()=>{this.calc&&(i&&(this.calc.getDirection()===1?this.app.turnToPrevPage():this.app.turnToNextPage()),d&&(this.render.setBottomPage(null),this.render.setFlippingPage(null),this.render.clearShadow(),this.setState("read"),this.reset()))})}getCalculation(){return this.calc}getState(){return this.state}setState(t){this.state!==t&&(this.app.updateState(t),this.state=t)}getDirectionByPoint(t){const a=this.getBoundsRect();if(this.render.getOrientation()==="portrait"){if(t.x-a.pageWidth<=a.width/5)return 1}else if(t.x<a.width/2)return 1;return 0}getAnimationDuration(t){const a=this.app.getSettings().flippingTime;return t>=1e3?a:t/1e3*a}checkDirection(t){return t===0?this.app.getCurrentPageIndex()<this.app.getPageCount()-1:this.app.getCurrentPageIndex()>=1}reset(){this.calc=null,this.flippingPage=null,this.bottomPage=null}getBoundsRect(){return this.render.getRect()}checkState(...t){for(const a of t)if(this.state===a)return!0;return!1}isPointOnCorners(t){const a=this.getBoundsRect(),i=a.pageWidth,d=Math.sqrt(Math.pow(i,2)+Math.pow(a.height,2))/5,h=this.render.convertToBook(t);return h.x>0&&h.y>0&&h.x<a.width&&h.y<a.height&&(h.x<d||h.x>a.width-d)&&(h.y<d||h.y>a.height-d)}}class F{constructor(t,a){this.leftPage=null,this.rightPage=null,this.flippingPage=null,this.bottomPage=null,this.direction=null,this.orientation=null,this.shadow=null,this.animation=null,this.pageRect=null,this.boundsRect=null,this.timer=0,this.safari=!1,this.setting=a,this.app=t;const i=new RegExp("Version\\/[\\d\\.]+.*Safari/");this.safari=i.exec(window.navigator.userAgent)!==null}render(t){if(this.animation!==null){const a=Math.round((t-this.animation.startedAt)/this.animation.durationFrame);a<this.animation.frames.length?this.animation.frames[a]():(this.animation.onAnimateEnd(),this.animation=null)}this.timer=t,this.drawFrame()}start(){this.update();const t=a=>{this.render(a),requestAnimationFrame(t)};requestAnimationFrame(t)}startAnimation(t,a,i){this.finishAnimation(),this.animation={frames:t,duration:a,durationFrame:a/t.length,onAnimateEnd:i,startedAt:this.timer}}finishAnimation(){this.animation!==null&&(this.animation.frames[this.animation.frames.length-1](),this.animation.onAnimateEnd!==null&&this.animation.onAnimateEnd()),this.animation=null}update(){this.boundsRect=null;const t=this.calculateBoundsRect();this.orientation!==t&&(this.orientation=t,this.app.updateOrientation(t))}calculateBoundsRect(){let t="landscape";const a=this.getBlockWidth(),i=a/2,d=this.getBlockHeight()/2,h=this.setting.width/this.setting.height;let b=this.setting.width,w=this.setting.height,A=i-b;return this.setting.size==="stretch"?(a<2*this.setting.minWidth&&this.app.getSettings().usePortrait&&(t="portrait"),b=t==="portrait"?this.getBlockWidth():this.getBlockWidth()/2,b>this.setting.maxWidth&&(b=this.setting.maxWidth),w=b/h,w>this.getBlockHeight()&&(w=this.getBlockHeight(),b=w*h),A=t==="portrait"?i-b/2-b:i-b):a<2*b&&this.app.getSettings().usePortrait&&(t="portrait",A=i-b/2-b),this.boundsRect={left:A,top:d-w/2,width:2*b,height:w,pageWidth:b},t}setShadowData(t,a,i,d){if(!this.app.getSettings().drawShadow)return;const h=100*this.getSettings().maxShadowOpacity;this.shadow={pos:t,angle:a,width:3*this.getRect().pageWidth/4*i/100,opacity:(100-i)*h/100/100,direction:d,progress:2*i}}clearShadow(){this.shadow=null}getBlockWidth(){return this.app.getUI().getDistElement().offsetWidth}getBlockHeight(){return this.app.getUI().getDistElement().offsetHeight}getDirection(){return this.direction}getRect(){return this.boundsRect===null&&this.calculateBoundsRect(),this.boundsRect}getSettings(){return this.app.getSettings()}getOrientation(){return this.orientation}setPageRect(t){this.pageRect=t}setDirection(t){this.direction=t}setRightPage(t){t!==null&&t.setOrientation(1),this.rightPage=t}setLeftPage(t){t!==null&&t.setOrientation(0),this.leftPage=t}setBottomPage(t){t!==null&&t.setOrientation(this.direction===1?0:1),this.bottomPage=t}setFlippingPage(t){t!==null&&t.setOrientation(this.direction===0&&this.orientation!=="portrait"?0:1),this.flippingPage=t}convertToBook(t){const a=this.getRect();return{x:t.x-a.left,y:t.y-a.top}}isSafari(){return this.safari}convertToPage(t,a){a||(a=this.direction);const i=this.getRect();return{x:a===0?t.x-i.left-i.width/2:i.width/2-t.x+i.left,y:t.y-i.top}}convertToGlobal(t,a){if(a||(a=this.direction),t==null)return null;const i=this.getRect();return{x:a===0?t.x+i.left+i.width/2:i.width/2-t.x+i.left,y:t.y+i.top}}convertRectToGlobal(t,a){return a||(a=this.direction),{topLeft:this.convertToGlobal(t.topLeft,a),topRight:this.convertToGlobal(t.topRight,a),bottomLeft:this.convertToGlobal(t.bottomLeft,a),bottomRight:this.convertToGlobal(t.bottomRight,a)}}}class j extends F{constructor(t,a,i){super(t,a),this.canvas=i,this.ctx=i.getContext("2d")}getContext(){return this.ctx}reload(){}drawFrame(){this.clear(),this.orientation!=="portrait"&&this.leftPage!=null&&this.leftPage.simpleDraw(0),this.rightPage!=null&&this.rightPage.simpleDraw(1),this.bottomPage!=null&&this.bottomPage.draw(),this.drawBookShadow(),this.flippingPage!=null&&this.flippingPage.draw(),this.shadow!=null&&(this.drawOuterShadow(),this.drawInnerShadow());const t=this.getRect();this.orientation==="portrait"&&(this.ctx.beginPath(),this.ctx.rect(t.left+t.pageWidth,t.top,t.width,t.height),this.ctx.clip())}drawBookShadow(){const t=this.getRect();this.ctx.save(),this.ctx.beginPath();const a=t.width/20;this.ctx.rect(t.left,t.top,t.width,t.height);const i={x:t.left+t.width/2-a/2,y:0};this.ctx.translate(i.x,i.y);const d=this.ctx.createLinearGradient(0,0,a,0);d.addColorStop(0,"rgba(0, 0, 0, 0)"),d.addColorStop(.4,"rgba(0, 0, 0, 0.2)"),d.addColorStop(.49,"rgba(0, 0, 0, 0.1)"),d.addColorStop(.5,"rgba(0, 0, 0, 0.5)"),d.addColorStop(.51,"rgba(0, 0, 0, 0.4)"),d.addColorStop(1,"rgba(0, 0, 0, 0)"),this.ctx.clip(),this.ctx.fillStyle=d,this.ctx.fillRect(0,0,a,2*t.height),this.ctx.restore()}drawOuterShadow(){const t=this.getRect();this.ctx.save(),this.ctx.beginPath(),this.ctx.rect(t.left,t.top,t.width,t.height);const a=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y});this.ctx.translate(a.x,a.y),this.ctx.rotate(Math.PI+this.shadow.angle+Math.PI/2);const i=this.ctx.createLinearGradient(0,0,this.shadow.width,0);this.shadow.direction===0?(this.ctx.translate(0,-100),i.addColorStop(0,"rgba(0, 0, 0, "+this.shadow.opacity+")"),i.addColorStop(1,"rgba(0, 0, 0, 0)")):(this.ctx.translate(-this.shadow.width,-100),i.addColorStop(0,"rgba(0, 0, 0, 0)"),i.addColorStop(1,"rgba(0, 0, 0, "+this.shadow.opacity+")")),this.ctx.clip(),this.ctx.fillStyle=i,this.ctx.fillRect(0,0,this.shadow.width,2*t.height),this.ctx.restore()}drawInnerShadow(){const t=this.getRect();this.ctx.save(),this.ctx.beginPath();const a=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y}),i=this.convertRectToGlobal(this.pageRect);this.ctx.moveTo(i.topLeft.x,i.topLeft.y),this.ctx.lineTo(i.topRight.x,i.topRight.y),this.ctx.lineTo(i.bottomRight.x,i.bottomRight.y),this.ctx.lineTo(i.bottomLeft.x,i.bottomLeft.y),this.ctx.translate(a.x,a.y),this.ctx.rotate(Math.PI+this.shadow.angle+Math.PI/2);const d=3*this.shadow.width/4,h=this.ctx.createLinearGradient(0,0,d,0);this.shadow.direction===0?(this.ctx.translate(-d,-100),h.addColorStop(1,"rgba(0, 0, 0, "+this.shadow.opacity+")"),h.addColorStop(.9,"rgba(0, 0, 0, 0.05)"),h.addColorStop(.7,"rgba(0, 0, 0, "+this.shadow.opacity+")"),h.addColorStop(0,"rgba(0, 0, 0, 0)")):(this.ctx.translate(0,-100),h.addColorStop(0,"rgba(0, 0, 0, "+this.shadow.opacity+")"),h.addColorStop(.1,"rgba(0, 0, 0, 0.05)"),h.addColorStop(.3,"rgba(0, 0, 0, "+this.shadow.opacity+")"),h.addColorStop(1,"rgba(0, 0, 0, 0)")),this.ctx.clip(),this.ctx.fillStyle=h,this.ctx.fillRect(0,0,d,2*t.height),this.ctx.restore()}clear(){this.ctx.fillStyle="white",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}}class v{constructor(t,a,i){this.touchPoint=null,this.swipeTimeout=250,this.onResize=()=>{this.update()},this.onMouseDown=h=>{if(this.checkTarget(h.target)){const b=this.getMousePos(h.clientX,h.clientY);this.app.startUserTouch(b),h.preventDefault()}},this.onTouchStart=h=>{if(this.checkTarget(h.target)&&h.changedTouches.length>0){const b=h.changedTouches[0],w=this.getMousePos(b.clientX,b.clientY);this.touchPoint={point:w,time:Date.now()},setTimeout(()=>{this.touchPoint!==null&&this.app.startUserTouch(w)},this.swipeTimeout),this.app.getSettings().mobileScrollSupport||h.preventDefault()}},this.onMouseUp=h=>{const b=this.getMousePos(h.clientX,h.clientY);this.app.userStop(b)},this.onMouseMove=h=>{const b=this.getMousePos(h.clientX,h.clientY);this.app.userMove(b,!1)},this.onTouchMove=h=>{if(h.changedTouches.length>0){const b=h.changedTouches[0],w=this.getMousePos(b.clientX,b.clientY);this.app.getSettings().mobileScrollSupport?(this.touchPoint!==null&&(Math.abs(this.touchPoint.point.x-w.x)>10||this.app.getState()!=="read")&&h.cancelable&&this.app.userMove(w,!0),this.app.getState()!=="read"&&h.preventDefault()):this.app.userMove(w,!0)}},this.onTouchEnd=h=>{if(h.changedTouches.length>0){const b=h.changedTouches[0],w=this.getMousePos(b.clientX,b.clientY);let A=!1;if(this.touchPoint!==null){const H=w.x-this.touchPoint.point.x,T=Math.abs(w.y-this.touchPoint.point.y);Math.abs(H)>this.swipeDistance&&T<2*this.swipeDistance&&Date.now()-this.touchPoint.time<this.swipeTimeout&&(H>0?this.app.flipPrev(this.touchPoint.point.y<this.app.getRender().getRect().height/2?"top":"bottom"):this.app.flipNext(this.touchPoint.point.y<this.app.getRender().getRect().height/2?"top":"bottom"),A=!0),this.touchPoint=null}this.app.userStop(w,A)}},this.parentElement=t,t.classList.add("stf__parent"),t.insertAdjacentHTML("afterbegin",'<div class="stf__wrapper"></div>'),this.wrapper=t.querySelector(".stf__wrapper"),this.app=a;const d=this.app.getSettings().usePortrait?1:2;t.style.minWidth=i.minWidth*d+"px",t.style.minHeight=i.minHeight+"px",i.size==="fixed"&&(t.style.minWidth=i.width*d+"px",t.style.minHeight=i.height+"px"),i.autoSize&&(t.style.width="100%",t.style.maxWidth=2*i.maxWidth+"px"),t.style.display="block",window.addEventListener("resize",this.onResize,!1),this.swipeDistance=i.swipeDistance}destroy(){this.app.getSettings().useMouseEvents&&this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}getDistElement(){return this.distElement}getWrapper(){return this.wrapper}setOrientationStyle(t){this.wrapper.classList.remove("--portrait","--landscape"),t==="portrait"?(this.app.getSettings().autoSize&&(this.wrapper.style.paddingBottom=this.app.getSettings().height/this.app.getSettings().width*100+"%"),this.wrapper.classList.add("--portrait")):(this.app.getSettings().autoSize&&(this.wrapper.style.paddingBottom=this.app.getSettings().height/(2*this.app.getSettings().width)*100+"%"),this.wrapper.classList.add("--landscape")),this.update()}removeHandlers(){window.removeEventListener("resize",this.onResize),this.distElement.removeEventListener("mousedown",this.onMouseDown),this.distElement.removeEventListener("touchstart",this.onTouchStart),window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("touchmove",this.onTouchMove),window.removeEventListener("mouseup",this.onMouseUp),window.removeEventListener("touchend",this.onTouchEnd)}setHandlers(){window.addEventListener("resize",this.onResize,!1),this.app.getSettings().useMouseEvents&&(this.distElement.addEventListener("mousedown",this.onMouseDown),this.distElement.addEventListener("touchstart",this.onTouchStart),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("touchmove",this.onTouchMove,{passive:!this.app.getSettings().mobileScrollSupport}),window.addEventListener("mouseup",this.onMouseUp),window.addEventListener("touchend",this.onTouchEnd))}getMousePos(t,a){const i=this.distElement.getBoundingClientRect();return{x:t-i.left,y:a-i.top}}checkTarget(t){return!this.app.getSettings().clickEventForward||!["a","button"].includes(t.tagName.toLowerCase())}}class _ extends v{constructor(t,a,i,d){super(t,a,i),this.wrapper.insertAdjacentHTML("afterbegin",'<div class="stf__block"></div>'),this.distElement=t.querySelector(".stf__block"),this.items=d;for(const h of d)this.distElement.appendChild(h);this.setHandlers()}clear(){for(const t of this.items)this.parentElement.appendChild(t)}updateItems(t){this.removeHandlers(),this.distElement.innerHTML="";for(const a of t)this.distElement.appendChild(a);this.items=t,this.setHandlers()}update(){this.app.getRender().update()}}class Z extends v{constructor(t,a,i){super(t,a,i),this.wrapper.innerHTML='<canvas class="stf__canvas"></canvas>',this.canvas=t.querySelectorAll("canvas")[0],this.distElement=this.canvas,this.resizeCanvas(),this.setHandlers()}resizeCanvas(){const t=getComputedStyle(this.canvas),a=parseInt(t.getPropertyValue("width"),10),i=parseInt(t.getPropertyValue("height"),10);this.canvas.width=a,this.canvas.height=i}getCanvas(){return this.canvas}update(){this.resizeCanvas(),this.app.getRender().update()}}class L extends F{constructor(t,a,i){super(t,a),this.outerShadow=null,this.innerShadow=null,this.hardShadow=null,this.hardInnerShadow=null,this.element=i,this.createShadows()}createShadows(){this.element.insertAdjacentHTML("beforeend",`<div class="stf__outerShadow"></div>
             <div class="stf__innerShadow"></div>
             <div class="stf__hardShadow"></div>
             <div class="stf__hardInnerShadow"></div>`),this.outerShadow=this.element.querySelector(".stf__outerShadow"),this.innerShadow=this.element.querySelector(".stf__innerShadow"),this.hardShadow=this.element.querySelector(".stf__hardShadow"),this.hardInnerShadow=this.element.querySelector(".stf__hardInnerShadow")}clearShadow(){super.clearShadow(),this.outerShadow.style.cssText="display: none",this.innerShadow.style.cssText="display: none",this.hardShadow.style.cssText="display: none",this.hardInnerShadow.style.cssText="display: none"}reload(){this.element.querySelector(".stf__outerShadow")||this.createShadows()}drawHardInnerShadow(){const t=this.getRect(),a=this.shadow.progress>100?200-this.shadow.progress:this.shadow.progress;let i=(100-a)*(2.5*t.pageWidth)/100+20;i>t.pageWidth&&(i=t.pageWidth);let d=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+5).toString(10)};
            width: ${i}px;
            height: ${t.height}px;
            background: linear-gradient(to right,
                rgba(0, 0, 0, ${this.shadow.opacity*a/100}) 5%,
                rgba(0, 0, 0, 0) 100%);
            left: ${t.left+t.width/2}px;
            transform-origin: 0 0;
        `;d+=this.getDirection()===0&&this.shadow.progress>100||this.getDirection()===1&&this.shadow.progress<=100?"transform: translate3d(0, 0, 0);":"transform: translate3d(0, 0, 0) rotateY(180deg);",this.hardInnerShadow.style.cssText=d}drawHardOuterShadow(){const t=this.getRect();let a=(100-(this.shadow.progress>100?200-this.shadow.progress:this.shadow.progress))*(2.5*t.pageWidth)/100+20;a>t.pageWidth&&(a=t.pageWidth);let i=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+4).toString(10)};
            width: ${a}px;
            height: ${t.height}px;
            background: linear-gradient(to left, rgba(0, 0, 0, ${this.shadow.opacity}) 5%, rgba(0, 0, 0, 0) 100%);
            left: ${t.left+t.width/2}px;
            transform-origin: 0 0;
        `;i+=this.getDirection()===0&&this.shadow.progress>100||this.getDirection()===1&&this.shadow.progress<=100?"transform: translate3d(0, 0, 0) rotateY(180deg);":"transform: translate3d(0, 0, 0);",this.hardShadow.style.cssText=i}drawInnerShadow(){const t=this.getRect(),a=3*this.shadow.width/4,i=this.getDirection()===0?a:0,d=this.getDirection()===0?"to left":"to right",h=this.convertToGlobal(this.shadow.pos),b=this.shadow.angle+3*Math.PI/2,w=[this.pageRect.topLeft,this.pageRect.topRight,this.pageRect.bottomRight,this.pageRect.bottomLeft];let A="polygon( ";for(const T of w){let B=this.getDirection()===1?{x:-T.x+this.shadow.pos.x,y:T.y-this.shadow.pos.y}:{x:T.x-this.shadow.pos.x,y:T.y-this.shadow.pos.y};B=m.GetRotatedPoint(B,{x:i,y:100},b),A+=B.x+"px "+B.y+"px, "}A=A.slice(0,-2),A+=")";const H=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+10).toString(10)};
            width: ${a}px;
            height: ${2*t.height}px;
            background: linear-gradient(${d},
                rgba(0, 0, 0, ${this.shadow.opacity}) 5%,
                rgba(0, 0, 0, 0.05) 15%,
                rgba(0, 0, 0, ${this.shadow.opacity}) 35%,
                rgba(0, 0, 0, 0) 100%);
            transform-origin: ${i}px 100px;
            transform: translate3d(${h.x-i}px, ${h.y-100}px, 0) rotate(${b}rad);
            clip-path: ${A};
            -webkit-clip-path: ${A};
        `;this.innerShadow.style.cssText=H}drawOuterShadow(){const t=this.getRect(),a=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y}),i=this.shadow.angle+3*Math.PI/2,d=this.getDirection()===1?this.shadow.width:0,h=this.getDirection()===0?"to right":"to left",b=[{x:0,y:0},{x:t.pageWidth,y:0},{x:t.pageWidth,y:t.height},{x:0,y:t.height}];let w="polygon( ";for(const H of b)if(H!==null){let T=this.getDirection()===1?{x:-H.x+this.shadow.pos.x,y:H.y-this.shadow.pos.y}:{x:H.x-this.shadow.pos.x,y:H.y-this.shadow.pos.y};T=m.GetRotatedPoint(T,{x:d,y:100},i),w+=T.x+"px "+T.y+"px, "}w=w.slice(0,-2),w+=")";const A=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+10).toString(10)};
            width: ${this.shadow.width}px;
            height: ${2*t.height}px;
            background: linear-gradient(${h}, rgba(0, 0, 0, ${this.shadow.opacity}), rgba(0, 0, 0, 0));
            transform-origin: ${d}px 100px;
            transform: translate3d(${a.x-d}px, ${a.y-100}px, 0) rotate(${i}rad);
            clip-path: ${w};
            -webkit-clip-path: ${w};
        `;this.outerShadow.style.cssText=A}drawLeftPage(){this.orientation!=="portrait"&&this.leftPage!==null&&(this.direction===1&&this.flippingPage!==null&&this.flippingPage.getDrawingDensity()==="hard"?(this.leftPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.leftPage.setHardDrawingAngle(180+this.flippingPage.getHardAngle()),this.leftPage.draw(this.flippingPage.getDrawingDensity())):this.leftPage.simpleDraw(0))}drawRightPage(){this.rightPage!==null&&(this.direction===0&&this.flippingPage!==null&&this.flippingPage.getDrawingDensity()==="hard"?(this.rightPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.rightPage.setHardDrawingAngle(180+this.flippingPage.getHardAngle()),this.rightPage.draw(this.flippingPage.getDrawingDensity())):this.rightPage.simpleDraw(1))}drawBottomPage(){if(this.bottomPage===null)return;const t=this.flippingPage!=null?this.flippingPage.getDrawingDensity():null;this.orientation==="portrait"&&this.direction===1||(this.bottomPage.getElement().style.zIndex=(this.getSettings().startZIndex+3).toString(10),this.bottomPage.draw(t))}drawFrame(){this.clear(),this.drawLeftPage(),this.drawRightPage(),this.drawBottomPage(),this.flippingPage!=null&&(this.flippingPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.flippingPage.draw()),this.shadow!=null&&this.flippingPage!==null&&(this.flippingPage.getDrawingDensity()==="soft"?(this.drawOuterShadow(),this.drawInnerShadow()):(this.drawHardOuterShadow(),this.drawHardInnerShadow()))}clear(){for(const t of this.app.getPageCollection().getPages())t!==this.leftPage&&t!==this.rightPage&&t!==this.flippingPage&&t!==this.bottomPage&&(t.getElement().style.cssText="display: none"),t.getTemporaryCopy()!==this.flippingPage&&t.hideTemporaryCopy()}update(){super.update(),this.rightPage!==null&&this.rightPage.setOrientation(1),this.leftPage!==null&&this.leftPage.setOrientation(0)}}class R{constructor(){this._default={startPage:0,size:"fixed",width:0,height:0,minWidth:0,maxWidth:0,minHeight:0,maxHeight:0,drawShadow:!0,flippingTime:1e3,usePortrait:!0,startZIndex:0,autoSize:!0,maxShadowOpacity:1,showCover:!1,mobileScrollSupport:!0,swipeDistance:30,clickEventForward:!0,useMouseEvents:!0,showPageCorners:!0,disableFlipByClick:!1}}getSettings(t){const a=this._default;if(Object.assign(a,t),a.size!=="stretch"&&a.size!=="fixed")throw new Error('Invalid size type. Available only "fixed" and "stretch" value');if(a.width<=0||a.height<=0)throw new Error("Invalid width or height");if(a.flippingTime<=0)throw new Error("Invalid flipping time");return a.size==="stretch"?(a.minWidth<=0&&(a.minWidth=100),a.maxWidth<a.minWidth&&(a.maxWidth=2e3),a.minHeight<=0&&(a.minHeight=100),a.maxHeight<a.minHeight&&(a.maxHeight=2e3)):(a.minWidth=a.width,a.maxWidth=a.width,a.minHeight=a.height,a.maxHeight=a.height),a}}(function(z,t){t===void 0&&(t={});var a=t.insertAt;if(typeof document<"u"){var i=document.head||document.getElementsByTagName("head")[0],d=document.createElement("style");d.type="text/css",a==="top"&&i.firstChild?i.insertBefore(d,i.firstChild):i.appendChild(d),d.styleSheet?d.styleSheet.cssText=z:d.appendChild(document.createTextNode(z))}})(`.stf__parent {
  position: relative;
  display: block;
  box-sizing: border-box;
  transform: translateZ(0);

  -ms-touch-action: pan-y;
  touch-action: pan-y;
}

.sft__wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.stf__parent canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.stf__block {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  perspective: 2000px;
}

.stf__item {
  display: none;
  position: absolute;
  transform-style: preserve-3d;
}

.stf__outerShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__innerShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__hardShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__hardInnerShadow {
  position: absolute;
  left: 0;
  top: 0;
}`),s.PageFlip=class extends class{constructor(){this.events=new Map}on(z,t){return this.events.has(z)?this.events.get(z).push(t):this.events.set(z,[t]),this}off(z){this.events.delete(z)}trigger(z,t,a=null){if(this.events.has(z))for(const i of this.events.get(z))i({data:a,object:t})}}{constructor(z,t){super(),this.isUserTouch=!1,this.isUserMove=!1,this.setting=null,this.pages=null,this.setting=new R().getSettings(t),this.block=z}destroy(){this.ui.destroy(),this.block.remove()}update(){this.render.update(),this.pages.show()}loadFromImages(z){this.ui=new Z(this.block,this,this.setting);const t=this.ui.getCanvas();this.render=new j(this,this.setting,t),this.flipController=new x(this.render,this),this.pages=new f(this,this.render,z),this.pages.load(),this.render.start(),this.pages.show(this.setting.startPage),setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)}loadFromHTML(z){this.ui=new _(this.block,this,this.setting,z),this.render=new L(this,this.setting,this.ui.getDistElement()),this.flipController=new x(this.render,this),this.pages=new N(this,this.render,this.ui.getDistElement(),z),this.pages.load(),this.render.start(),this.pages.show(this.setting.startPage),setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)}updateFromImages(z){const t=this.pages.getCurrentPageIndex();this.pages.destroy(),this.pages=new f(this,this.render,z),this.pages.load(),this.pages.show(t),this.trigger("update",this,{page:t,mode:this.render.getOrientation()})}updateFromHtml(z){const t=this.pages.getCurrentPageIndex();this.pages.destroy(),this.pages=new N(this,this.render,this.ui.getDistElement(),z),this.pages.load(),this.ui.updateItems(z),this.render.reload(),this.pages.show(t),this.trigger("update",this,{page:t,mode:this.render.getOrientation()})}clear(){this.pages.destroy(),this.ui.clear()}turnToPrevPage(){this.pages.showPrev()}turnToNextPage(){this.pages.showNext()}turnToPage(z){this.pages.show(z)}flipNext(z="top"){this.flipController.flipNext(z)}flipPrev(z="top"){this.flipController.flipPrev(z)}flip(z,t="top"){this.flipController.flipToPage(z,t)}updateState(z){this.trigger("changeState",this,z)}updatePageIndex(z){this.trigger("flip",this,z)}updateOrientation(z){this.ui.setOrientationStyle(z),this.update(),this.trigger("changeOrientation",this,z)}getPageCount(){return this.pages.getPageCount()}getCurrentPageIndex(){return this.pages.getCurrentPageIndex()}getPage(z){return this.pages.getPage(z)}getRender(){return this.render}getFlipController(){return this.flipController}getOrientation(){return this.render.getOrientation()}getBoundsRect(){return this.render.getRect()}getSettings(){return this.setting}getUI(){return this.ui}getState(){return this.flipController.getState()}getPageCollection(){return this.pages}startUserTouch(z){this.mousePosition=z,this.isUserTouch=!0,this.isUserMove=!1}userMove(z,t){this.isUserTouch||t||!this.setting.showPageCorners?this.isUserTouch&&m.GetDistanceBetweenTwoPoint(this.mousePosition,z)>5&&(this.isUserMove=!0,this.flipController.fold(z)):this.flipController.showCorner(z)}userStop(z,t=!1){this.isUserTouch&&(this.isUserTouch=!1,t||(this.isUserMove?this.flipController.stopMove():this.flipController.flip(z)))}},Object.defineProperty(s,"__esModule",{value:!0})})})(Na,Na.exports);var Fi=Na.exports;const Hi=Pt.forwardRef((o,n)=>{const s=r.useRef(null),c=r.useRef([]),p=r.useRef(),[l,f]=r.useState([]);r.useImperativeHandle(n,()=>({pageFlip:()=>p.current}));const m=r.useCallback(()=>{p.current&&p.current.clear()},[]),y=r.useCallback(()=>{const N=p.current;N&&(N.off("flip"),N.off("changeOrientation"),N.off("changeState"),N.off("init"),N.off("update"))},[]);return r.useEffect(()=>{if(c.current=[],o.children){const N=Pt.Children.map(o.children,O=>Pt.cloneElement(O,{ref:x=>{x&&c.current.push(x)}}));(!o.renderOnlyPageLengthChange||l.length!==N.length)&&(N.length<l.length&&m(),f(N))}},[o.children]),r.useEffect(()=>{const N=()=>{const O=p.current;O&&(o.onFlip&&O.on("flip",x=>o.onFlip(x)),o.onChangeOrientation&&O.on("changeOrientation",x=>o.onChangeOrientation(x)),o.onChangeState&&O.on("changeState",x=>o.onChangeState(x)),o.onInit&&O.on("init",x=>o.onInit(x)),o.onUpdate&&O.on("update",x=>o.onUpdate(x)))};l.length>0&&c.current.length>0&&(y(),s.current&&!p.current&&(p.current=new Fi.PageFlip(s.current,o)),p.current.getFlipController()?p.current.updateFromHtml(c.current):p.current.loadFromHTML(c.current),N())},[l]),Pt.createElement("div",{ref:s,className:o.className,style:o.style},l)}),$i=Pt.memo(Hi),Vi="/assets/dogypt-seal-CV2A4RoR.webp",Sa=[{num:"I.",name:"CANON",desc:"who we are",subs:["The Founding Myth","GOD is DOG","The Age of the Dog","The Syncretic Clause"]},{num:"II.",name:"CREDO",desc:"what we believe",subs:["Seven Truths About Dogs","The DOG-GOD Philosophy","The Present Moment"]},{num:"III.",name:"COMMANDMENTS",desc:"how we act",subs:["The Ten Duties of a Dogyptian","The Seven Sins","The Seven Virtues","Duties to the Dog Race","Mantra of the Community","The Proud Dogyptian"]},{num:"IV.",name:"SACRAMENTS",desc:"how we pray",subs:["The Sacraments","The Prayers","Feasts & Calendar","Life Rituals"]},{num:"V.",name:"HIERARCHY",desc:"who is who",subs:["HEKTHOR I.","The Pharaoh","The Dogyptian Council","The Conscious Dog Person"]},{num:"VI.",name:"SACRED PLACES",desc:"where we gather",subs:["dogypt.com — The Virtual Temple","DOGYPT Centres","DOGYPTLAND","Local Circles"]},{num:"VII.",name:"TEXTS",desc:"what we read",subs:["The DOGYPT Constitution","The Heroglyph Manual","Cesta s Hrdinom (The Hero’s Journey)"]},{num:"VIII.",name:"LANGUAGE",desc:"how we speak",subs:["Dogyptish","The Heroglyph","Liturgical Colours","Identification","The DOGYPT Logo"]},{num:"IX.",name:"ECONOMY",desc:"how we sustain",subs:["Principles Binding From Day One","Deferred for Later Revision"]},{num:"X.",name:"INSTITUTIONS",desc:"how we govern",subs:["Layer 1 — The Movement","Layer 2 — Slovak Civic Association","Layer 3 — USA 501(c)(3) Nonprofit","Layer 4 — Church of Slovakia","Layer 5 — International Umbrella"]},{num:"XI.",name:"EXPANSION",desc:"how we grow",subs:["Phase Slovakia (2026)","Phase USA (2027)","Phase Europe (2027–2028)","Phase World (2028+)","The “Same Story” Principle"]},{num:"XII.",name:"ANTI-DOCTRINES",desc:"what we are not",subs:["Not a Cult","Not a Personality Cult","Not a Competitor to Other Faiths","Not Anti-Veterinary","Not Empty MLM","Not Vegan / Anti-Meat Ideology","Not a Political Project"]}],fa=o=>Math.max(1,...o.split(/\s+/).map(n=>n.length)),Gi=$i,$t=.665;function xo(){const o=typeof window<"u"?window.innerWidth:1280,n=typeof window<"u"?window.innerHeight:800,s=o<768;if(s){let m=(o-20)/2,y=m/$t;const N=n*.72;return y>N&&(y=N,m=y*$t),{w:Math.round(m),h:Math.round(y),mobile:s}}let c=Math.min(n*.7,800),p=c*$t;const l=Math.min(o*.82,1180);return 2*p>l&&(p=l/2,c=p/$t),{w:Math.round(p),h:Math.round(c),mobile:s}}const fo=[Sa.slice(0,6),Sa.slice(6,12)];function vo({rows:o}){const n=_e(),s=c=>{const p=`religion.book.ch.${Sa.indexOf(c)+1}.desc`,l=n(p);return l===p?c.desc:l};return e.jsx("ul",{className:"cb-chapters",children:o.map(c=>e.jsxs("li",{className:"cb-chapter",children:[e.jsx("span",{className:"cb-ch-num",children:c.num}),e.jsxs("span",{className:"cb-ch-text",children:[e.jsx("span",{className:"cb-ch-name",children:c.name}),e.jsx("span",{className:"cb-ch-desc",children:s(c)})]})]},c.num))})}function Yi({belowBook:o,openOnMount:n=!1}={}){const s=_e(),c=r.useRef(null),[p,l]=r.useState(n),[f,m]=r.useState(0),[y,N]=r.useState(xo);r.useEffect(()=>{p&&Pn()},[p]),r.useEffect(()=>{let L;const R=()=>{clearTimeout(L),L=setTimeout(()=>N(xo()),120)},z=new ResizeObserver(R);return z.observe(document.documentElement),window.addEventListener("resize",R),R(),()=>{z.disconnect(),window.removeEventListener("resize",R),clearTimeout(L)}},[]);const O=r.useCallback(L=>m(L.data),[]),x=L=>{var z;const R=(z=c.current)==null?void 0:z.pageFlip();R&&(L==="next"?R.flipNext():R.flipPrev())},F=r.useRef(null),j=L=>{L.pointerType==="mouse"&&(L.target.closest("a,button")||(F.current={x:L.clientX,y:L.clientY,t:L.timeStamp}))},v=L=>{if(L.pointerType!=="mouse"||!F.current)return;const R=L.clientX-F.current.x,z=L.clientY-F.current.y,t=L.timeStamp-F.current.t;F.current=null,Math.abs(R)>45&&Math.abs(z)<90&&t<600&&x(R<0?"next":"prev")},_=r.useRef(null);r.useEffect(()=>{const L=_.current;if(!L)return;let R=!1;const z=t=>{Math.abs(t.deltaX)<=Math.abs(t.deltaY)||(t.preventDefault(),!(R||Math.abs(t.deltaX)<24)&&(R=!0,x(t.deltaX>0?"next":"prev"),setTimeout(()=>{R=!1},780)))};return L.addEventListener("wheel",z,{passive:!1}),()=>L.removeEventListener("wheel",z)},[]);const Z=y.w*2;return e.jsxs("div",{className:`cb-wrap ${p?"cb-open":"cb-closed"}`,style:{"--cb-h":`${y.h}px`},children:[e.jsx("style",{children:Ki}),e.jsxs("div",{className:"cb-stage",style:{width:Z,height:y.h},children:[e.jsx("div",{className:"cb-bookwrap",ref:_,onPointerDown:j,onPointerUp:v,children:e.jsxs(Gi,{ref:c,className:"cb-book",width:y.w,height:y.h,size:"fixed",minWidth:y.w,maxWidth:y.w,minHeight:y.h,maxHeight:y.h,maxShadowOpacity:.4,drawShadow:!0,flippingTime:750,showCover:!1,usePortrait:!y.mobile,mobileScrollSupport:!1,useMouseEvents:!0,swipeDistance:18,showPageCorners:!0,clickEventForward:["a","button"],startZIndex:5,onFlip:O,children:[e.jsx("div",{className:"cb-page cb-left",children:e.jsx("div",{className:"cb-content cb-seal-page",children:e.jsx("img",{src:Vi,alt:s("religion.book.sealAlt"),className:"cb-seal-big"})})}),e.jsx("div",{className:"cb-page cb-right",children:e.jsxs("div",{className:"cb-content cb-title-page",children:[e.jsxs("h2",{className:"cb-title",style:{"--n":Math.max(fa(s("religion.book.titleThe")),fa(s("religion.book.titleConstitution")),fa(s("religion.book.titleBrand"))*1.5)},children:[e.jsx("span",{children:s("religion.book.titleThe")}),e.jsx("span",{className:"cb-title-brand",children:s("religion.book.titleBrand")}),e.jsx("span",{children:s("religion.book.titleConstitution")})]}),e.jsx("p",{className:"cb-trust",children:s("religion.book.trust")}),e.jsx("p",{className:"cb-sub",children:s("religion.book.sub")})]})}),e.jsx("div",{className:"cb-page cb-left",children:e.jsx("div",{className:"cb-content cb-index-page",children:e.jsx(vo,{rows:fo[0]})})}),e.jsx("div",{className:"cb-page cb-right",children:e.jsx("div",{className:"cb-content cb-index-page",children:e.jsx(vo,{rows:fo[1]})})}),e.jsx("div",{className:"cb-page cb-left",children:e.jsxs("div",{className:"cb-content cb-cta-page",children:[e.jsx("p",{className:"cb-cta-kicker",children:s("religion.book.cta1.kicker")}),e.jsx("h3",{className:"cb-cta-head",dangerouslySetInnerHTML:{__html:s("religion.book.cta1.head")}}),e.jsx("p",{className:"cb-cta-text",children:s("religion.book.cta1.text")}),e.jsx(vt,{to:"/heroglyph/name",className:"cb-cta-btn",children:s("religion.book.cta1.btn")})]})}),e.jsx("div",{className:"cb-page cb-right",children:e.jsxs("div",{className:"cb-content cb-cta-page",children:[e.jsx("p",{className:"cb-cta-kicker",children:s("religion.book.cta2.kicker")}),e.jsx("h3",{className:"cb-cta-head",dangerouslySetInnerHTML:{__html:s("religion.book.cta2.head")}}),e.jsx("p",{className:"cb-cta-text",children:s("religion.book.cta2.text")}),e.jsx("a",{href:"https://dogma.dogypt.com",target:"_blank",rel:"noreferrer",className:"cb-cta-btn cb-cta-ghost",children:s("religion.book.cta2.btn")})]})})]},`${y.w}x${y.h}`)}),e.jsxs("button",{type:"button",className:"cb-cover-layer",onClick:()=>!p&&l(!0),"aria-label":s("religion.book.coverOpenAria"),tabIndex:p?-1:0,children:[e.jsx("span",{className:"cb-halo","aria-hidden":!0}),e.jsx("img",{src:"/images/dogma-cover.webp",alt:s("religion.book.coverAlt"),className:"cb-cover-img",style:{height:y.h,minHeight:y.h}}),e.jsx("span",{className:"cb-shimmer","aria-hidden":!0})]})]}),o,p?e.jsxs("div",{className:"cb-nav",children:[e.jsx("button",{type:"button",className:`cb-arrow ${f===0?"cb-arrow-close":""}`,onClick:()=>f===0?l(!1):x("prev"),"aria-label":s(f===0?"religion.book.close":"religion.book.prevPage"),title:s(f===0?"religion.book.close":"religion.book.prevPage"),children:"‹"}),e.jsx("button",{type:"button",className:"cb-arrow",onClick:()=>x("next"),disabled:f>=4,"aria-label":s("religion.book.nextPage"),children:"›"})]}):e.jsxs("button",{type:"button",className:"cb-hint",onClick:()=>l(!0),children:[e.jsx("span",{className:"cb-hint-dot"})," ",s("religion.book.hint")]}),y.mobile&&p&&f>=4&&e.jsxs("div",{className:"cb-mobile-cta",children:[e.jsx(vt,{to:"/heroglyph/name",className:"cb-cta-btn",children:s("religion.book.cta1.btn")}),e.jsx("a",{href:"https://dogma.dogypt.com",target:"_blank",rel:"noreferrer",className:"cb-cta-btn cb-cta-ghost",children:s("religion.book.cta2.btn")})]})]})}const Ki=`
.cb-wrap{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(12px,2.2vh,24px);width:100%;height:100%;}
.cb-stage{position:relative;flex:0 0 auto;max-width:100%;}

/* crossfade vrstvy */
.cb-bookwrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity .85s ease;pointer-events:none;
  /* orež prečnievanie listu pri prevracaní presne po pokojovú hranu knihy
     (page PNG má hore 7.5% / dole 8% priehľadný okraj → tam list pri curl-e vykúkal) */
  clip-path:inset(7.5% 0 8% 0);}
.cb-open .cb-bookwrap{opacity:1;pointer-events:auto;}
.cb-book{margin:0 auto;}

/* PC (2026-06-03, Matej OK): kniha −15% (scale od stredu) aby bolo nad ňou vidno nadpis
   "The Bible for dog lovers". Scale = strany aj text sa zmenšia proporčne. Mobile má vlastný
   layout. (2026-07-08: scale sa NEZVYŠUJE — „malá kniha" bol Chrome flex-img height bug,
   rieši min-height na cover img, nie zväčšenie knihy — to len naráža nadpis do knihy.) */
@media (min-width:768px){
  .cb-stage{transform:scale(0.85);}
  /* "Tap the book to open" 15px pod VIZUÁLNYM spodkom knihy (box je väčší kvôli scale →
     absolútne cez --cb-h × 0.85, inak by hint visel priďaleko). Hint = len closed stav. */
  .cb-hint{position:absolute;left:50%;top:calc(50% + (var(--cb-h) * 0.85 / 2) + 15px);transform:translateX(-50%);}
}

.cb-cover-layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:none;border:none;padding:0;cursor:pointer;z-index:6;
  opacity:1;transition:opacity .85s ease,transform .85s ease;}
.cb-closed .cb-cover-layer:hover{transform:scale(1.015);}
.cb-closed .cb-cover-layer:hover .cb-halo{animation-play-state:paused;opacity:.8;filter:blur(48px);width:88%;height:102%;
  background:radial-gradient(ellipse at center,rgba(201,154,63,.72),rgba(168,85,247,.24) 56%,rgba(168,85,247,0) 76%);}
.cb-open .cb-cover-layer{opacity:0;transform:scale(.985);pointer-events:none;}
.cb-cover-img{width:auto;max-width:100%;object-fit:contain;display:block;position:relative;z-index:1;
  filter:drop-shadow(0 10px 30px rgba(0,0,0,.55));}

/* mäkké halo (len opacity+scale pulz → bez sekania) */
.cb-halo{position:absolute;left:50%;top:50%;width:74%;height:90%;transform:translate(-50%,-50%);
  border-radius:16px;z-index:0;pointer-events:none;filter:blur(38px);opacity:.45;
  background:radial-gradient(ellipse at center,rgba(201,154,63,.55),rgba(168,85,247,.16) 56%,rgba(168,85,247,0) 74%);
  animation:cbHalo 6.5s ease-in-out infinite;
  transition:opacity .4s ease,filter .4s ease,width .4s ease,height .4s ease,background .4s ease;}
.cb-open .cb-halo{animation:none;opacity:0;transition:opacity .6s ease;}
@keyframes cbHalo{0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1);}50%{opacity:.66;transform:translate(-50%,-50%) scale(1.04);}}

/* záblesk — svetelný pruh prejde po obálke (len transform → plynulé, maska statická) */
.cb-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;overflow:hidden;
  -webkit-mask:url(/images/dogma-cover.webp) center/contain no-repeat;mask:url(/images/dogma-cover.webp) center/contain no-repeat;
  transition:opacity .5s ease;}
.cb-closed .cb-shimmer{opacity:1;}
.cb-shimmer::before{content:"";position:absolute;top:-25%;left:0;width:42%;height:150%;
  background:linear-gradient(105deg,rgba(255,249,224,0) 0%,rgba(255,249,224,.28) 50%,rgba(255,249,224,0) 100%);
  transform:translateX(-170%) rotate(6deg);animation:cbSweep 8s ease-in-out 1.6s infinite;}
@keyframes cbSweep{0%{transform:translateX(-170%) rotate(6deg);}40%,100%{transform:translateX(330%) rotate(6deg);}}
@media (prefers-reduced-motion:reduce){.cb-shimmer{display:none;}}

/* pages */
.cb-page{position:relative;background:transparent;overflow:hidden;}
.cb-left{background-image:url(/images/dogma-page-left.webp);background-size:100% 100%;background-repeat:no-repeat;}
.cb-right{background-image:url(/images/dogma-page-right.webp);background-size:100% 100%;background-repeat:no-repeat;}

/* ── Obsahový box = parchment safe-area (kožená väzba na vonkajšej strane).
   Tu sa ladí KDE môže text ísť. Každá strana má vlastnú page-triedu nižšie. ── */
/* Textová zóna = parchment plocha (odmeraná z PNG): väzba ~29% / chrbát ~14% /
   hore-dole ~12%. Symetrická cez chrbát. Obsah sa v nej centruje. */
.cb-content{position:absolute;inset:0;display:flex;flex-direction:column;color:#3a2204;font-family:'Cinzel',serif;}
.cb-left .cb-content{padding:12% 14% 12% 29%;}
.cb-right .cb-content{padding:12% 29% 12% 14%;}

/* ── strana 0: veľká pečať, centrovaná v zóne + nudge k chrbtu (vpravo) ── */
.cb-left .cb-seal-page{padding:11% 8% 11% 28%;transform:translateX(16px);}
.cb-seal-page{align-items:center;justify-content:center;}
.cb-seal-big{width:min(82%,210px);height:auto;opacity:.95;filter:drop-shadow(0 4px 12px rgba(90,58,12,.4));}

/* ── strana 1: nadpis + motto + body, centrované v zóne + nudge k chrbtu (vľavo) ── */
.cb-right .cb-title-page{padding:11% 28% 11% 8%;transform:translateX(-16px);}
.cb-title-page{align-items:center;justify-content:center;text-align:center;gap:5%;}
.cb-title{display:flex;flex-direction:column;gap:1px;margin:0;font-weight:700;line-height:1.1;font-size:min(clamp(15px,2.05vw,29px),calc(100cqi / (var(--n,1) * .7)));}
/* TEXT OSTÁVA V ZÓNE STRANY (16. 10. 2026, stráž check:popupy): flex s align-items:center dal
   motto a podnadpis na max-content — v ES/FR/EN siahali do ozdobného okraja strany. Riadky sa
   teraz zalomia v zóne a nadpis sa zmenší ROVNICOU zo šírky zóny (cqi) a najdlhšieho slova (--n). */
.cb-title-page{container-type:inline-size;}
.cb-title-page > *{max-width:100%;}
.cb-title em{font-style:italic;color:#9a6a16;}
.cb-title-brand{font-size:1.5em;line-height:1;color:#9a6a16;letter-spacing:.01em;}
.cb-trust{margin:0;font-size:clamp(10px,1.15vw,14px);letter-spacing:.22em;text-transform:uppercase;color:#7a531a;}
.cb-sub{margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(8px,0.9vw,11px);color:#6b4a18;max-width:26ch;line-height:1.45;}

/* ── strany 2-4: kapitoly — širšia zóna než titulná (dlhé názvy) ── */
.cb-left .cb-index-page{padding:12% 11% 12% 22%;transform:translateX(15px);}
.cb-right .cb-index-page{padding:12% 22% 12% 11%;transform:translateX(-30px);}
.cb-index-page{align-items:center;justify-content:center;gap:6%;}
.cb-page-head{font-size:clamp(11px,1.35vw,16px);letter-spacing:.16em;text-transform:uppercase;color:#7a531a;margin:0;text-align:center;}
.cb-chapters{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(5px,1.5vh,15px);align-self:center;width:max-content;max-width:100%;}
.cb-chapter{display:flex;align-items:baseline;gap:12px;}
.cb-ch-num{flex:0 0 auto;min-width:2.4em;font-weight:700;color:#9a6a16;font-size:clamp(9px,1.05vw,13px);text-align:right;}
.cb-ch-text{display:flex;flex-direction:column;line-height:1.14;align-items:flex-start;}
.cb-ch-name{font-weight:700;letter-spacing:.05em;font-size:clamp(11px,1.2vw,15px);color:#3a2204;white-space:nowrap;}
.cb-ch-desc{font-family:'Space Grotesk',sans-serif;font-style:italic;font-size:clamp(7px,0.8vw,10px);color:#6b4a18;text-align:left;}

/* ── strana 4-5: CTA, centrované — per-page nudge k stredu väzby ── */
.cb-cta-page{align-items:center;justify-content:center;text-align:center;gap:4%;}
.cb-left .cb-cta-page{transform:translateX(25px);}
.cb-right .cb-cta-page{transform:translateX(-25px);}
.cb-cta-kicker{margin:0;font-size:clamp(7px,0.85vw,10px);letter-spacing:.22em;text-transform:uppercase;color:#9a6a16;}
.cb-cta-head{margin:0;font-weight:700;line-height:1.05;font-size:clamp(14px,2vw,25px);color:#3a2204;}
.cb-cta-text{margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(8px,0.9vw,11px);color:#6b4a18;max-width:22ch;line-height:1.45;}
.cb-cta-btn{margin-top:3%;display:inline-block;padding:.62em 1.5em;border-radius:8px;font-family:'Cinzel',serif;font-weight:700;font-size:clamp(9px,1.05vw,13px);letter-spacing:.04em;text-decoration:none;color:#2a1a06;background:linear-gradient(135deg,#F5C73D,#E69E1A);border:1px solid rgba(250,244,236,.30);box-shadow:0 4px 14px rgba(90,58,12,.35);transition:transform .18s ease,box-shadow .18s ease;}
.cb-cta-btn:hover{transform:translateY(-2px);box-shadow:0 7px 20px rgba(90,58,12,.45);}
.cb-cta-link{font-family:'Cinzel',serif;font-size:clamp(10px,1.1vw,13px);letter-spacing:.06em;text-transform:uppercase;color:#7a531a;text-decoration:none;border-bottom:1px solid rgba(122,83,26,.4);padding-bottom:1px;transition:color .18s ease,border-color .18s ease;}
.cb-cta-link:hover{color:#9a6a16;border-color:rgba(154,106,22,.7);}

/* hint — zväčšený + jemný kontrastný podklad (2026-07-08, Matej OK), nech nezanikne vedľa cow/hektor scény */
.cb-hint{display:inline-flex;align-items:center;gap:9px;background:rgba(0,0,0,.32);border:1px solid rgba(201,154,63,.28);
  border-radius:20px;cursor:pointer;
  font-family:'Cinzel',serif;font-size:clamp(13px,1.6vw,17px);letter-spacing:.13em;text-transform:uppercase;
  color:#C99A3F;padding:8px 18px;animation:cbHint 2.6s ease-in-out infinite;}
.cb-hint-dot{width:7px;height:7px;border-radius:50%;background:#C99A3F;box-shadow:0 0 10px rgba(201,154,63,.7);}
@keyframes cbHint{0%,100%{opacity:.55;}50%{opacity:1;}}

/* nav */
.cb-nav{display:flex;gap:18px;}
.cb-arrow{width:42px;height:42px;border-radius:50%;border:1px solid rgba(201,154,63,.45);background:rgba(201,154,63,.06);
  color:#C99A3F;font-size:22px;line-height:1;cursor:pointer;transition:background .18s ease,transform .18s ease;}
.cb-arrow:hover:not(:disabled){background:rgba(201,154,63,.16);transform:translateY(-1px);}
.cb-arrow:disabled{opacity:.3;cursor:default;}
.cb-arrow-close{font-size:15px;}

@media (prefers-reduced-motion:reduce){
  .cb-halo,.cb-hint{animation:none;}
}
@media (max-width:767px){
  .cb-left .cb-content{padding:12% 10% 12% 17%;}
  .cb-right .cb-content{padding:12% 17% 12% 10%;}
  /* Mobile (2026-06-03): KNIHA fixne na rovnakej úrovni v OBOCH stavoch (closed == open) a nemenná.
     Trik: .cb-stage = jediný prvok vo flow (centrovaný) + fixný translateY; šípky/hint/CTA sú
     position:absolute (mimo flow) → nikdy neposunú knihu. --cb-h = výška knihy (inline z JS). */
  .cb-wrap{position:relative;}
  .cb-stage{transform:translateY(-60px);}
  .cb-hint{position:absolute;left:50%;top:calc(50% - 60px + var(--cb-h)/2 + 12px);transform:translateX(-50%);}
  /* Mobile (2026-06-03): TITLE strana — nadpis −15% −10% (20px → 15.3px) */
  .cb-title{font-size:min(15.3px,calc(100cqi / (var(--n,1) * .7)));}
  /* Mobile (2026-06-03): 2. dvojstrana (kapitoly) — obsah −15% −10% (scale 0.765) */
  .cb-chapters{transform:scale(0.765);}
  /* Mobile (2026-06-03): 3. dvojstrana (CTA) — obsah −15% (translateX nudge zachovaný) */
  .cb-left .cb-cta-page{transform:translateX(25px) scale(0.85);}
  .cb-right .cb-cta-page{transform:translateX(-25px) scale(0.85);}
  /* Mobile (2026-06-03): ľavý CTA body do 2 riadkov (menší font, plná šírka strany) */
  .cb-left .cb-cta-text{font-size:9px;max-width:none;}
  /* Mobile (2026-06-03): CTA tlačidlá — menšie (font+padding) ale zvýraznené (zlatý glow),
     posun do vonkajšej strany (ľavé doľava, pravé doprava ~5px po scale 0.85) */
  .cb-cta-btn{padding:.5em 10px;font-size:10px;
    border-color:rgba(250,244,236,.55);
    box-shadow:0 3px 10px rgba(90,58,12,.4),0 0 14px rgba(245,199,61,.5);}
  .cb-left .cb-cta-btn{transform:translateX(-6px);}
  .cb-right .cb-cta-btn{transform:translateX(6px);}
  /* Mobile (2026-06-03): posledná dvojstrana (CTA) — nadpis −10% (18.7px → 16.83px) */
  .cb-cta-head{font-size:16.83px;}
  /* Mobile (2026-06-03): šípky NAD knihou, 20px medzera, absolútne (nehýbu knihou) */
  .cb-nav{position:absolute;left:50%;top:calc(50% - 60px - var(--cb-h)/2 - 20px);transform:translate(-50%,-100%);margin:0;}
  /* Mobile (2026-06-03): in-page CTA tlačidlá skryté — vytiahnuté pod knihu (JSX .cb-mobile-cta) */
  .cb-cta-page .cb-cta-btn{display:none;}
  .cb-mobile-cta{position:absolute;left:50%;top:calc(50% - 60px + var(--cb-h)/2 + 16px);transform:translateX(-50%);
    display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;padding:0 16px;box-sizing:border-box;}
  .cb-mobile-cta .cb-cta-btn{display:inline-block;transform:none;width:100%;max-width:260px;text-align:center;
    font-size:14px;padding:.8em 2em;
    box-shadow:0 4px 14px rgba(90,58,12,.4),0 0 16px rgba(245,199,61,.5);}
}
`,Ui={cow:{cx:450,cy:168,rx:166,ry:34,tilt:7},hektor:{cx:590,cy:330,rx:150,ry:31,tilt:-6}},Vt={glow:"#C99A3F",mid:"#E8B24A",core:"#F7DFA0",hot:"#FFF0C8"};function ko({who:o}){const n=Ui[o],s={x:"-40%",y:"-160%",width:"180%",height:"420%"},c=p=>`codex-halo-${o}-${p}`;return e.jsxs("svg",{className:`codex-${o} codex-halo codex-halo-${o}`,viewBox:"0 0 960 1080",preserveAspectRatio:o==="cow"?"xMinYMax meet":"xMaxYMax meet","aria-hidden":!0,focusable:"false",children:[e.jsxs("defs",{children:[e.jsx("filter",{id:c("soft"),...s,children:e.jsx("feGaussianBlur",{stdDeviation:"20"})}),e.jsx("filter",{id:c("mid"),...s,children:e.jsx("feGaussianBlur",{stdDeviation:"7"})}),e.jsx("filter",{id:c("core"),...s,children:e.jsx("feGaussianBlur",{stdDeviation:"1.6"})})]}),e.jsx("g",{transform:`translate(${n.cx} ${n.cy}) rotate(${n.tilt})`,children:e.jsxs("g",{className:"codex-halo-scale",children:[e.jsx("ellipse",{rx:n.rx,ry:n.ry,fill:"none",stroke:Vt.glow,strokeWidth:"42",opacity:"0.58",filter:`url(#${c("soft")})`}),e.jsx("ellipse",{rx:n.rx,ry:n.ry,fill:"none",stroke:Vt.mid,strokeWidth:"17",opacity:"0.9",filter:`url(#${c("mid")})`}),e.jsx("ellipse",{rx:n.rx,ry:n.ry,fill:"none",stroke:Vt.core,strokeWidth:"5.5",filter:`url(#${c("core")})`}),e.jsx("ellipse",{rx:n.rx,ry:n.ry,fill:"none",stroke:Vt.hot,strokeWidth:"2"})]})})]})}const Wi=r.lazy(()=>yn(()=>import("./HektorBook-DTKphMlf.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))),yo="/images/codex3-hektor-v1.webp",wo={x:652,y:792},At=3,Zi="codex-spot-glow",va="codex-spot-grad",jo=100,Ji=`
/* Obal má rovnaký rám ako .codex-bleed (v ňom bývajú obe zvieratá), ale leží
   NAD obsahom filmu — inak sa na bodku nedá kliknúť. Priepustný pre myš je
   celý; citlivý je len terč okolo bodky. */
.codex-flow .codex-spotlayer {
  /* Geometria je ZHODNÁ s .codex-flow .codex-bleed a musí ňou ostať — je to
     druhý rám tých istých zvierat. Sticky (nie absolute) preto, že vo filme sa
     scrolluje a absolútnemu rámu by spodná hrana odscrollovala do obrazu;
     záporný spodný okraj mu ruší miesto v toku.
     ⚠️ position sa opakuje aj kvôli tomu, že .lab-papyrus > * z vízie a príbehu
     prebíja slabšie selektory — rovnaký dôvod, aký má pri sebe zapísaný bleed.
     z-index 6 je jediný rozdiel: vrstva leží NAD obsahom filmu, inak sa na
     bodku nedá kliknúť. */
  position: sticky;
  top: 0;
  left: 0;
  height: 100dvh;
  margin-bottom: -100dvh;
  pointer-events: none;
  z-index: 6;
}
/* Lesk prejde po psovi raz za ~9.5 s. Pomalšie a slabšie než na obálke knihy:
   Hektor je na obrazovke oveľa väčší, takže rovnaký čas pôsobí rýchlejšie. */
.codex-shine {
  opacity: var(--op-spot, 0);
  pointer-events: none;
  z-index: 2;
  -webkit-mask: url(${yo}) bottom right / contain no-repeat;
  mask: url(${yo}) bottom right / contain no-repeat;
  transition: opacity 700ms ease 320ms;
}
/* Maska = fotka 78 kB; vo filme sa ťahá až po guli (filmDefer.ts). */
html:not(.film-next):not(.film-eager) .op-root .codex-shine { -webkit-mask: none; mask: none; opacity: 0; }
.codex-shine::before {
  content: '';
  position: absolute;
  top: -25%;
  left: 0;
  width: 58%;
  height: 150%;
  /* 🔴 SMER GRADIENTU MUSÍ BYŤ CEZ ŠÍRKU PRUHU, NIE 105deg. Kniha má obálku
     takmer štvorcovú, takže jej 105deg vyzerá ako lesk. Tu je pruh 58 % šírky
     a 150 % výšky psa, čiže vysoký a úzky — pri 105deg vedie os gradientu
     takmer zvisle, prechod sa minie na výšku a po šírke ostane plocha bez
     zmeny. Odmerané: cez psa prešiel priehľadný obdĺžnik s ostrými zvislými
     hranami, nie svetlo. Sklon drží rotate() na transforme, nie uhol gradientu. */
  background: linear-gradient(to right, rgba(255,249,224,0) 0%, rgba(255,249,224,0.22) 50%, rgba(255,249,224,0) 100%);
  transform: translateX(-170%) rotate(6deg);
  animation: codexShineSweep 9.5s ease-in-out 1.2s infinite;
  will-change: transform;
}
@keyframes codexShineSweep {
  0% { transform: translateX(-170%) rotate(6deg); }
  40%, 100% { transform: translateX(330%) rotate(6deg); }
}

/* Bodka. Vrstva je priepustná pre myš, citlivý je len terč okolo bodky —
   inak by neviditeľný obdĺžnik cez pol obrazovky zožral kliky na CTA. */
.codex-spot {
  opacity: var(--op-spot, 0);
  pointer-events: none;
  z-index: 3;
  transition: opacity 700ms ease 480ms;
}
.codex-spot-hit { pointer-events: auto; cursor: pointer; }
.codex-spot-pulse {
  animation: codexSpotPulse 3.1s ease-in-out infinite;
  /* fill-box, inak by percentuálny stred rátal z celého viewBoxu fotky. */
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes codexSpotPulse {
  0%, 100% { opacity: 0.55; transform: scale(0.92); }
  50%      { opacity: 1;    transform: scale(1.12); }
}
/* PING — prstenec, ktorý sa rozbieha a zaniká. Samotné dýchanie bodky Matej
   prehliadol (*„urob mu aj pulz lebo som si to ani nevšimol"*): zmena krytia
   na jednom kruhu je pohyb, ktorý oko periférne nezachytí, rozbiehajúci sa
   kruh áno. */
.codex-spot-ping {
  transform-box: fill-box;
  transform-origin: center;
  animation: codexSpotPing 2.6s cubic-bezier(0.16, 0.7, 0.3, 1) infinite;
}
@keyframes codexSpotPing {
  0%   { transform: scale(0.6); opacity: 0; }
  18%  { opacity: 0.75; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* ── ZÁBLESK: LESK NEODÍDE, KÝM NEROZSVIETI BODKU ─────────────────────────
   Matej 28. 8.: *„posledný pulz ktorý by mal ísť už preč — tak osvieti ten
   hotspot a až potom pôjde ďalej, lebo mám pocit že sa to dá prehliadnuť
   a preletieť."* Bodka teda nesvieti vlastným tempom vedľa lesku — rozžiari
   sa presne vtedy, keď cez ňu pruh prechádza.

   🔑 FÁZA SA POČÍTA, NEHÁDA. Obe animácie majú rovnakú dĺžku aj odklad, takže
   držia krok navždy. Pruh je 58 % šírky rámu a jeho stred prejde od -501 do
   1587 px (rám 720 px) počas prvých 40 % cyklu; bodka leží na 652/960 fotky,
   teda na 489 px rámu ⇒ pruh je nad ňou po (489 + 501) / 2088 = 47 % svojej
   dráhy, čiže v 19 % cyklu. Preto je vrchol zábleskul práve tam.
   ⚠️ Kto zmení SPOT.x, šírku pruhu alebo dĺžku sweepu, prepočíta aj toto. */
.codex-spot-flare {
  transform-box: fill-box;
  transform-origin: center;
  animation: codexSpotFlare 9.5s ease-in-out 1.2s infinite;
}
@keyframes codexSpotFlare {
  0%, 12%   { opacity: 0;   transform: scale(0.8); }
  19%       { opacity: 0.9; transform: scale(1.35); }
  30%, 100% { opacity: 0;   transform: scale(1.6); }
}
/* Prehliadač kreslí okolo <circle> s tabindex pravouhlý modrý rám — na
   fotke psa vyzerá ako chyba. Vypína sa pre KAŽDÝ fokus (aj myšou), ale
   klávesnica dostane vlastný prstenec v našej farbe. */
.codex-spot-hit:focus { outline: none; }
.codex-spot-hit:focus-visible + .codex-spot-ring { opacity: 0.85; }


@media (prefers-reduced-motion: reduce) {
  .codex-shine::before { display: none; }
  .codex-spot-pulse { animation: none; opacity: 0.9; }
  .codex-spot-ping, .codex-spot-flare { display: none; }
}
`;function qi(){const o=_e(),[n,s]=r.useState(!1),c=r.useCallback(()=>s(!0),[]),p=r.useCallback(()=>s(!1),[]),l=o("religion.spot.hint");return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"codex-hektor codex-shine","aria-hidden":!0}),e.jsxs("svg",{className:"codex-hektor codex-spot",viewBox:"0 0 960 1080",preserveAspectRatio:"xMaxYMax meet",focusable:"false",children:[e.jsxs("defs",{children:[e.jsx("filter",{id:Zi,x:"-120%",y:"-120%",width:"340%",height:"340%",children:e.jsx("feGaussianBlur",{stdDeviation:10*At})}),e.jsxs("radialGradient",{id:va,children:[e.jsx("stop",{offset:"0%",stopColor:"#FFF6E2",stopOpacity:"0.50"}),e.jsx("stop",{offset:"42%",stopColor:"#FFE9BE",stopOpacity:"0.20"}),e.jsx("stop",{offset:"100%",stopColor:"#FFE9BE",stopOpacity:"0"})]})]}),e.jsxs("g",{transform:`translate(${wo.x} ${wo.y})`,children:[e.jsxs("g",{className:"codex-spot-pulse",children:[e.jsx("circle",{r:46*At,fill:`url(#${va})`}),e.jsx("circle",{r:8.5*At,fill:"#FFF6E2"})]}),e.jsx("circle",{className:"codex-spot-ping",r:19*At,fill:"none",stroke:"rgba(255,240,205,0.7)",strokeWidth:2.5*At}),e.jsx("circle",{className:"codex-spot-flare",r:34*At,fill:`url(#${va})`}),e.jsx("circle",{className:"codex-spot-hit",r:jo,fill:"transparent",role:"button",tabIndex:0,"aria-label":l,onClick:c,onKeyDown:f=>{f.key!=="Enter"&&f.key!==" "||(f.preventDefault(),c())},children:e.jsx("title",{children:l})}),e.jsx("circle",{className:"codex-spot-ring",r:jo-8,fill:"none",stroke:"#FFF3D6",strokeWidth:"3",opacity:"0"})]})]}),n&&e.jsx(r.Suspense,{fallback:null,children:e.jsx(Wi,{onClose:p})})]})}let mt=!1;const zt=new Set;function Xi(){return mt?{}:{loading:"lazy","data-film-defer":""}}function zo(){mt||typeof document>"u"||(mt=!0,document.documentElement.classList.add("film-eager"),document.querySelectorAll("img[data-film-defer]").forEach(o=>{o.loading="eager"}),zt.forEach(o=>o()),zt.clear())}function Zr(o){mt?o():zt.add(o)}function Qi(){const[o,n]=r.useState(mt);return r.useEffect(()=>{if(mt){n(!0);return}const s=()=>n(!0);return zt.add(s),()=>{zt.delete(s)}},[]),o}const er=["/images/codex3-cow-nohalo.webp","/images/codex3-hektor-v1.webp"];let Jt=!1;const qt=new Set;function tr(){Jt||typeof document>"u"||(Jt=!0,document.documentElement.classList.add("film-next"),qt.forEach(o=>o()),qt.clear())}function ar(){const[o,n]=r.useState(Jt||mt);return r.useEffect(()=>{if(Jt||mt){n(!0);return}const s=()=>n(!0);return qt.add(s),zt.add(s),()=>{qt.delete(s),zt.delete(s)}},[]),o}function Jr(){if(mt)return()=>{};let o=!1,n=0;const s=()=>{if(o)return;o=!0,tr();const p=er.map(l=>new Promise(f=>{const m=new Image;m.fetchPriority="high",m.onload=m.onerror=()=>f(),m.src=l}));n=window.setTimeout(zo,4e3),Promise.all(p).then(()=>{window.clearTimeout(n),n=window.setTimeout(zo,300)})};window.addEventListener("dogypt:planet-ready",s,{once:!0}),window.addEventListener("touchstart",s,{once:!0,passive:!0}),window.addEventListener("wheel",s,{once:!0,passive:!0}),window.addEventListener("keydown",s,{once:!0});const c=window.setTimeout(()=>{s()},12e3);return()=>{window.clearTimeout(n),window.clearTimeout(c),window.removeEventListener("dogypt:planet-ready",s),window.removeEventListener("touchstart",s),window.removeEventListener("wheel",s),window.removeEventListener("keydown",s)}}const or=!1;function nr(o,n){const s=[];let c=n;for(const[p,l]of o.split("**").entries()){const f=p%2===1;for(const m of l)s.push(e.jsx("span",{className:f?"v2-ch v2-gold":"v2-ch",style:{"--i":c},children:m},c)),c+=1}return{nodes:s,next:c}}function qr({embedded:o=!1,flow:n=!1,onOpenBook:s,onChipNext:c,onChipBook:p}={}){const l=_e(),f=ar(),m=!o||f,[y,N]=r.useState(0),[O,x]=r.useState(()=>new Set),F=r.useRef(null),j=r.useRef([]);r.useEffect(()=>{const t=n?null:F.current;if(!n&&!t)return;const a=j.current.filter(Boolean),i=new IntersectionObserver(h=>{for(const b of h){if(!b.isIntersecting)continue;const w=Number(b.target.dataset.idx);x(A=>A.has(w)?A:new Set(A).add(w)),!n&&b.intersectionRatio>=.55&&N(w)}},n?{root:null,threshold:0,rootMargin:"-15% 0px -15% 0px"}:{root:t,threshold:[.55]});a.forEach(h=>i.observe(h));let d=null;return n&&(d=new IntersectionObserver(h=>{for(const b of h)b.isIntersecting&&N(Number(b.target.dataset.idx))},{root:null,threshold:0,rootMargin:"-45% 0px -45% 0px"}),a.forEach(h=>d.observe(h))),()=>{i.disconnect(),d==null||d.disconnect()}},[n]),r.useEffect(()=>{if(!n)return;const t=j.current.filter(Boolean);if(!t.length)return;const a=A=>Array.from(A.querySelectorAll(":scope > .codex-slider > .codex-slide > *")).some(H=>(parseFloat(getComputedStyle(H).opacity)||0)>.01);let i=0;const d=()=>{i=0;for(const A of t)A.style.pointerEvents=a(A)?"":"none"};let h=0,b=0;const w=()=>{if(i||h)return;const A=Math.max(0,150-(performance.now()-b));h=window.setTimeout(()=>{h=0,b=performance.now(),i=requestAnimationFrame(d)},A)};return d(),window.addEventListener("scroll",w,{passive:!0}),window.addEventListener("resize",w),()=>{i&&cancelAnimationFrame(i),h&&clearTimeout(h),window.removeEventListener("scroll",w),window.removeEventListener("resize",w);for(const A of t)A.style.pointerEvents=""}},[n]);const v=t=>{var a;(a=j.current[t])==null||a.scrollIntoView({behavior:"smooth"})},[_,Z]=r.useState(1);r.useEffect(()=>{},[]);const L=(()=>{const t=["religion.v2.l1","religion.v2.l2","religion.v2.l3","religion.v2.l4"];let a=0;return{lines:t.map(d=>{const h=nr(l(d),a);return a=h.next,a+=4,h.nodes}),total:a}})(),R=L.total,z=e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"codex-v2",children:L.lines.slice(0,3).map((t,a)=>e.jsx("span",{className:"v2-line",children:t},a))}),e.jsxs("div",{className:"codex-cta-cluster codex-v2-cta",children:[e.jsx("p",{className:"codex-v2-close",children:e.jsx("span",{className:"v2-line",children:L.lines[3]})}),e.jsx(vt,{to:"/heroglyph/name",className:"codex-cta",children:l("religion.cta")})]})]});return e.jsxs("div",{className:`lab-papyrus codex-page flex flex-col relative ${n?"codex-flow h-auto":`overflow-hidden ${o?"h-full":"h-[100dvh]"}`}`,children:[!o&&e.jsx(Xt,{path:"/religion-lab",title:"Dogyptism — The Dog Religion | DOGYPT",description:"Dogyptism: a syncretic faith where every dog is sacred. Read the constitution — five layers, twelve chapters. In Dog We Trust."}),e.jsx("div",{"aria-hidden":!0,style:{position:"absolute",inset:0,background:Le.pageVeil,zIndex:0,pointerEvents:"none"}}),e.jsxs("div",{className:`codex-bleed ${y===0?"active":""}`,style:{"--halo-delay":`${_===1?2700:R*18+500}ms`},"aria-hidden":!0,children:[e.jsx(ko,{who:"cow"}),e.jsx("img",{src:m?"/images/codex3-cow-nohalo.webp":void 0,alt:"",className:"codex-cow"}),e.jsx(ko,{who:"hektor"}),e.jsx("img",{src:m?"/images/codex3-hektor-v1.webp":void 0,alt:"",className:"codex-hektor"})]}),n&&e.jsx("div",{className:"codex-spotlayer",children:e.jsx(qi,{})}),e.jsx("style",{children:`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s WALL LABom).
           position:fixed na podklade je zámer prevzatý z .dark-bg::before —
           tabuľa sa drží OKNA, nie výšky obsahu.
           (Bez spätných apostrofov: celý blok je JS template literal.) */
        .lab-papyrus { position: relative; background-color: ${Le.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100lvh;
          background: ${Le.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* Vertikálny scroll-snap kontajner — klasický scroll, fix obrazovka per sekcia.
           Stránka ostáva 100dvh + overflow-hidden → pozadie sa NEzväčšuje; scrolluje len toto. */
        .codex-scroll {
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          overflow-y: scroll;
          overflow-x: hidden;
          /* Bez scroll-anchoringu — keď sa na 3. dvojstrane zjavia CTA tlačidlá pod knihou,
             zmena výšky obsahu nesmie skokom presunúť scroll (predtým „vrátilo na hero"). */
          overflow-anchor: none;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          position: relative;
          z-index: 2;
        }
        .codex-scroll::-webkit-scrollbar { display: none; }
        .codex-section {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
        }
        .codex-slider {
          position: relative;
          width: 100%;
          max-width: 880px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          padding: 0 clamp(12px, 2vw, 24px);
        }
        .codex-slide {
          flex: 0 0 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(20px, 3vh, 40px) clamp(8px, 2vw, 24px);
          text-align: center;
        }
        .codex-slider .codex-slide > * + * {
          margin-top: clamp(28px, 4.5vh, 48px);
        }
        /* Sacred Index slide = Constitution kniha (flipbook) → širší priestor, menší padding */
        .codex-slider-book { max-width: 1120px; }
        .codex-slider-book .codex-slide { padding: clamp(8px, 1.6vh, 18px) clamp(6px, 1.5vw, 16px); }
        /* Nadpis nad knihou (2026-06-03, PC + mobile) — absolútne hore v sekcii, mimo
           layout knihy → knihu neposúva. */
        .codex-book-title {
          position: absolute;
          top: clamp(12px, 3vh, 34px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 7;
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1rem, 2.28vw, 1.8rem);
          /* headroom pre diakritiku (Biblia/Bible/psíčkarov) — background-clip:text inak oseká accent */
          line-height: 1.18; padding-top: 0.14em;
          letter-spacing: 0.05em;
          text-align: center;
          white-space: nowrap;
          pointer-events: none;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        @media (max-width: 767px) {
          .codex-book-title { top: 14px; font-size: 1.05rem; letter-spacing: 0.04em; }
        }

        /* ── Scroll-reveal animácie (rešpektuje prefers-reduced-motion) ──
           Pokojový stav = identity transform → locked layout zostáva nedotknutý. */
        @media (prefers-reduced-motion: no-preference) {
          .codex-section .codex-slide:not(.codex-slide-3) {
            opacity: 0;
            transform: translateY(34px);
            transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          .codex-section.in-view .codex-slide:not(.codex-slide-3) {
            opacity: 1;
            transform: none;
          }
          /* Hero (cow vs dog): staggered reveal jednotlivých riadkov overlayu */
          .codex-3-overlay > * {
            opacity: 0;
            transform: translateY(26px);
            transition: opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          .codex-section.in-view .codex-3-overlay > * { opacity: 1; transform: none; }
          /* Rytmus je dramaturgia, nie ozdoba (Matej 27. 8. 2026: „nech je to
             zaujímavejšie = postupné odhaľovanie/čítanie textu"). Odstupy kopírujú
             stavbu argumentu, nie rovnomerný stagger:
               1–2 krava · 3–4 pes (pauza pred druhou stranou)
               5 obvinenie (najväčšia pauza — má doraziť do ticha) · 6 CTA
             ⚠️ Vo filme (/onepage) TOTO NEPLATÍ: tam odhaľovanie riadi scroll cez
             --op-txt, viď .codex-flow nižšie. Dva časovače na tom istom texte by
             sa bili. */
          /* VARIANT 1 — štyri bloky: krava · pes · YET. · CTA.
             Pauza pred „YET." je najväčšia zámerne — obrat má doraziť do ticha,
             nie v rade s faktami. CTA ide až za ním. */
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(1) { transition-delay: 80ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(2) { transition-delay: 520ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(3) { transition-delay: 1180ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(4) { transition-delay: 1760ms; }
          /* Variant 2 (odsek, ktorý sa píše) má dva bloky a vlastné tempo — jeho
             odstupy sa zmenou variantu 1 nesmú pohnúť. */
          .codex-section.in-view .codex-3-overlay.is-v2 > *:nth-child(1) { transition-delay: 80ms; }
          .codex-section.in-view .codex-3-overlay.is-v2 > *:nth-child(2) { transition-delay: 300ms; }
        }

        /* Landscape-short fallback: dark-bg ide na height:auto (index.css) → necháme
           prirodzený scroll bez snapu, aby sa obsah dal prečítať. */
        @media (orientation: landscape) and (max-height: 600px) {
          .codex-scroll { overflow: visible; height: auto; scroll-snap-type: none; }
          .codex-section { height: auto; min-height: 100dvh; }
        }

        /* ── Slide 1 ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 1 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-headline {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.71rem, 6.5vw, 5.05rem);
          letter-spacing: 0.04em;
          line-height: 1.02;
          margin: 0;
          text-transform: uppercase;
          color: rgba(35,22,8,0.90);
        }
        .codex-headline .grad {
          display: block;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        .codex-headline .line {
          display: block;
        }
        .codex-preamble-wrap {
          position: relative;
          width: 100%;
          max-width: 820px;
          padding: clamp(26px, 3.6vh, 44px) clamp(34px, 5vw, 60px);
        }
        /* Sacred frame — 4 double-line L corners + diamond accent */
        .codex-frame {
          position: absolute;
          width: clamp(32px, 4.6vw, 48px);
          height: clamp(32px, 4.6vw, 48px);
          pointer-events: none;
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.22));
        }
        .codex-frame.tl { top: 0; left: 0;
          border-top: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.tr { top: 0; right: 0;
          border-top: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        .codex-frame.bl { bottom: 0; left: 0;
          border-bottom: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.br { bottom: 0; right: 0;
          border-bottom: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        /* inner offset L — second parallel line */
        .codex-frame::before {
          content: '';
          position: absolute;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          border-style: solid;
          border-color: rgba(201,154,63,0.72);
          border-width: 0;
        }
        .codex-frame.tl::before { top: 5px; left: 5px;
          border-top-width: 1px; border-left-width: 1px;
        }
        .codex-frame.tr::before { top: 5px; right: 5px;
          border-top-width: 1px; border-right-width: 1px;
        }
        .codex-frame.bl::before { bottom: 5px; left: 5px;
          border-bottom-width: 1px; border-left-width: 1px;
        }
        .codex-frame.br::before { bottom: 5px; right: 5px;
          border-bottom-width: 1px; border-right-width: 1px;
        }
        /* outer diamond accent at the corner vertex */
        .codex-frame::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #A3782B;
          transform: rotate(45deg);
          box-shadow: 0 1px 3px rgba(110,71,16,0.35);
        }
        .codex-frame.tl::after { top: -3.5px; left: -3.5px; }
        .codex-frame.tr::after { top: -3.5px; right: -3.5px; }
        .codex-frame.bl::after { bottom: -3.5px; left: -3.5px; }
        .codex-frame.br::after { bottom: -3.5px; right: -3.5px; }
        @media (max-width: 767px) {
          /* Mobile (2026-06-03): zúžiť rámik znenia ústavy */
          .codex-preamble-wrap { padding: 18px 20px; max-width: 320px; margin: 0 auto; }
          .codex-frame { width: 24px; height: 24px; }
          .codex-frame::before { width: calc(100% - 10px); height: calc(100% - 10px); }
          .codex-frame.tl::before { top: 4px; left: 4px; }
          .codex-frame.tr::before { top: 4px; right: 4px; }
          .codex-frame.bl::before { bottom: 4px; left: 4px; }
          .codex-frame.br::before { bottom: 4px; right: 4px; }
        }
        .codex-preamble-text {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.09rem, 1.66vw, 1.47rem);
          line-height: 1.55;
          letter-spacing: 0.02em;
          color: rgba(35,22,8,0.82);
          margin: 0;
          text-wrap: balance;
        }
        .codex-preamble-text strong {
          font-weight: 700;
          font-style: italic;
          color: #8a5a14;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        .codex-oath-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.59rem, 0.9vw, 0.72rem);
          letter-spacing: 0.36em;
          color: rgba(201,154,63,0.7);
          text-transform: uppercase;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.6vw, 16px);
        }
        .codex-oath-label::before,
        .codex-oath-label::after {
          content: '';
          height: 1px;
          width: clamp(22px, 3.4vw, 40px);
          background: rgba(201,154,63,0.5);
        }
        .codex-slider .codex-slide > .codex-oath-label {
          margin-top: clamp(14px, 2vh, 22px);
        }
        /* ── RIADOK NAD MOTTOM (len režim filmu) ─────────────────────────
           Vzor je .religion-eyebrow z pages/Entry.tsx: Space Grotesk 500,
           veľké písmená, široké preloženie. Zámerne NIE Cinzel — Cinzel je
           v tejto sekcii identita (motto, prísaha) a keby ho mala aj táto veta,
           čítala by sa ako ďalší nadpis, nie ako poznámka o čitateľovi.
           ⚠️ Space Grotesk je načítaný len vo váhach 300–600; 700 by bol
           falošný tučný (pravidlo v CLAUDE.md). */
        .codex-eyebrow {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(0.62rem, 0.86vw, 0.78rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(122,90,42,0.78);
          margin: 0;
          /* JEDEN RIADOK (Matej 28. 8. 2026: „v jednom riadku a čo najkratší").
             nowrap je tu poistka, nie náhrada za krátky text — keby veta
             narástla, radšej nech pretečie viditeľne, než aby sa ticho zalomila
             a rozbila rytmus troch prvkov nad sebou. */
          white-space: nowrap;
          line-height: 1.4;
          /* ODDELENÝ HORIZONTÁLKOU (to isté zadanie). Čiara je ::after, nie
             samostatný prvok: patrí k riadku, takže s ním má aj nabiehať —
             ako vlastný súrodenec by potrebovala vlastnú premennú a rozišla by
             sa s ním pri prvom ladení. Vybledá do strán rovnako ako .codex-rule
             na papyruse, aby nekončila ostrým rezom. */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(9px, 1.5vh, 14px);
        }
        .codex-eyebrow::after {
          content: '';
          display: block;
          width: clamp(58px, 8vw, 104px);
          height: 1px;
          background: linear-gradient(90deg,
            rgba(201,154,63,0) 0%, rgba(201,154,63,0.72) 50%, rgba(201,154,63,0) 100%);
        }
        @media (max-width: 767px) {
          .codex-eyebrow { font-size: 0.58rem; letter-spacing: 0.16em; }
        }
        /* ── CTA JE LAPIS, NIE ZLATÉ ──────────────────────────────────────
           Matej 28. 8. 2026: *„CTA má byť v lapise (náš nový brand — poznač si
           to už)."* Tým sa zrušil dovtedajší hold z 26. 8. („zatiaľ to
           nezapisuj") a lapis prešiel z pracovného návrhu do kánonu.
           Farby sa NEOPISUJÚ — sú v LAPIS v navGoldSkin.ts.
           Zlaté písmo na modrom nie je ozdoba: lapis + zlato je pôvodná
           egyptská dvojica a bez nej je z toho len tmavé tlačidlo.
           Tvar (radius 8, nie pilulka) ostáva z locku .btn-gold — menila sa
           výplň, nie geometria. */
        .codex-book-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.72rem, 1.05vw, 0.86rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: clamp(9px, 1.5vh, 13px) clamp(18px, 2.4vw, 28px);
          white-space: nowrap;
          border: 1px solid ${Y.edge};
          border-radius: 8px;
          background: ${Y.grad};
          color: ${Y.ink};
          box-shadow: ${wt};
          cursor: pointer;
          transition: background 220ms ease, transform 220ms ease;
        }
        .codex-book-cta:hover { background: ${Y.gradHover}; transform: translateY(-1px); }
        @media (max-width: 767px) {
          .codex-preamble-text { font-size: 14px; line-height: 1.4; }
          .codex-headline { font-size: 2.8rem; letter-spacing: 0.03em; line-height: 1.04; }
          .codex-slider { padding: 0 clamp(8px, 2vw, 16px); }
          .codex-slide { padding: clamp(12px, 2vh, 24px) clamp(4px, 1.5vw, 12px); }
          /* Mobile (2026-06-03): preamble (znenie ústavy + rámik) — zúžiť + posunúť hore.
             Scoped na preamble slide = .codex-slider (nie -book) + .codex-slide (nie -3). */
          .codex-slider:not(.codex-slider-book) .codex-slide:not(.codex-slide-3) {
            justify-content: flex-start;
            padding-top: clamp(24px, 6vh, 56px);
          }
          /* Zúžiť vertikálny odstup medzi headline / rámikom / oath (len preamble má >1 child) */
          .codex-slider:not(.codex-slider-book) .codex-slide:not(.codex-slide-3) > * + * {
            margin-top: clamp(18px, 3vh, 28px);
          }
        }

        /* ── Slide 2: papyrus + index ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 2 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-paper {
          position: relative;
          width: 100%;
          max-width: 980px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 14px;
          padding: clamp(22px, 3vh, 34px) clamp(26px, 4.5vw, 48px) clamp(20px, 2.6vh, 28px);
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201,154,63,0.20);
          display: flex;
          flex-direction: column;
        }
        /* Inner double-border cert frame */
        .codex-paper::after {
          content: '';
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 9px;
          pointer-events: none;
        }
        .codex-paper-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 2.6vw, 28px);
          padding-bottom: clamp(14px, 1.8vh, 22px);
          margin-bottom: clamp(12px, 1.6vh, 18px);
          border-bottom: 1px solid rgba(138,90,20,0.28);
          position: relative;
        }
        /* Decorative diamond on the divider line */
        .codex-paper-header::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 7px;
          height: 7px;
          background: #C99A3F;
          transform: translateX(-50%) rotate(45deg);
          box-shadow:
            0 0 8px rgba(201,154,63,0.6),
            inset 0 0 0 1px rgba(255,236,200,0.5);
        }
        .codex-seal-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        /* Radial gold aura behind seal */
        .codex-seal-wrap::before {
          content: '';
          position: absolute;
          inset: -18%;
          background:
            radial-gradient(closest-side,
              rgba(245,199,61,0.32) 0%,
              rgba(245,199,61,0.18) 38%,
              rgba(245,199,61,0) 72%);
          z-index: 0;
          pointer-events: none;
        }
        .codex-seal {
          position: relative;
          z-index: 1;
          width: clamp(108px, 13vw, 144px);
          height: auto;
          filter: drop-shadow(0 2px 5px rgba(110,71,16,0.45));
        }
        .codex-paper-titles {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .codex-paper-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.95rem, 3.6vw, 2.95rem);
          letter-spacing: 0.04em;
          line-height: 0.98;
          color: #5a3a0c;
          margin: 0;
        }
        .codex-paper-title span {
          display: block;
          white-space: nowrap;
        }
        .codex-paper-title .title-decor {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-style: normal;
          font-weight: 700;
        }
        .codex-paper-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-size: clamp(0.7rem, 0.92vw, 0.82rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
          color: rgba(110,71,16,0.78);
          margin: clamp(8px, 1vh, 12px) 0 0;
          text-align: left;
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .codex-paper {
            padding: 18px 14px 28px;
            max-width: 100%;
            box-sizing: border-box;
          }
          .codex-paper::after { inset: 5px; border-radius: 8px; }
          .codex-paper-header {
            gap: 12px;
            padding-bottom: 12px;
            margin-bottom: 12px;
            flex-wrap: nowrap;
          }
          .codex-paper-titles { min-width: 0; flex: 1 1 auto; }
          .codex-seal { width: 92px; }
          .codex-paper-title { font-size: 1.45rem; letter-spacing: 0.02em; }
          .codex-paper-title span { white-space: normal; }
          /* Mobile: title v 3 riadkoch — The / Dogyptian / Constitution */
          .codex-paper-title .title-decor { display: block; }
          .codex-paper-subtitle {
            font-size: 0.6rem;
            margin-top: 6px;
            letter-spacing: 0.01em;
            white-space: normal;
          }
        }

        .codex-index {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: clamp(20px, 3vw, 40px);
          font-family: 'Cinzel', serif;
          font-size: clamp(0.74rem, 1vw, 0.86rem);
          letter-spacing: 0.04em;
          text-align: left;
          /* Index — natural height, no overflow clipping (bubbles musia presahovať) */
        }
        .codex-index .col {
          display: flex;
          flex-direction: column;
        }
        .codex-row {
          border-bottom: 1px solid rgba(138,90,20,0.20);
          position: relative;
        }
        .codex-row.open {
          z-index: 30;
        }
        .codex-index .col .codex-row:last-child { border-bottom: none; }
        .codex-row-head {
          appearance: none;
          background: transparent;
          border: none;
          padding: 5px 6px;
          width: 100%;
          cursor: pointer;
          display: grid;
          grid-template-columns: 2.4em 1fr;
          align-items: baseline;
          column-gap: 0.4em;
          text-align: left;
          font: inherit;
          color: inherit;
          border-radius: 4px;
          transition: background 160ms ease;
          white-space: nowrap;
        }
        .codex-row-head:hover {
          background: rgba(201,154,63,0.10);
        }
        /* .open highlight len pre touch devices — na PC sa .open class síce nastaví
           cez onClick, ale ZIADNE visual side-effecty (bublina + highlight) */
        @media (hover: none) {
          .codex-row.open .codex-row-head {
            background: rgba(201,154,63,0.14);
          }
        }
        .codex-index .num {
          color: rgba(138,90,20,0.62);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .codex-index .item {
          display: inline;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .codex-index .item .name {
          color: #6e4710;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .codex-index .item .desc {
          color: rgba(38,22,4,0.62);
          font-weight: 400;
          font-style: italic;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .codex-index .item .dash {
          color: rgba(38,22,4,0.34);
          margin: 0 0.32em;
        }
        /* ── PC: bubble tooltip pattern (like /vision pills) ──
           Floating papyrus card with arrow pointing to row.
           Smart flip: rows 1-3 = bubble BELOW (arrow up), rows 4-6 = bubble ABOVE (arrow down). */
        .codex-row-body {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: calc(100% + 10px);
          width: max-content;
          min-width: 180px;
          max-width: clamp(220px, 22vw, 300px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow:
            0 8px 28px rgba(110,71,16,0.24),
            0 0 0 3px rgba(201,154,63,0.18);
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 180ms ease;
          text-align: left;
        }
        /* Arrow — default: pointing UP (bubble below row) */
        .codex-row-body::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-bottom-color: #C99A3F;
        }
        /* Bottom rows (4, 5, 6) — flip bubble ABOVE row, arrow points DOWN */
        .codex-index .col .codex-row:nth-child(n+4) .codex-row-body {
          top: auto;
          bottom: calc(100% + 10px);
        }
        .codex-index .col .codex-row:nth-child(n+4) .codex-row-body::after {
          bottom: auto;
          top: 100%;
          border-bottom-color: transparent;
          border-top-color: #C99A3F;
        }
        .codex-row.open,
        .codex-row:hover,
        .codex-row:focus-within {
          z-index: 50;
        }
        /* PC (hover-capable): trigger LEN cez hover — žiadny focus/click effect */
        @media (hover: hover) and (pointer: fine) {
          .codex-row:hover .codex-row-body {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
        }
        /* Touch devices (mobile): tap-toggle cez .open class */
        @media (hover: none) {
          .codex-row.open .codex-row-body {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
        }
        .codex-row-body-inner {
          /* no overflow:hidden in bubble mode */
        }
        .codex-row-body ul {
          list-style: none;
          margin: 0;
          padding: 0 0 0 12px;
        }
        .codex-row-body li {
          font-family: 'Cinzel', serif;
          font-size: 0.85em;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: #5a3a0c;
          padding: 3px 0;
          position: relative;
        }
        .codex-row-body li::before {
          content: '·';
          color: #C99A3F;
          position: absolute;
          left: -10px;
          font-weight: 700;
          font-size: 1.1em;
        }
        @media (max-width: 767px) {
          .codex-index {
            grid-template-columns: 1fr 1fr;
            font-size: 11px;
            column-gap: 10px;
          }
          .codex-index .col .codex-row:last-child { border-bottom: 1px solid rgba(138,90,20,0.20); }
          .codex-index .col:last-child .codex-row:last-child { border-bottom: none; }
          .codex-row-head {
            grid-template-columns: 1.8em minmax(0, 1fr);
            padding: 6px 3px;
            column-gap: 0.3em;
            white-space: nowrap;
          }
          /* Mobile: len nadpisy */
          .codex-index .item .desc,
          .codex-index .item .dash { display: none; }
          /* Mobile bubble — per-col anchoring aby NEPRESVITALA do druhých slajdov.
             Left col → anchor LEFT to row left, right col → anchor RIGHT to row right.
             Width capped na 80vw / 300px aby zostala v slide viewporte.
             Arrow off na mobile (per-col anchoring misaligns arrow vs row center). */
          .codex-row-body {
            width: min(80vw, 300px);
            min-width: 0;
            max-width: none;
            padding: 11px 14px;
          }
          .codex-index .col:first-child .codex-row-body {
            left: 0;
            right: auto;
            transform: none;
          }
          .codex-index .col:last-child .codex-row-body {
            left: auto;
            right: 0;
            transform: none;
          }
          .codex-row-body::after {
            display: none;
          }
        }

        /* CTA button — Read Full Constitution */
        .codex-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: clamp(16px, 2.2vh, 24px);
        }
        .codex-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(11px, 1.5vh, 15px) clamp(26px, 4.5vw, 42px);
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          color: #3a2204;
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-size: clamp(0.74rem, 1vw, 0.9rem);
          letter-spacing: 0.24em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 8px;
          border: 1.5px solid rgba(110,71,16,0.45);
          box-shadow:
            0 5px 16px rgba(110,71,16,0.4),
            inset 0 1px 0 rgba(255,255,255,0.45),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
          cursor: pointer;
          white-space: nowrap;
        }
        /* ── HLAVNÉ CTA NA BLEDOM POVRCHU = LAPIS, NIE ZLATO ──────────────
           Matej 27. 8. 2026: *„čerpáš CTA zo starého brandu, už máme lapis
           tlačítko na bledom pozadí."*
           Dôvod je ten istý, pre ktorý lapis vznikol pri redizajne /map: na
           papyruse je zlatá naraz rámom, dlaždicou AJ tlačidlom, takže hlavné
           CTA je najsvetlejší prvok obrazovky a splýva s tým, čo ho drží. Zlatá
           ostáva konštrukcii („kde som"), lapis berie akciu („čo urobím").
           Recept je ZHODNÝ s tým, čo už drží /pack (.trp-addtrip-btn,
           .trp-dbar-done, .mna-submit, .atl-editor .btn-gold) — vrátane zlatého
           písma, bez ktorého je z lapisu len tmavé tlačidlo bez brandu.
           ⚠️ SCOPED NA .lab-papyrus ZÁMERNE: tú istú triedu .codex-cta nesie aj
           živá /religion, ktorá sa dnes nemenila. Až lab nahradí produkciu,
           scope padne. */
        .lab-papyrus .codex-cta {
          background: ${Y.grad};
          border-color: ${Y.deep};
          color: ${Y.ink};
          box-shadow: ${wt};
        }
        .lab-papyrus .codex-cta:hover {
          background: ${Y.gradHover};
          box-shadow: ${wt};
          filter: none;
        }
        .codex-cta:hover {
          transform: translateY(-1px);
          box-shadow:
            0 8px 22px rgba(110,71,16,0.55),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          filter: brightness(1.06);
        }
        .codex-cta:active {
          transform: translateY(0);
        }
        @media (max-width: 767px) {
          .codex-cta-wrap { margin-top: 14px; }
          .codex-cta {
            padding: 10px 22px;
            font-size: 0.72rem;
            letter-spacing: 0.2em;
          }
        }

        /* ── Slide 3: the question (cow vs dog visual) ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 3 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-slide-3 {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0 !important;
          overflow: visible;
        }
        /* PNGs rendered at page level (outside viewport's overflow:hidden).
           Vždy viditeľné — mimo hero sa odsunú do strán (nie fade-out), ostávajú ako rámovanie. */
        .codex-bleed {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 1;
          z-index: 1;
        }
        /* ╔══════════════════════════════════════════════════════════════════╗
           ║  🔒 LOCKED 2026-05-24 (hektor posunutý o 50px nižšie na PC)       ║
           ║  PC NESMIE byť dotknutý bez výslovného povolenia — Matej hrozí    ║
           ║  právnymi krokmi. Pri akomkoľvek edite v tomto súbore overiť že   ║
           ║  values nižšie ostávajú nedotknuté:                                ║
           ║    cow:    left:-50, bottom:-80, scale(1.14) origin bottom left   ║
           ║    hektor: right:0, bottom:0,  scale(1.08) origin bottom right    ║
           ║  Mobile (@media max-width:767px) môže byť ladený samostatne.      ║
           ╚══════════════════════════════════════════════════════════════════╝ */
        .codex-cow,
        .codex-hektor {
          position: absolute;
          bottom: 0;
          width: 50vw;
          height: 100vh;
          object-fit: contain;
          transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .codex-cow {
          left: -50px;
          bottom: -80px;
          object-position: bottom left;
          transform: scale(1.14);
          transform-origin: bottom left;
        }
        .codex-hektor {
          right: 0;
          bottom: 0;
          object-position: bottom right;
          transform: scale(1.08);
          transform-origin: bottom right;
        }
        /* ── END LOCK ────────────────────────────────────────────────────── */

        /* ── SVÄTOŽIARY ───────────────────────────────────────────────────
           Prstenec je SVG s rovnakým viewBoxom ako fotka a nesie TIE ISTÉ
           triedy (.codex-cow / .codex-hektor), takže LOCKED geometria hore
           platí naň bez jediného vlastného čísla — aj v mobilnej vetve.
           Podrobnosti a poloha prstencov: components/lab/CodexHalo.tsx.

           KRAVA svieti od začiatku (je to jej stav, nie udalosť).
           HEKTOR sa rozsvieti až na pointe — Matej 27. 8. 2026: halo prichádza
           ZA vetou „AND NOT ONE OF THEM BOWS." a je to celá pointa výjavu;
           žiadny text ho nekomentuje a pri scrolle späť zhasne.
           Tu (samostatná /religion-lab) ho spúšťa ČASOVAČ, rovnako ako reveal
           textu; --halo-delay dodáva React, lebo variant 2 sa píše po znakoch
           a jeho dĺžka závisí od počtu znakov. Vo filme /onepage to preberá
           scroll — viď --op-halo v components/lab/OnePage.tsx.

           ⚠️ transition-delay MUSÍ byť dvojhodnotový (0s pre transform).
           Jedna hodnota by odložila aj posun zvieraťa do strán a prstenec by
           za fotkou dobiehal 2,7 sekundy.
           ⚠️ Trvanie transformu je 650 ms ZÁMERNE — je to tá istá hodnota ako
           v LOCKED bloku vyššie. Iné číslo znamená, že sa halo pri odsune
           zvierat vlečie za hlavou. */
        .codex-halo {
          --halo: 1;
          opacity: var(--halo);
          pointer-events: none;
          transition-property: transform, opacity;
          transition-duration: 650ms, 820ms;
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Mierka rozsvietenia patrí VNÚTORNEJ skupine. Na <svg> by ju prebil
           locknutý scale(1.14)/scale(1.08) — a halo by odletelo od hlavy. */
        .codex-halo-scale {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          transform: scale(calc(0.86 + 0.14 * var(--halo)));
          transition: transform 820ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .codex-halo-hektor { --halo: 0; }
        .codex-bleed.active .codex-halo-hektor {
          --halo: 1;
          transition-delay: 0s, var(--halo-delay, 2700ms);
        }
        .codex-bleed.active .codex-halo-hektor .codex-halo-scale {
          transition-delay: var(--halo-delay, 2700ms);
        }
        @media (prefers-reduced-motion: reduce) {
          .codex-halo-hektor { --halo: 1; }
          .codex-halo,
          .codex-halo-scale { transition: none; }
        }
        /* Scroll posun (2026-06-02): mimo hero (bleed nemá .active) sa krava odsunie
           doľava, Hektor doprava → stred sa uvoľní pre obsah, okraje ostanú ako
           rámovanie. Locked scale + origin zachované, pridaný len translateX. */
        /* ── LAB: mimo hero sekcie sa krava/Hektor STLMIA.
           Na tmavej stránke sú čierne fotky nad čiernym pozadím prakticky
           neviditeľné, takže cez ne biely text pokojne prejde. Na papyruse je to
           opačne: tmavý inkoust padne na tmavého psa a posledné slová riadkov
           (KAŽDÉHO, PSOV, OSUD) sa stratia. Preto tu obrázky mimo sekcie 0
           ustupujú — nie posunom (ten je LOCKED nižšie), ale priehľadnosťou. */
        /* ── LAB: pilulka „klikni na knihu" pod knihou. Zdroj je zdieľaný
           ConstitutionBook (tmavé sklo rgba(0,0,0,.32) — na papyruse sa v nej
           zlatý text stratí). Prefarbujeme ju TU, cez .lab-papyrus, aby ostrá
           /religion ostala presne taká, aká je. */
        .lab-papyrus .cb-hint {
          background: rgba(255,252,244,0.78);
          border-color: rgba(140,96,20,0.45);
          color: #6E4A12;
        }
        .lab-papyrus .cb-hint-dot { background: #A3782B; box-shadow: none; }

        ${Ji}

        .codex-bleed:not(.active) { opacity: 0.26; }
        .codex-bleed { transition: opacity 420ms ease; }

        .codex-bleed:not(.active) .codex-cow {
          transform: translateX(-25%) scale(1.14);
        }
        .codex-bleed:not(.active) .codex-hektor {
          transform: translateX(25%) scale(1.08);
        }
        /* 🔒 PC/DESKTOP SLIDE-3 HERO LOCKED 2026-06-03 (Matej „super religion hotovo na PC lock"):
           overlay padding-top clamp(64px,9vh,96px) [1.2 BILLION vyššie] · .q-call 1.7em [DOGLOVERS]
           · .codex-question-big margin-top clamp(12px,1.8vh,24px) v @media(min-width:768px) [BOW→DOGLOVERS odstup]
           · "ARE YOU READY?" odstránené. NEMENIŤ PC bez Matejovho OK. Mobil = vlastný HARD LOCK nižšie. */
        .codex-chip {
          /* INFO CHIP = jednotný tvar pre celý film (Matej 27. 9. 2026: *„chip
             dajme farebný, viac pútavý, lapisové písmená a dvojitý okraj ako
             keby pulz… uzákonime info chip, kliknutím sa posúva obrazovka"*). */
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          margin: 0; padding: 8px 16px; border-radius: 999px; cursor: pointer;
          border: 1.5px solid ${Y.edge};
          background: linear-gradient(180deg, #FFFBF1 0%, #F6EAD0 100%);
          color: ${Y.edge};
          font-family: 'Space Grotesk', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: .14em; text-transform: uppercase;
          line-height: 1.3; text-align: center;
          box-shadow: 0 0 0 3px #F6EAD0, 0 0 0 4px rgba(22,48,122,.45), 0 6px 16px -8px rgba(10,26,74,.45);
          transition: transform .2s ease;
        }
        .codex-chip::after {
          content: ''; position: absolute; inset: -5px; border-radius: inherit; pointer-events: none;
          border: 1px solid rgba(22,48,122,.55);
          animation: codexChipPulse 2.4s ease-out infinite;
        }
        @keyframes codexChipPulse {
          0% { transform: scale(1); opacity: .9; }
          70%, 100% { transform: scale(1.12, 1.45); opacity: 0; }
        }
        .codex-chip:hover { transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce) { .codex-chip::after { animation: none; opacity: .5; } }
        .codex-3-overlay {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          /* Premenná, nie holá hodnota — deliaca čiara pod kravou z nej počíta
             svoju polohu, aby ležala PRESNE v strede medzery. */
          --ov-gap: clamp(18px, 2.8vh, 32px);
          gap: var(--ov-gap);
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          /* Asymetrický padding: top > bottom posúva text ~50px nižšie
             (justify-content:center centruje medzi padding edges). Kompenzuje
             priestor pod viewportom obsadený dots-mi, aby text sedel približne
             na strede obrazovky. */
          padding: clamp(64px, 9vh, 96px) clamp(12px, 2vw, 20px) clamp(20px, 4vh, 40px);
          height: 100%;
        }
        /* ── TEXTY 2. OBRAZU SÚ ZMENŠENÉ (−5 % → a znova −15 %) ────────────
           Matej 27. 8. 2026: *„zmenši texty o 5% všetky."*, o hodinu neskôr
           *„texty su moc velke a nezmestia sa = zmenši ich všetky o 15%"* (vtedy
           už horný nav prekrýval riadok „1.2 BILLION"). Prepočítané v ZDROJI,
           nie prebité vo filme: /onepage aj /religion-lab čítajú tento istý blok,
           druhá sada čísel by sa rozišla pri prvej ďalšej úprave.
           ⚠️ Druhé kolo škáluje od TOHO, ČO MATEJ VIDEL — teda × 0.85 na aktuálne
           čísla, nie na pôvodné. Prvé kolo (5 %) sa netýkalo .codex-microcopy,
           .codex-cta-sub, .codex-turn ani .codex-cta-line, takže niektoré
           riadky sú dnes −19 % a niektoré −15 % oproti originálu. Zámerne:
           zachovať treba POMERY, ktoré si odklepol, nie pôvodné číslo.
           ⚠️ Tlačidlo .codex-cta (BECOME DOGYPTIAN) sa NEZMENŠUJE — je zdieľané
           so slajdami 1–2 a je to CTA lock, nie text obrazu.
           ⚠️ Násobia sa VŠETKY tri čísla clampu — meniť len strop znamená, že
           sa zmena na Matejovom ~500 px okne vôbec neprejaví (tam vyhráva vw).
           ⚠️ Mobil (@media max-width: 767px) ostal NEDOTKNUTÝ — slide 3 mobil
           je HARD LOCKED od 24. 5. 2026, mení sa len na výslovné „zruš lock".
           Hodnoty v em (.q-call 1.7em, .q-action 0.65em) sa zmenšili samy —
           dediť sa nesmie dvakrát. */
        /* ══ NOVÝ TEXTING 2. OBRAZU — „YET." (27. 8. 2026) ══════════════════
           Matej: *„skúsme navrhnúť nový texting, virálny ale menej slovný
           vystihujúci podstatu čo chceme obrázkom povedať"* + *„spracuj to tak
           aby to bolo profesionalne a zaujimave nie fadne"*.

             A COW HAS / 1.2 BILLION / BELIEVERS
             A DOG HAS / NONE
             YET.

           STAVBA JE ÚČTOVNÁ, NIE BÁSNICKÁ: dva riadky s tou istou kostrou
           (lead → číslo → jednotka) pod sebou, aby oko porovnávalo ČÍSLA a nie
           vety. Preto majú obe tvrdenia tie isté triedy — rozdiel je jediný a je
           to celý vtip: číslo psa je PRÁZDNE.

           🎨 PALETA = TÁ ISTÁ AKO ÚVODNÉ MOTTO (Matej 28. 8. 2026: *„nepáči sa mi
              to je to prehnané — použi lapisovú čiernu a zlatú resp farby aké sú
              aj v úvodnom motte… rob plné písma nie prázdne — 1.2 bilion zlata
              none lapis?"*). Zdroj hodnôt = .ph-h1 v DogPlanetLab.tsx:
              čierna #23150a · plná tmavá zlatá #6E4A12. Lapis #0A1A4A je tá istá
              modrá ako obruč medailónu v nave.
              JEDEN PRVOK = JEDNA FARBA, každá z tých troch má svoju úlohu:
                zlatá = bohatstvo cudzieho boha (1.2 BILLION)
                lapis = naša strana (NONE)
                čierna = verdikt (YET.)
           🔴 ŽIADNE GRADIENTY DO PÍSMEN A ŽIADNA ŽIARA — obe verzie padli naraz.
              DogPlanetLab to má zapísané pri motte: LAB.goldText má strednú
              zarážku #D8A93F, svetlejšiu než podklad, takže slovo v STREDE zmizne
              („1.2 BILLION" aj „YET." tak boli najbledšie práve v ťažisku).
              Na papyruse drží jedine PLNÁ TMAVÁ farba.
           🔴 PLNÉ PÍSMO, NIE OBRYS. Prvá verzia kreslila „NONE" obrysom
              (-webkit-text-stroke + priehľadná výplň) ako „dieru na mieste, kde
              má krava zlato". Nápad znel dobre, na obrazovke bol nečitateľný
              (Matej: *„to none je otrasné"*). Absenciu nesie SLOVO, farba ju
              nemá čím zosilniť.
           ⚠️ Písmo je väčšie než pri starom textingu: sedem blokov sa nezmestilo,
              tri sa zmestia. Zmenšenie o 15 % z 23:38 riešilo TAMTEN problém.

           Staré triedy .codex-stat-* / .codex-turn / .codex-cta-line nižšie už
           NIKTO NEVYKRESĽUJE (markup nahradený, v gite je). Nechávam ich, kým
           Matej výber neuzavrie — vrátiť starý texting je potom len markup. */
        .codex-claim {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(2px, 0.5vh, 6px);
          margin: 0;
          position: relative;
          text-align: center;
        }
        /* Deliaca čiara je ::after KRAVY, nie samostatný prvok — každý priamy
           potomok overlayu má vlastný prah odhaľovania (--tx-at / nth-child),
           takže čiara ako súrodenec by posunula číslovanie celej sekvencie.

           ⚠️ POLOHA SA POČÍTA, NEODHADUJE (Matej 28. 8. 2026: *„čiara musí byť
           v strede a horne a dolne slovo musí byť rovnako od seba"*). Predtým
           visela na pevnom odsadení od kravy, takže pri každej inej výške okna
           sedela inde v medzere — a keďže medzera rástla s vh, klesala k „A DOG
           HAS". Dnes je to polovica SKUTOČNEJ medzery: --ov-gap (rozostup
           overlayu) + --rule-gap (prídavok tejto dvojice).
           translateY(50%) posunie čiaru o pol jej výšky, takže na vypočítanom
           mieste leží jej STRED, nie spodná hrana. */
        .codex-claim-cow {
          --rule-gap: clamp(24px, 4vh, 48px);
          margin-bottom: var(--rule-gap);
        }
        .codex-claim-cow::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: calc((var(--ov-gap) + var(--rule-gap)) / -2);
          transform: translate(-50%, 50%);
          width: min(300px, 62%);
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(110,74,18,0.42), transparent);
        }
        .cl-lead {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(0.64rem, 0.9vw, 0.86rem);
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(35,21,10,0.52);
          margin-bottom: clamp(2px, 0.6vh, 7px);
        }
        /* ČÍSLO KRAVY — PLNÁ TMAVÁ ZLATÁ (#6E4A12 = slová „dog"/„god" v motte). */
        .cl-figure {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.3rem, 6.4vw, 4.6rem);
          line-height: 0.96;
          letter-spacing: 0.02em;
          white-space: nowrap;
          color: #6E4A12;
        }
        /* ČÍSLO PSA — PLNÝ LAPIS. Tá istá modrá ako obruč medailónu v nave. */
        .cl-figure-void {
          color: #0A1A4A;
        }
        /* JEDNA DEKLARÁCIA PRE „BELIEVERS" AJ „YET..." (Matej 28. 8. 2026:
           *„YET daj veľkosti ako je believers aj váha — skratka totožné nech to
           má fazónu"*). Zámerne JEDEN selektor, nie dve zhodné kópie: dve kópie
           sa rozídu pri prvej úprave a „fazóna" je práve tá zhoda. */
        .cl-unit,
        .codex-yet {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.92rem, 1.55vw, 1.4rem);
          line-height: 1;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(35,21,10,0.88);
        }
        .codex-yet {
          margin: clamp(4px, 1vh, 12px) 0 0;
          /* Preloženie pridáva medzeru AJ ZA posledný znak, takže vycentrovaný
             text sedí o pol medzery vľavo. Záporný pravý okraj to presne ruší. */
          margin-right: -0.2em;
        }

        .codex-stat-number {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(2px, 0.4vh, 6px);
        }
        /* Riadok 1: "1.2 BILLION" — hero veľkosť + gold gradient, inline row */
        .codex-stat-row {
          display: flex;
          align-items: baseline;
          gap: clamp(0.5em, 1.3vw, 0.75em);
        }
        .codex-stat-row-bottom {
          gap: clamp(0.3em, 0.8vw, 0.45em);
          white-space: nowrap;
          flex-wrap: nowrap;
        }
        /* Parenthetical: "(15% worldwide)" — rovnaká veľkosť ako PEOPLE, len tlmená farba + italic.
           Hierarchy: row 1 (BILLION) > row 2 (PEOPLE) > row 3 (bow to the cow).
           Row 2 šírka ≈ row 1 šírka, font o niečo menší. */
        .codex-stat-note {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(0.93rem, 1.78vw, 1.7rem);
          color: rgba(60,40,12,0.52);
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .codex-stat-l1,
        .codex-stat-l2 {
          font-size: clamp(1.94rem, 5.17vw, 3.88rem);
          line-height: 1;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        /* Riadok 2: "PEOPLE" — rovnaká veľkosť ako parenthetical.
           Hierarchy: row 1 (BILLION) > row 2 (PEOPLE) > row 3 (bow to the cow).
           Row 2 šírka ≈ row 1 šírka, font o niečo menší. */
        .codex-stat-l3 {
          font-size: clamp(0.93rem, 1.78vw, 1.7rem);
          line-height: 1;
          color: rgba(35,22,8,0.90);
          font-weight: 400;
          filter: none;
        }
        .codex-stat-sub {
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-style: italic;
          font-size: clamp(1.09rem, 1.61vw, 1.5rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #A3782B;
          text-decoration: underline;
          text-decoration-color: #A3782B;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
          margin: -8px 0 0;
          filter: none;
        }

        /* ══ VARIANT 2 — SÚVISLÝ ODSEK, KTORÝ SA PÍŠE ═══════════════════════
           Matej 27. 8. 2026: *„ten text taký kostrbatý, rôzne velkosti a vela,
           vyzerá to amatérsky… zosúladiť do riadkov ako obyčajný text, ktorý je
           vopred napísaný, ale scrolingom dostáva život, ako keby sa písal."*

           Rozdiel oproti variantu 1 je JEDEN a nesie celý ten „amatérsky" pocit:
           variant 1 stavia hierarchiu na PIATICH veľkostiach písma (4.56rem číslo,
           2rem PEOPLE, 1.76rem podčiarknuté, 1.38rem obvinenie, 0.93rem výzva),
           variant 2 na JEDNEJ veľkosti a farbe. Zlaté sú len čísla — sú to jediné
           slová, ktoré nesú argument, takže jediné, ktoré smú z riadku vystúpiť. */
        .codex-v2 {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.81rem, 1.1vw, 1.02rem);
          /* Riadkovanie je väčšie než pri bežnom odseku zámerne: riadky sú tu
             VETY a každá má dosadnúť samostatne, nie splynúť do bloku textu. */
          line-height: 1.9;
          letter-spacing: 0.03em;
          color: rgba(35,22,8,0.88);
          margin: 0;
          /* Šírka je odmeraná z výjavu, nie zvolená — viď .codex-turn nižšie.
             Toto je ŠIROKÁ hodnota a smie byť: odsek stojí VYSOKO vo výjave (viď
             .is-v2 nižšie), kde je pás medzi zvieratami ~430 px. Nižšie by sa
             nezmestila — tam sa zužuje na ~225 px. */
          max-width: clamp(236px, 26vw, 372px);
          filter: none;
        }
        /* Vyvážené zalomenie je tu to, čo z troch viet robí ODSEK a nie zoznam:
           bez neho vypadne posledný riadok vety ako ohryzok („THE COW." samo na
           riadku) a text vyzerá nedbalo — presne ten pocit, ktorý mal variant 2
           odstrániť. Balance vyrovná riadky v rámci jednej vety, nie naprieč. */
        /* pretty, NIE balance. Balance vyrovnáva riadky do rovnakej dĺžky, takže
           ich robí KRATŠIE než dovolená šírka — z dvojriadkovej vety spraví
           trojriadkovú a odsek narastie o tretinu. pretty rieši to, čo tu naozaj
           vadilo (osamotené slovo na poslednom riadku), a šírku využije. */
        .v2-line { display: block; text-wrap: pretty; }
        /* ⚠️ MEDZERY MUSIA PREŽIŤ, ALE RIADOK SA MUSÍ ZALOMIŤ. Znak v samostatnom
           <span> stráca medzeru pri bežnom normal (HTML ju zbalí medzi značkami),
           pre ju zachová, ale zakáže zalomenie — potom text vyjde z výjavu a
           prejde cez psa. pre-wrap na KONTAJNERI robí oboje; na znaku nič. */
        .codex-v2, .codex-v2-close { white-space: pre-wrap; }
        /* Dôraz nesie FARBA a váha, NIE veľkosť — inak sa vrátia „rôzne velkosti". */
        .v2-gold {
          color: #A3782B;
          font-weight: 700;
        }
        .codex-v2-cta {
          margin-top: clamp(16px, 2.6vh, 34px);
          gap: clamp(14px, 2vh, 22px);
          /* ⚠️ Bez tohto je zhluk široký ako TLAČIDLO (najširšie dieťa flexu),
             takže percentuálna max-width vety sa počíta z ~230 px a veta sa
             zalomí, hoci na obrazovke je miesta dosť. */
          width: 100%;
        }
        .codex-v2-close {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.81rem, 1.1vw, 1.02rem);
          line-height: 1.75;
          letter-spacing: 0.03em;
          color: rgba(35,22,8,0.88);
          margin: 0;
          /* Užšia než odsek nad ňou a posunutá doľava: leží nižšie, kde sa pás
             medzi zvieratami zužuje a Hektorova papuľa vyčnieva doľava. */
          max-width: clamp(214px, 23vw, 332px);
          margin-right: 2.2vw;
          filter: none;
        }
        /* PÍSANIE — samostatná stránka (/religion-lab) beží na časovači.
           Vo filme (/onepage) sa toto VYPÍNA a poradie znakov číta scroll —
           viď .op-root #op-religion .v2-ch v OnePage.tsx. */
        /* ODSEK STOJÍ VYSOKO, NIE V STREDE. Variant 1 má šesť krátkych blokov
           a znesie centrovanie; variant 2 je súvislý text, ktorý pri centrovaní
           spadne do najužšieho miesta výjavu a rozpadne sa na deväť útržkov —
           presne to „vela riadkov", ktoré mal odstrániť. Hore je pás o dve
           tretiny širší, takže tie isté vety zaberú menej riadkov a text sa dá
           čítať ako odsek. */
        .codex-3-overlay.is-v2 {
          justify-content: flex-start;
          /* Dosť vysoko, aby bol pás široký, ale nie nalepené na nav — medzi
             navom a prvým riadkom má ostať dych. */
          padding-top: clamp(128px, 21vh, 250px);
        }

        .v2-ch { opacity: 0; }
        .codex-section.in-view .v2-ch {
          animation: v2type 180ms linear forwards;
          animation-delay: calc(var(--i, 0) * 18ms);
        }
        @keyframes v2type { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .v2-ch { opacity: 1; }
          .codex-section.in-view .v2-ch { animation: none; }
        }
        /* Prepínač variantov — LEN pre lab, nikdy sa nedostane na ostrý web. */
        .v2-switch {
          position: fixed;
          right: 12px;
          bottom: 58px;
          z-index: 60;
          display: flex;
          gap: 2px;
          padding: 3px;
          border-radius: 8px;
          background: rgba(20,12,4,0.82);
          border: 1px solid rgba(201,154,63,0.42);
        }
        .v2-switch button {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          padding: 4px 9px;
          border-radius: 6px;
          border: 0;
          background: transparent;
          color: rgba(245,236,220,0.72);
          cursor: pointer;
        }
        .v2-switch button.is-on {
          background: rgba(201,154,63,0.9);
          color: #241606;
        }

        /* ── PSIA STRANA + OTOČNÝ BOD (Matej 27. 8. 2026) ──────────────────
           Sekcia mala symetrický obrázok a nesymetrický text. Zrkadlo kravy
           používa ZÁMERNE tie isté triedy (.codex-stat-*), aby sa oba fakty
           čítali ako jeden pár; mení sa len mierka. */
        .codex-stat-dog {
          margin-top: clamp(7px, 1.2vh, 17px);
        }
        /* „30%" sú dva znaky, „1.2 BILLION" dve slová — pri rovnakej veľkosti
           písma by psia strana opticky pôsobila drobnejšie, hoci hovorí
           DVOJNÁSOBOK. Zmenšenie je preto mierne: má ostať druhým hlasom páru,
           nie poznámkou pod čiarou. */
        .codex-stat-dog .codex-stat-l1 {
          font-size: clamp(1.58rem, 3.82vw, 2.86rem);
        }
        .codex-stat-dog .codex-stat-l3 {
          font-size: clamp(0.83rem, 1.51vw, 1.43rem);
        }
        .codex-stat-sub-dog {
          margin-top: -4px;
        }
        /* OTOČNÝ BOD — jediná veta sekcie, ktorá netvrdí fakt, ale obviňuje.
           Preto tmavý inkoust namiesto zlatej: obe štatistiky nad ňou sú zlaté,
           takže tretia zlatá by splynula do zoznamu a pointa by zanikla. */
        .codex-turn {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.83rem, 1.23vw, 1.17rem);
          line-height: 1.24;
          letter-spacing: 0.045em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.92);
          /* ZÁMERNE NIE balance. Vyvážené zalomenie dá dva rovnako dlhé riadky
             („AND NOT ONE / OF THEM BOWS.") a ten druhý si posledné slovo položí
             na Hektorovu papuľu — pás je dole užší, nie symetrický. Prirodzené
             zalomenie pri tejto šírke drží obidva riadky pod hranicou psa.
             ⚠️ ŠÍRKA JE ODMERANÁ, NIE ODHADNUTÁ: voľný pás medzi kravou
             a Hektorom má pri y≈570 na 1440px zhruba 225 px (krava končí ~600,
             Hektorova papuľa začína ~825). Preto ~220 px, nie viac. */
          text-wrap: normal;
          /* ⚠️ ŠÍRKA JE TU OBMEDZENIE VÝJAVU, NIE VKUS. Voľný pás medzi kravou
             a Hektorom sa smerom nadol ZUŽUJE (pri y≈600 na 1440px má ~230 px),
             takže jednoriadková veta cez 470 px si posledné dve slová položí na
             tmavého psa a tam zmiznú. Dvojriadkové zalomenie je zároveň lepšia
             dramaturgia — pauza padne presne pred slovo BOWS. */
          max-width: clamp(178px, 15.4vw, 220px);
          /* Pauza pred obvinením je väčšia než rozostupy medzi faktami — je to
             zlom v argumente, nie ďalšia položka zoznamu. */
          margin: clamp(14px, 2.5vh, 32px) 0 0;
          /* Posun DOĽAVA o polovicu tejto hodnoty (centrovaný flex item).
             Voľný pás medzi zvieratami nie je symetrický voči stredu overlayu:
             Hektorova papuľa vyčnieva doľava viac, než krava doprava, takže
             stred pásu leží asi 15 px vľavo od stredu textu. Bez posunu sedí
             „F" v slove OF presne na psom nose. Jednotka je vw zámerne — pes je
             škálovaný k šírke okna, takže posun sa musí hýbať s ním. */
          margin-right: 2.2vw;
          filter: none;
        }
        /* Veta nad tlačidlom. „only" robí z milióna malé číslo vedľa 1,2
           miliardy — pointa je v tom slove, nie vo veľkosti písma, takže
           ostáva tlmená a tlačidlu neuberá. */
        .codex-cta-line {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.68rem, 0.83vw, 0.79rem);
          line-height: 1.38;
          letter-spacing: 0.015em;
          color: rgba(35,22,8,0.72);
          /* JEDEN RIADOK (Matej 28. 8. 2026: *„toto daj do jedneho riadku pod CTA"*).
             ⚠️ Strop šírky sa MUSEL zrušiť, nie zväčšiť: pôvodných ~212 px lámalo
             vetu na tri riadky a akýkoľvek strop len posúva, na ktorom slove sa
             zlomí. Jediné, čo počet riadkov naozaj zaručí, je nowrap.
             ⚠️ Riadok stojí POD tlačidlom, takže je najužším prvkom výjavu —
             na mobile má vlastný strop nižšie. */
          white-space: nowrap;
          margin: 0;
          filter: none;
        }
        .codex-question-big {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-style: normal;
          /* PC: variant A copy zväčšená pre punch (mobile má vlastný override 15px) */
          font-size: clamp(1.01rem, 1.45vw, 1.41rem);
          line-height: 1.35;
          letter-spacing: 0.015em;
          margin: 0;
          max-width: clamp(280px, 32vw, 480px);
          text-wrap: balance;
          color: rgba(35,22,8,0.82);
        }
        .codex-question-big .accent {
          display: block;
          margin-top: 0.4em;
          color: rgba(35,22,8,0.90);
          filter: none;
        }
        /* PC: DOGLOVERS? = bold, zväčšené (hero call) */
        .codex-question-big .q-call {
          display: inline-block;
          font-weight: 700;
          font-size: 1.7em;
          letter-spacing: 0.025em;
        }
        /* PC-only: väčší odstup medzi "bow to the cow" a DOGLOVERS
           (scoped na min-width:768px — mobil je HARD LOCKED, nededí) */
        @media (min-width: 768px) {
          .codex-question-big {
            margin-top: clamp(12px, 1.8vh, 24px);
          }
        }
        /* PC: LET'S WORSHIP OUR DOGS = šírka < tlačítka pod (menšie ako button) */
        .codex-question-big .q-action {
          display: inline-block;
          font-size: 0.65em;
          letter-spacing: 0.1em;
          margin-top: 0.5em;
        }
        /* Micro-copy pod CTA — body font (Inter), zúžená na šírku tlačítka */
        .codex-microcopy {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-style: normal;
          font-size: clamp(0.58rem, 0.7vw, 0.66rem);
          line-height: 1.4;
          letter-spacing: 0.01em;
          color: rgba(60,40,12,0.62);
          margin: 0;
          max-width: clamp(240px, 22vw, 320px);
          text-wrap: balance;
          text-align: center;
        }
        /* Sub-link pod CTA — sekundárny destination signal */
        .codex-cta-sub {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: clamp(0.59rem, 0.78vw, 0.7rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(201,154,63,0.8);
          text-decoration: none;
          border-bottom: 1px solid rgba(201,154,63,0.35);
          padding-bottom: 2px;
          transition: color 180ms ease, border-color 180ms ease;
        }
        .codex-cta-sub:hover {
          color: #8a5a14;
          border-color: rgba(140,96,20,0.6);
        }
        /* CTA cluster: micro-copy + button + sub-link as a single tight block */
        .codex-cta-cluster {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(10px, 1.4vh, 16px);
        }
        /* ── MOBIL: obmedzenie šírky z PC tu NEPLATÍ ──────────────────────
           Na mobile stoja krava a Hektor POD textom, nie vedľa neho, takže úzky
           pás medzi nimi neexistuje a stiahnutá pointa by tu bola menšia než
           fakty nad ňou — presne to, čo mala oprava odstrániť.
           Nové triedy z 27. 8. 2026; mobilného HARD LOCKu nižšie sa netýkajú. */
        @media (max-width: 767px) {
          .codex-turn {
            font-size: clamp(1.14rem, 5.2vw, 1.42rem);
            max-width: 92%;
            margin-right: 0;
          }
          /* Strop šírky je preč aj tu: pri nowrap nevie zalomiť, len by vetu
             pretlačil von z rámu. Počet riadkov drží nowrap, veľkosť drží clamp
             — pri 320 px vychádza veta na ~223 px, teda sa zmestí. */
          .codex-cta-line {
            font-size: clamp(0.82rem, 3.4vw, 0.95rem);
          }
          /* Na mobile stoja zvieratá POD textom, takže úzky pás neexistuje a
             odsek smie využiť šírku. Centrovanie sa sem tiež vracia — hore
             netreba uhýbať ničomu. */
          .codex-3-overlay.is-v2 {
            justify-content: center;
            padding-top: clamp(48px, 8vh, 92px);
          }
          /* ⚠️ Písmo je na mobile MENŠIE než na PC zámerne. Celý zmysel variantu 2
             je, že jedna veta = jeden riadok; pri väčšom písme sa na 390 px
             odlomí posledné slovo („THE COW.", „A DOG.") a vráti sa presne ten
             rozdrobený vzhľad, kvôli ktorému variant 2 vznikol. */
          .codex-v2 { max-width: 97%; font-size: clamp(0.84rem, 3.66vw, 1.08rem); }
          .codex-v2-close { max-width: 97%; margin-right: 0; font-size: clamp(0.84rem, 3.66vw, 1.08rem); }
          .codex-stat-dog { margin-top: clamp(8px, 1.4vh, 16px); }
        }

        @media (max-width: 767px) {
          /* 🔒🔒 LOCK MOBILE HARD (2026-05-24): Slide 3 mobile HOTOVÝ. NEDOTÝKAŤ SA.
             Cow + Hektor scale/position, padding-top, BOW size, copy variant A,
             microcopy hide — všetko finálne. Úpravy LEN na explicit "zruš lock". */
          .codex-cow {
            height: clamp(72vh, 90vh, 106vh);
            /* Mobile: posun o 20px doprava (left: -14vw + 20px) */
            left: calc(-14vw + 20px);
            /* Mobile: posun o 50px nadol (top: 0 → top: 50px) */
            top: 50px;
            /* Mobile: +5% +15% nad PC scale (1.14 × 1.05 × 1.15 ≈ 1.377) */
            transform: scale(1.377);
            transform-origin: bottom left;
          }
          .codex-hektor {
            height: clamp(72vh, 90vh, 106vh);
            /* Mobile: posun o 30px doľava, potom o 15px doprava (2026-05-31) → -14vw + 15px */
            right: calc(-14vw + 15px);
            /* Mobile: posun o 50px nadol (2026-05-31) */
            top: 50px;
            /* Mobile: +10% +15% −10% nad PC scale, +10% (2026-05-31) → 1.08 × 1.10 × 1.15 × 0.90 × 1.10 ≈ 1.352 */
            transform: scale(1.352);
            transform-origin: bottom right;
          }
          /* Scroll posun (mobile): jemný odsun 25% — okraje ostanú ako rámovanie */
          .codex-bleed:not(.active) .codex-cow {
            transform: translateX(-25%) scale(1.377);
          }
          .codex-bleed:not(.active) .codex-hektor {
            transform: translateX(25%) scale(1.352);
          }
          .codex-3-overlay {
            max-width: 320px;
            gap: 14px;
            /* Mobile: anchor top — match slide 1 headline Y position.
               flex-start + minimal padding-top → content ide čo najvyššie. */
            justify-content: flex-start;
            /* Mobile (2026-06-03, Matej OK): overlay obsah posunutý o +75px nadol */
            padding-top: calc(clamp(10px, 2vh, 24px) + 75px);
            padding-bottom: clamp(20px, 4vh, 40px);
          }
          .codex-stat-number { font-size: clamp(2rem, 12vw, 3rem); }
          .codex-stat-sub {
            /* Mobile: BOW TO THE COW šírkovo ≈ horný riadok „1.2 BILLION" */
            font-size: 1.35rem;
            letter-spacing: 0.08em;
          }
          .codex-question-big { font-size: 15px; line-height: 1.35; }
          /* Mobile: DOGLOVERS + ARE YOU READY = veľký biely bold call.
             LET'S WORSHIP OUR DOGS = jeden riadok normal weight. */
          .codex-question-big .q-call {
            display: inline-block;
            font-size: 1.7rem;
            font-weight: 700;
            /* LAB: na papyruse #fff = neviditeľné. Komentár nad blokom hovorí
               „veľký biely bold call" — v svetlom režime je to veľký ČIERNY. */
            color: rgba(35,22,8,0.90);
            letter-spacing: 0.04em;
            line-height: 1.15;
          }
          .codex-question-big .q-action {
            display: inline-block;
            white-space: nowrap;
            margin-top: 6px;
          }
        }

        /* ── Scroll hint ── */
        .codex-scrollhint {
          position: fixed;
          left: 50%;
          bottom: clamp(14px, 3vh, 28px);
          transform: translateX(-50%);
          appearance: none;
          background: transparent;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 26px;
          line-height: 1;
          color: rgba(201,154,63,0.85);
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.25));
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms ease;
          z-index: 6;
        }
        .codex-scrollhint.show {
          opacity: 1;
          pointer-events: auto;
        }
        @media (prefers-reduced-motion: no-preference) {
          .codex-scrollhint.show span {
            display: inline-block;
            animation: codexBounce 1.8s ease-in-out infinite;
          }
        }
        @keyframes codexBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        /* ══ REŽIM FILMU (onepage) ═══════════════════════════════════════════
           Prepnutie z „obrazovka s vlastným scrollom" na „kus dlhého plátna".
           Mení sa VÝHRADNE scroll a výška — rozostupy, typografia a LOCKED
           geometria kravy/Hektora ostávajú netknuté. Všetko je pod .codex-flow,
           takže samostatná /religion-lab aj LabShell ostávajú presne ako boli. */
        /* clip, nie hidden: hidden by z prvku spravil scroll kontajner na OBOCH
           osiach a zvislý scroll filmu by sa oň zasekol. clip oreže a nescrolluje.
           Orezanie tu byť MUSÍ — nesie ho pôvodná stránka cez overflow-hidden
           a drží ním kravu (50vw, left -50px, scale 1.14) a Hektora vnútri.
           Bez neho preteká stránka vodorovne (pri 500 px o 55 px) a telo webu
           dostane bočný scroll, ktorý tam nemá čo robiť. */
        .codex-flow.codex-page { height: auto; overflow-x: clip; overflow-y: visible; }
        .codex-flow .codex-scroll {
          flex: none;
          overflow-x: clip;
          overflow-y: visible;
          height: auto;
          scroll-snap-type: none;
        }
        .codex-flow .codex-section {
          height: auto;
          min-height: 100lvh;
          scroll-snap-align: none;
          scroll-snap-stop: normal;
        }
        /* 🔴 lvh, NIE dvh — vo filme (4. 9. 2026). Mobilný prehliadač pri scrolle
           skrýva adresný riadok, takže dvh počas pohybu rastie a výjav sa pod
           prstom posúva; réžia filmu pritom počíta dráhu z vlastnej, nemennej
           výšky (filmVh v OnePage.tsx). Dve rôzne výšky = text kmitá hore-dole.
           Samostatná stránka /religion si dvh nechala: tá sa nescrolluje. */
        .codex-flow .codex-slider { height: auto; min-height: 100lvh; }
        .codex-flow .codex-slide-3 { height: auto; min-height: 100lvh; }
        /* Bleed (krava + Hektor) je absolute voči STRÁNKE. Tá je v filme vysoká
           tri obrazovky, takže bez výšky by obe zvieratá sadli na spodok
           posledného výjavu — o dve obrazovky nižšie, než majú stáť.
           ⚠️ position sa tu opakuje ZÁMERNE, hoci ho .codex-bleed už má.
           V onepage sú náboženstvo, vízia aj príbeh namontované NARAZ a každý
           z tých súborov nesie vlastný globálny blok s .lab-papyrus > *
           { position: relative }. Tie sa vkladajú neskôr, majú rovnakú
           špecificitu (0,1,0) a pravidlo teda prebijú — z bleedu sa stane prvok
           V TOKU, zaberie celú obrazovku a odsunie výjav o 702 px nadol.
           Dvojtriedny zápis (0,2,0) to prebije späť bez ohľadu na poradie. */
        .codex-flow .codex-bleed {
          /* STICKY, nie absolute — a záporný spodný okraj mu zruší miesto v toku.
             Na pôvodnej stránke je obrazovka pevná, takže krava a Hektor stoja
             samy od seba. Vo filme sa scrolluje: ako absolute im odscrolluje
             spodná hrana do obrazu a pes sa zreže vodorovným rezom v polovici
             tela. Prilepené držia rám výjavu presne ako predtým a vlastnú
             choreografiu (odsun do strán + stlmenie na 0.26, keď sekcia stratí
             .active) si robia ďalej samy.
             ⚠️ position sa tu opakuje zámerne aj kvôli tomu, že .lab-papyrus > *
             z vízie a príbehu prebíja .codex-bleed pri zhodnej špecificite —
             viď komentár v hlavičke tohto bloku. */
          position: sticky;
          top: 0;
          left: 0;
          height: 100lvh;
          margin-bottom: -100lvh;
        }

        /* ── REVEAL PLATÍ AJ VO FILME — okrem PRVÉHO výjavu ────────────────
           🔴 Tu predtým stálo plošné opacity:1 pre celé náboženstvo, teda reveal
           vypnutý natvrdo. Bola to náhrada za chybu, ktorá je odvtedy opravená
           v koreni (triedu .in-view drží React, nie classList — viď observer
           hore). Matej 26. 8. 2026 to vrátil: *„to písmo v 2. sekcii príde mi to
           také suché a nezaujímavé… tá citácia z ústavy sa zasekne… nech je to
           plynulé ako na ostrom webe."*
           PRVÝ výjav (krava a pes) výnimku má a musí ju mať: jeho text nastupuje
           podľa polohy vo filme (--op-txt z OnePage), nie podľa toho, kedy sa
           sekcia objaví. Dve animácie na tom istom texte by sa bili. */
        .codex-flow .codex-section[data-idx="0"] .codex-slide,
        .codex-flow .codex-section[data-idx="0"] .codex-3-overlay > * {
          opacity: 1;
          transform: none;
        }

        /* 🔴 VO FILME BLEDNE UŽ LEN KRAVA (Matej 28. 8. 2026: *„krava začne
           blednúť hneď pri 3. sekcii… zostane viditeľná, ale bude vyblednutá"*
           + *„pes zostane vo farbe"*). Predtým tu viselo spoločné stlmenie
           OBOCH zvierat (--op-bleed) a bývalo na štvrtom obraze — ten zanikol,
           takže by nemalo kde nastať. Hodnota je tá istá 0.26 ako v pôvodnom
           .codex-bleed:not(.active), len ju neurčuje trieda od Reactu, ale
           poloha scrollu, a nesie ju už len jedno z dvoch zvierat.
           ⚠️ Selektor chytá DVA prvky a je to tak správne: CodexHalo who=cow
           si triedu .codex-cow nesie tiez (sklada si ju z propu who),
           takže svätožiara bledne spolu s kravou. Bez toho by nad vyblednutou
           kravou ostal svietiť ostrý prstenec. Hektorova dvojica má
           .codex-hektor a tejto premennej sa teda nedotkne. */
        /* 🔴 A NAJPRV SA MUSÍ ZRUŠIŤ STLMENIE OD TRIEDY. Pôvodná stránka
           stlmuje CELÝ bleed na 0.26, len čo sekcia stratí .active
           (.codex-bleed:not(.active) nižšie) — a vo filme ju stratí hneď na
           druhej obrazovke. Doteraz to prebíjalo spoločné --op-bleed; keď to
           odtiaľ zmizlo, vybledli OBE zvieratá naraz a psovi to zobralo farbu,
           ktorú má podľa zadania mať. Vo filme teda rozhoduje výlučne scroll. */
        /* ── ÚRYVOK ÚSTAVY JE ZAROVNANÝ DO BLOKU, AKO V KNIHE ─────────────
           Matej 28. 8. 2026: *„vieme ten text zarovnať tak aby bol rovnaky po
           okrajoch ako v knihe? a najsť sweet spot kde nebudu velke medzery?"*

           🔑 SWEET SPOT NEROBÍ ŠÍRKA STĹPCA, ALE DELENIE SLOV. Zarovnanie do
           bloku rozťahuje MEDZERY, aby riadok dosadol na pravý okraj — a čím
           dlhšie slová, tým väčšie diery. Slovenčina má SPOLOČNOSTI, NEKONEČNÚ,
           POSTAVENIE; bez delenia ostane v riadku pár slov a medzi nimi
           priepasť. Automatické delenie dovolí slovo zlomiť, takže sa medzery
           rozdelia na viac miest a žiadna nevytrčí.
           ⚠️ Delenie funguje LEN keď prehliadač pozná jazyk — drží ho atribút
           lang na koreni dokumentu, ktorý nastavuje LanguageContext pri každej
           zmene jazyka.
           ⚠️ Vyvažovanie dĺžky riadkov sa musí vypnúť: pri ragged okraji je
           správne, ale proti zarovnaniu do bloku pracuje (riadky sú aj tak
           rovnako dlhé, len sa zúži posledný).
           ⚠️ Posledný riadok ostáva V STREDE — inak by z odseku, ktorý sa končí
           dvoma slovami, ostal osamelý ľavý okraj.
           Platí LEN vo filme; samostatná /religion-lab ostáva, aká bola. */
        .codex-flow .codex-preamble-text {
          text-align: justify;
          text-align-last: center;
          hyphens: auto;
          -webkit-hyphens: auto;
          text-wrap: wrap;
        }

        .codex-flow .codex-bleed { opacity: 1; transition: none; }
        .codex-flow .codex-bleed .codex-cow {
          opacity: var(--op-cow, 1);
          /* ⚠️ TRANSITION MUSÍ BYŤ PREČ. Pôvodná stránka prepína stlmenie
             triedou, takže jej 420 ms zmäkčenie je na mieste. Vo filme hodnotu
             mení SCROLL v každom snímku — a s prechodom sa zvieratá vlečú
             takmer pol sekundy za prstom. Matej to videl presne takto:
             *„pri návrate zostávajú zvieratá na mieste — zasekne sa to."*
             Je to tá istá pasca, akú už má vypnutú posun kravy a Hektora. */
          transition: none;
        }
      `}),!o&&e.jsx(Zt,{withNav:!0}),or,e.jsxs("div",{className:"codex-scroll",ref:F,children:[e.jsx("section",{className:`codex-section ${O.has(0)?"in-view":""}`,"data-idx":0,"aria-label":l("religion.aria.question"),ref:t=>{j.current[0]=t},children:e.jsx("div",{className:"codex-slider",children:e.jsx("div",{className:"codex-slide codex-slide-3",children:e.jsxs("div",{className:`codex-3-overlay ${_===2?"is-v2":""}`,style:_===2?{"--n":R}:void 0,children:[_===2?z:null,_===1&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"codex-claim codex-claim-cow",children:[e.jsx("span",{className:"cl-lead",children:l("religion.hook.claim.cowLead")}),e.jsx("span",{className:"cl-figure",children:l("religion.hook.claim.cowFigure")}),e.jsx("span",{className:"cl-unit",children:l("religion.hook.claim.cowUnit")})]}),e.jsxs("div",{className:"codex-claim codex-claim-dog",children:[e.jsx("span",{className:"cl-lead",children:l("religion.hook.claim.dogLead")}),e.jsx("span",{className:"cl-figure cl-figure-void",children:l("religion.hook.claim.dogFigure")})]}),e.jsx("p",{className:"codex-yet",children:l("religion.hook.claim.yet")}),e.jsx("div",{className:"codex-cta-cluster",children:n?e.jsx("button",{type:"button",className:"codex-chip",onClick:c,children:l("religion.hook.claim.goalChip")}):e.jsxs(e.Fragment,{children:[e.jsx(vt,{to:"/heroglyph/name",className:"codex-cta",children:l("religion.cta")}),e.jsx("p",{className:"codex-cta-line",children:l("religion.hook.claim.close")})]})})]})]})})})}),e.jsx("section",{className:`codex-section ${O.has(1)?"in-view":""}`,"data-idx":1,"aria-label":l("religion.aria.preamble"),ref:t=>{j.current[1]=t},children:e.jsx("div",{className:"codex-slider",children:e.jsxs("div",{className:"codex-slide",children:[n&&e.jsx("p",{className:"codex-eyebrow",children:l("religion.preamble.eyebrow")}),e.jsx("h1",{className:"codex-headline",children:l("religion.preamble.headlineVerbFirst")==="1"?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"line",children:l("religion.preamble.headlineLine")}),e.jsx("span",{className:"grad",children:l("religion.preamble.headlineGrad")})]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"grad",children:l("religion.preamble.headlineGrad")}),e.jsx("span",{className:"line",children:l("religion.preamble.headlineLine")})]})}),e.jsxs("div",{className:"codex-preamble-wrap",children:[e.jsx("span",{className:"codex-frame tl","aria-hidden":!0}),e.jsx("span",{className:"codex-frame tr","aria-hidden":!0}),e.jsx("span",{className:"codex-frame bl","aria-hidden":!0}),e.jsx("span",{className:"codex-frame br","aria-hidden":!0}),e.jsx("p",{className:"codex-preamble-text",dangerouslySetInnerHTML:{__html:l("religion.preamble.text")}})]}),!n&&e.jsx("p",{className:"codex-oath-label",children:l("religion.preamble.oath")}),n&&e.jsx("button",{type:"button",className:"codex-chip codex-chip--book",onClick:p,children:l("religion.preamble.bookChip")})]})})}),!n&&e.jsxs("section",{className:`codex-section ${O.has(2)?"in-view":""}`,"data-idx":2,"aria-label":l("religion.aria.sacredIndex"),ref:t=>{j.current[2]=t},children:[!n&&e.jsx("h2",{className:"codex-book-title",children:l("religion.bookTitle")}),e.jsx("div",{className:"codex-slider codex-slider-book",children:e.jsx("div",{className:"codex-slide",children:e.jsx(Yi,{})})})]})]}),!n&&e.jsx("button",{type:"button",className:`codex-scrollhint ${y===0?"show":""}`,onClick:()=>v(1),"aria-label":l("religion.aria.scrollDown"),children:e.jsx("span",{"aria-hidden":!0,children:"▾"})})]})}const ir={ara:"ar",chn:"zh-Hans",cs:"cs",deu:"de",en:"en",esp:"es",fra:"fr",ind:"hi",ita:"it",jpn:"ja",kor:"ko",nld:"nl",pol:"pl",prt:"pt",rus:"ru",sk:"sk",tur:"tr",ukr:"uk"};let ka=null;function rr(){return ka||(ka=fetch("/data/intro-captions.json").then(o=>o.json())),ka}let ya=null;function sr(){var n;const o=window;return(n=o.YT)!=null&&n.Player?Promise.resolve():(ya||(ya=new Promise(s=>{const c=o.onYouTubeIframeAPIReady;o.onYouTubeIframeAPIReady=()=>{c==null||c(),s()};const p=document.createElement("script");p.src="https://www.youtube.com/iframe_api",document.head.appendChild(p)})),ya)}function lr({papyrus:o,sheet:n,videos:s,active:c}){const p=r.useRef(null),l=r.useRef([]),f=r.useRef(null),m=r.useRef({from:c,to:c,t:1}),{x:y,y:N,w:O,h:x}=n,F=r.useRef(!0),j=r.useRef(()=>{});return r.useEffect(()=>{const v=m.current;c!==v.to&&(v.from=v.to,v.to=c,v.t=0)},[c]),r.useEffect(()=>{const v=()=>{F.current&&l.current.forEach(L=>L&&L.paused&&L.play().catch(()=>{}))};v();const _={passive:!0,capture:!0};document.addEventListener("touchstart",v,_),document.addEventListener("pointerdown",v,_),document.addEventListener("scroll",v,_);const Z=setInterval(v,1e3);return()=>{document.removeEventListener("touchstart",v,_),document.removeEventListener("pointerdown",v,_),document.removeEventListener("scroll",v,_),clearInterval(Z)}},[s]),r.useEffect(()=>{const v=p.current;if(!v)return;let _=!0,Z=!document.hidden;const L=()=>{const t=_&&Z;t!==F.current&&(F.current=t,t?(j.current(),l.current.forEach(a=>a&&a.paused&&a.play().catch(()=>{}))):l.current.forEach(a=>a&&!a.paused&&a.pause()))},R=new IntersectionObserver(t=>{var a;_=((a=t[0])==null?void 0:a.isIntersecting)??!0,L()},{threshold:0});R.observe(v);const z=()=>{Z=!document.hidden,L()};return document.addEventListener("visibilitychange",z),()=>{R.disconnect(),document.removeEventListener("visibilitychange",z)}},[]),r.useEffect(()=>{const v=p.current,_=v==null?void 0:v.getContext("2d");if(!v||!_)return;let Z=0,L=!1,R=0;const z=.4,t=new Image;t.onload=()=>{v.width=t.naturalWidth,v.height=t.naturalHeight,L=!0},t.src=o,l.current.forEach(d=>d&&d.play().catch(()=>{}));const a=(d,h)=>{const b=l.current[d];if(!b||b.readyState<2||!b.videoWidth||h<=0)return;const w=v.width,A=v.height,H=y*w,T=N*A,B=O*w,ne=x*A,ce=Math.min(B/b.videoWidth,ne/b.videoHeight),be=b.videoWidth*ce,Ne=b.videoHeight*ce;let q=f.current;q||(q=document.createElement("canvas"),f.current=q),(q.width!==b.videoWidth||q.height!==b.videoHeight)&&(q.width=b.videoWidth,q.height=b.videoHeight);const he=q.getContext("2d");he&&(he.globalCompositeOperation="source-over",he.clearRect(0,0,q.width,q.height),he.drawImage(b,0,0),_.globalAlpha=h,_.globalCompositeOperation="multiply",_.drawImage(q,H+(B-be)/2,T+(ne-Ne)/2,be,Ne),_.globalAlpha=1,_.globalCompositeOperation="source-over")},i=d=>{if(L){const h=m.current;h.t<1&&(h.t=Math.min(1,h.t+(R?(d-R)/1e3:0)/z)),R=d;const b=v.width,w=v.height;_.globalAlpha=1,_.globalCompositeOperation="source-over",_.clearRect(0,0,b,w),_.drawImage(t,0,0,b,w),h.from!==h.to&&h.t<1&&a(h.from,1-h.t),a(h.to,h.from!==h.to?h.t:1)}Z=F.current?requestAnimationFrame(i):0};return Z=requestAnimationFrame(i),j.current=()=>{Z||(R=0,Z=requestAnimationFrame(i))},()=>{cancelAnimationFrame(Z),j.current=()=>{}}},[o,y,N,O,x,s]),e.jsxs(e.Fragment,{children:[e.jsx("canvas",{ref:p,className:"wf-scene-canvas","aria-hidden":!0,style:{zIndex:1}}),s.map((v,_)=>v?e.jsx("video",{ref:Z=>{l.current[_]=Z},src:v,muted:!0,loop:!0,playsInline:!0,autoPlay:!0,preload:"auto","aria-hidden":!0,style:{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",opacity:0,zIndex:0,pointerEvents:"none"}},_):null)]})}const Ma="#5a3a0c",ht=`stroke="${Ma}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`,Eo=`<rect x="0" y="0" width="34" height="46" rx="4" ${ht}/><path d="M17 9 l0 28 M9 22 l16 0" ${ht}/>`,cr=(o="")=>`<svg viewBox="0 0 200 250" ${ht}>
  <circle cx="66" cy="70" r="15"/>
  <path d="M66 85 L66 148 M66 100 L48 126 M66 100 L86 122"/>
  <path d="M66 148 L54 198 M66 148 L80 198"/>
  <path d="M118 160 q4 -32 28 -32 q22 0 24 26 l12 2"/>
  <path d="M118 160 l0 38 M130 160 l0 38 M158 152 l2 46 M170 154 l2 44"/>
  <path d="M144 130 l-6 -16 M164 132 l8 -14"/>
  ${o}
</svg>`,pr=`<svg viewBox="0 0 200 250" ${ht}>
  <circle cx="74" cy="64" r="17"/>
  <path d="M74 81 L74 150"/>
  <path d="M74 100 L52 126"/>
  <path d="M74 100 L96 118 L86 86 L78 78"/>
  <path d="M74 150 L60 205 M74 150 L88 205"/>
  <path d="M120 205 q2 -40 30 -42 q24 -2 26 26"/>
  <path d="M150 163 q-10 -6 -8 -18 M168 168 q8 -8 4 -18"/>
  <path d="M120 205 l0 -2 M138 205 l0 -10 M176 196 l4 9"/>
  <path d="M150 163 q-14 8 -16 22"/>
  <path d="M146 150 L92 96" stroke-dasharray="3 6" stroke="${Ma}" opacity="0.5"/>
</svg>`,dr={ankh:'<svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M12 11 L12 22 M7 16 L17 16"/></svg>',pyramid:'<svg viewBox="0 0 24 24"><path d="M12 3 L22 21 L2 21 Z M7 12 L17 12"/></svg>',heartpaw:'<svg viewBox="0 0 24 24"><path d="M12 21 C4 15 4 8 8 7 C10 6.5 12 8 12 10 C12 8 14 6.5 16 7 C20 8 20 15 12 21 Z"/></svg>',balance:'<svg viewBox="0 0 24 24"><path d="M12 3 L12 21 M5 21 L19 21 M5 7 L19 7 M5 7 L2 14 L8 14 Z M19 7 L16 14 L22 14 Z"/></svg>'},St=[{id:"dream",intro:!0,video:"/videos/vision-dream.mp4",figure:"/images/vision/figure-dream.png",svg:pr},{id:"symbol",n:"01",icon:"ankh",video:"/videos/vision-symbol.mp4",svg:cr(`<g transform="translate(116,-6)">${Eo}</g><path d="M124 22 q-8 -10 -16 -4" ${ht}/>`)},{id:"nation",n:"02",video:"/videos/vision-nation.mp4",icon:"pyramid",svg:`<svg viewBox="0 0 200 250" ${ht}>${Array.from({length:9}).map((o,n)=>{const s=34+n%3*52,c=50+Math.floor(n/3)*62;return`<rect x="${s}" y="${c}" width="28" height="38" rx="3"/><path d="M${s+14} ${c+7} l0 24 M${s+5} ${c+17} l18 0"/>`}).join("")}</svg>`},{id:"temple",n:"03",video:"/videos/vision-temple.mp4",icon:"heartpaw",svg:`<svg viewBox="0 0 200 250" ${ht}><path d="M40 200 l0 -70 l60 -42 l60 42 l0 70 Z"/><path d="M40 130 l60 -42 l60 42"/><rect x="86" y="150" width="28" height="50"/><circle cx="100" cy="58" r="18"/><path d="M100 49 l0 18 M91 58 l18 0"/></svg>`},{id:"centers",n:"04",video:"/videos/vision-centers.mp4",icon:"balance",svg:`<svg viewBox="0 0 200 250" ${ht}><ellipse cx="100" cy="158" rx="78" ry="28"/>${Array.from({length:6}).map((o,n)=>{const s=n/6*Math.PI*2,c=100+Math.cos(s)*78,p=158+Math.sin(s)*28;return`<circle cx="${c.toFixed(0)}" cy="${p.toFixed(0)}" r="8"/>`}).join("")}<path d="M100 46 l0 66 M72 64 l56 0 M72 64 l-10 24 l20 0 Z M128 64 l-10 24 l20 0 Z"/></svg>`},{id:"era",n:"05",video:"/videos/vision-era.mp4",icon:"ankh",svg:`<svg viewBox="0 0 200 250" ${ht}><g transform="translate(66,86) scale(2)">${Eo}</g><path d="M40 60 q60 -40 120 0" stroke-dasharray="2 7" opacity="0.5" stroke="${Ma}"/></svg>`}],hr=St.map(o=>o.video??null),Ao={background:"linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 1px 1px rgba(110,71,16,0.20))"},mr=["b1","b2","b3"];function ur({src:o,poster:n,className:s}){const c=r.useRef(null),[p,l]=r.useState(!1),f=Qi();return r.useEffect(()=>{const m=c.current;if(!m)return;if(!("IntersectionObserver"in window)){l(!0);return}const y=new IntersectionObserver(N=>{N.some(O=>O.isIntersecting)&&(l(!0),y.disconnect())},{rootMargin:"150% 0px"});return y.observe(m),()=>y.disconnect()},[]),e.jsx("video",{ref:c,className:s,src:p?o:void 0,poster:p||f?n:void 0,autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:p?"auto":"none"})}function Xr({embedded:o=!1,flow:n=!1,onWatch:s,heroOnly:c=!1}={}){const p=Ca(),l=_e(),{lang:f}=Dt(),m=ir[f]??"en",[y,N]=r.useState(null),[O,x]=r.useState(!1),[F,j]=r.useState(""),v=r.useRef(null),_=r.useRef([]),[Z,L]=r.useState(typeof window<"u"?window.innerWidth<768:!1);r.useEffect(()=>{const w=()=>L(window.innerWidth<768);return w(),window.addEventListener("resize",w),()=>window.removeEventListener("resize",w)},[]),r.useEffect(()=>{if(!O)return;let w=!1;return rr().then(A=>{w||(_.current=A[m]??A.en??[])}).catch(()=>{_.current=[]}),()=>{w=!0}},[O,m]),r.useEffect(()=>{if(!O){j("");return}let w,A=!1;return sr().then(()=>{if(A)return;const H=window.YT,T=()=>{var ne,ce;const B=v.current;try{(ne=B==null?void 0:B.unloadModule)==null||ne.call(B,"captions"),(ce=B==null?void 0:B.unloadModule)==null||ce.call(B,"cc")}catch{}};v.current=new H.Player("yt-intro-frame",{events:{onReady:()=>{T(),w=window.setInterval(()=>{const B=v.current;if(!(B!=null&&B.getCurrentTime))return;const ne=B.getCurrentTime(),ce=_.current.find(be=>ne>=be.s&&ne<be.e);j(ce?ce.t:"")},200)},onStateChange:B=>{B.data===1&&T()}}})}),()=>{var H,T;A=!0,w&&window.clearInterval(w);try{(T=(H=v.current)==null?void 0:H.destroy)==null||T.call(H)}catch{}v.current=null,j("")}},[O]);const R=r.useRef(null),z=r.useRef(null),[t,a]=r.useState(0),[i,d]=r.useState(0),[h,b]=r.useState(!1);return r.useEffect(()=>{const w=R.current;if(!w)return;const A=w.closest(".lsh-scroll")??window,H=A===window,T=()=>A,B=()=>H?window.scrollY:T().scrollTop,ne=()=>H?window.innerHeight:T().clientHeight,ce=K=>K.getBoundingClientRect().top-(H?0:T().getBoundingClientRect().top),be=(K,ae)=>A.scrollTo({top:K,behavior:ae?"smooth":"auto"});let Ne=!1,q=ce(w),he=!1;const pe=!n;let ze=0,ve=B(),ie=1;const ke=.25;let ye=!1;const Ge=()=>{if(n||ye||he||!window.matchMedia("(min-width: 768px)").matches)return;const K=z.current,ae=ne(),De=B(),Ye=De+ce(w),Fe=K?De+ce(K):1/0,xe=Fe-ae,qe=ie>0;let He=null;if(De<Ye-4){const Ue=Ye>0?De/Ye:0;He=qe?Ue>=ke?Ye:0:Ue<=1-ke?0:Ye}else if(De>xe+4){const Ue=Math.max(0,Math.min(1,(De-xe)/ae));He=qe?Ue>=ke?Fe:xe:Ue<=1-ke?xe:Fe}else return;He==null||Math.abs(He-De)<6||(ye=!0,be(He,!0),window.setTimeout(()=>{ye=!1},680))};let Ie=0;const Me=()=>{window.clearTimeout(Ie),Ie=window.setTimeout(Ge,120)},Ae=()=>{Ne||(Ne=!0,requestAnimationFrame(()=>{const K=ne(),ae=ce(w);B()!==ve&&(ie=B()>ve?1:-1,ve=B());const De=w.offsetHeight-K,Ye=B()+ae;if(pe&&!he&&q>0&&ae<=0&&(he=!0,ze=performance.now()+500),he)if(ae>2)he=!1;else{ae<-.5&&be(Ye,!1),d(0),a(0),b(!0),performance.now()>=ze&&(he=!1),q=ae,Ne=!1;return}const Fe=De>0?Math.max(0,Math.min(1,-ae/De)):0;d(Fe),a(Math.max(0,Math.min(St.length-1,Math.floor(Fe*St.length)))),b(xe=>!xe&&ae<K*.3?!0:xe&&ae>K*.55?!1:xe),q=ae,Ne=!1}))};return A.addEventListener("scroll",Ae,{passive:!0}),A.addEventListener("scroll",Me,{passive:!0}),Ae(),()=>{A.removeEventListener("scroll",Ae),A.removeEventListener("scroll",Me),window.clearTimeout(Ie)}},[n]),e.jsxs("div",{className:"lab-papyrus vision-root flex flex-col min-h-[100dvh] relative",children:[!o&&e.jsx(Xt,{path:"/vision-lab",title:"The Vision — A World Where No Dog Is Forgotten | DOGYPT",description:"Uniting dog lovers under one philosophy to help dogs in need. This is the vision of DOGYPT, the movement where Dog is God."}),e.jsx("div",{"aria-hidden":!0,className:"lab-pageveil",style:{position:"fixed",inset:0,background:Le.pageVeil,zIndex:0,pointerEvents:"none"}}),e.jsx("style",{children:`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s /religion-lab
           aj WALL LABom). Kotvenie na 100lvh je prevzaté z pôvodnej .dark-bg::before:
           inset:0 by pripol spodok pozadia na spodok viewportu, takže keď sa na mobile
           pri scrolle schová adresný riadok, podklad by sa prepočítal a viditeľne
           poskočil. Veľký viewport drží výšku boxu konštantnú. */
        .lab-papyrus { position: relative; background-color: ${Le.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100lvh;
          background: ${Le.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* ── 2-col layout (mobile: flex column with reordered items via display:contents) ── */
        .mission-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(14px, 2.4vh, 22px);
          width: 100%;
          max-width: 1120px;
          text-align: center;
        }
        @media (max-width: 767px) {
          .mission-grid { gap: clamp(18px, 3vh, 30px); }
        }

        /* Mobile-only headline — match /religion .codex-headline mobile size (IN DOG WE TRUST) for cross-page consistency */
        @media (max-width: 767px) {
          .headline-main {
            font-size: 2.8rem !important;
            letter-spacing: 0.03em !important;
            line-height: 1.04 !important;
          }
          .headline-sub {
            font-size: 1.5rem !important;
            letter-spacing: 0.06em !important;
            margin-top: 10px !important;
            white-space: nowrap !important;
          }
        }
        @media (min-width: 768px) {
          .mission-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: clamp(28px, 4.5vw, 64px);
            align-items: stretch;
            text-align: left;
          }
        }

        /* Body paragraph */
        .mission-para {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.85rem, 1.15vw, 0.98rem);
          font-weight: 400;
          color: rgba(35,22,8,0.82);
          line-height: 1.65;
          letter-spacing: 0.005em;
          margin: 0;
          max-width: 480px;
        }
        @media (max-width: 767px) {
          .mission-para {
            font-size: clamp(15px, 4.4vw, 19px);
            line-height: 1.5;
            max-width: 92%;
            color: rgba(35,22,8,0.86);
            text-align: center;
            text-wrap: balance;
          }
        }

        /* Left column: middle group centered, CTA pinned to bottom (aligns with image bottom edge) */
        .mission-left {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2.8vh, 28px);
        }
        @media (min-width: 768px) {
          .mission-left {
            gap: clamp(18px, 2.8vh, 26px);
            padding-top: 2px;
            justify-content: flex-start;
          }
        }
        .mission-left-middle {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 3.2vh, 34px);
        }
        .mission-bottom {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        @media (max-width: 767px) {
          .mission-bottom { align-items: center; }
        }

        /* ── MOBILE: 2 "podlažia" – snap scroll, každá sekcia = jeden viewport ── */
        .m-screen {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 767px) {
          .topbar-wrap {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #F8EDD6;
            flex-shrink: 0;
          }
          .mission-grid { gap: 0; max-width: none; }
          .m-screen {
            padding: 0 5vw;
          }
          .m-screen-a {
            justify-content: flex-start;
            padding-top: clamp(24px, 5vh, 48px);
            padding-bottom: clamp(40px, 8vh, 70px);
            gap: clamp(16px, 2.8vh, 24px);
          }
          .m-screen-b {
            justify-content: flex-start;
            padding-top: clamp(10px, 3vh, 28px);
            padding-bottom: clamp(48px, 10vh, 90px);
            gap: clamp(22px, 3.6vh, 32px);
          }
        }
        @media (min-width: 768px) {
          .m-screen { display: contents; }
          /* Sticky top bar across the whole page (incl. the WHAT IF pin section,
           * which is itself sticky). z-index above wf-sticky/progress; soft fade so
           * the dark heroglyph page isn't hard-masked behind the logo + nav. */
          .topbar-wrap {
            position: sticky; top: 0; z-index: 60;
            background: linear-gradient(180deg, rgba(248,237,214,0.96) 58%, rgba(248,237,214,0));
            padding-bottom: 14px;
          }
        }

        /* Desktop: 3 groups in left column with space-between — top group / CTA centered / pills bottom */
        @media (min-width: 768px) {
          .mission-left { justify-content: space-between; }
          .mission-bottom { align-self: flex-start; }
        }
        .mission-subline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.6rem, 0.85vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(60,40,12,0.52);
          margin: 0;
        }

        /* ── PILLARS (ROADMAP) ── */
        .mission-pillars {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: clamp(4px, 0.55vw, 7px);
          justify-content: flex-start;
        }
        @media (max-width: 767px) {
          .mission-pillars {
            justify-content: center;
            gap: 9px;
            max-width: 92%;
          }
        }
        .mission-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.55rem, 0.85vw, 0.68rem);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.86);
          background: rgba(255,252,244,0.62);
          border: 1px solid rgba(140,96,20,0.60);
          border-radius: 999px;
          padding: 4px 10px;
          white-space: nowrap;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .mission-pill:hover {
          background: rgba(250, 243, 225, 0.20);
          border-color: rgba(250, 243, 225, 0.95);
          transform: translateY(-1px);
        }
        @media (max-width: 767px) {
          .mission-pill {
            font-size: 11px;
            letter-spacing: 0.14em;
            padding: 5px 11px;
            gap: 6px;
            border-radius: 999px;
          }
        }
        .mission-pill-icon {
          width: 13px;
          height: 13px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(96%) sepia(7%)
                  saturate(382%) hue-rotate(355deg) brightness(101%) contrast(96%);
          opacity: 0.85;
        }
        @media (max-width: 767px) {
          .mission-pill-icon { width: 12px; height: 12px; }
          .pill-status-dot { width: 6px; height: 6px; }
        }

        /* Status dot — done (green) / progress (orange pulsing) / future (red) */
        .pill-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .pill-status-dot.done {
          background: #4ADE80;
          box-shadow: 0 0 6px rgba(74, 222, 128, 0.65);
        }
        .pill-status-dot.progress {
          background: #F59E0B;
          box-shadow: 0 0 7px rgba(245, 158, 11, 0.75);
          animation: dotPulse 1.4s ease-in-out infinite;
        }
        .pill-status-dot.future {
          background: #EF4444;
          box-shadow: 0 0 5px rgba(239, 68, 68, 0.45);
          opacity: 0.75;
        }
        .pill-status-dot.goal {
          background: #2E5FD0;
          box-shadow: 0 0 7px rgba(46, 95, 208, 0.75);
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 7px rgba(245, 158, 11, 0.85); }
          50%      { opacity: 0.55; transform: scale(0.78); box-shadow: 0 0 4px rgba(245, 158, 11, 0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pill-status-dot.progress { animation: none; }
        }

        /* Force row break after The App (pill #3) so The Mission starts row 2 */
        .pill-row-break {
          flex-basis: 100%;
          height: 0;
        }
        .pill-row-break-mobile { display: none; }
        .pill-row-break-desktop { display: block; }
        @media (max-width: 767px) {
          .pill-row-break-mobile { display: none; }
          .pill-row-break-desktop { display: none; }
        }

        /* Roadmap connector — papyrus "···" inline */
        .pill-connector {
          display: inline-flex;
          align-items: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.55rem, 0.85vw, 0.7rem);
          color: rgba(60,40,12,0.46);
          letter-spacing: 0.22em;
          padding: 0 2px;
          user-select: none;
          pointer-events: none;
        }

        /* Desktop: per-pill floating tooltip (papyrus + downward arrow) */
        .pill-tooltip-float {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          width: clamp(220px, 22vw, 280px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(140,96,20,0.72);
          border-radius: 10px;
          padding: 9px 13px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          line-height: 1.45;
          letter-spacing: 0.005em;
          text-transform: none;
          color: #1a0a05;
          white-space: normal;
          text-align: left;
          z-index: 20;
          pointer-events: none;
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201, 154, 63, 0.22);
          animation: tooltipFloatFade 0.18s ease-out;
        }
        .pill-tooltip-float::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: rgba(140,96,20,0.72);
        }

        /* Mobile: shared block below pills, papyrus styling (matches /heroglyph) */
        .pill-tooltip {
          width: 100%;
          max-width: 360px;
          margin: 4px auto 0;
          padding: 10px 14px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(140,96,20,0.72);
          border-radius: 10px;
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201, 154, 63, 0.22);
          text-align: left;
          animation: tooltipFade 0.18s ease-out;
        }
        .pill-tooltip-label {
          font-family: 'Cinzel', serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: #1a0a05;
          line-height: 1.25;
        }
        .pill-tooltip-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.005em;
          line-height: 1.45;
          color: #4a3010;
          margin-top: 4px;
        }
        @media (max-width: 767px) {
          .pill-tooltip {
            position: absolute;
            top: calc(100% + 10px);
            left: 50%;
            transform: translateX(-50%);
            width: max-content;
            max-width: min(360px, 86vw);
            padding: 11px 14px;
            margin: 0;
            z-index: 30;
            cursor: pointer;
          }
          .pill-tooltip-label { font-size: 12px; letter-spacing: 0.10em; }
          .pill-tooltip-text  { font-size: 12px; line-height: 1.45; }
        }
        /* Desktop floating: preserve translateX(-50%) centering during fade */
        @keyframes tooltipFloatFade {
          from { opacity: 0; transform: translate(-50%, -4px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        /* Mobile shared block: opacity-only (no transform on block) */
        @keyframes tooltipFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Active pill state */
        .mission-pill.is-active {
          background: rgba(201, 154, 63, 0.22);
          border-color: rgba(201, 154, 63, 0.95);
        }

        /* ── SQUARE COMPARISON ── */
        .square-frame {
          position: relative;
          width: 100%;
          max-width: min(62vh, 560px);
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 1px rgba(140,96,20,0.28) inset;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          .square-frame {
            max-width: 76vw;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* ── MOBILE: pulsing scroll arrow under headline (section A only) ── */
        .scroll-arrow {
          display: none;
        }
        @media (max-width: 767px) {
          .scroll-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: clamp(6px, 1.4vh, 14px);
            animation: scrollArrowPulse 1.8s ease-in-out infinite;
          }
          .scroll-arrow svg {
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.35));
          }
        }
        @keyframes scrollArrowPulse {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50%      { transform: translateY(7px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-arrow { animation: none; opacity: 0.9; }
        }
        .square-label {
          position: absolute;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.78rem);
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          z-index: 4;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85);
        }
        .square-label.today {
          top: 14px;
          left: 14px;
          color: rgba(60,40,12,0.62);
        }
        .square-label.dogypt {
          bottom: 14px;
          right: 14px;
          color: #F5C73D;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85), 0 0 14px rgba(245,199,61,0.45);
        }

        /* ── CTA — same DNA as /heroglyph ── */
        .mission-cta {
          padding: clamp(11px, 1.7vh, 15px) clamp(28px, 4.4vw, 44px);
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: clamp(0.84rem, 1.2vw, 0.98rem);
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s;
          animation: missionCtaPulse 3.2s ease-in-out infinite;
          align-self: flex-start;
        }
        @media (max-width: 767px) {
          .mission-cta {
            align-self: center;
            padding: 13px 34px;
            font-size: 0.95rem;
            letter-spacing: 0.14em;
            margin: clamp(18px, 3.5vh, 30px) 0;
          }
          .mission-pillars { margin-bottom: 0; }
        }
        .mission-cta:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .mission-cta:active { transform: scale(0.98); }
        @keyframes missionCtaPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mission-cta { animation: none; }
        }

        /* ── Eyebrow / overline ── */
        .eyebrow {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.62rem, 0.95vw, 0.74rem);
          letter-spacing: 0.36em;
          color: rgba(60,40,12,0.52);
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .eyebrow::before {
          content: '';
          height: 1px;
          width: clamp(20px, 3vw, 32px);
          background: rgba(140,96,20,0.45);
        }

        /* ── INTRO VIDEO HERO (top section) ── */
        .vision-video-hero {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(18px, 3vh, 30px);
          padding: clamp(28px, 6vh, 60px) 5vw clamp(36px, 7vh, 72px);
          min-height: calc(100dvh - 72px);
          text-align: center;
        }
        @media (max-width: 767px) {
          /* Fill the band between the sticky top-bar (~89px) and the viewport bottom,
           * then centre the whole hero block within it. */
          .vision-video-hero {
            min-height: calc(100svh - 89px);
            justify-content: center;
            padding-top: clamp(12px, 2vh, 20px);
            padding-bottom: clamp(12px, 2vh, 20px);
            gap: clamp(18px, 3vh, 30px);
          }

        .video-hero-title { font-size: clamp(2.9rem, 12vw, 3.5rem) !important; }
        }

          /* ── ROZDELENÁ OBRAZOVKA JE VEC FILMU, NIE TEJTO STRÁNKY ─────────
           Wrappery sú v základe display: contents, teda pre rozloženie
           NEEXISTUJÚ — samostatná /vision vyzerá presne ako predtým. Dva
           stĺpce, prilepenie a choreografiu im dáva OnePage.tsx (scoped na
           .op-root), lebo to je jeho réžia, nie vlastnosť vízie. */
        .vhero-inner, .vhero-stage { display: contents; }

        /* ── TRI BLOKY (len vo filme) ────────────────────────────────────
           Matej 28. 8. 2026: *„dajme ich teda zlaté a dajme čísla namiesto
           ikoniek čísla v krúžku 1-3… maju byť aktívne pri dotyku myšou"*.
           Predtým to boli takmer neviditeľné bloky s hand-drawn ikonkou
           v lapise — *„otrasne neladia k prostrediu"*. Zlatý rám ich vracia
           k tomu, čím je celý film: papyrus v zlate. */
        .vhero-blocks { display: flex; flex-direction: column; gap: clamp(14px, 2.2vh, 22px); }
        /* Nadpis nesie podčiarknutie, nie inú farbu (Matej: *„ten nadpis by
           trebalo podporiť nejak vizuálne… alebo nejakou čiarou pod… je to
           také prázdne"*). Čiara je brandový prvok — tá istá zlatá vyblednutá
           do strán, aká delí obsah v ústave; iná farba by na obrazovke
           založila druhé zlato. ::after, nie súrodenec: patrí k nadpisu,
           takže musí aj nabiehať s ním. */
        .vhero-h2 {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.9rem, 3.4vw, 3rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
          position: relative;
          padding-bottom: clamp(12px, 1.6vh, 18px);
        }
        .vhero-h2::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: min(220px, 60%);
          height: 2px;
          background: linear-gradient(90deg,
            rgba(201,154,63,0) 0%,
            rgba(201,154,63,0.85) 22%,
            rgba(201,154,63,0.85) 78%,
            rgba(201,154,63,0) 100%);
        }
        .vhero-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: clamp(10px, 1.6vh, 16px); }
        /* ╔═ ZLATÝ BLOK, BLEDÝ HOVER ═ (Matej 28. 8. 2026, 3. kolo) ══════
           *„3 bloky urob zlaté a pri prejdení myšou zblednú a kruh kde je číslo
           bude plný lapis a bledé číslo."* Predchádzajúce kolo dalo blokom len
           zlatý RÁM na papyruse — to už bol nábytok, nie tri kroky.
           Pokoj = ZLATO (konštrukcia), dotyk = LAPIS (moja voľba) — presňe tá
           deliaca čiara z brand manuálu. Krúžok je jediná plná farebná plocha
           a je len JEDEN naraz (hover), takže hlavné CTA obrazovky nemá
           konkurenciu. */
        .vhero-item {
          display: flex;
          /* ⚠️ UŽ NIE center: odkedy má blok chip v rohu a popis na dva riadky, je
             vyšší než krúžok, a stredovanie by mu číslo posunulo doprostred textu.
             Číslo patrí k PRVÉMU riadku — je to poradie, nie ozdoba vedľa odseku. */
          align-items: flex-start;
          position: relative;
          gap: clamp(12px, 1.4vw, 18px);
          padding: clamp(12px, 1.7vh, 18px) clamp(14px, 1.4vw, 20px);
          border-radius: 14px;
          /* ⚠️ BRANDOVÁ ZLATÁ, NIE ORANŽOVÁ (Matej 28. 8. 2026: *„myslel som zlatu
             tmavu brand — nie zlatu oranžovu, tato zlata oranžová je ainubisova"*).
             Prvé kolo siahlo po gradiente z .btn-gold (#F5C73D→#E69E1A) — ten je
             LOCKED pre CTA tlačidlo, ale ako VÝPLŇ celého bloku je z neho žltá
             plocha, ktorú si Matej spája s AINUBISOM. Rampa dole stojí na tokene
             #C99A3F a na tých istých zastávkach ako TITLE_GRAD nadpisov. */
          background: linear-gradient(140deg, #D6AC55 0%, #C99A3F 46%, #A3782B 100%);
          border: 1.5px solid #8C6014;
          /* ⚠️ ŠTYRI VRSTVY, KAŽDÁ NIEČO INÉ — bez nich je to plochý obdĺžnik.
             1) vrhnutý tieň = blok leží NAD papyrusom
             2) tvrdá spodná hrana = jeho HRÚBKA (bez nej nemá bok)
             3) horný inset highlight = svetlo zhora
             4) spodné inset zatienenie = zaguľatenie plochy dole.
             Zrno pridáva .vhero-item::before nižšie: bez neho je to farba, nie materiál. */
          box-shadow:
            0 12px 26px -14px rgba(70,44,6,0.60),
            0 2px 0 rgba(110,71,16,0.55),
            inset 0 1px 0 rgba(255,246,222,0.55),
            inset 0 -12px 20px -14px rgba(70,44,6,0.55);
          /* ⚠️ Prechod smie byť KRÁTKY a smie viesť len na hover. Vo filme
             mení krytie blokov scroll v každom snímku — dlhší prechod by sa
             za prstom vliekol, tá istá pasca ako pri zvieratách. */
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        /* Hover = blok ZBLEDNE na papyrus. Nie stmavne a nezosvetlí sa — vymení
           si úlohu s krúžkom, takže z troch rovnakých zlatých pruhov vystúpi práve
           ten jeden, na ktorom stojí myš. */
        .vhero-item:hover {
          transform: translateY(-3px);
          background: linear-gradient(140deg, #FDF8EC 0%, #F3E7CE 100%);
          border-color: #C99A3F;
          box-shadow:
            0 18px 34px -14px rgba(110,71,16,0.55),
            0 2px 0 rgba(201,154,63,0.45),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -10px 18px -14px rgba(140,96,20,0.40);
        }
        /* ⚠️ SLOVESO MUSÍ MAŤ HOVER VARIANT, INAK NA PAPYRUSE ZANIKNE
           (Matej 28. 8. 2026: *„chipy pri dotyku myšou zanikaju ako aj prve slovo"*).
           Je BLEDÉ na zlatom — a hover blok zbledne, teda bledé na bledom. Ide preto
           do LAPISU a drží pár s krúžkom, ktorý sa v tej istej chvíli tiež stáva
           lapisovým. Chip tento problém už nemá: je lapisový natrvalo. */
        .vhero-item:hover .vhero-v {
          color: ${Y.edge};
          text-shadow: none;
        }
        /* Číslo v krúžku — poradie, nie ozdoba. Cinzel, lebo je to identita
           kroku; Space Grotesk by z neho spravil údaj. */
        .vhero-num {
          flex: 0 0 auto;
          width: clamp(30px, 2.4vw, 36px);
          height: clamp(30px, 2.4vw, 36px);
          border-radius: 999px;
          border: 1.5px solid #C99A3F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.95rem, 1.1vw, 1.1rem);
          line-height: 1;
          /* ⚠️ PAPYRUS, NIE BIELA (Matej 28. 8. 2026: *„tie čísla daj do papyrusovej farby
             nie bielej"*). Pôvodné #FDF8EC→#F6EAD0 je takmer biele a na zlate to bol
             svetelný bod, nie súčasť dosky. Radiálny gradient so svetlom vľavo hore
             + inset tieň dole = guľôčka, nie kruh. */
          color: #5A3B0E;
          background: radial-gradient(120% 120% at 32% 26%, #F7ECD2 0%, #EBD9AF 55%, #D9C08C 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,252,244,0.85),
            inset 0 -3px 6px -3px rgba(110,71,16,0.55),
            0 2px 4px -1px rgba(70,44,6,0.45);
          transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }
        /* ⚠️ Farby lapisu sa NEOPÍSUJÚ — LAPIS v navGoldSkin.ts je jediný
           zdroj (brand kánon 28. 8. 2026). Číslo je BLEDÉ, nie zlaté
           (LAPIS.ink): tak si to Matej vypýtal a na 30 px krúžku je papyrus
           čitateľnejší než zlato na modrej. */
        .vhero-item:hover .vhero-num {
          background: radial-gradient(120% 120% at 32% 26%, #2A4CA8 0%, ${Y.edge} 55%, ${Y.deep} 100%);
          border-color: ${Y.deep};
          color: #F3E4C4;
          box-shadow:
            inset 0 1px 0 rgba(201,154,63,0.38),
            inset 0 -3px 7px -3px rgba(0,0,0,0.55),
            0 3px 8px -2px rgba(5,15,48,0.60);
        }
        /* Zrno — 3 % šumu upečené do SVG, nie samostatná priehľadnosť. Robí z plochy
           materiál; bez neho vyzerá zlato ako výplň vo Figme. */
        .vhero-item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.16'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
          opacity: 0.35;
          transition: opacity 160ms ease;
        }
        .vhero-item:hover::before { opacity: 0.16; }
        .vhero-item > * { position: relative; z-index: 1; }
        .vhero-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .vhero-t {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1rem, 1.25vw, 1.22rem);
          letter-spacing: 0.015em;
          color: #2a1608;
          /* Rezerva pre chip — ten je absolútny, takže si miesto sám nevypýta. */
          padding-right: clamp(120px, 11vw, 170px);
        }
        /* SLOVESO — bledé na zlatom (Matej 28. 8. 2026: *„vždy na začiatku bude slovo —
           spojiť, vytvoriť, pomáhať, ktoré by mohlo byť výraznejšie? bledé na tom
           zlatom?"*). Nie väčšie a nie iná rodina: v jednej vete by druhá veľkosť
           spravila dva nadpisy. Rozdiel nesie SVETLOSŤ a preto sa dá čítať aj to,
           že sloveso a zvyšok vety patria k sebe. */
        .vhero-v {
          font-style: normal;
          color: #FBF5E6;
          /* ⚠️ VÝRAZNOSŤ NESIE OBRYS, NIE FARBA — a je to fyzika, nie vkus. Zlato
             #C99A3F má relatívnu luminanciu 0.34, takže NAJVYŠŠÍ možný kontrast bledej
             na ňom je 2,7:1 (odmerané: 2,36). Nad to sa svetlejšou farbou dostať nedá.
             Preto dve BLÍZKE vrstvy tieňa — tvrdá hrana o 1 px + mäkké lôžko; blízke
             vrstvy sa sčítavajú, širšie rozostrenie by len zriedlo. */
          text-shadow: 0 1px 0 rgba(70,44,6,0.55), 0 2px 5px rgba(70,44,6,0.45);
          letter-spacing: 0.05em;
        }
        /* CHIP — výsledok bloku, papyrusový štítok na zlatej doske. Absolútny, aby
           nevstupoval do lámania nadpisu; nadpis mu drží miesto vlastným padding-right. */
        .vhero-chip {
          position: absolute;
          top: clamp(8px, 1vh, 12px);
          right: clamp(10px, 1vw, 14px);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: clamp(0.56rem, 0.62vw, 0.68rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          /* ⚠️ LAPISOVÁ PILULKA, A HOVEROM SA NEMENÍ (Matej 28. 8. 2026: *„chipy urobiť
             tmavo modré lapisové — tie sa nebudú hoverom meniť = modrý pils, bledé
             písmo"*). Tým odpadol celý predošlý problém: chip bol papyrusový, teda
             menil sa spolu s doskou a na vybledenom bloku zanikal. Vlastná farba,
             ktorú doska nemá ani v jednom stave, ho drží čitateľný v oboch — a je to
             menej pohyblivých častí, nie viac.
             Písmo je BLEDÉ (papyrus), nie zlaté LAPIS.ink: pri 9 px je zlato na modrej
             mäkké a Matej pýtal bledé. To isté #F3E4C4 nesie číslo v lapisovom krúžku,
             takže obe modré veci hovoria jedným inkoustom. */
          color: #F3E4C4;
          background: ${Y.grad};
          border: 1px solid ${Y.deep};
          box-shadow: inset 0 1px 0 rgba(201,154,63,0.30), 0 2px 5px -2px rgba(5,15,48,0.55);
          border-radius: 999px;
          padding: 3px 9px;
          white-space: nowrap;
          line-height: 1.2;
        }
        .vhero-d {
          font-size: clamp(0.86rem, 0.95vw, 1rem);
          line-height: 1.5;
          /* Na zlatom podklade je 0.72 už šedý závoj — rovnaký text potrebuje
             na žltej plyši tmavší inkoust než na papyruse. */
          color: rgba(38,23,4,0.88);
        }
        @media (max-width: 767px) {
          .vhero-item { padding: 12px 13px; gap: 11px; border-radius: 12px; }
          /* 🚩 CHIP JE NA MOBILE SKRYTÝ A JE TO VEDOMÉ ROZHODNUTIE, NIE OPOMENUTIE.
             Odmerané pri 390 x 844: hero vízie (video + nadpis + tri bloky v jednej
             prilepenej obrazovke) meria BEZ chipu presne 840 px, teda 100 % okna —
             nula rezervy. Vedľa nadpisu sa chip na 386 px nezmestí, takže by musel mať
             vlastný riadok: +28 px na blok, +84 px spolu, a hero by pretieklo o 100 px.
             Zmenšovaním výplní a písma sa dá získať ~40 px, teda ani polovica.
             Obsah chipu je pritom ZHRNUTIE bloku, ktorý na mobile stojí hneď pod ním —
             na malej obrazovke nepridáva informáciu, len výšku.
             ⇒ Mobilná vízia potrebuje vlastný prechod (rovnako ako celý zvyšok filmu:
             „MOBIL NIE JE ZMENŠENÉ PC"); dovtedy chip patrí PC. */
          .vhero-chip { display: none; }
          .vhero-t { padding-right: 0; }
          .vhero-h2 { font-size: clamp(1.7rem, 8vw, 2.3rem); }
          .vhero-num { width: 28px; height: 28px; font-size: 0.92rem; }
        }
        /* Desktop: sticky topbar (~72px) sits in-flow above the hero, so centering
         * within (100dvh − 72px) pushes the optical centre ~36px below the true
         * viewport centre → looks low under the fading topbar. Bias content up via
         * a heavier bottom padding so it sits at the real viewport centre. */
        @media (min-width: 768px) {
          .vision-video-hero {
            padding-top: clamp(14px, 2vh, 26px);
            padding-bottom: clamp(84px, 11vh, 130px);
          }
        }
        .video-hero-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          letter-spacing: 0.03em;
          line-height: 1;
          margin: 0;
          text-transform: uppercase;
        }
        .video-embed-frame {
          position: relative;
          /* Cap by viewport height too, so the whole frame stays visible on short
           * laptops (reserve ~330px for topbar + nav + title + caption + padding).
           * Dolná poistka na 320px: na telefóne naležato je 100dvh len ~390px,
           * takže samotný calc() by zrazil šírku na pár px (poštová známka). */
          width: min(680px, 100%, max(320px, calc((100dvh - 330px) * 16 / 9)));
          aspect-ratio: 16 / 9;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          box-shadow:
            0 0 0 1.5px rgba(140,96,20,0.60),
            0 14px 40px rgba(110,71,16,0.28),
            0 0 60px 6px rgba(201,154,63,0.16);
          transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.45s ease;
        }
        /* Po kliku na "Watch ..." → náhľad sa zväčší + spustí prehrávanie */
        .video-embed-frame.is-playing {
          /* Rovnaká dolná poistka ako pri náhľade vyššie. */
          width: min(980px, 100%, max(320px, calc((100dvh - 330px) * 16 / 9)));
          box-shadow:
            0 0 0 1.5px rgba(140,96,20,0.72),
            0 18px 52px rgba(110,71,16,0.32),
            0 0 80px 10px rgba(201,154,63,0.20);
        }
        .video-embed-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        /* Vlastný titulkový overlay — posadený NAD vpálený news-chyron videa
           (YT vlastné titulky sú vypnuté cez cc_load_policy=0). */
        .intro-caption {
          position: absolute;
          left: 50%;
          bottom: 19%;
          transform: translateX(-50%);
          width: min(92%, 600px);
          text-align: center;
          pointer-events: none;
          z-index: 3;
        }
        .intro-caption span {
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
          background: rgba(0, 0, 0, 0.62);
          color: #fff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-weight: 600;
          font-size: clamp(0.78rem, 1.9vw, 1.02rem);
          line-height: 1.5;
          letter-spacing: 0.004em;
          padding: 0.1em 0.4em;
          border-radius: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
        }
        /* Clean facade poster — no YouTube chrome until played */
        .video-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: #000;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        .video-poster img,
        .video-bg-loop {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* ⚠️ SLUČKA JE MIERNE PRIBLÍŽENÁ — ORIEZKA CHYBY V SÚBORE, NIE ŠTÝL.
           Matej 28. 8. 2026: *„vo videu je chyba a niekde je vidno spodná hranica
           milimetrová napr čierna čo vyzerá zle"* — vision-intro-montage.mp4 má
           na niektorých záberoch po spodnej hrane tenký čierny prúžok, ktorý pri
           object-fit: cover dosadne presne na okraj rámu a číta sa ako chyba
           vykreslenia.
           2 % ROVNOMERNE, nie scaleY: vertikálne to ubere ~1 % zhora aj zdola,
           čo prúžok pokryje aj na najväčšom pláťne, a pomer strán ostane. ScaleY
           by obraz roztiahol a na tvárach je to vidieť.
           🔑 Sedí TU, nie vo filme: je to vlastnosť ASSETU, takže platí všade,
           kde sa slučka prehráva (aj samostatná /vision). Keď sa súbor
           preexportuje bez prúžku, zmizne aj toto pravidlo.
           ⚠️ Netýka sa YouTube iframe — ten má vlastný obraz a zväčšenie by
           orezalo jeho ovládanie. */
        .video-bg-loop { transform: scale(1.02); }
        /* Dark overlay so the looping bg video doesn't glare */
        .video-poster::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
          pointer-events: none;
        }
        .video-play-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: clamp(64px, 9vw, 84px);
          height: clamp(64px, 9vw, 84px);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(2px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .video-play-btn svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 10px rgba(201, 154, 63, 0.55));
        }
        .video-poster:hover .video-play-btn {
          transform: scale(1.08);
          background: rgba(0, 0, 0, 0.45);
        }
        .video-poster:active .video-play-btn { transform: scale(0.97); }
        .video-hero-caption {
          font-family: 'Cinzel', serif;
          font-size: clamp(0.64rem, 0.98vw, 0.82rem);
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(60,40,12,0.62);
          margin: 0;
          padding: 4px 2px;
          background: none;
          border: 0;
          cursor: pointer;
          display: inline-block;
          text-decoration: underline;
          text-decoration-color: rgba(140,96,20,0.60);
          text-decoration-thickness: 1px;
          text-underline-offset: 0.34em;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.2s ease, text-decoration-color 0.2s ease;
        }
        .video-hero-caption::before {
          content: '\\25B6';
          font-size: 0.7em;
          color: #8a5a14;
          margin-right: 9px;
          display: inline-block;
        }
        .video-hero-caption:hover {
          color: #8a5a14;
          text-decoration-color: #8a5a14;
        }
        .video-hero-caption:hover::before { color: #8a5a14; }

        /* Content area below the video — own viewport band on desktop */
        .vision-content-area { width: 100%; }
        @media (min-width: 768px) {
          .vision-content-area {
            min-height: 100dvh;
            padding-top: 40px;
            padding-bottom: 60px;
          }
        }

        /* ===== WHAT IF… pinned scrollytelling roadmap ===== */
        .wf-pin { position: relative; } /* tall: height = beats*100vh (inline) */

        /* Scroll-snap (desktop): the hand-off from the video hero (slide 1) to the
         * WHAT IF section (slide 2) snaps — you can't rest between them, the second
         * screen is pulled in and fixes. snap-stop:always forces a stop at wf-pin's
         * start (= pin engages). Inside the 600vh pin there are no further snap points,
         * so the beats scroll freely. Style only lives while /vision is mounted. */
        @media (min-width: 768px) {
          html { scroll-snap-type: y proximity; }
          /* NB: NO snap-align on the hero — it would snap the page down by the topbar
           * height on load and hide the menu. Only the WHAT IF section is a snap point. */
          .wf-pin { scroll-snap-align: start; scroll-snap-stop: always; }
        }
        .wf-sticky {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .wf-hint {
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          font-family: 'Cinzel', serif; font-size: 9px; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(60,40,12,0.46); z-index: 4;
        }
        .wf-grid {
          flex: 1; display: grid; grid-template-columns: 2.1fr 1fr;
          align-items: center; align-content: center; gap: clamp(18px, 3vw, 44px);
          max-width: 1480px; width: 100%; margin: 0 auto;
          /* top clears the sticky header, bottom clears the progress bar → the auto-height
           * row centres in the band between them instead of pinning to the top */
          padding: 84px clamp(20px, 5vw, 56px) 64px;
        }

        /* LEFT — papyrus scroll (rolled ends; colours from /religion .codex-paper) */
        .wf-scroll-col { display: flex; align-items: center; justify-content: center; }
        /* Big papyrus area — each beat is a self-contained baked papyrus+scene image
         * (square, on black) OR a fallback realistic-papyrus PNG + doodle. */
        .wf-papyrus {
          /* ╔═══ LOCKED 2026-06-03 (Matej OK: "toto je tá správna poloha") ═══╗
           * Poloha + rozmer papyrusu na PC pre VŠETKY beaty (zdieľaný kontajner).
           * NEMENIŤ bez výslovného OK:
           *   height: 68vh · width: calc(68vh * 815/892) · top: 25px · flex-shrink: 0
           *   (+ .wf-grid: align-content:center, padding 84px/64px)
           * Height-driven + EXPLICIT calc width (NIE aspect-ratio+auto — flexbox by
           * zrútil šírku). Papyrus PNG je orezaný natesno (815×892).
           * ╚════════════════════════════════════════════════════════════════╝ */
          position: relative; flex-shrink: 0; top: 25px;
          height: 68vh; width: calc(68vh * 815 / 892); max-width: 100%;
          margin: 0 auto;
        }
        .wf-illus {
          position: absolute; inset: 0; opacity: 0;
          transform: scale(0.97) translateY(8px);
          transition: opacity .5s ease, transform .5s ease;
        }
        /* Baked papyrus+scene image (or video) fills the whole area */
        .wf-scene-full { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        /* Canvas beat: papyrus PNG + figure-on-white multiplied (see PapyrusStage).
         * Container aspect == papyrus aspect → canvas fills edge-to-edge, transparent
         * surround lets the dark page show around the rolled scroll (no box). */
        .wf-scene-canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
        /* Fallback: realistic papyrus frame + doodle inset to the writable sheet body */
        .wf-scroll-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; }
        .wf-sheet-inner {
          position: absolute; z-index: 2;
          /* inset to the writable sheet of papyrus-scroll.webp (measured) + extra margin
           * so the figure sits in the middle, clear of the rolls and curled side edges */
          top: 22%; bottom: 24%; left: 29%; right: 29%;
          display: flex; align-items: center; justify-content: center;
        }
        .wf-fig { width: 100%; height: 100%; object-fit: contain; }
        .wf-illus.on { opacity: 1; transform: scale(1) translateY(0); }
        .wf-illus .wf-art { width: 100%; height: 100%; }
        .wf-illus .wf-art svg { width: 100%; height: 100%; }

        /* Ink self-draw: line-art strokes draw themselves when the beat activates.
         * Fixed dasharray (doodles are small) → each stroke reveals from 0; sub-strokes
         * stagger via nth-child so the drawing builds piece by piece. Re-runs each beat
         * because the .on class toggles on/off as wfState changes. */
        .wf-illus .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
        }
        .wf-illus.on .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
          animation: wfInkDraw 0.8s cubic-bezier(0.55, 0, 0.45, 1) forwards;
        }
        .wf-illus.on .wf-art svg > *:nth-child(1)  { animation-delay: 0.10s; }
        .wf-illus.on .wf-art svg > *:nth-child(2)  { animation-delay: 0.18s; }
        .wf-illus.on .wf-art svg > *:nth-child(3)  { animation-delay: 0.26s; }
        .wf-illus.on .wf-art svg > *:nth-child(4)  { animation-delay: 0.33s; }
        .wf-illus.on .wf-art svg > *:nth-child(5)  { animation-delay: 0.40s; }
        .wf-illus.on .wf-art svg > *:nth-child(6)  { animation-delay: 0.46s; }
        .wf-illus.on .wf-art svg > *:nth-child(7)  { animation-delay: 0.52s; }
        .wf-illus.on .wf-art svg > *:nth-child(8)  { animation-delay: 0.58s; }
        .wf-illus.on .wf-art svg > *:nth-child(9)  { animation-delay: 0.63s; }
        .wf-illus.on .wf-art svg > *:nth-child(n+10) { animation-delay: 0.68s; }
        @keyframes wfInkDraw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .wf-illus .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) {
            stroke-dashoffset: 0;
            animation: none;
          }
        }
        .wf-note {
          position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; z-index: 3;
          font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(90,58,12,0.4);
        }

        /* RIGHT — dark text column */
        .wf-text { position: relative; min-height: 360px; }
        /* Desktop: pull the text column left toward the (locked) papyrus — kills the
         * dead space between the centred scroll and the copy. Papyrus is NOT moved. */
        @media (min-width: 768px) {
          .wf-text { margin-left: clamp(-220px, -9vw, -90px); }
        }
        .wf-block {
          position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center;
          opacity: 0; transition: opacity .4s ease;
          pointer-events: none;
        }
        .wf-block.on { opacity: 1; pointer-events: auto; }
        /* Gradual text reveal — each line rises in sequence when the beat activates.
         * Motion lives on the children (block fades only) so lines cascade one by one;
         * re-runs each beat via the .on toggle. */
        .wf-block.on > * { animation: wfRise .55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wf-block.on > *:nth-child(1) { animation-delay: 0.08s; }
        .wf-block.on > *:nth-child(2) { animation-delay: 0.20s; }
        .wf-block.on > *:nth-child(3) { animation-delay: 0.32s; }
        .wf-block.on > *:nth-child(4) { animation-delay: 0.44s; }
        .wf-block.on > *:nth-child(5) { animation-delay: 0.56s; }
        @keyframes wfRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .wf-block.on > * { animation: none; }
        }

        /* ── SLIDE 1 → SLIDE 2 entrance (armed by JS .wf-armed when section enters pin range) ──
         * Papyrus unrolls top→bottom, the first beat's ink + text reveal as the entry
         * (held until armed so they don't play off-screen at mount), WHAT IF title blurs in. */
        .wf-sticky:not(.wf-armed) .wf-papyrus { clip-path: inset(0 0 100% 0); opacity: 0; }
        .wf-sticky.wf-armed .wf-papyrus { animation: wfUnroll 1s cubic-bezier(0.72, 0, 0.24, 1) both; }
        @keyframes wfUnroll {
          0%   { clip-path: inset(0 0 100% 0); opacity: 0; transform: translateY(-16px); }
          30%  { opacity: 1; }
          100% { clip-path: inset(0 0 0 0);    opacity: 1; transform: translateY(0); }
        }
        .wf-sticky:not(.wf-armed) .wf-illus.on .wf-art svg :is(path, rect, circle, ellipse, line, polyline, polygon) { animation: none; }
        .wf-sticky:not(.wf-armed) .wf-block.on > * { animation: none; opacity: 0; }
        .wf-sticky.wf-armed .wf-intro.on .wf-big {
          animation: wfTitleReveal 1.1s cubic-bezier(0.2, 1, 0.3, 1) 0.12s both;
        }
        @keyframes wfTitleReveal {
          from { opacity: 0; transform: translateY(26px) scale(0.93);
                 filter: drop-shadow(0 1px 1px rgba(110,71,16,0.18)) blur(9px); letter-spacing: 0.24em; }
          to   { opacity: 1; transform: none;
                 filter: drop-shadow(0 1px 1px rgba(110,71,16,0.18)) blur(0); letter-spacing: 0.04em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-sticky.wf-armed .wf-papyrus,
          .wf-sticky.wf-armed .wf-intro.on .wf-big { animation: none; }
          .wf-sticky:not(.wf-armed) .wf-papyrus { clip-path: none; opacity: 1; }
          .wf-sticky:not(.wf-armed) .wf-block.on > * { opacity: 1; }
        }
        /* Unified headline + lead typography for ALL beats (taken from slide 1) */
        .wf-block .wf-big {
          font-family: 'Cinzel', serif; font-weight: 700;
          /* smaller than before so long SK words (STREDISKÁ, DIGITÁLNY…) don't overflow;
             line-height 1.08 leaves headroom so uppercase carons (Č/Š/É) aren't clipped
             by the background-clip:text line box */
          font-size: clamp(2.6rem, 6.2vw, 4.8rem); line-height: 1.08; letter-spacing: 0.04em;
          white-space: nowrap; /* 2-line white/gold headline, no wrap → max 2 lines */
        }
        .wf-big-w { color: rgba(35,22,8,0.90); }
        .wf-big-g {
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .wf-block .wf-lead {
          margin-top: 24px; font-style: normal; color: rgba(60,40,12,0.62);
          font-size: clamp(1.05rem, 2.4vw, 1.35rem); line-height: 1.55; max-width: 34ch;
        }
        /* ── LAB: ZLATÁ NATVRDO V SLOVNÍKU ────────────────────────────────
           Reťazec vision.finale.lead nesie zvýraznené slovo ako inline style
           s farbou #F5C73D. Slovník je SPOLOČNÝ s ostrou tmavou /vision, takže
           opraviť to v i18n nejde — prefarbilo by to aj ju. Na papyruse je tá
           žltá takmer neviditeľná, preto sa prebíja tu a len tu.
           (Ten istý vzor má aj sprievodca v /pack. Keď sa raz slovník bude
           čistiť od inline farieb, toto pravidlo padne s ním.) */
        .vf-lead span { color: #8a5a14 !important; }

        /* highlighted key words in the story */
        .wf-lead .wf-hl {
          font-style: italic; font-weight: 600; color: #8a5a14;
        }
        .wf-block .wf-num { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 0.3em; color: rgba(60,40,12,0.52); margin-bottom: 10px; }
        .wf-block .wf-anchor { font-family: 'Cinzel', serif; font-weight: 700; color: #6E4A12; font-size: clamp(1.8rem, 4.6vw, 3rem); line-height: 1; margin-bottom: 14px; letter-spacing: 0.05em; }
        .wf-block h3 { font-family: 'Cinzel', serif; font-weight: 600; font-size: clamp(1.15rem, 2.6vw, 1.7rem); line-height: 1.25; color: rgba(35,22,8,0.90); margin-bottom: 14px; max-width: 24ch; text-wrap: balance; }
        .wf-block p { font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.6; color: rgba(35,22,8,0.82); max-width: 40ch; margin-bottom: 20px; text-wrap: balance; }
        .wf-mech { display: flex; align-items: center; gap: 11px; padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(140,96,20,0.60); background: rgba(255,252,244,0.62); max-width: 40ch; }
        .wf-mech-ic { flex: 0 0 26px; width: 26px; height: 26px; }
        .wf-mech-ic svg { width: 100%; height: 100%; stroke: #6E4A12; fill: none; stroke-width: 1.6; }
        .wf-mech-txt { font-family: 'Cinzel', serif; font-size: clamp(.8rem, 1.7vw, .95rem); letter-spacing: 0.04em; color: rgba(35,22,8,0.86); font-weight: 600; }

        /* BOTTOM — progress indicator */
        .wf-progress { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 clamp(20px, 5vw, 60px) 26px; max-width: 1240px; margin: 0 auto; z-index: 4; }
        .wf-track { position: relative; height: 3px; background: rgba(140,96,20,0.20); border-radius: 3px; }
        .wf-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 3px; background: linear-gradient(90deg, rgba(140,96,20,0) 0%, #A3782B 55%, #6E4A12 100%); }
        /* Comet head — glowing tip at the leading edge of the progress fill. The bar
         * gradient (transparent → gold) reads as the trailing tail. */
        .wf-fill::after {
          content: '';
          position: absolute;
          right: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: radial-gradient(circle, #D8A93F 0%, #8a5a14 60%, rgba(110,71,16,0) 100%);
          box-shadow:
            0 0 4px 1px rgba(110,71,16,0.45),
            0 0 10px 3px rgba(110,71,16,0.22),
            0 0 18px 6px rgba(140,96,20,0.14);
          animation: wfCometPulse 1.6s ease-in-out infinite;
        }
        @keyframes wfCometPulse {
          0%, 100% { transform: translateY(-50%) scale(1); box-shadow: 0 0 4px 1px rgba(110,71,16,0.45), 0 0 10px 3px rgba(110,71,16,0.22), 0 0 18px 6px rgba(140,96,20,0.14); }
          50% { transform: translateY(-50%) scale(1.18); box-shadow: 0 0 6px 2px rgba(110,71,16,0.55), 0 0 14px 4px rgba(110,71,16,0.26), 0 0 24px 8px rgba(140,96,20,0.16); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-fill::after { animation: none; }
        }
        .wf-steps { display: flex; justify-content: space-between; margin-top: 14px; }
        .wf-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(60,40,12,0.46); transition: color .3s; }
        .wf-step .wf-knob { display: none; } /* dots removed — comet head carries the progress now */
        .wf-step.done { color: rgba(60,40,12,0.62); }
        .wf-step.active { color: #8a5a14; }

        @media (max-width: 767px) {
          /* DETERMINISTIC top offset (NOT centered): centering pushed the block above
           * the sticky top-bar on short phones (gap went negative). Fixed padding-top =
           * top-bar (~89px) + comfortable gap → papyrus always sits clear of the logo,
           * identical on every viewport height. */
          .wf-grid { grid-template-columns: 1fr; gap: 16px; padding: 120px 20px 40px; align-content: start; }
          .wf-scroll-col { order: -1; }
          .wf-papyrus { height: 54.14vh; width: calc(54.14vh * 815 / 892); max-width: 86%; } /* +10% +15% +7% */
          .wf-text { min-height: 250px; margin-top: 155px; } /* push headline+body below papyrus */
          /* Mobile typography: JOIN white+gold on ONE line (hide <br>, nbsp between) but allow
           * NATURAL wrap (white-space: normal) → short headings stay 1 line, long ones (FUNKČNÉ
           * STREDISKÁ) wrap to 2 at the space. Bigger font than desktop-scaled so it reads well.
           * line-height 1.08 = headroom for uppercase carons (Č/Š/É). */
          .wf-block .wf-big { font-size: clamp(2.1rem, 10vw, 2.9rem); line-height: 1.08; white-space: normal; }
          .wf-block .wf-big br { display: none; }
          .wf-block .wf-big-w::after { content: ' '; } /* breakable space → long heading wraps here */
          .wf-block .wf-lead { font-size: 0.95rem; margin-top: 18px; }
          .wf-steps { display: none; } /* mobile: labels were hidden + dots removed → empty row, drop it (comet bar carries progress) */
          .wf-progress { bottom: 30px; } /* lift the comet status bar up */
        }
        /* Short phones (SE-class): shrink papyrus + lift the top offset so the longest
         * beat's body never spills past the progress bar. */
        @media (max-width: 767px) and (max-height: 740px) {
          .wf-grid { padding-top: 96px; }
          .wf-papyrus { height: 37.45vh; width: calc(37.45vh * 815 / 892); } /* +10% +7% */
          .wf-text { margin-top: 20px; } /* short phones: keep the longest beat clear of the progress bar */
        }
      `}),!o&&e.jsx("div",{className:"topbar-wrap",children:e.jsx(Zt,{withNav:!0})}),e.jsx("section",{className:"vision-video-hero",style:{zIndex:2},children:e.jsxs("div",{className:"vhero-inner",children:[e.jsxs("div",{className:"vhero-stage",children:[!n&&e.jsx("h1",{className:"video-hero-title",children:e.jsx("span",{style:Ao,children:l("vision.hero.title")})}),e.jsx("div",{className:`video-embed-frame${O?" is-playing":""}`,children:O?e.jsxs(e.Fragment,{children:[e.jsx("iframe",{id:"yt-intro-frame",src:`https://www.youtube-nocookie.com/embed/TwSl_aOwbaY?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white&cc_load_policy=0&enablejsapi=1&origin=${encodeURIComponent(typeof window<"u"?window.location.origin:"")}`,title:l("vision.hero.videoTitle"),allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",allowFullScreen:!0}),F&&e.jsx("div",{className:"intro-caption","aria-hidden":!0,children:e.jsx("span",{children:F})})]}):e.jsxs("button",{type:"button",className:"video-poster",onClick:()=>{x(!0),s==null||s()},"aria-label":l("vision.hero.playLabel"),children:[e.jsx(ur,{className:"video-bg-loop",src:"/videos/vision-intro-montage.mp4",poster:"/images/mission/intro-poster.webp"}),e.jsx("span",{className:"video-play-btn","aria-hidden":!0,children:e.jsxs("svg",{viewBox:"0 0 72 72",width:"72",height:"72",children:[e.jsx("circle",{cx:"36",cy:"36",r:"34",fill:"none",stroke:"#C99A3F",strokeWidth:"2.5"}),e.jsx("path",{d:"M29 25 L51 36 L29 47 Z",fill:"none",stroke:"#C99A3F",strokeWidth:"2.5",strokeLinejoin:"round"})]})})]})}),!O&&e.jsx("button",{type:"button",className:"video-hero-caption",onClick:()=>{x(!0),s==null||s()},children:l("vision.hero.watch")})]}),n&&e.jsxs("div",{className:"vhero-blocks",children:[e.jsx("h2",{className:"vhero-h2",children:e.jsx("span",{style:Ao,children:l("vision.hero.title")})}),e.jsx("ol",{className:"vhero-list",children:mr.map((w,A)=>e.jsxs("li",{className:"vhero-item",style:{"--vb-at":A+1},children:[e.jsx("span",{className:"vhero-num","aria-hidden":!0,children:A+1}),e.jsxs("span",{className:"vhero-txt",children:[e.jsxs("b",{className:"vhero-t",children:[e.jsx("em",{className:"vhero-v",children:l(`vision.hero.${w}.v`)})," ",l(`vision.hero.${w}.t`)]}),e.jsx("span",{className:"vhero-d",children:l(`vision.hero.${w}.d`)})]}),e.jsx("span",{className:"vhero-chip",children:l(`vision.hero.${w}.c`)})]},w))})]})]})}),!c&&e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"wf-pin",ref:R,style:{height:`${St.length*100}vh`,zIndex:2},children:e.jsxs("div",{className:`wf-sticky${h?" wf-armed":""}`,children:[e.jsxs("div",{className:"wf-grid",children:[e.jsx("div",{className:"wf-scroll-col",children:e.jsx("div",{className:"wf-papyrus",children:e.jsx(lr,{papyrus:"/images/vision/papyrus-vision.webp",sheet:{x:.1,y:.15,w:.8,h:.71},videos:hr,active:t})})}),e.jsx("div",{className:"wf-text",children:St.map((w,A)=>e.jsxs("div",{className:`wf-block${w.intro?" wf-intro":""}${t===A?" on":""}`,"aria-hidden":t!==A,children:[e.jsxs("div",{className:"wf-big",children:[e.jsx("span",{className:"wf-big-w",children:l(`vision.beat.${w.id}.bigW`)}),e.jsx("br",{}),e.jsx("span",{className:"wf-big-g",children:l(`vision.beat.${w.id}.bigG`)})]}),w.intro?e.jsx("div",{className:"wf-lead",dangerouslySetInnerHTML:{__html:l("vision.intro.lead")}}):e.jsx("div",{className:"wf-lead",dangerouslySetInnerHTML:{__html:l(`vision.beat.${w.id}.h`)}}),w.mech&&e.jsxs("div",{className:"wf-mech",children:[e.jsx("span",{className:"wf-mech-ic",dangerouslySetInnerHTML:{__html:dr[w.icon??"ankh"]}}),e.jsxs("span",{className:"wf-mech-txt",children:["→ ",w.mech]})]})]},w.id))})]}),e.jsxs("div",{className:"wf-progress",children:[e.jsx("div",{className:"wf-track",children:e.jsx("div",{className:"wf-fill",style:{width:`${(i*100).toFixed(1)}%`}})}),e.jsx("div",{className:"wf-steps",children:St.map((w,A)=>e.jsxs("div",{className:`wf-step${t===A?" active":""}${A<t?" done":""}`,children:[e.jsx("span",{className:"wf-knob"}),e.jsx("span",{className:"wf-step-label",children:l(`vision.beat.${w.id}.tag`)})]},w.id))})]})]})}),e.jsxs("section",{ref:z,className:"vision-finale flex flex-col items-center justify-center text-center px-6",style:{zIndex:2,minHeight:"calc(100dvh - 72px)",gap:"clamp(20px, 4vh, 38px)"},children:[e.jsx("h2",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:"clamp(2.6rem, 8vw, 6rem)",letterSpacing:"0.04em",lineHeight:1.12,paddingTop:"0.06em",margin:0,textTransform:"uppercase",background:"linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",filter:"drop-shadow(0 1px 1px rgba(110,71,16,0.20))"},children:l("vision.finale.title")}),e.jsx("p",{style:{fontFamily:"'Cinzel', serif",fontWeight:500,fontSize:"clamp(1.2rem, 3vw, 2.1rem)",lineHeight:1.4,color:"rgba(35,22,8,0.86)",maxWidth:"22ch",margin:0},className:"vf-lead",dangerouslySetInnerHTML:{__html:l("vision.finale.lead")}}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"7px"},children:[e.jsx("button",{onClick:()=>p("/heroglyph/name"),className:"mission-cta",style:{alignSelf:"center",margin:0},children:l("vision.finale.cta")}),e.jsx("p",{style:{fontSize:"clamp(0.95rem, 1.9vw, 1.2rem)",fontStyle:"italic",color:"rgba(60,40,12,0.62)",letterSpacing:"0.04em",margin:0},children:l("vision.finale.tagline")})]})]})]})]})}const gr={dark:{card:"#0a0a0a",cardBorder:"1px solid rgba(196,155,66,0.3)",cardShadow:"0 10px 30px -12px rgba(196,155,66,0.2)",quote:"rgba(250,244,236,0.85)",name:"#A3782B",role:"#FAF4EC",avatar:"1.5px solid #C49B42"},papyrus:{card:"linear-gradient(160deg, #FDF8EC 0%, #F6E9CE 52%, #EEDDB4 100%)",cardBorder:"1.5px solid rgba(140,96,20,0.60)",cardShadow:"0 12px 36px rgba(110,71,16,0.26)",quote:"rgba(35,22,8,0.86)",name:"#6E4A12",role:"rgba(35,22,8,0.90)",avatar:"1.5px solid rgba(140,96,20,0.72)"}},wa=o=>{const n=gr[o.variant??"dark"];return e.jsx("div",{className:o.className,children:e.jsx(Fo.div,{animate:{translateY:"-50%"},transition:{duration:o.duration||10,repeat:1/0,ease:"linear",repeatType:"loop"},className:"flex flex-col gap-6 pb-6",children:[...new Array(2)].map((s,c)=>e.jsx(Pt.Fragment,{children:o.testimonials.map(({text:p,image:l,name:f,role:m},y)=>e.jsxs("div",{className:"p-8 rounded-3xl max-w-xs w-full",style:{background:n.card,border:n.cardBorder,boxShadow:n.cardShadow},children:[e.jsxs("div",{className:"text-sm leading-relaxed",style:{color:n.quote,fontFamily:"'Space Grotesk', sans-serif"},children:['"',p,'"']}),e.jsxs("div",{className:"flex items-center gap-3 mt-5",children:[e.jsx("img",{width:40,height:40,src:l,alt:f,loading:"lazy",decoding:"async",className:"h-10 w-10 rounded-full object-cover",style:{border:n.avatar}}),e.jsxs("div",{className:"flex flex-col",children:[e.jsx("div",{className:"font-semibold tracking-tight leading-5 text-sm",style:{color:n.name,fontFamily:"'Cinzel', serif"},children:f}),e.jsx("div",{className:"leading-5 opacity-70 tracking-tight text-xs",style:{color:n.role},children:m})]})]})]},y))},c))})})},No=[{text:"The truest, purest love… is the love that comes from your dog.",name:"Oprah Winfrey",role:"Cultural icon",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oprah_Winfrey_2016.jpg/330px-Oprah_Winfrey_2016.jpg",credit:"US Embassy SA (public domain)",source:"https://www.huffpost.com/entry/oprah-dog-sophie_n_4654541"},{text:"I had no intention of rescuing a dog that day, but the minute I saw him I knew he was coming home with me.",name:"Chris Evans",role:"Actor · on his dog Dodger",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Chris_Evans_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg/330px-Chris_Evans_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg",credit:"Sara Komatsu (CC BY-SA 4.0)",source:"https://www.eonline.com/news/1342743"},{text:"He was an Angel. And he was my best friend. All he knew was love.",name:"Tom Hardy",role:"Actor · on his dog Woody",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tom_Hardy_%2841869508740%29.jpg/330px-Tom_Hardy_%2841869508740%29.jpg",credit:"Gage Skidmore (CC BY-SA 2.0)",source:"https://www.nme.com/news/tom-hardy-dog-tribute-2086531"},{text:"We'll always love you. You'll always be my lil' main man.",name:"Dwayne Johnson",role:"Actor · on his dog Brutus",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg/330px-Dwayne_Johnson-1764_%284x5_cropped_with_moderate_headroom%29.jpg",credit:"Harald Krichel (CC BY-SA 4.0)",source:"https://abc7.com/the-rock-dwayne-johnson-dog-brutus/1009438/"},{text:"You taught me how to love without fear of loss.",name:"Miley Cyrus",role:"Singer · on her dog Floyd",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Miley_Cyrus_Primavera19_-226_%2848986293772%29_%28cropped%29.jpg/330px-Miley_Cyrus_Primavera19_-226_%2848986293772%29_%28cropped%29.jpg",credit:"Raphael Pour-Hashemi (CC BY 2.0)",source:"https://www.billboard.com/music/music-news/miley-cyrus-floyd-remembrance-8454678/"},{text:"Dogs are the most harmless, sweetest babes in the world. They show nothing but unconditional love.",name:"Ariana Grande",role:"Singer",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Ariana_Grande_promoting_Wicked_%282024%29.jpg/330px-Ariana_Grande_promoting_Wicked_%282024%29.jpg",credit:"Barbie Simons (CC BY 3.0)",source:"https://www.billboard.com/lists/billboard-power-pets-list-music-stars-a-list-animals/"},{text:"I always, always called him the rockstar. Because he was!",name:"Hugh Jackman",role:"Actor · on his dog Dali",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Hugh_Jackman_by_Gage_Skidmore_3.jpg/330px-Hugh_Jackman_by_Gage_Skidmore_3.jpg",credit:"Gage Skidmore (CC BY-SA 3.0)",source:"https://abcnews.com/GMA/Culture/hugh-jackman-mourns-loss-beloved-dog-called-rockstar/story?id=88095066"},{text:"I don't think even the cliché of unconditional love is enough.",name:"Drew Barrymore",role:"Actor · on her dog Flossie",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Drew_Barrymore_in_2019_%28cropped%29.jpg/330px-Drew_Barrymore_in_2019_%28cropped%29.jpg",credit:"Eva Rinaldi (CC BY-SA 2.0)",source:"https://www.thelist.com/1320243/little-known-drew-barrymore-facts/"},{text:"He has saved my emotional and psychological bacon plenty of times.",name:"Henry Cavill",role:"Actor · on his dog Kal",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Henry_Cavill_%2848417913146%29_%28cropped%29.jpg/330px-Henry_Cavill_%2848417913146%29_%28cropped%29.jpg",credit:"Gage Skidmore (CC BY-SA 2.0)",source:"https://iheartdogs.com/superman-cavill-kal/"},{text:"I just fell in love with him. I didn't mean to, I just picked him up along the way.",name:"Ryan Reynolds",role:"Actor · on his dog Baxter",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg/330px-Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg",credit:"Dick Thomas Johnson (CC BY 2.0)",source:"https://dogtime.com/dogs-in-film-tv/171606-ryan-reynolds-dog-baxter-breed-age"},{text:"He loves me. I can do no wrong. He follows me everywhere.",name:"George Clooney",role:"Actor · on his dog Einstein",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/George_Clooney_Jay_Kelly-19_%28cropped%29.jpg/330px-George_Clooney_Jay_Kelly-19_%28cropped%29.jpg",credit:"Bryan Berlin (CC BY-SA 4.0)",source:"https://www.hellomagazine.com/celebrities/2015110228022/george-clooney-talks-about-his-dog-einstein/"},{text:"Charlotte loves me undyingly. They're my kids.",name:"Bradley Cooper",role:"Actor · on his dog Charlotte",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Bradley_Cooper_Is_This_Thing_On-41_%28cropped%29.jpg/330px-Bradley_Cooper_Is_This_Thing_On-41_%28cropped%29.jpg",credit:"Bryan Berlin (CC BY-SA 4.0)",source:"https://www.peta.org/news/bradley-coopers-hung-rescue-dogs/"},{text:"They just give you unconditional love. And you're never alone, they're just there.",name:"Channing Tatum",role:"Actor · on his dog Lulu",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Channing_Tatum_at_the_2026_Berlin_International_Film_Festival-69843.jpg/330px-Channing_Tatum_at_the_2026_Berlin_International_Film_Festival-69843.jpg",credit:"Harald Krichel (CC BY-SA 4.0)",source:"https://sharpmagazine.com/2022/02/16/channing-tatum-interview/"},{text:"He was more than a companion. It was a soul connection for sure.",name:"Orlando Bloom",role:"Actor · on his dog Mighty",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Orlando_Bloom_at_the_2024_Toronto_International_Film_Festival_%28cropped2%29.jpg/330px-Orlando_Bloom_at_the_2024_Toronto_International_Film_Festival_%28cropped2%29.jpg",credit:"Kevin Payravi (CC BY-SA 4.0)",source:"https://www.etonline.com/orlando-blooms-dog-mighty-dies-after-going-missing-actor-gets-inked-in-his-honor-150050"},{text:"There's one that's a dog of a lifetime… and you're going to cry like a little baby when he's gone.",name:"Kevin Costner",role:"Actor · on his dog Wyatt",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Kevin_Costner_at_81st_Venice_Film_Festival_%28cropped%29.jpg/330px-Kevin_Costner_at_81st_Venice_Film_Festival_%28cropped%29.jpg",credit:"Ariela Ortiz-Barrantes (CC BY-SA 4.0)",source:"https://www.aarp.org/entertainment/movies-for-grownups/info-2019/kevin-costner-racing-interview.html"},{text:"She's brilliant, my best friend.",name:"Tom Holland",role:"Actor · on his dog Tessa",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg/330px-Tom_Holland_during_pro-am_Wentworth_golf_club_2023-2_%28cropped%29.jpg",credit:"ChristopherJClarke (CC BY-SA 4.0)",source:"https://dogsmonthly.co.uk/2020/02/06/our-interview-with-tom-holland/"},{text:"We're already falling head over heels in love.",name:"Patrick Stewart",role:"Actor · on his foster pup",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Patrick_Stewart_by_Gage_Skidmore_2.jpg/330px-Patrick_Stewart_by_Gage_Skidmore_2.jpg",credit:"Gage Skidmore (CC BY-SA 3.0)",source:"https://www.newsweek.com/watch-sir-patrick-stewart-soothe-this-anxious-foster-pup-his-continuing-support-pitbulls-1530718"},{text:"The dogs are everything. They're living, breathing, pure, good love.",name:"Jennifer Aniston",role:"Actor",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/JenniferAnistonHWoFFeb2012.jpg/330px-JenniferAnistonHWoFFeb2012.jpg",credit:"Angela George (CC BY-SA 3.0)",source:"https://paradepets.com/pet-news/jennifer-aniston-playing-working-out-with-her-dogs-exclusive-video"},{text:"I have no words or tears to describe how much she meant to me.",name:"Salma Hayek",role:"Actor · on her dog Lupe",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/MKr383631_Salma_Hayek_%28Women_In_Motion%2C_Cannes_2025%29_crop.jpg/330px-MKr383631_Salma_Hayek_%28Women_In_Motion%2C_Cannes_2025%29_crop.jpg",credit:"Martin Kraft (CC BY-SA 4.0)",source:"https://www.huffpost.com/entry/salma-hayek-dog-lupe-dies_n_5a60753ce4b01b82649cc317"},{text:"That feeling has never left me. It is one of the most special presences in my life.",name:"Eva Mendes",role:"Actor · on her dog Hugo",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Eva_Mendes_2009.jpg/330px-Eva_Mendes_2009.jpg",credit:"Nicolas Genin (CC BY-SA 4.0)",source:"https://www.hellomagazine.com/celebrities/20220722146132/eva-mendes-sparks-emotional-response-remembers-first-love-hugo/"},{text:"For them you are their entire book, their entire lives.",name:"Chrissy Teigen",role:"Model / TV host · on her dog Penny",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Chrissy_Teigen_2019.png/330px-Chrissy_Teigen_2019.png",credit:"Adweek (CC BY 3.0)",source:"https://www.aol.com/chrissy-teigen-mourns-death-her-013704458.html"},{text:"You sure gave me a lot of comfort and love when I needed it the most!",name:"Hilary Duff",role:"Actor / singer · on her dog Jak",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Hilary_Duff_%2835661671285%29_%28cropped%29_%283%29.jpg/330px-Hilary_Duff_%2835661671285%29_%28cropped%29_%283%29.jpg",credit:"Greg2600 (CC BY-SA 2.0)",source:"https://www.hellomagazine.com/celebrities/20220329136723/how-i-met-your-father-hilary-duff-heartbreaking-personal-loss-dog/"},{text:"Finn's brought all the love, warmth and total presence a girl could only dream of.",name:"Amanda Seyfried",role:"Actor · on her dog Finn",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Amanda_Seyfried_at_Berlinale_2026-1_%28cropped%29.jpg/330px-Amanda_Seyfried_at_Berlinale_2026-1_%28cropped%29.jpg",credit:"Elena Ternovaja (CC BY-SA 3.0)",source:"https://parade.com/news/fans-gush-over-amanda-seyfrieds-beautiful-dog-finn-as-star-celebrates-his-milestone-birthday"},{text:"My beloved, hilarious dog Norman's unconditional love inspired me to create this company.",name:"Kaley Cuoco",role:"Actor · on her dog Norman",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Kaley_Cuoco_by_Gage_Skidmore.jpg/330px-Kaley_Cuoco_by_Gage_Skidmore.jpg",credit:"Gage Skidmore (CC BY-SA 3.0)",source:"https://www.hellomagazine.com/celebrities/505835/kaley-cuoco-thanks-beloved-pet-dog-norman-as-she-launches-new-project/"},{text:"There is no better dog than Jack. How could you make a dog better than Jack!",name:"Mariah Carey",role:"Singer · on her dog Jack",image:"https://upload.wikimedia.org/wikipedia/commons/2/22/Mariah_Carey_Library_of_Congress_2023_1_Cropped_3.png",credit:"Shawn Miller / LOC (public domain)",source:"https://www.k9magazine.com/mariah-carey/"},{text:"He's such a good boy. I wish I could take him on my whole tour across the world.",name:"Billie Eilish",role:"Singer · on her dog Shark",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg/330px-BillieEilishO2140725-39_-_54665577407_%28cropped%29.jpg",credit:"Raph_PH (CC BY 2.0)",source:"https://www.movin925.com/read-an-interview-with-billie-eilishs-dog-shark-yes-really"},{text:"I genuinely talk to my dogs. I totally believe that animals are healing.",name:"Selena Gomez",role:"Singer / actress",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg/330px-Selena_Gomez_at_the_2024_Toronto_International_Film_Festival_10_%28cropped%29.jpg",credit:"Frank Sun (CC BY-SA 4.0)",source:"https://www.wondermind.com/article/selena-gomez-speaks-out-about-her-mental-health/"},{text:"She was a dear pet of mine. I remember John being amazed to see me being so loving to an animal.",name:"Paul McCartney",role:"The Beatles · on his dog Martha",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/MaccaLyricsRFH051121_%2815_of_18%29_%28updated%29_%28cropped%29.jpg/330px-MaccaLyricsRFH051121_%2815_of_18%29_%28updated%29_%28cropped%29.jpg",credit:"Raph_PH (CC BY 2.0)",source:"https://www.the-paulmccartney-project.com/1966/10/paul-mccartney-buys-an-old-english-sheepdog/"},{text:"She gave us so much joy for 10 years. We love you Pippa!",name:"John Legend",role:"Singer · on his dog Pippa",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/JohnLegend-byPhilipRomano.jpg/330px-JohnLegend-byPhilipRomano.jpg",credit:"PhilipRomanoPhoto (CC BY-SA 4.0)",source:"https://www.billboard.com/music/music-news/john-legend-chrissy-teigen-dog-dies-pippa-photos-9602212/"},{text:"'Puppy Love' was my very first record, and six decades later, my love for pets is stronger than ever.",name:"Dolly Parton",role:"Singer / songwriter",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Dolly_Parton_at_%27Blue_Smoke_World_Tour%27_in_Knoxville.jpg/330px-Dolly_Parton_at_%27Blue_Smoke_World_Tour%27_in_Knoxville.jpg",credit:"Kristopher Harris (CC BY 2.0)",source:"https://www.foxbusiness.com/lifestyle/dolly-parton-launches-dog-apparel-line-doggy-parton"},{text:"Her name is Asia. She is a BATPIG. I love her, I'm her mom.",name:"Lady Gaga",role:"Singer · on her dog Asia",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg/330px-Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg",credit:"Carlos M. Vazquez II (CC BY 2.0)",source:"https://ladygaga.fandom.com/wiki/Asia_(dog)"},{text:"He was with me all the way, my closest companion. All the love and cuddles we will miss forever.",name:"Conor McGregor",role:"UFC fighter · on his dog Hugo",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Conor_McGregor_2025.jpeg/330px-Conor_McGregor_2025.jpeg",credit:"US Dept of Defense (public domain)",source:"https://www.tmz.com/2021/10/20/conor-mcgregor-mourns-dog-hugo-death-so-heart-broken/"},{text:"Bringing Roscoe into my life was the best decision I ever made.",name:"Lewis Hamilton",role:"F1 driver · on his dog Roscoe",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg/330px-Prime_Minister_Keir_Starmer_meets_Sir_Lewis_Hamilton_%2854566928382%29_%28cropped%29.jpg",credit:"No. 10 Downing Street (OGL 3)",source:"https://www.espn.com/racing/f1/story/_/id/46420057/lewis-hamilton-ferrari-mourns-beloved-dog-roscoe"},{text:"She was there every day to lick my leg and remind me how much she loved me.",name:"Serena Williams",role:"Tennis champion · on her dog Jackie",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg/330px-Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg",credit:"SWinxy (CC BY 4.0)",source:"https://www.today.com/pets/serena-williams-posts-sweet-tribute-her-late-dog-jackie-t58101"},{text:"A man's best friend. Always happy to see you. Loves you unconditionally.",name:"Tyson Fury",role:"Heavyweight boxer · on his dog Cash",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Tyson_Fury_at_Place_Bell%2C_Laval_Quebec%2C_Canada_-_Dec_16_2017_%28cropped%29.jpg/330px-Tyson_Fury_at_Place_Bell%2C_Laval_Quebec%2C_Canada_-_Dec_16_2017_%28cropped%29.jpg",credit:"Mike DiDomizio (CC BY-SA 4.0)",source:"https://thetab.com/realityshrine/2026/04/14/insane-five-figure-sum-tyson-paid-for-his-dog-cash"},{text:"Their love is unconditional and they give me and my family plenty of joy in our lives.",name:"Michael Phelps",role:"Olympic swimmer",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Michael_Phelps_Rio_Olympics_2016.jpg/330px-Michael_Phelps_Rio_Olympics_2016.jpg",credit:"Agência Brasil (CC BY 2.0)",source:"https://www.petbusiness.com/archives/walking-the-walk-an-interview-with-michael-phelps/"},{text:"Harry is my best friend! Definitely the best decision I've ever made.",name:"Venus Williams",role:"Tennis champion · on her dog Harry",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Venus_Williams_%282025_DC_Open%29_crop.jpg/330px-Venus_Williams_%282025_DC_Open%29_crop.jpg",credit:"Hameltion (CC BY-SA 4.0)",source:"https://tennisuptodate.com/wta/definitely-the-best-decision-ive-ever-made-venus-williams-professes-love-for-her-pet-dog-harry"},{text:"We couldn't be happier. Welcome to the family, Willow.",name:"Roger Federer",role:"Tennis champion · on his dog Willow",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Roger_Federer_2015_%28cropped%29.jpg/330px-Roger_Federer_2015_%28cropped%29.jpg",credit:"Tatiana (CC BY-SA 2.0)",source:"https://www.tennisworldusa.org/tennis/news/Roger_Federer/114742/"},{text:"He is a good friend and traveling companion, and would rather travel about than anything he can imagine.",name:"John Steinbeck",role:"Nobel author · on his dog Charley",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/John_Steinbeck_1939_%28cropped%29.jpg/330px-John_Steinbeck_1939_%28cropped%29.jpg",credit:"public domain",source:"https://gutenberg.ca/ebooks/steinbeckj-travelswithcharley/"},{text:"I've never loved a dog like this in my life. Sometimes I think there's a person in there.",name:"Elizabeth Taylor",role:"Actress · on her dog Sugar",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Taylor%2C_Elizabeth_posed.jpg/330px-Taylor%2C_Elizabeth_posed.jpg",credit:"public domain",source:"https://www.wmagazine.com/story/elizabeth-taylor-dec-2004"},{text:"If the kindest souls were rewarded with the longest lives, dogs would outlive us all.",name:"Ricky Gervais",role:"Comedian / actor",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/GervaisPall230921_%285_of_17%29_%2851528328440%29_%28cropped%29.jpg/330px-GervaisPall230921_%285_of_17%29_%2851528328440%29_%28cropped%29.jpg",credit:"Raph_PH (CC BY 2.0)",source:"https://www.facebook.com/rickygervais/posts/1132160746908277/"},{text:"Our guardian angel is gone to heaven. She will forever live in our hearts.",name:"Gisele Bündchen",role:"Supermodel · on her dog Lua",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ver%C3%A3o_Arezzo_Brasil_2019_por_Gisele_B%C3%BCndchen_17.jpg/330px-Ver%C3%A3o_Arezzo_Brasil_2019_por_Gisele_B%C3%BCndchen_17.jpg",credit:"Arezzo Brasil (CC BY 3.0)",source:"https://www.eonline.com/news/1391973/gisele-buendchen-and-tom-brady-mourn-death-of-family-dog"},{text:"Lump, he's not a dog, he's not a little man, he's somebody else.",name:"Pablo Picasso",role:"Painter · on his dog Lump",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pablo_picasso_1.jpg/330px-Pablo_picasso_1.jpg",credit:"public domain",source:"https://en.wikipedia.org/wiki/Lump_(dog)"},{text:"Sometimes when a man's alone, that's all you got is your dog. And they've meant the world to me.",name:"Mickey Rourke",role:"Actor",image:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Mickey_Rourke_Tribeca_2009_portrait.jpg/330px-Mickey_Rourke_Tribeca_2009_portrait.jpg",credit:"David Shankbone (CC BY-SA 3.0)",source:"https://abcnews.go.com/Entertainment/Oscars/story?id=6897261"}],br=21,So=o=>o.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z]+/g,"-");function xr(o){const n=[...o];for(let s=n.length-1;s>0;s--){const c=Math.floor(Math.random()*(s+1));[n[s],n[c]]=[n[c],n[s]]}return n}function fr({variant:o="dark",pinned:n=!1,onFans:s,fansLive:c=!0}={}){const p=_e(),{columns:l}=r.useMemo(()=>{const m=xr(No).slice(0,br),y=Math.ceil(m.length/3);return{columns:[m.slice(0,y),m.slice(y,y*2),m.slice(y*2)]}},[]),f=m=>({...m,text:p(`about.legends.q.${So(m.name)}.text`),role:p(`about.legends.q.${So(m.name)}.role`)});return e.jsx("section",{id:"testimonials",className:`relative overflow-hidden ${n?"tst-pinned":"py-24 md:py-32"}`,style:{background:o==="papyrus"?"linear-gradient(180deg, transparent 0%, rgba(233,215,177,0.55) 26%, #EFDEBB 100%)":"linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 18%, #000000 42%)"},children:e.jsxs("div",{className:"max-w-6xl mx-auto px-6 md:px-8",children:[e.jsxs(Fo.div,{initial:n?!1:{opacity:0,y:20},whileInView:n?void 0:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.6},className:`flex flex-col items-center text-center mb-12 md:mb-16${n?" tst-head":""}`,children:[e.jsx("h2",{className:"text-4xl md:text-5xl font-black tracking-wider",style:{fontFamily:"'Cinzel', serif",textTransform:"uppercase",letterSpacing:"0.02em",background:o==="papyrus"?"linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)":"linear-gradient(135deg, #F5C73D 0%, #FFB840 40%, #E69E1A 70%, #F5C73D 100%)",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent",filter:o==="papyrus"?"drop-shadow(0 1px 1px rgba(110,71,16,0.20))":"drop-shadow(0 0 16px rgba(245,199,61,0.32))",paddingTop:"0.12em"},children:p(n?"about.legends.titleFilm":"about.legends.title")}),e.jsx("p",{className:"mt-4 max-w-xl text-base md:text-lg",style:{color:o==="papyrus"?"rgba(35,22,8,0.82)":"rgba(250,244,236,0.76)",fontFamily:"'Space Grotesk', sans-serif",lineHeight:1.65},children:p(n?"about.legends.subFilm":"about.legends.sub")}),n&&e.jsxs("p",{className:"tst-btw",style:{margin:"16px 0 0",maxWidth:520,fontFamily:"'Space Grotesk', sans-serif",fontSize:14,lineHeight:1.5,color:o==="papyrus"?"rgba(35,22,8,0.62)":"rgba(250,244,236,0.6)"},children:[e.jsx("b",{style:{fontWeight:600,color:o==="papyrus"?"rgba(35,22,8,0.82)":"rgba(250,244,236,0.85)"},children:p("onepage.apps.lang.a")})," ",p("onepage.apps.lang.b")]}),n&&s&&e.jsx("button",{type:"button",className:"dgx-example tst-fans",onClick:s,tabIndex:c?0:-1,style:{pointerEvents:c?"auto":"none",marginLeft:0,marginTop:24},children:p("about.legends.fansChip")})]}),e.jsxs("div",{className:`flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]${n?" tst-cols":""}`,style:{maxHeight:"640px",overflow:"hidden"},children:[e.jsx(wa,{testimonials:l[0].map(f),duration:48,variant:o}),e.jsx(wa,{testimonials:l[1].map(f),className:"hidden md:block",duration:56,variant:o}),e.jsx(wa,{testimonials:l[2].map(f),className:"hidden lg:block",duration:52,variant:o})]}),e.jsxs("details",{className:`mt-10 mx-auto max-w-2xl text-center${n?" tst-credits":""}`,children:[e.jsx("summary",{className:"cursor-pointer text-[11px] tracking-wide select-none",style:{color:o==="papyrus"?"rgba(60,40,12,0.58)":"rgba(250,244,236,0.4)",fontFamily:"'Space Grotesk', sans-serif"},children:p("about.legends.creditsSummary")}),e.jsxs("p",{className:"mt-3 text-[10px] leading-relaxed",style:{color:o==="papyrus"?"rgba(60,40,12,0.52)":"rgba(250,244,236,0.32)",fontFamily:"'Space Grotesk', sans-serif"},children:[p("about.legends.creditsIntro")," ",No.map(m=>`${m.name} — ${m.credit}`).join(" · ")]})]})]})})}const vr=[{id:"dog-lover",icon:Bn},{id:"developer",icon:Fn},{id:"dog-pro",icon:Hn},{id:"creator",icon:$n},{id:"media",icon:Vn},{id:"investor",icon:Gn},{id:"community",icon:Yn},{id:"business",icon:Kn}];function kr(){const o=_e(),[n,s]=r.useState(""),[c,p]=r.useState(""),[l,f]=r.useState(""),[m,y]=r.useState(""),[N,O]=r.useState(!1),[x,F]=r.useState("idle"),j=async v=>{if(v.preventDefault(),!n||!c.trim()||!l.trim()||!N)return;F("loading");const{error:_}=await wn.from("contacts").insert({name:c.trim(),email:l.trim().toLowerCase(),role:n,message:m.trim()||null});_||Te("email_signup",{role:n}),F(_?"error":"done")};return e.jsxs("section",{id:"council",className:"council-section",style:{scrollMarginTop:80},children:[e.jsx("style",{children:`
        .council-section {
          background: #000;
          padding: clamp(72px, 14vh, 120px) 20px clamp(80px, 16vh, 140px);
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 2;
        }
        .council-inner {
          width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(30px, 5vh, 52px); text-align: center;
        }
        /* ── Beige papyrus block (like /pack cards) — full width, image | form ── */
        .council-card {
          width: 100%;
          /* PAPYRUS LOCK (2026-07-26) — bledý blok podľa /entry .religion-card */
          background: var(--papyrus-card);
          border: var(--papyrus-border);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-papyrus-card);
          padding: clamp(22px, 3vw, 46px);
          display: grid; grid-template-columns: 1fr; gap: clamp(22px, 4vh, 38px);
          align-items: center; text-align: center;
        }
        @media (min-width: 880px) {
          .council-card {
            grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
            gap: clamp(30px, 3.5vw, 56px); align-items: stretch; text-align: left;
          }
        }
        /* ── Left: pharaoh figure + headline under it ── */
        .council-figure {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          gap: clamp(12px, 2.4vh, 22px);
        }
        .council-figure img {
          width: 100%; max-width: 420px; height: auto; display: block;
          filter: drop-shadow(0 14px 34px rgba(31,26,14,0.30));
        }
        @media (max-width: 879px) { .council-figure img { max-width: 300px; } }
        /* ── Right: form column ── */
        .council-content {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          gap: clamp(20px, 3vh, 30px); min-width: 0;
        }
        .council-headline-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(6px, 1.2vh, 12px);
        }
        .council-headline-wrap .council-logo {
          width: clamp(178px, 22vw, 267px); max-width: 267px; height: auto; display: block;
          filter: drop-shadow(0 2px 3px rgba(31,26,14,0.18));
        }
        .council-headline {
          font-family: 'Cinzel', serif; font-weight: 700; white-space: nowrap;
          /* padding-top = headroom pre diakritiku nad verzálkami (background-clip:text ju inak osekne) */
          padding-top: 0.15em;
          font-size: clamp(2.1rem, 4.6vw, 3.4rem); line-height: 1.05;
          letter-spacing: 0.02em; margin: 0;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.22));
        }
        .council-form-title {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0 0 -6px;
          font-size: clamp(1.4rem, 2.4vw, 1.85rem); letter-spacing: 0.02em; line-height: 1.1;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(31,26,14,0.18));
        }
        .council-sub {
          font-family: 'Space Grotesk', sans-serif; font-size: clamp(0.95rem, 1.3vw, 1.1rem);
          line-height: 1.65; color: rgba(31,26,14,0.66); margin: 0;
          max-width: 540px;
        }
        /* ── Role grid ── */
        .council-roles {
          width: 100%; display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 600px) { .council-roles { grid-template-columns: repeat(4, 1fr); } }
        .role-card {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 8px; padding: clamp(11px, 1.6vw, 15px) 8px; min-height: 92px;
          background: linear-gradient(135deg, hsl(224 40% 18%), hsl(45 70% 28%));
          border: 1.5px solid rgba(201,154,63,0.25);
          border-radius: 12px; cursor: pointer;
          transition: filter .2s ease, box-shadow .2s ease, border-color .2s ease;
          user-select: none;
        }
        .role-card:hover {
          filter: brightness(1.18);
          border-color: rgba(201,154,63,0.55);
        }
        .role-card.selected {
          filter: brightness(1.14);
          border-color: #B98BE8;
          box-shadow: 0 0 0 2px rgba(46,95,208,0.95), 0 0 24px 5px rgba(46,95,208,0.70);
        }
        .role-icon {
          width: 30px; height: 30px; object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.80;
          transition: opacity .2s ease;
        }
        .role-card.selected .role-icon,
        .role-card:hover .role-icon { opacity: 1; }
        .role-label {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.62rem, 0.85vw, 0.74rem); letter-spacing: 0.05em;
          color: #FAF4EC; text-align: center; line-height: 1.25; margin: 0;
        }
        /* desc = hover overlay (no layout shift) */
        .role-desc {
          position: absolute; inset: 0; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          padding: 10px 12px; margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.64rem, 0.85vw, 0.74rem); line-height: 1.4;
          color: #FAF4EC; text-align: center;
          background: linear-gradient(135deg, rgba(36,24,54,0.97) 0%, rgba(58,42,18,0.97) 100%);
          opacity: 0; pointer-events: none;
          transition: opacity .2s ease;
        }
        .role-card:hover .role-desc { opacity: 1; }
        @media (hover: none) {
          /* touch: no hover → keep desc visible, smaller card text */
          .role-desc { position: static; inset: auto; background: none; opacity: 1;
            color: rgba(250,244,236,0.45); padding: 0; }
          .role-card { min-height: 0; }
        }
        /* ── Form ── */
        .council-form {
          width: 100%; display: flex; flex-direction: column; gap: 14px;
        }
        .council-input-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 599px) { .council-input-row { grid-template-columns: 1fr; } }
        .council-input {
          width: 100%; padding: 14px 18px;
          background: rgba(255,255,255,0.62); border: 1.5px solid rgba(31,26,14,0.18);
          border-radius: 8px; outline: none;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.95rem;
          color: #1F1A0E; transition: border-color .2s ease, background .2s ease;
          box-sizing: border-box;
        }
        .council-input::placeholder { color: rgba(31,26,14,0.42); }
        .council-input:focus { border-color: rgba(201,154,63,0.75); background: rgba(255,255,255,0.85); }
        textarea.council-input { resize: vertical; min-height: 78px; }
        /* ── Consent checkbox (above submit) ── */
        .council-consent {
          display: flex; align-items: flex-start; gap: 10px;
          text-align: left; cursor: pointer; user-select: none;
        }
        .council-consent input {
          flex: 0 0 auto; appearance: none; -webkit-appearance: none;
          width: 18px; height: 18px; margin-top: 1px;
          border: 1.5px solid rgba(31,26,14,0.35); border-radius: 5px;
          background: rgba(255,255,255,0.62); cursor: pointer;
          transition: background .2s ease, border-color .2s ease;
          position: relative;
        }
        .council-consent input:checked {
          background: linear-gradient(135deg, #C99A3F 0%, #9A6E1F 100%);
          border-color: rgba(154,110,31,0.75);
        }
        .council-consent input:checked::after {
          content: ''; position: absolute; left: 5px; top: 1px;
          width: 5px; height: 10px; border: solid #FFF8EC;
          border-width: 0 2px 2px 0; transform: rotate(45deg);
        }
        .council-consent span {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.72rem, 0.95vw, 0.82rem); line-height: 1.45;
          color: rgba(31,26,14,0.62);
        }
        /* ── Submit (papyrus deep gold — matches card headline/title gradient) ── */
        .council-submit {
          align-self: center;
          padding: 14px 44px;
          background: linear-gradient(135deg, #C99A3F 0%, #B5832B 50%, #9A6E1F 100%);
          border: 1px solid rgba(154,110,31,0.55);
          border-radius: 8px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.82rem, 1.1vw, 0.95rem); letter-spacing: 0.12em; text-transform: uppercase;
          color: #FFF8EC; white-space: nowrap;
          box-shadow: 0 8px 22px rgba(31,26,14,0.30), inset 0 1px 0 rgba(255,248,236,0.30);
          transition: transform 0.2s, box-shadow 0.22s, filter 0.22s;
        }
        .council-submit:hover:not(:disabled) { transform: scale(1.03); filter: brightness(1.08); box-shadow: 0 10px 28px rgba(31,26,14,0.38), inset 0 1px 0 rgba(255,248,236,0.30); }
        .council-submit:active:not(:disabled) { transform: scale(0.98); }
        .council-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; box-shadow: inset 0 1px 0 rgba(255,248,236,0.30); }
        /* ── Desktop: form fills the column so the textarea grows and the button
           drops to the bottom (its lower edge level with "NEEDS YOU." on the left).
           Button = full width of the textarea/form. ── */
        @media (min-width: 880px) {
          /* push the whole right block to the bottom — button stays level with
             "NEEDS YOU.", textarea shrinks, empty space lands at the TOP (top
             edge no longer aligned with the left column). */
          .council-content { justify-content: flex-end; }
          .council-form { flex: 0 0 auto; }
          textarea.council-input { flex: 0 0 auto; height: 92px; }
          .council-submit { align-self: stretch; width: 100%; }
        }
        /* ── Success ── */
        .council-success {
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          padding: clamp(32px, 6vh, 56px) 20px;
        }
        .council-success-title {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); margin: 0;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .council-success-sub {
          font-family: 'Space Grotesk', sans-serif; font-size: 1rem;
          color: rgba(31,26,14,0.62); margin: 0;
        }
        .council-error {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem;
          color: rgba(255,120,100,0.85); text-align: center; margin: 0;
        }
      `}),e.jsx("div",{className:"council-inner",children:e.jsxs("div",{className:"council-card",children:[e.jsxs("div",{className:"council-figure",children:[e.jsx("img",{src:"/images/council-pharaoh.png",alt:o("about.council.imgAlt")}),e.jsxs("div",{className:"council-headline-wrap",children:[e.jsx("img",{className:"council-logo",src:"/images/dogypt-logo-black-w.png",alt:"DOGYPT"}),e.jsx("h2",{className:"council-headline",children:o("about.council.headline")})]})]}),e.jsxs("div",{className:"council-content",children:[e.jsx("h3",{className:"council-form-title",children:o("about.council.formTitle")}),e.jsx("p",{className:"council-sub",children:o("about.council.sub")}),x==="done"?e.jsxs("div",{className:"council-success",children:[e.jsx("h3",{className:"council-success-title",children:o("about.council.successTitle")}),e.jsx("p",{className:"council-success-sub",children:o("about.council.successSub")})]}):e.jsxs("form",{className:"council-form",onSubmit:j,noValidate:!0,children:[e.jsx("div",{className:"council-roles",role:"group","aria-label":o("about.council.rolesAria"),children:vr.map(v=>e.jsxs("button",{type:"button",className:`role-card${n===v.id?" selected":""}`,onClick:()=>s(v.id),"aria-pressed":n===v.id,children:[e.jsx("img",{src:v.icon,alt:"",className:"role-icon","aria-hidden":!0}),e.jsx("p",{className:"role-label",children:o(`about.council.role.${v.id}.label`)}),e.jsx("p",{className:"role-desc",children:o(`about.council.role.${v.id}.desc`)})]},v.id))}),e.jsxs("div",{className:"council-input-row",children:[e.jsx("input",{className:"council-input",type:"text",placeholder:o("about.council.fullName"),value:c,onChange:v=>p(v.target.value),required:!0,autoComplete:"name"}),e.jsx("input",{className:"council-input",type:"email",placeholder:o("about.council.email"),value:l,onChange:v=>f(v.target.value),required:!0,autoComplete:"email"})]}),e.jsx("textarea",{className:"council-input",placeholder:o("about.council.message"),value:m,onChange:v=>y(v.target.value)}),x==="error"&&e.jsx("p",{className:"council-error",children:o("about.council.error")}),e.jsxs("label",{className:"council-consent",children:[e.jsx("input",{type:"checkbox",checked:N,onChange:v=>O(v.target.checked)}),e.jsx("span",{children:o("about.council.consent")})]}),e.jsx("button",{type:"submit",className:"council-submit",disabled:!n||!c.trim()||!l.trim()||!N||x==="loading",children:o(x==="loading"?"about.council.sending":"about.council.submit")})]})]})]})})]})}const yr=[{id:"youtube",label:"YouTube",href:"https://youtube.com/@dogypt",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M23 7.2a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.2zM9.8 15.3V8.7l5.7 3.3z"})})},{id:"instagram",label:"Instagram",href:"https://instagram.com/dogypt",icon:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.9","aria-hidden":!0,children:[e.jsx("rect",{x:"2.5",y:"2.5",width:"19",height:"19",rx:"5.2"}),e.jsx("circle",{cx:"12",cy:"12",r:"4.1"}),e.jsx("circle",{cx:"17.4",cy:"6.6",r:"1.15",fill:"currentColor",stroke:"none"})]})},{id:"facebook",label:"Facebook",href:"https://www.facebook.com/dogypt.official/",icon:e.jsx("svg",{viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"})})}];function wr(){const o=_e();return e.jsxs("footer",{className:"dogypt-footer",children:[e.jsx("style",{children:`
        .dogypt-footer {
          background: #000; position: relative; z-index: 2;
          padding: clamp(48px, 9vh, 84px) clamp(22px, 5vw, 64px) clamp(28px, 4vh, 40px);
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(32px, 5vh, 52px);
        }
        .footer-inner {
          width: 100%; max-width: 1100px; margin-top: -100px;
          display: grid; grid-template-columns: 1fr; gap: clamp(34px, 6vh, 46px);
          align-items: start; text-align: left;
        }
        @media (min-width: 760px) {
          .footer-inner {
            grid-template-columns: 1fr 1fr 1fr;
            gap: clamp(34px, 5vw, 64px); align-items: center;
          }
        }
        /* ── Brand: seal (centre column) ── */
        .footer-brand { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: clamp(14px, 2vh, 18px); }
        .footer-seal { height: clamp(118px, 15vw, 158px); width: auto; display: block; }
        .footer-tagline {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: clamp(0.82rem, 1.1vw, 0.96rem); letter-spacing: 0.20em; text-transform: uppercase;
          color: rgba(201,154,63,0.88);
        }
        .footer-mission {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; line-height: 1.6; margin: 0;
          color: rgba(250,244,236,0.42); max-width: 260px;
        }
        /* ── Columns ── */
        .footer-col { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .footer-col-title {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
          color: rgba(250,244,236,0.45);
        }
        /* ── Socials — rounded squares (single row 1×3) ── */
        .footer-socials { display: flex; gap: 10px; align-items: center; flex-wrap: nowrap; }
        .footer-social {
          width: clamp(46px, 5.2vw, 56px); height: clamp(46px, 5.2vw, 56px);
          display: flex; align-items: center; justify-content: center;
          border-radius: 13px; color: rgba(250,244,236,0.80);
          border: 1px solid rgba(201,154,63,0.30); background: rgba(250,244,236,0.02);
          transition: color .2s ease, border-color .2s ease, background .2s ease, transform .15s ease;
        }
        .footer-social svg { width: clamp(22px, 2.6vw, 27px); height: clamp(22px, 2.6vw, 27px); }
        .footer-social:hover {
          color: #F5C73D; border-color: rgba(201,154,63,0.7);
          background: rgba(201,154,63,0.10); transform: translateY(-2px);
        }
        /* ── Email (emphasized) + legal ── */
        .footer-col-email { justify-content: center; align-items: center; }
        @media (min-width: 760px) {
          /* social left · seal centre · email right */
          .footer-col-social { align-items: flex-start; padding-left: 50px; }
          .footer-col-email { padding-top: 0; align-items: flex-end; padding-right: 50px; }
        }
        /* mobile stack: seal on top, then social, then email */
        @media (max-width: 759px) { .footer-brand { order: -1; } }
        .footer-email {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(0.98rem, 1.5vw, 1.22rem); letter-spacing: 0.03em;
          color: #F5C73D; text-decoration: none;
          border-bottom: 1px solid rgba(201,154,63,0.55); padding-bottom: 3px;
          text-shadow: 0 0 18px rgba(245,199,61,0.28);
          transition: color .2s ease, border-color .2s ease, text-shadow .2s ease;
        }
        .footer-email:hover { color: #FFD879; border-color: #F5C73D; text-shadow: 0 0 24px rgba(245,199,61,0.45); }
        .footer-links { display: flex; align-items: center; gap: 12px; }
        .footer-links a {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem;
          color: rgba(250,244,236,0.55); text-decoration: none; transition: color .2s ease;
        }
        .footer-links a:hover { color: rgba(250,244,236,0.9); }
        .footer-links span { color: rgba(250,244,236,0.28); }
        .footer-copy {
          font-family: 'Space Grotesk', sans-serif; font-size: 0.74rem; margin: 0;
          color: rgba(250,244,236,0.34); letter-spacing: 0.04em;
        }
        /* ── Bottom bar — mission + copyright ── */
        .footer-bar {
          width: 100%; max-width: 1100px;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-align: center; padding-top: clamp(18px, 3vh, 26px);
          border-top: 1px solid rgba(201,154,63,0.12);
        }
        @media (min-width: 760px) {
          .footer-bar { flex-direction: row; justify-content: space-between; text-align: left; }
        }
        .footer-bar .footer-mission { max-width: none; }
        .footer-bar-text { margin: 0; line-height: 1.7; }
        .footer-bar-text .footer-tagline { margin-right: 4px; }
        @media (min-width: 760px) { .footer-bar-text .footer-tagline { display: inline; } }
        .footer-bar-right { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        @media (min-width: 760px) { .footer-bar-right { flex-direction: row; align-items: center; gap: 16px; } }

        /* ── Mobile (<760px): everything centered, motto on its own row ── */
        @media (max-width: 759px) {
          .footer-col { align-items: center; }
          .footer-bar-text .footer-tagline { display: block; margin-right: 0; margin-bottom: 6px; }
        }
      `}),e.jsxs("div",{className:"footer-inner",children:[e.jsx("div",{className:"footer-col footer-col-social",children:e.jsx("div",{className:"footer-socials",children:yr.map(n=>e.jsx("a",{className:"footer-social",href:n.href,target:"_blank",rel:"noreferrer","aria-label":n.label,children:n.icon},n.id))})}),e.jsx("div",{className:"footer-brand",children:e.jsx("img",{className:"footer-seal",src:"/images/peciat-dogypt.webp",alt:o("about.footer.sealAlt")})}),e.jsx("div",{className:"footer-col footer-col-email",children:e.jsx("a",{className:"footer-email",href:"mailto:woof@dogypt.com",children:"woof@dogypt.com"})})]}),e.jsxs("div",{className:"footer-bar",children:[e.jsxs("p",{className:"footer-bar-text",children:[e.jsx("span",{className:"footer-tagline",children:o("about.footer.motto")})," ",e.jsx("span",{className:"footer-mission",children:o("about.footer.mission")})]}),e.jsxs("div",{className:"footer-bar-right",children:[e.jsxs("div",{className:"footer-links",children:[e.jsx("a",{href:"/privacy",children:o("about.footer.privacy")}),e.jsx("span",{children:"·"}),e.jsx("a",{href:"/terms",children:o("about.footer.terms")}),e.jsx("span",{children:"·"}),e.jsx("a",{href:"#",onClick:n=>{n.preventDefault(),window.dispatchEvent(new Event("dogypt:open-consent"))},children:o("consent.footerLink")})]}),e.jsx("p",{className:"footer-copy",children:"© 2026 DOGYPT"})]})]})]})}let Nt=null,Gt=0,Co=-1;const jr=()=>{if(Gt>0&&Co===window.innerWidth)return Gt;Nt||(Nt=document.createElement("div"),Nt.setAttribute("aria-hidden","true"),Nt.style.cssText="position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none;",document.body.appendChild(Nt));const o=Nt.getBoundingClientRect().height;return Gt=o>1?o:window.innerHeight,Co=window.innerWidth,Gt},zr=()=>"https://placehold.co/800x500/15100a/15100a?text=%20";function Po({images:o,alt:n}){const s=_e(),[c,p]=r.useState(0),l=o.length,f=r.useRef(null),m=r.useRef(0),y=j=>p(v=>(v+j+l)%l),N=j=>v=>{v.stopPropagation(),y(j)},O=j=>{f.current=j.clientX},x=j=>{if(f.current===null)return;const v=j.clientX-f.current;f.current=null,!(l<2)&&(v>30?y(-1):v<-30&&y(1))},F=j=>{if(l<2||Math.abs(j.deltaX)<=Math.abs(j.deltaY)||Math.abs(j.deltaX)<16)return;const v=Date.now();v<m.current||(m.current=v+420,y(j.deltaX>0?1:-1))};return e.jsxs("div",{className:"reel",onPointerDown:O,onPointerUp:x,onPointerLeave:x,onWheel:F,style:{touchAction:"pan-y"},children:[e.jsx("img",{src:o[c],alt:n,onError:j=>{const v=j.currentTarget;v.onerror=null,v.src=zr()}}),l>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"reel-arrow reel-prev",onClick:N(-1),"aria-label":s("about.reel.prev"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"15 18 9 12 15 6"})})}),e.jsx("button",{type:"button",className:"reel-arrow reel-next",onClick:N(1),"aria-label":s("about.reel.next"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"9 18 15 12 9 6"})})}),e.jsx("div",{className:"reel-dots","aria-hidden":!0,children:o.map((j,v)=>e.jsx("span",{className:`reel-dot${v===c?" on":""}`},v))})]})]})}const Yt=[{id:1,images:["/images/about-slides/m1-1.webp","/images/about-slides/m1-2.webp","/images/about-slides/m1-3.webp","/images/about-slides/m1-4.webp"]},{id:2,images:["/images/about-slides/m2-1.webp","/images/about-slides/m2-2.webp","/images/about-slides/m2-3.webp","/images/about-slides/m2-4.webp","/images/about-slides/m2-5.webp"]},{id:3,images:["/images/about-slides/m3-1.webp","/images/about-slides/m3-2.webp","/images/about-slides/m3-3.webp"]},{id:4,images:["/images/about-slides/m4-1.webp","/images/about-slides/m4-2.webp","/images/about-slides/m4-3.webp","/images/about-slides/m4-4.webp","/images/about-slides/m4-5.webp"]},{id:5,images:["/images/about-slides/m5-1.webp"]}],Er=["about.crawl.p1","about.crawl.p2","about.crawl.p3","about.crawl.p4","about.crawl.p5","about.crawl.p6"];function Kt(o){const n=o.closest(".lsh-scroll")??window,s=n===window,c=()=>n;return{host:n,sy:()=>s?window.scrollY:c().scrollTop,vh:()=>s?jr():c().clientHeight,vw:()=>s?window.innerWidth:c().clientWidth,top:p=>p.getBoundingClientRect().top-(s?0:c().getBoundingClientRect().top),scrollTo:p=>n.scrollTo({top:p,behavior:"smooth"})}}function Qr({embedded:o=!1,part:n="all"}={}){const s=n!=="story",c=n!=="crawl"&&n!=="film",p=n==="all",l=n!=="film",f=_e(),m=r.useRef(null),y=r.useRef(null),N=r.useRef(null),O=r.useRef(null),x=r.useRef(null),F=r.useRef(null),j=r.useRef(null),v=r.useRef(null),_=r.useRef(null),Z=r.useRef(null),L=r.useRef(null),R=r.useRef(null);r.useEffect(()=>{if(window.location.hash!=="#council")return;const a=setTimeout(()=>{var i;(i=document.getElementById("council"))==null||i.scrollIntoView({behavior:"smooth",block:"start"})},220);return()=>clearTimeout(a)},[]);const z=()=>{const a=F.current;a&&Kt(a).scrollTo(a.offsetTop+a.offsetHeight)};r.useEffect(()=>{var d;const a=(d=m.current)==null?void 0:d.querySelectorAll(".tl-row");if(!a||a.length===0)return;const i=new IntersectionObserver(h=>h.forEach(b=>{b.isIntersecting&&b.target.classList.add("in-view")}),{threshold:.18,rootMargin:"0px 0px -8% 0px"});return a.forEach(h=>i.observe(h)),()=>i.disconnect()},[]);const t=.1;return r.useEffect(()=>{const a=F.current,i=x.current,d=j.current,h=v.current,b=Z.current,w=L.current;if(!a||!w)return;const A=Kt(a);let H=0;const T=(ie,ke=0,ye=1)=>Math.min(Math.max(ie,ke),ye),B=(ie,ke,ye)=>ie+(ke-ie)*ye,ne=(ie,ke,ye)=>T((ie-ke)/(ye-ke));let ce=0,be=0,Ne=-1;const q=()=>{ce=a.offsetHeight,be=w.offsetHeight},he=()=>{const ie=A.vh();ce||q();const ke=A.top(a),ye=ke>ie?0:ke+ce<-ie?1:-1;if(ye>=0&&Ne===ye)return;const Ge=ce-ie,Ie=ye>=0?ye:Ge>0?T(-ke/Ge):0;Ne=Ie;const Me=l?Ie:t+Ie*(1-t),Ae=ne(Me,0,.08);if(i&&(i.style.opacity=String(1-Ae),i.style.transform=`scale(${B(1,.96,Ae)})`,i.style.pointerEvents=Ae>.98?"none":"auto"),d&&(d.style.opacity=String(B(0,.25,Ae))),h&&(h.style.opacity=String(T(ne(Me,.1,.18)-ne(Me,.34,.4)))),_.current&&(_.current.style.opacity=String(T(ne(Me,.12,.2)-ne(Me,.34,.4)))),b){const Ye=ne(Me,.42,.5),Fe=ne(Me,.5,.6);b.style.transform=`translate(-50%, -50%) scale(${B(1,.04,Fe)})`,b.style.opacity=String(T(Ye-Fe*1.1))}const K=be||ie,ae=ne(Me,.56,1),De=B(K+.12*ie,-.85*ie,ae);w.style.opacity=String(T(ne(Me,.55,.6))),w.style.transform=`translateX(-50%) rotateX(28deg) translateY(${De}px)`},pe=()=>{cancelAnimationFrame(H),H=requestAnimationFrame(he)},ze=()=>{q(),pe()};he();const ve=setTimeout(()=>{q(),he()},200);return document.fonts&&document.fonts.ready.then(()=>{q(),he()}).catch(()=>{}),A.host.addEventListener("scroll",pe,{passive:!0}),window.addEventListener("resize",ze),()=>{clearTimeout(ve),A.host.removeEventListener("scroll",pe),window.removeEventListener("resize",ze),cancelAnimationFrame(H)}},[]),r.useEffect(()=>{const a=R.current,i=F.current;if(!a||!i)return;const d=Kt(i);let h=0,b=0,w=d.vh();const A=(be,Ne=0,q=1)=>Math.min(Math.max(be,Ne),q),H=()=>{w=d.vh(),b=i.offsetTop+i.offsetHeight},T=()=>{const be=A((d.sy()-(b-w))/(.6*w));a.style.opacity=String(be),a.style.pointerEvents=be>.5?"auto":"none",a.style.transform=`translateY(${(be-1)*8}px)`},B=()=>{cancelAnimationFrame(h),h=requestAnimationFrame(T)},ne=()=>{H(),B()};H(),T();const ce=setTimeout(()=>{H(),T()},200);return d.host.addEventListener("scroll",B,{passive:!0}),window.addEventListener("resize",ne),()=>{clearTimeout(ce),d.host.removeEventListener("scroll",B),window.removeEventListener("resize",ne),cancelAnimationFrame(h)}},[]),r.useEffect(()=>{const a=y.current,i=N.current;if(!a||!i)return;const d=a.querySelector(".hpin-head"),h=Kt(a);let b=0;const w=(pe,ze=0,ve=1)=>Math.min(Math.max(pe,ze),ve),A=(pe,ze,ve)=>pe+(ze-pe)*ve,H=pe=>pe<.5?2*pe*pe:1-Math.pow(-2*pe+2,2)/2;let T=0,B=0,ne=0;const ce=()=>{T=h.sy()+h.top(a),B=a.offsetHeight;const pe=i.querySelector(".hcard");ne=pe?pe.getBoundingClientRect().width:i.offsetWidth},be=()=>{var it;if(h.vw()<768){i.style.opacity="",d&&(d.style.transform="",d.style.opacity="");return}const pe=i.querySelectorAll(".hcard"),ze=pe.length;if(ze===0)return;const ve=h.vh(),ie=B-ve,ke=w(h.sy()-T,0,ie),ye=T-h.sy(),Ge=.92,Ie=.13,Me=50,Ae=.04*ve,K=w((ve-ye)/(1*ve)),ae=ye>0?K:1+ke/ve;if(d){const Se=H(w((ae-.6)/.8)),ut=H(w((ae-.55)/.55)),$e=A(.9*ve,Ie*ve+Me,Se)-Ge*Ae-Math.max(ye,0);d.style.transform=`translateY(${$e}px) scale(${Ge})`,d.style.opacity=String(ut)}const De=Math.max(0,ke-.45*ve);i.style.opacity=String(w(De/(.25*ve)));const Ye=Math.max(0,ke-.9*ve),xe=w(Ye/Math.max(1,ie-.9*ve))*(ze-1),He=(ne||i.offsetWidth)+200;pe.forEach((Se,ut)=>{const fe=xe-ut,$e=Math.abs(fe);Se.style.opacity=$e<1.5?"1":"0",Se.style.transform=`translate(-50%, calc(-50% + ${Me}px)) translateX(${-fe*He}px)`,Se.style.zIndex=String(Math.round(100-$e*10)),Se.style.pointerEvents=$e<.5?"auto":"none"});const Ue=w(Math.round(xe),0,ze-1),kt=(it=O.current)==null?void 0:it.children;if(kt)for(let Se=0;Se<kt.length;Se++)kt[Se].classList.toggle("on",Se===Ue)},Ne=()=>{cancelAnimationFrame(b),b=requestAnimationFrame(be)},q=()=>{ce(),Ne()};ce(),be();const he=setTimeout(()=>{ce(),be()},200);return h.host.addEventListener("scroll",Ne,{passive:!0}),window.addEventListener("resize",q),()=>{clearTimeout(he),h.host.removeEventListener("scroll",Ne),window.removeEventListener("resize",q),cancelAnimationFrame(b)}},[]),e.jsxs("div",{className:"lab-papyrus about-root flex flex-col relative",style:{overflowX:"clip"},children:[!o&&e.jsx(Xt,{path:"/about-lab",title:"About DOGYPT — The Movement Where Dog Is God",description:"From adopting Hekthor to a global dog religion. The story, the mission and the people behind DOGYPT."}),e.jsx("style",{children:`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s ostatnými
           svetlými stránkami). Kotvenie na okno je prevzaté z pôvodnej
           .about-root.dark-bg::before: About je viac-obrazovková, takže podklad
           viazaný na výšku OBSAHU by sa roztiahol cez 340vh crawlu. */
        .lab-papyrus { position: relative; background-color: ${Le.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100lvh;
          background: ${Le.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* ── LAB: BLOK „JOIN THE MISSION" (CouncilSection) ─────────────────
           Zdieľaný komponent, ale na rozdiel od citátov hviezd má vzhľad
           v triedach, nie v inline štýloch ⇒ stačí ho prebiť scopnuto.
           Samotná karta je papyrusová UŽ DNES (PAPYRUS LOCK z 26. 7.) — tmavé
           sú len dve veci: pás pod ňou a dlaždice rolí.
           Keď svetlý režim vyhrá, presunúť DO komponentu ako variant. */
        .lab-papyrus .council-section {
          /* Pás sa zlieva do pätičky rovnako ako sekcia s citátmi nad ním —
             koniec stránky je jeden povrch, nie tri rôzne plochy. */
          background: #EFDEBB;
        }
        .lab-papyrus .role-card {
          background: linear-gradient(135deg, #FBF5E6 0%, #F0DFB8 100%);
          border: 1.5px solid rgba(140,96,20,0.55);
        }
        .lab-papyrus .role-card:hover { filter: none; border-color: rgba(140,96,20,0.85); }
        .lab-papyrus .role-card.selected {
          filter: none;
          border-color: rgba(110,71,16,0.95);
          box-shadow: 0 0 0 2px rgba(201,154,63,0.55), 0 6px 18px rgba(110,71,16,0.28);
        }
        /* Ikonka bola biela cez brightness(0) invert(1) — na papyruse musí byť
           ATRAMENT, teda invert(1) padá. brightness(0) drží alfa kanál. */
        .lab-papyrus .role-icon { filter: brightness(0); opacity: 0.72; }
        .lab-papyrus .role-label { color: rgba(35,22,8,0.90); }
        .lab-papyrus .role-desc {
          color: rgba(35,22,8,0.88);
          background: linear-gradient(135deg, rgba(253,248,236,0.97) 0%, rgba(240,223,184,0.97) 100%);
        }
        @media (hover: none) {
          .lab-papyrus .role-desc { background: none; color: rgba(60,40,12,0.62); }
        }

        /* ── LAB: PÄTIČKA JE ZDIEĽANÝ KOMPONENT ────────────────────────────
           components/landing/Footer.tsx si nesie vlastný <style> s
           .dogypt-footer { background: #000 } a používajú ho aj ostré tmavé
           stránky. Prefarbiť ho v komponente teda nejde — zhaslo by to pätičku
           celého živého webu. Prebíja sa tu, cez .lab-papyrus, presne ako
           .cb-hint v /religion-lab.
           Keď sa svetlý režim odklepne a tmavé stránky zaniknú, toto pravidlo
           sa presunie DO komponentu a odtiaľto zmizne — nie je to trvalý stav.
           Pečať aj logá sú zlaté na priehľadnom, tie na papyruse držia samy. */
        .lab-papyrus .dogypt-footer {
          background: linear-gradient(180deg, #EFDEBB 0%, #E6D2A6 100%);
          border-top: 1px solid rgba(140,96,20,0.34);
        }
        .lab-papyrus .footer-tagline { color: #6E4A12; }
        .lab-papyrus .footer-mission { color: rgba(60,40,12,0.66); }
        .lab-papyrus .footer-col-title { color: rgba(60,40,12,0.58); }
        .lab-papyrus .footer-social {
          color: rgba(35,22,8,0.80);
          border-color: rgba(140,96,20,0.45);
          background: rgba(255,252,244,0.55);
        }
        .lab-papyrus .footer-social:hover {
          color: #6E4A12;
          border-color: rgba(140,96,20,0.80);
          background: rgba(255,252,244,0.90);
        }
        .lab-papyrus .footer-email {
          color: #6E4A12;
          border-bottom-color: rgba(140,96,20,0.55);
          text-shadow: none;
        }
        .lab-papyrus .footer-email:hover { color: #8a5a14; border-bottom-color: #8a5a14; }
        .lab-papyrus .footer-links a { color: rgba(60,40,12,0.62); }
        .lab-papyrus .footer-links a:hover { color: rgba(35,22,8,0.90); }
        .lab-papyrus .footer-links span { color: rgba(60,40,12,0.34); }
        .lab-papyrus .footer-copy { color: rgba(60,40,12,0.52); }
        .lab-papyrus .footer-bar { border-top-color: rgba(140,96,20,0.28); }

        /* ── Headline ── */
        .about-quote {
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(2.6rem, 5.6vw, 4.4rem); line-height: 1.08; letter-spacing: 0.01em; margin: 0;
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .about-quote .aq-white {
          -webkit-text-fill-color: rgba(35,22,8,0.90); color: rgba(35,22,8,0.90);
        }
        .about-sub {
          font-family: 'Cinzel', serif; font-weight: 400; font-size: clamp(1rem, 1.7vw, 1.45rem);
          color: rgba(35,22,8,0.88); letter-spacing: 0.04em; margin: 0;
        }
        .hero-intro {
          font-family: 'Space Grotesk', sans-serif; font-size: clamp(1rem, 1.25vw, 1.15rem); font-weight: 400;
          color: rgba(60,40,12,0.66); line-height: 1.7; margin: 0; max-width: 540px;
          display: flex; flex-direction: column; gap: 0.7em;
        }
        .hero-intro p { margin: 0; text-wrap: balance; }
        .hero-intro strong { font-weight: 700; color: rgba(35,22,8,0.90); }

        /* ── Signature ── */
        .about-signoff {
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0;
          font-size: clamp(1.05rem, 1.5vw, 1.3rem); letter-spacing: 0.09em; text-transform: uppercase;
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .about-signoff .amp {
          -webkit-text-fill-color: rgba(60,40,12,0.58); color: rgba(60,40,12,0.58);
          font-weight: 400; text-transform: lowercase; font-size: 0.78em; letter-spacing: 0.04em; padding: 0 0.18em;
          filter: none;
        }
        @media (max-width: 767px) {
          .about-quote { font-size: clamp(2.3rem, 10.5vw, 3.1rem); }
          .about-sub { font-size: 1.05rem; }
          .hero-intro { font-size: 0.9rem; max-width: 100%; }
        }

        /* ── Hero ── */
        .hero-grid {
          display: flex; flex-direction: column; gap: clamp(22px, 4vh, 36px);
          width: 100%; max-width: 1120px; align-items: center; text-align: center;
        }
        @media (min-width: 768px) {
          .hero-grid {
            display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
            gap: clamp(40px, 5vw, 80px); align-items: center; text-align: left;
          }
        }
        .hero-photo {
          position: relative; width: 100%; max-width: min(58vh, 480px); aspect-ratio: 1 / 1;
          border-radius: 16px; overflow: hidden; margin: 0 auto; background: #E6D2A6;
          box-shadow: 0 12px 36px rgba(110,71,16,0.26), 0 0 0 1px rgba(140,96,20,0.28) inset;
        }
        @media (max-width: 767px) { .hero-photo { max-width: min(50vh, 320px); } }
        .hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .scroll-hint {
          display: flex; flex-direction: column; align-items: center;
          color: #8a5a14; animation: hintBob 1.9s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(230,184,74,0.55)) drop-shadow(0 0 3px rgba(230,184,74,0.7));
        }
        @keyframes hintBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }

        /* ── Timeline ── */
        .tl-section { width: 100%; display: flex; flex-direction: column; align-items: center; padding: clamp(20px,6vh,64px) 20px clamp(40px,9vh,90px); position: relative; z-index: 2; }
        .tl-head { text-align: center; margin-bottom: clamp(26px, 5vh, 52px); }
        .tl-eyebrow {
          font-family: 'Cinzel', serif; font-size: clamp(0.6rem,0.9vw,0.72rem); letter-spacing: 0.34em;
          text-transform: uppercase; color: rgba(60,40,12,0.52); margin: 0 0 10px;
        }
        .tl-h2 {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(2.5rem, 6vw, 5rem);
          /* line-height + padding-top = headroom pre verzálkovú diakritiku (PRÍBEH/PŘÍBĚH),
             inak background-clip:text oseká í/ř/ě nad veľkým písmenom. */
          margin: 0; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.12; padding-top: 0.18em;
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.24));
        }

        /* ── Cards (shared) ── */
        .tl-card {
          /* LAB: karta kroniky na MOBILE (na PC to isté rieši .hcard vyššie). */
          background: linear-gradient(180deg, #FDF8EC 0%, #F1E1BE 100%);
          border: 1px solid ${Le.edge}; border-radius: 14px; overflow: hidden;
          box-shadow: 0 14px 40px rgba(110,71,16,0.28);
        }
        .tl-img { position: relative; width: 100%; aspect-ratio: 1 / 1; background: #E6D2A6; }
        .tl-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        /* mobile story photos: square frame, whole photo visible (no crop) */
        .tl-img .reel > img { object-fit: contain; }
        .tl-img::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(60,40,12,0.28) 100%); }

        /* ── Image reel (carousel) — fills its parent photo frame ── */
        .reel { position: absolute; inset: 0; }
        .reel > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .reel-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
          width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
          border-radius: 999px; cursor: pointer; color: rgba(35,22,8,0.90);
          /* LAB: šípky ležia NAD fotkou, takže potrebujú vlastnú plochu, nie
             priesvitný závoj — tmavé sklo s tmavým inkoustom je nečitateľné. */
          background: rgba(253,248,236,0.88); border: 1px solid rgba(140,96,20,0.55);
          backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
          opacity: 0.78; transition: opacity .2s ease, background .2s ease, color .2s ease;
        }
        .reel-arrow:hover { opacity: 1; color: #6E4A12; background: rgba(255,252,244,0.86); }
        .reel-prev { left: 10px; }
        .reel-next { right: 10px; }
        .reel-dots { position: absolute; left: 0; right: 0; bottom: 12px; z-index: 4; display: flex; justify-content: center; gap: 7px; pointer-events: none; }
        .reel-dot { width: 7px; height: 7px; border-radius: 999px; background: rgba(140,96,20,0.40); box-shadow: 0 1px 3px rgba(110,71,16,0.32); transition: width .3s ease, background .3s ease; }
        .reel-dot.on { width: 20px; background: #8a5a14; }
        @media (max-width: 767px) { .reel-arrow { width: 34px; height: 34px; } }
        .tl-body-wrap { padding: clamp(16px, 2vw, 22px) clamp(18px, 2.2vw, 26px) clamp(18px, 2.4vw, 24px); }
        .tl-year {
          display: inline-block; font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.72rem;
          letter-spacing: 0.2em; color: #6E4A12; border: 1px solid rgba(140,96,20,0.55);
          padding: 3px 12px; border-radius: 999px; margin-bottom: 12px;
        }
        .tl-title { font-family: 'Cinzel', serif; font-weight: 700; font-size: clamp(1.1rem, 1.7vw, 1.35rem); color: rgba(35,22,8,0.90); margin: 0 0 9px; letter-spacing: 0.01em; }
        .tl-text { font-family: 'Space Grotesk', sans-serif; font-size: clamp(0.85rem, 1vw, 0.95rem); line-height: 1.65; color: rgba(35,22,8,0.82); margin: 0; }

        .tl-node {
          position: absolute; width: 15px; height: 15px; border-radius: 50%; z-index: 3;
          background: radial-gradient(circle at 35% 30%, #D8A93F, #6E4A12 70%);
          box-shadow: 0 0 0 4px rgba(201,154,63,0.18), 0 0 14px rgba(201,154,63,0.6);
        }
        .tl-conn { position: absolute; background: rgba(201,154,63,0.5); z-index: 1; }
        .tl-row { opacity: 0; transform: translateY(26px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .tl-row.in-view { opacity: 1; transform: none; }
        .tl-hint { display: none; }

        /* ── MOBILE (base): vertical single column, line on the left ── */
        /* 🔴 SELEKTOR MUSÍ OSTAŤ ZÚŽENÝ NA .tl-section.
           Holé .tl je dvojznakový globálny názov a v LabShell aj vo filme
           (/onepage) sú všetky stránky namontované NARAZ. Trafilo to ľavý horný
           roh zlatého rámu okolo ústavy v náboženstve — ten má triedy
           "codex-frame tl", rovnakú špecificitu (0,1,0), a keďže sa tento blok
           vkladá neskôr, vyhral: z rohu sa stal prvok V TOKU (position: relative,
           2x22 px uprostred odseku) namiesto rohu rámu. Zvyšné tri rohy (.tr,
           .bl, .br) obdobu nemajú, takže vyzeralo, že je pokazený jeden roh.
           Matej 26. 8. 2026: *„vidím že ti 4 rohy pri citácii ústavy nie sú
           dobre, lavy horny roh je zle… na ostrom webe /religion táto pasáž
           funguje skvele."* — a naozaj: tam About namontovaný nie je.
           ⚠️ Ostrý About.tsx má tú istú vetu bez zúženia. Nechaná zámerne
           (ostrý web sa v tejto vetve nedotýka) — ale ak sa doňho niekedy
           siahne, patrí sem tá istá oprava. */
        .tl-section .tl { position: relative; width: 100%; max-width: 520px; }
        .tl-section .tl::before {
          content: ''; position: absolute; top: 8px; bottom: 8px; left: 13px; width: 2px;
          background: linear-gradient(180deg, rgba(201,154,63,0) 0%, rgba(201,154,63,0.55) 8%, rgba(201,154,63,0.55) 92%, rgba(201,154,63,0) 100%);
        }
        .tl-row { position: relative; width: 100%; box-sizing: border-box; padding: 0 0 0 42px; margin-bottom: 26px; }
        .tl-node { top: 24px; left: 6px; }
        .tl-conn { top: 30px; left: 14px; height: 1.5px; width: 22px; }

        /* mobile timeline hidden on desktop (PC uses pinned carousel below) */
        @media (min-width: 768px) { .tl-section { display: none; } }

        /* ── Sticky nav (appears from Story section onward) ── */
        .about-sticky-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          opacity: 0; pointer-events: none; will-change: opacity, transform;
          padding-bottom: 52px;            /* fade runway below the nav content */
          /* LAB: podklad je papyrus, nie čierna. Maska ostáva NEDOTKNUTÁ —
             mask-image je ALFA maska, tie #000 v nej neznamenajú farbu, ale
             „nepriehľadné". Preto prežije akékoľvek pozadie a fade nemá šev. */
          background: ${Le.pageBg};
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
        }

        /* ===== PC PINNED CINEMATIC REVEAL ===== */
        /* ── Star Wars opening crawl (all viewports) ── */
        .swcrawl { position: relative; z-index: 2; }
        .swcrawl-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .op-hero { position: absolute; inset: 0; display: flex; flex-direction: column; will-change: opacity, transform; }

        /* ── Opening SCROLL cue (clean dark screen before the crawl) ── */
        .scroll-intro {
          flex: 1; min-height: 0; position: relative;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: clamp(8px, 1.4vh, 16px); text-align: center; padding: 0 24px;
        }
        .origin-title {
          /* size matched to Religion .codex-headline (the larger hero heading) so
             the main title is identical across pages. Mobile overridden below. */
          font-family: 'Cinzel', serif; font-weight: 700; margin: 0; line-height: 1.08;
          /* padding-top dáva headroom pre diakritiku (Ů/ô) — background-clip:text inak
             oseká krúžok/striešku nad veľkým písmenom (gradient nepokryje, fill=transparent). */
          text-transform: uppercase; letter-spacing: 0.1em; padding: 0.2em 0 0 0.1em;
          font-size: clamp(2.85rem, 6.84vw, 5.32rem);
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        .origin-sub {
          /* Veta / scroll-cue, NIE nadpis → Space Grotesk (sekundárny font), nie Cinzel.
             Symetrické tmavé halo drží tenkú diakritiku (ČÍTAJ/POSUŇ) čitateľnú proti
             busy hieroglyf pozadiu — nie je to background-clip clip, len kontrast. */
          font-family: 'Space Grotesk', sans-serif; font-weight: 500; margin: 0; text-transform: uppercase;
          font-size: clamp(0.82rem, 1.5vw, 1.05rem); letter-spacing: 0.22em; padding-left: 0.22em;
          color: rgba(35,22,8,0.88);
          text-shadow: 0 0 3px rgba(253,248,236,0.95), 0 0 10px rgba(253,248,236,0.85);
        }
        .scroll-cue { display: flex; flex-direction: column; align-items: center; color: #8a5a14; margin-top: clamp(10px, 2.2vh, 22px); }
        .scroll-cue svg { display: block; margin-top: -18px; opacity: 0.32; filter: drop-shadow(0 1px 2px rgba(110,71,16,0.30)); animation: scrollCue 1.6s ease-in-out infinite; }

        /* ── Flanking figures (Matej left, Hekthor right) with warm halo ── */
        .about-fig {
          position: absolute; bottom: 0; z-index: 1; pointer-events: none;
          height: 64vh; display: flex; align-items: flex-end; justify-content: center;
        }
        .about-fig img { height: 100%; width: auto; object-fit: contain; display: block;
          filter: drop-shadow(0 12px 34px rgba(110,71,16,0.34)); }
        .about-fig::before {
          content: ''; position: absolute; left: 50%; bottom: 6%; transform: translateX(-50%);
          width: 118%; aspect-ratio: 1 / 1; border-radius: 50%; z-index: -1;
          background: radial-gradient(circle, rgba(201,154,63,0.30) 0%, rgba(201,154,63,0.10) 42%, transparent 70%);
          filter: blur(6px);
        }
        /* Inner edge pinned to a fixed viewport fraction (NOT fixed px) so the
           centre column (32vw–68vw) stays clear for the title at ANY width.
           Anchor each figure to the OUTER edge (natural width, NO clamp → no
           squish, image keeps aspect + sits on the bottom edge) then translate
           so the inner edge lands on 32vw / 68vw; the outer arm bleeds off.
           (NB: anchoring via right:68vw+width:auto clamped the box to 32vw and
           squished the photo + lifted it off the floor → use transform.) */
        /* Matej = exact MIRROR of Hekthor (same height + mirrored anchor) so he
           behaves identically at every width. A bigger figure shows a smaller
           fraction of itself inside the fixed 32vw on-screen slice → his face
           got cut at narrow widths while Hekthor (smaller) stayed whole. Equal
           size → equal visible fraction → both read cleanly, symmetrically. */
        /* Size blends vh+vw (max) so wide-short windows don't shrink the figures;
           inner anchor capped (min 32vw, 460px) so very wide windows don't fling
           them into the far corners. 16"/mobile land in the same band as before. */
        .fig-matej { left: 0; right: auto; transform: translateX(calc(min(32vw, 460px) - 100% + 200px)); height: clamp(440px, max(70vh, 38vw), 820px); }
        .fig-hekthor { right: 0; left: auto; transform: translateX(calc(100% - min(32vw, 460px) - 80px)); height: clamp(300px, max(48vh, 26vw), 560px); }

        /* PC: lift the title block toward the upper third */
        @media (min-width: 768px) { .scroll-intro { padding-bottom: 18vh; } }

        /* ── Clickable skip — 150px from the bottom edge ── */
        .about-skip {
          position: absolute; left: 50%; bottom: 64px; transform: translateX(-50%);
          z-index: 5; pointer-events: auto; cursor: pointer; background: none; border: none;
          font-family: 'Space Grotesk', sans-serif; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.18em; padding-left: 0.18em;
          font-size: clamp(0.66rem, 1.1vw, 0.78rem); color: rgba(60,40,12,0.62);
          transition: color 0.25s ease;
        }
        .about-skip:hover { color: #8a5a14; }
        .about-skip { text-shadow: 0 0 3px rgba(253,248,236,0.95), 0 1px 8px rgba(253,248,236,0.85); }

        @media (max-width: 767px) {
          /* lift the whole text block (title+sub+arrows) to the same start
             height as the Religion hero (~181px from top) instead of centering */
          .scroll-intro { justify-content: flex-start; padding-top: 92px; }
          /* skip flows under the arrows (visible) instead of behind the figures */
          .about-skip { position: static; transform: none; left: auto; bottom: auto; margin-top: 14px; }
          .origin-title { font-size: clamp(2.2rem, 11vw, 3.4rem); }
          .fig-matej { height: 46vh; left: -58px; right: auto; transform: none; opacity: 0.92; }
          .fig-hekthor { height: 30vh; right: 4px; left: auto; transform: none; opacity: 0.92; }
        }
        .scroll-cue svg:nth-child(1) { animation-delay: 0s; }
        .scroll-cue svg:nth-child(2) { animation-delay: 0.18s; }
        .scroll-cue svg:nth-child(3) { animation-delay: 0.36s; }
        @keyframes scrollCue { 0%, 100% { opacity: 0.38; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .scroll-cue svg { animation: none; opacity: 0.55; } }

        /* ── Outro CTA button (btn-gold canonical, scoped locally) ── */
        .about-outro .btn-gold {
          padding: 14px 36px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.30);
          border-radius: 8px; color: #000;
          font-family: 'Cinzel', serif; font-size: 0.88rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: transform 0.2s, box-shadow 0.22s;
          box-shadow: 0 0 40px rgba(230,158,26,0.38), inset 0 1px 0 rgba(255,255,255,0.28);
        }
        .about-outro .btn-gold:hover {
          transform: scale(1.04);
          box-shadow: 0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.28);
        }

        /* ── Outro hero (moved to the very bottom of the page) ── */
        .about-outro {
          position: relative; z-index: 2; background: ${Le.pageBg};
          display: flex; align-items: center; justify-content: center;
          padding: clamp(56px, 12vh, 130px) 20px;
        }

        .sw-intro {
          position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); pointer-events: none;
          margin: 0; width: min(86vw, 760px); text-align: center; opacity: 0;
          /* LAB: modrá ostáva modrá (je to poklona Star Wars, nie ozdoba), ale
             svetlomodrá so svetelnou žiarou je na papyruse neviditeľná — na
             tmavej sále svietila, tu musí byť ATRAMENT. Žiara preto padá a
             odtieň sa prehlbuje. */
          color: #1D3C86; font-family: 'Cinzel', serif; font-weight: 700;
          font-size: clamp(1.05rem, 2.2vw, 1.6rem); line-height: 1.5;
          text-shadow: 0 0 10px rgba(253,248,236,0.90), 0 1px 2px rgba(29,60,134,0.22);
          will-change: opacity;
        }
        .sw-slow {
          position: absolute; left: 50%; bottom: clamp(96px, 14vh, 140px); transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; pointer-events: none;
          color: #1D3C86; font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em;
          text-transform: uppercase; white-space: nowrap; will-change: opacity;
        }
        .sw-slow-arr { display: flex; flex-direction: column; align-items: center; line-height: 0; }
        .sw-slow-arr svg { display: block; margin-top: -2px; animation: swSlow 2.4s ease-in-out infinite; }
        .sw-slow-arr svg:nth-child(2) { animation-delay: .5s; }
        .sw-slow-arr svg:nth-child(3) { animation-delay: 1s; }
        @keyframes swSlow { 0%, 100% { opacity: .25; } 40% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .sw-slow-arr svg { animation: none; opacity: .7; } }
        .sw-logo {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1);
          width: min(72vw, 720px); height: auto; opacity: 0; pointer-events: none;
          filter: drop-shadow(0 10px 30px rgba(110,71,16,0.35)); will-change: transform, opacity;
        }
        .sw-stage {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none;
          perspective: 320px; perspective-origin: 50% 0%;
          -webkit-mask-image: linear-gradient(to top, #000 14%, rgba(0,0,0,0.92) 34%, transparent 76%);
          mask-image: linear-gradient(to top, #000 14%, rgba(0,0,0,0.92) 34%, transparent 76%);
        }
        .sw-crawl-text {
          position: absolute; left: 50%; bottom: 0; width: min(92vw, 720px);
          transform-origin: 50% 100%;
          transform: translateX(-50%) rotateX(28deg) translateY(92vh); opacity: 0;
          /* LAB: crawl ostáva zlatý, ale na papyruse musí byť tmavý — svetlá
             žltá by na bledom plátne nebola text, ale hmla. Vynáranie do stratena
             robí mask-image na .sw-stage (alfa maska), takže sa NEMENÍ: text sa
             tam nestráca do čiernej, ale do priehľadna — teda do papyrusu. */
          color: #6E4A12; font-family: 'Cinzel', serif; text-align: justify;
          text-shadow: 0 1px 1px rgba(253,248,236,0.75); will-change: transform;
        }
        .sw-crawl-text .sw-episode {
          text-align: center; text-transform: uppercase; letter-spacing: 0.4em;
          font-size: clamp(0.9rem, 1.6vw, 1.15rem); margin: 0 0 0.4em; opacity: 0.85;
        }
        .sw-crawl-text .sw-ctitle {
          text-align: center; text-transform: uppercase; font-weight: 700;
          font-size: clamp(2.2rem, 6vw, 4rem); margin: 0 0 8vh; letter-spacing: 0.04em;
        }
        .sw-crawl-text p:not(.sw-episode) {
          font-size: clamp(1.15rem, 2.3vw, 1.7rem); line-height: 1.55; font-weight: 700; margin: 0 0 4vh;
        }

        .hpin { display: none; }
        @media (min-width: 768px) {
          .hpin { display: block; position: relative; z-index: 2; }  /* height inline = (N+1)×100vh */
          .hpin-sticky { position: sticky; top: 0; height: 100vh; overflow: hidden; }

          .hpin-head {
            position: absolute; left: 0; right: 0; top: 0; padding-top: 4vh;
            text-align: center; z-index: 50; pointer-events: none;
            transform-origin: center top; will-change: transform;
          }
          .hpin-head .tl-h2 { margin: 0; }

          /* stage fills the viewport; cards are stacked + centred, driven by JS */
          .hpin-stage { position: absolute; inset: 0; opacity: 0; }

          .hcard {
            position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%);
            /* shrink the block: always ≥160px breathing room each side on PC, capped 900px */
            width: min(900px, calc(100vw - 320px)); will-change: transform, opacity;
            display: flex; align-items: center; gap: clamp(26px, 3vw, 50px);
            /* LAB: papyrusová karta. Rám je PLNÝ zlatý (nie vyblednutý hairline) —
               karta stojí na papyrusovom podklade, takže ju od plochy odlíši len
               rám a tieň, nie výplň. Rovnaký dôvod, pre ktorý má matrica v /packu
               na úrovni KARTA rám 1.5px. */
            background: linear-gradient(160deg, #FDF8EC 0%, #F6E9CE 52%, #EEDDB4 100%);
            border: 1.5px solid ${Le.edge}; border-radius: 22px;
            padding: clamp(26px, 2.8vw, 44px);
            box-shadow: ${Le.shadow}, inset 0 1px 0 rgba(255,252,244,0.85);
          }
          .hcard-photo {
            position: relative;
            flex: 0 0 auto; width: min(42vh, 400px); aspect-ratio: 1 / 1; border-radius: 14px; overflow: hidden;
            background: #E6D2A6; box-shadow: 0 0 0 1px rgba(140,96,20,0.28) inset;
          }
          .hcard-photo img {
            width: 100%; height: 100%; object-fit: cover; display: block;
            animation: kenburns 16s ease-in-out infinite alternate;
          }
          @keyframes kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          .hcard-text { flex: 1 1 auto; min-width: 0; }
          .hcard-text .tl-year { font-size: 0.8rem; margin-bottom: 16px; }
          .hcard-text .tl-title { font-size: clamp(1.6rem, 2.7vw, 2.3rem); margin-bottom: 16px; }
          .hcard-text .tl-text { font-size: clamp(0.98rem, 1.2vw, 1.12rem); line-height: 1.7; max-width: 560px; }

          .hpin-dots { position: absolute; left: 0; right: 0; bottom: clamp(26px, 5vh, 52px); justify-content: center; display: flex; gap: 9px; z-index: 50; }
          .hpin-dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(140,96,20,0.32); transition: width .35s ease, background .35s ease; }
          .hpin-dot.on { width: 26px; background: #8a5a14; }

          @media (prefers-reduced-motion: reduce) { .hcard-photo img { animation: none; } }
        }
      `}),e.jsx("div",{"aria-hidden":!0,className:"lab-pageveil",style:{position:"fixed",inset:0,background:Le.pageVeil,zIndex:1,pointerEvents:"none"}}),e.jsx("div",{ref:j,"aria-hidden":!0,style:{position:"fixed",inset:0,background:Le.pageBg,opacity:0,zIndex:1,pointerEvents:"none"}}),e.jsx("div",{className:"about-sticky-nav",ref:R,children:!o&&e.jsx(Zt,{withNav:!0})}),s&&e.jsx("section",{className:"swcrawl",ref:F,style:{height:"340vh"},children:e.jsxs("div",{className:"swcrawl-sticky",children:[l&&e.jsxs("div",{ref:x,className:"op-hero",children:[!o&&e.jsx(Zt,{withNav:!0}),e.jsx("div",{className:"about-fig fig-matej","aria-hidden":!0,children:e.jsx("img",{src:"/images/about-matej.webp",alt:""})}),e.jsx("div",{className:"about-fig fig-hekthor","aria-hidden":!0,children:e.jsx("img",{src:"/images/about-hekthor.webp",alt:""})}),e.jsxs("div",{className:"scroll-intro",style:{zIndex:3},children:[e.jsx("h1",{className:"origin-title",dangerouslySetInnerHTML:{__html:f("about.origin.title")}}),e.jsx("p",{className:"origin-sub",children:f("about.origin.sub")}),e.jsxs("div",{className:"scroll-cue","aria-hidden":!0,children:[e.jsx("svg",{width:"40",height:"40",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"6 9 12 15 18 9"})}),e.jsx("svg",{width:"40",height:"40",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"6 9 12 15 18 9"})}),e.jsx("svg",{width:"40",height:"40",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"6 9 12 15 18 9"})})]}),e.jsx("button",{type:"button",className:"about-skip",onClick:z,children:f("about.origin.skip")})]})]}),e.jsx("p",{className:"sw-intro",ref:v,children:f("about.crawl.intro")}),e.jsxs("div",{className:"sw-slow",ref:_,"aria-hidden":!0,children:[e.jsx("span",{className:"sw-slow-arr",children:[0,1,2].map(a=>e.jsx("svg",{width:"14",height:"10",viewBox:"0 0 24 16",fill:"none",stroke:"currentColor",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"5 4 12 11 19 4"})},a))}),f("about.crawl.slow")]}),e.jsx("img",{...Xi(),className:"sw-logo",ref:Z,src:"/images/dogypt-gold-logo.webp",alt:"DOGYPT"}),e.jsx("div",{className:"sw-stage",children:e.jsxs("div",{className:"sw-crawl-text",ref:L,children:[e.jsx("p",{className:"sw-episode",children:f("about.crawl.episode")}),e.jsx("h2",{className:"sw-ctitle",children:f("about.crawl.faith")}),Er.map(a=>e.jsx("p",{children:f(a)},a))]})})]})}),c&&e.jsxs(e.Fragment,{children:[e.jsx("section",{className:"hpin",style:{height:`${(Yt.length+1)*100}vh`,marginTop:s?"-100vh":0},ref:y,children:e.jsxs("div",{className:"hpin-sticky",children:[e.jsx("div",{className:"hpin-head",children:e.jsx("h2",{className:"tl-h2",children:f("about.timeline.heading")})}),e.jsx("div",{className:"hpin-stage",ref:N,children:Yt.map(a=>e.jsxs("article",{className:"hcard",children:[e.jsx("div",{className:"hcard-photo",children:e.jsx(Po,{images:a.images,alt:f(`about.milestone.${a.id}.tag`)})}),e.jsxs("div",{className:"hcard-text",children:[e.jsx("span",{className:"tl-year",children:f(`about.milestone.${a.id}.year`)}),e.jsx("h3",{className:"tl-title",children:f(`about.milestone.${a.id}.title`)}),e.jsx("p",{className:"tl-text",children:f(`about.milestone.${a.id}.body`)})]})]},a.id))}),e.jsx("div",{className:"hpin-dots",ref:O,children:Yt.map((a,i)=>e.jsx("span",{className:`hpin-dot${i===0?" on":""}`},a.id))})]})}),e.jsxs("section",{className:"tl-section",children:[e.jsx("div",{className:"tl-head",children:e.jsx("h2",{className:"tl-h2",children:f("about.timeline.heading")})}),e.jsx("div",{className:"tl",ref:m,children:Yt.map(a=>e.jsxs("div",{className:"tl-row",children:[e.jsx("span",{className:"tl-node"}),e.jsx("span",{className:"tl-conn"}),e.jsxs("article",{className:"tl-card",children:[e.jsx("div",{className:"tl-img",children:e.jsx(Po,{images:a.images,alt:f(`about.milestone.${a.id}.tag`)})}),e.jsxs("div",{className:"tl-body-wrap",children:[e.jsx("span",{className:"tl-year",children:f(`about.milestone.${a.id}.year`)}),e.jsx("h3",{className:"tl-title",children:f(`about.milestone.${a.id}.title`)}),e.jsx("p",{className:"tl-text",children:f(`about.milestone.${a.id}.body`)})]})]})]},a.id))})]}),e.jsx(fr,{variant:"papyrus"}),e.jsx(kr,{}),e.jsx("section",{className:"about-outro",style:{textAlign:"center"},children:e.jsxs("div",{className:"flex flex-col",style:{alignItems:"center",gap:"clamp(16px, 2.6vh, 24px)",maxWidth:820},children:[e.jsxs("h1",{className:"about-quote",children:[e.jsx("span",{className:"aq-white",children:f("about.outro.quoteLead")})," ",f("about.outro.quoteTail")]}),e.jsx("div",{className:"hero-intro",style:{textAlign:"center",alignItems:"center",maxWidth:"100%"},children:e.jsx("p",{dangerouslySetInnerHTML:{__html:f("about.outro.body")}})}),e.jsxs("p",{className:"about-signoff",children:[f("about.outro.name1")," ",e.jsx("span",{className:"amp",children:f("about.outro.and")})," ",f("about.outro.name2")]}),e.jsx("a",{href:"/heroglyph/name",className:"btn-gold",style:{marginTop:8,marginBottom:100},children:f("about.outro.cta")})]})})]}),p&&e.jsx(wr,{})]})}export{Qr as A,Yi as C,Wr as G,qr as R,yr as S,fr as T,Xr as V,Xi as a,Jr as b,jr as f,Zr as o};
