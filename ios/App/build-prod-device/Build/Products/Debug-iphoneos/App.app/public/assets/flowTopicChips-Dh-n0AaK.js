import{B as t,j as e}from"./index-7PctGTam.js";function p({items:i,current:o,onGo:a}){return e.jsx("div",{className:"ftc-row",children:i.map((s,r)=>e.jsxs("button",{type:"button",className:`ftc-chip ${s.state}${r===o?" on":""}`,onClick:()=>a(r),children:[e.jsxs("span",{className:"ftc-st","aria-hidden":!0,children:[s.state==="done"&&e.jsxs("svg",{viewBox:"0 0 16 16",width:"14",height:"14",children:[e.jsx("circle",{cx:"8",cy:"8",r:"8",fill:"#3D7A4E"}),e.jsx("path",{d:"M4.4 8.3 6.9 10.7 11.6 5.6",fill:"none",stroke:"#fff",strokeWidth:"1.9",strokeLinecap:"round",strokeLinejoin:"round"})]}),s.state==="miss"&&e.jsxs("svg",{viewBox:"0 0 16 16",width:"14",height:"14",children:[e.jsx("circle",{cx:"8",cy:"8",r:"8",fill:"#B25640"}),e.jsx("path",{d:"M8 4.2v4.6",stroke:"#fff",strokeWidth:"1.9",strokeLinecap:"round"}),e.jsx("circle",{cx:"8",cy:"11.4",r:"1.1",fill:"#fff"})]})]}),e.jsx("span",{className:"ftc-lb",children:s.label})]},s.key))})}const n=`
/* Na mobile 2×2, od 560 px jeden rad štyroch (Matej 24. 9.: rad štyroch sa na
   390 px zalamoval podľa dĺžky prekladu). */
.ftc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
@media (min-width: 560px) { .ftc-row { grid-template-columns: repeat(4, 1fr); } }
.ftc-chip {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 30px; padding: 4px 8px; border-radius: 999px; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-weight: 600;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  background: ${t.grad};
  border: 1px solid ${t.edge};
  color: ${t.ink};
  box-shadow: ${t.glow};
  transition: transform 0.12s ease, box-shadow 0.16s ease;
}
.ftc-chip:hover { background: ${t.gradHover}; }
.ftc-chip:active { transform: scale(0.97); }
/* Miesto pre značku je VŽDY — keby pribudla až po vyplnení, názov by poskočil. */
.ftc-st { flex: 0 0 14px; width: 14px; height: 14px; display: grid; place-items: center; }
.ftc-st svg { display: block; filter: drop-shadow(0 1px 1px rgba(40, 24, 4, 0.35)); }
.ftc-chip.todo .ftc-st { visibility: hidden; }
.ftc-lb { white-space: nowrap; margin-right: -0.08em; }
/* Kde stojím = prstenec okolo zlata (papyrusová medzera + lapisová obruč). */
.ftc-chip.on { box-shadow: 0 0 0 2px #FBF5E6, 0 0 0 4px #16307A, ${t.glow}; }
`;export{n as F,p as T};
