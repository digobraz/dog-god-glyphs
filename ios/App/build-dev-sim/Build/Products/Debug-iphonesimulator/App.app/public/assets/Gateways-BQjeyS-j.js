import{u as r,j as e,b as n,O as a,a0 as t,a1 as s,e as d,i as l}from"./index-DriUOdZL.js";import{m as p}from"./constitutionRead-C-bnV4U2.js";const i=n,g=`
/* 1 blok = 1 riadok na mobile, dva stĺpce až od 721 px. */
.gw-row{ display:grid; grid-template-columns:1fr; gap:12px; }
@media (min-width:721px){ .gw-row{ grid-template-columns:1fr 1fr; gap:20px; } }

.gw{
  position:relative; overflow:hidden; display:flex; align-items:center;
  /* Mierka nadpisu je SIRKA TEJTO KARTY (cqw nizsie), nie okna - viac pri .gw-title. */
  container-type:inline-size;
  min-height:172px; border-radius:16px; padding:16px 24px;
  background:${i.cardGrad}; border:1.5px solid ${i.cardEdge}; box-shadow:${i.cardShadow};
  text-decoration:none; cursor:pointer; font:inherit; color:inherit; text-align:left;
  width:100%;
}
@media (min-width:721px){ .gw{ min-height:220px; padding:24px 32px; } }

/* Obrázok je PRVOK KARTY, nie ikonka v rámčeku — presahuje hranu, aby karta pôsobila ako
   výrez do niečoho väčšieho. */
/* ⚠️ z-index 0 = POD závojom (::before). Pri DOGME je to zámer: závoj rozpúšťa pravú hranu
   obálky do papyrusu, inak by kniha končila tvrdým zvislým rezom. AINUBIS má opačné
   zadanie (hlava nad všetkým) a prepíše si to nižšie. */
.gw-art{
  position:absolute; top:50%; transform:translateY(-50%); z-index:0;
  display:flex; align-items:center; justify-content:center;
  pointer-events:none; transition:transform .35s ease;
}
.gw-art img{ display:block; width:100%; height:auto; }
.gw:hover .gw-art{ transform:translateY(-50%) scale(1.05); }
@media (prefers-reduced-motion: reduce){ .gw:hover .gw-art{ transform:translateY(-50%); } }

/* ── DOGMA ─────────────────────────────────────────────────────────────────────
   ⚠️ Miera je zo ŠÍRKY karty, nie z výšky: pri výške sa obrázok pri úzkom okne rozšíril
   pod text (karta ostáva vysoká, ale úzka) a nadpis začínal na knihe. Zo šírky sa obrázok
   a textový stĺpec nikdy neprekryjú.

   Kniha je ZÁMERNE väčšia než karta a padá cez jej DOLNÚ hranu (Matej 9.8.: „knihu zväčši ju
   ešte viac — zachovaj aby bol viditeľný nápis DOGMA ale kľudne ju posuň tak že logo bude
   takmer na spodnom okraji alebo aj cez okraj").
   ⚠️ Posun je translateY v % VLASTNEJ výšky obrázka, nie top/bottom v % karty. Percento v
   transforme sa počíta z vlastného boxu, takže -11 % vždy postaví hornú hranu obálky tesne
   nad nápis DOGMA (ten začína na ~14,5 % výšky obálky) — nezávisle od toho, aká vysoká je
   karta. Pri offsete viazanom na VÝŠKU karty (bottom:-30%) sa nápis pri inej šírke stratil,
   lebo veľkosť knihy ide zo ŠÍRKY. */
.gw-dogma .gw-art{ left:-9%; width:42%; top:0; bottom:auto; transform:translateY(-11%); }
@media (min-width:721px){ .gw-dogma .gw-art{ left:-14%; width:60%; } }
/* ⚠️ Kniha a textový stĺpec sa NESMÚ prekryť a ich šírky sa počítajú z RÔZNYCH boxov:
   obrázok je absolútny (percentá z padding boxu, teda skoro celá karta), text je flex
   položka (percentá z CONTENT boxu, teda karta bez paddingu). Na PC preto 60 % knihy +
   56 % textu vychádzalo na −4 px prekryv a písmeno „s" v „spoznaj" zmizlo pod obálkou.
   Text má na PC vlastnú, užšiu šírku — nie je to preklep. */
.gw-dogma .gw-art img{ filter:drop-shadow(0 18px 38px rgba(10,10,10,0.45)); }
.gw-dogma:hover .gw-art{ transform:translateY(-11%) scale(1.03); }
@media (prefers-reduced-motion: reduce){ .gw-dogma:hover .gw-art{ transform:translateY(-11%); } }

/* Doska z ústavy ako slabá textúra pozadia (Matej: „do pozadia môžu byť slabo viditeľné tie
   obrázky čo sú v dogme"). Zdroj = explainers/01-2-god-is-dog z embedu ústavy, zmenšený.
   Sedí POD knihou aj textom, preto nízka krytie + papyrusový závoj nad ňou. */
.gw-plate{
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:url('/images/dogma-plate.webp');
  background-size:cover; background-position:64% 42%;
  opacity:0.30; mix-blend-mode:multiply;
}

/* ── AINUBIS = VLASTNÝ BRAND, nie papyrus (Matej 9.8.: „musí byť v jeho brande, modro
   zlatá, AI vibe… farebne odlíšiteľné"). Tmavá modrá karta so zlatým rámom a cyan svetlom;
   papyrusový dvojník vedľa (DOGMA) tak ostáva rozoznateľný na prvý pohľad.
   Cyan = cyborg paleta AINUBISA, vedomá odchýlka od brand v3.2
   (reference_dogypt_ainubis_cyborg_palette). Čísla NEPÍŠ — zdroj je ainubisSkin.ts
   (zjednotené 13. 9. 2026), krytie sa skladá z AINUBIS.cyanRGB. */
.gw-ainubis{
  /* ŠEDÝ FADE = „ešte nefunkčné" (Matej 12.8.: „len tam daj taký šedý fade ako keby
     nefunkčné ešte"). Karta klikom OTVÁRA chat, takže sa nesmie zamknúť ani stlmiť na
     nulu — spí, ale zobudí sa: pri hoveri/fokuse sa farba vráti. Rovnaký odkaz nesie
     cyan čip „plná verzia čoskoro" v tele karty.
     ⚠️ FILTER NIE JE NA KARTE (zmena 13.8.2026). Bol, a strhával so sebou aj čip
     „plná verzia čoskoro" — Matej: „chcem aby bol v plnej farbe ako pri hovery".
     Prerátať ho späť cez saturate() nestačí, grayscale je stratový a čip ostal bledý.
     Preto fade sedí na KONKRÉTNYCH deťoch (hlava, mriežka, nadpis, popis) a čip nie je
     medzi nimi. Keď sem niekto vráti filter na .gw-ainubis, čip zase zhasne. */
  transition:filter .4s ease;
  /* Pozadie = to isté, čo panel widgetu (AinubisWidget.css .ainubis-panel), plus dúhový
     nádych — AINUBIS je stroj, nie chrámový povrch. */
  background:
    /* Tlmiaca vrstva spiacej karty — nahrádza to, čo predtým robil grayscale na celej karte.
       Je to POZADIE, takže na deti (a teda ani na čip) nesiaha. Pri hoveri mizne. */
    linear-gradient(rgba(16,20,26,0.52), rgba(16,20,26,0.52)),
    linear-gradient(118deg, rgba(${a.cyanRGB},0.10) 0%, rgba(126,90,240,0.08) 42%, rgba(${a.ctaRGB},0.05) 100%),
    radial-gradient(78% 105% at 76% 54%, rgba(70,168,255,0.52) 0%, rgba(${a.glowRGB},0.12) 52%, rgba(${a.glowRGB},0) 74%),
    linear-gradient(160deg, #08131f 0%, #04090f 62%, #061119 100%);
  transition:filter .4s ease, background .4s ease;
  border:1.5px solid rgba(${a.cyanRGB},0.34);
  box-shadow:0 26px 60px -30px rgba(0,0,0,0.95), inset 0 1px 0 rgba(${a.cyanRGB},0.20);
}
/* Fade nesú deti, nie karta — zoznam je úplný a ZÁMERNE bez .gw-flag. */
/* ⚠️ Na hlavu ide filter cez IMG, nie cez .gw-art — ten span má o 35 riadkov nižšie
   vlastný filter:drop-shadow(). Rovnaká špecificita + neskoršie poradie = moja hodnota
   by sa ticho prepísala a hlava by sa prestala odšedievať (overené v prehliadači:
   computed filter na .gw-art vrátil len drop-shadow). */
.gw-ainubis .gw-art img,
.gw-ainubis .gw-title,
.gw-ainubis .gw-lead,
.gw-ainubis::after{
  filter:grayscale(0.78) brightness(0.86);
  transition:filter .4s ease;
}
.gw-ainubis:hover .gw-art img, .gw-ainubis:focus-visible .gw-art img,
.gw-ainubis:hover .gw-title, .gw-ainubis:focus-visible .gw-title,
.gw-ainubis:hover .gw-lead, .gw-ainubis:focus-visible .gw-lead,
.gw-ainubis:hover::after, .gw-ainubis:focus-visible::after{ filter:none; }
.gw-ainubis:hover, .gw-ainubis:focus-visible{
  background:
    linear-gradient(118deg, rgba(${a.cyanRGB},0.10) 0%, rgba(126,90,240,0.08) 42%, rgba(${a.ctaRGB},0.05) 100%),
    radial-gradient(78% 105% at 76% 54%, rgba(70,168,255,0.52) 0%, rgba(${a.glowRGB},0.12) 52%, rgba(${a.glowRGB},0) 74%),
    linear-gradient(160deg, #08131f 0%, #04090f 62%, #061119 100%);
}
/* ⚠️ Dotykové zariadenia hover nemajú — tam karta ostáva šedá natrvalo. To je v poriadku:
   šedá je stav („zatiaľ nehotové"), nie odmena za hover. */

/* Holografická mriežka (Matej 9.8.: „pozadie ainubisa urob atraktívnejšie, holografická
   mriežka"). Dva 1px rastre + maska, ktorá ich rozpustí do rohov — mriežka cez celú plochu
   pôsobí ako tabuľka, nie ako projekcia. ::before je obsadené závojom, preto ::after.
   ⚠️ Mriežka je POZADIE: z-index 1, teda pod hlavou (z-index 2). Aby neliezla do kresby,
   musí byť hlava NEPRIEHĽADNÁ — viď poznámku pri .gw-ainubis .gw-art. */
.gw-ainubis::after{
  content:''; position:absolute; inset:0; z-index:1; pointer-events:none;
  background-image:
    linear-gradient(rgba(${a.cyanRGB},0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(${a.cyanRGB},0.16) 1px, transparent 1px);
  background-size:28px 28px, 28px 28px;
  -webkit-mask-image:radial-gradient(115% 95% at 72% 26%, #000 0%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0) 84%);
  mask-image:radial-gradient(115% 95% at 72% 26%, #000 0%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0) 84%);
}
/* Hlava je VEĽKÁ a orezaná hranou karty — vidno z nej asi polovicu (Matej: „väčšia ikonka,
   viditeľná len polovica hlavy AI(NUBIS)").
   ⚠️ Zdroj je ainubis-head.webp (800 px, PRIEHĽADNÉ okolie) — NIE starý ainubis-badge.webp.
   Ten mal 160 px a bol to ČIERNY OBDĹŽNIK, nie výrez: na karte sa škáloval ~3× (rozmazaný)
   a jeho hranu bolo treba skrývať maskou, cez ktorú potom presvitala mriežka
   (Matej 9.8.: „ikonka je rozmazaná… okraje presvitajú… mriežka zasahuje do obrázka").
   Preto tu už NIE JE maska ani mix-blend-mode — kresba je plne krycia a stojí nad mriežkou. */
.gw-ainubis .gw-art{
  z-index:2;   /* nad mriežkou (1) aj závojom — hlava je pevný objekt, nie hologram */
  right:-24%; width:56%; top:50%; transform:translateY(-50%);
  /* Hlava je tmavá modrá na takmer čiernom pozadí — svetlo za ňou (radiála v pozadí karty)
     ju drží ako kresbu, nie siluetu. Žiara je len dokreslenie, jas sa NEZVYŠUJE. */
  filter:drop-shadow(0 0 40px rgba(${a.cyanRGB},0.55));
}
@media (min-width:721px){ .gw-ainubis .gw-art{ right:-28%; width:66%; } }

/* ── Značka „plná verzia čoskoro" — 🅿️ PARKUJE OD 21. 9. 2026 ─────────────────
   Čip zanikol rozhodnutím 4A: ten istý príbeh („chýba plná verzia") nesie banner
   v kostre /pack/ainubis, a povedaný dvakrát je z neho ospravedlňovanie.
   Pravidlá NEMAŽEM — sú tu rovnako ako QuickTiles/PackTree: keby sa čip niekedy
   vrátil na inú dlaždicu, vráti sa aj s históriou, prečo vyzerá takto.
   ⚠️ Kľúč pack.gateway.comingSoon z i18n preto tiež NEMAŽEM.
   (Matej 9.8.: „daj preč ten ribbon COMING SOON a dajme
   to že full version alebo dashboard coming soon") ────────────────────────────
   Šikmá stužka cez roh tvrdila, že karta NEFUNGUJE — pritom klik otvára chat presne ako
   doteraz. Nahradil ju drobný čip NAD menom: hovorí, že chýba len plná verzia, a nesie
   sa s textom, takže nekradne roh ani nediktuje odsadenie tela karty.
   ⚠️ Preto zmizol aj padding-top na .gw-ainubis .gw-body — bol tam len kvôli stužke. */
.gw-flag{
  display:inline-block; margin-bottom:8px; padding:4px 8px; border-radius:999px;
  font-family:${t}; font-weight:600; font-size:8.5px;
  letter-spacing:.14em; text-transform:uppercase; color:#04121a;
  background:linear-gradient(90deg, #3FB6CC 0%, ${a.cyan} 50%, #3FB6CC 100%);
  box-shadow:0 4px 14px rgba(0,0,0,0.45);
}
@media (min-width:721px){ .gw-flag{ font-size:9.5px; padding:4px 12px; margin-bottom:10px; } }

/* ČIP „PLNÁ VERZIA ČOSKORO" — PLNÁ CYAN VŽDY, aj keď karta spí (Matej 13.8.: „chcem aby bol
   v plnej farbe ako pri hovery"). Fade hovorí „karta ešte nie je hotová", čip hovorí PREČO —
   a to je jediná informácia, ktorá má v šedom stave žiť naplno.
   Drží to zoznam selektorov pri .gw-ainubis vyššie: čip v ňom NIE JE, takže naň žiadny
   filter nesadá. Nič sa tu neprepočítava. */
.gw-ainubis .gw-flag{
  box-shadow:0 4px 14px rgba(0,0,0,0.45), 0 0 18px rgba(${a.cyanRGB},0.55);
}

/* Typografia NIE JE zlatá (Matej 9.8.: „nadpis musí byt brandovY AI inej farby… pozri si ako
   sme to spravili inde"). Zdroj pravdy = hlavička widgetu v AinubisWidget.css: meno = Cinzel 700
   v ľadovo bielej #E6FAFF s cyan žiarou, „AI" v cyan. Zlatá v cyborg palete patrí ČLOVEKU. */
.gw-ainubis .gw-title{
  color:${a.ink}; letter-spacing:0.22em; text-indent:.16em;
  text-shadow:0 0 18px rgba(${a.cyanRGB},0.55);
}
/* „AI" v mene je modré — kúsok stroja v mene strážcu. Tvar mena je lock (12. 9. 2026),
   hodnoty sú AINUBIS.aiInk / aiShadow — tie isté číta .ainubis-ai v AinubisWidget.css. */
.gw-ai{ color:${a.aiInk}; text-shadow:${a.aiShadow}; }
.gw-ainubis .gw-lead{ color:rgba(230,250,255,0.82); text-shadow:0 2px 10px rgba(3,7,12,0.85); }

/* Závoj drží text čitateľný tam, kde obrázok podlieza — smeruje VŽDY od textovej strany. */
.gw::before{ content:''; position:absolute; inset:0; z-index:1; pointer-events:none; }
.gw-dogma::before{ background:linear-gradient(to left, rgba(250,244,236,0.86) 26%, rgba(250,244,236,0.52) 54%, rgba(250,244,236,0) 82%); }
.gw-ainubis::before{ background:linear-gradient(to right, rgba(5,11,22,0.92) 26%, rgba(5,11,22,0.55) 52%, rgba(5,11,22,0) 80%); }

/* ⚠️ Text má z-index 3 = NAD obrázkom (2). Hlava AINUBISA je od tejto verzie nepriehľadná,
   takže keby si sadla na text, zožrala by ho celý — nie je to teoretická poistka. */
.gw-body{ position:relative; z-index:3; width:62%; }
@media (min-width:721px){ .gw-body{ width:56%; } }
@media (min-width:721px){ .gw-dogma .gw-body{ width:50%; } }
.gw-dogma .gw-body{ margin-left:auto; }    /* text vpravo */
.gw-ainubis .gw-body{ margin-right:auto; } /* text vľavo */

.gw-title{
  display:block; font-family:${s}; font-weight:700; font-size:22px; line-height:1.08;
  letter-spacing:0.14em; text-transform:uppercase; color:${i.inkStrong};
}
/* ⚠️ Na PC je stupeň PLYNULÝ, nie pevný — pri pevných 23/38 px sa nadpis DOGMY zlomil na
   tri riadky a podtitulok vypadol pod dolnú hranu karty, a jednoslovné AINUBIS (nemá kde
   zalomiť) prebehlo pod hlavu psa.
   🔴 MIERKA JE ŠÍRKA KARTY (cqw), NIE OKNA (vw) — 22. 9. 2026. Dovtedy to bolo vw a čísla
   boli kalibrované na kartu 478 px pri okne 1440. Keď sa stĺpec zúžil na 832, karta klesla
   na 406 px, ale okno ostalo 1440 — stupeň sa teda nezmenšil a PSÍČKAROV aj AINUBIS
   prebehli cez telo karty. vw meria OKNO, karta v ňom môže byť akokoľvek široká; kto zmení
   šírku stĺpca, nesmie byť nútený prepočítavať tieto čísla znova.
   Horná medza = stav pri najširšej karte, dolná = najužšia dvojstĺpcová karta (~326 px). */
@media (min-width:721px){ .gw-title{ font-size:clamp(17px, 5.6cqw, 27px); letter-spacing:0.14em; } }
/* Meno AINUBIS je DOMINANTA karty (Matej 9.8.: „tento nadpis zvačši musí byť dominanta") —
   je to jedno slovo, unesie výrazne väčší stupeň než dvojriadkový nadpis DOGMY.
   Horná medza clampu je držaná ŠÍRKOU tela karty: „AINUBIS" je 7 znakov a pri 56 % šírky
   karty (~268 px na 1440 px) sa 44 px ešte zmestí na jeden riadok — viac už láme slovo. */
.gw-ainubis .gw-title{ font-size:32px; }
@media (min-width:721px){ .gw-ainubis .gw-title{ font-size:clamp(24px, 7.6cqw, 44px); } }

.gw-lead{
  display:block; margin-top:9px; font-family:${t}; font-weight:400; font-size:12.5px;
  line-height:1.45; color:${i.inkWarm};
}
@media (min-width:721px){ .gw-lead{ font-size:clamp(12px, 1.35vw, 14px); margin-top:12px; } }
`;function b(){const o=r();return e.jsxs("section",{"aria-label":o("pack.tiles.ariaLabel"),children:[e.jsx("style",{children:g}),e.jsxs("div",{className:"gw-row",children:[e.jsxs("a",{className:"gw gw-dogma pack-card-hover",href:"https://dogma.dogypt.com",target:"_blank",rel:"noopener noreferrer",onClick:p,children:[e.jsx("span",{className:"gw-plate","aria-hidden":!0}),e.jsx("span",{className:"gw-art",children:e.jsx("img",{src:"/images/dogma-cover-400.webp",alt:"","aria-hidden":!0,width:400,height:533,decoding:"async"})}),e.jsxs("span",{className:"gw-body",children:[e.jsx("span",{className:"gw-title",children:o("pack.gateway.dogma.title")}),e.jsx("span",{className:"gw-lead",children:o("pack.gateway.dogma.lead")})]})]}),e.jsxs(d,{className:"gw gw-ainubis pack-card-hover",to:"/pack/ainubis",children:[e.jsx("span",{className:"gw-art",children:e.jsx("img",{src:l,alt:"","aria-hidden":!0})}),e.jsxs("span",{className:"gw-body",children:[e.jsxs("span",{className:"gw-title",children:[e.jsx("span",{className:"gw-ai",children:"AI"}),"NUBIS"]}),e.jsx("span",{className:"gw-lead",children:o("pack.gateway.ainubis.lead")})]})]})]})]})}export{b as G};
