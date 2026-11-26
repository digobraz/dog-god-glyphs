import{u as ue,r as s,d as Fe,j as e,m as j,L as c,c as Ie,g as Pe,f as Le,k as E,M as he,B as me,b as ge}from"./index-DriUOdZL.js";import{u as De}from"./useFlowGuard-BnknS19j.js";import{u as Re}from"./useFlowKeyboardFix-fjrOiUUO.js";import{u as He}from"./useBlockAutocorrect-3i5EWKtT.js";import{P as Ve}from"./PageTopBar-3J3L1b0M.js";import{z as oe,c as ae,H as _e,g as Be,l as Ge}from"./HeroglyphFrame-F7m3K15S.js";import{H as Q,c as Ze,a as Ke,d as Ye,f as xe,b as We}from"./flowPaleSkin-CJNdyjt-.js";import{F as Ue,T as qe}from"./flowTopicChips-Cvg2sMVx.js";import{D as ke}from"./DateDropdowns-C4ZmMMb9.js";import{u as Je,F as Xe,a as Qe}from"./flowMedallion-C1OBUhVP.js";import{F as eo,a as oo}from"./flowPanel-BxF4HS-3.js";import{c as ao}from"./cleopatra-cartouche-wRimR9ia.js";import{L as l}from"./labTheme-DLctEqJ2.js";import{h as no}from"./hekthorFaces-myd4lVXL.js";import{H as to}from"./hektor-DznQ9VDK.js";import{i as io}from"./initialLetter-CIe-_dtl.js";import{g as I,a as ne,W as ro}from"./WheelDatePicker-DdAhIp5H.js";import{u as so,F as lo,a as po}from"./flowDogPicker-C0gH0xe3.js";import{m as B}from"./proxy-5uIz4xGy.js";import{A as we}from"./index-BPi12Ps7.js";import"./flowMode-B6eboter.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./keyboardInset-BtDUCG-L.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./CHARACTER-WATERLOVER-Be2FY-gi.js";import"./RankingSlot-B9f52iXE.js";import"./NUMBER-11-BoEzuCvn.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";const co=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"],fe=1930,ee=1990;function ho({open:x,birthday:a,sign:w,year:z,onClose:C,onDate:N,onManual:M}){const t=ue(),[n,P]=s.useState("date"),[A,L]=s.useState(w||null),[f,O]=s.useState(z||ee),[r,u]=s.useState(a||null);s.useEffect(()=>{x&&(P("manual"),L(w||null),O(z||ee),u(a||null))},[x]);const D=I(f),d=r?{west:ne(r.m,r.d).name,chin:I(r.y).name}:null,T=n==="date"?!!r:!!A,G=()=>{T&&(n==="date"?N(r.d,r.m,r.y):M(A,f))},m=new Date;return x?Fe.createPortal(e.jsxs("div",{className:"zs-root",role:"dialog","aria-modal":"true",children:[e.jsx("div",{className:"zs-backdrop",onClick:C}),e.jsxs("div",{className:"zs-card",children:[n==="date"?e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"zs-title",children:t("heroglyph.flow.ownerZodiac.question")}),e.jsx("p",{className:"zs-hint",children:t("heroglyph.flow.owner.signsHint")}),e.jsx(ke,{day:(r==null?void 0:r.d)??1,month:(r==null?void 0:r.m)??1,year:(r==null?void 0:r.y)??ee,empty:!r,emptyLabels:{day:t("heroglyph.flow.dogs.phDay"),month:t("heroglyph.flow.dogs.phMonth"),year:t("heroglyph.flow.dogs.phYear")},minYear:fe,maxYear:m.getFullYear(),maxDate:m,skin:"pale",onChange:(g,Z,te)=>u({d:g,m:Z,y:te})}),e.jsxs("div",{className:"zs-result",children:[e.jsx("span",{className:`zs-mark sm${d?" on":""}`,children:d?e.jsx("img",{src:oe[d.west],alt:""}):e.jsx("i",{children:"?"})}),e.jsx("span",{className:`zs-mark sm${d?" on":""}`,children:d?e.jsx("img",{src:ae[d.chin],alt:""}):e.jsx("i",{children:"?"})}),e.jsx("span",{className:"zs-said",children:d?`${t(`heroglyph.flow.ownerZodiac.sign.${d.west}`)} · ${t(`heroglyph.flow.ownerZodiac.animal.${d.chin}`)}`:"—"})]}),e.jsx("button",{type:"button",className:"zs-switch",onClick:()=>P("manual"),children:t("heroglyph.flow.owner.optOut")})]}):e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"zs-title",children:t("heroglyph.flow.owner.sheetTitle")}),e.jsx("div",{className:"zs-grid",children:co.map(g=>e.jsxs("button",{type:"button",className:`zs-sign${A===g?" on":""}`,"aria-pressed":A===g,onClick:()=>L(g),children:[e.jsx("img",{src:oe[g],alt:""}),e.jsx("span",{children:t(`heroglyph.flow.ownerZodiac.sign.${g}`)})]},g))}),e.jsx("p",{className:"zs-legend",children:t("heroglyph.flow.owner.sheetYear")}),e.jsxs("div",{className:"zs-year",children:[e.jsx("div",{className:"zs-wheel",children:e.jsx(ro,{year:f,minYear:fe,maxYear:m.getFullYear(),onChange:O})}),e.jsx("span",{className:"zs-mark on",children:e.jsx("img",{src:ae[D.name],alt:t(`heroglyph.flow.ownerZodiac.animal.${D.name}`)})})]})]}),e.jsx("button",{type:"button",className:"zs-done",disabled:!T,onClick:G,children:t("heroglyph.flow.message.done")})]}),e.jsx("style",{children:mo})]}),document.body):null}const mo=`
.zs-root {
  position: fixed; inset: 0; z-index: 2100;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.zs-backdrop {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.72);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.zs-card {
  position: relative; z-index: 1; width: 100%; max-width: 420px;
  max-height: calc(100dvh - 32px); overflow-y: auto;
  background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
  border: 1.5px solid rgba(201, 154, 63, 0.55); border-radius: ${j.card}px;
  padding: 20px 16px 16px; box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
  display: flex; flex-direction: column; gap: 12px;
}
.zs-title {
  margin: 0; padding: 0; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px;
  color: ${l.goldInk};
}
/* Štyri v rade — dvanásť znamení vyjde na tri riadky a karta sa nemusí rolovať. */
.zs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.zs-sign {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 2px; cursor: pointer; border-radius: ${j.tile}px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
}
.zs-sign img { width: 30px; height: 30px; object-fit: contain; }
.zs-sign span {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 9px;
  letter-spacing: 0.02em; text-transform: uppercase; color: ${l.inkSoft};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
/* Vybrané svieti lapisom — tá istá reč ako voľba v celom vstupe. */
/* 🔴 Bola tu cudzia modrá #2F6BFF (Matej 25. 9. 2026: *„úplne iné farby než brand!"*) —
   odteraz tokeny \`LAPIS\`, tá istá voľba ako v celom vstupe. */
.zs-sign.on { border-color: ${c.edge}; background: ${c.fill}; }
.zs-sign.on span { color: ${c.edge}; }

.zs-legend {
  margin: 4px 0 0; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: ${l.inkMuted};
}
.zs-year { display: flex; align-items: center; gap: 12px; }
.zs-wheel { flex: 1 1 auto; min-width: 0; }
.zs-mark {
  flex: none; width: 56px; height: 56px; display: grid; place-items: center;
  border-radius: ${j.tile}px; border: 1.5px solid rgba(179, 130, 45, 0.55);
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.65), rgba(242, 226, 189, 0.5));
}
.zs-mark.on { border-color: ${c.edge}; }
.zs-mark img { width: 38px; height: 38px; object-fit: contain; }
.zs-mark i { font-style: normal; font-family: 'Cinzel', serif; font-size: 20px; color: ${l.inkMuted}; }

