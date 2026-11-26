import{u as h,g as f,r as u,j as t,e as b,b as o,L as i}from"./index-DriUOdZL.js";import{L as s}from"./labTheme-DLctEqJ2.js";import{S as y,b as k,a as w}from"./smallPageKit-DTqghxbR.js";const v=[{kind:"privacy",path:"/privacy",title:"privacy.title"},{kind:"terms",path:"/terms",title:"terms.title"}];function L({kind:a,count:d,skip:c=[],ids:g={}}){const r=h(),l=f(),p=Array.from({length:d},(e,n)=>n+1).filter(e=>!c.includes(e)).map(e=>({id:g[e]??`${a}-${e}`,n:e,title:r(`${a}.s${e}.title`).replace(/^\s*\d+[.)]\s*/,""),body:r(`${a}.s${e}.body`)}));u.useEffect(()=>{const e=decodeURIComponent(window.location.hash.slice(1));e&&requestAnimationFrame(()=>{var n;return(n=document.getElementById(e))==null?void 0:n.scrollIntoView({block:"start"})})},[]);const m=()=>window.history.length>1?l(-1):l("/"),x=e=>{var n;return(n=document.getElementById(e))==null?void 0:n.scrollIntoView({behavior:"smooth",block:"start"})};return t.jsxs("div",{className:`lg-root${` ${y} lg-p3d`}`,children:[t.jsx(k,{onBack:m,backLabel:r("nav.aria.back")}),t.jsxs("main",{className:"lg-main",children:[t.jsxs("nav",{"aria-label":"Legal",className:"lg-swwrap",children:[t.jsx("div",{className:"pk-p3d-sw lg-sw",children:v.map(e=>t.jsx("button",{type:"button",className:e.kind===a?"on":"","aria-current":e.kind===a?"page":void 0,onClick:()=>e.kind!==a&&l(e.path),children:r(e.title)},e.kind))}),t.jsx("button",{type:"button",className:"lg-cookie",onClick:()=>window.dispatchEvent(new Event("dogypt:open-consent")),children:r("consent.footerLink")})]}),t.jsxs("article",{className:"lg-card",style:void 0,children:[t.jsxs("header",{className:"lg-head",children:[t.jsx("p",{className:"lg-eyebrow",style:void 0,children:r("legal.eyebrow")}),t.jsx("h1",{className:"lg-h1",style:void 0,children:r(`${a}.title`)}),t.jsx("p",{className:"lg-meta",children:r("legal.updated")}),t.jsx("p",{className:"lg-note",children:r("legal.langNote")})]}),t.jsx("ol",{className:"lg-toc",style:void 0,children:p.map(e=>t.jsx("li",{children:t.jsxs("button",{type:"button",onClick:()=>x(e.id),children:[t.jsx("i",{children:e.n}),t.jsx("span",{children:e.title})]})},e.id))}),t.jsx("div",{className:"lg-sections",children:p.map(e=>t.jsxs("section",{id:e.id,className:"lg-sec",children:[t.jsxs("h2",{children:[t.jsx("i",{children:e.n}),e.title]}),t.jsx("p",{children:e.body})]},e.id))}),t.jsxs("footer",{className:"lg-foot",children:[t.jsx("p",{className:"lg-motto",style:void 0,children:r("legal.motto")}),t.jsx(b,{to:a==="privacy"?"/terms":"/privacy",className:"lg-other",children:r(a==="privacy"?"privacy.linkTerms":"terms.linkPrivacy")})]})]}),t.jsx("p",{className:"lg-copy",children:"© 2026 DOGYPT"})]}),t.jsx("style",{children:w+j}),t.jsx("style",{children:`
        .lg-root { min-height: 100vh; background: ${s.pageBg}; position: relative; color: ${o.ink}; }
        .lg-root::before { content: ''; position: fixed; inset: 0; background: ${s.pageBackdrop}; pointer-events: none; }
        .lg-root > * { position: relative; }
        .lg-main { width: min(760px, 100%); margin: 0 auto; padding: 24px 16px 48px; display: flex; flex-direction: column; gap: 16px; }

        .lg-tabs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
        .lg-tab {
          height: 40px; padding: 0 16px; border-radius: 999px; display: inline-flex; align-items: center;
          border: 1px solid ${o.border}; background: rgba(251,245,230,.6); color: ${o.inkWarm};
          font: 500 12px/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none; cursor: pointer; transition: border-color .2s ease, color .2s ease;
        }
        .lg-tab:hover { border-color: ${o.cardEdge}; color: ${o.inkStrong}; }
        .lg-tab.is-on { background: ${o.panelGrad}; border-color: ${o.cardEdge}; color: ${o.inkStrong}; box-shadow: 0 1px 3px rgba(122,90,42,.18); }

        .lg-card { padding: 48px; }
        .lg-head { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .lg-eyebrow { margin: 0; color: ${o.cardEdge}; }
        .lg-h1 { margin: 0; color: ${o.inkStrong}; line-height: 1.25; position: relative; padding-bottom: 16px; }
        .lg-h1::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 160px; height: 2px; background: ${o.rule}; }
        .lg-meta { margin: 8px 0 0; font: 500 12px/1.4 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: ${o.inkDim}; }
        .lg-note { margin: 0; font: 400 12px/1.5 'Space Grotesk', sans-serif; font-style: italic; color: ${o.inkFaint}; max-width: 520px; }

        .lg-toc { list-style: none; margin: 32px 0; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
        .lg-toc button {
          width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px; border: 0; border-radius: 8px;
          background: none; cursor: pointer; text-align: left; color: ${o.inkStrong};
          font: 400 14px/1.3 'Space Grotesk', sans-serif; transition: background .2s ease, color .2s ease;
        }
        .lg-toc button:hover { background: ${i.fill}; color: ${i.edge}; }
        .lg-toc i, .lg-sec h2 i {
          flex: 0 0 auto; width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center;
          font: 700 12px/1 'Cinzel', serif; font-style: normal; color: ${i.edge}; border: 1.5px solid ${i.edge};
        }

        .lg-sections { display: flex; flex-direction: column; gap: 32px; }
        .lg-sec { scroll-margin-top: 24px; }
        .lg-sec h2 {
          margin: 0 0 8px; display: flex; align-items: center; gap: 12px; color: ${o.inkStrong};
          font: 700 16px/1.3 'Cinzel', serif; letter-spacing: .04em; text-transform: uppercase;
        }
        .lg-sec p { margin: 0; padding-left: 36px; font: 400 16px/1.7 'Space Grotesk', sans-serif; color: ${s.ink}; white-space: pre-line; }

        .lg-foot {
          margin-top: 48px; padding-top: 24px; border-top: 1px solid ${o.hairline};
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
        }
        .lg-motto { margin: 0; color: ${o.inkDim}; }
        .lg-other {
          color: ${i.edge}; text-decoration: none; font: 700 14px/1 'Cinzel', serif; letter-spacing: .14em; text-transform: uppercase;
          border-bottom: 1.5px solid ${i.halo}; padding-bottom: 4px; transition: border-color .2s ease;
        }
        .lg-other:hover { border-color: ${i.edge}; }
        .lg-copy { margin: 0; text-align: center; font: 400 12px/1 'Space Grotesk', sans-serif; color: ${o.inkFaint}; }

        @media (max-width: 768px) {
          .lg-main { padding: 16px 16px 32px; }
          .lg-card { padding: 24px 16px; }
          .lg-toc { grid-template-columns: 1fr; margin: 24px 0; padding: 8px; }
          .lg-sections { gap: 24px; }
          .lg-sec p { padding-left: 0; font-size: 14px; }
        }
      `})]})}const j=`
html.papyrus3d .lg-p3d{background-color:var(--p3d-paper);}
html.papyrus3d .lg-p3d .lg-main{padding-top:16px;}
html.papyrus3d .lg-swwrap{display:flex;flex-direction:column;align-items:center;gap:12px;}
html.papyrus3d .lg-sw{width:100%;max-width:480px;}
html.papyrus3d .lg-sw>button{height:auto;min-height:50px;padding:8px;font-size:16px;line-height:1.1;text-align:center;}
html.papyrus3d .lg-cookie{border:0;background:none;cursor:pointer;padding:8px;font:500 14px/1 'Space Grotesk',sans-serif;color:var(--p3d-gold-ink);text-decoration:underline;text-underline-offset:4px;}
/* Matej 15. 11. 2026: „podmienky a ochrana daj na celú obrazovku nie blok“ — text leží priamo na papyruse, bez karty. */
html.papyrus3d .lg-card{background:none;border:0;border-radius:0;box-shadow:none;padding:0;}
html.papyrus3d .lg-main{padding-bottom:48px;}
@media (min-width:768px){html.papyrus3d .lg-p3d .lg-main{padding-top:24px;}}
html.papyrus3d .lg-eyebrow,html.papyrus3d .lg-meta{font:500 12px/1.4 'Space Grotesk',sans-serif;letter-spacing:.02em;text-transform:uppercase;color:var(--p3d-gold-ink);}
html.papyrus3d .lg-h1{font-family:'LT Museum',serif;font-weight:400;font-size:24px;letter-spacing:.01em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .lg-h1::after{background:var(--p3d-gold);height:2.5px;}
html.papyrus3d .lg-note{color:var(--p3d-ink);}
html.papyrus3d .lg-toc{background:none;border:0;border-top:1.5px solid var(--p3d-gold);border-bottom:1.5px solid var(--p3d-gold);border-radius:0;box-shadow:none;padding:16px 0;}
html.papyrus3d .lg-sec h2{font-family:'LT Museum',serif;font-weight:400;font-size:20px;letter-spacing:.01em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .lg-motto{font-family:'LT Museum',serif;font-weight:400;font-size:16px;letter-spacing:.01em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .lg-other{font-family:'LT Museum',serif;font-weight:400;font-size:16px;letter-spacing:.01em;text-transform:none;}
@media (max-width:768px){html.papyrus3d .lg-main{padding-top:8px;}}
`;export{L};
