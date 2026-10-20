import{u as H,f as U,l as Y,r as j,j as e,Y as q,aJ as V,F as t,J as u,O as d,P as Z,K as E,k as N,Q as T,af as P,L as z,U as J,b as Q,W as X,d as S,D as ee,i as te}from"./index-B-BQrD2y.js";import{P as ie}from"./PackLayout-CGhWU_Yk.js";import{B as ae}from"./BackButton-XC1Pn_3O.js";import{R as L}from"./RightGate-zty8MLC_.js";import{B as M}from"./BrandIcon-Cj2cTb6H.js";import{b as se}from"./HandIcons-nK6bMixK.js";import{L as ne,m as _,D as K,f as oe,B as le,s as de,a as re}from"./dogIdModules-D7bMwhlu.js";import{o as me,r as pe,h as R}from"./dogEvents-O4Dj4HRt.js";import{l as ce}from"./packDogsList-BLfpB1x_.js";import"./magnetPreview-CvEjQVpP.js";import"./ainubisSkin-B7Z96MPq.js";import"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./cloudinaryService-BTfH_t1m.js";import"./dogRights-BhKk5QOi.js";import"./ainubisBus-BMRzmB2O.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Ch81E6FO.js";import"./client-rJzPTh-q.js";import"./tslib.es6-CmEaCU22.js";import"./devMockDogs-BzGWz4qV.js";import"./pawmateRights-CWmFDd90.js";import"./tripShared-DMsMy27X.js";import"./countryGeo-BaPfaSrG.js";import"./packStore-DJ0be3Fh.js";import"./addTripModel-BuQrZHBF.js";import"./wizAnchors-E3ARHgZI.js";import"./consent-DRIYVBQY.js";import"./use-toast-NWTrH8M9.js";import"./handArrowLeft-DN9pj_cL.js";import"./dogQuiz-DTCKwKwf.js";import"./packProfile-C55E2wZh.js";import"./natureQuiz-BjVOn8Uc.js";import"./dogOrder-DtDpqFpm.js";const o=Z,xe="/images/nature-quiz-art.webp";function Xe(){var W;const n=H(),s=(a,c)=>{const v=n(a);return v===a?c:v},x=U(),[f,r]=Y(),[i,l]=j.useState(null),[m,g]=j.useState(null);j.useEffect(()=>{let a=!0;return ce("id, dog_name").then(c=>{a&&l(c)}),()=>{a=!1}},[]),j.useEffect(()=>{if(!i||i.length===0)return;let a=!0;const c=()=>pe(i.map(w=>w.id)).then(w=>{a&&g(w)});c();const v=me(c);return()=>{a=!1,v()}},[i]);const h=j.useRef(null);j.useLayoutEffect(()=>{const a=h.current;if(!a)return;const c=()=>a.style.setProperty("--dm-top",`${Math.round(a.getBoundingClientRect().top+window.scrollY)}px`);return c(),window.addEventListener("resize",c),()=>window.removeEventListener("resize",c)},[i]);const b=((i==null?void 0:i.length)??0)>1,k=f.get("dog"),p=i?b?k&&i.some(a=>a.id===k)?k:"all":((W=i[0])==null?void 0:W.id)??"all":"all",$=j.useMemo(()=>i?p==="all"?i.map(a=>a.id):[p]:[],[i,p]),y=a=>r(a==="all"?{}:{dog:a},{replace:!0}),D=j.useMemo(()=>{if(!m)return null;let a=0,c=0;for(const v of ne){const w=_(v,m,$);a+=w.filled,c+=w.total}return c===0?0:Math.round(a/c*100)},[m,$]),A=a=>K.find(c=>c.key===a),G=K.filter(a=>a.soon),I=p==="all"?i??[]:(i??[]).filter(a=>a.id===p);return e.jsxs(ie,{children:[e.jsxs("style",{children:[q,V,$e]}),e.jsxs("section",{ref:h,className:"dm",style:{...T.card,boxShadow:P.panel},children:[e.jsxs("header",{className:"dm-head",children:[e.jsxs("div",{className:"dm-head-l",children:[e.jsx(ae,{tone:"pale",onClick:()=>x("/pack/dogs"),label:s("pack.chronicle.back","Back")}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("span",{className:"dm-eyebrow",children:s("pack.dogid.eyebrow","Your dog’s document")}),e.jsx("h1",{className:"dm-h1",children:s("pack.hub.profileTitle","DOG ID")})]})]}),e.jsxs("div",{className:"dm-total",children:[e.jsx("span",{style:{...X.section,color:o.inkWarm},children:s("pack.dogid.total","Overall")}),e.jsx("b",{children:D===null?"—":`${D} %`}),e.jsx(F,{pct:D??0})]})]}),b&&e.jsxs("div",{className:"dm-pills",children:[e.jsx("button",{type:"button",className:`pk-pill pk-pill--tap dm-pill${p==="all"?" on":""}`,onClick:()=>y("all"),children:s("pack.chronicle.allDogs","All")}),i.map(a=>e.jsx("button",{type:"button",className:`pk-pill pk-pill--tap dm-pill${p===a.id?" on":""}`,onClick:()=>y(a.id),children:a.dog_name??"—"},a.id))]}),i&&i.length===0?e.jsx("p",{className:"dm-hint",children:s("pack.quiz.noDogs","No dog to fill this in for yet.")}):e.jsxs("div",{className:"dm-bento",children:[e.jsx(ge,{mod:A("base"),latest:m,ids:$,sel:p,tx:s}),e.jsx(he,{mod:A("nature"),latest:m,ids:$,sel:p,tx:s}),e.jsx(fe,{mod:A("will"),latest:m,ids:$,sel:p,dogs:i??[],tx:s})]}),e.jsxs("footer",{className:"dm-foot",children:[e.jsx("div",{className:"dm-soon",children:G.map(a=>e.jsxs("span",{className:"dm-soon-item",children:[e.jsx(M,{name:a.icon,size:d.lead,tint:"dim"}),e.jsx("b",{children:s(a.i18n,a.labelEN)}),e.jsx("span",{className:"pk-pill pk-pill--locked dm-soon-pill",children:s("pack.dogid.soon","Soon")})]},a.key))}),I.length>0&&e.jsxs("div",{className:"dm-detail",children:[e.jsx("span",{className:"dm-detail-l",children:s("pack.dogid.detail","The whole DOG ID")}),I.map(a=>e.jsx(S,{to:`/pack/dogs/${a.id}`,className:"pk-pill pk-pill--tap dm-pill",children:a.dog_name??"—"},a.id))]})]})]})]})}function O(n,s,x){return n?n.done?x??s("pack.dogid.edit","Edit"):n.filled>0?s("pack.dogid.continue","Continue"):s("pack.dogid.start","Start"):""}function C({mod:n,done:s,tx:x}){return e.jsxs("div",{className:"dm-th",children:[e.jsxs("span",{className:"dm-badge","aria-hidden":!0,children:[e.jsx(M,{name:n.icon,size:d.h1,tint:"gold"}),s&&e.jsx("span",{className:"dm-tick",children:e.jsx(se,{size:d.micro})})]}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("h2",{className:"dm-h2",children:x(n.i18n,n.labelEN)}),e.jsx("p",{className:"dm-sub",children:x(n.subI18n,n.subEN)})]})]})}function B({pct:n}){return e.jsxs("div",{className:"dm-meter",children:[e.jsx("b",{children:n===null?"—":`${n} %`}),e.jsx(F,{pct:n??0})]})}function ge({mod:n,latest:s,ids:x,sel:f,tx:r}){const i=s?_(n,s,x):null,l=`/pack/dogs/quiz/base${f==="all"?"":`?dog=${f}`}`,m=s&&i&&!i.done?oe(le.steps,s,x):-1,g=m>=0?de(m):null;return e.jsxs("article",{className:"dm-tile dm-tile--base",style:{"--i":1},children:[e.jsx(C,{mod:n,done:!!(i!=null&&i.done),tx:r}),e.jsx(B,{pct:(i==null?void 0:i.pct)??null}),e.jsx("ul",{className:"dm-secs",children:re.map(h=>{const b=s?h.section.steps.filter(p=>x.every($=>{var y;return R((y=s[$])==null?void 0:y[p.field])})).length:0,k=b>=h.count?"is-done":(g==null?void 0:g.key)===h.key?"is-cur":"";return e.jsxs("li",{className:k,children:[e.jsx("i",{"aria-hidden":!0}),e.jsx("span",{children:r(h.section.i18n,h.section.labelEN)}),e.jsxs("em",{children:[b," / ",h.count]})]},h.key)})}),i&&e.jsx(L,{right:"dogid.edit",children:e.jsxs(S,{to:l,className:i.done?"dm-ghost":"dm-cta",children:[O(i,r),g&&e.jsxs("span",{className:"dm-cta-sub",children:["· ",r(g.section.i18n,g.section.labelEN)," ",m-g.start+1,"/",g.count]})]})})]})}function he({mod:n,latest:s,ids:x,sel:f,tx:r}){const i=s?_(n,s,x):null,l=f==="all"?"":`dog=${f}`,m=i!=null&&i.done?`/pack/nature?view=result${l?`&${l}`:""}`:`/pack/nature${l?`?${l}`:""}`;return e.jsxs("article",{className:"dm-tile dm-tile--nature",style:{"--i":2},children:[e.jsx("img",{className:"dm-art",src:xe,alt:"","aria-hidden":!0}),e.jsxs("div",{className:"dm-tile-body",children:[e.jsx(C,{mod:n,done:!!(i!=null&&i.done),tx:r}),e.jsx("p",{className:"dm-meta",children:r("pack.hub.nature.meta","22 questions · ~3 minutes")}),e.jsx(B,{pct:(i==null?void 0:i.pct)??null}),i&&e.jsx(L,{right:"dogid.edit",children:e.jsx(S,{to:m,className:"dm-cta",children:O(i,r,r("pack.dogid.result","Result"))})})]})]})}function fe({mod:n,latest:s,ids:x,sel:f,dogs:r,tx:i}){var h,b,k;const l=s?_(n,s,x):null,m=f!=="all"?f:((h=r.find(p=>n.steps.some($=>{var y;return!R((y=s==null?void 0:s[p.id])==null?void 0:y[$.field])})))==null?void 0:h.id)??((b=r[0])==null?void 0:b.id),g=f==="all"&&r.length>1&&!(l!=null&&l.done)?(k=r.find(p=>p.id===m))==null?void 0:k.dog_name:null;return e.jsxs("article",{className:"dm-tile dm-tile--will",style:{"--i":3},children:[e.jsx(C,{mod:n,done:!!(l!=null&&l.done),tx:i}),e.jsx(B,{pct:(l==null?void 0:l.pct)??null}),l&&m&&e.jsx(L,{right:"dogid.edit",children:e.jsxs(S,{to:`/pack/dogs/${m}?panel=will`,className:l.done?"dm-ghost":"dm-cta",children:[O(l,i),g&&e.jsxs("span",{className:"dm-cta-sub",children:["· ",g]})]})})]})}const ue=n=>({width:`${Math.min(100,Math.max(0,n))}%`});function F({pct:n}){const s=n>=100?" pk-progress__fill--done":" pk-progress__fill--low";return e.jsx("div",{className:"pk-progress",role:"progressbar","aria-valuenow":n,"aria-valuemin":0,"aria-valuemax":100,children:e.jsx("div",{className:`pk-progress__fill${s}`,style:ue(n)})})}const $e=`
/* ── karta = presne jedna obrazovka ── */
.dm{ display:flex; flex-direction:column; gap:${t.lg}px; padding:${t.xl}px;
  height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${t.lg}px);
  min-height:480px;
  /* PackLayout drží pod obsahom rezervu na plávajúci nav (pb-32 / pb-40). Karta už končí NAD
     navom sama, takže rezervu vracia späť — inak by sa stránka posúvala o pár desiatok px. */
  margin-bottom:-${t.xxxl*2}px; }
.dm-head{ display:flex; align-items:center; justify-content:space-between; gap:${t.lg}px; }
.dm-head-l{ display:flex; align-items:center; gap:${t.md}px; min-width:0; }
.dm-eyebrow{ display:block; font-family:${u}; font-weight:500; font-size:${d.micro}px; letter-spacing:0.26em; text-transform:uppercase; color:${o.inkWarm}; margin-bottom:${t.xs}px; }
.dm-h1{ margin:0; font-family:${E}; font-weight:700; font-size:${d.h1}px; line-height:1.1; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkStrong}; }
.dm-total{ display:grid; grid-template-columns:auto auto; align-items:baseline; gap:${t.xs}px ${t.md}px; width:220px; }
.dm-total b{ justify-self:end; font-family:${u}; font-size:${d.h2}px; font-weight:600; color:${o.inkStrong}; }
.dm-total .pk-progress{ grid-column:1/-1; }
.dm-pills{ display:flex; flex-wrap:wrap; gap:${t.sm}px; }
.dm-pill{ font-family:${u}; font-size:${d.label}px; font-weight:600; letter-spacing:0.02em; text-transform:uppercase; text-decoration:none; }
.dm-pill.on{ ${ee(z.edge,te.lapis)} }

/* ── BENTO: ZÁKLAD veľký vľavo, OSOBNOSŤ a ZÁVET vpravo ── */
.dm-bento{ flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);
  grid-template-rows:minmax(0,1.15fr) minmax(0,1fr); gap:${t.md}px; }
.dm-tile{ position:relative; overflow:hidden; display:flex; flex-direction:column; gap:${t.md}px; min-height:0;
  padding:${t.lg}px; border-radius:${N.tile}px;
  background:${T.subblock.background}; border:${T.subblock.border}; box-shadow:${P.lift};
  animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:calc(var(--i, 0) * 70ms); }
.dm-tile--base{ grid-row:1 / span 2; }
.dm-tile .dm-cta,.dm-tile .dm-ghost{ margin-top:auto; }
.dm-th{ display:flex; align-items:center; gap:${t.md}px; }
.dm-badge{ position:relative; flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  width:${t.xxxl}px; height:${t.xxxl}px; border-radius:${N.tile}px;
  background:${o.panelGrad}; border:1px solid ${o.cardEdge}; box-shadow:${P.lift}; }
.dm-tick{ position:absolute; right:-${t.xs+2}px; top:-${t.xs+2}px; display:flex; align-items:center; justify-content:center;
  width:${t.lg+2}px; height:${t.lg+2}px; border-radius:${N.pill}px; background:#3D7A4E; color:#EAF7ED; border:2px solid ${o.card}; }
.dm-h2{ margin:0; font-family:${E}; font-weight:700; font-size:${d.lead}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkStrong}; }
.dm-sub{ margin:${t.xs}px 0 0; font-family:${u}; font-size:${d.label}px; line-height:1.4; color:${o.inkWarm}; }
.dm-meta{ margin:0; font-family:${u}; font-size:${d.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkFaint}; }
.dm-meter{ display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:${t.md}px; }
.dm-meter b{ font-family:${u}; font-size:${d.h2}px; font-weight:600; color:${o.inkStrong}; min-width:${t.xxxl+t.md}px; }

/* sekcie ZÁKLADU — bodka: zelená hotovo · lapis tu pokračuješ · sivá ešte nie */
.dm-secs{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; min-height:0; overflow:hidden; }
.dm-secs li{ display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:${t.md}px;
  padding:${t.sm}px 0; border-top:1px dashed ${o.border}; font-family:${u}; font-size:${d.label}px; color:${o.inkWarm}; }
.dm-secs li:first-child{ border-top:0; }
.dm-secs i{ width:${t.sm}px; height:${t.sm}px; border-radius:${N.pill}px; background:rgba(122,90,42,0.22); }
.dm-secs li.is-done i{ background:#3D7A4E; }
.dm-secs li.is-cur{ color:${o.inkStrong}; font-weight:600; }
.dm-secs li.is-cur i{ background:${z.edge}; }
.dm-secs em{ font-style:normal; font-size:${d.micro}px; letter-spacing:0.14em; color:${o.inkFaint}; }

/* OSOBNOSŤ — vitráž vpravo, prechádza do papyrusu (súrodé s kartou na /dogs) */
.dm-tile--nature{ padding:0; }
.dm-art{ position:absolute; top:0; right:0; bottom:0; width:40%; height:100%; object-fit:cover; object-position:0 18%; pointer-events:none;
  -webkit-mask-image:linear-gradient(270deg,#000 35%,transparent 100%); mask-image:linear-gradient(270deg,#000 35%,transparent 100%); }
.dm-tile-body{ position:relative; display:flex; flex-direction:column; gap:${t.md}px; height:100%; padding:${t.lg}px; padding-right:32%; }
.dm-tile--nature .dm-cta{ align-self:flex-start; }

/* ── tlačidlá ── */
.dm-cta,.dm-ghost{ display:inline-flex; align-items:center; justify-content:center; gap:${t.sm}px; border-radius:${N.field}px;
  padding:${t.md}px ${t.lg}px; font-family:${E}; font-size:${d.label}px; font-weight:700; letter-spacing:0.14em;
  text-transform:uppercase; white-space:nowrap; text-decoration:none; transition:transform .2s cubic-bezier(.16,1,.3,1); }
.dm-cta{ background:${z.grad}; border:1px solid ${J.edge}; color:${z.ink}; box-shadow:${Q}; }
.dm-cta:hover{ transform:translateY(-1px); background:${z.gradHover}; }
.dm-ghost{ background:transparent; border:1px solid ${o.border}; color:${o.inkWarm}; }
.dm-ghost:hover{ border-color:${o.cardEdge}; color:${o.inkStrong}; }
.dm-cta:active,.dm-ghost:active{ transform:scale(.98); }
.dm-cta-sub{ font-family:${u}; font-size:${d.micro}px; font-weight:500; letter-spacing:0.14em; opacity:.8; }

/* ── päta ── */
.dm-foot{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:${t.md}px;
  padding-top:${t.md}px; border-top:1px dashed ${o.border}; animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:280ms; }
.dm-soon{ display:flex; flex-wrap:wrap; gap:${t.md}px; }
.dm-soon-item{ display:inline-flex; align-items:center; gap:${t.sm}px; opacity:.7; }
.dm-soon-item b{ font-family:${E}; font-weight:700; font-size:${d.label}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkWarm}; }
.dm-soon-pill{ font-family:${u}; font-size:${d.micro}px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; }
.dm-detail{ display:flex; align-items:center; flex-wrap:wrap; gap:${t.sm}px; }
.dm-detail-l{ font-family:${u}; font-size:${d.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkWarm}; }
.dm-hint{ font-family:${u}; font-size:${d.body}px; color:${o.inkWarm}; }

@keyframes dmIn{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }
@media (prefers-reduced-motion:reduce){ .dm-tile,.dm-foot{ animation:none; } }

/* Nízke okno (Matejovo PC 1477×724): ustúpia popisy, sekcie zhustnú, ikonka sa zmenší — nie vzduch. */
@media (max-height:780px){
  .dm-sub,.dm-meta{ display:none; }
  .dm-secs li{ padding:${t.xs}px 0; }
  .dm{ gap:${t.md}px; }
  .dm-tile,.dm-tile-body{ gap:${t.sm}px; }
  .dm-tile{ padding:${t.md}px; }
  .dm-tile--nature{ padding:0; }
  .dm-tile-body{ padding:${t.md}px; padding-right:32%; }
  .dm-badge{ width:${t.xxl+t.sm}px; height:${t.xxl+t.sm}px; }
}

/* ── mobil: jeden stĺpec, dlaždice nízke ── */
@media (max-width:720px){
  .dm{ padding:${t.lg}px; gap:${t.md}px; height:auto; min-height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${t.lg}px); }
  .dm-head{ flex-direction:column; align-items:stretch; gap:${t.md}px; }
  .dm-total{ width:auto; }
  .dm-bento{ display:flex; flex-direction:column; gap:${t.sm}px; flex:1; }
  /* Dlaždica na mobile = MRIEŽKA: hore ikonka + názov, dole percento s pruhom a vedľa CTA.
     Tri dlaždice pod sebou sa tak zmestia nad nav aj na 844 px. */
  .dm-tile,.dm-tile-body{ display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:${t.sm}px ${t.md}px; }
  .dm-tile{ padding:${t.md}px; }
  .dm-tile--nature{ display:block; padding:0; }
  .dm-th{ grid-column:1/-1; }
  .dm-tile .dm-cta,.dm-tile .dm-ghost{ margin-top:0; width:auto; min-width:120px; }
  .dm-secs,.dm-sub,.dm-meta{ display:none; }
  .dm-badge{ width:${t.xxl+t.sm}px; height:${t.xxl+t.sm}px; }
  .dm-meter b{ font-size:${d.body}px; min-width:${t.xxxl}px; }
  .dm-tile-body{ padding:${t.md}px; }
  .dm-tile--nature .dm-th{ padding-right:30%; }
  .dm-cta,.dm-ghost{ padding:${t.sm}px ${t.md}px; }
  .dm-cta-sub{ display:none; }
  .dm-foot{ gap:${t.sm}px; }
  .dm-detail-l{ display:none; }
}
`;export{Xe as default};