.zs-hint {
  margin: -4px 0 0; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4;
  color: ${l.inkSoft};
}
.zs-result { display: flex; align-items: center; justify-content: center; gap: 8px; }
.zs-mark.sm { width: 40px; height: 40px; }
.zs-mark.sm img { width: 28px; height: 28px; }
.zs-said {
  margin-left: 4px;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em; text-transform: uppercase; color: ${l.inkSoft};
}
/* 🔵 Prepnutie polohy je AKCIA vnútri karty — lapisový podčiarknutý text,
   nie druhé tlačidlo. Plná plocha patrí len HOTOVO. */
.zs-switch {
  align-self: center; padding: 4px; border: none; background: none; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px;
  color: ${c.edge}; text-decoration: underline; text-underline-offset: 2px;
}

.zs-done {
  /* Hlavné CTA vstupu (HF.cta): lapis, rohy 8 — jedno tlačidlo naprieč flowom (28. 9. 2026). */
  width: 100%; height: ${Q.cta.h}px; border: none; border-radius: ${Q.cta.radius}px; cursor: pointer;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${Q.cta.size}px;
  letter-spacing: .08em; text-transform: uppercase; color: ${c.ink};
  background: ${c.grad};
  box-shadow: ${Ie};
}
.zs-done:hover:not(:disabled) { background: ${c.gradHover}; }
/* Neaktívne = ako .hf-cta:disabled (vzhľad z e-mailu, 27. 9. 2026). */
.zs-done:disabled { opacity: .4; cursor: default; box-shadow: none; }
`,go=420,y=["who","name","stars","order"],xo=1920,wo=1985,fo=[{v:"man"},{v:"woman"}];function aa(){Re();const x=Pe(),a=ue(),{lang:w}=Le(),z=De(),C=Je(),N=E(o=>o.ownerName),M=E(o=>o.setOwnerName),t=E(o=>o.selections),n=E(o=>o.setSelection),P=E(o=>o.dogEssence),A=E(o=>o.setDogEssence),L=E(o=>o.dogOrderStart),f=so(),[O,r]=s.useState(0),u=f[Math.min(O,Math.max(0,f.length-1))],D=(u==null?void 0:u.id)??he,d=o=>(L||1)+o,[T,G]=s.useState(N||""),m=t.ownerGender||"",g=t.ownerBirthday||"",Z=!1,[te,yo]=s.useState(!1);s.useRef(null),s.useRef(null);const ie=s.useRef(null);He(ie);const ye=o=>{G(o),M(o.trim().toUpperCase())},$=T.trim(),re=io($)??"",K=Ge[re]||null,Y=d(Math.min(O,Math.max(0,f.length-1))),W=Y>0,ve=o=>{if(["sk","cs","deu","pol","tur"].includes(w))return`${o}.`;if(w!=="en")return`${o}`;const i=["th","st","nd","rd"],h=o%100;return`${o}${i[(h-20)%10]||i[h]||i[0]}`},p=(()=>{const o=/^(\d{4})-(\d{2})-(\d{2})$/.exec(g);return o?{y:+o[1],m:+o[2],d:+o[3]}:null})(),U=t.ownerZodiac||"",se=t.ownerChineseZodiac||"",v=U?{name:U}:null,b=se?{name:se}:null,[be,R]=s.useState(!1),[le,q]=s.useState(!1),je=(o,i,h)=>{n("ownerBirthday",`${h}-${String(i).padStart(2,"0")}-${String(o).padStart(2,"0")}`),n("ownerZodiac",ne(i,o).name),n("ownerChineseZodiac",I(h).name),R(!1)},ze=(o,i)=>{n("ownerBirthday",""),n("ownerZodiac",o),n("ownerChineseZodiac",I(i).name),R(!1)},H=$.length>=1&&!!m&&!!v&&!!b,V=o=>o==="who"?!!m:o==="name"?$.length>=1:o==="stars"?!!v&&!!b:W,pe=()=>y.findIndex(o=>!V(o)),[J,X]=s.useState(()=>new URLSearchParams(window.location.search).get("topic")==="order"?y.indexOf("order"):Math.max(0,pe())),[Ne,Se]=s.useState({}),F=s.useRef(null);s.useEffect(()=>()=>{F.current&&clearTimeout(F.current)},[]);const k=y[J];s.useEffect(()=>{Se(o=>({...o,[k]:!0}))},[k]);const Ee=(o,i)=>{for(let S=o+1;S<y.length;S++){const ce=y[S];if(ce!==i&&!V(ce))return S}const h=y.findIndex(S=>S!==i&&!V(S));return h>=0?h:Math.min(o+1,y.length-1)},_=o=>X(i=>Ee(i,o)),Ae=o=>{const i=y[o];return V(i)?"done":o===J?"todo":Ne[i]?"miss":"todo"},Oe={who:a("heroglyph.flow.owner.chipWho"),name:a("heroglyph.flow.owner.chipName"),stars:a("heroglyph.flow.owner.chipStars"),order:a("heroglyph.flow.owner.chipOrder")},$e={who:a("heroglyph.flow.owner.askWho"),name:a("heroglyph.flow.owner.askName"),stars:a(m==="woman"?"heroglyph.flow.owner.askBornF":"heroglyph.flow.owner.askBornM"),order:a(m==="woman"?"heroglyph.flow.owner.askOrderF":"heroglyph.flow.owner.askOrder")},Ce=o=>{n("ownerGender",o),F.current&&clearTimeout(F.current),F.current=setTimeout(()=>_("who"),go)},de=new Date,Me=(o,i,h)=>{n("ownerBirthday",`${h}-${String(i).padStart(2,"0")}-${String(o).padStart(2,"0")}`),n("ownerZodiac",ne(i,o).name),n("ownerChineseZodiac",I(h).name)},Te=()=>{H&&(f.forEach((o,i)=>{A(o.id,"ranking",String(d(i))),o.id===he&&n("ranking",String(d(i)))}),x("/heroglyph/reveal"))};return z?e.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[e.jsxs("style",{children:[Ze,Xe,Ke,Ye,lo,Ue,eo,ko]}),e.jsx("div",{className:"hf-topbar flex-shrink-0",children:e.jsx(Ve,{brandBack:!0,onBack:()=>x("/heroglyph/dog-character")})}),e.jsx("div",{className:"hf-stage",children:e.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center",children:[e.jsxs(B.div,{className:"hf-speak ow-speak",initial:{opacity:0,y:-8},animate:{opacity:1,y:0},transition:{duration:.28},children:[e.jsx(Qe,{src:no("owner-info"),size:C,ask:{id:"owner-egypt",label:a("heroglyph.flow.ownerFinal.infoAria"),onClick:()=>q(o=>!o),expanded:le}}),e.jsx("span",{className:"say",children:e.jsx(we,{mode:"wait",initial:!1,children:e.jsx(B.h2,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:{duration:.2},children:$e[k].split(/\*([^*]+)\*/).map((o,i)=>i%2?e.jsx("b",{children:o},i):o)},k)})})]}),e.jsxs(B.div,{className:"hf-block hf-carved ow-stack",initial:{opacity:0,top:12},animate:{opacity:1,top:0},transition:{duration:.35},children:[e.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),e.jsxs("div",{className:"hf-plate",children:[e.jsxs(oo,{open:le,className:"ow-egypt",label:a("heroglyph.flow.ownerFinal.infoTitle"),onClose:()=>q(!1),children:[e.jsx("h2",{className:"ow-egypt-h",children:a("heroglyph.flow.ownerFinal.infoTitle")}),e.jsxs("div",{className:"fp-scroll",children:[e.jsx("p",{className:"ow-egypt-tx",children:a("heroglyph.flow.ownerFinal.infoBody")}),e.jsx(uo,{alt:a("heroglyph.flow.ownerFinal.cleopatraAlt"),caption:a("heroglyph.flow.ownerFinal.cleopatraCaption")})]}),e.jsx("button",{type:"button",className:"hf-cta",onClick:()=>q(!1),children:a("heroglyph.flow.ownerFinal.back")})]}),e.jsx(po,{dogs:f,cur:O,onGo:r}),e.jsx("span",{className:"fdh-rule","aria-hidden":!0}),e.jsx(_e,{showOwner:!0,dogValues:{...P[D]||{},ranking:String(Y)},ghostValues:to,className:"hf-glyph ow-glyph",style:{width:"var(--flow-glyph-w)"}}),e.jsx(qe,{items:y.map((o,i)=>({key:o,label:Oe[o],state:Ae(i)})),current:J,onGo:X}),e.jsx("span",{className:"fdh-rule","aria-hidden":!0}),e.jsx("div",{className:"ow-q",children:e.jsx(we,{mode:"wait",initial:!1,children:e.jsxs(B.div,{className:"ow-qin",initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:{duration:.22},children:[k==="who"&&e.jsx("div",{className:"ow-genders",children:fo.map(o=>e.jsxs("button",{type:"button",className:`hf-pick is-pale ow-gender${m===o.v?" on":""}`,"aria-pressed":m===o.v,onClick:()=>Ce(o.v),children:[e.jsx("span",{className:"well",children:e.jsx("img",{src:Be[o.v],alt:""})}),e.jsx("span",{className:"tx",children:a(`heroglyph.flow.ownerInfo.${o.v}`)})]},o.v))}),k==="name"&&e.jsxs("div",{className:"ow-namerow",children:[e.jsx("input",{ref:ie,autoFocus:!0,className:`hf-field ow-name${$?" is-valid":""}`,value:T,onChange:o=>ye(o.target.value.toUpperCase().slice(0,30)),onKeyDown:o=>{o.key==="Enter"&&$&&_("name")},placeholder:a("heroglyph.flow.ownerInfo.placeholder"),maxLength:30,name:"ownerName",autoComplete:"off",autoCorrect:"off",spellCheck:!1}),e.jsx("span",{className:`ow-mark${K?" on":""}`,children:K?e.jsx("img",{src:K,alt:re}):e.jsx("i",{children:"?"})}),e.jsx("button",{type:"button",className:"ow-next",disabled:!$,onClick:()=>_("name"),children:a("heroglyph.flow.owner.next")})]}),k==="stars"&&e.jsxs("div",{className:"ow-born",children:[e.jsx(ke,{day:(p==null?void 0:p.d)??1,month:(p==null?void 0:p.m)??1,year:(p==null?void 0:p.y)??wo,empty:!p,emptyLabels:{day:a("heroglyph.flow.dogs.phDay"),month:a("heroglyph.flow.dogs.phMonth"),year:a("heroglyph.flow.dogs.phYear")},minYear:xo,maxYear:de.getFullYear(),maxDate:de,skin:"pale",onChange:Me}),e.jsxs("div",{className:"ow-signs",children:[e.jsx("span",{className:`ow-mark${v?" on":""}`,children:v?e.jsx("img",{src:oe[v.name],alt:""}):e.jsx("i",{children:"?"})}),e.jsx("span",{className:`ow-mark${b?" on":""}`,children:b?e.jsx("img",{src:ae[b.name],alt:""}):e.jsx("i",{children:"?"})}),e.jsx("span",{className:"ow-said",children:v&&b?`${a(`heroglyph.flow.ownerZodiac.sign.${v.name}`)} · ${a(`heroglyph.flow.ownerZodiac.animal.${b.name}`)}`:a("heroglyph.flow.owner.signsEmpty")}),v&&b?e.jsx("button",{type:"button",className:"ow-next is-done",onClick:()=>_("stars"),children:a("heroglyph.flow.message.done")}):e.jsx("button",{type:"button",className:"ow-change",onClick:()=>R(!0),children:a("heroglyph.flow.owner.optOut")})]})]}),k==="order"&&e.jsxs("div",{className:"ow-order",children:[e.jsx("span",{className:"tx",children:W?a("heroglyph.flow.owner.orderLine",{dogName:(u==null?void 0:u.name)||a("heroglyph.flow.yourDogFallback"),ord:ve(Y)}):a("heroglyph.flow.owner.orderMissing")}),e.jsx("button",{type:"button",className:"ow-change",onClick:()=>x("/heroglyph/dogs?back=owner"),children:a(W?"heroglyph.flow.owner.orderCheck":"heroglyph.flow.owner.orderPick")})]})]},k)})}),e.jsx("button",{type:"button",className:`hf-cta hf-dock ow-cta${H?"":" is-off"}`,"aria-disabled":!H,onClick:()=>{if(H){Te();return}const o=pe();o>=0&&X(o)},children:a("heroglyph.flow.breed.continue")})]})]})]})}),e.jsx(ho,{open:be,birthday:p,sign:U||void 0,year:p==null?void 0:p.y,onClose:()=>R(!1),onDate:je,onManual:ze}),Z]}):null}function uo({alt:x,caption:a}){const w=s.useRef(null),[z,C]=s.useState(0),N=["/images/cleopatra-cartouche-relief.webp",ao],M=t=>{var n;return(n=w.current)==null?void 0:n.scrollTo({left:t*w.current.clientWidth,behavior:"smooth"})};return e.jsxs("figure",{className:"ow-egypt-fig",children:[e.jsx("div",{ref:w,className:"ow-slides",onScroll:t=>{const n=t.currentTarget;C(Math.round(n.scrollLeft/Math.max(1,n.clientWidth)))},children:N.map((t,n)=>e.jsx("div",{className:`ow-slide${n===0?" is-photo":""}`,children:e.jsx("img",{src:t,alt:x})},t))}),e.jsx("div",{className:"ow-dots",role:"tablist",children:N.map((t,n)=>e.jsx("button",{type:"button",role:"tab","aria-selected":z===n,"aria-label":`${n+1}/${N.length}`,className:z===n?"on":"",onClick:()=>M(n)},t))}),e.jsx("figcaption",{children:a})]})}const ko=`
/* Bublina: stupeň písma viazaný na ŠÍRKU BUBLINY (cqw), nie na okno — tá istá
   dvojica hodnôt ako PODSTATA, PATRÓN a POVAHA. */
