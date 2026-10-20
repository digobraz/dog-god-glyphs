import{aL as g,P as pe,U as j,T as b,Z as ge,ak as G,aN as be,r as i,u as ke,i as ue,j as e,aS as J,ap as he}from"./index-7PctGTam.js";import{s as ve}from"./cloudinaryService-DFfDUqVM.js";import{u as xe,t as fe,M as Z,a as je,S as ye}from"./Inbox-o4szHYky.js";import{A as Y}from"./ainubisSkin-B7Z96MPq.js";import{b as Ne,c as ze}from"./ainubisSheet-CiRwHrIt.js";import{B as W}from"./BrandIcon-C4Fdumu_.js";import{B as q}from"./BackButton-DiG140MZ.js";import{subscribe as Se,markRead as Ee,getConversation as Ae,getMe as we,setPeerBlocked as Ce,sendMessage as Te,joinGroup as Oe,reportContent as Me}from"./packMessaging-CwxRlYTq.js";import{R as X}from"./RightGate-D9upYetj.js";import"./tripShared-DJ5J49O6.js";import"./countryGeo-BaPfaSrG.js";import"./packStore-C-dKFjs1.js";import"./addTripModel-BuQrZHBF.js";import"./ainubis-head-g4iOYlxZ.js";import"./HandIcons-Dh9PgzA0.js";import"./handArrowLeft-BUyUUYuC.js";import"./use-toast-CpgRElRJ.js";import"./dogRights-BxAmrGwt.js";import"./dogEvents-DNw7GPsn.js";import"./ainubisBus-BMRzmB2O.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Dyn0GD-G.js";import"./devMockDogs-BzGWz4qV.js";import"./pawmateRights-DJDDFQlT.js";const k=pe,Q="'Cinzel Decorative', 'Cinzel', serif",ee="'Cinzel', serif",ae=`
/* ⚠️ FARBY SÚ PREMENNÉ z msgTheme.ts (.msg-skin / .msg-skin--dark). Konkrétna farba napísaná
   sem platí len pre jeden šat a v druhom z nej bude nečitateľné miesto.
   Dvojtriedny selektor (0,2,0) prebije position:relative z .msg-skin bez ohľadu na poradie
   <style> blokov. Pozadie ani tapetu tu nehľadaj — nesie ich .msg-skin. */
.msg-thread.msg-skin{position:fixed;inset:0;z-index:1300;display:flex;flex-direction:column;}
/* Pás nesie POZADIE cez celé okno, stĺpec vnútri nesie OBSAH — a jeho šírka je tá istá,
   akú má telo správ (.msg-thread-body) aj písací panel (.msg-thread-send). */
.msg-thread-head{position:sticky;top:0;z-index:3;padding:calc(env(safe-area-inset-top,0px) + 22px) 0 16px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-thread-headinner{display:flex;align-items:center;gap:12px;${g}margin:0 auto;}
.msg-back{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s,background .15s;}
.msg-back:hover{border-color:${k.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* flex:1 + min-width:0 — bez toho dlhý štítok výletu na mobile podlezie ovládania vpravo. */
.msg-thread-headtxt{flex:1 1 auto;min-width:0;}
/* Meno v hlavičke je IDENTITA -> FONT_TITLE (pri psovi Decorative, to rieši inline štýl). */
.msg-thread-title{font-family:${j};font-weight:700;font-size:16px;color:var(--msg-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.msg-thread-sub{font-family:${b};font-size:10px;color:var(--msg-dim);margin-top:2px;}
/* max-width + ellipsis: štítok je jeden riadok (nowrap), takže sa musí dať orezať. */
.msg-tagchip{max-width:100%;overflow:hidden;text-overflow:ellipsis;display:inline-flex;align-items:center;gap:4px;margin-top:5px;font-family:${j};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:var(--msg-chip);border:1px solid var(--msg-btn-edge);color:var(--msg-chip-ink);white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-tagchip--click:hover{background:var(--msg-chip-hot);border-color:${k.cardEdge};}
/* ── PLOCHA SPRÁV JE SKLENENÁ DOSKA (Matej 15. 9. 2026) ──────────────────────────────
   „možno by bolo dobré nad blok kde sa píše pridať blok priesvitný kde pôjdu správy…
   lebo teraz to zaniká na pozadí… potrebujeme tam panel bud priesvitný alebo liquid glass."
   Bubliny dovtedy stáli priamo na hieroglyfovej tapete a splývali s ňou. Doska tapetu
   ROZMAŽE a stlmí, ale nezakryje — preto sklo, nie plná výplň.
   Šírka je tá istá, akú má hlavička aj písací panel: tri bloky v jednom stĺpci.
   ⚠️ Vzhľad nesie BLOK SKLENENÁ DOSKA (.pk-stage, STAGE_CSS v packTheme.ts), tu sú len
   rozmery. Farbu prepínajú premenné pk-stage v msgTheme.ts — v tmavom šate je to TMAVÉ
   sklo; svetlá doska by tam rozsvietila polovicu obrazovky. */
.msg-thread-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:16px;${g}margin:12px auto;display:flex;flex-direction:column;position:relative;z-index:2;}
.msg-bubblewrap{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:11px;max-width:82%;}
.msg-bubblewrap.me{align-items:flex-end;align-self:flex-end;}
/* FOTKA TOHO, KTO PÍŠE, VEDĽA BUBLINY (Matej 1. 9. 2026: „vedľa bublinky by mala byť
   ikonka fotka"). Cudzia správa má fotku vľavo, moja vpravo — teda na tej strane, kde
   bublina aj stojí; zrkadlí to row-reverse, nie druhá sada pravidiel. */
.msg-bubblerow{display:flex;align-items:flex-end;gap:8px;min-width:0;}
.msg-bubblewrap.me .msg-bubblerow{flex-direction:row-reverse;}
/* Kruh je menší než v inboxe (28 vs 42) — tam je fotka predmetom riadku, tu sprevádza text. */
.msg-bubbleav{flex:0 0 auto;width:28px;height:28px;border-radius:50%;background:linear-gradient(140deg,${k.cardEdge},#A3782B);background-size:cover;background-position:center;border:1px solid ${ge.border};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${b};font-weight:600;font-size:10px;color:${k.card};}
/* Meno odosielateľa sedí nad BUBLINOU, nie nad fotkou — odsadenie = šírka kruhu + medzera. */
.msg-bubble-sender{font-family:${j};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--msg-dim);margin-bottom:3px;padding:0 4px 0 39px;}
/* BUBLINY — Matej 1. 9. 2026: „musia byť výraznejšie tie čo prídu od človeka aj odomňa,
   jedna z nich by mohla byť lapis."
   CUDZIA = svetlý blok s plným zlatým rámom a nadvihnutím (v tmavom šate BLEDÁ plôška
   na čiernom — v oboch prípadoch svetlá, len na inom podklade).
   MOJA = plná farba: v svetlom šate LAPIS so zlatým písmom, v tmavom ORANŽOVOZLATÁ
   s tmavým. Prvé kolo tu malo tint pri 14 %; Matej ho zrušil a má na to dôvod: bublina nie
   je tlačidlo ani výber, je to OBSAH, a v rozhovore musí byť na prvý pohľad vidno, kto hovorí.
   ⚠️ Plná farba tu preto NEZNAMENÁ „moja akcia" ale „môj hlas" — a keďže odosielacie tlačidlo
      má tú istú farbu, čítajú sa ako jedna rodina („ja"), nie ako dve súperiace hlavné veci. */
.msg-bubble{font-family:${b};font-size:12px;line-height:1.5;padding:12px 16px;border-radius:16px;background:var(--msg-block);color:var(--msg-block-ink);border:1px solid var(--msg-block-edge);box-shadow:var(--msg-block-shadow);}
.msg-bubble.me{background:var(--msg-mine);color:var(--msg-mine-ink);border-color:var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);}
.msg-empty{text-align:center;padding:32px 16px;color:var(--msg-dim);font-size:12px;font-style:italic;}
.msg-senderr{flex-shrink:0;${g}margin:0 auto;padding:0 0 8px;box-sizing:border-box;font-family:${b};font-size:12px;color:var(--msg-err);}
/* ── PÍSANIE SPRÁVY = LEVITUJÚCI PANEL (Matej 15. 9. 2026) ───────────────────────────
   „dolný rámik je divný — urob panel s oblými rohmi a levitujúci ako pri spodnom nave,
   nemusí byť dblok ale nech to je pekne v priestore."
   Dovtedy to bol pás cez celú šírku s rovnou hornou čiarou (border-top), ktorý sa na
   širokej obrazovke skončil v strede na 640 px — teda ani pás, ani panel: obdĺžnik
   s dvoma ostrými rohmi visiaci nad okrajom. Teraz je to plávajúca doska: rám dookola,
   radius 16, tieň panela a odsadenie od spodnej hrany (safe-area sa PRIPOČÍTAVA k medzere,
   nie nahrádza). Tapeta pod ním presvitá — o to Matejovi šlo („pekne v priestore").
   ⚠️ Šírku drží width:calc(100% - 32px), nie padding na rodičovi — pás totiž sedí
   v stĺpci so stropom PACK_COL_INNER a bočné odsadenie musí platiť aj pod tou hranicou. */
.msg-thread-send{flex-shrink:0;display:flex;gap:10px;align-items:center;padding:12px;
  border:1px solid var(--msg-bar-edge);border-radius:16px;background:var(--msg-bar);
  box-shadow:${G.panel};${g}
  margin:0 auto calc(env(safe-area-inset-bottom,0px) + 14px);box-sizing:border-box;position:relative;z-index:2;}
/* Písacie pole je v OBOCH šatoch plochá výplň bez gradientu; zaostrenie nesie farbu „mojej"
   strany, teda to isté, čo bublina a tlačidlo. */
.msg-thread-input{flex:1;background:var(--msg-field);border:1px solid var(--msg-btn-edge);border-radius:999px;padding:12px 16px;color:var(--msg-field-ink);font-family:${b};font-size:12px;outline:0;}
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
.msg-thread-join{flex-shrink:0;padding:12px;border:1px solid var(--msg-bar-edge);border-radius:16px;
  background:var(--msg-bar);box-shadow:${G.panel};${g}
  margin:0 auto calc(env(safe-area-inset-bottom,0px) + 14px);box-sizing:border-box;position:relative;z-index:2;}
/* Geometria z .btn-gold (radius 8, NIE pilulka) — zmena farby nie je povolenie na iný tvar. */
.msg-joinbtn{width:100%;font-family:${j};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:var(--msg-mine);color:var(--msg-mine-ink);border:1px solid var(--msg-mine-edge);box-shadow:var(--msg-mine-shadow);cursor:pointer;}
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
.msg-mod:hover{border-color:${k.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}
/* ── PANEL AINUBISA: MOBIL DOLE, PC V STREDE (Matej 15. 9. 2026) ─────────────────────
   „ten blok dajme do stredu na PC a na spodný okraj na mobile."
   Dovtedy bol align-items:flex-end bez rozlíšenia, takže aj na 1900 px monitore visel
   panel na spodnej hrane okna — na mobile je to správny tvar (palec ho dosiahne),
   na PC je to odrezaný pás pri hrane. Rozhoduje CSS, render je jeden. */
${Ne}
.msg-blocked{flex-shrink:0;${g}margin:0 auto;padding:16px 0 calc(env(safe-area-inset-bottom,0px) + 16px);border-top:1px solid var(--msg-bar-edge);background:var(--msg-bar);box-sizing:border-box;text-align:center;position:relative;z-index:2;}
.msg-blockedtxt{font-family:${b};font-size:12px;line-height:1.6;color:var(--msg-dim);}
.msg-unblock{margin-top:10px;font-family:${j};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:8px 16px;border-radius:8px;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);color:var(--msg-btn-ink);cursor:pointer;transition:border-color .15s,color .15s,background .15s;}
.msg-unblock:hover{border-color:${k.cardEdge};color:var(--msg-title);background:var(--msg-btn-hot);}

/* Šírka stĺpca = domov /pack (PACK_COL, 21. 9. 2026) — od 640 px padding 24, nie 16. */
${be(".msg-thread-headinner,.msg-thread-body,.msg-thread-send,.msg-thread-join,.msg-senderr,.msg-blocked")}
`,Pe=[{id:"harassment",labelKey:"pack.msg.reportReasonHarassment"},{id:"spam",labelKey:"pack.msg.reportReasonSpam"},{id:"unsafe",labelKey:"pack.msg.reportReasonUnsafe"},{id:"not_dog_related",labelKey:"pack.msg.reportReasonNotDogRelated"},{id:"other",labelKey:"pack.msg.reportReasonOther"}];function ta({convId:l,onClose:A,onOpenTrip:M}){var K,F,V,H;const[s,y]=i.useState(null),[w,C]=i.useState(""),[P,R]=i.useState(null),[N,z]=i.useState(null),[S,I]=i.useState(null),[B,$]=i.useState(""),[d,E]=i.useState(!1),[m,u]=i.useState(null),h=we(),o=ke(),se=ue(),[v,oe]=xe(),L=i.useRef(null);i.useEffect(()=>{let a=!0;const r=()=>{Ae(l).then(n=>{a&&y(n??null)})};r();const t=Se(r);return()=>{a=!1,t()}},[l]),i.useEffect(()=>{s&&Ee(l)},[l,s==null?void 0:s.messages.length]);const[D,te]=i.useState(!1);if(i.useEffect(()=>{var r;if(D||((r=s==null?void 0:s.tag)==null?void 0:r.kind)!=="trip"||!s.tag.id)return;let a=!0;return fe().then(()=>{a&&te(!0)}),()=>{a=!1}},[(K=s==null?void 0:s.tag)==null?void 0:K.kind,(F=s==null?void 0:s.tag)==null?void 0:F.id,D]),i.useEffect(()=>{var a;(a=L.current)==null||a.scrollIntoView({block:"end"})},[s==null?void 0:s.messages.length]),!s)return e.jsxs("div",{className:`msg-thread msg-skin${v==="dark"?" msg-skin--dark":""}`,children:[e.jsx("style",{children:Z}),e.jsx("style",{children:ae}),e.jsx("style",{children:J}),e.jsx("div",{className:"msg-thread-head",children:e.jsxs("div",{className:"msg-thread-headinner",children:[e.jsx(q,{tone:v==="dark"?"dark":"pale",onClick:A,label:o("pack.msg.backAriaLabel")}),e.jsx("div",{className:"msg-thread-headtxt",children:e.jsx("div",{className:"msg-thread-title",children:o("pack.msg.loading")})})]})})]});const c=s.kind==="group",re=s.memberIds.includes(h.id),p=c?void 0:s.members.find(a=>a.id!==h.id),x=c?s.title??o("pack.msg.fallbackGroupTitle"):(p==null?void 0:p.name)??o("pack.msg.fallbackMemberName"),ie=!c&&(p!=null&&p.isDogName)?Q:ee,_=s.memberCount??s.members.length,ne=()=>{var a;((a=s.tag)==null?void 0:a.kind)==="trip"&&s.tag.id&&(M?M(s.tag.id):(A(),se(`/pack/map/${s.tag.id}`)))},U=async()=>{var r;const a=w.trim();if(a){C(""),R(null);try{const t=await Te(l,a);y(t),he("pack_message_sent")}catch(t){C(a);const n=((r=s==null?void 0:s.tag)==null?void 0:r.label)==="SNIFFER"&&/row-level security/i.test(t instanceof Error?t.message:"");R(o(n?"pack.msg.matchClosed":"pack.msg.sendFailed"))}}},le=async()=>{const a=await Oe(l);y(a)},f=()=>{z(null),I(null),$(""),u(null)},T=async a=>{E(!0),u(null);try{const r=await Ce(l,a);y(t=>t&&{...t,blocked:r}),f()}catch{u(o(a?"pack.msg.blockFailed":"pack.msg.unblockFailed"))}finally{E(!1)}},de=async()=>{if(S){E(!0),u(null);try{await Me("conversation",l,S,B.trim()||void 0),z("sent")}catch{u(o("pack.msg.reportFailed"))}finally{E(!1)}}};return e.jsxs("div",{className:`msg-thread msg-skin${v==="dark"?" msg-skin--dark":""}`,children:[e.jsx("style",{children:Z}),e.jsx("style",{children:ae}),e.jsx("style",{children:J}),e.jsx("div",{className:"msg-thread-head",children:e.jsxs("div",{className:"msg-thread-headinner",children:[e.jsx(q,{tone:v==="dark"?"dark":"pale",onClick:A,label:o("pack.msg.backToInboxAriaLabel")}),e.jsxs("div",{className:"msg-thread-headtxt",children:[e.jsx("div",{className:"msg-thread-title",style:{fontFamily:ie},children:x}),c&&e.jsx("div",{className:"msg-thread-sub",children:o(_===1?"pack.msg.memberCountOne":"pack.msg.memberCountMany",{n:_})}),((V=s.tag)==null?void 0:V.kind)==="trip"&&s.tag.label&&e.jsxs("button",{type:"button",className:"msg-tagchip msg-tagchip--click",onClick:ne,children:[e.jsx(W,{name:"walk",size:10,tint:"gold"})," ",je(s.tag.id,s.tag.label)]})]}),e.jsxs("div",{className:"msg-thread-acts",children:[e.jsx(ye,{skin:v,onToggle:oe}),!c&&e.jsx("button",{type:"button",className:"msg-mod",onClick:()=>z("menu"),"aria-label":o("pack.msg.reportBlockAriaLabel"),title:o("pack.msg.reportBlockTitle"),children:"⋯"})]})]})}),e.jsxs("div",{className:"msg-thread-body pk-stage",children:[s.messages.length===0&&e.jsx("div",{className:"msg-empty",children:o("pack.msg.emptyThread")}),s.messages.map(a=>{const r=a.senderId===h.id,t=s.members.find(ce=>ce.id===a.senderId),n=r?t??h:t,O=r?h.avatarUrl??(t==null?void 0:t.avatarUrl):n==null?void 0:n.avatarUrl,me=((n==null?void 0:n.name)??"?").charAt(0).toUpperCase();return e.jsxs("div",{className:`msg-bubblewrap${r?" me":""}`,children:[c&&!r&&e.jsxs("div",{className:"msg-bubble-sender",style:{fontFamily:t!=null&&t.isDogName?Q:ee},children:[(t==null?void 0:t.name)??o("pack.msg.fallbackMemberName"),t!=null&&t.packNumber?` ${o("pack.msg.senderPackNumberSuffix",{n:t.packNumber})}`:""]}),e.jsxs("div",{className:"msg-bubblerow",children:[e.jsx("span",{className:"msg-bubbleav","aria-hidden":"true",style:O?{backgroundImage:`url('${ve(O,160)}')`}:void 0,children:!O&&me}),e.jsx("div",{className:`msg-bubble${r?" me":""}`,children:a.text})]})]},a.id)}),e.jsx("div",{ref:L})]}),P&&e.jsx("div",{className:"msg-senderr",role:"alert",children:P}),s.blocked?e.jsxs("div",{className:"msg-blocked",children:[e.jsx("div",{className:"msg-blockedtxt",children:o("pack.msg.blockedNotice",{name:x})}),e.jsx("button",{type:"button",className:"msg-unblock",disabled:d,onClick:()=>void T(!1),children:o(d?"pack.msg.working":"pack.msg.unblock")}),m&&e.jsx("div",{className:"msg-blockedtxt",role:"alert",style:{marginTop:10,color:"var(--msg-err)"},children:m})]}):re?e.jsxs("div",{className:"msg-thread-send",children:[e.jsx(X,{right:"social",children:e.jsx("input",{className:"msg-thread-input",value:w,onChange:a=>C(a.target.value),onKeyDown:a=>{a.key==="Enter"&&(a.preventDefault(),U())},placeholder:o("pack.msg.messageInputPlaceholder")})}),e.jsx(X,{right:"social",children:e.jsx("button",{type:"button",className:"msg-sendbtn",onClick:()=>void U(),disabled:!w.trim(),"aria-label":o("pack.msg.sendMessageAriaLabel"),children:e.jsx(W,{name:"feather",size:17,tint:"white"})})})]}):e.jsx("div",{className:"msg-thread-join",children:e.jsx("button",{type:"button",className:"msg-joinbtn",onClick:()=>void le(),children:((H=s.tag)==null?void 0:H.kind)==="trip"?o("pack.msg.joinTripPack"):o("pack.msg.joinPack")})}),N&&e.jsx("div",{className:"msg-modsheet",role:"dialog","aria-modal":"true",onClick:a=>{a.target===a.currentTarget&&f()},children:e.jsxs("div",{className:"msg-modpanel",children:[e.jsx(ze,{}),N==="menu"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"msg-modtitle",children:x}),e.jsx("div",{className:"msg-modsub",children:o("pack.msg.modMenuExplain")}),e.jsxs("div",{className:"msg-modrow",children:[e.jsx("button",{type:"button",className:"msg-modbtn",onClick:()=>z("report"),children:o("pack.msg.reportConversation")}),e.jsx("button",{type:"button",className:"msg-modbtn msg-modbtn--danger",disabled:d,onClick:()=>void T(!0),children:d?o("pack.msg.blocking"):o("pack.msg.blockButton",{name:x})})]}),m&&e.jsx("div",{className:"msg-modsub",role:"alert",style:{color:Y.danger},children:m}),e.jsx("button",{type:"button",className:"msg-modcancel",onClick:f,children:o("pack.msg.cancel")})]}),N==="report"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"msg-modtitle",children:o("pack.msg.reportReasonPrompt")}),e.jsx("div",{className:"msg-modrow",children:Pe.map(a=>e.jsx("button",{type:"button",className:`msg-modbtn${S===a.id?" on":""}`,onClick:()=>I(a.id),children:o(a.labelKey)},a.id))}),e.jsx("textarea",{className:"msg-modnote",value:B,onChange:a=>$(a.target.value),placeholder:o("pack.msg.reportNotePlaceholder")}),m&&e.jsx("div",{className:"msg-modsub",role:"alert",style:{color:Y.danger},children:m}),e.jsx("button",{type:"button",className:"msg-modsend",disabled:!S||d,onClick:()=>void de(),children:o(d?"pack.msg.sending":"pack.msg.sendReport")}),e.jsx("button",{type:"button",className:"msg-modcancel",onClick:f,children:o("pack.msg.cancel")})]}),N==="sent"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"msg-modtitle",children:o("pack.msg.reportSentTitle")}),e.jsx("div",{className:"msg-modsub",children:o("pack.msg.reportSentBody")}),e.jsx("div",{className:"msg-modrow",children:e.jsx("button",{type:"button",className:"msg-modbtn msg-modbtn--danger",disabled:d,onClick:()=>void T(!0),children:d?o("pack.msg.blocking"):o("pack.msg.blockButton",{name:x})})}),e.jsx("button",{type:"button",className:"msg-modcancel",onClick:f,children:o("pack.msg.done")})]})]})})]})}export{ae as THREAD_CSS,ta as Thread};
