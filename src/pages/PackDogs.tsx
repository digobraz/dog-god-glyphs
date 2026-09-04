// MY PACK (`/pack/dogs`) — VSTUP. Zadanie reštrukturalizácie:
// plany/zadanie-pack-dogs-restrukturalizacia-2026-08-06.md
// (staršie zadanie stránky: plany/zadanie-mypack-petpas-2026-08-06.md §5)
//
// DELIACA ČIARA: táto stránka je VSTUP (kam sa zadáva), karta psa `/pack/dogs/:id` je
// VÝSTUP (pet pas, needituje sa tam nič). Psie bloky preto nenesú ÚDAJE PASU —
// len identitu a progres. Keby tu boli údaje, vzniknú dve pravdy vedľa seba.
//
// ⚠️ VEDOMÉ POVOLENIE toho locku (Matej 6.8.2026, rozšírené 7.8.): dni života,
// krajina, poradové číslo, úloha, element a osobnosť (tagy povahy) SÚ v psom bloku. Sú to identitné veci —
// patria k `#1` a k vlajke, nie k váhe a očkovaniu. NEROZŠIROVAŤ na ďalšie polia
// bez Matejovho slova.
//
// PORADIE BLOKOV (§2 zadania) — spoločný modrý gradientový obal ZANIKOL, každý pes
// má vlastný:
//   1 psy · 2 kvíz hero (kým ho aspoň jeden pes nemá) · 3 profil (6 dlaždíc) ·
//   3b kvíz kompaktne (keď ho majú všetci) · 4 galéria + denník (tmavý riadok) ·
//   5 AINUBIS · 6 DogStats
// Bloky 2 a 3b sú TEN ISTÝ blok v dvoch stavoch — prepína sa DÁTAMI, nie ručne:
// príde nový pes bez kvízu → blok sa vráti hore ako hero.
//
// Dlaždice akcií sú JEDINÉ miesto, kam sa pridávajú nové funkcie: stránka rastie
// o položku v `QUIZ_SECTIONS`, nie o novú sekciu v JSX.
//
// VIZUÁLNE DOLADENIE (Matej 6.8.2026 večer, po 2. kole), čo je zámer a nie náhoda:
//  • psí blok (7.8., 2. kolo) = TRI ČASTI na každej šírke, mobil sa NEPRESKUPUJE:
//    1 fotka · 2 meno + dni a POD tým heroglyf · 3 stĺpec piluliek pod sebou
//    (krajina · #číslo · úloha · element · osobnosť). Pilulky NIKDY nie vedľa ani
//    pod heroglyfom a NIKDY nie v rade.
//  • kvíz (7.8.) = štýl „VITRÁŽ": ilustrácia cez CELÚ kartu ako filmový plagát,
//    text v tmavom spodku, tyrkysová stuha KVÍZ. Matej si ho vybral z pätice návrhov
//    (papyrus / obsidián / faience / vitráž / stéla). Je to TMAVÝ povrch — papyrusový
//    lock sa naň nevzťahuje. Dlhý popis sekcie sa tu nezobrazuje, lebo opakoval
//    „18 otázok" spod tlačidla.
//  • NÁZVOSLOVIE (Matej 7.8., LOCKED): dokument psa sa volá **DOG ID** — jedno slovo
//    na všetkých povrchoch, v SK aj EN rovnako (je to názov produktu, neprekladá sa).
//    Nahradilo štyri pojmy pre tú istú vec: „Vysvedčenie" (progres) / „Životopis"
//    (tlačidlo) / „Profil psa" (dlaždice) / EN „Passport" + „Life story" + „Dog profile".
//    Pribudne nový povrch → volá sa DOG ID, nie synonymum.
//    ⚠️ Matej si je vedomý, že v tom istom bloku je aj pilulka #poradové číslo a že
//    „ID" a „#1" si opticky konkurujú — vybral to s tým flagom pred sebou.
//  • AINUBIS má meno ako nadpis + tagline; ostáva „Čoskoro" a NIKAM nevedie —
//    plán sa nestavia. (Chat AINUBISA beží zvlášť ako plávajúci widget.)
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { FlagCircle } from '@/components/pack/FlagCircle';
import { DogStats } from '@/components/pack/DogStats';
import ainubisBadge from '@/assets/ainubis-badge.png';
import {
  QUIZ_SECTIONS, PROGRESS_STEPS, STEP_BY_FIELD, type QuizSection,
} from '@/components/pack/dogQuiz';
import { storedSpecials } from '@/components/pack/natureQuiz';
import { readLatestForDogs, onDogEventsChange, hasValue, type LatestValue } from '@/lib/dogEvents';
import { dogLifeLine } from '@/lib/dogAge';
import { countryISO2 } from '@/lib/countryGeo';
import { supabase } from '@/integrations/supabase/client';
import { DEV_NOAUTH, DEV_MOCK_DOGS } from '@/lib/devMockDogs';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;

// Meno psa = Cinzel Decorative, na každom povrchu (brand manuál, LOCKED 2026-07-26).
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";

// Pomery v PC riadku psieho bloku (fotka · meno · glyf), vztiahnuté k VÝŠKE GLYFU.
// Sú tu preto, aby sa dali doladiť jedným číslom — rovnica v useFitName ostáva rovnaká.
// Matej 8.8.: „foto zmenši aby bolo cca na výšku hera, môže byť o 10% väčšia a meno zmenši
// tak aby z každej strany mal dostatočný a totožný rozostup od fotky aj heroglyfu."
// ⚠️ MOBIL SA ICH NETÝKA — mobilné rozloženie je od 8.8. LOCK a má vlastnú vetvu rovnice.
const PHOTO_K = 1.1;
const NAME_K = 0.62;
// Doladenie 8.8., 5. kolo: „zmenši text ešte o 10% a heroglyph o 5% ale nechaj ho zarovnaný
// na okraji progresbaru ako je teraz." Uvoľnená šírka ide do MEDZIER (rozdelí sa na dve
// rovnaké), nie do fotky — inak by sa glyf odlepil od pravého okraja riadka.
// ⚠️ 12.8.: „okraj progresbaru" je odvtedy okraj LIŠTY s posterom — progresbar zanikol,
// referencia sa presunula, konštanty ostali.
const TEXT_K = 0.9;
const GLYPH_K = 0.95;

// MOBIL (≤720). Zadanie 12.8., 4. kolo (Matej): „malo by to byť rozdelené na 3 stĺpce,
// fotka bude väčšia a bude začínať na ľavej strane a DOG ID bude na pravej."
//
// Predtým mala fotka pevných 88 px a dvojica meno+glyf strop 175 px. Nad ~500 px sa ten
// strop zapol a VŠETKO uvoľnené miesto skončilo v dvoch dierach po stranách
// (`justify-content:center`): pri 680 px stála fotka 152 px od ľavého okraja karty a lišta
// 128 px od pravého. Blok tak vyzeral ako vycentrovaný zhluk, nie ako riadok.
//
// Teraz držia kraje fotka a lišta (`justify-content:space-between`) a rovnica má dve
// neznáme namiesto jednej:
//   MOBILE_PHOTO_K    = podiel dostupnej šírky, ktorý dostane fotka,
//   MOBILE_PHOTO_MIN/MAX = jej medze. Strop je tu preto, že od istej veľkosti je fotka
//                     zároveň VÝŠKA bloku: stredný stĺpec (meno+glyf+pilulky) meria pri
//                     plnom strope ~142 px, takže 132 px sa doň ešte zmestí a blok kvôli
//                     fotke nenarastie. Spodok 96 px drží úzke telefóny (360–430), kde
//                     každý pixel navyše uberá menu — pri 360 px by fotka 108 px zrazila
//                     meno z 20 px na 15.
//   MOBILE_MAX_IDW    = strop dvojice meno+glyf. NIE je kozmetika: na mobile stoja pod
//                     sebou, takže ich výška rastie so šírkou dvakrát rýchlejšie než na
//                     PC. 230 px vyjde na blok ~169 px, čiže ešte pod PC blokom (172 px);
//                     280 px z neho spraví 190+ a mobil bude vyšší než desktop.
//
// Zvyšok, ktorý nad stropmi ostane, ide do DVOCH MEDZIER (space-between), nie do jednej
// diery a nie do okrajov — fotka teda ostáva na ľavej hrane a lišta na pravej vždy.
//
// ⚠️ PC vetva má vlastné štyri konštanty (PHOTO_K…GLYPH_K) a týchto sa NETÝKA.
const MOBILE_PHOTO_K = 0.30;
const MOBILE_PHOTO_MIN = 96;
const MOBILE_PHOTO_MAX = 132;
const MOBILE_MAX_IDW = 230;

// PES BEZ HEROGLYFU (Matej 2026-08-20: „musíme tam dať nejaký placeholder vo velkosti
// heroglyfu"). Prázdna kartuša musí mať PRESNE pomer strán skutočného glyfu, inak by sa
// blok bez neho staval podľa iných pravidiel než blok s ním. Zdroj čísla je `viewBox`
// vodorovného rámu v `components/HeroglyphFrame.tsx` — teda ten istý tvar, aký vyrenderuje
// `/cert-render/:id?type=horizontal`, z ktorého `heroglyph_png_url` vzniká.
// Bez placeholderu padla rovnica do zálohy „meno vyplní obal" a meno sa roztiahlo cez celý
// riadok — blok vyzeral rozbito.
const GLYPH_RATIO = 13100 / 3500;

// Ilustrácia kvízovej karty. ⚠️ ZÁMERNE NIE fotka psa (Matej 6.8.: „nemôže tam byť
// foto psa, čo ak má majiteľ 3?") — dlaždica platí pre celú svorku.
const NATURE_ART = '/images/nature-quiz-art.webp';

// Pilulka s dňami — JEDEN vizuál naprieč appkou. Zdroj pravdy je strom na `/pack`
// (`components/pack/PackTree.tsx`, riadky ~129–142): vertikálny gradient, hnedý text,
// Cinzel 700 BEZ uppercase a bez rozpáleného letter-spacingu, mäkký zlatý tieň, žiadny
// rám. Predtým tu bola vlastná verzia (135° gradient s alfou, uppercase, .12em) a ten
// istý údaj tak vyzeral na každej obrazovke inak (Matej 7.8.: „aby to bolo konštantné").
// ⚠️ Keď meníš tento vizuál, meň ho v PackTree.tsx a sem to prenes — nie naopak.
const DAYS_PILL = {
  background: 'linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%)',
  color: '#3d1f00',
  letterSpacing: '0.02em',
  boxShadow: '0 6px 16px -6px rgba(201,154,63,0.6)',
} as const;

