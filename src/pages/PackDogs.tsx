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
import { readLatestForDogs, onDogEventsChange, hasValue, type LatestValue } from '@/lib/dogEvents';
import { dogLifeLine } from '@/lib/dogAge';
import { countryISO2 } from '@/lib/countryGeo';
import { supabase } from '@/integrations/supabase/client';
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
// rovnaké), nie do fotky — inak by sa glyf odlepil od okraja progresbaru.
const TEXT_K = 0.9;
const GLYPH_K = 0.95;

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
/* TRI ČASTI, na KAŽDEJ šírke rovnako (Matej 7.8., 2. kolo — mobil sa NESMIE
   preskupovať): 1 fotka · 2 meno + dni a POD tým heroglyf · 3 stĺpec piluliek
   pod sebou (krajina · #číslo · úloha · element · osobnosť). Mobil to isté, len
   menšie — preto tu nie je žiadna zmena grid-template-areas v media query.
   Šípka › zanikla: blok má byť na tri časti a celý je klikateľný. */
/* Tri stĺpce ako FLEX, nie grid s dvoma riadkami: „foto a počet dní má byť na výšku
   ako meno a heroglyph" (Matej 7.8.) sa robí align-items:stretch + space-between
   v strednom stĺpci. V dvojriadkovom gride sa dorovnať nedali — riadky sú spoločné
   pre všetky stĺpce, takže vyšší ľavý stĺpec nechal pod heroglyfom dieru. */
.dogblk{ display:flex; align-items:stretch; gap:18px; }
/* Od 8.8. je v ľavom stĺpci LEN fotka (pilulka s dňami odišla doprava ako prvá), takže
   šírku stĺpca určuje priamo fotka. Predtým tu bolo min-width:108/150px kvôli tomu, že
   „3,731 DNÍ" (≈100 px) je širšie než fotka — teraz by to isté min-width nechalo vedľa
   zmenšenej fotky prázdny pruh. */
.dogblk-left{
  flex:0 0 auto;
  display:flex; flex-direction:column; align-items:center; gap:9px;
}
/* Stred: meno TESNE nad heroglyfom, dvojica zarovnaná na spodok (Matej 7.8.: „meno je
   daleko od heroglyfu velka medzera"). flex-end, nie space-between — space-between
   rozhadzoval meno a glyf na opačné konce stĺpca a medzera rástla s tým, ako bol ľavý
   stĺpec vyšší. Spodná hrana glyfu tak stále sedí na spodnej hrane pilulky s dňami. */
.dogblk-main{
  flex:1 1 auto; min-width:0;
  display:flex; flex-direction:column; justify-content:flex-end;
}
/* Meno a glyf zdieľajú JEDEN obal so šírkou glyfu — tým je „šírka mena prispôsobená
   heroglyfu" (Matej). Obal je container, takže sa v ňom dá merať v cqw. */
/* Šírka obalu = šírka mena AJ heroglyfu naraz. Konkrétnu hodnotu nastavuje useFitName
   za behu tak, aby PRAVÝ OKRAJ glyfu sedel na pravom okraji progresbaru dole — na KAŽDEJ
   šírke rovnako, mobil aj PC. Predtým tu boli dve rôzne pravidlá (mobil calc(100% - 44px),
   PC pevných 380 px) a blok sa preto pri každej šírke správal inak.
   ⚠️ To 44px bola šírka tlačidla mínus šírka stĺpca piluliek — teda číslo závislé od
   DĹŽKY TEXTU v CTA. Keď sa „ŽIVOTOPIS" premenoval na kratšie „DOG ID", lemovanie sa
   rozišlo. Preto sa to už nepočíta ručne, ale meria. */
.dogblk-idw{
  width:100%;
  display:flex; flex-direction:column; gap:4px;
  /* Hranice veľkosti mena. Sú TU, nie v JS, aby breakpoint zostal jediný a v CSS;
     useFitName si ich prečíta cez getComputedStyle. Strop je zámerne vysoký — má
     brániť len absurditám, nie vypĺňaniu šírky. */
  --fit-min:24px; --fit-max:200px;
  container-type:inline-size;   /* len kvôli cqw fallbacku v .dogblk-name */
}
/* Veľkosť písma sa odvodzuje od POČTU ZNAKOV mena, nie je pevná: krátke meno by pri
   pevnej veľkosti nechalo pod sebou širokú medzeru, dlhé by pretieklo. --len posiela
   komponent, 0.86 je šírka znaku Cinzel Decorative v em s rezervou — ODMERANÉ v prehliadači
   cez Range (namerané 0.727–0.833 podľa mena, HEKTHOR presne 0.781). Pri 0.62 pretekali
   MAXIMILIÁN aj BARTOLOMEJKO; pri presnom 0.78 zas vzorec vrátil hraničnú veľkosť a meno
   sa o vlások zalamovalo na dva riadky. Koeficient teda musí byť NAD najširším menom,
   nie priemerom — inak je zalomenie pravidlo, nie výnimka. Strop drží meno v rozumnej veľkosti pri
   dvojpísmenových menách. Zalomenie je povolené zámerne: keby vzorec pri nejakom mene
   predsa nesedel, meno sa radšej zlomí do dvoch riadkov, než by vytieklo cez pilulky. */
