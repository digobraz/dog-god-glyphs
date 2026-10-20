import{i as y,u as f,r as c,E as h,j as e,l as b}from"./index-7PctGTam.js";import{F as u}from"./flowMode-B6eboter.js";import{P as v}from"./PageTopBar-DlESgG9R.js";import{S as k}from"./Seo-B-e2lU-9.js";import"./handArrowLeft-BUyUUYuC.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock--CJIKtfn.js";import"./createLucideIcon-Di02PK5p.js";import"./LanguagePicker--v1cJQg6.js";import"./flagUrl-B21iQI9I.js";const w=1e3,E=[{id:"theology",titleKey:"entry.criteria.theology.title",bodyKey:"entry.criteria.theology.body",state:"done"},{id:"canon",titleKey:"entry.criteria.canon.title",bodyKey:"entry.criteria.canon.body",state:"done"},{id:"community",titleKey:"entry.criteria.community.title",bodyKey:"entry.criteria.community.body",state:"done"},{id:"symbol",titleKey:"entry.criteria.symbol.title",bodyKey:"entry.criteria.symbol.body",state:"done"},{id:"ritual",titleKey:"entry.criteria.ritual.title",bodyKey:"entry.criteria.ritual.body",state:"done"},{id:"vision",titleKey:"entry.criteria.vision.title",bodyKey:"entry.criteria.vision.body",state:"done"},{id:"offerings",titleKey:"entry.criteria.offerings.title",noteKey:"entry.criteria.offerings.note",bodyKey:"entry.criteria.offerings.body",state:"open",pillKey:"entry.criteria.offerings.pill",tagKey:"entry.criteria.offerings.tag"},{id:"legitimacy",titleKey:"entry.criteria.legitimacy.title",bodyKey:"entry.criteria.legitimacy.body",state:"soon"}];function j(o,i){const n=Math.max(0,w-o);return E.map(a=>({id:a.id,title:i(a.titleKey),note:a.noteKey?i(a.noteKey):void 0,body:i(a.bodyKey),state:a.state,pill:a.id==="legitimacy"?i("entry.criteria.legitimacy.pill",{count:n.toLocaleString("en")}):a.pillKey?i(a.pillKey):void 0,tag:a.tagKey?i(a.tagKey):void 0}))}function N({state:o}){return o==="done"?e.jsxs("svg",{className:"crit-mark done",width:"22",height:"22",viewBox:"0 0 24 24","aria-hidden":!0,children:[e.jsx("path",{fill:"#2E5FD0",d:"M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.19L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12z"}),e.jsx("path",{fill:"#fff",d:"M10.09 16.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"})]}):o==="open"?e.jsx("svg",{className:"crit-mark open",width:"23",height:"23",viewBox:"0 0 23 23","aria-hidden":!0,children:e.jsx("circle",{className:"crit-open-ring",cx:"11.5",cy:"11.5",r:"10",fill:"rgba(46,158,91,0.12)",stroke:"#2E9E5B",strokeWidth:"2",strokeDasharray:"3.4 3.4"})}):e.jsx("svg",{className:"crit-mark soon",width:"23",height:"23",viewBox:"0 0 23 23","aria-hidden":!0,children:e.jsx("circle",{cx:"11.5",cy:"11.5",r:"10",fill:"rgba(245,197,24,0.14)",stroke:"#E0A800",strokeWidth:"2",strokeDasharray:"3.4 3.4"})})}function M(){const o=y(),i=f(),[n,a]=c.useState(null),[d,m]=c.useState(null);c.useEffect(()=>{let t=!0;return fetch(`${h}/get-pack-stats`).then(r=>r.json()).then(r=>{t&&typeof(r==null?void 0:r.total)=="number"&&m(r.total)}).catch(()=>{}),()=>{t=!1}},[]);const s=j(d??0,i);c.useEffect(()=>{if(n===null)return;const t=l=>{l.target.closest(".crit-tile")||a(null)},r=window.setTimeout(()=>document.addEventListener("click",t),0);return()=>{window.clearTimeout(r),document.removeEventListener("click",t)}},[n]);const g=()=>{b("cta_become_dogyptian_click",{location:"entry"}),o(u)},p=(t,r)=>{const l=n===r;return e.jsxs("button",{type:"button",className:"crit-tile"+(t.state==="done"?" is-done":"")+(t.state==="open"?" is-open-slot":"")+(t.state==="soon"?" is-soon":"")+(l?" is-active":""),"aria-pressed":l,onClick:()=>a(x=>x===r?null:r),children:[e.jsx(N,{state:t.state}),e.jsxs("span",{className:"crit-title-wrap",children:[e.jsx("span",{className:"crit-title",children:t.title}),t.tag&&e.jsxs("span",{className:"crit-tag",children:["(",t.tag,")"]})]}),t.state==="done"?e.jsx("span",{className:"crit-flag done",children:i("entry.criteria.doneLabel")}):e.jsx("span",{className:"crit-flag pill",children:t.pill}),e.jsxs("span",{className:"crit-pop",role:"tooltip",children:[t.note&&e.jsxs("span",{className:"crit-pop-note",children:[t.note," "]}),t.body]})]},t.id)};return e.jsxs("div",{className:"entry-page dark-bg flex flex-col min-h-[100dvh] relative",style:{paddingBottom:"var(--consent-h, 0px)"},children:[e.jsx(k,{path:"/entry",title:"Become a Dogyptian — The Making of a Religion | DOGYPT",description:"Six marks of a faith already stand. See for yourself, then add the one that is yours. €11 — once, forever.",jsonLd:{"@context":"https://schema.org","@type":"Product",name:"HEROGLYPH — Dogyptian membership",description:"Name your dog into the faith with its own heroglyph. A unique sacred symbol encoding its essence, origin and character.",image:"https://dogypt.com/images/hekthor-heroglyph.webp",brand:{"@type":"Brand",name:"DOGYPT"},offers:{"@type":"Offer",price:"11",priceCurrency:"EUR",availability:"https://schema.org/InStock",url:"https://dogypt.com/entry"}}}),e.jsx("div",{"aria-hidden":!0,style:{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.5) 100%)",zIndex:0,pointerEvents:"none"}}),e.jsx("style",{children:`
        /* Pozadie ODVIAZANÉ od obsahu — fixed na viewport, žiadne rescale
           pri rozbalení karty (bg-dark.webp inak preškáluje s výškou .dark-bg).
           Scoped LEN na /entry, neovplyvní ostatné stránky. */
        .entry-page.dark-bg::before { position: fixed; }

        /* ── „Declaration" — papyrusová bledá karta ──────────────────── */
        .religion-section {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 14px 18px 20px;
        }
        .religion-card {
          position: relative;
          width: 100%;
          max-width: 620px;
          background: linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 16px;
          box-shadow:
            0 14px 44px rgba(0,0,0,0.55),
            0 0 0 4px rgba(201,154,63,0.12),
            inset 0 1px 0 rgba(255,255,255,0.5);
          padding: clamp(14px, 3vw, 22px) clamp(16px, 4.5vw, 32px);
        }
        .religion-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.62rem, 1.7vw, 0.72rem);
          font-weight: 500;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #C99A3F;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .eyebrow-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          transform: rotate(-12deg);
          opacity: 0.92;
        }
        .religion-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.6rem, 6vw, 2.15rem);
          letter-spacing: 0.03em;
          text-transform: uppercase;
          text-align: center;
          color: #2a1608;
          margin: 0;
          line-height: 1.15;
        }
        .religion-sub {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.8rem, 2.2vw, 0.9rem);
          color: #7a5a2a;
          text-align: center;
          line-height: 1.5;
          margin: 8px auto 4px;
          max-width: 100%;
        }
        .religion-rule {
          width: 54px;
          height: 2px;
          margin: 8px auto 6px;
          background: linear-gradient(90deg, transparent, #C99A3F, transparent);
          border: none;
        }
        /* 2-stĺpcová mriežka dlaždíc (políčka) */
        .crit-grid {
          margin-top: 8px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .crit-tile {
          position: relative;
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0; /* dovolí grid dlaždici zmenšiť sa (inak min-width:auto → pretečie kartu) */
          text-align: left;
          padding: 8px 12px;
          background: rgba(201,154,63,0.06);
          border: 1px solid rgba(201,154,63,0.35);
          border-radius: 10px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.16s ease, border-color 0.16s ease, transform 0.12s ease;
        }
        .crit-tile:active { transform: scale(0.98); }
        .crit-tile.is-active { box-shadow: inset 0 0 0 2px rgba(201,154,63,0.45); }

        /* SPLNENÉ (done) = MODRÉ ohraničenie + IG-verified odznak + „done" vpravo */
        .crit-tile.is-done {
          border-color: rgba(46,95,208,0.55);
          background: rgba(46,95,208,0.05);
        }
        .crit-tile.is-done:hover { background: rgba(46,95,208,0.10); }

        /* Dolný riadok — 2 NESPLNENÉ = väčšie, plná šírka, červeno-oranžové ohraničenie */
        .crit-blocks {
          margin-top: 8px;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .crit-blocks .crit-tile { padding: 11px 14px; border-width: 2px; border-style: solid; }
        /* Offerings (payment) = ZELENÝ blok */
        .crit-tile.is-open-slot {
          border-color: #2E9E5B;
          background: rgba(46,158,91,0.10);
          box-shadow: 0 3px 14px rgba(46,158,91,0.22);
        }
        .crit-tile.is-open-slot:hover { background: rgba(46,158,91,0.16); }
        /* Legitimacy (členovia) = ŽLTÝ blok */
        .crit-tile.is-soon {
          border-color: #E0A800;
          background: rgba(245,197,24,0.12);
          box-shadow: 0 3px 14px rgba(224,168,0,0.22);
        }
        .crit-tile.is-soon:hover { background: rgba(245,197,24,0.18); }

        .crit-mark { flex-shrink: 0; }
        .crit-mark.done { filter: drop-shadow(0 1px 2px rgba(46,95,208,0.4)); }
        .crit-open-ring { animation: crit-open-pulse 2.4s ease-in-out infinite; transform-origin: center; }
        @keyframes crit-open-pulse {
          0%,100% { opacity: 0.65; }
          50%     { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) { .crit-open-ring { animation: none; } }
        .crit-title-wrap { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .crit-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.92rem, 2.6vw, 1.02rem);
          letter-spacing: 0.02em;
          line-height: 1.2;
          color: #2a1608;
        }
        /* Malý podtitul pod titulom (napr. Offerings „(100% transparency)") */
        .crit-tag {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.62rem;
          font-weight: 600;
          font-style: italic;
          letter-spacing: 0.02em;
          color: #237a46;
          line-height: 1.1;
        }

        /* Pravostranné labely v dlaždici */
        .crit-flag { margin-left: auto; flex-shrink: 0; font-family: 'Space Grotesk', sans-serif; white-space: nowrap; }
        .crit-flag.done {
          font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: #2E5FD0;
        }
        .crit-flag.pill {
          font-size: 0.62rem; font-weight: 800; letter-spacing: 0.05em;
          text-transform: uppercase;
          border: none;
          border-radius: 999px;
          padding: 5px 12px;
        }
        /* Offerings (payment) = ZELENÁ pilulka + biely text */
        .crit-tile.is-open-slot .crit-flag.pill {
          background: #2E9E5B; color: #fff;
          box-shadow: 0 2px 6px rgba(46,158,91,0.45);
        }
        /* Legitimacy (počet členov) = ŽLTÁ pilulka + čierny text */
        .crit-tile.is-soon .crit-flag.pill {
          background: #F5C518; color: #1a0a05;
          box-shadow: 0 2px 6px rgba(230,180,20,0.5);
        }

        /* Bublina nad dlaždicou (klik) — plává nad obsahom, 0 posunu layoutu */
        .crit-pop {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 10px);
          transform: translateX(-50%);
          width: max-content;
          max-width: min(280px, 78vw);
          z-index: 30;
          background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 10px 13px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
          line-height: 1.5;
          color: #5c3e10;
          text-align: left;
          white-space: normal;
          cursor: default;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateX(-50%) translateY(4px);
          transition: opacity 140ms ease, transform 140ms ease, visibility 140ms;
        }
        /* Bublina LEN na PC hover (mobil používa panel na šírku karty — viď .crit-sheet) */
        @media (hover: hover) {
          .crit-tile:hover .crit-pop {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
          }
        }
        .crit-pop::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-top-color: #C99A3F;
        }
        .crit-pop-note { font-style: italic; color: #9c6f1f; }
        @media (prefers-reduced-motion: reduce) {
          .crit-pop { transition: none; transform: translateX(-50%); }
        }

        /* ── MOBIL panel (.crit-sheet) — na šírku karty, centrovaný, s backdropom.
           Fyzicky nemôže vytŕčať z viewportu (žiadne meranie/JS). ──────────── */
        .crit-sheet {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          max-width: 460px;
          z-index: 40;
          background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 14px;
          padding: 18px 18px 14px;
          box-shadow:
            0 12px 40px rgba(0,0,0,0.5),
            0 0 0 3px rgba(201,154,63,0.15),
            0 0 0 100vmax rgba(0,0,0,0.34); /* full-screen backdrop (diera = panel) */
          text-align: left;
          animation: crit-sheet-in 150ms ease;
        }
        .crit-sheet-title {
          display: block;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.05rem;
          letter-spacing: 0.02em;
          color: #2a1608;
          margin-bottom: 6px;
        }
        .crit-sheet-body {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #5c3e10;
        }
        .crit-sheet-note { font-style: italic; color: #9c6f1f; }
        .crit-sheet-hint {
          display: block;
          margin-top: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #b08a3e;
          text-align: center;
        }
        @keyframes crit-sheet-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) { .crit-sheet { animation: none; } }
        /* PC = hover bublina, panel netreba → skry ho */
        @media (hover: hover) { .crit-sheet { display: none; } }
        /* Signed pečať + CTA — vedľa seba (desktop), pod seba (mobile) */
        .entry-cta-wrap {
          margin-top: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(201,154,63,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px 18px;
        }
        .entry-signed {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.86rem;
          color: #7a5a2a;
          margin: 0;
          white-space: nowrap;
        }
        .entry-signed-num {
          font-weight: 700;
          font-size: 1.22em;            /* zväčšené LEN číslo, nie zvyšok vety */
          color: #5c3e10;
          text-decoration: underline;
          text-decoration-style: wavy;  /* vlnovkové podčiarknutie */
          text-decoration-color: #C99A3F;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }
        /* Živá zelená bodka — počet je live zo Supabase (pulz = „práve rastie") */
        .entry-live-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2E9E5B;
          margin-right: 6px;
          vertical-align: middle;
          animation: entry-live-pulse 2s ease-out infinite;
        }
        @keyframes entry-live-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(46,158,91,0.5); }
          70%  { box-shadow: 0 0 0 6px rgba(46,158,91,0); }
          100% { box-shadow: 0 0 0 0 rgba(46,158,91,0); }
        }
        @media (prefers-reduced-motion: reduce) { .entry-live-dot { animation: none; } }
        @media (max-width: 440px) {
          .entry-cta-wrap { flex-direction: column; }
          .entry-cta { width: 100%; }
        }
        /* Mobil: „DONE" label preč — na úzkom stĺpci naň nie je miesto (Matej) */
        @media (max-width: 520px) {
          .crit-flag.done { display: none; }
        }

        /* CTA = PRESNE ako primárne tlačidlo vo FLOW (NameScreen): brand gold
           gradient cez hsl vars + TMAVÝ grounding shadow (žiaden glow — glow = len
           na čiernom pozadí; na papyruse zlatá s tmavým tieňom, podľa brand manuálu). */
        .entry-cta {
          width: auto;
          max-width: 340px;
          padding: 13px 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-dark)));
          border: none;
          border-radius: 12px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(0,0,0,0.35);
          transition: transform 0.2s;
        }
        .cta-feather {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          transform: rotate(-12deg);
          filter: brightness(0); /* zlaté SVG → čierne, sadne na čierny CTA text */
        }
        .entry-cta:hover { transform: scale(1.02); }
        .entry-cta:active { transform: scale(0.98); }
      `}),e.jsx(v,{}),e.jsx("div",{className:"flex-1 flex flex-col items-center justify-center px-2 py-2 relative",style:{zIndex:2},children:e.jsx("section",{className:"religion-section",style:{position:"relative",zIndex:2},children:e.jsxs("div",{className:"religion-card",children:[e.jsxs("p",{className:"religion-eyebrow",children:[e.jsx("img",{src:"/icons/feather-gold.svg",alt:"",className:"eyebrow-icon"}),i("entry.declare.eyebrow")]}),e.jsx("h2",{className:"religion-title",children:i("entry.title")}),e.jsx("hr",{className:"religion-rule"}),e.jsx("p",{className:"religion-sub",children:i("entry.subtitle")}),e.jsx("div",{className:"crit-grid",children:s.map((t,r)=>t.state==="done"?p(t,r):null)}),e.jsx("div",{className:"crit-grid crit-blocks",children:s.map((t,r)=>t.state!=="done"?p(t,r):null)}),n!==null&&e.jsxs("div",{className:"crit-sheet",role:"dialog","aria-modal":"true",onClick:()=>a(null),children:[e.jsx("span",{className:"crit-sheet-title",children:s[n].title}),e.jsxs("p",{className:"crit-sheet-body",children:[s[n].note&&e.jsxs("span",{className:"crit-sheet-note",children:[s[n].note," "]}),s[n].body]}),e.jsx("span",{className:"crit-sheet-hint",children:i("entry.sheet.tapToClose")})]}),e.jsxs("div",{className:"entry-cta-wrap",children:[e.jsxs("p",{className:"entry-signed",children:[e.jsx("span",{className:"entry-live-dot","aria-hidden":!0}),i("entry.signed.prefix")," ",e.jsx("span",{className:"entry-signed-num",children:d!==null?d.toLocaleString("en"):"…"})," ",i("entry.signed.suffix")]}),e.jsxs("button",{onClick:g,className:"entry-cta",children:[e.jsx("img",{src:"/icons/feather-gold.svg",alt:"",className:"cta-feather"}),i("entry.cta")]})]})]})})})]})}export{M as default};