// `.btn-gold` sa v projekte NEIMPORTUJE globálne — žije v `SpiralLanding.css` pod
// selektorom `.dogypt-spiral-root`. Zavedený vzor (AddTripPlan.tsx, AddEvent.tsx):
// lokálna kópia PRESNÝCH hodnôt zo SpiralLanding.css, nie vlastný gradient.
// Radius 8px, NIE pill. Hodnoty sa nesmú „doladiť" — CTA je LOCKED.
const HUB_CSS = `
.hub-hover{ transition: transform .2s ease, box-shadow .2s ease; }
.hub-hover:hover{ transform: translateY(-2px); }
/* Mriežka dlaždíc profilu — PEVNÝ počet stĺpcov, nie auto-fill. Šesť dlaždíc delia
   2 aj 3 stĺpce BEZ ZVYŠKU; 4 stĺpce (predošlý stav pri ôsmich) by pri šiestich
   nechali v druhom rade dieru vpravo. */
.hub-tiles{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
@media (min-width:760px){ .hub-tiles{ grid-template-columns:repeat(3,minmax(0,1fr)); } }
.hub-media{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
@media (max-width:560px){ .hub-media{ grid-template-columns:1fr; } }
.hub-gold{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:13px 24px;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);
  border-radius:8px;
  color:#000;
  font-family:'Cinzel',serif; font-size:11px; font-weight:800;
  letter-spacing:.12em; text-transform:uppercase;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  box-shadow:0 0 28px rgba(230,158,26,0.34), inset 0 1px 0 rgba(255,255,255,0.3);
  transition: transform .2s, box-shadow .22s;
}
.hub-gold:hover{ transform:scale(1.04); box-shadow:0 0 44px rgba(230,158,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3); }
.hub-gold:active{ transform:scale(0.98); }

/* ── psí blok ───────────────────────────────────────────────────────────────── */
/* TRI STĹPCE (Matej 12.8., 3. kolo — papyrus):
     1 fotka s poradovým číslom NA KRUHU
     2 meno + heroglyf a POD nimi rad pilulek
     3 lišta: pilulka s percentom · dogposter · popisok DOG ID
   Pilulky sú v STREDNOM stĺpci, teda začínajú pod menom a nie pod fotkou — blok tým
   stratil celý riadok (Matej: „ušetríme priestor"). Predtým mali vlastný pravý stĺpec
   (.dogblk-side) a pod fotkou ostávala mŕtva plocha.
   ZANIKLO 12.8.: progresbar (.dogblk-prog), zlaté CTA (.dogblk-open), stĺpec pilulek
   (.dogblk-side) aj spodný riadok (.dogblk-foot). Nehľadaj ich, nie sú parkované. */
.dogblk{ display:flex; align-items:center; gap:18px; }
/* Ľavý stĺpec je LEN fotka. position:relative tu je kvôli pilulke s číslom, ktorá
   sadá na spodný okraj kruhu a vnútri neho by sa orezala. */
.dogblk-left{ position:relative; flex:0 0 auto; line-height:0; }
.dogblk-main{ flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:12px; }

/* Meno a glyf zdieľajú jeden obal — konkrétne rozmery dopočíta useFitName tak, aby
   pravý okraj glyfu sedel na hrane lišty s posterom. */
.dogblk-idw{
  width:100%;
  display:flex; flex-direction:column; gap:4px;
  /* Hranice veľkosti mena. Sú TU, nie v JS, aby breakpoint zostal jediný a v CSS;
     useFitName si ich prečíta cez getComputedStyle. */
  --fit-min:24px; --fit-max:200px;
  container-type:inline-size;   /* len kvôli cqw fallbacku v .dogblk-name */
}
/* Veľkosť písma nastavuje useFitName PRESNÝM meraním po vykreslení. Hodnota nižšie je
   len štartovacia, aby meno pred prvým meraním neblikalo — odhad --len × 0.86 je
   zámerne podstrelený, teda skôr malé písmo než pretečené.
   ⚠️ Prečo meranie: odhad podľa počtu znakov nemôže sedieť naprieč písmami. V ostrej
   databáze sú 奥莉 (Aoli) (Cinzel Decorative ich NEMÁ a padá na systémový font) aj
   BABY (МАЛЮК) — tam je šírka znaku úplne iná než v latinke. */
.dogblk-name{
  font-size:clamp(24px, calc(100cqw / (var(--len,7) * 0.86)), 100px);
  line-height:1.02;
  /* Poistka: keby meranie zlyhalo, meno sa radšej zlomí, než pôjde cez lištu. */
  overflow-wrap:anywhere;
}
/* Kruh = ten istý recept ako HeroCard na homepage (Matej 12.8.: „aplikujem tú istú
   logiku ako je to pri homepage"). Prstenec progresu, ktorý tu žil jedno kolo, zanikol
   — progres sa presunul do pilulky v lište. */
.dogblk-photo{
  width:132px; height:132px; border-radius:50%; object-fit:cover; display:block;
  border:2px solid #C99A3F;
  box-shadow:0 0 0 1px rgba(201,154,63,0.45), 0 8px 24px rgba(201,154,63,0.24);
}
/* Poradové číslo NA KRUHU — recept 1:1 z HeroCard.tsx (~riadky 598–624): locknutá
   pilulka dní, navyše svetlý hairline, lebo leží na fotke a bez neho splynie s tmavým
   psom. Z radu pilulek preto #N VYPADLO, aby tam nebolo dvakrát. */
.dogblk-num{
  position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
  display:inline-flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-weight:700; font-size:14px; letter-spacing:0.02em;
  line-height:1; white-space:nowrap; padding:5px 10px; border-radius:999px;
  background:linear-gradient(180deg,#F5C73D,#E69E1A); color:#3d1f00;
  border:1px solid rgba(250,244,236,0.55);
  box-shadow:0 2px 6px rgba(0,0,0,0.28);
}
/* ⚠️ 721px, NIE 900px. Hranica musí byť tá istá, akú používa useFitName — kým tu bolo
   900 a v mobilnej vetve 720, ostalo medzi nimi pásmo 721–899 bez pravidiel a meno sa
   lámalo na „HEKTHO/R" (Matej 8.8.: „pri shrinku sa to správa divne"). */
@media (min-width:721px){
  /* PC: fotka · meno · glyf VEDĽA SEBA. Na mobile ostáva meno NAD glyfom — preto je to
     media query, nie zmena základu. Konkrétne rozmery dopočíta useFitName. */
  .dogblk-idw{ flex-direction:row; align-items:center; }
  .dogblk-idw > .dogblk-name{ flex:0 0 auto; white-space:nowrap; }
  .dogblk-idw > .dogblk-glyph{ flex:0 0 auto; width:auto; }
  /* ⚠️ TIETO DVE HODNOTY MUSIA BYŤ ZHODNÉ (Matej 8.8.: „meno … aby z každej strany malo
     dostatočný a totožný rozostup od fotky aj heroglyfu"). Prvá je medzera fotka↔meno,
     druhá meno↔glyf — sú to dva RÔZNE flex kontajnery, takže sa nedajú zapísať raz.
     Obe si useFitName číta zo štýlu, čiže nikde inde v kóde zapísané nie sú. */
  .dogblk{ gap:22px; }
  .dogblk-idw{ gap:22px; }
}
/* PAPYRUS (lock 2026-07-26, zdroj pravdy Entry.tsx): odsadenie je TU, nie v inline
   štýle — inak by ho media query nižšie nemala ako prebiť. */
.dogblk-card{ padding:20px 22px; }

/* Rad pilulek pod menom. Rovnaké diely sa tu ZÁMERNE nepoužívajú — pilulky sú rôzne
   dlhé údaje, nie tlačidlá, a naťahovanie na rovnakú šírku by z „SVK" spravilo prázdny
   pruh. Šírku určuje obsah, zalamujú sa. */
.dogblk-pills{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
/* Rozmery pilulky žijú TU, nie v inline štýle komponentu — inline by triedu prebil
   a mobilné zmenšenie by ticho nezabralo. */
.dogblk-pill{ padding:5px 11px; font-size:9px; letter-spacing:.12em; }
/* Dni majú vlastnú veľkosť — sú to hlavné číslo bloku, nie tag. Hodnota z PackTree,
   aby bol ten istý údaj rovnako veľký aj rovnako farebný. */
.dogblk-days{ padding:5px 12px; font-size:12.5px; }

/* ── lišta na pravom kraji ──────────────────────────────────────────────────── */
/* Nesie progres, poster a slovo DOG ID. Jej šírku určuje POSTER a pilulka s pevným
   min-width — teda nič, čo by záviselo od fotky alebo mena. Práve preto sa z nej dá
   v useFitName počítať dostupná šírka bez rizika kruhu. */
.dogblk-rail{
  position:relative;
  flex:0 0 auto; align-self:stretch;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:7px;
  padding-left:20px;
  --poster-h:78px;
}
/* Deliaca čiara = papyrusový lock (2026-07-26): zlatá, 2px, VYBLEDNUTÁ DO STRÁN — nie
   šedý ani priehľadný 1px hairline. T.rule je vodorovná (90deg), toto je jej zvislá
   dvojička (Matej 12.8.: „zvýrazni viac vertikálu … teraz ju skoro nevidno, urob ju
   takú aby bola na krajoch tenšia").
   ⚠️ Je to ::before, NIE border — border má rovnakú sýtosť po celej dĺžke a nedá sa
   vyblednúť. Zároveň nezaberá miesto v layoute, takže sa nemení šírka lišty, z ktorej
   useFitName počíta dostupnú šírku riadka. */
.dogblk-rail::before{
  content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
  background:linear-gradient(180deg, transparent 0%, #C99A3F 28%, #C99A3F 72%, transparent 100%);
  border-radius:2px; pointer-events:none;
}
.dogblk-poster{ opacity:.88; transition:transform .2s ease, opacity .2s ease; }
.hub-hover:hover .dogblk-poster{ transform:translateX(3px); opacity:1; }
.dogblk-railcap{
  font-family:${FONT_TITLE}; font-weight:800; font-size:10px; letter-spacing:.16em;
  text-transform:uppercase; color:#2a1608; white-space:nowrap;
}
/* Progres = pilulka NAD posterom (Matej 12.8.). Percento je ÚDAJ, takže Space Grotesk
   600 (strop načítanej váhy), nie Cinzel. TRI STAVY, farby z brand tokenov:
     0 %      červená  T.alertRed  #B25640
     1–99 %   modrá    T.partHek   #2E5FD0
     100 %    zelená   T.growGreen #3D7A4E
   ⚠️ min-width je nutnosť, nie kozmetika: bez neho je „24%" o polovicu užšie než
   „COMPLETE" a poster by sa v zozname psov pri každom bloku posunul inam. */
.dogblk-fill{
  min-width:78px; text-align:center;
  padding:4px 10px; border-radius:999px; white-space:nowrap;
  background:#2E5FD0; color:#EAF0FF;
  font-family:${FONT_UI}; font-weight:600;
  font-size:9.5px; letter-spacing:.08em; text-transform:uppercase;
  box-shadow:0 4px 12px rgba(46,95,208,0.4);
}
.dogblk-fill.is-zero{ background:#B25640; color:#FDECE7; box-shadow:0 4px 12px rgba(178,86,64,0.4); }
.dogblk-fill.is-done{ background:#3D7A4E; color:#EAF7ED; box-shadow:0 4px 12px rgba(61,122,78,0.4); }

/* Heroglyf: zdrojový PNG má ČIERNE ťahy. Na tmavom podklade sa musel prefarbovať na
   zlato — na PAPYRUSE sa filter ZRUŠIL a glyf ostáva čierny (Matej 12.8.: „čierny
   heroglyf aj meno"). Šírku aj výšku určuje useFitName. */
.dogblk-glyph{
  width:100%; height:auto; object-fit:contain; display:block;
  pointer-events:none;
}
/* Prázdna kartuša, keď pes glyf ešte nemá. Pomer strán drží tvar v OBOCH vetvách naraz:
   na PC mu useFitName nastaví výšku (šírku dopočíta prehliadač), na mobile je široký na celý
   obal a výšku si dopočíta sám. Vizuál je zámerne tichý — je to chýbajúci doklad, nie prvok,
   ktorý má súťažiť s menom. Rám aj radius podľa brandu (kartuša 8px, zlatý rám polí). */
.dogblk-glyph--empty{
  aspect-ratio:${GLYPH_RATIO};
  border:1px dashed rgba(179,130,45,0.55);
  border-radius:8px;
  background:rgba(201,154,63,0.06);
  box-sizing:border-box;
}

/* Mobil = tie isté tri stĺpce, len zmenšené. Meno ide NAD glyf (vlastná vetva rovnice
   v useFitName).
   ⚠️ POSTER SA NEZMENŠUJE — --poster-h ostáva 78 px ako na PC (Matej 12.8.). Zmenšuje sa
   meno a heroglyf; šírku, ktorú tým uvoľnia, dostane lišta a poster sa v nej vycentruje. */
@media (max-width:720px){
  .dogblk-card{ padding:15px 13px; }
  /* KRAJE DRŽIA FOTKA A LIŠTA (Matej 12.8., 4. kolo). space-between, NIE center:
     nad stropmi MOBILE_PHOTO_MAX a MOBILE_MAX_IDW ostane voľné miesto a musí ísť do
     dvoch MEDZIER medzi stĺpcami, nie do okrajov. S center stála pri 680 px fotka
     152 px od ľavej hrany karty a lišta 128 px od pravej — blok vyzeral vycentrovaný.
     flex:0 1 auto na strednom stĺpci musí ostať: s flex:1 by sa celý zvyšok nalepil
     doň a vznikla by jedna diera medzi glyfom a deliacou čiarou. */
  .dogblk{ gap:16px; justify-content:space-between; }
  .dogblk-main{ gap:9px; flex:0 1 auto; }
  /* Štartovacia hodnota = MOBILE_PHOTO_MIN. Konkrétny rozmer dopočíta useFitName
     (rastie s dostupnou šírkou po MOBILE_PHOTO_MAX); toto je len to, čo platí, kým sa
     nenačíta glyf a rovnica nemá pomer strán. */
  .dogblk-photo{ width:96px; height:96px; }
  .dogblk-num{ font-size:11px; padding:4px 8px; bottom:-3px; }
  .dogblk-idw{ --fit-min:14px; --fit-max:60px; }
  .dogblk-name{ font-size:clamp(14px, calc(100cqw / (var(--len,7) * 0.86)), 36px); }
  /* O chlp menšie než predtým: stredný stĺpec sa zúžil kvôli väčšej lište a rad
     „3 736 DNÍ + SK" sa doň pri pôvodných rozmeroch nezmestil na jeden riadok. */
  .dogblk-pill{ padding:4px 7px; font-size:8px; letter-spacing:.05em; }
  .dogblk-days{ padding:4px 9px; font-size:10px; }
  .dogblk-rail{ padding-left:12px; gap:5px; }
  .dogblk-railcap{ font-size:8px; letter-spacing:.1em; }
  .dogblk-fill{ min-width:58px; font-size:8px; padding:3px 7px; letter-spacing:.04em; }
}
/* Úzke telefóny (iPhone SE 375, staršie 360): ustupuje odsadenie karty a medzery,
   meno a glyf nie. */
@media (max-width:430px){
  .dogblk-card{ padding:14px 11px; }
  .dogblk{ gap:10px; }
  .dogblk-rail{ padding-left:9px; }
}

/* ── kvíz hero (stav A) ───────────────────────────────────── */
/* ŠTÝL „VITRÁŽ" — Matej si ho vybral 7.8. z pätice návrhov (papyrus / obsidián /
   faience / vitráž / stéla). Ilustrácia išla z pruhu 176 px na CELÚ kartu ako filmový
   plagát, text sedí v tmavom spodku. Je to teda TMAVÝ povrch — papyrusový lock
   (Entry.tsx) sa najň nevzťahuje, rovnako ako sa nevzťahuje na share karty.
   ⚠️ Celá karta je odkaz (Matej: „musí vyzerať viac klikateľne"), takže sem NESMIE
   pribudnúť ďalšie <a> — vnorený odkaz je neplatné HTML. */
.hub-hero{
  position:relative; overflow:hidden; display:flex; align-items:flex-end;
  min-height:300px; padding:28px 30px 26px;
  border-radius:16px; border:1px solid rgba(201,154,63,0.5);
  box-shadow:0 30px 74px -32px rgba(0,0,0,0.95);
  text-decoration:none; cursor:pointer;
}
.hub-hero-art{
  position:absolute; inset:0; width:100%; height:100%; z-index:0;
  object-fit:cover; object-position:center 26%; pointer-events:none;
}
/* Gradient je to jediné, čo drží text čitateľný — vitráž je sama o sebe svetlá
   a pestrá. Preto siaha vysoko (78 %) a dole je takmer nepriehľadná.
   Druhá vrstva (do strán) je tam kvôli ŠIROKÝM oknám: pri ~1000 px sa cover prestane
   orezávať do stredu, odkryje sa vyblednutý pravý okraj vitráže a karta sa rozpadne
   na „obraz vľavo + svetlá diera vpravo". Vignette to zviaže späť do jedného plagátu. */
.hub-hero::before{
  content:''; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:
    linear-gradient(to right,
      rgba(4,2,0,0.52) 0%, rgba(4,2,0,0.10) 38%, rgba(4,2,0,0.16) 64%, rgba(4,2,0,0.58) 100%),
    linear-gradient(to top,
      rgba(4,2,0,0.94) 6%, rgba(4,2,0,0.72) 40%, rgba(4,2,0,0.18) 78%, transparent 100%);
}
.hub-hero-body{ position:relative; z-index:2; width:100%; min-width:0; }
.hub-hero-title{ font-size:30px; }
/* Rohová stuha „KVÍZ" — človek musí vedieť, že ide niečo vypĺňať (Matej 6.8.).
   TYRKYSOVÁ, nie zlatá: farba = T.partMkt (#1AA39A, brand faience), a na zlatozelenej
   vitráži je to jediný odtieň, ktorý sa nestratí. */
.hub-ribbon{
  position:absolute; top:24px; right:-56px; z-index:3; pointer-events:none;
  width:190px; padding:6px 0; text-align:center; transform:rotate(45deg);
  background:linear-gradient(135deg,#22C3B6 0%,#0E7A72 100%);
  border-top:1px solid rgba(234,251,248,0.42);
  border-bottom:1px solid rgba(6,58,54,0.35);
  box-shadow:0 6px 18px rgba(0,0,0,0.28);
  color:#F2FFFD; font-family:'Cinzel',serif; font-weight:800;
  font-size:10px; letter-spacing:.24em; text-transform:uppercase;
}
/* Chipy — tmavé sklo, nie papyrusové pilulky: ležia na fotke, takže potrebujú
   vlastný podklad. Šírka podľa obsahu, vedľa seba. */
.hub-axes{ display:flex; gap:8px; flex-wrap:wrap; margin:12px 0 18px; }
.hub-chip{
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 13px; border-radius:999px;
  background:rgba(8,5,2,0.55); border:1px solid rgba(255,236,190,0.42);
  backdrop-filter:blur(6px);
}
/* CTA a meta vedľa seba na jednom riadku — spodok karty je úzky pruh, stĺpec pod
   tlačidlom by ho zbytočne predĺžil. */
.hub-cta{ display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.hub-gold.is-big{ padding:15px 28px; font-size:12px; letter-spacing:.13em; }
/* Druhá akcia karty (SPRAVIŤ ZNOVA / POZRIEŤ VÝSLEDOK vedľa zlatého). Tmavé sklo
   ako chipy vyššie — na vitráži je to jediný podklad, ktorý drží text čitateľný,
   a zároveň je jasné, že hlavná akcia je tá zlatá. */
.hub-ghost{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:14px 20px; border-radius:8px;
  background:rgba(8,5,2,0.55); border:1px solid rgba(255,236,190,0.42);
  backdrop-filter:blur(6px);
  color:#FFF3DA; font-family:'Cinzel',serif; font-size:11px; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase;
  cursor:pointer; white-space:nowrap; text-decoration:none;
  transition: transform .2s, background .2s, border-color .2s;
}
.hub-ghost:hover{ transform:scale(1.03); background:rgba(8,5,2,0.72); border-color:rgba(255,236,190,0.7); }
.hub-ghost:active{ transform:scale(0.98); }
/* Stuha po absolvovaní. Zelená = HOTOVO, rovnaká ako pilulka na dlaždiciach
   a ako growGreen v štatistikách — nie tretí odtieň pre tú istú správu. */
.hub-ribbon.is-done{
  background:linear-gradient(135deg,#3E9E68 0%,#1F6B42 100%);
  border-top-color:rgba(236,251,242,0.42); border-bottom-color:rgba(10,54,32,0.35);
  color:#F4FFF8;
}
/* Hover kdekoľvek po karte rozsvieti CTA — signál „celé je to tlačidlo".
   ⚠️ Musí ísť cez triedu .hub-gold, ktorá tieň drží v CSS; box-shadow karty je
   inline a žiadny :hover selektor by ho neprebil. */
.hub-hero:hover .hub-gold{
  transform:scale(1.04);
  box-shadow:0 0 44px rgba(230,158,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
}
@media (max-width:720px){
  /* Vyššia, nie nižšia: na úzkom sa obraz orezáva do stredu a pes by z neho vypadol. */
  .hub-hero{ min-height:390px; padding:20px 18px 18px; }
  .hub-hero-title{ font-size:25px; }
  .hub-gold.is-big{ width:100%; padding:14px 16px; font-size:11.5px; white-space:normal; }
  /* Ghost ide na mobile pod zlaté, v rovnakej šírke — dve tlačidlá rôznej šírky
     pod sebou vyzerajú ako nedorobený rad. */
  .hub-ghost{ width:100%; padding:13px 16px; white-space:normal; }
  .hub-cta{ gap:10px; }
  .hub-ribbon{ top:16px; right:-58px; width:184px; font-size:9px; letter-spacing:.2em; }
}
`;

