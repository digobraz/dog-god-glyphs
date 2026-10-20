import{r as d,h as x,j as a,c as h}from"./index-7PctGTam.js";import{f as v}from"./flagUrl-B21iQI9I.js";const c=[{code:"ENG",label:"en",countries:["gb","us","ca"],enabled:!0},{code:"ESP",label:"esp",countries:["es","mx","ar"],enabled:!0},{code:"PRT",label:"prt",countries:["pt","br"],enabled:!0},{code:"CHN",label:"chn",countries:["cn"],enabled:!0},{code:"JPN",label:"jpn",countries:["jp"],enabled:!0},{code:"IND",label:"ind",countries:["in"],enabled:!0},{code:"ARA",label:"ara",countries:["sa","ae","eg"],enabled:!0},{code:"RUS",label:"rus",countries:["ru"],enabled:!0},{code:"KOR",label:"kor",countries:["kr"],enabled:!0},{code:"SVK",label:"sk",countries:["sk"],enabled:!0},{code:"CZE",label:"cs",countries:["cz"],enabled:!0},{code:"DEU",label:"deu",countries:["de"],enabled:!0},{code:"NLD",label:"nld",countries:["nl"],enabled:!0},{code:"FRA",label:"fra",countries:["fr"],enabled:!0},{code:"ITA",label:"ita",countries:["it"],enabled:!0},{code:"POL",label:"pol",countries:["pl"],enabled:!0},{code:"UKR",label:"ukr",countries:["ua"],enabled:!0},{code:"TUR",label:"tur",countries:["tr"],enabled:!0}];function u({countries:r}){return a.jsx("span",{className:"lang-flag-stack","aria-hidden":"true",children:r.map(n=>a.jsx("span",{className:"lang-flag-stack__item",style:{backgroundImage:`url(${v(n,80)})`}},n))})}function j({variant:r="nav"}={}){const[n,o]=d.useState(!1),{lang:g,setLang:b}=x(),i=d.useRef(null);d.useEffect(()=>{if(!n)return;const e=l=>{if(r==="flow"||r==="settings")return;const f=l.target;i.current&&!i.current.contains(f)&&o(!1)},t=l=>{l.key==="Escape"&&o(!1)};return window.addEventListener("mousedown",e),window.addEventListener("touchstart",e),window.addEventListener("keydown",t),()=>{window.removeEventListener("mousedown",e),window.removeEventListener("touchstart",e),window.removeEventListener("keydown",t)}},[n,r]);const s=c.find(e=>e.label===g)??c[0],m=e=>{e.enabled&&(b(e.label),o(!1))},p=a.jsx("div",{className:"lang-grid",children:c.map(e=>{const t=e.label===g,l=`lang-btn${t?" is-active":""}${e.enabled?"":" is-disabled"}`;return a.jsxs("button",{type:"button",className:l,role:"option","aria-selected":t,"aria-disabled":!e.enabled,onClick:()=>m(e),children:[a.jsx(u,{countries:e.countries}),a.jsx("span",{className:"lang-btn__code",children:e.code})]},e.code)})}),k=r==="flow"?" lang-picker--flow":r==="settings"?" lang-picker--settings":"";return a.jsxs("div",{className:`lang-picker${k}`,ref:i,children:[a.jsxs("button",{type:"button",className:"lang-trigger","aria-haspopup":"listbox","aria-expanded":n,"aria-label":`Language: ${s.code}`,onClick:()=>o(e=>!e),children:[a.jsx(u,{countries:s.countries}),r==="settings"&&a.jsx("span",{className:"lang-trigger__code",children:s.code}),a.jsx("svg",{className:`lang-trigger__chev${n?" is-open":""}`,width:"9",height:"6",viewBox:"0 0 10 6",fill:"none","aria-hidden":"true",children:a.jsx("path",{d:"M1 1 L5 5 L9 1",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]}),n&&r==="nav"&&a.jsx("div",{className:"lang-panel",role:"listbox",children:p}),n&&(r==="flow"||r==="settings")&&h.createPortal(a.jsxs("div",{className:"lang-modal-root",children:[a.jsx("div",{className:"lang-modal-backdrop",onClick:()=>o(!1)}),a.jsx("div",{className:"lang-modal",role:"listbox","aria-modal":"true",children:p})]}),document.body),a.jsx("style",{children:`
        /* Picker je STATIC — panel sa pozične viaže na .nav-left (position:fixed),
           čím sa šírka panelu = šírka pill nav-baru. */
        .lang-picker {
          display: inline-flex;
          align-items: center;
        }

        .lang-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: #000;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .lang-trigger:hover { opacity: 0.55; }
        .lang-trigger__chev {
          transition: transform 180ms ease;
          color: rgba(0,0,0,0.55);
        }
        .lang-trigger__chev.is-open { transform: rotate(180deg); }

        /* Flag stack — vertical-slice composite. Viaceré vlajky = úzke pruhy vedľa seba
           (každý cropped na stred PNG cez background-size:cover + center). Single flag = full aspect. */
        .lang-flag-stack {
          display: inline-flex;
          vertical-align: middle;
          height: 1.05em;
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.18);
          background: rgba(0,0,0,0.06); /* fallback pred loadnutím PNG */
          flex-shrink: 0;
        }
        .lang-flag-stack__item {
          display: block;
          height: 100%;
          width: 0.55em;            /* slice width pre multi-flag */
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }
        .lang-flag-stack__item:only-child {
          width: 1.55em;             /* single flag = normálny 3:2 aspect */
        }

        /* Panel: position:absolute voči pozicovanému predkovi v nave.
           🔴 ŠÍRKU DIKTUJE OBSAH, NIE RODIČ (oprava 27. 8. 2026). Pôvodné
           left:0 + right:0 znamenalo „presne šírka pill" a fungovalo, kým bol
           predkom široký nav. V nave na /onepage je predkom UŽ LEN TRIGGER
           (64 px), takže panel spadol na 118 px a z dvoch stĺpcov ostalo
           „SV / CZ / D / N" — texty sa orezali, hoci jazykov bolo správnych 18.
           ⚠️ min-width 100 % drží starý vzhľad tam, kde je predok širší než
           obsah (produkčná stena): panel sa nezúži pod šírku pilulky. Rozšíri sa
           len tam, kde by inak rezal text.
           ⚠️ Kotva je PRAVÁ hrana — panel je posledný prvok vpravo v nave,
           takže musí padať doľava, inak vytečie z obrazovky. */
        .lang-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: auto;
          right: 0;
          width: max-content;
          min-width: 100%;
          z-index: 110;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.35);
          animation: langPanelFade 180ms ease-out;
          max-height: calc(100dvh - 80px);
          overflow-y: auto;
        }
        @keyframes langPanelFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lang-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(9, auto);
          grid-auto-flow: column;
          gap: 4px;
        }

        .lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 8px;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: #000;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background 150ms ease, border-color 150ms ease, opacity 150ms ease;
          min-width: 0;
        }
        .lang-btn:hover:not(.is-disabled) {
          background: rgba(201,154,63,0.18);
          border-color: rgba(201,154,63,0.45);
        }
        .lang-btn.is-active {
          background: rgba(201,154,63,0.28);
          border-color: rgba(201,154,63,0.65);
        }
        .lang-btn.is-disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }
        .lang-btn__code { flex-shrink: 0; }

        /* FLOW variant — dark-bg heroglyph flow. Papyrus-cream trigger (+ tap padding)
           and a centered MODAL popup with dark scrim (portaled to <body>). */
        .lang-picker--flow .lang-trigger { color: rgba(250,244,236,0.92); padding: 4px; }
        .lang-picker--flow .lang-trigger:hover { opacity: 0.7; }
        .lang-picker--flow .lang-trigger__chev { color: rgba(250,244,236,0.7); }
        .lang-picker--flow .lang-flag-stack { border-color: rgba(250,244,236,0.35); }

        /* SETTINGS variant — light papyrus /pack account row. Dark ink trigger with
           flag + 3-letter code; reuses the centered modal (portaled) so it never clips
           inside the narrow settings field. */
        .lang-picker--settings .lang-trigger {
          color: #1f1a0e;
          gap: 7px;
          /* Zlatý rám matrice /pack (T.border), nie neutrálna šedá. Prepínač stojí
             v tom istom stĺpci ako NASTAVIŤ/ZMENIŤ a ODHLÁSIŤ SA — tie tri majú
             odteraz jeden rám. (13. 8. 2026, zjednotenie DNA.) */
          border: 1px solid rgba(201,154,63,0.45);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
        }
        .lang-picker--settings .lang-trigger:hover { opacity: 1; background: rgba(201,154,63,0.10); }
        .lang-picker--settings .lang-trigger__code { font-weight: 700; }
        .lang-picker--settings .lang-trigger__chev { color: rgba(31,26,14,0.5); }
        .lang-picker--settings .lang-flag-stack { border-color: rgba(31,26,14,0.2); }

        .lang-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0, 0, 0, 0.72);
          -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
          animation: langModalFade 160ms ease-out;
        }
        .lang-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2001;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201, 154, 63, 0.55);
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6);
          /* left:50% dáva fixovanému prvku len POLOVICU okna — bez max-content mal modal
             na 360 px šírku 180 a kódy ENG/CHN vyliezali zo stĺpca (stráž popupov 17. 10. 2026). */
          width: max-content;
          max-width: min(420px, 88vw);
          max-height: 84dvh;
          overflow-y: auto;
          animation: langModalPop 200ms cubic-bezier(0.2, 0.8, 0.3, 1.15);
        }
        @keyframes langModalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes langModalPop {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `})]})}export{j as L};
