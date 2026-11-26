import{u as Q,j as e,r as a,c as J,L as S,d as We,g as Ye,k as j,m as V,B as ye,b as we}from"./index-DriUOdZL.js";import"./button-DG9ZdJZB.js";import{P as Ge}from"./PageTopBar-3J3L1b0M.js";import{D as ve}from"./DateDropdowns-C4ZmMMb9.js";import{H as g,F as Ve,a as Ke,b as qe}from"./flowPaleSkin-CJNdyjt-.js";import{m as h}from"./proxy-5uIz4xGy.js";import{u as Ue}from"./useFlowKeyboardFix-fjrOiUUO.js";import{u as ke}from"./useBlockAutocorrect-3i5EWKtT.js";import"./countryGeo-BNEVCU3g.js";import{h as Qe}from"./hekthorFaces-myd4lVXL.js";import{R,L as K,F as Je,a as q}from"./flowIntro-D58zEUeg.js";import{F as Xe,a as Ze}from"./flowMedallion-C1OBUhVP.js";import"./flowFullSkin-B8mfOKvS.js";import{F as et,a as tt}from"./flowPanel-BxF4HS-3.js";import{L as F}from"./labTheme-DLctEqJ2.js";import{F as nt,T as at}from"./flowTopicChips-Cvg2sMVx.js";import{A as be}from"./index-BPi12Ps7.js";import"./utils-DjMOivUe.js";import"./index-Bq6or85s.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./keyboardInset-BtDUCG-L.js";const ot="/icons/sys/zivuca-legenda.webp",rt="/icons/sys/psi-anjel.webp",it=1990;function st({value:d,onChange:n,onWantDate:x,deathDate:y,hideLegend:p}){const i=Q();return e.jsxs("div",{className:"w-full flex flex-col gap-2",children:[!p&&e.jsx("p",{className:"hf-legend",style:{justifyContent:"center"},children:i("intro.question")}),e.jsxs("div",{className:"grid grid-cols-2 gap-2.5",children:[e.jsxs("button",{type:"button",onClick:()=>n("alive"),"aria-pressed":d==="alive",className:`hf-pick is-pale${d==="alive"?" on":""}`,children:[e.jsx("span",{className:"well",children:e.jsx("img",{src:ot,alt:""})}),e.jsx("span",{className:"tx",children:i("heroglyph.flow.dogs.statusAlive")})]}),e.jsxs("button",{type:"button",onClick:()=>{n("deceased"),x()},"aria-pressed":d==="deceased",className:`hf-pick is-pale${d==="deceased"?" on":""}`,children:[e.jsx("span",{className:"well",children:e.jsx("img",{src:rt,alt:""})}),e.jsx("span",{className:"tx",children:i("heroglyph.flow.dogs.statusAngel")})]})]}),d==="deceased"&&y&&e.jsx("button",{type:"button",onClick:x,className:"text-center text-[11px] tracking-wide underline underline-offset-2",style:{fontFamily:"'Space Grotesk', sans-serif",color:"rgba(14,14,14,0.6)"},children:i("intro.deceasedDate.caption",{date:new Date(y).toLocaleDateString()})})]})}function lt({open:d,deathDate:n,onSave:x,onClose:y}){const p=Q(),i=new Date,N=n?new Date(n):i,[f,L]=a.useState(N.getDate()),[w,C]=a.useState(N.getMonth()+1),[D,b]=a.useState(N.getFullYear());return d?e.jsxs("div",{className:"flex items-center justify-center px-4",style:{position:"fixed",inset:0,zIndex:2100},children:[e.jsx(h.div,{style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(3px)",WebkitBackdropFilter:"blur(3px)"},initial:{opacity:0},animate:{opacity:1},transition:{duration:.16},onClick:y}),e.jsxs(h.div,{role:"dialog","aria-modal":"true",onClick:v=>v.stopPropagation(),className:"relative w-full",style:{maxWidth:520,background:"linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%)",border:"1.5px solid rgba(201,154,63,0.55)",borderRadius:16,padding:"22px 16px 16px",boxShadow:"0 20px 64px rgba(0,0,0,0.65)"},initial:{opacity:0,y:18,scale:.98},animate:{opacity:1,y:0,scale:1},transition:{duration:.22,ease:[.2,.8,.3,1.1]},children:[e.jsx("h3",{style:{fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:"1rem",textAlign:"center",color:"hsl(var(--gold-dark))",margin:0,padding:"0 20px 16px"},children:p("intro.deceasedDate.title")}),e.jsx("div",{className:"flex justify-center",style:{marginBottom:18},children:e.jsx(ve,{day:f,month:w,year:D,minYear:it,maxYear:i.getFullYear(),maxDate:i,onChange:(v,z,o)=>{L(v),C(z),b(o)},skin:"pale"})}),e.jsx("button",{type:"button",onClick:()=>x(`${D}-${String(w).padStart(2,"0")}-${String(f).padStart(2,"0")}`),style:{width:"100%",height:g.cta.h,border:"none",borderRadius:g.cta.radius,cursor:"pointer",fontFamily:"'Cinzel', serif",fontWeight:700,fontSize:g.cta.size,letterSpacing:".08em",textTransform:"uppercase",color:S.ink,background:S.grad,boxShadow:J},children:p("pack.dog.memorial.save")})]})]}):null}const dt=typeof navigator<"u"&&/Android/i.test(navigator.userAgent);function ct({open:d,value:n,placeholder:x,title:y,doneLabel:p,closeLabel:i,rootRef:N,inputRef:f,onChange:L,onDone:w,onClose:C,fieldName:D="dogName"}){ke(f);const[b,v]=a.useState({top:0,height:0});a.useEffect(()=>{const o=window.visualViewport,m=()=>{v(o?{top:o.offsetTop,height:o.height}:{top:0,height:window.innerHeight})};return m(),o==null||o.addEventListener("resize",m),o==null||o.addEventListener("scroll",m),()=>{o==null||o.removeEventListener("resize",m),o==null||o.removeEventListener("scroll",m)}},[]);const z=n.trim().length>=1;return We.createPortal(e.jsxs("div",{ref:N,className:`name-modal-root ${d?"is-open":""}`,role:"dialog","aria-modal":"true",style:{top:b.top,height:b.height||void 0},children:[e.jsx("div",{className:"name-modal-backdrop",role:"button","aria-label":i,onClick:C}),e.jsxs("div",{className:"name-modal-card",children:[e.jsx("p",{className:"name-modal-title",children:y}),e.jsx("div",{className:"name-modal-inputwrap",children:e.jsx("input",{ref:f,value:n,onChange:o=>L(o.target.value.toUpperCase().slice(0,30)),onKeyDown:o=>{o.key==="Enter"&&z&&w()},placeholder:x,maxLength:30,enterKeyHint:"done",name:D,autoComplete:"off",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1,"data-1p-ignore":!0,"data-lpignore":"true",className:"name-modal-input"})}),dt&&n.trim().length>0&&e.jsxs("p",{className:"name-modal-confirm","aria-live":"polite",children:["→ ",e.jsx("b",{children:n.trim()})]}),e.jsx("button",{type:"button",className:"name-modal-done",onClick:w,disabled:!z,children:p})]}),e.jsx("style",{children:`
        .name-modal-root {
          position: fixed; left: 0; right: 0; z-index: 2100;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding-left: 16px; padding-right: 16px;
          opacity: 0; pointer-events: none;
          transition: opacity 160ms ease;
        }
        .name-modal-root.is-open { opacity: 1; pointer-events: auto; }
        .name-modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.78);
          -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
        }
        .name-modal-card {
          position: relative; z-index: 1; width: 100%; max-width: 520px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(201, 154, 63, 0.55); border-radius: 16px;
          padding: 22px 16px 16px; box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
          display: flex; flex-direction: column; gap: 14px;
          transition: transform 220ms cubic-bezier(0.2, 0.8, 0.3, 1.1);
          transform: translateY(8px) scale(0.97);
        }
        .name-modal-root.is-open .name-modal-card { transform: translateY(0) scale(1); }
        .name-modal-title {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;
          text-align: center; color: hsl(var(--gold-dark)); margin: 0; padding: 0;
        }
        /* Statický modrý podsvietený rám — popup (a neskôr polia vstupu). Bez pohybu. */
        .name-modal-inputwrap { position: relative; border-radius: 12px; }
        .name-modal-input {
          position: relative; z-index: 1;
          width: 100%; background: #FFFDF7; border-radius: 12px;
          padding: 14px 16px; color: #1a1208; outline: none;
          border: 2px solid rgba(47, 107, 255, 0.45);
          box-shadow: 0 0 12px rgba(47, 107, 255, 0.28);
          /* 16 px zabráni automatickému priblíženiu na iOS */
          font-size: 16px; font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase; text-align: center; letter-spacing: 0.05em;
        }
        .name-modal-input::placeholder { text-transform: none; letter-spacing: normal; color: rgba(0, 0, 0, 0.35); }
        /* Výpis presnej hodnoty len na Androide (poistka proti predikcii). */
        .name-modal-confirm {
          margin: -4px 0 0; text-align: center;
          font-family: 'Space Grotesk', sans-serif; font-size: 13px;
          color: rgba(26, 18, 8, 0.6); letter-spacing: 0.03em;
        }
        .name-modal-confirm b {
          color: hsl(var(--gold-dark)); font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        /* CTA = HLAVNÉ CTA VSTUPU (\`.hf-cta\`): lapis, rohy 8, výška a písmo z \`HF.cta\`.
           28. 9. 2026 Matej: *„pri popupoch je staré CTA — zmeň to všade"*. Dovtedy
           tu stálo zlaté tlačidlo s rohmi 12 z čias tmavého vstupu. */
        .name-modal-done {
          width: 100%; height: ${g.cta.h}px; border: none; border-radius: ${g.cta.radius}px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700; font-size: ${g.cta.size}px;
          letter-spacing: .08em; text-transform: uppercase; color: ${S.ink};
          background: ${S.grad}; box-shadow: ${J};
          transition: background .18s, transform .18s, opacity .18s;
        }
        .name-modal-done:hover:not(:disabled) { background: ${S.gradHover}; }
        .name-modal-done:disabled { opacity: .4; cursor: default; box-shadow: none; }
        .name-modal-done:not(:disabled):active { transform: scale(0.97); }
      `})]}),document.body)}const U={duration:.52,ease:[.2,.8,.3,1]};function Wt(){Ue();const d=Ye(),n=Q(),x=j(t=>t.setDogName),y=j(t=>t.dogName),p=j(t=>t.setSelection),i=j(t=>t.selections),N=j(t=>t.setLifeStatus),f=j(t=>t.setDeathDate),L=j(t=>t.lifeStatus),w=j(t=>t.deathDate),C=y||"",D=new Date,b=D.getFullYear(),v=b-25,z=b,o={d:parseInt(i.birthdayDay||"0"),m:parseInt(i.birthdayMonth||"0"),y:parseInt(i.birthdayYear||"0")},m=o.d&&o.m&&o.y,[A,X]=a.useState(C),[Z,je]=a.useState(m?o.d:1),[ee,Se]=a.useState(m?o.m:1),[te,Ne]=a.useState(m?o.y:b-5),[ne,Ce]=a.useState(!!m),[mt,ht]=a.useState(i.country||""),[H,De]=a.useState(L!=="deceased"),[Ee,O]=a.useState(!1),[P,ze]=a.useState(!!C),[s,ae]=a.useState(()=>C||typeof window<"u"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches?"form":"hero"),I=a.useRef(s==="hero").current,_=(n("heroglyph.flow.name.greetingPrefix")+" ").length,oe=a.useMemo(()=>{if(s!=="hero")return 0;const t=_+8+n("heroglyph.flow.name.greetingQuestion").length;return Math.min(3200,Math.round((R+t*K+.45)*1e3))},[]);a.useEffect(()=>{if(s!=="hero")return;const t=window.setTimeout(()=>ae("form"),oe),r=()=>ae("form");return window.addEventListener("pointerdown",r),window.addEventListener("keydown",r),()=>{window.clearTimeout(t),window.removeEventListener("pointerdown",r),window.removeEventListener("keydown",r)}},[s,oe]);const Fe=a.useMemo(()=>{if(typeof window>"u")return 240;const t=Math.min(window.innerWidth,640)*.72,r=window.innerHeight*.38;return Math.round(Math.max(148,Math.min(310,Math.min(t,r))))},[]),[ft,Le]=a.useState(()=>typeof window>"u"?900:window.innerHeight);a.useEffect(()=>{const t=()=>Le(window.innerHeight);return window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]);const Te=120,[re,B]=a.useState(!1),ie=a.useMemo(()=>!1,[]),[Ae,se]=a.useState(!1),le=a.useRef(null),W=a.useRef(null),de=a.useRef(null);ke(de);const Me=()=>{var t,r;(t=le.current)==null||t.classList.add("is-open"),(r=W.current)==null||r.focus(),se(!0)},ce=()=>{var t;(t=W.current)==null||t.blur(),se(!1)},l=A.trim(),M=l.length>=1&&l.length<=30,pe=ne,me=M&&pe&&!0&&P,u=["name","born","status"],E=t=>t==="name"?M:t==="born"?pe:P,[Y,he]=a.useState(()=>Math.max(0,u.findIndex(t=>!E(t)))),[$e,Re]=a.useState({}),c=u[Y];a.useEffect(()=>{Re(t=>({...t,[c]:!0}))},[c]);const T=a.useRef(null);a.useEffect(()=>()=>{T.current&&clearTimeout(T.current)},[]);const fe=t=>he(r=>{for(let k=r+1;k<u.length;k++)if(u[k]!==t&&!E(u[k]))return k;const $=u.findIndex(k=>k!==t&&!E(k));return $>=0?$:r}),He=t=>{const r=u[t];return E(r)?"done":t===Y?"todo":$e[r]?"miss":"todo"},G=u.every(E),ue=()=>{G?Ie():E(c)&&fe(c)},Oe={name:n("heroglyph.flow.name.chipName"),born:n("heroglyph.flow.name.chipBorn"),status:n("heroglyph.flow.name.chipStatus")},ge=l.toUpperCase(),Pe={name:n("heroglyph.flow.name.greetingQuestion"),born:M?n("heroglyph.flow.name.birthdayNamed",{name:ge}):n("heroglyph.flow.name.birthday"),status:M?n("heroglyph.flow.name.statusNamed",{name:ge}):n("intro.question")},Ie=()=>{if(me){x(l.toUpperCase()),p("birthdayDay",String(Z).padStart(2,"0")),p("birthdayMonth",String(ee).padStart(2,"0")),p("birthdayYear",String(te));{N(H?"alive":"deceased"),H&&f(null),d("/heroglyph/dogs");return}}},xe="#FFFCF4",_e=e.jsxs("div",{className:`name-preview-wrap${l.length>0?" is-filled":""}`,style:{flex:"7 0 0",minWidth:0},children:[ie?e.jsx("button",{type:"button",onClick:Me,className:"name-preview-btn w-full rounded-xl px-4 py-3 border-2 transition-colors",style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"16px",textAlign:"center",textTransform:l.length>0?"uppercase":"none",letterSpacing:l.length>0?"0.05em":"normal",background:l.length>0?xe:"hsl(var(--card))",borderColor:l.length>0?"hsl(224 60% 45%)":"rgba(47, 107, 255, 0.30)",color:l.length>0?"hsl(var(--foreground))":"hsl(var(--muted-foreground) / 0.5)",cursor:"text"},children:l.length>0?A:n("heroglyph.flow.name.placeholder")}):e.jsx("input",{ref:de,value:A,onChange:t=>X(t.target.value.toUpperCase().slice(0,30)),onKeyDown:t=>{t.key==="Enter"&&ue()},placeholder:n("heroglyph.flow.name.placeholder"),maxLength:30,name:"dog-nickname",id:"dog-nickname",autoComplete:"off",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1,"data-1p-ignore":!0,"data-lpignore":"true",className:"name-preview-btn w-full rounded-xl px-4 py-3 border-2 transition-colors",style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"16px",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.05em",background:l.length>0?xe:"hsl(var(--card))",borderColor:l.length>0?"hsl(224 60% 45%)":"rgba(47, 107, 255, 0.30)",color:"hsl(var(--foreground))",outline:"none"}}),e.jsx("style",{children:`
        @property --name-prev-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        .name-preview-wrap { position: relative; border-radius: 0.75rem; box-shadow: 0 0 10px rgba(47, 107, 255, 0.14); }
        .name-preview-btn { position: relative; z-index: 1; }
        input.name-preview-btn::placeholder { text-transform: none; letter-spacing: normal; color: hsl(var(--muted-foreground) / 0.5); }
        .name-preview-wrap::before {
          content: ''; position: absolute; inset: -2px; border-radius: 14px; z-index: 0;
          pointer-events: none; padding: 2px;
          background: conic-gradient(from var(--name-prev-ang),
            transparent 0deg, transparent 250deg,
            rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
            rgba(47,107,255,0.85) 352deg, transparent 360deg);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          filter: blur(1px);
          animation: namePrevSpin 3.8s linear infinite;
        }
        @keyframes namePrevSpin { to { --name-prev-ang: 360deg; } }
        @media (prefers-reduced-motion: reduce) { .name-preview-wrap::before { animation: none; } }
        /* Filled = no animation, static "selected" highlight (like flow options) */
        .name-preview-wrap.is-filled::before { animation: none; opacity: 0; }
        .name-preview-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
      `})]}),Be=(t,r,$)=>{je(t),Se(r),Ne($),Ce(!0)};return e.jsxs("div",{className:"dark-bg flex flex-col h-[100dvh] overflow-hidden",children:[e.jsxs("style",{children:[Ve,Xe,Ke,et]}),e.jsx(h.div,{className:"hf-topbar","aria-hidden":s!=="form",style:{visibility:s==="form"?"visible":"hidden",pointerEvents:s==="form"?void 0:"none"},initial:I?{opacity:0}:!1,animate:{opacity:s==="form"?1:0},transition:{duration:.3,delay:s==="form"?.18:0},children:e.jsx(Ge,{brandBack:!0,onBack:()=>d("/")})}),e.jsx("style",{children:Je}),e.jsx("div",{className:"hf-stage",children:e.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0",children:[e.jsx(h.div,{layout:!0,transition:U,className:"w-full rounded-2xl relative overflow-hidden flex-shrink-0",style:{background:"var(--brand-gradient)",containerType:"inline-size"},children:e.jsx(e.Fragment,{children:e.jsxs(h.div,{layout:!0,className:"px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4 w-full",initial:{opacity:0},animate:{opacity:1},transition:{duration:.25},children:[e.jsx(h.div,{layout:!0,transition:U,className:I?"hf-medin":void 0,children:e.jsx(Ze,{src:Qe("name"),size:s==="hero"?Fe:Te,className:"hf-medal",ask:s==="form"?{id:"name-who",label:n("heroglyph.flow.name.infoAria"),onClick:()=>B(t=>!t),expanded:re}:void 0})}),e.jsx(h.p,{layout:!0,transition:U,className:"text-white text-center leading-snug drop-shadow-sm",style:{fontFamily:"'Cinzel', serif",fontSize:s==="hero"?"clamp(20px, min(7.4cqw, 4.6dvh), 34px)":"clamp(17px, min(5.8cqw, 3.4dvh), 26px)"},children:I&&s==="hero"?e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"whitespace-nowrap",children:[e.jsx(q,{text:`${n("heroglyph.flow.name.greetingPrefix")} `,from:R}),e.jsx(q,{text:"HEKTHOR.",from:R+_*K,bold:!0})]}),e.jsx("br",{}),e.jsx("span",{className:"whitespace-nowrap",children:e.jsx(q,{text:n("heroglyph.flow.name.greetingQuestion"),from:R+(_+8)*K})})]}):e.jsxs(e.Fragment,{children:[c==="name"&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"whitespace-nowrap",children:[n("heroglyph.flow.name.greetingPrefix")," ",e.jsx("span",{className:"font-bold text-amber-300",children:"HEKTHOR"}),"."]}),e.jsx("br",{})]}),e.jsx(be,{mode:"wait",initial:!1,children:e.jsx(h.span,{className:"inline-block",initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:{duration:.2},children:Pe[c]},c)})]})})]},"front")})}),s==="form"&&e.jsxs(h.div,{className:"hf-carved w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0",style:{position:"relative"},initial:{opacity:0,top:48},animate:{opacity:1,top:0},transition:{duration:.46,ease:[.2,.8,.3,1]},children:[e.jsx("span",{className:"hf-carved-rim","aria-hidden":!0}),e.jsxs("div",{className:"nm-plate",children:[e.jsxs("style",{children:[nt,pt]}),e.jsx(at,{items:u.map((t,r)=>({key:t,label:Oe[t],state:He(r)})),current:Y,onGo:he}),e.jsx("div",{className:"nm-q",children:e.jsx(be,{mode:"wait",initial:!1,children:e.jsxs(h.div,{className:"nm-qin",initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:{duration:.22},children:[c==="name"&&e.jsxs("div",{className:"nm-row",children:[_e,e.jsx("p",{className:"nm-hint",children:n("heroglyph.flow.name.moreDogsHint")})]}),c==="born"&&e.jsx("div",{className:"nm-born",children:e.jsx(ve,{day:Z,month:ee,year:te,empty:!ne,emptyLabels:{day:n("heroglyph.flow.dogs.phDay"),month:n("heroglyph.flow.dogs.phMonth"),year:n("heroglyph.flow.dogs.phYear")},minYear:v,maxYear:z,maxDate:D,skin:"pale",onChange:Be})}),c==="status"&&e.jsx(st,{hideLegend:!0,value:P?H?"alive":"deceased":null,onChange:t=>{De(t==="alive"),ze(!0),t==="alive"&&(f(null),T.current&&clearTimeout(T.current),T.current=setTimeout(()=>fe("status"),420))},onWantDate:()=>O(!0),deathDate:w})]},c)})}),e.jsx("button",{type:"button",className:"nm-cta hf-dock",onClick:ue,disabled:G?!me:!E(c),children:n(G?"heroglyph.flow.name.continue":"heroglyph.flow.owner.next")})]})]})]})}),e.jsxs(tt,{open:re,className:"nm-who",label:n("heroglyph.flow.name.infoAria"),onClose:()=>B(!1),children:[e.jsx("video",{className:"nm-who-v",src:"/videos/WHO_IS_HEKTHOR.mp4",autoPlay:!0,loop:!0,muted:!0,playsInline:!0}),e.jsxs("h2",{className:"nm-who-h",children:[n("heroglyph.flow.name.whoTitle")," ",n("heroglyph.flow.name.whoTitleName")]}),e.jsxs("div",{className:"fp-scroll",children:[e.jsx("p",{className:"nm-who-tx",children:n("heroglyph.flow.name.whoBody")}),e.jsxs("dl",{className:"nm-who-facts",children:[e.jsxs("div",{children:[e.jsx("dt",{children:n("heroglyph.flow.name.born")}),e.jsx("dd",{children:"2016"})]}),e.jsxs("div",{children:[e.jsx("dt",{children:n("heroglyph.flow.name.adopted")}),e.jsx("dd",{children:"2017"})]}),e.jsxs("div",{children:[e.jsx("dt",{children:n("heroglyph.flow.name.location")}),e.jsx("dd",{children:n("heroglyph.flow.name.locationValue")})]})]})]}),e.jsx("button",{type:"button",className:"nm-cta",onClick:()=>B(!1),children:n("heroglyph.flow.more.close")})]}),e.jsx(lt,{open:Ee,deathDate:w,onSave:t=>{f(t),O(!1)},onClose:()=>O(!1)}),ie&&e.jsx(ct,{open:Ae,value:A,placeholder:n("heroglyph.flow.name.placeholder"),title:n("heroglyph.flow.name.greetingQuestion"),doneLabel:n("heroglyph.flow.message.done"),closeLabel:n("nav.aria.close"),rootRef:le,inputRef:W,onChange:X,onDone:ce,onClose:ce})]})}const pt=`
.nm-plate { display: flex; flex-direction: column; gap: 8px; }
.nm-plate .ftc-row { grid-template-columns: repeat(3, 1fr); }
.nm-q { width: 100%; min-height: 64px; display: flex; align-items: center; }
.nm-qin { width: 100%; }
.nm-row { display: flex; align-items: center; gap: 8px; }
.nm-hint { margin: 0; text-align: center; font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.4; color: ${F.inkBody}; }
/* NARODENIE na JEDEN riadok — rolety a vedľa nich ĎALEJ (Matej 26. 9.). */
.nm-born { display: flex; align-items: center; gap: 8px; width: 100%; }
.nm-born > div:first-child { flex: 1; min-width: 0; }
.nm-plate .name-preview-wrap.is-filled { box-shadow: 0 0 0 2px rgba(22,48,122,.6), 0 0 18px rgba(80,130,255,.55); }
.nm-next {
  flex: 0 0 auto; height: 32px; padding: 0 14px; cursor: pointer; align-self: center;
  /* 28. 9. 2026 — OBRYSOVÝ, nie plný (Matej: *„chip hotovo dajme obrysový, nie
     plný — všade vo flow, kde sme taký chip použili; nech nie sú dve fill
     tlačidlá pod sebou"*). Plné je len hlavné CTA pod ním. */
  border-radius: ${V.pill}px; border: 1.5px solid ${ye.edge};
  background: transparent; color: ${ye.ink}; box-shadow: none;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.14em; text-transform: uppercase;
}
.nm-next:disabled { opacity: 0.35; cursor: default; }
/* Hlavné CTA vstupu — 1:1 s \`.hf-cta\` (flowPaleSkin). */
.nm-cta {
  width: 100%; height: ${g.cta.h}px; border: none; border-radius: ${g.cta.radius}px; cursor: pointer;
  background: ${S.grad}; color: ${S.ink}; box-shadow: ${J};
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${g.cta.size}px;
  letter-spacing: .08em; text-transform: uppercase;
  transition: background .18s, transform .18s, opacity .18s;
}
.nm-cta:hover:not(:disabled) { background: ${S.gradHover}; transform: scale(1.02); }
.nm-cta:disabled { opacity: .4; cursor: default; box-shadow: none; }
/* Popup KTO JE HEKTHOR (28. 9. 2026). */
.nm-who .nm-who-v { width: 100%; max-height: 36dvh; aspect-ratio: 4 / 3; object-fit: cover; border-radius: ${V.tile}px; flex: 0 1 auto; min-height: 0; }
.nm-who-h {
  margin: 0; text-align: center; text-wrap: balance;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: ${qe}; line-height: 1.25;
  letter-spacing: 0.02em; color: ${F.goldInk};
}
.nm-who-tx { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${F.inkBody}; }
.nm-who-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0; }
.nm-who-facts div { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: ${V.tile}px; border: 1px solid ${F.hairline}; }
.nm-who-facts dt { font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: ${F.inkMuted}; text-align: center; }
.nm-who-facts dd { margin: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; color: ${F.ink}; text-align: center; }
/* Úzky mobil: tretina karty (79 px) nestačí na „GEADOPTEERD" — dva údaje vedľa seba, miesto pod nimi. */
@media (max-width: 400px) {
  .nm-who-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nm-who-facts div:last-child { grid-column: 1 / -1; }
}
.nm-next.is-done { background: transparent; border-color: ${we.growGreen}; color: ${we.growGreen}; }
`;export{Wt as NameScreen};
