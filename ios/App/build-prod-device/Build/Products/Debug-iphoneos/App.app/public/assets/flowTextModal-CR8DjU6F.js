import{r as m,c as y,j as a,L as r,b as w}from"./index-7PctGTam.js";import{u as z}from"./useBlockAutocorrect-DddJT7By.js";import{H as n}from"./flowPaleSkin-DMjCjOr3.js";const j=typeof navigator<"u"&&/Android/i.test(navigator.userAgent);function N({open:c,value:t,placeholder:x,title:f,doneLabel:u,closeLabel:g,rootRef:h,inputRef:i,onChange:b,onDone:s,onClose:k,fieldName:v="dogName"}){z(i);const[d,l]=m.useState({top:0,height:0});m.useEffect(()=>{const e=window.visualViewport,o=()=>{l(e?{top:e.offsetTop,height:e.height}:{top:0,height:window.innerHeight})};return o(),e==null||e.addEventListener("resize",o),e==null||e.addEventListener("scroll",o),()=>{e==null||e.removeEventListener("resize",o),e==null||e.removeEventListener("scroll",o)}},[]);const p=t.trim().length>=1;return y.createPortal(a.jsxs("div",{ref:h,className:`name-modal-root ${c?"is-open":""}`,role:"dialog","aria-modal":"true",style:{top:d.top,height:d.height||void 0},children:[a.jsx("div",{className:"name-modal-backdrop",role:"button","aria-label":g,onClick:k}),a.jsxs("div",{className:"name-modal-card",children:[a.jsx("p",{className:"name-modal-title",children:f}),a.jsx("div",{className:"name-modal-inputwrap",children:a.jsx("input",{ref:i,value:t,onChange:e=>b(e.target.value.toUpperCase().slice(0,30)),onKeyDown:e=>{e.key==="Enter"&&p&&s()},placeholder:x,maxLength:30,enterKeyHint:"done",name:v,autoComplete:"off",autoCorrect:"off",autoCapitalize:"characters",spellCheck:!1,"data-1p-ignore":!0,"data-lpignore":"true",className:"name-modal-input"})}),j&&t.trim().length>0&&a.jsxs("p",{className:"name-modal-confirm","aria-live":"polite",children:["→ ",a.jsx("b",{children:t.trim()})]}),a.jsx("button",{type:"button",className:"name-modal-done",onClick:s,disabled:!p,children:u})]}),a.jsx("style",{children:`
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
          width: 100%; height: ${n.cta.h}px; border: none; border-radius: ${n.cta.radius}px; cursor: pointer;
          font-family: 'Cinzel', serif; font-weight: 700; font-size: ${n.cta.size}px;
          letter-spacing: .08em; text-transform: uppercase; color: ${r.ink};
          background: ${r.grad}; box-shadow: ${w};
          transition: background .18s, transform .18s, opacity .18s;
        }
        .name-modal-done:hover:not(:disabled) { background: ${r.gradHover}; }
        .name-modal-done:disabled { opacity: .4; cursor: default; box-shadow: none; }
        .name-modal-done:not(:disabled):active { transform: scale(0.97); }
      `})]}),document.body)}export{N as F};