.ow-speak { container-type: inline-size; margin-bottom: 8px; position: relative; }
/* (i) vpravo na bloku — písmeno v kruhu ako ⓘ v komunite (packCommunityUI), kit ikonku „info" nemá. */
.ow-speak .say { flex: 1 1 auto; }
.ow-info {
  flex: 0 0 auto; align-self: flex-start; width: 28px; height: 28px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: transparent; border: 2px solid rgba(250, 244, 236, 0.55); color: #FAF4EC;
  font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 16px; line-height: 1; /* Cinzel nemá malé „i“ */
}
.ow-info:hover, .ow-info.on { border-color: ${xe}; color: ${xe}; }
.ow-stack .hf-plate { position: relative; }
.ow-egypt-h {
  margin: 0; text-align: center; text-wrap: balance;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${We}; line-height: 1.25;
  letter-spacing: 0.02em; color: ${l.goldInk};
}
.ow-egypt .fp-scroll { container-type: inline-size; }
/* Popup nad oknom (28. 9.): pevná výška, aby slajder kartuše mal z čoho brať. */
.ow-egypt .ow-egypt-fig { flex: 0 0 auto; height: min(34dvh, 260px); }
.ow-egypt-tx { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${l.inkBody}; }
.ow-egypt .hf-cta { flex: 0 0 auto; }
.ow-egypt-tx { flex: 0 0 auto; }
/* Slajder berie ZVYŠOK výšky dosky — popup sa nerolluje a tlačidlo sa nestláča. */
.ow-egypt-fig { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; flex: 1 1 auto; min-height: 120px; }
.ow-slides {
  width: 100%; flex: 1 1 auto; min-height: 0; display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  scrollbar-width: none; border-radius: 12px;
}
.ow-slides::-webkit-scrollbar { display: none; }
.ow-slide { flex: 0 0 100%; height: 100%; scroll-snap-align: center; display: flex; align-items: center; justify-content: center; }
.ow-slide img { width: 100%; height: 100%; object-fit: contain; display: block; }
.ow-slide.is-photo img { border-radius: 12px; }
/* Kresba zrkadlovo, aby vtáky pozerali doprava ako na reliéfe (Matej 27. 9. 2026). */
.ow-slide:not(.is-photo) img { transform: scaleX(-1); }
.ow-dots { display: flex; gap: 8px; }
.ow-dots button { width: 8px; height: 8px; padding: 0; border: none; border-radius: 999px; cursor: pointer; background: ${l.hairline}; }
.ow-dots button.on { background: ${l.goldInk}; }
.ow-egypt-fig figcaption { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${l.inkMuted}; text-align: center; }
/* Nízke okno (iPhone SE): popis pod slajdom ustúpi prvý — obrázok ho nesie aj tak. */
@media (max-height: 700px) { .ow-egypt-fig figcaption { display: none; } .ow-egypt-fig { min-height: 96px; } }
/* Farbu slova drží \`.hf-speak b\` (HF_HIGHLIGHT) — tu sa neprepisuje. */
/* Osem prvkov pod sebou — rozstup je 8, nie 12 ako na POVAHE. Tá nesie jednu
   otázku, táto štyri. */
