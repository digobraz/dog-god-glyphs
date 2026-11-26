const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AppEntry-BIeho4yL.js","assets/index-DriUOdZL.js","assets/index-Dt5kbd8A.css","assets/client-_yx8AKEw.js","assets/tslib.es6-CmEaCU22.js","assets/appSession-Dt5ga50m.js","assets/LanguagePicker-L0DjjzFI.js","assets/flagUrl-B21iQI9I.js","assets/NavMedallion-Ba7JyV5h.js","assets/HandIcons-BI9sYdb3.js","assets/handArrowLeft-CBfp0fHd.js","assets/ThinArrow-DxkNjmlF.js","assets/labTheme-DLctEqJ2.js","assets/cloudinaryService-CiRx-3N_.js","assets/TermsGate-BuR57-OJ.js","assets/cardDraft--JJQVDkL.js","assets/sharedFetch-CweRO2Vz.js","assets/sysSwap-DJ_4p3cJ.js","assets/SysIcon-CI9hudiL.js","assets/flowFullSkin-B8mfOKvS.js","assets/hekthorFaces-myd4lVXL.js","assets/PageTopBar-3J3L1b0M.js","assets/dogypt-hlava-2026-CGJcz-cj.js","assets/dogypt-logo-round-QJ8V2TsC.js","assets/useBodyScrollLock-kBfMUM5M.js","assets/appRegister-Cj9fmMG3.js","assets/flowSvorka-Ck3rYXr8.js","assets/heroglyphCode-DlQZhGCv.js","assets/initialLetter-CIe-_dtl.js","assets/breeds-DONRU28-.js","assets/flowMode-B6eboter.js"])))=>i.map(i=>d[i]);
import{n as le,I as re,j as e,r as o,_ as Re,u as ze,f as Be,g as Te,e as oe,O as r,s,aB as y,v as c,L as v,m as Oe,i as Ue,an as ne,V as Fe}from"./index-DriUOdZL.js";import{supabase as p}from"./client-_yx8AKEw.js";import{P as Ge}from"./PageTopBar-3J3L1b0M.js";import{c as De}from"./flowPaleSkin-CJNdyjt-.js";import{L as m}from"./labTheme-DLctEqJ2.js";import{B as He}from"./BackButton-8pSTwsJq.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./dogypt-hlava-2026-CGJcz-cj.js";import"./dogypt-logo-round-QJ8V2TsC.js";import"./useBodyScrollLock-kBfMUM5M.js";import"./LanguagePicker-L0DjjzFI.js";import"./flagUrl-B21iQI9I.js";const w=96,Me=`
.lg-col { max-width: 420px; }

/* ── AINUBIS STRÁŽI BRÁNU — VÝBEŽOK D-BLOKU (26. 9. 2026) ──────────────────
   Matej: *„oživme sign in… dajme tam AINUBISOV EMBLÉM do stredu hore"* a po
   prvom kole *„ten emblém sa mi nepáči, že tam je len tak — urob z D-BLOKU taký
   výbežok, nech je to súčasť bloku, a daj AINUBISOVO logo do kruhu"*.
   Výbežok je ten istý odliatok ako karta (\`goldFrameCSS\`, len s kruhovým
   polomerom — tvar vyžiadal Matej) a sedí na hornom leme tak, že ho prekrýva:
   oko ho číta ako hrbolček rámu, nie ako minca položená na karte.
   V ňom AINUBISOV kruh v JEHO šate (\`AINUBIS.faceBg/faceRing\`) — brána patrí
   jemu (bezpečnosť, brand lock), preto žiari tyrkysom, nie lapisom.
   Pohyb = len dýchanie žiary v kruhu; výbežok sa nehýbe, je to rám. */
.lg-card { position: relative; }
.lg-crest {
  position: absolute; left: 50%; top: -${w/2}px; transform: translateX(-50%);
  width: ${w}px; height: ${w}px; z-index: 2;
  ${Fe({radius:999})}
  display: flex; align-items: center; justify-content: center;
}
.lg-face {
  width: 100%; height: 100%; border-radius: 999px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: ${r.faceBg}; box-shadow: ${r.faceRing};
  animation: lgGlow 3.2s ease-in-out infinite;
}
.lg-face img { width: 82%; height: 82%; object-fit: contain; margin-top: 6%; display: block; }
.lg-login .lg-card .hf-plate { padding-top: ${w/2+s.md}px; }
.lg-login .lg-col { padding-top: ${w/2}px; }
@keyframes lgGlow {
  0%,100% { box-shadow: ${r.faceRing}; }
  50% { box-shadow: 0 0 0 1.5px rgba(${r.cyanRGB},.7), 0 0 22px rgba(${r.cyanRGB},.55); }
}
@media (prefers-reduced-motion: reduce) { .lg-face { animation: none; } }
.lg-ai { color: ${m.ink}; }
/* Tyrkys je jeho farba (brand lock), ale na papyruse ho samotný dosvit rozleje
   do pozadia — tenký tmavý obrys pod ním drží tvar písmen. */
.lg-ai > span { color: ${r.aiInk}; text-shadow: 0 0 1px rgba(2,28,36,.95), 0 0 1px rgba(2,28,36,.95), ${r.aiShadow}; }
.lg-login .hf-plate { gap: ${s.md}px; text-align: center; }
/* TMAVÝ CHIP AINUBISA (Matej 3. 10. 2026: „Ainubis strážca brány daj do tmavého chipu").
   Hodnoty = AI_GATE_CHIP v ainubisSkin.ts (ten istý chip nesie pozvánka /pack/join). */
.lg-eyebrow {
  margin: 0; align-self: center; display: inline-flex; align-items: center; gap: 6px;
  padding: ${s.xs}px ${s.md}px; border-radius: 999px;
  background: ${r.surfaceBase}; border: 1px solid ${r.ctaEdge};
  font-family: ${y.label.fontFamily}; font-weight: ${y.label.fontWeight};
  font-size: ${y.label.fontSize}px; letter-spacing: ${y.label.letterSpacing};
  text-transform: uppercase; color: ${r.ctaA}; white-space: nowrap;
}
.lg-eyebrow .lg-ai { color: ${r.ink}; }
.lg-eyebrow .lg-ai > span { text-shadow: ${r.aiShadow}; }
.lg-title {
  margin: 0; font-family: ${y.card.fontFamily}; font-weight: 700;
  font-size: ${c.h2}px; letter-spacing: ${y.card.letterSpacing};
  text-transform: uppercase; line-height: 1.2; color: ${m.ink}; text-wrap: balance;
}
.lg-body { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${c.body}px; line-height: 1.5; color: ${m.inkSoft}; text-wrap: pretty; }
.lg-stack { display: flex; flex-direction: column; gap: ${s.sm}px; width: 100%; }
.lg-login form.lg-stack .hf-cta { margin-top: ${s.xs}px; }
.lg-pw { position: relative; width: 100%; }
.lg-pw .hf-field { padding: 0 40px; }
/* Pole ostáva 16 px (pod 16 iPhone pri ťuknutí priblíži celú stránku); zmenšuje sa
   len placeholder, inak „Nové heslo (min. 8 znakov)" medzi okrajmi pre oko odsekne. */
.lg-pw--long .hf-field::placeholder { font-size: ${c.label}px; }
.lg-eye {
  position: absolute; right: ${s.sm}px; top: 50%; transform: translateY(-50%);
  display: flex; padding: ${s.xs}px; background: none; border: none; cursor: pointer;
  color: ${m.goldInk}; opacity: .75;
}
.lg-eye:hover { opacity: 1; }
.lg-links { display: flex; justify-content: center; align-items: center; gap: ${s.sm}px; flex-wrap: wrap; color: ${m.inkMuted}; }
.lg-links .hf-skip, .lg-stack > .hf-skip { font-size: ${c.label}px; }
.lg-done { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${c.body}px; line-height: 1.5; color: ${v.edge}; font-weight: 500; }
.lg-err { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${c.micro}px; letter-spacing: .08em; text-transform: uppercase; color: ${m.inkMuted}; word-break: break-word; }
.lg-pulse { display: flex; justify-content: center; padding: ${s.xs}px 0; }
.lg-pulse span { width: 12px; height: 12px; border-radius: 999px; background: ${v.edge}; animation: lgPulse 1.2s ease-in-out infinite; }
@keyframes lgPulse { 0%,100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .lg-pulse span { animation: none; } }
.lg-gate {
  margin: ${s.md}px 0 0; text-align: center; font-family: 'Space Grotesk', sans-serif;
  font-size: ${c.label}px; line-height: 1.5; color: ${m.inkSoft}; text-wrap: balance;
}
.lg-gate a { white-space: nowrap; color: ${v.edge}; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
`,Ve=`
html.papyrus3d .lg-login .hf-block {
  background: var(--p3d-card); border: 2.5px solid var(--p3d-ink); border-radius: ${Oe.card}px;
  box-shadow: var(--p3d-pera);
}
html.papyrus3d .lg-login .lg-crest {
  background: var(--p3d-card); border: 2.5px solid var(--p3d-ink); border-radius: 999px;
  box-shadow: var(--p3d-lift);
}
html.papyrus3d .lg-login .lg-face { width: calc(100% - ${s.md}px); height: calc(100% - ${s.md}px); }
html.papyrus3d .lg-login .lg-eyebrow {
  background: none; border: none; padding: 0; color: var(--p3d-gold-ink);
}
html.papyrus3d .lg-login .lg-eyebrow .lg-ai { color: var(--p3d-ink); }
html.papyrus3d .lg-login .lg-eyebrow .lg-ai > span { color: inherit; text-shadow: none; }
html.papyrus3d .lg-login .lg-in { width: 100%; text-align: left; outline: none; }
html.papyrus3d .lg-login .lg-in::placeholder { color: ${m.inkMuted}; }
html.papyrus3d .lg-login .lg-in:focus { box-shadow: var(--p3d-inset), 0 0 0 3px ${v.halo}; }
html.papyrus3d .lg-login .lg-pw .lg-in { padding: 0 ${s.xxxl}px 0 ${s.lg}px; }
html.papyrus3d .lg-login .lg-pw--long .lg-in::placeholder { font-size: ${c.label}px; }
html.papyrus3d .lg-login .lg-eye { color: var(--p3d-ink); opacity: .7; right: ${s.md}px; }
html.papyrus3d .lg-login .lg-b3 { width: 100%; height: 54px; padding: 0 ${s.lg}px; font-size: ${c.h2}px; text-align: center; }
html.papyrus3d .lg-login .lg-b3--sm { height: 44px; font-size: ${c.lead}px; }
html.papyrus3d .lg-login form.lg-stack .lg-b3 { margin-top: 0; }
html.papyrus3d .lg-login .lg-stack { gap: ${s.md}px; }
html.papyrus3d .lg-login .lg-links { flex-direction: column; align-items: stretch; gap: ${s.md}px; margin-top: ${s.xs}px; }
html.papyrus3d .lg-login .hf-alert { font-size: ${c.body}px; }
html.papyrus3d .lg-login .lg-gate {
  margin: ${s.xs}px 0 0; padding-top: ${s.md}px; border-top: 1.5px solid rgba(42,22,8,.22);
  font-size: ${c.body}px; color: ${m.inkSoft};
}
html.papyrus3d .lg-login .lg-gate a { color: ${v.edge}; }
html.papyrus3d .lg-top { position: relative; }
html.papyrus3d .lg-top .lg-back { left: max(${s.lg}px, calc(50% - 288px)); top: 17px; z-index: 3; }
@media (min-width: 768px) { html.papyrus3d .lg-top .lg-back { top: 31px; } }
`,We=["magiclink","email","recovery","signup","invite","email_change"],ie=t=>/expired|otp_expired|invalid_token|token has expired/i.test(t),Ke=/[?&#](token_hash|token|access_token|type)=/,qe=o.lazy(()=>Re(()=>import("./AppEntry-BIeho4yL.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30])));function gt(){const[t]=le();return(re||t.get("app")==="1")&&!Ke.test(window.location.search+window.location.hash)?e.jsx(o.Suspense,{fallback:null,children:e.jsx(qe,{})}):e.jsx(Ye,{})}function Ye(){const t=ze(),{lang:L}=Be(),[d]=le(),x=Te(),[l,g]=o.useState("verifying"),[R,b]=o.useState(""),[z,B]=o.useState(!1),[T,ce]=o.useState(!1),[k,de]=o.useState(""),[ge,O]=o.useState(!1),[pe,me]=o.useState(!1),[P,ue]=o.useState(""),[U,F]=o.useState(!1),[G,h]=o.useState(""),[E,he]=o.useState(!1),[C,fe]=o.useState(!1),[D,H]=o.useState(!1),[M,xe]=o.useState(""),[V,W]=o.useState(!1),[ye,be]=o.useState(!1),[S,ke]=o.useState(""),[K,q]=o.useState(!1),[we,ve]=o.useState(!1);o.useEffect(()=>{let a=!1;const n=d.get("dogId")??"",f=d.get("next")??d.get("return"),Z=(f&&(f.startsWith("/pack")||f.startsWith("/app"))?f:null)??(n?`/pack/dogs/${n}`:"/pack"),{data:{subscription:Ce}}=p.auth.onAuthStateChange((i,u)=>{if(!a){if(i==="PASSWORD_RECOVERY"){g("recovery");return}(i==="SIGNED_IN"||i==="INITIAL_SESSION")&&u&&(g("success"),x(Z,{replace:!0}))}}),_e=setTimeout(()=>{a||g(i=>i==="verifying"?"expired":i)},7e3);async function Ae(){try{const{data:i}=await p.auth.getSession();if(!a&&(i!=null&&i.session)){g("success"),x(Z,{replace:!0});return}const u=d.get("token_hash")??d.get("token")??"",Q=d.get("type")??"magiclink",ee=We.includes(Q)?Q:"magiclink",te=window.location.hash.includes("access_token="),Le=window.location.hash.includes("error=");if(ee==="recovery"&&!u&&!te){a||g("recovery");return}if(!u&&!te){if(Le){const ae=new URLSearchParams(window.location.hash.slice(1)),se=ae.get("error_description")??ae.get("error")??"";a||(b(se),g(ie(se)?"expired":"invalid"))}else a||g("missing");return}if(!u)return;const{error:A}=await p.auth.verifyOtp({token_hash:u,type:ee});if(a)return;if(A){b(A.message),g(ie(A.message)?"expired":"invalid");return}}catch(i){if(a)return;const u=i instanceof Error?i.message:String(i);b(u),g("network")}}return Ae(),()=>{a=!0,clearTimeout(_e),Ce.unsubscribe()}},[d,x]);function Y(a){p.functions.invoke("auth-no-account",{body:{email:a,lang:L==="sk"?"sk":"en"}}).catch(()=>{})}async function Se(){const a=d.get("dogId")??"";if(!a){x("/",{replace:!0});return}B(!0);try{const{error:n}=await p.functions.invoke("resend-magic-link",{body:{dogId:a}});n?b(n.message??"Failed to resend"):ce(!0)}catch(n){b(n instanceof Error?n.message:String(n))}finally{B(!1)}}async function je(a){var f;a.preventDefault();const n=k.trim();if(!(!n||!P)){h(""),F(!0);try{const{error:_}=await p.auth.signInWithPassword({email:n,password:P});_&&h((f=_.message)!=null&&f.toLowerCase().includes("network")?t("login.password.networkError"):t("login.password.error"))}catch{h(t("login.password.networkError"))}finally{F(!1)}}}async function $e(a){a.preventDefault();const n=M.trim();if(n){W(!0);try{await p.auth.resetPasswordForEmail(n,{redirectTo:`${window.location.origin}/login?type=recovery`}),Y(n),be(!0)}finally{W(!1)}}}async function Ne(a){if(a.preventDefault(),!(S.length<8)){q(!0);try{const{error:n}=await p.auth.updateUser({password:S});n||(ve(!0),setTimeout(()=>x("/pack",{replace:!0}),1500))}finally{q(!1)}}}const X={title:t(`login.${l}.title`),body:t(`login.${l}.body`)},j=!!d.get("dogId"),Ie=l==="missing"&&!j&&D,Pe=l==="expired"||l==="invalid"||l==="network"||l==="missing"&&j,J=a=>e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}),e.jsx("circle",{cx:"12",cy:"12",r:"3"}),!a&&e.jsx("line",{x1:"3",y1:"3",x2:"21",y2:"21"})]}),$="pk-p3d-input lg-in",N="pk-b3 pk-b3--lapis lg-b3",I="pk-b3 pk-b3--paper lg-b3 lg-b3--sm",Ee=l==="missing"&&!j&&!re&&e.jsxs("p",{className:"lg-gate",children:[t("login.gate.line")," ",e.jsx(oe,{to:"/heroglyph/name",children:t("login.gate.cta")})]});return e.jsxs("div",{className:"hf-pale lg-login flex flex-col h-[100dvh] overflow-hidden",children:[e.jsxs("style",{children:[De,Me,Ve]}),e.jsxs("div",{className:"hf-topbar lg-top flex-shrink-0",children:[e.jsx(Ge,{}),e.jsx(He,{tone:"pale",className:"lg-back",style:{position:"absolute"},onClick:()=>x("/"),label:t("login.homeAria")})]}),e.jsx("div",{className:"hf-stage",children:e.jsxs("div",{className:"w-full lg-col flex flex-col items-center",children:[e.jsxs("article",{className:"hf-block lg-card",style:{marginTop:0},"aria-live":"polite",children:[e.jsx("div",{className:"lg-crest","aria-hidden":"true",children:e.jsx("div",{className:"lg-face",children:e.jsx("img",{src:Ue,alt:""})})}),e.jsxs("div",{className:"hf-plate",children:[e.jsxs("p",{className:"lg-eyebrow",children:[e.jsxs("span",{className:"lg-ai",children:[e.jsx("span",{children:"AI"}),"NUBIS"]})," · ",t("login.eyebrow")]}),Ie?e.jsxs(e.Fragment,{children:[e.jsx("h1",{className:"lg-title",children:t("login.forgot.title")}),e.jsx("p",{className:"lg-body",children:t("login.forgot.prompt")})]}):e.jsxs(e.Fragment,{children:[e.jsx("h1",{className:"lg-title",children:X.title}),e.jsx("p",{className:"lg-body",children:X.body}),d.get("deleted")==="1"&&e.jsx("p",{className:"lg-done",children:t("login.deleted").replace("{date}",(()=>{try{return sessionStorage.getItem("dogypt-deleted-on")??""}catch{return""}})())})]}),l==="verifying"&&e.jsx("div",{className:"lg-pulse","aria-hidden":"true",children:e.jsx("span",{})}),l==="missing"&&!j&&(D?e.jsxs("div",{className:"lg-stack",children:[ye?e.jsx("p",{className:"lg-done",children:t("login.forgot.sent")}):e.jsxs("form",{onSubmit:$e,className:"lg-stack",children:[e.jsx("input",{type:"email",value:M,onChange:a=>xe(a.target.value),placeholder:t("login.forgot.placeholder"),required:!0,autoComplete:"email",className:$}),e.jsx("button",{type:"submit",disabled:V,className:N,children:t(V?"login.forgot.submitting":"login.forgot.submit")})]}),e.jsx("button",{type:"button",onClick:()=>H(!1),className:I,children:t("login.forgot.back")})]}):pe?e.jsx("p",{className:"lg-done",children:t("login.magicLink.sent")}):e.jsxs("form",{onSubmit:je,className:"lg-stack",children:[e.jsx("input",{id:"login-email",type:"email",value:k,onChange:a=>{de(a.target.value),h("")},placeholder:t("login.magicLink.placeholder"),required:!0,autoComplete:"email",className:$}),e.jsxs("div",{className:"lg-pw",children:[e.jsx("input",{type:E?"text":"password",value:P,onChange:a=>{ue(a.target.value),h("")},placeholder:t("login.password.placeholder"),required:!0,autoComplete:"current-password",className:$}),e.jsx("button",{type:"button",className:"lg-eye",onClick:()=>he(a=>!a),"aria-label":E?"Hide password":"Show password",children:J(E)})]}),G&&e.jsx("p",{className:"hf-alert",children:G}),e.jsx("button",{type:"submit",disabled:U,className:N,children:t(U?"login.password.submitting":"login.password.submit")}),e.jsxs("div",{className:"lg-links",children:[e.jsx("button",{type:"button",onClick:()=>H(!0),className:I,children:t("login.password.forgotPassword")}),!ne,e.jsx("button",{type:"button",className:I,onClick:()=>{var a;if(!k.trim()){h(t("login.magicLink.needEmail")),(a=document.getElementById("login-email"))==null||a.focus();return}O(!0),h(""),p.auth.signInWithOtp({email:k.trim(),options:{emailRedirectTo:`${window.location.origin}/login`,shouldCreateUser:!1}}).then(({error:n})=>{n&&Y(k.trim()),me(!0)}).finally(()=>O(!1))},children:t(ge?"login.magicLink.submitting":"login.password.magicLinkAlt")})]})]})),l==="recovery"&&(we?e.jsx("p",{className:"lg-done",children:t("login.recovery.success")}):e.jsxs("form",{onSubmit:Ne,className:"lg-stack",children:[e.jsxs("div",{className:"lg-pw lg-pw--long",children:[e.jsx("input",{type:C?"text":"password",value:S,onChange:a=>ke(a.target.value),placeholder:t("login.recovery.newPasswordPlaceholder"),required:!0,minLength:8,autoComplete:"new-password",className:$}),e.jsx("button",{type:"button",className:"lg-eye",onClick:()=>fe(a=>!a),"aria-label":C?"Hide password":"Show password",children:J(C)})]}),e.jsx("button",{type:"submit",disabled:K||S.length<8,className:N,children:t(K?"login.recovery.submitting":"login.recovery.submit")})]})),Pe&&e.jsxs("div",{className:"lg-stack",children:[e.jsx("button",{type:"button",onClick:Se,disabled:z||T,className:N,children:t(T?"login.resend.sent":z?"login.resend.sending":"login.resend.idle")}),e.jsx(oe,{to:"/",className:I,children:t("login.backHome")})]}),R&&l!=="verifying"&&l!=="success"&&e.jsx("p",{className:"lg-err",children:R}),Ee]})]}),!ne]})})]})}export{gt as default};
