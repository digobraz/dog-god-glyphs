const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AppEntry-CosuhGLR.js","assets/index-7PctGTam.js","assets/index-BceXV8_0.css","assets/LanguagePicker--v1cJQg6.js","assets/flagUrl-B21iQI9I.js","assets/NavMedallion-DadZHC2q.js","assets/HandIcons-Dh9PgzA0.js","assets/handArrowLeft-BUyUUYuC.js","assets/SnifferLogo-Dyn0GD-G.js","assets/ainubisSkin-B7Z96MPq.js","assets/labTheme-p7t_6k9Y.js","assets/cloudinaryService-DFfDUqVM.js","assets/ainubis-head-g4iOYlxZ.js"])))=>i.map(i=>d[i]);
import{o as ae,I as oe,j as e,r as a,_ as Ee,u as Ae,h as _e,i as Ce,s as g,J as l,a0 as y,V as u,L as E,g as te,G as Le}from"./index-7PctGTam.js";import{P as Re}from"./PageTopBar-DlESgG9R.js";import{c as Be}from"./flowPaleSkin-DMjCjOr3.js";import{L as h}from"./labTheme-p7t_6k9Y.js";import{A as r}from"./ainubisSkin-B7Z96MPq.js";import{a as Te}from"./ainubis-head-g4iOYlxZ.js";import"./handArrowLeft-BUyUUYuC.js";import"./dogypt-logo-gold-D67FOL39.js";import"./dogypt-logo-mobile-B7sCn4Sq.js";import"./useBodyScrollLock--CJIKtfn.js";import"./createLucideIcon-Di02PK5p.js";import"./LanguagePicker--v1cJQg6.js";import"./flagUrl-B21iQI9I.js";const b=96,ze=`
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
  position: absolute; left: 50%; top: -${b/2}px; transform: translateX(-50%);
  width: ${b}px; height: ${b}px; z-index: 2;
  ${Le({radius:999})}
  display: flex; align-items: center; justify-content: center;
}
.lg-face {
  width: 100%; height: 100%; border-radius: 999px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: ${r.faceBg}; box-shadow: ${r.faceRing};
  animation: lgGlow 3.2s ease-in-out infinite;
}
.lg-face img { width: 82%; height: 82%; object-fit: contain; margin-top: 6%; display: block; }
.lg-login .lg-card .hf-plate { padding-top: ${b/2+l.md}px; }
.lg-login .lg-col { padding-top: ${b/2}px; }
@keyframes lgGlow {
  0%,100% { box-shadow: ${r.faceRing}; }
  50% { box-shadow: 0 0 0 1.5px rgba(${r.cyanRGB},.7), 0 0 22px rgba(${r.cyanRGB},.55); }
}
@media (prefers-reduced-motion: reduce) { .lg-face { animation: none; } }
.lg-ai { color: ${h.ink}; }
/* Tyrkys je jeho farba (brand lock), ale na papyruse ho samotný dosvit rozleje
   do pozadia — tenký tmavý obrys pod ním drží tvar písmen. */
.lg-ai > span { color: ${r.aiInk}; text-shadow: 0 0 1px rgba(2,28,36,.95), 0 0 1px rgba(2,28,36,.95), ${r.aiShadow}; }
.lg-login .hf-plate { gap: ${l.md}px; text-align: center; }
/* TMAVÝ CHIP AINUBISA (Matej 3. 10. 2026: „Ainubis strážca brány daj do tmavého chipu").
   Hodnoty = AI_GATE_CHIP v ainubisSkin.ts (ten istý chip nesie pozvánka /pack/join). */
.lg-eyebrow {
  margin: 0; align-self: center; display: inline-flex; align-items: center; gap: 6px;
  padding: ${l.xs}px ${l.md}px; border-radius: 999px;
  background: ${r.surfaceBase}; border: 1px solid ${r.ctaEdge};
  font-family: ${y.label.fontFamily}; font-weight: ${y.label.fontWeight};
  font-size: ${y.label.fontSize}px; letter-spacing: ${y.label.letterSpacing};
  text-transform: uppercase; color: ${r.ctaA}; white-space: nowrap;
}
.lg-eyebrow .lg-ai { color: ${r.ink}; }
.lg-eyebrow .lg-ai > span { text-shadow: ${r.aiShadow}; }
.lg-title {
  margin: 0; font-family: ${y.card.fontFamily}; font-weight: 700;
  font-size: ${u.h2}px; letter-spacing: ${y.card.letterSpacing};
  text-transform: uppercase; line-height: 1.2; color: ${h.ink}; text-wrap: balance;
}
.lg-body { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${u.body}px; line-height: 1.5; color: ${h.inkSoft}; text-wrap: pretty; }
.lg-stack { display: flex; flex-direction: column; gap: ${l.sm}px; width: 100%; }
.lg-login form.lg-stack .hf-cta { margin-top: ${l.xs}px; }
.lg-pw { position: relative; width: 100%; }
.lg-pw .hf-field { padding: 0 40px; }
/* Pole ostáva 16 px (pod 16 iPhone pri ťuknutí priblíži celú stránku); zmenšuje sa
   len placeholder, inak „Nové heslo (min. 8 znakov)" medzi okrajmi pre oko odsekne. */
.lg-pw--long .hf-field::placeholder { font-size: ${u.label}px; }
.lg-eye {
  position: absolute; right: ${l.sm}px; top: 50%; transform: translateY(-50%);
  display: flex; padding: ${l.xs}px; background: none; border: none; cursor: pointer;
  color: ${h.goldInk}; opacity: .75;
}
.lg-eye:hover { opacity: 1; }
.lg-links { display: flex; justify-content: center; align-items: center; gap: ${l.sm}px; flex-wrap: wrap; color: ${h.inkMuted}; }
.lg-links .hf-skip, .lg-stack > .hf-skip { font-size: ${u.label}px; }
.lg-done { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${u.body}px; line-height: 1.5; color: ${E.edge}; font-weight: 500; }
.lg-err { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: ${u.micro}px; letter-spacing: .08em; text-transform: uppercase; color: ${h.inkMuted}; word-break: break-word; }
.lg-pulse { display: flex; justify-content: center; padding: ${l.xs}px 0; }
.lg-pulse span { width: 12px; height: 12px; border-radius: 999px; background: ${E.edge}; animation: lgPulse 1.2s ease-in-out infinite; }
@keyframes lgPulse { 0%,100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .lg-pulse span { animation: none; } }
.lg-gate {
  margin: ${l.md}px 0 0; text-align: center; font-family: 'Space Grotesk', sans-serif;
  font-size: ${u.label}px; line-height: 1.5; color: ${h.inkSoft}; text-wrap: balance;
}
.lg-gate a { white-space: nowrap; color: ${E.edge}; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
`,Oe=["magiclink","email","recovery","signup","invite","email_change"],se=t=>/expired|otp_expired|invalid_token|token has expired/i.test(t),Fe=/[?&#](token_hash|token|access_token|type)=/,Ue=a.lazy(()=>Ee(()=>import("./AppEntry-CosuhGLR.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12])));function tt(){const[t]=ae();return(oe||t.get("app")==="1")&&!Fe.test(window.location.search+window.location.hash)?e.jsx(a.Suspense,{fallback:null,children:e.jsx(Ue,{})}):e.jsx(Ge,{})}function Ge(){const t=Ae(),{lang:A}=_e(),[c]=ae(),f=Ce(),[i,d]=a.useState("verifying"),[_,k]=a.useState(""),[C,L]=a.useState(!1),[R,ne]=a.useState(!1),[w,ie]=a.useState(""),[re,B]=a.useState(!1),[le,ce]=a.useState(!1),[j,de]=a.useState(""),[T,z]=a.useState(!1),[O,m]=a.useState(""),[N,ge]=a.useState(!1),[$,pe]=a.useState(!1),[F,U]=a.useState(!1),[G,me]=a.useState(""),[H,D]=a.useState(!1),[ue,he]=a.useState(!1),[S,fe]=a.useState(""),[M,V]=a.useState(!1),[xe,ye]=a.useState(!1);a.useEffect(()=>{let s=!1;const o=c.get("dogId")??"",x=c.get("next")??c.get("return"),Y=(x&&x.startsWith("/pack")?x:null)??(o?`/pack/dogs/${o}`:"/pack"),{data:{subscription:Ne}}=g.auth.onAuthStateChange((n,p)=>{if(!s){if(n==="PASSWORD_RECOVERY"){d("recovery");return}(n==="SIGNED_IN"||n==="INITIAL_SESSION")&&p&&(d("success"),f(Y,{replace:!0}))}}),$e=setTimeout(()=>{s||d(n=>n==="verifying"?"expired":n)},7e3);async function Ie(){try{const{data:n}=await g.auth.getSession();if(!s&&(n!=null&&n.session)){d("success"),f(Y,{replace:!0});return}const p=c.get("token_hash")??c.get("token")??"",J=c.get("type")??"magiclink",X=Oe.includes(J)?J:"magiclink",Z=window.location.hash.includes("access_token="),Pe=window.location.hash.includes("error=");if(X==="recovery"&&!p&&!Z){s||d("recovery");return}if(!p&&!Z){if(Pe){const Q=new URLSearchParams(window.location.hash.slice(1)),ee=Q.get("error_description")??Q.get("error")??"";s||(k(ee),d(se(ee)?"expired":"invalid"))}else s||d("missing");return}if(!p)return;const{error:P}=await g.auth.verifyOtp({token_hash:p,type:X});if(s)return;if(P){k(P.message),d(se(P.message)?"expired":"invalid");return}}catch(n){if(s)return;const p=n instanceof Error?n.message:String(n);k(p),d("network")}}return Ie(),()=>{s=!0,clearTimeout($e),Ne.unsubscribe()}},[c,f]);function W(s){g.functions.invoke("auth-no-account",{body:{email:s,lang:A==="sk"?"sk":"en"}}).catch(()=>{})}async function ke(){const s=c.get("dogId")??"";if(!s){f("/",{replace:!0});return}L(!0);try{const{error:o}=await g.functions.invoke("resend-magic-link",{body:{dogId:s}});o?k(o.message??"Failed to resend"):ne(!0)}catch(o){k(o instanceof Error?o.message:String(o))}finally{L(!1)}}async function we(s){var x;s.preventDefault();const o=w.trim();if(!(!o||!j)){m(""),z(!0);try{const{error:I}=await g.auth.signInWithPassword({email:o,password:j});I&&m((x=I.message)!=null&&x.toLowerCase().includes("network")?t("login.password.networkError"):t("login.password.error"))}catch{m(t("login.password.networkError"))}finally{z(!1)}}}async function be(s){s.preventDefault();const o=G.trim();if(o){D(!0);try{await g.auth.resetPasswordForEmail(o,{redirectTo:`${window.location.origin}/login?type=recovery`}),W(o),he(!0)}finally{D(!1)}}}async function Se(s){if(s.preventDefault(),!(S.length<8)){V(!0);try{const{error:o}=await g.auth.updateUser({password:S});o||(ye(!0),setTimeout(()=>f("/pack",{replace:!0}),1500))}finally{V(!1)}}}const K={title:t(`login.${i}.title`),body:t(`login.${i}.body`)},v=!!c.get("dogId"),ve=i==="missing"&&!v&&F,je=i==="expired"||i==="invalid"||i==="network"||i==="missing"&&v,q=s=>e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"}),e.jsx("circle",{cx:"12",cy:"12",r:"3"}),!s&&e.jsx("line",{x1:"3",y1:"3",x2:"21",y2:"21"})]});return e.jsxs("div",{className:"hf-pale lg-login flex flex-col h-[100dvh] overflow-hidden",children:[e.jsxs("style",{children:[Be,ze]}),e.jsx("div",{className:"hf-topbar flex-shrink-0",children:e.jsx(Re,{brandBack:!0,onBack:()=>f("/"),backAriaLabel:t("login.homeAria")})}),e.jsx("div",{className:"hf-stage",children:e.jsxs("div",{className:"w-full lg-col flex flex-col items-center",children:[e.jsxs("article",{className:"hf-block lg-card",style:{marginTop:0},"aria-live":"polite",children:[e.jsx("div",{className:"lg-crest","aria-hidden":"true",children:e.jsx("div",{className:"lg-face",children:e.jsx("img",{src:Te,alt:""})})}),e.jsxs("div",{className:"hf-plate",children:[e.jsxs("p",{className:"lg-eyebrow",children:[e.jsxs("span",{className:"lg-ai",children:[e.jsx("span",{children:"AI"}),"NUBIS"]})," · ",t("login.eyebrow")]}),ve?e.jsxs(e.Fragment,{children:[e.jsx("h1",{className:"lg-title",children:t("login.forgot.title")}),e.jsx("p",{className:"lg-body",children:t("login.forgot.prompt")})]}):e.jsxs(e.Fragment,{children:[e.jsx("h1",{className:"lg-title",children:K.title}),e.jsx("p",{className:"lg-body",children:K.body}),c.get("deleted")==="1"&&e.jsx("p",{className:"lg-done",children:t("login.deleted").replace("{date}",(()=>{try{return sessionStorage.getItem("dogypt-deleted-on")??""}catch{return""}})())})]}),i==="verifying"&&e.jsx("div",{className:"lg-pulse","aria-hidden":"true",children:e.jsx("span",{})}),i==="missing"&&!v&&(F?e.jsxs("div",{className:"lg-stack",children:[ue?e.jsx("p",{className:"lg-done",children:t("login.forgot.sent")}):e.jsxs("form",{onSubmit:be,className:"lg-stack",children:[e.jsx("input",{type:"email",value:G,onChange:s=>me(s.target.value),placeholder:t("login.forgot.placeholder"),required:!0,autoComplete:"email",className:"hf-field"}),e.jsx("button",{type:"submit",disabled:H,className:"hf-cta",children:t(H?"login.forgot.submitting":"login.forgot.submit")})]}),e.jsx("button",{type:"button",onClick:()=>U(!1),className:"hf-skip",children:t("login.forgot.back")})]}):le?e.jsx("p",{className:"lg-done",children:t("login.magicLink.sent")}):e.jsxs("form",{onSubmit:we,className:"lg-stack",children:[e.jsx("input",{id:"login-email",type:"email",value:w,onChange:s=>{ie(s.target.value),m("")},placeholder:t("login.magicLink.placeholder"),required:!0,autoComplete:"email",className:"hf-field"}),e.jsxs("div",{className:"lg-pw",children:[e.jsx("input",{type:N?"text":"password",value:j,onChange:s=>{de(s.target.value),m("")},placeholder:t("login.password.placeholder"),required:!0,autoComplete:"current-password",className:"hf-field"}),e.jsx("button",{type:"button",className:"lg-eye",onClick:()=>ge(s=>!s),"aria-label":N?"Hide password":"Show password",children:q(N)})]}),O&&e.jsx("p",{className:"hf-alert",children:O}),e.jsx("button",{type:"submit",disabled:T,className:"hf-cta",children:t(T?"login.password.submitting":"login.password.submit")}),e.jsxs("div",{className:"lg-links",children:[e.jsx("button",{type:"button",onClick:()=>U(!0),className:"hf-skip",children:t("login.password.forgotPassword")}),e.jsx("span",{"aria-hidden":!0,children:"·"}),e.jsx("button",{type:"button",className:"hf-skip",onClick:()=>{var s;if(!w.trim()){m(t("login.magicLink.needEmail")),(s=document.getElementById("login-email"))==null||s.focus();return}B(!0),m(""),g.auth.signInWithOtp({email:w.trim(),options:{emailRedirectTo:`${window.location.origin}/login`,shouldCreateUser:!1}}).then(({error:o})=>{o&&W(w.trim()),ce(!0)}).finally(()=>B(!1))},children:t(re?"login.magicLink.submitting":"login.password.magicLinkAlt")})]})]})),i==="recovery"&&(xe?e.jsx("p",{className:"lg-done",children:t("login.recovery.success")}):e.jsxs("form",{onSubmit:Se,className:"lg-stack",children:[e.jsxs("div",{className:"lg-pw lg-pw--long",children:[e.jsx("input",{type:$?"text":"password",value:S,onChange:s=>fe(s.target.value),placeholder:t("login.recovery.newPasswordPlaceholder"),required:!0,minLength:8,autoComplete:"new-password",className:"hf-field"}),e.jsx("button",{type:"button",className:"lg-eye",onClick:()=>pe(s=>!s),"aria-label":$?"Hide password":"Show password",children:q($)})]}),e.jsx("button",{type:"submit",disabled:M||S.length<8,className:"hf-cta",children:t(M?"login.recovery.submitting":"login.recovery.submit")})]})),je&&e.jsxs("div",{className:"lg-stack",children:[e.jsx("button",{type:"button",onClick:ke,disabled:C||R,className:"hf-cta",children:t(R?"login.resend.sent":C?"login.resend.sending":"login.resend.idle")}),e.jsx(te,{to:"/",className:"hf-skip",children:t("login.backHome")})]}),_&&i!=="verifying"&&i!=="success"&&e.jsx("p",{className:"lg-err",children:_})]})]}),i==="missing"&&!v&&!oe&&e.jsxs("p",{className:"lg-gate",children:[t("login.gate.line")," ",e.jsx(te,{to:"/heroglyph/name",children:t("login.gate.cta")})]})]})})]})}export{tt as default};