/* Veľkosť písma nastavuje useFitName PRESNÝM meraním po vykreslení (Matej 7.8. si
   vybral presné meranie namiesto odhadu podľa počtu znakov). Hodnota nižšie je len
   štartovacia, aby meno pred prvým meraním neblikalo — odhad --len × 0.86 je zámerne
   podstrelený, teda skôr malé písmo než pretečené.
   ⚠️ Prečo meranie: odhad podľa počtu znakov nemôže sedieť naprieč písmami. V ostrej
   databáze sú 奥莉 (Aoli) (čínske znaky, Cinzel Decorative ich NEMÁ a padá na systémový
   font) aj BABY (МАЛЮК) (cyrilika) — tam je šírka znaku úplne iná než v latinke. */
.dogblk-name{
  font-size:clamp(24px, calc(100cqw / (var(--len,7) * 0.86)), 100px);
  line-height:1.02;
  /* Poistka: keby meranie zlyhalo, meno sa radšej zlomí, než pôjde cez pilulky. */
  overflow-wrap:anywhere;
}
.dogblk-photo{
  width:108px; height:108px; border-radius:50%; object-fit:cover; flex:0 0 auto;
  border:2px solid #C99A3F;
  box-shadow:0 0 0 4px rgba(201,154,63,0.16), 0 8px 22px rgba(0,0,0,0.5);
}
/* Keď glyf dostal celú šírku stĺpca, stred bloku narástol na ~286 px a fotka 108 px
   vedľa neho vyzerala ako miniatúra. Na širokom okne teda rastie aj ona.
   ⚠️ Tento blok musí stáť ZA .dogblk-photo — rovnaká špecificita, rozhoduje poradie
   v súbore. Nad ňou sa ticho neuplatní (stalo sa). */
/* ⚠️ 721px, NIE 900px. Hranica musí byť tá istá, akú používa useFitName — kým tu bolo 900
   a v mobilnej vetve 720, ostalo medzi nimi pásmo 721–899 bez pravidiel: rozloženie zostalo
   stĺpcové, ale strop písma platil desktopový, takže sa meno lámalo na „HEKTHO/R"
   (Matej 8.8.: „pri shrinku sa to správa divne"). */
@media (min-width:721px){
  .dogblk-photo{ width:150px; height:150px; }
  /* PC (Matej 8.8.): fotka · meno · glyf VEDĽA SEBA, spolu na šírku progresbaru.
     Na mobile ostáva meno NAD glyfom — preto je to media query, nie zmena základu.
     Konkrétne rozmery dopočíta useFitName, tu je len smer a zarovnanie. */
  .dogblk-idw{ flex-direction:row; align-items:center; }
  .dogblk-idw > .dogblk-name{ flex:0 0 auto; white-space:nowrap; }
  .dogblk-idw > .dogblk-glyph{ flex:0 0 auto; width:auto; }
  /* Výšku riadka určuje stĺpec pilulek, takže fotka aj dvojica meno+glyf sú od neho nižšie
     a musia sa v ňom VYCENTROVAŤ. Bez toho fotka visela na hornej hrane a pri zmenšovaní
     okna sa od obsahu odlepovala tým viac, čím menšia bola (Matej 8.8.: „prečo ide pri
     shrinku tá fotka takto hore"). .dogblk-main má v základe justify-content:flex-end
     — to je pravidlo pre MOBILNÉ rozloženie (spodná hrana glyfu lemuje pilulku), v riadku
     by ho tlačilo dole. */
  .dogblk-left{ justify-content:center; }
  .dogblk-main{ justify-content:center; }
  /* ⚠️ TIETO DVE HODNOTY MUSIA BYŤ ZHODNÉ (Matej 8.8.: „meno … aby z každej strany malo
     dostatočný a totožný rozostup od fotky aj heroglyfu"). Prvá je medzera fotka↔meno,
     druhá meno↔glyf — sú to dva RÔZNE flex kontajnery, takže sa nedajú zapísať raz.
     Obe si useFitName číta zo štýlu, čiže nikde inde v kóde zapísané nie sú. */
  .dogblk{ gap:22px; }
  .dogblk-idw{ gap:22px; }
}
/* Vnútorný odsadenie karty je TU, nie v inline štýle — inak by ho media query nižšie
   nemala ako prebiť. */
