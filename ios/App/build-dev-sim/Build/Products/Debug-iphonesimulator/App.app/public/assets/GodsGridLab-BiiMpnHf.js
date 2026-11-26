import{u as Pa,r as i,j as e,L as B,c as Sa,l as le,f as Ht,g as Kt,ak as jt,bx as zt,bw as tt,by as Gt,bz as Zt,bA as jo,aG as zo,bq as No,br as Eo,as as Le,b4 as Fe,bs as Ao,bt as So,bu as Mo,bv as Po,b5 as Nt,d as za,z as Et,E as At,D as Co}from"./index-DriUOdZL.js";import{L as St}from"./LanguagePicker-L0DjjzFI.js";import{p as Mt}from"./godsData-kTA2EY6K.js";import{i as Pt,c as ot,b as Lo}from"./countryGeo-BNEVCU3g.js";import{gridTileUrl as Ct}from"./cloudinaryService-CiRx-3N_.js";import{S as To}from"./Seo-BBjSGQ3b.js";import{L as ka}from"./labTheme-DLctEqJ2.js";import{o as Yt}from"./photoConfirm-Bdi68HVK.js";import{i as Wt,f as Jt}from"./photoIntake-EOawjgPq.js";import{d as qt}from"./dogSlug-CB23gDR2.js";import{d as Oo,s as Do,a as Io,f as Ro,w as _o,c as Fo}from"./useShareCard-CHDF5kRG.js";import{r as $o}from"./HandIcons-BI9sYdb3.js";import{D as Bo,a as Xt}from"./DogMessage-4eQP7hWc.js";import{c as Vo}from"./createLucideIcon-Dcdrkmhx.js";import{useToast as Uo}from"./use-toast-CKCh4Cay.js";import{B as Ka}from"./BrandIcon-lowQpHlA.js";import{f as Ga}from"./flagUrl-B21iQI9I.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ho=Vo("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]),Lt=new Map;function Ko(a){if(!a||!/^[0-9a-f]{96}$/.test(a))return;const l=Lt.get(a);if(l)return l;const d=new Uint8Array(102),b=new DataView(d.buffer);d[0]=66,d[1]=77,b.setUint32(2,d.length,!0),b.setUint32(10,54,!0),b.setUint32(14,40,!0),b.setInt32(18,4,!0),b.setInt32(22,-4,!0),b.setUint16(26,1,!0),b.setUint16(28,24,!0),b.setUint32(34,48,!0);for(let y=0;y<16;y++){const h=54+y*3,O=y*6;d[h]=parseInt(a.slice(O+4,O+6),16),d[h+1]=parseInt(a.slice(O+2,O+4),16),d[h+2]=parseInt(a.slice(O,O+2),16)}let x="";d.forEach(y=>{x+=String.fromCharCode(y)});const j=`data:image/bmp;base64,${btoa(x)}`;return Lt.set(a,j),j}const Na=a=>a.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim(),Za=a=>/[^\d#\s]/.test(a);function Tt(a,l,d=8){const b=Na(l);if(!b)return[];const x=a.filter(j=>Na(j.name).includes(b));return x.sort((j,y)=>{const h=Na(j.name).startsWith(b)?0:1,O=Na(y.name).startsWith(b)?0:1;return h!==O?h-O:(j.n??1e9)-(y.n??1e9)}),x.slice(0,d)}function Go({hits:a,onGo:l,edgeBase:d,anonKey:b}){const x=Pa(),[j,y]=i.useState(null),[h,O]=i.useState(""),[k,Z]=i.useState("idle"),V=a.map(E=>E.key).join("|");if(i.useEffect(()=>{y(null),Z("idle"),O("")},[V]),!a.length)return e.jsx("div",{className:"ws-none",children:x("wall.search.none")});const W=a.find(E=>E.key===j&&E.wallId),n=async()=>{if(!(!(W!=null&&W.wallId)||!h.includes("@")||k!=="idle")){Z("sending");try{await fetch(`${d}/send-guest-mail`,{method:"POST",headers:{"Content-Type":"application/json",apikey:b,Authorization:`Bearer ${b}`},body:JSON.stringify({kind:"resend",dogId:W.wallId,email:h.trim()})})}catch{}Z("sent")}};return e.jsxs("div",{className:"ws-root",children:[e.jsx("style",{children:Zo}),W?e.jsxs("div",{className:"ws-join",children:[e.jsxs("div",{className:"ws-row ws-row--head",children:[e.jsx("img",{className:"ws-ph",src:W.photo,alt:"",draggable:!1}),e.jsx("span",{className:"ws-name",children:W.name})]}),k==="sent"?e.jsx("p",{className:"ws-sent",children:x("wall.search.sent")}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"ws-hint",children:x("wall.search.joinHint")}),e.jsx("input",{className:"ws-mail",type:"email",inputMode:"email",autoComplete:"email",autoFocus:!0,value:h,placeholder:x("wall.search.emailPh"),onChange:E=>O(E.target.value),onKeyDown:E=>{E.key==="Enter"&&(E.stopPropagation(),n())}}),e.jsx("button",{type:"button",className:"ws-cta",disabled:!h.includes("@")||k!=="idle",onClick:n,children:x("wall.search.send")})]}),e.jsx("button",{type:"button",className:"ws-back",onClick:()=>y(null),children:x("wall.search.back")})]}):e.jsx("div",{className:"ws-list",children:a.map(E=>e.jsxs("div",{className:"ws-row",children:[e.jsxs("button",{type:"button",className:"ws-go",onClick:()=>l(E),children:[E.photo?e.jsx("img",{className:"ws-ph",src:E.photo,alt:"",draggable:!1}):e.jsx("span",{className:"ws-ph"}),e.jsxs("span",{className:"ws-tx",children:[e.jsx("span",{className:"ws-name",children:E.name}),e.jsx("span",{className:"ws-sub",children:E.n?E.country:x("wall.search.vision")})]})]}),E.n?e.jsxs("span",{className:"ws-num",children:["#",E.n]}):E.wallId&&e.jsx("button",{type:"button",className:"ws-joinbtn",onClick:()=>y(E.key),children:x("wall.search.join")})]},E.key))})]})}const Zo=`
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
  flex: none; padding: 2px 8px; border-radius: 999px; background: ${B.grad};
  color: ${B.ink}; font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
}
.ws-joinbtn {
  flex: none; height: 28px; padding: 0 8px; border-radius: 8px; cursor: pointer;
  border: 1.5px solid ${B.edge}; background: transparent; color: ${B.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px; letter-spacing: 0.06em;
  text-transform: uppercase; white-space: nowrap;
}
.ws-joinbtn:hover { background: ${B.fill}; }
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
  border: 1.5px solid ${B.edge}; background: #fff; color: rgba(0,0,0,0.82);
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; outline: none;
}
.ws-cta {
  height: 44px; border-radius: 8px; border: 0; cursor: pointer; width: 100%;
  background: ${B.grad}; color: ${B.ink}; box-shadow: ${Sa};
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
`,Ot=7.37,Yo={tur:10.63,deu:8.68,fra:8.63,pol:8.4,prt:8.37,nld:8.21,esp:8.15,ita:7.94};function nt(a){return Math.max(1,(Yo[a]??Ot)/Ot)}const Dt=8.66,Wo={deu:13.5,ita:11.99,tur:11.96,fra:11.29,prt:11.17,nld:10.02,esp:9.85,pol:9.67};function Qt(a){return Math.max(1,(Wo[a]??Dt)/Dt)}const Ya=4;function It(a,l){const d=Math.abs(Math.cos(a)),b=Math.abs(Math.sin(a));return l/Math.pow(Math.pow(d,Ya)+Math.pow(b,Ya),1/Ya)}const Jo=4,qo=80,eo=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function ao(a,l={}){const d=l.density??1,b={ctx:null,host:null,hero:null,S:0,pw:0,r0:0,next:0,em:[],ps:[]};return{frame:j=>{const y=a;if(!y)return;const h=b;if(!h.ctx){if(h.ctx=y.getContext("2d"),!h.ctx)return;h.host=y.parentElement,h.hero=y.closest(".planet-hero"),h.em=[1.15,-.78,1.62,-1.28,.92,-1.75].map((E,ae)=>({w:E,a:ae*1.1}));const n=Math.max(80,Math.round(620*d));h.ps=Array.from({length:n},()=>({on:!1,a:0,h:0,vr:0,L:0,t:0,T:0,sz:1,tr:[]}))}if(h.hero&&h.hero.style.opacity==="0.000")return;const O=h.host?h.host.offsetWidth:0;if(!O)return;if(Math.abs(O-h.pw)>.5){h.pw=O;const n=Math.round(O+2*qo),E=Math.min(2,window.devicePixelRatio||1);h.S=n,y.width=n*E,y.height=n*E,y.style.width=n+"px",y.style.height=n+"px",h.ctx.setTransform(E,0,0,E,0,0),h.ctx.lineCap="round",h.r0=O/2+Jo}const k=h.ctx,Z=h.S,V=Z/2,W=Z/2;for(k.clearRect(0,0,Z,Z),h.em.forEach(n=>{n.a+=n.w*j}),h.next+=560*d*j;h.next>=1;){h.next-=1;const n=h.ps.find(de=>!de.on);if(!n)break;const E=h.em[Math.random()*h.em.length|0],ae=Math.random()<.36,re=ae?Math.random()*6.2832:E.a;n.on=!0,n.a=re+(Math.random()-.5)*.14,n.h=Math.random()*4;const q=It(n.a,h.r0)+n.h;n.L=E.w*(.95+Math.random()*.85)*q*q;const G=Math.random()>.8,K=ae?.55:1;n.vr=(G?66+Math.random()*108:9+Math.random()*34)*K,n.t=0,n.T=G?.38+Math.random()*.5:.55+Math.random()*1.05,n.sz=Math.random()<.12?2.8:1.05+Math.random()*1,n.tr.length=0}for(const n of h.ps){if(!n.on)continue;if(n.t+=j,n.t>=n.T){n.on=!1,n.tr.length=0;continue}n.h+=n.vr*j,n.vr*=Math.pow(.3,j);const E=It(n.a,h.r0)+n.h;n.a+=n.L/(E*E)*j;const ae=V+Math.cos(n.a)*E,re=W+Math.sin(n.a)*E;n.tr.unshift(ae,re),n.tr.length>28&&(n.tr.length=28);const q=1-n.t/n.T,G=n.tr.length/2;if(G>1){k.beginPath(),k.moveTo(n.tr[0],n.tr[1]);for(let K=1;K<G;K++)k.lineTo(n.tr[K*2],n.tr[K*2+1]);k.strokeStyle=`rgba(110,74,18,${(q*.34).toFixed(3)})`,k.lineWidth=n.sz*1.7+1,k.stroke()}for(let K=G-1;K>0;K--){const de=1-K/G,ie=q*(.3+.7*de);ie<.015||(k.beginPath(),k.moveTo(n.tr[K*2],n.tr[K*2+1]),k.lineTo(n.tr[K*2-2],n.tr[K*2-1]),k.strokeStyle=de>.86?`rgba(255,255,255,${(ie*.95).toFixed(3)})`:de>.34?`rgba(255,233,168,${(ie*.9).toFixed(3)})`:`rgba(201,154,63,${(ie*.7).toFixed(3)})`,k.lineWidth=n.sz*(.55+de*.85),k.stroke())}k.beginPath(),k.arc(ae,re,n.sz*.6,0,6.2832),k.fillStyle=`rgba(255,255,255,${Math.min(1,q).toFixed(3)})`,k.fill()}}}}const Xo='<svg viewBox="0 0 414.312 414.312"><path d="M398.932,139.543l-1.133-0.472l-0.944-0.802c-3.316-2.834-7.495-4.268-12.441-4.268H272.546l-0.346-7.432 c-0.69-14.637-1.219-29.28-1.741-43.922c-0.736-20.367-1.493-41.423-2.697-62.075c-0.73-12.355-9.855-18.055-18.158-19.266 l-1.158-0.261C246.12,0.333,244.084,0,242.047,0h-97.71c-10.364,0-15.102,5.949-17.25,10.936l-0.754,1.737l-1.465,1.201 c-4.192,3.443-6.287,8.336-6.23,14.543c0.35,37.719,4.222,75.309,7.967,107.107l0.957,8.097l-37.133,2.724 c-19.999,1.47-39.991,2.943-59.991,4.377c-3.389,0.244-6.416,1.161-9.244,2.793l-0.889,0.515l-0.995,0.264 c-8.765,2.351-15.125,10.494-15.125,19.355v5.583c0,3.031,0.805,6.094,2.397,9.11l0.754,1.427l0.114,1.609 c2.123,27.218,2.303,54.68,2.308,82.771c0,13.441,10.077,17.356,14.414,18.418l0.937,0.289c2.48,0.954,4.951,1.411,7.561,1.411 h102.885l0.17,7.622c0.267,11.827,0.665,23.648,1.066,35.465c0.635,18.591,1.29,37.815,1.384,56.803 c0.066,13.192,9.884,17.219,14.106,18.342l0.919,0.31c2.509,1.01,5.091,1.503,7.889,1.503h94.913c5.474,0,9.973-1.742,13.391-5.18 l1.538-1.523c3.443-3.423,5.189-7.932,5.189-13.416c-0.005-29.178-0.208-63.576-1.676-97.37l-0.355-8.14h113.128 c12.659,0,18.098-9.1,18.981-17.616l0.183-1.777l0.935-1.523c1.889-3.062,2.812-6.454,2.812-10.364V156.904 C410.118,146.396,404.045,141.658,398.932,139.543z M369.885,248.455H253.219c-15.234,0-18.316,12.599-18.905,16.463l-0.3,1.25 c-0.792,2.427-1.097,4.879-0.935,7.5c2.118,34.042,2.569,67.349,2.722,92.561l0.046,7.846h-57.706l-0.208-7.586 c-0.262-9.303-0.584-18.616-0.911-27.919c-0.64-18.332-1.305-37.282-1.404-56c-0.01-1.752-0.249-3.483-0.759-5.454l-0.274-1.076 l0.035-1.112c0.193-6.129-1.825-11.837-5.527-15.665c-3.359-3.474-7.929-5.23-13.591-5.23H49.942l-0.084-7.714 c-0.17-16.849-0.8-33.301-1.866-48.906l-0.536-7.749l36.409-2.671c19.974-1.473,39.941-2.938,59.908-4.373 c1.731-0.127,3.458-0.479,5.423-1.109l1.369-0.437l1.439,0.084c6.251,0.375,11.882-1.612,15.059-5.215 c2.668-3.021,3.687-7.223,3.031-12.484c-5.329-42.754-9.166-78.696-10.555-115.131l-0.312-8.097h69.312l0.319,7.472 c0.473,11.212,0.869,22.427,1.265,33.644c0.772,21.886,1.579,44.521,2.955,66.702c0.087,1.338,0.311,2.704,0.701,4.296 l0.233,1.856c0.036,9.968,5.982,20.035,19.195,20.035h116.676V248.455z"/></svg>';function to(a={}){const{faces:l=[],label:d="Add photo",labelPicked:b="Change photo",note:x="",subnote:j="",ariaLabel:y="Add a photo of your god",onPick:h,noPlus:O=!1}=a,k=document.createElement("span");k.className="ph-portal";const Z=document.createElement("span");Z.className="ph-halo",Z.setAttribute("aria-hidden","true");const V=document.createElement("span");V.className="ph-rim",V.setAttribute("aria-hidden","true");const W=document.createElement("canvas");W.className="ph-spark",W.setAttribute("aria-hidden","true");const n=document.createElement("button");n.type="button",n.className="ph-add",n.setAttribute("aria-label",y),h&&n.addEventListener("click",h);const E=l.slice(0,12),ae=E.length?`<span class="ph-add-cyc" aria-hidden="true" style="--ph-cycn:${Math.max(1,E.length)}">`+E.map((q,G)=>`<img src="${q}" alt="" style="animation-delay:calc(var(--ph-cyc) * ${G})">`).join("")+"</span>":"",re=q=>{n.classList.toggle("has-photo",!!q),n.innerHTML='<span class="ph-bed" aria-hidden="true"></span>'+(q?"":ae)+'<span class="ph-add-veil" aria-hidden="true"></span>'+(q?`<img class="ph-shot" src="${q}" alt="">`:"")+'<span class="ph-mark">'+(O?"":`<span class="ph-ico" aria-hidden="true">${Xo}</span>`)+`<span class="ph-lbl">${q?b:d}</span>`+(x?`<span class="ph-note">${x}</span>`:"")+(j?`<span class="ph-sub">${j}</span>`:"")+"</span>"};return re(null),k.append(Z,V,W,n),{el:k,canvas:W,setPhoto:re}}const oo=`
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
`;function Qo(a){if(!a)return null;const l=new Date(a);if(Number.isNaN(l.getTime()))return null;const d=Math.floor((Date.now()-l.getTime())/864e5);return d>=0?d:null}function en(a,l){return!a.guest&&a.n!=null&&a.name?Oo(a.n,`${l}-invite`,a.name):a.wallId?`https://dogypt.com/?dog=${encodeURIComponent(a.wallId)}`:null}function no({dog:a,where:l,edgeBase:d,anonKey:b}){const x=Pa(),[j,y]=i.useState(!1),[h,O]=i.useState(!1),[k,Z]=i.useState(""),[V,W]=i.useState("idle");i.useEffect(()=>{y(!1),O(!1),Z(""),W("idle")},[a.key]),i.useEffect(()=>{if(!j)return;const G=window.setTimeout(()=>y(!1),2200);return()=>window.clearTimeout(G)},[j]);const n=en(a,l),E=Qo(a.birthDate),ae=async()=>{var ie;if(!n)return;const G=x("wall.inviteText",{name:a.name}),K=(ie=window.matchMedia)==null?void 0:ie.call(window,"(pointer: coarse)").matches;let de="copy";if(K&&typeof navigator.share=="function")try{await navigator.share({title:`${a.name} · DOGYPT`,text:G,url:n}),de="share"}catch{de="cancel"}else try{await navigator.clipboard.writeText(`${G} ${n}`),y(!0)}catch{de="cancel"}le("dog_invite",{where:l,how:de,guest:!!a.guest,...a.n!=null?{pack_number:a.n}:{}})},re=async()=>{if(!(!a.wallId||!d||!b||!k.includes("@")||V!=="idle")){W("sending");try{await fetch(`${d}/send-guest-mail`,{method:"POST",headers:{"Content-Type":"application/json",apikey:b,Authorization:`Bearer ${b}`},body:JSON.stringify({kind:"resend",dogId:a.wallId,email:k.trim()})})}catch{}W("sent")}},q=n&&e.jsxs("button",{type:"button",className:`pp-act ${a.guest?"pp-act--out":"pp-act--cta"}`,onClick:ae,children:[e.jsx($o,{size:16}),x(j?"wall.inviteCopied":"wall.invite")]});return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"pp-photo-wrap",children:[e.jsx("img",{className:"pp-photo",src:a.photo,alt:"",draggable:!1}),a.n!=null&&!a.guest&&e.jsxs("span",{className:"pp-seal",children:["#",a.n]})]}),e.jsx("div",{className:"pp-name",children:a.name}),E!==null&&e.jsxs("div",{className:"pp-life",children:[e.jsxs("span",{className:"pp-life-label",children:[e.jsx(Ho,{className:"pp-life-spark","aria-hidden":!0}),x("pack.dog.livingBestLife")]}),e.jsx("span",{className:"pp-days",children:x("dogPage.daysCount",{days:E.toLocaleString("en-US")})})]}),e.jsx("div",{className:"pp-rule"}),a.heroglyph&&e.jsx("img",{className:"pp-glyph",src:a.heroglyph,alt:"",draggable:!1}),e.jsx(Xt,{n:a.n,text:a.message,className:"pp-msg"}),a.status&&e.jsx("p",{className:"pp-status",children:a.status}),a.guest&&h?e.jsx("div",{className:"pp-join",children:V==="sent"?e.jsx("p",{className:"pp-sent",children:x("wall.search.sent")}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"pp-status",children:x("wall.search.joinHint")}),e.jsx("input",{className:"pp-mail",type:"email",inputMode:"email",autoComplete:"email",autoFocus:!0,value:k,placeholder:x("wall.search.emailPh"),onChange:G=>Z(G.target.value),onKeyDown:G=>{G.stopPropagation(),G.key==="Enter"&&re()}}),e.jsx("button",{type:"button",className:"pp-act pp-act--cta",disabled:!k.includes("@")||V!=="idle",onClick:re,children:x("wall.search.send")})]})}):e.jsx("div",{className:"pp-acts",children:a.guest?e.jsxs(e.Fragment,{children:[q,a.wallId&&d&&e.jsx("button",{type:"button",className:"pp-act pp-act--cta",onClick:()=>O(!0),children:x("wall.search.join")})]}):e.jsxs(e.Fragment,{children:[a.n!=null&&a.name&&e.jsx("a",{className:"pp-act pp-act--out",href:qt(a.name,a.n),children:x("wall.dogPage")}),q]})})]})}const ro=`
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
${Bo}
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
  color: ${B.ink};
  background: ${B.grad};
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
  background: ${B.grad};
  color: ${B.ink};
  font-family: 'Cinzel', serif;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.1;
  white-space: nowrap;
  border: none;
  box-shadow: ${Sa};
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
  color: ${B.edge};
  background: rgba(255,250,236,0.62);
  border: 1px solid ${B.edge};
}
.pp-act--out:hover { background: ${B.fill}; box-shadow: 0 0 12px ${B.halo}; }
.pp-act--cta {
  color: ${B.ink};
  background: ${B.grad};
  border: 1px solid ${B.edge};
  box-shadow: ${Sa};
}
.pp-act--cta:hover { background: ${B.gradHover}; }
.pp-act:disabled { opacity: 0.45; cursor: default; }