.ow-stack .hf-plate { gap: 8px; }

/* ── RÁM ─────────────────────────────────────────────────────────────────
   ⚠️ 72 %, nie 84 ako na POVAHE: pod rámom stoja štyri úseky namiesto jedného
   radu, takže rám je jediný prvok, z ktorého sa dá ubrať bez toho, aby prestal
   byť čitateľný. Pod 70 % splývajú symboly v malých slotoch. */
/* 🔒 Šírku rámu určuje LOCK \`FLOW_GLYPH_CSS\` (\`--flow-glyph-w\`), nie táto
   obrazovka — na každom kroku musí byť heroglyf rovnako veľký (Matej 25. 9.).
   Vlastné percento sa sem NEVRACIA; keď sa obsah nezmestí, ustúpi obsah. */

/* ── PORADIE ─────────────────────────────────────────────────────────────
   Nie je to otázka, je to STAV — preto riadok, nie dlaždica. Papyrusová jamka
   ako pole, aby bolo vidieť, že údaj prišiel odinakiaľ a dá sa s ním hýbať. */
.ow-order {
  width: 100%; min-height: 44px; display: flex; align-items: center; gap: 8px;
  padding: 4px 8px 4px 12px; border-radius: ${j.tile}px;
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.55), rgba(242, 226, 189, 0.45));
  border: 1px solid ${l.hairline};
}
.ow-order .tx {
  flex: 1 1 auto; min-width: 0;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.25;
  color: ${l.inkSoft};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* 🔵 ZMENIŤ je AKCIA, teda lapis — a je to odkaz späť na krok 2, nie druhé CTA,
   preto obrys namiesto plnej plochy (lock: plná plocha len pre jediné CTA). */
.ow-change {
  flex: 0 0 auto; height: 26px; padding: 0 10px; cursor: pointer;
  border-radius: ${j.pill}px; border: 1.5px solid ${c.edge};
  background: transparent; color: ${c.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, color 150ms ease;
}
.ow-change:hover { background: ${c.edge}; color: #FDF7E7; }

/* ── KTO SI: mriežka 30 / 70 (25. 9. 2026, druhá podoba v ten istý deň) ─────
   Vľavo dve dlaždice pohlavia na výšku OBOCH riadkov, vpravo poradie psa
   a pod ním meno + písmeno. Poradie a meno tak začínajú na TEJ ISTEJ zvislici
   (Matej: *„poradie psa sa zarovná so začiatkom textarey s krstným menom"*).
   ⚠️ Ľavý stĺpec je \`minmax(min-content, 3fr)\`, nie holé 3fr: na telefóne je
      30 % ~90 px a EN „WOMAN" / RU „ЖЕНЩИНА" by v dlaždici pretiekli. Keď
      nápis nevojde, stĺpec narastie a ustúpi pravá strana, nie text. */
.ow-who {
  width: 100%; display: grid; gap: 8px;
  grid-template-columns: minmax(min-content, 3fr) minmax(0, 7fr);
}
.ow-right { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.ow-namerow { height: 44px; display: flex; align-items: stretch; gap: 8px; }
/* Pole si berie materiál \`.hf-field\`; mobilná podoba je tlačidlo, takže
   potrebuje zarovnanie textu doľava a výšku poľa. */
.ow-name {
  flex: 1 1 auto; min-width: 0; height: auto; text-align: left;
  text-transform: uppercase; letter-spacing: 0.05em;
}
/* Prázdne pole nesmie kričať veľkými písmenami cez placeholder. */
.ow-name:placeholder-shown { text-transform: none; letter-spacing: normal; }
/* 📱 Na telefóne je pole TLAČIDLO (otvára popup), takže \`:placeholder-shown\`
   nezaberie a dlhý text by sa zalomil na tri riadky cez vlys pod ním (merané
   25. 9. na 390 px). Jeden riadok, tri bodky; prázdne tlačidlo bez verzálok. */
button.ow-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
button.ow-name:not(.is-valid) { text-transform: none; letter-spacing: normal; }

/* ── NÁHĽAD SYMBOLU (písmeno · znamenie · zviera) ─────────────────────────
   Jeden tvar pre všetky tri: sú to VÝSLEDKY, nie voľby. Prázdny je tichá jamka
   s otáznikom, plný dostane lapisový lem — tá istá reč ako \`.hf-field.is-valid\`. */
.ow-mark {
  /* ⚠️ 36, nie 40 (25. 9.): riadok hviezd pribudol k dátumu a obrazovka na
     Matejovom okne pretiekla o 2 px. Rám je zamknutý, takže ustupujú náhľady —
     sú to značky, nie plochy, do ktorých sa ťuká. */
  flex: 0 0 auto; width: 36px; height: 36px; display: grid; place-items: center;
  border-radius: ${j.tile}px; overflow: hidden;
  border: 1.5px solid ${l.hairline};
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.65), rgba(242, 226, 189, 0.5));
}
.ow-mark.on { border-color: ${c.edge}; }
.ow-mark img { width: 26px; height: 26px; object-fit: contain; }
.ow-mark i {
  font-style: normal; font-family: 'Cinzel', serif; font-weight: 700; font-size: 16px;
  color: ${l.inkMuted};
}

/* Písmeno v riadku mena je štvorec vo výške riadka — menšie \`.ow-mark\`
   (36) ostáva pri hviezdach. */
.ow-namerow .ow-mark { width: 44px; height: auto; }
.ow-namerow .ow-mark img { width: 30px; height: 30px; }

/* ── POHLAVIE ────────────────────────────────────────────────────────────
   Dve VEĽKÉ dlaždice cez oba riadky — kresba hore, nápis MUŽ / ŽENA pod ňou.
   Materiál je spoločný \`.hf-pick\`; mení sa len smer a rozmer. */
.ow-genders { display: flex; gap: 8px; }
.ow-gender {
  flex: 1 1 0; width: auto; min-width: 0; padding: 8px 6px;
  flex-direction: column; justify-content: center; gap: 6px;
}
.ow-gender .tx { font-size: 12px; line-height: 1; letter-spacing: 0.06em; white-space: nowrap; }
/* 🔴 KRESBA V JAMKE MUSÍ MAŤ ROZMER. Bez neho si SVG vezme svoju natívnu výšku
   a silueta vytečie z dlaždice von (merané 25. 9.: nohy muža aj ženy viseli
   30 px pod okrajom). Tá istá pasca a to isté riešenie ako na PODSTATE
   (\`.es-picks .hf-pick .well img\`). */
.ow-gender .well { width: 48px; height: 48px; }
.ow-gender .well img { width: 40px; height: 40px; object-fit: contain; }

/* ── ČO O TEBE HOVORIA HVIEZDY — riadok VÝSLEDKU ─────────────────────────
   Od 25. 9. večer je to jeden ťukací riadok: dve značky · mená · VYBRAŤ /
   ZMENIŤ. Dátum a ručný výber sú v popupe. Materiál je jamka poradia
   (\`.ow-order\`) — obe sú STAV s tlačidlom, nie voľba. */
.ow-stars {
  width: 100%; display: flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 4px 8px 4px 4px; border-radius: ${j.tile}px; text-align: left;
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.55), rgba(242, 226, 189, 0.45));
  border: 1px solid ${l.hairline};
}
.ow-said {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em; text-transform: uppercase; color: ${l.inkSoft};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* V riadku je ZMENIŤ \`span\`, nie tlačidlo (celý riadok je tlačidlo) — text
   preto centruje flex, nie výška riadka tlačidla. */
.ow-stars .ow-change { display: inline-flex; align-items: center; }
.ow-stars:hover .ow-change { background: ${c.edge}; color: #FDF7E7; }

/* ── ZAMKNUTÉ CTA NESIE MATERIÁL, NIE PRIESVITNOSŤ ────────────────────────
   Ten istý recept ako na PATRÓNOVI a POVAHE: 40 % lapisu je na papyruse šedá
   plocha cez celú šírku dosky (Matej to zamietol 31. 8. 2026). */
/* ⚠️ 27. 9. 2026: pravidlo zaniklo — neaktívne CTA má vzhľad z E-MAILU, drží ho .hf-cta:disabled vo flowPaleSkin. */

/* ── 📱 TELEFÓN ──────────────────────────────────────────────────────────
   Dátum a dve značky sa do 360 px v jednom riadku nezmestia — rolety pod 96 px
   prestanú ukazovať názov mesiaca. Riadok sa preto zalomí a značky idú pod
   dátum, doprostred. */
/* 📱 Na telefóne sa do riadka nezmestí text aj mená — mená idú preč a ostávajú
   len značky (kresba znamenia je zrozumiteľnejšia než jej názov v 9 px). */
@media (max-width: 559px) {
  /* 3. 10. 2026 — „ZATIAĽ NEV…" sa na telefóne orezávalo (Matej: drobnosti
     heroflowu). Ten istý recept ako veta o poradí nižšie: dva riadky, nie
     tri bodky. Výška riadka sa nemení — určujú ju značky (36 px). */
  .ow-said {
    font-size: 10px; letter-spacing: 0.02em; white-space: normal; line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  /* Na 360 px nevošlo ani dvojriadkové „NEVYBRATÉ" — 137 px si bralo NECHCEM
     UVIESŤ. Ustupuje rozostup jeho písmen, nie text vety. */
  .ow-signs .ow-change { padding: 0 8px; letter-spacing: 0.06em; }

  /* 📱 V pravých 70 % ostáva na telefóne ~180 px a ZMENIŤ si z nich berie 76 —
     veta o poradí by sa skrátila na „HEKT…" (merané 25. 9. na 390 px). Zalomí
     sa preto na dva riadky menším písmom; výška riadka (44) sa nemení. */
  .ow-order .tx {
    white-space: normal; font-size: 12px; line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .ow-gender { padding: 6px 4px; }
  .ow-gender .tx { font-size: 10px; }
  .ow-gender .well { width: 40px; height: 40px; }
  .ow-gender .well img { width: 34px; height: 34px; }
}
/* Úzky telefón (≤ 380, napr. 360 px Android): ustúpia ešte značky 36 → 32,
   inak „NEVYBRATÉ" ani na dva riadky nevojde. */
@media (max-width: 380px) {
  .ow-signs { gap: 6px; }
  .ow-signs .ow-mark { width: 32px; height: 32px; }
  .ow-signs .ow-mark img { width: 22px; height: 22px; }
  .ow-signs .ow-change { padding: 0 6px; }
}
/* 🔴 KRÁTKE OKNO — a MUSÍ to stáť AŽ TU. Obe podmienky majú rovnakú
   špecificitu, takže rozhoduje poradie (tá istá pasca, čo 24. 9. zožrala
   zmenšenie siluet na PATRÓNOVI). */
/* ── 🔴 NÍZKE OKNO — a je jedno, či je to telefón, alebo Matejov notebook ─────
   Pravidlá tu stáli pôvodne len pre iPhone SE (max-width 559 AND max-height 700)
   a nízke ŠIROKÉ okno tým vypadlo — pritom je na ňom MAJITEĽ rovnako tesný:
   merané 25. 9. na 1477×660 mu pod doskou ostal 1 px. Rozhoduje VÝŠKA, nie šírka.
   🔑 Ustupuje OBSAH, nie rezerva od okraja (lock PAGE_AIR): výplň dosky,
      rozstupy, výška dlaždíc a náhľadov. Rám má vlastnú stupnicu vo
      FLOW_GLYPH_CSS a tá je spoločná pre celý vstup. */
@media (max-height: 700px) {
  .ow-stack .hf-plate { padding: 14px 16px; gap: 5px; }
  .ow-stack .hf-cta { height: 36px; }
  .ow-speak { margin-bottom: 4px; }
  .ow-order { min-height: 30px; }
  .ow-mark { width: 36px; height: 36px; }
  .ow-mark img { width: 24px; height: 24px; }
  .ow-namerow { height: 38px; }
  .ow-order { min-height: 38px; }
  .ow-namerow .ow-mark { width: 38px; }
  .ow-namerow .ow-mark img { width: 26px; height: 26px; }
  .ow-gender { padding: 6px 4px; gap: 4px; }
  .ow-gender .well { width: 38px; height: 38px; }
  .ow-gender .well img { width: 32px; height: 32px; }
}

/* ⚠️ Pravidlo vysokého telefónu ZANIKLO 28. 9. 2026 — rovnaký dôvod ako na PATRÓNOVI. */
/* ── PODKROKY (26. 9. 2026) ─────────────────────────────────────────────────
   Plocha otázky má PEVNÚ výšku najvyššieho podkroku (dlaždice pohlavia ako na
   podstate, 124 px) — výška obrazovky sa medzi podkrokmi nemení. Staré
   \`.ow-who\` (30/70) a \`.ow-stars\` (riadok s popupom) už nikto nekreslí. */
.ow-q { width: 100%; min-height: 124px; display: flex; align-items: center; }
.ow-qin { width: 100%; }
.ow-q .ow-genders { gap: 16px; min-height: 124px; }
.ow-q .ow-gender { padding: 12px; gap: 8px; align-items: center; }
.ow-q .ow-gender .tx { font-size: 14px; letter-spacing: 0.05em; }
.ow-q .ow-gender .well { width: 52px; height: 52px; }
.ow-q .ow-gender .well img { width: 40px; height: 40px; }
.ow-born { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.ow-signs { display: flex; align-items: center; gap: 8px; width: 100%; }
.ow-next {
  flex: 0 0 auto; height: 32px; padding: 0 14px; cursor: pointer; align-self: center;
  /* ZLATÉ, nie lapis — lapis je len jediné hlavné CTA (Matej 26. 9. na MENE). */
  /* 28. 9. 2026 — OBRYSOVÝ, nie plný (Matej: *„chip hotovo dajme obrysový, nie
     plný — všade vo flow, kde sme taký chip použili; nech nie sú dve fill
     tlačidlá pod sebou"*). Plné je len hlavné CTA pod ním. */
  border-radius: ${j.pill}px; border: 1.5px solid ${me.edge};
  background: transparent; color: ${me.ink}; box-shadow: none;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.14em; text-transform: uppercase;
}
.ow-next:disabled { opacity: 0.35; cursor: default; }
/* 26. 9. 2026 ~16:15 Matej na HVIEZDACH: *„keď je vybraté, bude svietiť na zeleno
   HOTOVO, nie ĎALEJ"* — znamenia sú potvrdený stav, nie krok vpred. Zelená =
   SPLNENÉ (\`PACK_THEME.growGreen\`, tá istá ako 100 % DOG ID). */
.ow-next.is-done { background: transparent; border-color: ${ge.growGreen}; color: ${ge.growGreen}; }
.ow-cta.is-off:hover { transform: none; }
@media (max-height: 700px) {
  .ow-q, .ow-q .ow-genders { min-height: 112px; }
  .ow-q .ow-gender { padding: 8px; gap: 4px; }
  .ow-q .ow-gender .well { width: 44px; height: 44px; }
  .ow-q .ow-gender .well img { width: 34px; height: 34px; }
}

`;export{aa as OwnerScreen};
