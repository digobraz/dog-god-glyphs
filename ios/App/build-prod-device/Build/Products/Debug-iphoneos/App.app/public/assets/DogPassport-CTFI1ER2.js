import{u as O,r as g,j as a,P as B,a2 as M,an as K,X as _,L as j,g as D,H as V,m as H,T as y,h as X,D as Y}from"./index-7PctGTam.js";import{P as L,S as U,a as F,q as W}from"./dogQuiz-CHLLe1WL.js";import{s as Z,n as G}from"./natureQuiz-BjVOn8Uc.js";import{o as q,e as J,h as I,c as Q,a as ee}from"./dogEvents-DNw7GPsn.js";import{R as $}from"./RightGate-D9upYetj.js";const ae=`
.pk-tilt{transform:perspective(900px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)) translateY(var(--tilt-l,0px));
  transition:transform .45s cubic-bezier(.2,.8,.2,1);}
.pk-tilt.is-tilting{transition:transform .12s ease-out;}
@media (prefers-reduced-motion:reduce){.pk-tilt{transform:none !important;}}
`,C=3;function A(e,i,s){const r=e.getBoundingClientRect(),c=(i-r.left)/r.width-.5,t=(s-r.top)/r.height-.5;e.style.setProperty("--tilt-y",`${(c*2*C).toFixed(2)}deg`),e.style.setProperty("--tilt-x",`${(-t*2*C).toFixed(2)}deg`),e.style.setProperty("--tilt-l","-2px"),e.classList.add("is-tilting")}function P(e){e.style.removeProperty("--tilt-x"),e.style.removeProperty("--tilt-y"),e.style.removeProperty("--tilt-l"),e.classList.remove("is-tilting")}const se={onPointerMove:e=>{(e.pointerType==="mouse"||e.buttons)&&A(e.currentTarget,e.clientX,e.clientY)},onPointerDown:e=>A(e.currentTarget,e.clientX,e.clientY),onPointerLeave:e=>P(e.currentTarget),onPointerUp:e=>{e.pointerType!=="mouse"&&P(e.currentTarget)},onPointerCancel:e=>P(e.currentTarget)},l=B,N=_.subblock,T=_.subblockDark,te=`
/* ✎ a „zdieľať" = pilulky. DNA .pk-pill (papyrusový gradient + 1.5px rgba(179,130,45,.55)
   + hover lift) — rozdiel medzi nimi nesie len veľkosť písma a výplň, nie iný rám. */
.pass-share{ display:inline-flex; align-items:center; gap:7px;
  font-family:'Cinzel',serif; font-size:10px; font-weight:700; letter-spacing:.14em;
  text-transform:uppercase; padding:8px 16px; }
.pass-share:disabled{ opacity:.5; cursor:default; }
.pass-edit{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:0.14em;
  text-transform:uppercase; padding:4px 12px; text-decoration:none; }
/* LAPIS NA DOG ID (Matej 27. 9. 2026 nad hárkom plany/nakres-dogid-detail-2026-09-27:
   „zmeň všetky zlaté veci na lapisové — progres bar, chipy atď."). Zlato ostáva len
   konštrukcii (rám karty, deliaca čiara) a čiernemu bloku závetu, kde by lapis zanikol. */
.pass-edit:not(.pk-pill--dark), .pass-chip, .pass-share{ ${V(j.edge,H.lapis,.08)} }
/* KATEGÓRIE = SAMOSTATNÉ BLOKY (Matej 12.8.: „kategorie treba vizualne zoradit do
   blokov … vacsie nadpisy kategorii a viac strukturovane"). Blok = ÚROVEŇ 2 matrice
   (PODBLOK) — je to sekcia vnútri karty DOG ID, presne ako ZÁKLAD a ŽIVOTNÝ ŠTÝL
   v profile. Rovnaká hranica 720/721 px ako zvyšok karty psa. */
.pass-groups{ columns:2; column-gap:14px; }
@media (max-width:720px){ .pass-groups{ columns:1; } }
/* Cudzí profil (readOnly) má len 3 očíslované sekcie — stĺpce ich čítali 01 · 03 · 02
   (test po FLIPe 5. 10. 2026). Mriežka drží poradie po riadkoch. */
.pass-groups--ro{ columns:auto; display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
.pass-groups--ro .pass-block{ margin:0; }
@media (max-width:720px){ .pass-groups--ro{ grid-template-columns:1fr; } }
.pass-block{ break-inside:avoid; -webkit-column-break-inside:avoid; margin:0 0 14px;
  background:${N.background}; border:${N.border}; border-radius:${N.borderRadius}px;
  padding:16px 16px 16px; box-shadow:${N.boxShadow};
  /* Inkoust bloku je premenná, nie natvrdo písaná farba v každom riadku — inak by sa
     tmavá varianta nedala prefarbiť: riadky si farbu nesú v inline style a ten CSS
     trieda neprebije. Takto stačí prepísať tri premenné na obale. */
  --pass-lbl:${l.inkWarm}; --pass-val:${l.inkStrong}; --pass-faint:${l.inkFaint}; }
/* ZÁVET JE ČIERNY (Matej 13.8.2026). Nie je to štýlová obmena — je to jediná sekcia
   dokladu, ktorá hovorí o smrti psa, a na papyruse mala rovnakú váhu ako obľúbená
   maškrta. Recept berie matrica (PACK_BOX.subblockDark), tu sa dolaďuje len inkoust.
   Rám a radius ostávajú zhodné so svetlými blokmi — v mriežke to má byť ich súrodenec.
   Panel na PÍSANIE závetu ostáva papyrusový zámerne: čierna je na čítanie dokladu,
   nie na vypĺňanie formulára. */
.pass-block--dark{ background:${T.background}; border:${T.border};
  box-shadow:${T.boxShadow};
  /* 27. 9. 2026 Matej: „závet dajme lapisovým resp. gradientom zlatá–lapis (ako je na
     heroflow)" — tá istá plocha ako bublina vstupu (.hf-speak = var(--brand-gradient)).
     Recept rámu a tieňa ostáva z PACK_BOX.subblockDark, mení sa len výplň. */
  background:var(--brand-gradient);
  --pass-lbl:${l.onDarkDim}; --pass-val:${l.onDark}; --pass-faint:rgba(245,240,228,0.34); }
.pass-block--dark .pass-btitle{ color:rgba(245,240,228,0.92); }
.pass-block--dark .pass-brule{ opacity:.55; }
/* číslo sekcie je lapisové — na gradiente závetu by zaniklo, preto zlatý inkoust lapisu */
.pass-block--dark .pass-bnum{ color:${j.ink}; }
/* Červená chýbajúceho poľa musí na čiernej zosvetliť — ${l.alertRed} na ${l.pageBg} je pod
   čitateľnou hranicou. Rovnaký odtieň, len vyššia svetlosť. */
.pass-block--dark .pass-missing{ color:#D9705C; }
.pass-block--dark .pass-missing--optional{ color:rgba(245,240,228,0.34); }
.pass-block--dark .pass-fixed{ color:${l.onDark}; }
.pass-block--dark .pass-fixed--empty{ color:rgba(245,240,228,0.34); }
.pass-block--dark .pass-note{ border-top-color:${l.onDarkBorder}; }
.pass-block--dark .pass-notetext{ color:rgba(245,240,228,0.62); }
.pass-block--dark .pass-noteadd{ color:rgba(245,240,228,0.42); }
.pass-block--dark .pass-noteadd:hover{ color:rgba(245,240,228,0.88); }
.pass-bhead{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.pass-btitle{ display:flex; align-items:center; gap:9px; font-family:'Cinzel',serif; font-weight:700;
  font-size:16px; letter-spacing:0.14em; text-transform:uppercase; color:${l.inkStrong}; margin:0; }
.pass-bnum{ font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:.14em; font-variant-numeric:tabular-nums; color:${j.edge}; opacity:.75; }
/* deliaca čiara vnútri bloku = predpísaný token T.rule, nie vlastný gradient.
   POZOR: tento blok je JS template literal — spätný apostrof v komentári zhodí build. */
.pass-brule{ height:2px; margin:10px 0 12px; background:${l.rule}; opacity:.75; }
/* NEVYPLNENÉ POLE. Červená je token T.alertRed, nie ľubovoľná červená. Veľkosť 15px
   a váha 600 sú tu preto, že jeden znak v riadku s 12px popiskom inak zanikne —
   pomlčka má byť vidieť cez celý blok. Váha 600 je STROP: Space Grotesk je načítaný
   300–600, pri 700 by prehliadač dosyntetizoval fake bold. */
.pass-toresult{
  color:inherit; text-decoration:none;
  /* Podčiarknutie musí byť VIDIEŤ, inak je to mŕtve tlačidlo — bodkovaná zlatá
     linka pod hodnotou hovorí „dá sa na to kliknúť" bez toho, aby z údaja spravila
     modrý odkaz. Ostatné riadky dokladu klikateľné nie sú a nesmú tak vyzerať. */
  border-bottom:1px dotted rgba(22,48,122,0.55);
  transition:border-color .15s ease, opacity .15s ease;
}
.pass-toresult:hover{ border-bottom-color:${j.edge}; opacity:.85; }
.pass-missing{ font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:600;
  letter-spacing:0.02em; color:${l.alertRed}; text-decoration:none; }
/* zámerne prázdne pole (zvláštna úloha) — pomlčka bez poplachu */
.pass-missing--optional{ color:${l.inkFaint}; }
.pass-missing:hover{ text-decoration:underline; }
/* KOMPLETNOSŤ DOKLADU. Prúžok je zámerne tenký a bez rámu — je to meradlo, nie ďalší
   blok; matrica sa naň nevzťahuje (nie je to karta ani podblok). Zlatá výplň je tá istá
   ako pilulka .pk-pill--gold, aby „hotové" malo v celom /packu jednu farbu. */
.pass-fill{ margin:2px 0 16px; }
.pass-fillhead{ display:flex; align-items:baseline; justify-content:space-between; gap:10px;
  margin-bottom:6px; }
.pass-filllbl{ font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:10px;
  letter-spacing:.26em; text-transform:uppercase; color:${j.edge}; }
.pass-fillnum{ font-family:'Space Grotesk',sans-serif; font-size:12px; font-variant-numeric:tabular-nums;
  color:${l.inkWarm}; white-space:nowrap; }
.pass-fillbar{ height:6px; border-radius:999px; background:${l.tileBg};
  border:1px solid ${l.border}; overflow:hidden; }
.pass-fillbar__on{ height:100%; border-radius:999px;
  background:linear-gradient(90deg,${j.lite} 0%,${j.edge} 100%); transition:width .4s ease; }
/* riadok, ktorý sa needituje (plemeno, narodenie, pohlavie) */
.pass-fixed{ font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:500;
  color:${l.inkStrong}; }
.pass-fixed--empty{ font-size:16px; font-weight:600; letter-spacing:0.02em; color:${l.inkFaint}; }
/* poznámka vlastnými slovami — to, čo z údajov robí psa */
.pass-note{ margin-top:12px; padding-top:12px; border-top:1px dashed ${l.hairline}; }
.pass-notetext{ font-family:'Space Grotesk',sans-serif; font-size:14px; line-height:1.55;
  color:${l.inkWarm}; font-style:italic; white-space:pre-wrap; margin:0; }
.pass-noteadd{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:0.14em;
  text-transform:uppercase; color:rgba(31,26,14,.42); background:transparent; border:0; padding:0;
  cursor:pointer; }
.pass-noteadd:hover{ color:${l.inkStrong}; }
`,ne=["howWorks","social","temperament"],ie={temperament:["nature.element","nature.role"]};function be({dogId:e,bare:i=!1,fixedRows:s,onEditPanel:r,values:c,readOnly:t=!1}){const u=O(),p=(n,o)=>{const m=u(n);return m===n?o:m},[d,h]=g.useState(null),[v,S]=g.useState(null);g.useEffect(()=>{if(c){h(c);return}let n=!0;const o=()=>{Q(e).then(x=>{n&&h(x)})};o();const m=q(o);return()=>{n=!1,m()}},[e,c]),g.useEffect(()=>{if(t)return;let n=!0;return J(e,"health.weightKg").then(o=>{if(!n||o.length<2){S(null);return}const m=Number(o[o.length-1].value),x=Number(o[o.length-2].value);if(!Number.isFinite(m)||!Number.isFinite(x)){S(null);return}const f=m-x;if(Math.abs(f)<.05){S(null);return}const k=de(o[o.length-2].recordedAt,o[o.length-1].recordedAt),w=k>=1?` / ${k} ${p("pack.pass.months","mo.")}`:"";S(`${f>0?"↗ +":"↘ −"}${Math.abs(f).toFixed(1)} kg${w}`)}),()=>{n=!1}},[e]);const b=g.useMemo(()=>d?(t?L.filter(o=>ne.includes(o.key)):L).map(o=>{const x=(t?[...ie[o.key]??[],...o.fields]:o.fields).map(f=>({step:U[f],value:re(f,d[f],d)})).filter(f=>!!f.step);return{group:o,rows:x}}).filter(o=>o.rows.length>0):[],[d,t]),z=g.useMemo(()=>{if(!d)return null;const n=F.length,o=F.filter(m=>I(d[m.field])).length;return{done:o,total:n,pct:n?Math.round(o/n*100):0}},[d]);return d?a.jsxs("section",{style:i?{color:l.ink}:{background:l.cardGrad,border:`1.5px solid ${l.cardEdge}`,borderRadius:16,boxShadow:l.cardShadow,padding:"24px 24px",color:l.ink},children:[a.jsx("style",{children:M}),a.jsx("style",{children:K}),a.jsx("style",{children:te}),a.jsx("style",{children:ae}),z&&!t&&a.jsxs("div",{className:"pass-fill",children:[a.jsxs("div",{className:"pass-fillhead",children:[a.jsx("span",{className:"pass-filllbl",children:p("pack.pass.fillTitle","Filled in")}),a.jsxs("span",{className:"pass-fillnum",children:[z.done,"/",z.total," · ",z.pct,"%"]})]}),a.jsx("div",{className:"pass-fillbar",children:a.jsx("div",{className:"pass-fillbar__on",style:{width:`${z.pct}%`},role:"progressbar","aria-valuenow":z.pct,"aria-valuemin":0,"aria-valuemax":100})})]}),a.jsx("div",{className:t?"pass-groups pass-groups--ro":"pass-groups",children:b.map(({group:n,rows:o},m)=>{var f;const x=n.key==="will";return a.jsxs("div",{className:`pass-block pk-tilt${x?" pass-block--dark":""}`,...se,children:[a.jsxs("div",{className:"pass-bhead",children:[a.jsxs("h5",{className:"pass-btitle",children:[a.jsx("span",{className:"pass-bnum",children:String(m+1).padStart(2,"0")}),p(n.i18n,n.labelEN)]}),t?null:n.editPanel?a.jsx($,{right:n.key==="will"?"will":"dogid.edit",dogId:e,children:a.jsxs("button",{type:"button",className:`pk-pill pk-pill--tap pass-edit${x?" pk-pill--dark":""}`,onClick:()=>r==null?void 0:r(n.editPanel),children:["✎ ",p("pack.pass.edit","edit")]})}):a.jsx($,{right:"dogid.edit",dogId:e,children:a.jsxs(D,{className:"pk-pill pk-pill--tap pass-edit",to:n.editHref?`${n.editHref}?dog=${e}`:`/pack/dogs/quiz/${n.editSection}?dog=${e}&field=${n.fields[0]}`,children:["✎ ",p("pack.pass.edit","edit")]})})]}),a.jsx("div",{className:"pass-brule"}),a.jsxs("dl",{style:{display:"grid",gridTemplateColumns:"auto minmax(0, 1fr)",gap:"6px 14px",alignItems:"baseline",margin:0,overflowWrap:"anywhere"},children:[((s==null?void 0:s[n.key])??[]).map(k=>a.jsx(oe,{row:k,tx:p},k.i18n)),o.map(({step:k,value:w})=>a.jsx(le,{step:k,value:w,trend:k.field==="health.weightKg"?v:null,dogId:e,editTo:k.editHref?`${k.editHref}?dog=${e}`:`/pack/dogs/quiz/${n.editSection}?dog=${e}&field=${k.field}`,onEditPanel:n.editPanel?()=>r==null?void 0:r(n.editPanel):void 0,readOnly:t,tx:p},k.field))]}),!t&&a.jsx(ue,{dogId:e,groupKey:n.key,value:typeof((f=d[`${n.key}.note`])==null?void 0:f.value)=="string"?String(d[`${n.key}.note`].value):"",tx:p})]},n.key)})})]}):null}function re(e,i,s){var c,t;if(e!=="nature.specials"||!i||!Array.isArray(i.value))return i;const r=(t=(c=s["nature.scores"])==null?void 0:c.value)==null?void 0:t.spec;return{...i,value:Z(i.value,r)}}function oe({row:e,tx:i}){return a.jsxs(a.Fragment,{children:[a.jsx("dt",{style:{fontFamily:y,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:i(e.i18n,e.labelEN)}),a.jsx("dd",{style:{margin:0},children:a.jsx("span",{className:e.value?"pass-fixed":"pass-fixed pass-fixed--empty",children:e.value||"—"})})]})}function le({step:e,value:i,trend:s,editTo:r,dogId:c,onEditPanel:t,readOnly:u=!1,tx:p}){const{lang:d}=X(),h=Y(d);if(!I(i)){const v=!!e.noProgress||!!e.optional;return u?a.jsxs(a.Fragment,{children:[a.jsx("dt",{style:{fontFamily:y,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:p(e.rowI18n,e.rowEN)}),a.jsx("dd",{style:{margin:0},children:a.jsx("span",{className:"pass-missing pass-missing--optional",children:"—"})})]}):a.jsxs(a.Fragment,{children:[a.jsx("dt",{style:{fontFamily:y,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:p(e.rowI18n,e.rowEN)}),a.jsx("dd",{style:{margin:0},children:t?a.jsx("button",{type:"button",onClick:t,title:p("pack.pass.missing","not filled in"),className:`pass-missing${v?" pass-missing--optional":""}`,style:{background:"transparent",border:0,padding:0,cursor:"pointer"},children:"—"}):a.jsx(D,{to:r,title:p("pack.pass.missing","not filled in"),className:`pass-missing${v?" pass-missing--optional":""}`,children:"—"})})]})}return a.jsxs(a.Fragment,{children:[a.jsx("dt",{style:{fontFamily:y,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:p(e.rowI18n,e.rowEN)}),a.jsxs("dd",{style:{margin:0,fontFamily:y,fontSize:14,color:"var(--pass-val)",fontWeight:500},children:[e.resultHref&&!u?a.jsx(D,{to:`${e.resultHref}&dog=${c}&from=id`,className:"pass-toresult",title:p("pack.pass.openResult","Open the full result"),children:E(e,i.value,p,h)}):E(e,i.value,p,h),s&&a.jsx("span",{style:{fontFamily:y,fontSize:10,color:l.growGreen,marginLeft:6},children:s}),a.jsx("span",{style:{fontFamily:y,fontSize:10,fontVariantNumeric:"tabular-nums",color:"var(--pass-faint)",marginLeft:7,whiteSpace:"nowrap"},children:pe(i.recordedAt,h)})]})]})}function E(e,i,s,r){const c=u=>W(e,u,s);if(Array.isArray(i))return a.jsx("span",{className:"inline-flex flex-wrap gap-1.5",children:i.map(u=>a.jsxs("span",{className:"pk-pill pass-chip",style:{fontFamily:y,fontSize:12,padding:"4px 12px",display:"inline-flex",alignItems:"center",gap:5},children:[a.jsx(R,{field:e.field,value:u,size:20}),c(String(u))]},String(u)))});const t=String(i);return e.kind==="date"?ce(t,r):e.kind==="number"?e.unit?`${t} ${e.unit}`:t:e.kind==="single"?G(e.field,t)?a.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:6},children:[a.jsx(R,{field:e.field,value:t,size:26}),c(t)]}):c(t):t}function R({field:e,value:i,size:s}){const r=G(e,i);return r?a.jsx("img",{src:r,alt:"","aria-hidden":!0,loading:"lazy",width:s,height:s,style:{width:s,height:s,objectFit:"contain",display:"block",flex:"0 0 auto"}}):null}function pe(e,i){const s=new Date(e);return Number.isNaN(s.getTime())?"":s.toLocaleDateString(i,{day:"numeric",month:"numeric",year:"numeric"})}function ce(e,i){const s=new Date(e);return Number.isNaN(s.getTime())?e:s.toLocaleDateString(i,{day:"numeric",month:"long",year:"numeric"})}function de(e,i){const s=new Date(e).getTime(),r=new Date(i).getTime();return Number.isNaN(s)||Number.isNaN(r)?0:Math.round((r-s)/(1e3*60*60*24*30.44))}function ue({dogId:e,groupKey:i,value:s,tx:r}){const[c,t]=g.useState(!1),[u,p]=g.useState(s),[d,h]=g.useState(!1),v=g.useRef(null);g.useEffect(()=>{p(s)},[s]),g.useEffect(()=>{var b;c&&((b=v.current)==null||b.focus())},[c]);const S=async()=>{const b=u.trim();if(b===s.trim()){t(!1);return}h(!0);try{await ee([{dogId:e,field:`${i}.note`,value:b||null,source:"profile"}]),t(!1)}finally{h(!1)}};return c?a.jsxs("div",{className:"pass-note",children:[a.jsx("textarea",{ref:v,value:u,onChange:b=>p(b.target.value.slice(0,240)),rows:3,placeholder:r("pack.pass.notePlaceholder","In your own words — what should anyone reading this know?"),className:"pf-field pf-field--flat",style:{width:"100%",borderRadius:8,padding:"8px 12px",fontFamily:y,fontSize:14,lineHeight:1.5,color:l.inkStrong,resize:"none",outline:"none"}}),a.jsxs("div",{className:"flex items-center justify-end gap-3",style:{marginTop:7},children:[a.jsx("button",{type:"button",className:"pass-noteadd",onClick:()=>{p(s),t(!1)},children:r("pack.pass.noteCancel","cancel")}),a.jsx("button",{type:"button",className:"pk-pill pk-pill--tap pass-share",onClick:S,disabled:d,children:d?r("pack.pass.noteSaving","saving…"):r("pack.pass.noteSave","save")})]})]}):a.jsx("div",{className:"pass-note",children:s?a.jsx($,{right:"dogid.edit",dogId:e,children:a.jsxs("p",{className:"pass-notetext",onClick:()=>t(!0),style:{cursor:"pointer"},children:["„",s,'"']})}):a.jsx($,{right:"dogid.edit",dogId:e,children:a.jsxs("button",{type:"button",className:"pass-noteadd",onClick:()=>t(!0),children:["✎ ",r("pack.pass.noteAdd","add a note in your own words")]})})})}export{be as D,ae as T,se as a};
