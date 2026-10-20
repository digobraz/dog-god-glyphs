import{u as S,i as A,r as p,j as e,P as d,b4 as K,U as L,L as y,T as g,aw as D,G as V,ap as M}from"./index-7PctGTam.js";import{F as R,N as C,f as U}from"./NotePalette-BOXglX1e.js";import{p as _,i as $}from"./PackLayout-DbvN9q62.js";import{P as k}from"./tripPoints-B8mfj7VK.js";import{R as J}from"./RightGate-D9upYetj.js";import"./mapNotesData-BT8C1Ysp.js";import"./dogEvents-DNw7GPsn.js";import"./devMockDogs-BzGWz4qV.js";import"./magnetPreview-DhLqLXgw.js";import"./ainubisSkin-B7Z96MPq.js";import"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./cloudinaryService-DFfDUqVM.js";import"./dogRights-BxAmrGwt.js";import"./BrandIcon-C4Fdumu_.js";import"./HandIcons-Dh9PgzA0.js";import"./handArrowLeft-BUyUUYuC.js";import"./ainubisBus-BMRzmB2O.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Dyn0GD-G.js";import"./BackButton-DiG140MZ.js";import"./pawmateRights-DJDDFQlT.js";import"./tripShared-DJ5J49O6.js";import"./countryGeo-BaPfaSrG.js";import"./packStore-C-dKFjs1.js";import"./addTripModel-BuQrZHBF.js";import"./wizAnchors-E3ARHgZI.js";import"./consent-28X3-hgX.js";import"./use-toast-CpgRElRJ.js";const Y=[{kind:"trip",emoji:"🐾",titleKey:"pack.addTrip.entry.kind.trip.title",textKey:"pack.addTrip.entry.kind.trip.text",points:k.add,right:["trips.log","trips.draw"]},{kind:"wish",emoji:"🎯",titleKey:"pack.addTrip.entry.kind.wish.title",textKey:"pack.addTrip.entry.kind.wish.text",right:"social"},{kind:"event",emoji:"📣",titleKey:"pack.addTrip.entry.kind.event.title",textKey:"pack.addTrip.entry.kind.event.text",points:k.event,right:"social"},{kind:"note",emoji:"💬",titleKey:"pack.addTrip.entry.kind.note.title",textKey:"pack.addTrip.entry.kind.note.text",points:k.note,right:"map.notes"}],f={trip:"🐾",wish:"🎯",sniffer:"👃",note:"💬",event:"📣",service:"🏥",article:"📕",diary:"✍️",photo:"📷",post:"🖼️",chat:"🤖",brain:"📥",board:"❓",dm:"💌",group:"👪"},B=Object.fromEntries(Y.map(r=>[r.kind,r])),F={DOMOV:"What are you adding?",VON:"Add to the map",JA:"Write it down for your dog",AINUBIS:"Add to what you know",GLOBAL:"Add"},Z=[{origin:"own",emoji:"🎃",titleKey:"pack.addTrip.entry.event.own.title",textKey:"pack.addTrip.entry.event.own.text"},{origin:"tip",emoji:"🔗",titleKey:"pack.addTrip.entry.event.tip.title",textKey:"pack.addTrip.entry.event.tip.text"}];function Tt({onPick:r,onClose:o,place:l,onCreate:m,startAt:j,noteBlocked:N}){const i=S(),T=A(),u=(t,a)=>{const n=i(t);return n===t?a:n},[c,v]=p.useState(j??"kind"),E=p.useMemo(()=>_(l),[l]),[x,b]=p.useState(0),s=p.useRef(null),w=t=>{s.current={y:t.clientY,t:t.timeStamp},t.currentTarget.setPointerCapture(t.pointerId)},O=t=>{s.current&&b(Math.max(0,t.clientY-s.current.y))},h=t=>{const a=s.current;if(s.current=null,!a)return;const n=t.clientY-a.y,I=Math.max(1,t.timeStamp-a.t);if(n>96||n/I>.6){o();return}b(0)};p.useEffect(()=>{const t=a=>{a.key==="Escape"&&o()};return document.addEventListener("keydown",t),()=>document.removeEventListener("keydown",t)},[o]);const P=t=>e.jsx(J,{right:t.right??"trips.log",children:e.jsxs("button",{type:"button",className:"att-entry-row",onClick:()=>{t.kind==="trip"&&(M("pack_trip_add_start"),r({kind:"trip",state:"walked"})),t.kind==="wish"&&r({kind:"wish"}),t.kind==="event"&&v("event"),t.kind==="note"&&v("note")},children:[e.jsx("span",{className:"att-entry-emoji","aria-hidden":"true",children:f[t.kind]}),e.jsx("span",{className:"att-entry-title",children:i(t.titleKey)}),!!t.points&&e.jsx("span",{className:"att-entry-pts",children:t.kind==="event"?i("pack.addTrip.entry.eventPts",{n:t.points}):e.jsxs(e.Fragment,{children:["+",i(`pack.points.unit.${t.points===1?"one":t.points<5?"few":"many"}`,{n:t.points})]})})]})},t.kind),z=t=>{t.id;const a=$(t);return e.jsxs("button",{type:"button",className:`att-entry-row${a?"":" att-entry-row--soon"}`,disabled:!a,"aria-disabled":!a,onClick:()=>{if(a){if(t.target.kind==="route"){o(),T(t.target.path);return}m==null||m(t)}},children:[e.jsx("span",{className:"att-entry-emoji","aria-hidden":"true",children:f[t.id]}),e.jsx("span",{className:"att-entry-title",children:u(t.labelKey,t.labelFallback)})]},t.id)};return e.jsxs("div",{className:"att-entry-backdrop",onClick:o,role:"button",tabIndex:-1,"aria-label":i("pack.addTrip.entry.closeAriaLabel"),children:[e.jsx("style",{children:G}),c==="note"&&e.jsx("style",{children:C}),e.jsxs("div",{className:"att-entry-panel",role:"dialog","aria-modal":"true",onClick:t=>t.stopPropagation(),style:x?{transform:`translate(-50%, ${x}px)`,transition:"none",animation:"none"}:void 0,children:[e.jsx("span",{className:"att-entry-grab","aria-hidden":!0,onPointerDown:w,onPointerMove:O,onPointerUp:h,onPointerCancel:h}),c==="kind"&&e.jsx("div",{className:"att-entry-reg",role:"group","aria-label":u(`pack.create.title.${l}`,F[l]),children:E.map(t=>e.jsx("div",{className:"att-entry-grp",children:e.jsx("div",{className:"att-entry-list",children:t.items.map(a=>{a.id==="event"&&!D||a.id;const n=B[a.id];return n?P(n):z(a)})})},t.group??"_"))}),c==="note"&&e.jsxs("div",{className:"att-entry-note",children:[e.jsx("p",{className:"att-entry-lead",children:i("pack.mapNotes.palette.lead")}),e.jsx(U,{onPick:t=>r({kind:"note",group:t}),blocked:N})]}),c==="event"&&e.jsx("div",{className:"att-entry-list",children:Z.map(t=>e.jsxs("button",{type:"button",className:"att-entry-row",onClick:()=>r({kind:"event",origin:t.origin}),children:[e.jsx("span",{className:"att-entry-emoji","aria-hidden":"true",children:t.emoji}),e.jsx("span",{className:"att-entry-title",children:i(t.titleKey)})]},t.origin))})]})]})}const G=`
/* ══ PANEL + = PAPYRUS VYSUNUTÝ ZO SPODNEJ LIŠTY (Matej 22. 9. 2026) ════════════════════
   „popup pri + na každej obrazovke musí byť bledý štýl a musí sa vysunúť zo spodného navu
    v jeho šírke."
   ⛔ Do 22. 9. bol panel v strede okna (PC) alebo šuplík cez celú šírku (mobil) a bledý
      bol LEN na mape — PackMap ho prebíjal s predponou .trp-root, inde svietilo čierne sklo.
      Šat aj poloha sú odteraz TU a nikde inde.
   · ŠÍRKA = šírka baru lišty (--pack-nav-half × 2, publikuje PackLayout), PC aj mobil.
   · POLOHA = tesne nad barom: odstup baru od spodku + jeho výška + výčnelok kotúča „+“
     (--pack-medal-rise) + medzera. Vysúva sa zdola, akoby vyšiel z lišty.
   · ŠAT = zlatý odliatok goldFrameCSS() — TEN ISTÝ zdroj ako bar lišty, takže panel
     a lišta sú jeden materiál. Riadky = PODBLOK na papyruse (cardGrad + cardEdge).
   🔴 Z-INDEX 1300: na mape má pilulka ZOZNAM 900 a peek bublina 1200 (21. 9. 2026). */
.att-entry-backdrop{position:fixed;inset:0;z-index:1300;background:rgba(24,14,4,0.45);}
/* AINUBIS USTÚPI, KÝM JE PANEL OTVORENÝ (Matej 3. 10. 2026, hárok rozhodnutí — variant A):
   na mobile sedel na rohu panela a prekrýval poslednú položku. Panel je chvíľka úlohy,
   AINUBIS v nej nemá čo robiť; po zatvorení sa vráti. Precedens: VaultWall/VaultChat. */
body:has(.att-entry-backdrop) .ainubis-launcher{visibility:hidden;pointer-events:none;}
/* ⚠️ goldFrameCSS() STOJÍ PRVÝ — nesie position:relative a za position:fixed by ho prebil. */
.att-entry-panel{${V()}
  position:fixed;left:var(--pack-nav-cx, 50%);transform:translateX(-50%);
  --att-gap:calc(var(--pack-nav-bottom, 12px) + var(--pack-nav-h, 64px) + var(--pack-medal-rise, 0px) + 12px);
  bottom:var(--att-gap);
  width:min(calc(2 * var(--pack-nav-half, 260px)), calc(100vw - 16px));
  max-height:calc(100% - var(--att-gap) - 16px);
  overflow-y:auto;overscroll-behavior:contain;padding:48px 12px 12px;
  animation:att-entry-rise .22s cubic-bezier(.2,.8,.2,1);transition:transform .18s ease;}
@keyframes att-entry-rise{from{opacity:0;transform:translate(-50%,32px);}to{opacity:1;transform:translate(-50%,0);}}
@media (prefers-reduced-motion:reduce){.att-entry-panel{animation:none;}}

/* ── ÚCHYT — len na mobile (ťahom nadol sa panel zavrie). */
.att-entry-grab{display:none;}

/* ── SKUPINY (bez nadpisu a štítkov od 22. 9.) ─────────────────────────────────────────────────────────────
   Jeden krátky riadok, čo sa tu pridáva. Štítok skupiny je LEN na DOMOVE. */
.att-entry-grp + .att-entry-grp{margin-top:12px;}
/* Na prvej úrovni nad tlačidlami nie je nič — úchyt (mobil) alebo rovno prvé tlačidlo. */

/* ── RIADOK PONUKY: EMOJI + NÁZOV, NIČ VIAC (Matej 21. 9. 2026) ──────────────────────
   „priamy, krátky, stručný, bez scrollu… emoji a vedľa text, žiadne vysvetlovačky."
   ⚠️ VÝŠKA RIADKU JE ROZPOČET, NIE VKUS: na DOMOVE je desať položiek a tri hlavičky
   skupín a má sa to vojsť BEZ SCROLLU. Pri 8/4 sa vojde, pixel navyše vyhodí poslednú
   položku pod hranu. */
.att-entry-list{display:flex;flex-direction:column;gap:4px;}
.att-entry-row{position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:${d.cardGrad};border:1px solid ${d.cardEdge};border-radius:${K}px;padding:8px 12px;cursor:pointer;transition:border-color .15s ease,background .15s ease;}
.att-entry-row:hover,.att-entry-row:focus-visible{border-color:${d.inkWarm};outline:none;}
/* Emoji má vlastný font-family, inak naň sadne zdedený Cinzel a na Windows sa z 🅿️ stane
   obdĺžnik. Pevná šírka drží názvy pod sebou v jednej zvislej osi. */
.att-entry-emoji{flex:0 0 auto;width:28px;font-family:${R};font-size:24px;line-height:1;text-align:center;}
.att-entry-title{flex:1 1 auto;min-width:0;font-family:${L};font-weight:700;font-size:14px;letter-spacing:0.02em;text-transform:uppercase;color:${d.inkStrong};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* ⚠️ NÁZOV JE VŽDY NA JEDEN RIADOK (Matej 22. 9.: „nezalamuj texty… musia byť vždy na jeden
   riadok"). Panel má šírku lišty (~310 px na PC), preto termín „čoskoro" nestojí vedľa
   názvu, ale ako ŠTÍTOK NA HORNEJ HRANE riadku — šírku názvu nezje. Tri tečky sú len
   poistka pre budúci dlhší preklad, nie plán. */
/* BODY V LAPISOVEJ PILULKE (Matej 26. 8.: „body budú v modrom pilse") — odmena je „moje". */
.att-entry-pts{flex:0 0 auto;padding:4px 8px;border-radius:999px;background:${y.grad};border:1px solid ${y.deep};font-family:${g};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;color:${y.ink};}
/* Štítok presahuje hornú hranu — medzera nad riadkom so štítkom, aby nesadol na suseda. */

/* ── NÁVRAT V TOKU ───────────────────────────────────────────────────────────────────
   backCircleCSS nesie priemer, lem aj farby (BackButton.tsx, LOCKED 2026-09-01).
   ⚠️ Na PRVEJ úrovni je skrytý: von sa ide klikom vedľa alebo Escape (lock 26. 8.). */
/* Od 5. 10. 2026 šípka nie je na ŽIADNEJ úrovni — horná výplň pre ňu by bola prázdny pás. */
.att-entry-panel{padding-top:16px;}

.att-entry-note{padding-top:4px;}
/* Druhá úroveň má TEN ISTÝ tvar ako prvá — riadok emoji + názov pod sebou (lock panela PLUS:
   bez podnadpisov, bez scrollu). Tri dlaždice vedľa seba sa do šírky navu nezmestili a TIP
   sa na PC orezával (premerané 5. 10. 2026). Vysvetlivka ostáva len zhasnutej voľbe — tam je
   to DÔVOD („výlet už parkovisko má“), nie popis. */
.att-entry-note .np-wrap--blocks{flex-direction:column;gap:8px;}
.att-entry-note .np-wrap--blocks .np-item{flex:0 0 auto;flex-direction:row;align-items:center;flex-wrap:wrap;gap:4px 12px;padding:8px 12px;}
.att-entry-note .np-wrap--blocks .np-item .np-text{display:none;}
.att-entry-note .np-wrap--blocks .np-item--off .np-text{display:block;flex-basis:100%;}
.att-entry-lead{margin:0 0 12px;font-family:${g};font-size:12px;line-height:1.5;color:${d.inkWarm};}

/* ── MOBIL: ÚCHYT NAD ZOZNAMOM (Matej 21. 9. 2026) ────────────────────────────────────
   „drop down, ktorý by mal hore možnosť ho stiahnuť dolu". Poloha a šírka sú tie isté
   ako na PC — bar lišty je na telefóne takmer cez celé okno, panel s ním.
   ⚠️ env(safe-area-inset-bottom) tu netreba: panel stojí NAD lištou, nie na hrane okna. */
@media (max-width:640px){
  .att-entry-panel{padding:4px 12px 12px;}
  .att-entry-grab{display:block;width:100%;padding:8px 0 8px;background:none;border:0;cursor:grab;touch-action:none;}
  .att-entry-grab::before{content:'';display:block;width:44px;height:4px;margin:0 auto;border-radius:999px;background:rgba(179,130,45,0.26);}
  .att-entry-grab:active{cursor:grabbing;}
}
`;export{Tt as AddTripEntry};
