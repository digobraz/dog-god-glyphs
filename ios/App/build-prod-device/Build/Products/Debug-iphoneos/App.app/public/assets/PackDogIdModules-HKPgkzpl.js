import{u as F,i as U,o as q,r as j,j as e,a2 as V,aO as Y,J as t,T as f,V as d,P as X,U as E,n as N,X as T,ak as P,L as z,$ as Z,b as J,a0 as Q,g as S,H as ee,m as te}from"./index-7PctGTam.js";import{P as ae}from"./PackLayout-DbvN9q62.js";import{B as ie}from"./BackButton-DiG140MZ.js";import{R as L}from"./RightGate-D9upYetj.js";import{B as K}from"./BrandIcon-C4Fdumu_.js";import{b as se}from"./HandIcons-Dh9PgzA0.js";import{L as ne,m as _,D as W,f as oe,B as le,s as de,a as re}from"./dogIdModules-BDNgSFzm.js";import{o as me,r as pe,h as R}from"./dogEvents-DNw7GPsn.js";import{l as ce}from"./packDogsList-CdNepPcH.js";import"./magnetPreview-DhLqLXgw.js";import"./ainubisSkin-B7Z96MPq.js";import"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./cloudinaryService-DFfDUqVM.js";import"./dogRights-BxAmrGwt.js";import"./ainubisBus-BMRzmB2O.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Dyn0GD-G.js";import"./devMockDogs-BzGWz4qV.js";import"./pawmateRights-DJDDFQlT.js";import"./tripShared-DJ5J49O6.js";import"./countryGeo-BaPfaSrG.js";import"./packStore-C-dKFjs1.js";import"./addTripModel-BuQrZHBF.js";import"./wizAnchors-E3ARHgZI.js";import"./consent-28X3-hgX.js";import"./use-toast-CpgRElRJ.js";import"./handArrowLeft-BUyUUYuC.js";import"./dogQuiz-CHLLe1WL.js";import"./packProfile-DFxYPxfm.js";import"./natureQuiz-BjVOn8Uc.js";import"./dogOrder-NAHNyfSe.js";const o=X,xe="/images/nature-quiz-art.webp";function Ze(){var M;const n=F(),s=(i,c)=>{const v=n(i);return v===i?c:v},x=U(),[u,r]=q(),[a,l]=j.useState(null),[m,g]=j.useState(null);j.useEffect(()=>{let i=!0;return ce("id, dog_name").then(c=>{i&&l(c)}),()=>{i=!1}},[]),j.useEffect(()=>{if(!a||a.length===0)return;let i=!0;const c=()=>pe(a.map(w=>w.id)).then(w=>{i&&g(w)});c();const v=me(c);return()=>{i=!1,v()}},[a]);const h=j.useRef(null);j.useLayoutEffect(()=>{const i=h.current;if(!i)return;const c=()=>i.style.setProperty("--dm-top",`${Math.round(i.getBoundingClientRect().top+window.scrollY)}px`);return c(),window.addEventListener("resize",c),()=>window.removeEventListener("resize",c)},[a]);const b=((a==null?void 0:a.length)??0)>1,k=u.get("dog"),p=a?b?k&&a.some(i=>i.id===k)?k:"all":((M=a[0])==null?void 0:M.id)??"all":"all",$=j.useMemo(()=>a?p==="all"?a.map(i=>i.id):[p]:[],[a,p]),y=i=>r(i==="all"?{}:{dog:i},{replace:!0}),A=j.useMemo(()=>{if(!m)return null;let i=0,c=0;for(const v of ne){const w=_(v,m,$);i+=w.filled,c+=w.total}return c===0?0:Math.round(i/c*100)},[m,$]),D=i=>W.find(c=>c.key===i),H=W.filter(i=>i.soon),I=p==="all"?a??[]:(a??[]).filter(i=>i.id===p);return e.jsxs(ae,{children:[e.jsxs("style",{children:[V,Y,$e]}),e.jsxs("section",{ref:h,className:"dm",style:{...T.card,boxShadow:P.panel},children:[e.jsxs("header",{className:"dm-head",children:[e.jsxs("div",{className:"dm-head-l",children:[e.jsx(ie,{tone:"pale",onClick:()=>x("/pack/dogs"),label:s("pack.chronicle.back","Back")}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("span",{className:"dm-eyebrow",children:s("pack.dogid.eyebrow","Your dog’s document")}),e.jsx("h1",{className:"dm-h1",children:s("pack.hub.profileTitle","DOG ID")})]})]}),e.jsxs("div",{className:"dm-total",children:[e.jsx("span",{style:{...Q.section,color:o.inkWarm},children:s("pack.dogid.total","Overall")}),e.jsx("b",{children:A===null?"—":`${A} %`}),e.jsx(G,{pct:A??0})]})]}),b&&e.jsxs("div",{className:"dm-pills",children:[e.jsx("button",{type:"button",className:`pk-pill pk-pill--tap dm-pill${p==="all"?" on":""}`,onClick:()=>y("all"),children:s("pack.chronicle.allDogs","All")}),a.map(i=>e.jsx("button",{type:"button",className:`pk-pill pk-pill--tap dm-pill${p===i.id?" on":""}`,onClick:()=>y(i.id),children:i.dog_name??"—"},i.id))]}),a&&a.length===0?e.jsx("p",{className:"dm-hint",children:s("pack.quiz.noDogs","No dog to fill this in for yet.")}):e.jsxs("div",{className:"dm-bento",children:[e.jsx(ge,{mod:D("base"),latest:m,ids:$,sel:p,tx:s}),e.jsx(he,{mod:D("nature"),latest:m,ids:$,sel:p,tx:s}),e.jsx(ue,{mod:D("will"),latest:m,ids:$,sel:p,dogs:a??[],tx:s})]}),e.jsxs("footer",{className:"dm-foot",children:[e.jsx("div",{className:"dm-soon",children:H.map(i=>e.jsxs("span",{className:"dm-soon-item",children:[e.jsx(K,{name:i.icon,size:d.lead,tint:"dim"}),e.jsx("b",{children:s(i.i18n,i.labelEN)}),e.jsx("span",{className:"pk-pill pk-pill--locked dm-soon-pill",children:s("pack.dogid.soon","Soon")})]},i.key))}),I.length>0&&e.jsxs("div",{className:"dm-detail",children:[e.jsx("span",{className:"dm-detail-l",children:s("pack.dogid.detail","The whole DOG ID")}),I.map(i=>e.jsx(S,{to:`/pack/dogs/${i.id}`,className:"pk-pill pk-pill--tap dm-pill",children:i.dog_name??"—"},i.id))]})]})]})]})}function O(n,s,x){return n?n.done?x??s("pack.dogid.edit","Edit"):n.filled>0?s("pack.dogid.continue","Continue"):s("pack.dogid.start","Start"):""}function C({mod:n,done:s,tx:x}){return e.jsxs("div",{className:"dm-th",children:[e.jsxs("span",{className:"dm-badge","aria-hidden":!0,children:[e.jsx(K,{name:n.icon,size:d.h1,tint:"gold"}),s&&e.jsx("span",{className:"dm-tick",children:e.jsx(se,{size:d.micro})})]}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("h2",{className:"dm-h2",children:x(n.i18n,n.labelEN)}),e.jsx("p",{className:"dm-sub",children:x(n.subI18n,n.subEN)})]})]})}function B({pct:n}){return e.jsxs("div",{className:"dm-meter",children:[e.jsx("b",{children:n===null?"—":`${n} %`}),e.jsx(G,{pct:n??0})]})}function ge({mod:n,latest:s,ids:x,sel:u,tx:r}){const a=s?_(n,s,x):null,l=`/pack/dogs/quiz/base${u==="all"?"":`?dog=${u}`}`,m=s&&a&&!a.done?oe(le.steps,s,x):-1,g=m>=0?de(m):null;return e.jsxs("article",{className:"dm-tile dm-tile--base",style:{"--i":1},children:[e.jsx(C,{mod:n,done:!!(a!=null&&a.done),tx:r}),e.jsx(B,{pct:(a==null?void 0:a.pct)??null}),e.jsx("ul",{className:"dm-secs",children:re.map(h=>{const b=s?h.section.steps.filter(p=>x.every($=>{var y;return R((y=s[$])==null?void 0:y[p.field])})).length:0,k=b>=h.count?"is-done":(g==null?void 0:g.key)===h.key?"is-cur":"";return e.jsxs("li",{className:k,children:[e.jsx("i",{"aria-hidden":!0}),e.jsx("span",{children:r(h.section.i18n,h.section.labelEN)}),e.jsxs("em",{children:[b," / ",h.count]})]},h.key)})}),a&&e.jsx(L,{right:"dogid.edit",children:e.jsxs(S,{to:l,className:a.done?"dm-ghost":"dm-cta",children:[O(a,r),g&&e.jsxs("span",{className:"dm-cta-sub",children:["· ",r(g.section.i18n,g.section.labelEN)," ",m-g.start+1,"/",g.count]})]})})]})}function he({mod:n,latest:s,ids:x,sel:u,tx:r}){const a=s?_(n,s,x):null,l=u==="all"?"":`dog=${u}`,m=a!=null&&a.done?`/pack/nature?view=result${l?`&${l}`:""}`:`/pack/nature${l?`?${l}`:""}`;return e.jsxs("article",{className:"dm-tile dm-tile--nature",style:{"--i":2},children:[e.jsx("img",{className:"dm-art",src:xe,alt:"","aria-hidden":!0}),e.jsxs("div",{className:"dm-tile-body",children:[e.jsx(C,{mod:n,done:!!(a!=null&&a.done),tx:r}),e.jsx("p",{className:"dm-meta",children:r("pack.hub.nature.meta","22 questions · ~3 minutes")}),e.jsx(B,{pct:(a==null?void 0:a.pct)??null}),a&&e.jsx(L,{right:"dogid.edit",children:e.jsx(S,{to:m,className:"dm-cta",children:O(a,r,r("pack.dogid.result","Result"))})})]})]})}function ue({mod:n,latest:s,ids:x,sel:u,dogs:r,tx:a}){var h,b,k;const l=s?_(n,s,x):null,m=u!=="all"?u:((h=r.find(p=>n.steps.some($=>{var y;return!R((y=s==null?void 0:s[p.id])==null?void 0:y[$.field])})))==null?void 0:h.id)??((b=r[0])==null?void 0:b.id),g=u==="all"&&r.length>1&&!(l!=null&&l.done)?(k=r.find(p=>p.id===m))==null?void 0:k.dog_name:null;return e.jsxs("article",{className:"dm-tile dm-tile--will",style:{"--i":3},children:[e.jsx(C,{mod:n,done:!!(l!=null&&l.done),tx:a}),e.jsx(B,{pct:(l==null?void 0:l.pct)??null}),l&&m&&e.jsx(L,{right:"dogid.edit",children:e.jsxs(S,{to:`/pack/dogs/${m}?panel=will`,className:l.done?"dm-ghost":"dm-cta",children:[O(l,a),g&&e.jsxs("span",{className:"dm-cta-sub",children:["· ",g]})]})})]})}const fe=n=>({width:`${Math.min(100,Math.max(0,n))}%`});function G({pct:n}){const s=n>=100?" pk-progress__fill--done":" pk-progress__fill--low";return e.jsx("div",{className:"pk-progress",role:"progressbar","aria-valuenow":n,"aria-valuemin":0,"aria-valuemax":100,children:e.jsx("div",{className:`pk-progress__fill${s}`,style:fe(n)})})}const $e=`
/* ── karta = presne jedna obrazovka ── */
.dm{ display:flex; flex-direction:column; gap:${t.lg}px; padding:${t.xl}px;
  height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${t.lg}px);
  min-height:480px;
  /* PackLayout drží pod obsahom rezervu na plávajúci nav (pb-32 / pb-40). Karta už končí NAD
     navom sama, takže rezervu vracia späť — inak by sa stránka posúvala o pár desiatok px. */
  margin-bottom:-${t.xxxl*2}px; }
.dm-head{ display:flex; align-items:center; justify-content:space-between; gap:${t.lg}px; }
.dm-head-l{ display:flex; align-items:center; gap:${t.md}px; min-width:0; }
.dm-eyebrow{ display:block; font-family:${f}; font-weight:500; font-size:${d.micro}px; letter-spacing:0.26em; text-transform:uppercase; color:${o.inkWarm}; margin-bottom:${t.xs}px; }
.dm-h1{ margin:0; font-family:${E}; font-weight:700; font-size:${d.h1}px; line-height:1.1; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkStrong}; }
.dm-total{ display:grid; grid-template-columns:auto auto; align-items:baseline; gap:${t.xs}px ${t.md}px; width:220px; }
.dm-total b{ justify-self:end; font-family:${f}; font-size:${d.h2}px; font-weight:600; color:${o.inkStrong}; }
.dm-total .pk-progress{ grid-column:1/-1; }
.dm-pills{ display:flex; flex-wrap:wrap; gap:${t.sm}px; }
.dm-pill{ font-family:${f}; font-size:${d.label}px; font-weight:600; letter-spacing:0.02em; text-transform:uppercase; text-decoration:none; }
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
.dm-sub{ margin:${t.xs}px 0 0; font-family:${f}; font-size:${d.label}px; line-height:1.4; color:${o.inkWarm}; }
.dm-meta{ margin:0; font-family:${f}; font-size:${d.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkFaint}; }
.dm-meter{ display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:${t.md}px; }
.dm-meter b{ font-family:${f}; font-size:${d.h2}px; font-weight:600; color:${o.inkStrong}; min-width:${t.xxxl+t.md}px; }

/* sekcie ZÁKLADU — bodka: zelená hotovo · lapis tu pokračuješ · sivá ešte nie */
.dm-secs{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; min-height:0; overflow:hidden; }
.dm-secs li{ display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:${t.md}px;
  padding:${t.sm}px 0; border-top:1px dashed ${o.border}; font-family:${f}; font-size:${d.label}px; color:${o.inkWarm}; }
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
.dm-cta{ background:${z.grad}; border:1px solid ${Z.edge}; color:${z.ink}; box-shadow:${J}; }
.dm-cta:hover{ transform:translateY(-1px); background:${z.gradHover}; }
.dm-ghost{ background:transparent; border:1px solid ${o.border}; color:${o.inkWarm}; }
.dm-ghost:hover{ border-color:${o.cardEdge}; color:${o.inkStrong}; }
.dm-cta:active,.dm-ghost:active{ transform:scale(.98); }
.dm-cta-sub{ font-family:${f}; font-size:${d.micro}px; font-weight:500; letter-spacing:0.14em; opacity:.8; }

/* ── päta ── */
.dm-foot{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:${t.md}px;
  padding-top:${t.md}px; border-top:1px dashed ${o.border}; animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:280ms; }
.dm-soon{ display:flex; flex-wrap:wrap; gap:${t.md}px; }
.dm-soon-item{ display:inline-flex; align-items:center; gap:${t.sm}px; opacity:.7; }
.dm-soon-item b{ font-family:${E}; font-weight:700; font-size:${d.label}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkWarm}; }
.dm-soon-pill{ font-family:${f}; font-size:${d.micro}px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; }
.dm-detail{ display:flex; align-items:center; flex-wrap:wrap; gap:${t.sm}px; }
.dm-detail-l{ font-family:${f}; font-size:${d.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${o.inkWarm}; }
.dm-hint{ font-family:${f}; font-size:${d.body}px; color:${o.inkWarm}; }

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
`;export{Ze as default};
