import{b as x,b1 as g,as as I,V as S,b2 as M,r as i,F as A,d as H}from"./index-DriUOdZL.js";import{l as L}from"./leaflet-DobIbzRN.js";import{F as D}from"./markEmoji-Cy-_bP1S.js";const C=.33,m=899,N=552,ie=`
.trp-dockpanel{
  box-sizing:border-box;
  padding:18px 16px calc(20px + env(safe-area-inset-bottom,0px));
  background:rgba(18,13,7,0.94);backdrop-filter:blur(12px);
  border-top:1px solid ${x.onDarkBorder};
  box-shadow:0 -14px 40px rgba(0,0,0,0.45);
}
/* PEVNÁ VÝŠKA V KROKOCH 1–2. Výška aj strop naraz: samotná height by pri dlhšom obsahu panel
   pretiahla, samotný max-height by ho nechal skákať zdola. */
@media (max-width:${m}px){
  .trp-dockpanel{height:${C*100}vh;max-height:${C*100}vh;}
}
/* PC — plávajúca karta so zaoblením a plným rámom. Bezpečná zóna telefónu tu nemá čo robiť,
   inak má panel nesúmerne hrubú spodnú výplň. */
@media (min-width:1024px){
  .trp-dockpanel{
    border:1px solid ${x.onDarkBorder};border-radius:16px;
    box-shadow:0 18px 48px rgba(0,0,0,0.50);
    padding-bottom:20px;
  }
}
${`
/* ── BLEDÝ SKIN (2026-08-26, mobil doplnený 2026-08-28) ─────────────────────────────────
   Dok je odteraz z toho istého materiálu ako ľavý panel a spodná navigácia — zlatý rám
   okolo pieskovcovej dosky.
   ⚠️ NA MOBILE BEZ RÁMU. Dok tam sedí na spodnej hrane obrazovky cez celú šírku, takže lem
   dokola je zjedený riadok na oboch stranách, nie rám bloku — to isté rozhodnutie, aké
   28. 8. dostala mobilná hlavička aj hostiteľ formulára. Ostáva samotná doska a zlatý pás
   na hornej hrane, teda na tej jedinej, ktorá je naozaj okrajom panela.
   ⚠️ Výplň je PLNÁ, nie priesvitná: panel stojí nad mapou a čokoľvek, čo pod ním prebliká,
   z neho robí neprečítateľnú plochu (feedback_priesvitna_plocha_nad_mapou). Zároveň sa tým
   ruší backdrop-filter — rozmazané pozadie je tá istá chyba len inak.
   ⚠️ TVAR SA TU NEPÍŠE — goldFrameCSS() bez parametrov berie BLOCK (navGoldSkin.ts).
   Dok A formulár sú DVA STAVY JEDNÉHO STĹPCA (kroky 1–2 vs. 3–5), takže každé vlastné číslo
   znamená, že sa pri prechode z kroku 2 do 3 mení rám aj zaoblenie toho istého bloku. Prešlo
   to cez 5/16 („dok je nižší") aj 6/18 („to isté, čo .trp-addhost"); od 26. 8. je zdroj jeden
   a tvar sa preberá, nie opisuje. */
