import{P as o,U as k,T as h,Z as s,u as x,j as t}from"./index-7PctGTam.js";import{g as b,N as g}from"./mapNotesData-BT8C1Ysp.js";const E="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji','Twemoji Mozilla',sans-serif",c={parking:"🅿️",ticks:"🩸",wildlife:"🦌",viper:"🐍",bear:"🐻",sheepdog:"🐑",ladders:"⛓️",algae:"🦠",noentry:"🚫",hazard:"⚠️",note:"🐶",cablecar:"🚡",water:"💧",viewpoint:"👁️"},w={parking:"🅿️",warning:"⚠️",comment:"🐶"},M={spring:"💧",viewpoint:"👁️",shelter:"🛖",bench:"🪑",saddle:"🚩",waterfall:"💦",cave:"🦇",tower:"🗼",firepit:"🔥",cliff:"🗻"},m={hut:"🛏️",camp:"⛺",bivak:"🛖",wild:"🌙"};function R(n){const e=n.startsWith("sleep_")?n.slice(6):n;return m[e]??m.hut}function A(n){return c[n]??c.hazard}const j=o.brandBlueLite,P="#4A3826",z="📍",d={race:"🏁",show:"🏆",training:"🎖️",lecture:"🎓",social_walk:"🐕",charity:"❤️",camp:"🏫",expo:"🎪"};function D(n){return d[n]??d.expo}const S="🎯",C=j,v=o.cardEdge,N=o.brandBlueLite,u="#CE4B3C",_={parking:N,warning:u,comment:o.growGreen},O="#E08A2E";function L(n,e){return n==="ticks"?e?u:O:_[b(n)]}function T({group:n,size:e=26}){return t.jsx("span",{className:"np-mark",style:{width:e,height:e,fontSize:Math.round(e*.82)},children:w[n]})}const y={trip:"🥾",event:"📣"};function G({onPick:n,variant:e="blocks",extras:f,onPickExtra:p,blocked:l}){const i=x();return t.jsxs("div",{className:`np-wrap np-wrap--${e}`,children:[(f??[]).map(a=>t.jsxs("button",{type:"button",className:"np-item",onClick:()=>p==null?void 0:p(a),children:[t.jsx("span",{className:"np-mark",style:{width:e==="blocks"?30:24,height:e==="blocks"?30:24,fontSize:Math.round((e==="blocks"?30:24)*.82)},children:y[a]}),t.jsx("span",{className:"np-name",children:i(`pack.mapNotes.palette.extra.${a}`)}),e==="blocks"&&t.jsx("span",{className:"np-text",children:i(`pack.mapNotes.palette.extra.${a}.text`)})]},a)),g.map(a=>{const r=l==null?void 0:l[a];return t.jsxs("button",{type:"button",className:`np-item${r?" np-item--off":""}`,onClick:()=>{r||n(a)},disabled:!!r,title:r,children:[t.jsx(T,{group:a,size:e==="blocks"?30:24}),t.jsx("span",{className:"np-name",children:i(`pack.mapNotes.group.${a}`)}),e==="blocks"&&t.jsx("span",{className:"np-text",children:r??i(`pack.mapNotes.group.${a}.text`)})]},a)})]})}const J=`
.np-wrap{display:flex;}
.np-wrap--blocks{gap:12px;align-items:stretch;}
.np-wrap--strip{gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;}
/* V zalomenom rade nesmie pilulka rásť do celej šírky — inak posledná v riadku
   vyzerá ako iný prvok než jej dve dvojičky nad ňou. */
.np-wrap--strip .np-item{flex:0 1 auto;}
@media (max-width:560px){.np-wrap--blocks{flex-direction:column;}}

.np-item{flex:1 1 0;display:flex;align-items:center;gap:10px;background:rgba(245,240,228,0.04);border:1px solid ${o.onDarkBorder};border-radius:12px;cursor:pointer;transition:border-color .16s,background .16s,transform .16s;}
.np-wrap--blocks .np-item{flex-direction:column;align-items:flex-start;gap:8px;padding:16px 16px;text-align:left;}
.np-wrap--strip .np-item{padding:8px 12px 8px 8px;border-radius:999px;}
.np-item:hover{border-color:${v};background:rgba(201,154,63,0.10);transform:translateY(-1px);}
/* Zhasnutá možnosť: nie je to chyba ani čakanie, je to hotová vec inde (výlet už
   parkovisko má). Preto tlmená, nie červená — červená by hovorila „pokazil si to". */
.np-item--off{opacity:.42;cursor:default;}
.np-item--off:hover{border-color:${o.onDarkBorder};background:rgba(245,240,228,0.04);transform:none;}

.np-name{font-family:${k};font-weight:700;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${o.onDark};white-space:nowrap;}
.np-text{font-family:${h};font-size:12px;line-height:1.45;color:${o.onDarkDim};}

.np-mark{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;font-family:${E};line-height:1;-webkit-user-select:none;user-select:none;}
${`
/* ── BLEDÝ SKIN PC (2026-08-26) ─────────────────────────────────────────────────────────
   Paleta stojí v dvoch papyrusových hostiteľoch naraz — vo vstupnom popupe pridávania a
   v doku nad mapou — takže v onDark tokenoch bola na PC DOSLOVA neviditeľná: pilulka mala
   výplň rgba(245,240,228,0.04) a názov svetlý inkoust, teda takmer biele na piesku.
   ⚠️ Media query zanikla 28. 8. 2026 — oba hostitelia sú bledí na každej šírke. */
  .np-item{background:${s.field};border-color:${s.border};}
  .np-item:hover{border-color:${s.deep};background:${o.cardSoft};}
  .np-name{color:${s.ink};}
  .np-text{color:${s.dim};}
`}
`;export{j as E,E as F,w as G,u as H,c as M,J as N,M as P,z as T,C as W,S as a,_ as b,P as c,O as d,D as e,G as f,L as n,R as s,A as t};
