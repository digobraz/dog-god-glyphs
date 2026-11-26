import{u as L,g as M,r as l,j as a,aN as V,b as s,a_ as C,a1 as D,a0 as x,L as v,s as o,m as y,v as j,aU as R,V as _,ax as U}from"./index-DriUOdZL.js";import{a as w}from"./wizAnchors-DjShJff8.js";import{N as Y,a as J}from"./NotePalette-DIRH0EOT.js";import{F as B}from"./markEmoji-Cy-_bP1S.js";import{p as Z,i as F}from"./PackLayout-B9RT_jMa.js";import{P as h}from"./tripPoints-C3j2SdgA.js";import{S as G}from"./SysIcon-CI9hudiL.js";import{R as W}from"./RightGate-BEa7gj1s.js";import"./mapNotesData-Bn_974z0.js";import"./client-_yx8AKEw.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./hasSession-ns-zlIq6.js";import"./deviceCopy-J10wrLU1.js";import"./devMockDogs-EBvAGSAt.js";import"./magnetPreview-DJ5RPtvA.js";import"./ainubis-head-g4iOYlxZ.js";import"./chataNahlad-BvQ_JlDS.js";import"./cloudinaryService-CiRx-3N_.js";import"./packTiers-D4RAcaEl.js";import"./countryGeo-BNEVCU3g.js";import"./PackTopRow-BfpkT1yr.js";import"./BrandIcon-lowQpHlA.js";import"./ThinArrow-DxkNjmlF.js";import"./HandIcons-BI9sYdb3.js";import"./handArrowLeft-CBfp0fHd.js";import"./MomentHost-D9oSu3w3.js";import"./BackButton-8pSTwsJq.js";import"./sharedFetch-CweRO2Vz.js";import"./dogRights-CDnPOjZG.js";import"./pawmateRights-By9TfO0S.js";import"./dogSlug-CB23gDR2.js";import"./addTripModel-DwkYC9MX.js";import"./feedData-DmTwWPGV.js";import"./photoIntake-EOawjgPq.js";import"./consent-Dhof2q2u.js";import"./ainubisSheet-BR3ZiSMH.js";import"./useSheetSwipe-Ch0ng1WW.js";import"./sosNoPhoto-igLPGupO.js";import"./sos-0Lw8ugiB.js";import"./use-toast-CKCh4Cay.js";import"./shareFile-CghX9Llh.js";import"./breeds-DONRU28-.js";import"./sosP3d-BGksLPbc.js";import"./vaultScrolls-DnI3miNU.js";import"./circles-AGJD0c_9.js";import"./TermsGate-BuR57-OJ.js";import"./cardDraft--JJQVDkL.js";import"./sysSwap-DJ_4p3cJ.js";import"./labTheme-DLctEqJ2.js";import"./humanPrefs-B9ECa3kp.js";const H=[{kind:"trip",emoji:"🥾",titleKey:"pack.addTrip.entry.kind.trip.title",textKey:"pack.addTrip.entry.kind.trip.text",points:h.add,right:["trips.log","trips.draw"]},{kind:"wish",emoji:"🎯",titleKey:"pack.addTrip.entry.kind.wish.title",textKey:"pack.addTrip.entry.kind.wish.text",right:"social"},{kind:"event",emoji:"📣",titleKey:"pack.addTrip.entry.kind.event.title",textKey:"pack.addTrip.entry.kind.event.text",points:h.event,right:"social"},{kind:"note",emoji:"💬",titleKey:"pack.addTrip.entry.kind.note.title",textKey:"pack.addTrip.entry.kind.note.text",points:h.note,right:"map.notes"}],X={devotion:"🐾",trip:"🥾",wish:"🎯",sniffer:"👃",note:"💬",event:"📣",service:"🏥",article:"📕",diary:"✍️",photo:"📷",post:"🖼️",story:"✨",album:"🗂️",chat:"🤖",podcast:"🎧",brain:"📥",board:"❓",dm:"💌",group:"👪"},q={devotion:"✅",post:"📸"},Q=r=>q[r]||X[r],tt={devotion:"pridaj-den",post:"pridaj-post",trip:"pridaj-vylet",sniffer:"pridaj-sniffer",wish:"pridaj-tripwish",note:"pridaj-odkaz",event:"pridaj-podujatie",chat:"pridaj-chat",podcast:"pridaj-podcast",photo:"foto"},N=({id:r})=>{const n=tt[r];return a.jsx("span",{className:"att-entry-emoji","aria-hidden":"true",style:n?{width:32}:void 0,children:n?a.jsx(G,{name:n,size:32}):Q(r)})},at=Object.fromEntries(H.map(r=>[r.kind,r])),et={DOMOV:"What are you adding?",VON:"Add to the map",JA:"Write it down for your dog",AINUBIS:"Add to what you know",GLOBAL:"Add"},rt=[{origin:"own",emoji:"🎃",titleKey:"pack.addTrip.entry.event.own.title",textKey:"pack.addTrip.entry.event.own.text"},{origin:"tip",emoji:"🔗",titleKey:"pack.addTrip.entry.event.tip.title",textKey:"pack.addTrip.entry.event.tip.text"}];function ea({onPick:r,onClose:n,place:m,onCreate:u,startAt:E,noteBlocked:T}){const p=L(),P=M(),b=(t,e)=>{const i=p(t);return i===t?e:i},[c,z]=l.useState(E??"kind"),O=l.useMemo(()=>Z(m),[m]),[k,g]=l.useState(0),d=l.useRef(null),A=t=>{d.current={y:t.clientY,t:t.timeStamp},t.currentTarget.setPointerCapture(t.pointerId)},S=t=>{d.current&&g(Math.max(0,t.clientY-d.current.y))},f=t=>{const e=d.current;if(d.current=null,!e)return;const i=t.clientY-e.y,$=Math.max(1,t.timeStamp-e.t);if(i>96||i/$>.6){n();return}g(0)};l.useEffect(()=>{const t=e=>{e.key==="Escape"&&n()};return document.addEventListener("keydown",t),()=>document.removeEventListener("keydown",t)},[n]);const I=t=>a.jsx(W,{right:t.right??"trips.log",children:a.jsxs("button",{type:"button",className:"att-entry-row",onClick:()=>{t.kind==="trip"&&(U("pack_trip_add_start"),r({kind:"trip",state:"walked"})),t.kind==="wish"&&r({kind:"wish"}),t.kind==="event"&&r({kind:"event",origin:"own"}),t.kind==="note"&&z("note")},children:[a.jsx(N,{id:t.kind}),a.jsx("span",{className:"att-entry-title",children:p(t.kind==="trip"||t.kind==="event"?`pack.addTrip.entry.kind.${t.kind}.titleApp`:t.titleKey)}),!!t.points&&a.jsx("span",{className:"att-entry-pts",children:t.kind==="event"?p("pack.addTrip.entry.eventPts",{n:t.points}):a.jsxs(a.Fragment,{children:["+",p(`pack.points.unit.${t.points===1?"one":t.points<5?"few":"many"}`,{n:t.points})]})})]})},t.kind),K=t=>{t.id;const e=F(t);return a.jsxs("button",{type:"button","data-create-id":t.id,className:`att-entry-row${e?"":" att-entry-row--soon"}`,disabled:!e,"aria-disabled":!e,onClick:()=>{if(e){if(t.target.kind==="route"){n(),P(t.target.path);return}u==null||u(t)}},children:[a.jsx(N,{id:t.id}),a.jsx("span",{className:"att-entry-title",children:b(t.labelKey,t.labelFallback)}),t.id==="podcast"&&w()&&a.jsx("span",{className:"att-entry-num",children:w()})]},t.id)};return a.jsxs("div",{className:"att-entry-backdrop",onClick:n,role:"button",tabIndex:-1,"aria-label":p("pack.addTrip.entry.closeAriaLabel"),children:[a.jsx("style",{children:nt}),c==="note"&&a.jsx("style",{children:Y}),a.jsxs("div",{className:"att-entry-panel",role:"dialog","aria-modal":"true",onClick:t=>t.stopPropagation(),style:k?{transform:window.innerWidth<768?`translateY(${k}px)`:`translate(-50%, ${k}px)`,transition:"none",animation:"none"}:void 0,children:[a.jsx("span",{className:"att-entry-grab","aria-hidden":!0,onPointerDown:A,onPointerMove:S,onPointerUp:f,onPointerCancel:f,children:a.jsx("span",{className:"pk-grab",style:{margin:"0 auto"}})}),c==="kind"&&a.jsx("div",{className:"att-entry-reg",role:"group","aria-label":b(`pack.create.title.${m}`,et[m]),children:O.map(t=>a.jsx("div",{className:"att-entry-grp",children:a.jsx("div",{className:"att-entry-list",children:t.items.map(e=>{e.id==="event"&&!R||e.id;const i=at[e.id];return i?I(i):K(e)})})},t.group??"_"))}),c==="note"&&a.jsx("div",{className:"att-entry-note",children:a.jsx(J,{onPick:t=>r({kind:"note",group:t}),blocked:T})}),c==="event"&&a.jsx("div",{className:"att-entry-list",children:rt.map(t=>a.jsxs("button",{type:"button",className:"att-entry-row",onClick:()=>r({kind:"event",origin:t.origin}),children:[a.jsx("span",{className:"att-entry-emoji","aria-hidden":"true",children:t.emoji}),a.jsx("span",{className:"att-entry-title",children:p(t.titleKey)})]},t.origin))})]})]})}const nt=`
${V}
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
.att-entry-panel{${_()}
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
.att-entry-row{position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:${s.cardGrad};border:1px solid ${s.cardEdge};border-radius:${C}px;padding:8px 12px;cursor:pointer;transition:border-color .15s ease,background .15s ease;}
.att-entry-row:hover,.att-entry-row:focus-visible{border-color:${s.inkWarm};outline:none;}
/* Emoji má vlastný font-family, inak naň sadne zdedený Cinzel a na Windows sa z 🅿️ stane
   obdĺžnik. Pevná šírka drží názvy pod sebou v jednej zvislej osi. */
.att-entry-emoji{flex:0 0 auto;width:28px;font-family:${B};font-size:24px;line-height:1;text-align:center;}
.att-entry-title{flex:1 1 auto;min-width:0;font-family:${D};font-weight:700;font-size:14px;letter-spacing:0.02em;text-transform:uppercase;color:${s.inkStrong};
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.att-entry-num{flex:none;font-family:${x};font-weight:600;font-size:14px;font-variant-numeric:tabular-nums;color:${s.inkWarm};}
/* ⚠️ NÁZOV JE VŽDY NA JEDEN RIADOK (Matej 22. 9.: „nezalamuj texty… musia byť vždy na jeden
   riadok"). Panel má šírku lišty (~310 px na PC), preto termín „čoskoro" nestojí vedľa
   názvu, ale ako ŠTÍTOK NA HORNEJ HRANE riadku — šírku názvu nezje. Tri tečky sú len
   poistka pre budúci dlhší preklad, nie plán. */
/* BODY V LAPISOVEJ PILULKE (Matej 26. 8.: „body budú v modrom pilse") — odmena je „moje". */
.att-entry-pts{flex:0 0 auto;padding:4px 8px;border-radius:999px;background:${v.grad};border:1px solid ${v.deep};font-family:${x};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;white-space:nowrap;color:${v.ink};}
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
.att-entry-note .np-wrap--blocks .np-item{flex:0 0 auto;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;column-gap:12px;row-gap:4px;padding:8px 12px;}
/* Veta pod názvom (Matej 23. 11. 2026) — emoji cez oba riadky vľavo, názov a veta vedľa neho. */
.att-entry-note .np-wrap--blocks .np-item .np-mark{grid-row:1 / span 2;}
.att-entry-note .np-wrap--blocks .np-item .np-name{grid-column:2;white-space:normal;}
.att-entry-note .np-wrap--blocks .np-item .np-text{display:block;grid-column:2;}
.att-entry-lead{margin:0 0 12px;font-family:${x};font-size:12px;line-height:1.5;color:${s.inkWarm};}

/* ── MOBIL: ÚCHYT NAD ZOZNAMOM (Matej 21. 9. 2026) ────────────────────────────────────
   „drop down, ktorý by mal hore možnosť ho stiahnuť dolu". Poloha a šírka sú tie isté
   ako na PC — bar lišty je na telefóne takmer cez celé okno, panel s ním.
   ⚠️ env(safe-area-inset-bottom) tu netreba: panel stojí NAD lištou, nie na hrane okna. */
@media (max-width:640px){
  .att-entry-panel{padding:4px 12px 12px;}
  .att-entry-grab{display:block;width:100%;padding:8px 0 8px;background:none;border:0;cursor:grab;touch-action:none;}
  .att-entry-grab:active{cursor:grabbing;}
}
/* ŠAT PAPYRUS 3D (hárok I1, I2): riadok panela = papierové tlačidlo 3D, názov v Museu. Zostáva emoji alebo kresba + názov,
   bez podnadpisov a bez scrollu (lock architektura-pack). Pero 6 px berie medzera medzi riadkami. */
html.papyrus3d .att-entry-list{gap:${o.lg}px;}
html.papyrus3d .att-entry-grp + .att-entry-grp{margin-top:${o.lg}px;}
html.papyrus3d .att-entry-row{min-height:56px;padding:0 ${o.lg}px;gap:${o.lg}px;border:2.5px solid var(--p3d-ink);border-radius:${y.card}px;background:var(--p3d-card);box-shadow:var(--p3d-b3);
  transition:transform .07s,box-shadow .07s;}
html.papyrus3d .att-entry-row:hover,html.papyrus3d .att-entry-row:focus-visible{border-color:var(--p3d-ink);}
html.papyrus3d .att-entry-row:active{transform:translateY(5px);box-shadow:inset 0 2px 0 color-mix(in srgb,white 55%,transparent),0 1px 0 var(--p3d-gold-solid);}
html.papyrus3d .att-entry-title{font-family:'LT Museum',serif;font-weight:400;font-size:${j.h2}px;letter-spacing:0;text-transform:none;color:var(--p3d-ink);} /* písmo: cta */
@media (max-width:374px){html.papyrus3d .att-entry-title{font-size:${j.body}px;}}
html.papyrus3d .att-entry-panel{padding-bottom:${o.lg}px;}
/* RÁM PANELA = ŠUPLÍK Z HÁRKU (I1, I2; Matej 11. 11. 2026: „na bledom pozadí je ten panel ešte starý — zlaté okraje, kameň“).
   Zlatý odliatok goldFrameCSS() je web. V appke: papierový plášť so zlatým vrchom, ten istý ako POPUP (.ppu-sheet). */
html.papyrus3d .att-entry-backdrop{background:color-mix(in srgb,var(--p3d-ink) 55%,transparent);}
html.papyrus3d .att-entry-panel{background:var(--p3d-card);border:2.5px solid var(--p3d-ink);border-top:6px solid var(--p3d-gold);border-radius:${y.card}px;
  box-shadow:0 -3px 0 var(--p3d-ink),0 12px 20px var(--p3d-sh);}
html.papyrus3d .att-entry-panel::before,html.papyrus3d .att-entry-panel::after{content:none;}
@media (max-width:767px){
  html.papyrus3d .att-entry-panel{left:0;right:0;bottom:0;width:auto;max-height:88dvh;transform:none;border-width:6px 0 0;
    border-radius:${y.card}px ${y.card}px 0 0;box-shadow:0 -3px 0 var(--p3d-ink),0 -12px 20px var(--p3d-sh);
    padding:${o.xs}px ${o.lg}px calc(env(safe-area-inset-bottom,0px) + ${o.xl}px);animation:att-sheet-up .3s cubic-bezier(.2,.8,.2,1);}
  html.papyrus3d .att-entry-grab{display:block;width:100%;padding:${o.sm}px 0;background:none;border:0;cursor:grab;touch-action:none;}
}
@keyframes att-sheet-up{from{transform:translateY(100%);}to{transform:none;}}
`;export{ea as AddTripEntry,Q as createEmoji};
