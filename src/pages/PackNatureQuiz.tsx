// OSOBNOSTNÝ KVÍZ PSA (`/pack/nature`, voliteľne `?dog=<id>`).
// Dataset + scoring: `components/pack/natureQuiz.ts`. Zadanie:
// plany/zadanie-osobnostny-kviz-2026-08-06.md
//
// PREČO SAMOSTATNÝ POVRCH A NIE `dogQuiz.ts`:
// existujúci engine (`/pack/dogs/quiz/:key`) je field-collector — otázka = pole na
// karte psa, žiadne váhy. Tento kvíz potrebuje SCORING a výsledok. Výsledok sa ale
// zapíše ako polia EXISTUJÚCEJ psej karty (`nature.*`), takže nevzniká druhý profil.
//
// ⚠️ Routa je `/pack/nature`, NIE `/pack/dogs/quiz/nature` — tú by zachytil
// `:key` v starom engine — a ani `/pack/dogs/nature`, ktorú by zjedol `:id`.
//
// TRI VECI, KTORÉ SA TU NESMÚ ROZBIŤ:
//  1. Titul výsledku je v GENITÍVE („The Defender of Water") — `natureTitleEN()`.
//     Adjektívum by v SK dalo „Drevený Obranca“ = nemotorný obranca.
//  2. Zvláštna úloha sa NIKDY nevykreslí ako samostatný chip — vždy s prefixom
//     „Special role“. Bez toho sa `The Loner` zrazí s tagom povahy `loner`
//     („Samotár“), ktorý na psej karte už existuje.
//  3. Pätička s attribution je POVINNÁ na obrazovke výsledku aj na intre.
//     Zdroj (Wolf and Dog Development Centre) sa priznáva a odkazuje.
//
// ODZNAKY (5 elementov + 5 základných + 4 zvláštne úlohy) EXISTUJÚ od 20. 8. 2026 —
// cesty nesie pole `art` v `natureQuiz.ts`, obrázky sú v `public/images/nature/`.
// Výsledok je JEDEN DOKUMENT NA PSA (`ResultDoc`), nie štyri karty pod sebou.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, RotateCcw, Check } from 'lucide-react';
import { PACK_THEME, PACK_BOX, PACK_COL, FONT_TITLE, FONT_UI } from '@/components/pack/packTheme';
import {
  NATURE_QUESTIONS, NATURE_ELEMENTS, NATURE_ROLES, NATURE_SPECIALS,
  SPECIAL_KEYS, ELEMENT_KEYS, ROLE_KEYS, NATURE_ATTRIBUTION, scoreNature, natureTitleEN,
  type SpecialAnswer, type SpecialKey, type NatureResult,
} from '@/components/pack/natureQuiz';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { appendDogEvents, type DogEventInput } from '@/lib/dogEvents';
import ainubisBadge from '@/assets/ainubis-badge.png';
import { supabase } from '@/integrations/supabase/client';
import { useT } from '@/i18n/LanguageContext';

const T = PACK_THEME;
const NAME_FONT = "'Cinzel Decorative', 'Cinzel', serif";
// Tá istá vitráž, akou sa kvíz ponúka na `/pack/dogs` (`NATURE_ART` v PackDogs.tsx).
// Úvod je druhý záber tej istej dlaždice — iný obrázok by pôsobil ako iná stránka.
const INTRO_ART = '/images/nature-quiz-art.webp';
/** Kam vedie X, „Odísť" aj „Hotovo". Viď komentár pri `leave()` v stránke. */
const QUIZ_EXIT = '/pack/dogs';

interface QuizDog { id: string; dog_name: string | null; cloudinary_main_url: string | null }

