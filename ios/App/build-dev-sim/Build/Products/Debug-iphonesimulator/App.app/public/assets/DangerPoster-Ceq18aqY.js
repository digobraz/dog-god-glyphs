import{r as c,j as o,b as q,a$ as M,b0 as N}from"./index-DriUOdZL.js";import{withTransform as E}from"./cloudinaryService-CiRx-3N_.js";import{H as A}from"./danger-B5gQuuO0.js";import{R as S}from"./RoundQR-D9_JUk-G.js";import{u as P}from"./sosShared-DOXkldFL.js";const U={story:{w:1080,h:1920},post:{w:1080,h:1350}};function _(e){return e.kind==="abuse"?{lat:Math.round(e.lat*100)/100,lng:Math.round(e.lng*100)/100,radius:Math.max(1e3,e.radius_m??0),photo:null,what:[]}:{lat:e.lat,lng:e.lng,radius:Math.min(500,Math.max(100,e.radius_m??150)),photo:e.photo,what:e.what}}const $=(e,p)=>156543.03392*Math.cos(e*Math.PI/180)/2**p,m=600;function j(e){const[p,a]=c.useState({url:null,settled:!e});return c.useEffect(()=>{if(!e){a({url:null,settled:!0});return}let t=!0,s=null;return a({url:null,settled:!1}),fetch(e,{mode:"cors"}).then(i=>{if(!i.ok)throw new Error(String(i.status));return i.blob()}).then(i=>{s=URL.createObjectURL(i),t&&a({url:s,settled:!0})}).catch(()=>{t&&a({url:null,settled:!0})}),()=>{t=!1,s&&URL.revokeObjectURL(s)}},[e]),p}function z(){return o.jsxs("svg",{viewBox:"0 0 100 100",preserveAspectRatio:"xMidYMid slice","aria-hidden":!0,children:[o.jsx("rect",{width:"100",height:"100",fill:"#E7DCC3"}),o.jsx("path",{d:"M0 72 C22 52 48 86 100 42",stroke:"#8FB8D8",strokeWidth:"6",fill:"none"}),o.jsx("path",{d:"M0 18 L100 80",stroke:"#fff",strokeWidth:"3.4",opacity:".85"}),o.jsx("path",{d:"M34 0 L46 100",stroke:"#fff",strokeWidth:"2.4",opacity:".85"})]})}function C({lat:e,lng:p,radius:a,onSettled:t}){const s=a<=250?16:15,i=`${M}/v1/static/map?lon=${p}&lat=${e}&zoom=${s}&width=${m}&height=${m}&mapset=outdoor&apikey=${N}`,{url:r,settled:n}=j(i);c.useEffect(()=>{n&&(t==null||t(!!r))},[n,r,t]);const d=Math.min(40,a/$(e,s)/m*100);return o.jsxs(o.Fragment,{children:[r?o.jsx("img",{src:r,alt:""}):n?o.jsx(z,{}):null,o.jsxs("svg",{viewBox:"0 0 100 100","aria-hidden":!0,children:[o.jsx("circle",{cx:"50",cy:"50",r:d,fill:"rgba(200,32,47,.22)",stroke:q.sosRed,strokeWidth:"1.2"}),o.jsx("circle",{cx:"50",cy:"50",r:"1.6",fill:q.sosRed})]})]})}const B=`
.dpo{container-type:inline-size;position:relative;width:100%;overflow:hidden;color:#2A1608;text-align:left;box-sizing:border-box;
  background:radial-gradient(ellipse at 50% 40%,#F7E9C8 0%,#EBD29D 70%,#D6B373 100%);}
.dpo--story{aspect-ratio:9/16;}
.dpo--post{aspect-ratio:4/5;}
.dpo-in{position:absolute;inset:0;display:flex;flex-direction:column;}
.dpo-top{background:linear-gradient(180deg,#C8202F,#9E1522);color:#fff;padding:5cqw 6cqw 4cqw;text-align:center;flex:none;}
.dpo-h{font:800 9.4cqw/1.05 'Cinzel',serif;letter-spacing:.02em;text-transform:uppercase;margin:0;overflow-wrap:anywhere;} /* písmo: nadpis */
.dpo-sub{font:500 3.6cqw/1.3 'Space Grotesk',sans-serif;margin:1.6cqw 0 0;overflow-wrap:anywhere;}
.dpo--post .dpo-top{padding:3.6cqw 6cqw 3cqw;}
.dpo--post .dpo-h{font-size:7.6cqw;}
.dpo--post .dpo-sub{font-size:3.1cqw;margin-top:1cqw;}
.dpo-body{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.6cqw;padding:2.6cqw 8cqw;}
.dpo-pic{position:relative;overflow:hidden;border:.8cqw solid #2A1608;border-radius:4.5cqw;background:#E8D7AE;flex:none;}
.dpo-pic > img,.dpo-pic > svg{position:absolute;inset:0;width:100%;height:100%;display:block;}
.dpo-pic > img{object-fit:cover;}
.dpo-map{width:76cqw;height:76cqw;}
.dpo-map--wide{width:84cqw;height:84cqw;}
.dpo-photo{width:76cqw;height:26cqw;}
.dpo-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:1.4cqw;}
.dpo-chip{font:600 2.7cqw/1 'Space Grotesk',sans-serif;border:.5cqw solid #2A1608;border-radius:999px;padding:1.2cqw 2.4cqw;}
.dpo-rad{font:600 2.8cqw/1.2 'Space Grotesk',sans-serif;letter-spacing:.02em;margin:0;opacity:.8;text-align:center;}
.dpo--post .dpo-body{flex-direction:row;justify-content:space-between;gap:4cqw;padding:2.6cqw 6cqw;}
.dpo--post .dpo-map,.dpo--post .dpo-map--wide{width:56cqw;height:56cqw;}
.dpo--post .dpo-photo{width:100%;height:24cqw;}
.dpo--post .dpo-side{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:2cqw;align-items:stretch;}
.dpo--post .dpo-chips{justify-content:flex-start;}
.dpo--post .dpo-rad{text-align:left;}
/* 4:5 bez fotky: jeden vycentrovaný stĺpec ako na 9:16 (mapa + okruh + štítky), nie mapa vľavo a prázdny pás vpravo */
.dpo--post .dpo-body--col{flex-direction:column;justify-content:center;gap:2.2cqw;padding:1.6cqw 8cqw;}
.dpo--post .dpo-body--col .dpo-map,.dpo--post .dpo-body--col .dpo-map--wide{width:54cqw;height:54cqw;}
.dpo--post .dpo-body--col .dpo-rad{text-align:center;}
.dpo--post .dpo-body--col .dpo-chips{justify-content:center;}
.dpo-bot{background:#1A1006;color:#F4E7C8;padding:2.6cqw 6cqw;display:flex;align-items:center;gap:4cqw;flex:none;}
.dpo-qr{width:17cqw;height:17cqw;background:#fff;padding:1.2cqw;border-radius:2.4cqw;box-sizing:border-box;flex:none;}
.dpo-qr svg{width:100%;height:100%;display:block;}
.dpo-bt{min-width:0;}
.dpo-scan{font:600 2.4cqw/1.2 'Space Grotesk',sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin:0;}
.dpo-url{font:700 3.6cqw/1.15 'Space Grotesk',sans-serif;margin:.8cqw 0 0;overflow-wrap:anywhere;}
.dpo-join{font:500 2.7cqw/1.25 'Space Grotesk',sans-serif;margin:.8cqw 0 0;opacity:.9;}
`;function T({data:e,format:p,onReady:a}){const t=P(),s=_(e),i=e.place.trim()||t("pack.sos.danger.poster.place"),r=e.kind==="poison",n=s.photo?E(s.photo,"q_auto:best,w_1080,c_limit"):null,d=j(n),[k,y]=c.useState(!1),v=c.useCallback(()=>y(!0),[]),l=d.settled&&k;c.useEffect(()=>{l&&(a==null||a())},[l,a]);const g=A(e.slug),h=!!s.photo&&(d.url||!d.settled),w=s.what.length>0&&o.jsx("div",{className:"dpo-chips",children:s.what.map(b=>o.jsx("span",{className:"dpo-chip",children:t(`pack.sos.danger.poster.chip.${b}`)},b))}),u=o.jsx("div",{className:`dpo-pic dpo-map${h?"":" dpo-map--wide"}`,role:"img","aria-label":i,children:o.jsx(C,{lat:s.lat,lng:s.lng,radius:s.radius,onSettled:v})}),x=h&&o.jsx("div",{className:"dpo-pic dpo-photo",children:d.url&&o.jsx("img",{src:d.url,alt:""})}),f=o.jsx("p",{className:"dpo-rad",children:t("pack.sos.danger.poster.radius",{m:s.radius})});return o.jsxs("div",{className:`dpo dpo--${p}`,children:[o.jsx("style",{children:B}),o.jsxs("div",{className:"dpo-in","data-ready":l?"1":"0",children:[o.jsxs("div",{className:"dpo-top",children:[o.jsx("div",{className:"dpo-h",children:t(r?"pack.sos.danger.poster.headPoison":"pack.sos.danger.poster.headAbuse")}),o.jsx("p",{className:"dpo-sub",children:t(r?"pack.sos.danger.poster.subPoison":"pack.sos.danger.poster.subAbuse",{place:i})})]}),p==="story"?o.jsxs("div",{className:"dpo-body",children:[x,u,f,w]}):h?o.jsxs("div",{className:"dpo-body",children:[u,o.jsxs("div",{className:"dpo-side",children:[x,f,w]})]}):o.jsxs("div",{className:"dpo-body dpo-body--col",children:[u,f,w]}),o.jsxs("div",{className:"dpo-bot",children:[o.jsx("div",{className:"dpo-qr",children:o.jsx(S,{value:g,ink:"#1A1006",eye:"#1A1006"})}),o.jsxs("div",{className:"dpo-bt",children:[o.jsx("p",{className:"dpo-scan",children:t("pack.sos.danger.poster.scan")}),o.jsx("p",{className:"dpo-url",children:g.replace(/^https?:\/\//,"")}),o.jsx("p",{className:"dpo-join",children:t("pack.sos.danger.poster.join")})]})]})]})]})}export{T as D,U as P,C as a,_ as p};
