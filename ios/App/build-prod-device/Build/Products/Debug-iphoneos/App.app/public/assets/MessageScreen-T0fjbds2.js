import{r as l,c as E,j as e,L as w,b as G,i as H,u as P,k}from"./index-7PctGTam.js";import{B as D}from"./button-CpwsqWLM.js";import{P as I}from"./PageTopBar-DlESgG9R.js";import{u as O}from"./useFlowKeyboardFix-CZeLS9pg.js";import{u as R}from"./useFlowGuard-D1W2gspa.js";import{h as B}from"./hekthor-GYpD1FGC.js";import{H as S}from"./flowPaleSkin-DMjCjOr3.js";import{m as T}from"./proxy-B4ZTxIpr.js";import"./utils-BvqHaJDB.js";import"./index-D1GlWhro.js";import"./handArrowLeft-BUyUUYuC.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock--CJIKtfn.js";import"./createLucideIcon-Di02PK5p.js";import"./LanguagePicker--v1cJQg6.js";import"./flagUrl-B21iQI9I.js";import"./flowMode-B6eboter.js";import"./labTheme-p7t_6k9Y.js";const n=150,ne=n;function $({value:g,placeholder:s,doneLabel:u,isOverLimit:x,charCount:h,maxChars:i,onChange:b,onDone:a,onClose:f,preview:y,doneTone:c="gold"}){const r=l.useCallback(t=>{t&&t.focus()},[]);return E.createPortal(e.jsxs("div",{className:"msg-modal-root",role:"dialog","aria-modal":"true",children:[e.jsx("div",{className:"msg-modal-backdrop",onClick:f}),e.jsxs("div",{className:"msg-modal-card",children:[y,e.jsxs("div",{className:"relative mt-1",children:[e.jsx("textarea",{ref:r,value:g,onChange:t=>b(t.target.value),placeholder:s,maxLength:n+50,rows:5,className:"msg-modal-textarea",style:{borderColor:x?"hsl(0 70% 55%)":g.length>0?"hsl(var(--gold))":"hsl(var(--border) / 0.3)"}}),e.jsxs("span",{className:"absolute bottom-3 right-3 text-xs font-medium",style:{fontFamily:"'Space Grotesk', sans-serif",color:x?"hsl(0 70% 55%)":"hsl(var(--gold))"},children:[h," / ",i]})]}),e.jsx("button",{type:"button",className:c==="lapis"?"msg-modal-done msg-modal-done--lapis":"msg-modal-done",onClick:a,disabled:x,children:u})]}),e.jsx("style",{children:`
        .msg-modal-root {
          position: fixed;
          inset: 0;
          z-index: 2100;
          display: flex;
          flex-direction: column;
          align-items: center;
          /* Align card toward the top so the iOS keyboard (which pushes up from the
             bottom) doesn't overlap it. padding-top = safe-area + small gap. */
          padding-top: max(env(safe-area-inset-top, 0px) + 48px, 60px);
          padding-left: 16px;
          padding-right: 16px;
        }
        .msg-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.78);
          -webkit-backdrop-filter: blur(3px);
          backdrop-filter: blur(3px);
          animation: msgScrimIn 160ms ease-out;
        }
        .msg-modal-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid rgba(201, 154, 63, 0.55);
          border-radius: 16px;
          padding: 20px 16px 16px;
          box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
          animation: msgCardIn 220ms cubic-bezier(0.2, 0.8, 0.3, 1.1);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .msg-modal-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          padding: 12px 14px 28px 14px; /* bottom space for counter */
          color: #1a1208;
          line-height: 1.6;
          outline: none;
          border-width: 2px;
          border-style: solid;
          resize: none;
          transition: border-color 150ms ease;
          /* 16px prevents iOS auto-zoom */
          font-size: 16px;
          font-family: 'Space Grotesk', sans-serif;
          min-height: 130px;
        }
        .msg-modal-done {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
          /* Parita s dvojčaťom NameScreen .name-modal-done — canonical gold, not orange. */
          background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35);
          transition: opacity 150ms ease, transform 150ms ease;
        }
        .msg-modal-done:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }
        .msg-modal-done:not(:disabled):active { transform: scale(0.97); }
        /* Lapis = hlavné CTA nového vstupu — rozmery 1:1 s \`.hf-cta\` (HF.cta), aby
           popup nemal iné tlačidlo než obrazovka pod ním (Matej 28. 9. 2026). */
        .msg-modal-done--lapis {
          height: ${S.cta.h}px;
          border-radius: ${S.cta.radius}px;
          font-size: ${S.cta.size}px;
          letter-spacing: .08em;
          color: ${w.ink};
          background: ${w.grad};
          box-shadow: ${G};
        }
        .msg-modal-done--lapis:not(:disabled):hover { background: ${w.gradHover}; }
        .msg-modal-done--lapis:disabled { opacity: .4; cursor: default; }
        @keyframes msgScrimIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes msgCardIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
      `})]}),document.body)}function ie(){O();const g=H(),s=P(),u=R(),h=k(o=>o.dogName)||s("heroglyph.flow.yourDogFallback"),i=k(o=>o.setSelection),b=k(o=>o.selections.dogMessage)||"",[a,f]=l.useState(b),[y,c]=l.useState(!1),r=a.length,t=r>n,m=r>0&&!t,[C]=l.useState(()=>window.matchMedia("(hover: none) and (pointer: coarse)").matches),j=l.useRef(null),p=l.useRef(null);l.useEffect(()=>()=>{var o;(o=p.current)==null||o.close().catch(()=>{}),p.current=null},[]);const M=()=>{var o;(o=j.current)==null||o.focus(),c(!0)},F=()=>{c(!1),i("dogMessage",a.trim())},z=()=>{c(!1),i("dogMessage",a.trim())},A=()=>{if(m){i("dogMessage",a.trim()),navigator.vibrate&&navigator.vibrate(15);try{const o=new AudioContext;p.current=o;const d=o.createOscillator(),N=o.createGain();d.type="sine",d.frequency.value=1800,N.gain.value=.08,d.connect(N).connect(o.destination),d.start(),d.stop(o.currentTime+.04),d.onended=()=>{o.close().catch(()=>{}),p.current===o&&(p.current=null)}}catch{}g("/checkout")}},v=s("heroglyph.flow.message.placeholder",{dogName:h});return u?e.jsxs("div",{className:"dark-bg flex flex-col h-[100dvh] overflow-hidden",children:[e.jsx("input",{ref:j,type:"text","aria-hidden":"true",readOnly:!0,style:{position:"fixed",top:0,left:0,width:1,height:1,opacity:0,pointerEvents:"none"}}),e.jsx(I,{}),e.jsx("div",{className:"flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3",children:e.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0",children:[e.jsx("div",{className:"w-full rounded-2xl relative overflow-hidden flex-shrink",style:{background:"var(--brand-gradient)"},children:e.jsxs("div",{className:"px-4 py-5 md:p-6 flex flex-col items-center gap-3 md:gap-4",children:[e.jsx("img",{src:B,alt:"HEKTHOR",className:"w-36 h-36 md:w-44 md:h-44 object-contain"}),e.jsxs("p",{className:"text-white text-center text-base md:text-xl leading-snug drop-shadow-sm",style:{fontFamily:"'Cinzel', serif"},children:[s("heroglyph.flow.message.promptPrefix"),e.jsx("span",{className:"font-bold text-amber-300",children:h}),s("heroglyph.flow.message.promptMid"),e.jsx("br",{}),s("heroglyph.flow.message.promptStayPrefix"),e.jsx("span",{className:"font-bold",children:s("heroglyph.flow.message.promptStayWord")}),s("heroglyph.flow.message.promptStaySuffix")]})]})}),e.jsx(T.div,{className:"w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0",initial:{opacity:0,x:40},animate:{opacity:1,x:0},transition:{duration:.35,delay:.1},children:e.jsxs("div",{className:"flex flex-col gap-2 md:gap-3",children:[e.jsx("p",{className:"text-xs uppercase tracking-widest text-muted-foreground text-center",style:{fontFamily:"'Space Grotesk', sans-serif"},children:s("heroglyph.flow.message.yourMessage")}),C?e.jsxs("button",{type:"button",onClick:M,className:"w-full text-left rounded-xl px-4 py-3 leading-relaxed border-2 transition-colors relative",style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"16px",minHeight:"88px",borderColor:a.length>0?"hsl(var(--gold))":"hsl(var(--border) / 0.3)",background:"hsl(var(--card))",color:a.length>0?"hsl(var(--foreground))":"hsl(var(--muted-foreground) / 0.5)",cursor:"text",wordBreak:"break-word",whiteSpace:"pre-wrap"},children:[a.length>0?a:v,a.length>0&&e.jsxs("span",{className:"absolute bottom-2 right-3 text-xs font-medium",style:{fontFamily:"'Space Grotesk', sans-serif",color:t?"hsl(0 70% 55%)":"hsl(var(--gold))"},children:[r," / ",n]})]}):e.jsxs("div",{className:"relative",children:[e.jsx("textarea",{value:a,onChange:o=>f(o.target.value),onBlur:()=>i("dogMessage",a.trim()),placeholder:v,maxLength:n+50,rows:3,className:"w-full text-left rounded-xl leading-relaxed border-2 transition-colors resize-none outline-none",style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"16px",minHeight:"88px",padding:"12px 16px 28px 16px",borderColor:t?"hsl(0 70% 55%)":a.length>0?"hsl(var(--gold))":"hsl(var(--border) / 0.3)",background:"hsl(var(--card))",color:"hsl(var(--foreground))"}}),a.length>0&&e.jsxs("span",{className:"absolute bottom-2 right-3 text-xs font-medium pointer-events-none",style:{fontFamily:"'Space Grotesk', sans-serif",color:t?"hsl(0 70% 55%)":"hsl(var(--gold))"},children:[r," / ",n]})]}),e.jsxs("p",{className:"text-[10px] md:text-xs text-muted-foreground text-center leading-relaxed",style:{fontFamily:"'Space Grotesk', sans-serif"},children:[s("heroglyph.flow.message.profileNotePrefix"),e.jsx("span",{className:"font-semibold text-foreground/70",children:s("heroglyph.flow.message.profileNoteSite")}),s("heroglyph.flow.message.profileNoteSuffix")]}),e.jsx(D,{onClick:A,disabled:!m,className:"w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100",style:{fontFamily:"'Cinzel', serif",background:m?"linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))":void 0,color:m?"#000":void 0,boxShadow:m?"0 0 40px hsl(var(--gold) / 0.5), 0 4px 20px rgba(0,0,0,0.3)":void 0},children:s("heroglyph.flow.message.cta")})]})})]})}),y&&e.jsx($,{value:a,placeholder:v,doneLabel:s("heroglyph.flow.message.done"),isOverLimit:t,charCount:r,maxChars:n,onChange:f,onDone:z,onClose:F})]}):null}export{ne as MESSAGE_MAX_CHARS,$ as MessageModal,ie as MessageScreen};