.pp-join { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.pp-join .pp-act { max-width: none; width: 100%; }
.pp-mail {
  height: 44px; width: 100%; box-sizing: border-box; border-radius: 12px; padding: 0 12px;
  border: 1.5px solid ${B.edge}; background: #fff; color: rgba(0,0,0,0.82);
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; outline: none;
}
.pp-sent {
  margin: 0; padding: 8px 12px; border-radius: 12px;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4; text-align: center;
  color: #2E5C3B; background: rgba(61,122,78,0.12); border: 1px solid rgba(61,122,78,0.4);
}
`,an="0 2px 6px -2px rgba(5,15,48,0.55), inset 0 1px 0 rgba(201,154,63,0.30)",Qe=320,tn=.68,on="svetla",nn="hlbka",Rt=a=>a.split("*").map((l,d)=>d%2?e.jsx("span",{className:"g",children:l},d):l),rn=200;function sn(a,l){const d=2*Math.PI*Qe*Math.cos(a*Math.PI/180)/l;return Math.max(4,Math.round(d/2)*2)}function ln(a){const l=Math.sqrt(4*Math.PI*Qe*Qe/Math.max(8,a)),d=Math.max(8,Math.round(l*tn)),b=l/Qe*(180/Math.PI),x=[],j=Math.floor(90/b);for(let y=-j;y<=j;y++){const h=y*b;Math.abs(h)<=90-b*.6&&x.push(h)}return{spacing:l,tile:d,lats:x}}const _t=3e3,Ft=72,pn=96,Ma=4,$t=Ma*2,Wa=24,cn=40,dn=200,hn=330,un=76,mn=124,bn=110,gn=14;function vn(){const a=window.innerWidth,l=window.innerHeight,b=a/2-Qe-cn-Wa,x=Math.min(hn,Math.floor(b));if(x<dn)return null;const j=(l-Ft-pn)/Ma,y=Math.min(mn,Math.floor(j-gn));if(y<un)return null;const h=[];for(let O=0;O<Ma;O++)h.push(Math.round(Ft+j*(O+.5)));return{w:x,h:y,photo:Math.min(62,y-30),lines:y>=bn?3:2,lx:Wa,rx:a-Wa-x,ys:h}}const kn=(a,l)=>a==="l"?l.lx+l.w:l.rx,fn=i.memo(function({tiles:l}){return e.jsx(e.Fragment,{children:l.map(({key:d,dog:b,lat:x,lon:j},y)=>e.jsx("div",{className:"planet-tile","data-i":y,style:{"--t":`rotateY(${j}deg) rotateX(${-x}deg) translateZ(${Qe}px)`,...b.lqip?{backgroundImage:`url(${b.lqip})`}:null},children:e.jsx("img",{src:b.photo,alt:"",draggable:!1,decoding:"async",onLoad:h=>{h.currentTarget.dataset.ok="1"}})},d))})});function xn({dogs:a,open:l,paused:d=!1,anywhere:b=!1,onClose:x,pick:j,enter:y}){const h=Pa(),{lang:O}=Ht(),k=nt(O),Z=i.useMemo(()=>a.reduce((r,c)=>Math.max(r,c.n??0),0),[a]),V=e.jsxs(e.Fragment,{children:[e.jsx("b",{children:Z})," / ",h("wall.hero.total")," ",h("wall.hero.dogs")]}),W=Kt(),[n,E]=i.useState(null),[ae,re]=i.useState(!1),[q,G]=i.useState(!1),K=i.useRef(typeof document<"u"&&!!document.getElementById("op-boot"));i.useEffect(()=>{if(!ae||q||K.current)return;const r=window.setTimeout(()=>G(!0),700);return()=>window.clearTimeout(r)},[ae,q]),i.useEffect(()=>{if(ae)return;let r=!1;const c=()=>{var z;if(r)return;if(r=!0,!K.current){re(!0);return}re(!0),G(!0);const u=((z=document.fonts)==null?void 0:z.ready)??Promise.resolve();Promise.race([u,new Promise(D=>setTimeout(D,1500))]).then(()=>{requestAnimationFrame(()=>requestAnimationFrame(()=>window.dispatchEvent(new Event("dogypt:planet-ready"))))})},f=window.setTimeout(c,K.current?3500:1200),I=window.setInterval(()=>{const u=document.querySelectorAll(".planet-ball img");if(!u.length)return;let z=0;u.forEach(D=>{D.complete&&D.naturalWidth>0&&z++}),z>=Math.min(24,u.length)&&c()},90);return()=>{window.clearTimeout(f),window.clearInterval(I)}},[ae]);const de=a.slice(0,12).map(r=>r.photo).filter(Boolean),ie=i.useRef(null),ea=i.useRef(null),xe=i.useRef(null),Ge=i.useRef(null),ia=i.useRef(null),La=de.join("|"),$e=y?y.label.replace(/ (\S+)$/,"<br>$1"):h("wall.hero.addPhoto"),sa=i.useRef(y);sa.current=y,i.useEffect(()=>{const r=ea.current;if(!r)return;const c=to({faces:de,label:$e,...y?{ariaLabel:y.label,noPlus:!0}:{},labelPicked:h("wall.photo.change"),note:"",onPick:()=>sa.current?W(sa.current.href):ke.current?fa(ke.current):$()}),f=Qt(O);f>1&&c.el.style.setProperty("--ph-lblk",(.1/f).toFixed(4)),r.appendChild(c.el),Ge.current=c,xe.current=c.el;const I=window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;return ia.current=ao(c.canvas,{density:I?.42:1}),()=>{c.el.remove(),Ge.current=null,xe.current=null,ia.current=null}},[La,$e,O]),i.useEffect(()=>{var r;(r=Ge.current)==null||r.setPhoto(n)},[n]);const ke=i.useRef(null);i.useEffect(()=>{ke.current=n},[n]);const De=()=>{var r;ie.current&&(ie.current.value=""),(r=ie.current)==null||r.click()},$=()=>{ie.current&&Gt(ie.current,()=>Zt(null))},Be=i.useRef(void 0),fa=r=>{le("planet_photo_confirm_shown"),Yt({photoUrl:r,packNumber:a.reduce((c,f)=>Math.max(c,f.n??0),1)+1,onContinue:c=>{le("cta_become_dogyptian_click",{location:"planet"}),Jt(c,Be.current),c&&le("planet_photo_cropped"),W("/heroglyph/name")},onPickAnother:()=>{le("planet_photo_confirm_another"),De()},onClose:()=>le("planet_photo_confirm_dismissed"),copy:{eyebrow:h("wall.photo.yoursWillBe"),lead:h("wall.photo.lead"),cta:h("wall.photo.cta"),another:h("wall.photo.another"),zoom:h("wall.photo.zoom"),later:h("wall.photo.laterNote")}})},Ta=r=>{var u;const c=(u=r.target.files)==null?void 0:u[0];if(!c)return;r.target.value="";const f=Wt(c),I=f.previewUrl;Be.current=f.uploaded,E(I),fa(I)},Se=i.useRef({x:-24,y:0}),aa=i.useRef(null),ha=rn,pe=i.useRef(null),ye=i.useRef(!0),[je,Ie]=i.useState([]),xa=i.useRef(0),[me,la]=i.useState(null),ta=i.useRef(null),oa=i.useRef(null),Ze=i.useRef(null),Oa=.08,ze=i.useRef(!1),[U,se]=i.useState(null),Da=on,Ia=nn,pa=i.useRef(null),be=r=>{var c;pa.current!==r&&((c=pa.current)==null||c.classList.remove("is-hot"),pa.current=r,r==null||r.classList.add("is-hot"))},{tiles:Ye,tile:Ve}=i.useMemo(()=>{const{tile:r,lats:c,spacing:f}=ln(ha);if(a.length===0)return{tiles:[],tile:r};const I=[];let u=0;const z=a.find(D=>D.n===1)??a[0];I.push({key:"pole-top",dog:z,lat:-90,lon:0});for(const D of c){const he=sn(D,f);for(let te=0;te<he;te++)I.push({key:`${D}:${te}`,dog:a[u%a.length],lat:D,lon:360/he*te}),u++}return I.push({key:"pole-bottom",dog:a[u%a.length],lat:90,lon:0}),{tiles:I,tile:r}},[a,ha]);i.useEffect(()=>{if(!l||!j)return;const r=a.find(c=>c.n===j.n);r&&se(r)},[j==null?void 0:j.seq,l,a]);const ca=r=>{var f;if(!r)return null;const c=Number(r.dataset.i);return Number.isInteger(c)?((f=Ye[c])==null?void 0:f.dog)??null:null},Ra=(r,c,f,I)=>{var te;const u=new Set(f.filter(H=>H.side===r).map(H=>H.slot)),z=r==="l"?((te=document.querySelector(".numpad-overlay--planet.open .numpad"))==null?void 0:te.getBoundingClientRect())??null:null;let D=null,he=1/0;for(let H=0;H<Ma;H++){if(u.has(H)||z&&z.left<I.lx+I.w&&Math.abs(I.ys[H]-(z.top+z.height/2))<(I.h+z.height)/2)continue;const Ce=Math.abs(I.ys[H]-c);Ce<he&&(he=Ce,D=H)}return D},na=()=>{var I,u;if(ze.current)return;const r=performance.now(),c=Ze.current;let f=null;if(c&&!pe.current&&!U){const z=document.elementFromPoint(c.x,c.y),D=((I=z==null?void 0:z.closest)==null?void 0:I.call(z,".planet-tile"))??null;D?f=D:(u=z==null?void 0:z.closest)!=null&&u.call(z,".planet-ball")&&(f=pa.current)}be(f),Ie(z=>{let D=z;if(f&&!z.some(H=>H.el===f)){const H=ca(f),Ce=f.getBoundingClientRect(),_e=Ce.left+Ce.width/2,Ne=Ce.top+Ce.height/2,We=ta.current;if(H&&We){const Je=(c?c.x:_e)<window.innerWidth/2?"l":"r",wa=Ra(Je,Ne,z,We);wa!==null&&(D=[...z,{id:xa.current++,dog:H,side:Je,el:f,x:_e,y:Ne,slot:wa,leftAt:null}],D.length>$t&&(D=D.slice(D.length-$t)))}}let he=D!==z;const te=[];for(const H of D){if(!H.el.isConnected){he=!0;continue}const _e=H.el===f||oa.current===H.id?null:H.leftAt??r;if(_e!==null&&r-_e>_t){he=!0;continue}const Ne=H.el.getBoundingClientRect(),We=Ne.left+Ne.width/2,Je=Ne.top+Ne.height/2;_e!==H.leftAt||Math.abs(We-H.x)>.5||Math.abs(Je-H.y)>.5?(te.push({...H,x:We,y:Je,leftAt:_e}),he=!0):te.push(H)}return he?te:z})};i.useEffect(()=>{if(!l)return;let r=0;const c=4,f=()=>!b&&window.scrollY>c;ze.current=f();let I=window.scrollY;const u=()=>{const z=window.scrollY;Se.current.y+=(z-I)*Oa,I=z,ze.current||(ze.current=!0,Ze.current=null,be(null),Ie(D=>D.length?[]:D)),clearTimeout(r),r=window.setTimeout(()=>{ze.current=f()},160)};return window.addEventListener("scroll",u,{capture:!0,passive:!0}),()=>{window.removeEventListener("scroll",u,!0),clearTimeout(r),ze.current=!1}},[l,b]),i.useEffect(()=>{if(!l||d)return;let r=0,c=0,f=performance.now(),I="";const u=z=>{var H;const D=z-f;f=z,!ze.current&&ye.current&&(Se.current.y+=D*.006);const he=aa.current,te=`rotateX(${Se.current.x}deg) rotateY(${Se.current.y}deg)`;he&&te!==I&&(he.style.transform=te,I=te),!ze.current&&++c%4===0&&na(),!ze.current&&!eo&&((H=ia.current)==null||H.frame(Math.min(.05,D/1e3))),r=requestAnimationFrame(u)};return r=requestAnimationFrame(u),()=>cancelAnimationFrame(r)},[l,d,Ye,U]);const Re=r=>r.leftAt!==null&&performance.now()-r.leftAt>_t-500;i.useEffect(()=>{const r=()=>{const c=vn();ta.current=c,la(c),c||Ie([])};return r(),window.addEventListener("resize",r),()=>window.removeEventListener("resize",r)},[]),i.useEffect(()=>{const f=()=>{document.documentElement.style.setProperty("--ball-fit",String(Math.max(.3,(window.innerWidth-12)/662)))};return f(),window.addEventListener("resize",f),()=>{window.removeEventListener("resize",f),document.documentElement.style.removeProperty("--ball-fit")}},[]),i.useEffect(()=>(document.body.classList.toggle("planet-open",l),()=>document.body.classList.remove("planet-open")),[l]),i.useEffect(()=>{if(!l)return;const r=c=>{c.key==="Escape"&&(U?se(null):x())};return window.addEventListener("keydown",r),()=>window.removeEventListener("keydown",r)},[l,x,U]),i.useEffect(()=>{be(null),Ie([])},[ha]),i.useEffect(()=>{l||(be(null),Ie([]),se(null))},[l]);const ya=r=>{var f,I;const c=r.target.closest(".planet-tile");pe.current={x:r.clientX,y:r.clientY,dist:0,tile:c},ye.current=!1,(I=(f=aa.current)==null?void 0:f.setPointerCapture)==null||I.call(f,r.pointerId)},ee=r=>{const c=pe.current;if(!c){if(r.pointerType!=="mouse")return;Ze.current={x:r.clientX,y:r.clientY},na();return}c.dist+=Math.hypot(r.clientX-c.x,r.clientY-c.y);const f=Se.current;f.x=Math.max(-62,Math.min(62,f.x-(r.clientY-c.y)*.25)),f.y+=(r.clientX-c.x)*.25,c.x=r.clientX,c.y=r.clientY},Me=()=>{const r=pe.current;if(pe.current=null,ye.current=!0,!r||r.dist>=12)return;const c=ca(r.tile);se(c),c||be(null)},ua=r=>{if(!U||a.length<2)return;const c=a.indexOf(U);c<0||se(a[(c+r+a.length)%a.length])},Pe=(()=>{const r=xe.current;if(!r||!je.length)return null;const c=r.getBoundingClientRect();if(!c.width)return null;const f=getComputedStyle(r),I=c.width/(r.offsetWidth||c.width),u=te=>parseFloat(f.getPropertyValue(te))||0,z=(u("--ph-rimin")+u("--ph-rimw"))*I,D=c.width+z*2,he=c.height+z*2;return{x:c.x-z,y:c.y-z,w:D,h:he,r:D*((u("--ph-r")||24)/100)}})();return e.jsxs("div",{className:`planet-root v-side d-${Da} b-${Ia}${l?" open":""}${U?" pop":""}`,onClick:r=>{if(!U)return;const c=r.target;c.closest(".pp-panel")||c.closest(".planet-ball")||c.closest(".pnote")||se(null)},"aria-hidden":!l,children:[e.jsx("style",{children:ro+`
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
          width: ${Qe*2}px;
          height: ${Qe*2}px;
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
          color: ${ka.ink};
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
          color: ${ka.ink};
          text-shadow:
            0 0 5px rgba(253,248,236,1),
            0 0 12px rgba(253,248,236,1),
            0 0 26px rgba(253,248,236,1);
        }
        .ph-count b { font-weight: 600; color: ${ka.goldSolid}; }
        .ph-count--mob { display: none; }

        /* ── PORTÁL = CTA ────────────────────────────────────────────────────
           Tvar aj iskry žijú v components/gods/dogPortal.ts — TÚ ISTÚ dlaždicu
           kreslí aj stena (GodsGridLab), ktorá je vanilla DOM. Dve kópie by sa
           rozišli pri prvej úprave, preto je tu len vloženie. */
        ${oo}
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
          color: ${B.ink};
          background: ${B.grad};
          border: 1px solid ${B.edge};
          box-shadow: ${an};
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
          background: ${B.grad};
          border: 1.5px solid ${B.edge};
          box-shadow: ${Sa};
          color: ${B.ink};
          cursor: pointer;
          z-index: 2;
        }
        .pp-nav:hover { background: ${B.gradHover}; }
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
            ${jt} 0 0 / 180px 180px,
            ${zt},
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
          ${tt}
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
            ${jt} 0 0 / 260px 260px,
            ${zt},
            radial-gradient(120% 100% at 50% 42%, #F4E7CB 0%, #EADBB6 46%, #DCC79B 100%);
          background-blend-mode: multiply, normal, normal, normal, normal;
        }
        .planet-root.b-papyrus::before {
          content: '';
          position: absolute;
          inset: 0;
          ${tt}
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
      `}),e.jsxs("div",{className:`planet-stage${ae?" ball-in":""}${K.current?" no-intro":""}`,children:[Z>0&&e.jsx("p",{className:"ph-count ph-count--mob",children:V}),e.jsx("div",{className:"planet-ball",ref:aa,style:{transform:`rotateX(${Se.current.x}deg) rotateY(${Se.current.y}deg)`,"--tile":`${Ve}px`},onPointerDown:ya,onPointerMove:ee,onPointerUp:Me,onPointerCancel:Me,onPointerLeave:()=>{Ze.current=null,be(null)},children:e.jsx(fn,{tiles:Ye})}),e.jsx("div",{className:"planet-shade"}),e.jsxs("div",{className:`planet-hero${q?" hero-in":""}`,children:[Z>0&&e.jsx("p",{className:"ph-count ph-count--pc",children:V}),e.jsxs("h1",{className:"ph-h1",style:k>1?{"--ph-em":(7.5*k).toFixed(2)}:void 0,children:[e.jsx("span",{className:"ph-l",children:Rt(h("wall.hero.l1"))}),e.jsx("span",{className:"ph-l",children:Rt(h("wall.hero.l2"))})]}),e.jsx("p",{className:"ph-lead",children:h("wall.hero.missingFace")}),e.jsx("span",{className:"ph-mount",ref:ea}),e.jsx("input",{ref:ie,type:"file",accept:"image/*",className:"ph-add-file",onChange:Ta})]})]}),je.length>0&&!U&&me&&e.jsxs("svg",{className:"pn-leads",width:"100%",height:"100%","aria-hidden":"true",children:[Pe&&e.jsx("defs",{children:e.jsxs("mask",{id:"pn-cta-hole",maskUnits:"userSpaceOnUse",x:"0",y:"0",width:"100%",height:"100%",children:[e.jsx("rect",{x:"0",y:"0",width:"100%",height:"100%",fill:"#fff"}),e.jsx("rect",{x:Pe.x,y:Pe.y,width:Pe.w,height:Pe.h,rx:Pe.r,ry:Pe.r,fill:"#000"})]})}),e.jsx("g",{mask:Pe?"url(#pn-cta-hole)":void 0,children:je.map(r=>{const c=kn(r.side,me),f=me.ys[r.slot];return e.jsxs("g",{className:Re(r)?"is-going":void 0,children:[e.jsx("polyline",{pathLength:1,points:`${r.x},${r.y} ${r.side==="l"?c+18:c-18},${f} ${c},${f}`}),e.jsx("circle",{cx:r.x,cy:r.y,r:3.5})]},r.id)})})]}),!U&&me&&je.map(r=>e.jsxs("div",{className:`pnote${Re(r)?" is-going":""}`,role:"button",tabIndex:-1,"aria-label":r.dog.name,onClick:()=>se(r.dog),onPointerEnter:()=>{oa.current=r.id},onPointerLeave:()=>{oa.current===r.id&&(oa.current=null)},style:{left:r.side==="l"?me.lx:me.rx,top:me.ys[r.slot],"--pnw":`${me.w}px`,"--pnh":`${me.h}px`,"--pnp":`${me.photo}px`,"--pnl":me.lines},children:[e.jsx("img",{className:"pnote-photo",src:r.dog.photoBig||r.dog.photo,alt:"",draggable:!1}),e.jsxs("div",{className:"pnote-body",children:[e.jsxs("div",{className:"pnote-head",children:[e.jsx("span",{className:"pnote-name",children:r.dog.name}),r.dog.n!=null&&e.jsxs("i",{className:"pnote-n",children:["#",r.dog.n]}),r.dog.heroglyph&&e.jsx("img",{className:"pnote-glyph",src:r.dog.heroglyph,alt:"",draggable:!1})]}),e.jsx(Xt,{n:r.dog.n,text:r.dog.message||(r.dog.n===1?h("wall.hektor.msg"):""),className:"pnote-msg",toggle:!1})]})]},r.id)),U&&e.jsxs("div",{className:"pp-panel pp-svetla",role:"dialog","aria-label":U.name,children:[a.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"pp-nav pp-nav--prev",onClick:()=>ua(-1),"aria-label":"Previous dog",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:e.jsx("path",{d:"M15 5l-7 7 7 7"})})}),e.jsx("button",{className:"pp-nav pp-nav--next",onClick:()=>ua(1),"aria-label":"Next dog",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:e.jsx("path",{d:"M9 5l7 7-7 7"})})})]}),e.jsx(no,{where:"planet",dog:{key:U.n===1?"hektor":`n:${U.n??U.name}`,name:U.name,n:U.n,wallId:null,photo:U.photoBig||U.photo,heroglyph:U.heroglyph,message:U.message||(U.n===1?h("wall.hektor.msg"):""),birthDate:U.birthDate}})]})]})}const Ja=`${Co}/get-grid-dogs?tiers=all`,Ea=a=>a.split("*").map((l,d)=>d%2?`<span class="g">${Oe(l)}</span>`:Oe(l)).join(""),io=5;function qa(a,l=0){const d=[];let b=0,x=0,j=-1,y=l;for(;d.length<a;){const h=b-1,O=x+1,k=j-1,Z=y+1;for(let V=k+1;V<=Z;V++)d.push({col:O,row:V});for(let V=O-1;V>=h;V--)d.push({col:V,row:Z});for(let V=Z-1;V>=k;V--)d.push({col:h,row:V});for(let V=h+1;V<=O;V++)d.push({col:V,row:k});b=h,x=O,j=k,y=Z}return d.slice(0,a)}const Aa=.85*.85,Ca=(typeof window<"u"&&window.innerWidth<768?.67:1)*Aa,we=Math.round(360*Ca),Ke=Math.round(360*Ca),Te=we+Math.round(64*Ca),Ae=Ke+Math.round(64*Ca),yn=Math.min(800,Math.max(320,Math.round(we*Math.min(typeof window<"u"&&window.devicePixelRatio||1,2)))),Xa=3,Qa=1,wn="/images/dogypt-logo-black-i.png",jn=5,et="wall-lab-enroll-v2";function zn(){if(typeof window>"u")return!1;const a=window.location.hostname;return a.endsWith("lovable.app")||a==="localhost"||a==="127.0.0.1"}const Bt=a=>a?Ae/2:0,Nn=typeof window<"u"&&window.innerWidth<768,En=Nn?0:42,An="light",Vt={sk:"Slovakia",cz:"Czechia",pl:"Poland",hu:"Hungary",at:"Austria",de:"Germany",us:"USA",gb:"United Kingdom",fr:"France",it:"Italy"};function Ut(a){return ot(a)||""}function Oe(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ra(a){if(!a)return"";try{const l=new URL(a,window.location.origin);return l.protocol==="http:"||l.protocol==="https:"?l.href:""}catch{return""}}function rt(a){const l="/image/upload/",d=a.indexOf(l);if(d===-1)return null;let b=a.slice(d+l.length);return b=b.replace(/^v\d+\//,""),b=b.replace(/\.[a-zA-Z0-9]+$/,""),b||null}function at(a){const l=ra(a||"");if(!l)return"";const d=rt(l);if(!d&&l==="/images/hektor-grid.webp")return"/images/hektor-grid-tile.webp";const b=typeof window<"u"&&window.innerWidth<=768?120:160;return d?it(d,b):l}function so(a){const l=ra(a||"");if(!l)return"";const d=rt(l);return!d&&l==="/images/hektor-grid.webp"?"/images/hektor-grid-320.webp":d?it(d,320):l}function Sn(a){const l=ra(a||"");if(!l)return"";const d=rt(l);return d?it(d,yn):l}const Mn=/^[a-z]{1,3}_[^/]*$/;function it(a,l){const d=a.split("/"),b=[];for(;d.length>1&&Mn.test(d[0]);)b.push(d.shift());return b.length?Ct(d.join("/"),l).replace("/image/upload/",`/image/upload/${b.join("/")}/`):Ct(a,l)}const ga={id:"hektor-fill",dog_name:"HEKTHOR",pack_number:1,cloudinary_main_url:"/images/hektor-grid.webp",patron_svg:null,heroglyph_png_url:"/images/hekthor-heroglyph.webp",country:"SVK",owner_message:null,birth_date:null};function va(a,l){const d=a.wall_tier,b=!d||d==="member",x=!!a.wall_pending,j=b&&a.pack_number===1,y=d==="guest"&&!a.owner_message?l(`wall.guestLine.${1+Math.floor(Math.random()*io)}`):"";return{key:j?"hektor":a.pack_number!=null?`n:${a.pack_number}`:`g:${a.wall_id}`,name:(a.dog_name||"DOGYPTIAN").toUpperCase(),n:a.pack_number??null,wallId:b?null:a.wall_id||null,photo:so(a.cloudinary_main_url),heroglyph:ra(a.heroglyph_png_url||""),message:x?"":a.owner_message||y||(j?l("wall.hektor.msg"):""),birthDate:a.birth_date||null,guest:!b,status:d&&x?l("wall.status.pending"):""}}const Pn=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];function lo(a,l,d){return d<=0?0:((a+3*l)%d+d)%d}function Cn(a,l,d,b,x=!1){if(a===0&&l===0||x&&a===0&&l===1)return null;if(a===0&&l===-1)return 1;const j=d.get(`${a},${l}`);return j?j.pack_number??null:b.length===0?null:b[lo(a,l,b.length)].pack_number??null}function Xn({embedded:a=!1,ctaMode:l=!1,ctaLabel:d,ctaHref:b="/heroglyph/name",portalDock:x=!1,dockHostId:j,paused:y=!1,onWallChange:h,planetAnywhere:O=!1,v2:k}={}){const[Z,V]=i.useState(null);i.useLayoutEffect(()=>{V(j?document.getElementById(j):null)},[j]);const W=Kt(),n=Pa(),E=i.useRef(null),ae=i.useRef(null),[re,q]=i.useState(!1);i.useRef(!1);const{toast:G}=Uo(),[K,de]=i.useState(null),[ie,ea]=i.useState(null),[xe,Ge]=i.useState(0),[ia,La]=i.useState(()=>new URLSearchParams(window.location.search).get("heroglyphUrl")||wn),[$e,sa]=i.useState(!1),[ke,De]=i.useState(!1),[$,Be]=i.useState(()=>{if(!a||window.location.pathname==="/wall"||window.location.pathname==="/hall")return!1;const t=new URLSearchParams(window.location.search);return!t.get("dog")&&!t.get("focus")&&!t.get("reveal")}),[fa,Ta]=i.useState([]),[Se,aa]=i.useState(!$);i.useEffect(()=>{$||aa(!0)},[$]);const ha=()=>{if(Se){Be(!1);return}aa(!0),requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>Be(!1),250)))},[pe,ye]=i.useState(null),je=i.useRef(null);je.current=pe;const Ie=i.useRef(new WeakMap),xa=i.useRef(null),me=i.useRef(null),la=i.useRef(null),ta=i.useRef(null),oa=i.useRef(!1),Ze=i.useRef(null),[Oa,ze]=i.useState(null),[U,se]=i.useState(""),Da=An,[Ia,pa]=i.useState([]),be=i.useRef(new Map),Ye=i.useRef([]),Ve=i.useRef(null),[ca,Ra]=i.useState([]),na=i.useRef(new Map),Re=i.useRef(null),ya=i.useRef(null),ee=i.useRef(n);i.useEffect(()=>{ee.current=n},[n]);const[Me,ua]=i.useState(()=>{try{return localStorage.getItem(et)!=="0"}catch{return!0}}),Pe=i.useRef(null),r=i.useRef(Me);i.useEffect(()=>{r.current=Me},[Me]),i.useEffect(()=>{if(!Me||$||eo)return;let t=0,p=0;const m=N=>{t=requestAnimationFrame(m);const A=p?Math.min(.05,(N-p)/1e3):0;p=N;const w=Pe.current;A&&w&&w.canvas.isConnected&&w.sparks.frame(A)};return t=requestAnimationFrame(m),()=>cancelAnimationFrame(t)},[Me,$]);const{lang:c}=Ht(),f=i.useRef(c);i.useEffect(()=>{f.current=c},[c]);const I=i.useRef(k);I.current=k;const u=i.useMemo(()=>{const t=new URLSearchParams(window.location.search),p=t.get("reveal"),m=p==="demo";return{active:p==="true"||m,dogName:m?"Toby":t.get("dogName")||"Your Dog",photoUrl:m?"/dogs/toby.jpg":t.get("photoUrl")||"",packNumber:m?String(Mt.length):t.get("packNumber")||String(Mt.length+1),heroglyphUrl:t.get("heroglyphUrl")||"",heroglyphVUrl:t.get("heroglyphVUrl")||""}},[]),z=i.useMemo(()=>{const t=new URLSearchParams(window.location.search).get("focus");if(!t)return null;const p=parseInt(t,10);return Number.isFinite(p)&&p>=1?p:null},[]),D=i.useMemo(()=>{const t=new URLSearchParams(window.location.search).get("dog");return t&&/^[0-9a-f-]{36}$/.test(t)?t:null},[]);i.useEffect(()=>{let t=!0;return(jo(Ja)??zo(Ja)).then(p=>{if(t){if(p.length>0){const m=p.reduce((v,F)=>Math.max(v,F.pack_number??0),0),N=qa(m+5,r.current?1:0),A=new Map,w=new Map;for(const v of p){const F=v.pack_number;if(!F||F<2)continue;const Q=F-2;Q<N.length&&(A.set(`${N[Q].col},${N[Q].row}`,v),v.wall_id&&w.set(v.wall_id,{col:N[Q].col,row:N[Q].row}))}const X=p.filter(v=>(v.wall_tier==="supporter"||v.wall_tier==="guest")&&v.pack_number==null),oe=Math.max(0,m-1),ve=qa(oe+X.length,r.current?1:0);X.forEach((v,F)=>{const Q=ve[oe+F];Q&&(A.set(`${Q.col},${Q.row}`,v),v.wall_id&&w.set(v.wall_id,{col:Q.col,row:Q.row}))}),na.current=w,be.current=A,Ye.current=[ga,...p.filter(v=>(v.pack_number??0)>=2)],Ta(Ye.current.map(v=>({id:v.id,name:v.dog_name||"",n:v.pack_number,photo:at(v.cloudinary_main_url),lqip:Ko(v.lqip),photoBig:so(v.cloudinary_main_url),heroglyph:ra(v.heroglyph_png_url||""),message:v.owner_message||"",birthDate:v.birth_date||null})).filter(v=>v.photo)),Ra([ga,...p.filter(v=>(v.pack_number??0)>=2),...X].filter(v=>v.dog_name).map(v=>({key:v.wall_id||v.id,name:(v.dog_name||"").toUpperCase(),n:v.pack_number??null,wallId:v.wall_id||null,photo:at(v.cloudinary_main_url),country:Pt(ot(v.country)||"")||""})));const ue=new Map;for(const v of Ye.current){const F=ot(v.country);F&&ue.set(F,(ue.get(F)??0)+1)}if(pa([...ue.entries()].map(([v,F])=>({iso2:v,iso3:Pt(v),count:F})).sort((v,F)=>F.count-v.count)),u.active){const v=parseInt(u.packNumber,10),F=p.find(Q=>Q.pack_number===v);!u.heroglyphUrl&&(F!=null&&F.heroglyph_png_url)&&La(F.heroglyph_png_url),F!=null&&F.share_card_url&&de(F.share_card_url)}}sa(!0)}}).catch(()=>{t&&sa(!0)}),()=>{t=!1}},[u.active,u.packNumber]);const[he,te]=i.useState("glyph");i.useEffect(()=>{if(!u.active||!u.heroglyphUrl&&!$e)return;const t=document.getElementById("op-boot"),p=t&&!t.classList.contains("out")?1e3:0;p&&window.dispatchEvent(new Event("dogypt:planet-ready")),Ge(1),te(p?"wait":"glyph");const m=[setTimeout(()=>te("glyph"),p),setTimeout(()=>te("vanish"),p+2800),setTimeout(()=>{te("zoom"),Ge(2)},p+3500),setTimeout(()=>Ge(3),p+3600),setTimeout(()=>{Ge(4),window.history.replaceState(null,"",window.location.pathname==="/wall"?"/wall":"/")},p+5600)];return()=>m.forEach(clearTimeout)},[u.active,u.heroglyphUrl,$e]);const H=i.useMemo(()=>typeof window>"u"?1:Math.max(window.innerWidth,window.innerHeight)/we,[]),Ce=u.active&&xe>=1&&xe<3,_e=i.useMemo(()=>!!u.heroglyphVUrl&&typeof window<"u"&&window.innerHeight>=window.innerWidth,[u.heroglyphVUrl]),Ne=i.useRef(h);Ne.current=h,i.useEffect(()=>{var t;(t=Ne.current)==null||t.call(Ne,!$)},[$]),i.useEffect(()=>{if(!a)return;const t=window.location.pathname,p=k?"/hall":"/wall";if(t!=="/"&&t!=="/wall"&&t!=="/hall")return;const m=$?"/":p;t!==m&&window.history.replaceState(window.history.state,"",m+window.location.search)},[$,a,k]);const We=t=>{var p,m;if(t.n)$?ze(N=>({n:t.n,seq:((N==null?void 0:N.seq)??0)+1})):(p=Ve.current)==null||p.call(Ve,t.n);else if(t.wallId){const N=na.current.get(t.wallId);N&&($?(Be(!1),window.setTimeout(()=>{var A;return(A=Re.current)==null?void 0:A.call(Re,N.col,N.row)},450)):(m=Re.current)==null||m.call(Re,N.col,N.row))}(!$||!t.n||window.innerWidth<=760)&&De(!1),se("")},Je=()=>{var p;if(Za(U)){const m=Tt(ca,U,1)[0];m&&We(m);return}const t=parseInt(U.replace(/[#\s]/g,""),10);!isNaN(t)&&t>=1&&($?ze(m=>({n:t,seq:((m==null?void 0:m.seq)??0)+1})):(p=Ve.current)==null||p.call(Ve,t)),(!$||!isNaN(t)&&t>=1&&window.innerWidth<=760)&&De(!1),se("")};i.useEffect(()=>{if(!ke||!$)return;const t=p=>{const m=p.target;m.isConnected&&(m.closest(".numpad")||m.closest(".planet-ball")||m.closest(".gods-bottom-bar")||(De(!1),se("")))};return document.addEventListener("click",t),()=>document.removeEventListener("click",t)},[ke,$]),i.useEffect(()=>{if(!ke)return;const t=p=>{const m=p.target,N=!!m&&(m.tagName==="INPUT"||m.tagName==="TEXTAREA");N&&(m!=null&&m.classList.contains("ws-mail"))||N&&p.key!=="Enter"&&p.key!=="Escape"||(p.key>="0"&&p.key<="9"?se(A=>(A+p.key).slice(0,6)):p.key==="Backspace"?se(A=>A.slice(0,-1)):p.key==="Enter"?Je():p.key==="Escape"&&(De(!1),se("")))};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[ke,U,ca,$]),i.useEffect(()=>{if(!ke||!window.matchMedia("(hover: hover) and (pointer: fine)").matches)return;const t=window.setTimeout(()=>{var p;return(p=ya.current)==null?void 0:p.focus()},60);return()=>window.clearTimeout(t)},[ke]),i.useEffect(()=>{if(xe>=1){const t=document.querySelector(".reveal-card");t==null||t.classList.add("reveal-active")}},[xe]),i.useEffect(()=>{},[xe,u.active]),i.useEffect(()=>{if(!u.active||K||!re)return;let t=!0,p=0,m;const N=20,A=parseInt(u.packNumber,10),w=()=>{p+=1,fetch(Ja).then(X=>X.ok?X.json():[]).then(X=>{if(!t)return;const oe=X.find(ve=>ve.pack_number===A);oe!=null&&oe.share_card_url?de(oe.share_card_url):p<N&&(m=setTimeout(w,4e3))}).catch(()=>{t&&p<N&&(m=setTimeout(w,4e3))})};return m=setTimeout(w,1500),()=>{t=!1,clearTimeout(m)}},[u.active,u.packNumber,K,re]);const wa=async()=>{if(!(!K||ie)){ea("share");try{const t=parseInt(u.packNumber,10),p=n("share.dogVoice",{dog:u.dogName.toUpperCase()}),m=await Do({pack:t,dogName:u.dogName,imageUrl:K,channel:"native",shareText:p});le("share_clicked",{channel:m,type:"sharecard",location:"whatnext"}),m==="copied"&&G({title:n("sharecard.linkCopied")})}catch(t){G({title:n("sharecard.saved"),description:t instanceof Error?t.message:void 0,variant:"destructive"})}finally{ea(null)}}},po=()=>{const t=n("share.dogVoice",{dog:u.dogName.toUpperCase()});Ro(parseInt(u.packNumber,10),u.dogName,t),le("share_clicked",{channel:"facebook",type:"sharecard",location:"whatnext"})},co=()=>{const t=n("share.dogVoice",{dog:u.dogName.toUpperCase()});_o(parseInt(u.packNumber,10),u.dogName,t),le("share_clicked",{channel:"whatsapp",type:"sharecard",location:"whatnext"})},ho=async()=>{await Fo(parseInt(u.packNumber,10),u.dogName),le("share_clicked",{channel:"copy",type:"sharecard",location:"whatnext"}),G({title:n("sharecard.linkCopied")})},uo=async()=>{if(!(!K||ie)){ea("download");try{await Io({imageUrl:K,dogName:u.dogName}),le("share_clicked",{channel:"download",type:"sharecard",location:"whatnext"}),G({title:n("sharecard.saved")})}catch(t){G({title:n("sharecard.saved"),description:t instanceof Error?t.message:void 0,variant:"destructive"})}finally{ea(null)}}};return i.useEffect(()=>{if(!re)return;const t=document.querySelector(".wn-card");if(!t)return;const p=t.querySelector(".wn-track"),m=t.querySelectorAll(".wn-slide"),N=t.querySelector(".wn-counter .wn-cur");if(!p||!N||m.length===0)return;const A=m.length;let w=0;const X=fe=>{m.forEach(ja=>ja.classList.remove("wn-in"));const qe=m[fe];qe.offsetWidth,qe.classList.add("wn-in")},oe=fe=>{w=(fe+A)%A,p.style.transform=`translateX(-${w*100}%)`,N.textContent=String(w+1),X(w),t.classList.toggle("wn-card--share",w===A-1)},ve=t.querySelector(".wn-arrow.wn-prev"),ue=t.querySelector(".wn-arrow.wn-next"),v=()=>oe(w-1),F=()=>oe(w+1);ve==null||ve.addEventListener("click",v),ue==null||ue.addEventListener("click",F);const Q=fe=>{fe.key==="ArrowLeft"&&oe(w-1),fe.key==="ArrowRight"&&oe(w+1),fe.key==="Escape"&&q(!1)};window.addEventListener("keydown",Q);let Ee=null;const R=t.querySelector(".wn-slider"),Ue=fe=>{Ee=fe.touches[0].clientX},ma=fe=>{if(Ee===null)return;const qe=fe.changedTouches[0].clientX-Ee;Math.abs(qe)>40&&oe(qe<0?w+1:w-1),Ee=null};return R==null||R.addEventListener("touchstart",Ue,{passive:!0}),R==null||R.addEventListener("touchend",ma,{passive:!0}),()=>{ve==null||ve.removeEventListener("click",v),ue==null||ue.removeEventListener("click",F),window.removeEventListener("keydown",Q),R==null||R.removeEventListener("touchstart",Ue),R==null||R.removeEventListener("touchend",ma)}},[re]),i.useEffect(()=>{if(!$e||!(Se||u.active))return;const t=E.current,p=ae.current;if(!t||!p)return;let m=window.innerWidth,N=window.innerHeight,A=u.active?m/2-Xa*Te-we/2:m/2-we/2,w=u.active?N/2-Qa*Ae-Ke/2:N/2-Ke/2-Bt(r.current),X=!1,oe=0,ve=0,ue=0,v=0,F=0,Q=0,Ee=0,R=null;const Ue=new Map;let ma=0,fe=0,qe=0,ja=0,ce=null;function st(o){var S,T,P;const s=Ie.current.get(o);if(s){if(ce&&(ce.classList.remove("is-open"),ce=null),((S=je.current)==null?void 0:S.key)===s.key){ye(null);return}me.current={col:Math.round(parseFloat(o.style.left)/Te),row:Math.round(parseFloat(o.style.top)/Ae)},ye(s),le("wall_dog_click",s.n!=null?{pack_number:s.n}:{guest:!0});return}const g=!o.classList.contains("is-open");if(ce&&ce!==o&&ce.classList.remove("is-open"),g){o.classList.add("is-open"),ce=o;const _=(P=(T=o.querySelector(".card-open-rank"))==null?void 0:T.textContent)==null?void 0:P.replace("#","").trim();le("wall_dog_click",_?{pack_number:_}:{})}else o.classList.remove("is-open"),ce=null}function _a(){return[...be.current.values()].reduce((o,s)=>Math.max(o,s.pack_number??0),1)+1}function mo(){const o=document.createElement("div");o.className="center-hero",o.style.left=we/2+"px",o.style.top=Ke/2+En+"px",o.style.transform=`translate(-50%, -50%) scale(${Aa})`,o.innerHTML=`
        <h2 class="hero-h1">
          <span class="hero-hl">${Ea(ee.current("wall.hero.l1"))}</span>
          <span class="hero-hl">${Ea(ee.current("wall.hero.l2"))}</span>
        </h2>
        <p class="hero-lead">${ee.current("wall.hero.missingFace")}</p>
        <!-- Chip „Help us reach 1M dogs" zrušený (Matej 5. 10. 2026: *„zruš ho"*). -->
        ${r.current?"":`<a href="/heroglyph/name" class="join-btn" data-join>${ee.current("wall.hero.cta")}</a>`}
      `,o.style.setProperty("--hero-fs",(Te/Aa*.94/(7.25*nt(f.current))).toFixed(2)+"px");const s=o.querySelector("[data-join]");return s==null||s.addEventListener("click",g=>{g.preventDefault(),le("cta_become_dogyptian_click",{location:"wall"}),W("/heroglyph/name")}),o}function bo(){var s;const o=document.createElement("article");return o.className="dog-card hektor-card",o.style.left="0px",o.style.top=-1*Ae+"px",o.innerHTML=`
        <div class="card-img" style="background-image:url('/images/hektor-grid.webp');background-position:50% 35%"></div>
        <div class="card-rank-top">#1</div>
        <img class="card-flag" src="${Ga("sk")}" alt="Slovakia" title="Slovakia" loading="lazy" draggable="false">
        <div class="hektor-heroglyph-wrap">
          <img class="hektor-heroglyph" src="/images/hekthor-heroglyph.webp" alt="Hekthor heroglyph" draggable="false">
        </div>
        <div class="card-name-block">
          <div class="card-label hektor-label">HEKTHOR</div>
        </div>
      `,Ie.current.set(o,va(ga,ee.current)),((s=je.current)==null?void 0:s.key)==="hektor"&&o.classList.add("is-picked"),o}function go(){const o=document.createElement("article");o.className="dog-card reveal-card",o.style.left=Xa*Te+"px",o.style.top=Qa*Ae+"px";const s=Oe(u.dogName||"DOGYPTIAN"),g=parseInt(u.packNumber,10);let S="",T="";for(const M of be.current.values())if(M.pack_number===g){S=Ut(M.country),T=M.owner_message?Oe(M.owner_message):"";break}const P=Vt[S]||S,_=Oe(ia),C=ra(u.photoUrl),L=Oe(u.packNumber),Y=C?'<div class="reveal-card-inner"></div>':`<div class="reveal-card-inner reveal-card-fallback"><span class="cartouche">${s}</span></div>`;if(o.innerHTML=`
        ${Y}
        <div class="card-open-overlay">
          <div class="card-open-rank">#${L}</div>
          <div class="card-open-name">${s}</div>
          <img class="card-open-heroglyph" src="${_}" alt="${s} heroglyph" draggable="false">
          ${T?`<div class="card-open-msg">${T}</div>`:""}
        </div>
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${_}" alt="${s} heroglyph" draggable="false">
        </div>
        <div class="card-rank-top">#${L}</div>
        ${S?`<img class="card-flag" src="${Ga(S)}" alt="${P}" title="${P}" loading="lazy" draggable="false">`:""}
        <div class="card-name-block">
          <div class="card-label">${s}</div>
        </div>
      `,C){const M=o.querySelector(".reveal-card-inner");M&&(M.style.backgroundImage=`url("${C}")`);const ne=new Image;ne.src=C,ne.onerror=()=>{const J=o.querySelector(".reveal-card-inner");J&&(J.style.backgroundImage="",J.classList.add("reveal-card-fallback"),J.innerHTML=`<span class="cartouche">${s}</span>`)}}return o}function Fa(o,s,g,S=!1){var yt,wt;const T=Ut(o.country),P=Vt[T]||T,_=Oe((o.dog_name||"DOGYPTIAN").toUpperCase()),C=o.pack_number??"?",L=o.wall_tier,Y=!L||L==="member",M=!!o.wall_pending,ne=L==="guest"&&!o.owner_message?ee.current(`wall.guestLine.${1+Math.floor(Math.random()*io)}`):"";M||o.owner_message,L&&M&&ee.current("wall.status.pending");const J=document.createElement("article");J.className=(S?"dog-card dog-card--fill":"dog-card")+(Y?"":" dog-card--nomember")+(M?" dog-card--pending":""),J.style.left=s*Te+"px",J.style.top=g*Ae+"px";const ge=(yt=o.heroglyph_png_url)!=null&&yt.includes("res.cloudinary.com")&&o.heroglyph_png_url.includes("/upload/")?o.heroglyph_png_url.replace("/upload/","/upload/c_fit,w_480,q_auto,f_auto/"):o.heroglyph_png_url,Xe=ge?Oe(ge):"",wo=Oe(Sn(o.cloudinary_main_url));o.pack_number!=null&&o.dog_name&&Oe(qt(o.dog_name,o.pack_number)),J.innerHTML=`
        <div class="card-img" style="background-image:url('${wo}');background-position:50% 30%"></div>
        ${o.pack_number!=null?`<div class="card-rank-top">#${C}</div>`:""}
        ${T?`<img class="card-flag" src="${Ga(T)}" alt="${P}" title="${P}" loading="lazy" draggable="false">`:""}
        ${Xe?`
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${Xe}" alt="${_} heroglyph" draggable="false">
        </div>`:""}
        <div class="card-name-block">
          <div class="card-label">${_}</div>
        </div>
      `;const xt=va(o,ee.current);return Ie.current.set(J,xt),!S&&((wt=je.current)==null?void 0:wt.key)===xt.key&&J.classList.add("is-picked"),J}function vo(){var Y;const o=document.createElement("article");o.className="dog-card enroll-card enroll-card--portal",o.style.left="0px",o.style.top=1*Ae+"px";const s=[...be.current.values()].map(M=>at(M.cloudinary_main_url)).filter(Boolean),g=document.createElement("input");g.type="file",g.accept="image/*",g.className="ph-add-file";let S=null,T;const P=()=>{g.value="",g.click()},_=()=>Gt(g,()=>Zt(_a())),C=M=>{le("wall_photo_confirm_shown"),Yt({photoUrl:M,packNumber:_a(),onContinue:ne=>{le("cta_become_dogyptian_click",{location:"wall_enroll_b"}),Jt(ne,T),ne&&le("wall_photo_cropped"),W("/heroglyph/name")},onPickAnother:()=>{le("wall_photo_confirm_another"),P()},onClose:()=>le("wall_photo_confirm_dismissed"),copy:{eyebrow:ee.current("wall.photo.yoursWillBe"),lead:ee.current("wall.photo.lead"),cta:ee.current("wall.photo.cta"),another:ee.current("wall.photo.another"),zoom:ee.current("wall.photo.zoom"),later:ee.current("wall.photo.laterNote")}})},L=to({faces:s,onPick:()=>I.current?W(I.current.href):S?C(S):_(),label:((Y=I.current)==null?void 0:Y.enter)??ee.current("wall.hero.addPhoto"),noPlus:!!I.current,labelPicked:ee.current("wall.photo.change"),note:"",subnote:`<span class="ph-nopill">${Oe(ee.current("wall.photo.yoursWillBe"))} <b>#${_a()}</b></span>`});return L.el.style.setProperty("--ph-w",we+"px"),L.el.style.setProperty("--ph-rimw","6px"),L.el.style.setProperty("--ph-icok","0.185"),L.el.style.setProperty("--ph-lblk",(.072/Qt(f.current)).toFixed(4)),L.el.style.setProperty("--ph-notek","0.047"),L.el.style.setProperty("--ph-note-ws","nowrap"),L.el.style.setProperty("--ph-subk","0.0504"),g.addEventListener("change",()=>{var ge;const M=(ge=g.files)==null?void 0:ge[0];if(!M)return;const ne=Wt(M),J=ne.previewUrl;T=ne.uploaded,S=J,L.setPhoto(J),C(J)}),o.append(L.el,g),Pe.current={canvas:L.canvas,sparks:ao(L.canvas,{density:.42})},o}function ko(o,s){if(o===0&&s===0)return mo();if(r.current&&o===0&&s===1)return vo();if(o===0&&s===-1)return bo();if(u.active&&o===Xa&&s===Qa)return go();const g=be.current.get(`${o},${s}`);if(g)return Fa(g,o,s);const S=Ye.current;if(S.length===0)return null;const T=be.current,P=new Set;for(const[C,L]of Pn){const Y=Cn(o+C,s+L,T,S,r.current);Y!=null&&P.add(Y)}const _=lo(o,s,S.length);for(let C=0;C<S.length;C++){const L=S[(_+C)%S.length];if(!P.has(L.pack_number??-1))return Fa(L,o,s,!0)}return Fa(S[_],o,s,!0)}function fo(){p.style.transform=`translate(${A}px,${w}px)`}function xo(){const o=Math.floor(-A/Te)-1,s=o+Math.ceil(m/Te)+2,g=Math.floor(-w/Ae)-1,S=g+Math.ceil(N/Ae)+2;for(const[T,P]of Ue){const[_,C]=T.split(",").map(Number);(_<o||_>s||C<g||C>S)&&(P.remove(),Ue.delete(T))}for(let T=g;T<=S;T++)for(let P=o;P<=s;P++){const _=`${P},${T}`;if(Ue.has(_))continue;const C=ko(P,T);C&&(p.appendChild(C),Ue.set(_,C))}}function He(){fo(),xo()}let ba=null;function $a(){ba===null&&(ba=requestAnimationFrame(()=>{ba=null,He()}))}function Ba(){Q*=.95,Ee*=.95,!(Math.abs(Q)<.3&&Math.abs(Ee)<.3)&&(A+=Q,w+=Ee,He(),R=requestAnimationFrame(Ba))}const lt=o=>{R&&cancelAnimationFrame(R);const s=o.target;ce&&!ce.contains(s)&&(ce.classList.remove("is-open"),ce=null),!(s.closest(".center-hero")||s.closest(".enroll-card")||s.closest(".center-btn")||s.closest(".main-nav")||s.closest(".nav-login")||s.closest(".lang-panel")||s.closest(".center-btn-mobile")||s.closest(".filter-btn")||s.closest(".gods-bottom-bar")||s.closest(".lang-btn-mobile")||s.closest(".lang-modal-root")||s.closest(".numpad-overlay")||s.closest(".card-open-dogpage-link"))&&(X=!0,ma=o.clientX,fe=o.clientY,oe=o.clientX-A,ve=o.clientY-w,ue=o.clientX,v=o.clientY,F=performance.now(),Q=Ee=0,t.classList.add("is-dragging"),document.body.style.cursor="pointer")},pt=o=>{if(!X)return;const s=performance.now(),g=s-F||1;Q=(o.clientX-ue)/g*16,Ee=(o.clientY-v)/g*16,ue=o.clientX,v=o.clientY,F=s,A=o.clientX-oe,w=o.clientY-ve,$a()},ct=o=>{if(!X)return;if(X=!1,t.classList.remove("is-dragging"),document.body.style.cursor="default",Math.hypot(o.clientX-ma,o.clientY-fe)<6){const g=o.target;if(!g.closest(".card-info")){const S=g.closest(".dog-card:not(.center-hero):not(.enroll-card)");if(S){st(S);return}}je.current&&ye(null);return}R=requestAnimationFrame(Ba)},dt=o=>{R&&cancelAnimationFrame(R);const s=o.touches[0];X=!0,qe=s.clientX,ja=s.clientY,oe=s.clientX-A,ve=s.clientY-w,ue=s.clientX,v=s.clientY,F=performance.now(),Q=Ee=0,t.classList.add("is-dragging")},ht=o=>{if(!X)return;const s=o.touches[0],g=performance.now(),S=g-F||1;Q=(s.clientX-ue)/S*16,Ee=(s.clientY-v)/S*16,ue=s.clientX,v=s.clientY,F=g,A=s.clientX-oe,w=s.clientY-ve,$a()},ut=o=>{var s;if(X){if(X=!1,t.classList.remove("is-dragging"),o.changedTouches.length>0){const g=o.changedTouches[0];if(Math.hypot(g.clientX-qe,g.clientY-ja)<12){const T=document.elementFromPoint(g.clientX,g.clientY);if(T!=null&&T.closest(".enroll-card, .center-hero, .center-btn, .main-nav, .nav-login, .lang-panel, .center-btn-mobile, .filter-btn, .gods-bottom-bar, .lang-btn-mobile, .lang-modal-root, .numpad-overlay, .card-open-dogpage-link"))return;if(o.preventDefault(),ce){const C=document.elementFromPoint(g.clientX,g.clientY);if(C&&ce.contains(C)){ce.classList.remove("is-open"),ce=null;return}ce.classList.remove("is-open"),ce=null}const P=document.elementFromPoint(g.clientX,g.clientY),_=(s=P==null?void 0:P.closest)==null?void 0:s.call(P,".dog-card:not(.center-hero):not(.enroll-card)");if(_){st(_);return}je.current&&ye(null);return}}R=requestAnimationFrame(Ba)}},mt=o=>{o.preventDefault();let s=o.deltaX,g=o.deltaY;o.deltaMode===1&&(s*=24,g*=24),o.deltaMode===2&&(s*=N,g*=N),A-=s,w-=g,$a()},bt=()=>{m=window.innerWidth,N=window.innerHeight,He()},gt=()=>{var s;const o=p==null?void 0:p.querySelector(".center-hero");o&&(o.classList.remove("hero-anchor-pulse"),o.offsetWidth,o.classList.add("hero-anchor-pulse")),(s=navigator.vibrate)==null||s.call(navigator,15)},vt=()=>{R&&cancelAnimationFrame(R);const o=m/2-we/2,s=N/2-Ke/2-Bt(r.current);if(Math.hypot(o-A,s-w)<4){let L=function(J){const ge=Math.min((J-Y)/M,1);w=s+ne*Math.sin(ge*Math.PI*2.5)*(1-ge)*(1-ge),He(),ge<1?R=requestAnimationFrame(L):(w=s,He())};gt();const Y=performance.now(),M=480,ne=13;R=requestAnimationFrame(L);return}const g=A,S=w,T=performance.now(),P=600,_=L=>1-Math.pow(1-L,3);function C(L){const Y=Math.min((L-T)/P,1),M=_(Y);A=g+(o-g)*M,w=S+(s-S)*M,He(),Y<1?R=requestAnimationFrame(C):gt()}R=requestAnimationFrame(C)};t.addEventListener("mousedown",lt),window.addEventListener("mousemove",pt),window.addEventListener("mouseup",ct),t.addEventListener("touchstart",dt,{passive:!0}),window.addEventListener("touchmove",ht,{passive:!0}),window.addEventListener("touchend",ut),t.addEventListener("wheel",mt,{passive:!1}),window.addEventListener("resize",bt);function Va(o){if(o<1)return null;if(o===1)return{col:0,row:-1};const s=qa(o+5,r.current?1:0),g=o-2;return g>=0&&g<s.length?s[g]:null}function kt(o){const s=Va(o);if(!s)return;R&&cancelAnimationFrame(R);const{col:g,row:S}=s,T=m/2-g*Te-we/2,P=N/2-S*Ae-Ke/2,_=A,C=w,L=performance.now(),Y=800,M=J=>1-Math.pow(1-J,3);function ne(J){const ge=Math.min((J-L)/Y,1),Xe=M(ge);A=_+(T-_)*Xe,w=C+(P-C)*Xe,He(),ge<1&&(R=requestAnimationFrame(ne))}R=requestAnimationFrame(ne)}Ve.current=kt;function Ua(o,s,g=m/2,S=N/2){R&&cancelAnimationFrame(R);const T=g-o*Te-we/2,P=S-s*Ae-Ke/2,_=A,C=w,L=performance.now(),Y=800,M=J=>1-Math.pow(1-J,3);function ne(J){const ge=Math.min((J-L)/Y,1),Xe=M(ge);A=_+(T-_)*Xe,w=C+(P-C)*Xe,He(),ge<1&&(R=requestAnimationFrame(ne))}R=requestAnimationFrame(ne)}Re.current=Ua;function yo(o,s,g){const{sheet:S}=g,T=0,P=S?m:g.left,_=96,C=S?g.top:N,L=A+o*Te+we/2,Y=w+s*Ae+Ke/2,M=we/2;L-M>=T&&L+M<=P&&Y-M>=_&&Y+M<=C||Ua(o,s,(T+P)/2,(_+C)/2)}la.current=yo,ta.current=o=>{const s=je.current;if(!s)return;const g=[...be.current.values()],S=g.filter(M=>M.pack_number!=null).sort((M,ne)=>(M.pack_number??0)-(ne.pack_number??0)),T=g.filter(M=>M.pack_number==null),P=[ga,...S,...T],_=M=>va(M,ee.current).key,C=P.findIndex(M=>_(M)===s.key),L=P[((C<0?0:C)+o+P.length)%P.length],Y=va(L,ee.current);me.current=Y.n!=null?Va(Y.n):Y.wallId?na.current.get(Y.wallId)??null:null,ye(Y)};const da=document.getElementById("gods-center-btn-mobile");da==null||da.addEventListener("click",vt),He();let Ha=null;const ft=(o,s)=>{!o||!s||oa.current||(Ha=window.setTimeout(()=>{oa.current=!0,me.current=s,ye(va(o,ee.current))},850))};if(z!==null&&!u.active){kt(z);const o=z===1?ga:[...be.current.values()].find(s=>s.pack_number===z);ft(o,Va(z))}if(D&&z===null&&!u.active){const o=na.current.get(D);o&&(Ua(o.col,o.row),ft([...be.current.values()].find(s=>s.wall_id===D),o))}return()=>{t.removeEventListener("mousedown",lt),window.removeEventListener("mousemove",pt),window.removeEventListener("mouseup",ct),t.removeEventListener("touchstart",dt),window.removeEventListener("touchmove",ht),window.removeEventListener("touchend",ut),t.removeEventListener("wheel",mt),window.removeEventListener("resize",bt),da==null||da.removeEventListener("click",vt),Ha!==null&&window.clearTimeout(Ha),R&&cancelAnimationFrame(R),ba!==null&&cancelAnimationFrame(ba),Ue.forEach(o=>o.remove()),Ue.clear()}},[W,$e,Se,z,D,u.active,Me]),i.useEffect(()=>{const t=ae.current;t&&(t.querySelectorAll(".dog-card.is-picked").forEach(p=>p.classList.remove("is-picked")),pe&&t.querySelectorAll(".dog-card:not(.dog-card--fill)").forEach(p=>{var m;((m=Ie.current.get(p))==null?void 0:m.key)===pe.key&&p.classList.add("is-picked")}))},[pe]),i.useEffect(()=>{const t=xa.current;if(!pe||!t)return;const p=()=>{var X;const A=me.current;if(!A)return;const w=window.matchMedia("(max-width: 767px)").matches;(X=la.current)==null||X.call(la,A.col,A.row,{sheet:w,left:w?0:window.innerWidth-24-t.offsetWidth,top:w?window.innerHeight-t.offsetHeight:0})},m=requestAnimationFrame(p),N=new ResizeObserver(p);return N.observe(t),()=>{cancelAnimationFrame(m),N.disconnect()}},[pe]),i.useEffect(()=>{if(!pe)return;const t=p=>{p.key==="Escape"&&ye(null)};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[pe]),i.useEffect(()=>{$&&ye(null)},[$]),i.useEffect(()=>{var X,oe;if(!$e)return;const t=ae.current;if(!t)return;const p=t.querySelectorAll(".hero-h1 .hero-hl");p.length===2&&(p[0].innerHTML=Ea(n("wall.hero.l1")),p[1].innerHTML=Ea(n("wall.hero.l2")));const m=(oe=(X=p[0])==null?void 0:X.closest(".hero-h1"))==null?void 0:oe.parentElement;m==null||m.style.setProperty("--hero-fs",(Te/Aa*.94/(7.25*nt(c))).toFixed(2)+"px");const N=t.querySelector(".hero-lead");N&&(N.textContent=n("wall.hero.missingFace"));const A=t.querySelector(".join-btn");A&&(A.textContent=n("wall.hero.cta"));const w=t.querySelector(".hektor-card .card-open-msg");w&&(w.textContent=n("wall.hektor.msg"))},[n,c,$e]),e.jsxs(e.Fragment,{children:[!a&&e.jsx(To,{path:"/",title:"DOGYPT — The Place Where DOG is GOD",description:"Transform your dog's essence into a timeless HEROGLYPH. 12 Symbols, 1 Eternal Legacy."}),e.jsx("style",{children:`
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
          width: ${we}px;
          height: ${Ke}px;
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
           homepage). PSIE VIDENIE zrušené 24. 11. 2026 — hosť je v plnej farbe.
           Čaká na AINUBISA = stmavnutý a rozmazaný (25. 9.). */
        .card-open-status {
          margin-top: 6px; font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(201,154,63,0.85); text-align: center;
        }
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
          background: ${B.grad};
          border: 1.5px solid ${B.edge};
          box-shadow:
            0 0 0 3.5px rgba(22,48,122,0.14),
            0 10px 26px -10px rgba(5,15,48,0.55),
            inset 0 1px 0 rgba(201,154,63,0.30);
          color: ${B.ink};
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

        ${oo}

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
          animation: enrollFace ${jn*3}s ease-in-out infinite;
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
          background: ${ka.pageBg};
          background-image: ${ka.pageBackdrop};
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
        .numpad-input:focus { border-color: ${B.edge}; box-shadow: 0 0 0 2px rgba(22,48,122,0.18); }
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
          background: ${No};
          background-blend-mode: ${Eo};
          border: ${Le.line}px solid ${Fe.edge};
          border-radius: ${Le.frame}px;
          box-shadow: ${Ao};
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
        /* DOSKA */
        .theme-light .gods-bottom-bar::before {
          content: '';
          position: absolute;
          inset: ${Le.rim}px;
          border-radius: ${Le.plate}px;
          background: ${So};
          background-blend-mode: ${Mo};
          border: ${Le.line}px solid ${Fe.edge};
          box-shadow: ${Po};
          pointer-events: none;
          z-index: -1;
        }
        /* SVETLÉ ZRNO nad doskou */
        .theme-light .gods-bottom-bar::after {
          content: '';
          position: absolute;
          inset: ${Le.rim}px;
          border-radius: ${Le.plate}px;
          ${tt}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .theme-light .gods-bottom-bar > * { position: relative; z-index: 1; }

        /* Spodný bar — jeden odliatok, tlačidlá v ňom sú pilulky na doske
           (v predlohe kruh „G"), preto strácajú vlastný rám. */
        .theme-light .gods-bottom-bar { padding: ${Le.rim+4}px ${Le.rim+6}px; gap: 10px; }
        .theme-light .gods-bottom-bar .filter-btn,
        .theme-light .gods-bottom-bar .center-btn-mobile,
        .theme-light .gods-bottom-bar .lang-btn-mobile {
          background: ${Fe.activeFill};
          border: ${Le.line}px solid ${Fe.edge};
          box-shadow: ${Nt};
          color: ${Fe.ink};
        }
        .theme-light .gods-bottom-bar .filter-btn.active { border-color: ${Fe.edge}; }

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
          background: ${Fe.activeFill};
          border: 0 solid ${Fe.edge};
          box-shadow: ${Nt};
          color: ${Fe.ink};
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
          border-width: ${Le.line}px;
          pointer-events: auto;
        }
        .gods-bottom-bar.has-cta .gbb-cta:hover { opacity: 0.82; }
        @media (max-width: 768px) {
          .gods-bottom-bar .gbb-cta { font-size: 0.68rem; letter-spacing: 0.1em; }
          .gods-bottom-bar.has-cta .gbb-cta { padding: 0 18px; }
        }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger { color: ${Fe.ink}; }
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

      `}),e.jsxs("div",{className:`gods-root theme-${Da}`,children:[zn()&&e.jsxs("div",{className:"ab-switch",role:"group","aria-label":"Variant steny",children:[e.jsx("button",{type:"button",className:Me?"":"is-on",onClick:()=>{ua(!1);try{localStorage.setItem(et,"0")}catch{}},children:"A · CTA"}),e.jsx("button",{type:"button",className:Me?"is-on":"",onClick:()=>{ua(!0);try{localStorage.setItem(et,"1")}catch{}},children:"B · ZÁPIS PSA"})]}),x&&j&&!Z?null:x?za.createPortal(e.jsx("div",{className:"theme-light gods-dock-portal",children:e.jsxs("div",{className:`gods-bottom-bar${l?" has-cta":""}`,children:[e.jsx("button",{className:`filter-btn${ke?" active":""}`,onClick:()=>De(t=>!t),"aria-label":n("wall.filter.find"),children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 473.514 473.514",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"}),e.jsx("path",{d:"M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"})]})}),e.jsx("button",{className:"center-btn-mobile",id:"gods-center-btn-mobile","aria-label":n("wall.filter.center"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 503.168 503.168",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"})})}),e.jsx("button",{className:`filter-btn${$?" active":""}`,onClick:()=>Be(t=>!t),"aria-label":$?n("nav.wall"):"DOGYPT",children:$?e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 439.164 439.165",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M182.466,29.83c0.213-4.174-0.726-7.751-2.79-10.633c-3.199-6.282-8.623-9.76-15.485-10.138 C117.546,6.519,70.951,6.306,23.348,6.295c-5.264,0-9.704,1.856-12.845,5.368l-0.655,0.531 c-7.503,4.253-11.05,11.745-9.473,20.027c6.832,35.975,10.123,73.902,10.361,119.363c0.01,1.65,0.256,3.298,0.774,5.185 l0.089,0.525c0.546,8.465,6.147,17.311,17.42,17.976c49.478,2.917,94.039,5.756,138.377,11.07 c3.479,0.417,6.485-0.066,9.153-1.419l0.541-0.203c3.727-0.93,12.256-4.372,10.907-16.234 C182.182,117.115,180.366,71.769,182.466,29.83z M146.603,147.852c-34.827-3.608-68.829-5.88-97.497-7.622l-2.392-0.147 l-0.051-2.392c-0.688-32.479-3.156-62.606-7.556-92.1l-0.442-2.991l3.021,0.005c41.053,0.083,72.366,0.64,101.537,1.82l2.56,0.104 l-0.063,2.559c-0.744,31.052,0.48,63.089,3.74,97.939l0.294,3.15L146.603,147.852z"}),e.jsx("path",{d:"M182.466,276.21c0.213-4.174-0.726-7.754-2.79-10.634c-3.199-6.286-8.623-9.77-15.485-10.135 c-46.68-2.539-93.26-2.753-140.848-2.763c-5.263,0-9.704,1.854-12.845,5.362l-0.655,0.528c-7.503,4.26-11.05,11.75-9.476,20.042 c6.835,35.968,10.125,73.896,10.364,119.358c0.01,1.646,0.254,3.29,0.774,5.18l0.089,0.522c0.546,8.476,6.146,17.316,17.42,17.977 c49.477,2.92,94.039,5.764,138.377,11.075c3.484,0.416,6.49-0.071,9.153-1.422l0.541-0.198c3.727-0.93,12.255-4.372,10.907-16.234 C182.182,363.491,180.366,318.144,182.466,276.21z M146.603,394.233c-34.776-3.605-68.799-5.881-97.497-7.627l-2.392-0.152 l-0.051-2.387c-0.688-32.479-3.156-62.602-7.556-92.095l-0.442-2.99l3.021,0.005c41.058,0.081,72.376,0.64,101.537,1.817 l2.56,0.112l-0.063,2.549c-0.744,31.062,0.48,63.099,3.74,97.944l0.294,3.153L146.603,394.233z"}),e.jsx("path",{d:"M433.483,29.83c0.208-4.174-0.731-7.751-2.793-10.633c-3.199-6.282-8.623-9.76-15.488-10.138 c-46.641-2.539-93.236-2.752-140.843-2.763c-5.261,0-9.704,1.856-12.842,5.368l-0.655,0.531 c-7.506,4.253-11.045,11.745-9.471,20.027c6.83,35.975,10.126,73.902,10.364,119.363c0.011,1.65,0.254,3.298,0.771,5.185 l0.092,0.525c0.543,8.465,6.145,17.311,17.417,17.976c49.48,2.917,94.039,5.756,138.381,11.07 c3.483,0.411,6.484-0.066,9.155-1.419l0.543-0.203c3.728-0.93,12.248-4.372,10.907-16.234 C433.193,117.1,431.381,71.75,433.483,29.83z M397.612,147.852c-34.83-3.608-68.832-5.88-97.497-7.622l-2.392-0.147l-0.051-2.392 c-0.686-32.479-3.159-62.606-7.557-92.1l-0.441-2.991l3.021,0.005c41.05,0.083,72.366,0.64,101.534,1.82l2.559,0.104l-0.061,2.559 c-0.746,31.052,0.478,63.089,3.737,97.939l0.295,3.15L397.612,147.852z"}),e.jsx("path",{d:"M433.483,276.21c0.208-4.174-0.731-7.754-2.793-10.634c-3.199-6.286-8.623-9.77-15.488-10.135 c-46.677-2.539-93.257-2.753-140.848-2.763c-5.261,0-9.704,1.854-12.842,5.362l-0.655,0.528 c-7.506,4.26-11.045,11.75-9.471,20.037c6.83,35.973,10.126,73.905,10.364,119.363c0.01,1.646,0.254,3.29,0.771,5.18l0.092,0.522 c0.543,8.476,6.145,17.316,17.417,17.977c49.48,2.92,94.039,5.764,138.38,11.075c3.489,0.416,6.49-0.071,9.156-1.422l0.543-0.198 c3.728-0.93,12.248-4.372,10.907-16.234C433.193,363.481,431.381,318.124,433.483,276.21z M397.612,394.233 c-34.779-3.605-68.802-5.881-97.497-7.627l-2.392-0.152l-0.051-2.387c-0.686-32.479-3.159-62.602-7.557-92.095l-0.441-2.99 l3.021,0.005c41.061,0.081,72.376,0.64,101.534,1.817l2.559,0.112l-0.061,2.549c-0.746,31.062,0.478,63.099,3.737,97.944 l0.295,3.153L397.612,394.233z"})]}):e.jsxs("svg",{width:"21",height:"21",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[e.jsx("circle",{cx:"12",cy:"12",r:"9.5"}),e.jsx("line",{x1:"12",y1:"2.5",x2:"12",y2:"21.5"}),e.jsx("line",{x1:"2.5",y1:"12",x2:"21.5",y2:"12"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"9.5"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9.5",ry:"4"})]})}),e.jsx("div",{className:"lang-btn-mobile",children:e.jsx(St,{variant:"flow"})}),d?e.jsx("a",{className:"gbb-cta",href:b,children:d}):null]})}),Z??document.body):k?e.jsxs("div",{className:`gods-bottom-bar gbb-pills ${$?"gbb-col":"gbb-row"}`,children:[e.jsxs("button",{type:"button",className:"gbb-pill gbb-ic",id:"gods-center-btn-mobile",hidden:$,"aria-label":k.center,children:[e.jsx("img",{src:"/web-app/ikony/sien/terc.svg",alt:""}),e.jsx("span",{children:k.center})]}),e.jsxs("button",{type:"button",className:`gbb-pill gbb-main${ke?" on":""}`,onClick:()=>De(t=>!t),children:[e.jsx("img",{src:"/web-app/ikony/sien/lupa.svg",alt:""}),e.jsx("span",{children:k.find})]}),$?e.jsxs("button",{type:"button",className:"gbb-pill gbb-main",onPointerEnter:()=>aa(!0),onClick:ha,children:[e.jsx("img",{src:"/web-app/ikony/sien/sien.svg",alt:""}),e.jsx("span",{children:k.hall})]}):e.jsxs("button",{type:"button",className:"gbb-pill gbb-ic","aria-label":k.back,onClick:()=>window.location.assign("/"+window.location.search+"#join"),children:[e.jsx("img",{src:"/web-app/ikony/sien/spat.svg",alt:""}),e.jsx("span",{children:k.back})]})]}):e.jsxs("div",{className:`gods-bottom-bar${l?" has-cta":""}`,children:[e.jsx("button",{className:`filter-btn${ke?" active":""}`,onClick:()=>De(t=>!t),"aria-label":n("wall.filter.find"),children:e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 473.514 473.514",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"}),e.jsx("path",{d:"M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"})]})}),e.jsx("button",{className:"center-btn-mobile",id:"gods-center-btn-mobile","aria-label":n("wall.filter.center"),children:e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 503.168 503.168",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"})})}),e.jsx("button",{className:`filter-btn${$?" active":""}`,onClick:()=>Be(t=>!t),"aria-label":$?n("nav.wall"):"DOGYPT",children:$?e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 439.164 439.165",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M182.466,29.83c0.213-4.174-0.726-7.751-2.79-10.633c-3.199-6.282-8.623-9.76-15.485-10.138 C117.546,6.519,70.951,6.306,23.348,6.295c-5.264,0-9.704,1.856-12.845,5.368l-0.655,0.531 c-7.503,4.253-11.05,11.745-9.473,20.027c6.832,35.975,10.123,73.902,10.361,119.363c0.01,1.65,0.256,3.298,0.774,5.185 l0.089,0.525c0.546,8.465,6.147,17.311,17.42,17.976c49.478,2.917,94.039,5.756,138.377,11.07 c3.479,0.417,6.485-0.066,9.153-1.419l0.541-0.203c3.727-0.93,12.256-4.372,10.907-16.234 C182.182,117.115,180.366,71.769,182.466,29.83z M146.603,147.852c-34.827-3.608-68.829-5.88-97.497-7.622l-2.392-0.147 l-0.051-2.392c-0.688-32.479-3.156-62.606-7.556-92.1l-0.442-2.991l3.021,0.005c41.053,0.083,72.366,0.64,101.537,1.82l2.56,0.104 l-0.063,2.559c-0.744,31.052,0.48,63.089,3.74,97.939l0.294,3.15L146.603,147.852z"}),e.jsx("path",{d:"M182.466,276.21c0.213-4.174-0.726-7.754-2.79-10.634c-3.199-6.286-8.623-9.77-15.485-10.135 c-46.68-2.539-93.26-2.753-140.848-2.763c-5.263,0-9.704,1.854-12.845,5.362l-0.655,0.528c-7.503,4.26-11.05,11.75-9.476,20.042 c6.835,35.968,10.125,73.896,10.364,119.358c0.01,1.646,0.254,3.29,0.774,5.18l0.089,0.522c0.546,8.476,6.146,17.316,17.42,17.977 c49.477,2.92,94.039,5.764,138.377,11.075c3.484,0.416,6.49-0.071,9.153-1.422l0.541-0.198c3.727-0.93,12.255-4.372,10.907-16.234 C182.182,363.491,180.366,318.144,182.466,276.21z M146.603,394.233c-34.776-3.605-68.799-5.881-97.497-7.627l-2.392-0.152 l-0.051-2.387c-0.688-32.479-3.156-62.602-7.556-92.095l-0.442-2.99l3.021,0.005c41.058,0.081,72.376,0.64,101.537,1.817 l2.56,0.112l-0.063,2.549c-0.744,31.062,0.48,63.099,3.74,97.944l0.294,3.153L146.603,394.233z"}),e.jsx("path",{d:"M433.483,29.83c0.208-4.174-0.731-7.751-2.793-10.633c-3.199-6.282-8.623-9.76-15.488-10.138 c-46.641-2.539-93.236-2.752-140.843-2.763c-5.261,0-9.704,1.856-12.842,5.368l-0.655,0.531 c-7.506,4.253-11.045,11.745-9.471,20.027c6.83,35.975,10.126,73.902,10.364,119.363c0.011,1.65,0.254,3.298,0.771,5.185 l0.092,0.525c0.543,8.465,6.145,17.311,17.417,17.976c49.48,2.917,94.039,5.756,138.381,11.07 c3.483,0.411,6.484-0.066,9.155-1.419l0.543-0.203c3.728-0.93,12.248-4.372,10.907-16.234 C433.193,117.1,431.381,71.75,433.483,29.83z M397.612,147.852c-34.83-3.608-68.832-5.88-97.497-7.622l-2.392-0.147l-0.051-2.392 c-0.686-32.479-3.159-62.606-7.557-92.1l-0.441-2.991l3.021,0.005c41.05,0.083,72.366,0.64,101.534,1.82l2.559,0.104l-0.061,2.559 c-0.746,31.052,0.478,63.089,3.737,97.939l0.295,3.15L397.612,147.852z"}),e.jsx("path",{d:"M433.483,276.21c0.208-4.174-0.731-7.754-2.793-10.634c-3.199-6.286-8.623-9.77-15.488-10.135 c-46.677-2.539-93.257-2.753-140.848-2.763c-5.261,0-9.704,1.854-12.842,5.362l-0.655,0.528 c-7.506,4.26-11.045,11.75-9.471,20.037c6.83,35.973,10.126,73.905,10.364,119.363c0.01,1.646,0.254,3.29,0.771,5.18l0.092,0.522 c0.543,8.476,6.145,17.316,17.417,17.977c49.48,2.92,94.039,5.764,138.38,11.075c3.489,0.416,6.49-0.071,9.156-1.422l0.543-0.198 c3.728-0.93,12.248-4.372,10.907-16.234C433.193,363.481,431.381,318.124,433.483,276.21z M397.612,394.233 c-34.779-3.605-68.802-5.881-97.497-7.627l-2.392-0.152l-0.051-2.387c-0.686-32.479-3.159-62.602-7.557-92.095l-0.441-2.99 l3.021,0.005c41.061,0.081,72.376,0.64,101.534,1.817l2.559,0.112l-0.061,2.549c-0.746,31.062,0.478,63.099,3.737,97.944 l0.295,3.153L397.612,394.233z"})]}):e.jsxs("svg",{width:"21",height:"21",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[e.jsx("circle",{cx:"12",cy:"12",r:"9.5"}),e.jsx("line",{x1:"12",y1:"2.5",x2:"12",y2:"21.5"}),e.jsx("line",{x1:"2.5",y1:"12",x2:"21.5",y2:"12"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"4",ry:"9.5"}),e.jsx("ellipse",{cx:"12",cy:"12",rx:"9.5",ry:"4"})]})}),e.jsx("div",{className:"lang-btn-mobile",children:e.jsx(St,{variant:"flow"})}),d?e.jsx("a",{className:"gbb-cta",href:b,children:d}):null]}),e.jsx(xn,{dogs:fa,open:$,paused:y,anywhere:O,onClose:()=>Be(!1),pick:Oa,enter:k?{label:k.enter,href:k.href}:void 0}),pe&&za.createPortal(e.jsxs("div",{className:"dc-wall",children:[e.jsx("style",{children:ro+Ln}),e.jsx("div",{className:"dc-veil","aria-hidden":"true"}),e.jsxs("div",{ref:xa,className:"pp-panel pp-svetla dc-panel",role:"dialog","aria-label":pe.name,onTouchStart:t=>{const p=t.touches[0];Ze.current={x:p.clientX,y:p.clientY}},onTouchEnd:t=>{var w;const p=Ze.current;Ze.current=null;const m=t.changedTouches[0];if(!p||!m)return;const N=m.clientX-p.x,A=m.clientY-p.y;Math.abs(N)>60&&Math.abs(N)>Math.abs(A)*1.4?(w=ta.current)==null||w.call(ta,N<0?1:-1):A>70&&Math.abs(A)>Math.abs(N)&&ye(null)},children:[e.jsx("span",{className:"dc-grip","aria-hidden":"true"}),e.jsx(no,{dog:pe,where:"wall",edgeBase:At,anonKey:Et})]},pe.key)]}),document.body),za.createPortal(e.jsx("div",{className:`numpad-overlay${ke?" open":""}${$?" numpad-overlay--planet":""}`,onClick:t=>{t.target===t.currentTarget&&(De(!1),se(""))},children:e.jsx("div",{className:`numpad numpad--wide${Za(U)?" numpad--typing":""}`,role:"dialog","aria-label":n("wall.filter.find"),children:e.jsxs("div",{className:"numpad-body",children:[e.jsxs("div",{className:"numpad-search",children:[e.jsx("input",{ref:ya,className:"numpad-display numpad-input",value:U,onChange:t=>se(t.target.value.slice(0,40)),placeholder:n("wall.filter.placeholderName"),"aria-label":n("wall.filter.find"),enterKeyHint:"search",autoComplete:"off",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1}),e.jsxs("div",{className:"numpad-grid",children:[["1","2","3","4","5","6","7","8","9"].map(t=>e.jsx("button",{className:"numpad-key",onClick:()=>se(p=>(p+t).slice(0,6)),children:t},t)),e.jsx("button",{className:"numpad-key numpad-key--cancel",onClick:()=>se(""),"aria-label":n("wall.filter.clear"),children:e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M7 5 H14.5 L20.5 12 L14.5 19 H7 A2 2 0 0 1 5 17 V7 A2 2 0 0 1 7 5 Z"}),e.jsx("path",{d:"M8.4 9.4 L12.6 14.6 M12.6 9.4 L8.4 14.6"})]})}),e.jsx("button",{className:"numpad-key",onClick:()=>se(t=>(t+"0").slice(0,6)),children:"0"}),e.jsx("button",{className:"numpad-key numpad-key--enter",onClick:Je,"aria-label":n("wall.filter.confirm"),children:e.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M8 12.5 L11 15.5 L16.5 9"})]})})]})]}),Za(U)?e.jsxs("div",{className:"numpad-countries numpad-results",children:[e.jsx("div",{className:"numpad-countries-title",children:n("wall.search.found")}),e.jsx(Go,{hits:Tt(ca,U),onGo:We,edgeBase:At,anonKey:Et})]}):e.jsxs("div",{className:"numpad-countries",children:[e.jsx("div",{className:"numpad-countries-title",children:n("wall.filter.countries")}),e.jsx("div",{className:"numpad-countries-list",children:Ia.map(t=>e.jsxs("div",{className:"ncountry-row",children:[e.jsx("span",{className:"ncountry-flag",children:Lo(t.iso2)}),e.jsx("span",{className:"ncountry-code",children:t.iso3}),e.jsx("span",{className:"ncountry-count",children:t.count})]},t.iso2))})]})]})})}),document.body),e.jsx("div",{ref:E,role:"application",className:u.active&&xe<4?`rev-wall${Ce?" rev-zoom":""}`:void 0,style:{position:"fixed",inset:0,overflow:"hidden",transform:Ce?`scale(${H})`:void 0,visibility:k&&$?"hidden":void 0},children:e.jsx("div",{ref:ae,id:"gods-canvas"})}),u.active&&xe>0&&xe<4&&za.createPortal(e.jsxs("div",{className:`rev-overlay step-${xe} ph-${he}`,children:[u.photoUrl&&e.jsx("div",{className:"rev-bgphoto",style:{backgroundImage:`url("${ra(u.photoUrl)}")`}}),e.jsx("div",{className:"rev-glow"}),e.jsx("img",{className:`rev-big-symbol${_e?"":" is-h"}`,src:_e?u.heroglyphVUrl:ia,alt:u.dogName})]}),document.body),re&&e.jsx("div",{className:"wn-root",children:e.jsx("div",{className:"wn-backdrop",onClick:t=>{t.target===t.currentTarget&&q(!1)},children:e.jsxs("div",{className:"wn-card",role:"dialog","aria-label":n("whatNext.title"),children:[e.jsx("button",{className:"wn-close","aria-label":n("whatNext.close"),onClick:()=>q(!1),children:"×"}),e.jsx("div",{className:"wn-stamp",children:n("whatNext.stamp")}),e.jsxs("div",{className:"wn-main",children:[e.jsxs("div",{className:"wn-head-row",children:[e.jsx("h1",{children:n("whatNext.title")}),e.jsxs("span",{className:"wn-counter",children:[e.jsx("span",{className:"wn-cur",children:"1"}),"/5"]})]}),e.jsx("div",{className:"wn-divider"}),e.jsxs("div",{className:"wn-slider",children:[e.jsx("button",{className:"wn-arrow wn-prev","aria-label":n("whatNext.prev"),children:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M15 18l-6-6 6-6"})})}),e.jsx("button",{className:"wn-arrow wn-next","aria-label":n("whatNext.next"),children:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M9 18l6-6-6-6"})})}),e.jsxs("div",{className:"wn-track",children:[e.jsxs("div",{className:"wn-slide wn-in",children:[e.jsx("span",{className:"wn-ic wn-ic-paw"}),e.jsx("h2",{children:n("whatNext.s1.title")}),e.jsx("p",{className:"wn-ital",children:n("whatNext.s1.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:n("whatNext.s1.body")}})]}),e.jsxs("div",{className:"wn-slide",children:[e.jsx("span",{className:"wn-ic wn-ic-sphinx"}),e.jsx("h2",{children:n("whatNext.s2.title")}),e.jsx("p",{className:"wn-ital",children:n("whatNext.s2.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:n("whatNext.s2.body")}})]}),e.jsxs("div",{className:"wn-slide",children:[e.jsx("span",{className:"wn-ic wn-ic-people"}),e.jsx("h2",{children:n("whatNext.s3.title")}),e.jsx("p",{className:"wn-ital",children:n("whatNext.s3.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:n("whatNext.s3.body")}})]}),e.jsxs("div",{className:"wn-slide",children:[e.jsx("span",{className:"wn-ic wn-ic-chat"}),e.jsx("h2",{children:n("whatNext.s4.title")}),e.jsx("p",{className:"wn-ital",children:n("whatNext.s4.hook")}),e.jsx("p",{className:"wn-lead",dangerouslySetInnerHTML:{__html:n("whatNext.s4.body")}})]}),e.jsxs("div",{className:"wn-slide wn-slide-share",children:[e.jsx("h2",{children:n("sharecard.shareTitle",{name:u.dogName})}),K?e.jsxs(e.Fragment,{children:[e.jsx("img",{className:"wn-share-preview",src:K,alt:n("sharecard.shareTitle",{name:u.dogName})}),e.jsxs("div",{className:"wn-share-actions",children:[e.jsxs("button",{type:"button",className:"wn-cta wn-cta-share",onClick:wa,disabled:ie!==null,children:[e.jsx(Ka,{name:"link",size:13,tint:"dark"}),n("sharecard.shareButton")]}),e.jsxs("button",{type:"button",className:"wn-cta wn-cta-outline",onClick:uo,disabled:ie!==null,children:[e.jsx(Ka,{name:"document",size:13,tint:"gold"}),n("sharecard.download")]})]}),e.jsxs("div",{className:"wn-share-links",children:[e.jsx("button",{type:"button",className:"wn-share-link-btn",onClick:po,"aria-label":n("sharecard.facebook"),title:n("sharecard.facebook"),children:e.jsx("svg",{viewBox:"0 0 24 24",width:"15",height:"15",fill:"currentColor","aria-hidden":!0,children:e.jsx("path",{d:"M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.6c0-.93.26-1.56 1.59-1.56h1.7V3.18C15.98 3.12 15.06 3 13.98 3c-2.24 0-3.78 1.37-3.78 3.88v2.72H7.44v3.2h2.76V21h3.3z"})})}),e.jsx("button",{type:"button",className:"wn-share-link-btn",onClick:co,"aria-label":n("sharecard.whatsapp"),title:n("sharecard.whatsapp"),children:e.jsxs("svg",{viewBox:"0 0 24 24",width:"15",height:"15",fill:"currentColor","aria-hidden":!0,children:[e.jsx("path",{d:"M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"}),e.jsx("path",{d:"M12.02 2C6.5 2 2.04 6.46 2.04 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.54 22 12S17.53 2 12.02 2zm0 18.1c-1.63 0-3.15-.45-4.45-1.23l-.32-.19-3.02.79.8-2.94-.21-.3A8.09 8.09 0 0 1 3.93 12c0-4.47 3.63-8.1 8.09-8.1 4.46 0 8.08 3.63 8.08 8.1 0 4.47-3.62 8.1-8.08 8.1z"})]})}),e.jsx("button",{type:"button",className:"wn-share-link-btn",onClick:ho,"aria-label":n("sharecard.copyLink"),title:n("sharecard.copyLink"),children:e.jsx(Ka,{name:"link",size:14,tint:"gold"})})]})]}):e.jsx("p",{className:"wn-lead wn-share-preparing",children:n("sharecard.preparing")})]})]})]})]}),e.jsxs("div",{className:"wn-footer",children:[e.jsx("img",{className:"wn-seal",src:"/images/peciat-dogypt.webp",alt:"DOGYPT seal"}),e.jsx("span",{className:"wn-motto-side",children:n("whatNext.motto")})]})]})})})]})]})}const Ln=`
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
  box-shadow: 0 0 0 3px ${B.edge}, 0 0 0 8px rgba(22,48,122,0.22) !important;
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
`;export{Xn as GodsGridLab};
