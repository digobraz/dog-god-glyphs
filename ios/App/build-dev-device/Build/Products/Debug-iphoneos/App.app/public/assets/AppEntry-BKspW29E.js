import{l as Z,r as l,j as e,Y as ee,ai as ae,J as I,L as j,F as a,K as L,O as b,W as C,k as w,P as v,A as B,b as te,b0 as oe,Q as P,af as K,u as T,e as V,E as se,S as ne}from"./index-B-BQrD2y.js";import{supabase as U}from"./client-rJzPTh-q.js";import{L as re}from"./LanguagePicker-CQj7MbWL.js";import{N as ie,a as le}from"./NavMedallion-B1GKCKyz.js";import{m as ce}from"./HandIcons-nK6bMixK.js";import{S as pe}from"./SnifferLogo-Ch81E6FO.js";import{A as u}from"./ainubisSkin-B7Z96MPq.js";import{L as N}from"./labTheme-p7t_6k9Y.js";import{s as de}from"./cloudinaryService-BTfH_t1m.js";import{a as me}from"./ainubis-head-g4iOYlxZ.js";import"./tslib.es6-CmEaCU22.js";import"./flagUrl-B21iQI9I.js";import"./handArrowLeft-DN9pj_cL.js";const ue="/assets/brana-dvere-CQ5KU2q-.webp",xe="/assets/dotyk-labka-DjGf9b_T.webp",ge="/assets/dotyk-ruka-Dn0L24bu.webp",W="/assets/logo-2026-BUMX5muK.svg",J="dogypt_app_perm_v1",Y=()=>{try{return localStorage.getItem(J)==="1"}catch{return!1}},be=()=>{try{localStorage.setItem(J,"1")}catch{}},M="dogypt_app_pending_v1",he=60*6e4,F=t=>{try{t?localStorage.setItem(M,JSON.stringify({s:t,at:Date.now()})):localStorage.removeItem(M)}catch{}},X=()=>{try{const t=JSON.parse(localStorage.getItem(M)||"null");return t&&Date.now()-t.at<he?t.s:null}catch{return null}},_={aspectW:9,aspectH:16,cx:.5,cy:.44,r:.29},R=900,q=1100,H=2200;async function O(t){const o=await fetch(`${se}/app-login`,{method:"POST",headers:{"Content-Type":"application/json",apikey:ne},body:JSON.stringify(t)});let r={};try{r=await o.json()}catch{}return{status:o.status,data:r}}const Q=()=>{var t;return typeof window<"u"&&((t=window.matchMedia)==null?void 0:t.call(window,"(prefers-reduced-motion: reduce)").matches)};function fe(){const[t,o]=l.useState(()=>({w:window.innerWidth,h:window.innerHeight}));return l.useEffect(()=>{const r=()=>o({w:window.innerWidth,h:window.innerHeight});return window.addEventListener("resize",r),()=>window.removeEventListener("resize",r)},[]),t}function $e({onDone:t}){const o=T(),{w:r,h:s}=fe(),[h,d]=l.useState(!1),x=r/s>.75?s/_.aspectH:Math.max(r/_.aspectW,s/_.aspectH),c=_.aspectW*x,n=_.aspectH*x,f=(r-c)/2,$=(s-n)/2,p=f+_.cx*c,S=$+_.cy*n,y=_.r*c,m=`radial-gradient(circle ${y-1}px at ${p}px ${S}px, transparent ${y-1}px, #000 ${y-.5}px)`,A={backgroundImage:`url(${ue})`,backgroundSize:`${c}px ${n}px`,backgroundPosition:`${f}px ${$}px`},g=()=>{h||(d(!0),window.setTimeout(t,Q()?200:R+q))};return e.jsxs("div",{className:`ae-gate${h?" is-open":""}`,children:[e.jsx("div",{className:"ae-leaf ae-leaf--r",style:{WebkitMaskImage:m,maskImage:m},children:e.jsx("i",{style:{...A,clipPath:`inset(0 0 0 ${p}px)`}})}),e.jsxs("div",{className:"ae-leaf ae-leaf--l",children:[e.jsx("i",{style:{...A,clipPath:`inset(0 ${r-p}px 0 0)`}}),e.jsx("div",{className:"ae-medal",style:{transformOrigin:`${p}px ${S}px`},children:e.jsx("div",{className:"ae-medal-at",style:{left:p,top:S,"--medal-k":(2*y/100).toFixed(3)},children:e.jsx(le,{still:!0,flat:!0,face:e.jsx("b",{className:"ae-medal-logo",style:{WebkitMaskImage:`url(${W})`,maskImage:`url(${W})`}})})})})]}),e.jsx("button",{type:"button",className:"pk-pill pk-pill--tap ae-enter",onClick:g,children:o("appEntry.enter")})]})}function ye({onDone:t}){return l.useEffect(()=>{const o=window.setTimeout(t,Q()?300:H+400);return()=>window.clearTimeout(o)},[t]),e.jsxs("div",{className:"ae-touch",onClick:t,children:[e.jsx("div",{className:"ae-touch-glow"}),e.jsx("div",{className:"ae-touch-img ae-touch-paw",style:{backgroundImage:`url(${xe})`}}),e.jsx("div",{className:"ae-touch-img ae-touch-hand",style:{backgroundImage:`url(${ge})`}})]})}function ke({onSent:t}){const o=T(),{lang:r}=V(),[s,h]=l.useState(""),[d,x]=l.useState(!1),[c,n]=l.useState(""),[f,$]=l.useState(!1),[p,S]=l.useState(""),y=(g,E)=>o(g===429?"appEntry.err.rate":E==="not_found"?"appEntry.err.notFound":"appEntry.err.net"),m=async g=>{g.preventDefault();const E=s.replace(/\D/g,"");if(!(!E||d)){x(!0),n("");try{const{status:z,data:i}=await O({action:"send",number:Number(E),lang:r});i.ok?t({masked:String(i.masked),codeLength:Number(i.codeLength)||8,dogs:i.dogs??[],entered:Number(E)}):n(y(z,i.error))}catch{n(o("appEntry.err.net"))}x(!1)}},A=async g=>{g.preventDefault();const E=p.trim();if(!(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(E)||d)){x(!0),n("");try{const{status:z,data:i}=await O({action:"send",email:E,lang:r});i.ok?t({masked:String(i.masked),codeLength:Number(i.codeLength)||8,dogs:[],email:E}):n(y(z,i.error))}catch{n(o("appEntry.err.net"))}x(!1)}};return e.jsxs("div",{className:"ae-screen",children:[e.jsx("div",{className:"ae-flag",children:e.jsx(re,{variant:"flow"})}),e.jsxs("form",{className:"ae-body",onSubmit:m,children:[e.jsx("p",{className:"ae-eyebrow",children:o("appEntry.eyebrow")}),e.jsx("h1",{className:"ae-title",children:o("appEntry.number.title")}),e.jsx("p",{className:"ae-sub",children:o("appEntry.number.sub")}),e.jsxs("label",{className:"ae-num pf-field",children:[e.jsx("span",{"aria-hidden":!0,children:"#"}),e.jsx("input",{inputMode:"numeric",pattern:"[0-9]*",autoComplete:"off","aria-label":o("appEntry.number.title"),value:s,onChange:g=>h(g.target.value.replace(/\D/g,"").slice(0,7))})]}),c&&!f&&e.jsx("p",{className:"ae-err",role:"alert",children:c}),e.jsx("button",{type:"submit",className:"ae-cta",disabled:!s||d,children:o("appEntry.continue")}),e.jsx("button",{type:"button",className:"ae-link",onClick:()=>{n(""),$(!0)},children:o("appEntry.noNumber")})]}),f&&e.jsx("div",{className:"ae-veil",onClick:()=>$(!1),children:e.jsxs("form",{className:"ae-sheet",onClick:g=>g.stopPropagation(),onSubmit:A,children:[e.jsx("span",{className:"ae-grip"}),e.jsx("h2",{className:"ae-title ae-title--sheet",children:o("appEntry.mail.title")}),e.jsx("p",{className:"ae-sub",children:o("appEntry.mail.sub")}),e.jsx("input",{className:"ae-mail pf-field",type:"email",inputMode:"email",autoComplete:"email",autoFocus:!0,placeholder:"meno@mail.com",value:p,onChange:g=>S(g.target.value)}),c&&e.jsx("p",{className:"ae-err",role:"alert",children:c}),e.jsx("button",{type:"submit",className:"ae-cta",disabled:d,children:o("appEntry.mail.send")})]})})]})}function we({dogs:t,me:o}){if(!t.length)return null;const r=t.length===1?72:t.length<=4?46:44;return e.jsx("div",{className:"ae-dogs",style:{"--dw":`${r}px`},children:t.map(s=>e.jsxs("div",{className:"ae-dog",children:[e.jsx("span",{className:`ae-av${s.n===o?" is-me":""}`,style:s.photo?{backgroundImage:`url(${de(s.photo,216)})`}:void 0,children:e.jsxs("b",{children:["#",s.n]})}),e.jsx("span",{className:"ae-dog-name",children:(s.name??"").toUpperCase()})]},s.n))})}function Ne({sent:t,onIn:o,onOther:r}){const s=T(),{lang:h}=V(),[d,x]=l.useState(""),[c,n]=l.useState(!1),[f,$]=l.useState(""),[p,S]=l.useState(!1),y=l.useRef(null),m=t.codeLength,A=t.entered!==void 0?{number:t.entered}:{email:t.email},g=l.useCallback(async i=>{if(!(i.length!==m||c)){n(!0),$("");try{const{status:k,data:D}=await O({action:"verify",code:i,...A});if(D.ok&&D.access_token&&D.refresh_token){const{error:G}=await U.auth.setSession({access_token:String(D.access_token),refresh_token:String(D.refresh_token)});if(G)throw G;o();return}$(s(k===429?"appEntry.err.rate":"appEntry.err.badCode")),x("")}catch{$(s("appEntry.err.net"))}n(!1)}},[m,c,o,s,t]),E=async()=>{var i;try{const k=(await navigator.clipboard.readText()).replace(/\D/g,"").slice(0,m);if(!k)return;x(k),k.length===m&&g(k)}catch{(i=y.current)==null||i.focus()}},z=async()=>{$("");try{await O({action:"send",lang:h,...A}),S(!0)}catch{$(s("appEntry.err.net"))}};return e.jsx("div",{className:"ae-screen",children:e.jsxs("form",{className:"ae-body",onSubmit:i=>{i.preventDefault(),g(d)},children:[e.jsx(we,{dogs:t.dogs,me:t.entered}),e.jsx("h1",{className:"ae-title",children:s("appEntry.code.title")}),e.jsx("p",{className:"ae-sub",children:s("appEntry.code.sub",{mail:t.masked})}),e.jsxs("label",{className:"ae-code",style:{"--n":m},onClick:()=>{var i;return(i=y.current)==null?void 0:i.focus()},children:[Array.from({length:m},(i,k)=>e.jsx("i",{className:`pf-field${k===d.length?" is-cur":""}${k===m/2-1?" is-half":""}`,children:d[k]??""},k)),e.jsx("input",{ref:y,className:"ae-code-input",inputMode:"numeric",autoComplete:"one-time-code",autoFocus:!0,"aria-label":s("appEntry.code.title"),value:d,onChange:i=>{const k=i.target.value.replace(/\D/g,"").slice(0,m);x(k),k.length===m&&g(k)}})]}),f&&e.jsx("p",{className:"ae-err",role:"alert",children:f}),e.jsx("button",{type:"submit",className:"ae-cta",disabled:d.length!==m||c,children:s("appEntry.code.enter")}),e.jsx("button",{type:"button",className:"ae-link",onClick:E,children:s("appEntry.code.paste")}),e.jsx("button",{type:"button",className:"ae-link",onClick:z,disabled:p,children:s(p?"appEntry.code.sent":"appEntry.code.again")}),e.jsx("button",{type:"button",className:"ae-link ae-link--quiet",onClick:r,children:s("appEntry.code.other")})]})})}function je({onDone:t}){const o=T(),[r,s]=l.useState({push:!0,geo:!0,ai:!1}),[h,d]=l.useState(null),x=async n=>{const f=n?r:{push:!1,geo:!1,ai:!1};be();try{await U.auth.updateUser({data:{app_perm:{...f,at:new Date().toISOString()}}})}catch{}if(f.geo&&"geolocation"in navigator)try{navigator.geolocation.getCurrentPosition(()=>{},()=>{},{timeout:8e3})}catch{}t()},c=(n,f,$,p,S=!1)=>e.jsxs("div",{className:`ae-perm${S?" ae-perm--ai":""}${r[n]?" is-on":""}${h===n?" is-open":""}`,onClick:()=>d(y=>y===n?null:n),children:[f,e.jsx("span",{className:"ae-perm-title",children:$}),e.jsx("button",{type:"button",role:"switch","aria-checked":r[n],className:"ae-sw",onClick:y=>{y.stopPropagation(),s(m=>({...m,[n]:!m[n]}))},children:e.jsx("i",{})}),e.jsx("small",{children:p})]});return e.jsx("div",{className:"ae-screen",children:e.jsxs("div",{className:"ae-body",children:[e.jsx("p",{className:"ae-eyebrow",children:o("appEntry.perm.eyebrow")}),e.jsx("h1",{className:"ae-title ae-title--perm",children:o("appEntry.perm.title")}),c("push",e.jsxs("span",{className:"ae-ib",children:[e.jsx(ce,{size:22}),e.jsx("em",{className:"ae-dot ae-dot--b",children:"3"}),e.jsx("em",{className:"ae-dot ae-dot--r",children:"2"})]}),o("appEntry.perm.push"),o("appEntry.perm.pushText")),c("geo",e.jsx("span",{className:"ae-ib",children:e.jsx("img",{src:"/icons/pack/world-grid.svg",alt:""})}),o("appEntry.perm.geo"),o("appEntry.perm.geoText")),c("ai",e.jsx("span",{className:"ae-ib ae-ib--ai",children:e.jsx("img",{src:me,alt:""})}),e.jsxs("span",{className:"ae-ai-name",children:[e.jsx("span",{children:"AI"}),"NUBIS"]}),o("appEntry.perm.aiText"),!0),e.jsx("button",{type:"button",className:"ae-cta ae-cta--perm",onClick:()=>void x(!0),children:o("appEntry.continue")}),e.jsx("button",{type:"button",className:"ae-link",onClick:()=>void x(!1),children:o("appEntry.perm.later")})]})})}function Ke(){const[t]=Z(),[o,r]=l.useState(X),[s,h]=l.useState(()=>X()?"code":"gate"),d=t.get("next")??t.get("return"),x=d&&d.startsWith("/pack")?d:"/pack",c=l.useCallback(()=>window.location.replace(x),[x]);l.useEffect(()=>{let p=!1;return U.auth.getSession().then(({data:S})=>{p||!S.session||(Y()?c():h("perm"))}),()=>{p=!0}},[c]);const n=l.useCallback(()=>h("touch"),[]),f=l.useCallback(()=>h("number"),[]),$=l.useCallback(()=>{F(null),Y()?c():h("perm")},[c]);return e.jsxs("div",{className:"ae-root",children:[e.jsx("style",{children:ie+ee+ae+ve}),s==="gate"&&e.jsx($e,{onDone:n}),s==="touch"&&e.jsx(ye,{onDone:f}),s==="number"&&e.jsx(ke,{onSent:p=>{F(p),r(p),h("code")}}),s==="code"&&o&&e.jsx(Ne,{sent:o,onIn:$,onOther:()=>{F(null),r(null),h("number")}}),s==="perm"&&e.jsx(je,{onDone:c})]})}const ve=`
.ae-root {
  position: fixed; inset: 0; overflow: hidden;
  background: ${N.pageBackdrop}; background-color: ${N.pageBg};
  color: ${N.ink}; font-family: ${I};
}

/* ── 1 · BRÁNA ─────────────────────────────────────────────────────────── */
.ae-gate { position: absolute; inset: 0; cursor: pointer; }
.ae-leaf { position: absolute; inset: 0; transition: transform ${q/1e3}s cubic-bezier(.7,0,.2,1) ${R/1e3}s; }
.ae-leaf > i { position: absolute; inset: 0; background-repeat: no-repeat; }
.ae-medal { position: absolute; inset: 0; transition: transform ${R/1e3}s cubic-bezier(.5,0,.3,1); }
.ae-medal-at { position: absolute; width: 0; height: 0; }
.ae-gate.is-open .ae-medal { transform: rotate(-90deg); }
.ae-gate.is-open .ae-leaf--l { transform: translateX(-102%); }
.ae-gate.is-open .ae-leaf--r { transform: translateX(102%); }
/* Logo 2026 v LAPISE (Matej 20. 10.: „asi by som ho dal v lapise"), maska SVG = kresba 1:1. */
.ae-medal-logo {
  display: block; width: 78%; aspect-ratio: 1; transform: translateY(-2px);
  background: ${j.deep};
  -webkit-mask-position: center; mask-position: center;
  -webkit-mask-size: contain; mask-size: contain;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
}
.ae-enter {
  position: absolute; left: 50%; transform: translateX(-50%); z-index: 5;
  bottom: calc(env(safe-area-inset-bottom, 0px) + ${a.xxxl}px);
  padding: ${a.sm}px ${a.xl}px;
  font-family: ${L}; font-weight: 700; font-size: ${b.body}px; letter-spacing: ${C.card.letterSpacing};
  transition: opacity .3s;
}
.ae-gate.is-open .ae-enter { opacity: 0; pointer-events: none; }

/* ── 2 · DOTYK ─────────────────────────────────────────────────────────── */
.ae-touch { position: absolute; inset: 0; cursor: pointer; }
.ae-touch-img { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat;
  animation: aeMeet ${H/1e3}s cubic-bezier(.4,0,.2,1) forwards; }
.ae-touch-paw { transform: translate(18%, -22%); }
.ae-touch-hand { transform: translate(-14%, 22%); }
.ae-touch-glow {
  position: absolute; left: 54%; top: 45.6%; width: ${a.xl}px; height: ${a.xl}px;
  margin: -${a.md}px; border-radius: ${w.pill}px; background: ${v.card};
  box-shadow: 0 0 40px 20px rgba(201,154,63,.7); opacity: 0; transform: scale(.2);
  animation: aeSpark ${H/1e3}s forwards;
}
@keyframes aeMeet { to { transform: none; } }
@keyframes aeSpark { 0%,70% { opacity: 0; transform: scale(.2); } 85% { opacity: 1; transform: scale(1); } 100% { opacity: .85; transform: scale(1.6); } }

/* ── OBRAZOVKY (ČÍSLO · KÓD · POVOLENIA) — papyrus, bez D-BLOKU, loga a šípky späť ── */
.ae-screen { position: absolute; inset: 0; overflow-y: auto; display: flex; flex-direction: column;
  padding: calc(env(safe-area-inset-top, 0px) + ${B.min}px) ${B.side}px calc(env(safe-area-inset-bottom, 0px) + ${B.min}px); }
/* Centrovanie margin:auto na dieťati, nie justify-center (pasca PAGE_AIR: horná časť by sa nedala odrolovať). */
.ae-body { margin: auto; width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.ae-flag { display: flex; justify-content: center; padding-top: ${a.xxl}px; }
.ae-flag .lang-trigger {
  display: inline-flex; align-items: center; gap: ${a.sm}px;
  padding: ${a.xs}px ${a.md}px; border-radius: ${w.pill}px;
  background: linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%); border: 1.5px solid rgba(179,130,45,0.42);
  color: ${N.inkSoft}; cursor: pointer;
}
.ae-eyebrow { margin: 0 0 ${a.sm}px; font-family: ${C.label.fontFamily}; font-weight: ${C.label.fontWeight};
  font-size: ${C.label.fontSize}px; letter-spacing: ${C.label.letterSpacing}; text-transform: uppercase; color: ${N.goldInk}; }
.ae-title { margin: 0 0 ${a.sm}px; font-family: ${C.card.fontFamily}; font-weight: 700; font-size: ${b.h1}px;
  letter-spacing: ${C.card.letterSpacing}; line-height: 1.2; text-transform: uppercase; color: ${N.ink}; }
.ae-title--sheet { font-size: ${b.h2}px; }
.ae-title--perm { margin-bottom: ${a.xl}px; }
.ae-sub { margin: 0 0 ${a.xl}px; font-size: ${b.body}px; line-height: 1.5; color: ${N.inkSoft}; text-wrap: pretty; }
.ae-err { margin: -${a.sm}px 0 ${a.md}px; font-size: ${b.label}px; line-height: 1.4; color: ${v.ink}; }

.ae-num { width: 100%; height: 56px; border-radius: ${w.tile}px; margin-bottom: ${a.lg}px;
  display: flex; align-items: center; justify-content: center; gap: ${a.sm}px;
  font-size: ${b.h1}px; letter-spacing: ${C.card.letterSpacing}; color: ${N.ink}; }
.ae-num:focus-within { border-color: ${j.edge}; box-shadow: inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px ${j.halo}; }
.ae-num input { width: 6ch; border: 0; background: none; outline: none; font: inherit; letter-spacing: inherit; color: inherit; padding: 0; }
.ae-mail { width: 100%; height: 56px; border-radius: ${w.tile}px; margin-bottom: ${a.lg}px; padding: 0 ${a.lg}px;
  text-align: center; font-family: ${I}; font-size: ${b.lead}px; color: ${N.ink}; }

.ae-cta { width: 100%; height: 48px; border: 0; border-radius: ${w.field}px; cursor: pointer;
  background: ${j.grad}; color: ${j.ink}; box-shadow: ${te};
  font-family: ${L}; font-weight: 700; font-size: ${b.body}px; letter-spacing: ${C.card.letterSpacing}; text-transform: uppercase; }
.ae-cta:hover:not(:disabled) { background: ${j.gradHover}; }
.ae-cta:disabled { opacity: .4; cursor: default; box-shadow: none; }
.ae-cta--perm { margin-top: ${a.lg}px; }
.ae-link { margin-top: ${a.lg}px; border: 0; background: none; padding: ${a.xs}px; cursor: pointer;
  font-family: ${I}; font-size: ${b.label}px; color: ${N.inkSoft}; }
.ae-link:disabled { cursor: default; }
.ae-link--quiet { margin-top: ${a.xs}px; color: ${N.inkMuted}; }

/* šuplík zdola */
.ae-veil { position: absolute; inset: 0; z-index: 10; background: ${oe.modal}; display: flex; align-items: flex-end; }
.ae-sheet {
  width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;
  background: ${P.panel.background}; border-top: ${P.panel.border}; box-shadow: ${K.panel};
  border-radius: ${w.card}px ${w.card}px 0 0;
  padding: ${a.md}px ${a.xl}px calc(env(safe-area-inset-bottom, 0px) + ${a.xxl}px);
  animation: aeUp .28s cubic-bezier(.2,.8,.2,1);
}
.ae-sheet > * { max-width: 400px; }
.ae-grip { width: 40px; height: 4px; border-radius: ${w.pill}px; background: ${v.border}; margin-bottom: ${a.lg}px; }
@keyframes aeUp { from { transform: translateY(100%); } to { transform: none; } }

/* ── avatary psov — KRÚŽOK patrí fotke psa ─────────────────────────────── */
.ae-dogs { display: flex; flex-wrap: wrap; justify-content: center; gap: ${a.md}px ${a.sm}px;
  margin: 0 auto ${a.xl}px; max-width: calc(4 * var(--dw) + 3 * ${a.sm}px + 1px); }
.ae-dog { display: flex; flex-direction: column; align-items: center; gap: ${a.sm}px; width: var(--dw); }
.ae-av { position: relative; display: block; width: var(--dw); height: var(--dw); border-radius: ${w.pill}px;
  background: ${v.cardGrad} center / cover; border: 2px solid ${v.cardEdge}; box-shadow: ${K.card}; }
.ae-av.is-me { border-color: ${j.edge}; box-shadow: 0 0 0 3px ${j.halo}; }
.ae-av b { position: absolute; left: 50%; bottom: -${a.sm}px; transform: translateX(-50%);
  background: ${j.grad}; color: ${j.ink}; border-radius: ${w.pill}px; padding: 1px ${a.sm}px;
  font: 600 ${b.micro}px/1.4 ${I}; white-space: nowrap; }
.ae-dog-name { margin-top: ${a.xs}px; max-width: calc(var(--dw) + ${a.lg}px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font: 700 ${b.micro}px/1.2 'Cinzel Decorative', ${L}; letter-spacing: .1em; color: ${N.ink}; }

/* ── políčka kódu: N okienok nad jedným poľom ─────────────────────────── */
.ae-code { position: relative; display: flex; gap: ${a.xs}px;
  justify-content: center; width: 100%; margin-bottom: ${a.lg}px; cursor: text; }
.ae-code i { flex: 0 1 36px; min-width: 0; height: 48px; border-radius: ${w.field}px; display: grid; place-items: center; font-style: normal;
  font-size: ${b.h2}px; color: ${N.ink}; }
.ae-code i.is-half { margin-right: ${a.sm}px; }
.ae-code i.is-cur { border-color: ${j.edge}; box-shadow: 0 0 0 3px ${j.halo}; }
.ae-code-input { position: absolute; inset: 0; opacity: .01; width: 100%; height: 100%; border: 0; font-size: ${b.lead}px; color: transparent; caret-color: transparent; }

/* ── povolenia: ikonka · nadpis · prepínač (recept .bd-sw zo SNIFFERa) ─── */
.ae-perm { width: 100%; display: grid; grid-template-columns: 36px minmax(0,1fr) auto; align-items: center; column-gap: ${a.sm}px;
  text-align: left; margin-bottom: ${a.sm}px; padding: ${a.md}px ${a.sm}px; cursor: pointer;
  background: ${P.subblock.background}; border: ${P.subblock.border}; border-radius: ${P.subblock.borderRadius}px;
  box-shadow: ${P.subblock.boxShadow}; }
.ae-perm small { grid-column: 1 / -1; display: none; margin-top: ${a.sm}px; font: 400 ${b.label}px/1.45 ${I}; color: ${N.inkSoft}; }
.ae-perm.is-open small { display: block; }
.ae-perm-title { min-width: 0; font: 700 ${b.label}px/1.2 ${L}; letter-spacing: .1em; text-transform: uppercase; }
.ae-ib { position: relative; width: 36px; height: 36px; border-radius: ${w.pill}px; display: grid; place-items: center;
  background: ${v.card}; border: 1px solid ${v.hairline}; color: ${N.ink}; }
.ae-ib img { width: 22px; height: 22px; display: block; }
.ae-dot { position: absolute; right: -${a.xs}px; min-width: 16px; height: 16px; padding: 0 ${a.xs}px; border-radius: ${w.pill}px;
  font: 600 ${b.micro}px/13px ${I}; font-style: normal; text-align: center; color: ${v.card}; border: 1.5px solid ${v.card}; }
/* Hore CYAN (systémové oznámenia = AINUBIS, Matej 20. 10.: „modra bublinka cyan“), dole sociálna červená. */
.ae-dot--b { top: -${a.xs}px; background: ${u.cyan}; color: ${u.bgDeep}; }
.ae-dot--r { bottom: -${a.xs}px; background: ${pe}; }
.ae-sw { position: relative; flex: 0 0 auto; width: ${a.xxxl+a.xs}px; height: ${a.xl+a.sm}px; border-radius: ${w.pill}px;
  border: 1px solid ${v.border}; background: ${v.hairline}; cursor: pointer; padding: 0; transition: background .2s ease; }
.ae-sw i { position: absolute; top: ${a.xs}px; left: ${a.xs}px; width: ${a.xl}px; height: ${a.xl}px; border-radius: ${w.pill}px;
  background: ${v.card}; box-shadow: ${K.card}; transition: left .2s ease; }
.ae-perm.is-on .ae-sw { background: ${j.grad}; border-color: ${j.deep}; }
.ae-perm.is-on .ae-sw i { left: calc(100% - ${a.xl+a.xs}px); }

/* AINUBIS v jeho šate — gulička oranžovo-zlatá, zapnutý svieti cyan */
.ae-perm--ai { background: ${u.surface}; border: 1px solid ${u.edgeStrong}; box-shadow: ${u.panelShadow}; color: ${u.ink}; }
.ae-perm--ai small { color: ${u.inkDim}; }
.ae-ib--ai { background: ${u.faceBg}; border-color: ${u.edgeStrong}; overflow: hidden; }
.ae-ib--ai img { width: 92%; height: 92%; object-fit: contain; }
.ae-ai-name > span { color: ${u.aiInk}; text-shadow: ${u.aiShadow}; }
.ae-perm--ai .ae-sw { background: rgba(${u.cyanRGB},.12); border-color: ${u.edge}; }
.ae-perm--ai .ae-sw i { background: ${u.ctaGrad}; box-shadow: 0 0 8px rgba(${u.cyanRGB},.45); }
.ae-perm--ai.is-on .ae-sw { background: rgba(${u.cyanRGB},.35); border-color: ${u.cyan}; box-shadow: 0 0 12px rgba(${u.cyanRGB},.45); }

@media (prefers-reduced-motion: reduce) {
  .ae-leaf, .ae-medal { transition-duration: .01s; transition-delay: 0s; }
  .ae-touch-img, .ae-touch-glow, .ae-sheet { animation-duration: .01s; }
}
`;export{Ke as default};
