import{u as De,g as Oe,n as Ie,r as o,l as ee,k as I,o as ge,j as t,p as ue,m as ie,L as Ue,q as xe,s as W,E as ne}from"./index-DriUOdZL.js";import{c as ye,a as be}from"./flowPaleSkin-CJNdyjt-.js";import{F as ke,a as ve}from"./flowMedallion-C1OBUhVP.js";import{F as We,a as Ne,R as te,L as je}from"./flowIntro-D58zEUeg.js";import{L as R}from"./labTheme-DLctEqJ2.js";import{h as Se}from"./hekthorFaces-myd4lVXL.js";import{r as Be}from"./flowSvorka-Ck3rYXr8.js";import{fillUrl as He}from"./cloudinaryService-CiRx-3N_.js";import{C as Ve}from"./CertificateCard-Chm-6PAW.js";import{b as Ge}from"./heroglyphCode-DlQZhGCv.js";import{V as Ke}from"./VerticalHeroglyphFrame-DdOJsB1O.js";import{H as Je}from"./HeroglyphFrame-F7m3K15S.js";import{S as Ye}from"./ShareCard-E_0TttVq.js";import{c as qe,w as Xe,u as Ze}from"./welcomeText-BqRoTefh.js";import{m as x}from"./proxy-5uIz4xGy.js";import{A as Qe}from"./index-BPi12Ps7.js";import"./initialLetter-CIe-_dtl.js";import"./breeds-DONRU28-.js";import"./CHARACTER-WATERLOVER-Be2FY-gi.js";import"./RankingSlot-B9f52iXE.js";import"./NUMBER-11-BoEzuCvn.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";import"./countryGeo-BNEVCU3g.js";import"./flagUrl-B21iQI9I.js";import"./index-DgflUIXX.js";function ae(){return{href:"/pack",store:!1}}const et=1400;function tt(a,m=!1){const f=I(),y=o.useMemo(()=>Be().map((s,p)=>({id:s.flowId,name:s.dogName||"",photo:s.photo||"",n:a?null:m?f.guestNumbers[f.guestIds[s.flowId]]??null:73+p,glyph:""})),[]),[b,E]=o.useState(y),[_,d]=o.useState(f.ownerName||""),[z,g]=o.useState(f.email||""),[n,C]=o.useState(null),[k,w]=o.useState(!1);return o.useEffect(()=>{if(a||!m||!Object.values(I.getState().guestIds).length||!y.some(p=>p.n==null))return;let s=!0;return fetch(`${ne}/get-grid-dogs?tiers=all`).then(p=>p.ok?p.json():[]).then(p=>{if(!s||!Array.isArray(p))return;const v=new Map(p.filter(r=>r.wall_id&&r.pack_number!=null).map(r=>[r.wall_id,r.pack_number])),A=I.getState().guestIds;E(r=>r.map(M=>M.n==null&&v.has(A[M.id])?{...M,n:v.get(A[M.id])}:M))}).catch(()=>null),()=>{s=!1}},[]),o.useEffect(()=>{if(!a)return;let c=!0;const s=[1e3,2e3,4e3,8e3,15e3],p=async v=>{try{const A=await fetch(`${ne}/get-session-data?session_id=${a}`);if(!A.ok)throw new Error(`HTTP ${A.status}`);const r=await A.json();if(!r.dogName)throw new Error("empty session data");if(!c)return;C(r),d(r.ownerName||""),g(f.email||r.email||"");const M=Array.isArray(r.dogs)&&r.dogs.length?r.dogs.map(N=>({id:String(N.id),name:String(N.dogName||""),photo:String(N.dogPhotoUrl||""),n:typeof N.packNumber=="number"?N.packNumber:null,glyph:String(N.heroglyphPngUrl||""),selections:N.selections||void 0,patronSvg:String(N.patronSvg||"")})):[{id:"main",name:r.dogName,photo:r.dogPhotoUrl||"",n:typeof r.packNumber=="number"?r.packNumber:null,glyph:""}];E(M),M.some(N=>N.n==null)&&v<s.length?setTimeout(()=>{c&&p(v+1)},s[v]):w(!0)}catch(A){if(!c)return;v<s.length?setTimeout(()=>{c&&p(v+1)},s[v]):(console.error("[flow-welcome] get-session-data failed:",A),w(!0))}};return p(0),()=>{c=!1}},[a]),{dogs:b,owner:_,email:z,session:n,settled:k}}function at(a,m,f=!1,y=!1){const[b,E]=o.useState(null),_=a??(y?Number.MAX_SAFE_INTEGER:null);return o.useEffect(()=>{if(_==null)return;let d=!0;return fetch(`${ne}/get-grid-dogs?tiers=all`).then(z=>z.ok?z.json():[]).then(z=>{if(!d)return;const g=z.filter(n=>n.pack_number!=null&&n.pack_number<_).sort((n,C)=>n.pack_number-C.pack_number).slice(-m).map(n=>({n:n.pack_number,name:n.dog_name||"",photo:n.cloudinary_main_url||""}));if(g.length<m&&!g.some(n=>n.n===1)&&g.unshift({n:1,name:"HEKTHOR",photo:"/images/hektor-grid.webp"}),f&&g.length<m){const n=["BRUNO","LUNA","MAX","BELLA","ROCKY","NELA","ARGO","KIRA","BOBO","DAISY","RÉX","MIA"],C=new Set(g.map(c=>c.n)),k=[];for(let c=_-1;c>1&&k.length+g.length<m;c--)C.has(c)||k.unshift({n:c,name:n[c%n.length],photo:""});const w=[...g,...k].sort((c,s)=>c.n-s.n).slice(-m);E(w);return}E(g)}).catch(()=>{d&&E([])}),()=>{d=!1}},[_,m,f]),b}const it=a=>a?He(a,96,96)||a:"",$e=({src:a})=>t.jsx("span",{className:"wl-ph",children:a&&t.jsx("img",{src:it(a),alt:"",onError:m=>{m.currentTarget.style.display="none"}})}),O=qe;function Ft(){var we;const a=De(),m=Xe(a),f=Oe(),[y]=Ie(),b=y.get("session_id"),E=y.get("rank"),_=E&&["akolyta","knaz","vezir","farao"].includes(E)?E:null,d=!b&&(y.has("free")||!!_),z=y.get("vstupne");o.useEffect(()=>{z&&/^cs_(test|live)_/.test(z)&&ee("vstupne_paid_return")},[z]);const g=I(e=>e.guestIds),{dogs:n,owner:C,email:k,session:w,settled:c}=tt(b,d),s=typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,[p,v]=o.useState(s?"rank":"hero"),r=[(C||"").trim().split(/\s+/)[0]||"",...n.map(e=>e.name)].filter(Boolean),M=a("heroglyph.flow.welcomeNew.and"),N=a("heroglyph.flow.welcomeNew.hi"),oe=(r.length>1?`${r.slice(0,-1).join(a("heroglyph.flow.listSep"))}${M}${r[r.length-1]}`:r[0]||"")+"!",le=Math.min(4200,Math.round((te+(N+oe).length*je+1.6)*1e3));o.useEffect(()=>{if(p!=="hero")return;const e=window.setTimeout(()=>v("rank"),le);return()=>window.clearTimeout(e)},[p,le]);const re=o.useMemo(()=>{if(typeof window>"u")return 240;const e=Math.min(window.innerWidth,640)*.72,i=window.innerHeight*.4;return Math.round(Math.max(148,Math.min(320,Math.min(e,i))))},[]),P=((we=n[0])==null?void 0:we.n)??null,j=at(P,12,!1,d),ze=o.useMemo(()=>{if(typeof window>"u")return 4;const e=window.innerWidth<=600,i=e?56:64,h=(n.length>=4?e?56:60:e?64:72)*n.length;return Math.max(1,Math.min(10,Math.floor((window.innerHeight*.5-h)/i)))},[n.length]),se=o.useRef(null),[Ae,H]=o.useState(0),[V,G]=o.useState(0),U=Math.max(0,Math.min((j==null?void 0:j.length)??0,ze)-Ae);o.useLayoutEffect(()=>{if(p!=="rank"||j==null)return;const e=se.current;!e||e.scrollHeight-e.clientHeight<=1||(U>1?H(i=>i+1):V<2?G(i=>i+1):U>0?H(i=>i+1):V<3&&G(3))}),o.useEffect(()=>{const e=()=>{H(0),G(0)};return window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[]);const[pe,Ce]=o.useState(!1),[u,_e]=o.useState(!1);o.useEffect(()=>{if(p!=="rank"||j==null)return;const e=window.setTimeout(()=>Ce(!0),400+j.length*180),i=window.setTimeout(()=>_e(!0),400+j.length*180+1500);return()=>{window.clearTimeout(e),window.clearTimeout(i)}},[p,j]);const[K,Me]=o.useState({}),[Te,Fe]=o.useState({}),[J,Y]=o.useState(0),ce=(w==null?void 0:w.selections)||{};o.useEffect(()=>{d&&ge()},[d]),o.useEffect(()=>{if(!w)return;ge();const e=I.getState(),i=w;i.dogName&&e.dogName!==i.dogName&&e.setDogName(i.dogName),i.ownerName&&e.ownerName!==i.ownerName&&e.setOwnerName(i.ownerName),i.dogPhotoUrl&&e.dogPhotoUrl!==i.dogPhotoUrl&&e.setDogPhotoUrl(i.dogPhotoUrl),i.patronSvg&&e.patronSvg!==i.patronSvg&&e.setPatronSvg(i.patronSvg),Object.entries(ce).forEach(([h,F])=>{typeof F=="string"&&e.setSelection(h,F)})},[w]);const q=!!b&&(!!w&&n.every(e=>e.n!=null)||c),S=q?n[J]:void 0;o.useEffect(()=>{S&&S.n==null&&Y(e=>e+1)},[S]),o.useEffect(()=>{if(!S)return;const e=S.id,i=window.setTimeout(()=>Y(h=>{var F;return((F=n[h])==null?void 0:F.id)===e?h+1:h}),25e3);return()=>window.clearTimeout(i)},[S]),n[0]&&K[n[0].id];const de=P!=null||c||d,X=!b||q&&J>=n.length,[$,Re]=o.useState(0);o.useEffect(()=>{if(!u)return;const e=[!0,de,X,!0][$]??!0;if($>=4||!e)return;const i=window.setTimeout(()=>Re(h=>h===2||d&&h===1?4:h+1),$===0?200:et);return()=>window.clearTimeout(i)},[u,$,de,X,d]);const he=o.useRef(!1);o.useEffect(()=>{he.current||!b||P==null||(he.current=!0,ee("purchase_completed",{pack_number:P,dogs:n.length}))},[b,P,n.length]);const me=()=>{const[e,...i]=n;if(!e)return f("/");if(d&&e.n==null)return f(g[e.id]?`/hall?dog=${g[e.id]}`:"/hall");const h=new URLSearchParams({reveal:"true",dogName:e.name,packNumber:String(e.n??0)});e.photo&&h.set("photoUrl",e.photo);const F=K[e.id]||e.glyph||"";F&&h.set("heroglyphUrl",F);const fe=Te[e.id]||"";fe&&h.set("heroglyphVUrl",fe),i.length&&h.set("queue",JSON.stringify(i.map(D=>({n:D.n??0,name:D.name,photo:D.photo,glyph:K[D.id]||D.glyph})))),f(`/hall?${h.toString()}`)},[L,Pe]=o.useState(!1),Z=X;o.useEffect(()=>{L&&Z&&me()},[L,Z]);const Q=Math.max(n.reduce((e,i)=>Math.max(e,i.n??0),0),d?(j??[]).reduce((e,i)=>Math.max(e,i.n),0):0),Le=Math.max(2,Math.min(100,Q/1e6*100)),T=n.some(e=>e.name)?null:b?c?"failed":"loading":"empty";return T?t.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[t.jsxs("style",{children:[ye,be,ke,ue,Ee]}),t.jsx("div",{className:"hf-stage wl-page",children:t.jsx("div",{className:"w-full max-w-xl flex flex-col items-center wl-state-wrap",children:t.jsxs(x.div,{className:"wl-state",initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{duration:.4},"aria-busy":T==="loading",children:[t.jsx("span",{className:"hf-medin",children:t.jsx(ve,{src:Se("welcome"),size:re,className:"hf-medal"})}),t.jsx("h2",{className:"wl-state-h",children:T==="loading"?O(a("welcome.cta.preparing")).toLowerCase().replace(/^./,e=>e.toUpperCase()):T==="failed"?m("heroglyph.flow.welcomeState.failedTitle","We could not load your entry"):m("heroglyph.flow.welcomeState.emptyTitle","There is nothing to show here yet")}),T!=="loading"&&t.jsx("p",{className:"wl-state-p",children:T==="failed"?m("heroglyph.flow.welcomeState.failedSub","Reload the page in a moment. The link to your profile is also in your e-mail."):m("heroglyph.flow.welcomeState.emptySub","This page opens after you join. Start with your dog and your heroglyph.")}),T==="loading"&&t.jsxs("span",{className:"wl-state-dots","aria-hidden":!0,children:[t.jsx("i",{}),t.jsx("i",{}),t.jsx("i",{})]}),T!=="loading"&&t.jsx("button",{type:"button",className:"pk-b3 pk-b3--lapis wl-cta",onClick:()=>T==="failed"?window.location.reload():f("/heroglyph"),children:T==="failed"?m("heroglyph.flow.welcomeState.retry","Try again"):a("wall.hero.cta")})]})})})]}):t.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[t.jsxs("style",{children:[ye,be,ke,We,ue,Ee]}),t.jsx("div",{className:`hf-stage wl-page wl-tight-${V}`,ref:se,children:t.jsx("div",{className:"w-full max-w-xl flex flex-col items-center",children:t.jsx(Qe,{mode:"wait",children:p==="hero"?t.jsxs(x.button,{type:"button",className:"wl-hero",onClick:()=>v("rank"),initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,scale:.96,y:-16},transition:{duration:.4},children:[t.jsx("span",{className:"hf-medin",children:t.jsx(ve,{src:Se("welcome"),size:re,className:"hf-medal"})}),t.jsxs("span",{className:"wl-hero-h",children:[t.jsx(Ne,{text:N,from:te}),t.jsx("span",{className:"wl-br","aria-hidden":!0}),t.jsx(Ne,{text:oe,from:te+N.length*je,bold:!0})]})]},"hero"):t.jsx(x.div,{className:"wl-stack",initial:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{duration:.4},children:t.jsxs("div",{className:"hf-plate",children:[t.jsxs("div",{className:"wl-rank",children:[t.jsx("div",{className:"wl-prev",children:(j??[]).slice(j&&U?-U:(j==null?void 0:j.length)??0).map((e,i)=>t.jsxs(x.div,{className:`wl-row is-prev${pe?" is-blur":""}`,initial:{opacity:0,y:64},animate:{opacity:1,y:0},transition:{delay:.15+i*.18,duration:.45,ease:"easeOut"},children:[t.jsx($e,{src:e.photo}),t.jsx("span",{className:"wl-name",children:e.name}),t.jsxs("span",{className:"wl-num",children:["#",e.n]})]},`p${e.n}`))}),pe&&n.map((e,i)=>t.jsxs(x.div,{className:`wl-row is-new${u?" is-joined":""}${n.length>=4?" is-many":""}`,initial:{opacity:0,scale:1.18,y:24},animate:u?{opacity:1,scale:1,y:0}:{opacity:1,scale:1.12,y:0},transition:{delay:u?0:i*.35,duration:.6,ease:[.2,.8,.3,1]},children:[t.jsx($e,{src:e.photo}),t.jsx("span",{className:"wl-name",children:e.name}),t.jsx("span",{className:"wl-num",children:e.n!=null?`#${e.n}`:""})]},`n${e.id}`))]}),t.jsxs("div",{className:"wl-foot",children:[t.jsxs("div",{className:"wl-foot-top",children:[t.jsxs("div",{className:"wl-lines","aria-live":"polite",children:[$>=1&&$<3&&t.jsx(x.p,{className:"wl-line",initial:{opacity:0,y:6},animate:{opacity:1,y:0},children:O(a("heroglyph.flow.welcomeNew.l1"))}),$===2&&t.jsxs(x.p,{className:"wl-line",initial:{opacity:0,y:6},animate:{opacity:1,y:0},children:[O(a("heroglyph.flow.welcomeNew.l2")),n.length>1&&q?` ${Math.min(J+1,n.length)}/${n.length}`:""]}),$>=4&&t.jsx(x.p,{className:"wl-thanks",initial:{opacity:0,y:6},animate:{opacity:1,y:0},transition:{duration:.5},children:a("heroglyph.flow.welcomeNew.l4")})]}),t.jsxs(x.div,{className:"wl-goal",initial:!1,animate:{opacity:$>=4?1:0},transition:{delay:.4},children:[t.jsx("div",{className:"wl-bar",role:"progressbar","aria-valuemin":0,"aria-valuemax":1e6,"aria-valuenow":Q,children:t.jsx(x.span,{initial:{width:0},animate:{width:$>=4?`${Le}%`:0},transition:{delay:.6,duration:1.2,ease:"easeOut"}})}),t.jsx("span",{className:"wl-goal-t",children:a("heroglyph.flow.welcomeNew.goal",{n:Q.toLocaleString("sk-SK")})})]})]}),t.jsx(x.p,{className:"hf-legend wl-rule","aria-hidden":!0,initial:!1,animate:{opacity:$>=4?1:0},transition:{delay:.9,duration:.5}}),t.jsxs(x.div,{className:"wl-seal",initial:!1,animate:{opacity:$>=4?1:0,scale:$>=4?1:.9},transition:{delay:1.1,duration:.5},children:[t.jsx("img",{src:"/images/peciat-dogypt-360.webp",alt:"","aria-hidden":!0}),t.jsx("span",{className:"wl-motto",children:a("religion.book.trust")})]}),u&&d&&t.jsx(x.p,{className:"wl-mail",initial:{opacity:0,y:6},animate:{opacity:1,y:0},transition:{delay:.3,duration:.4},children:t.jsxs("span",{children:[a("heroglyph.flow.welcomeFree.howIn"),k&&t.jsxs(t.Fragment,{children:[" ",t.jsx("span",{className:"wl-mail-addr",children:k})]})]})}),u&&!d&&t.jsxs(x.p,{className:"wl-mail",initial:{opacity:0,y:6},animate:{opacity:1,y:0},transition:{delay:.3,duration:.4},children:[t.jsx("b",{children:a("heroglyph.flow.welcomeNew.mail")}),k&&t.jsx("span",{className:"wl-mail-addr",children:k}),t.jsx("span",{children:O(a("heroglyph.flow.welcomeNew.mailBtn"))})]}),d?t.jsx(x.a,{className:"pk-b3 pk-b3--lapis wl-cta",href:ae().href,onClick:e=>{ee("flow_end_app",{store:ae().store}),e.preventDefault(),f(ae().href)},initial:!1,animate:{opacity:u?1:0,y:u?0:8},transition:{delay:u?.3:0,duration:.4},style:{visibility:u?"visible":"hidden"},children:a("heroglyph.flow.welcomeFree.ctaApp")}):t.jsx(x.button,{type:"button",className:"pk-b3 pk-b3--lapis wl-cta",onClick:()=>Z?me():Pe(!0),disabled:!u||L,"aria-busy":L,initial:!1,animate:{opacity:u?1:0,y:u?0:8},transition:{delay:u?.3:0,duration:.4},style:{visibility:u?"visible":"hidden"},children:L?O(a("heroglyph.flow.welcomeNew.ctaWait")):a("heroglyph.flow.welcomeNew.cta")})]})]})},"rank")})})}),S&&S.n!=null&&t.jsx(nt,{dog:S,sessionId:b,email:k,owner:C,fallbackSelections:ce,fallbackPatron:String((w==null?void 0:w.patronSvg)||""),onGlyph:e=>Me(i=>({...i,[S.id]:e})),onGlyphV:e=>Fe(i=>({...i,[S.id]:e})),onDone:()=>{const e=S.id;Y(i=>{var h;return((h=n[i])==null?void 0:h.id)===e?i+1:i})}},S.id)]})}function nt({dog:a,sessionId:m,email:f,owner:y,fallbackSelections:b,fallbackPatron:E,onGlyph:_,onGlyphV:d,onDone:z}){const g=o.useRef(null),n=o.useRef(null),C=o.useRef(null),k=o.useRef(null),[w,c]=o.useState(""),s=a.selections&&Object.keys(a.selections).length?a.selections:b,p=a.patronSvg||E,v=/^[0-9a-f-]{36}$/i.test(a.id)?a.id:void 0;return Ze({email:f,dogName:a.name,ownerName:y,dogPhotoUrl:a.photo,sessionId:m,packNumber:a.n,certRef:g,verticalRef:n,horizontalRef:C,shareRef:k,dogId:v,onHeroglyphReady:A=>{c(A),_(A)},onHeroglyphVReady:d,onDone:()=>z()}),t.jsxs("div",{"aria-hidden":"true",translate:"no",className:"notranslate",style:{position:"fixed",left:-1e4,top:0,pointerEvents:"none",opacity:1},children:[t.jsx("div",{ref:g,children:t.jsx(Ve,{dogName:a.name,ownerName:y,photoUrl:a.photo,heroglyphCode:Ge({dogName:a.name,ownerName:y,patronSvg:p,breed:s.breed,patronCategory:s.patronCategory,country:s.country||s.ownerCountry,selections:s}),certNumber:a.n!=null?`#${a.n}`:"",issuedDate:new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})})}),t.jsx("div",{ref:n,style:{width:800,height:1131,background:"transparent",color:"#000"},children:t.jsx(Ke,{data:{selections:s,ownerName:y,patronSvg:p}})}),t.jsx("div",{ref:C,style:{width:1200,height:321,background:"transparent",color:"#000"},children:t.jsx(Je,{showOwner:!0,dogValues:{...s,patronSvg:p}})}),t.jsx("div",{ref:k,children:w&&a.n!=null&&t.jsx(Ye,{packNumber:a.n,dogName:a.name,photoUrl:a.photo,heroglyphUrl:w})})]})}const l="html[data-flow-p3d] .hf-pale .wl-page",B="'LT Museum', 'Cinzel', serif",ot="'Cinzel Decorative', 'Cinzel', serif",lt=`
/* Poradie leží na celej obrazovke (15. 11. 2026: heroflow nie je v blokoch) — bez karty, výška počíta aj horný vzduch javiska (40 px). */
${l} .wl-stack.hf-block, ${l} .wl-stack { background: none !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; min-height: min(calc(100dvh - 72px), 900px); }
@media (min-width: 768px) { ${l} .wl-stack { min-height: min(calc(100dvh - 64px), 900px); } }
${l} .wl-stack .hf-plate { padding: 0 !important; }

/* Riadky psov: obrys, papyrus, fotka v jamke. Meno psa je identita (Decorative), číslo UI. */
${l} .wl-row { border: 2.5px solid var(--p3d-ink); border-radius: ${ie.card}px; background: var(--p3d-paper-hi); box-shadow: none; }
${l} .wl-row.is-new { border-color: var(--p3d-gold); background: #FFFBF1; }
${l} .wl-ph { border: 2px solid var(--p3d-ink); background: color-mix(in srgb, var(--p3d-gold) 26%, var(--p3d-paper)); box-shadow: none; }
${l} .wl-row.is-new .wl-ph { box-shadow: none; }
${l} .wl-name { font-family: ${ot} !important; font-weight: 700; color: var(--p3d-ink); }
${l} .wl-num { font-family: 'Space Grotesk', sans-serif !important; font-weight: 700; color: var(--p3d-ink); }
${l} .wl-row.is-new .wl-num { color: var(--p3d-gold-ink); }

/* Vety, poďakovanie, motto */
${l} .wl-line { font-weight: 500; color: var(--p3d-ink); }
${l} .wl-thanks, ${l} .wl-motto { font-family: ${B} !important; font-weight: 900; text-transform: none; }
${l} .wl-thanks { color: var(--p3d-ink); }
${l} .wl-motto { color: var(--p3d-gold-ink); letter-spacing: .06em; text-transform: uppercase; }
${l} .wl-mail, ${l} .wl-mail span { color: var(--p3d-ink); }
${l} .wl-goal-t { font-weight: 600; color: var(--p3d-ink); }
${l} .wl-rule { opacity: 1; }

/* Progres k 1M: hrubá pilulka s obrysom, zlatá výplň (ako .fp-track) */
${l} .wl-bar { box-sizing: border-box; height: 16px; border: 2.5px solid var(--p3d-ink); background: var(--p3d-paper-hi); box-shadow: var(--p3d-inset), 0 3px 0 var(--p3d-gold-solid); }
${l} .wl-bar > span { background: linear-gradient(180deg, #FFE27A 0%, #F5C73D 50%, #E69E1A 100%); border-right: 2.5px solid var(--p3d-ink); box-sizing: border-box; }

/* Hektorov príchod = celá obrazovka, bez karty */
${l} .wl-hero { background: none; color: var(--p3d-ink); border: 0; border-radius: 0; box-shadow: none; }
${l} .wl-hero-h { font-family: ${B} !important; font-weight: 900; color: var(--p3d-ink); text-transform: none; letter-spacing: .01em; }
${l} .wl-hero-h .hf-letter { font-family: ${B} !important; font-weight: 900; color: var(--p3d-ink) !important; }
${l} .wl-hero-h .hf-letter.text-amber-300 { color: var(--p3d-gold-ink) !important; }

/* STAVY BEZ PSA: načítavanie, chyba, prázdna adresa */
${l} .wl-state-wrap { margin: auto 0; }
.wl-state {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: ${W.lg}px; text-align: center;
  padding: ${W.xl}px ${W.lg}px;
}
${l} .wl-state-h { margin: 0; font-family: ${B} !important; font-weight: 900; font-size: 24px; line-height: 1.2; color: var(--p3d-ink); text-transform: none; letter-spacing: .01em; text-wrap: balance; }
${l} .wl-state-p { margin: 0; max-width: 360px; font-size: 16px; line-height: 1.4; font-weight: 500; color: var(--p3d-ink); }
.wl-state .wl-cta { max-width: 360px; }
.wl-state-dots { display: flex; gap: ${W.sm}px; }
.wl-state-dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--p3d-gold); border: 2px solid var(--p3d-ink); animation: wl-dot 1s ease-in-out infinite; }
.wl-state-dots i:nth-child(2) { animation-delay: .15s; } .wl-state-dots i:nth-child(3) { animation-delay: .3s; }
@keyframes wl-dot { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-6px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .wl-state-dots i { animation: none; } }
@media (max-height: 700px) { ${l} .wl-state .hf-medin .fm { width: 96px !important; height: 96px !important; } }
`,Ee=`
/* ── HEKTOR — veľká bublina ako príchod ODHALENIA ── */
.wl-hero {
  width: 100%; container-type: inline-size; cursor: pointer; border: none;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 32px 16px; border-radius: 16px; text-align: center;
  background: var(--brand-gradient); color: #FAF4EC;
}
.wl-hero-h { font-family: 'Cinzel', serif; font-weight: 700; line-height: 1.25; font-size: clamp(20px, min(7cqw, 4.4dvh), 32px); }
.wl-br { display: block; height: 0; }

/* ── PORADIE — doska na celú výšku, poradie berie zvyšok ── */
.wl-stack { width: 100%; margin-top: 0; display: flex; flex-direction: column; min-height: min(calc(100dvh - 32px), 900px); }
@media (min-width: 768px) { .wl-stack { min-height: min(calc(100dvh - 48px), 900px); } }
.wl-stack .hf-plate { gap: 16px; flex: 1; min-height: 0; }
.wl-rank {
  flex: none;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; padding: 0 4px 12px;
}
.wl-prev {
  overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; padding-top: 8px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
          mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
}
.wl-row { flex: none; }
.wl-foot { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 16px; }
.wl-foot-top { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.wl-rule { gap: 0; }
.wl-seal { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.wl-seal img { width: clamp(72px, 18dvh, 160px); height: auto; aspect-ratio: 1; object-fit: contain; transform: rotate(-5deg); filter: drop-shadow(0 6px 12px rgba(60, 40, 10, 0.35)); }
.wl-motto { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .14em; text-transform: uppercase; color: ${R.goldInk}; }
.wl-row {
  display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 12px;
  height: 56px; padding: 0 16px 0 8px; border-radius: ${ie.pill}px;
  border: 1.5px solid rgba(120, 86, 26, 0.45); background: rgba(255, 250, 238, 0.55);
  font-family: 'Space Grotesk', sans-serif; color: ${R.ink};
  transition: filter .6s ease, opacity .6s ease;
}
.wl-row.is-prev.is-blur { filter: blur(1.6px); opacity: .5; }
.wl-ph { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: rgba(120, 86, 26, 0.18); }
.wl-ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wl-name { font-size: 16px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wl-num { font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .04em; }
/* NOVÝ PES: zažiari, zapulzuje, zaradí sa — a ŽIARI ĎALEJ, kým sa neťukne na CTA
   (Matej 26. 9.: *„musí mať krajšiu a výraznejšiu animáciu… aj v kľudnom stave"*).
   Tri vrstvy: pulzujúca zlatá žiara (box-shadow) · lesk, ktorý prebehne blokom ·
   rám, ktorý dýcha medzi brandovou zlatou a svetlou. */
.wl-row.is-new {
  position: relative; overflow: hidden;
  height: 64px; grid-template-columns: 48px 1fr auto;
  background: #FFFBF1; border: 2px solid #C99A3F;
  animation: wl-pulse 1s ease-in-out infinite;
}
.wl-row.is-new::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255, 244, 205, 0.95) 50%, transparent 62%);
  background-size: 260% 100%; background-position: 130% 0;
  animation: wl-sheen 2.6s ease-in-out infinite;
}
.wl-row.is-new > * { position: relative; z-index: 1; }
.wl-row.is-new .wl-ph { width: 48px; height: 48px; box-shadow: 0 0 0 2px #C99A3F; }
.wl-row.is-new .wl-name { font-family: 'Cinzel Decorative', 'Cinzel', serif; font-weight: 700; font-size: 20px; }
.wl-row.is-new .wl-num { font-size: 20px; color: ${R.goldInk}; }
.wl-row.is-new.is-joined { animation: wl-glow 2.2s ease-in-out infinite; }
/* Ústup pri pretečení (wl-tight-N na javisku, N rastie). */
.wl-tight-1 .wl-seal img, .wl-tight-2 .wl-seal img { width: clamp(48px, 8dvh, 72px); }
.wl-tight-2 .wl-row, .wl-tight-3 .wl-row { height: 44px; }
.wl-tight-2 .wl-row.is-new, .wl-tight-3 .wl-row.is-new { height: 48px; }
.wl-tight-2 .hf-plate, .wl-tight-3 .hf-plate { gap: 12px; }
.wl-tight-2 .wl-foot, .wl-tight-3 .wl-foot { gap: 8px; }
.wl-tight-3 .wl-seal img { display: none; }
/* 4+ psov: riadky ustúpia, aby sa svorka zmestila bez scrollu. */
.wl-row.is-new.is-many { height: 56px; grid-template-columns: 40px 1fr auto; }
.wl-row.is-new.is-many .wl-ph { width: 40px; height: 40px; }
.wl-row.is-new.is-many .wl-name, .wl-row.is-new.is-many .wl-num { font-size: 16px; }
@keyframes wl-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 154, 63, 0.35), 0 0 24px 6px rgba(255, 206, 100, 0.6); }
  50% { box-shadow: 0 0 0 10px rgba(201, 154, 63, 0), 0 0 56px 18px rgba(255, 206, 100, 0.95); }
}
@keyframes wl-glow {
  0%, 100% { border-color: #C99A3F; box-shadow: 0 0 0 0 rgba(201, 154, 63, 0.45), 0 0 20px 4px rgba(255, 206, 100, 0.55); }
  50% { border-color: #F2CF7A; box-shadow: 0 0 0 6px rgba(201, 154, 63, 0), 0 0 44px 14px rgba(255, 206, 100, 0.9); }
}
@keyframes wl-sheen { 0% { background-position: 130% 0; } 55%, 100% { background-position: -30% 0; } }
@media (prefers-reduced-motion: reduce) {
  .wl-row.is-new, .wl-row.is-new.is-joined { animation: none; box-shadow: 0 0 28px 6px rgba(255, 206, 100, 0.7); }
  .wl-row.is-new::after { animation: none; opacity: 0; }
}

/* ── VETY — groteskom (Matej 26. 9.) ── */
.wl-lines { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 60px; }
.wl-line { margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 16px; line-height: 1.35; color: ${R.inkBody}; text-align: center; }
.wl-line.is-done { color: #3D7A4E; font-weight: 600; font-size: 20px; }
.wl-thanks { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 20px; line-height: 1.3; letter-spacing: .04em; color: ${R.ink}; text-align: center; text-wrap: balance; }
.wl-mail { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.4; color: ${R.inkBody}; text-align: center; }
.wl-mail b { font-weight: 600; font-size: 16px; color: ${R.ink}; }
.wl-mail-addr { font-weight: 600; overflow-wrap: anywhere; }
.wl-goal { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.wl-bar { width: 100%; height: 12px; border-radius: ${ie.pill}px; background: rgba(22, 48, 122, 0.16); overflow: hidden; }
.wl-bar > span { display: block; height: 100%; border-radius: inherit; background: ${Ue.grad}; }
.wl-goal-t { font-family: 'Space Grotesk', sans-serif; font-size: 12px; letter-spacing: .08em; color: ${R.inkBody}; }
.wl-cta { width: 100%; height: 52px; font-weight: 900; }
/* Na celú obrazovku (\`FLOW_FULL\`) stráži javisko miesto pre pripnuté CTA (104 px) — Vitaj ho nepripína, CTA je v toku,
   a \`.wl-stack\` si výšku počíta sám. Bez tohto pretiekol o presne tých 104 px a ústup zhodil celé poradie. */
html[data-flow-full] .hf-pale .hf-stage.wl-page { padding-bottom: ${xe.min}px; }
@media (min-width: 768px) { html[data-flow-full] .hf-pale .hf-stage.wl-page { padding-bottom: ${xe.md}px; } }
@media (max-width: 600px) {
  .wl-row { height: 48px; } .wl-row.is-new { height: 56px; } .wl-row.is-new.is-many { height: 48px; }
  .wl-name { font-size: 14px; } .wl-row.is-new .wl-name, .wl-row.is-new .wl-num { font-size: 16px; }
  .wl-line { font-size: 14px; } .wl-line.is-done, .wl-thanks { font-size: 16px; }
}
@media (max-height: 700px) {
  .wl-rank { gap: 6px; } .wl-row { height: 44px; } .wl-row.is-new { height: 52px; }
  .wl-stack .hf-plate { gap: 12px; }
  .wl-foot { gap: 8px; } .wl-lines { min-height: 48px; }
}
${lt}
`;export{Ft as FlowWelcomeScreen};