.dogblk-card{ padding:22px 24px; }
/* Úzke telefóny (iPhone SE 375, staršie 360): pri troch stĺpcoch ostávalo strednému
   90 px a meno sa lámalo na „HEKTH/OR" aj na spodnej hranici 18 px. Ustupuje všetko
   ostatné — odsadenie karty, fotka, stĺpec piluliek — meno a glyf nie. */
@media (max-width:430px){
  .dogblk-card{ padding:16px 14px; }
  .dogblk{ gap:8px; }
  .dogblk-left{ min-width:0; }
  .dogblk-photo{ width:56px; height:56px; }
  .dogblk-side{ flex-basis:68px; }
}
/* Stĺpec piluliek — šírka fotky (118 ≈ 108 + rám), pilulky pod sebou a na plnú
   šírku stĺpca, nie zarovnané na obsah (rad prvkov = rovnaké diely). */
.dogblk-side{ flex:0 0 102px; align-self:flex-start; display:flex; flex-direction:column; gap:7px; }
.dogblk-side > *{ width:100%; }
/* Rozmery pilulky žijú TU, nie v inline štýle komponentu — inline by triedu prebil
   a mobilné zmenšenie by ticho nezabralo. */
.dogblk-pill{ padding:5px 8px; font-size:9px; letter-spacing:.12em; }
/* Dni majú vlastnú veľkosť — sú to hlavné číslo bloku, nie tag. 13.5 px je hodnota
   z PackTree, aby bol ten istý údaj rovnako veľký aj rovnako farebný. */
.dogblk-days{ padding:4px 12px; font-size:13.5px; }
@media (max-width:720px){
  .dogblk-pill{ padding:4px 5px; font-size:8.5px; letter-spacing:.04em; }
  .dogblk-days{ padding:4px 10px; font-size:12px; }
}
/* Výzva na klik. Blok bol celý odkaz už predtým, ale nič to nehovorilo — vyzeral ako
   informačná karta (Matej 7.8.: „niekde musí byť ikonka, tlačítko … aby človek chcel
   kliknúť"). NIE je to <button>: celý blok je <Link>, takže by šlo o vnorený
   interaktívny prvok. Je to LEN vizuálna značka, klik obsluhuje blok. */
.dogblk-foot{ display:flex; align-items:center; gap:12px; margin-top:16px; }
.dogblk-prog{ flex:1 1 auto; min-width:0; }
/* PLNOFAREBNÉ HNEĎ, nie až po prejdení myšou (Matej 7.8.) — na dotykových zariadeniach
   hover neexistuje, takže výzva na klik viditeľná len pri hoveri je na mobile neviditeľná.
   Hodnoty = recept .btn-gold (LOCKED CTA), len menší rozmer. */
.dogblk-open{
  flex:0 0 auto; display:inline-flex; align-items:center; gap:7px;
  padding:9px 14px; border-radius:8px;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border:1px solid rgba(250,244,236,0.30);
  color:#000; font-family:'Cinzel',serif; font-weight:800;
  font-size:10px; letter-spacing:.14em; text-transform:uppercase; white-space:nowrap;
  box-shadow:0 0 22px rgba(230,158,26,0.30), inset 0 1px 0 rgba(255,255,255,0.3);
  transition:box-shadow .2s ease, transform .2s ease;
}
.hub-hover:hover .dogblk-open{
  box-shadow:0 0 40px rgba(230,158,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
  transform:translateX(2px);
}
/* Ikonka musí byť tmavá už v základnom stave — leží na zlate.
   Filter = presne tint 'dark' z BrandIcon.tsx (#5A3F12). */
.dogblk-open img{
  filter:brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%)
    hue-rotate(2deg) brightness(75%) contrast(90%);
}
@media (max-width:720px){
  .dogblk-foot{ gap:10px; margin-top:13px; }
  .dogblk-open{ padding:8px 11px; font-size:9px; letter-spacing:.1em; }
}
/* Heroglyf: zdrojový PNG má ČIERNE ťahy — bez prefarbenia je na tmavom neviditeľný.
   Recept 1:1 z components/gods/GodsGrid.tsx (.card-open-heroglyph / .dog-heroglyph).
   Šírku určuje obal .dogblk-idw (100 % stĺpca, strop 300 px na PC / 180 na mobile) —
   glyf aj meno tak majú VŽDY tú istú šírku. Strop je tam preto, aby glyf pri veľmi
   širokom okne neprerástol fotku a blok nezmenil proporcie. */
