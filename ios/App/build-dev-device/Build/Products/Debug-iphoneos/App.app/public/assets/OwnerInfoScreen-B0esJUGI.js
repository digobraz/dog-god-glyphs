import{f as F,u as I,g as x,r as l,j as e,c as E}from"./index-B-BQrD2y.js";import{B as L}from"./button-78GlOHTF.js";import{P as O}from"./PageTopBar-CT5LPjhX.js";import{i as A}from"./initialLetter-CIe-_dtl.js";import{h as D}from"./hekthor-GYpD1FGC.js";import G from"./OWNER_GENDER-MAN-B9duPXmd.js";import R from"./OWNER_GENDER-WOMAN-z3EQ9N_g.js";import{u as M}from"./useFlowKeyboardFix-Dv484unk.js";import{u as B}from"./useFlowGuard-CdrGNQs4.js";import{u as T}from"./useBlockAutocorrect-BlL6kUy_.js";import H from"./NAME_-A-CxCBvfll.js";import K from"./NAME_-B-DWBBi8k1.js";import P from"./NAME_-C-BzOSvku6.js";import $ from"./NAME_-D-PVbH8kR0.js";import U from"./NAME_-E-BelzD26R.js";import V from"./NAME_-F-BOKzGx8e.js";import W from"./NAME_-G-CWRIGcR1.js";import Y from"./NAME_-H-Ca6CDV1_.js";import J from"./NAME_-I-DeuCMfiF.js";import Q from"./NAME_-J-rFyWiX9b.js";import X from"./NAME_-K-BPXs4vaM.js";import Z from"./NAME_-L-DlsvF78H.js";import _ from"./NAME_-M-D67o1OWP.js";import q from"./NAME_-N-ChbzOf7p.js";import ee from"./NAME_-O-31CuF2mF.js";import re from"./NAME_-P-CqKuakQj.js";import oe from"./NAME-Q-DE-SnzNJ.js";import te from"./NAME_-R-B1xiJjUT.js";import ne from"./NAME-S-BlJoS2lw.js";import ae from"./NAME-T-CjbJs43h.js";import ie from"./NAME-U-CKD4QISs.js";import le from"./NAME-V-CB3zjSTX.js";import se from"./NAME-W-DgkLP-j9.js";import me from"./NAME-X-Bs7a9JdW.js";import de from"./NAME-Y-CuVYsfBq.js";import pe from"./NAME-Z-CLALdEIT.js";import{m as N}from"./proxy-wes7Zgjy.js";import{A as ce}from"./useBodyScrollLock-Bv8v-6Ri.js";import"./utils-CQQYtog-.js";import"./index-BTsao7Aa.js";import"./handArrowLeft-DN9pj_cL.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./LanguagePicker-CQj7MbWL.js";import"./flagUrl-B21iQI9I.js";import"./flowMode-B6eboter.js";import"./createLucideIcon-B_Tc6GtW.js";const fe=typeof navigator<"u"&&/Android/i.test(navigator.userAgent),xe={A:H,B:K,C:P,D:$,E:U,F:V,G:W,H:Y,I:J,J:Q,K:X,L:Z,M:_,N:q,O:ee,P:re,Q:oe,R:te,S:ne,T:ae,U:ie,V:le,W:se,X:me,Y:de,Z:pe};function ge({open:c,value:o,placeholder:g,title:h,doneLabel:u,closeLabel:b,rootRef:w,inputRef:s,onChange:y,onDone:a,onClose:m}){T(s);const[f,d]=l.useState({top:0,height:0});l.useEffect(()=>{const r=window.visualViewport,i=()=>{d(r?{top:r.offsetTop,height:r.height}:{top:0,height:window.innerHeight})};return i(),r==null||r.addEventListener("resize",i),r==null||r.addEventListener("scroll",i),()=>{r==null||r.removeEventListener("resize",i),r==null||r.removeEventListener("scroll",i)}},[]);const p=o.trim().length>=1;return E.createPortal(e.jsxs("div",{ref:w,className:`name-modal-root ${c?"is-open":""}`,role:"dialog","aria-modal":"true",style:{top:f.top,height:f.height||void 0},children:[e.jsx("div",{className:"name-modal-backdrop",onClick:m}),e.jsxs("div",{className:"name-modal-card",children:[e.jsx("button",{type:"button",className:"name-modal-close","aria-label":b,onClick:m,children:"✕"}),e.jsx("p",{className:"name-modal-title",children:h}),e.jsx("div",{className:"name-modal-inputwrap",children:e.jsx("input",{ref:s,value:o,onChange:r=>y(r.target.value.toUpperCase().slice(0,30)),onKeyDown:r=>{r.key==="Enter"&&p&&a()},placeholder:g,maxLength:30,enterKeyHint:"done",name:"ownerName",autoComplete:"given-name",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1,"data-1p-ignore":!0,"data-lpignore":"true",className:"name-modal-input"})}),fe&&o.trim().length>0&&e.jsxs("p",{className:"name-modal-confirm","aria-live":"polite",children:["→ ",e.jsx("b",{children:o.trim()})]}),e.jsx("button",{type:"button",className:"name-modal-done",onClick:a,disabled:!p,children:u})]}),e.jsx("style",{children:`
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
      `})]}),document.body)}function mr(){M();const c=F(),o=I(),g=B(),h=x(t=>t.setOwnerName),u=x(t=>t.setSelection),b=x(t=>t.ownerName),w=x(t=>t.selections.ownerGender),[s,y]=l.useState(b||""),[a,m]=l.useState(w||null),[f,d]=l.useState(!1),p=l.useRef(null),r=l.useRef(null),i=()=>{var t,z;(t=p.current)==null||t.classList.add("is-open"),(z=r.current)==null||z.focus(),d(!0)},j=()=>{var t;(t=r.current)==null||t.blur(),d(!1)},n=s.trim(),v=A(n)??"",k=xe[v]||null,C=n.length>=1&&!!a,S=()=>{C&&(h(n.toUpperCase()),u("ownerGender",a),c("/heroglyph/owner-zodiac"))};return g?e.jsxs("div",{className:"dark-bg flex flex-col h-[100dvh] overflow-hidden",children:[e.jsx(O,{}),e.jsx("div",{className:"flex-1 flex flex-col items-center justify-center px-4 min-h-0 pb-3",children:e.jsxs("div",{className:"w-full max-w-xl flex flex-col items-center gap-3 md:gap-4 min-h-0",children:[e.jsxs(N.div,{className:"w-full rounded-2xl px-4 py-3 md:p-5 flex flex-col items-center gap-2 md:gap-3 flex-shrink-0",style:{background:"var(--brand-gradient)"},initial:{opacity:0,x:40},animate:{opacity:1,x:0},transition:{duration:.35},children:[e.jsx("img",{src:D,alt:"HEKTHOR",className:"w-36 h-36 md:w-56 md:h-56 object-contain"}),e.jsxs("p",{className:"text-white text-center text-base md:text-2xl leading-snug drop-shadow-sm",style:{fontFamily:"'Cinzel', serif"},children:[o("heroglyph.flow.ownerInfo.greetingPrefix")," ",e.jsx("span",{className:"font-bold text-amber-300",children:o("heroglyph.flow.ownerInfo.greetingWord")}),"!"]})]}),e.jsx(N.div,{className:"w-full rounded-2xl border-2 border-border/40 papyrus-bg p-3 md:p-4 flex-shrink-0",initial:{opacity:0,x:40},animate:{opacity:1,x:0},transition:{duration:.35,delay:.1},children:e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsxs("div",{className:`owner-name-preview-wrap${n.length>0?" is-filled":""} flex-1 min-w-0`,children:[e.jsx("button",{type:"button",onClick:i,className:"owner-name-preview-btn w-full rounded-xl px-3 py-2 border-2 transition-colors",style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"16px",textAlign:"left",textTransform:n.length>0?"uppercase":"none",letterSpacing:n.length>0?"0.05em":"normal",background:n.length>0?"hsl(224 60% 45% / 0.10)":"hsl(var(--card))",borderColor:n.length>0?"hsl(224 60% 45%)":"rgba(47, 107, 255, 0.30)",color:n.length>0?"hsl(var(--foreground))":"hsl(var(--muted-foreground) / 0.5)",cursor:"text"},children:n.length>0?n:o("heroglyph.flow.ownerInfo.placeholder")}),e.jsx("style",{children:`
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
                  `})]}),e.jsx("div",{className:`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center flex-shrink-0 overflow-hidden ${k?"is-selected-purple":"border-border/60 bg-card/50"}`,children:k?e.jsx(N.img,{src:k,alt:v,className:"h-9 md:h-14 object-contain",initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},transition:{duration:.2}},v):e.jsx("span",{className:"text-muted-foreground/30 text-2xl font-bold",style:{fontFamily:"'Cinzel', serif"},children:"?"})})]}),e.jsxs("div",{className:"flex gap-3 w-full",children:[e.jsxs("button",{onClick:()=>m("man"),className:`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${a==="man"?"is-selected-purple":"border-border/60 hover:border-primary/50"}`,style:{fontFamily:"'Cinzel', serif"},children:[e.jsx("img",{src:G,alt:o("heroglyph.flow.ownerInfo.man"),className:"h-14 md:h-20 object-contain"}),e.jsx("span",{className:"text-xs md:text-sm font-bold tracking-wider uppercase",children:o("heroglyph.flow.ownerInfo.man")})]}),e.jsxs("button",{onClick:()=>m("woman"),className:`flex-1 flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl border-2 transition-all ${a==="woman"?"is-selected-purple":"border-border/60 hover:border-primary/50"}`,style:{fontFamily:"'Cinzel', serif"},children:[e.jsx("img",{src:R,alt:o("heroglyph.flow.ownerInfo.woman"),className:"h-14 md:h-20 object-contain"}),e.jsx("span",{className:"text-xs md:text-sm font-bold tracking-wider uppercase",children:o("heroglyph.flow.ownerInfo.woman")})]})]}),e.jsx(L,{onClick:S,disabled:!C,className:"w-full rounded-xl gap-2 h-10 md:h-11 font-bold tracking-wider hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100",style:{fontFamily:"'Cinzel', serif",background:"linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)))",color:"#000",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35)"},children:o("heroglyph.flow.ownerInfo.continue")})]})}),e.jsxs("button",{onClick:()=>c("/heroglyph/ranking"),className:"flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",style:{fontFamily:"'Cinzel', serif"},children:[e.jsx(ce,{className:"h-4 w-4"})," ",o("heroglyph.flow.ownerInfo.back")]})]})}),e.jsx(ge,{open:f,value:s,placeholder:o("heroglyph.flow.ownerInfo.placeholder"),title:o("heroglyph.flow.ownerInfo.greetingWord"),doneLabel:o("heroglyph.flow.message.done"),closeLabel:o("nav.aria.close"),rootRef:p,inputRef:r,onChange:y,onDone:j,onClose:j})]}):null}export{mr as OwnerInfoScreen};
