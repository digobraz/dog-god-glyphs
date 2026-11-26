import{u as D,a as R,r as s,I as B,j as n,P as $,b as o,L as i,c as I}from"./index-DriUOdZL.js";import{C as M}from"./chataNahlad-BvQ_JlDS.js";import{H as T}from"./handArrowLeft-CBfp0fHd.js";import{g as A,a as F,s as E}from"./consent-Dhof2q2u.js";import"./ThinArrow-DxkNjmlF.js";const e=":is(html.papyrus3d, body:has(.aw))",Y=["/cert-render","/invoice-render","/share-render","/lost/","/pack/sos"];function K(){const a=D(),{pathname:x}=R(),p=Y.some(t=>x.startsWith(t)),[m,c]=s.useState(!1),[d,g]=s.useState(x!=="/"),[h,l]=s.useState(!1),[b,u]=s.useState(!1),f=s.useRef(null),[k,v]=s.useState(!1),[y,w]=s.useState(!1),L=s.useRef(null);if(s.useEffect(()=>{const t=L.current,r=document.documentElement,j=()=>r.style.setProperty("--consent-h","0px");if(p||!m||!d||!t)return j(),j;const N=()=>r.style.setProperty("--consent-h",`${Math.ceil(t.getBoundingClientRect().height)}px`);N();const S=new ResizeObserver(N);return S.observe(t),()=>{S.disconnect(),j()}},[p,m,d,h]),s.useEffect(()=>{if(x!=="/"){g(!0);return}if(d)return;const t=()=>{window.scrollY>8&&g(!0)};return window.addEventListener("scroll",t,{passive:!0}),()=>window.removeEventListener("scroll",t)},[x,d]),s.useEffect(()=>{if(p)return;const t=A();t?(F(t),c(!1)):c(!0)},[p]),s.useEffect(()=>{const t=()=>{const r=A();v(!!(r!=null&&r.analytics)),w(!!(r!=null&&r.marketing)),l(!0),g(!0),c(!0)};return window.addEventListener("dogypt:open-consent",t),()=>window.removeEventListener("dogypt:open-consent",t)},[]),s.useEffect(()=>{if(!b)return;const t=r=>{f.current&&!f.current.contains(r.target)&&u(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[b]),p||!m||!d||M||B)return null;const P=()=>{E({analytics:!0,marketing:!0}),c(!1),l(!1)},z=()=>{E({analytics:!1,marketing:!1}),c(!1),l(!1)},C=()=>{E({analytics:k,marketing:y}),c(!1),l(!1)},O=()=>{u(!1);const t=A();v(!!(t!=null&&t.analytics)),w(!!(t!=null&&t.marketing)),l(!0)};return n.jsxs(n.Fragment,{children:[n.jsx("div",{className:"consent-veil","aria-hidden":!0}),n.jsxs("div",{ref:L,className:"consent-banner",role:"dialog","aria-modal":"true","aria-live":"polite","aria-label":a("consent.title"),children:[n.jsx("style",{children:`
        /* PAPYRUS = matrica PACK_BOX.panel (Matej 3. 10. 2026: *„cookie lišta nie je
           v brande, je v takej divnej farbe"*). Dovtedy plochá #F5EEDF so šedým
           inkoustom — bledý blok podľa locku je papyrusový gradient v zlatom ráme. */
        .consent-veil {
          position: fixed; inset: 0; z-index: 9998;
          background: ${$.modal};
          -webkit-backdrop-filter: blur(${$.blur}); backdrop-filter: blur(${$.blur});
        }
        .consent-banner {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
          background: ${o.panelGrad}; border-top: 1.5px solid ${o.cardEdge};
          box-shadow: 0 -8px 28px rgba(0,0,0,0.35), 0 -3px 0 rgba(201,154,63,0.15);
          padding: 12px 24px;
        }
        .consent-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 24px;
        }
        .consent-body {
          font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45;
          color: ${o.inkWarm}; margin: 0; max-width: 640px;
        }
        .consent-body b {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase; color: ${o.inkStrong}; margin-right: 4px;
        }
        .consent-bone.consent-cookie { display: none; }
        ${e} .consent-bone-kit { display: none; }
        ${e} .consent-bone.consent-cookie { display: block; }
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
          background: ${i.grad}; color: ${i.ink};
          border: 1px solid ${i.deep}; border-radius: 8px; box-shadow: ${I};
          padding: 12px 24px;
        }
        .consent-btn-primary:hover { background: ${i.gradHover}; }
        .consent-btn-secondary {
          background: ${o.tileBg}; border: 1px solid ${o.border};
          border-radius: 8px; color: ${o.inkStrong}; padding: 12px 24px;
        }
        .consent-btn-secondary:hover { background: rgba(201,154,63,0.14); }
        /* DELENÉ TLAČIDLO — hlavná plocha = len nevyhnutné, šípka = rozbaľovačka */
        .consent-split { position: relative; display: flex; }
        .consent-split-main {
          background: ${o.tileBg}; color: ${o.inkStrong}; padding: 12px 16px;
          border: 1px solid ${o.border}; border-right: none; border-radius: 8px 0 0 8px;
        }
        .consent-split-arrow {
          display: flex; align-items: center; justify-content: center; padding: 0 8px;
          background: ${o.tileBg}; color: ${o.inkStrong};
          border: 1px solid ${o.border}; border-radius: 0 8px 8px 0;
        }
        .consent-split-main:hover, .consent-split-arrow:hover { background: rgba(201,154,63,0.14); }
        .consent-arrow-ic { display: flex; transform: rotate(-90deg); transition: transform .15s ease; }
        .consent-split-arrow[aria-expanded="true"] .consent-arrow-ic { transform: rotate(90deg); }
        .consent-menu {
          position: absolute; right: 0; bottom: calc(100% + 8px); min-width: 100%;
          background: ${o.card}; border: 1px solid ${o.cardEdge}; border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.22); padding: 4px; z-index: 1;
        }
        .consent-menu button {
          display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer;
          padding: 8px 12px; border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${o.inkStrong};
        }
        .consent-menu button:hover { background: ${i.fill}; }
        .consent-settings {
          display: flex; flex-direction: column; gap: 12px;
          margin-top: 12px; padding-top: 12px;
          border-top: 1px solid ${o.hairline};
        }
        .consent-toggle-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .consent-toggle-label {
          font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
          letter-spacing: 0.06em; color: ${o.inkStrong}; margin: 0 0 4px;
        }
        .consent-toggle-desc {
          font-family: 'Space Grotesk', sans-serif; font-size: 12px; line-height: 1.5;
          color: ${o.inkWarm}; margin: 0; max-width: 460px;
        }
        .consent-switch {
          position: relative; flex-shrink: 0; width: 44px; height: 24px;
          border-radius: 999px; border: 1px solid ${o.border};
          background: rgba(201,154,63,0.18); cursor: pointer;
        }
        .consent-switch[data-on="true"] { background: ${i.edge}; border-color: ${i.deep}; }
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
            left: auto; right: 24px; bottom: var(--pack-dock-b);
            width: min(420px, calc(50vw - var(--pack-nav-half, 0px) - 48px));
            padding: 16px; border: 1.5px solid ${o.cardEdge}; border-radius: 16px;
            box-shadow: ${o.panelShadow};
          }
          /* /map a AINUBIS majú nav v strede PLOCHY vpravo (5. 10. 2026) — vedľa neho ostáva
             ~250 px a tlačidlá sa v karte prekrývali. Tam karta stojí NAD radom navu
             v plnej šírke, nie vedľa neho. */
          body:has(.trp-root) .consent-banner, body:has(.akv-root) .consent-banner {
            width: 420px;
            bottom: calc(var(--pack-dock-b) + var(--pack-nav-h, 64px) + 12px);
          }
          /* Panel PLUS vychádza z toho istého navu do tej istej výšky — kým je otvorený, karta
             ustúpi (ako AINUBIS, rozhodnutie 3. 10.) a po zavretí sa vráti. */
          body:has(.trp-root):has(.att-entry-backdrop) .consent-banner,
          body:has(.akv-root):has(.att-entry-backdrop) .consent-banner,
          body:has(.trp-root):has(.att-entry-backdrop) .consent-veil,
          body:has(.akv-root):has(.att-entry-backdrop) .consent-veil { display: none; }
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

        /* ── ŠAT PAPYRUS 3D (Matej 11. 11. 2026: „poriešme aj cookies v novom dizajne") ──
           Len pod html.papyrus3d (APP_NEW), web ostáva vyššie. Zlomená sušienka-kosť z Kie
           (plany/ikonky/gen-cookie-kost.mjs) namiesto kosti z kitu, tlačidlá = TLAČIDLO 3D
           (lapis + papyrus) z lib/papyrus3d.ts, nadpis LT Museum.
           NOVÝ WEB /app (Matej 11. 11.: „daj to aj na nový web nech to funguje pri flipe") je na
           LIVE bez html.papyrus3d, preto rozsah P3D chytí aj stránku s koreňom .aw — po FLIPe pôjde
           /app na / a lišta ide s ním. Farby šatu sú tu doslova (P3D_PAGE v lib/papyrus3d.ts),
           lebo na webe premenné --p3d-* nikto nedefinuje. Váha 900: web má LT Museum v 300–900,
           400 by vybrala Light; v appke sú všetky váhy Black. */
        ${e} .consent-banner {
          --p3d-ink: #2a1608; --p3d-gold-solid: #A3782B; --p3d-paper: #F3E4C4; --p3d-paper-hi: #F9F2E3;
          --p3d-card: linear-gradient(180deg, #F9F2E3, #F3E4C4); --p3d-inset: inset 0 4px 5px rgba(42,22,8,.26);
        }
        ${e} .consent-banner {
          background: var(--p3d-card); border: 2.5px solid var(--p3d-ink); border-bottom: none;
          border-radius: 16px 16px 0 0; box-shadow: 0 -8px 28px rgba(0,0,0,0.4); padding-top: 16px;
        }
        ${e} .consent-body { font-size: 14px; line-height: 1.45; color: var(--p3d-ink); }
        ${e} .consent-body b {
          display: block; margin: 0 0 4px; font-family: 'LT Museum', serif; font-weight: 900;
          font-size: 20px; line-height: 1.1; letter-spacing: 0; text-transform: none; color: var(--p3d-ink);
        }
        ${e} .consent-bone {
          float: left; width: 64px; height: 64px; margin: -4px 12px 0 -4px;
          filter: drop-shadow(0 3px 2px rgba(42,22,8,0.3));
        }
        ${e} .consent-actions { gap: 12px; padding-bottom: 6px; }
        ${e} .consent-btn-primary, ${e} .consent-btn-secondary,
        ${e} .consent-split-main, ${e} .consent-split-arrow {
          min-height: 48px; font-family: 'LT Museum', serif; font-weight: 900; font-size: 16px;
          letter-spacing: 0; text-transform: none; color: var(--p3d-ink);
          border: 2.5px solid var(--p3d-ink); background: linear-gradient(180deg, #fff, var(--p3d-paper));
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -4px 0 rgba(0,0,0,0.15), 0 6px 0 var(--p3d-gold-solid);
          transition: transform .07s, box-shadow .07s;
        }
        ${e} .consent-btn-primary {
          color: #EFD79A; border-color: #EFD79A; border-radius: 16px;
          background: linear-gradient(180deg, color-mix(in srgb, #16307A 72%, white), #0A1A4A);
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.28), inset 0 -4px 0 rgba(0,0,0,0.15), 0 6px 0 color-mix(in srgb, #0A1A4A 60%, black);
        }
        ${e} .consent-btn-secondary { border-radius: 16px; }
        ${e} .consent-split-main { border-right: none; border-radius: 16px 0 0 16px; }
        ${e} .consent-split-arrow { border-radius: 0 16px 16px 0; }
        ${e} .consent-btn-primary:hover { background: linear-gradient(180deg, color-mix(in srgb, #16307A 62%, white), #0A1A4A); }
        ${e} .consent-btn-secondary:hover, ${e} .consent-split-main:hover,
        ${e} .consent-split-arrow:hover { background: linear-gradient(180deg, #fff, var(--p3d-paper-hi)); }
        ${e} .consent-btn-primary:active, ${e} .consent-btn-secondary:active,
        ${e} .consent-split-main:active, ${e} .consent-split-arrow:active { transform: translateY(5px); box-shadow: none; }
        ${e} .consent-menu { border: 2.5px solid var(--p3d-ink); border-radius: 16px; background: var(--p3d-paper-hi); }
        ${e} .consent-toggle-label { font-family: 'LT Museum', serif; font-weight: 900; font-size: 16px; letter-spacing: 0; color: var(--p3d-ink); }
        ${e} .consent-toggle-desc { color: var(--p3d-ink); }
        ${e} .consent-switch { border: 2.5px solid var(--p3d-ink); height: 28px; width: 50px; box-shadow: var(--p3d-inset); }
        ${e} .consent-switch[data-on="true"] { background: #16307A; border-color: var(--p3d-ink); }
        ${e} .consent-switch-knob { top: 2px; left: 2px; width: 19px; height: 19px; }
        @media (max-width: 759px) {
          ${e} .consent-banner { padding-top: 12px; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
          ${e} .consent-bone { width: 52px; height: 52px; margin: -2px 8px 0 -4px; }
          ${e} .consent-body { font-size: 12px; }
          ${e} .consent-body b { font-size: 16px; }
        }
        @media (min-width: 1024px) {
          ${e} .consent-banner {
            border: 2.5px solid var(--p3d-ink); border-radius: 16px;
            box-shadow: inset 0 2px 0 rgba(255,255,255,0.55), 0 8px 0 var(--p3d-gold-solid), 0 16px 28px rgba(0,0,0,0.45);
          }
          ${e} .consent-bone { width: 72px; height: 72px; }
        }
      `}),n.jsxs("div",{className:"consent-inner",children:[n.jsxs("div",{children:[n.jsxs("p",{className:"consent-body",children:[n.jsx("img",{className:"consent-bone consent-bone-kit",src:"/icons/pack/bone.svg",alt:"","aria-hidden":!0}),n.jsx("img",{className:"consent-bone consent-cookie",src:"/icons/sys/cookie-kost.webp",alt:"","aria-hidden":!0}),n.jsx("b",{children:a("consent.title")}),a("consent.body")]}),h&&n.jsxs("div",{className:"consent-settings",children:[n.jsxs("div",{className:"consent-toggle-row",children:[n.jsxs("div",{children:[n.jsx("p",{className:"consent-toggle-label",children:a("consent.analytics.label")}),n.jsx("p",{className:"consent-toggle-desc",children:a("consent.analytics.desc")})]}),n.jsx("button",{type:"button",className:"consent-switch","data-on":k,role:"switch","aria-checked":k,"aria-label":a("consent.analytics.label"),onClick:()=>v(t=>!t),children:n.jsx("span",{className:"consent-switch-knob"})})]}),n.jsxs("div",{className:"consent-toggle-row",children:[n.jsxs("div",{children:[n.jsx("p",{className:"consent-toggle-label",children:a("consent.marketing.label")}),n.jsx("p",{className:"consent-toggle-desc",children:a("consent.marketing.desc")})]}),n.jsx("button",{type:"button",className:"consent-switch","data-on":y,role:"switch","aria-checked":y,"aria-label":a("consent.marketing.label"),onClick:()=>w(t=>!t),children:n.jsx("span",{className:"consent-switch-knob"})})]})]})]}),n.jsx("div",{className:"consent-actions",children:h?n.jsxs(n.Fragment,{children:[n.jsx("button",{type:"button",className:"consent-btn-secondary",onClick:z,children:a("consent.necessary")}),n.jsx("button",{type:"button",className:"consent-btn-primary",onClick:C,children:a("consent.save")})]}):n.jsxs(n.Fragment,{children:[n.jsxs("div",{className:"consent-split",ref:f,children:[n.jsx("button",{type:"button",className:"consent-split-main",onClick:z,children:a("consent.necessary")}),n.jsx("button",{type:"button",className:"consent-split-arrow","aria-haspopup":"menu","aria-expanded":b,"aria-label":a("consent.settings"),onClick:()=>u(t=>!t),children:n.jsx("span",{className:"consent-arrow-ic","aria-hidden":!0,children:n.jsx(T,{size:16})})}),b&&n.jsx("div",{className:"consent-menu",role:"menu",children:n.jsx("button",{type:"button",role:"menuitem",onClick:O,children:a("consent.settings")})})]}),n.jsx("button",{type:"button",className:"consent-btn-primary",onClick:P,children:a("consent.acceptAll")})]})})]})]})]})}export{K as ConsentBanner};