.dogblk-glyph{
  width:100%; height:auto; object-fit:contain; display:block;
  pointer-events:none;
  filter:
    brightness(0) invert(1)
    sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
    drop-shadow(0 0 14px rgba(201,154,63,0.95))
    drop-shadow(0 0 32px rgba(201,154,63,0.55));
}
/* Mobil = TIE ISTÉ tri stĺpce, len zmenšené. Rozpočet pri 390 px: 14 px padding
   bloku + 72 fotka + 10 + stred + 10 + 92 stĺpec ≈ zostáva ~140 px na heroglyf,
   preto tu má width:100% so stropom, nie pevných 200 px. */
@media (max-width:720px){
  /* 16, nie 10 — Matej 8.8.: „obsah (meno a hero) posuň od foto do prava trochu viac,
     je to moc nalepené". Číslo je zároveň vstup do rovnice v useFitName (číta sa
     zo štýlu, nie je nikde zapísané druhýkrát). */
  .dogblk{ gap:16px; }
  /* flex-basis fotky sa NEurčuje — jej rozmer dopočíta useFitName na výšku dvojice
     meno+glyf. Pevných 72 px by rovnicu prebilo a fotka by ostala malá. */
  .dogblk-side{ flex-basis:84px; }
  .dogblk-photo{ width:72px; height:72px; }
  .dogblk-left{ gap:7px; }
  .dogblk-idw{ --fit-min:14px; --fit-max:60px; }
  .dogblk-name{ font-size:clamp(14px, calc(100cqw / (var(--len,7) * 0.86)), 36px); }
  .dogblk-side{ gap:5px; }
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
  .hub-cta{ gap:10px; }
  .hub-ribbon{ top:16px; right:-58px; width:184px; font-size:9px; letter-spacing:.2em; }
}

