import{aC as y,bb as b,b as ve,a1 as R,a0 as l,Q as xe,bd as fe,r,u as je,g as ye,j as e,O as q,ax as Ne}from"./index-DriUOdZL.js";import{sizedUrl as ze}from"./cloudinaryService-CiRx-3N_.js";import{t as we,M as ee,a as Ee}from"./tripLabel-DkSjsxPv.js";import{d as Se,a as Ae}from"./ainubisSheet-BR3ZiSMH.js";import{B as Ce}from"./BrandIcon-lowQpHlA.js";import{B as ae}from"./BackButton-8pSTwsJq.js";import{S as se}from"./SysIcon-CI9hudiL.js";import{subscribe as Te,markRead as Oe,getConversation as Me,getMe as Pe,setPeerBlocked as Re,sendMessage as Ie,joinGroup as $e,reportContent as te}from"./packMessaging-D_XWx5ij.js";import{R as oe}from"./RightGate-BEa7gj1s.js";import"./MomentHost-D9oSu3w3.js";import"./sharedFetch-CweRO2Vz.js";import"./client-_yx8AKEw.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./dogRights-CDnPOjZG.js";import"./hasSession-ns-zlIq6.js";import"./devMockDogs-EBvAGSAt.js";import"./pawmateRights-By9TfO0S.js";import"./wizAnchors-DjShJff8.js";import"./dogSlug-CB23gDR2.js";import"./countryGeo-BNEVCU3g.js";import"./addTripModel-DwkYC9MX.js";import"./useSheetSwipe-Ch0ng1WW.js";import"./ThinArrow-DxkNjmlF.js";import"./use-toast-CKCh4Cay.js";const u=ve,ne="'Cinzel Decorative', 'Cinzel', serif",re="'Cinzel', serif",ie=`
/* ⚠️ FARBY SÚ PREMENNÉ z msgTheme.ts (.msg-skin). Konkrétna farba napísaná
   sem platí len pre jeden šat a v druhom z nej bude nečitateľné miesto.
   Dvojtriedny selektor (0,2,0) prebije position:relative z .msg-skin bez ohľadu na poradie
   <style> blokov. Pozadie ani tapetu tu nehľadaj — nesie ich .msg-skin. */
.msg-thread.msg-skin{position:fixed;inset:0;z-index:1300;display:flex;flex-direction:column;}
/* Pás nesie POZADIE cez celé okno, stĺpec vnútri nesie OBSAH — a jeho šírka je tá istá,
   akú má telo správ (.msg-thread-body) aj písací panel (.msg-thread-send). */
/* Výška a poloha hlavičky = spoločný rad /pack (28. 10. 2026), rovnako ako .msg-inbox-head. */
.msg-thread-head{position:sticky;top:0;z-index:3;padding:calc(env(safe-area-inset-top,0px) + ${y.top}px) 0 ${y.content-y.top-y.h}px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-thread-headinner{display:flex;align-items:center;gap:12px;min-height:${y.h}px;${b}margin:0 auto;}
.msg-back{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-back:hover{border-color:${u.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* flex:1 + min-width:0 — bez toho dlhý štítok výletu na mobile podlezie ovládania vpravo. */
.msg-thread-headtxt{flex:1 1 auto;min-width:0;}
/* Meno v hlavičke je IDENTITA -> FONT_TITLE (pri psovi Decorative, to rieši inline štýl). */
.msg-thread-title{font-family:${R};font-weight:700;font-size:16px;color:var(--msg-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-thread-sub{font-family:${l};font-size:10px;color:var(--msg-dim);margin-top:2px;}
/* max-width + ellipsis: štítok je jeden riadok (nowrap), takže sa musí dať orezať. */
.msg-tagchip{max-width:100%;overflow:hidden;text-overflow:ellipsis;display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-family:${l};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:var(--msg-chip);border:1px solid var(--msg-btn-edge);color:var(--msg-chip-ink);white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:var(--msg-chip-hot);border-color:${u.cardEdge};}
/* Telo vlákna: bubliny priamo na plochom papyruse, bez dosky. Stĺpec = šírka hlavičky aj písacieho pásu. */
.msg-thread-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:16px 0;${b}margin:0 auto;display:flex;flex-direction:column;position:relative;z-index:2;}
.msg-bubblewrap{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:11px;max-width:82%;}
.msg-bubblewrap.me{align-items:flex-end;align-self:flex-end;}
.msg-bubblerep{background:none;border:none;padding:4px 0 0;margin-left:32px;font-family:${l};font-weight:500;font-size:10px;letter-spacing:0.02em;color:var(--msg-block-ink);opacity:.7;cursor:pointer;text-decoration:underline;text-underline-offset:2px;}
/* FOTKA TOHO, KTO PÍŠE, VEDĽA BUBLINY (Matej 1. 9. 2026: „vedľa bublinky by mala byť
   ikonka fotka"). Cudzia správa má fotku vľavo, moja vpravo — teda na tej strane, kde
   bublina aj stojí; zrkadlí to row-reverse, nie druhá sada pravidiel. */
.msg-bubblerow{display:flex;align-items:flex-end;gap:8px;min-width:0;}
.msg-bubblewrap.me .msg-bubblerow{flex-direction:row-reverse;}
/* Kruh je menší než v inboxe (28 vs 42) — tam je fotka predmetom riadku, tu sprevádza text. */
.msg-bubbleav{flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:linear-gradient(140deg,${u.cardEdge},#A3782B);background-size:cover;background-position:center;border:1px solid ${xe.border};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${l};font-weight:600;font-size:10px;color:${u.card};}
/* Meno odosielateľa sedí nad BUBLINOU, nie nad fotkou — odsadenie = šírka kruhu + medzera. */
.msg-bubble-sender{font-family:${R};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--msg-dim);margin-bottom:3px;padding:0 4px 0 39px;}
/* BUBLINY — Matej 1. 9. 2026: „musia byť výraznejšie tie čo prídu od človeka aj odomňa,
   jedna z nich by mohla byť lapis."
   CUDZIA = svetlý blok s plným zlatým rámom a nadvihnutím (v tmavom šate BLEDÁ plôška
   na čiernom — v oboch prípadoch svetlá, len na inom podklade).
   MOJA = plná farba: v svetlom šate LAPIS so zlatým písmom, v tmavom ORANŽOVOZLATÁ
   s tmavým. Prvé kolo tu malo tint pri 14 %; Matej ho zrušil a má na to dôvod: bublina nie
   je tlačidlo ani výber, je to OBSAH, a v rozhovore musí byť na prvý pohľad vidno, kto hovorí.
   ⚠️ Plná farba tu preto NEZNAMENÁ „moja akcia" ale „môj hlas" — a keďže odosielacie tlačidlo
      má tú istú farbu, čítajú sa ako jedna rodina („ja"), nie ako dve súperiace hlavné veci. */
.msg-bubble{font-family:${l};font-size:12px;line-height:1.5;padding:12px 16px;border-radius:16px;background:var(--msg-block);color:var(--msg-block-ink);border:1px solid var(--msg-block-edge);box-shadow:var(--msg-block-shadow);}
.msg-bubble.me{background:var(--msg-mine);color:var(--msg-mine-ink);border-color:var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);}
.msg-empty{text-align:center;padding:32px 16px;color:var(--msg-dim);font-size:12px;font-style:italic;}
.msg-senderr{flex-shrink:0;${b}margin:0 auto;padding:0 0 8px;box-sizing:border-box;font-family:${l};font-size:12px;color:var(--msg-err);}
/* ── PÍSANIE SPRÁVY = PÁS PRILEPENÝ DOLE (28. 10. 2026, ako IG) ─────────────────────
   Pás cez celé okno (jemná horná čiara), pole v stĺpci. Safe-area sa PRIPOČÍTAVA k medzere;
   keď je hore klávesnica (.is-kb), sedí pás tesne nad ňou a safe-area odpadá (tá je pod klávesnicou). */
.msg-thread-dock{flex-shrink:0;border-top:1px solid var(--msg-sep);background:var(--msg-page);padding:8px 0 calc(env(safe-area-inset-bottom,0px) + 8px);position:relative;z-index:2;}
.msg-thread.is-kb .msg-thread-dock{padding-bottom:8px;}
.msg-thread-send{display:flex;gap:8px;align-items:center;${b}margin:0 auto;box-sizing:border-box;}
/* Písacie pole je plochá výplň bez gradientu; zaostrenie nesie farbu „mojej"
   strany, teda to isté, čo bublina a tlačidlo. */
.msg-thread-input{flex:1;background:var(--msg-field);border:1px solid var(--msg-btn-edge);border-radius:999px;padding:12px 16px;color:var(--msg-field-ink);font-family:${l};font-size:16px;outline:0;}
.msg-thread-input::placeholder{color:var(--msg-faint);}
.msg-thread-input:focus{border-color:var(--msg-focus);box-shadow:0 0 0 3px var(--msg-focus-halo);}
/* ⚠️ IKONKA JE DOČASNE 'feather' (Matej 1. 9. 2026). Do vtedy tu stálo 'chat' — dve bubliny
   konverzácie, čo je NÁZOV povrchu, nie akcia odoslania. Hand-drawn kit plachtičku ani šípku
   nemá; brko je z neho jediné, čo o poslaní odkazu hovorí a nehovorí pritom nič iné
   (link = odkaz, walk = výlet). Matej dokreslí vlastnú — potom sa vymení TU.
   ⚠️ Filter ikonky sa mení so šatom: na lapise musí byť biela, na oranžovozlatej tmavá.
      Nesie to premenná --msg-icon, nie prop komponentu — inak by sa to muselo riešiť
      v JSX na dvoch miestach a rozišlo by sa. */
.msg-sendbtn{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:var(--msg-mine);border:1px solid var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);cursor:pointer;display:flex;align-items:center;justify-content:center;}
.msg-sendbtn img{filter:var(--msg-icon) !important;}
.msg-sendbtn:hover:not(:disabled){background:var(--msg-mine-hover);}
/* ⚠️ Zoslabenie krytím na svetlom povrchu takmer nevidno. Vypnuté tlačidlo preto stráca
   FARBU, nie priehľadnosť — a v tmavom šate platí to isté opačne. */
.msg-sendbtn:disabled{background:var(--msg-off);border-color:var(--msg-btn-edge);box-shadow:none;cursor:default;}
.msg-sendbtn:disabled img{opacity:.55;}
/* Pridanie sa do svorky stojí na TOM ISTOM mieste ako písacie pole, takže nesie ten istý
   tvar — inak by sa spodok obrazovky menil podľa toho, či som členom. */
.msg-thread-join{${b}margin:0 auto;box-sizing:border-box;}
/* Geometria z .btn-gold (radius 8, NIE pilulka) — zmena farby nie je povolenie na iný tvar. */
.msg-joinbtn{width:100%;font-family:${R};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:var(--msg-mine);color:var(--msg-mine-ink);border:1px solid var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);cursor:pointer;}
.msg-joinbtn:hover{background:var(--msg-mine-hover);}

/* ══ MODERÁCIA (#54) — TENTO PANEL JE AINUBISOV, NIE PAPYRUSOVÝ ══════════════
   Matej 1. 9. 2026: „Report ako aj ine nahlasenia či otazky o bezpečnosti ma na starosti
   AINUBIS = tento panel bude ainubis brand."
   Nie je to odchýlka od šatu, je to priradenie vlastníka: papyrus a lapis sú hlas DOGYPTU,
   toto je hlas stroja, ktorý bezpečnosť rieši. Tokeny z ainubisSkin.ts (jeden zdroj),
   predloha .mcoach-bubble v MapCoach.tsx — tú Matej výslovne pochválil.
   🔑 PRETO SA NEPREPÍNA SO ŠATOM. Je tmavý vždy, aj keď správy svietia nabielo — Ainubis
      má jednu podobu a prepínanie by z nej spravilo motív appky.
   ⚠️ CTA je jeho ZLATO-ORANŽOVÉ, nie lapis (28. 8.: „AINUBIS je výnimka! Je to jeho brand"). */
/* Obe ovládania hlavičky v jednom bloku pri pravom okraji (Matej 15. 9. 2026). */
.msg-thread-acts{margin-left:auto;flex-shrink:0;display:flex;align-items:center;gap:8px;}
.msg-mod{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-dim);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-mod:hover{border-color:${u.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* ── PANEL AINUBISA: MOBIL DOLE, PC V STREDE (Matej 15. 9. 2026) ─────────────────────
   „ten blok dajme do stredu na PC a na spodný okraj na mobile."
   Dovtedy bol align-items:flex-end bez rozlíšenia, takže aj na 1900 px monitore visel
   panel na spodnej hrane okna — na mobile je to správny tvar (palec ho dosiahne),
   na PC je to odrezaný pás pri hrane. Rozhoduje CSS, render je jeden. */
${Se}
.msg-blocked{flex-shrink:0;${b}margin:0 auto;padding:16px 0 calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid var(--msg-bar-edge);background:var(--msg-bar);box-sizing:border-box;text-align:center;position:relative;z-index:2;}
.msg-blockedtxt{font-family:${l};font-size:12px;line-height:1.6;color:var(--msg-dim);}
.msg-unblock{margin-top:10px;font-family:${l};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.msg-unblock:hover{border-color:${u.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}

/* Šírka stĺpca = domov /pack (PACK_COL, 21. 9. 2026) — od 640 px padding 24, nie 16. */
${fe(".msg-thread-headinner,.msg-thread-body,.msg-thread-send,.msg-thread-join,.msg-senderr,.msg-blocked")}
`,Be=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,Le=[{id:"harassment",labelKey:"pack.msg.reportReasonHarassment"},{id:"spam",labelKey:"pack.msg.reportReasonSpam"},{id:"unsafe",labelKey:"pack.msg.reportReasonUnsafe"},{id:"not_dog_related",labelKey:"pack.msg.reportReasonNotDogRelated"},{id:"other",labelKey:"pack.msg.reportReasonOther"}];function ma({convId:d,onClose:S,onOpenTrip:I}){var Z,Y,W,Q;const[s,N]=r.useState(null),[A,C]=r.useState(""),[$,B]=r.useState(null),[z,h]=r.useState(null),[le,L]=r.useState(null),[U,D]=r.useState(null),[k,_]=r.useState(null),[T,F]=r.useState(""),[m,w]=r.useState(!1),[c,v]=r.useState(null),x=Pe(),t=je(),de=ye(),K=r.useRef(null),[E,me]=r.useState(0);r.useEffect(()=>{const a=window.visualViewport;if(!a)return;const n=()=>{const o=Math.max(0,Math.round(window.innerHeight-a.height-a.offsetTop));me(o>80?o:0)};return n(),a.addEventListener("resize",n),a.addEventListener("scroll",n),()=>{a.removeEventListener("resize",n),a.removeEventListener("scroll",n)}},[]);const V=E?{bottom:E}:void 0;r.useEffect(()=>{let a=!0;const n=()=>{Me(d).then(i=>{a&&N(i??null)})};n();const o=Te(n);return()=>{a=!1,o()}},[d]),r.useEffect(()=>{s&&Oe(d)},[d,s==null?void 0:s.messages.length]);const[H,ce]=r.useState(!1);if(r.useEffect(()=>{var n;if(H||((n=s==null?void 0:s.tag)==null?void 0:n.kind)!=="trip"||!s.tag.id)return;let a=!0;return we().then(()=>{a&&ce(!0)}),()=>{a=!1}},[(Z=s==null?void 0:s.tag)==null?void 0:Z.kind,(Y=s==null?void 0:s.tag)==null?void 0:Y.id,H]),r.useEffect(()=>{var a;(a=K.current)==null||a.scrollIntoView({block:"end"})},[s==null?void 0:s.messages.length]),!s)return e.jsxs("div",{className:`msg-thread msg-skin${E?" is-kb":""}`,style:V,children:[e.jsx("style",{children:ee}),e.jsx("style",{children:ie}),e.jsx("div",{className:"msg-thread-head",children:e.jsxs("div",{className:"msg-thread-headinner",children:[e.jsx(ae,{tone:"pale",onClick:S,label:t("pack.msg.backAriaLabel")}),e.jsx("div",{className:"msg-thread-headtxt",children:e.jsx("div",{className:"msg-thread-title",children:t("pack.msg.loading")})})]})})]});const p=s.kind==="group",pe=s.memberIds.includes(x.id),g=p?void 0:s.members.find(a=>a.id!==x.id),f=p?s.title??t("pack.msg.fallbackGroupTitle"):(g==null?void 0:g.name)??t("pack.msg.fallbackMemberName"),ge=!p&&(g!=null&&g.isDogName)?ne:re,G=s.memberCount??s.members.length,be=()=>{var a;((a=s.tag)==null?void 0:a.kind)==="trip"&&s.tag.id&&(I?I(s.tag.id):(S(),de(`/pack/map/${s.tag.id}`)))},J=async()=>{var n;const a=A.trim();if(a){C(""),B(null);try{const o=await Ie(d,a);N(o),Ne("pack_message_sent")}catch(o){C(a);const i=((n=s==null?void 0:s.tag)==null?void 0:n.label)==="SNIFFER"&&/row-level security/i.test(o instanceof Error?o.message:"");B(t(i?"pack.msg.matchClosed":"pack.msg.sendFailed"))}}},ue=async()=>{const a=await $e(d);N(a)},j=()=>{h(null),_(null),F(""),v(null),D(null)},O=async a=>{w(!0),v(null);try{const n=await Re(d,a);N(o=>o&&{...o,blocked:n}),j()}catch{v(t(a?"pack.msg.blockFailed":"pack.msg.unblockFailed"))}finally{w(!1)}},he=async()=>{if(k){w(!0),v(null);try{await(U?te("message",U,k,T.trim()||void 0):te("conversation",d,k,T.trim()||void 0)),L(null),h("sent")}catch{v(t("pack.msg.reportFailed"))}finally{w(!1)}}};return e.jsxs("div",{className:`msg-thread msg-skin${E?" is-kb":""}`,style:V,children:[e.jsx("style",{children:ee}),e.jsx("style",{children:ie}),e.jsx("div",{className:"msg-thread-head",children:e.jsxs("div",{className:"msg-thread-headinner",children:[e.jsx(ae,{tone:"pale",onClick:S,label:t("pack.msg.backToInboxAriaLabel")}),e.jsxs("div",{className:"msg-thread-headtxt",children:[e.jsx("div",{className:"msg-thread-title",style:{fontFamily:ge},children:f}),p&&e.jsx("div",{className:"msg-thread-sub",children:t(G===1?"pack.msg.memberCountOne":"pack.msg.memberCountMany",{n:G})}),((W=s.tag)==null?void 0:W.kind)==="trip"&&s.tag.label&&e.jsxs("button",{type:"button",className:"msg-tagchip msg-tagchip--click",onClick:be,children:[e.jsx(Ce,{name:"walk",size:10,tint:"gold"})," ",Ee(s.tag.id,s.tag.label)]})]}),e.jsx("div",{className:"msg-thread-acts",children:!p&&e.jsx("button",{type:"button",className:"msg-mod",onClick:()=>h("menu"),"aria-label":t("pack.msg.reportBlockAriaLabel"),title:t("pack.msg.reportBlockTitle"),children:e.jsx(se,{name:"menu",size:22})})})]})}),e.jsxs("div",{className:"msg-thread-body",children:[s.messages.length===0&&e.jsx("div",{className:"msg-empty",children:t("pack.msg.emptyThread")}),s.messages.map(a=>{const n=a.senderId===x.id,o=s.members.find(P=>P.id===a.senderId),i=n?o??x:o,M=n?x.avatarUrl??(o==null?void 0:o.avatarUrl):i==null?void 0:i.avatarUrl,ke=((i==null?void 0:i.name)??"?").charAt(0).toUpperCase(),X=!n&&Be.test(a.id);return e.jsxs("div",{className:`msg-bubblewrap${n?" me":""}`,children:[p&&!n&&e.jsxs("div",{className:"msg-bubble-sender",style:{fontFamily:o!=null&&o.isDogName?ne:re},children:[(o==null?void 0:o.name)??t("pack.msg.fallbackMemberName"),o!=null&&o.packNumber?` ${t("pack.msg.senderPackNumberSuffix",{n:o.packNumber})}`:""]}),e.jsxs("div",{className:"msg-bubblerow",children:[e.jsx("span",{className:"msg-bubbleav","aria-hidden":"true",style:M?{backgroundImage:`url('${ze(M,160)}')`}:void 0,children:!M&&ke}),e.jsx("div",{className:`msg-bubble${n?" me":""}`,onClick:X?()=>L(P=>P===a.id?null:a.id):void 0,children:a.text})]}),X&&le===a.id&&e.jsx("button",{type:"button",className:"msg-bubblerep",onClick:()=>{D(a.id),h("report")},children:t("pack.msg.reportMessage")})]},a.id)}),e.jsx("div",{ref:K})]}),$&&e.jsx("div",{className:"msg-senderr",role:"alert",children:$}),s.blocked?e.jsxs("div",{className:"msg-blocked",children:[e.jsx("div",{className:"msg-blockedtxt",children:t("pack.msg.blockedNotice",{name:f})}),e.jsx("button",{type:"button",className:"msg-unblock",disabled:m,onClick:()=>void O(!1),children:t(m?"pack.msg.working":"pack.msg.unblock")}),c&&e.jsx("div",{className:"msg-blockedtxt",role:"alert",style:{marginTop:10,color:"var(--msg-err)"},children:c})]}):pe?e.jsx("div",{className:"msg-thread-dock",children:e.jsxs("div",{className:"msg-thread-send",children:[e.jsx(oe,{right:"social",children:e.jsx("input",{className:"msg-thread-input",value:A,onChange:a=>C(a.target.value),onKeyDown:a=>{a.key==="Enter"&&(a.preventDefault(),J())},placeholder:t("pack.msg.messageInputPlaceholder")})}),e.jsx(oe,{right:"social",children:e.jsx("button",{type:"button",className:"msg-sendbtn",onClick:()=>void J(),disabled:!A.trim(),"aria-label":t("pack.msg.sendMessageAriaLabel"),children:e.jsx(se,{name:"odoslat",size:21})})})]})}):e.jsx("div",{className:"msg-thread-dock",children:e.jsx("div",{className:"msg-thread-join",children:e.jsx("button",{type:"button",className:"msg-joinbtn",onClick:()=>void ue(),children:((Q=s.tag)==null?void 0:Q.kind)==="trip"?t("pack.msg.joinTripPack"):t("pack.msg.joinPack")})})}),z&&e.jsx("div",{className:"msg-modsheet",role:"dialog","aria-modal":"true",onClick:a=>{a.target===a.currentTarget&&j()},children:e.jsxs("div",{className:"msg-modpanel",children:[e.jsx(Ae,{}),z==="menu"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"msg-modtitle",children:f}),e.jsx("div",{className:"msg-modsub",children:t("pack.msg.modMenuExplain")}),e.jsxs("div",{className:"msg-modrow",children:[e.jsx("button",{type:"button",className:"msg-modbtn",onClick:()=>h("report"),children:t("pack.msg.reportConversation")}),e.jsx("button",{type:"button",className:"msg-modbtn msg-modbtn--danger",disabled:m,onClick:()=>void O(!0),children:m?t("pack.msg.blocking"):t("pack.msg.blockButton",{name:f})})]}),c&&e.jsx("div",{className:"msg-modsub",role:"alert",style:{color:q.danger},children:c}),e.jsx("button",{type:"button",className:"msg-modcancel",onClick:j,children:t("pack.msg.cancel")})]}),z==="report"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"msg-modtitle",children:t("pack.msg.reportReasonPrompt")}),e.jsx("div",{className:"msg-modrow",children:Le.map(a=>e.jsx("button",{type:"button",className:`msg-modbtn${k===a.id?" on":""}`,onClick:()=>_(a.id),children:t(a.labelKey)},a.id))}),e.jsx("textarea",{className:"msg-modnote",value:T,onChange:a=>F(a.target.value),placeholder:t("pack.msg.reportNotePlaceholder")}),c&&e.jsx("div",{className:"msg-modsub",role:"alert",style:{color:q.danger},children:c}),e.jsx("button",{type:"button",className:"msg-modsend",disabled:!k||m,onClick:()=>void he(),children:t(m?"pack.msg.sending":"pack.msg.sendReport")}),e.jsx("button",{type:"button",className:"msg-modcancel",onClick:j,children:t("pack.msg.cancel")})]}),z==="sent"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"msg-modtitle",children:t("pack.msg.reportSentTitle")}),e.jsx("div",{className:"msg-modsub",children:t("pack.msg.reportSentBody")}),e.jsx("div",{className:"msg-modrow",children:e.jsx("button",{type:"button",className:"msg-modbtn msg-modbtn--danger",disabled:m,onClick:()=>void O(!0),children:m?t("pack.msg.blocking"):t("pack.msg.blockButton",{name:f})})}),e.jsx("button",{type:"button",className:"msg-modcancel",onClick:j,children:t("pack.msg.done")})]})]})})]})}export{ie as THREAD_CSS,ma as Thread};