@media (min-width:${g}px){
  .trp-dockpanel{
    ${S()}
    backdrop-filter:none;-webkit-backdrop-filter:none;
    padding-bottom:20px;
  }
}
@media (max-width:${g-1}px){
  /* ⚠️ ZLATO LEN NA HORNEJ HRANE, A CEZ border-image — NIE cez ::before. Panel je zámerne bez
     position (viď hlavičku triedy) a formulár značky si pripútanie k hrane rieši sám, takže
     absolútny potomok by sa pripol k cudziemu predkovi. border-image kreslí ten istý
     gradient, aký má na hornej hrane mobilný filter (.trp-msheet::before v PackMap.tsx) —
     panel prichádza zdola, takže rám má len tam, kde je naozaj okraj.
     ⚠️ Šírku má iba horný lem, takže sa vykreslí len ten; polomer je na mobile nulový, teda
     nemá čo stratiť tým, že border-image zaoblenie ruší. */
  .trp-dockpanel{
    ${M({radius:0})}
    border-top:${I.rim}px solid transparent;
    border-image:linear-gradient(180deg,#FCF0C2,#D8B052) 1;
    box-shadow:0 -18px 50px rgba(0,0,0,0.45);
    backdrop-filter:none;-webkit-backdrop-filter:none;
  }
}
`}
`;function ce(t){const n=typeof window<"u"&&window.innerWidth<=m,[e,o]=T();return n?{paddingTopLeft:[e,150],paddingBottomRight:[o,t+24]}:{paddingTopLeft:[e,130],paddingBottomRight:[o,140]}}function T(){return typeof window<"u"&&window.innerWidth<=m?[24,24]:[N+60,90]}function P(t,n){const e=i.useRef(n);i.useEffect(function(){n!==e.current&&t.attributionControl!=null&&(e.current!=null&&t.attributionControl.removeAttribution(e.current),n!=null&&t.attributionControl.addAttribution(n)),e.current=n},[t,n])}const F=1;function se(t){return Object.freeze({__version:F,map:t})}function V(t,n){return Object.freeze({...t,...n})}const R=i.createContext(null),K=R.Provider;function d(){const t=i.useContext(R);if(t==null)throw new Error("No context provided: useLeafletContext() can only be used in a descendant of <MapContainer>");return t}function j(t){function n(e,o){const{instance:r,context:a}=t(e).current;return i.useImperativeHandle(o,()=>r),e.children==null?null:A.createElement(K,{value:a},e.children)}return i.forwardRef(n)}function X(t){function n(e,o){const[r,a]=i.useState(!1),{instance:c}=t(e,a).current;i.useImperativeHandle(o,()=>c),i.useEffect(function(){r&&c.update()},[c,r,e.children]);const s=c._contentNode;return s?H.createPortal(e.children,s):null}return i.forwardRef(n)}function w(t){function n(e,o){const{instance:r}=t(e).current;return i.useImperativeHandle(o,()=>r),null}return i.forwardRef(n)}function B(t){return function(e){const o=d(),r=t(e,o),{instance:a}=r.current,c=i.useRef(e.position),{position:s}=e;return i.useEffect(function(){return a.addTo(o.map),function(){a.remove()}},[o.map,a]),i.useEffect(function(){s!=null&&s!==c.current&&(a.setPosition(s),c.current=s)},[a,s]),r}}function k(t,n){const e=i.useRef();i.useEffect(function(){return n!=null&&t.instance.on(n),e.current=n,function(){e.current!=null&&t.instance.off(e.current),e.current=null}},[t,n])}function b(t,n){const e=t.pane??n.pane;return e?{...t,pane:e}:t}function W(t,n){return function(o,r){const a=d(),c=t(b(o,a),a);return P(a.map,o.attribution),k(c.current,o.eventHandlers),n(c.current,a,o,r),c}}function h(t,n,e){return Object.freeze({instance:t,context:n,container:e})}function f(t,n){return n==null?function(o,r){const a=i.useRef();return a.current||(a.current=t(o,r)),a}:function(o,r){const a=i.useRef();a.current||(a.current=t(o,r));const c=i.useRef(o),{instance:s}=a.current;return i.useEffect(function(){c.current!==o&&(n(s,o,c.current),c.current=o)},[s,o,r]),a}}function _(t,n){i.useEffect(function(){return(n.layerContainer??n.map).addLayer(t.instance),function(){var a;(a=n.layerContainer)==null||a.removeLayer(t.instance),n.map.removeLayer(t.instance)}},[n,t])}function $(t){return function(e){const o=d(),r=t(b(e,o),o);return P(o.map,e.attribution),k(r.current,e.eventHandlers),_(r.current,o),r}}function J(t,n){const e=i.useRef();i.useEffect(function(){if(n.pathOptions!==e.current){const r=n.pathOptions??{};t.instance.setStyle(r),e.current=r}},[t,n])}function Z(t){return function(e){const o=d(),r=t(b(e,o),o);return k(r.current,e.eventHandlers),_(r.current,o),J(r.current,e),r}}function ue(t){function n(r,a){return h(t(r),a)}const e=f(n),o=B(e);return w(o)}function U(t,n){const e=f(t,n),o=$(e);return j(o)}function Y(t,n){const e=f(t),o=W(e,n);return X(o)}function le(t,n){const e=f(t,n),o=Z(e);return j(o)}function de(t,n){const e=f(t,n),o=$(e);return w(o)}function G(){return d().map}function fe(t,n){const e=G();return i.useEffect(function(){return e.on(t,n),function(){e.off(t,n)}},[e,t,n]),e}const pe=U(function({position:n,...e},o){const r=new L.Marker(n,e);return h(r,V(o,{overlayContainer:r}))},function(n,e,o){e.position!==o.position&&n.setLatLng(e.position),e.icon!=null&&e.icon!==o.icon&&n.setIcon(e.icon),e.zIndexOffset!=null&&e.zIndexOffset!==o.zIndexOffset&&n.setZIndexOffset(e.zIndexOffset),e.opacity!=null&&e.opacity!==o.opacity&&n.setOpacity(e.opacity),n.dragging!=null&&e.draggable!==o.draggable&&(e.draggable===!0?n.dragging.enable():n.dragging.disable())}),me=Y(function(n,e){const o=new L.Popup(n,e.overlayContainer);return h(o,e)},function(n,e,{position:o},r){i.useEffect(function(){const{instance:c}=n;function s(l){l.popup===c&&(c.update(),r(!0))}function u(l){l.popup===c&&r(!1)}return e.map.on({popupopen:s,popupclose:u}),e.overlayContainer==null?(o!=null&&c.setLatLng(o),c.openOn(e.map)):e.overlayContainer.bindPopup(c),function(){var v;e.map.off({popupopen:s,popupclose:u}),(v=e.overlayContainer)==null||v.unbindPopup(),e.map.removeLayer(c)}},[n,e,r,o])}),z=28,q=16,Q=2.5,y=30,E=24,ee=14,ne=2;function ke(t,n,e=""){return`<div class="mk-circle${e}" style="border-color:${n}"><i>${t}</i></div>`}const O=44,te=3,p=8;function be(t,n,e=""){const o=t?`background-image:url('${encodeURI(t).replace(/'/g,"%27")}');`:"";return`<div class="mk-circle mk-circle--photo${e}" style="border-color:${n};--mk-tip:${n};${o}"></div>`}const he=`
/* Obal L.divIcon — Leaflet mu inak dá biele pozadie a rám. Kruh sa centruje
   CSS transformom, takže iconSize/iconAnchor sa NEUVÁDZAJÚ (rovnaký kontrakt
   ako mn-wrap vo vrstve zápisov). */
.mk-wrap{background:none;border:0;}
.mk-sticker{display:block;width:${y}px;height:${y}px;transform:translate(-50%,-50%);cursor:pointer;transition:transform .15s;-webkit-user-select:none;user-select:none;}
.mk-sticker:hover{transform:translate(-50%,-50%) scale(1.12);}
/* SOS (týranie, Matej 21. 11. 2026: „slovná SOS, na mape bude svietiť“): červená žiara pulzuje, aby výzva o pomoc nesplynula s výstrahami. */
.mk-sticker[src$="/sos.webp"]{animation:mk-sos 1.6s ease-in-out infinite;}
@keyframes mk-sos{0%,100%{filter:drop-shadow(0 0 2px rgba(200,32,47,.7));}50%{filter:drop-shadow(0 0 10px rgba(255,59,31,.95));}}
@media (prefers-reduced-motion:reduce){.mk-sticker[src$="/sos.webp"]{animation:none;filter:drop-shadow(0 0 6px rgba(255,59,31,.9));}}
.mk-circle{position:relative;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease;width:${z}px;height:${z}px;border-radius:999px;background:#FFFFFF;border:${Q}px solid #000;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.45),0 0 0 1px rgba(0,0,0,0.10);}
.mk-circle:hover{transform:translate(-50%,-50%) scale(1.12);}
/* <i> je len nosič, nie kurzíva. Emoji MUSÍ mať vlastný font stack: zdedený Cinzel
   by na Windows sadol na čiernobiely textový variant a z 🎯 by ostal obdĺžnik. */
.mk-circle i{font-style:normal;font-family:${D};font-size:${q}px;line-height:1;-webkit-user-select:none;user-select:none;}
/* VYBRANÁ značka — dvojica so zvýraznenou kartou v paneli. Prstenec vo farbe lemu
   sa dedí z currentColor? NIE — lem je inline, takže prstenec je neutrálne tmavý
   a funguje pod červeným, zeleným aj modrým lemom rovnako. */
.mk-circle--hot{box-shadow:0 0 0 3px rgba(0,0,0,0.35),0 2px 10px rgba(0,0,0,0.6);}
/* BOD ZO SVETA (OSM) — ten istý kruh, o kúsok menší a s tenším lemom. Je to VARIANT,
   nie druhá značka: keby si PoiLayer postavil vlastný kruh, rozišli by sa pri prvej
   zmene presne tak, ako sa 22. 8. rozchádzali hrozba, tip a udalosť. Farbu lemu (hnedú)
   nesie volajúci cez WORLD_RIM, rovnako ako pri všetkých ostatných kruhoch. */
.mk-circle--world{width:${E}px;height:${E}px;border-width:${ne}px;box-shadow:0 1px 2px rgba(0,0,0,0.40),0 0 0 1px rgba(0,0,0,0.08);}
.mk-circle--world i{font-size:${ee}px;}
/* FOTKA PSA (SOS) — ten istý kruh, väčší, s výplňou fotkou a špičkou dole; hrot sedí na súradnici (posun o výšku + špičku). */
.mk-circle--photo{width:${O}px;height:${O}px;border-width:${te}px;background-size:cover;background-position:center;background-repeat:no-repeat;transform:translate(-50%,calc(-100% - ${p+1}px));}
.mk-circle--photo:hover{transform:translate(-50%,calc(-100% - ${p+1}px)) scale(1.08);}
.mk-circle--photo::after{content:'';position:absolute;left:50%;bottom:-${p+1}px;transform:translateX(-50%);border:${p}px solid transparent;border-top-color:var(--mk-tip,#000);border-bottom:0;}
`;export{he as C,N as D,K as L,pe as M,me as P,fe as a,le as b,ke as c,T as d,h as e,V as f,ue as g,be as h,ce as i,se as j,de as k,m as l,C as m,ie as n,G as u,b as w};
