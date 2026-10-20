import{c}from"./createLucideIcon-Di02PK5p.js";import{r as u}from"./index-7PctGTam.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=c("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]),i="/assets/dogypt-logo-round-nsDxblrw.png",s={body:{count:0,saved:null},html:{count:0,saved:null}},t=e=>e==="body"?document.body:document.documentElement;function n(e){const o=s[e];o.count===0&&(o.saved=t(e).style.overflow,t(e).style.overflow="hidden"),o.count+=1}function r(e){const o=s[e];o.count!==0&&(o.count-=1,o.count===0&&(t(e).style.overflow=o.saved??"",o.saved=null))}function l(e=!1){n("body"),e&&n("html");let o=!1;return()=>{o||(o=!0,r("body"),e&&r("html"))}}function y(e,o=!1){u.useEffect(()=>{if(e)return l(o)},[e,o])}export{a as A,l as a,i as d,y as u};
