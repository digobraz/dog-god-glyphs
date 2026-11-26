import{u as H,g as U,n as q,r as j,j as e,aQ as Y,ah as V,s as i,a0 as u,v as d,b as Z,a1 as N,m as z,w as T,aF as L,L as S,ay as Q,c as X,aB as J,e as E,y as ee,x as ie}from"./index-DriUOdZL.js";import{c as te}from"./stepBack-DQEM_RuJ.js";import{P as ae}from"./PackLayout-B9RT_jMa.js";import{R as O}from"./RightGate-BEa7gj1s.js";import{B as K}from"./BrandIcon-lowQpHlA.js";import{S as se}from"./SysIcon-CI9hudiL.js";import{L as oe,m as D,D as W,f as ne,B as le,s as de,a as re}from"./dogIdModules-hd_1JqLi.js";import{onDogEventsChange as me,readLatestForDogs as pe,hasValue as R}from"./dogEvents-p0BnCK5N.js";import{l as ce}from"./packDogsList-CP66VoGg.js";import"./magnetPreview-DJ5RPtvA.js";import"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./cloudinaryService-CiRx-3N_.js";import"./client-_yx8AKEw.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./packTiers-D4RAcaEl.js";import"./countryGeo-BNEVCU3g.js";import"./PackTopRow-BfpkT1yr.js";import"./HandIcons-BI9sYdb3.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./MomentHost-D9oSu3w3.js";import"./BackButton-8pSTwsJq.js";import"./sharedFetch-CweRO2Vz.js";import"./dogRights-CDnPOjZG.js";import"./hasSession-ns-zlIq6.js";import"./devMockDogs-EBvAGSAt.js";import"./pawmateRights-By9TfO0S.js";import"./wizAnchors-DjShJff8.js";import"./dogSlug-CB23gDR2.js";import"./addTripModel-DwkYC9MX.js";import"./feedData-DmTwWPGV.js";import"./photoIntake-EOawjgPq.js";import"./consent-Dhof2q2u.js";import"./ainubisSheet-BR3ZiSMH.js";import"./useSheetSwipe-Ch0ng1WW.js";import"./sosNoPhoto-igLPGupO.js";import"./sos-0Lw8ugiB.js";import"./use-toast-CKCh4Cay.js";import"./shareFile-CghX9Llh.js";import"./breeds-DONRU28-.js";import"./sosP3d-BGksLPbc.js";import"./vaultScrolls-DnI3miNU.js";import"./circles-AGJD0c_9.js";import"./TermsGate-BuR57-OJ.js";import"./cardDraft--JJQVDkL.js";import"./sysSwap-DJ_4p3cJ.js";import"./labTheme-DLctEqJ2.js";import"./humanPrefs-B9ECa3kp.js";import"./dogQuiz-CnwlZ10v.js";import"./packProfile-3D_4hu2R.js";import"./natureQuiz-D2uHcOot.js";import"./deviceCopy-J10wrLU1.js";import"./dogOrder-BzS94db9.js";const n=Z,xe="/images/nature-quiz-art.webp";function ki(){var M;const o=H(),s=(a,c)=>{const v=o(a);return v===a?c:v},x=U(),[f,r]=q(),[t,l]=j.useState(null),[m,g]=j.useState(null);j.useEffect(()=>{let a=!0;return ce("id, dog_name").then(c=>{a&&l(c)}),()=>{a=!1}},[]),j.useEffect(()=>{if(!t||t.length===0)return;let a=!0;const c=()=>pe(t.map(w=>w.id)).then(w=>{a&&g(w)});c();const v=me(c);return()=>{a=!1,v()}},[t]);const h=j.useRef(null);j.useLayoutEffect(()=>{const a=h.current;if(!a)return;const c=()=>a.style.setProperty("--dm-top",`${Math.round(a.getBoundingClientRect().top+window.scrollY)}px`);return c(),window.addEventListener("resize",c),()=>window.removeEventListener("resize",c)},[t]);const b=((t==null?void 0:t.length)??0)>1,k=f.get("dog"),p=t?b?k&&t.some(a=>a.id===k)?k:"all":((M=t[0])==null?void 0:M.id)??"all":"all",$=j.useMemo(()=>t?p==="all"?t.map(a=>a.id):[p]:[],[t,p]),y=a=>r(a==="all"?{}:{dog:a},{replace:!0}),_=j.useMemo(()=>{if(!m)return null;let a=0,c=0;for(const v of oe){const w=D(v,m,$);a+=w.filled,c+=w.total}return c===0?0:Math.round(a/c*100)},[m,$]),A=a=>W.find(c=>c.key===a),F=W.filter(a=>a.soon),B=p==="all"?t??[]:(t??[]).filter(a=>a.id===p);return e.jsxs(ae,{onBack:()=>te()?x(-1):x("/pack/dogs"),backLabel:s("pack.chronicle.back","Back"),children:[e.jsxs("style",{children:[Y,V,$e]}),e.jsxs("section",{ref:h,className:"dm",style:{...T.card,boxShadow:L.panel},children:[e.jsxs("header",{className:"dm-head",children:[e.jsx("div",{className:"dm-head-l",children:e.jsxs("div",{style:{minWidth:0},children:[e.jsx("span",{className:"dm-eyebrow",children:s("pack.dogid.eyebrow","Your dog’s document")}),e.jsx("h1",{className:"dm-h1",children:s("pack.hub.profileTitle","DOG ID")})]})}),e.jsxs("div",{className:"dm-total",children:[e.jsx("span",{style:{...J.section,color:n.inkWarm},children:s("pack.dogid.total","Overall")}),e.jsx("b",{children:_===null?"—":`${_} %`}),e.jsx(G,{pct:_??0})]})]}),b&&e.jsxs("div",{className:"dm-pills",children:[e.jsx("button",{type:"button",className:`pk-pill pk-pill--tap dm-pill${p==="all"?" on":""}`,onClick:()=>y("all"),children:s("pack.chronicle.allDogs","All")}),t.map(a=>e.jsx("button",{type:"button",className:`pk-pill pk-pill--tap dm-pill${p===a.id?" on":""}`,onClick:()=>y(a.id),children:e.jsx("span",{className:"dm-dogname",children:a.dog_name??"—"})},a.id))]}),t&&t.length===0?e.jsx("p",{className:"dm-hint",children:s("pack.quiz.noDogs","No dog to fill this in for yet.")}):e.jsxs("div",{className:"dm-bento",children:[e.jsx(ge,{mod:A("base"),latest:m,ids:$,sel:p,tx:s}),e.jsx(he,{mod:A("nature"),latest:m,ids:$,sel:p,tx:s}),e.jsx(fe,{mod:A("will"),latest:m,ids:$,sel:p,dogs:t??[],tx:s})]}),e.jsxs("footer",{className:"dm-foot",children:[e.jsx("div",{className:"dm-soon",children:F.map(a=>e.jsxs("span",{className:"dm-soon-item",children:[e.jsx(K,{name:a.icon==="feather"?"dogid-will":a.icon,size:d.lead,tint:"dim"}),e.jsx("b",{children:s(a.i18n,a.labelEN)}),e.jsx("span",{className:"pk-pill pk-pill--locked dm-soon-pill",children:s("pack.dogid.soon","Soon")})]},a.key))}),B.length>0&&e.jsxs("div",{className:"dm-detail",children:[e.jsx("span",{className:"dm-detail-l",children:s("pack.dogid.detail","The whole DOG ID")}),B.map(a=>e.jsx(E,{to:`/pack/dogs/${a.id}`,className:"pk-pill pk-pill--tap dm-pill",children:e.jsx("span",{className:"dm-dogname",children:a.dog_name??"—"})},a.id))]})]})]})]})}function P(o,s,x){return o?o.done?x??s("pack.dogid.edit","Edit"):o.filled>0?s("pack.dogid.continue","Continue"):s("pack.dogid.start","Start"):""}function C({mod:o,done:s,tx:x}){return e.jsxs("div",{className:"dm-th",children:[e.jsxs("span",{className:"dm-badge","aria-hidden":!0,children:[e.jsx(K,{name:o.icon==="feather"?"dogid-will":o.icon,size:d.h1,tint:"gold"}),s&&e.jsx("span",{className:"dm-tick",children:e.jsx(se,{name:"fajka",size:18})})]}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("h2",{className:"dm-h2",children:x(o.i18n,o.labelEN)}),e.jsx("p",{className:"dm-sub",children:x(o.subI18n,o.subEN)})]})]})}function I({pct:o}){return e.jsxs("div",{className:"dm-meter",children:[e.jsx("b",{children:o===null?"—":`${o} %`}),e.jsx(G,{pct:o??0})]})}function ge({mod:o,latest:s,ids:x,sel:f,tx:r}){const t=s?D(o,s,x):null,l=`/pack/dogs/quiz/base${f==="all"?"":`?dog=${f}`}`,m=s&&t&&!t.done?ne(le.steps,s,x):-1,g=m>=0?de(m):null;return e.jsxs("article",{className:"dm-tile dm-tile--base",style:{"--i":1},children:[e.jsx(C,{mod:o,done:!!(t!=null&&t.done),tx:r}),e.jsx(I,{pct:(t==null?void 0:t.pct)??null}),e.jsx("ul",{className:"dm-secs",children:re.map(h=>{const b=s?h.section.steps.filter(p=>x.every($=>{var y;return R((y=s[$])==null?void 0:y[p.field])})).length:0,k=b>=h.count?"is-done":(g==null?void 0:g.key)===h.key?"is-cur":"";return e.jsxs("li",{className:k,children:[e.jsx("i",{"aria-hidden":!0}),e.jsx("span",{children:r(h.section.i18n,h.section.labelEN)}),e.jsxs("em",{children:[b," / ",h.count]})]},h.key)})}),t&&e.jsx(O,{right:"dogid.edit",children:e.jsxs(E,{to:l,className:t.done?"dm-ghost":"dm-cta",children:[P(t,r),g&&e.jsxs("span",{className:"dm-cta-sub",children:["· ",r(g.section.i18n,g.section.labelEN)," ",m-g.start+1,"/",g.count]})]})})]})}function he({mod:o,latest:s,ids:x,sel:f,tx:r}){const t=s?D(o,s,x):null,l=f==="all"?"":`dog=${f}`,m=t!=null&&t.done?`/pack/nature?view=result${l?`&${l}`:""}`:`/pack/nature${l?`?${l}`:""}`;return e.jsxs("article",{className:"dm-tile dm-tile--nature",style:{"--i":2},children:[e.jsx("img",{className:"dm-art",src:xe,alt:"","aria-hidden":!0}),e.jsxs("div",{className:"dm-tile-body",children:[e.jsx(C,{mod:o,done:!!(t!=null&&t.done),tx:r}),e.jsx("p",{className:"dm-meta",children:r("pack.hub.nature.meta","22 questions · ~3 minutes")}),e.jsx(I,{pct:(t==null?void 0:t.pct)??null}),t&&e.jsx(O,{right:"dogid.edit",children:e.jsx(E,{to:m,className:"dm-cta",children:P(t,r,r("pack.dogid.result","Result"))})})]})]})}function fe({mod:o,latest:s,ids:x,sel:f,dogs:r,tx:t}){var h,b,k;const l=s?D(o,s,x):null,m=f!=="all"?f:((h=r.find(p=>o.steps.some($=>{var y;return!R((y=s==null?void 0:s[p.id])==null?void 0:y[$.field])})))==null?void 0:h.id)??((b=r[0])==null?void 0:b.id),g=f==="all"&&r.length>1&&!(l!=null&&l.done)?(k=r.find(p=>p.id===m))==null?void 0:k.dog_name:null;return e.jsxs("article",{className:"dm-tile dm-tile--will",style:{"--i":3},children:[e.jsx(C,{mod:o,done:!!(l!=null&&l.done),tx:t}),e.jsx(I,{pct:(l==null?void 0:l.pct)??null}),l&&m&&e.jsx(O,{right:"dogid.edit",children:e.jsxs(E,{to:`/pack/dogs/${m}?panel=will`,className:l.done?"dm-ghost":"dm-cta",children:[P(l,t),g&&e.jsxs("span",{className:"dm-cta-sub",children:["· ",g]})]})})]})}const ue=o=>({width:`${Math.min(100,Math.max(0,o))}%`});function G({pct:o}){const s=o>=100?" pk-progress__fill--done":" pk-progress__fill--low";return e.jsx("div",{className:"pk-progress",role:"progressbar","aria-valuenow":o,"aria-valuemin":0,"aria-valuemax":100,children:e.jsx("div",{className:`pk-progress__fill${s}`,style:ue(o)})})}const $e=`
/* ── karta = presne jedna obrazovka ── */
.dm{ display:flex; flex-direction:column; gap:${i.lg}px; padding:${i.xl}px;
  height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${i.lg}px);
  min-height:480px;
  /* PackLayout drží pod obsahom rezervu na plávajúci nav (pb-32 / pb-40). Karta už končí NAD
     navom sama, takže rezervu vracia späť — inak by sa stránka posúvala o pár desiatok px. */
  margin-bottom:-${i.xxxl*2}px; }
.dm-head{ display:flex; align-items:center; justify-content:space-between; gap:${i.lg}px; }
.dm-head-l{ display:flex; align-items:center; gap:${i.md}px; min-width:0; }
.dm-eyebrow{ display:block; font-family:${u}; font-weight:500; font-size:${d.micro}px; letter-spacing:0.26em; text-transform:uppercase; color:${n.inkWarm}; margin-bottom:${i.xs}px; }
.dm-h1{ margin:0; font-family:${N}; font-weight:700; font-size:${d.h1}px; line-height:1.1; letter-spacing:0.14em; text-transform:uppercase; color:${n.inkStrong}; }
.dm-total{ display:grid; grid-template-columns:auto auto; align-items:baseline; gap:${i.xs}px ${i.md}px; width:220px; }
.dm-total b{ justify-self:end; font-family:${u}; font-size:${d.h2}px; font-weight:600; color:${n.inkStrong}; }
.dm-total .pk-progress{ grid-column:1/-1; }
.dm-pills{ display:flex; flex-wrap:wrap; gap:${i.sm}px; }
.dm-pill{ font-family:${u}; font-size:${d.label}px; font-weight:600; letter-spacing:0.02em; text-transform:uppercase; text-decoration:none; }
.dm-dogname{ font-family:'Cinzel Decorative', ${N}; font-weight:700; } /* písmo: meno — meno psa na oficiálnom povrchu (DOG ID) */
.dm-pill.on{ ${ee(S.edge,ie.lapis)} }

/* ── BENTO: ZÁKLAD veľký vľavo, OSOBNOSŤ a ZÁVET vpravo ── */
.dm-bento{ flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);
  grid-template-rows:minmax(0,1.15fr) minmax(0,1fr); gap:${i.md}px; }
.dm-tile{ position:relative; overflow:hidden; display:flex; flex-direction:column; gap:${i.md}px; min-height:0;
  padding:${i.lg}px; border-radius:${z.tile}px;
  background:${T.subblock.background}; border:${T.subblock.border}; box-shadow:${L.lift};
  animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:calc(var(--i, 0) * 70ms); }
.dm-tile--base{ grid-row:1 / span 2; }
.dm-tile .dm-cta,.dm-tile .dm-ghost{ margin-top:auto; }
.dm-th{ display:flex; align-items:center; gap:${i.md}px; }
.dm-badge{ position:relative; flex:0 0 auto; display:flex; align-items:center; justify-content:center;
  width:${i.xxxl}px; height:${i.xxxl}px; border-radius:${z.tile}px;
  background:${n.panelGrad}; border:1px solid ${n.cardEdge}; box-shadow:${L.lift}; }
.dm-tick{ position:absolute; right:-${i.xs+2}px; top:-${i.xs+2}px; display:flex; align-items:center; justify-content:center;
  width:${i.lg+2}px; height:${i.lg+2}px; border-radius:${z.pill}px; background:#3D7A4E; color:#EAF7ED; border:2px solid ${n.card}; }
.dm-h2{ margin:0; font-family:${N}; font-weight:700; font-size:${d.lead}px; letter-spacing:0.14em; text-transform:uppercase; color:${n.inkStrong}; }
.dm-sub{ margin:${i.xs}px 0 0; font-family:${u}; font-size:${d.label}px; line-height:1.4; color:${n.inkWarm}; }
.dm-meta{ margin:0; font-family:${u}; font-size:${d.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${n.inkFaint}; }
.dm-meter{ display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:${i.md}px; }
.dm-meter b{ font-family:${u}; font-size:${d.h2}px; font-weight:600; color:${n.inkStrong}; min-width:${i.xxxl+i.md}px; }

/* sekcie ZÁKLADU — bodka: zelená hotovo · lapis tu pokračuješ · sivá ešte nie */
.dm-secs{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; min-height:0; overflow:hidden; }
.dm-secs li{ display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:${i.md}px;
  padding:${i.sm}px 0; border-top:1px dashed ${n.border}; font-family:${u}; font-size:${d.label}px; color:${n.inkWarm}; }
.dm-secs li:first-child{ border-top:0; }
.dm-secs i{ width:${i.sm}px; height:${i.sm}px; border-radius:${z.pill}px; background:rgba(122,90,42,0.22); }
.dm-secs li.is-done i{ background:#3D7A4E; }
.dm-secs li.is-cur{ color:${n.inkStrong}; font-weight:600; }
.dm-secs li.is-cur i{ background:${S.edge}; }
.dm-secs em{ font-style:normal; font-size:${d.micro}px; letter-spacing:0.14em; color:${n.inkFaint}; }

/* OSOBNOSŤ — vitráž vpravo, prechádza do papyrusu (súrodé s kartou na /dogs) */
.dm-tile--nature{ padding:0; }
.dm-art{ position:absolute; top:0; right:0; bottom:0; width:40%; height:100%; object-fit:cover; object-position:0 18%; pointer-events:none;
  -webkit-mask-image:linear-gradient(270deg,#000 35%,transparent 100%); mask-image:linear-gradient(270deg,#000 35%,transparent 100%); }
.dm-tile-body{ position:relative; display:flex; flex-direction:column; gap:${i.md}px; height:100%; padding:${i.lg}px; padding-right:32%; }
.dm-tile--nature .dm-cta{ align-self:flex-start; }

/* ── tlačidlá ── */
.dm-cta,.dm-ghost{ display:inline-flex; align-items:center; justify-content:center; gap:${i.sm}px; border-radius:${z.field}px;
  padding:${i.md}px ${i.lg}px; font-family:${N}; font-size:${d.label}px; font-weight:700; letter-spacing:0.14em;
  text-transform:uppercase; white-space:nowrap; text-decoration:none; transition:transform .2s cubic-bezier(.16,1,.3,1); }
.dm-cta{ background:${S.grad}; border:1px solid ${Q.edge}; color:${S.ink}; box-shadow:${X}; }
.dm-cta:hover{ transform:translateY(-1px); background:${S.gradHover}; }
.dm-ghost{ background:transparent; border:1px solid ${n.border}; color:${n.inkWarm}; }
.dm-ghost:hover{ border-color:${n.cardEdge}; color:${n.inkStrong}; }
.dm-cta:active,.dm-ghost:active{ transform:scale(.98); }
.dm-cta-sub{ font-family:${u}; font-size:${d.micro}px; font-weight:500; letter-spacing:0.14em; opacity:.8; }

/* ── päta ── */
.dm-foot{ display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:${i.md}px;
  padding-top:${i.md}px; border-top:1px dashed ${n.border}; animation:dmIn .55s cubic-bezier(.16,1,.3,1) both; animation-delay:280ms; }
.dm-soon{ display:flex; flex-wrap:wrap; gap:${i.md}px; }
.dm-soon-item{ display:inline-flex; align-items:center; gap:${i.sm}px; opacity:.7; }
.dm-soon-item b{ font-family:${N}; font-weight:700; font-size:${d.label}px; letter-spacing:0.14em; text-transform:uppercase; color:${n.inkWarm}; }
.dm-soon-pill{ font-family:${u}; font-size:${d.micro}px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; }
.dm-detail{ display:flex; align-items:center; flex-wrap:wrap; gap:${i.sm}px; }
.dm-detail-l{ font-family:${u}; font-size:${d.micro}px; letter-spacing:0.14em; text-transform:uppercase; color:${n.inkWarm}; }
.dm-hint{ font-family:${u}; font-size:${d.body}px; color:${n.inkWarm}; }

@keyframes dmIn{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }
@media (prefers-reduced-motion:reduce){ .dm-tile,.dm-foot{ animation:none; } }

/* Nízke okno (Matejovo PC 1477×724): ustúpia popisy, sekcie zhustnú, ikonka sa zmenší — nie vzduch. */
@media (max-height:780px){
  .dm-sub,.dm-meta{ display:none; }
  .dm-secs li{ padding:${i.xs}px 0; }
  .dm{ gap:${i.md}px; }
  .dm-tile,.dm-tile-body{ gap:${i.sm}px; }
  .dm-tile{ padding:${i.md}px; }
  .dm-tile--nature{ padding:0; }
  .dm-tile-body{ padding:${i.md}px; padding-right:32%; }
  .dm-badge{ width:${i.xxl+i.sm}px; height:${i.xxl+i.sm}px; }
}

/* ── mobil: jeden stĺpec, dlaždice nízke ── */
@media (max-width:720px){
  .dm{ padding:${i.lg}px; gap:${i.md}px; height:auto; min-height:calc(100dvh - var(--dm-top, 96px) - var(--pack-nav-h, 72px) - var(--pack-nav-bottom, 16px) - ${i.lg}px); }
  .dm-head{ flex-direction:column; align-items:stretch; gap:${i.md}px; }
  .dm-total{ width:auto; }
  .dm-bento{ display:flex; flex-direction:column; gap:${i.sm}px; flex:1; }
  /* Dlaždica na mobile = MRIEŽKA: hore ikonka + názov, dole percento s pruhom a vedľa CTA.
     Tri dlaždice pod sebou sa tak zmestia nad nav aj na 844 px. */
  .dm-tile,.dm-tile-body{ display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:${i.sm}px ${i.md}px; }
  .dm-tile{ padding:${i.md}px; }
  .dm-tile--nature{ display:block; padding:0; }
  .dm-th{ grid-column:1/-1; }
  .dm-tile .dm-cta,.dm-tile .dm-ghost{ margin-top:0; width:auto; min-width:120px; }
  .dm-secs,.dm-sub,.dm-meta{ display:none; }
  .dm-badge{ width:${i.xxl+i.sm}px; height:${i.xxl+i.sm}px; }
  .dm-meter b{ font-size:${d.body}px; min-width:${i.xxxl}px; }
  .dm-tile-body{ padding:${i.md}px; }
  .dm-tile--nature .dm-th{ padding-right:30%; }
  .dm-cta,.dm-ghost{ padding:${i.sm}px ${i.md}px; }
  .dm-cta-sub{ display:none; }
  .dm-foot{ gap:${i.sm}px; }
  .dm-detail-l{ display:none; }
}
`;export{ki as default};
