import{u as B,r as c,a1 as Y,j as e,a2 as H,T as p,a3 as X,J as G,P as g,L as l,V as i,U as d,n as m,b as q,g as F,X as P,a4 as U,F as W,a5 as V}from"./index-7PctGTam.js";import{S as Z}from"./Seo-B-e2lU-9.js";import{L as n}from"./labTheme-p7t_6k9Y.js";import{T as v,S as J}from"./SplitDetail-BkNPVXrK.js";const E=81,Q=o=>o.split("*").map((k,$)=>$%2?e.jsx("span",{className:"mg-g",children:k},$):k),ee=o=>o.replace("/upload/","/upload/c_fill,g_auto,w_180,h_180,q_auto,f_auto/"),w=14,j=o=>`/images/magnet/${o}.webp`,N=X,T=640,z=["eco","social","school","community","meaning"],ae=[{to:"/magnet/vylety",img:"vylety",h:"magnet.q.trip",p:"magnet.b.trip"},{to:"/magnet/ainubis",img:"ainubis",h:"magnet.q.ai",p:"magnet.b.ai"},{to:"/magnet/kviz",img:"kviz",h:"magnet.q.dogid",p:"magnet.b.dogid"}];function se(){const o=B(),[k,$]=c.useState(null),[b,I]=c.useState([]),[y,R]=c.useState(!1),S=(typeof window<"u"?new URLSearchParams(window.location.search).get("pill"):null)??"zlato";c.useEffect(()=>{let t=!0;return Y(V).then(r=>{if(!t||!Array.isArray(r))return;const u=r.filter(s=>(s.pack_number??0)>0);$(u.reduce((s,h)=>Math.max(s,h.pack_number??0),0)),I(u.filter(s=>typeof s.cloudinary_main_url=="string"&&s.cloudinary_main_url).map(s=>({n:s.pack_number??0,name:s.dog_name??"",u:ee(s.cloudinary_main_url)})).sort((s,h)=>s.n-h.n))}).catch(()=>{}),()=>{t=!1}},[]);const f=b[b.length-1],M=b.length<3?[]:Array.from({length:w},(t,r)=>b[Math.round(1+(r+1)*(b.length-2)/(w+1))]),A=`calc(40px + ${w} * var(--step))`,[x,K]=c.useState(null),O=()=>U(),C=c.useRef(null),_=o("magnet.hero.h");return c.useLayoutEffect(()=>{var u;const t=C.current;if(!t)return;const r=()=>{t.style.fontSize="100px";const s=document.createRange();s.selectNodeContents(t);const h=s.getBoundingClientRect().width,D=window.innerWidth-2*W.side;h>0&&(t.style.fontSize=`${Math.min(E,100*D/h)}px`)};return r(),(u=document.fonts)==null||u.ready.then(r).catch(()=>{}),window.addEventListener("resize",r),()=>window.removeEventListener("resize",r)},[_]),e.jsxs("main",{className:"mg-root",children:[e.jsx(Z,{title:"DOGYPT — if dogs had a country",description:o("magnet.hero.lead"),path:"/magnet",noindex:!0}),e.jsx("style",{children:te}),e.jsxs("section",{className:"mg-hero",children:[e.jsx("img",{className:"mg-hero-bg",src:j("hero-namestie"),alt:"",fetchPriority:"high"}),e.jsxs("div",{className:"mg-hero-in",children:[e.jsx("h1",{className:"mg-h1",ref:C,children:Q(_)}),e.jsx("p",{className:"mg-lead",children:o("magnet.hero.promise")}),e.jsx("span",{className:"mg-logo",role:"img","aria-label":"DOGYPT"})]}),e.jsx("div",{className:`mg-names${S?` mg-names--${S}`:""}`,"aria-label":z.map(t=>o(`magnet.chip.${t}`)).join(" · "),children:e.jsx("div",{className:"mg-marquee","aria-hidden":!0,children:e.jsx("div",{className:"mg-track",children:[...z,...z].map((t,r)=>e.jsx("span",{className:"pk-pill",children:o(`magnet.chip.${t}`)},r))})})})]}),e.jsxs("section",{className:"mg-sec mg-blocks",children:[e.jsx("hr",{className:"mg-rule"}),e.jsx("p",{className:"mg-eye",children:o("magnet.blocks.eye")}),e.jsx("h2",{className:"mg-blocks-h",children:o("magnet.blocks.h")}),e.jsx("hr",{className:"mg-rule mg-rule--short"}),e.jsx("nav",{className:"mg-links",children:ae.map(t=>e.jsxs(F,{to:t.to,className:"mg-link",style:P.card,children:[e.jsx("span",{className:"mg-fresco mg-frame",children:e.jsx("img",{src:j(t.img),alt:"",loading:"lazy"})}),e.jsxs("span",{className:"mg-link-t",children:[e.jsx("b",{children:o(t.h)}),e.jsx("small",{children:o(t.p)})]})]},t.to))})]}),e.jsxs("section",{className:"mg-sec mg-about",children:[e.jsx("hr",{className:"mg-rule"}),e.jsx("p",{className:"mg-eye",children:o("magnet.idea.eye")}),e.jsx("h2",{className:"mg-h2",children:o("magnet.idea.h")}),e.jsx("hr",{className:"mg-rule mg-rule--short"}),e.jsx("p",{className:"mg-lead mg-vision",children:o("magnet.idea.p1")}),e.jsxs("figure",{className:"mg-photo",children:[e.jsxs("button",{type:"button",className:`mg-frame mg-photo-btn${y?" is-real":""}`,onClick:()=>R(t=>!t),children:[y?e.jsxs("picture",{children:[e.jsx("source",{media:"(min-width:768px)",srcSet:j("hekthor-krabica-real-wide")}),e.jsx("img",{src:"/images/hektor-kniha/k1-f1.webp",alt:"",loading:"lazy"})]}):e.jsx("img",{src:j("hekthor-krabica"),alt:"",loading:"lazy"}),e.jsx("span",{className:"mg-photo-eye",role:"img","aria-label":o(y?"magnet.idea.photoReal":"magnet.idea.photoTap")})]}),e.jsx("figcaption",{children:o("magnet.idea.photo")})]})]}),e.jsxs("section",{className:"mg-sec mg-goalsec",children:[e.jsx("hr",{className:"mg-rule"}),e.jsx("p",{className:"mg-goal",children:o("magnet.about.goal")}),e.jsx("hr",{className:"mg-rule mg-rule--short"}),e.jsxs("div",{className:"mg-strip",style:{"--pile":A},"aria-label":`${k??""} / 1 000 000`,children:[e.jsx("div",{className:"mg-groove",children:e.jsx("span",{className:"mg-fill"})}),M.map((t,r)=>e.jsx("span",{className:"mg-dog mg-dog--mid",style:{left:`calc(24px + ${r} * var(--step))`},children:e.jsx("img",{src:t.u,alt:"",loading:"lazy"})},r)),e.jsxs("span",{className:"mg-dog mg-dog--anchor",style:{left:0},children:[e.jsx("img",{src:"/images/hektor-grid.webp",alt:"",loading:"lazy"}),e.jsx("i",{className:"mg-tie"}),e.jsxs("span",{className:"mg-pill",children:[e.jsx("em",{children:"Hekthor"}),e.jsx("b",{children:"#1"})]})]}),f&&e.jsxs("span",{className:"mg-dog mg-dog--head",style:{left:A},children:[e.jsx("img",{src:f.u,alt:"",loading:"lazy"}),e.jsx("i",{className:"mg-tie"}),e.jsxs("span",{className:"mg-pill",children:[e.jsx("em",{children:f.name}),e.jsxs("b",{children:["#",f.n]})]})]}),e.jsxs("span",{className:"mg-goalmark",children:[e.jsx("b",{children:"1M"}),e.jsx("em",{children:o("onepage.need.goal")}),e.jsx("svg",{viewBox:"0 0 200 60",preserveAspectRatio:"none","aria-hidden":"true",children:e.jsx("path",{pathLength:1,d:"M150 8 C 110 0, 30 2, 10 22 C -6 40, 40 58, 104 56 C 170 54, 204 40, 192 20 C 184 8, 150 4, 118 6"})})]}),e.jsx("span",{className:"mg-goaldot","aria-hidden":!0})]}),e.jsx("button",{type:"button",className:"mg-cta",onClick:O,children:o("magnet.cta")}),e.jsx("p",{className:"mg-pricesub",children:o("magnet.end.sub")})]}),e.jsxs("section",{className:"mg-sec mg-money",children:[e.jsxs("div",{className:"mg-split",style:P.subblock,children:[e.jsx("h3",{className:"mg-split-h",children:o("magnet.split.h")}),e.jsx("div",{className:"mg-split-bar",children:v.map(t=>e.jsxs("span",{style:{flex:t.share,background:t.color},children:[t.share," €"]},t.labelKey))}),e.jsx("div",{className:"mg-split-l",role:"tablist",children:v.map((t,r)=>e.jsxs("button",{type:"button",role:"tab","aria-selected":x===r,className:x===r?"on":"",style:{"--c":t.color},onClick:()=>K(x===r?null:r),children:[e.jsx("i",{"aria-hidden":!0}),e.jsx("span",{children:o(t.labelKey)})]},t.labelKey))}),x!==null&&e.jsx("div",{className:"mg-split-card",style:{"--c":v[x].color},children:e.jsx(J,{item:v[x]})})]}),e.jsx("a",{className:"mg-motto",href:"/",children:o("magnet.home")})]})]})}const a=G,L="#A8432A",te=`
${H}
.mg-root{min-height:100vh;background:${n.pageBg};background-image:${n.pageBackdrop};
  color:${n.ink};font-family:${p};overflow-x:hidden;}
.mg-sec{max-width:${N}px;margin:0 auto;padding:${a.xxl}px ${a.lg}px;text-align:center;}
.mg-hero{position:relative;--mg-hero-h:480px;}
@media (min-width:768px){.mg-hero{--mg-hero-h:520px;}}
/* Obraz sa stráca MASKOU, nie farebným prechodom — pod ním je radiálny papyrus LAB,
   ktorý nemá v tej výške jednu farbu, prechod do jedného odtieňa by na PC robil pás. */
.mg-hero-bg{position:absolute;top:0;left:0;width:100%;height:var(--mg-hero-h);object-fit:cover;object-position:center top;
  -webkit-mask-image:linear-gradient(180deg,#000 55%,rgba(0,0,0,.35) 82%,transparent);
  mask-image:linear-gradient(180deg,#000 55%,rgba(0,0,0,.35) 82%,transparent);}
.mg-hero-in{position:relative;max-width:${N}px;margin:0 auto;padding:calc(var(--mg-hero-h) - 80px) ${a.lg}px ${a.lg}px;text-align:center;}
/* LOGO 2026 (vektor z Affinity, 13. 10.) — kartuša DOG|YPT, farba = atrament cez masku. */
.mg-logo{display:block;width:210px;aspect-ratio:1830/503;margin:${a.sm}px auto 0;background:${g.inkStrong};
  -webkit-mask:url(/images/magnet/logo-2026-kartusa.svg) center/contain no-repeat;
  mask:url(/images/magnet/logo-2026-kartusa.svg) center/contain no-repeat;}
.mg-hero .mg-lead{margin-top:${a.md}px;}
.mg-hero .mg-logo{margin-top:${a.lg}px;}
.mg-hero-in{padding-bottom:0;}
/* MENÁ — jeden riadok PILULIEK dokola; kraje sa strácajú v maske. Kto nechce pohyb,
   dostane ich zalomené na stred. */
.mg-names{position:relative;max-width:${N+2*a.xxl}px;margin:${a.lg}px auto 0;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);}
.mg-marquee{overflow:hidden;padding:${a.xs}px 0;}
.mg-track{display:flex;gap:${a.lg}px;width:max-content;animation:mg-roll 32s linear infinite;}
.mg-track .pk-pill{flex:0 0 auto;white-space:nowrap;}
.mg-names--lapis .pk-pill{background:rgba(22,48,122,0.13);border-color:rgba(22,48,122,0.62);color:${l.deep};}
.mg-names--zlato .pk-pill{background:rgba(201,154,63,0.18);border-color:${n.goldSolid};color:${n.goldInk};}
@keyframes mg-roll{from{transform:translateX(0)}to{transform:translateX(calc(-50% - ${a.lg/2}px))}}
@media (prefers-reduced-motion:reduce){
  .mg-names{-webkit-mask-image:none;mask-image:none;padding:0 ${a.lg}px;}
  .mg-track{animation:none;width:auto;flex-wrap:wrap;justify-content:center;}
  .mg-track .pk-pill:nth-child(n+7){display:none;}
}
.mg-eye{margin:0 0 ${a.md}px;font:500 ${i.micro}px/1.4 ${p};letter-spacing:.26em;text-transform:uppercase;color:${n.goldInk};}
.mg-lead{margin:0 auto;max-width:640px;font:400 ${i.lead}px/1.55 ${p};color:${n.inkBody};}
@media (min-width:768px){.mg-lead{font-size:${i.h2}px;}}

/* EGYPTSKÝ RÁM z Hektorovej knihy — zlatá · červená hlinka · zlatá (.hb-band). */
.mg-frame{position:relative;overflow:hidden;isolation:isolate;
  box-shadow:inset 0 0 0 2px ${n.goldSolid},inset 0 0 0 5px ${L},inset 0 0 0 7px ${n.goldSolid};}
.mg-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;}
.mg-h1{margin:0;font:700 ${i.h1}px/1.15 ${d};letter-spacing:.06em;text-transform:uppercase;color:${g.inkStrong};}
/* PSY A MY — recept nadpisu z úvodu webu (DogPlanetLab .ph-h1): Cinzel, tmavý atrament,
   zlaté slová Cinzel Decorative 900 #6E4A12 s papyrusovým halo. Dominantný: veľkosť
   z ŠÍRKY okna, jeden riadok (Matej 13. 10.: „veľké cez celú šírku, dominantný text"). */
.mg-hero .mg-h1{white-space:nowrap;text-wrap:nowrap;margin-inline:calc(50% - 50vw);font-size:min(calc((100vw - 32px) / 6.3), ${E}px);line-height:1;letter-spacing:.005em;color:#23150a;
  text-shadow:0 0 6px ${n.pageBg},0 0 14px ${n.pageBg},0 0 28px ${n.pageBg};}
.mg-hero .mg-h1 .mg-g{text-wrap:nowrap;background:${n.goldText};-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;font-family:'Cinzel Decorative','Cinzel',serif;font-weight:900;}
.mg-h2{margin:0;color:${g.inkStrong};}
/* NADPISY SEKCIÍ = mierka /onepage (h2 56 px na PC, ~32 na mobile, Cinzel 700, verzálky). */
.mg-h2,.mg-blocks-h,.mg-goal{font:700 clamp(28px, 7vw, 56px)/1.1 ${d};letter-spacing:.04em;text-transform:uppercase;}

.mg-call{margin:${a.lg}px 0 0;font:700 ${i.lead}px/1.4 ${d};letter-spacing:.06em;text-transform:uppercase;color:${g.inkStrong};}

/* BLOKY — KARTA: freska vľavo, nadpis + jedna veta vpravo. */
.mg-blocks{padding-top:${a.lg}px;}
.mg-blocks-h{margin:0;}
/* Farebné nadpisy = ZLATO z brandu (LAB.goldText), nie červená hlinka (Matej 13. 10.). */
.mg-blocks-h,.mg-goal{background:${n.goldText};-webkit-background-clip:text;background-clip:text;color:transparent;}
/* PREDEĽ — zlatá čiara T.rule (vyblednutá do strán, 2 px): dlhá nad sekciou, krátka pod nadpisom. */
.mg-rule{border:0;height:2px;margin:0 auto ${a.xl}px;width:100%;background:${g.rule};}
.mg-rule--short{width:96px;margin:${a.md}px auto ${a.xl}px;}
.mg-sec .mg-lead,.mg-split{max-width:${T}px;margin-left:auto;margin-right:auto;}
.mg-links{display:flex;flex-direction:column;gap:${a.md}px;}
.mg-link{display:grid;grid-template-columns:112px 1fr;gap:${a.md}px;align-items:center;padding:${a.sm}px;
  text-align:left;color:inherit;text-decoration:none;transition:transform .15s ease;}
.mg-link:hover{transform:translateY(-2px);}
.mg-fresco{display:block;aspect-ratio:1;border-radius:${m.tile}px;}
.mg-link-t{display:flex;flex-direction:column;justify-content:center;gap:${a.xs}px;padding-right:${a.xs}px;}
.mg-link b{font:700 ${i.lead}px/1.2 ${d};letter-spacing:.06em;text-transform:uppercase;color:${g.inkStrong};}
.mg-link small{font:400 ${i.label}px/1.45 ${p};color:${g.inkWarm};}

/* VÍZIA — text + fotka šteniat v krabici z Hektorovej knihy v ráme fresiek. */
.mg-vision{margin-top:${a.lg}px;}
.mg-photo{margin:${a.xl}px auto 0;}
.mg-photo-btn{display:block;width:100%;padding:0;border:0;cursor:pointer;background:none;}
.mg-photo-btn picture{display:contents;}
.mg-photo-eye{position:absolute;right:${a.md}px;bottom:${a.md}px;width:32px;height:32px;border-radius:${m.pill}px;
  background:rgba(243,228,196,0.55);border:1px solid ${n.edge};-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);}
.mg-photo-eye::before{content:'';position:absolute;inset:7px;background:${g.inkStrong};
  -webkit-mask:url(/icons/pack/eye.svg) center/contain no-repeat;mask:url(/icons/pack/eye.svg) center/contain no-repeat;}
/* Skutočná fotka = voľba → lapisový TINT (zlato = poloha, lapis = moja voľba). */
.is-real .mg-photo-eye{background:rgba(22,48,122,0.18);border-color:rgba(22,48,122,0.62);}
.is-real .mg-photo-eye::before{background:${l.edge};}
.mg-photo .mg-frame{display:block;aspect-ratio:1;border-radius:${m.card}px;box-shadow:inset 0 0 0 2px ${n.goldSolid},inset 0 0 0 5px ${L},inset 0 0 0 7px ${n.goldSolid},${n.shadow};}
@media (min-width:768px){.mg-photo .mg-frame{aspect-ratio:16/9;}}
.mg-photo figcaption{margin-top:${a.sm}px;font:400 ${i.label}px/1.4 ${p};color:${g.inkWarm};}

/* PÁS SVORKY — statický prvý obraz pásu z /onepage (.op-nxt-*): drážka, lapisová výplň,
   Hekthor #1 na začiatku, posledný pes na hlave, medzi nimi rovnomerný výber svorky. */
.mg-goalsec{padding-top:${a.lg}px;}
.mg-strip{--step:6px;position:relative;height:14px;margin:${a.xxxl+a.lg}px ${a.xl}px ${a.xxxl+a.lg}px;}
.mg-groove{position:absolute;left:0;right:0;top:2px;height:9px;border-radius:${m.pill}px;overflow:hidden;
  background:rgba(122,90,42,0.16);border:1px solid ${n.edge};
  box-shadow:inset 0 2px 5px rgba(90,58,12,0.42),inset 0 -1.5px 0 rgba(255,255,255,0.70);}
.mg-fill{position:absolute;left:0;top:0;bottom:0;width:var(--pile);background:linear-gradient(180deg,${l.lite},${l.deep});}
.mg-dog{position:absolute;top:50%;width:0;}
.mg-dog img{position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:var(--d,44px);height:var(--d,44px);max-width:none;
  border-radius:${m.pill}px;object-fit:cover;border:2.5px solid ${n.goldSolid};box-shadow:0 4px 14px rgba(60,40,10,0.35);background:${n.pageBg};}
.mg-dog--mid{--d:28px;}
.mg-dog--mid img{box-shadow:0 1px 4px rgba(60,40,10,0.35);}
.mg-dog--mid img{border-width:2px;box-shadow:0 2px 8px rgba(60,40,10,0.3);}
.mg-dog--anchor{z-index:2;}
.mg-dog--head{z-index:3;}
.mg-pill{position:absolute;left:0;transform:translateX(-50%);top:30px;display:inline-flex;align-items:baseline;gap:${a.xs}px;white-space:nowrap;
  padding:${a.xs}px ${a.md}px;border-radius:${m.pill}px;background:rgba(22,48,122,0.13);border:1.5px solid rgba(22,48,122,0.62);}
.mg-dog--head .mg-pill{top:auto;bottom:30px;}
/* Menovky pri krajoch pásu nesmú vyjsť z okna: Hekthor visí doprava od kotvy,
   posledný pes doľava (na /onepage to rieši réžia cez --pdx). */
.mg-dog--anchor .mg-pill{transform:translateX(-16px);}
.mg-dog--head .mg-pill{transform:translateX(calc(-100% + 16px));}
.mg-pill em{font:700 ${i.body}px/1 'Cinzel Decorative','Cinzel',serif;font-style:normal;color:${l.deep};}
.mg-pill b{font:700 ${i.lead}px/1 ${d};color:${l.edge};}
.mg-tie{position:absolute;left:0;transform:translateX(-50%);width:2px;background:rgba(22,48,122,0.5);top:20px;height:10px;}
.mg-dog--head .mg-tie{top:auto;bottom:20px;}

@media (min-width:768px){.mg-strip{--step:10px;}}
/* CIEĽ 1M — štítok nad koncom osi, natočený, v ovále (.op-nxt-goal), bodka pulzuje. */
.mg-goalmark{position:absolute;right:${a.sm}px;bottom:30px;display:flex;align-items:baseline;gap:${a.xs}px;white-space:nowrap;transform:rotate(-6deg);transform-origin:100% 100%;}
.mg-goalmark b{font:700 ${i.h1}px/1 ${d};color:${l.edge};}
.mg-goalmark em{font:500 ${i.label}px/1 ${p};font-style:normal;letter-spacing:.2em;text-transform:uppercase;color:${l.edge};}
.mg-goalmark svg{position:absolute;left:-18%;top:-50%;width:136%;height:200%;overflow:visible;pointer-events:none;}
.mg-goalmark path{fill:none;stroke:${l.edge};stroke-width:3;stroke-linecap:round;vector-effect:non-scaling-stroke;}
.mg-goaldot{position:absolute;right:-5px;top:2px;width:10px;height:10px;border-radius:${m.pill}px;background:${l.edge};animation:mgPulse 1.8s ease-out infinite;}
@keyframes mgPulse{0%{box-shadow:0 0 0 0 rgba(22,48,122,0.55)}70%{box-shadow:0 0 0 10px rgba(22,48,122,0)}100%{box-shadow:0 0 0 0 rgba(22,48,122,0)}}

/* KAM IDE 11 € — úplne na konci. */
.mg-money{padding-top:0;padding-bottom:${a.xxxl*2}px;}
.mg-split{margin-top:${a.xl}px;padding:${a.lg}px;text-align:left;}
.mg-split-bar{display:flex;height:40px;border-radius:${m.field}px;overflow:hidden;}
.mg-split-bar span{display:grid;place-items:center;font:700 ${i.body}px/1 ${d};color:${g.inkStrong};}
.mg-split-h{margin:0 0 ${a.md}px;text-align:center;font:700 ${i.h2}px/1.2 ${d};letter-spacing:.06em;text-transform:uppercase;color:${g.inkStrong};}
.mg-split-l{display:grid;grid-template-columns:repeat(3,1fr);gap:${a.sm}px;margin-top:${a.md}px;}
.mg-split-l button{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:${a.xs}px;padding:${a.sm}px ${a.xs}px;cursor:pointer;
  border-radius:${m.tile}px;border:1px solid ${n.edge};background:transparent;color:${g.inkWarm};}
.mg-split-l button.on{border-color:var(--c);background:color-mix(in srgb, var(--c) 14%, transparent);}
.mg-split-l i{flex:none;width:10px;height:10px;border-radius:${m.pill}px;background:var(--c);}
.mg-split-l span{font:400 ${i.label}px/1.2 ${p};text-align:center;}
.mg-split-card{margin-top:${a.sm}px;padding:${a.md}px;border-radius:${m.tile}px;border:1px solid var(--c);
  background:color-mix(in srgb, var(--c) 8%, transparent);font:400 ${i.body}px/1.5 ${p};color:${n.inkBody};}
.mg-goal{margin:0;}
/* MÄKČEŇ NAD Ť/Č — zlato je background-clip:text a pozadie končí na hrane riadku (lh 1.1),
   diakritika nad verzálkou bola priehľadná. Ten istý liek ako .op-nxt-h2 na /onepage. */
.mg-blocks-h,.mg-goal{padding-top:.2em;margin-top:-.2em;}
.mg-goalsec .mg-cta{margin-top:${a.xl}px;}
.mg-pricesub{margin:${a.md}px 0 0;font:500 ${i.label}px/1.4 ${p};letter-spacing:.22em;text-transform:uppercase;color:${n.inkSoft};}
/* CTA — LAPIS, geometria .btn-gold (radius 8), presne ako .op-nxt-cta na /onepage. */
.mg-cta{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;
  border:1.5px solid rgba(250,244,236,0.30);border-radius:${m.field}px;padding:${a.lg}px ${a.xl}px;
  background:${l.grad};box-shadow:${q};color:${l.ink};
  font:700 ${i.lead}px/1 ${d};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.mg-cta:hover{background:${l.gradHover};transform:translateY(-1px);}
.mg-motto{display:inline-block;text-decoration:underline;text-underline-offset:4px;margin:${a.xxl}px 0 0;font:500 ${i.micro}px/1 ${p};letter-spacing:.26em;text-transform:uppercase;color:${n.inkMuted};}
/* PC: bloky vedľa seba, freska hore (šírka obsahu 832). */
@media (min-width:768px){
  .mg-links{display:grid;grid-template-columns:repeat(3,1fr);}
  .mg-link{grid-template-columns:1fr;text-align:center;align-content:start;}
  .mg-fresco{width:100%;}
  .mg-link-t{padding:0 ${a.sm}px ${a.sm}px;}
  .mg-photo{max-width:${T}px;}
}
`;export{se as default};
