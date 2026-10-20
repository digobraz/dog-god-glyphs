import{u as Ae,e as fa,r as y,j as e,ai as ba,F as N,O as w,K as M,P as F,J as b,k as Ve,L as D,b as Qe,Q as P,f as ka,l as va,W as ya,a4 as Xe,a as ea,a5 as ja,V as za,U as xe,T as fe,af as H,a6 as qa,a7 as wa,al as ne}from"./index-B-BQrD2y.js";import{g as Na,P as Ea}from"./dogRights-BhKk5QOi.js";import{B as Sa}from"./BackButton-XC1Pn_3O.js";import{useMagnetPreview as aa}from"./magnetPreview-CvEjQVpP.js";import{supabase as Se}from"./client-rJzPTh-q.js";import{c as Aa,d as be,e as ke,f as ve,S as te,g as ye,E as na,B as Ta,a as T,b as ta,h as oe,N as ie,i as $a,j as Ke,k as Ca,l as He,R as Oa}from"./natureQuiz-BjVOn8Uc.js";import{B as Da}from"./BrandIcon-Cj2cTb6H.js";import{r as Pa,a as Ia}from"./dogEvents-O4Dj4HRt.js";import{a as Ra}from"./ainubis-badge-BGb27Nxy.js";import{D as _a}from"./devMockDogs-BzGWz4qV.js";import{n as Ue,b as oa}from"./HandIcons-nK6bMixK.js";import{s as ia}from"./cloudinaryService-BTfH_t1m.js";import{C as je}from"./chevron-left-VUSjLHJ3.js";import"./ainubisBus-BMRzmB2O.js";import"./ainubisSkin-B7Z96MPq.js";import"./SnifferLogo-Ch81E6FO.js";import"./pawmateRights-CWmFDd90.js";import"./ainubis-head-g4iOYlxZ.js";import"./tslib.es6-CmEaCU22.js";import"./handArrowLeft-DN9pj_cL.js";import"./createLucideIcon-B_Tc6GtW.js";const Fa=`
${ba}
.mgl-h{margin:0 0 ${N.sm}px;font:700 ${w.h2}px/1.3 ${M};letter-spacing:.02em;color:${F.inkStrong};}
.mgl-p{margin:0;font:400 ${w.body}px/1.55 ${b};color:${F.inkWarm};}
.mgl-field{width:100%;box-sizing:border-box;margin-top:${N.md}px;padding:${N.md}px ${N.lg}px;
  border-radius:${Ve.field}px;font:400 ${w.lead}px/1.4 ${b};color:${F.inkStrong};}
.mgl-err{margin:${N.sm}px 0 0;font:500 ${w.label}px/1.4 ${b};color:#B25640;}
.mgl-cta{display:inline-flex;align-items:center;justify-content:center;width:100%;margin-top:${N.md}px;cursor:pointer;
  border:1px solid ${D.edge};border-radius:${Ve.field}px;padding:${N.md}px ${N.lg}px;
  background:${D.grad};box-shadow:${Qe};color:${D.ink};
  font:700 ${w.body}px/1 ${M};letter-spacing:.14em;text-transform:uppercase;transition:transform .15s ease;}
.mgl-cta:hover{background:${D.gradHover};transform:translateY(-1px);}
.mgl-cta:disabled{opacity:.6;cursor:wait;}
.mgl-fine{margin:${N.md}px 0 0;font:400 ${w.label}px/1.5 ${b};color:${F.inkWarm};}
.mgl-fine a{color:${D.edge};}
`;function Ma({answers:n,result:s,onDone:r}){const a=Ae(),{lang:m}=fa(),p=(q,I)=>{const B=a(q);return B===q?I:B},[f,x]=y.useState(""),[j,k]=y.useState(!1),[g,l]=y.useState(!1),h=async q=>{if(q.preventDefault(),g)return;if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.trim())){k(!0);return}k(!1),l(!0);const{error:I}=await Se.rpc("magnet_lead",{p_email:f.trim(),p_lang:m,p_answers:n,p_result:{element:s.element,role:s.role,elementSecond:s.elementSecond,roleSecond:s.roleSecond}});if(l(!1),I){k(!0);return}r()};return e.jsxs("form",{onSubmit:h,noValidate:!0,children:[e.jsx("style",{children:Fa}),e.jsxs("div",{style:{...P.card,padding:N.xl},children:[e.jsx("h2",{className:"mgl-h",children:p("magnet.quiz.gate.h","Where should we send your result?")}),e.jsx("p",{className:"mgl-p",children:p("magnet.quiz.gate.p","Your e-mail, nothing else. The full reading opens right after.")}),e.jsx("input",{className:"pf-field mgl-field",type:"email",autoComplete:"email",required:!0,value:f,onChange:q=>x(q.target.value),placeholder:"name@email.com","aria-invalid":j}),j&&e.jsx("p",{className:"mgl-err",role:"alert",children:p("magnet.quiz.gate.err","That e-mail does not look right. Try again.")}),e.jsx("button",{type:"submit",className:"mgl-cta",disabled:g,children:p("magnet.quiz.gate.btn","Show my result")}),e.jsxs("p",{className:"mgl-fine",children:[p("magnet.quiz.gate.fine","Used only to send you the result.")," ",e.jsx("a",{href:"/privacy",target:"_blank",rel:"noreferrer",children:p("magnet.quiz.gate.privacy","Privacy")})]})]})]})}const o=F,Ba="'Cinzel Decorative', 'Cinzel', serif",ra="/images/nature-quiz-art.webp",La="/pack/dogs";function Wa(n,s){return n==="id"&&s?`/pack/dogs/${s}`:null}const Va=`${za}
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
  background:${D.grad};
  border:1px solid ${D.edge}; border-radius:8px; color:${D.ink};
  font-family:'Cinzel',serif; font-size:10px; font-weight:700;
  letter-spacing:0.14em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
  box-shadow:${Qe};
  transition: transform .2s, box-shadow .22s;
}
.nq-gold:hover{ transform:scale(1.04); background:${D.gradHover}; }
.nq-gold:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
.nq-gold.is-ondark{
  background:var(--cta-gradient-dark); color:#000;
  border:1px solid ${xe.edge};
  box-shadow:var(--cta-shadow-glow);
}
/* Ghost na čiernom: teplý hnedý ink "${o.inkWarm}" je inkoust NA PAPYRUS a na čiernej ho
   nevidno. Rovnaká pasca ako pri pätičke s attribution — na tmavých vrstvách sa berú
   onDark odtiene, nie ink*. */
.nq-ghost.is-ondark{
  border-color:rgba(201,154,63,0.55); color:${o.onDark};
}
.nq-ghost.is-ondark:hover{ border-color:${o.cardEdge}; color:#F5C73D; }
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
  font-family:'Cinzel',serif; font-size:10px; font-weight:700;
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
  border:1.5px solid ${fe.border};
  font-family:'Space Grotesk',sans-serif; font-size:14px; line-height:1.45;
  color:#5c4318;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .18s;
}
.nq-optlbl{ flex:1 1 auto; }
.nq-opt:hover, .nq-optlbl:hover{
  border-color:rgba(179,130,45,0.85); transform:translateY(-1px);
  box-shadow:${H.lift};
}
.nq-opt.is-on, .nq-optlbl.is-on{
  background:${xe.grad};
  border-color:#E69E1A; color:#241a06;
  box-shadow:${H.lift};
}
.nq-opt.is-on:hover, .nq-optlbl.is-on:hover{ box-shadow:${H.lift}; }
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
  background:linear-gradient(180deg,#FFF8E4 0%,#F4DA9B 100%);
  border-color:#D9A93A;
  box-shadow:0 2px 9px rgba(179,130,45,0.20), inset 4px 0 0 #E69E1A;
  color:#4a3410;
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
  font-family:'Cinzel',serif; font-weight:700; font-size:10px; letter-spacing:.02em;
  color:${o.inkWarm}; transition:background .18s, border-color .18s, color .18s;
}
.is-on > .nq-mark{
  background:#241a06; border-color:#241a06; color:#F5C73D;
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
  border-color:${fe.border}; transform:none; box-shadow:none;
}

/* Trojlístok áno/občas/nie pri jednom psovi — tá istá koža, len na šírku. */
.nq-tri{
  flex:1 1 0; cursor:pointer; padding:12px 8px; border-radius:999px;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid ${fe.border};
  font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:500; color:#5c4318;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.nq-tri:hover{
  border-color:rgba(179,130,45,0.85); transform:translateY(-1px);
  box-shadow:${H.lift};
}
.nq-tri.is-on{
  background:${xe.grad};
  border-color:#E69E1A; color:#241a06; box-shadow:${H.lift};
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
  font-family:'Cinzel',serif; font-weight:700; font-size:12px;
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
  border:2px solid ${F.border}; background:${o.bg};
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
  font-family:'Cinzel',serif; font-weight:700; font-size:calc(var(--nq-dog,54px) * 0.34);
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
  background:${P.subblock.background};
  border:${P.subblock.border}; border-radius:${P.subblock.borderRadius}px;
  box-shadow:${P.subblock.boxShadow};
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
  border:1px solid ${F.border};
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
  box-shadow:${H.panel};
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
  background:${F.border}; transition:width .5s ease;
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
.nqd-rank{ font-family:'Cinzel',serif; font-weight:900; font-size:10px; letter-spacing:0.22em; color:#8a5c10; opacity:.8; }
.nqd-art{ height:116px; display:grid; place-items:center; margin:6px 0 8px; }
.nqd-art img{ width:104px; margin:0; filter:drop-shadow(0 8px 18px rgba(60,38,8,.32)); }
.nqd-slot.spec .nqd-art img{ width:88px; }
.nqd-lbl{
  margin-top:auto; font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:${w.micro}px;
  letter-spacing:0.22em; text-transform:uppercase; color:${o.inkWarm};
}
.nqd-nm{
  font-family:'Cinzel',serif; font-weight:900; font-size:${w.lead}px; letter-spacing:.02em;
  text-transform:uppercase; color:#1a0900; margin-top:2px; line-height:1.2;
}
.nqd-slot.spec .nqd-nm{ font-size:${w.body}px; }

/* ── NADPISY SEKCIÍ ───────────────────────────────────────────────────────
   ⚠️ Číslo sekcie MUSÍ sedieť s číslom odznaku v hlavičke. I = konštitúcia na
   oboch miestach — číslo je sľub, buď platí dvakrát, alebo tam nemá čo robiť. */
.nqd-head{ text-align:center; margin:0 0 18px; }
.nqd-head .num{ font-family:'Cinzel',serif; font-weight:900; font-size:12px; letter-spacing:0.26em; color:#8a5c10; }
.nqd-head h2{
  font-family:'Cinzel',serif; font-weight:900; font-size:${w.h1}px; letter-spacing:0.02em;
  text-transform:uppercase; color:#1a0900; margin:5px 0 0; line-height:1.1;
}
.nqd-head .sub{ font-family:'Space Grotesk',sans-serif; font-size:${w.label}px; color:${o.inkWarm}; margin-top:6px; }
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
  font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:${w.micro}px; letter-spacing:.26em;
  text-transform:uppercase; color:#8a5c10; margin:0 0 8px;
}
.nqd p.body{ font-family:'Space Grotesk',sans-serif; font-size:${w.body}px; line-height:1.65; color:#1a0900; margin:0 0 10px; }
.nqd p.dim{ font-family:'Space Grotesk',sans-serif; font-size:${w.label}px; line-height:1.6; color:#5a3a0a; margin:0; }
/* Zvýraznenie nesú DÁTA (**takto**), sadzba mu len dá váhu. */
.nqd b{ font-weight:600; color:#1a0900; }

.nqd-list{ margin:0; padding:0; display:grid; gap:10px; }
.nqd-list li{
  list-style:none; position:relative; padding-left:24px;
  font-family:'Space Grotesk',sans-serif; font-size:${w.body}px; line-height:1.6; color:#1a0900;
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
  display:block; font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:${w.micro}px;
  letter-spacing:0.22em; text-transform:uppercase; color:${o.inkWarm};
}
.nqd-fact .v{ display:block; font-family:'Cinzel',serif; font-weight:700; font-size:12px; color:#1a0900; margin-top:2px; }

/* ── IV · USMERNENIE ──────────────────────────────────────────────────────
   Kombinačný riadok stojí SAMOSTATNE nad omylmi. Je to jediná veta dokumentu,
   kde sa obe osi stretnú — zamiešaná medzi šestnásť riadkov by zanikla. */
.nqd-pair{ position:relative; border:1px solid #8a5c10; border-radius:8px; padding:16px 16px;
  background:linear-gradient(135deg, rgba(245,199,61,.16), rgba(230,158,26,.09)); margin-bottom:20px; }
.nqd-pair .cross{
  font-family:'Cinzel',serif; font-weight:900; font-size:10px; letter-spacing:0.22em;
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
.nqd-rules .n{ font-family:'Cinzel',serif; font-weight:900; font-size:14px; color:#8a5c10; text-align:right; line-height:1.3; }
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
  .nqd-head h2{ font-size:${w.h2}px; }
  .nqd-elhero{ grid-template-columns:1fr; gap:14px; }
  .nqd-cnbox{ max-width:150px; margin-inline:auto; }
  .nqd-duo{ grid-template-columns:1fr; }
  .nqd-radars{ grid-template-columns:1fr; }
}
@media(max-width:520px){
  /* VIAC MIESTA PRE TEXT (Matej 28. 9. 2026 nad hárkom plany/nakres-kviz-povahy-2026-09-28: „ano").
     Štyri vnorené rámy (stránka → dvojitý rám → panel → odrážka) nechávali textu ~225 px z 390.
     Rámy aj rohové značky ostávajú — ustupujú len okraje. */
  .nqd-framed{ padding:${N.xs}px; }
  .nqd-inner{ padding:${N.xl}px ${N.md}px; }
  .nqd-panel{ padding:${N.xl}px ${N.lg}px ${N.md}px; }
  .nqd-list li{ padding-left:${N.lg}px; }
  .nqd-list li::before{ left:1px; }
  .nqd-facts{ grid-template-columns:repeat(2,1fr); }
  .nqd-medal{ width:124px; height:124px; }
  .nqd-slot{ width:calc(50% - 5px); }
  .nqd-foot{ flex-direction:column; align-items:center; text-align:center; gap:12px; }
}
`,Ka={width:"100%",maxWidth:760,margin:"0 auto",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"};function ze(n){const s=n<=2?54:n<=4?44:38;return{...Ka,"--nq-dog":`${s}px`}}const Ha=340;function qe({children:n}){return e.jsx("div",{style:{fontFamily:b,fontSize:10,fontWeight:500,letterSpacing:".26em",textTransform:"uppercase",color:o.cardEdge,marginBottom:8},children:n})}function S({s:n}){const s=n.split("**");return e.jsx(e.Fragment,{children:s.map((r,a)=>a%2?e.jsx("b",{children:r},a):e.jsx("span",{children:r},a))})}function V(){return e.jsxs("div",{className:"nqd-orn",children:[e.jsx("i",{}),e.jsx("s",{}),e.jsx("s",{className:"big"}),e.jsx("s",{}),e.jsx("i",{})]})}function U({num:n,title:s,sub:r}){return e.jsxs("div",{className:"nqd-head",children:[e.jsx("div",{className:"num",children:n}),e.jsx("h2",{children:s}),r&&e.jsx("div",{className:"sub",children:r}),e.jsxs("div",{className:"nqd-wing",children:[e.jsx("i",{}),e.jsx("s",{}),e.jsx("i",{})]})]})}function Ge({title:n,from:s,rows:r,tx:a}){return r.length?e.jsxs("div",{className:"nqd-cat",children:[e.jsxs("div",{className:"nqd-cap",children:[e.jsx("h3",{children:n}),e.jsx("i",{})]}),e.jsx("p",{className:"dim",style:{fontSize:10,margin:"-6px 0 10px"},children:s}),e.jsx("ol",{className:"nqd-rules",children:r.map((m,p)=>e.jsxs("li",{children:[e.jsx("span",{className:"n",children:String(p+1).padStart(2,"0")}),e.jsxs("span",{children:[e.jsx("b",{className:"t",children:a(`${m.i18n}.title`,m.titleEN)}),e.jsx("span",{className:"d",children:e.jsx(S,{s:a(`${m.i18n}.text`,m.textEN)})})]})]},m.i18n))})]}):null}function X({children:n,style:s,className:r}){return e.jsx("div",{className:r,style:{background:o.cardGrad,border:`1.5px solid ${o.cardEdge}`,borderRadius:16,boxShadow:o.cardShadow,padding:"24px 16px",...s},children:n})}function Ua({className:n}){return e.jsx("div",{className:n,style:{height:2,background:o.rule,margin:"16px 0",border:0}})}function ee({tx:n}){const s=Xe(ea().pathname);return e.jsxs("p",{style:{fontFamily:b,fontSize:10,lineHeight:1.55,color:s?o.inkWarm:"rgba(245,240,228,0.55)",marginTop:12,textAlign:"center"},children:[n(oe.i18n,oe.textEN),null]})}function we({icon:n,title:s,sub:r}){return e.jsxs("div",{className:"nq-axis",children:[e.jsx("span",{className:"nq-axisicon",children:e.jsx(Da,{name:n,size:28})}),e.jsx("div",{className:"nq-axistitle",children:s}),e.jsx("div",{className:"nq-axissub",children:r})]})}function Ga({tx:n}){return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:16,marginTop:12,padding:"12px 16px",borderRadius:12,background:"radial-gradient(circle at 22% 20%, #12233a 0%, #01050A 74%)",border:"1px solid rgba(91,224,240,0.28)",boxShadow:"0 0 0 4px rgba(59,158,255,0.05), 0 18px 44px -22px rgba(59,158,255,0.45)"},children:[e.jsx("img",{src:Ra,alt:"","aria-hidden":!0,style:{width:44,height:44,objectFit:"contain",borderRadius:"50%",flex:"0 0 auto",background:"radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)",border:"1px solid rgba(91,224,240,0.35)",boxShadow:"0 0 0 4px rgba(59,158,255,0.06), 0 0 20px rgba(59,158,255,0.34)"}}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx("div",{style:{fontFamily:M,fontWeight:700,textTransform:"uppercase",fontSize:12,letterSpacing:"0.14em",color:"#5BE0F0",marginBottom:4},children:n("pack.nature.intro.dogid","It goes into the DOG ID")}),e.jsx("div",{style:{fontFamily:b,fontSize:12,lineHeight:1.5,color:o.onDarkDim},children:n("pack.nature.intro.dogidSub","Your answers go into the DOG ID, so advice on food, routine and training fits this dog.")})]})]})}function Ne(){return e.jsx("div",{className:"nq-band",children:e.jsx("img",{src:ra,alt:"","aria-hidden":!0})})}function Ze({rows:n,color:s}){const p=n.length,f=Math.max(...n.map(g=>Math.max(0,g.value)),0),x=(g,l)=>{const h=-Math.PI/2+g*2*Math.PI/p;return[150+Math.cos(h)*88*l,124+Math.sin(h)*88*l]},j=g=>n.map((l,h)=>x(h,g).join(",")).join(" "),k=n.map((g,l)=>x(l,f?Math.max(0,g.value)/f*.94:0).join(",")).join(" ");return e.jsxs("svg",{className:"nqd-radar",viewBox:"0 0 300 258",role:"img","aria-hidden":!0,children:[[.25,.5,.75,1].map(g=>e.jsx("polygon",{points:j(g),fill:"none",stroke:`rgba(122,80,16,${g===1?.45:.2})`,strokeWidth:1},g)),n.map((g,l)=>{const[h,q]=x(l,1);return e.jsx("line",{x1:150,y1:124,x2:h,y2:q,stroke:"rgba(122,80,16,.28)",strokeWidth:1},l)}),e.jsx("polygon",{points:k,fill:s,fillOpacity:.34,stroke:s,strokeWidth:2}),n.map((g,l)=>{const[h,q]=x(l,f?Math.max(0,g.value)/f*.94:0);return e.jsx("circle",{cx:h,cy:q,r:3.4,fill:s},l)}),n.map((g,l)=>{const[h,q]=x(l,1.26);return e.jsxs("g",{children:[e.jsx("text",{x:h,y:q,textAnchor:"middle",dominantBaseline:"middle",fontFamily:"Cinzel, serif",fontSize:g.top?12:10.5,fontWeight:g.top?900:700,fill:g.top?"#1a0900":"#5a3a0a",letterSpacing:"0.5",children:g.label.toUpperCase()}),g.cn&&e.jsx("text",{x:h,y:q+15,textAnchor:"middle",dominantBaseline:"middle",fontSize:14,fill:"#8a5c10",opacity:.85,children:g.cn})]},l)})]})}function Za({r:n,tx:s}){return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nqd-radars",children:[e.jsxs("div",{children:[e.jsx("p",{className:"nqd-eyebrow",style:{textAlign:"center"},children:s("pack.nature.result.elementLabel","Constitution")}),e.jsx(Ze,{color:"#8a5c10",rows:na.map(r=>({label:s(T[r].i18n,T[r].labelEN),cn:T[r].cn,value:n.scores.el[r],top:r===n.element}))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"nqd-eyebrow",style:{textAlign:"center"},children:s("pack.nature.result.roleLabel","Role in the pack")}),e.jsx(Ze,{color:"#a8332a",rows:Oa.map(r=>({label:s(ie[r].i18n,ie[r].labelEN),value:n.scores.role[r],top:r===n.role}))})]})]}),e.jsx("p",{className:"nqd-note",children:s("pack.nature.result.scoresNote","Every answer adds weight to more than one line — this is where they landed.")})]})}function Ee({done:n,total:s,label:r}){const a=s>0?Math.round(n/s*100):0;return e.jsxs("div",{className:"nq-prog",children:[e.jsxs("div",{className:"nq-proghead",children:[e.jsx("span",{className:"nq-proglbl",children:r}),e.jsxs("span",{className:"nq-prognum",children:[a,"%"]})]}),e.jsx("div",{className:"nq-progbar",role:"progressbar","aria-valuenow":n,"aria-valuemin":0,"aria-valuemax":s,children:e.jsx("div",{className:"nq-progbar__on",style:{width:`${a}%`}})})]})}function Ye({label:n,mark:s,dogs:r,solo:a,isOn:m,onPickDog:p,onPickAll:f}){const x=r.reduce((l,h)=>l+(m(h.id)?1:0),0),j=r.length>0&&x===r.length,k=x>0&&!j,g=e.jsx("span",{className:"nq-mark","aria-hidden":!0,children:j?e.jsx(oa,{size:14}):s??""});return a?e.jsxs("button",{type:"button",className:`nq-opt${j?" is-on":""}`,onClick:f,children:[g,e.jsx("span",{className:"nq-optxt",children:n})]}):e.jsxs("div",{className:"nq-optrow",children:[e.jsxs("div",{className:`nq-optlbl is-static${j?" is-on":k?" is-some":""}`,children:[g,e.jsx("span",{className:"nq-optxt",children:n})]}),e.jsx("div",{className:"nq-dogs",children:r.map(l=>e.jsx("button",{type:"button",className:`nq-dog${m(l.id)?" is-on":""}`,"aria-label":`${l.dog_name??""}: ${n}`,"aria-pressed":m(l.id),title:l.dog_name??"",onClick:()=>p(l.id),children:l.cloudinary_main_url?e.jsx("img",{src:ia(l.cloudinary_main_url,200),alt:"",loading:"lazy"}):e.jsx("span",{className:"nq-dogfb",children:(l.dog_name||"?").trim().charAt(0).toUpperCase()})},l.id))})]})}function Ya({tx:n}){return e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.5,color:o.inkWarm,margin:"10px 0 0"},children:n("pack.nature.pickHint","Answer for each dog separately — tap that dog’s photo in the row that fits them.")})}function Ja({solo:n,tx:s}){return e.jsxs("div",{style:{...P.subblock,padding:"12px 16px",margin:"0 0 16px"},children:[e.jsx("div",{style:{fontFamily:b,fontSize:10,fontWeight:500,letterSpacing:".26em",textTransform:"uppercase",color:o.cardEdge,marginBottom:6},children:s("pack.nature.how.eyebrow","How it works")}),e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.55,color:o.inkStrong,margin:0},children:n?s("pack.nature.how.solo","Pick the sentence that fits your dog best and the quiz moves on by itself. There is no wrong answer, nothing is written down until the end, and Back takes you to anything you want to change."):s("pack.nature.how.pack","Each dog answers for themselves: in the row that fits them, tap that dog’s photo. A row half-lit means some of them chose it, fully gold means all of them did. Once every dog has answered, the quiz moves on by itself — and Back takes you to anything you want to change.")})]})}function Qa({onStay:n,onLeave:s,tx:r}){return e.jsx("div",{role:"dialog","aria-modal":"true",className:"pk-veil pk-veil--modal nq-scrim",onClick:n,children:e.jsxs("div",{className:"nq-confirm",onClick:a=>a.stopPropagation(),children:[e.jsx("h2",{style:{fontFamily:M,fontWeight:700,textTransform:"uppercase",fontSize:16,letterSpacing:"0.02em",color:o.inkStrong,margin:0},children:r("pack.nature.leave.title","Leave the quiz?")}),e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.55,color:o.inkWarm,margin:"10px 0 0"},children:r("pack.nature.leave.body","Your answers are not saved yet — they are written to the DOG ID only at the end. Leave now and you start over.")}),e.jsxs("div",{className:"nq-confirmbtns",children:[e.jsx("button",{type:"button",className:"nq-gold",onClick:n,children:r("pack.nature.leave.stay","Keep going")}),e.jsx("button",{type:"button",className:"nq-ghost",onClick:s,children:r("pack.nature.leave.quit","Leave anyway")})]})]})})}function O({children:n,onClose:s,fill:r,overlay:a}){const m=aa(),p=Ae(),f=Xe(ea().pathname);return e.jsxs("div",{className:`min-h-[100dvh] relative flex flex-col${f?" pk-paper":""}`,style:f?{color:o.inkStrong}:{backgroundColor:o.pageBg,color:o.onDark},children:[f?e.jsx("style",{children:ja}):e.jsxs(e.Fragment,{children:[e.jsx("div",{"aria-hidden":!0,style:{position:"fixed",inset:0,width:"100vw",height:"100lvh",backgroundImage:"url('/images/bg-dark.webp')",backgroundSize:"cover",backgroundPosition:"center",filter:"blur(3px)",zIndex:0,pointerEvents:"none"}}),e.jsx("div",{"aria-hidden":!0,style:{position:"fixed",inset:0,width:"100vw",height:"100lvh",background:"radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)",zIndex:0,pointerEvents:"none"}})]}),e.jsx("style",{children:Va}),e.jsxs("div",{className:`relative z-10 mx-auto w-full px-4 sm:px-6 flex flex-col ${r?"flex-1 pb-6":"pb-24"}`,style:{maxWidth:wa.wide,paddingTop:qa,...m?{paddingBottom:"calc(96px + env(safe-area-inset-bottom, 0px))"}:null},children:[m?e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:ne.h,marginBottom:ne.content-ne.top-ne.h},children:e.jsx(Sa,{tone:"pale",onClick:s,label:p("pack.quiz.back")})}):e.jsx(Ea,{onBack:s,backLabel:p("pack.quiz.back")}),r?e.jsx("div",{className:"flex-1 flex flex-col",style:{minHeight:0},children:n}):n]}),a]})}function Xa({b:n,own:s,tx:r}){if(!n.top)return null;const a=n.top.side==="excess"?r("pack.nature.balance.excess","too much"):r("pack.nature.balance.deficiency","not enough"),m=r(T[n.top.element].i18n,T[n.top.element].labelEN),p=n.top.support.filter(x=>x!==s),f=x=>e.jsx("span",{className:"pf-pill",style:{fontFamily:b,fontSize:12,padding:"4px 12px",borderRadius:999,border:`1px solid ${o.border}`,background:o.tileBg,color:o.inkStrong},children:r(x.i18n,x.labelEN)},x.id);return e.jsxs(e.Fragment,{children:[e.jsx(U,{num:"I·b",title:r("pack.nature.doc.ib.title","Where the balance is leaning"),sub:r("pack.nature.doc.ib.sub","What you ticked, read the way Chinese medicine reads it")}),e.jsxs("p",{style:{fontFamily:b,fontSize:14,lineHeight:1.6,color:o.inkStrong,margin:"0 0 12px"},children:[r("pack.nature.balance.reading","In Traditional Chinese Medicine this reads as")," ",e.jsxs("b",{children:[a," ",m]}),"."]}),n.signs.length>0&&e.jsxs("div",{className:"nqd-panel quiet",children:[e.jsx("p",{className:"nqd-eyebrow",children:r("pack.nature.balance.signs","What you ticked")}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginTop:6},children:n.signs.map(f)}),n.top.support.length>0&&e.jsxs("p",{className:"dim",style:{marginTop:11},children:[r("pack.nature.balance.support","The elements to lean on here are")," ",e.jsx("b",{children:n.top.support.map(x=>r(T[x].i18n,T[x].labelEN)).join(" · ")}),". ",p.length===0?r("pack.nature.balance.supportHow","Their food notes above are where to start — this is a leaning, not a prescription."):r("pack.nature.balance.supportBelow","Where to start is right below — this is a leaning, not a prescription.")]})]}),p.map(x=>{const j=T[x];return e.jsxs("div",{className:"nqd-panel",style:{marginTop:12},children:[e.jsxs("p",{className:"nqd-eyebrow",children:[r(j.i18n,j.labelEN)," · ",r("pack.nature.doc.food","What suits them")]}),e.jsx("ul",{className:"nqd-list tight",children:j.foodEN.map((k,g)=>e.jsx("li",{children:e.jsx(S,{s:r(`${j.i18n}.food${g}`,k)})},g))})]},x)}),n.diagnoses.length>0&&e.jsxs("div",{style:{...P.subblockDark,padding:"16px 16px",marginTop:12},children:[e.jsx("p",{className:"nqd-eyebrow",style:{color:o.cardEdge},children:r("pack.nature.balance.vet","This belongs with your vet")}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:6,margin:"8px 0 10px"},children:n.diagnoses.map(x=>e.jsx("span",{className:"pk-pill--dark",style:{fontFamily:b,fontSize:12,padding:"4px 12px",borderRadius:999,border:`1px solid ${o.cardEdge}`,background:"rgba(201,154,63,0.10)",color:o.onDark},children:r(x.i18n,x.labelEN)},x.id))}),e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.6,color:o.onDarkDim,margin:0},children:r(He.i18n,He.textEN)})]}),e.jsx(V,{})]})}function Je({dog:n,r:s,b:r,tx:a}){const m=ie[s.role],p=T[s.element],f=s.roleSecond?ie[s.roleSecond]:null,x=s.elementSecond?T[s.elementSecond]:null,j=(n.dog_name||"").trim().toUpperCase(),k=$a(s),g=s.specials.map(l=>ta[l]);return e.jsx("div",{className:"nqd",children:e.jsx("div",{className:"nqd-framed",children:e.jsxs("div",{className:"nqd-inner",children:[e.jsx("div",{className:"nqd-medal",children:n.cloudinary_main_url?e.jsx("img",{src:ia(n.cloudinary_main_url,320),alt:"","aria-hidden":!0}):e.jsx("span",{children:(n.dog_name||"?").trim().charAt(0).toUpperCase()})}),j&&e.jsx("div",{className:"nqd-who",children:j}),n.heroglyph_png_url&&e.jsx("img",{className:"nqd-glyph",src:n.heroglyph_png_url,alt:"","aria-hidden":!0,loading:"lazy"}),e.jsxs("div",{className:"nqd-trio",children:[e.jsxs("div",{className:"nqd-slot",children:[e.jsx("div",{className:"nqd-rank",children:"I"}),e.jsx("div",{className:"nqd-art",children:e.jsx("img",{src:p.art,alt:"","aria-hidden":!0,loading:"lazy"})}),e.jsx("div",{className:"nqd-lbl",children:a("pack.nature.result.elementLabel","Constitution")}),e.jsx("div",{className:"nqd-nm",children:a(p.i18n,p.labelEN)})]}),e.jsxs("div",{className:"nqd-slot",children:[e.jsx("div",{className:"nqd-rank",children:"II"}),e.jsx("div",{className:"nqd-art",children:e.jsx("img",{src:m.art,alt:"","aria-hidden":!0,loading:"lazy"})}),e.jsx("div",{className:"nqd-lbl",children:a("pack.nature.result.roleLabel","Role in the pack")}),e.jsx("div",{className:"nqd-nm",children:a(m.i18n,m.labelEN)})]}),g.map(l=>e.jsxs("div",{className:"nqd-slot spec",children:[e.jsx("div",{className:"nqd-rank",children:"III"}),e.jsx("div",{className:"nqd-art",children:e.jsx("img",{src:l.art,alt:"","aria-hidden":!0,loading:"lazy"})}),e.jsx("div",{className:"nqd-lbl",children:a("pack.nature.result.specialPrefix","Special role")}),e.jsx("div",{className:"nqd-nm",children:a(l.i18n,l.labelEN)})]},l.key))]}),e.jsx(V,{}),e.jsx(U,{num:"I",title:a("pack.nature.doc.i.title","The constitution"),sub:a("pack.nature.doc.i.sub","What they are made of — body, bowl and season. After Traditional Chinese Medicine.")}),e.jsxs("div",{className:"nqd-elhero",children:[e.jsxs("div",{className:"nqd-cnbox",children:[e.jsx("div",{className:"nqd-cn",children:p.cn}),e.jsx("div",{className:"nqd-cnname",children:a(p.i18n,p.labelEN)}),e.jsx("div",{className:"nqd-cnpin",children:p.pinyin})]}),e.jsxs("div",{children:[e.jsx("p",{className:"body",style:{fontSize:14},children:e.jsx(S,{s:a(`${p.i18n}.summary`,p.summaryEN)})}),e.jsx("div",{className:"nqd-facts",children:[["pack.nature.fact.season","Season",p.facts.seasonEN,"season"],["pack.nature.fact.organs","Organs",p.facts.organsEN,"organs"],["pack.nature.fact.emotion","Emotion",p.facts.emotionEN,"emotion"],["pack.nature.fact.taste","Taste",p.facts.tasteEN,"taste"],["pack.nature.fact.colour","Colour",p.facts.colourEN,"colour"]].map(([l,h,q,I])=>e.jsxs("div",{className:"nqd-fact",children:[e.jsx("span",{className:"k",children:a(l,h)}),e.jsx("span",{className:"v",children:a(`${p.i18n}.facts.${I}`,q)})]},I))})]})]}),e.jsxs("div",{className:"nqd-panel",style:{marginTop:16},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.traits","How it shows in a normal day")}),e.jsx("ul",{className:"nqd-list",children:p.traitsEN.map((l,h)=>e.jsx("li",{children:e.jsx(S,{s:a(`${p.i18n}.trait${h}`,l)})},h))})]}),e.jsxs("div",{className:"nqd-duo",children:[e.jsxs("div",{className:"nqd-panel",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.food","What suits them")}),e.jsx("ul",{className:"nqd-list tight",children:p.foodEN.map((l,h)=>e.jsx("li",{children:e.jsx(S,{s:a(`${p.i18n}.food${h}`,l)})},h))})]}),e.jsxs("div",{className:"nqd-panel",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.avoid","What works against them")}),e.jsx("ul",{className:"nqd-list tight",children:p.avoidEN.map((l,h)=>e.jsx("li",{children:e.jsx(S,{s:a(`${p.i18n}.avoid${h}`,l)})},h))})]})]}),e.jsx("p",{className:"dim",style:{fontSize:10,marginTop:9,textAlign:"center"},children:a(Ke.i18n,Ke.textEN)}),e.jsxs("div",{className:"nqd-duo",children:[e.jsxs("div",{className:"nqd-panel quiet",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.body","Body")}),e.jsx("p",{className:"dim",children:e.jsx(S,{s:a(`${p.i18n}.body`,p.bodyEN)})})]}),e.jsxs("div",{className:"nqd-panel quiet",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.watch","Worth keeping an eye on")}),e.jsx("p",{className:"dim",children:e.jsx(S,{s:a(`${p.i18n}.watch`,p.watchEN)})}),e.jsx("p",{className:"dim",style:{fontSize:10,color:o.inkWarm,marginTop:9},children:a("pack.nature.result.notDiagnosis","This is a conversation to have with your vet — not a diagnosis.")})]})]}),x&&e.jsxs("p",{className:"dim",style:{textAlign:"center",marginTop:12},children:[a("pack.nature.result.alsoElement","There is a strong second element"),":"," ",e.jsx("b",{children:a(x.i18n,x.labelEN)})]}),e.jsx(V,{}),r&&e.jsx(Xa,{b:r,own:s.element,tx:a}),e.jsx(U,{num:"II",title:a("pack.nature.doc.ii.title","The role in the pack"),sub:a("pack.nature.doc.ii.sub","What they hold for the pack — and how much work and rest that means")}),e.jsxs("div",{className:"nqd-panel",children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.signs","You will know them by")}),e.jsx("ul",{className:"nqd-list",children:m.signsEN.map((l,h)=>e.jsx("li",{children:e.jsx(S,{s:a(`${m.i18n}.sign${h}`,l)})},h))})]}),e.jsxs("div",{className:"nqd-panel quiet",style:{marginTop:14},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.myth","The usual verdict")}),e.jsxs("p",{style:{fontFamily:b,fontSize:14,fontStyle:"italic",color:o.inkWarm,margin:"0 0 8px"},children:["„",a(`${m.i18n}.myth`,m.mythEN),'"']}),e.jsx("p",{className:"body",style:{margin:0},children:e.jsx(S,{s:a(`${m.i18n}.mythAnswer`,m.mythAnswerEN)})})]}),e.jsxs("div",{className:"nqd-panel quiet",style:{marginTop:14},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.result.pressure","Under pressure")}),e.jsx("p",{className:"dim",children:e.jsx(S,{s:a(`${m.i18n}.pressure`,m.pressureEN)})})]}),e.jsxs("div",{className:"nqd-panel",style:{marginTop:14},children:[e.jsx("p",{className:"nqd-eyebrow",children:a("pack.nature.doc.duty","What the job asks of the day")}),e.jsx("ul",{className:"nqd-list tight",children:m.dutyEN.map((l,h)=>e.jsx("li",{children:e.jsx(S,{s:a(`${m.i18n}.duty${h}`,l)})},h))})]}),e.jsxs("p",{className:"dim",style:{textAlign:"center",marginTop:12,fontSize:10},children:[a("pack.nature.result.origin","In the source research"),": ",m.originEN,f&&e.jsxs(e.Fragment,{children:[" · ",a("pack.nature.result.alsoRole","They also carry a strong second role"),":"," ",e.jsx("b",{children:a(f.i18n,f.labelEN)})]})]}),g.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(V,{}),e.jsx(U,{num:"III",title:a("pack.nature.doc.iii.title","Special role"),sub:a("pack.nature.doc.iii.sub","Sits ON TOP of the core role — it is not its rival")}),e.jsx("div",{style:{display:"grid",gap:14},children:g.map(l=>e.jsxs("div",{className:"nqd-panel",style:{display:"flex",gap:16,alignItems:"center"},children:[e.jsx("img",{src:l.art,alt:"","aria-hidden":!0,loading:"lazy",style:{width:78,flex:"0 0 auto"}}),e.jsxs("div",{children:[e.jsx("h3",{style:{fontFamily:M,fontWeight:900,fontSize:16,letterSpacing:"0.02em",textTransform:"uppercase",margin:"0 0 5px",color:"#1a0900"},children:a(l.i18n,l.labelEN)}),e.jsx("p",{className:"dim",children:e.jsx(S,{s:a(`${l.i18n}.desc`,l.descEN)})})]})]},l.key))})]}),e.jsx(V,{}),e.jsx(U,{num:"IV",title:a("pack.nature.doc.iv.title","Guidance"),sub:a("pack.nature.doc.iv.sub","The substance is above — what stays here is what cannot be guessed")}),e.jsxs("div",{className:"nqd-panel",children:[k.pair&&e.jsxs("div",{className:"nqd-pair",children:[e.jsxs("div",{className:"cross",children:[a("pack.nature.doc.pair","Where the two meet")," ·"," ",a(m.i18n,m.labelEN)," × ",a(p.i18n,p.labelEN)]}),e.jsx("b",{className:"t",style:{display:"block",fontFamily:M,fontWeight:700,fontSize:12,letterSpacing:"0.02em",textTransform:"uppercase",marginBottom:4,color:"#1a0900"},children:a(`${k.pair.i18n}.title`,k.pair.titleEN)}),e.jsx("span",{style:{fontFamily:b,fontSize:14,lineHeight:1.6,color:"#1a0900"},children:e.jsx(S,{s:a(`${k.pair.i18n}.text`,k.pair.textEN)})})]}),e.jsx(Ge,{title:a("pack.nature.doc.mistakes","Common mistakes"),from:a("pack.nature.doc.mistakesFrom","what most often goes wrong with this result"),rows:k.mistakes,tx:a}),e.jsx(Ge,{title:a("pack.nature.doc.details","Details that help"),from:a("pack.nature.doc.detailsFrom","small things that are not obvious"),rows:k.details,tx:a})]}),Ca(s)&&e.jsxs(e.Fragment,{children:[e.jsx(V,{}),e.jsx(U,{num:"V",title:a("pack.nature.result.scoresTitle","How it added up"),sub:a("pack.nature.doc.v.sub","Every answer adds weight to more than one line")}),e.jsx(Za,{r:s,tx:a})]}),e.jsx(V,{}),e.jsxs("div",{className:"nqd-foot",children:[e.jsxs("p",{children:["DOGYPT · ",a("pack.nature.doc.footTitle","WHO IS YOUR DOG"),e.jsx("br",{}),a(oe.i18n,oe.textEN)]}),e.jsx("img",{className:"nqd-seal",src:"/_certassets/seal.png",alt:"","aria-hidden":!0,loading:"lazy"})]})]})})})}function jn(){var Me;const n=ka(),[s]=va(),r=Ae(),a=(t,c)=>{const i=r(t);return i===t?c:i},m=aa(),p="magnet-guest",f=s.get("dog"),x=!m&&s.get("view")==="result",j=s.get("from"),k=m?"/magnet":Wa(j,f)??La,[g,l]=y.useState(m?[{id:p,dog_name:a("magnet.pv.quiz.dog","your dog"),cloudinary_main_url:"/images/magnet/kviz.webp",heroglyph_png_url:null}]:null),[h,q]=y.useState(null),[I,B]=y.useState(x),[z,R]=y.useState("intro"),[_,G]=y.useState(0),[$,Te]=y.useState({}),[C,$e]=y.useState({}),[K,Ce]=y.useState({}),[re,Oe]=y.useState(!1),[sa,De]=y.useState(!1),[la,Pe]=y.useState(!1),se=y.useRef({}),le=y.useRef({}),Z=y.useRef(null),Y=()=>{Z.current!==null&&(window.clearTimeout(Z.current),Z.current=null)};y.useEffect(()=>Y,[]),y.useEffect(()=>{window.scrollTo({top:0,behavior:"instant"})},[z,_]),y.useEffect(()=>{if(m)return;let t=!0;return(async()=>{var A;const{data:c}=await Se.auth.getUser(),i=(A=c==null?void 0:c.user)==null?void 0:A.id;if(!i){t&&(_a.filter(W=>!f||W.id===f),l([]));return}let d=Se.from("dogs").select("id, dog_name, cloudinary_main_url, heroglyph_png_url").eq("payment_status","paid").order("created_at",{ascending:!0});const u=await Na();d=u?d.in("id",u):d.eq("user_id",i),f&&(d=d.eq("id",f));const{data:E}=await d;t&&l(E??[])})(),()=>{t=!1}},[f]);const v=y.useMemo(()=>g??[],[g]),L=v.length===1;y.useEffect(()=>{if(!x||g===null)return;if(g.length===0){B(!1);return}let t=!0;return Pa(g.map(c=>c.id)).then(c=>{var d,u,E,A,W;if(!t)return;const i=[];for(const Be of g){const Q=c[Be.id]??{},Le=Aa({element:(d=Q["nature.element"])==null?void 0:d.value,role:(u=Q["nature.role"])==null?void 0:u.value,specials:(E=Q["nature.specials"])==null?void 0:E.value,scores:(A=Q["nature.scores"])==null?void 0:A.value}),We=(W=Q["nature.balance"])==null?void 0:W.value,xa=be(Array.isArray(We)?We:[]);Le&&i.push({dog:Be,r:Le,b:xa})}q(i),i.length===0&&B(!1)}).catch(()=>{t&&B(!1)}),()=>{t=!1}},[x,g]);const da=()=>{B(!1),q(null);const t=new URLSearchParams;f&&t.set("dog",f),j&&t.set("from",j),n(t.toString()?`/pack/nature?${t}`:"/pack/nature",{replace:!0})},Ie=[...ke,...ve],de=Ie.length+te.length,ce=y.useMemo(()=>{if(v.length===0)return 0;const t=Ie.filter(i=>v.every(d=>{var u;return(u=$[d.id])==null?void 0:u[i.id]})).length,c=te.filter(i=>v.every(d=>{var u;return(u=C[d.id])==null?void 0:u[i]})).length;return t+c},[v,$,C]),J=z==="element"?ke:z==="role"?ve:[],ca=v.length>0&&v.every(t=>te.every(c=>{var i;return(i=C[t.id])==null?void 0:i[c]})),Re=y.useMemo(()=>z!=="result"?[]:v.map(t=>({dog:t,r:ye($[t.id]??{},C[t.id]??{}),b:be(K[t.id]??[])})),[z,v,$,C,K]),pa=async t=>{if(re||t.length===0)return;const c=[];for(const{dog:i,r:d}of t){c.push({dogId:i.id,field:"nature.element",value:d.element,source:"quiz"}),c.push({dogId:i.id,field:"nature.role",value:d.role,source:"quiz"}),c.push({dogId:i.id,field:"nature.specials",value:d.specials,source:"quiz"}),c.push({dogId:i.id,field:"nature.scores",value:{...d.scores,sec:{el:d.elementSecond,role:d.roleSecond}},source:"quiz"});const u=K[i.id]??[];c.push({dogId:i.id,field:"nature.balance",value:u,source:"quiz"})}if(!m)try{await Ia(c),Oe(!0),De(!1)}catch{De(!0)}},_e=(t,c,i)=>{const d=i?[i]:v.map(A=>A.id),u={...se.current};for(const A of d)u[A]={...u[A],[t]:c};se.current=u,Te(u);const E=v.length>0&&v.every(A=>{var W;return(W=u[A.id])==null?void 0:W[t]});Y(),E&&(Z.current=window.setTimeout(()=>{Z.current=null,pe()},Ha))},ma=t=>v.length>0&&v.every(c=>{var i;return(i=$[c.id])==null?void 0:i[t]}),ae=["element","balance","role","special"],pe=()=>{if(Y(),J.length&&_<J.length-1){G(c=>c+1);return}const t=ae[ae.indexOf(z)+1];G(0),R(t??"special")},me=()=>{if(Y(),_>0){G(c=>c-1);return}const t=ae[ae.indexOf(z)-1];t&&(R(t),G(t==="element"?ke.length-1:t==="role"?ve.length-1:0))},ge=(t,c,i)=>{const d=i?[i]:v.map(E=>E.id),u={...le.current};for(const E of d)u[E]={...u[E],[t]:c};le.current=u,$e(u)},ga=(t,c)=>{Ce(i=>{const d=i[t]??[];return{...i,[t]:d.includes(c)?d.filter(u=>u!==c):[...d,c]}})},ua=()=>{Y(),se.current={},le.current={},Te({}),$e({}),Ce({}),G(0),Oe(!1),R("intro")},ha=Object.values($).some(t=>Object.keys(t).length>0)||Object.values(C).some(t=>Object.keys(t).length>0)||Object.values(K).some(t=>t.length>0),Fe=()=>n(k),ue=()=>{if(z!=="intro"&&z!=="result"&&ha){Pe(!0);return}Fe()},he=la?e.jsx(Qa,{tx:a,onStay:()=>Pe(!1),onLeave:Fe}):null;if(g!==null&&v.length===0)return e.jsxs(O,{onClose:()=>n(k),children:[e.jsxs(X,{children:[e.jsx(qe,{children:a("pack.nature.intro.eyebrow","Three short quizzes, one document")}),e.jsx("p",{style:{fontFamily:b,fontSize:14,lineHeight:1.6,color:o.inkStrong,margin:0},children:a("pack.nature.noDogs","This quiz writes its result onto a dog’s card, and there is no dog on your account yet.")}),e.jsx("div",{style:{marginTop:16,textAlign:"center"},children:e.jsx("button",{type:"button",className:"nq-gold",onClick:()=>n("/pack/dogs"),children:a("pack.nature.noDogsCta","Back to my dogs")})})]}),e.jsx(ee,{tx:a})]});if(I)return h===null?e.jsx(O,{onClose:()=>n(k),children:e.jsx("div",{style:{minHeight:260}})}):e.jsxs(O,{onClose:()=>n(k),children:[h.map(({dog:t,r:c,b:i},d)=>e.jsx("div",{style:{marginTop:d===0?0:26},children:e.jsx(Je,{dog:t,r:c,b:i,tx:a})},t.id)),e.jsxs("div",{style:{marginTop:18,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"},children:[e.jsxs("button",{type:"button",className:"nq-ghost is-ondark",onClick:da,children:[e.jsx(Ue,{size:14})," ",a("pack.nature.result.again","Take it again")]}),e.jsx("button",{type:"button",className:"nq-gold is-ondark",onClick:()=>n(k),children:a("pack.nature.result.done","Done")})]})]});if(z==="intro")return e.jsxs(O,{onClose:()=>n(k),fill:!0,children:[e.jsxs(X,{className:"nq-intro",style:{flex:1,padding:0,overflow:"hidden"},children:[e.jsx("div",{className:"nq-introart",children:e.jsx("img",{src:ra,alt:"","aria-hidden":!0})}),e.jsxs("div",{className:"nq-introbody",children:[e.jsx(qe,{children:a("pack.nature.intro.eyebrow","Three short quizzes, one document")}),e.jsx("h1",{style:{...ya.card,lineHeight:1.2,color:o.inkStrong,margin:0},children:a("pack.nature.intro.title","Who is your dog?")}),e.jsx("p",{style:{fontFamily:b,fontSize:14,lineHeight:1.55,color:o.inkStrong,margin:"8px 0 0"},children:a("pack.nature.intro.body","Twenty-two questions and one checklist. You learn what your dog is made of, what job they do for your family and where their balance leans right now.")}),e.jsx(Ua,{className:"nq-introrule"}),e.jsxs("div",{className:"nq-axes",children:[e.jsx(we,{icon:"yinyang",title:a("pack.nature.intro.axis1","Constitution"),sub:a("pack.nature.intro.axis1sub","Body, temperament and what to feed.")}),e.jsx(we,{icon:"house-heart",title:a("pack.nature.intro.axis2","Role in the pack"),sub:a("pack.nature.intro.axis2sub","Their job in the family — and what everyone gets wrong.")}),e.jsx(we,{icon:"sliders",title:a("pack.nature.intro.axis3","Balance right now"),sub:a("pack.nature.intro.axis3sub","Constitution is for life. Balance shifts.")})]}),e.jsx(Ga,{tx:a}),e.jsx("div",{style:{marginTop:12},children:e.jsx("button",{type:"button",className:"nq-gold is-big",onClick:()=>R("element"),children:a("pack.nature.intro.cta","Start")})})]})]}),e.jsx(ee,{tx:a})]});if(z==="element"||z==="role"){const t=J[_],c=_===J.length-1;return e.jsxs(O,{onClose:ue,fill:!0,overlay:he,children:[e.jsxs(X,{style:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsx(Ne,{}),e.jsxs("div",{style:ze(v.length),children:[e.jsx(Ee,{done:ce,total:de,label:`${z==="element"?a("pack.nature.part.element","Body"):a("pack.nature.part.role","Pack")} · ${a("pack.nature.question","Question")} ${_+1} / ${J.length}`}),e.jsx("h2",{style:{fontFamily:M,fontWeight:700,fontSize:"clamp(1.2rem,4.4vw,1.65rem)",lineHeight:1.22,letterSpacing:"0.02em",color:o.inkStrong,margin:0},children:a(t.i18n,t.labelEN)}),e.jsx("div",{"aria-hidden":!0,style:{height:2,width:132,borderRadius:2,margin:"13px 0 16px",background:`linear-gradient(90deg, ${o.cardEdge}, rgba(201,154,63,0))`}}),_===0&&z==="element"&&e.jsx(Ja,{solo:L,tx:a}),e.jsx("div",{className:"nq-opts",children:t.options.map((i,d)=>e.jsx(Ye,{label:a(i.i18n,i.labelEN),mark:String.fromCharCode(65+d),dogs:v,solo:L,isOn:u=>{var E;return((E=$[u])==null?void 0:E[t.id])===i.id},onPickDog:u=>_e(t.id,i.id,u),onPickAll:()=>_e(t.id,i.id,null)},i.id))}),e.jsxs("div",{className:"nq-nav",children:[e.jsxs("button",{type:"button",className:"nq-ghost",disabled:z==="element"&&_===0,onClick:me,children:[e.jsx(je,{className:"h-3.5 w-3.5"})," ",a("pack.nature.back","Back")]}),e.jsx("button",{type:"button",className:"nq-gold",disabled:!ma(t.id),onClick:pe,children:c?a("pack.nature.toSpecial","Continue"):a("pack.nature.next","Next")})]})]})]}),e.jsx(ee,{tx:a})]})}if(z==="balance")return e.jsxs(O,{onClose:ue,fill:!0,overlay:he,children:[e.jsxs(X,{style:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsx(Ne,{}),e.jsxs("div",{style:ze(v.length),children:[e.jsx(Ee,{done:ce,total:de,label:a("pack.nature.part.balance","Balance")}),e.jsx("h2",{style:{fontFamily:M,fontWeight:700,fontSize:"clamp(1.2rem,4.4vw,1.65rem)",lineHeight:1.22,letterSpacing:"0.02em",color:o.inkStrong,margin:0},children:a("pack.nature.balance.title","Anything going on right now?")}),e.jsx("div",{"aria-hidden":!0,style:{height:2,width:132,borderRadius:2,margin:"13px 0 16px",background:`linear-gradient(90deg, ${o.cardEdge}, rgba(201,154,63,0))`}}),e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.6,color:o.inkStrong,margin:"0 0 6px"},children:a("pack.nature.balance.body","Your dog’s constitution is set for life, but it can tip out of balance. Tick anything that applies — as much or as little as you like.")}),e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.55,color:o.inkWarm,margin:"0 0 16px"},children:a("pack.nature.balance.none","Nothing on the list? Leave it empty and carry on — that is the best answer there is.")}),v.map(t=>e.jsxs("div",{style:{marginTop:18},children:[!L&&e.jsx("div",{style:{fontFamily:Ba,fontWeight:700,fontSize:14,letterSpacing:".02em",color:o.inkStrong,marginBottom:10,textTransform:"uppercase"},children:t.dog_name??"—"}),e.jsx("div",{style:{display:"grid",gap:14},children:na.map(c=>{const i=Ta.filter(d=>d.element===c);return e.jsxs("div",{style:{...P.subblock,padding:"12px 16px"},children:[e.jsx("div",{style:{fontFamily:b,fontWeight:500,fontSize:10,letterSpacing:".26em",textTransform:"uppercase",color:o.cardEdge,marginBottom:10},children:a(T[c].i18n,T[c].labelEN)}),e.jsx("div",{style:{display:"flex",flexWrap:"wrap",gap:7},children:i.map(d=>{const u=(K[t.id]??[]).includes(d.id);return e.jsxs("button",{type:"button",onClick:()=>ga(t.id,d.id),"aria-pressed":u,title:d.noteEN?a(`${d.i18n}.note`,d.noteEN):void 0,className:`pf-pill${u?" is-on":""}`,style:{fontFamily:b,fontSize:12,lineHeight:1.35,textAlign:"left",padding:"8px 12px",borderRadius:999,cursor:"pointer",border:`1px solid ${u?o.cardEdge:"rgba(179,130,45,0.55)"}`,background:u?"linear-gradient(180deg,#F5C73D,#E69E1A)":o.tileBg,color:u?"#3d1f00":o.inkStrong,fontWeight:u?600:400},children:[a(d.i18n,d.labelEN),d.noteEN&&e.jsx("span",{style:{display:"block",fontSize:10,opacity:.75,marginTop:1},children:a(`${d.i18n}.note`,d.noteEN)})]},d.id)})})]},c)})})]},t.id)),e.jsxs("div",{className:"nq-nav",children:[e.jsxs("button",{type:"button",className:"nq-ghost",onClick:me,children:[e.jsx(je,{className:"h-3.5 w-3.5"})," ",a("pack.nature.back","Back")]}),e.jsx("button",{type:"button",className:"nq-gold",onClick:pe,children:a("pack.nature.next","Next")})]})]})]}),e.jsx(ee,{tx:a})]});if(z==="special")return e.jsxs(O,{onClose:ue,fill:!0,overlay:he,children:[e.jsxs(X,{style:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsx(Ne,{}),e.jsxs("div",{style:ze(v.length),children:[e.jsx(Ee,{done:ce,total:de,label:a("pack.nature.progress","Progress")}),e.jsx(qe,{children:a("pack.nature.special.eyebrow","Four more — looking for special roles")}),e.jsx("p",{style:{fontFamily:b,fontSize:12,lineHeight:1.55,color:o.inkWarm,marginBottom:14},children:a("pack.nature.special.body","These four roles sit on top of the main one. Most dogs carry none — that is normal.")}),!L&&e.jsx(Ya,{tx:a}),e.jsx("div",{style:{display:"grid",gap:14,marginTop:L?0:12},children:te.map(t=>{const c=ta[t];return e.jsxs("div",{children:[e.jsx("div",{style:{fontFamily:b,fontSize:12,lineHeight:1.45,color:o.inkStrong,marginBottom:8},children:a(c.qI18n,c.questionEN)}),L?e.jsx("div",{style:{display:"flex",gap:8},children:["yes","sometimes","no"].map(i=>{var d,u;return e.jsx("button",{type:"button",className:`nq-tri${((u=C[(d=v[0])==null?void 0:d.id])==null?void 0:u[t])===i?" is-on":""}`,onClick:()=>ge(t,i,null),children:a(`pack.nature.ans.${i}`,i==="yes"?"Yes":i==="no"?"No":"Sometimes")},i)})}):e.jsx("div",{className:"nq-opts",children:["yes","sometimes","no"].map(i=>e.jsx(Ye,{label:a(`pack.nature.ans.${i}`,i==="yes"?"Yes":i==="no"?"No":"Sometimes"),dogs:v,solo:!1,isOn:d=>{var u;return((u=C[d])==null?void 0:u[t])===i},onPickDog:d=>ge(t,i,d),onPickAll:()=>ge(t,i,null)},i))})]},t)})}),e.jsxs("div",{className:"nq-nav",children:[e.jsxs("button",{type:"button",className:"nq-ghost",onClick:me,children:[e.jsx(je,{className:"h-3.5 w-3.5"})," ",a("pack.nature.back","Back")]}),e.jsx("button",{type:"button",className:"nq-gold",disabled:!ca,onClick:()=>{const t=v.map(c=>({dog:c,r:ye($[c.id]??{},C[c.id]??{}),b:be(K[c.id]??[])}));if(m){R("gate");return}R("result"),pa(t)},children:a("pack.nature.special.cta","Show the result")})]})]})]}),e.jsx(ee,{tx:a})]});if(z==="gate"&&m){const t=((Me=v[0])==null?void 0:Me.id)??p,c=C[t]??{},i={...$[t]??{}};for(const d of Object.keys(c))i[`sp_${d}`]=String(c[d]);return e.jsx(O,{onClose:()=>R("special"),children:e.jsx(Ma,{answers:i,result:ye($[t]??{},c),onDone:()=>R("result")})})}return z==="gate"||Re.length===0?null:e.jsxs(O,{onClose:()=>n(k),children:[Re.map(({dog:t,r:c,b:i},d)=>e.jsx("div",{style:{marginTop:d===0?0:26},children:e.jsx(Je,{dog:t,r:c,b:i,tx:a})},t.id)),e.jsxs("div",{style:{marginTop:18,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"},children:[e.jsxs("button",{type:"button",className:"nq-ghost is-ondark",onClick:ua,children:[e.jsx(Ue,{size:14})," ",a("pack.nature.result.again","Take it again")]}),!m&&e.jsx("button",{type:"button",className:"nq-gold is-ondark",onClick:()=>n(k),children:a("pack.nature.result.done","Done")})]}),m&&e.jsx("div",{style:{...P.subblock,padding:"12px 16px",marginTop:18},children:e.jsx("p",{style:{fontFamily:b,fontSize:14,lineHeight:1.55,color:o.inkStrong,margin:0},children:a("magnet.pv.quiz.p","As a Dogyptian you save the full reading — food, what to watch, advice from AINUBIS — to your dog’s DOG ID.")})}),sa&&!re&&e.jsx("p",{role:"alert",style:{fontFamily:b,fontSize:12,color:"#E08A70",marginTop:12,textAlign:"center"},children:a("pack.diary.saveFailed","The entry could not be saved. Try again.")}),re&&e.jsxs("p",{style:{fontFamily:b,fontSize:10,color:"rgba(245,240,228,0.55)",marginTop:12,textAlign:"center"},children:[e.jsx(oa,{size:12})," ",L?a("pack.nature.result.saved","Saved to your dog’s card"):a("pack.nature.result.savedAll","Saved to every dog’s card")]})]})}export{jn as default};