/* ── kvíz kompaktne (stav B) ────────────────────────────────────────────────── */
.hub-done{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
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
      if (!uid) { if (alive) setDogs([]); return; }
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

  const natureSection = QUIZ_SECTIONS.find((s) => s.kind === 'scored');
  // Prepínanie hero ↔ kompaktný blok je AUTOMATICKÉ podľa dát: stačí jeden pes bez
  // kvízu a blok sa vráti hore ako hero (napr. keď pribudne nový pes).
  const natureAllDone =
    !!dogs && dogs.length > 0 && dogs.every((d) => hasValue(latest[d.id]?.[NATURE_FIELD]));

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

      {/* ── 2 · KVÍZ (hero) — len kým ho aspoň jeden pes NEMÁ ───────────────── */}
      {natureSection && latestLoaded && !natureAllDone && (
        <div style={{ marginTop: 20 }}>
          <NatureHero section={natureSection} dogs={dogs} latest={latest} tx={tx} />
        </div>
      )}

      {/* ── 3 · PROFIL PSA — 6 dlaždíc ─────────────────────────────────────── */}
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

      {/* ── 3b · KVÍZ (hotovo) — kompaktne POD dlaždicami, nech nezavadzia ──── */}
      {natureSection && latestLoaded && natureAllDone && (
        <div style={{ marginTop: 12 }}>
          <NatureDone section={natureSection} dogs={dogs} latest={latest} tx={tx} />
        </div>
      )}

      {/* ── 4 · GALÉRIA + DENNÍK — vlastný TMAVÝ riadok mimo papyrusovej mriežky.
             Nie sú to polia pasu a nemajú progres, ktorý sa dá „dokončiť" —
             béžová pilulka im klamala stav (Matej 6.8.). ── */}
      <div className="hub-media" style={{ marginTop: 20 }}>
        {QUIZ_SECTIONS.filter((s) => s.kind === 'gallery' || s.kind === 'journal').map((s) => (
          <MediaTile key={s.key} section={s} tx={tx} />
        ))}
      </div>

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
) {
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;

    let raf = 0;
    let alive = true;

    const fit = () => {
      if (!alive) return;

      // 1 · ŠÍRKA OBALU sa MERIA, nepočíta. Cieľ: pravý okraj heroglyfu sedí na pravom
      // okraji progresbaru dole — na každej šírke rovnako, mobil aj PC. Rozdiel medzi
      // tými dvoma koncami je „šírka tlačidla mínus šírka stĺpca piluliek", teda hodnota
      // závislá od TEXTU v CTA: ručné `calc(100% - 44px)` sa rozišlo v tej istej chvíli,
      // ako sa „ŽIVOTOPIS" premenoval na kratšie „DOG ID".
      const main = wrap.parentElement;
      const card = main?.closest('.dogblk-card');
      const prog = card?.querySelector('.dogblk-prog');
      if (main && prog) {
        wrap.style.maxWidth = 'none';
        const trim = main.getBoundingClientRect().right - prog.getBoundingClientRect().right;
        wrap.style.maxWidth = trim > 0 ? `calc(100% - ${Math.round(trim)}px)` : 'none';
      }

      // 1b · VÝŠKU BLOKU URČUJE STĹPEC PILULIEK (Matej 8.8.: „potrebujem docieliť to aby sa
      // celý blok zmenšil o priestor ktorý je medzi posledným pilom a CTA = foto pils meno
      // aj hero zmenši"). Pod pilulkami ostávala mŕtva plocha ~90 px, lebo výšku bloku
      // diktovala fotka (150 px) a dvojica meno+glyf, nie najkratší stĺpec. Miera je preto
      // `.dogblk-side` a VŠETKO ostatné sa doňho zmestí: fotka aj dvojica meno+glyf.
      //
      // ⚠️ `.dogblk-side` sa smie merať len preto, že má `align-self:flex-start` — teda
      // sa NEŤAHÁ na výšku najvyššieho stĺpca a jeho výška je daná len počtom pilulek.
      // Keby stretchoval (ako `.dogblk-left`), vracal by výšku, ktorú sám spôsobil,
      // a vznikol by kruh — presne ten, po ktorom sa to 7.8. „nejak divne správalo".
      //
      // Zo stropu výšky sa počíta strop ŠÍRKY obalu, lebo výška oboch prvkov je
      // úmerná šírke: glyf má pevný pomer strán, meno vypĺňa šírku obalu.
      const photo = card?.querySelector('.dogblk-photo') as HTMLElement | null;
      const glyph = wrap.querySelector('.dogblk-glyph') as HTMLImageElement | null;

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
      const ratio = glyph?.naturalWidth && glyph?.naturalHeight
        ? glyph.naturalWidth / glyph.naturalHeight
        : 0;
      const idwGap = parseFloat(cs.rowGap) || parseFloat(cs.columnGap) || 0;
      const rowGapPx = main ? (parseFloat(getComputedStyle(main.parentElement as HTMLElement).columnGap) || 0) : 0;
      const availW = prog ? prog.getBoundingClientRect().width : 0;

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
          //   PHOTO_K·G + medzera + perPx·(NAME_K·G/lhRatio) + medzera + G·pomer = progresbar
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
          // Mobil — meno NAD glyfom (stĺpec), fotka na výšku tej dvojice:
          //   výška dvojice = W·(lhRatio/perPx) + medzera + W/pomer
          //   fotka + medzera + W = šírka progresbaru
          const k = lhRatio / perPx + 1 / ratio;
          const W = (availW - rowGapPx - idwGap) / (1 + k);
          const photoH = Math.round(W * k + idwGap);
          if (W > 40 && photoH > 40) {
            if (photo) { photo.style.width = `${photoH}px`; photo.style.height = `${photoH}px`; }
            wrap.style.maxWidth = 'none';
            wrap.style.width = `${Math.round(W)}px`;
            // ⚠️ `W - 1`, nie `W`: pri presnom podiele vyjde text o zlomok bodu širší než
            // obal, zalomí sa a meno sa opticky zmenší na polovicu. Tu to chýbalo a meno
            // sa lámalo na „HEKTHO/R".
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
    // Aj na progresbar: keď sa zmení šírka tlačidla (iný jazyk, dlhší text), musí sa
    // prepočítať orezanie obalu — inak lemovanie ostane na starej hodnote.
    const cardEl = wrap.parentElement?.closest('.dogblk-card');
    const progEl = cardEl?.querySelector('.dogblk-prog');
    if (progEl) ro.observe(progEl);
    // Aj na stĺpec pilulek: on určuje výšku celého bloku, takže keď pribudne pilulka
    // (doplnený element, osobnosť z kvízu), musí sa prepočítať fotka aj dvojica meno+glyf.
    const sideEl = cardEl?.querySelector('.dogblk-side');
    if (sideEl) ro.observe(sideEl);
    return () => { alive = false; ro.disconnect(); cancelAnimationFrame(raf); };
  }, [wrapRef, textRef, text]);
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

  const filled = PROGRESS_STEPS.filter((s) => hasValue(latest?.[s.field])).length;
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const name = (dog.dog_name || '').toUpperCase();
  // ⚠️ `dogs.country` je ISO3 („SVK"), NIE ISO2 — flagcdn chce ISO2, inak vráti 404
  // a krúžok ostane prázdny. Rovnaký prevod robí karta psa cez `countryISO2()`.
  const iso2 = countryISO2(dog.country || '') || 'sk';

  // Dni = VEK PSA (`selections.birthday*`), nie čas s majiteľom. Keď dátum chýba,
  // pilulka sa nevykreslí — lock „nič sa nedogeneruje", žiadny odhad veku.
  const life = dogLifeLine(dog);

  useFitName(idwRef, nameRef, name);

  const roleKey = latest?.['nature.role']?.value;
  const elementKey = latest?.['nature.element']?.value;
  const specialsVal = latest?.['nature.specials']?.value;
  const specials = Array.isArray(specialsVal) ? (specialsVal as string[]) : [];

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
  // ⚠️ LOCK: zvláštna úloha sa NIKDY nevykresľuje ako holý chip — vždy s prefixom.
  // Bez neho sa „The Loner" zrazí s tagom povahy `loner` („Samotár“) na tej istej karte.
  const specialPrefix = tx('pack.nature.result.specialPrefix', 'Special role');

  const days = life.days === null
    ? null
    : t('pack.tree.daysUnit', { days: life.days.toLocaleString('en-US') });

  // Stĺpec 3: dni · krajina · #číslo · úloha · element · zvláštne úlohy — ale VYKRESLIA
  // SA LEN PRVÉ ŠTYRI („na pravo budú len 4 pils pod sebou", Matej 7.8.). Poradie je
  // teda zároveň prioritou.
  // Matej 8.8.: pilulka s DŇAMI je PRVÁ a sedí tu, nie v ľavom stĺpci pod fotkou —
  // ľavý stĺpec je odteraz len fotka. Tagy povahy (POKOJNÝ, PLACHÝ) sú zrušené.
  const pills = [
    days ? <Pill key="days" solid>{life.isAngel ? `🕊 ${days}` : days}</Pill> : null,
    <Pill key="country">
      <FlagCircle iso2={iso2} label={iso2.toUpperCase()} size={13} />
      {iso2.toUpperCase()}
    </Pill>,
    dog.pack_number !== null ? <Pill key="num" mono>{`#${dog.pack_number}`}</Pill> : null,
    roleLabel ? <Pill key="role">{roleLabel}</Pill> : null,
    elementLabel ? <Pill key="el">{elementLabel}</Pill> : null,
    ...specials.map((k) => {
      const l = label('nature.specials', k);
      return l ? <Pill key={k} dashed>{`${specialPrefix}: ${l}`}</Pill> : null;
    }),
  ].filter(Boolean).slice(0, 4);

  return (
    <Link
      to={`/pack/dogs/${dog.id}`}
      className="hub-hover dogblk-card"
      style={{
        display: 'block', textDecoration: 'none',
        background: 'var(--brand-gradient)',
        borderRadius: 24,
        border: '1px solid hsl(45 80% 60% / 0.28)',
        boxShadow: '0 20px 50px -22px rgba(40, 18, 60, 0.55)',
      }}
    >
      {/* Mriežka: fotka · meno + heroglyf pod ním · stĺpec piluliek (Matej 7.8.). */}
      <div className="dogblk">
        {/* Stĺpec 1 — LEN fotka (Matej 8.8.: dni sa presunuli do stĺpca piluliek vpravo,
            fotka sa o ich miesto zväčšila na výšku dvojice meno+heroglyf). */}
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
        </div>

        {/* Stĺpec 2, riadok 1: len MENO. Vlajka, #číslo a dni sa presunuli inam. */}
        <div className="dogblk-main">
          {/* Meno a heroglyf v jednom obale = rovnaká šírka. `--len` je dĺžka mena,
              z nej si CSS dopočíta veľkosť písma tak, aby meno šírku obalu vyplnilo. */}
          <div ref={idwRef} className="dogblk-idw" style={{ '--len': Math.max(name.length, 3) } as React.CSSProperties}>
            <span
              ref={nameRef}
              className="dogblk-name"
              style={{
                fontFamily: NAME_FONT, fontWeight: 700,
                color: 'hsl(45 75% 94%)', textShadow: '0 3px 14px rgba(0,0,0,0.55)',
              }}
            >
              {name}
            </span>

            {/* Svietiaci heroglyf — ten istý, čo je na walle a na dogpage (Matej 6.8.). */}
            {dog.heroglyph_png_url && (
              <img className="dogblk-glyph" src={dog.heroglyph_png_url} alt="" aria-hidden />
            )}
          </div>
        </div>

        {/* Stĺpec 3 — pilulky pod sebou. Ďalšie veci pribúdajú SEM. */}
        <div className="dogblk-side">{pills}</div>
      </div>

      <div className="dogblk-foot">
        <div className="dogblk-prog">
          <div style={{ height: 6, borderRadius: 999, background: 'rgba(245,240,228,0.14)', overflow: 'hidden', position: 'relative' }}>
            <i
              style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`,
                background: 'linear-gradient(90deg, #F5C73D, #E69E1A)',
                borderRadius: 999, display: 'block',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: FONT_UI, fontSize: 10.5, color: 'hsl(45 70% 90% / 0.6)',
              marginTop: 5, display: 'block',
            }}
          >
            {filled === total
              ? tx('pack.hub.passComplete', 'DOG ID complete')
              : `${tx('pack.hub.passProgress', 'DOG ID')} ${filled} / ${total}`}
          </span>
        </div>

        {/* Vizuálne tlačidlo, nie <button> — klik obsluhuje celý blok. */}
        <span className="dogblk-open" aria-hidden>
          <BrandIcon name="document" size={13} tint="gold" />
          {tx('pack.hub.openStory', 'DOG ID')}
          <span style={{ fontSize: 12, lineHeight: 1 }}>→</span>
        </span>
      </div>
    </Link>
  );
}

/** Pilulka v psom bloku — vzor = badge rad v `HeroCard.tsx`, len na tmavom podklade.
 *  `mono` = poradové číslo (čísla patria do mono, nie do Cinzelu).
 *  `solid` = vyfarbená zlatá (dni — Matej 7.8. „DNI pils vyfarbi"). Jediný údaj v bloku,
 *  ktorý rastie každý deň, takže má niesť farbu; ostatné pilulky sú tiché.
 *  ⚠️ Rozmery sú v triede .dogblk-pill, nie tu — inline štýl by ju prebil a mobil
 *  by sa nezmenšil. */
function Pill({ children, dashed = false, mono = false, solid = false }: {
  children: React.ReactNode; dashed?: boolean; mono?: boolean; solid?: boolean;
}) {
  const bg = solid
    ? DAYS_PILL.background
    : (dashed ? 'transparent' : 'rgba(201,154,63,0.20)');
  return (
    <span
      className={`dogblk-pill${solid ? ' dogblk-days' : ''}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        borderRadius: 999, textAlign: 'center',
        background: bg,
        border: solid ? 'none' : `1px solid ${dashed ? 'rgba(245,240,228,0.34)' : T.border}`,
        borderStyle: dashed ? 'dashed' : 'solid',
        fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : FONT_TITLE,
        fontWeight: 700,
        textTransform: solid ? 'none' : 'uppercase',
        lineHeight: solid ? 1.1 : 1.25,
        letterSpacing: solid ? DAYS_PILL.letterSpacing : undefined,
        boxShadow: solid ? DAYS_PILL.boxShadow : undefined,
        color: solid ? DAYS_PILL.color : (dashed ? 'hsl(45 70% 90% / 0.75)' : (mono ? '#F5C73D' : '#F7EFDD')),
      }}
    >
      {children}
    </span>
  );
}

