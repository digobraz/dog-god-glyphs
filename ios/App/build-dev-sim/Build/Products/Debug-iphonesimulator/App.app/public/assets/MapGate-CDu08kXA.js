import{u as p,j as e,b as m,a0 as i,a1 as l,L as r,c as d,w as x,e as s,r as c}from"./index-DriUOdZL.js";import"./client-_yx8AKEw.js";import{P as k}from"./PageTopBar-3J3L1b0M.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";const t=m,g=`
.mlk-wrap{min-height:100dvh;background:${t.pageBg};display:flex;flex-direction:column;}
.mlk-body{flex:1;display:flex;align-items:center;justify-content:center;padding:24px 16px 48px;}
.mlk-card{width:100%;max-width:460px;padding:32px 24px 24px;text-align:center;}
.mlk-eyebrow{font-family:${i};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${t.cardEdge};}
.mlk-title{font-family:${l};font-weight:700;font-size:24px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase;color:${t.inkStrong};margin-top:10px;}
.mlk-sub{font-family:${i};font-weight:400;font-size:14px;line-height:1.55;color:${t.inkWarm};margin-top:12px;}
.mlk-rule{height:2px;margin:20px 0;background:${t.rule};}
.mlk-actions{display:flex;flex-direction:column;gap:10px;}
/* .btn-gold (brand manuál v3.2 — LOCKED): gradient 135°, radius 8 (NIE pilulka),
   papyrusový rám, zlatý dosvit. Nedoladovať. */
.mlk-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:12px 24px;border-radius:8px;background:${r.grad};border:1px solid ${r.deep};color:${r.ink};font-family:${l};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;box-shadow:${d};transition:transform .2s, box-shadow .22s;}
.mlk-cta:hover{background:${r.gradHover};}
.mlk-cta:active{transform:scale(0.98);}
.mlk-ghost{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;border-radius:8px;background:transparent;border:1px solid ${t.cardEdge};color:${t.inkStrong};font-family:${i};font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;}
.mlk-ghost:hover{background:rgba(201,154,63,0.12);}
`;function f({variant:n}){const a=p(),o=n==="soon";return e.jsxs("div",{className:"mlk-wrap",children:[e.jsx("style",{children:g}),e.jsx(k,{}),e.jsx("div",{className:"mlk-body",children:e.jsxs("div",{className:"mlk-card",style:x.card,children:[e.jsx("div",{className:"mlk-eyebrow",children:a("pack.mapLocked.eyebrow")}),e.jsx("h1",{className:"mlk-title",children:a(o?"pack.mapLocked.soonTitle":"pack.mapLocked.joinTitle")}),e.jsx("p",{className:"mlk-sub",children:a(o?"pack.mapLocked.soonSub":"pack.mapLocked.joinSub")}),e.jsx("div",{className:"mlk-rule"}),e.jsx("div",{className:"mlk-actions",children:o?e.jsx(s,{className:"mlk-cta",to:"/pack",children:a("pack.mapLocked.backToPack")}):e.jsxs(e.Fragment,{children:[e.jsx(s,{className:"mlk-cta",to:"/heroglyph/name",children:a("pack.mapLocked.become")}),e.jsx(s,{className:"mlk-ghost",to:"/login?return=%2Fpack%2Fmap",children:a("pack.mapLocked.alreadyMember")})]})})]})})]})}function E({children:n}){const[a,o]=c.useState("allowed");return c.useEffect(()=>{},[]),a==="loading"?null:a!=="allowed"?e.jsx(f,{variant:a}):e.jsx(e.Fragment,{children:n})}export{E as MapGate};
