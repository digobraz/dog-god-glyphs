import{u as De,r as S,j as e,b as Ae,aQ as pe,aO as me,w as fe,L as y,a1 as ue,c as Ce,e as O,f as ge,g as Te,ah as Fe,a0 as w,y as Le,x as _e,U as ke}from"./index-DriUOdZL.js";import{A as he}from"./ActedBy-BR_9EWfq.js";import{P as se,S as xe,F as Pe,a as Z,q as V}from"./dogQuiz-CnwlZ10v.js";import{s as Re,n as Q}from"./natureQuiz-D2uHcOot.js";import{onDogEventsChange as Ge,readSeries as Ee,hasValue as D,readLatest as Oe,appendDogEvents as Be}from"./dogEvents-p0BnCK5N.js";import{R as C}from"./RightGate-BEa7gj1s.js";import{u as Me}from"./dogRights-CDnPOjZG.js";import{B as He}from"./BrandIcon-lowQpHlA.js";import{S as H}from"./SysIcon-CI9hudiL.js";const Ie=`
.pk-tilt{transform:perspective(900px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)) translateY(var(--tilt-l,0px));
  transition:transform .45s cubic-bezier(.2,.8,.2,1);}
.pk-tilt.is-tilting{transition:transform .12s ease-out;}
@media (prefers-reduced-motion:reduce){.pk-tilt{transform:none !important;}}
`,ne=3;function re(a,o,s){const d=a.getBoundingClientRect(),p=(o-d.left)/d.width-.5,n=(s-d.top)/d.height-.5;a.style.setProperty("--tilt-y",`${(p*2*ne).toFixed(2)}deg`),a.style.setProperty("--tilt-x",`${(-n*2*ne).toFixed(2)}deg`),a.style.setProperty("--tilt-l","-2px"),a.classList.add("is-tilting")}function X(a){a.style.removeProperty("--tilt-x"),a.style.removeProperty("--tilt-y"),a.style.removeProperty("--tilt-l"),a.classList.remove("is-tilting")}const We={onPointerMove:a=>{(a.pointerType==="mouse"||a.buttons)&&re(a.currentTarget,a.clientX,a.clientY)},onPointerDown:a=>re(a.currentTarget,a.clientX,a.clientY),onPointerLeave:a=>X(a.currentTarget),onPointerUp:a=>{a.pointerType!=="mouse"&&X(a.currentTarget)},onPointerCancel:a=>X(a.currentTarget)},i=Ae,M=fe.subblock,Y=fe.subblockDark,be=`
/* ✎ a „zdieľať" = pilulky. DNA .pk-pill (papyrusový gradient + 1.5px rgba(179,130,45,.55)
   + hover lift) — rozdiel medzi nimi nesie len veľkosť písma a výplň, nie iný rám. */
.pass-share{ display:inline-flex; align-items:center; gap:7px;
  font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; padding:8px 16px; }
.pass-share:disabled{ opacity:.5; cursor:default; }
.pass-edit{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:0.14em;
  text-transform:uppercase; padding:4px 12px; text-decoration:none; }
/* LAPIS NA DOG ID (Matej 27. 9. 2026 nad hárkom plany/nakres-dogid-detail-2026-09-27:
   „zmeň všetky zlaté veci na lapisové — progres bar, chipy atď."). Zlato ostáva len
   konštrukcii (rám karty, deliaca čiara) a čiernemu bloku závetu, kde by lapis zanikol. */
.pass-edit:not(.pk-pill--dark), .pass-chip, .pass-share{ ${Le(y.edge,_e.lapis,.08)} }
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
  background:${M.background}; border:${M.border}; border-radius:${M.borderRadius}px;
  padding:16px 16px 16px; box-shadow:${M.boxShadow};
  /* Inkoust bloku je premenná, nie natvrdo písaná farba v každom riadku — inak by sa
     tmavá varianta nedala prefarbiť: riadky si farbu nesú v inline style a ten CSS
     trieda neprebije. Takto stačí prepísať tri premenné na obale. */
  --pass-lbl:${i.inkWarm}; --pass-val:${i.inkStrong}; --pass-faint:${i.inkFaint}; }
/* ZÁVET JE ČIERNY (Matej 13.8.2026). Nie je to štýlová obmena — je to jediná sekcia
   dokladu, ktorá hovorí o smrti psa, a na papyruse mala rovnakú váhu ako obľúbená
   maškrta. Recept berie matrica (PACK_BOX.subblockDark), tu sa dolaďuje len inkoust.
   Rám a radius ostávajú zhodné so svetlými blokmi — v mriežke to má byť ich súrodenec.
   Panel na PÍSANIE závetu ostáva papyrusový zámerne: čierna je na čítanie dokladu,
   nie na vypĺňanie formulára. */
.pass-block--dark{ background:${Y.background}; border:${Y.border};
  box-shadow:${Y.boxShadow};
  /* 27. 9. 2026 Matej: „závet dajme lapisovým resp. gradientom zlatá–lapis (ako je na
     heroflow)" — tá istá plocha ako bublina vstupu (.hf-speak = var(--brand-gradient)).
     Recept rámu a tieňa ostáva z PACK_BOX.subblockDark, mení sa len výplň. */
  background:var(--brand-gradient);
  --pass-lbl:${i.onDarkDim}; --pass-val:${i.onDark}; --pass-faint:rgba(245,240,228,0.34); }
.pass-block--dark .pass-btitle{ color:rgba(245,240,228,0.92); }
.pass-block--dark .pass-brule{ opacity:.55; }
/* číslo sekcie je lapisové — na gradiente závetu by zaniklo, preto zlatý inkoust lapisu */
.pass-block--dark .pass-bnum{ color:${y.ink}; }
/* Červená chýbajúceho poľa musí na čiernej zosvetliť — ${i.alertRed} na ${i.pageBg} je pod
   čitateľnou hranicou. Rovnaký odtieň, len vyššia svetlosť. */
.pass-block--dark .pass-missing{ color:#D9705C; }
.pass-block--dark .pass-missing--optional{ color:rgba(245,240,228,0.34); }
.pass-block--dark .pass-fixed{ color:${i.onDark}; }
.pass-block--dark .pass-fixed--empty{ color:rgba(245,240,228,0.34); }
.pass-block--dark .pass-note{ border-top-color:${i.onDarkBorder}; }
.pass-block--dark .pass-notetext{ color:rgba(245,240,228,0.62); }
.pass-block--dark .pass-noteadd{ color:rgba(245,240,228,0.42); }
.pass-block--dark .pass-noteadd:hover{ color:rgba(245,240,228,0.88); }
.pass-bhead{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.pass-btitle{ display:flex; align-items:center; gap:9px; font-family:'Cinzel',serif; font-weight:700;
  font-size:16px; letter-spacing:0.14em; text-transform:uppercase; color:${i.inkStrong}; margin:0; }
.pass-bnum{ font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:.14em; font-variant-numeric:tabular-nums; color:${y.edge}; opacity:.75; }
/* deliaca čiara vnútri bloku = predpísaný token T.rule, nie vlastný gradient.
   POZOR: tento blok je JS template literal — spätný apostrof v komentári zhodí build. */
.pass-brule{ height:2px; margin:10px 0 12px; background:${i.rule}; opacity:.75; }
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
.pass-toresult:hover{ border-bottom-color:${y.edge}; opacity:.85; }
.pass-missing{ font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:600;
  letter-spacing:0.02em; color:${i.alertRed}; text-decoration:none; }
/* zámerne prázdne pole (zvláštna úloha) — pomlčka bez poplachu */
.pass-missing--optional{ color:${i.inkFaint}; }
.pass-missing:hover{ text-decoration:underline; }
/* KOMPLETNOSŤ DOKLADU. Prúžok je zámerne tenký a bez rámu — je to meradlo, nie ďalší
   blok; matrica sa naň nevzťahuje (nie je to karta ani podblok). Zlatá výplň je tá istá
   ako pilulka .pk-pill--gold, aby „hotové" malo v celom /packu jednu farbu. */
.pass-fill{ margin:2px 0 16px; }
.pass-fillhead{ display:flex; align-items:baseline; justify-content:space-between; gap:10px;
  margin-bottom:6px; }
.pass-filllbl{ font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:10px;
  letter-spacing:.26em; text-transform:uppercase; color:${y.edge}; }
.pass-fillnum{ font-family:'Space Grotesk',sans-serif; font-size:12px; font-variant-numeric:tabular-nums;
  color:${i.inkWarm}; white-space:nowrap; }
.pass-fillbar{ height:6px; border-radius:999px; background:${i.tileBg};
  border:1px solid ${i.border}; overflow:hidden; }
.pass-fillbar__on{ height:100%; border-radius:999px;
  background:linear-gradient(90deg,${y.lite} 0%,${y.edge} 100%); transition:width .4s ease; }
/* HLAVNÉ CTA dokladu — geometria .btn-gold (r8), výplň LAPIS. Písmo: cta. */
.pass-cta{ display:block; width:100%; box-sizing:border-box; margin:0 0 16px; padding:16px; border-radius:8px;
  font-family:${ue}; font-weight:700; font-size:16px; letter-spacing:.14em; text-transform:uppercase; /* písmo: cta */
  text-align:center; text-decoration:none; cursor:pointer;
  background:${y.grad}; color:${y.ink}; border:1px solid ${y.edge}; box-shadow:${Ce}; }
.pass-cta:hover{ background:${y.gradHover}; }
/* riadok, ktorý sa needituje (plemeno, narodenie, pohlavie) */
.pass-fixed{ font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:500;
  color:${i.inkStrong}; }
.pass-fixed--empty{ font-size:16px; font-weight:600; letter-spacing:0.02em; color:${i.inkFaint}; }
/* poznámka vlastnými slovami — to, čo z údajov robí psa */
.pass-note{ margin-top:12px; padding-top:12px; border-top:1px dashed ${i.hairline}; }
.pass-notetext{ font-family:'Space Grotesk',sans-serif; font-size:14px; line-height:1.55;
  color:${i.inkWarm}; font-style:italic; white-space:pre-wrap; margin:0; }
.pass-noteadd{ font-family:'Space Grotesk',sans-serif; font-size:10px; letter-spacing:0.14em;
  text-transform:uppercase; color:rgba(31,26,14,.42); background:transparent; border:0; padding:0;
  cursor:pointer; }
.pass-noteadd:hover{ color:${i.inkStrong}; }
`,Ke=["howWorks","social","temperament"],Ve={temperament:["nature.element","nature.role"]};function da({dogId:a,bare:o=!1,fixedRows:s,onEditPanel:d,values:p,readOnly:n=!1,chapters:m,memorial:k=!1}){const u=De(),g=(c,r)=>{const b=u(c);return b===c?r:b},T=Me(),A=!!m&&!T.can(a,"will"),[f,W]=S.useState(null),[I,F]=S.useState(null);S.useEffect(()=>{if(p){W(p);return}let c=!0;const r=()=>{Oe(a).then(h=>{c&&W(h)})};r();const b=Ge(r);return()=>{c=!1,b()}},[a,p]),S.useEffect(()=>{if(n)return;let c=!0;return Ee(a,"health.weightKg").then(r=>{if(!c||r.length<2){F(null);return}const b=Number(r[r.length-1].value),h=Number(r[r.length-2].value);if(!Number.isFinite(b)||!Number.isFinite(h)){F(null);return}const x=b-h;if(Math.abs(x)<.05){F(null);return}const t=Qe(r[r.length-2].recordedAt,r[r.length-1].recordedAt),v=t>=1?` / ${t} ${g("pack.pass.months","mo.")}`:"";F(`${x>0?"↗ +":"↘ −"}${Math.abs(x).toFixed(1)} kg${v}`)}),()=>{c=!1}},[a]);const L=S.useMemo(()=>f?(n?se.filter(r=>Ke.includes(r.key)):se.filter(r=>!(A&&r.key==="will"))).map(r=>{const h=(n?[...Ve[r.key]??[],...r.fields]:r.fields).map(x=>({step:xe[x],value:ye(x,f[x],f)})).filter(x=>!!x.step&&(!Pe.has(x.step.field)||D(x.value)));return{group:r,rows:h}}).filter(r=>r.rows.length>0):[],[f,n,A]),$=S.useMemo(()=>{if(!f||k&&m)return null;const c=Z.filter(h=>!(A&&h.field.startsWith("will."))),r=c.length,b=c.filter(h=>D(f[h.field])).length;return{done:b,total:r,pct:r?Math.round(b/r*100):0}},[f,A,k,m]),G=S.useMemo(()=>{if(!f||n||k&&m)return null;const c=new Set(Z.filter(r=>!(A&&r.field.startsWith("will."))).map(r=>r.field));for(const{group:r,rows:b}of L){const h=b.find(({step:x})=>c.has(x.field)&&!D(f[x.field]));if(h)return r.editPanel?{panel:r.editPanel,to:null}:{panel:null,to:h.step.editHref?`${h.step.editHref}?dog=${a}`:`/pack/dogs/quiz/${r.editSection}?dog=${a}&field=${h.step.field}`}}return null},[L,f,n,a,A,k,m]);return f?m?e.jsx(Ye,{dogId:a,groups:L,latest:f,fixedRows:s??{},fill:$,nextMissing:G,onEditPanel:d,weightTrend:I,tx:g,memorial:k,...m}):e.jsxs("section",{style:o?{color:i.ink}:{background:i.cardGrad,border:`1.5px solid ${i.cardEdge}`,borderRadius:16,boxShadow:i.cardShadow,padding:"24px 24px",color:i.ink},children:[e.jsx("style",{children:pe}),e.jsx("style",{children:me}),e.jsx("style",{children:be}),e.jsx("style",{children:Ie}),$&&!n&&e.jsxs("div",{className:"pass-fill",children:[e.jsxs("div",{className:"pass-fillhead",children:[e.jsx("span",{className:"pass-filllbl",children:g("pack.pass.fillTitle","Filled in")}),e.jsxs("span",{className:"pass-fillnum",children:[$.done,"/",$.total," · ",$.pct,"%"]})]}),e.jsx("div",{className:"pass-fillbar",children:e.jsx("div",{className:"pass-fillbar__on",style:{width:`${$.pct}%`},role:"progressbar","aria-valuenow":$.pct,"aria-valuemin":0,"aria-valuemax":100})})]}),$&&!n&&$.done<$.total&&G&&e.jsx(C,{right:"dogid.edit",dogId:a,children:G.panel?e.jsxs("button",{type:"button",className:"pass-cta",onClick:()=>d==null?void 0:d(G.panel),children:[g("pack.pass.fillCta","Fill in DOG ID")," · ",$.total-$.done," ",g("pack.pass.fillMissing","missing")]}):e.jsxs(O,{className:"pass-cta",to:G.to,children:[g("pack.pass.fillCta","Fill in DOG ID")," · ",$.total-$.done," ",g("pack.pass.fillMissing","missing")]})}),e.jsx("div",{className:n?"pass-groups pass-groups--ro":"pass-groups",children:L.map(({group:c,rows:r},b)=>{var x;const h=c.key==="will";return e.jsxs("div",{className:`pass-block pk-tilt${h?" pass-block--dark":""}`,...We,children:[e.jsxs("div",{className:"pass-bhead",children:[e.jsxs("h5",{className:"pass-btitle",children:[e.jsx("span",{className:"pass-bnum",children:String(b+1).padStart(2,"0")}),g(c.i18n,c.labelEN)]}),n?null:c.editPanel?e.jsx(C,{right:c.key==="will"?"will":"dogid.edit",dogId:a,children:e.jsxs("button",{type:"button",className:`pk-pill pk-pill--tap pass-edit${h?" pk-pill--dark":""}`,onClick:()=>d==null?void 0:d(c.editPanel),children:[e.jsx(H,{name:"ceruzka",size:18,style:{display:"inline-block",verticalAlign:"middle"}})," ",g("pack.pass.edit","edit")]})}):e.jsx(C,{right:"dogid.edit",dogId:a,children:e.jsxs(O,{className:"pk-pill pk-pill--tap pass-edit",to:c.editHref?`${c.editHref}?dog=${a}`:`/pack/dogs/quiz/${c.editSection}?dog=${a}&field=${c.fields[0]}`,children:[e.jsx(H,{name:"ceruzka",size:18,style:{display:"inline-block",verticalAlign:"middle"}})," ",g("pack.pass.edit","edit")]})})]}),e.jsx("div",{className:"pass-brule"}),e.jsxs("dl",{style:{display:"grid",gridTemplateColumns:"auto minmax(0, 1fr)",gap:"6px 14px",alignItems:"baseline",margin:0,overflowWrap:"anywhere"},children:[((s==null?void 0:s[c.key])??[]).map(t=>e.jsx(Ze,{row:t,tx:g},t.i18n)),r.map(({step:t,value:v})=>e.jsx(Je,{step:t,value:v,trend:t.field==="health.weightKg"?I:null,dogId:a,editTo:t.editHref?`${t.editHref}?dog=${a}`:`/pack/dogs/quiz/${c.editSection}?dog=${a}&field=${t.field}`,onEditPanel:c.editPanel?()=>d==null?void 0:d(c.editPanel):void 0,readOnly:n,tx:g},t.field))]}),!n&&e.jsx(we,{dogId:a,groupKey:c.key,value:typeof((x=f[`${c.key}.note`])==null?void 0:x.value)=="string"?String(f[`${c.key}.note`].value):"",tx:g})]},c.key)})})]}):null}const qe={identity:"dogid-identity",health:"dogid-health",vax:"dogid-vax",food:"dogid-food",howWorks:"dogid-works",social:"dogid-social",temperament:"dogid-temperament",contacts:"dogid-contacts",will:"dogid-will"},oe={"dogid-identity":"dog-id","dogid-health":"zdravie","dogid-vax":"kalendar","dogid-food":"krmenie","dogid-works":"modul-zaklad","dogid-social":"socializacia","dogid-temperament":"modul-povaha","dogid-contacts":"obalka","dogid-docs":"certifikat","dogid-wall":"odkaz-na-stene"},le=["nature.element","nature.role","nature.specials"],Ue=`
.dic-cta{ position:relative; overflow:hidden; padding:16px 16px 24px; }
.dic-cta small{ display:block; margin-top:4px; font-family:${w}; font-weight:500; font-size:12px; letter-spacing:.02em; text-transform:none; opacity:.85; }
.dic-cta .dic-bar{ position:absolute; left:0; bottom:0; height:4px; border-radius:0; background:transparent; }
.dic-cta .dic-bar > span{ display:block; border-radius:0; background:linear-gradient(90deg,#EDCE7C,${i.accentGold}); }
/* PLOCHA (9. 11. 2026): kapitola nie je karta, je to sekcia s vlasovou čiarou; karta ostáva len pre tmavý ZÁVET. */
.dic-card{ background:none; border:0; border-bottom:1px solid ${i.cardEdge}; border-radius:0; box-shadow:none; margin-bottom:0; }
.dic-card.dic-dark{ border:1px solid ${i.cardEdge}; border-radius:16px; margin:12px 0; }
.dic-card.dic-trio{ border-bottom:0; margin-bottom:8px; }
.dic-trio{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; padding:16px 8px; text-align:center; margin-bottom:16px; }
.dic-trio.two{ grid-template-columns:repeat(2,minmax(0,1fr)); }
.dic-tr{ display:block; color:inherit; text-decoration:none; min-width:0; }
button.dic-tr{ background:none; border:0; padding:0; width:100%; font:inherit; cursor:pointer; }
.dic-tr img{ width:72px; height:72px; object-fit:contain; display:block; margin:0 auto 8px; }
.dic-tr em{ display:block; font-style:normal; font-family:${w}; font-weight:500; font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:${i.inkWarm}; }
.dic-tr b{ font-family:${w}; font-weight:600; font-size:14px; color:${i.inkStrong}; }
.dic-tr .dic-q{ width:72px; height:72px; margin:0 auto 8px; border-radius:50%; border:1px dashed ${y.edge}; display:flex; align-items:center; justify-content:center; font-family:${w}; font-size:24px; color:${y.edge}; }
.dic-coin{ flex:none; width:44px; height:44px; border-radius:50%; background:${i.cardGrad}; border:1px solid ${i.cardEdge}; display:flex; align-items:center; justify-content:center; box-shadow:${i.cardShadow}; }
.dic-hd{ display:flex; align-items:center; gap:12px; width:100%; background:none; border:0; padding:12px; text-align:left; cursor:pointer; color:inherit; }
.dic-ttl{ flex:1; min-width:0; }
.dic-ttl h3{ margin:0; font-family:${ue}; font-weight:700; font-size:14px; letter-spacing:.14em; text-transform:uppercase; color:${i.inkStrong}; } /* písmo: nadpis */
.dic-ttl p{ margin:0; font-family:${w}; font-size:12px; color:${i.inkWarm}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dic-ttl p.miss{ color:${i.alertRed}; }
.dic-ok{ flex:none; position:relative; width:20px; height:20px; border-radius:50%; background:${i.growGreen}; }
.dic-ok::after{ content:''; position:absolute; left:7px; top:3px; width:5px; height:10px; border:solid #EAF7ED; border-width:0 2px 2px 0; transform:rotate(45deg); }
.dic-chev{ flex:none; width:8px; height:8px; margin:0 4px; border:solid ${i.inkWarm}; border-width:0 2px 2px 0; transform:rotate(45deg); transition:transform .2s; }
.dic-open .dic-chev{ transform:rotate(-135deg); }
.dic-bd{ padding:0 12px 12px; }
.dic-tiles{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:8px; }
.dic-t{ display:block; min-width:0; min-height:56px; padding:8px 12px; border-radius:12px; background:${M.background}; border:${M.border}; text-decoration:none; color:${i.inkStrong}; overflow-wrap:anywhere; font-family:${w}; font-size:14px; font-weight:600; text-align:left; }
.dic-t.w{ grid-column:1/-1; }
.dic-t em{ display:block; font-style:normal; font-weight:500; font-size:10px; letter-spacing:.14em; color:${i.inkWarm}; }
.dic-t.e{ background:${y.fill}; border:1px dashed ${y.edge}; color:${y.edge}; font-size:12px; font-weight:500; cursor:pointer; }
.dic-foot{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:12px; font-family:${w}; font-size:10px; color:${i.inkWarm}; }
/* ZÁVET ostáva tmavý — ten istý význam ako .pass-block--dark. */
.dic-dark{ background:var(--brand-gradient); }
.dic-dark .dic-ttl h3{ color:${y.ink}; }
.dic-dark .dic-ttl p.miss{ color:#D9705C; }
.dic-dark .dic-chev{ border-color:${y.ink}; }
.dic-dark .dic-t{ background:rgba(245,240,228,0.08); border:1px solid ${i.onDarkBorder}; color:${i.onDark}; }
.dic-dark .dic-t em, .dic-dark .dic-foot{ color:${i.onDarkDim}; }
.dic-dark .dic-t.e{ border-style:dashed; color:${y.ink}; }
.dic-dark .pass-noteadd{ color:rgba(245,240,228,0.42); }
.dic-dark .pass-notetext{ color:rgba(245,240,228,0.62); }
.dic-dark .pass-note{ border-top-color:${i.onDarkBorder}; }
`,Xe=a=>({display:"block",width:`${Math.min(100,Math.max(0,a))}%`});function de(a,o,s,d){if(Array.isArray(o))return o.map(n=>V(a,String(n),s)).join(", ");const p=String(o);return a.kind==="date"?ve(p,d):a.kind==="number"?a.unit?`${p} ${a.unit}`:p:a.kind==="single"?V(a,p,s):p}function Ye({dogId:a,groups:o,latest:s,fixedRows:d,fill:p,nextMissing:n,onEditPanel:m,weightTrend:k,tx:u,head:g,extra:T,footer:A,memorial:f}){const{lang:W}=ge(),I=Te(),F=ke(W),[L,$]=S.useState("identity"),G=S.useMemo(()=>new Set(Z.map(t=>t.field)),[]),c=p?p.total-p.done:0,r=p&&e.jsxs(e.Fragment,{children:[u("pack.pass.fillCta","Fill in DOG ID"),e.jsx("small",{children:u("pack.dogs2.left","{n} questions left · about {m} min").replace("{n}",String(c)).replace("{m}",String(Math.max(1,Math.ceil(c*10/60))))}),e.jsx("span",{className:"pk-progress dic-bar",children:e.jsx("span",{className:"pk-progress__fill",style:Xe(p.pct)})})]}),b=le.flatMap(t=>{const v=xe[t];if(!v)return[];const j=ye(t,s[t],s);if(t==="nature.specials"&&!D(j))return[];const z=Array.isArray(j==null?void 0:j.value)?j.value[0]:j==null?void 0:j.value,R=t==="nature.element"?u("pack.dogs2.element","Element"):u(v.rowI18n,v.rowEN),_=D(j)&&v.resultHref?`${v.resultHref}&dog=${a}&from=id`:`${v.editHref}?dog=${a}`,P=D(j)?Q(t,z):"";if(!D(j)){const B=e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"dic-q",children:"?"}),e.jsx("em",{children:R}),e.jsx("b",{children:f?"—":u("pack.pass.addValue","add")})]});return[f?e.jsx("div",{className:"dic-tr",children:B},t):e.jsx(C,{right:"dogid.edit",dogId:a,children:e.jsx("button",{type:"button",className:"dic-tr",onClick:()=>I(_),children:B})},t)]}return[e.jsxs(O,{className:"dic-tr",to:_,children:[P?e.jsx("img",{src:P,alt:""}):e.jsx("span",{className:"dic-q",children:"?"}),e.jsx("em",{children:R}),e.jsx("b",{children:V(v,String(z),u)})]},t)]}),h=(t,v)=>t.editPanel?e.jsx(C,{right:t.key==="will"?"will":"dogid.edit",dogId:a,children:e.jsxs("button",{type:"button",className:`pk-pill pk-pill--tap pass-edit${v?" pk-pill--dark":""}`,onClick:()=>m==null?void 0:m(t.editPanel),children:[e.jsx(H,{name:"ceruzka",size:18,style:{display:"inline-block",verticalAlign:"middle"}})," ",u("pack.pass.edit","edit")]})}):e.jsx(C,{right:"dogid.edit",dogId:a,children:e.jsxs(O,{className:"pk-pill pk-pill--tap pass-edit",to:`/pack/dogs/quiz/${t.editSection}?dog=${a}&field=${t.fields[0]}`,children:[e.jsx(H,{name:"ceruzka",size:18,style:{display:"inline-block",verticalAlign:"middle"}})," ",u("pack.pass.edit","edit")]})}),x=(t,v,j,z,R,_,P,B)=>e.jsxs("div",{className:`dic-card${P?" dic-dark":""}${L===t?" dic-open":""}`,children:[e.jsxs("button",{type:"button",className:"dic-hd","aria-expanded":L===t,onClick:()=>$(L===t?"":t),children:[e.jsx("span",{className:"dic-coin",children:oe[j]?e.jsx(H,{name:oe[j],size:30}):e.jsx(He,{name:j,size:24,style:void 0})}),e.jsxs("span",{className:"dic-ttl",children:[e.jsx("h3",{children:v}),z&&e.jsx("p",{className:R?"miss":"",children:z})]}),_&&e.jsx("span",{className:"dic-ok"}),e.jsx("span",{className:"dic-chev"})]}),L===t&&e.jsx("div",{className:"dic-bd",children:B})]},t);return e.jsxs("section",{style:{color:i.ink,textAlign:"left"},children:[e.jsx("style",{children:pe}),e.jsx("style",{children:me}),e.jsx("style",{children:be}),e.jsx("style",{children:Fe}),e.jsx("style",{children:Ue}),p&&p.done<p.total&&n&&e.jsx(C,{right:"dogid.edit",dogId:a,children:n.panel?e.jsx("button",{type:"button",className:"pass-cta dic-cta",onClick:()=>m==null?void 0:m(n.panel),children:r}):e.jsx(O,{className:"pass-cta dic-cta",to:n.to,children:r})}),b.length>0&&e.jsx("div",{className:`dic-card dic-trio${b.length===2?" two":""}`,children:b}),g,o.map(({group:t,rows:v})=>{var te;const j=t.key==="will",z=v.filter(l=>!le.includes(l.step.field)),R=d[t.key]??[],_=f?[]:z.filter(l=>G.has(l.step.field)&&!D(l.value)),P=z.filter(l=>D(l.value)),B=[...R.map(l=>l.value??""),...P.map(l=>de(l.step,l.value.value,u,F))].filter(Boolean).slice(0,3).join(" · "),$e=_.length?`${u("pack.pass.missingList","missing")}: ${_.map(l=>u(l.step.rowI18n,l.step.rowEN).toLowerCase()).join(", ")}`:B,ee=P.map(l=>l.value.recordedAt).sort().pop(),ae=[...R.map(l=>({key:l.i18n,wide:(l.value??"").length>16,node:N=>e.jsxs("div",{className:`dic-t${N?" w":""}`,children:[e.jsx("em",{children:u(l.i18n,l.labelEN)}),l.value||"—"]},l.i18n)})),...z.map(({step:l,value:N})=>{const K=l.editHref?`${l.editHref}?dog=${a}`:`/pack/dogs/quiz/${t.editSection}?dog=${a}&field=${l.field}`,E=u(l.rowI18n,l.rowEN);if(!D(N)){const U=ie=>f?e.jsxs("div",{className:`dic-t${ie?" w":""}`,children:[e.jsx("em",{children:E}),"—"]},l.field):e.jsx(C,{right:t.key==="will"?"will":"dogid.edit",dogId:a,children:e.jsxs("button",{type:"button",className:`dic-t e${ie?" w":""}`,onClick:()=>t.editPanel?m==null?void 0:m(t.editPanel):I(K),children:[e.jsx("em",{children:E}),"+ ",u("pack.pass.addValue","add")]})},l.field);return{key:l.field,wide:E.length>16,node:U}}const Ne=de(l,N.value,u,F),ze=Array.isArray(N.value)||Ne.length>16;return{key:l.field,wide:ze,node:U=>e.jsxs("div",{className:`dic-t${U?" w":""}`,children:[e.jsx("em",{children:E}),J(l,N.value,u,F),l.field==="health.weightKg"&&k&&e.jsx("span",{style:{fontFamily:w,fontSize:10,color:i.growGreen,marginLeft:8},children:k}),(N.actedBy||N.actedName)&&e.jsxs(e.Fragment,{children:[" ",e.jsx(he,{id:N.actedBy,name:N.actedName})]})]},l.field)}})];let q=0;const Se=ae.map((l,N)=>{const K=ae[N+1],E=l.wide||q===0&&(!K||K.wide);return q=E?0:(q+1)%2,l.node(E)});return x(t.key,u(t.i18n,t.labelEN),qe[t.key]??"dogid-identity",$e,_.length>0,t.key==="vax"?z.length>0&&P.length===z.length:_.length===0&&P.length+R.length>0,j,e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"dic-tiles",children:Se}),e.jsx(we,{dogId:a,groupKey:t.key,value:typeof((te=s[`${t.key}.note`])==null?void 0:te.value)=="string"?String(s[`${t.key}.note`].value):"",tx:u}),e.jsxs("div",{className:"dic-foot",children:[e.jsx("span",{children:ee?u("pack.pass.updated","Updated {date}").replace("{date}",je(ee,F)):""}),h(t,j)]})]}))}),T.map(t=>x(t.key,t.title,t.icon,t.sub,!1,!1,!1,t.body)),A]})}function ye(a,o,s){var p,n;if(a!=="nature.specials"||!o||!Array.isArray(o.value))return o;const d=(n=(p=s["nature.scores"])==null?void 0:p.value)==null?void 0:n.spec;return{...o,value:Re(o.value,d)}}function Ze({row:a,tx:o}){return e.jsxs(e.Fragment,{children:[e.jsx("dt",{style:{fontFamily:w,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:o(a.i18n,a.labelEN)}),e.jsx("dd",{style:{margin:0},children:e.jsx("span",{className:a.value?"pass-fixed":"pass-fixed pass-fixed--empty",children:a.value||"—"})})]})}function Je({step:a,value:o,trend:s,editTo:d,dogId:p,onEditPanel:n,readOnly:m=!1,tx:k}){const{lang:u}=ge(),g=ke(u);if(!D(o)){const T=!!a.noProgress||!!a.optional;return m?e.jsxs(e.Fragment,{children:[e.jsx("dt",{style:{fontFamily:w,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:k(a.rowI18n,a.rowEN)}),e.jsx("dd",{style:{margin:0},children:e.jsx("span",{className:"pass-missing pass-missing--optional",children:"—"})})]}):e.jsxs(e.Fragment,{children:[e.jsx("dt",{style:{fontFamily:w,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:k(a.rowI18n,a.rowEN)}),e.jsx("dd",{style:{margin:0},children:n?e.jsx("button",{type:"button",onClick:n,title:k("pack.pass.missing","not filled in"),className:`pass-missing${T?" pass-missing--optional":""}`,style:{background:"transparent",border:0,padding:0,cursor:"pointer"},children:"—"}):e.jsx(O,{to:d,title:k("pack.pass.missing","not filled in"),className:`pass-missing${T?" pass-missing--optional":""}`,children:"—"})})]})}return e.jsxs(e.Fragment,{children:[e.jsx("dt",{style:{fontFamily:w,fontSize:12,color:"var(--pass-lbl)",whiteSpace:"nowrap"},children:k(a.rowI18n,a.rowEN)}),e.jsxs("dd",{style:{margin:0,fontFamily:w,fontSize:14,color:"var(--pass-val)",fontWeight:500},children:[a.resultHref&&!m?e.jsx(O,{to:`${a.resultHref}&dog=${p}&from=id`,className:"pass-toresult",title:k("pack.pass.openResult","Open the full result"),children:J(a,o.value,k,g)}):J(a,o.value,k,g),s&&e.jsx("span",{style:{fontFamily:w,fontSize:10,color:i.growGreen,marginLeft:6},children:s}),e.jsx("span",{style:{fontFamily:w,fontSize:10,fontVariantNumeric:"tabular-nums",color:"var(--pass-faint)",marginLeft:7,whiteSpace:"nowrap"},children:je(o.recordedAt,g)}),(o.actedBy||o.actedName)&&e.jsxs(e.Fragment,{children:[" ",e.jsx(he,{id:o.actedBy,name:o.actedName})]})]})]})}function J(a,o,s,d){const p=m=>V(a,m,s);if(Array.isArray(o))return e.jsx("span",{className:"inline-flex flex-wrap gap-1.5",children:o.map(m=>e.jsxs("span",{className:"pk-pill pass-chip",style:{fontFamily:w,fontSize:12,padding:"4px 12px",display:"inline-flex",alignItems:"center",gap:5},children:[e.jsx(ce,{field:a.field,value:m,size:20}),p(String(m))]},String(m)))});const n=String(o);return a.kind==="date"?ve(n,d):a.kind==="number"?a.unit?`${n} ${a.unit}`:n:a.kind==="single"?Q(a.field,n)?e.jsxs("span",{style:{display:"inline-flex",alignItems:"center",gap:6},children:[e.jsx(ce,{field:a.field,value:n,size:26}),p(n)]}):p(n):n}function ce({field:a,value:o,size:s}){const d=Q(a,o);return d?e.jsx("img",{src:d,alt:"","aria-hidden":!0,loading:"lazy",width:s,height:s,style:{width:s,height:s,objectFit:"contain",display:"block",flex:"0 0 auto"}}):null}function je(a,o){const s=new Date(a);return Number.isNaN(s.getTime())?"":s.toLocaleDateString(o,{day:"numeric",month:"numeric",year:"numeric"})}function ve(a,o){const s=new Date(a);return Number.isNaN(s.getTime())?a:s.toLocaleDateString(o,{day:"numeric",month:"long",year:"numeric"})}function Qe(a,o){const s=new Date(a).getTime(),d=new Date(o).getTime();return Number.isNaN(s)||Number.isNaN(d)?0:Math.round((d-s)/(1e3*60*60*24*30.44))}function we({dogId:a,groupKey:o,value:s,tx:d}){const[p,n]=S.useState(!1),[m,k]=S.useState(s),[u,g]=S.useState(!1),T=S.useRef(null);S.useEffect(()=>{k(s)},[s]),S.useEffect(()=>{var f;p&&((f=T.current)==null||f.focus())},[p]);const A=async()=>{const f=m.trim();if(f===s.trim()){n(!1);return}g(!0);try{await Be([{dogId:a,field:`${o}.note`,value:f||null,source:"profile"}]),n(!1)}finally{g(!1)}};return p?e.jsxs("div",{className:"pass-note",children:[e.jsx("textarea",{ref:T,value:m,onChange:f=>k(f.target.value.slice(0,240)),rows:3,placeholder:d("pack.pass.notePlaceholder","In your own words — what should anyone reading this know?"),className:"pf-field pf-field--flat",style:{width:"100%",borderRadius:8,padding:"8px 12px",fontFamily:w,fontSize:14,lineHeight:1.5,color:i.inkStrong,resize:"none",outline:"none"}}),e.jsxs("div",{className:"flex items-center justify-end gap-3",style:{marginTop:7},children:[e.jsx("button",{type:"button",className:"pass-noteadd",onClick:()=>{k(s),n(!1)},children:d("pack.pass.noteCancel","cancel")}),e.jsx("button",{type:"button",className:"pk-pill pk-pill--tap pass-share",onClick:A,disabled:u,children:u?d("pack.pass.noteSaving","saving…"):d("pack.pass.noteSave","save")})]})]}):e.jsx("div",{className:"pass-note",children:s?e.jsx(C,{right:"dogid.edit",dogId:a,children:e.jsxs("p",{className:"pass-notetext",onClick:()=>n(!0),style:{cursor:"pointer"},children:["„",s,'"']})}):e.jsx(C,{right:"dogid.edit",dogId:a,children:e.jsxs("button",{type:"button",className:"pass-noteadd",onClick:()=>n(!0),children:[e.jsx(H,{name:"ceruzka",size:18,style:{display:"inline-block",verticalAlign:"middle"}})," ",d("pack.pass.noteAdd","add a note in your own words")]})})})}export{da as D,ye as c,de as p};