// ── 2 · kvíz ako hero (aspoň jeden pes ho nemá) ──────────────────────────────
function NatureHero({
  section, dogs, latest, tx,
}: {
  section: QuizSection; dogs: HubDog[]; latest: Latest; tx: Tx;
}) {
  const solo = dogs.length === 1;
  const missing = dogs.filter((d) => !hasValue(latest[d.id]?.[NATURE_FIELD]));
  // Solo → priamo na psa. Viac psov → kvíz sa vypĺňa za celú svorku naraz (§5),
  // takže sa žiadny pes v URL neuvádza a výber padne až v kvíze.
  const href = solo ? `${section.href}?dog=${dogs[0].id}` : (section.href ?? '/pack/nature');

  return (
    <Link
      to={href}
      className="hub-hero hub-hover"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
      }}
    >
      {/* Stuha: človek musí vedieť, že ide vypĺňať KVÍZ, nie čítať článok. */}
      <span className="hub-ribbon">{tx('pack.hub.nature.ribbon', 'Quiz')}</span>

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
          {tx('pack.hub.nature.reveal', "You'll find out")}
        </p>

        <h3
          className="hub-hero-title"
          style={{
            fontFamily: FONT_TITLE, fontWeight: 700, lineHeight: 1.08,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFF6E2', margin: 0,
            textShadow: '0 4px 26px rgba(0,0,0,0.9)',
          }}
        >
          {tx('pack.nature.intro.title', 'Who is your dog?')}
        </h3>

        {/* ⚠️ Dlhý popis sekcie (`section.subEN`) sa tu ZÁMERNE nezobrazuje — opakoval
            „18 otázok", ktoré stoja pri tlačidle (Matej 6.8.: „neopakuj sa"). */}
        <div className="hub-axes">
          <RevealChip label={tx('pack.hub.nature.revealA', 'Role in the pack')} />
          <RevealChip label={tx('pack.hub.nature.revealB', 'Element by TCM')} />
        </div>

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

        {/* CTA + meta na jednom riadku. CTA je <span>, nie <a>: odkazom je celá karta. */}
        <div className="hub-cta">
          <span className="hub-gold is-big">
            {tx('pack.hub.nature.startBig', 'Find out who your dog is')}
          </span>
          <div
            style={{
              fontFamily: FONT_UI, fontSize: 10.5, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,246,226,0.62)',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}
          >
            {tx('pack.hub.nature.meta', '18 questions · ~3 minutes')}
          </div>
        </div>
      </div>
    </Link>
  );
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