interface HubDog {
  id: string;
  dog_name: string | null;
  cloudinary_main_url: string | null;
  heroglyph_png_url: string | null;
  pack_number: number | null;
  country: string | null;
  life_status: string | null;
  death_date: string | null;
  birth_year: number | null;
  selections: Record<string, string> | null;
}

type Latest = Record<string, Record<string, LatestValue>>;
type Tx = (key: string, fallback: string) => string;

/** Pole scored kvízu, ktorým sa pozná, či ho pes má. */
const NATURE_FIELD = 'nature.role';

export default function PackDogs() {
  const t = useT();
  const tx: Tx = (key, fallback) => {
    const v = t(key);
    return v === key ? fallback : v;
  };

  const [dogs, setDogs] = useState<HubDog[] | null>(null);
  const [latest, setLatest] = useState<Latest>({});
  // Kým progres nie je načítaný, kvízový blok sa NEVYKRESLÍ ani v jednom stave —
  // inak by majiteľovi s hotovým kvízom najprv bliklo veľké hero a až potom by
  // sa zmenšilo na prúžok pod dlaždicami (skok celej stránky).
  const [latestLoaded, setLatestLoaded] = useState(false);

  // Vlastný dotaz namiesto `usePackIdentity().dogs` — ten vracia len id/meno/foto,
  // a hub potrebuje aj poradové číslo, krajinu (vlajka), heroglyf a dátum narodenia
  // zo `selections` (pilulka „dni"; `birth_year` je len ROK, na dni nestačí).
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      // Bez session: v deve s `VITE_PACK_NOAUTH=1` mock svorka (inak by tu aj pri
      // zapnutom NOAUTH stál prázdny stav — `getUser()` cez ten flag nejde),
      // v produkcii prázdne pole.
      if (!uid) { if (alive) setDogs(DEV_NOAUTH ? (DEV_MOCK_DOGS as HubDog[]) : []); return; }
      const { data } = await supabase
        .from('dogs')
        .select('id, dog_name, cloudinary_main_url, heroglyph_png_url, pack_number, country, life_status, death_date, birth_year, selections')
        .eq('user_id', uid)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });
      if (alive) setDogs((data as unknown as HubDog[]) ?? []);
    })();
    return () => { alive = false; };
  }, []);

  // Progres sa číta pre VŠETKY psy naraz (jeden dotaz, nie N) a prekresľuje sa hneď
  // po návrate z kvízu — `onDogEventsChange` posiela in-tab signál po appende.
  useEffect(() => {
    if (!dogs || dogs.length === 0) return;
    const ids = dogs.map((d) => d.id);
    let alive = true;
    const load = () => {
      readLatestForDogs(ids).then((r) => { if (alive) { setLatest(r); setLatestLoaded(true); } });
    };
    load();
    const off = onDogEventsChange(load);
    return () => { alive = false; off(); };
  }, [dogs]);

  const totalSteps = PROGRESS_STEPS.length;

  // Progres dlaždice = súčet cez VŠETKY psy: „3 z 10" znamená 3 zodpovedané otázky
  // z 10 možných naprieč svorkou. Pri jednom psovi je to presne jeho stav.
  const sectionProgress = useMemo(() => {
    const out: Record<string, { filled: number; total: number }> = {};
    const dogIds = dogs?.map((d) => d.id) ?? [];
    for (const s of QUIZ_SECTIONS) {
      if (dogIds.length === 0 || s.kind !== 'quiz') {
        out[s.key] = { filled: 0, total: 0 }; continue;
      }
      let filled = 0;
      for (const id of dogIds) {
        for (const step of s.steps) if (hasValue(latest[id]?.[step.field])) filled += 1;
      }
      out[s.key] = { filled, total: s.steps.length * dogIds.length };
    }
    return out;
  }, [dogs, latest]);

  // Stav si blok vyhodnotí sám z `latest` — hore stojí vždy, mení sa len ponuka.
  const natureSection = QUIZ_SECTIONS.find((s) => s.kind === 'scored');

  // `wide` = rovnaká šírka stĺpca ako `/pack/profile` (max-w-5xl). Bez neho bol hub
  // v úzkom stĺpci (max-w-2xl) a vedľa profilu vyzeral ako iná stránka (Matej 6.8.).
  if (dogs === null) return <PackLayout wide><HubSkeleton /></PackLayout>;
  if (dogs.length === 0) return <PackLayout wide><style>{HUB_CSS}</style><EmptyState /></PackLayout>;

  return (
    <PackLayout wide>
      <style>{HUB_CSS}</style>

      {/* ── 1 · PSY — každý pes VLASTNÝ gradientový blok ──────────────────────
             Bez nadpisu „My pack", bez počtu psov a bez „+ pridať psa"
             (Matej 6.8.: „ten sa pridáva na homepage"). */}
      <div className="flex flex-col gap-3">
        {dogs.map((dog) => (
          <DogBlock
            key={dog.id}
            dog={dog}
            latest={latest[dog.id]}
            total={totalSteps}
            t={t}
            tx={tx}
          />
        ))}
      </div>

      {/* ── 2 · PROFIL PSA — 6 dlaždíc ─────────────────────────────────────── */}
      <div style={{ marginTop: 20 }}>
        {/* „Čo chceš spraviť" padlo (Matej 6.8.: hlúpy nadpis) — sekcia sa menuje
            podľa toho, ČO to je, nie podľa otázky. */}
        <div className="text-center" style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 13, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: T.accentGold,
            }}
          >
            {tx('pack.hub.profileTitle', 'DOG ID')}
          </div>
          <div
            style={{
              fontFamily: FONT_UI, fontSize: 11.5, color: 'hsl(45 70% 90% / 0.5)', marginTop: 4,
            }}
          >
            {tx('pack.hub.profileSub', 'fill in what you know — it builds their DOG ID')}
          </div>
        </div>
        <div className="hub-tiles">
          {QUIZ_SECTIONS.filter((s) => s.kind === 'quiz').map((s) => (
            <ActionTile key={s.key} section={s} progress={sectionProgress[s.key]} tx={tx} />
          ))}
        </div>
      </div>

      {/* ── 3 · GALÉRIA + DENNÍK — vlastný TMAVÝ riadok mimo papyrusovej mriežky.
             Nie sú to polia pasu a nemajú progres, ktorý sa dá „dokončiť" —
             béžová pilulka im klamala stav (Matej 6.8.). ── */}
      <div className="hub-media" style={{ marginTop: 20 }}>
        {QUIZ_SECTIONS.filter((s) => s.kind === 'gallery' || s.kind === 'journal').map((s) => (
          <MediaTile key={s.key} section={s} tx={tx} />
        ))}
      </div>

      {/* ── 4 · KVÍZ (hero) — VŽDY, nezmizne po absolvovaní ──────────────────
             Do 21. 8. sa po dokončení scvrkol na úzky riadok POD šiestimi dlaždicami
             (Matej: „zmizol blok kde bol obrázok"). Hotový kvíz nie je odbavená
             položka — je to jediná cesta k výsledku, takže blok ostáva na mieste
             a mení sa len to, čo ponúka: vyplniť → pozrieť výsledok / spraviť znova.
             ⚠️ POZÍCIA: 22. 8. sa presunul spod psích blokov sem, TESNE NAD AINUBISA
             (Matej: „celý blok presun dolu nad blok ainubisa"). Zhora už stránku
             neotvára — prvé je psy, potom DOG ID, a kvíz stojí až pri výstupoch. */}
      {natureSection && latestLoaded && (
        <div style={{ marginTop: 20 }}>
          <NatureHero section={natureSection} dogs={dogs} latest={latest} tx={tx} />
        </div>
      )}

      {/* ── 5 · AINUBIS — VÝSTUP, nie vstup ────────────────────────────────── */}
      <div style={{ marginTop: 12 }}>
        <AinubisBlock tx={tx} />
      </div>

      {/* ── 6 · ŠTATISTIKY — posledný blok stránky (ročný heatmap) ─────────── */}
      <div style={{ marginTop: 20 }}>
        <DogStats />
      </div>
    </PackLayout>
  );
}

