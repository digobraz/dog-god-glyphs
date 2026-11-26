import{s as d,m as r,L as c,r as x,d as m,j as i}from"./index-DriUOdZL.js";import{L as e}from"./labTheme-DLctEqJ2.js";import{A as g}from"./index-BPi12Ps7.js";import{m as n}from"./proxy-5uIz4xGy.js";function y({open:t,label:p,onClose:o,className:s="",children:f}){return x.useEffect(()=>{if(!t)return;const a=l=>{l.key==="Escape"&&o()};return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)},[t,o]),m.createPortal(i.jsx(g,{children:t&&i.jsxs(n.div,{className:"fm-root",role:"dialog","aria-modal":"true","aria-label":p,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.16},children:[i.jsx("div",{className:"fm-backdrop",onClick:o}),i.jsx(n.div,{className:`fm-card ${s}`,initial:{y:12,scale:.98},animate:{y:0,scale:1},exit:{y:8,scale:.98},transition:{duration:.22,ease:[.2,.8,.3,1.1]},children:f})]},"fm")}),document.body)}const w=`
.fm-root {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  padding: ${d.lg}px;
}
.fm-backdrop {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.78);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.fm-card {
  position: relative; width: 100%; max-width: 520px; max-height: 100%;
  display: flex; flex-direction: column; gap: 12px;
  padding: 18px 22px; border-radius: ${r.card}px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 55%, #EAD7A8 100%);
  border: 1.5px solid rgba(201, 154, 63, 0.55);
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.65);
  container-type: inline-size;
}
.fm-card .hf-cta { flex: 0 0 auto; }
.fp-panel {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; gap: 12px;
  padding: 18px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 55%, #EAD7A8 100%);
}
.fp-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.fp-group { display: flex; flex-direction: column; gap: 8px; }
.fp-head {
  margin: 0; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; color: ${e.inkMuted};
}
.fp-pick .well img { width: 22px; height: 22px; object-fit: contain; }
.fp-pick .tx { flex: 1 1 auto; }
.fp-aside {
  flex: 0 0 auto; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; color: ${e.ink};
}
.fp-chev { flex: 0 0 auto; width: 16px; height: 16px; color: ${e.goldInk}; transition: transform 180ms ease; }
.fp-item.on .fp-pick { border-color: ${e.goldInk}; }
.fp-item.on .fp-chev { transform: rotate(180deg); }
.fp-item.soon .fp-pick { opacity: .6; }
.fp-desc {
  margin: 0; overflow: hidden; padding: 8px 12px 0 56px;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${e.inkBody};
}
.fp-foot {
  margin: 4px 0 0; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; line-height: 1.5;
  letter-spacing: 0.02em; text-transform: uppercase; color: ${e.inkSoft};
}
.fp-panel .hf-cta:focus-visible { outline: 2px solid ${c.edge}; outline-offset: 2px; }
.fp-pick { border-radius: ${r.tile}px; }
`;export{w as F,y as a};
