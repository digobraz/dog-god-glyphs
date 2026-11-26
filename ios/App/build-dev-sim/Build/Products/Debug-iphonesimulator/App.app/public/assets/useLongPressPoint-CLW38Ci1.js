import{l as ke,L as te}from"./leaflet-DobIbzRN.js";import{r as m,F as Pe,_ as la,u as Z,j as e,a3 as Ue,av as pa,w as R,a1 as U,b as d,a0 as f,L as z,b7 as oe,b8 as da,m as Se,O as L,aF as Ze,f as He,d as ca,aS as ma,c as je,g as Je,b9 as ua,Q as w,aV as ba,an as ka,ay as ve,U as ha}from"./index-DriUOdZL.js";import{b as Ge,e as $e,f as Ye,j as xa,L as va,k as ga,w as fa,C as ya,u as ja,a as ie,M as ne,P as wa,c as Oe,l as we,D as za,m as We,n as Na}from"./circleMark-EhytEmGh.js";import{S as Xe}from"./SysIcon-CI9hudiL.js";import{F as ue,M as pe,t as qe}from"./markEmoji-Cy-_bP1S.js";import{m as $a,d as Le,n as Ea,a as Aa,i as Pa,u as Sa,P as Oa,b as Te,c as La}from"./PlacePhotoSlots-D0aMacUu.js";import{A as Qe}from"./ainubisSheet-BR3ZiSMH.js";import{m as Ce}from"./packCommunity-Z_xRCT1t.js";import{a1 as Ta}from"./MomentHost-D9oSu3w3.js";import{a as Ca}from"./tripPoints-C3j2SdgA.js";import{s as Ma,D as ge}from"./danger-B5gQuuO0.js";import{g as H,i as se,b as Me,G as de,T as De,c as Da}from"./mapNotesData-Bn_974z0.js";import{a as Ie}from"./HandIcons-BI9sYdb3.js";import{n as ze,b as Re,s as Ia,N as Ve,a as _e}from"./mapStickers-BKOSfKbN.js";import{T as Ra}from"./ThinArrow-DxkNjmlF.js";import{b as Va}from"./wizAnchors-DjShJff8.js";import{b as _a,c as Ka,e as Fa}from"./BackButton-8pSTwsJq.js";import{A as Ba}from"./ActedBy-BR_9EWfq.js";import{U as Ua,a as Za}from"./UgcText-Cz8cnqyN.js";import{sizedUrl as Ha}from"./cloudinaryService-CiRx-3N_.js";import{i as ce}from"./useMyNotePoints-Chah-NZ0.js";import{c as Ja,a as Ga,b as Ya}from"./clusterPoints-Czcr2CMx.js";import{H as I,n as W,G as B,T as fe}from"./NotePalette-DIRH0EOT.js";function Wa(a,n,t){n.center!==t.center&&a.setLatLng(n.center),n.radius!=null&&n.radius!==t.radius&&a.setRadius(n.radius)}function Xa(a,n,t){const{opacity:r,zIndex:l}=n;r!=null&&r!==t.opacity&&a.setOpacity(r),l!=null&&l!==t.zIndex&&a.setZIndex(l)}const ea=Ge(function({center:n,children:t,...r},l){const s=new ke.Circle(n,r);return $e(s,Ye(l,{overlayContainer:s}))},Wa);function Ne(){return Ne=Object.assign||function(a){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(a[r]=t[r])}return a},Ne.apply(this,arguments)}function qa({bounds:a,boundsOptions:n,center:t,children:r,className:l,id:s,placeholder:i,style:b,whenReady:c,zoom:v,...y},p){const[k]=m.useState({className:l,id:s,style:b}),[x,u]=m.useState(null);m.useImperativeHandle(p,()=>(x==null?void 0:x.map)??null,[x]);const S=m.useCallback(j=>{if(j!==null&&x===null){const $=new ke.Map(j,y);t!=null&&v!=null?$.setView(t,v):a!=null&&$.fitBounds(a,n),c!=null&&$.whenReady(c),u(xa($))}},[]);m.useEffect(()=>()=>{x==null||x.map.remove()},[x]);const A=x?Pe.createElement(va,{value:x},r):i??null;return Pe.createElement("div",Ne({},k,{ref:S}),A)}const Zo=m.forwardRef(qa),Ho=Ge(function({positions:n,...t},r){const l=new ke.Polyline(n,t);return $e(l,Ye(r,{overlayContainer:l}))},function(n,t,r){t.positions!==r.positions&&n.setLatLngs(t.positions)}),Jo=ga(function({url:n,...t},r){const l=new ke.TileLayer(n,fa(t,r));return $e(l,r)},function(n,t,r){Xa(n,t,r);const{url:l}=t;l!=null&&l!==r.url&&n.setUrl(l)});let me=null,le=null;function Qa(){return me?Promise.resolve(me):(le||(le=la(()=>import("./data-trail-paths-BrZUS1e7.js"),[]).then(a=>me=a.HERO_TRAIL_PATHS).catch(()=>(le=null,{}))),le)}function Go(a=!0){const[n,t]=m.useState(me);return m.useEffect(()=>{if(!a||n)return;let r=!0;return Qa().then(l=>{r&&t(l)}),()=>{r=!1}},[a,n]),n}const Yo=(a,n)=>(n==null?void 0:n[a.id])??a.path,aa=`${Ue}
/* ZÁVOJ = recept .pk-veil--modal (VEIL_CSS) — tu len poloha a odsadenie. */
.pk-veil.tgo-veil{z-index:1300;align-items:flex-end;padding:0;}
@media(min-width:600px){.pk-veil.tgo-veil{align-items:center;padding:16px;}}
/* ⚠️ SPODNÝ NAV PLÁVA NAD PANELOM. Na telefóne panel sadá na spodnú hranu okna a lišta
   /pack (fixed, z-index nad obsahom) mu prekryla POSLEDNÝ riadok — „Otvoriť v Mapy.com"
   bolo vidieť len spolovice. Rezerva sa NEPÍŠE číslom: nav publikuje svoju nameranú výšku
   do premennej --pack-nav-h (ResizeObserver v PackLayout.tsx) a šírka pillu je premenlivá
   podľa jazyka. Na LIVE nav neexistuje (DEV_FULL), premenná chýba a fallback 0 nechá
   panel dole. */
.tgo-panel{width:100%;max-width:420px;max-height:${pa};overflow-y:auto;
  padding:22px 20px calc(24px + var(--pack-nav-h, 0px) + var(--pack-nav-bottom, 0px) + var(--pod-dock, 0px) + env(safe-area-inset-bottom, 0px));
  background:${R.panel.background};border:${R.panel.border};box-shadow:${R.panel.boxShadow};
  border-radius:16px 16px 0 0;}
/* Nad 600 px panel stojí v strede okna, nie na hrane — nav mu už do cesty nevstupuje. */
@media(min-width:600px){.tgo-panel{border-radius:${R.panel.borderRadius}px;padding-bottom:24px;}}
.tgo-title{font-family:${U};font-weight:700;font-size:16px;letter-spacing:0.02em;text-transform:uppercase;color:${d.inkStrong};}
.tgo-where{font-family:${f};font-size:12px;line-height:1.5;color:${d.inkWarm};margin-top:5px;}
.tgo-eyebrow{font-family:${f};font-weight:500;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:${d.cardEdge};margin:20px 0 9px;}
.tgo-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
/* Riadok, nie dlaždica: každá položka je ODKAZ a ten sa číta zľava doprava.
   Mriežka 2×2 drží panel nízky aj na telefóne, kde stojí nad spodnou hranou. */
.tgo-item{display:flex;align-items:center;gap:9px;padding:12px 12px;border-radius:12px;text-align:left;
  background:${d.tileBg};border:1px solid ${d.border};color:${d.inkStrong};
  font-family:${f};font-size:12px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color .15s,background .15s;}
.tgo-item:hover{border-color:${z.edge};background:${z.fill};}
.tgo-item--wide{grid-column:1 / -1;}
.tgo-grid--top{margin-top:16px;}
.tgo-ic{font-family:${ue};font-size:16px;line-height:1;flex-shrink:0;}
/* Logo aplikácie (Matej 5. 10. 2026: „tu by som dal loga spoločností nie emoji"). Je to ZNAČKA
   cudzej appky, nie naša ikonka — preto ich vlastná kresba a farba, nie hand-drawn set. */
.tgo-logo{width:20px;height:20px;flex-shrink:0;object-fit:contain;display:block;}
.tgo-sub{display:block;font-size:12px;font-weight:400;color:${d.inkWarm};margin-top:2px;}

/* ── DVA CTA, DVE RÔZNE VECI (Matej 2026-09-15) ──────────────────────────────────────────
   „v článku by som ale urobil edit na tlačítko - lebo miešame veci… treba urobiť 2 CTA pod
   výletom parkovisko a mapa… mli by mať každé inú farbu."

   Jedno tlačidlo otváralo panel, v ktorom boli naraz DVE nesúvisiace veci: navigácia autom
   na parkovisko a stopa do mobilu. Po teste v teréne (appka Mapy.com náš GPX otvorí a
   nakreslí) prestala byť tá druhá poznámka pod čiarou a stala sa samostatnou akciou.

   Farby:
     · 🅿️ parkovisko = LAPIS — naša akčná farba a zároveň modrá, akou je parkovisko na mape;
     · 🥾 trasa = MAPY #1EAE00 — značková zelená Mapy.com, odpísaná z ich theme-color.

   ⚠️ FIALOVÁ TU STÁLA LEN JEDEN DEŇ. Ráno to bola tripPurple #7A2FBF s odôvodnením
   „fialová znamená VÝLETY v celej appke" a zelenú som ZAMIETOL ako cudziu značku, ktorá
   klame, že súbor patrí len Mapy.com (otvorí ho aj Locus, Garmin, Organic Maps).
   Matej 15. 9. poobede: „fialové tlačítko nahraď zelenou farbou (farba mapy cz)" —
   rozhodujúce je, že človek v teréne hľadá tlačidlo vo farbe appky, do ktorej ide; že
   súbor berú aj iné appky, hovorí návod v paneli slovami. Fialová ostáva na mape.

   ⚠️ ODCHÝLKA OD LOCKU, VEDOMÁ: brand manuál rezervuje plnú farebnú plochu pre JEDINÉ hlavné
   CTA na obrazovke. Tu stoja dve — Matej to tak chcel a dôvod je vecný (dva ciele, nie dva
   dôrazy). Tretia akcia v článku (PRIDAŤ HODNOTENIE) nesie BRANDOVÚ ZLATÚ, teda tretiu
   farbu a najtichšiu z troch. → .tcm-btn-brandgold v TripComments.tsx
   ⚠️ V CSS komentári nesmie byť spätný apostrof — ukončí template literál (check:css). */
.tgo-ctas{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;}
@media(max-width:439px){.tgo-ctas{grid-template-columns:1fr;}}
/* Geometria z locknutého .btn-gold — radius 8, nie pilulka. Farbu nesie modifikátor. */
.tgo-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;
  border-radius:8px;font-family:${U};font-weight:700;font-size:12px;letter-spacing:0.02em;
  text-transform:uppercase;cursor:pointer;text-align:center;}
.tgo-cta .tgo-ic{font-size:16px;}
/* 🅿️ VYRAZIŤ = OBRYS, nie plný lapis (Matej 26. 10. 2026, hárok nakres-cta 1A: „1 obrazovka = 1 lapisové
   tlačidlo"). Jediné plné lapis na článku je PREŠLI SME hore; vyraziť je cesta k miestu, nie hlavná akcia. */
.tgo-cta--park{background:transparent;color:${z.edge};border:1px solid ${z.edge};}
.tgo-cta--park:hover{background:${z.fill};}
/* Zelená nesie ten istý odliatok ako lapis, aby tlačidlá čítali ako dvojica. */
.tgo-cta--trail{background:${oe.grad};color:${oe.ink};border:1px solid ${oe.edge};box-shadow:${da};}
.tgo-cta--trail:hover{background:${oe.gradHover};}
a.tgo-cta{text-decoration:none;}
/* APPKA: PAPYRUS 3D (Matej 9. 11. 2026, hárok C2): Vyraziť = lapis, Trasa v Mapy.com = papier, obe TLAČIDLO 3D. Len pod html.papyrus3d. */
html.papyrus3d .tgo-panel{background:var(--p3d-card);border:0;border-top:6px solid var(--p3d-gold);box-shadow:0 -4px 0 var(--p3d-ink);}
html.papyrus3d .tgo-where{display:flex;align-items:center;gap:8px;}
html.papyrus3d .tgo-title{font-family:'LT Museum',serif;font-weight:900;font-size:20px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: nadpis */
html.papyrus3d .tgo-ctas{gap:16px;margin-bottom:8px;}
html.papyrus3d .tgo-cta.pk-b3,html.papyrus3d .tgo-split-caret.pk-b3{height:56px;padding:0 16px;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);font:400 20px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;box-shadow:var(--p3d-b3);} /* písmo: cta */
html.papyrus3d .tgo-cta.pk-b3:hover{background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .tgo-split-main.pk-b3{border-radius:16px 0 0 16px;border-right:0;}
html.papyrus3d .tgo-split-caret.pk-b3{width:56px;padding:0;border-radius:0 16px 16px 0;}
html.papyrus3d .tgo-item{border:2px solid var(--p3d-ink);border-radius:16px;background:var(--p3d-paper-hi);color:var(--p3d-ink);font-size:14px;box-shadow:var(--p3d-lift);}
/* DELENÉ TLAČIDLO: jeden zelený odliatok, rez tenkou tmavou čiarou. Tvar a výška z .tgo-cta,
   šípka dostane vlastný kraj s rovnakým rádiusom. Menu je PACK_BOX.panel (plávajúci panel). */
.tgo-split{position:relative;display:flex;}
.tgo-split-main{flex:1;min-width:0;border-top-right-radius:0;border-bottom-right-radius:0;border-right:0;}
.tgo-split-caret{display:flex;align-items:center;justify-content:center;width:48px;flex-shrink:0;padding:0;cursor:pointer;
  border-radius:0 8px 8px 0;border-left:1px solid ${oe.edge};}
.tgo-caret{width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform .15s;}
.tgo-split-caret[aria-expanded="true"] .tgo-caret{transform:translateY(2px) rotate(-135deg);}
.tgo-menu{position:absolute;right:0;top:calc(100% + 8px);z-index:30;width:min(320px,100%);display:grid;gap:8px;padding:8px;
  background:${R.panel.background};border:${R.panel.border};box-shadow:${R.panel.boxShadow};border-radius:12px;}
`,ye=[{id:"google",logo:"/nav-apps/google.svg"},{id:"waze",logo:"/nav-apps/waze.svg"},{id:"mapy",logo:"/nav-apps/mapy.svg"}];function Y({emoji:a,sys:n}){return n==="parking"?e.jsx("img",{className:"tgo-logo",src:"/map-marks/parking.webp",alt:"","aria-hidden":"true"}):e.jsx(Xe,{name:n,size:24})}function Wo({trail:a,onClose:n}){const t=Z(),r=Ea(a);if(m.useEffect(()=>{const s=i=>{i.key==="Escape"&&n()};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[n]),!r)return null;const l=Pa()?[ye[0],{id:"apple",logo:"/nav-apps/apple.svg"},...ye.slice(1)]:ye;return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:aa}),e.jsx("div",{className:"pk-veil pk-veil--modal tgo-veil",onClick:n,role:"presentation",children:e.jsxs("div",{className:"tgo-panel",onClick:s=>s.stopPropagation(),children:[e.jsx("div",{className:"tgo-title",children:t("pack.trip.go.title")}),e.jsxs("div",{className:"tgo-where",children:[r.parking?e.jsxs(e.Fragment,{children:[e.jsx(Y,{emoji:"🅿️",sys:"parking"})," ",t("pack.trip.go.parking")]}):t("pack.trip.go.fromStart"),r.note?` · ${r.note}`:""]}),e.jsx("div",{className:"tgo-eyebrow",children:t("pack.trip.go.byCar")}),e.jsx("div",{className:"tgo-grid",children:l.map(s=>e.jsxs("a",{className:"tgo-item",href:Aa(s.id,r),target:"_blank",rel:"noopener noreferrer",onClick:n,children:[e.jsx("img",{className:"tgo-logo",src:s.logo,alt:"","aria-hidden":"true"}),t(`pack.trip.go.app.${s.id}`)]},s.id))})]})})]})}function Xo({trail:a,onDrive:n}){const t=Z(),r=$a(a),l=a.path.length>1,[s,i]=m.useState(!1),[b,c]=m.useState(!1),v=m.useRef(null);m.useEffect(()=>{if(!s)return;const p=x=>{var u;(u=v.current)!=null&&u.contains(x.target)||i(!1)},k=x=>{x.key==="Escape"&&i(!1)};return window.addEventListener("pointerdown",p),window.addEventListener("keydown",k),()=>{window.removeEventListener("pointerdown",p),window.removeEventListener("keydown",k)}},[s]);const y=async()=>{try{await navigator.clipboard.writeText(r),c(!0),setTimeout(()=>{c(!1),i(!1)},1200)}catch{i(!1)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:aa}),e.jsxs("div",{className:"tgo-ctas",style:l?void 0:{gridTemplateColumns:"1fr"},children:[e.jsxs("button",{type:"button",className:"tgo-cta tgo-cta--park pk-b3 pk-b3--lapis",onClick:n,children:[e.jsx(Y,{emoji:"🅿️",sys:"parking"}),t("pack.trip.go.cta")]}),r?e.jsxs("div",{className:"tgo-split",ref:v,children:[e.jsxs("a",{className:"tgo-cta tgo-cta--trail tgo-split-main pk-b3 pk-b3--paper",href:r,target:"_blank",rel:"noopener noreferrer",children:[e.jsx(Y,{emoji:"🥾",sys:"pin"}),t("pack.trip.go.ctaRoute")]}),e.jsx("button",{type:"button",className:"tgo-cta--trail tgo-split-caret pk-b3 pk-b3--paper","aria-label":t("pack.trip.go.more"),"aria-expanded":s,onClick:()=>i(p=>!p),children:e.jsx("span",{className:"tgo-caret"})}),s&&e.jsxs("div",{className:"tgo-menu",role:"menu",children:[e.jsxs("button",{type:"button",role:"menuitem",className:"tgo-item",onClick:()=>{Le(a),i(!1)},children:[e.jsx(Y,{emoji:"📥",sys:"stiahnut"}),e.jsxs("span",{children:[t("pack.trip.go.gpx"),e.jsx("span",{className:"tgo-sub",children:t("pack.trip.go.gpxSub")})]})]}),e.jsxs("button",{type:"button",role:"menuitem",className:"tgo-item",onClick:y,children:[e.jsx(Y,{emoji:"🔗",sys:"zdielat"}),t(b?"pack.trip.go.copied":"pack.trip.go.copyLink")]})]})]}):l&&e.jsxs("button",{type:"button",className:"tgo-cta tgo-cta--trail pk-b3 pk-b3--paper",onClick:()=>Le(a),children:[e.jsx(Y,{emoji:"🥾",sys:"pin"}),t("pack.trip.go.gpx")]})]})]})}const eo=`
.gjn{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;border-radius:${Se.card}px;
  padding:12px 16px;margin:12px 0;background:${L.surface};border:1px solid ${L.edge};
  box-shadow:${Ze.panel}}
.gjn-face{flex:0 0 auto;width:46px;height:46px;border-radius:50%;background:${L.faceBg};
  box-shadow:${L.faceRing};display:flex;align-items:center;justify-content:center;overflow:hidden}
.gjn-face img{height:82%;width:auto;display:block}
.gjn-txt{min-width:0;flex:1 1 220px;font-family:${f};font-size:12px;line-height:1.55;color:${L.inkDim};margin:0}
.gjn-ai{font-family:${U};font-weight:700;letter-spacing:.02em;color:${L.ink};white-space:nowrap}
.gjn-ai > span{color:${L.aiInk};text-shadow:${L.aiShadow}}
.gjn-cta{flex:0 0 auto;border:0;cursor:pointer;border-radius:${Se.field}px;padding:8px 16px;
  background:${L.ctaGrad};color:${L.ctaInk};box-shadow:${L.ctaShadow};
  font-family:${U};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.gjn-cta:hover{background:${L.ctaGradHover}}
`;function qo({onClaim:a}){const n=Z();return e.jsxs("div",{className:"gjn",role:"note",children:[e.jsx("style",{children:eo}),e.jsx("span",{className:"gjn-face","aria-hidden":!0,children:e.jsx("img",{src:Qe,alt:""})}),e.jsxs("p",{className:"gjn-txt",children:[e.jsxs("span",{className:"gjn-ai",children:[e.jsx("span",{children:"AI"}),"NUBIS"]}),null,n("pack.trip.ghost.body")]}),e.jsx("button",{type:"button",className:"gjn-cta",onClick:a,children:n("pack.trip.ghost.cta")})]})}const Ke="#CE4B3C",ao=`${Ue}
.uwc-overlay{z-index:1250;padding:${ma};}
.uwc-box{width:100%;max-width:400px;padding:24px;text-align:center;
  background:${R.panel.background};border:${R.panel.border};border-radius:${R.panel.borderRadius}px;box-shadow:${R.panel.boxShadow};}
.uwc-title{font-family:${U};font-weight:700;font-size:16px;letter-spacing:0.02em;text-transform:uppercase;color:${d.inkStrong};line-height:1.25;}
.uwc-name{font-family:${f};font-size:12px;color:${d.inkWarm};margin-top:4px;}
.uwc-loss{font-family:${f};font-size:14px;color:${d.inkStrong};line-height:1.5;margin:16px 0 24px;}
.uwc-loss b{color:${Ke};font-weight:600;}
.uwc-keep{width:100%;font-family:${U};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${z.grad};color:${z.ink};border:1px solid ${z.edge};box-shadow:${je};cursor:pointer;}
.uwc-keep:hover{background:${z.gradHover};}
/* APPKA: PAPYRUS 3D. Zachovať = lapis, zrušiť prejdenie (mazanie) = CELÉ ČERVENÉ TLAČIDLO 3D (Matej 9. 11. 2026). */
html.papyrus3d .uwc-box{background:var(--p3d-card);border:0;border-top:6px solid var(--p3d-gold);box-shadow:0 6px 0 var(--p3d-ink),0 14px 18px var(--p3d-sh);}
html.papyrus3d .uwc-title{font-family:'LT Museum',serif;font-weight:900;font-size:20px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: nadpis */
html.papyrus3d .uwc-keep.pk-b3,html.papyrus3d .uwc-drop.pk-b3{width:100%;height:56px;padding:0 16px;margin-top:0;border:2.5px solid var(--b3-l);border-radius:var(--b3-r);background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:var(--b3-i);font:400 20px/1 'LT Museum',serif;letter-spacing:0;text-transform:none;text-decoration:none;box-shadow:var(--p3d-b3);} /* písmo: cta */
html.papyrus3d .uwc-drop.pk-b3{margin-top:16px;}
.uwc-drop{margin-top:12px;background:none;border:0;padding:8px;font-family:${f};font-weight:500;font-size:12px;letter-spacing:0.02em;color:${Ke};text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
`;function Qo({name:a,points:n,km:t,onConfirm:r,onClose:l}){const s=Z(),{lang:i}=He(),b=m.useRef(null);m.useEffect(()=>{var x;(x=b.current)==null||x.focus();const k=u=>{u.key==="Escape"&&l()};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[l]);const c=Number(t),v=Number.isFinite(c)&&c>0,p=s(v?"pack.map.unwalk.lossKm":"pack.map.unwalk.loss").replace("{points}",String(n)).replace("{km}",v?c.toLocaleString(i,{minimumFractionDigits:1,maximumFractionDigits:1}):"").split("**");return ca.createPortal(e.jsx("div",{className:"pk-veil pk-veil--modal uwc-overlay",onClick:k=>{k.stopPropagation(),l()},children:e.jsxs("div",{className:"uwc-box",role:"alertdialog","aria-modal":"true",onClick:k=>k.stopPropagation(),children:[e.jsx("style",{children:ao}),e.jsx("div",{className:"uwc-title",children:s("pack.map.unwalk.title")}),e.jsx("div",{className:"uwc-name",children:a}),e.jsx("p",{className:"uwc-loss",children:p.map((k,x)=>x%2?e.jsx("b",{children:k},x):k)}),e.jsx("button",{ref:b,type:"button",className:"uwc-keep pk-b3 pk-b3--lapis",onClick:l,children:s("pack.map.unwalk.keep")}),e.jsx("button",{type:"button",className:"uwc-drop pk-b3 pk-b3--red",onClick:()=>{r(),l()},children:s("pack.map.unwalk.confirm")})]})}),document.body)}function en(a,n,t){const r=Ce(n),l=Ce([a,...n]),s=b=>{const c=v=>{var y;return((y=v.categories.find(p=>p.key===b))==null?void 0:y.done.length)??0};return c(l)>c(r)},i=new Set(n.map(b=>b.country).filter(Boolean));return Ca({kind:Ta(a)?"trail":"place",km:Number(a.km)||0,ascentM:a.ascentM??0,journeyId:a.id,walked:!0,newRange:s("ranges"),newNp:s("parks"),newChko:s("chko"),newWater:s("waters"),newCountry:!!a.country&&!i.has(a.country),rated:t})}const oo=12,no=170,to=110,ro=13;function io(a){const n=(a??"").length;return n>320?" mn-popup--l":n>120?" mn-popup--m":""}function oa(a,n="",t=!1,r=null,l){if(a==="parking"&&Re(l==null?void 0:l.paid,!1))return Re(l==null?void 0:l.paid,!!(l!=null&&l.overnight),n,t?void 0:Ve);const s=ze(a,r);return s?Ia(s,n,t?void 0:Ve):t?`<div class="mn-mark mn-mark--emoji${n}"><i>${pe[a]??""}</i></div>`:H(a)==="warning"?Oe(qe(a),W(a,r),n):H(a)==="comment"?Oe(pe[a]??"",B.comment,n):`<div class="mn-mark mn-mark--emoji${n}"><i>${pe[a]??""}</i></div>`}function Fe(a,n){return te.divIcon({className:"mn-wrap",html:oa(a.kind,n?" mn-mark--stale":"",ce(a),a.disease,{paid:a.paid,overnight:a.overnight})})}function so(a){return te.divIcon({className:"mn-wrap",html:`<div class="mn-dot${a.isStale?" mn-mark--stale":""}" style="background:${W(a.kind,a.disease)}"></div>`})}function lo(a,n){const t=Ya(a),r=t<36?12:t<48?13:15;return te.divIcon({className:"mn-wrap",html:`<div class="mn-mark mn-cluster" style="box-sizing:border-box;width:${t}px;height:${t}px;border-radius:999px;background:#FFFFFF;border:2.5px solid ${n};box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);font-family:${f};font-weight:600;font-size:${r}px;color:${n};">${a}</div>`})}function po(a,n){if(!a)return"";const t=new Date(a);return Number.isNaN(t.getTime())?"":t.toLocaleDateString(n,{day:"numeric",month:"short",year:"numeric"})}const co=/(https?:\/\/[^\s]+)/g;function mo(a){return a.split(co).map((n,t)=>{if(t%2===0)return n;let r=n;try{r=new URL(n).hostname.replace(/^www\./,"")}catch{}return e.jsx("a",{className:"mn-bubble-link",href:n,target:"_blank",rel:"noopener noreferrer",children:r},t)})}function an({notes:a,onVote:n,onDelete:t,locale:r="en-US",showThreats:l=!0,interactive:s=!0,popupPad:i,centerPopup:b=!1}){const c=Z(),v=Je(),y=(()=>{const o=c("pack.sos.danger.case.open");return o==="pack.sos.danger.case.open"?"Open":o})(),p=ja(),[k,x]=m.useState(()=>p.getZoom()),[u,S]=m.useState(0),A=m.useCallback(()=>x(p.getZoom()),[p]);ie("zoomend",A);const j=m.useRef(!1),$=m.useCallback(()=>{j.current||S(o=>o+1)},[]),P=m.useCallback(o=>{j.current=!0,b&&requestAnimationFrame(()=>{const O=o.popup.getElement(),M=O?O.offsetHeight:0,D=p.latLngToContainerPoint(o.popup.getLatLng()).subtract(te.point(0,M/2+12));p.panBy(D.subtract(p.getSize().divideBy(2)),{animate:!0})})},[b,p]),h=m.useCallback(()=>{j.current=!1,S(o=>o+1)},[]);ie("moveend",$),ie("popupopen",P),ie("popupclose",h);const N=m.useMemo(()=>a.filter(o=>o.radiusM!=null),[a]),V=m.useMemo(()=>l?a.filter(o=>H(o.kind)==="warning"):[],[a,l]),K=m.useMemo(()=>a.filter(o=>H(o.kind)==="comment"&&!ce(o)),[a]),_=m.useMemo(()=>a.filter(o=>H(o.kind)==="parking"||H(o.kind)==="comment"&&ce(o)),[a]),T=m.useCallback(o=>{const O=p.getBounds().pad(.35),M=o.filter(E=>O.contains([E.lat,E.lon])).map(E=>{const D=p.latLngToContainerPoint([E.lat,E.lon]);return{n:E,x:D.x,y:D.y}});return Ja(M,Ga(k)).map(E=>{if(E.items.length===1)return{kind:"single",n:E.items[0].n};const D=p.containerPointToLatLng([E.x,E.y]);return{kind:"cluster",lat:D.lat,lon:D.lng,count:E.items.length,sample:E.items[0].n}})},[p,k,u]),C=m.useMemo(()=>T(V),[V,T]),J=m.useMemo(()=>T(K),[K,T]),X=k>=oo,re=k>=ro,q=o=>{const O=ce(o),M=!!n&&!O&&!o.isMine&&!se(o.kind),E=!!t&&!O&&o.isMine;return s?e.jsx(ne,{position:[o.lat,o.lon],icon:Fe(o,o.isStale),children:e.jsx(wa,{className:`mn-popup${io(se(o.kind)?null:o.body)}`,closeButton:!1,autoPan:!b,autoPanPaddingTopLeft:[24,(i==null?void 0:i[0])??no],autoPanPaddingBottomRight:[24,(i==null?void 0:i[1])??to],keepInView:!0,children:e.jsxs("div",{className:"mn-bubble",children:[e.jsxs("div",{className:"mn-bubble-head",children:[ze(o.kind,o.disease,o.paid)?e.jsx("img",{className:"mn-bubble-sticker",src:ze(o.kind,o.disease,o.paid),alt:"","aria-hidden":"true",draggable:!1}):e.jsx("span",{className:"mn-bubble-mark",style:{borderColor:W(o.kind,o.disease)},"aria-hidden":"true",children:e.jsx("i",{className:"mn-bubble-em",children:pe[o.kind]??""})}),e.jsx("span",{className:"mn-bubble-kind",style:{color:W(o.kind,o.disease)},children:c(`pack.mapNotes.kind.${o.kind}`)}),o.kind==="parking"&&o.paid!=null&&e.jsx("span",{className:"mn-bubble-tag",children:c(o.paid?"pack.mapNotes.parking.paid":"pack.mapNotes.parking.free")}),o.kind==="parking"&&o.overnight&&e.jsx("span",{className:"mn-bubble-tag",children:c("pack.mapNotes.parking.overnight")}),o.isStale&&e.jsx("span",{className:"mn-bubble-stale",children:c("pack.mapNotes.unconfirmed")})]}),!!o.body&&!se(o.kind)&&e.jsx(Za,{kind:"note",id:o.id,text:o.body,mine:o.isMine||O,children:(D,he)=>e.jsxs("p",{className:"mn-bubble-body",children:[mo(D),he]})}),se(o.kind)&&ua&&e.jsx("button",{type:"button",className:"mn-bubble-open",onClick:()=>v(`/pack/sos/nebezpecenstvo/p/${o.id}`),children:y}),(o.kind==="parking"||o.kind==="unique")&&!O&&!o.profileOff&&e.jsx("button",{type:"button",className:"mn-bubble-open",onClick:()=>v(`/pack/miesto/${o.id}`),children:c("pack.placeProfile.open")}),!O&&e.jsxs("div",{className:"mn-bubble-meta",children:[o.authorPhoto?e.jsx("img",{className:"mn-bubble-face",src:Ha(o.authorPhoto,96),alt:"",loading:"lazy"}):e.jsx("span",{className:"mn-bubble-face mn-bubble-face--empty","aria-hidden":"true",children:(o.authorFirst||"?").slice(0,1).toUpperCase()}),e.jsxs("span",{className:"mn-bubble-who",children:[o.authorFirst&&e.jsx("b",{className:"mn-bubble-author",children:o.authorFirst}),o.actedName&&e.jsx(Ba,{id:null,name:o.actedName}),e.jsx("span",{className:"mn-bubble-date",children:po(o.createdAt,r)})]})]}),M&&e.jsxs("div",{className:"mn-bubble-votes",children:[e.jsxs("button",{type:"button",className:`mn-vote${o.myVote===!0?" on":""}`,onClick:()=>n==null?void 0:n(o.id,o.myVote===!0?null:!0),children:[c("pack.mapNotes.vote.valid"),o.validVotes>0&&e.jsx("b",{children:o.validVotes})]}),e.jsxs("button",{type:"button",className:`mn-vote mn-vote--no${o.myVote===!1?" on":""}`,onClick:()=>n==null?void 0:n(o.id,o.myVote===!1?null:!1),children:[c("pack.mapNotes.vote.stale"),o.staleVotes>0&&e.jsx("b",{children:o.staleVotes})]})]}),E&&e.jsx("button",{type:"button",className:"mn-bubble-del",onClick:()=>t==null?void 0:t(o.id),children:c("pack.mapNotes.delete")})]})})},o.id):e.jsx(ne,{position:[o.lat,o.lon],icon:Fe(o,o.isStale),interactive:!1},`ro:${o.id}`)},Q=o=>re?q(o):e.jsx(ne,{position:[o.lat,o.lon],icon:so(o),interactive:!1},`dot:${o.id}`),ee=(o,O)=>e.jsx(ne,{position:[o.lat,o.lon],icon:lo(o.count,O),interactive:!1},`cl:${o.lat.toFixed(4)}:${o.lon.toFixed(4)}:${o.count}`);return e.jsxs(e.Fragment,{children:[X&&N.filter(o=>H(o.kind)==="warning"?l:!0).map(o=>e.jsx(ea,{center:[o.lat,o.lon],radius:o.radiusM,pathOptions:{color:W(o.kind,o.disease),weight:1.5,opacity:o.isStale?.25:.55,fillColor:W(o.kind,o.disease),fillOpacity:o.isStale?.05:.12},interactive:!1},`area:${o.id}`)),C.map(o=>o.kind==="cluster"?ee(o,I):Q(o.n)),J.map(o=>o.kind==="cluster"?ee(o,B.comment):Q(o.n)),X&&_.map(q)]})}const on=`${Ua}
.mn-wrap{background:none;border:0;}
.mn-mark{position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease;}
.mn-mark:hover{transform:translate(-50%,-50%) scale(1.12);}
/* HOLÉ EMOJI — bez podložky. Tieň nahrádza kolieskо: na svetlej mape (les, sneh)
   by emoji bez obrysu splynulo, a podložka je presne to, čo Matej zamietol.
   Rovnaký recept nesie PoiLayer, takže obe vrstvy hovoria jedným jazykom. */
.mn-mark--emoji{width:26px;height:26px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(0,0,0,0.5));}
.mn-mark--emoji i{font-size:20px;}
/* ── EMOJI VNÚTRI ZNAČKY ───────────────────────────────────────────────────
   <i> je len nosič, nie kurzíva — font-style:normal to vracia späť. Emoji
   MUSÍ mať vlastný font stack: zdedený Cinzel by na Windows sadol na čiernobiely
   textový variant a z 🦌 by ostal obdĺžnik. */
.mn-mark i{font-style:normal;font-family:${ue};line-height:1;-webkit-user-select:none;user-select:none;}

/* ── UPOZORNENIE = EMOJI V BIELOM KRUHU S ČERVENÝM LEMOM ──────────────────
   Jediná podložka, ktorá na mape ostala (Matej 2026-08-22). Nie je to ozdoba:
   biele pole drží emoji čitateľné nad lesom aj snehom lepšie než drop-shadow,
   ktorý nesú holé značky, a červený lem povie „výstraha" skôr, než oko stihne
   prečítať, čo je vnútri.

   Kruh je súmerný ⇒ stred sedí na súradnici bez dopočtu posunu. Práve preto
   zanikla trieda mn-mark--pair aj rovnica 23+1+16 pod ňou.

   TIP nesie ten istý kruh so zeleným lemom a UDALOSŤ s modrým (PackMap.tsx).
   Rozmery sa NEROZCHÁDZAJÚ zámerne: dve veľkosti kruhu by na mape čítali ako dve
   dôležitosti, a tip nie je menej dôležitý než výstraha, len je iný. Preto ho
   všetci traja berú z jedného zdroja: mapnotes/circleMark.ts (spätný apostrof sa
   sem PISAT NESMIE, je to JS literal). */
${ya}
/* Zošednutý zápis NEMIZNE — Matej: „poznámka neumiera". Len prestáva byť to prvé,
   čo oko na mape chytí. */
.mn-mark--stale{opacity:.42;filter:grayscale(1);}
/* ── BODKA — OSAMOTENÝ ZÁPIS PRI ODDIALENÍ ────────────────────────────────
   Matej 2026-08-22: „tipy, samostané upozronenia sa môžu zobraziť ale len ako
   bodky a až pri veľkom zoome sa zobrazí aj emoji."

   Biely prstenec, nie holý bod: nad lesom aj snehom je farebná bodka bez obrysu
   presne tak neviditeľná ako bolo holé emoji, kvôli čomu vznikol biely kruh pri
   hrozbách. Je to teda TÁ ISTÁ značka zmenšená na doraz, nie iný jazyk.
   Farbu nesie inline background z noteTint — jediny zdroj pre znacku, kruh
   polomeru aj bodku (spatny apostrof sa sem PISAT NESMIE, je to JS literal). */
.mn-dot{position:relative;transform:translate(-50%,-50%);width:11px;height:11px;border-radius:999px;border:2px solid #FFFFFF;box-sizing:border-box;box-shadow:0 1px 2px rgba(0,0,0,0.55);}
.mn-mark--stale:hover{opacity:.8;}

/* ── OTVORENÁ POZNÁMKA JE PAPYRUS (Matej 2026-08-21) ───────────────────────
   „treba zmeniť otvorenú poznámku, dajme ju na bledý papyrus".

   Do tejto chvíle to bol tmavý sklenený panel — a nad SVETLOU mapou to bola
   jediná tmavá plocha v celom výreze, teda cudzí prvok. Papyrus je naopak presne
   to, čím /pack hovorí „toto je obsah, čítaj to".

   Geometria ide z MATRICE (PACK_BOX.panel): panelGrad · 1.5px cardEdge · radius
   · panelShadow. Hodnoty sa sem NEOPISUJÚ ručne — sú vlievané
   z packTheme.ts nižšie interpoláciou.

   ⚠️ Leaflet si nesie vlastný biely chrome (-content-wrapper, -tip). Papyrus
   sa naň nedá len „položiť": tip je otočený štvorec, ktorý dedí background,
   takže bez explicitného prebitia by pod bublinou visel biely zub. */
.mn-popup .leaflet-popup-content-wrapper{background:${d.panelGrad};border:1.5px solid ${d.cardEdge};border-radius:${R.panel.borderRadius}px;box-shadow:${d.panelShadow};padding:0;}
.mn-popup .leaflet-popup-content{margin:0;padding:12px 16px;width:auto!important;min-width:190px;max-width:260px;}
.mn-popup--m .leaflet-popup-content{min-width:min(300px,calc(100vw - 64px));max-width:min(340px,calc(100vw - 64px));padding:16px;}
.mn-popup--l .leaflet-popup-content{min-width:min(400px,calc(100vw - 64px));max-width:min(440px,calc(100vw - 64px));padding:16px 24px;}
.mn-popup--m .mn-bubble-body,.mn-popup--l .mn-bubble-body{font-size:14px;line-height:1.55;}
/* Zub dedí len plnú farbu — gradient by v ňom vyzeral ako iný odtieň než telo.
   T.card je PLNÁ papyrusová farba (nie gradient), presne na toto. */
.mn-popup .leaflet-popup-tip{background:${d.card};border:1.5px solid ${d.cardEdge};box-shadow:none;}
.mn-popup a.leaflet-popup-close-button{display:none;}

.mn-bubble-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px;}
/* ── ZNAČKA V BUBLINE = ZMENŠENINA TEJ NA MAPE ────────────────────────────
   Ten istý biely krúžok, ten istý lem, len 26 px namiesto 28. Farbu lemu píše
   komponent inline z noteTint(), preto tu border-color nie je — bola by to druhá
   pravda vedľa tej z JS. */
.mn-bubble-mark{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:#FFFFFF;border:2px solid ${d.border};box-sizing:border-box;}
.mn-bubble-em{font-style:normal;font-family:${ue};font-size:16px;line-height:1;-webkit-user-select:none;user-select:none;}
.mn-bubble-sticker{display:block;flex:none;width:28px;height:28px;}
.mn-bubble-kind{font-family:${f};font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;}
.mn-bubble-tag{font-family:${f};font-weight:500;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:${d.inkWarm};border:1px solid ${d.border};border-radius:999px;padding:4px 8px;}
.mn-bubble-stale{font-family:${f};font-weight:500;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:${d.inkWarm};}
.mn-bubble-body{margin:0;font-family:${f};font-size:12px;line-height:1.5;color:${d.inkStrong};white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;}
.mn-bubble-link{color:${d.inkStrong};text-decoration:underline;}

/* ── AUTOR: FOTKA + MENO ───────────────────────────────────────────────────
   align-items:center, nie baseline — s fotkou v riadku by baseline zarovnal
   text podľa spodnej hrany obrázka a meno by vyskočilo nad kruh. */
/* ⚠️ T.rule je GRADIENT (zlatá vyblednutá do strán), NIE border-shorthand —
   ako border-top by to bolo neplatné CSS a ticho by nenakreslilo nič.
   Preto pseudo-prvok s background. */
.mn-bubble-meta{position:relative;display:flex;align-items:center;gap:8px;margin-top:9px;padding-top:8px;}
.mn-bubble-meta::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:${d.rule};}
.mn-bubble-face{flex:0 0 auto;width:26px;height:26px;border-radius:50%;object-fit:cover;background:${d.tileBg};border:1px solid ${d.cardEdge};}
.mn-bubble-face--empty{display:flex;align-items:center;justify-content:center;font-family:${f};font-weight:600;font-size:12px;color:${d.inkWarm};}
.mn-bubble-who{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;min-width:0;font-family:${f};font-size:10px;color:${d.inkWarm};}
.mn-bubble-author{font-family:${U};font-weight:700;font-size:12px;color:${d.inkStrong};}

.mn-bubble-votes{display:flex;gap:6px;margin-top:9px;}
.mn-vote{flex:1 1 0;display:inline-flex;align-items:center;justify-content:center;gap:5px;font-family:${f};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${d.inkWarm};background:transparent;border:1px solid ${d.border};border-radius:999px;padding:4px 8px;cursor:pointer;transition:color .15s,border-color .15s,background .15s;}
.mn-vote:hover{color:${d.inkStrong};border-color:${d.cardEdge};}
.mn-vote.on{color:#7a5410;border-color:${d.cardEdge};background:rgba(201,154,63,0.20);}
.mn-vote--no.on{color:${I};border-color:${I};background:rgba(206,75,60,0.14);}
.mn-vote b{font-weight:600;}
.mn-bubble-del{margin-top:8px;width:100%;font-family:${f};font-weight:500;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${d.inkWarm};background:transparent;border:0;padding:4px;cursor:pointer;}
.mn-bubble-del:hover{color:${I};}
.mk-park{position:relative;}
.mk-park .mk-park-p{position:absolute;inset:0;width:100%;height:100%;display:block;}
.mk-park .mk-park-van{position:absolute;right:-22%;bottom:-18%;width:68%;height:68%;display:block;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.45));}
.mn-bubble-open{margin-top:8px;width:100%;font-family:${f};font-weight:600;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${z.ink};background:${z.grad};border:1px solid ${z.edge};border-radius:8px;padding:8px 12px;cursor:pointer;}
`;function uo({kinds:a,selected:n,tint:t,onPick:r,row:l}){const s=Z(),i=m.useRef(null),[b,c]=m.useState({l:!1,r:!1});m.useEffect(()=>{const p=i.current;if(!scroll||!p)return;const k=()=>c({l:p.scrollLeft>4,r:p.scrollLeft+p.clientWidth<p.scrollWidth-4});return k(),p.addEventListener("scroll",k,{passive:!0}),window.addEventListener("resize",k),()=>{p.removeEventListener("scroll",k),window.removeEventListener("resize",k)}},[scroll,a.length]);const v=p=>{const k=i.current;k&&k.scrollBy({left:p*k.clientWidth*.7,behavior:"smooth"})},y=e.jsxs("div",{ref:scroll?i:void 0,className:scroll?"mnk-grid mnk-grid--row mnk-grid--rail":l?"mnk-grid mnk-grid--row":"mnk-grid",children:[e.jsx("style",{children:bo}),a.map(p=>e.jsxs("button",{type:"button",className:`mnk-tile${n===p?" on":""}`,onClick:()=>r(p),"aria-pressed":n===p,style:n===p?{background:ba(t,.24),borderColor:t}:void 0,children:[_e(`note_${p}`)?e.jsx("img",{className:"kg-sticker",src:_e(`note_${p}`),alt:"",draggable:!1}):e.jsx("i",{children:qe(p)}),e.jsx("em",{children:s(`pack.mapNotes.kind.${p}`)})]},p))]});return scroll?e.jsxs("div",{className:"mnk-railwrap",children:[y,b.l&&e.jsx("button",{type:"button",className:"mnk-arw mnk-arw--l",onClick:()=>v(-1),"aria-label":s("pack.addTrip.step.scrollLeft"),children:e.jsx(Ie,{size:14})}),b.r&&e.jsx("button",{type:"button",className:"mnk-arw mnk-arw--r",onClick:()=>v(1),"aria-label":s("pack.addTrip.step.scrollRight"),children:e.jsx(Ie,{size:14})})]}):y}const bo=`
.mnk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px;}
/* ── RAD SA ZALAMUJE, NESKROLUJE (Matej 2026-08-28) ────────────────────────────────────
   „Vadí mi, že tie chipy — kliešte… sú vedľa seba a je to moc dlhé v jednom riadku,
    daj to do dvoch — 4 a 4."

   ⚠️ RUŠÍ TO VODOROVNÝ SCROLL z 24. 8. Jeho dôvod (deväť vysokých dlaždíc vytláčalo návrat
   pod okraj) medzitým zanikol: dlaždice v rade sú nízke a z panela odišla otázka aj tlačidlo
   OZNAČ. Ostala z neho len tá polovica, ktorú Matej zamietol už 23. 8. — „možnosti musia byť
   ihneď viditeľné, nie schované".
   ⚠️ Chip je preto o vlások menší (10 px písmo, tesnejšia výplň): pri pôvodnej veľkosti
   deväť hrozieb v 408 px stĺpci sadá na TRI riadky, pri tejto na dva. Nie je to estetika —
   je to jediné číslo, ktorým sa dá „4 a 4" dodržať bez skracovania názvov.
   🚩 Deviata hrozba sa do dvoch riadkov po štyroch nezmestí presne; padne na tretí riadok
   na úzkom stĺpci (1024–1400 px, 360 px panel). */
.mnk-grid--row{display:flex;flex-wrap:wrap;grid-template-columns:none;gap:5px;}
/* ⚠️ V RADE SÚ DLAŽDICE NÍZKE (Matej 24. 8. 2026: „tie možnosti sú zbytočne na výšku vysoké
   a zaberajú cenný priestor v dolnom paneli, kde sa to nezmestí"). V mriežke bolo emoji NAD
   názvom, lebo stĺpec je úzky; v rade sa smie ísť VEDĽA SEBA a dlaždica tým klesne z ~58 px
   na ~34 px. Ušetrené dva riadky sú presne to, čo v paneli chýbalo. */
/* Jeden riadok na scroll (15. 10. 2026) — pás bez posuvníka, šípky ležia nad okrajmi. */
.mnk-railwrap{position:relative;}
.mnk-grid--rail{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;padding:0 4px;}
.mnk-grid--rail::-webkit-scrollbar{display:none;}
.mnk-grid--rail .mnk-tile{scroll-snap-align:start;}
.mnk-arw{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;background:${d.card};border:1px solid ${d.border};color:${d.inkStrong};box-shadow:${Ze.card};z-index:2;}
.mnk-arw--l{left:-4px;}
.mnk-arw--r{right:-4px;}
.mnk-arw--r svg{transform:scaleX(-1);}
.mnk-grid--row .mnk-tile{flex:0 0 auto;flex-direction:row;gap:5px;padding:8px 8px;border-radius:999px;white-space:nowrap;}
.mnk-grid--row .mnk-tile i{font-size:14px;}
.mnk-grid--row .mnk-tile em{font-size:10px;}
.mnk-tile{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:5px;box-sizing:border-box;padding:8px 4px;border-radius:8px;background:rgba(245,240,228,0.06);border:1.5px solid ${d.onDarkBorder};cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease;}
.mnk-tile:hover{transform:translateY(-1px);border-color:${d.onDarkDim};}
/* Ten istý dôvod ako pri chipoch skupiny v AddTripLog: outline mimo hranice by sa orezal
   o skrolovací stĺpec. Dovnútra ho vidno rovnako. */
.mnk-tile:focus-visible{outline:2px solid ${d.onDark};outline-offset:-2px;}
.mnk-tile i{font-style:normal;font-family:${ue};font-size:20px;line-height:1;}
.mnk-tile .kg-sticker{width:32px;height:32px;display:block;}
.mnk-grid--row .mnk-tile .kg-sticker{width:24px;height:24px;}
/* Space Grotesk je načítaný len 300–600 ⇒ strop 600, inak fake bold (CLAUDE.md). */
.mnk-tile em{font-style:normal;font-family:${f};font-size:10px;font-weight:500;line-height:1.2;text-align:center;color:${d.onDarkDim};}
.mnk-tile.on em{color:#FFFFFF;}
.mnk-tile.on{box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:translateY(-1px);}
${`
/* ── BLEDÝ SKIN PC (2026-08-26) ─────────────────────────────────────────────────────────
   Mriežka žije v paneli značky, ktorý je na PC papyrusový. V onDark tokenoch tam bola
   NEČITATEĽNÁ: výplň rgba(245,240,228,0.06) na piesku prakticky nič a názov svetlý inkoust —
   z dlaždice ostalo len emoji.
   ⚠️ Media query zanikla 28. 8. 2026 — panel značky je bledý na každej šírke, farby sú na
   oboch tie isté a druhá sada pre mobil by sa rozišla pri prvej úprave.
   ⚠️ Vybraná dlaždica (.on) si výplň nesie zvonku (farba skupiny, inline štýl), preto sa tu
   mení len jej inkoust — a nie na biely, ale na najtmavší: zvolené farby sú svetlé tinty. */
  .mnk-tile{background:${w.field};border-color:${w.border};}
  .mnk-tile:hover{border-color:${w.deep};}
  .mnk-tile em{color:${w.dim};}
  .mnk-tile.on em{color:${w.ink};}
  .mnk-tile.on{box-shadow:0 2px 8px rgba(110,74,20,0.35);}
`}
`,ko=22;function ho({text:a,onAbort:n,abortLabel:t,abortBack:r,below:l,edgeLeft:s,onFace:i,faceLabel:b,pulse:c}){const v=Z(),y=i??(()=>Va()),p=b??v("pack.addTrip.grade.askAinubis"),[k,x]=m.useState(""),[u,S]=m.useState(!1),A=m.useRef(void 0),j=m.useRef(null);return m.useEffect(()=>{const $=j.current;if(!$||!ka)return;const P=document.documentElement,h=()=>{if(getComputedStyle($).position!=="fixed"){P.style.removeProperty("--ang-wrap-b");return}P.style.setProperty("--ang-wrap-b",`${$.getBoundingClientRect().bottom}px`)};h();const N=new ResizeObserver(h);return N.observe($),window.addEventListener("resize",h),()=>{N.disconnect(),window.removeEventListener("resize",h),P.style.removeProperty("--ang-wrap-b")}},[]),m.useEffect(()=>{var h;if(window.clearInterval(A.current),!a){x(""),S(!1);return}if(typeof window<"u"&&((h=window.matchMedia)==null?void 0:h.call(window,"(prefers-reduced-motion: reduce)").matches)){x(a),S(!1);return}x(""),S(!0);let P=0;return A.current=window.setInterval(()=>{P+=1,x(a.slice(0,P)),P>=a.length&&(window.clearInterval(A.current),S(!1))},ko),()=>window.clearInterval(A.current)},[a]),e.jsxs("div",{ref:j,className:`ang-wrap${s?" ang-wrap--edge":""}`,children:[e.jsx("style",{children:xo}),e.jsxs("div",{className:"ang-bar",children:[e.jsx("button",{type:"button",className:`ang-face-btn${c?" ang-face-btn--pulse":""}`,onClick:y,"aria-label":p,title:p,children:e.jsx("img",{className:"ang-face",src:Qe,alt:"","aria-hidden":"true"})}),e.jsxs("p",{className:"ang-text","aria-live":"polite",children:[n&&e.jsx("button",{type:"button",className:"ang-x",onClick:n,"aria-label":t,title:t,children:r?e.jsx(Ra,{dir:"left",size:22,style:{color:"#E6FAFF"}}):e.jsx(Xe,{name:"krizik",size:24})}),e.jsx("span",{"aria-hidden":"true",children:k}),u&&e.jsx("i",{className:"ang-caret","aria-hidden":"true"}),e.jsx("span",{className:"ang-sr",children:a})]})]}),l&&e.jsx("div",{className:"ang-below",children:l})]})}const xo=`
/* Chat otvorený z tváre musí ležať NAD sprievodcom (15. 10. 2026). Panel má z 61, bublina
   1202 a dok zápisu nad ním — na telefóne prekryli tlačidlo zavrieť aj pole na písanie. */
body:has(.ang-wrap) .ainubis-panel{z-index:1300 !important;}
/* Pás je nad mapou a MUSÍ prepúšťať ťuky mimo seba — inak vznikne hore pruh, kde sa nedá
   kresliť (tá istá príčina, akú mal pôvodný .trp-dtop). */
/* ⚠️ NELEPIŤ NA HORNÚ HRANU (Matej 24. 8. 2026: „pri prvom kroku je ainubis moc pri hornom
   okraji"). Nad ním je stavový riadok telefónu (hodiny, batéria) a bez odstupu z toho bol
   jeden zlepený pruh. env(safe-area-inset-top) rieši NOTCH, nie odstup — to je ďalších
   28 px navyše, aby bublina vyzerala, že visí NAD mapou, nie že je prilepená k systému. */
.ang-wrap{position:fixed;left:0;right:0;top:0;z-index:1202;padding:calc(28px + env(safe-area-inset-top,0px)) 12px 14px;pointer-events:none;background:linear-gradient(180deg,rgba(3,7,12,0.92) 62%,rgba(3,7,12,0));}
/* ⚠️ BUBLINA MUSÍ ŽIARIŤ (Matej 24. 8.: „jeho bublina musí žiariť a musí byť viditeľný").
   Prvé kolo malo halo 4 px pri 14 % krytí — na svetlej turistickej mape to zaniklo rovnako
   ako predtým fialová pilulka. Preto nesie DVA dosvity: tesný prstenec (obrys) a široký
   závoj (svetlo), plus pomalé dýchanie, aby ju oko našlo aj bez pohybu.
   ⚠️ FARBA JE AINUBISOVA TMAVOMODRÁ, NIE ZLATÁ (Matej 25. 8. 2026: „ainubis musí mať modrú
   farbu bubliny ako má v brande"). Hodnoty NIE SÚ vymyslené — sú zdvihnuté 1:1 z jeho
   živého povrchu 'components/ainubis/AinubisWidget.css' (panel: studená čierna
   #071019→#03070C + modrý svit zhora, rám a text cyan #5BE0F0). Dôvod, prečo to nie je
   "T.brandBlue": egyptská modrá na TEJTO obrazovke už nesie iný význam — modrým lemom
   appka značí udalosti a „ideš s niekým" ("EVENT_RIM", CLAUDE.md), takže by sprievodca
   splynul so značkami na mape pod ním. AInubis má vlastnú modrú a tá je tu tá správna. */
.ang-bar{pointer-events:auto;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 8px;border-radius:14px;background:radial-gradient(120% 160% at 50% -40%,rgba(59,158,255,0.20) 0%,rgba(59,158,255,0) 62%),linear-gradient(180deg,#071019 0%,#03070C 100%);backdrop-filter:blur(10px);border:1.5px solid rgba(91,224,240,0.55);box-shadow:0 0 0 3px rgba(59,158,255,0.22),0 0 26px rgba(59,158,255,0.42),0 10px 30px rgba(0,0,0,0.62);animation:ang-glow 3.4s ease-in-out infinite;}
@keyframes ang-glow{
  0%,100%{box-shadow:0 0 0 3px rgba(59,158,255,0.20),0 0 22px rgba(59,158,255,0.32),0 10px 30px rgba(0,0,0,0.62);}
  50%{box-shadow:0 0 0 3px rgba(59,158,255,0.34),0 0 40px rgba(59,158,255,0.60),0 10px 30px rgba(0,0,0,0.62);}
}
/* ⚠️ TVÁR JE V KRUHU, NIE V ŠTVORCI (Matej 25. 8. 2026: „jeho ikonka musí byť v krúžku,
   kludne ho o niečo zväčši"). Kruh nie je vkus — je to tvar, ktorý AInubis má všade inde:
   plávajúce tlačidlo aj intro odznak vo widgete sú 'border-radius:50%'. Zaoblený štvorec
   tu bol jediné miesto v celej appke, kde mal inú siluetu.
   Obrázok je 800×940 (vyšší než širší), takže 'object-fit:contain' ho v kruhu nechá dýchať
   — 'cover' by mu odrezal uši. */
.ang-face{flex:0 0 auto;width:48px;height:48px;object-fit:contain;border-radius:50%;background:radial-gradient(circle at 35% 28%,#12233a 0%,#01050A 74%);box-shadow:0 0 0 1.5px rgba(91,224,240,0.45),0 0 16px rgba(59,158,255,0.38);}
/* Tvár ako tlačidlo do chatu — ten istý kruh, len klikateľný. Pulz je prstenec okolo neho,
   nie zmena veľkosti: tvár ostáva tam, kde ju človek pozná z kroku 1. */
/* ⚠️ Pulz aj fokus idú cez OUTLINE, nie box-shadow: tvár už nesie svoj prstenec v box-shadow
   (.ang-face) a druhý tieň by ho prepísal. Farby sú tokeny AINUBISA, nie opísané čísla. */
.ang-face-btn{flex:0 0 auto;display:block;padding:0;margin:0;border:0;background:none;border-radius:50%;cursor:pointer;line-height:0;outline:2px solid transparent;outline-offset:0;transition:transform .15s ease;}
.ang-face-btn:hover{transform:scale(1.06);}
.ang-face-btn:focus-visible{outline-color:${L.cyan};outline-offset:4px;}
.ang-face-btn--pulse{animation:ang-face-pulse 2.4s ease-in-out infinite;}
@keyframes ang-face-pulse{0%,100%{outline-color:transparent;outline-offset:0;}50%{outline-color:${L.edgeStrong};outline-offset:5px;}}
.ang-text{flex:1 1 auto;min-width:0;margin:0;font-family:${f};font-size:14px;font-weight:500;line-height:1.35;color:#E6FAFF;}
/* Kurzor bliká LEN kým sa píše — blikanie nad dopísanou vetou by tvrdilo, že ešte príde
   pokračovanie. */
.ang-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:#5BE0F0;animation:ang-blink .9s steps(1,end) infinite;}
@keyframes ang-blink{0%,49%{opacity:1;}50%,100%{opacity:0;}}
.ang-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.ang-x{float:right;width:30px;height:26px;margin:-2px -2px 0 6px;border:0;background:transparent;color:${d.onDarkDim};font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
.ang-x:hover{color:#5BE0F0;}
/* Ikonka dedí farbu textu (fill:currentColor v HandIcons), takže hover platí aj pre ňu. */
.ang-x svg{display:block;}
/* Riadok pod bublinou. Ťuky berie len on sám, nie celý pás — pod ním sa musí dať kresliť. */
.ang-below{margin-top:9px;pointer-events:auto;}
@media (prefers-reduced-motion: reduce){
  .ang-caret{animation:none;}
  .ang-bar{animation:none;}
  .ang-face-btn--pulse{animation:none;}
}
/* PC — dok je ľavý stĺpec, takže sprievodca stojí nad MAPOU vpravo od neho, nie cez celú
   šírku okna. Čísla sú tie isté, aké drží .trp-dtop, aby sa pásy neprekrývali. */
@media (min-width:900px){
  /* ⚠️ NA PC ŽIADNY ZÁVOJ (Matej 2026-08-27: „jeho blok je chybný… je ako keby v strede
     a má za sebou aj okolo divný overlay"). Tmavý prechod je stavaný pre TELEFÓN, kde
     bublina leží priamo na mape pod stavovým riadkom a bez neho by sa strácala. Na PC
     ju drží vlastný modrý dosvit — závoj z nej robil pás cez pol obrazovky.
     ⚠️ V toku pridávania výletu to nebolo vidieť: tam sprievodcu hostí ľavý stĺpec
     (.trp-dock--pc .ang-wrap, ktorý pozadie ruší). Vidieť to bolo len tam, kde ho
     renderuje niekto INÝ — MapNotePlacing pri označovaní odkazu. Preto sa to ruší TU,
     pri zdroji, a nie ďalším prepisom u volajúceho.
     ⚠️ Bublina sa NEROZŤAHUJE na celú šírku mapy. left:480px;right:74px z nej robilo
     pás, ktorý sa čítal ako vycentrovaný panel; s hornou hranicou šírky stojí pri ľavom
     okraji mapy, teda hneď vedľa panela, z ktorého tok vyšiel. */
  .ang-wrap{left:480px;right:74px;padding-top:16px;background:none;}
  /* Panel v tejto chvíli na obrazovke nie je — mapa začína pri okraji okna a bublina s ňou. */
  .ang-wrap--edge{left:0;padding-left:16px;}
  .ang-bar{max-width:560px;}
  .ang-face{width:54px;height:54px;}
  .ang-text{font-size:14px;}
}
@media (min-width:900px) and (max-width:1100px){
  .ang-wrap{left:400px;}
}
`,G=d.cardEdge,Be=d.brandBlueLite,vo=600,be=420;function nn(){return typeof window>"u"?be:window.innerWidth<=we?Math.round(window.innerHeight*We):be}function tn({lat:a,lon:n,kind:t,disease:r=null,radiusM:l=null,onMove:s}){const i=B[H(t)],b=m.useMemo(()=>te.divIcon({className:"mn-wrap",html:oa(t," mn-mark--draft",!1,r)}),[t]);return e.jsxs(e.Fragment,{children:[l!=null&&e.jsx(ea,{center:[a,n],radius:l,pathOptions:{color:i,weight:1.5,opacity:.7,fillColor:i,fillOpacity:.14,dashArray:"5 5"},interactive:!1}),e.jsx(ne,{position:[a,n],icon:b,draggable:!0,eventHandlers:{dragend:c=>{const v=c.target.getLatLng();s(v.lat,v.lng)}}})]})}function rn({group:a,kind:n,ready:t,onCancel:r,edgeLeft:l,onPickType:s}){const i=Z(),b=typeof window<"u"&&window.matchMedia("(hover:none)").matches,c=t?b?"pack.mapNotes.place.touch":"pack.mapNotes.place.mouse":"pack.mapNotes.place.zoomIn",v=n&&de[a].length>1&&n!==de[a][de[a].length-1]?i(`pack.mapNotes.kind.${n}`):i(`pack.mapNotes.group.${a}`);return e.jsx(ho,{text:`${v} ${i(c)}`,onAbort:r,abortLabel:i(s?"pack.mapNotes.add.back":"pack.mapNotes.add.cancel"),abortBack:!!s,edgeLeft:l})}function go(a,n){return a<1e3?`${a} m`:`${new Intl.NumberFormat(n,{maximumFractionDigits:1}).format(a/1e3)} km`}function sn({group:a,lat:n,lon:t,kind:r,onKind:l,radiusM:s,onRadius:i,disease:b,onDisease:c,pinnedSlug:v,pinnedName:y,onSubmit:p,onCancel:k,dock:x=!1}){const u=Z(),{lang:S}=He(),A=de[a],j=Me(r),[$,P]=m.useState(""),[h,N]=m.useState(null),[V,K]=m.useState(!1),[_,T]=m.useState(!1),C=Sa(),[J,X]=m.useState(!1),[re,q]=m.useState(null),Q=m.useRef(null),ee=g=>{const F=g.currentTarget.getBoundingClientRect(),ia=Math.min(1,Math.max(0,(g.clientX-F.left)/F.width)),sa=j.min+Math.round(ia*(j.max-j.min)/j.step)*j.step;i(Math.min(j.max,Math.max(j.min,sa)))};m.useEffect(()=>{var g;window.matchMedia("(hover:none)").matches||(g=Q.current)==null||g.focus()},[]);const o=g=>{l(g),g!=="ticks"&&c(null);const F=Me(g);F.mode==="none"?i(null):F.mode==="required"?i(Math.min(Math.max(s??F.def,F.min),F.max)):s!=null&&i(Math.min(Math.max(s,F.min),F.max))},O=Je(),M=r==="poison",E=()=>{Ma("report.poison",{pt:[n,t],radius:Math.min(Math.max(s??ge.def,ge.min),ge.max)}),O("/pack/sos/nebezpecenstvo/otrava")},D=$.trim(),he=Da(r),ae=r==="parking",Ee=ae&&h===null,Ae=ae&&(!x||_)||r==="unique",xe=!M&&(!he||D.length>0)&&!Ee&&!C.busy&&!J,ra=async()=>{if(xe){X(!0),q(null);try{await p({kind:r,lat:n,lon:t,body:D,radiusM:s,paid:r==="parking"?h:null,overnight:ae&&V,profileOff:ae&&x&&!_,photos:Ae?C.urls:[],disease:r==="ticks"?b:null,pinnedSlug:v??null})}catch(g){g==null||g.message,q(g instanceof Error?g.message:u("pack.mapNotes.error")),X(!1)}}};return e.jsxs("div",{className:`mna-sheet trp-dockpanel${x?" mna-sheet--dock":""}`,role:"dialog","aria-modal":"false",children:[e.jsx("style",{children:Na}),e.jsx("style",{children:na}),e.jsx("style",{children:Oa}),e.jsxs("div",{className:"mna-head",children:[e.jsx("button",{type:"button",className:"mna-close",onClick:k,"aria-label":u("pack.mapNotes.add.close"),children:e.jsx(Fa,{})}),e.jsxs("span",{className:"mna-title",style:{color:B[a],"--mn-tint":B[a]},children:[u(`pack.mapNotes.group.${a}`),A.length>1&&u(`pack.mapNotes.kind.${r}`)!==u(`pack.mapNotes.group.${a}`)&&e.jsx("b",{className:"mna-title-kind",children:u(`pack.mapNotes.kind.${r}`)})]})]}),e.jsxs("div",{className:"mna-scroll",children:[A.length>1&&e.jsx(e.Fragment,{children:e.jsx(uo,{row:!0,kinds:A,selected:r,tint:B[a],onPick:o})}),r==="ticks"&&e.jsxs("div",{className:"mna-tick",children:[e.jsxs("div",{className:"mna-tick-switch",children:[e.jsx("button",{type:"button",className:`mna-opt mna-opt--sight${b==null?" on":""}`,onClick:()=>c(null),children:u("pack.mapNotes.tick.sighting")}),e.jsx("button",{type:"button",className:`mna-opt mna-opt--ill${b!=null?" on":""}`,onClick:()=>c(b??De[0]),children:u("pack.mapNotes.tick.confirmed")})]}),b!=null&&e.jsx("select",{className:"mna-select",value:b,onChange:g=>c(g.target.value),"aria-label":u("pack.mapNotes.tick.confirmed"),children:De.map(g=>e.jsx("option",{value:g,children:u(`pack.mapNotes.disease.${g}`)},g))})]}),M&&e.jsx("p",{className:"mna-poison",children:u("pack.mapNotes.poison.viaSos")}),!M&&e.jsx("textarea",{ref:Q,className:"mna-body",value:$,maxLength:vo,onChange:g=>P(g.target.value),placeholder:u(`pack.mapNotes.add.placeholder.${r}`),rows:2}),ae&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"ppx-q",children:[u("pack.placeProfile.paidQ")," ",e.jsx("span",{className:"ppx-req",children:u("pack.placeProfile.required")})]}),e.jsxs("div",{className:"mna-paid",style:{marginTop:0},children:[e.jsx("button",{type:"button",className:`mna-opt${h===!0?" on":""}`,onClick:()=>N(h===!0?null:!0),children:u("pack.placeProfile.yes")}),e.jsx("button",{type:"button",className:`mna-opt${h===!1?" on":""}`,onClick:()=>N(h===!1?null:!1),children:u("pack.placeProfile.no")})]}),e.jsx(Te,{on:V,onChange:K,label:u("pack.mapNotes.parking.overnightField")}),x&&e.jsx(Te,{on:_,onChange:T,label:u("pack.placeProfile.worth"),sub:u("pack.placeProfile.worthSub")})]}),Ae&&e.jsxs("div",{children:[e.jsxs("div",{className:"ppx-q",children:[u("pack.placeProfile.photo")," ",e.jsx("span",{className:"ppx-note",style:{margin:0},children:u("pack.placeProfile.optional")})]}),e.jsx(La,{ph:C,addLabel:u("pack.placeProfile.photoAdd"),removeLabel:u("pack.placeProfile.photoRemove")}),C.error&&e.jsx("p",{className:"mna-error",children:u("pack.mapNotes.error")})]}),j.mode!=="none"&&!M&&e.jsxs("div",{className:"mna-radius",children:[e.jsxs("div",{className:"mna-radius-head",children:[e.jsx("span",{className:"mna-radius-label",children:u("pack.mapNotes.radius.label")}),j.mode==="optional"&&e.jsxs("div",{className:"mna-radius-switch",children:[e.jsx("button",{type:"button",className:`mna-opt${s==null?" on":""}`,onClick:()=>i(null),children:u("pack.mapNotes.radius.point")}),e.jsx("button",{type:"button",className:`mna-opt${s!=null?" on":""}`,onClick:()=>i(s??j.def),children:u("pack.mapNotes.radius.area")})]}),s!=null&&e.jsx("span",{className:"mna-radius-val",children:go(s,ha(S))})]}),s!=null&&e.jsx("input",{type:"range",className:"mna-range",min:j.min,max:j.max,step:j.step,value:s,onChange:g=>i(Number(g.target.value)),onPointerDown:g=>{g.pointerType==="touch"&&(g.currentTarget.setPointerCapture(g.pointerId),ee(g))},onPointerMove:g=>{g.pointerType==="touch"&&g.currentTarget.hasPointerCapture(g.pointerId)&&ee(g)},style:{"--mn-tint":B[a]},"aria-label":u("pack.mapNotes.radius.label")}),H(r)==="warning"&&e.jsx("p",{className:"mna-radius-note",children:u("pack.mapNotes.radius.warnNote")})]}),y&&e.jsx("p",{className:"mna-pinned",children:u("pack.mapNotes.add.pinned").replace("{trip}",y)}),re&&e.jsx("p",{className:"mna-error",children:re})]}),e.jsxs("div",{className:"mna-actions",children:[M?e.jsx("span",{className:"mna-hint"}):xe?e.jsxs("span",{className:"mna-hint mna-hint--ok",children:[e.jsx("i",{"aria-hidden":"true",children:"✓"}),u("pack.mapNotes.add.ready")]}):Ee?e.jsx("span",{className:"mna-hint",children:u("pack.mapNotes.parking.needPaid")}):e.jsx("span",{className:"mna-hint",children:u("pack.mapNotes.add.dragHint")}),M?e.jsx("button",{type:"button",className:"btn-gold mna-submit",onClick:E,children:u("pack.mapNotes.poison.cta")}):e.jsx("button",{type:"button",className:"btn-gold mna-submit",onClick:ra,disabled:!xe,children:u(J?"pack.mapNotes.add.saving":"pack.mapNotes.add.submit")})]})]})}function ln({x:a,y:n,width:t,height:r}){const l=Z(),s=250,i=54,b=14,c=10,v=n-b-i<c,y=v?n+b:n-b-i,p=Math.max(c,Math.min(a-s/2,Math.max(c,t-s-c))),k=Math.max(12,Math.min(a-p,s-12));return e.jsxs("div",{className:`mntf${v?" is-below":""}`,role:"status",style:{left:p,top:Math.max(c,Math.min(y,r-i-c)),width:s,"--mntf-arrow":`${k}px`},children:[e.jsx("style",{children:na}),l("pack.mapNotes.tooFar")]})}const na=`
/* ── PANEL AKO NÍZKY PÁS ───────────────────────────────────────────────────
   Žiadny backdrop: mapa musí ostať vidieť aj klikateľná mimo panela.
   ⚠️ overflow-y:auto je POISTKA, nie návrh — obsah sa má do panela zmestiť
   VŽDY (Matej 22. 8.: „nesmie tam byť scrolling"). Necháva sa tu len pre prípad
   jazyka s výrazne dlhšími slovami; keď sa scrollbar objaví v SK alebo EN, je to
   chyba na opravu, nie stav na strpenie. Meraj scrollHeight vs clientHeight
   pri kliešti s potvrdenou chorobou a zapnutým okruhom — to je najvyšší stav.
   POZOR: PLNÁ TMAVÁ VÝPLŇ, NIE sklo (pk-glass). Sklo je priehľadné a leží tu nad
   SVETLOU mapou, takže panel zbelie a text z neho zmizne (overené screenshotom —
   celý formulár bol nečitateľný nad zeleným podkladom). To isté platí pre lištu
   aj nápovedu nižšie; tmavé sklo funguje len nad tmavou stránkou. */
/* ── SPODNÝ DOK, NIE PLÁVAJÚCA KARTA (Matej 2026-08-24) ────────────────────
   „klik na napr. kliešte → klik na mapu → a v tomto popupe nie je vidno CTA
    (zapísať na mapu), lebo nie je ako spodný panel, ako by mal byť."

   Karta visela 96 px nad spodnou hranou, mala strop 64vh a vnútri skrol — takže
   na telefóne CTA leží POD zlomom a človek ho nájde, len ak tuší, že tam je.
   Dok je pripútaný k hrane, má tvar lišty kreslenia (rovnaký povrch v tom istom
   kroku) a hlavne: CTA sa už nikam neposúva.
   ⚠️ Skrol NEZANIKOL, len sa presunul dovnútra — strop musí ostať, lebo kliešť
   s potvrdenou chorobou a zapnutým okruhom je vyšší než nízky displej. Zmenilo sa,
   ČO sa skroluje: teraz stred, kým hlavička aj CTA stoja. */
/* ── TVAR JE SPOLOČNÝ S DOKOM SPRIEVODCU (Matej 2026-08-24) ────────────────
   „pri označení parkoviska sa vysunie iný dolný panel… musí byť taký istý ako ten panel
    predtým, treba ustáliť ten istý tvar aj veľkosť."
   Povrch, výplň aj výška prišli do .trp-dockpanel (components/pack/mapDockShape.ts) —
   ten istý zdroj, z akého ich berie .trp-dstart a .trp-dbar. Tu ostáva len to, čo je
   vlastné TOMUTO panelu: pripútanie k hrane a vnútorné rozvrhnutie (hlavička a CTA stoja,
   skroluje sa stred). */
.mna-sheet{position:fixed;left:0;right:0;bottom:0;z-index:1200;display:flex;flex-direction:column;max-height:min(78vh,${be}px);}
/* ── 33vh JE SPODNÁ HRANICA, NIE PEVNÁ VÝŠKA ───────────────────────────────
   Dok sprievodcu má v krokoch 1-2 presných 33vh, aby sa výrez mapy nehýbal. Tento panel
   z toho berie SPODNÚ hranicu — nikdy nie je nižší než dok, ktorý práve vystriedal, takže
   nevznikne dojem, že sa vysunulo niečo iné a menšie. Strop si drží vlastný.

   ⚠️ PEVNÝCH 33vh SA VEDOME NEDRŽÍ. Odskúšané naživo: pri parkovisku (text + zadarmo/platené)
   sa obsah do 232 px na 704 px vysokom okne nezmestí a pilulky sa prerežú v polovici — a
   prerezaný riadok nevyzerá ako "skroluj", vyzerá ako pokazené. Pri upozornení je obsah
   dvojnásobný (rad hrozieb + posuvník okruhu + veta). Rásť je menšie zlo než rezať: rozdiel
   oproti doku je desiatky pixelov, kým povrch, výplň aj rám ostávajú tie isté. */
@media (max-width:${we}px){
  .mna-sheet{height:auto;min-height:${We*100}vh;max-height:min(78vh,${be}px);}
}
/* ── V SPRIEVODCOVI VÝLETU AJ NA PC SEDÍ V ĽAVOM STĹPCI ────────────────────
   Bez tohto by na PC panel v kroku 2 odskočil z ľavého bloku na pás cez celú spodnú hranu —
   tá istá chyba ako na telefóne, len s väčším skokom. Miery sú zhodné s .trp-dock
   (GeometryPicker.tsx): je to ten istý stĺpec, nie jeho druhá verzia.
   ⛔ Do 3. 10. 2026 to platilo LEN v sprievodcovi a na holej mape bol panel pásom cez celú
   spodnú hranu (1477 px pri jednej vete a rade chipov). Matej nad hárkom (bod F3, „ok oprav
   všetko"): rovnaký ľavý stĺpec ako formulár podujatia — jedna úloha, jedno miesto. */
@media (min-width:1024px){
  /* ⚠️ ZAROVNANÝ HORE A VYSOKÝ PODĽA OBSAHU (bottom:auto). Dok má síce top aj bottom 20 px,
     ale je to len RÁM stĺpca — panely v ňom stoja hore (justify-content:flex-start) a výšku
     si berú podľa obsahu. Keď si tie isté dve hodnoty vzal panel značky priamo na seba,
     natiahol sa cez celú obrazovku a medzi vetou o okruhu a tlačidlom ostala pol metra diera. */
  .mna-sheet{top:20px;bottom:auto;left:20px;right:auto;width:${za}px;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);}
}
@media (min-width:1024px) and (max-width:1400px){
  .mna-sheet{width:360px;}
}
/* Hlavička a CTA stoja, skroluje sa len stred v .mna-scroll.
   ⚠️ NIE mna-body — to je trieda TEXTAREY o pár riadkov nižšie a obal s tým istým
   názvom by jej pretlačil výšku aj skrol. */
.mna-sheet > .mna-head{flex:0 0 auto;}
.mna-sheet > .mna-actions{flex:0 0 auto;margin-top:10px;}
.mna-scroll{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;display:flex;flex-direction:column;gap:10px;padding-top:8px;}

.mna-head{display:flex;align-items:center;justify-content:flex-start;gap:12px;}
.mna-title{font-family:${U};font-weight:700;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;}
/* Zavrieť = šípka späť v bledom kruhu (27. 9. 2026, bolo holé × vpravo). */
.mna-close{${_a("pale")}}
.mna-close:hover{${Ka("pale")}}
/* ── DRUHY HROZBY = RAD EMOJI KRUHOV, NIE PILULKY S TEXTOM ─────────────────
   Matej 2026-08-22: „nesmie tam byť scrolling musí to byť celé na jedno videnie
   v popupe… neviem kam mam kliknúť musí to mať kekné body ako aj vizuálne
   ukazovatele že je to vybraté a splnené."

   Deväť pilulek s textom sa lámalo do TROCH riadkov a zaberalo 99 px — samo
   o sebe skoro tretinu panela a hlavný dôvod, prečo panel scrolloval (namerané:
   391 px obsahu do 338 px). Kruh s emoji zaberie JEDEN riadok (34 px) a názov
   vybraného druhu sa presunul do hlavičky (UPOZORNENIE · KLIEŠTE), takže text sa
   nestratil — len sa prestal opakovať deväťkrát a nestojí vlastný riadok.

   Kruh je zámerne TÝŽ TVAR ako značka na mape (28 px, biele pole, farebný lem) —
   človek vyberá presne to, čo o chvíľu uvidí pod prstom. Vybraný je VYPLNENÝ
   farbou skupiny a má prstenec, takže „vybraté" sa dá prečítať aj periférne. */
/* Rad zaberá CELÚ šírku panela rovnakými dielmi (flex:1 1 0) a NEZALAMUJE sa.
   Pevná šírka 34 px sa pri 360 px telefóne (panel 338) zlomila do dvoch radov
   a obsah vyskočil na 407 px, teda 2 px pod strop — teoreticky prešlo, prakticky
   by to spadlo pri prvom dlhšom preklade. Deliť šírku je odolnejšie než ju hádať.
   max-width drží kruh na 34 px na širokom paneli, nech z neho nie je ovál. */
/* Druh za skupinou. Oddelený bodkou a stlmený, aby hlavička ostala jedným
   prvkom a nie dvoma nadpismi vedľa seba. */
.mna-title-kind{font-weight:700;opacity:.72;}
.mna-title-kind::before{content:' · ';opacity:.6;}

/* ── POLOMER ───────────────────────────────────────────────────────────────
   Posuvník má vlastný vzhľad, lebo natívny je na tmavom paneli takmer neviditeľný
   (WebKit kreslí bledú dráhu na bledom pozadí). Farbu berie zo skupiny cez
   --mn-tint, takže upozornenie ťahá červenú a komentár zlatú — rovnaký jazyk
   ako značka aj kruh na mape. */
/* ── KLIEŠŤ: VÝSKYT / POTVRDENÁ CHOROBA ───────────────────────────────────
   Prepínač je ten istý tvar ako bod/okruh pri polomere (.mna-opt) — je to tá
   istá otázka „ktorá z dvoch verzií", takže nemá dôvod vyzerať inak. */
/* Prepínač a výber choroby stoja VEDĽA SEBA, nie pod sebou — pod sebou to bolo
   69 px a panel sa práve o toľko nezmestil. Sú to dve časti jednej vety
   („potvrdená choroba: borelióza"), takže jeden riadok je aj vecne správnejší. */
.mna-tick{margin-top:9px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.mna-tick-switch{display:flex;gap:6px;flex:1 1 auto;}
.mna-tick-switch .mna-opt{flex:1 1 0;font-size:10px;padding:8px 12px;}
/* Natívny select nesie na macOS aj Windows vlastný chrome — prefarbuje sa len
   to, čo sa dá, a color-scheme:dark povie prehliadaču, nech rozbaľovací zoznam
   nakreslí tmavý. Bez toho je zoznam biely nad čiernym panelom. */
.mna-select{flex:1 1 150px;min-width:0;color-scheme:dark;font-family:${f};font-size:12px;color:${d.onDark};background:rgba(245,240,228,0.06);border:1px solid ${d.onDarkBorder};border-radius:8px;padding:8px 8px;cursor:pointer;}

.mna-radius{margin-top:10px;}
.mna-radius-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.mna-radius-label{font-family:${f};font-weight:500;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${d.onDarkDim};}
.mna-radius-switch{display:flex;gap:6px;}
.mna-radius-switch .mna-opt{flex:0 1 auto;font-size:10px;padding:4px 12px;}
.mna-radius-switch .mna-opt.on{color:${G};border-color:${G};background:rgba(201,154,63,0.12);}
.mna-radius-val{margin-left:auto;font-family:${f};font-weight:600;font-size:12px;letter-spacing:0.02em;color:${d.onDark};}
.mna-radius-note{margin:6px 0 0;font-family:${f};font-size:10px;line-height:1.4;color:${d.onDarkDim};}
.mna-range{width:100%;margin:9px 0 0;touch-action:none;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;}
.mna-range:focus{outline:none;}
.mna-range::-webkit-slider-runnable-track{height:4px;border-radius:999px;background:rgba(245,240,228,0.16);}
.mna-range::-moz-range-track{height:4px;border-radius:999px;background:rgba(245,240,228,0.16);}
/* margin-top na palci = (výška dráhy − priemer palca) / 2; bez neho WebKit
   posadí palec na horný okraj dráhy a posuvník vyzerá rozbito. */
.mna-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;margin-top:-6px;border-radius:50%;background:var(--mn-tint,${G});border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.5);}
.mna-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--mn-tint,${G});border:2px solid rgba(255,255,255,0.85);box-shadow:0 2px 6px rgba(0,0,0,0.5);}
/* 16 px je minimum, pod ktorým iOS Safari pri fokuse zoomuje celú stránku —
   v mape by to znamenalo, že sa človeku pri písaní rozsype výrez. */
.mna-body{width:100%;box-sizing:border-box;margin-top:8px;font-family:${f};font-size:16px;line-height:1.45;color:${d.onDark};background:rgba(245,240,228,0.06);border:1px solid ${d.onDarkBorder};border-radius:8px;padding:8px 12px;resize:none;min-height:56px;}
.mna-body:focus{outline:none;border-color:${G};}
.mna-body::placeholder{color:${d.onDarkDim};}
.mna-paid{display:flex;gap:6px;margin-top:8px;}
.mna-opt{flex:1 1 0;font-family:${f};font-weight:600;font-size:12px;color:${d.onDarkDim};background:transparent;border:1px solid ${d.onDarkBorder};border-radius:999px;padding:8px 12px;cursor:pointer;}
.mna-opt.on{color:${Be};border-color:${Be};background:rgba(46,95,208,0.14);}
/* ── PREPÍNAČ KLIEŠŤA NESIE FARBU, KTORÚ DOSTANE ZNAČKA ────────────────────
   Do 22. 8. dedil .mna-opt.on, teda MODRÚ — a modrá je v tejto appke farba
   parkoviska. V paneli o kliešťoch tak svietila tretia farba, ktorá nič
   neznamenala, vedľa červeného kruhu a zlatého okruhu. Teraz je vybraný stav
   presne ten odtieň, aký bude mať lem značky na mape: oranžová = výskyt,
   červená = potvrdené ochorenie. Človek teda vidí následok voľby, nie len ktorá
   je aktívna. Zdroj oboch farieb je noteTint, nie nové hodnoty. */
.mna-opt--sight.on{color:${fe};border-color:${fe};background:rgba(224,138,46,0.16);}
.mna-opt--ill.on{color:${I};border-color:${I};background:rgba(206,75,60,0.16);}
.mna-pinned{margin:8px 0 0;font-family:${f};font-size:12px;color:${d.onDarkDim};}
.mna-poison{margin:8px 0 0;font-family:${f};font-size:14px;line-height:1.4;color:${d.onDark};}
.mna-error{margin:8px 0 0;font-family:${f};font-size:12px;color:#E0796D;}
.mna-actions{display:flex;gap:10px;align-items:center;margin-top:10px;}
.mna-hint{flex:1 1 auto;display:flex;align-items:center;gap:6px;font-family:${f};font-size:10px;line-height:1.35;color:${d.onDarkDim};}
/* Zelená je tu JEDINÁ v paneli a nesie presne jeden význam: „môžeš odoslať".
   Je to ten istý odtieň, aký na mape nesie tip — pozitívny stav, nie výstraha. */
.mna-hint--ok{color:${B.comment};font-weight:600;}
.mna-hint--ok i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:999px;background:${B.comment};color:#08150c;font-size:10px;font-weight:700;line-height:1;}
/* CTA (brand v3.2 LOCKED): .btn-gold sa nikde neimportuje globálne (žije v
   SpiralLanding.css) — lokálna kópia hodnôt 1:1, rovnaký zavedený vzor ako
   AddTripPlan.tsx a AddEvent.tsx. Gradient 135°, radius 8, papyrusový rám. */
.mna-submit.btn-gold{
  flex:0 0 auto;padding:12px 16px;background:${ve.grad};
  border:1px solid ${ve.edge};border-radius:8px;color:#000;font-family:${U};
  font-size:12px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;
  box-shadow:${ve.glow};
  transition:transform .2s,box-shadow .22s,opacity .22s;
}
.mna-submit.btn-gold:disabled{opacity:.45;cursor:default;box-shadow:none;}

/* ── LIŠTA „UKÁŽ MIESTO" ───────────────────────────────────────────────────
   Plná tmavá výplň, nie sklo: leží nad SVETLOU mapou, kde priesvitné sklo zmizne
   (overené screenshotom pri prvej verzii — biely text na svetlozelenej mape). */
/* VÝZVA PRIBLÍŽIŤ = jediný stav, keď lišta hovorí „takto to nepôjde" (Matej 2026-08-21:
   „daj ju do červeného rámika ten čierny sa stratí"). Zlatý rám na mape splýva s okolím
   aj s vlastnou paletou; červená je jediná farba, ktorú appka inde nepoužíva na nič iné
   než na upozornenie. NEDÁVAJ ju na MapNoteHint — tá privíta, nie varuje. */

/* ── RÝCHLA PALETA PRI BODE ────────────────────────────────────────────────── */
/* Šírka je ORÁMOVANÁ, nie max-content: tri pilulky s celými názvami merajú ~470 px
   a na 390 px displeji by z panela vytiekli von. S obmedzením sa rad zalomí. */
/* ── PALETA TIEŽ DO SPODNÉHO DOKU (Matej 2026-08-24) ───────────────────────
   „pri výbere ODKAZU mi otvorí popup, treba tam scrollovať, je tam moc obsahu —
    uprav to tak, že to natiahni, resp. daj to do spodného panela ako je to pri
    2. kroku."
   Ide o tvar, nie o obsah: mriežka s NÁZVAMI ostáva. Rad holých kruhov padol
   23. 8. práve preto, že voľba schovaná za akciu je voľba, ktorú človek nevidí —
   a rozbaľovací zoznam by ju schoval znova. Šetrí sa teda na TVARE panela
   (pripútaný k hrane, plná šírka), nie na tom, čo je v ňom čitateľné. */
.mnq-wrap{position:fixed;left:0;right:0;bottom:0;z-index:1250;}
.mnq-panel{max-height:70vh;overflow-y:auto;overscroll-behavior:contain;padding:12px 14px calc(14px + env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0;background:rgba(5,5,5,0.96);backdrop-filter:blur(12px);border-top:1px solid rgba(201,154,63,0.5);box-shadow:0 -14px 40px rgba(0,0,0,0.6);}
.mnq-head{position:relative;display:flex;align-items:center;justify-content:center;min-height:30px;margin-bottom:8px;}
/* Panel je RASTÚCI ZOZNAM („tu časom vieme pridať dalšie položky") — nadpis preto
   patrí nad celý panel, nie k prvej dlaždici. */
.mnq-title{margin:0;font-family:${U};font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${d.onDark};text-align:center;}
.mnq-close{position:absolute;left:0;top:50%;transform:translateY(-50%);}

/* Bod z podržania — kruh bez významu, typ sa vyberá až v palete pod ním. */
.mn-spot{width:18px;height:18px;border-radius:50%;background:${d.glassSoft};border:2px solid rgba(245,240,228,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.5);animation:mnPulse 1.4s ease-in-out infinite;}

/* Značka počas zakladania pulzuje — odlišuje rozpracovaný zápis od uložených. */
.mn-mark--draft{animation:mnPulse 1.4s ease-in-out infinite;cursor:grab;}
.mn-mark--draft:active{cursor:grabbing;}
@keyframes mnPulse{0%,100%{box-shadow:0 2px 6px rgba(0,0,0,0.45);}50%{box-shadow:0 2px 6px rgba(0,0,0,0.45),0 0 0 7px rgba(201,154,63,0.18);}}

/* Nápoveda leží nad MAPOU, nie nad tmavou stránkou — priesvitné sklo na nej
   zmizlo (overené screenshotom: biely text na svetlozelenej mape). Preto plná
   tmavá výplň a papyrusový text, nie pk-glass. */
.mna-tip{position:fixed;left:50%;transform:translateX(-50%);bottom:96px;z-index:900;display:flex;align-items:flex-start;gap:10px;padding:12px 16px;max-width:min(92vw,420px);border-radius:14px;background:rgba(5,5,5,0.92);border:1px solid ${d.border};box-shadow:0 6px 20px rgba(0,0,0,0.5);font-family:${f};font-size:12px;line-height:1.4;color:${d.onDark};}
.mna-tip button{flex:0 0 auto;border:0;background:transparent;color:${d.onDarkDim};font-size:16px;line-height:1;cursor:pointer;padding:0 4px;}
.mna-tip button:hover{color:${G};}
@media (max-width:720px){.mna-tip{bottom:156px;}}
/* ⚠️ PÁS PATRÍ LEN DOTYKU (2026-09-02). Hovorí „podrž dlhšie PRST" — gesto, ktoré myš nemá.
   Na PC to isté a správne hovorí plusko pri kurzore (MapNoteCursor), takže tam svietili DVE
   nápovedy na tú istú vec naraz a jedna z nich radila prstom. Je to zrkadlo pravidla, ktoré
   MapNoteCursor už má opačným smerom (hover:none skryje .mnc) — a rieši sa to médiom, nie
   príznakom v stave: držať šírku okna v Reacte tento súbor nikde nerobí.
   ⚠️ Pozor na spätné apostrofy v tomto komentári — celý blok je JS template literal. */
@media (hover:hover) and (pointer:fine){.mna-tip{display:none;}}

/* ── VÝZVA PRIBLÍŽIŤ — V MIESTE KLIKU ──────────────────────────────────────
   absolute, nie fixed: kotví sa do kontajnera mapy, lebo súradnice prichádzajú
   v jeho pixeloch. Červený rám je Matejov (21. 8.: „daj ju do červeného rámika ten
   čierny sa stratí") — červená je jediná farba, ktorú appka inde nepoužíva na nič
   iné než na upozornenie. NEDÁVAJ ju na MapNoteHint: tá privíta, nevaruje.
   pointer-events:none — bublina nesmie zjesť ďalší klik, ktorým sa človek
   pokúsi priblížiť dvojklikom. */
.mntf{position:absolute;z-index:1150;pointer-events:none;padding:12px 12px;border-radius:12px;background:rgba(5,5,5,0.94);border:1px solid ${I};box-shadow:0 6px 20px rgba(0,0,0,0.5),0 0 0 1px rgba(206,75,60,0.35),0 0 18px rgba(206,75,60,0.3);font-family:${f};font-size:12px;line-height:1.4;color:#F4C9C2;animation:mntfIn .16s ease-out;}
/* Šípka = otočený štvorec s dvomi zvýraznenými hranami. Posúva sa cez
   --mntf-arrow, aby ukazovala na bod aj keď je telo prirazené k okraju. */
.mntf::after{content:'';position:absolute;left:var(--mntf-arrow,50%);width:10px;height:10px;margin-left:-5px;background:rgba(5,5,5,0.94);transform:rotate(45deg);}
.mntf:not(.is-below)::after{bottom:-6px;border-right:1px solid ${I};border-bottom:1px solid ${I};}
.mntf.is-below::after{top:-6px;border-left:1px solid ${I};border-top:1px solid ${I};}
@keyframes mntfIn{from{opacity:0;transform:scale(.94);}to{opacity:1;transform:scale(1);}}

/* ⚠️ TENTO BLOK MUSÍ OSTAŤ POSLEDNÝ. Pravidlá v ňom majú ROVNAKÚ špecifickosť
   ako ich široké dvojičky, takže rozhoduje PORADIE v súbore. (Historicky sa na tom
   zlomil kruh druhu: media query sa vyhodnotila správne, ale neskoršie pravidlo ju
   prebilo — vyzeralo to ako nefunkčná media query, bola to kaskáda.)
   ⚠️ Rad kruhov .mna-kinds/.mna-kind 23. 8. 2026 ZANIKOL — druhy kreslí KindGrid
   (mriežka 3 stĺpce, emoji + názov), ktorá si nesie vlastné CSS. Pravidlá pre neho tu nie sú.
   ⚠️ A dôvod, prečo je tu trieda bez spätných apostrofov: toto je JS template literal,
   takže spätný apostrof v CSS komentári ho ukončí a zhodí build (CLAUDE.md, HUB_CSS). */
/* ── ÚZKY DISPLEJ ─────────────────────────────────────────────────────────
   Pri 390 px je panel 367 px široký a dva rady sa zalomia naraz. Namerané: obsah
   skočil z 366 na 447 px, teda nad strop 64vh na 667 px vysokom telefóne — panel by
   scrolloval presne tam, kde to Matej zakázal, a na širokom okne by o tom nikto nevedel.
   ⚠️ Responzívnu zmenu preto meraj v PÁSME (338/367/400/440), nie na jednej
   šírke — to je tá istá pasca ako pri psom bloku na /pack/dogs. */
@media (max-width:430px){
  .mna-sheet .mnk-tile{padding:8px 4px;}
  .mna-sheet .mnk-tile i{font-size:16px;}
  .mna-sheet .mnk-tile em{font-size:10px;}
  .mna-sheet .mna-tick-switch .mna-opt{font-size:10px;padding:8px 4px;letter-spacing:0.02em;}
  .mna-sheet .mna-select{flex:1 1 120px;font-size:12px;padding:8px 8px;}
  .mna-sheet .mna-radius-note{font-size:10px;}
}
${`
/* ══ BLEDÝ SKIN PC (2026-08-26) ══════════════════════════════════════════════════════════
   Kartička značky sedí na spoločnom povrchu .trp-dockpanel (mapDockShape.ts), ktorý je na PC
   papyrusový — obsah tu preto nesmie ostať v onDark tokenoch. Mobil ostáva tmavý.
   ⚠️ .mna-title-kind a .mna-opt--sight/--ill si držia SVOJE farby (skupina značky, potvrdená
   choroba): tie nesú význam a menia sa len tam, kde by boli na svetlom nečitateľné.
   ⚠️ color-scheme na <select> sa musí prepnúť na light, inak WebKit kreslí rozbaľovaciu
   ponuku ďalej načierno a v papyrusovom paneli vyskočí tmavý zoznam.
   ⚠️ Media query zanikla 28. 8. 2026 — dok je bledý na každej šírke. */
  /* ── HLAVNÉ CTA JE LAPIS, NIE ZLATÉ (Matej 2026-08-26: „CTA oprav máme predsa modrú") ───
     Formulár značky sa otvára Z KROKU 2 pridávania výletu, takže stojí v tom istom slede
     obrazoviek ako HOTOVO a OZNAČ — a pre ten platí Matejov lock z 24. 8.: „každý slajd musí
     mať totožné CTA, rovnaká farba a štýl". Kým tie dve zmodreli a toto ostalo zlaté, bola
     v jednom toku dvojica CTA v dvoch farbách.
     ⚠️ Od 28. 8. to platí aj na telefóne — panel je bledý aj tam, takže zlatá by bola zlatá
     na zlatom a hlavná akcia by splynula s doskou, ktorá ju drží. */
  .mna-submit.btn-gold{background:${z.grad};border-color:${z.deep};color:${z.ink};box-shadow:${je};}
  .mna-submit.btn-gold:hover:not(:disabled){background:${z.gradHover};box-shadow:${je};}
  .mna-select{color-scheme:light;color:${w.ink};background:${w.field};border-color:${w.border};}
  .mna-radius-label{color:${w.dim};}
  .mna-radius-val{color:${w.ink};}
  .mna-radius-note{color:${w.dim};}
  /* ⚠️ Tá istá diera ako pri .mnts-back: dráha jazdca je BIELA na 16 %, čo bola farba pre
     tmavé sklo — na papyruse z nej ostane takmer nič a jazdec vyzerá ako vypnutý. Krytie
     to nezachráni, farbu musí niesť sama dráha. Palec ostáva zlatý (resp. v tinte skupiny),
     len dostáva tmavší lem — biely obrys sa na piesku stráca. */
  .mna-range::-webkit-slider-runnable-track{background:rgba(122,90,42,0.28);}
  .mna-range::-moz-range-track{background:rgba(122,90,42,0.28);}
  .mna-range::-webkit-slider-thumb{border-color:${w.deep};box-shadow:0 2px 6px rgba(70,45,10,0.35);}
  .mna-range::-moz-range-thumb{border-color:${w.deep};box-shadow:0 2px 6px rgba(70,45,10,0.35);}
  .mna-body{color:${w.ink};background:${w.field};border-color:${w.border};}
  .mna-body::placeholder{color:${w.dim};opacity:.75;}
  .mna-opt{color:${w.dim};background:${w.soft};border-color:${w.border};}
  .mna-opt.on{color:${w.ink};}
  .mna-pinned{color:${w.dim};}
  .mna-poison{color:${w.ink};}
  .mna-hint{color:${w.dim};}
  .mnq-title{color:${w.ink};}
