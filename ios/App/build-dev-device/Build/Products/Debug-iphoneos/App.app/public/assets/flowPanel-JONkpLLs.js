import{F as d,k as c,L as x,r as p,c as m,j as s}from"./index-B-BQrD2y.js";import{L as r}from"./labTheme-p7t_6k9Y.js";import{A as u}from"./index-C2vp2UEa.js";import{m as l}from"./proxy-wes7Zgjy.js";function E({label:e,onClose:i,className:t="",children:o}){const n=g(i);return s.jsx(l.div,{ref:n,className:`fp-panel ${t}`,role:"dialog","aria-label":e,initial:{opacity:0,scale:.98},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.98},transition:{duration:.2},children:o})}function w({open:e,label:i,onClose:t,className:o="",children:n}){return p.useEffect(()=>{if(!e)return;const a=f=>{f.key==="Escape"&&t()};return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)},[e,t]),m.createPortal(s.jsx(u,{children:e&&s.jsxs(l.div,{className:"fm-root",role:"dialog","aria-modal":"true","aria-label":i,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{duration:.16},children:[s.jsx("div",{className:"fm-backdrop",onClick:t}),s.jsx(l.div,{className:`fm-card ${o}`,initial:{y:12,scale:.98},animate:{y:0,scale:1},exit:{y:8,scale:.98},transition:{duration:.22,ease:[.2,.8,.3,1.1]},children:n})]},"fm")}),document.body)}function g(e){const i=p.useRef(null);return p.useEffect(()=>{const t=n=>{const a=n.target;a instanceof Element&&a.closest("[data-panel-keep]")||i.current&&!i.current.contains(a)&&e()},o=n=>{n.key==="Escape"&&e()};return document.addEventListener("pointerdown",t),document.addEventListener("keydown",o),()=>{document.removeEventListener("pointerdown",t),document.removeEventListener("keydown",o)}},[e]),i}const v=`
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
  padding: 18px 22px; border-radius: ${c.card}px;
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
  letter-spacing: 0.22em; text-transform: uppercase; color: ${r.inkMuted};
}
.fp-pick .well img { width: 22px; height: 22px; object-fit: contain; }
.fp-pick .tx { flex: 1 1 auto; }
.fp-aside {
  flex: 0 0 auto; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14px; color: ${r.ink};
}
.fp-chev { flex: 0 0 auto; width: 16px; height: 16px; color: ${r.goldInk}; transition: transform 180ms ease; }
.fp-item.on .fp-pick { border-color: ${r.goldInk}; }
.fp-item.on .fp-chev { transform: rotate(180deg); }
.fp-item.soon .fp-pick { opacity: .6; }
.fp-desc {
  margin: 0; overflow: hidden; padding: 8px 12px 0 56px;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; line-height: 1.45; color: ${r.inkBody};
}
.fp-foot {
  margin: 4px 0 0; text-align: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px; line-height: 1.5;
  letter-spacing: 0.02em; text-transform: uppercase; color: ${r.inkSoft};
}
.fp-panel .hf-cta:focus-visible { outline: 2px solid ${x.edge}; outline-offset: 2px; }
.fp-pick { border-radius: ${c.tile}px; }
`;export{v as F,w as a,E as b};
