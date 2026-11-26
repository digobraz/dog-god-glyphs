import{a0 as x,b as te,aF as G,ay as Je,j as e,r as $,u as ce,L as z,aV as Ea,ah as Ha,a6 as Za,aO as Ga,s as K,m as I,c as Ne,v as f,a1 as H,f as Fe,aM as Ee,w as Ya,y as Ye,x as Oe,au as Ja,a3 as qa,aS as Xa,av as Qa,Q as Aa,ac as ka,an as eo}from"./index-DriUOdZL.js";import{sizedUrl as Ke}from"./cloudinaryService-CiRx-3N_.js";import{u as ao}from"./useMyNotePoints-Chah-NZ0.js";import{u as oo}from"./eventStore-C_Qma-Tw.js";import{u as to}from"./wishData-CwmEFTp-.js";import{u as ro}from"./placePosts-DGv_qzMm.js";import{HUMAN_KEY_PREFIX as da,fetchPackHumans as no}from"./packHumans-Nd8PJNRe.js";import{aE as Qe,aF as io,o as Sa,aG as so,aH as Pa,aI as ba,aJ as fa,a3 as He,p as lo,aK as po,aL as co,a9 as va,a6 as Oa,a7 as Ta,aB as mo,aM as ho}from"./MomentHost-D9oSu3w3.js";import{S as uo,n as xo,o as go,N as ko,C as Ca,H as Da,D as bo,q as fo,t as vo,m as yo,w as wo,v as $o,r as jo,x as zo,y as No,z as Eo}from"./packCommunity-Z_xRCT1t.js";import{u as Ao}from"./PackLayout-B9RT_jMa.js";import{useMagnetPreview as So,MAGNET_IDENTITY as Po,MAGNET_FOUNDER as Oo}from"./magnetPreview-DJ5RPtvA.js";import{u as To}from"./usePackStoreEpoch-D0E1hOXu.js";import{d as Co}from"./dogTripStats-DKPPrN4P.js";import{P as Do}from"./PawRating-BO--APqi.js";import{l as Mo,P as q,b as Lo,d as Io}from"./tripPoints-C3j2SdgA.js";import{c as Ma,d as La,b as Ia,e as Ra,t as _a,f as Ba}from"./packTiers-D4RAcaEl.js";import"./client-_yx8AKEw.js";import{HERO_JOURNEYS as Ro}from"./data-journeys-3PcCvYo8.js";import{t as we,a as na}from"./countryGeo-BNEVCU3g.js";import{P as ma}from"./sosNoPhoto-igLPGupO.js";import{b as _o,P as Bo}from"./rankBadge-DrDXhP70.js";import{R as Ko}from"./addTripModel-DwkYC9MX.js";import{f as ea}from"./flagUrl-B21iQI9I.js";import"./packProfile-3D_4hu2R.js";import"./memberProfile-CThIDywb.js";import"./dogRights-CDnPOjZG.js";const ya=te.card,Fo=`
.pts-pill{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:${x};font-weight:600;line-height:1;letter-spacing:0.02em;
  border-radius:999px;white-space:nowrap;font-variant-numeric:tabular-nums;
}
/* ZÁKLAD — béžová. border v tej istej farbe, nie priehľadný okraj: pilulka leží aj na
   zlatom podklade (chip .on), kde by tmavý rám urobil dieru. */
.pts-pill--base{
  background:${ya};color:${te.inkStrong};
  border:1px solid rgba(42,22,8,0.14);
  box-shadow:${G.lift};
}
/* BONUS — zlatá. Rovnaký gradient ako .btn-gold / level pilulka, žiadny nový. */
.pts-pill--bonus{
  background:${Je.grad};color:#241a06;
  border:1px solid ${Je.edge};
  box-shadow:${G.lift};
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
  background:linear-gradient(135deg,#3A7BC8,#1E5AA8);color:${ya};
  border:1px solid ${te.onDarkDim};
  box-shadow:${G.lift};
}
.pts-pill--sm{font-size:10px;padding:4px 8px;}
.pts-pill--md{font-size:12px;padding:4px 12px;}
.pts-pill--lg{font-size:16px;padding:8px 16px;}
/* Prílet bonusu — odmena sa má „objaviť", nie tam len ticho byť (zadanie §3b: animácia patrí
   BONUSU, nie základu — základ si vedel dopredu). prefers-reduced-motion ju vypína. */
@keyframes pts-pop{0%{transform:scale(.72);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
.pts-pill--pop{animation:pts-pop .34s cubic-bezier(.34,1.56,.64,1) both;}
@media (prefers-reduced-motion:reduce){ .pts-pill--pop{animation:none;} }
`;function Uo(a,r,l=620){const[u,d]=$.useState(r?0:a),k=$.useRef();return $.useEffect(()=>{var n;if(!r){d(a);return}if(typeof window<"u"&&((n=window.matchMedia)==null?void 0:n.call(window,"(prefers-reduced-motion: reduce)").matches)||a<=0){d(a);return}const y=performance.now(),v=E=>{const S=Math.min(1,(E-y)/l);d(Math.round(a*(1-Math.pow(1-S,3)))),S<1&&(k.current=requestAnimationFrame(v))};return k.current=requestAnimationFrame(v),()=>{k.current&&cancelAnimationFrame(k.current)}},[a,r,l]),u}function ra({value:a,tone:r="base",size:l="sm",animate:u=!1,className:d="",title:k}){const T=Uo(a,u);return e.jsxs("span",{className:`pts-pill pts-pill--${r} pts-pill--${l}${u?" pts-pill--pop":""}${d?` ${d}`:""}`,title:k,children:["+",T]})}function Vo({level:a,onDark:r=!0,large:l=!1}){const u=ce(),d=Ma(a),k=r?te.onDark:te.inkStrong,T=r?"rgba(245,240,228,0.5)":te.inkWarm;return e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:2},children:La.map((y,v)=>{const n=v===d;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"3px 7px",borderRadius:10,border:l&&n?`2px solid ${z.edge}`:`1px solid ${n?y.a:"transparent"}`,background:l&&n?Ea(z.edge,.14):n?r?"rgba(245,240,228,0.07)":"rgba(201,154,63,0.10)":"transparent"},children:[e.jsx("img",{src:Ia(v),alt:"","aria-hidden":!0,style:{flex:"none",width:l?48:28,height:l?48:28,objectFit:"contain",opacity:v<=d?1:l?.45:.55,filter:l&&v>d?"saturate(.4)":void 0}}),e.jsx("span",{style:{flex:"0 0 auto",minWidth:l?136:96,textAlign:"center",padding:"4px 11px",borderRadius:999,border:`1px solid ${Je.edge}`,background:_a(y),color:l?Ra(y):y.ink,fontFamily:x,fontWeight:600,fontSize:l?12:10.5,letterSpacing:".10em",textTransform:"uppercase",opacity:v<=d?1:l?.45:.55,filter:l&&v>d?"saturate(.4)":void 0},children:u(`pack.tier.${y.key}`)}),e.jsx("span",{style:{flex:"1 1 auto",fontFamily:x,fontSize:l?12:11.5,letterSpacing:".02em",color:n||l&&v<d?k:T,minWidth:0,whiteSpace:"nowrap"},children:u("pack.tier.levelRange",{range:Ba(y)})}),n&&e.jsx("span",{style:{fontFamily:x,fontWeight:600,fontSize:l?10:9.5,letterSpacing:".16em",whiteSpace:"nowrap",textTransform:"uppercase",color:l?z.ink:y.a,flex:"none",...l?{padding:"4px 8px",borderRadius:999,background:z.grad}:null},children:u("pack.tier.youAreHere")}),l&&v<d&&e.jsx("img",{src:"/icons/sys/fajka.webp",alt:"","aria-hidden":!0,style:{flex:"none",width:32,height:32,objectFit:"contain"}})]},y.key)})})}const _e=[{id:"hachiko",name:"Hachikō",trips:5,img:"/icons/hero-badges/hachiko.webp",source:{url:"https://www.u-tokyo.ac.jp/en/whyutokyo/hongo_hi_014.html",label:"University of Tokyo"}},{id:"barry",name:"Barry",trips:15,img:"/icons/hero-badges/barry.webp",source:{url:"https://www.nmbe.ch/en/exhibitions/barry",label:"Naturhistorisches Museum Bern"}},{id:"togo",name:"Togo",trips:25,img:"/icons/hero-badges/togo.webp",source:{url:"https://www.smithsonianmag.com/history/this-heroic-dog-raced-across-the-frozen-alaskan-wilderness-to-deliver-life-saving-medicine-but-his-contributions-were-long-overlooked-180985905/",label:"Smithsonian Magazine"}},{id:"hekthor",name:"Hekthor",trips:42,img:"/icons/hero-badges/hekthor.webp"},{id:"bothie",name:"Bothie",trips:82,img:"/icons/hero-badges/bothie.webp",source:{url:"https://geographical.co.uk/news/reliving-the-transglobe-expedition",label:"Geographical · RGS"}},{id:"laika",name:"Laika",trips:100,img:"/icons/hero-badges/laika.webp",source:{url:"https://www.smithsonianmag.com/smithsonian-institution/sad-story-laika-space-dog-and-her-one-way-trip-orbit-1-180968728/",label:"Smithsonian Magazine"}},{id:"bobbie",name:"Bobbie",trips:150,img:"/icons/hero-badges/bobbie.webp",source:{url:"https://kval.com/features/pet-of-the-week/bobbie-oregons-wonder-dog",label:"KVAL News"}},{id:"seaman",name:"Seaman",trips:300,img:"/icons/hero-badges/seaman.webp",source:{url:"https://www.nps.gov/articles/000/seaman-s-contributions-to-the-lewis-and-clark-expedition.htm",label:"U.S. National Park Service"}},{id:"savannah",name:"Savannah",trips:1e3,img:"/icons/hero-badges/savannah.webp",source:{url:"https://www.inquirer.com/life/tom-turcich-walk-world-jersey-dog-death-20240521.html",label:"The Philadelphia Inquirer"}}],Ka="pack_hero_revealed";function wa(){try{const a=localStorage.getItem(Ka);if(a===null)return null;const r=JSON.parse(a);return Array.isArray(r)?r.filter(l=>typeof l=="string"):[]}catch{return null}}function $a(a){try{localStorage.setItem(Ka,JSON.stringify(a))}catch{}}function ja({badge:a,kicker:r,locked:l,onClose:u}){const d=ce();return e.jsx(ma,{onClose:u,label:a.name,className:"comm-reveal-pop",children:e.jsxs("div",{className:"comm-reveal-card",children:[e.jsxs("div",{className:"comm-reveal-left",children:[e.jsx("img",{className:`comm-reveal-badge${l?" comm-reveal-badge--off":""}`,src:a.img,alt:a.name}),e.jsx("div",{className:"comm-reveal-trips",children:d("pack.heroBadge.trips",{n:a.trips})})]}),e.jsxs("div",{className:"comm-reveal-right",children:[e.jsx("div",{className:`comm-reveal-kicker${l?" comm-reveal-kicker--locked":""}`,children:r}),e.jsx("div",{className:"comm-reveal-name",children:a.name}),e.jsx("p",{className:"comm-reveal-story",children:d(`pack.heroBadge.${a.id}.story`)}),a.source&&e.jsxs("a",{className:"comm-reveal-source",href:a.source.url,target:"_blank",rel:"noopener noreferrer",children:[d("pack.heroBadge.more")," ",e.jsx("span",{className:"comm-reveal-source-label",children:a.source.label})]})]})]})})}function Wo({walkedCount:a}){const r=ce(),[l,u]=$.useState(null),[d,k]=$.useState([]),[T,y]=$.useState(()=>new Set(Object.keys(Qe())));$.useEffect(()=>{io(_e)},[]),$.useEffect(()=>Sa(()=>y(new Set(Object.keys(Qe())))),[]),$.useEffect(()=>{const S=Qe(),_=_e.filter(C=>a>=C.trips&&!S[C.id]).map(C=>C.id);_.length&&so(_);const V=new Set(Object.keys(Qe()));y(V);const c=wa();if(c===null){$a(Array.from(V));return}const s=_e.filter(C=>V.has(C.id)&&!c.includes(C.id));s.length>0&&k(s)},[a]);const v=T.size,n=d[0],E=()=>{k(S=>{if(S.length===0)return S;const[_,...V]=S,c=wa()??[];return c.includes(_.id)||$a([...c,_.id]),V})};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"comm-dash-section-title",style:{marginTop:26,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:r("pack.stats.heroBadges")}),e.jsxs("span",{children:[v,"/9"]})]}),e.jsx("div",{className:"comm-heroes",children:_e.map(S=>{const _=T.has(S.id);return e.jsxs("button",{type:"button",className:`comm-hero ${_?"comm-hero--on":"comm-hero--off"}`,onClick:()=>u(S),children:[e.jsx("img",{src:S.img,alt:S.name}),e.jsx("span",{className:"comm-hero-trips",children:S.trips})]},S.id)})}),n?e.jsx(ja,{badge:n,kicker:r("pack.heroBadge.kickerMilestone"),locked:!1,onClose:E}):l?(()=>{const S=T.has(l.id),_=S?r("pack.heroBadge.kickerEarned"):r("pack.heroBadge.kickerLocked",{n:l.trips-a});return e.jsx(ja,{badge:l,kicker:_,locked:!S,onClose:()=>u(null)})})():null]})}const Ho={"chopok-dumbier-nizke-tatry":["Ďumbier",2043],"sivy-vrch-zapadne-tatry":["Sivý vrch",1805],"velky-krivan-mala-fatra":["Veľký Kriváň",1709],"ostredok-velka-fatra":["Ostredok",1592],"ohniste-nizke-tatry":["Ohnište",1538],"tlsta-ostra-velka-fatra":["Tlstá",1373],"mincol-mala-fatra":["Minčol",1364],"klak-mala-fatra":["Kľak",1352],"maly-rozsutec-mala-fatra":["Malý Rozsutec",1343],"strazov-strazovske-vrchy":["Strážov",1213],"sokolie-mala-fatra":["Sokolie",1172],sip:["Šíp",1170],"vapec-strazovske-vrchy":["Vápeč",955],"velky-lopenik-rozhladna-biele-karpaty":["Veľký Lopeník",912],"zaruby-1-kostol-certov-zlab-zaruby-male-karpaty":["Záruby",768],"zaruby-2-smolenice-stanica-havranica-zaruby-male-karpaty":["Záruby",768],"zaruby-3-bukova-ostry-kamen-zaruby-male-karpaty":["Záruby",768],"zaruby-4-jahodnik-certov-zlab-zaruby-male-karpaty":["Záruby",768],"zaruby-5-kostol-kaluza-zaruby-male-karpaty":["Záruby",768],"vysoka-na-steroidoch-tajne-skaly-male-karpaty":["Vysoká",754],"vapenna-rostun-male-karpaty":["Vápenná",752]},Zo={"chtelnica-priehrada-male-karpaty":["Chtelnica","pond"],"bukova-priehrada-male-karpaty":["Buková","pond"],"oresianska-priehrada":["Orešianska","pond"],"palcmanska-masa":["Palcmanská Maša","lake"],"liptovska-mara":["Liptovská Mara","reservoir"],slnava:["Sĺňava","reservoir"],kralova:["Kráľová","reservoir"],"zelene-pleso-vysoke-tatry":["Zelené pleso","lake"],bled:["Bled","lake"],seealpsee:["Seealpsee","lake"]},Go={"vintgar-radovna-tiesnava":["Julské Alpy"],seealpsee:["Alpstein"]},Yo={"vintgar-radovna-tiesnava":["Triglavský NP"]},aa=a=>{var r;return((r=uo.find(l=>l.key===a))==null?void 0:r.units)??[]},Le={ranges:{sk:aa("ranges")},parks:{sk:aa("parks"),si:["Triglavský NP"],ch:["Švajčiarsky NP"]},journeys:{sk:aa("journeys")},chko:{sk:aa("chko")}},Ie=a=>Number(a.km)||0,Be=a=>{var r;return a.ascentM??((r=a.journey)==null?void 0:r.ascentM)??0},Jo=a=>{var r;return((r=a.journey)==null?void 0:r.days)??0};function Fa(a){var r;return(r=a.acts)!=null&&r.includes(Ko)?"roadtrip":Pa(a)>=2?"stay":null}function qo(a){return`vrch-${[800,1200,1600,2e3,3e3].find(l=>a<=l)??4e3}`}const Ua=(a,r)=>r[a.id]??(Math.max((Pa(a)||Jo(a))-1,0)||1);function ia(a,r){const l=r[a.id];return l==="none"?null:l??Fa(a)}function pa(a,r){const l=new Map;for(const u of a)for(const d of r(u)){const k=l.get(d);k?k.trails.push(u):l.set(d,{name:d,iso:we(u),trails:[u]})}return[...l.values()].sort((u,d)=>d.trails.length-u.trails.length)}function Xo(a,r={},l={}){var C;const u=h=>xo(h),d=pa(a,h=>[...u(h).ranges??[],...Go[h.id]??[]]),k=pa(a,h=>{const j=new Set([...u(h).parks??[],...Yo[h.id]??[]]);return h.id.endsWith("slovensky-raj")&&j.add("NP Slovenský raj"),[...j]}),T=pa(a,h=>u(h).chko??[]),y=new Map;for(const h of a){const j=Ho[h.id];if(!j)continue;const X=y.get(j[0]);X?X.trails.push(h):y.set(j[0],{name:j[0],iso:we(h),value:j[1],trails:[h]})}const v=[...y.values()].sort((h,j)=>(j.value??0)-(h.value??0)),n=[];for(const h of a){const j=Zo[h.id];if(j){n.push({name:j[0],iso:we(h),water:j[1],trails:[h]});continue}if(!((C=h.acts)!=null&&C.includes("lake")))continue;const X=h.name.toLowerCase();n.push({name:h.name,iso:we(h),water:/priehrad|nádrž|reservoir|dam/.test(X)?"reservoir":/jazierk|rybn|pond/.test(X)?"pond":"lake",trails:[h]})}const E=a.filter(h=>{var j;return(j=h.acts)==null?void 0:j.includes("journey")}).map(h=>({name:h.name,iso:we(h),value:Ie(h),trails:[]})),S=a.filter(h=>ia(h,r)==="roadtrip").map(h=>({name:h.name,iso:we(h),value:Ie(h),trails:[h]})),_=[];let V=0;for(const h of a){if(ia(h,r)!=="stay")continue;const j=Ua(h,l);V+=j,_.push({name:h.name,iso:we(h),value:j,trails:[h]})}const c=new Map;for(const h of a){const j=we(h),X=c.get(j);X?X.push(h):c.set(j,[h])}const s=a.reduce((h,j)=>h+Be(j),0);return{km:a.reduce((h,j)=>h+Ie(j),0),ascent:s,everest:Math.floor(s/8849*10)/10,countries:[...c.entries()].map(([h,j])=>({iso:h,trails:j})).sort((h,j)=>j.trails.length-h.trails.length),ranges:d,parks:k,chko:T,peaks:v,waters:n,journeys:E,roadtrips:S,stays:_,nights:V,byKm:a.filter(h=>Ie(h)>0).sort((h,j)=>Ie(j)-Ie(h)),byAscent:a.filter(h=>Be(h)>0).sort((h,j)=>Be(j)-Be(h))}}const b=te,i=K,D=a=>`/icons/tripstats/${a}.webp`,Pe=Ya.subblock,Ze=332,Ge=44,ze=358,ge=237,R={skyTop:"#7CCBD8",skyMid:"#FCE7B0",skyLow:"#F9C873",ray:"#FFF3CF",sunOut:"#F59B3C",sunIn:"#FBB84E",tealLit:"#2E8F97",tealDark:"#1B6470",midLit:"#3F9E8B",midDark:"#2A7A6C",lowLit:"#57A869",lowDark:"#3C8854",snow:"#FFF8E6",hill:"#3F8747",pine:"#17493B",pineDark:"#113A30",trunk:"#6B4A2B"},ca=120,Qo=Ze+Ge,Jt=ca/2,et=32,at="inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)",ot=`background:linear-gradient(180deg,color-mix(in srgb,${z.edge} 72%,white),${z.deep});border-color:${z.ink};color:${z.ink};box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 color-mix(in srgb,${z.deep} 60%,black);`,tt=`
html.papyrus3d .tw-wall,html.papyrus3d .tlw-wall{border:3px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink),0 7px 0 2px var(--p3d-gold-ink),0 13px 16px var(--p3d-sh);}
html.papyrus3d .tw-av{border:3px solid var(--p3d-gold);box-shadow:0 0 0 2px var(--p3d-ink);}
html.papyrus3d .tw-who b{text-transform:none;letter-spacing:.02em;font-size:${f.h1}px;color:var(--p3d-ink);}
html.papyrus3d .tw-who.tight b{font-size:${f.h2}px;}
html.papyrus3d .tw-who small{color:var(--p3d-ink);opacity:1;}
html.papyrus3d .tw-xp{border:2.5px solid var(--p3d-ink);border-radius:${I.frame}px;background:var(--p3d-card);box-shadow:0 4px 0 var(--p3d-gold-solid);color:var(--p3d-ink);}
html.papyrus3d .tw-xp .pk-progress{height:16px;border:2px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .tw-xp .pk-progress__fill{background:linear-gradient(90deg,${z.edge},color-mix(in srgb,${z.edge} 40%,white) 70%,white);}
html.papyrus3d .tw-strip button.pk-stage{border:2.5px solid var(--p3d-ink);border-radius:${I.card}px;background:var(--p3d-card);box-shadow:var(--p3d-b3);}
html.papyrus3d .tw-strip .tw-num{color:var(--p3d-ink);}
html.papyrus3d .tw-strip .tw-lbl{color:var(--p3d-gold-ink);}
html.papyrus3d .tw-grid{gap:${i.lg}px ${i.sm}px;}
html.papyrus3d .tw-tile,html.papyrus3d .tw-rec,html.papyrus3d .tw-dog{border:2.5px solid var(--p3d-ink) !important;border-radius:${I.card}px !important;background:var(--p3d-card) !important;box-shadow:var(--p3d-b3) !important;}
html.papyrus3d .tw-dog{margin-bottom:${i.lg}px;}
html.papyrus3d .tw-chev{display:none;}
html.papyrus3d .tw-tile{min-height:88px;}
html.papyrus3d .tw-tile img{width:64px;height:64px;}
html.papyrus3d .tw-tile .tw-num{font-size:${et}px;color:var(--p3d-ink);}
html.papyrus3d .tw-tile .tw-t2{font-size:${f.body}px;color:var(--p3d-ink);}
html.papyrus3d .tw-rec{min-height:72px;}
html.papyrus3d .tw-rec b{font-size:${f.h2}px;color:var(--p3d-ink);}
html.papyrus3d .tw-rec small{font-size:${f.label}px;color:var(--p3d-ink);}
html.papyrus3d .tw-sh h3{color:var(--p3d-ink);}
html.papyrus3d .tw-fl{padding-bottom:${i.sm}px;}
html.papyrus3d .tw-fl button{min-height:44px;padding:${i.sm}px ${i.md}px;border:2.5px solid var(--p3d-ink);border-radius:${I.card}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${at};font-size:${f.body}px;font-weight:600;}
html.papyrus3d .tw-fl button.on{${ot}}
html.papyrus3d .tw-fl img{box-shadow:0 0 0 2px var(--p3d-ink);}
html.papyrus3d .tw-fl.sub button{min-height:40px;}
html.papyrus3d .tw-row{border:0;border-radius:0;background:none;padding:${i.sm}px 0;color:var(--p3d-ink);}
html.papyrus3d .tw-row.lock{border:0;opacity:.5;}
html.papyrus3d .tw-row .nm{font-size:${f.lead}px;}
html.papyrus3d .tw-row .mt{font-size:${f.body}px;color:${z.edge};}
html.papyrus3d .tw-row.on{background:none;border:0;box-shadow:none;}
html.papyrus3d .tw-tick{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .tw-mark,html.papyrus3d .tlw-all{min-height:56px;border:2.5px solid var(--p3d-ink);border-radius:${I.card}px;background:var(--p3d-card);color:var(--p3d-ink);box-shadow:var(--p3d-b3);font-family:'LT Museum',serif;font-weight:400;font-size:${f.h2}px;letter-spacing:0;text-transform:none;}
html.papyrus3d .tw-lvh{border:2.5px solid var(--p3d-ink);box-shadow:0 4px 0 var(--p3d-gold-solid);}
html.papyrus3d .tw-lvh h3{letter-spacing:.02em;text-transform:none;}
html.papyrus3d .tw-xp.static{background:var(--p3d-card);}
html.papyrus3d .tw-cc{border:2.5px solid var(--p3d-ink) !important;background:var(--p3d-card) !important;box-shadow:0 4px 0 var(--p3d-gold-solid) !important;}
html.papyrus3d .tw-hd2,html.papyrus3d .tw-why{color:var(--p3d-ink);}
html.papyrus3d .tw-next .pk-progress{height:16px;border:2px solid var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .tw-next .pk-progress__fill{background:linear-gradient(90deg,${z.edge},color-mix(in srgb,${z.edge} 40%,white) 70%,white);}
`,rt=`${Ha}
${Za}
${Ga}
.tw-strip{--pk-stage:rgba(255,255,255,.58);--pk-stage-edge:rgba(255,255,255,.85);}
.tw-root{--tw-ink:${z.ink};--tw-deep:${z.deep};--tw-gold:${b.cardEdge};}
.tw-wall{position:relative;display:flex;flex-direction:column;height:${Qo}px;margin-top:${i.md}px;border-radius:${I.card}px;overflow:hidden;background:${R.skyTop};border:1.5px solid ${b.cardEdge};box-shadow:${Ne};}
.tw-poster{position:absolute;inset:0;width:100%;height:100%;display:block;}
.tw-poster text{font:600 ${f.micro}px ${x};fill:${b.inkStrong};}
.tw-hud{position:relative;z-index:2;display:flex;align-items:center;gap:${i.sm}px;padding:${i.md}px;color:${z.deep};}
.tw-hudb{display:flex;align-items:center;gap:${i.md}px;flex:1;min-width:0;padding:0;background:none;border:0;color:inherit;cursor:pointer;text-align:left;font-family:${x};}
.tw-av{width:56px;height:56px;flex:none;border-radius:${I.pill}px;object-fit:cover;border:2px solid ${b.cardEdge};box-shadow:0 0 0 2px ${b.card},0 0 0 3px ${b.inkStrong};}
.tw-avs{display:flex;align-items:flex-end;flex:none;}
.tw-avs .tw-av{width:48px;height:48px;}
.tw-avs .tw-avd{width:36px;height:36px;margin-left:-${i.md}px;}
.tw-who.tight b{font-size:${f.body}px;letter-spacing:.02em;}
.tw-who{flex:1;min-width:0;}
.tw-who b{display:block;font-family:${H};font-weight:700;font-size:${f.lead}px;letter-spacing:.14em;text-transform:uppercase;overflow-wrap:anywhere;} /* písmo: meno */
.tw-who small{display:block;margin-top:${i.xs}px;font-size:${f.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;opacity:.82;}
.tw-xp{position:relative;z-index:2;display:block;width:auto;margin:0 ${i.md}px;padding:${i.sm}px ${i.md}px;border:1.5px solid ${b.cardEdge};border-radius:${I.tile}px;background:${z.grad};box-shadow:${G.card};color:${z.ink};font-family:${x};cursor:pointer;}
.tw-xpr{display:flex;align-items:center;gap:${i.sm}px;}
.tw-xpl{flex:none;min-width:${i.lg}px;font-size:${f.lead}px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;text-align:center;-webkit-text-stroke:.5px currentColor;}
.tw-xpl.nx{opacity:.6;}
.tw-xp .pk-progress{flex:1;width:auto;height:12px;background:rgba(255,255,255,.2);}
.tw-xp .pk-progress__fill{transition:width 1.1s cubic-bezier(.2,.7,.2,1) .2s;}
.tw-xpt{display:flex;justify-content:space-between;gap:${i.sm}px;margin-top:${i.xs}px;font-size:${f.label}px;font-weight:500;font-variant-numeric:tabular-nums;}
.tw-skyb{position:relative;z-index:1;display:block;width:100%;flex:1;min-height:0;padding:0;background:none;border:0;cursor:pointer;}
.tw-strip{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:${i.sm}px;margin:-${i.xxl}px ${i.sm}px 0;}
.tw-strip button{display:flex;flex-direction:column;align-items:center;gap:${i.xs}px;padding:${i.sm}px ${i.xs}px ${i.md}px;cursor:pointer;font-family:${x};box-shadow:${G.card};}
.tw-wall + .tw-strip,.tw-wallw + .tw-strip{margin-top:-${ca/2}px;}
.tw-wall + .tw-strip button,.tw-wallw + .tw-strip button{height:${ca}px;justify-content:center;padding:${i.xs}px;}
.tw-wall + .tw-strip .tw-lbl,.tw-wallw + .tw-strip .tw-lbl{line-height:1.2;}
.tw-strip img{width:48px;height:48px;object-fit:contain;}
.tw-num,.tw-rec b,.tw-m b{-webkit-text-stroke:.5px currentColor;}
.tw-num{font-size:${f.h1}px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;color:${b.inkStrong};white-space:nowrap;}
.tw-lbl{font-size:${f.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${b.inkWarm};}
.tw-sec{display:flex;align-items:center;gap:${i.sm}px;margin:${i.xl}px 0 ${i.md}px;font-size:${f.micro}px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:${b.inkWarm};}
.tw-sec::after{content:'';flex:1;height:1px;background:${b.hairline};}
.tw-sec em{order:2;font-style:normal;font-weight:600;letter-spacing:.02em;}
.tw-grid{display:grid;grid-template-columns:1fr 1fr;gap:${i.sm}px;}
.tw-tile{position:relative;display:flex;align-items:center;gap:${i.sm}px;padding:${i.sm}px;min-height:72px;text-align:left;cursor:pointer;font-family:${x};transition:transform .12s ease;}
.tw-tile:active,.tw-strip button:active,.tw-rec:active{transform:scale(.97);}
.tw-tile.wide{grid-column:1/-1;}
.tw-tile img{width:56px;height:56px;flex:none;object-fit:contain;}
.tw-tile span{display:block;min-width:0;}
.tw-tile .tw-t2{margin-top:${i.xs}px;font-size:${f.label}px;font-weight:500;line-height:1.2;color:${b.inkStrong};}
.tw-chev{position:absolute;right:${i.sm}px;top:${i.sm}px;width:12px;height:12px;stroke:${b.inkWarm};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.tw-rec{display:flex;align-items:center;gap:${i.sm}px;padding:${i.sm}px;text-align:left;cursor:pointer;font-family:${x};transition:transform .12s ease;}
.tw-rec img{width:44px;height:44px;flex:none;object-fit:contain;}
.tw-rec b{display:block;font-size:${f.body}px;font-weight:600;line-height:1.15;font-variant-numeric:tabular-nums;color:${b.inkStrong};}
.tw-rec small{display:block;margin-top:${i.xs}px;font-size:${f.micro}px;color:${b.inkWarm};}
.tw-dog{display:flex;align-items:center;gap:${i.md}px;padding:${i.sm}px ${i.md}px;margin-bottom:${i.sm}px;}
.tw-dog img{width:48px;height:48px;flex:none;border-radius:${I.pill}px;object-fit:cover;border:2px solid ${b.cardEdge};box-shadow:0 0 0 2px ${b.card},0 0 0 3px ${b.inkStrong};}
.tw-dog b{display:block;font-family:${H};font-weight:700;font-size:${f.lead}px;letter-spacing:.02em;color:${b.inkStrong};} /* písmo: meno */
.tw-dog small{display:block;margin-top:${i.xs}px;font-size:${f.label}px;color:${b.inkWarm};font-variant-numeric:tabular-nums;}
.tw-badges{display:flex;flex-direction:column;}
.tw-badges .comm-dash-section-title{order:0;}
.tw-next{order:1;display:flex;align-items:center;gap:${i.md}px;margin-bottom:${i.md}px;}
.tw-next .pk-progress{flex:1;width:auto;}
.tw-next span{font-size:${f.label}px;font-weight:600;color:${b.inkWarm};white-space:nowrap;}
.tw-badges .comm-heroes{order:2;grid-template-columns:repeat(3,1fr);gap:${i.md}px ${i.sm}px;margin-top:0;}
.tw-badges .comm-hero img{width:88px;}
.tw-sh{display:flex;align-items:center;gap:${i.md}px;}
.tw-sh img{width:64px;height:64px;flex:none;object-fit:contain;}
.tw-sh h3{margin:0;font-family:${H};font-weight:700;font-size:${f.h2}px;line-height:1.15;letter-spacing:.02em;color:${b.inkStrong};} /* písmo: nadpis */
.tw-sh .tw-num{display:block;margin-top:${i.xs}px;}
.tw-sh small{font-size:${f.body}px;font-weight:500;color:${b.inkWarm};}
.tw-sh .tw-hd2{display:block;margin-top:${i.xs}px;font-size:${f.label}px;font-weight:500;color:${b.inkWarm};}
.tw-prg{margin-top:${i.md}px;}
.tw-fl{display:flex;gap:${i.sm}px;overflow-x:auto;scrollbar-width:none;margin:${i.md}px -${i.lg}px 0;padding:${i.xs}px ${i.lg}px;}
.tw-fl::-webkit-scrollbar{display:none;}
.tw-fl button{flex:none;display:inline-flex;align-items:center;gap:${i.xs}px;padding:${i.sm}px ${i.md}px;border-radius:${I.pill}px;border:1.5px solid ${b.border};background:${b.card};color:${b.inkStrong};font-family:${x};font-size:${f.label}px;font-weight:500;line-height:1;cursor:pointer;font-variant-numeric:tabular-nums;}
.tw-fl button b{font-weight:600;}
.tw-fl button.zero{opacity:.5;}
.tw-fl button.on{${Ye(z.edge,Oe.lapis)}}
.tw-fl img{width:18px;height:18px;border-radius:${I.pill}px;object-fit:cover;}
.tw-fl.sub{margin-top:${i.sm}px;}
.tw-fl.sub button{padding:${i.xs}px ${i.md}px;}
.tw-fl.sub img{width:24px;height:24px;border-radius:0;object-fit:contain;}
.tw-ls{display:flex;flex-direction:column;gap:${i.xs}px;margin-top:${i.md}px;}
.tw-row{display:flex;align-items:center;gap:${i.sm}px;width:100%;min-height:44px;padding:${i.md}px;border-radius:${I.tile}px;border:1px solid ${b.border};background:${b.tileBg};color:${b.inkStrong};font-family:${x};text-align:left;}
button.tw-row{cursor:pointer;}
.tw-row img{width:18px;height:18px;flex:none;border-radius:${I.pill}px;object-fit:cover;}
.tw-row .nm{flex:1;min-width:0;font-size:${f.body}px;font-weight:500;line-height:1.2;}
.tw-row .mt{flex:none;font-size:${f.label}px;font-weight:600;line-height:1;color:${b.inkWarm};font-variant-numeric:tabular-nums;}
.tw-row svg{flex:none;width:12px;height:12px;stroke:${b.inkWarm};fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s ease;}
.tw-row.open svg{transform:rotate(90deg);}
.tw-row.lock{border-style:dashed;background:none;color:${b.inkWarm};}
.tw-row.lock .nm{font-weight:400;}
.tw-row img.tw-logo{width:48px;height:48px;border-radius:0;object-fit:contain;}
.tw-row.lock img.tw-logo{filter:grayscale(1);opacity:.5;}
.tw-row img.tw-oth{width:24px;height:24px;border-radius:0;object-fit:contain;}
.tw-row.on{${Ye(z.edge,Oe.lapis)}}
.tw-tick{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:${I.pill}px;border:1.5px solid ${b.border};}
.tw-row svg.tw-ck{width:14px;height:14px;stroke:${z.edge};stroke-width:3;}
.tw-nt{display:flex;align-items:center;gap:${i.sm}px;padding:${i.xs}px ${i.md}px ${i.sm}px;}
.tw-nt > span{flex:1;font-size:${f.label}px;font-weight:500;color:${b.inkWarm};}
.tw-nt button{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex:none;border-radius:${I.field}px;border:1.5px solid ${b.border};background:${b.card};cursor:pointer;}
.tw-nt svg{width:16px;height:16px;stroke:${b.inkStrong};fill:none;stroke-width:2.5;stroke-linecap:round;}
.tw-nt input{width:56px;height:44px;flex:none;text-align:center;font-family:${x};font-size:${f.lead}px;font-weight:600;color:${b.inkStrong};font-variant-numeric:tabular-nums;}
.tw-lvh{position:relative;display:flex;align-items:center;gap:${i.md}px;padding:${i.lg}px;border-radius:${I.card}px;border:1.5px solid ${b.cardEdge};background:linear-gradient(180deg,${R.skyTop},${R.skyMid} 70%,${R.skyLow});color:${z.deep};overflow:hidden;}
.tw-lvh img{width:96px;height:96px;flex:none;object-fit:contain;}
.tw-lvh small{display:block;font-size:${f.micro}px;font-weight:500;letter-spacing:.26em;text-transform:uppercase;}
.tw-lvh h3{margin:${i.xs}px 0 ${i.sm}px;font-family:${H};font-weight:700;font-size:${f.h1}px;line-height:1.1;letter-spacing:.14em;text-transform:uppercase;} /* písmo: nadpis */
.tw-lvh i{display:inline-block;padding:${i.xs}px ${i.md}px;border-radius:${I.pill}px;border:1px solid ${b.cardEdge};font-style:normal;font-size:${f.label}px;font-weight:600;letter-spacing:.02em;}
.tw-why{margin:${i.md}px 0;font-size:${f.body}px;line-height:1.4;text-align:center;color:${b.inkStrong};}
.tw-xp.static{margin:${i.md}px 0 0;cursor:default;}
.tw-lvb .comm-pts-rule{display:none;}
.tw-lvb .comm-pts-cols{margin-top:${i.xl}px;}
.tw-lvb .comm-pts-eyebrow{font-size:${f.label}px;color:${b.inkWarm};}
.tw-lvb .comm-pts-row,.tw-lvb .comm-pts-none{font-size:${f.label}px;}
.tw-mark{display:block;width:100%;margin-top:${i.md}px;padding:${i.md}px;border:0;border-radius:${I.field}px;background:${z.grad};box-shadow:${Ne};color:${z.ink};font-family:${H};font-weight:700;font-size:${f.body}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;} /* písmo: cta */
.tw-find{display:block;width:100%;margin-top:${i.md}px;padding:${i.md}px;font-family:${x};font-size:${f.lead}px;color:${b.inkStrong};}
.tw-cs{display:flex;align-items:center;gap:${i.sm}px;margin-top:${i.lg}px;font-family:${H};font-weight:700;font-size:${f.lead}px;line-height:1.1;letter-spacing:.02em;color:${b.inkStrong};} /* písmo: nadpis */
.tw-cs img{width:24px;height:24px;border-radius:${I.pill}px;object-fit:cover;}
.tw-cs b{margin-left:auto;font-family:${x};font-weight:600;font-size:${f.body}px;letter-spacing:.02em;font-variant-numeric:tabular-nums;white-space:nowrap;}
.tw-cs + .tw-prg{margin-top:${i.sm}px;}
.tw-cs ~ .tw-ls{margin-top:${i.sm}px;}
.tw-sub{display:flex;flex-direction:column;padding:0 ${i.md}px ${i.sm}px ${i.xl}px;}
.tw-sub button{display:flex;justify-content:space-between;gap:${i.sm}px;padding:${i.xs}px 0;background:none;border:0;font-family:${x};font-size:${f.label}px;color:${b.inkStrong};text-align:left;cursor:pointer;}
.tw-sub i{font-style:normal;color:${b.inkWarm};font-variant-numeric:tabular-nums;white-space:nowrap;}
.tw-none{margin:${i.xl}px 0;text-align:center;color:${b.inkWarm};font-size:${f.body}px;}
.tw-note{display:inline-flex;margin-top:${i.md}px;padding:${i.xs}px ${i.sm}px;border-radius:${I.pill}px;border:1px solid ${b.border};font-size:${f.micro}px;font-weight:600;color:${b.inkWarm};}
.tw-cc{padding:${i.md}px;margin-top:${i.sm}px;}
.tw-sh + .tw-cc{margin-top:${i.md}px;}
.tw-cc h4{display:flex;align-items:center;gap:${i.sm}px;margin:0;font-family:${H};font-weight:700;font-size:${f.lead}px;line-height:1.1;letter-spacing:.02em;color:${b.inkStrong};} /* písmo: nadpis */
.tw-cc h4 img{width:24px;height:24px;border-radius:${I.pill}px;object-fit:cover;}
.tw-cc h4 small{margin-left:auto;font-family:${x};font-size:${f.label}px;font-weight:600;letter-spacing:.02em;color:${b.inkWarm};font-variant-numeric:tabular-nums;white-space:nowrap;}
.tw-m{display:grid;grid-template-columns:repeat(4,1fr);gap:${i.xs}px;margin-top:${i.md}px;}
.tw-m button{padding:${i.xs}px 0;border:0;border-radius:${I.tile}px;background:none;font-family:${x};text-align:center;cursor:pointer;color:${b.inkStrong};}
.tw-m img{display:block;width:36px;height:36px;margin:0 auto ${i.xs}px;object-fit:contain;}
.tw-m b{display:block;font-size:${f.lead}px;font-weight:600;line-height:1;}
.tw-m span{font-size:${f.micro}px;color:${b.inkWarm};}
@media (prefers-reduced-motion:reduce){.tw-xp .pk-progress__fill{transition:none;}}
${tt}
`;function de({n:a}){const{lang:r}=Fe(),[l,u]=$.useState(0);return $.useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion:reduce)").matches){u(a);return}let d=0;const k=performance.now(),T=y=>{const v=Math.min(1,(y-k)/1e3);u(a*(1-Math.pow(1-v,3))),v<1&&(d=requestAnimationFrame(T))};return d=requestAnimationFrame(T),()=>cancelAnimationFrame(d)},[a]),e.jsx(e.Fragment,{children:Ee(Math.round(l),r)})}function nt({peaks:a}){const{lang:r}=Fe(),l=$.useMemo(()=>{var fe;const c=g=>g.toFixed(1);let s=7;const C=()=>(s=s*16807%2147483647)/2147483647,h=((fe=a[0])==null?void 0:fe.value)??2e3,j=h-843,X=[0,-1,1,-2,2,-3,3],ke=a.slice(0,7).map((g,A)=>({name:g.name,h:g.value??0,x:ze/2+X[A]*60+(A?A*37%11-5:0),y:Math.min(250,258-((g.value??0)-j)/843*112)})),ee=ke[0]??{name:"",h:0,x:ze/2,y:146},se=[],P=(g,A,F,re,Ae,le)=>{const W=300-A;if(se.push({d:`M${c(g)} ${c(A)} L${c(g+F)} 300 L${c(g-F)} 300Z`,c:re}),se.push({d:`M${c(g)} ${c(A)} L${c(g+F)} 300 L${c(g+F*.12)} 300 L${c(g+F*.2)} ${c(A+W*.55)} L${c(g-F*.08)} ${c(A+W*.32)}Z`,c:Ae}),!le)return;const ae=A+W*le,pe=F*le;se.push({d:`M${c(g)} ${c(A)} L${c(g+pe)} ${c(ae)} L${c(g+pe*.5)} ${c(ae-7)} L${c(g+pe*.18)} ${c(ae+7)} L${c(g-pe*.22)} ${c(ae-6)} L${c(g-pe*.6)} ${c(ae+6)} L${c(g-pe)} ${c(ae)}Z`,c:R.snow})};a.slice(7,15).forEach((g,A)=>P(ze/2+(A%2?1:-1)*(230+(A>>1)*58),Math.min(250,258-((g.value??0)-j)/843*112)+24,72,R.lowLit,R.lowDark,0)),P(ee.x,ee.y,128,R.tealLit,R.tealDark,.3),ke.slice(1,3).forEach(g=>P(g.x<ee.x?g.x-16:g.x+16,g.y+14,92,R.midLit,R.midDark,.2)),ke.slice(3,5).forEach(g=>P(g.x<ee.x?g.x-36:g.x+36,g.y+24,72,R.lowLit,R.lowDark,0));const M=ee.x,Y=ee.y+34,me=Array.from({length:18},(g,A)=>{const F=A*Math.PI/9-.08,re=F+.17;return`M${c(M)} ${c(Y)} L${c(M+Math.cos(F)*900)} ${c(Y+Math.sin(F)*900)} L${c(M+Math.cos(re)*900)} ${c(Y+Math.sin(re)*900)}Z`}),$e=g=>262+Math.sin(g/58+1)*8;let be=`M${-ge-6} ${c($e(-ge-6))}`;for(let g=-ge;g<=ze+ge+6;g+=6)be+=` L${g} ${c($e(g))}`;be+=` L${ze+ge+6} ${Ze} L${-ge-6} ${Ze}Z`;const oe=[],Z=(g,A)=>{const F=$e(g)+4,re=(Ae,le,Te)=>{const W=F-Ae*A,ae=W-Te*A;return[`M${c(g)} ${c(ae)} L${c(g+le*A)} ${c(W)} L${c(g-le*A)} ${c(W)}Z`,`M${c(g)} ${c(ae)} L${c(g+le*A)} ${c(W)} L${c(g)} ${c(W)}Z`]};oe.push({x:g,b:F,s:A,tiers:[re(3,10,14),re(11,8,12),re(19,5.6,11)]})};for(let g=0;g<20;g++){const A=g*19+C()*10-4,F=.8+g*7%5*.14;A>130&&A<230&&F<1.2||Z(A,F)}for(let g=1;g<=13;g++)Z(-g*19+C()*8,.8+g*3%5*.14),Z(ze+g*19-C()*8,.8+g*4%5*.14);return{apex:ee,faces:se,rays:me,land:be,pines:oe,cx:M,cy:Y,hasPeak:ke.length>0}},[a]),{apex:u,faces:d,rays:k,land:T,pines:y,cx:v,cy:n,hasPeak:E}=l,S=`${u.name} ${Ee(u.h,r)} m`,_=S.length*5.7+18,V=u.x+24;return e.jsxs("svg",{className:"tw-poster",viewBox:`${-ge} ${-Ge} ${ze+2*ge} ${Ze+Ge}`,preserveAspectRatio:"xMidYMax slice","aria-hidden":"true",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"tw-psky",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0",stopColor:R.skyTop}),e.jsx("stop",{offset:".62",stopColor:R.skyMid}),e.jsx("stop",{offset:"1",stopColor:R.skyLow})]})}),e.jsx("rect",{x:-ge,y:-Ge,width:ze+2*ge,height:Ze+Ge,fill:"url(#tw-psky)"}),k.map((c,s)=>e.jsx("path",{d:c,fill:R.ray,opacity:".42"},s)),e.jsx("circle",{cx:v,cy:n,r:"58",fill:R.sunOut}),e.jsx("circle",{cx:v,cy:n,r:"46",fill:R.sunIn}),d.map((c,s)=>e.jsx("path",{d:c.d,fill:c.c},s)),e.jsx("path",{d:T,fill:R.hill}),y.map((c,s)=>e.jsxs("g",{children:[e.jsx("rect",{x:c.x-1.4*c.s,y:c.b-4*c.s,width:2.8*c.s,height:5*c.s,fill:R.trunk}),c.tiers.map(([C,h],j)=>e.jsxs("g",{children:[e.jsx("path",{d:C,fill:R.pine}),e.jsx("path",{d:h,fill:R.pineDark})]},j))]},s)),[[70,150],[92,142],[80,132]].map(([c,s],C)=>e.jsx("path",{d:`M${c-7} ${s} q3.5 -5 7 0 q3.5 -5 7 0`,fill:"none",stroke:R.pine,strokeWidth:"1.6",strokeLinecap:"round"},C)),E&&e.jsxs(e.Fragment,{children:[e.jsx("path",{d:`M${u.x} ${u.y+1} v-25`,stroke:R.pine,strokeWidth:"2",strokeLinecap:"round"}),e.jsx("path",{d:`M${u.x} ${u.y-24} l16 5 l-16 5z`,fill:b.cardEdge,stroke:R.pine,strokeWidth:"1.4",strokeLinejoin:"round"}),e.jsx("rect",{x:V,y:u.y-30,width:_,height:"20",rx:"10",fill:b.card,opacity:".95"}),e.jsx("text",{x:V+9,y:u.y-16.5,children:S})]})]})}const it=()=>e.jsx("svg",{viewBox:"0 0 24 24","aria-hidden":"true",children:e.jsx("path",{d:"M9 6l6 6-6 6"})}),st=()=>e.jsx("svg",{className:"tw-ck",viewBox:"0 0 24 24","aria-hidden":"true",children:e.jsx("path",{d:"M5 13l4 4L19 7"})}),lt=()=>e.jsx("svg",{viewBox:"0 0 24 24","aria-hidden":"true",children:e.jsx("path",{d:"M5 12h14"})}),pt=()=>e.jsx("svg",{viewBox:"0 0 24 24","aria-hidden":"true",children:e.jsx("path",{d:"M5 12h14M12 5v14"})}),dt=()=>e.jsx("svg",{className:"tw-chev",viewBox:"0 0 24 24","aria-hidden":"true",children:e.jsx("path",{d:"M9 6l6 6-6 6"})}),oa=a=>({display:"block",width:`${Math.min(100,Math.max(0,a))}%`}),za={pond:"jazierko",reservoir:"priehrada",lake:"jazero"};function ct({walkedTrails:a,ownerName:r,avatarUrl:l,dogs:u,lvl:d,dogStats:k,showChko:T,onOpenTrip:y,levelSheet:v}){var We;const n=ce(),{lang:E}=Fe(),[S,_]=$.useState(ba);$.useEffect(()=>Sa(()=>{_(ba()),c(fa())}),[]);const[V,c]=$.useState(fa),s=$.useMemo(()=>Xo(a,S,V),[a,S,V]),[C,h]=$.useState(""),[j,X]=$.useState([]),[ke,ee]=$.useState(null),[se,P]=$.useState(!1);$.useEffect(()=>{const o=requestAnimationFrame(()=>P(!0));return()=>cancelAnimationFrame(o)},[]);const M=o=>Ee(Math.round(o),E),Y=j[j.length-1],me=o=>{ee(null),h(""),X(w=>[...w,o])},$e=()=>{ee(null),X(o=>o.slice(0,-1))},be=o=>{ee(null),X(w=>w.map((B,J)=>J===w.length-1&&B.kind==="cat"?{...B,...o}:B))},oe=(o,w="all")=>me({kind:"cat",cat:o,iso:w,water:"all"}),Z=(o,w)=>({name:He(o,E),iso:o.country||"sk",value:w,trails:[o]}),fe={ranges:{title:n("pack.stats.geo.ranges"),ic:D("pohoria"),items:s.ranges,units:Le.ranges,meta:o=>o.trails.length>1?`${o.trails.length}×`:""},parks:{title:n("pack.stats.geo.parks"),ic:D("narodny-park"),items:s.parks,units:Le.parks,logos:ko,meta:o=>o.trails.length>1?`${o.trails.length}×`:""},chko:{title:"CHKO",ic:"/icons/chko/biele-karpaty.png",items:s.chko,units:Le.chko,logos:go,meta:o=>o.trails.length>1?`${o.trails.length}×`:""},peaks:{title:n("pack.wall.peaks"),ic:D("vrcholy"),items:s.peaks,icon:o=>D(qo(o.value??0)),meta:o=>`${M(o.value??0)} m`},waters:{title:n("pack.stats.geo.waters"),ic:D("jazero"),items:s.waters,icon:o=>o.water?D(`voda-${za[o.water]}`):"",meta:o=>o.water?n(`pack.wall.water.${o.water==="lake"&&/pleso/i.test(o.name)?"tarn":o.water}`):""},journeys:{title:n("pack.stats.geo.journeys"),ic:D("pridane"),items:s.journeys,units:Le.journeys,meta:o=>`${M(o.value??0)} km`},roadtrips:{title:n("pack.wall.roadtrips"),ic:D("roadtrip"),items:s.roadtrips,meta:o=>`${M(o.value??0)} km`},stays:{title:n("pack.wall.stays"),ic:D("stanovacky"),items:s.stays,meta:o=>n(`pack.wall.nights${lo(o.value??0)}`,{n:o.value??0})},ascent:{title:n("pack.wall.ascent"),ic:D("najvyssi"),items:s.byAscent.map(o=>Z(o,Be(o))),meta:o=>`${M(o.value??0)} m`,sum:!0,unit:"m",direct:!0},km:{title:n("pack.wall.kmTitle"),ic:D("km"),items:s.byKm.map(o=>Z(o,Number(o.km)||0)),meta:o=>`${M(o.value??0)} km`,sum:!0,unit:"km",direct:!0},trips:{title:n("pack.wall.tripsTitle"),ic:D("vylety"),items:[...a].sort((o,w)=>o.name.localeCompare(w.name,E)).map(o=>Z(o,Number(o.km)||0)),meta:o=>o.value?`${M(o.value)} km`:n("pack.wall.place"),direct:!0}},g=s.countries.map(o=>o.iso),A=g[0],F=o=>{try{return new Intl.DisplayNames([E],{type:"region"}).of(o.toUpperCase())??na(o)}catch{return na(o)}},re=o=>{var ga;const w=fe[o.cat],B=w.items.filter(N=>o.iso==="all"||N.iso===o.iso),J=o.water==="all"?B:B.filter(N=>N.water===o.water),m=o.iso!=="all"?(ga=w.units)==null?void 0:ga[o.iso]:void 0,O=m?m.filter(N=>!B.some(U=>U.name===N)):[],ie=M(B.reduce((N,U)=>N+(U.value??0),0)),he=o.cat==="stays"?ie:w.sum?`${M(B.reduce((N,U)=>N+(U.value??0),0))} ${w.unit}`:M(B.length),ue=o.cat==="ascent"&&o.iso==="all"?n("pack.wall.everest",{n:Ee(s.everest,E)}):o.cat==="stays"?n("pack.wall.tentNights"):"",je=!!w.units&&o.iso!=="all"&&!m,ve=o.cat==="stays"?"stay":o.cat==="roadtrips"?"roadtrip":null,Xe=(N,U,L=!1)=>{var xe,Q;const ye=((xe=w.logos)==null?void 0:xe[N.name])??((Q=w.icon)==null?void 0:Q.call(w,N));return e.jsxs(e.Fragment,{children:[ye&&e.jsx("img",{className:"tw-logo",src:ye,alt:"",loading:"lazy",decoding:"async"}),!L&&!U&&N.iso!==A&&e.jsx("img",{src:ea(N.iso),alt:"",loading:"lazy",decoding:"async"})]})},ha=(N,U)=>N.map(L=>{const ye=Xe(L,U);if(w.direct)return e.jsxs("button",{type:"button",className:"tw-row",onClick:()=>y(L.trails[0].id),children:[ye,e.jsx("span",{className:"nm",children:L.name}),e.jsx("span",{className:"mt",children:w.meta(L)})]},L.trails[0].id);if(!L.trails.length||o.cat==="waters"||ve){const Q=L.trails[0];return Q?e.jsxs("button",{type:"button",className:"tw-row",onClick:()=>y(Q.id),children:[ye,e.jsx("span",{className:"nm",children:L.name}),e.jsx("span",{className:"mt",children:w.meta(L)})]},L.name):e.jsxs("div",{className:"tw-row",children:[ye,e.jsx("span",{className:"nm",children:L.name}),e.jsx("span",{className:"mt",children:w.meta(L)})]},L.name)}const xe=ke===L.name;return e.jsxs("div",{children:[e.jsxs("button",{type:"button",className:`tw-row${xe?" open":""}`,"aria-expanded":xe,onClick:()=>ee(xe?null:L.name),children:[ye,e.jsx("span",{className:"nm",children:L.name}),e.jsx("span",{className:"mt",children:w.meta(L)}),e.jsx(it,{})]}),xe&&e.jsx("div",{className:"tw-sub",children:L.trails.map(Q=>e.jsxs("button",{type:"button",onClick:()=>y(Q.id),children:[e.jsx("span",{children:He(Q,E)}),e.jsx("i",{children:Number(Q.km)?`${M(Number(Q.km))} km`:n("pack.wall.place")})]},Q.id))})]},L.name)}),ua=(N,U)=>e.jsxs("div",{className:"tw-row lock",children:[Xe({name:N,iso:U,trails:[]},!0,!0),e.jsx("span",{className:"nm",children:N})]},N),xa=o.iso==="all"&&!!w.logos&&!!w.units,Va=xa?g.filter(N=>N===A||w.items.some(U=>U.iso===N)).map(N=>{var xe;const U=w.items.filter(Q=>Q.iso===N),L=(xe=w.units)==null?void 0:xe[N],ye=L?L.filter(Q=>!U.some(Wa=>Wa.name===Q)):[];return e.jsxs("div",{children:[e.jsxs("div",{className:"tw-cs",children:[e.jsx("img",{src:ea(N),alt:"",loading:"lazy",decoding:"async"}),F(N),e.jsxs("b",{children:[M(U.length),L&&` / ${L.length}`]})]}),L&&e.jsx("div",{className:"tw-prg",children:e.jsx("div",{className:"pk-progress",children:e.jsx("div",{className:"pk-progress__fill",style:oa(U.length/L.length*100)})})}),e.jsxs("div",{className:"tw-ls",children:[ha(U,!0),ye.map(Q=>ua(Q,N))]})]},N)}):null;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"tw-sh",children:[e.jsx("img",{src:w.ic,alt:"",loading:"lazy",decoding:"async"}),e.jsxs("div",{children:[e.jsx("h3",{children:w.title}),e.jsxs("span",{className:"tw-num",children:[he,m&&e.jsxs("small",{children:[" / ",m.length]})]}),ue&&e.jsx("span",{className:"tw-hd2",children:ue})]})]}),m&&e.jsx("div",{className:"tw-prg",children:e.jsx("div",{className:"pk-progress",children:e.jsx("div",{className:"pk-progress__fill",style:oa(B.length/m.length*100)})})}),e.jsxs("div",{className:"tw-fl",children:[e.jsxs("button",{type:"button",className:o.iso==="all"?"on":"",onClick:()=>be({iso:"all",water:"all"}),children:[n("pack.wall.all"),!w.sum&&e.jsx("b",{children:w.items.length})]}),g.map(N=>{const U=w.items.filter(L=>L.iso===N).length;return e.jsxs("button",{type:"button",className:`${o.iso===N?"on":""}${U?"":" zero"}`,onClick:()=>be({iso:N,water:"all"}),"aria-label":F(N),children:[e.jsx("img",{src:ea(N),alt:"",loading:"lazy",decoding:"async"}),!w.sum&&e.jsx("b",{children:U})]},N)})]}),o.cat==="waters"&&e.jsxs("div",{className:"tw-fl sub",children:[e.jsxs("button",{type:"button",className:o.water==="all"?"on":"",onClick:()=>be({water:"all"}),children:[n("pack.wall.allKinds")," ",e.jsx("b",{children:B.length})]}),["pond","reservoir","lake"].map(N=>e.jsxs("button",{type:"button",className:o.water===N?"on":"",onClick:()=>be({water:N}),children:[e.jsx("img",{src:D(`voda-${za[N]}`),alt:"",loading:"lazy",decoding:"async"}),n(`pack.wall.waters.${N}`)," ",e.jsx("b",{children:B.filter(U=>U.water===N).length})]},N))]}),je&&e.jsx("span",{className:"tw-note",children:n("pack.wall.listSoon")}),ve&&e.jsx("button",{type:"button",className:"tw-mark",onClick:()=>me({kind:"mark",mark:ve}),children:n("pack.wall.markTrips")}),Va,!xa&&e.jsxs("div",{className:"tw-ls",children:[ha(J,o.iso!=="all"),O.map(N=>ua(N,o.iso)),!J.length&&!O.length&&e.jsx("p",{className:"tw-none",children:n("pack.wall.nothing")})]})]})},Ae=(o,w)=>{const B=ia(o,S)===w;_(po(o.id,B?Fa(o)?"none":null:w))},le=o=>{const w=C.trim().toLocaleLowerCase(E),B=a.filter(m=>!w||m.name.toLocaleLowerCase(E).includes(w)).sort((m,O)=>m.name.localeCompare(O.name,E)),J=fe[o==="stay"?"stays":"roadtrips"];return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"tw-sh",children:[e.jsx("img",{src:J.ic,alt:"",loading:"lazy",decoding:"async"}),e.jsxs("div",{children:[e.jsx("h3",{children:J.title}),e.jsx("span",{className:"tw-num",children:M(o==="stay"?s.nights:J.items.length)}),o==="stay"&&e.jsx("span",{className:"tw-hd2",children:n("pack.wall.tentNights")})]})]}),e.jsx("input",{className:"pf-field tw-find",type:"search",value:C,onChange:m=>h(m.target.value),placeholder:n("pack.wall.searchTrip"),"aria-label":n("pack.wall.searchTrip")}),e.jsxs("div",{className:"tw-ls",children:[B.map(m=>{const O=ia(m,S),ie=O===o;return e.jsxs("div",{children:[e.jsxs("button",{type:"button",className:`tw-row${ie?" on":""}`,"aria-pressed":ie,onClick:()=>Ae(m,o),children:[e.jsx("span",{className:"nm",children:He(m,E)}),O&&!ie&&e.jsx("img",{className:"tw-oth",src:D(O==="stay"?"stanovacky":"roadtrip"),alt:"",loading:"lazy",decoding:"async"}),Number(m.km)>0&&e.jsxs("span",{className:"mt",children:[M(Number(m.km))," km"]}),e.jsx("span",{className:"tw-tick",children:ie&&e.jsx(st,{})})]}),ie&&o==="stay"&&(()=>{const he=Ua(m,V),ue=je=>c(co(m.id,Math.min(365,Math.max(1,je))));return e.jsxs("div",{className:"tw-nt",children:[e.jsx("span",{children:n("pack.wall.tentNights")}),e.jsx("button",{type:"button",onClick:()=>ue(he-1),"aria-label":"-1",children:e.jsx(lt,{})}),e.jsx("input",{className:"pf-field",type:"number",inputMode:"numeric",min:1,max:365,value:he,onChange:je=>{const ve=parseInt(je.target.value,10);ve>=1&&ue(ve)},"aria-label":n("pack.wall.tentNights")}),e.jsx("button",{type:"button",onClick:()=>ue(he+1),"aria-label":"+1",children:e.jsx(pt,{})})]})})()]},m.id)}),!B.length&&e.jsx("p",{className:"tw-none",children:n("pack.wall.nothing")})]})]})},Te=()=>e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"tw-sh",children:[e.jsx("img",{src:D("krajiny"),alt:"",loading:"lazy",decoding:"async"}),e.jsxs("div",{children:[e.jsx("h3",{children:n("pack.wall.countriesTitle")}),e.jsx("span",{className:"tw-num",children:s.countries.length})]})]}),s.countries.map(({iso:o,trails:w})=>{const B=w.reduce((m,O)=>m+(Number(O.km)||0),0),J=(m,O,ie,he,ue)=>{var ve;const je=(ve=ue==null?void 0:ue[o])==null?void 0:ve.length;return e.jsxs("button",{type:"button",onClick:()=>oe(m,o),children:[e.jsx("img",{src:O,alt:"",loading:"lazy",decoding:"async"}),e.jsxs("b",{children:[ie.filter(Xe=>Xe.iso===o).length,je?`/${je}`:""]}),e.jsx("span",{children:he})]})};return e.jsxs("div",{className:"tw-cc",style:Pe,children:[e.jsxs("h4",{children:[e.jsx("img",{src:ea(o),alt:"",loading:"lazy",decoding:"async"}),F(o),e.jsxs("small",{children:[M(w.length)," · ",M(B)," km"]})]}),e.jsxs("div",{className:"tw-m",children:[J("ranges",D("pohoria"),s.ranges,n("pack.stats.geo.ranges"),Le.ranges),J("parks",D("narodny-park"),s.parks,n("pack.wall.parksShort"),Le.parks),J("peaks",D("vrcholy"),s.peaks,n("pack.wall.peaks")),J("waters",D("jazero"),s.waters,n("pack.stats.geo.waters"))]})]},o)})]}),W=(o,w,B,J,m)=>e.jsxs("button",{type:"button",className:`tw-tile${m?" wide":""}`,style:Pe,onClick:()=>oe(o),children:[e.jsx("img",{src:w,alt:"",loading:"lazy",decoding:"async"}),e.jsxs("span",{children:[e.jsx("span",{className:"tw-num",children:B}),e.jsx("span",{className:"tw-t2",children:J})]}),e.jsx(dt,{})]}),ae=_e.find(o=>o.trips>a.length),pe=((We=[..._e].reverse().find(o=>o.trips<=a.length))==null?void 0:We.trips)??0,Ue=s.ranges[0],Se=e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"tw-xpr",children:[e.jsx("span",{className:"tw-xpl",children:d.level}),e.jsx("span",{className:"pk-progress",children:e.jsx("span",{className:"pk-progress__fill",style:oa(se?d.pct:0)})}),e.jsx("span",{className:"tw-xpl nx",children:d.level+1})]}),e.jsxs("span",{className:"tw-xpt",children:[e.jsx("span",{children:n("pack.stats.pts",{n:d.points})}),e.jsx("span",{children:n("pack.stats.ptsToLevel",{n:d.toNext,level:d.level+1})})]})]}),Ve=Ma(d.level),Ce=La[Ve],qe=()=>e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"tw-lvh",children:[e.jsx("img",{src:Ia(Ve),alt:"",loading:"lazy",decoding:"async"}),e.jsxs("div",{children:[e.jsx("small",{children:n("pack.map.rankPilgrim")}),e.jsx("h3",{children:n("pack.wall.level",{n:d.level})}),e.jsx("i",{style:{background:_a(Ce),color:Ra(Ce)},children:n("pack.wall.levelArea",{area:n(`pack.tier.area.${Ce.key}`),range:Ba(Ce)})})]})]}),e.jsx("div",{className:"tw-xp static",children:Se}),e.jsx("p",{className:"tw-why",children:n("pack.wall.levelWhy")}),e.jsx("div",{className:"tw-sec",children:n("pack.wall.levelBands")}),e.jsx("div",{className:"tw-lvb",children:v})]}),De=s.byKm[0],Me=s.byAscent[0];return e.jsxs("div",{className:"tw-root",children:[e.jsx("style",{children:rt+_o}),e.jsxs("div",{className:"tw-wall",children:[e.jsx(nt,{peaks:s.peaks}),e.jsxs("div",{className:"tw-hud",children:[e.jsxs("button",{type:"button",className:"tw-hudb",onClick:()=>me({kind:"level"}),"aria-label":n("pack.stats.howPointsWork"),children:[e.jsxs("span",{className:"tw-avs",children:[l?e.jsx("img",{className:"tw-av",src:Ke(l,160),alt:""}):e.jsx("span",{className:"tw-av"}),u.slice(0,3).map(o=>e.jsx("img",{className:"tw-av tw-avd",src:Ke(o.photo,120),alt:""},o.id))]}),e.jsxs("span",{className:`tw-who${u.length>1?" tight":""}`,children:[e.jsx("b",{children:r}),e.jsx("small",{children:n("pack.map.rankPilgrim")})]})]}),e.jsx(Bo,{level:d.level,pct:d.pct,onClick:()=>me({kind:"level"}),label:n("pack.stats.howPointsWork")})]}),e.jsx("button",{type:"button",className:"tw-xp",onClick:()=>me({kind:"level"}),"aria-label":n("pack.stats.howPointsWork"),children:Se}),e.jsx("button",{type:"button",className:"tw-skyb",onClick:()=>oe("peaks"),"aria-label":n("pack.wall.peaks")})]}),e.jsxs("div",{className:"tw-strip",children:[e.jsxs("button",{type:"button",className:"pk-stage",onClick:()=>oe("km"),children:[e.jsx("img",{src:D("km-bez"),alt:""}),e.jsx("span",{className:"tw-num",children:e.jsx(de,{n:Math.round(s.km)})}),e.jsx("span",{className:"tw-lbl",children:"km"})]}),e.jsxs("button",{type:"button",className:"pk-stage",onClick:()=>oe("trips"),children:[e.jsx("img",{src:D("vylety-bez"),alt:""}),e.jsx("span",{className:"tw-num",children:e.jsx(de,{n:a.length})}),e.jsx("span",{className:"tw-lbl",children:n("pack.wall.trips")})]}),e.jsxs("button",{type:"button",className:"pk-stage",onClick:()=>me({kind:"countries"}),children:[e.jsx("img",{src:D("krajiny-bez"),alt:""}),e.jsx("span",{className:"tw-num",children:e.jsx(de,{n:s.countries.length})}),e.jsx("span",{className:"tw-lbl",children:n("pack.wall.countries")})]})]}),e.jsx("div",{className:"tw-sec",children:n("pack.wall.total")}),e.jsxs("div",{className:"tw-grid",children:[W("ranges",D("pohoria"),e.jsx(de,{n:s.ranges.length}),n("pack.stats.geo.ranges")),W("parks",D("narodny-park"),e.jsx(de,{n:s.parks.length}),n("pack.stats.geo.parks")),W("peaks",D("vrcholy"),e.jsx(de,{n:s.peaks.length}),n("pack.wall.peaks")),W("waters",D("jazero"),e.jsx(de,{n:s.waters.length}),n("pack.stats.geo.waters")),W("journeys",D("pridane"),e.jsx(de,{n:s.journeys.length}),n("pack.stats.geo.journeys")),W("ascent",D("najvyssi"),`${Ee(s.everest,E)}×`,n("pack.wall.everestTile")),W("stays",D("stanovacky"),e.jsx(de,{n:s.nights}),n("pack.wall.tentNights")),W("roadtrips",D("roadtrip"),e.jsx(de,{n:s.roadtrips.length}),n("pack.wall.roadtrips")),T&&W("chko","/icons/chko/biele-karpaty.png",e.jsx(de,{n:s.chko.length}),"CHKO",!0)]}),s.peaks.length+s.byKm.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"tw-sec",children:n("pack.wall.records")}),e.jsxs("div",{className:"tw-grid",children:[s.peaks[0]&&e.jsxs("button",{type:"button",className:"tw-rec",style:Pe,onClick:()=>oe("peaks"),children:[e.jsx("img",{src:D("najvyssi-lapis"),alt:"",loading:"lazy",decoding:"async"}),e.jsxs("span",{children:[e.jsxs("b",{children:[M(s.peaks[0].value??0)," m"]}),e.jsx("small",{children:s.peaks[0].name})]})]}),De&&e.jsxs("button",{type:"button",className:"tw-rec",style:Pe,onClick:()=>oe("km"),children:[e.jsx("img",{src:D("km-lapis"),alt:"",loading:"lazy",decoding:"async"}),e.jsxs("span",{children:[e.jsxs("b",{children:[M(Number(De.km))," km"]}),e.jsx("small",{children:He(De,E)})]})]}),Me&&e.jsxs("button",{type:"button",className:"tw-rec",style:Pe,onClick:()=>oe("ascent"),children:[e.jsx("img",{src:D("vrcholy-lapis"),alt:"",loading:"lazy",decoding:"async"}),e.jsxs("span",{children:[e.jsxs("b",{children:[M(Be(Me))," m"]}),e.jsx("small",{children:He(Me,E)})]})]}),Ue&&e.jsxs("button",{type:"button",className:"tw-rec",style:Pe,onClick:()=>oe("ranges"),children:[e.jsx("img",{src:D("pohoria-lapis"),alt:"",loading:"lazy",decoding:"async"}),e.jsxs("span",{children:[e.jsxs("b",{children:[Ue.trails.length,"×"]}),e.jsx("small",{children:Ue.name})]})]})]})]}),k.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"tw-sec",children:n("pack.wall.dogs")}),k.map(o=>e.jsxs("div",{className:"tw-dog",style:Pe,children:[o.photo?e.jsx("img",{src:Ke(o.photo,96),alt:"",loading:"lazy",decoding:"async"}):e.jsx("span",{className:"tw-av",style:{width:48,height:48}}),e.jsxs("div",{children:[e.jsx("b",{children:o.name}),e.jsx("small",{children:n("pack.wall.dogLine",{trips:M(o.trips),km:M(o.km)})})]})]},o.id))]}),e.jsxs("div",{className:"tw-badges",children:[ae&&e.jsxs("div",{className:"tw-next",children:[e.jsx("div",{className:"pk-progress",children:e.jsx("div",{className:"pk-progress__fill",style:oa((a.length-pe)/(ae.trips-pe)*100)})}),e.jsx("span",{children:n("pack.wall.nextBadge",{name:ae.name,n:ae.trips-a.length})})]}),e.jsx(Wo,{walkedCount:a.length})]}),Y&&e.jsx(ma,{onClose:$e,label:Y.kind==="cat"?fe[Y.cat].title:Y.kind==="mark"?n("pack.wall.markTrips"):Y.kind==="countries"?n("pack.wall.countriesTitle"):n("pack.stats.howPointsWork"),children:Y.kind==="cat"?re(Y):Y.kind==="mark"?le(Y.mark):Y.kind==="countries"?Te():qe()})]})}const t=te,ne=t.cardEdge,Re=t.ink,p=Aa;function mt(a,r){if(r&&r.trim())return r.trim().split(" ")[0];if(!a)return"Dogyptian";const u=(a.split("@")[0]||"").split("+")[0].replace(/[._-]/g," ").replace(/\d+/g,"").trim();return u?u.charAt(0).toUpperCase()+u.slice(1):"Dogyptian"}const ht="#37B26A",ut="#E8B22E",Na=Oe.green,xt="#7A5410",qt=`
.tl-flat .tl-panel{background:none;border:0;border-radius:0;box-shadow:none;padding:0;margin-top:${K.xl}px;}
.tl-flat .tl-panel + .tl-panel{margin-top:${K.xxl}px;}
.tl-flat .tl-tabs{background:${Ea(Aa.edge,.14)};border:1px solid ${te.hairline};border-radius:${I.pill}px;padding:${K.xs}px;gap:${K.xs}px;margin-top:${K.lg}px;}
.tl-flat .tl-tab{border:0;border-radius:${I.pill}px;padding:${K.xs}px ${K.sm}px;background:none;box-shadow:none;}
.tl-flat .tl-tab:hover{transform:none;box-shadow:none;}
.tl-flat .tl-tab-label{font-size:${f.label}px;gap:${K.sm}px;}
.tl-flat .tl-tab-art{height:40px;width:auto;flex:none;}
@media (max-width:389px){ .tl-flat .tl-tab-art{height:32px;} }
.tl-flat .tl-tab.on{background:${z.grad};box-shadow:${Ne};}
.tl-flat .tl-tab.on:hover{background:${z.gradHover};box-shadow:${Ne};}
.tl-flat .comm-vhead{background:none;border:0;border-radius:0;box-shadow:none;padding:${K.sm}px 0 ${K.lg}px;}
.tl-flat .comm-cat,.tl-flat .comm-drop{background:none;border:0;border-radius:0;box-shadow:none;border-top:1px solid ${te.border};padding:${K.xl}px 0 0;margin:${K.xl}px 0 0;}
.tl-flat .comm-cat--click:hover,.tl-flat .comm-drop:hover{background:none;border-top-color:${te.border};}
`,Xt=`${Ja}
${qa}
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
/* UKOTVENÉ (Matej 1. 11. 2026: „obsah v bloku celý pláva… vidím scrolling za blokom"). Blok sa hýbe len zvisle a na konci sa neťahá,
   závoj gesto nepustí ďalej a rolovanie pod ním na dotyku stojí. Mesiac ako natívny vstup na iPhone by inak mohol rozšíriť stĺpec. */
.comm-overlay{z-index:1200;padding:${Xa};touch-action:none;}
.comm-modal{width:100%;max-width:420px;max-height:${Qa};overflow-x:hidden;overflow-y:auto;overscroll-behavior:none;touch-action:pan-y;background:${t.panelGrad};border:1.5px solid ${t.cardEdge};border-radius:14px;box-shadow:${t.panelShadow};padding:24px;}
/* Platí aj pre POPUP v appke (WalkedSheet), nie len pre starý modal — tam pole mesiaca pretekalo doprava (Matej 11. 11. 2026).
   Natívne pole mesiaca má na iPhone vlastnú minimálnu šírku, ktorú width:100% neprebije; appearance:none ju zruší, výber ostáva. */
.comm-walked-grid > *{min-width:0;}
.comm-input[type="month"]{display:block;max-width:100%;-webkit-appearance:none;appearance:none;text-align:left;}
.comm-input[type="month"]::-webkit-date-and-time-value{text-align:left;}
@media (hover:none){body.comm-modal-open [data-retap-top]{overflow:hidden;}}
.comm-modal.wide{max-width:640px;}
/* Matej 2026-08-06 („konsolidujeme zjednodušujeme"): nadpis je CENTROVANÝ a nesie priamo názov
   tripu — dvojica „OHODNOŤ A ZÍSKAJ BODY" + podnadpis s názvom bola dva riadky na to isté.
   ⚠️ BOČNÝ PADDING 0 40px ZANIKOL SPOLU S KRÍŽIKOM (2026-09-01). Držal dlhý názov mimo
   tlačidla, ktoré tam už nie je — panel podľa locku z 28. 8. krížik nemá (von sa ide klikom
   mimo alebo Esc), takže by rezerva len zbytočne zužovala nadpis. */
.comm-modal-head{position:relative;display:flex;align-items:flex-start;justify-content:center;gap:12px;margin-bottom:18px;}
.comm-modal-title{font-family:${H};font-weight:700;font-size:16px;color:${p.ink};line-height:1.25;text-align:center;}
.comm-modal-sub{font-size:12px;color:${p.dim};margin-top:4px;text-align:center;}
.comm-field{margin-bottom:18px;}
.comm-label{display:block;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:${p.deep};margin-bottom:9px;}
.comm-hint{margin:4px 0 0;font-family:${x};font-size:12px;color:${p.deep};opacity:.7;}

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
.comm-reward{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;padding:16px 16px;border-radius:12px;background:${t.panelGrad};border:1px solid ${t.cardEdge};box-shadow:${G.lift};}
.comm-reward-eyebrow{font-family:${x};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${t.cardEdge};}
.comm-reward-row{display:flex;align-items:center;gap:11px;min-width:0;}
.comm-reward-txt{font-family:${x};font-weight:600;font-size:12px;color:${t.inkStrong};min-width:0;overflow:hidden;text-overflow:ellipsis;}
/* Bonusový riadok je „objav" — meno jednotky nesie väčšiu váhu než druh objavenia.
   Na papyruse ide inkoust, nie svetlý text; druh objavenia ostáva zlatý (drží aj na bledom). */
.comm-reward-row--bonus .comm-reward-txt{color:${t.inkStrong};}
/* ROZPAD ZÁKLADU — odsadený POD pilulku, nie vedľa nej: je to vysvetlivka k číslu nad ním,
   nie ďalšia odmena. Preto žiadne pilulky, len holé čísla v tlmenom inkouste — inak by
   „5 · 11 · 10" vyzeralo ako tri ďalšie výplaty popri +26. */
/* ⚠️ zvislá čiara NESMIE byť T.rule — ten je gradient, a border:2px solid <gradient> je
   neplatné CSS, ktoré prehliadač ticho zahodí (čiara by zmizla bez chyby). Preto vyblednutá
   zlatá ako plná farba. */
.comm-reward-break{display:flex;flex-direction:column;gap:3px;margin:-4px 0 0 8px;padding-left:12px;border-left:2px solid ${t.border};}
.comm-reward-breakrow{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${x};font-weight:500;font-size:10px;color:${t.inkWarm};}
.comm-reward-breakrow b{font-weight:600;color:${t.inkStrong};font-variant-numeric:tabular-nums;white-space:nowrap;}
.comm-reward-unit{font-family:${x};font-weight:600;}
.comm-reward-kind{display:block;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${t.cardEdge};margin-top:2px;}
/* deliaca čiara vnútri bledej karty = zlatá, vyblednutá do strán (lock z Entry.tsx),
   NIE šedý hairline. Oddeľuje „čo už padlo" od „čo ešte môžeš získať". */
.comm-reward-rule{height:2px;border:0;margin:2px 0 0;background:${t.rule};}
.comm-reward-next{display:flex;align-items:center;gap:10px;min-width:0;}
.comm-reward-nexttxt{font-family:${x};font-weight:500;font-size:12px;line-height:1.35;color:${t.inkWarm};min-width:0;}

/* WalkedPopup 2-stĺpcový layout (Matej 2026-07-23 — širší popup, zmestí sa na výšku bez rolovania) */
.comm-walked-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px;}
@media (max-width:560px){ .comm-walked-grid{grid-template-columns:1fr;} }

/* segmented choice (difficulty / crowd) — VÝBER = PRIESVITNÝ LAPISOVÝ TINT (lock 2026-08-26).
   Plná farebná plocha je vyhradená jedinému hlavnému CTA panela (ODOSLAŤ). */
.comm-seg{display:flex;gap:8px;}
.comm-seg button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 8px;border-radius:8px;border:1px solid ${p.border};background:${p.soft};color:${p.ink};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-seg button:hover{border-color:${t.cardEdge};background:${t.card};}
.comm-seg button.on{${Ye(z.edge,Oe.lapis,.14)}font-weight:600;}

/* ⚠️ 16 px = strop proti iOS zoomu dokumentu (feedback_dogypt_form_input_recurring_bugs).
   Týka sa aj poľa „kto bol so mnou" v pridávaní výletu — pri 13 px sa pri kliknutí do neho
   priblížil celý dokument a spodné ovládanie mapy vypadlo mimo obrazovky. */
/* Písacie pole = .pf-field--flat recept: PLOCHÁ papyrusová výplň, jeden zlatý rám, tmavý
   inkoust. Priesvitná biela (starý recept) na svetlom podklade nekreslí nič.
   Zaostrenie je LAPIS — je to moja akcia, nie konštrukcia. */
.comm-textarea,.comm-input,.comm-selectinput{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:${p.field};border:1px solid ${p.border};border-radius:8px;padding:8px 12px;color:${p.ink};font-family:inherit;font-size:16px;outline:0;resize:vertical;color-scheme:light;}
.comm-textarea:focus,.comm-input:focus,.comm-selectinput:focus{border-color:${z.edge};box-shadow:0 0 0 3px ${z.halo};}
.comm-textarea{min-height:66px;}

/* HLAVNÉ CTA PANELA = LAPIS (brandový kánon 2026-08-28). Geometria (radius 8) je z locku
   .btn-gold — zmena farby nie je povolenie na iný tvar. */
.comm-submit{width:100%;font-family:${H};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${z.grad};color:${z.ink};border:1px solid ${z.deep};box-shadow:${Ne};cursor:pointer;}
.comm-submit:hover:not(:disabled){background:${z.gradHover};}
/* ⚠️ NEDOSTUPNÉ CTA SA NA PAPYRUSE NEROBÍ KRYTÍM. opacity:.4 na plnom lapise dá levanduľovú
   škvrnu, na ktorej zlaté písmo zmizne — svetlý podklad zabíja všetko postavené na
   priesvitnosti. Vypnuté tlačidlo je preto plochý papyrus s tlmeným inkoustom: vidno, že
   je vypnuté, a vidno, čo je na ňom napísané.
   → [[feedback_svetly_povrch_zabija_priesvitnost]] */
.comm-submit:disabled{background:rgba(42,22,8,0.06);border-color:${p.hair};color:${p.faint};box-shadow:none;cursor:default;}
/* „Teraz nie" je rovnocenná ponuka, nie akcia — papyrusový outline, nie druhá plná farba. */
.comm-ghostbtn{width:100%;margin-top:9px;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${p.soft};color:${p.ink};border:1px solid ${p.border};cursor:pointer;}
.comm-ghostbtn:hover{border-color:${t.cardEdge};color:${p.deep};background:${t.card};}


/* multi-select chips (hazards, atď.) — hrozba je červená, lebo červená TU nesie význam
   (nie je to voľba farby): označený hazard je varovanie pre ostatných. */
.comm-chips{display:flex;flex-wrap:wrap;gap:7px;}
.comm-chip{padding:8px 12px;border-radius:999px;border:1px solid ${p.border};background:${p.soft};color:${p.ink};font-family:inherit;font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.comm-chip:hover{border-color:${t.cardEdge};background:${t.card};}
/* Matej 11. 11. 2026: „kliknutie na nástrahy by mali vyfarbiť celé tlačidlo viac na červeno". Plná červená, nie tint — je to varovanie. */
.comm-chip.on{background:${t.alertRed};border-color:${t.alertRed};color:#fff;font-weight:600;}


/* ── crowd meta (agregát na karte + inline detaile) ── */
.comm-crowd{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.comm-crowd.detail{gap:6px;}
.comm-crowd-rating{display:inline-flex;align-items:center;gap:5px;font-family:${x};font-weight:600;color:${ne};}
.comm-crowd-row{display:inline-flex;align-items:center;gap:5px;color:rgba(245,240,228,0.6);white-space:nowrap;}
.comm-crowd-count{font-size:10px;color:${t.onDarkDim};font-style:italic;white-space:nowrap;}
.comm-crowd-seed{font-size:10px;color:${ne};opacity:.7;letter-spacing:0.02em;text-transform:uppercase;}

/* ── BigRating (Matej 2026-07-22): pravý stĺpec karty/detailu = LEN 1 packa + veľké číslo X.Y,
   ostatné (náročnosť/popularita/hazard) sa presunuli na fotku ako PhotoMetaPills. ── */
/* Rad sa zalomí, keď je stĺpec úzky — päť packiek s číslom a zátvorkou je širšie než jedna
   ikonka, ktorá tu stála predtým. Zarovnanie doprava drží celý blok pri hrane karty. */
.comm-bigrating{display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:4px 7px;}
.comm-bigrating b{font-family:${x};font-weight:600;font-size:24px;color:${ne};line-height:1;}
/* Počet hlasov je poznámka k číslu, nie druhé číslo — najmenší stupeň, bez kurzívy navyše. */
.comm-bigrating i{font-style:normal;font-family:${x};font-weight:500;font-size:10px;color:${t.onDarkDim};line-height:1;}
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
.comm-mpill{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,0.6);border:1px solid ${t.onDarkBorder};color:#fff;font-family:${x};font-weight:600;font-size:10px;letter-spacing:.02em;padding:4px 8px;border-radius:999px;white-space:nowrap;}
/* hazard chip (len v detaile, vedľa tagov) — červený, % = koľko členov nahlásilo. */
.comm-hazardtag{display:inline-flex;align-items:center;gap:5px;background:rgba(178,38,30,0.16);border:1px solid ${t.alertRed};color:#E0796D;font-size:10px;font-weight:600;padding:4px 8px;border-radius:999px;white-space:nowrap;}

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
.comm-hastip::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 7px);right:0;background:${t.panelGrad};border:1.5px solid ${t.cardEdge};color:${Re};font-family:${x};font-size:10px;font-weight:600;padding:4px 8px;border-radius:8px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:${t.panelShadow};z-index:20;}
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
.comm-vhead{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;background:${t.panelGrad};border:1px solid ${t.cardEdge};border-radius:12px;box-shadow:${G.lift};padding:16px 16px;margin-bottom:22px;}
.comm-vhead-pack{display:flex;align-items:center;flex-shrink:0;}
/* prstenec okolo avatara = farba PODKLADU, nie čierna stránka — na papyruse by čierny krúžok
   vyzeral ako dier(k)a. T.card je plná papyrusová, T.cardGrad by sa v box-shadow nedal použiť. */
.comm-vavatar{width:72px;height:72px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid ${t.cardEdge};box-shadow:0 0 0 3px ${t.card};background:rgba(201,154,63,0.12);margin-left:-16px;}
.comm-vhead-pack .comm-vavatar:first-child{margin-left:0;}
.comm-vavatar img{width:100%;height:100%;object-fit:cover;display:block;}
.comm-vavatar img.comm-vavatar-fallback{width:24px;height:24px;object-fit:contain;filter:none;opacity:.6;}
.comm-vavatar--owner{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);font-family:${x};font-weight:600;font-size:16px;color:${Re};}
/* .comm-vavatar--slot (prerušovaný „+" krúžok = priestor pre budúceho member, Matej 23. 7.)
   ZMAZANÝ 2026-08-05 — Matej: „to plus daj preč tu sa psy nebudú pridávať". */
/* MENO + PILULKA V JEDNOM RADE (Matej 2026-08-06: „pils dajme vedla nie pod"). Meno berie
   zvyšok šírky, pilulka sa nezmenší; "padding-right" drží text mimo info tlačidla v rohu. */
.comm-vhead-id{display:flex;align-items:center;justify-content:center;gap:12px;}
/* Hlavička je od 26. 10. 2026 stĺpec na osi — pás levelu musí ostať cez celú šírku. */
.comm-vhead .comm-lvlwrap{align-self:stretch;text-align:left;}
/* vlajky precestovaných krajín — trofej, ktorá rastie. Krúžok má vlastný zlatý rám z FlagCircle,
   takže tu ide len o rozostup, klikateľnosť a zvýraznenie práve zvolenej krajiny. */
.comm-vflags{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;}
.comm-vflag{display:inline-flex;padding:0;border:0;background:none;cursor:pointer;border-radius:50%;line-height:0;transition:transform .15s;}
.comm-vflag:hover{transform:translateY(-1px);}
/* zvolená krajina = zlatý prstenec OKOLO krúžku (box-shadow, nie border — border by vlajku
   zmenšil a rad by poskakoval pri každom prepnutí). */
.comm-vflag.on{box-shadow:0 0 0 2px ${t.card},0 0 0 4px ${ne};}

.comm-vhead-name{font-family:${H};font-weight:700;font-size:20px;color:${t.inkStrong};min-width:0;}
/* Výplň, inkoust a rám dodáva tierPillStyle(level) inline — tu ostáva len tvar. Pilulka je
   TLAČIDLO (otvára škálu pásiem), takže potrebuje reset kurzora a rodinu písma. */
.comm-tierwrap{position:relative;display:inline-flex;flex-shrink:0;}
.comm-level-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid ${Je.edge};border-radius:999px;padding:8px 12px;font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:filter .15s;}
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
@media (max-width:560px){
  .comm-vhead{padding:12px 16px;gap:12px;}
  .comm-vhead-name{font-size:16px;}
  .comm-vavatar{width:64px;height:64px;}
  /* ⚠️ NA ÚZKOM OKNE SA POPUP KOTVÍ NA BLOK, NIE NA PILULKU. Pilulka začína ~145 px od ľavého
     okraja, takže popup široký 88vw jej spod pravého okraja vytiekol z obrazovky (bolo to tak
     aj pri pôvodných 340 px — zväčšenie na 520 to len zviditeľnilo). Zrušením position:relative
     na obale sa najbližším ukotveným predkom stáva .comm-vhead a popup dostane šírku bloku. */
  .comm-tierwrap{position:static;}
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
.comm-wstat{background:${t.panelGrad};border:1.5px solid ${t.cardEdge};border-radius:14px;box-shadow:${G.lift};padding:16px 12px 16px;text-align:center;transition:transform .2s ease,box-shadow .2s ease;}
.comm-wstat:hover{transform:translateY(-2px);box-shadow:${G.card};}
/* Dlaždica-tlačidlo (KRAJINY → popup, VÝLETY → zoznam dole, 26. 10. 2026). */
.comm-wstat--btn{font:inherit;color:inherit;cursor:pointer;width:100%;}
.comm-wstat--btn:disabled{cursor:default;}
.comm-wstat--btn:disabled:hover{transform:none;box-shadow:${G.lift};}
.comm-wflags{display:flex;justify-content:center;flex-wrap:wrap;gap:4px;margin-top:8px;font-style:normal;}
/* Riadky popupu KRAJINY — ťuk prepne vysvedčenie na krajinu a doskroluje k nemu. */
.comm-ctrylist{display:flex;flex-direction:column;gap:8px;}
.comm-ctryrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border-radius:12px;border:1px solid ${t.border};background:${t.panelGrad};color:${p.ink};font:inherit;cursor:pointer;text-align:left;}
.comm-ctryrow b{flex:1;min-width:0;font-family:${H};font-weight:700;font-size:16px;} /* písmo: meno */
.comm-ctryrow span{font-family:${x};font-weight:500;font-size:12px;color:${p.dim};white-space:nowrap;}
.comm-ctryrow.on{border-color:${t.cardEdge};background:${t.cardGrad};}
.comm-wstat b{display:block;font-family:${x};font-weight:600;font-size:24px;font-variant-numeric:tabular-nums;color:${p.ink};line-height:1;}
/* ⚠️ NAJVYŠŠÍ BOD JE MENO MIESTA, NIE ČÍSLO — a typografický lock hovorí, že identitu
   (názvy miest) nesie Cinzel, kým dáta nesie Space Grotesk. Do 1. 9. tu stálo meno vrcholu
   v Space Grotesku so zmenšeným písmom cez inline style, takže sa v rade štyroch dlaždíc
   čítalo ako pokazené číslo. */
.comm-wstat--name b{font-family:${H};font-weight:700;font-size:16px;line-height:1.15;letter-spacing:0.02em;}
.comm-wstat span{display:block;font-family:${x};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${t.cardEdge};margin-top:9px;padding-top:8px;position:relative;}
/* krátka zlatá linka nad popiskom — vyblednutá do strán, teda tá istá technika ako T.rule,
   len na 26 px. Border-top by kreslil ostrý predel cez celú šírku dlaždice. */
.comm-wstat span::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:26px;height:2px;background:${t.rule};}
@media (max-width:560px){ .comm-worldstats{grid-template-columns:repeat(2,1fr);} .comm-wstat b{font-size:24px;} }
/* PSIE KM (B20, Matej 17. 9. 2026) — „v tripstats bude aj pes a jeho stats."
   🔒 JE TO DRUHÝ RIADOK, NIE DRUHÝ PÚTNIK. WORLD staty nad tým ostávajú ČLOVEKU
   (pútnik = všetky km so psami) a nič sa im neodoberá; tu stojí, koľko z toho
   prešiel KTORÝ pes. Preto žiadny level, prstenec ani body — dve čísla a meno.
   Úroveň RIADOK (r12, plochá výplň), nie karta: je to položka zoznamu pod
   štyrmi kartami vyššie, nie piata karta. */
.comm-dogstats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;}
.comm-dogstat{display:flex;align-items:center;gap:8px;flex:1 1 220px;background:${t.tileBg};border:1px solid ${t.border};border-radius:12px;padding:8px 12px;}
.comm-dogstat img{width:32px;height:32px;border-radius:999px;object-fit:cover;flex-shrink:0;border:1px solid ${t.cardEdge};}
.comm-dogstat-txt{display:flex;flex-direction:column;min-width:0;}
.comm-dogstat-name{font-family:${H};font-weight:700;font-size:12px;letter-spacing:.02em;color:${p.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.comm-dogstat-num{font-family:${x};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${t.cardEdge};}

.comm-cat{background:${t.panelGrad};border:1px solid ${t.cardEdge};border-radius:12px;box-shadow:${G.lift};padding:16px 16px;margin-bottom:12px;}
/* klikateľná geo kategória → ADD TRIP (Matej 2026-07-23): button reset + hover. */
.comm-cat--click{display:block;width:100%;text-align:left;cursor:pointer;font-family:inherit;transition:border-color .15s;}
.comm-cat--click:hover{border-color:${p.deep};background:${t.card};}
.comm-cat-head{display:flex;align-items:center;gap:10px;margin-bottom:11px;}
/* zbaliteľná hlavička (magistrály) — vyzerá ako ostatné hlavičky kategórií, len je klikacia
   a nesie šípku. "width:100%" + "margin:0" prebíjajú default <button>, aby zavretá kategória
   nemala pod sebou dieru po "margin-bottom". */
.comm-cat-head--btn{width:100%;background:none;border:0;padding:0;font-family:inherit;text-align:left;cursor:pointer;margin-bottom:0;}
.comm-cat-head--btn.on{margin-bottom:11px;}
.comm-cat-head--btn:hover .comm-cat-name{color:${p.deep};}
.comm-cat-head--btn .comm-drop-chev{flex-shrink:0;transition:transform .2s;}
.comm-cat-head--btn.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}
/* ⚠️ .comm-cat-ic ZMAZANÉ 2026-09-01 — Matej: „radšej daj preč ikonky pri blkoch (national
   parks mountain ranges atd…)". Ikonka pred nadpisom nič nerozlišovala (vrstvy, strom, labka,
   pohár, vlnky sa pri sebe čítali ako ozdoba) a v každom bloku pridávala druhý tvar do riadku,
   ktorý má niesť jedno slovo a jedno číslo. c.icon v SK_GEO ostáva — kreslí sa ním MEDAILA
   v kategóriách bez loga (vrcholy, vody). */
.comm-cat-name{font-family:${H};font-weight:700;font-size:12px;color:${p.ink};flex:1;}
.comm-cat-pct{font-family:${x};font-weight:600;font-size:12px;color:${p.deep};}
/* koľajnica pruhu = tmavý inkoust s nízkou alfou (ako .comm-lvlbar). Svetlá koľajnica by
   na papyruse zmizla a pruh by vyzeral, akoby začínal odnikiaľ. */
.comm-cat-bar{height:7px;border-radius:999px;background:rgba(42,22,8,0.14);overflow:hidden;}
.comm-cat-fill{height:100%;border-radius:999px;background:${z.grad};transition:width .4s;}
/* ⚠️ .comm-walkedhead / -n ZMAZANÉ 2026-09-01 — nahradil ich .comm-drop (viditeľný ovládač,
   #46) a od vtedy ich nekreslil nikto. */
.comm-dash-section-title{font-family:${x};font-weight:500;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${p.deep};margin:20px 0 12px;}
/* položka zoznamu = RIADOK (úroveň 3 matrice): plochá výplň, slabší rám. Desať kariet pod
   sebou by z panela spravilo schodisko. */
.comm-walkedrow{display:flex;align-items:center;justify-content:space-between;gap:12px;background:${t.tileBg};border:1px solid ${t.border};border-radius:8px;padding:12px 16px;margin-bottom:9px;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-walkedrow:hover{border-color:${t.cardEdge};background:${t.card};}
.comm-walkedrow-name{font-family:${H};font-weight:700;font-size:12px;color:${p.ink};}
.comm-walkedrow-meta{font-size:10px;color:${p.dim};white-space:nowrap;flex-shrink:0;}
.comm-cat-units{display:flex;flex-wrap:wrap;gap:6px;margin-top:11px;}
.comm-unit{font-size:10px;padding:4px 8px;border-radius:999px;border:1px solid ${p.border};color:${p.dim};background:${p.soft};font-family:inherit;cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.comm-unit:hover{border-color:${t.cardEdge};color:${p.deep};background:${t.card};}
.comm-unit.done{border-color:${t.cardEdge};color:${p.deep};background:rgba(201,154,63,0.18);}
/* per-unit rozklad (Slice A, bod 2): farba podľa počtu prejdených tripov na jednotku.
   ⚠️ Na papyruse ide TMAVÝ inkoust tej istej farby — UNIT_STARTED_COLOR (#E8B22E) aj
   UNIT_DONE_COLOR (#37B26A) sú svetlé odtiene robené na čiernu dosku a na piesku by z nich
   ostal svetlý fliačik. Rám ostáva plnou farbou významu, čitateľnosť nesie inkoust. */
.comm-unit--started{border-color:${ut};color:${xt};background:rgba(232,178,46,0.20);}
.comm-unit--done{border-color:${t.growGreen};color:${Na};background:rgba(61,122,78,0.16);}

/* medaily (parks/chko/peaks/waters) — Matej 2026-07-23 zadanie bod 2: „musia to byť ozaj
   odznaky… na to sa kliknúť nebude dať bude to len medaila". Žiadny bar, žiadny ×N, žiadny klik. */
.comm-cat-count{font-size:10px;color:${p.dim};flex-shrink:0;}
.comm-medals{display:flex;flex-wrap:wrap;gap:14px;margin-top:13px;}
.comm-medal{width:68px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;}
.comm-medal-ic{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.comm-medal-ic img{width:26px;height:26px;}
.comm-medal--on .comm-medal-ic{background:${Je.grad};box-shadow:${G.lift};}
.comm-medal--on .comm-medal-ic img{filter:brightness(0) invert(1);}
/* ⚠️ VRCHOLY A VODY SÚ LAPISOVÉ, NIE ZLATÉ (Matej 1. 9. 2026: „highest peaks a top waters by
   mali byť lapisom nie zlatou").
   Nie je to rozmar: na tejto obrazovke je zlatá naraz rámom bloku, pruhom postupu, chipom
   odškrtnutého pohoria AJ medailou — päť rôznych významov v jednej farbe. Parky a CHKO majú
   vlastné farebné logá, takže odlíšiť sa potrebujú práve tie dve kategórie, ktoré kreslíme
   my. Zlato ostáva na LEME — lapis so zlatým prstencom je pôvodná egyptská dvojica, holý
   modrý kruh by na papyruse stál mimo brandu. */
.comm-medal--on.comm-medal--lapis .comm-medal-ic{background:${z.grad};box-shadow:${Ne};}
/* nezískaná medaila = zapustené miesto v papyruse, nie svetlá škvrna: tmavý inkoust s nízkou
   alfou a ČIERNA maska ikonky. invert(1) ju robilo bielou — správne na čiernej doske, na
   piesku prázdne miesto. */
.comm-medal--off .comm-medal-ic{background:rgba(42,22,8,0.07);border:1px solid ${p.border};}
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
.comm-medal-ic--disc{background:#FBF9F4;border-radius:50%;padding:8px;box-shadow:${G.lift};}
.comm-medal-ic--disc img{filter:none;opacity:1;}
.comm-medal--off .comm-medal-ic--disc{background:#D6D1C4;}
.comm-medal--off .comm-medal-ic--disc img{filter:grayscale(.45);opacity:.92;}
/* voľný per-park hook na zväčšenie tenkých log (aktuálne prázdny — Pieniny rieši disc). */
.comm-medal-ic--big img{transform:scale(1.22);}
.comm-medal-name{font-size:10px;line-height:1.25;color:${p.ink};}
.comm-medal--off .comm-medal-name{color:${p.dim};opacity:.7;}
.comm-unit-drop{margin-top:10px;padding-top:8px;border-top:1px solid ${p.hair};}
.comm-unit-empty{text-align:center;font-size:10px;color:${p.dim};padding:4px 0 8px;font-style:italic;}
.comm-unit-addrow{text-align:center;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;color:${p.deep};padding:8px;border-radius:8px;border:1px dashed ${t.border};cursor:pointer;transition:border-color .15s,background .15s;}
.comm-unit-addrow:hover{border-color:${t.cardEdge};background:rgba(201,154,63,0.14);}

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
.comm-hero-trips{font-family:${x};font-weight:600;font-size:10px;color:${p.dim};}
.comm-hero--on .comm-hero-trips{color:${p.deep};}
@keyframes comm-hero-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
@media (prefers-reduced-motion:reduce){.comm-hero--on img{animation:none;}.comm-hero--on:hover img{transform:none;}}

/* REVEAL overlay — „milestone reached" moment (Matej 2026-07-24, upresnenie 2026-07-24 = horizontálny
   card layout), portál do document.body (rodičovský .pk-glass má backdrop-filter → containing block
   by ukotvil position:fixed o panel, nie o viewport). Backdrop klik = dismiss; klik NA card = nič. */
/* Závoj ostáva tmavý — je to okamih, keď má obrazovka stíchnuť a svietiť má len odznak.
   Karta pod ním je PANEL (úroveň 4 matrice): papyrus, 1.5px zlatý rám, panelShadow. */
/* 26. 10. 2026: obal je POPUP (PackPopup) — závoj, šuplík, úchyt a rolovanie nesie on.
   Karta je už len ROZLOŽENIE vnútri; rolovanie má celé telo popupu, nie stĺpec s príbehom. */
.comm-reveal-card{display:flex;gap:28px;align-items:center;padding:8px 0 0;}
.comm-reveal-left{flex:0 0 210px;display:flex;flex-direction:column;align-items:center;gap:12px;}
.comm-reveal-badge{width:210px;max-width:44vw;filter:drop-shadow(0 0 14px rgba(201,154,63,.45)) drop-shadow(0 10px 20px rgba(90,62,20,.40));}
.comm-reveal-trips{font-family:${x};font-weight:600;font-size:12px;color:${p.deep};letter-spacing:0.14em;text-transform:uppercase;}
.comm-reveal-right{flex:1;min-width:0;text-align:left;}
/* Eyebrow na papyruse = zlatá (T.cardEdge), telo textu plný inkoust s tichším krytím —
   inkWarm je na popisky a odsek v ňom sa číta ako poznámka pod čiarou. */
.comm-reveal-kicker{font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.22em;color:${t.cardEdge};text-transform:uppercase;}
.comm-reveal-name{font-family:${H};font-weight:700;font-size:24px;color:${p.ink};margin-top:6px;line-height:1.05;}
.comm-reveal-story{font-size:14px;line-height:1.65;color:rgba(42,22,8,0.86);margin-top:14px;}
/* ⚠️ .comm-reveal-x ZMAZANÉ 2026-09-01 — panel podľa locku z 28. 8. krížik nemá, von sa ide
   klikom na závoj alebo Esc (obidve rieši HeroBadges.tsx). */
.comm-reveal-badge--off{filter:grayscale(1) brightness(.94) contrast(1.06) drop-shadow(0 10px 20px rgba(90,62,20,.30));}
.comm-reveal-kicker--locked{color:${p.dim};}
.comm-reveal-source{display:inline-block;margin-top:16px;font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.02em;color:${p.deep};text-decoration:none;border-bottom:1px solid ${t.border};padding-bottom:4px;}
.comm-reveal-source:hover{border-bottom-color:${t.cardEdge};}
.comm-reveal-source-label{font-family:inherit;font-weight:400;font-size:10px;color:${p.dim};letter-spacing:0;}
@media (max-width:600px){
  .comm-reveal-card{flex-direction:column;gap:16px;text-align:center;}
  .comm-reveal-left{flex:none;}
  .comm-reveal-badge{width:150px;}
  .comm-reveal-right{text-align:center;}
  .comm-reveal-name{font-size:24px;}
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
.comm-plan{background:${t.cardGrad};border:1.5px solid ${t.cardEdge};border-radius:16px;box-shadow:${G.lift};padding:16px 16px;margin-bottom:12px;}
/* Fotka a štítok na nej ostávajú TMAVÉ — podklad je snímka, nie papyrus, presne ako
   .trp-bigcard-photoactbtn. Radius je o hrúbku rámu menší (16 − 1.5), inak fotka vyčnieva
   z oblúka karty. */
.comm-plan-photo{position:relative;margin:-15px -17px 13px;height:150px;background-size:cover;background-position:center;border-radius:14px 15px 0 0;cursor:pointer;}
.comm-plan-planned{position:absolute;left:12px;bottom:10px;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:#F5C73D;background:rgba(0,0,0,0.5);padding:4px 8px;border-radius:8px;border:1px solid ${t.border};}
.comm-plan-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
/* NEUTRÁLNY typový štítok (výlet). Protipól je zlatý .pev-typechip (podujatie) v
   events/EventCard.tsx — dvojica sa musí líšiť farbou, nielen textom. Na papyruse je
   z toho holý obrys proti teplej zlatej výplni.
   ⚠️ Zlatá ${t.cardEdge} ako PÍSMO má na piesku ~1.9:1, takže zvýraznenie nesie tmavšia
   P.deep — tá istá hodnota, akou svieti zvýraznený stav v celom bledom skine mapy. */
.comm-plan-type{display:inline-block;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid ${p.border};color:${p.dim};margin-bottom:5px;}
.comm-plan-name{font-family:${H};font-weight:700;font-size:14px;color:${p.ink};}
.comm-plan-meta{font-size:12px;color:${p.dim};margin-top:3px;}
.comm-plan-people{display:flex;flex-direction:column;gap:7px;margin-top:12px;padding-top:12px;border-top:1px solid ${p.hair};}
.comm-person{display:flex;align-items:center;gap:9px;}
/* Zlatý krúžok s tmavým písmenom drží aj na papyruse — je to plocha, nie písmo. */
.comm-person-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${x};font-weight:600;font-size:12px;color:${Re};}
.comm-person-txt{flex:1;min-width:0;font-size:12px;color:${p.ink};}
.comm-person-txt b{color:${p.ink};}
.comm-person-txt span{color:${p.dim};}
.comm-buddytoggle{font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 0;background:none;border:none;color:${p.deep};cursor:pointer;}
.comm-msgbtn{flex-shrink:0;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 12px;border-radius:999px;background:${p.soft};border:1px solid ${p.border};color:${p.ink};cursor:pointer;}
.comm-msgbtn:hover{border-color:${t.cardEdge};color:${p.deep};background:${p.hot};}
/* JOIN = HLAVNÉ CTA karty ⇒ LAPIS, radius 8 (brandový kánon 28. 8.). Tá istá dvojica,
   akú dostali JOIN a SAVE DATE v tripliste 1. 9. Pilulkový tvar zaniká: geometriu nesie
   lock .btn-gold, lapis mení len výplň. */
.comm-joinbtn{flex-shrink:0;font-family:${H};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:${z.grad};color:${z.ink};border:1px solid ${z.deep};box-shadow:${Ne};cursor:pointer;}
.comm-joinbtn:hover{background:${z.gradHover};}
/* „Going" nie je akcia, je to STAV — zelený tint, rovnako ako prejdený výlet v článku.
   Plná zelená by na karte stála druhá plná farba vedľa lapisu a ani jedna by neviedla. */
.comm-joinbtn.joined{${Ye(t.growGreen,Oe.green)}box-shadow:none;}
/* Vypnuté CTA = PLOCHÝ PAPYRUS, nie opacity — krytie na svetlom podklade dá levanduľovú
   škvrnu a písmo z nej zmizne (zistené pri tripliste 1. 9.). */
.comm-joinbtn.closed{background:${p.soft};color:${p.faint};border-color:${p.hair};box-shadow:none;cursor:default;}
.comm-lockbtn{flex-shrink:0;font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:none;border:1px solid ${p.border};color:${p.dim};cursor:pointer;}
.comm-lockbtn:hover{border-color:${t.cardEdge};color:${p.deep};}
.comm-lockbtn.on{border-color:${p.deep};color:${p.deep};background:${p.hot};}
.comm-empty{text-align:center;padding:32px 16px;color:${p.dim};font-size:12px;font-style:italic;}
/* #55 — prázdny stav = JEDNA veta faktu + JEDNA akcia. Bez tlačidla je to slepá ulička:
   po zmazaní fabrikovaných dát (2026-08-03) je toto prvé, čo nový člen v paneli uvidí. */
.comm-emptybox{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 16px;text-align:center;}
.comm-emptybox p{margin:0;color:${p.dim};font-size:12px;font-style:italic;line-height:1.5;}
/* jediná akcia prázdneho stavu = hlavné CTA ⇒ LAPIS (kánon 2026-08-28). Radius 8 ostáva
   z locku .btn-gold — mení sa výplň, nie tvar. */
.comm-emptybtn{font-family:${H};font-weight:700;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 16px;border-radius:8px;border:1px solid ${z.deep};background:${z.grad};color:${z.ink};box-shadow:${Ne};cursor:pointer;}
.comm-emptybtn:hover{background:${z.gradHover};}
/* #41 — úprimná veta namiesto fabrikovaného člena/prázdneho bloku (issue #41, ČASŤ 2) */
.comm-buddynote{font-size:10px;color:${p.dim};font-style:italic;padding:8px 0 4px;}

/* ── CompanionPicker (Matej 2026-07-23): „kto bol so mnou" — svorka (moje psy s fotkami) +
   iní členovia podľa mena. Vybraté = avatar chipy s ×. ── */
.comm-comp-selected{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:11px;}
.comm-comp-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(201,154,63,0.12);border:1px solid ${te.border};border-radius:999px;padding:4px 12px 4px 4px;}
.comm-comp-chip-av{width:26px;height:26px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-family:${x};font-weight:600;font-size:10px;color:${Re};}
.comm-comp-chip-av.ph{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}
.comm-comp-chip b{font-size:12px;color:${t.onDark};font-weight:600;}
.comm-comp-chip button{background:none;border:none;color:${t.onDarkDim};font-size:14px;line-height:1;cursor:pointer;padding:0 4px;}
.comm-comp-chip button:hover{color:${ne};}
.comm-comp-grouplabel{font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:${t.onDarkDim};margin:2px 0 7px;font-family:${x};font-weight:600;}
.comm-comp-pack{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
.comm-comp-dog{display:inline-flex;align-items:center;gap:8px;background:rgba(245,240,228,0.05);border:1px solid ${t.onDarkBorder};border-radius:999px;padding:4px 12px 4px 4px;cursor:pointer;transition:all .15s;}
.comm-comp-dog:hover{border-color:${ne};}
.comm-comp-dog.on{background:rgba(201,154,63,0.16);border-color:${ne};}
.comm-comp-dog-av{width:28px;height:28px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;background-color:rgba(245,240,228,0.1);display:flex;align-items:center;justify-content:center;font-family:${x};font-weight:600;font-size:12px;color:${Re};}
.comm-comp-dog-av.ph{background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);}
.comm-comp-dog span{font-size:12px;color:${t.onDark};}
.comm-comp-dog .plus{margin-left:2px;color:${ne};font-size:14px;font-weight:600;line-height:1;}
/* ⚠️ VYBRATÝ PES SVIETI NAZELENO, NIE NAZLATO (Matej 2026-08-25: „musí tam svietiť hlavy
   psov a po kliknutí sa zazelenajú"). Zlatá na tejto obrazovke znamená „tu si" a nesie ju
   postup krokov; zelená znamená HOTOVO — tá istá, akou svieti dokončený krok v číselníku
   a splnená značka na trase (GROUP_TINT.comment). Jeden význam, jedna farba. */
.comm-comp-dog.on{background:rgba(58,150,88,0.18);border-color:#3A9658;}
.comm-comp-dog.on .comm-comp-dog-av{box-shadow:0 0 0 2px ${t.growGreen};}
/* Zbalené + pred otvorením poľa s menami. Nie zlaté CTA — je to rozbalenie, nie akcia kroku. */
.comm-comp-openothers{display:flex;align-items:center;gap:9px;width:100%;padding:8px 12px;margin-top:10px;border-radius:8px;background:rgba(245,240,228,0.04);border:1px dashed ${t.onDarkBorder};color:${t.onDarkDim};font-family:${x};font-size:12px;cursor:pointer;}
.comm-comp-openothers:hover{border-color:${ne};color:${t.onDark};}
.comm-comp-openplus{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:rgba(201,154,63,0.16);color:${ne};font-size:14px;line-height:1;}
.comm-comp-searchwrap{position:relative;}
.comm-comp-searchrow{display:flex;gap:8px;align-items:stretch;}
.comm-comp-searchrow .comm-input{flex:1 1 auto;min-width:0;}
/* Štvorec vedľa poľa, nie zlaté CTA: zlatá je vyhradená hlavnej akcii obrazovky a tou je
   ĎALEJ dole. Toto je pomocné potvrdenie jedného poľa. */
.comm-comp-addbtn{flex:0 0 auto;width:44px;border-radius:8px;background:rgba(201,154,63,0.14);border:1px solid ${t.onDarkBorder};color:${t.onDark};font-family:${x};font-size:20px;line-height:1;cursor:pointer;padding:0;}
.comm-comp-addbtn:disabled{opacity:.38;cursor:default;}
.comm-comp-addbtn:not(:disabled):hover{border-color:${ne};}
.comm-comp-sug{position:absolute;top:calc(100% + 6px);left:0;right:0;background:rgba(6,5,3,0.96);border:1px solid ${t.onDarkBorder};border-radius:12px;overflow:hidden;box-shadow:${G.panel};z-index:30;max-height:210px;overflow-y:auto;}
.comm-comp-sugitem{display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid ${t.onDarkHair};}
.comm-comp-sugitem:last-child{border-bottom:0;}
.comm-comp-sugitem:hover{background:rgba(201,154,63,0.14);}
.comm-comp-sugitem-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${x};font-weight:600;font-size:12px;color:${Re};}
.comm-comp-sugitem-tx{font-size:12px;color:${t.onDark};}
.comm-comp-sugitem-tx span{color:${t.onDarkDim};font-size:10px;}

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
.comm-lvlfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;font-family:${x};font-weight:500;font-size:10px;color:${t.inkWarm};}
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
.comm-pts-col + .comm-pts-col{padding-left:16px;border-left:1.5px solid ${te.border};}
@media (max-width:560px){
  .comm-pts-cols{grid-template-columns:1fr;gap:12px;}
  .comm-pts-col + .comm-pts-col{padding-left:0;border-left:0;padding-top:12px;border-top:1.5px solid ${te.border};}
}
.comm-pts-eyebrow{display:block;font-family:${x};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${t.cardEdge};margin-bottom:9px;}
.comm-pts-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${x};font-weight:500;font-size:10px;color:${t.inkWarm};padding:4px 0;}
.comm-pts-row b{font-weight:600;color:${t.inkStrong};white-space:nowrap;font-variant-numeric:tabular-nums;}
.comm-pts-rule{display:block;height:2px;margin:10px 0;background:${t.rule};}
.comm-pts-tot{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-family:${x};font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.02em;color:${t.inkStrong};}
/* prázdny pravý stĺpec — nový člen nemá ani bod, a prázdna polovica bez vysvetlenia vyzerá
   ako chyba renderu. */
.comm-pts-none{font-family:${x};font-weight:500;font-size:10px;font-style:italic;line-height:1.5;color:${t.inkWarm};}
/* jednoveté vysvetlenie pod nadpisom sekcie (ranky krajiny) — menšie a kurzívou, aby sa
   nečítalo ako ďalšia položka zoznamu s chýbajúcim číslom vpravo. */
.comm-pts-note{display:block;font-family:${x};font-weight:500;font-size:10px;font-style:italic;line-height:1.45;color:${t.inkWarm};margin:-4px 0 7px;}

/* countries — VŠETKY štáty s vlajkou, aj tie bez výletu (#46) */
.comm-ctrys{display:flex;gap:8px;overflow-x:auto;padding:4px 0 8px;margin-bottom:14px;-webkit-overflow-scrolling:touch;}
/* VYBRANÁ KRAJINA = PRIESVITNÝ LAPISOVÝ TINT (lock 2026-08-26) — je to moja voľba, čo
   chcem vo vysvedčení vidieť, nie konštrukcia. Plná plocha ostáva hlavnému CTA. */
.comm-ctry{flex-shrink:0;display:flex;align-items:center;gap:8px;padding:8px 12px 8px 8px;border-radius:999px;border:1px solid ${p.border};background:${p.soft};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-ctry:hover{border-color:${t.cardEdge};background:${t.card};}
.comm-ctry.on{${Ye(z.edge,Oe.lapis,.14)}}
.comm-ctry--empty{opacity:.55;}
/* ⚠️ VYBRANÁ KRAJINA JE VŽDY PLNE VIDITEĽNÁ, aj keď v nej človek ešte nebol. Stlmenie
   hovorí „sem si zatiaľ nešiel"; keď na taký chip klikne, je to jeho voľba a musí byť
   vidieť rovnako ako pri prejdenej krajine — inak vyzerá výber ako nedotiahnutý. */
.comm-ctry--empty.on{opacity:1;}
.comm-ctry img{width:22px;height:15px;border-radius:8px;object-fit:cover;flex-shrink:0;}
.comm-ctry b{font-family:${x};font-weight:600;font-size:12px;color:${p.ink};white-space:nowrap;}
.comm-ctry.on b{color:${Oe.lapis};}
.comm-ctry span{font-family:${x};font-weight:500;font-size:10px;color:${p.dim};white-space:nowrap;}

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
.comm-chero{position:relative;border-radius:14px;border:1.5px solid ${t.cardEdge};background:#2A2013;background-size:cover;background-position:center;min-height:172px;display:flex;align-items:flex-end;padding:16px;margin-bottom:16px;box-shadow:${G.lift};}
.comm-chero::before{content:'';position:absolute;inset:0;border-radius:12px;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.78) 100%);}
/* krajina bez vlastnej fotky: vlajka NEsmie ísť cez background cover — roztiahnutá rakúska
   alebo švajčiarska vlajka je len biela plocha. Bez fotky niet čo prekrývať, takže tu už
   tmavý blok nemá dôvod byť a hero ide do papyrusu — inak by v bledom vysvedčení stála
   čierna diera práve pri krajine, kde človek ešte nebol.
   ⚠️ S výplňou sa musí prevrátiť aj INKOUST (text bol robený na fotku): nadpis, podnadpis,
   cieľ a koľajnica pruhu nižšie. Prevrátiť povrch a nechať štítky svetlé = neviditeľný blok.
   → [[feedback_prevratena_doska_prevrati_aj_stitky]] */
.comm-chero--noimg{background-image:none;background:${t.panelGrad};}
.comm-chero--noimg::before{background:none;}
.comm-chero--noimg .comm-chero-name{color:${p.ink};text-shadow:none;}
.comm-chero--noimg .comm-chero-sub{color:${p.dim};}
.comm-chero--noimg .comm-chero-goaltxt{color:${p.deep};}
.comm-chero--noimg .comm-chero-bar{background:rgba(42,22,8,0.14);}
.comm-chero--noimg .comm-chero-flag{border-color:${p.border};box-shadow:${G.lift};}
.comm-chero--noimg .comm-rankinfo-btn{border-color:${p.border};background:${p.soft};color:${p.ink};}
.comm-chero-flag{display:block;width:54px;height:36px;object-fit:cover;border-radius:8px;border:1px solid ${t.onDarkBorder};box-shadow:${G.panel};margin-bottom:11px;}
.comm-chero-in{position:relative;z-index:1;width:100%;}
.comm-chero-name{font-family:${H};font-weight:700;font-size:24px;line-height:1;letter-spacing:0.02em;text-transform:uppercase;color:${t.card};text-shadow:0 2px 14px rgba(0,0,0,0.7);}
.comm-chero-sub{font-family:${x};font-weight:500;font-size:12px;color:rgba(245,240,228,0.85);margin-top:7px;}
.comm-chero-goal{position:relative;margin-top:11px;max-width:340px;}
.comm-chero-goaltxt{display:flex;align-items:center;gap:8px;font-family:${x};font-weight:500;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:rgba(245,240,228,0.8);margin-bottom:5px;}
/* ⓘ pri titule krajiny — na FOTKE, takže svetlý obrys a tmavé sklo, nie inkoust ako v profile. */
/* Popup sa kotví na CELÝ cieľ (.comm-chero-goal), nie na ⓘ: na mobile sa text cieľa zalomí
   a ⓘ ostane pri pravom okraji, takže left:0 od tlačidla posunul 290 px popup mimo obrazovky
   (Danka #42, 400 px Android, 13. 10. 2026). */
.comm-rankinfo{position:static;display:inline-flex;flex-shrink:0;}
.comm-rankinfo-btn{width:19px;height:19px;border-radius:50%;border:1px solid ${t.onDarkDim};background:rgba(3,2,1,0.45);color:${t.card};font-family:${x};font-weight:600;font-size:10px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s;}
.comm-rankinfo-btn:hover,.comm-rankinfo-btn.on{background:${ne};border-color:${ne};color:#241a06;}
/* Otvára sa NAHOR (bottom:100%): titul sedí na spodku hera, smerom dole by popup prekryl
   kategórie pod ním a na nižšom okne by pretiekol pod okraj viewportu — presne tá chyba,
   ktorú už raz spravil cenník bodov. Nahor má nad sebou celú fotku hera. */
.comm-ranks{position:absolute;bottom:calc(100% + 9px);left:0;z-index:30;width:min(290px,78vw);text-align:left;cursor:default;text-transform:none;letter-spacing:normal;background:${t.panelGrad};border:1.5px solid ${t.cardEdge};border-radius:14px;box-shadow:${t.panelShadow};padding:12px 16px;}
.comm-rankrow b{font-variant-numeric:tabular-nums;}
/* dosiahnutý rank = zelená (rovnaká ako odškrtnutá jednotka), nasledujúci = zlatý a zvýraznený;
   ostatné ostávajú tlmené, aby bolo na prvý pohľad vidieť, kde človek stojí. */
.comm-rankrow.done{color:${t.inkStrong};}
.comm-rankrow.done b{color:${ht};}
.comm-rankrow.next{color:${t.inkStrong};font-weight:600;}
.comm-rankrow.next b{color:${t.cardEdge};}
.comm-chero-bar{height:6px;border-radius:999px;background:${t.onDarkBorder};overflow:hidden;}
.comm-chero-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#F5C73D,#E69E1A);}
@media (max-width:560px){ .comm-chero{min-height:150px;padding:12px;} .comm-chero-name{font-size:20px;} }

/* magistrály = odkazy na detail, žiadny dropdown (#50) */
.comm-jrows{display:flex;flex-direction:column;gap:7px;margin-top:12px;}
/* položka = RIADOK (úroveň 3 matrice) */
.comm-jrow{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:12px 12px;border-radius:8px;border:1px solid ${t.border};background:${t.tileBg};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-jrow:hover{border-color:${t.cardEdge};background:${t.card};}
.comm-jrow-name{font-family:${H};font-weight:700;font-size:12px;color:${p.ink};}
.comm-jrow.on .comm-jrow-name{color:${p.deep};}
.comm-jrow-meta{font-family:${x};font-weight:500;font-size:10px;color:${p.dim};white-space:nowrap;flex-shrink:0;}
.comm-jrow.on .comm-jrow-meta{color:${Na};}

/* zoznam prejdených = viditeľný ovládač, nie holý klikací nadpis (#46) */
.comm-drop{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin:20px 0 12px;padding:12px 16px;border-radius:12px;border:1px solid ${t.cardEdge};background:${t.panelGrad};box-shadow:${G.lift};font-family:inherit;cursor:pointer;transition:border-color .15s,background .15s;}
.comm-drop:hover{border-color:${p.deep};background:${t.card};}
.comm-drop-t{font-family:${x};font-weight:600;font-size:12px;letter-spacing:0.02em;color:${p.deep};}
.comm-drop-n{display:flex;align-items:center;gap:8px;font-family:${x};font-weight:500;font-size:10px;color:${p.dim};}
.comm-drop-chev{display:inline-block;width:7px;height:7px;border-right:1.5px solid ${p.dim};border-bottom:1.5px solid ${p.dim};transform:translateY(-2px) rotate(45deg);transition:transform .2s;}
.comm-drop.on .comm-drop-chev{transform:translateY(1px) rotate(-135deg);}

/* ŠAT PAPYRUS 3D — hodnotenie po prejdení a polia panelov (Matej 9. 11. 2026). Len pod APP_NEW. */
html.papyrus3d .comm-label{margin-bottom:${K.sm}px;font-size:${f.label}px;letter-spacing:.14em;color:var(--p3d-gold-ink);}
html.papyrus3d .comm-seg{gap:${K.xs}px;padding:${K.xs}px;border-radius:${I.card}px;border:2.5px solid var(--p3d-ink);background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .comm-seg button{flex:1 1 0;min-width:0;min-height:56px;flex-direction:column;gap:${K.xs}px;padding:${K.xs}px;white-space:normal;border:2.5px solid transparent;border-radius:${I.tile}px;background:none;color:var(--p3d-ink);font-size:${f.label}px;font-weight:500;line-height:1.1;overflow-wrap:anywhere;}
html.papyrus3d .comm-seg button.on{color:var(--p3d-paper-hi);border-color:var(--p3d-gold);background:${z.grad};box-shadow:0 3px 0 var(--p3d-ink);font-weight:600;}
html.papyrus3d .comm-chips{gap:${K.sm}px;}
html.papyrus3d .comm-chip{min-height:44px;padding:${K.sm}px ${K.md}px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);font-size:${f.body}px;box-shadow:var(--p3d-lift);}
html.papyrus3d .comm-chip.on{background:${t.alertRed};color:#fff;font-weight:600;box-shadow:none;transform:translateY(3px);}
html.papyrus3d .comm-textarea,html.papyrus3d .comm-input,html.papyrus3d .comm-selectinput{min-height:54px;padding:${K.md}px;border:2.5px solid var(--p3d-ink);border-radius:${I.card}px;background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);color:var(--p3d-ink);}
html.papyrus3d .comm-hint{color:var(--p3d-ink);opacity:1;}
html.papyrus3d .comm-submit,html.papyrus3d .comm-ghostbtn{min-height:54px;padding:${K.sm}px ${K.md}px;border-radius:${I.card}px;border:2.5px solid var(--p3d-ink);font-family:'LT Museum',serif;font-weight:400;font-size:${f.h2}px;line-height:1.1;letter-spacing:0;text-transform:none;}
html.papyrus3d .comm-submit{color:var(--p3d-paper-hi);border-color:var(--p3d-gold);background:${z.grad};box-shadow:0 6px 0 var(--p3d-ink),0 11px 14px var(--p3d-sh);}
html.papyrus3d .comm-submit:active:not(:disabled){transform:translateY(5px);box-shadow:0 1px 0 var(--p3d-ink);}
html.papyrus3d .comm-submit:disabled{color:var(--p3d-ink);border-color:var(--p3d-ink);background:var(--p3d-paper);box-shadow:none;opacity:.55;}
html.papyrus3d .comm-ghostbtn{margin-top:${K.md}px;color:var(--p3d-ink);background:var(--p3d-card);box-shadow:var(--p3d-lift);}
html.papyrus3d .comm-reward{border:2.5px solid var(--p3d-ink);border-radius:${I.card}px;background:var(--p3d-card);box-shadow:inset 0 0 0 3px var(--p3d-gold),var(--p3d-lift);}
html.papyrus3d .comm-reward-eyebrow,html.papyrus3d .comm-reward-kind{color:var(--p3d-gold-ink);}
html.papyrus3d .comm-reward-txt,html.papyrus3d .comm-reward-nexttxt{font-size:${f.body}px;}
`;function gt({trailName:a,reward:r,ratingPoints:l}){var d;const u=ce();return e.jsxs("div",{className:"comm-reward",children:[e.jsx("span",{className:"comm-reward-eyebrow",children:u("pack.community.rewardEyebrow")}),e.jsxs("div",{className:"comm-reward-row",children:[e.jsx(ra,{value:r.base,tone:"lapis",size:"md"}),e.jsx("span",{className:"comm-reward-txt",children:a})]}),(((d=r.baseRows)==null?void 0:d.length)??0)>1&&e.jsx("div",{className:"comm-reward-break",children:r.baseRows.map(k=>e.jsxs("div",{className:"comm-reward-breakrow",children:[e.jsx("span",{children:u(k.labelKey,k.labelParams)}),e.jsx("b",{children:k.points})]},k.labelKey))}),r.bonuses.map(k=>e.jsxs("div",{className:"comm-reward-row comm-reward-row--bonus",children:[e.jsx(ra,{value:k.points,tone:"bonus",size:"md",animate:!0}),e.jsxs("span",{className:"comm-reward-txt",children:[e.jsx("span",{className:"comm-reward-unit",children:k.unit}),e.jsx("span",{className:"comm-reward-kind",children:u(k.labelKey)})]})]},`${k.labelKey}:${k.unit}`)),!!l&&e.jsxs(e.Fragment,{children:[e.jsx("hr",{className:"comm-reward-rule"}),e.jsxs("div",{className:"comm-reward-next",children:[e.jsx(ra,{value:l,tone:"bonus",size:"md"}),e.jsx("span",{className:"comm-reward-nexttxt",children:u("pack.community.rewardNextRating")})]})]})]})}function kt({title:a,onClose:r,children:l}){return e.jsx(ma,{title:a,onClose:r,over:!0,children:l})}function Qt({trailName:a,initial:r,onSubmit:l,onClose:u,rewardPoints:d,reward:k,routeTrip:T=!0}){const y=ce(),[v,n]=$.useState((r==null?void 0:r.rating)??0),[E,S]=$.useState((r==null?void 0:r.difficulty)??""),[_,V]=$.useState((r==null?void 0:r.crowd)??""),[c,s]=$.useState((r==null?void 0:r.comment)??""),[C,h]=$.useState((r==null?void 0:r.when)??""),[j,X]=$.useState((r==null?void 0:r.hazards)??[]),ke=P=>X(M=>M.includes(P)?M.filter(Y=>Y!==P):[...M,P]),ee=v>0&&(!T||E!==""&&_!==""),se=kt;return e.jsxs(se,{title:a,onClose:u,wide:!0,children:[e.jsx("style",{children:Fo}),e.jsxs("div",{className:"comm-field",style:{textAlign:"center"},children:[e.jsx("label",{className:"comm-label",children:y("pack.community.walkedRatingLabel")}),d&&!k?e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:11},children:e.jsx(ra,{value:d,tone:"base",size:"lg"})}):null,e.jsx("div",{style:{display:"flex",justifyContent:"center"},children:e.jsx(Do,{value:v,onChange:n,size:40})})]}),k&&e.jsx(gt,{trailName:a,reward:k,ratingPoints:d}),e.jsxs("div",{className:"comm-walked-grid",children:[T&&e.jsxs("div",{className:"comm-field",children:[e.jsx("label",{className:"comm-label",children:y("pack.community.difficultyLabel")}),e.jsx("div",{className:"comm-seg",children:bo.map(P=>e.jsxs("button",{type:"button",className:E===P?"on":"",onClick:()=>S(P),children:[e.jsx(Oa,{diff:P})," ",sa(y,P)]},P))})]}),e.jsxs("div",{className:"comm-field",children:[e.jsxs("label",{className:"comm-label",children:[y("pack.community.crowdLabel"),T?"":` ${y("pack.community.optional")}`]}),e.jsx("div",{className:"comm-seg",children:fo.map(P=>e.jsxs("button",{type:"button",className:_===P?"on":"",onClick:()=>V(P),children:[e.jsx(Ta,{crowd:P,fallback:Ca[P]})," ",la(y,P)]},P))})]}),e.jsxs("div",{className:"comm-field",children:[e.jsx("label",{className:"comm-label",children:y("pack.community.hazardsLabel")}),e.jsx("div",{className:"comm-chips",children:vo.map(P=>e.jsxs("button",{type:"button",className:`comm-chip${j.includes(P)?" on":""}`,onClick:()=>ke(P),children:[Da[P]," ",y(`pack.community.hazard.${P}`)]},P))})]}),e.jsxs("div",{className:"comm-field",children:[e.jsx("label",{className:"comm-label",children:y("pack.community.whenLabel")}),e.jsx("input",{type:"month",className:"comm-input",value:C,onChange:P=>h(P.target.value)})]}),e.jsxs("div",{className:"comm-field",style:{gridColumn:"1 / -1"},children:[e.jsx("label",{className:"comm-label",children:y("pack.community.commentLabel")}),e.jsx("textarea",{className:"comm-textarea",value:c,onChange:P=>s(P.target.value),placeholder:y("pack.community.commentPlaceholder")}),e.jsx("p",{className:"comm-hint",children:y("pack.community.commentPublic")})]})]}),e.jsx("button",{type:"button",className:"comm-submit",disabled:!ee,onClick:()=>ee&&l({rating:v,difficulty:T&&E?E:void 0,crowd:_||void 0,comment:c,when:C,hazards:j}),children:y(r?"pack.community.updateVoteBtn":"pack.community.logWalkBtn")}),d?e.jsx("button",{type:"button",className:"comm-ghostbtn",onClick:u,children:y("pack.community.notNowBtn")}):null]})}const sa=(a,r)=>r?a(`pack.map.diff.${r}`):"",la=(a,r)=>r?ho(a,r):"";function bt(a,r){return r.difficultyBreakdown.map(l=>`${l.pct}% ${sa(a,l.value)}`).join(" · ")}function ft(a,r){return r.crowdBreakdown.map(l=>`${l.pct}% ${la(a,l.value)}`).join(" · ")}function er({rating:a,count:r,compact:l,mini:u}){const{lang:d}=Fe();return e.jsxs("span",{className:`comm-bigrating${l?" compact":""}${u?" mini":""}`,children:[e.jsx("b",{children:Ee(a,d,1,1)}),e.jsx(mo,{stars:a,size:u?11:l?13:17,gap:u?1.5:l?2:3}),r!=null&&r>0&&e.jsxs("i",{children:["(",r,")"]})]})}const ar=a=>`
  html.papyrus3d ${a} .comm-photometa{gap:8px;}
  html.papyrus3d ${a} .comm-mpill{height:40px;gap:6px;padding:0 12px 0 8px;border:2px solid var(--p3d-ink);border-radius:12px;background:linear-gradient(180deg,#fff,var(--p3d-paper));color:var(--p3d-ink);box-shadow:0 3px 0 var(--p3d-ink);font:600 16px 'Space Grotesk',sans-serif;letter-spacing:0;}
  html.papyrus3d ${a} .comm-mpill img{width:28px!important;height:28px!important;}
  html.papyrus3d ${a} .comm-mpill--ico{padding:0 4px;gap:0;}
  html.papyrus3d ${a} .comm-msep{display:block;width:4px;flex:none;}
`;function or({agg:a,km:r,ascentM:l,hasRoute:u=!0,iconOnly:d=!1}){const k=ce(),{lang:T}=Fe(),y=a.difficultyBreakdown.length>0,v=a.crowdBreakdown.length>0;return e.jsxs("div",{className:"comm-photometa",children:[u&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"comm-mpill",children:[e.jsx(va,{kind:"vzdialenost",fallback:"↔"})," ",Ee(r,T)," km",l==null?"":e.jsxs(e.Fragment,{children:[d?e.jsx("i",{className:"comm-msep","aria-hidden":!0}):" · ",e.jsx(va,{kind:"stupanie",fallback:""})," ",Ee(l,T,0)," m"]})]}),e.jsxs("span",{className:`comm-mpill${y?" comm-hastip":""}${d?" comm-mpill--ico":""}`,"data-tip":y?`${k("pack.map.difficulty")} — ${bt(k,a)}`:void 0,title:d?sa(k,a.difficulty):void 0,children:[e.jsx(Oa,{diff:a.difficulty}),d?null:e.jsxs(e.Fragment,{children:[" ",sa(k,a.difficulty)]})]})]}),a.crowd&&e.jsxs("span",{className:`comm-mpill${v?" comm-hastip":""}${d?" comm-mpill--ico":""}`,"data-tip":v?`${k("pack.map.crowd")} — ${ft(k,a)}`:void 0,title:d?la(k,a.crowd):void 0,children:[e.jsx(Ta,{crowd:a.crowd,fallback:Ca[a.crowd]}),d?null:e.jsxs(e.Fragment,{children:[" ",la(k,a.crowd)]})]})]})}function tr({agg:a}){const r=ce();return a.hazardBreakdown.length===0?null:e.jsx(e.Fragment,{children:a.hazardBreakdown.map(l=>e.jsxs("span",{className:"comm-hazardtag",title:`${l.pct}% of members reported ${l.value}`,children:[Da[l.value]," ",r(`pack.community.hazard.${l.value}`)," · ",l.pct,"%"]},l.value))})}function vt({selected:a,onChange:r}){const l=ce(),[u,d]=$.useState([]);if($.useEffect(()=>{let v=!0;return no().then(n=>{v&&d(n)}),()=>{v=!1}},[]),u.length===0)return null;const k=new Set(a.map(v=>v.key)),T=v=>{var n;return((n=v.name)==null?void 0:n.split(/\s+/)[0])||l("pack.companions.packHumanNoName")},y=v=>{const n=`${da}${v.userId}`;k.has(n)?r(a.filter(E=>E.key!==n)):r([...a,{key:n,name:T(v),sub:v.dogNames.join(", "),photo:v.avatarUrl}])};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-comp-grouplabel",children:l("pack.companions.packHumans")}),e.jsx("div",{className:"comm-comp-pack",children:u.map(v=>{const n=k.has(`${da}${v.userId}`),E=T(v);return e.jsxs("button",{type:"button",className:`comm-comp-dog comm-comp-human${n?" on":""}`,onClick:()=>y(v),children:[e.jsx("span",{className:`comm-comp-dog-av${v.avatarUrl?"":" ph"}`,style:v.avatarUrl?{backgroundImage:`url('${Ke(v.avatarUrl,96)}')`}:void 0,children:v.avatarUrl?"":E.charAt(0).toUpperCase()}),e.jsx("span",{children:E}),!n&&e.jsx("span",{className:"plus",children:"+"})]},v.userId)})})]})}function rr({myDogs:a,selected:r,onChange:l,onOpenProfile:u}){const d=ce(),[k,T]=$.useState(""),[y,v]=$.useState(()=>r.some(s=>s.key.startsWith("member-"))),n=new Set(r.map(s=>s.key)),E=s=>{n.has(s.key)||l([...r,s])},S=s=>l(r.filter(C=>C.key!==s)),_=s=>{const C=`dog-${s.id}`;n.has(C)?S(C):E({key:C,name:s.name||"My dog",sub:"your pack",photo:s.photo})},V=()=>{const s=k.trim();!s||n.has(`member-${s}`)||(E({key:`member-${s}`,name:s}),T(""))},c=r.filter(s=>!s.key.startsWith("dog-")&&!s.key.startsWith(da));return e.jsxs("div",{children:[c.length>0&&e.jsx("div",{className:"comm-comp-selected",children:c.map(s=>e.jsxs("span",{className:"comm-comp-chip",children:[e.jsx("span",{className:`comm-comp-chip-av${s.photo?"":" ph"}`,style:s.photo?{backgroundImage:`url('${Ke(s.photo,96)}')`}:void 0,children:s.photo?"":s.name.charAt(0).toUpperCase()}),e.jsx("b",{children:s.name}),e.jsx("button",{type:"button",onClick:()=>S(s.key),"aria-label":d("pack.companions.remove",{name:s.name}),children:"×"})]},s.key))}),a.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-comp-grouplabel",children:d("pack.companions.yourPack")}),e.jsx("div",{className:"comm-comp-pack",children:a.map(s=>{const C=n.has(`dog-${s.id}`);return e.jsxs("button",{type:"button",className:`comm-comp-dog${C?" on":""}`,onClick:()=>_(s),children:[e.jsx("span",{className:`comm-comp-dog-av${s.photo?"":" ph"}`,style:s.photo?{backgroundImage:`url('${Ke(s.photo,96)}')`}:void 0,children:s.photo?"":(s.name||"D").charAt(0).toUpperCase()}),e.jsx("span",{children:s.name||d("pack.companions.myDog")}),!C&&e.jsx("span",{className:"plus",children:"+"})]},s.id)})})]}),e.jsx(vt,{selected:r,onChange:l}),!y&&e.jsxs("button",{type:"button",className:"comm-comp-openothers",onClick:()=>v(!0),children:[e.jsx("span",{className:"comm-comp-openplus",children:"+"}),e.jsx("span",{children:d("pack.companions.addOthers")})]}),y&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"comm-comp-grouplabel",children:d("pack.companions.addOthers")}),e.jsx("div",{className:"comm-comp-searchwrap",children:e.jsxs("div",{className:"comm-comp-searchrow",children:[e.jsx("input",{className:"comm-input",value:k,onChange:s=>T(s.target.value),onKeyDown:s=>{s.key==="Enter"&&(s.preventDefault(),V())},placeholder:d("pack.companions.typeName")}),e.jsx("button",{type:"button",className:"comm-comp-addbtn",onClick:V,disabled:!k.trim(),"aria-label":d("pack.companions.addTyped"),title:d("pack.companions.addTyped"),children:"+"})]})})]})]})}Object.fromEntries(Ro.map(a=>[a.name,a.id]));const yt=["sk","cz","pl","at","hu","si","de","ch","it","fr"],ta=[{trips:5,title:"visitor"},{trips:10,title:"regular"},{trips:20,title:"specialist"},{trips:40,title:"native"}];function wt(a,r){const l=ta.filter(k=>a>=k.trips).length,u=ta[l],d=l>0?ta[l-1].trips:0;return{earned:l>0?`${r} ${ta[l-1].title}`:null,next:u?`${r} ${u.title}`:null,nextAt:(u==null?void 0:u.trips)??null,pct:u?Math.min(100,Math.max(0,(a-d)/(u.trips-d)*100)):100}}function $t(a){const r=[q.range,q.np,q.chko,q.water],l=[[a("pack.stats.legend.addTrail"),`+${q.add}`],[a("pack.stats.legend.addPlace"),`+${q.place}`],[a("pack.stats.legend.walkTrail"),`+${q.walk}`],[a("pack.stats.legend.mapNote"),`+${q.note}`],[a("pack.stats.legend.eventHeld"),`+${q.event}`],[a("pack.stats.legend.wishDone"),`+${q.wish}`],[a("pack.stats.legend.visitPlace"),`+${q.visit}`],[a("pack.stats.legend.perKm"),`+${Lo}`],[a("pack.stats.legend.per100m"),`+${Io}`]];return r.every(u=>u===r[0])?l.push([a("pack.stats.legend.newGeoAny"),`+${r[0]}`]):l.push([a("pack.stats.legend.newRange"),`+${q.range}`],[a("pack.stats.legend.newPark"),`+${q.np}`],[a("pack.stats.legend.newProtected"),`+${q.chko}`],[a("pack.stats.legend.newWater"),`+${q.water}`]),l.push([a("pack.stats.legend.newCountry"),`+${q.country}`],[a("pack.stats.legend.rateWalked"),`+${q.rate}`],[a("pack.stats.legend.collection"),`+${q.collection}`],[a("pack.stats.legend.longDistance"),a("pack.stats.legend.fixedPrice")]),l}function nr({walkedTrails:a,walkedKm:r,onOpenTrip:l,onAddTrip:u}){var qe,De,Me,We,o,w,B,J;const d=ce();Fe();const k=$.useMemo(()=>{const m=new Map;for(const O of a){const ie=we(O),he=m.get(ie);he?he.push(O):m.set(ie,[O])}return m},[a]),T=$.useMemo(()=>[...new Set([...yt,...k.keys()])].map(m=>{var O;return{iso:m,name:na(m),trips:((O=k.get(m))==null?void 0:O.length)??0}}).sort((m,O)=>m.iso==="sk"?-1:O.iso==="sk"?1:O.trips-m.trips||m.name.localeCompare(O.name)),[k]);$.useMemo(()=>T.filter(m=>m.trips>0),[T]);const[y,v]=$.useState("sk"),n=k.get(y)??[];n.reduce((m,O)=>m+(Number(O.km)||0),0);const E=na(y);wt(n.length,E),(qe=n.find(m=>{var O;return(O=m.photos)==null?void 0:O[0]}))==null||qe.photos[0];const S=$.useMemo(()=>yo(k.get("sk")??[]),[k]),_=wo(a);(((De=S.categories.find(m=>m.key==="peaks"))==null?void 0:De.done)??[])[0];const[c,s]=$.useState(null),[C,h]=$.useState(!1),[j,X]=$.useState(!1),[ke,ee]=$.useState(!1),[se,P]=$.useState(!1);$.useEffect(()=>{if(!se)return;const m=()=>P(!1),O=window.setTimeout(()=>document.addEventListener("click",m),0);return()=>{window.clearTimeout(O),document.removeEventListener("click",m)}},[se]);const[M,Y]=$.useState(!1);$.useRef(null);const me=$.useRef(null),[$e,be]=$.useState(0);$.useEffect(()=>{$e&&requestAnimationFrame(()=>{var m;return(m=me.current)==null?void 0:m.scrollIntoView({behavior:"smooth",block:"start"})})},[$e]);const oe=So(),Z=oe?Po:Ao(),fe=((We=(Me=Z.session)==null?void 0:Me.user)==null?void 0:We.user_metadata)??{},g=fe.full_name||fe.name,A=oe?Oo.name:(w=(o=Z.session)==null?void 0:o.user)!=null&&w.email?mt(Z.session.user.email,g):Z.avatarInitial,F=Z.dogs.map(m=>m.dog_name).filter(m=>!!m);F.length>0&&[A,...F].join(" & ");const re=To(),{addedByMe:Ae,myRatings:le}=$.useMemo(()=>{var m,O;return{addedByMe:zo(No(a,{ownerName:A,isFounder:ka((O=(m=Z.session)==null?void 0:m.user)==null?void 0:O.email)})),myRatings:$o(a,jo())}},[a,A,Z.session,re]),Te=ao(),W=oo(),ae=to(),pe=ro(),Ue=$.useMemo(()=>Z.dogs.map(m=>({id:m.id,name:m.dog_name||d("pack.map.myDogFallback"),photo:m.cloudinary_main_url,...Co(m.id)})).filter(m=>m.trips>0),[Z.dogs,re,d]),Se=Eo(a,{addedIds:Ae,ratings:le,countries:_,notePoints:Te,eventsHeld:W,wishesDone:ae,placePosts:pe}),Ve=Mo(Se.total),Ce=e.jsxs(e.Fragment,{children:[e.jsx(Vo,{level:Ve.level,onDark:!1,large:eo}),e.jsx("span",{className:"comm-pts-rule"}),e.jsxs("span",{className:"comm-pts-cols",children:[e.jsxs("span",{className:"comm-pts-col",children:[e.jsx("span",{className:"comm-pts-eyebrow",children:d("pack.stats.howPointsWork")}),$t(d).map(([m,O])=>e.jsxs("span",{className:"comm-pts-row",children:[m,e.jsx("b",{children:O})]},m))]}),e.jsxs("span",{className:"comm-pts-col",children:[e.jsx("span",{className:"comm-pts-eyebrow",children:d("pack.stats.yourPoints")}),Se.rows.length>0?e.jsxs(e.Fragment,{children:[Se.rows.map(m=>e.jsxs("span",{className:"comm-pts-row",children:[d(m.labelKey,m.labelParams),e.jsx("b",{children:m.points})]},m.labelKey)),e.jsx("span",{className:"comm-pts-rule"}),e.jsxs("span",{className:"comm-pts-tot",children:[d("pack.stats.total"),e.jsx("b",{children:Se.total})]})]}):e.jsx("span",{className:"comm-pts-none",children:d("pack.stats.noPointsYet")})]})]})]});return e.jsx(ct,{walkedTrails:a,ownerName:A,avatarUrl:Z.avatarUrl,dogs:Z.dogs.filter(m=>m.cloudinary_main_url).map(m=>({id:m.id,photo:m.cloudinary_main_url})),lvl:Ve,dogStats:Ue,showChko:ka((J=(B=Z.session)==null?void 0:B.user)==null?void 0:J.email),onOpenTrip:l,levelSheet:Ce})}export{er as B,Xt as C,tr as H,Fo as P,Jt as S,rt as T,Qt as W,ra as a,or as b,Qo as c,de as d,qt as e,nr as f,rr as g,vt as h,Vo as i,ar as p};
