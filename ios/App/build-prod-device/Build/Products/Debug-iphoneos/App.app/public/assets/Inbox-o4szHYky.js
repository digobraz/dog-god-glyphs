import{aK as Z,P as L,r as b,G as Y,_ as X,aL as $,U as f,Z as q,T as D,aN as Q,u as C,h as W,j as e,D as aa}from"./index-7PctGTam.js";import{s as ea}from"./cloudinaryService-DFfDUqVM.js";import{c as ta,d as oa,b as sa}from"./BackButton-DiG140MZ.js";import{B as j}from"./BrandIcon-C4Fdumu_.js";import{subscribe as ra,listConversations as ia,getMe as na}from"./packMessaging-CwxRlYTq.js";import{c as la}from"./tripShared-DJ5J49O6.js";const a=L,B="dogypt.messages.skin.v1",y=new Set;function ga(){try{return localStorage.getItem(B)==="dark"?"dark":"light"}catch{return"light"}}let u=ga();function da(s){u=s;try{localStorage.setItem(B,s)}catch{}y.forEach(r=>r(s))}function ma(){const[s,r]=b.useState(u);return b.useEffect(()=>{r(u);const i=l=>r(l);return y.add(i),()=>{y.delete(i)}},[]),[s,()=>da(u==="dark"?"light":"dark")]}const pa=`
/* ── ŠAT: SVETLÝ (východiskový) ─────────────────────────────────────────── */
.msg-skin{
  --msg-page:${Z};
  --msg-wall:var(--bg-light);
  --msg-veil:radial-gradient(ellipse at 52% 58%, rgba(223,196,144,0.62) 0%, rgba(238,221,186,0.34) 52%, rgba(255,252,244,0.10) 100%),
             linear-gradient(135deg, rgba(250,243,225,0.35) 0%, rgba(244,231,199,0.40) 50%, rgba(236,218,175,0.45) 100%);
  --msg-bar:${a.panelGrad};
  --msg-bar-edge:rgba(179,130,45,0.55);
  --msg-bar-shadow:0 2px 10px rgba(122,90,42,0.10);
  /* PLOCHA SPRÁV — priesvitná doska medzi hlavičkou a písaním (Matej 15. 9. 2026:
     „potrebujeme tam panel bud priesvitný alebo liquid glass"). Tapeta pod ňou
     presvitá a rozmaže sa, takže bubliny na nej stoja a nezanikajú v hieroglyfoch. */
  --pk-stage:linear-gradient(180deg,rgba(251,245,230,0.58) 0%,rgba(242,229,197,0.42) 100%);
  --pk-stage-edge:rgba(179,130,45,0.34);
  --msg-title:#8A5F1E;
  --msg-ink:${a.inkStrong};
  --msg-dim:${a.inkWarm};
  --msg-faint:rgba(42,22,8,0.42);
  --msg-block:${a.panelGrad};
  --msg-block-edge:${a.cardEdge};
  --msg-block-ink:${a.inkStrong};
  --msg-block-shadow:0 2px 6px rgba(122,90,42,0.16), inset 0 1px 0 rgba(255,255,255,0.45);
  --msg-block-hover:0 0 0 3px rgba(201,154,63,0.28), 0 3px 9px rgba(122,90,42,0.20);
  /* RIADOK INBOXU. V svetlom šate je to TEN ISTÝ blok ako bublina — preto tu stoja
     odkazy, nie kópie čísel; rozídu sa až v tmavom šate, kde si Matej 15. 9. 2026
     vypýtal tmavé riadky („pri dark by nemali byť bledé bloky ale tmavé"). */
  --msg-row-bg:var(--msg-block);
  --msg-row-edge:var(--msg-block-edge);
  --msg-row-ink:var(--msg-block-ink);
  --msg-row-shadow:var(--msg-block-shadow);
  --msg-row-hover:var(--msg-block-hover);
  /* MOJA bublina + odosielacie tlačidlo = jedna rodina „ja". */
  --msg-mine:linear-gradient(180deg,#16307A,#0A1A4A);
  --msg-mine-hover:linear-gradient(180deg,#1E3C90,#0F2560);
  --msg-mine-edge:#0A1A4A;
  --msg-mine-ink:#EFD79A;
  --msg-mine-shadow:0 4px 13px -3px rgba(5,15,48,0.6), inset 0 1px 0 ${a.hairline};
  --msg-focus:#16307A;
  --msg-focus-halo:rgba(22,48,122,0.22);
  --msg-btn:rgba(255,251,240,0.55);
  --msg-btn-edge:rgba(179,130,45,0.55);
  --msg-btn-ink:${a.inkStrong};
  --msg-btn-hot:${a.card};
  --msg-field:${a.card};
  --msg-field-ink:${a.inkStrong};
  --msg-chip:rgba(201,154,63,0.20);
  --msg-chip-hot:rgba(201,154,63,0.32);
  --msg-chip-ink:#8A5F1E;
  --msg-dot-ring:${a.card};
  --msg-err:#8E2A20;
  --msg-off:rgba(201,154,63,0.20);
  /* Filter ikonky v tlacidle odoslania. Na lapise biela, na oranzovozlatej tmava.
     Su to DOSLOVNE retazce z FILTERS v BrandIcon.tsx — ten ich sype inline, takze sa
     z CSS prebijaju len s !important (precedens .trp-header-notif v PackMap.tsx). */
  --msg-icon:brightness(0) invert(1);
  /* Značka prepínača je čierna cesta — v svetlom šate ju stmavíme do inkoustu,
     v tmavom zosvetlíme. Zhodné filtre s FILTERS v BrandIcon.tsx. */
  --msg-glyph:brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%);
}
.msg-skin .msg-plate{${Y()}}

/* ── ŠAT: TMAVÝ ────────────────────────────────────────────────────────────
   Matej: „to isté ale v čiernej s oranžovozlatou a bledou farbou bubliniek."
   Nie je to prevrátenie svetlého: OBE bubliny sú tu svetlé na čiernom a líšia sa
   FARBOU (moja oranžovozlatá, cudzia papyrusová), nie svetlosťou. Preto má cudzia
   bublina tmavý inkoust aj v tmavom šate — je to bledá plôška, nie tmavá doska. */
.msg-skin--dark{
  --msg-page:${a.pageBg};
  --msg-wall:url('/images/bg-dark.webp');
  --msg-veil:radial-gradient(ellipse at 52% 58%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.62) 58%, rgba(0,0,0,0.86) 100%);
  --msg-bar:linear-gradient(135deg,#171009 0%,${a.pageBg} 100%);
  --msg-bar-edge:${a.border};
  --msg-bar-shadow:0 2px 12px rgba(0,0,0,0.55);
  /* V tmavom šate je tá istá doska TMAVÉ sklo — inak by svetlá plocha rozsvietila
     polovicu obrazovky a z tmavého šatu by ostala len lišta. */
  --pk-stage:linear-gradient(180deg,rgba(20,14,6,0.58) 0%,rgba(8,6,3,0.44) 100%);
  --pk-stage-edge:rgba(201,154,63,0.26);
  --msg-title:#E0B457;
  --msg-ink:${a.onDark};
  --msg-dim:rgba(245,240,228,0.52);
  --msg-faint:rgba(245,240,228,0.34);
  /* CUDZIA bublina a riadok inboxu = BLEDÁ plôška s tmavým inkoustom. */
  --msg-block:linear-gradient(160deg,${a.card} 0%,#F1E2C0 100%);
  --msg-block-edge:${a.cardEdge};
  --msg-block-ink:${a.inkStrong};
  --msg-block-shadow:0 3px 12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55);
  --msg-block-hover:0 0 0 3px rgba(201,154,63,0.42), 0 4px 14px rgba(0,0,0,0.6);
  /* ⚠️ RIADOK INBOXU SA OD BUBLINY 15. 9. 2026 ODDELIL. Matej 1. 9.: „to isté ale
     v čiernej s oranžovozlatou a bledou farbou bubliniek" — to je o BUBLINÁCH a platí
     ďalej. Matej 15. 9.: „pri dark by nemali byť bledé bloky ale tmavé" — to je o ZOZNAME
     konverzácií, kde tri papyrusové platne na čiernom zrušili tmavý šat.
     Recept NEVYMÝŠĽAM: je to PACK_BOX.subblockDark z katalógu (TMAVÝ PODBLOK) — tá istá
     geometria ako svetlý riadok, mení sa výplň a inkoust. Rám ostáva zlatý (cardEdge),
     aby riadok na sklenenej doske nezanikol (Matej 1. 9.: „bloky sú takmer neviditeľné"). */
  --msg-row-bg:linear-gradient(135deg,#171009 0%,${a.pageBg} 100%);
  --msg-row-edge:${a.cardEdge};
  --msg-row-ink:${a.onDark};
  --msg-row-shadow:0 1px 3px rgba(0,0,0,0.45), inset 0 1px 0 rgba(245,240,228,0.10);
  --msg-row-hover:0 0 0 3px rgba(201,154,63,0.30), 0 6px 18px rgba(0,0,0,0.55);
  /* MOJA bublina = oranžovozlatá; tlačidlo odoslania ju nasleduje. */
  --msg-mine:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  --msg-mine-hover:linear-gradient(135deg,#FFD65A 0%,#F0A81E 100%);
  --msg-mine-edge:rgba(250,244,236,0.30);
  --msg-mine-ink:${a.inkStrong};
  --msg-mine-shadow:0 4px 14px -4px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.30);
  --msg-focus:${a.cardEdge};
  --msg-focus-halo:rgba(201,154,63,0.28);
  --msg-btn:rgba(245,240,228,0.07);
  --msg-btn-edge:${a.onDarkBorder};
  --msg-btn-ink:${a.onDark};
  --msg-btn-hot:rgba(245,240,228,0.14);
  --msg-field:rgba(245,240,228,0.06);
  --msg-field-ink:${a.onDark};
  --msg-chip:rgba(201,154,63,0.16);
  --msg-chip-hot:${a.hairline};
  --msg-chip-ink:#E0B457;
  --msg-dot-ring:${a.pageBg};
  --msg-err:#E8A79A;
  --msg-off:${a.onDarkHair};
  --msg-icon:brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%);
  --msg-glyph:brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%);
}
/* ⚠️ V TMAVOM ŠATE NIE JE DOSKA ZLATO-RÁMOVANÝ BLOK, ALE LIQUID GLASS
   (Matej 1. 9. 2026: „pri dark mode nedávaj blok s okrajom ale liquid glass").
   Recept NEVYMÝŠĽAM — je to .pk-glass z packTheme.ts, teda tmavé sklo, ktoré appka
   používa všade inde; mení sa len polomer, aby sedel s ostatnými blokmi správ (14, nie 24).
   Tenká svetlá hrana NIE JE „okraj" v tom zmysle, čo Matej zamietol — je to odlesk skla;
   zamietnutý bol ťažký zlatý rám. Bez nej sklo nemá hranu a rozteká sa do pozadia.
   ⚠️ backdrop-filter rozmazáva to, čo je POD prvkom. Funguje tu preto, že tapeta .msg-skin
      leží na pseudoprvkoch so z-index:-1, teda v tom istom vrstviacom kontexte — keby sa
      tapeta presunula mimo neho, sklo by zostalo prázdne. */
.msg-skin--dark .msg-plate{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border:1px solid rgba(245,240,228,0.14);
  border-radius:14px;
  box-shadow:0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(245,240,228,0.12);
}
/* Lepiaca hlavička je nad scrollujúcim obsahom, teda ten istý prípad — v tmavom šate
   ide tiež do skla, nech na jednej obrazovke nestoja dva rôzne materiály. */
.msg-skin--dark .msg-inbox-head,
.msg-skin--dark .msg-thread-head,
.msg-skin--dark .msg-thread-send,
.msg-skin--dark .msg-thread-join,
.msg-skin--dark .msg-blocked{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border-color:rgba(245,240,228,0.14);
}

/* ── PODKLAD STRÁNKY ────────────────────────────────────────────────────────
   Rovnaký recept ako .pk-paper v packTheme.ts, len s premennými, aby ho vedeli
   niesť oba šaty. Preto sa sem .pk-paper NEPRIDÁVA a <HieroglyphBg /> sa
   NEVOLÁ — boli by dve tapety cez seba (a HieroglyphBg žije v PackLayout.tsx,
   ktorý si Inbox a Thread lazy importuje, takže by to bol kruh).
   ⚠️ "isolation:isolate" JE NOSNÉ: vrstvy stoja na "z-index:-1" a bez vrstviaceho
   kontextu prepadnú pod nepriehľadné pozadie rodiča. Nemeň to na transform ani
   filter — tie by prepísali obklopujúci blok pre "position:fixed" potomkov. */
.msg-skin{position:relative;isolation:isolate;background-color:var(--msg-page);color:var(--msg-ink);}
.msg-skin::before{content:'';position:fixed;top:0;left:0;width:100vw;height:100lvh;
  background-image:var(--msg-wall);background-size:cover;background-position:center;
  background-repeat:no-repeat;filter:blur(4px);pointer-events:none;}
.msg-skin::after{content:'';position:fixed;top:0;left:0;width:100vw;height:100lvh;
  pointer-events:none;background:var(--msg-veil);}
.msg-skin::before,.msg-skin::after{z-index:-1;}

/* Prepínač šatu. Kit MOON nemá, tak sa v oboch stavoch kreslí SLNKO a mení sa
   jeho stav: v svetlom šate svieti (zapnuté svetlo), v tmavom je stlmené.
   ⚠️ Mesiac si treba vypýtať od Mateja — „v kite to nie je" je dôvod ho vypýtať,
      nie siahnuť po lucide. Potom sa tu vymení ikonka podľa stavu. */
.msg-skinbtn{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,background .15s;}
.msg-skinbtn:hover{border-color:${a.cardEdge};background:var(--msg-btn-hot);}
.msg-skinbtn img{width:17px;height:17px;object-fit:contain;filter:var(--msg-glyph) !important;}
`;let c=null,k=null;function ba(){return c?Promise.resolve(c):k||(k=X(()=>import("./data-trails-C7pS6eM2.js"),[]).then(s=>(c=new Map(s.HERO_TRAILS.map(r=>[r.id,r.name])),c)).catch(()=>(k=null,new Map)),k)}function ca(s,r){return!s||!c?r:c.get(la(s))??r}const p=L,ka="'Cinzel Decorative', 'Cinzel', serif",va="'Cinzel', serif",P=`
/* ⚠️ FARBY SÚ PREMENNÉ, NIE TOKENY. Definuje ich MSG_SKIN_CSS v msgTheme.ts a nesie ich
   trieda .msg-skin (+ .msg-skin--dark). Kto sem napíše konkrétnu farbu, napíše ju len pre
   jeden zo šatov a v druhom sa to prejaví ako nečitateľné miesto, nie ako chyba.

   ⚠️ .msg-inbox NESIE AJ .msg-skin, a tá má position:relative — prekryv ju musí prebiť.
   Preto je selektor DVOJTRIEDNY (0,2,0): prebije ju bez ohľadu na to, v akom poradí sa oba
   <style> bloky dostanú do dokumentu. Spoliehať sa tu na poradie by znamenalo, že prvý, kto
   tie dva tagy prehodí, pošle inbox do toku stránky.
   Pozadie ani tapetu tu nehľadaj — nesie ich .msg-skin. Dve nepriehľadné plochy nad sebou
   by tapetu prekryli (tá istá chyba padla na blogu 1. 9.). */
.msg-inbox.msg-skin{position:fixed;inset:0;z-index:1300;overflow-y:auto;display:flex;flex-direction:column;min-height:100dvh;}
/* Lepiaca hlavička MUSÍ byť nepriehľadná (riadky pod ňou podchádzajú), a tým pádom sa nesmie
   tváriť, že je to holá stránka: doska by na tapete vytvorila obdĺžnik iného odtieňa.
   Číta sa preto ako LIŠTA — vlastný povrch a zlatá spodná hrana. */
/* ⚠️ LIŠTA JE PÁS CEZ CELÉ OKNO, OBSAH STOJÍ V STĹPCI. Do 15. 9. 2026 tu bol flex priamo
   na páse, takže názov a tlačidlá viseli na krajoch okna, kým doska pod nimi stála
   v strede v 640 px — na širokej obrazovke to bola hlavička od inej stránky.
   Rovnica je ZHODNÁ s .msg-thread-headinner vo vlákne (PACK_COL_FIT + packColCSS),
   aby sa krok späť zo správy nepohol o pixel. Vodorovný padding preto drží vnútro, nie pás. */
.msg-inbox-head{position:sticky;top:0;z-index:3;padding:calc(env(safe-area-inset-top,0px) + 22px) 0 16px;background:var(--msg-bar);border-bottom:1px solid var(--msg-bar-edge);box-shadow:var(--msg-bar-shadow);flex-shrink:0;}
.msg-inbox-headinner{display:flex;align-items:center;justify-content:space-between;gap:12px;${$}margin:0 auto;}
.msg-inbox-title{flex:1 1 auto;min-width:0;font-family:${f};font-weight:700;font-size:20px;color:var(--msg-title);}
.msg-inbox-acts{display:flex;align-items:center;gap:8px;flex-shrink:0;}
/* Zavrieť = šípka späť vľavo v bledom kruhu (Matej 27. 9. 2026: „dávajme všade len šípky, nie krížiky"). */
.msg-x{${ta("pale")}}
.msg-x:hover{${oa("pale")}}
/* ⚠️ Doska sa MUSÍ držať obsahu, preto tu NIE JE flex:1 1 auto — s ním by sa pri troch
   vláknach roztiahla na celú výšku okna a bola z nej prázdna platňa.
   ⚠️ Rám berie 6 px z každej strany, tak vodorovný padding klesol o toľko isto (16 -> 10).
      Odstup od spodného navu je MARGIN, nie padding — inak by tých 100 px bolo vnútri dosky.
   ⚠️ Vzduch od okrajov okna nesie width:calc(100% - 32px), nie 100% (precedens .pta-shell). */
.msg-inbox-list{${$}margin:14px auto 100px;padding:12px 8px 16px;box-sizing:border-box;flex:0 0 auto;position:relative;z-index:2;}
/* ⚠️ Riadok je <div role="button">, NIE <button> — vnútri je vlastné tlačidlo (štítok výletu)
   a <button> v <button> je nevalidný HTML, ktorý prehliadač ticho rozbije. Preto tu musí
   ostať aj :focus-visible, klávesnica sa inak stratí.

   🔑 RIADOK JE VÝRAZNÝ BLOK, NIE priesvitná dlaždica (Matej 1. 9. 2026: „jednotlivé bloky viac
   zvýraznené, sú teraz takmer neviditeľné"). Prvé kolo držalo úroveň 3 matrice doslova
   (tileBg = zlatá pri 6 %) a na pieskovcovej doske to bola zlatá na zlatej. Úroveň 3 je
   definovaná proti SVETLEJ karte; na doske jej podklad chýba.
   ⚠️ „VÝRAZNÝ" NEZNAMENÁ „SVETLÝ" — od 15. 9. 2026 to rozhoduje ŠAT (Matej: „pri dark by
   nemali byť bledé bloky ale tmavé"). V svetlom šate je riadok svetlejší než doska, v tmavom
   tmavší; obe polohy nesie --msg-row-* v msgTheme.ts, tento súbor o šate nevie.
   ⚠️ Bubliny vo VLÁKNE sa tým NEMENIA — cudzia ostáva bledá aj v tmavom šate (Matej 1. 9.).
   Preto má riadok vlastné tokeny a nesiaha už na --msg-block-*. */
.msg-row{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:var(--msg-row-bg);color:var(--msg-row-ink);border:1px solid var(--msg-row-edge);border-radius:12px;padding:12px 16px;margin-bottom:10px;cursor:pointer;box-shadow:var(--msg-row-shadow);transition:border-color .15s,transform .15s,box-shadow .15s;font-family:inherit;}
.msg-row:last-child{margin-bottom:0;}
.msg-row:hover{transform:translateY(-1px);box-shadow:var(--msg-row-hover);}
.msg-row:focus-visible{outline:none;box-shadow:var(--msg-row-hover);}
/* Avatar bez fotky = zlatá PLOCHA, teda brandová rampa okolo #C99A3F — NIE gradient .btn-gold
   (#F5C73D->#E69E1A). Ten je locknutý pre TLAČIDLO, kde je malý a lesklý, takže sa číta ako
   svetlo; tá istá zmes na súvislej ploche je žltá a Matej si ju spája s AINUBISOM (lock 28. 8.).
   Rampa drží v oboch šatoch — je to identita psa, nie povrch stránky. */
.msg-avatar{flex-shrink:0;width:42px;height:42px;border-radius:50%;background:linear-gradient(140deg,${p.cardEdge},#A3782B);background-size:cover;background-position:center;border:1px solid ${q.border};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:${D};font-weight:600;font-size:16px;color:${p.card};}
.msg-row-mid{flex:1;min-width:0;}
.msg-row-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.msg-row-name{font-weight:700;font-size:14px;color:var(--msg-row-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* ⚠️ Riadok má v tmavom šate BLEDÝ podklad, takže jeho druhotné texty NEMÔŽU brať --msg-dim
   (ten je počítaný pre tmavé pozadie stránky). Tlmenie sa robí krytím TEJ ISTEJ farby
   inkoustu riadku — inak by v tmavom šate zmizli. */
.msg-row-pack{font-family:${D};font-weight:400;font-size:10px;color:var(--msg-row-ink);opacity:.66;}
.msg-row-time{flex-shrink:0;font-size:10px;color:var(--msg-row-ink);opacity:.52;}
.msg-row-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px;}
.msg-row-preview{font-size:12px;color:var(--msg-row-ink);opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* Neprečítané = zlatá bodka s prstencom farby PODKLADU (ako odznak počtu správ
   v PackNotifications). Bez prstenca by na zlatkasto tónovanom riadku splynula.
   Nie je to lapis: lapis znamená „moja voľba / moja akcia", a neprečítaná správa
   nie je ani jedno — je to stav. */
.msg-dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${p.accentGold};box-shadow:0 0 0 2px var(--msg-dot-ring);}
.msg-tagchip{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-family:${f};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:var(--msg-chip);border:1px solid var(--msg-btn-edge);color:var(--msg-chip-ink);white-space:nowrap;}
.msg-tagchip--click{cursor:pointer;}
.msg-avatar.is-sniffer{position:relative;}
.msg-origin{position:absolute;right:-4px;bottom:-4px;width:20px;height:20px;border-radius:50%;background:${p.card};border:1px solid ${p.cardEdge};padding:0;box-sizing:border-box;object-fit:contain;}
.msg-tagchip--click:hover{background:var(--msg-chip-hot);border-color:${p.cardEdge};}
.msg-empty{text-align:center;padding:32px 16px;color:var(--msg-dim);font-size:12px;font-style:italic;}
/* #55 — prázdny inbox je celá obrazovka s jednou vetou; bez akcie je to slepá ulička. */
.msg-emptybox{display:flex;flex-direction:column;align-items:center;gap:16px;padding:32px 16px;text-align:center;}
.msg-emptybox p{margin:0;color:var(--msg-ink);opacity:.72;font-size:12px;font-style:italic;line-height:1.5;max-width:320px;}
/* Jediné hlavné CTA na tejto obrazovke → farba MOJEJ bubliny (v svetlom šate lapis,
   v tmavom oranžovozlatá). Geometriu si berie od .btn-gold (radius 8, NIE pilulka) —
   zmena farby nie je povolenie na iný tvar. */
.msg-emptybtn{font-family:${f};font-weight:700;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 16px;border-radius:8px;border:1px solid var(--msg-mine-edge);background:var(--msg-mine);color:var(--msg-mine-ink);box-shadow:var(--msg-mine-shadow);cursor:pointer;}
.msg-emptybtn:hover{background:var(--msg-mine-hover);}

/* Šírka stĺpca = domov /pack (PACK_COL, 21. 9. 2026) — od 640 px padding 24, nie 16. */
${Q(".msg-inbox-headinner,.msg-inbox-list")}
`;function ua(s,r){if(!s.memberIds.includes(r))return!1;const i=s.lastReadAt[r]??"";return s.messages.some(l=>l.senderId!==r&&l.createdAt>i)}function ha(s,r){const i=new Date(s),l=new Date;return i.toDateString()===l.toDateString()?i.toLocaleTimeString(r,{hour:"numeric",minute:"2-digit"}):i.toLocaleDateString(r,{month:"short",day:"numeric"})}function R({skin:s,onToggle:r}){const i=C(),l=i(s==="dark"?"pack.msg.skinToLight":"pack.msg.skinToDark");return e.jsx("button",{type:"button",className:"msg-skinbtn",onClick:r,"aria-pressed":s==="dark","aria-label":l,title:l,children:e.jsx(j,{name:"bright",size:17})})}function xa({onOpenThread:s,onClose:r,onOpenSniffer:i,onOpenTrip:l}){const g=C(),[z,F]=ma(),{lang:_}=W(),K=aa(_),[v,V]=b.useState([]),[w,U]=b.useState(!1),E=na();return b.useEffect(()=>{let t=!0;const n=()=>{ia().then(m=>{t&&V(m)})};n();const o=ra(n);return()=>{t=!1,o()}},[]),b.useEffect(()=>{if(w||!v.some(n=>{var o;return((o=n.tag)==null?void 0:o.kind)==="trip"&&n.tag.id}))return;let t=!0;return ba().then(()=>{t&&U(!0)}),()=>{t=!1}},[v,w]),e.jsxs("div",{className:`msg-inbox msg-skin${z==="dark"?" msg-skin--dark":""}`,children:[e.jsx("style",{children:pa}),e.jsx("style",{children:P}),e.jsx("div",{className:"msg-inbox-head",children:e.jsxs("div",{className:"msg-inbox-headinner",children:[e.jsx("button",{type:"button",className:"msg-x",onClick:r,"aria-label":g("pack.msg.closeAriaLabel"),children:e.jsx(sa,{})}),e.jsx("div",{className:"msg-inbox-title",children:g("pack.msg.inboxTitle")}),e.jsx("div",{className:"msg-inbox-acts",children:e.jsx(R,{skin:z,onToggle:F})})]})}),e.jsx("div",{className:"msg-inbox-list msg-plate",children:v.length===0?e.jsxs("div",{className:"msg-emptybox",children:[e.jsx("p",{children:g("pack.msg.inboxEmpty")}),i&&e.jsx("button",{type:"button",className:"msg-emptybtn",onClick:i,children:g("pack.msg.openSniffer")})]}):v.map(t=>{var T,I,M,O;const n=t.kind==="group",o=n?void 0:t.members.find(d=>d.id!==E.id),m=t.messages[t.messages.length-1],J=ua(t,E.id),N=n?t.title??g("pack.msg.fallbackGroupTitle"):(o==null?void 0:o.name)??g("pack.msg.fallbackMemberName"),G=N.charAt(0).toUpperCase(),H=!n&&(o!=null&&o.isDogName)?ka:va,A=t.memberCount??t.members.length,h=((T=t.tag)==null?void 0:T.kind)==="trip"?t.tag.id:void 0,x=((I=t.tag)==null?void 0:I.kind)==="trip"&&t.tag.label?ca(h,t.tag.label):void 0,S=()=>s(t.id);return e.jsxs("div",{role:"button",tabIndex:0,className:"msg-row",onClick:S,onKeyDown:d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),S())},children:[e.jsxs("span",{className:`msg-avatar${((M=t.tag)==null?void 0:M.label)==="SNIFFER"?" is-sniffer":""}`,style:!n&&(o!=null&&o.avatarUrl)?{backgroundImage:`url('${ea(o.avatarUrl,160)}')`}:void 0,children:[(n||!(o!=null&&o.avatarUrl))&&G,((O=t.tag)==null?void 0:O.label)==="SNIFFER"&&e.jsx("img",{className:"msg-origin",src:"/icons/sniffer/sniffer-znak.svg",alt:"SNIFFER",title:"SNIFFER"})]}),e.jsxs("span",{className:"msg-row-mid",children:[e.jsxs("span",{className:"msg-row-top",children:[e.jsxs("span",{className:"msg-row-name",style:{fontFamily:H},children:[N,!n&&(o!=null&&o.packNumber)?e.jsxs("span",{className:"msg-row-pack",children:[" ",g("pack.msg.packNumberSuffix",{n:o.packNumber})]}):null]}),m&&e.jsx("span",{className:"msg-row-time",children:ha(m.createdAt,K)})]}),e.jsxs("span",{className:"msg-row-bottom",children:[e.jsxs("span",{className:"msg-row-preview",children:[n?`${g(A===1?"pack.msg.memberCountOne":"pack.msg.memberCountMany",{n:A})} · `:"",m?m.text:g("pack.msg.noMessagesYet")]}),J&&e.jsx("span",{className:"msg-dot","aria-hidden":!0})]}),x&&(l&&h?e.jsxs("button",{type:"button",className:"msg-tagchip msg-tagchip--click",onClick:d=>{d.stopPropagation(),l(h)},children:[e.jsx(j,{name:"walk",size:10,tint:"gold"})," ",x]}):e.jsxs("span",{className:"msg-tagchip",children:[e.jsx(j,{name:"walk",size:10,tint:"gold"})," ",x]}))]})]},t.id)})})]})}const Na=Object.freeze(Object.defineProperty({__proto__:null,INBOX_CSS:P,Inbox:xa,SkinToggle:R},Symbol.toStringTag,{value:"Module"}));export{Na as I,pa as M,R as S,ca as a,ba as t,ma as u};
