import{u as f,i as b,j as e,g,X as d,a0 as i,P as a,L as n}from"./index-7PctGTam.js";import{P as u}from"./PageTopBar-DlESgG9R.js";import{L as s}from"./labTheme-p7t_6k9Y.js";const y=[{kind:"privacy",path:"/privacy",title:"privacy.title"},{kind:"terms",path:"/terms",title:"terms.title"}];function v({kind:r,count:x}){const o=f(),c=b(),p=Array.from({length:x},(t,l)=>({id:`${r}-${l+1}`,n:l+1,title:o(`${r}.s${l+1}.title`).replace(/^\s*\d+[.)]\s*/,""),body:o(`${r}.s${l+1}.body`)})),m=()=>window.history.length>1?c(-1):c("/"),h=t=>{var l;return(l=document.getElementById(t))==null?void 0:l.scrollIntoView({behavior:"smooth",block:"start"})};return e.jsxs("div",{className:"lg-root",children:[e.jsx(u,{brandBack:!0,onBack:m,backAriaLabel:o("nav.aria.back")}),e.jsxs("main",{className:"lg-main",children:[e.jsxs("nav",{className:"lg-tabs","aria-label":"Legal",children:[y.map(t=>e.jsx(g,{to:t.path,className:`lg-tab${t.kind===r?" is-on":""}`,"aria-current":t.kind===r?"page":void 0,children:o(t.title)},t.kind)),e.jsx("button",{type:"button",className:"lg-tab",onClick:()=>window.dispatchEvent(new Event("dogypt:open-consent")),children:o("consent.footerLink")})]}),e.jsxs("article",{className:"lg-card",style:{...d.card},children:[e.jsxs("header",{className:"lg-head",children:[e.jsx("p",{className:"lg-eyebrow",style:{...i.label},children:o("legal.eyebrow")}),e.jsx("h1",{className:"lg-h1",style:{...i.card},children:o(`${r}.title`)}),e.jsx("p",{className:"lg-meta",children:o("legal.updated")}),e.jsx("p",{className:"lg-note",children:o("legal.langNote")})]}),e.jsx("ol",{className:"lg-toc",style:{...d.subblock},children:p.map(t=>e.jsx("li",{children:e.jsxs("button",{type:"button",onClick:()=>h(t.id),children:[e.jsx("i",{children:t.n}),e.jsx("span",{children:t.title})]})},t.id))}),e.jsx("div",{className:"lg-sections",children:p.map(t=>e.jsxs("section",{id:t.id,className:"lg-sec",children:[e.jsxs("h2",{children:[e.jsx("i",{children:t.n}),t.title]}),e.jsx("p",{children:t.body})]},t.id))}),e.jsxs("footer",{className:"lg-foot",children:[e.jsx("p",{className:"lg-motto",style:{...i.label},children:o("legal.motto")}),e.jsx(g,{to:r==="privacy"?"/terms":"/privacy",className:"lg-other",children:o(r==="privacy"?"privacy.linkTerms":"terms.linkPrivacy")})]})]}),e.jsx("p",{className:"lg-copy",children:"© 2026 DOGYPT"})]}),e.jsx("style",{children:`
        .lg-root { min-height: 100vh; background: ${s.pageBg}; position: relative; color: ${a.ink}; }
        .lg-root::before { content: ''; position: fixed; inset: 0; background: ${s.pageBackdrop}; pointer-events: none; }
        .lg-root > * { position: relative; }
        .lg-main { width: min(760px, 100%); margin: 0 auto; padding: 24px 16px 48px; display: flex; flex-direction: column; gap: 16px; }

        .lg-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .lg-tab {
          height: 40px; padding: 0 16px; border-radius: 999px; display: inline-flex; align-items: center;
          border: 1px solid ${a.border}; background: rgba(251,245,230,.6); color: ${a.inkWarm};
          font: 500 12px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: border-color .2s ease, color .2s ease;
        }
        .lg-tab:hover { border-color: ${a.cardEdge}; color: ${a.inkStrong}; }
        .lg-tab.is-on { background: ${a.panelGrad}; border-color: ${a.cardEdge}; color: ${a.inkStrong}; box-shadow: 0 1px 3px rgba(122,90,42,.18); }

        .lg-card { padding: 48px; }
        .lg-head { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .lg-eyebrow { margin: 0; color: ${a.cardEdge}; }
        .lg-h1 { margin: 0; color: ${a.inkStrong}; line-height: 1.25; position: relative; padding-bottom: 16px; }
        .lg-h1::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 160px; height: 2px; background: ${a.rule}; }
        .lg-meta { margin: 8px 0 0; font: 500 12px/1.4 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${a.inkDim}; }
        .lg-note { margin: 0; font: 400 12px/1.5 'Space Grotesk', sans-serif; font-style: italic; color: ${a.inkFaint}; max-width: 520px; }

        .lg-toc { list-style: none; margin: 32px 0; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
        .lg-toc button {
          width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px; border: 0; border-radius: 8px;
          background: none; cursor: pointer; text-align: left; color: ${a.inkStrong};
          font: 400 14px/1.3 'Space Grotesk', sans-serif; transition: background .2s ease, color .2s ease;
        }
        .lg-toc button:hover { background: ${n.fill}; color: ${n.edge}; }
        .lg-toc i, .lg-sec h2 i {
          flex: 0 0 auto; width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
          font: 700 12px/1 'Cinzel', serif; font-style: normal; color: ${n.edge}; border: 1.5px solid ${n.edge};
        }

        .lg-sections { display: flex; flex-direction: column; gap: 32px; }
        .lg-sec { scroll-margin-top: 24px; }
        .lg-sec h2 {
          margin: 0 0 8px; display: flex; align-items: center; gap: 12px; color: ${a.inkStrong};
          font: 700 16px/1.3 'Cinzel', serif; letter-spacing: .04em; text-transform: uppercase;
        }
        .lg-sec p { margin: 0; padding-left: 36px; font: 400 16px/1.7 'Space Grotesk', sans-serif; color: ${s.ink}; white-space: pre-line; }

        .lg-foot {
          margin-top: 48px; padding-top: 24px; border-top: 1px solid ${a.hairline};
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
        }
        .lg-motto { margin: 0; color: ${a.inkDim}; }
        .lg-other {
          color: ${n.edge}; text-decoration: none; font: 700 14px/1 'Cinzel', serif; letter-spacing: .14em; text-transform: uppercase;
          border-bottom: 1.5px solid ${n.halo}; padding-bottom: 4px; transition: border-color .2s ease;
        }
        .lg-other:hover { border-color: ${n.edge}; }
        .lg-copy { margin: 0; text-align: center; font: 400 12px/1 'Space Grotesk', sans-serif; color: ${a.inkFaint}; }

        @media (max-width: 768px) {
          .lg-main { padding: 16px 16px 32px; }
          .lg-card { padding: 24px 16px; }
          .lg-toc { grid-template-columns: 1fr; margin: 24px 0; padding: 8px; }
          .lg-sections { gap: 24px; }
          .lg-sec p { padding-left: 0; font-size: 14px; }
        }
      `})]})}export{v as L};