/** Nastaví veľkosť mena tak, aby PRESNE vyplnilo šírku obalu (a teda heroglyfu pod ním).
 *
 *  Prečo meranie a nie vzorec z počtu znakov: šírka znaku sa líši písmom aj abecedou.
 *  V ostrej databáze je `奥莉 (Aoli)` — čínske znaky Cinzel Decorative nemá, padajú na
 *  systémový font a sú ~2× širšie než latinka — a `BABY (МАЛЮК)` v cyrilike. Žiadny
 *  jeden koeficient tie tri prípady nepokryje.
 *
 *  Trik: šírka textu je LINEÁRNA k font-size, takže stačí jedno meranie pri referenčných
 *  100 px a z neho sa dopočíta výsledok — netreba iterovať ani binárne hľadať.
 *  Hranice `--fit-min` / `--fit-max` sa čítajú z CSS, aby breakpoint zostal na jednom
 *  mieste (v HUB_CSS), nie rozdvojený medzi CSS a JS.
 */
function useFitName(
  wrapRef: React.RefObject<HTMLDivElement>,
  textRef: React.RefObject<HTMLSpanElement>,
  text: string,
  /**
   * Signál na PREPOČET, nie vstup rovnice (2026-09-02). Keď sa heroglyf nepodarí načítať,
   * blok ho vymení za prázdnu kartušu — a rovnica musí bežať znova, lebo až vtedy pozná
   * pomer strán. `ResizeObserver` na to spoľahnúť nemožno: obe podoby glyfu majú rovnaké
   * CSS rozmery, takže výmena `<img>` za `<div>` nemusí zmeniť ani pixel.
   */
  retrigger?: unknown,
) {
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;

    let raf = 0;
    let alive = true;

    const fit = () => {
      if (!alive) return;

      // 1 · REFERENČNÁ ŠÍRKA. Doteraz ju meral progresbar (`.dogblk-prog`), lebo pravý
      // okraj glyfu mal sedieť na jeho hrane. Progresbar 12.8. zanikol — meria sa teda
      // samotný riadok mínus lišta s posterom:
      //     availW = šírka `.dogblk` − šírka `.dogblk-rail` − medzera
      // ⚠️ Toto NIE JE kruh, hoci sa meria súrodenec: lišta má šírku danú posterom a
      // pilulkou s pevným `min-width`, teda ničím, čo by záviselo od fotky alebo mena.
      // Keby jej šírku určoval obsah premenlivej dĺžky, vrátila by hodnotu, ktorú sama
      // spôsobila — a blok by sa opäť „nejak divne správal".
      const main = wrap.parentElement;
      const row = (main?.parentElement ?? null) as HTMLElement | null;
      const card = main?.closest('.dogblk-card');
      const rail = row?.querySelector('.dogblk-rail') as HTMLElement | null;
      // Obal sa neoreže — jeho šírku nastavuje rovnica nižšie explicitne.
      wrap.style.maxWidth = 'none';

      // Zo šírky sa počíta všetko ostatné, lebo výška oboch prvkov je jej úmerná:
      // glyf má pevný pomer strán, meno vypĺňa šírku obalu.

      const photo = card?.querySelector('.dogblk-photo') as HTMLElement | null;
      const glyph = wrap.querySelector('.dogblk-glyph') as HTMLElement | null;
      // Placeholder je <div>, nie <img> — nemá `naturalWidth`, pomer strán mu drží CSS.
      const glyphImg = glyph instanceof HTMLImageElement ? glyph : null;

      const target = wrap.clientWidth;
      if (!target) return;
      const cs = getComputedStyle(wrap);
      const min = parseFloat(cs.getPropertyValue('--fit-min')) || 14;
      const max = parseFloat(cs.getPropertyValue('--fit-max')) || 200;

      // 2 · VEĽKOSŤ MENA = vyplniť šírku obalu, teda šírku heroglyfu. Jedno pravidlo pre
      // všetky šírky okna. Predtým tu bol ešte strop odvodený od výšky ľavého stĺpca a
      // ten robil z bloku hádanku: pri jednej šírke okna meno glyf vyplnilo, pri inej
      // bolo tretinové, lebo strop závisel od výšky glyfu, tá od šírky a tá od okna
      // (Matej 7.8.: „nejak divne sa to správa… je to horšie ako to bolo predtým").
      // Cena: pri krátkom mene (ADA, MIA, JOY) je písmo veľké a blok o niečo vyšší.
      // Vedomá voľba — Matej si vybral „všetky mená rovnako široké".

      // ⚠️ Meria sa cez `Range`, NIE cez `scrollWidth`. `scrollWidth` nikdy nevráti menej
      // než `clientWidth`, takže len čo je text užší než obal (široké okno), vráti šírku
      // OBALU — podiel vyjde 1 a font zamrzne na referenčných 100 px. Presne takto ostalo
      // meno na 1150 aj 1440 px menšie, než malo byť, kým na úzkych šírkach sedelo.
      // `nowrap` musí zostať: Range po zalomení vráti šírku najširšieho RIADKU.
      const prevWhite = el.style.whiteSpace;
      el.style.whiteSpace = 'nowrap';
      el.style.fontSize = '100px';
      const range = document.createRange();
      range.selectNodeContents(el);
      const perPx = range.getBoundingClientRect().width / 100;
      // Pomer riadkovania sa ČÍTA pri referenčných 100 px, nie hádže z CSS — keby sa
      // `line-height` v štýloch zmenil, strop výšky by sa inak ticho rozišiel.
      const lhRatio = (parseFloat(getComputedStyle(el).lineHeight) || 102) / 100;
      range.detach?.();
      el.style.whiteSpace = prevWhite;

      if (!perPx) return;

      // 3 · GEOMETRIA SA RIEŠI ROVNICOU, nie iteráciou (Matej 8.8., 3. kolo). Zadanie:
      // „na pc to vyzerá divne, tu by sme mohli vyskúšať dať foto meno a hero vedľa seba
      // (aby to spolu bolo na šírku progresparu)" + na mobile „tu fotku zvačši aby bola
      // na výšku vedlajšieho obsahu".
      //
      // Spoločné pre obe rozloženia: fotka + medzera + obal(meno, glyf) = ŠÍRKA PROGRESBARU.
      // Neznáma sa dopočíta priamo, lebo všetky rozmery sú na sebe lineárne závislé:
      // meno má šírku `perPx × veľkosť písma`, glyf pevný pomer strán. Keby sa to meralo
      // po vykreslení, fotka by menila šírku ľavého stĺpca, tá šírku obalu, tá veľkosť
      // písma a to zas výšku fotky — čiže presne ten kruh, po ktorom sa to „nejak divne
      // správalo". Rovnica ho obchádza: nič sa nemeria po tom, čo sa niečo nastavilo.
      // ⚠️ 721px MUSÍ sedieť s hranicou v HUB_CSS (`max-width:720px` = mobil,
      // `min-width:721px` = PC riadok). Kým tu bolo 900 a v CSS 720, vzniklo medzi nimi
      // pásmo bez pravidiel: CSS dalo stĺpcové rozloženie, JS počítal mobilnou rovnicou,
      // ale so stropom písma 200px z desktopu — meno vyskočilo a zalomilo sa na „HEKTHO/R"
      // (Matej 8.8.: „pri shrinku sa to správa divne"). Dva breakpointy = dve pravdy.
      const wide = typeof window !== 'undefined'
        && window.matchMedia('(min-width:721px)').matches;
      // ⚠️ Pri <img> ostáva 0, kým sa obrázok nenačíta — vtedy sa MÁ počkať (rovnica by
      // inak bežala s hádaným pomerom a meno by po doskočení glyfu poskočilo). Pri
      // placeholderi sa čakať nedá na čo, tam ide pevný pomer rovno.
      const ratio = glyphImg
        ? (glyphImg.naturalWidth && glyphImg.naturalHeight
          ? glyphImg.naturalWidth / glyphImg.naturalHeight
          : 0)
        : (glyph ? GLYPH_RATIO : 0);
      const idwGap = parseFloat(cs.rowGap) || parseFloat(cs.columnGap) || 0;
      const rowGapPx = row ? (parseFloat(getComputedStyle(row).columnGap) || 0) : 0;
      // ⚠️ RESET LIŠTY MUSÍ BYŤ PRED JEJ MERANÍM. Na mobile jej nižšie nastavíme šírku,
      // takže keby sa merala aj s ňou, vrátila by hodnotu, ktorú sme sami spôsobili — a pri
      // každom prekreslení by narástla. Meria sa teda jej PRIRODZENÁ šírka, ktorú drží
      // poster (alebo pilulka s min-width, ak je širšia).
      // ⚠️ Posterovi sa inline štýl NESMIE mazať — vlastní ho React (width:auto +
      //    height:var(--poster-h)). Keď sa vyčistil, img stratil rozmer, natiahol sa na
      //    šírku lišty a rástol s ňou pri každom prekreslení (84×95 namiesto 69×78).
      if (rail) rail.style.width = '';
      const railW = rail ? rail.getBoundingClientRect().width : 0;
      const availW = row
        ? Math.max(0, row.clientWidth - railW - (railW ? rowGapPx : 0))
        : 0;

      // Reset pred výpočtom — inak by vstupom bol vlastný predošlý výsledok.
      if (photo) { photo.style.width = ''; photo.style.height = ''; }
      if (glyph) { glyph.style.width = ''; glyph.style.height = ''; }
      if (main) main.style.marginLeft = '';
      wrap.style.columnGap = '';

      let fitTo = wrap.clientWidth || target;

      if (availW > 0 && ratio > 0) {
        if (wide) {
          // PC — fotka · meno · glyf VEDĽA SEBA. Kotvou je výška GLYFU (G), ostatné dve
          // sú jej násobky, aby sa dali ladiť bez prepisovania rovnice (Matej 8.8., 4. kolo:
          // „PC = zvačši foto a zmenši meno"). Rovnica šírky:
          //   PHOTO_K·G + medzera + perPx·(NAME_K·G/lhRatio) + medzera + G·pomer = availW
          const G = (availW - 2 * rowGapPx)
            / (PHOTO_K + (perPx * NAME_K) / lhRatio + ratio);
          if (G > 30) {
            const photoPx = Math.round(G * PHOTO_K);
            const glyphH = Math.round(G * GLYPH_K);
            const fs = Math.max(min, Math.min(max, (G * NAME_K * TEXT_K) / lhRatio));
            const nameW = perPx * fs;
            const glyphW = glyphH * ratio;
            // TEXT_K a GLYPH_K zmenšujú meno a glyf, ale pravý okraj glyfu má ostať NA
            // OKRAJI PROGRESBARU (Matej 8.8.). Uvoľnené miesto preto ide do medzier —
            // rozdelí sa na dve rovnaké, takže „totožný rozostup" platí ďalej.
            const gap = Math.max(rowGapPx, (availW - photoPx - nameW - glyphW) / 2);
            if (photo) { photo.style.width = `${photoPx}px`; photo.style.height = `${photoPx}px`; }
            if (glyph) { glyph.style.height = `${glyphH}px`; glyph.style.width = 'auto'; }
            // Medzeru fotka↔meno nemožno riešiť cez `.dogblk` gap — ten rozostupuje aj
            // stĺpec pilulek. Preto sa posúva len stredný stĺpec.
            if (main) main.style.marginLeft = `${Math.round(gap - rowGapPx)}px`;
            wrap.style.maxWidth = 'none';
            wrap.style.columnGap = `${Math.round(gap)}px`;
            wrap.style.width = `${Math.round(nameW + gap + glyphW)}px`;
            el.style.fontSize = `${fs}px`;
            return;
          }
        } else {
          // ── MOBIL — meno NAD glyfom ────────────────────────────────────────────
          // Matej 12.8., 4. kolo: „rozdelené na 3 stĺpce, fotka väčšia a začína na ľavej
          // strane, DOG ID na pravej."
          //
          // Fotka sa POČÍTA, nemeria: jej vstupom je `availW`, čo je šírka riadka mínus
          // lišta — teda hodnota, ktorú fotka sama neovplyvňuje. Kruh sa tak nezavrie.
          // Merať ju (ako doteraz `getBoundingClientRect`) by po pridaní vlastného
          // rozmeru znamenalo čítať vlastný predošlý výsledok.
          const photoPx = Math.round(Math.min(
            MOBILE_PHOTO_MAX,
            Math.max(MOBILE_PHOTO_MIN, availW * MOBILE_PHOTO_K),
          ));
          if (photo) { photo.style.width = `${photoPx}px`; photo.style.height = `${photoPx}px`; }
          const free = availW - photoPx - rowGapPx;
          // Dvojica meno+glyf berie CELÝ zvyšok, kým nenarazí na strop. Nad stropom sa
          // uvoľnené miesto rozdelí do dvoch medzier (`justify-content:space-between`),
          // takže fotka ostane na ľavej hrane a lišta na pravej.
          const W = Math.min(free, MOBILE_MAX_IDW);
          if (W > 40) {
            wrap.style.maxWidth = 'none';
            wrap.style.width = `${Math.round(W)}px`;
            // ⚠️ `W - 1`, nie `W`: pri presnom podiele vyjde text o zlomok bodu širší
            // než obal, zalomí sa a meno sa opticky zmenší na polovicu.
            el.style.fontSize = `${Math.max(min, Math.min(max, (W - 1) / perPx))}px`;
            return;
          }
        }
      }

      // Záloha, kým nie je načítaný glyf (nepoznáme pomer strán): meno vyplní obal tak
      // ako doteraz. Po načítaní obrázka sa `fit()` spustí znova cez ResizeObserver.
      wrap.style.width = '';
      // ⚠️ `fitTo - 1`, nie `fitTo`: pri presnom podiele vyjde šírka o zlomok bodu
      // väčšia než obal, text sa zalomí a meno sa opticky ZMENŠÍ na polovicu. Presne
      // takto padli `奥莉 (Aoli)` aj `BABY (МАЛЮК)`.
      fitTo = wrap.clientWidth || target;
      el.style.fontSize = `${Math.max(min, Math.min(max, (fitTo - 1) / perPx))}px`;
    };

    fit();
    // Fonty prichádzajú po prvom vykreslení — bez tohto sa meria systémový fallback
    // a meno po doskočení Cinzelu vyskočí z rámca.
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    });
    ro.observe(wrap);
    // Aj na lištu: keď sa zmení jej šírka (iný jazyk v slove DOG ID, dlhšie percento),
    // zmení sa dostupná šírka riadka a rovnica musí prebehnúť znova.
    const cardEl = wrap.parentElement?.closest('.dogblk-card');
    const railEl = cardEl?.querySelector('.dogblk-rail');
    if (railEl) ro.observe(railEl);
    // Aj na celý riadok: jeho šírka je vstup rovnice.
    const rowEl = cardEl?.querySelector('.dogblk');
    if (rowEl) ro.observe(rowEl);
    return () => { alive = false; ro.disconnect(); cancelAnimationFrame(raf); };
  }, [wrapRef, textRef, text, retrigger]);
}

