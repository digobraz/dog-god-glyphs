// ════════════════════════════════════════════════════════════════════════════
// ONEPAGE — CELÝ WEB AKO JEDEN ZVISLÝ SCROLL (DEV ONLY)
// ────────────────────────────────────────────────────────────────────────────
// Matej 26. 8. 2026: *„skúsme nový koncept webu = onepage stránka — HOME globe ·
// scroll dolu pekná animácia úvodnej obrazovky RELIGION (krava a pes) nie slajd
// ale postupný fade in, premiový prechod, odchod planéty príchod kravy a psa ·
// scroll dolu video intro · scroll upravený horizontálny scroll vízia · scroll
// príbeh dogyptu (starwars) schovať za popup · dolu ešte raz cieľ a kroky k nemu,
// číslo počtu psíčkarov, CTA."*
//
// A k spodnej lište (to isté zadanie): *„WALL je predsa v úvodnom dolnom nave —
// preklik. Po scrolle ďalej zmizne kompas aj wall, ale objaví sa CTA stať sa
// Dogypťanom."* → stena NIE JE sekcia filmu, je to odbočka z prvej obrazovky.
//
// ⚠️ TOTO JE DUPLIKÁT, NIE NÁHRADA. `components/lab/LabShell.tsx` (vodorovný
//    swipe medzi sekciami) ostáva nedotknutý a funkčný na `/wall-lab` — Matej
//    26. 8.: *„zatiaľ nemaž existujúce stránky, iba zduplikuj do onepage."*
//    Preto sú tu druhýkrát aj štýly horného navu: obe cesty sa nikdy
//    nenamountujú naraz, takže globálne `.main-nav` nekoliduje.
//
// ⚠️ ROZDIEL OPROTI LabShell V JEDNEJ VETE: tam scrolluje panel (`.lsh-scroll`),
//    tu scrolluje OKNO. `VisionLab` aj `AboutLab` to majú ošetrené samy
//    (`closest('.lsh-scroll') ?? window`), takže tu bežia bez zmeny.
//
// ⚠️ Papyrusové odtiene ber z `@/lib/labTheme` — nepíš sem vlastné.
// ⚠️ CSS je JS template literal: spätný apostrof v komentári zhodí build a `tsc`
//    to nechytí. Po zásahu do štýlov vždy `npm run build`.
// ════════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';
import { HandHouseHeart } from '@/components/pack/HandIcons';
import { LAB } from '@/lib/labTheme';
import { LIVE_EDGE_BASE } from '@/lib/env';
import { Seo } from '@/components/Seo';
import { GodsGridLab } from '@/components/gods/GodsGridLab';
import ReligionLab from '@/pages/ReligionLab';
import VisionLab from '@/pages/VisionLab';
import AboutLab from '@/pages/AboutLab';
import { Footer } from '@/components/landing/Footer';
// Citáty sa sem NEOPISUJÚ — pod TestimonialsSection leží 44 zdrojovaných
// výrokov so zdrojovou URL a tie sa nesmú rozdvojiť.
import {
  pickCelebQuotes,
  quoteSlug,
  CELEB_QUOTE_COUNT,
} from '@/components/landing/TestimonialsSection';
import ConstitutionBook from '@/components/religion/ConstitutionBook';
import {
  NAV_R,
  NAV_GOLD,
  NAV_FRAME_BG,
  NAV_FRAME_BLEND,
  NAV_FRAME_SHADOW,
  NAV_PLATE_BG,
  NAV_PLATE_BLEND,
  NAV_PLATE_SHADOW,
  NAV_PILL_SHADOW,
  NAV_GRAIN_SCREEN_CSS,
  LAPIS,
  LAPIS_BTN_SHADOW,
} from '@/components/pack/navGoldSkin';
import NavMedallion, { NAV_MEDALLION_CSS } from './NavMedallion';

// ── Poradie obrazov filmu je NA JEDNOM MIESTE ───────────────────────────────
// Nav aj sledovanie aktívnej sekcie čítajú TOTO pole. Video a vízia sú jedna
// položka zámerne: `VisionLab` nesie oboje (video hero + vodorovný pás WHAT IF),
// rozdeliť ich by znamenalo rozrezať hotový komponent na dva.
const SCENES: { id: string; navKey: string }[] = [
  { id: 'home', navKey: 'nav.home' },
  { id: 'religion', navKey: 'nav.religion' },
  { id: 'vision', navKey: 'nav.vision' },
  { id: 'about', navKey: 'nav.about' },
];

/**
 * DĹŽKA PRECHODU 1. → 2. OBRAZU, v obrazovkách scrollu.
 * ⚠️ Toto je JEDINÝ ladiaci gombík tempa. Celá výmena sa odohráva na JEDNEJ
 * obrazovke, ktorá sa nehýbe (Matej 26. 8. 2026: *„scroll z 1. sekcie smerom
 * dolu — planétka sa stráca do pozadia aj s textom, obrazovka sa nehýbe smerom
 * dolu, pri miznutí z bokov vyliezajú krava a pes, scroll sa odohráva na jednej
 * obrazovke, text v strede fade in."*). Preto tu nie je žiadny „záporný okraj"
 * ani druhá dráha: guľa aj náboženstvo stoja od začiatku NA TOM ISTOM MIESTE,
 * scroll len prehadzuje, ktorý z nich je vidieť.
 * Číslo sedí naraz vo výške prilepenej sekcie (.op-scene--pin) a vo všetkých
 * úsekoch choreografie nižšie — meň ho TU.
 */
// ⚠️ 26. 8. 2026 zvysene z 1 na 3 (Matej: *„planetka sa schovava postupne na
// viacero slajdov."*). Obrazovka sa pritom stale NEHYBE — prilepena ostava,
// len drahu prechodu prejdes na tri otocenia kolieska namiesto jedneho, takze
// odchod gule ma cas byt pohybom a nie striedom.
const PIN_VH = 3;

/**
 * ÚSEKY CHOREOGRAFIE — všetko v podiele dráhy prechodu (0 = začiatok, 1 = koniec).
 * Prekrývajú sa ZÁMERNE. Keby na seba nadväzovali, vznikli by tri po sebe idúce
 * animácie namiesto jednej výmeny: guľa preč → prázdny papyrus → zvieratá →
 * prázdny papyrus → text. Prekryv je to, čo z toho robí jeden pohyb.
 */
/**
 * TEXT A „ADD PHOTO" ODCHÁDZAJÚ HNEĎ (Matej 26. 8. 2026: *„v momente scrolu
 * zmizne blok add photo"*). Sú to jediné dve veci na prvej obrazovke, ktoré
 * niečo PÝTAJÚ — kým si človek zvolil scroll, odpovedal, takže nemajú čo robiť
 * v prechode. Guľa za nimi hasne pomaly a sama.
 */
const HERO_OUT: readonly [number, number] = [0, 0.12];
/**
 * SPODNÁ LIŠTA ODCHÁDZA S PRVOU OBRAZOVKOU (Matej 26. 8. 2026: *„pri scrole
 * z 1 sekcie nakoniec predsa len odstráň celkom spodný nav"*).
 * ⚠️ Ruší to skoršie rozhodnutie z toho istého dňa — lišta sa mala pri scrolle
 * prezliecť z nástrojov na chip JOIN US a ostať na obrazovke po celý film.
 * Preto je `ctaMode` vo filme vypnutý: chip by nabehol a o pár pixelov zhasol.
 * Trochu pomalšie než text a ADD PHOTO — tri veci zhasnuté naraz vyzerajú ako
 * výpadok, nie ako odchod.
 */
const DOCK_OUT: readonly [number, number] = [0, 0.18];
/** Guľa hasne — kúsok ťahu na začiatku patrí ešte jej. */
const PLANET_OUT: readonly [number, number] = [0.06, 0.60];
/**
 * Ako ďaleko guľa odletí (Matej: *„planéta sa vzďaľuje z pôvodnej veľkosti
 * na 10%"*). 0.90 ⇒ mierka 1 → 0.10. Ide po TEJ ISTEJ dráhe ako hasnutie,
 * takže posledné, čo z nej vidno, je malý bod v diaľke — nie zhasnutá guľa
 * v pôvodnej veľkosti (to vyzerá ako stmievač, nie ako odchod).
 */
const PLANET_RECEDE = 0.90;
/**
 * Krava a Hektor lezú z bokov — začínajú ešte kým guľa dohasína.
 * ⚠️ 26. 8. 2026 posunuté SKÔR (bolo [0.20, 0.90]). Matej poslal screenshot
 * gule zmenšenej asi na tri štvrtiny a napísal: *„pri približne takomto stave
 * už začnú vyliezať postavy a text."* Ten záber sedí zhruba na štvrtine dráhy;
 * pri starom nábehu tam boli zvieratá ešte celé za hranou obrazovky.
 */
const ANIMALS_IN: readonly [number, number] = [0.10, 0.74];
/** Text v strede nastupuje posledný, ale do toho istého záberu — nie až za ním. */
const TEXT_IN: readonly [number, number] = [0.24, 0.92];
/**
 * SVÄTOŽIARA HEKTORA — pointa výjavu (Matej 27. 8. 2026). Krava ju má od začiatku,
 * Hektorova sa rozsvieti až na konci argumentu.
 *
 * 🔴 VLASTNÝ VÝSEK, NIE PRAH NA `--op-txt`. Prahy textu platia len pre variant 1
 * (šesť blokov, --tx-at). Variant 2 sa píše po znakoch a jeho posledný znak
 * dobieha až na `--op-txt` ≈ 1, takže prah odvodený z blokov by v ňom halo
 * rozsvietil doprostred vety. Vlastný výsek je nezávislý od oboch variantov.
 *
 * 🔴 ZAČÍNA S CTA, NIE AŽ ZA NÍM (Matej 28. 8. 2026: *„v tomto momente, ešte keď
 * sa nenačíta CTA, by sa mala zobraziť aj svätožiara — lebo sa zobrazí neskôr
 * a takmer to človek nezachytí."*). Pôvodných [0.92, 1.0] bolo postavených na
 * úvahe, že halo je odmena za doscrollovanie a má doraziť presne na odpočívadlo
 * snapu. Lenže tým padlo do posledných ~200 px dráhy, kde už scroll dobieha
 * zotrvačnosťou — človek sa medzitým pozerá na CTA v strede, a svetlo nad psom
 * na kraji obrazovky mu prebehne mimo pohľadu. Teraz nabieha SÚBEŽNE s CTA
 * a dosvieti ešte pred koncom dráhy — je teda na obrazovke dosť dlho na to, aby
 * si ho niekto všimol, a na odpočívadle už len svieti.
 *
 * ⚠️ SPODNÁ HRANICA SA VIAŽE NA CTA, NIE NA KONIEC DRÁHY. Odmerané vo variante 1
 * (ten Matej používa): 4. blok — CTA — nabieha od `p` ≈ 0.648 a dopĺňa sa
 * na 0.821. Výsek 0.60–0.82 teda leží presne na ňom. Keby halo skĺzlo výrazne
 * nižšie, rozsvieti sa uprostred „YET." a prestane byť odpoveďou naň.
 */
const HALO_IN: readonly [number, number] = [0.60, 0.82];

/**
 * DĹŽKA PRECHODU 2. → 3. OBRAZU (výjav krava/pes → preambula), v obrazovkách
 * scrollu. Ten istý gombík ako PIN_VH, len pre druhú výmenu.
 *
 * Matej 28. 8. 2026: *„obsah neputuje hore ale mizne a na miesto toho sa vynorí
 * nadpis; až po 70 % vynorení zdola prichádza celkom nenačítaný úryvok, ktorý
 * sa scrollom viac objavuje a posúva zvieratá nabok (PC). Cieľom je urobiť 2–3
 * prechod zaujímavý a plynulý."*
 *
 * Predtým tu žiadny prechod nebol: prvý výjav sa po konci svojej dráhy odlepil
 * a odscrolloval hore ako každá iná sekcia — teda presne to „putovanie", ktoré
 * zadanie ruší. Preambula sa preto vťahuje O JEDNU OBRAZOVKU HORE (práve o tú,
 * počas ktorej výjav odchádzal) a dostane vlastnú prilepenú dráhu. Film tým
 * narastie len o samotnú dráhu, nie o odchod navyše.
 */
const PIN2_VH = 2;

/**
 * ÚSEKY DRUHÉHO PRECHODU — podiel dráhy (0 = koniec prvého výjavu, 1 = preambula
 * v pokoji). Rovnako ako pri prvom prechode sa ZÁMERNE prekrývajú.
 */
/** Text prvého výjavu hasne NA MIESTE (pohyb sekcie sa mu prekladá späť). */
const HERO2_OUT: readonly [number, number] = [0, 0.18];
/**
 * ── DRAMATURGIA 3. OBRAZOVKY ────────────────────────────────────────────────
 * Matej 28. 8. 2026, dve zadania za sebou:
 *   *„miniatúrny text alebo nejaký hec a ubezpečenie, že človek sa stotožňuje
 *   s výrokom, ktorý je pod ním (motto), pod tým úryvok a pod tým CTA"*
 *   *„po zjavení nadpisu sa pes nakloní a zväčší do priestoru a text sa snipne
 *   na ľavú stranu a kravu vytlačí mimo obraz = stránka bude rozdelená na text
 *   a psa"*
 *
 * Poradie beatov: riadok → motto → **ROZDELENIE** → úryvok sa dopisuje → CTA.
 *
 * ⚠️ ROZDELENIE POSUNULO PRÍCHOD ÚRYVKU. Pôvodne prichádzal na 70 % dráhy
 * nadpisu (0.38) — to bolo Matejovo skoršie číslo. Odkedy je medzi nimi snap
 * do dvoch stĺpcov, musí úryvok prísť AŽ ZA ním: prilietať zdola a súčasne sa
 * s celým blokom presúvať doľava sú dva pohyby naraz a čítajú sa ako zmätok.
 * Podmienka „až keď nadpis stojí" ostáva splnená, len s beatom navyše.
 */
/** Riadok nad mottom — prvý obsah obrazovky, uvádza motto, takže nie za ním. */
const EYE_IN: readonly [number, number] = [0.04, 0.26];
/** Motto sa vynorí na mieste, kde dohasol text predošlého výjavu. */
const H2_IN: readonly [number, number] = [0.10, 0.42];
/**
 * ROZDELENIE OBRAZOVKY — text doľava, pes sa nakloní a narastie, krava von.
 * ⚠️ ÚSEK JE KRÁTKY ZÁMERNE (0.14 dráhy, ostatné majú 0.2–0.35). Matej hovorí
 * *„snipne"* — má to byť zlom, nie plynulý presun. Predĺžiť ho = spraviť
 * z neho drift, teda presný opak zadania.
 */
const SPLIT_IN: readonly [number, number] = [0.44, 0.58];
/** Úryvok prilieta zdola — až do ROZDELENÉHO ľavého stĺpca. */
const QUOTE_IN: readonly [number, number] = [0.58, 0.80];
/** Text sa v ráme DOPISUJE — odkrýva sa zhora nadol, pozri masku v CSS. */
const INK_IN: readonly [number, number] = [0.62, 0.96];
/** Prísaha svorky — podpis pod hotový odsek. */
const OATH_IN: readonly [number, number] = [0.84, 0.94];
/** CTA do ústavy — posledné, čo na obrazovku príde. */
const CTA_IN: readonly [number, number] = [0.88, 1.0];
/**
 * HEKTOROV HOTSPOT — lesk po psovi a bledá bodka na hrudi.
 * Matej 28. 8. 2026: *„po načítaní cta osvietil hektora ako je osvietená
 * dogma… nič okaté ale viditeľné"*.
 *
 * ⚠️ ÚSEK JE ÚMYSELNE AŽ NA KONCI DRÁHY a navyše má v CSS oneskorenie
 * (.codex-shine 320 ms, .codex-spot 480 ms). „Po načítaní CTA" sa inak nedá
 * splniť: CTA dobieha presne na 1.0, čo JE odpočívadlo, takže za ním už žiadna
 * dráha nezostáva. Poradie tu teda nerobí scroll, ale čas — rovnako ako
 * svätožiara na samostatnej /religion-lab.
 */
const SPOT_IN: readonly [number, number] = [0.94, 1.0];
/**
 * KRAVA BLEDNE, HEKTOR NIE (Matej: *„krava začne blednúť hneď pri 3. sekcii
 * a načítaní prvého obsahu, zostane viditeľná, ale bude vyblednutá"*).
 * Bledne PRED rozdelením — najprv ustúpi farbou, potom ju rozdelenie vytlačí
 * z obrazu úplne. Nie sú to protichodné zadania, je to sled.
 *
 * 🔴 NAHRADILO to spoločné stlmenie oboch zvierat, ktoré bývalo na štvrtom
 * obraze — ten zanikol. Nie je to ubratý efekt, ale presunutý a zúžený na jedno
 * zviera. Dáva to zmysel výjavu: kravin argument sa skončil na predošlej
 * obrazovke, svetlo odteraz patrí psovi — rovnako ako svätožiara.
 */
const COW_OUT: readonly [number, number] = [0.10, 0.44];
/**
 * CIEĽOVÁ krycia hodnota kravy — nie odpočítaná, ale to, čo z nej ostane.
 * NIE 0.26 z pôvodného stlmenia neaktívneho výjavu: na papyruse z nej pri 0.26
 * ostane duch a veta znie „krava zmizla", nie „vybledla".
 */
const COW_DIM = 0.38;
/**
 * Kedy sa spodná lišta prezlečie z nástrojov na CTA chip.
 * Viazané na dráhu prechodu, nie na vlastný prah v pixeloch — je to výmena
 * obsahu JEDNEJ lišty, takže musí sadnúť presne do stredu odchodu gule.
 */
const CTA_AT = 0.34;

/**
 * DĹŽKA PRECHODU 3. → 4. OBRAZU (DOGMA → video a vízia), v obrazovkách scrollu.
 * Tretí gombík tempa, ten istý recept ako PIN_VH a PIN2_VH.
 *
 * Matej 28. 8. 2026: *„vieme scrolom urobiť horizontálny scrol že sa obsah
 * posunie do prava teda hektor sa posunie za okraj a text zostane napravo
 * a na lavo bude teraz video… text sa pri scrollingu zmení… musí to byť
 * plynule."*
 *
 * 🔑 PREČO PRÁVE VODOROVNE. Prvé dva prechody vymieňajú obsah NA MIESTE (guľa
 * za výjav, výjav za preambulu) — obrazovka sa nehýbe a mení sa len to, čo je
 * vidieť. Tu sa prvýkrát hýbe SVET: pás sa posunie o jednu bunku doprava, takže
 * to, čo bolo vpravo (pes), vyjde z obrazu a zľava nastúpi video. Je to zároveň
 * uvedenie vodorovnej gramatiky, na ktorej stojí hneď nasledujúci pás WHAT IF —
 * bez neho by prišiel bez ohlásenia.
 */
const PIN3_VH = 2;

/**
 * ÚSEKY TRETIEHO PRECHODU — podiel dráhy (0 = DOGMA v pokoji, 1 = vízia
 * v pokoji). Dráha sa delí na dve polovice, ktoré sa v strede prekrývajú:
 * do ~0.5 ODCHOD (stĺpec cestuje doprava a odpisuje sa, pes von), od ~0.5
 * PRÍCHOD (video dosadne, nadpis a bloky sa dopíšu).
 */
/**
 * OBSAH CESTUJE DOPRAVA — rovnomerne a bez otáčania (Matej 28. 8. 2026:
 * *„len horizontálny slide rovno, nie točiť obsah… musí to byť clean"*).
 * Z ľavej polovice (−22vw, kam ho posadilo rozdelenie obrazovky) na stred
 * pravej polovice okna, teda presne tam, kde bude stáť vízia.
 */
const SLIDE_IN: readonly [number, number] = [0.02, 0.44];
/**
 * TEXT MIZNE, RÁMIK ZOSTÁVA (Matej: *„pri presune textu mizne text ale rámik
 * zostáva = v momente ako sa rámik zakotví na svoje miesto nabiehajú v oblasti
 * rámika texty a nadpis - rámik zmizne"*).
 *
 * 🔑 TOTO JE CELÁ MYŠLIENKA PRECHODU: rámik je jediná vec, ktorá cestu prežije,
 * takže drží pohľad na mieste a hovorí *tu bude ďalší text*. Bez neho by dva
 * obsahy len striedali prázdnu obrazovku.
 * ⚠️ Preto sa hasí PO PRVKOCH, nie maskou na celom stĺpci — maska sa dedí na
 * všetky deti vrátane rohov rámu a zhasla by presne to jedno, čo má ostať.
 */
const UNINK_OUT: readonly [number, number] = [0.06, 0.34];
/**
 * HEKTOR ODCHÁDZA ZA PRAVÝ OKRAJ — a odchádza PRVÝ.
 * ⚠️ Musí byť preč skôr, než na jeho miesto dorazí rámik.
 * ⚠️ Horná hranica má aj tvrdý dôvod: bleed je prilepený len po koniec sekcie
 * náboženstva, teda po ~55 % tejto dráhy. Odchod musí skončiť pred tým.
 */
const HEK_OUT: readonly [number, number] = [0.02, 0.40];
/**
 * NADPIS A TRI BLOKY NABIEHAJÚ V OBLASTI RÁMIKA — až keď rámik dosadol.
 * Začiatok sa preto viaže na koniec SLIDE_IN, nie na vlastné číslo.
 */
const VB_IN: readonly [number, number] = [0.46, 0.78];
/**
 * VIDEO PRICHÁDZA ZDOLA, súbežne s nábehom textov, a ukotví sa, keď dobehnú
 * (Matej: *„video príde z dola a ako dobehnu texty video sa ukotví"*).
 */
const VID_IN: readonly [number, number] = [0.48, 0.80];
/** Rámik odchádza posledný — splnil úlohu, keď v ňom stojí nový text. */
/**
 * Rámik odchádza, keď v ňom už stojí prvý nový text.
 * ⚠️ NIE AŽ NA KONCI DRÁHY: nadpis a tri bloky sú vyššie než rámik (odmerané
 * 319 proti 239 px), takže by z neho pri plnom krytí vytŕčali hore aj dole.
 * Rámik je prísľub miesta, nie schránka — splnil úlohu v okamihu, keď je na
 * jeho mieste čo čítať.
 */
const FRAME_OUT: readonly [number, number] = [0.56, 0.72];

/**
 * DĹŽKA 4. PRECHODU: VIDEO SA CENTRUJE A ROZTIAHNE NA CELÚ OBRAZOVKU.
 * Štvrtý gombík tempa, ten istý recept ako PIN_VH · PIN2_VH · PIN3_VH.
 *
 * Matej 28. 8. 2026: *„ďalší scrolling dolu by mal video centrovať a zväčšovať
 * na celú obrazovku — 3 bloky zmiznú, na celej obrazovke bude len video. Ak
 * človek klikne na «pozri DOGYPT introfilm», to video sa mu dá do tejto pozície
 * a otvorí sa na celú obrazovku."*
 *
 * 🔑 NIE JE TO NOVÝ OBRAZ, JE TO DRUHÝ ZÁBER TOHO ISTÉHO. Vízia zostáva
 * prilepená (`.vhero-inner` sa nehýbe), len sa z rozdelenej obrazovky stane
 * plátno: tri bloky zhasnú a video prejde z ľavej polovice do stredu okna.
 * Preto sa dráha pripočítava k výške TEJ ISTEJ sekcie a nie ako ďalšia — inak
 * by medzi rozdelenou obrazovkou a plátnom bol strih.
 *
 * ⚠️ Číslo sedí naraz vo výške hero (`min-height` nižšie), v značkách snapu
 * a v cieli, kam skáče klik na „pozri introfilm" (`goCinema`). Meň ho TU.
 */
const PIN4_VH = 2;

/**
 * ÚSEKY 4. PRECHODU — podiel dráhy (0 = vízia v pokoji, 1 = video na celej
 * obrazovke). Prekrývajú sa zámerne, rovnako ako v predošlých troch.
 */
/**
 * NADPIS, TRI BLOKY A POPISOK POD VIDEOM ODCHÁDZAJÚ PRVÍ — a odchádzajú skôr,
 * než video dorastie. Keby hasli súbežne s rastom, video by cestou cez pravú
 * polovicu prekrylo text, ktorý ešte svieti, a vyzeralo by to ako chyba
 * vrstvenia. Takto je poradie čitateľné: najprv sa obrazovka vyprázdni, potom
 * ju zaberie plátno.
 */
const VOUT_OUT: readonly [number, number] = [0, 0.34];
/**
 * VIDEO SA CENTRUJE A RASTIE. Jedna hodnota ženie oboje — posun do stredu okna
 * aj šírku rámu —, lebo je to JEDEN pohyb. Dve premenné by sa pri prvom ladení
 * rozišli a z „video sa presunie na plátno" by boli dva nesúvisiace efekty.
 */
const GROW_IN: readonly [number, number] = [0.12, 0.94];

