import{g as de,u as ce,f as he,k as p,r as a,M as D,j as e,L as o,m as n,d as me,I as ge}from"./index-DriUOdZL.js";import{r as xe}from"./appRegister-Cj9fmMG3.js";import{u as fe}from"./useFlowGuard-BnknS19j.js";import{u as ve}from"./useFlowKeyboardFix-fjrOiUUO.js";import{P as ue}from"./PageTopBar-3J3L1b0M.js";import{H as we}from"./HeroglyphFrame-F7m3K15S.js";import{V as be}from"./VerticalHeroglyphFrame-DdOJsB1O.js";import{c as ke,a as ye,d as je}from"./flowPaleSkin-CJNdyjt-.js";import{F as Ne,a as Se}from"./flowMedallion-C1OBUhVP.js";import{R as m,L as w,F as Ee,a as N}from"./flowIntro-D58zEUeg.js";import{u as Fe,F as Ae,a as Me}from"./flowDogPicker-C0gH0xe3.js";import{MESSAGE_MAX_CHARS as g,MessageModal as Ce}from"./MessageScreen-Cr_Uk5Ov.js";import{L as s}from"./labTheme-DLctEqJ2.js";import{h as Le}from"./hekthorFaces-myd4lVXL.js";import{F as ze}from"./flowFullSkin-B8mfOKvS.js";import{A as Z}from"./index-BPi12Ps7.js";import{m as S}from"./proxy-5uIz4xGy.js";import"./flowSvorka-Ck3rYXr8.js";import"./heroglyphCode-DlQZhGCv.js";import"./initialLetter-CIe-_dtl.js";import"./breeds-DONRU28-.js";import"./flowMode-B6eboter.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./keyboardInset-BtDUCG-L.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./CHARACTER-WATERLOVER-Be2FY-gi.js";import"./RankingSlot-B9f52iXE.js";import"./NUMBER-11-BoEzuCvn.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";import"./button-DG9ZdJZB.js";import"./utils-DjMOivUe.js";import"./index-Bq6or85s.js";import"./hekthor-GYpD1FGC.js";function jr(){ve();const d=de(),t=ce(),{lang:E}=he(),F=fe(),b=p(r=>r.selections),O=p(r=>r.setSelection),J=p(r=>r.ownerName),q=p(r=>r.patronSvg),A=p(r=>r.dogEssence),P=p(r=>r.setDogEssence),k=Fe(),[Q,_]=a.useState(0),I=Math.min(Q,Math.max(0,k.length-1)),c=k[I],x=(c==null?void 0:c.id)??D,f=x===D,[M,C]=a.useState(!1);a.useEffect(()=>{if(!M)return;const r=i=>{i.key==="Escape"&&C(!1)};return window.addEventListener("keydown",r),()=>window.removeEventListener("keydown",r)},[M]);const[L,V]=a.useState(()=>"plate"),h=t("heroglyph.flow.revealNew.titlePrefix"),v=t("heroglyph.flow.revealNew.titleWord"),y=t("heroglyph.flow.revealNew.titleSuffix"),z=t("heroglyph.flow.revealNew.titleEnd"),B=a.useMemo(()=>{const r=(h+v+y+z).length;return Math.min(4e3,Math.round((m+r*w+1.4)*1e3))},[]);a.useEffect(()=>{if(L!=="hero")return;const r=window.setTimeout(()=>V("plate"),B);return()=>window.clearTimeout(r)},[L,B]);const X=a.useMemo(()=>{if(typeof window>"u")return 240;const r=Math.min(window.innerWidth,640)*.72,i=window.innerHeight*.38;return Math.round(Math.max(148,Math.min(310,Math.min(r,i))))},[]),l=A[x]||{},ee=f?{...b,...l}:l,re={selections:{...b,...l},ownerName:J,patronSvg:f?l.patronSvg||q:l.patronSvg||""},u=(f?l.dogMessage??b.dogMessage:l.dogMessage)||"",[j,te]=a.useState(""),[ae,oe]=a.useState(!1),ie=a.useRef(null),se=j.length>g,R=()=>{const r=j.trim();r.length>g||(P(x,"dogMessage",r),f&&O("dogMessage",r),r&&$(!1),oe(!1))},T=(c==null?void 0:c.name)||t("heroglyph.flow.yourDogFallback"),ne=r=>{var i,U;return((r===D?((i=A[r])==null?void 0:i.dogMessage)??b.dogMessage:(U=A[r])==null?void 0:U.dogMessage)||"").trim()},[W,$]=a.useState(!1),[H,K]=a.useState(!1),[G,Y]=a.useState(""),le=async()=>{if(H)return;if(!p.getState().email.trim()){d("/heroglyph/email");return}K(!0),Y("");const r=await xe(E);if(K(!1),r.ok){d("/login");return}Y(t(r.error==="photo"?"appEntry.save.errPhoto":r.error==="email"?"appEntry.save.badMail":r.error==="send"?"appEntry.save.errSend":"appEntry.save.errSave"))},pe=()=>{const r=k.findIndex(i=>!ne(i.id));if(r<0){if(ge){le();return}d("/heroglyph/vstupne");return}_(r),$(!0)};return F?e.jsxs("div",{className:"hf-pale flex flex-col h-[100dvh] overflow-hidden",children:[e.jsxs("style",{children:[ke,Ne,Ee,ye,je,Ae,Oe,Pe]}),e.jsx("input",{ref:ie,type:"text","aria-hidden":"true",readOnly:!0,tabIndex:-1,style:{position:"fixed",top:0,left:0,width:1,height:1,opacity:0,pointerEvents:"none"}}),e.jsx("div",{className:"hf-topbar flex-shrink-0",children:e.jsx(ue,{brandBack:!0,onBack:()=>d("/heroglyph/owner-info")})}),e.jsx("div",{className:"hf-stage",children:e.jsx("div",{className:"w-full max-w-xl flex flex-col items-center rv-col",children:e.jsx(Z,{mode:"wait",children:L==="hero"?e.jsxs(S.button,{type:"button",className:"rv-hero",onClick:()=>V("plate"),initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,scale:.96,y:-16},transition:{duration:.4},children:[e.jsx("span",{className:"hf-medin",children:e.jsx(Se,{src:Le("reveal"),size:X,className:"hf-medal"})}),e.jsxs("span",{className:"rv-hero-h",children:[e.jsx(N,{text:h,from:m}),e.jsx(N,{text:v,from:m+h.length*w,bold:!0}),e.jsx(N,{text:y,from:m+(h.length+v.length)*w}),e.jsx("span",{className:"rv-br","aria-hidden":!0}),e.jsx(N,{text:z,from:m+(h.length+v.length+y.length)*w})]}),e.jsx("span",{className:"rv-hero-sub",style:{animationDelay:`${(m+(h+v+y+z).length*w).toFixed(2)}s`},children:t("heroglyph.flow.revealNew.sub")})]},"hero"):e.jsxs(S.div,{className:"w-full flex flex-col items-center",style:{position:"relative"},initial:{opacity:0,top:24},animate:{opacity:1,top:0},transition:{duration:.4},children:[!ze,e.jsxs(S.div,{className:"hf-block hf-carved rv-stack",initial:{opacity:0,top:12},animate:{opacity:1,top:0},transition:{duration:.35},children:[e.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),e.jsxs("div",{className:"hf-plate",children:[e.jsx(Me,{dogs:k,cur:I,onGo:_,done:!!u}),e.jsx("span",{className:"fdh-rule","aria-hidden":!0}),e.jsxs("div",{className:"rv-orn",children:[e.jsx("span",{className:"rv-orn-line","aria-hidden":!0}),["tl","tr","bl","br"].map(r=>e.jsxs("svg",{className:`rv-corner ${r}`,viewBox:"0 0 40 40","aria-hidden":!0,children:[e.jsx("path",{d:"M2 38 V14 Q2 2 14 2 H38",fill:"none",stroke:"currentColor",strokeWidth:"1.6"}),e.jsx("path",{d:"M8 38 V17 Q8 8 17 8 H38",fill:"none",stroke:"currentColor",strokeWidth:"0.9",opacity:".7"}),e.jsx("circle",{cx:"14",cy:"14",r:"2.6",fill:"currentColor"}),e.jsx("path",{d:"M20 14 h6 M14 20 v6",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round"})]},r)),e.jsx("svg",{className:"rv-diamond t",viewBox:"0 0 24 12","aria-hidden":!0,children:e.jsx("path",{d:"M12 1 L22 6 L12 11 L2 6 Z",fill:"currentColor"})}),e.jsx("svg",{className:"rv-diamond b",viewBox:"0 0 24 12","aria-hidden":!0,children:e.jsx("path",{d:"M12 1 L22 6 L12 11 L2 6 Z",fill:"currentColor"})}),e.jsx("div",{className:"rv-glyph",children:e.jsx(Z,{mode:"wait",initial:!1,children:e.jsx(S.div,{className:"rv-glyph-h",initial:{opacity:0,scale:.97},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.97},transition:{duration:.22},children:e.jsx(we,{showOwner:!0,dogValues:ee,className:"hf-glyph",style:{width:"var(--rv-glyph-w)"}})},`h-${x}`)})})]}),e.jsxs(e.Fragment,{children:[e.jsxs("h1",{className:"rv-h1",children:[t("heroglyph.flow.revealNew.title2a"),e.jsx("b",{children:t("heroglyph.flow.revealNew.title2w")}),t("heroglyph.flow.revealNew.title2b")]}),e.jsx("p",{className:"rv-sub",children:t("heroglyph.flow.revealNew.sub2")}),e.jsx("textarea",{className:`rv-ta${W&&!u?" need":""}`,rows:3,maxLength:g,value:u,placeholder:t("heroglyph.flow.revealNew.msgPlaceholder"),onChange:r=>{const i=r.target.value.slice(0,g);P(x,"dogMessage",i),f&&O("dogMessage",i),i.trim()&&$(!1)}}),e.jsx("p",{className:"rv-count",children:t("heroglyph.flow.revealNew.chars",{n:String(u.length),max:String(g)})}),e.jsx("p",{className:"rv-where",children:t("heroglyph.flow.revealNew.where")})]}),W&&!u&&e.jsx("p",{role:"alert",className:"hf-alert",children:t("heroglyph.flow.revealNew.msgRequired",{dogName:T})}),G&&e.jsx("p",{role:"alert",className:"hf-alert",children:G}),e.jsx("button",{type:"button",className:"hf-cta hf-dock",onClick:pe,disabled:H,children:t("heroglyph.flow.breed.continue")})]})]})]},"plate")})})}),M&&me.createPortal(e.jsx("div",{className:"rv-vmodal",role:"dialog","aria-modal":"true",onClick:()=>C(!1),children:e.jsxs("div",{className:"rv-vcard",onClick:r=>r.stopPropagation(),children:[e.jsx("div",{className:"rv-vwrap",children:e.jsx(be,{data:re,className:"rv-vsvg"})}),e.jsx("button",{type:"button",className:"rv-vclose",onClick:()=>C(!1),children:t("heroglyph.flow.revealNew.horizontal")})]})}),document.body),ae&&e.jsx(Ce,{value:j,placeholder:t("heroglyph.flow.message.placeholder",{dogName:T}),doneLabel:t("heroglyph.flow.message.done"),isOverLimit:se,charCount:j.length,maxChars:g,onChange:te,onDone:R,onClose:R,doneTone:"lapis",preview:e.jsx(De,{label:t("heroglyph.flow.revealNew.previewTag")})})]}):null}const $e=2.3;function De({label:d}){const[t,E]=a.useState(!1);return e.jsxs("div",{className:"rv-prev",children:[e.jsxs("video",{poster:"/images/wall-odkaz-poster.jpg",autoPlay:!0,muted:!0,loop:!0,playsInline:!0,"aria-hidden":"true",onTimeUpdate:F=>E(F.currentTarget.currentTime>=$e),children:[e.jsx("source",{src:"/videos/wall-odkaz.webm",type:"video/webm"}),e.jsx("source",{src:"/videos/wall-odkaz.mp4",type:"video/mp4"})]}),e.jsxs("svg",{className:`rv-prev-arrow${t?" on":""}`,viewBox:"0 0 24 34","aria-hidden":"true",children:[e.jsx("path",{d:"M12 32 C 10 22, 14 14, 12 4",fill:"none",stroke:"currentColor",strokeWidth:"3.5",strokeLinecap:"round"}),e.jsx("path",{d:"M4 12 L 12 3 L 20 12",fill:"none",stroke:"currentColor",strokeWidth:"3.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),e.jsx("span",{className:`rv-prev-tag${t?" on":""}`,children:d})]})}const Oe=`
/* ── PRÍCHOD — veľká bublina (ten istý gradient ako \`.hf-speak\`) ─────────── */
.rv-hero {
  width: 100%; container-type: inline-size; cursor: pointer; border: none;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 32px 16px; border-radius: 16px; text-align: center;
  background: var(--brand-gradient); color: #FAF4EC;
}
.rv-hero-h {
  font-family: 'Cinzel', serif; font-weight: 700; line-height: 1.25;
  font-size: clamp(20px, min(7cqw, 4.4dvh), 32px);
}
.rv-br { display: block; height: 0; }
.rv-hero-sub {
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; line-height: 1.4;
  color: rgba(250, 244, 236, 0.78);
  animation: hf-letter .5s ease-out both;
}
@media (prefers-reduced-motion: reduce) { .rv-hero-sub { animation: none; } }

/* ── NADPIS NAD DOSKOU — po príchode ostane len veta, malým písmom ────────── */
.rv-kicker {
  margin: 0 0 12px; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px;
  letter-spacing: 0.14em; text-transform: uppercase; color: ${s.inkSoft};
}
.rv-kicker b { color: ${s.goldInk}; }
.rv-stack .hf-plate { gap: 8px; }
/* ── ODHALENIE NA CELÚ OBRAZOVKU (7. 11. 2026): čierny heroglyf, tenké zlaté rohy ── */
html[data-flow-full] .rv-glyph-h { filter: brightness(0); }
html[data-flow-full] .rv-seg { display: none; }
html[data-flow-full] .rv-orn { padding: 36px 32px; color: #C99A3F; }
html[data-flow-full] :is(.rv-orn-line, .rv-diamond) { display: none; }
html[data-flow-full] .rv-corner { width: 44px; height: 44px; }
.rv-h1 { margin: 0; text-align: center; font-size: 24px; line-height: 1.2; letter-spacing: .04em; text-transform: uppercase; color: #000; }
.rv-h1 b { font-weight: 900; background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.rv-sub { margin: 0; text-align: center; font-size: 14px; line-height: 1.4; color: #1a1208; }
.rv-ta {
  width: 100%; height: 96px; padding: 12px; resize: none; display: block;
  border-radius: 12px; border: 1px solid #C99A3F; font-size: 16px; line-height: 1.35; color: #000;
  background: linear-gradient(180deg, #FFFDF7 0%, #F2E2BD 100%);
}
.rv-ta:focus { outline: none; border-color: ${o.edge}; box-shadow: 0 0 0 2px rgba(22, 48, 122, 0.25); }
.rv-ta.need { border-color: #B25640; }
.rv-ta::placeholder { color: rgba(0, 0, 0, 0.45); }
.rv-count { margin: -4px 0 0; text-align: right; font-size: 10px; color: #1a1208; }
.rv-where { margin: 0; text-align: center; font-size: 10px; color: #1a1208; }

/* 🔴 JAMKA RÁMU MÁ PEVNÚ VÝŠKU PRE OBA DIZAJNY. Doska je centrovaná, takže
   keď sa pri prepnutí zmenila výška rámu (104 → 217), poskočila CELÁ obrazovka
   (merané 25. 9. na 1477×724: aj bublina hore o 73 px) a doska pretiekla o 5.
   Výšku určuje zvislý dizajn; vodorovný stojí v jej strede. */
.rv-glyph { width: 100%; display: grid; place-items: center; }
/* Väčší rám len na ODHALENÍ; na nízkom okne ustúpi, rezerva od okraja nie. */
.rv-orn { --rv-glyph-w: min(460px, 100%); position: relative; width: 100%; padding: 24px 28px; color: #9A7430; }
@media (max-height: 820px) { .rv-orn { --rv-glyph-w: min(400px, 100%); padding: 20px 24px; } }
@media (max-height: 700px) { .rv-orn { --rv-glyph-w: min(330px, 100%); padding: 16px 20px; } }
@media (max-width: 559px) { .rv-orn { padding: 18px 14px; } }
.rv-orn-line { position: absolute; inset: 6px; border: 1px solid rgba(120, 86, 26, 0.38); border-radius: ${n.tile}px;
  box-shadow: inset 0 0 0 3px rgba(255, 252, 240, 0.35), inset 0 0 0 4px rgba(120, 86, 26, 0.22); pointer-events: none; }
.rv-corner { position: absolute; width: 28px; height: 28px; }
.rv-corner.tl { top: 0; left: 0; }
.rv-corner.tr { top: 0; right: 0; transform: scaleX(-1); }
.rv-corner.bl { bottom: 0; left: 0; transform: scaleY(-1); }
.rv-corner.br { bottom: 0; right: 0; transform: scale(-1, -1); }
.rv-diamond { position: absolute; left: 50%; width: 20px; height: 10px; translate: -50% 0; }
.rv-diamond.t { top: 1px; } .rv-diamond.b { bottom: 1px; }
/* ZVISLÝ v popupe — veľký, cez celé okno (portál do body, nad všetkým). */
.rv-vmodal { position: fixed; inset: 0; z-index: 80; background: rgba(8, 6, 4, 0.66); display: grid; place-items: center; padding: 16px; }
.rv-vcard { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px;
  border-radius: 16px; background: linear-gradient(180deg, #FBF3DF, #EEDDB4); border: 2px solid #C99A3F;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45); }
.rv-vwrap { width: min(calc(min(76dvh, 720px) * 2480 / 3504), calc(100vw - 64px)); }
.rv-vcard .rv-vsvg { width: 100%; height: auto; color: ${s.inkSoft}; }
.rv-vclose { height: 32px; padding: 0 16px; border-radius: ${n.pill}px; cursor: pointer;
  border: 1.5px solid ${o.edge}; background: transparent; color: ${o.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; }
.rv-glyph-h { width: 100%; display: grid; place-items: center; }
/* ⚠️ ŠÍRKA SA POČÍTA Z VÝŠKY, nie cez \`aspect-ratio\`: \`VerticalHeroglyphFrame\`
   si píše INLINE \`width:100%; height:auto\`, takže výšku SVG určuje šírka
   obalu. S \`aspect-ratio\` obal dostal šírku celej dosky a rám pretiekol cez
   prepínač aj CTA (merané 25. 9.). */
.rv-glyph-v { height: var(--rv-h); width: calc(var(--rv-h) * 2480 / 3504); }
.rv-vsvg { width: 100%; height: 100%; color: ${s.inkSoft}; }

.rv-seg { display: flex; justify-content: center; gap: 8px; }
.rv-seg-b {
  height: 30px; padding: 0 16px; cursor: pointer;
  border-radius: ${n.pill}px; border: 1.5px solid ${s.hairline};
  background: transparent; color: ${s.inkSoft};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
}
.rv-seg-b:hover { border-color: ${o.edge}; }
.rv-seg-b.on { border-color: ${o.edge}; background: ${o.fill}; color: ${o.edge}; }

/* ── ODKAZ NA STENU ─────────────────────────────────────────────────────────
   Jamka ako riadok poradia na MAJITEĽOVI: je to STAV s tlačidlom, nie voľba.
   Prázdny má čiarkovaný lem — miesto, ktoré čaká na vyplnenie. */
.rv-msg {
  width: 100%; min-height: 56px; display: flex; align-items: center; gap: 12px;
  padding: 8px 8px 8px 8px; cursor: pointer; text-align: left;
  border-radius: ${n.tile}px; border: 1.5px dashed ${s.hairline};
  background: linear-gradient(135deg, rgba(255, 253, 247, 0.55), rgba(242, 226, 189, 0.45));
}
.rv-msg.has { border-style: solid; }
/* Povinný odkaz chýba — ten istý červený tón ako \`.hf-alert\`. */
.rv-msg.need { border-color: #B25640; border-style: solid; }
.rv-msg-photo {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: ${n.tile}px;
  object-fit: cover; border: 1.5px solid ${s.hairline};
}
.rv-msg-photo--empty {
  display: grid; place-items: center; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 16px; color: ${s.inkMuted};
}
.rv-msg-tx {
  flex: 1 1 auto; min-width: 0; font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; line-height: 1.3; color: ${s.inkSoft};
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.rv-msg-tx i { font-style: italic; color: ${s.ink}; }
.rv-msg-act {
  flex: 0 0 auto; height: 26px; padding: 0 10px; display: inline-flex; align-items: center;
  border-radius: ${n.pill}px; border: 1.5px solid ${o.edge}; color: ${o.edge};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  transition: background 150ms ease, color 150ms ease;
}
.rv-msg:hover .rv-msg-act { background: ${o.edge}; color: #FDF7E7; }

/* ── NÁHĽAD STENY V POPUPE ──────────────────────────────────────────────────
   Pomer strán = video (480×336), takže karta v strede sa nikdy neoreže — na
   telefóne 343×240, na PC ~490×340 (Matej chcel priezor väčší). */
.rv-prev {
  position: relative; width: 100%; aspect-ratio: 480 / 336; overflow: hidden;
  border-radius: ${n.tile}px; border: 1.5px solid ${s.hairline}; background: #F3E4C4;
}
.rv-prev video { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Šípka stojí nad nápisom a mieri hore na spodnú hranu karty. Pod kartou je
   27,8 % výšky priezoru (karta 174 z 392 px výrezu) — na telefóne 67 px,
   z toho 34 berie nápis. Preto 24 px a kmitanie len o 3. */
.rv-prev-arrow {
  position: absolute; left: 50%; bottom: 38px; width: 18px; height: 24px; margin-left: -9px;
  color: ${o.edge}; filter: drop-shadow(0 0 2px #FFFDF7) drop-shadow(0 0 4px #FFFDF7);
  opacity: 0; transform: translateY(8px); transition: opacity 250ms ease, transform 250ms ease;
}
.rv-prev-tag {
  position: absolute; left: 50%; bottom: 8px; translate: -50% 0; white-space: nowrap;
  padding: 6px 12px; border-radius: ${n.pill}px;
  background: ${o.grad}; color: ${o.ink};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  opacity: 0; transform: translateY(6px); transition: opacity 250ms ease, transform 250ms ease;
}
.rv-prev-arrow.on, .rv-prev-tag.on { opacity: 1; transform: none; }
.rv-prev-arrow.on { animation: rv-bob 1.1s ease-in-out infinite; }
@keyframes rv-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .rv-prev-arrow.on { animation: none; } }

@media (max-height: 700px) {
  .rv-stack .hf-plate { padding: 14px 16px; gap: 5px; }
  .rv-stack .hf-cta { height: 36px; }
  .rv-kicker { margin-bottom: 8px; font-size: 12px; }
  .rv-msg { min-height: 48px; }
  .rv-msg-photo { width: 32px; height: 32px; }
}
@media (max-width: 559px) and (min-height: 701px) {
  .rv-stack .hf-plate { padding: 26px 22px; gap: 12px; }
}
`,Pe=`
html[data-flow-full] .hf-pale .rv-col { max-width: 640px; }
html[data-flow-full] .hf-pale .rv-stack .hf-plate { gap: 16px; }
html[data-flow-full] .hf-pale .rv-stack .rv-orn { --rv-glyph-w: 100%; padding: 24px 28px; }
html[data-flow-full] .hf-pale .rv-stack .rv-corner { width: 28px; height: 28px; }
html[data-flow-full] .hf-pale .rv-stack .rv-count { margin: -12px 0 0; }
html[data-flow-full] .hf-pale .rv-stack .rv-ta,
html[data-flow-full] .hf-pale .rv-stack .rv-ta:focus { box-shadow: none; outline: none; }
html[data-flow-full] .hf-pale .rv-stack .hf-cta { text-transform: uppercase; letter-spacing: .04em; }
@media (max-width: 559px) {
  html[data-flow-full] .hf-pale .rv-stack .rv-orn { padding: 18px 14px; }
}
@media (max-height: 800px) and (min-width: 560px) {
  html[data-flow-full] .hf-pale .rv-stack .rv-ta { height: 80px; }
  html[data-flow-full] .hf-pale .rv-stack .rv-orn { padding: 20px 28px; }
}
`;export{jr as FlowRevealScreen};
