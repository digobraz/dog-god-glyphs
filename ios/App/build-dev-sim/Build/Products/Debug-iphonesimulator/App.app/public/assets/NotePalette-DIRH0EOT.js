import{b as o,a0 as c,Q as p,u as f,j as t}from"./index-DriUOdZL.js";import{g,N as w}from"./mapNotesData-Bn_974z0.js";import{F as v}from"./markEmoji-Cy-_bP1S.js";import{s as y}from"./SysIcon-CI9hudiL.js";const j=o.cardEdge,N=o.brandBlueLite,h="#CE4B3C",T={parking:N,warning:h,comment:o.growGreen},$="#E08A2E";function z(n,e){return n==="ticks"?e?h:$:T[g(n)]}const E={parking:"/map-marks/parking.webp",warning:"/map-marks/nebezpecenstvo.webp",comment:"/map-marks/komentar.webp"},D={trip:"/map-marks/vylet.webp",event:y("pridaj-podujatie")},u=({src:n,size:e})=>t.jsx("img",{src:n,alt:"","aria-hidden":!0,draggable:!1,style:{width:e,height:e,objectFit:"contain",display:"block"}});function A({group:n,size:e=26}){return t.jsx("span",{className:"np-mark",style:{width:e,height:e,fontSize:Math.round(e*.82)},children:t.jsx(u,{src:E[n],size:e})})}function M({onPick:n,variant:e="blocks",extras:k,onPickExtra:s,blocked:i}){const l=f(),m=(a,r)=>{const d=l(a);return d===a?r:d},x={parking:"Mark a parking or camping spot on the map",warning:"Mark a spot with a danger for dogs on the map",comment:"Mark a spot worth a tip on the map"},b={trip:"Draw a walk with your dog from this spot",event:"Mark where something happens on a set date"};return t.jsxs("div",{className:`np-wrap np-wrap--${e}`,children:[(k??[]).map(a=>t.jsxs("button",{type:"button",className:"np-item",onClick:()=>s==null?void 0:s(a),children:[t.jsx("span",{className:"np-mark",style:{width:e==="blocks"?30:24,height:e==="blocks"?30:24,fontSize:Math.round((e==="blocks"?30:24)*.82)},children:t.jsx(u,{src:D[a],size:e==="blocks"?30:24})}),t.jsx("span",{className:"np-name",children:l(`pack.mapNotes.palette.extra.${a}`)}),e==="blocks"&&t.jsx("span",{className:"np-text",children:m(`pack.mapNotes.palette.extra.${a}.hint`,b[a])})]},a)),w.map(a=>{const r=i==null?void 0:i[a];return t.jsxs("button",{type:"button",className:`np-item${r?" np-item--off":""}`,onClick:()=>{r||n(a)},disabled:!!r,title:r,children:[t.jsx(A,{group:a,size:e==="blocks"?30:24}),t.jsx("span",{className:"np-name",children:l(`pack.mapNotes.group.${a}`)}),e==="blocks"&&t.jsx("span",{className:"np-text",children:r??m(`pack.mapNotes.group.${a}.hint`,x[a])})]},a)})]})}const S=`
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
.np-item:hover{border-color:${j};background:rgba(201,154,63,0.10);transform:translateY(-1px);}
/* Zhasnutá možnosť: nie je to chyba ani čakanie, je to hotová vec inde (výlet už
   parkovisko má). Preto tlmená, nie červená — červená by hovorila „pokazil si to". */
.np-item--off{opacity:.42;cursor:default;}
.np-item--off:hover{border-color:${o.onDarkBorder};background:rgba(245,240,228,0.04);transform:none;}

.np-name{font-family:${c};font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${o.onDark};white-space:nowrap;}
.np-text{font-family:${c};font-size:12px;line-height:1.45;color:${o.onDarkDim};}

.np-mark{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;font-family:${v};line-height:1;-webkit-user-select:none;user-select:none;}
${`
/* ── BLEDÝ SKIN PC (2026-08-26) ─────────────────────────────────────────────────────────
   Paleta stojí v dvoch papyrusových hostiteľoch naraz — vo vstupnom popupe pridávania a
   v doku nad mapou — takže v onDark tokenoch bola na PC DOSLOVA neviditeľná: pilulka mala
   výplň rgba(245,240,228,0.04) a názov svetlý inkoust, teda takmer biele na piesku.
   ⚠️ Media query zanikla 28. 8. 2026 — oba hostitelia sú bledí na každej šírke. */
  .np-item{background:${p.field};border-color:${p.border};}
  .np-item:hover{border-color:${p.deep};background:${o.cardSoft};}
  .np-name{color:${p.ink};}
  .np-text{color:${p.dim};}
`}
/* ŠAT PAPYRUS 3D (Matej 9. 11. 2026, hárok G1 a G2): len pod html.papyrus3d (APP_NEW), web ho nemá.
   Dlaždica odkazu je papierové TLAČIDLO 3D, názov nesie Museum (nadpis), emoji ostáva. */
html.papyrus3d .np-item{min-height:64px;padding:8px 16px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid);}
html.papyrus3d .np-wrap--blocks .np-item{border-radius:16px;}
html.papyrus3d .np-item:hover{border-color:var(--p3d-ink);background:var(--p3d-card);}
html.papyrus3d .np-item--off{box-shadow:none;}
html.papyrus3d .np-wrap{gap:16px;padding-bottom:8px;}
html.papyrus3d .np-name{font-family:'LT Museum',serif;font-weight:400;font-size:20px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .np-text{color:var(--p3d-ink);}
html.papyrus3d .np-mark{width:36px !important;height:36px !important;font-size:24px !important;}
html.papyrus3d .np-mark img{width:36px !important;height:36px !important;}
`;export{T as G,h as H,S as N,$ as T,M as a,z as n};
