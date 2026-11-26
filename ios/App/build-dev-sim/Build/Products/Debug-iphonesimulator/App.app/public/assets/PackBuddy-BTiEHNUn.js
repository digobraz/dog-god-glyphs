import{m as k,b as n,aF as ae,s,v as d,a0 as j,a1 as de,B as je,L as $,r as m,j as e,w as oe,aB as rt,x as te,f as Ce,_ as lt,y as re,aV as dt,n as pt,a3 as Is,c as Os,az as U,g as os,aT as ct,u as mt,K as ft,aQ as ht,aO as ut,be as xt,ah as gt,aX as bt,aq as kt,q as Ae,aC as We,aD as yt}from"./index-DriUOdZL.js";import{c as $t}from"./stepBack-DQEM_RuJ.js";import{F as vt,s as pe,u as Ds,I as wt,G as rs,O as Rs,S as jt,o as Nt,W as St,P as zt,A as _e,y as Me,J as _t,K as Ct,D as Pt,h as Et,l as Tt,L as At,t as It,T as fs}from"./packProfile-3D_4hu2R.js";import{supabase as He}from"./client-_yx8AKEw.js";import{a_ as Ot,a$ as Ge,f as Dt,M as Rt}from"./MomentHost-D9oSu3w3.js";import{e as hs,P as Mt,a as Ft}from"./PackTopRow-BfpkT1yr.js";import{a as Lt}from"./flowPaleSkin-CJNdyjt-.js";import{a as Qe,t as Bt,c as Kt}from"./countryGeo-BNEVCU3g.js";import{S as Ms,m as Wt,n as Ht}from"./HandIcons-BI9sYdb3.js";import{bgImg as Pe,withTransform as Fs,ladderPx as Gt,uploadBuddyPhoto as Yt}from"./cloudinaryService-CiRx-3N_.js";import{d as es}from"./dogSeal-6Sl_nvhS.js";import{z as Ut,c as Vt}from"./HeroglyphFrame-F7m3K15S.js";import{l as Xt,p as Zt,a as Jt,s as us,t as qt,b as Qt,c as ea,d as xs,u as sa}from"./snifferDeck-BY0t-1h2.js";import{HERO_TRAILS as Ls}from"./data-trails-C5F812_6.js";import{HERO_JOURNEYS as ta}from"./data-journeys-3PcCvYo8.js";import{p as aa}from"./packCommunity-Z_xRCT1t.js";import{b as ia,e as na,P as oa,L as ra}from"./rankBadge-DrDXhP70.js";import"./packTiers-D4RAcaEl.js";import{P as Bs,B as la,N as da}from"./sysSwap-DJ_4p3cJ.js";import{B as Ks}from"./BrandIcon-lowQpHlA.js";import{C as ss}from"./countryBorders-iqdZuqi2.js";import{f as ts}from"./flagUrl-B21iQI9I.js";import{M as pa}from"./PackLayout-B9RT_jMa.js";import{loadBuddySettings as ca,pickBuddyDog as ma,BUDDY_STEPS as fa,buddyGateMissing as ha,DEFAULT_BUDDY_SETTINGS as Ye,saveBuddySettings as ua,BUDDY_MIN_AGE as gs,BUDDY_INTENTS as xa}from"./buddyGate-DH9xc2jX.js";import"./dogEvents-p0BnCK5N.js";import"./sharedFetch-CweRO2Vz.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./BackButton-8pSTwsJq.js";import"./ThinArrow-DxkNjmlF.js";import"./dogRights-CDnPOjZG.js";import"./hasSession-ns-zlIq6.js";import"./devMockDogs-EBvAGSAt.js";import"./pawmateRights-By9TfO0S.js";import"./wizAnchors-DjShJff8.js";import"./SysIcon-CI9hudiL.js";import"./dogSlug-CB23gDR2.js";import"./addTripModel-DwkYC9MX.js";import"./feedData-DmTwWPGV.js";import"./photoIntake-EOawjgPq.js";import"./consent-Dhof2q2u.js";import"./ainubisSheet-BR3ZiSMH.js";import"./useSheetSwipe-Ch0ng1WW.js";import"./sosNoPhoto-igLPGupO.js";import"./sos-0Lw8ugiB.js";import"./use-toast-CKCh4Cay.js";import"./shareFile-CghX9Llh.js";import"./breeds-DONRU28-.js";import"./sosP3d-BGksLPbc.js";import"./labTheme-DLctEqJ2.js";import"./handArrowLeft-CBfp0fHd.js";import"./sealStore-jLdnYZu2.js";import"./CHARACTER-WATERLOVER-Be2FY-gi.js";import"./RankingSlot-B9f52iXE.js";import"./NUMBER-11-BoEzuCvn.js";import"./initialLetter-CIe-_dtl.js";import"./NAME-Z-AkUtK0VT.js";import"./CHINESE_SIGN-GOAT-D7aE0k1r.js";import"./CHINESE_SIGN-DOG-C89JWf8g.js";import"./tripPoints-C3j2SdgA.js";import"./badgeShelf-D0_DcnEF.js";import"./magnetPreview-DJ5RPtvA.js";import"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./vaultScrolls-DnI3miNU.js";import"./circles-AGJD0c_9.js";import"./TermsGate-BuR57-OJ.js";import"./cardDraft--JJQVDkL.js";import"./humanPrefs-B9ECa3kp.js";let bs=null;function ga(){return bs??(bs=new Map([...ta,...Ls].map(t=>[t.id,t]))),bs}function Ws(t){const a=ga(),i=t.map(p=>a.get(p)).filter(p=>!!p);if(i.length===0)return;const{level:r}=aa({walkedTrails:i,votes:{},email:"",ownerName:""});return r.level}const Hs="'Cinzel Decorative','Cinzel',serif",ba=(t,a=900)=>Fs(t,`c_limit,w_${Gt(a)},f_auto,q_auto`),Fe=(t,a,i)=>Pe(t,a,i),Ie=(t,a)=>t==="western"?Ut[a]:Vt[a],ks=(t,a,i)=>i(t==="western"?`heroglyph.flow.ownerZodiac.sign.${a}`:`heroglyph.flow.ownerZodiac.animal.${a}`,a),ka=(t,a)=>{var i;return a(`pack.map.activityLabel.${t}`,((i=vt.find(r=>r.value===t))==null?void 0:i.labelEN)??t)},ys={"0-5":["pack.sniffer.dist.b0_5","within 5 km"],"5-10":["pack.sniffer.dist.b5_10","5–10 km away"],"10-25":["pack.sniffer.dist.b10_25","10–25 km"],"25-50":["pack.sniffer.dist.b25_50","25–50 km"],"50+":["pack.sniffer.dist.b50p","more than 50 km away"]};function Gs(t,a){const i=t.distanceBand;if(!i||!ys[i])return"";const[r,p]=ys[i];return a(r,p)}const Ee=`
.sn-card{position:absolute;inset:0;border-radius:${k.card}px;overflow:hidden;background:${n.pageBg};
  box-shadow:${ae.panel};touch-action:pan-y;user-select:none;-webkit-user-select:none;}
.sn-card.is-back{transform:scale(.95) translateY(${s.sm}px);opacity:.6;pointer-events:none;}
.sn-card.is-anim{transition:transform .32s ease, opacity .32s ease;}
.sn-slide{position:absolute;inset:0;}
.sn-slide > img.sn-bg{width:100%;height:100%;object-fit:cover;display:block;}
/* heroglyf a meno psa sú JEDEN stĺpec — meno ide vždy tesne pod glyf, nikdy do textu dole */
.sn-crest{position:absolute;left:50%;top:32%;transform:translate(-50%,-50%);width:56%;max-width:240px;display:flex;flex-direction:column;align-items:center;gap:${s.sm}px;pointer-events:none;}
.sn-hg{width:100%;height:auto;}
.sn-slide .sn-dogname{position:static;padding:${s.xs}px ${s.md}px;
  font-family:${Hs};font-weight:700;font-size:${d.body}px;letter-spacing:.02em;color:${n.onDark};white-space:nowrap;}
.sn-bars{position:absolute;top:${s.sm}px;left:${s.md}px;right:${s.md}px;display:flex;gap:${s.xs}px;z-index:3;}
.sn-bars i{flex:1 1 0;height:3px;border-radius:${k.pill}px;background:rgba(255,255,255,.35);}
.sn-bars i.is-on{background:${n.onDark};}
/* B9 (audit-sniffer-2026-09-26): predtým onClick — pri viacerých fotkách zjedol gesto
   ťahu karty vo vrchnej polovici (nadradený SnifferHome pri stlačení nad zónou vôbec
   nezačal sledovať ťah). Ťuk vs. ťah sa teraz rozhoduje AŽ PRI PUSTENÍ (nižšie, JS),
   zóna len drží miesto pod prstom a nebráni bublaniu pointer udalostí nahor ku karte. */
.sn-tap{position:absolute;top:0;bottom:45%;width:50%;z-index:3;background:none;border:0;padding:0;cursor:pointer;}
.sn-tap--l{left:0;} .sn-tap--r{right:0;}
.sn-ov{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:${s.xxxl*2}px ${s.lg}px ${s.lg}px;
  /* Fotka viac v prechode, dole ÚPLNE čierna (Matej 25. 9.) — text nesmie stáť na farbe fotky. */
  background:linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.5) 28%, rgba(0,0,0,.86) 62%, #000 100%);
  color:${n.onDark};display:flex;flex-direction:column;gap:${s.sm}px;font-family:${j};}
/* C7 — meno ČLOVEKA je identita: Cinzel 700 (brand lock), nie Space Grotesk zdedený z .sn-ov. */
.sn-nm{margin:0;min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-family:${de};font-weight:700;font-size:${d.h1}px;line-height:1.1;}
.sn-nm span{font-weight:400;}
.sn-meta{margin:0;font-size:${d.label}px;opacity:.85;}
/* flex-wrap — dlhé meno + dva odznaky levelov sa na 360 px inak pobijú (audit C7). */
.sn-head{display:flex;align-items:center;gap:${s.md}px;}
/* Meno nerastie — odznaky stoja hneď za ním (zalomia sa pod meno, keď sa nezmestia), oko vpravo. */
.sn-id{flex:1 1 auto;min-width:0;display:flex;flex-wrap:wrap;align-items:center;gap:${s.xs}px ${s.sm}px;}
.sn-id > .sn-nm{flex:0 1 auto;}
.sn-id.is-tap{padding:0;border:0;background:none;color:inherit;text-align:left;cursor:pointer;font:inherit;}
/* Odznaky pri mene menšie než na profile (46 px) — aby sa na PC karte (≈350 px) zmestili s menom do riadku. */
.sn-head .rk{--s:30px;}
.sn-lv{display:flex;flex-wrap:wrap;align-items:center;gap:${s.xs}px;}
/* HORNÝ OKRAJ — levely a štatistika (kolo 2). Pod pásikmi fotiek, s vlastným tieňom zhora,
   aby na svetlej fotke nestratili čitateľnosť. Klik prepúšťa (ťuk na fotku ide pod ním). */
.sn-top{position:absolute;left:0;right:0;top:0;z-index:2;pointer-events:none;
  padding:${s.lg+s.xs}px ${s.lg}px ${s.xxxl}px;
  background:linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.25) 60%, rgba(0,0,0,0) 100%);
  display:flex;flex-direction:column;align-items:flex-start;gap:${s.sm}px;color:${n.onDark};font-family:${j};}
/* LEVELY — odznak, nie štítok (Matej 25. 9.: „vo farbe a v luxusnejšom chipe… lapis alebo zlato").
   PÚTNIK nesie farbu SVOJHO pásma (tierOfLevel, tá istá ako prstenec na mape), DEVOTION je
   lapis so zlatým písmom. Číslo v kotúči vľavo, zlatý lem, jemný lesk. */
.sn-lv > span{display:inline-flex;align-items:center;gap:${s.sm}px;padding:${s.xs}px ${s.md}px ${s.xs}px ${s.xs}px;
  border-radius:${k.pill}px;border:1px solid ${je.edge};white-space:nowrap;box-shadow:${ae.panel};
  font-family:${j};font-weight:600;font-size:${d.micro}px;letter-spacing:.14em;text-transform:uppercase;}
.sn-lv > span > b{display:inline-grid;place-items:center;min-width:${s.lg+s.xs}px;height:${s.lg+s.xs}px;padding:0 ${s.xs}px;
  border-radius:${k.pill}px;font-family:${j};font-weight:600;font-size:${d.micro}px;letter-spacing:0;}
.sn-lv .is-pilgrim > b{background:rgba(0,0,0,.28);color:#fff;}
.sn-lv .is-devotion{background:${$.grad};color:${$.ink};}
.sn-lv .is-devotion > b{background:${je.grad};color:${je.ink};}
/* PSY pred zámerom: „1 pes · HEKTOR · Hľadám: Priateľstvo" */
/* Pes TESNE pod menom, bez ikonky labky (Matej 26. 9.: „daj preč ikonku toho psa a daj to meno
   psa blízko mena človeka") — záporný okraj zruší polovicu medzery stĺpca .sn-ov. */
/* Od 30. 10. môže byť nad psom druhý riadok (odznaky zalomené pod meno) — ťah nahor len o xs, inak by ich prekryl. */
.sn-dogs{margin:-${s.xs}px 0 0;display:flex;align-items:center;gap:${s.xs}px;font-size:${d.body}px;min-width:0;}
.sn-dogs > b{font-weight:400;opacity:.75;}
.sn-dogs em{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* C7 — karta nie je OFICIÁLNY povrch (DOG ID/certifikát/share/WALL/PackTree) → meno psa
   stačí plain Cinzel, nie Decorative (brand lock, výnimka zúžená 2026-08-14). */
.sn-dogs em{font-style:normal;font-family:${de};font-weight:700;font-size:${d.body}px;letter-spacing:.02em;}
.sn-lbl{align-self:center;font-size:${d.label}px;opacity:.75;margin-right:${s.xs}px;}
.sn-chip{align-self:flex-start;display:inline-flex;align-items:center;gap:${s.sm}px;padding:${s.xs}px ${s.md}px;
  font-family:${j};font-size:${d.label}px;white-space:nowrap;}
.sn-chip b{font-family:${j};font-weight:600;font-size:${d.body}px;}
.sn-chip i{font-style:normal;opacity:.5;}
.sn-bio{margin:0;font-size:${d.label}px;line-height:1.45;opacity:.92;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.sn-pills{display:flex;flex-wrap:wrap;gap:${s.xs}px;}
.sn-pills .pk-pill{font-family:${j};font-size:${d.label}px;padding:${s.xs}px ${s.sm}px;}
.sn-stage{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;}
.sn-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:${s.xl}px;text-align:center;
  font-family:${j};font-size:${d.body}px;color:${n.onDark};}
`,$s=t=>t===1?"one":t>=2&&t<=4?"few":"other";function vs({card:t,tx:a}){const i=t.pilgrimLevel??Ws(t.trips??[]);return e.jsxs("span",{className:`sn-lv rk-row${t.learnerLevel?" rk3":""}`,children:[e.jsx("style",{children:ia}),e.jsx(na,{years:t.servantYears??null,activeDays:null,label:a("pack.ladder.servant","Servant")}),e.jsx(oa,{level:i||1,pct:t.pilgrimPct??0,label:`${a("pack.sniffer.pilgrim","Pilgrim")} ${i||1}`}),t.learnerLevel?e.jsx(ra,{level:t.learnerLevel,pct:t.learnerPct??0,label:`${a("pack.rank.learner","Disciple")} ${t.learnerLevel}`}):null]})}function ya({card:t,tx:a}){const i=Zt(t.trips??[]);return i.count===0?null:e.jsxs("span",{className:"sn-chip pk-pill pk-pill--dark",children:[e.jsxs("span",{children:[e.jsx("b",{children:i.count})," ",a(`pack.sniffer.tripsWord.${$s(i.count)}`,i.count===1?"trip":"trips")]}),e.jsx("i",{children:"·"}),e.jsxs("span",{children:[e.jsx("b",{children:i.km})," km"]}),e.jsx("i",{children:"·"}),e.jsxs("span",{children:[e.jsx("b",{children:i.countries})," ",a(`pack.sniffer.countriesWord.${$s(i.countries)}`,i.countries===1?"country":"countries")]})]})}function Ys(t,a){return[t.region,Gs(t,a)].filter(Boolean).join(" · ")}function Le({card:t,tx:a,back:i=!1,className:r="",style:p,onOpenFull:c,lean:l=!1}){var A;const[o,b]=m.useState(0),S=t.photos.filter(Boolean),z=S[Math.min(o,S.length-1)],w=h=>b(_=>(_+h+S.length)%Math.max(1,S.length)),f=Ys(t,a);return e.jsxs("div",{className:`sn-card${i?" is-back":""} ${r}`,style:p,children:[z?e.jsx("div",{className:"sn-slide",children:e.jsx("img",{className:"sn-bg",src:Fe(z,400,640),alt:"",draggable:!1})}):e.jsx("div",{className:"sn-empty",children:a("pack.sniffer.noPhoto","No photo yet")}),S.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"sn-bars","aria-hidden":!0,children:S.map((h,_)=>e.jsx("i",{className:_===o?"is-on":""},_))}),e.jsx("button",{type:"button",className:"sn-tap sn-tap--l","aria-label":a("pack.sniffer.prevPhoto","Previous photo"),onPointerDown:h=>{const _=h.currentTarget.dataset;_.x=String(h.clientX),_.y=String(h.clientY),_.t=String(Date.now())},onPointerUp:h=>{const _=h.currentTarget.dataset;_.x!==void 0&&Math.abs(h.clientX-Number(_.x))<8&&Math.abs(h.clientY-Number(_.y))<8&&Date.now()-Number(_.t)<300&&w(-1)}}),e.jsx("button",{type:"button",className:"sn-tap sn-tap--r","aria-label":a("pack.sniffer.nextPhoto","Next photo"),onPointerDown:h=>{const _=h.currentTarget.dataset;_.x=String(h.clientX),_.y=String(h.clientY),_.t=String(Date.now())},onPointerUp:h=>{const _=h.currentTarget.dataset;_.x!==void 0&&Math.abs(h.clientX-Number(_.x))<8&&Math.abs(h.clientY-Number(_.y))<8&&Date.now()-Number(_.t)<300&&w(1)}})]}),e.jsx("div",{className:"sn-top",children:e.jsx(ya,{card:t,tx:a})}),e.jsxs("div",{className:"sn-ov",children:[e.jsx("div",{className:"sn-head",children:c?e.jsxs("button",{type:"button",className:"sn-id is-tap","aria-label":a("pack.sniffer.fullProfile","Full profile"),onClick:h=>{h.stopPropagation(),c()},children:[e.jsxs("span",{className:"sn-nm",children:[t.name,e.jsx(es,{n:t.member,tx:a,size:"0.8em"}),t.age?e.jsxs(e.Fragment,{children:[", ",e.jsx("span",{children:t.age})]}):null]}),e.jsx(vs,{card:t,tx:a})]}):e.jsxs("span",{className:"sn-id",children:[e.jsxs("p",{className:"sn-nm",children:[t.name,e.jsx(es,{n:t.member,tx:a,size:"0.8em"}),t.age?e.jsxs(e.Fragment,{children:[", ",e.jsx("span",{children:t.age})]}):null]}),e.jsx(vs,{card:t,tx:a})]})}),t.dogs.length>0&&e.jsxs("p",{className:"sn-dogs",children:[e.jsx("b",{children:"+"}),e.jsx("em",{children:t.dogs.map(h=>h.name).filter(Boolean).join(", ")})]}),!l&&t.intents.length>0&&e.jsxs("div",{className:"sn-pills",children:[e.jsx("span",{className:"sn-lbl",children:a("pack.sniffer.seeking","Looking for:")}),t.intents.map(h=>e.jsx("span",{className:"pk-pill pk-pill--dark",children:a(`pack.buddy.intent.${h}`,h)},`i-${h}`))]}),f&&e.jsxs("p",{className:"sn-meta",children:[e.jsx(Bs,{})," ",f]}),!l&&((A=t.bio)==null?void 0:A.trim())&&e.jsx("p",{className:"sn-bio",children:t.bio.trim()})]})]})}function ls({tx:t,reloadKey:a,onOpenFull:i}){const[r,p]=m.useState(null);return m.useEffect(()=>{Xt().then(p).catch(()=>p(null))},[a]),e.jsx("div",{className:"sn-stage",children:r&&e.jsx(Le,{card:r,tx:t,onOpenFull:i?()=>i(r):void 0},JSON.stringify(r.photos))})}const Us=`
/* STĹPEC: obrázok hore celou šírkou, text pod ním. Obrázok sa zmenšuje LEN výškou
   (cover orezáva oblohu a trávu, nikdy boky — vtip je na krajoch: nos pri zadku).
   Spodok obrázka vybledne do čiernej, na ktorej stojí text. */
.se-box{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;border-radius:${k.card}px;overflow:hidden;box-shadow:${ae.panel};background:#000;
  display:flex;flex-direction:column;}
.se-box > img{flex:0 1 auto;min-height:0;width:100%;object-fit:cover;object-position:50% 72%;display:block;
  -webkit-mask-image:linear-gradient(180deg,#000 84%,transparent 100%);mask-image:linear-gradient(180deg,#000 84%,transparent 100%);}
.se-txt{margin-top:auto;padding:${s.sm}px ${s.lg}px ${s.lg}px;color:${n.onDark};font-family:${j};
  display:flex;flex-direction:column;gap:${s.md}px;}
/* UPS… = veľký koralový nadpis v tvare PACK_HEAD.card (farba srdca loga, Matej 26. 9.),
   veta pod ním malá — rozdiel musí byť zrejmý na prvý pohľad. */
.se-oops{color:${Ms};line-height:1.1;}
.se-txt strong{font-weight:500;font-size:${d.body}px;line-height:1.4;margin-top:-${s.sm}px;}
.se-note{padding:${s.sm}px ${s.md}px;display:flex;flex-direction:column;gap:${s.xs}px;}
.se-note i{font-style:normal;color:${n.cardEdge};}
.se-note p{margin:0;font-size:${d.label}px;line-height:1.45;color:${n.onDark};}
`;function as({tx:t,line:a}){return e.jsxs("div",{className:"se-p3d",children:[e.jsx("img",{src:"/icons/jazvecik-zadok.webp",alt:""}),e.jsx("b",{className:"se-oops",children:t("pack.sniffer.emptyOops","Oops…")}),e.jsx("strong",{children:a??t("pack.sniffer.emptyTitle","Nobody here matches your preferences.")}),e.jsxs("div",{className:"se-note",style:{...oe.subblockDark},children:[e.jsx("i",{style:{...rt.label},children:t("pack.sniffer.emptyNoteLabel","Notice")}),e.jsx("p",{children:t("pack.sniffer.emptyNote","There are only a few of us, DOGYPT has only just been born… Bring your friends here and help us fill it.")})]})]})}const be=300,Ne=Ms,we=[50,60,70,80,90,100],ds=`
.spn-map{width:100%;height:auto;display:block;border-radius:${k.tile}px;background:${n.tileBg};}
.spn-map.is-edit{cursor:crosshair;}
.spn-land{fill:${n.card};stroke:${n.inkStrong};stroke-width:1.2;stroke-linejoin:round;}
.spn-reach{fill:${Ne};fill-opacity:.12;stroke:${Ne};stroke-width:1.5;stroke-dasharray:6 4;}
.spn-ctry{position:relative;display:inline-flex;align-items:center;gap:${s.sm}px;font-family:${j};font-size:${d.label}px;
  font-weight:600;color:${n.inkStrong};border:1px solid ${n.border};border-radius:${k.pill}px;background:${n.cardSoft};
  padding:${s.xs}px ${s.md}px;cursor:pointer;max-width:100%;white-space:nowrap;}
.spn-ctry img{width:${s.lg}px;height:${s.md}px;object-fit:cover;}
.spn-ctry select{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;}
.spn-ctry i{width:${s.sm}px;height:${s.sm}px;border-right:1.5px solid ${n.inkWarm};border-bottom:1.5px solid ${n.inkWarm};transform:translateY(-25%) rotate(45deg);}
.spn-reachrow{display:flex;align-items:center;gap:${s.md}px;font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
.spn-reachrow b{flex:0 0 auto;min-width:${s.xxxl+s.lg}px;text-align:right;font-weight:600;color:${n.inkStrong};}
.spn-reachrow input{flex:1 1 auto;accent-color:${$.edge};}
/* C9 — varovanie ide farbou VAROVANIA (PICK_INK.red), nie koralovou logom (tá je SNIFFER, nie chyba). */
.spn-warn{margin:0;font-family:${j};font-size:${d.label}px;color:${te.red};}
`;let ge=null,ws=null;function Vs(){return ws??(ws=lt(()=>import("./worldOutline.generated-kyxAqh4a.js"),[]).then(t=>ge=t.WORLD_OUTLINE)),ws}function $a(t){if(t.length<2)return t;const a=c=>[c.reduce((l,o)=>l+o[0],0)/c.length,c.reduce((l,o)=>l+o[1],0)/c.length],i=t.reduce((c,l)=>l.length>c.length?l:c),[r,p]=a(i);return t.filter(c=>{const[l,o]=a(c);return Math.abs(l-r)<12&&Math.abs(o-p)<18})}function Xs(t){const a=ss[t],[,i]=m.useState(0);if(m.useEffect(()=>{!a&&!ge&&Vs().then(()=>i(p=>p+1))},[a]),a)return a;const r=ge==null?void 0:ge[t];return r?$a(r):null}function va(){const[t,a]=m.useState(()=>Object.keys(ge??ss));return m.useEffect(()=>{Vs().then(i=>a(Array.from(new Set([...Object.keys(i),...Object.keys(ss)]))))},[]),t}function wa(t,a,i){let r=!1;for(const p of t)for(let c=0,l=p.length-1;c<p.length;l=c++){const[o,b]=p[c],[S,z]=p[l];o>a!=S>a&&i<(z-b)*(a-o)/(S-o)+b&&(r=!r)}return r}function Zs(t){const a=t.flat(),i=Math.min(...a.map(f=>f[0])),r=Math.max(...a.map(f=>f[0])),p=Math.min(...a.map(f=>f[1])),c=Math.max(...a.map(f=>f[1])),l=Math.cos((i+r)/2*Math.PI/180),o=be*(r-i)/((c-p)*l),b=(f,A)=>[(A-p)/(c-p)*be,(r-f)/(r-i)*o],S=(f,A)=>({lat:r-A/o*(r-i),lng:p+f/be*(c-p)}),z=t.map(f=>"M"+f.map(([A,h])=>b(A,h).map(_=>_.toFixed(1)).join(",")).join("L")+"Z").join(""),w=o/((r-i)*110.6);return{H:o,xy:b,back:S,d:z,pxKm:w}}function ps(t,a,i,r){const p=l=>{const o=(l??"").toLowerCase();return o==="uk"?"gb":o};if(t!=null&&t.country)return p(t.country);if(r)return p(r);if(a&&a!=="OTHER")return p(a);const c=typeof navigator<"u"?navigator.language.split("-")[1]:void 0;return c?p(c):{sk:"sk",cs:"cz",de:"de",pl:"pl",hu:"hu"}[i??""]??"sk"}function Js(){const{lang:t}=Ce();return m.useMemo(()=>{try{const a=new Intl.DisplayNames([t],{type:"region"});return i=>a.of(i.toUpperCase())??Qe(i)}catch{return Qe}},[t])}function qs({iso:t,onPick:a,tx:i}){const r=va(),p=Js(),c=m.useMemo(()=>r.map(l=>[l,p(l)]).sort((l,o)=>l[1].localeCompare(o[1])),[r,p]);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ds}),e.jsxs("label",{className:"spn-ctry",children:[e.jsx("img",{src:ts(t,80),alt:""}),p(t),e.jsx("i",{"aria-hidden":!0}),e.jsx("select",{value:t,"aria-label":i("pack.sniffer.pin.country","Country"),onChange:l=>a(l.target.value),children:c.map(([l,o])=>e.jsx("option",{value:l,children:o},l))})]})]})}function ja({iso:t}){const a=Xs((t??"sk").toLowerCase()),i=m.useMemo(()=>a?Zs(a):null,[a]);return i?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ds}),e.jsx("svg",{className:"spn-map",viewBox:`-12 -12 ${be+24} ${i.H+24}`,"aria-hidden":!0,children:e.jsx("path",{className:"spn-land",d:i.d})})]}):null}function Qs({tx:t,pin:a,iso:i,radiusKm:r,onRadius:p}){const c=Xs(i),l=m.useMemo(()=>c?Zs(c):null,[c]),[o,b]=m.useState(!1),S=y=>{if(y===null||y>100)return we.length-1;let C=0;return we.forEach((M,L)=>{M!==null&&Math.abs(M-y)<Math.abs(we[C]-y)&&(C=L)}),C},[z,w]=m.useState(S(r));m.useEffect(()=>w(S(r)),[r]);const f=we[z];if(!l||!c)return e.jsx("div",{className:"spn-map",style:{aspectRatio:"2 / 1"},"aria-busy":!0});const A=y=>{const C=y.currentTarget,M=C.getScreenCTM();if(!M)return;const L=C.createSVGPoint();L.x=y.clientX,L.y=y.clientY;const ee=L.matrixTransform(M.inverse()),Q=l.back(ee.x,ee.y);if(!wa(c,Q.lat,Q.lng)){b(!0);return}b(!1),pe({pin:{country:i,lat:Math.round(Q.lat*100)/100,lng:Math.round(Q.lng*100)/100}})},h=()=>{f!==r&&p(f)},_=a&&a.country.toLowerCase()===i?l.xy(a.lat,a.lng):null,O=f===null?Math.max(l.H,be):Math.max(26,f*l.pxKm),P=13;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:ds}),e.jsxs("svg",{className:"spn-map is-edit",viewBox:`-12 -12 ${be+24} ${l.H+24}`,onClick:A,role:"img","aria-label":t("pack.sniffer.pin.tap","Tap the map to drop your pin"),children:[e.jsx("defs",{children:e.jsx("clipPath",{id:"spn-clip",children:e.jsx("path",{d:l.d})})}),e.jsx("path",{className:"spn-land",d:l.d}),_&&e.jsxs("g",{style:{pointerEvents:"none"},children:[e.jsxs("g",{clipPath:"url(#spn-clip)",children:[e.jsx("circle",{className:"spn-reach",cx:_[0],cy:_[1],r:O}),f!==null&&e.jsx("circle",{cx:_[0],cy:_[1],r:O*.62,fill:"none",stroke:Ne,strokeWidth:2,strokeDasharray:"6 4"})]}),e.jsxs("g",{transform:`translate(${_[0].toFixed(1)},${_[1].toFixed(1)})`,children:[f!==null&&e.jsxs("g",{fill:"none",stroke:Ne,strokeWidth:3,children:[e.jsx("circle",{r:O}),e.jsx("path",{d:`M0 ${-O-8}V${-O+6}M0 ${O-6}V${O+8}M${-O-8} 0H${-O+6}M${O-6} 0H${O+8}`})]}),e.jsx("circle",{r:P,fill:Ne,stroke:n.card,strokeWidth:2}),e.jsx("image",{href:"/icons/pack/paw-full.svg",x:-P+4,y:-P+4,width:(P-4)*2,height:(P-4)*2,style:{filter:"brightness(0) invert(1)"}})]})]})]}),o&&e.jsx("p",{className:"spn-warn",children:t("pack.sniffer.pin.outside","Drop the pin inside the country")}),e.jsxs("label",{className:"spn-reachrow",children:[e.jsx("span",{children:t("pack.sniffer.pin.reach","Area")}),e.jsx("input",{type:"range",min:0,max:we.length-1,step:1,value:z,onChange:y=>w(Number(y.target.value)),onPointerUp:h,onKeyUp:h,onTouchEnd:h}),e.jsx("b",{children:f===null?t("pack.sniffer.pin.whole","no limit"):t("pack.buddy.km","up to {n} km",{n:f})})]})]})}const js=40,Na=["sk","cz","at","pl","hu","si","hr","ch"],Sa=[["now","Now"],["week","In a week"],["summer","In summer"],["date","Pick a date"]],et="dogypt_sniffer_search_mode",za=t=>Pe(t,180,240),_a=()=>{try{return localStorage.getItem(et)==="far"?"far":"near"}catch{return"near"}},Ca=t=>{try{localStorage.setItem(et,t)}catch{}},Pa=`
.ss-head{display:flex;align-items:center;gap:${s.sm}px;}
.ss-flt{flex:0 0 auto;width:${s.xxl+s.sm}px;height:${s.xxl+s.sm}px;border-radius:${k.pill}px;
  border:1px solid ${n.border};background:${n.cardSoft};display:flex;align-items:center;justify-content:center;cursor:pointer;}
.ss-flt.is-on{${re($.edge,te.lapis,.16)}}
.ss-segs{flex:1 1 auto;display:flex;gap:${s.xs}px;padding:${s.xs}px;border-radius:${k.pill}px;border:1px solid ${n.border};background:${n.cardSoft};}
/* C5 — vizuálne ostáva rovnaké, ale ťukacia plocha ≥40 px cez neviditeľný ::after (vzor HIT_CSS). */
.ss-seg{position:relative;flex:1 1 0;padding:${s.sm}px;border:0;border-radius:${k.pill}px;background:transparent;cursor:pointer;
  font-family:${j};font-size:${d.label}px;color:${n.inkWarm};white-space:nowrap;}
.ss-seg::after{content:'';position:absolute;inset:-6px;}
.ss-seg.is-on{${re($.edge,te.lapis,.16)};font-weight:600;}
/* C9 — ▾/▴ boli holé znaky, teraz kreslený chevron (vzor .spn-ctry i v SnifferPin.tsx). */
.ss-seg i{display:inline-block;width:6px;height:6px;margin-left:${s.xs}px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;}
.ss-seg i.is-up{transform:translateY(2px) rotate(-135deg);}
.ss-seg i.is-down{transform:translateY(-2px) rotate(45deg);}
.ss-flag{flex:0 0 auto;height:${s.xxl+s.sm}px;padding:0 ${s.md}px;border-radius:${k.pill}px;border:1px solid ${$.edge};
  background:${n.cardSoft};display:flex;align-items:center;cursor:pointer;}
.ss-flag img{width:${s.xl}px;height:${s.lg}px;object-fit:cover;}
.ss-drop{padding:${s.lg}px;display:flex;flex-direction:column;gap:${s.md}px;}
.ss-world{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
.ss-ctry{display:flex;align-items:center;gap:${s.sm}px;padding:${s.xs}px ${s.md}px ${s.xs}px ${s.xs}px;
  border-radius:${k.tile}px;border:1px solid ${n.border};background:${n.tileBg};cursor:pointer;opacity:.6;font-family:${j};text-align:left;}
.ss-ctry img{width:${s.xl}px;height:${s.lg}px;object-fit:cover;}
.ss-ctry span{display:flex;flex-direction:column;font-size:${d.label}px;color:${n.inkStrong};}
.ss-ctry small{font-size:${d.micro}px;color:${n.inkDim};}
.ss-ctry.is-glow{opacity:1;box-shadow:0 0 0 1px ${n.accentGold}, 0 0 ${s.md}px ${dt(n.accentGold,.55)};}
.ss-ctry.is-on{opacity:1;${re($.edge,te.lapis,.16)}}
.ss-note{margin:0;font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
.ss-area{width:100%;min-height:${s.xxxl+s.md}px;resize:vertical;border-radius:${k.field}px;padding:${s.sm}px ${s.md}px;
  font-family:${j};font-size:${d.body}px;color:${n.inkStrong};}
.ss-pills{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
.ss-pills .pk-pill{font-family:${j};font-size:${d.label}px;}
.ss-pills .pk-pill.is-on{${re($.edge,te.lapis,.16)}}
.ss-date{border-radius:${k.field}px;padding:${s.xs}px ${s.sm}px;font-family:${j};font-size:${d.label}px;}
.ss-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:${s.md}px;}
.ss-mini{display:flex;flex-direction:column;overflow:hidden;padding:0;cursor:pointer;text-align:left;font-family:${j};}
.ss-mini img{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;}
/* C7 — meno človeka v mriežke HĽADAŤ = Cinzel 700 (brand lock), nie zdedený Space Grotesk. */
.ss-mini b{padding:${s.sm}px ${s.sm}px 0;font-family:${de};font-weight:700;font-size:${d.body}px;color:${n.inkStrong};}
.ss-mini span{padding:0 ${s.sm}px ${s.sm}px;font-size:${d.label}px;color:${n.inkDim};}
.ss-mini:hover{box-shadow:${ae.panel};}
`;function Ea({tx:t,onOpen:a}){const{profile:i}=Ds(),{lang:r}=Ce(),p=Js(),c=i==null?void 0:i.human,l=c==null?void 0:c.heading,o=(l==null?void 0:l.country)??ps(c==null?void 0:c.pin,c==null?void 0:c.nationality,r),[b,S]=m.useState(_a),[z,w]=m.useState(!1),[f,A]=m.useState(!1),[h,_]=m.useState(null),[O,P]=m.useState(null),[y,C]=m.useState(null),[M,L]=m.useState(!1),[ee,Q]=m.useState((l==null?void 0:l.note)??"");m.useEffect(()=>{Q((l==null?void 0:l.note)??"")},[l==null?void 0:l.note]);const se=u=>{w(u==="far"?b==="far"?!z:!0:!1),S(u),Ca(u)},X=m.useMemo(()=>{const u=new Map;for(const V of Ls){const Z=Bt(V);u.set(Z,(u.get(Z)??0)+1)}return[...new Set([...Na,...u.keys()])].map(V=>({iso:V,trips:u.get(V)??0})).sort((V,Z)=>Z.trips-V.trips||V.iso.localeCompare(Z.iso))},[]),q=u=>void pe({heading:{country:o,when:(l==null?void 0:l.when)??"now",...l,...u}});m.useEffect(()=>{let u=!0;return P(null),C(null),b==="near"?Jt(h).then(H=>{u&&P(H)}).catch(()=>{u&&P([])}):us(o,[],h).then(H=>{u&&(P(H),C(H.cursor??null))}).catch(()=>{u&&P([])}),()=>{u=!1}},[b,o,h]);const ie=()=>{!y||M||(L(!0),us(o,[],h,y).then(u=>{P(H=>[...H??[],...u]),C(u.cursor??null)}).catch(()=>{}).finally(()=>L(!1)))},T=((c==null?void 0:c.intents)??[]).filter(u=>u!=="community"),B=!!(c!=null&&c.pin),J=u=>Gs(u,t);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Pa}),e.jsx("style",{children:Us}),e.jsxs("div",{className:"ss-head",children:[e.jsx("button",{type:"button",className:`ss-flt${h?" is-on":""}`,"aria-pressed":f,"aria-label":t("pack.sniffer.search.filter","Filter"),onClick:()=>A(u=>!u),children:e.jsx(Ks,{name:"sliders",size:s.lg,tint:"dark"})}),e.jsxs("div",{className:"ss-segs",role:"tablist",children:[e.jsx("button",{type:"button",role:"tab","aria-selected":b==="near",className:`ss-seg${b==="near"?" is-on":""}`,onClick:()=>se("near"),children:t("pack.sniffer.search.near","Nearby")}),e.jsxs("button",{type:"button",role:"tab","aria-selected":b==="far","aria-expanded":z,className:`ss-seg${b==="far"?" is-on":""}`,onClick:()=>se("far"),children:["FAR SNIFF ",e.jsx("i",{className:z?"is-up":"is-down","aria-hidden":!0})]})]}),b==="far"&&e.jsx("button",{type:"button",className:"ss-flag","aria-expanded":z,onClick:()=>w(u=>!u),"aria-label":t("pack.sniffer.pin.country","Country"),children:e.jsx("img",{src:ts(o,80),alt:""})})]}),f&&T.length>0&&e.jsx("div",{className:"ss-pills",children:wt.filter(u=>T.includes(u.value)).map(u=>e.jsx("button",{type:"button","aria-pressed":h===u.value,className:`pk-pill pk-pill--tap${h===u.value?" is-on":""}`,onClick:()=>_(h===u.value?null:u.value),children:t(`pack.buddy.intent.${u.value}`,u.labelEN)},u.value))}),b==="far"&&z&&e.jsxs("section",{className:"ss-drop",style:{...oe.card},children:[e.jsx("div",{className:"ss-world",children:X.map(u=>e.jsxs("button",{type:"button","aria-pressed":u.iso===o,className:`ss-ctry${u.trips>=js?" is-glow":""}${u.iso===o?" is-on":""}`,onClick:()=>q({country:u.iso}),children:[e.jsx("img",{src:ts(u.iso,80),alt:""}),e.jsxs("span",{children:[p(u.iso),e.jsx("small",{children:t(`pack.sniffer.trips.${u.trips===1?"one":u.trips>=2&&u.trips<=4?"few":"other"}`,"{n} trips",{n:u.trips})})]})]},u.iso))}),e.jsx("textarea",{className:"pf-field ss-area",maxLength:140,value:ee,onChange:u=>Q(u.target.value),onBlur:()=>{((l==null?void 0:l.note)??"")!==ee.trim()&&q({note:ee.trim()||void 0})},placeholder:t("pack.sniffer.search.notePh","Where are you heading? Find a buddy before you go…")}),e.jsxs("div",{className:"ss-pills",children:[Sa.map(([u,H])=>e.jsx("button",{type:"button","aria-pressed":(l==null?void 0:l.when)===u,className:`pk-pill pk-pill--tap${(l==null?void 0:l.when)===u?" is-on":""}`,onClick:()=>q({when:u}),children:t(`pack.sniffer.search.when.${u}`,H)},u)),(l==null?void 0:l.when)==="date"&&e.jsx("input",{type:"date",className:"pf-field ss-date",value:l.date??"",onChange:u=>q({date:u.target.value})})]}),e.jsx("p",{className:"ss-note",children:t("pack.sniffer.search.glowNote","Lit up = {n}+ trips with the PILGRIM guide · find a buddy there before you go",{n:js})})]}),b==="near"&&e.jsx("p",{className:"ss-note",style:{textAlign:"center"},children:B?t("pack.sniffer.search.nearNote","Everyone around your pin who shows up here"):t("pack.sniffer.search.noPin","Set your pin in Your profile (step 3/6 · My patch) to see who’s around.")}),O&&O.length>0&&e.jsx("div",{className:"ss-grid",children:O.map(u=>{var V;const H=u.pilgrimLevel??Ws(u.trips??[]);return e.jsxs("button",{type:"button",className:"ss-mini",style:{...oe.card},onClick:()=>a(u),children:[e.jsx("img",{src:za(u.photos[0]??((V=u.dogs[0])==null?void 0:V.photo)),alt:""}),e.jsxs("b",{children:[u.name,u.age?`, ${u.age}`:""]}),e.jsx("span",{children:[H?t("pack.sniffer.pilgrimLv","Pilgrim {n}",{n:H}):"",J(u)||u.region].filter(Boolean).join(" · ")})]},u.member)})}),b==="far"&&y&&e.jsx("button",{type:"button",className:"pk-pill pk-pill--tap",style:{display:"block",margin:"0 auto"},disabled:M,onClick:ie,children:M?"…":t("pack.sniffer.ui.loadMore","Load more")}),O&&O.length===0&&(b==="far"||B)&&e.jsx(as,{tx:t}),b==="far"&&e.jsx("p",{className:"ss-note",style:{textAlign:"center"},children:t("pack.sniffer.search.mutual","You only see people you’re also shown to.")})]})}const Ns=t=>Fs(t,"c_fill,g_auto,w_240,h_240,f_auto,q_auto"),Oe="/images/sniffer/zhoda/",Ta=[[1,4,0,22],[2,30,.18,26],[3,14,.36,18],[4,42,.54,20],[5,22,.72,16]],Aa=`
.mr{display:flex;flex-direction:column;align-items:center;gap:${s.md}px;text-align:center;width:100%;max-width:360px;}
.mr-duo{position:relative;width:282px;height:188px;cursor:pointer;outline:none;-webkit-user-select:none;user-select:none;}
/* Ťah prstom/myšou po scéne nesmie obrázky OZNAČIŤ (modrý výber, nájdené 26. 9. pri nahrávke swipu). */
.mr-duo img{-webkit-user-drag:none;pointer-events:none;}

/* 1 · SCÉNA Z VRSTIEV — psy vchádzajú zo strán (orezané rámom), stretnú sa, srdiečka, scéna zmizne. */
.mr-scene{position:absolute;inset:0;border-radius:${k.tile}px;overflow:hidden;opacity:0;animation:mrScene 3.3s ease both;}
.mr-scene > img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.mr-scene .dL{animation:mrDogL 1.1s cubic-bezier(.3,.7,.3,1) .2s both;}
/* Čuchanie = zväčšenie od PRAVÉHO okraja: nos ide vpred, okraj vrstvy ostane v ráme (posun by odkryl pás). */
.mr-scene .dR{transform-origin:100% 70%;animation:mrDogR 1.1s cubic-bezier(.3,.7,.3,1) .2s both, mrSniff .5s ease-in-out 1.4s 2;}
/* Srdiečka vyletia nad hlavou čierneho, vpravo od chvosta (ako na predlohe) — cez chvost boli neprehľadné. */
.mr-scene .ht{position:absolute;left:47%;top:34%;width:var(--w);height:auto;right:auto;bottom:auto;margin-left:calc(var(--w) / -2);opacity:0;
  animation:mrHt 1.4s ease-out calc(1.7s + var(--d)) forwards;}

/* 2 · FOTKY — dotknú sa a zapadnú do seba asi do tretiny (obe tváre ostanú celé), pulzujú spolu. */
.mr-pair{position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-52px 0 0 -52px;animation:mrPulse .45s ease 4s both;}
.mr-pair .pL,.mr-pair .pR{position:absolute;inset:0;width:100%;height:100%;border-radius:${k.pill}px;border:3px solid ${$.ink};
  object-fit:cover;display:block;background:${n.pageBg};opacity:0;}
.mr-pair .pL{animation:mrJoinL 1s cubic-bezier(.5,0,.3,1) 3s both;}
.mr-pair .pR{animation:mrJoinR 1s cubic-bezier(.5,0,.3,1) 3s both;}

.mr h2{margin:0;font-family:${de};font-weight:700;font-size:${d.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${$.ink};
  opacity:0;animation:mrPop .5s cubic-bezier(.3,1.6,.5,1) 4.3s forwards;}
.mr p{margin:0;font-family:${j};font-size:${d.body}px;color:${n.onDark};opacity:0;animation:mrRv .5s ease 4.6s forwards;}
/* B11 (audit-sniffer-2026-09-26): tlačidlá boli takmer 5 s neviditeľné, ale klikateľné.
   pointer-events je nespojitá vlastnosť — dva tesné kroky tesne pred koncom animácie
   spôsobia, že sa prepne až vtedy, keď je blok naozaj vidno, nie skôr. */
.mr-acts{width:100%;display:flex;flex-direction:column;align-items:center;gap:${s.sm}px;opacity:0;pointer-events:none;
  animation:mrActs .5s ease 4.9s forwards;}

@keyframes mrScene{0%{opacity:0}6%{opacity:1}88%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.05)}}
@keyframes mrDogL{from{transform:translateX(-34%)}to{transform:none}}
@keyframes mrDogR{from{transform:translateX(34%)}to{transform:none}}
@keyframes mrSniff{0%,100%{transform:none}50%{transform:scale(1.035)}}
@keyframes mrHt{0%{opacity:0;transform:translate(0,10px) scale(.3)}18%{opacity:1;transform:translate(calc(var(--x) * .3),-12px) scale(1)}
  60%{opacity:1;transform:translate(var(--x),-40px) scale(1) rotate(-8deg)}100%{opacity:0;transform:translate(calc(var(--x) * 1.2),-70px) scale(.9) rotate(6deg)}}
@keyframes mrJoinL{0%{opacity:0;transform:translateX(-96px) scale(.8)}25%{opacity:1}
  60%{opacity:1;transform:translateX(-52px) scale(1)}100%{opacity:1;transform:translateX(-34px) scale(1)}}
@keyframes mrJoinR{0%{opacity:0;transform:translateX(96px) scale(.8)}25%{opacity:1}
  60%{opacity:1;transform:translateX(52px) scale(1)}100%{opacity:1;transform:translateX(34px) scale(1)}}
@keyframes mrPulse{0%{transform:scale(1)}45%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes mrPop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes mrRv{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes mrActs{from{opacity:0;transform:translateY(8px)}99%{pointer-events:none}100%{opacity:1;transform:none;pointer-events:auto}}
@media (prefers-reduced-motion: reduce){
  .mr *,.mr-duo *{animation:none !important;}
  .mr h2,.mr p,.mr-acts,.mr-pair .pL,.mr-pair .pR{opacity:1;}
  .mr-acts{pointer-events:auto;}
  .mr-pair .pL{transform:translateX(-34px);}
  .mr-pair .pR{transform:translateX(34px);}
}
`;function Ia({me:t,them:a,title:i,names:r,children:p}){const[c,l]=m.useState(0);return m.useEffect(()=>{c===0?Ot("sniffer"):Ge("tuk");const o=[window.setTimeout(()=>Ge("tuk"),1700),window.setTimeout(()=>Ge("dopad"),3600)];return()=>o.forEach(clearTimeout)},[c]),e.jsxs("div",{className:"mr",children:[e.jsx("style",{children:Aa}),e.jsxs("div",{className:"mr-duo",onClick:()=>l(o=>o+1),role:"img","aria-label":i,children:[e.jsxs("span",{className:"mr-scene","aria-hidden":!0,children:[e.jsx("img",{src:`${Oe}bg.webp`,alt:""}),e.jsx("img",{className:"dR",src:`${Oe}dog-right.webp`,alt:""}),e.jsx("img",{className:"dL",src:`${Oe}dog-left.webp`,alt:""}),Ta.map(([o,b,S,z])=>e.jsx("img",{className:"ht",src:`${Oe}heart-${o}.webp`,alt:"",style:{"--x":`${b}px`,"--d":`${S}s`,"--w":`${z}px`}},o))]}),e.jsxs("span",{className:"mr-pair",children:[t?e.jsx("img",{className:"pL",src:Ns(t),alt:""}):e.jsx("span",{className:"pL"}),a?e.jsx("img",{className:"pR",src:Ns(a),alt:""}):e.jsx("span",{className:"pR"})]})]}),e.jsx("h2",{children:i}),e.jsx("p",{children:r}),e.jsx("div",{className:"mr-acts",children:p})]},c)}const Oa=900,Ss=300,Da=`
.sfp{width:100%;max-width:${Ss*4+s.lg*3+s.xl*2}px;max-height:100%;display:flex;flex-direction:column;gap:${s.md}px;}
.sfp-row{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:${s.md}px;overflow-y:auto;padding:0 ${s.xs}px ${s.sm}px;}
.sfp-photo{position:relative;flex:0 0 auto;height:min(520px, 72dvh);}
.sfp-card{flex:0 0 auto;padding:${s.lg}px;display:flex;flex-direction:column;gap:${s.sm}px;font-family:${j};}
@media (min-width:${Oa}px){
  .sfp-row{flex-direction:row;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;padding:0 ${s.xl}px ${s.md}px;}
  .sfp-row > *{flex:0 0 ${Ss}px;scroll-snap-align:start;overflow-y:auto;}
  .sfp-photo{height:auto;min-height:480px;}
}
.sfp-eb{font-weight:500;font-size:${d.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${n.inkWarm};}
.sfp-bio{margin:0;font-size:${d.body}px;line-height:1.5;color:${n.inkStrong};white-space:pre-line;overflow-wrap:anywhere;}
.sfp-kv{display:flex;justify-content:space-between;gap:${s.md}px;padding:${s.sm}px 0;border-top:1px solid ${n.hairline};font-size:${d.label}px;color:${n.inkDim};}
.sfp-kv:first-of-type{border-top:0;}
.sfp-kv b{font-weight:600;color:${n.inkStrong};text-align:right;}
.sfp-pills{display:flex;flex-wrap:wrap;gap:${s.xs}px;}
.sfp-pills .pk-pill{font-size:${d.label}px;}
.sfp-sign{display:inline-flex;align-items:center;gap:${s.xs}px;}
.sfp-sign img{height:${d.body}px;width:auto;display:block;}
.sfp-place{margin:0;font-size:${d.label}px;color:${n.inkDim};}
.sfp-two{display:grid;grid-template-columns:1fr 1fr;gap:${s.sm}px;}
.sfp-list{padding:${s.sm}px ${s.md}px;display:flex;flex-direction:column;gap:${s.xs}px;min-width:0;}
/* C6 — dlhý názov výletu sa NEOREZÁVA na jeden riadok, zalomí sa na dva (audit: „Záruby 1…"). */
.sfp-list span{font-size:${d.label}px;color:${n.inkStrong};padding-top:${s.xs}px;border-top:1px solid ${n.hairline};
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.sfp-list small{font-size:${d.label}px;color:${n.inkFaint};}
.sfp-dog{display:flex;flex-direction:column;gap:${s.sm}px;}
/* KOLO 2 (Matej 26. 9.: „heroglyf dajme mimo fotky, dáme len meno psa, heroglyf a potom album").
   Meno a heroglyf stoja NAD albumom na papyruse; heroglyf v brandovej zlatej (na bledom
   podklade — žiarivý filter zo steny patrí na tmavú fotku). */
.sfp-dogname{margin:0;font-family:${Hs};font-weight:700;font-size:${d.h2}px;letter-spacing:.02em;color:${n.inkStrong};text-align:center;}
.sfp-hg{display:block;width:72%;max-width:260px;height:auto;margin:0 auto;
  filter:brightness(0) saturate(100%) invert(48%) sepia(62%) saturate(520%) hue-rotate(8deg) brightness(92%);}
.sfp-dog + .sfp-dog{padding-top:${s.md}px;border-top:1px solid ${n.hairline};}
.sfp-alb{display:grid;grid-template-columns:2fr 1fr;grid-auto-rows:${s.xxxl+s.lg}px;gap:${s.xs}px;}
.sfp-alb > img{width:100%;height:100%;object-fit:cover;border-radius:${k.field}px;}
.sfp-wall{position:relative;grid-row:span 3;border-radius:${k.tile}px;overflow:hidden;border:1px solid ${n.accentGold};background:${n.pageBg};}
.sfp-wall.is-solo{grid-column:1 / -1;grid-row:span 4;}
.sfp-wall__empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.35;}
.sfp-acts{display:flex;justify-content:center;gap:${s.xl}px;padding-bottom:${s.sm}px;}
/* Plávajúci AINUBIS sedí vpravo dole — na úzkom mobile sa rad zúži (ten istý vzor ako balíček). */
@media (max-width:419px){.sfp-acts{gap:${s.lg}px;}}
`,Ra=(t,a)=>t.find(i=>i.value===a);function Ma({dog:t,member:a,tx:i}){var l;const r=[t.photo,...(t.album??[]).filter(o=>o&&o!==t.photo)].filter(Boolean).slice(0,7),[p,...c]=r;return e.jsxs("div",{className:"sfp-dog",children:[t.name&&e.jsxs("p",{className:"sfp-dogname",children:[t.name,e.jsx(es,{n:a,tx:i})]}),t.heroglyph&&e.jsx("img",{className:"sfp-hg",src:ba(t.heroglyph,520),alt:""}),e.jsxs("div",{className:"sfp-alb",children:[e.jsx("div",{className:`sfp-wall sn-slide${c.length?"":" is-solo"}`,children:p?e.jsx("img",{className:"sn-bg",src:Fe(p,220,240),alt:"",style:{objectPosition:"50% 30%"}}):e.jsx("div",{className:"sfp-wall__empty",children:e.jsx(Ks,{name:"paw",size:s.xxl,tint:"white"})})}),c.map(o=>e.jsx("img",{src:Fe(o,100,64),alt:"",loading:"lazy"},o))]}),((l=t.bio)==null?void 0:l.trim())&&e.jsx("p",{className:"sfp-bio",children:t.bio.trim()}),t.temperament.length>0&&e.jsx("div",{className:"sfp-pills",children:t.temperament.map(o=>e.jsx("span",{className:"pk-pill",children:i(`pack.dogTag.${o}`,o)},o))})]})}function st({card:t,tx:a,actions:i}){var w,f,A,h,_,O,P;const r=t.info??{},p=[],c=(y,C)=>{C&&p.push([y,C])},l=(y,C,M)=>{const L=Ra(C,M);return L?`${L.emoji?L.emoji+" ":""}${a(`pack.sniffer.info.${y}.${L.value}`,L.labelEN)}`:M};c(a("pack.sniffer.info.gender","Gender"),l("gender",rs,r.gender)),c(a("pack.sniffer.info.orientation","Orientation"),l("orientation",Rs,r.orientation)),c(a("pack.sniffer.info.nationality","Nationality"),r.nationality?Qe(r.nationality.toLowerCase()):null),c(a("pack.sniffer.info.languages","Languages"),(w=r.languages)!=null&&w.length?r.languages.join(" · "):null),c(a("pack.sniffer.info.smoke","Smoking"),l("smoke",jt,r.smoke)),c(a("pack.sniffer.info.diet","Diet"),l("diet",Nt,r.diet)),c(a("pack.sniffer.info.work","Work"),l("work",St,r.work));const o=qt(t.trips??[]),b=t.wishes??[],S=Ys(t,a),z=y=>ka(y,a);return e.jsxs("div",{className:"sfp",children:[e.jsx("style",{children:Ee}),e.jsx("style",{children:Da}),e.jsxs("div",{className:"sfp-row",children:[e.jsx("div",{className:"sfp-photo",children:e.jsx(Le,{card:t,tx:a,lean:!0})}),e.jsxs("section",{className:"sfp-card",style:{...oe.card},children:[e.jsx("span",{className:"sfp-eb",children:a("pack.sniffer.full.bio","Bio & info")}),((f=t.bio)==null?void 0:f.trim())&&e.jsx("p",{className:"sfp-bio",children:t.bio.trim()}),p.map(([y,C])=>e.jsxs("div",{className:"sfp-kv",children:[e.jsx("span",{children:y}),e.jsx("b",{children:C})]},y)),(((A=t.zodiac)==null?void 0:A.western)||((h=t.zodiac)==null?void 0:h.chinese))&&e.jsxs("div",{className:"sfp-pills",children:[((_=t.zodiac)==null?void 0:_.western)&&e.jsxs("span",{className:"pk-pill sfp-sign",children:[Ie("western",t.zodiac.western)&&e.jsx("img",{src:Ie("western",t.zodiac.western),alt:""}),ks("western",t.zodiac.western,a)]}),((O=t.zodiac)==null?void 0:O.chinese)&&e.jsxs("span",{className:"pk-pill sfp-sign",children:[Ie("chinese",t.zodiac.chinese)&&e.jsx("img",{src:Ie("chinese",t.zodiac.chinese),alt:""}),ks("chinese",t.zodiac.chinese,a)]})]}),((((P=t.personality)==null?void 0:P.length)??0)>0||t.customPersonality)&&e.jsxs("div",{className:"sfp-pills",children:[zt.filter(y=>{var C;return(C=t.personality)==null?void 0:C.includes(y.value)}).map(y=>e.jsx("span",{className:"pk-pill",children:a(`pack.profileTag.${y.value}`,y.labelEN,{rod:r.gender??""})},y.value)),t.customPersonality&&e.jsx("span",{className:"pk-pill",children:t.customPersonality})]}),t.interests.length>0&&e.jsx("div",{className:"sfp-pills",children:t.interests.map(y=>e.jsx("span",{className:"pk-pill",children:z(y)},y))})]}),e.jsxs("section",{className:"sfp-card",style:{...oe.card},children:[e.jsx("span",{className:"sfp-eb",children:a("pack.sniffer.full.patch","My patch")}),e.jsx(ja,{iso:t.country}),S&&e.jsxs("p",{className:"sfp-place",children:[e.jsx(Bs,{})," ",S]}),e.jsxs("div",{className:"sfp-two",children:[e.jsxs("div",{className:"sfp-list",style:{...oe.subblock},children:[e.jsx("span",{className:"sfp-eb",style:{border:0,padding:0},children:"TRIPLIST"}),o.length?o.slice(0,8).map(y=>e.jsx("span",{children:y},y)):e.jsx("small",{children:a("pack.sniffer.full.none","Nothing yet")})]}),e.jsxs("div",{className:"sfp-list",style:{...oe.subblock},children:[e.jsx("span",{className:"sfp-eb",style:{border:0,padding:0},children:"TRIPWISH"}),b.length?b.slice(0,8).map(y=>e.jsx("span",{children:y},y)):e.jsx("small",{children:a("pack.sniffer.full.none","Nothing yet")})]})]}),t.intents.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"sfp-eb",children:a("pack.sniffer.full.seeking","Looking for")}),e.jsx("div",{className:"sfp-pills",children:t.intents.map(y=>e.jsx("span",{className:"pk-pill",children:a(`pack.buddy.intent.${y}`,y)},y))})]})]}),e.jsxs("section",{className:"sfp-card",style:{...oe.card},children:[e.jsx("span",{className:"sfp-eb",children:a("pack.sniffer.full.dogs","Dogs")}),t.dogs.length?t.dogs.map((y,C)=>e.jsx(Ma,{dog:y,member:t.member,tx:a},C)):e.jsx("p",{className:"sfp-bio",children:a("pack.sniffer.full.none","Nothing yet")})]})]}),i&&e.jsx("div",{className:"sfp-acts",children:i})]})}const Fa=[["deck","Sniff"],["search","Search"],["matches","Matches"]],Ue=96,La=320,Ba=6,Ka=t=>Pe(t,U.md,U.md),Wa=`
/* Horný prepínač výraznejší, aktívna záložka v PLNOM lapise (Matej 25. 9.). */
.sh-tabs{display:flex;gap:${s.xs}px;padding:${s.xs}px;border-radius:${k.pill}px;border:1px solid ${n.border};background:${n.cardSoft};box-shadow:${ae.card};}
.sh-tabs button{flex:1 1 0;padding:${s.md}px ${s.sm}px;border:1px solid transparent;border-radius:${k.pill}px;background:transparent;cursor:pointer;
  font-family:${j};font-weight:600;font-size:${d.label}px;letter-spacing:.14em;text-transform:uppercase;color:${n.inkWarm};transition:background .2s ease,color .2s ease;}
.sh-tabs button:hover{color:${$.edge};}
.sh-tabs button.is-on{background:${$.grad};border-color:${$.deep};color:${$.ink};box-shadow:${Os};}
.sh-pane{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:${s.md}px;container-type:size;}
.sh-pane--scroll{overflow-y:auto;margin:0 -${s.xs}px;padding:0 ${s.xs}px;}
.sh-deck{position:relative;flex:1 1 auto;min-height:360px;width:100%;max-width:440px;margin:0 auto;}
/* KARTA NA VÝŠKU ako na Tinderi (Matej 30. 10. 2026: „karta musí byť ako na tinderi na výšku").
   Na PC je okno široké a nízke (1477×724) — šírka sa preto viaže na VÝŠKU panela (cqh), 3 : 4,
   po odpočítaní radu tlačidiel (kotúč + popis + medzera). Na mobile vyhrá 100 % šírky. */
.sh-deck{max-width:min(440px, calc((100cqh - ${U.lg+s.xl+s.lg}px) * .75));}
.sh-mover{position:absolute;inset:0;}
.sh-mover.is-anim{transition:transform .32s ease, opacity .32s ease;}
.sh-acts{display:flex;justify-content:center;align-items:flex-start;gap:${s.xl}px;}
/* Plávajúci AINUBIS sedí vpravo dole — na úzkom mobile by rad pri medzere 24 px zasiahol
   pod neho popisok ÁNO. Rad sa preto zúži, AINUBIS sa neposúva. */
@media (max-width:419px){.sh-acts{gap:${s.lg}px;}}
.sh-act{display:flex;flex-direction:column;align-items:center;gap:${s.xs}px;font-family:${j};font-size:${d.micro}px;
  letter-spacing:.22em;text-transform:uppercase;color:${n.inkWarm};}
.sh-btn{width:${U.lg}px;height:${U.lg}px;border-radius:${k.pill}px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;border:1px solid ${n.border};background:${n.cardSoft};box-shadow:${ae.panel};transition:transform .12s ease;}
.sh-btn:active{transform:scale(.94);}
.sh-btn:disabled{opacity:.45;cursor:default;}
.sh-btn--yes{border-color:${n.growGreen};background:linear-gradient(135deg, #4E9A63, ${n.growGreen});box-shadow:${ae.panel};}
/* NIE = plná ČERVENÁ, zrkadlo zeleného SNIFF (Matej 30. 10. 2026: „no dajme červenou a write dajme preč").
   Tlačidlo WRITE (áno + správa) z radu aj z celého profilu zmizlo — zostali dve voľby. */
.sh-btn--no{border-color:${n.alertRed};background:linear-gradient(135deg, #C46A53, ${n.alertRed});box-shadow:${ae.panel};}
/* ODPOVEĎ NA ŤUK — tlačidlo pruží a karta nesie pečiatku SNIFF / NIE (Matej 25. 9.: „animácie pri
   ok a no… aj na mobile aj PC"). Pečiatka rastie s ťahom, pri ťuku je hneď celá. */
.sh-btn.is-hit{animation:sh-hit .36s ease;}
@keyframes sh-hit{0%{transform:scale(1);}35%{transform:scale(1.22);}100%{transform:scale(1);}}
.sh-stamp{position:absolute;top:${s.xxxl}px;z-index:4;padding:${s.xs}px ${s.md}px;border:3px solid currentColor;border-radius:${k.field}px;
  font-family:${j};font-weight:600;font-size:${d.h1}px;letter-spacing:.14em;text-transform:uppercase;pointer-events:none;background:rgba(0,0,0,.25);}
.sh-stamp--yes{left:${s.lg}px;color:#7BD88F;transform:rotate(-14deg);}
.sh-stamp--no{right:${s.lg}px;color:#FF7A6B;transform:rotate(14deg);}
/* Celý profil odletí tým istým smerom ako karta. */
.sh-peek{width:100%;height:100%;display:flex;justify-content:center;align-items:center;transition:transform .36s ease, opacity .36s ease;}
.sh-peek.is-like{transform:translateX(110vw) rotate(10deg);opacity:0;}
.sh-peek.is-pass{transform:translateX(-110vw) rotate(-10deg);opacity:0;}
/* PRÁZDNY BALÍČEK — spoločný blok SnifferEmpty.tsx (aj HĽADAŤ). */
.sh-ico{display:block;background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;}
.sh-empty{margin:auto 0;display:flex;flex-direction:column;gap:${s.md}px;}
.sh-ghost{align-self:center;border-radius:${k.field}px;padding:${s.sm}px ${s.lg}px;border:1px solid ${n.border};background:${n.cardSoft};
  font-family:${j};font-weight:600;font-size:${d.label}px;letter-spacing:.14em;text-transform:uppercase;color:${n.inkWarm};cursor:pointer;}
/* E3 (audit-sniffer-2026-09-26, „Duplicity"): .sh-cta bolo doslovné dvojča .bd-cta
   z PackBuddy.tsx — tá istá karta Shell ho vždy vykreslí spolu s týmto panelom, takže
   trieda je vždy po ruke. Tlačidlá nižšie preto berú .bd-cta, druhá definícia zbytočná. */
.sh-sheet{width:100%;max-width:420px;padding:${s.lg}px;display:flex;flex-direction:column;gap:${s.md}px;}
.sh-sheet h3{margin:0;font-family:${de};font-weight:700;font-size:${d.lead}px;letter-spacing:.14em;text-transform:uppercase;color:${n.inkStrong};}
.sh-note{margin:0;font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
.sh-area{width:100%;min-height:96px;resize:vertical;border-radius:${k.field}px;padding:${s.sm}px ${s.md}px;
  font-family:${j};font-size:${d.body}px;color:${n.inkStrong};}
.sh-ghost--dark{background:transparent;color:${$.ink};}
/* ZHODY — riadky. Každý je KARTA (zlatý rám + tieň) na zlatom súmraku (Matej 5. 10. 2026:
   najprv „správy by mali byť vidno na D-bloku", po zmene pozadia „dajme preč ten D-blok pri správach"). */
.sh-list{display:flex;flex-direction:column;gap:${s.sm}px;}
.sh-row{display:flex;align-items:center;gap:${s.md}px;padding:${s.sm}px ${s.md}px;}
.sh-row img{width:${U.md}px;height:${U.md}px;border-radius:${k.pill}px;object-fit:cover;flex:0 0 auto;}
.sh-row__txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;font-family:${j};}
.sh-row__txt b{font-weight:600;font-size:${d.body}px;color:${n.inkStrong};}
.sh-row__txt small{font-size:${d.label}px;color:${n.inkDim};}
.sh-new{font-family:${j};font-weight:600;font-size:${d.micro}px;letter-spacing:.14em;color:${n.card};background:${n.growGreen};
  border-radius:${k.pill}px;padding:${s.xs}px ${s.sm}px;}
.sh-mini{border:0;background:none;cursor:pointer;font-family:${j};font-size:${d.label}px;color:${n.inkWarm};text-decoration:underline;}
/* B2/B3 (audit-sniffer-2026-09-26): jeden pás NAD záložkami — vidno ho z HĽADAŤ aj ZHÔD,
   nielen z balíčka, a zostáva, kým fetchDeck v pozadí nezmaže presne TÚTO chybu. */
.sh-errbar{display:flex;align-items:center;justify-content:space-between;gap:${s.md}px;padding:${s.sm}px ${s.md}px;
  border-radius:${k.tile}px;border:1px solid ${te.red};color:${te.red};font-family:${j};font-size:${d.label}px;}
.sh-errbar button{flex:0 0 auto;border:0;background:none;cursor:pointer;font-family:${j};font-weight:600;font-size:${d.label}px;
  color:inherit;text-decoration:underline;}
/* Kostra namiesto prázdnej plochy, kým sa balíček/zhody prvýkrát načítavajú. */
.sh-skel-card{position:absolute;inset:0;border-radius:${k.card}px;background:${n.tileBg};overflow:hidden;}
.sh-skel-row{height:${U.md}px;border-radius:${k.tile}px;background:${n.tileBg};position:relative;overflow:hidden;}
.sh-skel-card::after,.sh-skel-row::after{content:'';position:absolute;inset:0;
  background:linear-gradient(100deg, transparent 20%, rgba(255,255,255,.16) 50%, transparent 80%);animation:sh-shimmer 1.4s ease-in-out infinite;}
@keyframes sh-shimmer{from{transform:translateX(-100%);}to{transform:translateX(100%);}}
@media (prefers-reduced-motion: reduce){.sh-skel-card::after,.sh-skel-row::after{animation:none;}}
`;function zs({src:t,size:a,color:i}){return e.jsx("span",{className:"sh-ico","aria-hidden":!0,style:{width:a,height:a,color:i,"--m":`url(${t})`}})}const tt="dogypt_sniffer_matches_seen",Ha=()=>{try{return Number(localStorage.getItem(tt))||0}catch{return 0}},Ga=t=>{try{localStorage.setItem(tt,String(t))}catch{}},_s={deck:"Couldn’t load the pack. Try again.",swipe:"Couldn’t save your answer — the card is back on top. Try again.",matches:"Couldn’t load matches. Try again."};function Ya({tx:t,me:a}){var ve,xe;const[i,r]=pt(),{lang:p}=Ce(),c=["deck","search","matches"].find(g=>g===i.get("tab"))??"deck",l=g=>r(R=>{const G=new URLSearchParams(R);return g==="deck"?G.delete("tab"):G.set("tab",g),G}),[o,b]=m.useState(null),[S,z]=m.useState(null),[w,f]=m.useState(null),[A,h]=m.useState(null),[_,O]=m.useState(null),[P,y]=m.useState(""),[C,M]=m.useState(null),[L,ee]=m.useState(null),[Q,se]=m.useState(null),[X,q]=m.useState(null),[ie,T]=m.useState(!1),B=m.useRef(!1),J=m.useRef(null),u=m.useRef(!1),H=m.useRef(new Set),V=m.useRef(!1),Z=m.useRef(null),x=m.useRef(null),I=m.useRef(!0);m.useEffect(()=>()=>{I.current=!1,Z.current&&window.clearTimeout(Z.current),x.current&&window.clearTimeout(x.current)},[]);const W=g=>{ee(g),Z.current&&window.clearTimeout(Z.current),Z.current=window.setTimeout(()=>{I.current&&ee(null)},380)},ne=m.useCallback(async()=>{if(!V.current){V.current=!0;try{const g=await Qt(20);if(!I.current)return;z(R=>R==="deck"?null:R),b(R=>{const G=new Set((R??[]).map(v=>v.member));return[...R??[],...g.filter(v=>!G.has(v.member)&&!H.current.has(v.member))]})}catch{if(!I.current)return;z("deck"),b(g=>g??[])}finally{V.current=!1}}},[]);m.useEffect(()=>{ne()},[ne]);const N=(o==null?void 0:o[0])??null,Y=async(g,R)=>{if(!N||B.current)return;B.current=!0,W(g);const G=N;H.current.add(G.member),f({dx:(g==="like"?1:-1)*window.innerWidth,dy:0,anim:!0});const E=xs(G.member,g);x.current&&window.clearTimeout(x.current),x.current=window.setTimeout(async()=>{if(I.current){b(F=>(F??[]).slice(1)),f(null),B.current=!1;try{const F=await E;if(!I.current)return;z(me=>me==="swipe"?null:me),F.match&&M({card:G,conv:F.conv})}catch{if(!I.current)return;H.current.delete(G.member),z("swipe"),b(F=>[G,...F??[]])}}},La)},D=async(g,R,G)=>{if(!B.current&&(B.current=!0,H.current.add(g.member),se(R),await new Promise(v=>window.setTimeout(v,360)),!!I.current)){se(null),O(null);try{const v=await xs(g.member,R,G);if(!I.current)return;z(E=>E==="swipe"?null:E),b(E=>(E??[]).filter(F=>F.member!==g.member)),v.match&&M({card:g,conv:v.conv})}catch{if(!I.current)return;H.current.delete(g.member),z("swipe")}finally{B.current=!1}}},K=g=>{B.current||(J.current={x:g.clientX,y:g.clientY,id:g.pointerId},u.current=!1)},he=g=>{!J.current||J.current.id!==g.pointerId||(!u.current&&Math.abs(g.clientX-J.current.x)>Ba&&(u.current=!0,g.currentTarget.setPointerCapture(g.pointerId)),f({dx:g.clientX-J.current.x,dy:(g.clientY-J.current.y)*.3,anim:!1}))},Te=()=>{if(!J.current)return;J.current=null,u.current=!1;const g=(w==null?void 0:w.dx)??0;g>Ue?Y("like"):g<-Ue?Y("pass"):f(w?{dx:0,dy:0,anim:!0}:null)},[ce,le]=m.useState(null),[ke]=m.useState(Ha),ue=m.useCallback(async()=>{try{const g=await ea();if(!I.current)return;le(g),Ga(Date.now()),z(R=>R==="matches"?null:R)}catch{if(!I.current)return;z("matches")}},[]);m.useEffect(()=>{c==="matches"&&ue()},[c,C,ue]);const Be=async g=>{if(!ie){T(!0);try{if(await sa(g.card.member),!I.current)return;le(R=>(R??[]).filter(G=>G.card.member!==g.card.member)),q(null),z(R=>R==="matches"?null:R)}catch{if(!I.current)return;z("matches")}finally{I.current&&T(!1)}}},Ke=()=>{S==="deck"?(z(null),ne()):S==="matches"?(z(null),ue()):z(null)};m.useEffect(()=>{const g=R=>{if(R.key==="Escape"){if(X){q(null);return}if(A){h(null);return}if(C){M(null);return}if(_){O(null);return}return}if(X||A||C||_||c!=="deck")return;const G=document.activeElement;G&&["INPUT","TEXTAREA","SELECT"].includes(G.tagName)||(R.key==="ArrowRight"?Y("like"):R.key==="ArrowLeft"&&Y("pass"))};return window.addEventListener("keydown",g),()=>window.removeEventListener("keydown",g)},[X,A,C,_,c]);const ye=g=>{const R=Math.round((Date.now()-new Date(g).getTime())/36e5);return R<1?t("pack.sniffer.justNow","just now"):R<24?t("pack.sniffer.hoursAgo","{n} h ago",{n:R}):Math.round(R/24)===1?t("pack.sniffer.yesterday","yesterday"):new Date(g).toLocaleDateString(p)},$e=w?{transform:`translate(${w.dx}px, ${w.dy}px) rotate(${w.dx/20}deg)`,opacity:Math.abs(w.dx)>=window.innerWidth?0:1}:void 0;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Ee}),e.jsx("style",{children:Is}),e.jsx("style",{children:Us}),e.jsx("style",{children:Wa}),S&&e.jsxs("div",{className:"sh-errbar",role:"alert",children:[e.jsx("span",{children:t(`pack.sniffer.err.${S}`,_s[S])}),e.jsx("button",{type:"button",onClick:Ke,children:t("pack.sniffer.err.retry","Try again")})]}),e.jsx("div",{className:"sh-tabs",role:"tablist",children:Fa.map(([g,R])=>e.jsx("button",{type:"button",role:"tab","aria-selected":c===g,className:c===g?"is-on":"",onClick:()=>l(g),children:t(`pack.buddy.tab.${g}`,R)},g))}),c==="deck"&&e.jsx("div",{className:"sh-pane",children:o===null?e.jsx("div",{className:"sh-deck","aria-hidden":!0,children:e.jsx("div",{className:"sh-skel-card"})}):N?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"sh-deck",children:[o[1]&&e.jsx(Le,{card:o[1],tx:t,back:!0},o[1].member),e.jsx("div",{className:"sn-card-wrap",style:{position:"absolute",inset:0},onPointerDown:K,onPointerMove:he,onPointerUp:Te,onPointerCancel:Te,children:e.jsxs("div",{className:`sh-mover${w!=null&&w.anim?" is-anim":""}`,style:$e,children:[e.jsx(Le,{card:N,tx:t,onOpenFull:()=>O(N)}),w&&Math.abs(w.dx)>12&&e.jsx("span",{className:`sh-stamp sh-stamp--${w.dx>0?"yes":"no"}`,style:{opacity:Math.min(1,Math.abs(w.dx)/Ue)},children:w.dx>0?t("pack.sniffer.yes","SNIFF"):t("pack.sniffer.no","No")})]})},N.member)]}),e.jsxs("div",{className:"sh-acts",children:[e.jsxs("div",{className:"sh-act",children:[e.jsx("button",{type:"button",className:`sh-btn sh-btn--no${L==="pass"?" is-hit":""}`,"aria-label":t("pack.sniffer.no","No"),onClick:()=>void Y("pass"),children:e.jsx(zs,{src:"/icons/pack/cross.svg",size:26,color:"#fff"})}),t("pack.sniffer.no","No")]}),e.jsxs("div",{className:"sh-act",children:[e.jsx("button",{type:"button",className:`sh-btn sh-btn--yes${L==="like"?" is-hit":""}`,"aria-label":t("pack.sniffer.yes","SNIFF"),onClick:()=>void Y("like"),children:e.jsxs(e.Fragment,{children:[e.jsx("img",{src:"/icons/sys/pridaj-sniffer.webp",alt:""}),e.jsx("span",{className:"sh-sniff",children:t("pack.sniffer.yes","SNIFF")})]})}),t("pack.sniffer.yes","Yes")]})]})]}):e.jsx(as,{tx:t})}),c==="search"&&e.jsx("div",{className:"sh-pane sh-pane--scroll",children:e.jsx(Ea,{tx:t,onOpen:O})}),c==="matches"&&e.jsx("div",{className:"sh-pane",children:ce===null?e.jsx("div",{className:"sh-list","aria-hidden":!0,children:[0,1,2].map(g=>e.jsx("div",{className:"sh-skel-row"},g))}):ce.length>0?e.jsx("div",{className:"sh-list",children:ce.map(g=>{var G,v;const R=new Date(g.matchedAt).getTime()>ke;return e.jsxs("div",{className:"sh-row",style:{...oe.card},children:[e.jsx("img",{src:Ka(g.card.photos[0]??((G=g.card.dogs[0])==null?void 0:G.photo)),alt:""}),e.jsxs("span",{className:"sh-row__txt",children:[e.jsx("b",{children:[g.card.name,(v=g.card.dogs[0])==null?void 0:v.name].filter(Boolean).join(" + ")}),e.jsx("small",{children:t("pack.sniffer.matchedWhen","You caught each other’s scent · {when}",{when:ye(g.matchedAt)})})]}),R&&e.jsx("span",{className:"sh-new",children:t("pack.sniffer.new","NEW")}),g.conv&&e.jsx("button",{type:"button",className:"sh-mini",onClick:()=>hs(g.conv,{backCloses:!0}),children:t("pack.sniffer.write","Write")}),e.jsx("button",{type:"button",className:"sh-mini",onClick:()=>q(g),children:t("pack.sniffer.unmatch","Cancel")})]},g.card.member)})}):e.jsx(as,{tx:t,line:t("pack.sniffer.noMatches","No matches yet. A match is just a notice — whether you write is up to you.")})}),X&&e.jsx("div",{className:"pk-veil pk-veil--modal",onClick:()=>q(null),children:e.jsxs("div",{className:"sh-sheet",style:{...oe.panel},role:"dialog","aria-modal":"true","aria-label":t("pack.sniffer.unmatchConfirmTitle","Cancel this match?"),onClick:g=>g.stopPropagation(),children:[e.jsx("h3",{children:t("pack.sniffer.unmatchConfirmTitle","Cancel this match?")}),e.jsx("p",{className:"sh-note",children:t("pack.sniffer.unmatchConfirmNote","The thread closes for both of you and can’t be undone.")}),S==="matches"&&e.jsx("p",{className:"sh-note",style:{color:te.red},children:t("pack.sniffer.err.matches",_s.matches)}),e.jsx("button",{type:"button",className:"bd-cta",disabled:ie,onClick:()=>void Be(X),children:ie?"…":t("pack.sniffer.unmatchConfirm","Yes, cancel")}),e.jsx("button",{type:"button",className:"sh-ghost",onClick:()=>q(null),children:t("pack.sniffer.unmatchKeep","Keep it")})]})}),_&&e.jsx("div",{className:"pk-veil pk-veil--modal",onClick:()=>O(null),children:e.jsx("div",{className:`sh-peek${Q?` is-${Q}`:""}`,role:"dialog","aria-modal":"true","aria-label":_.name,onClick:g=>{g.target.closest(".sfp-photo, .sfp-card, button, a, input, textarea")&&g.stopPropagation()},children:e.jsx(st,{card:_,tx:t,actions:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"sh-btn sh-btn--no","aria-label":t("pack.sniffer.no","No"),onClick:()=>void D(_,"pass"),children:e.jsx(zs,{src:"/icons/pack/cross.svg",size:26,color:"#fff"})}),e.jsx("button",{type:"button",className:"sh-btn sh-btn--yes","aria-label":t("pack.sniffer.yes","SNIFF"),onClick:()=>void D(_,"like"),children:e.jsxs(e.Fragment,{children:[e.jsx("img",{src:"/icons/sys/pridaj-sniffer.webp",alt:""}),e.jsx("span",{className:"sh-sniff",children:t("pack.sniffer.yes","SNIFF")})]})})]})})})}),A&&e.jsx("div",{className:"pk-veil pk-veil--modal",onClick:()=>h(null),children:e.jsxs("div",{className:"sh-sheet",style:{...oe.panel},role:"dialog","aria-modal":"true","aria-label":t("pack.sniffer.writeTo","Write to {name}",{name:A.card.name}),onClick:g=>g.stopPropagation(),children:[e.jsx("h3",{children:t("pack.sniffer.writeTo","Write to {name}",{name:A.card.name})}),e.jsx("textarea",{className:"pf-field sh-area",autoFocus:!0,maxLength:1e3,value:P,onChange:g=>y(g.target.value),placeholder:t("pack.sniffer.writePh","Hi! …")}),e.jsx("p",{className:"sh-note",children:t("pack.sniffer.writeNote","It counts as a yes. The message is delivered only when you catch each other’s scent.")}),e.jsx("button",{type:"button",className:"bd-cta",disabled:!P.trim(),onClick:()=>{const g=P.trim(),R=A.send;h(null),R(g)},children:t("pack.sniffer.sendYes","Yes + message")})]})}),C&&e.jsx("div",{className:"pk-veil pk-veil--modal",onClick:()=>M(null),children:e.jsx("div",{role:"dialog","aria-modal":"true","aria-label":t("pack.sniffer.matchTitle","You caught each other’s scent!"),onClick:g=>g.stopPropagation(),style:{width:"100%",display:"flex",justifyContent:"center"},children:e.jsxs(Ia,{me:a.photo,them:C.card.photos[0]??((ve=C.card.dogs[0])==null?void 0:ve.photo)??null,title:t("pack.sniffer.matchTitle","You caught each other’s scent!"),names:[t("pack.sniffer.youAnd","You and {name}",{name:C.card.name}),[a.dogName,(xe=C.card.dogs[0])==null?void 0:xe.name].filter(Boolean).join(t("pack.sniffer.and"," and "))].filter(Boolean).join(" · "),children:[C.conv&&e.jsx("button",{type:"button",className:"bd-cta",onClick:()=>{const g=C.conv;M(null),hs(g,{backCloses:!0})},children:t("pack.sniffer.writeTo","Write to {name}",{name:C.card.name})}),e.jsx("button",{type:"button",className:"sh-ghost sh-ghost--dark",onClick:()=>M(null),children:t("pack.sniffer.keepSniffing","Keep sniffing")})]})})})]})}const Cs=5,is=["who","patch","photos","card"],Ve=is,Se=3;function Ua(t,a){var r;const i=(r=t==null?void 0:t.buddyPhotos)!=null&&r.length?t.buddyPhotos:t!=null&&t.buddyPhoto?[t.buddyPhoto]:[];return a.includes("intents")||a.includes("audience")?"who":t!=null&&t.pin?i.length<Se||!(t!=null&&t.buddyPhoto)?"photos":"card":"patch"}const Ps=["name","age","gender","region"],Es=["temperament","fitness","compat"],Va=`
/* KARTA NA VÝŠKU ako v balíčku (Matej 30. 10. 2026: „karta musí byť ako na tinderi na výšku"). */
.so-cardwrap{flex:0 0 auto;width:min(100%, ${s.xxxl*6+s.xl}px);aspect-ratio:3/4;margin:0 auto;}
.so-cardwrap .sn-stage{min-height:0;height:100%;max-width:none;}
.so-from{margin:0;text-align:center;}
/* KROK „TVOJA KARTA" — kto sa nezmestí, zmenší KARTU (PAGE_AIR lock), nie vzduch: výška z okna, šírku dá pomer 3:4.
   Rozdiel proti nastaveniam (tie majú .so-cardwrap bez --onb) = karta nikdy nezje celé telo a riadky pod ňou ostanú vidno. */
.so-cardwrap--onb{flex:0 0 auto;align-self:center;width:auto;max-width:100%;height:clamp(${s.xxxl*4}px, 34dvh, ${s.xxxl*6+s.xl+s.xxxl*2}px);}
@media (max-height:700px){ .so-cardwrap--onb{height:${s.xxxl*4}px;} }
.so-dog{display:flex;flex-direction:column;gap:${s.sm}px;}
.so-dog .sp-dogtabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:${s.xs}px;}
.so-dog .sp-dogtabs button{flex:0 0 auto;}
`;function Xa({step:t,onStep:a,tx:i,uid:r,human:p,settings:c,onPatch:l,dogs:o,dogAttrsOf:b,buddyDogId:S,homeCountry:z,missing:w,heroGender:f,editor:A,summary:h,intentsEditor:_,audienceEditor:O,onEnable:P,busy:y,note:C,reloadKey:M,suggestPhotos:L}){var Y;const ee=os(),{lang:Q}=Ce(),se=(Y=p==null?void 0:p.buddyPhotos)!=null&&Y.length?p.buddyPhotos:p!=null&&p.buddyPhoto?[p.buddyPhoto]:[],X=se.length>=Se&&!!(p!=null&&p.buddyPhoto),q=!w.includes("intents")&&!w.includes("audience"),ie=Ps.filter(D=>w.includes(D)&&!(D==="gender"&&f)),T=Es.some(D=>w.includes(D)),[B,J]=m.useState(S);m.useEffect(()=>{!B&&S&&J(S)},[S,B]);const u=o.find(D=>D.id===(B??S))??o.find(D=>D.id===S)??null,H=D=>{var he;const K=b(D);return!!K&&(K.tags.temperament??[]).length>0&&!!K.card.fitness&&!!((he=K.card.compat)!=null&&he.dogs_overall)},[V,Z]=m.useState(()=>ps(p==null?void 0:p.pin,p==null?void 0:p.nationality,Q,z)),x=Ve.indexOf(t),I=a,W=ie.length+(T?Es.filter(D=>w.includes(D)).length:0),ne=m.useMemo(()=>({who:[i("pack.sniffer.onb.whoTitle","Who for?"),i("pack.sniffer.onb.whoSub","Only SNIFFER sees this — never your profile.")],patch:[i("pack.sniffer.profile.patchTitle","My patch"),i("pack.sniffer.profile.patchSub","Where we spend most of our time")],photos:[i("pack.sniffer.onb.photosTitle","Photos"),i("pack.sniffer.onb.photosSub","At least {n} · on one you’re together with your dog",{n:Se})],card:[i("pack.sniffer.onb.cardTitle","Your card"),W?i("pack.sniffer.onb.cardMissing","Built from your profile · {n} missing",{n:W}):i("pack.sniffer.onb.cardReady","Built from your profile · ready")]}),[i,W]),N=t==="who"?{label:i("pack.buddy.next","Next"),disabled:!q,onClick:()=>I("patch")}:t==="patch"?{label:i("pack.buddy.next","Next"),disabled:!1,onClick:()=>I("photos")}:t==="photos"?{label:X?i("pack.buddy.next","Next"):`${se.length} / ${Se}`,disabled:!X,onClick:()=>I("card")}:{label:W?i("pack.buddy.left","{n} more to fill in",{n:W}):i("pack.sniffer.profile.enable","Switch SNIFFER on"),disabled:W>0||y||!q||!X,onClick:P};return e.jsxs("div",{className:"sp-pager sp-pager--fit",children:[e.jsx("style",{children:at}),e.jsx("style",{children:Ee}),e.jsx("style",{children:Va}),e.jsx("div",{className:"sp-dots",children:Ve.map((D,K)=>e.jsx("button",{type:"button",className:D===t?"is-on":"","aria-current":D===t,"aria-label":`${K+1} / ${Ve.length}`,disabled:K>x,onClick:()=>I(D)},D))}),e.jsxs("section",{className:"sp-card",style:{...oe.card},children:[e.jsxs("div",{className:"sp-head",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"sp-title",children:ne[t][0]}),e.jsx("p",{className:"sp-sub",children:ne[t][1]})]}),t==="patch"&&e.jsx(qs,{iso:V,onPick:Z,tx:i})]}),e.jsxs("div",{className:"sp-body",children:[t==="who"&&e.jsxs("div",{className:"sp-cols",children:[e.jsxs("div",{children:[e.jsx("span",{className:"sp-sec",children:i("pack.sniffer.profile.seekWhat","What for")}),_]}),e.jsxs("div",{children:[e.jsx("span",{className:"sp-sec",children:i("pack.sniffer.profile.seekShow","Who sees us")}),O("who"),O("dogs")]})]}),t==="patch"&&e.jsxs(e.Fragment,{children:[e.jsx(Qs,{tx:i,pin:p==null?void 0:p.pin,iso:V,radiusKm:c.radius_km,onRadius:D=>void l({radius_km:D})}),e.jsx("p",{className:"bd-note",children:i("pack.sniffer.pin.note2","Tap inside the country to drop your pin · others only see how far you are")})]}),t==="photos"&&e.jsx(nt,{uid:r,photos:se,together:(p==null?void 0:p.buddyPhoto)??null,tx:i,suggest:L,note:!1}),t==="card"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"so-cardwrap so-cardwrap--onb",children:e.jsx(ls,{tx:i,reloadKey:M})}),Ps.filter(D=>ie.includes(D)).map(D=>e.jsx(Re,{tx:i,label:i(`pack.buddy.step.${D}`,D),value:h(D),todo:!0,children:A(D)},D)),u&&(T||o.length>1)&&e.jsxs("div",{className:"so-dog",children:[o.length>1&&e.jsx("div",{className:"sp-dogtabs",role:"tablist",children:o.map(D=>e.jsxs("button",{type:"button",role:"tab","aria-selected":D.id===u.id,className:D.id===u.id?"is-on":"",onClick:()=>J(D.id),children:[D.cloudinary_main_url&&e.jsx("img",{src:Fe(D.cloudinary_main_url,48,48),alt:"",draggable:!1}),D.dog_name,e.jsx("i",{className:H(D.id)?"":"is-todo","aria-hidden":!0})]},D.id))}),e.jsx("span",{className:"sp-sec",children:i("pack.sniffer.onb.dogOf","Dog: {name}",{name:u.dog_name??""})}),e.jsx(it,{dog:u,attrs:b(u.id)??_e(u.id),tx:i,onlyMissing:o.length<=1})]}),e.jsxs("p",{className:"bd-note so-from",children:[i("pack.sniffer.onb.editHint","Everything else lives in your profile.")," ",e.jsx("button",{type:"button",className:"bd-link",onClick:()=>ee("/pack/profile/edit"),children:i("pack.sniffer.onb.editProfile","Edit profile")})]})]})]}),e.jsxs("div",{className:"sp-foot",children:[t==="card"&&C,e.jsx("button",{type:"button",className:"bd-cta",disabled:N.disabled,onClick:N.onClick,children:N.label})]})]},t)]})}const Xe=6,Za=(t,a=300,i=400)=>Pe(t,a,i),at=`
/* Karta SNIFFER v nastaveniach = tá istá karta 3:4 ako posledný krok onboardingu. */
.so-cardwrap{flex:0 1 auto;min-height:0;width:min(100%, ${s.xxxl*6+s.xl}px);aspect-ratio:3/4;margin:0 auto;}
.so-cardwrap .sn-stage{min-height:0;height:100%;max-width:none;}
.so-from{margin:0;text-align:center;}
.sp-mine{display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:'on' 'card' 'rows';gap:${s.sm}px;min-height:0;}
.sp-mine__on{grid-area:on;} .sp-mine__card{grid-area:card;} .sp-mine__rows{grid-area:rows;display:flex;flex-direction:column;gap:${s.sm}px;min-width:0;}
.sp-mine__on .bd-onbox{margin-left:0;width:100%;height:auto;}
@media (min-width:721px){
  .sp-mine{grid-template-columns:auto minmax(0,1fr);grid-template-areas:'card on' 'card rows';align-items:start;gap:${s.md}px ${s.lg}px;}
  .sp-mine__card{width:${s.xxxl*6+s.xl}px;}
}
.sp-pager{width:100%;display:flex;flex-direction:column;gap:${s.md}px;touch-action:pan-y;}
.sp-nav{display:flex;align-items:center;justify-content:center;gap:${s.md}px;}
.sp-count{min-width:${s.xxxl}px;text-align:center;font-family:${j};font-weight:600;font-size:${d.label}px;letter-spacing:.14em;color:${n.inkWarm};}
/* C5 — vizuálne 28×28, ťukacia plocha ≥40 px cez neviditeľný ::after (vzor HIT_CSS). */
.sp-arrow{position:relative;width:${s.xl+s.xs}px;height:${s.xl+s.xs}px;border-radius:${k.pill}px;display:grid;place-items:center;cursor:pointer;
  color:${n.cardSoft};border:1px solid ${je.edge};background:${je.grad};}
.sp-arrow::after{content:'';position:absolute;inset:-6px;}
.sp-arrow:disabled{opacity:.3;cursor:default;}
/* KARTA = hlavička · telo (jediné, čo sa smie posúvať) · CTA dole v karte */
.sp-card{width:100%;padding:${s.lg}px;display:flex;flex-direction:column;gap:${s.md}px;
  transition:transform .25s ease, opacity .25s ease;user-select:none;}
.sp-card.is-drag{transition:none;}
.sp-card textarea,.sp-card input{user-select:text;}
/* iPhone Safari PRIBLÍŽI stránku pri fokuse poľa s písmom pod 16 px (Matej 23. 11. 2026: panel mimo okrajov, hlava AINUBISA orezaná,
   CTA pod lištou — po zápise mena/veku). 16 px = PACK_TEXT.lead; stránka sa pri písaní nepohne. Plus poistka proti širšiemu obsahu. */
.sp-card input,.sp-card textarea,.sp-card select{font-size:${d.lead}px;}
.sp-pager,.sp-card,.sp-body{min-width:0;max-width:100%;}
.sp-body{overflow-x:hidden;}
.sp-body{display:flex;flex-direction:column;gap:${s.sm}px;}
.sp-foot{display:flex;flex-direction:column;gap:${s.sm}px;padding-top:${s.xs}px;}
/* ── BEZ SCROLLU (brána) — heroflow pravidlo: obsah sa zmestí do okna, zmenší sa OBSAH, nie
   vzduch od okraja (PAGE_AIR). Karta berie zvyšok výšky; posúva sa len jej TELO, CTA ostáva. */
.sp-pager--fit{flex:1 1 auto;min-height:0;}
.sp-pager--fit > .sp-card{flex:1 1 auto;min-height:0;}
.sp-pager--fit .sp-body{flex:1 1 auto;min-height:0;overflow-y:auto;}
.sp-photorow{display:flex;flex-wrap:wrap;align-items:flex-end;gap:${s.md}px;border-top:1px solid ${n.hairline};}
.sp-photorow > .sp-kv{flex:1 1 auto;border-top:0;}
/* TRI VEDĽA SEBA NA CELÚ ŠÍRKU (Matej 21. 11. 2026: „zmestia sa pod seba len 2 a je tam plac vedľa“) — výšku dáva pomer 3:4, nie pevné číslo. */
.sp-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${s.sm}px;}
.sp-slots > .sp-slot{width:100%;height:auto;}
@media (min-width:768px){ .sp-rows2{display:grid;grid-template-columns:1fr 1fr;column-gap:${s.xl}px;} }
@media (max-height:800px){ .sp-kv > button,.sp-static{padding:${s.xs}px 0;} }
.sp-dots{display:flex;justify-content:center;gap:${s.sm}px;}
/* C5 — bodky ostávajú 8×8 vizuálne, ťukacia plocha ≥40 px cez neviditeľný ::after. */
.sp-dots button{position:relative;width:${s.sm}px;height:${s.sm}px;padding:0;border-radius:${k.pill}px;border:1px solid ${$.edge};background:transparent;cursor:pointer;
  transition:width .2s ease, background .2s ease;}
.sp-dots button::after{content:'';position:absolute;inset:-16px;}
.sp-dots button.is-on{width:${s.lg}px;background:${$.edge};}
/* VEĽKÝ NADPIS karty = PACK_HEAD karta (Cinzel 700 / 24 / .14em) */
.sp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:${s.md}px;}
.sp-head > div{min-width:0;display:flex;flex-direction:column;gap:${s.xs}px;}
.sp-title{margin:0;font-family:${de};font-weight:700;font-size:${d.h1}px;letter-spacing:.14em;text-transform:uppercase;color:${n.inkStrong};line-height:1.15;}
.sp-sub{margin:0;font-family:${j};font-size:${d.body}px;color:${n.inkDim};}
.sp-sec{margin-top:${s.sm}px;font-family:${j};font-weight:500;font-size:${d.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${n.inkWarm};
  display:flex;align-items:center;gap:${s.sm}px;}
.sp-sec b{font-weight:600;letter-spacing:.14em;color:${$.edge};}
.sp-miss{flex:0 0 auto;font-family:${j};font-weight:600;font-size:${d.micro}px;letter-spacing:.14em;text-transform:uppercase;
  border-radius:${k.pill}px;padding:${s.xs}px ${s.sm}px;border:1px solid ${$.edge};${re($.edge,te.lapis,.12)}}
.sp-ok{flex:0 0 auto;font-family:${j};font-weight:600;font-size:${d.micro}px;letter-spacing:.14em;text-transform:uppercase;color:${n.card};background:${n.growGreen};
  border-radius:${k.pill}px;padding:${s.xs}px ${s.sm}px;}
/* RIADOK, ktorý VYZERÁ klikateľne (Matej: „ani ma nenapadlo, že klikom sa dá niečo zmeniť") —
   šípka vpravo, podklad pri hover a prázdna hodnota ako lapisová pilulka „Doplniť". */
.sp-kv{border-top:1px solid ${n.hairline};}
.sp-kv > button{display:flex;align-items:center;gap:${s.sm}px;width:100%;padding:${s.sm}px ${s.sm}px;background:none;border:0;cursor:pointer;text-align:left;
  border-radius:${k.tile}px;font-family:${j};font-size:${d.body}px;color:${n.inkDim};transition:background .15s ease;}
.sp-kv > button:hover{background:${n.tileBg};}
.sp-kv > button > span{flex:1 1 auto;}
.sp-kv > button > b{font-weight:600;color:${n.inkStrong};text-align:right;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sp-kv > button > b.is-todo{font-size:${d.label}px;padding:${s.xs}px ${s.md}px;border-radius:${k.pill}px;border:1px solid ${$.edge};
  ${re($.edge,te.lapis,.12)}}
.sp-kv > button > i{flex:0 0 auto;width:${s.sm}px;height:${s.sm}px;border-right:2px solid ${$.edge};border-bottom:2px solid ${$.edge};
  transform:rotate(-45deg);transition:transform .15s ease;}
.sp-kv > button[aria-expanded="true"] > i{transform:rotate(45deg);}
.sp-kv .bd-edit{margin:0 0 ${s.sm}px;}
.sp-static{display:flex;justify-content:space-between;gap:${s.sm}px;padding:${s.sm}px;border-top:1px solid ${n.hairline};
  font-family:${j};font-size:${d.body}px;color:${n.inkDim};}
.sp-static b{font-weight:600;color:${n.inkStrong};}
.sp-slot{position:relative;aspect-ratio:3/4;border-radius:${k.tile}px;overflow:hidden;border:1px dashed ${n.border};background:${n.tileBg};
  display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:${j};font-size:${d.h2}px;color:${$.edge};padding:0;}
.sp-slot img{width:100%;height:100%;object-fit:cover;display:block;}
.sp-slot.is-together{border:2px solid ${n.growGreen};}
.sp-slot__tag{position:absolute;left:${s.xs}px;bottom:${s.xs}px;font-family:${j};font-weight:600;font-size:${d.micro}px;
  color:${n.card};background:${n.growGreen};border-radius:${k.pill}px;padding:0 ${s.xs}px;}
.sp-photo-menu{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
/* VÝBER Z PROFILU (onboarding 30. 10. 2026) — kruhy fotiek, ktoré už človek má; ťuk = pridať. */
.sp-suggest{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
.sp-suggest button{position:relative;width:${U.lg}px;height:${U.lg}px;padding:0;border-radius:${k.pill}px;overflow:visible;
  border:2px solid ${n.border};background:${n.tileBg};cursor:pointer;}
.sp-suggest img{width:100%;height:100%;border-radius:${k.pill}px;object-fit:cover;display:block;}
.sp-suggest i{position:absolute;right:-${s.xs}px;bottom:-${s.xs}px;width:${s.lg+s.xs}px;height:${s.lg+s.xs}px;
  border-radius:${k.pill}px;display:grid;place-items:center;font-style:normal;font-family:${j};font-weight:600;font-size:${d.label}px;
  background:${$.grad};color:${$.ink};}
/* 2/4 BIO A INFO — citát psa, potom chipy (Matej: „je to nevýrazné (bez chipov…)") */
.sp-quote{display:flex;flex-direction:column;gap:${s.sm}px;}
.sp-quote > span{font-family:${j};font-weight:600;font-size:${d.lead}px;line-height:1.25;color:${n.inkStrong};}
.sp-area{width:100%;min-height:${s.xxxl+s.lg}px;resize:vertical;border-radius:${k.field}px;padding:${s.sm}px ${s.md}px;
  font-family:${j};font-size:${d.body}px;color:${n.inkStrong};}
.sp-chips{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
.sp-chip{position:relative;display:inline-flex;align-items:center;gap:${s.xs}px;border-radius:${k.pill}px;padding:${s.xs}px ${s.md}px;
  font-family:${j};font-size:${d.label}px;font-weight:600;color:${n.inkStrong};border:1px solid ${n.border};background:${n.cardSoft};
  max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sp-chip.is-empty{font-weight:500;color:${n.inkFaint};border-style:dashed;cursor:pointer;}
.sp-chip.is-set{border-color:${$.edge};${re($.edge,te.lapis,.12)}}
.sp-chip select{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;}
.sp-chip.is-tap{cursor:pointer;}
.sp-chip.is-ro{background:${n.tileBg};}
.sp-chip > img{width:${s.lg}px;height:${s.lg}px;object-fit:contain;}
.sp-pills .pk-pill.is-on{${re($.edge,te.lapis,.16)}}
/* PES — živší: veľká fotka, heroglyf na jej rohu, meno Cinzel Decorative (oficiálny povrch) */
.sp-dogh{display:flex;align-items:center;gap:${s.lg}px;}
.sp-dogh__ph{position:relative;flex:0 0 auto;width:${U.lg+s.xxl}px;height:${U.lg+s.xxl}px;}
.sp-dogh__ph > img:first-child{width:100%;height:100%;border-radius:${k.card}px;object-fit:cover;border:2px solid ${n.accentGold};box-shadow:${ae.card};}
.sp-dogh__hg{position:absolute;right:-${s.sm}px;bottom:-${s.sm}px;width:${U.sm}px;height:${U.sm}px;border-radius:${k.tile}px;
  object-fit:contain;background:${n.card};border:1px solid ${n.border};box-shadow:${ae.card};}
.sp-dogh__txt{min-width:0;display:flex;flex-direction:column;gap:${s.sm}px;}
.sp-dogh__txt b{font-family:'Cinzel Decorative','Cinzel',serif;font-weight:700;font-size:${d.h1}px;line-height:1.1;color:${n.inkStrong};}
@media (max-height:700px){
  /* Veta „zatiaľ 1:1" ustúpi — pilulky samy nesú „od 12/2026" (SE by pretiekol o 29 px). */
  .sp-onetoone{display:none;} .sp-dogh__ph{width:${U.lg}px;height:${U.lg}px;} .sp-dogh__txt b{font-size:${d.h2}px;} }
/* 1/6 ZÁKLAD — štyri polia v mriežke 2×2 (Matej 25. 9.: „obsah sa v bloku scroluje, čo je
   hlúposť! daj tie info kľudne do 2×2 mriežky"). Dlaždica = popis nad hodnotou, editor pod mriežkou. */
.sp-grid{display:grid;grid-template-columns:1fr 1fr;gap:${s.sm}px;}
.sp-tile{display:flex;flex-direction:column;align-items:flex-start;gap:${s.xs}px;min-width:0;padding:${s.sm}px ${s.md}px;
  border-radius:${k.tile}px;border:1px solid ${n.hairline};background:${n.tileBg};cursor:pointer;text-align:left;font-family:${j};position:relative;}
.sp-tile:hover,.sp-tile[aria-expanded="true"]{border-color:${$.edge};}
.sp-tile > span{font-size:${d.label}px;color:${n.inkDim};}
.sp-tile > b{max-width:100%;font-size:${d.body}px;font-weight:600;color:${n.inkStrong};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sp-tile > b.is-todo{color:${$.edge};}
.sp-tile > i{position:absolute;right:${s.md}px;top:50%;width:${s.sm}px;height:${s.sm}px;margin-top:-${s.xs}px;
  border-right:2px solid ${$.edge};border-bottom:2px solid ${$.edge};transform:rotate(-45deg);}
.sp-tile.is-static{cursor:default;}
.sp-editor{padding:${s.md}px;border-radius:${k.tile}px;background:${n.tileBg};border:1px solid ${$.edge};
  display:flex;flex-direction:column;gap:${s.sm}px;}
/* 4/6 HĽADÁME — na PC dva stĺpce, aby sa karta zmestila bez posúvania */
@media (min-width:768px){ .sp-cols{display:grid;grid-template-columns:1fr 1fr;column-gap:${s.xl}px;align-items:start;} }
.sp-cols > div{display:flex;flex-direction:column;gap:${s.sm}px;}
/* Nízke okno: šípky nad kartou sú navyše (listuje sa ťahom, bodkami aj CTA s „2 / 6") — ustúpia prvé. */
@media (max-width:767px){ .sp-card{gap:${s.sm}px;padding:${s.md}px;} }
@media (max-height:700px){ .sp-nav{display:none;} }
@media (max-width:767px){ .sp-cols .bd-pills{gap:${s.xs}px;} .sp-cols .sp-sec{margin-top:${s.xs}px;} }
.sp-pawtner{display:flex;align-items:center;justify-content:space-between;gap:${s.md}px;padding:${s.sm}px ${s.md}px;
  border-radius:${k.tile}px;border:1px dashed ${$.edge};line-height:1.3;font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
/* 5/6 PSI — jedna karta, prepínač psov svorky nad ňou (multipes) */
.sp-dogtabs{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
.sp-dogtabs button{display:inline-flex;align-items:center;gap:${s.sm}px;padding:${s.xs}px ${s.md}px ${s.xs}px ${s.xs}px;
  border-radius:${k.pill}px;border:1px solid ${n.border};background:${n.cardSoft};cursor:pointer;font-family:${j};font-size:${d.label}px;font-weight:600;color:${n.inkStrong};}
.sp-dogtabs button img{width:${U.xs}px;height:${U.xs}px;border-radius:${k.pill}px;object-fit:cover;}
.sp-dogtabs button.is-on{border-color:${$.edge};${re($.edge,te.lapis,.12)}}
.sp-dogtabs button i{width:${s.sm}px;height:${s.sm}px;border-radius:${k.pill}px;background:${n.growGreen};}
.sp-dogtabs button i.is-todo{background:${$.edge};}
/* posledná karta — prepínače */
.sp-sw{display:flex;align-items:center;justify-content:space-between;gap:${s.md}px;padding:${s.md}px 0;border-top:1px solid ${n.hairline};
  font-family:${j};font-size:${d.body}px;color:${n.inkStrong};cursor:pointer;}
.sp-sw > span{display:flex;flex-direction:column;gap:${s.xs}px;}
.sp-sw small{font-size:${d.label}px;color:${n.inkDim};}
/* iPhone SE a nižšie (kolo 6) — NA KONCI, aby prebil základné pravidlá vyššie: Základ pretiekol o 61 px, Hľadáme o 104 px. Zmenšuje sa OBSAH
   (PAGE_AIR lock) — nadpis o stupeň, fotky, pilulky volieb a pás pawtnera; vzduch ostáva. */
@media (max-height:700px){
  .sp-title{font-size:${d.h2}px;}
  .sp-cols .bd-pills .pk-pill{padding:${s.xs}px ${s.sm}px;font-size:${d.label}px;line-height:1.2;}
  .sp-pawtner{padding:${s.xs}px ${s.md}px;}
  .sp-body{gap:${s.xs}px;}
  .sp-tile{padding:${s.xs}px ${s.md}px;}
  .sp-cols .sp-sec{margin-top:0;}
  .sp-pawtner{font-size:${d.label}px;}
}
`;function ze({options:t,selected:a,onToggle:i,disabled:r}){return e.jsx("div",{className:"bd-pills sp-pills",children:t.map(p=>e.jsx("button",{type:"button","aria-pressed":a.includes(p.value),disabled:r==null?void 0:r(p.value),className:`pk-pill pk-pill--tap${a.includes(p.value)?" is-on":""}`,onClick:()=>i(p.value),children:p.label},p.value))})}function Ja({emoji:t,placeholder:a,options:i,value:r,onChange:p,label:c}){const l=i.find(o=>o.value===r);return e.jsxs("label",{className:`sp-chip is-tap ${l?"is-set":"is-empty"}`,children:[((l==null?void 0:l.emoji)??t)&&e.jsx("span",{"aria-hidden":!0,children:(l==null?void 0:l.emoji)??t}),l?c(l):a,e.jsxs("select",{value:r??"","aria-label":a,onChange:o=>p(o.target.value||void 0),children:[e.jsx("option",{value:"",children:a}),i.map(o=>e.jsxs("option",{value:o.value,children:[o.emoji?`${o.emoji} `:"",c(o)]},o.value))]})]})}const ns=(t,a)=>t.includes(a)?t.filter(i=>i!==a):[...t,a];function qa({tx:t,uid:a,human:i,dogs:r,dogAttrsOf:p,homeCountry:c,audienceEditor:l,missing:o,gateEditor:b,gateSummary:S,settings:z,onPatch:w,finish:f,fit:A=!1,basicsAside:h,reloadKey:_,suggestPhotos:O=[]}){var H,V,Z;const[P,y]=m.useState(null),{lang:C}=Ce(),[M,L]=m.useState(()=>ps(i==null?void 0:i.pin,i==null?void 0:i.nationality,C,c));m.useEffect(()=>{var x;!((x=i==null?void 0:i.pin)!=null&&x.country)&&c&&L(c.toLowerCase())},[c,(H=i==null?void 0:i.pin)==null?void 0:H.country]);const ee=os();m.useEffect(()=>{var x;(x=i==null?void 0:i.pin)!=null&&x.country&&L(i.pin.country.toLowerCase())},[(V=i==null?void 0:i.pin)==null?void 0:V.country]);const Q=(x,I,W,ne,N=!1)=>{const Y=P===x;return e.jsxs("div",{className:"sp-kv",children:[e.jsxs("button",{type:"button","aria-expanded":Y,onClick:()=>y(Y?null:x),children:[e.jsx("span",{children:I}),e.jsx("b",{className:N?"is-todo":"",children:N?t("pack.buddy.fill","Fill in"):W||"—"}),e.jsx("i",{"aria-hidden":!0})]}),Y&&e.jsx("div",{className:"bd-edit",children:ne})]},x)},se=(x,I)=>Q(x,I,S(x),b(x),o.includes(x)),X=x=>{const I=x.filter(W=>o.includes(W)).length;return I>0?e.jsx("span",{className:"sp-miss",children:t("pack.sniffer.profile.missing","{n} missing",{n:I})}):e.jsx("span",{className:"sp-ok",children:t("pack.sniffer.profile.done","Done")})},q=["name","age","gender","region"],ie=["temperament","fitness","compat"],T=x=>{var W;const I=p(x);return!!I&&(I.tags.temperament??[]).length>0&&!!I.card.fitness&&!!((W=I.card.compat)!=null&&W.dogs_overall)},B=(Z=i==null?void 0:i.buddyPhotos)!=null&&Z.length?i.buddyPhotos:i!=null&&i.buddyPhoto?[i.buddyPhoto]:[],J=[{key:"sniffer",title:t("pack.sniffer.onb.cardTitle","Your card"),right:o.some(x=>[...q,...ie].includes(x))?e.jsx("span",{className:"sp-miss",children:t("pack.sniffer.profile.missing","{n} missing",{n:o.filter(x=>[...q,...ie].includes(x)).length})}):void 0,body:e.jsx(e.Fragment,{children:e.jsxs("div",{className:"sp-mine",children:[e.jsx("div",{className:"sp-mine__on",children:h}),e.jsx("div",{className:"so-cardwrap sp-mine__card",children:e.jsx(ls,{tx:t,reloadKey:_})}),e.jsxs("div",{className:"sp-mine__rows",children:[q.filter(x=>o.includes(x)).map(x=>se(x,t(`pack.buddy.step.${x}`,x))),r.filter(x=>!T(x.id)).map(x=>e.jsx(it,{dog:x,attrs:p(x.id)??_e(x.id),tx:t,onlyMissing:!0},x.id)),r.map(x=>{const I=p(x.id)??_e(x.id);return Q(`${x.id}-d`,r.length>1?`${x.dog_name} · ${t("pack.sniffer.profile.dislikes","Dislikes")}`:t("pack.sniffer.profile.dislikes","Dislikes"),I.card.dislikedTypes.map(W=>t(`pack.dogCard.type.${W}`,W)).join(", "),e.jsx(ze,{options:_t.map(W=>({value:W,label:t(`pack.dogCard.type.${W}`,W)})),selected:I.card.dislikedTypes,onToggle:W=>void Me(x.id,{card:{...I.card,dislikedTypes:ns(I.card.dislikedTypes,W)}})}))}),Q("orientation",t("pack.sniffer.info.orientation","Orientation"),i!=null&&i.orientation?`${t(`pack.sniffer.info.orientation.${i.orientation}`,i.orientation)} · ${i.orientationPublic?t("pack.sniffer.profile.shown","visible"):t("pack.sniffer.profile.hidden","hidden")}`:"",e.jsxs("div",{className:"sp-chips",children:[e.jsx(Ja,{placeholder:t("pack.sniffer.info.orientation","Orientation"),options:Rs,value:i==null?void 0:i.orientation,label:x=>t(`pack.sniffer.info.orientation.${x.value}`,x.labelEN),onChange:x=>void pe({orientation:x})}),(i==null?void 0:i.orientation)&&e.jsx("button",{type:"button",className:`sp-chip is-tap${i.orientationPublic?" is-set":""}`,onClick:()=>void pe({orientationPublic:!i.orientationPublic}),children:i.orientationPublic?t("pack.sniffer.profile.shown","visible"):t("pack.sniffer.profile.hidden","hidden")})]})),e.jsxs("p",{className:"bd-note so-from",children:[t("pack.sniffer.onb.editHint","Everything else lives in your profile.")," ",e.jsx("button",{type:"button",className:"bd-link",onClick:()=>ee("/pack/profile/edit"),children:t("pack.sniffer.onb.editProfile","Edit profile")})]})]})]})})},{key:"seek",title:t("pack.sniffer.profile.seekTitle2","We’re looking for"),right:X(["intents","audience"]),body:e.jsxs("div",{className:"sp-cols",children:[e.jsxs("div",{children:[e.jsx("span",{className:"sp-sec",children:t("pack.sniffer.profile.seekWho","Who")}),e.jsx(ze,{options:Ct.map(x=>({value:x.value,label:`${x.emoji} ${t(`pack.sniffer.seek.${x.value}`,x.labelEN)}${x.value==="buddy"?"":` · ${t("pack.sniffer.fromDec","from 12/2026")}`}`})),selected:((i==null?void 0:i.seekKinds)??[]).filter(x=>x==="buddy"),disabled:x=>x!=="buddy",onToggle:x=>void pe({seekKinds:ns((i==null?void 0:i.seekKinds)??[],x)})}),e.jsx("p",{className:"bd-note sp-onetoone",children:t("pack.sniffer.oneToOne","For now SNIFFER matches one to one. Couples, packs and groups arrive in 12/2026.")}),e.jsxs("div",{className:"sp-pawtner",children:[e.jsx("span",{children:t("pack.sniffer.profile.pawtnerNote","We go on trips together with a pawtner")}),ct?e.jsxs("button",{type:"button",className:"sp-chip is-tap is-set",onClick:()=>ee("/pack/profile#pawmates"),children:["+ ",t("pack.sniffer.profile.pawtnerAdd","Add a pawtner")]}):e.jsx("span",{className:"sp-chip is-empty",children:t("pack.sniffer.soon","coming soon")})]}),e.jsx("span",{className:"sp-sec",children:t("pack.sniffer.profile.seekShow","Who sees us")}),l?l("who"):b("audience")]}),e.jsxs("div",{children:[e.jsx("span",{className:"sp-sec",children:t("pack.sniffer.profile.seekWhat","What for")}),b("intents"),l==null?void 0:l("dogs")]})]})},{key:"patch",title:t("pack.sniffer.profile.patchTitle","My patch"),sub:t("pack.sniffer.profile.patchSub","Where we spend most of our time"),right:e.jsx(qs,{iso:M,onPick:L,tx:t}),body:e.jsxs(e.Fragment,{children:[e.jsx(Qs,{tx:t,pin:i==null?void 0:i.pin,iso:M,radiusKm:z.radius_km,onRadius:x=>void w({radius_km:x})}),e.jsx("p",{className:"bd-note",children:t("pack.sniffer.pin.note2","Tap inside the country to drop your pin · others only see how far you are")})]})},{key:"photos",title:t("pack.sniffer.onb.photosTitle","Photos"),sub:t("pack.sniffer.onb.photosSub","At least {n} · on one you’re together with your dog",{n:Se}),right:X(["photo"]),body:e.jsx(nt,{uid:a,photos:B,together:(i==null?void 0:i.buddyPhoto)??null,tx:t,suggest:O,note:!1})},{key:"reach",title:t("pack.sniffer.profile.reachTitle","Visibility & alerts"),body:e.jsxs(e.Fragment,{children:[e.jsxs("label",{className:"sp-sw",children:[e.jsxs("span",{children:[e.jsx("b",{children:t("pack.sniffer.nearby.toggle","Show me in People nearby")}),e.jsx("small",{children:t("pack.sniffer.nearby.hint","Everyone with SNIFFER around your pin can see you")})]}),e.jsx(De,{on:z.show_nearby,onChange:x=>void w({show_nearby:x}),label:t("pack.sniffer.nearby.toggle","Show me in People nearby")})]}),e.jsxs("label",{className:"sp-sw",children:[e.jsxs("span",{children:[e.jsx("b",{children:t("pack.sniffer.ghost.toggle","Ghost mode")}),e.jsx("small",{children:t("pack.sniffer.ghost.hint","Nobody sees me, I see everyone · I only show up to those I SNIFF")})]}),e.jsx(De,{on:z.ghost,onChange:x=>void w({ghost:x}),label:t("pack.sniffer.ghost.toggle","Ghost mode")})]}),e.jsxs("label",{className:"sp-sw",children:[e.jsx("span",{children:e.jsx("b",{children:t("pack.sniffer.set.showPassed","Show people I passed again (in FAR SNIFF and search)")})}),e.jsx(De,{on:z.show_passed,onChange:x=>void w({show_passed:x}),label:t("pack.sniffer.set.showPassed","Show people I passed again (in FAR SNIFF and search)")})]}),e.jsxs("label",{className:"sp-sw",children:[e.jsx("span",{children:e.jsx("b",{children:t("pack.buddy.notifyMail","E-mail me about new matches")})}),e.jsx(De,{on:z.notify_mail,onChange:x=>void w({notify_mail:x}),label:t("pack.buddy.notifyMail","E-mail me about new matches")})]})]})}],u=(()=>{const x=I=>I.some(W=>o.includes(W));return x([...q,...ie])?0:x(["intents","audience"])?J.findIndex(I=>I.key==="seek"):x(["photo"])?J.findIndex(I=>I.key==="photos"):-1})();return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:at}),e.jsx("style",{children:Ee}),e.jsx(Qa,{tx:t,fit:A,slides:J,finish:f,missingSlide:u})]})}function Re({label:t,value:a,todo:i,tx:r,children:p}){const[c,l]=m.useState(!1);return e.jsxs("div",{className:"sp-kv",children:[e.jsxs("button",{type:"button","aria-expanded":c,onClick:()=>l(!c),children:[e.jsx("span",{children:t}),e.jsx("b",{className:i?"is-todo":"",children:i?r("pack.buddy.fill","Fill in"):a||"—"}),e.jsx("i",{"aria-hidden":!0})]}),c&&e.jsx("div",{className:"bd-edit",children:p})]})}function it({dog:t,attrs:a,tx:i,onlyMissing:r=!1}){var b,S,z,w;const p=f=>f?i(`pack.dogCard.opt.${f}`,f):"",c=f=>void Me(t.id,{card:{...a.card,...f}}),l=a.tags.temperament??[],o=f=>!r||f;return e.jsxs(e.Fragment,{children:[o(l.length===0)&&e.jsxs(Re,{tx:i,label:i("pack.buddy.step.temperament","Temperament"),todo:l.length===0,value:l.map(f=>i(`pack.dogTag.${f}`,f)).join(", "),children:[e.jsx(ze,{options:Pt.map(f=>({value:f,label:i(`pack.dogTag.${f}`,f)})),selected:l,onToggle:f=>{const A=ns(l,f);A.length>Cs||Me(t.id,{tags:{...a.tags,temperament:A}})}}),e.jsx("p",{className:"bd-note",children:i("pack.buddy.maxTags","Up to {n}.",{n:Cs})})]}),o(!a.card.fitness)&&e.jsx(Re,{tx:i,label:i("pack.dogCard.fitness","Physical condition"),todo:!a.card.fitness,value:p(a.card.fitness),children:e.jsx(ze,{options:Et.map(f=>({value:f.value,label:i(`pack.dogCard.opt.${f.value}`,f.labelEN)})),selected:a.card.fitness?[a.card.fitness]:[],onToggle:f=>c({fitness:f})})}),o(!((b=a.card.compat)!=null&&b.dogs_overall))&&e.jsx(Re,{tx:i,label:i("pack.dogCard.compat.dogs_overall","With other dogs"),todo:!((S=a.card.compat)!=null&&S.dogs_overall),value:p((z=a.card.compat)==null?void 0:z.dogs_overall),children:e.jsx(ze,{options:Tt.map(f=>({value:f.value,label:i(`pack.dogCard.opt.${f.value}`,f.labelEN)})),selected:(w=a.card.compat)!=null&&w.dogs_overall?[a.card.compat.dogs_overall]:[],onToggle:f=>c({compat:{...a.card.compat,dogs_overall:f}})})})]})}function De({on:t,onChange:a,label:i}){return e.jsx("button",{type:"button",role:"switch","aria-checked":t,"aria-label":i,className:`bd-sw${t?" is-on":""}`,onClick:r=>{r.preventDefault(),a(!t)},children:e.jsx("i",{})})}function Qa({tx:t,slides:a,fit:i,finish:r,missingSlide:p}){var O;const[c,l]=m.useState(0),[o,b]=m.useState(0),S=a.length;m.useEffect(()=>{c>S-1&&l(Math.max(0,S-1))},[S,c]);const z=m.useRef(null),w=m.useRef(!1),f=P=>l(y=>Math.min(S-1,Math.max(0,y+P))),A=a[Math.min(c,S-1)],h=c>=S-1,_=P=>P instanceof HTMLElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(P.tagName);return e.jsxs("div",{className:`sp-pager${i?" sp-pager--fit":""}`,children:[e.jsxs("div",{className:"sp-nav",children:[e.jsx("button",{type:"button",className:"sp-arrow",disabled:c===0,"aria-label":t("pack.sniffer.prev","Previous"),onClick:()=>f(-1),children:e.jsx(la,{size:14,solid:!0})}),e.jsxs("span",{className:"sp-count","aria-live":"polite",children:[c+1," / ",S]}),e.jsx("button",{type:"button",className:"sp-arrow",disabled:h,"aria-label":t("pack.sniffer.next","Next"),onClick:()=>f(1),children:e.jsx(da,{size:14,solid:!0})})]}),e.jsxs("section",{className:`sp-card${(O=z.current)!=null&&O.drag?" is-drag":""}`,style:{...oe.card,transform:o?`translateX(${o}px) rotate(${o/60}deg)`:void 0,opacity:o?Math.max(.5,1-Math.abs(o)/600):void 0},onPointerDown:P=>{_(P.target)||(z.current={x:P.clientX,y:P.clientY,id:P.pointerId,drag:!1},w.current=!1)},onPointerMove:P=>{const y=z.current;if(!y||y.id!==P.pointerId)return;const C=P.clientX-y.x,M=P.clientY-y.y;if(!y.drag){if(Math.abs(C)<10||Math.abs(C)<Math.abs(M)*1.2)return;y.drag=!0,w.current=!0,P.currentTarget.setPointerCapture(P.pointerId)}const L=C>0&&c===0||C<0&&h;b(L?C/4:C)},onPointerUp:()=>{const P=z.current;z.current=null,P!=null&&P.drag&&Math.abs(o)>=56&&f(o<0?1:-1),b(0)},onPointerCancel:()=>{z.current=null,b(0)},onClickCapture:P=>{w.current&&(P.stopPropagation(),P.preventDefault(),w.current=!1)},children:[e.jsxs("div",{className:"sp-head",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"sp-title",children:A.title}),A.sub&&e.jsx("p",{className:"sp-sub",children:A.sub})]}),A.right]}),e.jsx("div",{className:"sp-body",children:A.body}),(!h||r)&&e.jsxs("div",{className:"sp-foot",children:[(r==null?void 0:r.note)&&h&&r.note,h?r&&e.jsx("button",{type:"button",className:"bd-cta",disabled:r.busy,onClick:()=>p>=0?l(p):r.onClick(),children:r.label}):e.jsxs("button",{type:"button",className:"bd-cta",onClick:()=>f(1),children:[t("pack.buddy.next","Next")," · ",c+2," / ",S]})]})]},A.key),e.jsx("div",{className:"sp-dots",children:a.map((P,y)=>e.jsx("button",{type:"button",className:y===c?"is-on":"",onClick:()=>l(y),"aria-label":`${y+1} / ${S}`,"aria-current":y===c},P.key))})]})}function nt({uid:t,photos:a,together:i,tx:r,suggest:p=[],note:c=!0}){const l=m.useRef(null),[o,b]=m.useState(!1),[S,z]=m.useState(null),[w,f]=m.useState(null),A=(h,_)=>void pe({buddyPhotos:h,buddyPhoto:_??void 0});return e.jsxs("div",{className:"sp-kv",style:{paddingTop:s.sm,display:"flex",flexDirection:"column",gap:s.sm},children:[c&&e.jsx("span",{className:"bd-note",children:r("pack.sniffer.profile.photosNote","Photos — on at least one of them you’re together (green frame).")}),a.length<Xe&&p.filter(h=>!a.includes(h)).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"sp-sec",children:r("pack.sniffer.onb.fromProfile","From your profile")}),e.jsx("div",{className:"sp-suggest",children:p.filter(h=>!a.includes(h)).map(h=>e.jsxs("button",{type:"button","aria-label":r("pack.sniffer.onb.addPhoto","Add this photo"),onClick:()=>A([...a,h],i??h),children:[e.jsx("img",{src:Pe(h,120,120),alt:"",draggable:!1}),e.jsx("i",{"aria-hidden":!0,children:"+"})]},h))})]}),e.jsxs("div",{className:"sp-slots",children:[a.map(h=>e.jsxs("button",{type:"button",className:`sp-slot${h===i?" is-together":""}`,onClick:()=>f(w===h?null:h),children:[e.jsx("img",{src:Za(h),alt:"",draggable:!1}),h===i&&e.jsx("span",{className:"sp-slot__tag",children:r("pack.sniffer.profile.together","together")})]},h)),a.length<Xe&&e.jsx("button",{type:"button",className:"sp-slot",disabled:o||!t,onClick:()=>{var h;return(h=l.current)==null?void 0:h.click()},"aria-label":r("pack.buddy.photoPick","Choose photo"),children:o?"…":"+"})]}),w&&e.jsxs("div",{className:"sp-photo-menu",children:[w!==i&&e.jsx("button",{type:"button",className:"pk-pill pk-pill--tap",onClick:()=>{A(a,w),f(null)},children:r("pack.sniffer.profile.markTogether","We’re together on this one")}),a.indexOf(w)>0&&e.jsx("button",{type:"button",className:"pk-pill pk-pill--tap",onClick:()=>{A([w,...a.filter(h=>h!==w)],i),f(null)},children:r("pack.sniffer.profile.first","Make it first")}),e.jsx("button",{type:"button",className:"pk-pill pk-pill--tap",onClick:()=>{const h=a.filter(_=>_!==w);A(h,w===i?null:i),f(null)},children:r("pack.sniffer.profile.remove","Remove")})]}),e.jsx("input",{ref:l,type:"file",accept:"image/*",multiple:!0,hidden:!0,onChange:async h=>{const _=Xe-a.length,O=Array.from(h.target.files??[]).slice(0,Math.max(0,_)),P=h.target;if(!O.length||!t){P.value="";return}b(!0),z(null);const y=[];try{const C=Date.now();for(let M=0;M<O.length;M++){const L=await Yt(O[M],t,C+M);y.push(L.secureUrl)}}catch(C){z(C instanceof Error?C.message:String(C))}finally{y.length&&A([...a,...y],i??y[0]),b(!1),P.value=""}}}),S&&e.jsx("p",{className:"bd-warn",children:S})]})}const ei=56,Ze="inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 4px 0 var(--p3d-gold-solid)",fe=`linear-gradient(180deg,color-mix(in srgb,${$.edge} 72%,white),${$.deep})`,Ts=`inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 color-mix(in srgb,${$.deep} 60%,black),0 11px 14px var(--p3d-sh)`,si=`linear-gradient(180deg,color-mix(in srgb,${n.sosRed} 62%,white),${n.sosRed})`,Je=`border:2.5px solid var(--p3d-ink) !important;border-radius:${k.card}px !important;background:var(--p3d-card) !important;box-shadow:var(--p3d-b3) !important;`,ti=`background:var(--p3d-paper-hi);border:2.5px solid var(--p3d-ink);border-radius:${k.card}px;box-shadow:var(--p3d-inset);`,ai=`
html.papyrus3d .bd-root.pk-paper::after{background:linear-gradient(180deg,var(--p3d-paper-hi),var(--p3d-paper));}
html.papyrus3d .bd-root.pk-paper::before{background:radial-gradient(circle at 50% 30%,var(--p3d-paper-hi) 0%,transparent 70%);}
/* kontajnery kariet */
html.papyrus3d .bd-card:not(.bd-hero--bare),html.papyrus3d .sp-card,html.papyrus3d .sh-sheet,html.papyrus3d .sh-row{${Je}}
html.papyrus3d .bd-h2,html.papyrus3d .sp-title,html.papyrus3d .sh-sheet h3{font-family:'LT Museum',serif;font-weight:400;font-size:${d.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .bd-eyebrow,html.papyrus3d .sp-sec{color:var(--p3d-gold-ink);}
html.papyrus3d .bd-lead,html.papyrus3d .bd-note,html.papyrus3d .sp-sub,html.papyrus3d .sh-note,html.papyrus3d .bd-onbox small,html.papyrus3d .bd-tagline{color:var(--p3d-ink);}
/* P1: logo + nápis */
html.papyrus3d .bd-logo3d{display:flex;flex-direction:column;align-items:center;margin:0 auto;}
html.papyrus3d .bd-logo3d img{width:150px;height:150px;margin-bottom:-${s.md}px;position:relative;z-index:1;}
/* Obrys 7 px a tieň 5 px trčia z boxu a .bd-grow > div ich orezal (overflow:hidden) — vzduch ich vráti dnu (Matej 21. 11.: „orezaný nadpis“). */
html.papyrus3d .bd-wm{padding:${s.sm}px ${s.sm}px ${s.md}px;display:block;font-family:'LT Museum',serif;font-weight:400;font-size:${ei}px;line-height:1;letter-spacing:.02em;color:${$.ink};-webkit-text-stroke:7px var(--p3d-ink);paint-order:stroke fill;filter:drop-shadow(0 5px 0 var(--p3d-gold-ink));}
/* tlačidlá: lapis b3, ostatné paper b3 */
html.papyrus3d .bd-cta,html.papyrus3d .bd-ghost,html.papyrus3d .sh-ghost{min-height:56px;display:inline-flex;align-items:center;justify-content:center;border:2.5px solid ${$.ink};border-radius:${k.card}px;background:${fe};color:${$.ink};box-shadow:${Ts};font-family:'LT Museum',serif;font-weight:400;font-size:${d.h2}px;letter-spacing:0;text-transform:none;}
html.papyrus3d .bd-cta:hover{background:${fe};}
html.papyrus3d .bd-cta:active:not(:disabled){transform:translateY(5px);}
html.papyrus3d .bd-cta--small{min-height:48px;font-size:${d.lead}px;}
html.papyrus3d .bd-dock .bd-cta:disabled{background:var(--p3d-card);border-color:var(--p3d-ink);color:var(--p3d-ink);opacity:.6;box-shadow:var(--p3d-b3);}
html.papyrus3d .bd-ghost,html.papyrus3d .sh-ghost,html.papyrus3d .sh-ghost--dark{border-color:var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);box-shadow:var(--p3d-b3);}
/* pole */
html.papyrus3d .bd-col .pf-field,html.papyrus3d .bd-field,html.papyrus3d .sh-area{${ti}color:var(--p3d-ink);font-weight:500;}
/* pilulky: papier, vybraná lapis */
html.papyrus3d .bd-pills .pk-pill{min-height:44px;border:2.5px solid var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);box-shadow:${Ze};}
html.papyrus3d .bd-pills .pk-pill.is-on{border-color:${$.ink};background:${fe};color:${$.ink};box-shadow:${Ze};}
html.papyrus3d .bd-todo,html.papyrus3d .sp-kv > button > b.is-todo,html.papyrus3d .sp-miss{border:2.5px solid ${$.ink};background:${fe};color:${$.ink};}
html.papyrus3d .bd-link{color:${$.edge};}
/* prepínač zapnuté/vypnuté */
html.papyrus3d .bd-sw{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
html.papyrus3d .bd-sw.is-on{background:${fe};border-color:var(--p3d-ink);}
html.papyrus3d .bd-sw i{background:var(--p3d-card);border:2px solid var(--p3d-ink);box-shadow:none;}
html.papyrus3d .bd-onbox{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
/* riadky profilu */
html.papyrus3d .sp-kv,html.papyrus3d .bd-item + .bd-item{border-top:1.5px solid var(--p3d-gold);}
html.papyrus3d .sp-kv > button,html.papyrus3d .sp-static,html.papyrus3d .bd-row{color:var(--p3d-ink);}
html.papyrus3d .sp-kv > button > b,html.papyrus3d .sp-static b{color:var(--p3d-ink);}
html.papyrus3d .sp-slot{border:2.5px dashed var(--p3d-ink);background:var(--p3d-paper-hi);}
html.papyrus3d .sp-arrow{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);color:var(--p3d-ink);}
html.papyrus3d .bd-mark{border:2.5px solid var(--p3d-ink);}
html.papyrus3d .bd-edit{border:2.5px solid var(--p3d-ink);background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);}
/* P7: prepínač Sniffuj · Hľadať · Zhody */
html.papyrus3d .sh-tabs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:${s.xs}px;padding:${s.xs}px;border-radius:${k.card}px;border:2.5px solid var(--p3d-ink);background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .sh-tabs button{min-height:50px;border-radius:${k.frame}px;font-family:'LT Museum',serif;font-weight:400;font-size:${d.h2}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .sh-tabs button.is-on{color:${$.ink};background:${fe};border:2.5px solid ${$.ink};box-shadow:inset 0 2px 0 color-mix(in srgb,white 28%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 4px 0 color-mix(in srgb,${$.deep} 60%,black);}
html.papyrus3d .ss-segs{border:2.5px solid var(--p3d-ink);border-radius:${k.card}px;background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .ss-seg{border-radius:${k.frame}px;font-family:'LT Museum',serif;font-weight:400;font-size:${d.lead}px;color:var(--p3d-ink);}
html.papyrus3d .ss-seg.is-on{background:${fe};color:${$.ink};border:2.5px solid ${$.ink};}
html.papyrus3d .ss-flt,html.papyrus3d .ss-flag{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);box-shadow:${Ze};}
html.papyrus3d .ss-drop{${Je}}
html.papyrus3d .ss-ctry{border:2.5px solid var(--p3d-ink);background:var(--p3d-card);}
/* P7: karta psa v zlatom ráme s perom */
html.papyrus3d .sn-card,html.papyrus3d .sh-skel-card{border:3px solid var(--p3d-gold);border-radius:${k.card}px;box-shadow:0 0 0 2px var(--p3d-ink),0 7px 0 2px var(--p3d-gold-ink),0 13px 16px var(--p3d-sh);}
html.papyrus3d .sn-card.is-back{box-shadow:none;}
html.papyrus3d .sn-nm{font-family:'LT Museum',serif;font-weight:400;}
html.papyrus3d .sn-dogs em{font-family:'LT Museum',serif;font-weight:400;font-size:${d.lead}px;}
html.papyrus3d .sh-deck{margin-bottom:${s.md}px;}
/* P7: SNIFF = lapis, ✕ = červené (negatívne CTA celé červené) */
html.papyrus3d .sh-act{font-size:0;gap:0;}
html.papyrus3d .sh-btn{height:64px;border:2.5px solid var(--p3d-ink);border-radius:${k.card}px;}
html.papyrus3d .sh-btn--no{width:64px;border-radius:50%;background:${si};box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),inset 0 -4px 0 color-mix(in srgb,black 15%,transparent),0 6px 0 ${n.sosRedDark},0 11px 14px var(--p3d-sh);}
html.papyrus3d .sh-btn--yes{width:auto;min-width:176px;gap:${s.sm}px;padding:0 ${s.lg}px;border-color:${$.ink};background:${fe};box-shadow:${Ts};color:${$.ink};}
html.papyrus3d .sh-btn--yes img{width:40px;height:40px;}
html.papyrus3d .sh-sniff{font-family:'LT Museum',serif;font-weight:400;font-size:${d.h2}px;letter-spacing:0;text-transform:uppercase;}
html.papyrus3d .sh-stamp{font-family:'LT Museum',serif;font-weight:400;}
html.papyrus3d .sh-errbar{border:2.5px solid ${n.sosRed};}
html.papyrus3d .sh-mini{color:${$.edge};font-size:${d.body}px;}
html.papyrus3d .sh-new{border:2px solid var(--p3d-ink);}
/* P9: nikto tu nie je = jazvečík, Ups… a karta s oznamom */
html.papyrus3d .se-p3d{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;gap:${s.md}px;text-align:center;width:100%;max-width:440px;margin:0 auto;}
html.papyrus3d .se-p3d img{width:160px;height:auto;display:block;}
html.papyrus3d .se-p3d .se-oops{font-family:'LT Museum',serif;font-weight:400;font-size:${d.h1}px;letter-spacing:.02em;text-transform:none;color:var(--p3d-ink);}
html.papyrus3d .se-p3d strong{font-weight:500;font-size:${d.lead}px;line-height:1.4;color:var(--p3d-ink);}
html.papyrus3d .se-p3d .se-note{align-self:stretch;text-align:left;padding:${s.md}px;${Je}}
html.papyrus3d .se-p3d .se-note i{color:var(--p3d-gold-ink);}
html.papyrus3d .se-p3d .se-note p{font-size:${d.body}px;color:var(--p3d-ink);}
`,ii={name:"Name",age:"Age",gender:"Gender",region:"Where you live",temperament:"Temperament",fitness:"Physical condition",compat:"With other dogs",photo:"Photo: you + your dog",intents:"What I’m looking for",audience:"Who sees me"},ni=`
.bd-root{min-height:100dvh;display:flex;flex-direction:column;}
/* ZLATÝ SÚMRAK namiesto tapety s heroglyfmi (Matej 5. 10. 2026: *„snifer by som dal pozadie bez
   tých heroglyfov a zvýraznil tie bloky, ale nech je to v brande a cool"* → z hárku A/B/C *„daj C"*).
   Bloky v rozmazanej tapete zanikali. Papyrus hore prechádza do zlata dole, v pravom rohu svetlo.
   Prepisuje len vrstvy receptu .pk-paper (::before = kresba, ::after = odtieň), nie jeho stavbu. */
.bd-root.pk-paper::before{background-image:none;filter:none;
  background:radial-gradient(circle at 85% 8%, rgba(255,236,190,0.95) 0%, rgba(255,236,190,0) 38%);}
.bd-root.pk-paper::after{background:linear-gradient(180deg, #F7EBD0 0%, #EED7A6 45%, #D9A95A 100%);}
.bd-setlink{display:block;margin:0 auto;font-size:${d.body}px;}
.bd-col{flex:1 1 auto;width:100%;max-width:640px;min-height:100dvh;margin:0 auto;padding:${kt} ${Ae.side}px ${Ae.md}px;
  display:flex;flex-direction:column;gap:${s.lg}px;}
/* Spoločný rad hlavičky (27. 9. 2026): stĺpec už medzi deťmi dáva gap, rad si z vlastnej
   medzery nechá len rozdiel, aby obsah začal na PACK_TOPROW.content ako všade inde. */
.bd-col > .pk-toprow{margin-bottom:${We.content-We.top-We.h-s.lg}px;}
/* SNIFFUJ = jedna obrazovka bez scrollu: stĺpec presne na výšku okna, balíček berie zvyšok. */
.bd-col--fit{height:100dvh;min-height:0;}
.bd-card{padding:${s.lg}px;display:flex;flex-direction:column;gap:${s.md}px;}
.bd-card--list{padding:${s.sm}px 0;gap:0;}
.bd-card--list > .bd-eyebrow{padding:${s.sm}px ${s.lg}px;}
.bd-eyebrow{display:flex;align-items:center;justify-content:space-between;gap:${s.sm}px;font-family:${j};font-weight:500;
  font-size:${d.micro}px;letter-spacing:.22em;text-transform:uppercase;color:${n.inkWarm};}
.bd-h2{margin:0;font-family:${de};font-weight:700;font-size:${d.h2}px;letter-spacing:.14em;text-transform:uppercase;color:${n.inkStrong};}
.bd-lead{margin:0;font-family:${j};font-size:${d.body}px;line-height:1.55;color:${n.inkDim};}
.bd-head{display:flex;align-items:center;gap:${s.lg}px;}
.bd-head > div:last-child{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${s.sm}px;}
.bd-count{font-family:${j};font-size:${d.label}px;color:${n.inkWarm};}
.bd-count b{font-weight:600;color:${n.inkStrong};}
/* riadok brány — zoznam v karte, deliace čiary namiesto samostatných dlaždíc */
.bd-item + .bd-item{border-top:1px solid ${n.hairline};}
.bd-row{display:flex;align-items:center;gap:${s.md}px;width:100%;padding:${s.md}px ${s.lg}px;
  background:transparent;border:0;cursor:pointer;text-align:left;font-family:${j};color:${n.inkStrong};}
.bd-row:hover{background:${n.tileBg};}
.bd-row__txt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;}
.bd-row__txt b{font-weight:600;font-size:${d.body}px;}
.bd-row__txt small{font-size:${d.label}px;color:${n.inkDim};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bd-mark{position:relative;flex:0 0 auto;width:24px;height:24px;border-radius:${k.pill}px;display:flex;align-items:center;
  justify-content:center;font-size:${d.label}px;font-weight:600;border:1px solid ${n.border};color:${n.inkWarm};background:${n.cardSoft};}
.bd-mark.is-done{background:${fs.green};border-color:${fs.green};}
/* fajka kreslená rámom, nie znakom fontu */
.bd-mark.is-done::after{content:'';width:6px;height:11px;margin-top:-3px;border-right:2px solid ${n.card};border-bottom:2px solid ${n.card};transform:rotate(45deg);}
.bd-todo{flex:0 0 auto;font-size:${d.label}px;font-weight:600;padding:${s.xs}px ${s.md}px;border-radius:${k.pill}px;
  border:1px solid ${$.edge};${re($.edge,te.lapis,.1)}}
.bd-chev{flex:0 0 auto;width:8px;height:8px;border-right:1.5px solid ${n.inkFaint};border-bottom:1.5px solid ${n.inkFaint};transform:rotate(-45deg);}
.bd-item.is-open .bd-chev{transform:rotate(45deg);}
.bd-edit{margin:0 ${s.lg}px ${s.lg}px;padding:${s.md}px;border-radius:${k.tile}px;background:${n.tileBg};
  border:1px solid ${n.hairline};display:flex;flex-direction:column;gap:${s.sm}px;}
.bd-pills{display:flex;flex-wrap:wrap;gap:${s.sm}px;}
.bd-pills .pk-pill{font-family:${j};font-size:${d.label}px;}
.bd-pills .pk-pill.is-on{${re($.edge,te.lapis,.16)}}
/* ZAPARKOVANÉ voľby (páry/svorky od 12/2026) — vidno ich, zvoliť nejdú. */
.bd-pills .pk-pill:disabled{opacity:.45;cursor:default;}
.bd-pills .pk-pill small{font-size:${d.micro}px;opacity:.8;}
.bd-field{width:100%;border-radius:${k.field}px;padding:${s.sm}px ${s.md}px;
  font-family:${j};font-size:${d.body}px;color:${n.inkStrong};}
.bd-inline{display:flex;gap:${s.sm}px;align-items:center;}
.bd-inline .bd-field{flex:1 1 auto;min-width:0;}
.bd-note{margin:0;font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
.bd-note--center{text-align:center;}
.bd-warn{margin:0;font-family:${j};font-size:${d.label}px;color:${te.red};}
.bd-cta{width:100%;border-radius:${k.field}px;padding:${s.md}px ${s.lg}px;border:1px solid ${$.deep};
  background:${$.grad};color:${$.ink};box-shadow:${Os};font-family:${de};font-weight:700;
  font-size:${d.body}px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;}
.bd-cta:hover{background:${$.gradHover};}
.bd-cta:disabled{opacity:.45;cursor:default;}
.bd-cta--small{width:auto;align-self:flex-start;padding:${s.sm}px ${s.lg}px;font-size:${d.label}px;}
.bd-ghost{width:100%;border-radius:${k.field}px;padding:${s.md}px;border:1px solid ${n.border};background:transparent;
  font-family:${j};font-weight:600;font-size:${d.label}px;letter-spacing:.14em;text-transform:uppercase;color:${n.inkWarm};cursor:pointer;}
/* tlačidlo drží dole, zoznam pod ním beží — bez vlastného pásu, aby nekreslilo obdĺžnik cez tapetu */
.bd-incta{width:100%;display:flex;flex-direction:column;gap:${s.sm}px;margin-top:${s.md}px;}
.bd-dock{position:sticky;bottom:${Ae.min}px;z-index:4;display:flex;flex-direction:column;gap:${s.sm}px;}
.bd-dock .bd-cta:disabled{opacity:1;background:${n.cardSoft};color:${n.inkWarm};border-color:${n.border};box-shadow:${ae.panel};cursor:default;}
/* tri kroky úvodu */
.bd-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:${s.md}px;}
.bd-steps li{display:flex;gap:${s.md}px;align-items:flex-start;font-family:${j};font-size:${d.body}px;color:${n.inkStrong};}
.bd-steps li small{display:block;font-size:${d.label}px;color:${n.inkDim};}
.bd-steps li > span:last-child{padding-top:${s.xs}px;}
.bd-steps b{font-weight:600;}
/* kotúč kroku — tri farby, tri významy: zlato = ty (konštrukcia), lapis = psy rozhodujú
   (voľba), zelená = zhoda (splnené). Farby sú brandové tokeny, nie nové odtiene. */
.bd-disc{position:relative;flex:0 0 auto;width:${U.md}px;height:${U.md}px;border-radius:${k.pill}px;
  display:flex;align-items:center;justify-content:center;box-shadow:${ae.card};}
.bd-disc i{position:absolute;top:-${s.xs}px;right:-${s.xs}px;width:20px;height:20px;border-radius:${k.pill}px;
  display:flex;align-items:center;justify-content:center;font-style:normal;font-family:${j};font-weight:600;
  font-size:${d.micro}px;background:${n.card};color:${n.inkStrong};border:1px solid ${n.border};}
/* rajón veku — dva jazdce na jednej koľajnici */
.bd-range{position:relative;height:${s.xl}px;}
.bd-range__rail,.bd-range__fill{position:absolute;top:50%;height:4px;margin-top:-2px;border-radius:${k.pill}px;}
.bd-range__rail{left:0;right:0;background:${n.hairline};}
.bd-range__fill{background:${$.edge};}
.bd-range input{position:absolute;inset:0;width:100%;margin:0;background:none;pointer-events:none;-webkit-appearance:none;appearance:none;}
.bd-range input::-webkit-slider-thumb{pointer-events:auto;-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:${k.pill}px;
  background:${$.grad};border:2px solid ${n.card};box-shadow:${ae.card};cursor:grab;}
.bd-range input::-moz-range-thumb{pointer-events:auto;width:24px;height:24px;border-radius:${k.pill}px;
  background:${$.grad};border:2px solid ${n.card};box-shadow:${ae.card};cursor:grab;}
.bd-range__val{font-family:${j};font-weight:600;font-size:${d.body}px;letter-spacing:.14em;color:${n.inkStrong};}
/* ÚVOD — erb s animovaným logom (SnifferLogo) a jedna veta. */
.bd-hero{padding:${s.xl}px ${s.lg}px;}
.bd-hero .bd-h2{font-size:${d.h1}px;}
.bd-wordmark{margin:0;line-height:0;}
.bd-tagline{margin:0 auto;max-width:30ch;font-family:${j};font-weight:500;font-size:${d.lead}px;line-height:1.45;color:${n.inkStrong};}
.bd-reveal{opacity:0;transform:translateY(${s.sm}px);transition:opacity .6s ease, transform .6s ease;}
.is-done .bd-reveal{opacity:1;transform:none;}
.is-done .bd-tagline{transition-delay:.55s;}
.bd-grow{width:100%;display:grid;grid-template-rows:0fr;transition:grid-template-rows .6s ease;}
.bd-grow > div{overflow:hidden;display:flex;flex-direction:column;align-items:center;text-align:center;gap:${s.md}px;}
.is-done .bd-grow{grid-template-rows:1fr;}
.is-done .bd-wordmark{transition-delay:.25s;}
@media (prefers-reduced-motion: reduce){.bd-reveal{opacity:1;transform:none;transition:none;}.bd-grow{grid-template-rows:1fr;transition:none;}}
.bd-wordmark img{height:${s.xxl+s.md}px;width:auto;}
.bd-hero .bd-lead{font-family:${de};font-size:${d.lead}px;line-height:1.45;color:${n.inkStrong};max-width:28ch;margin:0 auto;}
.bd-hero .bd-lead--ui{font-family:${j};font-size:${d.body}px;color:${n.inkDim};}
/* JEDNA OBRAZOVKA BEZ SCROLLU — obsah sa centruje margin:auto na dieťati, NIE
   justify-content:center (pretečenie by sa rozdelilo na obe strany, lock PAGE_AIR). */
.bd-stage{flex:1 1 auto;display:flex;flex-direction:column;gap:${s.md}px;min-height:0;}
.bd-stage__body{flex:1 1 auto;display:flex;flex-direction:column;}
.bd-stage__body > .bd-card{margin:auto 0;}
.bd-hero--bare{background:none;border:0;box-shadow:none;}
.bd-howcard{gap:${s.lg}px;}
.bd-disc--xl{width:${U.lg+s.xl}px;height:${U.lg+s.xl}px;}
.bd-dots{display:flex;justify-content:center;gap:${s.sm}px;}
.bd-dots span{width:8px;height:8px;border-radius:${k.pill}px;background:${n.hairline};}
.bd-dots span.is-on{background:${n.accentGold};}
/* nahratie fotky — malý náhľad vedľa tlačidla, nie fotka cez celú šírku */
.bd-upl{display:flex;align-items:center;gap:${s.md}px;}
.bd-upl .pk-photo{flex:0 0 auto;width:${U.lg+s.xl}px;aspect-ratio:1;}
.bd-upl > div:last-child{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:${s.sm}px;}
.bd-center{align-items:center;text-align:center;}
/* Na PC široký stĺpec (832 px) — Váš profil tam ukáže viac kariet vedľa seba. */
@media (min-width:768px){ .bd-col--wide{max-width:${yt+2*Ae.side}px;} }
/* NASTAVENIA — logo a veľký prepínač v jednej doske (nákres E). Zapnuté = LAPIS: je to moja voľba. */
.bd-sethead{flex-direction:row;align-items:center;justify-content:space-between;}
.bd-sethead__logo{height:${s.xxxl}px;width:auto;}
.bd-sw{position:relative;flex:0 0 auto;width:${s.xxxl+s.xs}px;height:${s.xl+s.sm}px;border-radius:${k.pill}px;
  border:1px solid ${n.border};background:${n.hairline};cursor:pointer;padding:0;transition:background .2s ease;}
.bd-sw i{position:absolute;top:${s.xs}px;left:${s.xs}px;width:${s.xl}px;height:${s.xl}px;border-radius:${k.pill}px;
  background:${n.card};box-shadow:${ae.card};transition:left .2s ease;}
.bd-sw.is-on{background:${$.grad};border-color:${$.deep};}
.bd-sw.is-on i{left:calc(100% - ${s.xl+s.xs}px);}
.bd-link{border:0;background:none;padding:0;cursor:pointer;font:inherit;color:${$.edge};text-decoration:underline;}
.bd-areas{max-width:440px;width:100%;}
.bd-photo--empty{display:flex;align-items:center;justify-content:center;text-align:center;padding:${s.sm}px;font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
/* PRUH „Váš profil" sa vypĺňa LAPISOM, nie červenou (Matej 25. 9.: „váš profil sa vypĺňa modrou
   nie červenou") — je to moja akcia, nie chyba. Hotový ostáva zelený (splnené). */
.bd-col .pk-progress__fill--low{background:${$.grad};}
.bd-dock--card{width:100%;max-width:440px;margin:0 auto;}
/* ZAPNUTIE v karte Základ (nastavenia). Matej 25. 9.: „ten lapis tam nie je ok a ani ten celý blok…
   daj tlačidlo do obrysu a zväčši to, nech je to súmerné, na výšku tej fotky". Výška = výška fotky
   (tá istá clamp ako .sp-slot v režime bez scrollu), obsah na stred, tlačidlo len obrys. */
.bd-onbox{margin-left:auto;align-self:flex-end;height:clamp(${s.xxxl+s.lg}px, 20dvh, ${s.xxxl*4}px);
  min-width:min(100%, ${s.xxxl*6}px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${s.md}px;
  padding:${s.md}px ${s.lg}px;border-radius:${k.tile}px;border:1px solid ${n.border};background:${n.tileBg};}
.bd-onbox__row{display:flex;align-items:center;gap:${s.lg}px;}
.bd-onbox__row img{height:${s.xxl+s.sm}px;width:auto;}
.bd-onbox small{font-family:${j};font-size:${d.label}px;color:${n.inkDim};}
.bd-onbox .bd-ghost{width:100%;padding:${s.sm}px ${s.lg}px;}
/* B12 (audit-sniffer-2026-09-26, 360 px): tento blok prerastal cez pager „Ďalej n/m" karty
   (vnútorný scroll pretiekol o ~39 px) — menší OBSAH bloku, nie vzduch PAGE_AIR (lock). */
@media (max-width:374px){
  .bd-onbox{gap:${s.xs}px;padding:${s.sm}px ${s.md}px;
    height:clamp(${s.xxxl+s.sm}px, 18dvh, ${s.xxxl*4}px);}
  .bd-onbox__row img{height:${s.xl}px;}
}
.bd-switch{display:flex;align-items:center;justify-content:space-between;gap:${s.md}px;font-family:${j};
  font-size:${d.body}px;color:${n.inkStrong};}

${ai}
`;function Nn(){var R,G;const t=mt(),a=(v,E,F)=>{const me=t(v,F);return me!==v?me:F?E.replace(/\{(\w+)\}/g,(ot,ms)=>ms in F?String(F[ms]):ot):E},i=os(),[r,p]=m.useState(null),[c,l]=m.useState(null),[o,b]=m.useState(null),[S,z]=m.useState(null),[w,f]=m.useState("who"),[A,h]=m.useState(!1),_=m.useCallback(()=>h(!0),[]),[O,P]=m.useState(null),[y,C]=m.useState(!1),[M,L]=m.useState(null),[ee,Q]=m.useState(!1),[se,X]=m.useState(null),[q,ie]=m.useState("enable"),{profile:T}=Ds(),{dogs:B,avatarUrl:J,ownerGender:u,loading:H}=Dt(((R=r==null?void 0:r.user)==null?void 0:R.id)??null),V=m.useRef("");m.useEffect(()=>{var E;if(!T||H||!B.length||!((E=r==null?void 0:r.user)!=null&&E.id))return;const v=B.map(F=>F.id).join(",");V.current!==v&&(V.current=v,At(B.map(F=>F.id),F=>T.dogs[F]??_e(F)).then(F=>Promise.all(F.map(me=>Me(me.dogId,me.patch,{noMirror:!0})))).catch(F=>console.warn("[PackBuddy] prefill from DOG ID failed:",F.message)))},[T,B,H,(G=r==null?void 0:r.user)==null?void 0:G.id]);const Z=oi[(u??"").toLowerCase()]??null,x=B.map(v=>Kt(v.country)).find(Boolean)??null;m.useEffect(()=>{He.auth.getSession().then(({data:v})=>p(v.session)),ca().then(l)},[]),m.useEffect(()=>{if(!S)return;const v=E=>{E.key==="Escape"&&z(null)};return window.addEventListener("keydown",v),()=>window.removeEventListener("keydown",v)},[S]),m.useEffect(()=>{c&&o===null&&b("splash")},[c,o]);const I=(r==null?void 0:r.user.user_metadata)??{},W=B.map(v=>{var E;return(E=v.owner_name)==null?void 0:E.trim()}).find(Boolean)??"",ne=(I.full_name??"").trim()||W,N=T==null?void 0:T.human,Y=m.useMemo(()=>ma(B,v=>T==null?void 0:T.dogs[v]),[B,T]),D=Y?(T==null?void 0:T.dogs[Y.id])??_e(Y.id):void 0;m.useEffect(()=>{Z&&T&&!T.human.gender&&pe({gender:Z})},[Z,T]);const K=c??Ye,he=m.useMemo(()=>Array.from(new Set([N==null?void 0:N.buddyPhoto,N==null?void 0:N.coverPhoto,...(N==null?void 0:N.coverAlbum)??[],J,...B.map(v=>v.cloudinary_main_url)].filter(v=>!!v&&/^https?:/.test(v)))),[N,J,B]),Te=fa.filter(v=>v.key!=="gender"||!Z),ce=ha({name:ne,human:N,dogAttrs:D,hasDog:!!Y,settings:K}).filter(v=>Te.some(E=>E.key===v)),le=async v=>{const E=c??Ye;l({...E,...v});const F=await ua(v);return F.ok?X(null):(l(E),P("missing"in F?F.missing:null),X(a("pack.sniffer.err.settings","Couldn’t save the setting — reverted."))),F},ke=async v=>{try{await pe(v,{throwOnError:!0}),X(null)}catch{X(a("pack.sniffer.err.save","Couldn’t save. Try again."))}},ue=async(v="done")=>{C(!0),P(null);const E=await le({enabled:!0,paused_until:null});C(!1),E.ok?b(v):l(F=>({...F??Ye,enabled:!1}))},Be=v=>a(`pack.buddy.step.${v}`,ii[v]),Ke=o==="settings"?a("pack.buddy.settings","Settings"):a("pack.buddy.title","SNIFFER"),ye=()=>{f(Ua(N,ce)),b("onb")},$e=()=>{K.enabled?b("home"):ye()};m.useEffect(()=>{if(o!=="splash"||!K.enabled)return;const v=window.setTimeout($e,Wt);return()=>window.clearTimeout(v)},[o,K.enabled]);const ve=()=>{if(o==="settings")K.enabled?b("home"):ye();else if(o==="done"&&q==="settings")b("settings");else if(o==="onb"){const v=is.indexOf(w);v>0?f(is[v-1]):b("splash")}else $t()?i(-1):i("/pack/map")},xe=v=>{switch(v){case"name":return e.jsxs("div",{className:"bd-inline",children:[e.jsx("input",{className:"pf-field bd-field",value:M??ne,placeholder:a("pack.buddy.namePh","First name"),onChange:E=>L(E.target.value)}),e.jsx("button",{type:"button",className:"bd-cta bd-cta--small",disabled:!(M??"").trim()||ee,onClick:async()=>{if(!ee){Q(!0),X(null);try{const E=(M??"").trim();await He.auth.updateUser({data:{full_name:E}}),await It(E);const{data:F}=await He.auth.getSession();p(F.session),L(null)}catch{X(a("pack.sniffer.err.name","Couldn’t save the name. Try again."))}finally{Q(!1)}}},children:ee?"…":a("pack.buddy.save","Save")})]});case"age":return e.jsxs(e.Fragment,{children:[e.jsx("input",{className:"pf-field bd-field",type:"number",inputMode:"numeric",min:1,max:120,defaultValue:(N==null?void 0:N.age)??"",placeholder:a("pack.profile.agePlaceholder","Age"),onBlur:E=>{T&&ke({age:E.target.value===""?void 0:Number(E.target.value)})}},T?"p":"l"),typeof(N==null?void 0:N.age)=="number"&&N.age<gs&&e.jsx("p",{className:"bd-warn",children:a("pack.buddy.under18","Buddies is for people aged {n} and over.",{n:gs})})]});case"gender":return e.jsx(cs,{options:rs.map(E=>({value:E.value,label:a(`pack.buddy.gender.${E.value}`,E.labelEN)})),selected:N!=null&&N.gender?[N.gender]:[],onToggle:E=>void ke({gender:E})});case"region":return e.jsx("input",{className:"pf-field bd-field",defaultValue:(N==null?void 0:N.region)??"",placeholder:a("pack.profile.cityPlaceholder","City"),onBlur:E=>{T&&ke({region:E.target.value.trim()||void 0})}},T?"p":"l");case"intents":return e.jsx(ri,{selected:(N==null?void 0:N.intents)??[],tx:a,onErr:()=>X(a("pack.sniffer.err.save","Couldn’t save. Try again."))});case"audience":return e.jsx(qe,{s:K,onPatch:le,tx:a});default:return null}},g=v=>{switch(v){case"name":return ne||"—";case"age":return N!=null&&N.age?String(N.age):"—";case"gender":return N!=null&&N.gender?a(`pack.buddy.gender.${N.gender}`,N.gender):"—";case"region":return(N==null?void 0:N.region)||"—";case"intents":return((N==null?void 0:N.intents)??[]).filter(E=>E!=="community").map(E=>a(`pack.buddy.intent.${E}`,E)).join(", ")||"—";case"audience":return K.show_to_genders.length?`${K.show_to_genders.map(E=>a(`pack.buddy.showTo.${E}`,E)).join(", ")} · ${K.age_min}–${K.age_max}`:"—";default:return"—"}};return!o||H&&!B.length?e.jsx(As,{title:a("pack.buddy.title","SNIFFER"),onBack:ve,backLabel:a("pack.buddy.back","Back")}):e.jsxs(As,{title:Ke,onBack:ve,backLabel:a("pack.buddy.back","Back"),task:o==="splash"||o==="onb"||o==="settings",wide:o==="onb"||o==="settings",fit:o==="home"||o==="done"||o==="onb"||o==="settings",children:[o==="splash"&&e.jsx("div",{className:"bd-stage",onClick:()=>{K.enabled&&$e()},children:e.jsx("div",{className:"bd-stage__body",children:e.jsxs("div",{className:`bd-card bd-center bd-hero bd-hero--bare${A?" is-done":""}`,children:[e.jsx(Ht,{size:U.lg*3+s.xl,onDone:_}),e.jsx("div",{className:"bd-grow",children:e.jsxs("div",{children:[e.jsx("h2",{className:"bd-wordmark bd-reveal",children:e.jsx("span",{className:"bd-wm",children:"Sniffer"})}),e.jsx("p",{className:"bd-tagline bd-reveal",children:a("pack.buddy.intro","Find buddies to sniff out the world with.")}),!K.enabled&&e.jsxs("div",{className:"bd-incta bd-reveal",children:[e.jsx("button",{type:"button",className:"bd-cta",onClick:$e,children:a("pack.buddy.introCta","I want buddies")}),e.jsx("p",{className:"bd-note bd-note--center",children:a("pack.buddy.introOff","Off by default")})]})]})})]})})}),o==="onb"&&e.jsxs(e.Fragment,{children:[se&&e.jsx("p",{className:"bd-warn",children:se}),e.jsx(Xa,{step:w,onStep:f,tx:a,uid:(r==null?void 0:r.user.id)??null,human:N,settings:K,onPatch:le,dogs:B,dogAttrsOf:v=>T==null?void 0:T.dogs[v],buddyDogId:(Y==null?void 0:Y.id)??null,homeCountry:x,missing:ce,heroGender:Z,editor:xe,summary:g,intentsEditor:xe("intents"),audienceEditor:v=>e.jsx(qe,{s:K,onPatch:le,tx:a,part:v}),onEnable:()=>void ue("home"),busy:y,note:O&&O.length>0?e.jsx("p",{className:"bd-warn",children:a("pack.buddy.serverMissing","Still missing: {list}",{list:O.map(Be).join(", ")})}):void 0,reloadKey:T==null?void 0:T.updatedAt,suggestPhotos:he})]}),o==="done"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bd-center",style:{display:"flex",flexDirection:"column",gap:s.xs},children:[e.jsx("h2",{className:"bd-h2",children:a("pack.buddy.doneTitle","You’re in the buddy pack")}),e.jsx("p",{className:"bd-note",children:a("pack.sniffer.seenHint","This is how others see you · tap right = next photo")})]}),e.jsx("style",{children:Ee}),e.jsx(ls,{tx:a,reloadKey:T==null?void 0:T.updatedAt,onOpenFull:z}),S&&e.jsxs("div",{className:"pk-veil pk-veil--modal",onClick:()=>z(null),children:[e.jsx("style",{children:Is}),e.jsx("div",{role:"dialog","aria-modal":"true","aria-label":a("pack.sniffer.seenHint","This is how others see you · tap right = next photo"),style:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},onClick:v=>{v.target.closest(".sfp-photo, .sfp-card, button, a")&&v.stopPropagation()},children:e.jsx(st,{card:S,tx:a})})]}),e.jsx("div",{className:"bd-dock bd-dock--card",children:e.jsx("button",{type:"button",className:"bd-cta",onClick:()=>b("home"),children:a("pack.sniffer.goSniff","Let’s go sniffing")})}),e.jsx("button",{type:"button",className:"bd-link bd-setlink",onClick:()=>b("settings"),children:a("pack.buddy.settingsLink","SNIFFER settings")})]}),o==="home"&&e.jsxs(e.Fragment,{children:[e.jsx(Ya,{tx:a,me:{photo:(N==null?void 0:N.buddyPhoto)??J??null,name:ne,dogName:(Y==null?void 0:Y.dog_name)??null}}),e.jsx("button",{type:"button",className:"bd-link bd-setlink",onClick:()=>b("settings"),children:a("pack.buddy.settingsLink","SNIFFER settings")})]}),o==="settings"&&e.jsxs(e.Fragment,{children:[se&&e.jsx("p",{className:"bd-warn",children:se}),e.jsx(qa,{tx:a,uid:(r==null?void 0:r.user.id)??null,human:N,dogs:B,dogAttrsOf:v=>T==null?void 0:T.dogs[v],missing:ce,gateEditor:xe,gateSummary:g,homeCountry:x,audienceEditor:v=>e.jsx(qe,{s:K,onPatch:le,tx:a,part:v}),settings:K,onPatch:le,fit:!0,reloadKey:T==null?void 0:T.updatedAt,suggestPhotos:he,basicsAside:e.jsxs("div",{className:"bd-onbox",children:[e.jsxs("div",{className:"bd-onbox__row",children:[e.jsx("img",{src:"/icons/sniffer/sniffer-logo.svg",alt:"SNIFFER"}),e.jsx("button",{type:"button",role:"switch","aria-checked":K.enabled,disabled:y,"aria-label":a("pack.buddy.inBuddy","I’m in SNIFFER"),className:`bd-sw${K.enabled?" is-on":""}`,onClick:async()=>{if(K.enabled){await le({enabled:!1});return}if(ce.length>0){ye();return}await ue()},children:e.jsx("i",{})})]}),e.jsx("small",{children:K.enabled?a("pack.buddy.on","On"):a("pack.buddy.offNote","Off — nobody sees you")})]})})]})]})}const oi={man:"male",male:"male",woman:"female",female:"female"};function As({title:t,onBack:a,backLabel:i,wide:r,fit:p,task:c,children:l}){return e.jsxs("div",{className:"pk-paper bd-root",children:[e.jsx("style",{children:ft}),e.jsx("style",{children:ht}),e.jsx("style",{children:ut}),e.jsx("style",{children:xt}),e.jsx("style",{children:gt}),e.jsx("style",{children:bt}),e.jsx("style",{children:Lt}),e.jsx("style",{children:ni}),e.jsxs("main",{className:`bd-col${r?" bd-col--wide":""}${p?" bd-col--fit":""}`,"aria-label":t,children:[e.jsx(Mt,{onBack:a,backLabel:i,task:c}),l]}),e.jsx(pa,{}),e.jsx(Ft,{dogs:[],avatarUrl:null}),e.jsx(Rt,{})]})}function cs({options:t,selected:a,onToggle:i,disabled:r}){return e.jsx("div",{className:"bd-pills",children:t.map(p=>e.jsx("button",{type:"button","aria-pressed":a.includes(p.value),disabled:r==null?void 0:r(p.value),className:`pk-pill pk-pill--tap${a.includes(p.value)?" is-on":""}`,onClick:()=>i(p.value),children:p.label},p.value))})}function ri({selected:t,tx:a,onErr:i}){return e.jsx(cs,{options:xa.map(r=>({value:r.value,label:`${r.emoji?`${r.emoji} `:""}${a(`pack.buddy.intent.${r.value}`,r.labelEN)}`})),selected:t,onToggle:r=>{const p=t.includes(r)?t.filter(c=>c!==r):[...t,r];pe({intents:p},{throwOnError:!0}).catch(i)}})}function qe({s:t,onPatch:a,tx:i,part:r}){const p=t.show_to_genders,c="packs",l=e.jsxs("label",{className:"bd-switch",style:{cursor:"pointer"},children:[e.jsx("span",{children:i("pack.buddy.dogCompatOnly","Only show profiles with dogs that suit ours")}),e.jsx("button",{type:"button",role:"switch","aria-checked":t.dog_compat_only,className:`bd-sw${t.dog_compat_only?" is-on":""}`,onClick:o=>{o.preventDefault(),a({dog_compat_only:!t.dog_compat_only})},children:e.jsx("i",{})})]});return r==="dogs"?l:e.jsxs(e.Fragment,{children:[e.jsx(cs,{options:[...rs.filter(o=>o.value==="male"||o.value==="female").map(o=>({value:o.value,label:`${o.value==="male"?"👨":"👩"} ${i(`pack.buddy.showTo.${o.value}`,o.labelEN)}`})),{value:c,label:`🐾 ${i("pack.buddy.showTo.packs","Packs")} · ${i("pack.sniffer.fromDec","from 12/2026")}`}],disabled:o=>o===c,selected:p,onToggle:o=>void a({show_to_genders:p.includes(o)?p.filter(b=>b!==o):[...p,o]})}),e.jsx(li,{min:t.age_min,max:t.age_max,label:i("pack.buddy.age","Age"),onCommit:(o,b)=>void a({age_min:o,age_max:b})}),r!=="who"&&l]})}function li({min:t,max:a,label:i,onCommit:r}){const[l,o]=m.useState(t),[b,S]=m.useState(a);m.useEffect(()=>{o(t),S(a)},[t,a]);const z=f=>`${(f-18)/81*100}%`,w=()=>{(l!==t||b!==a)&&r(l,b)};return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"bd-switch",children:[e.jsx("span",{children:i}),e.jsxs("span",{className:"bd-range__val",children:[l,"–",b]})]}),e.jsxs("div",{className:"bd-range",onPointerUp:w,onKeyUp:w,children:[e.jsx("span",{className:"bd-range__rail"}),e.jsx("span",{className:"bd-range__fill",style:{left:z(l),right:`calc(100% - ${z(b)})`}}),e.jsx("input",{type:"range",min:18,max:99,value:l,"aria-label":`${i} min`,style:l>=b?{zIndex:2}:void 0,onChange:f=>o(Math.min(Number(f.target.value),b))}),e.jsx("input",{type:"range",min:18,max:99,value:b,"aria-label":`${i} max`,onChange:f=>S(Math.max(Number(f.target.value),l))})]})]})}export{Nn as default};