/**
 * DĹŽKA 5. PRECHODU: Z PAPYRUSU DO ČIERNEJ — ODOVZDANIE PRÍBEHU.
 * Piaty gombík tempa, ten istý recept ako PIN_VH · PIN2_VH · PIN3_VH · PIN4_VH.
 *
 * Matej 28. 8. 2026: *„to video sa bude zväčšovať a celá obrazovka vrátane
 * headru sčerná resp — nastane čierne pozadie ako je to na ostrom webe, budú
 * nasledovať modré písmenká a starwars príbeh na čiernom pozadí = celkom rozbije
 * príbeh na webe a urobí taký aha moment, pripomenie starwars"* +
 * *„tmavne aj video ako sa začne rozťahovať, nie len pozadie — celá obrazovka"*.
 *
 * 🔑 OPÄŤ TO NIE JE NOVÝ OBRAZ. Vízia ostáva prilepená rovnako ako pri plátne;
 * dráha sa preto pripočítava k výške TEJ ISTEJ sekcie. Vlastná sekcia by medzi
 * plátnom a černením spravila strih — a práve tá plynulosť je celý efekt.
 *
 * ⚠️ Číslo sedí naraz vo výške hero (`min-height` nižšie) a v značkách snapu.
 * Cieľ `goCinema` ostáva na konci PIN4 (plátno), nie tu — klik na „pozri
 * introfilm" má priniesť video, nie tmu. Meň to TU.
 */
const PIN5_VH = 2;

/**
 * ÚSEKY 5. PRECHODU — podiel dráhy (0 = plátno pod lištou, 1 = čierna sála).
 *
 * 🔑 SÚ TU DVE ČIERNE VRSTVY A KAŽDÁ ROBÍ NIEČO INÉ. Bez toho rozdielu sa to
 * postaviť nedá: jedna čierna nad všetkým by prekryla aj príbeh, ktorý má
 * nasledovať, a jedna čierna pod všetkým by nikdy nestmavila video ani lištu
 * (obe ležia vo filme nad ňou).
 *   ZÁVOJ (.op-veil, nad lištou)  — stmieva to, čo je práve vidieť. Je to
 *                                   PRECHODOVÁ vrstva: keď dohorí, zhasne.
 *   NOC  (.op-wall, pod filmom)   — čierna sála s tapetou. Je to PODKLAD:
 *                                   nastúpi pod závojom a ostane, kým beží
 *                                   príbeh. Zároveň berie hornú lištu a video.
 */
/** VIDEO DORASTIE z pásu pod lištou na celé okno. Začína hneď — je to ten istý
 *  pohyb ako v PIN4, len jeho druhá polovica, a pauza medzi nimi by ho zlomila. */
const GROW2_IN: readonly [number, number] = [0.00, 0.42];
/** ZÁVOJ. Nabieha s odstupom za rastom — najprv sa musí vidieť, že video rastie
 *  (*„tmavne aj video ako sa začne rozťahovať"*), inak je to len stmievačka. */
const VEIL_IN: readonly [number, number] = [0.08, 0.46];
/** NOC. Nastupuje POD závojom, keď ten už kryje — pod ním sa vymení podklad,
 *  zhasne lišta aj video, a nikto z toho nič nevidí. */
const WALL_IN: readonly [number, number] = [0.44, 0.60];
/** ZÁVOJ ODCHÁDZA a odhalí noc. Až TERAZ, keď je pod ním čierna sála: keby
 *  zhasol skôr, vrátil by na obrazovku papyrus, a keby neodišiel vôbec, ležal by
 *  nad príbehom a ten by nebolo vidieť. */
const VEIL_OUT: readonly [number, number] = [0.62, 0.82];
/**
 * A NÁVRAT DO PAPYRUSU — meria sa NA KONCI PRÍBEHU, nie na tejto dráhe.
 * Podiel poslednej obrazovky sekvencie príbehu (0 = príbeh ešte beží prilepený,
 * 1 = jej spodná hrana je na hornom okraji okna).
 *
 * ⚠️ Prečo až tu a nie skôr: časová os je na koniec príbehu naložená záporným
 * okrajom (`marginTop: -100vh` v AboutLab), takže POSLEDNÁ obrazovka príbehu je
 * PRVÁ obrazovka časovej osi — a tá je papyrusová. Text príbehu je v tej chvíli
 * už odletený hore (jeho vlastná dráha končí na p = 1, teda presne na začiatku
 * tohto úseku), takže sa hasí do prázdnej čiernej.
 *
 * 🚩 Je to prelínačka, nie réžia. Matej odchod z čiernej späť na papyrus zatiaľ
 * nezadal — pozri `plany/zadanie-onepage-cierna.md`, rozhodnutie A.
 */
const NIGHT_OUT: readonly [number, number] = [0.10, 0.62];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Mäkké konce — lineárny priebeh vyzerá ako stmievač, nie ako pohyb. */
const ease = (v: number) => v * v * (3 - 2 * v);
/** Výsek dráhy: mimo [a, b] vracia 0, resp. 1. */
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

/** Míľniky zo `plany/severka.md`. Roky zámerne nikde — severka nemá deadline. */
const MILESTONES = [
  { n: '1 000', title: 'The Founders', note: 'The first thousand. Slovakia carries the flame.' },
  { n: '10 000', title: 'The Pack', note: 'Merch, the pack tree, the first shelters helped.' },
  { n: '100 000', title: 'The Nation', note: 'A full-time mission. The app in every pocket.' },
  { n: '1 000 000', title: 'First Aid', note: 'Shelters funded by the pack, not by pity.' },
  { n: '∞', title: 'The Pantheon', note: 'Every dog on Earth carries a name that lasts.' },
];

/* ── OBLÚK ZA PRÍBEHOM — ČASOVANIE ODSÚHLASENÉ 31. 8. 2026 ──────────────────
   Objekt je 1:1 prenos z `plany/nakres-po-starwars-2026-08-31.html`, kde sa
   ladí posuvníkmi a vyváža tlačidlom. Matej ho odklepol slovami *„Sedí, prenes
   to do kódu"*. Kto ho chce meniť, mení ho V NÁKRESE a prenesie znova — dve
   miesta s tými istými číslami sa pri prvej úprave rozídu.

   Dráha 0–1 je scroll VNÚTRI oblúka. Vnútri každého prilepenia má obrazovka
   vlastnú dráhu 0–1, takže sa dá ladiť bez prepočítavania globálnych čísel.

   ⚠️ `rev.darkOut` z nákresu tu NIE JE a je to správne: odchod z čiernej do
   papyrusu vo filme UŽ EXISTUJE (`NIGHT_OUT` hore) a meria sa spodnou hranou
   sekvencie príbehu, nie touto dráhou. V nákrese musel byť, lebo tam príbeh
   nad oblúkom nestojí. Druhé stmievanie na tom istom mieste by bolo druhá
   réžia tej istej veci — presne to, čo `put()` nižšie zakazuje aj pre jednu
   vlastnosť jedného prvku. */
const ARC = {
  /** Globálny koniec prilepenia recenzií. */
  revEnd: 0.4,
  /** Globálny koniec presunu na NEXT STEP. */
  travEnd: 0.52,
  /** Podiely VNÚTRI prvého prilepenia. */
  rev: { headIn: [0.3, 0.56], cardsIn: [0.46, 0.8], cardStagger: 0.12 },
  /** Podiely VNÚTRI druhého prilepenia. */
  nxt: {
    headIn: [0.02, 0.22], lineIn: [0.14, 0.48], stopStagger: 0.05,
    lensIn: [0.42, 0.66], kotaIn: [0.58, 0.8], ctaIn: [0.74, 1],
  },
  /* 🔴 PREKRYV PRESUNU. Bez neho začne NEXT STEP písať sám seba až keď je pás
     na mieste — a keďže recenzie už odišli, príde PRÁZDNA obrazovka a až potom
     sa na nej niečo objaví. Je to tá istá vec, ktorou drží pohyb pokope zvyšok
     filmu: úseky sa prekrývajú, inak z jedného príchodu vzniknú dva deje za
     sebou. Číslo je podiel CELEJ dráhy, o ktorý sa druhé prilepenie začne
     skôr, než presun skončí. */
  travOverlap: 0.07,
} as const;

/** Dĺžka dráhy oblúka. Prilepené okno + dve obrazovky + presun medzi nimi. */
const ARC_VH = 3.2;

/** Skratky pre mobil — „1 000 000" má pod zastávkou pri 390 px dvojnásobok
 *  šírky, ktorú tam má. */
const ARC_SHORT = ['1K', '10K', '100K', '1M', '∞'];

/** Zastávky mierky. Rovnaké kroky, NIE číselná os: na lineárnej by tisícka
 *  sedela na 0,1 % a prvé štyri by sa zlepili na okraji; na logaritmickej by
 *  71 sedelo na 31 % dráhy, čo je pocitová lož. Pravdivá je značka VNÚTRI
 *  prvej fázy — 71 z 1 000.
 *  ⚠️ Mená aj čísla si berie zo `MILESTONES`, teda zo severky. Opísané by sa
 *  pri prvej úprave severky rozišli. */
const ARC_STOPS = MILESTONES.map((m, i) => ({
  at: (i + 1) * 20,
  n: m.n,
  short: ARC_SHORT[i],
  ph: m.title,
}));

/** Strop prvej fázy — DOPOČÍTANÝ zo severky, nie zapísaný druhýkrát. */
const FOUNDERS_TARGET = Number(MILESTONES[0].n.replace(/\D/g, '')) || 1000;

