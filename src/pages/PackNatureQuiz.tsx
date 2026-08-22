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
  ELEMENT_QUESTIONS, ROLE_QUESTIONS, BALANCE_ITEMS, BALANCE_VET_NOTE,
  NATURE_ELEMENTS, NATURE_ROLES, NATURE_SPECIALS,
  SPECIAL_KEYS, ELEMENT_KEYS, ROLE_KEYS, NATURE_ATTRIBUTION, scoreNature, scoreBalance,
  natureTitleEN, natureResultFromStored, hasNatureScores, guidanceFor, NUTRITION_DISCLAIMER,
  type SpecialAnswer, type SpecialKey, type NatureResult, type Guidance,
  type BalanceResult, type BalanceItem, type ElementKey,
} from '@/components/pack/natureQuiz';
import { BrandIcon } from '@/components/pack/BrandIcon';
import { appendDogEvents, readLatestForDogs, type DogEventInput } from '@/lib/dogEvents';
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
/**
 * Výsledok otvorený z DOG ID sa musí vrátiť NA TEN DOKLAD, nie o poschodie vyššie
 * na zoznam psov (Matej 22. 8.: „následne sa vrátiť na dog id šípkou").
 *
 * ⚠️ Cieľ sa skladá z `?dog=`, nie z cesty v URL. Parameter `from` nesie len príznak
 * `id` — keby niesol celú cestu, dal by sa cez odkaz poslať človek kamkoľvek.
 * Vracia `null`, keď sa neprišlo z dokladu; volajúci vtedy použije `QUIZ_EXIT`.
 */
function exitFor(from: string | null, dogId: string | null): string | null {
  return from === 'id' && dogId ? `/pack/dogs/${dogId}` : null;
}

