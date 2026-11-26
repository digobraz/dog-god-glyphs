import{f as E,r as l,E as p,D as x,u as S,j as u}from"./index-DriUOdZL.js";const i=new Map,g=new Map,b=p===x,d=t=>fetch(`${p}/get-dog-messages?lang=${encodeURIComponent(t)}`).then(e=>e.ok?e.json():{});function j(t){const e=i.get(t);if(e)return Promise.resolve(e);let s=g.get(t);return s||(s=(b?fetch(`https://dogypt.com/api/dog-messages?lang=${encodeURIComponent(t)}`).then(o=>o.ok?o.json():Promise.reject(o.status)).catch(()=>d(t)):d(t)).catch(()=>({})).then(o=>(i.set(t,o??{}),o??{})),g.set(t,s)),s}function D(t,e){var a;const{lang:s}=E(),[,o]=l.useState(0);l.useEffect(()=>{if(i.has(s))return;let n=!0;return j(s).then(()=>{n&&o(c=>c+1)}),()=>{n=!1}},[s]);const r=t!=null&&e?(a=i.get(s))==null?void 0:a[String(t)]:void 0;return r?{text:r,translated:!0}:{text:e,translated:!1}}function w({n:t,text:e,className:s,toggle:o=!0}){const r=S(),{text:a,translated:n}=D(t,e),[c,f]=l.useState(!1);return e?u.jsxs(u.Fragment,{children:[u.jsx("p",{className:s,children:n&&!c?a:e}),n&&o&&u.jsx("button",{type:"button",className:"dm-toggle",onClick:m=>{m.stopPropagation(),f(h=>!h)},children:r(c?"wall.msg.showTr":"wall.msg.showOrig")})]}):null}const _=`
  .dm-toggle {
    display: block; margin: 4px auto 0; padding: 0; border: 0; background: none;
    font: 500 12px/1.4 'Space Grotesk', sans-serif; font-style: normal;
    color: rgba(42,22,8,0.62); text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
  }
  .dm-toggle:hover { color: rgba(42,22,8,0.9); }
`;export{_ as D,w as a,D as u};
