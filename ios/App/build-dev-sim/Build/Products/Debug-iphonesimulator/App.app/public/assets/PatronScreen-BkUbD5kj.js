import{g as fe,u as ie,k,r as m,M as J,f as se,j as o,m as w,B as ve,L as g,y as ge,x as ye,d as je}from"./index-DriUOdZL.js";import{u as we,F as ze,a as Ee}from"./flowDogPicker-C0gH0xe3.js";import{u as Se}from"./useFlowGuard-BnknS19j.js";import{P as Ne}from"./PageTopBar-3J3L1b0M.js";import{H as Le}from"./HeroglyphFrame-F7m3K15S.js";import{c as Pe,a as Ae,d as Te,b as Ce,e as Oe}from"./flowPaleSkin-CJNdyjt-.js";import{u as Me,F as Ie,a as De}from"./flowMedallion-C1OBUhVP.js";import{F as Fe,S as ae}from"./flowScroller-saaV6RfO.js";import{F as $e,a as Be}from"./flowPanel-BxF4HS-3.js";import{L as c}from"./labTheme-DLctEqJ2.js";import{h as Re}from"./hekthorFaces-myd4lVXL.js";import{H as _e}from"./hektor-DznQ9VDK.js";import{l as D}from"./breedDisplay-wiG-9-ut.js";import{H as pe,b as le}from"./HandIcons-BI9sYdb3.js";import{b as Ve}from"./breeds-DONRU28-.js";import{m as te}from"./proxy-5uIz4xGy.js";import"./flowMode-B6eboter.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./CHARACTER-WATERLOVER-Be2FY-gi.js";import"./RankingSlot-B9f52iXE.js";import"./NUMBER-11-BoEzuCvn.js";import"./initialLetter-CIe-_dtl.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";import"./index-BPi12Ps7.js";const de=Ve.breeds,ne=["01","02","03","04","05","06","07","08","09","10"],He={"01":9,"02":11,"03":7,"04":8,"05":7,"06":8,"07":10,"08":7,"09":6,10:9},W={};for(const r of de){const[n,P]=r.patron.split("-"),u=parseInt(P,10);n&&Number.isFinite(u)&&(W[n]=Math.max(W[n]??0,u))}const Ke=r=>{const n=Math.max(He[r]??0,W[r]??0);return Array.from({length:n},(P,u)=>`${r}-${String(u+1).padStart(2,"0")}.svg`)},ce=r=>`/patrons/${r}`,me=de.map(r=>({name:r.en,cat:r.group,patron:`${r.patron}.svg`})).sort((r,n)=>r.name.localeCompare(n.name)),Ue=6;function re({value:r,onPick:n,onClear:P,placeholder:u}){const O=ie(),{lang:z}=se(),[x,F]=m.useState(""),[y,E]=m.useState(!1),b=m.useRef(null),S=m.useRef(null),$=m.useRef(null),f=m.useMemo(()=>{if(r||x.trim().length<2)return[];const a=x.trim().toLowerCase();return me.filter(t=>t.name.toLowerCase().includes(a)||D(t.name,z).toLowerCase().includes(a)).slice(0,Ue)},[x,r,z]),N=!r&&x.trim().length>=2&&f.length===0?x.trim():"",L=f.length,[p,v]=m.useState(null);m.useEffect(()=>{if(!y||L===0){v(null);return}const a=()=>{const d=b.current;if(!d)return;const h=d.getBoundingClientRect(),s=window.visualViewport,A=s?s.offsetTop:0,U=A+(s?s.height:window.innerHeight),T=5,B=10,j=L*42+10,C=U-h.bottom-T-B,M=h.top-A-T-B,R=C<j&&M>C,_=Math.max(84,Math.min(j,R?M:C));v({left:h.left,width:h.width,maxHeight:_,top:R?h.top-T-_:h.bottom+T})};a();const t=window.visualViewport;return window.addEventListener("resize",a),window.addEventListener("scroll",a,!0),t==null||t.addEventListener("resize",a),t==null||t.addEventListener("scroll",a),()=>{window.removeEventListener("resize",a),window.removeEventListener("scroll",a,!0),t==null||t.removeEventListener("resize",a),t==null||t.removeEventListener("scroll",a)}},[y,L]),m.useEffect(()=>{if(!y)return;const a=t=>{var h,s;const d=t.target;!((h=b.current)!=null&&h.contains(d))&&!((s=$.current)!=null&&s.contains(d))&&E(!1)};return document.addEventListener("mousedown",a),()=>document.removeEventListener("mousedown",a)},[y]);const l=(a,t)=>{var d;n(a,t),F(D(a,z)),E(!1),(d=S.current)==null||d.blur()};return o.jsxs("div",{className:"pt-fieldwrap",ref:b,children:[o.jsxs("div",{className:`pt-field${r?" is-set":""}`,children:[o.jsx(pe,{size:15,className:"ic"}),o.jsx("input",{ref:S,value:r?D(r,z):x,onChange:a=>{r&&P(),F(a.target.value),E(!0)},onFocus:()=>E(!0),placeholder:u,autoComplete:"off",autoCorrect:"off",autoCapitalize:"words",spellCheck:!1,"data-1p-ignore":!0,"data-lpignore":"true","aria-label":u}),r?o.jsx(le,{size:15,className:"ok"}):null]}),y&&L>0&&p&&je.createPortal(o.jsx("div",{ref:$,className:"pt-menu","data-panel-keep":"",style:{left:p.left,top:p.top,width:p.width,maxHeight:p.maxHeight},children:f.map(a=>o.jsxs("button",{type:"button",onMouseDown:t=>{t.preventDefault(),l(a.name,a.cat)},onTouchStart:()=>l(a.name,a.cat),children:[o.jsx("span",{className:"nm",children:D(a.name,z)}),o.jsx("img",{src:ce(a.patron),alt:""})]},`${a.cat}-${a.name}`))}),document.body),N&&o.jsx("button",{type:"button",className:"pt-own",onMouseDown:a=>{a.preventDefault(),l(N,"")},onTouchStart:()=>l(N,""),children:O("heroglyph.flow.breed.own",{name:N})}),!r&&x.trim().length>=2&&f.length===0&&O("heroglyph.flow.breed.enHint")?o.jsx("p",{className:"pt-hint",children:O("heroglyph.flow.breed.enHint")}):null]})}function So(){const r=fe(),n=ie(),P=Se(),u=k(e=>e.dogName),O=k(e=>e.setPatronSvg),z=k(e=>e.setPatronCategory),x=k(e=>e.setPatronSvg2),F=k(e=>e.setPatronCategory2),y=k(e=>e.setBreed),E=k(e=>e.setIsMix),b=k(e=>e.setSelection),S=k(e=>e.dogEssence),$=k(e=>e.setDogEssence),f=we(),[N,L]=m.useState(0),p=f[Math.min(N,Math.max(0,f.length-1))],v=(p==null?void 0:p.id)??J,l=S[v]||{},a=l.patronSvg||"",t=l.breedType==="mix",d=l.breed==="Mixed"?l.mixBreed1||"":l.breed||"",h=l.mixBreed2||"",s=(e,i)=>{$(v,e,i),v===J&&(e==="patronSvg"&&O(i),e==="patronCategory"&&z(i),e==="breed"&&(y(i),E(i==="Mixed")),b(e,i))},A=(u==null?void 0:u.trim())||n("heroglyph.flow.breed.fallbackHero"),U=Me(),[T,B]=m.useState({}),j=T[v]||l.patronCategory||ne[0],C=e=>B(i=>({...i,[v]:e})),M=(e,i)=>{s("patronCategory",i),s("patronSvg",e)},R=(e,i)=>{s(t?"mixBreed1":"breed",e),t&&s("breed","Mixed");const ee=me.find(oe=>oe.name===e&&oe.cat===i);i&&C(i),ee&&!a&&M(ee.patron,i)},[_,V]=m.useState(!1),{lang:he}=se(),G=[d,t?h:""].filter(Boolean).map(e=>D(e,he)).join(" × "),Y=e=>!!e.patronSvg&&(e.breedType==="mix"||!!e.breed),H=!!a&&!t&&!d,I=Y(l),q=f.findIndex(e=>!Y(S[e.id]||{})),X=I&&q>=0,Q=m.useRef(null),[ue,Z]=m.useState(!1),ke=()=>{const e=Q.current;e==null||e.scrollIntoView({block:"center",behavior:"smooth"}),e==null||e.focus({preventScroll:!0}),Z(!1),requestAnimationFrame(()=>Z(!0))},xe=()=>{if(H){ke();return}if(!I)return;if(X){L(q);return}const e=S[J]||{},i=e.breedType==="mix";E(i),y(i?"Mixed":e.breed||""),b("breed",i?"Mixed":e.breed||""),b("breedType",i?"mix":"purebred"),i&&(b("mixBreed1",e.mixBreed1||""),b("mixBreed2",e.mixBreed2||"")),F(""),x(""),r("/heroglyph/dog-character")};if(!P)return null;const be=Ke(j);return o.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[o.jsxs("style",{children:[Pe,Ie,Ae,Te,Fe,ze,$e,Ge]}),o.jsx("div",{className:"hf-topbar flex-shrink-0",children:o.jsx(Ne,{brandBack:!0,onBack:()=>r("/heroglyph/essence")})}),o.jsx("div",{className:"hf-stage",children:o.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center pt-col",children:[o.jsxs(te.div,{className:"hf-speak pt-speak",initial:{opacity:0,y:-8},animate:{opacity:1,y:0},transition:{duration:.28},children:[o.jsx(De,{src:Re("breed"),size:U}),o.jsxs("span",{className:"say",children:[o.jsx("h2",{children:n("heroglyph.flow.breed.needs",{name:A})}),o.jsx("p",{children:n("heroglyph.flow.breed.subtitle")})]})]}),o.jsxs(te.div,{className:"hf-block hf-carved pt-stack",initial:{opacity:0,top:12},animate:{opacity:1,top:0},transition:{duration:.35},children:[o.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),o.jsxs("div",{className:"hf-plate",children:[o.jsx(Ee,{className:"pt-who",dogs:f,cur:N,onGo:L,done:!!(S[v]||{}).patronSvg}),o.jsx("span",{className:"fdh-rule","aria-hidden":!0}),o.jsx(Le,{showOwner:!0,dogValues:l,ghostValues:_e,pulseSlot:a?void 0:"dogShape",className:"hf-glyph pt-glyph",style:{width:"var(--flow-glyph-w)"}}),o.jsxs("button",{type:"button",ref:Q,className:`pt-breedchip${G?" is-set":""}${H?" is-need":""}${ue?" is-shake":""}`,onClick:()=>V(!0),onAnimationEnd:()=>Z(!1),"aria-haspopup":"dialog","aria-required":!t,children:[o.jsx(pe,{size:14,className:"ic"}),o.jsx("span",{className:"tx",children:G||n("heroglyph.flow.breed.pick")}),G?o.jsx(le,{size:14,className:"ok"}):!t&&o.jsx("span",{className:"req",children:n("heroglyph.flow.breed.mandatory")})]}),o.jsxs(Be,{open:_,className:"pt-breedpanel",label:n("heroglyph.flow.breed.popTitle",{name:(p==null?void 0:p.name)||A}),onClose:()=>V(!1),children:[o.jsx("h2",{className:"pt-pop-h",children:n("heroglyph.flow.breed.popTitle",{name:(p==null?void 0:p.name)||A})}),o.jsxs("div",{className:"fp-scroll",children:[o.jsxs("div",{className:"pt-breedrow",children:[o.jsx(re,{value:d,onPick:R,onClear:()=>s(t?"mixBreed1":"breed",""),placeholder:n(t?"heroglyph.flow.breed.mix.placeholder1":"heroglyph.flow.breed.one.placeholder")}),o.jsx("button",{type:"button",className:`pt-mix${t?" on":""}`,"aria-pressed":t,onClick:()=>{const e=!t;s("breedType",e?"mix":"purebred"),e?(s("mixBreed1",d),s("breed","Mixed")):(s("breed",d),s("mixBreed2",""))},children:n("heroglyph.flow.breed.type.mix")}),t&&o.jsx(re,{value:h,onPick:e=>s("mixBreed2",e),onClear:()=>s("mixBreed2",""),placeholder:n("heroglyph.flow.breed.mix.second")})]}),o.jsx("p",{className:"pt-pop-note",children:o.jsx("b",{children:n("heroglyph.flow.breed.statsNote")})})]}),o.jsx("button",{type:"button",className:"hf-cta",onClick:()=>V(!1),children:n("heroglyph.flow.message.done")})]}),o.jsx("p",{className:"hf-legend",children:n("heroglyph.flow.breed.legend")}),o.jsx(ae,{rowClass:"pt-cats",measureKey:j,centerSel:".pt-chip.on",children:ne.map(e=>o.jsx("button",{type:"button","data-cat":e,className:`pt-chip${e===j?" on":""}`,onClick:()=>C(e),children:n(`heroglyph.flow.breed.cat.${e}`)},e))}),o.jsx(ae,{rowClass:"pt-sils",measureKey:`${j}|${a}`,centerSel:".pt-sil.on",children:be.map(e=>o.jsx("button",{type:"button",className:`hf-pick is-pale pt-sil${e===a?" on":""}`,"aria-pressed":e===a,onClick:()=>M(e,j),children:o.jsx("img",{src:ce(e),alt:""})},e))}),H&&o.jsx("button",{type:"button",className:"pt-need",onClick:()=>V(!0),children:n("heroglyph.flow.breed.required")}),o.jsx("button",{type:"button",className:`hf-cta hf-dock${I?"":" is-off"}`,disabled:!I&&!H,"aria-disabled":!I,onClick:xe,children:n(X?"heroglyph.flow.multi.nextDog":"heroglyph.flow.breed.continue")})]})]})]})})]})}const K="#B25640",Ge=`
/* Bublina: stupeň písma viazaný na ŠÍRKU BUBLINY (cqw), nie na okno — inak
   nadpis pri zmene šírky ticho pretečie. Tá istá dvojica hodnôt ako PODSTATA,
   aby dva susedné kroky mali to isté písmo. */
.pt-speak { container-type: inline-size; margin-bottom: 8px; }
/* ⚠️ DOLNÁ HRANICA JE 18, NIE 16 (Matej 24. 9.: *„na mobile môžme zväčšiť prvý blok
   aj foto aj písmo"*). Na telefóne má bublina ~302 px, takže 4,6cqw dá 13,9 a clamp
   spadne na spodnú hranicu — tá je teda JEDINÉ číslo, ktoré na mobile platí.
   Na PC sa nemení nič: 4,6cqw je tam nad 20 a clamp drží strop. */
.pt-stack .hf-plate { gap: 10px; }

/* ── PLEMENO ──────────────────────────────────────────────────────────────
   Riadok sa zalamuje SÁM (\`flex-wrap\`): na doske širokej 520 px stoja dve polia
   aj pilulka v jednom rade (180 + 180 + ~112), na 302 px sa druhé pole zalomí
   pod prvé. Žiadny \`@media\` — zalomenie určuje miesto, nie šírka okna. */
.pt-breedrow { display: flex; flex-wrap: wrap; gap: 8px; width: 100%; }
/* ── POPUP S PLEMENOM (28. 9. 2026) ──────────────────────────────────────────
   V doske ostala pilulka pod rámom; ťuk otvorí popup nad oknom (FlowModal,
   ten istý ako (i) na MAJITEĽOVI a členstvo v pokladni). */
.pt-breedchip {
  align-self: center; display: inline-flex; align-items: center; gap: 8px;
  max-width: 100%; height: 32px; padding: 0 14px; cursor: pointer;
  border-radius: ${w.pill}px; border: 1.5px solid ${ve.edge};
  background: #FFFDF7; color: ${c.ink};
  font-family: 'Space Grotesk', sans-serif; font-size: 14px;
}
.pt-need { display: block; margin: 0 auto 8px; padding: 0; border: 0; background: none; font: 600 12px 'Space Grotesk', sans-serif; color: ${K}; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
/* Povinné pole: štítok v pilulke, pri chýbajúcom plemene (po výbere patróna) červený lem. */
.pt-breedchip .req { flex: none; font: 600 10px 'Space Grotesk', sans-serif; letter-spacing: .02em; color: ${K}; padding: 2px 6px; border-radius: ${w.pill}px; border: 1px solid ${K}; }
.pt-breedchip.is-need { border-color: ${K}; box-shadow: 0 0 0 3px rgba(178, 86, 64, .18); }
.pt-breedchip.is-shake { animation: pt-shake .45s ease-in-out; }
@keyframes pt-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
@media (prefers-reduced-motion: reduce) { .pt-breedchip.is-shake { animation: none; } }
.pt-breedchip .tx { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pt-breedchip .ic { flex: none; color: ${c.inkMuted}; }
.pt-breedchip .ok { flex: none; color: #2E5C3B; }
.pt-breedchip.is-set { border-color: ${g.edge}; background: linear-gradient(${g.fill}, ${g.fill}), #FFFDF7; }
.pt-pop-note b { font-weight: 600; }
.pt-pop-h {
  margin: 0; text-align: center; text-wrap: balance;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${Ce}; line-height: 1.25;
  letter-spacing: 0.02em; color: ${c.goldInk};
}
.pt-pop-note {
  margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45;
  color: ${c.inkBody};
}
.pt-breedpanel .hf-cta { flex: 0 0 auto; }
/* ⚠️ ZÁKLAD 150, NIE 180 px. Pri 180 sa na iPhone SE (375 px, doska 287) nezmestilo
   do riadka ani JEDNO pole s pilulkou (180 + 8 + 112 = 300) a riadok mal 88 px
   ešte pred zapnutím kríženca — teda obrazovka bola o 48 px vyššia zbytočne.
   Merané 24. 9. 2026: pri 150 stojí pole s pilulkou na SE v jednom rade (258 z 287)
   a na doske 520 px sa do jedného radu vojdú OBE polia aj pilulka. */
.pt-fieldwrap { flex: 1 1 150px; min-width: 0; position: relative; }
/* Pole je BIELE — jediná plocha, ktorá pýta zásah (ten istý dôvod aj recept ako
   \`.hf-field\`: papyrus na papyruse sa v doske stratí). Výška 40 = výška pilulky
   vedľa neho, aby riadok nemal dve rôzne vysoké veci. */
.pt-field {
  display: flex; align-items: center; gap: 8px; height: 40px;
  border-radius: ${w.tile}px; padding: 0 12px;
  background: #FFFDF7; border: 2px solid rgba(179, 130, 45, 0.55);
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.pt-field:focus-within { border-color: ${g.edge}; box-shadow: 0 0 0 3px ${g.halo}; }
/* Potvrdené plemeno: lapisový tint NAD bielou, nie namiesto nej — samotný
   \`LAPIS.fill\` je priehľadný a zlatá doska by cez neho zošedivela. */
.pt-field.is-set {
  border-color: ${g.edge};
  background: linear-gradient(${g.fill}, ${g.fill}), #FFFDF7;
}
.pt-field input {
  flex: 1; min-width: 0; border: none; background: none; outline: none;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${c.ink};
}
/* 16 px na telefóne, inak si iOS pri zaostrení priblíži celú stránku a z kroku
   sa stane výrez. Je to jediné miesto, kde sa stupeň líši podľa šírky. */
@media (max-width: 559px) { .pt-field input { font-size: 16px; } }
.pt-field input::placeholder { color: ${c.inkMuted}; }
.pt-field .ic { flex: none; color: ${c.inkMuted}; }
.pt-field .ok { flex: none; color: #2E5C3B; }
.pt-hint {
  margin: 4px 2px 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
  line-height: 1.35; color: ${c.inkSoft};
}

/* Kríženec = pilulka, nie dlaždica. Nevybraná je papyrus, vybraná lapisový TINT
   (lock 26. 8.: plná farebná plocha patrí jedinému CTA obrazovky). */
.pt-mix {
  flex: 0 0 auto; height: 40px; padding: 0 14px; border-radius: ${w.pill}px;
  cursor: pointer; white-space: nowrap;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: ${c.inkSoft}; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 252, 240, 0.85), 0 1px 2px rgba(60, 40, 10, 0.10);
  transition: border-color .16s, box-shadow .16s, background .16s, color .16s;
}
.pt-mix:hover { border-color: rgba(179, 130, 45, 0.85); }
.pt-mix.on { ${ge(g.edge,ye.lapis)} }
/* Na najužších telefónoch ustupuje VÝPLŇ pilulky, nie stupeň písma — slovo
   KRÍŽENEC musí ostať čitateľné rovnako ako na PC. */
@media (max-width: 559px) { .pt-mix { padding: 0 11px; letter-spacing: 0.06em; } }

/* Ponuka plemien — portál do \`<body>\`, poloha z komponentu (meria
   \`visualViewport\`). Papyrusová karta so zlatým rámom, ten istý materiál ako
   ponuka krajín (\`.hf-cpick-menu\`). */
.pt-menu {
  position: fixed; z-index: 2100; overflow-y: auto; padding: 5px;
  display: flex; flex-direction: column; gap: 2px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid ${c.goldSolid}; border-radius: ${w.tile}px;
  box-shadow: 0 12px 30px rgba(60, 40, 10, .28);
}
.pt-menu button {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; text-align: left; padding: 8px 9px; border: none; border-radius: 8px;
  background: none; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${c.ink};
}
.pt-menu button:hover { background: rgba(201, 154, 63, .16); }
.pt-menu button .nm { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pt-menu button img { flex: none; width: 24px; height: 24px; object-fit: contain; opacity: .9; }
/* „Zapísať …" — riadok v toku pod poľom, nie nad obsahom (18. 10. 2026). Materiál
   ponuky, ale bez tieňa (neleží NAD doskou) a s zalomením namiesto trojbodky. */
.pt-own {
  display: block; width: 100%; margin-top: 4px; padding: 8px 12px; text-align: left; cursor: pointer;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid ${c.goldSolid}; border-radius: ${w.tile}px;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.35; color: ${c.ink};
  overflow-wrap: anywhere;
}
.pt-own:hover { background: rgba(201, 154, 63, .16); }

/* ── RÁM ──────────────────────────────────────────────────────────────────
   Tá istá šírka ako na PODSTATE: 78 % od 560 px, 100 % pod tým. Na telefóne je
   doska sama úzka a sťahovanie na 78 % zrazilo symboly v malých slotoch na
   nečitateľné (merané 24. 9.: 63 px výšky proti 80 px na LIVE).
   ⚠️ Číslo je premenná, lebo šírku zapisuje INLINE \`style\` na komponente. */
/* 🔒 Šírku rámu určuje LOCK \`FLOW_GLYPH_CSS\` (\`--flow-glyph-w\`), nie táto
   obrazovka — na každom kroku musí byť heroglyf rovnako veľký (Matej 25. 9.).
   Vlastné percento sa sem NEVRACIA; keď sa obsah nezmestí, ustúpi obsah. */

/* ── VODOROVNÉ RADY ───────────────────────────────────────────────────────
   🔑 PRESUNUTÉ 25. 9. 2026 DO \`flowScroller.tsx\` (\`.hf-scroll\` / \`.hf-srow\` /
      \`.hf-snav\`) — ten istý rad dostala aj POVAHA a dve kópie merania a šípok by
      sa raz rozišli. Text pravidiel je nezmenený, len sa presťahoval.
   ⚠️ Geometria dlaždíc (\`.pt-cats\`, \`.pt-sils\`) ostáva TU: to je vec obsahu
      tejto obrazovky, nie ovládača. */

/* ── KATEGÓRIA = ZLATÁ, SILUETA = LAPIS (Matej 24. 9.) ────────────────────
   *„chipy by som nedával modré, ale možno nejak odlíšil farebne od spodných
   blokov, nech to nie je jednotvárne"* — a to je presne to, čo predpisuje brand
   lock: **ZLATO = konštrukcia a poloha** („kde som", menovite *aktívna pilulka*)
   · **LAPIS = moja voľba a akcia** („čo urobím").
   🔑 Kategória hovorí, ktorú POLICU mám otvorenú — nič si ňou nevyberám, patrón
      sa ňou nemení. Silueta POD ňou je odpoveď, ktorá ide do heroglyfu. Dva rady
      nad sebou tak prestali byť dvakrát to isté modré.
   ⚠️ Pilulka KRÍŽENEC ostáva LAPISOVÁ zámerne — to je voľba, nie poloha. */
.pt-chip {
  flex: 0 0 auto; height: 28px; padding: 0 11px; border-radius: ${w.pill}px;
  cursor: pointer; white-space: nowrap;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em;
  color: ${c.inkSoft}; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  background: rgba(255, 253, 247, 0.55);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  transition: border-color .16s, background .16s, color .16s, box-shadow .16s;
}
.pt-chip:hover { border-color: rgba(179, 130, 45, 0.85); }
/* 26. 9. 2026: vybraná kategória = spoločné lapisové podsvietenie vstupu
   (Matej: *„výber patróna nezabudni zosúladiť to podsvietenie s celým flow,
   kľudne môžeš trochu pridať na intenzite"*). Predtým plná zlatá. */
.pt-chip.on { ${Oe} }

/* Návod k výberu — najtichší riadok obrazovky. Menší než popisky v doske a bez
   rozstrelenia: je to poznámka pod čiarou, nie druhý nadpis. */
.pt-hintline { font-size: 12px; margin-top: -2px; }

/* ── SILUETA ──────────────────────────────────────────────────────────────
   🔴 DLAŽDICA JE \`.hf-pick\` — mení sa LEN GEOMETRIA. Materiál (papyrusový
      gradient, vypuklá hrana, lapisový tint pri výbere) sa neopisuje, inak by
      voľba na tejto obrazovke vyzerala inak než voľba na PODSTATE.
   ⚠️ NEDOSTÁVA PLNÚ ZLATÚ VÝPLŇ, akú Matej 24. 9. vybral pre dlaždice PODSTATY
      (\`.es-picks .hf-pick\` = \`BRAND_GOLD_BTN\`). Tam sú dve až tri dlaždice a
      zlato ich odlíšilo od chipov nad nimi; tu ich je v rade 6–11 a plná zlatá
      by z radu urobila zlatý pás, v ktorom čierna kresba patróna prestane byť
      tým, na čo sa oko pozerá. Kresba je tu odpoveď, nie ozdoba.
      🚩 Je to jediné miesto, kde som jeho rozhodnutie z predchádzajúceho kroku
         NEPRENIESOL — čaká na jeho slovo. */
.pt-sil {
  flex: 0 0 auto; width: 68px; height: 68px; padding: 0;
  justify-content: center; border-radius: ${w.tile}px;
}
.pt-sil img { width: 48px; height: 48px; object-fit: contain; }
/* 26. 9. 2026: silueta nesie bledú polohu \`.is-pale\` a výber \`FLOW_PICK_ON\` —
   tá istá dlaždica ako na podstate (Matej: *„zosúladiť to podsvietenie s celým
   flow"*). Tým padá 🚩 vyššie: podstata už zlatá nie je. */
/* ── ZAMKNUTÉ CTA NESIE MATERIÁL, NIE PRIESVITNOSŤ ────────────────────────
   🔴 \`.hf-cta:disabled\` má \`opacity: .4\` — a 40 % lapisu je na papyruse ŠEDÁ
      PLOCHA cez celú šírku dosky. Presne to Matej zamietol 31. 8. 2026 na
      siluete (*„šedé tlačítko a tieň presvitá"*) a kvôli tomu má prezliekacia
      vrstva \`flowRedress.tsx\` vlastné pravidlo pre staré obrazovky. Nová
      obrazovka ho nededí (to pravidlo visí na \`.dark-bg\`), takže si ho berie
      sama — ten istý recept: plochý papyrus, tlmený inkoust, žiadny tieň.
      Tvar ostáva, takže je vidno, čo pribudne, keď patrón pribudne. */
/* ⚠️ 27. 9. 2026: pravidlo zaniklo — neaktívne CTA má vzhľad z E-MAILU, drží ho .hf-cta:disabled vo flowPaleSkin. */
/* ── KRÁTKE OKNO: USTUPUJE OBSAH, NIE REZERVA ─────────────────────────────
   Lock \`PAGE_AIR\`: *kto sa nezmestí, ZMENŠÍ OBSAH — nie vzduch od okraja.*
   Po zväčšení prvého bloku (24. 9.) pretekala jediná zostava: **iPhone SE
   (375×667) so zapnutým krížencom** — o 29 px. Ustupujú preto tri najmenej
   dôležité miery naraz: rozstupy v doske, dlaždica siluety a výška polí.
   ⚠️ Hektor sa NEZMENŠUJE — je to prvé, čo Matej na mobile zväčšoval.
   ⚠️ Nie je to stupňovanie „podľa výšky okna" v zmysle, aký zamietol na
      PODSTATE (tam sa obrazovka menila PRI ODPOVEDANÍ). Tu je to jedna pevná
      poloha pre nízke okná a v nej sa už nič nehýbe. */
@media (max-height: 700px) {
  .pt-stack .hf-plate { gap: 8px; }
  /* ⚠️ SILUETA TU NIE JE, hoci tu do 24. 9. večera stála (54/38). Bolo to MŔTVE
     pravidlo: mobilný blok nižšie má rovnakú špecificitu a stojí ZA týmto, takže
     na iPhone SE (375×667 — spĺňa obe podmienky) vyhrával on. Zmenšenie siluety
     na krátkom okne rieši až spoločná podmienka na konci hárku. */
  .pt-field, .pt-mix { height: 36px; }
  .pt-chip { height: 26px; }
  /* Tlačidlo ustupuje ako POSLEDNÉ a len o 4 px — musí ostať zjavne tlačidlom.
     Rám heroglyfu neustupuje vôbec: pod 78 % sa symboly v malých slotoch
     zlievajú (premerané 24. 9. na 390 px), a to je celý zmysel tejto obrazovky. */
  .pt-stack .hf-cta { height: 36px; }
  /* Posledné 4 px: medzera medzi bublinou a doskou. Nula by ich zlepila. */
  .pt-speak { margin-bottom: 4px; }
}
/* Kresby patrónov sú ČIERNE (kánon počas života psa, DOGMA 8.3) a na papyruse
   ostávajú čierne — žiadny filter. */
/* ── 📱 NA TELEFÓNE SÚ SILUETY VÄČŠIE A JE ICH V ZÁBERE MENEJ ──────────────
   Matej 24. 9. 2026: *„na mobile to má rezervy = zväčši siluety psov, kľudne
   môžu byť len 5 viditeľných, nie ako teraz 6; hore aj dolu je dostatok
   priestoru = využime ho"*.
   🔑 ČÍSLO NIE JE ODHAD. Matej pozerá rám 500 px (dielňa aj jeho okno): doska
      v ňom má 412 px, takže PÄŤ dlaždíc s rozstupom 8 vyjde na
      (412 − 4×8) / 5 = **76 px**. Pri 62 ich tam bolo presne šesť — to, čo videl.
   🔑 REZERVU MINIEME NA KRESBU, nie na vzduch: dlaždica rastie 62 → 76 a kresba
      44 → 56, takže silueta psa je o štvrtinu väčšia. Rad tým vyrastie o 14 px;
      na 390×844 ostáva vzduch okolo 110 px na každej strane.
   ⚠️ Na 390 px je v zábere ~3,5 dlaždice. Je to Matejova voľba (*„kľudne môžu
      byť len 5"*) a odrezaná dlaždica na okraji je zároveň to jediné, čo na
      dotyku hovorí „rad pokračuje" — šípky sú tam skryté. */
@media (max-width: 559px) {
  .pt-sil { width: 80px; height: 80px; }
  /* Kresba zaberá 75 % dlaždice (na PC 70 %) — Matej pýtal väčšie SILUETY, nie
     väčšie rámčeky, a osem pixelov vzduchu okolo kresby na to stačí. */
  .pt-sil img { width: 60px; height: 60px; }
}
/* 🔴 KRÁTKE OKNO + TELEFÓN NARAZ — a MUSÍ to stáť AŽ TU. Obe podmienky majú
   rovnakú špecificitu, takže rozhoduje poradie; keď to pravidlo stálo vyššie,
   iPhone SE si bral mobilnú veľkosť a zmenšenie sa ticho nedialo.
   66 px je strop, ktorý sa na SE ešte zmestí aj so zapnutým krížencom
   (premerané: vzduch ostáva nad 16 px, teda nad dnom \`PAGE_AIR\`). */
@media (max-width: 559px) and (max-height: 700px) {
  .pt-sil { width: 70px; height: 70px; }
  .pt-sil img { width: 52px; height: 52px; }
}
/* 🔴 3. 10. 2026 — VEĽMI nízke okno (< 600): iPhone SE v Safari s lištami
   = 375×553, PATRÓN pretekal o 26 px a spodná hrana dosky sedela pod okrajom.
   Hektor ustúpi sám (\`useSpeakMedal\` → 60), zvyšok berie dlaždica siluety
   a rozstupy — rám heroglyfu ostáva (pozri vyššie, prečo). */
@media (max-height: 600px) {
  .pt-stack .hf-plate { gap: 6px; }
  .pt-sil { width: 60px; height: 60px; }
  .pt-sil img { width: 44px; height: 44px; }
}

/* ── 📱 VYSOKÝ TELEFÓN — pravidlo ZANIKLO 28. 9. 2026 ─────────────────────────
   25. 9. tu rástol vzduch v blokoch od výšky 701 px (padding 32, medzery 16).
   Merané bolo len na 390×844; na 390×740 (telefón s lištou prehliadača) tým
   obrazovka pretiekla o 72 px a CTA zmizlo pod okrajom. Matej 28. 9.: *„horná
   časť 2. bloku kde je meno je tu zbytočne vysoká — premeraj výšky na každej
   obrazovke a zjednoť ich na také ako sú pri essence"*. Novší pokyn prebil
   „daj na 85 %" z 25. 9.; bloky majú odteraz rozmery PODSTATY. */
`;export{So as PatronScreen};
