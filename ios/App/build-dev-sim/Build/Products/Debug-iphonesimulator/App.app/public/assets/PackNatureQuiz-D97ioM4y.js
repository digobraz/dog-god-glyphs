import{u as $e,f as ha,r as y,j as e,aO as xa,s as S,v as N,a1 as V,b as _,a0 as f,m as Ke,L as j,c as Xe,w as ee,g as ba,n as fa,aB as ka,K as va,a3 as ya,Q as ie,aF as fe,x as ae,aq as ja,ar as qa,aC as te,y as Ee,aV as za}from"./index-DriUOdZL.js";import{d as wa}from"./dogypt-seal-BvRW73MR.js";import{P as Na}from"./PackTopRow-BfpkT1yr.js";import{B as Sa}from"./BackButton-8pSTwsJq.js";import{useMagnetPreview as ea}from"./magnetPreview-DJ5RPtvA.js";import{supabase as Ae}from"./client-_yx8AKEw.js";import{d as Ea,e as ke,f as ve,g as ye,S as oe,h as je,E as aa,B as Aa,a as T,b as na,i as re,N as se,j as $a,k as Ge,l as Ta,m as He,R as Ca}from"./natureQuiz-D2uHcOot.js";import{B as Oa}from"./BrandIcon-lowQpHlA.js";import{S as L}from"./SysIcon-CI9hudiL.js";import{readLatestForDogs as Ia,appendDogEvents as Pa}from"./dogEvents-p0BnCK5N.js";import{a as Da}from"./devMockDogs-EBvAGSAt.js";import{g as Ra}from"./dogRights-CDnPOjZG.js";import{sizedUrl as ta}from"./cloudinaryService-CiRx-3N_.js";import"./HandIcons-BI9sYdb3.js";import"./handArrowLeft-CBfp0fHd.js";import"./ThinArrow-DxkNjmlF.js";import"./MomentHost-D9oSu3w3.js";import"./sharedFetch-CweRO2Vz.js";import"./wizAnchors-DjShJff8.js";import"./dogSlug-CB23gDR2.js";import"./countryGeo-BNEVCU3g.js";import"./addTripModel-DwkYC9MX.js";import"./feedData-DmTwWPGV.js";import"./photoIntake-EOawjgPq.js";import"./consent-Dhof2q2u.js";import"./ainubisSheet-BR3ZiSMH.js";import"./useSheetSwipe-Ch0ng1WW.js";import"./sosNoPhoto-igLPGupO.js";import"./sos-0Lw8ugiB.js";import"./tslib.es6-CmEaCU22.js";import"./appSession-Dt5ga50m.js";import"./use-toast-CKCh4Cay.js";import"./shareFile-CghX9Llh.js";import"./breeds-DONRU28-.js";import"./sosP3d-BGksLPbc.js";import"./ainubis-head-g4iOYlxZ.js";import"./hasSession-ns-zlIq6.js";import"./pawmateRights-By9TfO0S.js";const _a="/assets/ainubis-badge-8yqcWuzE.webp",Ma=`
${xa}
.mgl-h{margin:0 0 ${S.sm}px;font:700 ${N.h2}px/1.3 ${V};letter-spacing:.02em;color:${_.inkStrong};}
.mgl-p{margin:0;font:400 ${N.body}px/1.55 ${f};color:${_.inkWarm};}
.mgl-field{width:100%;box-sizing:border-box;margin-top:${S.md}px;padding:${S.md}px ${S.lg}px;
  border-radius:${Ke.field}px;font:400 ${N.lead}px/1.4 ${f};color:${_.inkStrong};}
.mgl-err{margin:${S.sm}px 0 0;font:500 ${N.label}px/1.4 ${f};color:#B25640;}
.mgl-cta{display:inline-flex;align-items:center;justify-content:center;width:100%;margin-top:${S.md}px;cursor:pointer;
  border:1px solid ${j.edge};border-radius:${Ke.field}px;padding:${S.md}px ${S.lg}px;
  background:${j.grad};box-shadow:${Xe};color:${j.ink};
  font:700 ${N.body}px/1 ${V};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.mgl-cta:hover{background:${j.gradHover};transform:translateY(-1px);}
.mgl-cta:disabled{opacity:.6;cursor:wait;}
.mgl-fine{margin:${S.md}px 0 0;font:400 ${N.label}px/1.5 ${f};color:${_.inkWarm};}
.mgl-fine a{color:${j.edge};}
`;function Ba({answers:n,result:s,onDone:r}){const a=$e(),{lang:m}=ha(),c=(w,P)=>{const M=a(w);return M===w?P:M},[b,x]=y.useState(""),[q,k]=y.useState(!1),[g,l]=y.useState(!1),h=async w=>{if(w.preventDefault(),g)return;if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.trim())){k(!0);return}k(!1),l(!0);const{error:P}=await Ae.rpc("magnet_lead",{p_email:b.trim(),p_lang:m,p_answers:n,p_result:{element:s.element,role:s.role,elementSecond:s.elementSecond,roleSecond:s.roleSecond}});if(l(!1),P){k(!0);return}r()};return e.jsxs("form",{onSubmit:h,noValidate:!0,children:[e.jsx("style",{children:Ma}),e.jsxs("div",{style:{...ee.card,padding:S.xl},children:[e.jsx("h2",{className:"mgl-h",children:c("magnet.quiz.gate.h","Where should we send your result?")}),e.jsx("p",{className:"mgl-p",children:c("magnet.quiz.gate.p","Your e-mail, nothing else. The full reading opens right after.")}),e.jsx("input",{className:"pf-field mgl-field",type:"email",autoComplete:"email",required:!0,value:b,onChange:w=>x(w.target.value),placeholder:"name@email.com","aria-invalid":q}),q&&e.jsx("p",{className:"mgl-err",role:"alert",children:c("magnet.quiz.gate.err","That e-mail does not look right. Try again.")}),e.jsx("button",{type:"submit",className:"mgl-cta",disabled:g,children:c("magnet.quiz.gate.btn","Show my result")}),e.jsxs("p",{className:"mgl-fine",children:[c("magnet.quiz.gate.fine","Used only to send you the result.")," ",e.jsx("a",{href:"/privacy",target:"_blank",rel:"noreferrer",children:c("magnet.quiz.gate.privacy","Privacy")})]})]})]})}const o=_,Fa="rgba(179,130,45,0.55)",La="'Cinzel Decorative', 'Cinzel', serif",oa="/images/nature-quiz-art.webp",Wa="/pack/dogs";function Va(n,s){return n==="id"&&s?`/pack/dogs/${s}`:null}const Ka=`${ya}
/* ── CTA — ZLATÚ URČUJE PODKLAD, NIE VKUS ────────────────────────────────────
   Pravidlo je v index.css od 14. 7. 2026 aj s Matejovým OK:
     LIGHT/papyrus → --cta-gradient      (medová ${o.cardEdge}→#A07423) + --cta-shadow-grounded
     DARK/čierne   → --cta-gradient-dark (#F5C73D→#E69E1A)        + --cta-shadow-glow
   Matej 18. 8.: "zlatu myslim taku ako mame aj v heroglyf flowe - zlatá tmavá, táto
   zlatá je pouzivana na tmavom pozadí." Je to teda potvrdenie existujúceho pravidla,
   nie nové rozhodnutie.

   🔑 PREČO ÚVOD KVÍZU VYZERAL ORANŽOVO: mal na papyruse jasnú zlatú, ktorá je určená
   na čiernu. Tie štyri tokeny v index.css existujú od 14. 7. a NIKDY sa nepoužili —
   každé CTA v projekte si gradient píše samo, takže pravidlo nemal kto vynútiť.
   Tu sa čerpajú z tokenov zámerne, ako prvý spotrebiteľ.

   V kvíze stoja na papyruse VŠETKY tlačidlá okrem jedného, preto je medová variantou
   VÝCHODZOU. Jasná sa dopĺňa triedou ".is-ondark" — potrebuje ju len obrazovka
   výsledku, kde tlačidlá stoja POD kartami, priamo na čiernom pozadí stránky.
   ⚠️ Radius ostáva 8 px (brand lock, kartuša). Heroglyph flow má 12 — to je odchýlka
   flow-u, nie kánon; neprenášaj ju sem.
   ⚠️ Cinzel je načítaný vo váhe 700; pôvodných 800 tu bol fake bold. */
.nq-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:12px 24px;
  background:${j.grad};
  border:1px solid ${j.edge}; border-radius:8px; color:${j.ink};
  font-family:'Cinzel',serif; font-size:10px; font-weight:700;
  letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
  box-shadow:${Xe};
  transition: transform .2s, box-shadow .22s;
}
.nq-gold:hover{ transform:scale(1.04); background:${j.gradHover}; }
.nq-gold:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
/* Ghost na čiernom: teplý hnedý ink "${o.inkWarm}" je inkoust NA PAPYRUS a na čiernej ho
   nevidno. Rovnaká pasca ako pri pätičke s attribution — na tmavých vrstvách sa berú
   onDark odtiene, nie ink*. */
/* Hlavné CTA úvodu — vzor hub-gold.is-big z PackDogs.tsx. Meria sa na šírku
   textového stĺpca, nie na dĺžku slova START: tlačidlo, ktoré má stránku otvoriť,
   nesmie byť menšie než dlaždice nad ním (Matej 14.8.: „urob vačšie širšie").
   ⚠️ Gradient, radius 8 a papyrusový rám sa NEMENIA — CTA je LOCKED. */
.nq-gold.is-big{
  width:100%; padding:16px 24px; font-size:12px; letter-spacing:0.22em;
  border-radius:8px;
}
.nq-ghost{
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:12px 24px; background:transparent;
  border:1.5px solid ${o.border}; border-radius:8px; color:${o.inkWarm};
  font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:600;
  letter-spacing:0.14em; text-transform:uppercase; cursor:pointer;
}
.nq-ghost:hover{ border-color:${o.cardEdge}; color:${o.inkStrong}; }
.nq-ghost:disabled{ opacity:.32; cursor:default; border-color:${o.border}; color:${o.inkWarm}; }
/* ── POSÚVA SA SAMO, VRÁTIŤ SA DÁ VŽDY ────────────────────────────────────────
   Matej 20.8.: „po výbere sa ide automaticky na ďalšiu stránku ale bude sa dať
   vrátiť." Ruší to pravidlo z 18.8. („označiť a potvrdiť ďalej") — vtedy bol
   automat nezvratný, lebo SPÄŤ z tejto obrazovky neexistovalo. Dnes existuje, a tým
   padol dôvod, prečo za každú otázku pýtať klik navyše.
   Posun sa spúšťa až vtedy, keď má otázka odpoveď od KAŽDÉHO psa, a s oneskorením
   ("ADVANCE_MS") — bez neho by pri svorke obrazovka odskočila v tej istej desatine
   sekundy, v ktorej sa rozsvietil posledný krúžok, a človek by nevidel, čo odklikal.
   SPÄŤ stojí vľavo a je vždy prítomné (na prvej otázke zošednuté), aby lišta
   nemenila šírku medzi otázkami — poskakujúce ĎALEJ sa horšie trafí. */
.nq-nav{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  margin-top:20px;
}
.nq-nav .nq-gold{ min-width:158px; }
@media (max-width:420px){
  .nq-nav .nq-gold{ min-width:0; flex:1 1 auto; }
}
/* ── ODPOVEĎ ──────────────────────────────────────────────────────────────────
   Odpoveď je DLAŽDICA na celú šírku, nie pilulka — otázky sú dlhé vety. Ale koža
   je kánonická .pf-pill z packTheme.ts (Matej 14.8.: „odpovede urob vizuálnejšie
   tak ako to máme aj inde na /pack"): svetlý gradient zhora, 1.5px teplý rám,
   nadvihnutie pri hoveri; vybraté = PLNÝ zlatý gradient .pf-pill.is-selected.
   Predtým to bola plochá tileBg výplň, ktorá sa pri výbere len mierne dofarbila —
   na papyruse rozdiel skoro neviditeľný. */
.nq-opt, .nq-optlbl{
  display:flex; align-items:center; gap:12px; width:100%; text-align:left; cursor:pointer;
  padding:12px 16px; border-radius:12px;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid ${ie.border};
  font-family:'Space Grotesk',sans-serif; font-size:14px; line-height:1.45;
  color:#5c4318;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .18s;
}
.nq-optlbl{ flex:1 1 auto; }
.nq-opt:hover, .nq-optlbl:hover{
  border-color:rgba(179,130,45,0.85); transform:translateY(-1px);
  box-shadow:${fe.lift};
}
.nq-opt.is-on, .nq-optlbl.is-on{
  ${Ee(j.edge,ae.lapis,.16)}
}
.nq-optxt{ flex:1 1 auto; min-width:0; }

/* ── ROZOBRATÁ ODPOVEĎ: „NIEKTO" JE TIEŽ STAV ─────────────────────────────────
   Matej 20.8.: „ak sa označia obidva psy tak políčko otázky sa vyfarbí, ak ale sú
   dve odlišné odpovede tak sa nezvýraznia."
   Zlatá znamenala len JEDNO: takto odpovedali VŠETCI. Lenže svorka sa najčastejšie
   nezhodne — a vtedy nesvietil ani jeden riadok, takže celá otázka vyzerala
   nezodpovedaná a stav visel výhradne na dvoch malých krúžkoch vpravo. Pri šiestich
   psoch je to šesť krúžkov na piatich riadkoch a oko nemá kam skočiť.
   Preto má riadok TRI stavy, nie dva:
     nikto  → papyrus
     niekto → svetlejšia zlatá + ZVISLÝ PRÚŽOK vľavo (inset box-shadow)
     všetci → plná zlatá
   Prúžok je tam zámerne: odtieň sám by sa pri rôznych obrazovkách zle rozlišoval,
   hrana je binárna. ⚠️ Stredný stav NESMIE byť taký sýty ako plný — inak zmizne
   informácia „zhodli sa", ktorá je pri svorke to zaujímavé. */
.nq-optlbl.is-some{
  background:${za(j.edge,.07)};
  border-color:${j.edge};
  box-shadow:inset 4px 0 0 ${j.edge};
  color:${ae.lapis};
}
.is-some > .nq-mark{
  background:#F8E9C2; border-color:${o.cardEdge}; color:#3d2a08;
}

/* OZNAČENIE ODPOVEDE (Matej 14.8.: „odpovede by mali mať aj označenie").
   Krúžok s písmenom vľavo; po výbere sa písmeno zmení na zaškrtnutie. Dáva to
   odpovediam adresu („to bolo béčko"), ktorú holý text nemá, a stav výberu prestáva
   visieť len na odtieni pozadia. */
.nq-mark{
  flex:0 0 auto; width:26px; height:26px; border-radius:999px;
  display:grid; place-items:center;
  background:rgba(255,255,255,0.55); border:1.5px solid rgba(179,130,45,0.45);
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:10px; letter-spacing:.02em;
  color:${o.inkWarm}; transition:background .18s, border-color .18s, color .18s;
}
.is-on > .nq-mark{
  background:${j.edge}; border-color:${j.edge}; color:${j.ink};
}

/* ── VETA, KTORÁ NIE JE OVLÁDAČ (len pri VIACERÝCH psoch) ─────────────────────
   Matej 18.8.: „otázky sú ohraničené a dajú sa kliknúť a ak sa na ne klikne
   neviem čo sa stane = bug… ak bude viacero psov otázka sa nebude dať klikať ale
   len fotky psov."
   Klik na vetu predtým odpovedal naraz za celú svorku. Úkon sám o sebe užitočný,
   ale nedal sa uhádnuť: dlaždica vyzerá ako tlačidlo, tak sa naň klikne — a naraz
   sa vyplnia všetky krúžky, čo pôsobí ako chyba, nie ako skratka.
   Pri jednom psovi zostáva veta tlačidlom — je to jediný ovládač, ktorý tam je.
   ⚠️ Rám a výplň sa NEMENIA. Odpoveď musí vyzerať rovnako v oboch režimoch;
   mení sa len to, že nereaguje na myš. */
.nq-optlbl.is-static{ cursor:default; }
.nq-optlbl.is-static:hover{
  border-color:${ie.border}; transform:none; box-shadow:none;
}

/* Trojlístok áno/občas/nie pri jednom psovi — tá istá koža, len na šírku. */
.nq-tri{
  flex:1 1 0; cursor:pointer; padding:12px 8px; border-radius:999px;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid ${ie.border};
  font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:500; color:#5c4318;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.nq-tri:hover{
  border-color:rgba(179,130,45,0.85); transform:translateY(-1px);
  box-shadow:${fe.lift};
}
.nq-tri.is-on{
  ${Ee(j.edge,ae.lapis,.16)}
}

/* ── PROGRES ──────────────────────────────────────────────────────────────────
   MODRÝ, NIE ZLATÝ (Matej 18.8.: „progresbar musí byť výraznejší a krajší, použi
   modrú farbu z brandu"). Egyptská modrá ${o.brandBlue} je kánonická sekundárna brandu
   ("--brand-blue" v index.css, token T.brandBlue).

   Prečo je to aj vecne správne, nielen podľa vkusu: na tejto obrazovke zlatá už
   znamená VÝBER — vybratá odpoveď, CTA, zaškrtnutie. Zlatý progres by bol tretí
   význam tej istej farby a oko potom nevie, čo je stav a čo je akcia. Modrá je
   jediná ďalšia farba, ktorú brand pozná, a nesie tu jednu vec: koľko je za tebou.
   ⚠️ NEROZŠIRUJ modrú na odpovede ani na tlačidlá — zostáva farbou stavu.

   Prúžok je 14 px (bol 9) a zlomok otázok je Cinzel v tmavom inkouste, nie
   vyblednutý eyebrow — je to hlavný orientačný bod obrazovky, nie popisok. */
.nq-prog{ margin:0 0 20px; }
.nq-proghead{
  display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:9px;
}
.nq-proglbl{
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12px;
  letter-spacing:.14em; text-transform:uppercase; color:${o.inkStrong};
}
.nq-prognum{
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12px;
  color:${o.brandBlue}; white-space:nowrap; font-variant-numeric:tabular-nums;
}
.nq-progbar{
  height:14px; border-radius:999px; overflow:hidden; position:relative;
  background:rgba(16,52,166,0.07); border:1px solid rgba(16,52,166,0.28);
  box-shadow:inset 0 2px 5px rgba(9,26,74,0.20);
}
.nq-progbar__on{
  height:100%; border-radius:999px;
  background:linear-gradient(90deg,${o.brandBlueLite} 0%,${o.brandBlue} 100%);
  box-shadow:0 0 16px rgba(46,95,208,0.55), inset 0 1px 0 rgba(255,255,255,0.38),
             inset 0 -2px 4px rgba(6,20,60,0.35);
  transition:width .45s cubic-bezier(.4,0,.2,1);
}

/* ── VIACPSÍ VÝBER: STĹPEC NA PSA, NIE BLOK NA PSA ────────────────────────────
   Matej 14.8.2026: „chcem zabrániť multiplikovaniu textových možností, chcem verziu
   aby zostala jedna možnosť ale s multivýberom pre každého psa." Riadok na psa (vzor
   z DOG ID kvízu) zopakuje aj to, čo sa nemení — pri troch psoch je z 18 otázok stena.
   Tu text stojí RAZ a pribúdajú len krúžky vpravo. Zvisle sa číta jeden pes, vodorovne
   sa porovnáva svorka.
   Povahový kvíz to znesie preto, že každá otázka má práve JEDNU odpoveď na psa —
   krúžok sa správa ako prepínač. Na polia s viacnásobným výberom (chips v DOG ID kvíze,
   kde pes má osem povelov + vlastný text) tento vzor NESADNE. */
/* ⚠️ HLAVIČKA S FOTKAMI NAD OTÁZKAMI JE ZRUŠENÁ (Matej 20.8.: „daj preč tie dva
   obrázky ktoré sú nad otázkami — vytrčajú"). Bola prilepená (sticky) a široká len
   na svoje stĺpce, takže visela pri pravom okraji karty ako odlomený kus — a hlavne
   bola zbytočná: krúžok v riadku UŽ JE fotka toho psa. Popisovala teda stĺpce tou
   istou fotkou, aká je v nich.
   Meno ostáva dostupné cez hover/"title" priamo na krúžku. Ak by sa hlavička niekedy
   vracala, musí byť pás cez CELÚ šírku karty, nie fit-content vpravo. */
.nq-optrow{ display:flex; align-items:center; gap:10px; }
/* Klik na SAMOTNÚ VETU = tá istá odpoveď pre celú svorku. Nahrádza to checkbox
   „rovnako pre všetkých" z DOG ID kvízu — tu je prirodzenejší, lebo cieľ je vidieť.
   Kožu zdieľa s .nq-opt vyššie; zlatá sa rozsvieti, až keď takto odpovedali VŠETCI. */
.nq-dogs{ display:flex; gap:10px; flex:0 0 auto; }
/* Nevybraté = odfarbené a stlmené, ale NIE tak, aby to čítalo ako vypnuté;
   vybraté = plná farba + zlatý prstenec.
   ⚠️ VEĽKOSŤ URČUJE POČET PSOV, nie konštanta (Matej 20.8.: „aby to bolo ok aj keby
   mal niekto 3-6 psov"). Šesť krúžkov po 54 px + medzery = 374 px vedľa vety, ktorá
   sama potrebuje aspoň 300 — na mobile by rad spadol pod text a zabral pol obrazovky.
   Premennú "--nq-dog" nastavuje stránka podľa dĺžky svorky ("readStyle"), tu je len
   východisková hodnota pre jedného-dvoch. Spodná hranica je 36 px = dotykové minimum;
   pod ňu sa NESMIE ísť, radšej nech rad zalomí. */
.nq-dog{
  width:var(--nq-dog,54px); height:var(--nq-dog,54px);
  border-radius:999px; cursor:pointer; padding:0; overflow:hidden; flex:0 0 auto;
  border:2px solid ${_.border}; background:${o.bg};
  filter:grayscale(1); opacity:.45;
  transition:opacity .18s, filter .18s, border-color .18s, box-shadow .18s;
}
.nq-dog img{ width:100%; height:100%; object-fit:cover; display:block; }
.nq-dog:hover{ opacity:.8; filter:grayscale(.35); }
.nq-dog.is-on{
  opacity:1; filter:none; border-color:${o.cardEdge}; box-shadow:0 0 0 3px rgba(201,154,63,0.22);
}
.nq-dogfb{
  display:grid; place-items:center; width:100%; height:100%;
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:calc(var(--nq-dog,54px) * 0.34);
  color:${o.inkWarm};
}
/* Zoznam odpovedí. Trieda, nie inline mriežka — mobil musí vedieť zmeniť rozostup. */
.nq-opts{ display:grid; gap:9px; }

/* Pod 500px sa veta a krúžky do riadku nezmestia — rad ide POD text a smie zalomiť
   (šesť psov na 360 px display). Ostáva vpravo, aby stĺpce psov držali jednu zvislicu
   naprieč všetkými odpoveďami — to je jediné, čo po zrušenej hlavičke zostalo ako
   vodidlo "ktorý krúžok je čí".
   ⚠️ ROZOSTUP SA MUSÍ ZMENIŤ SPOLU SO ZALOMENÍM. Kým krúžky stoja vedľa vety, delí
   odpovede 9 px a je to jasné. Po zalomení je medzi vetou a JEJ krúžkami rovnaká
   medzera ako medzi krúžkami a NASLEDUJÚCOU vetou — a rad sa opticky prilepí
   k cudzej odpovedi. Preto sa medzera medzi odpoveďami zdvojnásobí a rad krúžkov sa
   naopak pritiahne k svojej vete. */
@media (max-width:500px){
  .nq-opts{ gap:20px; }
  .nq-optrow{ flex-wrap:wrap; row-gap:5px; }
  .nq-dogs{ width:100%; justify-content:flex-end; flex-wrap:wrap; gap:8px; }
}

/* ── ÚVOD: vitráž vľavo, text vpravo ──────────────────────────────────────────
   Karta úvodu je jediná, ktorá siaha po celej výške obrazovky — obraz potrebuje
   výšku, inak je z portrétnej vitráže pás s kusom psa. Text preto stojí VEDĽA
   obrazu, nie pod ním; pod obrazom by ho dole odrezala hrana okna. */
.nq-intro{
  display:grid; grid-template-columns:minmax(0,0.72fr) minmax(0,1fr);
  padding:0; overflow:hidden;
}
.nq-introart{ position:relative; min-height:100%; }
/* PRECHOD ROBÍ MASKA OBRAZU, NIE FAREBNÝ PREKRYV (Matej 14.8.: „aby nebola vidno
   hranica farebneho prechodu"). Prekryv musel uhádnuť odtieň papyrusu v mieste hrany,
   lenže T.cardGrad je 160° gradient ${o.card} → #EAD6A6 — trafil sa teda v jedinom bode
   a všade inde bolo vidno švík. Maskou sa obraz stráca do PRIEHĽADNA a spod neho
   presvitá samotná karta, nech má v tom mieste akúkoľvek farbu. */
.nq-introart img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:left center; display:block;
  -webkit-mask-image:linear-gradient(to right,
    #000 30%, rgba(0,0,0,0.86) 52%, rgba(0,0,0,0.45) 76%, transparent 97%);
  mask-image:linear-gradient(to right,
    #000 30%, rgba(0,0,0,0.86) 52%, rgba(0,0,0,0.45) 76%, transparent 97%);
}
.nq-introbody{
  padding:24px 24px; display:flex; flex-direction:column; justify-content:center;
  min-width:0;
}
/* DVE OSI = DVE VEĽKÉ ŠTVORCOVÉ DLAŽDICE VEDĽA SEBA (Matej 14.8.: „daj ich vačšie
   v štvorcových blokoch vedľa seba aj s emoji alebo ikonou s brandu… su nevyrazne
   neputave a vyzera to chudobne"). Predtým to boli dva ploché riadky Tile cez celú
   šírku — text bez obrazu, nič, na čo by oko skočilo.
   Geometria je z matrice PACK_BOX.subblock: papyrusový gradient + PLNÝ zlatý rám
   + r12, nie plochý tileBg so slabým okrajom. */
.nq-axes{ display:grid; grid-template-columns:1fr; grid-auto-rows:1fr; gap:8px; }
/* TRI RIADKY POD SEBOU, nie tri stĺpce (Matej 26. 9. 2026: „daj tie bloky pod seba
   aby to vyšlo krajšie teraz je to moc úzke… rozmer zachovaj len zmeň štruktúru").
   V troch stĺpcoch mala dlaždica ~180 px a SK popis sa lámal na sedem riadkov po
   dvoch slovách. Riadok = medailón vľavo, nadpis a popis vpravo; celková výška
   ostáva tá istá, zmenila sa len skladba. grid-auto-rows 1fr drží tri rovnaké riadky.
   ⚠️ Tento blok je JS template literal — spätný apostrof ho zhodí a tsc to
   nechytí. Do komentárov v CSS ich nepíš. */
.nq-axis{
  display:grid; grid-template-columns:auto 1fr; grid-template-rows:auto auto;
  column-gap:16px; row-gap:4px; align-content:center; align-items:center;
  text-align:left; padding:8px 16px;
  background:${ee.subblock.background};
  border:${ee.subblock.border}; border-radius:${ee.subblock.borderRadius}px;
  box-shadow:${ee.subblock.boxShadow};
}
.nq-axis .nq-axisicon{ grid-row:1 / span 2; }
/* ÚVOD SA NA PC ZMESTÍ BEZ SCROLLU (Matej 26. 9. 2026: „urob to tak aby na PC nebol
   scrolling"). Pri 724 px výšky (Matejovo okno 1477x724) vyjde stránka presne na okno.
   Na nižšom okne sa podľa PAGE_AIR zmenšuje OBSAH, nie vzduch: medailóny, odsadenie
   dlaždíc a čiara. Rezerva nad a pod kartou ostáva. */
@media (min-width:761px) and (max-height:760px){
  .nq-introbody{ padding:16px 24px; }
  .nq-introrule{ margin:8px 0 !important; }
  .nq-axes{ gap:4px; }
  .nq-axis{ padding:4px 16px; }
  .nq-axisicon{ width:40px; height:40px; }
}
.nq-axis .nq-axistitle{ align-self:end; }
.nq-axis .nq-axissub{ align-self:start; }
/* Ikonka je z hand-drawn kitu (BrandIcon), NIE lucide a nie emoji — medailón okolo
   nej je zlaté halo, aby dlaždica mala ohnisko aj bez farby. */
.nq-axisicon{
  width:48px; height:48px; border-radius:999px; display:grid; place-items:center;
  flex:0 0 auto;
  background:radial-gradient(circle at 34% 28%, rgba(245,199,61,0.34), rgba(201,154,63,0.08) 72%);
  border:1px solid ${_.border};
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.65);
  transition:transform .35s ease;
}
.nq-axistitle{
  font-family:'Cinzel',serif; font-weight:700; text-transform:uppercase;
  font-size:14px; letter-spacing:.14em; line-height:1.2; color:${o.inkStrong};
}
.nq-axissub{
  font-family:'Space Grotesk',sans-serif; font-size:12px; line-height:1.45; color:${o.inkWarm};
}

/* ── POTVRDENIE PRI ODCHODE ──────────────────────────────────────────────────
   Panel = úroveň 4 matrice (PACK_BOX.panel): papyrusový gradient, 1.5px zlatý rám,
   r14. Scrim je tmavý s rozostrením, aby bolo vidno, že kvíz nezmizol — len čaká. */
.nq-scrim{
  z-index:60; padding:24px;
}
.nq-confirm{
  width:100%; max-width:420px; padding:24px 24px;
  background:linear-gradient(135deg,${o.card} 0%,#F2E2BD 100%);
  border:1.5px solid ${o.cardEdge}; border-radius:14px;
  box-shadow:${fe.panel};
}
/* Zostať je hlavná voľba, preto zlatá a prvá. Odísť je stratové — ostáva ghost.
   Na mobile idú pod seba, aby sa nedalo trafiť odchod pri mierení na zostať. */
.nq-confirmbtns{ display:flex; gap:10px; margin-top:18px; }
.nq-confirmbtns .nq-gold{ flex:1 1 auto; }
@media (max-width:460px){
  .nq-confirmbtns{ flex-direction:column-reverse; }
  .nq-confirmbtns .nq-ghost{ width:100%; }
}

/* ── VYHODNOTENIE PODĽA MATRICE (obrazovka výsledku) ──────────────────────────
   Meno vľavo v pevnom stĺpci, aby prúžky začínali na jednej zvislici — inak sa
   pri rôzne dlhých názvoch (Fire vs. The Companion) nedá porovnať dĺžka. */
.nq-scorerow{ display:grid; grid-template-columns:96px 1fr 40px; align-items:center; gap:10px; }
.nq-scorename{
  font-family:'Space Grotesk',sans-serif; font-size:12px; line-height:1.25;
  color:${o.inkWarm}; text-align:right;
}
.nq-scorename.is-top{ color:${o.inkStrong}; font-weight:600; }
.nq-scoretrack{
  position:relative; display:block; height:9px; border-radius:999px; overflow:hidden;
  background:rgba(201,154,63,0.14); box-shadow:inset 0 1px 2px rgba(60,38,8,0.16);
}
/* Nevíťazné prúžky sú zámerne bez gradientu — zlatý lesk má na obrazovke jedno
   ohnisko, a tým je výsledok. Ak by sa leskli všetky, nevidno víťaza. */
.nq-scorefill{
  position:absolute; inset:0 auto 0 0; border-radius:999px;
  background:${_.border}; transition:width .5s ease;
}
.nq-scorefill.is-top{
  background:linear-gradient(90deg,#F5C73D,#E69E1A);
  box-shadow:0 0 14px rgba(230,158,26,0.5);
}
.nq-scorepct{
  font-family:'Space Grotesk',sans-serif; font-size:10px; color:${o.inkWarm}; text-align:right;
  font-variant-numeric:tabular-nums;
}
.nq-scorepct.is-top{ color:${o.inkStrong}; font-weight:600; }
.nq-scorenote{
  font-family:'Space Grotesk',sans-serif; font-size:10px; line-height:1.5;
  color:${o.inkFaint}; margin:10px 0 0;
}
@media (max-width:560px){
  .nq-scorerow{ grid-template-columns:82px 1fr 34px; gap:8px; }
  .nq-scorename{ font-size:10px; }
}
/* ── ODZNAKY (14 ks: 5 elementov + 5 základných + 4 zvláštne úlohy) ──────────
   Zdroj vstupy/vizualna-identita/, do webu idú ako 256 px webp s alfou.
   ⚠️ Plátno je štvorec a NEOREZALO SA: zvláštne úlohy sú v sade zámerne 0,88×
   („sedia na základnej navrch, nie sú jej súperi") a orez by ten pomer zahodil.
   Preto majú všetky odznaky rovnaký box a rozdiel vo veľkosti nesie obrázok. */
.nq-badges{
  display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:start;
  margin:16px auto 0;
  /* ⚠️ STROP JE POVINNÝ. Karta má na desktope ~976 px a bez neho grid roztiahol
     dvojicu k obom okrajom — dva malé odznaky s 500 px prázdna medzi nimi. Sú to
     dva výsledky JEDNÉHO psa, majú sa čítať ako dvojica, nie ako dva rohy. */
  max-width:400px;
}
.nq-badge{ display:flex; flex-direction:column; align-items:center; text-align:center; }
.nq-badgeart{
  width:clamp(92px,29vw,132px); aspect-ratio:1; object-fit:contain; display:block;
}
.nq-badgelbl{
  font-family:'Space Grotesk',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:0.22em; text-transform:uppercase; color:${o.cardEdge}; margin-top:8px;
}
.nq-badgename{
  font-family:'Cinzel',serif; font-weight:700; text-transform:uppercase;
  font-size:clamp(13px,3.6vw,16px); line-height:1.2; letter-spacing:0.02em;
  color:${o.inkStrong}; margin-top:3px;
}
/* Zvláštne úlohy: VŠETKY V RADE, menšie (Matej 20.8.). Pes ich môže mať 0–4 —
   rad sa zalomí, počet sa nikde neskrýva a poradie sedí s popismi pod ním. */
.nq-specrow{
  display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-bottom:12px;
}
.nq-specart{ width:64px; aspect-ratio:1; object-fit:contain; display:block; }
@media (max-width:560px){
  .nq-badges{ gap:10px; }
  .nq-specart{ width:56px; }
}
/* PÁS S VITRÁŽOU NAD OTÁZKAMI — LEN MOBIL (Matej 14.8.: „ten obrázok by som možno
   nechal naprieč celým kvízom na mobile… v hornej časti"). Na PC sa nekreslí: tam by
   ubral výšku, ktorú otázky potrebujú, a vitráž už aj tak stojí vedľa textu v úvode.
   Je NIŽŠÍ než pás v úvode — úvod je plagát, otázka je práca.
   ⚠️ Záporné okraje sa MUSIA rovnať paddingu karty (20px 18px), inak pás nesiahne
   po hranu; karta k tomu potrebuje overflow:hidden, aby sa orezal do jej rádiusu. */
.nq-band{ display:none; }

@media (max-width:760px){
  .nq-band{
    display:block; position:relative; height:140px;
    margin:-20px -18px 14px; overflow:hidden;
  }
  /* ⚠️ Výsek NESMIE prerezať psovi papuľu. Pri 140 px vidno z portrétu ~26 % výšky;
     6 % zhora posadí do pásu ohnivý medailón a hlavu po oči — teda kus obrazu, ktorý
     sa číta ako ozdoba. Pri 16 % (hodnota z úvodu) vyšiel z toho polovičný ňufák. */
  .nq-band img{
    width:100%; height:100%; object-fit:cover; object-position:left 6%; display:block;
    -webkit-mask-image:linear-gradient(to bottom, #000 40%, rgba(0,0,0,0.6) 74%, transparent 99%);
    mask-image:linear-gradient(to bottom, #000 40%, rgba(0,0,0,0.6) 74%, transparent 99%);
  }
  .nq-intro{ grid-template-columns:1fr; }
  /* Na mobile je obraz pás hore. ⚠️ object-position center tu NEFUNGUJE: pri nízkom
     páse sa z portrétu 500x750 vyreže stred a psovi ostane iba ňufák a hruď —
     hlava je v hornej tretine, preto left 16%.
     280 px (Matej 14.8.: „na mobile zmenši na vyšku bloky aby za zvačšil obrázok") —
     výška sa vzala dlaždiciam nižšie, nie pridala karte. */
  .nq-introart{ min-height:0; height:280px; }
  .nq-introart img{
    object-position:left 16%;
    -webkit-mask-image:linear-gradient(to bottom,
      #000 46%, rgba(0,0,0,0.72) 72%, transparent 99%);
    mask-image:linear-gradient(to bottom,
      #000 46%, rgba(0,0,0,0.72) 72%, transparent 99%);
  }
  .nq-introart::after{
    background:linear-gradient(to bottom, rgba(251,245,230,0) 52%, rgba(251,245,230,0.95) 100%);
  }
  .nq-introbody{ padding:16px 16px 24px; }
  /* Pod 760 px riadky len zúžia odsadenie a medailón — skladba je tá istá ako na PC. */
  .nq-axis{ padding:12px; column-gap:12px; border-radius:12px; }
  .nq-axisicon{ width:46px; height:46px; }
  .nq-axisicon img{ width:26px; height:26px; }
  .nq-axistitle{ font-size:12px; letter-spacing:0.14em; }
  .nq-axissub{ font-size:10px; line-height:1.42; }
}

/* ════════════════════════════════════════════════════════════════════════════
   VÝSLEDOK = DOKUMENT (prefix nqd-). Predloha: plany/vyslednica-navrhy/kolo4.html
   Jazyk je prevzatý z CertificateCard.tsx — zrno, vinetácia, dvojrám, medailón,
   pečať. Je to VEDOMÁ výnimka z papyrusového locku, rovnako ako share karty
   a certifikát: dokumentový povrch má vlastný dizajn.
   ⚠️ Tento blok je JS template literal. Spätný apostrof v komentári zhodí build
   a tsc to nechytí — po zásahu vždy npm run build.
   ════════════════════════════════════════════════════════════════════════════ */
.nqd{
  position:relative; overflow:hidden; color:#1a0900; border-radius:14px;
  background:
    radial-gradient(ellipse 70% 40% at 50% 0%, rgba(180,120,30,.12) 0%, transparent 70%),
    radial-gradient(ellipse 60% 35% at 50% 100%, rgba(150,100,20,.10) 0%, transparent 70%),
    linear-gradient(170deg,#f6edd8 0%,#f0e3c4 25%,#ecdbb8 55%,#f2e4c8 80%,#eee0c0 100%);
}
.nqd::before{
  content:''; position:absolute; inset:0; z-index:1; pointer-events:none; background-size:200px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23f)' opacity='0.055'/%3E%3C/svg%3E");
}
.nqd::after{
  content:''; position:absolute; inset:0; z-index:2; pointer-events:none;
  background:radial-gradient(ellipse 90% 95% at 50% 50%, transparent 58%, rgba(80,45,5,.26) 100%);
}
.nqd > *{ position:relative; z-index:3; }
.nqd-framed{ border:3px solid #8a5c10; border-radius:8px; padding:8px; margin:0; }
.nqd-inner{ border:1px solid rgba(122,80,16,0.28); border-radius:2px; padding:32px 32px 32px; }

/* ornament medzi sekciami: čiara – kosoštvorce – čiara */
.nqd-orn{ display:flex; align-items:center; gap:6px; margin:22px 0; }
.nqd-orn i{ flex:1; height:1px; background:linear-gradient(90deg,transparent,#8a5c10,transparent); }
.nqd-orn s{ width:4px; height:4px; background:#8a5c10; transform:rotate(45deg); opacity:.55; }
.nqd-orn s.big{ width:6px; height:6px; opacity:1; }

/* ── HLAVIČKA ─────────────────────────────────────────────────────────── */
.nqd-medal{
  border-radius:50%; padding:4px; width:154px; height:154px; margin:0 auto 14px;
  background:conic-gradient(#c9922a 0deg,#f5d97a 60deg,#8a5c10 120deg,#f0cc60 180deg,#7a4c08 240deg,#e8c060 300deg,#c9922a 360deg);
}
.nqd-medal > img, .nqd-medal > span{
  border-radius:50%; width:100%; height:100%; object-fit:cover; object-position:center top;
  filter:sepia(.1) contrast(1.08) brightness(1.02); background:#f0e0b0; display:grid;
  place-items:center; font-family:'Cinzel Decorative','Cinzel',serif; font-weight:900;
  font-size:56px; color:#8a5c10;
}
.nqd-who{
  font-family:'Cinzel Decorative','Cinzel',serif; font-weight:900; letter-spacing:0.02em;
  text-transform:uppercase; color:#1a0900; font-size:38px; line-height:1; text-align:center;
}
/* Heroglyf VOĽNE — bez rámu. multiply ho posadí do papyrusu namiesto nálepky. */
.nqd-glyph{ width:100%; max-width:440px; margin:18px auto 0; mix-blend-mode:multiply; opacity:.94; display:block; }

/* ── TRI ODZNAKY ──────────────────────────────────────────────────────────
   ⚠️ Rovnaká ŠÍRKA aj VÝŠKA všetkých slotov. Zvláštna úloha má obrázok zámerne
   0,88× (sedí na základnej, nie je jej súper) — keby jej to zúžilo aj RÁM,
   popisky by skončili každý inde a rad by vyzeral ako chyba sadzby. */
.nqd-trio{ display:flex; justify-content:center; align-items:stretch; gap:10px; flex-wrap:wrap; margin-top:6px; }
.nqd-slot{
  width:172px; text-align:center; padding:16px 12px 16px; border:1px solid rgba(122,80,16,0.28);
  border-radius:12px; background:rgba(255,255,255,.24); position:relative;
  display:flex; flex-direction:column;
}
.nqd-slot::before,.nqd-slot::after{ content:''; position:absolute; width:9px; height:9px; border:1px solid #8a5c10; }
.nqd-slot::before{ top:5px; left:5px; border-right:0; border-bottom:0; }
.nqd-slot::after{ bottom:5px; right:5px; border-left:0; border-top:0; }
.nqd-rank{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:10px; letter-spacing:0.22em; color:#8a5c10; opacity:.8; }
.nqd-art{ height:116px; display:grid; place-items:center; margin:6px 0 8px; }
.nqd-art img{ width:104px; margin:0; filter:drop-shadow(0 8px 18px rgba(60,38,8,.32)); }
.nqd-slot.spec .nqd-art img{ width:88px; }
.nqd-lbl{
  margin-top:auto; font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:${N.micro}px;
  letter-spacing:0.22em; text-transform:uppercase; color:${o.inkWarm};
}
.nqd-nm{
  font-family:'Cinzel',serif; font-weight:900; font-size:${N.lead}px; letter-spacing:.02em;
  text-transform:uppercase; color:#1a0900; margin-top:2px; line-height:1.2;
}
.nqd-slot.spec .nqd-nm{ font-size:${N.body}px; }

/* ── NADPISY SEKCIÍ ───────────────────────────────────────────────────────
   ⚠️ Číslo sekcie MUSÍ sedieť s číslom odznaku v hlavičke. I = konštitúcia na
   oboch miestach — číslo je sľub, buď platí dvakrát, alebo tam nemá čo robiť. */
.nqd-head{ text-align:center; margin:0 0 18px; }
.nqd-head .num{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12px; letter-spacing:0.26em; color:#8a5c10; }
.nqd-head h2{
  font-family:'Cinzel',serif; font-weight:900; font-size:${N.h1}px; letter-spacing:0.02em;
  text-transform:uppercase; color:#1a0900; margin:5px 0 0; line-height:1.1;
}
.nqd-head .sub{ font-family:'Space Grotesk',sans-serif; font-size:${N.label}px; color:${o.inkWarm}; margin-top:6px; }
.nqd-wing{ display:flex; align-items:center; justify-content:center; gap:8px; margin-top:9px; }
.nqd-wing i{ width:64px; height:1px; background:linear-gradient(90deg,transparent,#8a5c10); }
.nqd-wing i:last-child{ background:linear-gradient(90deg,#8a5c10,transparent); }
.nqd-wing s{ width:6px; height:6px; background:#8a5c10; transform:rotate(45deg); }

/* ── PANELY (rohové značky, dva stupne) ───────────────────────────────── */
.nqd-panel{
  position:relative; border:1px solid #8a5c10; border-radius:8px; padding:24px 24px 16px;
  background:rgba(255,252,242,.42);
}
.nqd-panel::before,.nqd-panel::after{ content:''; position:absolute; width:14px; height:14px; border:2px solid #8a5c10; }
.nqd-panel::before{ top:-1px; left:-1px; border-right:0; border-bottom:0; border-radius:8px 0 0 0; }
.nqd-panel::after{ bottom:-1px; right:-1px; border-left:0; border-top:0; border-radius:0 0 10px 0; }
.nqd-panel.quiet{ border-color:rgba(122,80,16,0.28); background:rgba(122,80,16,.05); }
.nqd-panel.quiet::before,.nqd-panel.quiet::after{ border-color:rgba(122,80,16,0.28); }

.nqd-eyebrow{
  font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:${N.micro}px; letter-spacing:.26em;
  text-transform:uppercase; color:#8a5c10; margin:0 0 8px;
}
.nqd p.body{ font-family:'Space Grotesk',sans-serif; font-size:${N.body}px; line-height:1.65; color:#1a0900; margin:0 0 10px; }
.nqd p.dim{ font-family:'Space Grotesk',sans-serif; font-size:${N.label}px; line-height:1.6; color:#5a3a0a; margin:0; }
/* Zvýraznenie nesú DÁTA (**takto**), sadzba mu len dá váhu. */
.nqd b{ font-weight:600; color:#1a0900; }

.nqd-list{ margin:0; padding:0; display:grid; gap:10px; }
.nqd-list li{
  list-style:none; position:relative; padding-left:24px;
  font-family:'Space Grotesk',sans-serif; font-size:${N.body}px; line-height:1.6; color:#1a0900;
}
.nqd-list li::before{
  content:''; position:absolute; left:3px; top:8px; width:6px; height:6px;
  background:#8a5c10; transform:rotate(45deg);
}
.nqd-list.tight{ gap:8px; }
.nqd-duo{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px; }

/* ── I · KONŠTITÚCIA: čínsky znak + päť korešpondencií ────────────────── */
.nqd-elhero{ display:grid; grid-template-columns:150px 1fr; gap:20px; align-items:center; }
.nqd-cnbox{
  text-align:center; padding:16px 12px 12px; border:1px solid #8a5c10; border-radius:8px;
  background:rgba(255,252,242,.5); position:relative;
}
.nqd-cnbox::before,.nqd-cnbox::after{ content:''; position:absolute; width:12px; height:12px; border:1px solid #8a5c10; }
.nqd-cnbox::before{ top:4px; left:4px; border-right:0; border-bottom:0; }
.nqd-cnbox::after{ bottom:4px; right:4px; border-left:0; border-top:0; }
.nqd-cn{ font-size:64px; line-height:1; color:#1a0900; font-weight:500; }
.nqd-cnname{
  font-family:'Cinzel',serif; font-weight:900; font-size:16px; letter-spacing:0.14em;
  text-transform:uppercase; color:#1a0900; margin-top:8px;
}
.nqd-cnpin{ font-family:'Space Grotesk',sans-serif; font-size:10px; color:${o.inkWarm}; font-style:italic; }
/* ⚠️ Päť PEVNÝCH stĺpcov. auto-fit zalomí 4+1 a Colour ostane sama ako nedorobok. */
.nqd-facts{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-top:14px; }
.nqd-fact{ border:1px solid rgba(122,80,16,0.28); border-radius:8px; padding:8px 12px; background:rgba(255,255,255,.22); }
.nqd-fact .k{
  display:block; font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:${N.micro}px;
  letter-spacing:0.22em; text-transform:uppercase; color:${o.inkWarm};
}
.nqd-fact .v{ display:block; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12px; color:#1a0900; margin-top:2px; }

/* ── IV · USMERNENIE ──────────────────────────────────────────────────────
   Kombinačný riadok stojí SAMOSTATNE nad omylmi. Je to jediná veta dokumentu,
   kde sa obe osi stretnú — zamiešaná medzi šestnásť riadkov by zanikla. */
.nqd-pair{ position:relative; border:1px solid #8a5c10; border-radius:8px; padding:16px 16px;
  background:linear-gradient(135deg, rgba(245,199,61,.16), rgba(230,158,26,.09)); margin-bottom:20px; }
.nqd-pair .cross{
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:10px; letter-spacing:0.22em;
  text-transform:uppercase; color:#8a5c10; margin-bottom:6px;
}
.nqd-cat{ margin-top:20px; }
.nqd-cat:first-of-type{ margin-top:4px; }
.nqd-cap{ display:flex; align-items:center; gap:10px; margin-bottom:11px; }
.nqd-cap h3{
  font-family:'Cinzel',serif; font-weight:900; font-size:14px; letter-spacing:0.22em;
  text-transform:uppercase; color:#1a0900; margin:0; white-space:nowrap;
}
.nqd-cap i{ flex:1; height:1px; background:linear-gradient(90deg,#8a5c10,transparent); }
.nqd-rules{ display:grid; gap:12px; margin:0; padding:0; }
.nqd-rules li{ list-style:none; display:grid; grid-template-columns:30px 1fr; gap:12px; align-items:start; }
.nqd-rules .n{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14px; color:#8a5c10; text-align:right; line-height:1.3; }
.nqd-rules b.t{
  display:block; font-family:'Cinzel',serif; font-weight:700; font-size:12px; letter-spacing:0.02em;
  text-transform:uppercase; color:#1a0900; margin-bottom:3px;
}
.nqd-rules span.d{ font-family:'Space Grotesk',sans-serif; font-size:12px; line-height:1.6; color:#5a3a0a; }

/* ── V · ROZPAD (pentagram) ───────────────────────────────────────────── */
.nqd-radars{ display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:center; }
.nqd-radar{ width:100%; max-width:340px; margin-inline:auto; display:block; }
.nqd-note{ font-family:'Space Grotesk',sans-serif; font-size:12px; color:${o.inkWarm}; margin:14px 0 0; text-align:center; }
.nqd-foot{ display:flex; align-items:flex-end; gap:16px; }
.nqd-foot p{ flex:1; font-family:'Space Grotesk',sans-serif; font-size:10px; color:#5a3a0a; line-height:1.55; margin:0; }
.nqd-seal{ width:98px; opacity:.9; flex:0 0 auto; }

@media(max-width:900px){ .nqd-facts{ grid-template-columns:repeat(3,1fr); } }
@media(max-width:720px){
  .nqd-inner{ padding:24px 16px 24px; }
  .nqd-who{ font-size:29px; }
  .nqd-head h2{ font-size:${N.h2}px; }
  .nqd-elhero{ grid-template-columns:1fr; gap:14px; }
  .nqd-cnbox{ max-width:150px; margin-inline:auto; }
  .nqd-duo{ grid-template-columns:1fr; }
  .nqd-radars{ grid-template-columns:1fr; }
}
@media(max-width:520px){
  /* VIAC MIESTA PRE TEXT (Matej 28. 9. 2026 nad hárkom plany/nakres-kviz-povahy-2026-09-28: „ano").
     Štyri vnorené rámy (stránka → dvojitý rám → panel → odrážka) nechávali textu ~225 px z 390.
     Rámy aj rohové značky ostávajú — ustupujú len okraje. */
  .nqd-framed{ padding:${S.xs}px; }
  .nqd-inner{ padding:${S.xl}px ${S.md}px; }
  .nqd-panel{ padding:${S.xl}px ${S.lg}px ${S.md}px; }
  .nqd-list li{ padding-left:${S.lg}px; }
  .nqd-list li::before{ left:1px; }
  .nqd-facts{ grid-template-columns:repeat(2,1fr); }
  .nqd-medal{ width:124px; height:124px; }
  .nqd-slot{ width:calc(50% - 5px); }
  .nqd-foot{ flex-direction:column; align-items:center; text-align:center; gap:12px; }
}
`,Ga={width:"100%",maxWidth:760,margin:"0 auto",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"},Ha=`
/* ── JEDNOLIATY KVÍZ (Matej 1. 11. 2026: „tmavé pozadie tam nebude a nedajme to ani do bloku ale do jednoliateho pozadia a trošku to
   obzvláštnime… zostanem v brande"). Hladký papyrus bez heroglyfov a bez rámov. Charakter nesie VITRÁŽ od kraja po kraj, ktorá sa do
   papyrusu rozplynie, a STOPA LABIEK. Výber = lapisový tint (moja voľba), poloha = zlato. Stojí za NQ_CSS a prebíja ho poradím. */
.nq-plain.pk-paper::before,.nq-plain.pk-paper::after{display:none;}
.nq-plain .nq-band,.nq-plain .nq-introart{display:block;position:relative;overflow:hidden;min-height:0;margin:0 -16px 8px;}
.nq-plain .nq-band{height:120px;}
.nq-plain .nq-introart{height:320px;}
.nq-plain .nq-band img,.nq-plain .nq-introart img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:left top;display:block;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 24px,#000 58%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 24px,#000 58%,transparent 100%);}
.nq-plain .nq-intro{display:block;overflow:visible;}
.nq-plain .nq-introbody{padding:0;}
.nq-plain .nq-axes{gap:0;}
.nq-plain .nq-axis{background:none;border:0;border-radius:0;box-shadow:none;padding:12px 0;border-bottom:1px solid ${ie.border};}
.nq-plain .nq-axis:last-child{border-bottom:0;}
.nq-plain .nq-opts{gap:4px;margin:0 -12px;}
.nq-plain .nq-opt,.nq-plain .nq-optlbl{padding:12px;}
.nq-plain .nq-opts:has(.nq-optrow){gap:16px;}
.nq-plain .nq-opt,.nq-plain .nq-optlbl{background:none;border:1.5px solid transparent;box-shadow:none;}
.nq-plain .nq-opt:hover,.nq-plain .nq-optlbl:hover{background:rgba(22,48,122,0.06);border-color:transparent;box-shadow:none;transform:none;}
.nq-plain .nq-opt.is-on,.nq-plain .nq-optlbl.is-on,.nq-plain .nq-opt.is-on:hover,.nq-plain .nq-optlbl.is-on:hover{${Ee(j.edge,ae.lapis)}}
.nq-plain .nq-optlbl.is-some{background:rgba(22,48,122,0.07);border-color:transparent;box-shadow:inset 4px 0 0 ${j.edge};color:${ae.lapis};}
.nq-plain .nq-mark{background:none;}
.nq-plain .is-on > .nq-mark{background:${j.edge};border-color:${j.edge};color:#fff;}
.nq-plain .nqd{background:none;border:0;border-radius:0;box-shadow:none;overflow:visible;}
.nq-plain .nqd::before,.nq-plain .nqd::after{display:none;}
.nq-plain .nqd-framed{border:0;padding:0;}
.nq-plain .nqd-inner{border:0;padding:0;}
.nq-paws{display:flex;align-items:center;justify-content:space-between;height:24px;}
.nq-paw{width:16px;height:16px;background:${o.cardEdge};opacity:.28;transform:rotate(90deg) translateX(-3px);transition:opacity .3s;
  -webkit-mask:url('/icons/pack/paw-solid.svg') center/contain no-repeat;mask:url('/icons/pack/paw-solid.svg') center/contain no-repeat;}
.nq-paw:nth-child(even){transform:rotate(90deg) translateX(3px);}
.nq-paw.on{opacity:1;}
.nq-paw.last{animation:nq-paw-in .45s cubic-bezier(.3,1.5,.5,1);}
@keyframes nq-paw-in{from{scale:.3;opacity:.2;}to{scale:1;opacity:1;}}
.nq-step{animation:nq-step-in .35s ease both;}
@keyframes nq-step-in{from{opacity:0;translate:0 8px;}to{opacity:1;translate:0 0;}}
@media (prefers-reduced-motion:reduce){.nq-step,.nq-paw.last{animation:none;}}
@media (min-width:640px){
  .nq-plain .nq-band,.nq-plain .nq-introart{margin:0 0 8px;}
  .nq-plain .nq-band{height:160px;}
  .nq-plain .nq-introart{height:360px;}
  .nq-plain .nq-introart img{object-position:center 12%;}
  .nq-plain .nq-band img{object-position:center top;}
  .nq-plain .nq-intro,.nq-plain .nq-step{max-width:640px;margin-left:auto;margin-right:auto;width:100%;}
}
`;function qe(n){const s=n<=2?54:n<=4?44:38;return{...Ga,"--nq-dog":`${s}px`}}const Ua=340;function ze({children:n}){return e.jsx("div",{style:{fontFamily:f,fontSize:10,fontWeight:500,letterSpacing:".26em",textTransform:"uppercase",color:o.cardEdge,marginBottom:8},children:n})}function A({s:n}){const s=n.split("**");return e.jsx(e.Fragment,{children:s.map((r,a)=>a%2?e.jsx("b",{children:r},a):e.jsx("span",{children:r},a))})}function W(){return e.jsxs("div",{className:"nqd-orn",children:[e.jsx("i",{}),e.jsx("s",{}),e.jsx("s",{className:"big"}),e.jsx("s",{}),e.jsx("i",{})]})}function G({num:n,title:s,sub:r}){return e.jsxs("div",{className:"nqd-head",children:[e.jsx("div",{className:"num",children:n}),e.jsx("h2",{children:s}),r&&e.jsx("div",{className:"sub",children:r}),e.jsxs("div",{className:"nqd-wing",children:[e.jsx("i",{}),e.jsx("s",{}),e.jsx("i",{})]})]})}function Ue({title:n,from:s,rows:r,tx:a}){return r.length?e.jsxs("div",{className:"nqd-cat",children:[e.jsxs("div",{className:"nqd-cap",children:[e.jsx("h3",{children:n}),e.jsx("i",{})]}),e.jsx("p",{className:"dim",style:{fontSize:10,margin:"-6px 0 10px"},children:s}),e.jsx("ol",{className:"nqd-rules",children:r.map((m,c)=>e.jsxs("li",{children:[e.jsx("span",{className:"n",children:String(c+1).padStart(2,"0")}),e.jsxs("span",{children:[e.jsx("b",{className:"t",children:a(`${m.i18n}.title`,m.titleEN)}),e.jsx("span",{className:"d",children:e.jsx(A,{s:a(`${m.i18n}.text`,m.textEN)})})]})]},m.i18n))})]}):null}function Q({children:n,style:s,className:r}){return e.jsx("div",{className:r,style:{padding:0,...s},children:n})}function Za({className:n}){return e.jsx("div",{className:n,style:{height:2,background:o.rule,margin:"16px 0",border:0}})}function X({tx:n}){return e.jsxs("p",{style:{fontFamily:f,fontSize:10,lineHeight:1.55,color:o.inkWarm,marginTop:12,textAlign:"center"},children:[n(re.i18n,re.textEN),null]})}function we({icon:n,title:s,sub:r}){return e.jsxs("div",{className:"nq-axis",children:[e.jsx("span",{className:"nq-axisicon",children:e.jsx(Oa,{name:n,size:28})}),e.jsx("div",{className:"nq-axistitle",children:s}),e.jsx("div",{className:"nq-axissub",children:r})]})}function Ya({tx:n}){return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:16,marginTop:12,padding:"12px 0"},children:[e.jsx("img",{src:_a,alt:"","aria-hidden":!0,style:{width:44,height:44,objectFit:"contain",borderRadius:"50%",flex:"0 0 auto",background:"radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)",border:"1px solid rgba(91,224,240,0.35)",boxShadow:"0 0 0 4px rgba(59,158,255,0.06), 0 0 20px rgba(59,158,255,0.34)"}}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{style:{fontFamily:f,fontWeight:600,textTransform:"uppercase",fontSize:12,letterSpacing:"0.14em",color:j.edge,marginBottom:4},children:n("pack.nature.intro.dogid","It goes into the DOG ID")}),e.jsx("div",{style:{fontFamily:f,fontSize:12,lineHeight:1.5,color:o.inkWarm},children:n("pack.nature.intro.dogidSub","Your answers go into the DOG ID, so advice on food, routine and training fits this dog.")})]})]})}function Ne(){return e.jsx("div",{className:"nq-band",children:e.jsx("img",{src:oa,alt:"","aria-hidden":!0})})}function Ze({rows:n,color:s}){const c=n.length,b=Math.max(...n.map(g=>Math.max(0,g.value)),0),x=(g,l)=>{const h=-Math.PI/2+g*2*Math.PI/c;return[150+Math.cos(h)*88*l,124+Math.sin(h)*88*l]},q=g=>n.map((l,h)=>x(h,g).join(",")).join(" "),k=n.map((g,l)=>x(l,b?Math.max(0,g.value)/b*.94:0).join(",")).join(" ");return e.jsxs("svg",{className:"nqd-radar",viewBox:"0 0 300 258",role:"img","aria-hidden":!0,children:[[.25,.5,.75,1].map(g=>e.jsx("polygon",{points:q(g),fill:"none",stroke:`rgba(122,80,16,${g===1?.45:.2})`,strokeWidth:1},g)),n.map((g,l)=>{const[h,w]=x(l,1);return e.jsx("line",{x1:150,y1:124,x2:h,y2:w,stroke:"rgba(122,80,16,.28)",strokeWidth:1},l)}),e.jsx("polygon",{points:k,fill:s,fillOpacity:.34,stroke:s,strokeWidth:2}),n.map((g,l)=>{const[h,w]=x(l,b?Math.max(0,g.value)/b*.94:0);return e.jsx("circle",{cx:h,cy:w,r:3.4,fill:s},l)}),n.map((g,l)=>{const[h,w]=x(l,1.26);return e.jsxs("g",{children:[e.jsx("text",{x:h,y:w,textAnchor:"middle",dominantBaseline:"middle",fontFamily:"Space Grotesk, sans-serif",fontSize:g.top?12:10.5,fontWeight:600,fill:g.top?"#1a0900":"#5a3a0a",letterSpacing:"0.5",children:g.label.toUpperCase()}),g.cn&&e.jsx("text",{x:h,y:w+15,textAnchor:"middle",dominantBaseline:"middle",fontSize:14,fill:"#8a5c10",opacity:.85,children:g.cn})]},l)})]})}function Ja({r:n,tx:s}){return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nqd-radars",children:[e.jsxs("div",{children:[e.jsx("p",{className:"nqd-eyebrow",style:{textAlign:"center"},children:s("pack.nature.result.elementLabel","Constitution")}),e.jsx(Ze,{color:"#8a5c10",rows:aa.map(r=>({label:s(T[r].i18n,T[r].labelEN),cn:T[r].cn,value:n.scores.el[r],top:r===n.element}))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"nqd-eyebrow",style:{textAlign:"center"},children:s("pack.nature.result.roleLabel","Role in the pack")}),e.jsx(Ze,{color:"#a8332a",rows:Ca.map(r=>({label:s(se[r].i18n,se[r].labelEN),value:n.scores.role[r],top:r===n.role}))})]})]}),e.jsx("p",{className:"nqd-note",children:s("pack.nature.result.scoresNote","Every answer adds weight to more than one line — this is where they landed.")})]})}const Ye=11;function Se({done:n,total:s,label:r}){const a=s>0?Math.round(n/s*100):0,m=Math.round(a/100*Ye);return e.jsxs("div",{className:"nq-prog",children:[e.jsxs("div",{className:"nq-proghead",children:[e.jsx("span",{className:"nq-proglbl",children:r}),e.jsxs("span",{className:"nq-prognum",children:[a,"%"]})]}),e.jsx("div",{className:"nq-paws",role:"progressbar","aria-valuenow":n,"aria-valuemin":0,"aria-valuemax":s,children:Array.from({length:Ye},(c,b)=>e.jsx("span",{className:`nq-paw${b<m?" on":""}${b===m-1?" last":""}`},b))})]})}function Je({label:n,mark:s,dogs:r,solo:a,isOn:m,onPickDog:c,onPickAll:b}){const x=r.reduce((l,h)=>l+(m(h.id)?1:0),0),q=r.length>0&&x===r.length,k=x>0&&!q,g=e.jsx("span",{className:"nq-mark","aria-hidden":!0,children:q?e.jsx(L,{name:"fajka",size:18}):s??""});return a?e.jsxs("button",{type:"button",className:`nq-opt${q?" is-on":""}`,onClick:b,children:[g,e.jsx("span",{className:"nq-optxt",children:n})]}):e.jsxs("div",{className:"nq-optrow",children:[e.jsxs("div",{className:`nq-optlbl is-static${q?" is-on":k?" is-some":""}`,children:[g,e.jsx("span",{className:"nq-optxt",children:n})]}),e.jsx("div",{className:"nq-dogs",children:r.map(l=>e.jsx("button",{type:"button",className:`nq-dog${m(l.id)?" is-on":""}`,"aria-label":`${l.dog_name??""}: ${n}`,"aria-pressed":m(l.id),title:l.dog_name??"",onClick:()=>c(l.id),children:l.cloudinary_main_url?e.jsx("img",{src:ta(l.cloudinary_main_url,200),alt:"",loading:"lazy"}):e.jsx("span",{className:"nq-dogfb",children:(l.dog_name||"?").trim().charAt(0).toUpperCase()})},l.id))})]})}function Qa({tx:n}){return e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.5,color:o.inkWarm,margin:"10px 0 0"},children:n("pack.nature.pickHint","Answer for each dog separately — tap that dog’s photo in the row that fits them.")})}function Xa({solo:n,tx:s}){return e.jsxs("div",{style:{margin:"0 0 16px"},children:[e.jsx("div",{style:{fontFamily:f,fontSize:10,fontWeight:500,letterSpacing:".26em",textTransform:"uppercase",color:o.cardEdge,marginBottom:6},children:s("pack.nature.how.eyebrow","How it works")}),e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.55,color:o.inkStrong,margin:0},children:n?s("pack.nature.how.solo","Pick the sentence that fits your dog best and the quiz moves on by itself. There is no wrong answer, nothing is written down until the end, and Back takes you to anything you want to change."):s("pack.nature.how.pack","Each dog answers for themselves: in the row that fits them, tap that dog’s photo. A row half-lit means some of them chose it, fully gold means all of them did. Once every dog has answered, the quiz moves on by itself — and Back takes you to anything you want to change.")})]})}function en({onStay:n,onLeave:s,tx:r}){return e.jsx("div",{role:"dialog","aria-modal":"true",className:"pk-veil pk-veil--modal nq-scrim",onClick:n,children:e.jsxs("div",{className:"nq-confirm",onClick:a=>a.stopPropagation(),children:[e.jsx("h2",{style:{fontFamily:V,fontWeight:700,textTransform:"uppercase",fontSize:16,letterSpacing:"0.02em",color:o.inkStrong,margin:0},children:r("pack.nature.leave.title","Leave the quiz?")}),e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.55,color:o.inkWarm,margin:"10px 0 0"},children:r("pack.nature.leave.body","Your answers are not saved yet — they are written to the DOG ID only at the end. Leave now and you start over.")}),e.jsxs("div",{className:"nq-confirmbtns",children:[e.jsx("button",{type:"button",className:"nq-gold",onClick:n,children:r("pack.nature.leave.stay","Keep going")}),e.jsx("button",{type:"button",className:"nq-ghost",onClick:s,children:r("pack.nature.leave.quit","Leave anyway")})]})]})})}function I({children:n,onClose:s,fill:r,overlay:a}){const m=ea(),c=$e();return e.jsxs("div",{className:"min-h-[100dvh] relative flex flex-col pk-paper nq-plain",style:{color:o.inkStrong},children:[e.jsx("style",{children:va}),e.jsx("style",{children:Ka}),e.jsx("style",{children:Ha}),e.jsxs("div",{className:`relative z-10 mx-auto w-full px-4 sm:px-6 flex flex-col ${r?"flex-1 pb-6":"pb-24"}`,style:{maxWidth:qa.wide,paddingTop:ja,...m?{paddingBottom:"calc(96px + env(safe-area-inset-bottom, 0px))"}:null},children:[m?e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:te.h,marginBottom:te.content-te.top-te.h},children:e.jsx(Sa,{tone:"pale",onClick:s,label:c("pack.quiz.back")})}):e.jsx(Na,{onBack:s,backLabel:c("pack.quiz.back"),task:!0}),r?e.jsx("div",{className:"flex-1 flex flex-col",style:{minHeight:0},children:n}):n]}),a]})}function an({b:n,own:s,tx:r}){if(!n.top)return null;const a=n.top.side==="excess"?r("pack.nature.balance.excess","too much"):r("pack.nature.balance.deficiency","not enough"),m=r(T[n.top.element].i18n,T[n.top.element].labelEN),c=n.top.support.filter(x=>x!==s),b=x=>e.jsx("span",{className:"pf-pill",style:{fontFamily:f,fontSize:12,padding:"4px 12px",borderRadius:999,border:`1px solid ${o.border}`,background:o.tileBg,color:o.inkStrong},children:r(x.i18n,x.labelEN)},x.id);return e.jsxs(e.Fragment,{children:[e.jsx(G,{num:"I·b",title:r("pack.nature.doc.ib.title","Where the balance is leaning"),sub:r("pack.nature.doc.ib.sub","What you ticked, read the way Chinese medicine reads it")}),e.jsxs("p",{style:{fontFamily:f,fontSize:14,lineHeight:1.6,color:o.inkStrong,margin:"0 0 12px"},children:[r("pack.nature.balance.reading","In Traditional Chinese Medicine this reads as")," ",e.jsxs("b",{children:[a," ",m]}),"."]}),n.signs.length>0&&e.jsxs("div",{className:"nqd-panel quiet",children:[e.jsx("p",{className:"nqd-eyebrow",children:r("pack.nature.balance.signs","What you ticked")}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginTop:6},children:n.signs.map(b)}),n.top.support.length>0&&e.jsxs("p",{className:"dim",style:{marginTop:11},children:[r("pack.nature.balance.support","The elements to lean on here are")," ",e.jsx("b",{children:n.top.support.map(x=>r(T[x].i18n,T[x].labelEN)).join(" · ")}),". ",c.length===0?r("pack.nature.balance.supportHow","Their food notes above are where to start — this is a leaning, not a prescription."):r("pack.nature.balance.supportBelow","Where to start is right below — this is a leaning, not a prescription.")]})]}),c.map(x=>{const q=T[x];return e.jsxs("div",{className:"nqd-panel",style:{marginTop:12},children:[e.jsxs("p",{className:"nqd-eyebrow",children:[r(q.i18n,q.labelEN)," · ",r("pack.nature.doc.food","What suits them")]}),e.jsx("ul",{className:"nqd-list tight",children:q.foodEN.map((k,g)=>e.jsx("li",{children:e.jsx(A,{s:r(`${q.i18n}.food${g}`,k)})},g))})]},x)}),n.diagnoses.length>0&&e.jsxs("div",{style:{padding:"16px 0",marginTop:12},children:[e.jsx("p",{className:"nqd-eyebrow",style:{color:o.cardEdge},children:r("pack.nature.balance.vet","This belongs with your vet")}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6,margin:"8px 0 10px"},children:n.diagnoses.map(x=>e.jsx("span",{className:"pk-pill--dark",style:{fontFamily:f,fontSize:12,padding:"4px 12px",borderRadius:999,border:`1px solid ${o.cardEdge}`,background:"rgba(201,154,63,0.10)",color:o.inkStrong},children:r(x.i18n,x.labelEN)},x.id))}),e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.6,color:o.inkWarm,margin:0},children:r(He.i18n,He.textEN)})]}),e.jsx(W,{})]})}function Qe({dog:n,r:s,b:r,tx:a}){const m=se[s.role],c=T[s.element],b=s.roleSecond?se[s.roleSecond]:null,x=s.elementSecond?T[s.elementSecond]:null,q=(n.dog_name||"").trim().toUpperCase(),k=$a(s),g=s.specials.map(l=>na[l]);return e.jsx("div",{className:"nqd",children:e.jsx("div",{className:"nqd-framed",children:e.jsxs("div",{className:"nqd-inner",children:[e.jsx("div",{className:"nqd-medal",children:n.cloudinary_main_url?e.jsx("img",{src:ta(n.cloudinary_main_url,320),alt:"","aria-hidden":!0}):e.jsx("span",{children:(n.dog_name||"?").trim().charAt(0).toUpperCase()})}),q&&e.jsx("div",{className:"nqd-who",children:q}),n.heroglyph_png_url&&e.jsx("img",{className:"nqd-glyph",src:n.heroglyph_png_url,alt:"","aria-hidden":!0,loading:"lazy"}),e.jsxs("div",{className:"nqd-trio",children:[e.jsxs("div",{className:"nqd-slot",children:[e.jsx("div",{className:"nqd-rank",children:"I"}),e.jsx("div",{className:"nqd-art",children:e.jsx("img",{src:c.art,alt:"","aria-hidden":!0,loading:"lazy"})}),e.jsx("div",{className:"nqd-lbl",children:a("pack.nature.result.elementLabel","Constitution")}),e.jsx("div",{className:"nqd-nm",children:a(c.i18n,c.labelEN)})]}),e.jsxs("div",{className:"nqd-slot",children:[e.jsx("div",{className:"nqd-rank",children:"II"}),e.jsx("div",{className:"nqd-art",children:e.jsx("img",{src:m.art,alt:"","aria-hidden":!0,loading:"lazy"})}),e.jsx("div",{className:"nqd-lbl",children:a("pack.nature.result.roleLabel","Role in the pack")}),e.jsx("div",{className:"nqd-nm",children:a(m.i18n,m.labelEN)})]}),g.map(l=>e.jsxs("div",{className:"nqd-slot spec",children:[e.jsx("div",{className:"nqd-rank",children:"III"}),e.jsx("div",{className:"nqd-art",children:e.jsx("img",{src:l.art,alt:"","aria-hidden":!0,loading:"lazy"})}),e.jsx("div",{className:"nqd-lbl",children:a("pack.nature.result.specialPrefix","Special role")}),e.jsx("div",{className:"nqd-nm",children:a(l.i18n,l.labelEN)})]},l.key))]}),e.jsx(W,{}),e.jsx(G,{num:"I",title:a("pack.nature.doc.i.title","The constitution"),sub:a("pack.nature.doc.i.sub","What they are made of — body, bowl and season. After Traditional Chinese Medicine.")}),e.jsxs("div",{className:"nqd-elhero",children:[e.jsxs("div",{className:"nqd-cnbox",children:[e.jsx("div",{className:"nqd-cn",children:c.cn}),e.jsx("div",{className:"nqd-cnname",children:a(c.i18n,c.labelEN)}),e.jsx("div",{className:"nqd-cnpin",children:c.pinyin})]}),e.jsxs("div",{children:[e.jsx("p",{className:"body",style:{fontSize:14},children:e.jsx(A,{s:a(`${c.i18n}.summary`,c.summaryEN)})}),e.jsx("div",{className:"nqd-facts",children:[["pack.nature.fact.season","Season",c.facts.seasonEN,"season"],["pack.nature.fact.organs","Organs",c.facts.organsEN,"organs"],["pack.nature.fact.emotion","Emotion",c.facts.emotionEN,"emotion"],["pack.nature.fact.taste","Taste",c.facts.tasteEN,"taste"],["pack.nature.fact.colour","Colour",c.facts.colourEN,"colour"]].map(([l,h,w,P])=>e.jsxs("div",{className:"nqd-fact",children:[e.jsx("span",{className:"k",children:a(l,h)}),e.jsx("span",{className:"v",children:a(`${c.i18n}.facts.${P}`,w)})]},P))})]})]}),e.jsxs("div",{className:"nqd-panel",style:{marginTop:16},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.traits","How it shows in a normal day")}),e.jsx("ul",{className:"nqd-list",children:c.traitsEN.map((l,h)=>e.jsx("li",{children:e.jsx(A,{s:a(`${c.i18n}.trait${h}`,l)})},h))})]}),e.jsxs("div",{className:"nqd-duo",children:[e.jsxs("div",{className:"nqd-panel",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.food","What suits them")}),e.jsx("ul",{className:"nqd-list tight",children:c.foodEN.map((l,h)=>e.jsx("li",{children:e.jsx(A,{s:a(`${c.i18n}.food${h}`,l)})},h))})]}),e.jsxs("div",{className:"nqd-panel",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.avoid","What works against them")}),e.jsx("ul",{className:"nqd-list tight",children:c.avoidEN.map((l,h)=>e.jsx("li",{children:e.jsx(A,{s:a(`${c.i18n}.avoid${h}`,l)})},h))})]})]}),e.jsx("p",{className:"dim",style:{fontSize:10,marginTop:9,textAlign:"center"},children:a(Ge.i18n,Ge.textEN)}),e.jsxs("div",{className:"nqd-duo",children:[e.jsxs("div",{className:"nqd-panel quiet",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.body","Body")}),e.jsx("p",{className:"dim",children:e.jsx(A,{s:a(`${c.i18n}.body`,c.bodyEN)})})]}),e.jsxs("div",{className:"nqd-panel quiet",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.watch","Worth keeping an eye on")}),e.jsx("p",{className:"dim",children:e.jsx(A,{s:a(`${c.i18n}.watch`,c.watchEN)})}),e.jsx("p",{className:"dim",style:{fontSize:10,color:o.inkWarm,marginTop:9},children:a("pack.nature.result.notDiagnosis","This is a conversation to have with your vet — not a diagnosis.")})]})]}),x&&e.jsxs("p",{className:"dim",style:{textAlign:"center",marginTop:12},children:[a("pack.nature.result.alsoElement","There is a strong second element"),":"," ",e.jsx("b",{children:a(x.i18n,x.labelEN)})]}),e.jsx(W,{}),r&&e.jsx(an,{b:r,own:s.element,tx:a}),e.jsx(G,{num:"II",title:a("pack.nature.doc.ii.title","The role in the pack"),sub:a("pack.nature.doc.ii.sub","What they hold for the pack — and how much work and rest that means")}),e.jsxs("div",{className:"nqd-panel",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.signs","You will know them by")}),e.jsx("ul",{className:"nqd-list",children:m.signsEN.map((l,h)=>e.jsx("li",{children:e.jsx(A,{s:a(`${m.i18n}.sign${h}`,l)})},h))})]}),e.jsxs("div",{className:"nqd-panel quiet",style:{marginTop:14},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.myth","The usual verdict")}),e.jsxs("p",{style:{fontFamily:f,fontSize:14,fontStyle:"italic",color:o.inkWarm,margin:"0 0 8px"},children:["„",a(`${m.i18n}.myth`,m.mythEN),'"']}),e.jsx("p",{className:"body",style:{margin:0},children:e.jsx(A,{s:a(`${m.i18n}.mythAnswer`,m.mythAnswerEN)})})]}),e.jsxs("div",{className:"nqd-panel quiet",style:{marginTop:14},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.pressure","Under pressure")}),e.jsx("p",{className:"dim",children:e.jsx(A,{s:a(`${m.i18n}.pressure`,m.pressureEN)})})]}),e.jsxs("div",{className:"nqd-panel",style:{marginTop:14},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.duty","What the job asks of the day")}),e.jsx("ul",{className:"nqd-list tight",children:m.dutyEN.map((l,h)=>e.jsx("li",{children:e.jsx(A,{s:a(`${m.i18n}.duty${h}`,l)})},h))})]}),e.jsxs("p",{className:"dim",style:{textAlign:"center",marginTop:12,fontSize:10},children:[a("pack.nature.result.origin","In the source research"),": ",m.originEN,b&&e.jsxs(e.Fragment,{children:[" · ",a("pack.nature.result.alsoRole","They also carry a strong second role"),":"," ",e.jsx("b",{children:a(b.i18n,b.labelEN)})]})]}),g.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(W,{}),e.jsx(G,{num:"III",title:a("pack.nature.doc.iii.title","Special role"),sub:a("pack.nature.doc.iii.sub","Sits ON TOP of the core role — it is not its rival")}),e.jsx("div",{style:{display:"grid",gap:14},children:g.map(l=>e.jsxs("div",{className:"nqd-panel",style:{display:"flex",gap:16,alignItems:"center"},children:[e.jsx("img",{src:l.art,alt:"","aria-hidden":!0,loading:"lazy",style:{width:78,flex:"0 0 auto"}}),e.jsxs("div",{children:[e.jsx("h3",{style:{fontFamily:V,fontWeight:900,fontSize:16,letterSpacing:"0.02em",textTransform:"uppercase",margin:"0 0 5px",color:"#1a0900"},children:a(l.i18n,l.labelEN)}),e.jsx("p",{className:"dim",children:e.jsx(A,{s:a(`${l.i18n}.desc`,l.descEN)})})]})]},l.key))})]}),e.jsx(W,{}),e.jsx(G,{num:"IV",title:a("pack.nature.doc.iv.title","Guidance"),sub:a("pack.nature.doc.iv.sub","The substance is above — what stays here is what cannot be guessed")}),e.jsxs("div",{className:"nqd-panel",children:[k.pair&&e.jsxs("div",{className:"nqd-pair",children:[e.jsxs("div",{className:"cross",children:[a("pack.nature.doc.pair","Where the two meet")," ·"," ",a(m.i18n,m.labelEN)," × ",a(c.i18n,c.labelEN)]}),e.jsx("b",{className:"t",style:{display:"block",fontFamily:V,fontWeight:700,fontSize:12,letterSpacing:"0.02em",textTransform:"uppercase",marginBottom:4,color:"#1a0900"},children:a(`${k.pair.i18n}.title`,k.pair.titleEN)}),e.jsx("span",{style:{fontFamily:f,fontSize:14,lineHeight:1.6,color:"#1a0900"},children:e.jsx(A,{s:a(`${k.pair.i18n}.text`,k.pair.textEN)})})]}),e.jsx(Ue,{title:a("pack.nature.doc.mistakes","Common mistakes"),from:a("pack.nature.doc.mistakesFrom","what most often goes wrong with this result"),rows:k.mistakes,tx:a}),e.jsx(Ue,{title:a("pack.nature.doc.details","Details that help"),from:a("pack.nature.doc.detailsFrom","small things that are not obvious"),rows:k.details,tx:a})]}),Ta(s)&&e.jsxs(e.Fragment,{children:[e.jsx(W,{}),e.jsx(G,{num:"V",title:a("pack.nature.result.scoresTitle","How it added up"),sub:a("pack.nature.doc.v.sub","Every answer adds weight to more than one line")}),e.jsx(Ja,{r:s,tx:a})]}),e.jsx(W,{}),e.jsxs("div",{className:"nqd-foot",children:[e.jsxs("p",{children:["DOGYPT · ",a("pack.nature.doc.footTitle","WHO IS YOUR DOG"),e.jsx("br",{}),a(re.i18n,re.textEN)]}),e.jsx("img",{className:"nqd-seal",src:wa,alt:"","aria-hidden":!0,loading:"lazy"})]})]})})})}function Fn(){var Fe;const n=ba(),[s]=fa(),r=$e(),a=(t,p)=>{const i=r(t);return i===t?p:i},m=ea(),c="magnet-guest",b=s.get("dog"),x=!m&&s.get("view")==="result",q=s.get("from"),k=m?"/magnet":Va(q,b)??Wa,[g,l]=y.useState(m?[{id:c,dog_name:a("magnet.pv.quiz.dog","your dog"),cloudinary_main_url:"/images/magnet/kviz.webp",heroglyph_png_url:null}]:null),[h,w]=y.useState(null),[P,M]=y.useState(x),[z,D]=y.useState("intro"),[R,H]=y.useState(0),[C,Te]=y.useState({}),[O,Ce]=y.useState({}),[K,Oe]=y.useState({}),[le,Ie]=y.useState(!1),[ia,Pe]=y.useState(!1),[ra,De]=y.useState(!1),de=y.useRef({}),pe=y.useRef({}),U=y.useRef(null),Z=()=>{U.current!==null&&(window.clearTimeout(U.current),U.current=null)};y.useEffect(()=>Z,[]),y.useEffect(()=>{window.scrollTo({top:0,behavior:"instant"})},[z,R]),y.useEffect(()=>{if(m)return;let t=!0;return(async()=>{var $;const{data:p}=await Ae.auth.getUser(),i=($=p==null?void 0:p.user)==null?void 0:$.id;if(!i){t&&(Da.filter(F=>!b||F.id===b),l([]));return}let d=Ae.from("dogs").select("id, dog_name, cloudinary_main_url, heroglyph_png_url").in("payment_status",["paid","guest"]).order("created_at",{ascending:!0});const u=await Ra();d=u?d.in("id",u):d.eq("user_id",i),b&&(d=d.eq("id",b));const{data:E}=await d;t&&l(E??[])})(),()=>{t=!1}},[b]);const v=y.useMemo(()=>g??[],[g]),B=v.length===1;y.useEffect(()=>{if(!x||g===null)return;if(g.length===0){M(!1);return}let t=!0;return Ia(g.map(p=>p.id)).then(p=>{var d,u,E,$,F;if(!t)return;const i=[];for(const Le of g){const J=p[Le.id]??{},We=Ea({element:(d=J["nature.element"])==null?void 0:d.value,role:(u=J["nature.role"])==null?void 0:u.value,specials:(E=J["nature.specials"])==null?void 0:E.value,scores:($=J["nature.scores"])==null?void 0:$.value}),Ve=(F=J["nature.balance"])==null?void 0:F.value,ua=ke(Array.isArray(Ve)?Ve:[]);We&&i.push({dog:Le,r:We,b:ua})}w(i),i.length===0&&M(!1)}).catch(()=>{t&&M(!1)}),()=>{t=!1}},[x,g]);const sa=()=>{M(!1),w(null);const t=new URLSearchParams;b&&t.set("dog",b),q&&t.set("from",q),n(t.toString()?`/pack/nature?${t}`:"/pack/nature",{replace:!0})},Re=[...ve,...ye],ce=Re.length+oe.length,me=y.useMemo(()=>{if(v.length===0)return 0;const t=Re.filter(i=>v.every(d=>{var u;return(u=C[d.id])==null?void 0:u[i.id]})).length,p=oe.filter(i=>v.every(d=>{var u;return(u=O[d.id])==null?void 0:u[i]})).length;return t+p},[v,C,O]),Y=z==="element"?ve:z==="role"?ye:[],la=v.length>0&&v.every(t=>oe.every(p=>{var i;return(i=O[t.id])==null?void 0:i[p]})),_e=y.useMemo(()=>z!=="result"?[]:v.map(t=>({dog:t,r:je(C[t.id]??{},O[t.id]??{}),b:ke(K[t.id]??[])})),[z,v,C,O,K]),da=async t=>{if(le||t.length===0)return;const p=[];for(const{dog:i,r:d}of t){p.push({dogId:i.id,field:"nature.element",value:d.element,source:"quiz"}),p.push({dogId:i.id,field:"nature.role",value:d.role,source:"quiz"}),p.push({dogId:i.id,field:"nature.specials",value:d.specials,source:"quiz"}),p.push({dogId:i.id,field:"nature.scores",value:{...d.scores,sec:{el:d.elementSecond,role:d.roleSecond}},source:"quiz"});const u=K[i.id]??[];p.push({dogId:i.id,field:"nature.balance",value:u,source:"quiz"})}if(!m)try{await Pa(p),Ie(!0),Pe(!1)}catch{Pe(!0)}},Me=(t,p,i)=>{const d=i?[i]:v.map($=>$.id),u={...de.current};for(const $ of d)u[$]={...u[$],[t]:p};de.current=u,Te(u);const E=v.length>0&&v.every($=>{var F;return(F=u[$.id])==null?void 0:F[t]});Z(),E&&(U.current=window.setTimeout(()=>{U.current=null,ge()},Ua))},pa=t=>v.length>0&&v.every(p=>{var i;return(i=C[p.id])==null?void 0:i[t]}),ne=["element","balance","role","special"],ge=()=>{if(Z(),Y.length&&R<Y.length-1){H(p=>p+1);return}const t=ne[ne.indexOf(z)+1];H(0),D(t??"special")},ue=()=>{if(Z(),R>0){H(p=>p-1);return}const t=ne[ne.indexOf(z)-1];t&&(D(t),H(t==="element"?ve.length-1:t==="role"?ye.length-1:0))},he=(t,p,i)=>{const d=i?[i]:v.map(E=>E.id),u={...pe.current};for(const E of d)u[E]={...u[E],[t]:p};pe.current=u,Ce(u)},ca=(t,p)=>{Oe(i=>{const d=i[t]??[];return{...i,[t]:d.includes(p)?d.filter(u=>u!==p):[...d,p]}})},ma=()=>{Z(),de.current={},pe.current={},Te({}),Ce({}),Oe({}),H(0),Ie(!1),D("intro")},ga=Object.values(C).some(t=>Object.keys(t).length>0)||Object.values(O).some(t=>Object.keys(t).length>0)||Object.values(K).some(t=>t.length>0),Be=()=>n(k),xe=()=>{if(z!=="intro"&&z!=="result"&&ga){De(!0);return}Be()},be=ra?e.jsx(en,{tx:a,onStay:()=>De(!1),onLeave:Be}):null;if(g!==null&&v.length===0)return e.jsxs(I,{onClose:()=>n(k),children:[e.jsxs(Q,{children:[e.jsx(ze,{children:a("pack.nature.intro.eyebrow","Three short quizzes, one document")}),e.jsx("p",{style:{fontFamily:f,fontSize:14,lineHeight:1.6,color:o.inkStrong,margin:0},children:a("pack.nature.noDogs","This quiz writes its result onto a dog’s card, and there is no dog on your account yet.")}),e.jsx("div",{style:{marginTop:16,textAlign:"center"},children:e.jsx("button",{type:"button",className:"nq-gold",onClick:()=>n("/pack/dogs"),children:a("pack.nature.noDogsCta","Back to my dogs")})})]}),e.jsx(X,{tx:a})]});if(P)return h===null?e.jsx(I,{onClose:()=>n(k),children:e.jsx("div",{style:{minHeight:260}})}):e.jsxs(I,{onClose:()=>n(k),children:[h.map(({dog:t,r:p,b:i},d)=>e.jsx("div",{style:{marginTop:d===0?0:26},children:e.jsx(Qe,{dog:t,r:p,b:i,tx:a})},t.id)),e.jsxs("div",{style:{marginTop:18,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"},children:[e.jsxs("button",{type:"button",className:"nq-ghost",onClick:sa,children:[e.jsx(L,{name:"znova",size:20})," ",a("pack.nature.result.again","Take it again")]}),e.jsx("button",{type:"button",className:"nq-gold",onClick:()=>n(k),children:a("pack.nature.result.done","Done")})]})]});if(z==="intro")return e.jsxs(I,{onClose:()=>n(k),fill:!0,children:[e.jsxs(Q,{className:"nq-intro",style:{flex:1},children:[e.jsx("div",{className:"nq-introart",children:e.jsx("img",{src:oa,alt:"","aria-hidden":!0})}),e.jsxs("div",{className:"nq-introbody",children:[e.jsx(ze,{children:a("pack.nature.intro.eyebrow","Three short quizzes, one document")}),e.jsx("h1",{style:{...ka.card,lineHeight:1.2,color:o.inkStrong,margin:0},children:a("pack.nature.intro.title","Who is your dog?")}),e.jsx("p",{style:{fontFamily:f,fontSize:14,lineHeight:1.55,color:o.inkStrong,margin:"8px 0 0"},children:a("pack.nature.intro.body","Twenty-two questions and one checklist. You learn what your dog is made of, what job they do for your family and where their balance leans right now.")}),e.jsx(Za,{className:"nq-introrule"}),e.jsxs("div",{className:"nq-axes",children:[e.jsx(we,{icon:"yinyang",title:a("pack.nature.intro.axis1","Constitution"),sub:a("pack.nature.intro.axis1sub","Body, temperament and what to feed.")}),e.jsx(we,{icon:"house-heart",title:a("pack.nature.intro.axis2","Role in the pack"),sub:a("pack.nature.intro.axis2sub","Their job in the family — and what everyone gets wrong.")}),e.jsx(we,{icon:"sliders",title:a("pack.nature.intro.axis3","Balance right now"),sub:a("pack.nature.intro.axis3sub","Constitution is for life. Balance shifts.")})]}),e.jsx(Ya,{tx:a}),e.jsx("div",{style:{marginTop:12},children:e.jsx("button",{type:"button",className:"nq-gold is-big",onClick:()=>D("element"),children:a("pack.nature.intro.cta","Start")})})]})]}),e.jsx(X,{tx:a})]});if(z==="element"||z==="role"){const t=Y[R],p=R===Y.length-1;return e.jsxs(I,{onClose:xe,fill:!0,overlay:be,children:[e.jsxs(Q,{style:{flex:1,display:"flex",flexDirection:"column"},children:[e.jsx(Ne,{}),e.jsxs("div",{className:"nq-step",style:qe(v.length),children:[e.jsx(Se,{done:me,total:ce,label:`${z==="element"?a("pack.nature.part.element","Body"):a("pack.nature.part.role","Pack")} · ${a("pack.nature.question","Question")} ${R+1} / ${Y.length}`}),e.jsx("h2",{style:{fontFamily:V,fontWeight:700,fontSize:"clamp(1.2rem,4.4vw,1.65rem)",lineHeight:1.22,letterSpacing:"0.02em",color:o.inkStrong,margin:0},children:a(t.i18n,t.labelEN)}),e.jsx("div",{"aria-hidden":!0,style:{height:2,width:132,borderRadius:2,margin:"13px 0 16px",background:`linear-gradient(90deg, ${o.cardEdge}, rgba(201,154,63,0))`}}),R===0&&z==="element"&&e.jsx(Xa,{solo:B,tx:a}),e.jsx("div",{className:"nq-opts",children:t.options.map((i,d)=>e.jsx(Je,{label:a(i.i18n,i.labelEN),mark:String.fromCharCode(65+d),dogs:v,solo:B,isOn:u=>{var E;return((E=C[u])==null?void 0:E[t.id])===i.id},onPickDog:u=>Me(t.id,i.id,u),onPickAll:()=>Me(t.id,i.id,null)},i.id))}),e.jsxs("div",{className:"nq-nav",children:[e.jsxs("button",{type:"button",className:"nq-ghost",disabled:z==="element"&&R===0,onClick:ue,children:[e.jsx(L,{name:"spat",size:20})," ",a("pack.nature.back","Back")]}),e.jsx("button",{type:"button",className:"nq-gold",disabled:!pa(t.id),onClick:ge,children:p?a("pack.nature.toSpecial","Continue"):a("pack.nature.next","Next")})]})]},t.id)]}),e.jsx(X,{tx:a})]})}if(z==="balance")return e.jsxs(I,{onClose:xe,fill:!0,overlay:be,children:[e.jsxs(Q,{style:{flex:1,display:"flex",flexDirection:"column"},children:[e.jsx(Ne,{}),e.jsxs("div",{style:qe(v.length),children:[e.jsx(Se,{done:me,total:ce,label:a("pack.nature.part.balance","Balance")}),e.jsx("h2",{style:{fontFamily:V,fontWeight:700,fontSize:"clamp(1.2rem,4.4vw,1.65rem)",lineHeight:1.22,letterSpacing:"0.02em",color:o.inkStrong,margin:0},children:a("pack.nature.balance.title","Anything going on right now?")}),e.jsx("div",{"aria-hidden":!0,style:{height:2,width:132,borderRadius:2,margin:"13px 0 16px",background:`linear-gradient(90deg, ${o.cardEdge}, rgba(201,154,63,0))`}}),e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.6,color:o.inkStrong,margin:"0 0 6px"},children:a("pack.nature.balance.body","Your dog’s constitution is set for life, but it can tip out of balance. Tick anything that applies — as much or as little as you like.")}),e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.55,color:o.inkWarm,margin:"0 0 16px"},children:a("pack.nature.balance.none","Nothing on the list? Leave it empty and carry on — that is the best answer there is.")}),v.map(t=>e.jsxs("div",{style:{marginTop:18},children:[!B&&e.jsx("div",{style:{fontFamily:La,fontWeight:700,fontSize:14,letterSpacing:".02em",color:o.inkStrong,marginBottom:10,textTransform:"uppercase"},children:t.dog_name??"—"}),e.jsx("div",{style:{display:"grid",gap:14},children:aa.map(p=>{const i=Aa.filter(d=>d.element===p);return e.jsxs("div",{style:{padding:"4px 0"},children:[e.jsx("div",{style:{fontFamily:f,fontWeight:500,fontSize:10,letterSpacing:".26em",textTransform:"uppercase",color:o.cardEdge,marginBottom:10},children:a(T[p].i18n,T[p].labelEN)}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:7},children:i.map(d=>{const u=(K[t.id]??[]).includes(d.id);return e.jsxs("button",{type:"button",onClick:()=>ca(t.id,d.id),"aria-pressed":u,title:d.noteEN?a(`${d.i18n}.note`,d.noteEN):void 0,className:`pf-pill${u?" is-on is-selected":""}`,style:{fontFamily:f,fontSize:12,lineHeight:1.35,textAlign:"left",padding:"8px 12px",borderRadius:999,cursor:"pointer",...u?{}:{border:`1px solid ${Fa}`,background:o.tileBg,color:o.inkStrong,fontWeight:400}},children:[a(d.i18n,d.labelEN),d.noteEN&&e.jsx("span",{style:{display:"block",fontSize:10,opacity:.75,marginTop:1},children:a(`${d.i18n}.note`,d.noteEN)})]},d.id)})})]},p)})})]},t.id)),e.jsxs("div",{className:"nq-nav",children:[e.jsxs("button",{type:"button",className:"nq-ghost",onClick:ue,children:[e.jsx(L,{name:"spat",size:20})," ",a("pack.nature.back","Back")]}),e.jsx("button",{type:"button",className:"nq-gold",onClick:ge,children:a("pack.nature.next","Next")})]})]})]}),e.jsx(X,{tx:a})]});if(z==="special")return e.jsxs(I,{onClose:xe,fill:!0,overlay:be,children:[e.jsxs(Q,{style:{flex:1,display:"flex",flexDirection:"column"},children:[e.jsx(Ne,{}),e.jsxs("div",{style:qe(v.length),children:[e.jsx(Se,{done:me,total:ce,label:a("pack.nature.progress","Progress")}),e.jsx(ze,{children:a("pack.nature.special.eyebrow","Four more — looking for special roles")}),e.jsx("p",{style:{fontFamily:f,fontSize:12,lineHeight:1.55,color:o.inkWarm,marginBottom:14},children:a("pack.nature.special.body","These four roles sit on top of the main one. Most dogs carry none — that is normal.")}),!B&&e.jsx(Qa,{tx:a}),e.jsx("div",{style:{display:"grid",gap:14,marginTop:B?0:12},children:oe.map(t=>{const p=na[t];return e.jsxs("div",{children:[e.jsx("div",{style:{fontFamily:f,fontSize:12,lineHeight:1.45,color:o.inkStrong,marginBottom:8},children:a(p.qI18n,p.questionEN)}),B?e.jsx("div",{style:{display:"flex",gap:8},children:["yes","sometimes","no"].map(i=>{var d,u;return e.jsx("button",{type:"button",className:`nq-tri${((u=O[(d=v[0])==null?void 0:d.id])==null?void 0:u[t])===i?" is-on":""}`,onClick:()=>he(t,i,null),children:a(`pack.nature.ans.${i}`,i==="yes"?"Yes":i==="no"?"No":"Sometimes")},i)})}):e.jsx("div",{className:"nq-opts",children:["yes","sometimes","no"].map(i=>e.jsx(Je,{label:a(`pack.nature.ans.${i}`,i==="yes"?"Yes":i==="no"?"No":"Sometimes"),dogs:v,solo:!1,isOn:d=>{var u;return((u=O[d])==null?void 0:u[t])===i},onPickDog:d=>he(t,i,d),onPickAll:()=>he(t,i,null)},i))})]},t)})}),e.jsxs("div",{className:"nq-nav",children:[e.jsxs("button",{type:"button",className:"nq-ghost",onClick:ue,children:[e.jsx(L,{name:"spat",size:20})," ",a("pack.nature.back","Back")]}),e.jsx("button",{type:"button",className:"nq-gold",disabled:!la,onClick:()=>{const t=v.map(p=>({dog:p,r:je(C[p.id]??{},O[p.id]??{}),b:ke(K[p.id]??[])}));if(m){D("gate");return}D("result"),da(t)},children:a("pack.nature.special.cta","Show the result")})]})]})]}),e.jsx(X,{tx:a})]});if(z==="gate"&&m){const t=((Fe=v[0])==null?void 0:Fe.id)??c,p=O[t]??{},i={...C[t]??{}};for(const d of Object.keys(p))i[`sp_${d}`]=String(p[d]);return e.jsx(I,{onClose:()=>D("special"),children:e.jsx(Ba,{answers:i,result:je(C[t]??{},p),onDone:()=>D("result")})})}return z==="gate"||_e.length===0?null:e.jsxs(I,{onClose:()=>n(k),children:[_e.map(({dog:t,r:p,b:i},d)=>e.jsx("div",{style:{marginTop:d===0?0:26},children:e.jsx(Qe,{dog:t,r:p,b:i,tx:a})},t.id)),e.jsxs("div",{style:{marginTop:18,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"},children:[e.jsxs("button",{type:"button",className:"nq-ghost",onClick:ma,children:[e.jsx(L,{name:"znova",size:20})," ",a("pack.nature.result.again","Take it again")]}),!m&&e.jsx("button",{type:"button",className:"nq-gold",onClick:()=>n(k),children:a("pack.nature.result.done","Done")})]}),m&&e.jsx("div",{style:{padding:"12px 0",marginTop:18},children:e.jsx("p",{style:{fontFamily:f,fontSize:14,lineHeight:1.55,color:o.inkStrong,margin:0},children:a("magnet.pv.quiz.p","As a Dogyptian you save the full reading — food, what to watch, advice from AINUBIS — to your dog’s DOG ID.")})}),ia&&!le&&e.jsx("p",{role:"alert",style:{fontFamily:f,fontSize:12,color:"#E08A70",marginTop:12,textAlign:"center"},children:a("pack.diary.saveFailed","The entry could not be saved. Try again.")}),le&&e.jsxs("p",{style:{fontFamily:f,fontSize:10,color:o.inkWarm,marginTop:12,textAlign:"center"},children:[e.jsx(L,{name:"fajka",size:18})," ",B?a("pack.nature.result.saved","Saved to your dog’s card"):a("pack.nature.result.savedAll","Saved to every dog’s card")]})]})}export{Fn as default};