export default function OnePage() {
  const t = useT();
  const [scene, setScene] = useState(0);
  const [past, setPast] = useState(false);       // je už guľa preč?
  // Ústava v prekrytí. Kniha ako OBRAZ filmu zanikla (Matej 28. 8. 2026),
  // ostalo po nej CTA pod úryvkom — a toto je jeho následok.
  const [bookOpen, setBookOpen] = useState(false);
  // Otvorena STENA (mozaika zo spodnej listy). Nie je to sekcia filmu — je to
  // odbocka, ktora sa sprava ako samostatna stranka. Viac pri useEffect nizsie.
  const [wallOpen, setWallOpen] = useState(false);
  /** Choreografia filmu — drží sa v refe, aby sa dala vyvolať aj mimo scrollu. */
  const applyRef = useRef<() => void>(() => {});
  // Ktorý obraz hlási pozorovateľ stredu okna. Držané v refe, lebo rozhodnutie
  // patrí scroll handleru — viď komentár pri pozorovateľovi nižšie.
  const sceneRef = useRef(0);
  const [dogCount, setDogCount] = useState<number | null>(null);
  // 🔴 Choreografia beží v efekte s prázdnym poľom závislostí, takže vnútri
  // vidí `dogCount` navždy ako null. Značka „tu môžeš byť ty" by preto zamrzla
  // na nule aj potom, čo číslo dorazí. Ref + jedno prekreslenie po príchode.
  const dogCountRef = useRef<number | null>(null);
  // Tri citáty na obrazovku RECENZIE. Výber sa mieša raz za načítanie stránky
  // (to isté správanie ako pás na `/about`), preto useMemo bez závislostí —
  // s novým výberom pri každom prekreslení by sa citáty menili počas scrollu.
  const quotes = useMemo(() => pickCelebQuotes(3), []);

  // ── PRECHOD 1. → 2. OBRAZU ───────────────────────────────────────────────
  // Jedna obrazovka, ktorá sa nehýbe.
  //
  // 🔴 ZAPISUJE SA DO KONKRÉTNYCH PRVKOV, NIE DO <html>. Prvá verzia sypala
  // sedem CSS premenných na documentElement — a keďže vlastné premenné sa DEDIA,
  // každý zápis prepočítal štýl CELÉHO dokumentu. Odmerané na tejto stránke
  // (2 661 prvkov): **10 ms na snímok**, teda cez celý 60 fps rozpočet ešte
  // predtým, než prehliadač čokoľvek nakreslí. Presne to Matej opísal ako
  // *„nefunguje to, seká to, nie je to plynulé"*.
  // Preto: čo sa mení každý snímok, ide priamo na prvok (opacity/transform sa
  // NEDEDIA), a premenná ostala len tam, kde nesie LOCKED hodnotu z cudzieho
  // súboru (mierky kravy a Hektora) — a aj tá sedí na .codex-bleed, ktorý má
  // dve deti, nie na koreni.
  // ⚠️ Zapisuje sa LEN PRI ZMENE. Bez toho sa opakovaným zápisom tej istej
  // hodnoty zbytočne invaliduje štýl aj vtedy, keď scroll stojí.
  useEffect(() => {
    const q = <T extends Element>(sel: string) => document.querySelector(sel) as T | null;
    /** Prvky filmu sa mountujú postupne — kým chýbajú, hľadá sa znova. */
    let n: {
      planetRoot?: HTMLElement | null; stage?: HTMLElement | null; pHero?: HTMLElement | null;
      wall?: HTMLElement | null; ab?: HTMLElement | null;
      bleed?: HTMLElement | null; spot?: HTMLElement | null;
      overlay?: HTMLElement | null; pre?: HTMLElement | null;
      planet?: HTMLElement | null; film?: HTMLElement | null;
      dock?: HTMLElement | null;
      vstage?: HTMLElement | null; vblocks?: HTMLElement | null;
      vinner?: HTMLElement | null;
      veil?: HTMLElement | null; night?: HTMLElement | null;
      nav?: HTMLElement | null; crawl?: HTMLElement | null;
      // Oblúk za príbehom (recenzie → next step).
      arc?: HTMLElement | null; belt?: HTMLElement | null;
      revH2?: HTMLElement | null; revSub?: HTMLElement | null;
      revCards?: NodeListOf<HTMLElement>;
      nxEyebrow?: HTMLElement | null; nxH2?: HTMLElement | null;
      nxFill?: HTMLElement | null; nxStops?: NodeListOf<HTMLElement>;
      nxHere?: HTMLElement | null; nxLens?: HTMLElement | null;
      nxRays?: HTMLElement | null; nxBand?: HTMLElement | null;
      nxBandFill?: HTMLElement | null; nxBandLbl?: HTMLElement | null;
      nxKota?: HTMLElement | null; nxTail?: HTMLElement | null;
    } = {};
    const resolve = () => {
      n = {
        planet: q<HTMLElement>('.op-planet'),
        film: q<HTMLElement>('.op-film'),
        // Lišta NIE JE vnútri .op-planet — wall ju kreslí portálom do <body>
        // (viď prop portalDock), takže sa hľadá v celom dokumente.
        dock: q<HTMLElement>('.gods-dock-portal'),
        planetRoot: q<HTMLElement>('.op-planet .planet-root'),
        stage: q<HTMLElement>('.op-planet .planet-stage'),
        pHero: q<HTMLElement>('.op-planet .planet-hero'),
        wall: q<HTMLElement>('.op-planet [role="application"]'),
        ab: q<HTMLElement>('.op-planet .ab-switch'),
        bleed: q<HTMLElement>('#op-religion .codex-bleed'),
        // Vrstva s Hektorovým hotspotom. Stojí VEDĽA bleedu (nad obsahom filmu,
        // inak sa na bodku nedá kliknúť), takže premenné dostáva vlastným zápisom.
        spot: q<HTMLElement>('#op-religion .codex-spotlayer'),
        overlay: q<HTMLElement>('#op-religion .codex-section[data-idx="0"] .codex-3-overlay'),
        // Preambula: všetky štyri premenné druhého prechodu sedia na JEDNOM
        // prvku (nadpis, rám, text aj prísaha sú jeho deti) — štyri zápisy
        // namiesto štyroch prvkov a žiadna dedičnosť cez celý dokument.
        pre: q<HTMLElement>('#op-religion .codex-section[data-idx="1"] .codex-slide'),
        // Tretí prechod: ľavá polovica (video) a pravá (nadpis + tri bloky).
        // Sú to dva prvky a nie jeden, lebo sa hýbu inak — video priletí zľava,
        // bloky sa na mieste dopíšu.
        vstage: q<HTMLElement>('#op-vision .vhero-stage'),
        vblocks: q<HTMLElement>('#op-vision .vhero-blocks'),
        // 4. prechod (video na celú obrazovku) sedí na SPOLOČNOM rodičovi oboch
        // polovíc: hasnutie sa týka pravého stĺpca aj popisku pod videom, rast
        // len rámu videa — a všetko sú to jeho deti. Jeden zápis namiesto troch
        // a podstrom je malý (video + tri bloky), takže dedičnosť tu nič nestojí.
        vinner: q<HTMLElement>('#op-vision .vhero-inner'),
        // 5. prechod (z papyrusu do čiernej). Závoj aj noc sú fixed vrstvy
        // priamo v koreni filmu — nesedia na žiadnej sekcii, lebo prechod sa
        // netýka jedného obrazu, ale CELEJ obrazovky vrátane hornej lišty.
        veil: q<HTMLElement>('.op-veil'),
        night: q<HTMLElement>('.op-wall'),
        // Horná lišta je mimo .op-stage (fixed, nad filmom) — v noci hasne.
        nav: q<HTMLElement>('.nav-top'),
        // Sekvencia príbehu. Meria sa len jej SPODNÁ HRANA, a to kvôli návratu
        // do papyrusu — dĺžku (340vh) drží AboutLab a nesmie sa sem opísať.
        crawl: q<HTMLElement>('.op-film .swcrawl'),
        // ── OBLÚK ZA PRÍBEHOM ────────────────────────────────────────────
        // Dráhu meria SEKCIA (je vyššia než okno), pohyb dostáva PÁS vnútri
        // prilepeného javiska. Sú to dva prvky zámerne: keby sa posúvala
        // sekcia, odniesla by so sebou aj svoju vlastnú dráhu.
        arc: q<HTMLElement>('.op-arc'),
        belt: q<HTMLElement>('.op-arc-belt'),
        revH2: q<HTMLElement>('.op-rev-h2'),
        revSub: q<HTMLElement>('.op-rev-sub'),
        revCards: document.querySelectorAll<HTMLElement>('.op-rev-card'),
        nxEyebrow: q<HTMLElement>('.op-nxt-eyebrow'),
        nxH2: q<HTMLElement>('.op-nxt-h2'),
        nxFill: q<HTMLElement>('.op-nxt-axis-fill'),
        nxStops: document.querySelectorAll<HTMLElement>('.op-nxt-stop'),
        nxHere: q<HTMLElement>('.op-nxt-here'),
        nxLens: q<HTMLElement>('.op-nxt-lens'),
        nxRays: q<HTMLElement>('.op-nxt-rays'),
        nxBand: q<HTMLElement>('.op-nxt-band'),
        nxBandFill: q<HTMLElement>('.op-nxt-band-fill'),
        nxBandLbl: q<HTMLElement>('.op-nxt-band-lbl'),
        nxKota: q<HTMLElement>('.op-nxt-kota'),
        // Chvost obrazovky (veta + CTA + poznámka) je JEDEN prvok: prichádzajú
        // spolu ako jeden dej, takže tri zápisy do troch prvkov by boli tri
        // stmievačky, ktoré sa pri prvom ladení rozídu.
        nxTail: q<HTMLElement>('.op-nxt-tail'),
      };
    };
    resolve();

    const prev: Record<string, string> = {};
    /** Zápis len pri zmene — inak sa štýl invaliduje aj keď scroll stojí. */
    const put = (el: HTMLElement | null | undefined, key: string, prop: string, val: string) => {
      if (!el || prev[key] === val) return;
      prev[key] = val;
      if (prop.startsWith('--')) el.style.setProperty(prop, val);
      else (el.style as unknown as Record<string, string>)[prop] = val;
    };
    /** To isté pre text. Nejde to cez `put()`: ten zapisuje do `style`, takže
     *  `textContent` by ticho skončil ako neexistujúca CSS vlastnosť. */
    const putText = (el: HTMLElement | null | undefined, key: string, val: string) => {
      if (!el || prev[key] === val) return;
      prev[key] = val;
      el.textContent = val;
    };

    let raf = 0;
    let tries = 0;
    const apply = () => {
      raf = 0;
      if (!n.planetRoot || !n.bleed) { if (tries++ < 60) resolve(); }
      const vh = window.innerHeight;
      const span = Math.max(1, vh * PIN_VH);
      const p = clamp01(window.scrollY / span);

      // GUĽA: hasne a zároveň sa vzďaľuje. Vzdialenie sedí na .planet-stage
      // a .planet-hero (nie na celom obale), aby sa spodná lišta nezmenšovala
      // spolu s ňou — tá ostáva na obrazovke aj po odchode gule.
      const o = 1 - seg(p, PLANET_OUT[0], PLANET_OUT[1]);
      // Mierka ide po TEJ ISTEJ dráhe ako hasnutie — inak by guľa zmizla skôr,
      // než sa stihne vzdialiť, a z odletu by ostal stmievač.
      const sc = (1 - PLANET_RECEDE * seg(p, PLANET_OUT[0], PLANET_OUT[1])).toFixed(4);
      // Nadpis, podnadpis a ADD PHOTO odchádzajú vlastnou, oveľa kratšou dráhou.
      const ho = (1 - seg(p, HERO_OUT[0], HERO_OUT[1])).toFixed(3);
      // ⚠️ Planéta má vlastnú priehľadnosť aj v CSS (zavretá = 0). Keď je zavretá
      // — človek si prepol na stenu — inline zápis sa MUSÍ stiahnuť, inak by ju
      // natrvalo rozsvietil nad stenou.
      const planetOpen = !!n.planetRoot?.classList.contains('open');
      put(n.planetRoot, 'pr', 'opacity', planetOpen ? o.toFixed(3) : '');
      // ⚠️ ZAPISUJE SA NÁSOBIČ, NIE HOTOVÝ TRANSFORM. Priamy zápis transformu
      // na prvok prebije každé CSS pravidlo — vrátane toho, ktorým sa guľa
      // uhýba panelu s kartou psa (a na mobile aj jej vlastnej mierky 0.62,
      // ktorú by absolútny scale ticho prepísal na 1). Premenná sedí na JEDNOM
      // prvku s dvoma deťmi, nie na koreni dokumentu — to bola tá pôvodná
      // chyba za 9,84 ms na snímok, a tá sa sem nevracia.
      put(n.stage, 'st', '--op-sc', sc);
      put(n.pHero, 'ph', 'transform', `translate(-50%, -50%) scale(${sc})`);
      put(n.pHero, 'pho', 'opacity', ho);
      // Zhasnutý blok nesmie ostať klikateľný — ADD PHOTO je pod prstom aj
      // vtedy, keď ho nevidno, a otvoril by nahrávanie fotky uprostred filmu.
      put(n.pHero, 'phpe', 'pointerEvents', ho === '0.000' ? 'none' : '');
      // Spodná lišta odchádza s prvou obrazovkou a už sa nevracia.
      const doc = (1 - seg(p, DOCK_OUT[0], DOCK_OUT[1])).toFixed(3);
      put(n.dock, 'dk', 'opacity', doc);
      put(n.dock, 'dkv', 'visibility', doc === '0.000' ? 'hidden' : '');
      // STENA SA POČAS ODCHODU NESMIE VYNORIŤ: na prvej obrazovke ju nekryje nič
      // iné než nepriehľadné pozadie planéty, takže len čo to pozadie začne
      // presvitať, vyplávajú spod gule karty psov aj wallový stred. Keď si človek
      // stenu vyslovene otvoril, hasne normálne s guľou.
      put(n.wall, 'wl', 'opacity', planetOpen ? '0' : o.toFixed(3));
      put(n.ab, 'ab', 'opacity', o.toFixed(3));   // dev prepínač A/B patrí prvej obrazovke

      // KRAVA A HEKTOR: 1 = celkom za hranou obrazovky, 0 = LOCKED poloha
      // z ReligionLab. Premenná ostáva premennou zámerne — mierky (PC 1.14/1.08,
      // mobil 1.377/1.352) sú LOCKED a patria do CSS, nie do tohto súboru.
      put(n.bleed, 'in', '--op-in', (1 - seg(p, ANIMALS_IN[0], ANIMALS_IN[1])).toFixed(3));
      // TEXT V STREDE: nabieha posledný.
      put(n.overlay, 'tx', '--op-txt', seg(p, TEXT_IN[0], TEXT_IN[1]).toFixed(3));
      // SVÄTOŽIARA HEKTORA: úplne posledná — je to odmena za doscrollovanie.
      // Sedí na bleede (tam žijú obe zvieratá aj obe halá), nie na texte.
      put(n.bleed, 'hl', '--op-halo', seg(p, HALO_IN[0], HALO_IN[1]).toFixed(3));

      // ── PRECHOD 2. → 3. OBRAZU ───────────────────────────────────────
      // Jedna obrazovka, ktorá sa nehýbe — druhýkrát. Rozdiel oproti prvému
      // prechodu je len v tom, ČO sa vymieňa: tam guľa za výjav, tu výjav za
      // preambulu. Dĺžka a úseky sedia v PIN2_VH a spol. hore.
      const span2 = Math.max(1, vh * PIN2_VH);
      const q = clamp01((window.scrollY - span) / span2);

      // 🔴 TEXT PRVÉHO VÝJAVU MIZNE NA MIESTE, NEPUTUJE HORE (Matej 28. 8. 2026).
      // Sekcia výjavu má dráhu za sebou, takže sa práve odlepila a odchádza
      // hore ako každá iná — a s ňou by odchádzal aj text. Preto sa jej pohyb
      // textu PREKLADÁ SPÄŤ: presne o toľko pixelov, o koľko sa medzitým
      // posunula. Výsledok je text prilepený na mieste, ktorý len zhasína.
      // ⚠️ Posun sa zastaví na konci hasnutia — ďalej ho držať netreba (text je
      // neviditeľný) a hlavne by prerástol dráhu, po ktorej je sekcia ešte
      // prilepená.
      const heroGone = 1 - seg(q, HERO2_OUT[0], HERO2_OUT[1]);
      const hold = Math.max(0, Math.min(window.scrollY - span, span2 * HERO2_OUT[1]));
      put(n.overlay, 'ohy', 'transform', hold > 0 ? `translateY(${hold.toFixed(1)}px)` : '');
      put(n.overlay, 'oop', 'opacity', heroGone.toFixed(3));
      // Zhasnuté CTA nesmie ostať pod prstom — je to odkaz na /entry a leží
      // presne tam, kam medzitým prišiel nadpis preambuly.
      put(n.overlay, 'ope', 'pointerEvents', heroGone <= 0.002 ? 'none' : '');

      // PREAMBULA: nadpis sa vynorí na mieste · úryvok príde zdola · text sa
      // v ráme dopisuje · prísaha je podpis na konci.
      put(n.pre, 'ey', '--op-eye', seg(q, EYE_IN[0], EYE_IN[1]).toFixed(3));
      put(n.pre, 'h2', '--op-h2', seg(q, H2_IN[0], H2_IN[1]).toFixed(3));
      put(n.pre, 'qt', '--op-quote', seg(q, QUOTE_IN[0], QUOTE_IN[1]).toFixed(3));
      put(n.pre, 'ik', '--op-ink', seg(q, INK_IN[0], INK_IN[1]).toFixed(3));
      put(n.pre, 'oa', '--op-oath', seg(q, OATH_IN[0], OATH_IN[1]).toFixed(3));
      put(n.pre, 'ct', '--op-cta', seg(q, CTA_IN[0], CTA_IN[1]).toFixed(3));
      // Hotspot sedí na BLEEDE, nie na preambule — svieti pes, nie text.
      // 🔴 A PRETO POTREBUJE AJ ODCHOD. Zvieratá žijú celý film, takže `q`
      // ostane na 1.0 aj dávno za preambulou a bodka by svietila cez víziu,
      // o nás aj join. Preambula sama tento problém nemá — odchádza aj
      // s obsahom. Odchod je krátky: film ide ďalej a hotspot patrí k výjavu,
      // ktorý sa práve skončil.
      // ⚠️ ODCHOD MÁ ODKLAD O ŠTVRŤ OBRAZOVKY. Bez neho začína hasnutie presne
      // tam, kde nábeh končí (obe hranice sú `span + span2`), takže bodka mala
      // plnú silu v JEDINOM bode dráhy — odmerané: 4500 px plná, 4800 px nula,
      // pri kroku 100 px sa to nedalo ani zachytiť. Odklad drží bodku celú na
      // odpočívadle, kde človek naozaj stojí a číta CTA.
      const spotOut = clamp01((window.scrollY - span - span2 - vh * 0.25) / (vh * 0.35));
      const spot = seg(q, SPOT_IN[0], SPOT_IN[1]) * (1 - ease(spotOut));
      put(n.bleed, 'sp3', '--op-spot', spot.toFixed(3));
      put(n.spot, 'sp4', '--op-spot', spot.toFixed(3));

      // ── ROZDELENIE OBRAZOVKY ──────────────────────────────────────────
      // Jedna hodnota ženie tri veci naraz, a to je celý zmysel: text ide
      // doľava, pes sa nakláňa a rastie do uvoľneného miesta, krava odchádza
      // z obrazu. Keby to boli tri premenné, rozídu sa pri prvom ladení a zo
      // zlomu bude trojica nezávislých driftov.
      //
      // 🔴 TOTO NAHRADILO ODSUN ZVIERAT DO STRÁN (--op-side aj jeho pixelovú
      // zložku --op-sidex). Odsun bol obchádzka toho istého problému — tmavý
      // pes zožerie konce riadkov —, len horšia: pri užšom okne ho bolo treba
      // tlačiť stále ďalej, až z výjavu ostal okraj. Rozdelenie ten problém
      // ruší v koreni: text a pes prestali stáť na tom istom mieste.
      put(n.pre, 'sp', '--op-split', seg(q, SPLIT_IN[0], SPLIT_IN[1]).toFixed(3));
      put(n.bleed, 'sp2', '--op-split', seg(q, SPLIT_IN[0], SPLIT_IN[1]).toFixed(3));
      // Vrstva s bodkou stojí vedľa bleedu, takže --op-split nezdedí — dostáva ho
      // zvlášť. Bez toho by pri rozdelení ostala stáť, kým sa pes nakláňa a rastie.
      put(n.spot, 'sp5', '--op-split', seg(q, SPLIT_IN[0], SPLIT_IN[1]).toFixed(3));
      // BLEDNE UŽ LEN KRAVA (viď COW_OUT). Hektor si drží farbu po celý film —
      // spoločné stlmenie oboch zaniklo spolu so štvrtým obrazom.
      put(n.bleed, 'cw', '--op-cow', (1 - (1 - COW_DIM) * seg(q, COW_OUT[0], COW_OUT[1])).toFixed(3));

      // ── PRECHOD 3. → 4. OBRAZU: PÁS SA POSUNIE DOPRAVA ───────────────
      // Prvý prechod, pri ktorom sa hýbe svet a nielen to, čo je vidieť.
      // Stĺpec s úryvkom cestuje z ľavej polovice do pravej a cestou sa
      // odpisuje, pes vychádza za pravý okraj, zľava nastupuje video a vpravo
      // sa dopíše nadpis s tromi blokmi.
      const span3 = Math.max(1, vh * PIN3_VH);
      const r = clamp01((window.scrollY - span - span2) / span3);

      // 🔴 DOGMA STOJÍ POČAS PRECHODU NATÍVNE, NIE PREKLADOM V JS.
      // Matej 28. 8. 2026: *„prečo ten rámik kde je citacia ustavy nejde rovno
      // ale trasie sa a ide mierne dolu a hore - to musí byť plynulé"*.
      //
      // Prvá verzia nechala prilepenie preambuly skončiť tam, kde prechod
      // začína, a jej odchod hore kompenzovala zápisom translateY z hodnoty
      // window.scrollY. To sa NIKDY nemôže vykresliť hladko: prehliadač
      // posúva prilepený box vo vlastnom kroku scrollu, kým kompenzácia príde
      // až v rAF o snímok neskôr — rozdiel medzi nimi je práve to trasenie.
      // Riešenie je nemať čo kompenzovať: preambula (a s ňou celá stránka
      // náboženstva vrátane zvierat) je PRILEPENÁ o dráhu prechodu dlhšie,
      // takže naozaj stojí. Viď min-height sekcie a margin-top vízie v CSS.

      // Posun stĺpca a odchod psa. Sú to dva úseky, nie jeden: pes musí byť
      // preč skôr, než na jeho polovicu dorazí text.
      put(n.pre, 'sl', '--op-slide', seg(r, SLIDE_IN[0], SLIDE_IN[1]).toFixed(3));
      put(n.pre, 'un', '--op-unink', seg(r, UNINK_OUT[0], UNINK_OUT[1]).toFixed(3));
      const hek = seg(r, HEK_OUT[0], HEK_OUT[1]).toFixed(3);
      put(n.bleed, 'hk', '--op-hek', hek);
      put(n.spot, 'hk2', '--op-hek', hek);
      // Odpísaný stĺpec nesmie ostať pod prstom — je v ňom CTA do ústavy.
      put(n.pre, 'upe', 'pointerEvents', r >= UNINK_OUT[1] ? 'none' : '');

      // Rámik odchádza posledný — až keď v ňom stojí nový text.
      put(n.pre, 'fr', '--op-frame', seg(r, FRAME_OUT[0], FRAME_OUT[1]).toFixed(3));
      // Video prichádza zdola · nadpis a bloky nabiehajú v oblasti rámika.
      put(n.vstage, 'vd', '--op-vid', seg(r, VID_IN[0], VID_IN[1]).toFixed(3));
      const vb = seg(r, VB_IN[0], VB_IN[1]);
      put(n.vblocks, 'vb', '--op-vb', vb.toFixed(3));
      // Bloky ležia presne nad textom DOGMY a sú neviditeľné takmer celý
      // prechod — kým sa nedopíšu, nesmú byť pod prstom (pod nimi je CTA do
      // ústavy). Tá istá starosť ako pri zhasnutom ADD PHOTO na prvej obrazovke.
      // ⚠️ 'auto', nie prázdny reťazec: prilepená vrstva vízie má
      // pointer-events: none, takže zrušením inline hodnoty by bloky zdedili
      // NONE a hover by na nich nikdy nenaskočil.

      // ── 4. PRECHOD: VIDEO NA CELÚ OBRAZOVKU ──────────────────────────
      // Vízia ostáva prilepená — mení sa len to, čo je na nej vidieť. Tri
      // bloky zhasnú a rám videa prejde z ľavej polovice do stredu okna
      // a dorastie na celú výšku pásu pod lištou. Rozmery aj posun sú
      // ROVNICOU V CSS (--vf-rest → --vf-full, +25vw), nie meraním: šírka
      // rámu má jednu definíciu a JS ju nesmie mať druhýkrát.
      const span4 = Math.max(1, vh * PIN4_VH);
      const s4 = clamp01((window.scrollY - span - span2 - span3) / span4);
      const vout = seg(s4, VOUT_OUT[0], VOUT_OUT[1]);
      put(n.vinner, 'vo', '--op-vout', vout.toFixed(3));
      put(n.vinner, 'gw', '--op-grow', seg(s4, GROW_IN[0], GROW_IN[1]).toFixed(3));
      // Bloky ležia presne nad textom DOGMY a sú neviditeľné takmer celý
      // prechod — kým sa nedopíšu, nesmú byť pod prstom (pod nimi je CTA do
      // ústavy). Tá istá starosť ako pri zhasnutom ADD PHOTO na prvej obrazovke.
      // ⚠️ 'auto', nie prázdny reťazec: prilepená vrstva vízie má
      // pointer-events: none, takže zrušením inline hodnoty by bloky zdedili
      // NONE a hover by na nich nikdy nenaskočil.
      // 🔴 A DRUHÁ PODMIENKA — hasnúci blok nesmie kradnúť kliky videu, ktoré
      // cezeň práve rastie. Rám sa vo štvrtom prechode presunie NAD pravú
      // polovicu, takže bez tejto podmienky by na plátne nešlo spustiť
      // prehrávanie: prst by trafil neviditeľný blok pod prstom.
      put(n.vblocks, 'vbpe', 'pointerEvents', vb >= 0.999 && vout <= 0.01 ? 'auto' : 'none');

      // ── 5. PRECHOD: Z PAPYRUSU DO ČIERNEJ ────────────────────────────
      // Video dorastie z pásu pod lištou na CELÉ okno, cez všetko sa prevalí
      // závoj, pod ním sa vymení podklad za čiernu sálu a zhasne horná lišta
      // aj video — a keď je to hotové, závoj odíde a odhalí noc.
      // ⚠️ Šírka rámu sa aj tu počíta ROVNICOU V CSS (tretí bod --vf-cover),
      // nie tu. Ten istý dôvod ako pri PIN4: vzorec má jedno miesto.
      const span5 = Math.max(1, vh * PIN5_VH);
      const s5 = clamp01((window.scrollY - span - span2 - span3 - span4) / span5);
      put(n.vinner, 'gw2', '--op-grow2', seg(s5, GROW2_IN[0], GROW2_IN[1]).toFixed(3));

      // NOC = čierny podklad + zhasnutá lišta a video. Nastupuje pod závojom
      // a odchádza až na konci príbehu, nie na konci tejto dráhy.
      // ⚠️ Odchod sa NEMERIA scrollom filmu, ale spodnou hranou sekvencie
      // príbehu — jej dĺžka (340vh) patrí AboutLabu a opísaná sem by sa pri
      // prvej zmene rozišla. Kým sekvencia nie je namontovaná, noc drží.
      let nightOut = 0;
      if (n.crawl) {
        const bottom = n.crawl.getBoundingClientRect().bottom;
        nightOut = seg(clamp01((vh - bottom) / vh), NIGHT_OUT[0], NIGHT_OUT[1]);
      }
      const night = seg(s5, WALL_IN[0], WALL_IN[1]) * (1 - nightOut);
      put(n.night, 'wl', 'opacity', night.toFixed(3));
      // Lišta a video hasnú TOU ISTOU hodnotou ako nastupuje noc — je to jeden
      // dej (*„celá obrazovka vrátane headru sčerná"*), nie tri zhody náhod.
      // Deje sa to pod závojom, takže samotné hasnutie nikto nevidí; keby ho
      // nebolo, po odchode závoja by na čiernej svietila lišta a pás videa.
      put(n.nav, 'nvo', 'opacity', (1 - night).toFixed(3));
      put(n.nav, 'nvpe', 'pointerEvents', night > 0.5 ? 'none' : '');
      // 🔴 SPODNÁ LIŠTA SA TU NEHASÍ A JE TO SPRÁVNE — odchádza už s prvou
      // obrazovkou a *„už sa nevracia"* (DOCK_OUT vyššie), takže v noci dávno
      // nesvieti. Prvé kolo jej sem pridalo vlastné hasnutie a spravilo dve
      // chyby naraz: pri návrate z čiernej by ju rozsvietilo, hoci sa vracať
      // nemá — a nefungovalo by to ani tak, lebo put() si pamätá poslednú
      // hodnotu POD KĽÚČOM. Dva kľúče na tú istú vlastnosť jedného prvku sa
      // navzájom nevidia: druhý zápis prvý prebije a potom si myslí, že sa nič
      // nezmenilo. Vlastnosť patrí VŽDY jednému miestu v réžii.
      put(n.vinner, 'nite', '--op-night', night.toFixed(3));

      // ZÁVOJ — jediná vrstva nad VŠETKÝM vrátane hornej lišty. Nie hasnutie po
      // prvkoch: tri samostatné stmievačky (papyrus, video, lišta) sa pri prvom
      // ladení rozídu a z jedného deja sú tri.
      // ⚠️ Odchod závoja sa NESMIE spustiť skôr, než noc dosadne — inak by na
      // okamih presvitol papyrus pod ním. Preto VEIL_OUT začína až za WALL_IN.
      const veil = clamp01(seg(s5, VEIL_IN[0], VEIL_IN[1]) - seg(s5, VEIL_OUT[0], VEIL_OUT[1]));
      put(n.veil, 'vl', 'opacity', veil.toFixed(3));
      // Čo nie je vidieť, nesmie byť pod prstom — a naopak: kým závoj kryje,
      // nesmie brať kliky ničomu pod sebou. Preto je vždy priehľadný pre prst
      // (CSS) a jediné, čo sa tu rieši, je jeho kreslenie.
      put(n.veil, 'vlv', 'visibility', veil <= 0.002 ? 'hidden' : 'visible');
      put(n.night, 'wlv', 'visibility', night <= 0.002 ? 'hidden' : 'visible');

      // ── 6. OBLÚK ZA PRÍBEHOM: RECENZIE → NEXT STEP ───────────────────
      // Tri úseky na jednej dráhe. Prvé prilepenie píše recenzie, presun
      // posunie pás o obrazovku, druhé prilepenie píše NEXT STEP — a druhé
      // sa začne o `travOverlap` skôr, než presun skončí, aby medzi nimi
      // nevznikla prázdna obrazovka.
      // ⚠️ Čierna sa tu NEHASÍ — to robí `nightOut` vyššie a meria to koncom
      // príbehu. Toto je len to, čo sa pod ňou medzitým píše.
      if (n.arc && n.belt) {
        const rect = n.arc.getBoundingClientRect();
        // Dráha = výška sekcie mínus prilepené okno. Meria sa z prvku, nie
        // z konštanty ARC_VH: tú istú hodnotu drží CSS a dve miesta s tým
        // istým číslom sa pri prvej zmene rozídu.
        const run = Math.max(1, rect.height - vh);
        const at = clamp01(-rect.top / run);

        const A = ARC.revEnd;
        const B = ARC.travEnd;
        const rp = clamp01(at / A);                 // dráha recenzií
        const tv = seg(at, A, B);                   // presun
        const B0 = Math.max(0, B - ARC.travOverlap);
        const np = clamp01((at - B0) / Math.max(0.001, 1 - B0)); // dráha next stepu

        const revH = seg(rp, ARC.rev.headIn[0], ARC.rev.headIn[1]);
        const head = seg(np, ARC.nxt.headIn[0], ARC.nxt.headIn[1]);
        const line = seg(np, ARC.nxt.lineIn[0], ARC.nxt.lineIn[1]);
        const lens = seg(np, ARC.nxt.lensIn[0], ARC.nxt.lensIn[1]);
        const kota = seg(np, ARC.nxt.kotaIn[0], ARC.nxt.kotaIn[1]);
        const tail = seg(np, ARC.nxt.ctaIn[0], ARC.nxt.ctaIn[1]);

        // Podiel prvej fázy, ktorý je už zaplnený. Kým číslo nedorazí, je 0 —
        // značka teda stojí na začiatku, nie na vymyslenom mieste.
        const inFounders = clamp01((dogCountRef.current ?? 0) / FOUNDERS_TARGET);

        // Pás je dvakrát vyšší než okno ⇒ posun o polovicu = o jednu obrazovku.
        put(n.belt, 'abt', 'transform', `translateY(${(-50 * tv).toFixed(3)}%)`);

        put(n.revH2, 'arh', 'opacity', revH.toFixed(3));
        put(n.revH2, 'arht', 'transform', `translateY(${((1 - revH) * 16).toFixed(1)}px)`);
        put(n.revSub, 'ars', 'opacity', (revH * 0.95).toFixed(3));
        n.revCards?.forEach((c, i) => {
          const cp = seg(rp, ARC.rev.cardsIn[0] + i * ARC.rev.cardStagger,
                             ARC.rev.cardsIn[1] + i * ARC.rev.cardStagger);
          put(c, 'arc' + i, 'opacity', cp.toFixed(3));
          put(c, 'arct' + i, 'transform', `translateY(${((1 - cp) * 14).toFixed(1)}px)`);
        });

        put(n.nxEyebrow, 'ane', 'opacity', head.toFixed(3));
        put(n.nxH2, 'anh', 'opacity', head.toFixed(3));
        put(n.nxH2, 'anht', 'transform', `translateY(${((1 - head) * 16).toFixed(1)}px)`);

        put(n.nxFill, 'anf', 'transform', `scaleX(${line.toFixed(3)})`);
        n.nxStops?.forEach((el, i) => {
          const sp = seg(np, ARC.nxt.lineIn[0] + i * ARC.nxt.stopStagger,
                             ARC.nxt.lineIn[1] + i * ARC.nxt.stopStagger);
          put(el, 'ans' + i, 'opacity', sp.toFixed(3));
          put(el, 'anst' + i, 'transform',
              `translateX(-50%) translateY(${((1 - sp) * 8).toFixed(1)}px)`);
        });
        put(n.nxHere, 'anhl', 'left', `${(inFounders * ARC_STOPS[0].at).toFixed(3)}%`);
        put(n.nxHere, 'anho', 'opacity',
            seg(np, ARC.nxt.lineIn[1] - 0.04, ARC.nxt.lineIn[1] + 0.06).toFixed(3));

        // Lúče výrezu sú kreslené priesvitnosťou FARBY, nie krytím prvku:
        // `currentColor` dedia obe cesty, takže je to jeden zápis namiesto dvoch.
        put(n.nxRays, 'anr', 'color', `rgba(140,96,20,${(0.3 * lens).toFixed(3)})`);
        put(n.nxBand, 'anb', 'opacity', lens.toFixed(3));
        put(n.nxBand, 'anbt', 'transform', `translateY(${((1 - lens) * 10).toFixed(1)}px)`);
        put(n.nxBandFill, 'anbf', 'width', `${(inFounders * 100 * lens).toFixed(2)}%`);
        // 🔴 Popisok hovorí ZOSTÁVAJÚCU kapacitu, nie vyplnenú. Výrez malosť
        // neodstráni, len ju zväčší: 71 z 1 000 je aj po dvadsaťnásobnom
        // priblížení sedem percent. Chcieť byť medzi prvými robí to, čo ešte
        // ostáva — prvá tisícka sa raz zavrie.
        putText(n.nxBandLbl, 'anbl',
            dogCountRef.current === null
              ? ''
              : `${(FOUNDERS_TARGET - dogCountRef.current).toLocaleString('en-US')} spots left`);
        put(n.nxKota, 'ankl', 'left', `${(inFounders * 100).toFixed(2)}%`);
        put(n.nxKota, 'anko', 'opacity', kota.toFixed(3));

        put(n.nxTail, 'ant', 'opacity', tail.toFixed(3));
        put(n.nxTail, 'antt', 'transform', `translateY(${((1 - tail) * 14).toFixed(1)}px)`);
      }

      // Tieto tri sa menia DVAKRÁT za celý film, tak smú ostať premennými.
      const gone = o <= 0.002;
      put(n.planet, 'vis', '--op-vis', gone ? 'hidden' : 'visible');
      put(n.planet, 'pe', '--op-pe', gone ? 'none' : 'auto');
      put(n.planet, 'cv', '--op-cv', gone ? 'hidden' : 'visible');
      // Film leží nad guľou, takže kým guľa svieti, musí byť pre prst priehľadný.
      put(n.film, 'fpe', '--op-film-pe', o <= 0.02 ? 'auto' : 'none');

      setPast(p >= CTA_AT);
      // Kým beží prechod, v nave svieti HOME. Sekcia náboženstva začína na tom
      // istom mieste ako guľa, takže sama od seba by sa označila hneď na štarte.
      // ⚠️ Rozhoduje sa TU, nie v pozorovateľovi. Pozorovateľ hlási len ZMENY:
      // stred okna leží vnútri náboženstva už od nultého pixela, takže jeho
      // jediné hlásenie príde na štarte — a keby ho vtedy zahodil vlastný
      // strážca prechodu, druhé by neprišlo nikdy a nav by ostal na HOME cez
      // celý prvý obraz. Odskúšané: presne to sa aj stalo.
      // 🔴 A DRUHÝ STRÁŽCA — TENTOKRÁT NA KONCI. Sekcia vízie je vtiahnutá
      // o obrazovku hore (prechod 3 → 4), takže jej stred pretne stred okna
      // ešte kým na obrazovke stojí DOGMA — a pilulka by na nej písala VÍZIA.
      // Je to tá istá pasca ako pri guli na začiatku filmu, len zrkadlovo:
      // pozorovateľ hlási polohu v DOM-e, nie to, čo je vidieť.
      // 🔴 A PRE VÍZIU HO MUSÍ NAHRADIŤ ÚPLNE. Pozorovateľ stojí na predpoklade
      // zapísanom pri jeho vzniku: *dve susedné sekcie nemôžu pretínať stred
      // okna naraz*. Odkedy je vízia vtiahnutá o obrazovku hore, tie dve sekcie
      // sa PREKRÝVAJÚ — a v tom prekryve nepríde nové hlásenie, lebo sa žiadny
      // priesečník nezmenil. Odmerané v React stave: sceneRef ostal na 1 aj
      // 1 600 px za koncom prechodu, teda uprostred vízie.
      // Preto sa poloha v prvej polovici filmu odvodzuje priamo zo scrollu —
      // ten je tu presný, obrazy sedia na násobkoch obrazovky. Pozorovateľ
      // ďalej rozhoduje o všetkom za víziou (o nás, míľniky, join), kde sa
      // sekcie neprekrývajú a jeho predpoklad platí.
      const preVision = window.scrollY < span + span2 + span3 * 0.5;
      setScene(
        p < 0.55 ? 0
        : preVision ? 1
        : sceneRef.current < 2 ? 2
        : sceneRef.current
      );
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    applyRef.current = apply;
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── Ktorý obraz práve beží (podsvietenie v nave) ─────────────────────────
  useEffect(() => {
    // HOME sa zámerne NEsleduje: náboženstvo začína na tom istom mieste ako
    // guľa (prekryv o jednu obrazovku), takže by observer označil druhý obraz
    // hneď na štarte. Prvý obraz preto priraďuje scroll handler vyššie.
    const nodes = SCENES.filter((s) => s.id !== 'home')
      .map((s) => document.getElementById('op-' + s.id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    // 🔴 SLEDUJE SA PRIESEČNÍK SO STREDOM OBRAZOVKY, NIE PODIEL PLOCHY.
    // Pôvodných `threshold: 0.3` nemohlo pri dvoch zo štyroch položiek naskočiť
    // NIKDY: sekcie sú vo filme oveľa vyššie než okno, takže ich najväčší možný
    // podiel je vlastná výška v pomere k výške sekcie — pri náboženstve ~0,25,
    // pri vízii ~0,13. V nave preto svietilo len HOME (to priraďuje scroll
    // handler vyššie) a O NÁS (jediná sekcia nižšia než obrazovka); NÁBOŽENSTVO
    // a VÍZIA nesvietili ani raz za celý film. Odmerané, nie odhadnuté.
    // Záporný okraj −50 % zhora aj zdola zmenší pozorovanú oblasť na jedinú
    // čiaru v strede okna — „beží ten obraz, ktorý je práve v strede". Dve
    // susedné sekcie ju nemôžu pretínať naraz, takže hlásenie je jednoznačné
    // a nič sa pritom nemeria (žiadne čítanie rozloženia v snímku scrollu).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = SCENES.findIndex((s) => 'op-' + s.id === e.target.id);
            if (i < 0) continue;
            sceneRef.current = i;
            // Zápis rovno do stavu je tu len pre stojaci scroll (zmena výšky
            // obsahu pod prstom, ktorý sa nehýbe). Kým sa scrolluje, prepisuje
            // to handler vyššie — a ten pozná aj prechod.
            // 🔴 TÁ ISTÁ BRZDA AKO V SCROLL HANDLERI, LEBO POZOROVATEĽ HO
            // PREBÍJA. Vízia je vtiahnutá o obrazovku hore, takže jej stred
            // pretne stred okna ešte na DOGME — a hoci scroll handler v tej
            // chvíli drží NÁBOŽENSTVO, hlásenie pozorovateľa príde ako
            // posledné a prepíše ho. Odskúšané: pilulka písala VÍZIA nad
            // textom ústavy.
            const preVision = window.scrollY < window.innerHeight * (PIN_VH + PIN2_VH + PIN3_VH * 0.5);
            if (window.scrollY >= window.innerHeight * PIN_VH * 0.55) setScene(preVision ? Math.min(i, 1) : i);
          }
        }
      },
      { threshold: 0, rootMargin: '-50% 0px -50% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // ── Počet psov — to isté číslo, aké kreslí stenu ─────────────────────────
  // Zámerne cez existujúci `get-grid-dogs`, nie cez nový počítací endpoint:
  // číslo pod CTA a počet kariet na stene sa nesmú rozísť.
  useEffect(() => {
    let alive = true;
    fetch(`${LIVE_EDGE_BASE}/get-grid-dogs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown[]) => { if (alive && Array.isArray(d)) setDogCount(d.length); })
      .catch(() => { /* číslo je ozdoba, nie podmienka — sekcia funguje aj bez neho */ });
    return () => { alive = false; };
  }, []);

  // Číslo dorazilo → značka na mierke sa musí prekresliť aj bez scrollu.
  useEffect(() => {
    dogCountRef.current = dogCount;
    applyRef.current();
  }, [dogCount]);

  /**
   * KLIK NA „POZRI DOGYPT INTROFILM" = SKOK NA PLÁTNO (Matej 28. 8. 2026:
   * *„ak človek klikne na «pozri DOGYPT introfilm», to video sa mu dá do tejto
   * pozície a otvorí sa na celú obrazovku"*).
   *
   * 🔑 NEOTVÁRA SA ŽIADNE PREKRYTIE. Poloha „video na celej obrazovke" už vo
   * filme existuje — je to koniec štvrtej dráhy. Klik teda nerobí nič nové, len
   * na ňu doscrolluje; prehrávanie si zapína `VisionLab` sám. Druhá,
   * „modálna" celoobrazovková poloha by znamenala dve rôzne fullscreen podoby
   * toho istého videa, ktoré sa pri prvom ladení rozídu.
   *
   * ⚠️ Cieľ je PRESNE značka snapu č. 9 (súčet všetkých štyroch dráh), takže
   * dojazd nikam nepodkĺzne. Meno konštánt je jediné miesto, kde sa číslo drží.
   */
  const goCinema = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight * (PIN_VH + PIN2_VH + PIN3_VH + PIN4_VH),
      behavior: 'smooth',
    });
  }, []);

  const goTo = useCallback((id: string) => {
    // Prvý obraz nemá vlastnú kotvu — je prilepený na celý film, takže
    // scrollIntoView by naň neskočil. Jeho miesto je začiatok stránky.
    if (id === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById('op-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // ── STENA JE SAMOSTATNÁ STRÁNKA, NIE OBRAZ FILMU ────────────────────────
  // Matej 27. 8. 2026: *„ONEPAGE je homepage planéta — kliknutím na spodný nav
  // 4 štvorce (grid) otvorí wall, to je samostatná stránka a teda scrolovanie
  // dolu nemá pokračovať v one page."*
  //
  // Dve veci naraz, a ani jedna nestačí sama:
  //  1. SKOK NA ZAČIATOK. Priehľadnosť steny riadi scroll (`o` v choreografii
  //     vyššie) — presne preto, aby sa počas odchodu gule nevynorila spod nej.
  //     Keby sa stena otvorila v polovici prechodu, prišla by rovno stlmená.
  //  2. ZÁMOK SCROLLU. Bez neho sa pod otvorenou stenou dá odscrollovať celý
  //     film — a keďže stena je `position: fixed`, vyzerá to tak, že sa nehýbe
  //     nič, kým pod ňou v tichosti odbehne polovica stránky.
  //
  // Zamyká sa INLINE zápisom: `html body { overflow: visible }` v štýloch nižšie
  // odomyká to, čo si wall zamyká sám, a inline zápis prebije aj to pravidlo.
  // (Ten istý mechanizmus používa popup s príbehom hneď pod týmto.)
  useEffect(() => {
    if (!wallOpen) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [wallOpen]);

  // 🔴 PREPNUTIE GUĽA ⇄ STENA MUSÍ PREPOČÍTAŤ CHOREOGRAFIU (Matej 27. 8. 2026:
  // *„potrebujeme upraviť aj WALL, lebo teraz sa po kliku na dolnom wall ani
  // neotvorí"*).
  // Choreografia vyššie beží LEN na scroll a resize — a prepnutie na stenu nie je
  // ani jedno. Stena pritom svoju priehľadnosť dostáva práve odtiaľ: kým je
  // otvorená guľa, zapíše sa jej natvrdo 0, aby počas odchodu gule nevyplávala
  // spod nej. Po kliku na mozaiku sa teda stena SKUTOČNE otvorila (trieda open
  // zmizla, scroll sa zamkol), ale ostala na tej zapísanej nule — navonok
  // „neotvorí sa", hoci je celá na mieste. Prvý scroll ju rozsvietil.
  // ⚠️ Beží AŽ ZA skokom na začiatok vyššie — apply() číta window.scrollY, takže
  // v opačnom poradí by prepočítalo film na starej polohe.
  useEffect(() => { applyRef.current(); }, [wallOpen]);

  return (
    <div className="op-root">
      <Seo path="/onepage" title="DOGYPT" description="One page, one story: the planet, the question, the vision, the pack." />
      <style>{`
        /* ── PLÁTNO ───────────────────────────────────────────────────────
           Papyrus je JEDEN na celý film a je fixed. Sekcie si vlastný podklad
           nesú tiež (.lab-papyrus), ale ten je pod nimi identický — tento
           drží farbu v medzerách a pri prehnutí (overscroll) na iOS. */
        /* ⚠️ ODOMKNUTIE SCROLLU — bez tohto sa film nedá posunúť VÔBEC.
           Wall si v GodsGridLab nastavuje body { overflow: hidden }, lebo mriežku
           si posúva sám a scroll stránky by mu do toho liezol. V LabShell to
           nevadí (tam scrolluje panel .lsh-scroll, nie okno), ale tu scrolluje
           OKNO — a wall je namontovaný ako prvý obraz, takže zamkne celý film.
           Navonok to vyzerá presne ako mŕtva stránka: guľa sa vykreslí, nav
           funguje, a scroll nerobí nič.
           html body je (0,0,2) proti holému body (0,0,1) ⇒ prebije bez ohľadu
           na to, ktorý <style> blok sa vloží neskôr. Popup príbehu si scroll
           zamyká inline (document.body.style.overflow), a inline zápis prebije
           aj toto — takže zámok popupu ostáva funkčný. */
        html body { overflow: visible; }

        .op-root {
          position: relative;
          background: ${LAB.pageBg};
          /* KOĽKO OBRAZOVKY ZHORA ZABERÁ HORNÁ LIŠTA. Medailón vystupuje nad ňu
             (.nav-top top 30 − MEDAL.lift 28 = 2, priemer 100 ⇒ spodok 112 px),
             zvyšok je vzduch pod ním. Kto číta výšku lišty, číta TOTO — nie
             vlastné číslo. Mobil: top 34 − 28 = 6 ⇒ spodok 106. */
          --op-nav-h: 124px;
        }
        .op-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background: ${LAB.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }

        /* ── OBRAZ 1 ⇄ OBRAZ 2 NA JEDNEJ OBRAZOVKE ────────────────────────
           Matej 26. 8. 2026: *„obrazovka sa nehýbe smerom dolu, scroll sa
           odohráva na jednej obrazovke."*
           Guľa je preto prilepená na CELÝ film (rodičom sticky je .op-stage,
           nie krátka dráha) a náboženstvo si svoj prvý výjav prilepí tiež.
           Nič sa neposúva — scroll len prehadzuje priehľadnosť a polohu zvierat.
           ⚠️ Guľa MUSÍ ostať prilepená aj po tom, čo dohasne: nesie SPODNÚ
           LIŠTU, ktorá podľa zadania zostáva na obrazovke po celý čas scrollu.
           Preto sa nehasí .op-planet (to by zhaslo aj lištu), ale iba tie dve
           vrstvy wallu, ktoré nesú obraz.
           ⚠️ transform NIE JE ozdoba: robí z hero elementu containing block,
           takže position: fixed deti wallu (.gods-root { inset: 0 }, planéta,
           spodná lišta) sa kotvia NAŇ a nie na okno. */
        /* Guľa stojí na TOM ISTOM papyruse ako zvyšok filmu.
           Wall si nesie vlastný nepriehľadný podklad (plná farba + radiálny
           gradient v ::before). Ten hasne spolu s hero, takže na jeho spodnej
           hrane — presne na 100dvh — vznikne ostrá vodorovná hrana medzi dvoma
           rôzne svetlými papyrusmi, ktorá sa cez celý prechod plazí obrazovkou.
           Rovnaký dôvod, pre ktorý sú priehľadné aj sekcie filmu nižšie. */
        .op-planet .gods-root { background-color: transparent; }
        .op-planet .gods-root::before { display: none; }

        .op-stage { position: relative; }
        /* ⚠️ TRIEDA SA VOLÁ .op-planet, NIE .op-hero. AboutLab.tsx ma vlastnu
           globálnu .op-hero { position: absolute; inset: 0 } (úvod pred crawlom)
           a je namontovaný v tom istom filme, takže by nám ju prebil. Prejavilo
           sa to tak, že prilepenie NEFUNGOVALO VÔBEC a záporný okraj filmu
           vytiahol celú stránku o obrazovku nad hranu okna. */
        .op-planet {
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow: hidden;
          transform: translateZ(0);
          /* 🔴 POD FILMOM, A JE TO PODMIENKA, NIE VOĽBA. Prilepený obal s
             transformom a fixed deťmi, ktorý leží NAD filmom (z-index 3),
             prinúti Chrome prestať kresliť všetko pod sebou: sekcie ostanú
             v DOM, na správnych súradniciach, klikateľné a s opacity 1 — a
             obrazovka je prázdny papyrus. Odskúšané: pri z-index 1 sa film
             vykreslí okamžite, bez jedinej ďalšej zmeny.
             Spodná lišta preto NEMÔŽE ostať vnútri — musí byť nad obsahom,
             takže ju wall vykresľuje portálom do <body> (prop portalDock). */
          z-index: 1;
          /* Prázdna doska cez celú obrazovku by inak zožrala kliky do filmu.
             Kým je guľa na obrazovke, nechávame ju živú (nič sa nemení oproti
             pôvodnému stavu); až keď dohasne, ostane klikateľná len lišta. */
          pointer-events: var(--op-pe, auto);
        }
        /* ── ČO HASNE A ČO OSTÁVA ─────────────────────────────────────────
           ⚠️ .gods-root NIE JE stena — je to OBAL CELÉHO WALLU a je v ňom aj
           spodná lišta, kalkulačka a planéta. Zhasnúť ho znamená zhasnúť aj
           lištu, ktorá má podľa zadania ostať po celý film (a vyzerá to ako
           mŕtva stránka: v DOM je všetko na svojom mieste a klikateľné, len to
           nikto nevidí). Hasnú preto výhradne vrstvy, ktoré nesú OBRAZ.
           Stena samotná nemá triedu — kreslí sa do [role="application"]. */
        /* ⚠️ PRIEHLADNOST A MIERKU GULE PISE JS PRIAMO DO PRVKOV, nie cez
           dedenu premennu. Dovod je v komentari pri useEffect: premenna na
           koreni prepocita styl celeho dokumentu — odmerane 10 ms na snimok.
           Tu ostava len to, co sa meni dvakrat za cely film. */
        .op-planet .gods-root > *:not(.gods-bottom-bar) {
          visibility: var(--op-vis, visible);
          /* Nielen skryt — PRESTAT KRESLIT. Gula je prilepena na cely film, takze
             bez tohto by kompozitor niesol stenu (71 kariet) aj globus (~1000
             dlazdic v 3D) po celej jeho dlzke. content-visibility: hidden je presne
             na to: obsah sa preskoci a pri navrate hore sa vrati bez prekreslenia
             od nuly (na rozdiel od display: none). */
          content-visibility: var(--op-cv, visible);
        }
        /* Planéta má vlastný 420 ms fade na prepínanie stena ⇄ guľa. Pri scrolle
           by z neho bolo oneskorenie — guľa by za prstom trielila. */
        .op-planet .planet-root { transition: opacity 120ms linear; }
        /* ── GUĽA MUSÍ BYŤ PRE PREHLIADAČ JEDEN HOTOVÝ OBRÁZOK ────────────
           Matej 26. 8. 2026: *„extrémne to seká… z planétky sa stane jeden
           obrázok? proste musí to byť plynulé."* Presne tak to aj funguje —
           len sa to nedosahuje odfotením, ale sľubom dopredu.
           will-change je ten sľub: prehliadač si guľu odloží ako samostatnú
           vrstvu, zrasteruje ju RAZ a zmenu mierky aj priehľadnosti potom robí
           grafická karta. Bez neho prekresľuje celý 3D strom pri každom novom
           scale — aby ostal ostrý — teda v každom snímku scrollu.
           ⚠️ Podmienkou je, že sa OBSAH vrstvy nemení: otáčanie preto počas
           scrollu stojí (scrollingRef v DogPlanetLab). Bez tej druhej
           polovice je toto pravidlo len spotrebovaná pamäť.
           ⚠️ Zapísané LEN pod .op-planet — mimo filmu (/wall-lab, stena)
           sa guľa netransformuje a trvalá vrstva by tam bola len réžia navyše. */
        .op-planet .planet-stage { will-change: transform, opacity; }
        .op-planet .planet-root { will-change: opacity; }
        .op-planet .planet-hero { will-change: transform, opacity; }
        /* Krava a Hektor prichádzajú posunom — nech ho tiež robí karta a nie
           prepočet rozloženia (Matej: *„krava a pes sa tiež načítavajú plynule"*). */
        .op-root.op-root .codex-bleed .codex-cow,
        .op-root.op-root :is(.codex-bleed, .codex-spotlayer) .codex-hektor { will-change: transform; }
        /* „Stráca sa DO POZADIA" — guľa aj text sa pritom vzdialia. Škáluje sa
           len obsah scény, nie .op-planet: v ňom visí aj spodná lišta, ktorá sa
           zmenšovať nesmie. */
        /* Mierku pise JS; tu treba vypnut len 620 ms prechod, ktory by pri
           scrolle sposobil, ze gula trieli za prstom. */
        .op-planet .planet-root.open .planet-stage { transition: none; }

        /* ── FILM ─────────────────────────────────────────────────────────
           Záporný okraj o presne jednu obrazovku vťahuje film NA guľu: prvý
           výjav náboženstva tak stojí od začiatku na tom istom mieste, len je
           neviditeľný. Bez neho by musel priplávať zdola — a práve to Matej
           zamietol („obrazovka sa nehýbe smerom dolu"). */
        .op-film {
          position: relative;
          z-index: 2;
          margin-top: -100dvh;
          /* Film leží NAD guľou od prvého pixela, takže by jej vzal prst:
             ťahanie planéty ani kliky na karty by sa k nej nedostali. Kým je
             guľa na obrazovke, film je pre prst priehľadný. */
          pointer-events: var(--op-film-pe, auto);
        }
        /* PAPYRUS JE VO FILME JEDEN — ten na .op-root, a je pod všetkým.
           Každá lab stránka si vlastný podklad nesie sama (.lab-papyrus plus
           jeho ::before) a ten ::before je position: fixed. Bez transformovaného
           predka sa fixed kotví na OKNO, takže podklad náboženstva sa roztiahol
           cez celú obrazovku a zakryl planétu — sekcia ležiaca o obrazovku nižšie
           prekryla tú, ktorá práve bežala. Vidieť bolo presne jeho gradient.
           Vypnutie oboch má aj druhý účel, ktorý je vlastne ten hlavný: sekcie
           sú tým PRIEHĽADNÉ, takže odchod planéty a príchod kravy sa naozaj
           prekrývajú. S nepriehľadným podkladom by planéta zmizla skokom pod
           doskou, nech by mala akúkoľvek priehľadnosť. */
        .op-film .lab-papyrus { background-color: transparent; }
        .op-film .lab-papyrus::before { display: none; }
        /* ⚠️ A TO ISTÉ PLATÍ PRE ZÁVOJ. Vízia aj Príbeh si kreslia vlastnú
           position: fixed vrstvu s LAB.pageVeil — každá 30 % bielej cez celé
           okno. Vo filme sú namontované obe naraz od začiatku, takže sa sčítali
           a bielili VŠETKO vrátane prvej obrazovky s guľou: čistá červená sa na
           nej vykreslila ako rgb(255,127,125). Presne toto Matej videl ako
           „logo aj CTA sú zahmlené a nevýrazné" — nebola to farba prvkov. */
        .op-film .lab-pageveil { display: none; }
        .op-scene { position: relative; }

        /* ── 5. PRECHOD: DVE ČIERNE VRSTVY ───────────────────────────────
           Matej 28. 8. 2026: *„celá obrazovka vrátane headru sčerná resp —
           nastane čierne pozadie ako je to na ostrom webe"* + *„tmavne aj video
           ako sa začne rozťahovať, nie len pozadie — celá obrazovka"*.

           🔑 PREČO DVE A NIE JEDNA. Jedna čierna sa postaviť nedá: musí byť
           NAD videom a lištou (tie ležia vo filme, pod ne sa nič nedostane)
           a zároveň POD príbehom, ktorý má na nej bežať. To sú dve miesta
           v poradí vrstiev, teda dva prvky s rozdielnou úlohou:
             ZÁVOJ (.op-veil)  je PRECHOD — leží nad VŠETKÝM vrátane hornej
                               lišty, stmaví obraz a keď je pod ním vymenený
                               podklad, zhasne. Sám nič nedrží.
             NOC  (.op-wall)   je PODKLAD — čierna sála presne taká, akú má
                               ostrý web (.dark-bg v index.css), pod celým
                               filmom. Nastúpi pod závojom a drží, kým beží
                               príbeh.
           Nie je to hasnutie po prvkoch: tri samostatné stmievačky (papyrus,
           video, lišta) sa pri prvom ladení rozídu a z jedného deja sú tri.
           ⚠️ Obe sú fixed, nie absolute — majú prekryť aj to, čo je fixed.
           ⚠️ visibility riadi réžia: nulové krytie ešte nie je nekreslenie
           a dve vrstvy cez celé okno stoja pri každom snímku scrollu. */
        .op-veil {
          position: fixed;
          inset: 0;
          /* Nad .nav-top (60). Prekryť hornú lištu je celé zadanie tejto
             vrstvy — bez toho by na černejúcej obrazovke ostal svietiť bar. */
          z-index: 70;
          background: #000;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .op-wall {
          position: fixed;
          inset: 0;
          /* 🔴 NAD GUĽOU (1) A POD FILMOM (2), a je to podmienka, nie voľba.
             Prvé kolo dalo noci z-index 0 s úvahou, že stačí byť nad
             papyrusovým podkladom — lenže guľa nesie VLASTNÝ nepriehľadný
             papyrus (.gods-root má background-color a to pravidlo mu vypína
             len OnePage, ktorý nad ním nevyhráva). Odmerané: pri plnom krytí
             noci bol stred obrazovky 243,228,196, teda papyrus.
             Zhodné číslo s guľou stačí, lebo noc stojí v DOM-e ZA .op-stage —
             pri zhodnom z-index rozhoduje poradie. Film musí ostať nad ňou:
             na nej beží príbeh. */
          z-index: 1;
          background-color: #050505;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        /* Tapeta je tá istá, akú nesie ostrý web — vrátane rozostrenia. Kreslí
           ju ::before a nie background na prvku, aby krytie celej vrstvy hýbalo
           farbou aj tapetou naraz.
           ⚠️ VO FILME JE STLMENÁ (Matej 28. 8. 2026: *„ešte viac stmav pozadie,
           kde su heroglyphy"*). Na ostrom webe je táto sála pozadím STRÁNKY, kde
           nesie atmosféru; vo filme je pozadím PRÍBEHU, cez ktorý beží zlatý text
           v perspektíve — a zlatá kresba pod zlatým písmom si s ním konkuruje.
           Krytie, nie tmavší obrázok: sála a jej tapeta musia ostať tá istá vec,
           inak má film vlastnú kópiu pozadia, ktorá sa pri prvej zmene rozíde. */
        .op-wall::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/images/bg-dark.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(3px);
          opacity: 0.42;
        }

        /* ── FILM SA POSÚVA PO STRÁNKACH (snap) ───────────────────────────
           Matej 27. 8. 2026: *„dlhý slajd neprejde z prvého na 4 ale snipne sa
           na druhom, druhý na 3 a podobne, aby to nezostávalo zaseknuté
           uprostred a malo to pocit prezentácie po stránkach."*

           🔴 proximity, NIE mandatory. Vo filme sú tri bloky vyššie než
           obrazovka (vodorovný pás WHAT IF vo vízii, časová os a recenzie
           v O NÁS, ústava). Pri mandatory prehliadač VŽDY odpočíva na
           najbližšom bode, takže ich stred sa stane nedosiahnuteľným — scroll
           z neho človeka stále vyhodí. proximity snapne len vtedy, keď ťah
           skončí blízko hrany, a uprostred dlhého bloku nechá čítať.

           🔴 scroll-snap-stop: always TU BOLO A JE PREČ (Matej 28. 8. 2026:
           *„nemám pocit že je to plynulé 1-2-2-3… malo by to byť smooth na jedno
           potiahnutie + prichytenie na viewport obrazovky, bez zbytočného
           zápasenia, ľahký snap nemusí byť agresívny — je to prezentácia, kto
           začne swajpovať nenarazí na odpor, skôr ho hodí ďalej než dozadu."*).
           Robilo presný opak toho, čo malo: značky v prechode stoja po jednej
           obrazovke, takže KAŽDÝ ťah kolieskom sa zastavil na tej najbližšej
           a odchod gule sa rozpadol na tri vynútené zastávky namiesto jedného
           plynulého pohybu. To je to „1-2-2-3". Bez neho ostáva proximity: ťah
           dobehne zotrvačnosťou a odpočinie na najbližšej značke — teda sa
           prichytí na obrazovku, ale nikoho po ceste nezastaví.
           ⚠️ Cena je vedomá: rýchly švih vie teraz prechod preletieť. Matej to
           v tom istom zadaní berie („kto začne swajpovať… skôr ho hodí ďalej").
           Kto scrolluje normálne, choreografiu vidí celú.

           ⚠️ Nie je to nový nápad v tomto súbore — VisionLab.tsx má ten istý
           recept (html scroll-snap-type: y proximity + .wf-pin) a je vo
           filme namontovaný, takže snap tu už bežal, len s jediným bodom.
           Opakuje sa tu ZÁMERNE: film nesmie závisieť na tom, či je vízia
           práve v strome.

           ⚠️ Iba desktop, rovnako ako vo VisionLab. Na mobile mení lišta
           prehliadača 100dvh počas scrollu — značky by sa pod prstom hýbali.

           ⚠️ .codex-flow .codex-section si snap vypína (ReligionLab ho v režime
           filmu ruší), preto sa sem zapisuje cez #op-religion — (1,2,0) prebije
           jeho (0,2,0) bez ohľadu na poradie vloženia štýlov. */
        .op-snaps { position: absolute; top: 0; left: 0; width: 1px; height: 0; pointer-events: none; }
        .op-snaps > span { position: absolute; left: 0; width: 1px; height: 1px; }
        @media (min-width: 768px) {
          html { scroll-snap-type: y proximity; }
          .op-snaps > span,
          /* ⚠️ PREAMBULA ANI KNIHA TU UŽ NIE SÚ. Preambula má vlastnú prilepenú
             dráhu, takže jej ZAČIATOK je obrazovka, na ktorej ešte nič nie je
             — snap na ňu by človeka usadil do prázdna; odpočívadlo na konci
             dráhy nesie značka v .op-snaps. Kniha ako obraz filmu zanikla
             (28. 8. 2026) a stojí v pätičke, kde sa nesnapuje. */
          /* ⚠️ #op-vision TU UŽ NIE JE — od 28. 8. 2026 má vlastnú prilepenú
             dráhu (PIN3_VH), takže jej ZAČIATOK je obrazovka, na ktorej ešte
             stojí DOGMA; snap na ňu by človeka usadil doprostred prechodu.
             Odpočívadlo na konci dráhy nesie značka v .op-snaps — presne tá
             istá úprava, akú si vyžiadala preambula. */
          /* ⚠️ #op-about TU UŽ NIE JE — teaser príbehu zanikol 28. 8. 2026
             (príbeh beží v scrolle, nie za tlačidlom). Jeho miesto v poradí
             obrazov prevzala .op-timeline, ktorá odteraz začína sekvenciou.
             Snap na jej ZAČIATKU je preto správny: usadí človeka na hero
             s postavami, teda na prvý obraz príbehu. Vnútri sekvencie už
             žiadny snap nie je a ani nesmie byť — má vlastnú dráhu 340vh
             a značka v nej by človeka zastavila doprostred vety. */
          .op-root .op-timeline,
          .op-root #op-join {
            scroll-snap-align: start;
          }
          /* Podpis a pätička snap bod NEMAJÚ — koniec stránky nie je obraz
             a zastavenie na ňom by bránilo dojazdu na pätu. */
        }

        /* ── PRVÝ VÝJAV NÁBOŽENSTVA JE PRILEPENÝ ──────────────────────────
           Sekcia je o dĺžku prechodu vyššia než obrazovka a jej obsah v nej
           stojí. Tým vznikne dráha scrollu, počas ktorej sa NIČ neposúva —
           mení sa len to, čo je vidieť. Po jej konci sa výjav odlepí a odchádza
           hore úplne normálne, ako každý iný.
           align-items: flex-start je nutnosť: sekcia je flex a s pôvodným
           center by prilepený obsah začínal až v polovici jej výšky, takže by
           sa prilepil až v polovici prechodu. */
        .op-root #op-religion .codex-section[data-idx="0"] {
          min-height: calc(100dvh + ${PIN_VH * 100}dvh);
          align-items: flex-start;
        }
        .op-root #op-religion .codex-section[data-idx="0"] .codex-slider {
          position: sticky;
          top: 0;
          height: 100dvh;
          min-height: 100dvh;
        }

        /* ── PREAMBULA SA MUSÍ ZMESTIŤ POD LIŠTU ──────────────────────────
           Matej 28. 8. 2026 (screenshot zastavenej obrazovky): *„musíme to
           všetko zmenšiť a centrovať tak, aby sa to vošlo pod NAV BAR."*

           Príčina merateľná, nie odhadnutá: výjav je stavaný na 100dvh a
           centruje sa v CELEJ obrazovke, lenže horná lišta je fixed a siaha
           s medailónom po 112 px. Obsah preambuly meria pri 1512×704 spolu
           572 px a začína 100 px od vrchu sekcie — teda 12 px POD spodkom
           medailónu, čiže nadpis IN DOG lezie do lišty. Na Matejovom okne
           (~550 px na výšku) chýba ešte vyše 170 px a výjav sa zreže.

           Riešenie má dve polovice a obe sú nutné:
             1. sekcia si hore rezervuje výšku lišty (--op-nav-h) a centruje
                sa v tom, čo ostane — takže „stred" je stred VIDITEĽNEJ plochy,
                nie stred okna;
             2. písmo a rozostupy dostávajú strop vo vh, takže na nízkom okne
                klesnú samy. Bez druhej polovice by prvá len posunula rez nižšie.

           ⚠️ Scoped na film ZÁMERNE. .codex-headline a spol. majú v
           ReligionLab.tsx 🔒 LOCK PC HARD (2026-05-24) a samostatná
           /religion-lab hornú lištu nemá — problém je náš, tak aj oprava.
           Odmerané po zásahu (obsah / voľné miesto pod lištou): 1000×547
           167→491 px · 1000×450 158→405 · 1000×676 208→576 · 1512×704
           188→624. Všade centrované a s rezervou hore aj dole. */
        .op-root #op-religion .codex-section[data-idx="1"] {
          box-sizing: border-box;
          /* ── PREAMBULA JE PRILEPENÁ, ROVNAKO AKO PRVÝ VÝJAV ─────────────
             Vtiahnutá o obrazovku hore — presne o tú, počas ktorej predtým
             prvý výjav odchádzal hore — a o tú istú obrazovku plus dráhu
             prechodu vyššia. Film tým narastie LEN o dráhu (PIN2_VH), nie
             o odchod navyše, a nasledujúce obrazy sedia ďalej na násobkoch
             obrazovky (na tom stoja značky snapu).
             align-items: flex-start je tu z rovnakého dôvodu ako pri výjave:
             s center by sa obsah prilepil až v polovici výšky sekcie. */
          margin-top: -100dvh;
          /* ⚠️ +PIN3_VH: prilepenie musí prežiť aj TRETÍ prechod, inak sa
             preambula uprostred neho odlepí a rámik sa začne triasť. */
          min-height: calc(100dvh + ${(PIN2_VH + PIN3_VH) * 100}dvh);
          align-items: flex-start;
          padding-top: 0;
          padding-bottom: 0;
        }
        /* Prilepený box nesie aj REZERVU NA LIŠTU (28. 8. 2026 ju sem priniesol
           padding-top na sekcii — ten by pri prilepení posunul až samotné
           prilepenie). top = --op-nav-h ⇒ „stred" ostáva stredom VIDITEĽNEJ
           plochy, presne ako predtým.
           .codex-flow .codex-slider ma min-height: 100dvh — to sa musí zrušiť,
           inak je box o výšku lišty vyšší než miesto, kam sa má zmestiť. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slider {
          position: sticky;
          top: var(--op-nav-h);
          height: calc(100dvh - var(--op-nav-h));
          min-height: 0;
          padding-bottom: clamp(10px, 2.4vh, 28px);
          box-sizing: border-box;
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slide {
          padding-top: 0;
          padding-bottom: 0;
          /* Na mobile má .codex-slide justify-content: flex-start (pôvodná
             stránka ním zarovnáva preambulu na tú istú výšku ako nadpis prvého
             výjavu). Vo filme to nesedí: obrazovka si hore rezervuje lištu,
             takže obsah sa má centrovať v tom, čo ostane — inak sa pri piatich
             blokoch prilepí o lištu a dole ostane 200 px prázdna. */
          justify-content: center;
        }
        /* Veľkosti sa NEPREPISUJÚ, len STROPUJÚ VÝŠKOU OKNA. Vnútri min() sedí
           presne pôvodná hodnota z ReligionLab.tsx — na vysokom okne teda platí
           doteraz odsúhlasený vzhľad a na nízkom klesne len o toľko, o koľko
           treba. Prepísať ich vlastnými číslami by znamenalo ladiť LOCKED
           typografiu nanovo, a to zadanie nepýta. */
        /* ── ZMENŠENÉ, ABY DOLU VYŠIEL PLAC NA CTA ────────────────────────
           Matej 28. 8. 2026: *„text ústavy aj nadpis by som zmenšil, aby nám
           dolu vyšiel plac na CTA."* Na obrazovke sú odteraz PÄŤ blokov
           (riadok · motto · úryvok · prísaha · CTA), predtým tri.
           Koeficienty oproti hodnotám odklepnutým ráno: **motto ×0.80,
           úryvok ×0.88, rozostupy ×0.72**. Násobia sa VŠETKY tri čísla clampu
           aj strop vo vh — na Matejovom ~550 px okne vyhráva vw, samotný
           strop by sa neprejavil. Škáluje sa od toho, čo VIDEL, nie od
           pôvodných hodnôt v ReligionLab. */
        /* ⚠️ TÚ ISTÚ RIADKU MÁ AJ NADPIS VÍZIE — je to jedna veľkosť na dvoch miestach
           (Matej 28. 8. 2026: *„ano zjednotiť — zväčši tú víziu, resp. obidve ich daj
           na 65px"*). Predtým mala vízia vlastný clamp so stropom 3rem, takže na jeho
           okne bolo 48 px proti 64,6 px a zhodne vyzerali len na nízkom okne, kde oba
           narazia na inú medzu. Strop je dnes 4.0625rem = presne 65 px. Kto mení jednu,
           mení obe — inak sa rozídu presne tak, ako sa už raz rozišli. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-headline {
          font-size: min(clamp(2.17rem, 5.2vw, 4.0625rem), 7.4vh);
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-wrap {
          max-width: 660px;
          padding: min(clamp(20px, 2.8vh, 34px), 2.6vh) clamp(20px, 3vw, 38px);
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-text {
          font-size: min(clamp(0.96rem, 1.46vw, 1.29rem), 2.75vh);
          line-height: 1.5;
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slide > * + * {
          margin-top: min(clamp(20px, 3.2vh, 34px), 2.6vh);
        }
        /* Prísaha a CTA patria k úryvku, nie do radu samostatných blokov —
           menšia medzera ich k nemu priviaže a ušetrí výšku. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slide > .codex-oath-label {
          margin-top: min(clamp(10px, 1.6vh, 16px), 1.8vh);
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-book-cta {
          margin-top: min(clamp(14px, 2.4vh, 24px), 2.4vh);
        }
        @media (max-width: 767px) {
          /* Mobil má vlastné (LOCKED) hodnoty a musí sa uviesť zvlášť: pravidlo
             vyššie nesie DESKTOPOVÝ clamp, takže bez tejto vetvy by nadpis na
             390 px spadol zo 44,8 px (2.8rem) na 25 px (6.5vw). */
          .op-root #op-religion .codex-section[data-idx="1"] .codex-headline {
            font-size: min(2.24rem, 7.4vh);
          }
          .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-text {
            font-size: min(12.5px, 2.75vh);
            line-height: 1.45;
          }
          .op-root #op-religion .codex-section[data-idx="1"] .codex-slide > * + * {
            margin-top: min(clamp(13px, 2.2vh, 20px), 2.6vh);
          }
        }

        /* ── PRECHOD 2. → 3.: TEXT ZHASNE, NADPIS SA VYNORÍ, ÚRYVOK PRÍDE ─
           Matej 28. 8. 2026: *„obsah neputuje hore ale mizne a na miesto toho
           sa vynorí nadpis; až po 70 % vynorení zdola prichádza celkom
           nenačítaný úryvok, ktorý sa scrollom viac objavuje a posúva zvieratá
           nabok (PC). Cieľom je urobiť 2–3 prechod zaujímavý a plynulý."*

           Réžia (kedy čo) je v tomto súbore hore — H2_IN, QUOTE_IN, INK_IN,
           OATH_IN. Tu je len to, čo tie čísla znamenajú na obrazovke.

           🔴 REVEAL OD POZOROVATEĽA SA MUSÍ VYPNÚŤ. ReligionLab odkrýva celý
           .codex-slide naraz, len čo sekcia vojde do obrazu — a tá je teraz
           vysoká tri obrazovky, takže vojde hneď na ZAČIATKU dráhy. Preambula
           by tak bola celá na obrazovke skôr, než sa prvý výjav stihne odmlčať.
           Je to tá istá pasca, akú má z rovnakého dôvodu vypnutú prvý výjav. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-slide {
          opacity: 1;
          transform: none;
          transition: none;
        }
        /* Nadpis sa VYNÁRA NA MIESTE, nie zdola: dráha je krátka (22 px)
           zámerne — má zaujať miesto po zhasnutom texte, nie priplávať. */
        /* ── TEXT SA SNIPNE DOĽAVA ────────────────────────────────────────
           Celý stĺpec sa presunie do ľavej polovice; pes rastie do pravej.
           Posun je vo vw, lebo cieľ je podiel obrazovky (stred ľavej polovice),
           nie pevná vzdialenosť.
           ⚠️ POSÚVA SA, NEZUŽUJE SA. Animovať max-width znamená v každom
           snímku znova lámať odsek na riadky — to je reflow textu počas scrollu
           a presne ten druh záťaže, kvôli ktorej sa v tomto súbore zapisuje
           priamo do prvkov. Stĺpec má preto pevnú šírku, ktorá sedí v ľavej
           polovici, a mení sa iba jeho poloha.
           ⚠️ Len od 768 px — viď rozdelenie pri zvieratách. */
        /* ── TRETÍ PRECHOD: OBSAH CESTUJE DOPRAVA, RÁMIK ZOSTÁVA ─────────
           Matej 28. 8. 2026: *„scrol posúva rovnomerne obsah do prava — hektor
           mizne z obrazovky — pri presune textu mizne text ale rámik zostáva
           = v momente ako sa rámik zakotví na svoje miesto nabiehajú v oblasti
           rámika texty a nadpis — rámik zmizne."*

           🔴 HASÍ SA PO PRVKOCH, NIE MASKOU NA CELOM STĹPCI. Maska sa dedí na
           všetky deti vrátane rohov .codex-frame — teda by zhasla presne to
           jediné, čo má cestu prežiť. Preto sa každý text násobí o (1 − unink)
           k svojej vlastnej nábehovej hodnote z druhého prechodu: pri príchode
           na DOGMU sa tie čísla starajú o dopisovanie, tu o odchod, a jedno
           druhému neprekáža.
           ⚠️ .codex-preamble-wrap sa NEHASÍ — je to schránka, v ktorej sedia
           rohy. Hasí sa text v nej. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-text {
          opacity: calc(1 - var(--op-unink, 0));
        }
        /* Rohy rámika odchádzajú posledné — až keď v nich stojí nový text. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-frame {
          opacity: calc(1 - var(--op-frame, 0));
        }

        /* MOBIL: rozdelenie obrazovky neexistuje (zvieratá stoja pod textom),
           takže stĺpec nemá kam „prejsť do pravej polovice" — odchádza rovno
           za pravý okraj a video prichádza zdola cez celú šírku. */
        @media (max-width: 767px) {
          .op-root #op-religion .codex-section[data-idx="1"] .codex-slide {
            transform: translateX(calc(var(--op-slide, 0) * 112vw));
          }
        }
        @media (min-width: 768px) {
          .op-root #op-religion .codex-section[data-idx="1"] .codex-slide {
            transform:
              /* Žiadny preklad späť — preambula je počas celého prechodu
                 prilepená natívne. Preklad v JS sa vykresľuje o snímok neskôr
                 než scroll a rámik sa po ňom viditeľne triasol. */
              /* −22vw = rozdelenie obrazovky (2. prechod) posadilo stĺpec do
                 ľavej polovice, teda jeho stred na 28vw. +47vw ho odvezie na
                 75vw = stred PRAVEJ polovice okna, kde stojí vízia. Číslo je
                 dopočítané, nie odmerané: 75 − 28. Preto má .vhero-inner nulový
                 gap aj padding — inak by stred pravého stĺpca na 75vw nesedel
                 a rámik by dosadol vedľa textu, ktorý má orámovať. */
              translateX(calc(var(--op-split, 0) * -22vw + var(--op-slide, 0) * 47vw));
          }
          .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-wrap {
            max-width: 540px;
          }
          /* MOTTO NA JEDEN RIADOK (Matej 28. 8. 2026: „daj ho do jedného
             riadku (PC)"). Obe polovice sú v základe display: block, teda dva
             riadky. Medzeru medzi nimi nesie ::after, nie znak v JSX: medzi
             dvoma blokovými spanmi by z textového uzla vznikol vlastný riadok
             a na samostatnej /religion-lab by nadpis narástol o jeho výšku. */
          .op-root #op-religion .codex-section[data-idx="1"] .codex-headline .grad,
          .op-root #op-religion .codex-section[data-idx="1"] .codex-headline .line {
            display: inline;
          }
          /* Medzera patrí PRVEJ polovici, nech je zlatá alebo tmavá — poradie
             určuje lokalizácia (SK dáva sloveso dopredu), takže sa nesmie viazať
             na .grad. */
          .op-root #op-religion .codex-section[data-idx="1"] .codex-headline > span:first-child::after {
            content: ' ';
          }
        }

        /* Riadok nad mottom prichádza PRVÝ — je to veta, ktorá motto uvádza,
           takže sa nesmie objaviť až za ním. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-eyebrow {
          opacity: calc(var(--op-eye, 1) * (1 - var(--op-unink, 0)));
          transform: translateY(calc((1 - var(--op-eye, 1)) * 14px));
        }
        .op-root #op-religion .codex-section[data-idx="1"] .codex-headline {
          opacity: calc(var(--op-h2, 1) * (1 - var(--op-unink, 0)));
          transform: translateY(calc((1 - var(--op-h2, 1)) * 22px));
        }
        /* Úryvok je JEDINÝ prvok výjavu s dlhou dráhou zdola — je to on, kto
           zvieratá odtláča, takže musí byť vidieť, že prichádza. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-wrap {
          opacity: var(--op-quote, 1);
          transform: translateY(calc((1 - var(--op-quote, 1)) * 96px));
        }
        /* „NENAČÍTANÝ" TEXT = MASKA, NIE PRIEHĽADNOSŤ. Rám (rohy .codex-frame)
           priletí celý, text sa v ňom dopisuje zhora nadol s mäkkou hranou —
           to je rozdiel medzi „píše sa to" a „stmievač".
           ⚠️ Maskou, nie delením na slová: odsek je JEDNA i18n hodnota
           s <strong> vnútri (18 jazykov). Rozobrať ju na spany znamená stavať
           DOM z cudzieho HTML a rozbiť ho pri prvom preklade.
           Krajné hodnoty: --op-ink 0 ⇒ čierna zastávka na −28 %, priehľadná na
           0 % (nevidno nič) · 1 ⇒ 100 % / 128 % (vidno všetko). */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-preamble-text {
          --ink: var(--op-ink, 1);
          -webkit-mask-image: linear-gradient(to bottom,
            #000 calc(var(--ink) * 128% - 28%),
            rgba(0, 0, 0, 0) calc(var(--ink) * 128%));
          mask-image: linear-gradient(to bottom,
            #000 calc(var(--ink) * 128% - 28%),
            rgba(0, 0, 0, 0) calc(var(--ink) * 128%));
        }
        /* Prísaha svorky je PODPIS — patrí pod hotový odsek, nie k nemu. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-oath-label {
          opacity: calc(var(--op-oath, 1) * (1 - var(--op-unink, 0)));
          transform: translateY(calc((1 - var(--op-oath, 1)) * 10px));
        }
        /* CTA dosadá ako posledné — je to jediná akcia obrazovky a nemá
           súperiť s textom, ktorý ju odôvodňuje. */
        .op-root #op-religion .codex-section[data-idx="1"] .codex-book-cta {
          opacity: calc(var(--op-cta, 1) * (1 - var(--op-unink, 0)));
          transform: translateY(calc((1 - var(--op-cta, 1)) * 12px));
        }

        /* ── ÚSTAVA V PÄTIČKE A V PREKRYTÍ ────────────────────────────────
           Kniha už NIE JE obraz filmu (Matej 28. 8. 2026: *„celá 4. sekcia by
           zanikla… kniha bude v pätičke úplne nakonci"*), takže tu zaniklo aj
           celé jej ladenie na obrazovku — mierka --op-bookk, nadpis pod
           knihou aj chip v toku. V pätičke stojí kniha vo vlastnej veľkosti,
           lebo sa už nemá do čoho zmestiť; nadpis pod ňou drží prop belowBook
           (ten istý, kvôli ktorému vznikol).

           ⚠️ Pätičková kniha stojí v TOKU, nie v prilepenej obrazovke — nesmie
           preto dediť height: 100dvh z .codex-slide. Preto tu má vlastný
           obal .op-book a nie .codex-section.
           ⚠️ overflow-anchor: none je prevzaté z .codex-scroll: keď sa na
           tretej dvojstrane zjavia CTA tlačidlá, výška obsahu narastie a bez
           neho by scroll skokom uletel. */
        .op-book {
          padding: clamp(60px, 8vh, 110px) 18px clamp(20px, 3vh, 40px);
          display: flex;
          justify-content: center;
          overflow-anchor: none;
        }
        /* Nadpis knihy je v základe ABSOLÚTNY (drží sa vrchu obrazovky na
           samostatnej /religion-lab). V pätičke žiadna obrazovka nie je, takže
           sa musí vrátiť do toku — inak by sa prilepil na vrch celého bloku
           a kniha by mu sadla na hlavu. */
        /* 🔴 NADPIS AJ CHIP MUSIA ÍSŤ DO TOKU — INAK SI SADNÚ NA SEBA.
           Nadpis knihy je v základe absolútny (na samostatnej /religion-lab sa
           drží vrchu obrazovky) a chip „klikni a otvor" tiež — má dopočítanú
           polohu od stredu knihy. Obom je teda jedno, že ten druhý existuje,
           a v pätičke sa prekryli: nadpis prešiel presne cez chip.
           V toku ich zoradí poradie v DOM-e: kniha → nadpis → chip.
           ⚠️ Keď sa kniha OTVORÍ, chip zmizne (nahradia ho šípky, tie ostávajú
           absolútne) a nadpis vyskočí o jeho výšku hore. Jednorazový posun
           v momente, keď sa aj tak mení celý blok — tá istá vedomá cena ako
           predtým na obraze filmu. */
        .op-book .codex-book-title--below {
          position: static;
          transform: none;
          display: block;
          margin-top: clamp(14px, 2.2vh, 24px);
          white-space: normal;
        }
        .op-book .cb-hint {
          position: static;
          transform: none;
          margin-top: clamp(8px, 1.4vh, 14px);
        }
        .op-book .cb-wrap { height: auto; gap: 0; }
        /* Prekrytie s ústavou používa plátno príbehu (.op-storymodal) — jeden
           tvar pre obe odbočky z filmu. Kniha v ňom len dostane vzduch a stred. */
        .op-bookmodal {
          display: flex;
          justify-content: center;
          padding: clamp(48px, 9vh, 96px) 16px clamp(40px, 8vh, 80px);
        }


        /* ── FILM MÁ JEDNO POZADIE, NIE ŠTYRI PAPIERE ────────────────────
           Matej 28. 8. 2026: *„a pozor nemeníme farbu pokračujeme od začiatku
           na jednotnom pozadí!"* (k vodorovnej čiare, ktorá sa objavila počas
           rastu videa na plátno).

           🔴 PRÍČINA NIE JE V PRECHODE, ALE V TOM, ŽE VINETA JE STRÁNKOVÁ.
           Každá lab stránka si nesie vlastnú vinetu — inline div s inset: 0
           a radiálnym gradientom (LAB.pageVeil). Komentár pri nej v
           ReligionLab hovorí *„drží sa 1 obrazovky (page = 100dvh)"*, a to je
           pravda len MIMO filmu: v režime flow má stránka h-auto, takže sa
           tá istá vrstva roztiahne na celú svoju výšku (odmerané: 7 200 px,
           teda osem obrazoviek). Radiálny gradient sa tým rozťahuje s ňou.

           Dôsledok bol dvojaký a merateľný (vzorky papyrusu pri ľavom okraji):
             • pozadie sa cez film PLYNULE STMIEVALO — 236,218,181 na 3.
               obrazovke → 229,209,171 na siedmej;
             • kde vrstva skončila, bol SKOK O CELÝCH ~14 HODNÔT na holý
               papyrus (242,227,194) — ostrá vodorovná čiara cez celú šírku.
           Kým film končil na siedmej obrazovke, tá čiara ležala tesne pod
           okrajom okna. Dráha plátna (PIN4_VH) ju vytiahla do obrazu.

           Oprava je preto štrukturálna: **vo filme sa stránkové vinety
           nekreslia vôbec.** Ostáva jedna papyrusová plocha — tá je fixed
           a viewportová, takže vyzerá na deviatej obrazovke presne tak ako na
           prvej (odmerané 236,218,183 proti 236,218,181). Presne to znamená
           *„pokračujeme od začiatku na jednotnom pozadí"*.

           🔴 TÝMTO PADOL STARŠÍ ZÁPIS O PREKRYVE DVOCH VINIET (posunúť vinetu
           vízie nadol o toľko, o koľko je jej stránka vtiahnutá). Nebol zlý,
           len liečil hranicu medzi dvoma vrstvami — a problém je, že tam tie
           vrstvy vo filme vôbec nemajú byť. Ostáva z neho platné poučenie:
           gradientu sa nesmie siahať na rozmer, lebo rozmer JE kresba.
           ⚠️ Vrstvy sú inline style, preto !important.
           ⚠️ .lab-pageveil (vízia, o nás) je tu už dávno vypnutá o pár
           riadkov vyššie — toto je jej dvojička, ktorú ReligionLab kreslí
           bez triedy. Rovnaká vec, dve mená. */
        .op-film .lab-papyrus > div[aria-hidden="true"]:not([class]) {
          display: none !important;
        }

        /* ── PRÍBEH BEŽÍ NA ČIERNEJ, NIE NA PAPYRUSE ─────────────────────
           Matej 28. 8. 2026: *„budú nasledovať modré písmenká a starwars príbeh
           na čiernom pozadí = celkom rozbije príbeh na webe a urobí taký aha
           moment, pripomenie starwars."*

           🔑 SEKVENCIA SA NEKOPÍRUJE A NEPREPISUJE. Celá stojí v AboutLab.tsx
           a film ju volá cez part="all" — dve kópie tej istej choreografie sa
           pri prvom ladení rozídu. Tu sa mení JEDINÉ: farby. Sekvencia bola
           kedysi prepísaná z tmavej sály na papyrus (komentáre v AboutLab.tsx
           to hovoria pri každom pravidle), a vo filme pod ňou opäť leží čierna
           — takže tmavý inkoust by na nej zanikol.
           ⚠️ Hodnoty sa NEVYMÝŠĽAJÚ: sú to presne tie, ktoré na čiernej beží
           ostrá stránka About.tsx. Kto ich tu bude meniť, mení ich TAM — a
           potom sem prenesie, nie naopak. Inak má film a ostrý web dve rôzne
           predstavy o tom, ako vyzerá crawl.
           ⚠️ Prečo scope a nie prop v AboutLabe: papyrusová podoba je jeho
           kánon pre LabShell aj samostatnú routu. Film je výnimka a výnimka
           patrí do filmu. */

        /* MODRÁ PREDVETA — na papyruse tmavý atrament so svetlým halo, na
           čiernej svetlá modrá so žiarou. Je to poklona Star Wars, takže modrá
           ostáva modrou v oboch podobách; mení sa len to, kam svieti. */
        .op-film .sw-intro {
          color: #AFC4FF;
          text-shadow: 0 0 7px #2E5FD0, 0 0 18px rgba(16,52,166,0.9), 0 0 38px rgba(16,52,166,0.6);
        }
        /* PRÍBEH — na papyruse tmavé zlato, na čiernej to isté zlato, akým
           svieti na ostrom webe. Vynáranie do stratena drží maska na .sw-stage
           a tá sa NEMENÍ: je to alfa maska, takže text sa nestráca do farby,
           ale do priehľadna — a pod ním je teraz čierna. */
        .op-film .sw-crawl-text {
          color: #F5C73D;
          text-shadow: 0 0 26px rgba(245,199,61,0.22);
        }
        .op-film .sw-logo {
          filter: drop-shadow(0 0 50px rgba(201,154,63,0.45));
        }
        /* ⚠️ NADPIS THE ORIGIN, JEHO PODTITULOK A POSTAVY TU UŽ NIE SÚ.
           Vo filme sa úvod sekvencie nekreslí vôbec (Matej 28. 8. 2026: *„začni
           scénu inak - nás tam vôbec nedávaj = scéna začne modrým nápisom"*),
           takže by to boli pravidlá pre prvky, ktoré v ňom neexistujú. Rieši to
           prop AboutLabu (part='film'), nie skrytie cez CSS — skrytý úvod by si
           držal svoju desatinu dráhy a bola by z nej prázdna obrazovka navyše. */

        /* ── ČO ZO SEKVENCIE DO FILMU NEPATRÍ ────────────────────────────
           Vlastná hlavička sekvencie: je papyrusová, fixed a na z-index 200,
           teda nad všetkým — a film má svoju hornú lištu.
           ⚠️ Skrýva sa TU, nie v komponente — na svojej stránke ostáva.
           ⚠️ Tri šípky a PRESKOČIŤ tu už nie sú: stáli v úvode sekvencie, ktorý
           sa vo filme nekreslí (part='film'). */
        .op-film .about-sticky-nav { display: none !important; }

        /* ── 4. OBRAZ: VIDEO VĽAVO, VÍZIA VPRAVO ─────────────────────────
           Matej 28. 8. 2026: *„na lavo bude teraz video"* + *„nadpis vízia
           a potom pod seba 3 bloky… celý blok musí byť veľmi ľahký."*

           Vízia sa vťahuje O OBRAZOVKU HORE — presne o tú, počas ktorej
           predtým odchádzala DOGMA — a jej hero o dráhu prechodu narastie.
           Film tým narastie LEN o dráhu (PIN3_VH), takže ďalšie obrazy sedia
           ďalej na násobkoch obrazovky a značky snapu platia. Je to tá istá
           konštrukcia ako pri preambule, tretíkrát.
           ⚠️ Vťahuje sa CELÁ sekcia, teda aj pás WHAT IF za hero — ten je jej
           súčasťou a musí sa posunúť s ňou, inak by medzi videom a pásom
           zostala prázdna obrazovka. */
        /* ⚠️ VŤAHUJE SA O OBRAZOVKU **A CELÚ DRÁHU** (nie len o obrazovku):
           stránka náboženstva je odteraz o dráhu vyššia, aby na nej preambula
           vydržala prilepená. Vízia ju musí dobehnúť, inak by prechod začal
           o dve obrazovky neskôr než DOGMA dostojí. */
        .op-root #op-vision { margin-top: calc(-${(1 + PIN3_VH) * 100}dvh); }
        .op-root #op-vision .vision-video-hero {
          display: block;
          /* ⚠️ TRI DRÁHY, NIE JEDNA. PIN3_VH je príchod vízie (pás sa posunie
             doprava), PIN4_VH je jej druhý záber (video sa centruje a rastie
             na plátno) a PIN5_VH je tretí — plátno dorastie na celé okno
             a všetko sčernie. Všetky tri sa odohrávajú na TEJ ISTEJ prilepenej
             obrazovke, takže sa pripočítavajú k výške JEDNEJ sekcie. Keby mal
             ktorýkoľvek z nich vlastnú sekciu, bol by medzi nimi strih — a
             práve plynulosť je pri poslednom z nich celý efekt. */
          min-height: calc(100dvh + ${(PIN3_VH + PIN4_VH + PIN5_VH) * 100}dvh);
          /* ⚠️ ŽIADNY VODOROVNÝ PADDING — z rovnakého dôvodu ako nulový gap
             nižšie. Padding zúži mriežku a stred pravého stĺpca sa posunie
             dovnútra; odmerané pri 1440 px: rámik dosadol na 1080, text na
             1052, teda 28 px vedľa. Vzduch pri okrajoch drží šírka obsahu
             (stĺpec textu má 540, video vlastný padding), nie okraj mriežky. */
          padding: 0;
        }
        /* Prilepený box nesie rezervu na hornú lištu — to isté ako preambula.
           --op-nav-h je JEDINÉ miesto, kde je výška lišty zapísaná. */
        .op-root #op-vision .vhero-inner {
          /* Prilepený box je na celé okno a leží NAD DOGMOU — prázdna plocha
             po jeho stranách by jej brala kliky. Prst púšťa len na obsah;
             blokom ho podľa dráhy zapína a vypína réžia vyššie. */
          pointer-events: none;
          position: sticky;
          /* ⚠️ CENTRUJE SA V CELOM OKNE, nie v ploche pod lištou (Matej
             28. 8. 2026: *„toto musí byť vycentrované na stred tie obsahy"*).
             Rezerva na lištu posúvala oba stĺpce o polovicu jej výšky nadol,
             takže celok sedel opticky nízko — a pritom je horná lišta
             priehľadná, takže optický stred je stred OKNA. Obsah sa pod ňu
             nedostane: video je stropované výškou okna a bloky sú nižšie. */
          top: 0;
          height: 100dvh;
          /* ⚠️ CENTRUJE SA V PÁSE POD LIŠTOU, nie v celom okne (Matej 28. 8.
             2026, 3. kolo: *„presne v strede obrazovky — spodný okraj / dolný
             okraj horného navbaru"*). Tým padol zápis o riadok vyššie: keď
             lišta stojí na papyruse ako zlatý bar, nie je priehľadná a stred
             okna leží pod ňou. --op-nav-h je JEDINÉ miesto s jej výškou. */
          padding-top: var(--op-nav-h);
          box-sizing: border-box;
          display: grid;
          /* ⚠️ NULOVÝ GAP A ŽIADNY PADDING — a je to podmienka, nie estetika.
             Dva rovnaké stĺpce bez medzery majú stredy presne na 25vw a 75vw,
             a práve na 75vw dosadá rámik z DOGMY. Akýkoľvek gap alebo padding
             ten stred posunie a rámik zakotví vedľa textu, ktorý má orámovať.
             Vzduch medzi polovicami preto drží šírka obsahu, nie medzera mriežky. */
          grid-template-columns: 1fr 1fr;
          gap: 0;
          /* ⚠️ DVOJICA, NIE align-items: center (Matej 28. 8. 2026: *„horný
             okraj videa a nadpis VÍZIA sú na jednej priamke"*). Pri centrovaní
             sa každý stĺpec centruje SÁM, takže rozdiel ich výšok sa rozdelí
             na polovicu a vyššie video vždy začne vyššie než nadpis — 22 px
             pri 1470 px, a mení sa s každou šírkou okna.
             align-items: start zrovná horné hrany oboch stĺpcov,
             align-content: center vycentruje ten JEDEN riadok ako celok
             v páse pod lištou. Preto sa dá mať oboje naraz — zarovnané hlavy
             aj stred obrazovky — bez toho, aby sa čokoľvek počítalo v JS. */
          align-items: start;
          align-content: center;
          /* Video vychádza spod spodnej hrany — orezanie z toho robí príchod
             a nie prelet cez papyrus pod obrazovkou. */
          overflow: hidden;
        }
        /* ĽAVÁ POLOVICA — video. Prilieta zľava zvonku okna.
           ⚠️ Posun je vo vw a väčší, než sa zdá potrebné: stĺpec stojí v ľavej
           polovici, takže na to, aby zmizol za ľavou hranou, musí prejsť
           vlastnú polovicu CELÚ. */
        /* ĽAVÁ POLOVICA — video. Prichádza ZDOLA (Matej 28. 8. 2026:
           *„video príde z dola a ako dobehnu texty video sa ukotví"*), nie
           zboku: vodorovne v tej chvíli cestuje rámik a druhý vodorovný pohyb
           by mu konkuroval. Zdola je to pohyb, ktorý sa s ním nebije. */
        .op-root #op-vision .vhero-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(12px, 2.2vh, 24px);
          min-width: 0;
          /* Vzduch pri ľavom okraji okna — hero ho stratil spolu s vlastným
             paddingom (ten musel odísť kvôli stredu pravej polovice). */
          padding: 0 clamp(18px, 4vw, 68px);
          pointer-events: auto;
          /* 78vh, nie menej: rámček videa stojí v strede prilepeného boxu,
             takže na to, aby bol CELÝ pod jeho spodnou hranou, musí zísť
             o polovicu boxu plus vlastnú polovicu. Pri 62vh vykúkal na
             odklepnutej obrazovke DOGMY spodný okraj (odmerané 46 px). */
          transform: translateY(calc((1 - var(--op-vid, 0)) * 78vh));
        }
        /* PRAVÁ POLOVICA — nadpis a tri bloky sa DOPISUJÚ NA MIESTE.
           Neprilietajú: na tú polovicu práve dorazil odpísaný stĺpec DOGMY,
           takže je to ten istý stĺpec s novým obsahom — presne to, čo znamená
           *„text sa pri scrollingu zmení"*. Keby aj tento blok priletel, boli
           by to dve karty, ktoré si vymenili miesto.
           Poradie nesie --vb-at (nadpis 0, bloky 1–3): jedna premenná z JS,
           štyri prahy v CSS. */
        /* PRAVÁ POLOVICA — presne v stope rámika: rovnaká šírka (max-width
           .codex-preamble-wrap = 540) a rovnaký stred (75vw). Preto sa nové
           texty naozaj objavia V OBLASTI RÁMIKA a nie vedľa neho. */
        .op-root #op-vision .vhero-blocks {
          width: min(540px, 44vw);
          margin: 0 auto;
          /* .vision-video-hero centruje text kvôli videu; blok s ikonkou vľavo
             a centrovaným textom sa číta ako rozsypaný. */
          text-align: left;
        }
        .op-root #op-vision .vhero-h2 { text-align: center; }
        /* Zhodná veľkosť s nadpisom preambuly — zdôvodnenie pri ňom vyššie.
           ⚠️ 7.4vh tu nie je ozdoba: pod týmto nadpisom stoja TRI bloky, takže na
           nízkom okne musí ustúpiť rovnako, ako ustupuje preambula. */
        .op-root #op-vision .vhero-h2 {
          font-size: min(clamp(2.17rem, 5.2vw, 4.0625rem), 7.4vh);
        }
        .op-root #op-vision .vhero-h2 { --vb-at: 0; }
        .op-root #op-vision .vhero-h2,
        .op-root #op-vision .vhero-item {
          --vb-p: clamp(0, var(--op-vb, 0) * 2.2 - var(--vb-at, 0) * 0.4, 1);
          opacity: var(--vb-p);
          transform: translateY(calc((1 - var(--vb-p)) * 18px));
        }

        /* ── 5. OBRAZ: PLÁTNO — VIDEO NA CELEJ OBRAZOVKE ──────────────────
           Matej 28. 8. 2026: *„ďalší scrolling dolu by mal video centrovať
           a zväčšovať na celú obrazovku — 3 bloky zmiznú, na celej obrazovke
           bude len video."*

           Obrazovka sa NEHÝBE (vízia je stále prilepená) — mení sa len to, čo
           je na nej vidieť, presne ako pri prvých dvoch prechodoch. Dve
           premenné, dva beaty:
             --op-vout  0 → 1  nadpis, tri bloky a popisok pod videom hasnú
             --op-grow  0 → 1  rám sa presunie do stredu okna a dorastie
           Poradie je zámerné: obrazovka sa najprv vyprázdni, potom ju zaberie
           plátno. Viď VOUT_OUT a GROW_IN hore. */

        /* PRAVÝ STĹPEC ODCHÁDZA. Krytie stačí — stĺpec je 1fr v mriežke, takže
           jeho zmiznutie nič neposúva, a video cezeň prechádza navrchu (z-index
           na stage nižšie). Prst mu odoberá réžia v JS. */
        .op-root #op-vision .vhero-blocks {
          opacity: calc(1 - var(--op-vout, 0));
        }
        /* Ľavá polovica ide NAVRCH: v DOM-e stojí PRED blokmi, takže by ju inak
           prekryl práve ten stĺpec, cez ktorý video rastie. */
        .op-root #op-vision .vhero-stage {
          position: relative;
          z-index: 2;
          /* Video zhasne SPOLU s podkladom a lištou — je to jeden dej
             (*„celá obrazovka vrátane headru sčerná"*). Deje sa to pod závojom,
             takže samotné hasnutie nikto nevidí; keby ho nebolo, po odchode
             závoja by na čiernej ostal svietiť pás videa. */
          opacity: calc(1 - var(--op-night, 0));
          /* Medzera pod rámom odchádza s popiskom — inak by po ňom ostala
             diera a video by sa v páse centrovalo o jej polovicu vyššie. */
          gap: calc(clamp(12px, 2.2vh, 24px) * (1 - var(--op-vout, 0)));
        }
        /* POPISOK „pozri DOGYPT introfilm" — zhasne a ZLOŽÍ SA.
           ⚠️ Krytie samo nestačí: neviditeľný popisok si drží výšku a rám by sa
           v páse pod lištou centroval mimo stredu. Zloženie preto ide cez
           max-height, a to ZÁMERNE AŽ V POSLEDNEJ TRETINE dráhy hasnutia
           (--vo-late): 64px je viac než jeho skutočná výška, takže kým je text
           vidieť, orezanie ho ani nezačne — a keď sa začne, už tam nič nie je. */
        .op-root #op-vision .vhero-inner {
          --vo-late: clamp(0, (1 - var(--op-vout, 0)) * 3, 1);
        }
        .op-root #op-vision .video-hero-caption {
          opacity: calc(1 - var(--op-vout, 0) * 2.4);
          max-height: calc(64px * var(--vo-late));
          overflow: hidden;
        }
        /* RÁM VIDEA — jediné miesto, kde je jeho šírka zapísaná.
           ⚠️ ROVNICA, NIE MERANIE (a nie počítanie v JS): obe krajné šírky sú
           tie isté výrazy, aké tu boli doteraz, a scroll medzi nimi len lineárne
           prechádza. Keby cieľovú mierku počítal JS z window.innerWidth, mal by
           vzorec dve kópie a pri prvej zmene rámu by sa rozišli.
             --vf-rest  pokojná šírka (to, čo mal rám doteraz)
             --vf-full  plátno = celá šírka okna, stropovaná výškou pásu POD
                        hornou lištou (16:9 sa musí zmestiť celé)
           ⚠️ max(--vf-rest, …) je poistka na nízke okno: keby pás pod lištou
           vyšiel užší než pokojná šírka, video by sa „zväčšením" zmenšilo. */
        .op-root #op-vision .video-embed-frame {
          --vf-rest: min(680px, 100%, max(320px, calc((100dvh - 330px) * 16 / 9)));
          --vf-full: max(var(--vf-rest), min(100vw, calc((100dvh - var(--op-nav-h)) * 16 / 9)));
          /* TRETÍ BOD — CELÉ OKNO (5. prechod). Plátno bolo stropované výškou
             pásu POD lištou; tu už lišta černie, takže strop padá a obraz
             zaberie okno celé. Je to CELÉ POKRYTIE, nie zmestenie sa: kratšia
             strana dosadne na hranu a dlhšia presahuje.
             ⚠️ Presah sa nekreslí von zo stránky — prilepený box .vhero-inner
             má overflow: hidden, takže je to orezanie na hranu okna.
             ⚠️ ZAOBLENIE TÝM NEPADÁ (Matejov lock z toho istého dňa:
             *„treba aby to video malo stále zaoblené rohy"*). Nemení sa ani
             o pixel — rohy len odídu za hranu okna. Ak v tejto rovnici raz
             nájdeš interpoláciu border-radius, je to chyba. */
          --vf-cover: max(var(--vf-full), 100vw, calc(100dvh * 16 / 9));
          width: calc(var(--vf-rest)
                    + (var(--vf-full)  - var(--vf-rest)) * var(--op-grow, 0)
                    + (var(--vf-cover) - var(--vf-full)) * var(--op-grow2, 0));
          /* Zo stredu ľavej polovice (25vw) do stredu okna (50vw). Číslo platí
             len preto, že mriežka je 1fr 1fr bez medzery a bez paddingu —
             to je ten istý lock, kvôli ktorému na 75vw dosadá rámik z DOGMY.
             ⚠️ A ZVISLÉ DOROVNANIE V PIATOM PRECHODE: obsah sa centruje v páse
             POD lištou (padding-top na .vhero-inner), takže v pokoji sedí
             o polovicu jej výšky nižšie než stred okna. Keď lišta zhasne, musí
             obraz tú polovicu dobehnúť, inak stojí celé okno mimo stredu.
             --op-nav-h je aj tu JEDINÉ miesto, kde je výška lišty zapísaná. */
          transform: translateX(calc(var(--op-grow, 0) * 25vw))
                     translateY(calc(var(--op-nav-h) / -2 * var(--op-grow2, 0)));
          /* 🔴 ZAOBLENIE OSTÁVA AJ NA PLÁTNE (Matej 28. 8. 2026: *„treba aby to
             video malo stále zaoblené rohy"*). Prvé kolo ho na plátne vynulovalo
             s úvahou „plátno rám nemá, je to premietanie" — lenže rám je vo filme
             jediné, čo drží video na papyruse ako predmet a nie ako dieru
             v stránke. Zaoblenie preto NIE JE v tejto rovnici a berie sa
             z pôvodného pravidla rámu (14px). */
          /* ⚠️ Prechod šírky MUSÍ ísť preč: rám ho má kvôli kliku na prehranie
             (0.45 s), ale tu šírku ženie scroll — animácia na animácii by za
             prstom zaostávala o pol sekundy. */
          transition: none;
        }
        @media (max-width: 767px) {
          /* MOBIL NIE JE ZMENŠENÉ PC: dve polovice sa na 390 px nedajú, takže
             video ostáva hore cez celú šírku a bloky idú pod neho. Prilet je
             preto cez CELÚ šírku, nie cez polovicu. */
          .op-root #op-vision .vhero-inner {
            grid-template-columns: minmax(0, 1fr);
            align-content: center;
            height: auto;
            min-height: 100dvh;
            padding-top: var(--op-nav-h);
            box-sizing: border-box;
            gap: clamp(14px, 2.4vh, 22px);
          }
          .op-root #op-vision .vhero-stage {
            transform: translateY(calc((1 - var(--op-vid, 0)) * 86vh));
            padding: 0;
          }
          .op-root #op-vision .vhero-blocks { width: 100%; gap: 10px; }
          /* Na mobile stoja video aj tri bloky POD SEBOU v jednej prilepenej
             obrazovke. Bez zmenšenia sa nezmestia (odmerané 950 px obsahu do
             586 px miesta) a video vylezie pod hornú lištu. */
          /* ⚠️ MENÍ SA LEN POKOJNÁ ŠÍRKA, NIE ROVNICA. Rám si width berie
             z pravidla vyššie; tu sa prepíše jediný jeho vstup, takže rast na
             plátno platí aj na mobile bez druhej kópie vzorca.
             Cieľová šírka je na výšku držanom telefóne vždy celé okno (16:9 sa
             do 726 px pásu zmestí dávno pred tým, než narazí na 100vw), takže
             „celá obrazovka" tu znamená celú ŠÍRKU — video výšku nezaplní a ani
             nemá, orezať 16:9 do portrétu by bolo orezanie filmu. */
          .op-root #op-vision .video-embed-frame {
            --vf-rest: min(100%, calc(31vh * 16 / 9));
            /* ⚠️ A CELÉ OKNO JE TU CELÁ ŠÍRKA, nie pokrytie. Zdedený strop
               z PC (100dvh * 16/9) je na výšku držanom telefóne skoro štvornásobok
               šírky okna — video by narástlo mimo obraz a z filmu by ostal
               orezaný stred. Je to tá istá úvaha, pre ktorú sa 16:9 neoreže do
               portrétu ani na plátne: film sa nereže, len sa doň nevojde výška. */
            --vf-cover: 100vw;
            /* Jeden stĺpec ⇒ rám nemá kam cestovať do strany. Zvislé dorovnanie
               ale platí aj tu — pás pod lištou je pod ňou na každej šírke. */
            transform: translateY(calc(var(--op-nav-h) / -2 * var(--op-grow2, 0)));
          }
          /* Bloky sú tu POD videom, nie vedľa neho, takže po nich ostane diera —
             na PC ju mriežka drží 1fr stĺpcom, tu ju musí zložiť. Ten istý
             recept ako popisok: orezanie až v poslednej tretine hasnutia, keď
             už nie je čo orezať. 480px je viac než ich skutočná výška. */
          .op-root #op-vision .vhero-blocks {
            max-height: calc(480px * var(--vo-late));
            overflow: hidden;
          }
          .op-root #op-vision .vhero-item { padding: 10px 12px; gap: 10px; }
          .op-root #op-vision .vhero-h2 { font-size: clamp(1.45rem, 6.6vw, 1.95rem); }
          /* Medzera medzi videom a blokmi odchádza s nimi. */
          .op-root #op-vision .vhero-inner { gap: calc(10px * (1 - var(--op-vout, 0))); }
          .op-root #op-vision .vision-video-hero { padding: 0 16px; }
        }

        /* ── KRAVA A HEKTOR: PRÍCHOD AJ ODCHOD JEDNOU ROVNICOU ────────────
           Matej: *„pri miznutí z bokov vyliezajú krava a pes"* — a k odchodu
           (26. 8. 2026): *„v momente ako nastupuje text in dog we trust majú
           ísť plynule od seba, ale seknú sa na stranu bez plynulého oddialenia."*

           Sú to DVA pohyby tej istej dvojice a pôvodne ich riadili dva rôzne
           mechanizmy, čo je práve ten sek:
             --op-in   1 = za hranou obrazovky, 0 = LOCKED poloha z ReligionLab
             --op-split 0 = celá obrazovka, 1 = rozdelená (text vľavo, pes vpravo)
           Obe počíta scroll, sčítavajú sa v jednom calc a idú plynulo.

           🔴 ZDVOJENÉ .op-root.op-root NIE JE PREKLEP — je to celá oprava.
           Pôvodné .op-root (0,3,0) malo v komentári napísané, že prebíja aj
           .codex-bleed:not(.active) .codex-cow. NEPREBÍJALO: tá má tiež (0,3,0)
           a ReligionLab sa vkladá NESKÔR, takže vyhrávala ona. Kým mal bleed
           triedu .active, nebolo to vidieť (:not nematchoval); v momente, keď
           ju na preambule stratil, prevzala riadenie ona — a keďže transition
           je tu vypnutá, zvieratá **skočili** na -25 % namiesto plynulého
           odchodu. Odmerané v CSSOM, nie odhadnuté.
           Dvojtriedny zápis (0,4,0) vyhrá bez ohľadu na poradie vloženia.

           ⚠️ transition MUSÍ ostať vypnutá — pôvodných 650 ms je pri scrolle
           oneskorenie a zvieratá by za prstom kĺzali. Plynulosť tu nerobí
           prechod, ale to, že hodnotu mení scroll v každom snímku. */
        .op-root.op-root .codex-bleed .codex-cow,
        .op-root.op-root :is(.codex-bleed, .codex-spotlayer) .codex-hektor { transition: none; }
        /* ── ROZDELENIE: PES RASTIE DO PRIESTORU, KRAVA IDE Z OBRAZU ──────
           Matej 28. 8. 2026: *„po zjavení nadpisu sa pes nakloní a zväčší do
           priestoru a text sa snipne na ľavú stranu a kravu vytlačí mimo obraz
           = stránka bude rozdelená na text a psa."*

           Pes má transform-origin: bottom right (základ v ReligionLab), takže
           zväčšenie ho roztiahne DOĽAVA A NAHOR — presne do miesta, ktoré text
           práve uvoľnil. Nič sa nemusí dopočítavať, stačí mierka.
           Naklonenie je malé (4°) zámerne: je to fotka hlavy, nie ilustrácia —
           pri väčšom uhle sa z „nakloní sa" stane „padá".

           🔴 ZANIKOL ODSUN DO STRÁN. --op-side (25 % vlastnej šírky) aj jeho
           pixelová zložka --op-sidex boli obchádzka problému „tmavý pes zožerie
           konce riadkov". Rozdelenie ho ruší v koreni, takže tlačiť psa preč
           už nie je prečo — naopak, má prísť bližšie.

           ⚠️ LEN OD 768 px. Rozdelenie na dva stĺpce potrebuje šírku; na mobile
           by z textu ostal prúžok. Mobilná vetva nižšie preto ostáva bez neho —
           tam zvieratá stoja POD textom, nie vedľa neho, a nič si neprekáža. */
        .op-root.op-root .codex-bleed .codex-cow {
          transform: translateX(calc(var(--op-in, 0) * -120%)) scale(1.14);
        }
        .op-root.op-root :is(.codex-bleed, .codex-spotlayer) .codex-hektor {
          transform: translateX(calc(var(--op-in, 0) * 120% + var(--op-hek, 0) * 140%)) scale(1.08);
        }
        @media (min-width: 768px) {
          /* Krava odchádza z obrazu — 140 % vlastnej šírky je za hranou aj pri
             mierke 1.14 a origin bottom left. */
          .op-root.op-root .codex-bleed .codex-cow {
            transform: translateX(calc(
              var(--op-in, 0) * -120% - var(--op-split, 0) * 140%
            )) scale(1.14);
          }
          .op-root.op-root :is(.codex-bleed, .codex-spotlayer) .codex-hektor {
            transform:
              /* --op-hek = TRETÍ PRECHOD: pes vychádza za pravý okraj a berie
                 so sebou svätožiaru aj bodku (sú to jeho deti). 140 % vlastnej
                 šírky je za hranou aj pri mierke 1.28 a origin bottom right. */
              translateX(calc(var(--op-in, 0) * 120% + var(--op-hek, 0) * 140%))
              rotate(calc(var(--op-split, 0) * -4deg))
              /* +0.20, nie viac: pes je ukotvený bottom right, takže rastie
                 DOĽAVA A NAHOR — a s ním aj svätožiara, ktorá mu visí nad
                 hlavou. Pri +0.26 doliezala do hornej lišty. */
              scale(calc(1.08 + var(--op-split, 0) * 0.20));
          }
        }

        @media (max-width: 767px) {
          /* ⚠️ --op-hek MUSÍ BYŤ AJ TU, A AJ NA KRAVE. Na PC ju z obrazu
             vytlačí rozdelenie obrazovky (--op-split), lenže to na mobile
             neexistuje — takže bez tohto by krava ostala stáť pod textom
             vízie. Odskúšané: pri 500 px presvitala zľava spod blokov. */
          .op-root.op-root .codex-bleed .codex-cow {
            transform: translateX(calc(var(--op-in, 0) * -120% - var(--op-hek, 0) * 140%)) scale(1.377);
          }
          .op-root.op-root :is(.codex-bleed, .codex-spotlayer) .codex-hektor {
            transform: translateX(calc(var(--op-in, 0) * 120% + var(--op-hek, 0) * 140%)) scale(1.352);
          }
        }

        /* ── SVÄTOŽIARA HEKTORA: VO FILME JU RIADI SCROLL, NIE ČASOVAČ ────
           Na samostatnej /religion-lab spúšťa halo časovač (--halo-delay
           v ReligionLab.tsx). Vo filme by sa bil so scrollom presne tak, ako
           sa bili časovače textu — preto sa tu vypína a hodnotu preberá
           --op-halo z výseku HALO_IN, teda AŽ ZA celým textom (oba varianty).

           🔴 ZDVOJENÉ .op-root.op-root z rovnakého dôvodu ako pri zvieratách
           vyššie: .codex-bleed.active .codex-halo-hektor má (0,3,0) a
           ReligionLab sa vkladá NESKÔR, takže pri zhode by vyhrala ona a halo
           by na konci filmu naskočilo s 2,7-sekundovým oneskorením.

           ⚠️ 320 ms zmäkčenie ostáva ZÁMERNE, hoci zvieratá ho mať nesmú.
           Tam bol prechod oneskorením za prstom; tu je to tá istá poistka,
           akú má text (220 ms linear) — proti šklbaniu pri rýchlom scrolle.
           Nábeh samotný robí dráha scrollu, nie tento prechod. */
        .op-root.op-root .codex-bleed .codex-halo-hektor {
          --halo: var(--op-halo, 0);
          transition: opacity 320ms linear;
          transition-delay: 0s;
        }
        .op-root.op-root .codex-bleed .codex-halo-hektor .codex-halo-scale {
          transition: transform 320ms linear;
          transition-delay: 0s;
        }

        /* ── TEXT V STREDE SA ODHAĽUJE PO RIADKOCH, PODĽA SCROLLU ─────────
           Matej: *„text v strede fade in."* → 27. 8. 2026: *„musíme nastaviť aj
           logiku zobrazenie nech je to zaujímavejšie = postupné odhaľovanie /
           čítanie textu."*
           Nie je to reveal stránky (ten je vo filme vypnutý, viď .codex-flow
           v ReligionLab.tsx) a NIE JE to ani časovaná animácia: odhaľovanie visí
           na TEJ ISTEJ premennej --op-txt, ktorou film riadi nábeh textu. Preto
           sa nemá s čím biť — človek si tempo čítania riadi scrollom sám a pri
           scrollovaní späť sa veta rovnako zloží.
           Každý riadok má vlastný prah --tx-at; od neho nabehne za ~0,29 dielika
           (1/3.4). Prahy kopírujú stavbu argumentu, nie rovnomerný stagger.
           Od 27. 8. 2026 sú bloky ŠTYRI (nový texting „YET.", predtým šesť):
             0.00  krava — A COW HAS 1.2 BILLION BELIEVERS
             0.20  pes — A DOG HAS NONE (pauza, prichádza druhá strana)
             0.44  YET. (najväčšia pauza — obrat má doraziť do ticha)
             0.64  CTA
           Svätožiara Hektora ostáva ÚPLNE POSLEDNÁ (HALO_IN 0.92–1.0): „YET."
           teda stojí na obrazovke, keď sa svetlo rozsvieti — slovo je sľub,
           svetlo jeho splnenie. Preto sa poradie nemá prehadzovať.
           ⚠️ Posledný prah + 0.29 musí ostať pod 1.0, inak sa CTA nedopočíta do
           plnej krycej hodnoty a ostane priesvitné aj na konci výjavu. */
        .op-root #op-religion .codex-section[data-idx="0"] .codex-3-overlay > * {
          opacity: clamp(0, calc((var(--op-txt, 1) - var(--tx-at, 0)) * 3.4), 1);
          transform: translateY(calc(
            (1 - clamp(0, calc((var(--op-txt, 1) - var(--tx-at, 0)) * 3.4), 1)) * 16px
          ));
        }
        /* Časovač zo standalone verzie sa tu MUSÍ vypnúť. ReligionLab dáva každému
           riadku transition-delay až 1900 ms — vo filme by to znamenalo, že text
           dobieha takmer dve sekundy po tom, čo ho scroll odkryl, a pri scrollovaní
           späť sa zasekne v polovici. Krátky prechod ostáva, aby rýchly scroll
           netrhal; tempo určuje --op-txt. */
        .op-root #op-religion .codex-section[data-idx="0"] .codex-3-overlay > * {
          transition: opacity 220ms linear, transform 220ms linear;
          transition-delay: 0s;
        }
        /* ── VARIANT 2: ODHAĽOVANIE JE PO ZNAKOCH, NIE PO BLOKOCH ─────────
           Prahy --tx-at nižšie platia pre variant 1 (šesť blokov pod sebou).
           Variant 2 je jeden odsek, ktorý sa PÍŠE — poradie nesie --i na
           každom znaku, takže blokové prahy sa tu musia vypnúť, inak by odsek
           najprv nabehol ako celok a až potom sa „písal".
           --n = počet znakov, dodáva ho React na kontajner; bez neho by CSS
           nevedelo, akou rýchlosťou má scroll znaky odkrývať. */
        .op-root #op-religion .codex-3-overlay.is-v2 > * {
          opacity: 1;
          transform: none;
        }
        .op-root #op-religion .v2-ch {
          animation: none;
          opacity: clamp(0, calc((var(--op-txt, 1) * var(--n, 120) - var(--i, 0)) * 0.5), 1);
        }
        .op-root #op-religion .codex-3-overlay > *:nth-child(1) { --tx-at: 0.00; }
        .op-root #op-religion .codex-3-overlay > *:nth-child(2) { --tx-at: 0.20; }
        .op-root #op-religion .codex-3-overlay > *:nth-child(3) { --tx-at: 0.44; }
        .op-root #op-religion .codex-3-overlay > *:nth-child(4) { --tx-at: 0.64; }

        /* CTA druhého obrazu sa VRÁTILO (Matej 27. 8. 2026 — zadanie textingu
           sekcie končí riadkom „We only need one million to change that." +
           [BECOME DOGYPTIAN]). Prebíja to jeho vlastné rozhodnutie z 26. 8.
           („cta v 2 sekcii tým pádom nebude, bude priamo v nave po celý čas
           scrolingu") — dôvodom je, že sekcia medzitým dostala otočný bod
           („AND NOT ONE OF THEM BOWS."), z ktorého má výzva priamo padať;
           bez tlačidla ten riadok vyznie do prázdna.
           ⚠️ Tlačidlo je tým pádom na obrazovke DVAKRÁT — tu aj v spodnej lište.
           Ak sa to má vrátiť späť, stačí obnoviť display:none na tomto
           pravidle; veta nad ním ostane a je samonosná. */
        .op-root .codex-cta-cluster { display: flex; }

        /* ── HORNÝ NAV ────────────────────────────────────────────────────
           Druhá kópia odliatku z LabShell (viď hlavička súboru). Skladba:
           RÁM (leštené zlato) → DOSKA (pieskovec) → ZRNO → OBSAH.
           Tokeny z navGoldSkin.ts, neopisuj ich. */
        /* 🔴 PÁS CEZ CELÚ ŠÍRKU, NIE left:50% + translateX(-50%), A JE TO
           JEDINÝ DÔVOD, PREČO BOL MEDAILÓN NA MOBILE MIMO STREDU (Matej 28. 8.
           2026: *„MOBIL AJ PC logo v nav bude presne v strede… aktuálne na PC je
           niečo iné ako na mobile"*).
           Fixovaný prvok s left:50% má k dispozícii len PRAVÚ POLOVICU okna
           (390 − 195 = 195 px). Lišta sa doňho nezmestí, takže sa zmrští na
           min-content — a v min-content sizingu dostane každý 1fr stĺpec svoju
           vlastnú min-content šírku, teda ľavý 80,6 px a pravý 90,9 px. Medailón
           v strednom stĺpci tým sadol 5,1 px vľavo od stredu lišty.
           Na PC bola tá istá lišta v poriadku len náhodou: dostupná šírka (720 px)
           tam prevýšila max-content, takže sa použilo max-content sizing, kde
           fr-algoritmus dá OBOM krajným stĺpcom rovnakú šírku.
           Pás cez celú šírku dá lište celé okno, takže max-content sizing platí
           na oboch — jeden mechanizmus, jeden výsledok.
           ⚠️ pointer-events: none je povinné: pás leží cez celú hornú hranu
           filmu a bez toho by chytal ťahy určené guli. */
        .nav-top {
          position: fixed;
          /* 30 px, nie 12: medailón vystupuje nad lištu (MEDAL.lift) a pri pôvodnom
             odsadení mu horný oblúk vyšiel za okraj okna a orezal sa. */
          top: 30px;
          left: 0;
          right: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          pointer-events: none;
        }
        .nav-top > * { pointer-events: auto; }
        .main-nav {
          position: relative;
          isolation: isolate;
          /* ⚠️ GRID, NIE FLEX — nutnosť, nie vkus: medailón je kotvený na stred
             LIŠTY, takže medzera preňho musí byť v strede. Pri flexe je stred lišty
             stredom medzery len vtedy, keď je pilulka rovnako široká ako login
             s jazykom; inak kruh sadne na pilulku (na mobile presne to robil).
             Krajné stĺpce 1fr sú preto rovnaké a stredný nesie medzeru. */
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          padding: ${NAV_R.rim + 5}px ${NAV_R.rim + 15}px;
          background: ${NAV_FRAME_BG};
          background-blend-mode: ${NAV_FRAME_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          border-radius: ${NAV_R.frame}px;
          box-shadow: ${NAV_FRAME_SHADOW};
        }
        .main-nav::before {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          background: ${NAV_PLATE_BG};
          background-blend-mode: ${NAV_PLATE_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PLATE_SHADOW};
          pointer-events: none;
          z-index: -1;
        }
        .main-nav::after {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          ${NAV_GRAIN_SCREEN_CSS}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .main-nav > * { position: relative; z-index: 1; }
        .main-nav-right { display: flex; align-items: center; gap: 14px; justify-self: end; }
        ${NAV_MEDALLION_CSS}
        /* ── PILULKA OBRAZU ───────────────────────────────────────────────
           Matej 27. 8. 2026: *„z lavej strany bude len jedna pils — HOME ale bude
           sa meniť pri slajdovaní podla toho čo bude na screene a z pravej strany
           bude login a jazyk"*. Lišta tým prestala byť menu a je UKAZOVATEĽ polohy.
           ⚠️ Šírku drží najdlhší názov, nie ten práve viditeľný: všetky ležia
           v jednej bunke gridu a neaktívne majú nulové krytie. Bez toho by sa lišta
           pri každom prepnutí obrazu zúžila či rozšírila a medailón by uhýbal do
           strany — a šírka by sa musela merať po vykreslení. */
        .main-nav .scene-pill {
          /* ⚠️ ŽIADNE width: max-content — a je to oprava, nie zjednodušenie.
             Pevná max-content šírka tu bola preto, že lišta stála na min-content
             (viď .nav-top vyššie) a stĺpec by pilulku stlačil na nulu. Odkedy
             lišta dostala celé okno, robí to isté pravidlo opačnú škodu: pri
             360 px sa lišta oprie o max-width, voľné miesto zmizne a stĺpce
             dostanú svoju min-content šírku — ľavý 115 px (celý najdlhší názov),
             pravý 76 px. Medailón tým sadol 17 px vpravo od stredu.
             Bez width je pilulka fit-content: berie min(prirodzená šírka, stĺpec),
             takže na širokom okne ukáže celý názov a na 360 px ustúpi (ellipsis
             na vnútornom <span>) — a stĺpce ostanú rovnaké, teda logo v strede.
             ⚠️ Podmienka platnosti: vnútorné spany musia mať min-width: 0 a
             orezanie textom, inak sa pilulka nezmestí nikam a vytlačí stĺpec. */
          justify-self: start;
          display: grid; align-items: center; justify-items: center;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: ${NAV_GOLD.ink};
          padding: 5px 14px; border-radius: 999px;
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          background: ${NAV_GOLD.activeFill};
          box-shadow: ${NAV_PILL_SHADOW};
          user-select: none;
          /* ⚠️ Bez tohto sa pilulka scvrkne na nulu: orezanie textom robí z jej
             min-content šírky 0 a flexbox ju v úzkej lište stlačí na doraz. */
          flex-shrink: 0;
        }
        .main-nav .scene-pill > span {
          grid-area: 1 / 1;
          transition: opacity 0.22s ease;
          /* Strop je nutnosť, nie ozdoba: pilulka drží šírku NAJDLHŠIEHO názvu a ten
             sa v 18 jazykoch líši (SK „Náboženstvo" je dvojnásobok EN „Religion").
             Bez orezania lišta na telefóne pretiekla a vlajka jazyka vyšla z obrazovky. */
          min-width: 0; width: 100%; text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .main-nav .scene-pill > span[data-off='1'] { opacity: 0; }
        .main-nav-sep { display: inline-block; width: 1px; height: 12px; background: rgba(110,74,20,0.45); flex-shrink: 0; }
        .main-nav a, .main-nav button {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: ${NAV_GOLD.ink};
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .main-nav a:hover, .main-nav button:hover { opacity: 0.55; }
        /* Rozmery majú VŠETKY položky, výplň len aktívna — inak sa lišta pri
           každom prepnutí obrazu rozšíri. */
        .main-nav button { position: relative; padding: 5px 12px; border: ${NAV_R.line}px solid transparent; border-radius: 999px; }
        .main-nav button.is-on {
          opacity: 1;
          background: ${NAV_GOLD.activeFill};
          border-color: ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
        }
        .main-nav button.is-on:hover { opacity: 1; }
        .main-nav .lang-trigger { color: ${NAV_GOLD.ink}; }
        .main-nav .lang-trigger__chev { color: rgba(42,22,8,0.55); }
        /* ⚠️ Dvojtriedny selektor je nutnosť: domček je <a> vnútri .main-nav,
           takže ho inak trafí pravidlo vyššie (background: none, border: none)
           a z kruhu ostane len tieň. */
        .main-nav .nav-login {
          width: 40px; height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          background: ${NAV_GOLD.activeFill};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
        }
        .main-nav .nav-login:hover { opacity: 0.75; }
        /* Mobilný jazykový chip je v DOM-e vždy, viditeľný len pod 768 px. */
        .main-nav .nav-lang-mobile { display: none; }
        @media (max-width: 768px) {
          /* Medailón sa na mobile NEZMENŠUJE: Matej ho ladil pri 110 px práve
             v mobilnom náhľade nákresu a lišta má na 390 px dosť miesta (267 z 390).
             Odsadenie ostáva 34 px — nižšia lišta znamená VÄČŠÍ presah kruhu. */
          .nav-top { top: 34px; }
          .op-root { --op-nav-h: 118px; }
          /* Jazyk ostáva aj na mobile — lišta má po prestavbe miesto (279 px z 390). */
          .main-nav { gap: 7px; padding: ${NAV_R.rim + 3}px ${NAV_R.rim + 7}px; }
          .main-nav-right { gap: 7px; }
          .main-nav a, .main-nav button { font-size: 0.64rem; letter-spacing: 0.04em; }
          .main-nav .scene-pill { font-size: 0.64rem; letter-spacing: 0.06em; padding: 4px 10px; max-width: 32vw; }
          .main-nav { max-width: calc(100vw - 16px); }
          .main-nav button { padding: 4px 8px; }
          .main-nav .nav-login { width: 32px; height: 32px; }

          /* ── JAZYK SA STAHOVAL ZO SPODNEJ LIŠTY HORE (Matej 28. 8. 2026) ────
             *„na mobile je v dolnej NAV chip s jazykmi a po kliknutí sa otvorí
             popup na tmavom pozadí = to je správne ALE presuňme tie jazyky na
             mobile hore do horného navu a tie jazyky čo sú teraz hore vymažme."*
             Presúva sa CELÝ chip aj s jeho správaním: podoba flow otvára modál
             so závojom, kým dropdown horného navu (nav) vešia panel pod pilulku
             a na 390 px by z okna vytiekol. Preto sa nemení variant, ale nosič. */
          .main-nav .nav-lang-desktop { display: none; }
          .main-nav .nav-lang-mobile {
            display: inline-flex; align-items: center; justify-content: center;
            height: 32px; padding: 0 9px;
            flex-shrink: 0;
            border-radius: 999px;
            background: ${NAV_GOLD.activeFill};
            border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
            box-shadow: ${NAV_PILL_SHADOW};
          }
          /* ⚠️ Trojtriedny selektor je nutnosť: .lang-picker--flow .lang-trigger
             má krémový atrament pre TMAVÉ pozadie a rovnakú špecificitu ako
             .main-nav .lang-trigger. O víťazovi by potom rozhodovalo poradie
             dvoch <style> blokov v <head>, teda poradie mountovania komponentov. */
          .main-nav .nav-lang-mobile .lang-picker--flow .lang-trigger {
            color: ${NAV_GOLD.ink}; padding: 0;
          }
          .main-nav .nav-lang-mobile .lang-picker--flow .lang-trigger__chev {
            color: rgba(42,22,8,0.55);
          }
          .main-nav .nav-lang-mobile .lang-picker--flow .lang-flag-stack {
            border-color: ${NAV_GOLD.edge};
          }
          /* Pôvodný chip v spodnej lište zaniká — je to PRESUN, nie kópia.
             Skryté je len na /onepage: .gods-dock-portal má výhradne táto
             stránka (prop portalDock), takže wall lab si svoj chip drží. */
          .gods-dock-portal .lang-btn-mobile { display: none; }
        }

        /* ── SPODNÁ LIŠTA ────────────────────────────────────────────────
           Matej 26. 8. 2026: *„dolný nav zostáva, ale namiesto dvoch ikoniek
           tam bude chip ako je v hornom menu s textom CTA JOIN US."*
           ⚠️ Preto tu NIE JE žiadne plávajúce tlačidlo. Predtým tu bolo (.op-cta)
           a bola to DRUHÁ lišta, ktorá nastúpila po tom, čo prvá zhasla. Dnes je
           lišta jedna jediná — tá z wallu — a vymieňa si len obsah; sama sa
           nikdy nestratí. Vzhľad chipu aj zbalenie ikoniek žijú v GodsGridLab
           (.gbb-cta), lebo tam žije aj lišta.
           ⚠️ Lišta je fixed VNÚTRI .op-planet (ten je transformovaný, teda je jej
           containing block). Preto guľa ostáva prilepená na celý film — keby
           sa odlepila, odniesla by lištu so sebou. */

        /* ⚠️ .op-story a .op-ghost ZANIKLI 28. 8. 2026 spolu s teaserom
           príbehu — príbeh beží v scrolle, nie za tlačidlom. Dôvod je pri
           sekcii v JSX nižšie. Eyebrow, nadpis a odsek ostávajú: nesie ich
           posledný obraz (op-join). */
        .op-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.68rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: ${LAB.goldSolid};
          margin: 0;
        }
        .op-h2 {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.7rem, 5vw, 3rem);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0;
          background: ${LAB.goldText};
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .op-lead {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.95rem, 2.1vw, 1.1rem);
          line-height: 1.62;
          color: ${LAB.inkBody};
          max-width: 46ch;
          margin: 0;
        }
        /* Prekrytie s ústavou — vlastný scroll. Trieda .lsh-scroll NIE JE
           preklep: komponenty si podľa nej hľadajú, čo vlastne scrolluje
           (closest('.lsh-scroll') ?? window). Bez nej by počítali svoje beaty
           voči oknu, ktoré sa pod otvoreným prekrytím nehýbe. */
        .op-storymodal { position: fixed; inset: 0; z-index: 120; background: ${LAB.pageBg}; }
        .op-storymodal::before { content: ''; position: absolute; inset: 0; background: ${LAB.pageBackdrop}; pointer-events: none; }
        .op-storymodal .lsh-scroll { z-index: 1; }
        .op-storymodal .lsh-scroll {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
        .op-storyclose {
          position: fixed;
          top: 14px;
          right: 14px;
          z-index: 130;
          width: 42px; height: 42px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: ${NAV_GOLD.activeFill};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
          font-size: 1.05rem;
          cursor: pointer;
        }

        /* ── OBRAZ 5: OBLÚK — RECENZIE → NEXT STEP ────────────────────────
           Dve obrazovky na JEDNEJ dráhe, nie dve sekcie pod sebou. Sekcia je
           vyššia než okno, javisko v nej stojí prilepené a pás vnútri javiska
           je dvakrát vyšší než okno — presun medzi obrazovkami je jeho posun
           o polovicu. Kto sem siahne, mení VÝŠKU v ARC_VH hore v súbore;
           choreografia si dráhu meria z prvku, takže sa prispôsobí sama.
           ⚠️ Zanikli tu .op-steps (päť dlaždíc míľnikov) a .op-count — severka
           je odteraz mierka a jedna veta, nie rad kariet. */
        .op-arc { position: relative; height: ${ARC_VH * 100}vh; }
        .op-arc-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .op-arc-belt { position: absolute; left: 0; right: 0; top: 0; height: 200%; will-change: transform; }
        .op-arc-scr {
          position: relative;
          height: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        /* Rezervu pod hornou lištou drží PREMENNÁ, nie vlastné číslo — inak sa
           pri zmene MEDAL.lift rozíde s preambulou aj s hero vízie. */
        .op-rev { gap: clamp(14px, 2.4vh, 30px); padding: calc(var(--op-nav-h) + 10px) clamp(18px, 4vw, 54px) 40px; }
        .op-nxt { gap: clamp(12px, 2vh, 26px); padding: calc(var(--op-nav-h) + 6px) clamp(18px, 4vw, 54px) 40px; }

        /* ── A — RECENZIE ───────────────────────────────────────────────── */
        .op-rev-h2 {
          margin: 0;
          opacity: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.9rem, 5.2vw, 3.4rem);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.06;
          background: ${LAB.goldText};
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .op-rev-sub {
          margin: 0;
          opacity: 0;
          max-width: 46ch;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.86rem, 1.5vw, 1rem);
          line-height: 1.55;
          color: ${LAB.inkSoft};
        }
        .op-rev-cards { display: flex; gap: 14px; width: min(1040px, 100%); align-items: stretch; }
        /* Karta = PACK_BOX.card: papyrusový gradient, zlatý rám, radius 16.
           Plochá biela s šedým vlasom je iný materiál, nie iná farba. */
        .op-rev-card {
          flex: 1 1 0;
          min-width: 0;
          opacity: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          padding: 18px 20px;
          border-radius: 16px;
          background: linear-gradient(160deg, rgba(255,252,244,0.92), rgba(248,237,214,0.78));
          border: 1px solid ${LAB.edge};
          box-shadow: ${LAB.shadow};
        }
        .op-rev-q {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.82rem, 1.4vw, 0.95rem);
          line-height: 1.5;
          color: ${LAB.inkBody};
        }
        .op-rev-n { font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.9rem; letter-spacing: 0.02em; color: ${LAB.goldInk}; }
        .op-rev-r {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.6rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
        }

        /* ── B — NEXT STEP ──────────────────────────────────────────────── */
        .op-nxt-eyebrow, .op-nxt-h2 { opacity: 0; }
        .op-nxt-h2 { margin: 0; }
        .op-nxt-plot { position: relative; width: min(1040px, 100%); padding: 0 clamp(22px, 4vw, 54px); }
        .op-nxt-scale { position: relative; width: 100%; height: 78px; margin-top: 6px; }
        .op-nxt-axis { position: absolute; left: 0; right: 0; top: 20px; height: 4px; background: ${LAB.hairline}; border-radius: 999px; overflow: hidden; }
        .op-nxt-axis-fill {
          position: absolute;
          inset: 0;
          transform: scaleX(0);
          transform-origin: left center;
          background: linear-gradient(90deg, #6E4A12, #C99A3F 40%, #D8A93F 70%, #A3782B);
        }
        .op-nxt-stop {
          position: absolute;
          top: 0;
          opacity: 0;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          width: 116px;
        }
        .op-nxt-stop i { display: block; width: 4px; height: 26px; background: ${LAB.edge}; border-radius: 999px; }
        .op-nxt-stop b { font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.02em; color: ${LAB.goldInk}; white-space: nowrap; }
        .op-nxt-stop em {
          font-style: normal;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
          white-space: nowrap;
        }
        .op-nxt-short { display: none; }
        .op-nxt-here {
          position: absolute;
          top: 12px;
          left: 0;
          opacity: 0;
          transform: translateX(-50%);
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: linear-gradient(180deg, #F5C73D, #E69E1A);
          box-shadow: 0 0 0 3px rgba(201,154,63,0.28);
        }

        .op-nxt-lens { position: relative; width: 100%; height: 112px; }
        .op-nxt-rays { position: absolute; left: 0; top: 0; width: 100%; height: 34px; display: block; overflow: visible; color: rgba(140,96,20,0); }
        .op-nxt-band { position: absolute; left: 0; right: 0; bottom: 24px; height: 46px; opacity: 0; }
        .op-nxt-band-rail { position: absolute; left: 0; right: 0; top: 20px; height: 5px; border-radius: 999px; background: rgba(140,96,20,0.18); overflow: hidden; }
        .op-nxt-band-fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 999px; background: linear-gradient(90deg, #A3782B, #D8A93F); }
        .op-nxt-band-cap { position: absolute; top: 10px; transform: translateX(-50%); width: 4px; height: 26px; background: ${LAB.edge}; border-radius: 999px; }
        .op-nxt-band-lbl {
          position: absolute;
          top: 38px;
          right: 0;
          text-align: right;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
          white-space: nowrap;
        }
        .op-nxt-kota {
          position: absolute;
          top: -42px;
          left: 0;
          opacity: 0;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .op-nxt-kota span {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${LAB.goldSolid};
          white-space: nowrap;
        }
        .op-nxt-kota i { display: block; width: 3px; height: 20px; background: ${LAB.goldSolid}; border-radius: 999px; }

        /* Veta, tlačidlo a poznámka prichádzajú ako JEDEN dej — preto jeden
           obal a jeden zápis, nie tri stmievačky, ktoré sa raz rozídu. */
        .op-nxt-tail { opacity: 0; display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 1.8vh, 22px); }
        .op-nxt-lead {
          margin: 0;
          max-width: 44ch;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(0.9rem, 1.5vw, 1.02rem);
          line-height: 1.6;
          color: ${LAB.inkBody};
        }
        /* 🔵 HLAVNÉ CTA = LAPIS (brandový kánon od 28. 8. 2026). Geometriu
           preberá od .btn-gold — radius 8, NIE pilulka; mení sa výplň, nie tvar.
           Zlaté písmo na modrom nie je ozdoba: bez neho je z lapisu len tmavé
           tlačidlo bez príslušnosti k brandu. */
        .op-nxt-cta {
          display: inline-block;
          text-decoration: none;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.86rem, 1.4vw, 1rem);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.78em 1.9em;
          border-radius: 8px;
          background: ${LAPIS.grad};
          color: ${LAPIS.ink};
          border: 1px solid rgba(250,244,236,0.30);
          box-shadow: ${LAPIS_BTN_SHADOW};
        }
        .op-nxt-cta:hover { background: ${LAPIS.gradHover}; }
        .op-nxt-note {
          margin: 0;
          max-width: 44ch;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.76rem;
          line-height: 1.5;
          color: ${LAB.inkSoft};
        }

        @media (max-width: 860px) {
          /* Tri karty vedľa seba sú pri 390 px tri stĺpce po štyroch znakoch.
             Tretia odchádza celá — dve stačia na dôkaz a zmestia sa. */
          .op-rev-cards { flex-direction: column; gap: 10px; width: 100%; }
          .op-rev-card { padding: 13px 15px; gap: 5px; }
          .op-rev-card:nth-child(3) { display: none; }
          .op-rev, .op-nxt { padding-left: 16px; padding-right: 16px; }
          .op-nxt-plot { padding: 0 18px; }
          /* Číslo sa skracuje a názvy fáz odchádzajú — päť popiskov vedľa seba
             je pri 390 px päť orezaných slov. Prvá fáza si svoj necháva: je to
             jediná, v ktorej značka niečo ukazuje. */
          .op-nxt-stop { width: 54px; }
          .op-nxt-stop em { display: none; }
          .op-nxt-stop--f em { display: block; font-size: 0.52rem; letter-spacing: 0.1em; }
          .op-nxt-long { display: none; }
          .op-nxt-short { display: inline; }
          /* Značka „tu môžeš byť ty" stojí v prvých percentách mierky (71
             z 1 000), takže vycentrovaný popisok vytečie z ľavého okraja —
             pri 390 px mu chýba 60 px. Na úzkom okne preto číta DOPRAVA od
             zárezu: zárez ostáva na pravdivom mieste, posúva sa len text.
             ⚠️ Nie je to meranie po vykreslení — je to iný ukotvovací bod. */
          .op-nxt-kota { transform: none; align-items: flex-start; }
          .op-nxt-scale { height: 86px; }
          .op-nxt-lens { height: 124px; }
          .op-nxt-band { bottom: 32px; }
        }

        /* ── CTA ────────────────────────────────────────────────────────────
           ⚠️ NÁJDENÉ 26. 8.: všetky tri zlaté CTA filmu sa kreslili ako HOLÝ
           ČIERNY TEXT. Trieda .btn-gold je v SpiralLanding.css zapísaná pod
           .dogypt-spiral-root, takže mimo spirály neplatí vôbec — a OnePage ju
           používal bez lokálnej kópie. Zavedený vzor projektu (PackDogs,
           TripSpotlight, AddTripPlan…) je presne toto: hodnoty 1:1, nie vlastný
           gradient. Lock ostáva locked, len tu má konečne kde platiť. */
        .op-root .btn-gold {
          display: inline-block;
          text-decoration: none;
          padding: 14px 32px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.30);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.22s, opacity 0.22s;
          box-shadow: 0 0 40px rgba(230, 158, 26, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          white-space: nowrap;
        }
        .op-root .btn-gold:hover {
          transform: scale(1.04);
          box-shadow: 0 0 56px rgba(230, 158, 26, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        .op-root .btn-gold:active { transform: scale(0.98); }

        /* ── PODPIS NAD PÄTIČKOU ─────────────────────────────────────────────
           ⚠️ Logo je ČIERNY súbor (dogypt-logo-black-i.png, 500 px), nie zlatý
           prehnaný cez filter: brightness(0). Zlatý dogypt-gold-logo.webp má
           260 px a 8,4 % pixelov s čiastočnou priehľadnosťou — po sčernení z nich
           vznikne sivá kaša a značka vyzerá rozmazane. Čierny súbor má 3,2 %,
           teda obyčajné vyhladenie okrajov, a nepotrebuje žiadny filter. */
        .op-sign {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 0 18px 64px;
          text-align: center;
        }
        /* ⚠️ Logo je OBRYSOVÁ kresba (DS·02) — pod ~120 px sa jej ťahy vyhladením
           stenčia do sivej a značka vyzerá vyblednuto. Podpis preto stojí väčší,
           než by sa na pätičku žiadalo. */
        .op-sign-logo { width: clamp(112px, 11vw, 152px); height: auto; }
        .op-sign-tag {
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.72rem, 1.2vw, 0.84rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
        }
        .op-sign-tag b { color: ${LAB.goldInk}; font-weight: 700; }
      `}</style>

      {/* ── HORNÝ NAV — namontovaný RAZ, film pod ním beží ─────────────── */}
      <div className="nav-top">
        <nav className="main-nav" data-op-nav="1">
          {/* Ľavá strana = JEDEN ukazovateľ obrazu, nie menu. Všetky názvy sú
              v DOM-e naraz kvôli pevnej šírke (viď CSS), viditeľný je aktívny. */}
          <div className="scene-pill" aria-live="polite">
            {SCENES.map((s, i) => (
              <span key={s.id} data-off={i === scene ? undefined : '1'} aria-hidden={i === scene ? undefined : true}>
                {t(s.navKey)}
              </span>
            ))}
          </div>
          <span className="nav-medal-slot" aria-hidden="true">
            <NavMedallion onClick={() => goTo(SCENES[0].id)} />
          </span>
          {/* ⚠️ PORADIE V DOM-e JE MOBILNÉ: jazyk, potom login (Matej 28. 8. 2026:
              *„v hornom menu vymeňme jazyky a login — jazyky vlavo login vpravo
              na MOBILE"*). Na PC ostáva pôvodné poradie login → jazyk, lebo tam
              je viditeľný `.nav-lang-desktop`, ktorý stojí ZA loginom.
              Dve inštancie pickera nie sú duplikát z nedbanlivosti: mobil má
              podobu `flow` (modál s tmavým závojom, prenesená zo spodnej lišty),
              PC dropdown zavesený pod pilulku. Jedna inštancia by musela meniť
              variant podľa `matchMedia`, teda držať šírku okna v stave. */}
          <span className="main-nav-right">
            <span className="nav-lang-mobile"><LanguagePicker variant="flow" /></span>
            <a href="/login" className="nav-login" aria-label={t('nav.login')}>
              <HandHouseHeart size={20} />
            </a>
            <span className="nav-lang-desktop"><LanguagePicker /></span>
          </span>
        </nav>
      </div>

      {/* ── SCÉNA ────────────────────────────────────────────────────────
          Guľa je prilepená na CELÝ film — nesie spodnú lištu, ktorá podľa
          zadania ostáva na obrazovke po celý čas scrollu. Film je vtiahnutý
          o jednu obrazovku hore, takže prvý výjav náboženstva stojí od začiatku
          presne tam, kde stojí guľa. */}
      <div className="op-stage">
        {/* ── ZNAČKY SNAPU V PRECHODE ────────────────────────────────────
            Prechod 1. → 2. obrazu je JEDNA sekcia vysoká PIN_VH+1 obrazoviek,
            takže má JEDINÝ začiatok — snap bod na ňom a ďalší až na preambule
            by celú choreografiu preskočil jedným ťahom (presne to, čo Matej
            opísal ako „prejde z prvého na 4"). Tieto značky ju rozdelia na
            obrazovky: 0 = guľa, 1–2 = medzikroky odchodu, 3 = výjav v pokoji.
            To isté platí pre prechod 2. → 3.: preambula je od 28. 8. 2026 tiež
            prilepená (PIN2_VH), takže značky pokračujú — 4 = medzikrok
            (nadpis stojí, úryvok sa dopisuje), 5 = preambula v pokoji.
            A to isté pre prechod 3. → 4. (PIN3_VH): 6 = medzikrok (pás je
            v polovici cesty), 7 = vízia v pokoji.
            A rast videa na plátno (PIN4_VH): 8 = medzikrok (bloky zhasli, rám
            je na ceste do stredu), 9 = video na celej obrazovke — a to je
            zároveň cieľ, kam skáče klik na „pozri introfilm".
            A napokon prechod do čiernej (PIN5_VH): 10 = medzikrok (obraz
            dorastá a černie), 11 = čierna sála, z ktorej vyjde príbeh.
            ⚠️ Sekvencia príbehu za ňou si snap NEPÝTA — má vlastnú dráhu
            340vh a značka v nej by človeka usadila doprostred vety.
            Sú absolútne voči .op-stage, teda na presných násobkoch obrazovky —
            nič nemerajú a nič nekreslia. */}
        <div className="op-snaps" aria-hidden>
          {Array.from({ length: PIN_VH + PIN2_VH + PIN3_VH + PIN4_VH + PIN5_VH + 1 }, (_, i) => (
            <span key={i} style={{ top: `${i * 100}dvh` }} />
          ))}
        </div>

        <div className="op-planet" id="op-home">
          {/* ctaLabel sa vykresľuje vždy — chip sa z ničoho rozvinie až keď
              `ctaMode` naskočí. Bez toho by do lišty skokom vpadol. */}
          {/* `paused` zastaví rAF slučku glóbusu, keď je guľa preč. Nie je to
              úspora batérie: tá slučka číta 15× za sekundu dlaždicu pod kurzorom
              cez elementFromPoint nad ~1000 prvkami v 3D — a keďže je guľa
              prilepená na CELÝ film, bežala by pri každom scrolle až po pätu. */}
          <GodsGridLab embedded portalDock paused={past} onWallChange={setWallOpen} />
        </div>

        <div className="op-film">
        {/* ── OBRAZ 2 — OTÁZKA (krava a pes) ─────────────────────────────
            Príchod výjavu si stránka rieši sama: `.codex-section.in-view`
            odkrýva riadky s odstupmi 100/220/340/460 ms. Nemá zmysel k tomu
            pridávať druhú animáciu — bili by sa. */}
        <section className="op-scene" id="op-religion" aria-label={t('nav.religion')}>
          <ReligionLab embedded flow onOpenBook={() => setBookOpen(true)} />
        </section>

        {/* ── OBRAZ 3 — VIDEO A VÍZIA ────────────────────────────────────
            Z komponentu beží LEN hero (video + tri bloky). Pás WHAT IF za ním
            vo filme nie je — Matej 28. 8. 2026: *„uvažujem že tú kreslenú víziu
            teraz vynecháme (nebude na webe) ako aj nasledujúci slajd «čo ak
            by»"*. Nie je to zmazané, len vypnuté propom (heroOnly);
            `/vision` a `/vision-lab` si pás nechávajú. Dôvod, prečo to sedí aj
            obsahovo, je pri prope v VisionLab.tsx: film ten istý sľub dáva
            štyrikrát a WHAT IF je z nich najdrahší. */}
        <section className="op-scene" id="op-vision" aria-label={t('nav.vision')}>
          {/* `flow` vypína vstupný zámok pásu WHAT IF — ten vo filme scroll
              doslova vracia späť (odmerané 4000 → 3989 px). Viď prop v VisionLab. */}
          <VisionLab embedded flow heroOnly onWatch={goCinema} />
        </section>

        {/* ── OBRAZ 4 — PRÍBEH NA ČIERNEJ ─────────────────────────────────
            Matej 28. 8. 2026: *„nasledoval by starwars príbeh — nie schovaný za
            tlačítkom ale priamo na onepage."*

            🔴 TÝM PADOL TEASER AJ POPUP. Do 28. 8. tu stála sekcia s eyebrow,
            nadpisom, odsekom *„One dog off the street, forty-two days across
            a country…"* a tlačidlom, ktoré otváralo príbeh v prekrytí — presne
            podľa jeho staršieho pokynu z 26. 8. (*„príbeh v scrole schovať za
            popup"*). Ten istý deň ho sám obrátil, takže to nie je porušenie
            locku, ale jeho nový pokyn. Ostať nemohli oba: teaser sľubuje to,
            čo o obrazovku nižšie aj tak príde, a tlačidlo otvára to, v čom
            človek už stojí.

            part="film" ⇒ komponent kreslí sekvenciu aj všetko za ňou (časová os,
            RECENZIE, Council, outro), ale BEZ pätičky — tú si film kladie sám
            na úplný koniec, za blok s CTA. Deliť to na dve volania nejde:
            časová os sa na koniec sekvencie NAKLADÁ záporným okrajom
            (marginTop -100vh v AboutLab), takže bez sekvencie nad sebou by sa
            vytiahla o obrazovku nad svoje miesto. */}
        <section className="op-scene op-timeline" aria-label={t('about.timeline.heading')}>
          <AboutLab embedded part="film" />
        </section>

        {/* ── OBRAZ 5 — OBLÚK: RECENZIE → NEXT STEP ──────────────────────
            Matej 31. 8. 2026, po zamietnutí prvého kola (*„nehovoril som aby si
            to staval! … a to čo si spravil je hnus"*): vecná príčina bola, že
            sa obrazy NASKLADALI pod seba, kým zvyšok `/onepage` sa prevaľuje.
            Tu je preto jedna dráha a na nej dve obrazovky — pás je dvakrát
            vyšší než okno a presun medzi nimi je jeho posun o jednu obrazovku.
            Časovanie drží objekt ARC hore v súbore, ladí sa v nákrese
            `plany/nakres-po-starwars-2026-08-31.html`.

            PREČO RECENZIE PRVÉ: príbeh končí tvrdením, že vzniká nová viera.
            Po takom tvrdení nepotrebuje človek výzvu, ale dôkaz, že nie je
            blázon — a ten je hotový. NEXT STEP potom už nemusí presviedčať,
            len povedať, čo urobiť.

            ⚠️ ID ostáva `op-join` — visí na ňom snap bod aj pozorovateľ
            obrazov v nave. Zmena mena by ticho zabila oboje. */}
        <section className="op-scene op-arc" id="op-join" aria-label="Join">
          <div className="op-arc-stage">
            <div className="op-arc-belt">

              {/* ── A — RECENZIE ─────────────────────────────────────────── */}
              <section className="op-arc-scr op-rev">
                <h2 className="op-rev-h2">We didn&rsquo;t invent this</h2>
                <p className="op-rev-sub">
                  {CELEB_QUOTE_COUNT} famous people describing the same religion. None of them
                  knew its name.
                </p>
                <div className="op-rev-cards">
                  {quotes.map((qt) => (
                    <article className="op-rev-card" key={qt.name}>
                      <p className="op-rev-q">
                        &ldquo;{t(`about.legends.q.${quoteSlug(qt.name)}.text`)}&rdquo;
                      </p>
                      <span className="op-rev-n">{qt.name}</span>
                      <span className="op-rev-r">{t(`about.legends.q.${quoteSlug(qt.name)}.role`)}</span>
                    </article>
                  ))}
                </div>
              </section>

              {/* ── B — NEXT STEP ────────────────────────────────────────── */}
              <section className="op-arc-scr op-nxt">
                <p className="op-eyebrow op-nxt-eyebrow">Next step</p>
                <h2 className="op-h2 op-nxt-h2">Join the mission</h2>

                {/* ⚠️ MIERKA AJ VÝREZ STOJA V TOM ISTOM POLI. Lúče výrezu sa
                    kreslia v percentách, takže keby mala mierka iné okraje než
                    pás pod ňou, mierili by mimo úsek, ktorý zväčšujú.
                    Odsadenie je aj preto, že popisky krajných zastávok by sa
                    inak orezali o hranu obrazovky. */}
                <div className="op-nxt-plot">
                  <div className="op-nxt-scale">
                    <div className="op-nxt-axis"><span className="op-nxt-axis-fill" /></div>
                    {ARC_STOPS.map((st, i) => (
                      <span
                        className={`op-nxt-stop${i === 0 ? ' op-nxt-stop--f' : ''}`}
                        style={{ left: `${st.at}%` }}
                        key={st.ph}
                      >
                        <i />
                        <b><span className="op-nxt-long">{st.n}</span><span className="op-nxt-short">{st.short}</span></b>
                        <em>{st.ph}</em>
                      </span>
                    ))}
                    <span className="op-nxt-here" />
                  </div>

                  <div className="op-nxt-lens">
                    {/* preserveAspectRatio="none" ⇒ súradnice sú percentá
                        a fungujú na PC aj na mobile bez prepočtu. Lúče idú
                        z prvého úseku (0–20 %) na kraje zväčšeného pásu. */}
                    <svg className="op-nxt-rays" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M0,0 L0,100" stroke="currentColor" strokeWidth="0.6" fill="none" />
                      <path d="M20,0 L100,100" stroke="currentColor" strokeWidth="0.6" fill="none" />
                    </svg>
                    <div className="op-nxt-band">
                      <div className="op-nxt-band-rail"><span className="op-nxt-band-fill" /></div>
                      <span className="op-nxt-band-cap" style={{ left: 0 }} />
                      <span className="op-nxt-band-cap" style={{ left: '100%' }} />
                      <span className="op-nxt-band-lbl" />
                      {/* 🚩 ČÍSLO TU ZÁMERNE NIE JE. Poradové číslo prideľuje
                          až platba (`seal_pack_number`), takže počet psov
                          a poradie sa môžu rozísť — stránka by sľúbila číslo,
                          ktoré človek nedostane. Značka preto ukazuje MIESTO,
                          nie číslo. */}
                      <span className="op-nxt-kota"><span>You can be here</span><i /></span>
                    </div>
                  </div>
                </div>

                <div className="op-nxt-tail">
                  <p className="op-nxt-lead">
                    The first thousand carry the flame. Your number is given once and never moves
                    again &mdash; not when he grows old, not when he is gone.
                  </p>
                  <a href="/entry" className="op-nxt-cta">{t('wall.hero.cta')}</a>
                  <p className="op-nxt-note">
                    No deadline, no countdown. Counted in dogs, not in years.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </section>

        {/* ── PODPIS — LOGO + TAGLINE ────────────────────────────────────
            Matej 26. 8. 2026: *„Logo aj tagline preč — dáme to úplne dolu…
            myslím do pätičky webu."* Z prvej obrazovky (guľa) zmizli, aby tam
            ostala jediná veta a jediná akcia; sem sadli ako podpis filmu.
            ⚠️ Je to blok OnePagu, NIE zásah do `components/landing/Footer.tsx`
            — ten je ostrý a musí mať prázdny diff. */}
        <div className="op-sign">
          <img src="/images/dogypt-logo-black-i.png" alt="DOGYPT" className="op-sign-logo" />
          <p className="op-sign-tag">
            {t('wall.hero.taglineLead')} <b>{t('wall.hero.taglineGod')}</b>
          </p>
        </div>

        {/* ── ÚSTAVA AKO POSLEDNÁ VEC NA STRÁNKE ─────────────────────────
            Matej 28. 8. 2026: *„kniha nebude vidno (kniha bude v pätičke
            úplne nakonci)."* Zanikol tým celý štvrtý obraz — kniha už nie je
            zastávka vo filme, ale predmet, ktorý film uzatvára. Kto sa
            k ústave chce dostať skôr, má CTA pod úryvkom (prekrytie nižšie).
            ⚠️ Stojí NAD `<Footer />`, nie v ňom — ten je ostrý a musí mať
            prázdny diff (to isté pravidlo ako pri podpise vyššie). */}
        <div className="op-book">
          <ConstitutionBook
            belowBook={<h2 className="codex-book-title codex-book-title--below">{t('religion.bookTitle')}</h2>}
          />
        </div>

        {/* Pätička (e-mail + siete) uzatvára film. Je tu, a nie vnútri AboutLabu,
            aby nesedela uprostred stránky pred blokom s CTA. */}
        <Footer />
        </div>
      </div>

      {/* ── ÚSTAVA V PREKRYTÍ ───────────────────────────────────────────
          Následok CTA pod úryvkom. Rovnaký vzor ako príbeh nižšie — kniha sa
          otvorí NAD filmom, takže človek neopúšťa príbeh ani doménu; odkaz na
          `dogma.dogypt.com` je vnútri knihy, kde bol vždy. */}
      {bookOpen && (
        <div className="op-storymodal" role="dialog" aria-modal="true" aria-label={t('religion.bookTitle')}>
          <button type="button" className="op-storyclose" onClick={() => setBookOpen(false)} aria-label={t('nav.aria.close')}>
            ✕
          </button>
          <div className="lsh-scroll op-bookmodal">
            <ConstitutionBook openOnMount />
          </div>
        </div>
      )}

      {/* ── NOC ──────────────────────────────────────────────────────────
          Čierna sála, na ktorej beží príbeh. Stojí ZA .op-stage zámerne: má
          rovnaké číslo vrstvy ako guľa, takže o poradí rozhoduje DOM — takto
          prekryje aj papyrus, ktorý si guľa nesie sama. Film ostáva nad ňou.
          Krytie riadi réžia scrollu. */}
      <div className="op-wall" aria-hidden />

      {/* ── ZÁVOJ ────────────────────────────────────────────────────────
          Prechodová vrstva 5. obrazu. Leží nad VŠETKÝM vrátane hornej lišty,
          takže je posledná v DOM-e a nesie najvyšší z-index vo filme (70).
          Keď pod ňou dosadne noc, sama zhasne — nič nedrží. */}
      <div className="op-veil" aria-hidden />
    </div>
  );
}
