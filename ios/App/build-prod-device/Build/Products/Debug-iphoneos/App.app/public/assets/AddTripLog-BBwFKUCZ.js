var $i=Object.defineProperty;var Si=(t,l,p)=>l in t?$i(t,l,{enumerable:!0,configurable:!0,writable:!0,value:p}):t[l]=p;var qn=(t,l,p)=>Si(t,typeof l!="symbol"?l+"":l,p);import{T as x,Z as _,P as r,G as wr,u as Na,r as o,aB as Oi,j as e,h as Er,D as sn,U as me,c as pt,$ as ua,L as C,b as ct,aA as uo,H as ke,m as ne,X as Di,aO as Pi,ak as mo,B as Mi,b4 as Qn,a7 as Ii}from"./index-7PctGTam.js";import{A as Ci}from"./ainubisSheet-CiRwHrIt.js";import{L as F,N as Rt,O as Lt,_ as Ri,j as Li,q as Fi,i as Ki,$ as er,a0 as $r,a1 as Vi,a2 as _i,a3 as Bi,C as Ui,D as ar,a4 as Zi,a5 as Hi}from"./useLongPressPoint-DxcFLmtS.js";import{o as Ji}from"./ainubisBus-BMRzmB2O.js";import{A as tr}from"./ainubisSkin-B7Z96MPq.js";import{H as Gi}from"./packStore-C-dKFjs1.js";import{s as ut,l as Wi}from"./cloudinaryService-DFfDUqVM.js";import{HUMAN_KEY_PREFIX as mn,INVITE_KEY_PREFIX as ko,searchTripCompanions as Yi}from"./packHumans-CM8dSSnN.js";import{P as Xi}from"./PhotoSortGrid-DJjVLYAA.js";import{b as co,a as or,c as Sr,d as Or}from"./BackButton-DiG140MZ.js";import{g as qi,j as Qi,k as es}from"./useMapNotes-DpSHId3Y.js";import{HERO_JOURNEYS as Wo}from"./data-journeys-qHcguO2r.js";import{t as as,e as ts}from"./countryGeo-BaPfaSrG.js";import{c as os}from"./countryOptions-CG9gF3Su.js";import{t as ns}from"./triplist-C4SNPPZY.js";import{_ as rs,N as is,T as re,B as ss,E as ls,a5 as ds,D as ps,z as cs,P as us}from"./tripShared-DJ5J49O6.js";import{e as Ba,k as kn,n as ms,l as ks,o as hs,O as Va,q as bs,a as gs,t as vs,u as fs,j as xs,h as ys,v as so,f as js}from"./addTripModel-BuQrZHBF.js";import{t as Dr,o as Ua,q as nr,r as ln,v as ho,x as bo,y as rr,z as Pr,A as Za,S as dn,B as zs,H as Yo,C as Ns,D as As,E as Ts}from"./wishData-CXFfCW3P.js";import{e as Xo,f as ir}from"./PackMap-BDRzGVqQ.js";import{P as ws}from"./PlaceSearch-ju3ihtkj.js";import{p as Es}from"./HandIcons-Dh9PgzA0.js";import{E as $s,T as Ss,F as ca,b as pn,H as sr,M as Os}from"./NotePalette-BOXglX1e.js";import{M as da,o as Ds}from"./photoOptimize-CH60jkBI.js";import{G as lr,b as Ps,c as Ms,d as Is,D as Cs}from"./tripGrade-C1_gNV79.js";import{n as qo,C as Rs}from"./packCommunity-DpJx2p71.js";import{P as Qo}from"./tripPoints-B8mfj7VK.js";import{g as en,G as dr}from"./mapNotesData-BT8C1Ysp.js";import{a as an}from"./ainubis-head-g4iOYlxZ.js";import{p as tn}from"./dogEvents-DNw7GPsn.js";import"./devMockDogs-BzGWz4qV.js";import"./dogRights-BxAmrGwt.js";import"./BrandIcon-C4Fdumu_.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Dyn0GD-G.js";import"./pawmateRights-DJDDFQlT.js";import"./memberProfile-BUUVjgd0.js";import"./packProfile-DFxYPxfm.js";import"./RightGate-D9upYetj.js";import"./use-toast-CpgRElRJ.js";import"./PackLayout-DbvN9q62.js";import"./magnetPreview-DhLqLXgw.js";import"./chataNahlad-BvQ_JlDS.js";import"./wizAnchors-E3ARHgZI.js";import"./consent-28X3-hgX.js";import"./usePackStoreEpoch-At2oJSpO.js";import"./data-trails-C7pS6eM2.js";import"./packTiers-0E8WcxgQ.js";import"./FlagCircle-D0VQxthA.js";import"./flagUrl-B21iQI9I.js";import"./AvatarRing-ChywS2uK.js";import"./countryBorders-Au6lKVD2.js";import"./toast-CrLZpm2B.js";import"./index-BN2XfMjq.js";import"./utils-BvqHaJDB.js";import"./index-D1GlWhro.js";import"./x-fstyOaqw.js";import"./createLucideIcon-Di02PK5p.js";import"./tripPlaceholder-DR6_6X-Q.js";import"./packMessaging-CwxRlYTq.js";import"./handArrowLeft-BUyUUYuC.js";class Ft extends Error{constructor(p){super(p);qn(this,"code");this.code=p}}async function Ls(t){const l=await t.slice(0,1024).text();if(!/<gpx[\s>]/i.test(l))throw new Ft("notGpx");return t.text()}function Fs(t){var v;const l=new DOMParser().parseFromString(t,"application/xml");if(l.querySelector("parsererror"))throw new Ft("broken");const p=l.documentElement;if(!p||p.tagName.toLowerCase()!=="gpx")throw new Ft("notGpx");const u=Array.from(l.getElementsByTagName("trkpt")),g=u.length>0?u:Array.from(l.getElementsByTagName("rtept")),S=[];for(const A of g){const f=parseFloat(A.getAttribute("lat")||""),k=parseFloat(A.getAttribute("lon")||"");!Number.isFinite(f)||!Number.isFinite(k)||S.push({lat:f,lon:k,time:((v=A.getElementsByTagName("time")[0])==null?void 0:v.textContent)||null})}if(S.length<2)throw new Ft("empty");return{points:S,creator:p.getAttribute("creator")}}function Ks(t){const l=(t||"").toLowerCase();return l.includes("strava")?"Strava":l.includes("garmin")?"Garmin":l.includes("mapy")?"Mapy.com":l.includes("komoot")?"Komoot":t||"GPX"}function Vs(t,l){return[t[1]*111320*Math.cos(l*Math.PI/180),t[0]*110540]}function _s(t,l,p){const u=p[0]-l[0],g=p[1]-l[1],S=u*u+g*g;if(S===0)return Math.hypot(t[0]-l[0],t[1]-l[1]);const v=((t[0]-l[0])*u+(t[1]-l[1])*g)/S;return Math.hypot(t[0]-(l[0]+v*u),t[1]-(l[1]+v*g))}function cn(t,l){if(t.length<3)return t.slice();const p=t[Math.floor(t.length/2)][0],u=t.map(v=>Vs(v,p)),g=new Array(t.length).fill(!1);g[0]=!0,g[t.length-1]=!0;const S=[[0,t.length-1]];for(;S.length;){const[v,A]=S.pop();if(A<=v+1)continue;let f=-1,k=-1;for(let D=v+1;D<A;D++){const K=_s(u[D],u[v],u[A]);K>f&&(f=K,k=D)}f>l&&(g[k]=!0,S.push([v,k],[k,A]))}return t.filter((v,A)=>g[A])}const Bs=20,pr=40;function Mr(t){if(t.length<=pr)return t.slice();let l=0,p=5e3,u=cn(t,p);for(let g=0;g<24&&p-l>.5;g++){const S=(l+p)/2;if(u=cn(t,S),u.length>pr)l=S;else if(u.length<Bs)p=S;else return u}return u}function Us(t,l){const p=new Set([...cn(t,3),...l]);return t.filter(u=>p.has(u))}function Zs(t){if(!t)return;const l=new Date(t);if(!Number.isNaN(l.getTime()))return`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`}async function Hs(t){var v;const l=await Ls(t),{points:p,creator:u}=Fs(l),g=p.map(A=>[A.lat,A.lon]),S=Mr(g);return{anchors:S,track:Us(g,S),date:Zs(((v=p.find(A=>A.time))==null?void 0:v.time)??null),app:Ks(u),originalName:t.name}}const Js=9,Gs=6,Ws=.45,Ys=3,Xs=12,cr=.6,za=16,ur=22,lo=12,qs=150,mr=(t,l,p)=>{let g=Gs+(t-Js)*Ws;if(l&&p&&p.x>0&&p.y>0){const S=Math.max(Math.log2(l.x/(p.x*cr)),Math.log2(l.y/(p.y*cr)));g=Math.min(g,t-Math.max(0,S))}return Math.max(Ys,Math.min(Xs,Math.floor(g)))},Qs=`
/* Ten istý materiál ako prevýšenie o kus nižšie v stĺpci — jeden zdroj (goldFrameCSS()),
   nie druhá sada čísel. Náhľad sa renderuje len na PC, takže tu nie je media query;
   keby raz zliezol na telefón, dostane vetvu, nie prepísané hodnoty. */
.trp-mini{${wr()}align-self:stretch;width:auto;margin:0;flex:0 0 auto;position:relative;overflow:hidden;padding:9px 11px 11px;}
.trp-mini-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px;font-family:${x};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${_.dim};}
.trp-mini-canvas{position:relative;width:100%;height:${qs}px;border-radius:10px;overflow:hidden;background:${r.pageBg};}
/* Náhľad sa NEZOOMUJE ani neposúva vlastnými gestami — jediné, čo v ňom človek robí, je
   ťahanie výrezu (nižšie). Bez tohto by koliesko nad ním odzoomovalo náhľad a hlavná mapa
   by ostala, kde bola.
   ⚠️ ROZMER SEM NEPATRÍ. Triedu leaflet-container si Leaflet pridá na SAMO plátno, takže
   toto pravidlo je špecifickejšie než pravidlo nad ním — height:100% by prebilo pevnú výšku,
   nemalo by sa o čo oprieť (rodič výšku nemá) a plátno by spadlo na 21 px. */
.trp-mini-canvas.leaflet-container{background:${r.pageBg};cursor:default;}
.trp-mini-canvas.is-grab{cursor:grab;}
.trp-mini-canvas.is-drag{cursor:grabbing;}
/* ⚠️ OBDĹŽNIK JE SVG path, NIE BOX — border/box-shadow naň neplatia a rámik by ostal
   neviditeľný. Farbu a hrúbku nesú Leaflet options, dosvit (aby fialová držala aj na
   svetlých dlaždiciach) sa dá pripísať len filtrom — je to ten istý recept, akým svieti
   trasa na mape (.trp-saber-glow v tripShared). */
.trp-mini-box{filter:drop-shadow(0 0 1px rgba(0,0,0,0.65)) drop-shadow(0 0 6px rgba(${r.tripPurpleRGB},0.85));}
/* Značka pod prahom rozmeru — tá istá jedna fialová, len bez rozmeru výrezu. */
.trp-mini-dot{width:${za}px;height:${za}px;box-sizing:border-box;border:2px solid ${r.tripPurple};border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,0.65),0 0 8px rgba(${r.tripPurpleRGB},0.85);background:rgba(${r.tripPurpleRGB},0.22);}
`;function el({mapRef:t}){const l=Na(),p=o.useRef(null),u=o.useRef(null),g=o.useRef(null),S=o.useRef({w:0,h:0}),v=o.useRef(null);return o.useEffect(()=>{const A=p.current,f=t.current;if(!A||!f)return;const k=F.map(A,{attributionControl:!1,zoomControl:!1,dragging:!1,scrollWheelZoom:!1,doubleClickZoom:!1,boxZoom:!1,keyboard:!1,touchZoom:!1,inertia:!1}).setView(f.getCenter(),mr(f.getZoom()));F.tileLayer(Oi("outdoor")).addTo(k),u.current=k;const D=()=>k.latLngToContainerPoint(f.getCenter()),K=V=>{const $=D(),B=Math.max(S.current.w,ur)/2,te=Math.max(S.current.h,ur)/2;return Math.abs(V.x-$.x)<=B&&Math.abs(V.y-$.y)<=te},P=()=>{g.current&&(k.removeLayer(g.current),g.current=null);const V=f.getBounds(),$=k.latLngToContainerPoint(V.getNorthWest()),B=k.latLngToContainerPoint(V.getSouthEast()),te=Math.abs(B.x-$.x),oe=Math.abs(B.y-$.y);S.current={w:te,h:oe},g.current=te>=za&&oe>=za?F.rectangle(V,{className:"trp-mini-box",color:r.tripPurple,weight:2,opacity:1,fillColor:r.tripPurple,fillOpacity:.14,interactive:!1}):F.marker(f.getCenter(),{interactive:!1,icon:F.divIcon({className:"",html:'<div class="trp-mini-dot"></div>',iconSize:[za,za],iconAnchor:[za/2,za/2]})}),g.current.addTo(k)};let m=0;const E=()=>{m=0;const V=t.current;if(!V||!u.current)return;const $=mr(V.getZoom(),V.getSize(),k.getSize());let B=k.getZoom()!==$;if(!B&&!v.current){const te=V.getBounds(),oe=k.latLngToContainerPoint(te.getNorthWest()),De=k.latLngToContainerPoint(te.getSouthEast()),Pe=k.getSize();B=oe.x<lo||oe.y<lo||De.x>Pe.x-lo||De.y>Pe.y-lo}B&&k.setView(V.getCenter(),$,{animate:!1}),P()},T=()=>{m||(m=requestAnimationFrame(E))},R=V=>{if(V.button!==0)return;const $=k.mouseEventToContainerPoint(V);if(!K($))return;V.preventDefault();const B=D();v.current={dx:$.x-B.x,dy:$.y-B.y},A.classList.add("is-drag"),window.addEventListener("mousemove",G),window.addEventListener("mouseup",xe)},G=V=>{const $=v.current,B=t.current;if(!$||!B)return;V.preventDefault();const te=k.mouseEventToContainerPoint(V),oe=k.containerPointToLatLng(F.point(te.x-$.dx,te.y-$.dy));B.setView(oe,B.getZoom(),{animate:!1})},xe=()=>{v.current=null,A.classList.remove("is-drag"),window.removeEventListener("mousemove",G),window.removeEventListener("mouseup",xe),T()},n=V=>{v.current||A.classList.toggle("is-grab",K(k.mouseEventToContainerPoint(V)))},ma=()=>{v.current||A.classList.remove("is-grab")};return A.addEventListener("mousedown",R),A.addEventListener("mousemove",n),A.addEventListener("mouseleave",ma),E(),f.on("move",T),f.on("zoom",T),()=>{f.off("move",T),f.off("zoom",T),A.removeEventListener("mousedown",R),A.removeEventListener("mousemove",n),A.removeEventListener("mouseleave",ma),window.removeEventListener("mousemove",G),window.removeEventListener("mouseup",xe),m&&cancelAnimationFrame(m),v.current=null,g.current=null,u.current=null,k.remove()}},[t]),e.jsxs("div",{className:"trp-mini",children:[e.jsx("div",{className:"trp-mini-head",children:e.jsx("span",{children:l("pack.addTrip.geo.overview")})}),e.jsx("div",{className:"trp-mini-canvas",ref:p})]})}const He=r.cardEdge,al="#F5C73D",Ir=120,_a=16,Cr=50,Rr=5e3,Kt=100,Ha=(()=>{const t=[];for(let l=Cr;l<=500;l+=25)t.push(l);for(let l=550;l<=1e3;l+=50)t.push(l);for(let l=1100;l<=Rr;l+=100)t.push(l);return t})(),tl=.35,kr=t=>{let l=0;for(let p=1;p<Ha.length;p++)Math.abs(Ha[p]-t)<Math.abs(Ha[l]-t)&&(l=p);return l},ol=300,nl=.2;function rl(t,l,p=!1,u){return kn(t,p,u).default}function il(t,l=!1,p){return kn(t,l,p).allowed}function sl(t,l){if(t.kind!=="route")return null;const p=t.snapPath??t.path;if(p.length<2)return null;const u=Dr(p)/1e3;for(const g of l){if(!g.path||g.path.length<2||Ua(p[0],g.path[0])>ol)continue;const S=parseFloat(g.km);if(!(!Number.isFinite(S)||S<=0)&&Math.abs(S-u)/S<=nl)return g}return null}function ll(){const[t,l]=o.useState(()=>{var p;return typeof window<"u"&&((p=window.matchMedia)==null?void 0:p.call(window,`(min-width:${uo}px)`).matches)===!0});return o.useEffect(()=>{var g;const p=(g=window.matchMedia)==null?void 0:g.call(window,`(min-width:${uo}px)`);if(!p)return;const u=()=>l(p.matches);return p.addEventListener("change",u),()=>p.removeEventListener("change",u)},[]),t}const hr=7,br=t=>F.circleMarker(t,{radius:9,stroke:!1,fillColor:re.mid,fillOpacity:.55,className:"trp-anchor-halo",interactive:!1});function dl({value:t,onChange:l,activity:p,multiDay:u=!1,chip:g,mode:S,allTrails:v,onPickExisting:A,onMetrics:f,mapRef:k,mirrorRef:D,snapAllRef:K,onGpx:P,drawBar:m}){var tt;const E=Na(),{lang:T}=Er(),R=o.useRef([]),G=(i,d)=>!!i&&!!d&&i[0]===d[0]&&i[1]===d[1],xe=t.kind==="route"?t.path:void 0,n=o.useRef(xe??[]),ma=o.useRef(new WeakSet);o.useEffect(()=>{xe&&ma.current.has(xe)||(n.current=xe??[])},[xe]);const V=o.useRef(0),[$,B]=o.useState(!1),[te,oe]=o.useState(null),[De,Pe]=o.useState(!1),[Aa,Ta]=o.useState(null);o.useEffect(()=>{if(!Aa)return;const i=window.setTimeout(()=>Ta(null),pl);return()=>window.clearTimeout(i)},[Aa]);const[b,Me]=o.useState(!1),[M,U]=o.useState(!1),Je=o.useRef(0),wa=o.useRef(0),Ne=o.useRef([]),ka=()=>{const i=Date.now();return Ne.current=Ne.current.filter(d=>i-d<6e4),Ne.current.length<cl},ie=(i,d)=>(Ne.current.push(Date.now()),zs(i,d));o.useEffect(()=>{if(!b)return;const i=window.setTimeout(()=>Me(!1),8e3);return()=>window.clearTimeout(i)},[b]),o.useEffect(()=>{if(!De)return;const i=window.setTimeout(()=>Pe(!1),nr()+500);return()=>window.clearTimeout(i)},[De]);const[be,Ge]=o.useState(null),[Ja,ee]=o.useState(null),[Ea,Ie]=o.useState(!1),[We,Ga]=o.useState(!1),$a=o.useMemo(()=>il(p,u,g),[p,u,g]),ye=o.useMemo(()=>t.kind==="route"?t.snapPath??t.path:[],[t]),Ye=o.useMemo(()=>ye.length>1?Dr(ye)/1e3:0,[ye]),W=o.useCallback(i=>{const d=t.kind==="route"?t:{kind:"route",path:[],snapped:!1};i.path&&(n.current=i.path,ma.current.add(i.path)),l({...d,...i,kind:"route"})},[t,l]),je=t.kind==="route"?t.path:[],pe=t.kind==="route"&&!!t.minimal;t.kind==="route"&&t.targetIdx,t.kind==="route"&&t.returnMode;const ce=(t.kind==="route"?je.length>0:!!t.center)?2:0;o.useEffect(()=>{f==null||f({km:pe?0:Ye,ascentM:pe?null:be,minutes:pe?null:Xo(Ye,be,Ja),points:t.kind==="route"?t.path.length:0})},[Ye,be,Ja,t,f,pe]);const se=o.useCallback(async(i,d=0)=>{if(i.length<2){Ge(null),ee(null),Ie(!1);return}const j=++V.current,N=ln(i,dn),h=ho(N);if(Ie(h>0),h<N.length&&(Ge(bo(i,Za)),ee(rr(i,Za))),h>0){if(await Pr(N),j!==V.current)return;Ge(bo(i,Za)),ee(rr(i,Za));const y=ho(N)>0;if(Ie(y),y&&d<5){const I=Math.max(nr(),5e3*2**d);setTimeout(()=>{j===V.current&&Ae.current(i,d+1)},I)}}},[]),Ae=o.useRef(se);Ae.current=se;const ge=o.useCallback(i=>{if(i.length<2)return i.slice();const d=[i[0]];for(let j=0;j<i.length-1;j++){const N=R.current[j],h=N&&N.length>=2?N.slice(1):[i[j+1]];d.push(...h)}return d},[]),Te=i=>i==="paused"?m?null:E("pack.addTrip.geo.noticePaused"):i==="ratelimited"?m?null:E("pack.addTrip.ainubis.ratelimited"):i==="error"?m?null:E("pack.addTrip.geo.noticeStraight"):i==="straight"?E("pack.addTrip.geo.noticeStraight"):null,Ce=o.useCallback(async(i,d)=>{var J;const j=[i,d];if(m!=null&&m.active){const Y=k.current;if(Y){const $e=Y.latLngToContainerPoint(j),Ze=Y.getSize().y-Ir-40;$e.y>Ze&&Y.panBy([0,$e.y-Ze],{animate:!0,duration:.35})}}if(t.kind==="point"){l({kind:"point",center:j});return}if(t.kind==="area"){if(!t.center&&(((J=k.current)==null?void 0:J.getZoom())??0)<Ba)return;l({kind:"area",center:j,radiusM:t.radiusM||Kt});return}if(t.minimal){const Y=t.path.length>=2?[t.path[0],j]:[...t.path,j];R.current=[],W({path:Y,snapPath:void 0,snapped:!1,targetIdx:Y.length===2?1:void 0,returnMode:void 0,mirroredFrom:void 0});return}const N=[...t.path,j];if(N.length===1){W({path:N,snapPath:void 0,snapped:!1});return}if(R.current[N.length-2]=[N[N.length-2],j],W({path:N,snapPath:ge(N)}),Ua(N[N.length-2],j)<ul?Je.current+=1:(Je.current=0,Me(!1)),Je.current>=3&&Date.now()-wa.current>3e4&&(wa.current=Date.now(),Me(!0)),!ka()){Pe(!0),se(ge(N));return}B(!0);const h=await ie(N[N.length-2],j);B(!1),oe(Te(h.reason)),Pe(h.reason==="ratelimited"),Ta(h.reason==="paused"||h.reason==="error"?h.reason:null),R.current[N.length-2]=h.geometry;const y=n.current;if(y.length<N.length||!G(y[N.length-1],j))return;const I=y.length>N.length?y:N,L=ge(I);W({path:I,snapPath:L,snapped:t.snapped||h.snapped}),se(L),kt()},[t,l,W,ge,se,m==null?void 0:m.active,k]),kt=async()=>{var h;const i=n.current;let d=!1;for(let y=0;y<i.length-1;y++){const I=R.current[y];if(!I||I.length!==2||Ua(i[y],i[y+1])<40)continue;if(!ka())break;const L=await ie(i[y],i[y+1]);if(!G(n.current[y+1],i[y+1]))return;if(L.reason==="ratelimited"&&Pe(!0),(L.reason==="paused"||L.reason==="error")&&Ta(L.reason),L.reason==="ratelimited"||L.reason==="error"||L.reason==="paused")break;L.snapped&&((h=R.current[y])==null?void 0:h.length)===2&&(R.current[y]=L.geometry,d=!0)}if(!d||!G(n.current[i.length-1],i[i.length-1]))return;const j=n.current,N=ge(j);W({path:j,snapPath:N,snapped:!0}),se(N)},ht=async()=>{if(t.kind!=="route"||pe)return null;const i=n.current;if(i.length<2)return null;we(i,t.snapPath);const d=[];for(let h=0;h<i.length-1;h++){const y=R.current[h];(!y||y.length===2)&&Ua(i[h],i[h+1])>=ml&&d.push(h)}if(!d.length)return null;U(!0),B(!0);let j=!1;try{for(const h of d){const y=await ie(i[h],i[h+1]);if(y.reason==="ratelimited"){Pe(!0);break}if(y.reason==="paused"||y.reason==="error"){Ta(y.reason);break}y.snapped&&(R.current[h]=y.geometry,j=!0)}}finally{B(!1),U(!1)}if(!j)return null;const N=ge(i);return W({path:i,snapPath:N,snapped:!0}),await se(N),N},Re=o.useRef(ht);Re.current=ht,o.useEffect(()=>{if(K)return K.current=()=>Re.current(),()=>{K.current=null}},[K]);const we=o.useCallback((i,d)=>{const j=i.length-1;if(j<1||R.current.slice(0,j).filter(J=>J&&J.length>=2).length===j)return;const h=d??[];if(h.length<2)return;const y=[0];let I=0;for(let J=1;J<i.length;J++){let Y=I,$e=1/0;for(let Ze=I;Ze<h.length;Ze++){const At=Ua(h[Ze],i[J]);At<$e&&($e=At,Y=Ze)}y.push(Y),I=Y}const L=[];for(let J=0;J<j;J++){const Y=h.slice(y[J],y[J+1]+1);L.push(Y.length>=2?Y:[i[J],i[J+1]])}R.current=L},[]);o.useEffect(()=>{t.kind!=="route"||t.path.length<2||we(t.path,t.snapPath)},[t,we]);const Sa=o.useRef(null),[_t,Wa]=o.useState(!1);o.useEffect(()=>{je.length===0&&Wa(!1)},[je.length]);const vo=o.useCallback(async i=>{oe(null);try{const d=await Hs(i);R.current=[],we(d.anchors,d.track),l({kind:"route",path:d.anchors,snapPath:d.track,snapped:!0}),Wa(!0),se(d.track),P==null||P({date:d.date,app:d.app,originalName:d.originalName});const j=k.current;j&&j.fitBounds(F.latLngBounds(d.track),{...Rt(Lt()),animate:!0,duration:.4})}catch(d){const j=d instanceof Ft?d.code:"broken";oe(E(`pack.addTrip.geo.gpxErr.${j}`))}},[we,l,se,P,k,E]),Le=o.useCallback(()=>{if(t.kind!=="route"||t.path.length<2)return;const i=t.path,d=i.length;we(i,t.snapPath);const j=R.current.slice(0,d-1),N=[...i,...i.slice(0,-1).reverse()];R.current=[...j,...j.slice().reverse().map(I=>I.slice().reverse())];const h=ge(N);W({path:N,snapPath:h,returnMode:"mirror",mirroredFrom:d,targetIdx:t.targetIdx}),se(h);const y=k.current;y&&h.length>=2&&y.fitBounds(F.latLngBounds(h),{...Rt(Lt()),animate:!0,duration:.4})},[t,W,ge,se,we,k]);o.useEffect(()=>{if(D)return D.current=Le,()=>{D.current=null}},[D,Le]);const Ee=!!(m!=null&&m.paused),Z=ll(),Be=!!(m!=null&&m.active)&&!Ee&&!Z&&t.kind==="route"&&t.path.length===0,ha=o.useCallback((i,d)=>{Ee||Be||Ce(i,d)},[Ee,Be,Ce]),fo=!!(m!=null&&m.active)&&!Ee&&Be,Bt=o.useRef(Ce);o.useEffect(()=>{Bt.current=Ce},[Ce]);const bt=o.useRef(()=>{});o.useEffect(()=>{bt.current=(i,d)=>{if(Be){Bt.current(i,d);return}}},[Be]),Ri(k.current,fo,{onPoint:(i,d)=>bt.current(i,d)},Ba);const gt=o.useCallback(()=>{if(t.kind!=="route"||t.path.length===0)return;if(oe(null),we(t.path,t.snapPath),t.mirroredFrom&&t.path.length===t.mirroredFrom*2-1){const N=t.path.slice(0,t.mirroredFrom);R.current=R.current.slice(0,Math.max(0,N.length-1));const h=N.length>1?ge(N):void 0;W({path:N,snapPath:h,mirroredFrom:void 0,returnMode:void 0}),h?se(h):(Ge(null),ee(null));return}const i=t.path.slice(0,-1);R.current=R.current.slice(0,Math.max(0,i.length-1));const d=i.length>1?ge(i):void 0,j=t.targetIdx!==void 0&&t.targetIdx<i.length?t.targetIdx:void 0;W({path:i,snapPath:d,targetIdx:j,returnMode:j===void 0?void 0:t.returnMode}),d?se(d):(Ge(null),ee(null))},[t,W,ge,se,we]),Ut=o.useCallback(()=>{R.current=[],Ge(null),ee(null),oe(null),t.kind==="route"?l({kind:"route",path:[],snapPath:void 0,snapped:!1,minimal:t.minimal}):t.kind==="point"?l({kind:"point",center:void 0}):l({kind:"area",center:void 0,radiusM:Kt})},[t,l]),Ya=o.useCallback(i=>{i!==t.kind&&(R.current=[],Ge(null),ee(null),oe(null),l(i==="route"?{kind:"route",path:[],snapPath:void 0,snapped:!1}:i==="point"?{kind:"point",center:void 0}:{kind:"area",center:void 0,radiusM:Kt}))},[t.kind,l]);o.useEffect(()=>{if(t.kind!=="route")return;const i=Math.max(0,t.path.length-1);R.current.length!==i&&(R.current=Array.from({length:i},(d,j)=>[t.path[j],t.path[j+1]]))},[t]);const Fe=o.useRef(ha),Xa=Li(!0);o.useEffect(()=>{Fe.current=ha},[ha]),o.useEffect(()=>{const i=k.current;if(!i)return;const d=j=>{Fe.current(j.latlng.lat,j.latlng.lng)};return i.on("click",d),()=>{i.off("click",d)}},[k]);const ve=o.useRef([]),[vt,H]=o.useState(0);o.useEffect(()=>{const i=k.current;if(!i)return;ve.current.forEach(h=>i.removeLayer(h)),ve.current=[];const d=h=>{h.addTo(i),ve.current.push(h)};rs(),vl();const j=is(i.getZoom());if(t.kind==="route"&&A){const h=i.getBounds();v.filter(y=>{var I;return((I=y.path)==null?void 0:I.length)>1&&h.intersects(F.latLngBounds(y.path))}).slice(0,120).forEach(y=>{const I=F.polyline(Fi(y,Xa),{color:re.light,weight:2.5,opacity:.4,interactive:!0});I.on("click",L=>{F.DomEvent.stopPropagation(L),A(y)}),I.bindTooltip(y.name,{direction:"top",opacity:.9}),d(I)})}if(t.kind==="route"&&t.minimal&&ye.length>1?d(F.polyline(ye,{color:re.light,weight:3,opacity:.85,dashArray:"2 9",lineCap:"round",interactive:!1})):t.kind==="route"&&ye.length>1&&(ss.forEach(h=>{d(F.polyline(ye,{color:h.color,weight:Math.max(.8,h.weight*j),opacity:h.opacity,lineCap:"round",lineJoin:"round",className:"glow"in h&&h.glow&&j>=.7?"trp-saber-glow":void 0,interactive:!1}))}),bl(i,ye).forEach(d)),t.kind==="route"&&(t.path.forEach((h,y)=>{const I=y===t.path.length-1;I&&d(br(h)),d(F.circleMarker(h,{radius:y===0?6:4.5,color:re.edge,weight:2,fillColor:I?re.light:re.mid,fillOpacity:1,className:I?"trp-anchor-live":void 0,interactive:!1}))}),t.path.length>0)){const h=t.path[0],y=t.path[t.path.length-1],I=t.returnMode==="mirror"||t.path.length>2&&Math.abs(h[0]-y[0])<1e-6&&Math.abs(h[1]-y[1])<1e-6,L=(J,Y,$e="")=>d(F.marker(J,{icon:F.divIcon({className:"",html:`<span class="trp-anchor-tag${$e}">${Y}</span>`,iconSize:[0,0],iconAnchor:[0,0]}),interactive:!1,keyboard:!1,zIndexOffset:400}));L(h,E(I?"pack.addTrip.geo.labelStartEnd":"pack.addTrip.geo.labelStart")),!I&&t.path.length>1&&L(y,E("pack.addTrip.geo.labelEnd"))}t.kind==="route"&&t.targetIdx!==void 0&&t.path[t.targetIdx]&&(d(F.marker(t.path[t.targetIdx],{icon:F.divIcon({className:"mk-wrap",html:Ki(Ss,$s)}),interactive:!1,keyboard:!1,zIndexOffset:500})),d(F.marker(t.path[t.targetIdx],{icon:F.divIcon({className:"",html:`<span class="trp-anchor-tag trp-anchor-tag--target">${E("pack.addTrip.geo.labelTarget")}</span>`,iconSize:[0,0],iconAnchor:[0,0]}),interactive:!1,keyboard:!1,zIndexOffset:501}))),t.kind==="point"&&t.center&&(d(br(t.center)),d(F.circleMarker(t.center,{radius:7,color:re.edge,weight:2,fillColor:re.light,fillOpacity:1,className:"trp-anchor-live",interactive:!1}))),t.kind==="area"&&t.center&&(d(F.circle(t.center,{radius:t.radiusM,color:re.mid,weight:2,fillColor:re.mid,fillOpacity:.12,interactive:!1})),d(F.circleMarker(t.center,{radius:6,color:re.edge,weight:2,fillColor:re.light,fillOpacity:1,interactive:!1})));const N=()=>H(h=>h+1);return i.on("zoomend",N),()=>{i.off("zoomend",N),ve.current.forEach(h=>{i.hasLayer(h)&&i.removeLayer(h)}),ve.current=[]}},[t,ye,v,A,k,vt,E,Xa]);const Ke=t.kind==="route"?t.path.length:0,qa=t.kind==="route"?E("pack.addTrip.geo.hintRoute"):t.kind==="point"?E("pack.addTrip.geo.hintSpot"):E("pack.addTrip.geo.hintArea"),Ve=!!(m!=null&&m.active),ba=((tt=k.current)==null?void 0:tt.getZoom())??0,Zt=Ve&&ba<Ba,ga=Math.max(0,Math.min(100,(ba-hr)/(Ba-hr)*100)),Ht=t.kind!=="route"?!!t.center:je.length>=2,ft=t.kind==="route"?je.length>=2:!!t.center,xt=t.kind==="area",xo=o.useCallback(i=>{if(t.kind!=="area"||!t.center)return;const d=Math.min(Rr,Math.max(Cr,i));d!==t.radiusM&&l({kind:"area",center:t.center,radiusM:d})},[t,l]),va=t.kind==="area"?t.center:void 0,Qa=t.kind==="area"?t.radiusM:0,fa=va?`${va[0]},${va[1]}`:"",Xe=o.useRef(null);o.useEffect(()=>{if(!va||!fa){Xe.current=null;return}const i=Xe.current;if(Xe.current={key:fa,r:Qa},!i||i.key!==fa||i.r===Qa)return;const d=k.current;if(!d)return;const j=window.setTimeout(()=>{const N=Rt(Lt()),h=d.getSize(),y=h.x-N.paddingTopLeft[0]-N.paddingBottomRight[0],I=h.y-N.paddingTopLeft[1]-N.paddingBottomRight[1];if(y<=0||I<=0)return;const L=F.latLng(va).toBounds(Qa*2),J=d.latLngToContainerPoint(L.getNorthWest()),Y=d.latLngToContainerPoint(L.getSouthEast()),$e=Math.max(Math.abs(Y.x-J.x)/y,Math.abs(Y.y-J.y)/I);$e<=1&&$e>=tl||d.fitBounds(L,{...N,maxZoom:17,animate:!0,duration:.35})},220);return()=>window.clearTimeout(j)},[fa,Qa,va,k]);const yt=t.kind==="route"&&(t.returnMode==="mirror"||je.length>=3&&Ua(je[0],je[je.length-1])<150),jt=S==="plan",Oa=i=>E(jt?`${i}.plan`:i),yo=ce===0?Zt?ga<34?Oa("pack.addTrip.ainubis.findPlace"):ga<70?E("pack.addTrip.ainubis.closer"):E("pack.addTrip.ainubis.closerMore"):t.kind==="route"?Oa(Be?"pack.addTrip.ainubis.zoomOk":"pack.addTrip.ainubis.zoomOkClick"):E(Z?"pack.addTrip.geo.startClickArea":"pack.addTrip.geo.startTapArea"):t.kind==="route"?je.length<2?E(Z?"pack.addTrip.geo.continueClick":"pack.addTrip.geo.continueTap"):yt||_t?E("pack.addTrip.ainubis.routeLooksDone"):Oa("pack.addTrip.ainubis.drawDone"):xt&&t.center?E("pack.addTrip.geo.areaSetSize"):null,Da=t.kind==="route"&&!(m!=null&&m.paused),fe=Da&&Aa==="paused"?E("pack.addTrip.ainubis.paused"):Da&&De?E("pack.addTrip.ainubis.ratelimited"):Da&&Aa==="error"?E("pack.addTrip.ainubis.error"):t.kind==="route"&&M?E("pack.addTrip.ainubis.snapping"):t.kind==="route"&&b?E("pack.addTrip.ainubis.denseClicks"):(m==null?void 0:m.hint)!==void 0?m.hint:yo,ta=t.kind==="route"?pe?Ke>=2?e.jsx("span",{className:"trp-dread-dim",children:E("pack.addTrip.geo.unknownDistance")}):e.jsx("span",{className:"trp-dread-dim",children:Ve?"":qa}):Ke<2?e.jsx("span",{className:"trp-dread-dim",children:Ve?"":qa}):e.jsxs(e.Fragment,{children:[Ye.toFixed(1)," km",e.jsx("span",{className:"trp-dread-dim",children:" · "}),"↑ ",Ea||be===null?"…":`${be} m`,ir(Xo(Ye,be,Ja))&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"trp-dread-dim",children:" · "}),e.jsx("span",{title:E("pack.addTrip.geo.timeNote"),children:ir(Xo(Ye,be,Ja))})]})]}):t.center?t.kind==="area"?E("pack.addTrip.geo.areaRadius",{r:er(t.radiusM,sn(T))}):E("pack.addTrip.geo.spotSet"):e.jsx("span",{className:"trp-dread-dim",children:Ve?"":qa}),oa=t.kind==="route"?Ke>0:!!t.center,Ue=o.useMemo(()=>{if(!(We||Z)||Ea||ye.length<2)return null;const i=[],d=[];for(const y of ln(ye,dn)){const I=Za(y);typeof I=="number"&&(i.push(I),d.push(y))}if(i.length<2)return null;const j=200;if(i.length<=j)return{vals:i,pts:d};const N=(i.length-1)/(j-1),h=Array.from({length:j},(y,I)=>Math.round(I*N));return{vals:h.map(y=>i[y]),pts:h.map(y=>d[y])}},[We,Z,Ea,ye]),qe=(Ue==null?void 0:Ue.vals)??null,[et,Jt]=o.useState(null),xa=o.useRef(null);o.useEffect(()=>{const i=k.current;if(!i)return;const d=()=>{xa.current&&i.hasLayer(xa.current)&&i.removeLayer(xa.current),xa.current=null};d();const j=et!==null?Ue==null?void 0:Ue.pts[et]:void 0;if(!j)return;const N=F.circleMarker(j,{radius:7,color:"#FFFFFF",weight:2.5,fillColor:re.light,fillOpacity:1,className:"trp-anchor-live",interactive:!1}).addTo(i);return xa.current=N,d},[et,Ue,k]);const zt=t.kind==="route"&&!pe&&Ke>=2;o.useEffect(()=>{Z||Ga(!1)},[Ke,Z]);const at=!!(m!=null&&m.panel),Nt=Z&&!at,Qe=zt&&(Nt||We);o.useEffect(()=>{at&&Ga(!1)},[at]);const na=m&&(fe||m.onAbort)?e.jsx($r,{text:fe??"",onAbort:m.onAbort,abortLabel:E("pack.addTrip.geo.abortAria"),below:Z?void 0:m.steps}):null,ra=Z&&(m!=null&&m.steps)?e.jsx("div",{className:"trp-dsteps",children:m.steps}):null,jo=ce===2&&ft?e.jsx("div",{className:"trp-dreadrow",children:zt&&!Nt?e.jsx("button",{type:"button",className:"trp-dread trp-dread--btn",onClick:()=>Ga(i=>!i),"aria-expanded":We,children:ta}):e.jsx("div",{className:"trp-dread",children:ta})}):null,zo=Qe&&ce===2&&ft?e.jsxs("div",{className:"trp-delev",children:[e.jsxs("div",{className:"trp-delev-head",children:[!Nt&&e.jsx("button",{type:"button",className:"trp-delev-x",onClick:()=>Ga(!1),"aria-label":E("pack.mapNotes.add.close"),children:e.jsx(co,{})}),e.jsx("span",{children:E("pack.trip.elevation")})]}),qe?e.jsx(ls,{elev:qe,km:Ye,onHover:Jt}):e.jsx("div",{className:"trp-delev-wait",children:E("pack.addTrip.geo.elevWait")})]}):null,Gt=$a.length>1?e.jsx("div",{className:"trp-dkind",role:"radiogroup","aria-label":E("pack.addTrip.geo.kindPick"),children:$a.map(i=>e.jsx("button",{type:"button",role:"radio","aria-checked":i===t.kind,className:`trp-dkind-btn${i===t.kind?" on":""}`,onClick:()=>Ya(i),children:E(i==="route"?"pack.addTrip.geo.kindRoute":i==="point"?"pack.addTrip.geo.kindSpot":"pack.addTrip.geo.kindArea")},i))}):null,ea=m!=null&&m.onBack?e.jsxs("button",{type:"button",className:"trp-dback",onClick:m.onBack,children:[e.jsx(or,{})," ",E(m.backLabel??"pack.addTrip.geo.backToActivity")]}):null,Pa=i=>!Ee&&e.jsxs("div",{className:`trp-dbar-row${i?" trp-dbar-row--minor":""}`,children:[xt?e.jsx("input",{type:"range",className:"trp-dbar-range",min:0,max:Ha.length-1,step:1,value:kr(t.radiusM),disabled:$||!oa,style:{opacity:oa?1:.4},"aria-label":E("pack.addTrip.geo.areaRadius",{r:er(t.radiusM,sn(T))}),onChange:d=>xo(Ha[Number(d.target.value)])}):e.jsxs("button",{type:"button",className:"trp-dbar-btn",onClick:gt,disabled:$||!oa,style:{opacity:oa?1:.4},children:[e.jsx(or,{}),E("pack.addTrip.geo.undoPoint")]}),e.jsxs("button",{type:"button",className:"trp-dbar-btn",onClick:Ut,disabled:$||!oa,style:{opacity:oa?1:.4},children:[e.jsx(Es,{size:14}),E("pack.addTrip.geo.clear")]})]});return e.jsxs("div",{style:{display:"grid",gap:10},children:[!Ve&&Gt,!Ve&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"8px 12px",borderRadius:12,background:r.glass,border:`1px solid ${r.onDarkBorder}`},children:[e.jsx("span",{style:{fontFamily:x,fontSize:14,fontWeight:500,color:r.onDark},children:ta}),t.kind==="route"&&Ke>0&&e.jsxs("span",{style:{display:"flex",gap:6},children:[e.jsx("button",{type:"button",onClick:gt,disabled:$,style:gr,children:E("pack.addTrip.geo.undo")}),e.jsx("button",{type:"button",onClick:Ut,disabled:$,style:gr,children:E("pack.addTrip.geo.clear")})]})]}),t.kind==="area"&&t.center&&e.jsx("input",{type:"range",min:0,max:Ha.length-1,step:1,value:kr(t.radiusM),onChange:i=>l({kind:"area",center:t.center,radiusM:Ha[Number(i.target.value)]}),style:{width:"100%",accentColor:He}}),!Ve&&te&&e.jsx("div",{className:"trp-notice",children:te}),!Ve&&$&&e.jsx("div",{style:{fontFamily:x,fontSize:12,color:r.onDarkDim},children:E("pack.addTrip.geo.snappingBusy")}),t.kind==="route"&&A&&Ke===0&&e.jsx("div",{style:{fontFamily:me,fontSize:12,letterSpacing:"0.14em",color:r.onDarkDim,textTransform:"uppercase"},children:E("pack.addTrip.geo.ghostHint")}),Ve&&m&&pt.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Vi}),e.jsx("style",{children:fl}),e.jsx("style",{children:Bi}),e.jsx("style",{children:Ui}),e.jsx("style",{children:Qs}),na&&!Z&&na,e.jsxs("div",{className:`trp-dock${Z?" trp-dock--pc":""}`,children:[Z&&na,Z&&ce===0&&e.jsx(el,{mapRef:k}),zo,jo,ce===0&&!m.panel&&e.jsxs("div",{className:"trp-dstart trp-dockpanel",children:[ra,m.contextPill,Gt,e.jsx(ws,{mapRef:k,zoom:Ba}),$a.includes("route")&&e.jsxs(e.Fragment,{children:[e.jsx("input",{ref:Sa,type:"file",hidden:!0,onChange:i=>{var j;const d=(j=i.target.files)==null?void 0:j[0];i.target.value="",d&&vo(d)}}),e.jsx("button",{type:"button",className:"trp-dbar-btn",onClick:()=>{var i;return(i=Sa.current)==null?void 0:i.click()},children:E("pack.addTrip.geo.gpxBtn")}),te&&e.jsx("div",{className:"trp-notice",children:te})]}),ea]}),m.panel?e.jsxs("div",{className:"trp-dbar trp-dockpanel",children:[ra,m.panel,ea]}):ce>0?e.jsxs("div",{className:"trp-dbar trp-dockpanel",children:[ra,ce===2&&e.jsxs(e.Fragment,{children:[$&&e.jsx("div",{style:{fontFamily:x,fontSize:12,color:r.onDarkDim,textAlign:"center"},children:E("pack.addTrip.geo.snappingBusy")}),te&&e.jsx("div",{className:"trp-notice",children:te}),(()=>{const i=Z?null:Pa(Ht),d=e.jsx("button",{type:"button",className:"trp-dbar-done trp-dbar-done--hero",onClick:m.onDone,disabled:!!m.doneDisabled||M,style:m.doneDisabled||M?{opacity:.42,boxShadow:"none",cursor:"default"}:void 0,children:m.doneLabel??E("pack.addTrip.geo.done")});return Ee?e.jsxs(e.Fragment,{children:[m.above,d]}):Ht?e.jsxs(e.Fragment,{children:[m.above,d,i]}):e.jsxs(e.Fragment,{children:[m.above,i]})})()]}),ea]}):null]}),Z&&ce===2&&!m.panel&&!Ee&&e.jsx("div",{className:"trp-dtoolbar",children:e.jsx("div",{className:"trp-dtoolbar-in trp-dockpanel",children:Pa(!1)})})]}),document.body)]})}const pl=45e3,cl=40,ul=120,ml=40,gr={padding:"4px 12px",borderRadius:8,background:"transparent",border:`1px solid ${r.onDarkBorder}`,color:r.onDark,fontFamily:x,fontSize:12,fontWeight:500,letterSpacing:"0.02em",textTransform:"uppercase",cursor:"pointer"},kl=100,hl=58,vr=150;function bl(t,l){if(l.length<2)return[];const p=t.getCenter(),u=t.latLngToContainerPoint(p),g=t.distance(p,t.containerPointToLatLng([u.x+100,u.y]))/100,S=Math.max(kl,hl*g),v=[];let A=S/2;for(let f=1;f<l.length&&v.length<vr;f++){const k=l[f-1],D=l[f],K=Ua(k,D);if(K<=0)continue;const P=t.latLngToLayerPoint(k),m=t.latLngToLayerPoint(D),E=Math.atan2(m.y-P.y,m.x-P.x)*180/Math.PI;let T=A;for(;T<=K&&v.length<vr;){const R=T/K,G=[k[0]+(D[0]-k[0])*R,k[1]+(D[1]-k[1])*R];v.push(F.marker(G,{icon:F.divIcon({className:"",html:`<span class="trp-dir-arrow" style="transform:translate(-50%,-50%) rotate(${E.toFixed(1)}deg)"></span>`,iconSize:[0,0],iconAnchor:[0,0]}),interactive:!1,keyboard:!1})),T+=S}A=T-K}return v}const gl=`
.trp-anchor-tag{position:absolute;left:0;top:0;transform:translate(-50%,-26px);pointer-events:none;white-space:nowrap;padding:4px 8px;border-radius:999px;background:rgba(18,13,7,0.94);border:1px solid ${re.light};box-shadow:0 2px 10px rgba(0,0,0,0.5);font-family:${x};font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#F3E9FF;}
/* Menovka cieľa výletu sedí NAD krúžkom s terčom, nie na kotve — preto vyššie odsadenie
   (krúžok má 28 px, viď circleMark.ts) a zlatý rám, aby sa nečítala ako koniec trasy. */
.trp-anchor-tag--target{transform:translate(-50%,-40px);border-color:${He};color:#FFF3D6;}
/* Šípka smeru — trojuholník z okrajov, aby nepotreboval vlastný SVG súbor ani obrázok.
   position:absolute + posun o polovicu: divIcon má nulovú veľkosť, takže sa polohuje sám.
   (Bez spätných apostrofov — toto je JS template literal a ukončili by ho.) */
.trp-dir-arrow{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;border-left:6px solid ${re.edge};border-top:3.5px solid transparent;border-bottom:3.5px solid transparent;transform-origin:50% 50%;}
`;function vl(){if(typeof document>"u"||document.getElementById("trp-anchor-tag-css"))return;const t=document.createElement("style");t.id="trp-anchor-tag-css",t.textContent=gl,document.head.appendChild(t)}const fl=`
/* TRI DIELY: bodky vľavo · čítanie v strede · únik vpravo. Stredný diel je centrovaný voči
   CELEJ šírke, nie voči zvyšku po bodkách — preto krajné diely nesú rovnakú základňu
   (flex:1 1 0) a číslo km neposkakuje podľa toho, či práve svietia bodky. */
/* ÚNIK — červený krížik. Jediný prvok na tejto obrazovke, ktorý je červený, a je to zámer:
   je to jediná akcia, ktorá niečo NENÁVRATNE zahodí. Klikacia plocha 36 px (dotyk), viditeľný
   je len znak — rovnaká úvaha ako pri krížiku v AddTripEntry. */
/* ČÍTANIE HORE — km · prevýšenie · body. Nie je to ovládač, tak nechytá ťuky do mapy.
   ⚠️ FIALOVÉ, NIE ŠEDÉ (Matej 2026-08-23: „pri móde kreslenia treba zvýrazniť horné info
   o KM, je to ako neviditeľné — daj to fialovým ako je teraz označ cieľ"). Je to jediné
   číslo, ktoré počas kreslenia rastie, a v šedom ráme nad pestrou mapou ho oko minulo.
   Rám a dosvit sú tie isté ako na pokynovej pilulke a na 🎯 — počas kreslenia hovorí
   fialová, a hovorí ju celá obrazovka rovnako. */
.trp-dread{pointer-events:none;padding:8px 16px;border-radius:999px;background:rgba(18,13,7,0.94);border:1.5px solid ${re.light};box-shadow:0 0 0 4px rgba(${r.tripPurpleRGB},0.20),0 6px 20px rgba(0,0,0,0.55);font-family:${x};font-size:16px;font-weight:600;color:#F3E9FF;white-space:nowrap;}
/* KROK 0 — pilulka stojí sama tam, kde neskôr narastie lišta, aby to vyzeralo, že jej
   okolie len dorástlo, nie že sa presunula. */
/* DOK — stĺpec pri spodnej hrane: pokyn (v mape), panel, návrat. Sám je priehľadný a ťuky
   prepúšťa; výplň aj ovládanie nesú jeho deti. */
/* ⚠️ DOK NEMÁ SPODNÉ ODSADENIE (Matej 2026-08-23: „dolný panel na mobile nie je až úplne dolu
   a presvitá na dolnom okraji mapa — neúplný panel"). Bezpečnú zónu telefónu nesie PANEL vo
   svojej výplni, nie dok nad ním: odsadenie tu odlepilo tmavú plochu od hrany displeja a pod
   ňou ostal prúžok mapy, ktorý vyzeral ako nedokreslený panel. */
.trp-dock{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;flex-direction:column;align-items:stretch;gap:12px;pointer-events:none;}
.trp-dock > *{pointer-events:auto;}
/* KROK 0 — panel s hľadaním miesta. VZDUŠNEJŠÍ (Matej 23. 8.: „panel urob vyšší vzdušnejší,
   text area je moc nízko") — pole potrebuje vzduch nad aj pod sebou, inak sedí na hrane
   displeja a na telefóne ho prekrýva systémová lišta. */
.trp-dstart{display:flex;flex-direction:column;gap:14px;}
/* ── HLÁSENIE „NEPODARILO SA PRICHYTIŤ" (Matej 2026-08-26) ──────────────────────────────
   „daj inú farbu písma na tento text: Couldn't snap — using straight line, lebo nie je
    vidno."
   Stálo v GOLD (#C99A3F) — na papyrusovej doske PC je to zlatá na piesku, teda text,
   ktorý tam síce je, ale nikto ho neprečíta. A je to jediná veta, ktorá hovorí, že trasa
   NIE JE taká, akú ju človek klikol.
   ⚠️ Nie je to chybová hláška — appka funguje, len kreslí priamku. Preto tlmená výstražná
   červeň a nie tá istá, akou svieti UPOZORNENIE na mape. */
.trp-notice{font-family:${x};font-size:12px;font-weight:600;line-height:1.4;color:#F3B0A0;}
/* NÁVRAT — podčiarknutý text v strede pod panelom. Šípka v rohu brala mape výšku a palec
   na ňu nedosiahol; text zaberie riadok a povie aj KAM sa vracia. */
.trp-dback{align-self:center;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;background:none;border:0;padding:4px 12px;color:${r.onDarkDim};font-family:${x};font-size:12px;font-weight:500;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
.trp-dback:hover{color:${He};}
/* ZLATÝ, NIE FIALOVÝ (Matej 2026-08-24). Fialová je na tejto obrazovke jazyk POKYNOV
   („toto máš spraviť"), zlatá je jazyk POSTUPU a odmeny — a toto je jediný prúžok, ktorý
   ukazuje, ako ďaleko je človek od cieľa. Gradient je ten istý ako na .btn-gold. */
/* Pilulka leží NAD panelom priamo v mape, takže si drží vlastné bočné odsadenie. */
/* KROK 0 — tá istá pilulka, ale POD hlavičkou namiesto nad panelom (Matej 2026-08-24).
   Je fixed, lebo dok, v ktorom pôvodne visela, je pripútaný k spodnej hrane. Odsadenie
   zhora ju posadí pod horný pás s krížikom, nie pod neho. */

/* Čítanie km má vlastný riadok a je vycentrované — v hlavičke sa bilo s chipmi značiek. */
/* Pás sám ťuky NEBERIE — pod ním je mapa a musí sa na nej dať kresliť. */
.trp-dreadrow{display:flex;justify-content:center;pointer-events:none;margin:0 16px;}
/* ⚠️ PILULKA S ČÍSLAMI JE ODTERAZ TLAČIDLO (Matej 2026-08-25). Riadok okolo nej ťuky ďalej
   NECHYTÁ — mapa medzi ňou a panelom musí ostať kresliteľná — takže si ich pýta len samotná
   pilulka. Bez tohto klik prepadol do mapy a namiesto profilu pribudla kotva.
   Rozlíšiteľná musí byť aj na pohľad, inak je to skrytá funkcia: ceruzkový rám zosilnie
   a pribudne šípka, ktorá sa po otvorení otočí. */
/* ⚠️ ŽIADNE font:inherit ANI color:inherit. Obe stoja NIŽŠIE než .trp-dread, takže prebili
   jej vlastné color:#F3E9FF aj veľkosť písma — a pilulka zostala s čiernym textom
   prehliadača na tmavom podklade (Matej 25. 8.: „rozbil sa vizuál nie je vidno písmo lebo
   je čierne"). Vzhľad tlačidla NETREBA resetovať: .trp-dread nastavuje farbu, písmo, rám
   aj výplň sama a autorský štýl porazí štýl prehliadača bez pomoci. */
.trp-dread--btn{pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:box-shadow .16s,border-color .16s;}
.trp-dread--btn::after{content:'⌃';display:inline-block;margin-left:9px;font-size:12px;line-height:1;transform:translateY(2px);color:#C9A6F2;transition:transform .18s;}
.trp-dread--btn[aria-expanded="true"]::after{transform:translateY(-2px) rotate(180deg);}
.trp-dread--btn:hover{border-color:#C9A6F2;box-shadow:0 0 0 4px rgba(${r.tripPurpleRGB},0.30),0 6px 20px rgba(0,0,0,0.55);}

/* ── PROFIL PREVÝŠENIA NAD PILULKOU ────────────────────────────────────────────────────
   Ten istý povrch a rám ako pilulka, len roztiahnutý — má sa čítať ako JEJ otvorenie, nie
   ako tretí druh panela. Preto tu NIE JE .trp-dockpanel: ten je tvar OVLÁDACIEHO panela
   (mapDockShape.ts), a toto je údaj o trase, ktorý žije v mape.
   Šírka je orámovaná, nie plná: nad panelom má ostať vidieť mapu po stranách. */
.trp-delev{pointer-events:auto;align-self:center;width:min(100%,360px);margin:0 16px;padding:12px 16px 8px;border-radius:16px;background:rgba(18,13,7,0.94);border:1.5px solid ${re.light};box-shadow:0 0 0 4px rgba(${r.tripPurpleRGB},0.20),0 6px 20px rgba(0,0,0,0.55);}
.trp-delev-head{display:flex;align-items:center;justify-content:flex-start;gap:10px;margin-bottom:4px;font-family:${x};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${r.onDarkDim};}
/* Zavrieť = šípka späť vľavo v bledom kruhu (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */
.trp-delev-x{${Sr("pale")}}
.trp-delev-x:hover{${Or("pale")}}
.trp-delev-wait{padding:16px 0 16px;text-align:center;font-family:${x};font-size:12px;color:${r.onDarkDim};}
.trp-dreadrow .trp-dread{font-size:14px;padding:8px 16px;}
/* ⚠️ TRIEDA, NIE INLINE ŠTÝL. Stlmené časti čítania (oddeľovače, šípka, náhradná veta)
   mali farbu v inline štýle, takže bledý skin PC ich nevedel prebiť bez !important —
   na zlatej pilulke by ostali svetlošedé, teda neviditeľné. */
.trp-dread-dim{color:${r.onDarkDim};}
/* Ukazovateľ v profile prevýšenia dedí farbu KRIVKY, na ktorej stojí (currentColor
   v ElevationProfile). Na tmavom povrchu je krivka zlatá, na bledom PC fialová ako trasa —
   preto sa farba nastavuje tu a nie v zdieľanom komponente. */
.trp-delev .trp-elev-cursor{color:#F5C73D;}
.trp-delev svg{cursor:crosshair;}

/* ── PEVNÁ VÝŠKA V KROKOCH 1–2 (Matej 24. 8. 2026) ─────────────────────────────────────
   „ten by bolo možno dobré v prvých 2 krokoch fixnut na konkretnu výšku aby sa pri týchto
    2 krokoch neustále nemenila tá výška a bola max 33%."

   ⚠️ PRÍČINA NIE JE ESTETIKA. Panel rástol a klesal podľa toho, čo v ňom práve stálo
   (hľadanie miesta → dve možnosti → nástroje → otázka o návrate → HOTOVO), a s ním skákala
   aj mapa nad ním — človek si priblížil miesto, panel narástol a to miesto mu ušlo pod
   okraj. Pevná výška znamená, že mapa má počas celého kreslenia rovnaký výrez.

   Výška aj strop naraz: samotná height by pri dlhšom obsahu panel pretiahla, samotný
   max-height by ho nechal skákať zdola. Čo sa nezmestí, skroluje SA VNÚTRI —
   overscroll-behavior drží ťah prsta v paneli, aby sa pod ním nehýbala mapa.
   Platí len na telefónnu vetvu; na PC je dok plávajúci ľavý stĺpec s vlastnou výškou. */
/* Výšku 33vh nesie .trp-dockpanel (mapDockShape.ts) — spoločne s panelom značky. Tu ostáva
   len to, čo je vlastné DOKU: čo sa doň nezmestí, skroluje sa celé (formulár značky proti tomu
   skroluje len svoj stred). overscroll-behavior drží ťah prsta v paneli, aby sa pod ním
   nehýbala mapa. */
@media (max-width:${_i}px){
  .trp-dstart,.trp-dbar{overflow-y:auto;overscroll-behavior:contain;}
}
/* ⚠️ MUSÍ TO BYŤ "safe center", NIE holé "center" (CLAUDE.md, tá istá pasca ako pri .atl-tiles).
   Holé center v skrolovacom kontajneri pretlačí prvý prvok NAD začiatok skrolu, keď sa obsah
   nezmestí — a tam sa už nedá doskrolovať. Slovo safe prepne späť na start presne vtedy,
   keď by k tomu došlo. Horná výplň 56 px = 18 (odsadenie hlavičky) + 26 (bodky) + 12 (medzera). */
/* ⚠️ DVA ZÁPISY ZA SEBOU, ZÁMERNE. Prehliadač, ktorý slovo "safe" nepozná, zahodí CELÉ
   pravidlo — a panel potom sedí hore s dierou pod sebou, presne ako to Matej videl na
   telefóne 24. 8. („CTA je v dotyku čísel a dolu je veľký priestor"). Prvý riadok je teda
   funkčná záloha, druhý je jeho bezpečná verzia pre tých, čo ju vedia.
   Horná výplň 74 px = 18 (odsadenie hlavičky) + 30 (výška bodiek) + 26 (odstup od CTA);
   pri 56 px sa tlačidlo bodiek DOTÝKALO. */
.trp-dstart,.trp-dbar{position:relative;justify-content:center;}
.trp-dstart,.trp-dbar{justify-content:safe center;}
.trp-dbar{min-height:${Ir}px;display:flex;flex-direction:column;gap:12px;}
.trp-dbar-read{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:20px;}
.trp-dbar-row{display:flex;gap:8px;}
/* ── PREPÍNAČ TVARU (trasa / okruh) ────────────────────────────────────────────────────
   Rovnaké tvary aj rovnaký materiál ako .trp-dbar-btn — je to ten istý druh ovládania
   v tom istom paneli, len o otázku skôr. Vybraný stav je zlatý rám a zlaté písmo na
   priesvitnom zlate; PLNÁ farebná plocha je v celom doku vyhradená HOTOVU (.trp-dbar-done),
   takže by tu robila druhé „hlavné" tlačidlo na jednej obrazovke.
   ⚠️ flex:1 1 0 = rovnaké diely cez celú šírku (feedback_rad_prvkov_plna_sirka_kontajnera);
   pri max-content by sa OKRUH a TRASA rozišli šírkou a rad by vpravo nechal dieru.
   ⚠️ V CSS KOMENTÁRI ŽIADNE SPÄTNÉ APOSTROFY — celý blok je JS template literal a jeden
   apostrof ho ukončí (chytí to npm run check:css, vite build padne). */
.trp-dkind{display:flex;gap:6px;}
.trp-dkind-btn{flex:1 1 0;padding:8px 12px;border-radius:8px;background:${r.glass};border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};font-family:${x};font-size:12px;font-weight:500;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;}
.trp-dkind-btn:hover{border-color:${He};color:${He};}
.trp-dkind-btn.on{background:rgba(201,154,63,0.18);border-color:${He};color:${al};}
.trp-dbar-btn{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:7px;padding:12px 12px;border-radius:8px;background:${r.glass};border:1px solid ${r.onDarkBorder};color:${r.onDark};font-family:${x};font-size:12px;font-weight:500;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;}
/* NÁSTROJE POD HOTOVOM SÚ VEDĽAJŠIE (Matej 23. 8.: „pod ňou menšími späť o bod a vymazať").
   Keď je trasa hotová, tieto dve už nie sú úloha — sú oprava. */
.trp-dbar-row--minor .trp-dbar-btn{padding:8px 12px;font-size:12px;background:none;color:${r.onDarkDim};}
.trp-dbar-row--minor .trp-dbar-btn:hover:not(:disabled){color:${He};}
.trp-dbar-btn:hover:not(:disabled){border-color:${He};color:${He};}
.trp-dbar-btn:disabled{cursor:default;}
.trp-dbar-wide{flex:1 1 100%;}
/* ── JAZDEC VEĽKOSTI OKRUHU (Matej 1. 9. 2026) ────────────────────────────────────────
   Berie miesto po dvojici − / + , teda DVA diely radu (flex:2 1 0) proti jednému, aký
   má VYMAZAŤ vedľa neho — rovnaký pomer, aký mal rad predtým, takže sa lišta nepohla.
   Výška riadku drží min-height zhodné s .trp-dbar-btn (12 px padding + 12 px text
   + lem): jazdec je nižší než tlačidlo a bez toho by rad pri okruhu poskočil.
   ⚠️ Dráha aj hlavička dostávajú farbu ZVLÁŠŤ pre WebKit aj Gecko — accent-color by
   síce stačil na jeden riadok, ale zafarbí len hlavičku a dráha by ostala v systémovej
   šedej, ktorá na tmavom skle aj na papyruse vyzerá ako vypnutý prvok. */
.trp-dbar-range{flex:2 1 0;min-width:0;min-height:41px;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;}
.trp-dbar-range:focus{outline:none;}
.trp-dbar-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px ${r.border};}
.trp-dbar-range:disabled{cursor:default;}
.trp-dbar-range::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:${r.onDarkBorder};}
.trp-dbar-range::-moz-range-track{height:4px;border-radius:999px;background:${r.onDarkBorder};}
.trp-dbar-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;margin-top:-9px;border-radius:50%;background:${He};border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.5);}
.trp-dbar-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:${He};border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.5);}
/* HOTOVO — brand CTA podľa .btn-gold locku: gradient 135°, radius 8, papyrusový rám. */
.trp-dbar-done{flex:1 1 0;padding:12px 12px;border-radius:8px;background:${ua.grad};border:1px solid ${ua.edge};color:#1c160c;font-family:${me};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;box-shadow:${ua.glow};cursor:pointer;}
/* CELÁ ŠÍRKA, KEĎ JE TO JEDINÁ ÚLOHA NA OBRAZOVKE (Matej 23. 8.: „dominantné tlačidlo
   TRASA HOTOVÁ cez celú šírku mobilu"). */
.trp-dbar-done--hero{width:100%;flex:none;padding:16px 12px;font-size:14px;}
/* CIEĽ — fialový, teda z rodiny trasy, nie zlatý: zlatá je v tomto rade vyhradená HOTOVU. */
/* CIEĽ — PILULKA, nie tlačidlo v rade (Matej 23. 8.: „to tlačítko mark the destination by
   malo byť v pils ako pri začiatku"). Tvar aj rám sú zhodné s pokynovou pilulkou vyššie:
   obe hovoria o tom istom geste nad mapou, len jedna z nich sa dá aj stlačiť. */
/* ── OZNAČ CIEĽ — BRANDOVÁ ZLATÁ (Matej 2026-08-24) ──────────────────────────────────
   ⚠️ V TEJTO LIŠTE UŽ ZLATÁ JEDNO TLAČIDLO MÁ: HOTOVO. Zámena by bola drahá — jedno
   ukladá výlet, druhé pridáva bod do trasy. Preto sa NEROZLIŠUJÚ farbou, ale TVAROM
   a váhou, a rozdiel je čitateľný aj periférne:
     · HOTOVO = plná šírka, plný gradient, Cinzel, radius 8 (lock .btn-gold)
     · CIEĽ   = pilulka na šírku obsahu, priehľadná zlatá výplň so zlatým rámom, Space Grotesk
   Cieľ je teda zlatý „obrys" toho istého jazyka — patrí do zlatej rodiny, ale nikdy
   nevyzerá ako záverečné tlačidlo. */
.trp-dbar-emoji{font-family:${ca};font-size:16px;line-height:1;}

/* ── PC: OVLÁDANIE JE V ĽAVOM BLOKU, STRED PATRÍ MAPE ─────────────────────────────────
   Matej 2026-08-24 (po prvom teste): „vieš čo bude lepší nápad dať to do ľavého bloku ako
   je všetko na PC lebo takto si zakryjeme strednú časť kde pracujeme."

   Prvé kolo malo dok ako kartu na strede — a tá si sadla presne doprostred plochy, do ktorej
   sa kreslí. Na PC platí pre všetky povrchy mapy to isté: ovládanie vľavo, mapa vpravo.
   Dok teda nie je výnimka, len ďalší obyvateľ toho istého stĺpca.

   ⚠️ ŠÍRKA JE ZHODNÁ S FORMULÁROM (.trp-sidebar / .trp-addhost), vrátane zúženia na 360 px
   medzi 1024–1400. Dok a formulár sú DVA STAVY JEDNÉHO STĹPCA (kroky 1–2 vs. 3–5); keby mali
   vlastné šírky, blok by pri prechode z kroku 2 do 3 skočil na inú šírku a vyzeralo by to
   ako dva rôzne panely. Preto tu nie je vlastná konštanta — je to tá istá miera.

   ⚠️ ZAROVNANÉ HORE, NIE DOLE. Blok rastie zhora nadol tak, ako doňho pribúda obsah —
   pri zavesení na spodnú hranu by pri každom prepnutí kroku odskočil jeho vrchol.
   (Do 24. 8. tu stál druhý dôvod: ponuka miest v hľadaní vytekala pod okno. Ten padol —
   ponuka sa odvtedy renderuje na <body> a smer si volí podľa miesta, viď PlaceSearch.tsx.) */
@media (min-width:1024px){
  /* ── OKRAJE BLOKOV SA NESMÚ OREZAŤ (Matej 2026-08-26: „okraje na ľavých blokoch je
     orezané", „AInubis tieň je vidno hore aj dolu seknutý — urob skôr žiaru/tieň nie ostrý
     prechod") ──────────────────────────────────────────────────────────────────────────
     Nebola to farba ani gradient: stĺpec skroluje (overflow-y:auto nižšie) a SKROLOVACÍ
     KONTAJNER OREŽE VŠETKO, ČO Z NEHO VYTŔČA — a z každého bloku tu vytŕča presne to, čo
     ho má robiť viditeľným: zlatý prstenec rámu, vrhnutý tieň panela a modrý dosvit
     AInubisovej bubliny. Sedeli na hrane kontajnera, takže sa žiara zrezala rovnou čiarou.
     (Tá istá pasca, na akej sa 24. 8. orezala ponuka miest v PlaceSearch.)

     ⚠️ VÝPLŇ SA MUSÍ VYRÁTAŤ ZO ŠÍRKY, NIE PRIDAŤ K NEJ. Stĺpec je border-box, takže samotný
     padding by ubral z obsahu a bloky by sa zúžili. Rámček sa preto posunie o GLOW_PAD
     do všetkých strán a o tú istú mieru sa zväčší — človek vidí ten istý stĺpec na tom istom
     mieste, len má dnu miesto na dosvit. */
  .trp-dock{top:${20-_a}px;bottom:${20-_a}px;left:${20-_a}px;right:auto;width:${ar+_a*2}px;max-width:calc(100vw - ${40-_a*2}px);padding:${_a}px;justify-content:flex-start;align-items:stretch;}
  /* ── ĽAVÝ STĹPEC MÁ ŠTYROCH OBYVATEĽOV A JEDNU ŠÍRKU (Matej 2026-08-26) ──────────────
     Zhora nadol: AINUBIS · PREVÝŠENIE · PILULKA S HODNOTAMI · BLOK S TLAČIDLAMI.
     Do teraz mal každý z nich vlastnú mieru — sprievodca bol vodorovný pás cez hornú hranu
     okna, profil a pilulka sa centrovali na 360 px s bočnými 16 px, panel mal plnú šírku
     stĺpca. Traja rôzne široké prvky nad sebou nečítajú ako jeden blok, ale ako tri.

     ⚠️ ŠÍRKU DRŽÍ STĹPEC (align-items:stretch), NIE ČÍSLA V DEŤOCH. Preto sa tu ruší
     width/margin/align-self, ktoré si deti nesú kvôli telefónu — nová hodnota by bola
     štvrtá miera, ktorá sa pri zmene šírky stĺpca rozíde.
     ⚠️ Stĺpec smie SKROLOVAŤ: sprievodca + profil + pilulka + panel sa na nízkom okne
     nezmestia a bez toho by spodok panela (CTA) vytiekol pod hranu okna. */
  .trp-dock--pc{overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;}
  /* Sprievodca prestáva byť pásom nad mapou a stáva sa kartou v stĺpci. Tmavý gradient
     pásu tu nemá čo robiť — pod ním už nie je mapa, ale panel. */
  .trp-dock--pc .ang-wrap{position:static;left:auto;right:auto;top:auto;padding:0;background:none;z-index:auto;flex:0 0 auto;}
  /* ── DOSVIT MUSÍ DOZNIEŤ VNÚTRI STĹPCA (Matej 2026-08-26) ────────────────────────────
     „AInubis tieň je vidno hore aj dolu seknutý — urob skôr žiaru/tieň nie ostrý prechod."
     Nad mapou má bublina dosvit 26 px a pri dýchaní až 40 — tam má okolo seba celé okno.
     V stĺpci má okolo seba GLOW_PAD, takže rovnaká žiara narazí na hranu skrolovacieho
     kontajnera a zreže sa rovnou čiarou. Preto je tu UŽŠIA: prstenec ostáva (obrys je to,
     čo bublinu drží viditeľnú), žiara sa zmestí do výplne a dýchanie sa hýbe v jej medziach.
     ⚠️ Hodnoty a GLOW_PAD sú spojená nádoba — kto zväčší jedno, musí aj druhé. */
  .trp-dock--pc .ang-bar{border-radius:16px;padding:12px 8px 12px 12px;box-shadow:0 0 0 3px rgba(59,158,255,0.22),0 0 12px rgba(59,158,255,0.42),0 6px 14px rgba(0,0,0,0.55);animation:ang-glow-dock 3.4s ease-in-out infinite;}
  @keyframes ang-glow-dock{
    0%,100%{box-shadow:0 0 0 3px rgba(59,158,255,0.20),0 0 10px rgba(59,158,255,0.32),0 6px 14px rgba(0,0,0,0.55);}
    50%{box-shadow:0 0 0 3px rgba(59,158,255,0.34),0 0 13px rgba(59,158,255,0.60),0 6px 14px rgba(0,0,0,0.55);}
  }
  @media (prefers-reduced-motion: reduce){.trp-dock--pc .ang-bar{animation:none;}}
  .trp-dock--pc .trp-delev{align-self:stretch;width:auto;margin:0;flex:0 0 auto;}
  .trp-dock--pc .trp-dreadrow{margin:0;flex:0 0 auto;}
  .trp-dock--pc .trp-dreadrow .trp-dread{width:100%;text-align:center;box-sizing:border-box;}
  /* Panel nesmie stlačiť obsah pod svoju prirodzenú výšku, keď stĺpec skroluje. */
  .trp-dock--pc .trp-dockpanel{flex:0 0 auto;}
  /* ── LIŠTA NÁSTROJOV DOLE NA MAPE (Matej 15. 10. 2026: „dať clear a undo priamo do mapy
     dolu ako keby spodný nav? (pc)") ─────────────────────────────────────────────────────
     Vodorovne na stred MAPY, nie okna — mapa začína za stĺpcom (20 + šírka + 20) a vpravo
     drží 74 px pre ovládanie mapy (to isté číslo ako čítanie km a .trp-topbar). Materiál
     je .trp-dockpanel, teda ten istý D-BLOK ako panel vľavo — iný tvar by bol druhý dok. */
  .trp-dtoolbar{position:fixed;bottom:20px;left:${40+ar}px;right:74px;z-index:1200;display:flex;justify-content:center;pointer-events:none;}
  .trp-dtoolbar .trp-dtoolbar-in{pointer-events:auto;width:min(440px,100%);padding:12px;}
  /* ── KROKY 1–5 V DOLNOM BLOKU, S NÁZVAMI ──────────────────────────────────────────────
     Nad mapou sú bodky pilulkou s tmavým podkladom a bez popiskov (päť názvov sa na telefón
     nezmestí). V paneli je podklad aj rám navyše — škatuľa v škatuli — a miesto na názvy tam
     je, takže sa oboje otáča.
     Zlatá čiara nad nimi je T.rule (vyblednutá do strán), nie šedý hairline: krokovník je
     iná vrstva informácie než ovládanie nad ním a musí sa to dať prečítať periférne. */
  .trp-dsteps{flex:0 0 auto;padding-bottom:12px;position:relative;}
  .trp-dsteps::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:${r.rule};}
  .trp-dsteps .atl-steps--onmap{width:auto;gap:6px;padding:0;background:none;border:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;}
  .trp-dsteps .atl-steps--onmap .atl-step{flex:1 1 0;padding:8px 4px;gap:4px;}
  .trp-dsteps .atl-steps--onmap .atl-step span{display:block;}
  /* Rám, zaoblenie aj spodná výplň prišli do .trp-dockpanel (mapDockShape.ts) — panel
     značky ich musí mať rovnaké, inak sa na PC pri zapichovaní zmení tvar rovnako ako
     na telefóne. */
  /* Pokyn stojí v bloku nad panelom, nie v mape: na PC je mapa pracovná plocha a pilulka
     v jej strede by prekážala tomu istému, čomu prekážal dok. */
  /* ČÍTANIE OSTÁVA NAD MAPOU, odsadené o blok — je to jediné číslo, ktoré počas kreslenia
     rastie, a patrí k trase, nie k ovládaniu. 74 px vpravo = miesto pre ovládanie mapy
     (zoom, poloha, vrstvy); to isté číslo drží .trp-topbar v PackMap.tsx. */
  /* KURZOR HOVORÍ, ŽE SA KRESLÍ (Matej 2026-08-24: „nevidím pri kurzore +"). Na mobile to
     povie prst a pilulka, na PC nie je z ničoho vidieť, že klik do mapy niečo spraví. */
  body.trp-drawing .leaflet-container,body.trp-drawing .leaflet-container .leaflet-interactive{cursor:crosshair;}
}
/* Kompaktný desktop — tá istá hranica a to isté číslo, aké má .trp-sidebar v PackMap.tsx. */
@media (min-width:1024px) and (max-width:1400px){
  .trp-dock{width:${360+_a*2}px;}
  .trp-dtoolbar{left:400px;}
}
${`
/* ══ BLEDÝ SKIN (2026-08-26, mobil doplnený 2026-08-28) ══════════════════════════════════
   Dok je papyrusový panel (mapDockShape.ts), takže jeho OBSAH nesmie ostať v onDark
   tokenoch — bol by to svetlý text na piesku.
   ⚠️ MEDIA QUERY ZANIKLA 28. 8. (Matej: „natiahni dizajn aký je na PC iba ho prispôsob
   viewportu"). Farby sú na oboch šírkach tie isté; rozdiel je len v TVARE doku a ten rieši
   mapDockShape.ts. Pravidlá viazané na PC si nesú predponu .trp-dock--pc, takže na telefóne
   nemajú čo trafiť.
   ⚠️ Čítanie km (.trp-dread) sa ZÁMERNE nemení: nie je to panel chrome, ale odznak NAD MAPOU
   a nesie fialovú farbu trasy. Prefarbiť ho na papyrus by zmazalo väzbu na čiaru, ktorú
   človek práve kreslí. */
  /* ── PREVÝŠENIE JE NA PC SÚČASŤ STĹPCA, NIE ODZNAK NAD MAPOU ───────────────────────────
     Do 26. 8. tu stálo, že sa ZÁMERNE nemení: „nie je to panel chrome, ale odznak NAD MAPOU
     a nesie fialovú farbu trasy." Platilo to, kým plával v mape. Odkedy stojí v ľavom stĺpci
     medzi AInubisom a panelom (Matej 26. 8.), je to tmavý obyvateľ v rade bledých — presne
     to, na čo Matej ukázal vetou „bloky musia byť všade rovnaké".

     ⚠️ VÄZBA NA ČIARU SA NESTRÁCA, LEN SA PRESÚVA Z RÁMU DO ÚDAJA: krivka profilu je odteraz
     fialová (TRAIL_LINE.mid) — tá istá farba, akou je nakreslená trasa na mape. Predtým bola
     ZLATÁ v fialovom ráme, takže väzbu aj tak niesol obal, nie graf.
     ⚠️ PILULKA S ÚDAJMI SEM NEPATRÍ — tá ostáva fialová, viď jej vlastnú poznámku nižšie
     (Matej ju z tohto kola vyňal výslovne). */
  .trp-dock--pc .trp-delev{${wr()}}
  .trp-dock--pc .trp-delev-head{color:${_.dim};}
  .trp-dock--pc .trp-delev-wait{color:${_.dim};}
  /* CSS prebíja prezentačný atribút v SVG — profil je zdieľaný komponent (tripShared.tsx)
     a farby si nesie natvrdo pre tmavé povrchy; tie ostávajú nedotknuté. */
  .trp-dock--pc .trp-delev svg text{fill:${_.dim};}
  .trp-dock--pc .trp-delev svg line{stroke:${_.border};}
  .trp-dock--pc .trp-delev svg path[stroke]{stroke:${re.mid};}
  .trp-dock--pc .trp-delev .trp-elev-cursor{color:${re.mid};}
  .trp-dock--pc .trp-delev svg path[fill^="url"]{fill:rgba(${r.tripPurpleRGB},0.16);}
  /* ── PILULKA S ÚDAJMI OSTÁVA FIALOVÁ (Matej 2026-08-26, druhé kolo) ────────────────────
     „tá pils kde sú údaje — to si nemal meniť ale nechať fialové ako je trasa."
     Prvé kolo ju prefarbilo na zlatú pilulku navu s odôvodnením „bloky musia byť všade
     rovnaké". Lenže to pravidlo hovorí o BLOKOCH — o paneloch, ktoré držia ovládanie. Toto
     nie je blok: je to ODZNAK TRASY, ktorá sa práve kreslí, a jediné, čo mu dáva význam, je
     že má farbu tej čiary na mape. Zlatá z neho spravila štvrtý panel v rade a väzba na
     trasu zmizla. Žiadny pale override tu preto nestojí — platí základný .trp-dread
     (tmavý podklad, rám TRAIL_LINE.light, fialový dosvit). Profil prevýšenia papyrusový
     OSTÁVA: ten väzbu nesie krivkou vnútri, nie rámom. */
  /* Na piesku musí niesť čitateľnosť tmavý inkoust, nie svetlá výstražná farba — to isté
     zistenie ako pri tintoch chipov (navGoldSkin.ts, pickTintCSS). */
  .trp-notice{color:#8E2C17;}
  .trp-dback{color:${_.dim};}
  .trp-dback:hover{color:${_.deep};}
  .trp-dbar-btn{background:${_.field};border-color:${_.border};color:${_.ink};}
  .trp-dbar-btn:hover:not(:disabled){border-color:${_.deep};color:${_.deep};background:${r.cardSoft};}
  /* ⚠️ DRÁHA JAZDCA JE BIELA NA 18 % — na papyruse ju nevidno vôbec, takže tu nesie
     vlastnú farbu, nie krytie. Hlavička ostáva zlatá (je to ovládač, nie výber), ale
     dostáva tmavší lem: biely obrys sa na piesku stráca a guľôčka vyzerá ako škvrna. */
  .trp-dbar-range::-webkit-slider-runnable-track{background:rgba(122,90,42,0.28);}
  .trp-dbar-range::-moz-range-track{background:rgba(122,90,42,0.28);}
  .trp-dbar-range::-webkit-slider-thumb{border-color:${_.deep};box-shadow:0 2px 6px rgba(70,45,10,0.35);}
  .trp-dbar-range::-moz-range-thumb{border-color:${_.deep};box-shadow:0 2px 6px rgba(70,45,10,0.35);}
  /* ── PREPÍNAČ TVARU NA PAPYRUSE ────────────────────────────────────────────────────────
     Bez tohto bloku niesol tmavé tokeny na svetlej doske a čítal sa NAOPAK: vybraná TRASA
     bola zlaté písmo na piesku (mizne), nevybraná OBLASŤ tmavý blok (kričí). To je presne
     to, čo hovorí feedback_prevratena_doska_prevrati_aj_stitky — prevrátený povrch treba
     prevrátiť aj štítkom, nielen podložiť.
     Vybraný stav = PRIESVITNÝ LAPISOVÝ TINT (lock z 26. 8., recept pickTintCSS), nie plná
     farba: plný lapis v tomto doku už nesie HOTOVO a dve plné plochy = dve „hlavné" veci na
     jednej obrazovke. Zhodný recept aj krytie ako aktívna bodka číselníka (.atl-step.on),
     lebo je to tá istá vec — „tu práve som / toto som si vybral". */
  .trp-dkind-btn{background:${_.field};border-color:${_.border};color:${_.ink};}
  .trp-dkind-btn:hover{border-color:${_.deep};color:${_.deep};background:${r.cardSoft};}
  .trp-dkind-btn.on{${ke(C.edge,ne.lapis,.14)}font-weight:600;}
  .trp-dkind-btn.on:hover{${ke(C.edge,ne.lapis,.14)}}
  /* ── SPÄŤ O BOD A VYMAZAŤ SÚ TLAČIDLÁ, NIE ODKAZY (Matej 2026-08-26: „undo a clear tiež
     zvýrazni") ───────────────────────────────────────────────────────────────────────────
     Trieda --minor im brala výplň aj rám, takže na papyruse ostal bledý text na bledom podklade —
     na PC sa nedalo prečítať, že sa dajú stlačiť. Ostávajú VEDĽAJŠIE (menšie písmo, tenší
     rám, papyrus namiesto lapisu), ale sú to naďalej tlačidlá: hlavnú akciu nad nimi drží
     lapisové HOTOVO, takže ich zvýraznenie mu nekonkuruje. */
  .trp-dbar-row--minor .trp-dbar-btn{background:${_.field};border-color:${_.border};color:${_.ink};}
  .trp-dbar-row--minor .trp-dbar-btn:hover:not(:disabled){border-color:${_.deep};color:${_.deep};background:${r.cardSoft};}
  .trp-dbar-btn:disabled{opacity:.45;}
  /* ── HLAVNÉ CTA JE LAPIS, NIE ZLATÉ (Matej 2026-08-26: „CTA oprav máme predsa modrú") ───
     Platí pre HOTOVO aj pre OZNAČ v kroku 2 — obe nesú .trp-dbar-done, teda jedno tlačidlo
     v dvoch úlohách. Na papyruse bola zlatá naraz rámom, doskou aj tlačidlom, takže hlavná
     akcia bola najsvetlejší prvok panela a splývala s tým, čo ju drží; to je presne dôvod,
     prečo LAPIS v redizajne /map vznikol (navGoldSkin.ts). Zlato ostáva na písme —
     lapis + zlato je pôvodná egyptská dvojica a bez neho je to len tmavé tlačidlo.
     ⚠️ Od 28. 8. to platí aj na telefóne — dok je bledý na každej šírke, takže zlaté CTA
     by tam bolo tou istou zlatou na zlatom, akou bolo na PC. */
  .trp-dbar-done{background:${C.grad};border-color:${C.deep};color:${C.ink};box-shadow:${ct};}
  .trp-dbar-done:hover:not(:disabled){background:${C.gradHover};box-shadow:${ct};}
`}

`,xl={A:"linear-gradient(180deg,#4F9463,#2E5E3B)",B:"linear-gradient(135deg,#C99A3F 0%,#A3782B 100%)",C:"linear-gradient(180deg,#C46A52,#8E3F2C)"},yl={A:" pk-progress__fill--done",B:"",C:" pk-progress__fill--low"};function jl({result:t,photoCount:l,onGo:p,t:u}){const{grade:g,score:S,missing:v}=t,A=`${S/lr*100}%`,[f,k]=o.useState(g!=="A");return e.jsxs("div",{className:"tgc-card",style:{...Di.card},children:[e.jsxs("style",{children:[Pi,zl]}),e.jsxs("button",{type:"button",className:"tgc-head","aria-expanded":f,onClick:()=>k(D=>!D),children:[e.jsx("span",{className:"tgc-medal",style:{background:xl[g]},"aria-label":u("pack.addTrip.grade.aria",{grade:g}),children:g}),e.jsxs("span",{className:"tgc-meta",children:[e.jsxs("span",{className:"tgc-score",children:[S," / ",lr]}),e.jsx("span",{className:"tgc-sub",children:g==="A"?u("pack.addTrip.grade.subA"):u("pack.addTrip.grade.subMissing",{n:v.length})}),e.jsx("span",{className:"pk-progress",children:e.jsx("span",{className:`pk-progress__fill${yl[g]}`,style:{display:"block",width:A,...g==="B"?{background:Mi.grad}:null}})})]}),e.jsx("span",{className:`tgc-chev${f?" open":""}`,"aria-hidden":"true"})]}),e.jsx("p",{className:"tgc-why",children:u("pack.addTrip.grade.why")}),f&&e.jsx("ul",{className:"tgc-list",children:Ps.map(D=>{const K=v.includes(D),P=e.jsxs("span",{className:"tgc-row",children:[e.jsx("span",{className:"tgc-dot","aria-hidden":"true"}),e.jsx("span",{children:u(`pack.addTrip.grade.point.${D}`)}),!K&&D==="photos"&&e.jsx("span",{className:"tgc-val",children:l})]});return e.jsx("li",{className:K?"n":"y",children:K?e.jsxs("button",{type:"button",className:"tgc-cell",onClick:()=>p(D),children:[P,e.jsx("span",{className:"tgc-go",children:u("pack.addTrip.grade.fill")})]}):e.jsx("div",{className:"tgc-cell",children:P})},D)})}),e.jsxs("div",{className:"tgc-legend",children:[e.jsx("span",{children:u("pack.addTrip.grade.legendA")}),e.jsx("span",{children:u("pack.addTrip.grade.legendB")}),e.jsx("span",{children:u("pack.addTrip.grade.legendC")})]})]})}const zl=`
.tgc-card{padding:16px;color:${r.ink};font-family:${x};}
.tgc-head{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;padding:0;cursor:pointer;text-align:left;color:inherit;font-family:inherit;}
.tgc-medal{width:48px;height:48px;border-radius:999px;display:grid;place-items:center;flex:none;font-family:${me};font-weight:700;font-size:24px;color:#fff;box-shadow:${mo.lift};}
.tgc-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.tgc-score{font-family:${me};font-weight:700;font-size:16px;letter-spacing:.14em;color:${r.inkStrong};}
.tgc-sub{font-size:12px;color:${r.inkDim};}
.tgc-chev{width:8px;height:8px;flex:none;border-right:2px solid ${r.inkDim};border-bottom:2px solid ${r.inkDim};transform:rotate(45deg);margin:0 8px 4px 0;transition:transform .15s;}
.tgc-chev.open{transform:rotate(-135deg);margin:4px 8px 0 0;}
.tgc-why{margin:8px 0 0;font-size:14px;line-height:1.5;color:${r.inkDim};}
.tgc-list{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.tgc-list li{display:flex;min-width:0;}
/* Bunka je JEDEN riadok (bodka · názov · Doplniť →); v úzkom stĺpci 360 px sa „Doplniť"
   zalomí pod názov sám — zhustenie, nie skrolovanie (feedback_matejovo_okno). */
.tgc-cell{flex:1 1 auto;min-width:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 8px;padding:8px 12px;border-radius:12px;font-family:${x};font-size:14px;color:${r.ink};text-align:left;}
.tgc-list li.y .tgc-cell{background:${r.tileBg};border:1px solid ${r.border};}
.tgc-list li.n .tgc-cell{background:${r.alertRedSoft};border:1px dashed ${r.alertRed};cursor:pointer;}
.tgc-list li.n .tgc-cell:hover .tgc-go{text-decoration:underline;}
.tgc-row{display:flex;align-items:center;gap:8px;flex:1 1 auto;min-width:0;}
.tgc-row > span:nth-child(2){min-width:0;overflow-wrap:anywhere;}
.tgc-dot{width:16px;height:16px;border-radius:999px;flex:none;background:${r.growGreen};}
.tgc-list li.n .tgc-dot{background:transparent;border:2px solid ${r.alertRed};}
.tgc-val{margin-left:auto;font-size:12px;color:${r.inkDim};}
.tgc-go{margin-left:auto;font-family:${x};font-weight:600;font-size:12px;letter-spacing:.02em;color:${C.edge};white-space:nowrap;}
.tgc-legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.tgc-legend span{border-radius:999px;padding:4px 12px;font-size:12px;font-weight:500;border:1px solid ${r.border};color:${r.ink};background:${r.tileBg};}
`,ae=r.cardEdge,de=r.growGreen,on=["visit","activity"],un=ys.map(t=>({id:t.id,label:t.label,emoji:t.emoji,dataId:t.dataId})),Nl=Object.fromEntries(un.map(t=>[t.id,t])),Al=[{mode:"walked",key:"walked",emoji:"✅"},{mode:"planned",key:"planned",emoji:"🗓️"}],nn=["Easy","Moderate","Hard","Odyssey"],Tl=[{id:"forest",emoji:"👣",label:"Forest path"},{id:"asphalt",emoji:"🛣️",label:"Asphalt"},{id:"rocky",emoji:"🪨",label:"Rocky"}],go=[{id:"mountains",label:"Mountains",emoji:"🏔️"},{id:"forest",label:"Forest",emoji:"🌲"},{id:"lake",label:"Lake/Reservoir",emoji:"🔵"},{id:"river",label:"River",emoji:"🌀"},{id:"view",label:"View",emoji:"👁️"},{id:"meadow",label:"Meadow",emoji:"🌼"},{id:"sunset",label:"Sunset",emoji:"🌅"},{id:"shade",label:"Shade",emoji:"⛱️"},{id:"noshade",label:"No shade",emoji:"🌡️"}],Lr=new Set(["sunset","shade","noshade"]),wl=go.filter(t=>!Lr.has(t.id)),El=go.filter(t=>Lr.has(t.id)),$l=new Set(go.map(t=>t.id)),rn=["sk","cz","at","hu","pl","de","ch","it","si","fr"],fr={hike:["km","noCity"],activity:["nature","city","anyLen"],visit:["nature","city","onePlace"]},Vt=r.tripPurple,xr={fill:"#FFF",stroke:Vt,strokeWidth:2},yr={fill:"none",stroke:Vt,strokeWidth:2,strokeDasharray:"4 3"},jr={fill:`rgba(${r.tripPurpleRGB},0.12)`,stroke:Vt,strokeWidth:2,strokeDasharray:"4 3"},zr={hike:e.jsxs("svg",{width:"72",height:"48",viewBox:"0 0 72 48",children:[e.jsx("path",{d:"M6 40 L22 18 L40 28 L54 8 L66 22",...yr}),[[6,40],[22,18],[40,28],[54,8],[66,22]].map(([t,l])=>e.jsx("circle",{cx:t,cy:l,r:3.5,...xr},t))]}),activity:e.jsxs("svg",{width:"72",height:"48",viewBox:"0 0 72 48",children:[e.jsx("path",{d:"M5 38 L15 20 L29 30",...yr}),[[5,38],[15,20],[29,30]].map(([t,l])=>e.jsx("circle",{cx:t,cy:l,r:3,...xr},t)),e.jsx("circle",{cx:56,cy:24,r:13,...jr}),e.jsx("circle",{cx:56,cy:24,r:3,fill:Vt})]}),visit:e.jsxs("svg",{width:"72",height:"48",viewBox:"0 0 72 48",children:[e.jsx("circle",{cx:36,cy:24,r:19,...jr}),e.jsx("circle",{cx:36,cy:24,r:3.5,fill:Vt})]})};function po(t,l=!1,p){const u=rl(t,"log",l,p);return u==="point"?{kind:"point",center:void 0}:u==="area"?{kind:"area",center:void 0,radiusM:0}:{kind:"route",path:[],snapped:!1}}function Sl(t){const{myDogs:l,selected:p,onChange:u}=t;return l.length===1&&!l[0].deceased?e.jsxs("div",{className:"atl-companions",children:[e.jsx("style",{children:Tr}),e.jsx(Ml,{dog:l[0],selected:p,onChange:u})]}):e.jsxs("div",{className:"atl-companions",children:[e.jsx("style",{children:Tr}),e.jsx(Qi,{myDogs:l,selected:p,onChange:u}),e.jsx(Pl,{selected:p,onChange:u})]})}const Ol=60,Dl="#B7701F";function Nr({text:t}){const l=Na(),p=t.trim().length,u=Is(t)?"ok":p<Ol?"low":"mid",g=u==="ok"?r.growGreen:u==="low"?r.alertRed:Dl;return e.jsxs("p",{className:"atl-storymeter",style:{color:g},"aria-live":"polite",children:[e.jsx("b",{children:u==="ok"?p:`${p}/${Cs}`})," · ",l(`pack.addTrip.step.storyMeter.${u}`)]})}function Pl({selected:t,onChange:l}){const p=Na(),[u,g]=o.useState(""),S=t.filter(v=>v.key.startsWith(ko));return e.jsxs("div",{style:{marginTop:12},children:[S.length>0&&e.jsx("div",{className:"comm-comp-selected",style:{marginBottom:8},children:S.map(v=>e.jsxs("button",{type:"button",className:"comm-comp-chip",onClick:()=>l(t.filter(A=>A.key!==v.key)),"aria-label":p("pack.companions.remove",{name:v.name}),children:[e.jsx("span",{className:`comm-comp-chip-av${v.photo?"":" ph"}`,style:v.photo?{backgroundImage:`url('${ut(v.photo,96)}')`}:void 0,children:v.photo?"":v.name.charAt(0).toUpperCase()}),e.jsx("b",{children:v.name})]},v.key))}),e.jsx("input",{className:"atl-input comm-input",value:u,onChange:v=>g(v.target.value),placeholder:p("pack.addTrip.step.findMember")}),e.jsx(Fr,{q:u,selected:t,onPick:v=>{l([...t,v]),g("")}}),e.jsx(Kr,{selected:t})]})}function Fr({q:t,selected:l,onPick:p}){const u=Na(),[g,S]=o.useState([]);o.useEffect(()=>{const f=t.trim();if(f.length<2){S([]);return}let k=!0;const D=window.setTimeout(()=>{Yi(f).then(K=>{k&&S(K)})},250);return()=>{k=!1,window.clearTimeout(D)}},[t]);const v=new Set(l.map(f=>f.key)),A=g.filter(f=>!v.has(`${ko}${f.userId}`)&&!v.has(`${mn}${f.userId}`));return A.length===0?null:e.jsx("ul",{className:"atl-msug",role:"listbox","aria-label":u("pack.addTrip.step.memberSuggest"),children:A.map(f=>{const k=f.name||u("pack.triplist.fallbackDogyptian");return e.jsx("li",{children:e.jsxs("button",{type:"button",role:"option","aria-selected":!1,onClick:()=>p({key:`${ko}${f.userId}`,name:k,sub:f.dogNames.join(", "),photo:f.avatarUrl}),children:[e.jsx("span",{className:`atl-msug-av${f.avatarUrl?"":" ph"}`,style:f.avatarUrl?{backgroundImage:`url('${ut(f.avatarUrl,96)}')`}:void 0,children:f.avatarUrl?"":k.charAt(0).toUpperCase()}),e.jsxs("span",{className:"atl-msug-txt",children:[e.jsx("b",{children:k}),f.dogNames.length>0&&e.jsxs(e.Fragment,{children:[" · ",f.dogNames.join(", ")]})]}),f.packNumber!=null&&e.jsxs("span",{className:"atl-msug-num",children:["#",f.packNumber]})]})},f.userId)})})}function Kr({selected:t}){const l=Na(),p=t.filter(u=>u.key.startsWith(ko)).map(u=>u.name);return p.length===0?null:e.jsx("p",{className:"atl-field-hint",style:{marginTop:8},children:l("pack.addTrip.step.inviteNote",{names:p.join(", ")})})}function Ml({dog:t,selected:l,onChange:p}){const u=Na(),[g,S]=o.useState(""),v=l.filter(P=>!P.key.startsWith("dog-")&&!P.key.startsWith(mn)),A=()=>{const P=g.trim();!P||l.some(m=>m.key===`member-${P}`)||(p([...l,{key:`member-${P}`,name:P}]),S(""))},f=P=>p(l.filter(m=>m.key!==P)),k=`dog-${t.id}`,D=l.some(P=>P.key===k),K=()=>D?f(k):p([...l,{key:k,name:t.name||"My dog",sub:"your pack",photo:t.photo}]);return e.jsxs(e.Fragment,{children:[v.length>0&&e.jsx("div",{className:"comm-comp-selected",children:v.map(P=>e.jsxs("span",{className:"comm-comp-chip",children:[e.jsx("span",{className:`comm-comp-chip-av${P.photo?"":" ph"}`,style:P.photo?{backgroundImage:`url('${ut(P.photo,96)}')`}:void 0,children:P.photo?"":P.name.charAt(0).toUpperCase()}),e.jsx("b",{children:P.name}),e.jsx("button",{type:"button",onClick:()=>f(P.key),"aria-label":u("pack.companions.remove",{name:P.name}),children:"×"})]},P.key))}),e.jsxs("div",{className:"atl-solo-row",children:[e.jsxs("button",{type:"button",className:`comm-comp-dog${D?" on":""}`,onClick:K,"aria-pressed":D,"aria-label":t.name||u("pack.companions.myDog"),children:[e.jsx("span",{className:`comm-comp-dog-av${t.photo?"":" ph"}`,style:t.photo?{backgroundImage:`url('${ut(t.photo,96)}')`}:void 0,children:t.photo?"":(t.name||"D").charAt(0).toUpperCase()}),e.jsx("span",{children:t.name||u("pack.companions.myDog")}),!D&&e.jsx("span",{className:"plus",children:"+"})]}),e.jsx("div",{className:"comm-comp-searchwrap",children:e.jsxs("div",{className:"comm-comp-searchrow",children:[e.jsx("input",{className:"atl-input comm-input",value:g,onChange:P=>S(P.target.value),onKeyDown:P=>{P.key==="Enter"&&(P.preventDefault(),A())},placeholder:u("pack.addTrip.step.anyoneElse")}),e.jsx("button",{type:"button",className:"comm-comp-addbtn",onClick:A,disabled:!g.trim(),"aria-label":u("pack.companions.addTyped"),title:u("pack.companions.addTyped"),children:"+"})]})})]}),e.jsx(Fr,{q:g,selected:l,onPick:P=>{p([...l,P]),S("")}}),e.jsx(Kr,{selected:l}),e.jsx("div",{style:{marginTop:12},children:e.jsx(es,{selected:l,onChange:p})})]})}function Jd({allTrails:t,authorName:l,myDogs:p,onSubmit:u,onClose:g,onBackToEntry:S,placeholderFor:v,mapRef:A,seedPoint:f,onMapPhase:k,onHasRoute:D,onPlaceNote:K,onRemoveNote:P,placedNotes:m,notePlacing:E,finishTrail:T,fromPlan:R,reroute:G,presetJourneyId:xe}){var Hn,Jn,Gn,Wn,Yn,Xn;const n=Na(),ma=a=>n("pack.addTrip.step.pts"+tn(a),{n:a}),{lang:V}=Er(),[$,B]=o.useState(""),[te,oe]=o.useState(null),[De,Pe]=o.useState(0),[Aa,Ta]=o.useState(null),[b,Me]=o.useState({kind:"route",path:[],snapped:!1}),[M,U]=o.useState(1),[Je,wa]=o.useState(0),[Ne,ka]=o.useState(""),[ie,be]=o.useState(""),[Ge,Ja]=o.useState(void 0),[ee,Ea]=o.useState(!1),[Ie,We]=o.useState(""),[Ga,$a]=o.useState(""),[ye,Ye]=o.useState(""),[W,je]=o.useState(""),[pe,mt]=o.useState(""),[ce,se]=o.useState(new Set),[Ae,ge]=o.useState(new Set),[Te,Ce]=o.useState(new Set),[kt,ht]=o.useState(""),[Re,we]=o.useState(""),[Sa,_t]=o.useState(null),[Wa,vo]=o.useState(!1),[Le,Ee]=o.useState(""),[Z,Be]=o.useState([]),[ha,fo]=o.useState([]),[Bt,bt]=o.useState(!1),gt=o.useRef(""),[Ut,Ya]=o.useState(!1),[Fe,Xa]=o.useState("private"),[ve,vt]=o.useState(0),[H,Ke]=o.useState([]),[qa,Ve]=o.useState(""),[ba,Zt]=o.useState(0),[ga,Ht]=o.useState(50),[ft,xt]=o.useState(""),[xo,va]=o.useState(!1),[Qa,fa]=o.useState(!1),[Xe,yt]=o.useState(void 0),[jt,Oa]=o.useState(""),[yo,Da]=o.useState(!1),[fe,ta]=o.useState(!1),[oa,Ue]=o.useState(!1),qe=o.useRef({km:0,ascentM:null,minutes:null,points:0}),et=o.useRef(null),Jt=(a,s)=>{if(B(a),oe(s),Ta(null),U(on.includes(a)&&s!=="planned"?7:1),wa(0),yt(void 0),Da(!1),Oa(""),G){if(a===zn.current)return;Ce(new Set),we("")}const c=po(a);if(f){const w=[f.lat,f.lon];Me(c.kind==="route"?{kind:"route",path:[w],snapped:!1}:c.kind==="point"?{kind:"point",center:w}:{kind:"area",center:w,radiusM:Kt});return}Me(c)},xa=o.useMemo(()=>{const a=jt.trim().toLowerCase();return a?Wo.filter(s=>s.name.toLowerCase().includes(a)):Wo},[jt]),zt=a=>{yt(a.id),ka(a.name),Me({kind:"route",path:a.path,snapped:!0}),qe.current={km:parseFloat(a.km)||0,ascentM:a.ascentM??a.journey.ascentM??null,minutes:null,points:a.path.length}},at=o.useRef(!1);o.useEffect(()=>{if(!xe||at.current)return;const a=Wo.find(s=>s.id===xe);a&&(at.current=!0,wt.current=!0,oe("walked"),B("hike"),ta(!0),Ue(!0),Oa(a.name),zt(a))},[xe]);const Nt=()=>{Da(!0),yt(void 0),Me(po($,fe))},Qe=ms($),na=b.kind!=="route",ra=$==="visit",jo={route:"place",about:"aboutPlace"},zo={rest:"feel"},Gt=a=>ia&&zo[a]||na&&jo[a]||a,ea=o.useMemo(()=>ks($),[$]),Pa=o.useMemo(()=>hs($),[$]),tt=o.useMemo(()=>Pa.filter(a=>!$l.has(a.id)),[Pa]),i=o.useMemo(()=>[...ea,Va],[ea]),d=kt&&Te.has(kt)?kt:((Hn=i.find(a=>Te.has(a.id)))==null?void 0:Hn.id)??"",j=a=>{Ce(s=>{const c=new Set(s);return d&&d!==a&&c.delete(d),c.add(a),c}),ht(a)};o.useEffect(()=>{if(!$)return;const a=kn($,fe,d);Me(s=>!a.allowed.includes(s.kind)||!(s.kind==="route"?s.path.length>0:!!s.center)&&s.kind!==a.default?po($,fe,d):s)},[$,fe,d]);const N=Nl[$],h=H.length>0?Math.min(ba,H.length-1):0,y=H[h]??v([(N==null?void 0:N.dataId)??"hike"],Ne.trim()||$||"trip"),I=new Date().toISOString().slice(0,10),[L,J]=o.useState("exact"),[Y,$e]=o.useState(""),[Ze,At]=o.useState(""),[Wt,hn]=o.useState(1),[Tt,bn]=o.useState(""),[Yt,gn]=o.useState(""),[Ma,vn]=o.useState(!1),[No,Ao]=o.useState(1),O=te?te==="planned":!ee&&!!ie&&ie>I,ia=on.includes($)&&!O,ya=O&&Fe==="private",Vr=o.useMemo(()=>{const[a,s]=I.split("-").map(Number),c=new Intl.DateTimeFormat(sn(V),{month:"long",year:"numeric"});return Array.from({length:18},(w,X)=>{const he=new Date(a,s-1+X,1);return{value:`${he.getFullYear()}-${String(he.getMonth()+1).padStart(2,"0")}`,label:c.format(he)}})},[I,V]),_r=a=>{var s;try{(s=a==null?void 0:a.showPicker)==null||s.call(a)}catch{}},fn=o.useMemo(()=>{const a=b.kind==="route"?b.snapPath??b.path:[];if(a.length<2)return null;let s=1/0,c=-1/0,w=1/0,X=-1/0;for(const[st,lt]of a)st<s&&(s=st),st>c&&(c=st),lt<w&&(w=lt),lt>X&&(X=lt);const he=c-s||1e-9,Se=X-w||1e-9,Oe=8,_e=100-Oe*2;return a.map(([st,lt])=>{const wi=X===w?50:Oe+(lt-w)/Se*_e,Ei=c===s?50:Oe+(c-st)/he*_e;return`${wi.toFixed(1)},${Ei.toFixed(1)}`}).join(" ")},[b]),Br=o.useRef(!1),[z,xn]=o.useState(()=>{var s,c;if(T||xe)return null;const a=bs();return a&&(a.name||((s=a.geometry)==null?void 0:s.kind)==="route"&&((c=a.geometry.path)!=null&&c.length))?a:null}),yn=o.useRef(!1);o.useEffect(()=>{if(yn.current||z)return;const a=p==null?void 0:p.find(s=>!s.deceased);a&&(yn.current=!0,Be(s=>s.length?s:[{key:`dog-${a.id}`,name:a.name||"My dog",sub:"your pack",photo:a.photo??void 0}]))},[p,z]);const wt=o.useRef(!1),Ur=()=>{var s,c;if(!z)return;Br.current=!0,wt.current=!0,B(z.activity||""),(z.state==="planned"||z.state==="walked")&&oe(z.state);const a=z.state==="planned"?us(z.date):null;a&&(J(a.precision),At(a.month),a.day&&$e(a.day),a.week&&hn(a.week)),ka(z.name||""),be(z.date||""),We(z.dateEnd||""),ta(!!z.multiDay),Ea(z.dateKind==="flexible"),z.geometry&&Me(z.geometry),z.country&&$a(z.country),z.region&&Ye(z.region),z.crowd&&qo.includes(z.crowd)&&je(z.crowd),z.diff&&nn.includes(z.diff)&&mt(z.diff),(s=z.surface)!=null&&s.length&&se(new Set(z.surface)),z.tags&&ge(new Set(z.tags)),(c=z.chips)!=null&&c.length&&Ce(new Set(z.chips)),z.ownAct&&we(z.ownAct),z.crew&&Be(z.crew),z.paws&&vt(z.paws),z.note&&Ee(z.note),z.visibility&&Xa(z.visibility),z.travelMode&&bn(z.travelMode),z.travelFrom&&gn(z.travelFrom),z.pickup&&vn(!0),z.pickupSeats&&Ao(z.pickupSeats),z.step&&z.step>=1&&z.step<=6&&U(z.step),xn(null)},Zr=()=>{so(),js(),xn(null)},Xt=!!T,qt=Xt&&!R&&!G,To=qt?3:1,jn=o.useRef(!1),zn=o.useRef(null);o.useEffect(()=>{var X,he,Se,Oe;if(!T||jn.current)return;jn.current=!0,wt.current=!0,oe("walked"),ka(T.name??"");const a=un.find(_e=>(T.acts??[]).includes(_e.dataId));zn.current=(a==null?void 0:a.id)??null,a&&!G&&B(a.id);const s=gs(T.acts??[]).map(_e=>_e.id);s.length&&Ce(new Set(s));const c=T.areaR,w=(X=T.path)==null?void 0:X[0];Me(c&&c>0&&w?{kind:"area",center:w,radiusM:c}:{kind:"route",path:(R||G?T.planPath:void 0)??(G?Mr(T.path??[]):T.path)??[],snapPath:T.path??[],snapped:!0}),T.country&&$a(T.country),R?be(I):T.date?be(T.date):Ea(!0),T.dateEnd&&(We(T.dateEnd),ta(!0)),T.crowd&&qo.includes(T.crowd)&&je(T.crowd),T.diff&&nn.includes(T.diff)&&mt(T.diff),(he=T.surface)!=null&&he.length&&se(new Set(T.surface)),(Se=T.tags)!=null&&Se.length&&ge(new Set(T.tags)),T.stars&&vt(T.stars),T.desc&&Ee(T.desc),(Oe=T.photos)!=null&&Oe.length&&Ke(T.photos),R||G?(U(a&&on.includes(a.id)?7:1),Pe(0),R&&Vn(!0)):(U(3),Pe(ue.length-1))},[T,R,G]);const Ia=b.kind==="route"?b.path.length>=2:!!b.center,Hr=b.kind==="route"&&!!b.minimal,aa=$==="hike"&&fe,Nn=!O&&aa&&!ee&&!(Ie&&Ie>ie),Et=(()=>{if(!aa||!ie||!Ie||Ie<=ie)return 0;const[a,s,c]=ie.split("-").map(Number),[w,X,he]=Ie.split("-").map(Number),Se=Date.UTC(a,s-1,c),Oe=Date.UTC(w,X-1,he);return Math.round((Oe-Se)/864e5)+1})(),$t=b.kind==="route"?b.snapPath??b.path:b.center?[b.center]:[],Jr=$t.length>0?as({path:$t}):"sk",Gr=$t.length===0,Ca=Ga||Jr,Wr=rn.includes(Ca)?rn:[Ca,...rn],Yr=$t.length>0?ns({path:$t}):null,Qt=ye||Yr||"",wo=(a,s,c)=>{const w=new Set(a);w.has(c)?w.delete(c):w.add(c),s(w)},Xr=(a,s)=>{const c=!Te.has(a);wo(Te,Ce,a),_t(s&&c?a:Sa===a?null:Sa)},Eo=(a,s)=>{const c=`pack.map.chipLabel.${a}`,w=n(c);return w===c?s:w},$o=(a,s)=>e.jsxs("button",{type:"button","aria-pressed":Te.has(a.id),className:`atl-chip${Te.has(a.id)?" on":""}`,onClick:()=>Xr(a.id,s),children:[e.jsx("span",{className:"atl-chip-emoji",style:{fontFamily:ca},children:a.emoji}),e.jsx("span",{className:"atl-chip-label",children:Eo(a.id,a.label)})]},a.id),So=a=>e.jsxs("button",{type:"button",className:`atl-chip${Ae.has(a.label)?" on":""}`,onClick:()=>wo(Ae,ge,a.label),children:[e.jsx("span",{className:"atl-chip-emoji",children:a.emoji}),e.jsx("span",{className:"atl-chip-label",children:n(`pack.map.tagLabel.${a.id}`)})]},a.label),An=a=>e.jsxs("div",{className:`atl-field${Fa(a,!!W)}`,children:[e.jsx("label",{children:n("pack.addTrip.log.crowd")}),e.jsx("div",{className:"atl-chips",role:"radiogroup","aria-label":n("pack.addTrip.log.crowd"),children:qo.map(s=>e.jsxs("button",{type:"button",role:"radio","aria-checked":W===s,className:`atl-chip${W===s?" on":""}`,onClick:()=>je(W===s?"":s),children:[e.jsx("span",{className:"atl-chip-emoji",style:{fontFamily:ca},children:Rs[s]}),e.jsx("span",{className:"atl-chip-label",children:n(`pack.map.crowdKind.${s}`)})]},s))})]}),qr=Sa&&Te.has(Sa)?e.jsxs("div",{className:"atl-where",children:[e.jsxs("span",{className:"atl-where-txt",children:[e.jsx("b",{children:n("pack.addTrip.log.whereAsk")}),e.jsx("i",{children:n("pack.addTrip.log.whereSkip")})]}),e.jsx("button",{type:"button",className:"atl-where-btn",onClick:()=>{_t(null),_o("comment")},children:n("pack.addTrip.log.whereBtn")})]}):null,Qr=async a=>{const s=Array.from(a.target.files??[]);a.target.value="",await wn(s)},[Tn,Oo]=o.useState(!1),ei={onDragOver:a=>{Array.from(a.dataTransfer.types).includes("Files")&&(a.preventDefault(),a.dataTransfer.dropEffect=H.length>=da?"none":"copy",Tn||Oo(!0))},onDragLeave:a=>{a.currentTarget.contains(a.relatedTarget)||Oo(!1)},onDrop:a=>{Array.from(a.dataTransfer.types).includes("Files")&&(a.preventDefault(),Oo(!1),wn(Array.from(a.dataTransfer.files)))}},wn=async a=>{const s=a.filter(_e=>_e.type.startsWith("image/")),c=da-H.length;if(c<=0){Ve(`Max ${da} photos reached.`);return}const w=s.slice(0,c),X=await Promise.all(w.map(_e=>Ds(_e))),he=X.filter(Boolean);he.length&&Ke(_e=>[..._e,...he].slice(0,da));const Se=[];s.length>c&&Se.push(`only ${c} added (max ${da})`);const Oe=X.length-he.length;Oe>0&&Se.push(`${Oe} couldn't be read — use JPG/PNG (HEIC not supported)`),a.length>s.length&&Se.push(`${a.length-s.length} skipped (not an image)`),Ve(Se.join(" · "))},Do=(a,s)=>{Ke(c=>{const w=[...c],[X]=w.splice(a,1);return w.splice(s,0,X),w}),Zt(0)},ai=a=>{Ke(s=>s.filter((c,w)=>w!==a)),Zt(0)};o.useEffect(()=>{ba>0&&ba<H.length&&Do(ba,0)},[ba,H.length]);const[St,Ra]=o.useState(!1),ja=o.useMemo(()=>{const a=Date.now();return{id:T?T.id:`${O?"plan":"log"}-${a}`,existingTripId:Xe,finishTripId:T==null?void 0:T.id,finishFromPlan:R||void 0,finishReroute:G||void 0,state:O?"planned":"walked",approval:O?"approved":"draft",visibility:O?Fe:void 0,travelMode:O&&Tt?Tt:void 0,travelFrom:O&&Yt.trim()?Yt.trim():void 0,pickup:O&&Ma?!0:void 0,pickupSeats:O&&Ma?No:void 0,name:Ne.trim(),activity:$,geometry:b,country:Ca,region:Ca==="sk"&&Qt?Qt:void 0,dateKind:ee?"flexible":"exact",date:ee?void 0:ie||void 0,dateEnd:!ee&&aa?Ie:void 0,multiDay:aa||void 0,crew:Z,diff:!O&&Qe&&pe?pe:void 0,surface:!O&&Qe&&ce.size>0?Array.from(ce):void 0,crowd:!O&&W?W:void 0,tags:Ae.size>0?Array.from(Ae):void 0,chips:Te.size>0?Array.from(Te):void 0,ownAct:Te.has(Va.id)&&Re.trim()?Re.trim():void 0,paws:!O&&ve>0?ve:void 0,photos:!O&&H.length>0?[H[h],...H.filter((s,c)=>c!==h)]:void 0,coverIndex:!O&&H.length>0?0:void 0,coverY:ga,note:Le.trim()||void 0,authorName:l,createdAt:a,updatedAt:a,step:M,sourceGpx:b.kind==="route"&&b.path.length>0?Ge:void 0}},[Ge,Ne,$,b,Ca,Qt,ee,ie,aa,Ie,Z,Qe,pe,ce,W,Ae,Te,Re,ve,H,h,ga,Le,l,Xe,O,Fe,M,T,R,G,Tt,Yt,Ma,No]),ot=vs(ja),Po=a=>a.map(s=>n(s)).join(", "),En=!O&&!Z.some(a=>a.key.startsWith("dog-")),[nt,Mo]=o.useState(null),Io=o.useRef(new Set),$n=new Map((p??[]).filter(a=>a.deceased).map(a=>[`dog-${a.id}`,a.name])),ti=a=>{const s=new Set(Z.map(w=>w.key)),c=a.find(w=>!s.has(w.key)&&$n.has(w.key)&&!Io.current.has(w.key));Be(a),c&&(Io.current.add(c.key),Mo({key:c.key,name:$n.get(c.key)||c.name}))},eo=ot.toSubmit.length===0&&!Nn&&!En,Ot=o.useMemo(()=>{const a=new Set((m??[]).map(s=>en(s.kind)));return Ms({desc:Le,photos:H.length,route:Ia,parking:a.has("parking"),tip:a.has("warning")||a.has("comment")})},[Le,H.length,Ia,m]),oi=a=>{if(a==="photos"){Ra(!0),U(5),window.setTimeout(()=>{var s;(s=document.querySelector(".atl-photo-drop"))==null||s.scrollIntoView({block:"center",behavior:"smooth"})},80);return}if(a==="desc"){Ra(!1),U(5);return}if(a==="route"){U(1);return}wa(a==="parking"?0:1),U(2)},ni=ot.toApprove.length===0?"pending":"draft",Co=o.useMemo(()=>Xe||T?null:sl(b,t),[Xe,T,b,t]);o.useEffect(()=>{var w;if(z||Xt||!(!!ja.name||((w=ja.geometry)==null?void 0:w.kind)==="route"&&ja.geometry.path.length>0))return;const{photos:s,...c}=ja;fs(c)},[ja,z]);const[Ro,Sn]=o.useState(!1),ri=4e3,ii=async()=>{var w;if(qe.current.ascentM!=null)return qe.current.ascentM;const a=ja.geometry;if(!a||a.kind!=="route")return null;const s=(w=a.snapPath)!=null&&w.length?a.snapPath:a.path;if(s.length<2)return null;const c=ln(s,dn);if(ho(c)===0)return bo(s,Za);try{await Promise.race([Pr(c),new Promise(X=>setTimeout(X,ri))])}catch{}return ho(c)<c.length?bo(s,Za):null},On=async()=>{xt(""),Sn(!0);const a=await ii();Sn(!1);const s={...ja,approval:ni,km:qe.current.km>0?Number(qe.current.km.toFixed(1)):void 0,ascentM:a??void 0,minutes:qe.current.minutes??void 0};if(!u(s)){xt("Couldn't save — storage might be full. Remove something and try again.");return}Xt||so(),fa(!1)},si=()=>{if(!(!eo||Ro)){if(Co&&!xo){fa(!0);return}On()}},li=()=>{va(!0),On()},di=["route","notes","basics","about","rest","departure","what","grade"],Dn=oa&&!yo,sa=!!$&&M===1&&!Dn&&!z,Pn=!!$&&M===2&&!z,ao=sa?"draw":Pn?"notes":"off";o.useEffect(()=>{k==null||k(ao)},[ao,k]);const Mn=b.kind==="route"?((Jn=b.snapPath)!=null&&Jn.length?b.snapPath.length:b.path.length)>=2:!!b.center;o.useEffect(()=>{D==null||D(Mn)},[Mn,D]),o.useEffect(()=>()=>{D==null||D(!1)},[D]),o.useEffect(()=>()=>{k==null||k("off")},[k]),o.useEffect(()=>{var X;if(!wt.current)return;const a=A.current;if(!a)return;const s=b.kind==="route"?(X=b.snapPath)!=null&&X.length?b.snapPath:b.path:b.center?[b.center]:[];if(!s.length)return;wt.current=!1;const[c,w]=Hi();a.fitBounds(F.latLngBounds(s),{paddingTopLeft:[c,110],paddingBottomRight:[w,260],maxZoom:15,animate:!0})},[b,A]);const In=d===Va.id&&!Re.trim(),Dt=M===1&&!Ia||M===7&&(!d||In),ue=o.useMemo(()=>O?[1,3,6]:ia?[7,1,2,3,5,8]:[1,2,3,4,5,8],[O,ia]),Pt=Math.max(0,ue.indexOf(M)),Lo=qt?Math.max(0,ue.indexOf(To)):0,Fo=M===ue[ue.length-1],La=a=>{const s=ue.indexOf(a);return s>=0&&s<ue.length-1?ue[s+1]:ue[ue.length-1]};o.useEffect(()=>{if(ue.includes(M))return;const a=[...ue].reverse().find(s=>s<M);U(a??ue[0])},[ue,M]);const pi=()=>{if(Dt)return;if(M===5&&!O&&!St){Ra(!0);return}const a=La(M);a===5&&Ra(!1),U(a)},Ko=()=>{if(M===5&&St){Ra(!1);return}const a=Pt>0?ue[Pt-1]:null;if(a===5&&Ra(!0),a!=null&&Pt-1>=Lo){U(a);return}if(Xt){g();return}B(""),oe(null),Ta(null)},rt=[{group:"parking",qKey:"pack.addTrip.step.askParking",ctaKey:"pack.addTrip.step.markParking"},{group:"warning",qKey:"pack.addTrip.step.askWarning",ctaKey:"pack.addTrip.step.markWarning"},{group:"comment",qKey:"pack.addTrip.step.askTip",ctaKey:"pack.addTrip.step.markTip"}],Cn=(m==null?void 0:m.length)??0,ci=a=>(m??[]).filter(s=>en(s.kind)===a).length,ui=()=>{var w;const a=A.current;if(!a||a.getZoom()>=Ba)return;const s=b.kind==="route"?(w=b.snapPath)!=null&&w.length?b.snapPath:b.path:b.center?[b.center]:[],c=s.length?F.latLngBounds(s).getCenter():a.getCenter();a.flyTo(c,Ba,{duration:.6})},Vo=o.useRef(!1);o.useEffect(()=>{if(M!==2){Vo.current=!1;return}if(Vo.current)return;const a=A.current;if(!a||b.kind!=="area"||!b.center)return;Vo.current=!0;const s=b.radiusM||Kt;a.fitBounds(F.latLng(b.center).toBounds(s*2),{...Rt(Lt()),maxZoom:17,animate:!0})},[M,b,A]);const _o=(a,s)=>{ui(),K==null||K(a,s)},la=Pn,to=rt[Math.min(Je,rt.length-1)].group,Rn=dr[to],mi=o.useMemo(()=>{const a=new Set;for(const s of m??[])a.add(en(s.kind));return a},[m]),ki=e.jsx("div",{className:"atl-ntrack",role:"list","aria-label":n("pack.addTrip.step.name.notes"),children:rt.map((a,s)=>{const c=mi.has(a.group),w=!c&&s!==Je;return e.jsxs("button",{type:"button",role:"listitem",className:`atl-ntrack-i${s===Je?" on":""}${c?" ok":""}${w?" miss":""}`,onClick:()=>{wa(s),dr[a.group].length===1&&_o(a.group)},"aria-current":s===Je?"step":void 0,children:[e.jsx("b",{children:c?"✓":n(`pack.mapNotes.group.${a.group}`).slice(0,1)}),e.jsx("span",{children:n(`pack.mapNotes.group.${a.group}`)}),(c||w)&&e.jsx("em",{className:"atl-ntrack-pts",children:c?`+${Qo.note}`:"0"})]},a.group)})}),hi=e.jsxs(e.Fragment,{children:[ki,e.jsxs(e.Fragment,{children:[Rn.length>1&&e.jsx(Zi,{row:!0,scroll:!0,kinds:Rn,selected:null,tint:pn[to],onPick:a=>_o(to,a)}),e.jsx("div",{className:"atl-noteask-btns",children:e.jsx("button",{type:"button",className:"trp-dbar-done trp-dbar-done--hero",onClick:()=>U(3),children:n("pack.addTrip.step.doneNotes")})})]}),e.jsx(Ar,{notes:m,t:n,emptyKey:"pack.addTrip.step.noNotesYet",onRemove:P})]}),bi=e.jsx("div",{className:"atl-noteask atl-noteask--bar",children:hi}),Bo=o.useMemo(()=>({1:Ia?[]:[na?"pack.addTrip.field.geometryArea":"pack.addTrip.field.geometry"],2:Cn>0?[]:["pack.addTrip.field.notes"],3:[...Ne.trim()?[]:["pack.addTrip.field.name"],...O||ee||ie?[]:["pack.addTrip.field.date"],...!ia||Ae.size?[]:["pack.addTrip.field.tags"],...O||!ia||W?[]:["pack.addTrip.field.crowd"]],4:O?[]:[...!Qe||pe?[]:["pack.addTrip.field.diff"],...!Qe||ce.size>0?[]:["pack.addTrip.field.surface"],...W?[]:["pack.addTrip.field.crowd"],...Ae.size?[]:["pack.addTrip.field.tags"]],5:O?[]:[...ve>0?[]:["pack.addTrip.field.paws"]],6:!O||ie?[]:["pack.addTrip.field.date"],7:d&&!(d===Va.id&&!Re.trim())?[]:[$==="activity"?"pack.addTrip.field.doing":"pack.addTrip.field.place"]}),[Ia,Cn,Ne,ee,ie,O,ia,Qe,pe,ce,W,Ae,ve,d,Re,$]),Ln=a=>De>ue.indexOf(a),Fa=(a,s)=>!s&&Ln(a)?" atl-miss":"";o.useEffect(()=>{O&&be(ds(L,Ze,L==="week"?Wt:Y))},[O,L,Ze,Wt,Y]),o.useEffect(()=>{Pe(a=>Math.max(a,Pt))},[Pt]);const Fn=e.jsx("div",{className:`atl-steps${sa||la?" atl-steps--onmap":""}`,role:"tablist","aria-label":n("pack.addTrip.step.progress"),children:ue.map((a,s)=>{var c;return e.jsxs("button",{type:"button",role:"tab","aria-selected":M===a,className:`atl-step${M===a?" on":""}${M!==a&&De>=s?" done":""}${De>=s&&((c=Bo[a])==null?void 0:c.length)===0?" ok":""}`,onClick:()=>{a!==M&&s<=De&&s>=Lo&&(a===5&&Ra(!1),U(a))},disabled:s>De||s<Lo,title:a<To?n("pack.addTrip.step.lockedInDraft"):void 0,children:[e.jsx("b",{children:s+1}),e.jsxs("span",{children:[n(`pack.addTrip.step.name.${Gt(di[a-1])}`),a===5&&M===5&&!O&&` ${St?2:1}/2`]})]},a)})});o.useEffect(()=>{var c;if(ao==="off")return;const a=A.current;if(!a)return;const s=b.kind==="route"?(c=b.snapPath)!=null&&c.length?b.snapPath:b.path:b.center?[b.center]:[];s.length&&a.fitBounds(F.latLngBounds(s),{...Rt(Lt()),maxZoom:15,animate:!1})},[ao,A]);const gi=300,vi=o.useMemo(()=>{if(b.kind!=="route"||b.path.length<2)return!1;const a=b.path[0],s=b.path[b.path.length-1],c=6371e3,w=(s[0]-a[0])*Math.PI/180,X=(s[1]-a[1])*Math.PI/180,he=a[0]*Math.PI/180,Se=s[0]*Math.PI/180,Oe=Math.sin(w/2)**2+Math.cos(he)*Math.cos(Se)*Math.sin(X/2)**2;return 2*c*Math.asin(Math.min(1,Math.sqrt(Oe)))>gi},[b]),[fi,Uo]=o.useState(!1),[Kn,Vn]=o.useState(!1),oo=a=>n(O?`${a}.plan`:a),[xi,Mt]=o.useState(!1),[Zo,Ka]=o.useState(null),[yi,_n]=o.useState(!1),no=o.useRef(null),ro=o.useRef(null),Ho=o.useRef(!1),io=o.useRef(!1),[ji,It]=o.useState(!1),zi=()=>{so(),It(!1),g()};o.useEffect(()=>{!Kn||M!==1||(Vn(!1),Uo(!0))},[Kn,M]);const Bn=a=>{ta(a),a||(We(""),Ue(!1),Da(!1))},Un=O?"pack.addTrip.step.dayModeAsk.plan":"pack.addTrip.step.dayModeAsk",Ni=$==="hike"&&sa?e.jsxs("div",{className:"atl-daymode",children:[e.jsx("span",{className:"atl-daymode-ask",children:n(Un)}),e.jsxs("div",{className:"atl-toggle-row",role:"tablist","aria-label":n(Un),children:[e.jsx("button",{type:"button",role:"tab","aria-selected":!fe,className:`atl-toggle-btn${fe?"":" on"}`,onClick:()=>Bn(!1),children:n("pack.addTrip.step.oneDay")}),e.jsx("button",{type:"button",role:"tab","aria-selected":fe,className:`atl-toggle-btn${fe?" on":""}`,onClick:()=>Bn(!0),children:n("pack.addTrip.step.moreDays")})]}),fe&&!oa&&e.jsx("button",{type:"button",className:"atl-daymode-link",onClick:()=>Ue(!0),children:n("pack.addTrip.step.pickJourney")})]}):null,it=b.kind==="route"?(Gn=b.snapPath)!=null&&Gn.length?b.snapPath:b.path:b.center?[b.center]:[],Ai=async()=>{if(!it.length)return;bt(!0);const a=Z.filter(c=>!c.key.startsWith(mn)).map(c=>c.name),s=await Gi(it,Ne,a,V);bt(!1),s&&fo(s)};o.useEffect(()=>{if(M!==3||!it.length)return;const a=`${it[0].join(",")}|${it.length}`;gt.current!==a&&(gt.current=a,Ai())},[M,it]);const Jo=()=>{var a;return b.kind==="route"?(a=b.snapPath)!=null&&a.length?b.snapPath:b.path:[]},Go=async a=>{if(!($==="hike"&&!fe&&!Xe&&b.kind==="route"&&a.length>=2)){U(La(1));return}const c=Ns(a)/1e3;if(c<Yo){Ka({km:c,share:null,line:a});return}if(Ho.current){U(La(1));return}_n(!0);const w=await As(a);if(_n(!1),w!=null&&w>Ts){Ka({km:c,share:w,line:a});return}U(La(1))},Zn=()=>{Ka(null),ta(!1),mt(""),B("activity"),Ce(a=>new Set([...a,"walk"])),ht("walk"),Ho.current=!0,io.current=!1,U(La(1))},Ti={active:sa||la&&!E,contextPill:ia&&d?e.jsxs("span",{className:"atl-ctxpill",children:[e.jsx("span",{style:{fontFamily:ca},children:(Wn=i.find(a=>a.id===d))==null?void 0:Wn.emoji}),e.jsx("span",{children:d===Va.id&&Re.trim()?Re.trim():Eo(d,((Yn=i.find(a=>a.id===d))==null?void 0:Yn.label)??"")})]}):void 0,onDone:()=>{(async()=>{var s;const a=await((s=ro.current)==null?void 0:s.call(ro));if(vi&&!io.current){Mt(!0);return}Go(a??Jo())})()},onBack:()=>{if(la){U(1);return}if(Ia){It(!0);return}so(),g()},backLabel:la?na?"pack.addTrip.step.backToPlace":"pack.addTrip.step.backToRoute":"pack.addTrip.geo.leaveToMap",doneLabel:n("pack.addTrip.step.doneRoute"),doneDisabled:Dt||yi,paused:!sa,panel:la?bi:void 0,above:Ni,hint:Ln(M)&&((Xn=Bo[M])!=null&&Xn.length)?`${n("pack.addTrip.step.stillMissing")} ${Po(Bo[M])}`:la?ci(to)>0?n("pack.addTrip.step.askMoreOrNext"):Je===0?`${n("pack.addTrip.step.notesLead")} ${n(rt[0].qKey)} ${n("pack.addTrip.step.askHowTo")} ${n("pack.addTrip.step.askPts",{pts:ma(Qo.note)})}`:`${n(rt[Math.min(Je,rt.length-1)].qKey)} ${n("pack.addTrip.step.askPts",{pts:ma(Qo.note)})}`:void 0,onAbort:()=>It(!0),steps:Fn};return e.jsxs(e.Fragment,{children:[M===8&&!O&&$&&e.jsx("div",{className:"atl-guide",children:e.jsx($r,{text:Ot.grade==="A"?n("pack.addTrip.grade.leadA"):n("pack.addTrip.grade.lead",{grade:Ot.grade,hint:n(`pack.addTrip.grade.hint.${Ot.missing[0]}`)}),onFace:()=>Ji(),faceLabel:n("pack.addTrip.grade.askAinubis"),pulse:Ot.grade!=="A"})}),e.jsxs("div",{className:`atl-log${$?"":" atl-log--intro"}`,children:[e.jsx("style",{children:Ll}),ji&&pt.createPortal(e.jsx("div",{className:"atl-abort-scrim",role:"dialog","aria-modal":"true",onClick:()=>It(!1),children:e.jsxs("div",{className:"atl-abort",onClick:a=>a.stopPropagation(),children:[e.jsx("h2",{children:n("pack.addTrip.geo.abortTitle")}),e.jsx("p",{children:n("pack.addTrip.geo.abortBody")}),e.jsxs("div",{className:"atl-abort-btns",children:[e.jsx("button",{type:"button",className:"atl-toggle-btn on",onClick:()=>It(!1),children:n("pack.addTrip.geo.abortStay")}),e.jsx("button",{type:"button",className:"atl-abort-quit",onClick:zi,children:n("pack.addTrip.geo.abortQuit")})]})]})}),document.body),fi&&pt.createPortal(e.jsx("div",{className:"atl-abort-scrim",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"atl-abort atl-abort--ainubis",onClick:a=>a.stopPropagation(),children:[e.jsx("img",{className:"atl-abort-face",src:an,alt:"","aria-hidden":"true"}),e.jsx("h2",{children:n("pack.addTrip.plan.walkedAskTitle")}),e.jsx("p",{children:n("pack.addTrip.plan.walkedAskBody")}),e.jsxs("div",{className:"atl-abort-btns",children:[e.jsx("button",{type:"button",className:"atl-abort-cta",onClick:()=>{Uo(!1),U(La(1))},children:n("pack.addTrip.plan.walkedAskYes")}),e.jsx("button",{type:"button",className:"atl-abort-ghost",onClick:()=>Uo(!1),children:n("pack.addTrip.plan.walkedAskEdit")})]})]})}),document.body),Zo&&pt.createPortal(e.jsx("div",{className:"atl-abort-scrim",role:"dialog","aria-modal":"true",onClick:()=>Ka(null),children:e.jsxs("div",{className:"atl-abort atl-abort--ainubis",onClick:a=>a.stopPropagation(),children:[e.jsx("img",{className:"atl-abort-face",src:an,alt:"","aria-hidden":"true"}),Zo.share==null?e.jsxs(e.Fragment,{children:[e.jsx("h2",{children:n("pack.addTrip.nature.title")}),e.jsx("p",{children:n("pack.addTrip.nature.short",{km:Zo.km.toFixed(1),min:Yo})}),e.jsx("div",{className:"atl-abort-btns",children:e.jsx("button",{type:"button",className:"atl-abort-cta",onClick:Zn,children:n("pack.addTrip.nature.toWalk")})}),e.jsx("button",{type:"button",className:"atl-daymode-link",onClick:()=>Ka(null),children:n("pack.addTrip.nature.editRoute")})]}):e.jsxs(e.Fragment,{children:[e.jsx("h2",{children:n("pack.addTrip.nature.askTitle")}),e.jsx("p",{children:n("pack.addTrip.nature.askUrban")}),e.jsxs("div",{className:"atl-abort-btns",children:[e.jsx("button",{type:"button",className:"atl-abort-cta",onClick:()=>{Ho.current=!0,Ka(null),U(La(1))},children:n("pack.addTrip.nature.isNature")}),e.jsx("button",{type:"button",className:"atl-abort-ghost",onClick:Zn,children:n("pack.addTrip.nature.notNatureWalk")})]}),e.jsx("button",{type:"button",className:"atl-daymode-link",onClick:()=>Ka(null),children:n("pack.addTrip.nature.editRoute")})]})]})}),document.body),xi&&pt.createPortal(e.jsx("div",{className:"atl-abort-scrim",role:"dialog","aria-modal":"true",onClick:()=>Mt(!1),children:e.jsxs("div",{className:"atl-abort atl-abort--ainubis",onClick:a=>a.stopPropagation(),children:[e.jsx("img",{className:"atl-abort-face",src:an,alt:"","aria-hidden":"true"}),e.jsx("h2",{children:oo("pack.addTrip.geo.openRouteTitle")}),e.jsx("p",{children:oo("pack.addTrip.geo.openRouteBody")}),e.jsxs("div",{className:"atl-abort-btns",children:[e.jsx("button",{type:"button",className:"atl-abort-cta",onClick:()=>{var s;const a=Jo();(s=no.current)==null||s.call(no),io.current=!0,Mt(!1),Go([...a,...a.slice(0,-1).reverse()])},children:n("pack.addTrip.geo.openRouteMirror")}),e.jsx("button",{type:"button",className:"atl-abort-ghost",onClick:()=>Mt(!1),children:oo("pack.addTrip.geo.openRouteFinish")}),e.jsx("button",{type:"button",className:"atl-abort-ghost",onClick:()=>{io.current=!0,Mt(!1),Go(Jo())},children:oo("pack.addTrip.geo.openRouteKeep")})]})]})}),document.body),Ut&&pt.createPortal(e.jsx("div",{className:"atl-editor-scrim",role:"dialog","aria-modal":"true","aria-label":n("pack.addTrip.log.story"),onKeyDown:a=>{a.key==="Escape"&&Ya(!1)},children:e.jsxs("div",{className:"atl-editor",children:[e.jsxs("div",{className:"atl-editor-head",children:[e.jsx("button",{type:"button",className:"atl-editor-x",onClick:()=>Ya(!1),"aria-label":n("pack.mapNotes.add.close"),children:e.jsx(co,{})}),e.jsx("span",{children:n("pack.addTrip.log.story")})]}),e.jsx("textarea",{className:"atl-editor-area",value:Le,autoFocus:!0,onChange:a=>Ee(a.target.value),placeholder:n("pack.addTrip.step.storyPlaceholder")}),e.jsx(Nr,{text:Le}),e.jsx("button",{type:"button",className:"btn-gold atl-editor-done",onClick:()=>Ya(!1),children:n("pack.addTrip.step.editorDone")})]})}),document.body),e.jsx("style",{children:Rl}),e.jsx("style",{children:Cl}),e.jsx("style",{children:Il}),e.jsx("style",{children:Fl}),$?e.jsx("div",{className:"atl-log-head atl-log-head--plain",children:e.jsx("button",{type:"button",className:"atl-log-back",onClick:Ko,"aria-label":n("pack.addTrip.geo.stepBack"),children:e.jsx(co,{})})}):e.jsxs("div",{className:"atl-log-head atl-log-head--intro",children:[e.jsx("button",{type:"button",className:"atl-log-back",onClick:S??g,"aria-label":n("pack.addTrip.geo.stepBack"),children:e.jsx(co,{})}),e.jsx("div",{className:"atl-log-title atl-log-title--big",children:n("pack.addTrip.log.titleActivity")})]}),z&&e.jsxs("div",{className:"atl-restore",children:[e.jsx("p",{className:"atl-restore-txt",children:n("pack.addTrip.log.restoreLead",{name:z.name||n("pack.addTrip.log.restoreUnnamed")})}),e.jsxs("div",{className:"atl-restore-btns",children:[e.jsx("button",{type:"button",className:"atl-toggle-btn",onClick:Zr,children:n("pack.addTrip.log.restoreDiscard")}),e.jsx("button",{type:"button",className:"atl-toggle-btn on",onClick:Ur,children:n("pack.addTrip.log.restoreResume")})]})]}),!$&&!z&&e.jsx("div",{className:`atl-tiles${Aa?" has-open":""}`,children:un.map(a=>{const s=Aa===a.id;return a.id==="visit"||Ii,e.jsxs("div",{className:`atl-tile-wrap${s?" is-open":""}`,children:[e.jsxs("button",{type:"button",className:`atl-tile${s?" is-open":""}`,"aria-expanded":void 0,onClick:()=>Jt(a.id,"walked"),children:[e.jsx("span",{className:"atl-tile-emoji",children:a.emoji}),e.jsxs("span",{className:"atl-tile-txt",children:[e.jsx("span",{className:"atl-tile-label",children:n(`pack.map.activityLabel.${a.id}`)}),e.jsx("span",{className:"atl-tile-note",children:n(`pack.addTrip.log.activityNote.${a.id}`)}),fr[a.id]&&e.jsx("span",{className:"atl-tile-tags",children:fr[a.id].map(c=>e.jsx("span",{className:"atl-tile-tag",children:n(`pack.addTrip.log.tileTag.${c}`,{min:Yo})},c))})]}),zr[a.id]&&e.jsx("span",{className:"atl-tile-sketch","aria-hidden":"true",children:zr[a.id]}),!1]}),s&&e.jsx("div",{className:"atl-mode",children:e.jsx("div",{className:"atl-mode-btns",children:Al.map(c=>e.jsxs("div",{className:"atl-mode-col",children:[e.jsxs("button",{type:"button",className:"atl-mode-btn",onClick:()=>Jt(a.id,c.mode),children:[e.jsx("span",{className:"atl-mode-emoji","aria-hidden":"true",children:c.emoji}),e.jsx("b",{children:n(`pack.addTrip.log.mode.${c.key}`)})]}),e.jsx("span",{className:"atl-mode-cap",children:n(`pack.addTrip.log.mode.${c.key}Sub`)})]},c.mode))})})]},a.id)})}),!!$&&!z&&e.jsxs(e.Fragment,{children:[!sa&&!la&&Fn,To>1&&!sa&&!la&&e.jsx("p",{className:"atl-steps-lock",children:n("pack.addTrip.step.lockedInDraft")}),e.jsxs("div",{className:"atl-log-body",children:[e.jsxs("div",{style:M===1?void 0:{display:"none"},children:[fn&&e.jsxs("div",{className:`atl-photo atl-photo--route${Hr?" is-minimal":""}`,style:{marginBottom:12},children:[e.jsx("svg",{viewBox:"0 0 100 100",preserveAspectRatio:"none","aria-hidden":"true",children:e.jsx("polyline",{points:fn})}),e.jsx("span",{className:"atl-photo-badge",children:n("pack.addTrip.log.routeSoFar")})]}),e.jsxs("div",{className:"atl-field",children:[e.jsxs("label",{children:[n("pack.addTrip.log.where"),Ia&&e.jsxs("span",{className:"atl-donepill",children:["✓ ",n(na?"pack.addTrip.geo.placeDone":"pack.addTrip.geo.routeDone")]})]}),Dn?e.jsxs("div",{className:"atl-journeys",children:[e.jsx("input",{className:"atl-input",value:jt,onChange:a=>Oa(a.target.value),placeholder:n("pack.addTrip.step.searchTrails")}),e.jsxs("div",{className:"atl-journey-list",children:[xa.map(a=>e.jsxs("button",{type:"button",className:`atl-journey-item${Xe===a.id?" on":""}`,onClick:()=>zt(a),children:[e.jsx("span",{className:"atl-journey-name",children:a.name}),e.jsxs("span",{className:"atl-journey-meta",children:[a.km," km · ",a.journey.days,"d · ",a.journey.start," → ",a.journey.end]})]},a.id)),xa.length===0&&e.jsx("p",{className:"atl-field-hint",style:{padding:"8px 4px"},children:n("pack.addTrip.step.noTrails")})]}),e.jsx("button",{type:"button",className:"atl-journey-link",onClick:Nt,children:n("pack.addTrip.step.drawInstead")})]}):e.jsx(dl,{value:b,onChange:Me,activity:$,multiDay:aa,chip:d,mode:O?"plan":"log",allTrails:t,onMetrics:a=>{qe.current=a},mapRef:A,mirrorRef:no,snapAllRef:ro,onGpx:a=>{Ja({app:a.app,originalName:a.originalName}),!O&&a.date&&be(s=>s||a.date)},drawBar:Ti})]})]}),M===7&&e.jsxs("div",{className:"atl-field",children:[e.jsx("h2",{className:"atl-ask",children:n(ra?"pack.addTrip.log.whatPlace":"pack.addTrip.log.whatDid")}),e.jsx("p",{className:"atl-ask-sub",children:n(ra?"pack.addTrip.log.whatPlaceSub":"pack.addTrip.log.whatDidSub")}),e.jsxs("div",{className:"atl-chips atl-chips--picks",role:"radiogroup","aria-label":n(ra?"pack.addTrip.log.whatPlace":"pack.addTrip.log.whatDid"),children:[i.map(a=>e.jsxs("button",{type:"button",role:"radio","aria-checked":d===a.id,className:`atl-chip${a.id===Va.id?" atl-chip--own":""}${d===a.id?" on":""}`,onClick:()=>j(a.id),children:[e.jsx("span",{className:"atl-chip-emoji",style:{fontFamily:ca},children:a.emoji}),e.jsx("span",{className:"atl-chip-label",children:Eo(a.id,a.label)})]},a.id)),d===Va.id&&e.jsxs("div",{className:"atl-own",children:[e.jsx("input",{className:"atl-input",value:Re,maxLength:40,autoFocus:!0,onChange:a=>we(a.target.value),placeholder:n(ra?"pack.addTrip.log.ownPlacePh":"pack.addTrip.log.ownActPh"),"aria-label":n("pack.map.chipLabel.other")}),e.jsx("p",{className:"atl-field-hint",children:n("pack.addTrip.log.ownHint")})]})]})]}),M===3&&e.jsxs(e.Fragment,{children:[H.length>0&&e.jsx("div",{className:"atl-photo",style:{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${ut(y,Wi())}')`,backgroundPosition:`center ${ga}%`}}),O&&e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.plan.who")}),e.jsxs("div",{className:"atl-toggle-row",role:"tablist","aria-label":n("pack.addTrip.plan.who"),children:[e.jsx("button",{type:"button",role:"tab","aria-selected":Fe==="private",className:`atl-toggle-btn${Fe==="private"?" on":""}`,onClick:()=>Xa("private"),children:n("pack.addTrip.plan.whoSolo")}),e.jsx("button",{type:"button",role:"tab","aria-selected":Fe==="open",className:`atl-toggle-btn${Fe==="open"?" on":""}`,onClick:()=>Xa("open"),children:n("pack.addTrip.plan.whoOpen")})]}),e.jsx("p",{className:"atl-field-hint",style:{marginTop:6},children:n(Fe==="private"?"pack.addTrip.plan.visibilityPrivateNote":"pack.addTrip.plan.visibilityOpenNote")})]}),e.jsxs("div",{className:`atl-field${Fa(3,!!Ne.trim())}`,children:[e.jsxs("label",{children:[n("pack.addTrip.log.name"),!G&&e.jsxs("span",{className:"atl-label-ex",children:[n("pack.addTrip.log.nameExPre")," ",e.jsx("b",{children:n("pack.addTrip.log.nameEx")})]})]}),e.jsx("input",{className:"atl-input",value:Ne,readOnly:G,onChange:a=>ka(a.target.value),placeholder:n("pack.addTrip.step.namePlaceholder")}),!G&&e.jsxs("p",{className:"atl-field-hint atl-name-tip",children:[n("pack.addTrip.name.tip"),Bt&&!ha.length&&e.jsxs(e.Fragment,{children:[" ",n("pack.addTrip.name.sugsLoading")]}),ha[0]&&e.jsxs(e.Fragment,{children:[" ",n("pack.addTrip.name.sugPre")," ",e.jsx("button",{type:"button",className:"atl-name-sug",onClick:()=>ka(ha[0]),children:ha[0]})]})]})]}),!O&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:aa&&!ee?"atl-row3":"atl-row2 atl-row2--date",children:[e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.log.date")}),e.jsx("input",{type:"date",className:"atl-input",value:ie,disabled:ee,min:O?I:void 0,max:O?void 0:I,onChange:a=>be(a.target.value)})]}),aa&&!ee&&e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.step.dateEnd")}),e.jsx("input",{type:"date",className:"atl-input",value:Ie,min:ie||void 0,onChange:a=>We(a.target.value)})]}),e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{className:"atl-label-spacer",children:" "}),e.jsx("button",{type:"button",className:`atl-toggle-btn${ee?" on":""}`,onClick:()=>{Ea(a=>{const s=!a;return s&&We(""),s}),be("")},children:n("pack.addTrip.step.dontRemember")})]})]}),aa&&!ee&&Et>0&&e.jsxs("p",{className:"atl-daycount",children:[n("pack.addTrip.step.days"+tn(Et),{n:Et})," · ",n("pack.addTrip.step.nights"+tn(Et-1),{n:Et-1})]})]}),"                ",Gr&&e.jsxs("div",{className:"atl-rowfull",children:[e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.step.state")}),e.jsx("select",{className:"atl-input",value:Ca,onChange:a=>$a(a.target.value),children:Wr.map(a=>e.jsxs("option",{value:a,children:[ts(a)," ",os(a,V)||a.toUpperCase()]},a))})]}),Ca==="sk"&&e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.step.region")}),e.jsxs("select",{className:"atl-input",value:Qt,onChange:a=>Ye(a.target.value),children:[e.jsx("option",{value:"",children:n("pack.addTrip.log.selectPlaceholder")}),e.jsx("option",{value:"W",children:n("pack.addTrip.step.regionW")}),e.jsx("option",{value:"C",children:n("pack.addTrip.step.regionC")}),e.jsx("option",{value:"E",children:n("pack.addTrip.step.regionE")})]})]})]}),ia&&e.jsxs(e.Fragment,{children:[ra&&Pa.length>0&&e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.log.placeDoable")}),e.jsx("div",{className:"atl-chips",children:Pa.map(a=>$o(a,!1))})]}),e.jsxs("div",{className:`atl-field${Fa(3,Ae.size>0)}`,children:[e.jsx("label",{children:n("pack.addTrip.log.tags")}),e.jsx("div",{className:"atl-chips",children:wl.map(So)})]}),e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.log.conditions")}),e.jsx("div",{className:"atl-chips",children:El.map(So)})]})]}),ia&&!O&&An(3),O&&e.jsxs("div",{className:`atl-field atl-field--grow${ya?" atl-field--off":""}`,children:[e.jsx("label",{children:n("pack.addTrip.plan.details")}),e.jsx("textarea",{className:"atl-input atl-textarea",rows:3,value:Le,disabled:ya,onChange:a=>Ee(a.target.value),placeholder:n("pack.addTrip.step.storyPlaceholder")}),ya&&e.jsx("p",{className:"atl-field-hint",style:{marginTop:6},children:n("pack.addTrip.plan.soloNoNeed")})]})]}),M===4&&e.jsxs(e.Fragment,{children:[!O&&aa&&e.jsx("div",{className:"atl-field",children:e.jsxs("div",{className:"atl-odyssey",children:[e.jsx("span",{className:"atl-odyssey-mark","aria-hidden":"true",children:"✓"}),e.jsxs("span",{className:"atl-odyssey-txt",children:[e.jsx("b",{children:n("pack.map.diff.Odyssey")}),e.jsx("i",{children:n("pack.addTrip.step.odysseyNote")})]})]})}),!O&&Qe&&e.jsxs("div",{className:`atl-field${Fa(4,!!pe)}`,children:[e.jsx("label",{children:n("pack.addTrip.step.difficulty")}),e.jsxs("div",{className:"atl-diffrow",children:[e.jsx("style",{children:ps}),nn.filter(a=>a!=="Odyssey").map(a=>e.jsxs("button",{type:"button",className:`atl-diffbtn${pe===a?" on":""}`,"aria-pressed":pe===a,onClick:()=>mt(pe===a?"":a),children:[e.jsx(cs,{diff:a}),e.jsx("span",{children:n(`pack.map.diff.${a}`)})]},a))]})]}),!O&&An(4),!O&&Qe&&e.jsxs("div",{className:`atl-field${Fa(4,ce.size>0)}`,children:[e.jsx("label",{children:n("pack.addTrip.step.terrain")}),e.jsx("div",{className:"atl-chips",children:Tl.map(a=>e.jsxs("button",{type:"button",className:`atl-chip${ce.has(a.id)?" on":""}`,onClick:()=>wo(ce,se,a.id),children:[e.jsx("span",{className:"atl-chip-emoji",style:{fontFamily:ca},children:a.emoji}),e.jsx("span",{className:"atl-chip-label",children:n(`pack.map.surfaceLabel.${a.id}`)})]},a.id))})]}),e.jsxs("div",{className:`atl-field${Fa(4,Ae.size>0)}`,children:[e.jsx("label",{children:n("pack.addTrip.log.tags")}),e.jsx("div",{className:"atl-chips",children:go.map(So)})]}),(ea.length>0||tt.length>0)&&e.jsxs("div",{className:"atl-field",children:[ea.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("label",{children:n("pack.addTrip.log.chipsOwn")}),e.jsx("div",{className:"atl-chips",children:ea.map(a=>$o(a,!1))})]}),tt.length>0&&e.jsxs("div",{className:ea.length>0?"atl-more":void 0,children:[e.jsxs("button",{type:"button",className:"atl-morebtn","aria-expanded":Wa,onClick:()=>vo(a=>!a),children:[e.jsx("span",{children:n("pack.addTrip.log.chipsMore")}),e.jsx("span",{className:"atl-morebtn-arw","aria-hidden":"true",children:Wa?"⌃":"⌄"})]}),Wa&&e.jsxs("div",{className:"atl-more-body",children:[e.jsx("div",{className:"atl-chips",children:tt.map(a=>$o(a,!0))}),qr]})]})]}),e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.step.markedOnRoute")}),e.jsx(Ar,{notes:m,t:n,emptyKey:"pack.addTrip.step.noNotesSummary"}),!qt&&e.jsx("button",{type:"button",className:"atl-journey-link",onClick:()=>{wa(0),U(2)},children:n("pack.addTrip.step.backToNotes")})]})]}),M===5&&!St&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.log.story")}),e.jsx("textarea",{className:"atl-input atl-textarea",rows:4,value:Le,onChange:a=>Ee(a.target.value),placeholder:n("pack.addTrip.step.storyPlaceholder")}),e.jsxs("div",{className:"atl-storyfoot",children:[e.jsx(Nr,{text:Le}),e.jsx("button",{type:"button",className:"atl-expand",onClick:()=>Ya(!0),children:n("pack.addTrip.step.expandEditor")})]})]}),e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.step.whoWasWithYou")}),e.jsx(Sl,{myDogs:p,selected:Z,onChange:ti}),nt&&Z.some(a=>a.key===nt.key)&&e.jsx("div",{style:{marginTop:8},children:e.jsxs(Ci,{role:"alert",children:[e.jsx("div",{children:n("pack.trip.memorial.ask",{name:nt.name})}),e.jsxs("div",{style:{display:"flex",gap:8,flexWrap:"wrap"},children:[e.jsx("button",{type:"button",className:"ain-cta",onClick:()=>Mo(null),children:n("pack.trip.memorial.yes")}),e.jsx("button",{type:"button",className:"ain-cta",style:{background:"none",color:tr.inkDim,border:`1px solid ${tr.edgeStrong}`,boxShadow:"none"},onClick:()=>{Io.current.delete(nt.key),Be(a=>a.filter(s=>s.key!==nt.key)),Mo(null)},children:n("pack.trip.memorial.back")})]})]})}),En&&!nt&&e.jsxs("div",{className:"atl-draftwarn",role:"alert",style:{marginTop:8},children:[e.jsx("b",{children:n("pack.addTrip.step.needDogTitle")}),e.jsx("p",{children:n("pack.addTrip.step.needDog")})]})]}),!O&&e.jsxs("div",{className:"atl-field",children:[e.jsx("label",{children:n("pack.addTrip.step.rate")}),e.jsxs("div",{className:"atl-rate",children:[e.jsx(qi,{value:ve,onChange:vt,onDark:!1,size:34}),e.jsx("span",{className:`atl-rate-val${ve>0?" on":""}`,children:ve>0?`${ve}/5`:"—"})]})]})]}),M===5&&St&&e.jsx(e.Fragment,{children:!O&&e.jsxs("div",{className:`atl-field atl-photo-drop${Tn?" drag":""}`,...ei,children:[e.jsxs("label",{children:[n("pack.addTrip.step.photos")," ",e.jsxs("span",{className:"atl-field-hint",children:["· ",H.length,"/",da]})]}),e.jsxs("button",{type:"button",className:"atl-file-btn",onClick:()=>{var a;return(a=et.current)==null?void 0:a.click()},disabled:H.length>=da,children:["📷 ",n("pack.addTrip.step.choosePhotos")]}),e.jsx("input",{ref:et,type:"file",accept:"image/*",multiple:!0,onChange:Qr,disabled:H.length>=da,className:"atl-file-input-hidden"}),e.jsx("p",{className:"atl-field-hint",style:{marginTop:4},children:n("pack.addTrip.step.photoHint",{n:da})}),qa&&e.jsx("p",{className:"atl-field-hint",style:{marginTop:4},children:qa}),H.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(Xi,{photos:H,onMove:Do,onCover:a=>Do(a,0),onRemove:ai,t:n}),H.length>1&&e.jsx("p",{className:"atl-field-hint",style:{marginTop:6},children:n("pack.addTrip.step.coverPick")}),e.jsxs("div",{className:"atl-cover-crop",children:[e.jsx("label",{children:n("pack.addTrip.step.coverCrop")}),e.jsx("div",{className:"atl-cover-preview",style:{backgroundImage:`linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.45)), url('${ut(y,800)}')`,backgroundPosition:`center ${ga}%`}}),e.jsx("input",{type:"range",min:0,max:100,value:ga,onChange:a=>Ht(Number(a.target.value)),className:"atl-cover-slider"})]})]})]})}),M===6&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`atl-field${Fa(6,!!ie)}`,children:[e.jsx("label",{children:n("pack.addTrip.plan.when")}),e.jsx("div",{className:"atl-toggle-row",role:"tablist","aria-label":n("pack.addTrip.plan.when"),children:["exact","week","month"].map(a=>e.jsx("button",{type:"button",role:"tab","aria-selected":L===a,className:`atl-toggle-btn${L===a?" on":""}`,onClick:()=>J(a),children:n(`pack.addTrip.plan.when.${a}`)},a))}),L==="exact"?e.jsx("input",{type:"date",className:"atl-input atl-input--pick",style:{marginTop:8},value:Y,min:I,onClick:a=>_r(a.currentTarget),onChange:a=>$e(a.target.value)}):e.jsxs(e.Fragment,{children:[e.jsxs("select",{className:"atl-input",style:{marginTop:8},value:Ze,onChange:a=>At(a.target.value),children:[e.jsx("option",{value:"",children:n("pack.addTrip.log.selectPlaceholder")}),Vr.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))]}),L==="week"&&e.jsx("div",{className:"atl-toggle-row",style:{marginTop:8},role:"tablist","aria-label":n("pack.addTrip.plan.whenWeek"),children:[1,2,3,4].map(a=>e.jsx("button",{type:"button",role:"tab","aria-selected":Wt===a,className:`atl-toggle-btn${Wt===a?" on":""}`,onClick:()=>hn(a),children:n("pack.addTrip.plan.whenWeekN",{n:String(a)})},a))})]}),e.jsx("p",{className:"atl-field-hint",style:{marginTop:6},children:n("pack.addTrip.plan.whenHint")})]}),e.jsxs("div",{className:`atl-field${ya?" atl-field--off":""}`,children:[e.jsx("label",{children:n("pack.addTrip.plan.travel")}),e.jsx("div",{className:"atl-travel",children:xs.map(a=>e.jsxs("button",{type:"button","aria-pressed":Tt===a.id,disabled:ya,className:`atl-travel-btn${Tt===a.id?" on":""}`,onClick:()=>bn(s=>s===a.id?"":a.id),children:[e.jsx("b",{style:{fontFamily:ca},children:a.emoji}),e.jsx("span",{children:n(`pack.addTrip.plan.travel.${a.id}`)})]},a.id))})]}),e.jsxs("div",{className:`atl-field${ya?" atl-field--off":""}`,children:[e.jsx("label",{children:n("pack.addTrip.plan.travelFrom")}),e.jsx("input",{className:"atl-input",value:Yt,disabled:ya,onChange:a=>gn(a.target.value),placeholder:n("pack.addTrip.plan.travelFromPlaceholder")}),ya&&e.jsx("p",{className:"atl-field-hint",style:{marginTop:6},children:n("pack.addTrip.plan.soloNoNeed")})]}),Fe==="open"&&e.jsxs("div",{className:"atl-field",children:[e.jsxs("button",{type:"button",className:`atl-check${Ma?" on":""}`,"aria-pressed":Ma,onClick:()=>vn(a=>!a),children:[e.jsx("b",{children:Ma?"✓":""}),e.jsx("span",{children:n("pack.addTrip.plan.pickup")})]}),Ma&&e.jsxs("div",{className:"atl-seats",children:[e.jsx("span",{children:n("pack.addTrip.plan.pickupSeats")}),e.jsx("button",{type:"button",onClick:()=>Ao(a=>Math.max(1,a-1)),"aria-label":"−",children:"−"}),e.jsx("b",{children:No}),e.jsx("button",{type:"button",onClick:()=>Ao(a=>Math.min(8,a+1)),"aria-label":"+",children:"+"})]}),e.jsx("p",{className:"atl-field-hint",style:{marginTop:6},children:n("pack.addTrip.plan.pickupHint")})]})]}),Fo&&e.jsxs(e.Fragment,{children:[Qa&&Co&&e.jsxs("div",{className:"atl-dupwarn",children:[e.jsx("p",{children:n("pack.addTrip.step.dupWarn",{name:Co.name})}),e.jsxs("div",{className:"atl-dupwarn-btns",children:[e.jsx("button",{type:"button",className:"atl-toggle-btn",onClick:()=>fa(!1),children:n("pack.addTrip.step.cancel")}),e.jsx("button",{type:"button",className:"atl-toggle-btn on",onClick:li,children:n("pack.addTrip.step.logAnyway")})]})]}),!O&&ot.toApprove.length>0&&e.jsxs("div",{className:"atl-draftwarn",role:"status",children:[e.jsx("b",{children:n("pack.reveal.draftTitle")}),e.jsx("p",{children:n("pack.addTrip.step.willBeDraft",{fields:Po(ot.toApprove)})})]}),!O&&e.jsx(jl,{result:Ot,photoCount:H.length,onGo:oi,t:n})]})]}),e.jsxs("div",{className:"atl-log-foot",children:[Fo&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"atl-nav",children:[e.jsx("button",{type:"button",className:"atl-toggle-btn",onClick:Ko,children:n("pack.addTrip.step.back")}),e.jsx("button",{type:"button",className:"btn-gold",disabled:!eo||Ro,onClick:si,children:n(Ro?"pack.mapNotes.add.saving":G?"pack.trip.edit.save":qt?"pack.addTrip.log.submitFinish":O?"pack.addTrip.log.submitPlan":"pack.addTrip.log.submit")})]}),!eo&&ot.toSubmit.length>0&&e.jsx("p",{className:"atl-log-hint",children:n("pack.addTrip.log.missing",{fields:Po(ot.toSubmit)})}),!eo&&Nn&&e.jsx("p",{className:"atl-log-hint",children:n("pack.addTrip.step.journeyNeedsEnd")}),ft&&e.jsx("p",{className:"atl-log-error",children:ft})]}),!Fo&&!sa&&!la&&e.jsxs("div",{className:"atl-nav",children:[M!==7&&e.jsx("button",{type:"button",className:"atl-toggle-btn",onClick:Ko,children:n("pack.addTrip.step.back")}),e.jsx("button",{type:"button",className:"btn-gold",onClick:pi,disabled:Dt,children:n("pack.addTrip.step.next")})]}),M===1&&!sa&&Dt&&e.jsx("p",{className:"atl-log-hint",children:n(na?"pack.addTrip.step.needPlace":"pack.addTrip.step.needRoute")}),M===7&&Dt&&e.jsx("p",{className:"atl-log-hint",children:n(In?"pack.addTrip.step.needOwn":"pack.addTrip.step.needChip")})]})]})]})]})}function Ar({notes:t,t:l,emptyKey:p,onRemove:u}){const[g,S]=o.useState(null);return o.useEffect(()=>{S(null)},[t]),!t||t.length===0?e.jsx("p",{className:"atl-field-hint",children:l(p)}):e.jsx("div",{className:"atl-chips",children:t.map((v,A)=>{const f=!!u&&!!v.id,k=v.id||`${v.kind}-${A}`,D=g===k;return e.jsxs("span",{className:`atl-chip on${f?" atl-chip--del":""}${D?" armed":""}`,role:f?"button":void 0,tabIndex:f?0:void 0,onClick:f?()=>{D?u==null||u(v.id):S(k)}:void 0,onKeyDown:f?K=>{K.key!=="Enter"&&K.key!==" "||(K.preventDefault(),D?u==null||u(v.id):S(k))}:void 0,"aria-label":f?`${l(`pack.mapNotes.kind.${v.kind}`)} — ${l(D?"pack.addTrip.step.noteRemove":"pack.addTrip.step.noteArm")}`:void 0,children:[e.jsx("span",{className:"atl-chip-emoji",style:{fontFamily:ca},children:Os[v.kind]}),e.jsx("span",{className:"atl-chip-label",children:l(`pack.mapNotes.kind.${v.kind}`)}),D&&e.jsx("i",{className:"atl-chip-x","aria-hidden":"true",children:"×"})]},k)})})}const Il=`
/* ── HORNÝ PANEL S KROKMI JE ODDELENÝ ČIAROU (Matej 2026-08-26) ────────────────────────
   „celkovo treba zvizuálniť ten vrchný panel s krokmi, oddeliť čiarou alebo nejak inak."
   V krokoch 3–5 stál krokovník bez akéhokoľvek predelu tesne nad prvým poľom formulára,
   takže „kde som" a „čo vypĺňam" splývali do jedného zoznamu.
   ⚠️ ČIARA JE T.rule — zlatá, vyblednutá do strán, 2 px (CLAUDE.md). NIE šedý 1px
   hairline a NIE T.hairline ako rám: ten je iba na deliace čiary vnútri karty a ako
   predel medzi dvoma vrstvami obrazovky pôsobí ako nedokončený návrh. */
.atl-steps{display:flex;gap:6px;padding:4px 24px 12px;flex-shrink:0;position:relative;}
/* ⚠️ PODKLAD KROKOVNÍKA ZANIKOL (Matej 2026-08-26, druhé kolo): „nepáči sa mi ani okolie,
   kde je 5 krokov — hore a dole taký divný pás. Daj len dole takú čiaru do stratena."
   Ráno tu pribudlo jemné stmavnutie dosky s odôvodnením „Matej pýtal zvizuálniť, nie
   nakresliť linku". Bola to nadpráca: pás cez celú šírku sa na pieskovci prečítal ako
   PRÚŽOK INÉHO MATERIÁLU nalepený na doske, nie ako predel — a keďže hore aj dole končil
   rovnou hranou, mal dva okraje namiesto jedného.
   Ostáva jediný predel: T.rule — zlatá linka vyblednutá do strán (presne „do stratena"),
   teda bez hrán, o ktoré by sa dalo zakopnúť. */
.atl-steps:not(.atl-steps--onmap){padding:8px 24px 12px;}
.atl-steps:not(.atl-steps--onmap)::after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:${r.rule};}
/* ŠESŤ KROKOV NA ÚZKOM TELEFÓNE (15. 10. 2026, krok ZNÁMKA). SK názvy pri 360 px pretiekli
   o 24 px a pri 390 px sa „O TRASE" zalomilo na dva riadky. Okraj ide na PAGE_AIR mobilu (16)
   a medzera na 4 — názov sa nezalamuje, takže výška krokovníka ostáva na každom kroku rovnaká. */
@media (max-width:479px){
  .atl-steps:not(.atl-steps--onmap){padding-left:16px;padding-right:16px;gap:4px;}
  .atl-steps:not(.atl-steps--onmap) .atl-step span{white-space:nowrap;}
  /* Bočný vzduch si nechá len AKTÍVNY krok — ten jediný má okolo seba rámik. */
  .atl-steps:not(.atl-steps--onmap) .atl-step:not(.on){padding-left:0;padding-right:0;}
}
/* Veta o zámku stojí POD krokovníkom, teda mimo neho — v ňom by si delila riadok
   s piatimi bodkami a rozhodila by ich rovnaké diely. */
.atl-steps-lock{margin:-2px 20px 8px;font-family:${x};font-size:10px;line-height:1.45;color:${r.onDarkDim};}
/* BODKY NAD MAPOU (kroky 1–2). Musia zniesť pestrý podklad, tak dostanú vlastný tmavý
   podklad a rám — nad turistickou mapou by holé číslice zanikli rovnako ako kedysi
   fialová pilulka. Popisky sa skryjú: päť názvov krokov sa vedľa krížika na 360 px
   nezmestí a číslo v krúžku aj tak nesie celú informáciu. */
.atl-steps--onmap{width:max-content;gap:5px;border-radius:999px;background:rgba(18,13,7,0.94);backdrop-filter:blur(10px);border:1px solid ${r.onDarkBorder};box-shadow:0 6px 20px rgba(0,0,0,0.55);padding:4px 8px;}
/* ⚠️ flex:0 0 auto, NIE zdedené 1 1 0. V paneli sa päť krokov delí o celú šírku, tu by
   sa tým rozťahovali cez pol obrazovky a medzi číslami by ostali prázdne polia — pilulka
   má obopnúť bodky, nie mapu pod nimi. */
.atl-steps--onmap .atl-step{flex:0 0 auto;padding:0;gap:0;border:0;background:none;}
.atl-steps--onmap .atl-step span{display:none;}
/* Prstenec ide s výplňou čísla — zlatý dosvit okolo lapisového kruhu je druhá farba na
   tom istom prvku. */
.atl-steps--onmap .atl-step.on b{box-shadow:0 0 0 3px ${C.halo};}
/* ÚNIK — otázka pred zahodením rozrobeného výletu. Tmavý povrch, lebo stojí nad mapou. */
.atl-abort-scrim{position:fixed;inset:0;z-index:1400;background:rgba(0,0,0,0.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;}
.atl-abort{width:100%;max-width:380px;padding:24px;border-radius:14px;background:rgba(18,13,7,0.97);border:1px solid ${r.onDarkBorder};box-shadow:0 18px 50px rgba(0,0,0,0.6);}
.atl-abort-face{display:block;width:46px;height:46px;object-fit:contain;margin:0 auto 10px;border-radius:12px;background:rgba(201,154,63,0.14);box-shadow:0 0 0 1.5px rgba(201,154,63,0.55);}
.atl-abort h2{margin:0;font-family:${me};font-weight:700;text-transform:uppercase;font-size:16px;letter-spacing:0.02em;color:${r.onDark};}
.atl-abort p{margin:10px 0 0;font-family:${x};font-size:12px;line-height:1.55;color:${r.onDarkDim};}
.atl-abort-btns{display:flex;gap:8px;margin-top:16px;}
.atl-abort-btns > *{flex:1 1 0;}
/* Zahodenie je červené a je to jediná červená v celom toku — je to jediná nevratná akcia. */
.atl-abort-quit{padding:12px 12px;border-radius:8px;background:rgba(160,42,42,0.18);border:1px solid rgba(214,77,77,0.65);color:#F0A0A0;font-family:${x};font-size:12px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;}
.atl-abort-quit:hover{background:rgba(160,42,42,0.34);color:#fff;}
/* ── AINUBISOV DIALÓG (Matej 25. 8. 2026) ──────────────────────────────────────────────
   „daj všetky interakcie v jeho dizajne (tmavomodrá) tento nadpis centruj, CTA tlačítka
    daj tiež v brande a ikonka ainubisa musí byť v krúžku nie štvorci!"
   Farby sú tie isté, aké nesie bublina nad mapou ('AINUBIS_GUIDE_CSS') a tie sú zdvihnuté
   z jeho živého widgetu — jeden hlas má mať jeden povrch, nech sa objaví kdekoľvek.
   Centrovanie je celé, nie len nadpis: tvár už stojí v strede, takže nadpis vľavo pod ňou
   vyzeral ako odlomený. */
.atl-abort--ainubis{background:radial-gradient(120% 90% at 50% -20%,rgba(59,158,255,0.18) 0%,rgba(59,158,255,0) 62%),linear-gradient(180deg,#071019 0%,#03070C 100%);border:1px solid rgba(91,224,240,0.35);box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 40px rgba(59,158,255,0.16);text-align:center;}
.atl-abort--ainubis h2{color:#E6FAFF;text-shadow:0 0 18px rgba(91,224,240,0.35);}
.atl-abort--ainubis p{color:rgba(207,243,250,0.78);}
/* Kruh, nie štvorec — tá istá silueta, akú má vo widgete aj v bubline nad mapou. */
.atl-abort--ainubis .atl-abort-face{width:64px;height:64px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#12233a 0%,#01050A 74%);box-shadow:0 0 0 1.5px rgba(91,224,240,0.40),0 0 26px rgba(59,158,255,0.34);margin-bottom:12px;}
/* CTA = brandový zlatý gradient ('.btn-gold' lock: #F5C73D→#E69E1A, papyrusový rám, r8).
   NIE pilulka a NIE vlastný gradient. */
.atl-abort-cta{width:100%;padding:12px 12px;border-radius:8px;background:${ua.grad};border:1px solid ${ua.edge};color:#1c160c;font-family:${me};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;box-shadow:0 6px 18px rgba(230,158,26,0.28);}
.atl-abort-cta:hover{filter:brightness(1.06);}
/* Druhá voľba hovorí AInubisovým hlasom (cyan obrys), aby bolo vidieť, že ju ponúka ON —
   nie je to odmietnutie dialógu, je to rovnocenná odpoveď. */
.atl-abort-ghost{width:100%;padding:12px 12px;border-radius:8px;background:rgba(59,158,255,0.08);border:1px solid rgba(91,224,240,0.35);color:rgba(207,243,250,0.88);font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.02em;cursor:pointer;}
.atl-abort-ghost:hover{background:rgba(59,158,255,0.16);color:#E6FAFF;}
/* ── JEDNO TLAČIDLO = JEDEN RIADOK (Matej 2026-08-26) ─────────────────────────────────
   „tento popup zväčši a možnosti daj pod seba nie vedľa (sú dlhé textovo a lámu sa —
    jedno tlačítko jeden riadok!)"

   ⚠️ PLATÍ NA KAŽDEJ ŠÍRKE, nie len pod 420 px. Pôvodné pravidlo vychádzalo z toho, že sa
   dve tlačidlá vedľa seba zmestia, kým je okno široké — lenže odpovede AInubisa sú VETY
   („Doplniť tú istú cestu späť", „Vrátil som sa inak"), takže sa lámali aj na PC, každá
   na iný počet riadkov, a rad z toho vyzeral ako rozbitý.
   Škatuľa je zároveň širšia: v 380 px sa tri vety lámali aj pod sebou. */
.atl-abort--ainubis{max-width:520px;padding:24px 24px;}
.atl-abort--ainubis .atl-abort-btns{flex-direction:column;gap:9px;}
.atl-step{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border-radius:8px;background:transparent;border:1px solid transparent;color:${r.onDarkDim};cursor:default;}
/* ── ČÍSLA KROKOV: VÄČŠIE, PLNOU FARBOU, BIELE (Matej 2026-08-26) ──────────────────────
   „tieto chipy s číslami si predstavujem o čosi väčšie a skôr plnou farbou a čísla bielou."
   Do teraz mali 20 px a priesvitnú výplň pri 6 % — na papyruse PC z toho ostal svetlý
   krúžok bez obsahu, teda presne to, čo sa má na prvý pohľad prečítať, sa prečítať nedalo.
   Biely inkoust drží vo VŠETKÝCH stavoch (aktívny, hotový, splnený), aby číslo nemenilo
   čitateľnosť podľa toho, kde človek stojí. */
.atl-step b{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(122,90,42,0.55);border:1px solid ${r.onDarkBorder};color:#FFF;font-family:${x};font-weight:600;font-size:12px;line-height:1;}
.atl-step span{font-family:${x};font-weight:500;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;text-align:center;line-height:1.2;}
.atl-step.done{cursor:pointer;color:${r.onDark};}
.atl-step.done b{background:#8A5F1E;border-color:#8A5F1E;color:#FFF;}
/* ── AKTÍVNY KROK JE LAPIS, NIE ZLATÝ (Matej 2026-08-28) ───────────────────────────────
   „hore kde sú kroky 1-5 svieti krok na oranžovo - zmen na brand - lapis"
   🚩 MENÍ TO PRAVIDLO Z navGoldSkin.ts, kde je „aktívny krok" vymenovaný pod ZLATOM
   („kde som"). Dôvod, prečo padlo: zlatý gradient #D2A02A→#A96F17 je na papyrusovej doske
   jediná sýta teplá plocha na obrazovke a číta sa ako ORANŽOVÁ výstraha, nie ako poloha —
   a od 28. 8. je celý tok papyrusový, takže zlato na zlate polohu aj tak nepovie.
   Rám pilulky ostáva zlatý: konštrukciu (kde stojí prvok) drží ďalej zlato, mení sa výplň
   toho, čo je práve aktívne.
   ⚠️ Biely inkoust drží vo VŠETKÝCH stavoch — to sa nemení, lapis ho nesie rovnako. */
.atl-step.on{${ke(C.edge,ne.lapis,.14)}}
.atl-step.on b{background:${C.grad};border-color:${C.deep};color:#FFF;}
/* ⚠️ ZELENÁ PREBÍJA ZLATÚ, ALE NIE NA AKTUÁLNOM KROKU. Zlatá hovorí „tu si", zelená „toto je
   hotové" — a keď platí oboje, dôležitejšie je, kde človek stojí. Preto '.ok' nie '.on'.
   Je to tá istá zelená, akou svieti splnená značka na trase (GROUP_TINT.comment) a vybratý
   pes v kroku 5 — jeden význam, jedna farba. */
/* ⚠️ ZELENÁ PLATÍ AJ NA KROK, NA KTOROM PRÁVE STOJÍŠ (Matej 25. 8. 2026: „ak v 4 neoznačím
   všetko a potom sa vrátim a označím, bod 4 zostane oranžový a nie zelený"). Pôvodné
   :not(.on) vychádzalo z predpokladu, že sa krok dokončí až tým, že z neho odídeš — lenže
   človek ho dopĺňa a pozerá sa, či to zabralo. Odpoveď „splnené" nesmie čakať na odchod.
   „Tu si" prežije: v paneli to hovorí zlatý rám dlaždice, na mape zlatý prstenec okolo
   čísla (.atl-steps--onmap .atl-step.on b) — obe iné vlastnosti než výplň, takže sa nebijú. */
.atl-step.ok b{background:${de};border-color:#1F5C33;color:#FFF;}
/* Nevyplnené pole po NÁVRATE do kroku. Rám aj popisok, nie len rám — samotný červený obrys
   sa na tmavom povrchu prehliadne. */
.atl-miss > label{color:#E08A7A;}
.atl-miss .atl-input,.atl-miss .atl-diffrow,.atl-miss .atl-chips,.atl-miss .atl-photos{border-radius:8px;box-shadow:0 0 0 1px ${r.alertRed};}
.atl-donepill{margin-left:8px;padding:4px 8px;border-radius:999px;background:rgba(${r.tripPurpleRGB},0.22);border:1px solid rgba(179,107,255,0.55);color:#E9D8FF;font-size:10px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;}
/* ── STOPA P · N · T ───────────────────────────────────────────────────────────
   Tri diely na celú šírku (rad prvkov = celá šírka kontajnera, rovnaké diely).
   Prejdené sa dajú kliknúť späť — človek, ktorý parkovisko preskočil a spomenul si,
   nemá inú cestu, ako celý krok zopakovať odznova. */
.atl-ntrack{display:flex;gap:6px;}
.atl-ntrack-i{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:5px;padding:8px 4px;border-radius:999px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};font-family:${x};cursor:pointer;}
.atl-ntrack-i b{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:17px;height:17px;border-radius:50%;background:rgba(245,240,228,0.07);font-size:10px;font-weight:600;line-height:1;}
/* ⚠️ TESNEJŠIE PREKLADANIE PÍSMEN NEŽ INDE (Matej 2026-08-26, druhé kolo). Odkedy je
   neoznačená možnosť ČERVENÁ, nesie chip s bodmi KAŽDÁ z troch (predtým len tie, ktoré človek
   nechal za sebou) — a na kompaktnom PC (stĺpec 360 px) sa z „PARKOVISKO" stalo „PARK…".
   Rieši sa to preložením a výplňou pilulky s bodmi, nie skrytím tej pilulky: „0 bodov" pri
   neoznačenej si Matej vypýtal 24. 8. výslovne. */
/* ⚠️ FOCUS RING IDE DOVNÚTRA (Matej 2026-08-28: „horný okraj chipu sa stráca a zreže sa
   outline"). Prehliadačov outline sa kreslí MIMO hranice tlačidla, takže ho ľavý stĺpec
   (.trp-dock--pc s overflow-y:auto) po kliknutí zhora oreže rovnou čiarou — presne tá istá
   pasca, na akej sa 26. 8. rezala žiara AInubisovej bubliny. Záporný offset ho posadí na
   vnútornú hranu, kde ho nemá čo orezať; viditeľnosť pre klávesnicu ostáva. */
.atl-ntrack-i:focus-visible{outline:2px solid ${C.edge};outline-offset:-2px;}
.atl-ntrack-i span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;}
/* ── VÝBER = MODRÁ, ALE PRIESVITNÁ (Matej 2026-08-26, tretie kolo) ─────────────────────
   „výber PWT som chcel modré/zelené/červené, ale priesvitné — nie modrá plná, to sa bije
    s CTA."
   Farba ostáva: lapis je v redizajne /map „moja voľba a moja akcia" (navGoldSkin.ts), nie
   mapová modrá — tá drží značky. Mení sa VÁHA. Plná lapisová výplň je rezervovaná pre
   jediný prvok na doske — hlavné CTA; keď ju nesie aj chip, obrazovka má dve hlavné veci.
   ⚠️ Recept je pickTintCSS, nie tri rgba čísla tu: rovnaký tint nesú aj chipy, náročnosť
   a tagy o dva kroky ďalej a rozišli by sa pri prvej úprave. */
.atl-ntrack-i.on{${ke(C.edge,C.ink,.3)}}
.atl-ntrack-i.on b{background:rgba(239,215,154,0.92);color:${C.deep};}
/* ── VÝSLEDOK PREBÍJA POSTUP ──────────────────────────────────────────────────────────
   Zlatá hovorí „tu si", zelená a červená hovoria „takto to dopadlo" — a to je dôležitejšie,
   preto stoja NIŽŠIE v poradí a prebíjajú .on. Zelená je tá istá, akú na mape nesie TIP
   (GROUP_TINT.comment), červená tá istá, akú nesie UPOZORNENIE — nezavádzajú sa nové farby.
   Body v chipe sú POINTS.note, nie napísané číslo. */
/* SPLNENÉ = ZELENÝ TINT. ⚠️ PREBÍJA aktívny stav ZÁMERNE: „hotové" je dôležitejšia
   správa než „tu si".
   ⚠️ NIE JE TO NÁVRAT PRED 26. 8. Vtedy tu bola zelená pri 14 % so SVETLÝM inkoustom a na
   papyruse z toho ostal svetlý text na takmer bielom — to bol dôvod plnej výplne. Tint
   sám nestačí: čitateľnosť nesie tmavý inkoust a plný farebný rám (viď pickTintCSS),
   nie krytie výplne. Tmavý mobil dostáva svetlý inkoust v LOG_CSS o riadok nižšie. */
.atl-ntrack-i.ok{${ke(pn.comment,"#D8F2E0",.28)}}
.atl-ntrack-i.ok b{background:rgba(216,242,224,0.22);border:1px solid ${pn.comment};color:#D8F2E0;}
/* NEOZNAČENÉ = ČERVENÝ TINT, rovnaká váha ako zelený a modrý vedľa neho. */
.atl-ntrack-i.miss{${ke(sr,"#FFD9D2",.26)}}
.atl-ntrack-i.miss b{background:rgba(255,217,210,0.22);border:1px solid ${sr};color:#FFD9D2;}
/* Chip s bodmi. Malý a bez rámu — je to poznámka k pilulke, nie druhá pilulka v nej.
   tabular-nums, aby sa „+3" a „0" nehojdali v rade vedľa seba. */
.atl-ntrack-pts{flex:0 0 auto;font-style:normal;font-size:10px;font-weight:600;line-height:1;letter-spacing:.02em;font-variant-numeric:tabular-nums;padding:4px 4px;border-radius:999px;}
.atl-ntrack-i.ok .atl-ntrack-pts{background:rgba(61,122,78,0.30);color:#D8F2E0;}
.atl-ntrack-i.miss .atl-ntrack-pts{background:rgba(206,75,60,0.30);color:#FFD9D2;}
.atl-noteask{padding:12px 16px;border-radius:12px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};}
.atl-noteask p{margin:0 0 10px;font-family:${x};font-size:14px;line-height:1.45;color:${r.onDark};}
.atl-noteask-btns{display:flex;gap:8px;}
.atl-noteask-btns .atl-toggle-btn{flex:1 1 0;}
/* KROK 2 V LIŠTE NAD MAPOU — lišta už rám aj podklad má, druhý dovnútra by vyrobil
   škatuľu v škatuli. Ostáva len rozostup medzi otázkou, zoznamom značiek a pokračovaním. */
.atl-noteask--bar{padding:0;border:0;background:none;display:flex;flex-direction:column;gap:10px;}
.atl-noteask--bar p{margin:0;}
/* ── HLAVIČKA POĽA: POPISOK VĽAVO, ODKAZ VPRAVO ────────────────────────────────────────
   Odkaz „otvoriť na celú obrazovku" patrí k poľu, nie nad formulár — preto stojí v jeho
   riadku a nie vo vlastnom, ktorý by krok natiahol. */
.atl-fieldhead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.atl-label-ex{margin-left:8px;text-transform:none;letter-spacing:0;font-size:12px;font-weight:400;}
.atl-label-ex b{font-weight:600;}
.atl-storyfoot{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:8px;}
.atl-storymeter{margin:0;flex:1;min-width:0;font-family:${x};font-size:12px;line-height:1.35;}
.atl-storymeter b{font-weight:600;font-variant-numeric:tabular-nums;}
.atl-editor .atl-storymeter{margin-top:8px;flex:none;}
.atl-fieldhead > label{margin:0;}
.atl-expand{flex:0 0 auto;background:none;border:0;padding:0;color:${ae};font-family:${x};font-size:12px;font-weight:500;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
.atl-expand:hover{color:#F5C73D;}
/* ── EDITOR PRÍBEHU NA CELÚ OBRAZOVKU (§4.5) ───────────────────────────────────────────
   Papyrusová plocha, do ktorej sa píše — teda úroveň 5 matrice (plochý papyrus), nie
   sklenený panel. Výška je daná oknom, nie obsahom: text má rásť do plochy, ktorá už stojí,
   inak by sa pri písaní hýbalo tlačidlo pod ním. */
.atl-editor-scrim{position:fixed;inset:0;z-index:1500;background:rgba(24,14,4,0.72);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;}
.atl-editor{display:flex;flex-direction:column;gap:12px;width:min(860px,100%);height:min(80vh,760px);padding:24px;border-radius:16px;background:linear-gradient(135deg,${r.card} 0%,#F2E2BD 100%);border:1.5px solid ${r.cardEdge};box-shadow:0 24px 64px rgba(0,0,0,0.55),0 0 0 3px rgba(201,154,63,0.15);}
.atl-editor-head{display:flex;align-items:center;justify-content:flex-start;gap:10px;font-family:${me};font-weight:700;font-size:14px;letter-spacing:0.02em;text-transform:uppercase;color:${r.inkStrong};}
/* Zavrieť = šípka späť vľavo v bledom kruhu (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */
.atl-editor-x{${Sr("pale")}}
.atl-editor-x:hover{${Or("pale")}}
.atl-editor-area{flex:1 1 auto;min-height:0;resize:none;width:100%;box-sizing:border-box;padding:16px 16px;border-radius:8px;background:${r.card};border:1px solid ${_.border};color:${r.inkStrong};font-family:${x};font-size:16px;line-height:1.6;}
.atl-editor-area:focus{outline:none;border-color:${r.cardEdge};}
.atl-editor-area::placeholder{color:${r.inkWarm};opacity:.7;}
.atl-editor-done{flex:0 0 auto;align-self:flex-end;min-width:180px;}
/* ── HODNOTENIE JE VÝRAZNEJŠIE (§5.3) ──────────────────────────────────────────────────
   Matej 2026-08-26: „hodnotenie musí byť tiež výraznejšie."
   Päť malých obrysových labiek v rade bez akéhokoľvek rámu vyzeralo ako popisok, nie ako
   pole, ktoré sa vypĺňa. Dostáva vlastnú plochu (úroveň 2 matrice), väčšie labky a číslo
   vedľa — číslo je jediné, čo z hodnotenia človek prečíta na diaľku. */
.atl-rate{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:12px;background:rgba(245,240,228,0.05);border:1px solid ${r.onDarkBorder};}
.atl-rate-val{flex:0 0 auto;font-family:${me};font-weight:700;font-size:20px;line-height:1;color:${r.onDarkDim};font-variant-numeric:tabular-nums;}
.atl-rate-val.on{color:#F5C73D;}
/* ── ČERVENÁ BUBLINKA NAD CTA (§5.4) ───────────────────────────────────────────────────
   Plná výplň a plný rám, nie priesvitný tint: stojí nad zlatým tlačidlom a musí sa dať
   prečítať skôr, než sa naň klikne. Inkoust je tmavočervený na svetlom, aby fungovala aj
   na papyruse PC — druhá verzia pre bledý skin tým odpadá. */
.atl-draftwarn{margin-bottom:10px;padding:12px 12px;border-radius:8px;background:rgba(206,75,60,0.14);border:1.5px solid rgba(206,75,60,0.75);}
.atl-draftwarn b{display:block;font-family:${me};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;color:#E9A093;}
.atl-draftwarn p{margin:5px 0 0;font-family:${x};font-size:12px;line-height:1.5;color:${r.onDarkDim};}
.atl-nav{display:flex;gap:8px;align-items:stretch;}
.atl-nav .atl-toggle-btn{flex:0 0 34%;}
.atl-nav .btn-gold{flex:1 1 0;}
`,Cl=`
.atl-restore{margin:16px 20px;padding:16px 16px;border:1px solid ${r.onDarkBorder};border-radius:12px;background:rgba(245,240,228,0.04);}
.atl-restore-txt{margin:0 0 12px;font-family:${x};font-size:14px;line-height:1.5;color:${r.onDark};}
.atl-restore-btns{display:flex;gap:8px;}
.atl-restore-btns .atl-toggle-btn{flex:1 1 0;}
`,Rl=`
/* Výrez trasy namiesto zástupnej fotky. Papyrus sem NEPATRÍ — formulár je tmavý povrch
   Portalu, takže podklad je ten istý sklenený tón ako zvyšok panela. */
.atl-photo--route{position:relative;display:block;background:linear-gradient(160deg,#1b1409,#0d0a06);border:1px solid ${r.onDarkBorder};}
.atl-photo--route svg{position:absolute;inset:0;width:100%;height:100%;}
/* Popisok dole, nie hore: trasa začína v ľavom hornom rohu výrezu, takže tam,
   kde badge sedí pri fotke, prekrýva prvý bod. */
.atl-photo--route .atl-photo-badge{top:auto;bottom:10px;}
.atl-photo--route polyline{fill:none;stroke:#F5C73D;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 6px rgba(245,199,61,0.45));}
/* Najmenší zápis: čiarkovane aj tu — rámik nesmie tvrdiť trasu, ktorú appka nepozná. */
.atl-photo--route.is-minimal polyline{stroke-dasharray:2 9;}
`,Tr=`
.atl-companions .comm-comp-selected{gap:8px;}
/* Jeden pes: avatar a pole na človeka v JEDNOM riadku (24. 9. 2026). */
.atl-companions .atl-solo-row{display:flex;align-items:center;gap:8px;}
/* Návrhy členov pod poľom (15. 10. 2026) — RIADOK v zozname, voľba je akcia ⇒ lapisový tint pri hoveri. */
.atl-msug{list-style:none;margin:8px 0 0;padding:4px;display:flex;flex-direction:column;gap:4px;border:1px solid ${r.onDarkBorder};border-radius:12px;background:rgba(6,5,3,0.6);}
.atl-msug button{display:flex;align-items:center;gap:8px;width:100%;padding:4px 8px;border:0;border-radius:8px;background:none;color:${r.onDark};font-family:${x};font-size:14px;text-align:left;cursor:pointer;}
.atl-msug button:hover,.atl-msug button:focus-visible{background:rgba(22,48,122,0.16);outline:0;}
.atl-msug-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;}
.atl-msug-txt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.atl-msug-txt b{font-weight:600;}
.atl-msug-num{font-size:12px;opacity:.7;}
.atl-companions .atl-solo-row .comm-comp-searchwrap{flex:1;min-width:0;}
.atl-companions .comm-comp-chip{padding:4px;gap:4px;position:relative;}
.atl-companions .comm-comp-chip b{
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${r.onDarkBorder};
  padding:4px 8px;border-radius:8px;font-family:${x};font-size:12px;font-weight:500;
  color:${r.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.atl-companions .comm-comp-chip:hover b{opacity:1;}
.atl-companions .comm-comp-pack{gap:8px;}
.atl-companions .comm-comp-dog{padding:4px;gap:0;position:relative;}
/* ⚠️ TOOLTIP JE MENO, NIE AVATAR (opravené 2026-08-26). Selektor span:not(.plus) bral
   z toku AJ .comm-comp-dog-av, lebo aj ten je <span>. Kým bola pilulka nevybraná, držal
   jej šírku aspoň plusko; odkedy je vlastný pes predvyplnený (§5.1 zadania), plusko tam nie je
   a celá pilulka spadla na 8×8 px — teda na bod, v ktorom sa fotka psa vôbec nezobrazí.
   Vyzeralo to ako chyba dát („pes bez fotky"), pritom fotka bola načítaná a mala 28 px. */
.atl-companions .comm-comp-dog span:not(.plus):not(.comm-comp-dog-av){
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);
  white-space:nowrap;background:rgba(6,5,3,0.95);border:1px solid ${r.onDarkBorder};
  padding:4px 8px;border-radius:8px;font-family:${x};font-size:12px;font-weight:500;
  color:${r.onDark};opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:6;
}
.atl-companions .comm-comp-dog:hover span:not(.plus):not(.comm-comp-dog-av),
.atl-companions .comm-comp-dog:focus span:not(.plus):not(.comm-comp-dog-av){opacity:1;}
.atl-companions .comm-comp-dog .plus{
  position:absolute;right:-3px;bottom:-3px;margin:0;background:${ae};color:${r.ink};
  width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:12px;line-height:1;
}
/* ČLOVEK Z TVOJHO PSA (P2, 5. 10. 2026) nesie MENO v pilulke, nie v tooltipe. Psa poznáš
   po fotke; človeka bez fotky by tu zastupovalo len písmeno a na telefóne hover nie je. */
.atl-companions .comm-comp-dog.comm-comp-human{padding:4px 12px 4px 4px;gap:8px;}
.atl-companions .comm-comp-dog.comm-comp-human span:not(.plus):not(.comm-comp-dog-av){
  position:static;transform:none;background:none;border:0;padding:0;opacity:1;pointer-events:auto;
}
.atl-companions .comm-comp-dog.comm-comp-human .plus{position:static;width:auto;height:auto;background:none;color:${ae};font-size:14px;}
`,Ll=`
.atl-log{display:flex;flex-direction:column;height:100%;min-height:0;flex:1 1 auto;}
/* AINUBIS NAD RÁMOM (krok ZNÁMKA, 15. 10. 2026). Sprievodca je inde pripnutý k oknu
   (.ang-wrap fixed) — tu stojí v toku hostiteľa, tak ako v ľavom stĺpci krokov 1–2
   (.trp-dock--pc .ang-wrap). Šírku drží stĺpec, nie bublina. */
.atl-guide{flex:0 0 auto;}
.atl-guide .ang-wrap{position:static;left:auto;right:auto;top:auto;padding:0;background:none;z-index:auto;pointer-events:auto;}
.atl-guide .ang-bar{max-width:none;}
@media (max-width:${uo-1}px){
  .atl-guide{padding:12px 16px 0;}
}
.atl-log-head{display:flex;align-items:center;gap:10px;padding:12px 24px 8px;flex-shrink:0;}
.atl-log-back{display:inline-flex;align-items:center;justify-content:center;background:rgba(245,240,228,0.06);border:1px solid ${r.onDarkBorder};color:${r.onDark};width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;line-height:1;}
.atl-log-back:hover{border-color:${ae};color:${ae};}
.atl-log-title{font-family:${me};font-weight:700;font-size:14px;letter-spacing:0.02em;text-transform:uppercase;color:${r.onDark};}
/* Titulná obrazovka pridávania — návrat v strede, pod ním nadpis a jedna veta. */
.atl-log-head--plain{justify-content:center;padding:16px 24px 8px;}
/* ⚠️ SEDEM DLAŽDÍC SA MUSÍ ZMESTIŤ NA TELEFÓN (Matej 2026-08-23: „výber aktivity sa nezmestí
   na viewport mobilu"). Je to prvá obrazovka pridávania a zoznam, z ktorého sa vyberá — keď
   spodné dve položky ležia pod hranou, vyzerá to, že aktivít je päť. Preto je tu rytmus
   utiahnutý (výplne, medzery, nadpis) a veta pod nadpisom je DVOJRIADKOVÁ; keď ju budeš
   predlžovať, premeraj to znova pri innerHeight ~700. */
.atl-log-head--intro{flex-direction:column;align-items:center;gap:18px;padding:32px 24px 16px;text-align:center;}
/* Matej 2026-08-27: „vyzerá to prázdne… centruj nadpis, zväčši nadpis Pick an activity."
   Je to titulná strana celého pridávania a od zúženia sedmičky aktivít na ŠTYRI kategórie
   je pod ňou o tri dlaždice menej — nadpis teda nekonkuruje zoznamu, ale drží prázdnu
   plochu. Centrovanie nesie .atl-log-head--intro vyššie (flex column + text-align). */
/* ── ZLATÁ ČIARKA POD NADPISOM (Matej 2026-08-28: „pri vyber aktivitu pridaj pod nadpis
      tú čiarku čo si teraz pridal v ADD") ───────────────────────────────────────────────
   Ten istý prvok, aký nesú dlaždice vstupného popupu — deliaca linka T.rule z locku bledého
   bloku. Drží dve obrazovky za sebou v jednom jazyku: názov je hlavička, nie prvý riadok
   odseku. Odkedy pod ňou nestojí veta, je to jediné, čo nadpis oddeľuje od zoznamu.
   ⚠️ Kreslí sa na ::after, teda nezaberá vlastný riadok — výškový rozpočet obrazovky
   (dlaždice sa musia zmestiť bez skrolu) sa nemení. */
.atl-log-title--big{font-size:24px;letter-spacing:0.02em;line-height:1.2;position:relative;padding-bottom:12px;}
.atl-log-title--big::after{content:'';position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:52px;height:2px;border-radius:2px;background:${r.rule};}
/* JEDEN STĹPEC NA MOBILE (Matej 2026-08-23: „políčka na mobile zväčši tak aby boli cez celý
   displej"). Dlaždica sa tým narovná do riadku — emoji vľavo, názov vedľa — takže výška
   obrazovky vystačí aj na sedem položiek. Nad 560 px ostávajú dva stĺpce. */
/* Zoznam je JEDINÉ, čo sa smie posúvať — nadpis a návrat ostávajú na mieste aj na
   najnižších displejoch, kde sa sedem položiek naozaj nezmestí. */
/* Centrovanie namiesto zarovnania na vrch (Matej 2026-08-24: „obsah centrovať — dnes sedí pri vrchnom
   okraji a pod ním ostáva prázdno").
   ⚠️ MUSÍ TO BYŤ "safe center", NIE holé "center". Holé center v skrolovacom kontajneri
   pretlačí prvú dlaždicu NAD začiatok skrolu, keď sa obsah nezmestí — a tam sa už nedá
   doskrolovať. Na nízkom telefóne na šírku by tak zmizla turistika, teda prvá voľba.
   Slovo safe prepne späť na start presne v tej chvíli, keď by k tomu došlo. */
/* ROZŤAHOVANIE, NIE CENTROVANIE (Matej 2026-08-27). Štyri jednoriadkové dlaždice nechávali
   v 700 px stĺpci ~120 px hore aj dole; 1fr riadky si voľnú výšku rozdelia rovným dielom,
   takže blok je plný bez toho, aby sa čokoľvek dopĺňalo len na výplň. min-content v spodnej
   hranici drží mobil — tam voľná výška nie je a riadok nesmie klesnúť pod obsah. */
.atl-tiles{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:grid;grid-template-columns:1fr;grid-auto-rows:minmax(min-content,1fr);align-content:stretch;gap:12px;padding:2px 20px calc(14px + env(safe-area-inset-bottom,0px));}
.atl-tiles.has-open{grid-auto-rows:min-content;align-content:safe center;}
/* Emoji vľavo cez oba riadky, vpravo názov NAD vetou. Bol to flex rad, v ktorom sa veta
   zalamovala pod emoji (flex:1 1 100%) — s vetou na KAŽDEJ dlaždici by tak sedem položiek
   začínalo siedmimi rôznymi odsadeniami. */
/* JEDEN RIADOK, JEDNO SLOVO (Matej 2026-08-26). Mriežka dvoch riadkov tu stála kvôli vete
   pod názvom; tá je odteraz v rozbaľovači, takže z dlaždice ostal rad: emoji · názov · šípka.
   Flex namiesto grid-u zámerne — pri jednom riadku je grid-row:1/3 na emoji aj šípke len
   opis toho, čo align-items:center spraví samo. */
/* ⚠️ VÄČŠIE OD 27. 8. (Matej: „urob tie tlačítka väčšie"). Vojde sa to preto, že tu už
   nestojí sedem aktivít, ale ŠTYRI kategórie — pri sedmičke bol jednoriadkový tvar jediný
   spôsob, ako sa zmestiť bez skrolovania, a to bol celý dôvod, prečo veta z dlaždice
   odišla do rozbaľovača. Zoznam ostáva skrolovateľný, takže pribudnutie piatej to nezhodí. */
.atl-tile{display:flex;align-items:center;gap:16px;padding:16px 24px;border-radius:${Qn}px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};cursor:pointer;text-align:left;transition:border-color .15s ease,background .15s ease;}
.atl-tile:hover{border-color:${ae};background:rgba(201,154,63,0.10);}
.atl-tile-emoji{flex:0 0 auto;font-size:24px;line-height:1;}
/* Názov je JEDNO SLOVO a nesie identitu voľby ⇒ Cinzel, nie Space Grotesk (brand: nadpisy
   a názvy sú Cinzel). Ako veta pod ním by to bolo zlé, ako štítok je to správne. */
.atl-tile-label{min-width:0;font-family:${me};font-weight:700;font-size:16px;letter-spacing:0.02em;text-transform:uppercase;color:${r.onDark};}
/* ── KROK 0b: PLÁNUJEM / PREŠLI SME TO ────────────────────────────────────────────────────
   Rozbaľovač je SÚČASŤ dlaždice, nie samostatný blok pod zoznamom: keby stál mimo, pri
   siedmich položkách by človek nevidel, ku ktorej sa voľba vzťahuje. Otvorená dlaždica preto
   stráca spodný rádius a rozbaľovač ho preberá — spolu tvoria jeden predmet. */
.atl-tile-wrap{display:flex;flex-direction:column;min-width:0;min-height:0;}
.atl-tiles:not(.has-open) .atl-tile{flex:1 1 auto;}
/* Dvojriadkový text vedľa emoji — názov nesie Cinzel, veta ide bežným písmom a nededí
   uppercase ani letter-spacing z nadpisu. */
.atl-tile-txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:5px;}
.atl-tile-note{font-family:${x};font-weight:400;font-size:12px;line-height:1.4;letter-spacing:0;text-transform:none;color:${r.onDarkDim};}
.atl-tile-caret{flex:0 0 auto;font-family:${x};font-size:16px;line-height:1;color:${r.onDarkDim};}
.atl-tile-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
.atl-tile-tag{font-family:${x};font-weight:500;font-size:10px;line-height:1;letter-spacing:0.02em;text-transform:none;padding:4px 8px;border-radius:999px;border:1px solid ${r.border};background:rgba(201,154,63,0.10);color:${ae};white-space:nowrap;}
.atl-tile-sketch{flex:0 0 auto;display:flex;}
.atl-own{grid-column:1/-1;display:flex;flex-direction:column;gap:4px;}
.atl-chip--own{border-style:dashed;}
/* ── OTVORENÁ DLAŽDICA = JEDEN TMAVÝ BLOK (Matej 2026-08-27) ─────────────────────────────
   „treba skúsiť iné otváranie — blok stmavne a priamo v tom istom bloku budú 2 možnosti."
   Predtým to boli DVA prvky pod sebou (svetlá dlaždica + prilepený pásik s vlastným rámom),
   spojené len tým, že sa medzi nimi zrušil okraj — a práve ten šev bolo vidno.
   ⚠️ POVRCH JE LAPIS, NIE ČIERNA (Matej 2026-08-27: „tmavú zmeň na lapis nech držíme brand").
   Sadá to presne do pravidla lapisu z navGoldSkin.ts — ZLATO = konštrukcia a poloha,
   LAPIS = moja voľba a moja akcia, menovite „vybraná dlaždica". Neutrálna čierna hovorila
   len „toto je iné"; lapis povie „toto som vybral ja", a so zlatým písmom drží pôvodnú
   egyptskú dvojicu. NIE je to T.brandBlue — tou appka značí body NA MAPE.
   ⚠️ Rám a polomer ostávajú zhodné so zatvorenými — musia vyzerať ako súrodenci, inak sa
   pri otvorení „prepne" celý zoznam. Mení sa výplň a inkoust, nič iné.
   ⚠️ Predpona .atl-tile-wrap.is-open nie je ozdoba: bledý PC prepis (PALE_LOG_CSS) stojí
   v DOM POSLEDNÝ, takže pri rovnakej špecificite vyhrá on a dlaždica by ostala papyrusová. */
.atl-tile-wrap.is-open{background:${C.grad};border:1px solid ${C.edge};border-radius:${Qn}px;overflow:hidden;box-shadow:${ct};}
.atl-tile-wrap.is-open .atl-tile{background:transparent;border-color:transparent;border-radius:0;box-shadow:none;}
.atl-tile-wrap.is-open .atl-tile-label{color:${C.ink};}
.atl-tile-wrap.is-open .atl-tile-note,.atl-tile-wrap.is-open .atl-tile-caret{color:rgba(239,215,154,0.72);}
.atl-mode{border:0;background:transparent;padding:0 16px 16px;}
/* VETA, NIE EYEBROW. Kým tu stálo „Zapisuješ, alebo plánuješ?", bol to štítok — rozhádzané
   veľké písmená s veľkým prestrkom sa čítajú po slovách. Teraz nesie riadok skutočnú vetu
   o aktivite, tak je sadzaná ako veta. */
.atl-mode-btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;}
/* Stĺpec = tlačidlo + vysvetlivka POD ním, obe na tú istú šírku. */
.atl-mode-col{display:flex;flex-direction:column;gap:7px;min-width:0;}
/* Rad tlačidiel berie celú šírku rovnakými dielmi (feedback_rad_prvkov_plna_sirka_kontajnera). */
/* Tlačidlá stoja NA lapise, tak nesú zlatý inkoust — plná svetlá výplň by z nich urobila
   dve hlavné CTA vnútri prvku, ktorý sám je len vybraná dlaždica. */
.atl-mode-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:46px;padding:12px 12px;border-radius:8px;background:rgba(239,215,154,0.10);border:1.5px solid rgba(239,215,154,0.32);color:${C.ink};cursor:pointer;transition:border-color .15s ease,background .15s ease;}
.atl-mode-btn b{font-family:${me};font-weight:700;font-size:14px;letter-spacing:0.02em;text-transform:uppercase;line-height:1.15;}
/* Vysvetlivka nie je tlačidlo — nemá rám ani plochu, len tichý text na šírku stĺpca. */
.atl-mode-cap{font-family:${x};font-weight:400;font-size:10px;line-height:1.35;text-align:center;color:rgba(239,215,154,0.68);}
/* Popisok v zátvorke na druhom riadku — je to spresnenie, nie druhá voľba, tak nesmie mať
   rovnakú váhu ako label. Strop 600 platí aj tu: Space Grotesk nad 600 je fake bold. */
.atl-mode-btn:hover,.atl-mode-btn:focus-visible{border-color:${C.ink};background:rgba(239,215,154,0.20);outline:none;}
.atl-mode-emoji{font-family:${ca};font-size:16px;line-height:1;}
@media (max-width:359px){
  .atl-mode-btns{grid-template-columns:1fr;}
}
/* ══ VÝBER AKTIVITY NA TELEFÓNE = TLAČIDLÁ, NIE PÁSY (Matej 2026-08-28) ══════════════════
   „výber aktivity je moc ťažkopádny a roztiahnutý veľký, skonsoliduj to nech to vyzerá ako
    tlačidlá — viac vzduchu po bokoch aj celkovo po krajoch… väčšie rozostupy"

   ⚠️ RUŠÍ TO ROZŤAHOVANIE Z 27. 8. („opticky musí byť ten blok plný" — riadky 1fr si delili
   voľnú výšku). Ten lock riešil PC panel vysoký ~700 px so štyrmi nízkymi dlaždicami; odkedy
   je formulár na telefóne CELÁ OBRAZOVKA, tá istá deklarácia nafúkne každú dlaždicu na ~150 px
   a zo zoznamu je stĺpec plôch bez tvaru. Prázdno sa preto rieši VZDUCHOM MEDZI tlačidlami
   a okolo nich, nie ich naťahovaním — dlaždica ostáva veľká akurát na to, čo v nej je.
   PC vetva sa NEMENÍ, tam lock platí ďalej.
   ⚠️ Hranica je PALE_PC_MIN — to isté číslo, na ktorom .trp-addhost prechádza z plávajúceho
   panela na celú obrazovku. Vlastné číslo by vyrobilo pásmo šírok, kde je formulár už
   celoobrazovkový, ale zoznam sa ešte správa ako v paneli. */
@media (max-width:${uo-1}px){
  /* ⚠️ ROVNAKO VYSOKÉ, ALE NIE ROZŤAHOVANÉ. Holé min-content dá každej dlaždici inú výšku
     (CHILL má popis na dva riadky) a štyri rôzne vysoké obdĺžniky sa nečítajú ako rad
     tlačidiel. Strop 96 px ich zrovná; keby v niektorom jazyku popis narástol, minmax()
     strop IGNORUJE (max menší než min sa zahadzuje), takže sa nikdy nič neoreže — a
     rozdiel oproti 1fr je práve to, že rásť do prázdna už nemôžu.
     Voľná výška teda ide do ROZOSTUPOV a okrajov, presne ako si Matej vypýtal. */
  .atl-tiles{grid-auto-rows:minmax(min-content,96px);align-content:safe center;gap:18px;padding:2px 22px calc(18px + env(safe-area-inset-bottom,0px));}
  .atl-tile{gap:14px;padding:16px 16px;}
  .atl-tile-emoji{font-size:24px;}
  .atl-tile-label{font-size:16px;}
  .atl-tile-note{font-size:12px;}
  .atl-log-head--intro{padding-left:24px;padding-right:24px;}

  /* ── NADPIS PATRÍ K DLAŽDICIAM, NIE K HORNEJ HRANE (Matej 2026-08-28) ──────────────────
     „ten nadpis posuň nižšie — patrí to k tým 4 blokom"
     Nadpis stál hore a zoznam sa centroval vo zvyšku obrazovky, takže medzi nimi zívalo
     ~85 px a nadpis pôsobil ako hlavička stránky, nie ako uvedenie zoznamu. Posunúť ho
     samotný nižšie by nepomohlo: každý pixel, o ktorý klesne, uberie zoznamu polovicu
     jeho hornej medzery, takže diera sa zmenšuje o polovicu toho, čo sa nadpis vzdiali
     od šípky. Preto sa nadpis a zoznam centrujú AKO JEDEN CELOK a medzi nimi ostáva len
     výplň hlavičky.
     ⚠️ Šípka ide MIMO TOKU (a hore ostáva rezerva jej výšky), inak by ju centrovanie
     stiahlo dole s celou dvojicou — a návrat by medzi ADD a výberom aktivity poskočil
     o 70 px, teda presne to, čomu sa presunom šípky do stredu predchádzalo.
     ⚠️ flex:0 1 auto na zozname (namiesto 1 1 auto): zoznam sa smie ZMRAŠTIŤ a rolovať
     na nízkom displeji, ale nesmie sa naťahovať — inak vyplní zvyšok a centrovať nie je čo.
     Slovo safe drží vrch dosiahnuteľný, keď sa dvojica nezmestí.
     ⛔ CENTROVANIE ZRUŠENÉ 3. 10. 2026 (hárok rozhodnutí, bod 4A — Matej „ok"): nad nadpisom
     ostávalo ~240 px prázdna. Nadpis a zoznam stoja HORE pod šípkou (48 + 32 px), voľno je
     dole pod palcom. Šípka ostáva mimo toku v strede hore (zadanie 23. 8.). */
  .atl-log--intro{position:relative;justify-content:flex-start;padding-top:48px;}
  .atl-log--intro .atl-log-head--intro{padding-top:32px;gap:0;}
  .atl-log--intro .atl-log-back{position:absolute;top:14px;left:50%;transform:translateX(-50%);}
  .atl-log--intro .atl-tiles{flex:0 1 auto;}
}
/* ⚠️ DVOJSTĹPCOVÁ MRIEŽKA ZANIKLA (Matej 2026-08-26: „musíme aktivity dať do jedného riadku,
   pretože v dropdowne je výber a ten je stlačený ak je blok s aktivitou na polovičnej
   veľkosti"). Rozbaľovač je súčasťou dlaždice, takže v dvoch stĺpcoch dostal polovičnú šírku
   a dve tlačidlá v ňom sa lámali. Jeden stĺpec je preto podmienka toho, aby rozbaľovač vôbec
   mohol niesť vetu a dve tlačidlá vedľa seba — nie estetická voľba.
   Miesto, ktoré tým dlaždice stratili na šírku, získali späť na výšku: bez vety je riadok
   nízky, takže sedem aktivít sa aj tak zmestí bez skrolovania. */
/* PEVNÝ VIEWPORT (Matej 23. 8.: „na mobile musí byť pevný viewport, nie pohyblivý mimo").
   Vodorovne sa neskroluje nikdy — čo pretečie, je chyba prvku, nie dôvod na posúvanie
   stránky. Vlastnosť overscroll-behavior drží ťah prsta vnútri formulára, aby sa pod ním nehýbala
   mapa ani celý dokument. */
.atl-log-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:4px 24px 16px;display:flex;flex-direction:column;gap:11px;}
/* ── KROK SA MÁ ZMESTIŤ, NIE SKROLOVAŤ (Matej 2026-08-26) ──────────────────────────────
   „niektoré kroky vo flow sa musia scrolovať… skúsme to spraviť tak, aby sa nemuselo."
   Krok 4 potreboval 544 px do 450 px vysokého tela. Šesť polí nad sebou, z toho päť má
   pevnú výšku danú obsahom (tri voľby, chipy) — pružné je jediné: pole na príbeh.
   Dostáva preto zvyšok miesta namiesto pevných troch riadkov: na vysokom okne je z neho
   veľká písacia plocha, na nízkom sa stiahne na dva riadky a krok sa zmestí celý.
   ⚠️ Zvyšné úspory sú v geometrii (rozostup 14→11, popisky, hlavička, krokovník) — samotné
   pružné pole by pri veľmi nízkom okne kleslo pod čitateľnú výšku a min-height by potom
   skrol vrátil. overflow-y:auto vyššie ostáva ako poistka, nie ako spôsob použitia.
   ⚠️ resize sa vypína ZÁMERNE: ručne nastavená výška je inline štýl, ktorý pružnosť
   prebije, a pole by sa po prvom potiahnutí prestalo prispôsobovať. Kto chce veľkú plochu,
   má nad poľom „otvoriť na celú obrazovku" — to je tá istá hodnota, len bez okienka. */
.atl-field--grow{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;}
/* ⚠️ DNO 120 px, nie 58 (2026-08-26): rastúce pole je v celom súbore JEDINÉ — príbeh
   výletu v kroku 3 — a 58 px je výška, pri ktorej vidno riadok a pol. Rastie do zvyšku
   stĺpca; toto číslo platí len vtedy, keď stĺpec žiadny zvyšok nemá (nízke okno). */
.atl-field--grow .atl-textarea{flex:1 1 auto;min-height:120px;resize:none;}
.atl-photo{flex:0 0 auto;position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#1c2b1a,#0e1a0d);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;border:1px solid ${r.onDarkBorder};}
.atl-photo-badge{font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.45);padding:8px 16px;border-radius:8px;border:1px solid rgba(201,154,63,0.5);}
.atl-field label{display:block;font-family:${x};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${r.onDarkDim};margin-bottom:4px;}
.atl-field-hint{font-weight:400;text-transform:none;letter-spacing:0;opacity:.72;font-size:10px;font-family:${x};color:${r.onDarkDim};}
/* ⚠️ 16 px JE MINIMUM, NIE VKUS (feedback_dogypt_form_input_recurring_bugs, tretí výskyt
   23. 8.). Pod ním iOS Safari pri kliknutí do poľa priblíži CELÝ dokument a ovládanie
   ukotvené k okrajom vypadne mimo obrazovky — vyzerá to, že sa appka rozbila, nie že je
   priblížená. Platí to na KAŽDÉ pole, aj na dátum a rozbaľovačky.
   min-width:0 + max-width:100%: pole s type=date má na iOS vlastnú vnútornú šírku
   a v grid bunke (min-width:auto) ju presadí — riadok tak pretiekol cez okraj stránky
   a dal sa vodorovne posúvať (Matej 23. 8.: „dátum preteká cez okraj"). */
.atl-input{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:rgba(245,240,228,0.05);border:1px solid ${r.onDarkBorder};border-radius:8px;padding:8px 12px;color:${r.onDark};font-family:${x};font-size:16px;outline:0;}
.atl-input:focus{border-color:${ae};}
.atl-input::placeholder{color:${r.onDarkDim};}
.atl-input:disabled{opacity:.45;}
/* ── DÁTUM NA iOS (Matej 2026-08-23: „veľké políčko preteká cez okraj, centrovaný na stred") ──
   input[type=date] si na WebKite/iOS drží VLASTNÚ vnútornú šírku podľa formátu dátumu a
   width:100% ju neprebije — pole vyrastie nad svoj stĺpec a pretečie cez okraj panela.
   K tomu má vnútorná hodnota (::-webkit-date-and-time-value) na iOS default text-align:center,
   takže dátum stojí v strede, kým všetky ostatné polia píšu zľava.
   ⚠️ Bez spätných apostrofov zámerne — toto je JS template literal a ukončili by ho.
   Tri pravidlá, tri príčiny — vypnúť natívny vzhľad NESTAČÍ, šírku aj zarovnanie treba povedať
   zvlášť. Platí na oba dátumy (od/do) aj na akýkoľvek ďalší type=date v sprievodcovi. */
/* ⚠️ PRÁZDNY DÁTUM NA iOS SKOLABUJE NA POLOVIČNÚ VÝŠKU (Matej 2026-08-25, opakovane:
   „už po niekoľký krát sa sťažujem na zlý text area pri dátume — aký je úzky… po pridaní
   už je to ok"). Nie je to dizajn, je to WebKit: '::-webkit-date-and-time-value' je bez
   hodnoty prázdny inline box s výškou 0, takže pole vysoké ~39 px (16 px písmo + 2×9 px
   výplň + rám) spadne na ~20 px. Po vypísaní dátumu box dostane obsah a výška sa vráti —
   preto to vyzeralo náhodne.
   Riešenie je z DVOCH strán, samotné 'min-height' na poli nestačí: bez druhého riadku
   ostane text prilepený hore, lebo prázdny vnútorný box sa nemá o čo oprieť.
   Počíta sa z 'em', nie z pevných pixelov — pole vedľa má 'font-size:16px', a keby sa
   niekedy zmenilo, dvojica sa nesmie rozísť. */
.atl-input[type="date"]{-webkit-appearance:none;appearance:none;position:relative;display:block;width:100%;min-width:0;max-width:100%;padding-right:48px;text-align:left;min-height:calc(1.2em + 20px);}
.atl-input[type="date"]::-webkit-date-and-time-value{text-align:left;margin:0;min-height:1.2em;line-height:1.2;}
/* ── IKONKA KALENDÁRA NA PLNÚ VÝŠKU POĽA (Matej 2026-08-24) ──────────────────────────
   „dátum na mobile má úzky text area — dajme tam ikonku kalendára v normálnej výške
    textarey."
   Pole bolo rovnako vysoké ako ostatné; úzko pôsobila IKONKA — Chrome ju kreslí ~14 px
   a nalepenú hneď za dátum, takže vyzerala ako drobný odznak uprostred poľa a nie ako
   niečo, čoho sa dá dotknúť. Teraz je to pás pri pravom okraji cez CELÚ výšku poľa,
   teda cieľ pre palec.
   ⚠️ POZICOVANÉ ABSOLÚTNE, NIE FLEXOM. Flex na hostiteľovi ani na webkit-datetime-edit
   Chrome pri appearance:none NEPOUŽIJE — obe cesty boli vyskúšané a ikonka ostala visieť
   za textom (pravidlá boli v dokumente, len bez účinku). Absolútne pozicovanie na vnútorný
   layout dátumového vstupu nespolieha vôbec.
   ⚠️ NATÍVNY GLYF JE SKRYTÝ, NEPREFARBENÝ. Chrome ho kreslí tmavý a prilepený k HORNEJ
   hrane, keď sa element roztiahne na plnú výšku; filter:invert ani background-position naň
   spoľahlivo neplatia (obe vyskúšané naživo — ikonka ostala tmavá a hore). Element preto
   ostáva ako priehľadná KLIKACIA PLOCHA cez celú výšku a kalendár kreslí sám vstup ako
   pozadie — tam sa dá vycentrovať aj zafarbiť na zlatú.
   ⏳ Kresba je geometrická, nie z hand-drawn setu: kit kalendár NEMÁ. Je to ovládanie
   vstupu (rovnaká trieda vecí ako šípka rozbaľovacieho zoznamu), nie ikonka obsahu, takže
   lucide sem neťaháme — ak má byť kreslená, treba si ju vypýtať od Mateja. */
.atl-input[type="date"]{background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C99A3F' stroke-width='1.8' stroke-linecap='round'%3E%3Crect x='3' y='5' width='18' height='16' rx='2.5'/%3E%3Cpath d='M3 10h18M8 3v4M16 3v4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;background-size:20px 20px;}
.atl-input[type="date"]:disabled{background-image:none;}
.atl-input[type="date"]::-webkit-calendar-picker-indicator{position:absolute;right:0;top:0;width:46px;height:100%;margin:0;padding:0;opacity:0;cursor:pointer;}
.atl-textarea{resize:vertical;font-family:${x};}
.atl-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;}
/* Rad na CELÚ šírku, rovnaké diely — počet dielov sa riadi počtom polí, nie mriežkou.
   Preto flex a nie grid: pri jedinom poli (krajina bez regiónu) sa diel roztiahne sám. */
.atl-rowfull{display:flex;gap:10px;}
.atl-rowfull > *{flex:1 1 0;min-width:0;}
.atl-row3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}
/* ── RAD, KTORÝ SA NA MOBILE NEROZPADNE (Matej 2026-08-24) ─────────────────────────
   „skúsme dať do jedného riadku, aby sme ušetrili miesto, lebo je potrebný scroll."
   ⚠️ Je to VÝNIMKA z pravidla z 23. 8. („políčka na mobile zväčši tak aby boli cez celý
   displej"), nie jeho zrušenie — preto vlastná trieda a nie zásah do .atl-row3. Obe
   požiadavky sú platné a protirečia si len pri týchto troch poliach: sú to rozbaľovacie
   zoznamy s krátkou hodnotou, kde plná šírka nič nepridá, ale tri riadky navyše stoja
   presne ten skrol, ktorý Matej reklamuje. Meno, dátum ani popis sa nedotkli.
   Popisky sa na úzkom displeji skracujú ORezaním s tromi bodkami, nie zmenšením písma —
   pod 9,5 px by prestali byť čitateľné. */
.atl-row3--tight{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
.atl-row3--tight .atl-field label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.atl-row3--tight .atl-input{padding-left:8px;padding-right:8px;}
/* ⚠️ DVOJICA, KTORÁ SA NA TELEFÓNE NEROZPADNE (Matej 2026-08-25: „povrch a ruch daj do
   jedného riadku vedla saba nie pod seba"). '.atl-row2' sa pod 640 px zlomí do stĺpca —
   správne pre dlhé polia (názov, dátum), ale toto sú dva krátke rozbaľovače a pod sebou
   zbytočne naťahujú krok o celý riadok. Rovnaký dôvod, pre aký '.atl-row3--tight' v tej
   media query zámerne nie je. */
.atl-row2--tight{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.atl-row2--tight .atl-field label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.atl-row2--tight .atl-input{padding-left:8px;padding-right:8px;}
/* Rad náročností: celá šírka, rovnaké diely (rad prvkov = celý kontajner). Štyri stupne sa
   na najužší telefón zmestia len s malým písmom a bez uppercase — značka nesie význam,
   text ju už len pomenúva. */
.atl-diffrow{display:flex;gap:6px;}
/* ⚠️ BODKA VEDĽA SLOVA, NIE NAD NÍM. Náročnosť robí presne to isté, čo ruch a povrch pod
   ňou — vyberá sa jedna z troch — ale ako jediná stála na dvoch riadkoch, takže vyzerala
   ako iný druh ovládania a stála o 20 px viac. Rad emoji + slovo je vzor, ktorý už drží
   zvyšok kroku. */
.atl-diffbtn{flex:1 1 0;min-width:0;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:6px;padding:8px 4px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};font-family:${x};font-size:10px;font-weight:500;line-height:1.1;cursor:pointer;}
.atl-diffbtn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
.atl-diffbtn.on{background:rgba(61,122,78,0.26);border-color:${de};color:${r.onDark};box-shadow:inset 0 0 0 1px ${de};}
.atl-toggle-row{display:flex;gap:8px;}
/* ── OTÁZKA V DOKU NAD HOTOVOM (2026-08-27) ────────────────────────────────────────────
   Stojí NAD MAPOU, takže platí pravidlo doku: plná tmavá výplň nesie panel, tu ostáva len
   rozostup a popiska. Žiadny vlastný podklad — druhá plocha vnútri panela by z jedného
   ovládania spravila dve. */
.atl-daymode{display:flex;flex-direction:column;gap:7px;}
.atl-daymode-ask{font-family:${x};font-size:12px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${r.onDarkDim};}
/* Odkaz, nie tretie tlačidlo: výber z magistrál je vedľajšia cesta k tej istej trase a
   v rade s dvoma prepínačmi by vyzeral ako tretia odpoveď na otázku o dĺžke výletu. */
/* ── ODYSEA (2026-08-27) — OZNÁMENIE, NIE VOĽBA ────────────────────────────────────────
   Priesvitný modrý tint podľa locku z 26. 8. (recept pickTintCSS), nie plná farba: plná modrá je
   rezervovaná pre hlavné CTA a dva rovnako sýte modré prvky na jednej obrazovke si
   konkurujú. cursor:default je zámerný — nič sa tu neklikne. */
/* ⚠️ border MUSÍ BYŤ DEKLAROVANÝ — pickTintCSS dáva len border-COLOR — bez šírky a štýlu
   sa rám nevykreslí a z modrého tintu ostane na piesku šedá plocha. Práve plný farebný
   rám (nie krytie výplne) nesie podľa locku z 26. 8. čitateľnosť. */
.atl-odyssey{display:flex;align-items:center;gap:10px;padding:12px 12px;border:1px solid transparent;border-radius:8px;cursor:default;${ke(C.edge,C.ink,.26)}}
.atl-odyssey-mark{font-size:14px;line-height:1;opacity:.9;}
.atl-odyssey-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.atl-odyssey-txt b{font-family:${me};font-size:14px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;}
.atl-odyssey-txt i{font-family:${x};font-style:normal;font-size:12px;font-weight:400;opacity:.85;}
.atl-daycount{margin:2px 0 0;font-family:${x};font-size:12px;font-weight:500;letter-spacing:0.02em;color:${r.onDarkDim};}
.atl-daymode-link{align-self:flex-start;background:none;border:none;padding:4px 0;color:${r.onDarkDim};font-family:${x};font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
/* ⚠️ RAD PREPÍNAČOV = CELÁ ŠÍRKA, ROVNAKÉ DIELY. Trieda atl-toggle-row doteraz nemala ŽIADNE
   pravidlo — bol to holý div, takže tlačidlá so šírkou 100% sa poukladali POD SEBA a jedno
   pole („kedy idete" má tri presnosti a štyri týždne) zabralo sedem riadkov. Rovnako stála
   aj viditeľnosť plánu. Deľba flex 1 1 0 je tá istá, akú drží atl-restore-btns. */
.atl-toggle-row > .atl-toggle-btn{flex:1 1 0;min-width:0;}
/* ⚠️ ZELENÁ LEN V RADE VOLIEB. Samostatný .atl-toggle-btn.on je AKCIA (Zostať,
   Pokračovať, Zapísať aj tak), nie označená možnosť — tam zlatá ostáva. */
.atl-toggle-row > .atl-toggle-btn.on{background:rgba(61,122,78,0.26);border-color:${de};color:${r.onDark};box-shadow:inset 0 0 0 1px ${de};}
.atl-toggle-btn{width:100%;font-family:${x};font-weight:500;font-size:12px;letter-spacing:0.02em;padding:8px 12px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};cursor:pointer;white-space:nowrap;}
.atl-toggle-btn.on{background:rgba(201,154,63,0.14);border-color:${ae};color:${r.onDark};}
.atl-daterange-hint{margin:-4px 0 0;font-family:${x};font-weight:400;font-size:12px;line-height:1.4;color:${r.onDarkDim};}
.atl-journey-link{background:none;border:0;padding:0;margin:0;color:${ae};font-family:${x};font-size:12px;font-weight:600;cursor:pointer;align-self:flex-start;}
.atl-journey-link:hover{text-decoration:underline;}
.atl-journeys{display:flex;flex-direction:column;gap:8px;}
.atl-journey-list{max-height:230px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;border:1px solid ${r.onDarkBorder};border-radius:8px;padding:8px;}
.atl-journey-item{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;text-align:left;padding:8px 12px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};cursor:pointer;}
.atl-journey-item:hover{border-color:${ae};}
.atl-journey-item.on{background:rgba(201,154,63,0.14);border-color:${ae};}
.atl-journey-name{font-family:${me};font-weight:700;font-size:12px;letter-spacing:.02em;color:${r.onDark};}
.atl-journey-meta{font-family:${x};font-weight:500;font-size:10px;letter-spacing:.02em;color:${r.onDarkDim};}
.atl-chips{display:flex;flex-wrap:wrap;gap:6px;}
.atl-name-tip{display:block;margin-top:4px;}
.atl-name-sug{all:unset;cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px;color:inherit;}
.atl-name-sug:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:8px;}
/* ── MRIEŽKA VÝBERU HLAVNÉHO MIESTA (krok „Čo", 1. 9. 2026) ───────────────────────────
   Je to TEN ISTÝ chip, len v dvoch stĺpcoch a vyšší — nie nová značka. Vlastná trieda
   tlačidla by obišla prezliekanie na papyrus (PALE_LOG_CSS mieri na .atl-chip) a na
   svetlom podklade by z výberu ostal nečitateľný obdĺžnik. */
/* OTÁZKA KROKU „ČO" — jediný nadpis vnútri panela krokov. Odsadenie zhora je zámerné:
   nad ním je zlatá deliaca čiara číselníka a bez neho sa naň nadpis lepí. */
.atl-ask{font-family:${me};font-weight:700;font-size:20px;line-height:1.18;letter-spacing:0.02em;
  text-transform:uppercase;color:${r.onDark};margin:14px 0 0;}
.atl-ask-sub{font-family:${x};font-weight:500;font-size:12px;line-height:1.4;color:${r.onDarkDim};margin:7px 0 14px;}
.atl-chips--picks{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
/* Pilulka s voľbou z kroku ČO — stojí v doku nad hľadaním miesta (drawBar.contextPill).
   Rám je ten istý, aký nesú polia a pilulky matrice: rgba(179,130,45,0.55) — jeden, nie dva. */
.atl-ctxpill{align-self:center;display:inline-flex;align-items:center;gap:7px;height:26px;padding:0 12px;border-radius:999px;
  background:rgba(255,250,240,0.72);border:1px solid ${_.border};color:${r.inkStrong};
  font-family:${x};font-weight:500;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;}
.atl-chips--picks .atl-chip{height:46px;justify-content:flex-start;font-size:12px;padding:0 12px;}
.atl-chips--picks .atl-chip-emoji{width:20px;flex:0 0 20px;font-size:16px;margin-right:9px;}
/* ── DOPRAVA (2026-08-26) ───────────────────────────────────────────────────────────────
   Mriežka, nie zalamovaný rad: šesť dlaždíc s emoji a slovom sa pri wrape láme na 4+2
   a posledný riadok potom visí. Tri stĺpce dajú vždy 3+3.
   Výber je PRIESVITNÝ TINT (lock 26. 8.) — plná farba je vyhradená hlavnému CTA. */
/* ZAŠEDNUTÉ POLE (2026-08-26) — pole, ktoré pri sólo výlete nemá koho zaujímať. Ostáva
   VIDITEĽNÉ zámerne: keby zmizlo, krok 3 by sa pri prepnutí voľby scvrkol na dátum a človek
   by netušil, že o niečo prišiel. Tlmí sa celý blok naraz, nie každý ovládač zvlášť. */
/* Pole s natívnym kalendárom sa OTVÁRA KLIKOM (viď openNativePicker) — musí to teda aj
   vyzerať klikateľne. S textovým kurzorom to vyzerá ako políčko na písanie a človek začne
   ťukať bodky, čo bola presne tá výhrada („nech človek nemusí písať"). */
.atl-input--pick{cursor:pointer;}
.atl-field--off{opacity:.42;}
.atl-field--off .atl-input,.atl-field--off .atl-travel-btn{cursor:not-allowed;}
.atl-travel{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.atl-travel-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 4px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};cursor:pointer;min-width:0;}
.atl-travel-btn b{font-size:16px;line-height:1;font-weight:400;}
.atl-travel-btn span{font-family:${x};font-weight:500;font-size:10px;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
.atl-travel-btn:hover{border-color:${ae};}
.atl-travel-btn.on{background:rgba(61,122,78,0.26);border-color:${de};color:${r.onDark};box-shadow:inset 0 0 0 1px ${de};}
/* ZAŠKRTNUTIE — vlastný prvok, nie natívny checkbox: ten sa nedá zladiť s tmavým povrchom
   bez appearance hackov a na mobile má cudziu veľkosť. Je to <button aria-pressed>. */
.atl-check{display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:8px 12px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};cursor:pointer;}
.atl-check b{flex:0 0 auto;width:16px;height:16px;border-radius:0px;border:1px solid ${r.onDarkBorder};display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;}
.atl-check span{font-family:${x};font-weight:500;font-size:12px;letter-spacing:.02em;}
.atl-check.on{background:rgba(61,122,78,0.26);border-color:${de};color:${r.onDark};box-shadow:inset 0 0 0 1px ${de};}
.atl-check.on b{border-color:${de};color:${r.onDark};}
.atl-seats{display:flex;align-items:center;gap:8px;margin-top:8px;}
.atl-seats span{font-family:${x};font-weight:500;font-size:12px;letter-spacing:.02em;color:${r.onDarkDim};}
.atl-seats b{font-family:${me};font-weight:700;font-size:14px;color:${r.onDark};min-width:16px;text-align:center;}
.atl-seats button{width:26px;height:26px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDark};font-size:14px;line-height:1;cursor:pointer;}
.atl-seats button:hover{border-color:${ae};}
.atl-chip{display:inline-flex;align-items:center;height:28px;font-family:${x};font-weight:500;font-size:12px;letter-spacing:.02em;padding:0 12px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px solid ${r.onDarkBorder};color:${r.onDarkDim};cursor:pointer;}
.atl-chip.on{background:rgba(61,122,78,0.28);border-color:${de};color:${r.onDark};box-shadow:inset 0 0 0 1px ${de};}
.atl-chip-emoji{display:inline-flex;align-items:center;justify-content:center;width:15px;flex:0 0 15px;line-height:1;font-size:14px;margin-right:5px;}
.atl-chip-label{line-height:1;}
.atl-chip-add{border-style:dashed;}
/* ── DRUHÝ, ZBALENÝ RAD CHIPOV (2026-08-31) ────────────────────────────────────────────
   Prerušovaný rám je zámer: hovorí „toto je ponuka, nie pole na vyplnenie". Plný rám by
   z rozbaľovača spravil rovnocenný ovládač s chipmi nad ním, a práve to sa nemá stať —
   druhý rad si musí človek vypýtať. */
.atl-more{margin-top:9px;}
.atl-morebtn{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;font-family:${x};font-weight:500;font-size:12px;letter-spacing:.02em;padding:8px 12px;border-radius:8px;background:transparent;border:1px dashed ${r.onDarkBorder};color:${r.onDarkDim};cursor:pointer;}
.atl-morebtn:hover{border-color:${ae};color:${r.onDark};}
.atl-morebtn-arw{flex:0 0 auto;font-size:12px;line-height:1;opacity:.7;}
.atl-more-body{margin-top:9px;padding-top:12px;border-top:1px solid ${r.onDarkBorder};display:flex;flex-direction:column;gap:9px;}
/* ── TICHÁ PONUKA MIESTA ───────────────────────────────────────────────────────────────
   LAPIS, nie zelená: zelená v tomto toku znamená „vybral som si", lapis „appka niečo
   ponúka / vie". Rovnaká dvojica ako pri odysei o kus vyššie. */
.atl-where{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;border:1px solid transparent;border-radius:8px;${ke(C.edge,C.ink,.2)}}
.atl-where-txt{display:flex;flex-direction:column;gap:2px;min-width:0;}
.atl-where-txt b{font-family:${x};font-weight:500;font-size:12px;letter-spacing:.02em;}
/* „nemusíš" musí byť vidno bez rozklikávania — je to celý zmysel tejto ponuky. */
.atl-where-txt i{font-style:normal;font-family:${x};font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;opacity:.72;}
.atl-where-btn{flex:0 0 auto;font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.02em;white-space:nowrap;padding:8px 12px;border-radius:8px;background:${C.grad};border:1px solid ${C.deep};color:${C.ink};cursor:pointer;box-shadow:${ct};}
/* ── ODISTENÝ CHIP ZNAČKY (mazanie dvoma ťukmi) ───────────────────────────────────────
   Odistený chip zčervenie a pribudne mu × — druhý ťuk už značku zmaže, a to nevratne,
   takže to musí vyzerať inak než „vybraté". Červená je tá istá, akú nesie upozornenie
   na mape aj zahodenie výletu: v tomto toku je farbou nevratnej akcie. */
.atl-chip--del{cursor:pointer;}
.atl-chip--del.armed{background:rgba(206,75,60,0.18);border-color:rgba(206,75,60,0.65);color:#F0A0A0;}
.atl-chip-x{font-style:normal;margin-left:6px;font-size:14px;line-height:1;opacity:.9;}
.atl-custom-hazard{display:flex;gap:6px;margin-top:8px;}
.atl-custom-hazard .atl-toggle-btn{flex:0 0 auto;padding:8px 16px;}
.atl-file-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.02em;padding:12px 12px;border-radius:12px;background:rgba(245,240,228,0.05);border:1px solid ${r.onDarkBorder};color:${r.onDark};cursor:pointer;}
.atl-file-btn:hover:not(:disabled){border-color:${ae};color:${ae};}
.atl-file-btn:disabled{opacity:.45;cursor:default;}
.atl-photo-drop.drag .atl-file-btn{${ke(C.edge,ne.lapis,.14)}border-style:dashed;}
.atl-file-input-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.atl-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-top:8px;}
.atl-photo-thumb{position:relative;aspect-ratio:1;border-radius:8px;background-size:cover;background-position:center;border:1px solid ${r.onDarkBorder};cursor:pointer;}
.atl-photo-thumb.cover{border:2px solid ${ae};box-shadow:0 0 0 1px ${r.border};}
.atl-photo-thumb button{position:absolute;top:4px;right:4px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:50%;background:rgba(0,0,0,0.7);border:0;color:${r.onDark};cursor:pointer;font-size:12px;line-height:1;}
.atl-photo-thumb{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;transition:transform .15s ease;}
.atl-photo-grid.sorting .atl-photo-thumb{cursor:grabbing;}
.atl-photo-thumb.dragging{opacity:.35;outline:2px dashed ${C.edge};outline-offset:-2px;}
.atl-photo-ghost{position:fixed;z-index:9999;width:72px;height:72px;transform:translate(-50%,-50%) scale(1.06);border-radius:8px;background-size:cover;background-position:center;border:2px solid ${C.edge};box-shadow:${mo.lift};pointer-events:none;}
.atl-photo-cover-badge{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.14em;color:#000;background:${ae};padding:4px 0;border-radius:0 0 8px 8px;}
.atl-cover-crop{margin-top:10px;display:flex;flex-direction:column;gap:5px;}
/* Náhľad titulnej fotky priamo nad posuvníkom. Pomer 16:9 = ten istý tvar, v akom fotka
   nakoniec sedí na karte výletu, takže sa neposúva výrez, ktorý človek nikdy neuvidí. */
.atl-cover-preview{width:100%;aspect-ratio:16/9;border-radius:8px;background-size:cover;
  background-repeat:no-repeat;border:1px solid ${_.border};}
.atl-cover-crop label{font-family:${x};font-weight:500;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${r.onDarkDim};}
.atl-cover-slider{width:100%;accent-color:${ae};}
/* ⚠️ ODSTUP OD OBSAHU JE NA PÄTE, NIE NA POSLEDNOM POLI (Matej 1. 9. 2026: „text area je
   v dotyku s CTA, čo je zle — musí tam byť väčší priestor"). Príbeh je atl-field--grow,
   teda rastie do zvyšku stĺpca, takže sa jeho spodná hrana VŽDY zastaví presne na hranici
   panela; spodný padding scrollovaného tela sa pod ním nezobrazí (odmerané: spodná hrana
   textového poľa sedí PRESNE na spodnej hrane tela). Rezerva preto patrí päte — 20 px, teda
   viac než 11 px rytmus medzi poľami, aby sa čítala ako predel, nie ako ďalšia medzera. */
.atl-log-foot{flex-shrink:0;margin:20px 20px 20px;display:flex;flex-direction:column;gap:8px;}
/* ⚠️ CTA EDITORA JE V PORTÁLI NA <body>, teda MIMO .atl-log-foot — bez druhého selektora
   by z neho ostalo holé systémové tlačidlo (odskúšané). Pravidlo je jedno, nie kópia:
   .btn-gold lock (CLAUDE.md) hovorí, že gradient existuje na jednom mieste na súbor. */
.atl-log-foot .btn-gold,
.atl-editor .btn-gold{
  width:100%;padding:12px;background:${ua.grad};
  border:1px solid ${ua.edge};border-radius:8px;color:#000;font-family:${me};
  font-size:12px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;
  box-shadow:${ua.glow};
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.atl-log-foot .btn-gold:hover:not(:disabled),
.atl-editor .btn-gold:hover:not(:disabled){transform:scale(1.02);box-shadow:${ua.glowHover};}
.atl-log-foot .btn-gold:disabled,
.atl-editor .btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}
.atl-log-hint{margin:0;font-family:${x};font-size:12px;color:${r.onDarkDim};text-align:center;}
.atl-log-error{margin:0;font-family:${x};font-size:12px;color:#E08A6E;text-align:center;}
.atl-dupwarn{padding:12px 12px;border-radius:8px;background:rgba(201,154,63,0.10);border:1px solid ${ae};}
.atl-dupwarn p{margin:0 0 8px;font-family:${x};font-size:12px;color:${r.onDark};line-height:1.4;}
.atl-dupwarn-btns{display:flex;gap:8px;}
.atl-dupwarn-btns .atl-toggle-btn{padding:8px 12px;font-size:10px;}
@media (max-width:640px){
  .atl-row2,.atl-row3{grid-template-columns:minmax(0,1fr);}
  /* .atl-row3--tight sem ZÁMERNE nepatrí — viď jeho komentár vyššie. */
  /* ── DÁTUM A „NEPAMÄTÁM SI" OSTÁVAJÚ VEDĽA SEBA (Matej 1. 9. 2026: „datum a nepamatam si
     na mobile daj do jedneho riadku nie do dvoch") ────────────────────────────────────────
     Ten istý dôvod ako pri .atl-row2--tight: kalendár si plnú šírku nepýta a tlačidlo je
     jednoslovné (white-space:nowrap už má), takže pod sebou stoja len riadok skrolu navyše.
     Stojí ZA pravidlom vyššie — obe sú 0-1-0, rozhoduje poradie.
     ⚠️ align-items:end je nutné: distančník .atl-label-spacer je o riadok nižšie na mobile
     skrytý, takže tlačidlo nemá popisok a bez tohto by viselo pri hornej hrane radu. */
  .atl-row2--date{grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end;}
  /* Dvojtriedne zámerne: .atl-field label je 0-1-1 a jednotriedny prepis by prehral,
     media query špecificitu nepridáva (to je presne to, na čo upozorňuje check:css). */
  .atl-field .atl-label-spacer{display:none;}
}
`,{ink:le,dim:q,edge:dt,deep:ze,border:Q,field:Ct,soft:pa}=_,Fl=`
  /* ── hlavička kroku ─────────────────────────────────────────────────────────────────── */
  .atl-log-back{background:${pa};border-color:${Q};color:${le};}
  .atl-log-back:hover{border-color:${dt};color:${ze};background:${r.card};}
  .atl-log-title{color:${le};}

  /* ── krokovník ──────────────────────────────────────────────────────────────────────── */
  .atl-step{color:${q};}
  .atl-step b{background:rgba(122,90,42,0.45);border-color:${Q};color:#FFF;}
  .atl-step.done{color:${le};}
  .atl-step.done b{background:#8A5F1E;border-color:#6E4E18;color:#FFF;}
  /* ⚠️ Zlatý tint aktívneho kroku zanikol 28. 8. spolu so zlatým číslom — tento blok je
     v DOM POSLEDNÝ, takže by lapisový tint zo STEP_CSS ticho prebil a krok by ostal
     oranžový presne tam, kde ho Matej videl. Inkoust nesie lapis, nie papyrus. */
  .atl-step.on{${ke(C.edge,ne.lapis,.14)}}
  .atl-step.ok b{background:${de};border-color:#1F5C33;color:#FFF;}
  /* Krokovník NAD MAPOU: plná papyrusová výplň, nie priesvitná — nad mapou sa priesvitnosť
     nepoužíva nikdy, čo pod ňou prebliká, robí z lišty neprečítateľný prvok. */
  .atl-steps--onmap{background:linear-gradient(180deg,#F6EAD0,#E9D9AE);border:1.5px solid ${dt};box-shadow:0 8px 24px rgba(70,45,10,0.35);backdrop-filter:none;-webkit-backdrop-filter:none;}

  /* ── dlaždice výberu aktivity (krok 1) ──────────────────────────────────────────────── */
  .atl-tile{background:linear-gradient(160deg,${r.card} 0%,#F3E4C4 55%,#EAD6A6 100%);border:1px solid ${dt};box-shadow:${mo.lift};}
  .atl-tile:hover{background:linear-gradient(160deg,#FFFBF0 0%,#F6E9CF 55%,#EEDCB0 100%);border-color:${ze};box-shadow:0 0 0 3px rgba(201,154,63,0.26);}
  .atl-tile-label{color:${le};}
  .atl-tile-note{color:${q};}
  .atl-tile-caret{color:${q};}
  .atl-tile-tag{color:${ze};border-color:${Q};background:rgba(201,154,63,0.12);}
  /* ⚠️ OTVORENÁ DLAŽDICA SA V BLEDOM SKINE NEPREFARBUJE — je LAPISOVÁ zámerne (viď STEP_CSS).
     Do 27. 8. tu stáli tri svetlé prepisy (dlaždica, pásik, tlačidlá); po zmene by z lapisového
     bloku spravili papyrusový a stav by prestal byť vidieť. */
  /* Veta o aktivite je odteraz VETA, nie eyebrow — na papyruse ju číta človek, tak dostane
     plný inkoust. Stlmená (P_DIM) bola správna, kým to bol štítok „Zapisuješ, alebo plánuješ?". */
  /* ⚠️ Popisok v zátvorke si nesie vlastnú farbu (onDarkDim), takže sa NEDEDÍ z tlačidla —
     bez tohto riadku je na papyruse biely na svetlom, teda neviditeľný. Presne tá diera,
     kvôli ktorej sa každý nový prvok s vlastnou farbou musí doplniť aj sem. */

  /* ── polia a ovládanie formulára ────────────────────────────────────────────────────── */
  .atl-field label{color:${q};}
  .atl-ask{color:${le};}
  .atl-ask-sub{color:${q};}
  .atl-field-hint{color:${q};}
  /* Predpona .atl-companions: COMPANION_CSS sa vkladá NESKÔR v DOM, rovnaká váha by prehrala. */
  .atl-companions .atl-msug{background:${Ct};border-color:${Q};}
  .atl-companions .atl-msug button{color:${le};}
  .atl-companions .atl-msug-av{background-color:${pa};color:${le};}
  .atl-input,.atl-textarea{background:${Ct};border-color:${Q};color:${le};}
  .atl-input:focus{border-color:${dt};}
  .atl-input::placeholder{color:${q};opacity:.7;}
  .atl-diffbtn{background:${pa};border-color:${Q};color:${q};}
  /* ── VÝBER JE TINT, INKOUST TMAVÝ (Matej 2026-08-26, tretie kolo) ────────────────────
     „výbery chipov budú priesvitné, nie plné farby, aj ďalej pri označovaní náročnosti,
      tagov a podobne."
     Plná zelená sa sem dostala 26. 8. ráno preto, že tint mal SVETLÝ inkoust a na piesku
     zanikol. Chyba nebola v krytí, ale vo farbe písma — pickTintCSS dáva tmavý inkoust
     tej istej farby a plný farebný rám, takže chip drží váhu aj bez plnej výplne. */
  .atl-diffbtn.on{${ke(de,ne.green,.2)}}
  .atl-toggle-btn{background:${pa};border-color:${Q};color:${q};}
  .atl-toggle-btn.on{background:rgba(201,154,63,0.20);border-color:${ze};color:${le};}
  .atl-toggle-row > .atl-toggle-btn.on{${ke(de,ne.green,.2)}}
  .atl-daymode-ask{color:${r.inkWarm};}
  .atl-daymode-link{color:${r.inkWarm};}
  .atl-daycount{color:${r.inkWarm};}
  /* Na papyruse nesie čitateľnosť TMAVÝ inkoust, nie vyššie krytie výplne — to je celý
     dôvod, prečo sa 26. 8. ráno siahlo po plnej farbe a večer sa to vrátilo späť. */
  /* ⚠️ MODRÁ TU DRŽÍ RÁM A INKOUST, NIE VÝPLŇ — a je to zámer locku, nie nedoladenosť.
     Nad piesok (#E8DCBB) sa akákoľvek TMAVÁ farba pri 20 % krytia zmieša na teplú šedú:
     lapis #16307A dá (188,185,178), mapová modrá #2E5FD0 dá (191,193,192) — obe šedé.
     Vyskúšané 27. 8., preto to netreba skúšať znova: hue sa nedá zachrániť odtieňom,
     len vysokým krytím, a plná farba je vyhradená hlavnému CTA (lock 26. 8.). */
  .atl-odyssey{${ke(C.edge,ne.lapis,.2)}}
  .atl-daterange-hint{color:${q};}
  .atl-journey-link{color:${ze};}
  .atl-journey-list{border-color:${Q};}
  .atl-journey-item{background:${pa};border-color:${Q};}
  .atl-journey-item:hover{border-color:${ze};}
  .atl-journey-item.on{background:rgba(201,154,63,0.20);border-color:${ze};}
  .atl-journey-name{color:${le};}
  .atl-journey-meta{color:${q};}
  .atl-chip{background:${pa};border-color:${Q};color:${q};}
  .atl-chip.on{${ke(de,ne.green,.2)}}
  .atl-travel-btn{background:${pa};border-color:${Q};color:${q};}
  .atl-travel-btn:hover{border-color:${ze};}
  .atl-travel-btn.on{${ke(de,ne.green,.2)}}
  .atl-check{background:${pa};border-color:${Q};color:${q};}
  .atl-check b{border-color:${Q};}
  .atl-check.on{${ke(de,ne.green,.2)}}
  .atl-seats span{color:${q};}
  .atl-seats b{color:${le};}
  .atl-seats button{background:${Ct};border-color:${Q};color:${le};}
  .atl-seats button:hover{border-color:${ze};}
  /* Odistený chip mazania ostáva ČERVENÝ — je to jediná nevratná akcia v toku a farba
     nesie význam, nie štýl. Mení sa len inkoust, aby bol na svetlom čitateľný. */
  .atl-chip--del.armed{background:rgba(206,75,60,0.16);border-color:rgba(176,52,40,0.7);color:#8E2A20;}
  /* Dva rady chipov na papyruse — inkoust musí stmavnúť, inak zbalený rad na piesku zanikne
     (tá istá chyba, ktorá 26. 8. dotlačila výbery k plnej farbe). */
  .atl-morebtn{border-color:${Q};color:${q};}
  .atl-morebtn:hover{border-color:${dt};color:${ze};}
  .atl-more-body{border-top-color:${Q};}
  .atl-where{${ke(C.edge,ne.lapis,.14)}}
  .atl-where-btn{color:${C.ink};}
  .atl-file-btn{background:${Ct};border-color:${Q};color:${le};}
  .atl-file-btn:hover:not(:disabled){border-color:${ze};color:${ze};}
  .atl-photo-thumb{border-color:${Q};}
  .atl-cover-crop label{color:${q};}
  .atl-log-hint{color:${q};}
  .atl-log-error{color:#9E3A22;}
  .atl-dupwarn{background:rgba(201,154,63,0.14);border-color:${ze};}
  .atl-dupwarn p{color:${le};}
  /* ── V DOKU ŽIADNA DRUHÁ VRSTVA (Matej 2026-08-26) ─────────────────────────────────
     „na prvý pohľad vidno že je to otvorené, aktuálne je pod chipmi a tlačítkami akási
      spodná vrstva čo má inú farbu ako blok…. zmaž to nech má blok jedno pozadie."
     .atl-noteask--bar si podklad ruší už v STEP_CSS (v lište nad mapou by bola škatuľa
     v škatuli), lenže TENTO blok sa vkladá do DOM ako POSLEDNÝ a plošným selektorom
     mu ho vracal (plošný selektor). Preto výnimka — nie nový odtieň, ale žiadny. */
  .atl-noteask:not(.atl-noteask--bar){background:rgba(255,251,240,0.6);border-color:${Q};}
  .atl-noteask p{color:${le};}
  .atl-restore{background:rgba(255,251,240,0.6);border-color:${Q};}
  .atl-restore-txt{color:${le};}
  .atl-miss > label{color:#9E3A22;}
  .atl-draftwarn{background:rgba(206,75,60,0.12);border-color:rgba(176,52,40,0.8);}
  .atl-draftwarn b{color:#8E2A20;}
  .atl-draftwarn p{color:#6E2419;}
  .atl-rate{background:${Ct};border-color:${Q};}
  .atl-rate-val{color:${q};}
  .atl-rate-val.on{color:#8A5F1E;}
  .atl-steps-lock{color:${q};}
  .atl-expand{color:#8A5F1E;}
  .atl-expand:hover{color:${le};}

  /* ── sledovanie značiek (krok 2) ────────────────────────────────────────────────────── */
  /* ⚠️ VÝPLŇ A RÁM TROCH STAVOV SEM NEPATRIA — sú v STEP_CSS a sú na oboch povrchoch tie
     isté. Tu sa mení LEN inkoust (viď nižšie): tento blok sa vkladá do DOM POSLEDNÝ, takže
     čokoľvek, čo tu zdvojíš, ticho prebije opravu urobenú tam. */
  .atl-ntrack-i{background:${pa};border-color:${Q};color:${q};}
  .atl-ntrack-i b{background:rgba(201,154,63,0.18);color:${ze};}
  /* ⚠️ INKOUST TINTU SA NA PAPYRUSE OBRACIA. Tri stavy nesú v STEP_CSS priesvitnú výplň so
     SVETLÝM písmom (tmavý mobil); na piesku by svetlé písmo zaniklo, tak sa mení na tmavý
     odtieň tej istej farby. Výplň ani rám sa netýka — tie sú na oboch povrchoch tie isté,
     a to je celý zmysel tintu. */
  .atl-ntrack-i.on{color:${ne.lapis};}
  .atl-ntrack-i.on b{background:rgba(22,48,122,0.16);color:${ne.lapis};}
  .atl-ntrack-i.ok{color:${ne.green};}
  .atl-ntrack-i.ok b{background:rgba(61,122,78,0.16);color:${ne.green};}
  .atl-ntrack-i.ok .atl-ntrack-pts{background:rgba(61,122,78,0.22);color:${ne.green};}
  .atl-ntrack-i.miss{color:${ne.red};}
  .atl-ntrack-i.miss b{background:rgba(206,75,60,0.16);color:${ne.red};}
  .atl-ntrack-i.miss .atl-ntrack-pts{background:rgba(206,75,60,0.22);color:${ne.red};}

  /* ── potvrdenie odchodu z toku ──────────────────────────────────────────────────────── */
  /* Rozlúčka s AINUBISOM (.atl-abort--ainubis) sa ZÁMERNE nemení: je to jeho vlastný modrý
     povrch, rovnaký ako v konzole, a pale skin mapy naň nesiaha. */
  .atl-abort-scrim{background:rgba(24,14,4,0.55);}
  .atl-abort:not(.atl-abort--ainubis){background:linear-gradient(135deg,${r.card} 0%,#F2E2BD 100%);border:1.5px solid ${dt};box-shadow:${mo.panel};}
  .atl-abort:not(.atl-abort--ainubis) h2{color:${le};}
  .atl-abort:not(.atl-abort--ainubis) p{color:${q};}
  .atl-abort:not(.atl-abort--ainubis) .atl-abort-quit{background:rgba(176,52,40,0.14);border-color:rgba(176,52,40,0.65);color:#8E2A20;}
  .atl-abort:not(.atl-abort--ainubis) .atl-abort-quit:hover{background:rgba(176,52,40,0.26);color:#5E170F;}

  /* ── HLAVNÉ CTA JE LAPIS, NIE ZLATÉ (Matej 2026-08-26: „CTA oprav máme predsa modrú") ───
     ZAPÍSAŤ VÝLET, POKRAČOVAŤ aj HOTOVO v editore príbehu — všetky tri nesú .btn-gold.
     Na papyruse bola zlatá naraz rámom, doskou aj tlačidlom, takže hlavná akcia bola
     najsvetlejší prvok panela a splývala s tým, čo ju drží; to je dôvod, prečo LAPIS
     v redizajne /map vznikol (navGoldSkin.ts: „hlavné CTA"). Zlato ostáva na písme.
     ⚠️ NIE JE TO PORUŠENIE .btn-gold LOCKU — tvar (radius 8, šírka, Cinzel, papyrusový
     rám) sa nemení, mení sa výplň, a to len na bledom PC chrome mapy. Tmavý mobil aj zvyšok
     appky ostávajú zlaté; MAP_SKIN = 'glass' vráti zlatú aj sem. */
  .atl-log-foot .btn-gold,
  .atl-editor .btn-gold{background:${C.grad};border-color:${C.deep};color:${C.ink};box-shadow:${ct};}
  .atl-log-foot .btn-gold:hover:not(:disabled),
  .atl-editor .btn-gold:hover:not(:disabled){background:${C.gradHover};box-shadow:${ct};}

  /* ── lišta posúvania ────────────────────────────────────────────────────────────────── */
  .atl-log-body::-webkit-scrollbar,.atl-tiles::-webkit-scrollbar{width:8px;}
  .atl-log-body::-webkit-scrollbar-thumb,.atl-tiles::-webkit-scrollbar-thumb{background:rgba(179,130,45,0.42);border-radius:999px;}
  .atl-log-body::-webkit-scrollbar-track,.atl-tiles::-webkit-scrollbar-track{background:transparent;}
`;export{Jd as AddTripLog,Jd as default};
