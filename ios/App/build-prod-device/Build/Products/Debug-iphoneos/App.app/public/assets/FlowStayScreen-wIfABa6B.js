import{u as _,h as q,r as l,k as L,j as e,n as T,B as Q,L as E,l as F,i as H,o as X,N as G,E as ee,q as te,v as se,p as ae}from"./index-7PctGTam.js";import{P as oe}from"./PageTopBar-DlESgG9R.js";import{H as O,c as ne,a as ie}from"./flowPaleSkin-DMjCjOr3.js";import{F as K,a as V}from"./flowMedallion-CLU85rpj.js";import{L as b}from"./labTheme-p7t_6k9Y.js";import{h as J}from"./hekthorFaces-myd4lVXL.js";import{r as re,w as le,s as pe}from"./flowSvorka-yJVb0HVl.js";import{m as Y}from"./proxy-B4ZTxIpr.js";import"./handArrowLeft-BUyUUYuC.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock--CJIKtfn.js";import"./createLucideIcon-Di02PK5p.js";import"./LanguagePicker--v1cJQg6.js";import"./flagUrl-B21iQI9I.js";import"./heroglyphCode-DRLWPhOC.js";import"./initialLetter-CIe-_dtl.js";import"./breeds-DONRU28-.js";const W="guest";function ce(o=null){const p=l.useRef(null),a=l.useRef(null),n=l.useRef(null),t=l.useRef(null),[g,i]=l.useState(120),[R,C]=l.useState(24);return l.useLayoutEffect(()=>{var f;const d=a.current,u=n.current;if(!d||!u)return;const y=()=>{const c=t.current;if(c){const x=getComputedStyle(d),S=d.clientWidth-parseFloat(x.paddingLeft)-parseFloat(x.paddingRight)-4;let r=24;c.style.fontSize=`${r}px`;const B=()=>Math.max(...Array.from(c.children).map(s=>s.getBoundingClientRect().width));for(;r>16&&B()>S;)r-=1,c.style.fontSize=`${r}px`;C(s=>s===r?s:r)}const h=getComputedStyle(d),P=parseFloat(h.paddingTop)+parseFloat(h.paddingBottom),$=parseFloat(h.rowGap||h.gap||"0")||0,M=Math.min(d.clientHeight-P-u.offsetHeight-$,d.clientWidth-32),v=p.current,N=(v?v.getBoundingClientRect().bottom:0)-(window.innerHeight-16);i(x=>{const S=N>1?x-N:M*.9,r=Math.max(72,Math.min(220,Math.floor(S)));return Math.abs(r-x)>2?r:x})};y(),(f=document.fonts)==null||f.ready.then(y);const k=new ResizeObserver(y);return k.observe(d),window.addEventListener("resize",y),()=>{k.disconnect(),window.removeEventListener("resize",y)}},[o]),{wrapRef:p,speakRef:a,sayRef:n,titleRef:t,medal:g,titleSize:R}}function Ce({done:o,onDone:p,onMember:a,onMore:n}){const t=_(),{lang:g}=q(),i=l.useMemo(()=>re(),[]),R=L(s=>s.email),C=L(s=>s.ownerName),d=L(s=>s.extraPhotos),[u,y]=l.useState(!1),[k,f]=l.useState(!1),[c,h]=l.useState(null),{wrapRef:P,speakRef:$,sayRef:M,titleRef:v,medal:I,titleSize:N}=ce(o),[x,S,r=""]=t(i.length>1?"heroglyph.flow.stay.thanks.tMany":"heroglyph.flow.stay.thanks.tOne").split("*"),B=async()=>{if(!k){F("stay_tier_chosen",{tier:W,dogs:i.length,news:u}),f(!0),h(null);try{const s=await le();if(s.some(m=>{var j;return(j=m.photo)==null?void 0:j.startsWith("blob:")})){h(t("payment.photoNotReady")),f(!1);return}const z=await fetch(`${ee}/create-checkout`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tier:W,newsConsent:u,email:R,ownerName:C,dogs:s.map(m=>pe(m,C,0)),cloudinaryExtras:d.filter(m=>m&&!m.startsWith("blob:")),refCode:se(),language:g,...te()})}),A=z.ok?await z.json():null;if((A==null?void 0:A.tier)==="guest"){F("stay_guest_joined",{dogs:s.length,news:u});const m=Array.isArray(A.dogIds)?A.dogIds:[];L.getState().setGuest(Object.fromEntries(s.map((j,Z)=>[j.flowId,m[Z]]).filter(([,j])=>!!j)),R),ae(),f(!1),p();return}const w=z.ok?null:await z.json().catch(()=>null);console.error("create-checkout (stay) failed:",z.status,w==null?void 0:w.error),h(t((w==null?void 0:w.error)==="invalid_input"?"heroglyph.flow.stay.errEmail":"heroglyph.flow.stay.errSave")),f(!1)}catch(s){console.error("stay confirm error:",s),h(t("heroglyph.flow.stay.errSave")),f(!1)}}};return e.jsxs("div",{className:"st-wrap",ref:P,children:[e.jsxs("style",{children:[K,U]}),e.jsxs("div",{className:"hf-speak st-speak",ref:$,children:[e.jsx(V,{src:J(o?"stay-done":"stay"),size:I}),e.jsx("span",{className:"say",ref:M,children:o?e.jsxs("h2",{ref:v,className:"st-title",style:{fontSize:N},children:[e.jsxs("span",{children:[x,e.jsx("b",{children:S})]}),e.jsx("span",{children:r.trim()})]}):e.jsxs(e.Fragment,{children:[e.jsxs("h2",{ref:v,className:"st-title",style:{fontSize:N},children:[e.jsx("span",{children:t(i.length>1?"heroglyph.flow.stay.titlePrefixMany":"heroglyph.flow.stay.titlePrefix").trim()}),e.jsxs("span",{children:[e.jsx("b",{children:t("heroglyph.flow.stay.titleWord")}),t("heroglyph.flow.stay.titleSuffix")]})]}),e.jsx("p",{children:t("heroglyph.flow.stay.sub")})]})})]}),o?e.jsx(de,{onJoin:a}):e.jsxs("div",{className:"hf-block hf-carved st-board",children:[e.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),e.jsxs("div",{className:"hf-plate",children:[e.jsxs("ul",{className:"st-rows",children:[e.jsxs("li",{className:"st-row yes",children:[e.jsx(D,{yes:!0}),e.jsxs("span",{children:[e.jsx("b",{children:t("heroglyph.flow.stay.have")})," ",e.jsx("small",{children:t("heroglyph.flow.stay.haveNote")})]})]}),e.jsxs("li",{className:"st-row no",children:[e.jsx(D,{yes:!1}),e.jsx("b",{children:t("heroglyph.flow.stay.f.design")})]}),e.jsxs("li",{className:"st-row no",children:[e.jsx(D,{yes:!1}),e.jsx("button",{type:"button",className:"st-profile",onClick:n,children:t("heroglyph.flow.stay.miss2")})]})]}),e.jsxs("div",{className:"st-slot",children:[e.jsxs("button",{type:"button",className:`hf-chk${u?" on":""}${c?" is-hidden":""}`,onClick:()=>y(s=>!s),"aria-hidden":!!c,tabIndex:c?-1:0,children:[e.jsx("span",{className:"box",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"#16307A",strokeWidth:"3.4",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:e.jsx("path",{d:"M4 12.5 L9.5 18 L20 6"})})}),e.jsx("span",{className:"lbl",children:t("heroglyph.flow.stay.news")})]}),c&&e.jsx("p",{role:"alert",className:"hf-alert st-err",children:c})]}),e.jsxs("div",{className:"st-actions",children:[e.jsx("button",{type:"button",className:"hf-cta",onClick:()=>{F("stay_tier_chosen",{tier:"member",dogs:i.length}),a()},disabled:k,children:t("heroglyph.flow.stay.member")}),e.jsx("button",{type:"button",className:"st-confirm",onClick:B,disabled:k,children:t(k?"payment.preparing":"heroglyph.flow.stay.free")})]})]})]})]})}function D({yes:o}){return e.jsx("svg",{className:"st-mark",viewBox:"0 0 24 24",fill:"none",strokeWidth:"3.2",strokeLinecap:"round",strokeLinejoin:"round","aria-label":o?"+":"-",children:o?e.jsx("path",{d:"M4 12.5 L9.5 18 L20 6"}):e.jsx("path",{d:"M6 6 L18 18 M18 6 L6 18"})})}function Ee(){const o=H(),p=_(),[a]=X(),n=a.get("paid")==="support"?"support":a.get("done")==="guest"?"guest":null;return n?n==="guest"?e.jsx(G,{to:"/checkout?stay=done",replace:!0}):e.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[e.jsxs("style",{children:[ne,K,ie,U]}),e.jsx("div",{className:"hf-topbar flex-shrink-0",children:e.jsx(oe,{})}),e.jsx("div",{className:"hf-stage",children:e.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center",children:[e.jsxs(Y.div,{className:"hf-speak st-speak",initial:{opacity:0,y:-8},animate:{opacity:1,y:0},transition:{duration:.28},children:[e.jsx(V,{src:J("stay"),size:72}),e.jsxs("span",{className:"say",children:[e.jsx("h2",{children:e.jsx("b",{children:p("heroglyph.flow.stay.done.t")})}),e.jsx("p",{children:p(`heroglyph.flow.stay.done.${n}`)})]})]}),e.jsx("button",{type:"button",className:"hf-cta st-done-cta",onClick:()=>o("/"),children:p("heroglyph.flow.stay.done.cta")})]})})]}):e.jsx(G,{to:"/checkout?stay=1",replace:!0})}function de({onJoin:o}){const p=H(),a=_(),n=L(i=>Object.values(i.guestIds)[0]),t=["DOG ID","AINUBIS","DOGTRIP","SNIFFER"],g=()=>e.jsx("svg",{className:"gt-ok",viewBox:"0 0 24 24",fill:"none",strokeWidth:"3.2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:e.jsx("path",{d:"M4 12.5 L9.5 18 L20 6"})});return e.jsxs(Y.div,{className:"hf-block hf-carved gt-stack",initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{duration:.35},children:[e.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),e.jsxs("div",{className:"hf-plate",children:[e.jsxs("ul",{className:"gt-lines",children:[e.jsxs("li",{children:[e.jsx(g,{}),a("heroglyph.flow.stay.thanks.l1")]}),e.jsxs("li",{children:[e.jsx(g,{}),a("heroglyph.flow.stay.thanks.l2")]}),e.jsxs("li",{children:[e.jsx(g,{}),a("heroglyph.flow.stay.thanks.l3")]})]}),e.jsx("p",{className:"hf-legend",children:a("heroglyph.flow.stay.thanks.rule")}),e.jsx("div",{className:"gt-tags",children:t.map(i=>e.jsx("span",{children:i},i))}),e.jsxs("div",{className:"gt-ctas",children:[e.jsx("button",{type:"button",className:"st-confirm",onClick:()=>p(n?`/?dog=${n}`:"/"),children:a("heroglyph.flow.stay.thanks.wall")}),e.jsx("button",{type:"button",className:"hf-cta",onClick:o,children:a("heroglyph.flow.stay.thanks.join")})]})]})]})}const U=`
/* Hláška a súhlas v JEDNEJ bunke — výška dosky sa pri chybe nemení (28. 9. 2026). */
.st-slot { display: grid; }
.st-slot > * { grid-area: 1 / 1; }
.st-slot > .hf-chk.is-hidden { visibility: hidden; }
.st-slot > .st-err { align-self: center; margin: 0; }
/* ── ĎAKOVAČKA HOSŤA ── dolná doska zadržania po zápise. */
.gt-stack { width: 100%; }
.gt-stack .hf-plate { gap: 12px; }
.gt-lines { list-style: none; margin: 0 auto; padding: 0; display: flex; flex-direction: column; gap: 8px;
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.3; color: ${b.ink}; }
.gt-lines li { display: flex; align-items: center; gap: 8px; }
.gt-ok { flex: none; width: 20px; height: 20px; stroke: #3D7A4E; }
.gt-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.gt-tags span { padding: 4px 12px; border-radius: ${T.pill}px; border: 1px solid ${Q.edge};
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: ${b.inkBody}; }
.gt-ctas { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) {
  .gt-lines { font-size: 14px; gap: 6px; } .gt-ok { width: 18px; height: 18px; }
  .gt-ctas { grid-template-columns: 1fr; } .gt-ctas .hf-cta { order: -1; }
}
/* ZADRŽANIE aj ĎAKOVAČKA: bublina (natiahnutá na zvyšok výšky, Hektor
   v strede) + pod ňou samostatná doska — medzeru nesie \`.hf-block\`, ako
   na každom kroku vstupu. */
.st-wrap { display: flex; flex-direction: column; }
.st-wrap .st-speak.hf-speak { flex: 1; justify-content: center; }
.st-board .hf-plate { gap: 12px; }
/* Hektor v strede, text pod ním — bublina je stĺpec (26. 9. večer). */
.st-wrap .st-speak.hf-speak { flex-direction: column; text-align: center; padding: 20px 16px; gap: 12px; }
.st-wrap .st-speak .say { align-items: center; text-align: center; align-self: stretch; }
.st-title { display: flex; flex-direction: column; align-items: center; line-height: 1.12; }
.st-title > span { white-space: nowrap; }
.st-speak h2 { font-size: 20px; }
.st-speak p { font-size: 14px; line-height: 1.45; }
@media (min-width: 601px) {
  .st-wrap .st-speak.hf-speak { padding: 24px 32px; gap: 16px; }
  .st-speak h2 { font-size: 24px; }
  .st-speak p { font-size: 16px; max-width: 520px; }
}
.st-rows { align-self: center; }
/* KARTA ZO STENY + DVA RIADKY (26. 9. 2026). Písmo 16/14, nie 12 — Matej:
   *„su miniatúrne"*. Karta = mini .dog-card psa bez člena: fotka v psej
   optike, dolu stmavnutie so zlatým heroglyfom, meno v pilulke. */
.st-rows { list-style: none; margin: 0; padding: 0; align-self: center; display: flex; flex-direction: column; gap: 8px; }
.st-row { display: flex; align-items: center; gap: 8px; font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.3; color: ${b.ink}; }
.st-row b { font-weight: 500; }
.st-row small { font-size: 14px; color: ${b.inkBody}; white-space: nowrap; }
.st-row.no { color: ${b.inkBody}; }
.st-profile { background: none; border: 0; padding: 0; cursor: pointer; text-align: left; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px; letter-spacing: .04em; text-transform: uppercase; color: ${b.ink}; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; }
.st-profile:hover { color: ${E.edge}; }
.st-mark { flex: none; width: 20px; height: 20px; stroke: #B25640; }
.st-row.yes .st-mark { stroke: #3D7A4E; }
/* POD SEBOU (Matej 26. 9. 2026: *„plný prístup a potvrdiť by som dal pod seba"*): plný hore, priesvitný pod ním. */
.st-actions { display: flex; flex-direction: column; gap: 8px; }
.st-actions > button { width: 100%; }
.st-actions .hf-cta { width: 100%; }
/* PC (≥601): VEDĽA SEBA (Matej 26. 9. ~15:00: *„na PC to nie je ok, obsah preteká
   a dá sa scrollovať, takže tlačidlá daj vedľa seba"*). Pretekalo to po výbere
   €0/€3, keď pribudne checkbox s e-mailom. POTVRDIŤ vľavo, PLNÝ PRÍSTUP (plné
   lapis) vpravo — plná akcia bližšie k palcu, ako v pokladni. Mobil ostáva pod sebou. */
@media (min-width: 601px) {
  .st-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .st-actions > .st-confirm { order: 1; }
  .st-actions > .hf-cta { order: 2; }
}
.st-confirm {
  height: ${O.cta.h}px; border-radius: ${O.cta.radius}px; cursor: pointer;
  border: 1.5px solid ${E.edge}; background: transparent; color: ${E.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${O.cta.size}px;
  letter-spacing: .08em; text-transform: uppercase; line-height: 1.15; padding: 0 8px;
  transition: background .18s;
}
.st-confirm:hover:not(:disabled) { background: ${E.fill}; }
.st-confirm:disabled { opacity: .4; cursor: default; }
.st-done-cta { margin-top: 16px; max-width: 320px; }
.st-wrap .hf-chk { border-radius: ${T.tile}px; }
/* Nízke PC okno (1477×724): hlavička popupu ustúpi prvá, obsah (voľby, CTA) nie. */
@media (min-width: 601px) and (max-height: 800px) {
  .st-board .hf-plate { gap: 10px; }
  .st-wrap .st-speak.hf-speak { padding: 12px 20px; gap: 8px; }
  .st-speak h2 { font-size: 20px; }
  .st-speak p { font-size: 14px; }
}
@media (max-width: 600px) {
  .st-board .hf-plate { gap: 10px; }
  .st-wrap .st-speak.hf-speak { padding: 12px; gap: 8px; }
  .st-speak h2 { font-size: 16px; }
  .st-speak p { font-size: 12px; line-height: 1.4; }
  .st-row, .st-profile { font-size: 14px; }
  .st-row small { font-size: 12px; }
  .st-mark { width: 18px; height: 18px; }
}
@media (max-width: 600px) and (max-height: 700px) {
  .st-board .hf-plate { gap: 6px; }
  .st-speak h2 { font-size: 14px; }
  .st-wrap .hf-chk { padding-top: 6px; padding-bottom: 6px; }
}
`;export{Ce as FlowStayChoice,Ee as FlowStayScreen};
