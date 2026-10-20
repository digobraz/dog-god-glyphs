import{r as o,j as a}from"./index-7PctGTam.js";import{h as q}from"./hekthor-GYpD1FGC.js";import{h as ee,s as ae}from"./consent-28X3-hgX.js";import{HRANICA_KEY as H,FILL_BAND as y,FILL_MSG as te}from"./flowFill-CVhoi5B9.js";import{D as K,B as oe,N as le,f as re}from"./hekthorFaces-myd4lVXL.js";import{D as se,m as ne,T as _,c as ie,w as C,s as de}from"./devSeed-DO6C8UrH.js";const A=[{label:"Nový vstup",steps:[{name:"1 · Fotka",path:"/lab/scena",popup:"photo",state:"done"},{name:"2 · Meno",path:"/heroglyph/name",state:"done"},{name:"3 · Svorka",path:"/heroglyph/dogs",state:"done"},{name:"4 · E-mail",path:"/heroglyph/email",state:"done"},{name:"5 · Podstata",path:"/heroglyph/essence",state:"done"},{name:"6 · Patrón",path:"/heroglyph/breed",state:"done"},{name:"7 · Povaha",path:"/heroglyph/dog-character",state:"done"},{name:"8 · Majiteľ",path:"/heroglyph/owner-info",state:"done"},{name:"9 · Odhalenie + odkaz",path:"/heroglyph/reveal",state:"done"},{name:"10 · Pokladňa",path:"/checkout",state:"done"},{name:"10a · Zadržanie (popup)",path:"/checkout?stay=1",state:"done"},{name:"10b · Hotovo nezaplatený (stav zadržania)",path:"/checkout?stay=done",state:"done"},{name:"11 · Vitaj → Poradie → NA STENU",path:"/heroglyph/welcome",state:"done"}]}],F=[{id:"phone",label:"Telefón",w:390,h:844},{id:"small",label:"Úzke okno",w:500,h:880},{id:"desk",label:"Počítač",w:1280,h:780}],ce={label:"bez fotky"};function ye(){const[s,n]=o.useState({...se}),[d,b]=o.useState("portrait"),[u,S]=o.useState("small"),[l,v]=o.useState(null),[k,f]=o.useState(0),[I,j]=o.useState(!1),[N,P]=o.useState(!1),O=o.useRef(null),[T,M]=o.useState({}),[c,E]=o.useState([]),[$,V]=o.useState(()=>{try{return localStorage.getItem(H)==="1"}catch{return!1}});o.useEffect(()=>{try{localStorage.setItem(H,$?"1":"0")}catch{}},[$]),o.useEffect(()=>{const e=t=>{var i;if(((i=t.data)==null?void 0:i.type)!==te||!t.data.fill)return;const r=t.data.fill;M(p=>({...p,[`${r.path}|${r.sirka}`]:r})),E(p=>{var B;return((B=p[0])==null?void 0:B.path)===r.path?p.slice(1):p})};return window.addEventListener("message",e),()=>window.removeEventListener("message",e)},[]);const g=F.find(e=>e.id===u)??F[1],w=o.useMemo(()=>A[0].steps.filter(e=>e.path.startsWith("/heroglyph/")||e.path==="/checkout"),[]),R=o.useMemo(()=>F.filter(e=>e.id==="phone"||e.id==="desk"),[]),U=()=>{C({...s}),E(w.flatMap(e=>R.map(t=>({path:e.path,w:t.w,h:t.h}))))};o.useEffect(()=>{if(c.length===0)return;const e=setTimeout(()=>E(t=>t.slice(1)),6e3);return()=>clearTimeout(e)},[c]);const[x,Z]=o.useState(()=>{try{const e=localStorage.getItem(K);return e?JSON.parse(e):{}}catch{return{}}}),D=e=>{Z(e);try{localStorage.setItem(K,JSON.stringify(e))}catch{}},h=l?(e=>{if(e.startsWith("/checkout")&&e.includes("stay=done"))return"stay-done";const t=e.match(/^\/heroglyph\/([^/?#]+)/);return t?t[1]:e.startsWith("/checkout")&&e.includes("stay=1")?"stay":null})(l.path):null,m=h?oe[h]??1:1,z=h?x[h]??m:m,Y=e=>{h&&(D({...x,[h]:e}),f(t=>t+1))},W=()=>{if(!h)return;const e={...x};delete e[h],D(e),f(t=>t+1)},G=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(x,null,2))}catch{}};o.useEffect(()=>{if(N)try{localStorage.removeItem("dogypt_consent")}catch{}else ee()||ae({analytics:!1,marketing:!1})},[N]),o.useEffect(()=>{if(d==="custom")return;if(d==="none"){n(t=>({...t,photoUrl:"",photoLabel:"bez fotky"}));return}let e=!0;return j(!0),ne(d,q).then(t=>{var i;if(!e)return;const r=((i=_.find(p=>p.id===d))==null?void 0:i.label)??"";n(p=>({...p,photoUrl:t,photoLabel:r}))}).finally(()=>e&&j(!1)),()=>{e=!1}},[d]);const J=e=>{C({...s,popup:e.popup??null}),v(e),f(t=>t+1)},Q=()=>{l&&(C({...s,popup:l.popup??null}),f(e=>e+1))},X=async e=>{if(e){j(!0);try{const t=await de(e);b("custom"),n(r=>({...r,photoUrl:t,photoLabel:`vlastná · ${e.name}`}))}finally{j(!1)}}},L=o.useMemo(()=>{const e=A[0].steps;return{done:e.filter(t=>t.state==="done").length,all:e.length}},[]);return a.jsxs("div",{className:"hfl-root",children:[a.jsx("style",{children:he}),a.jsxs("aside",{className:"hfl-side",children:[a.jsxs("div",{className:"hfl-brand",children:[a.jsx("b",{children:"HEROFLOW"}),a.jsxs("span",{children:["dielňa nového vstupu · ",L.done,"/",L.all," hotových"]})]}),A.map(e=>a.jsxs("div",{children:[a.jsx("div",{className:"hfl-head",children:e.label}),e.steps.map(t=>a.jsxs("button",{type:"button",className:`hfl-step is-${t.state}${(l==null?void 0:l.name)===t.name?" is-here":""}`,onClick:()=>J(t),children:[a.jsx("span",{className:"dot"}),a.jsx("span",{className:"txt",children:t.name}),a.jsx("span",{className:"hfl-chips2",children:R.map(r=>{const i=T[`${t.path}|${r.w}`],p=i?i.pretecie>0?"over":i.vyplnPct<y.min?"thin":"ok":"none";return a.jsx("span",{className:`hfl-fill ${p}`,title:i?`${r.label} ${r.w}×${r.h} — výplň ${i.vyplnPct} %${i.pretecie>0?`, preteká o ${i.pretecie} px`:""}`:`${r.label} — nemerané`,children:r.id==="phone"?"TEL":"PC"},r.id)})})]},t.name))]},e.label)),a.jsxs("div",{className:"hfl-legend",children:[a.jsxs("span",{children:[a.jsx("i",{className:"d done"})," hotové"]}),a.jsxs("span",{children:[a.jsx("i",{className:"d wip"})," rozostavané"]})]}),a.jsxs("div",{className:"hfl-head",children:["Výplň · ",g.label," ",g.w,"×",g.h]}),a.jsxs("div",{className:"hfl-fills",children:[w.map(e=>{const t=T[`${e.path}|${g.w}`],r=(t==null?void 0:t.vyplnPct)??0,i=t?t.pretecie>0?"over":r<y.min?"thin":"ok":"none";return a.jsxs("div",{className:`hfl-fillrow is-${i}`,children:[a.jsx("span",{className:"nm",children:e.name}),a.jsx("span",{className:"bar",children:a.jsx("i",{style:{width:`${Math.min(100,r)}%`}})}),a.jsx("span",{className:"pc",children:t?`${r}%`:"—"})]},e.path)}),a.jsxs("div",{className:"hfl-note",children:["Pásmo ",y.min,"–",y.max," %. Nad 100 % sa obrazovka roluje, pod ",y.min," % je poloprázdna vedľa susedov."]})]}),a.jsx("div",{className:"hfl-sep"}),a.jsxs("details",{className:"hfl-testdata",children:[a.jsx("summary",{children:"Testovacie dáta"}),a.jsx("div",{className:"hfl-head",children:"Fotka"}),a.jsxs("div",{className:"hfl-chips",children:[_.map(e=>a.jsx("button",{type:"button",className:`hfl-chip${d===e.id?" on":""}`,onClick:()=>b(e.id),children:e.label},e.id)),a.jsx("button",{type:"button",className:`hfl-chip${d==="none"?" on":""}`,onClick:()=>b("none"),children:ce.label}),a.jsx("button",{type:"button",className:`hfl-chip${d==="custom"?" on":""}`,onClick:()=>{var e;return(e=O.current)==null?void 0:e.click()},children:"vlastná…"}),a.jsx("input",{ref:O,type:"file",accept:"image/*",hidden:!0,onChange:e=>{var t;return X((t=e.target.files)==null?void 0:t[0])}})]}),s.photoUrl?a.jsxs("div",{className:"hfl-photo",children:[a.jsx("img",{src:s.photoUrl,alt:""}),a.jsxs("span",{children:[s.photoLabel,a.jsx("br",{}),"pes je zámerne vľavo — stredový výrez ho odreže"]})]}):a.jsx("div",{className:"hfl-note",children:"Bez fotky — tak vyzerá človek, ktorý ju preskočil."}),a.jsx("div",{className:"hfl-head",children:"Pes a človek"}),a.jsxs("label",{className:"hfl-field",children:[a.jsx("span",{children:"Meno psa"}),a.jsx("input",{value:s.dogName,onChange:e=>n(t=>({...t,dogName:e.target.value}))})]}),a.jsxs("label",{className:"hfl-field",children:[a.jsx("span",{children:"E-mail"}),a.jsx("input",{value:s.email,onChange:e=>n(t=>({...t,email:e.target.value}))})]}),a.jsxs("label",{className:"hfl-field",children:[a.jsx("span",{children:"Poradové číslo"}),a.jsx("input",{type:"number",value:s.packNumber,onChange:e=>n(t=>({...t,packNumber:Number(e.target.value)||0}))})]}),a.jsx("div",{className:"hfl-head",children:"Stav psa"}),a.jsxs("div",{className:"hfl-chips",children:[a.jsx("button",{type:"button",className:`hfl-chip${s.lifeStatus==="alive"?" on":""}`,onClick:()=>n(e=>({...e,lifeStatus:"alive"})),children:"žije"}),a.jsx("button",{type:"button",className:`hfl-chip${s.lifeStatus==="deceased"?" on":""}`,onClick:()=>n(e=>({...e,lifeStatus:"deceased"})),children:"zosnulý"})]}),a.jsx("div",{className:"hfl-head",children:"Cookie lišta v ráme"}),a.jsxs("div",{className:"hfl-chips",children:[a.jsx("button",{type:"button",className:`hfl-chip${N?"":" on"}`,onClick:()=>P(!1),children:"skrytá"}),a.jsx("button",{type:"button",className:`hfl-chip${N?" on":""}`,onClick:()=>P(!0),children:"vyskočí"})]}),a.jsx("div",{className:"hfl-head",children:"Koľko psov"}),a.jsx("div",{className:"hfl-chips",children:[0,1,2,3,4,5].map(e=>a.jsxs("button",{type:"button",className:`hfl-chip${s.extraDogs===e?" on":""}`,onClick:()=>n(t=>({...t,extraDogs:e})),children:[e+1," ",e===0?"pes":e<4?"psi":"psov"]},e))}),a.jsx("button",{type:"button",className:"hfl-ghost",onClick:()=>{ie(),v(null)},children:"Vyčistiť testovacie dáta"})]})]}),a.jsxs("main",{className:"hfl-stage",children:[a.jsxs("div",{className:"hfl-bar",children:[a.jsx("div",{className:"hfl-widths",children:F.map(e=>a.jsxs("button",{type:"button",className:`hfl-chip${u===e.id?" on":""}`,onClick:()=>S(e.id),children:[e.label," · ",e.w]},e.id))}),a.jsxs("div",{className:"hfl-barright",children:[I&&a.jsx("span",{className:"hfl-busy",children:"kreslím fotku…"}),a.jsx("button",{type:"button",className:`hfl-chip${$?" on":""}`,onClick:()=>V(e=>!e),title:"Nakreslí hranicu vzduchu a výplň priamo do rámu",children:"HRANICA"}),a.jsx("button",{type:"button",className:"hfl-chip",onClick:U,disabled:c.length>0,children:c.length>0?`meriam… ${w.length-c.length+1}/${w.length}`:"Zmerať výplň"}),l&&a.jsxs(a.Fragment,{children:[a.jsx("code",{children:l.path}),a.jsx("button",{type:"button",className:"hfl-chip",onClick:Q,children:"Načítať znova s dátami"}),a.jsx("button",{type:"button",className:"hfl-chip",onClick:()=>{C({...s,popup:l.popup??null}),window.open(l.path,"_blank")},children:"Vo vlastnom okne"})]})]})]}),l&&a.jsx("div",{className:"hfl-facebar",children:h?a.jsxs(a.Fragment,{children:[a.jsxs("span",{className:"hfl-facenote",children:[a.jsx("b",{children:"Fotka Hektora"})," · ",l.name,a.jsx("br",{}),"#",String(z).padStart(2,"0"),z===m?" (predvolená)":` · predvolená #${String(m).padStart(2,"0")}`]}),a.jsx("div",{className:"hfl-faces",children:Array.from({length:le},(e,t)=>t+1).map(e=>a.jsxs("button",{type:"button",className:`hfl-faceit${e===z?" on":""}`,onClick:()=>Y(e),title:`#${String(e).padStart(2,"0")}${e===m?" · predvolená":""}`,children:[a.jsx("img",{src:re(e),alt:`ksicht #${e}`}),e===m&&a.jsx("i",{className:"df",children:"P"})]},e))}),a.jsxs("div",{className:"hfl-faceacts",children:[z!==m&&a.jsx("button",{type:"button",className:"hfl-chip",onClick:W,children:"Predvolená"}),Object.keys(x).length>0&&a.jsxs("button",{type:"button",className:"hfl-chip on",onClick:G,title:Object.entries(x).map(([e,t])=>`${e} → #${t}`).join(`
`),children:["KOPÍROVAŤ PRE CLAUDA (",Object.keys(x).length,")"]})]})]}):a.jsxs("span",{className:"hfl-facenote",children:["Na kroku „",l.name,'" fotka Hektora nie je.']})}),c.length>0&&a.jsx("iframe",{title:"meranie",src:c[0].path,className:"hfl-probe",style:{width:c[0].w,height:c[0].h}},`${c[0].path}|${c[0].w}`),a.jsx("div",{className:"hfl-frame-wrap",children:l?a.jsx(pe,{src:l.path,w:g.w,h:g.h},k):a.jsxs("div",{className:"hfl-empty",children:["Vyber vľavo povrch. Dáta hore platia pre ten, ktorý otvoríš — po ich zmene daj ",a.jsx("b",{children:"Načítať znova"}),"."]})})]})]})}function pe({src:s,w:n,h:d}){const b=o.useRef(null),[u,S]=o.useState(1);return o.useLayoutEffect(()=>{const l=b.current;if(!l)return;const v=()=>{const f=l.getBoundingClientRect();S(Math.min(1,(f.width-24)/n,(f.height-24)/d))};v();const k=new ResizeObserver(v);return k.observe(l),()=>k.disconnect()},[n,d]),a.jsx("div",{className:"hfl-box",ref:b,children:a.jsx("div",{style:{width:n*u,height:d*u},children:a.jsx("iframe",{title:"heroflow",src:s,style:{width:n,height:d,border:"none",transform:`scale(${u})`,transformOrigin:"top left",borderRadius:14,background:"#000"}})})})}function ke(){return a.jsx("div",{style:{minHeight:"100dvh",background:"#0B0906 url('/images/bg-light.webp') center/cover",display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(110px, 1fr))",gap:10,padding:14,alignContent:"start"},children:Array.from({length:24},(s,n)=>a.jsx("div",{style:{aspectRatio:"1",borderRadius:8,background:"rgba(0,0,0,.28)",border:"1px solid rgba(201,154,63,.18)"}},n))})}const he=`
.hfl-root {
  position: fixed; inset: 0; display: flex;
  background: #0B0906; color: #FAF4EC;
  font-family: 'Space Grotesk', sans-serif;
}
/* Cookie lišta sa v dielni kreslila DRUHÝKRÁT (raz dielňa, raz rám) a sadala si
   presne na spodok práve ladenej obrazovky. Štýl žije len kým je dielňa
   namontovaná, takže v RÁME lišta ostáva — podľa prepínača vľavo.
   (Zoznam ciest DevNav sa vypína routou, priamo v ňom.) */
body:has(.hfl-root) .consent-banner { display: none !important; }
.hfl-side {
  width: 292px; flex: none; overflow-y: auto; padding: 14px 12px 24px;
  background: rgba(12,10,7,.96); border-right: 1px solid rgba(201,154,63,.2);
}
.hfl-brand { padding: 2px 4px 12px; }
.hfl-brand b {
  display: block; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 16px; letter-spacing: .14em; color: #C99A3F;
}
.hfl-brand span { font-size: 11px; color: rgba(250,244,236,.5); }
.hfl-head {
  padding: 12px 4px 6px; font-size: 10px; letter-spacing: .22em;
  text-transform: uppercase; color: rgba(201,154,63,.75);
}
.hfl-chips { display: flex; flex-wrap: wrap; gap: 5px; padding: 0 2px; }
.hfl-chip {
  border: 1px solid rgba(201,154,63,.3); border-radius: 999px;
  background: transparent; color: rgba(250,244,236,.66);
  font: inherit; font-size: 11px; padding: 4px 9px; cursor: pointer;
}
.hfl-chip:hover { border-color: rgba(201,154,63,.6); color: #FAF4EC; }
.hfl-chip.on { background: rgba(38,97,156,.28); border-color: #26619C; color: #FAF4EC; }
.hfl-photo { display: flex; gap: 8px; align-items: center; padding: 8px 4px 0; }
.hfl-photo img {
  width: 62px; height: 62px; object-fit: cover; border-radius: 8px; flex: none;
  border: 1px solid rgba(201,154,63,.3);
}
.hfl-photo span { font-size: 10px; line-height: 1.45; color: rgba(250,244,236,.5); }
.hfl-note { padding: 8px 4px 0; font-size: 10px; color: rgba(250,244,236,.45); }
.hfl-field { display: block; padding: 7px 2px 0; }
.hfl-field span {
  display: block; font-size: 10px; letter-spacing: .08em;
  color: rgba(250,244,236,.45); padding-bottom: 3px;
}
.hfl-field input {
  width: 100%; border: 1px solid rgba(201,154,63,.25); border-radius: 8px;
  background: rgba(0,0,0,.35); color: #FAF4EC; font: inherit; font-size: 12px;
  padding: 6px 8px;
}
.hfl-field input:focus { outline: none; border-color: #26619C; }
.hfl-sep { height: 1px; margin: 14px 4px 2px; background: rgba(201,154,63,.22); }
.hfl-step {
  display: flex; gap: 8px; width: 100%; text-align: left; align-items: flex-start;
  background: none; border: none; border-radius: 7px; padding: 7px 8px;
  cursor: pointer; font: inherit; font-size: 12px; color: rgba(250,244,236,.62);
}
.hfl-step:hover { background: rgba(255,255,255,.06); color: #FAF4EC; }
.hfl-step.is-here { background: rgba(201,154,63,.16); color: #FAF4EC; }
.hfl-step .txt i {
  display: block; font-style: normal; font-size: 10px; line-height: 1.45;
  color: rgba(250,244,236,.42); padding-top: 2px;
}
.hfl-step .dot {
  width: 7px; height: 7px; border-radius: 50%; flex: none; margin-top: 5px;
  border: 1px solid rgba(201,154,63,.5); background: transparent;
}
.hfl-step.is-done .dot { background: #C99A3F; border-color: #C99A3F; }
.hfl-step.is-wip .dot { background: #B25640; border-color: #B25640; }
.hfl-step.is-todo .dot { background: transparent; border-color: #B25640; }
.hfl-ghost {
  width: 100%; margin-top: 10px; border: 1px solid rgba(201,154,63,.25);
  border-radius: 8px; background: transparent; color: rgba(250,244,236,.6);
  font: inherit; font-size: 11px; padding: 7px; cursor: pointer;
}
.hfl-ghost:hover { color: #FAF4EC; border-color: rgba(201,154,63,.55); }
.hfl-legend {
  display: flex; gap: 10px; padding: 12px 4px 0; font-size: 10px;
  color: rgba(250,244,236,.42);
}
.hfl-legend .d {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%;
  margin-right: 4px; border: 1px solid rgba(201,154,63,.5);
}
.hfl-legend .d.done { background: #C99A3F; border-color: #C99A3F; }
.hfl-legend .d.wip { background: #B25640; border-color: #B25640; }

/* ── VÝPLŇ OBRAZOVIEK (25. 9. 2026) ───────────────────────────────────────
   Tri stavy a každý má DÔVOD, nie len farbu: zelená = v pásme · jantárová =
   poloprázdna (pridaj) · červená = preteká (uber). Šedá = nemerané. */
.hfl-fills { display: flex; flex-direction: column; gap: 4px; padding: 2px 4px 0; }
.hfl-fillrow { display: flex; align-items: center; gap: 7px; font-size: 10px; }
.hfl-fillrow .nm {
  flex: 0 0 74px; min-width: 0; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; color: rgba(250,244,236,.62);
}
.hfl-fillrow .bar {
  flex: 1 1 auto; height: 6px; border-radius: 999px; overflow: hidden;
  background: rgba(250,244,236,.10);
}
.hfl-fillrow .bar i { display: block; height: 100%; background: rgba(250,244,236,.3); }
.hfl-fillrow .pc { flex: 0 0 30px; text-align: right; color: rgba(250,244,236,.62); }
.hfl-fillrow.is-ok .bar i { background: #3D7A4E; }
.hfl-fillrow.is-thin .bar i { background: #C99A3F; }
.hfl-fillrow.is-over .bar i { background: #B25640; }
.hfl-fillrow.is-over .pc, .hfl-fillrow.is-over .nm { color: #E08A72; }
/* ── DVA CHIPY PRI KROKU: TELEFÓN a POČÍTAČ (25. 9. 2026) ────────────────────
   Matej: *„daj preč messy words nechaj len názov kroku bez vysvetlenia aj tak
   to nečítam len tam daj chipy či sedí telefon a pc velkostne overene"*.
   Zoznam teda nehovorí, ČO je na kroku rozostavané (to patrí do KONTEXT.md),
   ale jedinú vec, ktorú z neho vidno na prvý pohľad: zmestí sa to?
   Zelený = zmestí sa a nie je poloprázdny · žltý = poloprázdny · červený =
   preteká · sivý = ešte nemerané. Presné číslo je v tooltipe. */
.hfl-chips2 { flex: none; display: flex; gap: 4px; margin-left: 6px; }
.hfl-fill {
  flex: none; padding: 1px 5px; border-radius: 999px;
  font-size: 9px; letter-spacing: .06em;
  border: 1px solid rgba(250,244,236,.18); color: rgba(250,244,236,.55);
}
/* Nemerané nesmie vyzerať ako v poriadku — je to otázka, nie odpoveď. */
.hfl-fill.none { opacity: .45; }
.hfl-fill.ok { border-color: rgba(61,122,78,.7); color: #7FBF95; }
.hfl-fill.thin { border-color: rgba(201,154,63,.7); color: #E0BC72; }
.hfl-fill.over { border-color: rgba(178,86,64,.8); color: #E08A72; }
/* Rám fronty stojí mimo záberu, ale VYKRESLENÝ — display:none by mu dalo
   nulovú výšku a merač by hlásil nezmysel. */
.hfl-probe { position: fixed; left: -10000px; top: 0; border: 0; visibility: hidden; }
/* Zbalený rozbaľovač testovacích dát (24. 9.) — rovnaké tóny a polomer, aké
   už panel má (border rgba(201,154,63,.2) z .hfl-side, radius 8px z .hfl-ghost),
   žiadny nový token. */
.hfl-testdata {
  margin-top: 10px; border: 1px solid rgba(201,154,63,.2); border-radius: 8px;
  padding: 2px 6px 8px;
}
.hfl-testdata summary {
  cursor: pointer; list-style: none; padding: 9px 4px;
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
  color: rgba(201,154,63,.75);
}
.hfl-testdata summary::-webkit-details-marker { display: none; }
.hfl-testdata[open] summary { color: #FAF4EC; }
/* ── FOTKY HEKTORA — mriežka náhľadov (26. 9. 2026) ──────────────────────
   48 px kruhy, presne toľko, aby sa 26 kusov zmestilo do 292 px bočnej lišty
   v šiestich riadkoch. „P" = predvolená z BY_STEP, zlatý rám = aktuálna
   voľba (override alebo predvolená, keď override nie je). */
.hfl-facebar {
  display: flex; align-items: center; gap: 12px; padding: 8px 14px;
  border-bottom: 1px solid rgba(201,154,63,.16); background: rgba(0,0,0,.25);
}
.hfl-facenote { flex: 0 0 auto; font-size: 11px; line-height: 1.5; color: rgba(250,244,236,.55); min-width: 120px; }
.hfl-facenote b { color: #C99A3F; font-weight: 600; }
.hfl-faces {
  flex: 1; min-width: 0; display: flex; gap: 6px; overflow-x: auto; padding: 2px;
  scrollbar-width: thin;
}
.hfl-faceit {
  position: relative; flex: 0 0 48px; width: 48px; height: 48px; padding: 0;
  border-radius: 50%; border: 2px solid rgba(201,154,63,.25);
  background: transparent; cursor: pointer; overflow: hidden;
}
.hfl-faceit img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hfl-faceit:hover { border-color: rgba(201,154,63,.6); }
.hfl-faceit.on { border-color: #C99A3F; box-shadow: 0 0 0 2px rgba(201,154,63,.35); }
.hfl-faceit .df {
  position: absolute; right: -1px; bottom: -1px; width: 14px; height: 14px;
  border-radius: 50%; background: #26619C; color: #FAF4EC; font-size: 8px;
  font-style: normal; font-weight: 600; display: flex; align-items: center;
  justify-content: center; border: 1px solid rgba(250,244,236,.4);
}
.hfl-faceacts { flex: 0 0 auto; display: flex; flex-direction: column; gap: 4px; }

.hfl-stage { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.hfl-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 14px; border-bottom: 1px solid rgba(201,154,63,.16);
  flex-wrap: wrap;
}
.hfl-widths, .hfl-barright { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.hfl-barright code {
  font-size: 11px; color: rgba(201,154,63,.8);
  background: rgba(0,0,0,.4); padding: 3px 7px; border-radius: 6px;
}
.hfl-busy { font-size: 11px; color: rgba(250,244,236,.45); }
.hfl-frame-wrap { flex: 1; min-height: 0; display: flex; }
.hfl-box { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; }
.hfl-empty {
  margin: auto; max-width: 340px; text-align: center; font-size: 13px;
  line-height: 1.6; color: rgba(250,244,236,.45);
}
.hfl-empty b { color: rgba(250,244,236,.8); font-weight: 500; }
`;export{ke as LabScene,ye as default};