const NQ_CSS = `
/* ── CTA — ZLATÚ URČUJE PODKLAD, NIE VKUS ────────────────────────────────────
   Pravidlo je v index.css od 14. 7. 2026 aj s Matejovým OK:
     LIGHT/papyrus → --cta-gradient      (medová #C99A3F→#A07423) + --cta-shadow-grounded
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
  padding:13px 26px;
  background:var(--cta-gradient);
  border:none; border-radius:8px; color:#000;
  font-family:'Cinzel',serif; font-size:11px; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase; cursor:pointer; white-space:nowrap;
  box-shadow:var(--cta-shadow-grounded);
  transition: transform .2s, box-shadow .22s;
}
.nq-gold:hover{ transform:scale(1.04); }
.nq-gold:disabled{ opacity:.45; cursor:default; transform:none; box-shadow:none; }
.nq-gold.is-ondark{
  background:var(--cta-gradient-dark);
  border:1px solid rgba(250,244,236,0.30);
  box-shadow:var(--cta-shadow-glow);
}
/* Ghost na čiernom: teplý hnedý ink "#7a5a2a" je inkoust NA PAPYRUS a na čiernej ho
   nevidno. Rovnaká pasca ako pri pätičke s attribution — na tmavých vrstvách sa berú
   onDark odtiene, nie ink*. */
.nq-ghost.is-ondark{
  border-color:rgba(201,154,63,0.55); color:rgba(245,240,228,0.86);
}
.nq-ghost.is-ondark:hover{ border-color:#C99A3F; color:#F5C73D; }
/* Hlavné CTA úvodu — vzor hub-gold.is-big z PackDogs.tsx. Meria sa na šírku
   textového stĺpca, nie na dĺžku slova START: tlačidlo, ktoré má stránku otvoriť,
   nesmie byť menšie než dlaždice nad ním (Matej 14.8.: „urob vačšie širšie").
   ⚠️ Gradient, radius 8 a papyrusový rám sa NEMENIA — CTA je LOCKED. */
.nq-gold.is-big{
  width:100%; padding:18px 26px; font-size:13px; letter-spacing:.16em;
  border-radius:8px;
}
.nq-ghost{
  display:inline-flex; align-items:center; justify-content:center; gap:7px;
  padding:11px 20px; background:transparent;
  border:1.5px solid rgba(201,154,63,0.45); border-radius:8px; color:#7a5a2a;
  font-family:'Cinzel',serif; font-size:10.5px; font-weight:700;
  letter-spacing:.12em; text-transform:uppercase; cursor:pointer;
}
.nq-ghost:hover{ border-color:#C99A3F; color:#2a1608; }
.nq-ghost:disabled{ opacity:.32; cursor:default; border-color:rgba(201,154,63,0.45); color:#7a5a2a; }
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
  padding:13px 15px; border-radius:12px;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid rgba(179,130,45,0.55);
  font-family:'Space Grotesk',sans-serif; font-size:13.5px; line-height:1.45;
  color:#5c4318;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .18s;
}
.nq-optlbl{ flex:1 1 auto; }
.nq-opt:hover, .nq-optlbl:hover{
  border-color:rgba(179,130,45,0.85); transform:translateY(-1px);
  box-shadow:0 3px 10px rgba(122,90,42,0.22);
}
.nq-opt.is-on, .nq-optlbl.is-on{
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border-color:#E69E1A; color:#241a06;
  box-shadow:0 3px 12px rgba(230,158,26,0.5);
}
.nq-opt.is-on:hover, .nq-optlbl.is-on:hover{ box-shadow:0 4px 16px rgba(230,158,26,0.62); }
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
  background:#F8E9C2; border-color:#C99A3F; color:#3d2a08;
}

/* OZNAČENIE ODPOVEDE (Matej 14.8.: „odpovede by mali mať aj označenie").
   Krúžok s písmenom vľavo; po výbere sa písmeno zmení na zaškrtnutie. Dáva to
   odpovediam adresu („to bolo béčko"), ktorú holý text nemá, a stav výberu prestáva
   visieť len na odtieni pozadia. */
.nq-mark{
  flex:0 0 auto; width:26px; height:26px; border-radius:999px;
  display:grid; place-items:center;
  background:rgba(255,255,255,0.55); border:1.5px solid rgba(179,130,45,0.45);
  font-family:'Cinzel',serif; font-weight:700; font-size:11px; letter-spacing:.02em;
  color:#7a5a2a; transition:background .18s, border-color .18s, color .18s;
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
  border-color:rgba(179,130,45,0.55); transform:none; box-shadow:none;
}

/* Trojlístok áno/občas/nie pri jednom psovi — tá istá koža, len na šírku. */
.nq-tri{
  flex:1 1 0; cursor:pointer; padding:11px 8px; border-radius:999px;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid rgba(179,130,45,0.55);
  font-family:'Space Grotesk',sans-serif; font-size:12.5px; font-weight:500; color:#5c4318;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.nq-tri:hover{
  border-color:rgba(179,130,45,0.85); transform:translateY(-1px);
  box-shadow:0 3px 10px rgba(122,90,42,0.22);
}
.nq-tri.is-on{
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border-color:#E69E1A; color:#241a06; box-shadow:0 3px 12px rgba(230,158,26,0.5);
}

/* ── PROGRES ──────────────────────────────────────────────────────────────────
   MODRÝ, NIE ZLATÝ (Matej 18.8.: „progresbar musí byť výraznejší a krajší, použi
   modrú farbu z brandu"). Egyptská modrá #1034A6 je kánonická sekundárna brandu
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
  font-family:'Cinzel',serif; font-weight:700; font-size:13px;
  letter-spacing:.14em; text-transform:uppercase; color:#2a1608;
}
.nq-prognum{
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:12px;
  color:#1034A6; white-space:nowrap; font-variant-numeric:tabular-nums;
}
.nq-progbar{
  height:14px; border-radius:999px; overflow:hidden; position:relative;
  background:rgba(16,52,166,0.07); border:1px solid rgba(16,52,166,0.28);
  box-shadow:inset 0 2px 5px rgba(9,26,74,0.20);
}
.nq-progbar__on{
  height:100%; border-radius:999px;
  background:linear-gradient(90deg,#2E5FD0 0%,#1034A6 100%);
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
  border:2px solid rgba(201,154,63,0.35); background:#EDDCBD;
  filter:grayscale(1); opacity:.45;
  transition:opacity .18s, filter .18s, border-color .18s, box-shadow .18s;
}
.nq-dog img{ width:100%; height:100%; object-fit:cover; display:block; }
.nq-dog:hover{ opacity:.8; filter:grayscale(.35); }
.nq-dog.is-on{
  opacity:1; filter:none; border-color:#C99A3F; box-shadow:0 0 0 3px rgba(201,154,63,0.22);
}
.nq-dogfb{
  display:grid; place-items:center; width:100%; height:100%;
  font-family:'Cinzel',serif; font-weight:700; font-size:calc(var(--nq-dog,54px) * 0.34);
  color:#7a5a2a;
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
   lenže T.cardGrad je 160° gradient #FBF5E6 → #EAD6A6 — trafil sa teda v jedinom bode
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
  padding:26px 24px; display:flex; flex-direction:column; justify-content:center;
  min-width:0;
}
/* DVE OSI = DVE VEĽKÉ ŠTVORCOVÉ DLAŽDICE VEDĽA SEBA (Matej 14.8.: „daj ich vačšie
   v štvorcových blokoch vedľa seba aj s emoji alebo ikonou s brandu… su nevyrazne
   neputave a vyzera to chudobne"). Predtým to boli dva ploché riadky Tile cez celú
   šírku — text bez obrazu, nič, na čo by oko skočilo.
   Geometria je z matrice PACK_BOX.subblock: papyrusový gradient + PLNÝ zlatý rám
   + r12, nie plochý tileBg so slabým okrajom. */
.nq-axes{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.nq-axis{
  aspect-ratio:1/1;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; gap:11px; padding:18px 14px;
  background:linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);
  border:1.5px solid #C99A3F; border-radius:14px;
  box-shadow:0 8px 28px -18px rgba(0,0,0,0.75), 0 0 0 3px rgba(201,154,63,0.13),
             inset 0 1px 0 rgba(255,255,255,0.6);
  transition:transform .25s ease, box-shadow .25s ease;
}
.nq-axis:hover{ transform:translateY(-3px); }
.nq-axis:hover .nq-axisicon{ transform:scale(1.08); }
/* Ikonka je z hand-drawn kitu (BrandIcon), NIE lucide a nie emoji — medailón okolo
   nej je zlaté halo, aby dlaždica mala ohnisko aj bez farby. */
.nq-axisicon{
  width:70px; height:70px; border-radius:999px; display:grid; place-items:center;
  flex:0 0 auto;
  background:radial-gradient(circle at 34% 28%, rgba(245,199,61,0.34), rgba(201,154,63,0.08) 72%);
  border:1px solid rgba(201,154,63,0.55);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.65);
  transition:transform .35s ease;
}
.nq-axistitle{
  font-family:'Cinzel',serif; font-weight:700; text-transform:uppercase;
  font-size:14px; letter-spacing:.14em; line-height:1.2; color:#2a1608;
}
.nq-axissub{
  font-family:'Space Grotesk',sans-serif; font-size:12.5px; line-height:1.5; color:#7a5a2a;
}

/* ── POTVRDENIE PRI ODCHODE ──────────────────────────────────────────────────
   Panel = úroveň 4 matrice (PACK_BOX.panel): papyrusový gradient, 1.5px zlatý rám,
   r14. Scrim je tmavý s rozostrením, aby bolo vidno, že kvíz nezmizol — len čaká. */
.nq-scrim{
  position:fixed; inset:0; z-index:60; display:grid; place-items:center; padding:20px;
  background:rgba(3,2,0,0.66); -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px);
}
.nq-confirm{
  width:100%; max-width:420px; padding:22px 20px;
  background:linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);
  border:1.5px solid #C99A3F; border-radius:14px;
  box-shadow:0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15);
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
  font-family:'Space Grotesk',sans-serif; font-size:11.5px; line-height:1.25;
  color:#7a5a2a; text-align:right;
}
.nq-scorename.is-top{ color:#2a1608; font-weight:600; }
.nq-scoretrack{
  position:relative; display:block; height:9px; border-radius:999px; overflow:hidden;
  background:rgba(201,154,63,0.14); box-shadow:inset 0 1px 2px rgba(60,38,8,0.16);
}
/* Nevíťazné prúžky sú zámerne bez gradientu — zlatý lesk má na obrazovke jedno
   ohnisko, a tým je výsledok. Ak by sa leskli všetky, nevidno víťaza. */
.nq-scorefill{
  position:absolute; inset:0 auto 0 0; border-radius:999px;
  background:rgba(201,154,63,0.42); transition:width .5s ease;
}
.nq-scorefill.is-top{
  background:linear-gradient(90deg,#F5C73D,#E69E1A);
  box-shadow:0 0 14px rgba(230,158,26,0.5);
}
.nq-scorepct{
  font-family:'Space Grotesk',sans-serif; font-size:11px; color:#7a5a2a; text-align:right;
  font-variant-numeric:tabular-nums;
}
.nq-scorepct.is-top{ color:#2a1608; font-weight:600; }
.nq-scorenote{
  font-family:'Space Grotesk',sans-serif; font-size:10.5px; line-height:1.5;
  color:rgba(31,26,14,0.42); margin:10px 0 0;
}
@media (max-width:560px){
  .nq-scorerow{ grid-template-columns:82px 1fr 34px; gap:8px; }
  .nq-scorename{ font-size:10.5px; }
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
  font-family:'Space Grotesk',sans-serif; font-size:9.5px; font-weight:500;
  letter-spacing:.24em; text-transform:uppercase; color:#C99A3F; margin-top:8px;
}
.nq-badgename{
  font-family:'Cinzel',serif; font-weight:700; text-transform:uppercase;
  font-size:clamp(13px,3.6vw,16px); line-height:1.2; letter-spacing:.03em;
  color:#2a1608; margin-top:3px;
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
  .nq-introbody{ padding:18px 16px 22px; }
  /* Pod 760 px dlaždice pustia pomer strán a stlačia sa — výška, ktorú ušetria,
     je presne tá, ktorú dostal obraz nad nimi.
     ⚠️ justify-content:flex-start je POVINNÉ: bez štvorca má každá dlaždica inak
     vysoký text (ROLE IN THE PACK sa láme na dva riadky) a pri centrovaní by
     medailóny sedeli v schodíku. */
  .nq-axis{
    aspect-ratio:auto; padding:13px 10px 14px; gap:7px; justify-content:flex-start;
    border-radius:12px;
  }
  .nq-axisicon{ width:46px; height:46px; }
  .nq-axisicon img{ width:26px; height:26px; }
  .nq-axistitle{ font-size:11.5px; letter-spacing:.1em; }
  .nq-axissub{ font-size:11px; line-height:1.42; }
  .nq-axes{ gap:10px; }
}
`;

/* Čítací stĺpec vnútri karty. Karta drží šírku panelov `/pack` (1024), text nie —
   riadok širší než ~760 px sa čítať nedá. `justifyContent:center` posadí otázku
   do stredu naťahnutej karty, aby dole nezostala prázdna polovica obrazovky. */
const NQ_READ: React.CSSProperties = {
  width: '100%', maxWidth: 760, margin: '0 auto',
  flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
};

