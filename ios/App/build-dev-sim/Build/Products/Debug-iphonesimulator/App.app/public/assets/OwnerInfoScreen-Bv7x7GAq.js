import{g as F,u as I,k as f,r as l,j as e,d as E}from"./index-DriUOdZL.js";import{B as L}from"./button-DG9ZdJZB.js";import{a as O}from"./HandIcons-BI9sYdb3.js";import{P as A}from"./PageTopBar-3J3L1b0M.js";import{i as D}from"./initialLetter-CIe-_dtl.js";import{h as G}from"./hekthor-GYpD1FGC.js";import{l as R,a as M,b as B,c as H,d as T,e as K,f as P,g as $,h as U,i as V,j as W,k as Y,m as J,n as Q,o as X,p as Z,q,r as _,s as ee,t as re,u as te,v as oe,w as ae,x as ne,y as se,z as le,A as ie,B as de}from"./NAME-Z-AkUtK0VT.js";import{u as me}from"./useFlowKeyboardFix-fjrOiUUO.js";import{u as ce}from"./useFlowGuard-BnknS19j.js";import{u as pe}from"./useBlockAutocorrect-3i5EWKtT.js";import{m as j}from"./proxy-5uIz4xGy.js";import"./utils-DjMOivUe.js";import"./index-Bq6or85s.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";import"./keyboardInset-BtDUCG-L.js";import"./flowMode-B6eboter.js";const xe=typeof navigator<"u"&&/Android/i.test(navigator.userAgent),fe={A:le,B:se,C:ne,D:ae,E:oe,F:te,G:re,H:ee,I:_,J:q,K:Z,L:X,M:Q,N:J,O:Y,P:W,Q:V,R:U,S:$,T:P,U:K,V:T,W:H,X:B,Y:M,Z:R};function ge({open:p,value:t,placeholder:g,title:h,doneLabel:u,closeLabel:b,rootRef:w,inputRef:i,onChange:y,onDone:n,onClose:d}){pe(i);const[x,m]=l.useState({top:0,height:0});l.useEffect(()=>{const r=window.visualViewport,s=()=>{m(r?{top:r.offsetTop,height:r.height}:{top:0,height:window.innerHeight})};return s(),r==null||r.addEventListener("resize",s),r==null||r.addEventListener("scroll",s),()=>{r==null||r.removeEventListener("resize",s),r==null||r.removeEventListener("scroll",s)}},[]);const c=t.trim().length>=1;return E.createPortal(e.jsxs("div",{ref:w,className:`name-modal-root ${p?"is-open":""}`,role:"dialog","aria-modal":"true",style:{top:x.top,height:x.height||void 0},children:[e.jsx("div",{className:"name-modal-backdrop",onClick:d}),e.jsxs("div",{className:"name-modal-card",children:[e.jsx("button",{type:"button",className:"name-modal-close","aria-label":b,onClick:d,children:"✕"}),e.jsx("p",{className:"name-modal-title",children:h}),e.jsx("div",{className:"name-modal-inputwrap",children:e.jsx("input",{ref:i,value:t,onChange:r=>y(r.target.value.toUpperCase().slice(0,30)),onKeyDown:r=>{r.key==="Enter"&&c&&n()},placeholder:g,maxLength:30,enterKeyHint:"done",name:"ownerName",autoComplete:"given-name",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1,"data-1p-ignore":!0,"data-lpignore":"true",className:"name-modal-input"})}),xe&&t.trim().length>0&&e.jsxs("p",{className:"name-modal-confirm","aria-live":"polite",children:["→ ",e.jsx("b",{children:t.trim()})]}),e.jsx("button",{type:"button",className:"name-modal-done",onClick:n,disabled:!c,children:u})]}),e.jsx("style",{children:`
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
        .name-modal-close {
          position: absolute; top: 12px; right: 14px;
          background: none; border: none; cursor: pointer; font-size: 14px;
          color: rgba(0, 0, 0, 0.4); line-height: 1; padding: 4px;
          transition: color 150ms ease;
        }
        .name-modal-close:hover { color: rgba(0, 0, 0, 0.75); }
        .name-modal-title {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 1rem;
          text-align: center; color: hsl(var(--gold-dark)); margin: 0; padding: 0 20px;
        }
        .name-modal-inputwrap { position: relative; border-radius: 12px; }
        .name-modal-input {
          position: relative; z-index: 1;
          width: 100%; background: #FFFDF7; border-radius: 12px;
          padding: 14px 16px; color: #1a1208; outline: none;
          border: 2px solid rgba(47, 107, 255, 0.45);
          box-shadow: 0 0 12px rgba(47, 107, 255, 0.28);
          font-size: 16px; font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase; text-align: center; letter-spacing: 0.05em;
        }
        .name-modal-input::placeholder { text-transform: none; letter-spacing: normal; color: rgba(0, 0, 0, 0.35); }
        /* Android-only exact-value readout (predictive-swap safety net). */
        .name-modal-confirm {
          margin: -4px 0 0; text-align: center;
          font-family: 'Space Grotesk', sans-serif; font-size: 13px;
          color: rgba(26, 18, 8, 0.6); letter-spacing: 0.03em;
        }
        .name-modal-confirm b {
          color: hsl(var(--gold-dark)); font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .name-modal-done {
          width: 100%; height: 46px; border: none; border-radius: 12px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.85rem;
          letter-spacing: 0.12em; text-transform: uppercase; color: #000;
          background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .name-modal-done:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
        .name-modal-done:not(:disabled):active { transform: scale(0.97); }
      `})]}),document.body)}function Be(){me();const p=F(),t=I(),g=ce(),h=f(o=>o.setOwnerName),u=f(o=>o.setSelection),b=f(o=>o.ownerName),w=f(o=>o.selections.ownerGender),[i,y]=l.useState(b||""),[n,d]=l.useState(w||null),[x,m]=l.useState(!1),c=l.useRef(null),r=l.useRef(null),s=()=>{var o,z;(o=c.current)==null||o.classList.add("is-open"),(z=r.current)==null||z.focus(),m(!0)},N=()=>{var o;(o=r.current)==null||o.blur(),m(!1)},a=i.trim(),v=D(a)??"",k=fe[v]||null,C=a.length>=1&&!!n,S=()=>{C&&(h(a.toUpperCase()),u("ownerGender",n),p("/heroglyph/owner-zodiac"))};return g?e.jsxs("div",{className:"dark-bg flex flex-col h-[100dvh] overflow-hidden",children:[e.jsx(A,{}),e.jsx("div",{className:"flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3",children:e.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0",children:[e.jsxs(j.div,{className:"w-full rounded-2xl px-4 py-3 md:p-5 flex flex-col items-center gap-2 md:gap-3 flex-shrink-0",style:{background:"var(--brand-gradient)"},initial:{opacity:0,x:40},animate:{opacity:1,x:0},transition:{duration:.35},children:[e.jsx("img",{src:G,alt:"HEKTHOR",className:"w-36 h-36 md:w-56 md:h-56 object-contain"}),e.jsxs("p",{className:"text-white text-center text-base md:text-2xl leading-snug drop-shadow-sm",style:{fontFamily:"'Cinzel', serif"},children:[t("heroglyph.flow.ownerInfo.greetingPrefix")," ",e.jsx("span",{className:"font-bold text-amber-300",children:t("heroglyph.flow.ownerInfo.greetingWord")}),"!"]})]}),e.jsx(j.div,{className:"w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0",initial:{opacity:0,x:40},animate:{opacity:1,x:0},transition:{duration:.35,delay:.1},children:e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsxs("div",{className:`owner-name-preview-wrap${a.length>0?" is-filled":""} flex-1 min-w-0`,children:[e.jsx("button",{type:"button",onClick:s,className:"owner-name-preview-btn w-full rounded-xl px-3 py-2 border-2 transition-colors",style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"16px",textAlign:"left",textTransform:a.length>0?"uppercase":"none",letterSpacing:a.length>0?"0.05em":"normal",background:a.length>0?"hsl(224 60% 45% / 0.10)":"hsl(var(--card))",borderColor:a.length>0?"hsl(224 60% 45%)":"rgba(47, 107, 255, 0.30)",color:a.length>0?"hsl(var(--foreground))":"hsl(var(--muted-foreground) / 0.5)",cursor:"text"},children:a.length>0?a:t("heroglyph.flow.ownerInfo.placeholder")}),e.jsx("style",{children:`
                    @property --owner-name-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
                    .owner-name-preview-wrap { position: relative; border-radius: 0.75rem; box-shadow: 0 0 10px rgba(47, 107, 255, 0.14); }
                    .owner-name-preview-btn { position: relative; z-index: 1; }
                    .owner-name-preview-wrap::before {
                      content: ''; position: absolute; inset: -2px; border-radius: 14px; z-index: 0;
                      pointer-events: none; padding: 2px;
                      background: conic-gradient(from var(--owner-name-ang),
                        transparent 0deg, transparent 250deg,
                        rgba(47,107,255,0.85) 312deg, rgba(156,196,255,0.95) 334deg,
                        rgba(47,107,255,0.85) 352deg, transparent 360deg);
                      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                      -webkit-mask-composite: xor;
                              mask-composite: exclude;
                      filter: blur(1px);
                      animation: ownerNameSpin 3.8s linear infinite;
                    }
                    @keyframes ownerNameSpin { to { --owner-name-ang: 360deg; } }
                    @media (prefers-reduced-motion: reduce) { .owner-name-preview-wrap::before { animation: none; } }
                    .owner-name-preview-wrap.is-filled::before { animation: none; opacity: 0; }
                    .owner-name-preview-wrap.is-filled { box-shadow: 0 0 0 2px hsl(224 60% 45% / 0.45), 0 0 14px hsl(224 60% 45% / 0.22); }
                  `})]}),e.jsx("div",{className:`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center flex-shrink-0 overflow-hidden ${k?"is-selected-purple":"border-border/60 bg-card/50"}`,children:k?e.jsx(j.img,{src:k,alt:v,className:"h-9 md:h-14 object-contain",initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},transition:{duration:.2}},v):e.jsx("span",{className:"text-muted-foreground/30 text-2xl font-bold",style:{fontFamily:"'Cinzel', serif"},children:"?"})})]}),e.jsxs("div",{className:"flex gap-3 w-full",children:[e.jsxs("button",{onClick:()=>d("man"),className:`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${n==="man"?"is-selected-purple":"border-border/60 hover:border-primary/50"}`,style:{fontFamily:"'Cinzel', serif"},children:[e.jsx("img",{src:ie,alt:t("heroglyph.flow.ownerInfo.man"),className:"h-14 md:h-20 object-contain"}),e.jsx("span",{className:"text-xs md:text-sm font-bold tracking-wider uppercase",children:t("heroglyph.flow.ownerInfo.man")})]}),e.jsxs("button",{onClick:()=>d("woman"),className:`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${n==="woman"?"is-selected-purple":"border-border/60 hover:border-primary/50"}`,style:{fontFamily:"'Cinzel', serif"},children:[e.jsx("img",{src:de,alt:t("heroglyph.flow.ownerInfo.woman"),className:"h-14 md:h-20 object-contain"}),e.jsx("span",{className:"text-xs md:text-sm font-bold tracking-wider uppercase",children:t("heroglyph.flow.ownerInfo.woman")})]})]}),e.jsx(L,{onClick:S,disabled:!C,className:"w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100",style:{fontFamily:"'Cinzel', serif",background:"linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))",color:"#000",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)"},children:t("heroglyph.flow.ownerInfo.continue")})]})}),e.jsxs("button",{onClick:()=>p("/heroglyph/ranking"),className:"flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",style:{fontFamily:"'Cinzel', serif"},children:[e.jsx(O,{size:16})," ",t("heroglyph.flow.ownerInfo.back")]})]})}),e.jsx(ge,{open:x,value:i,placeholder:t("heroglyph.flow.ownerInfo.placeholder"),title:t("heroglyph.flow.ownerInfo.greetingWord"),doneLabel:t("heroglyph.flow.message.done"),closeLabel:t("nav.aria.close"),rootRef:c,inputRef:r,onChange:y,onDone:N,onClose:N})]}):null}export{Be as OwnerInfoScreen};
