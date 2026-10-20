import{u as Oo,f as kn,r as g,j as t,F as a,k as d,K as F,O as i,J as u,W as y,av as mn,a9 as pt,al as Pe,V as xn,aJ as un,aM as gn,aL as io,aN as Ro,aG as hn,aI as vn,c as bn,e as fn,l as $n,a as yn,ao as wn,A as ro}from"./index-B-BQrD2y.js";import{d as zn,a as jn,b as Sn,u as Nn}from"./PackLayout-CGhWU_Yk.js";import{supabase as Ea}from"./client-rJzPTh-q.js";import"./tripShared-DMsMy27X.js";import{c as An,u as En,A as so,P as lo,a as ha,b as In,p as co}from"./AvatarRing-n1N-1GaW.js";import{t as On}from"./packTiers-0E8WcxgQ.js";import{A as e,a as Te,B as pe,W as To,b as At,c as Rn,d as $t,e as Po,f as ba,g as po,h as Tn,i as Pn,j as $a,k as Mn}from"./ainubisSkin-B7Z96MPq.js";import{p as Dn}from"./dogEvents-O4Dj4HRt.js";import{useMagnetPreview as Cn,usePackNavigate as Bn,isFreeScrollCode as La,MagnetAinubisBlock as ko}from"./magnetPreview-CvEjQVpP.js";import{e as ya,c as Mo,d as Do,B as Et}from"./BackButton-XC1Pn_3O.js";import{r as Ln}from"./cloudinaryService-BTfH_t1m.js";import{r as It,f as Co,b as ja,o as mo,g as xo,i as Vn,s as _n,p as Kn,c as Un,d as Fn,a as wa,H as Hn}from"./HandIcons-nK6bMixK.js";import{o as uo}from"./ainubisBus-BMRzmB2O.js";import{a as Zn}from"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./dogRights-BhKk5QOi.js";import"./BrandIcon-Cj2cTb6H.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Ch81E6FO.js";import"./devMockDogs-BzGWz4qV.js";import"./pawmateRights-CWmFDd90.js";import"./packStore-DJ0be3Fh.js";import"./wizAnchors-E3ARHgZI.js";import"./consent-DRIYVBQY.js";import"./tslib.es6-CmEaCU22.js";import"./countryGeo-BaPfaSrG.js";import"./addTripModel-BuQrZHBF.js";import"./packProfile-C55E2wZh.js";import"./data-trails-C7pS6eM2.js";import"./data-journeys-qHcguO2r.js";import"./packCommunity-COkYLiGy.js";import"./tripPoints-BeyowCTc.js";import"./wishData-g3GPwQKD.js";import"./mapNotesData-Cu9T98GB.js";import"./handArrowLeft-DN9pj_cL.js";function Va(o,r){if(r&&r.trim())return r.trim().split(" ")[0];if(!o)return"Dogyptian";const l=(o.split("@")[0]||"").split("+")[0].replace(/[._-]/g," ").replace(/\d+/g,"").trim();return l?l.charAt(0).toUpperCase()+l.slice(1):"Dogyptian"}const Gn=`
.pkid{display:flex;align-items:center;gap:${a.sm}px;min-width:0;}
.pkid-me{display:flex;align-items:center;gap:${a.sm}px;min-width:0;flex:0 1 auto;
  background:none;border:none;padding:0;cursor:pointer;text-align:left;color:${e.ink};}
.pkid-av{position:relative;flex:0 0 auto;width:${so}px;height:${so}px;display:grid;place-items:center;}
.pkid-av svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;}
.pkid-photo{position:relative;z-index:1;width:${lo}px;height:${lo}px;border-radius:${d.pill}px;object-fit:cover;
  display:flex;align-items:center;justify-content:center;background:${e.faceBg};color:${e.ctaA};
  font-family:${F};font-weight:700;font-size:${i.body}px;line-height:1;}
/* Číslo NA OKRAJI avatara; lem = farba podkladu pod ním (tu AINUBISOV displej). */
.pkid-lvl{position:absolute;z-index:3;right:-2px;bottom:-2px;width:20px;height:20px;border-radius:${d.pill}px;
  display:flex;align-items:center;justify-content:center;font-family:${u};font-weight:600;font-size:${i.micro}px;
  background:linear-gradient(135deg,var(--tier-a,#F5C73D),var(--tier-b,#E69E1A));color:var(--tier-ink,#1c160c);
  box-shadow:0 0 0 2px ${e.bg};}
.pkid-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.pkid-name{font-family:${F};font-weight:700;font-size:${i.body}px;letter-spacing:${y.card.letterSpacing};
  text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;color:${e.ink};}
.pkid-stats{display:flex;align-items:baseline;gap:${a.xs}px;white-space:nowrap;line-height:1.05;
  font-family:${u};font-weight:500;font-size:${i.micro}px;letter-spacing:${y.section.letterSpacing};
  text-transform:uppercase;color:${e.inkFaint};}
.pkid-stats b{font-weight:600;color:${e.inkDim};font-variant-numeric:tabular-nums;}
.pkid-mid{flex:1 1 auto;min-width:0;display:flex;justify-content:center;}
.pkid-right{flex:0 0 auto;display:flex;align-items:center;}
/* ── PC HLAVIČKA = PC HLAVIČKA /map (Matej 5. 10. 2026: „ainubis nech má logiku /map horný
   header = tie isté veľkosti, fotka aj stats vedľa seba"). Vzor .trp-status-row +
   .trp-pcstats v PackMap.tsx: pás s rámom, fotka AV_D_HEAD (60), čísla v JEDNOM rade
   oddelené zvislou čiarou, kapsula vnútri pásu. Výška pásu = výška D-BLOKU na mape
   (2 lemy + 2 × 12 + fotka 60 = 96) — mapa má lem 6 px zlata, tu je 1 px skla, preto
   min-height; bočný okraj = 16 + (lem mapy 6 − lem skla 1), aby fotka aj kapsula stáli
   od hrany pásu presne tam, kde na mape. Materiál ostáva AINUBISOV (AI_GLASS), zlato
   patrí mape. Mobil sa nemení: tam ostávajú dva riadky ako na mobilnej mape. */
.pkid-pcstats{display:none;align-items:center;gap:${a.lg}px;min-width:0;}
.pkid-pcstats > span:not(.pkid-pcsep){display:flex;align-items:baseline;gap:${a.xs}px;white-space:nowrap;}
.pkid-pcstats b{font-family:${u};font-weight:600;font-size:${i.h2}px;line-height:1;
  font-variant-numeric:tabular-nums;color:${e.ink};}
.pkid-pcstats i{font-family:${u};font-style:normal;font-weight:500;font-size:${i.micro}px;
  letter-spacing:${y.section.letterSpacing};text-transform:uppercase;color:${e.inkFaint};}
/* MOBIL = .trp-mstats2 na mape: dva riadky, číslo Grotesk 16/600 + popisok 10/.22em. */
.pkid-mstats{display:flex;flex-direction:column;gap:2px;min-width:0;}
.pkid-mstats span{display:flex;align-items:baseline;gap:${a.xs}px;white-space:nowrap;line-height:1.05;}
.pkid-mstats b{font-family:${u};font-weight:600;font-size:${i.lead}px;font-variant-numeric:tabular-nums;color:${e.ink};}
.pkid-mstats i{font-family:${u};font-style:normal;font-weight:500;font-size:${i.micro}px;
  letter-spacing:${y.section.letterSpacing};text-transform:uppercase;color:${e.inkFaint};}
.pkid-pcsep{width:1px;height:${a.xl}px;flex:0 0 1px;background:${e.edge};}
@media (min-width:${mn}px){
  .pkid--head{box-sizing:border-box;min-height:${2*pt.rim+2*a.md+ha}px;
    padding:0 ${a.lg+pt.rim-pt.line}px;gap:${a.lg}px;border-radius:${d.frame}px;${Te}}
  .pkid--head .pkid-me{gap:${a.lg}px;}
  .pkid--head .pkid-av{width:${ha}px;height:${ha}px;}
  .pkid--head .pkid-photo{width:${co(ha)}px;height:${co(ha)}px;}
  .pkid--head .pkid-txt,.pkid--head .pkid-mstats{display:none;}
  .pkid--head .pkid-pcstats{display:flex;}
}
`;function Jn({id:o,middle:r,stats:l,primary:n,onMe:p,pcStats:v,mStats:$}){var le,x,O,R;const z=Oo(),w=kn(),h=((x=(le=o.session)==null?void 0:le.user)==null?void 0:x.email)??"",S=((R=(O=o.session)==null?void 0:O.user)==null?void 0:R.user_metadata)??{},f=S.full_name||S.name,[K,L]=g.useState(""),_=(o.dogs??[]).map(U=>U.id).join(",");g.useEffect(()=>{if(!_||f!=null&&f.trim())return;let U=!0;return Ea.from("dogs").select("owner_name").in("id",_.split(",")).then(({data:H})=>{const fe=(H??[]).map(re=>(re.owner_name??"").trim()).find(Boolean)??"";U&&L(fe)}),()=>{U=!1}},[_,f]);const V=f!=null&&f.trim()?Va(h,f):K?Va("",K):Va(h),ie=An(h,Va(h,f));En(ie.level.level);const Q=ie.level;return t.jsxs("div",{className:v?"pkid pkid--head":"pkid",children:[t.jsx("style",{children:Gn}),t.jsxs("button",{type:"button",className:"pkid-me",onClick:p??(()=>w("/pack/map/triplist?tab=stats")),children:[t.jsx(In,{pct:Q.pct,avatarUrl:o.avatarUrl,avatarInitial:o.avatarInitial,wrapClassName:"pkid-av",wrapStyle:On(Q.level),photoClassName:"pkid-photo",badgeClassName:"pkid-lvl",badgeAriaLabel:z("pack.map.levelAriaLabel",{level:Q.level}),badgeContent:Q.level}),$?t.jsx("span",{className:"pkid-mstats",children:$.map((U,H)=>t.jsxs("span",{children:[t.jsx("b",{children:U.v}),t.jsx("i",{children:U.l})]},H))}):t.jsxs("span",{className:"pkid-txt",children:[t.jsx("span",{className:"pkid-name",children:n??V}),t.jsx("span",{className:"pkid-stats",children:l??t.jsxs(t.Fragment,{children:[t.jsx("b",{children:ie.km}),z("pack.map.statKm")," · ",t.jsx("b",{children:ie.count}),z("pack.map.statTrips"+Dn(ie.count))]})})]}),v&&t.jsx("span",{className:"pkid-pcstats",children:v.map((U,H)=>t.jsxs(g.Fragment,{children:[H>0&&t.jsx("span",{className:"pkid-pcsep","aria-hidden":!0}),t.jsxs("span",{children:[t.jsx("b",{children:U.v}),t.jsx("i",{children:U.l})]})]},H))})]}),t.jsx("div",{className:"pkid-mid",children:r}),t.jsx("div",{className:"pkid-right",children:t.jsx(zn,{last24h:o.packToday,total:o.packTotal,layout:"inline"})})]})}const Re=6.2832,kt=470,na={w:.3,spread:.8,zr:4.2,fit:.62,fitPc:1.05},aa={modra:pe.untouched,cyan:pe.untouchedHi,oranzova:pe.seen,zelena:pe.read},_a=o=>To[o.key]??aa.cyan,go=70,mt={zoom:1.45,bubble:1.3,cap:1.1},Yn=.9,Wn=1.9;function qn(o,r){const l=Math.floor(o/r),n=o-l*r,p=[];for(let v=0;v<r;v++)p.push(l+(v<n?1:0));return p}function ho(o,r,l,n,p,v){const $=r.naturalWidth||r.width,z=r.naturalHeight||r.height;if(!$||!z)return;const w=v==="cover"?Math.max(p/$,p/z):Math.min(p/$,p/z);o.drawImage(r,l-$*w/2,n-z*w/2,$*w,z*w)}function vo(o,r,l,n){const p=Math.atan2(o.sy-l,o.sx-r),v=Math.cos(p),$=Math.sin(p),z=v>.2?"left":v<-.2?"right":"center",w=$>.35?"top":$<-.35?"bottom":"middle";return{x:o.sx+v*n,y:o.sy+$*n,align:z,base:w}}function xt(o,r,l,n,p,v){const $=p==="left"?o:p==="right"?o-l:o-l/2,z=v==="top"?r:v==="bottom"?r-n:r-n/2;return{x0:$,y0:z,x1:$+l,y1:z+n}}const Xn=(o,r)=>o.x0<r.x1&&r.x0<o.x1&&o.y0<r.y1&&r.y0<o.y1;function Qn(o,r,l,n){const p=n.sx-l.sx,v=n.sy-l.sy,$=p*p+v*v;if(!$)return Math.hypot(o-l.sx,r-l.sy);const z=Math.max(0,Math.min(1,((o-l.sx)*p+(r-l.sy)*v)/$));return Math.hypot(o-(l.sx+z*p),r-(l.sy+z*v))}function ei(o){const r=o.canvas,l=o.tip,n=r.getContext("2d"),p=[],v=[];let $=0,z=0,w={x:0,y:0,k:1},h={x:0,y:0,k:1};const S={x:-1e5,y:-1e5};let f=null,K=!1,L=0,_={x:0,y:0},V=null,ie=!1,Q=1,le=1,x=null,O=null,R=null,U=null,H=0,fe=!0;const re=new Map;let $e=0,xe=1;const he=(c,b,E,T,Z)=>({x:c,y:b,role:E,wi:T,sz:Z,dx:0,dy:0,vx:0,vy:0,sx:0,sy:0,ex:0,ph:0,lw:0,nb:[],oi:-1,zi:-1,st:0}),Ae=o.worlds.reduce((c,b)=>c+b.scrolls,0),N=he(0,0,"root",-1,30);p.push(N);let ee=-Math.PI/2,ne=0;o.worlds.forEach((c,b)=>{var Ee;const E=c.scrolls/Ae*Re,T=ee+E/2,Z=he(Math.cos(T)*kt*na.w,Math.sin(T)*kt*na.w,"w",b,26);p.push(Z),v.push([N,Z]);const X=(Ee=o.circleSizes)==null?void 0:Ee.call(o,b),de=X&&X.length===c.circles?X:qn(c.scrolls,c.circles);for(let ye=0;ye<c.circles;ye++){const k=(ye+.5)/c.circles,D=kt*(.2+na.spread*Math.sqrt(k)),P=ee+E*(ye*.6180339887%1*.86+.07),te=Math.cos(P)*D,Y=Math.sin(P)*D,M=he(te,Y,"o",b,6.5);M.oi=ye,p.push(M),v.push([Z,M]);for(let ae=0;ae<de[ye];ae++){const ke=ae*2.39996+ye,Ie=26+Math.sqrt(ae)*na.zr,se=he(te+Math.cos(ke)*Ie,Y+Math.sin(ke)*Ie,"z",b,2.9);se.zi=ne,se.oi=ye,se.zo=ae,se.st=o.progress?o.progress(ne,b,ye,ae):0,ne++,p.push(se),v.push([M,se])}}ee+=E});let De=0;const G={x0:1e9,x1:-1e9,y0:1e9,y1:-1e9};p.forEach((c,b)=>{c.ph=b*.6180339887*Re%Re,c.lw=.42+b%9*.031,De=Math.max(De,Math.hypot(c.x,c.y)),G.x0=Math.min(G.x0,c.x),G.x1=Math.max(G.x1,c.x),G.y0=Math.min(G.y0,c.y),G.y1=Math.max(G.y1,c.y)}),v.forEach(c=>{c[0].nb.push(c[1]),c[1].nb.push(c[0])});const A={x:0,y:0};p.forEach(c=>{c.role==="w"&&(A.x=Math.max(A.x,Math.abs(c.x)),A.y=Math.max(A.y,Math.abs(c.y)))});const W=o.worlds.map(c=>{const b=new Image;return b.src=`/icons/pack/${c.ic}.svg`,b}),Se=new Image;Se.src=o.head;const Ge=!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);function j(){const c=r.getBoundingClientRect(),b=window.devicePixelRatio||1;r.width=Math.max(1,Math.round(c.width*b)),r.height=Math.max(1,Math.round(c.height*b)),n.setTransform(b,0,0,b,0,0),$=c.width,z=c.height}const J=c=>({x:$/2+(c.x+c.dx+w.x)*w.k,y:z/2+(c.y+c.dy+w.y)*w.k});function ue(){if(!fe)return;const c=o.layer?o.layer():"worlds",b=performance.now()*.001;w.x+=(h.x-w.x)*.18,w.y+=(h.y-w.y)*.18,w.k+=(h.k-w.k)*.18,p.forEach(k=>{k.role==="w"&&(k.ex+=((x===k?1:0)-k.ex)*.18),k!==f&&(k.dx||k.dy||k.vx||k.vy)&&(k.vx+=-k.dx*.02,k.vy+=-k.dy*.02,k.vx*=.72,k.vy*=.72,k.dx+=k.vx,k.dy+=k.vy,Math.abs(k.dx)<.1&&Math.abs(k.vx)<.1&&(k.dx=0,k.vx=0),Math.abs(k.dy)<.1&&Math.abs(k.vy)<.1&&(k.dy=0,k.vy=0));const D=J(k);if(k.sx=D.x,k.sy=D.y,Ge&&k!==f){const P=k.role==="z"?4.2:k.role==="root"?1.2:2.6;k.sx+=Math.sin(b*k.lw+k.ph)*P,k.sy+=Math.cos(b*k.lw*.83+k.ph*1.7)*P}}),n.clearRect(0,0,$,z);const E=o.isMobile()?mt.bubble:1,T=Math.min(o.isMobile()?mt.cap:2.2,Math.max(.5,w.k))*E;if(v.forEach(k=>{const D=k[0],P=k[1],te=P.role!=="z";if(!te&&w.k<.42&&D!==x&&P!==x)return;const Y=O&&O[0]===D&&O[1]===P||x&&(D===x||P===x);n.lineWidth=Y?2.4:te?1.4:.75;const M=c==="worlds"&&D.role!=="root"&&P.role!=="root"&&D.wi===P.wi,ae=M?_a(o.worlds[D.wi]):aa.cyan,ke=M?te?.42:.2:te?.24:.11;n.strokeStyle=Y?"rgba(140,240,255,.95)":`rgba(${ae},${ke})`,n.beginPath(),n.moveTo(D.sx,D.sy),n.lineTo(P.sx,P.sy),n.stroke()}),p.forEach(k=>{if(k.role==="w"||k.role==="root")return;const D=c==="worlds"?_a(o.worlds[k.wi]):k.role!=="z"?aa.cyan:k.st===2?aa.zelena:k.st===1?aa.oranzova:aa.modra,P=x===k,te=!!(x&&!P&&x.nb.indexOf(k)>=0);let Y=k.role!=="z"?1:c==="worlds"?.74:k.st?.95:.55;te&&(Y=Math.min(1,Y+.35));const M=k.sz*Math.min(2.2,Math.max(.5,w.k))*(P?1.7:te?1.25:1);k.role!=="z"||P||te||(c==="worlds"?!0:!!k.st)?(n.shadowBlur=P?26:te?20:k.st?12:14,n.shadowColor=`rgba(${D},.9)`):n.shadowBlur=0,n.fillStyle=`rgba(${D},${Y.toFixed(3)})`,n.beginPath(),n.arc(k.sx,k.sy,Math.max(.8,M),0,Re),n.fill(),P&&k.role==="z"&&(n.strokeStyle="rgba(140,240,255,.95)",n.lineWidth=1.6,n.beginPath(),n.arc(k.sx,k.sy,M+4,0,Re),n.stroke())}),n.shadowBlur=0,R){const k=_a(o.worlds[R.wi]),D=Math.min(2.2,Math.max(.5,w.k)),P=(Math.sin(b*3.2)+1)/2;n.fillStyle=`rgba(${k},1)`,n.shadowBlur=22,n.shadowColor=`rgba(${k},.95)`,n.beginPath(),n.arc(R.sx,R.sy,R.sz*D*1.9,0,Re),n.fill(),n.shadowBlur=0,n.lineWidth=1.6,n.strokeStyle=`rgba(${k},${(.95-P*.6).toFixed(2)})`,n.beginPath(),n.arc(R.sx,R.sy,R.sz*D*2.6+4+P*10,0,Re),n.stroke()}const Z=[],X=Math.round(Math.min(16,Math.max(12,11*w.k*E+3)));n.font=`700 ${X}px Cinzel, serif`;const de=new Map;p.forEach(k=>{if(k.role!=="w")return;const D=k.sz*T*(x===k?1.18:1),P=o.worldName(k.wi).toUpperCase(),te=n.measureText(P).width+6;let Y={...vo(k,N.sx,N.sy,D+6),name:P},M=xt(Y.x,Y.y,te,X+6,Y.align,Y.base);(M.x0<4||M.x1>$-4)&&(Y={x:Math.max(4+te/2,Math.min($-4-te/2,k.sx)),y:k.sy+D+6,align:"center",base:"top",name:P},M=xt(Y.x,Y.y,te,X+6,Y.align,Y.base)),de.set(k,Y),Z.push(M),Z.push({x0:k.sx-D,y0:k.sy-D,x1:k.sx+D,y1:k.sy+D})});const Ee=w.k>=Q*Wn;p.filter(k=>k.role==="o"&&(Ee||x===k)).sort((k,D)=>k===x?-1:D===x?1:0).forEach(k=>{const D=o.circleName(k.wi,k.oi);if(!D)return;const P=x===k,te=P?14:12;n.font=`${P?600:500} ${te}px 'Space Grotesk', sans-serif`;const Y=k.nb.find(Ie=>Ie.role==="w")??N,M=vo(k,Y.sx,Y.sy,10),ae=xt(M.x,M.y,n.measureText(D).width+4,te+4,M.align,M.base),ke=o.insets();!P&&(ae.y0<ke.top||ae.y1>z-ke.bottom*.6||ae.x0<2||ae.x1>$-2||Z.some(Ie=>Xn(Ie,ae)))||(Z.push(ae),n.textAlign=M.align,n.textBaseline=M.base,n.lineJoin="round",n.lineWidth=5,n.strokeStyle="rgba(2,6,11,.9)",n.strokeText(D,M.x,M.y),n.fillStyle=P?"rgba(235,252,255,1)":"rgba(207,243,250,.86)",n.fillText(D,M.x,M.y))}),n.textAlign="left",n.textBaseline="middle",p.forEach(k=>{if(k.role==="root"){const ae=k.sz*T*(x===k?1.18:1);if(n.shadowBlur=x===k?36:24,n.shadowColor="rgba(91,224,240,.95)",n.fillStyle="rgba(91,224,240,1)",n.beginPath(),n.arc(k.sx,k.sy,ae,0,Re),n.fill(),n.shadowBlur=0,Se.complete){const se=ae*.8;n.save(),n.beginPath(),n.arc(k.sx,k.sy,se,0,Re),n.clip(),ho(n,Se,k.sx,k.sy,se*2,"cover"),n.restore()}n.save(),n.lineWidth=1.5,n.strokeStyle="rgba(91,224,240,.55)",n.setLineDash([4,5]),n.lineDashOffset=-b*6,n.beginPath(),n.arc(k.sx,k.sy,ae*1.22,0,Re),n.stroke(),n.setLineDash([]);const ke=ae*1.42,Ie=b*1.8;n.lineWidth=1,n.strokeStyle="rgba(91,224,240,.18)",n.beginPath(),n.arc(k.sx,k.sy,ke,0,Re),n.stroke(),n.lineWidth=2,n.strokeStyle="rgba(91,224,240,1)",n.shadowBlur=12,n.shadowColor="rgba(91,224,240,.9)",n.beginPath(),n.arc(k.sx,k.sy,ke,Ie,Ie+Re/4),n.stroke(),n.restore();return}if(k.role!=="w")return;const D=x===k,P=k.sz*T*(D?1.18:1),te=c==="worlds"?_a(o.worlds[k.wi]):aa.cyan;n.shadowBlur=D?34:20,n.shadowColor=`rgba(${te},.95)`,n.fillStyle=`rgba(${te},1)`,n.beginPath(),n.arc(k.sx,k.sy,P,0,Re),n.fill(),n.shadowBlur=0;const Y=W[k.wi];Y&&Y.complete&&(n.globalCompositeOperation="destination-out",ho(n,Y,k.sx,k.sy,P*1.52,"contain"),n.globalCompositeOperation="source-over");const M=de.get(k);M&&(n.font=`700 ${X}px Cinzel, serif`,n.textAlign=M.align,n.textBaseline=M.base,n.lineJoin="round",n.miterLimit=2,n.lineWidth=6,n.strokeStyle="rgba(2,6,11,.92)",n.strokeText(M.name,M.x,M.y),n.shadowBlur=8+10*k.ex,n.shadowColor="rgba(140,240,255,.85)",n.fillStyle=`rgba(235,252,255,${(.86+.14*k.ex).toFixed(2)})`,n.fillText(M.name,M.x,M.y),n.shadowBlur=0,n.textAlign="left",n.textBaseline="middle")}),H=requestAnimationFrame(ue)}function Je(){let c=null,b=18;for(const E of p){if(E.role==="z")continue;const T=Math.hypot(E.sx-S.x,E.sy-S.y);T<b&&(b=T,c=E)}if(c)return c;b=9;for(const E of p){if(E.role!=="z")continue;const T=Math.hypot(E.sx-S.x,E.sy-S.y);T<b&&(b=T,c=E)}return c}function Ye(){let c=null,b=7;for(const E of v){if(E[1].role==="z")continue;const T=Qn(S.x,S.y,E[0],E[1]);T<b&&(b=T,c=E)}return c}function Ce(c,b=0,E=0){if(!c){l.style.opacity="0";return}l.replaceChildren();const T=document.createElement("b");if(T.textContent=c.title,l.appendChild(T),c.sub&&l.appendChild(document.createTextNode(c.sub)),c.hint){const Z=document.createElement("u");Z.textContent=c.hint,l.appendChild(Z)}l.style.left=`${b}px`,l.style.top=`${E}px`,l.style.opacity="1"}function q(){x=Je(),O=x?null:Ye(),x?(Ce(x.role==="w"?null:o.describe(x.role,x.wi,x.oi,x.zo),x.sx,x.sy),r.style.cursor="pointer"):O?(Ce(o.describe(O[1].role,O[1].wi,O[1].oi),(O[0].sx+O[1].sx)/2,(O[0].sy+O[1].sy)/2),r.style.cursor="pointer"):(Ce(null),r.style.cursor=K?"grabbing":"grab")}function We(){const c=(G.x0+G.x1)/2,b=(G.y0+G.y1)/2,E=Math.max(1,(G.x1-G.x0)/2*.92),T=Math.max(1,(G.y1-G.y0)/2*.92),Z=(-h.x-c)/E,X=(-h.y-b)/T,de=Math.hypot(Z,X);de>1&&(h.x=-(c+Z/de*E),h.y=-(b+X/de*T),w.x=h.x,w.y=h.y)}const et=()=>{We()},Ue=(c,b)=>{const E=Math.hypot(c.dx,c.dy);E>b&&(c.dx*=b/E,c.dy*=b/E)},da=c=>{const b=r.getBoundingClientRect();S.x=c.clientX-b.left,S.y=c.clientY-b.top},qe=c=>{h.k=Math.max(.35,Math.min(4.5,c)),et()};function ca(){const c=o.insets(),b=Math.min($,z-c.top-c.bottom),E=o.isMobile()?na.fit:na.fitPc;let T=Math.max(.35,Math.min(2,b*E/Math.max(1,De)));if(!o.isMobile()&&A.x>0&&A.y>0){const X=z-c.top-c.bottom;T=Math.max(.35,Yn*Math.min(($/2-170)/A.x,(X/2-64)/A.y))}le=o.isMobile()?T*mt.zoom:T;const Z=(c.top-c.bottom)/2/le;Q=T,(c.top-c.bottom)/2/T,h={x:0,y:Z,k:le},w={x:0,y:Z,k:le},p.forEach(X=>{X.dx=X.dy=X.vx=X.vy=0})}function Ia(c){const b=o.insets(),E=le*(c.role==="w"?2:c.role==="o"?3:3.6);h.k=Math.max(.35,Math.min(4.5,Math.max(h.k,E))),h.x=-(c.x+c.dx),h.y=-(c.y+c.dy)+(b.top-b.bottom)/2/h.k}function pa(){const c=o.insets();h={x:0,y:(c.top-c.bottom)/2/le,k:le},p.forEach(b=>{b.dx=b.dy=b.vx=b.vy=0})}function Oa(c){var b,E;if(c.role==="root"){pa();return}Ia(c),c.role==="w"&&o.onWorld(c.wi),c.role==="o"&&(U=c,(b=o.onCircle)==null||b.call(o,c.wi,c.oi)),c.role==="z"&&(R=c,U=c.nb.find(T=>T.role==="o")??U,(E=o.onScroll)==null||E.call(o,c.wi,c.oi,c.zo??0))}function ka(c,b,E){const T=p.find(de=>de.role==="z"&&de.wi===c&&de.oi===b&&de.zo===E)??null;if(R=T,!T)return;const Z=T.nb.find(de=>de.role==="o")??null;if(!Z||Z===U||ie)return;const X=!U;U=Z,ma(Z,!X)}function ma(c,b=!1){const E=[c,...c.nb.filter(P=>P.role==="z")];let T=1e9,Z=-1e9,X=1e9,de=-1e9;E.forEach(P=>{T=Math.min(T,P.x),Z=Math.max(Z,P.x),X=Math.min(X,P.y),de=Math.max(de,P.y)});const Ee=o.insets(),ye=Math.max(80,$-2*60),k=Math.max(80,z-Ee.top-Ee.bottom-2*40),D=Math.max(.35,Math.min(4.5,Math.min(ye/Math.max(20,Z-T),k/Math.max(20,de-X))));b||(h.k=D),h.x=-(T+Z)/2,h.y=-(X+de)/2+(Ee.top-Ee.bottom)/2/h.k}const Ra=c=>{if(re.has(c.pointerId)&&re.set(c.pointerId,{x:c.clientX,y:c.clientY}),re.size===2){const[b,E]=[...re.values()];$e>0&&(L+=10,qe(xe*(Math.hypot(b.x-E.x,b.y-E.y)/$e)));return}if(da(c),f){L+=Math.hypot(c.clientX-_.x,c.clientY-_.y);const b=(c.clientX-_.x)/w.k,E=(c.clientY-_.y)/w.k;f.dx+=b,f.dy+=E,f.nb.forEach(T=>{T.dx+=b*.3,T.dy+=E*.3,Ue(T,go*.5)}),Ue(f,go),_={x:c.clientX,y:c.clientY};return}if(K){const b=c.clientX-_.x,E=c.clientY-_.y;L+=Math.hypot(b,E),h.x+=b/w.k,h.y+=E/w.k,w.x+=b/w.k,w.y+=E/w.k,We(),_={x:c.clientX,y:c.clientY};return}ie&&(L+=Math.hypot(c.clientX-_.x,c.clientY-_.y)),q()},Xe=c=>{if(c.pointerType==="touch"&&(re.set(c.pointerId,{x:c.clientX,y:c.clientY}),re.size===2)){const[E,T]=[...re.values()];$e=Math.hypot(E.x-T.x,E.y-T.y),xe=h.k,f=null,V=null,K=!1,L=10;return}da(c),r.setPointerCapture(c.pointerId),_={x:c.clientX,y:c.clientY},L=0,ie=!0,q();const b=Je();b?(f=b,f.vx=f.vy=0,V=b):K=!0},ve=c=>{if(re.delete(c.pointerId),re.size<2&&($e=0),ie&&L<5)if(V)Oa(V);else{const b=Ye();b&&Oa(b[1])}f=null,K=!1,V=null,ie=!1},Qe=()=>{ie||(x=null,O=null,Ce(null))},Fe=c=>{c.preventDefault(),qe(h.k*Math.exp(-c.deltaY*.0015))};return r.addEventListener("pointermove",Ra),r.addEventListener("pointerdown",Xe),r.addEventListener("pointerleave",Qe),window.addEventListener("pointerup",ve),window.addEventListener("pointercancel",ve),r.addEventListener("wheel",Fe,{passive:!1}),j(),ca(),H=requestAnimationFrame(ue),{zoomBy:c=>qe(h.k*c),reset:ca,resize:()=>{j(),ca()},follow:ka,refresh:()=>{if(o.progress)for(const c of p)c.role==="z"&&(c.st=o.progress(c.zi,c.wi,c.oi,c.zo??0))},destroy:()=>{fe=!1,cancelAnimationFrame(H),r.removeEventListener("pointermove",Ra),r.removeEventListener("pointerdown",Xe),r.removeEventListener("pointerleave",Qe),window.removeEventListener("pointerup",ve),window.removeEventListener("pointercancel",ve),r.removeEventListener("wheel",Fe)}}}const bo={dogsPath:{circles:8,scrolls:108},understanding:{circles:6,scrolls:68},anatomy:{circles:7,scrolls:67},nutrition:{circles:7,scrolls:101},prevention:{circles:5,scrolls:47},training:{circles:6,scrolls:92},problems:{circles:7,scrolls:64}},ai=[{key:"dogsPath",ic:"dogsphinx",en:"Dog’s path",tease:"Where the wolf now asleep on your sofa came from."},{key:"understanding",ic:"idea",en:"Understanding",tease:"What your dog says with its body long before it opens its mouth — and why we mostly miss it."},{key:"anatomy",ic:"nose",en:"Anatomy",tease:"The dog’s body from the inside: what keeps working while it pretends to sleep."},{key:"nutrition",ic:"bow",en:"Nutrition",tease:"The bowl, from ship’s biscuit to extruder. A hundred years of decisions in which the dog never had a single line."},{key:"prevention",ic:"vet",en:"Prevention",tease:"What you can do today so it isn’t a diagnosis five years from now."},{key:"training",ic:"bolt",en:"Training",tease:"Learning without a broken dog — and without a broken human."},{key:"problems",ic:"alert",en:"Problems",tease:"When something goes wrong: what is urgent, what can wait and what the forums made up."}],ce=ai.map(o=>{var r,l;return{...o,circles:((r=bo[o.key])==null?void 0:r.circles)??0,scrolls:((l=bo[o.key])==null?void 0:l.scrolls)??0}}),ut=[{kind:"link",status:"wait",when:"2 days",text:"A study on omega-3 in arthritis (JAVMA 2021)",note:"relevant · source verified · suggested for PREVENTION › Food as prevention"},{kind:"insight",status:"wait",when:"5 days",text:"After switching to a raised bowl Hekthor stopped coughing after meals",note:"experience without a source · 3 people confirmed it on the board · 10 needed"},{kind:"book",status:"ok",when:"12 Sep",text:"Feeding Dogs (Conor Brady) — chapter 7",note:"split into 9 scrolls in NUTRITION"},{kind:"video",status:"ok",when:"9 Sep",text:"A lecture on extrusion (YouTube, 41 min)",note:"background for the circle How kibble is made"},{kind:"link",status:"no",when:"7 Sep",text:"Blog “curing epilepsy with herbs”",note:"claims without a source, contradicts the scroll on antiepileptics"}],fo=320,$o=340,gt=760;`${At}${fo}${e.surfaceBase}${e.edge}${$o}${e.surfaceBase}${e.edge}${a.sm}`,Pe.top+(Pe.h-ya.dia)/2,`${a.md}${a.md}${e.edge}${F}${i.label}${y.card.letterSpacing}${e.ink}${a.md}${a.md}${u}${i.micro}${y.section.letterSpacing}${e.cyanRGB}${a.md}${a.xs}${a.sm}${a.md}${d.tile}${e.inkDim}${u}${i.label}${e.cyanRGB}${e.cyan}${e.edgeStrong}${e.cyanRGB}${a.md}${e.edge}${i.micro}${e.inkFaint}${e.cyan}${e.edge}${d.card}${d.card}${a.md}${a.sm}${d.pill}${e.edgeStrong}${a.md}${a.xl}${a.md}${e.faceBg}${e.faceRing}`,Pe.top+(Pe.h-ya.dia)/2,`${a.xs}${a.md}${a.md}${a.lg}${F}${i.lead}${y.card.letterSpacing}${e.ink}${e.aiInk}${e.aiShadow}${u}${i.micro}${y.section.letterSpacing}${e.inkFaint}${a.md}${a.md}${a.md}${d.field}${u}${i.label}${y.card.letterSpacing}${e.ctaGrad}${e.ctaInk}${e.ctaShadow}${e.ctaGradHover}${a.md}${a.md}${a.sm}${a.sm}${a.md}${d.pill}${e.edge}${e.raised}${e.ink}${u}${i.label}${e.inkFaint}${a.md}${a.sm}${a.lg}${a.xs}${a.md}${a.sm}${a.xs}${u}${i.micro}${y.label.letterSpacing}${e.inkFaint}${a.sm}${a.xl}${a.sm}${a.md}${d.tile}${e.inkDim}${a.xs}${a.xs}${d.tile}${e.inkFaint}${i.body}${e.cyan}${e.edge}${e.bgDeep}${e.ctaA}${a.xs}${a.xs}${d.card}${e.edge}${e.bgDeep}${e.panelShadow}${a.sm}${a.md}${d.tile}${u}${i.label}${e.inkDim}${e.cyanRGB}${e.ink}${e.danger}${e.dangerTint}${e.danger}${a.sm}${a.md}${d.tile}${e.edgeStrong}${e.bgDeep}${e.ink}${u}${i.label}${u}${i.label}${i.micro}${y.card.letterSpacing}${e.inkFaint}${e.cyanRGB}${e.cyanRGB}${e.edge}${e.cyan}${e.edge}${a.md}${a.sm}${a.sm}${a.sm}${a.md}${d.field}${u}${i.label}${e.ctaEdge}${e.ctaTint}${e.inkDim}${e.ctaA}${a.md}${a.sm}${a.sm}${a.md}${d.tile}${e.edge}${e.raised}${e.inkDim}${e.edgeStrong}${e.edge}${e.faceBg}${F}${i.label}${e.cyan}${u}${i.label}${e.ink}${i.micro}${y.card.letterSpacing}${e.inkFaint}${e.inkFaint}${i.label}${a.sm}${i.micro}${e.inkFaint}${e.surfaceBase}${e.cyanRGB}${e.cyanRGB}${e.cyanRGB}${e.cyanRGB}${a.sm}${e.edge}`,Pe.top+(Pe.h-ya.dia)/2,`${a.lg}${a.md}${a.sm}${u}${i.micro}${y.card.letterSpacing}${e.inkFaint}${u}${i.label}${e.inkFaint}${e.cyan}${Mo("ainubis")}${Do("ainubis")}${a.xs}${a.md}${d.pill}${u}${i.micro}${y.card.letterSpacing}${e.edge}${e.cyan}${a.lg}${gt}${a.xl}${a.md}${a.lg}${d.card}${d.field}${i.body}${Rn}${a.md}${F}${i.micro}${y.section.letterSpacing}${e.inkFaint}${e.aiInk}${a.lg}${a.xl}${d.card}${d.field}${i.body}${e.inkDim}${Te}${$t}${a.lg}${a.lg}${a.lg}${a.md}${e.ink}${a.md}${a.md}${d.tile}${e.ctaEdge}${e.ctaTint}${i.body}${e.ink}${u}${i.micro}${y.label.letterSpacing}${e.ctaA}${a.sm}${a.sm}${a.md}${a.md}${e.edge}${i.micro}${y.card.letterSpacing}${e.inkFaint}${a.xs}${a.md}${d.pill}${u}${i.micro}${e.edge}${e.raised}${e.cyan}${e.cyanRGB}${e.inkFaint}${e.cyan}${a.sm}${a.sm}${a.sm}${a.md}${d.pill}${u}${i.label}${e.edge}${e.raised}${e.inkDim}${e.edgeStrong}${e.cyan}${e.ctaGrad}${e.ctaInk}${e.ctaGradHover}${e.ctaInk}${d.card}${a.lg}${e.ctaEdge}${e.ctaTint}${e.edge}${e.raised}${u}${i.micro}${y.label.letterSpacing}${e.ctaA}${e.cyan}${a.sm}${F}${i.lead}${y.card.letterSpacing}${e.ink}${a.md}${a.md}${d.tile}${e.edge}${e.bgDeep}${e.ink}${u}${i.body}${e.inkFaint}${a.sm}${a.md}${u}${i.micro}${y.section.letterSpacing}${e.inkFaint}${a.xs}${a.md}${d.pill}${u}${i.label}${e.edge}${e.inkDim}${e.edgeStrong}${e.cyanRGB}${e.edgeStrong}${e.cyan}${d.field}${a.md}${a.lg}${u}${i.label}${y.card.letterSpacing}${e.ctaGrad}${e.ctaInk}${e.ctaShadow}${e.ctaGradHover}${d.field}${a.md}${a.lg}${u}${i.label}${e.edge}${e.inkFaint}${e.edgeStrong}${e.inkDim}${a.md}${i.micro}${e.inkFaint}${e.ink}${d.card}${a.lg}${e.edge}${e.raised}${i.body}${e.inkDim}${e.ink}${a.md}${a.md}${d.tile}${i.label}${e.inkDim}${e.glowEdge}${e.glowTint}${e.cyan}${a.sm}${a.sm}${a.xs}${a.sm}${d.pill}${i.micro}${y.card.letterSpacing}${e.edge}${e.inkFaint}${a.xs}${a.xs}${a.md}${d.pill}${u}${i.micro}${y.section.letterSpacing}${e.ctaA}${e.ctaEdge}${e.ctaTint}${e.ok}${e.okEdge}${e.okTint}${e.danger}${e.dangerEdge}${e.dangerTint}${a.md}${a.md}${a.sm}${a.md}${d.tile}${e.edge}${e.bgDeep}${e.inkFaint}${u}${i.label}${e.ink}${i.micro}${e.inkFaint}${a.lg}${a.lg}${d.card}${e.edge}${e.bgDeep}${e.panelShadow}${a.md}${F}${i.h2}${y.card.letterSpacing}${e.ink}${a.lg}${e.cyan}${a.sm}${u}${i.label}${e.inkFaint}${e.ink}${e.edge}${a.md}${a.lg}${a.lg}${gt}${a.md}${a.xl}${u}${i.micro}${e.inkFaint}${e.inkDim}${gt}${a.sm}${a.md}${d.tile}${e.edge}${e.raised}${e.ink}${u}${i.body}${e.inkFaint}${d.tile}${e.edge}${e.raised}${e.cyan}${i.h2}${e.cyanRGB}${e.cyanRGB}${e.edgeStrong}${a.sm}`,2*a.lg,`${a.xs}${a.sm}${d.card}${e.edge}${e.bgDeep}${e.panelShadow}${a.sm}${a.md}${u}${i.micro}${y.label.letterSpacing}${e.cyan}${a.md}${a.md}${d.tile}${e.inkDim}${e.cyanRGB}${e.edge}${i.lead}${u}${i.label}${e.ink}${i.micro}${e.inkFaint}${fo}${$o}${a.md}${a.xl}`;const ti=360,yt=1240,oi=yt;`${At}${xn}${e.surfaceBase}${e.edge}`,Pe.top+(Pe.h-ya.dia)/2,`${a.lg}${a.md}${yt}${a.md}${a.md}${Mo("ainubis")}${Do("ainubis")}${F}${i.h2}${y.card.letterSpacing}${e.ink}${u}${i.micro}${y.section.letterSpacing}${e.inkFaint}${a.md}${a.xs}${a.xs}${d.pill}${e.surface}${e.edge}${e.panelShadow}${a.xs}${a.md}${d.pill}${e.inkDim}${u}${i.micro}${e.cyan}${e.edgeStrong}${e.cyanRGB}${e.ctaA}${e.ctaEdge}${e.ctaTint}${e.glow}${e.glowEdge}${e.glowTint}${e.edge}${a.sm}${a.sm}${a.md}${d.pill}${e.inkFaint}${Te}${Po}${a.sm}${e.ink}${u}${i.lead}${e.inkFaint}${a.xs}${e.ctaA}${a.sm}${a.sm}${a.lg}${d.pill}${e.edge}${e.inkDim}${u}${i.label}${e.edgeStrong}${e.edgeStrong}${e.cyan}${a.xs}${d.pill}${e.cyanRGB}${e.cyan}${i.micro}${a.sm}${d.card}${a.sm}${Te}${a.md}${a.sm}${a.md}${d.tile}${e.inkDim}${u}${i.label}${e.cyanRGB}${i.micro}${e.inkFaint}${e.cyan}${e.edgeStrong}${e.cyanRGB}${a.xs}${a.sm}${e.edge}${e.inkFaint}${u}${i.micro}${y.section.letterSpacing}${e.cyan}${a.sm}${a.xl}${a.sm}${d.pill}${e.edge}${e.inkDim}${u}${i.label}${e.edgeStrong}${e.cyan}${e.cyan}${e.edgeStrong}${e.cyanRGB}${a.sm}${a.lg}${a.lg}${a.xs}${a.xs}${a.md}${d.pill}${e.edge}${e.inkDim}${u}${i.label}${e.glow}${e.glowEdge}${e.glowTint}${a.lg}${a.lg}${a.xxl}${yt}${ti}${a.lg}${a.md}${oi}${a.sm}${a.lg}${a.md}${a.lg}${d.field}${u}${i.label}${y.card.letterSpacing}${e.ctaGrad}${e.ctaInk}${e.ctaShadow}${e.ctaGradHover}${d.card}${Te}${a.md}${a.lg}${a.md}${e.edgeStrong}${a.sm}${u}${i.micro}${y.card.letterSpacing}${e.inkFaint}${e.cyan}${i.label}${e.ctaA}${i.body}${e.ink}${e.cyan}${e.ctaA}${a.lg}${u}${i.micro}${e.inkFaint}${a.xs}${e.inkDim}${e.cyan}${a.xs}${y.section.letterSpacing}${d.card}${a.lg}${a.md}${a.md}${a.md}${d.pill}${e.edge}${e.raised}${e.cyan}${e.edgeStrong}${a.xl}${d.pill}${e.edge}${e.faceBg}${F}${i.label}${e.cyan}${u}${i.body}${e.ink}${i.micro}${y.card.letterSpacing}${e.inkFaint}${a.xs}${a.xs}${a.md}${d.pill}${ba.edge}${e.glowRGB}${e.glowRGB}${u}${i.micro}${y.card.letterSpacing}${i.body}${e.inkDim}${a.sm}${a.xs}${a.md}${d.pill}${u}${i.micro}${y.card.letterSpacing}${e.edge}${e.inkFaint}${e.ctaEdge}${e.ctaTint}${e.ctaA}${po}${$t}${Tn}${a.sm}${F}${i.micro}${y.section.letterSpacing}${e.inkFaint}${e.aiInk}${e.aiShadow}${d.pill}${a.sm}${i.body}${e.inkDim}${a.md}${a.md}${d.tile}${e.ctaEdge}${e.ctaTint}${i.body}${e.ink}${u}${i.micro}${y.label.letterSpacing}${e.ctaA}${a.sm}${a.sm}${a.md}${a.md}${e.edge}${u}${i.micro}${y.card.letterSpacing}${e.inkFaint}${i.label}${e.cyan}${a.xs}${a.xs}${a.md}${d.pill}${e.edge}${e.raised}${e.cyan}${u}${i.micro}${y.card.letterSpacing}${e.edgeStrong}${a.sm}${a.md}${a.sm}${a.md}${d.pill}${e.edge}${e.raised}${e.inkDim}${u}${i.label}${e.edgeStrong}${e.cyan}${a.md}${i.body}${e.inkDim}${e.ink}${a.xs}${a.sm}${a.sm}${d.pill}${u}${i.micro}${y.card.letterSpacing}${e.edge}${e.inkFaint}${e.okEdge}${e.okTint}${e.ok}${e.ctaEdge}${e.ctaTint}${e.ctaA}${a.sm}${a.sm}${a.md}${d.tile}${e.ctaEdge}${e.ctaTint}${i.label}${e.inkDim}${a.xs}${u}${i.label}${e.cyan}${a.sm}${a.sm}${a.sm}${a.md}${d.pill}${e.edge}${e.raised}${e.inkDim}${u}${i.label}${e.edgeStrong}${e.cyan}${e.ctaA}${e.ctaEdge}${e.ctaTint}${a.md}${a.xl}${a.lg}${u}${i.micro}${y.card.letterSpacing}${e.inkFaint}${a.sm}${F}${i.h2}${e.ink}${a.sm}${a.lg}${d.card}${Te}${a.sm}${a.xs}${a.md}${d.pill}${e.edge}${u}${i.micro}${y.card.letterSpacing}${e.inkDim}${a.xs}${a.xs}${a.md}${d.pill}${u}${i.micro}${y.card.letterSpacing}${e.ctaEdge}${e.ctaTint}${e.ctaA}${e.okEdge}${e.okTint}${e.ok}${e.dangerEdge}${e.dangerTint}${e.danger}${u}${i.body}${e.ink}${i.label}${e.inkFaint}${a.sm}${i.micro}${y.card.letterSpacing}${e.inkFaint}${a.xl}${a.xs}${a.md}${a.sm}${a.md}${d.tile}${e.inkDim}${u}${i.label}${e.cyanRGB}${i.micro}${e.inkFaint}${e.cyan}${e.edgeStrong}${e.cyanRGB}${d.card}${a.xl}${a.lg}${a.xl}${a.md}${F}${i.h2}${y.card.letterSpacing}${e.ink}${e.aiInk}${e.aiShadow}${i.body}${e.inkDim}${e.cyan}${a.md}${po}${i.label}${e.inkDim}${$t}${e.ink}${d.tile}${e.dangerEdge}${e.dangerTint}${a.md}${a.lg}${a.sm}${u}${i.micro}${y.label.letterSpacing}${e.danger}${a.lg}${a.xs}${i.label}${e.inkDim}${e.danger}${e.ink}${e.ctaA}${e.ctaRGB}${e.ctaA}${e.ctaEdge}${e.ctaTint}${a.sm}${e.edge}${a.md}${a.md}${e.edge}${a.md}${d.tile}${Pn}${e.cyanRGB}${a.xs}${d.tile}${e.glowEdge}${e.glowTint}${a.md}${a.lg}${i.label}${e.inkDim}${a.lg}${u}${i.micro}${y.label.letterSpacing}${e.inkFaint}${e.aiInk}${e.aiShadow}${a.md}${i.label}${e.inkFaint}${a.sm}${a.lg}${i.micro}${y.card.letterSpacing}${e.inkFaint}${a.sm}${d.pill}${d.frame}${a.md}${a.lg}${Te}${a.md}${u}${i.body}${e.ink}${e.inkFaint}${a.xs}${i.label}${e.inkFaint}${a.sm}${i.body}${e.inkDim}${a.md}${a.md}${d.tile}${e.ctaEdge}${e.ctaTint}${i.label}${e.inkDim}${u}${i.micro}${y.label.letterSpacing}${e.ctaA}${a.sm}${a.xs}${a.sm}${u}${i.label}${e.cyan}${a.sm}${a.sm}${e.ink}${i.label}${e.inkFaint}${a.xs}${a.md}${d.pill}${e.edge}${e.inkFaint}${u}${i.micro}${y.card.letterSpacing}${d.pill}${a.md}${a.sm}${e.cyanRGB}${e.ok}${e.glow}${e.ctaA}${a.md}${i.micro}${y.card.letterSpacing}${e.inkFaint}${e.cyan}${e.ok}${a.xs}${a.sm}${d.pill}${e.ctaEdge}${e.ctaTint}${e.ctaA}${u}${i.micro}${y.card.letterSpacing}${d.frame}${e.edge}${a.md}${a.lg}${e.inkFaint}${u}${i.body}${e.inkFaint}${a.xs}${i.label}${a.md}${a.xs}${a.sm}${a.md}${d.tile}${e.edge}${e.raised}${e.inkDim}${e.edgeStrong}${u}${i.label}${e.ink}${e.cyan}${a.xs}${i.micro}${e.inkFaint}${i.micro}${y.card.letterSpacing}${e.ctaA}${d.tile}${e.edge}${e.raised}${a.md}${a.lg}${i.label}${e.inkFaint}${a.lg}${e.cyan}`,Pe.top+(Pe.h-ya.dia)/2,`${a.xxl}${a.md}${a.xl}${a.xxl}${a.xxl}`;ut.filter(o=>o.status==="wait").length,ut.filter(o=>o.status==="ok").length,ut.filter(o=>o.status==="no").length;const Bo=o=>!!(o.read_at||o.listened_at),ht=o=>o.reads.filter(Bo).length,ni=(o,...r)=>new Set(o.ev.filter(l=>r.includes(l.kind)).map(l=>l.scroll_id)).size,ii=(o,...r)=>o.ev.filter(l=>r.includes(l.kind)).reduce((l,n)=>l+n.n,0),Lo=[{id:"first",ic:"feather",goal:1,name:{sk:"Prvý zvitok",cs:"První svitek",en:"First scroll"},how:{sk:"Prečítaj alebo dopočúvaj prvý zvitok.",cs:"Přečti nebo doposlechni první svitek.",en:"Read or finish listening to your first scroll."},have:ht},{id:"ear",ic:"play",goal:3,name:{sk:"Ucho AINUBISA",cs:"Ucho AINUBISE",en:"AINUBIS’s ear"},how:{sk:"Dopočúvaj tri podcasty do konca.",cs:"Doposlechni tři podcasty do konce.",en:"Listen to three podcasts to the end."},have:o=>o.reads.filter(r=>r.listened_at).length},{id:"seven",ic:"ankh",goal:7,name:{sk:"Sedem pečatí",cs:"Sedm pečetí",en:"Seven seals"},how:{sk:"Uzavri sedem zvitkov.",cs:"Uzavři sedm svitků.",en:"Close seven scrolls."},have:ht},{id:"circle",ic:"target",goal:1,name:{sk:"Okruh uzavretý",cs:"Okruh uzavřen",en:"Circle closed"},how:{sk:"Uzavri všetky zvitky jedného okruhu.",cs:"Uzavři všechny svitky jednoho okruhu.",en:"Close every scroll of one circle."},have:o=>ri(o)},{id:"heart",ic:"heart",goal:5,name:{sk:"Srdce svorky",cs:"Srdce smečky",en:"Heart of the pack"},how:{sk:"Daj srdiečko piatim zvitkom.",cs:"Dej srdíčko pěti svitkům.",en:"Give a heart to five scrolls."},have:o=>Math.max(ni(o,"like"),o.reads.filter(r=>r.liked).length)},{id:"voice",ic:"idea",goal:1,name:{sk:"Hlas pre AINUBISA",cs:"Hlas pro AINUBISE",en:"A voice for AINUBIS"},how:{sk:"Navrhni zmenu alebo požiadaj o nový jazyk.",cs:"Navrhni změnu nebo požádej o nový jazyk.",en:"Suggest a change or ask for a new language."},have:o=>Math.max(ii(o,"suggest","lang_request"),o.requests.length)},{id:"tongues",ic:"globe",goal:2,name:{sk:"Dva jazyky",cs:"Dva jazyky",en:"Two tongues"},how:{sk:"Počúvaj podcasty v dvoch jazykoch.",cs:"Poslouchej podcasty ve dvou jazycích.",en:"Listen to podcasts in two languages."},have:o=>new Set(o.reads.flatMap(r=>r.listen_langs||[])).size},{id:"hero42",ic:"dogsphinx",goal:42,name:{sk:"Cesta s Hrdinom",cs:"Cesta s Hrdinou",en:"The Hero’s path"},how:{sk:"Uzavri 42 zvitkov — toľko dní trvala Cesta s Hrdinom.",cs:"Uzavři 42 svitků — tolik dní trvala Cesta s Hrdinou.",en:"Close 42 scrolls — as many as the days of the Hero’s journey."},have:ht}];function ri(o){var p;const r=new Set(o.reads.filter(Bo).map(v=>v.scroll_id)),l=new Map;for(const v of o.scrolls){const $=`${v.world}-${v.okruh}`;l.set($,[...l.get($)||[],v])}let n=0;for(const v of l.values())v.length>=(((p=v[0])==null?void 0:p.total)||1/0)&&v.every($=>r.has($.id))&&n++;return n}const be=Ea,qa=o=>o==="sk"||o==="cs"?o:"en",Ve=(o,r)=>o.lang[qa(r)]||o.lang.en||o.lang.sk,Vo=(o,r,l)=>[l,qa(r),"en","sk"].find(n=>n&&o.pod[n])||null,si=(o,r,l)=>{const n=Vo(o,r,l);return n?o.pod[n]:null},li=o=>o.doi?`https://doi.org/${o.doi}`:o.url||"",ia=o=>`${Math.floor(o/60)}:${String(o%60).padStart(2,"0")}`,_o=o=>{var r;return{id:o.id,code:o.code,okruh:o.okruh,n:o.n,total:o.total,world:o.world,circle:((r=o.circle)==null?void 0:r.sk)||"",img:o.img,imgs:o.imgs||{},sd:o.sd||0,lang:o.lang||{},pod:o.pod||{},zdroje:o.zdroje||[],doplnene:o.doplnene||[],rel:o.rel||[]}};let za=null,vt=null;function Ko(){return za?Promise.resolve(za):(vt||(vt=(async()=>{const{data:o,error:r}=await be.from("vault_scrolls").select("*").order("world").order("okruh").order("n");let l=!r&&(o!=null&&o.length)?o.map(_o):[];return l.length,za=l,l})()),vt)}function di(){const[o,r]=g.useState(za||[]);return g.useEffect(()=>{if(za)return;let l=!0;return Ko().then(n=>{l&&r(n)}),()=>{l=!1}},[]),o}let bt=null;function ci(){const[o,r]=g.useState(bt||[]);return g.useEffect(()=>{if(bt)return;let l=!0;return(async()=>{const{data:n,error:p}=await be.rpc("magnet_scrolls");let v=!p&&(n!=null&&n.length)?n.map(_o):[];v.length,bt=v,l&&r(v)})(),()=>{l=!1}},[]),o}const Uo="vault-reads";let je=null,ze={},ta={state:{},liked:[],saved:[]},Za=!1;const Ga=new Set,wt=()=>{const o={},r=[],l=[];for(const n of Object.values(ze))o[n.scroll_id]=n.read_at||n.listened_at?2:n.seen_at?1:0,n.liked&&r.push(n.scroll_id),n.saved&&l.push(n.scroll_id);ta={state:o,liked:r,saved:l},Ga.forEach(n=>n())},sa=o=>(Ga.add(o),()=>{Ga.delete(o)}),Fo="vault-events-sum",Ho="vault-badges-earned";let Ke={},He={},Ja=[];const Zo=(o,r)=>`${o}|${r}`,zt=new Set,Xa=()=>{Ja=Object.values(Ke),zt.forEach(o=>o())};function Me(o,r,l={}){var p;const n=Zo(r,o);if(Ke={...Ke,[n]:{kind:r,scroll_id:o,n:(((p=Ke[n])==null?void 0:p.n)||0)+1}},Xa(),je)be.from("vault_events").insert({scroll_id:o,kind:r,meta:l}).then(({error:v})=>{v&&console.warn("[vault] denník",v)});else try{localStorage.setItem(Fo,JSON.stringify(Ke))}catch{}jt()}async function pi(){const[o,r]=await Promise.all([be.rpc("vault_event_summary"),be.from("vault_badges_earned").select("badge_id,earned_at")]),l={};for(const n of o.data||[])l[Zo(n.kind,n.scroll_id)]={kind:n.kind,scroll_id:n.scroll_id,n:Number(n.n)};for(const[n,p]of Object.entries(Ke))(!l[n]||l[n].n<p.n)&&(l[n]=p);Ke=l;for(const n of r.data||[])He[n.badge_id]=n.earned_at;Xa()}async function jt(){if(!St)return;const o=await Ko(),r={reads:Object.values(ze),scrolls:o,requests:_e,ev:Ja},l=Lo.filter(p=>!He[p.id]&&p.have(r)>=p.goal).map(p=>p.id);if(!l.length)return;const n=new Date().toISOString();for(const p of l)He[p]=n;if(Xa(),!je){try{localStorage.setItem(Ho,JSON.stringify(He))}catch{}return}be.from("vault_badges_earned").upsert(l.map(p=>({user_id:je,badge_id:p,earned_at:n})),{onConflict:"user_id,badge_id",ignoreDuplicates:!0}).then(({error:p})=>{p&&console.warn("[vault] odznak",p)})}let St=!1;const Go=o=>(zt.add(o),()=>{zt.delete(o)});function ki(){return Ze(),g.useSyncExternalStore(Go,()=>Ja,()=>Ja)}function mi(){return Ze(),g.useSyncExternalStore(Go,()=>He,()=>He)}let yo=!1;function Ze(){yo||(yo=!0,(async()=>{var l,n;const{data:o}=await Ea.auth.getSession();if(je=((n=(l=o.session)==null?void 0:l.user)==null?void 0:n.id)??null,!je){try{ze=JSON.parse(localStorage.getItem(Uo)||"{}")}catch{ze={}}Za=!0;try{Ke=JSON.parse(localStorage.getItem(Fo)||"{}"),He=JSON.parse(localStorage.getItem(Ho)||"{}")}catch{Ke={},He={}}wt(),Xa(),St=!0,jt();return}const{data:r}=await be.from("vault_reads").select("*");ze=Object.fromEntries((r||[]).map(p=>[p.scroll_id,p])),Za=!0,wt(),$i(),await pi().catch(p=>console.warn("[vault] načítanie denníka",p)),St=!0,jt()})())}const xi=o=>({scroll_id:o,seen_at:null,read_at:null,listened_at:null,listen_sec:0,listen_langs:[],liked:!1,saved:!1});function Sa(o,r){const l={...ze[o]||xi(o),...r,updated_at:new Date().toISOString()};if(ze={...ze,[o]:l},wt(),!je){try{localStorage.setItem(Uo,JSON.stringify(ze))}catch{}return}be.from("vault_reads").upsert({...l,user_id:je},{onConflict:"user_id,scroll_id"}).then(({error:n})=>{n&&console.warn("[vault] zápis postupu",n)})}function fa(o,r,l="read",n="button"){const p=ze[o],v=new Date().toISOString();if(r===1){p!=null&&p.seen_at||(Sa(o,{seen_at:v}),Me(o,"seen"));return}(l==="listen"?p!=null&&p.listened_at:p!=null&&p.read_at)||(Sa(o,{seen_at:(p==null?void 0:p.seen_at)||v,...l==="listen"?{listened_at:v}:{read_at:v}}),Me(o,l==="listen"?"listened":"read",l==="listen"?{}:{via:n}))}function ui(o,r,l){const n=ze[o],p=(n==null?void 0:n.listen_langs)||[];((n==null?void 0:n.listen_sec)||0)>=r&&p.includes(l)||Sa(o,{listen_sec:Math.max((n==null?void 0:n.listen_sec)||0,Math.floor(r)),listen_langs:p.includes(l)?p:[...p,l]})}function gi(o){var l;const r=!((l=ze[o])!=null&&l.liked);Jo(o,"likes",r),Sa(o,{liked:r}),Me(o,r?"like":"unlike")}function hi(o){var l;const r=!((l=ze[o])!=null&&l.saved);Jo(o,"saves",r),Sa(o,{saved:r}),Me(o,r?"save":"unsave")}function vi(){return Ze(),g.useSyncExternalStore(sa,()=>Za,()=>Za)}function Ot(){return Ze(),g.useSyncExternalStore(sa,()=>ta.state,()=>ta.state)}function bi(){return Ze(),g.useSyncExternalStore(sa,()=>ta.liked,()=>ta.liked)}function fi(){return Ze(),g.useSyncExternalStore(sa,()=>ta.saved,()=>ta.saved)}function Rt(){return Ze(),g.useSyncExternalStore(sa,()=>ze,()=>ze)}let ra={};async function $i(){const{data:o}=await be.rpc("vault_scroll_counts");ra=Object.fromEntries((o||[]).map(r=>[r.scroll_id,{likes:Number(r.likes),saves:Number(r.saves)}])),Ga.forEach(r=>r())}function Jo(o,r,l){if(!je)return;const n=ra[o]||{likes:0,saves:0};ra={...ra,[o]:{...n,[r]:Math.max(0,n[r]+(l?1:-1))}}}function yi(o){Ze();const r=g.useSyncExternalStore(sa,()=>ra[o],()=>ra[o]);return je?r||{likes:0,saves:0}:null}const Yo="vault-demo-talk";let me=(()=>{try{return JSON.parse(localStorage.getItem(Yo)||"{}")}catch{return{}}})(),Na=!1;const wo=new Set;let Ya={};const Aa=new Set,zo=[],Tt=()=>Aa.forEach(o=>o());function Pt(){if(!Na)try{localStorage.setItem(Yo,JSON.stringify(me))}catch{}Tt()}async function Mt(){var r,l;if(je)return je;const{data:o}=await Ea.auth.getSession();return((l=(r=o.session)==null?void 0:r.user)==null?void 0:l.id)??null}async function Qa(o){if(!await Mt())return;Na||(Na=!0,me={});const{data:l,error:n}=await be.rpc("list_vault_talk",{p_scroll:o});if(n){console.warn("[vault] diskusia",n);return}me={...me,[o]:(l||[]).map(p=>({id:p.id,text:p.body,at:Date.parse(p.created_at),img:Array.isArray(p.photos)&&typeof p.photos[0]=="string"?p.photos[0]:void 0,liked:p.liked,likes:p.likes,author:p.author,avatar:p.avatar_url,mine:p.is_mine}))},Ya={...Ya,[o]:me[o].length},Tt()}let Nt=!1;async function wi(){if(Nt||(Nt=!0,!await Mt()))return;const{data:o}=await be.rpc("vault_talk_counts");Ya=Object.fromEntries((o||[]).map(r=>[r.scroll_id,Number(r.n)])),Tt()}function zi(o,r){const l=[...me[o]||[]],n=l[r];if(!n)return;const p=!n.liked;if(l[r]={...n,liked:p,likes:Math.max(0,(n.likes??(n.liked?1:0))+(p?1:-1))},me={...me,[o]:l},Pt(),Me(o,p?"comment_like":"comment_unlike",{post_id:n.id??null}),!Na||!n.id||!je)return;(p?be.from("post_marks").insert({post_id:n.id,user_id:je,kind:"like"}):be.from("post_marks").delete().eq("post_id",n.id).eq("user_id",je).eq("kind","like")).then(({error:$})=>{$&&(console.warn("[vault] lajk komentára",$),Qa(o))})}async function ji(o,r,l){const n=await Mt();if(!n)return me={...me,[o]:[...me[o]||[],{text:r,at:Date.now(),...l?{img:l}:{}}]},Pt(),Me(o,"comment",{text:r,local:!0}),!0;try{let p=[];if(l){const z=await(await fetch(l)).blob();p=[(await Ln(z,o,String(Date.now()))).secureUrl]}const{data:v,error:$}=await be.from("posts").insert({author_id:n,body:r,photos:p,tags:["vault"],attach:{scroll:o},visibility:"public"}).select("id").single();if($)throw $;return Me(o,"comment",{post_id:(v==null?void 0:v.id)??null,text:r,photos:p}),await Qa(o),!0}catch(p){return console.warn("[vault] komentár neodišiel",p),!1}}async function Si(o,r){var p;const l=(p=me[o])==null?void 0:p[r];if(!l)return!1;if(!l.id)return me={...me,[o]:me[o].filter((v,$)=>$!==r)},Pt(),Me(o,"comment_delete",{text:l.text,local:!0}),!0;const{error:n}=await be.from("posts").delete().eq("id",l.id);return n?(console.warn("[vault] mazanie komentára",n),!1):(Me(o,"comment_delete",{post_id:l.id,text:l.text}),await Qa(o),!0)}function Ni(o){return g.useEffect(()=>{wo.has(o)||(wo.add(o),Qa(o))},[o]),g.useSyncExternalStore(r=>(Aa.add(r),()=>{Aa.delete(r)}),()=>me[o]||zo,()=>me[o]||zo)}function Ai(o){return g.useEffect(()=>{wi()},[]),g.useSyncExternalStore(r=>(Aa.add(r),()=>{Aa.delete(r)}),()=>{var r,l;return Na||Nt?Ya[o]??(((r=me[o])==null?void 0:r.length)||0):((l=me[o])==null?void 0:l.length)||0},()=>{var r;return((r=me[o])==null?void 0:r.length)||0})}const Wo="vault-requests";function qo(o){if(_e=[{id:`local-${Date.now()}`,lang:null,body:null,status:"new",created_at:new Date().toISOString(),...o},..._e],Fa.forEach(l=>l()),Me(o.scroll_id,o.kind==="lang"?"lang_request":"suggest",{kind:o.kind,lang:o.lang??null,body:o.body??null}),!je){try{localStorage.setItem(Wo,JSON.stringify(_e))}catch{}return}be.from("vault_requests").insert(o).then(({error:l})=>{l&&console.warn("[vault] žiadosť",l)})}function Ei(o,r,l){qo({scroll_id:o,kind:r,body:l})}function Ii(o,r){qo({scroll_id:o,kind:"lang",lang:r})}let _e=[],jo=!1;const Fa=new Set;function Oi(){return g.useEffect(()=>{jo||(jo=!0,(async()=>{const{data:o}=await Ea.auth.getSession();if(o.session){const{data:r}=await be.from("vault_requests").select("*").order("created_at",{ascending:!1});_e=r||[]}else try{_e=JSON.parse(localStorage.getItem(Wo)||"[]")}catch{_e=[]}Fa.forEach(r=>r())})())},[]),g.useSyncExternalStore(o=>(Fa.add(o),()=>{Fa.delete(o)}),()=>_e,()=>_e)}function Ri(o,r=800){return new Promise((l,n)=>{const p=URL.createObjectURL(o),v=new Image;v.onload=()=>{var w;const $=Math.min(1,r/Math.max(v.width,v.height)),z=document.createElement("canvas");z.width=Math.round(v.width*$),z.height=Math.round(v.height*$),(w=z.getContext("2d"))==null||w.drawImage(v,0,0,z.width,z.height),URL.revokeObjectURL(p),l(z.toDataURL("image/jpeg",.8))},v.onerror=n,v.src=p})}const Dt={dogsPath:[{sk:"Odkiaľ pes prišiel",en:"Where the dog came from"},{sk:"Rozhodnutie pred psom",en:"The decision before the dog"},{sk:"Odkiaľ ho vziať",en:"Where to get one"},{sk:"Príchod a prvý rok",en:"Arrival and the first year"},{sk:"Spolu: človek a pes",en:"Human and dog"},{sk:"Reprodukcia a kastrácia",en:"Breeding and neutering"},{sk:"Dospelosť a staroba",en:"Adulthood and old age"},{sk:"Odchod",en:"Saying goodbye"}],understanding:[{sk:"Kto je pes a čo z neho máme",en:"Who the dog is and what we take from him"},{sk:"Vzhľad, ktorý rozhoduje",en:"Looks that decide"},{sk:"Pes, ktorý nemá čo robiť",en:"A dog with nothing to do"},{sk:"Čo sa o psovi nevie",en:"What we no longer know about dogs"},{sk:"Kto na psovi zarába",en:"Who profits from the dog"},{sk:"Zvládneš to sám",en:"You can do this yourself"}],anatomy:[{sk:"Zuby a papuľa",en:"Teeth and jaws"},{sk:"Žalúdok a trávenie",en:"Stomach and digestion"},{sk:"Koža, srsť a zápach",en:"Skin, coat and smell"},{sk:"Hormóny",en:"Hormones"},{sk:"Pohyb a kostra",en:"Movement and skeleton"},{sk:"Zmysly",en:"Senses"},{sk:"Odpočinok",en:"Rest"}],nutrition:[{sk:"Prirodzená strava, koľko čoho a kedy",en:"Natural food: how much of what, and when"},{sk:"Živiny",en:"Nutrients"},{sk:"Surové, varené, domáce",en:"Raw, cooked, homemade"},{sk:"Granule sú pre ľudí",en:"Kibble is for humans"},{sk:"Bezpečnosť jedla",en:"Food safety"},{sk:"Bylinky a záhrada",en:"Herbs and the garden"},{sk:"Doplnky",en:"Supplements"}],prevention:[{sk:"Parazity",en:"Parasites"},{sk:"Očkovanie a titre",en:"Vaccination and titres"},{sk:"Jedy v domácnosti",en:"Poisons at home"},{sk:"Všímať si včas",en:"Catching it early"},{sk:"Alternatívne liečenie",en:"Alternative treatment"}],training:[{sk:"Ako sa pes učí",en:"How a dog learns"},{sk:"Reč, ktorou pes hovorí",en:"The language a dog speaks"},{sk:"Základ, ktorý drží celý život",en:"The basics that last a lifetime"},{sk:"Záťaž každý deň",en:"Work for every day"},{sk:"Disciplíny",en:"Disciplines"},{sk:"Tréneri a hranice tréningu",en:"Trainers and the limits of training"}],problems:[{sk:"Núdza — minúty rozhodujú",en:"Emergency: minutes decide"},{sk:"Pohyb a bolesť",en:"Movement and pain"},{sk:"Koža, uši, alergie",en:"Skin, ears, allergies"},{sk:"Tráviace problémy",en:"Digestive problems"},{sk:"Neurológia a epilepsia",en:"Neurology and epilepsy"},{sk:"Psychika",en:"Mind and behaviour"},{sk:"Rakovina",en:"Cancer"}]},Ti={sk:{title:"Moje znalosti",back:"Späť",eyebrow:"AINUBIS · VAULT",read:"prečítaných zvitkov",listened:"vypočutých podcastov",minutes:"min počúvania",vault:"celého VAULTU",worldsLit:"svetov rozsvietených",worlds:"Svety",circles:"Otvorené okruhy",badges:"Odznaky",more:"ešte",got:"Získaný",going:"Rozpočúvané",liked:"Obľúbené",saved:"Uložené",mine:"Moje príspevky",noneLiked:"Srdiečko na zvitku ho pridá sem.",noneSaved:"Hviezdička na zvitku ho odloží sem.",noneMine:"Návrh zmeny alebo žiadosť o jazyk sa zapíše sem — aj s tým, ako ho AINUBIS posúdil.",noneGoing:"",soon:"otvárame postupne",draft:"Návrh odznakov — mená a míľniky ešte nie sú schválené.",kinds:{lang:"Žiadosť o jazyk",add:"Nová znalosť",wrong:"Chybné tvrdenie",own:"Vlastný text"},status:{new:"čaká na AINUBISA",accepted:"prijaté",rejected:"zamietnuté",done:"hotové"},states:["nevidené","videné","hotové"]},cs:{title:"Moje znalosti",back:"Zpět",eyebrow:"AINUBIS · VAULT",read:"přečtených svitků",listened:"poslechnutých podcastů",minutes:"min poslechu",vault:"celého VAULTU",worldsLit:"rozsvícených světů",worlds:"Světy",circles:"Otevřené okruhy",badges:"Odznaky",more:"ještě",got:"Získaný",going:"Rozposlouchané",liked:"Oblíbené",saved:"Uložené",mine:"Moje příspěvky",noneLiked:"Srdíčko na svitku ho přidá sem.",noneSaved:"Hvězdička na svitku ho odloží sem.",noneMine:"Návrh změny nebo žádost o jazyk se zapíše sem — i s tím, jak ho AINUBIS posoudil.",noneGoing:"",soon:"otevíráme postupně",draft:"Návrh odznaků — jména a milníky ještě nejsou schválené.",kinds:{lang:"Žádost o jazyk",add:"Nová znalost",wrong:"Chybné tvrzení",own:"Vlastní text"},status:{new:"čeká na AINUBISE",accepted:"přijato",rejected:"zamítnuto",done:"hotovo"},states:["neviděné","viděné","hotové"]},en:{title:"My knowledge",back:"Back",eyebrow:"AINUBIS · VAULT",read:"scrolls read",listened:"podcasts heard",minutes:"min listened",vault:"of the whole VAULT",worldsLit:"worlds lit",worlds:"Worlds",circles:"Open circles",badges:"Badges",more:"to go",got:"Earned",going:"Still listening",liked:"Favourites",saved:"Saved",mine:"My contributions",noneLiked:"A heart on a scroll adds it here.",noneSaved:"A star on a scroll keeps it here.",noneMine:"A suggested change or a language request lands here — with AINUBIS’s verdict.",noneGoing:"",soon:"opening step by step",draft:"Badge draft — names and milestones are not approved yet.",kinds:{lang:"Language request",add:"New knowledge",wrong:"Wrong claim",own:"Own text"},status:{new:"waiting for AINUBIS",accepted:"accepted",rejected:"declined",done:"done"},states:["unseen","seen","done"]}},Ka=o=>!!(o&&(o.read_at||o.listened_at)),ft=o=>({width:`${Math.round(Math.min(1,Math.max(0,o))*100)}%`}),Pi=`
${un}
${gn}
.vk .pk-progress{background:${e.surface};}
.vk-head{display:flex;align-items:center;gap:${a.lg}px;margin-top:${a.md}px;}
.vk-head .pk-medallion{border-color:${e.edgeStrong};background:${e.faceBg};color:${e.ctaA};
  font:700 ${i.h2}px ${F};}
.vk-head > div{display:flex;flex-direction:column;gap:${a.xs}px;min-width:0;}
.vk-who{font-size:${i.label}px;color:${e.inkDim};}
/* VEĽKÉ ČÍSLA — ako svetové štatistiky v TRIPSTATS */
.vk-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${a.sm}px;margin-top:${a.xl}px;}
@media (min-width:768px){.vk-kpis{grid-template-columns:repeat(4,minmax(0,1fr));}}
.vk-kpi{padding:${a.md}px;border-radius:${d.tile}px;${Te}display:flex;flex-direction:column;gap:${a.xs}px;}
.vk-kpi b{font:700 ${i.h1}px/1 ${F};color:${e.ink};}
.vk-kpi b small{font-size:${i.body}px;color:${e.inkFaint};}
.vk-kpi span{font-size:${i.label}px;line-height:1.35;color:${e.inkDim};}
.vk-kpi i{font-style:normal;font-size:${i.micro}px;color:${e.inkFaint};}
.vk-kpi--read b{color:rgb(${pe.read});}
/* SVETY */
.vk-world{display:grid;grid-template-columns:20px 1fr auto;align-items:center;gap:${a.xs}px ${a.md}px;padding:${a.sm}px 0;}
.vk-world + .vk-world{border-top:1px solid ${e.edge};}
.vk-world .zv-ic{width:20px;height:20px;margin:0;color:rgb(var(--vk-w));}
.vk-world em{font-style:normal;font-size:${i.body}px;color:${e.ink};}
.vk-world small{font-size:${i.label}px;color:${e.inkFaint};font-variant-numeric:tabular-nums;}
.vk-world .pk-progress{grid-column:2 / 4;}
.vk-world .pk-progress__fill{background:rgb(var(--vk-w));}
/* OKRUH — rad zŕn, jedno na zvitok (farby BRAIN_STATE ako v mozgu) */
.vk-circle{display:flex;flex-direction:column;gap:${a.sm}px;padding:${a.sm}px 0;}
.vk-circle header{display:flex;justify-content:space-between;gap:${a.sm}px;font-size:${i.body}px;color:${e.ink};}
.vk-circle header small{font-size:${i.label}px;color:${e.inkFaint};}
.vk-dots{display:flex;flex-wrap:wrap;gap:${a.sm}px;}
.vk-dot{width:28px;height:28px;border-radius:${d.pill}px;cursor:pointer;padding:0;display:inline-flex;align-items:center;justify-content:center;
  font:600 ${i.micro}px ${u};color:${e.inkDim};background:transparent;border:1px solid ${e.edge};}
.vk-dot[data-s="1"]{border-color:rgb(${pe.seen});color:rgb(${pe.seen});}
.vk-dot[data-s="2"]{background:rgb(${pe.read});border-color:rgb(${pe.read});color:${e.bgDeep};}
/* ODZNAKY — mriežka ako HeroBadges: získaný svieti, zamknutý je tichý s „ešte N" */
.vk-badges{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${a.sm}px;}
@media (min-width:640px){.vk-badges{grid-template-columns:repeat(4,minmax(0,1fr));}}
.vk-badge{display:flex;flex-direction:column;align-items:center;text-align:center;gap:${a.xs}px;padding:${a.md}px ${a.sm}px;
  border-radius:${d.tile}px;background:${e.surface};border:1px solid ${e.edge};}
.vk-badge .vk-bic{width:56px;height:56px;border-radius:${d.pill}px;display:inline-flex;align-items:center;justify-content:center;
  background:${e.raised};border:1px solid ${e.edge};color:${e.inkFaint};}
.vk-badge .vk-bic i{display:block;width:28px;height:28px;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
.vk-badge b{font:700 ${i.label}px ${F};letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.inkDim};}
.vk-badge small{font-size:${i.micro}px;line-height:1.4;color:${e.inkFaint};}
.vk-badge .pk-progress{height:4px;margin-top:${a.xs}px;}
.vk-badge.is-got{border-color:${e.ctaEdge};background:${e.ctaTint};}
.vk-badge.is-got .vk-bic{background:${e.ctaGrad};border-color:${e.ctaA};color:${e.ctaInk};filter:drop-shadow(0 0 6px rgba(${e.ctaRGB},0.45));}
.vk-badge.is-got b{color:${e.ctaA};}
.vk-draft{margin:${a.sm}px 0 0;font-size:${i.micro}px;color:${e.inkFaint};}
/* ZOZNAM ZVITKOV — riadok s náhľadom 3:4 */
.vk-list{display:flex;flex-direction:column;}
.vk-row{display:flex;align-items:center;gap:${a.md}px;padding:${a.sm}px 0;cursor:pointer;background:none;border:0;
  border-bottom:1px solid ${e.edge};text-align:left;color:${e.ink};font-family:${u};}
.vk-row:last-child{border-bottom:0;}
.vk-row img{flex:none;width:42px;aspect-ratio:3/4;object-fit:cover;border-radius:${d.field}px;}
.vk-row > span{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px;}
.vk-row em{font-style:normal;font-size:${i.body}px;line-height:1.35;}
.vk-row small{font-size:${i.label}px;color:${e.inkFaint};}
.vk-row .vk-ok{flex:none;color:rgb(${pe.read});}
.vk-row .pk-progress{height:4px;margin-top:${a.xs}px;}
.vk-none{font-size:${i.label}px;color:${e.inkFaint};}
.vk-req{padding:${a.sm}px 0;border-bottom:1px solid ${e.edge};font-size:${i.body}px;}
.vk-req:last-child{border-bottom:0;}
.vk-req small{display:block;font-size:${i.label}px;color:${e.inkFaint};}
.vk-req p{margin:${a.xs}px 0 0;color:${e.inkDim};}
.vk .zv-box h3{display:flex;align-items:center;gap:${a.sm}px;}
.vk .zv-box h3 svg{flex:none;}
`;function Mi({scrolls:o,lang:r,avatarUrl:l,avatarInitial:n,who:p,worldName:v,onClose:$,onOpen:z}){const w=qa(r),h=Ti[w],S=Rt(),f=Oi(),K=ki(),L=mi(),_=g.useRef(null);g.useEffect(()=>{const x=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=x}},[]);const V=g.useMemo(()=>{const x=Object.values(S),O=new Map(o.map(N=>[N.id,N])),R=x.filter(Ka),U=x.filter(N=>N.listened_at),H=x.reduce((N,ee)=>N+(ee.listen_sec||0),0),fe=ce.reduce((N,ee)=>N+ee.scrolls,0),re=N=>R.filter(ee=>{var ne;return((ne=O.get(ee.scroll_id))==null?void 0:ne.world)===N}).length,$e=ce.map(N=>({w:N,n:re(N.key)})),xe=new Map;for(const N of o)xe.set(`${N.world}-${N.okruh}`,[...xe.get(`${N.world}-${N.okruh}`)||[],N]);const he=x.filter(N=>N.listen_sec>0&&!N.listened_at&&O.get(N.scroll_id)).map(N=>{const ee=O.get(N.scroll_id),ne=ee.pod[N.listen_langs[N.listen_langs.length-1]]||Object.values(ee.pod)[0];return{z:ee,r:N,pct:ne!=null&&ne.sec?Math.min(100,Math.round(N.listen_sec/ne.sec*100)):0,len:(ne==null?void 0:ne.sec)||0}}),Ae=N=>x.filter(N).sort((ee,ne)=>(ne.updated_at||"").localeCompare(ee.updated_at||"")).map(ee=>O.get(ee.scroll_id)).filter(Boolean);return{done:R.length,listened:U.length,min:Math.round(H/60),total:fe,pct:R.length?Math.max(1,Math.round(R.length/fe*100)):0,worlds:$e,lit:$e.filter(N=>N.n>0).length,circles:[...xe.values()],going:he,liked:Ae(N=>N.liked),saved:Ae(N=>N.saved),badges:Lo.map(N=>({b:N,have:Math.max(N.have({reads:x,scrolls:o,requests:f,ev:K}),L[N.id]?N.goal:0)}))}},[S,o,f,K,L]),ie=x=>{var R;const O=(R=Dt[x.world])==null?void 0:R[x.okruh-1];return O?w==="en"?O.en:O.sk:x.circle},Q=(x,O)=>{const R=S[x.id];return t.jsxs("button",{type:"button",className:"vk-row",onClick:()=>z(x.id),children:[x.img&&t.jsx("img",{src:x.img,alt:"",loading:"lazy"}),t.jsxs("span",{children:[t.jsx("em",{children:Ve(x,r).t}),t.jsxs("small",{children:[ie(x)," · ",x.n,"/",x.total]}),O]}),Ka(R)&&t.jsx("span",{className:"vk-ok",children:t.jsx(ja,{size:16})})]},x.id)},le=x=>new Date(x).toLocaleDateString(w==="cs"?"cs-CZ":w==="sk"?"sk-SK":"en-GB");return t.jsxs("div",{className:"zv-veil",ref:_,role:"dialog","aria-modal":"true","aria-label":h.title,children:[t.jsx("div",{className:"zv-bg","aria-hidden":!0}),t.jsxs("div",{className:"zv-wrap pk-stage vk",children:[t.jsx(Et,{tone:"ainubis",onClick:$,label:h.back,className:"zv-back"}),t.jsxs("header",{className:"vk-head",children:[t.jsx("span",{className:"pk-medallion pk-medallion--md",style:{width:io.md,height:io.md},children:l?t.jsx("img",{src:l,alt:""}):n}),t.jsxs("div",{children:[t.jsx("span",{className:"zv-meta",children:h.eyebrow}),t.jsx("h1",{className:"zv-h",children:h.title}),p&&t.jsx("span",{className:"vk-who",children:p})]})]}),t.jsxs("div",{className:"vk-kpis",children:[t.jsxs("div",{className:"vk-kpi vk-kpi--read",children:[t.jsxs("b",{children:[V.done,t.jsxs("small",{children:[" / ",V.total]})]}),t.jsx("span",{children:h.read})]}),t.jsxs("div",{className:"vk-kpi",children:[t.jsx("b",{children:V.listened}),t.jsx("span",{children:h.listened}),t.jsxs("i",{children:[V.min," ",h.minutes]})]}),t.jsxs("div",{className:"vk-kpi",children:[t.jsxs("b",{children:[V.pct," %"]}),t.jsx("span",{children:h.vault})]}),t.jsxs("div",{className:"vk-kpi",children:[t.jsxs("b",{children:[V.lit,t.jsxs("small",{children:[" / ",ce.length]})]}),t.jsx("span",{children:h.worldsLit})]})]}),V.circles.length>0&&t.jsxs("section",{className:"zv-box",children:[t.jsx("h3",{className:"zv-sec",children:h.circles}),V.circles.map(x=>{const O=x.filter(R=>Ka(S[R.id])).length;return t.jsxs("div",{className:"vk-circle",children:[t.jsxs("header",{children:[t.jsxs("span",{children:[v(x[0].world)," · ",ie(x[0])]}),t.jsxs("small",{children:[O," / ",x[0].total]})]}),t.jsx("div",{className:"vk-dots",children:x.map(R=>{const U=S[R.id],H=Ka(U)?2:U!=null&&U.seen_at?1:0;return t.jsx("button",{type:"button",className:"vk-dot","data-s":H,title:`${Ve(R,r).t} · ${h.states[H]}`,"aria-label":`${Ve(R,r).t} · ${h.states[H]}`,onClick:()=>z(R.id),children:R.n},R.id)})})]},`${x[0].world}-${x[0].okruh}`)})]}),t.jsxs("section",{className:"zv-box",children:[t.jsx("h3",{className:"zv-sec",children:h.worlds}),V.worlds.map(({w:x,n:O})=>t.jsxs("div",{className:"vk-world",style:{"--vk-w":To[x.key]||e.cyanRGB},children:[t.jsx("i",{className:"zv-ic","aria-hidden":!0,style:{WebkitMaskImage:`url(/icons/pack/${x.ic}.svg)`,maskImage:`url(/icons/pack/${x.ic}.svg)`}}),t.jsx("em",{children:v(x.key)}),t.jsxs("small",{children:[O," / ",x.scrolls]}),t.jsx("div",{className:"pk-progress",children:t.jsx("div",{className:"pk-progress__fill",style:ft(O/Math.max(1,x.scrolls))})})]},x.key))]}),t.jsxs("section",{className:"zv-box",children:[t.jsxs("h3",{className:"zv-sec",children:[h.badges," · ",V.badges.filter(x=>x.have>=x.b.goal).length," / ",V.badges.length]}),t.jsx("div",{className:"vk-badges",children:V.badges.map(({b:x,have:O})=>{const R=O>=x.goal;return t.jsxs("div",{className:`vk-badge${R?" is-got":""}`,title:x.how[w],children:[t.jsx("span",{className:"vk-bic",children:t.jsx("i",{style:{"--ic":`url(/icons/pack/${x.ic}.svg)`}})}),t.jsx("b",{children:x.name[w]}),t.jsxs("small",{children:[R?h.got:`${h.more} ${x.goal-O}`," · ",x.how[w]]}),!R&&x.goal>1&&t.jsx("div",{className:"pk-progress",children:t.jsx("div",{className:"pk-progress__fill",style:ft(O/x.goal)})})]},x.id)})}),t.jsx("p",{className:"vk-draft",children:h.draft})]}),V.going.length>0&&t.jsxs("section",{className:"zv-box",children:[t.jsx("h3",{className:"zv-sec",children:h.going}),t.jsx("div",{className:"vk-list",children:V.going.map(({z:x,r:O,pct:R,len:U})=>Q(x,t.jsxs(t.Fragment,{children:[t.jsxs("small",{children:[ia(Math.min(O.listen_sec,U))," / ",ia(U)," · ",R," %"]}),t.jsx("div",{className:"pk-progress",children:t.jsx("div",{className:"pk-progress__fill",style:ft(R/100)})})]})))})]}),t.jsxs("section",{className:"zv-box",children:[t.jsxs("h3",{className:"zv-sec",children:[t.jsx(It,{size:16,on:!0}),h.liked," · ",V.liked.length]}),V.liked.length?t.jsx("div",{className:"vk-list",children:V.liked.map(x=>Q(x))}):t.jsx("p",{className:"vk-none",children:h.noneLiked})]}),t.jsxs("section",{className:"zv-box",children:[t.jsxs("h3",{className:"zv-sec",children:[t.jsx(Co,{size:16,filled:!0}),h.saved," · ",V.saved.length]}),V.saved.length?t.jsx("div",{className:"vk-list",children:V.saved.map(x=>Q(x))}):t.jsx("p",{className:"vk-none",children:h.noneSaved})]}),t.jsxs("section",{className:"zv-box zv-box--you",children:[t.jsxs("h3",{className:"zv-sec",children:[h.mine," · ",f.length]}),f.length?f.map(x=>{const O=o.find(R=>R.id===x.scroll_id);return t.jsxs("div",{className:"vk-req",children:[t.jsxs("small",{children:[h.kinds[x.kind],x.lang?` · ${x.lang.toUpperCase()}`:""," · ",le(x.created_at)," · ",h.status[x.status]||x.status]}),O&&t.jsx("b",{children:Ve(O,r).t}),x.body&&t.jsx("p",{children:x.body})]},x.id)}):t.jsx("p",{className:"vk-none",children:h.noneMine})]})]})]})}const Wa=({ic:o})=>t.jsx("i",{className:"zv-ic","aria-hidden":!0,style:{WebkitMaskImage:`url(/icons/pack/${o}.svg)`,maskImage:`url(/icons/pack/${o}.svg)`}}),Ha=(o,r)=>{var n;const l=(n=Dt[o.world])==null?void 0:n[o.okruh-1];return l?r==="sk"||r==="cs"?l.sk:l.en:o.circle},Di={sk:{scroll:"Zvitok",min:"min",read:"Prečítať znalosť",listen:"Vypočuť podcast",pod:"Podcast",src:"Zdroje",sd:"Dôkaz",sdName:["","C · tradícia, skúsenosť, legenda","B · veda + výklad, alebo zatiaľ málo štúdií","A · zmerané, vedci sa zhodujú"],like:"Páči sa",del:"Zmazať",delAsk:"Zmazať komentár?",delNo:"Nechať",save:"Uložiť",share:"Zdieľať",talk:"Diskusia",readDone:"Prečítané",talkNone:"Zatiaľ tu nikto nenapísal. Začni ty — otázka, skúsenosť, nesúhlas.",talkPh:"Napíš do diskusie…",talkSend:"Pridať",you:"Ty",back:"Späť",added:"Doplnené",addedNone:"Zatiaľ nič nové. Keď pribudne poznatok, ktorý nie je v podcaste, zapíše sa sem s dátumom.",rel:"Súvisí",contrib:"Prispej",cEdit:"Navrhnúť zmenu",kinds:["Pridať novú znalosť k téme","Nahlásiť chybné tvrdenie","Vlastný text"],propPh:"Napíš, čo chýba alebo čo nesedí. Ak máš zdroj, pridaj odkaz.",propSend:"Odoslať AINUBISOVI",propOk:"Odoslané — AINUBIS to posúdi a overí zdroj.",photo:"Fotka",done:"Prečítané — zapíš do mozgu",doneSub:"krúžok zozelenie a zrno v mozgu sa rozsvieti",doneOk:"Zapísané do mozgu",copied:"Odkaz skopírovaný",tr:"Prepis",trHide:"Skryť prepis",other:"Iný jazyk",reqTitle:"Podcast v tvojom jazyku",reqText:"Základ je SK · EN · CZ. Iný jazyk vznikne, keď oň požiada prvý člen — potom ostane pre všetkých.",reqBtn:"Požiadať",reqOk:"Žiadosť zapísaná. Keď podcast vznikne, dáme ti vedieť."},cs:{scroll:"Svitek",min:"min",read:"Přečíst znalost",listen:"Poslechnout podcast",pod:"Podcast",src:"Zdroje",sd:"Důkaz",sdName:["","C · tradice, zkušenost, legenda","B · věda + výklad, nebo zatím málo studií","A · změřeno, vědci se shodují"],like:"Líbí se",del:"Smazat",delAsk:"Smazat komentář?",delNo:"Nechat",save:"Uložit",share:"Sdílet",talk:"Diskuse",readDone:"Přečteno",talkNone:"Zatím tu nikdo nenapsal. Začni ty — otázka, zkušenost, nesouhlas.",talkPh:"Napiš do diskuse…",talkSend:"Přidat",you:"Ty",back:"Zpět",added:"Doplněno",addedNone:"Zatím nic nového. Když přibude poznatek, který není v podcastu, zapíše se sem s datem.",rel:"Souvisí",contrib:"Přispěj",cEdit:"Navrhnout změnu",kinds:["Přidat novou znalost k tématu","Nahlásit chybné tvrzení","Vlastní text"],propPh:"Napiš, co chybí nebo co nesedí. Pokud máš zdroj, přidej odkaz.",propSend:"Odeslat AINUBISOVI",propOk:"Odesláno — AINUBIS to posoudí a ověří zdroj.",photo:"Fotka",done:"Přečteno — zapiš do mozku",doneSub:"kroužek zezelená a zrno v mozku se rozsvítí",doneOk:"Zapsáno do mozku",copied:"Odkaz zkopírován",tr:"Přepis",trHide:"Skrýt přepis",other:"Jiný jazyk",reqTitle:"Podcast ve tvém jazyce",reqText:"Základ je SK · EN · CZ. Jiný jazyk vznikne, když o něj požádá první člen — pak zůstane pro všechny.",reqBtn:"Požádat",reqOk:"Žádost zapsána. Až podcast vznikne, dáme ti vědět."},en:{scroll:"Scroll",min:"min",read:"Read the knowledge",listen:"Listen to the podcast",pod:"Podcast",src:"Sources",sd:"Evidence",sdName:["","C · tradition, experience, legend","B · science + interpretation, or few studies yet","A · measured, scientists agree"],like:"Like",del:"Delete",delAsk:"Delete comment?",delNo:"Keep",save:"Save",share:"Share",talk:"Discussion",readDone:"Read",talkNone:"Nobody has written here yet. Start — a question, an experience, a disagreement.",talkPh:"Write to the discussion…",talkSend:"Post",you:"You",back:"Back",added:"Added",addedNone:"Nothing new yet. When a finding that is not in the podcast arrives, it is written here with a date.",rel:"Related",contrib:"Contribute",cEdit:"Suggest a change",kinds:["Add new knowledge to the topic","Report a wrong claim","Own text"],propPh:"Write what is missing or wrong. If you have a source, add the link.",propSend:"Send to AINUBIS",propOk:"Sent — AINUBIS will review it and check the source.",photo:"Photo",done:"Read — write it into the brain",doneSub:"the ring turns green and the grain lights up",doneOk:"Written into the brain",copied:"Link copied",tr:"Transcript",trHide:"Hide transcript",other:"Other language",reqTitle:"Podcast in your language",reqText:"The base is SK · EN · CZ. Another language is made when the first member asks for it — then it stays for everyone.",reqBtn:"Request",reqOk:"Request saved. We will let you know when the podcast is ready."}},la=o=>Di[qa(o)],So=["","C","B","A"],Ci="#FF8AC8",Bi=`
${Ro}
:root{--zv-read:rgb(${pe.read});}
/* KRÚŽOK STAVU — biely obrys · plný oranžový (videné) · zelený s ✓ (hotovo). Farby BRAIN_STATE. */
.zv-tip{position:absolute;z-index:5;width:240px;padding:${a.sm}px ${a.md}px;border-radius:${d.tile}px;
  background:${e.surfaceBase};border:1px solid ${e.edge};color:${e.ink};text-align:left;
  font:400 ${i.label}px/1.5 ${u};letter-spacing:0;text-transform:none;pointer-events:none;
  opacity:0;transition:opacity 150ms ease;}
/* AKCIE — pod obrazom na PC aj mobile (Matej 3. 10.) */
.zv-acts{display:flex;align-items:center;justify-content:space-around;margin-top:${a.sm}px;
  padding:${a.xs}px ${a.sm}px;border-radius:${d.pill}px;background:${e.surface};border:1px solid ${e.edge};}
/* AKCIE = JEDNA PILULKA cez celú šírku obrazu, ikonky ako na IG (Matej 3. 10.: „do jedného pilu… roztiahnuť po celej
   šírke obrázka… nefarbiť krúžky, iba ikonky"). Bez krúžkov a výplní — farbu nesie len ikonka; zapnutá = farebná. */
.zv-act{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:${a.xs}px;
  min-width:44px;height:36px;padding:0 ${a.sm}px;border-radius:${d.pill}px;cursor:pointer;
  background:none;border:0;color:${e.ink};font:500 ${i.label}px ${u};transition:color 150ms ease;}
/* FARBY IKONIEK — Matej 3. 10.: „labka cyan neónová žiariaca, hviezdička žltá, komenty ružová, zdieľanie zelená“.
   ⚠️ RUŽOVÁ nie je v palete AINUBISA (nová, ZV_PINK) · ZELENÁ zdieľania je tá istá ako „prečítané“ (BRAIN_STATE.read)
   — flagnuté Matejovi, zatiaľ podľa neho. Zapnutá akcia = ikonka žiari (drop-shadow, nie box-shadow). */
.zv-act{opacity:.9;}
.zv-act:hover{opacity:1;}
.zv-act[data-k="like"]{color:${e.cyan};filter:drop-shadow(0 0 2px rgba(${e.cyanRGB},0.4));}
.zv-act[data-k="save"]{color:${e.ctaA};}
.zv-act[data-k="talk"]{color:${Ci};}
.zv-act[data-k="share"]{color:var(--zv-read);}
/* Žiara len jemná (Matej 4. 10.: „nerob takú žiaru na ikonkách, packa je celá rozmazaná“). */
.zv-act.is-on{opacity:1;filter:drop-shadow(0 0 3px rgba(${e.cyanRGB},0.35));}
.zv-act .zv-ic{margin-right:0;width:20px;height:20px;}
.zv-n{font:500 ${i.label}px ${u};color:${e.ink};min-width:1ch;}
/* SILA DÔKAZU */
.zv-sd{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:0 0 auto;
  border-radius:${d.field}px;font:700 ${i.lead}px ${F};cursor:help;
  color:var(--zv-g);border:1px solid var(--zv-g);background:var(--zv-gt);}
.zv-sd[data-g="A"]{--zv-g:rgb(${pe.read});--zv-gt:rgba(${pe.read},0.14);}
.zv-sd[data-g="B"]{--zv-g:rgb(${pe.seen});--zv-gt:rgba(${pe.seen},0.14);}
.zv-sd[data-g="C"]{--zv-g:${e.inkDim};--zv-gt:${e.surface};}
.zv-sd .zv-tip{top:36px;left:0;}
.zv-sd--corner{position:absolute;top:0;right:0;z-index:3;width:44px;height:44px;font-size:${i.h2}px;
  border-width:0 0 1px 1px;border-radius:0 ${d.card-1}px 0 ${d.tile}px;}
/* Známka je NEPRIEHĽADNÁ (Matej 5. 10.: „nesmie byť priesvitná") — tint leží na plnom podklade. */
.zv-sd{background:linear-gradient(var(--zv-gt),var(--zv-gt)),${e.surfaceBase};}
/* Na karte v zozname sedí v textovom bloku: mobil = roh pri nadpise, PC = roh karty. */
.akv-zvt{position:relative;align-self:stretch;}
.akv-zvt > .zv-sd--corner{border-width:1px;border-radius:${d.field}px;}
.zv-sd--corner .zv-tip{top:52px;left:auto;right:0;}
.zv-sd:hover .zv-tip,.zv-sd:focus-visible .zv-tip{opacity:1;}
.zv-read{align-self:stretch;display:flex;align-items:center;justify-content:center;gap:${a.sm}px;cursor:pointer;
  padding:${a.sm}px ${a.lg}px;border-radius:${d.field}px;background:${e.surface};
  border:1px solid ${e.edgeStrong};color:${e.ink};font-family:${F};font-weight:700;
  font-size:${i.label}px;letter-spacing:${y.card.letterSpacing};text-transform:uppercase;}
.zv-read:hover{border-color:${e.cyan};}
/* HOTOVO = PLNÁ zelená s tmavým inkoustom (Matej: „treba viac zvýrazniť, teraz je to prehliadnuteľné“). */
.zv-read.is-done{background:var(--zv-read);border-color:var(--zv-read);color:#03140A;outline:3px solid rgba(${pe.read},0.28);outline-offset:2px;}
.zv-badge{display:inline-flex;align-items:center;gap:${a.xs}px;padding:${a.xs}px ${a.md}px;border-radius:${d.pill}px;
  background:var(--zv-read);color:#03140A;font:700 ${i.label}px ${F};letter-spacing:${y.card.letterSpacing};text-transform:uppercase;
  outline:3px solid rgba(${pe.read},0.28);outline-offset:2px;}
/* NÁHĽAD /magnet — zvitok mimo darčeka: viditeľný, stlmený, so zámkom z kitu. */
.akv-zv--locked .akv-zvimg img{filter:saturate(.55) brightness(.7);}
.akv-zv--locked .zv-read{border-style:dashed;color:${e.inkDim};}
.zv-lockbadge{position:absolute;top:${a.sm}px;left:${a.sm}px;z-index:2;display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:${d.pill}px;background:${e.surfaceBase};border:1px solid ${e.ctaEdge};color:${e.ctaA};}
/* ČIARA POD NADPISOM — zlatá niť AINUBISA, ktorá doznie do tmy (Matej: „chýba vizuál… pod nadpisom línia"). */
.zv-rule{display:block;height:2px;width:100%;max-width:160px;border-radius:${d.pill}px;
  background:linear-gradient(90deg, ${e.ctaA} 0%, ${e.ctaB} 40%, transparent 100%);}
.zv-mid{align-self:stretch;display:flex;flex-direction:column;align-items:flex-start;gap:${a.sm}px;}
.zv-mid > *{align-self:stretch;}
.zv-ctas{align-self:stretch;display:flex;flex-direction:column;gap:${a.sm}px;}
.zv-ctas .akv-zvsec{flex:none;}
.zv-hl{display:flex;align-items:flex-start;gap:${a.sm}px;}
.zv-hl > :first-child{flex:1 1 auto;min-width:0;}
/* „Vezmi si z toho" — blok bez nadpisu (Matej: „nechaj to v bloku"), menšie písmo. */
.zv-take{align-self:stretch;padding:${a.sm}px ${a.md}px;border-radius:${d.tile}px;
  background:${e.ctaTint};border-left:2px solid ${e.ctaA};
  font-size:${i.label}px;line-height:1.5;color:${e.ink};font-style:italic;}
/* Kurzíva — Matej 3. 10.: „nech je to trošku zaujímavejšie“. ⚠️ Space Grotesk kurzívu nemá, prehliadač ju šikmí sám. */

/* ── ČLÁNOK ZVITKU (kôš 2) ── */
.zv-veil{position:fixed;inset:0;z-index:39;overflow-y:auto;-webkit-overflow-scrolling:touch;
  background:${e.surfaceBase};color:${e.ink};font-family:${u};}
/* SCI-FI DOSKA (Matej 4. 10.: „pozadie nie len tmavé, ale blok z liquid skla a za tým jemné mriežky ako má AINUBIS,
   nech to vytvorí 3D efekt sci-fi informácií"). Mriežka = tá istá ako .akv-bg v PackAinubis; stojí FIXNE, sklo nad ňou
   scrolluje ⇒ hĺbka. Sklo = SKLENENÁ DOSKA .pk-stage (STAGE_CSS, katalóg) vo farbe AINUBISA cez --pk-stage;
   AI_GLASS nie — má plnú výplň a mriežku by zakryl. */
.zv-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(${e.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${e.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(rgba(${e.cyanRGB},0.10) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${e.cyanRGB},0.10) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,192px 192px,192px 192px;}
.zv-bg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(60vw 60vw at 85% 10%,rgba(${e.cyanRGB},0.14),transparent 62%),
             radial-gradient(55vw 55vw at 10% 95%,rgba(${e.glowRGB},0.12),transparent 62%);}
/* ŠÍRKA = článok výletu (Matej 4. 10.: „detail zvitku by mal byť takej istej šírky ako je trip blog") —
   ten istý stĺpec PACK_COL_FIT + packColCSS ako .pta-shell, nie vlastných 880. */
.zv-wrap{position:relative;z-index:1;${hn}margin:${a.lg}px auto calc(var(--pack-nav-h, 112px) + ${a.xl}px);
  padding:${a.lg}px ${a.lg}px ${a.xl}px;box-shadow:${e.panelShadow};
  --pk-stage:linear-gradient(180deg,rgba(${e.cyanRGB},0.07) 0%,rgba(4,8,14,0.55) 22%,rgba(4,8,14,0.62) 100%);
  --pk-stage-edge:${e.edge};}
${vn(".zv-wrap")}
@media (max-width:767px){.zv-wrap{margin-top:${a.md}px;margin-bottom:calc(var(--pack-nav-h, 112px) + ${a.lg}px);padding:${a.md}px;}}
@media (min-width:768px){.zv-wrap{padding:${a.xl}px;}}
.zv-back{margin-bottom:${a.md}px;}
.zv-top{display:grid;grid-template-columns:1fr;gap:${a.lg}px;}
@media (min-width:768px){.zv-top{grid-template-columns:280px 1fr;}}
.zv-hero img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${d.tile}px;}
.zv-head{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:${a.lg}px;min-width:0;
  padding:${a.lg}px;border-radius:${d.card}px;${Te}}
/* Pravá časť je JEDEN blok (Matej 4. 10.: „pravú časť vedľa obrázka dať do bloku a lepšie poukladať, teraz je to rozhádzané").
   Skupiny oddeľuje tenká čiara, podcast sedí na dne bloku. */
.zv-head > .zv-grp + .zv-grp{padding-top:${a.lg}px;border-top:1px solid ${e.edge};}
.zv-head > .zv-pod{margin-top:auto;}
/* miesto pre známku v rohu: meta aj nadpis nesmú vbehnúť pod ňu */
.zv-head .zv-meta,.zv-head .zv-h{padding-right:${a.xxxl}px;}
.zv-grp{display:flex;flex-direction:column;align-items:flex-start;gap:${a.md}px;}
/* PC: úvod sa rozloží po výške obrazu — nadpis hore, veta s blokom v strede, podcast dole
   (Matej 3. 10.: „úvod sa mi na PC nepáči, vyzerá to natlačené na sebe"). */
@media (min-width:768px){.zv-head{padding:${a.xl}px;}}
.zv-meta{font-size:${i.micro}px;letter-spacing:${y.section.letterSpacing};text-transform:uppercase;color:${e.cyan};padding-right:${a.xl}px;}
.zv-h{margin:0;font-family:${F};font-weight:700;font-size:${i.h2}px;line-height:1.2;
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;overflow-wrap:anywhere;}
.zv-v{margin:0;font-size:${i.body}px;line-height:1.6;color:${e.inkDim};}
/* PODCAST — cyan NEÓN (Matej 3. 10.: „podcast by som dal cyanom neónom tam, kde sa prehráva"). Žiara cez
   filter (box-shadow by zhodil check:pack); keď hrá, rozsvieti sa naplno. */
.zv-pod{align-self:stretch;padding:${a.md}px;border-radius:${d.card}px;background:${e.raised};
  border:1px solid ${e.cyan};filter:drop-shadow(0 0 6px rgba(${e.cyanRGB},0.45));transition:filter 200ms ease;}
.zv-pod.is-play{filter:drop-shadow(0 0 14px rgba(${e.cyanRGB},0.85));}
.zv-pod small{display:flex;align-items:center;gap:${a.xs}px;margin-bottom:${a.sm}px;
  font:700 ${i.label}px ${F};letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.cyan};}
/* hlavička podcastu: názov vľavo, jazyky vpravo (Matej 4. 10.: „pri tlačidle prehrať výber jazykov") */
.zv-pod small{justify-content:space-between;flex-wrap:wrap;}
.zv-pod small > span{display:inline-flex;align-items:center;gap:${a.xs}px;}
/* Jazyk = rozbaľovač (Matej 4. 10.: „jazyk daj do dropdownu, podľa jazyka člena, posledná možnosť pridať iný jazyk, vedľa prepis"). */
.zv-ptools{flex:none;display:inline-flex;align-items:center;gap:${a.sm}px;}
.zv-plang{flex:none;cursor:pointer;padding:${a.xs}px ${a.xl}px ${a.xs}px ${a.md}px;
  border-radius:${d.pill}px;background:${e.raised} no-repeat right ${a.sm}px center / 10px 10px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1 3l4 4 4-4' fill='none' stroke='%235BE0F0' stroke-width='1.6'/%3E%3C/svg%3E");
  border:1px solid ${e.cyan};color:${e.cyan};font:700 ${i.label}px ${u};letter-spacing:.02em;}
.zv-pdd{position:relative;display:inline-flex;}
.zv-pmenu{position:absolute;top:calc(100% + ${a.xs}px);right:0;z-index:6;display:flex;flex-direction:column;min-width:160px;
  padding:${a.xs}px;border-radius:${d.tile}px;background:${e.surfaceBase};border:1px solid ${e.edgeStrong};}
.zv-pmenu button{padding:${a.sm}px ${a.md}px;border-radius:${d.field}px;cursor:pointer;text-align:left;background:transparent;
  border:0;color:${e.ink};font:500 ${i.body}px ${u};letter-spacing:0;text-transform:none;}
.zv-pmenu button:hover,.zv-pmenu button.is-on{background:${e.raised};color:${e.cyan};}
.zv-pmenu .zv-padd{margin-top:${a.xs}px;border-top:1px solid ${e.edge};border-radius:0 0 ${d.field}px ${d.field}px;color:${e.inkDim};}
.zv-ptr{padding:${a.xs}px ${a.md}px;border-radius:${d.pill}px;cursor:pointer;background:transparent;
  border:1px solid ${e.edge};color:${e.inkDim};font:500 ${i.label}px ${u};text-transform:none;letter-spacing:0;}
.zv-ptr.is-on{border-color:${e.cyan};color:${e.cyan};}
/* PREHRÁVAČ — vlastný, cyan neón s tmavým ovládaním (Matej 4. 10.: „sivý blok prehrávača… výplň cyanová/neónová,
   text a čísla tmavé ako pozadie“). Natívne ovládanie prehliadača sa farbiť nedá. */
.zv-player{display:flex;align-items:center;gap:${a.md}px;padding:${a.sm}px ${a.md}px;border-radius:${d.pill}px;
  background:${e.cyan};color:${e.bgDeep};filter:drop-shadow(0 0 8px rgba(${e.cyanRGB},0.55));}
.zv-pbtn{flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:${d.pill}px;
  cursor:pointer;background:${e.bgDeep};color:${e.cyan};border:0;padding:0;}
.zv-pbtn .zv-ic{margin:0 0 0 2px;width:16px;height:16px;}
.zv-pause{display:inline-flex;gap:4px;}
.zv-pause i{display:block;width:4px;height:14px;border-radius:${d.pill}px;background:currentColor;}
.zv-ptime{flex:none;font:600 ${i.label}px ${u};font-variant-numeric:tabular-nums;}
.zv-pbar{flex:1 1 auto;min-width:0;height:6px;margin:0;cursor:pointer;-webkit-appearance:none;appearance:none;border-radius:${d.pill}px;
  background:linear-gradient(90deg, ${e.bgDeep} var(--p,0%), rgba(0,0,0,0.22) var(--p,0%));}
.zv-pbar::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:${d.pill}px;background:${e.bgDeep};border:0;}
.zv-pbar::-moz-range-thumb{width:14px;height:14px;border-radius:${d.pill}px;background:${e.bgDeep};border:0;}
/* GALÉRIA — klik na obraz otvorí väčší a so šípkami aj obrazy z článku (Matej 4. 10.). */
.zv-hero img{cursor:zoom-in;}
.zv-gal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;gap:${a.md}px;
  padding:${a.xxxl}px ${a.lg}px;background:rgba(1,5,10,0.94);}
.zv-gal img{display:block;max-width:min(100%, 640px);max-height:calc(100dvh - 140px);object-fit:contain;border-radius:${d.tile}px;}
.zv-gal figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:${a.sm}px;max-height:100%;min-width:0;}
.zv-gal figcaption{font-size:${i.label}px;color:${e.inkFaint};}
.zv-gnav{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:${d.pill}px;cursor:pointer;
  background:${e.raised};border:1px solid ${e.edgeStrong};color:${e.cyan};}
.zv-gnav:disabled{opacity:.3;cursor:default;}
.zv-gback{position:absolute;top:${a.lg}px;left:${a.lg}px;}
@media (max-width:767px){.zv-gal{padding:${a.xxxl}px ${a.sm}px;}.zv-gnav{position:absolute;bottom:${a.lg}px;}
  .zv-gnav--prev{left:calc(50% - 56px);}.zv-gnav--next{right:calc(50% - 56px);}}
.zv-tr{margin-top:${a.md}px;max-height:360px;overflow-y:auto;padding-right:${a.sm}px;
  font-size:${i.body}px;line-height:1.6;color:${e.inkDim};}
.zv-tr p{margin:0 0 ${a.sm}px;}
.zv-tr b{display:inline-block;min-width:72px;font:700 ${i.micro}px ${u};letter-spacing:.02em;text-transform:uppercase;color:${e.inkFaint};}
.zv-tr b.is-ai{color:${e.ink};}
.zv-tr b.is-ai span{color:${e.aiInk};}
.zv-req{margin-top:${a.md}px;font-size:${i.label}px;line-height:1.5;color:${e.inkDim};}
.zv-req > div{display:flex;gap:${a.sm}px;margin-top:${a.sm}px;}
.zv-req select{flex:1 1 auto;min-width:0;padding:${a.sm}px;border-radius:${d.field}px;background:${e.bgDeep};
  border:1px solid ${e.edge};color:${e.ink};font:500 ${i.body}px ${u};}
.zv-req button{flex:none;padding:${a.sm}px ${a.lg}px;border-radius:${d.field}px;cursor:pointer;
  background:${e.raised};border:1px solid ${e.cyan};color:${e.cyan};font:700 ${i.label}px ${F};
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;}
.zv-req .zv-ok{margin-top:${a.sm}px;}
/* ČLENITOSŤ PRÍBEHU (Matej 4. 10.: „chýba rozmanitosť odsekov, roky, odrážky… obrázky, ktoré sme nepoužili")
   — značky v príbehu d: ◷ ROK | text = časová os · » = zvýraznený fakt · ▣ B | popis = nepoužitý obraz. */
.zv-yr{color:${e.ctaA};font-weight:600;}
.zv-tl{list-style:none;margin:${a.xl}px 0;padding:0 0 0 ${a.lg}px;border-left:2px solid ${e.ctaEdge};}
.zv-tl li{position:relative;margin:0 0 ${a.lg}px;}
.zv-tl li:last-child{margin-bottom:0;}
.zv-tl li::before{content:'';position:absolute;left:-${a.lg+6}px;top:4px;width:10px;height:10px;border-radius:${d.pill}px;background:${e.ctaA};}
.zv-tl b{display:block;font:700 ${i.label}px ${F};letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.ctaA};}
.zv-tl span{display:block;font-size:${i.body}px;line-height:1.6;}
.zv-fact{margin:${a.xl}px 0;padding:${a.sm}px 0 ${a.sm}px ${a.lg}px;border-left:2px solid ${e.ctaA};
  font:600 ${i.h2}px/1.45 ${u};color:${e.ink};}
.zv-fig{margin:${a.xl}px auto;max-width:420px;}
.zv-fig img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${d.tile}px;border:1px solid ${e.edge};}
.zv-fig figcaption{margin-top:${a.sm}px;font-size:${i.label}px;line-height:1.5;color:${e.inkFaint};text-align:center;}
.zv-body{margin-top:${a.xl}px;max-width:760px;font-size:${i.lead}px;line-height:1.75;font-weight:300;color:${e.inkDim};}
/* Tenší rez 300 (Matej 4. 10.: „písmo celého textu sa mi zdá dosť hrubé… nebolo by čitateľnejšie tenšie?"). Space Grotesk je načítaný 300–600. */
.zv-body b,.zv-body strong{font-weight:600;color:${e.ink};}
.zv-body p{margin:0 0 ${a.md}px;}
.zv-body ul{margin:0 0 ${a.lg}px;padding-left:${a.xl}px;list-style:disc;}
.zv-body ul li{margin-bottom:${a.sm}px;}
.zv-body ul li::marker{color:${e.ctaA};}
.zv-box{margin-top:${a.lg}px;padding:${a.md}px ${a.lg}px ${a.lg}px;border-radius:${d.card}px;${Te}
  border-top:2px solid var(--zv-bx, ${e.cyan});}
.zv-box .zv-sec{margin-top:${a.xs}px;font-size:${i.lead}px;color:var(--zv-bx, ${e.cyan});
  background:linear-gradient(90deg, var(--zv-bx, ${e.cyan}) 0%, transparent 60%) left bottom / 100% 1px no-repeat;}
.zv-box--src{--zv-bx:${e.ctaA};}
.zv-box--add{--zv-bx:${e.aiInk};}
.zv-box--you{--zv-bx:${e.danger};filter:drop-shadow(0 0 10px ${e.dangerEdge});}
/* NAVRHNÚŤ ZMENU — červené podsvietenie (Matej 3. 10.), po kliku tri druhy návrhu + text. */
.zv-prop{display:inline-flex;align-items:center;gap:${a.sm}px;cursor:pointer;padding:${a.sm}px ${a.lg}px;
  border-radius:${d.field}px;background:${e.dangerTint};border:1px solid ${e.danger};color:${e.danger};
  font:700 ${i.label}px ${F};letter-spacing:${y.card.letterSpacing};text-transform:uppercase;}
.zv-prop.is-open{background:${e.danger};color:${e.ctaInk};}
.zv-kinds{display:flex;flex-wrap:wrap;gap:${a.sm}px;margin:${a.md}px 0;}
.zv-kind{padding:${a.xs}px ${a.md}px;border-radius:${d.pill}px;cursor:pointer;background:transparent;
  border:1px solid ${e.dangerEdge};color:${e.ink};font:500 ${i.label}px ${u};}
.zv-kind.is-on{background:${e.dangerTint};border-color:${e.danger};color:${e.danger};}
.zv-ok{margin-top:${a.md}px;font-size:${i.label}px;color:${e.ok};}
/* komentár: labka s počtom + fotka */
.zv-cmt > div{flex:1 1 auto;min-width:0;}
.zv-cimg{display:block;max-width:100%;max-height:320px;margin-top:${a.sm}px;border-radius:${d.tile}px;}
.zv-clike{display:inline-flex;align-items:center;gap:${a.xs}px;margin-top:${a.xs}px;padding:0;cursor:pointer;
  background:none;border:0;color:${e.inkDim};font:500 ${i.label}px ${u};}
.zv-clike.is-on{color:${e.cyan};}
.zv-cdel{display:inline-flex;align-items:center;gap:${a.xs}px;padding:0;cursor:pointer;background:none;border:0;color:inherit;opacity:.7;font:500 ${i.label}px ${u};}
.zv-cdel.is-go{color:${e.cyan};opacity:1;}
.zv-cdel-ask{display:inline-flex;align-items:center;gap:${a.sm}px;font:500 ${i.label}px ${u};}
.zv-clike .zv-ic{margin-right:0;width:16px;height:16px;}
.zv-crow{display:flex;align-items:center;justify-content:space-between;align-self:stretch;gap:${a.sm}px;}
.zv-cpic{display:inline-flex;align-items:center;gap:${a.xs}px;cursor:pointer;color:${e.cyan};font:500 ${i.label}px ${u};}
.zv-cpic input{display:none;}
.zv-cprev{max-height:80px;border-radius:${d.field}px;}
.zv-box--talk{--zv-bx:${e.cyan};}
.zv-cmt{display:flex;gap:${a.sm}px;padding:${a.sm}px 0;border-bottom:1px solid ${e.edge};font-size:${i.body}px;}
.zv-cmt p{margin:${a.xs}px 0 0;color:${e.inkDim};}
.zv-cmt small{color:${e.inkFaint};font-size:${i.micro}px;}
.zv-cav{width:28px;height:28px;flex:0 0 auto;border-radius:${d.pill}
.zv-cav img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}px;display:flex;align-items:center;justify-content:center;
  background:${e.raised};border:1px solid ${e.edge};font-size:${i.label}px;}
.zv-cform{display:flex;flex-direction:column;align-items:flex-end;gap:${a.sm}px;margin-top:${a.md}px;}
.zv-cform textarea{align-self:stretch;resize:vertical;min-height:64px;padding:${a.sm}px ${a.md}px;border-radius:${d.field}px;
  background:${e.surface};border:1px solid ${e.edge};color:${e.ink};font:400 ${i.body}px ${u};}
.zv-cform textarea:focus{outline:none;border-color:${e.edgeStrong};}
.zv-chip:disabled{opacity:.5;cursor:default;}
/* NADPISY ČLÁNKU — Matej 3. 10.: „tie nadpisy modré sú malinké, nevýrazné… ľahko sa prehliadnu“.
   Tvar KARTY z PACK_HEAD (Cinzel 700/.14em), stupeň h2 20 px, svetlý inkoust + zlatá niť pod ním. */
.zv-sec{margin:${a.xxl}px 0 ${a.md}px;padding-bottom:${a.sm}px;font-family:${F};font-weight:700;
  font-size:${i.h2}px;line-height:1.25;letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.ink};
  background:linear-gradient(90deg, ${e.ctaA} 0%, ${e.ctaB} 25%, transparent 60%) left bottom / 100% 2px no-repeat;}
.zv-add{padding:${a.sm}px ${a.md}px;border-left:2px solid ${e.cyan};border-radius:0 ${d.tile}px ${d.tile}px 0;
  background:${e.raised};font-size:${i.label}px;color:${e.inkDim};}
.zv-src{margin:0;padding-left:${a.lg}px;font-size:${i.label}px;line-height:1.55;color:${e.inkDim};}
.zv-src li{margin-bottom:${a.xs}px;}
.zv-src a{color:${e.cyan};}
.zv-rel{display:flex;flex-wrap:wrap;gap:${a.sm}px;}
.zv-chip{padding:${a.sm}px ${a.md}px;border-radius:${d.field}px;cursor:pointer;
  background:transparent;border:1px solid ${e.edge};color:${e.cyan};font:500 ${i.label}px ${u};}
.zv-chip:hover{border-color:${e.edgeStrong};}
.zv-chip--dash{border-style:dashed;}
/* ZAPÍŠ DO MOZGU — hlavné CTA článku (Matej 3. 10.: „výraznejšie a krajšie, nech je ho vidno“).
   Plná plocha AINUBISOVHO CTA; po zápise sa prefarbí na zelenú BRAIN_STATE.read = to, čo sa stane v mozgu. */
.zv-done{display:flex;flex-direction:column;align-items:center;gap:${a.xs}px;width:100%;margin-top:${a.xl}px;
  padding:${a.lg}px ${a.xl}px;cursor:pointer;text-align:center;border-radius:${d.card}px;
  background:${e.ctaGrad};border:1px solid ${e.ctaEdge};color:${e.ctaInk};box-shadow:${e.ctaShadow};
  transition:transform 150ms ease;}
.zv-done:hover{transform:translateY(-1px);background:${e.ctaGradHover};}
.zv-done b{display:flex;align-items:center;gap:${a.sm}px;font:700 ${i.lead}px ${F};
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;}
.zv-done small{font-size:${i.label}px;opacity:.8;}
.zv-done.is-done{background:var(--zv-read);border-color:var(--zv-read);color:#03140A;cursor:default;transform:none;}
.zv-ic{display:inline-block;width:14px;height:14px;vertical-align:-2px;margin-right:${a.xs}px;background:currentColor;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.zv-chip svg{vertical-align:-2px;margin-right:${a.xs}px;}
.zv-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--pack-nav-h, 112px) + ${a.md}px);z-index:41;
  padding:${a.sm}px ${a.md}px;border-radius:${d.pill}px;background:${e.surfaceBase};
  border:1px solid ${e.edge};font-size:${i.label}px;color:${e.ink};}
`;function Xo({sd:o,lang:r,corner:l=!1}){const n=la(r);return o?t.jsxs("span",{className:`zv-sd${l?" zv-sd--corner":""}`,"data-g":So[o],tabIndex:0,"aria-label":`${n.sd} ${n.sdName[o]}`,children:[So[o],t.jsxs("span",{className:"zv-tip",role:"tooltip",children:[t.jsxs("b",{children:[n.sd," ",n.sdName[o]]}),t.jsx("br",{}),"A · B · C — ",n.sdName[3].slice(4)," → ",n.sdName[1].slice(4)]})]}):null}function Qo({id:o,lang:r,onShare:l,onTalk:n,lock:p}){const v=la(r),$=fi().includes(o),z=Ai(o),w=bi().includes(o),h=yi(o),S=h?h.likes:w?1:0,f=h?h.saves:$?1:0,[K,L]=g.useState(!1);return t.jsxs("div",{className:"zv-acts",children:[t.jsxs("button",{type:"button","data-k":"like",className:`zv-act${w?" is-on":""}`,onClick:p??(()=>gi(o)),"aria-label":v.like,children:[t.jsx(It,{size:20,on:w}),t.jsx("span",{className:"zv-n",children:S})]}),t.jsxs("button",{type:"button","data-k":"save",className:`zv-act${$?" is-on":""}`,onClick:p??(()=>hi(o)),"aria-label":v.save,children:[t.jsx(Co,{size:20,filled:$}),t.jsx("span",{className:"zv-n",children:f})]}),t.jsxs("button",{type:"button","data-k":"talk",className:`zv-act${z>0?" is-on":""}`,onClick:p??n,"aria-label":v.talk,children:[t.jsx(Wa,{ic:z>0?"chat-right-full":"chat"}),t.jsx("span",{className:"zv-n",children:z})]}),t.jsx("button",{type:"button","data-k":"share",className:`zv-act${K?" is-on":""}`,onClick:p??(()=>{l(),L(!0),window.setTimeout(()=>L(!1),1500)}),"aria-label":v.share,children:t.jsx(Fn,{size:20,filled:K})})]})}function Li({z:o,lang:r,worldName:l,onOpen:n,onShare:p,lock:v,locked:$}){const z=g.useRef(null),w=Ot()[o.id]||0,h=Ve(o,r),S=si(o,r),f=la(r);return g.useEffect(()=>{const K=z.current;if(!K||w>=1||v||$)return;let L=0;const _=new IntersectionObserver(([V])=>{window.clearTimeout(L),V.isIntersecting&&(L=window.setTimeout(()=>fa(o.id,1),2e3))},{threshold:.5});return _.observe(K),()=>{_.disconnect(),window.clearTimeout(L)}},[o.id,w,v,$]),t.jsxs("article",{ref:z,className:`akv-zv${$?" akv-zv--locked":""}`,"data-zid":o.id,style:$a(o.world),children:[t.jsxs("div",{className:"akv-zvimg",children:[o.img&&t.jsx("img",{src:o.img,alt:"",loading:"lazy",onClick:()=>n(o.id)}),$?t.jsx("span",{className:"zv-lockbadge","aria-hidden":!0,children:t.jsx(mo,{size:20})}):t.jsx(Qo,{id:o.id,lang:r,onShare:()=>p(o.id),onTalk:()=>n(o.id,"talk"),lock:v})]}),t.jsxs("div",{className:"akv-zvt",children:[t.jsx(Xo,{sd:o.sd,lang:r,corner:!0}),t.jsxs("div",{className:"zv-mid",children:[t.jsxs("span",{className:"akv-zvlbl",children:[l&&t.jsxs(t.Fragment,{children:[t.jsx("b",{className:"akv-zvw",style:$a(o.world),children:l})," · "]}),f.scroll," ",o.n," / ",o.total," · ",h.min," ",f.min]}),t.jsx("h3",{className:"akv-zvn",style:{paddingRight:a.xxl},children:h.t}),t.jsx("span",{className:"zv-rule","aria-hidden":!0})]}),t.jsxs("div",{className:"zv-mid",children:[t.jsx("p",{className:"akv-zvv",children:h.v}),h.vz&&!$&&t.jsx("div",{className:"zv-take",children:h.vz})]}),t.jsxs("div",{className:"zv-ctas",children:[t.jsxs("button",{type:"button",className:`zv-read${w===2?" is-done":""}`,onClick:()=>n(o.id),children:[$&&t.jsx(mo,{size:14}),w===2&&t.jsx(ja,{size:14}),w===2?f.readDone:f.read]}),S&&!$&&t.jsxs("button",{type:"button",className:"akv-zvsec",onClick:()=>n(o.id,"pod"),children:[t.jsx(Wa,{ic:"play"}),f.listen," · ",ia(S.sec)]})]})]})]})}function va({t:o}){const r=o.split(/(\b(?:1\d{3}|20\d{2})\b)/);return t.jsx(t.Fragment,{children:r.map((l,n)=>n%2?t.jsx("span",{className:"zv-yr",children:l},n):l)})}function Vi({d:o,imgs:r,onImg:l}){const n=o.split(/\n\n+/);return t.jsx(t.Fragment,{children:n.map((p,v)=>{if(p.startsWith("▸"))return t.jsx("h3",{className:"zv-sec",children:p.replace(/^▸\s*/,"")},v);if(p.startsWith("»"))return t.jsx("blockquote",{className:"zv-fact",children:t.jsx(va,{t:p.replace(/^\u00BB\s*/,"")})},v);if(p.startsWith("▣")){const h=p.match(/^▣\s*([ABC])\s*\|?\s*(.*)$/s),S=h&&(r==null?void 0:r[h[1]]);return S?t.jsxs("figure",{className:"zv-fig",children:[t.jsx("img",{src:S,alt:h[2],loading:"lazy",onClick:()=>l==null?void 0:l(S),style:{cursor:"zoom-in"}}),t.jsx("figcaption",{children:h[2]})]},v):null}const $=p.split(`
`),z=$.filter(h=>h.startsWith("◷"));if(z.length){const h=$.filter(S=>!S.startsWith("◷"));return t.jsxs("div",{children:[h.length>0&&t.jsx("p",{children:t.jsx(va,{t:h.join(" ")})}),t.jsx("ol",{className:"zv-tl",children:z.map((S,f)=>{const[K,...L]=S.replace(/^◷\s*/,"").split("|");return t.jsxs("li",{children:[t.jsx("b",{children:K.trim()}),t.jsx("span",{children:L.join("|").trim()})]},f)})})]},v)}const w=$.filter(h=>/^[–-]\s/.test(h));if(w.length){const h=$.filter(S=>!/^[–-]\s/.test(S));return t.jsxs("div",{children:[h.length>0&&t.jsx("p",{children:t.jsx(va,{t:h.join(" ")})}),t.jsx("ul",{children:w.map((S,f)=>t.jsx("li",{children:t.jsx(va,{t:S.replace(/^[–-]\s/,"")})},f))})]},v)}return t.jsx("p",{children:t.jsx(va,{t:p})},v)})})}const _i=1500,Ki=6e3,No=[["de","Deutsch"],["es","Español"],["fr","Français"],["it","Italiano"],["pl","Polski"],["pt","Português"],["nl","Nederlands"],["uk","Українська"],["ru","Русский"],["tr","Türkçe"],["id","Bahasa Indonesia"],["ja","日本語"],["ko","한국어"],["zh","中文"],["ar","العربية"]],Ao={sk:"SK",en:"EN",cs:"CZ"};function Ui({z:o,lang:r,onDone:l,boxRef:n,autoPlay:p,onEnd:v,lock:$}){var G;const z=la(r),[w,h]=g.useState(),S=Vo(o,r,w),f=S?o.pod[S]:null,[K,L]=g.useState(!1),[_,V]=g.useState(""),[ie,Q]=g.useState(No[0][0]),[le,x]=g.useState(!1),[O,R]=g.useState(!1),[U,H]=g.useState(0),fe=g.useRef(null),re=g.useRef(0);g.useEffect(()=>{H(0),re.current=0},[S]);const $e=Rt()[o.id],xe=$e&&!$e.listened_at?$e.listen_sec:0,he=g.useRef(null),Ae=g.useRef(S);Ae.current=S;const N=()=>{var W;if(he.current==null||$)return;const A=Math.round((Date.now()-he.current)/1e3);he.current=null,A>=3&&Me(o.id,"listen",{sec:A,lang:Ae.current,at:Math.round(((W=fe.current)==null?void 0:W.currentTime)||0)})},ee=g.useRef(N);if(ee.current=N,g.useEffect(()=>()=>ee.current(),[]),g.useEffect(()=>{ee.current()},[S]),!f||!S)return null;const ne=(A,W=!1)=>{$||!W&&A-re.current<15||(re.current=A,ui(o.id,A,S))},De=A=>{const W=A.currentTarget;ne(W.currentTime),W.duration&&W.currentTime/W.duration>=.9&&l()};return t.jsxs("div",{className:`zv-pod${K?" is-play":""}`,ref:n,children:[t.jsxs("small",{children:[t.jsxs("span",{children:[t.jsx(Wa,{ic:"play"}),z.pod," · ",ia(f.sec)]}),t.jsxs("span",{className:"zv-ptools",children:[t.jsxs("span",{className:"zv-pdd",children:[t.jsx("button",{type:"button",className:"zv-plang","aria-haspopup":"listbox","aria-expanded":O,onClick:()=>R(!O),children:Ao[S]}),O&&t.jsxs("span",{className:"zv-pmenu",role:"listbox","aria-label":z.other,children:[["sk","en","cs"].filter(A=>o.pod[A]).map(A=>t.jsx("button",{type:"button",role:"option","aria-selected":A===S,className:A===S?"is-on":"",onClick:()=>{h(A),L(!1),R(!1),_==="req"&&V("")},children:Ao[A]},A)),t.jsxs("button",{type:"button",className:"zv-padd",onClick:()=>{V("req"),R(!1)},children:["+ ",z.other]})]})]}),!!((G=f.tr)!=null&&G.length)&&t.jsx("button",{type:"button",className:`zv-ptr${_==="tr"?" is-on":""}`,"aria-pressed":_==="tr",onClick:()=>V(_==="tr"?"":"tr"),children:z.tr})]})]}),t.jsx("audio",{ref:fe,preload:"metadata",src:f.src,onLoadedMetadata:A=>{const W=A.currentTarget;xe>5&&xe<W.duration*.9&&(W.currentTime=xe,H(xe),re.current=xe),p&&W.play().catch(()=>{})},onTimeUpdate:A=>{De(A),H(A.currentTarget.currentTime)},onPlay:()=>{L(!0),he.current=Date.now()},onPause:A=>{L(!1),N(),ne(A.currentTarget.currentTime,!0)},onEnded:A=>{L(!1),N(),ne(A.currentTarget.currentTime,!0),l(),v==null||v()}},f.src),t.jsxs("div",{className:"zv-player",children:[t.jsx("button",{type:"button",className:"zv-pbtn","aria-label":K?"Pause":"Play",onClick:()=>{const A=fe.current;A&&(A.paused?A.play():A.pause())},children:K?t.jsxs("span",{className:"zv-pause","aria-hidden":!0,children:[t.jsx("i",{}),t.jsx("i",{})]}):t.jsx(Wa,{ic:"play"})}),t.jsxs("span",{className:"zv-ptime",children:[ia(Math.floor(U))," / ",ia(f.sec)]}),t.jsx("input",{type:"range",className:"zv-pbar",min:0,max:f.sec,step:1,value:Math.floor(U),"aria-label":z.pod,style:{"--p":`${f.sec?U/f.sec*100:0}%`},onChange:A=>{const W=fe.current,Se=Number(A.target.value);W&&(W.currentTime=Se),H(Se)}})]}),_==="tr"&&t.jsx("div",{className:"zv-tr",children:f.tr.map((A,W)=>t.jsxs("p",{children:[A.s==="A"?t.jsxs("b",{className:"is-ai",children:[t.jsx("span",{children:"AI"}),"NUBIS"]}):t.jsx("b",{children:"Matej"})," ",A.t]},W))}),_==="req"&&t.jsxs("div",{className:"zv-req",children:[t.jsx("b",{children:z.reqTitle})," — ",z.reqText,le?t.jsx("div",{className:"zv-ok",children:z.reqOk}):t.jsxs("div",{children:[t.jsx("select",{value:ie,onChange:A=>Q(A.target.value),"aria-label":z.other,children:No.map(([A,W])=>t.jsx("option",{value:A,children:W},A))}),t.jsx("button",{type:"button",onClick:()=>{if($){$();return}Ii(o.id,ie),x(!0)},children:z.reqBtn})]})]})]})}function Fi(o,r){var n;const l=o.img?[{src:o.img,cap:""}]:[];for(const p of r.matchAll(/^▣\s*([ABC])\s*\|?\s*(.*)$/gm)){const v=(n=o.imgs)==null?void 0:n[p[1]];v&&!l.some($=>$.src===v)&&l.push({src:v,cap:p[2]})}return l}function Hi({list:o,start:r,label:l,onClose:n}){const[p,v]=g.useState(r),$=g.useRef(null),z=h=>v(S=>Math.min(o.length-1,Math.max(0,S+h)));g.useEffect(()=>{const h=S=>{S.key==="Escape"&&n(),S.key==="ArrowLeft"&&z(-1),S.key==="ArrowRight"&&z(1)};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)});const w=o[p];return bn.createPortal(t.jsxs("div",{className:"zv-gal",role:"dialog","aria-modal":"true","aria-label":l,onClick:h=>{h.target===h.currentTarget&&n()},onTouchStart:h=>{$.current=h.touches[0].clientX},onTouchEnd:h=>{if($.current===null)return;const S=h.changedTouches[0].clientX-$.current;Math.abs(S)>40&&z(S<0?1:-1),$.current=null},children:[t.jsx(Et,{tone:"ainubis",onClick:n,label:l,className:"zv-gback"}),o.length>1&&t.jsx("button",{type:"button",className:"zv-gnav zv-gnav--prev",disabled:p===0,onClick:()=>z(-1),"aria-label":"Prev",children:t.jsx(wa,{size:20})}),t.jsxs("figure",{children:[t.jsx("img",{src:w.src,alt:w.cap}),t.jsxs("figcaption",{children:[p+1," / ",o.length,w.cap?` · ${w.cap}`:""]})]}),o.length>1&&t.jsx("button",{type:"button",className:"zv-gnav zv-gnav--next",disabled:p===o.length-1,onClick:()=>z(1),"aria-label":"Next",children:t.jsx(wa,{size:20,style:{transform:"scaleX(-1)"}})})]}),document.body)}function Zi({z:o,all:r,lang:l,focus:n,onClose:p,onOpen:v,onUse:$,onShare:z,queue:w,onNext:h,lock:S}){const f=la(l),K=Ve(o,l),L=Ot()[o.id]||0,_=Ni(o.id),[V,ie]=g.useState(""),[Q,le]=g.useState(""),[x,O]=g.useState(!1),[R,U]=g.useState(null),[H,fe]=g.useState(!1),[re,$e]=g.useState("add"),[xe,he]=g.useState(""),[Ae,N]=g.useState(!1),ee=g.useRef(null),ne=g.useRef(null),De=g.useRef(null),G=g.useRef(null),[A,W]=g.useState(null),Se=Fi(o,K.d);g.useEffect(()=>{S||(fa(o.id,1),Me(o.id,"open"))},[o.id]),g.useEffect(()=>{const j=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=j}},[]);const Ge=g.useRef(null);return g.useEffect(()=>{const j=Ge.current;if(!j||L===2||S)return;const J=Date.now();let ue=0;const Je=new IntersectionObserver(([Ye])=>{window.clearTimeout(ue),Ye.isIntersecting&&(ue=window.setTimeout(()=>fa(o.id,2,"read","auto"),Math.max(_i,Ki-(Date.now()-J))))},{root:ee.current,threshold:.6});return Je.observe(j),()=>{Je.disconnect(),window.clearTimeout(ue)}},[o.id,L]),g.useEffect(()=>{var J;(J=ee.current)==null||J.scrollTo({top:0});const j=n==="pod"?ne.current:n==="src"?De.current:n==="talk"?G.current:null;j&&window.setTimeout(()=>j.scrollIntoView({behavior:"smooth",block:"center"}),50)},[o.id,n]),t.jsxs("div",{className:"zv-veil",ref:ee,role:"dialog","aria-modal":"true","aria-label":K.t,children:[t.jsx("div",{className:"zv-bg","aria-hidden":!0}),A!==null&&Se.length>0&&t.jsx(Hi,{list:Se,start:A,label:f.back,onClose:()=>W(null)}),t.jsxs("div",{className:"zv-wrap pk-stage",children:[t.jsx(Et,{tone:"ainubis",onClick:p,label:f.back,className:"zv-back"}),t.jsxs("div",{className:"zv-top",children:[t.jsxs("div",{className:"zv-hero",children:[o.img&&t.jsx("img",{src:o.img,alt:"",onClick:()=>W(0)}),t.jsx(Qo,{id:o.id,lang:l,onShare:()=>z(o.id),onTalk:()=>{var j;return(j=G.current)==null?void 0:j.scrollIntoView({behavior:"smooth",block:"start"})},lock:S})]}),t.jsxs("div",{className:"zv-head",children:[t.jsx(Xo,{sd:o.sd,lang:l,corner:!0}),t.jsxs("div",{className:"zv-grp",children:[t.jsxs("span",{className:"zv-meta",children:[Ha(o,l)," · ",f.scroll," ",o.n,"/",o.total," · ",K.min," ",f.min]}),t.jsx("h1",{className:"zv-h",children:K.t}),t.jsx("span",{className:"zv-rule","aria-hidden":!0}),L===2&&t.jsxs("span",{className:"zv-badge",children:[t.jsx(ja,{size:14}),f.readDone]})]}),t.jsxs("div",{className:"zv-grp",children:[t.jsx("p",{className:"zv-v",children:K.v}),K.vz&&t.jsx("div",{className:"zv-take",style:{alignSelf:"stretch"},children:K.vz})]}),t.jsx(Ui,{z:o,lang:l,boxRef:ne,onDone:()=>fa(o.id,2,"listen"),autoPlay:w,onEnd:w?h:void 0,lock:S})]})]}),t.jsxs("div",{className:"zv-body",children:[t.jsx(Vi,{d:K.d,imgs:o.imgs,onImg:j=>W(Math.max(0,Se.findIndex(J=>J.src===j)))}),t.jsx("div",{ref:Ge,"aria-hidden":!0,style:{height:1}}),t.jsxs("section",{className:"zv-box zv-box--add",children:[t.jsx("h3",{className:"zv-sec",children:f.added}),o.doplnene.length?o.doplnene.map((j,J)=>t.jsxs("div",{className:"zv-add",children:[t.jsx("b",{children:j.date})," · ",j.text]},J)):t.jsx("div",{className:"zv-add",children:f.addedNone})]}),o.zdroje.length>0&&t.jsxs("section",{className:"zv-box zv-box--src",children:[t.jsxs("h3",{className:"zv-sec",ref:De,children:[f.src," · ",o.zdroje.length]}),t.jsx("ol",{className:"zv-src",children:o.zdroje.map((j,J)=>{const ue=li(j);return t.jsxs("li",{children:[t.jsx("b",{children:j.a})," (",j.r,") · ",j.t," · ",t.jsx("i",{children:j.j}),ue&&t.jsxs(t.Fragment,{children:[" · ",t.jsx("a",{href:ue,target:"_blank",rel:"noopener noreferrer",children:j.doi?"doi":"link"})]})]},J)})})]}),o.rel.length>0&&t.jsxs("section",{className:"zv-box",children:[t.jsx("h3",{className:"zv-sec",children:f.rel}),t.jsx("div",{className:"zv-rel",children:o.rel.map(j=>{const J=r.find(ue=>ue.id===j);return J?t.jsxs("button",{type:"button",className:"zv-chip",onClick:()=>v(j),children:[Ve(J,l).t," ›"]},j):null})})]}),!S&&t.jsxs("section",{className:"zv-box zv-box--you",children:[t.jsx("h3",{className:"zv-sec",children:f.contrib}),t.jsxs("button",{type:"button",className:`zv-prop${H?" is-open":""}`,onClick:()=>{fe(j=>!j),N(!1)},children:[t.jsx(xo,{size:14}),f.cEdit]}),H&&!Ae&&t.jsxs("form",{className:"zv-cform",onSubmit:j=>{j.preventDefault(),xe.trim()&&(Ei(o.id,re,xe.trim()),he(""),N(!0))},children:[t.jsx("div",{className:"zv-kinds",style:{alignSelf:"stretch"},children:["add","wrong","own"].map((j,J)=>t.jsxs("button",{type:"button",className:`zv-kind${re===j?" is-on":""}`,onClick:()=>$e(j),children:[j==="add"?t.jsx(Vn,{size:12}):j==="wrong"?t.jsx(_n,{size:12}):t.jsx(xo,{size:12})," ",f.kinds[J]]},j))}),t.jsx("textarea",{value:xe,onChange:j=>he(j.target.value),placeholder:f.propPh,rows:3}),t.jsx("button",{type:"submit",className:"zv-chip",disabled:!xe.trim(),children:f.propSend})]}),Ae&&t.jsx("div",{className:"zv-ok",children:f.propOk})]}),!S&&t.jsxs("button",{type:"button",className:`zv-done${L===2?" is-done":""}`,onClick:()=>fa(o.id,2),children:[t.jsxs("b",{children:[L===2&&t.jsx(ja,{size:12})," ",L===2?f.doneOk:f.done]}),L!==2&&t.jsx("small",{children:f.doneSub})]}),!S&&t.jsxs("section",{className:"zv-box zv-box--talk",ref:G,children:[t.jsxs("h3",{className:"zv-sec",children:[f.talk,_.length>0&&` · ${_.length}`]}),_.length===0&&t.jsx("div",{className:"zv-add",children:f.talkNone}),_.map((j,J)=>t.jsxs("div",{className:"zv-cmt",children:[t.jsx("span",{className:"zv-cav",children:j.avatar?t.jsx("img",{src:j.avatar,alt:""}):(j.mine===!1?j.author||"?":f.you).slice(0,1)}),t.jsxs("div",{children:[t.jsx("b",{children:j.mine===!1?j.author||"—":f.you})," ",t.jsx("small",{children:new Date(j.at).toLocaleDateString(l)}),j.text&&t.jsx("p",{children:j.text}),j.img&&t.jsx("img",{className:"zv-cimg",src:j.img,alt:""}),t.jsxs("div",{className:"zv-crow",children:[t.jsxs("button",{type:"button",className:`zv-clike${j.liked?" is-on":""}`,onClick:()=>zi(o.id,J),"aria-label":f.like,children:[t.jsx(It,{size:16,on:!!j.liked}),j.likes??(j.liked?1:0)]}),j.mine!==!1&&(R===J?t.jsxs("span",{className:"zv-cdel-ask",children:[f.delAsk,t.jsx("button",{type:"button",className:"zv-cdel is-go",onClick:()=>{U(null),Si(o.id,J)},children:f.del}),t.jsx("button",{type:"button",className:"zv-cdel",onClick:()=>U(null),children:f.delNo})]}):t.jsx("button",{type:"button",className:"zv-cdel",onClick:()=>U(J),"aria-label":f.del,children:t.jsx(Kn,{size:16})}))]})]})]},j.id??J)),t.jsxs("form",{className:"zv-cform",onSubmit:j=>{j.preventDefault(),!(x||!V.trim()&&!Q)&&(O(!0),ji(o.id,V.trim(),Q||void 0).then(J=>{J&&(ie(""),le("")),O(!1)}))},children:[t.jsx("textarea",{value:V,onChange:j=>ie(j.target.value),placeholder:f.talkPh,rows:2}),Q&&t.jsx("img",{className:"zv-cprev",src:Q,alt:""}),t.jsxs("div",{className:"zv-crow",children:[t.jsxs("label",{className:"zv-cpic",children:[t.jsx(Un,{size:16}),f.photo,t.jsx("input",{type:"file",accept:"image/*",onChange:j=>{var ue;const J=(ue=j.target.files)==null?void 0:ue[0];J&&Ri(J).then(le).catch(()=>{}),j.target.value=""}})]}),t.jsx("button",{type:"submit",className:"zv-chip",disabled:x||!V.trim()&&!Q,children:f.talkSend})]})]})]})]})]})]})}const Le=1024,en=160,Ct=112,Gi=143+a.lg+Ct+a.xl+2*a.md,Eo=340,Io=44,Ji=2*a.xl+2*a.md+a.lg,Yi=`
${At}
${Ro}
.akv-root{position:fixed;inset:0;overflow:hidden;background:${e.surfaceBase};color:${e.ink};
  font-family:${u};--akv-panel:min(40vw,480px);}
/* Podsvietený displej, nie čierny obdĺžnik — dve mriežky ako v nákrese (.bg .mesh / .mesh8). */
.akv-bg{position:absolute;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(${e.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${e.cyanRGB},0.06) 1px,transparent 1px),
    linear-gradient(rgba(${e.cyanRGB},0.10) 1px,transparent 1px),
    linear-gradient(90deg,rgba(${e.cyanRGB},0.10) 1px,transparent 1px);
  background-size:24px 24px,24px 24px,192px 192px,192px 192px;}
.akv-bg::after{content:'';position:absolute;inset:0;
  background:radial-gradient(60vw 60vw at 85% 10%,rgba(${e.cyanRGB},0.14),transparent 62%),
             radial-gradient(55vw 55vw at 70% 105%,rgba(${e.glowRGB},0.12),transparent 62%);}

/* ── MOZOG ─────────────────────────────────────────────────────────────── */
.akv-brain{position:absolute;inset:0;}
.akv-brain canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;}
.akv-tip{position:absolute;z-index:5;pointer-events:none;opacity:0;transition:opacity 120ms ease;
  transform:translate(-50%,calc(-100% - ${a.md}px));max-width:260px;
  padding:${a.sm}px ${a.md}px;border-radius:${d.tile}px;
  background:${e.surface};border:1px solid ${e.edgeStrong};box-shadow:${e.panelShadow};
  font-size:${i.label}px;line-height:1.4;color:${e.inkDim};}
.akv-tip b{display:block;font-family:${F};font-weight:700;font-size:${i.label}px;
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.ink};}
.akv-tip u{display:block;text-decoration:none;margin-top:${a.xs}px;font-size:${i.micro}px;
  letter-spacing:${y.section.letterSpacing};text-transform:uppercase;color:${e.ctaA};}

/* ── HORNÝ PÁS — ROVINY (vzor .trp-topbar: pás nad DOSTUPNOU šírkou) ────── */
/* VRCH A KRAJ = HORNÝ RAD /pack (5. 10. 2026): 20 zhora, 16 z boku — ako homepage, DOG ID
   a mobilná hlavička /map. Dovtedy 12/12 a kapsula správ zmenšená na 75×42. */
.akv-top{position:absolute;z-index:6;top:calc(env(safe-area-inset-top,0px) + ${Pe.top}px);
  left:${ro.side}px;right:${ro.side}px;display:flex;flex-direction:column;gap:${a.sm}px;
  pointer-events:none;}
.akv-top > *{pointer-events:auto;}
.akv-toprow{display:flex;align-items:center;gap:${a.sm}px;}
/* ── VÝŠKA PREPÍNAČA = VÝŠKA PREPÍNAČA NA /map (Matej 23. 9. 2026) ────────────
   Zadanie: „skúsme urobiť to aby bol header totožnej veľkosti — treba zmenšiť
   prepínače v ainubisovi". Merané na 390 px: mapa 33 px, AINUBIS mal 46.
   Dnes 35 (zvyšok je gap, ktorý mapa nemá).

   Rovnica, nie meranie po vykreslení:
     obal   4 + 4 padding + 1 + 1 border            = 10
     pilulka 4 + 4 padding + 1 + 1 border + 15 riadok = 25
                                                  spolu 35

   🔴 KĽÚČOVÉ: výšku ubralo PÍSMO, nie odsadenia. Mapa má 10 px (PACK_TEXT.micro),
   AINUBIS mal 12 — a riadok z 18 na 15 je 3 px z tých jedenástich. Preto sa zhoda
   dá dosiahnuť BEZ čísel mimo stupnice, hoci mapa sama ich používa (3 px a 5 px).
   Prvý pokus ich sem skopíroval; stráž check:pack ho zhodila a mala pravdu —
   základňa sa smie len zmenšovať. Pozor pri ďalšom ladení: ber PACK_SPACE, nie mapu. */
.akv-planes{flex:1 1 auto;min-width:0;display:flex;gap:${a.xs}px;padding:${a.xs}px;
  border-radius:${d.pill}px;background:${e.surface};border:1px solid ${e.edge};
  box-shadow:${e.panelShadow};}
.akv-plane{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:${a.xs}px;
  padding:${a.xs}px ${a.md}px;border-radius:${d.pill}px;border:1px solid transparent;
  background:transparent;color:${e.inkDim};cursor:pointer;white-space:nowrap;
  font-family:${u};font-weight:500;font-size:${i.micro}px;line-height:15px;
  letter-spacing:0.02em;text-transform:uppercase;}
/* Písmo = čip, nie nadpis (5. 10. 2026): brand.md — chipy sú Space Grotesk, Cinzel patrí
   nadpisom a CTA. Do 5. 10. tu stál Cinzel 700/.14em a rovina sa bila s prepínačom na /map. */
/* Výber je PRIESVITNÝ TINT, nie plná plocha — AINUBIS vyberá cyanom (ainubisSkin). */
.akv-plane[aria-current="page"]{font-weight:600;color:${e.ink};background:rgba(${e.cyanRGB},0.16);
  border-color:${e.edgeStrong};}
.akv-plane:disabled{cursor:default;color:${e.inkFaint};}
.akv-plane em{font-style:normal;font-family:${u};font-weight:500;font-size:${i.micro}px;
  letter-spacing:${y.section.letterSpacing};color:${e.inkFaint};}
.akv-note{display:flex;flex-direction:column;gap:${a.xs}px;padding:${a.md}px ${a.lg}px;
  border-radius:${d.tile}px;border:1px solid ${e.ctaEdge};background:${e.ctaTint};
  box-shadow:0 0 24px ${e.glowTint};}
.akv-note b{font-family:${F};font-weight:700;font-size:${i.label}px;letter-spacing:${y.card.letterSpacing};
  text-transform:uppercase;color:${e.ctaA};}
.akv-note p{margin:0;font-family:${u};font-size:${i.body}px;line-height:1.45;color:${e.inkDim};}
.akv-note--t{margin-top:${a.sm}px;}
.akv-note--l{display:none;}
@media (max-width:${Le-1}px){
  /* Riadok pod menom má na mobile ~150 px — okruhy a zvitky ostávajú len na PC. */
  .akv-top .akv-stat-x{display:none;}
  /* S ostrými číslami (1487 KM · 70 TRIPS) ostáva na 390 px pre oznam ~70 px — do jedného
     riadku sa nezmestí. Radšej ZÁMERNE dva riadky než orezané „OPENS NO…" (náhľad 22. 9.). */

  /* Do 5. 10. 2026 tu stál prepis správy+zvonček na 32 px s odôvodnením „ako na mape“ —
     mapa ich mala vtedy už 44 v kapsule 99×54, takže prepis robil opak. Zrušený: kapsula
     má JEDNU veľkosť na každej obrazovke /pack. */
}

/* ── DOGSCROLL — vzor zoznamu na /map: HLAVIČKA STOJÍ, scrolluje len obsah ──
   (Matej 22. 9.: „vrch zamknutý nadpis, prepínače, filtre a scrolling len obsahy"). */
/* ── POLICA JE SKLENENÝ PANEL NAD PLÁTNOM (24. 9. 2026) ────────────────────
   Do 24. 9. to bol PLOCHÝ tmavý stĺpec: mozog vedľa neho svietil, polica nie,
   a hrana medzi nimi bola obyčajný predel. Teraz panel stojí NAD plátnom —
   presvitá cezeň a nesie na svojej hrane svetlo, takže obe polovice sú z toho
   istého prístroja. To je ten „punc" — nie viac farby, ale jedna hĺbka.
   🔴 ROZMAZANIE SI POLICA NEKRESLÍ — je to SKLENENÁ DOSKA z katalógu (.pk-stage,
      "podklad OBSAHU nad tapetou: tapetu rozmaže, ale nezakryje"). Prvý pokus mal
      vlastný backdrop-filter, stráž check:pack ho zhodila a mala pravdu.
      Farbu nesie povrch cez --pk-stage / --pk-stage-edge, presne ako to recept
      predpisuje; tu je AINUBISOVA, nie papyrusová.
   ⚠️ Doska je na PANELI, nie na kartách — rozmazanie na každej karte zvlášť je
      na mobile drahé a viditeľne seká rolovanie. */
.akv-scroll{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;overflow:hidden;
  padding-top:var(--akv-top-h,112px);border-radius:0;border-width:0 1px 0 0;
  --pk-stage:linear-gradient(180deg,rgba(7,16,25,0.92) 0%,rgba(3,7,12,0.97) 100%);
  --pk-stage-edge:rgba(${e.cyanRGB},0.16);
  ${Mn}}
/* Svetelná niť na pravej hrane police — zhora jasná, dole zhasnutá. */
.akv-scroll::after{content:'';position:absolute;top:0;bottom:0;right:0;width:1px;pointer-events:none;
  background:linear-gradient(180deg,rgba(${e.cyanRGB},0.55) 0%,rgba(${e.cyanRGB},0.06) 55%,transparent 100%);}
.akv-lhead{flex:0 0 auto;width:100%;max-width:${520+2*a.lg}px;margin:0 auto;
  display:flex;flex-direction:column;gap:${a.md}px;
  padding:0 ${a.lg}px ${a.md}px;border-bottom:1px solid ${e.edge};}
.akv-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;
  padding:${a.lg}px ${a.lg}px ${en+a.xl}px;}
.akv-col{max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:${a.lg}px;}
.akv-title{margin:0;font-family:${F};font-weight:700;font-size:${i.h1}px;line-height:1.1;
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.ink};}
.akv-claim{margin:${a.xs}px 0 0;font-size:${i.body}px;color:${e.inkDim};}
/* Riadok pod menom je flex s medzerou — obal je len skupina na skrytie, nie ďalší prvok. */
.akv-stat-x{display:contents;}

/* FILTRE — tri roletky z nákresu v5 (SVET · TYP · STAV). */
.akv-filters{display:flex;gap:${a.sm}px;}
.akv-dd{position:relative;flex:1 1 0;min-width:0;}
/* SVET nesie najdlhší text („Všetky svety") — na 390 px by sa pri rovnakom podiele orezal. */
.akv-dd:first-child{flex-grow:1.4;}
.akv-ddb{width:100%;display:flex;align-items:center;justify-content:space-between;gap:${a.xs}px;
  padding:${a.sm}px ${a.md}px;border-radius:${d.pill}px;border:1px solid ${e.edge};
  background:transparent;color:${e.inkDim};cursor:pointer;white-space:nowrap;
  font-family:${u};font-weight:500;font-size:${i.label}px;}
.akv-ddb > span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.akv-ddb:disabled .akv-chev{opacity:0.35;}
.akv-ddb .akv-chev{flex:0 0 auto;display:inline-flex;transform:rotate(-90deg);opacity:0.8;}
.akv-dd.is-set .akv-ddb,.akv-dd.is-open .akv-ddb{color:${e.cyan};border-color:${e.edgeStrong};
  background:rgba(${e.cyanRGB},0.14);}
.akv-ddb:disabled{cursor:default;color:${e.inkFaint};}
.akv-ddp{position:absolute;z-index:9;top:calc(100% + ${a.xs}px);left:0;min-width:100%;max-height:320px;overflow-y:auto;
  padding:${a.xs}px;border-radius:${d.tile}px;background:${e.bg};
  border:1px solid ${e.edgeStrong};box-shadow:${e.panelShadow};}
.akv-ddp button{display:flex;width:100%;align-items:center;gap:${a.sm}px;text-align:left;white-space:nowrap;
  padding:${a.sm}px ${a.md}px;border-radius:${d.field}px;border:1px solid transparent;
  background:transparent;color:${e.inkDim};cursor:pointer;font-family:${u};font-size:${i.body}px;}
.akv-ddp button:hover{background:rgba(${e.cyanRGB},0.10);color:${e.cyan};}
.akv-ddp button[aria-selected="true"]{color:${e.cyan};}

/* HĽADANIE — vzor .trp-mapsearch. Písmo 16 px: pod ním iOS pri ťuknutí priblíži stránku. */
.akv-search{display:flex;align-items:center;gap:${a.sm}px;min-width:0;
  padding:0 ${a.md}px;border-radius:${d.pill}px;color:${e.inkFaint};
  ${Te}}
.akv-search:focus-within{${Po}}
.akv-search input{flex:1 1 auto;min-width:0;background:transparent;border:0;outline:0;
  padding:${a.sm}px 0;color:${e.ink};font-family:${u};font-size:${i.lead}px;}
.akv-search input::placeholder{color:${e.inkFaint};}
/* Natívny krížik prehliadača = holý znak mimo brandu (pole NOT IN THE BRAND). */
.akv-search input::-webkit-search-cancel-button{-webkit-appearance:none;display:none;}
.akv-empty{margin:0;text-align:center;font-size:${i.body}px;color:${e.inkFaint};}

/* VRSTVY — PRAVÝ KRAJ nad mozgom, vzor /map (.trp-ctlstack + .trp-layersdd):
   okrúhle tlačidlo, panel sa otvára DOĽAVA. Farebná bodka = farba vrstvy v mozgu. */
.akv-ctl{position:absolute;z-index:6;right:${a.md}px;top:var(--akv-top-h,112px);}
.akv-ctlbtn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;
  border-radius:${d.pill}px;background:${e.surface};border:1px solid ${e.edge};box-shadow:${e.panelShadow};}
.akv-ctlbtn i{width:18px;height:18px;background:${e.inkDim};
  -webkit-mask:url(/icons/pack/layers.svg) center/contain no-repeat;mask:url(/icons/pack/layers.svg) center/contain no-repeat;}
.akv-ctlbtn[aria-expanded="true"]{border-color:${e.edgeStrong};background:rgba(${e.cyanRGB},0.16);}
.akv-ctlbtn[aria-expanded="true"] i{background:${e.cyan};}
.akv-lpanel{position:absolute;top:0;right:calc(100% + ${a.sm}px);width:220px;display:flex;flex-direction:column;
  gap:${a.xs}px;padding:${a.md}px;border-radius:${d.tile}px;background:${e.bg};
  border:1px solid ${e.edgeStrong};box-shadow:${e.panelShadow};}
.akv-lpanel > b{margin:0 0 ${a.xs}px ${a.xs}px;font-weight:500;font-size:${i.micro}px;
  letter-spacing:${y.label.letterSpacing};text-transform:uppercase;color:${e.inkFaint};}
.akv-lyr{display:flex;align-items:center;gap:${a.sm}px;width:100%;text-align:left;white-space:nowrap;cursor:pointer;
  padding:${a.sm}px ${a.md}px;border-radius:${d.field}px;border:1px solid transparent;
  background:transparent;color:${e.inkDim};font-family:${u};font-weight:500;font-size:${i.body}px;}
.akv-lyr u{width:8px;height:8px;flex:0 0 auto;border-radius:${d.pill}px;text-decoration:none;}
.akv-lyr em{margin-left:auto;font-style:normal;font-size:${i.micro}px;color:${e.inkFaint};}
.akv-lyr[aria-pressed="true"]{color:${e.cyan};background:rgba(${e.cyanRGB},0.16);border-color:${e.edgeStrong};}
.akv-lyr:disabled{cursor:default;color:${e.inkFaint};}
.akv-lyr:disabled u{opacity:0.45;}
/* Legenda pod vrstvou. Odsadená o bodku + medzeru vyššie, aby bolo vidieť, že patrí
   POD vrstvu a nie je to piata vrstva. Text je tichší o stupeň (micro, inkFaint). */
.akv-leg{display:flex;flex-direction:column;gap:${a.xs}px;
  margin:0 0 ${a.xs}px calc(${a.md}px + 8px + ${a.sm}px);}
.akv-leg span{display:flex;align-items:center;gap:${a.sm}px;white-space:nowrap;
  font-family:${u};font-weight:500;font-size:${i.micro}px;color:${e.inkFaint};}
.akv-leg u{width:6px;height:6px;flex:0 0 auto;border-radius:${d.pill}px;text-decoration:none;}

/* PC — riadok hľadanie + roletky pod hlavičkou (vzor .trp-topsearchrow). */
.akv-ptools{display:none;}
.akv-lhead-row{display:flex;align-items:flex-start;justify-content:space-between;gap:${a.md}px;}

/* MOBIL — riadok hľadanie + FILTRE (vzor .trp-mheader-row2) a šuplík filtrov (.trp-msheet). */
.akv-mtools{display:none;}
.akv-fbtn{flex:0 0 auto;display:flex;align-items:center;gap:${a.xs}px;white-space:nowrap;cursor:pointer;
  padding:${a.sm}px ${a.md}px;border-radius:${d.pill}px;border:1px solid ${e.edge};
  background:${e.surface};color:${e.inkDim};font-family:${u};font-weight:500;font-size:${i.label}px;}
.akv-fbtn i{width:14px;height:14px;background:currentColor;
  -webkit-mask:url(/icons/pack/sliders.svg) center/contain no-repeat;mask:url(/icons/pack/sliders.svg) center/contain no-repeat;}
.akv-fbtn.is-set{color:${e.cyan};border-color:${e.edgeStrong};background:rgba(${e.cyanRGB},0.14);}
.akv-sback{position:fixed;inset:0;z-index:960;background:rgba(0,0,0,0.55);}
.akv-sheet{position:fixed;left:0;right:0;bottom:0;z-index:961;max-height:86vh;overflow-y:auto;
  display:flex;flex-direction:column;gap:${a.lg}px;
  padding:${a.sm}px ${a.lg}px calc(env(safe-area-inset-bottom,0px) + ${a.xl}px);
  border-radius:${d.card}px ${d.card}px 0 0;background:${e.bg};border-top:1px solid ${e.edgeStrong};}
.akv-grab{align-self:center;width:40px;height:4px;border:0;padding:0;cursor:pointer;border-radius:${d.pill}px;background:${e.edge};}
.akv-sttl{font-family:${F};font-weight:700;font-size:${i.label}px;letter-spacing:${y.card.letterSpacing};
  text-transform:uppercase;color:${e.ink};}
.akv-sgrp{display:flex;flex-direction:column;gap:${a.sm}px;}
.akv-sgrp > b{font-weight:500;font-size:${i.micro}px;letter-spacing:${y.section.letterSpacing};
  text-transform:uppercase;color:${e.inkFaint};}
.akv-sgrp > b em{font-style:normal;letter-spacing:0.02em;text-transform:none;}
.akv-chips{display:flex;flex-wrap:wrap;gap:${a.sm}px;}
.akv-chip{padding:${a.sm}px ${a.md}px;border-radius:${d.pill}px;cursor:pointer;
  border:1px solid ${e.edge};background:transparent;color:${e.inkDim};font-family:${u};font-size:${i.label}px;}
.akv-chip[aria-pressed="true"]{color:${e.cyan};border-color:${e.edgeStrong};background:rgba(${e.cyanRGB},0.16);}
.akv-chip:disabled{cursor:default;color:${e.inkFaint};}
/* VCHOD DO ZDROJOV — TRETÍ Z TROCH (voľba E2, Matej 24. 9. 2026). Stojí v päte
   DOGSCROLLU zámerne: vidí ho aj ten, kto nikdy neprispeje ani sa nič nespýta,
   a to je jediné, čím sa AINUBIS líši od chatbota. Sám o sebe to NIE JE miesto
   (to je /pack/ainubis/sources), je to dvere. */
.akv-entry{display:flex;align-items:center;gap:${a.md}px;width:100%;text-align:left;cursor:pointer;
  padding:${a.md}px ${a.lg}px;border-radius:${d.tile}px;
  border:1px dashed ${e.edge};background:rgba(3,7,12,0.30);color:${e.inkDim};
  font-family:${u};font-size:${i.label}px;line-height:1.4;}
.akv-entry:hover{border-color:${e.edgeStrong};}
.akv-entry b{margin-left:auto;display:flex;align-items:center;gap:${a.xs}px;
  font-weight:500;color:${e.cyan};white-space:nowrap;}
.akv-entry b .akv-chev{display:inline-flex;transform:rotate(180deg);}

/* UPÚTAVKA SVETA — tvar budúceho úvodu sveta (.wintro v nákrese), lock §4.1: jedna karta. */
/* ── KARTA SVETA — AI-SKLO (Matej 24. 9. 2026) ─────────────────────────────
   *„postaraj sa o rebrand aj vaultu zvýrazni to urob hlbku tieň, punc
   futurickosti … je rok 2050"*. Karta mala plochý lem a jeden tieň, čo je presne
   to, čo na nástenke prestalo platiť — VAULT je predloha a nesmie byť posledný,
   kto nosí starý materiál. Ten istý odliatok, ten istý dosvit sveta.
   ⚠️ --ai-w nesie karta zo zoznamu svetov, takže polica dostane sedem odtieňov
      a dá sa čítať farbou pri rolovaní. */
.akv-pvinfo{margin-bottom:${a.md}px;}
.akv-pvdock{display:none;}
@media (min-width:${Le}px){
  .akv-pvinfo{display:none;}
  .akv-pvdock{display:block;position:absolute;z-index:6;left:calc(var(--akv-panel) + ${a.xl}px);right:${a.xl}px;bottom:${a.xl}px;}
}
.akv-world{position:relative;text-align:center;scroll-margin-top:${a.lg}px;
  padding:${a.xl}px ${a.lg}px;border-radius:${d.card}px;
  transition:transform 200ms ease;${Te}}
/* Vnútorný svit pod ikonkou — karta nie je doska, je to OKNO do sveta.
   Radiálu kreslí pseudoprvok, aby neprepísal vrstvy odliatku. */
.akv-world::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(60% 40% at 50% 22%,rgba(var(--ai-w,${e.cyanRGB}),0.10),transparent 70%);}
.akv-world > *{position:relative;z-index:1;}
.akv-world:hover{transform:translateY(-2px);}
/* ⚠️ Zvýraznenie po skoku z mozgu NEMÔŽE byť border-color — lem je gradient
   cez border-box a jedna farba by ho zmazala aj s dosvitom. Nesie ho prstenec. */
.akv-world.is-flash{outline:1px solid ${e.cyan};outline-offset:-1px;}
.akv-wlbl{font-size:${i.micro}px;letter-spacing:${y.label.letterSpacing};text-transform:uppercase;color:${e.cyan};}
/* IKONKA cez MASKU, nie filter — filter farbu hádá (feedback_filter_aproximuje_masku). */
/* ⚠️ Ikonka ostáva ZLATÁ. Skúšal som ju prefarbiť na farbu sveta a polica sa
   rozpadla na sedem rôznych značiek — zlatá je to, čo z nich robí JEDEN zoznam.
   Farbu sveta nesie dosvit karty, nie kresba v nej. */
.akv-wic{width:44px;height:44px;margin:${a.md}px auto 0;background:${e.ctaGrad};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;}
.akv-wname{margin:${a.md}px 0 0;font-family:${F};font-weight:700;font-size:${i.h2}px;line-height:1.2;
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.ink};overflow-wrap:anywhere;}
.akv-wtease{margin:${a.sm}px auto 0;max-width:40ch;font-size:${i.body}px;line-height:1.55;color:${e.inkDim};}
.akv-wsoon{display:inline-block;margin-top:${a.lg}px;padding:${a.xs}px ${a.md}px;
  border-radius:${d.pill}px;font-size:${i.micro}px;letter-spacing:${y.section.letterSpacing};
  text-transform:uppercase;color:${e.inkDim};border:1px solid ${e.edge};}

/* ── ZVITOK S OBRAZOM 3:4 — UKÁŽKA (3. 10. 2026, len DEV, vaultScrollDemo.ts) ──
   Matej: na PC sa musí zmestiť CELÝ zvitok naraz — obraz, nadpis, text aj CTA.
   Pod sebou to na okne 1477×724 nejde: hlavička police berie ~248 px a obraz 3:4
   by vyšiel ~180 px široký. Preto na PC stojí obraz VĽAVO na celú výšku zoznamu
   a text VPRAVO; na mobile pod sebou.
   🔴 ROVNICA, NIE MERANIE: výšku obrazu drží 100cqh zoznamu (obsahová výška = nad
      rezervou lišty, takže CTA nikdy nepodlezie lištu), šírku police obraz + text. */
.akv-zvh{text-align:center;font-size:${i.micro}px;letter-spacing:${y.label.letterSpacing};
  text-transform:uppercase;color:${e.cyan};}
/* SVET vo farbe, ktorou ho kreslí mozog (WORLD_TINT cez --ai-w) — Matej 6. 10.: „z toho nie je jasné, aký je to svet“ */
.akv-zvw{color:rgb(var(--ai-w,${e.cyanRGB}));font-weight:600;}
.akv-zv{position:relative;display:flex;flex-direction:column;gap:${a.md}px;
  padding:${a.md}px;border-radius:${d.card}px;${Te}}
.akv-zvimg{position:relative;flex:0 0 auto;}
.akv-zvimg img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:${d.tile}px;cursor:pointer;}
.akv-zvacts{align-self:stretch;margin-top:auto;display:flex;gap:${a.sm}px;padding-top:${a.sm}px;
  border-top:1px solid ${e.edge};}
.akv-zvacts button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;
  border-radius:${d.pill}px;background:${e.surface};border:1px solid ${e.edge};color:${e.ink};}
.akv-zvacts button:hover{color:${e.cyan};border-color:${e.edgeStrong};}
.akv-zvt{display:flex;flex-direction:column;align-items:flex-start;gap:${a.lg}px;min-width:0;}
.akv-zvlbl{font-size:${i.micro}px;letter-spacing:${y.section.letterSpacing};text-transform:uppercase;color:${e.cyan};}
.akv-zvn{margin:0;font-family:${F};font-weight:700;font-size:${i.h2}px;line-height:1.2;
  letter-spacing:${y.card.letterSpacing};text-transform:uppercase;color:${e.ink};overflow-wrap:anywhere;}
.akv-zvv{margin:0;font-size:${i.body}px;line-height:1.55;color:${e.inkDim};}
/* VEZMI SI Z TOHO — jedna veta (fasáda v2). Ľavá niť v zlato-oranžovej AINUBISA, nie plná plocha. */
.akv-zvtake{align-self:stretch;display:flex;flex-direction:column;gap:${a.xs}px;
  padding:${a.sm}px ${a.md}px;border-radius:${d.tile}px;background:${e.ctaTint};
  border-left:2px solid ${e.ctaA};font-size:${i.body}px;line-height:1.45;color:${e.ink};}
.akv-zvtake b{font-size:${i.micro}px;font-weight:500;letter-spacing:${y.section.letterSpacing};text-transform:uppercase;color:${e.ctaA};}
/* Jediné plné CTA na karte = AINUBISOVO zlato-oranžové; ostatné sú obrysové. */
.akv-zvcta{align-self:stretch;padding:${a.sm}px ${a.lg}px;cursor:pointer;border-radius:${d.field}px;
  background:${e.ctaGrad};border:1px solid ${e.ctaEdge};color:${e.ctaInk};
  font-family:${F};font-weight:700;font-size:${i.label}px;letter-spacing:${y.card.letterSpacing};text-transform:uppercase;}
.akv-zvrow{align-self:stretch;display:flex;gap:${a.sm}px;}
.akv-zvsec{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:${a.xs}px;cursor:pointer;white-space:nowrap;
  padding:${a.sm}px;border-radius:${d.field}px;background:transparent;border:1px solid ${e.edge};
  color:${e.cyan};font-family:${u};font-weight:500;font-size:${i.label}px;}
.akv-zvsec:hover{border-color:${e.edgeStrong};}
.akv-zvsec i{width:14px;height:14px;flex:0 0 auto;background:currentColor;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.akv-zvrel{display:flex;flex-wrap:wrap;gap:${a.xs}px ${a.sm}px;font-size:${i.label}px;}
.akv-zvrel span{color:${e.inkDim};}
.akv-zvrel a{color:${e.cyan};cursor:pointer;}
@media (min-width:${Le}px){
  .akv-root.has-zv{--akv-panel:clamp(480px,calc((100dvh - ${Gi+Io}px) * 0.75 + ${Eo+Ji}px),56vw);}
  .akv-root.has-zv .akv-list{container-type:size;}
  /* Matej 3. 10.: „skús to bez oznamu" — oznam OTVORENIE berie ~128 px, ktoré chýbali obrazu. */
  .akv-root.has-zv .akv-note--l{display:none;}
  .akv-root.has-zv .akv-col{max-width:none;}
  .akv-zv{flex-direction:row;align-items:stretch;gap:${a.lg}px;}
  /* Pod obrazom stojí trojica akcií — obraz jej uvoľní ZV_ACTS. */
  .akv-zvimg img{width:auto;height:calc(100cqh - ${2*a.md+Io}px);}
  /* Text karty: nadpis a veta s blokom hore, CTA dole na úrovni spodku obrazu (space-between
     nechával medzi skupinami diery — Matej 3. 10.: „aj tu je to také divné“). */
  .akv-zvt{flex:1 1 ${Eo}px;}
  .akv-zvt .zv-ctas{margin-top:auto;}
  /* Známka späť do rohu KARTY — textový stĺpec je od neho o odsadenie karty. */
  .akv-zv .akv-zvt > .zv-sd--corner{top:-${a.md}px;right:-${a.md}px;
    border-width:0 0 1px 1px;border-radius:0 ${d.card-1}px 0 ${d.tile}px;}
}

/* ── PRUH POLOHY POD ROVINAMI (Matej 8. 10. 2026, nákres plany/nakres-ainubis-zvitky-2026-10-08) ──
   Na akom svete a v akom okruhu človek je, kde v ňom stojí, a dvere späť k prečítaným
   a do zoznamu okruhov. Lepí sa na vrch zoznamu, karty pod ním odchádzajú — preto plný
   podklad. Farbu nesie svet (--ai-w), nie AINUBIS. */
.akv-pos{position:relative;display:flex;align-items:center;gap:${a.sm}px;min-width:0;
  padding:${a.xs}px ${a.xs}px ${a.sm}px ${a.md}px;border-radius:${d.pill}px;
  background:${e.surface};border:1px solid ${ba.edge};box-shadow:${ba.float};
  font-size:${i.label}px;color:${e.inkDim};}
.akv-pos-ic{width:16px;height:16px;flex:0 0 auto;background:rgb(var(--ai-w,${e.cyanRGB}));
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain;}
.akv-pos-w{flex:0 0 auto;font-size:${i.micro}px;font-weight:600;letter-spacing:${y.section.letterSpacing};
  text-transform:uppercase;color:rgb(var(--ai-w,${e.cyanRGB}));}
.akv-pos-c{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${e.ink};font-weight:500;}
.akv-pos-n{flex:0 0 auto;font-weight:600;color:${e.ink};}
/* Progres = recept .pk-progress, jeden na okruh (šírka podľa počtu zvitkov), ležia na SPODNEJ
   HRANE riadku — všetko v jednom riadku (Matej 8. 10.: „konsolidácia čo najužšie"). */
.akv-pos-bar{position:absolute;left:${a.lg}px;right:${a.lg}px;bottom:${a.xs}px;display:flex;gap:2px;pointer-events:none;}
.akv-pos-bar .pk-progress{height:2px;background:rgba(var(--ai-w,${e.cyanRGB}),0.22);}
.akv-pos-bar .pk-progress.is-cur{background:rgba(var(--ai-w,${e.cyanRGB}),0.40);}
.akv-pos-bar .pk-progress__fill{background:rgb(var(--ai-w,${e.cyanRGB}));}
.akv-pos-acts{flex:0 0 auto;display:flex;gap:${a.xs}px;}
.akv-pos-b{display:inline-flex;align-items:center;gap:${a.xs}px;cursor:pointer;white-space:nowrap;
  padding:${a.xs}px ${a.sm}px;border-radius:${d.pill}px;border:1px solid ${e.edge};
  background:transparent;color:${e.inkDim};font-family:${u};font-weight:500;font-size:${i.label}px;}
.akv-pos-b:hover{border-color:${e.edgeStrong};color:${e.ink};}
.akv-pos-b[aria-expanded="true"],.akv-pos-b[aria-pressed="true"]{color:rgb(var(--ai-w,${e.cyanRGB}));
  border-color:rgba(var(--ai-w,${e.cyanRGB}),0.70);background:rgba(var(--ai-w,${e.cyanRGB}),0.12);}
.akv-pos-b .akv-chev{display:inline-flex;transform:rotate(-90deg);}
.akv-pos-b .akv-up{display:inline-flex;transform:rotate(90deg);}
.akv-pos-b i{width:12px;height:12px;background:currentColor;-webkit-mask:url(/icons/pack/play.svg) center/contain no-repeat;mask:url(/icons/pack/play.svg) center/contain no-repeat;}
.akv-pos-dd{position:absolute;z-index:9;left:0;right:0;top:calc(100% + ${a.xs}px);max-height:min(60vh,480px);overflow-y:auto;
  display:flex;flex-direction:column;padding:${a.xs}px;border-radius:${d.tile}px;
  background:${e.bg};border:1px solid ${e.edgeStrong};box-shadow:${e.panelShadow};}
.akv-pos-dd button{display:flex;align-items:center;gap:${a.sm}px;width:100%;text-align:left;cursor:pointer;
  padding:${a.sm}px ${a.md}px;border-radius:${d.field}px;border:1px solid transparent;background:transparent;
  color:${e.inkDim};font-family:${u};font-size:${i.body}px;}
.akv-pos-dd button:hover:not(:disabled){background:rgba(var(--ai-w,${e.cyanRGB}),0.10);color:${e.ink};}
.akv-pos-dd button.is-cur{background:rgba(var(--ai-w,${e.cyanRGB}),0.14);color:${e.ink};font-weight:600;}
.akv-pos-dd button:disabled{cursor:default;opacity:0.45;}
.akv-pos-dd button > span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.akv-pos-dd button > b{margin-left:auto;flex:0 0 auto;display:inline-flex;align-items:center;gap:${a.xs}px;font-weight:500;font-size:${i.label}px;}
.akv-pos-dd button.is-done > b{color:rgb(${pe.read});}
.akv-pos-dd .akv-pos-sec{padding:${a.sm}px ${a.md}px ${a.xs}px;font-size:${i.micro}px;
  letter-spacing:${y.label.letterSpacing};text-transform:uppercase;color:${e.inkFaint};}
.akv-pos-dd em{font-style:normal;font-size:${i.micro}px;color:${e.inkFaint};}
.akv-pos-wdot{width:8px;height:8px;flex:0 0 auto;border-radius:${d.pill}px;background:rgb(var(--ai-w,${e.cyanRGB}));}
.akv-fold{display:flex;align-items:center;justify-content:center;gap:${a.xs}px;width:100%;cursor:pointer;
  padding:${a.sm}px ${a.md}px;border-radius:${d.tile}px;border:1px dashed ${ba.edge};
  background:transparent;color:rgb(var(--ai-w,${e.cyanRGB}));font-family:${u};font-size:${i.label}px;}
.akv-fold .akv-chev{display:inline-flex;transform:rotate(90deg);}
/* Karta zvitku ŽIARI FARBOU SVOJHO SVETA (Matej 8. 10.) — prstenec cez pseudoprvok,
   aby neprepísal vrstvy AI-SKLA na karte. */
.akv-zv::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  box-shadow:${ba.ring};}
/* POČÚVAJ ZA SEBOU — na PC vpravo od nadpisu, na mobile v pruhu polohy. */
.akv-listen{flex:0 0 auto;display:inline-flex;align-items:center;gap:${a.sm}px;cursor:pointer;white-space:nowrap;
  padding:${a.sm}px ${a.md}px;border-radius:${d.pill}px;border:1px solid ${e.edgeStrong};
  background:rgba(${e.cyanRGB},0.08);color:${e.cyan};font-family:${u};font-weight:600;font-size:${i.label}px;
  letter-spacing:0.02em;text-transform:uppercase;}
.akv-listen:hover{background:rgba(${e.cyanRGB},0.16);}
.akv-listen i{width:12px;height:12px;background:currentColor;-webkit-mask:url(/icons/pack/play.svg) center/contain no-repeat;mask:url(/icons/pack/play.svg) center/contain no-repeat;}
.akv-listen em{font-style:normal;font-weight:400;opacity:0.75;}
.akv-pos--t,.akv-listen--m{display:none;}
@media (max-width:${Le-1}px){
  .akv-root[data-view="scroll"] .akv-pos--t{display:flex;}
  /* Na 390 px by meno okruhu ostalo na „Odkiaľ…" — svet nesie ikonka a farba, meno sveta ustúpi. */
  .akv-pos--t .akv-pos-w{display:none;}
  .akv-listen--m{display:inline-flex;align-self:center;}
}

/* ── POHĽAD DOLE — pilulka nad lištou (lock §1.3.1, geometria .trp-mactions) ──
   ⚠️ Číslo je OPÍSANÉ z PackMap.tsx, lebo register spodného pásu (nástenka r-pas)
   ešte neexistuje. Keď vznikne, táto pilulka ide doň ako prvá — nie ako ďalší
   nezávislý prilepený prvok.
   ⚠️ ŽIADNE spätné apostrofy v komentároch — sú vnútri template literálu CSS. */
.akv-mactions{position:absolute;z-index:7;left:50%;transform:translateX(-50%);
  bottom:calc(env(safe-area-inset-bottom,0px) + 87px + var(--pack-medal-rise, 0px) + 4px);}
/* Prepínač NIE JE výzva k akcii: pilulka 999 BEZ dosvitu (lock §1.3.1). */
.akv-mtoggle{display:flex;align-items:center;gap:${a.sm}px;cursor:pointer;white-space:nowrap;
  padding:${a.md}px ${a.xl}px;border-radius:${d.pill}px;
  font-family:${F};font-weight:700;font-size:${i.label}px;letter-spacing:${y.card.letterSpacing};
  text-transform:uppercase;background:${e.ctaGrad};color:${e.ctaInk};border:1px solid ${e.ctaEdge};}
.akv-mtoggle i{width:16px;height:16px;flex:0 0 auto;background:${e.ctaInk};
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;}

/* Mobil: pohľady sa striedajú, DOGSCROLL prekrýva mozog. */
.akv-root[data-view="brain"] .akv-scroll{display:none;}
/* Nad pásom kariet dostane horný pás podklad — inak cez medzeru medzi jeho riadkami
   presvitá text karty, ktorá pod ním odchádza (snímka 21. 9., 390 px). */
/* Od 22. 9. je hlavička dvojriadková a mozog svieti celý — podklad dostáva VŽDY,
   inak cez avatar a zvonček bežia vlákna a nápisy okruhov. */
.akv-top::before{content:'';position:absolute;z-index:-1;pointer-events:none;
  left:-${a.xl}px;right:-${a.xl}px;bottom:-${a.lg}px;
  top:calc(-1 * (env(safe-area-inset-top,0px) + ${a.xl}px));
  background:linear-gradient(180deg,${e.bg} 72%,transparent);}
@media (max-width:${Le-1}px){
  /* Mobil ako /map: ĽAVÁ HLAVIČKA NEEXISTUJE (bez nadpisu a podnadpisu), hľadanie
     a filtre sú v hornom páse, zoznam začína hneď pod ním (Matej 22. 9.). */
  .akv-lhead{display:none;}
  .akv-mtools{display:flex;align-items:center;gap:${a.sm}px;}
  .akv-mtools .akv-search{flex:1 1 auto;}
  .akv-root[data-view="scroll"] .akv-ctl{display:none;}
  .akv-root[data-view="scroll"] .akv-top::before{content:'';position:absolute;z-index:-1;pointer-events:none;
    left:-${a.md}px;right:-${a.md}px;bottom:-${a.md}px;
    top:calc(-1 * (env(safe-area-inset-top,0px) + ${a.md}px));
    background:linear-gradient(180deg,${e.bg} 78%,transparent);}
}

/* ── PC: 40 / 60 vedľa seba, pás len nad pravou plochou (nákres, rozhodnutie 2) ── */
@media (min-width:${Le}px){
  .akv-scroll,.akv-root[data-view="brain"] .akv-scroll{display:flex;right:auto;width:var(--akv-panel);
    padding-top:calc(env(safe-area-inset-top,0px) + ${a.xl}px);
    border-right:1px solid ${e.edge};}
  .akv-lhead{max-width:none;padding:0 ${a.xl}px ${a.lg}px;gap:${a.lg}px;}
  .akv-list{padding:${a.lg}px ${a.xl}px ${Ct+a.xl}px;}
  /* Roviny sa na PC presťahovali do ľavého bloku (Matej 22. 9.).
     🔒 Matej 23. 9. 2026: OSTÁVA TAK, presun hore aj na PC zamietnutý. Rovina mení
     obsah ĽAVÉHO bloku, tak stojí pri ňom; hore je na mobile len preto, že tam ľavý
     stĺpec neexistuje. Pravidlo „hore prepínam ROVINU" (lock §1.3.1) je o mobile. */
  .akv-toprow{display:none;}
  .akv-note--t{display:none;} .akv-note--l{display:flex;}
  .akv-ctl{right:${a.xl}px;}
  .akv-ptools{display:flex;align-items:center;gap:${a.sm}px;}
  .akv-ptools .akv-search{flex:1 1 320px;max-width:420px;}
  .akv-ptools .akv-filters{flex:0 1 480px;}
  .akv-brain{left:var(--akv-panel);}
  /* Nav v strede plochy vpravo, pod lištou — výnimka z locku pack-blok1-nav (5. 10. 2026),
     tá istá ako na /map. */
  .akv-root .pk-dock-band{left:calc(var(--akv-panel) + ${a.xl}px) !important;right:${a.xl}px !important;}
  .akv-top{left:calc(var(--akv-panel) + ${a.xl}px);right:${a.xl}px;top:calc(env(safe-area-inset-top,0px) + ${Pe.top}px);}
  .akv-mactions{display:none;}
}
`,Wi={},qi={},Xi=o=>({width:`${Math.round(Math.min(1,Math.max(0,o))*100)}%`}),Qi=[{k:"untouched",en:"not opened",rgb:pe.untouched},{k:"seen",en:"opened, unfinished",rgb:pe.seen},{k:"read",en:"read",rgb:pe.read}],er=[{k:"progress",en:"Progress",rgb:"245,199,61",live:!0,legend:Qi},{k:"myDog",en:"My dog",rgb:"178,86,64",live:!1,legend:null},{k:"origin",en:"Origin",rgb:"91,224,240",live:!1,legend:null},{k:"pack",en:"Pack",rgb:"59,158,255",live:!1,legend:null}],ar=ce.reduce((o,r)=>o+r.circles,0),Ua=ce.reduce((o,r)=>o+r.scrolls,0),tr={session:null,loading:!1,sessionReady:!0,dogs:[],devotion:0,bones:0,avatarUrl:null,avatarInitial:"",packTotal:null,packToday:null};function Lr(){const o=Cn();return o?t.jsx(an,{id:tr,pv:o}):t.jsx(or,{})}function or(){const o=Nn();return t.jsx(an,{id:o,pv:null})}function an({id:o,pv:r}){var oo;const l=Oo(),n=(s,m)=>{const I=l(s);return I===s?m:I},{lang:p}=fn(),[v,$]=g.useState("brain"),z=!1,w=!1,h=!1,[S,f]=$n(),K=Bn(),L=g.useRef((r==null?void 0:r.lock)??null);L.current=(r==null?void 0:r.lock)??null;const _=(s="action")=>{var m;return(m=L.current)==null?void 0:m.call(L,s)},V=di(),ie=ci(),Q=r?ie:V,le=yn(),x=wn()["*"]||"",O=(oo=x.match(/^zvitok\/([^/]+)/))==null?void 0:oo[1],R=!r&&/^knowledge\/?$/.test(x),U=Ot(),H=r?Wi:U,fe=Rt(),re=r?qi:fe,[$e,xe]=g.useState(null),[he,Ae]=g.useState(""),N=(s,m)=>{var I,C;if(r&&!La((I=Q.find(B=>B.id===s))==null?void 0:I.code)){r.lock("scroll");return}xe(m||null),K(`/pack/ainubis/zvitok/${s}`,{state:{back:O?(C=le.state)==null?void 0:C.back:le.pathname+le.search}})},ee=()=>{var s;ka(!1),K(((s=le.state)==null?void 0:s.back)||"/pack/ainubis")},ne=()=>r?_("chat"):uo(),De=s=>{var C;const m=`${window.location.origin}/pack/ainubis/zvitok/${s}`,I=()=>{Ae(la(p).copied),window.setTimeout(()=>Ae(""),2e3)};navigator.share?navigator.share({url:m}).catch(()=>{}):(C=navigator.clipboard)==null||C.writeText(m).then(I,()=>{})},G=O?Q.find(s=>s.id===O):void 0;S.get("plane");const[A,W]=g.useState("vault"),Se=S.get("tab"),[Ge,j]=g.useState(Se==="mine"||Se==="lib"?Se:"pack"),J=s=>{const m=new URLSearchParams(S);for(const[I,C]of Object.entries(s))C===null?m.delete(I):m.set(I,C);f(m,{replace:!0})},ue=s=>{if(r&&s!=="vault"){_(s==="chat"?"chat":"forum");return}W(s),j("pack"),J({plane:s==="vault"?null:s,tab:null})};g.useRef(!1),S.get("post");const Je=()=>{if(r){_("sources");return}W("wall"),j("lib"),J({plane:"wall",tab:"lib"})},Ye=vi(),Ce=s=>ce.findIndex(m=>m.key===s),q=g.useMemo(()=>[...Q].sort((s,m)=>Ce(s.world)-Ce(m.world)||s.okruh-m.okruh||s.n-m.n),[Q]),[We,et]=g.useState(null);g.useEffect(()=>{We!==null||!Ye||!q.length||et((q.find(s=>(H[s.id]||0)!==2)??q[0]).id)},[We,Ye,q,H]);const[Ue,da]=g.useState(!1),[qe,ca]=g.useState(null),[Ia,pa]=g.useState(!1),[Oa,ka]=g.useState(!1),ma=g.useRef(null),[Ra,Xe]=g.useState(null),[ve,Qe]=g.useState(-1),[Fe,c]=g.useState(null),[b,E]=g.useState(""),[T,Z]=g.useState(!1),[X,de]=g.useState("worlds"),Ee=g.useRef("worlds"),[ye,k]=g.useState(!1);g.useEffect(()=>{if(!Fe)return;const s=()=>c(null);return window.addEventListener("click",s),()=>window.removeEventListener("click",s)},[Fe]);const D=g.useRef(null),P=g.useRef(null),te=g.useRef(null),Y=g.useRef(null),M=g.useRef(null),ae=!!r||!o.loading&&!!o.session,ke=g.useMemo(()=>ce.map(s=>n(`pack.ainubis.world.${s.key}`,s.en)),[l]),Ie=(s,m)=>{var C;const I=(C=Dt[ce[s].key])==null?void 0:C[m];return I?p==="sk"?I.sk:I.en:""},se=g.useRef({names:ke,tx:n,circleName:Ie,feed:q,lang:p,jump:s=>{},open:s=>{}});se.current={...se.current,names:ke,tx:n,circleName:Ie,feed:q,lang:p};const Bt=g.useMemo(()=>q.map(s=>`${s.world}${s.okruh}`).join(","),[q]),Lt=(s,m,I)=>se.current.feed.find(C=>C.world===ce[s].key&&C.okruh===m+1&&C.n===I+1),at=g.useRef(H);at.current=H,g.useEffect(()=>{var s;(s=M.current)==null||s.refresh()},[H]);const Vt=s=>{const m=ce[s].key;if(Qe(-1),window.innerWidth<Le){Xe(m),window.setTimeout(()=>Xe(I=>I===m?null:I),1400);return}$("scroll"),Xe(m),requestAnimationFrame(()=>{var I;(I=document.getElementById(`akv-w-${m}`))==null||I.scrollIntoView({behavior:"smooth",block:"start"})}),window.setTimeout(()=>Xe(I=>I===m?null:I),1400)},_t=g.useRef(Vt);if(_t.current=Vt,g.useEffect(()=>{const s=P.current,m=te.current;if(!ae||!s||!m)return;const I=()=>window.innerWidth>=Le;M.current=ei({layer:()=>Ee.current,canvas:s,tip:m,worlds:ce,head:Zn,isMobile:()=>!I(),worldName:B=>se.current.names[B],circleName:(B,oe)=>se.current.circleName(B,oe),insets:()=>{var B;return{top:(((B=Y.current)==null?void 0:B.getBoundingClientRect().bottom)??0)+a.sm,bottom:I()?Ct:en}},describe:(B,oe,ge,Oe)=>{const{names:we,tx:Be,circleName:ct,lang:pn}=se.current;if(B==="root")return{title:"AINUBIS",hint:Be("pack.ainubis.tip.home","Back to the whole brain")};const no=se.current.feed.some(Ba=>Ba.world===ce[oe].key);if(no&&B==="z"){const Ba=Lt(oe,ge,Oe??0);if(Ba)return{title:Ve(Ba,pn).t,sub:`${we[oe]} · ${ct(oe,ge)}`,hint:Be("pack.ainubis.tip.open","Click to open")}}return no&&B==="o"?{title:ct(oe,ge)||we[oe],sub:we[oe]}:{title:B==="o"&&ct(oe,ge)||we[oe],sub:B==="o"?`${we[oe]} · ${Be("pack.ainubis.tip.circle","A chapter being written")}`:Be("pack.ainubis.tip.scroll","A scroll being written"),hint:Be("pack.ainubis.opening","Expected opening: November 2026")}},onWorld:B=>_t.current(B),onRoot:()=>L.current?L.current("action"):uo(),circleSizes:B=>{const oe=ce[B].key,ge=se.current.feed.filter(we=>we.world===oe);if(!ge.length)return null;const Oe=Array.from({length:ce[B].circles},()=>0);return ge.forEach(we=>{we.okruh>=1&&we.okruh<=Oe.length&&(Oe[we.okruh-1]+=1)}),Oe},onScroll:(B,oe,ge)=>{const Oe=Lt(B,oe,ge);Oe&&se.current.open(Oe.id)},onCircle:(B,oe)=>{if(window.innerWidth<Le)return;const ge=ce[B].key,Oe=se.current.feed.filter(Be=>Be.world===ge&&Be.okruh===oe+1),we=Oe.find(Be=>(at.current[Be.id]||0)!==2)??Oe[0];we&&se.current.jump(we.id)},progress:(B,oe,ge,Oe)=>at.current[`${ce[oe].key}-O${ge+1}-${Oe+1}`]||0});const C=new ResizeObserver(()=>{var B;return(B=M.current)==null?void 0:B.resize()});return C.observe(s),()=>{var B;C.disconnect(),(B=M.current)==null||B.destroy(),M.current=null}},[ae,Bt]),g.useEffect(()=>{const s=ma.current;if(!s)return;let m=0;const I=()=>{m=0;const B=s.getBoundingClientRect().top+s.clientHeight*.33,oe=s.querySelectorAll("[data-zid]");for(const ge of oe)if(ge.getBoundingClientRect().bottom>B){ca(ge.dataset.zid||null);return}},C=()=>{m||(m=requestAnimationFrame(I))};return s.addEventListener("scroll",C,{passive:!0}),window.addEventListener("resize",C),C(),()=>{s.removeEventListener("scroll",C),window.removeEventListener("resize",C),cancelAnimationFrame(m)}},[A,v,We,Ue,q.length]),g.useEffect(()=>{var m;const s=q.find(I=>I.id===(O||qe));s&&((m=M.current)==null||m.follow(Ce(s.world),s.okruh-1,s.n-1))},[qe,O,q,Bt]),g.useEffect(()=>{const s=Y.current,m=D.current;if(!ae||!s||!m)return;const I=()=>m.style.setProperty("--akv-top-h",`${Math.round(s.getBoundingClientRect().bottom)+a.md}px`);I();const C=new ResizeObserver(I);return C.observe(s),()=>C.disconnect()},[ae]),!ae)return t.jsx("div",{className:"akv-root",style:{position:"fixed",inset:0,background:e.surfaceBase}});const Ta=(s,m)=>n(`pack.ainubis.plane.${s}`,m),tt=s=>({WebkitMaskImage:`url(/icons/pack/${s}.svg)`,maskImage:`url(/icons/pack/${s}.svg)`}),ea=n("pack.ainubis.soon","soon"),Kt=s=>t.jsxs("nav",{className:`akv-planes ${s}`,"aria-label":"AINUBIS",children:[t.jsx("button",{type:"button",className:"akv-plane","aria-current":A==="vault"?"page":void 0,onClick:()=>ue("vault"),children:Ta("vault","Scrolls")}),t.jsx("button",{type:"button",className:"akv-plane","aria-current":A==="chat"?"page":void 0,disabled:!r,title:r?void 0:ea,onClick:()=>ue("chat"),children:Ta("chat","Chat")}),t.jsx("button",{type:"button",className:"akv-plane","aria-current":A==="wall"&&Ge!=="lib"?"page":void 0,disabled:!r,title:r?void 0:ea,onClick:()=>ue("wall"),children:Ta("wall","Forum")}),t.jsx("button",{type:"button",className:"akv-plane","aria-current":A==="wall"&&Ge==="lib"?"page":void 0,disabled:!r,title:r?void 0:ea,onClick:Je,children:Ta("sources","Sources")})]}),Ut=t.jsx("span",{className:"akv-chev","aria-hidden":!0,children:t.jsx(wa,{size:12})}),ot=[n("pack.ainubis.filter.allWorlds","All worlds"),...ke],tn=t.jsxs("div",{className:`akv-dd${ve>=0?" is-set":""}${Fe==="world"?" is-open":""}`,children:[t.jsxs("button",{type:"button",className:"akv-ddb","aria-haspopup":"listbox","aria-expanded":Fe==="world",onClick:s=>{s.stopPropagation(),c(m=>m==="world"?null:"world")},children:[t.jsx("span",{children:ot[ve+1]}),Ut]}),Fe==="world"&&t.jsx("div",{className:"akv-ddp",role:"listbox",children:ot.map((s,m)=>t.jsx("button",{type:"button",role:"option","aria-selected":ve===m-1,onClick:()=>{Qe(m-1),c(null)},children:s},s))})]}),Ft=(s,m)=>t.jsx("div",{className:"akv-dd",children:t.jsxs("button",{type:"button",className:"akv-ddb",disabled:!0,title:ea,children:[t.jsx("span",{children:n(`pack.ainubis.filter.${s}`,m)}),Ut]})}),nt=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(),xa=nt(b.trim()),Ht=ce.map((s,m)=>({w:s,i:m})).filter(({w:s,i:m})=>(ve<0||ve===m)&&(!xa||nt(`${ke[m]} ${n(`pack.ainubis.tease.${s.key}`,s.tease)}`).includes(xa))),on=s=>{E(s),s.trim()&&$("scroll")},Zt=t.jsxs("label",{className:"akv-search",children:[t.jsx(Hn,{size:14}),t.jsx("input",{type:"search",value:b,onChange:s=>on(s.target.value),placeholder:n("pack.ainubis.search","Search the Vault…"),"aria-label":n("pack.ainubis.search","Search the Vault…")})]}),nn=ve>=0?l("pack.map.filtersCount",{n:1}):l("pack.map.filters"),it=Object.keys(H).filter(s=>H[s]===2),oa={worlds:ce.filter(s=>it.some(m=>m.startsWith(`${s.key}-`))).length,circles:new Set(Q.filter(s=>it.includes(s.id)).map(s=>`${s.world}-${s.okruh}`)).size,scrolls:it.length},rt=oa.scrolls?Math.max(1,Math.round(oa.scrolls/Math.max(1,Ua)*100)):0,Gt=!!xa||ve>=0,Pa=q.filter(s=>(ve<0||Ce(s.world)===ve)&&(!xa||nt(`${Ve(s,p).t} ${Ve(s,p).v} ${Ha(s,p)}`).includes(xa))),Ma=Math.max(0,Pa.findIndex(s=>s.id===We)),rn=Gt||Ue?0:Ma,Jt=Pa.slice(rn),Ne=q.find(s=>s.id===qe)??Jt[0]??q[0],ua=Ne?Ce(Ne.world):-1,st=Ne?q.filter(s=>s.world===Ne.world):[],Yt=Ne?Array.from({length:ce[ua].circles},(s,m)=>st.filter(I=>I.okruh===m+1)):[],ga=s=>(H[s.id]||0)===2,Da=s=>{pa(!1),(ve>=0||b)&&(Qe(-1),E("")),q.findIndex(C=>C.id===s)<Ma&&da(!0),window.innerWidth<Le&&$("scroll");const I=C=>{const B=ma.current,oe=B==null?void 0:B.querySelector(`[data-zid="${s}"]`);if(!B||!oe){C>0&&window.setTimeout(()=>I(C-1),60);return}const ge=oe.getBoundingClientRect().top-B.getBoundingClientRect().top+B.scrollTop-a.lg;B.scrollTo({top:Math.max(0,ge),behavior:"smooth"})};requestAnimationFrame(()=>I(10))},Wt=s=>s.find(m=>!ga(m))??s[0];se.current.jump=Da,se.current.open=s=>N(s);const lt=s=>Object.keys(s.pod||{}).length>0,qt=s=>{var m;return!!((m=re[s.id])!=null&&m.listened_at)},Xt=n("magnet.ai.vault.h","The first circle is all yours"),Qt=n("magnet.ai.vault.p","10 scrolls with a podcast. The other {n} are guarded by a dog.").replace("{n}",String(q.filter(s=>!La(s.code)).length)),dt=s=>!r||La(s.code),Ca=q.filter(s=>lt(s)&&dt(s)&&!qt(s)),sn=()=>{Ca[0]&&(ka(!0),N(Ca[0].id,"pod"))},ln=()=>{const s=G?q.indexOf(G):-1,m=q.slice(s+1).find(I=>lt(I)&&dt(I)&&!qt(I));m?N(m.id,"pod"):ka(!1)},eo=q.filter(s=>lt(s)&&dt(s)),ao=s=>Ca.length>0&&t.jsxs("button",{type:"button",className:s,onClick:sn,children:[t.jsx("i",{"aria-hidden":!0}),n("pack.ainubis.listen","Listen to podcast")," ",t.jsxs("em",{children:[eo.indexOf(Ca[0])+1,"/",eo.length]})]}),to=s=>Ne&&t.jsxs("div",{className:`akv-pos ${s}`,style:$a(Ne.world),children:[t.jsx("span",{className:"akv-pos-ic","aria-hidden":!0,style:tt(ce[ua].ic)}),t.jsx("span",{className:"akv-pos-w",children:ke[ua]}),t.jsxs("span",{className:"akv-pos-c",title:Ha(Ne,p),children:["O",Ne.okruh," · ",Ha(Ne,p)]}),t.jsxs("span",{className:"akv-pos-n",children:[st.indexOf(Ne)+1,"/",st.length]}),t.jsxs("div",{className:"akv-pos-acts",children:[!Gt&&Ma>0&&t.jsxs("button",{type:"button",className:"akv-pos-b","aria-pressed":Ue,title:Ue?n("pack.ainubis.pos.hideRead","Hide read"):n("pack.ainubis.pos.read","Read"),onClick:()=>Ue?da(!1):Da(Pa[0].id),children:[t.jsx("span",{className:"akv-up","aria-hidden":!0,children:t.jsx(wa,{size:12})}),Ma]}),t.jsxs("button",{type:"button",className:"akv-pos-b","aria-haspopup":"listbox","aria-expanded":Ia,onClick:m=>{m.stopPropagation(),pa(I=>!I)},children:[n("pack.ainubis.pos.circles","Circles"),t.jsx("span",{className:"akv-chev","aria-hidden":!0,children:t.jsx(wa,{size:12})})]})]}),t.jsx("div",{className:"akv-pos-bar","aria-hidden":!0,children:Yt.map((m,I)=>t.jsx("div",{className:`pk-progress${I===Ne.okruh-1?" is-cur":""}`,style:{flex:Math.max(1,m.length)},children:t.jsx("div",{className:"pk-progress__fill",style:Xi(m.length?m.filter(ga).length/m.length:0)})},I))}),Ia&&t.jsxs(t.Fragment,{children:[t.jsx("span",{style:{position:"fixed",inset:0,zIndex:-1},onClick:()=>pa(!1),"aria-hidden":!0}),t.jsxs("div",{className:"akv-pos-dd",role:"listbox",children:[Yt.map((m,I)=>{const C=m.length>0&&m.every(ga);return t.jsxs("button",{type:"button",role:"option",disabled:!m.length,"aria-selected":I===Ne.okruh-1,className:`${I===Ne.okruh-1?"is-cur":""}${C?" is-done":""}`,onClick:()=>m.length&&Da(Wt(m).id),children:[t.jsxs("span",{children:["O",I+1," · ",Ie(ua,I)]}),t.jsxs("b",{children:[C&&t.jsx(ja,{size:12}),m.filter(ga).length,"/",m.length]})]},I)}),t.jsx("div",{className:"akv-pos-sec",children:n("pack.ainubis.pos.more","More worlds")}),ce.map((m,I)=>{if(I===ua)return null;const C=q.filter(B=>B.world===m.key);return t.jsxs("button",{type:"button",role:"option","aria-selected":!1,disabled:!C.length,style:$a(m.key),onClick:()=>C.length&&Da(Wt(C).id),children:[t.jsx("span",{className:"akv-pos-wdot","aria-hidden":!0}),t.jsx("span",{children:ke[I]}),t.jsx("b",{children:C.length?`${C.filter(ga).length}/${C.length}`:t.jsx("em",{children:ea})})]},m.key)})]})]})]}),dn=t.jsxs(t.Fragment,{children:[oa.scrolls,"/",Ua," ",n("pack.ainubis.stat.scrolls","scrolls")]}),cn=t.jsx(t.Fragment,{children:t.jsxs("b",{children:[rt," %"]})});return t.jsxs("div",{className:"akv-root has-zv",ref:D,"data-view":v,"data-plane":A,children:[t.jsx("style",{children:Yi}),t.jsxs("style",{children:[Bi,Pi]}),z,w,t.jsx("div",{className:"akv-bg","aria-hidden":!0}),t.jsxs("section",{className:"akv-brain","aria-label":n("pack.ainubis.view.brain","Brain"),children:[t.jsx("canvas",{ref:P}),t.jsx("div",{className:"akv-tip",ref:te,role:"status"}),t.jsxs("div",{className:"akv-ctl",children:[t.jsx("button",{type:"button",className:"akv-ctlbtn","aria-expanded":T,"aria-haspopup":"true","aria-label":n("pack.ainubis.layers","Layers"),title:n("pack.ainubis.layers","Layers"),onClick:s=>{s.stopPropagation(),Z(m=>!m)},children:t.jsx("i",{"aria-hidden":!0})}),T&&t.jsxs(t.Fragment,{children:[t.jsx("span",{style:{position:"fixed",inset:0,zIndex:-1},onClick:()=>Z(!1),"aria-hidden":!0}),t.jsxs("div",{className:"akv-lpanel",role:"group","aria-label":n("pack.ainubis.layers","Layers"),children:[t.jsx("b",{children:n("pack.ainubis.layers","Layers")}),er.map(s=>t.jsxs(g.Fragment,{children:[t.jsxs("button",{type:"button",className:"akv-lyr",disabled:!s.live,"aria-pressed":s.live&&X==="progress",onClick:s.live?()=>{const m=Ee.current==="progress"?"worlds":"progress";Ee.current=m,de(m)}:void 0,children:[t.jsx("u",{style:{background:`rgb(${s.rgb})`}}),n(`pack.ainubis.layer.${s.k}`,s.en),!s.live&&t.jsx("em",{children:ea})]}),s.live&&s.legend&&X==="progress"&&t.jsx("div",{className:"akv-leg",children:s.legend.map(m=>t.jsxs("span",{children:[t.jsx("u",{style:{background:`rgb(${m.rgb})`}}),n(`pack.ainubis.state.${m.k}`,m.en)]},m.k))})]},s.k))]})]})]})]}),z,w,A==="vault"&&t.jsxs("aside",{className:"pk-stage akv-scroll","aria-label":n("pack.ainubis.view.dogscroll","Dogscroll"),children:[t.jsxs("header",{className:"akv-lhead",children:[t.jsxs("div",{className:"akv-lhead-row",children:[t.jsxs("div",{children:[t.jsx("h1",{className:"akv-title",children:n("pack.ainubis.dogscroll.title","Dogscrolling")}),t.jsx("p",{className:"akv-claim",children:n("pack.ainubis.dogscroll.claim","Your dog will thank you for this scroll.")})]}),ao("akv-listen")]}),Kt("akv-planes-l"),to("akv-pos--l")]}),t.jsx("div",{className:"akv-list",ref:ma,children:t.jsxs("div",{className:"akv-col",children:[ao("akv-listen akv-listen--m"),Ht.length===0&&Pa.length===0&&t.jsx("p",{className:"akv-empty",children:n("pack.ainubis.noMatch","Nothing found.")}),r&&q.length>0&&t.jsx("div",{className:"akv-pvinfo",children:t.jsx(ko,{where:"list",h:Xt,p:Qt})}),Jt.map(s=>t.jsx(Li,{z:s,lang:p,worldName:ke[Ce(s.world)],onOpen:N,onShare:De,lock:r?()=>_():void 0,locked:!!r&&!La(s.code)},s.id)),Ht.filter(({w:s})=>!q.some(m=>m.world===s.key)).map(({w:s,i:m})=>t.jsxs("section",{id:`akv-w-${s.key}`,className:`akv-world${Ra===s.key?" is-flash":""}`,style:$a(s.key),children:[t.jsx("div",{className:"akv-wlbl",children:n("pack.ainubis.worldOf","World {n} of 7").replace("{n}",String(m+1))}),t.jsx("div",{className:"akv-wic","aria-hidden":!0,style:tt(s.ic)}),t.jsx("h2",{className:"akv-wname",children:ke[m]}),t.jsx("p",{className:"akv-wtease",children:n(`pack.ainubis.tease.${s.key}`,s.tease)}),t.jsx("span",{className:"akv-wsoon",children:n("pack.ainubis.opening","Expected opening: November 2026")})]},s.key)),h]})})]}),t.jsxs("div",{className:"akv-top",ref:Y,children:[!r&&t.jsx(Jn,{id:o,primary:dn,stats:cn,mStats:[{v:`${oa.scrolls}/${Ua}`,l:n("pack.ainubis.stat.scrolls","scrolls")},{v:`${rt} %`,l:n("pack.ainubis.stat.read","read")}],pcStats:[{v:`${oa.circles}/${ar}`,l:n("pack.ainubis.stat.circles","circles")},{v:`${oa.scrolls}/${Ua}`,l:n("pack.ainubis.stat.scrolls","scrolls")},{v:`${rt} %`,l:n("pack.ainubis.stat.read","read")}],onMe:()=>K("/pack/ainubis/knowledge")}),t.jsxs("div",{className:"akv-ptools",children:[Zt,t.jsxs("div",{className:"akv-filters",children:[tn,Ft("type","Type"),Ft("state","Status")]})]}),t.jsxs("div",{className:"akv-mtools",children:[Zt,t.jsxs("button",{type:"button",className:`akv-fbtn${ve>=0?" is-set":""}`,"aria-expanded":ye,onClick:()=>k(!0),children:[t.jsx("i",{"aria-hidden":!0}),nn]})]}),t.jsx("div",{className:"akv-toprow",children:Kt("akv-planes-t")}),to("akv-pos--t")]}),ye&&t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"akv-sback",onClick:()=>k(!1),"aria-hidden":!0}),t.jsxs("div",{className:"akv-sheet",role:"dialog","aria-label":l("pack.map.filters"),children:[t.jsx("button",{type:"button",className:"akv-grab",onClick:()=>k(!1),"aria-label":l("pack.map.filters")}),t.jsx("div",{className:"akv-sttl",children:l("pack.map.filters")}),t.jsxs("div",{className:"akv-sgrp",children:[t.jsx("b",{children:n("pack.ainubis.filter.world","World")}),t.jsx("div",{className:"akv-chips",children:ot.map((s,m)=>t.jsx("button",{type:"button",className:"akv-chip","aria-pressed":ve===m-1,onClick:()=>{Qe(m-1),k(!1),$("scroll")},children:s},s))})]}),[["type","Type"],["state","Status"]].map(([s,m])=>t.jsx("div",{className:"akv-sgrp",children:t.jsxs("b",{children:[n(`pack.ainubis.filter.${s}`,m)," · ",t.jsx("em",{children:ea})]})},s))]})]}),t.jsx("div",{className:"akv-mactions",children:t.jsxs("button",{type:"button",className:"akv-mtoggle",onClick:()=>$(s=>s==="brain"?"scroll":"brain"),children:[t.jsx("i",{"aria-hidden":!0,style:tt(v==="brain"?"menu":"idea")}),v==="brain"?n("pack.ainubis.view.dogscroll","Dogscroll"):n("pack.ainubis.view.brain","Brain")]})}),A==="vault"&&!r&&!R&&!G&&t.jsx(jn,{avatarUrl:o.avatarUrl,avatarInitial:o.avatarInitial,dogs:o.dogs}),G&&t.jsx(Zi,{z:G,all:Q,lang:p,focus:$e,onClose:ee,onOpen:s=>N(s),onUse:ne,onShare:De,queue:Oa,onNext:ln,lock:r?()=>_():void 0}),R&&!G&&t.jsx(Mi,{scrolls:Q,lang:p,avatarUrl:o.avatarUrl,avatarInitial:o.avatarInitial,who:(o.dogs??[]).map(s=>s.dog_name).filter(Boolean).join(" · "),worldName:s=>ke[ce.findIndex(m=>m.key===s)]||s,onClose:()=>K("/pack/ainubis"),onOpen:s=>N(s)}),r&&q.length>0&&!G&&t.jsx("div",{className:"akv-pvdock",children:t.jsx(ko,{where:"dock",h:Xt,p:Qt})}),he&&t.jsx("div",{className:"zv-toast",role:"status",children:he}),!r&&t.jsx(Sn,{})]})}export{Lr as default};