/**
 * Čítací stĺpec + veľkosť krúžkov psov podľa dĺžky svorky.
 *
 * Rovnica, nie meranie: krúžky sú `n × d + (n-1) × 10` a vedľa nich musí ostať veta.
 * Pri 5–6 psoch by 54 px zabralo viac než pol riadku, tak sa zmenšujú. 36 px je dno
 * (dotykové minimum) — pod ním sa rad radšej zalomí pod text (media query 500 px).
 */
function readStyle(dogCount: number): React.CSSProperties {
  const size = dogCount <= 2 ? 54 : dogCount <= 4 ? 44 : 38;
  return { ...NQ_READ, ['--nq-dog' as string]: `${size}px` } as React.CSSProperties;
}

/** Ako dlho po poslednom kliku sa kvíz posunie na ďalšiu otázku. Dosť na to, aby
 *  bolo vidieť rozsvietený riadok, málo na to, aby sa čakalo. */
const ADVANCE_MS = 340;

/* ── malé stavebné prvky (bledý blok podľa locku z /entry) ─────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_UI, fontSize: 10, fontWeight: 500, letterSpacing: '.26em',
      textTransform: 'uppercase', color: T.cardEdge, marginBottom: 8,
    }}>{children}</div>
  );
}

function Card({ children, style, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string;
}) {
  return (
    <div className={className} style={{
      background: T.cardGrad, border: `1.5px solid ${T.cardEdge}`, borderRadius: 16,
      boxShadow: T.cardShadow, padding: '20px 18px', ...style,
    }}>{children}</div>
  );
}

function Rule() {
  return <div style={{ height: 2, background: T.rule, margin: '16px 0', border: 0 }} />;
}

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: T.tileBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 14px',
    }}>{children}</div>
  );
}

// POZOR: pätička stojí MIMO papyrusovej karty, teda na čiernom pozadí. `T.inkFaint`
// je tmavý ink pre papyrus — na tmavom je nečitateľný. Odhalil to screenshot, nie tsc:
// typová kontrola prejde, text je len neviditeľný. Na tmavých vrstvách sa berú
// `onDark*` tokeny, nie `ink*`.
function Attribution({ tx }: { tx: (k: string, f: string) => string }) {
  return (
    <p style={{
      fontFamily: FONT_UI, fontSize: 10.5, lineHeight: 1.55, color: 'rgba(245,240,228,0.55)',
      marginTop: 18, textAlign: 'center',
    }}>
      {tx(NATURE_ATTRIBUTION.i18n, NATURE_ATTRIBUTION.textEN)}
      {NATURE_ATTRIBUTION.url ? (
        <>
          {' '}
          <a href={NATURE_ATTRIBUTION.url} target="_blank" rel="noreferrer"
             style={{ color: T.cardEdge, textDecoration: 'underline' }}>
            {NATURE_ATTRIBUTION.sourceName}
          </a>
        </>
      ) : null}
    </p>
  );
}

/* ── úvod: dve osi + poznámka AINUBISA ────────────────────────────────────── */

/** Jedna z dvoch veľkých štvorcových dlaždíc úvodu. */
function AxisTile({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="nq-axis">
      <span className="nq-axisicon"><BrandIcon name={icon} size={36} /></span>
      {/* Typografia podľa `.qt-title` z QuickTiles — Cinzel 700, .14em, uppercase.
          Je to ten istý druh dlaždice, len väčšia; dve rôzne miery by sa bili.
          Veľkosti sú v CSS, nie inline — mobil ich zmenšuje media query. */}
      <div className="nq-axistitle">{title}</div>
      <div className="nq-axissub">{sub}</div>
    </div>
  );
}

/**
 * „Kam to ide" — tmavý modrý blok s odznakom AINUBISA (Matej 14.8.: „tá informácia
 * o tom že to pojde do DOG ID môže vyť v modrom rámiku s ikonkou ainubisa").
 *
 * ⚠️ VEDOMÁ ODCHÝLKA OD PAPYRUSOVÉHO LOCKU — ale nie nová: povrch je presná kópia
 * `AinubisBlock` z `PackDogs.tsx` (radiálna navy, cyan rám, modré halo). AINUBIS má
 * naprieč appkou vlastnú paletu (cyan = STROJ, zlatá = ČLOVEK) a práve tá tu nesie
 * význam: toto nie je ďalší odsek o kvíze, toto je surovina pre stroj, ktorý bude
 * radiť. Papyrusová dlaždica by splynula s dvomi osami nad ňou.
 *
 * Zlaté CTA sem NEPATRÍ — zlatá je interakcia človeka a tá tu žiadna nie je.
 */
function DogIdNote({ tx }: { tx: (k: string, f: string) => string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, marginTop: 14,
      padding: '14px 16px', borderRadius: 14,
      background: 'radial-gradient(circle at 22% 20%, #12233a 0%, #01050A 74%)',
      border: '1px solid rgba(91,224,240,0.28)',
      boxShadow: '0 0 0 4px rgba(59,158,255,0.05), 0 18px 44px -22px rgba(59,158,255,0.45)',
    }}>
      <img
        src={ainubisBadge}
        alt=""
        aria-hidden
        style={{
          width: 48, height: 48, objectFit: 'contain', borderRadius: '50%', flex: '0 0 auto',
          background: 'radial-gradient(circle at 35% 28%, #12233a 0%, #01050A 74%)',
          border: '1px solid rgba(91,224,240,0.35)',
          boxShadow: '0 0 0 4px rgba(59,158,255,0.06), 0 0 20px rgba(59,158,255,0.34)',
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
          fontSize: 12.5, letterSpacing: '.08em', color: '#5BE0F0', marginBottom: 5,
        }}>{tx('pack.nature.intro.axis3', 'It goes into the DOG ID')}</div>
        <div style={{
          fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.onDarkDim,
        }}>
          {tx('pack.nature.intro.axis3sub',
            'Your answers are written onto your dog’s DOG ID and stay there. From there they shape the advice you get later — food, daily routine, training — so it fits this dog, not dogs in general.')}
        </div>
      </div>
    </div>
  );
}

/** Pás s vitrážou nad otázkami. Na PC ho CSS skryje — je to mobilná vec. */
function QuizArt() {
  return <div className="nq-band"><img src={INTRO_ART} alt="" aria-hidden /></div>;
}

/**
 * „AKO SA TO SČÍTALO" — vyhodnotenie podľa matrice na záver (Matej 14.8.: „odpovede
 * by mali mať aj označenie a aj vyhodnotenie na záver podľa našej matrice").
 *
 * Dáta na to boli od začiatku: `scoreNature` vracia `scores.el` / `scores.role`
 * (súčet váh z matrice `natureQuiz.ts`), ale výsledok z nich doteraz ukazoval len
 * VÍŤAZA. Pes, ktorý má oheň 9 a zem 8, tak vyzeral rovnako ako pes s ohňom 9 a
 * zemou 0 — a majiteľ druhého v poradí nikdy nevidel.
 *
 * Zobrazuje sa PODIEL v rámci osi, nie surové body: body sú artefakt váh a bez
 * matrice pred očami nič nehovoria. Nula sa nekreslí ako prázdny riadok — kreslí sa,
 * lebo „tento pes v sebe nemá nič z kovu" je informácia.
 */
