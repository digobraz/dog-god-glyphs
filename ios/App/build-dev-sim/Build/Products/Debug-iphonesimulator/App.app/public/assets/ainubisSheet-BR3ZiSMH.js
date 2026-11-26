import{i as m,j as e,O as b,a0 as a,a1 as d,ay as l,d as g,aN as x}from"./index-DriUOdZL.js";import{u}from"./useSheetSwipe-Ch0ng1WW.js";const o=b,h=m,c=h,f=`
.msg-modsheet{position:fixed;inset:0;z-index:1400;background:rgba(2,6,11,0.74);display:flex;align-items:flex-end;justify-content:center;}
.msg-modpanel{width:100%;max-width:460px;background:${o.surface};border:1px solid ${o.edgeStrong};border-bottom:0;border-radius:16px 16px 0 0;box-shadow:${o.panelShadow};padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);box-sizing:border-box;}
@media(min-width:600px){
  .msg-modsheet{align-items:center;padding:24px;}
  /* V strede okna panel stojí celý, teda má aj spodnú hranu a všetky štyri rohy oblé. */
  .msg-modpanel{border-bottom:1px solid ${o.edgeStrong};border-radius:16px;padding:16px;max-height:calc(100dvh - 48px);overflow-y:auto;}
}
/* Hlava a meno hovoria, KTO to rieši — bez nich je to len tmavý panel bez majiteľa. */
.msg-modwho{display:flex;align-items:center;gap:11px;margin-bottom:13px;}
.msg-modface{flex:0 0 auto;width:38px;height:38px;object-fit:contain;border-radius:50%;background:${o.faceBg};box-shadow:${o.faceRing};}
.msg-modwho b{font-family:${d};font-weight:700;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${o.ink};}
.msg-modtitle{font-family:${d};font-weight:700;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:${o.ink};}
.msg-modsub{font-family:${a};font-size:12px;line-height:1.55;color:${o.inkDim};margin-top:6px;}
.msg-modrow{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
/* Voľba dôvodu: vybraný svieti CYAN, nie lapisom — na jeho povrchu je lapis neviditeľný
   (tmavá modrá na tmavej modrej) a zároveň by to bol hlas appky v jeho paneli. */
.msg-modbtn{width:100%;text-align:left;font-family:${a};font-size:13px;padding:12px 14px;border-radius:10px;background:${o.raised};border:1px solid ${o.edge};color:${o.inkDim};cursor:pointer;transition:border-color .15s,background .15s,color .15s;}
.msg-modbtn:hover{border-color:${o.edgeStrong};color:${o.ink};}
.msg-modbtn.on{border-color:${o.cyan};color:${o.ink};background:rgba(91,224,240,0.14);box-shadow:inset 0 0 0 1px rgba(91,224,240,0.45);}
.msg-modbtn--danger{color:${o.danger};}
.msg-modbtn--danger:hover{border-color:${o.danger};color:${o.danger};background:rgba(255,138,122,0.10);}
.msg-modnote{width:100%;box-sizing:border-box;margin-top:10px;min-height:74px;background:rgba(2,8,14,0.55);border:1px solid ${o.edge};border-radius:10px;padding:11px 13px;color:${o.ink};font-family:${a};font-size:13px;outline:0;resize:vertical;}
.msg-modnote::placeholder{color:${o.inkFaint};}
.msg-modnote:focus{border-color:${o.cyan};box-shadow:0 0 0 3px rgba(91,224,240,0.20);}
.msg-modsend{width:100%;margin-top:12px;font-family:${d};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:8px;background:${o.ctaGrad};color:${o.ctaInk};border:1px solid ${l.edge};box-shadow:${o.ctaShadow};cursor:pointer;}
.msg-modsend:hover:not(:disabled){background:${o.ctaGradHover};}
.msg-modsend:disabled{background:rgba(91,224,240,0.10);color:${o.inkFaint};border-color:${o.edge};box-shadow:none;cursor:default;}
.msg-modcancel{width:100%;margin-top:8px;background:none;border:0;color:${o.inkFaint};font-family:${a};font-size:12.5px;padding:9px;cursor:pointer;}
.msg-modcancel:hover{color:${o.ink};}
`;function $(){return e.jsxs("div",{className:"msg-modwho",children:[e.jsx("img",{className:"msg-modface",src:c,alt:"","aria-hidden":"true"}),e.jsxs("b",{children:[e.jsx("span",{style:{color:o.aiInk,textShadow:o.aiShadow},children:"AI"}),"NUBIS"]})]})}function j({onClose:i,children:r}){const t=u(i);return g.createPortal(e.jsxs(e.Fragment,{children:[e.jsxs("style",{children:[f,x]}),e.jsx("div",{className:"msg-modsheet",role:"dialog","aria-modal":"true",onClick:n=>{n.target===n.currentTarget&&i()},children:e.jsxs("div",{className:"msg-modpanel",style:t.sheetStyle,children:[e.jsx("div",{className:"msg-modtop",...t.handle,children:e.jsx("span",{className:"pk-grab","aria-hidden":!0})}),e.jsx($,{}),r]})})]}),document.body)}const k=`
.ain-bubble{display:flex;gap:10px;align-items:flex-start;background:${o.surface};border:1px solid ${o.edgeStrong};border-radius:12px;box-shadow:${o.panelShadow};padding:12px;color:${o.inkDim};font-family:${a};font-size:12px;line-height:1.5;}
.ain-bubble img{flex:0 0 auto;width:32px;height:32px;object-fit:contain;border-radius:50%;background:${o.faceBg};box-shadow:${o.faceRing};}
.ain-face-btn{flex:0 0 auto;width:32px;height:32px;padding:0;margin:0;border:0;border-radius:50%;background:none;cursor:pointer;line-height:0;}
.ain-face-btn:focus-visible{outline:2px solid ${o.edgeStrong};outline-offset:3px;}
.ain-face-btn img{display:block;}
.ain-face-btn--pulse{animation:ain-face-pulse 2.4s ease-in-out infinite;}
@keyframes ain-face-pulse{0%,100%{box-shadow:0 0 0 0 rgba(91,224,240,0);}50%{box-shadow:0 0 0 5px rgba(91,224,240,0.22);}}
@media (prefers-reduced-motion: reduce){.ain-face-btn--pulse{animation:none;}}
.ain-bubble b{display:block;font-family:${a};font-weight:600;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${o.ink};margin-bottom:4px;}
.ain-bubble .ain-cta{margin-top:12px;font-family:${d};font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:${o.ctaGrad};color:${o.ctaInk};border:1px solid ${l.edge};box-shadow:${o.ctaShadow};cursor:pointer;}
.ain-bubble .ain-cta:disabled{opacity:.6;cursor:default;}
`;function S({children:i,className:r,role:t,onOpen:n,pulse:p}){const s=e.jsx("img",{src:c,alt:"","aria-hidden":"true"});return e.jsxs("div",{className:`ain-bubble${r?` ${r}`:""}`,role:t,children:[e.jsx("style",{children:k}),n?e.jsx("button",{type:"button",className:`ain-face-btn${p?" ain-face-btn--pulse":""}`,"aria-label":"Opýtať sa AINUBISA",onClick:n,children:s}):s,e.jsxs("div",{children:[e.jsxs("b",{children:[e.jsx("span",{style:{color:o.aiInk,textShadow:o.aiShadow},children:"AI"}),"NUBIS"]}),i]})]})}export{h as A,$ as a,S as b,j as c,f as d};