interface QuizDog {
  id: string; dog_name: string | null; cloudinary_main_url: string | null;
  /** Heroglyf do hlavičky dokumentu. Vykresľuje sa VOĽNE na papyruse, bez rámu —
   *  je to sám o sebe kartuša a druhý rám z neho spraví nálepku. */
  heroglyph_png_url: string | null;
}

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
.nq-axes{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.nq-axis{
  /* ŽIADNY pomer strán. Pri dvoch dlaždiciach bol štvorec pekný, pri troch má
     dlaždica ~225 px a text „what everyone gets wrong about it" sa doň nezmestí —
     orezal by sa. Rovnakú výšku drží stretch mriežky, teda najvyšší súrodenec. */
  min-height:186px;
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
  /* Pod 760 px idú POD SEBA. Tri stĺpce by na telefóne dali ~110 px na dlaždicu —
     nadpis „ROLE IN THE PACK" by sa lámal na tri riadky. */
  .nq-axes{ grid-template-columns:1fr; gap:10px; }
  .nq-axis{ min-height:0; }
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
.nqd-framed{ border:3px solid #8a5c10; border-radius:4px; padding:7px; margin:0; }
.nqd-inner{ border:1px solid rgba(122,80,16,0.28); border-radius:2px; padding:30px 28px 34px; }

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
  font-family:'Cinzel Decorative','Cinzel',serif; font-weight:900; letter-spacing:.03em;
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
  width:172px; text-align:center; padding:16px 10px 14px; border:1px solid rgba(122,80,16,0.28);
  border-radius:12px; background:rgba(255,255,255,.24); position:relative;
  display:flex; flex-direction:column;
}
.nqd-slot::before,.nqd-slot::after{ content:''; position:absolute; width:9px; height:9px; border:1px solid #8a5c10; }
.nqd-slot::before{ top:5px; left:5px; border-right:0; border-bottom:0; }
.nqd-slot::after{ bottom:5px; right:5px; border-left:0; border-top:0; }
.nqd-rank{ font-family:'Cinzel',serif; font-weight:900; font-size:10px; letter-spacing:.2em; color:#8a5c10; opacity:.8; }
.nqd-art{ height:116px; display:grid; place-items:center; margin:6px 0 8px; }
.nqd-art img{ width:104px; margin:0; filter:drop-shadow(0 8px 18px rgba(60,38,8,.32)); }
.nqd-slot.spec .nqd-art img{ width:88px; }
.nqd-lbl{
  margin-top:auto; font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:8.5px;
  letter-spacing:.2em; text-transform:uppercase; color:#7a5a2a;
}
.nqd-nm{
  font-family:'Cinzel',serif; font-weight:900; font-size:15px; letter-spacing:.02em;
  text-transform:uppercase; color:#1a0900; margin-top:2px; line-height:1.2;
}
.nqd-slot.spec .nqd-nm{ font-size:13.5px; }

/* ── NADPISY SEKCIÍ ───────────────────────────────────────────────────────
   ⚠️ Číslo sekcie MUSÍ sedieť s číslom odznaku v hlavičke. I = konštitúcia na
   oboch miestach — číslo je sľub, buď platí dvakrát, alebo tam nemá čo robiť. */
.nqd-head{ text-align:center; margin:0 0 18px; }
.nqd-head .num{ font-family:'Cinzel',serif; font-weight:900; font-size:12px; letter-spacing:.34em; color:#8a5c10; }
.nqd-head h2{
  font-family:'Cinzel',serif; font-weight:900; font-size:27px; letter-spacing:.07em;
  text-transform:uppercase; color:#1a0900; margin:5px 0 0; line-height:1.1;
}
.nqd-head .sub{ font-family:'Space Grotesk',sans-serif; font-size:11.5px; color:#7a5a2a; margin-top:6px; }
.nqd-wing{ display:flex; align-items:center; justify-content:center; gap:8px; margin-top:9px; }
.nqd-wing i{ width:64px; height:1px; background:linear-gradient(90deg,transparent,#8a5c10); }
.nqd-wing i:last-child{ background:linear-gradient(90deg,#8a5c10,transparent); }
.nqd-wing s{ width:6px; height:6px; background:#8a5c10; transform:rotate(45deg); }

/* ── PANELY (rohové značky, dva stupne) ───────────────────────────────── */
.nqd-panel{
  position:relative; border:1px solid #8a5c10; border-radius:10px; padding:20px 20px 18px;
  background:rgba(255,252,242,.42);
}
.nqd-panel::before,.nqd-panel::after{ content:''; position:absolute; width:14px; height:14px; border:2px solid #8a5c10; }
.nqd-panel::before{ top:-1px; left:-1px; border-right:0; border-bottom:0; border-radius:10px 0 0 0; }
.nqd-panel::after{ bottom:-1px; right:-1px; border-left:0; border-top:0; border-radius:0 0 10px 0; }
.nqd-panel.quiet{ border-color:rgba(122,80,16,0.28); background:rgba(122,80,16,.05); }
.nqd-panel.quiet::before,.nqd-panel.quiet::after{ border-color:rgba(122,80,16,0.28); }

.nqd-eyebrow{
  font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:9.5px; letter-spacing:.26em;
  text-transform:uppercase; color:#8a5c10; margin:0 0 8px;
}
.nqd p.body{ font-family:'Space Grotesk',sans-serif; font-size:13.5px; line-height:1.65; color:#1a0900; margin:0 0 10px; }
.nqd p.dim{ font-family:'Space Grotesk',sans-serif; font-size:12.5px; line-height:1.6; color:#5a3a0a; margin:0; }
/* Zvýraznenie nesú DÁTA (**takto**), sadzba mu len dá váhu. */
.nqd b{ font-weight:600; color:#1a0900; }

.nqd-list{ margin:0; padding:0; display:grid; gap:10px; }
.nqd-list li{
  list-style:none; position:relative; padding-left:20px;
  font-family:'Space Grotesk',sans-serif; font-size:13.5px; line-height:1.6; color:#1a0900;
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
  text-align:center; padding:14px 10px 12px; border:1px solid #8a5c10; border-radius:10px;
  background:rgba(255,252,242,.5); position:relative;
}
.nqd-cnbox::before,.nqd-cnbox::after{ content:''; position:absolute; width:12px; height:12px; border:1px solid #8a5c10; }
.nqd-cnbox::before{ top:4px; left:4px; border-right:0; border-bottom:0; }
.nqd-cnbox::after{ bottom:4px; right:4px; border-left:0; border-top:0; }
.nqd-cn{ font-size:64px; line-height:1; color:#1a0900; font-weight:500; }
.nqd-cnname{
  font-family:'Cinzel',serif; font-weight:900; font-size:16px; letter-spacing:.1em;
  text-transform:uppercase; color:#1a0900; margin-top:8px;
}
.nqd-cnpin{ font-family:'Space Grotesk',sans-serif; font-size:11px; color:#7a5a2a; font-style:italic; }
/* ⚠️ Päť PEVNÝCH stĺpcov. auto-fit zalomí 4+1 a Colour ostane sama ako nedorobok. */
.nqd-facts{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-top:14px; }
.nqd-fact{ border:1px solid rgba(122,80,16,0.28); border-radius:8px; padding:8px 10px; background:rgba(255,255,255,.22); }
.nqd-fact .k{
  display:block; font-family:'Space Grotesk',sans-serif; font-weight:500; font-size:8.5px;
  letter-spacing:.2em; text-transform:uppercase; color:#7a5a2a;
}
.nqd-fact .v{ display:block; font-family:'Cinzel',serif; font-weight:700; font-size:12.5px; color:#1a0900; margin-top:2px; }

/* ── IV · USMERNENIE ──────────────────────────────────────────────────────
   Kombinačný riadok stojí SAMOSTATNE nad omylmi. Je to jediná veta dokumentu,
   kde sa obe osi stretnú — zamiešaná medzi šestnásť riadkov by zanikla. */
.nqd-pair{ position:relative; border:1px solid #8a5c10; border-radius:10px; padding:16px 18px;
  background:linear-gradient(135deg, rgba(245,199,61,.16), rgba(230,158,26,.09)); margin-bottom:20px; }
.nqd-pair .cross{
  font-family:'Cinzel',serif; font-weight:900; font-size:10px; letter-spacing:.24em;
  text-transform:uppercase; color:#8a5c10; margin-bottom:6px;
}
.nqd-cat{ margin-top:20px; }
.nqd-cat:first-of-type{ margin-top:4px; }
.nqd-cap{ display:flex; align-items:center; gap:10px; margin-bottom:11px; }
.nqd-cap h3{
  font-family:'Cinzel',serif; font-weight:900; font-size:14px; letter-spacing:.16em;
  text-transform:uppercase; color:#1a0900; margin:0; white-space:nowrap;
}
.nqd-cap i{ flex:1; height:1px; background:linear-gradient(90deg,#8a5c10,transparent); }
.nqd-rules{ display:grid; gap:12px; margin:0; padding:0; }
.nqd-rules li{ list-style:none; display:grid; grid-template-columns:30px 1fr; gap:12px; align-items:start; }
.nqd-rules .n{ font-family:'Cinzel',serif; font-weight:900; font-size:14px; color:#8a5c10; text-align:right; line-height:1.3; }
.nqd-rules b.t{
  display:block; font-family:'Cinzel',serif; font-weight:700; font-size:12.5px; letter-spacing:.06em;
  text-transform:uppercase; color:#1a0900; margin-bottom:3px;
}
.nqd-rules span.d{ font-family:'Space Grotesk',sans-serif; font-size:13px; line-height:1.6; color:#5a3a0a; }

/* ── V · ROZPAD (pentagram) ───────────────────────────────────────────── */
.nqd-radars{ display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:center; }
.nqd-radar{ width:100%; max-width:340px; margin-inline:auto; display:block; }
.nqd-note{ font-family:'Space Grotesk',sans-serif; font-size:11.5px; color:#7a5a2a; margin:14px 0 0; text-align:center; }
.nqd-foot{ display:flex; align-items:flex-end; gap:16px; }
.nqd-foot p{ flex:1; font-family:'Space Grotesk',sans-serif; font-size:10.5px; color:#5a3a0a; line-height:1.55; margin:0; }
.nqd-seal{ width:98px; opacity:.9; flex:0 0 auto; }

@media(max-width:900px){ .nqd-facts{ grid-template-columns:repeat(3,1fr); } }
@media(max-width:720px){
  .nqd-inner{ padding:20px 15px 24px; }
  .nqd-who{ font-size:29px; }
  .nqd-head h2{ font-size:21px; }
  .nqd-elhero{ grid-template-columns:1fr; gap:14px; }
  .nqd-cnbox{ max-width:150px; margin-inline:auto; }
  .nqd-duo{ grid-template-columns:1fr; }
  .nqd-radars{ grid-template-columns:1fr; }
}
@media(max-width:520px){
  .nqd-facts{ grid-template-columns:repeat(2,1fr); }
  .nqd-medal{ width:124px; height:124px; }
  .nqd-slot{ width:calc(50% - 5px); }
  .nqd-foot{ flex-direction:column; align-items:center; text-align:center; gap:12px; }
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

/* ── stavebné diely DOKUMENTU výsledku (predloha kolo4.html) ──────────────── */

/**
 * Zvýraznenie nesú DÁTA, nie sadzba (Matej 21.8.: „bold pri určitých slovách ktoré
 * majú váhu"). Texty v `natureQuiz.ts` píšu `**takto**` a toto ich rozreže.
 *
 * ⚠️ ZÁMERNE NIE `dangerouslySetInnerHTML`. Tie isté reťazce pôjdu raz cez i18n
 * a HTML v prekladových kľúčoch je diera — prekladateľ (aj stroj) doň vie vložiť
 * čokoľvek. Značka `**` je neškodná aj keď ju preklad pokazí: najhoršie, čo sa
 * stane, je viditeľná hviezdička.
 */
function Bold({ s }: { s: string }) {
  // Nepárny počet `**` = pokazený preklad. Posledný kus zostane obyčajným textom,
  // nič sa nezahodí — text je vždy dôležitejší než jeho tučnosť.
  const parts = s.split('**');
  return <>{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}</>;
}

/** Ornament medzi sekciami: čiara – kosoštvorce – čiara (jazyk certifikátu). */
function Orn() {
  return <div className="nqd-orn"><i /><s /><s className="big" /><s /><i /></div>;
}

/** ⚠️ `num` MUSÍ sedieť s poradím odznakov v hlavičke — viď komentár v `ResultDoc`. */
function SecHead({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div className="nqd-head">
      <div className="num">{num}</div>
      <h2>{title}</h2>
      {sub && <div className="sub">{sub}</div>}
      <div className="nqd-wing"><i /><s /><i /></div>
    </div>
  );
}

/**
 * Jeden smer usmernenia (omyly / detaily). Riadky prichádzajú z matice
 * (`guidanceFor`), takže ich počet kolíše 2–6 podľa zvláštnych úloh.
 *
 * Prázdny smer sa NEVYKRESLÍ — nadpis nad ničím tvrdí, že sa niečo nenačítalo.
 * Nastať to môže: pes bez zvláštnych úloh má vždy aspoň 2+2 riadky, ale keby sa
 * matica raz orezala, nech to zmizne ticho a nie ako rozbitá stránka.
 */
function GuideLane({ title, from, rows, tx }: {
  title: string; from: string; rows: Guidance[]; tx: (k: string, f: string) => string;
}) {
  if (!rows.length) return null;
  return (
    <div className="nqd-cat">
      <div className="nqd-cap"><h3>{title}</h3><i /></div>
      <p className="dim" style={{ fontSize: 11, margin: '-6px 0 10px' }}>{from}</p>
      <ol className="nqd-rules">
        {rows.map((row, i) => (
          <li key={row.i18n}>
            {/* Číslo je len poradie NA OBRAZOVKE (01, 02…), preklad sa ním neriadi —
                ten visí na `row.i18n`, ktoré je odvodené z dát. */}
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <b className="t">{tx(`${row.i18n}.title`, row.titleEN)}</b>
              <span className="d"><Bold s={tx(`${row.i18n}.text`, row.textEN)} /></span>
            </span>
          </li>
        ))}
      </ol>
    </div>
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
 * Kreslí sa aj nula — „tento pes v sebe nemá nič z kovu" je informácia, nie diera.
 *
 * ROZPAD = PENTAGRAM (Matejova voľba 21. 8.). Ten istý rozpad ako TVAR — päť osí,
 * päť hodnôt, jeden pohľad. Pruhová vetva ostáva ako druhá možnosť v nákrese
 * `plany/vyslednica-navrhy/kolo4.html` (má prepínač); v appke je default pentagram.
 */
function Pentagram({ rows, color }: {
  rows: { label: string; cn?: string; value: number; top: boolean }[];
  color: string;
}) {
  // ⚠️ PLÁTNO JE ŠIRŠIE NEŽ PENTAGRAM. Popisky sedia na 1,26× polomeru — pri tesnom
  // viewBoxe ich orezalo na „OOD" a „HERA".
  const R = 88, cx = 150, cy = 124, n = rows.length;
  const max = Math.max(...rows.map((r) => Math.max(0, r.value)), 0);
  const pt = (i: number, f: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f];
  };
  const ring = (f: number) => rows.map((_, i) => pt(i, f).join(',')).join(' ');
  const shape = rows.map((r, i) => pt(i, max ? (Math.max(0, r.value) / max) * 0.94 : 0).join(',')).join(' ');

  return (
    <svg className="nqd-radar" viewBox="0 0 300 258" role="img" aria-hidden>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none"
          stroke={`rgba(122,80,16,${f === 1 ? 0.45 : 0.2})`} strokeWidth={1} />
      ))}
      {rows.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(122,80,16,.28)" strokeWidth={1} />;
      })}
      <polygon points={shape} fill={color} fillOpacity={0.34} stroke={color} strokeWidth={2} />
      {rows.map((r, i) => {
        const [x, y] = pt(i, max ? (Math.max(0, r.value) / max) * 0.94 : 0);
        return <circle key={i} cx={x} cy={y} r={3.4} fill={color} />;
      })}
      {/* Víťaznú os treba vidieť aj bez čítania čísel — tmavší inkoust a väčšie
          písmo. Bez toho je pentagram len tvar a človek hľadá, ktorý hrot je jeho.
          Čínsky znak nesú len osi elementov; úlohy ho nemajú a riadok sa vynechá. */}
      {rows.map((r, i) => {
        const [x, y] = pt(i, 1.26);
        return (
          <g key={i}>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fontFamily="Cinzel, serif" fontSize={r.top ? 12 : 10.5} fontWeight={r.top ? 900 : 700}
              fill={r.top ? '#1a0900' : '#5a3a0a'} letterSpacing="0.5">
              {r.label.toUpperCase()}
            </text>
            {r.cn && (
              <text x={x} y={y + 15} textAnchor="middle" dominantBaseline="middle"
                fontSize={14} fill="#8a5c10" opacity={0.85}>{r.cn}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Sekcia V dokumentu. Dva pentagramy — konštitúcia a úloha. */
function ScoreBreakdown({ r, tx }: { r: NatureResult; tx: (k: string, f: string) => string }) {
  return (
    <>
      <div className="nqd-radars">
        <div>
          <p className="nqd-eyebrow" style={{ textAlign: 'center' }}>
            {tx('pack.nature.result.elementLabel', 'Constitution')}
          </p>
          <Pentagram color="#8a5c10" rows={ELEMENT_KEYS.map((k) => ({
            label: tx(NATURE_ELEMENTS[k].i18n, NATURE_ELEMENTS[k].labelEN),
            cn: NATURE_ELEMENTS[k].cn,
            value: r.scores.el[k],
            top: k === r.element,
          }))} />
        </div>
        <div>
          <p className="nqd-eyebrow" style={{ textAlign: 'center' }}>
            {tx('pack.nature.result.roleLabel', 'Role in the pack')}
          </p>
          <Pentagram color="#a8332a" rows={ROLE_KEYS.map((k) => ({
            label: tx(NATURE_ROLES[k].i18n, NATURE_ROLES[k].labelEN),
            value: r.scores.role[k],
            top: k === r.role,
          }))} />
        </div>
      </div>
      {/* Vysvetlivka stojí RAZ pod celou sekciou — pod každým pentagramom zvlášť to
          bola tá istá veta dvakrát na jednej obrazovke. */}
      <p className="nqd-note">
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
/* ── I·b · ROVNOVÁHA (kvíz 2) ─────────────────────────────────────────────────
   Stojí HNEĎ ZA konštitúciou, lebo sa k nej vzťahuje: nadbytok a nedostatok sú
   posuny toho istého elementu. Vykresľuje sa len keď človek niečo zaškrtol —
   prázdny zoznam je najčastejšia a najlepšia odpoveď a prázdna sekcia by z nej
   robila chýbajúci údaj.

   🔴 DIAGNÓZY DOSTÁVAJÚ INÚ VETU NEŽ PREJAVY, a to je celá poistka tejto vrstvy.
   Zdrojový hárok Dr. Judy dáva na nádor v mieche rovnakú odpoveď ako na suchú
   srsť („feed X"). Tu sa diagnózy do obrazu rovnováhy počítajú, ale rada k miske
   sa k nim nepíše — patrí k nim `BALANCE_VET_NOTE` a nič iné.

   🔑 VÝŽIVA OPORY SA VYKRESĽUJE TU, NIE ODKAZOM (22. 8. 2026). Do tohto dňa tu
   stála veta „ich výživa hore je odkiaľ začať" — lenže „hore" je výživa psovho
   VLASTNÉHO elementu (`el = NATURE_ELEMENTS[r.element]`), kým opora je spravidla
   iný element. Majiteľ teda dostal príkaz „opri sa o Vodu" a odkaz na text, ktorý
   na stránke nebol. Tým sa celý kvíz 2 zmenšil na holé meno elementu — presne
   preto pôsobil, že nič nerobí.
   ⚠️ Opora, ktorá sa ROVNÁ psovmu elementu, sa nevykresľuje znova (pri nedostatku
   je prvou oporou vždy element sám). V tom prípade — a len v ňom — je pôvodná veta
   „ich výživa hore" VECNE SPRÁVNA, tak zostáva. */
function BalanceSection({ b, own, tx }: {
  b: BalanceResult; own: ElementKey; tx: (k: string, f: string) => string;
}) {
  if (!b.top) return null;
  const dir = b.top.side === 'excess'
    ? tx('pack.nature.balance.excess', 'too much')
    : tx('pack.nature.balance.deficiency', 'not enough');
  const leaning = tx(NATURE_ELEMENTS[b.top.element].i18n, NATURE_ELEMENTS[b.top.element].labelEN);
  /** Opory, ktoré na stránke ešte nie sú. Prázdne pole = všetko je už v sekcii I. */
  const extra = b.top.support.filter((k) => k !== own);
  const chip = (it: BalanceItem) => (
    <span key={it.id} className="pf-pill" style={{
      fontFamily: FONT_UI, fontSize: 11.5, padding: '5px 11px', borderRadius: 999,
      border: `1px solid ${T.border}`, background: T.tileBg, color: T.inkStrong,
    }}>{tx(it.i18n, it.labelEN)}</span>
  );
  return (
    <>
      <SecHead num="I·b"
        title={tx('pack.nature.doc.ib.title', 'Where the balance is leaning')}
        sub={tx('pack.nature.doc.ib.sub', 'What you ticked, read the way Chinese medicine reads it')}
      />
      <p style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: T.inkStrong, margin: '0 0 12px' }}>
        {tx('pack.nature.balance.reading', 'In Traditional Chinese Medicine this reads as')}{' '}
        <b>{dir} {leaning}</b>.
      </p>

      {b.signs.length > 0 && (
        <div className="nqd-panel quiet">
          <p className="nqd-eyebrow">{tx('pack.nature.balance.signs', 'What you ticked')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>{b.signs.map(chip)}</div>
          {b.top.support.length > 0 && (
            <p className="dim" style={{ marginTop: 11 }}>
              {tx('pack.nature.balance.support', 'The elements to lean on here are')}{' '}
              <b>{b.top.support.map((k) => tx(NATURE_ELEMENTS[k].i18n, NATURE_ELEMENTS[k].labelEN)).join(' · ')}</b>
              {'. '}
              {extra.length === 0
                // Opora = psov vlastný element. „Hore" je vtedy naozaj hore.
                ? tx('pack.nature.balance.supportHow',
                  'Their food notes above are where to start — this is a leaning, not a prescription.')
                : tx('pack.nature.balance.supportBelow',
                  'Where to start is right below — this is a leaning, not a prescription.')}
            </p>
          )}
        </div>
      )}

      {/* Výživa opory. Ten istý zámok ako v sekcii I (`natureQuiz.ts`): sklon,
          suroviny a réžia misky ÁNO — dávky, doplnky a liečba NIE. Preto sa berie
          `foodEN` toho istého datasetu, nič sa pre rovnováhu nepíše zvlášť. */}
      {extra.map((k) => {
        const s = NATURE_ELEMENTS[k];
        return (
          <div key={k} className="nqd-panel" style={{ marginTop: 12 }}>
            <p className="nqd-eyebrow">
              {tx(s.i18n, s.labelEN)} · {tx('pack.nature.doc.food', 'What suits them')}
            </p>
            <ul className="nqd-list tight">
              {s.foodEN.map((t, i) => <li key={i}><Bold s={tx(`${s.i18n}.food${i}`, t)} /></li>)}
            </ul>
          </div>
        );
      })}

      {/* Tmavý podblok — jediná výnimka z papyrusového locku, siaha sa po nej za
          VÝZNAM. Presne ako ZÁVET na DOG ID: sekcia, ktorá hovorí o chorobe, nesmie
          mať na papyruse rovnakú váhu ako obľúbená maškrta. */}
      {b.diagnoses.length > 0 && (
        <div style={{ ...PACK_BOX.subblockDark, padding: '14px 16px', marginTop: 12 }}>
          <p className="nqd-eyebrow" style={{ color: T.cardEdge }}>
            {tx('pack.nature.balance.vet', 'This belongs with your vet')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0 10px' }}>
            {b.diagnoses.map((it) => (
              <span key={it.id} className="pk-pill--dark" style={{
                fontFamily: FONT_UI, fontSize: 11.5, padding: '5px 11px', borderRadius: 999,
                border: `1px solid ${T.cardEdge}`, background: 'rgba(201,154,63,0.10)', color: T.onDark,
              }}>{tx(it.i18n, it.labelEN)}</span>
            ))}
          </div>
          <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.6, color: T.onDarkDim, margin: 0 }}>
            {tx(BALANCE_VET_NOTE.i18n, BALANCE_VET_NOTE.textEN)}
          </p>
        </div>
      )}
      <Orn />
    </>
  );
}

function ResultDoc({ dog, r, b, tx }: {
  dog: QuizDog; r: NatureResult; b?: BalanceResult; tx: (k: string, f: string) => string;
}) {
  const role = NATURE_ROLES[r.role];
  const el = NATURE_ELEMENTS[r.element];
  const second = r.roleSecond ? NATURE_ROLES[r.roleSecond] : null;
  const elSecond = r.elementSecond ? NATURE_ELEMENTS[r.elementSecond] : null;
  const name = (dog.dog_name || '').trim().toUpperCase();
  const g = guidanceFor(r);
  const specials = r.specials.map((k) => NATURE_SPECIALS[k]);

  return (
    <div className="nqd">
      <div className="nqd-framed"><div className="nqd-inner">

        {/* ── HLAVIČKA: fotka · meno · heroglyf · tri odznaky ─────────────────
            POD MENOM NIE JE PODTITUL. „The Defender · Metal" je preč (Matej 21.8.) —
            tú istú vec povedia odznaky pod heroglyfom, a to s obrázkom a poradím. */}
        <div className="nqd-medal">
          {dog.cloudinary_main_url
            ? <img src={dog.cloudinary_main_url} alt="" aria-hidden />
            : <span>{(dog.dog_name || '?').trim().charAt(0).toUpperCase()}</span>}
        </div>
        {name && <div className="nqd-who">{name}</div>}
        {/* Heroglyf sa vykreslí len ak ho pes má. Prázdny rámik by na papyruse
            vyzeral ako chýbajúci obrázok, nie ako „tento pes ho ešte nemá". */}
        {dog.heroglyph_png_url && (
          <img className="nqd-glyph" src={dog.heroglyph_png_url} alt="" aria-hidden loading="lazy" />
        )}

        {/* ⚠️ PORADIE ODZNAKOV = PORADIE SEKCIÍ. I konštitúcia · II úloha · III zvláštna.
            V 3. kole bolo hore I = konštitúcia, ale sekcia I opisovala úlohu (Matej:
            „označil si I ako konštitúciu ale dolu si dal 1 ako defender, nesedí to").
            Číslo je sľub — buď platí na oboch miestach, alebo tam nemá čo robiť.
            Zvláštnych úloh je 0–4: pri nule slot III vôbec nevznikne (dva odznaky),
            pri dvoch až štyroch stoja VŠETKY v rade a rad sa zalomí. */}
        <div className="nqd-trio">
          <div className="nqd-slot">
            <div className="nqd-rank">I</div>
            <div className="nqd-art"><img src={el.art} alt="" aria-hidden loading="lazy" /></div>
            <div className="nqd-lbl">{tx('pack.nature.result.elementLabel', 'Constitution')}</div>
            <div className="nqd-nm">{tx(el.i18n, el.labelEN)}</div>
          </div>
          <div className="nqd-slot">
            <div className="nqd-rank">II</div>
            <div className="nqd-art"><img src={role.art} alt="" aria-hidden loading="lazy" /></div>
            <div className="nqd-lbl">{tx('pack.nature.result.roleLabel', 'Role in the pack')}</div>
            <div className="nqd-nm">{tx(role.i18n, role.labelEN)}</div>
          </div>
          {specials.map((sp) => (
            <div className="nqd-slot spec" key={sp.key}>
              <div className="nqd-rank">III</div>
              <div className="nqd-art"><img src={sp.art} alt="" aria-hidden loading="lazy" /></div>
              <div className="nqd-lbl">{tx('pack.nature.result.specialPrefix', 'Special role')}</div>
              <div className="nqd-nm">{tx(sp.i18n, sp.labelEN)}</div>
            </div>
          ))}
        </div>

        <Orn />

        {/* ── I · KONŠTITÚCIA ────────────────────────────────────────────────
            Ide PRVÁ, lebo drží telo a misku — teda to, čo majiteľ rieši denne.
            🔴 Toto je JEDINÁ os, ktorá smie hovoriť o výžive. Úloha o miske
            nehovorí nič (`reference_dogypt_element_vs_uloha_co_hovori_co`). */}
        <SecHead num="I"
          title={tx('pack.nature.doc.i.title', 'The constitution')}
          sub={tx('pack.nature.doc.i.sub', 'What they are made of — body, bowl and season. After Traditional Chinese Medicine.')} />

        <div className="nqd-elhero">
          {/* Znak je pečať elementu, nie ozdoba — vlastný rám a najväčšie písmeno
              dokumentu po mene psa. */}
          <div className="nqd-cnbox">
            <div className="nqd-cn">{el.cn}</div>
            <div className="nqd-cnname">{tx(el.i18n, el.labelEN)}</div>
            <div className="nqd-cnpin">{el.pinyin}</div>
          </div>
          <div>
            <p className="body" style={{ fontSize: 15 }}><Bold s={tx(`${el.i18n}.summary`, el.summaryEN)} /></p>
            {/* ⚠️ Päť PEVNÝCH stĺpcov, nie auto-fit — inak sa to zalomí 4+1. */}
            <div className="nqd-facts">
              {([
                ['pack.nature.fact.season', 'Season', el.facts.seasonEN, 'season'],
                ['pack.nature.fact.organs', 'Organs', el.facts.organsEN, 'organs'],
                ['pack.nature.fact.emotion', 'Emotion', el.facts.emotionEN, 'emotion'],
                ['pack.nature.fact.taste', 'Taste', el.facts.tasteEN, 'taste'],
                ['pack.nature.fact.colour', 'Colour', el.facts.colourEN, 'colour'],
              ] as const).map(([k, kf, v, id]) => (
                <div className="nqd-fact" key={id}>
                  <span className="k">{tx(k, kf)}</span>
                  <span className="v">{tx(`${el.i18n}.facts.${id}`, v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="nqd-panel" style={{ marginTop: 16 }}>
          <p className="nqd-eyebrow">{tx('pack.nature.doc.traits', 'How it shows in a normal day')}</p>
          <ul className="nqd-list">
            {el.traitsEN.map((t, i) => (
              <li key={i}><Bold s={tx(`${el.i18n}.trait${i}`, t)} /></li>
            ))}
          </ul>
        </div>

        {/* VÝŽIVA. Úroveň je zamknutá v hlavičke `natureQuiz.ts`: sklon, suroviny
            a réžia misky ÁNO — dávky, doplnky a liečba NIE. Veta o veterinárovi
            stojí PRIAMO tu, nie schovaná v päte. */}
        <div className="nqd-duo">
          <div className="nqd-panel">
            <p className="nqd-eyebrow">{tx('pack.nature.doc.food', 'What suits them')}</p>
            <ul className="nqd-list tight">
              {el.foodEN.map((t, i) => <li key={i}><Bold s={tx(`${el.i18n}.food${i}`, t)} /></li>)}
            </ul>
          </div>
          <div className="nqd-panel">
            <p className="nqd-eyebrow">{tx('pack.nature.doc.avoid', 'What works against them')}</p>
            <ul className="nqd-list tight">
              {el.avoidEN.map((t, i) => <li key={i}><Bold s={tx(`${el.i18n}.avoid${i}`, t)} /></li>)}
            </ul>
          </div>
        </div>
        <p className="dim" style={{ fontSize: 10.5, marginTop: 9, textAlign: 'center' }}>
          {tx(NUTRITION_DISCLAIMER.i18n, NUTRITION_DISCLAIMER.textEN)}
        </p>

        <div className="nqd-duo">
          <div className="nqd-panel quiet">
            <p className="nqd-eyebrow">{tx('pack.nature.result.body', 'Body')}</p>
            <p className="dim"><Bold s={tx(`${el.i18n}.body`, el.bodyEN)} /></p>
          </div>
          <div className="nqd-panel quiet">
            <p className="nqd-eyebrow">{tx('pack.nature.result.watch', 'Worth keeping an eye on')}</p>
            <p className="dim"><Bold s={tx(`${el.i18n}.watch`, el.watchEN)} /></p>
            <p className="dim" style={{ fontSize: 10.5, color: '#7a5a2a', marginTop: 9 }}>
              {tx('pack.nature.result.notDiagnosis',
                'This is a conversation to have with your vet — not a diagnosis.')}
            </p>
          </div>
        </div>

        {elSecond && (
          <p className="dim" style={{ textAlign: 'center', marginTop: 12 }}>
            {tx('pack.nature.result.alsoElement', 'There is a strong second element')}:{' '}
            <b>{tx(elSecond.i18n, elSecond.labelEN)}</b>
          </p>
        )}

        <Orn />

        {b && <BalanceSection b={b} own={r.element} tx={tx} />}

        {/* ── II · ÚLOHA VO SVORKE ───────────────────────────────────────────
            Hovorí o RÉŽII DŇA — koľko práce a koľko vypnutia. O jedle nikdy.
            `functionEN` sa tu ZÁMERNE nevykresľuje (Matej 21.8. ju zrušil):
            abstraktná definícia pred konkrétnymi príkladmi je zbytočné poschodie.
            Pole v dátach ostáva, používa ho ešte hub. */}
        <SecHead num="II"
          title={tx('pack.nature.doc.ii.title', 'The role in the pack')}
          sub={tx('pack.nature.doc.ii.sub', 'What they hold for the pack — and how much work and rest that means')} />

        <div className="nqd-panel">
          <p className="nqd-eyebrow">{tx('pack.nature.result.signs', 'You will know them by')}</p>
          <ul className="nqd-list">
            {role.signsEN.map((s, i) => <li key={i}><Bold s={tx(`${role.i18n}.sign${i}`, s)} /></li>)}
          </ul>
        </div>

        {/* EMOČNÝ ZÁSAH CELÉHO KVÍZU: veta, ktorú majiteľ o svojom psovi celý život
            počúva — a vyvrátenie. Nesmie zaniknúť medzi ostatnými panelmi. */}
        <div className="nqd-panel quiet" style={{ marginTop: 14 }}>
          <p className="nqd-eyebrow">{tx('pack.nature.doc.myth', 'The usual verdict')}</p>
          <p style={{
            fontFamily: FONT_UI, fontSize: 14, fontStyle: 'italic', color: '#7a5a2a', margin: '0 0 8px',
          }}>„{tx(`${role.i18n}.myth`, role.mythEN)}"</p>
          <p className="body" style={{ margin: 0 }}><Bold s={tx(`${role.i18n}.mythAnswer`, role.mythAnswerEN)} /></p>
        </div>

        <div className="nqd-panel quiet" style={{ marginTop: 14 }}>
          <p className="nqd-eyebrow">{tx('pack.nature.result.pressure', 'Under pressure')}</p>
          <p className="dim"><Bold s={tx(`${role.i18n}.pressure`, role.pressureEN)} /></p>
        </div>

        <div className="nqd-panel" style={{ marginTop: 14 }}>
          <p className="nqd-eyebrow">{tx('pack.nature.doc.duty', 'What the job asks of the day')}</p>
          <ul className="nqd-list tight">
            {role.dutyEN.map((t, i) => <li key={i}><Bold s={tx(`${role.i18n}.duty${i}`, t)} /></li>)}
          </ul>
        </div>

        {/* Zdroj sa priznáva pri mene úlohy, nie až v pätičke — meno je z WDDC. */}
        <p className="dim" style={{ textAlign: 'center', marginTop: 12, fontSize: 11 }}>
          {tx('pack.nature.result.origin', 'In the source research')}: {role.originEN}
          {second && (
            <>
              {' · '}
              {tx('pack.nature.result.alsoRole', 'They also carry a strong second role')}:{' '}
              <b>{tx(second.i18n, second.labelEN)}</b>
            </>
          )}
        </p>

        {/* ── III · ZVLÁŠTNA ÚLOHA (0–4) ─────────────────────────────────────
            Sekcia celá odpadne, keď pes nemá ani jednu — prázdny nadpis by
            tvrdil, že tu niečo chýba. */}
        {specials.length > 0 && (
          <>
            <Orn />
            <SecHead num="III"
              title={tx('pack.nature.doc.iii.title', 'Special role')}
              sub={tx('pack.nature.doc.iii.sub', 'Sits ON TOP of the core role — it is not its rival')} />
            <div style={{ display: 'grid', gap: 14 }}>
              {specials.map((sp) => (
                <div className="nqd-panel" key={sp.key}
                  style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <img src={sp.art} alt="" aria-hidden loading="lazy" style={{ width: 78, flex: '0 0 auto' }} />
                  <div>
                    <h3 style={{
                      fontFamily: FONT_TITLE, fontWeight: 900, fontSize: 17, letterSpacing: '.05em',
                      textTransform: 'uppercase', margin: '0 0 5px', color: '#1a0900',
                    }}>{tx(sp.i18n, sp.labelEN)}</h3>
                    <p className="dim"><Bold s={tx(`${sp.i18n}.desc`, sp.descEN)} /></p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Orn />

        {/* ── IV · USMERNENIE ────────────────────────────────────────────────
            Matej 21.8.: „dať viac hodnoty priamo pri výsledku a do usmernenia len
            to nevyhnutné, časté omyly či detaily." Podstata je hore pri elemente
            a úlohe; tu ostávajú dve veci — čo ľudia robia zle a čo nie je zjavné.
            Kombinačný riadok stojí NAD nimi samostatne: je to jediné miesto
            dokumentu, kde sa obe osi stretnú v jednej vete, a zamiešaný medzi
            šestnásť riadkov by zanikol práve ten, ktorý je jedinečný. */}
        <SecHead num="IV"
          title={tx('pack.nature.doc.iv.title', 'Guidance')}
          sub={tx('pack.nature.doc.iv.sub', 'The substance is above — what stays here is what cannot be guessed')} />

        <div className="nqd-panel">
          {g.pair && (
            <div className="nqd-pair">
              <div className="cross">
                {tx('pack.nature.doc.pair', 'Where the two meet')} ·{' '}
                {tx(role.i18n, role.labelEN)} × {tx(el.i18n, el.labelEN)}
              </div>
              <b className="t" style={{
                display: 'block', fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 13,
                letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, color: '#1a0900',
              }}>{tx(`${g.pair.i18n}.title`, g.pair.titleEN)}</b>
              <span style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: '#1a0900' }}>
                <Bold s={tx(`${g.pair.i18n}.text`, g.pair.textEN)} />
              </span>
            </div>
          )}
          <GuideLane
            title={tx('pack.nature.doc.mistakes', 'Common mistakes')}
            from={tx('pack.nature.doc.mistakesFrom', 'what most often goes wrong with this result')}
            rows={g.mistakes} tx={tx} />
          <GuideLane
            title={tx('pack.nature.doc.details', 'Details that help')}
            from={tx('pack.nature.doc.detailsFrom', 'small things that are not obvious')}
            rows={g.details} tx={tx} />
        </div>

        {/* ── V · ROZPAD ─────────────────────────────────────────────────────
            Má ho len pes, ktorý kvíz prešiel od 20. 8. 2026 — `nature.scores` sa
            predtým neukladalo a spätne sa nedopočíta (surové odpovede nikde nie sú).
            Päť núl by tvrdilo „všetkého nula", tak sa sekcia vynechá celá. */}
        {hasNatureScores(r) && (
          <>
            <Orn />
            <SecHead num="V"
              title={tx('pack.nature.result.scoresTitle', 'How it added up')}
              sub={tx('pack.nature.doc.v.sub', 'Every answer adds weight to more than one line')} />
            <ScoreBreakdown r={r} tx={tx} />
          </>
        )}

        <Orn />
        <div className="nqd-foot">
          <p>
            DOGYPT · {tx('pack.nature.doc.footTitle', 'WHO IS YOUR DOG')}<br />
            {tx(NATURE_ATTRIBUTION.i18n, NATURE_ATTRIBUTION.textEN)}
          </p>
          <img className="nqd-seal" src="/_certassets/seal.png" alt="" aria-hidden loading="lazy" />
        </div>

      </div></div>
    </div>
  );
}

/* ── stránka ──────────────────────────────────────────────────────────────── */

/**
 * Od prestavby 22. 8. 2026 sú to TRI kvízy za sebou, nie jeden zmiešaný.
 * Poradie je vecné: element hovorí, z čoho je pes stvorený → rovnováha stojí NA
 * ňom (nadbytok/nedostatok sa vzťahuje k elementu) → úloha je iná os a ide až
 * potom, aby sa človeku nemiešali dve rôzne otázky o tom istom psovi.
 *
 * `element` a `role` majú zhodné vykreslenie — líšia sa len zoznamom otázok.
 * Preto ich obsluhuje jedna vetva, nie dve kópie, ktoré sa časom rozídu.
 */
type Phase = 'intro' | 'element' | 'balance' | 'role' | 'special' | 'result';

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
  /** `?view=result` = ČÍTANIE už zapísaného výsledku, nie nový beh kvízu.
   *  Do 21. 8. 2026 tento parameter nikto nečítal — odkaz „Read the results" na
   *  `/pack/dogs` teda vysypal človeka na úvod kvízu a výsledok sa po odchode
   *  z obrazovky nedal pozrieť už NIKDY. */
  const wantStored = params.get('view') === 'result';
  /** Odkiaľ sa prišlo. Dnes jediná hodnota: `id` = z DOG ID konkrétneho psa. */
  const cameFrom = params.get('from');
  /** JEDNO miesto, kam vedie odchod. Lock z 18. 8. platí ďalej — päť rozsypaných
   *  `navigate()` sa raz už rozišlo, preto sa cieľ počíta tu a nikde inde. */
  const exitTo = exitFor(cameFrom, onlyDogId) ?? QUIZ_EXIT;

  const [dogs, setDogs] = useState<QuizDog[] | null>(null);
  /** `null` = ešte sa načítava, `[]` = niet čo čítať (→ spadne to na kvíz). */
  const [stored, setStored] = useState<{ dog: QuizDog; r: NatureResult; b: BalanceResult }[] | null>(null);
  const [reading, setReading] = useState(wantStored);
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  /** dogId → qid → optionId */
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  /** dogId → zvláštna úloha → yes/sometimes/no */
  const [specials, setSpecials] = useState<Record<string, Partial<Record<SpecialKey, SpecialAnswer>>>>({});
  /**
   * dogId → zaškrtnuté `id` z `BALANCE_ITEMS`. Kvíz 2 je JEDINÁ obrazovka, kde sa
   * nevyberá jedna možnosť z piatich — pes môže mať päť prejavov naraz a nútiť ho
   * vybrať jeden by výsledok falšoval. Prázdne pole je platná odpoveď: „nič z toho
   * na neho nesedí" je najčastejší a najlepší výsledok.
   */
  const [balance, setBalance] = useState<Record<string, string[]>>({});
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
        .select('id, dog_name, cloudinary_main_url, heroglyph_png_url')
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

  // ČÍTANIE ZAPÍSANÉHO VÝSLEDKU. Skladá sa z polí na karte psa (`nature.*`), lebo
  // surové odpovede sa neukladajú. Pes bez zapísanej úlohy/elementu sa preskočí;
  // keď nezostane ani jeden, režim sa vypne a človek uvidí normálny úvod kvízu —
  // to je jediná zmysluplná odpoveď na „ukáž výsledok", ktorý neexistuje.
  useEffect(() => {
    if (!wantStored || dogs === null) return;
    if (dogs.length === 0) { setReading(false); return; }
    let alive = true;
    readLatestForDogs(dogs.map((d) => d.id)).then((byDog) => {
      if (!alive) return;
      const out: { dog: QuizDog; r: NatureResult; b: BalanceResult }[] = [];
      for (const d of dogs) {
        const v = byDog[d.id] ?? {};
        const r = natureResultFromStored({
          element: v['nature.element']?.value,
          role: v['nature.role']?.value,
          specials: v['nature.specials']?.value,
          scores: v['nature.scores']?.value,
        });
        // Rovnováha sa dopočíta zo ZAŠKRTNUTÝCH `id`, nie zo zapísaného záveru —
        // preto sa smie triedenie prejav/diagnóza aj prevodná tabuľka opraviť bez
        // toho, aby karty psov ostali visieť na starej rade. Pes, ktorý kvíz prešiel
        // pred 22. 8., pole nemá a sekcia sa proste nevykreslí.
        const picked = v['nature.balance']?.value;
        const b = scoreBalance(Array.isArray(picked) ? (picked as string[]) : []);
        if (r) out.push({ dog: d, r, b });
      }
      setStored(out);
      if (out.length === 0) setReading(false);
    }).catch(() => { if (alive) setReading(false); });
    return () => { alive = false; };
  }, [wantStored, dogs]);

  /** Z čítania výsledku do kvízu. Parameter `?view=result` musí ísť preč, inak by
   *  sa po dokončení nového behu človek vrátil do čítania toho starého. */
  const startOver = () => {
    setReading(false);
    setStored(null);
    // ⚠️ `from` musí prežiť. Zhadzuje sa len `view=result`, lebo po novom behu by
    // človeka vrátilo do čítania toho STARÉHO výsledku — ale cesta späť na doklad
    // patrí k tomu, odkiaľ prišiel, a nie k tomu, čo práve robí.
    const q = new URLSearchParams();
    if (onlyDogId) q.set('dog', onlyDogId);
    if (cameFrom) q.set('from', cameFrom);
    navigate(q.toString() ? `/pack/nature?${q}` : '/pack/nature', { replace: true });
  };

  /** Otázky oboch kvízov v poradí, v akom idú za sebou. */
  const QUESTIONS = [...ELEMENT_QUESTIONS, ...ROLE_QUESTIONS];
  // Rovnováha sa do počtu NERÁTA — je to jedna obrazovka a nemá správnu odpoveď,
  // takže „hotová" sa pri nej nedá určiť. Rátať ju ako krok by znamenalo, že
  // progres buď stojí (nikto nič nezaškrtol), alebo skočí za zaškrtnutie choroby.
  const total = QUESTIONS.length + SPECIAL_KEYS.length;
  // Otázka je hotová, až keď na ňu odpovedali VŠETCI psy — inak by prúžok sľuboval
  // hotovo pri svorke, kde je vyplnený jeden pes z troch.
  const done = useMemo(() => {
    if (list.length === 0) return 0;
    const core = QUESTIONS.filter((q) => list.every((d) => answers[d.id]?.[q.id])).length;
    const spec = SPECIAL_KEYS.filter((k) => list.every((d) => specials[d.id]?.[k])).length;
    return core + spec;
  }, [list, answers, specials]);

  /** Zoznam otázok práve bežiacej fázy. Mimo oboch kvízov prázdny. */
  const activeQs = phase === 'element' ? ELEMENT_QUESTIONS : phase === 'role' ? ROLE_QUESTIONS : [];

  const allSpecialsDone = list.length > 0
    && list.every((d) => SPECIAL_KEYS.every((k) => specials[d.id]?.[k]));

  /** Jeden výsledok na psa — `scoreNature` je čistá funkcia, takže sa len zavolá N×. */
  const results = useMemo(() => {
    if (phase !== 'result') return [];
    return list.map((d) => ({
      dog: d,
      r: scoreNature(answers[d.id] ?? {}, specials[d.id] ?? {}),
      b: scoreBalance(balance[d.id] ?? []),
    }));
  }, [phase, list, answers, specials, balance]);

  const finish = async (rs: { dog: QuizDog; r: NatureResult; b?: BalanceResult }[]) => {
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
      // ROVNOVÁHA SA UKLADÁ AKO ZAŠKRTNUTÉ `id`, NIE AKO VYPOČÍTANÝ ZÁVER.
      // Závery sa menia — triedenie prejav/diagnóza aj prevodná tabuľka podpory
      // sú naše rozhodnutia a môžu sa opraviť. Zaškrtnutia sú to, čo majiteľ
      // naozaj povedal, a z nich sa záver kedykoľvek prepočíta. Uložiť „podpor
      // Vodu" by znamenalo, že po prvej oprave tabuľky ukazuje karta psa radu,
      // ktorá už z jeho odpovedí nevyplýva — a nič to nenahlási.
      const picked = balance[dog.id] ?? [];
      if (picked.length) {
        inputs.push({ dogId: dog.id, field: 'nature.balance', value: picked, source: 'quiz' });
      }
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

  /** Postupnosť fáz. Jedno miesto, aby sa ĎALEJ a SPÄŤ nemohli rozísť. */
  const FLOW: Phase[] = ['element', 'balance', 'role', 'special'];

  const goNext = () => {
    clearAdvance();
    if (activeQs.length && idx < activeQs.length - 1) { setIdx((i) => i + 1); return; }
    const next = FLOW[FLOW.indexOf(phase) + 1];
    setIdx(0);
    setPhase(next ?? 'special');
  };
  /** SPÄŤ musí najprv zrušiť bežiaci posun — inak by časovač z predošlej otázky
   *  hodil človeka vzápätí zase dopredu a vyzeralo by to, že tlačidlo nefunguje.
   *  Na prvej otázke fázy vracia do PREDOŠLEJ fázy, na jej poslednú otázku — inak
   *  by sa človek z kvízu 3 nedostal späť k rovnováhe ani k elementu. */
  const goBack = () => {
    clearAdvance();
    if (idx > 0) { setIdx((i) => i - 1); return; }
    const prev = FLOW[FLOW.indexOf(phase) - 1];
    if (!prev) return;
    setPhase(prev);
    setIdx(prev === 'element' ? ELEMENT_QUESTIONS.length - 1
      : prev === 'role' ? ROLE_QUESTIONS.length - 1 : 0);
  };

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

  /** Zaškrtnutie v kvíze 2. Prepína, nie nastavuje — tie isté dôvody s refom neplatia,
   *  lebo tu sa neklikáva za viacerých psov naraz v jednom ticku. */
  const toggleBalance = (dogId: string, itemId: string) => {
    setBalance((prev) => {
      const cur = prev[dogId] ?? [];
      return { ...prev, [dogId]: cur.includes(itemId) ? cur.filter((x) => x !== itemId) : [...cur, itemId] };
    });
  };

  const restart = () => {
    clearAdvance();
    answersRef.current = {}; specialsRef.current = {};
    setAnswers({}); setSpecials({}); setBalance({}); setIdx(0); setSaved(false); setPhase('intro');
  };

  // Je čo stratiť? Stačí JEDNA odpoveď — nie hotová otázka za celú svorku. Človek,
  // ktorý odklikal pol kvízu pre prvého psa, prišiel o rovnako veľa.
  const hasProgress =
    Object.values(answers).some((a) => Object.keys(a).length > 0)
    || Object.values(specials).some((a) => Object.keys(a).length > 0)
    || Object.values(balance).some((a) => a.length > 0);

  // ODCHOD Z KVÍZU VEDIE NA `/pack/dogs`, NIE NA `/pack` (Matej 18.8.: „ak dám na
  // teste X, cráti ma na homepage a nie na /dogs"). Kvíz sa otvára z dlaždice na
  // `/pack/dogs`, zapisuje do DOG ID a po zavretí má človek stáť tam, odkiaľ prišiel —
  // nie o poschodie vyššie na hube. Rovnako to robí aj DOG ID kvíz (`PackDogQuiz.tsx`).
  // Jedna konštanta, nie päť rozsypaných `navigate()` — presne tie sa rozišli.
  const leave = () => navigate(exitTo);
  // Pýtame sa len tam, kde sa naozaj niečo stratí: úvod nemá čo, výsledok je už
  // zapísaný do DOG ID.
  const requestClose = () => {
    if (phase !== 'intro' && phase !== 'result' && hasProgress) { setAskLeave(true); return; }
    leave();
  };
  const leaveOverlay = askLeave
    ? <LeaveConfirm tx={tx} onStay={() => setAskLeave(false)} onLeave={leave} />
    : null;

  // Bez psa sa nedá nič zapísať. Predtým to bola TICHÁ strata celého priebehu —
  // preto je to odteraz vidieť hneď na začiatku, nie až (ne)uložením na konci.
  if (dogs !== null && list.length === 0) {
    return (
      <Shell onClose={() => navigate(exitTo)}>
        <Card>
          <Eyebrow>{tx('pack.nature.intro.eyebrow', 'Three short quizzes, one document')}</Eyebrow>
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

  /* — čítanie zapísaného výsledku (`?view=result`) — */
  // Tá istá obrazovka ako po dobehnutí kvízu, len postavená z karty psa. Rozdiel je
  // v jednom tlačidle: „Take it again" tu nemá čo mazať, musí sa vrátiť na úvod kvízu.
  if (reading) {
    if (stored === null) {
      // Prázdna škrupina, nie úvod kvízu: preblesknutý úvod by vyzeral ako by odkaz
      // „pozri výsledok" viedol na opakovanie testu.
      return <Shell onClose={() => navigate(exitTo)}><div style={{ minHeight: 260 }} /></Shell>;
    }
    return (
      <Shell onClose={() => navigate(exitTo)}>
        {stored.map(({ dog, r, b }, i) => (
          <div key={dog.id} style={{ marginTop: i === 0 ? 0 : 26 }}>
            <ResultDoc dog={dog} r={r} b={b} tx={tx} />
          </div>
        ))}
        <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="nq-ghost is-ondark" onClick={startOver}>
            <RotateCcw className="h-3.5 w-3.5" /> {tx('pack.nature.result.again', 'Take it again')}
          </button>
          <button type="button" className="nq-gold is-ondark" onClick={() => navigate(exitTo)}>
            {tx('pack.nature.result.done', 'Done')}
          </button>
        </div>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — intro — */
  if (phase === 'intro') {
    return (
      <Shell onClose={() => navigate(exitTo)} fill>
        {/* ⚠️ `padding` a `overflow` musia ísť INLINE — `Card` si padding píše inline
            a inline vždy prebije triedu `.nq-intro`. */}
        <Card className="nq-intro" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          {/* Obraz je prvý v DOM aj na mobile — pás nad textom, nie pod tlačidlom. */}
          <div className="nq-introart">
            <img src={INTRO_ART} alt="" aria-hidden />
          </div>

          <div className="nq-introbody">
            <Eyebrow>{tx('pack.nature.intro.eyebrow', 'Three short quizzes, one document')}</Eyebrow>
            <h1 style={{
              fontFamily: FONT_TITLE, fontWeight: 700, textTransform: 'uppercase',
              fontSize: 'clamp(1.35rem, 4.2vw, 2.05rem)', lineHeight: 1.15, color: T.inkStrong,
              margin: 0,
            }}>{tx('pack.nature.intro.title', 'Who is your dog?')}</h1>
            <p style={{ fontFamily: FONT_UI, fontSize: 13.5, lineHeight: 1.6, color: T.inkStrong, marginTop: 12 }}>
              {tx('pack.nature.intro.body',
                'Twenty-two questions and one checklist. You come out with three things: what your dog is made of, where their balance is leaning right now, and what job they do for your family. Nobody taught them that job — they were born into it.')}
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
              {/* Tretia dlaždica pribudla s kvízom 2 (22. 8.). Bez nej by sa na výsledku
                  zjavila celá sekcia, ktorú úvod nikdy nesľúbil. */}
              <AxisTile
                icon="sliders"
                title={tx('pack.nature.intro.axis3', 'Balance right now')}
                sub={tx('pack.nature.intro.axis3sub', 'Constitution is set for life; balance is not. Tick what is going on and see which way it leans.')}
              />
            </div>

            <DogIdNote tx={tx} />

            <div style={{ marginTop: 18 }}>
              <button type="button" className="nq-gold is-big" onClick={() => setPhase('element')}>
                {tx('pack.nature.intro.cta', 'Start')}
              </button>
            </div>
          </div>
        </Card>
        <Attribution tx={tx} />
      </Shell>
    );
  }

  /* — kvíz 1 (element, 10) a kvíz 3 (úloha, 8): zhodné vykreslenie, iný zoznam — */
  if (phase === 'element' || phase === 'role') {
    const q = activeQs[idx];
    const isLast = idx === activeQs.length - 1;
    return (
      <Shell onClose={requestClose} fill overlay={leaveOverlay}>
        {/* Karta je široká ako panely `/pack`, ale ČÍTACÍ stĺpec vnútri je zúžený
            (`NQ_READ`) — veta odpovede roztiahnutá na 1000 px sa oku ťažko vracia
            na začiatok riadku. Široký je panel, nie riadok textu. */}
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <QuizArt />
          <div style={readStyle(list.length)}>
            {/* Číslo je „v tomto kvíze", nie „zo všetkých 22" — po prestavbe sú to
                tri samostatné kvízy a „11 z 22" by po predele pôsobilo, akoby sa
                nič neposunulo. Prúžok naďalej meria celý priebeh. */}
            <Progress
              done={done}
              total={total}
              label={`${phase === 'element'
                ? tx('pack.nature.part.element', 'Body')
                : tx('pack.nature.part.role', 'Pack')} · ${tx('pack.nature.question', 'Question')} ${idx + 1} / ${activeQs.length}`}
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

            {idx === 0 && phase === 'element' && <HowItWorks solo={solo} tx={tx} />}

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
                disabled={phase === 'element' && idx === 0}
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
                {!isLast
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

  /* — kvíz 2: rovnováha. Jediná obrazovka bez správnej odpovede. — */
  if (phase === 'balance') {
    return (
      <Shell onClose={requestClose} fill overlay={leaveOverlay}>
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <QuizArt />
          <div style={readStyle(list.length)}>
            <Progress done={done} total={total} label={tx('pack.nature.part.balance', 'Balance')} />
            <h2 style={{
              fontFamily: FONT_TITLE, fontWeight: 700, fontSize: 'clamp(1.2rem,4.4vw,1.65rem)',
              lineHeight: 1.22, letterSpacing: '.01em', color: T.inkStrong, margin: 0,
            }}>{tx('pack.nature.balance.title', 'Anything going on right now?')}</h2>
            <div aria-hidden style={{
              height: 2, width: 132, borderRadius: 2, margin: '13px 0 16px',
              background: `linear-gradient(90deg, ${T.cardEdge}, rgba(201,154,63,0))`,
            }} />
            <p style={{ fontFamily: FONT_UI, fontSize: 13, lineHeight: 1.6, color: T.inkStrong, margin: '0 0 6px' }}>
              {tx('pack.nature.balance.body',
                'Your dog’s constitution is set for life, but it can tip out of balance. Tick anything that applies — as much or as little as you like.')}
            </p>
            <p style={{ fontFamily: FONT_UI, fontSize: 12.5, lineHeight: 1.55, color: T.inkWarm, margin: '0 0 16px' }}>
              {tx('pack.nature.balance.none', 'Nothing on the list? Leave it empty and carry on — that is the best answer there is.')}
            </p>

            {/* Pes po psovi. Pri svorke sa NEPONÚKA „platí pre všetkých" ako pri
                otázkach — príznaky sú vec jedného konkrétneho tela a hromadné
                zaškrtnutie astmy trom psom naraz je presne ten druh úspory, ktorý
                spraví z posudku nezmysel. */}
            {list.map((d) => (
              <div key={d.id} style={{ marginTop: 18 }}>
                {!solo && (
                  <div style={{
                    fontFamily: NAME_FONT, fontWeight: 700, fontSize: 15, letterSpacing: '.02em',
                    color: T.inkStrong, marginBottom: 10, textTransform: 'uppercase',
                  }}>{d.dog_name ?? '—'}</div>
                )}
                <div style={{ display: 'grid', gap: 14 }}>
                  {ELEMENT_KEYS.map((el) => {
                    const items = BALANCE_ITEMS.filter((b) => b.element === el);
                    return (
                      <div key={el} style={{ ...PACK_BOX.subblock, padding: '13px 15px' }}>
                        <div style={{
                          fontFamily: FONT_UI, fontWeight: 500, fontSize: 10.5, letterSpacing: '.26em',
                          textTransform: 'uppercase', color: T.cardEdge, marginBottom: 10,
                        }}>{tx(NATURE_ELEMENTS[el].i18n, NATURE_ELEMENTS[el].labelEN)}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {items.map((b) => {
                            const on = (balance[d.id] ?? []).includes(b.id);
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => toggleBalance(d.id, b.id)}
                                aria-pressed={on}
                                title={b.noteEN ? tx(`${b.i18n}.note`, b.noteEN) : undefined}
                                className={`pf-pill${on ? ' is-on' : ''}`}
                                style={{
                                  fontFamily: FONT_UI, fontSize: 12, lineHeight: 1.35, textAlign: 'left',
                                  padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                                  border: `1px solid ${on ? T.cardEdge : 'rgba(179,130,45,0.55)'}`,
                                  background: on ? 'linear-gradient(180deg,#F5C73D,#E69E1A)' : T.tileBg,
                                  color: on ? '#3d1f00' : T.inkStrong,
                                  fontWeight: on ? 600 : 400,
                                }}
                              >
                                {tx(b.i18n, b.labelEN)}
                                {b.noteEN && (
                                  <span style={{ display: 'block', fontSize: 10.5, opacity: 0.75, marginTop: 1 }}>
                                    {tx(`${b.i18n}.note`, b.noteEN)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="nq-nav">
              <button type="button" className="nq-ghost" onClick={goBack}>
                <ChevronLeft className="h-3.5 w-3.5" /> {tx('pack.nature.back', 'Back')}
              </button>
              {/* ĎALEJ nie je nikdy zhasnuté — prázdny zoznam je platná odpoveď. */}
              <button type="button" className="nq-gold" onClick={goNext}>
                {tx('pack.nature.next', 'Next')}
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
                onClick={goBack}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {tx('pack.nature.back', 'Back')}
              </button>
              <button
                type="button"
                className="nq-gold"
                disabled={!allSpecialsDone}
                onClick={() => {
                  const rs = list.map((d) => ({
                    dog: d,
                    r: scoreNature(answers[d.id] ?? {}, specials[d.id] ?? {}),
                    b: scoreBalance(balance[d.id] ?? []),
                  }));
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
    <Shell onClose={() => navigate(exitTo)}>
      {/* JEDEN DOKUMENT NA PSA — fotka a meno sú vnútri karty, nie nad ňou na
          čiernom, a sú tam aj pri sólo psovi. Medzera medzi dokumentami je väčšia
          než čokoľvek vnútri nich, aby bolo vidieť, kde jeden pes končí. */}
      {results.map(({ dog, r, b }, i) => (
        <div key={dog.id} style={{ marginTop: i === 0 ? 0 : 26 }}>
          <ResultDoc dog={dog} r={r} b={b} tx={tx} />
        </div>
      ))}
      {/* JEDINÉ dve tlačidlá kvízu na ČIERNOM podklade — stoja pod kartami, nie v nich.
          Preto `is-ondark`: jasná zlatá so žiarou a svetlý ink v ghoste. */}
      <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="nq-ghost is-ondark" onClick={restart}>
          <RotateCcw className="h-3.5 w-3.5" /> {tx('pack.nature.result.again', 'Take it again')}
        </button>
        <button type="button" className="nq-gold is-ondark" onClick={() => navigate(exitTo)}>
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
