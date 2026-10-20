import{u as C,a as P,r as a,I as R,j as e,P as t,L as r,b as D}from"./index-7PctGTam.js";import{C as B}from"./chataNahlad-BvQ_JlDS.js";import{H as I}from"./handArrowLeft-BUyUUYuC.js";import{g as j,a as Y,s as N}from"./consent-28X3-hgX.js";const M=["/cert-render","/invoice-render","/share-render"];function _(){const o=C(),{pathname:d}=P(),c=M.some(n=>d.startsWith(n)),[m,i]=a.useState(!1),[l,b]=a.useState(d!=="/"),[h,p]=a.useState(!1),[x,g]=a.useState(!1),u=a.useRef(null),[f,k]=a.useState(!1),[v,y]=a.useState(!1),S=a.useRef(null);if(a.useEffect(()=>{const n=S.current,s=document.documentElement,w=()=>s.style.setProperty("--consent-h","0px");if(c||!m||!l||!n)return w(),w;const E=()=>s.style.setProperty("--consent-h",`${Math.ceil(n.getBoundingClientRect().height)}px`);E();const L=new ResizeObserver(E);return L.observe(n),()=>{L.disconnect(),w()}},[c,m,l,h]),a.useEffect(()=>{if(d!=="/"){b(!0);return}if(l)return;const n=()=>{window.scrollY>8&&b(!0)};return window.addEventListener("scroll",n,{passive:!0}),()=>window.removeEventListener("scroll",n)},[d,l]),a.useEffect(()=>{if(c)return;const n=j();n?(Y(n),i(!1)):i(!0)},[c]),a.useEffect(()=>{const n=()=>{const s=j();k(!!(s!=null&&s.analytics)),y(!!(s!=null&&s.marketing)),p(!0),b(!0),i(!0)};return window.addEventListener("dogypt:open-consent",n),()=>window.removeEventListener("dogypt:open-consent",n)},[]),a.useEffect(()=>{if(!x)return;const n=s=>{u.current&&!u.current.contains(s.target)&&g(!1)};return document.addEventListener("mousedown",n),()=>document.removeEventListener("mousedown",n)},[x]),c||!m||!l||B||R)return null;const z=()=>{N({analytics:!0,marketing:!0}),i(!1),p(!1)},A=()=>{N({analytics:!1,marketing:!1}),i(!1),p(!1)},$=()=>{N({analytics:f,marketing:v}),i(!1),p(!1)},O=()=>{g(!1);const n=j();k(!!(n!=null&&n.analytics)),y(!!(n!=null&&n.marketing)),p(!0)};return e.jsxs("div",{ref:S,className:"consent-banner",role:"dialog","aria-live":"polite","aria-label":o("consent.title"),children:[e.jsx("style",{children:`
        /* PAPYRUS = matrica PACK_BOX.panel (Matej 3. 10. 2026: *„cookie lišta nie je
           v brande, je v takej divnej farbe"*). Dovtedy plochá #F5EEDF so šedým
           inkoustom — bledý blok podľa locku je papyrusový gradient v zlatom ráme. */
        .consent-banner {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
          background: ${t.panelGrad}; border-top: 1.5px solid ${t.cardEdge};
          box-shadow: 0 -8px 28px rgba(0,0,0,0.35), 0 -3px 0 rgba(201,154,63,0.15);
          padding: 12px 24px;
        }
        .consent-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 24px;
        }
        .consent-body {
          font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45;
          color: ${t.inkWarm}; margin: 0; max-width: 640px;
        }
        .consent-body b {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase; color: ${t.inkStrong}; margin-right: 4px;
        }
        .consent-bone { display: inline-block; width: 20px; height: 20px; vertical-align: -4px; margin-right: 8px; }
        .consent-actions { display: flex; flex-direction: row; align-items: center; gap: 8px; flex-shrink: 0; }
        .consent-btn-primary, .consent-btn-secondary, .consent-split-main, .consent-split-arrow {
          font-family: 'Cinzel', serif; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          font-size: 12px; cursor: pointer; white-space: nowrap;
        }
        /* TLAČIDLÁ SA ZALAMUJÚ (16. 10. 2026, stráž check:popupy): nowrap v karte 420 px pustil
           „Len nevyhnutné" cez okraj tlačidla v SK (3 px) aj DE (12 px) — vo flexe s min-width: 0
           ho nič nezastavilo. Dlhší jazyk dostane 2 riadky, nie orez ani trojbodku. */
        .consent-actions { align-items: stretch; }
        .consent-actions .consent-btn-primary, .consent-actions .consent-btn-secondary, .consent-actions .consent-split-main {
          white-space: normal; text-wrap: balance; line-height: 1.2; overflow-wrap: anywhere;
        }
        .consent-btn-primary {
          background: ${r.grad}; color: ${r.ink};
          border: 1px solid ${r.deep}; border-radius: 8px; box-shadow: ${D};
          padding: 12px 24px;
        }
        .consent-btn-primary:hover { background: ${r.gradHover}; }
        .consent-btn-secondary {
          background: ${t.tileBg}; border: 1px solid ${t.border};
          border-radius: 8px; color: ${t.inkStrong}; padding: 12px 24px;
        }
        .consent-btn-secondary:hover { background: rgba(201,154,63,0.14); }
        /* DELENÉ TLAČIDLO — hlavná plocha = len nevyhnutné, šípka = rozbaľovačka */
        .consent-split { position: relative; display: flex; }
        .consent-split-main {
          background: ${t.tileBg}; color: ${t.inkStrong}; padding: 12px 16px;
          border: 1px solid ${t.border}; border-right: none; border-radius: 8px 0 0 8px;
        }
        .consent-split-arrow {
          display: flex; align-items: center; justify-content: center; padding: 0 8px;
          background: ${t.tileBg}; color: ${t.inkStrong};
          border: 1px solid ${t.border}; border-radius: 0 8px 8px 0;
        }
        .consent-split-main:hover, .consent-split-arrow:hover { background: rgba(201,154,63,0.14); }
        .consent-arrow-ic { display: flex; transform: rotate(-90deg); transition: transform .15s ease; }
        .consent-split-arrow[aria-expanded="true"] .consent-arrow-ic { transform: rotate(90deg); }
        .consent-menu {
          position: absolute; right: 0; bottom: calc(100% + 8px); min-width: 100%;
          background: ${t.card}; border: 1px solid ${t.cardEdge}; border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.22); padding: 4px; z-index: 1;
        }
        .consent-menu button {
          display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer;
          padding: 8px 12px; border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${t.inkStrong};
        }
        .consent-menu button:hover { background: ${r.fill}; }
        .consent-settings {
          display: flex; flex-direction: column; gap: 12px;
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid ${t.hairline};
        }
        .consent-toggle-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .consent-toggle-label {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.06em; color: ${t.inkStrong}; margin: 0 0 4px;
        }
        .consent-toggle-desc {
          font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.5;
          color: ${t.inkWarm}; margin: 0; max-width: 460px;
        }
        .consent-switch {
          position: relative; flex-shrink: 0; width: 44px; height: 24px;
          border-radius: 999px; border: 1px solid ${t.border};
          background: rgba(201,154,63,0.18); cursor: pointer;
        }
        .consent-switch[data-on="true"] { background: ${r.edge}; border-color: ${r.deep}; }
        .consent-switch-knob {
          position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.35);
          transition: transform .15s ease;
        }
        .consent-switch[data-on="true"] .consent-switch-knob { transform: translateX(20px); }

        /* MOBIL: text nad tlačidlami, obe tlačidlá v JEDNOM riadku 50/50. */
        @media (max-width: 759px) {
          /* 3. 10. 2026 nižšia: 133 → ~110 px (zakrývala spodok úvodu /onepage). */
          .consent-banner { padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px)); }
          .consent-inner { flex-direction: column; align-items: stretch; gap: 8px; }
          .consent-body { font-size: 12px; line-height: 1.35; }
          .consent-bone { width: 16px; height: 16px; vertical-align: -3px; margin-right: 4px; }
          .consent-actions > * { flex: 1 1 0; min-width: 0; }
          .consent-btn-primary, .consent-btn-secondary { padding: 12px 8px; letter-spacing: 0.02em; }
          .consent-split-main { flex: 1 1 auto; min-width: 0; padding: 12px 8px; letter-spacing: 0.02em; }
          .consent-split-arrow { flex: 0 0 auto; }
          /* ONLY NECESSARY je o polovicu dlhšie než ALLOW ALL — na ostrom builde sa pri 50/50
             orezalo na 390 px (náhľad 22. 9.), lokálne nie. Väčší diel riadku. */
          .consent-split { flex: 1.5 1 0; }
          .consent-menu { left: 0; right: 0; }
        }
        /* ── PC: KARTA VPRAVO DOLE, NIE PÁS (Matej 22. 9. 2026: „nebolo by lepšie dať tú
           správu na PC iba na pravý bok od kraja po kraj spodného nav?") ─────────────
           Spodok sedí so spodkom navu (16 px), šírka sa ráta z miesta VPRAVO OD NAVU:
           nav stojí v strede okna a publikuje --pack-nav-half (PackLayout), takže jeho
           pravý kraj je 50vw + polovica. Karta tam nikdy nezasiahne; bez navu (web,
           heroflow) je premenná preč a karta má svojich 420 px. */
        @media (min-width: 1024px) {
          .consent-banner {
            left: auto; right: 24px; bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
            width: min(420px, calc(50vw - var(--pack-nav-half, 0px) - 48px));
            padding: 16px; border: 1.5px solid ${t.cardEdge}; border-radius: 16px;
            box-shadow: ${t.panelShadow};
          }
          /* /map a AINUBIS majú nav v strede PLOCHY vpravo (5. 10. 2026) — vedľa neho ostáva
             ~250 px a tlačidlá sa v karte prekrývali. Tam karta stojí NAD radom navu
             v plnej šírke, nie vedľa neho. */
          body:has(.trp-root) .consent-banner, body:has(.akv-root) .consent-banner {
            width: 420px;
            bottom: calc(env(safe-area-inset-bottom, 0px) + 16px + var(--pack-nav-h, 64px) + 12px);
          }
          /* Panel PLUS vychádza z toho istého navu do tej istej výšky — kým je otvorený, karta
             ustúpi (ako AINUBIS, rozhodnutie 3. 10.) a po zavretí sa vráti. */
          body:has(.trp-root):has(.att-entry-backdrop) .consent-banner,
          body:has(.akv-root):has(.att-entry-backdrop) .consent-banner { display: none; }
          .consent-inner { flex-direction: column; align-items: stretch; gap: 12px; }
          .consent-actions > * { flex: 1 1 0; min-width: 0; }
          .consent-btn-primary, .consent-btn-secondary { padding: 12px 8px; }
          .consent-split-main { flex: 1 1 auto; min-width: 0; padding: 12px 8px; }
          .consent-menu { left: 0; right: 0; }
        }
        /* Úzke PC (1024–1199): vpravo od navu ostáva ~310 px, ONLY NECESSARY v .12em sa orezalo. */
        @media (min-width: 1024px) and (max-width: 1199px) {
          .consent-btn-primary, .consent-btn-secondary, .consent-split-main { letter-spacing: 0.02em; }
          .consent-split-main { padding: 12px 4px; }
          .consent-split-arrow { padding: 0 4px; }
          /* ONLY NECESSARY je o polovicu dlhšie než ALLOW ALL — dostane väčší diel riadku. */
          .consent-split { flex: 1.7 1 0; }
        }
        /* Pod 380 px sa ONLY NECESSARY v 12 px vedľa šípky do polovice riadku nezmestí
           a nowrap by roztiahol celú stránku do šírky (snímka 360 px, 22. 9.). */
        @media (max-width: 379px) {
          .consent-btn-primary, .consent-btn-secondary, .consent-split-main { font-size: 10px; letter-spacing: 0.04em; }
          .consent-split-arrow { padding: 0 4px; }
          .consent-split-main { padding: 12px 4px; letter-spacing: 0; }
        }
      `}),e.jsxs("div",{className:"consent-inner",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"consent-body",children:[e.jsx("img",{className:"consent-bone",src:"/icons/pack/bone.svg",alt:"","aria-hidden":!0}),e.jsx("b",{children:o("consent.title")}),o("consent.body")]}),h&&e.jsxs("div",{className:"consent-settings",children:[e.jsxs("div",{className:"consent-toggle-row",children:[e.jsxs("div",{children:[e.jsx("p",{className:"consent-toggle-label",children:o("consent.analytics.label")}),e.jsx("p",{className:"consent-toggle-desc",children:o("consent.analytics.desc")})]}),e.jsx("button",{type:"button",className:"consent-switch","data-on":f,role:"switch","aria-checked":f,"aria-label":o("consent.analytics.label"),onClick:()=>k(n=>!n),children:e.jsx("span",{className:"consent-switch-knob"})})]}),e.jsxs("div",{className:"consent-toggle-row",children:[e.jsxs("div",{children:[e.jsx("p",{className:"consent-toggle-label",children:o("consent.marketing.label")}),e.jsx("p",{className:"consent-toggle-desc",children:o("consent.marketing.desc")})]}),e.jsx("button",{type:"button",className:"consent-switch","data-on":v,role:"switch","aria-checked":v,"aria-label":o("consent.marketing.label"),onClick:()=>y(n=>!n),children:e.jsx("span",{className:"consent-switch-knob"})})]})]})]}),e.jsx("div",{className:"consent-actions",children:h?e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"consent-btn-secondary",onClick:A,children:o("consent.necessary")}),e.jsx("button",{type:"button",className:"consent-btn-primary",onClick:$,children:o("consent.save")})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"consent-split",ref:u,children:[e.jsx("button",{type:"button",className:"consent-split-main",onClick:A,children:o("consent.necessary")}),e.jsx("button",{type:"button",className:"consent-split-arrow","aria-haspopup":"menu","aria-expanded":x,"aria-label":o("consent.settings"),onClick:()=>g(n=>!n),children:e.jsx("span",{className:"consent-arrow-ic","aria-hidden":!0,children:e.jsx(I,{size:16})})}),x&&e.jsx("div",{className:"consent-menu",role:"menu",children:e.jsx("button",{type:"button",role:"menuitem",onClick:O,children:o("consent.settings")})})]}),e.jsx("button",{type:"button",className:"consent-btn-primary",onClick:z,children:o("consent.acceptAll")})]})})]})]})}export{_ as ConsentBanner};