// ── 3b · kvíz kompaktne (majú ho VŠETCI psi) ─────────────────────────────────
// ⚠️ Odkaz vedie na ČÍTANIE výsledku (`?view=result`), NIE na opakovanie kvízu.
// Popis úlohy, „najčastejšie nepochopenie" a „na čo dávať pozor" bolo doteraz
// vidieť jediný raz, tesne po dokončení — a potom sa k tomu nedalo vrátiť.
function NatureDone({
  section, dogs, latest, tx,
}: {
  section: QuizSection; dogs: HubDog[]; latest: Latest; tx: Tx;
}) {
  const solo = dogs.length === 1;
  const href = solo ? `${section.href}?dog=${dogs[0].id}&view=result` : `${section.href}?view=result`;

  const label = (field: string, key: unknown): string | null => {
    if (typeof key !== 'string' || !key) return null;
    const v = STEP_BY_FIELD[field]?.valueLabels?.[key];
    return v ? tx(v.i18n, v.labelEN) : null;
  };

  return (
    <Link
      to={href}
      className="hub-done hub-hover"
      style={{
        background: T.panelGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 14,
        boxShadow: T.panelShadow, padding: '13px 16px', textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: 19, lineHeight: 1 }}>{section.emoji}</span>
      <h4
        style={{
          fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: T.inkStrong, margin: 0,
        }}
      >
        {tx(section.i18n, section.labelEN)}
      </h4>
      {/* Zelená = HOTOVO. Precedens: `T.growGreen` (trend váhy) a legenda v DogStats. */}
      <span
        style={{
          fontFamily: FONT_UI, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          borderRadius: 999, padding: '4px 10px', whiteSpace: 'nowrap',
          background: '#2E7D4F', border: '1px solid #2E7D4F', color: '#F4F7F0',
        }}
      >
        {tx('pack.hub.done', 'Done')}
      </span>

      <span
        style={{
          flex: 1, minWidth: 160,
          fontFamily: FONT_UI, fontSize: 11.5, color: T.inkWarm, lineHeight: 1.5,
        }}
      >
        {dogs.map((d, i) => {
          const role = label('nature.role', latest[d.id]?.['nature.role']?.value);
          const el = label('nature.element', latest[d.id]?.['nature.element']?.value);
          return (
            <span key={d.id}>
              {i > 0 && <span style={{ color: T.cardEdge }}>{'  ·  '}</span>}
              <strong style={{ fontFamily: NAME_FONT, fontWeight: 700, color: T.inkStrong }}>
                {(d.dog_name || '').toUpperCase()}
              </strong>
              {role && el ? `\u00A0— ${role} / ${el}` : ''}
            </span>
          );
        })}
      </span>

      <span
        style={{
          fontFamily: FONT_UI, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: T.inkStrong, border: `1px solid ${T.border}`, borderRadius: 999,
          padding: '6px 13px', whiteSpace: 'nowrap',
        }}
      >
        {tx('pack.hub.nature.read', 'Read the results')} →
      </span>
    </Link>
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