function ScoreBars({ title, rows }: {
  title: string;
  rows: { key: string; label: string; value: number; top: boolean }[];
}) {
  const total = rows.reduce((a, r) => a + Math.max(0, r.value), 0);
  return (
    <div style={{ marginTop: 14 }}>
      <Eyebrow>{title}</Eyebrow>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((Math.max(0, r.value) / total) * 100) : 0;
          return (
            <div key={r.key} className="nq-scorerow">
              <span className={`nq-scorename${r.top ? ' is-top' : ''}`}>{r.label}</span>
              <span className="nq-scoretrack">
                <span
                  className={`nq-scorefill${r.top ? ' is-top' : ''}`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className={`nq-scorepct${r.top ? ' is-top' : ''}`}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ⚠️ NIE JE to vlastná karta — je to POSLEDNÁ SEKCIA dokumentu psa (`ResultDoc`).
 *  Do 20. 8. stála ako piata samostatná karta pod výsledkom; od zliatia dokumentu
 *  ju obaľuje spoločný papyrus a oddeľuje `Rule`, nie vlastný rám. */
function ScoreBreakdown({ r, tx }: { r: NatureResult; tx: (k: string, f: string) => string }) {
  return (
    <>
      <h2 style={{
        fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
        fontSize: 16, letterSpacing: '.06em', color: T.inkStrong, margin: 0,
      }}>{tx('pack.nature.result.scoresTitle', 'How it added up')}</h2>
      <ScoreBars
        title={tx('pack.nature.result.elementLabel', 'Constitution')}
        rows={ELEMENT_KEYS.map((k) => ({
          key: k,
          label: tx(NATURE_ELEMENTS[k].i18n, NATURE_ELEMENTS[k].labelEN),
          value: r.scores.el[k],
          top: k === r.element,
        }))}
      />
      <Rule />
      <ScoreBars
        title={tx('pack.nature.result.roleLabel', 'Role in the pack')}
        rows={ROLE_KEYS.map((k) => ({
          key: k,
          label: tx(NATURE_ROLES[k].i18n, NATURE_ROLES[k].labelEN),
          value: r.scores.role[k],
          top: k === r.role,
        }))}
      />
      {/* Vysvetlivka stojí RAZ pod celou kartou — pod každou skupinou zvlášť to bola
          tá istá veta dvakrát na jednej obrazovke. */}
      <p className="nq-scorenote">
        {tx('pack.nature.result.scoresNote',
          'Every answer adds weight to more than one line — this is where they landed.')}
      </p>
    </>
  );
}

/**
 * Progres kvízu. Vizuál je prevzatý z `.pass-fillbar` na doklade DOG ID
 * (`components/pack/DogPassport.tsx`) — zámerne, lebo tento kvíz do DOG ID zapisuje
 * a „koľko mám hotové" má v celom /packu vyzerať rovnako.
 *
 * `done` NIE JE `idx` — je to počet otázok zodpovedaných za CELÚ svorku (viď memo
 * `done` v stránke). Pri troch psoch teda prúžok nenarastie, kým neodpovedia všetci,
 * a to je správne: inak by sľuboval hotovo pri jednom psovi z troch.
 */
function Progress({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="nq-prog">
      <div className="nq-proghead">
        <span className="nq-proglbl">{label}</span>
        <span className="nq-prognum">{pct}%</span>
      </div>
      <div
        className="nq-progbar"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className="nq-progbar__on" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── stĺpce psov ──────────────────────────────────────────────────────────── */

/** Fotka psa v krúžku (výsledok, kde stojí vedľa mena). Bez fotky ostáva iniciála. */
function DogFace({ dog, on = true, size = 34 }: { dog: QuizDog; on?: boolean; size?: number }) {
  const initial = (dog.dog_name || '?').trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: 999, overflow: 'hidden', display: 'block',
        border: `1.5px solid ${T.border}`, background: T.bg, opacity: on ? 1 : 0.5,
      }}
    >
      {dog.cloudinary_main_url
        ? <img src={dog.cloudinary_main_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span className="nq-dogfb" style={{ fontSize: Math.round(size * 0.38) }}>{initial}</span>}
    </span>
  );
}

/**
 * Jedna možnosť = JEDEN riadok textu + krúžok na psa.
 *
 * KTO JE TU OVLÁDAČ, ZÁVISÍ OD POČTU PSOV (Matej 18.8.):
 *  · jeden pes  → ovládač je VETA. Krúžky sa nekreslia vôbec, 18× fotka toho istého
 *                 psa nič nehovorí, a riadok sa správa ako obyčajné tlačidlo možnosti.
 *  · viac psov  → ovládač sú výhradne KRÚŽKY. Veta je len text.
 *
 * Predtým bola veta klikateľná aj pri svorke a odpovedala naraz za všetkých psov.
 * Zámer bol dobrý (najčastejší úkon bez ďalšieho ovládača), ale nedal sa uhádnuť:
 * dlaždica vyzerá ako tlačidlo, tak sa naň klikne, vyplnia sa všetky krúžky naraz
 * a vyzerá to ako chyba. Skratka „rovnako pre všetkých" sa dá vrátiť neskôr, ale
 * ako viditeľný ovládač s vlastným popisom, nie ako skrytá vlastnosť textu.
 */
function OptionRow({
  label, mark, dogs, solo, isOn, onPickDog, onPickAll,
}: {
  label: string;
  /** Písmeno odpovede (A, B, C…). Bez neho ostane krúžok prázdny — používa sa pri
   *  áno/občas/nie, kde by písmená boli šum. */
  mark?: string;
  dogs: QuizDog[];
  solo: boolean;
  isOn: (dogId: string) => boolean;
  onPickDog: (dogId: string) => void;
  onPickAll: () => void;
}) {
  // TRI STAVY, nie dva (Matej 20.8.). Zaškrtnutie a plná zlatá znamenajú „takto
  // odpovedali VŠETCI"; keď sa svorka nezhodne, riadok musí byť aj tak označený —
  // inak otázka vyzerá nezodpovedaná. Pri jednom psovi splývajú do jedného stavu.
  const onCount = dogs.reduce((n, d) => n + (isOn(d.id) ? 1 : 0), 0);
  const allOn = dogs.length > 0 && onCount === dogs.length;
  const someOn = onCount > 0 && !allOn;
  const Mark = (
    <span className="nq-mark" aria-hidden>
      {allOn ? <Check className="h-3.5 w-3.5" /> : (mark ?? '')}
    </span>
  );

  if (solo) {
    return (
      <button type="button" className={`nq-opt${allOn ? ' is-on' : ''}`} onClick={onPickAll}>
        {Mark}
        <span className="nq-optxt">{label}</span>
      </button>
    );
  }
  return (
    <div className="nq-optrow">
      {/* `div`, nie `button` — nesmie sa dať ani kliknúť, ani stlačiť Enterom.
          Zlatý „vybraté" stav si ponecháva: keď takto odpovedali všetky psy, je
          užitočné to vidieť aj na riadku, nielen na krúžkoch. */}
      <div className={`nq-optlbl is-static${allOn ? ' is-on' : someOn ? ' is-some' : ''}`}>
        {Mark}
        <span className="nq-optxt">{label}</span>
      </div>
      <div className="nq-dogs">
        {dogs.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`nq-dog${isOn(d.id) ? ' is-on' : ''}`}
            aria-label={`${d.dog_name ?? ''}: ${label}`}
            aria-pressed={isOn(d.id)}
            title={d.dog_name ?? ''}
            onClick={() => onPickDog(d.id)}
          >
            {d.cloudinary_main_url
              ? <img src={d.cloudinary_main_url} alt="" />
              : <span className="nq-dogfb">{(d.dog_name || '?').trim().charAt(0).toUpperCase()}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Krátka pripomienka na obrazovkách, kde sa už nevysvetľuje od nuly. */
function PackHint({ tx }: { tx: (k: string, f: string) => string }) {
  return (
    <p style={{
      fontFamily: FONT_UI, fontSize: 11.5, lineHeight: 1.5, color: T.inkWarm,
      margin: '10px 0 0',
    }}>
      {tx('pack.nature.pickHint', 'Answer for each dog separately — tap that dog’s photo in the row that fits them.')}
    </p>
  );
}

/**
 * NÁVOD NA PRVEJ OTÁZKE (Matej 18.8.: „pri úvodnej otázke treba vysvetliť logiku
 * používania").
 *
 * Kreslí sa LEN na prvej otázke a len raz. Nie je to popisok, ktorý má visieť nad
 * všetkými osemnástimi — po prvom potvrdení už človek vie, ako to chodí, a trvalá
 * inštrukcia by len tlačila otázku nižšie.
 *
 * Text má DVE VERZIE, lebo kvíz má dva rôzne ovládače: pri jednom psovi sa klikne
 * na vetu, pri svorke na krúžok pod psom. Jedna univerzálna veta by v oboch
 * prípadoch popisovala aj tlačidlo, ktoré tam nie je.
 */
function HowItWorks({ solo, tx }: { solo: boolean; tx: (k: string, f: string) => string }) {
  return (
    <div style={{ ...PACK_BOX.subblock, padding: '13px 15px', margin: '0 0 16px' }}>
      <div style={{
        fontFamily: FONT_UI, fontSize: 10, fontWeight: 500, letterSpacing: '.26em',
        textTransform: 'uppercase', color: T.cardEdge, marginBottom: 6,
      }}>{tx('pack.nature.how.eyebrow', 'How it works')}</div>
      <p style={{
        fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.inkStrong, margin: 0,
      }}>
        {solo
          ? tx('pack.nature.how.solo',
              'Pick the sentence that fits your dog best and the quiz moves on by itself. There is no wrong answer, nothing is written down until the end, and Back takes you to anything you want to change.')
          : tx('pack.nature.how.pack',
              'Each dog answers for themselves: in the row that fits them, tap that dog’s photo. A row half-lit means some of them chose it, fully gold means all of them did. Once every dog has answered, the quiz moves on by itself — and Back takes you to anything you want to change.')}
      </p>
    </div>
  );
}

/**
 * POTVRDENIE PRI ZATVORENÍ (Matej 14.8.: „pri kliku na X by mala nasledovať otázka
 * že stratí postup či chce ozaj skončiť").
 *
 * Prečo to treba: odpovede sa nikam neukladajú priebežne — `answers`/`specials` sú
 * stav komponentu a do `dog_events` sa zapisujú AŽ na konci (`finish`). Zatvorenie
 * v 14. otázke teda naozaj zahodí všetkých 14, ticho a bez varovania.
 *
 * ⚠️ NIE `window.confirm` — natívny dialóg zablokuje celú stránku a v Chrome
 * rozhádže automatizáciu; navyše vyzerá ako systémová chyba, nie ako súčasť kvízu.
 */
function LeaveConfirm({ onStay, onLeave, tx }: {
  onStay: () => void; onLeave: () => void; tx: (k: string, f: string) => string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="nq-scrim"
      onClick={onStay}
    >
      {/* Klik do panela nesmie prepadnúť na scrim a zavrieť dialóg. */}
      <div className="nq-confirm" onClick={(e) => e.stopPropagation()}>
        <h2 style={{
          fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
          fontSize: 16, letterSpacing: '.06em', color: T.inkStrong, margin: 0,
        }}>{tx('pack.nature.leave.title', 'Leave the quiz?')}</h2>
        <p style={{
          fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.55, color: T.inkWarm, margin: '10px 0 0',
        }}>
          {tx('pack.nature.leave.body',
            'Your answers are not saved yet — they are written to the DOG ID only at the end. Leave now and you start over.')}
        </p>
        <div className="nq-confirmbtns">
          <button type="button" className="nq-gold" onClick={onStay}>
            {tx('pack.nature.leave.stay', 'Keep going')}
          </button>
          <button type="button" className="nq-ghost" onClick={onLeave}>
            {tx('pack.nature.leave.quit', 'Leave anyway')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── škrupina (rovnaký vzor ako PackDogQuiz — fullscreen route) ───────────── */

/**
 * Škrupina kvízu.
 *
 * ŠÍRKA = `PACK_COL.wide`, teda presne stĺpec `/pack`, `/pack/dogs` a `/pack/profile`
 * (Matej 14.8.: „obsah musí byť široký ako všetky panely v /pack"). Pôvodné `max-w-2xl`
 * (672 px) bolo dedičstvo po `PackDogQuiz` a vedľa huba to vyzeralo ako iná stránka.
 * ⚠️ Rovnica je jedno číslo v `packTheme.ts` — nie Tailwind trieda, tú by nikto
 * nespároval s `PackLayout`.
 *
 * `fill` = karta sa naťahuje po celú výšku okna (úvod a otázky), nie „blok hore
 * a pod ním prázdno". Výsledok `fill` NEMÁ — je dlhý a scrolluje sa.
 */
function Shell({ children, onClose, fill, overlay }: {
  children: React.ReactNode; onClose: () => void; fill?: boolean; overlay?: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] relative flex flex-col" style={{ backgroundColor: T.pageBg, color: T.onDark }}>
      <div aria-hidden style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100lvh',
        backgroundImage: "url('/images/bg-dark.webp')", backgroundSize: 'cover',
        backgroundPosition: 'center', filter: 'blur(3px)', zIndex: 0, pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100lvh',
        background: 'radial-gradient(ellipse at center, rgba(5,5,5,0.25) 0%, rgba(5,5,5,0.45) 60%, rgba(5,5,5,0.6) 100%)',
        zIndex: 0, pointerEvents: 'none',
      }} />
      <style>{NQ_CSS}</style>
      <div
        className={`relative z-10 mx-auto w-full px-4 sm:px-6 flex flex-col ${fill ? 'flex-1 pb-6' : 'pb-24'}`}
        style={{ maxWidth: PACK_COL.wide, paddingTop: 'calc(env(safe-area-inset-top, 0px) + 22px)' }}
      >
        <div className="flex justify-end" style={{ marginBottom: 12 }}>
          <button type="button" onClick={onClose} aria-label="Close" style={{
            width: 36, height: 36, borderRadius: 999, cursor: 'pointer',
            background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,154,63,0.4)',
            color: '#E9D9B8', display: 'grid', placeItems: 'center',
          }}><X className="h-4 w-4" /></button>
        </div>
        {fill ? <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>{children}</div> : children}
      </div>
      {/* Dialóg žije TU, nie vedľa Shellu — NQ_CSS (a s ním `.nq-scrim`) sa vkladá
          vnútri tohto stromu, mimo neho by panel ostal bez štýlov. */}
      {overlay}
    </div>
  );
}

/* ── výsledok ─────────────────────────────────────────────────────────────── */

/**
 * JEDEN DOKUMENT NA JEDNÉHO PSA.
 *
 * Matej 20. 8.: „mal by to byť len jeden blok na jedného psa = 1 dokument… fotka,
 * meno, potom rola a element aj s obrázkom a vysvetlením ale krajším… teraz je to
 * také suché." Do 20. 8. to boli ŠTYRI samostatné karty pod sebou (hlavička · rola ·
 * element · zvláštne úlohy) plus piata so skóre. Pri svorke sa tie hranice zlievali
 * a nedalo sa povedať, kde končí jeden pes a začína druhý.
 *
 * ČO SA TU NESMIE VRÁTIŤ:
 *  • MENO ROLY A ELEMENTU SA V DOKUMENTE NEOPAKUJE. Pomenúva ich odznaková dvojica
 *    hore; sekcie pod ňou už len vysvetľujú, preto nemajú vlastný `h2` s tým istým
 *    názvom. Predtým stálo „THE CAPTAIN" na obrazovke trikrát.
 *  • DVE OSI SA NEZLUČUJÚ do jednej frázy (Matej: „nedavajme to dokopy dajme
 *    defender/metal") — stoja vedľa seba ako dva rovnocenné výsledky.
 *  • Zvláštna úloha NIKDY bez prefixu — `The Loner` by sa zrazil s tagom povahy
 *    `loner` („Samotár").
 */
function ResultDoc({ dog, r, tx }: {
  dog: QuizDog; r: NatureResult; tx: (k: string, f: string) => string;
}) {
  const role = NATURE_ROLES[r.role];
  const el = NATURE_ELEMENTS[r.element];
  const second = r.roleSecond ? NATURE_ROLES[r.roleSecond] : null;
  const elSecond = r.elementSecond ? NATURE_ELEMENTS[r.elementSecond] : null;
  const name = (dog.dog_name || '').trim().toUpperCase();

  return (
    <Card>
      {/* ── HLAVIČKA: čí je to dokument ──────────────────────────────────────
          Fotka a meno stáli doteraz MIMO karty na čiernom a len pri svorke. V
          dokumente musia byť vnútri a vždy — inak je to list papiera bez adresáta.
          Meno psa = Cinzel Decorative (brand manuál: oficiálne povrchy). */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DogFace dog={dog} size={64} />
        </div>
        {name && (
          <div style={{
            fontFamily: NAME_FONT, fontWeight: 700, fontSize: 19, letterSpacing: '.03em',
            textTransform: 'uppercase', color: T.inkStrong, lineHeight: 1.2, marginTop: 10,
          }}>{name}</div>
        )}
        <div style={{ marginTop: 8 }}>
          <Eyebrow>{tx('pack.nature.result.eyebrow', 'Your dog is')}</Eyebrow>
        </div>
      </div>

      {/* ── ODZNAKY: rola (U štít) + element (kruh) ───────────────────────── */}
      <div className="nq-badges">
        <div className="nq-badge">
          <img className="nq-badgeart" src={role.art} alt="" aria-hidden loading="lazy" />
          <div className="nq-badgelbl">{tx('pack.nature.result.roleLabel', 'Role in the pack')}</div>
          <div className="nq-badgename">{tx(role.i18n, role.labelEN)}</div>
        </div>
        <div className="nq-badge">
          <img className="nq-badgeart" src={el.art} alt="" aria-hidden loading="lazy" />
          <div className="nq-badgelbl">{tx('pack.nature.result.elementLabel', 'Constitution')}</div>
          <div className="nq-badgename">{tx(el.i18n, el.labelEN)}</div>
        </div>
      </div>

      <p style={{
        fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkWarm,
        textAlign: 'center', marginTop: 12,
      }}>{tx(`${role.i18n}.function`, role.functionEN)}</p>

      <Rule />

      {/* ── ÚLOHA — a v nej „najčastejšie nepochopenie": veta, ktorú majiteľ o svojom
          psovi celý život slýcha, vyvrátená. To je emočný zásah celého kvízu. */}
      <Eyebrow>{tx('pack.nature.result.signs', 'You will know them by')}</Eyebrow>
      <ul style={{ display: 'grid', gap: 7 }}>
        {role.signsEN.map((sg, i) => (
          <li key={i} style={{
            fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkStrong,
            paddingLeft: 14, position: 'relative',
          }}>
            <span style={{ position: 'absolute', left: 0, color: T.cardEdge }}>·</span>
            {tx(`${role.i18n}.sign${i}`, sg)}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <Tile>
          <div style={{
            fontFamily: FONT_UI, fontSize: 11.5, color: T.inkWarm, marginBottom: 6,
            fontStyle: 'italic',
          }}>„{tx(`${role.i18n}.myth`, role.mythEN)}"</div>
          <div style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkStrong }}>
            {tx(`${role.i18n}.mythAnswer`, role.mythAnswerEN)}
          </div>
        </Tile>
      </div>

      <div style={{ marginTop: 12, fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkWarm }}>
        <strong style={{ color: T.inkStrong }}>{tx('pack.nature.result.pressure', 'Under pressure')}: </strong>
        {tx(`${role.i18n}.pressure`, role.pressureEN)}
      </div>

      {/* Zdroj sa priznáva pri mene úlohy, nie až v pätičke — meno je z WDDC. */}
      <p style={{ fontFamily: FONT_UI, fontSize: 11, color: T.inkFaint, marginTop: 12 }}>
        {tx('pack.nature.result.origin', 'In the source research')}: {role.originEN}
        {second && (
          <>
            {' · '}
            {tx('pack.nature.result.alsoRole', 'They also carry a strong second role')}:{' '}
            <strong style={{ color: T.inkStrong }}>{tx(second.i18n, second.labelEN)}</strong>
          </>
        )}
      </p>

      <Rule />

      {/* ── ELEMENT — telo a konštitúcia. `watch` NIE JE diagnóza. ─────────── */}
      <Eyebrow>{tx('pack.nature.result.made', 'What they are made of')}</Eyebrow>
      <p style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.5, color: T.inkStrong }}>
        {tx(`${el.i18n}.summary`, el.summaryEN)}
      </p>
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        <Tile>
          <div style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: T.cardEdge, marginBottom: 5 }}>
            {tx('pack.nature.result.body', 'Body')}
          </div>
          <div style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong }}>
            {tx(`${el.i18n}.body`, el.bodyEN)}
          </div>
        </Tile>
        <Tile>
          <div style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: T.cardEdge, marginBottom: 5 }}>
            {tx('pack.nature.result.watch', 'Worth keeping an eye on')}
          </div>
          <div style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong }}>
            {tx(`${el.i18n}.watch`, el.watchEN)}
          </div>
          <div style={{ fontFamily: FONT_UI, fontSize: 10.5, color: T.inkFaint, marginTop: 7 }}>
            {tx('pack.nature.result.notDiagnosis', 'This is a conversation to have with your vet — not a diagnosis.')}
          </div>
        </Tile>
      </div>
      {elSecond && (
        <p style={{ fontFamily: FONT_UI, fontSize: 12, color: T.inkWarm, marginTop: 12 }}>
          {tx('pack.nature.result.alsoElement', 'There is a strong second element')}:{' '}
          <strong style={{ color: T.inkStrong }}>{tx(elSecond.i18n, elSecond.labelEN)}</strong>
        </p>
      )}

      {/* ── ZVLÁŠTNE ÚLOHY — 0 až 4 naraz. ────────────────────────────────────
          Štíty stoja v RADE (Matej 20.8.), popisy pod ním v tom istom poradí.
          Štíty sú bez menoviek zámerne: meno nesie popis hneď pod nimi a dvakrát
          by to bola tá istá informácia na pol obrazovky. */}
      {r.specials.length > 0 && (
        <>
          <Rule />
          <Eyebrow>{tx('pack.nature.result.specialLabel', 'Special roles')}</Eyebrow>
          <div className="nq-specrow">
            {r.specials.map((k) => (
              <img key={k} className="nq-specart" src={NATURE_SPECIALS[k].art} alt="" aria-hidden loading="lazy" />
            ))}
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {r.specials.map((k) => {
              const sp = NATURE_SPECIALS[k];
              return (
                <Tile key={k}>
                  <div style={{ fontFamily: FONT_UI, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: T.cardEdge, marginBottom: 5 }}>
                    {tx('pack.nature.result.specialPrefix', 'Special role')}
                  </div>
                  <div style={{ fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase', fontSize: 14, color: T.inkStrong }}>
                    {tx(sp.i18n, sp.labelEN)}
                  </div>
                  <div style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.5, color: T.inkStrong, marginTop: 6 }}>
                    {tx(`${sp.i18n}.desc`, sp.descEN)}
                  </div>
                </Tile>
              );
            })}
          </div>
        </>
      )}

      <Rule />
      <ScoreBreakdown r={r} tx={tx} />
    </Card>
  );
}

