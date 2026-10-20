import{af as E,ae as V,aj as Y,u as _,r as o,j as e,c as W}from"./index-7PctGTam.js";import q from"./CHINESE_SIGN-DOG-BLwMUyg_.js";import U from"./CHARACTER-LOVER-PeZ6v7_e.js";import J from"./CHARACTER-PLAYER-Cv1vUfcU.js";import Q from"./CHARACTER-GUARDIAN-DUFYOjrr.js";import Z from"./CHARACTER-GOURMET-D0Ns93ty.js";import ee from"./CHARACTER-WATERLOVER-B6ix-Wlz.js";import te from"./CHARACTER-CHILLER-UcQ8Gv72.js";const A="/images/hektor-kniha",d=[{n:0,media:["k0-zrkadlo"]},{n:1,media:["k1-kresba","k1-f1","k1-f2"]},{n:2,media:["k2-kresba","k2-f1","k2-f2","k2-f3","k2-f4","k2-f5","k2-f6","k2-f7","k2-f8"]},{n:3,media:["k3-kresba","k3-f1","k3-f2","k3-f3","k3-f4"]},{n:4,media:["k4-kresba","k4-f1","k4-f2","k4-f3","k4-f4","k4-f5","k4-f6","k4-f7","k4-f8","k4-f9","k4-f10","k4-f11","k4-f12"]},{n:5,media:["k5-kresba","k5-f1","k5-f2","k5-f3","k5-f4","k5-f5"]}],X=[q,U,J,Q,Z,ee,te],ae=`
.hb-veil {
  position: fixed; inset: 0; z-index: 140;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 72px 16px 24px;
  background: rgba(14, 9, 3, 0.66);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  animation: hbIn 260ms ease;
}
@keyframes hbIn { from { opacity: 0; } to { opacity: 1; } }
.hb-back {
  position: fixed; top: 16px; right: 16px; z-index: 2;
  height: 42px; padding: 0 20px; border-radius: 999px;
  font: 500 12px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase;
  background: ${E.activeFill};
  border: ${V.line}px solid ${E.edge};
  box-shadow: ${Y};
  color: ${E.ink};
  cursor: pointer;
}
.hb-stage { position: relative; width: min(1120px, calc(100% - 144px)); container-type: inline-size; }
/* ŠÍPKY PO BOKOCH KNIHY (Matej 5. 10. 2026: *„tu chcem šípky po bokoch obrázku vedľa, lebo nie
   je jasné, že sa dajú obrázky prepínať"*). Dovtedy stáli pod knihou pri bodkách. Sedia v zvislom
   strede knihy, 16 px od jej hrany — stage si na ne nechá 72 px z každej strany. */
.hb-side {
  position: absolute; top: calc(min(640px, 100dvh - 160px) / 2); transform: translateY(-50%); z-index: 4;
  width: 56px; height: 56px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
  border: 1px solid rgba(201, 154, 63, 0.7); background: #F3E4C4;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); transition: transform .15s ease, opacity .2s ease;
}
.hb-side.l { left: -72px; }
.hb-side.r { right: -72px; }
.hb-side:hover:not(:disabled) { transform: translateY(-50%) scale(1.06); }
.hb-side:disabled { opacity: .3; cursor: default; }
.hb-book { touch-action: pan-y; user-select: none; -webkit-user-select: none; }
.hb-book img { -webkit-user-drag: none; }
.hb-book {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
  height: min(640px, calc(100dvh - 160px));
  border-radius: 6px; overflow: hidden; background: #F1E2BF;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}
.hb-book::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 3;
  background: radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(120, 80, 30, 0.28) 100%);
}
.hb-book::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 70px; transform: translateX(-50%);
  pointer-events: none; z-index: 2;
  background: linear-gradient(90deg, transparent, rgba(90, 55, 15, 0.2) 46%, rgba(60, 35, 8, 0.36) 50%, rgba(90, 55, 15, 0.2) 54%, transparent);
}
.hb-book {
  background:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9 .06' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .12 0 0 0 .09 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>"),
    radial-gradient(90% 70% at 50% 40%, #F6E9CA, #EAD5A8);
}
.hb-page { position: relative; display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 40px 48px 84px; }
.hb-page::before {
  content: ''; position: absolute; inset: 14px 14px 70px; pointer-events: none; border-radius: 3px;
  box-shadow: inset 0 0 0 1.5px #C99A3F, inset 0 0 0 5px transparent, inset 0 0 0 6px rgba(22, 48, 122, 0.55);
}
.hb-page.m::before { display: none; }
.hb-corner { position: absolute; width: 26px; height: 26px; pointer-events: none; z-index: 1; }
.hb-corner::before {
  content: ''; position: absolute; inset: 0; transform: rotate(45deg) scale(.5);
  background: #A8432A; box-shadow: 0 0 0 3px #F1E2BF, 0 0 0 5px #C99A3F;
}
.hb-corner.tl { top: 2px; left: 2px; } .hb-corner.tr { top: 2px; right: 2px; }
.hb-corner.bl { bottom: 58px; left: 2px; } .hb-corner.br { bottom: 58px; right: 2px; }
.hb-page.t { overflow-y: auto; }
.hb-page.m { padding: 22px; align-items: center; justify-content: center; }
.hb-ini {
  float: left; width: 104px; height: 112px; margin: 2px 14px 4px 0; border-radius: 4px;
  display: grid; place-items: center; padding-top: 6px;
  background:
    radial-gradient(circle at 20% 20%, #C9892F 0 4px, transparent 5px) 0 0 / 18px 18px,
    linear-gradient(135deg, #A8432A, #7E2E1C);
  box-shadow: inset 0 0 0 4px #C99A3F, inset 0 0 0 7px #16307A, inset 0 0 0 9px #C99A3F;
  font: 900 78px/1 'Cinzel Decorative', serif; color: #F6DE9C; text-shadow: 0 2px 0 #0A1A4A;
}
.hb-lead {
  font: 700 28px/1.2 'Cinzel Decorative', 'Cinzel', serif; letter-spacing: .01em;
  color: #16307A; margin: 0 0 4px;
}
.hb-lead::after {
  content: ''; display: block; width: 160px; height: 14px; margin: 10px 0 12px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M4 7l5-5 5 5-5 5z' fill='%23C99A3F'/><circle cx='22' cy='7' r='3' fill='%23A8432A'/><path d='M30 7l5-5 5 5-5 5z' fill='%2316307A'/></svg>") left / 40px 14px repeat-x;
}
.hb-txt { font: 400 22px/1.45 'Dogyptian', 'Space Grotesk', sans-serif; color: rgba(42, 26, 12, 0.88); margin: 0; }
.hb-band {
  position: absolute; left: 24px; right: 24px; bottom: 18px; height: 40px; border-radius: 3px;
  display: flex; align-items: center; justify-content: space-around;
  background: linear-gradient(#16307A, #0A1A4A);
  box-shadow: inset 0 0 0 2px #C99A3F, inset 0 0 0 5px #A8432A, inset 0 0 0 7px #C99A3F;
}
.hb-band img { height: 20px; width: auto; filter: invert(.92) sepia(.6) saturate(2) hue-rotate(5deg); }
.hb-pic {
  position: relative; height: 100%; aspect-ratio: 3 / 4; max-width: 100%;
  cursor: pointer; border: 0; padding: 0; background: transparent;
  /* 5. 10. 2026: bez rámu a bez bieleho pozadia — Matej: „ľúbilo sa mi, že to bolo ako
     roztrhané… chcel som len odstrániť biele pozadie a dostať PNG“. Kresby majú priehľadný
     okraj (webp s alfou), tieň preto ide cez drop-shadow, aby kopíroval roztrhaný kraj. */
  filter: drop-shadow(0 10px 18px rgba(60, 35, 8, 0.35));
}
.hb-pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity .45s; }
.hb-pic img.on { opacity: 1; }
.hb-pdots { position: absolute; left: 0; right: 0; bottom: 48px; z-index: 2; display: flex; gap: 6px; justify-content: center; }
.hb-pdots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(255, 248, 232, 0.55); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); }
.hb-pdots i.on { background: #FFF8E8; width: 22px; }
.hb-plate {
  position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); z-index: 2; white-space: nowrap;
  padding: 6px 14px; border-radius: 4px; background: #F1E2BF;
  box-shadow: 0 0 0 2px #C99A3F, 0 4px 10px rgba(0, 0, 0, 0.3);
  font: 700 16px/1 'Dogyptian', serif; color: #A8432A;
}
.hb-glyph {
  width: min(88%, 420px); margin-top: 28px; padding: 8px 10px; border-radius: 6px;
  background: linear-gradient(#16307A, #0A1A4A);
  box-shadow: inset 0 0 0 2px #C99A3F, inset 0 0 0 5px #A8432A, inset 0 0 0 7px #C99A3F, 0 10px 22px rgba(60, 35, 8, 0.3);
}
.hb-glyph img { display: block; width: 100%; height: auto; filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.5)); }
.hb-title { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-bottom: 24px; }
.hb-title p {
  font: 900 60px/1.08 'Cinzel Decorative', 'Cinzel', serif; letter-spacing: .01em;
  color: #16307A; margin: 0; text-shadow: 0 2px 0 rgba(201, 154, 63, 0.45);
}
.hb-title p::first-letter { color: #A8432A; font-size: 1.3em; }
.hb-title small {
  margin-top: 18px; font: 400 22px/1.3 'Dogyptian', serif; color: #A8432A; letter-spacing: .04em;
}
.hb-title::before, .hb-title::after {
  content: ''; flex-shrink: 0; width: 220px; height: 14px; margin: 22px 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='14'><path d='M4 7l5-5 5 5-5 5z' fill='%23C99A3F'/><circle cx='22' cy='7' r='3' fill='%23A8432A'/><path d='M30 7l5-5 5 5-5 5z' fill='%2316307A'/></svg>") center / 40px 14px repeat-x;
}
.hb-story { display: none; }
.hb-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; }
.hb-nav button {
  width: 48px; height: 48px; border-radius: 999px; display: grid; place-items: center; cursor: pointer;
  border: 1px solid rgba(201, 154, 63, 0.7); background: #F3E4C4;
}
.hb-nav button:disabled { opacity: .35; cursor: default; }
.hb-dots { display: flex; gap: 8px; }
.hb-dots i { width: 8px; height: 8px; border-radius: 999px; background: rgba(243, 228, 196, 0.45); }
.hb-dots i.on { background: #F3E4C4; width: 24px; }
/* ── MOBIL = PRÍBEH (Matej 5. 10. 2026: *„ten mobil sa mi nepáči… daj to ako príbeh"*,
   variant B z plany/nakres-hektor-pribeh-2026-10-03/mobil.html). Ako Instagram story:
   ťuk vpravo = ďalej, vľavo = späť, švih tiež. Kapitola = kresba s úvodnou vetou →
   celý text → fotky na celú obrazovku. Dvojstrana pod 753 px zaniká (= kniha 720 px). */
@media (max-width: 752px) {
  .hb-veil { padding: 0; }
  .hb-stage { display: none; }
  .hb-back { top: calc(12px + env(safe-area-inset-top)); height: 36px; padding: 0 16px; z-index: 3; }
  .hb-story {
    display: block; position: fixed; inset: 0; z-index: 1; overflow: hidden;
    background: #1D140B; user-select: none; -webkit-user-select: none; touch-action: pan-y;
  }
  .hb-seg {
    position: absolute; z-index: 2; left: 16px; right: 128px; top: calc(28px + env(safe-area-inset-top));
    display: flex; gap: 4px; pointer-events: none;
  }
  .hb-seg i { flex: 1; height: 3px; border-radius: 999px; background: rgba(243, 228, 196, 0.3); }
  .hb-seg i.on { background: #F3E4C4; }
  .hb-chl {
    position: absolute; z-index: 2; left: 16px; top: calc(40px + env(safe-area-inset-top)); pointer-events: none;
    font: 700 12px/1 'Cinzel', serif; letter-spacing: .2em; color: #F3E4C4;
  }
  .hb-story.is-light .hb-seg i { background: rgba(22, 48, 122, 0.2); }
  .hb-story.is-light .hb-seg i.on { background: #16307A; }
  .hb-story.is-light .hb-chl { color: #16307A; }
  .hb-fr { position: absolute; inset: 0; }
  .hb-fr.paper {
    padding: calc(72px + env(safe-area-inset-top)) 24px 32px; overflow-y: auto;
    background:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9 .06' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .12 0 0 0 .09 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>"),
      radial-gradient(90% 70% at 50% 40%, #F6E9CA, #EAD5A8);
  }
  .hb-fr.paper .hb-title { min-height: 100%; padding-bottom: 0; }
  .hb-fr.draw {
    display: flex; flex-direction: column; gap: 16px;
    padding: calc(64px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));
  }
  .hb-fr.draw > img {
    flex: 1; min-height: 0; width: 100%; object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  }
  .hb-strip {
    flex-shrink: 0; border-radius: 12px; padding: 16px; background: #F1E2BF;
    box-shadow: 0 0 0 2px #C99A3F, 0 10px 24px rgba(0, 0, 0, 0.4);
  }
  .hb-strip .hb-lead::after { display: none; }
  .hb-strip .hb-lead { margin: 0; }
  .hb-more {
    clear: both; display: block; margin-top: 12px;
    font: 500 10px/1 'Space Grotesk', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: #A8432A;
  }
  .hb-strip .hb-plate, .hb-fr.paper .hb-plate { position: static; transform: none; display: inline-block; }
  .hb-fr.photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hb-fr.photo .hb-plate { bottom: calc(24px + env(safe-area-inset-bottom)); }
  .hb-capr { text-align: center; margin: 24px 0 0; }
  .hb-fr.draw .hb-capr { margin: 0; }
  .hb-fr.draw .hb-plate { position: static; transform: none; display: inline-block; }
  .hb-ini { width: 64px; height: 70px; font-size: 48px; margin-right: 12px; }
  .hb-lead::after { margin: 8px 0 12px; }
  .hb-txt { font-size: 18px; }
  .hb-lead { font-size: 20px; }
  .hb-title p { font-size: 38px; }
  .hb-title small { font-size: 16px; }
  .hb-glyph { margin-top: 0; }
  .hb-title::before, .hb-title::after { width: 150px; margin: 16px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hb-veil { animation: none; }
  .hb-pic img { transition: none; }
}
`;function G({dir:x}){return e.jsx("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"#16307A",strokeWidth:"2.2",strokeLinecap:"round","aria-hidden":!0,children:e.jsx("path",{d:x==="l"?"M15 5c-3 2.5-5 4.6-7 7 2 2.3 4 4.5 7 7":"M9 5c3 2.5 5 4.6 7 7-2 2.3-4 4.5-7 7"})})}function he({onClose:x}){const i=_(),[s,u]=o.useState(0),[$,v]=o.useState(0),[n,k]=o.useState(0),M=o.useRef(null),N=o.useRef(null),w=o.useCallback(t=>{u(Math.max(0,Math.min(d.length-1,t))),v(0),k(0)},[]),D=o.useRef(null),y=o.useRef(!1),z=o.useRef(0);z.current=s,o.useEffect(()=>{const t=D.current;if(!t)return;let a=null,h=0;const c=p=>{a=p.clientX,h=p.clientY,y.current=!1},f=p=>{if(a==null)return;const m=p.clientX-a,T=p.clientY-h;a=null,Math.abs(m)>=40&&Math.abs(m)>Math.abs(T)*1.2&&(y.current=!0,w(z.current+(m<0?1:-1)))};let j=0,P=0,C=!1;const S=p=>{if(Math.abs(p.deltaX)<=Math.abs(p.deltaY))return;p.preventDefault();const m=performance.now();m-P>250&&(j=0,C=!1),P=m,j+=p.deltaX,!(C||Math.abs(j)<50)&&(C=!0,w(z.current+(j>0?1:-1)))};return t.addEventListener("pointerdown",c),window.addEventListener("pointerup",f),window.addEventListener("wheel",S,{passive:!1}),()=>{t.removeEventListener("pointerdown",c),window.removeEventListener("pointerup",f),window.removeEventListener("wheel",S)}},[w]),o.useEffect(()=>{var h;const t=document.body.style.overflow;document.body.style.overflow="hidden",(h=M.current)==null||h.focus();const a=c=>{c.key==="Escape"&&x(),c.key==="ArrowRight"&&(c.preventDefault(),u(f=>Math.min(d.length-1,f+1)),v(0)),c.key==="ArrowLeft"&&(c.preventDefault(),u(f=>Math.max(0,f-1)),v(0))};return window.addEventListener("keydown",a),()=>{document.body.style.overflow=t,window.removeEventListener("keydown",a)}},[x]);const l=d[s],r=`onepage.hbook.${l.n}`,g=i(`${r}.cap`),b=l.n===0,I=t=>d[t].n===0?2:d[t].media.length+1,F=I(s),L=t=>{t===1?n<F-1?k(n+1):s<d.length-1&&(u(s+1),k(0)):n>0?k(n-1):s>0&&(u(s-1),k(I(s-1)-1))},R=["","I","II","III","IV","V","VI","VII"],K=(()=>{const t=e.jsx("span",{className:"hb-ini","aria-hidden":!0,children:i(`${r}.ini`)});if(b&&n===0)return e.jsx("div",{className:"hb-fr paper",children:e.jsxs("div",{className:"hb-title",children:[e.jsx("p",{children:i(`${r}.title`)}),e.jsx("span",{className:"hb-glyph",children:e.jsx("img",{src:"/images/hekthor-heroglyph.webp",alt:i(`${r}.glyph`)})}),e.jsx("small",{children:i(`${r}.sub`)})]})});if(n===0||b)return e.jsxs("div",{className:"hb-fr draw",children:[e.jsx("img",{src:`${A}/${l.media[0]}.webp`,alt:g}),b?e.jsx("p",{className:"hb-capr",children:e.jsx("span",{className:"hb-plate",children:g})}):e.jsxs("div",{className:"hb-strip",children:[t,e.jsxs("p",{className:"hb-lead",children:[e.jsx("span",{className:"sr-only",children:i(`${r}.ini`)}),i(`${r}.lead`)]}),e.jsx("span",{className:"hb-more",children:i("onepage.hbook.tap")})]})]});if(n===1)return e.jsxs("div",{className:"hb-fr paper",children:[t,e.jsxs("p",{className:"hb-lead",children:[e.jsx("span",{className:"sr-only",children:i(`${r}.ini`)}),i(`${r}.lead`)]}),e.jsx("p",{className:"hb-txt",children:i(`${r}.txt`)}),e.jsx("p",{className:"hb-capr",children:e.jsx("span",{className:"hb-plate",children:g})})]});const a=l.media[n-1];return e.jsxs("div",{className:"hb-fr photo",children:[e.jsx("img",{src:`${A}/${a}.webp`,alt:""}),e.jsx("span",{className:"hb-plate",children:g})]})})(),B=!b&&n>=0&&n<F-1&&n+1>=2?`${A}/${l.media[n]}.webp`:null,O=["tl","tr","bl","br"].map(t=>e.jsx("span",{className:`hb-corner ${t}`,"aria-hidden":!0},t)),H=b?e.jsxs(e.Fragment,{children:[O,e.jsxs("div",{className:"hb-title",children:[e.jsx("p",{children:i(`${r}.title`)}),e.jsx("span",{className:"hb-glyph",children:e.jsx("img",{src:"/images/hekthor-heroglyph.webp",alt:i(`${r}.glyph`)})}),e.jsx("small",{children:i(`${r}.sub`)})]}),e.jsx("div",{className:"hb-band","aria-hidden":!0,children:X.map((t,a)=>e.jsx("img",{src:t,alt:""},a))})]}):e.jsxs(e.Fragment,{children:[O,e.jsxs("div",{children:[e.jsx("span",{className:"hb-ini","aria-hidden":!0,children:i(`${r}.ini`)}),e.jsxs("p",{className:"hb-lead",children:[e.jsx("span",{className:"sr-only",children:i(`${r}.ini`)}),i(`${r}.lead`)]}),e.jsx("p",{className:"hb-txt",children:i(`${r}.txt`)})]}),e.jsx("div",{className:"hb-band","aria-hidden":!0,children:X.map((t,a)=>e.jsx("img",{src:t,alt:""},a))})]});return W.createPortal(e.jsxs("div",{className:"hb-veil",role:"dialog","aria-modal":"true","aria-label":i("onepage.hbook.aria"),onClick:t=>{t.target===t.currentTarget&&x()},children:[e.jsx("style",{children:ae}),e.jsx("button",{ref:M,type:"button",className:"hb-back",onClick:x,"aria-label":i("nav.aria.close"),children:i("onepage.dogma.back")}),e.jsxs("div",{className:"hb-stage",children:[e.jsxs("div",{className:"hb-book",ref:D,children:[e.jsx("div",{className:"hb-page t",children:H}),e.jsx("div",{className:"hb-page m",children:e.jsxs("button",{type:"button",className:"hb-pic",onClick:()=>{if(y.current){y.current=!1;return}v(t=>(t+1)%l.media.length)},"aria-label":i("onepage.hbook.nextPic"),children:[l.media.map((t,a)=>e.jsx("img",{src:`${A}/${t}.webp`,alt:a===0?g:"",className:a===$?"on":"",loading:a===0?"eager":"lazy"},t)),l.media.length>1&&e.jsx("span",{className:"hb-pdots","aria-hidden":!0,children:l.media.map((t,a)=>e.jsx("i",{className:a===$?"on":""},t))}),e.jsx("span",{className:"hb-plate",children:g})]})})]}),e.jsx("button",{type:"button",className:"hb-side l",onClick:()=>w(s-1),disabled:s===0,"aria-label":i("onepage.hbook.prev"),children:e.jsx(G,{dir:"l"})}),e.jsx("button",{type:"button",className:"hb-side r",onClick:()=>w(s+1),disabled:s===d.length-1,"aria-label":i("onepage.hbook.next"),children:e.jsx(G,{dir:"r"})}),e.jsx("div",{className:"hb-nav",children:e.jsx("span",{className:"hb-dots","aria-hidden":!0,children:d.map((t,a)=>e.jsx("i",{className:a===s?"on":""},t.n))})})]}),e.jsxs("div",{className:`hb-story${n===1||b&&n===0?" is-light":""}`,onPointerDown:t=>{N.current=t.clientX},onPointerUp:t=>{const a=N.current;if(N.current=null,a==null)return;const h=t.clientX-a;if(Math.abs(h)>40){L(h<0?1:-1);return}L(t.clientX<window.innerWidth/3?-1:1)},children:[e.jsx("div",{className:"hb-seg","aria-hidden":!0,children:Array.from({length:F},(t,a)=>e.jsx("i",{className:a<=n?"on":""},a))}),!b&&e.jsxs("span",{className:"hb-chl","aria-hidden":!0,children:[R[l.n]," / ",R[d.length-1]]}),K,B&&e.jsx("link",{rel:"preload",as:"image",href:B})]})]}),document.body)}export{ae as HEKTOR_BOOK_CSS,he as default};