// ── 1 · psí blok ─────────────────────────────────────────────────────────────
function DogBlock({
  dog, latest, total, t, tx,
}: {
  dog: HubDog;
  latest: Record<string, LatestValue> | undefined;
  total: number;
  t: (k: string, p?: Record<string, string | number>) => string;
  tx: Tx;
}) {
  const idwRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  /**
   * ⚠️ NENAČÍTANÝ GLYF ROZBÍJAL ROVNICU (oprava 2026-09-02, Matej odklepol 2. 9.).
   * Pes BEZ glyfu ošetrený bol (prázdna kartuša + `GLYPH_RATIO`), ale pes, ktorého glyf
   * sa načítať NEPODARÍ (404, výpadok CDN, nedorenderovaný obrázok), držal `naturalWidth`
   * na nule ⇒ `ratio = 0` ⇒ rovnica sa nespustila NIKDY a meno ostalo v štartovacej
   * veľkosti, roztiahnuté cez celý riadok. Zlyhaný obrázok sa preto vymení za tú istú
   * prázdnu kartušu, akú dostane pes bez glyfu — geometria bloku sa tým nemení.
   * Pre psa s načítaným glyfom sa nemení NIČ: `onError` sa nespustí.
   */
  const [glyphBroken, setGlyphBroken] = useState(false);

  const filled = PROGRESS_STEPS.filter((s) => hasValue(latest?.[s.field])).length;
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const name = (dog.dog_name || '').toUpperCase();
  // ⚠️ `dogs.country` je ISO3 („SVK"), NIE ISO2 — flagcdn chce ISO2, inak vráti 404
  // a krúžok ostane prázdny. Rovnaký prevod robí karta psa cez `countryISO2()`.
  const iso2 = countryISO2(dog.country || '') || 'sk';

  // Dni = VEK PSA (`selections.birthday*`), nie čas s majiteľom. Keď dátum chýba,
  // pilulka sa nevykreslí — lock „nič sa nedogeneruje", žiadny odhad veku.
  const life = dogLifeLine(dog);

  useFitName(idwRef, nameRef, name, glyphBroken);

  const roleKey = latest?.['nature.role']?.value;
  const elementKey = latest?.['nature.element']?.value;
  // ⚠️ Cez `storedSpecials`, NIE priamo z DB. Blok si pole číta sám (nejde cez
  // `natureResultFromStored`), takže bez tohto kroku ukazuje aj štyri zvláštne úlohy
  // psom, ktorí kvíz prešli pred stropom z 22. 8. — presne to tu 22. 8. bolo vidieť.
  const specials = storedSpecials(
    latest?.['nature.specials']?.value,
    (latest?.['nature.scores']?.value as { spec?: Record<string, number> } | undefined)?.spec,
  );

  // Osobnosť (tagy povahy z `temperament.tags`) sa v psom bloku UŽ NEUKAZUJE —
  // Matej 8.8.: „vymaž posledné dva pils (plachy, pokojny)". Dáta ostávajú v
  // `dog_events` a na karte psa, zmizli len pilulky tu.

  const label = (field: string, key: unknown): string | null => {
    if (typeof key !== 'string' || !key) return null;
    const v = STEP_BY_FIELD[field]?.valueLabels?.[key];
    return v ? tx(v.i18n, v.labelEN) : null;
  };
  const roleLabel = label('nature.role', roleKey);
  const elementLabel = label('nature.element', elementKey);
  // PREFIX „Special role:" PADOL (Matej 22.8.: „nebudeme písať special role ale pomenujeme
  // ju priamo"). Pôvodný lock ho žiadal proti zrážke s tagom povahy `loner` („Samotár“) —
  // tá tu už nehrozí z dvoch strán naraz: tagy povahy sa v psom bloku nevykresľujú od
  // 8. 8. a `valueLabels` v `dogQuiz.ts` prekladá kľúč na „The Loner", nie na „Samotár".

  const days = life.days === null
    ? null
    : t('pack.tree.daysUnit', { days: life.days.toLocaleString('en-US') });

  // Rad pilulek POD MENOM (Matej 12.8.: „pils čo sú pod to premiestni vedľa aby začínali
  // pod menom psa nie pod foto — ušetríme priestor"). Predtým to bol zvislý stĺpec vpravo
  // so stropom 4 položky; vodorovný rad zalamuje, takže strop odpadol.
  // ⚠️ `#poradové číslo` tu UŽ NIE JE — presunulo sa na kruh fotky (`.dogblk-num`), aby
  // nebolo v bloku dvakrát.
  const pills = [
    days ? <Pill key="days" solid>{life.isAngel ? `🕊 ${days}` : days}</Pill> : null,
    <Pill key="country">
      <FlagCircle iso2={iso2} label={iso2.toUpperCase()} size={13} />
      {iso2.toUpperCase()}
    </Pill>,
    roleLabel ? <Pill key="role">{roleLabel}</Pill> : null,
    elementLabel ? <Pill key="el">{elementLabel}</Pill> : null,
    ...specials.map((k) => {
      const l = label('nature.specials', k);
      return l ? <Pill key={k} dashed>{l}</Pill> : null;
    }),
  ].filter(Boolean);

  // Progres = pilulka v lište, tri stavy (Matej 12.8.). Slovo je len pri 100 %; ostatné
  // stavy sú holé percento, aby nad posterom nestáli dva druhy nápisu.
  // ⚠️ Menovateľ je `PROGRESS_STEPS.length` (dnes 34) — to isté číslo, aké ukazuje karta
  // psa. Rastie SÁM, keď do kvízu pribudne pole; nikde sa nezapisuje ručne. Preto
  // percento a nie zlomok: „23/34" znamená po rozšírení kvízu zakaždým niečo iné.
  const fillDone = total > 0 && filled >= total;
  const fillClass = fillDone ? ' is-done' : (pct <= 0 ? ' is-zero' : '');
  const fillText = fillDone ? tx('pack.hub.passComplete', 'Complete') : `${pct}%`;

  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="hub-hover dogblk-card"
      style={{
        // PAPYRUS (Matej 12.8.: „switchneme to bledého bloku, nie gradient ale papyrus").
        // Hodnoty sú z locku 2026-07-26, zdroj pravdy `Entry.tsx` / `packTheme.ts` —
        // NIE plochá biela so šedým hairlinom.
        display: 'block', textDecoration: 'none',
        background: T.cardGrad,
        borderRadius: 16,
        border: `1.5px solid ${T.cardEdge}`,
        boxShadow: T.cardShadow,
      }}
    >
      {/* Tri stĺpce: fotka · (meno+glyf nad pilulkami) · lišta s posterom. */}
      <div className="dogblk">
        {/* Stĺpec 1 — fotka s poradovým číslom na kruhu. */}
        <div className="dogblk-left">
          {dog.cloudinary_main_url ? (
            <img className="dogblk-photo" src={dog.cloudinary_main_url} alt="" />
          ) : (
            <div
              className="dogblk-photo"
              style={{
                background: 'rgba(201,154,63,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <BrandIcon name="paw" size={36} tint="gold" />
            </div>
          )}
          {dog.pack_number !== null && (
            <span className="dogblk-num">{`#${dog.pack_number}`}</span>
          )}
        </div>

        {/* Stĺpec 2 — meno + heroglyf, pod nimi rad pilulek. */}
        <div className="dogblk-main">
          {/* Meno a heroglyf v jednom obale = rovnaká šírka. `--len` je dĺžka mena,
              z nej si CSS dopočíta štartovaciu veľkosť písma, kým nezmeria useFitName. */}
          <div ref={idwRef} className="dogblk-idw" style={{ '--len': Math.max(name.length, 3) } as React.CSSProperties}>
            <span
              ref={nameRef}
              className="dogblk-name"
              style={{
                // Čierny inkoust na papyruse (Matej 12.8.), nie svetlé písmo s tieňom.
                fontFamily: NAME_FONT, fontWeight: 700, color: T.inkStrong,
              }}
            >
              {name}
            </span>

            {/* Heroglyf ostáva ČIERNY — filter na zlato zanikol spolu s tmavým pozadím.
                Bez glyfu sa kreslí prázdna kartuša rovnakého tvaru — miesto si drží vždy,
                nech blok nemá dve rôzne geometrie podľa toho, či sa render podaril. */}
            {dog.heroglyph_png_url && !glyphBroken ? (
              <img
                className="dogblk-glyph"
                src={dog.heroglyph_png_url}
                alt=""
                aria-hidden
                onError={() => setGlyphBroken(true)}
              />
            ) : (
              <div className="dogblk-glyph dogblk-glyph--empty" aria-hidden />
            )}
          </div>

          <div className="dogblk-pills">{pills}</div>
        </div>

        {/* Stĺpec 3 — lišta: progres · poster · DOG ID. Nahradila spodný riadok
            s progresbarom a zlatým CTA (Matej 12.8.: „DOG ID CTA zmizne a nahradí ho
            iba ikonka dog poster"). Nie je to <button>: celý blok je <Link>. */}
        <div className="dogblk-rail">
          <span className={`dogblk-fill${fillClass}`}>{fillText}</span>
          <BrandIcon
            name="dogposter"
            size={78}
            tint="dark"
            className="dogblk-poster"
            style={{ width: 'auto', height: 'var(--poster-h, 78px)' }}
          />
          <span className="dogblk-railcap">{tx('pack.hub.profileTitle', 'DOG ID')}</span>
        </div>
      </div>
    </Link>
  );
}

/** Pilulka v psom bloku — vzor = badge rad v `HeroCard.tsx`.
 *  ⚠️ Od 12.8. leží na PAPYRUSE, nie na tmavom gradiente: farby sú preto inkoustové
 *  (`T.inkStrong` / `T.inkWarm`) a nie svetlé. Keby tu ostali staré `#F7EFDD`, text by
 *  na bledom podklade zmizol.
 *  `mono` = poradové číslo. V psom bloku sa UŽ NEPOUŽÍVA (číslo sedí na kruhu fotky),
 *  variant ostáva pre prípad ďalšieho číselného údaja.
 *  `solid` = vyfarbená zlatá (dni — Matej 7.8. „DNI pils vyfarbi"). Jediný údaj v bloku,
 *  ktorý rastie každý deň, takže má niesť farbu; ostatné pilulky sú tiché. Zlatá pilulka
 *  je locknutá naprieč appkou, papyrus sa jej NETÝKA.
 *  ⚠️ Rozmery sú v triede .dogblk-pill, nie tu — inline štýl by ju prebil a mobil
 *  by sa nezmenšil. */
function Pill({ children, dashed = false, mono = false, solid = false }: {
  children: React.ReactNode; dashed?: boolean; mono?: boolean; solid?: boolean;
}) {
  const bg = solid
    ? DAYS_PILL.background
    : (dashed ? 'transparent' : T.tileBg);
  return (
    <span
      className={`dogblk-pill${solid ? ' dogblk-days' : ''}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        borderRadius: 999, textAlign: 'center',
        background: bg,
        border: solid ? 'none' : `1px solid ${dashed ? 'rgba(179,130,45,0.6)' : T.border}`,
        borderStyle: dashed ? 'dashed' : 'solid',
        fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : FONT_TITLE,
        fontWeight: 700,
        textTransform: solid ? 'none' : 'uppercase',
        lineHeight: solid ? 1.1 : 1.25,
        letterSpacing: solid ? DAYS_PILL.letterSpacing : undefined,
        boxShadow: solid ? DAYS_PILL.boxShadow : undefined,
        color: solid ? DAYS_PILL.color : (dashed ? T.inkWarm : (mono ? '#8a5a12' : T.inkStrong)),
      }}
    >
      {children}
    </span>
  );
}

// ── 2 · kvíz ako hero — JEDEN BLOK, DVA STAVY ────────────────────────────────
// A · nikto z psov ho nemá → pozvánka do kvízu (celá karta je odkaz).
// B · aspoň jeden pes výsledok má → k pozvánke pribudne cesta k výsledku; keď ho
//     majú všetci, pozvánka sa mení na dvojicu POZRIEŤ VÝSLEDOK / SPRAVIŤ ZNOVA.
// ⚠️ V stave B je koreň <div>, nie <Link> — dve akcie v karte-odkaze by boli
// vnorené <a> (neplatné HTML). Klikateľná celá karta preto ostáva len v stave A,
// kde je jediná akcia.
function NatureHero({
  section, dogs, latest, tx,
}: {
  section: QuizSection; dogs: HubDog[]; latest: Latest; tx: Tx;
}) {
  const solo = dogs.length === 1;
  const missing = dogs.filter((d) => !hasValue(latest[d.id]?.[NATURE_FIELD]));
  const withResult = dogs.filter((d) => hasValue(latest[d.id]?.[NATURE_FIELD]));
  const allDone = dogs.length > 0 && missing.length === 0;
  // Solo → priamo na psa. Viac psov → kvíz sa vypĺňa za celú svorku naraz (§5),
  // takže sa žiadny pes v URL neuvádza a výber padne až v kvíze.
  const base = section.href ?? '/pack/nature';
  const href = solo ? `${base}?dog=${dogs[0].id}` : base;
  const resultHref = solo ? `${base}?dog=${dogs[0].id}&view=result` : `${base}?view=result`;

  const label = (field: string, key: unknown): string | null => {
    if (typeof key !== 'string' || !key) return null;
    const v = STEP_BY_FIELD[field]?.valueLabels?.[key];
    return v ? tx(v.i18n, v.labelEN) : null;
  };

  // Odpoveď do nadpisu — len pri jednom psovi a len keď je kvíz hotový.
  const soloAnswer = (() => {
    if (!allDone || !solo) return null;
    const role = label('nature.role', latest[dogs[0].id]?.['nature.role']?.value);
    const el = label('nature.element', latest[dogs[0].id]?.['nature.element']?.value);
    return role && el ? `${role} / ${el}` : null;
  })();

  const cardStyle = {
    background: T.cardGrad,
    border: `1.5px solid ${T.cardEdge}`,
    borderRadius: 16,
    boxShadow: T.cardShadow,
  } as const;

  const body = (
    <>
      {/* Stuha: človek musí vedieť, že ide vypĺňať KVÍZ, nie čítať článok.
          Po absolvovaní je zelená — tá istá zelená ako pilulka HOTOVO na dlaždiciach. */}
      <span className={`hub-ribbon${allDone ? ' is-done' : ''}`}>
        {allDone ? tx('pack.hub.done', 'Done') : tx('pack.hub.nature.ribbon', 'Quiz')}
      </span>

      {/* Ilustrácia = celé pozadie karty (štýl „vitráž"). Nie pruh vľavo — vitráž
          orezaná na 176 px sa nedala prečítať ako obraz. */}
      <img className="hub-hero-art" src={NATURE_ART} alt="" aria-hidden />

      <div className="hub-hero-body">
        {/* Eyebrow je NAD nadpisom, nie pod ním: na plagáte sa číta zhora nadol
            a nadpis musí sedieť čo najbližšie k chipom a CTA. */}
        <p
          style={{
            fontFamily: FONT_UI, fontWeight: 500, fontSize: 11.5, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#F5C73D', margin: '0 0 8px',
            textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          }}
        >
          {/* ⚠️ Pri HOTOVEJ svorke je eyebrow PRÁZDNY. „Your pack is" bola návestie
              k radu chipov s menami — a ten 22. 8. padol, takže by veta visela nad
              ničím. Pri sólo psovi ostáva, lebo odpoveď za ňu dopovie nadpis. */}
          {!allDone
            ? tx('pack.hub.nature.reveal', "You'll find out")
            : solo
              ? tx('pack.hub.nature.isNow', 'Your dog is')
              : ''}
        </p>

        <h3
          className="hub-hero-title"
          style={{
            fontFamily: FONT_TITLE, fontWeight: 700, lineHeight: 1.08,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFF6E2',
            // Bez radu chipov pod nadpisom si medzeru k tlačidlám musí urobiť nadpis sám.
            // Rad je preč pri sólo odpovedi v nadpise AJ pri hotovej svorke (od 22.8.) —
            // podmienka teda musí byť tá istá ako pri chipoch, inak nadpis dosadne na CTA.
            margin: (soloAnswer || allDone) ? '0 0 18px' : 0,
            textShadow: '0 4px 26px rgba(0,0,0,0.9)',
          }}
        >
          {/* Otázka na plagáte platí, kým je otázkou. Pri jednom psovi s hotovým
              kvízom by pod „TVOJ PES JE" stálo „KTO JE TVOJ PES?" — nadpis teda
              vystrieda ODPOVEĎ. Pri svorke to nejde (dve mená sa do titulku
              nezmestia), tam odpovedajú chipy pod ním. */}
          {soloAnswer ?? tx('pack.nature.intro.title', 'Who is your dog?')}
        </h3>

        {/* ⚠️ Dlhý popis sekcie (`section.subEN`) sa tu ZÁMERNE nezobrazuje — opakoval
            „18 otázok", ktoré stoja pri tlačidle (Matej 6.8.: „neopakuj sa").
            🔴 RAD CHIPOV S MENAMI A VÝSLEDKOM PADOL 22. 8. (Matej: „nebudú tam tie pils
            s menami a výsledkom"). Dovtedy sa po absolvovaní menil na „HEKTOR — Hlásateľ
            / Zem" — teda presne tú istú dvojicu, akú nesú pilulky v psom bloku hore na
            stránke, len druhým písmom. Tu ostáva LEN SĽUB, a ten platí, kým je čo
            odhaľovať: hneď ako majú kvíz všetky psy, rad zmizne úplne. */}
        {!soloAnswer && !allDone && (
          <div className="hub-axes">
            <RevealChip label={tx('pack.hub.nature.revealA', 'Role in the pack')} />
            <RevealChip label={tx('pack.hub.nature.revealB', 'Element by TCM')} />
          </div>
        )}

        {/* Pri viacerých psoch sa NEVYBERÁ pes — kvíz sa vypĺňa za všetkých naraz.
            Riadok len hovorí, koho sa to ešte týka. */}
        {!solo && missing.length > 0 && (
          <div
            style={{
              fontFamily: FONT_UI, fontSize: 11.5, color: 'rgba(255,246,226,0.72)',
              marginBottom: 14, textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {tx('pack.hub.nature.pending', 'Still missing')}:{' '}
            <strong style={{ fontFamily: NAME_FONT, fontWeight: 700, color: '#FFF6E2' }}>
              {missing.map((d) => (d.dog_name || '').toUpperCase()).join(' · ')}
            </strong>
          </div>
        )}

        {/* CTA. V stave A je zlaté tlačidlo <span> — odkazom je celá karta. Len čo
            je v karte druhá akcia, obe MUSIA byť <Link>, lebo koreň už odkaz nie je. */}
        <div className="hub-cta">
          {allDone ? (
            <>
              <Link to={resultHref} className="hub-gold is-big">
                {tx('pack.hub.nature.read', 'Read the results')}
              </Link>
              <Link to={href} className="hub-ghost">
                {tx('pack.hub.nature.retake', 'Take it again')}
              </Link>
            </>
          ) : (
            <>
              {withResult.length === 0 ? (
                <span className="hub-gold is-big">
                  {tx('pack.hub.nature.startBig', 'Find out who your dog is')}
                </span>
              ) : (
                <Link to={href} className="hub-gold is-big">
                  {tx('pack.hub.nature.startBig', 'Find out who your dog is')}
                </Link>
              )}
              {/* Rozrobená svorka: hotové psy majú výsledok už teraz a nesmú naň čakať,
                  kým doklikáš zvyšok. */}
              {withResult.length > 0 && (
                <Link to={resultHref} className="hub-ghost">
                  {tx('pack.hub.nature.read', 'Read the results')}
                </Link>
              )}
              <div
                style={{
                  fontFamily: FONT_UI, fontSize: 10.5, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'rgba(255,246,226,0.62)',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                }}
              >
                {tx('pack.hub.nature.meta', '18 questions · ~3 minutes')}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  // Celá karta je odkaz LEN kým je v nej jediná akcia (Matej 7.8.: „musí vyzerať
  // viac klikateľne"). S dvoma tlačidlami by z toho boli vnorené <a>.
  return withResult.length === 0
    ? <Link to={href} className="hub-hero hub-hover" style={cardStyle}>{body}</Link>
    : <div className="hub-hero" style={cardStyle}>{body}</div>;
}

/** Jedna z dvoch vecí, ktoré kvíz odhalí. Chip, nie dlaždica — veľké dlaždice so
 *  zamknutými slotmi zabrali pol karty a Matej ich zrušil ako „ohromné". */
function RevealChip({ label }: { label: string }) {
  return (
    <span className="hub-chip">
      {/* `lock.svg` v `public/icons/pack/` NEEXISTUJE — otáznik nesie to isté
          (odpoveď je za kvízom) a je v brand sade. */}
      <BrandIcon name="question" size={12} tint="gold" style={{ flex: '0 0 auto' }} />
      <b
        style={{
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 11.5, lineHeight: 1.2,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFF3DA',
        }}
      >
        {label}
      </b>
    </span>
  );
}

// ── 3 · dlaždica akcie (profil psa) ──────────────────────────────────────────
function ActionTile({
  section, progress, tx,
}: {
  section: QuizSection;
  progress?: { filled: number; total: number };
  tx: Tx;
}) {
  const p = progress ?? { filled: 0, total: 0 };
  const pill = p.total === 0 || p.filled === 0
    ? tx('pack.hub.notStarted', 'Not started')
    : p.filled >= p.total
      ? tx('pack.hub.done', 'Done')
      : `${p.filled} / ${p.total}`;
  const filledPill = p.total > 0 && p.filled >= p.total;

  return (
    <Link
      to={`/pack/dogs/quiz/${section.key}`}
      className="hub-hover"
      style={{
        background: T.panelGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 14,
        boxShadow: T.panelShadow,
        padding: '15px 13px',
        textAlign: 'left',
        display: 'block',
        textDecoration: 'none',
      }}
    >
      <div style={{ fontSize: 20, lineHeight: 1 }}>{section.emoji}</div>
      <h4
        style={{
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: T.inkStrong, margin: '9px 0 3px',
        }}
      >
        {tx(section.i18n, section.labelEN)}
      </h4>
      <p style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkWarm, margin: 0, lineHeight: 1.45 }}>
        {tx(section.subI18n, section.subEN)}
      </p>
      <span
        style={{
          display: 'inline-block', marginTop: 8, fontFamily: FONT_UI, fontSize: 9.5,
          letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 999, padding: '3px 9px',
          background: filledPill ? 'linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%)' : 'rgba(201,154,63,0.16)',
          border: `1px solid ${filledPill ? '#E69E1A' : 'rgba(179,130,45,0.5)'}`,
          color: filledPill ? '#241a06' : T.inkWarm,
        }}
      >
        {pill}
      </span>
    </Link>
  );
}

// ── 4 · galéria / denník — tmavá dlaždica, bez progresu ──────────────────────
// Nemajú vlastný flow (hromadný vstup s tagovaním psov). Dlaždica sa zobrazuje,
// ale nikam nevedie — inak by z mapy funkcií zmizli a nikto by si nevšimol, že chýbajú.
function MediaTile({ section, tx }: { section: QuizSection; tx: Tx }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        background: 'rgba(245,240,228,0.05)',
        border: `1px solid ${T.onDarkBorder}`,
        borderRadius: 14,
        padding: '15px 16px',
      }}
    >
      <div style={{ fontSize: 24, lineHeight: 1, flex: '0 0 auto' }}>{section.emoji}</div>
      <div style={{ minWidth: 0 }}>
        <h4
          style={{
            fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'hsl(45 75% 92%)', margin: '0 0 3px',
          }}
        >
          {tx(section.i18n, section.labelEN)}
        </h4>
        <p style={{ fontFamily: FONT_UI, fontSize: 11, color: T.onDarkDim, margin: 0, lineHeight: 1.45 }}>
          {tx(section.subI18n, section.subEN)}
        </p>
        <span
          style={{
            display: 'inline-block', marginTop: 6, fontFamily: FONT_UI, fontSize: 9.5,
            letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 999, padding: '3px 9px',
            background: 'rgba(245,240,228,0.07)', border: `1px solid ${T.onDarkBorder}`,
            color: T.onDarkDim,
          }}
        >
          {tx('pack.hub.soon', 'Soon')}
        </span>
      </div>
    </div>
  );
}

// ── 5 · AINUBIS ──────────────────────────────────────────────────────────────
// ⚠️ VEDOMÁ ODCHÝLKA OD BRAND v3.2. AINUBIS má naprieč appkou VLASTNÚ cyborg paletu:
// cyan `#5BE0F0` + modrá = STROJ, zlatá = ČLOVEK (Matej 2026-07-26: „základ modrý, ale
// prvky zlatej — modrý je AINUBIS a človek má zlaté interakcie"). Zdroj pravdy =
// hlavička `components/ainubis/AinubisWidget.css`. Papyrusová karta by tu bola chyba —
// blok by splynul so vstupnými dlaždicami a AINUBIS by prestal byť rozoznateľný ako AI.
//
// COMING SOON (Matej 6.8.): plán sa zatiaľ nestavia, preto tu NIE JE zlaté CTA —
// zlatá = interakcia človeka, a tá tu žiadna nie je. Odznak je technický, cyan.
function AinubisBlock({ tx }: { tx: Tx }) {
  return (
    <div
      className="flex items-center gap-4 flex-wrap"
      style={{
        padding: '18px 20px', borderRadius: 16,
        background: 'radial-gradient(circle at 22% 20%, #12233a 0%, #01050A 74%)',
        border: '1px solid rgba(91,224,240,0.28)',
        boxShadow: '0 0 0 4px rgba(59,158,255,0.05), 0 18px 44px -22px rgba(59,158,255,0.45)',
      }}
    >
      <img
        src={ainubisBadge}
        alt=""
        aria-hidden
        style={{
          width: 62, height: 62, objectFit: 'contain', borderRadius: '50%', flex: '0 0 auto',
          background: 'radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)',
          border: '1px solid rgba(91,224,240,0.35)',
          boxShadow: '0 0 0 5px rgba(59,158,255,0.06), 0 0 26px rgba(59,158,255,0.34)',
        }}
      />
      {/* Meno je NADPIS, nie drobný eyebrow (Matej 6.8.). Značka sa neprekladá. */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <h4
          style={{
            fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 28, lineHeight: 1,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E6FAFF', margin: 0,
            textShadow: '0 0 22px rgba(91,224,240,0.55)',
          }}
        >
          Ainubis
        </h4>
        <div
          style={{
            fontFamily: FONT_UI, fontWeight: 500, fontSize: 12.5, letterSpacing: '0.06em',
            color: '#5BE0F0', margin: '8px 0 6px',
          }}
        >
          {tx('pack.hub.ainubisTagline', 'your virtual pack member!')}
        </div>
        <p
          style={{
            fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55,
            color: 'rgba(230,250,255,0.62)', margin: 0, maxWidth: '52ch',
          }}
        >
          {tx(
            'pack.hub.ainubisBody',
            'A personal advisor made just for your dog — always at hand.',
          )}
        </p>
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 10,
          letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          color: '#5BE0F0', background: 'rgba(91,224,240,0.08)',
          border: '1px solid rgba(91,224,240,0.35)', borderRadius: 999, padding: '8px 16px',
        }}
      >
        {tx('pack.hub.soon', 'Soon')}
      </span>
    </div>
  );
}

// ── prázdne stavy ────────────────────────────────────────────────────────────
function HubSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            height: 132, borderRadius: 24, background: 'var(--brand-gradient)',
            border: '1px solid hsl(45 80% 60% / 0.28)', opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useT();
  const tx = (key: string, fallback: string) => { const v = t(key); return v === key ? fallback : v; };
  return (
    <div
      className="flex flex-col items-center text-center gap-4"
      style={{
        background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16, padding: '36px 24px', boxShadow: T.cardShadow,
      }}
    >
      <BrandIcon name="bone" size={30} tint="dark" />
      <p style={{ fontFamily: FONT_UI, fontSize: 14.5, lineHeight: 1.6, color: T.inkDim, margin: 0, maxWidth: 320 }}>
        {tx('pack.hub.empty', "No dog on your leash yet. Give one a heroglyph and it'll show up here.")}
      </p>
      <Link to="/heroglyph" className="hub-gold">
        {tx('pack.hub.emptyCta', 'Get a heroglyph')}
      </Link>
    </div>
  );
}
