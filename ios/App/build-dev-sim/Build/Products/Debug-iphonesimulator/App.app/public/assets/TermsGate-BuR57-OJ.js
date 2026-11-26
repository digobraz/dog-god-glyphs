import{u as _,r as m,j as e,P as z,w as d,aF as P,m as x,a0 as v,s as r,b,aB as i,v as o,O as E,L as f,c as T,i as B,a as L}from"./index-DriUOdZL.js";import{c as O}from"./cardDraft--JJQVDkL.js";import{supabase as S}from"./client-_yx8AKEw.js";import{g as R}from"./sharedFetch-CweRO2Vz.js";import{C as U,L as D,A as K}from"./sysSwap-DJ_4p3cJ.js";import{L as s}from"./labTheme-DLctEqJ2.js";const W=B,N=1,F=l=>{var t;const a=(t=l==null?void 0:l.user_metadata)==null?void 0:t.terms_ok;return typeof(a==null?void 0:a.v)=="number"&&a.v>=N};function H({onDone:l}){const a=_(),t=(n,p)=>{const c=a(n);return c===n?p:c},[u,h]=m.useState(!1),[y,$]=m.useState(""),[A,k]=m.useState(!1),I=async()=>{if(u)return;h(!0),$("");const{error:n}=await S.auth.updateUser({data:{terms_ok:{v:N,at:new Date().toISOString()}}});if(h(!1),n){$(t("appEntry.rules.fail","Could not save. Check your connection and try again."));return}l()},C=async()=>{try{O(),await S.auth.signOut({scope:"local"})}catch{}window.location.replace("/login")},w=n=>n.split("**").map((p,c)=>c%2?e.jsx("b",{children:p},c):p),g=(n,p,c,j=!1)=>e.jsxs("li",{className:"tr-row",children:[e.jsx("span",{className:`tr-ib${j?" tr-ib--ai":""}`,children:n}),e.jsxs("span",{children:[e.jsx("b",{className:"tr-head",children:j?e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"AI"}),"NUBIS"]}):p})," ",w(c)]})]});return e.jsxs("div",{className:"tr-veil",role:"dialog","aria-modal":"true","aria-labelledby":"tr-title",children:[e.jsx("style",{children:M}),A?e.jsxs("div",{className:"tr-sheet",children:[e.jsx("span",{className:"tr-grip"}),e.jsx("h2",{id:"tr-title",className:"tr-title",children:t("appEntry.rules.leaveTitle","Without the rules")}),e.jsx("p",{className:"tr-leave",children:t("appEntry.rules.leaveText","Without agreeing to the rules you can't enter the pack. Your dog stays on the wall.")}),e.jsx("button",{type:"button",className:"tr-cta",onClick:()=>k(!1),children:t("appEntry.rules.back","Back to the rules")}),e.jsx("button",{type:"button",className:"tr-link",onClick:()=>void C(),children:t("appEntry.rules.leave","Leave")})]}):e.jsxs("div",{className:"tr-sheet",children:[e.jsx("span",{className:"tr-grip"}),e.jsx("p",{className:"tr-eyebrow",children:t("appEntry.rules.eyebrow","Before you enter")}),e.jsx("h2",{id:"tr-title",className:"tr-title",children:t("appEntry.rules.title","Pack rules")}),e.jsxs("ul",{className:"tr-list",children:[g(e.jsx(U,{size:20}),t("appEntry.rules.h1","Be fair."),t("appEntry.rules.r1","Collect points **honestly** and **don't lie**. Suspicious activity will be uncovered by AINUBIS :)")),g(e.jsx(D,{size:20,on:!0}),t("appEntry.rules.h2","Respect."),t("appEntry.rules.r2","We don't tolerate **insults, violence, stalking or spam**.")),g(e.jsx(K,{size:20}),t("appEntry.rules.h3","Report & block"),t("appEntry.rules.r3","**anything inappropriate** — you help us spot problems sooner :)")),g(e.jsx("img",{src:W,alt:""}),"AINUBIS",t("appEntry.rules.r4","knows your dogs, DOG ID and diary to advise you precisely. **Any problem? Write to him.**"),!0)]}),e.jsx("p",{className:"tr-together",children:w(t("appEntry.rules.together","**We build this together.** Everything you do here serves the whole pack."))}),e.jsxs("p",{className:"tr-legal",children:[t("appEntry.rules.pre","I agree to the "),e.jsx("a",{href:"/terms",children:t("appEntry.legal.terms","Terms")}),t("appEntry.legal.and"," and the "),e.jsx("a",{href:"/privacy",children:t("appEntry.legal.privacy","Privacy Policy")}),"."]}),y&&e.jsx("p",{className:"tr-err",role:"alert",children:y}),e.jsx("button",{type:"button",className:"tr-cta",disabled:u,onClick:()=>void I(),children:t("appEntry.rules.agree","I agree")}),e.jsx("button",{type:"button",className:"tr-link",onClick:()=>k(!0),children:t("appEntry.rules.decline","I don't agree")})]})]})}function Q(){const[l,a]=m.useState(!1),{pathname:t}=L();return m.useEffect(()=>{let u=!1;return R().then(({data:h})=>{!u&&h.user&&!F(h.user)&&a(!0)}),()=>{u=!0}},[]),/^\/pack\/sos(\/|$)/.test(t)?null:l?e.jsx(H,{onDone:()=>a(!1)}):null}const M=`
.tr-veil { position: fixed; inset: 0; z-index: 1000; background: ${z.modal}; display: flex; align-items: flex-end; justify-content: center; }
.tr-sheet { width: 100%; max-width: 560px; display: flex; flex-direction: column; align-items: center; text-align: center;
  background: ${d.panel.background}; border-top: ${d.panel.border}; box-shadow: ${P.panel};
  border-radius: ${x.card}px ${x.card}px 0 0; color: ${s.ink}; font-family: ${v};
  padding: ${r.md}px ${r.xl}px calc(env(safe-area-inset-bottom, 0px) + ${r.xl}px);
  animation: trUp .28s cubic-bezier(.2,.8,.2,1); }
.tr-sheet > * { max-width: 400px; }
@keyframes trUp { from { transform: translateY(100%); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .tr-sheet { animation-duration: .01s; } }
.tr-grip { width: 40px; height: 4px; border-radius: ${x.pill}px; background: ${b.border}; margin-bottom: ${r.lg}px; }
.tr-eyebrow { margin: 0 0 ${r.sm}px; font-family: ${i.label.fontFamily}; font-weight: ${i.label.fontWeight};
  font-size: ${i.label.fontSize}px; letter-spacing: ${i.label.letterSpacing}; text-transform: uppercase; color: ${s.goldInk}; }
.tr-title { margin: 0 0 ${r.lg}px; font-family: ${i.card.fontFamily}; font-weight: 700; font-size: ${o.h2}px; /* písmo: nadpis */
  letter-spacing: ${i.card.letterSpacing}; text-transform: uppercase; }
.tr-list { list-style: none; margin: 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: ${r.sm}px; }
.tr-row { display: grid; grid-template-columns: 36px minmax(0,1fr); align-items: center; column-gap: ${r.md}px; text-align: left;
  padding: ${r.md}px; font-size: ${o.label}px; line-height: 1.45; color: ${s.ink};
  background: ${d.subblock.background}; border: ${d.subblock.border}; border-radius: ${d.subblock.borderRadius}px; box-shadow: ${d.subblock.boxShadow}; }
.tr-ib { width: 36px; height: 36px; border-radius: ${x.pill}px; display: grid; place-items: center;
  background: ${b.card}; border: 1px solid ${b.hairline}; color: ${s.ink}; }
.tr-ib img { width: 20px; height: 20px; display: block; }
.tr-ib--ai { overflow: hidden; }
.tr-ib--ai img { width: 100%; height: 100%; object-fit: cover; }
.tr-row b { font-weight: 600; }
.tr-head > span { color: ${E.aiInk}; text-shadow: ${E.aiShadow}; }
.tr-together { margin: ${r.md}px 0 0; font-size: ${o.label}px; line-height: 1.45; color: ${s.ink}; text-wrap: balance; }
.tr-together b { font-weight: 600; }
.tr-legal { margin: ${r.lg}px 0 0; font-size: ${o.label}px; line-height: 1.5; color: ${s.inkMuted}; text-wrap: balance; }
.tr-legal a { color: ${s.inkSoft}; text-decoration: underline; text-underline-offset: 3px; }
.tr-leave { margin: 0; font-size: ${o.body}px; line-height: 1.5; color: ${s.inkSoft}; text-wrap: balance; }
.tr-err { margin: ${r.sm}px 0 0; font-size: ${o.label}px; color: ${b.ink}; }
.tr-cta { width: 100%; height: 48px; margin-top: ${r.lg}px; border: 0; border-radius: ${x.field}px; cursor: pointer;
  background: ${f.grad}; color: ${f.ink}; box-shadow: ${T};
  font-family: ${i.card.fontFamily}; font-weight: 700; font-size: ${o.body}px; /* písmo: cta */
  letter-spacing: ${i.card.letterSpacing}; text-transform: uppercase; }
.tr-cta:hover:not(:disabled) { background: ${f.gradHover}; }
.tr-cta:disabled { opacity: .4; cursor: default; box-shadow: none; }
.tr-link { margin-top: ${r.md}px; border: 0; background: none; padding: ${r.xs}px; cursor: pointer;
  font-family: ${v}; font-size: ${o.label}px; color: ${s.inkSoft}; }
`;export{H as R,Q as T,F as t};