/* ── stránka ──────────────────────────────────────────────────────────────── */

type Phase = 'intro' | 'core' | 'special' | 'result';

export default function PackNatureQuiz() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const t = useT();
  const tx = (k: string, f: string) => { const v = t(k); return v === k ? f : v; };

  // `?dog=` je FILTER, nie podmienka (rovnako ako v DOG ID kvíze). Predtým to bol
  // jediný zdroj cieľového psa — a `PackDogs` ho pri viacerých psoch zámerne
  // neposielal, takže `dogId` bolo `null`, zápis sa ticho preskočil a človek prešiel
  // 18 otázok do prázdna. Odteraz sa svorka načíta a parameter ju len zúži.
  const onlyDogId = params.get('dog');

  const [dogs, setDogs] = useState<QuizDog[] | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  /** dogId → qid → optionId */
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  /** dogId → zvláštna úloha → yes/sometimes/no */
  const [specials, setSpecials] = useState<Record<string, Partial<Record<SpecialKey, SpecialAnswer>>>>({});
  const [saved, setSaved] = useState(false);
  const [askLeave, setAskLeave] = useState(false);
  // Zrkadlo stavu pre kliky, ktoré prídu skôr, než React stihne prekresliť.
  const answersRef = useRef<Record<string, Record<string, string>>>({});
  const specialsRef = useRef<Record<string, Partial<Record<SpecialKey, SpecialAnswer>>>>({});
  /** Bežiaci časovač automatického posunu. Musí byť zrušiteľný: kým beží, človek
   *  ešte môže prepnúť odpoveď (alebo stlačiť SPÄŤ) a dva posuny za sebou by
   *  preskočili otázku. */
  const advanceRef = useRef<number | null>(null);
  const clearAdvance = () => {
    if (advanceRef.current !== null) { window.clearTimeout(advanceRef.current); advanceRef.current = null; }
  };
  useEffect(() => clearAdvance, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { if (alive) setDogs([]); return; }
      let q = supabase
        .from('dogs')
        .select('id, dog_name, cloudinary_main_url')
        .eq('user_id', uid)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });
      if (onlyDogId) q = q.eq('id', onlyDogId);
      const { data } = await q;
      if (alive) setDogs((data as QuizDog[]) ?? []);
    })();
    return () => { alive = false; };
  }, [onlyDogId]);

  const list = useMemo(() => dogs ?? [], [dogs]);
  const solo = list.length === 1;

  const total = NATURE_QUESTIONS.length + SPECIAL_KEYS.length;
  // Otázka je hotová, až keď na ňu odpovedali VŠETCI psy — inak by prúžok sľuboval
  // hotovo pri svorke, kde je vyplnený jeden pes z troch.
  const done = useMemo(() => {
    if (list.length === 0) return 0;
    const core = NATURE_QUESTIONS.filter((q) => list.every((d) => answers[d.id]?.[q.id])).length;
    const spec = SPECIAL_KEYS.filter((k) => list.every((d) => specials[d.id]?.[k])).length;
    return core + spec;
  }, [list, answers, specials]);

  const allSpecialsDone = list.length > 0
    && list.every((d) => SPECIAL_KEYS.every((k) => specials[d.id]?.[k]));

  /** Jeden výsledok na psa — `scoreNature` je čistá funkcia, takže sa len zavolá N×. */
  const results = useMemo(() => {
    if (phase !== 'result') return [];
    return list.map((d) => ({ dog: d, r: scoreNature(answers[d.id] ?? {}, specials[d.id] ?? {}) }));
  }, [phase, list, answers, specials]);

  const finish = async (rs: { dog: QuizDog; r: NatureResult }[]) => {
    if (saved || rs.length === 0) return;
    const inputs: DogEventInput[] = [];
    for (const { dog, r } of rs) {
      inputs.push({ dogId: dog.id, field: 'nature.element', value: r.element, source: 'quiz' });
      inputs.push({ dogId: dog.id, field: 'nature.role', value: r.role, source: 'quiz' });
      inputs.push({ dogId: dog.id, field: 'nature.specials', value: r.specials, source: 'quiz' });
      // ROZPAD SA MUSÍ ULOŽIŤ TU, INAK JE NAVŽDY PREČ (Matej 20.8.). Surové odpovede
      // sa neukladajú, takže „koľko mal pes čoho" sa spätne NEDOPOČÍTA — bez tohto
      // riadku žije rozpad len na obrazovke výsledku a odchodom z nej zomrie.
      // `dog_events.value` je `jsonb`, migrácia netreba. Psom, ktorí kvíz prešli
      // pred týmto dňom, sa to doplniť nedá — až pri opakovaní kvízu.
      // ⚠️ `noProgress` v `dogQuiz.ts` toto pole NEMÁ, lebo tam žiadny krok nemá —
      // `nature.scores` je odvodený zápis, nie otázka, a do progresu dokladu nevstupuje.
      inputs.push({ dogId: dog.id, field: 'nature.scores', value: r.scores, source: 'quiz' });
    }
    try {
      await appendDogEvents(inputs);
      setSaved(true);
    } catch {
      /* zápis je bonus — výsledok sa ukáže aj keď zlyhá */
    }
  };

  /** `dogId === null` = celá svorka (klik na vetu). Inak jeden pes (klik na krúžok). */
  const pick = (qid: string, oid: string, dogId: string | null) => {
    const targets = dogId ? [dogId] : list.map((d) => d.id);
    // ⚠️ Číta sa z REFU, nie zo `answers`. Dva kliky v jednom ticku (Hekthor hneď po
    // Kleopatre) by zo stavu čítali tú istú zastaranú hodnotu a druhý by prvý prepísal —
    // presne to sa dialo pri prvom teste: klik na prvého psa sa stratil.
    const next = { ...answersRef.current };
    for (const id of targets) next[id] = { ...next[id], [qid]: oid };
    answersRef.current = next;
    setAnswers(next);
    // AUTOMATICKÝ POSUN (Matej 20.8.). Spustí sa, až keď má otázka odpoveď od
    // KAŽDÉHO psa — pri svorke by inak kliknutie na prvého psa odsunulo obrazovku
    // ostatným spod ruky. Predchádzajúci časovač sa ruší, takže prepnutie odpovede
    // tesne pred odchodom posun iba odloží, nespôsobí dva skoky.
    // ⚠️ Čítať `next`, nie `answers` — stav sa v tomto ticku ešte neprekreslil.
    const everyone = list.length > 0 && list.every((d) => next[d.id]?.[qid]);
    clearAdvance();
    if (everyone) {
      advanceRef.current = window.setTimeout(() => { advanceRef.current = null; goNext(); }, ADVANCE_MS);
    }
  };

  /** Má už otázka odpoveď od KAŽDÉHO psa? Kým nie, ĎALEJ je zhasnuté. */
  const answeredHere = (qid: string) =>
    list.length > 0 && list.every((d) => answers[d.id]?.[qid]);

  const goNext = () => {
    clearAdvance();
    if (idx < NATURE_QUESTIONS.length - 1) setIdx((i) => i + 1);
    else setPhase('special');
  };
  /** SPÄŤ musí najprv zrušiť bežiaci posun — inak by časovač z predošlej otázky
   *  hodil človeka vzápätí zase dopredu a vyzeralo by to, že tlačidlo nefunguje. */
  const goBack = () => { clearAdvance(); setIdx((i) => Math.max(0, i - 1)); };

  const pickSpecial = (k: SpecialKey, a: SpecialAnswer, dogId: string | null) => {
    const targets = dogId ? [dogId] : list.map((d) => d.id);
    const next = { ...specialsRef.current };   // ten istý dôvod ako v `pick`
    for (const id of targets) next[id] = { ...next[id], [k]: a };
    specialsRef.current = next;
    setSpecials(next);
    // ⚠️ ŽIADNY AUTOMATICKÝ SKOK NA VÝSLEDOK. Táto obrazovka má štyri otázky pod
    // sebou a doteraz sa pri dokliknutí poslednej sama prehodila na výsledok —
    // aj keď priamo pod ňou stálo tlačidlo UKÁŽ VÝSLEDOK, ktoré sa tým nedalo
    // nikdy použiť. Rovnaké pravidlo ako v jadre: potvrdzuje človek, nie časovač.
  };

  const restart = () => {
    clearAdvance();
    answersRef.current = {}; specialsRef.current = {};
    setAnswers({}); setSpecials({}); setIdx(0); setSaved(false); setPhase('intro');
  };

  // Je čo stratiť? Stačí JEDNA odpoveď — nie hotová otázka za celú svorku. Človek,
  // ktorý odklikal pol kvízu pre prvého psa, prišiel o rovnako veľa.
  const hasProgress =
    Object.values(answers).some((a) => Object.keys(a).length > 0)
    || Object.values(specials).some((a) => Object.keys(a).length > 0);

  // ODCHOD Z KVÍZU VEDIE NA `/pack/dogs`, NIE NA `/pack` (Matej 18.8.: „ak dám na
  // teste X, cráti ma na homepage a nie na /dogs"). Kvíz sa otvára z dlaždice na
  // `/pack/dogs`, zapisuje do DOG ID a po zavretí má človek stáť tam, odkiaľ prišiel —
  // nie o poschodie vyššie na hube. Rovnako to robí aj DOG ID kvíz (`PackDogQuiz.tsx`).
  // Jedna konštanta, nie päť rozsypaných `navigate()` — presne tie sa rozišli.
  const leave = () => navigate(QUIZ_EXIT);
  // Pýtame sa len tam, kde sa naozaj niečo stratí: úvod nemá čo, výsledok je už
  // zapísaný do DOG ID.
  const requestClose = () => {
    if ((phase === 'core' || phase === 'special') && hasProgress) { setAskLeave(true); return; }
    leave();
  };
  const leaveOverlay = askLeave
    ? <LeaveConfirm tx={tx} onStay={() => setAskLeave(false)} onLeave={leave} />
    : null;

  // Bez psa sa nedá nič zapísať. Predtým to bola TICHÁ strata celého priebehu —
  // preto je to odteraz vidieť hneď na začiatku, nie až (ne)uložením na konci.
  if (dogs !== null && list.length === 0) {
    return (
      <Shell onClose={() => navigate(QUIZ_EXIT)}>
        <Card>
          <Eyebrow>{tx('pack.nature.intro.eyebrow', 'Two questions in one')}</Eyebrow>
          <p style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: T.inkStrong, margin: 0 }}>
            {tx('pack.nature.noDogs', 'This quiz writes its result onto a dog’s card, and there is no dog on your account yet.')}
          </p>
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button type="button" className="nq-gold" onClick={() => navigate('/pack/dogs')}>
              {tx('pack.nature.noDogsCta', 'Back to my dogs')}
            </button>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — intro — */
  if (phase === 'intro') {
    return (
      <Shell onClose={() => navigate(QUIZ_EXIT)} fill>
        {/* ⚠️ `padding` a `overflow` musia ísť INLINE — `Card` si padding píše inline
            a inline vždy prebije triedu `.nq-intro`. */}
        <Card className="nq-intro" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          {/* Obraz je prvý v DOM aj na mobile — pás nad textom, nie pod tlačidlom. */}
          <div className="nq-introart">
            <img src={INTRO_ART} alt="" aria-hidden />
          </div>

          <div className="nq-introbody">
            <Eyebrow>{tx('pack.nature.intro.eyebrow', 'Two questions in one')}</Eyebrow>
            <h1 style={{
              fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
              fontSize: 'clamp(1.35rem, 4.2vw, 2.05rem)', lineHeight: 1.15, color: T.inkStrong,
              margin: 0,
            }}>{tx('pack.nature.intro.title', 'Who is your dog?')}</h1>
            <p style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: T.inkStrong, marginTop: 12 }}>
              {tx('pack.nature.intro.body',
                'Eighteen questions give you two answers at once: what your dog is made of, and what job they do for your family. Nobody taught them that job — they were born into it.')}
            </p>
            <Rule />
            <div className="nq-axes">
              <AxisTile
                icon="yinyang"
                title={tx('pack.nature.intro.axis1', 'Constitution')}
                sub={tx('pack.nature.intro.axis1sub', 'Body, temperament, what to keep an eye on — and what to feed.')}
              />
              <AxisTile
                icon="house-heart"
                title={tx('pack.nature.intro.axis2', 'Role in the pack')}
                sub={tx('pack.nature.intro.axis2sub', 'What your dog is trying to do for your family — and what everyone gets wrong about it.')}
              />
            </div>

            <DogIdNote tx={tx} />

            <div style={{ marginTop: 18 }}>
              <button type="button" className="nq-gold is-big" onClick={() => setPhase('core')}>
                {tx('pack.nature.intro.cta', 'Start')}
              </button>
            </div>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — 14 jadrových otázok — */
  if (phase === 'core') {
    const q = NATURE_QUESTIONS[idx];
    return (
      <Shell onClose={requestClose} fill overlay={leaveOverlay}>
        {/* Karta je široká ako panely `/pack`, ale ČÍTACÍ stĺpec vnútri je zúžený
            (`NQ_READ`) — veta odpovede roztiahnutá na 1000 px sa oku ťažko vracia
            na začiatok riadku. Široký je panel, nie riadok textu. */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <QuizArt />
          <div style={readStyle(list.length)}>
            <Progress
              done={done}
              total={total}
              label={`${tx('pack.nature.question', 'Question')} ${idx + 1} / ${total}`}
            />

            {/* Otázka je najväčší text na obrazovke a stojí na vlastnom riadku so
                zlatou čiarou pod sebou. Predtým mala 1.3rem, teda sotva viac než
                odpovede pod ňou, a splývala s nimi do jedného sivého bloku. */}
            <h2 style={{
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 'clamp(1.2rem,4.4vw,1.65rem)',
              lineHeight: 1.22, letterSpacing: '.01em', color: T.inkStrong, margin: 0,
            }}>{tx(q.i18n, q.labelEN)}</h2>
            {/* Čiara je ukotvená VĽAVO (gradient do stratena vpravo), nie
                symetrická ako `T.rule` — pod nadpisom sa číta ako podčiarknutie,
                symetrická by vyzerala ako oddeľovač sekcie. */}
            <div aria-hidden style={{
              height: 2, width: 132, borderRadius: 2, margin: '13px 0 16px',
              background: `linear-gradient(90deg, ${T.cardEdge}, rgba(201,154,63,0))`,
            }} />

            {idx === 0 && <HowItWorks solo={solo} tx={tx} />}

            <div className="nq-opts">
              {q.options.map((o, oi) => (
                <OptionRow
                  key={o.id}
                  label={tx(o.i18n, o.labelEN)}
                  mark={String.fromCharCode(65 + oi)}
                  dogs={list}
                  solo={solo}
                  isOn={(dogId) => answers[dogId]?.[q.id] === o.id}
                  onPickDog={(dogId) => pick(q.id, o.id, dogId)}
                  onPickAll={() => pick(q.id, o.id, null)}
                />
              ))}
            </div>

            {/* OZNAČ A POTVRĎ — posun vlastní toto tlačidlo, nie časovač po kliku. */}
            <div className="nq-nav">
              <button
                type="button"
                className="nq-ghost"
                disabled={idx === 0}
                onClick={goBack}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {tx('pack.nature.back', 'Back')}
              </button>
              <button
                type="button"
                className="nq-gold"
                disabled={!answeredHere(q.id)}
                onClick={goNext}
              >
                {idx < NATURE_QUESTIONS.length - 1
                  ? tx('pack.nature.next', 'Next')
                  : tx('pack.nature.toSpecial', 'Continue')}
              </button>
            </div>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — 4 doplnkové na zvláštne úlohy — */
  if (phase === 'special') {
    return (
      <Shell onClose={requestClose} fill overlay={leaveOverlay}>
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <QuizArt />
          <div style={readStyle(list.length)}>
            <Progress done={done} total={total} label={tx('pack.nature.progress', 'Progress')} />
            <Eyebrow>{tx('pack.nature.special.eyebrow', 'Four more — looking for special roles')}</Eyebrow>
            <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.inkWarm, marginBottom: 14 }}>
              {tx('pack.nature.special.body',
                'These four roles sit on top of the main one. Most dogs carry none — that is normal.')}
            </p>
            {!solo && <PackHint tx={tx} />}
            <div style={{ display: 'grid', gap: 14, marginTop: solo ? 0 : 12 }}>
              {SPECIAL_KEYS.map((k) => {
                const s = NATURE_SPECIALS[k];
                return (
                  <div key={k}>
                    <div style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.45, color: T.inkStrong, marginBottom: 8 }}>
                      {tx(s.qI18n, s.questionEN)}
                    </div>
                    {/* Pri svorke idú áno/občas/nie POD SEBA ako v jadre kvízu — tri
                        vodorovné tlačidlá plus krúžky by sa do riadku nezmestili.
                        Sólo si ponecháva pôvodný vodorovný trojlístok. */}
                    {solo ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['yes', 'sometimes', 'no'] as SpecialAnswer[]).map((a) => (
                          <button
                            key={a}
                            type="button"
                            className={`nq-tri${specials[list[0]?.id]?.[k] === a ? ' is-on' : ''}`}
                            onClick={() => pickSpecial(k, a, null)}
                          >
                            {tx(`pack.nature.ans.${a}`, a === 'yes' ? 'Yes' : a === 'no' ? 'No' : 'Sometimes')}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="nq-opts">
                        {(['yes', 'sometimes', 'no'] as SpecialAnswer[]).map((a) => (
                          <OptionRow
                            key={a}
                            label={tx(`pack.nature.ans.${a}`, a === 'yes' ? 'Yes' : a === 'no' ? 'No' : 'Sometimes')}
                            dogs={list}
                            solo={false}
                            isOn={(dogId) => specials[dogId]?.[k] === a}
                            onPickDog={(dogId) => pickSpecial(k, a, dogId)}
                            onPickAll={() => pickSpecial(k, a, null)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* SPÄŤ VEDIE NA POSLEDNÚ JADROVÚ OTÁZKU. Doteraz sa z tejto obrazovky
                nedalo vrátiť vôbec — jediná cesta späť bolo X, teda zahodiť celý
                kvíz. Pri 14 zodpovedaných otázkach je to drahá oprava preklepu. */}
            <div className="nq-nav">
              <button
                type="button"
                className="nq-ghost"
                onClick={() => { setIdx(NATURE_QUESTIONS.length - 1); setPhase('core'); }}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {tx('pack.nature.back', 'Back')}
              </button>
              <button
                type="button"
                className="nq-gold"
                disabled={!allSpecialsDone}
                onClick={() => {
                  const rs = list.map((d) => ({ dog: d, r: scoreNature(answers[d.id] ?? {}, specials[d.id] ?? {}) }));
                  setPhase('result');
                  void finish(rs);
                }}
              >
                {tx('pack.nature.special.cta', 'Show the result')}
              </button>
            </div>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — výsledok: jeden na psa — */
  if (results.length === 0) return null;
  return (
    <Shell onClose={() => navigate(QUIZ_EXIT)}>
      {/* JEDEN DOKUMENT NA PSA — fotka a meno sú vnútri karty, nie nad ňou na
          čiernom, a sú tam aj pri sólo psovi. Medzera medzi dokumentami je väčšia
          než čokoľvek vnútri nich, aby bolo vidieť, kde jeden pes končí. */}
      {results.map(({ dog, r }, i) => (
        <div key={dog.id} style={{ marginTop: i === 0 ? 0 : 26 }}>
          <ResultDoc dog={dog} r={r} tx={tx} />
        </div>
      ))}
      {/* JEDINÉ dve tlačidlá kvízu na ČIERNOM podklade — stoja pod kartami, nie v nich.
          Preto `is-ondark`: jasná zlatá so žiarou a svetlý ink v ghoste. */}
      <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="nq-ghost is-ondark" onClick={restart}>
          <RotateCcw className="h-3.5 w-3.5" /> {tx('pack.nature.result.again', 'Take it again')}
        </button>
        <button type="button" className="nq-gold is-ondark" onClick={() => navigate(QUIZ_EXIT)}>
          {tx('pack.nature.result.done', 'Done')}
        </button>
      </div>
      {saved && (
        <p style={{ fontFamily: FONT_UI, fontSize: 11, color: 'rgba(245,240,228,0.55)', marginTop: 12, textAlign: 'center' }}>
          <Check className="h-3 w-3 inline" />{' '}
          {solo
            ? tx('pack.nature.result.saved', 'Saved to your dog’s card')
            : tx('pack.nature.result.savedAll', 'Saved to every dog’s card')}
        </p>
      )}
      <Attribution tx={tx} />
    </Shell>
  );
}
