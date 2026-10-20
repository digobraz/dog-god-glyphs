import{r as i,u as ct,e as mt,l as ut,as as gt,j as t,a5 as Pe,P as ue,aj as bt,aH as ht,V as kt,T as xt,J as v,F as ft,a7 as vt,a6 as yt,am as le,K as T,af as E,L as k,b as q,U as de,i as A,a2 as C,C as jt,D as P}from"./index-B-BQrD2y.js";import{u as wt,i as $t,a as Nt,b as zt,p as Ce,C as Tt,d as Et,T as At}from"./useMapNotes-DvdwMaPm.js";import{a as Oe,G as It,b as St}from"./tripGrade-DBjHKcCL.js";import{HERO_TRAILS as H}from"./data-trails-C7pS6eM2.js";import{HERO_JOURNEYS as ge}from"./data-journeys-qHcguO2r.js";import{u as Pt,a as Ct,b as Ot,w as Rt,e as Mt}from"./PackLayout-CGhWU_Yk.js";import{useMagnetPreview as Dt,usePackNavigate as _t,MAGNET_IDENTITY as Lt,MAGNET_MEMBER_TRAILS as Kt,MAGNET_FOUNDER as J,MagnetInfoBubble as Re}from"./magnetPreview-CvEjQVpP.js";import{u as Vt}from"./usePackStoreEpoch-CNCd9itR.js";import{J as Me}from"./dogQuiz-DTCKwKwf.js";import{o as Ft,p as De,r as Bt,h as Gt}from"./dogEvents-O4Dj4HRt.js";import{u as Wt,P as qt}from"./dogRights-BhKk5QOi.js";import{v as Jt,r as _e,h as Ht,V as Ut,b as Le,a0 as Yt,I as Ke,t as Zt,q as Ve,x as Fe,e as pe}from"./tripShared-DMsMy27X.js";import{r as Be,v as Xt,E as Qt,e as Ge,P as ce,F as ea,G as ta}from"./packStore-DJ0be3Fh.js";import{p as aa}from"./tripPlaceholder-DR6_6X-Q.js";import{b as oa}from"./packCommunity-COkYLiGy.js";import{t as ra}from"./countryGeo-BaPfaSrG.js";import{supabase as U}from"./client-rJzPTh-q.js";import{a as me,s as ia,b as sa,t as na,u as We}from"./triplist-CjhvWRRF.js";import{s as qe}from"./cloudinaryService-BTfH_t1m.js";import{e as la}from"./wishData-g3GPwQKD.js";import{W as Je}from"./wizAnchors-E3ARHgZI.js";import{f as He}from"./flagUrl-B21iQI9I.js";import"./memberProfile-CkCYz6WX.js";import"./packProfile-C55E2wZh.js";import"./RightGate-zty8MLC_.js";import"./use-toast-NWTrH8M9.js";import"./HandIcons-nK6bMixK.js";import"./handArrowLeft-DN9pj_cL.js";import"./packHumans-CUwsosUz.js";import"./tslib.es6-CmEaCU22.js";import"./tripPoints-BeyowCTc.js";import"./packTiers-0E8WcxgQ.js";import"./FlagCircle-DvRRQ32j.js";import"./mapNotesData-Cu9T98GB.js";import"./devMockDogs-BzGWz4qV.js";import"./chataNahlad-BvQ_JlDS.js";import"./ainubisBus-BMRzmB2O.js";import"./consent-DRIYVBQY.js";import"./ainubis-head-g4iOYlxZ.js";import"./ainubisSkin-B7Z96MPq.js";import"./natureQuiz-BjVOn8Uc.js";import"./BrandIcon-Cj2cTb6H.js";import"./ainubis-badge-BGb27Nxy.js";import"./SnifferLogo-Ch81E6FO.js";import"./BackButton-XC1Pn_3O.js";import"./pawmateRights-CWmFDd90.js";import"./addTripModel-BuQrZHBF.js";const da=(o,h)=>`${o}|${h}`;function pa(o=0){const[h,n]=i.useState({}),d=i.useCallback(async()=>{var f,$;const{data:p}=await U.auth.getSession(),g=($=(f=p.session)==null?void 0:f.user)==null?void 0:$.id;if(!g){n({});return}const{data:m,error:x}=await U.from("trip_requests").select("trip_slug,organizer_id,status").eq("from_user_id",g);if(x||!m){n({});return}n(Object.fromEntries(m.map(w=>[da(w.trip_slug,w.organizer_id),w.status])))},[]);return i.useEffect(()=>{d()},[d,o]),h}function ca(o=0){const[h,n]=i.useState({}),d=i.useCallback(async()=>{var $,w,N;const{data:p}=await U.auth.getSession(),g=(w=($=p.session)==null?void 0:$.user)==null?void 0:w.id;if(!g){n({});return}const{data:m,error:x}=await U.from("trip_requests").select("id,trip_slug,from_user_id,created_at").eq("organizer_id",g).eq("status","requested").order("created_at",{ascending:!0});if(x||!m){n({});return}const f={};for(const S of m)(f[N=S.trip_slug]??(f[N]=[])).push({id:S.id,tripSlug:S.trip_slug,fromUserId:S.from_user_id,createdAt:S.created_at});n(f)},[]);return i.useEffect(()=>{d()},[d,o]),{bySlug:h,count:Object.values(h).reduce((p,g)=>p+g.length,0)}}const Ue=540,ma="#C99A3F",ua="#1F1A0E",s=ue,r=xt,ga=864e5,ba=`
/* ── DRAK → BRIGHT (2026-09-01) ────────────────────────────────────────────
   TRIPLIST aj TRIPSTATS idú do bledého šatu. Podklad stránky NIE JE napísaný
   tu — je to .pk-paper z packTheme.ts (variant B, Matej 1. 9.: papyrus aj na
   pozadí, tapeta preladená do zlata na piesku). Kto sem píše novú farbu plochy,
   píše ju na zlé miesto.
   ⚠️ .tl-root už NEMÁ vlastné pozadie ani min-height — oboje nesie .pk-paper.
      Dve nepriehľadné plochy nad sebou by tapetu prekryli. */
.tl-root{color:${r.ink};font-family:${v};position:relative;padding-bottom:calc(${ft.xxxl}px + 62px);}
/* Šírka aj vodorovný padding sú TIE ISTÉ ako v PackLayout (PACK_COL) — táto stránka
   PackLayout nemountuje, tak si ich musí vziať z konštanty. Do 13. 8. tu bolo 860px
   a preklik z profilu (1024px) stránku viditeľne zúžil. */
.tl-body{max-width:${vt.wide}px;margin:0 auto;padding:${yt} ${le.desktop}px 0;position:relative;z-index:2;}
@media (max-width:640px){ .tl-body{padding-left:${le.mobile}px;padding-right:${le.mobile}px;} }
/* Šípka späť + AINUBIS = spoločný rad PackTopRow (27. 9. 2026). Tvar tejto šípky (38 px,
   v strede) bol vzorom pre celý /pack — odtiaľto odišiel do BACK a PACK_TOPROW. */
.tl-title{font-family:${T};font-weight:700;font-size:24px;letter-spacing:0.02em;color:${r.deep};text-align:center;}
.tl-sub{font-size:12px;color:${r.dim};text-align:center;margin-top:6px;}

/* dvojkartový prepínač TRIPLIST | TRIPSTATS — aktívna karta = LAPIS, druhá „vedľa" = klik na prepnutie */
/* V3 (#46): len IKONA a NÁZOV, žiadny podnadpis, vycentrované a väčšie. Podnadpisy („12 walked ·
   148 km" / „Next trip · o 3 dni") hovorili to isté, čo obsah hneď pod nimi, a rozbíjali karte os
   — teraz je karta jeden symbol a jedno slovo.
   ⚠️ AKTÍVNA JE LAPISOVÁ, NIE ZLATÁ (2026-09-01). Nie je to nový nápad: presne tento prepínač
   pohľadov už na bledom povrchu existuje — „TRIPS | EVENTS | SERVICES" v ľavom paneli mapy
   (.trp-catpill.on v PackMap.tsx). Zlatá na papyruse nesie KONŠTRUKCIU (rám, doska, aktívna
   pilulka navu); toto je moja voľba, čo chcem vidieť, teda lapis. Neaktívna karta je papyrusový
   podblok — dve súperiace farby by z prepínača spravili dve rovnocenné tlačidlá. */
.tl-tabs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;}
/* ⚠️ IKONKA JE V TEJ ISTEJ FARBE AKO NADPIS A STOJÍ VEDĽA NEHO (Matej 1. 9. 2026:
   „prečo je ikonka inej farby a v oramovani ako samotný nadpis? skús to dať do jednej farby
   bez oramovania a možno aj vedľa seba").
   Predtým mala vlastnú dlaždicu (zlatý rám + tlmená výplň) a vlastný filter — teda v jednej
   karte stáli dva prvky v dvoch farbách a dvoch tvaroch, hoci hovoria to isté slovo.
   Riešenie je MASKA, nie filter: background:currentColor cez -webkit-mask znamená, že
   ikonka DEDÍ farbu textu — na papyruse inkoust, na lapise zlato, a pri ďalšej zmene farby
   nadpisu ju netreba dolaďovať. Filter by sa musel prepočítavať ku každému odtieňu zvlášť. */
.tl-tab{display:flex;align-items:center;justify-content:center;padding:16px 16px;border-radius:16px;border:1.5px solid ${s.cardEdge};background:${s.panelGrad};box-shadow:${E.lift};cursor:pointer;text-align:center;transition:border-color .15s,transform .15s,background .15s,box-shadow .15s;}
.tl-tab:hover{transform:translateY(-1px);box-shadow:0 0 0 3px ${ue.hairline},${E.lift};}
.tl-tab-label{font-family:${T};font-weight:700;font-size:16px;letter-spacing:0.14em;text-transform:uppercase;color:${r.ink};display:flex;flex-direction:row;align-items:center;gap:11px;min-width:0;}
.tl-tab-ic{width:26px;height:26px;flex-shrink:0;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
/* AKTÍVNA KARTA = PLNÝ LAPIS (Matej 5. 10. 2026: „toto tlačidlo výberu daj ako bolo — lapisom,
   nie len priesvitným"). Audit 1A (2. 10.) ho prepol na priesvitný tint podľa locku „výber je tint,
   plná plocha len pre jediné CTA" (brand.md) — Matej to tu vrátil. VÝNIMKA platí pre TENTO
   prepínač dvoch veľkých kariet, nie pre chipy a filtre. */
.tl-tab.on{background:${k.grad};border-color:${k.deep};box-shadow:${q};}
.tl-tab.on:hover{background:${k.gradHover};}
.tl-tab.on .tl-tab-label{color:${k.ink};}
@media (max-width:400px){ .tl-tab{padding:16px 12px;} .tl-tab-label{font-size:12px;letter-spacing:0.14em;gap:8px;} .tl-tab-ic{width:22px;height:22px;} }

/* OBSAHOVÝ PANEL = ZLATO-RÁMOVANÝ BLOK (Matej 1. 9. 2026: „celý tento blok by mal byť nejakou
   zlatou… možno cely blok kde je tento a konci to odznakmi by mal byť blok").
   Recept NEVYMÝŠĽAM — je locknutý: goldFrameCSS() z navGoldSkin.ts, volaný BEZ parametrov,
   takže tvar berie z BLOCK (radius 14 / lem 6 = presne NAV_R spodného navu). Ten istý blok
   nesie ľavý panel mapy, dok nad mapou aj stavový riadok; štvrtá sada vlastných čísel by sa
   pri prvej úprave predlohy rozišla.
   Do 1. 9. 2026 to bolo tmavé sklo .pk-glass, potom (ráno) papyrusová karta. Karta bola o krok
   bližšie, ale mala rovnaký materiál ako bloky VNÚTRI nej — teraz je vonkajší obal zlatý rám
   s pieskovcovou doskou a papyrus ostáva tomu, čo na doske leží.
   ⚠️ Rám je border:6px solid transparent, teda si berie 6 px z každej strany — vodorovný
   padding preto klesol o toľko isto, nech obsah stojí tam, kde stál. */
.tl-panel{margin-top:14px;padding:16px 16px 16px;${jt()}}
.tl-section + .tl-section{margin-top:22px;}
/* deliaca čiara vnútri karty = zlatá, vyblednutá do strán (lock bledého bloku z Entry.tsx),
   NIE šedý 1px hairline. */
.tl-divider{height:2px;background:${s.rule};margin:22px 0;border:0;}
.tl-sechead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;}
/* Nadpis sekcie na papyruse: zlatá je TMAVŠIA (#8a5a14), nie brandová ${s.cardEdge} — tá je na
   svetlom podklade len o niečo tmavšia než sám papyrus a stráca sa. */
.tl-sechead h3{font-family:${v};font-weight:500;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${r.deep};margin:0;}
/* nadpis vľavo, počet + tlačidlo spolu vpravo — pri troch prvkoch space-between rozhodil počet doprostred (audit 27. 9.) */
.tl-sechead h3{margin-right:auto;}
/* Počet + PREČO je karta tam, kde je. Pás MOJICH VÝLETOV mal pri meraní 16. 9. 2026
   73 kariet (11 818 px; na 500 px okne vidno 2,6) a 72 z nich bolo prejdených — bez
   tejto vety je to nekonečný pás bez zjavného poradia. sortMyTrips radí najbližší
   dátum dopredu, potom bezdátumové, prejdené dozadu; veta to len hovorí nahlas. */
.tl-sechint{font-family:${v};font-weight:500;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:${r.dim};white-space:nowrap;}
/* Pod 480 px ostáva len POČET: vysvetlenie poradia inak vytlačí nadpis sekcie do dvoch
   riadkov (merané na 360 px) a nápoveda tak vyhrá nad titulkom, čo je naopak. */
.tl-sechint i{font-style:normal;}
@media (max-width:480px){.tl-sechint i{display:none;}}
.tl-seeall{font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${r.dim};background:${r.soft};border:1px solid ${r.border};border-radius:999px;padding:4px 12px;cursor:pointer;white-space:nowrap;}
.tl-seeall:hover{color:${r.deep};border-color:${s.cardEdge};background:${s.card};}
/* prepínač viditeľnosti sekcie OPEN TRIPS (Matej 1. 9. 2026: „možnosť vybrať si či sa mi to
   má zobrazovať alebo nie") — stav pilulky je VÝBER, teda priesvitný lapisový tint (lock
   2026-08-26), nie plná farba; tá je vyhradená jedinému hlavnému CTA na obrazovke. */
.tl-seeall.on{${P(k.edge,A.lapis,.14)}}
.tl-empty{font-size:12px;color:${r.dim};font-style:italic;padding:8px 0 4px;}
/* #55 — prázdny stav = veta faktu + JEDNA akcia. Po zmazaní výplne (2026-08-03) je toto
   prvá obrazovka nového člena v triplíste, samotná kurzíva ho nikam nepustí. */
.tl-emptybox{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:8px 0 4px;}
/* HLAVNÉ CTA = LAPIS (brandový kánon 2026-08-28). Geometriu berie od .btn-gold (radius 8,
   nie pilulka) a mení len výplň — zmena farby nie je povolenie na iný tvar. */
.tl-emptybtn{font-family:${T};font-weight:700;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:12px 16px;border-radius:8px;border:1px solid ${k.deep};background:${k.grad};color:${k.ink};box-shadow:${q};cursor:pointer;}
.tl-emptybtn:hover{background:${k.gradHover};}

/* zdieľaný štvorcový GRID — OPEN TRIPS (MY TRIPS = horizontálny scroll .tl-hscroll) */
.tl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
@media(max-width:560px){.tl-grid{grid-template-columns:repeat(2,1fr);}}
/* MY TRIPS — horizontálny slajd */
.tl-hscroll{display:flex;gap:12px;overflow-x:auto;padding:16px 4px 12px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;}
.tl-hscroll::-webkit-scrollbar{height:6px;}
.tl-hscroll::-webkit-scrollbar-thumb{background:rgba(201,154,63,0.55);border-radius:999px;}
/* wrapper nesie flex + necháva countdown vytŕčať nad kartu (.tl-block má overflow:hidden) */
.tl-mycard{position:relative;flex:0 0 170px;scroll-snap-align:start;}
.tl-mycard .tl-block{width:100%;}
@media(max-width:560px){.tl-mycard{flex:0 0 150px;}}
/* KARTA VÝLETU — papyrus v zlatom ráme. Do 1. 9. 2026 mala tmavý .pk-glass-block (trieda je
   preč aj z JSX, overflow:hidden si nesie tento predpis sám).
   ⚠️ TIEŇ NIE JE T.cardShadow: ten má 0 14px 44px rgba(0,0,0,0.55) plus zlatý halo ring a je
   postavený pre kartu na ČIERNEJ stránke. Karta v zozname stojí NA papyrusovom paneli, kde
   z toho ostane čierny mrak — dostáva preto teplý tieň bez ringu, presne ako .trp-bigcard
   v bledom zozname mapy. */
.tl-block{cursor:pointer;overflow:hidden;background:${s.cardGrad};border:1.5px solid ${s.cardEdge};border-radius:16px;box-shadow:${E.lift};transition:border-color .15s,transform .15s,box-shadow .15s;}
/* Zameranie klávesnicou musí byť VIDNO — inak sa dá po kartách chodiť, ale nevidieť kde.
   Je to TEN ISTÝ selektor ako hover, nie druhé pravidlo: vlastný tieň by znamenal deviatu
   výšku mimo PACK_SHADOW a stráž check:pack ho ráta ako nový tvar. */
.tl-block:hover,.tl-block:focus-visible{outline:none;border-color:${r.deep};transform:translateY(-2px);box-shadow:0 0 0 3px ${ue.hairline},${E.lift};}
/* PREJDENÉ v MY TRIPS = ZELENÝ RÁM (Matej 1. 9. 2026: „prejdené v mojich výletoch zelenou").
   T.growGreen je naprieč appkou (mimo mapy) SÉMANTIKA „SPLNENÉ" — comm-unit--done,
   comm-joinbtn.joined, DogCardFields, 100 % na DOG ID a nižšie .tl-closebar v TOMTO súbore.
   Lock „zelená = tip od svorky" je o MAPOVÝCH ZNAČKÁCH (GROUP_TINT.comment), nie o kartách,
   takže sa tu sémantika nebije. */
.tl-block.is-done{border-color:${s.growGreen};}
.tl-block.is-done:hover{box-shadow:0 0 0 3px ${s.growGreenSoft},${E.lift};}
.tl-block-cover{position:relative;aspect-ratio:4/3;background-size:cover;background-position:center;background-color:rgba(201,154,63,0.14);}
/* Fotka ako <img loading=lazy>, nie background-image (audit 27. 9. 2026): pozadie sa sťahuje
   pre KAŽDÚ kartu hneď, aj mimo obrazovky — 73 prejdených výletov v origináli = 51 MB. */
.tl-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
/* Výlet bez fotky (2026-08-14). Členom nahodený trip fotku nemá takmer nikdy, takže z holého
   background-color bola v prvom rade MY TRIPS diera. Fallback je brandový: tlmený zlatý nádych
   a hand-drawn hora (ikonka ide cez ::after, nie cez background-image — ten už drží fotka a
   background-size:cover by ju roztiahol).
   2026-09-01: pôvodná výplň bola takmer čierna (#0C0903) — na papyrusovej karte z nej bola
   diera. Ten istý recept, len na piesku. */
.tl-block-cover.nophoto{background:radial-gradient(120% 90% at 50% 15%,${s.hairline},rgba(234,214,166,0.95) 72%),${s.panelGrad};}
.tl-block-cover.nophoto::after{content:'';position:absolute;left:50%;top:50%;width:36%;height:36%;transform:translate(-50%,-50%);background:url('/icons/pack/mountain.svg') no-repeat center/contain;filter:${Yt};opacity:.55;pointer-events:none;}
/* vlajka do kruhu — ľavý horný roh, vzor z /wall .card-flag */
.tl-flag{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid ${s.card};box-shadow:${E.lift};background:#1a1a1a;z-index:2;}
/* OPEN TRIPS uhne vlajku doprava — ľavý roh preberá menovka organizátora (nižšie) */
.tl-flag--r{left:auto;right:7px;}
/* ČÍ JE TENTO VÝLET — menovka organizátora NA FOTKE, OPEN TRIPS (Matej 1. 9. 2026 chcel modrý
   rám, ale modrá je mapová farba „ideš s niekým" (T.brandBlue) a triplist je zoznam k tej istej
   mape — druhý význam pre tú istú farbu na susediacich povrchoch. Namiesto novej farby preto
   karta ukáže priamo ČÍ výlet to je: existujúci avatar .tl-block-avatar + meno v tmavom
   štítku, presne ako na mape/kartách inde. Rám karty ostáva zlatý. */
.tl-block-ownertag{position:absolute;top:8px;left:8px;z-index:2;display:flex;align-items:center;gap:5px;max-width:calc(100% - 40px);padding:4px 8px 4px 4px;border-radius:999px;background:rgba(20,14,4,0.82);border:1px solid ${s.border};}
.tl-block-ownertag span{font-family:${v};font-weight:600;font-size:10px;color:#EFE6D6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* výrazný odpočet dní — VYTŔČA nad horný okraj karty (dôležitý údaj), na wrapperi .tl-mycard.
   ⚠️ Krúžok okolo pilulky je farba PODKLADU, teda papyrus karty (${s.card}) — nie T.pageBg.
   Čierny prstenec na bledej karte by vyzeral ako dier(k)a po pilulke. */
.tl-countdown{position:absolute;top:-11px;right:8px;z-index:6;font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:4px 12px;border-radius:999px;background:${de.grad};color:#1a1305;box-shadow:0 0 0 3px ${s.card},${de.glow};white-space:nowrap;pointer-events:none;}
.tl-countdown.soon{background:linear-gradient(135deg,#FF7A45,#E5502A);color:#fff;box-shadow:0 0 0 3px ${s.card},${E.lift};}
/* ⚠️ BADGE SEDÍ NA FOTKE, teda ostáva tmavý (2026-09-01). Prezliekať ho do papyrusu by
   znamenalo bledú pilulku na svetlej fotke — presne to, čo sa na obrázkoch nečíta. Sada
   nižšie sa preto pri prechode na bledý šat NEMENÍ. */
.tl-block-badge{position:absolute;right:8px;bottom:8px;font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:4px 8px;border-radius:999px;background:rgba(201,154,63,0.92);color:#1a1305;box-shadow:${E.lift};max-width:calc(100% - 16px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* Status badge v BRANDE (2026-08-14). Pôvodná sada (done=#37B26A zelená · with=#3B82F6 modrá ·
   looking=#2ED3C3 tyrkys, Matej 2026-07-23) dávala tri cudzie farby na jednu obrazovku. Stavy sa
   teraz rozlišujú v zlato-papyrusovej palete tým, čo badge znamená: výzva svieti plnou zlatou,
   uzavreté stavy sú tmavé a tiché, potvrdená účasť je papyrusová.
     looking   — otvorená výzva packu → gradient .btn-gold
     with      — partia je potvrdená → plný papyrus
     done      — uzavreté, tiché → tmavá výplň, papyrusový text
     done-open — PREJDENÉ, ALE INZERÁT STÁLE BEŽÍ → zlatý rám + zlatý text = upozornenie
     solo      — najtichší stav, bez rámu */
.tl-block-badge.done{background:rgba(20,14,4,0.9);color:#EFE6D6;border:1px solid ${s.border};}
/* done-open nesie DVE informácie naraz, takže sa do jedného riadku pilulky nezmestí a orezal by
   sa na „Hotovo · Hľadám par…". Zalomenie je tu správnejšie než skratka: nový jednoslovný kľúč by
   bolo treba preložiť do 18 jazykov a v každom by hrozilo, že sa oreže znova. */
.tl-block-badge.done-open{background:rgba(20,14,4,0.92);color:#E8B84B;border:1.5px solid ${ma};white-space:normal;line-height:1.25;border-radius:8px;text-align:center;padding:4px 8px;}
.tl-block-badge.solo{background:rgba(20,14,4,0.82);color:rgba(239,230,214,0.72);}
/* moderácia členom nahodeného výletu — pending je čakanie (tiché), rejected uzavretá vec */
.tl-block-badge.pending{background:rgba(20,14,4,0.92);color:#E8B84B;border:1px dashed ${s.cardEdge};}
.tl-block-badge.rejected{background:rgba(20,14,4,0.92);color:rgba(239,230,214,0.6);border:1px solid ${s.onDarkBorder};}
/* ⚠️ Hint UŽ NIE JE na fotke — stojí v .tl-block-info, teda na papyruse. */
.tl-block-pendhint{margin-top:3px;font-family:${v};font-size:10px;line-height:1.35;color:${r.dim};}
.tl-block-badge.with{background:#F0E6D2;color:#1a1305;border:1px solid ${s.border};}
.tl-block-badge.looking{background:${de.grad};color:#3d1f00;}
.tl-block-info{padding:8px 12px 12px;}
.tl-grade{display:flex;align-items:center;gap:8px;width:100%;margin-top:8px;padding:0;background:none;border:0;cursor:pointer;text-align:left;font-family:${v};}
.tl-grade-medal{width:24px;height:24px;border-radius:999px;display:grid;place-items:center;flex:none;font-family:${T};font-weight:700;font-size:12px;color:#fff;box-shadow:${E.lift};}
.tl-grade-medal--big{width:48px;height:48px;font-size:24px;}
.tl-grade-miss{font-size:10px;line-height:1.3;color:${r.dim};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.tl-grade:hover .tl-grade-miss{color:${r.deep};text-decoration:underline;}
.tl-grade-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;}
.tl-grade-list li{display:flex;align-items:center;gap:8px;padding:8px;border-radius:12px;font-size:14px;color:${r.ink};}
.tl-grade-list li.n{background:${s.alertRedSoft};border:1px dashed ${s.alertRed};}
.tl-grade-dot{width:16px;height:16px;border-radius:999px;flex:none;background:${s.growGreen};}
.tl-grade-list li.n .tl-grade-dot{background:transparent;border:2px solid ${s.alertRed};}
.tl-block-name{font-family:${T};font-weight:700;font-size:12px;line-height:1.25;color:${r.ink};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:30px;}
.tl-block-sub{font-size:10px;color:${r.dim};margin-top:3px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.tl-block-avatar{flex-shrink:0;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#F5C73D,#E69E1A);display:flex;align-items:center;justify-content:center;font-family:${v};font-weight:600;font-size:10px;color:${ua};}
/* krátka správa usporiadateľa — 2 riadky, celá v natívnom tooltipe (overflow:hidden na karte by orezal custom bublinu) */
.tl-block-foot{margin-top:8px;}
.tl-datebtn{font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid ${r.border};background:${r.soft};color:${r.dim};cursor:pointer;}
.tl-datebtn:hover{border-color:${s.cardEdge};color:${r.deep};background:${s.card};}
/* dátum v rámiku (open trips) */
.tl-datepill{display:inline-flex;align-items:center;gap:5px;font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.02em;padding:4px 8px;border-radius:8px;border:1px solid ${r.border};background:${r.soft};color:${r.ink};}
.tl-date{font-size:10px;color:${r.dim};}
/* OPEN TRIPS filter bar */
.tl-filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;}
.tl-filter{font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:8px 12px;border-radius:999px;border:1px solid ${r.border};background:${r.soft};color:${r.dim};cursor:pointer;transition:all .15s;}
.tl-filter:hover{border-color:${s.cardEdge};color:${r.deep};background:${s.card};}
/* VYBRANÝ FILTER = PRIESVITNÝ LAPISOVÝ TINT, nie plná farba (lock 2026-08-26). Plná plocha je
   vyhradená jedinému hlavnému CTA na obrazovke; keď ju dostane aj chip, ktorý človek práve
   klikol, obrazovka má dve „hlavné" veci a ani jedna nevedie. Čitateľnosť nesie TMAVÝ inkoust
   a plný farebný rám, nie krytie výplne. */
.tl-filter.on{${P(k.edge,A.lapis,.14)}font-weight:600;}
/* ⚠️ color-scheme:light, nie dark — natívna rozbaľovačka by inak vyskočila čierna nad
   papyrusovou stránkou. */
.tl-filter-sel{font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:8px 12px;border-radius:999px;border:1px solid ${r.border};background:${r.field};color:${r.ink};cursor:pointer;color-scheme:light;outline:0;}
.tl-filter-sep{width:1px;height:20px;background:${r.hair};margin:0 2px;}
/* OPEN TRIPS pager */
.tl-pager{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px;}
.tl-pagebtn{font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:8px 16px;border-radius:999px;border:1px solid ${r.border};background:${r.soft};color:${r.ink};cursor:pointer;transition:all .15s;}
.tl-pagebtn:hover:not(:disabled){border-color:${s.cardEdge};color:${r.deep};background:${s.card};}
.tl-pagebtn:disabled{opacity:.35;cursor:default;}
.tl-pageinfo{font-family:${v};font-weight:500;font-size:10px;letter-spacing:0.02em;color:${r.dim};}

/* VIDITEĽNOSŤ VÝLETU (#42) — badge na MY TRIPS karte je prepínač, nie nálepka */
.tl-block-badge.tap{cursor:pointer;border:0;font-family:inherit;}
.tl-block-badge.tap:hover{filter:brightness(1.08);}
.tl-vis{display:flex;flex-direction:column;gap:10px;}
/* voľba = PODBLOK (úroveň 2 matrice), vybraná = lapisový tint */
.tl-vischoice{display:flex;align-items:flex-start;gap:11px;text-align:left;padding:12px 16px;border-radius:12px;border:1px solid ${s.cardEdge};background:${s.panelGrad};box-shadow:${E.lift};cursor:pointer;transition:all .15s;}
.tl-vischoice:hover{border-color:${r.deep};background:${s.card};}
.tl-vischoice.on{${P(k.edge,A.lapis,.12)}}
.tl-vischoice-ic{flex-shrink:0;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(201,154,63,0.14);border:1px solid ${r.border};font-size:14px;}
.tl-vischoice-t{display:block;font-family:${T};font-weight:700;font-size:12px;letter-spacing:0.02em;color:${r.ink};}
.tl-vischoice-d{display:block;font-size:10px;line-height:1.45;color:${r.dim};margin-top:4px;}

/* Po prijatí žiadosti — ponuka stiahnuť inzerát (#42, „na rande nechceš tretiu osobu").
   Zelená = hotové; na papyruse ide ako tint s tmavým inkoustom, nie ako svetlý text. */
.tl-closebar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;padding:12px 16px;border-radius:12px;${P(s.growGreen,A.green,.14)}}
.tl-closebar-t{flex:1;min-width:180px;font-size:12px;line-height:1.45;color:${A.green};}
.tl-closebar-t b{font-family:${T};font-weight:700;}

/* REQUESTS TO JOIN — schránka organizátora (#41). Riadok = karta člena (.pmc) + dve akcie. */
.tl-req{display:flex;align-items:center;gap:10px;}
.tl-req + .tl-req{margin-top:8px;}
.tl-req-member{flex:1;min-width:0;}
.tl-req-member .pmc{margin-top:0;}
.tl-req-acts{display:flex;gap:6px;flex-shrink:0;}
.tl-reqbtn{font-family:${v};font-weight:600;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;padding:8px 12px;border-radius:12px;border:1px solid ${r.border};background:${r.soft};color:${r.dim};cursor:pointer;transition:all .15s;}
.tl-reqbtn:disabled{opacity:.4;cursor:default;}
/* Zelená áno / červená nie ostávajú — nesú význam. Na papyruse len tmavnú do inkoustu:
   svetlé #5FD98C a #FF8A66 boli robené na čiernu dosku a na piesku zaniknú. */
.tl-reqbtn.yes:not(:disabled):hover{${P(s.growGreen,A.green,.16)}}
.tl-reqbtn.no:not(:disabled):hover{${P(s.alertRed,A.red,.16)}}
@media(max-width:560px){.tl-req{flex-wrap:wrap;}.tl-req-acts{width:100%;}.tl-reqbtn{flex:1;}}

/* JOIN na karte cudzieho otvoreného výletu (#41) — hlavná akcia karty, teda LAPIS.
   Geometria (radius 8) ostáva z locku .btn-gold, mení sa iba výplň. */
.tl-join{width:100%;margin-top:8px;font-family:${T};font-weight:700;font-size:10px;letter-spacing:0.02em;text-transform:uppercase;padding:8px 8px;border-radius:8px;background:${k.grad};color:${k.ink};border:1px solid ${k.deep};box-shadow:${q};cursor:pointer;transition:background .15s;}
.tl-join:hover:not(:disabled){background:${k.gradHover};}
.tl-join:disabled{cursor:default;}
/* prijatý = STAV, nie výzva ⇒ zelený tint bez tieňa CTA */
.tl-join.done{${P(s.growGreen,A.green,.18)}box-shadow:none;}
.tl-join.pending{background:${r.soft};border-color:${r.border};color:${r.dim};box-shadow:none;}
/* #70 — DOG ID pod 100 % = ČERVENÁ (lock 12. 9. 2026, T.alertRed = #B25640), tá istá farba,
   akú nesie percento na dlaždici psa. Tlačidlo ostáva VIDITEĽNÉ, len neaktívne — vysvetlenie
   stojí v .tl-joinerr pod ním (žiadna nová trieda, žiadna nová hodnota mimo matríc). */
.tl-join.locked{${P(s.alertRed,A.red,.18)}box-shadow:none;cursor:default;}
.tl-joinerr{font-size:10px;color:${A.red};margin-top:5px;line-height:1.35;}

/* Add date popup — plávajúci PANEL (úroveň 4 matrice PACK_BOX.panel) nad tmavým závojom.
   ⚠️ BEZ KRÍŽIKA (lock 2026-08-28, Matej: „nedávajme tie krížiky na bloky") — von sa ide
   klikom mimo (overlay) alebo klávesom Esc. Trieda .tl-x preto zanikla aj z JSX. */
/* ZÁVOJ = recept .pk-veil--modal (VEIL_CSS) — tu len poloha nad spodným navom a odsadenie. */
.tl-overlay{z-index:1200;padding:16px;}
.tl-modal{width:100%;max-width:360px;background:${s.panelGrad};border:1.5px solid ${s.cardEdge};border-radius:14px;box-shadow:${s.panelShadow};padding:24px;}
.tl-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.tl-modal-title{font-family:${T};font-weight:700;font-size:16px;color:${r.ink};}
/* pole = .pf-field--flat recept: plochá papyrusová výplň, jeden zlatý rám, tmavý inkoust.
   color-scheme:light kvôli natívnemu kalendáru — v dark by vyskočil čierny. */
.tl-dateinput{width:100%;background:${r.field};border:1px solid ${r.border};border-radius:8px;padding:12px 12px;color:${r.ink};font-family:inherit;font-size:16px;outline:0;color-scheme:light;}
.tl-dateinput:focus{border-color:${k.edge};box-shadow:0 0 0 3px ${k.halo};}
.tl-modal-submit{width:100%;margin-top:16px;font-family:${T};font-weight:700;font-size:12px;letter-spacing:0.02em;text-transform:uppercase;padding:12px;border-radius:8px;background:${k.grad};color:${k.ink};border:1px solid ${k.deep};box-shadow:${q};cursor:pointer;}
.tl-modal-submit:hover:not(:disabled){background:${k.gradHover};}
.tl-modal-submit:disabled{opacity:.4;cursor:default;}
`;function ha(o,h,n,d,p){if(p==="pending")return o("pack.trip.pending");if(p==="rejected")return o("pack.triplist.statusRejected");if(n)return h.status==="looking"&&C,o("pack.triplist.statusDone");const g=(d==null?void 0:d.joiners)??[];if(g.length===1)return o("pack.triplist.statusWithName",{name:g[0].ownerFirst??o("pack.triplist.fallbackDogyptianLower")});if(g.length>1)return o("pack.triplist.statusWithCount",{n:g.length});if(h.status==="going")return o("pack.triplist.statusGoing");if(h.status==="looking"){const m=(d==null?void 0:d.requests.length)??0;return m?o("pack.triplist.statusLookingAsked",{n:m}):o("pack.triplist.statusLookingForPack")}return o("pack.triplist.statusSolo")}function ka(o,h,n,d){return d==="pending"?"pending":d==="rejected"?"rejected":h?o.status==="looking"&&C?"done-open":"done":((n==null?void 0:n.joiners.length)??0)>0||o.status==="going"?"with":o.status==="looking"?"looking":"solo"}function M(o,h){if(!o)return null;const n=new Date(o+"T00:00:00").getTime();return Number.isNaN(n)?null:Math.round((n-h)/ga)}function xa(o,h,n={}){const d=p=>{if(p.done)return 2;const g=M(p.entry.date,h);return g!==null&&g>=0?0:1};return[...o].sort((p,g)=>{const m=d(p),x=d(g);if(m!==x)return m-x;const f=M(p.entry.date,h),$=M(g.entry.date,h);if(m===0)return(f??9e9)-($??9e9);if(m===2){const w=n[p.entry.tripId]??1/0,N=n[g.entry.tripId]??1/0;return w!==N?N>w?1:-1:($??-9e9)-(f??-9e9)}return g.entry.addedAt-p.entry.addedAt})}const Ye={A:"linear-gradient(180deg,#4F9463,#2E5E3B)",B:"linear-gradient(135deg,#C99A3F 0%,#A3782B 100%)",C:"linear-gradient(180deg,#C46A52,#8E3F2C)"},fa=new Set([...ge,...H].map(o=>o.id));function To(){var Ae,Ie;const o=ct(),{lang:h}=mt(),n=Dt(),d=_t(),p=n?Lt:Pt(),g=()=>n?new Set(J.walked):Le(),m=Vt(),x=i.useMemo(()=>[...n?Kt:[],...Jt(_e(),{withMissedPlans:!0}),...ge,...H],[m,n]);i.useMemo(()=>!n&&Ht([...H.map(e=>e.id),...Ut.filter(e=>[...ge,...H].some(a=>a.id===e))]),[]);const f=i.useMemo(()=>Date.now(),[]),[$,w]=ut(),N=$.get("tab")==="stats"?"stats":"list",S=e=>{e!==N&&w(e==="stats"?{tab:"stats"}:{})},Y=i.useMemo(()=>{const e=g();return x.filter(a=>e.has(a.id))},[x,m]),Ze=i.useMemo(()=>Y.reduce((e,a)=>e+(Number(a.km)||0),0),[Y]),[Z,V]=i.useState(()=>n?Object.fromEntries([...J.walked.map((e,a)=>[e,{tripId:e,status:"solo",openness:"closed",joiners:[],requests:[],addedAt:a}]),...J.want.map((e,a)=>[e.tripId,{tripId:e.tripId,status:e.status,openness:e.status==="looking"?"open":"closed",joiners:[],requests:[],addedAt:1e3+a}])]):me());i.useEffect(()=>{m&&!n&&V(me())},[m]),i.useEffect(()=>{if(n)return;let e=ia(oa());const a=Be(),l=_e().filter(u=>{var y;return u.id.startsWith("local-")&&(((y=a[u.id])==null?void 0:y.mine)??!0)}).map(u=>u.id),c=Le(),b=x.filter(u=>c.has(u.id)).map(u=>u.id);sa([...l,...b])&&(e=!0),e&&V(me())},[m,x]);const[O,X]=i.useState(null),[be,Xe]=i.useState(""),[Q,va]=i.useState("all"),[he,ya]=i.useState(0),F=9,ke=i.useMemo(()=>g(),[x,m]),{notes:xe,loading:Qe}=wt(!0),[B,ee]=i.useState(null),fe=i.useMemo(()=>Be(),[m]),et=gt((Ie=(Ae=p.session)==null?void 0:Ae.user)==null?void 0:Ie.email),tt=i.useMemo(()=>new Set(Xt()),[m]),at=e=>{var a;return n?e.startsWith("local-"):e.startsWith("local-")?((a=fe[e])==null?void 0:a.mine)??!0:tt.has(e)?!0:et&&fa.has(e)},G=i.useMemo(()=>Object.values(Z).map(e=>({entry:e,trail:x.find(a=>a.id===e.tripId)})).filter(e=>!!e.trail).map(e=>({...e,done:ke.has(e.entry.tripId)})).sort((e,a)=>a.entry.addedAt-e.entry.addedAt),[Z,x,ke]),R=i.useMemo(()=>xa(G,f,n?{}:Qt()),[G,f,m]),D=i.useMemo(()=>R.filter(e=>!e.done),[R]),W=i.useMemo(()=>R.filter(e=>e.done),[R]),[_,ja]=i.useState(0),[wa,$a]=i.useState(null),[Na,za]=i.useState({}),ve=Wt(),te=i.useMemo(()=>p.dogs.filter(e=>ve.isOwner(e.id)&&(e.life_status??"alive")!=="deceased"),[p.dogs,ve]);!p.loading&&te.length;const[Ta,ye]=i.useState(null),[Ea,je]=i.useState(null),ae=i.useMemo(()=>te.map(e=>e.id).join(","),[te]);i.useEffect(()=>{const e=ae?ae.split(","):[];if(e.length===0){ye(null),je(null);return}let a=!0;const l=()=>{Bt(e).then(b=>{if(!a)return;const u=Me.length;let y=0,j=e[0];for(const K of e){const I=b[K]??{},dt=Me.filter(pt=>Gt(I[pt.field])).length,Se=u?Math.round(dt/u*100):0;Se>y&&(y=Se,j=K)}ye(y),je(j)})};l();const c=Ft(l);return()=>{a=!1,c()}},[ae]);const[z,oe]=i.useState(null),[Aa,Ia]=i.useState(()=>Ge(ce.openTripsCollapsed,!1)),[re,ot]=i.useState(()=>Ge(ce.myWalkedCollapsed,!1)),rt=()=>{ot(e=>{const a=!e;return ea(ce.myWalkedCollapsed,a),a})};i.useEffect(()=>{if(!O&&!z&&!B)return;const e=a=>{a.key==="Escape"&&(X(null),oe(null),ee(null))};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)},[O,z,B]);const[ie,se]=i.useState(null);i.useEffect(()=>{if(n){se(J.wishes.map(a=>({...a,trailId:null,whenYear:null,status:"live",expiresAt:null,postponed:0,createdAt:"",others:0})));return}let e=!0;return la().then(a=>{e&&se(a.filter(l=>l.status==="live"||l.status==="missed"))}).catch(()=>{e&&se([])}),()=>{e=!1}},[m]);const it=()=>{if(n){n.lock("wish");return}d(Rt("/pack/map","/pack/map/triplist")),Mt({id:"wish"})},[Sa,st]=i.useState(null),we=ca(_);pa(_);const nt=i.useMemo(()=>{const e=new Set(G.filter(a=>!a.done).map(a=>a.entry.tripId));return Object.keys(we.bySlug).forEach(a=>e.add(a)),[...e]},[G,we.bySlug]),L=$t(nt,_),{trips:$e}=Nt(_,C),Ne=zt([],_);i.useMemo(()=>{const e=R.find(a=>!a.done&&(M(a.entry.date,f)??-1)>=0);return e?M(e.entry.date,f):null},[R,f]);const ne=i.useMemo(()=>$e.flatMap(e=>{const a=x.find(u=>u.id===e.slug);if(!a)return[];const l=Ne[Ce(e.slug,e.organizerId)],c=l==null?void 0:l.organizer,b=[c==null?void 0:c.ownerFirst,c==null?void 0:c.dogName].filter(Boolean).join(" & ");return[{key:Ce(e.slug,e.organizerId),trail:a,date:e.date??"",joiners:(l==null?void 0:l.joiners.length)??0,ownerName:b||o("pack.triplist.fallbackDogyptian"),ownerInitial:((c==null?void 0:c.ownerFirst)??(c==null?void 0:c.dogName)??"?").charAt(0).toUpperCase(),real:{slug:e.slug,organizerId:e.organizerId}}]}),[$e,Ne,x,o]),ze=i.useMemo(()=>Q==="all"?ne:ne.filter(e=>na(e.trail)===Q),[ne,Q]);Math.max(1,Math.ceil(ze.length/F)),ze.slice(he*F,he*F+F);const lt=()=>{if(n){n.lock("want");return}if(!O)return;const e=We(O,{date:be||void 0});V(a=>({...a,[O]:e})),X(null)},Te=(e,a)=>{var u;if(n){n.lock("want");return}const l=(((u=L[e])==null?void 0:u.joiners.length)??0)>0,b=We(e,a?{status:"looking",openness:"open"}:{status:l?"going":"solo",openness:"closed"});V(y=>({...y,[e]:b})),a||ta(e),oe(null),st(null)};if(p.loading)return t.jsxs("div",{className:"pk-paper flex items-center justify-center",style:{minHeight:"100dvh"},children:[t.jsx("style",{children:Pe}),t.jsx("div",{className:"relative",style:{zIndex:1},children:t.jsx("div",{style:{fontFamily:"'Cinzel', serif",letterSpacing:"0.26em",fontSize:12,color:s.inkWarm},children:o("pack.layout.loading")})})]});if(!p.session&&!n)return null;const Ee=({entry:e,trail:a,done:l,placeholder:c})=>{var K;l||M(e.date,f);const b=a.photos[0]??(c?"":aa(a.acts,a.id)),u=(K=fe[e.tripId])==null?void 0:K.status,y=l||!!u,j=l&&!c&&!Qe&&at(e.tripId)?Oe(a,xe):null;return t.jsxs("div",{className:"tl-mycard",children:[C,t.jsxs("div",{className:`tl-block${l?" is-done":""}`,role:"button",tabIndex:0,onClick:()=>d(pe(a)),onKeyDown:I=>{I.key!=="Enter"&&I.key!==" "||(I.preventDefault(),d(pe(a)))},children:[t.jsxs("div",{className:`tl-block-cover${b?"":" nophoto"}`,children:[b&&t.jsx("img",{className:"tl-cover-img",src:qe(b,Ue),alt:"",loading:"lazy",decoding:"async",draggable:!1,style:{objectPosition:Ve(a??{})}}),t.jsx("img",{className:"tl-flag",src:He(ra(a)),alt:"",loading:"lazy",draggable:!1}),y?t.jsx("span",{className:`tl-block-badge ${ka(e,l,L[e.tripId],u)}`,children:ha(o,e,l,L[e.tripId],u)}):null]}),t.jsxs("div",{className:"tl-block-info",children:[t.jsx("div",{className:"tl-block-name",children:Fe(a,h)}),u==="pending"&&t.jsx("div",{className:"tl-block-pendhint",children:o("pack.triplist.pendingHint")}),j&&t.jsxs("button",{type:"button",className:"tl-grade","aria-label":o("pack.addTrip.grade.aria",{grade:j.grade}),onClick:I=>{I.stopPropagation(),ee(e.tripId)},children:[t.jsx("span",{className:"tl-grade-medal",style:{background:Ye[j.grade]},children:j.grade}),j.grade!=="A"&&t.jsx("span",{className:"tl-grade-miss",children:o("pack.triplist.grade.toA",{list:j.missing.map(I=>o(`pack.addTrip.grade.point.${I}`).toLowerCase()).join(" · ")})})]}),C]})]})]},e.tripId)};return t.jsxs("div",{className:"pk-paper tl-root",children:[t.jsxs("style",{children:[Pe,bt]}),t.jsxs("style",{children:[ht,kt]}),t.jsx("style",{children:Tt}),t.jsx("style",{children:Et}),t.jsx("style",{children:ba}),t.jsxs("div",{className:"tl-body",children:[t.jsx(qt,{onBack:()=>d("/pack/map"),backLabel:o("pack.triplist.backToMap")}),t.jsxs("div",{className:"tl-tabs",children:[t.jsx("button",{type:"button",className:`tl-tab${N==="stats"?" on":""}`,onClick:()=>S("stats"),children:t.jsxs("span",{className:"tl-tab-label",children:[t.jsx("span",{className:"tl-tab-ic",style:{"--ic":`url(${Ke("trophy")})`}}),o("pack.triplist.tabTripstats")]})}),t.jsx("button",{type:"button",className:`tl-tab${N==="list"?" on":""}`,onClick:()=>S("list"),children:t.jsxs("span",{className:"tl-tab-label",children:[t.jsx("span",{className:"tl-tab-ic",style:{"--ic":`url(${Ke("clipboard")})`}}),o("pack.triplist.tabTriplist")]})})]}),N==="stats"?t.jsx(At,{walkedTrails:Y,walkedKm:Ze,onOpenTrip:e=>d(Zt(e,x)),onAddTrip:e=>d("/pack/add/trip"+(e?`?region=${encodeURIComponent(e)}`:""))}):t.jsxs("div",{className:"tl-panel",children:[C,C,t.jsxs("div",{className:"tl-section",id:Je.tlWant,children:[t.jsxs("div",{className:"tl-sechead",children:[t.jsxs("h3",{children:[o("pack.triplist.myTripsWant"),t.jsx(Re,{k:"want"})]}),D.length>0&&t.jsxs("span",{className:"tl-sechint",children:[o(`pack.triplist.myTripsCount${De(D.length)}`,{n:D.length}),t.jsx("i",{children:` · ${o("pack.triplist.myTripsOrderHint")}`})]})]}),D.length===0?t.jsx("div",{className:"tl-emptybox",children:t.jsxs(t.Fragment,{children:[t.jsx("span",{className:"tl-empty",children:o("pack.triplist.emptyWant")}),t.jsx("button",{type:"button",className:"tl-emptybtn",onClick:()=>d("/pack/map"),children:o("pack.triplist.browseTrips")})]})}):t.jsx("div",{className:"tl-hscroll",children:D.map(Ee)})]}),ie&&t.jsxs("div",{className:"tl-section",id:Je.tlWish,children:[t.jsxs("div",{className:"tl-sechead",children:[t.jsxs("h3",{children:["TRIPWISH",t.jsx(Re,{k:"wish"})]}),t.jsxs("button",{type:"button",className:"tl-seeall pk-hit",onClick:it,children:["+ ",o("pack.triplist.wishAdd")]})]}),ie.length===0?t.jsx("div",{className:"tl-emptybox",children:t.jsx("span",{className:"tl-empty",children:o("pack.triplist.wishEmpty")})}):t.jsx("div",{className:"tl-hscroll",children:ie.map(e=>{const a=e.trailId?x.find(b=>b.id===e.trailId):void 0,l=(a==null?void 0:a.photos[0])??"",c=()=>n?n.lock("wish"):d(`/pack/map?wish=${e.id}&ask=${e.status==="missed"?"wish_missed":"wish_ask"}`);return t.jsx("div",{className:"tl-mycard",children:t.jsxs("div",{className:"tl-block",role:"button",tabIndex:0,onClick:c,onKeyDown:b=>{b.key!=="Enter"&&b.key!==" "||(b.preventDefault(),c())},children:[t.jsxs("div",{className:`tl-block-cover${l?"":" nophoto"}`,children:[l&&t.jsx("img",{className:"tl-cover-img",src:qe(l,Ue),alt:"",loading:"lazy",decoding:"async",draggable:!1,style:{objectPosition:Ve(a??{})}}),e.countryCode&&t.jsx("img",{className:"tl-flag",src:He(e.countryCode),alt:"",loading:"lazy",draggable:!1}),t.jsx("span",{className:`tl-block-badge ${e.status==="missed"?"rejected":"looking"}`,children:e.status==="missed"?o("pack.triplist.wishMissed"):o(`pack.wish.when.${e.when}`)})]}),t.jsxs("div",{className:"tl-block-info",children:[t.jsx("div",{className:"tl-block-name",children:e.placeName}),e.others>0&&t.jsx("div",{className:"tl-block-pendhint",children:o("pack.wish.crowd",{n:e.others+1})})]})]})},e.id)})})]}),W.length>0&&t.jsxs("div",{className:"tl-section",children:[t.jsxs("div",{className:"tl-sechead",children:[t.jsx("h3",{children:o("pack.triplist.myTripsWalked")}),t.jsx("span",{className:"tl-sechint",children:o(`pack.triplist.myTripsCount${De(W.length)}`,{n:W.length})}),t.jsx("button",{type:"button",className:`tl-seeall pk-hit${re?" on":""}`,onClick:rt,children:o(re?"pack.triplist.showOpenTrips":"pack.triplist.hideOpenTrips")})]}),re?t.jsx("div",{className:"tl-empty",children:o("pack.triplist.walkedHiddenHint")}):t.jsx("div",{className:"tl-hscroll",children:W.map(Ee)})]}),C]})]}),O&&t.jsx("div",{className:"pk-veil pk-veil--modal tl-overlay",onClick:()=>X(null),children:t.jsxs("div",{className:"tl-modal",onClick:e=>e.stopPropagation(),children:[t.jsx("div",{className:"tl-modal-head",children:t.jsx("div",{className:"tl-modal-title",children:o("pack.triplist.setDate")})}),t.jsx("input",{type:"date",className:"tl-dateinput",value:be,onChange:e=>Xe(e.target.value)}),t.jsx("button",{type:"button",className:"tl-modal-submit",onClick:lt,children:o("pack.triplist.saveDate")})]})}),B&&(()=>{const e=x.find(l=>l.id===B);if(!e)return null;const a=Oe(e,xe);return t.jsx("div",{className:"pk-veil pk-veil--modal tl-overlay",onClick:()=>ee(null),children:t.jsxs("div",{className:"tl-modal",onClick:l=>l.stopPropagation(),children:[t.jsxs("div",{className:"tl-modal-head",children:[t.jsx("span",{className:"tl-grade-medal tl-grade-medal--big",style:{background:Ye[a.grade]},children:a.grade}),t.jsxs("div",{style:{flex:1,minWidth:0},children:[t.jsxs("div",{className:"tl-modal-title",children:[o("pack.triplist.grade.sheetTitle")," · ",a.score," / ",It]}),t.jsx("div",{className:"tl-sub",style:{textAlign:"left",marginTop:4},children:Fe(e,h)})]})]}),t.jsx("ul",{className:"tl-grade-list",children:St.map(l=>t.jsxs("li",{className:a.missing.includes(l)?"n":"y",children:[t.jsx("span",{className:"tl-grade-dot","aria-hidden":"true"}),t.jsx("span",{children:o(`pack.addTrip.grade.point.${l}`)})]},l))}),t.jsx("div",{className:"tl-sub",style:{textAlign:"left",marginTop:12},children:o("pack.triplist.grade.private")}),a.grade!=="A"&&t.jsx("button",{type:"button",className:"tl-modal-submit",onClick:()=>d(`${pe(e)}?edit=1`),children:o("pack.triplist.grade.edit")})]})})})(),z&&(()=>{var u,y;const e=Z[z],a=(e==null?void 0:e.openness)==="open",l=x.find(j=>j.id===z),c=((u=L[z])==null?void 0:u.joiners.length)??0,b=((y=L[z])==null?void 0:y.requests.length)??0;return t.jsx("div",{className:"pk-veil pk-veil--modal tl-overlay",onClick:()=>oe(null),children:t.jsxs("div",{className:"tl-modal",onClick:j=>j.stopPropagation(),children:[t.jsx("div",{className:"tl-modal-head",children:t.jsxs("div",{children:[t.jsx("div",{className:"tl-modal-title",children:o("pack.triplist.whoCanSee")}),t.jsx("div",{className:"tl-sub",style:{textAlign:"left",marginTop:4},children:(l==null?void 0:l.name)??z})]})}),t.jsxs("div",{className:"tl-vis",children:[t.jsxs("button",{type:"button",className:`tl-vischoice${a?"":" on"}`,onClick:()=>Te(z,!1),children:[t.jsx("span",{className:"tl-vischoice-ic",children:"🔒"}),t.jsxs("span",{children:[t.jsx("span",{className:"tl-vischoice-t",children:o("pack.triplist.private")}),t.jsx("span",{className:"tl-vischoice-d",children:c>0?o("pack.triplist.privateDescWithParty"):o("pack.triplist.privateDescSolo")})]})]}),t.jsxs("button",{type:"button",className:`tl-vischoice${a?" on":""}`,onClick:()=>Te(z,!0),children:[t.jsx("span",{className:"tl-vischoice-ic",children:"🐾"}),t.jsxs("span",{children:[t.jsx("span",{className:"tl-vischoice-t",children:o("pack.triplist.statusLookingForPack")}),t.jsx("span",{className:"tl-vischoice-d",children:e!=null&&e.date?o("pack.triplist.openDescWithDate",{date:e.date}):o("pack.triplist.openDescNoDate")})]})]})]}),b>0&&!a&&t.jsx("div",{className:"tl-sub",style:{textAlign:"left",marginTop:12},children:b===1?o("pack.triplist.pendingRequestsOne",{n:b}):o("pack.triplist.pendingRequestsMany",{n:b})})]})})})(),!n&&t.jsx(Ct,{avatarUrl:p.avatarUrl,avatarInitial:p.avatarInitial,dogs:p.dogs}),t.jsx(Ot,{})]})}export{To as default};
