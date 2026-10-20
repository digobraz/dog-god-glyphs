import{e as m,r as i,aW as h,u as x,j as l}from"./index-B-BQrD2y.js";const u=new Map,g=new Map;function E(e){const s=u.get(e);if(s)return Promise.resolve(s);let t=g.get(e);return t||(t=fetch(`${h}/get-dog-messages?lang=${encodeURIComponent(e)}`).then(n=>n.ok?n.json():{}).catch(()=>({})).then(n=>(u.set(e,n??{}),n??{})),g.set(e,t)),t}function S(e,s){var a;const{lang:t}=m(),[,n]=i.useState(0);i.useEffect(()=>{if(u.has(t))return;let o=!0;return E(t).then(()=>{o&&n(c=>c+1)}),()=>{o=!1}},[t]);const r=e!=null&&s?(a=u.get(t))==null?void 0:a[String(e)]:void 0;return r?{text:r,translated:!0}:{text:s,translated:!1}}function j({n:e,text:s,className:t,toggle:n=!0}){const r=x(),{text:a,translated:o}=S(e,s),[c,d]=i.useState(!1);return s?l.jsxs(l.Fragment,{children:[l.jsx("p",{className:t,children:o&&!c?a:s}),o&&n&&l.jsx("button",{type:"button",className:"dm-toggle",onClick:f=>{f.stopPropagation(),d(p=>!p)},children:r(c?"wall.msg.showTr":"wall.msg.showOrig")})]}):null}const w=`
  .dm-toggle {
    display: block; margin: 4px auto 0; padding: 0; border: 0; background: none;
    font: 500 12px/1.4 'Space Grotesk', sans-serif; font-style: normal;
    color: rgba(42,22,8,0.62); text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
  }
  .dm-toggle:hover { color: rgba(42,22,8,0.9); }
`;export{w as D,j as a,S as u};
