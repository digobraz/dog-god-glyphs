const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/packMessaging-CwxRlYTq.js","assets/index-7PctGTam.js","assets/index-BceXV8_0.css"])))=>i.map(i=>d[i]);
import{P as T,T as k,U as P,u as M,j as e,r as h,_ as ao,ak as S,$ as X,c as to,s as Q,ao as no,W as ro,Z as io,L as O,b as ie,m as G,H as se,h as fe,as as ee,ax as so}from"./index-7PctGTam.js";import{s as B}from"./cloudinaryService-DFfDUqVM.js";import{e as lo}from"./dogRights-BxAmrGwt.js";import{u as co,m as mo}from"./memberProfile-BUUVjgd0.js";import{R as po}from"./RightGate-D9upYetj.js";import{u as uo,a as ho,b as ko,l as go,g as xo,h as bo}from"./wishData-CXFfCW3P.js";import{HUMAN_KEY_PREFIX as be,fetchPackHumans as fo}from"./packHumans-CM8dSSnN.js";import{p as le}from"./dogEvents-DNw7GPsn.js";import{I as J,z as Ge,X as vo,l as yo,s as jo}from"./tripShared-DJ5J49O6.js";import{C as Ze,H as Ye,D as wo,n as $o,o as zo,c as No,g as Eo,q as Ao,r as Po,t as Oo,v as So,x as To,y as Do,S as Io}from"./packCommunity-DpJx2p71.js";import{u as Co}from"./PackLayout-DbvN9q62.js";import{useMagnetPreview as Ro,MAGNET_IDENTITY as Mo,MAGNET_FOUNDER as Lo}from"./magnetPreview-DhLqLXgw.js";import{u as _o,d as Ko}from"./usePackStoreEpoch-At2oJSpO.js";import{l as Bo,J as Uo,P as A,b as Vo,d as Ho}from"./tripPoints-B8mfj7VK.js";import{P as Fo,a as Go,b as Zo,c as Yo,d as Wo,e as Jo,t as qo}from"./packTiers-0E8WcxgQ.js";import{HERO_JOURNEYS as Xo}from"./data-journeys-qHcguO2r.js";import{t as Qo,c as Re,f as ea}from"./countryGeo-BaPfaSrG.js";import{F as oa}from"./FlagCircle-D0VQxthA.js";import{z as ce,A as aa,o as ta,B as na}from"./packStore-C-dKFjs1.js";import"./packProfile-DFxYPxfm.js";import{f as Me}from"./flagUrl-B21iQI9I.js";import{HERO_TRAILS as ra}from"./data-trails-C7pS6eM2.js";import{f as ia,a as sa,v as la,l as ca,c as ma}from"./mapNotesData-BT8C1Ysp.js";const K=T,Le=K.cardEdge,pa=K.ink,da="'Cinzel Decorative', 'Cinzel', serif",ht=`
.pmc{display:flex;align-items:center;gap:12px;padding:12px 12px;border-radius:14px;border:1px solid ${K.onDarkBorder};background:rgba(245,240,228,0.04);min-width:0;}
.pmc + .pmc{margin-top:8px;}
.pmc-av{position:relative;flex-shrink:0;width:44px;height:44px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${k};font-weight:600;font-size:16px;color:${pa};border:1px solid ${K.border};}
.pmc-av img{width:100%;height:100%;object-fit:cover;display:block;}
/* #41 — klik na ikonku tvorcu/účastníka otvorí TripProfileCard (padding:0 reset, button je inak UA-štýlovaný) */
button.pmc-av{padding:0;margin:0;cursor:pointer;}
button.pmc-av:hover{filter:brightness(1.08);}
.pmc-txt{min-width:0;flex:1;}
.pmc-role{font-family:${k};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${Le};margin-bottom:3px;}
.pmc-dog{font-family:${da};font-weight:700;font-size:14px;line-height:1.15;color:${K.onDark};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pmc-owner{font-family:${P};font-weight:700;font-size:12px;letter-spacing:0.02em;color:${K.onDarkDim};margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pmc-num{font-family:${k};font-weight:500;font-size:10px;letter-spacing:0.02em;color:${K.onDarkDim};}
.pmc-more{font-family:${k};font-weight:500;font-size:10px;color:${K.onDarkDim};padding:8px 4px 0;}
.pmc-msg{flex-shrink:0;align-self:center;display:flex;align-items:center;justify-content:center;height:30px;padding:0 12px;border-radius:999px;background:rgba(201,154,63,0.14);border:1px solid ${T.border};color:${Le};font-family:${k};font-weight:500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;white-space:nowrap;}
.pmc-msg:hover{background:rgba(201,154,63,0.24);}
.pmc-msg:disabled{opacity:.45;cursor:default;}

/* ── BLEDÁ VETVA — KARTA NA PAPYRUSE (Matej 2026-09-15: „ten otvorený vylet od svorky je
   furt zle") ──────────────────────────────────────────────────────────────────────────
   Karta vznikla pre TMAVÝ dok mapy (.trp-dockpanel, rgba(18,13,7,0.94)) a TAM JE SPRÁVNE.
   V článku výletu a v triplist-e však stojí na papyrusovej doske (goldFrameCSS), takže
   T.onDark (biely inkoust s 86 % krytím) svietil bielym na krémovom — meno psa sa nedalo
   prečítať vôbec. To isté zistenie ako pri .mnts-back a .mnk-tile.on: prevrátený povrch
   treba prevrátiť aj v štítkoch.
   ⚠️ AVATAR SA NEPREFARBUJE — zlatý kruh je identita člena a na papyruse drží; mení sa len
   to, čo nesie TEXT a hranicu. Žiadne nové číslo: polomery, odsadenia ani písmo sa netýkajú.
   ⚠️ V CSS KOMENTÁRI NESMIE BYŤ SPÄTNÝ APOSTROF — ukončí template literál (check:css). */
.pmc--pale{border-color:${T.border};background:${T.tileBg};}
.pmc--pale .pmc-dog{color:${T.inkStrong};}
.pmc--pale .pmc-owner,.pmc--pale .pmc-num,.pmc--pale .pmc-more{color:${T.inkWarm};}
/* Rola ostáva zlatá (GOLD) — na papyruse je čitateľná a je to tá istá eyebrow, akú má
   nadpis sekcie nad kartou. */
`,ua={organizer:"pack.trip.host",joiner:"pack.party.role.joiner",requested:"pack.party.role.requested"};function ha({member:o,dm:t,className:i="pmc-msg"}){var g;const l=M(),[r,c]=h.useState(!1),[m,u]=h.useState(!1),p=(g=o.ownerFirst)==null?void 0:g.trim();if(!(!!t&&!t.isMe&&(o.role==="organizer"||o.packNumber!=null)))return null;const b=async()=>{if(!(!t||r)){c(!0),u(!1);try{const w=await(await ao(()=>import("./packMessaging-CwxRlYTq.js"),__vite__mapDeps([0,1,2]))).startTripDM({tripSlug:t.tripSlug,organizerId:t.organizerId,packNumber:o.role==="organizer"?null:o.packNumber});w?lo(w):u(!0)}catch{u(!0)}finally{c(!1)}}};return e.jsx(po,{right:"social",children:e.jsx("button",{type:"button",className:i,onClick:b,disabled:r,"aria-label":`${l("pack.party.message")} ${p??""}`.trim(),children:r?"…":l(m?"pack.party.unavailable":"pack.party.message")})})}function kt({member:o,roleLabel:t,dm:i,onOpenProfile:l,pale:r}){var g;const c=M(),m=(g=o.dogName)==null?void 0:g.trim(),u=co(o.packNumber??void 0),p=mo(u,o.ownerFirst)||void 0,y=(m||p||"?").charAt(0).toUpperCase(),b=o.dogPhoto?e.jsx("img",{src:B(o.dogPhoto,200),alt:m??"Dog",loading:"lazy",draggable:!1}):y;return e.jsxs("div",{className:r?"pmc pmc--pale":"pmc",children:[l?e.jsx("button",{type:"button",className:"pmc-av",onClick:l,"aria-label":`View ${m??p??"this Dogyptian"}'s profile`,children:b}):e.jsx("span",{className:"pmc-av",children:b}),e.jsxs("span",{className:"pmc-txt",children:[e.jsx("span",{className:"pmc-role",style:{display:"block"},children:t??c(ua[o.role])}),e.jsx("span",{className:"pmc-dog",style:{display:"block"},children:m??c("pack.party.someDog")}),e.jsxs("span",{className:"pmc-owner",style:{display:"block"},children:[c("pack.party.with",{owner:p??c("pack.party.someone")}),o.packNumber?e.jsxs("span",{className:"pmc-num",children:[" · #",o.packNumber]}):null]})]}),e.jsx(ha,{member:o,dm:i})]})}const ka="#F5C73D",ga="#A3782B",_e=[1,2,3,4,5],xa=.45,ba=.55;function Ke({filled:o,color:t,size:i,emptyOpacity:l}){const r=`url(${J(o?"paw-full":"paw")})`;return e.jsx("span",{"aria-hidden":!0,style:{width:i,height:i,display:"block",backgroundColor:t,opacity:o?1:l,WebkitMaskImage:r,maskImage:r,WebkitMaskRepeat:"no-repeat",maskRepeat:"no-repeat",WebkitMaskPosition:"center",maskPosition:"center",WebkitMaskSize:"contain",maskSize:"contain",transition:"opacity .12s ease"}})}function fa({value:o,onChange:t,size:i=26,onDark:l=!1,readOnly:r=!1}){const c=M(),[m,u]=h.useState(null),p=h.useRef([]),y=l?ka:ga,b=l?xa:ba,g=Math.round(i*.22);if(r)return e.jsx("div",{role:"img","aria-label":c("pack.addTrip.paws.ariaOutOf5",{n:o}),style:{display:"inline-flex",alignItems:"center",gap:g},children:_e.map(x=>e.jsx(Ke,{filled:x<=o,color:y,size:i,emptyOpacity:b},x))});const f=m??o,w=x=>t==null?void 0:t(x),j=(x,I)=>{var Z;let C=I;if(x.key==="ArrowRight"||x.key==="ArrowUp")C=Math.min(4,I+1);else if(x.key==="ArrowLeft"||x.key==="ArrowDown")C=Math.max(0,I-1);else return;x.preventDefault(),w(C+1),(Z=p.current[C])==null||Z.focus()},d=o>0?o-1:0;return e.jsx("div",{role:"radiogroup","aria-label":c("pack.addTrip.paws.ariaGroupLabel"),style:{display:"inline-flex",alignItems:"center",gap:g},onMouseLeave:()=>u(null),children:_e.map((x,I)=>e.jsx("button",{ref:C=>p.current[I]=C,type:"button",role:"radio","aria-checked":x===o,"aria-label":x>1?c("pack.addTrip.paws.ariaPackMany",{n:x}):c("pack.addTrip.paws.ariaPackOne",{n:x}),tabIndex:I===d?0:-1,onMouseEnter:()=>u(x),onFocus:()=>u(x),onBlur:()=>u(null),onClick:()=>w(x),onKeyDown:C=>j(C,I),style:{background:"none",border:0,padding:0,margin:0,lineHeight:0,cursor:"pointer"},children:e.jsx(Ke,{filled:x<=f,color:y,size:i,emptyOpacity:b})},x))})}const Be=T.card,va=`
.pts-pill{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:${k};font-weight:600;line-height:1;letter-spacing:0.02em;
  border-radius:999px;white-space:nowrap;font-variant-numeric:tabular-nums;
}
/* ZÁKLAD — béžová. border v tej istej farbe, nie priehľadný okraj: pilulka leží aj na
   zlatom podklade (chip .on), kde by tmavý rám urobil dieru. */
.pts-pill--base{
  background:${Be};color:${T.inkStrong};
  border:1px solid rgba(42,22,8,0.14);
  box-shadow:${S.lift};
}
/* BONUS — zlatá. Rovnaký gradient ako .btn-gold / level pilulka, žiadny nový. */
.pts-pill--bonus{
  background:${X.grad};color:#241a06;
  border:1px solid ${X.edge};
  box-shadow:${S.lift};
}
/* NA PAPYRUSE — LAPIS LAZULI. Béžová pilulka na béžovom podklade zanikne; čierna to vyriešila,
   ale Matej 2026-08-06: „ta pils s tými bodmi daj ju farebne nie čierne! modrá/zelená".
   Vybraná MODRÁ, nie zelená, z dvoch dôvodov:
   1. zelená je v tomto UI už obsadená — chip „Easy" v Náročnosti má zelenú bodku, druhý
      zelený prvok na tej istej obrazovke by niesol falošný vzťah;
   2. lapis lazuli je ikonický egyptský pigment (Tutanchamónova maska), takže to nie je cudzia
      farba nalepená na brand, ale rozšírenie, ktoré do sveta DOGYPTU patrí.
   Gradient v rovnakom uhle 135deg ako .btn-gold a .pts-pill--bonus — nový uhol sa nezavádza.
   ⚠️ Toto je PRVÁ farba mimo trojice zlatá/čierna/papyrus v brand v3.2. Keď sa bude paleta
   dopĺňať inde, vychádzaj odtiaľto, nevymýšľaj druhú modrú. */
.pts-pill--lapis{
  background:linear-gradient(135deg,#3A7BC8,#1E5AA8);color:${Be};
  border:1px solid ${T.onDarkDim};
  box-shadow:${S.lift};
}
.pts-pill--sm{font-size:10px;padding:4px 8px;}
.pts-pill--md{font-size:12px;padding:4px 12px;}
.pts-pill--lg{font-size:16px;padding:8px 16px;}
/* Prílet bonusu — odmena sa má „objaviť", nie tam len ticho byť (zadanie §3b: animácia patrí
   BONUSU, nie základu — základ si vedel dopredu). prefers-reduced-motion ju vypína. */
@keyframes pts-pop{0%{transform:scale(.72);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
.pts-pill--pop{animation:pts-pop .34s cubic-bezier(.34,1.56,.64,1) both;}
@media (prefers-reduced-motion:reduce){ .pts-pill--pop{animation:none;} }
`;function ya(o,t,i=620){const[l,r]=h.useState(t?0:o),c=h.useRef();return h.useEffect(()=>{var y;if(!t){r(o);return}if(typeof window<"u"&&((y=window.matchMedia)==null?void 0:y.call(window,"(prefers-reduced-motion: reduce)").matches)||o<=0){r(o);return}const u=performance.now(),p=b=>{const g=Math.min(1,(b-u)/i);r(Math.round(o*(1-Math.pow(1-g,3)))),g<1&&(c.current=requestAnimationFrame(p))};return c.current=requestAnimationFrame(p),()=>{c.current&&cancelAnimationFrame(c.current)}},[o,t,i]),l}function ue({value:o,tone:t="base",size:i="sm",animate:l=!1,className:r="",title:c}){const m=ya(o,l);return e.jsxs("span",{className:`pts-pill pts-pill--${t} pts-pill--${i}${l?" pts-pill--pop":""}${r?` ${r}`:""}`,title:c,children:["+",m]})}function ja({level:o,onDark:t=!0}){const i=M(),l=Yo(o),r=t?T.onDark:T.inkStrong,c=t?"rgba(245,240,228,0.5)":T.inkWarm;return e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:2},children:Fo.map((m,u)=>{const p=u===l;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"3px 7px",borderRadius:10,border:`1px solid ${p?m.a:"transparent"}`,background:p?t?"rgba(245,240,228,0.07)":"rgba(201,154,63,0.10)":"transparent"},children:[e.jsx("span",{style:{flex:"0 0 auto",minWidth:96,textAlign:"center",padding:"4px 11px",borderRadius:999,border:`1px solid ${X.edge}`,background:Go(m),color:m.ink,fontFamily:P,fontWeight:700,fontSize:10.5,letterSpacing:".10em",textTransform:"uppercase",opacity:u<=l?1:.55},children:i(`pack.tier.${m.key}`)}),e.jsx("span",{style:{flex:"1 1 auto",fontFamily:k,fontSize:11.5,letterSpacing:".02em",color:p?r:c},children:i("pack.tier.levelRange",{range:Zo(m)})}),p&&e.jsx("span",{style:{flex:"0 0 auto",fontFamily:k,fontWeight:600,fontSize:9.5,letterSpacing:".16em",textTransform:"uppercase",color:m.a},children:i("pack.tier.youAreHere")})]},m.key)})})}const me=[{id:"hachiko",name:"Hachikō",trips:5,img:"/icons/hero-badges/hachiko.webp",source:{url:"https://www.u-tokyo.ac.jp/en/whyutokyo/hongo_hi_014.html",label:"University of Tokyo"}},{id:"barry",name:"Barry",trips:15,img:"/icons/hero-badges/barry.webp",source:{url:"https://www.nmbe.ch/en/exhibitions/barry",label:"Naturhistorisches Museum Bern"}},{id:"togo",name:"Togo",trips:25,img:"/icons/hero-badges/togo.webp",source:{url:"https://www.smithsonianmag.com/history/this-heroic-dog-raced-across-the-frozen-alaskan-wilderness-to-deliver-life-saving-medicine-but-his-contributions-were-long-overlooked-180985905/",label:"Smithsonian Magazine"}},{id:"hekthor",name:"Hekthor",trips:42,img:"/icons/hero-badges/hekthor.webp"},{id:"bothie",name:"Bothie",trips:82,img:"/icons/hero-badges/bothie.webp",source:{url:"https://geographical.co.uk/news/reliving-the-transglobe-expedition",label:"Geographical · RGS"}},{id:"laika",name:"Laika",trips:100,img:"/icons/hero-badges/laika.webp",source:{url:"https://www.smithsonianmag.com/smithsonian-institution/sad-story-laika-space-dog-and-her-one-way-trip-orbit-1-180968728/",label:"Smithsonian Magazine"}},{id:"bobbie",name:"Bobbie",trips:150,img:"/icons/hero-badges/bobbie.webp",source:{url:"https://kval.com/features/pet-of-the-week/bobbie-oregons-wonder-dog",label:"KVAL News"}},{id:"seaman",name:"Seaman",trips:300,img:"/icons/hero-badges/seaman.webp",source:{url:"https://www.nps.gov/articles/000/seaman-s-contributions-to-the-lewis-and-clark-expedition.htm",label:"U.S. National Park Service"}},{id:"savannah",name:"Savannah",trips:1e3,img:"/icons/hero-badges/savannah.webp",source:{url:"https://www.inquirer.com/life/tom-turcich-walk-world-jersey-dog-death-20240521.html",label:"The Philadelphia Inquirer"}}],We="pack_hero_revealed";function Ue(){try{const o=localStorage.getItem(We);if(o===null)return null;const t=JSON.parse(o);return Array.isArray(t)?t.filter(i=>typeof i=="string"):[]}catch{return null}}function Ve(o){try{localStorage.setItem(We,JSON.stringify(o))}catch{}}function He({badge:o,kicker:t,locked:i,onClose:l}){const r=M();return h.useEffect(()=>{const c=m=>{m.key==="Escape"&&l()};return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[l]),to.createPortal(e.jsx("div",{className:"comm-reveal",onClick:c=>{c.target===c.currentTarget&&l()},children:e.jsxs("div",{className:"comm-reveal-card",children:[e.jsxs("div",{className:"comm-reveal-left",children:[e.jsx("img",{className:`comm-reveal-badge${i?" comm-reveal-badge--off":""}`,src:o.img,alt:o.name}),e.jsx("div",{className:"comm-reveal-trips",children:r("pack.heroBadge.trips",{n:o.trips})})]}),e.jsxs("div",{className:"comm-reveal-right",children:[e.jsx("div",{className:`comm-reveal-kicker${i?" comm-reveal-kicker--locked":""}`,children:t}),e.jsx("div",{className:"comm-reveal-name",children:o.name}),e.jsx("p",{className:"comm-reveal-story",children:r(`pack.heroBadge.${o.id}.story`)}),o.source&&e.jsxs("a",{className:"comm-reveal-source",href:o.source.url,target:"_blank",rel:"noopener noreferrer",children:[r("pack.heroBadge.more")," ",e.jsx("span",{className:"comm-reveal-source-label",children:o.source.label})]})]})]})}),document.body)}function wa({walkedCount:o}){const t=M(),[i,l]=h.useState(null),[r,c]=h.useState([]),[m,u]=h.useState(()=>new Set(Object.keys(ce())));h.useEffect(()=>{aa(me)},[]),h.useEffect(()=>ta(()=>u(new Set(Object.keys(ce())))),[]),h.useEffect(()=>{const g=ce(),f=me.filter(x=>o>=x.trips&&!g[x.id]).map(x=>x.id);f.length&&na(f);const w=new Set(Object.keys(ce()));u(w);const j=Ue();if(j===null){Ve(Array.from(w));return}const d=me.filter(x=>w.has(x.id)&&!j.includes(x.id));d.length>0&&c(d)},[o]);const p=m.size,y=r[0],b=()=>{c(g=>{if(g.length===0)return g;const[f,...w]=g,j=Ue()??[];return j.includes(f.id)||Ve([...j,f.id]),w})};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"comm-dash-section-title",style:{marginTop:26,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:t("pack.stats.heroBadges")}),e.jsxs("span",{children:[p,"/9"]})]}),e.jsx("div",{className:"comm-heroes",children:me.map(g=>{const f=m.has(g.id);return e.jsxs("button",{type:"button",className:`comm-hero ${f?"comm-hero--on":"comm-hero--off"}`,onClick:()=>l(g),children:[e.jsx("img",{src:g.img,alt:g.name}),e.jsx("span",{className:"comm-hero-trips",children:g.trips})]},g.id)})}),y?e.jsx(He,{badge:y,kicker:t("pack.heroBadge.kickerMilestone"),locked:!1,onClose:b}):i?(()=>{const g=m.has(i.id),f=g?t("pack.heroBadge.kickerEarned"):t("pack.heroBadge.kickerLocked",{n:i.trips-o});return e.jsx(He,{badge:i,kicker:f,locked:!g,onClose:()=>l(null)})})():null]})}const $a={organizer:null,joiners:[],requests:[],loading:!1};function za(o,t){return t?`${o}|${t}`:o}function Na(o,t=0){const[i,l]=h.useState({}),r=o.map(c=>za(c.slug,c.organizerId)).join(",");return h.useEffect(()=>{let c=!0;const m=r?r.split(","):[];if(!m.length){l({});return}return(async()=>{const u=await Promise.all(m.map(async p=>{const[y,b]=p.split("|"),{data:g,error:f}=await Q.rpc("get_trip_party",{p_trip_slug:y,...b?{p_organizer:b}:{}});if(f)return[p,$a];const w=(g??[]).map(j=>({role:j.role,ownerFirst:j.owner_first,dogName:j.dog_name,dogPhoto:j.dog_photo,packNumber:j.pack_number,at:j.at}));return[p,{organizer:w.find(j=>j.role==="organizer")??null,joiners:w.filter(j=>j.role==="joiner"),requests:w.filter(j=>j.role==="requested"),loading:!1}]}));c&&l(Object.fromEntries(u))})(),()=>{c=!1}},[r,t]),i}function gt(o,t=0){return Na(o.map(i=>({slug:i})),t)}const n=T,D=n.cardEdge,F=n.ink,s=io;function Ea(o,t){if(t&&t.trim())return t.trim().split(" ")[0];if(!o)return"Dogyptian";const l=(o.split("@")[0]||"").split("+")[0].replace(/[._-]/g," ").replace(/\d+/g,"").trim();return l?l.charAt(0).toUpperCase()+l.slice(1):"Dogyptian"}const Aa=5,Pa="#37B26A",Oa="#E8B22E",Fe=G.green,Sa="#7A5410",Ta={"Tatranský NP":"/icons/np/tatransky-np.png","NP Nízke Tatry":"/icons/np/np-nizke-tatry.png","NP Malá Fatra":"/icons/np/np-mala-fatra.png","NP Slovenský raj":"/icons/np/np-slovensky-raj.png","NP Muránska planina":"/icons/np/np-muranska-planina.png","NP Poloniny":"/icons/np/np-poloniny.png","NP Slovenský kras":"/icons/np/np-slovensky-kras.png","NP Veľká Fatra":"/icons/np/np-velka-fatra.png","Pieninský NP":"/icons/np/pieninsky-np.png"},Da=new Set(["Tatranský NP","Pieninský NP"]),Ia=new Set([]),Ca={"Malé Karpaty":"/icons/chko/male-karpaty.png","Biele Karpaty":"/icons/chko/biele-karpaty.png","Strážovské vrchy":"/icons/chko/strazovske-vrchy.png",Kysuce:"/icons/chko/kysuce.png","Horná Orava":"/icons/chko/horna-orava.png",Ponitrie:"/icons/chko/ponitrie.png",Poľana:"/icons/chko/polana.png","Cerová vrchovina":"/icons/chko/cerova-vrchovina.png",Vihorlat:"/icons/chko/vihorlat.png",Latorica:"/icons/chko/latorica.png","Štiavnické vrchy":"/icons/chko/stiavnicke-vrchy.png","Východné Karpaty":"/icons/chko/vychodne-karpaty.png","Dunajské luhy":"/icons/chko/dunajske-luhy.png",Záhorie:"/icons/chko/zahorie.png"},xt=`${no}
${ro}
/* ════════════════════════════════════════════════════════════════════════════
   DRAK → BRIGHT (2026-09-01) — TRIPSTATS, WalkedPopup a EventsView do bledého šatu.
   ────────────────────────────────────────────────────────────────────────────
   Tento súbor obsluhuje TRI povrchy naraz: TRIPSTATS (vysvedčenie na
   /pack/map/triplist), WalkedPopup (článok + mapa) a EventsView (mapa).
   Prezlečené sú VŠETKY TRI (podujatia dobehli 1. 9. večer, 2. beh).
   Tmavá ostáva už len sada .comm-comp-* (kto bol so mnou, v ADD toku) — rieši sa
   vo vlastnom behu; tmavá na neprezlečenom povrchu NIE JE bug, len nevykonaná
   práca (zoznam: plany/zadanie-drak-bright-pack-2026-09-01.md).
   Inkousty a plochy bledého chrome berieme z PALE (navGoldSkin.ts) — tie isté
   hodnoty drží bledý skin mapy, takže sa dve obrazovky nemôžu rozísť.
   ⚠️ Toto je template literál — v komentároch ŽIADNE spätné apostrofy.
   ════════════════════════════════════════════════════════════════════════════ */
/* ── modal shell (walked / wishlist / partner ad / DM) ──
   Panel = úroveň 4 matrice (PACK_BOX.panel): papyrusový gradient, 1.5px zlatý rám,
   radius 14, panelShadow. Bez backdrop-filter — rozmazávať sa má závoj pod panelom,
   nie panel sám. */
/* ZÁVOJ = recept .pk-veil--modal (VEIL_CSS) — tu len vrstva a odsadenie. */
.comm-overlay{z-index:1200;padding:16px;}
.comm-modal{width:100%;max-width:420px;max-height:calc(100dvh - 40px);overflow-y:auto;background:${n.panelGrad};border:1.5px solid ${n.cardEdge};border-radius:14px;box-shadow:${n.panelShadow};padding:24px;}
.comm-modal.wide{max-width:640px;}
/* Matej 2026-08-06 („konsolidujeme zjednodušujeme"): nadpis je CENTROVANÝ a nesie priamo názov
   tripu — dvojica „OHODNOŤ A ZÍSKAJ BODY" + podnadpis s názvom bola dva riadky na to isté.
   ⚠️ BOČNÝ PADDING 0 40px ZANIKOL SPOLU S KRÍŽIKOM (2026-09-01). Držal dlhý názov mimo
   tlačidla, ktoré tam už nie je — panel podľa locku z 28. 8. krížik nemá (von sa ide klikom
   mimo alebo Esc), takže by rezerva len zbytočne zužovala nadpis. */
.comm-modal-head{position:relative;display:flex;align-items:flex-start;justify-content:center;gap:12px;margin-bottom:18px;}
.comm-modal-title{font-family:${P};font-weight:700;font-size:16px;color:${s.ink};line-height:1.25;text-align:center;}
.comm-modal-sub{font-size:12px;color:${s.dim};margin-top:4px;text-align:center;}
.comm-field{margin-bottom:18px;}
.comm-label{display:block;font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:${s.deep};margin-bottom:9px;}
.comm-hint{margin:4px 0 0;font-family:${k};font-size:12px;color:${s.deep};opacity:.7;}

/* rating packy (klikateľné) žijú v PawRating (addtrip/PawRating.tsx) — vlastné inline štýly. */

/* ── ODMENA PO ✓ (2026-08-05, zadanie §3b) — béžová = zarobené nohami, zlatá = objavenie.
   Dve farby, dva druhy bodov. Blok sedí HORE v popupe, nad ponukou hodnotenia: najprv sa
   dozvieš, čo ti padlo, až potom ťa appka o niečo prosí. */
/* ODMENA = PAPYRUSOVÝ BLOK (Matej 2026-08-06: „tieto body sa mi stále nepáčia nie je to dobre
   zvýraznené… skúsme to dať do bežoveho pozadia… urob to krajšie a vizuálnejšie aj
   pochopiteľnejšie"). Predtým bol blok tmavý (rgba(245,240,228,0.05)) a jediná svetlá vec v ňom
   bola béžová pilulka — číslo tak plávalo bez ukotvenia.
   ⚠️ OD 1. 9. 2026 JE TO PODBLOK (úroveň 2), NIE KARTA. Kým bol modal tmavý, bola karta
   správna — bola v ňom jediná svetlá plocha. Odkedy je papyrusový celý panel, sú to dve
   rovnaké karty v sebe a matricový tieň karty (0 14px 44px čiernej + halo ring) urobí okolo
   odmeny tmavý prstenec. Úroveň 2 = panelGrad, 1px rám, radius 12, jemný lift. */
.comm-reward{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;padding:16px 16px;border-radius:12px;background:${n.panelGrad};border:1px solid ${n.cardEdge};box-shadow:${S.lift};}
.comm-reward-eyebrow{font-family:${k};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${n.cardEdge};}
.comm-reward-row{display:flex;align-items:center;gap:11px;min-width:0;}
.comm-reward-txt{font-family:${k};font-weight:600;font-size:12px;color:${n.inkStrong};min-width:0;overflow:hidden;text-overflow:ellipsis;}
/* Bonusový riadok je „objav" — meno jednotky nesie väčšiu váhu než druh objavenia.
   Na papyruse ide inkoust, nie svetlý text; druh objavenia ostáva zlatý (drží aj na bledom). */
.comm-reward-row--bonus .comm-reward-txt{color:${n.inkStrong};}
/* ROZPAD ZÁKLADU — odsadený POD pilulku, nie vedľa nej: je to vysvetlivka k číslu nad ním,
   nie ďalšia odmena. Preto žiadne pilulky, len holé čísla v tlmenom inkouste — inak by
   „5 · 11 · 10" vyzeralo ako tri ďalšie výplaty popri +26. */
/* ⚠️ zvislá čiara NESMIE byť T.rule — ten je gradient, a border:2px solid <gradient> je
   neplatné CSS, ktoré prehliadač ticho zahodí (čiara by zmizla bez chyby). Preto vyblednutá
   zlatá ako plná farba. */
.comm-reward-break{display:flex;flex-direction:column;gap:3px;margin:-4px 0 0 8px;padding-left:12px;border-left:2px solid ${n.border};}
.comm-reward-breakrow{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${k};font-weight:500;font-size:10px;color:${n.inkWarm};}
.comm-reward-breakrow b{font-weight:600;color:${n.inkStrong};font-variant-numeric:tabular-nums;white-space:nowrap;}
.comm-reward-unit{font-family:${P};font-weight:700;}
.comm-reward-kind{display:block;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${n.cardEdge};margin-top:2px;}
/* deliaca čiara vnútri bledej karty = zlatá, vyblednutá do strán (lock z Entry.tsx),
   NIE šedý hairline. Oddeľuje „čo už padlo" od „čo ešte môžeš získať". */
.comm-reward-rule{height:2px;border:0;margin:2px 0 0;background:${n.rule};}
.comm-reward-next{display:flex;align-items:center;gap:10px;min-width:0;}
.comm-reward-nexttxt{font-family:${k};font-weight:500;font-size:12px;line-height:1.35;color:${n.inkWarm};min-width:0;}

/* WalkedPopup 2-stĺpcový layout (Matej 2026-07-23 — širší popup, zmestí sa na výšku bez rolovania) */
.comm-walked-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;}
@media (max-width:560px){ .comm-walked-grid{grid-template-columns:1fr;} }

/* segmented choice (difficulty / crowd) — VÝBER = PRIESVITNÝ LAPISOVÝ TINT (lock 2026-08-26).
   Plná farebná plocha je vyhradená jedinému hlavnému CTA panela (ODOSLAŤ). */
.comm-seg{display:flex;gap:8px;}
.comm-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 8px;border-radius:8px;border:1px solid ${s.border};background:${s.soft};color:${s.ink};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-seg button:hover{border-color:${n.cardEdge};background:${n.card};}
.comm-seg button.on{${se(O.edge,G.lapis,.14)}font-weight:600;}

/* ⚠️ 16 px = strop proti iOS zoomu dokumentu (feedback_dogypt_form_input_recurring_bugs).
   Týka sa aj poľa „kto bol so mnou" v pridávaní výletu — pri 13 px sa pri kliknutí do neho
   priblížil celý dokument a spodné ovládanie mapy vypadlo mimo obrazovky. */
/* Písacie pole = .pf-field--flat recept: PLOCHÁ papyrusová výplň, jeden zlatý rám, tmavý
   inkoust. Priesvitná biela (starý recept) na svetlom podklade nekreslí nič.
   Zaostrenie je LAPIS — je to moja akcia, nie konštrukcia. */
.comm-textarea,.comm-input,.comm-selectinput{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:${s.field};border:1px solid ${s.border};border-radius:8px;padding:8px 12px;color:${s.ink};font-family:inherit;font-size:16px;outline:0;resize:vertical;color-scheme:light;}
.comm-textarea:focus,.comm-input:focus,.comm-selectinput:focus{border-color:${O.edge};box-shadow:0 0 0 3px ${O.halo};}
.comm-textarea{min-height:66px;}

/* HLAVNÉ CTA PANELA = LAPIS (brandový kánon 2026-08-28). Geometria (radius 8) je z locku
   .btn-gold — zmena farby nie je povolenie na iný tvar. */
.comm-submit{width:100%;font-family:${P};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${O.grad};color:${O.ink};border:1px solid ${O.deep};box-shadow:${ie};cursor:pointer;}
.comm-submit:hover:not(:disabled){background:${O.gradHover};}
/* ⚠️ NEDOSTUPNÉ CTA SA NA PAPYRUSE NEROBÍ KRYTÍM. opacity:.4 na plnom lapise dá levanduľovú
   škvrnu, na ktorej zlaté písmo zmizne — svetlý podklad zabíja všetko postavené na
   priesvitnosti. Vypnuté tlačidlo je preto plochý papyrus s tlmeným inkoustom: vidno, že
   je vypnuté, a vidno, čo je na ňom napísané.
   → [[feedback_svetly_povrch_zabija_priesvitnost]] */
.comm-submit:disabled{background:rgba(42,22,8,0.06);border-color:${s.hair};color:${s.faint};box-shadow:none;cursor:default;}
/* „Teraz nie" je rovnocenná ponuka, nie akcia — papyrusový outline, nie druhá plná farba. */
.comm-ghostbtn{width:100%;margin-top:9px;font-family:${P};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${s.soft};color:${s.ink};border:1px solid ${s.border};cursor:pointer;}
.comm-ghostbtn:hover{border-color:${n.cardEdge};color:${s.deep};background:${n.card};}


/* multi-select chips (hazards, atď.) — hrozba je červená, lebo červená TU nesie význam
   (nie je to voľba farby): označený hazard je varovanie pre ostatných. */
.comm-chips{display:flex;flex-wrap:wrap;gap:7px;}
.comm-chip{padding:8px 12px;border-radius:999px;border:1px solid ${s.border};background:${s.soft};color:${s.ink};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-chip:hover{border-color:${n.cardEdge};background:${n.card};}
.comm-chip.on{${se(n.alertRed,G.red,.14)}font-weight:600;}


/* ── crowd meta (agregát na karte + inline detaile) ── */
.comm-crowd{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.comm-crowd.detail{gap:6px;}
.comm-crowd-rating{display:inline-flex;align-items:center;gap:5px;font-family:${k};font-weight:600;color:${D};}
.comm-crowd-row{display:inline-flex;align-items:center;gap:5px;color:rgba(245,240,228,0.6);white-space:nowrap;}
.comm-crowd-count{font-size:10px;color:${n.onDarkDim};font-style:italic;white-space:nowrap;}
.comm-crowd-seed{font-size:10px;color:${D};opacity:.7;letter-spacing:0.02em;text-transform:uppercase;}

/* ── BigRating (Matej 2026-07-22): pravý stĺpec karty/detailu = LEN 1 packa + veľké číslo X.Y,
   ostatné (náročnosť/popularita/hazard) sa presunuli na fotku ako PhotoMetaPills. ── */
/* Rad sa zalomí, keď je stĺpec úzky — päť packiek s číslom a zátvorkou je širšie než jedna
   ikonka, ktorá tu stála predtým. Zarovnanie doprava drží celý blok pri hrane karty. */
.comm-bigrating{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:4px 7px;}
.comm-bigrating b{font-family:${k};font-weight:600;font-size:24px;color:${D};line-height:1;}
/* Počet hlasov je poznámka k číslu, nie druhé číslo — najmenší stupeň, bez kurzívy navyše. */
.comm-bigrating i{font-style:normal;font-family:${k};font-weight:500;font-size:10px;color:${n.onDarkDim};line-height:1;}
.comm-bigrating.compact b{font-size:20px;}
.comm-bigrating.compact i{font-size:10px;}
/* mini = podpisový riadok karty (autor + hodnotenie). Nezalamuje sa: je to jedna poznámka,
   nie stĺpec — pri zalomení by odtlačila meno autora do druhého riadku. */
.comm-bigrating.mini{flex-wrap:nowrap;gap:0 5px;}
/* Matej 2026-08-26: „hodnotenie o 10 % zväčši" — podpis vedľa klesol na 12 px, takže hodnotenie
   musí zostať tým, čo v riadku vedie. 12 → 13,2 px, labky 10 → 11 px, počet hlasov 9 → 10 px. */
.comm-bigrating.mini b{font-size:14px;}
.comm-bigrating.mini i{font-size:10px;}

/* ── PhotoMetaPills — DOLNÝ pruh fotky. Hazard TU NIE JE (ten je až v detaile vedľa tagov).
   Hover na pilulku = vysvetlenie (%-rozpad hlasov členov).
   Matej 2026-07-27: z 2 stacknutých pilúl (náročnosť·km·↑m / popularita) sú TRI vedľa seba
   po šírke fotky — ↔ km · ↑ m │ náročnosť │ popularita. Dôvod: stacknuté zaberali výšku
   fotky a km sa strácali v pilulke náročnosti. ── */
.comm-photometa{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px;}
.comm-mpill{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);border:1px solid ${n.onDarkBorder};color:#fff;font-family:${k};font-weight:600;font-size:10px;letter-spacing:.02em;padding:4px 8px;border-radius:999px;white-space:nowrap;}
/* hazard chip (len v detaile, vedľa tagov) — červený, % = koľko členov nahlásilo. */
.comm-hazardtag{display:inline-flex;align-items:center;gap:5px;background:rgba(178,38,30,0.16);border:1px solid ${n.alertRed};color:#E0796D;font-size:10px;font-weight:600;padding:4px 8px;border-radius:999px;white-space:nowrap;}

/* hover %-rozpad tooltip (design §A) */
.comm-hastip{position:relative;cursor:help;}
/* Matej 2026-07-27: „pri prejdení myšou ten obsah vysvetlenia preteka mimo viewport".
   Tooltip je kotvený right:0 NA PILULKU — kým bola náročnosť sama v pravom rohu, vošla sa.
   Odkedy sú pilulky v rade, náročnosť je v strede a nowrap tooltip vylezie vľavo z karty.
   Pevný strop šírky nestačí (pri krátkej km pilulke vyjde ľavá hrana mimo kartu), takže
   tooltip kotvíme na CELÝ pruh pilúl, nie na jednu pilulku: pilulka je position:static,
   pruh position:relative, tooltip left:0/right:0 → má presne šírku pruhu a pretiecť
   nemôže bez ohľadu na to, koľko pilúl je pred ním. V článku (stat tabuľka, 760px) sa nič
   nemení — tam nowrap funguje.
   POZOR: tento CSS blok je template literál — ŽIADNE spätné apostrofy v komentároch. */
.comm-photometa{position:relative;}
/* backdrop-filter na pilulke robí z pilulky CONTAINING BLOCK pre absolútne deti — tooltip sa
   z nej potom nedá vymaniť ani cez position:static a ostane široký ako pilulka (5 riadkov na
   šírku 80px). Na fotke preto blur rušíme; pozadie rgba(0,0,0,0.6) + biely okraj ostávajú,
   rozdiel je opticky nulový. Mimo fotky (.comm-mpill inde) sa blur nemení. */
.comm-photometa .comm-hastip{position:static;}
.comm-photometa .comm-hastip::after{left:0;right:0;width:auto;max-width:none;white-space:normal;text-align:left;line-height:1.4;}
.comm-hastip::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 7px);right:0;background:${n.panelGrad};border:1.5px solid ${n.cardEdge};color:${F};font-family:${k};font-size:10px;font-weight:600;padding:4px 8px;border-radius:8px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:${n.panelShadow};z-index:20;}
.comm-hastip:hover::after{opacity:1;}

/* ⚠️ SHELL ZRUŠENÉHO DASHBOARDU „My Slovakia" ZMAZANÝ 2026-09-01.
   .comm-dash / -inner / -head / -title / -hero / .comm-ring / -herotxt / -tabs / -tab
   nekreslil od 23. 7. 2026 nikto — dashboard nahradil TripStatsPanel na /pack/map/triplist
   (viď hlavička PackTriplist.tsx: „bývalý Trippin dashboard modal, ktorý je TÝMTO zrušený").
   Overené grepom cez všetky className v src: jediná žijúca trieda z tejto rodiny je
   .comm-dash-section-title nižšie. Prezliekať mŕtvy tmavý shell do papyrusu by znamenalo
   nechať v súbore recept, ktorý niekto raz skopíruje pre nový povrch.

/* IDENTITY header = PAPYRUSOVÝ BLOK (Matej 2026-08-06: „BLOK s profilom dajme do papyrusovej
   nech vynikne a pils dajme vedla nie pod, ikonku info daj do horneho praveho rohu").
   Predtým to bolo tmavé sklo v tmavom paneli — profil sa vizuálne nelíšil od štatistík pod ním.
   "position:relative" je kvôli info tlačidlu v rohu.
   ⚠️ OD 1. 9. 2026 JE TO PODBLOK (úroveň 2 matrice), NIE KARTA. Kým bol panel okolo neho
   tmavý, bola karta (úroveň 1) správna — bola jediná svetlá vec na doske. Odkedy je celý
   panel papyrusová karta, sú to dve rovnaké karty v sebe: rovnaký gradient, rovnaký rám,
   a matricový tieň (0 14px 44px čiernej + halo ring) z toho urobí tmavý mrak vnútri svetlého
   bloku. Úroveň 2 = panelGrad, 1px rám, radius 12, jemný lift. */
.comm-vhead{position:relative;display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:${n.panelGrad};border:1px solid ${n.cardEdge};border-radius:12px;box-shadow:${S.lift};padding:16px 16px;margin-bottom:22px;}
.comm-vhead-pack{display:flex;align-items:center;flex-shrink:0;}
/* prstenec okolo avatara = farba PODKLADU, nie čierna stránka — na papyruse by čierny krúžok
   vyzeral ako dier(k)a. T.card je plná papyrusová, T.cardGrad by sa v box-shadow nedal použiť. */
.comm-vavatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid ${n.cardEdge};box-shadow:0 0 0 3px ${n.card};background:rgba(201,154,63,0.12);margin-left:-14px;}
.comm-vhead-pack .comm-vavatar:first-child{margin-left:0;}
.comm-vavatar img{width:100%;height:100%;object-fit:cover;display:block;}
.comm-vavatar img.comm-vavatar-fallback{width:18px;height:18px;object-fit:contain;filter:none;opacity:.6;}
.comm-vavatar--owner{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);font-family:${k};font-weight:600;font-size:16px;color:${F};}
/* .comm-vavatar--slot (prerušovaný „+" krúžok = priestor pre budúceho member, Matej 23. 7.)
   ZMAZANÝ 2026-08-05 — Matej: „to plus daj preč tu sa psy nebudú pridávať". */
/* MENO + PILULKA V JEDNOM RADE (Matej 2026-08-06: „pils dajme vedla nie pod"). Meno berie
   zvyšok šírky, pilulka sa nezmenší; "padding-right" drží text mimo info tlačidla v rohu. */
.comm-vhead-id{flex:1;min-width:180px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-right:32px;}
/* vlajky precestovaných krajín — trofej, ktorá rastie. Krúžok má vlastný zlatý rám z FlagCircle,
   takže tu ide len o rozostup, klikateľnosť a zvýraznenie práve zvolenej krajiny. */
.comm-vflags{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;}
.comm-vflag{display:inline-flex;padding:0;border:0;background:none;cursor:pointer;border-radius:50%;line-height:0;transition:transform .15s;}
.comm-vflag:hover{transform:translateY(-1px);}
/* zvolená krajina = zlatý prstenec OKOLO krúžku (box-shadow, nie border — border by vlajku
   zmenšil a rad by poskakoval pri každom prepnutí). */
.comm-vflag.on{box-shadow:0 0 0 2px ${n.card},0 0 0 4px ${D};}

.comm-vhead-name{font-family:${P};font-weight:700;font-size:16px;color:${n.inkStrong};min-width:0;}
/* Výplň, inkoust a rám dodáva tierPillStyle(level) inline — tu ostáva len tvar. Pilulka je
   TLAČIDLO (otvára škálu pásiem), takže potrebuje reset kurzora a rodinu písma. */
.comm-tierwrap{position:relative;display:inline-flex;flex-shrink:0;}
.comm-level-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid ${X.edge};border-radius:999px;padding:8px 12px;font-family:${k};font-weight:600;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:filter .15s;}
.comm-level-pill:hover{filter:brightness(1.06);}
/* Ikonka DEDÍ inkoust pásma cez masku — pri tmavých pásmach (karneol, cyprus, lapis, ametyst)
   je tier.ink svetlý a čierny filter by z pohára spravil dieru. */
.comm-level-ic{width:14px;height:14px;flex-shrink:0;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
/* JEDINÝ VÝKLAD LEVELU — plávajúci PANEL (úroveň 4 matrice) pod pilulkou (Matej 1. 9. 2026:
   „spojiť dva popupy na hlavičke do jedného ako na mape"). Nesie ŠKÁLU PÁSIEM aj CENNÍK
   BODOV, teda to isté a v tom istom poradí ako LevelPanel na mape.
   ⚠️ max-height NIE 70vh a ani holé 52vh: popup začína ~300 px pod horným okrajom okna (visí
   pod hlavičkou profilu), takže percento z celého okna mu preteká POD spodok — a vnútorný
   overflow s tým nič nespraví, lebo neoreže ho vlastná výška, ale viewport. Presne takto bola
   sekcia "Country ranks" neviditeľná. Preto sa tá rezerva odpočíta rovno vo vzorci; 320 px je
   podlaha, aby na nízkom okne ostal popup použiteľný. Odkedy nesie OBA výklady (1. 9.), by
   pevných 52vh znamenalo, že sa k vlastným bodom vždy musí rolovať.
   ⚠️ Šírka je 520, nie 340 — dvojstĺpcový cenník sa do úzkeho popupu nezmestí; pod 560 px
   padá na jeden stĺpec sám (media query pri .comm-pts-cols). */
.comm-tiers{position:absolute;top:calc(100% + 9px);left:0;z-index:32;width:min(520px,88vw);max-height:max(320px,calc(100vh - 300px));overflow-y:auto;overscroll-behavior:contain;text-align:left;cursor:default;text-transform:none;letter-spacing:normal;background:${n.panelGrad};border:1.5px solid ${n.cardEdge};border-radius:14px;box-shadow:${n.panelShadow};padding:12px 16px;}
@media (max-width:560px){
  .comm-vhead{padding:12px 16px;gap:12px;}
  .comm-vhead-name{font-size:14px;}
  /* ⚠️ NA ÚZKOM OKNE SA POPUP KOTVÍ NA BLOK, NIE NA PILULKU. Pilulka začína ~145 px od ľavého
     okraja, takže popup široký 88vw jej spod pravého okraja vytiekol z obrazovky (bolo to tak
     aj pri pôvodných 340 px — zväčšenie na 520 to len zviditeľnilo). Zrušením position:relative
     na obale sa najbližším ukotveným predkom stáva .comm-vhead a popup dostane šírku bloku. */
  .comm-tierwrap{position:static;}
  .comm-tiers{left:16px;right:16px;width:auto;}
}

/* svetový prehľad — easy dashboard (Matej 2026-07-23).
   Dlaždica = PODBLOK (úroveň 2): papyrusový gradient, plný zlatý rám, jemný lift pri hoveri.
   Ten istý recept, aký nesie tabuľka čísel v článku výletu (.pta-stat) a dlaždice DOG ID —
   plochá výplň so slabým rámom (úroveň 3) je „suché bez šťavy" a Matej ju na sekcii
   zamietol dvakrát. Číslo je Space Grotesk (dáta), popisok zlatý eyebrow. */
/* ── 1. 9. 2026 (Matej: „krajiny vylety a km a highest point by som dal tiež nejak pekne,
   zaujímavo") ────────────────────────────────────────────────────────────────────────
   Tri veci, žiadna z nich nová farba:
     · číslo je VÄČŠIE (24 → 30) a dostalo tabulárne číslice, aby štyri dlaždice vedľa seba
       stáli na jednej optickej linke a nepohybovali sa pri zmene hodnoty
     · medzi číslom a popiskom je krátka ZLATÁ LINKA (ten istý vyblednutý gradient ako
       deliaca čiara karty, len 26 px) — dlaždica tým dostane os, na ktorej číslo visí
     · hover dvíha a pridáva zlaté halo, teda to isté správanie ako dlaždice DOG ID */
.comm-worldstats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:8px;}
.comm-wstat{background:${n.panelGrad};border:1.5px solid ${n.cardEdge};border-radius:14px;box-shadow:${S.lift};padding:16px 12px 16px;text-align:center;transition:transform .2s ease,box-shadow .2s ease;}
.comm-wstat:hover{transform:translateY(-2px);box-shadow:${S.card};}
.comm-wstat b{display:block;font-family:${k};font-weight:600;font-size:24px;font-variant-numeric:tabular-nums;color:${s.ink};line-height:1;}
/* ⚠️ NAJVYŠŠÍ BOD JE MENO MIESTA, NIE ČÍSLO — a typografický lock hovorí, že identitu
   (názvy miest) nesie Cinzel, kým dáta nesie Space Grotesk. Do 1. 9. tu stálo meno vrcholu
   v Space Grotesku so zmenšeným písmom cez inline style, takže sa v rade štyroch dlaždíc
   čítalo ako pokazené číslo. */
.comm-wstat--name b{font-family:${P};font-weight:700;font-size:16px;line-height:1.15;letter-spacing:0.02em;}
.comm-wstat span{display:block;font-family:${k};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${n.cardEdge};margin-top:9px;padding-top:8px;position:relative;}
/* krátka zlatá linka nad popiskom — vyblednutá do strán, teda tá istá technika ako T.rule,
   len na 26 px. Border-top by kreslil ostrý predel cez celú šírku dlaždice. */
.comm-wstat span::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:26px;height:2px;background:${n.rule};}
@media (max-width:560px){ .comm-worldstats{grid-template-columns:repeat(2,1fr);} .comm-wstat b{font-size:24px;} }
/* PSIE KM (B20, Matej 17. 9. 2026) — „v tripstats bude aj pes a jeho stats."
   🔒 JE TO DRUHÝ RIADOK, NIE DRUHÝ PÚTNIK. WORLD staty nad tým ostávajú ČLOVEKU
   (pútnik = všetky km so psami) a nič sa im neodoberá; tu stojí, koľko z toho
   prešiel KTORÝ pes. Preto žiadny level, prstenec ani body — dve čísla a meno.
   Úroveň RIADOK (r12, plochá výplň), nie karta: je to položka zoznamu pod
   štyrmi kartami vyššie, nie piata karta. */
.comm-dogstats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;}
.comm-dogstat{display:flex;align-items:center;gap:8px;flex:1 1 220px;background:${n.tileBg};border:1px solid ${n.border};border-radius:12px;padding:8px 12px;}
.comm-dogstat img{width:32px;height:32px;border-radius:999px;object-fit:cover;flex-shrink:0;border:1px solid ${n.cardEdge};}
.comm-dogstat-txt{display:flex;flex-direction:column;min-width:0;}
.comm-dogstat-name{font-family:${P};font-weight:700;font-size:12px;letter-spacing:.02em;color:${s.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.comm-dogstat-num{font-family:${k};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${n.cardEdge};}

.comm-cat{background:${n.panelGrad};border:1px solid ${n.cardEdge};border-radius:12px;box-shadow:${S.lift};padding:16px 16px;margin-bottom:12px;}
/* klikateľná geo kategória → ADD TRIP (Matej 2026-07-23): button reset + hover. */
.comm-cat--click{display:block;width:100%;text-align:left;cursor:pointer;font-family:inherit;transition:border-color .15s;}
.comm-cat--click:hover{border-color:${s.deep};background:${n.card};}
.comm-cat-head{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
/* zbaliteľná hlavička (magistrály) — vyzerá ako ostatné hlavičky kategórií, len je klikacia
   a nesie šípku. "width:100%" + "margin:0" prebíjajú default <button>, aby zavretá kategória
   nemala pod sebou dieru po "margin-bottom". */
.comm-cat-head--btn{width:100%;background:none;border:0;padding:0;font-family:inherit;text-align:left;cursor:pointer;margin-bottom:0;}
.comm-cat-head--btn.on{margin-bottom:11px;}
.comm-cat-head--btn:hover .comm-cat-name{color:${s.deep};}
.comm-cat-head--btn .comm-drop-chev{flex-shrink:0;transition:transform .2s;}
.comm-cat-head--btn.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}
/* ⚠️ .comm-cat-ic ZMAZANÉ 2026-09-01 — Matej: „radšej daj preč ikonky pri blkoch (national
   parks mountain ranges atd…)". Ikonka pred nadpisom nič nerozlišovala (vrstvy, strom, labka,
   pohár, vlnky sa pri sebe čítali ako ozdoba) a v každom bloku pridávala druhý tvar do riadku,
   ktorý má niesť jedno slovo a jedno číslo. c.icon v SK_GEO ostáva — kreslí sa ním MEDAILA
   v kategóriách bez loga (vrcholy, vody). */
.comm-cat-name{font-family:${P};font-weight:700;font-size:12px;color:${s.ink};flex:1;}
.comm-cat-pct{font-family:${k};font-weight:600;font-size:12px;color:${s.deep};}
/* koľajnica pruhu = tmavý inkoust s nízkou alfou (ako .comm-lvlbar). Svetlá koľajnica by
   na papyruse zmizla a pruh by vyzeral, akoby začínal odnikiaľ. */
.comm-cat-bar{height:7px;border-radius:999px;background:rgba(42,22,8,0.14);overflow:hidden;}
.comm-cat-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);transition:width .4s;}
/* ⚠️ .comm-walkedhead / -n ZMAZANÉ 2026-09-01 — nahradil ich .comm-drop (viditeľný ovládač,
   #46) a od vtedy ich nekreslil nikto. */
.comm-dash-section-title{font-family:${k};font-weight:500;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${s.deep};margin:20px 0 12px;}
/* položka zoznamu = RIADOK (úroveň 3 matrice): plochá výplň, slabší rám. Desať kariet pod
   sebou by z panela spravilo schodisko. */
.comm-walkedrow{display:flex;align-items:center;justify-content:space-between;gap:12px;background:${n.tileBg};border:1px solid ${n.border};border-radius:8px;padding:12px 16px;margin-bottom:9px;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-walkedrow:hover{border-color:${n.cardEdge};background:${n.card};}
.comm-walkedrow-name{font-family:${P};font-weight:700;font-size:12px;color:${s.ink};}
.comm-walkedrow-meta{font-size:10px;color:${s.dim};white-space:nowrap;flex-shrink:0;}
.comm-cat-units{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px;}
.comm-unit{font-size:10px;padding:4px 8px;border-radius:999px;border:1px solid ${s.border};color:${s.dim};background:${s.soft};font-family:inherit;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.comm-unit:hover{border-color:${n.cardEdge};color:${s.deep};background:${n.card};}
.comm-unit.done{border-color:${n.cardEdge};color:${s.deep};background:rgba(201,154,63,0.18);}
/* per-unit rozklad (Slice A, bod 2): farba podľa počtu prejdených tripov na jednotku.
   ⚠️ Na papyruse ide TMAVÝ inkoust tej istej farby — UNIT_STARTED_COLOR (#E8B22E) aj
   UNIT_DONE_COLOR (#37B26A) sú svetlé odtiene robené na čiernu dosku a na piesku by z nich
   ostal svetlý fliačik. Rám ostáva plnou farbou významu, čitateľnosť nesie inkoust. */
.comm-unit--started{border-color:${Oa};color:${Sa};background:rgba(232,178,46,0.20);}
.comm-unit--done{border-color:${n.growGreen};color:${Fe};background:rgba(61,122,78,0.16);}

/* medaily (parks/chko/peaks/waters) — Matej 2026-07-23 zadanie bod 2: „musia to byť ozaj
   odznaky… na to sa kliknúť nebude dať bude to len medaila". Žiadny bar, žiadny ×N, žiadny klik. */
.comm-cat-count{font-size:10px;color:${s.dim};flex-shrink:0;}
.comm-medals{display:flex;flex-wrap:wrap;gap:14px;margin-top:13px;}
.comm-medal{width:68px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;}
.comm-medal-ic{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.comm-medal-ic img{width:26px;height:26px;}
.comm-medal--on .comm-medal-ic{background:${X.grad};box-shadow:${S.lift};}
.comm-medal--on .comm-medal-ic img{filter:brightness(0) invert(1);}
/* ⚠️ VRCHOLY A VODY SÚ LAPISOVÉ, NIE ZLATÉ (Matej 1. 9. 2026: „highest peaks a top waters by
   mali byť lapisom nie zlatou").
   Nie je to rozmar: na tejto obrazovke je zlatá naraz rámom bloku, pruhom postupu, chipom
   odškrtnutého pohoria AJ medailou — päť rôznych významov v jednej farbe. Parky a CHKO majú
   vlastné farebné logá, takže odlíšiť sa potrebujú práve tie dve kategórie, ktoré kreslíme
   my. Zlato ostáva na LEME — lapis so zlatým prstencom je pôvodná egyptská dvojica, holý
   modrý kruh by na papyruse stál mimo brandu. */
.comm-medal--on.comm-medal--lapis .comm-medal-ic{background:${O.grad};box-shadow:${ie};}
/* nezískaná medaila = zapustené miesto v papyruse, nie svetlá škvrna: tmavý inkoust s nízkou
   alfou a ČIERNA maska ikonky. invert(1) ju robilo bielou — správne na čiernej doske, na
   piesku prázdne miesto. */
.comm-medal--off .comm-medal-ic{background:rgba(42,22,8,0.07);border:1px solid ${s.border};}
.comm-medal--off .comm-medal-ic img{filter:brightness(0);opacity:.34;}
/* parks = reálne NP logá (Matej 2026-07-23): ŽIADNY krúžok/chip — logá ponechané ako sú, len
   vystrihnuté na priehľadnom pozadí. Earned = plná farba; off = odšednuté + stlmené. */
.comm-medal-ic--logo{width:62px;height:62px;padding:0;border-radius:0;background:none;border:none;}
.comm-medal-ic--logo img{width:100%;height:100%;object-fit:contain;}
.comm-medal--on .comm-medal-ic--logo{background:none;box-shadow:none;border:none;}
.comm-medal--on .comm-medal-ic--logo img{filter:none;}
.comm-medal--off .comm-medal-ic--logo{background:none;box-shadow:none;border:none;}
.comm-medal--off .comm-medal-ic--logo img{filter:grayscale(1) brightness(.88) contrast(1.05);opacity:.62;}
/* TANAP + Pieniny = biely kruh za logo (tmavý text robený pre biele pozadie → čitateľný v OBOCH
   stavoch). off = mierne stlmený svetlý disk, ale text stále vidno (žiadne opacity .3/.5 fade). */
.comm-medal-ic--disc{background:#FBF9F4;border-radius:50%;padding:8px;box-shadow:${S.lift};}
.comm-medal-ic--disc img{filter:none;opacity:1;}
.comm-medal--off .comm-medal-ic--disc{background:#D6D1C4;}
.comm-medal--off .comm-medal-ic--disc img{filter:grayscale(.45);opacity:.92;}
/* voľný per-park hook na zväčšenie tenkých log (aktuálne prázdny — Pieniny rieši disc). */
.comm-medal-ic--big img{transform:scale(1.22);}
.comm-medal-name{font-size:10px;line-height:1.25;color:${s.ink};}
.comm-medal--off .comm-medal-name{color:${s.dim};opacity:.7;}
.comm-unit-drop{margin-top:10px;padding-top:8px;border-top:1px solid ${s.hair};}
.comm-unit-empty{text-align:center;font-size:10px;color:${s.dim};padding:4px 0 8px;font-style:italic;}
.comm-unit-addrow{text-align:center;font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.02em;color:${s.deep};padding:8px;border-radius:8px;border:1px dashed ${n.border};cursor:pointer;transition:border-color .15s,background .15s;}
.comm-unit-addrow:hover{border-color:${n.cardEdge};background:rgba(201,154,63,0.14);}

/* HERO BADGES — deviatka hrdinských odznakov (Matej 2026-07-24), globálny trip-míľnik achievement.
   3D medailón feel: earned = plná farba + zlatý glow + jemný float; locked = grayscale + tlmené
   (pes aj číslo míľnika stále čitateľné — žiadna silueta). */
.comm-heroes{display:grid;grid-template-columns:repeat(9,1fr);gap:6px;margin-top:13px;}
@media (min-width:640px){.comm-heroes{gap:10px;}}
.comm-hero{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;font-family:inherit;cursor:pointer;padding:4px;}
.comm-hero img{width:100%;aspect-ratio:1;object-fit:contain;transition:transform .25s,filter .25s;}
/* ⚠️ ZÍSKANÝ ODZNAK SVIETI TIEŇOM, NIE ŽIAROU (2026-09-01). Zlatá žiara okolo zlatého
   medailónu na PIESKU nekreslí nič — halo na svetlom podklade sa nezosilňuje polomerom,
   ale hustotou a kontrastom voči podkladu. Na papyruse teda hrá teplý VRHNUTÝ tieň:
   odznak sa dvíha nad dosku namiesto toho, aby do nej svietil.
   Plávanie aj naklonenie pri hoveri ostávajú — tie na podklade nezávisia. */
.comm-hero--on img{filter:drop-shadow(0 0 5px rgba(201,154,63,0.55)) drop-shadow(0 5px 7px rgba(90,62,20,0.40));animation:comm-hero-float 4s ease-in-out infinite;}
.comm-hero--on:hover img{transform:perspective(500px) rotateY(-8deg) scale(1.08);}
/* nezískaný = odšednutý a stlmený, ale stále čitateľný (pes aj číslo míľnika). brightness pod
   1 ho na papyruse zatemní do machule, preto mierne NAD 1. */
.comm-hero--off img{filter:grayscale(1) brightness(.94) contrast(1.06);opacity:.58;}
.comm-hero-trips{font-family:${k};font-weight:600;font-size:10px;color:${s.dim};}
.comm-hero--on .comm-hero-trips{color:${s.deep};}
@keyframes comm-hero-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
@media (prefers-reduced-motion:reduce){.comm-hero--on img{animation:none;}.comm-hero--on:hover img{transform:none;}}

/* REVEAL overlay — „milestone reached" moment (Matej 2026-07-24, upresnenie 2026-07-24 = horizontálny
   card layout), portál do document.body (rodičovský .pk-glass má backdrop-filter → containing block
   by ukotvil position:fixed o panel, nie o viewport). Backdrop klik = dismiss; klik NA card = nič. */
/* Závoj ostáva tmavý — je to okamih, keď má obrazovka stíchnuť a svietiť má len odznak.
   Karta pod ním je PANEL (úroveň 4 matrice): papyrus, 1.5px zlatý rám, panelShadow. */
.comm-reveal{position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;cursor:pointer;animation:comm-reveal-fadein .35s ease;}
.comm-reveal-card{position:relative;display:flex;gap:28px;align-items:center;width:100%;max-width:760px;max-height:86vh;background:${n.panelGrad};border:1.5px solid ${n.cardEdge};border-radius:14px;padding:32px;cursor:default;box-shadow:${n.panelShadow};animation:comm-reveal-pop .55s cubic-bezier(.2,1.3,.4,1);}
.comm-reveal-left{flex:0 0 210px;display:flex;flex-direction:column;align-items:center;gap:12px;}
.comm-reveal-badge{width:210px;max-width:44vw;filter:drop-shadow(0 0 14px rgba(201,154,63,.45)) drop-shadow(0 10px 20px rgba(90,62,20,.40));}
.comm-reveal-trips{font-family:${k};font-weight:600;font-size:12px;color:${s.deep};letter-spacing:0.14em;text-transform:uppercase;}
.comm-reveal-right{flex:1;min-width:0;text-align:left;max-height:70vh;overflow-y:auto;}
/* Eyebrow na papyruse = zlatá (T.cardEdge), telo textu plný inkoust s tichším krytím —
   inkWarm je na popisky a odsek v ňom sa číta ako poznámka pod čiarou. */
.comm-reveal-kicker{font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.22em;color:${n.cardEdge};text-transform:uppercase;}
.comm-reveal-name{font-family:${P};font-weight:700;font-size:24px;color:${s.ink};margin-top:6px;line-height:1.05;}
.comm-reveal-story{font-size:14px;line-height:1.65;color:rgba(42,22,8,0.86);margin-top:14px;}
/* ⚠️ .comm-reveal-x ZMAZANÉ 2026-09-01 — panel podľa locku z 28. 8. krížik nemá, von sa ide
   klikom na závoj alebo Esc (obidve rieši HeroBadges.tsx). */
.comm-reveal-badge--off{filter:grayscale(1) brightness(.94) contrast(1.06) drop-shadow(0 10px 20px rgba(90,62,20,.30));}
.comm-reveal-kicker--locked{color:${s.dim};}
.comm-reveal-source{display:inline-block;margin-top:16px;font-family:${k};font-weight:600;font-size:12px;letter-spacing:0.02em;color:${s.deep};text-decoration:none;border-bottom:1px solid ${n.border};padding-bottom:4px;}
.comm-reveal-source:hover{border-bottom-color:${n.cardEdge};}
.comm-reveal-source-label{font-family:inherit;font-weight:400;font-size:10px;color:${s.dim};letter-spacing:0;}
@media (max-width:600px){
  .comm-reveal-card{flex-direction:column;gap:16px;padding:24px 16px 24px;text-align:center;}
  .comm-reveal-left{flex:none;}
  .comm-reveal-badge{width:150px;}
  .comm-reveal-right{text-align:center;max-height:48vh;}
  .comm-reveal-name{font-size:24px;}
}
@keyframes comm-reveal-fadein{from{opacity:0;}to{opacity:1;}}
@keyframes comm-reveal-pop{from{opacity:0;transform:scale(.94) translateY(8px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion:reduce){
  .comm-reveal{animation:none;}
  .comm-reveal-card{animation:none;}
}

/* ── KARTA PLÁNOVANÉHO VÝLETU S POZVÁNKOU (EventsView) — BLEDÁ (2026-09-01, 2. beh) ──
   Karta stála TMAVÁ vnútri papyrusového panela mapy (.trp-sidebar na PC, .trp-mlist na
   mobile) a v tom istom stĺpci vedľa nej leží bledá .trp-bigcard — jediný tmavý blok
   v zozname.
   ⚠️ HODNOTY SA NEODVODZUJÚ NANOVO. Karta v zozname má podobu vyladenú v bledom skine
   mapy (PackMap.tsx: .trp-sidebar .trp-bigcard); toto je jej SÚRODENEC, takže berie tie
   isté čísla — cardGrad, 1.5px cardEdge, radius 16 a TEPLÝ tieň BEZ zlatého halo ringu.
   Matricový T.cardShadow je pre kartu na ČIERNEJ stránke; na papyruse je z neho čierny
   mrak a ring sa reže o okraj skrolovacieho stĺpca.
   ⚠️ .comm-plan-tag ZMAZANÉ — pravidlo bez jediného výskytu v JSX (overené grepom cez src). */
.comm-plan{background:${n.cardGrad};border:1.5px solid ${n.cardEdge};border-radius:16px;box-shadow:${S.lift};padding:16px 16px;margin-bottom:12px;}
/* Fotka a štítok na nej ostávajú TMAVÉ — podklad je snímka, nie papyrus, presne ako
   .trp-bigcard-photoactbtn. Radius je o hrúbku rámu menší (16 − 1.5), inak fotka vyčnieva
   z oblúka karty. */
.comm-plan-photo{position:relative;margin:-15px -17px 13px;height:150px;background-size:cover;background-position:center;border-radius:14px 15px 0 0;cursor:pointer;}
.comm-plan-planned{position:absolute;left:12px;bottom:10px;font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.5);padding:4px 8px;border-radius:8px;border:1px solid ${n.border};}
.comm-plan-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
/* NEUTRÁLNY typový štítok (výlet). Protipól je zlatý .pev-typechip (podujatie) v
   events/EventCard.tsx — dvojica sa musí líšiť farbou, nielen textom. Na papyruse je
   z toho holý obrys proti teplej zlatej výplni.
   ⚠️ Zlatá ${n.cardEdge} ako PÍSMO má na piesku ~1.9:1, takže zvýraznenie nesie tmavšia
   P.deep — tá istá hodnota, akou svieti zvýraznený stav v celom bledom skine mapy. */
.comm-plan-type{display:inline-block;font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid ${s.border};color:${s.dim};margin-bottom:5px;}
.comm-plan-name{font-family:${P};font-weight:700;font-size:14px;color:${s.ink};}
.comm-plan-meta{font-size:12px;color:${s.dim};margin-top:3px;}
.comm-plan-people{display:flex;flex-direction:column;gap:7px;margin-top:12px;padding-top:12px;border-top:1px solid ${s.hair};}
.comm-person{display:flex;align-items:center;gap:9px;}
/* Zlatý krúžok s tmavým písmenom drží aj na papyruse — je to plocha, nie písmo. */
.comm-person-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${k};font-weight:600;font-size:12px;color:${F};}
.comm-person-txt{flex:1;min-width:0;font-size:12px;color:${s.ink};}
.comm-person-txt b{color:${s.ink};}
.comm-person-txt span{color:${s.dim};}
.comm-buddytoggle{font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 0;background:none;border:none;color:${s.deep};cursor:pointer;}
.comm-msgbtn{flex-shrink:0;font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 12px;border-radius:999px;background:${s.soft};border:1px solid ${s.border};color:${s.ink};cursor:pointer;}
.comm-msgbtn:hover{border-color:${n.cardEdge};color:${s.deep};background:${s.hot};}
/* JOIN = HLAVNÉ CTA karty ⇒ LAPIS, radius 8 (brandový kánon 28. 8.). Tá istá dvojica,
   akú dostali JOIN a SAVE DATE v tripliste 1. 9. Pilulkový tvar zaniká: geometriu nesie
   lock .btn-gold, lapis mení len výplň. */
.comm-joinbtn{flex-shrink:0;font-family:${P};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:${O.grad};color:${O.ink};border:1px solid ${O.deep};box-shadow:${ie};cursor:pointer;}
.comm-joinbtn:hover{background:${O.gradHover};}
/* „Going" nie je akcia, je to STAV — zelený tint, rovnako ako prejdený výlet v článku.
   Plná zelená by na karte stála druhá plná farba vedľa lapisu a ani jedna by neviedla. */
.comm-joinbtn.joined{${se(n.growGreen,G.green)}box-shadow:none;}
/* Vypnuté CTA = PLOCHÝ PAPYRUS, nie opacity — krytie na svetlom podklade dá levanduľovú
   škvrnu a písmo z nej zmizne (zistené pri tripliste 1. 9.). */
.comm-joinbtn.closed{background:${s.soft};color:${s.faint};border-color:${s.hair};box-shadow:none;cursor:default;}
.comm-lockbtn{flex-shrink:0;font-family:${k};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:none;border:1px solid ${s.border};color:${s.dim};cursor:pointer;}
.comm-lockbtn:hover{border-color:${n.cardEdge};color:${s.deep};}
.comm-lockbtn.on{border-color:${s.deep};color:${s.deep};background:${s.hot};}
.comm-empty{text-align:center;padding:32px 16px;color:${s.dim};font-size:12px;font-style:italic;}
/* #55 — prázdny stav = JEDNA veta faktu + JEDNA akcia. Bez tlačidla je to slepá ulička:
   po zmazaní fabrikovaných dát (2026-08-03) je toto prvé, čo nový člen v paneli uvidí. */
.comm-emptybox{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 16px;text-align:center;}
.comm-emptybox p{margin:0;color:${s.dim};font-size:12px;font-style:italic;line-height:1.5;}
/* jediná akcia prázdneho stavu = hlavné CTA ⇒ LAPIS (kánon 2026-08-28). Radius 8 ostáva
   z locku .btn-gold — mení sa výplň, nie tvar. */
.comm-emptybtn{font-family:${P};font-weight:700;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 16px;border-radius:8px;border:1px solid ${O.deep};background:${O.grad};color:${O.ink};box-shadow:${ie};cursor:pointer;}
.comm-emptybtn:hover{background:${O.gradHover};}
/* #41 — úprimná veta namiesto fabrikovaného člena/prázdneho bloku (issue #41, ČASŤ 2) */
.comm-buddynote{font-size:10px;color:${s.dim};font-style:italic;padding:8px 0 4px;}

/* ── CompanionPicker (Matej 2026-07-23): „kto bol so mnou" — svorka (moje psy s fotkami) +
   iní členovia podľa mena. Vybraté = avatar chipy s ×. ── */
.comm-comp-selected{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:11px;}
.comm-comp-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(201,154,63,0.12);border:1px solid ${T.border};border-radius:999px;padding:4px 12px 4px 4px;}
.comm-comp-chip-av{width:26px;height:26px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-family:${k};font-weight:600;font-size:10px;color:${F};}
.comm-comp-chip-av.ph{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}
.comm-comp-chip b{font-size:12px;color:${n.onDark};font-weight:600;}
.comm-comp-chip button{background:none;border:none;color:${n.onDarkDim};font-size:14px;line-height:1;cursor:pointer;padding:0 4px;}
.comm-comp-chip button:hover{color:${D};}
.comm-comp-grouplabel{font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:${n.onDarkDim};margin:2px 0 7px;font-family:${k};font-weight:600;}
.comm-comp-pack{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
.comm-comp-dog{display:inline-flex;align-items:center;gap:8px;background:rgba(245,240,228,0.05);border:1px solid ${n.onDarkBorder};border-radius:999px;padding:4px 12px 4px 4px;cursor:pointer;transition:all .15s;}
.comm-comp-dog:hover{border-color:${D};}
.comm-comp-dog.on{background:rgba(201,154,63,0.16);border-color:${D};}
.comm-comp-dog-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-family:${k};font-weight:600;font-size:12px;color:${F};}
.comm-comp-dog-av.ph{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}
.comm-comp-dog span{font-size:12px;color:${n.onDark};}
.comm-comp-dog .plus{margin-left:2px;color:${D};font-size:14px;font-weight:600;line-height:1;}
/* ⚠️ VYBRATÝ PES SVIETI NAZELENO, NIE NAZLATO (Matej 2026-08-25: „musí tam svietiť hlavy
   psov a po kliknutí sa zazelenajú"). Zlatá na tejto obrazovke znamená „tu si" a nesie ju
   postup krokov; zelená znamená HOTOVO — tá istá, akou svieti dokončený krok v číselníku
   a splnená značka na trase (GROUP_TINT.comment). Jeden význam, jedna farba. */
.comm-comp-dog.on{background:rgba(58,150,88,0.18);border-color:#3A9658;}
.comm-comp-dog.on .comm-comp-dog-av{box-shadow:0 0 0 2px ${n.growGreen};}
/* Zbalené + pred otvorením poľa s menami. Nie zlaté CTA — je to rozbalenie, nie akcia kroku. */
.comm-comp-openothers{display:flex;align-items:center;gap:9px;width:100%;padding:8px 12px;margin-top:10px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px dashed ${n.onDarkBorder};color:${n.onDarkDim};font-family:${k};font-size:12px;cursor:pointer;}
.comm-comp-openothers:hover{border-color:${D};color:${n.onDark};}
.comm-comp-openplus{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:rgba(201,154,63,0.16);color:${D};font-size:14px;line-height:1;}
.comm-comp-searchwrap{position:relative;}
.comm-comp-searchrow{display:flex;gap:8px;align-items:stretch;}
.comm-comp-searchrow .comm-input{flex:1 1 auto;min-width:0;}
/* Štvorec vedľa poľa, nie zlaté CTA: zlatá je vyhradená hlavnej akcii obrazovky a tou je
   ĎALEJ dole. Toto je pomocné potvrdenie jedného poľa. */
.comm-comp-addbtn{flex:0 0 auto;width:44px;border-radius:8px;background:rgba(201,154,63,0.14);border:1px solid ${n.onDarkBorder};color:${n.onDark};font-family:${k};font-size:20px;line-height:1;cursor:pointer;padding:0;}
.comm-comp-addbtn:disabled{opacity:.38;cursor:default;}
.comm-comp-addbtn:not(:disabled):hover{border-color:${D};}
.comm-comp-sug{position:absolute;top:calc(100% + 6px);left:0;right:0;background:rgba(6,5,3,0.96);border:1px solid ${n.onDarkBorder};border-radius:12px;overflow:hidden;box-shadow:${S.panel};z-index:30;max-height:210px;overflow-y:auto;}
.comm-comp-sugitem{display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid ${n.onDarkHair};}
.comm-comp-sugitem:last-child{border-bottom:0;}
.comm-comp-sugitem:hover{background:rgba(201,154,63,0.14);}
.comm-comp-sugitem-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${k};font-weight:600;font-size:12px;color:${F};}
.comm-comp-sugitem-tx{font-size:12px;color:${n.onDark};}
.comm-comp-sugitem-tx span{color:${n.onDarkDim};font-size:10px;}

/* ⚠️ .comm-modechoice / .comm-mode* ZMAZANÉ 2026-09-01 — voľba „Plánujem / Prešiel som" sa
   presťahovala do ADD toku (dlaždice TRIP / EVENT / QUICK NOTE na /pack/add/trip) a tieto
   triedy odvtedy nekreslil nikto (overené grepom cez všetky className v src). Tmavý recept
   bez povrchu je horší než žiadny: pri prezliekaní by ho niekto skopíroval na nový blok.

/* ── TRIPSTATS V3 (issues #46 / #47 / #50) ──────────────────────────────────────────────────
   Tri zmeny naraz, lebo bývajú v jednom paneli:
    · #46 level a progressbar do ďalšieho levelu priamo v hlavičke + ⓘ cenník bodov,
    · #47 vysvedčenie BEZ percent krajiny — hero krajiny, počty tripov a km, odznak za počet,
    · #50 magistrála je odkaz na svoj detail, nie rozbaľovacia položka.
   POZOR: toto je template literál — v komentároch ŽIADNE spätné apostrofy. */

/* level + progressbar (#46) — od 2026-08-06 NA PAPYRUSE, takže všetky farby sú inkoustové.
   Pruh berie percentá z levelProgress(), nie z počtu tripov. */
.comm-lvlwrap{flex-basis:100%;display:flex;flex-direction:column;gap:7px;}
/* koľajnica pruhu = tmavý inkoust s nízkou alfou. Svetlá koľajnica (rgba papyrus) by na
   papyrusovom podklade zmizla a pruh by vyzeral, akoby začínal odnikiaľ. */
.comm-lvlbar{height:8px;border-radius:999px;background:rgba(42,22,8,0.14);overflow:hidden;}
/* ⚠️ PRUH NESIE FARBU PÁSMA, NIE ZLATÚ (Matej 1. 9. 2026: „treba prerobiť proggres bar na
   farbu aktuálneho levelu ako aj celý pils"). Premenné vešia tierVars na .comm-vhead;
   fallback drží pôvodnú zlatú, takže povrch bez premenných vyzerá presne ako predtým.
   Poradie b→a (tmavý → svetlý) je zhodné s pruhom v paneli levelu na mape. */
.comm-lvlbar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--tier-b,#F5C73D),var(--tier-a,#E69E1A));transition:width .45s;}
.comm-lvlfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;font-family:${k};font-weight:500;font-size:10px;color:${n.inkWarm};}
/* ⚠️ .comm-lvlinfo / .comm-lvlinfo-btn ZMAZANÉ 1. 9. 2026 — ⓘ tlačidlo v pravom hornom rohu
   zaniklo spolu s druhým popupom (Matej: „spojiť dva popupy na hlavičke do jedného ako na
   mape"). Cenník žije v popupe pilulky levelu. */
/* CENNÍK = papyrusový panel, DVA STĹPCE (Matej 2026-08-06: „na lavej strane daj všeobecné za čo
   všetko sú boody a na pravo celkovo za čo má biody ten človek + TOTAL"). Predtým to bol jeden
   úzky stĺpec, kde sa cenník a vlastné body oddeľovali linajkami — dva zoznamy pod sebou vyzerali
   ako jeden dlhý. Šírka je preto väčšia než pri jednom stĺpci; na mobile padá pod seba. */
/* ⚠️ .comm-pts (vlastný obal cenníka) ZMAZANÉ 1. 9. 2026 — cenník sa presťahoval dovnútra
   .comm-tiers, teda do popupu pilulky. Zostávajú len jeho VNÚTORNÉ pravidlá (.comm-pts-*),
   ktoré ten popup používa. */
.comm-pts-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
/* zvislý predel medzi stĺpcami = zlatý, nie šedý hairline (lock bledého bloku). */
.comm-pts-col + .comm-pts-col{padding-left:16px;border-left:1.5px solid ${T.border};}
@media (max-width:560px){
  .comm-pts-cols{grid-template-columns:1fr;gap:12px;}
  .comm-pts-col + .comm-pts-col{padding-left:0;border-left:0;padding-top:12px;border-top:1.5px solid ${T.border};}
}
.comm-pts-eyebrow{display:block;font-family:${k};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${n.cardEdge};margin-bottom:9px;}
.comm-pts-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${k};font-weight:500;font-size:10px;color:${n.inkWarm};padding:4px 0;}
.comm-pts-row b{font-weight:600;color:${n.inkStrong};white-space:nowrap;font-variant-numeric:tabular-nums;}
.comm-pts-rule{display:block;height:2px;margin:10px 0;background:${n.rule};}
.comm-pts-tot{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${P};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.02em;color:${n.inkStrong};}
/* prázdny pravý stĺpec — nový člen nemá ani bod, a prázdna polovica bez vysvetlenia vyzerá
   ako chyba renderu. */
.comm-pts-none{font-family:${k};font-weight:500;font-size:10px;font-style:italic;line-height:1.5;color:${n.inkWarm};}
/* jednoveté vysvetlenie pod nadpisom sekcie (ranky krajiny) — menšie a kurzívou, aby sa
   nečítalo ako ďalšia položka zoznamu s chýbajúcim číslom vpravo. */
.comm-pts-note{display:block;font-family:${k};font-weight:500;font-size:10px;font-style:italic;line-height:1.45;color:${n.inkWarm};margin:-4px 0 7px;}

/* countries — VŠETKY štáty s vlajkou, aj tie bez výletu (#46) */
.comm-ctrys{display:flex;gap:8px;overflow-x:auto;padding:4px 0 8px;margin-bottom:14px;-webkit-overflow-scrolling:touch;}
/* VYBRANÁ KRAJINA = PRIESVITNÝ LAPISOVÝ TINT (lock 2026-08-26) — je to moja voľba, čo
   chcem vo vysvedčení vidieť, nie konštrukcia. Plná plocha ostáva hlavnému CTA. */
.comm-ctry{flex-shrink:0;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 8px;border-radius:999px;border:1px solid ${s.border};background:${s.soft};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-ctry:hover{border-color:${n.cardEdge};background:${n.card};}
.comm-ctry.on{${se(O.edge,G.lapis,.14)}}
.comm-ctry--empty{opacity:.55;}
/* ⚠️ VYBRANÁ KRAJINA JE VŽDY PLNE VIDITEĽNÁ, aj keď v nej človek ešte nebol. Stlmenie
   hovorí „sem si zatiaľ nešiel"; keď na taký chip klikne, je to jeho voľba a musí byť
   vidieť rovnako ako pri prejdenej krajine — inak vyzerá výber ako nedotiahnutý. */
.comm-ctry--empty.on{opacity:1;}
.comm-ctry img{width:22px;height:15px;border-radius:8px;object-fit:cover;flex-shrink:0;}
.comm-ctry b{font-family:${k};font-weight:600;font-size:12px;color:${s.ink};white-space:nowrap;}
.comm-ctry.on b{color:${G.lapis};}
.comm-ctry span{font-family:${k};font-weight:500;font-size:10px;color:${s.dim};white-space:nowrap;}

/* hero krajiny + dropdown (#47) — zaoblený obrázok ako v tripovom článku */
/* ⚠️ ŽIADNY overflow:hidden (odstránený 2026-08-06). Mal ho kvôli zaobleniu fotky, ale
   OREZÁVAL AJ popup ranku, ktorý sa otvára nahor — zmizla mu celá hlavička a vyzeralo to,
   akoby sa nadpis nevykreslil. Fotka je background, ten border-radius rešpektuje sám;
   stačilo dorobiť radius prekryvu ::before, ktorý by inak trčal rohmi. Viď
   feedback_overflow_hidden_clips_dropdowns. */
/* ⚠️ HERO KRAJINY OSTÁVA TMAVÝ — a je to zámer, nie nedorobok. Je to FOTKA z prejdeného
   výletu cez celý blok; biely text a tmavý spád naň patria, papyrusová výplň by fotku
   prekryla. Prezliekol sa len RÁM (zlatý namiesto svetlého) a radius, aby blok sedel do
   mriežky ostatných. */
.comm-chero{position:relative;border-radius:14px;border:1.5px solid ${n.cardEdge};background:#2A2013;background-size:cover;background-position:center;min-height:172px;display:flex;align-items:flex-end;padding:16px;margin-bottom:16px;box-shadow:${S.lift};}
.comm-chero::before{content:'';position:absolute;inset:0;border-radius:12px;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.78) 100%);}
/* krajina bez vlastnej fotky: vlajka NEsmie ísť cez background cover — roztiahnutá rakúska
   alebo švajčiarska vlajka je len biela plocha. Bez fotky niet čo prekrývať, takže tu už
   tmavý blok nemá dôvod byť a hero ide do papyrusu — inak by v bledom vysvedčení stála
   čierna diera práve pri krajine, kde človek ešte nebol.
   ⚠️ S výplňou sa musí prevrátiť aj INKOUST (text bol robený na fotku): nadpis, podnadpis,
   cieľ a koľajnica pruhu nižšie. Prevrátiť povrch a nechať štítky svetlé = neviditeľný blok.
   → [[feedback_prevratena_doska_prevrati_aj_stitky]] */
.comm-chero--noimg{background-image:none;background:${n.panelGrad};}
.comm-chero--noimg::before{background:none;}
.comm-chero--noimg .comm-chero-name{color:${s.ink};text-shadow:none;}
.comm-chero--noimg .comm-chero-sub{color:${s.dim};}
.comm-chero--noimg .comm-chero-goaltxt{color:${s.deep};}
.comm-chero--noimg .comm-chero-bar{background:rgba(42,22,8,0.14);}
.comm-chero--noimg .comm-chero-flag{border-color:${s.border};box-shadow:${S.lift};}
.comm-chero--noimg .comm-rankinfo-btn{border-color:${s.border};background:${s.soft};color:${s.ink};}
.comm-chero--noimg .comm-chero-sel select{background:${s.field};border-color:${s.border};color:${s.ink};}
.comm-chero-flag{display:block;width:54px;height:36px;object-fit:cover;border-radius:8px;border:1px solid ${n.onDarkBorder};box-shadow:${S.panel};margin-bottom:11px;}
.comm-chero-sel{position:absolute;top:12px;right:12px;z-index:2;}
.comm-chero-sel select{appearance:none;-webkit-appearance:none;background:rgba(3,2,1,0.55);border:1px solid ${n.border};border-radius:999px;color:${n.card};font-family:${k};font-weight:600;font-size:10px;padding:8px 24px 8px 12px;cursor:pointer;}
.comm-chero-sel::after{content:'';position:absolute;right:12px;top:50%;width:6px;height:6px;border-right:1.5px solid ${D};border-bottom:1.5px solid ${D};transform:translateY(-70%) rotate(45deg);pointer-events:none;}
.comm-chero-in{position:relative;z-index:1;width:100%;}
.comm-chero-name{font-family:${P};font-weight:700;font-size:24px;line-height:1;letter-spacing:0.02em;text-transform:uppercase;color:${n.card};text-shadow:0 2px 14px rgba(0,0,0,0.7);}
.comm-chero-sub{font-family:${k};font-weight:500;font-size:12px;color:rgba(245,240,228,0.85);margin-top:7px;}
.comm-chero-goal{position:relative;margin-top:11px;max-width:340px;}
.comm-chero-goaltxt{display:flex;align-items:center;gap:8px;font-family:${k};font-weight:500;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:rgba(245,240,228,0.8);margin-bottom:5px;}
/* ⓘ pri titule krajiny — na FOTKE, takže svetlý obrys a tmavé sklo, nie inkoust ako v profile. */
/* Popup sa kotví na CELÝ cieľ (.comm-chero-goal), nie na ⓘ: na mobile sa text cieľa zalomí
   a ⓘ ostane pri pravom okraji, takže left:0 od tlačidla posunul 290 px popup mimo obrazovky
   (Danka #42, 400 px Android, 13. 10. 2026). */
.comm-rankinfo{position:static;display:inline-flex;flex-shrink:0;}
.comm-rankinfo-btn{width:19px;height:19px;border-radius:50%;border:1px solid ${n.onDarkDim};background:rgba(3,2,1,0.45);color:${n.card};font-family:${k};font-weight:600;font-size:10px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s;}
.comm-rankinfo-btn:hover,.comm-rankinfo-btn.on{background:${D};border-color:${D};color:#241a06;}
/* Otvára sa NAHOR (bottom:100%): titul sedí na spodku hera, smerom dole by popup prekryl
   kategórie pod ním a na nižšom okne by pretiekol pod okraj viewportu — presne tá chyba,
   ktorú už raz spravil cenník bodov. Nahor má nad sebou celú fotku hera. */
.comm-ranks{position:absolute;bottom:calc(100% + 9px);left:0;z-index:30;width:min(290px,78vw);text-align:left;cursor:default;text-transform:none;letter-spacing:normal;background:${n.panelGrad};border:1.5px solid ${n.cardEdge};border-radius:14px;box-shadow:${n.panelShadow};padding:12px 16px;}
.comm-rankrow b{font-variant-numeric:tabular-nums;}
/* dosiahnutý rank = zelená (rovnaká ako odškrtnutá jednotka), nasledujúci = zlatý a zvýraznený;
   ostatné ostávajú tlmené, aby bolo na prvý pohľad vidieť, kde človek stojí. */
.comm-rankrow.done{color:${n.inkStrong};}
.comm-rankrow.done b{color:${Pa};}
.comm-rankrow.next{color:${n.inkStrong};font-weight:600;}
.comm-rankrow.next b{color:${n.cardEdge};}
.comm-chero-bar{height:6px;border-radius:999px;background:${n.onDarkBorder};overflow:hidden;}
.comm-chero-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);}
@media (max-width:560px){ .comm-chero{min-height:150px;padding:12px;} .comm-chero-name{font-size:20px;} }

/* magistrály = odkazy na detail, žiadny dropdown (#50) */
.comm-jrows{display:flex;flex-direction:column;gap:7px;margin-top:12px;}
/* položka = RIADOK (úroveň 3 matrice) */
.comm-jrow{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:12px 12px;border-radius:8px;border:1px solid ${n.border};background:${n.tileBg};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-jrow:hover{border-color:${n.cardEdge};background:${n.card};}
.comm-jrow-name{font-family:${P};font-weight:700;font-size:12px;color:${s.ink};}
.comm-jrow.on .comm-jrow-name{color:${s.deep};}
.comm-jrow-meta{font-family:${k};font-weight:500;font-size:10px;color:${s.dim};white-space:nowrap;flex-shrink:0;}
.comm-jrow.on .comm-jrow-meta{color:${Fe};}

/* zoznam prejdených = viditeľný ovládač, nie holý klikací nadpis (#46) */
.comm-drop{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:20px 0 12px;padding:12px 16px;border-radius:12px;border:1px solid ${n.cardEdge};background:${n.panelGrad};box-shadow:${S.lift};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-drop:hover{border-color:${s.deep};background:${n.card};}
.comm-drop-t{font-family:${k};font-weight:600;font-size:12px;letter-spacing:0.02em;color:${s.deep};}
.comm-drop-n{display:flex;align-items:center;gap:8px;font-family:${k};font-weight:500;font-size:10px;color:${s.dim};}
.comm-drop-chev{display:inline-block;width:7px;height:7px;border-right:1.5px solid ${s.dim};border-bottom:1.5px solid ${s.dim};transform:translateY(-2px) rotate(45deg);transition:transform .2s;}
.comm-drop.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}

`;function Ra({title:o,sub:t,onClose:i,wide:l,children:r}){return h.useEffect(()=>{const c=m=>{m.key==="Escape"&&i()};return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[i]),e.jsx("div",{className:"pk-veil pk-veil--modal comm-overlay",onClick:i,children:e.jsxs("div",{className:`comm-modal${l?" wide":""}`,onClick:c=>c.stopPropagation(),children:[e.jsx("div",{className:"comm-modal-head",children:e.jsxs("div",{children:[e.jsx("div",{className:"comm-modal-title",children:o}),t&&e.jsx("div",{className:"comm-modal-sub",children:t})]})}),r]})})}function Ma({trailName:o,reward:t,ratingPoints:i}){var r;const l=M();return e.jsxs("div",{className:"comm-reward",children:[e.jsx("span",{className:"comm-reward-eyebrow",children:l("pack.community.rewardEyebrow")}),e.jsxs("div",{className:"comm-reward-row",children:[e.jsx(ue,{value:t.base,tone:"lapis",size:"md"}),e.jsx("span",{className:"comm-reward-txt",children:o})]}),(((r=t.baseRows)==null?void 0:r.length)??0)>1&&e.jsx("div",{className:"comm-reward-break",children:t.baseRows.map(c=>e.jsxs("div",{className:"comm-reward-breakrow",children:[e.jsx("span",{children:l(c.labelKey,c.labelParams)}),e.jsx("b",{children:c.points})]},c.labelKey))}),t.bonuses.map(c=>e.jsxs("div",{className:"comm-reward-row comm-reward-row--bonus",children:[e.jsx(ue,{value:c.points,tone:"bonus",size:"md",animate:!0}),e.jsxs("span",{className:"comm-reward-txt",children:[e.jsx("span",{className:"comm-reward-unit",children:c.unit}),e.jsx("span",{className:"comm-reward-kind",children:l(c.labelKey)})]})]},`${c.labelKey}:${c.unit}`)),!!i&&e.jsxs(e.Fragment,{children:[e.jsx("hr",{className:"comm-reward-rule"}),e.jsxs("div",{className:"comm-reward-next",children:[e.jsx(ue,{value:i,tone:"bonus",size:"md"}),e.jsx("span",{className:"comm-reward-nexttxt",children:l("pack.community.rewardNextRating")})]})]})]})}function bt({trailName:o,initial:t,onSubmit:i,onClose:l,rewardPoints:r,reward:c,routeTrip:m=!0}){const u=M(),[p,y]=h.useState((t==null?void 0:t.rating)??0),[b,g]=h.useState((t==null?void 0:t.difficulty)??""),[f,w]=h.useState((t==null?void 0:t.crowd)??""),[j,d]=h.useState((t==null?void 0:t.comment)??""),[x,I]=h.useState((t==null?void 0:t.when)??""),[C,Z]=h.useState((t==null?void 0:t.hazards)??[]),oe=$=>Z(_=>_.includes($)?_.filter(ae=>ae!==$):[..._,$]),U=p>0&&(!m||b!==""&&f!=="");return e.jsxs(Ra,{title:o,onClose:l,wide:!0,children:[e.jsx("style",{children:va}),e.jsxs("div",{className:"comm-field",style:{textAlign:"center"},children:[e.jsx("label",{className:"comm-label",children:u("pack.community.walkedRatingLabel")}),r&&!c?e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:11},children:e.jsx(ue,{value:r,tone:"base",size:"lg"})}):null,e.jsx("div",{style:{display:"flex",justifyContent:"center"},children:e.jsx(fa,{value:p,onChange:y,size:40})})]}),c&&e.jsx(Ma,{trailName:o,reward:c,ratingPoints:r}),e.jsxs("div",{className:"comm-walked-grid",children:[m&&e.jsxs("div",{className:"comm-field",children:[e.jsx("label",{className:"comm-label",children:u("pack.community.difficultyLabel")}),e.jsx("div",{className:"comm-seg",children:wo.map($=>e.jsxs("button",{type:"button",className:b===$?"on":"",onClick:()=>g($),children:[e.jsx(Ge,{diff:$})," ",ve(u,$)]},$))})]}),e.jsxs("div",{className:"comm-field",children:[e.jsxs("label",{className:"comm-label",children:[u("pack.community.crowdLabel"),m?"":` ${u("pack.community.optional")}`]}),e.jsx("div",{className:"comm-seg",children:$o.map($=>e.jsxs("button",{type:"button",className:f===$?"on":"",onClick:()=>w($),children:[Ze[$]," ",ye(u,$)]},$))})]}),e.jsxs("div",{className:"comm-field",children:[e.jsx("label",{className:"comm-label",children:u("pack.community.hazardsLabel")}),e.jsx("div",{className:"comm-chips",children:zo.map($=>e.jsxs("button",{type:"button",className:`comm-chip${C.includes($)?" on":""}`,onClick:()=>oe($),children:[Ye[$]," ",u(`pack.community.hazard.${$}`)]},$))})]}),e.jsxs("div",{className:"comm-field",children:[e.jsx("label",{className:"comm-label",children:u("pack.community.whenLabel")}),e.jsx("input",{type:"month",className:"comm-input",value:x,onChange:$=>I($.target.value)})]}),e.jsxs("div",{className:"comm-field",style:{gridColumn:"1 / -1"},children:[e.jsx("label",{className:"comm-label",children:u("pack.community.commentLabel")}),e.jsx("textarea",{className:"comm-textarea",value:j,onChange:$=>d($.target.value),placeholder:u("pack.community.commentPlaceholder")}),e.jsx("p",{className:"comm-hint",children:u("pack.community.commentPublic")})]})]}),e.jsx("button",{type:"button",className:"comm-submit",disabled:!U,onClick:()=>U&&i({rating:p,difficulty:m&&b?b:void 0,crowd:f||void 0,comment:j,when:x,hazards:C}),children:u(t?"pack.community.updateVoteBtn":"pack.community.logWalkBtn")}),r?e.jsx("button",{type:"button",className:"comm-ghostbtn",onClick:l,children:u("pack.community.notNowBtn")}):null]})}const ve=(o,t)=>t?o(`pack.map.diff.${t}`):"",ye=(o,t)=>t?o(`pack.map.crowdKind.${t}`):"";function La(o,t){return t.difficultyBreakdown.map(i=>`${i.pct}% ${ve(o,i.value)}`).join(" · ")}function _a(o,t){return t.crowdBreakdown.map(i=>`${i.pct}% ${ye(o,i.value)}`).join(" · ")}function ft({rating:o,count:t,compact:i,mini:l}){const{lang:r}=fe();return e.jsxs("span",{className:`comm-bigrating${i?" compact":""}${l?" mini":""}`,children:[e.jsx("b",{children:ee(o,r,1,1)}),e.jsx(vo,{stars:o,size:l?11:i?13:17,gap:l?1.5:i?2:3}),t!=null&&t>0&&e.jsxs("i",{children:["(",t,")"]})]})}function vt({agg:o,km:t,ascentM:i,hasRoute:l=!0}){const r=M(),{lang:c}=fe(),m=o.difficultyBreakdown.length>0,u=o.crowdBreakdown.length>0;return e.jsxs("div",{className:"comm-photometa",children:[l&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"comm-mpill",children:["↔ ",ee(t,c)," km",i!=null?` · ↑ ${ee(i,c,0)} m`:""]}),e.jsxs("span",{className:`comm-mpill${m?" comm-hastip":""}`,"data-tip":m?`${r("pack.map.difficulty")} — ${La(r,o)}`:void 0,children:[e.jsx(Ge,{diff:o.difficulty})," ",ve(r,o.difficulty)]})]}),o.crowd&&e.jsxs("span",{className:`comm-mpill${u?" comm-hastip":""}`,"data-tip":u?`${r("pack.map.crowd")} — ${_a(r,o)}`:void 0,children:[Ze[o.crowd]," ",ye(r,o.crowd)]})]})}function yt({agg:o}){const t=M();return o.hazardBreakdown.length===0?null:e.jsx(e.Fragment,{children:o.hazardBreakdown.map(i=>e.jsxs("span",{className:"comm-hazardtag",title:`${i.pct}% of members reported ${i.value}`,children:[Ye[i.value]," ",t(`pack.community.hazard.${i.value}`)," · ",i.pct,"%"]},i.value))})}function Ka({selected:o,onChange:t}){const i=M(),[l,r]=h.useState([]);if(h.useEffect(()=>{let p=!0;return fo().then(y=>{p&&r(y)}),()=>{p=!1}},[]),l.length===0)return null;const c=new Set(o.map(p=>p.key)),m=p=>{var y;return((y=p.name)==null?void 0:y.split(/\s+/)[0])||i("pack.companions.packHumanNoName")},u=p=>{const y=`${be}${p.userId}`;c.has(y)?t(o.filter(b=>b.key!==y)):t([...o,{key:y,name:m(p),sub:p.dogNames.join(", "),photo:p.avatarUrl}])};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-comp-grouplabel",children:i("pack.companions.packHumans")}),e.jsx("div",{className:"comm-comp-pack",children:l.map(p=>{const y=c.has(`${be}${p.userId}`),b=m(p);return e.jsxs("button",{type:"button",className:`comm-comp-dog comm-comp-human${y?" on":""}`,onClick:()=>u(p),children:[e.jsx("span",{className:`comm-comp-dog-av${p.avatarUrl?"":" ph"}`,style:p.avatarUrl?{backgroundImage:`url('${B(p.avatarUrl,96)}')`}:void 0,children:p.avatarUrl?"":b.charAt(0).toUpperCase()}),e.jsx("span",{children:b}),!y&&e.jsx("span",{className:"plus",children:"+"})]},p.userId)})})]})}function jt({myDogs:o,selected:t,onChange:i,onOpenProfile:l}){const r=M(),[c,m]=h.useState(""),[u,p]=h.useState(()=>t.some(d=>d.key.startsWith("member-"))),y=new Set(t.map(d=>d.key)),b=d=>{y.has(d.key)||i([...t,d])},g=d=>i(t.filter(x=>x.key!==d)),f=d=>{const x=`dog-${d.id}`;y.has(x)?g(x):b({key:x,name:d.name||"My dog",sub:"your pack",photo:d.photo})},w=()=>{const d=c.trim();!d||y.has(`member-${d}`)||(b({key:`member-${d}`,name:d}),m(""))},j=t.filter(d=>!d.key.startsWith("dog-")&&!d.key.startsWith(be));return e.jsxs("div",{children:[j.length>0&&e.jsx("div",{className:"comm-comp-selected",children:j.map(d=>e.jsxs("span",{className:"comm-comp-chip",children:[e.jsx("span",{className:`comm-comp-chip-av${d.photo?"":" ph"}`,style:d.photo?{backgroundImage:`url('${B(d.photo,96)}')`}:void 0,children:d.photo?"":d.name.charAt(0).toUpperCase()}),e.jsx("b",{children:d.name}),e.jsx("button",{type:"button",onClick:()=>g(d.key),"aria-label":r("pack.companions.remove",{name:d.name}),children:"×"})]},d.key))}),o.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-comp-grouplabel",children:r("pack.companions.yourPack")}),e.jsx("div",{className:"comm-comp-pack",children:o.map(d=>{const x=y.has(`dog-${d.id}`);return e.jsxs("button",{type:"button",className:`comm-comp-dog${x?" on":""}`,onClick:()=>f(d),children:[e.jsx("span",{className:`comm-comp-dog-av${d.photo?"":" ph"}`,style:d.photo?{backgroundImage:`url('${B(d.photo,96)}')`}:void 0,children:d.photo?"":(d.name||"D").charAt(0).toUpperCase()}),e.jsx("span",{children:d.name||r("pack.companions.myDog")}),!x&&e.jsx("span",{className:"plus",children:"+"})]},d.id)})})]}),e.jsx(Ka,{selected:t,onChange:i}),!u&&e.jsxs("button",{type:"button",className:"comm-comp-openothers",onClick:()=>p(!0),children:[e.jsx("span",{className:"comm-comp-openplus",children:"+"}),e.jsx("span",{children:r("pack.companions.addOthers")})]}),u&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-comp-grouplabel",children:r("pack.companions.addOthers")}),e.jsx("div",{className:"comm-comp-searchwrap",children:e.jsxs("div",{className:"comm-comp-searchrow",children:[e.jsx("input",{className:"comm-input",value:c,onChange:d=>m(d.target.value),onKeyDown:d=>{d.key==="Enter"&&(d.preventDefault(),w())},placeholder:r("pack.companions.typeName")}),e.jsx("button",{type:"button",className:"comm-comp-addbtn",onClick:w,disabled:!c.trim(),"aria-label":r("pack.companions.addTyped"),title:r("pack.companions.addTyped"),children:"+"})]})})]})]})}const Ba=Object.fromEntries(Xo.map(o=>[o.name,o.id])),Ua=["sk","cz","pl","at","hu","si","de","ch","it","fr"],q=[{trips:5,title:"visitor"},{trips:10,title:"regular"},{trips:20,title:"specialist"},{trips:40,title:"native"}];function Va(o,t){const i=q.filter(c=>o>=c.trips).length,l=q[i],r=i>0?q[i-1].trips:0;return{earned:i>0?`${t} ${q[i-1].title}`:null,next:l?`${t} ${l.title}`:null,nextAt:(l==null?void 0:l.trips)??null,pct:l?Math.min(100,Math.max(0,(o-r)/(l.trips-r)*100)):100}}function Ha(o){const t=[A.range,A.np,A.chko,A.water],i=[[o("pack.stats.legend.addTrail"),`+${A.add}`],[o("pack.stats.legend.addPlace"),`+${A.place}`],[o("pack.stats.legend.walkTrail"),`+${A.walk}`],[o("pack.stats.legend.mapNote"),`+${A.note}`],[o("pack.stats.legend.eventHeld"),`+${A.event}`],[o("pack.stats.legend.wishDone"),`+${A.wish}`],[o("pack.stats.legend.visitPlace"),`+${A.visit}`],[o("pack.stats.legend.perKm"),`+${Vo}`],[o("pack.stats.legend.per100m"),`+${Ho}`]];return t.every(l=>l===t[0])?i.push([o("pack.stats.legend.newGeoAny"),`+${t[0]}`]):i.push([o("pack.stats.legend.newRange"),`+${A.range}`],[o("pack.stats.legend.newPark"),`+${A.np}`],[o("pack.stats.legend.newProtected"),`+${A.chko}`],[o("pack.stats.legend.newWater"),`+${A.water}`]),i.push([o("pack.stats.legend.newCountry"),`+${A.country}`],[o("pack.stats.legend.rateWalked"),`+${A.rate}`],[o("pack.stats.legend.collection"),`+${A.collection}`],[o("pack.stats.legend.longDistance"),o("pack.stats.legend.fixedPrice")]),i}const pe=(o,t,i)=>{const l=jo(o)?`${ee(o.km,i)} km`:"";return[t?o.region:"",l].filter(Boolean).join(" · ")},xe=(o,t)=>{const i=`pack.stats.geo.${t.key}`,l=o(i);return l===i?t.label:l};function wt({walkedTrails:o,walkedKm:t,onOpenTrip:i,onAddTrip:l}){var Oe,Se,Te,De,Ie,Ce;const r=M(),{lang:c}=fe(),m=a=>ee(a,c),u=h.useMemo(()=>{const a=new Map;for(const v of o){const V=Qo(v),z=a.get(V);z?z.push(v):a.set(V,[v])}return a},[o]),p=h.useMemo(()=>[...new Set([...Ua,...u.keys()])].map(a=>{var v;return{iso:a,name:Re(a),trips:((v=u.get(a))==null?void 0:v.length)??0}}).sort((a,v)=>a.iso==="sk"?-1:v.iso==="sk"?1:v.trips-a.trips||a.name.localeCompare(v.name)),[u]),y=h.useMemo(()=>p.filter(a=>a.trips>0),[p]),[b,g]=h.useState("sk"),f=u.get(b)??[],w=f.reduce((a,v)=>a+(Number(v.km)||0),0),j=Re(b),d=Va(f.length,j),x=(Oe=f.find(a=>{var v;return(v=a.photos)==null?void 0:v[0]}))==null?void 0:Oe.photos[0],I=h.useMemo(()=>No(u.get("sk")??[]),[u]),C=Eo(o),oe=(((Se=I.categories.find(a=>a.key==="peaks"))==null?void 0:Se.done)??[])[0]??"—",[U,$]=h.useState(null),[_,ae]=h.useState(!1),[he,Je]=h.useState(!1),[te,je]=h.useState(!1);h.useEffect(()=>{if(!te)return;const a=()=>je(!1),v=window.setTimeout(()=>document.addEventListener("click",a),0);return()=>{window.clearTimeout(v),document.removeEventListener("click",a)}},[te]);const[Y,ke]=h.useState(!1);h.useEffect(()=>{if(!Y)return;const a=()=>ke(!1),v=window.setTimeout(()=>document.addEventListener("click",a),0);return()=>{window.clearTimeout(v),document.removeEventListener("click",a)}},[Y]);const ge=a=>{g(a),$(null),ae(!1),ke(!1)},we=Ro(),R=we?Mo:Co(),$e=((De=(Te=R.session)==null?void 0:Te.user)==null?void 0:De.user_metadata)??{},qe=$e.full_name||$e.name,ne=we?Lo.name:(Ce=(Ie=R.session)==null?void 0:Ie.user)!=null&&Ce.email?Ea(R.session.user.email,qe):R.avatarInitial,ze=R.dogs.map(a=>a.dog_name).filter(a=>!!a),Xe=ze.length>0?[ne,...ze].join(" & "):ne,Ne=_o(),{addedByMe:Ee,myRatings:Ae}=h.useMemo(()=>{var a,v;return{addedByMe:Oo(So(o,{ownerName:ne,isFounder:so((v=(a=R.session)==null?void 0:a.user)==null?void 0:v.email)})),myRatings:Ao(o,Po())}},[o,ne,R.session,Ne]),Qe=uo(),eo=ho(),oo=ko(),Pe=h.useMemo(()=>R.dogs.map(a=>({id:a.id,name:a.dog_name||r("pack.map.myDogFallback"),photo:a.cloudinary_main_url,...Ko(a.id)})).filter(a=>a.trips>0),[R.dogs,Ne,r]),re=To(o,{addedIds:Ee,ratings:Ae,countries:C,notePoints:Qe,eventsHeld:eo,wishesDone:oo}),L=Bo(re.total);return e.jsxs(e.Fragment,{children:[e.jsxs("section",{className:"tl-panel",children:[e.jsxs("div",{className:"comm-vhead",style:qo(L.level),children:[e.jsxs("div",{className:"comm-vhead-pack",children:[e.jsx("span",{className:"comm-vavatar comm-vavatar--owner",children:R.avatarUrl?e.jsx("img",{src:B(R.avatarUrl,160),alt:""}):R.avatarInitial}),R.dogs.map(a=>e.jsx("span",{className:"comm-vavatar comm-vavatar--dog",children:a.cloudinary_main_url?e.jsx("img",{src:B(a.cloudinary_main_url,160),alt:a.dog_name||""}):e.jsx("img",{className:"comm-vavatar-fallback",src:J("paw"),alt:""})},a.id))]}),e.jsxs("div",{className:"comm-vhead-id",children:[e.jsx("div",{className:"comm-vhead-name",children:Xe}),e.jsxs("span",{className:"comm-tierwrap",children:[e.jsxs("button",{type:"button",className:"comm-level-pill",style:Jo(L.level),onClick:a=>{a.stopPropagation(),je(v=>!v)},"aria-expanded":te,"aria-label":r("pack.stats.rankAria",{rank:r("pack.map.rankPilgrim"),level:L.level,tier:Wo(L.level).name}),children:[e.jsx("span",{className:"comm-level-ic",style:{"--ic":`url(${J("trophy")})`}}),r("pack.stats.rankLine",{rank:r("pack.map.rankPilgrim"),level:L.level})]}),te&&e.jsxs("span",{className:"comm-tiers",onClick:a=>a.stopPropagation(),children:[e.jsx("span",{className:"comm-pts-eyebrow",children:r("pack.stats.levelColours")}),e.jsx(ja,{level:L.level,onDark:!1}),e.jsx("span",{className:"comm-pts-rule"}),e.jsxs("span",{className:"comm-pts-cols",children:[e.jsxs("span",{className:"comm-pts-col",children:[e.jsx("span",{className:"comm-pts-eyebrow",children:r("pack.stats.howPointsWork")}),Ha(r).map(([a,v])=>e.jsxs("span",{className:"comm-pts-row",children:[a,e.jsx("b",{children:v})]},a))]}),e.jsxs("span",{className:"comm-pts-col",children:[e.jsx("span",{className:"comm-pts-eyebrow",children:r("pack.stats.yourPoints")}),re.rows.length>0?e.jsxs(e.Fragment,{children:[re.rows.map(a=>e.jsxs("span",{className:"comm-pts-row",children:[r(a.labelKey,a.labelParams),e.jsx("b",{children:a.points})]},a.labelKey)),e.jsx("span",{className:"comm-pts-rule"}),e.jsxs("span",{className:"comm-pts-tot",children:[r("pack.stats.total"),e.jsx("b",{children:re.total})]})]}):e.jsx("span",{className:"comm-pts-none",children:r("pack.stats.noPointsYet")})]})]})]})]}),y.length>0&&e.jsx("span",{className:"comm-vflags",children:y.map(a=>e.jsx("button",{type:"button",className:`comm-vflag pk-hit${a.iso===b?" on":""}`,onClick:()=>ge(a.iso),title:`${a.name} · ${r(`pack.triplist.myTripsCount${le(a.trips)}`,{n:a.trips})}`,"aria-label":`${a.name}, ${r(`pack.triplist.myTripsCount${le(a.trips)}`,{n:a.trips})}`,children:e.jsx(oa,{iso2:a.iso,label:a.name,size:22})},a.iso))})]}),e.jsxs("div",{className:"comm-lvlwrap",children:[e.jsx("div",{className:"comm-lvlbar",children:e.jsx("i",{style:{width:`${L.pct}%`}})}),e.jsxs("div",{className:"comm-lvlfoot",children:[e.jsx("span",{children:r("pack.stats.pts",{n:L.points})}),e.jsx("span",{children:r("pack.stats.ptsToLevel",{n:L.toNext,level:L.level+1})})]})]})]}),e.jsxs("div",{className:"comm-worldstats",children:[e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:C}),e.jsx("span",{children:r("pack.stats.countries")})]}),e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:o.length}),e.jsx("span",{children:r("pack.stats.trips")})]}),e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:m(t)}),e.jsx("span",{children:r("pack.stats.km")})]}),e.jsxs("div",{className:`comm-wstat${oe==="—"?"":" comm-wstat--name"}`,children:[e.jsx("b",{children:oe}),e.jsx("span",{children:r("pack.stats.highestPoint")})]}),e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:Ee.size}),e.jsx("span",{children:r("pack.stats.addedTrips")})]}),e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:Ae}),e.jsx("span",{children:r("pack.stats.ratingsGiven")})]})]}),Pe.length>0&&e.jsx("div",{className:"comm-dogstats",children:Pe.map(a=>e.jsxs("div",{className:"comm-dogstat",children:[e.jsx("img",{src:a.photo?B(a.photo,120):J("paw"),alt:""}),e.jsxs("span",{className:"comm-dogstat-txt",children:[e.jsx("span",{className:"comm-dogstat-name",children:a.name}),e.jsx("span",{className:"comm-dogstat-num",children:r("pack.stats.dogLine",{trips:a.trips,km:m(a.km)})})]})]},a.id))}),o.length===0&&e.jsxs("div",{className:"comm-emptybox",style:{paddingTop:8,paddingBottom:4},children:[e.jsx("p",{children:r("pack.stats.emptyWalked")}),e.jsx("button",{type:"button",className:"comm-emptybtn",onClick:()=>l(),children:r("pack.stats.logFirstTrip")})]}),e.jsx(wa,{walkedCount:o.length})]}),e.jsxs("section",{className:"tl-panel",style:{marginTop:14},children:[e.jsx("div",{className:"comm-ctrys",children:p.map(a=>e.jsxs("button",{type:"button",className:`comm-ctry${a.iso===b?" on":""}${a.trips===0?" comm-ctry--empty":""}`,onClick:()=>ge(a.iso),children:[e.jsx("img",{src:Me(a.iso),alt:"",loading:"lazy",draggable:!1}),e.jsx("b",{children:a.name}),e.jsx("span",{children:a.trips>0?`${a.trips} trip${a.trips===1?"":"s"}`:"not yet"})]},a.iso))}),e.jsxs("div",{className:`comm-chero${x?"":" comm-chero--noimg"}`,style:x?{backgroundImage:`url('${B(x,1200)}')`}:void 0,children:[e.jsx("div",{className:"comm-chero-sel",children:e.jsx("select",{value:b,onChange:a=>ge(a.target.value),"aria-label":r("pack.stats.countryAria"),children:p.map(a=>e.jsxs("option",{value:a.iso,children:[ea(a.iso)," ",a.name]},a.iso))})}),e.jsxs("div",{className:"comm-chero-in",children:[!x&&e.jsx("img",{className:"comm-chero-flag",src:Me(b,160),alt:"",loading:"lazy",draggable:!1}),e.jsx("div",{className:"comm-chero-name",children:j}),e.jsxs("div",{className:"comm-chero-sub",children:[r(`pack.triplist.myTripsCount${le(f.length)}`,{n:f.length})," · ",m(w)," km",b==="sk"?` · ${r("pack.stats.placesTicked",{done:I.doneUnits,total:I.totalUnits})}`:""]}),e.jsxs("div",{className:"comm-chero-goal",children:[e.jsxs("div",{className:"comm-chero-goaltxt",children:[e.jsxs("span",{children:[d.earned?`${d.earned} · `:"",d.next?`${f.length}/${d.nextAt} trips to ${d.next}`:"every tier taken"]}),e.jsxs("span",{className:"comm-rankinfo",children:[e.jsx("button",{type:"button",className:`comm-rankinfo-btn${Y?" on":""}`,onClick:a=>{a.stopPropagation(),ke(v=>!v)},"aria-expanded":Y,"aria-label":r("pack.stats.countryRanksAria"),children:"i"}),Y&&e.jsxs("span",{className:"comm-ranks",onClick:a=>a.stopPropagation(),children:[e.jsxs("span",{className:"comm-pts-eyebrow",children:[j," ranks"]}),e.jsx("span",{className:"comm-pts-note",children:r("pack.stats.countryRanksNote")}),q.map(a=>{const v=f.length>=a.trips,V=!v&&a.trips===d.nextAt;return e.jsxs("span",{className:`comm-pts-row comm-rankrow${v?" done":""}${V?" next":""}`,children:[a.title.charAt(0).toUpperCase()+a.title.slice(1),e.jsx("b",{children:v?`✓ ${a.trips}`:`${f.length}/${a.trips}`})]},a.title)})]})]})]}),e.jsx("div",{className:"comm-chero-bar",children:e.jsx("i",{style:{width:`${d.pct}%`}})})]})]})]}),b!=="sk"?f.length===0?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"comm-empty",children:["No trips in ",j," yet."]}),e.jsxs("div",{className:"comm-unit-addrow",onClick:()=>l(),children:["＋ Add the first trip in ",j]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"comm-worldstats",style:{gridTemplateColumns:"repeat(3,1fr)",marginBottom:16},children:[e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:f.filter(a=>{var v;return(v=a.acts)==null?void 0:v.includes("hike")}).length}),e.jsx("span",{children:r("pack.stats.hikes")})]}),e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:f.filter(a=>{var v;return!((v=a.acts)!=null&&v.includes("hike"))}).length}),e.jsx("span",{children:r("pack.stats.places")})]}),e.jsxs("div",{className:"comm-wstat",children:[e.jsx("b",{children:m(w)}),e.jsx("span",{children:"Km"})]})]}),e.jsxs("div",{className:"comm-dash-section-title",children:["Trips in ",j]}),f.map(a=>e.jsxs("div",{className:"comm-walkedrow",onClick:()=>i(a.id),children:[e.jsx("span",{className:"comm-walkedrow-name",children:a.name}),e.jsx("span",{className:"comm-walkedrow-meta",children:pe(a,!0,c)})]},a.id)),e.jsxs("div",{className:"comm-unit-addrow",style:{marginTop:12},onClick:()=>l(),children:["＋ Add a trip in ",j]})]}):e.jsxs(e.Fragment,{children:[I.categories.map(a=>{if(a.key==="journeys")return e.jsxs("div",{className:"comm-cat",children:[e.jsxs("button",{type:"button",className:`comm-cat-head comm-cat-head--btn${he?" on":""}`,onClick:()=>Je(z=>!z),"aria-expanded":he,children:[e.jsx("span",{className:"comm-cat-name",children:xe(r,a)}),e.jsxs("span",{className:"comm-cat-count",children:[a.done.length,"/",a.total]}),e.jsx("span",{className:"comm-drop-chev"})]}),he&&e.jsx("div",{className:"comm-jrows",children:de(a.key).map(z=>{const E=Ba[z],N=a.done.includes(z),H=E?Uo[E]:void 0;return e.jsxs("button",{type:"button",className:`comm-jrow${N?" on":""}`,disabled:!E,onClick:()=>{E&&i(E)},children:[e.jsx("span",{className:"comm-jrow-name",children:z}),e.jsxs("span",{className:"comm-jrow-meta",children:[N?"✓ walked":H?`+${H} pts`:""," ›"]})]},z)})})]},a.key);if(a.key==="ranges"){const z=(U==null?void 0:U.cat)===a.key?U.unit:null;return e.jsxs("div",{className:"comm-cat",children:[e.jsxs("div",{className:"comm-cat-head",children:[e.jsx("span",{className:"comm-cat-name",children:xe(r,a)}),e.jsxs("span",{className:"comm-cat-pct",children:[a.done.length,"/",a.total]})]}),e.jsx("div",{className:"comm-cat-bar",children:e.jsx("div",{className:"comm-cat-fill",style:{width:`${a.pct}%`}})}),e.jsx("div",{className:"comm-cat-units",children:de(a.key).map(E=>{const N=a.counts[E]??0,H=N>=Aa?" comm-unit--done":N>=1?" comm-unit--started":"";return e.jsxs("button",{type:"button",className:`comm-unit${H}`,onClick:()=>$(W=>W&&W.cat===a.key&&W.unit===E?null:{cat:a.key,unit:E}),children:[E,N>0?` ×${N}`:""]},E)})}),z&&(()=>{const E=f.filter(N=>(Do(N)[a.key]??[]).includes(z));return e.jsxs("div",{className:"comm-unit-drop",children:[E.length>0?E.map(N=>e.jsxs("div",{className:"comm-walkedrow",onClick:()=>i(N.id),style:{marginBottom:8},children:[e.jsx("span",{className:"comm-walkedrow-name",children:N.name}),e.jsx("span",{className:"comm-walkedrow-meta",children:pe(N,!1,c)&&`· ${pe(N,!1,c)}`})]},N.id)):e.jsx("div",{className:"comm-unit-empty",children:r("pack.stats.noTrailsHere")}),e.jsx("div",{className:"comm-unit-addrow",onClick:()=>l(z),children:"＋ Add a trip here"})]})})()]},a.key)}const v=a.key==="waters"?f.filter(yo).map(z=>z.name).filter((z,E,N)=>N.indexOf(z)===E&&!de("waters").includes(z)):[],V=[...de(a.key),...v];return e.jsxs("div",{className:"comm-cat",children:[e.jsxs("div",{className:"comm-cat-head",children:[e.jsx("span",{className:"comm-cat-name",children:xe(r,a)}),e.jsxs("span",{className:"comm-cat-count",children:[a.done.length+v.length,"/",a.total+v.length]})]}),e.jsx("div",{className:"comm-medals",children:V.map(z=>{const E=a.done.includes(z)||v.includes(z),N=a.key==="parks"?Ta[z]:a.key==="chko"?Ca[z]:void 0,H=(a.key==="chko"||Da.has(z))&&E,W=N?`comm-medal-ic comm-medal-ic--logo${H?" comm-medal-ic--disc":""}${Ia.has(z)?" comm-medal-ic--big":""}`:"";return e.jsxs("div",{className:`comm-medal ${E?"comm-medal--on":"comm-medal--off"}${a.key==="peaks"||a.key==="waters"?" comm-medal--lapis":""}`,children:[N?e.jsx("div",{className:W,children:e.jsx("img",{src:`${N}?v=3`,alt:z})}):e.jsx("div",{className:"comm-medal-ic",children:e.jsx("img",{src:J(a.icon),alt:""})}),e.jsx("span",{className:"comm-medal-name",children:z})]},z)})})]},a.key)}),f.length===0?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-dash-section-title",children:r("pack.stats.walkedTitle")}),e.jsx("div",{className:"comm-empty",children:r("pack.stats.walkedEmpty")})]}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",className:`comm-drop${_?" on":""}`,onClick:()=>ae(a=>!a),"aria-expanded":_,children:[e.jsx("span",{className:"comm-drop-t",children:r(_?"pack.stats.walkedHide":"pack.stats.walkedShow",{trips:r(`pack.triplist.myTripsCount${le(f.length)}`,{n:f.length})})}),e.jsxs("span",{className:"comm-drop-n",children:[m(w)," km ",e.jsx("i",{className:"comm-drop-chev"})]})]}),_&&f.map(a=>e.jsxs("div",{className:"comm-walkedrow",onClick:()=>i(a.id),children:[e.jsx("span",{className:"comm-walkedrow-name",children:a.name}),e.jsx("span",{className:"comm-walkedrow-meta",children:pe(a,!0,c)})]},a.id))]})]})]})]})}function de(o){var t;return((t=Io.find(i=>i.key===o))==null?void 0:t.units)??[]}function $t(o=0,t=!0){const[i,l]=h.useState([]),[r,c]=h.useState(!0),m=h.useCallback(async()=>{var g,f;if(!t){l([]),c(!1);return}const{data:u}=await Q.auth.getSession(),p=((f=(g=u.session)==null?void 0:g.user)==null?void 0:f.id)??null;if(!p){l([]),c(!1);return}const{data:y,error:b}=await Q.from("user_trips").select("trip_slug,user_id,trip_date,added_at").eq("openness","open").eq("status","looking").neq("user_id",p).order("added_at",{ascending:!1});if(b){console.warn("[open trips]",b.message),l([]),c(!1);return}l((y??[]).map(w=>({slug:w.trip_slug,organizerId:w.user_id,date:w.trip_date,addedAt:w.added_at}))),c(!1)},[t]);return h.useEffect(()=>{m()},[m,o]),{trips:i,loading:r}}function zt(o,t=0){const[i,l]=h.useState({});return h.useEffect(()=>{if(!o){l({});return}let r=!1;return(async()=>{var y,b;const{data:c}=await Q.auth.getSession();if(!((b=(y=c.session)==null?void 0:y.user)!=null&&b.id)){r||l({});return}const{data:m,error:u}=await Q.from("trip_events").select("host_id,travel").eq("trip_slug",o).eq("closed",!1);if(r)return;if(u){console.warn("[trip travel]",u.message),l({});return}const p={};for(const g of m??[])g.travel&&(p[g.host_id]=g.travel);l(p)})(),()=>{r=!0}},[o,t]),i}function Nt(o=!0){const[t,i]=h.useState([]),[l,r]=h.useState(o),c=h.useRef(!0),m=h.useCallback(async()=>{if(o)try{const w=!c.current;c.current=!1,i(await(w?ia():go()))}catch{i([])}finally{r(!1)}},[o]);h.useEffect(()=>{m()},[m]);const u=h.useCallback(async w=>{const j=await sa(w);return xo(),await m(),j},[m]),p=h.useCallback(async(w,j)=>{await la(w,j),await m()},[m]),y=h.useCallback(async(w,j)=>{await ca(w,j),await m()},[m]),b=h.useCallback(async w=>{await ma(w),await m()},[m]),g=h.useMemo(()=>bo(ra),[]);return{notes:h.useMemo(()=>[...g,...t],[g,t]),memberNotes:t,loading:l,reload:m,add:u,vote:p,like:y,remove:b}}export{ft as B,xt as C,yt as H,kt as P,wt as T,bt as W,$t as a,Na as b,va as c,ht as d,ue as e,vt as f,fa as g,zt as h,gt as i,jt as j,Ka as k,ja as l,za as p,Nt as u};
