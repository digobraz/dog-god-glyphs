import{u as p,j as e,P as m,J as s,K as l,U as r,Q as d,d as i,r as c}from"./index-B-BQrD2y.js";import"./client-rJzPTh-q.js";import{P as x}from"./PageTopBar-CT5LPjhX.js";import"./tslib.es6-CmEaCU22.js";import"./handArrowLeft-DN9pj_cL.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock-Bv8v-6Ri.js";import"./createLucideIcon-B_Tc6GtW.js";import"./LanguagePicker-CQj7MbWL.js";import"./flagUrl-B21iQI9I.js";const t=m,k=`
.mlk-wrap{min-height:100dvh;background:${t.pageBg};display:flex;flex-direction:column;}
.mlk-body{flex:1;display:flex;align-items:center;justify-content:center;padding:24px 16px 48px;}
.mlk-card{width:100%;max-width:460px;padding:32px 24px 24px;text-align:center;}
.mlk-eyebrow{font-family:${s};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${t.cardEdge};}
.mlk-title{font-family:${l};font-weight:700;font-size:24px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase;color:${t.inkStrong};margin-top:10px;}
.mlk-sub{font-family:${s};font-weight:400;font-size:14px;line-height:1.55;color:${t.inkWarm};margin-top:12px;}
.mlk-rule{height:2px;margin:20px 0;background:${t.rule};}
.mlk-actions{display:flex;flex-direction:column;gap:10px;}
/* .btn-gold (brand manuál v3.2 — LOCKED): gradient 135°, radius 8 (NIE pilulka),
   papyrusový rám, zlatý dosvit. Nedoladovať. */
.mlk-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:12px 24px;border-radius:8px;background:${r.grad};border:1px solid ${r.edge};color:#000;font-family:${l};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;box-shadow:${r.glow};transition:transform .2s, box-shadow .22s;}
.mlk-cta:hover{box-shadow:${r.glowHover};}
.mlk-cta:active{transform:scale(0.98);}
.mlk-ghost{display:inline-flex;align-items:center;justify-content:center;padding:12px 24px;border-radius:8px;background:transparent;border:1px solid ${t.cardEdge};color:${t.inkStrong};font-family:${s};font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;}
.mlk-ghost:hover{background:rgba(201,154,63,0.12);}
`;function g({variant:n}){const a=p(),o=n==="soon";return e.jsxs("div",{className:"mlk-wrap",children:[e.jsx("style",{children:k}),e.jsx(x,{}),e.jsx("div",{className:"mlk-body",children:e.jsxs("div",{className:"mlk-card",style:d.card,children:[e.jsx("div",{className:"mlk-eyebrow",children:a("pack.mapLocked.eyebrow")}),e.jsx("h1",{className:"mlk-title",children:a(o?"pack.mapLocked.soonTitle":"pack.mapLocked.joinTitle")}),e.jsx("p",{className:"mlk-sub",children:a(o?"pack.mapLocked.soonSub":"pack.mapLocked.joinSub")}),e.jsx("div",{className:"mlk-rule"}),e.jsx("div",{className:"mlk-actions",children:o?e.jsx(i,{className:"mlk-cta",to:"/pack",children:a("pack.mapLocked.backToPack")}):e.jsxs(e.Fragment,{children:[e.jsx(i,{className:"mlk-cta",to:"/heroglyph/name",children:a("pack.mapLocked.become")}),e.jsx(i,{className:"mlk-ghost",to:"/login?return=%2Fpack%2Fmap",children:a("pack.mapLocked.alreadyMember")})]})})]})})]})}function T({children:n}){const[a,o]=c.useState("allowed");return c.useEffect(()=>{},[]),a==="loading"?null:a!=="allowed"?e.jsx(g,{variant:a}):e.jsx(e.Fragment,{children:n})}export{T as MapGate};