`}
${`
/* ══ ŠAT PAPYRUS 3D (Matej 21. 11. 2026: „panel je v starej grafike kameňa ako aj v starom
   brande, jedine CTA je nové = oprav to nech to ladí s novým dizajnom") ═══════════════════════
   Ten istý recept ako dok kreslenia v GeometryPicker (P3D_GEO_CSS): papierová doska s tmavým
   obrysom, pole pk-p3d-input, prepínač pk-p3d-sw, CTA = TLAČIDLO 3D lapis. Mramor/kameň zo
   starého goldPlateCSS sa tu prekryje celou výplňou (background je skratka, berie aj obrázky). */
/* Tiene šatu ako premenné na doske (vzor --b3-sh v GeometryPicker): jeden zdroj pre celý panel. */
html.papyrus3d .mna-sheet{--mna-sh-cta:inset 0 2px 0 rgba(255,255,255,.28),inset 0 -4px 0 rgba(0,0,0,.15),0 4px 0 var(--b3-p),0 8px 10px rgba(0,0,0,.28);--mna-sh-focus:var(--p3d-inset),0 0 0 3px color-mix(in srgb,${z.edge} 40%,transparent);--mna-sh-track:inset 0 0 0 2px var(--p3d-ink),inset 0 3px 3px rgba(42,22,8,.25);--mna-sh-thumb:inset 0 2px 0 rgba(255,255,255,.45),0 3px 0 var(--p3d-ink);--mna-sh-lapis:inset 0 2px 0 rgba(255,255,255,.28),0 3px 0 #060F2C;--mna-sh-chipon:inset 0 2px 4px rgba(42,22,8,.22);--mna-sh-trackff:inset 0 0 0 2px var(--p3d-ink);--mna-sh-chip:0 3px 0 var(--p3d-gold-solid);--mna-sh-dock:0 -8px 24px var(--p3d-sh);--mna-sh-ink:0 3px 0 var(--p3d-ink);--mna-sh-down:0 1px 0 var(--b3-p);--mna-sh-off:0 4px 0 var(--b3-p);}
html.papyrus3d .mna-sheet.trp-dockpanel{background:radial-gradient(120% 80% at 50% 0%,var(--p3d-paper-hi),var(--p3d-paper));background-blend-mode:normal;
  border:0;border-top:2.5px solid var(--p3d-ink);border-image:none;border-radius:16px 16px 0 0;box-shadow:var(--mna-sh-dock);touch-action:pan-y;}
@media (min-width:1024px){
  html.papyrus3d .mna-sheet.trp-dockpanel{border:2.5px solid var(--p3d-ink);border-radius:16px;box-shadow:var(--p3d-pera);}
}
html.papyrus3d .mna-title{font-family:'LT Museum',serif;font-weight:400;font-size:20px;line-height:1.15;letter-spacing:0;text-transform:none;color:var(--p3d-ink) !important;} /* písmo: nadpis */
html.papyrus3d .mna-title-kind{font-weight:400;opacity:1;color:var(--mn-tint);}
html.papyrus3d .mna-scroll{gap:8px;padding-top:8px;}
/* Hrubší šat je o pár riadkov vyšší — najvyšší stav (kliešť + okruh) by pri strope 420 px skroloval,
   čo lock z 22. 8. zakazuje. Rásť je menšie zlo než rezať (viď 33vh vyššie). */
@media (max-width:${we}px){html.papyrus3d .mna-sheet{max-height:min(82vh,500px);}}
/* Druhy = papierové pilulky 3D; vybraná je stlačená a nesie tint skupiny (inline výplň). */
html.papyrus3d .mna-sheet .mnk-grid--row{gap:8px;margin-top:0;}
/* Pás pilulek skroluje vodorovne a orezal by im spodnú peru (3 px) aj stlačenie — rezerva dole. */
html.papyrus3d .mna-sheet .mnk-grid--rail{padding:4px 4px 8px;}
html.papyrus3d .mna-sheet .mnk-tile{gap:8px;padding:4px 12px 4px 4px;border:2.5px solid var(--p3d-ink) !important;border-radius:999px;background:var(--p3d-card);box-shadow:var(--mna-sh-chip);transform:none;}
html.papyrus3d .mna-sheet .mnk-tile:hover{transform:none;}
html.papyrus3d .mna-sheet .mnk-tile.on{transform:translateY(3px);box-shadow:var(--mna-sh-chipon);}
html.papyrus3d .mna-sheet .mnk-tile .kg-sticker{width:28px;height:28px;}
html.papyrus3d .mna-sheet .mnk-tile em{font-family:${f};font-weight:600;font-size:14px;color:var(--p3d-ink);}
html.papyrus3d .mna-body{margin-top:0;min-height:56px;padding:8px 16px;border:2.5px solid var(--p3d-ink);border-radius:16px;background:var(--p3d-paper-hi);box-shadow:var(--p3d-inset);color:var(--p3d-ink);}
html.papyrus3d .mna-body:focus{border-color:var(--p3d-ink);box-shadow:var(--mna-sh-focus);}
html.papyrus3d .mna-body::placeholder{color:color-mix(in srgb,var(--p3d-ink) 50%,var(--p3d-paper));opacity:1;}
/* Prepínače (bod/okruh, zadarmo/platené, výskyt/choroba) = žľab pk-p3d-sw, výber lapis. */
html.papyrus3d .mna-paid,html.papyrus3d .mna-radius-switch,html.papyrus3d .mna-tick-switch{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;margin-top:0;padding:4px;border-radius:16px;border:2.5px solid var(--p3d-ink);background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--p3d-inset);}
html.papyrus3d .mna-radius-switch{flex:1 1 auto;}
html.papyrus3d .mna-opt,html.papyrus3d .mna-radius-switch .mna-opt,html.papyrus3d .mna-tick-switch .mna-opt{min-height:36px;padding:4px 8px;border:2.5px solid transparent;border-radius:12px;background:none;color:var(--p3d-ink);font-family:${f};font-weight:600;font-size:14px;letter-spacing:0;}
html.papyrus3d .mna-opt.on,html.papyrus3d .mna-radius-switch .mna-opt.on{color:#EFD79A;background:linear-gradient(180deg,color-mix(in srgb,#16307A 72%,white),#0A1A4A);border-color:#EFD79A;box-shadow:var(--mna-sh-lapis);}
html.papyrus3d .mna-opt--sight.on{color:#fff;background:${fe};border-color:var(--p3d-ink);box-shadow:var(--mna-sh-ink);}
html.papyrus3d .mna-opt--ill.on{color:#fff;background:${I};border-color:var(--p3d-ink);box-shadow:var(--mna-sh-ink);}
html.papyrus3d .mna-tick{margin-top:0;gap:8px;}
html.papyrus3d .mna-select{min-height:48px;padding:8px 12px;border:2.5px solid var(--p3d-ink);border-radius:16px;background:var(--p3d-paper-hi);color:var(--p3d-ink);font-size:14px;box-shadow:var(--p3d-inset);}
/* Rozsah: štítok + hodnota, pod nimi hrubá dráha a veľký palec (prst ho trafí). */
html.papyrus3d .mna-radius{margin-top:0;}
html.papyrus3d .mna-radius-head{gap:12px;}
html.papyrus3d .mna-radius-label{font-size:12px;font-weight:600;color:color-mix(in srgb,var(--p3d-ink) 62%,var(--p3d-paper));}
html.papyrus3d .mna-radius-val{font-size:16px;color:var(--p3d-ink);}
html.papyrus3d .mna-range{height:36px;margin:0;}
html.papyrus3d .mna-range::-webkit-slider-runnable-track{height:12px;border-radius:999px;background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--mna-sh-track);}
html.papyrus3d .mna-range::-moz-range-track{height:12px;border-radius:999px;background:color-mix(in srgb,var(--p3d-gold) 34%,var(--p3d-paper));box-shadow:var(--mna-sh-trackff);}
html.papyrus3d .mna-range::-webkit-slider-thumb{width:32px;height:32px;margin-top:-10px;border:3px solid var(--p3d-ink);background:var(--mn-tint,var(--p3d-gold));box-shadow:var(--mna-sh-thumb);}
html.papyrus3d .mna-range::-moz-range-thumb{width:28px;height:28px;border:3px solid var(--p3d-ink);background:var(--mn-tint,var(--p3d-gold));box-shadow:var(--mna-sh-ink);}
html.papyrus3d .mna-radius-note,html.papyrus3d .mna-sheet .mna-radius-note{margin:4px 0 0;font-size:12px;color:color-mix(in srgb,var(--p3d-ink) 62%,var(--p3d-paper));}
html.papyrus3d .mna-pinned{color:color-mix(in srgb,var(--p3d-ink) 62%,var(--p3d-paper));}
html.papyrus3d .mna-poison{color:var(--p3d-ink);}
html.papyrus3d .mna-actions{gap:12px;margin-top:12px;}
html.papyrus3d .mna-hint{font-size:12px;color:color-mix(in srgb,var(--p3d-ink) 62%,var(--p3d-paper));}
html.papyrus3d .mna-hint--ok{color:${B.comment};}
html.papyrus3d .mna-hint--ok i{width:20px;height:20px;font-size:12px;color:#fff;border:2px solid var(--p3d-ink);box-sizing:border-box;}
html.papyrus3d .mna-submit.btn-gold{--b3-a:color-mix(in srgb,${z.edge} 72%,white);--b3-b:${z.deep};--b3-p:color-mix(in srgb,${z.deep} 60%,black);
  box-sizing:border-box;min-height:56px;padding:0 16px;border:2.5px solid ${z.ink};border-radius:16px;background:linear-gradient(180deg,var(--b3-a),var(--b3-b));color:${z.ink};
  box-shadow:var(--mna-sh-cta);
  font-family:'LT Museum',serif;font-weight:400;font-size:20px;letter-spacing:0;text-transform:none;} /* písmo: cta */
html.papyrus3d .mna-submit.btn-gold:hover:not(:disabled){background:linear-gradient(180deg,var(--b3-a),var(--b3-b));}
html.papyrus3d .mna-submit.btn-gold:active:not(:disabled){transform:translateY(3px);box-shadow:var(--mna-sh-down);}
html.papyrus3d .mna-submit.btn-gold:disabled{opacity:.55;box-shadow:var(--mna-sh-off);}
`}
`,ta=16,fo=600,yo=10;function pn(a,n,{onPoint:t,onTooFar:r},l=ta){const s=m.useRef({onPoint:t,onTooFar:r});s.current={onPoint:t,onTooFar:r},m.useEffect(()=>{if(!a||!n)return;const i=a.getContainer();let b=null,c=0,v=0,y=!1;const p=()=>{b!==null&&(window.clearTimeout(b),b=null),y=!1,i.classList.remove("mn-holding")},k=(h,N)=>{p(),y=!0,c=h,v=N,i.classList.add("mn-holding"),b=window.setTimeout(()=>{var C,J;if(b=null,!y)return;y=!1,i.classList.remove("mn-holding");const V=i.getBoundingClientRect(),K=c-V.left,_=v-V.top;if(a.getZoom()<l){(J=(C=s.current).onTooFar)==null||J.call(C,K,_);return}const T=a.containerPointToLatLng([K,_]);s.current.onPoint(T.lat,T.lng)},fo)},x=(h,N)=>{y&&Math.hypot(h-c,N-v)>yo&&p()},u=h=>{if(h.touches.length!==1){p();return}const N=h.touches[0];k(N.clientX,N.clientY)},S=h=>{if(h.touches.length!==1){p();return}const N=h.touches[0];x(N.clientX,N.clientY)},A=h=>{h.button===0&&k(h.clientX,h.clientY)},j=h=>x(h.clientX,h.clientY),$=h=>{var T,C;h.preventDefault(),p();const N=i.getBoundingClientRect(),V=h.clientX-N.left,K=h.clientY-N.top;if(a.getZoom()<l){(C=(T=s.current).onTooFar)==null||C.call(T,V,K);return}const _=a.containerPointToLatLng([V,K]);s.current.onPoint(_.lat,_.lng)},P=()=>i.classList.toggle("mn-armed",a.getZoom()>=l);return P(),a.on("zoomend",P),i.addEventListener("touchstart",u,{passive:!0}),i.addEventListener("touchmove",S,{passive:!0}),i.addEventListener("touchend",p),i.addEventListener("touchcancel",p),i.addEventListener("mousedown",A),i.addEventListener("mousemove",j),i.addEventListener("mouseup",p),i.addEventListener("mouseleave",p),i.addEventListener("contextmenu",$),a.on("movestart zoomstart",p),()=>{p(),i.classList.remove("mn-armed"),a.off("zoomend",P),i.removeEventListener("touchstart",u),i.removeEventListener("touchmove",S),i.removeEventListener("touchend",p),i.removeEventListener("touchcancel",p),i.removeEventListener("mousedown",A),i.removeEventListener("mousemove",j),i.removeEventListener("mouseup",p),i.removeEventListener("mouseleave",p),i.removeEventListener("contextmenu",$),a.off("movestart zoomstart",p)}},[a,n,l])}const dn=`
/* ── ŠTVRTÁ VEC, BEZ KTOREJ TO NA MOBILE „BLBNE" (Matej 2026-08-22) ──────────
   „keď na mobile podržím tak mi zobrazí možnosť kopírovania… označí ako keby
   texty v tej oblasti."

   contextmenu preventDefault (bod 2 v hlavičke) zastaví MENU, ale NIE výber
   textu. To je na mobile samostatné správanie: dlhé podržanie nad DOM prvkom
   s textom spustí označovanie a vytiahne panel Kopírovať/Zdieľať. Na dlaždice
   to nesadne (sú to obrázky), ale mapa je nimi pokrytá len zdanlivo — nad nimi
   ležia značky svorky, zhluky s číslami a pilulky „104 km", a tie text majú.
   Preto sa gesto raz chytí a raz z neho vyskočí označený text; závisí to od
   toho, o koľko pixelov vedľa prst pristál.

   Výber sa preto v mape vypína celoplošne — na mape aj tak nie je čo označovať.
   ⚠️ Výnimka je bublina (.leaflet-popup): tam text JE a človek ho môže chcieť
   skopírovať, takže tú vraciame späť.
   -webkit-touch-callout je iOS-only a rieši panel „Kopírovať/Zdieľať" aj
   v prípadoch, keď sa výber sám nespustí. */
.leaflet-container{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}
.leaflet-container .leaflet-popup{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default;}
.leaflet-container.mn-armed{cursor:default;}
.leaflet-container.mn-holding{cursor:progress;}
/* Režim „ukáž miesto" — typ je vybraný a čaká sa na jediný klik. Zameriavač je
   tu na mieste (na rozdiel od stavu vyššie): mapa v tej chvíli neposúva, ale
   MIERI. */
.leaflet-container.mn-placing{cursor:crosshair;}
/* Pri mierení sú vrstvy PRIECHODNÉ (15. 10. 2026): pilulka „7,9 km", štart výletu aj čiara
   klik zhltli a parkovisko — ktoré sa kladie práve pri štarte — sa nedalo položiť. */
.leaflet-container.mn-placing .leaflet-interactive{pointer-events:none !important;}
`;function cn(a,n,{onPoint:t,onTooFar:r},l=ta){const s=m.useRef({onPoint:t,onTooFar:r});s.current={onPoint:t,onTooFar:r},m.useEffect(()=>{if(!a||!n)return;const i=a.getContainer();i.classList.add("mn-placing");const b=c=>{var v,y;if(a.getZoom()<l){(y=(v=s.current).onTooFar)==null||y.call(v,c.containerPoint.x,c.containerPoint.y);return}s.current.onPoint(c.latlng.lat,c.latlng.lng)};return a.on("click",b),()=>{i.classList.remove("mn-placing"),a.off("click",b)}},[a,n,l])}export{na as A,ea as C,qo as G,dn as L,on as M,Ho as P,Xo as T,Qo as U,cn as a,Wo as b,Zo as c,Jo as d,an as e,Yo as f,tn as g,ln as h,sn as i,rn as j,ta as k,nn as l,pn as m,oa as n,go as o,ho as p,xo as q,Go as u,en as w};
