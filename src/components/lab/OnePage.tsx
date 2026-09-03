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
// lucide je povolený na funkčné chrome — chevron je v tom výpočte menovaný.
import { ChevronDown } from 'lucide-react';
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
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { GLYPH_COMBINATIONS } from './glyphCount';
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
  tintRGBA,
} from '@/components/pack/navGoldSkin';
import NavMedallion, { NAV_MEDALLION_CSS } from './NavMedallion';

// ── OBRAZY FILMU SÚ NA JEDNOM MIESTE ────────────────────────────────────────
// Matejov zoznam z 2. 9. 2026, doslova: *„1-HOME · 2 COW vs DOG · 3 Religion ·
// 4 Vision · 5 Story (priblíženie videa padá) · 6 Dogs and stars · 7 mission ·
// 8 HEroglyph (dogtrix aj alba) · 9 a ďalšie dorobíme postupne"*.
//
// TOTO POLE ČÍTAJÚ DVE VECI NARAZ: pilulka v hornom nave (ktorý obraz práve
// beží) a jej rozbaľovacia navigácia (Matej: *„do laveho nav panelu kde sa mení
// názov stránky vytvoríš navigáciu na každý slajd… tlačítko bude dropdown aby
// sme mohli rýchlo prejsť na stránku"*). Jeden zoznam preto, aby sa meno
// v pilulke a položka v menu nemohli rozísť.
//
// 🔴 ČO TU ZANIKLO oproti pôvodnej štvorici home/religion/vision/about:
//  · `about` nemal v DOM-e kotvu — `#op-about` zmizol 28. 8. 2026, keď teaser
//    príbehu nahradil crawl v scrolle, takže sa v pilulke NEZOBRAZIL ANI RAZ.
//  · Jediný obraz s menom RELIGION bol v skutočnosti výjav s kravou a psom;
//    preambula za ním vlastné meno nemala a delila sa oň s ním.
//  · Zväčšenie videa na celú obrazovku vlastnú položku NEDOSTALO (Matej:
//    *„priblíženie videa padá"*) — réžia ostáva, je to chvost VÍZIE a prechod
//    do čiernej, nie zastávka, na ktorú by sa skákalo.
//  · Kniha/ústava a `/app` patria medzi tie „ďalšie postupne".
//
// ⚠️ DVE ČÍSLA NA OBRAZ, A OBE SÚ TU: `at()` = kam skočí klik (obraz DOBEHNUTÝ,
//    teda to, čo chce človek vidieť), `from()` = odkiaľ sa obraz počíta za
//    bežiaci (podsvietenie pilulky). Sú rôzne: pás recenzií sa napríklad začína
//    nadpisom a dobehne až s kartami. Odvodzovať jedno z druhého sa nedá a dve
//    osobitné tabuľky by sa pri prvej zmene tempa rozišli.
// ⚠️ Sú to FUNKCIE, nie čísla — vyhodnocujú sa až za behu. Konštanty tempa
//    (`PIN_VH`, `ARC_SPLIT`, …) sú deklarované NIŽŠIE v súbore; zápis hodnotou
//    by spadol do temporálnej mŕtvej zóny a stránka by sa nenamountovala.

/** Absolútna výška prvku v dokumente.
 *  ⚠️ NIE `offsetTop`: `#op-vision` má záporný `margin-top` o celé obrazovky
 *  a sekcie filmu si navzájom lezú do dráhy, takže offsetTop v tomto strome
 *  klame. Rect + scrollY hovorí, kde prvok naozaj JE. */
const absTop = (sel: string): number | null => {
  const el = document.querySelector<HTMLElement>(sel);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
};

/** Bod na dráhe PRILEPENEJ sekcie, v podiele 0–1. Použiteľná dráha je výška
 *  sekcie mínus okno — javisko odchádza až s jej koncom. */
const pinnedAt = (sel: string, f: number): number | null => {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return top + Math.max(1, el.offsetHeight - window.innerHeight) * f;
};

/** Kde na dráhe crawlu stojí ROZBEHNUTÝ príbeh (zlatý text). Odmerané na
 *  živej stránke (dráha 2377 px pri okne 699 px).
 *  ⚠️ UŽ TO NIE JE CIEĽ SKOKU — od 2. 9. 2026 kotva PRÍBEHU sedí o obrazovku
 *  vyššie, na čiernej sále s výzvou.
 *  🔴 A NIE JE TO ANI ZÁCHYT PRE ŠÍPKU (oprava 2. 9. 2026): prvý MODRÝ riadok
 *  („pred desiatimi rokmi…") nabieha oveľa skôr — vo filme beží AboutLab bez
 *  úvodu, takže jeho pásmo 0.10–0.18 sadne na prvé pixely dráhy crawlu. Odchod
 *  výzvy sa preto meria piatou dráhou filmu, nie týmto číslom (viď KEEP_OUT). */
const STORY_AT = 0.20;

type FilmSlide = {
  id: string;
  navKey: string;
  /** Kam skočí klik v navigácii — obraz DOBEHNUTÝ. */
  at: () => number | null;
  /** Odkiaľ sa obraz počíta za bežiaci (podsvietenie pilulky). */
  from: () => number | null;
};

const FILM_SLIDES: FilmSlide[] = [
  {
    id: 'home',
    navKey: 'nav.home',
    at: () => 0,
    from: () => 0,
  },
  {
    // Výjav krava a pes. Dobehnutý stojí na konci prvej prilepenej dráhy —
    // to je zároveň značka snapu č. 3.
    id: 'cowdog',
    navKey: 'film.slide.cowdog',
    at: () => window.innerHeight * PIN_VH,
    // 0.55 dráhy = to isté číslo, akým si prvý obraz odovzdával pilulku aj
    // predtým; guľa je v tej chvíli zhasnutá a zvieratá sú vonku.
    from: () => window.innerHeight * PIN_VH * 0.55,
  },
  {
    // Preambula — motto a prísaha. Značka snapu č. 5.
    id: 'religion',
    navKey: 'nav.religion',
    at: () => window.innerHeight * (PIN_VH + PIN2_VH),
    from: () => window.innerHeight * (PIN_VH + PIN2_VH * 0.5),
  },
  {
    // Vízia — video hero a tri bloky. Značka snapu č. 7. Za ňou pokračuje
    // ešte jej vlastný chvost (video na celú obrazovku, potom čierna).
    id: 'vision',
    navKey: 'nav.vision',
    at: () => window.innerHeight * (PIN_VH + PIN2_VH + PIN3_VH),
    from: () => window.innerHeight * (PIN_VH + PIN2_VH + PIN3_VH * 0.5),
  },
  {
    // Príbeh na čiernej.
    // 🔵 KOTVA JE ČIERNA SÁLA — teda koniec piatej dráhy, značka snapu č. 11.
    // Matej 2. 9. 2026: *„presne tu prelinkuj klikknutie na story"*, kde „tu"
    // je obrazovka s výzvou SKROLUJ ĎALEJ (viď KEEP_IN vyššie).
    // ⚠️ Medzikrok, ktorý tu stál pred tým: kotva bola posunutá na prvý modrý
    // riadok crawlu, lebo čierna sála bola PRÁZDNA a skok na ňu vyzeral ako
    // chyba. Matej to vyriešil opačne — obrazovku naplnil výzvou. Preto sa
    // kotva vrátila na jej začiatok a `STORY_AT` už nie je cieľ skoku, len
    // údaj o tom, kde stojí prvý riadok (šípka musí zhasnúť pred ním).
    id: 'story',
    navKey: 'film.slide.story',
    at: () => window.innerHeight * (PIN_VH + PIN2_VH + PIN3_VH + PIN4_VH + PIN5_VH),
    from: () => window.innerHeight * (PIN_VH + PIN2_VH + PIN3_VH + PIN4_VH + PIN5_VH),
  },
  {
    // WE NEED YOU. Klik pristane na začiatku VÝDRŽE — presne tam, kde obraz
    // dobehol celý aj s CTA (to isté miesto, kde stojí odpočívadlo snapu
    // `.op-arc-rest`).
    id: 'mission',
    navKey: 'film.slide.mission',
    at: () => pinnedAt('.op-arc', ARC_SPLIT),
    from: () => pinnedAt('.op-arc', 0),
  },
  {
    // HEROGLYPH = DOGTRIX aj ALBA pod jednou položkou (Matejovo zadanie).
    // Klik pristane na dobehnutom DOGTRIXe (odpočívadlo `.op-arc-rest2`),
    // ALBA je odtiaľ scrollom ďalej.
    id: 'heroglyph',
    navKey: 'film.slide.heroglyph',
    at: () => pinnedAt('.op-arc', ARC_REST2_VH / ARC_TOTAL_VH),
    from: () => pinnedAt('.op-arc', ARC_SPLIT + ARC_DWELL + ARC_XFADE),
  },

  {
    // Pás recenzií. Klik má pristáť tam, kde sú karty v strede obrazovky —
    // teda na konci posledného beatu (`QUO.colsIn`), nie na nadpise, ktorý
    // sa o chvíľu rozplynie.
    // 🔴 STOJÍ AŽ ZA CELÝM OBLÚKOM (3. 9. 2026). Matej: *„slajd psov miluje
    // každý a recenzie od hviezd presuň na koniec aby nezavadzali, po príbehu
    // pôjde slajd we need you."* Je to JEDEN obraz, nie dva — „PSOV MILUJE
    // KAŽDÝ" je nadpis toho istého pásu (`about.legends.titleFilm`).
    // ⚠️ Poradie tu musí sedieť s poradím sekcií v `.op-film`: pilulka v nave
    // sa podsvecuje podľa `from()`, ale MENO obrazu berie z tohto zoznamu.
    id: 'stars',
    navKey: 'film.slide.stars',
    at: () => pinnedAt('.op-quo', QUO.colsIn[1]),
    from: () => absTop('.op-quo'),
  },
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

/* ── VÝZVA NA ČIERNEJ: SKROLUJ ĎALEJ ────────────────────────────────────────
   Matej 2. 9. 2026: *„v momente ako sa video natiahne a je čierna obrazovka
   ukáže sa trojitá šípka zasvieti - s vetou keep scrolling, skroluj dalej…
   aby človek vedel čo má robiť a presne tu prelinkuj klikknutie na story"*.

   🔑 RIEŠI TO PRÁZDNU OBRAZOVKU, NIE ZDOBÍ. Medzi dosadnutím čiernej a prvým
   modrým riadkom príbehu leží vyše obrazovky, na ktorej sa NEDEJE NIČ — a film
   dovtedy človeka viedol dejom, nie pokynom. Bez výzvy to vyzerá ako koniec
   stránky. Preto je to zároveň dôvod, prečo kotva obrazu PRÍBEH v navigácii
   sadla SEM a nie na modrý nápis (viď FILM_SLIDES nižšie): obrazovka už
   prázdna nie je.
*/
/** Nábeh výzvy — v podiele PIATEJ dráhy. Číslo je hranou ZÁVOJA: pri 0.46
 *  (VEIL_IN[1]) je závoj plne čierny, teda presne vtedy obrazovka zhasla.
 *  Matej 2. 9. 2026: *„musíš to dať ihneď ako zhasne obrazovka"*.
 *  ⚠️ Preto `.op-keep` leží NAD závojom (z-index 75 > 70) — pod ním by nemohla
 *  svietiť skôr než závoj odíde (s5 = 0.82), teda o pol dráhy neskôr.
 *  ⚠️ Starý zápis [0.86, 1.00] dosiahol plné krytie AŽ na konci piatej dráhy
 *  a odtiaľ do príbehu ostávalo ešte 656 px — výzva teda nesvietila na
 *  černejúcej obrazovke, ale doháňala príbeh. */
const KEEP_IN: readonly [number, number] = [0.46, 0.56];
/** Odchod — v PRÍLETE PRÍBEHU: 0 = crawl je ešte celý pod ohybom, 1 = jeho
 *  horná hrana je na hornom okraji okna, čo je presne okamih, keď sa začne
 *  rozsvecovať modrý riadok („pred desiatimi rokmi…"). Výzva teda musí byť
 *  preč PRED jednotkou; 0.85 je ten „moment pred" (odmerané ≈ 105 px čiernej
 *  medzery pri okne 699 px).
 *
 *  🔴 PREČO NIE PODIEL DRÁHY CRAWLU (starý zápis [0.06, 0.16], oprava
 *  2. 9. 2026): na tej dráhe je začiatok príbehu NULA — vo filme beží
 *  `AboutLab` bez úvodu (p = 0.10 + raw·0.90), takže jeho pásmo 0.10–0.18
 *  sadne na prvé pixely. Odchod meraný v jej podiele preto nutne beží AŽ NAD
 *  rozsvietenou vetou: odmerané 380 px, presne to, čo Matej videl —
 *  *„nemôže tam byť šípka aj text zároveň"*.
 *
 *  🔴 A PREČO NIE PIATA DRÁHA (skúšané a zamietnuté v tej istej session):
 *  medzi jej koncom a začiatkom crawlu leží ešte ≈ 656 px (0,94 obrazovky),
 *  kde je `s5` zaseknuté na 1 — čokoľvek naviazané na ňu tam zamrzne, takže
 *  výzva by zhasla skoro celú obrazovku pred príbehom a čierna by opäť
 *  osirela. Práve táto medzera je tá „prázdna obrazovka", ktorú výzva rieši. */
const KEEP_OUT: readonly [number, number] = [0.45, 0.85];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Mäkké konce — lineárny priebeh vyzerá ako stmievač, nie ako pohyb. */
const ease = (v: number) => v * v * (3 - 2 * v);
/** Výsek dráhy: mimo [a, b] vracia 0, resp. 1. */
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

/** Lineárny prechod medzi dvoma hodnotami. */
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Míľniky zo `plany/severka.md`. Roky zámerne nikde — severka nemá deadline. */
const MILESTONES = [
  { n: '1 000', title: 'The Founders', note: 'The first thousand. Slovakia carries the flame.' },
  { n: '10 000', title: 'The Pack', note: 'Merch, the pack tree, the first shelters helped.' },
  { n: '100 000', title: 'The Nation', note: 'A full-time mission. The app in every pocket.' },
  { n: '1 000 000', title: 'First Aid', note: 'Shelters funded by the pack, not by pity.' },
  { n: '∞', title: 'The Pantheon', note: 'Every dog on Earth carries a name that lasts.' },
];

/* ── RECENZIE — PRILEPENÝ OBRAZ (Matej 1. 9. 2026) ──────────────────────────
   *„treba to zmeniť na lepšiu animáciu — možno najprv zobraziť nadpis a text
   na stred obrazovky a potom pri scrole sa rozplynie a tie recenzie budú presne
   na strede obrazovky? lebo teraz je to obyčajný scroll bez fantázie."*

   Do 1. 9. tu stála `TestimonialsSection` ako obyčajná sekcia v AboutLabe a
   nemala žiadnu réžiu — nebolo to nedoladené, bolo to NEDOKONČENÉ: návrh
   prilepeného obrazu ležal hotový v `plany/nakres-po-starwars-2026-08-31.html`
   (slidery `darkOut` / `headIn` / `cardsIn`) a postavila sa z neho len druhá
   polovica, NEXT STEP.

   Tri beaty na jednej prilepenej dráhe. Podiely sú VNÚTRI nej, nie na celom
   filme — tak sa dá dráha predĺžiť bez prepisovania fáz. */
const QUO = {
  /** Nadpis a podnadpis prídu VEĽKÉ a sami — na obrazovke nie je nič iné. */
  headIn: [0.00, 0.16],
  /** A rozplynú sa. Krytie + jemný nárast: text, ktorý sa pri odchode zväčšuje,
   *  čítame ako „prešiel okolo nás", nie ako „zhasol". Žiadny blur — ten na
   *  veľkej ploche zráža snímkovanie a je to presne ten typ vecí, ktorý Matej
   *  pomenoval ako *„seká to"*. */
  headOut: [0.34, 0.50],
  /** Citáty dosadnú do stredu — tam, kde pred chvíľou stál nadpis.
   *  ⚠️ Prekryv s odchodom nadpisu je zámer (0.42 < 0.50): bez neho vznikne
   *  medzi dvoma dejmi prázdna obrazovka a z jedného pohybu sú dva. */
  colsIn: [0.42, 0.66],
  /** Stĺpce nabiehajú po sebe, nie naraz — inak to je jeden blok, ktorý blikol. */
  colStagger: 0.05,
} as const;

/** Dráha recenzií. Za posledným beatom (0.66) ostáva vyše tretiny dráhy, počas
 *  ktorej sa NIČ nemení — a je to zámer: pás sa posúva sám, takže je to jediné
 *  miesto vo filme, kde má človek čo pozerať bez toho, aby scrolloval. */
const QUO_VH = 2.4;

/** Výška hornej lišty v px — tá istá hodnota ako `--op-nav-h` v štýloch nižšie.
 *  ⚠️ CSS premennú číta prehliadač, JS ju tu potrebuje ako číslo; keby sa
 *  čítala cez `getComputedStyle` v každom snímku, je to layout read navyše.
 *  Kto mení `--op-nav-h`, mení aj toto — sú to dve zapísania jedného čísla
 *  a rozídu sa ticho. */
const NAV_H = 124;

/* ── OBLÚK = DVE OBRAZOVKY NA JEDNEJ DRÁHE (prestavané 1. 9. 2026) ──────────
   NEXT STEP a HEROGLYF stoja v tom istom prilepenom javisku, jeden cez druhý,
   a prepína ich PRELÍNAČKA.

   🔴 PREČO NIE DVE SEKCIE POD SEBOU. Matej 31. 8. 2026: *„bez CTA, ďalšia
   obrazovka sa fadne, tu nebude scrol."* Dve sekcie pod sebou to nevedia ani
   so záporným okrajom: v momente, keď prvá odopne, jej obsah odchádza NAHOR —
   a to je scroll, teda presne to, čo sa nemá stať. Jediné javisko s dvoma
   absolútne uloženými obrazovkami dá prelínačku na mieste.

   PACING SA TÝMTO NEZMENIL. Fázy sú podiely VNÚTRI svojej obrazovky (vzor
   `rev`/`nxt` z nákresu), takže NEXT STEP má naďalej presne tých 120vh dráhy,
   na ktorých si ho Matej doladil 31. 8. — nezmenilo sa ani jedno jeho číslo.

   ČO ZANIKLO 31. 8.: výrez do prvej fázy (`op-nxt-lens`, lúče, zväčšený pás)
   a päť zastávok mierky. Dve mierky nad sebou boli to, čo sa malo zjednodušiť. */
const ARC = {
  /** OBRAZOVKA 1 — WE NEED YOU.
   *  🔑 SÚ TO TIE ISTÉ KĽÚČE AKO OBJEKT `WNY` v nákrese
   *  `plany/nakres-weneedyou-film-2026-09-01.html` — prenos je prepis jedného
   *  objektu, ako pri `MEDAL` (nav medailón) a `PUT` (pútnik v /map). Kto chce
   *  obraz doladiť, otvorí nákres, posunie posuvníky a stlačí „Skopíruj
   *  nastavenia"; sem sa vloží výsledok. Ladenie v kóde je krok späť.
   *
   *  ⚠️ ČÍSLA SÚ PERCENTÁ DRÁHY (0–100), nie podiely — presne ako v nákrese.
   *  Réžia si ich delí stom sama.
   *
   *  Čísla nižšie sú Matejovo ladenie z 1. 9. 2026 (osem kôl réžie).
   *
   *  ČO TÝMTO ZANIKLO: `stepIn` / `swap` (NEXT STEP už nie je veľký nadpis,
   *  ktorý sa zmenšuje, a nie je prvý beat, ale desiaty), `titleIn`, `lineIn`,
   *  `stopStagger`, `markIn`, `beIn`, `leadIn`. */
  nxt: {
    /** Dráha obrazu vo `vh`. Pozor: ARC_VH a ARC_SPLIT sa z nej POČÍTAJÚ. */
    vh: 460,
    // 1–3 · faraón
    h0: 100, rise: 10, gmax: 100, grow: 12,
    fade: 20, fadeD: 16, h1: 42, o1: 14,
    // 4–5 · WE · NEED · YOU!
    head: 22, stag: 4, shrink: 42, shrinkD: 8, glow: 42,
    /** 🔴 DVE SADY — PC a mobil (`…M`). Bez nich sa mobil doladí len na úkor
     *  PC; Matej to vytkol menovite. Hranicu drží JEDNO číslo — NARROW_MAX. */
    fillPct: 92, headVh: 46, finSize: 8,
    fillPctM: 96, headVhM: 68, finSizeM: 13,
    // 6 · podtitul
    sub: 52, subFill: 92, subMax: 20,
    // 7 · pás zblízka
    zin: 58, dom0: 100, count: 62, countD: 10,
    midD: 24, pillS: 17, overlap: 52,
    midDM: 15, pillSM: 12,
    // 8 · odchod kamery
    zout: 74, zoutD: 8, minFillPct: 20, hekEnd: 48, headEnd: 34,
    minFillPctM: 20, hekEndM: 34, headEndM: 26,
    // 9 · šípka → NEXT STEP → CTA
    arrow: 82, arrowD: 5, step: 88, cta: 95, ctaD: 5,
    /** Východisková dĺžka nábehu ktoréhokoľvek beatu, ak si nenesie vlastnú. */
    dur: 6,
  },
  /** OBRAZOVKA 2 — HEROGLYF: TRI ALBY. Matej 1. 9. 2026: *„pri ďalšom scrolle
   *  fade in 3 alby a info o tom že vstupenka je unikatnosť."* Prepis
   *  existujúceho `.op-glf` (predtým tri náhodné glyfy) na dôkaz „same name,
   *  different dog, different heroglyph" — tie isté kľúče ako objekt `HGL`
   *  v nákrese `plany/nakres-heroglyf-alba-2026-09-01.html`, ako pri `WNY`.
   *
   *  ⚠️ ČÍSLA SÚ PERCENTÁ DRÁHY (0–100) — obraz má vlastnú dráhu `GLF_VH`,
   *  réžia si ich delí stom sama (funkcia `pg` v réžii nižšie, vzor `nxt.ph`).
   *
   *  ZANIKLO PREPISOM: náhodná trojica glyfov zo steny (`glyphs` state,
   *  `.op-glf-answer`, `.op-glf-row`/`.op-glf-card`, `.op-glf-fact`) —
   *  nahradili ich tri SKUTOČNÉ ALBY (`ALBAS` nižšie), ktoré dokazujú to isté
   *  tvrdenie silnejšie: meno drží konštantné, rozdiel vyskočí sám. */
  glf: {
    dur: 7,
    /* 1–2 · nadpis. 🔴 OD 2. 9. 2026 JE JEDNORIADKOVÝ — „MEET ALBA" (Matej:
       *„na stred obrazovky príde veľkým — meet Alba (bez toho nadpisu čo je
       tam teraz)"*). Dvojriadkový „Dog name isn't unique. Heroglyph is!"
       ZANIKOL. Riadok je jeden zámerne: obmedzením tohto filmu je VÝŠKA okna
       (Matejovo okno je široké a nízke), a dva riadky ju delia napoly —
       na 1000×490 by z toho bol nadpis o polovicu menší, teda nie „veľkým".
       ⚠️ Počet riadkov NIE JE zapísaný číslom: `glfBigSize` si ho berie zo
       skutočného počtu `.ln` (predtým tam stála dvojka natvrdo). */
    head: 2, stag: 7,
    /* headVh 44 → 60: nadpis je od 2. 9. jediný beat na obrazovke, keď je
       veľký, a jednoriadkový. Na širokom okne aj tak rozhoduje šírka
       (fillPct), toto číslo sa prejaví na NÍZKOM okne — presne tam, kde
       „veľkým" chýbalo najviac. */
    fillPct: 92, headVh: 60, finSize: 3.0,
    fillPctM: 96, headVhM: 40, finSizeM: 5.0,
    shrink: 24, shrinkD: 8,
    // 3 · eyebrow „This is Alba."
    eye: 34, eyePx: 15, eyePxM: 11,
    /* 4–6 · tri stĺpce: fotka → meno (+ číslo) → glyf spod mena.
       🔴 `col`/`colM` UŽ NIE SÚ ŠÍRKA STĹPCA, ALE JEJ STROP (2. 9. 2026,
       Matej: *„3 fotky psov (menšie ako sú teraz)… maj na pamäti že obsah
       musí byť centrovaný… musí sa zmestiť ak to nejde treba zmenšiť fotky
       alebo mená psov"*). Skutočnú šírku počíta `glfColPct()` z DOSTUPNEJ
       VÝŠKY — ten istý recept ako `fitGw()` v DOGTRIXe. PC strop klesol
       20 → 15 (to je tá „menšia fotka" na oknách, kde výška nebráni);
       mobilný `colM` ostáva, pokyn padol nad PC obrazovkou a na telefóne
       o výšku aj tak nejde. */
    photo: 42, photoStag: 4, col: 15, colM: 27, nameK: 20,
    name: 54, phZoom: 108,
    glyph: 66, glyphStag: 5, glyphD: 9,
    // 7 · veta o dizajne
    says: 82, saysW: 760, saysPx: 17, saysPxM: 14,
    // 8 · číslo kombinácií (VYPNUTÉ — viď ALBA_CNT)
    cnt2: 92, cntPx: 44, cntPxM: 26,
    // „Same name. Different dog." (VYPNUTÉ — viď ALBA_SAME)
    same2: 62,
  },

  /* ── MOST: Z HEROGLYFU DO EKOSYSTÉMU ──────────────────────────────────
     Matej 2. 9. 2026: *„musíme urobiť ešte jeden medzikrok z alby, niečo
     v zmysle že heroglyf otvára bránu do dogyptu kde nájdeš… asi by stačila
     len jedna otázka na screene — následne by sa vyrojili otázky ktoré si
     dáva každý psíčkar"*.

     🔑 OBRAZOVKA MÁ DVE POLOVICE A DRUHÁ JE PRÁZDNA ZÁMERNE. Najprv brána
     (eyebrow + veta), potom brána ZHASNE a ostane stáť JEDINÁ OTÁZKA. Tá
     otázka nie je pointa tohto obrazu — je to prvá kvapka búrky, ktorá sa
     spustí v nasledujúcom obraze (EKOSYSTÉM, zatiaľ nepostavený). Preto tu
     obraz končí otázkou bez odpovede: odpoveď je za ňou, nie v ňom.

     ⚠️ ZNENIE JE PRVÝ NÁSTREL, NIE LOCK — ladí sa v nákrese (viď zadanie
     `plany/zadanie-onepage-ekosystem-FRESH-SESSION.md`). Alternatívy k vete
     brány aj k otázke sú tam vypísané.

     Dogtrixov dážď pod tým beží ďalej — je to stále ten istý svet, len sa
     v ňom vymenil obsah (Matej: *„slajd MOST kde bude stále dogtrix"*). */
  most: {
    dur: 8,
    // 1 · eyebrow — brána
    eye: 6, eyePx: 15, eyePxM: 11,
    /* 2 · veta brány.
       ⚠️ `capVw` NIE JE „konečná veľkosť po zmenšení" ako `finSize` v ARC.glf —
       tu sa nadpis nezmenšuje, príde rovno vo svojej veľkosti. Je to STROP vo
       `vw`, aby krátka veta na veľmi širokom okne nevyrástla do plagátu. */
    head: 16,
    fillPct: 88, headVh: 30, capVw: 3.6,
    fillPctM: 94, headVhM: 26, capVwM: 6.0,
    // 3 · brána zhasne (eyebrow + veta naraz — je to jeden dej)
    out: 46, outD: 10,
    // 4 · otázka ostane sama
    q: 60, qD: 10,
    qFillPct: 90, qVh: 34, qCapVw: 4.4,
    qFillPctM: 96, qVhM: 30, qCapVwM: 7.0,
  },
} as const;

/** Dráha DRUHEJ obrazovky (heroglyf/ALBA) vo `vh`. Prepis 1. 9. 2026 pridal
 *  osem beatov (nadpis, eyebrow, tri stĺpce, veta) namiesto štyroch prvkov,
 *  takže 140vh, na ktorých sedeli tri náhodné glyfy, by ich stlačilo. Číslo
 *  je `HGL.vh` z nákresu. */
const GLF_VH = 300;

/** Pomer strán vodorovného heroglyfu pod menom (600 × 161 px z Cloudinary,
 *  sústava `HeroglyphFrame` 13100 × 3500). Je to VSTUP DO ROVNICE, ktorou si
 *  trojica počíta šírku stĺpca z dostupnej výšky (`glfColPct`) — bez neho by
 *  sa výška glyfu dala zistiť len meraním po vykreslení, a to je tu zakázaný
 *  kruh (šírka stĺpca určuje výšku glyfu, ktorá určuje šírku stĺpca). */
const GLF_GLYPH_AR = 600 / 161;

/** Deterministické „náhodné" číslo z indexu — pri každom prekreslení musí
 *  vyjsť to isté, inak by sa dážď pri každom resize preskladal. */
const dgxRnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.545; return x - Math.floor(x); };
/** 🔴 PULZ JE VIAZANÝ NA DRÁHU, NIE NA ČAS (Matej 1. 9. 2026: „pred každým
 *  kótovaním musia zasvietiť, zapulzovať"). Obálka `(1-t)` zaručí, že sled
 *  bliknutí vždy DOHORÍ DO PLNÉHO SVETLA. */
const dgxPulseAt = (pc: number, a: number, w: number, n: number) => {
  if (w <= 0) return 1;
  const t = clamp01((pc - a) / w);
  return 1 - (1 - t) * 0.85 * (0.5 + 0.5 * Math.cos(2 * Math.PI * n * t));
};
/** Znenie pilulky podľa zariadenia — hover na mobile neexistuje. */
const DGX_HINT = {
  hover: 'Hover a symbol — it tells you what it means.',
  touch: 'Touch a symbol to read it.',
};

/* ══ DOGTRIX / HEROGLYF — konfigurácia zo zdroja ═══════════════════════════
 * Prenesené z `plany/nakres-heroglyf-dogtrix-2026-09-01.html` (objekt DGX,
 * päť kôl ladenia, 1. 9. 2026). Farby skupín: bordó (staroegyptský červený
 * okker, štvrtý zo skutočných pigmentov vedľa lapisu/zelene/zlata) = pôvod ·
 * lapis = silueta plemena · fialová = charakter · zelená = rámik majiteľa.
 * Zlatá zámerne chýba — na papyruse má kontrast len 2,36:1 a v projekte je
 * to konštrukcia (rám/nav/poloha), nie údaj o psovi. */
const DGX_COL: Record<string, string> = { basics: '#8C2F26', breed: '#16307A', char: '#7A2FBF', own: '#3D7A4E' };

/** Sloty veľkého rámu (vodorovný glyf) — sústava `HeroglyphFrame.tsx`
 *  (`viewBox="800 1100 13100 3500"`). Hektorove hodnoty (`dogs`, pack #1):
 *  king · dark · rescued · mutt · patrón 08-06 · rfo + waterlover · man ·
 *  Rooster · Leo · M · 1. */
const DGX_SLOTS = [
  { k: 'dogGender',  x: 1282,  y: 1620, w: 1348, h: 935,  g: 'basics' },
  { k: 'colour',     x: 3034,  y: 1620, w: 933,  h: 935,  g: 'basics' },
  { k: 'fate',       x: 1282,  y: 2764, w: 1348, h: 1309, g: 'basics' },
  { k: 'bloodline',  x: 2849,  y: 2764, w: 1307, h: 1309, g: 'basics' },
  { k: 'shape',      x: 4375,  y: 1621, w: 3134, h: 2453, g: 'breed'  },
  { k: 'char1',      x: 11236, y: 1620, w: 2172, h: 1117, g: 'char'   },
  { k: 'char2',      x: 11236, y: 2957, w: 2172, h: 1116, g: 'char'   },
  { k: 'ownGender',  x: 7974,  y: 1863, w: 905,  h: 1968, g: 'own'    },
  { k: 'ownChinese', x: 8978,  y: 1866, w: 971,  h: 931,  g: 'own'    },
  { k: 'ownZodiac',  x: 10049, y: 1866, w: 723,  h: 931,  g: 'own'    },
  { k: 'ownInitial', x: 8977,  y: 2895, w: 975,  h: 936,  g: 'own'    },
  { k: 'ownRank',    x: 10049, y: 2898, w: 723,  h: 933,  g: 'own'    },
] as const;
const DGX_VB = { x: 800, y: 1100, w: 13100, h: 3500 };
const dgxPctX = (x: number) => ((x - DGX_VB.x) / DGX_VB.w) * 100;
const dgxPctY = (y: number) => ((y - DGX_VB.y) / DGX_VB.h) * 100;

/** Sloty zvislého rámu (mobil) — sústava `VerticalHeroglyphFrame.tsx`.
 *  Súradnice odpísané zo zdroja (obe sústavy zdieľajú ten istý obrázok). */
const DGX_SLOTS_V = [
  { k: 'dogGender',  x: 898.453,  y: 475,     w: 323.19,  h: 224.091, g: 'basics' },
  { k: 'colour',     x: 1313.13,  y: 475,     w: 224.039, h: 224.091, g: 'basics' },
  { k: 'fate',       x: 898.767,  y: 751.933, w: 322.889, h: 313.596, g: 'basics' },
  { k: 'bloodline',  x: 1268.43,  y: 751.933, w: 313.561, h: 312.991, g: 'basics' },
  { k: 'shape',      x: 898.807,  y: 1116.58, w: 682.7,   h: 534.378, g: 'breed'  },
  { k: 'ownGender',  x: 948.932,  y: 1755.42, w: 188.442, h: 409.417, g: 'own'    },
  { k: 'ownChinese', x: 1157.84,  y: 1756.02, w: 202.167, h: 193.755, g: 'own'    },
  { k: 'ownZodiac',  x: 1380.51,  y: 1756.02, w: 150.407, h: 193.81,  g: 'own'    },
  { k: 'ownInitial', x: 1157.51,  y: 1970.04, w: 202.91,  h: 194.803, g: 'own'    },
  { k: 'ownRank',    x: 1380.51,  y: 1970.62, w: 150.407, h: 193.055, g: 'own'    },
  { k: 'char1',      x: 898.459,  y: 2268.7,  w: 683.547, h: 353.512, g: 'char'   },
  { k: 'char2',      x: 898.459,  y: 2675.15, w: 683.777, h: 353.396, g: 'char'   },
] as const;
const DGX_VB_V = { x: 781.0, y: 329.5, w: 917.9, h: 2844.8 };
const dgxPctXV = (x: number) => ((x - DGX_VB_V.x) / DGX_VB_V.w) * 100;
const dgxPctYV = (y: number) => ((y - DGX_VB_V.y) / DGX_VB_V.h) * 100;

/** Rám a kartuša — cesty odpísané priamo z `HeroglyphFrame.tsx` /
 *  `VerticalHeroglyphFrame.tsx` (druhý, resp. prvý `<path d>`). */
const DGX_D_CART = 'M10870.8,3739.26c-0,104.218 -85.92,188.593 -192.014,188.593l-2610.03,0c-106.146,0 -192.014,-84.375 -192.014,-188.593l0,-1782.66c0,-104.027 85.868,-188.576 192.014,-188.576l2610.03,0c106.094,0 192.014,84.549 192.014,188.576l-0,1782.66Zm-63.542,-2118.37l-2866.96,-0c-116.406,-0 -210.955,95.885 -210.955,214.149l0,2025.78c0,118.264 94.549,214.184 210.955,214.184l2866.96,0c116.354,0 210.747,-95.92 210.747,-214.184l-0,-2025.78c-0,-118.264 -94.393,-214.149 -210.747,-214.149Z';
const DGX_D_FRAME = 'M13628.1,4142.36l-0,-2589.06c-0,-83.629 -67.778,-151.389 -151.424,-151.389l-12261.6,-0c-83.75,-0 -151.545,67.76 -151.545,151.389l-0,2589.06c-0,83.611 67.795,151.406 151.545,151.406l12261.6,0c83.646,0 151.424,-67.795 151.424,-151.406m209.687,-2772.55l0,2956.22c0,98.091 -79.479,177.604 -177.569,177.604l-12628.8,0c-98.125,0 -177.604,-79.513 -177.604,-177.604l-0,-2956.22c-0,-98.16 79.479,-177.604 177.604,-177.604l12628.8,-0c98.09,-0 177.569,79.444 177.569,177.604';
const DGX_D_CART_V = 'M1551.35,2145.5c0,21.678 -17.872,39.229 -39.94,39.229l-542.91,-0c-22.08,-0 -39.941,-17.551 -39.941,-39.229l0,-370.809c0,-21.638 17.861,-39.225 39.941,-39.225l542.91,-0c22.068,-0 39.94,17.587 39.94,39.225l0,370.809Zm-13.217,-440.64l-596.353,0c-24.214,0 -43.881,19.945 -43.881,44.545l0,421.381c0,24.6 19.667,44.552 43.881,44.552l596.353,-0c24.203,-0 43.837,-19.952 43.837,-44.552l0,-421.381c0,-24.6 -19.634,-44.545 -43.837,-44.545Z';
const DGX_D_FRAME_V = 'M1597.58,421.985l-715.32,-0c-20.346,-0 -36.85,16.492 -36.85,36.842l0.075,2586.18c-0,20.392 16.504,36.887 36.845,36.887l715.325,0c20.355,0 36.846,-16.495 36.846,-36.887l-0.075,-2586.18c0,-20.35 -16.491,-36.842 -36.846,-36.842m-759.983,-51.042l804.683,0c23.88,0 43.221,19.338 43.221,43.225l0.075,2675.54c0,23.879 -19.341,43.221 -43.221,43.221l-804.683,-0c-23.879,-0 -43.221,-19.342 -43.221,-43.221l-0.075,-2675.54c0,-23.887 19.346,-43.225 43.221,-43.225';

/** Skupina = jedna kóta. `ax`/`ay` sú kotva vodiča v % z rámu, prepočítané
 *  zo zdroja (`SLOTS`), nie ručne opísané. Vodorovná verzia: skupiny idú
 *  vedľa seba. */
const DGX_GROUPS = [
  { id: 'basics', side: 'up',   ax: 13.9,  row: 0 },
  { id: 'breed',  side: 'down', ax: 39.25, row: 0 },
  { id: 'char',   side: 'up',   ax: 87.95, row: 0 },
  { id: 'own',    side: 'down', ax: 64.89, row: 1, dogma: true },
] as const;
const DGX_ROW_GAP = 7;

/** Zvislá verzia: skupiny idú POD SEBOU. `ay` = stred zvislého rozsahu
 *  skupiny v % `DGX_VB_V` (pre `own` rozsah KARTUŠE, nie jednotlivých
 *  slotov). Poradie v poli je basics·breed·char·own (TO ISTÉ ako `DGX_GROUPS`
 *  a `DGX_KNAME`/`DGX_KTEXT`) — adresuje sa indexom, nie fyzickým poradím
 *  zhora nadol. */
const DGX_GROUPS_V = [
  { id: 'basics', side: 'left',  ay: 15.49, row: 0 },
  { id: 'breed',  side: 'right', ay: 37.06, row: 0 },
  { id: 'char',   side: 'right', ay: 81.52, row: 0 },
  { id: 'own',    side: 'left',  ay: 57.32, row: 0, dogma: true },
] as const;

/** Názov sekcie je STÁLY, mení sa len popisok pod ním. */
const DGX_KNAME = ['ORIGINS', 'BREED', 'CHARACTER', 'AND YOU'];
const DGX_KTEXT = ['Sex · Colour · Origin · Bloodline', 'His patron silhouette', 'Two traits · who he is', 'You live inside his frame.'];

/** Obsah bublín — Hektorove SKUTOČNÉ hodnoty (pes #1). Tri riadky: čo je to
 *  za údaj · aká je hodnota · ako sa tá kresba volá — bez tretieho riadku sa
 *  človek dozvie význam, ale nenaučí sa symbol prečítať inde.
 *  🚩 `fate` OTVORENÉ NA MATEJA: dáta hovoria „rescue ring" (bajt-zhoda
 *  s FATE-RESCUED.svg); Matej ho číta ako „tanier s 3 dierami = frisbee".
 *  Zapísané dáta, nie jeho čítanie — viď report tejto úlohy. */
const DGX_BUB: Record<string, [string, string, string]> = {
  dogGender:  ['Sex', 'Male', "King's crown"],
  colour:     ['Colour', 'Dark', 'Moon'],
  fate:       ['Origin', 'Rescued', 'Rescue ring'],
  bloodline:  ['Bloodline', 'Mutt', 'Bloodline scroll'],
  shape:      ['Breed', 'His patron silhouette', 'Patron silhouette'],
  char1:      ['Character', 'Ready for orders', 'Winged emblem'],
  char2:      ['Character', 'Water lover', 'Water waves'],
  ownGender:  ['You', 'Man', 'Man silhouette'],
  ownChinese: ['Your Chinese sign', 'Rooster', 'Rooster'],
  ownZodiac:  ['Your zodiac', 'Leo', 'Lion'],
  ownInitial: ['Your initial', 'M', 'Initial letter'],
  ownRank:    ['His place in your life', 'Your 1st dog', 'Number one'],
};

/** 20 zvislých heroglyfov psov #1–#20 (dážď = LEN celé heroglyfy, žiadne
 *  samostatné symboly — Matej 1. 9. 2026 zamietol pôvodnú deľbu). */
const DGX_RAIN_IMGS = Array.from({ length: 20 }, (_, i) => `/heroglyph/dogtrix/glyphs/${String(i + 1).padStart(2, '0')}.png`);
/** Pomer strán zvislého heroglyfu (w/h), z `extract-glyphs.py`. */
const DGX_GA = 0.323;
/** Trieda nesie hĺbku dažďa. 🔴 PREDNÉ (veľké) IDÚ POMALŠIE než zadné (malé)
 *  — opak fyzikálnej paralaxy, zámer (Matej 1. 9. 2026): veľký glyf pri
 *  vysokej rýchlosti sa nedá prečítať. */
const DGX_RCLS = [
  { k: 'xs' as const, a: 0.30, v: 1.45 },
  { k: 's'  as const, a: 0.45, v: 1.12 },
  { k: 'm'  as const, a: 0.62, v: 0.85 },
  { k: 'l'  as const, a: 0.82, v: 0.62 },
];
const DGX_HEK_PHOTO = 'https://res.cloudinary.com/dz8lolmod/image/upload/c_fill,g_auto,w_320,h_320,q_auto,f_auto/v1780676154/dogs/hektor/u1pmfdh8hpyctq0tqq5r.jpg';

/** OBRAZOVKA — DOGTRIX. Dážď + dekodér heroglyfu, tretie okno oblúka
 *  `.op-arc` (nxt → dogtrix → alba). Kľúče = objekt `DGX` z nákresu
 *  `plany/nakres-heroglyf-dogtrix-2026-09-01.html` (päť kôl ladenia),
 *  bez dev-only prepínačov (tie sú v produkcii zafixované na odsúhlasenú
 *  hodnotu — `hold:'acc'`, `kotaSkin:'tint'`, `kotaPlace:'auto'`,
 *  `glyphMode:'auto'`, `fall:'none'`, `ktVar:'a'`, `debug` preč).
 *  ⚠️ ČÍSLA SÚ PERCENTÁ DRÁHY (0–100) — réžia si ich delí stom sama. */
const DGX = {
  dur: 7,
  rainFull: 13, rainFadeD: 10, rainA: 82, rainBg: 20,
  speed: 165, goldPct: 22,
  rainGap: 300, narrowK: 40, rainHalo: 8, rainVanish: 55,
  xsW: 26, xsN: 16, sW: 44, sN: 10, mW: 68, mN: 6, lW: 104, lN: 3,
  eye: 16, eyePx: 14, eyePxM: 11,
  head: 22,
  // 🔴 „skusme zmensit nadpis aj heroglyf o 10%" (Matej 2. 9. 2026, po druhom
  //    pozreti naziva na jeho okne 1000x490). Nadpis: 8.0 -> 7.2 vw.
  //    Glyf nesie ten isty desatinu `gwK` nizsie — a NIE znizenim `gw`,
  //    lebo na nizkom okne `gw` vobec nerozhoduje (vid komentar pri `gwK`).
  fillPct: 92, headVh: 38, finSize: 6.48,
  fillPctM: 96, headVhM: 32, finSizeM: 13,
  shrink: 32, shrinkD: 8,
  rule: 30, rulePx: 18, rulePxM: 14,
  // Medzera PODNADPISU k nadpisu, vo `vh` (číta ju `.dgx-b-rule > .op-bin`
  // v štýloch nižšie a rozpočet výšky vo `fitGw`). Pôvodne 1. 9. 2026 (Matej:
  // „podnadpis bližšie k nadpisu") kleslo z 1.8 na 0.4 — a 2. 9. 2026, po
  // prvom naživo pozretí, sa to OTOČILO späť („podnadpis je moc prilepený
  // na nadpis, daj mu trošku priestor"). 1.0 je vedomý kompromis medzi
  // oboma: „trošku" priestoru, nie plný návrat na spoločných 1.8.
  subGap: 1.0,
  halo: 88,
  glyph: 33, glyphD: 8, gw: 70, gwM: 96, gwV: 33, gZoom: 108,
  /* 🔴 DESATINA DOLE Z VYSLEDNEJ VELKOSTI GLYFU (Matej 2. 9. 2026).
     ⚠️ Preco NIE `gw: 70 -> 63`: `fitGw` vracia `min(sirkovy strop, vyskovy
     strop)` a na Matejovom okne (1000x490) VYHRAVA VYSKOVY — realne sa
     kresli ~54 %, nie 70. Znizenie `gw` by tam teda neurobilo nic, a
     zmensenie nadpisu by glyf dokonca ZVACSILO (uvolni sa vyska, rozpocet
     narastie). Preto sa desatina berie z VYSLEDKU — sedi na oboch vetvach.
     Plati len na PC (vodorovny glyf): mobilna `gwV` je odmerany strop z
     1. 9. a Matej mobil pri tomto pokyne nevidel. */
  gwK: 0.81,
  kota: 42, kotaStag: 12, kotaD: 5, lead: 8,
  pulseW: 4, pulseN: 3,
  kNamePx: 34, kNamePxM: 22,
  kPx: 12, kPxM: 9, kPx2: 13, kPx2M: 11, glow: 8,
  kotaEdge: 8, overHalo: 70,
  holdGap: 2, offD: 3,
  hintD: 4, hintPx: 11.7, hintPxM: 11,
  hint: 96,
  /* 🔴 „zmensi fotku a meno - pod heroglyfom (obsah) o 15%" (Matej 2. 9. 2026).
     PC hodnoty × 0.85: fp 68→57.8 · ns 25→21.25 · rls 11→9.35.
     Mobilne (`fpM`/`nsM`/`rlsM`) ostavaju — pokyn padol nad PC obrazovkou,
     rovnako ako pri `gwK`. `sgap` (medzera fotka↔text) sa nedeli: nema
     mobilny variant, takze by zmena zasiahla aj telefon, a ide o 2 px. */
  sig: 92, sigD: 4, fp: 52.0, fpM: 56, ns: 19.1, nsM: 21, sgap: 14, rls: 8.4, rlsM: 9,
} as const;

/** Dráha obrazu DOGTRIX vo `vh` (`DGX.vh` z nákresu). */
const DOGTRIX_VH = 340;
/** Dĺžka DRUHÉHO odovzdania (dogtrix → alba) vo `vh`.
 *  🔴 UŽ TO NIE JE PRELÍNAČKA, ALE POSUN (2. 9. 2026). Matej: *„pokračujeme
 *  ďalší slajd (ALBA) nabehne tak že dogtrix stále beží bez zmeny… obsah
 *  heroglyfu sa posunie doľava — na stred obrazovky príde veľkým meet Alba"*.
 *  DOGTRIX teda nezhasína: jeho dážď beží ďalej ako pozadie celého obrazu
 *  ALBA a odchádza len jeho OBSAH (beaty), vodorovne doľava. Číslo ostalo
 *  rovnaké — je to dĺžka toho pohybu. */
const ARC_XFADE2_VH = 24;

/** O koľko šírok okna odíde OBSAH DOGTRIXu doľava, kým sa uvoľní stred pre
 *  „MEET ALBA". Vo `vw`, nie v percentách vlastnej šírky — vo `vw` prejdú
 *  všetky prvky obrazovky rovnakú dráhu a zmiznú naraz. 110 je šírka okna
 *  plus rezerva: najširší prvok (vodorovný glyf, `gw` až 70 %) siaha po
 *  ~95 vw, takže po posune leží celý za ľavým okrajom. */
const DGX_SLIDE_VW = 110;


/** 🔴 KOĽKO SCROLLU STOJÍ HOTOVÝ OBRAZ BEZ JEDINEJ ZMENY.
 *  Matej 1. 9. 2026: *„mám pocit, že preletím cez túto sekciu a nestihnem CTA
 *  prečítať… po doscrole nasledoval snipet na celú obrazovku, až následný scrol
 *  premení obrazovku."*
 *
 *  Predtým tu stálo 12vh a bola to chyba v rozpočte, nie vo vkuse: CTA dobieha
 *  na 100 % dráhy obrazu, takže od okamihu, keď je celé vidieť, po začiatok
 *  prelínačky ostávala **tretina obrazovky**. Jeden bežný ťah kolieskom je
 *  viac — človek teda cez hotový obraz preletel bez toho, aby ho zastihol.
 *
 *  120vh je VIAC NEŽ JEDNA OBRAZOVKA zámerne: nech ťah, ktorý začne na
 *  dobehnutom CTA, skončí ešte stále v ňom. Tým doslova platí „až následný
 *  scroll premení obrazovku".
 *  ⚠️ Nie je to spomalenie deja — počas výdrže sa NEHÝBE NIČ. Je to tá istá
 *  vec, akú robí pás recenzií: miesto, kde má človek čo pozerať bez scrollovania. */
const ARC_HOLD_VH = 120;

/** 🔴 TÁ ISTÁ CHYBA, DRUHÝ OBRAZ (2. 9. 2026). Matej po prvom naživo pozretí
 *  DOGTRIXu: *„opäť pri konci ľahko človek prebehne preč bez toho aby si
 *  stihol prečítať záver slajdu"* — presne to, čo `ARC_HOLD_VH` vyššie riešilo
 *  pre WE NEED YOU, len o obraz ďalej. DOGTRIX dobiehal na koniec svojho `dp`
 *  (kóty, potom čierny klikateľný glyf s pilulkou) a HNEĎ ZA TÝM začínala
 *  prelínačka na ALBU — žiadna výdrž, žiadne odpočívadlo. Rovnaký princíp,
 *  rovnaké číslo: viac než jedna obrazovka, aby ťah, ktorý začne na
 *  dobehnutom glyfe, skončil ešte v ňom. */
const ARC_HOLD2_VH = 120;

/** 🔴 TÁ ISTÁ CHYBA TRETÍKRÁT — a tentoraz nájdená výpočtom, nie na živej
 *  stránke. ALBA dobiehala PRESNE na konci celého oblúka (`gp` = 1 až v jeho
 *  poslednom pixeli), takže výdrž nemala žiadnu: ťah kolieskom, ktorý ju
 *  dopísal, ju rovno aj odviezol preč. Kým bola posledná, prekrylo to
 *  odpočívadlo za sekciou; s MOSTOM za ňou by to bola tá istá porucha, akú
 *  Matej dvakrát vytkol (`ARC_HOLD_VH`, `ARC_HOLD2_VH`). Rovnaké číslo. */
const ARC_HOLD3_VH = 120;

/** Dĺžka TRETIEHO odovzdania (ALBA → MOST) vo `vh`. To isté číslo aj tá istá
 *  mechanika ako pri druhom: obsah ALBY odchádza VODOROVNE doľava, dážď pod
 *  ním beží ďalej. Je to gramatika, ktorú si obraz už zaviedol — nový spôsob
 *  odchodu by v jednom javisku znamenal dve pravidlá pre tú istú vec. */
const ARC_XFADE3_VH = 24;

/** Dráha MOSTA vo `vh`. Nesie dva beaty a medzi nimi zhasnutie, takže je
 *  kratší než plnohodnotný obraz, ale dlhší než prelínačka — otázka na konci
 *  musí ostať stáť dosť dlho na to, aby si ju človek prečítal skôr, než ju
 *  odvezie ďalší obraz. */
const MOST_VH = 260;

/** Dĺžka odovzdania medzi obrazovkami vo `vh`. */
const ARC_XFADE_VH = 24;

/** Celá dráha oblúka vo `vh`. Sčítanie, nie odhad — a všetkých SEDEM dielov
 *  je v ňom, takže si navzájom neujedajú.
 *  ⚠️ TOTO BOLA TICHÁ CHYBA: kým sa výdrž a prelínačka počítali len z
 *  (nxt + glf), obe sa odkrajovali z dráhy HEROGLYFU — ten mal na papieri
 *  140vh a v skutočnosti 104.
 *  🔴 TRETIA OBRAZOVKA (DOGTRIX, 1. 9. 2026): oblúk mal dve obrazovky a
 *  JEDEN zlom (`nxt → glf`) — DOGTRIX sa vkladá MEDZI ne, takže pribudol
 *  druhý diel dráhy (`DOGTRIX_VH`) aj druhé odovzdanie (`ARC_XFADE2_VH`),
 *  nie prepis existujúcich čísel. `ARC_XFADE2_VH` znovupoužíva rovnakú
 *  dĺžku ako prvé odovzdanie — nákres pre ňu vlastné číslo nemal.
 *  🔴 SIEDMY DIEL (2. 9. 2026): `ARC_HOLD2_VH`, DOGTRIXOVA VLASTNÁ VÝDRŽ —
 *  pripočítaná, nie odkrojená zo susedov (presne poučenie z prvej vety
 *  vyššie, tentoraz aplikované vopred). */
const ARC_TOTAL_VH = ARC.nxt.vh + ARC_HOLD_VH + ARC_XFADE_VH + DOGTRIX_VH + ARC_HOLD2_VH + ARC_XFADE2_VH + GLF_VH
  // 🔴 DESIATY DIEL (2. 9. 2026): výdrž ALBY, tretie odovzdanie a MOST —
  // opäť PRIPOČÍTANÉ, nie odkrojené zo susedov. Tretíkrát to isté poučenie.
  + ARC_HOLD3_VH + ARC_XFADE3_VH + MOST_VH;

/** Dĺžka celej sekcie v násobkoch okna.
 *  🔴 POČÍTA SA, NEPÍŠE. Použiteľná dráha prilepenej sekcie je (ARC_VH − 1)
 *  obrazoviek — javisko je prilepené a odchádza až s koncom sekcie. Predtým tu
 *  stálo 3.6 a NEXT STEP z toho dostal 120vh; obraz WE NEED YOU ich potrebuje
 *  460 (nákres). Kto zmení ktorýkoľvek diel vyššie, sem siahať nemusí. */
const ARC_VH = 1 + ARC_TOTAL_VH / 100;

/** Kde na tej dráhe končí WE NEED YOU a začína jeho výdrž.
 *  🔴 ČÍSLO NIE JE VKUS a nie je ani opísané: je to podiel, ktorý z dielov
 *  vyplynie. Predtým tu stálo 0.46 a komentár k nemu žiadal ručný prepočet
 *  pri každej zmene ARC_VH — teraz sa prepočíta sám. */
const ARC_SPLIT = ARC.nxt.vh / ARC_TOTAL_VH;

/** 🔴 PRVÁ OBRAZOVKA MUSÍ STÁŤ HOTOVÁ, KÝM SA ZAČNE HASIŤ.
 *  Pôvodne to bola poistka na pár vh (posledný prvok sa objavoval súčasne
 *  s prelínačkou, takže ho nebolo vidieť ani raz naplno). Od 1. 9. 2026 je to
 *  plnohodnotný beat filmu — viď ARC_HOLD_VH. */
const ARC_DWELL = ARC_HOLD_VH / ARC_TOTAL_VH;

/**
 * Dĺžka prechodu medzi obrazovkami, v podiele CELEJ dráhy.
 *
 * 🔴 NIE JE TO SÚBEŽNÁ PRELÍNAČKA, ALE ODOVZDANIE — prvá zhasne, obrazovka je
 * na okamih holý papyrus a až potom nabehne druhá. Skúšaná bola aj súbežná
 * a bola to CHYBA: obe obrazovky sú stredom centrované stĺpce, ale ich prvky
 * ležia v inej výške, takže veta „— write your dog into it." prechádzala presne
 * cez nadpis JOIN THE MISSION. Dva texty na sebe sa nečítajú ako prelínačka,
 * ale ako chyba vykreslenia.
 *
 * Prázdny okamih tu NIE JE diera, ktorú nákres zakazoval — tá vzniká vtedy, keď
 * je obrazovka prázdna DLHO. Tu trvá zlomok dráhy a predchádza mu výdrž, počas
 * ktorej si človek CTA prečítal. Papyrus pod tým beží nepretržite, takže sa
 * nikam „neskočí".
 */
const ARC_XFADE = ARC_XFADE_VH / ARC_TOTAL_VH;

/** Podiel dráhy DOGTRIX (druhá obrazovka oblúka) z CELKU — rovnaký princíp
 *  ako `ARC_SPLIT`/`ARC_DWELL` vyššie. */
const ARC_DGX_F = DOGTRIX_VH / ARC_TOTAL_VH;

/** DOGTRIXOVA VLASTNÁ VÝDRŽ, v podiele CELEJ dráhy — dvojča `ARC_DWELL`
 *  o obrazovku ďalej (viď `ARC_HOLD2_VH`). */
const ARC_DWELL2 = ARC_HOLD2_VH / ARC_TOTAL_VH;

/** Dĺžka DRUHÉHO odovzdania (DOGTRIX → ALBA), v podiele CELEJ dráhy —
 *  dvojča `ARC_XFADE` o obrazovku ďalej. */
const ARC_XFADE2 = ARC_XFADE2_VH / ARC_TOTAL_VH;

/** Podiel dráhy ALBY (tretia obrazovka) z CELKU — predtým implicitné ako
 *  `1 - handover`, teraz explicitné meno, lebo `handover` je dnes DVA body. */
const ARC_GLF_F = GLF_VH / ARC_TOTAL_VH;

/** ALBINA VLASTNÁ VÝDRŽ, v podiele CELEJ dráhy — trojča `ARC_DWELL`
 *  a `ARC_DWELL2` o obrazovku ďalej (viď `ARC_HOLD3_VH`). */
const ARC_DWELL3 = ARC_HOLD3_VH / ARC_TOTAL_VH;

/** Dĺžka TRETIEHO odovzdania (ALBA → MOST), v podiele CELEJ dráhy. */
const ARC_XFADE3 = ARC_XFADE3_VH / ARC_TOTAL_VH;

/** Podiel dráhy MOSTA (štvrtá obrazovka) z CELKU. */
const ARC_MOST_F = MOST_VH / ARC_TOTAL_VH;

/** Kde DOGTRIX dobehne svoje vlastné písanie (kóty, čierny klikateľný
 *  glyf) a začína jeho výdrž — v RAW `vh`, tá istá súradnicová sústava, akú
 *  používa `.op-arc-rest` (`top: ARC.nxt.vh`). O jednu obrazovku ďalej. */
const ARC_REST2_VH = ARC.nxt.vh + ARC_HOLD_VH + ARC_XFADE_VH + DOGTRIX_VH;

/** To isté o obraz ďalej — ALBA dopísala tri glyfy aj výzvu a začína jej
 *  výdrž. Sčítanie, nie opísané číslo: kto zmení ktorýkoľvek diel vyššie,
 *  sem siahať nemusí. */
const ARC_REST3_VH = ARC_REST2_VH + ARC_HOLD2_VH + ARC_XFADE2_VH + GLF_VH;

/** Koniec priamky = severka. Dopočítaný, nie opísaný — to isté číslo, aké
 *  nesie zoznam míľnikov.
 *
 *  🔴 ZANIKLA TU ZVISLÁ ZNAČKA `ARC_STOPS` a s ňou aj lock, ktorý pri nej stál
 *  („značka stojí na SVOJOM SKUTOČNOM MIESTE… posunúť ju by znamenalo
 *  nakresliť 36 000 psov namiesto 72"). NEOBCHÁDZA SA — PREPISUJE SA, a
 *  s Matejovým citátom, lebo obraz ho vedome porušuje:
 *  *„aj na tom zoom oute bude progres trochu klamlivý, aspoň 1 cm vyplnené,
 *  nech je tam vidno kúsok modrým, nie len bodka na začiatku"* (1. 9. 2026)
 *  a *„tie psy musia predstavovať max 20 % z progresbaru"*.
 *  Podlaha výplne je preto 20 % ŠÍRKY PÁSU (`minFillPct`) a tvrdí tým
 *  ~200 000 psov namiesto dnešných sedemdesiatich dvoch.
 *  ⚠️ Podiel, nie pixely: v pixeloch zabralo to isté číslo na mobilnej
 *  tretinovej osi polovicu pásu.
 *  ⚠️ Pravdu drží zvyšok obrazu — mierka osi sa mení logaritmicky a ani
 *  počítadlo, ani menovka posledného psa neklamú ani raz. */
const GOAL_TARGET = Number(MILESTONES[3].n.replace(/\D/g, '')) || 1000000;

/** 🔴 JEDNO ČÍSLO PRE CSS AJ JS. Obraz má dve sady rozmerov (PC a mobil) a
 *  hranicu medzi nimi číta réžia (`innerWidth`) aj štýl (`@media`). Dve rôzne
 *  hranice vyrobia pásmo šírok bez pravidiel — je to zapísaná lekcia
 *  (feedback_jeden_breakpoint_css_aj_js), nie opatrnosť. */
const NARROW_MAX = 768;

/** Prepínač z nákresu (`WNY.fin`). Pri `false` obraz končí tlačidlom; pri
 *  `true` sa za ním ešte objaví „All you can do is —" + voľné miesto #74.
 *  Matej ho k 1. 9. 2026 nechal VYPNUTÝ, takže veta cez dve obrazovky zanikla.
 *  Heroglyf (obraz ALBA) dnes začína vlastným nadpisom, nie dopovedaním. */
const ARC_TAIL = false as boolean;

/** Koľko uzlov má bazén psov v modrom úseku. Číslo je strop, nie počet — koľko
 *  ich je naozaj vidieť, závisí od šírky úseku a mení sa každý snímok. */
const MID_POOL = 26;

/** Náhľad fotky psa. Do pásu ide kruh s priemerom 24–48 px, takže plná fotka
 *  z Cloudinary (často 2–4 MB) by tam bola dvadsaťnásobne predimenzovaná —
 *  a tých fotiek je na obrazovke naraz dvadsaťosem. `g_auto` drží psa v strede
 *  výrezu, `f_auto` vyberie formát podľa prehliadača. */
const cldThumb = (u: string) =>
  u.replace('/upload/', '/upload/c_fill,g_auto,w_180,h_180,q_auto,f_auto/');

/** 🔴 TRI SKUTOČNÉ ALBY ZO STENY (`get-grid-dogs`, snímka 1. 9. 2026) —
 *  obraz tvrdí, že tri psy s tým istým menom majú tri rôzne glyfy; vymyslené
 *  obrázky by ho robili nepravdivým presne v tej veci, o ktorej hovorí.
 *  ⚠️ Sú to JEDINÉ tri psy s tým istým menom v celej svorke — ďalšie
 *  opakované mená majú len po dvoch (DAISY, MIA, SIMBA, LABKA), takže ak by
 *  ALBA vypadla, obraz o troch stĺpcoch nemá z čoho vzniknúť. Hardcoded
 *  zámerne (nie fetch) — tie isté tri URL, aké odsúhlasil Matej v nákrese
 *  `plany/nakres-heroglyf-alba-2026-09-01.html`. */
const ALBAS = [
  { n: 43,
    photo: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1784216321/tmp/2985ba34-7a97-44e8-993f-5d1c21a703be/main_crop.webp',
    glyph: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1784216804/heroglyphs/cs_live_a1wTtND9fWvjRCEg4iKQCC2wxmkdTSOZYPgeGIHcvYRVpd0Ypvuxdleajc.png' },
  { n: 59,
    photo: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1785841680/tmp/0bf4933e-222e-4402-a46c-92604554534e/main_crop.webp',
    glyph: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1785841967/heroglyphs/cs_live_b15gG68r7JAFiffwBORhcdhSSIsX2N6fQ869yNNybAheiArp5qZ5j3m4Sk.png' },
  { n: 61,
    photo: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1786437529/tmp/6c423ceb-76fa-408d-9fd8-420fcff1d66b/main_crop.png',
    glyph: 'https://res.cloudinary.com/dz8lolmod/image/upload/v1786438287/heroglyphs/cs_live_b19NQNaAzwyfMcnLvVjUl3Fw9Mo4GCl44VcwRp9tgzLpAB1WYzgRtmAQWV.png' },
] as const;
/** Fotka do štvorca 420 px — plná fotka z Cloudinary má často 2–4 MB. */
const cldPhoto = (u: string) => u.replace('/upload/', '/upload/c_fill,g_auto,w_420,h_420,q_auto,f_auto/');
const cldGlyph = (u: string) => u.replace('/upload/', '/upload/c_fit,w_600,q_auto,f_auto/');

/** Riadok „Same name. Different dog." pod trojicou — Matej 1. 9. 2026 ho
 *  nechal VYPNUTÝ (tri rovnaké mená nad tromi rôznymi psami to už povedali).
 *  Kód ostáva, prepínač ho vráti. */
const ALBA_SAME = false as boolean;
/** Číslo kombinácií pod vetou o dizajne — Matej 1. 9. 2026: „ten spodný
 *  riadok s číslom dajme preč… určite uchovajme údaj, možno niekde
 *  využijeme." */
const ALBA_CNT = false as boolean;

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
  /** Je rozbaľovacia navigácia obrazov otvorená? */
  const [menuOpen, setMenuOpen] = useState(false);
  const sceneNavRef = useRef<HTMLDivElement>(null);
  /** Zmerané výšky obrazov — dve čísla na obraz, viď `FILM_SLIDES`.
   *  ⚠️ MERIA SA MIMO SCROLLOVÉHO SNÍMKU. Scroll handler nižšie zapisuje
   *  CSS premenné do prvkov; čítanie rozloženia (`getBoundingClientRect`)
   *  hneď za zápisom vynúti prepočet a je to presne ten druh veci, ktorý
   *  Matej pomenoval ako *„seká to"*. Tabuľka sa preto plní len pri zmene
   *  rozmerov a výšky obsahu, a handler už len číta hotové čísla. */
  const slideAtRef = useRef<number[]>([]);
  const slideFromRef = useRef<number[]>([]);
  const [dogCount, setDogCount] = useState<number | null>(null);
  /** SVORKA PRE PÁS — skutočné fotky, mená a čísla zo steny (Matej 1. 9. 2026:
   *  *„fotky, ktoré sa rolujú, je vidno, že to nie sú len psy… ale aj foto zo
   *  stránky"*). Zástupné zábery z `about-slides/` tým zanikli: pás tvrdí, že
   *  toto sú naozaj tí ľudia, ktorí sa pridali, a vymyslené fotky by ho robili
   *  nepravdivým presne v tej veci, o ktorej hovorí.
   *  ⚠️ Len psy S FOTKOU — kruh bez obrázka je diera v zhluku. */
  const [pack, setPack] = useState<{ n: number; name: string; u: string }[]>([]);

  // 🔴 Choreografia beží v efekte s prázdnym poľom závislostí, takže vnútri
  // vidí `dogCount` navždy ako null. Značka „tu môžeš byť ty" by preto zamrzla
  // na nule aj potom, čo číslo dorazí. Ref + jedno prekreslenie po príchode.
  const dogCountRef = useRef<number | null>(null);
  // To isté pre svorku: réžia pásu ju potrebuje každý snímok, ale beží v efekte
  // s prázdnym poľom závislostí a videla by ju navždy prázdnu.
  const packRef = useRef<{ n: number; name: string; u: string }[]>([]);

  // ── DOGTRIX: postavenie (dážď + glyf + kóty + interaktivita) ──────────────
  // Mount-once efekt: buduje canvas dážď, poskladá SVG glyf zo SLOTS a kóty,
  // zapojí hover/klik na sloty. Časovú os (opacity/pozíciu podľa scrollu)
  // dostáva zvonku cez `dgxApiRef.current.draw(dp)`, volané z hlavného
  // choreografického efektu nižšie — tá istá deľba ako pri zvyšku filmu:
  // TOTO postaví štruktúru raz, HLAVNÝ efekt ňou hýbe pri každom snímku.
  const dgxRootRef = useRef<HTMLDivElement | null>(null);
  const dgxApiRef = useRef<{ draw: (dp: number) => void } | null>(null);

  useEffect(() => {
    const sec = dgxRootRef.current;
    if (!sec) return;
    const root = sec;
    const cv = root.querySelector<HTMLCanvasElement>('.dgx-rain');
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    const el = {
      eye: root.querySelector<HTMLElement>('.dgx-b-eye'),
      head: root.querySelector<HTMLElement>('.dgx-b-head'),
      rule: root.querySelector<HTMLElement>('.dgx-b-rule'),
      glf: root.querySelector<HTMLElement>('.dgx-b-glf'),
      sig: root.querySelector<HTMLElement>('.dgx-b-sig'),
      hint: root.querySelector<HTMLElement>('.dgx-b-hint'),
    };
    const eyeEl = root.querySelector<HTMLElement>('.dgx-eye');
    const h2 = root.querySelector<HTMLElement>('.dgx-h2');
    const line = h2?.querySelector<HTMLElement>('.ln') ?? null;
    const ruleEl = root.querySelector<HTMLElement>('.dgx-rule');
    const gwrap = root.querySelector<HTMLElement>('.dgx-gwrap');
    const gbox = root.querySelector<HTMLElement>('.dgx-gbox');
    const sigWrap = root.querySelector<HTMLElement>('.dgx-sig');
    const sigNm = root.querySelector<HTMLElement>('.dgx-signm');
    const sigRl = root.querySelector<HTMLElement>('.dgx-sigrole');
    const sigPh = root.querySelector<HTMLImageElement>('.dgx-sigph img');
    const hint = root.querySelector<HTMLElement>('.dgx-khint');
    const bubHost = sec;
    if (!eyeEl || !h2 || !line || !ruleEl || !gwrap || !gbox || !sigWrap
        || !sigNm || !sigRl || !sigPh || !hint) return;
    sigPh.src = DGX_HEK_PHOTO;

    // ── GLYF: inline SVG poskladaný zo SLOTS ────────────────────────────────
    // 🔴 SKLADÁ SA ZO SVG, NIE Z PNG — rozsvietiť jeden slot znamená mať ho
    // ako samostatný prvok, na plochom obrázku (PNG/PDF) to nejde.
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'dgx-gsvg');
    gbox.appendChild(svg);
    // Farebná kópia vzniká filtrom (feFlood + feComposite in="SourceAlpha")
    // — CSS `fill` na externý `<image>` nesiaha, je to samostatný dokument.
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = Object.entries(DGX_COL).map(([g, c]) => `
      <filter id="dgx-t-${g}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
        <feFlood flood-color="${c}" result="f"/>
        <feComposite in="f" in2="SourceAlpha" operator="in"/>
      </filter>`).join('');
    svg.appendChild(defs);
    const gGlyph = document.createElementNS(NS, 'g');
    svg.appendChild(gGlyph);

    const mk = (tag: string, attrs: Record<string, string>) => {
      const node = document.createElementNS(NS, tag) as SVGElement;
      for (const k in attrs) node.setAttribute(k, attrs[k]);
      return node;
    };

    type Piece = { node: SVGElement; g: string | null };
    type KLine = {
      id: string; side: string; dogma?: boolean; row: number; i: number;
      li: HTMLDivElement; lab: HTMLDivElement; nameEl: HTMLElement; descEl: HTMLElement;
      edgeT?: number; edgeB?: number; edgeL?: number; edgeR?: number;
      ay?: number; ax?: number; lineFull?: number;
    };
    let pieces: Piece[] = [];
    let tints: Record<string, SVGElement[]> = {};
    let tintOf: Record<string, SVGElement> = {};
    let hitOf: Record<string, SVGElement> = {};
    let hoverKey: string | null = null;
    let cartTNode: SVGElement | null = null;
    let K: KLine[] = [];
    let curVertical: boolean | null = null;
    let dgxOver = false;

    // ── KÓTY: vodič + popisok, bez rámika (Matej 1. 9. 2026: „iba kótu
    // a vysvietil symbol" — svetlo JE značka, rámik by to povedal druhýkrát) ──
    const buildKoty = (vertical: boolean) => {
      K.forEach((k) => { k.li.remove(); k.lab.remove(); });
      const GR = vertical ? DGX_GROUPS_V : DGX_GROUPS;
      const SL = vertical ? DGX_SLOTS_V : DGX_SLOTS;
      K = GR.map((g, i) => {
        let members: { l?: number; r?: number; t?: number; b?: number };
        if (vertical) {
          members = g.id === 'own'
            ? { l: dgxPctXV(897.899), r: dgxPctXV(897.899 + 684.071) }
            : (() => {
                const ss = SL.filter((s) => s.g === g.id);
                return { l: Math.min(...ss.map((s) => dgxPctXV(s.x))),
                         r: Math.max(...ss.map((s) => dgxPctXV(s.x + s.w))) };
              })();
        } else {
          members = g.id === 'own'
            ? { t: dgxPctY(1620), b: dgxPctY(1620 + 2310) }
            : (() => {
                const ss = SL.filter((s) => s.g === g.id);
                return { t: Math.min(...ss.map((s) => dgxPctY(s.y))),
                         b: Math.max(...ss.map((s) => dgxPctY(s.y + s.h))) };
              })();
        }
        const li = document.createElement('div');
        li.className = 'kline' + (vertical ? ' kline--h' : '');
        li.style.background = DGX_COL[g.id];
        if (vertical) {
          li.style.top = g.ay + '%';
          if (g.side === 'left') li.style.right = `calc(100% - ${members.l}%)`;
          else li.style.left = `${members.r}%`;
        } else {
          li.style.left = g.ax + '%';
          if (g.side === 'up') li.style.bottom = `calc(100% - ${members.t}%)`;
          else li.style.top = `${members.b}%`;
        }
        const lab = document.createElement('div');
        lab.className = 'klab' + (g.dogma ? ' dogma' : '');
        lab.style.color = DGX_COL[g.id];
        if (vertical) lab.style.top = g.ay + '%';
        else lab.style.left = g.ax + '%';
        const nameEl = document.createElement('b'); nameEl.className = 'kname';
        const descEl = document.createElement('i'); descEl.className = 'kdesc';
        lab.append(nameEl, descEl);
        gbox.append(li, lab);
        return {
          ...g, li, lab, nameEl, descEl, i,
          ...(vertical ? { edgeL: members.l, edgeR: members.r } : { edgeT: members.t, edgeB: members.b }),
        } as KLine;
      });
    };

    // ── GLYF: stavia sa v DVOCH PODOBách (vodorovný PC / zvislý mobil),
    // len keď sa `vertical` OPROTI MINULÉMU BEHU ZMENILO. ─────────────────
    const buildGlyph = (vertical: boolean) => {
      if (curVertical === vertical) return;
      curVertical = vertical;
      hoverKey = null;
      while (gGlyph.firstChild) gGlyph.removeChild(gGlyph.firstChild);

      const SL = vertical ? DGX_SLOTS_V : DGX_SLOTS;
      const box = vertical ? DGX_VB_V : DGX_VB;
      svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);

      pieces = []; tints = {}; for (const g in DGX_COL) tints[g] = []; tintOf = {}; hitOf = {};

      // Ink priamo (nie CSS premenná) — rám a čierna kartuša sa nemenia,
      // netreba ich prehadzovať cez custom property.
      const frame = mk('path', { d: vertical ? DGX_D_FRAME_V : DGX_D_FRAME, fill: '#2a1608' });
      const cartB = mk('path', { d: vertical ? DGX_D_CART_V : DGX_D_CART, fill: '#2a1608' });
      const cartT = mk('path', { d: vertical ? DGX_D_CART_V : DGX_D_CART, fill: DGX_COL.own, class: 'tint' });
      gGlyph.append(frame, cartB, cartT);
      pieces.push({ node: frame, g: null }, { node: cartB, g: 'own' }, { node: cartT, g: 'own' });
      tints.own.push(cartT);
      cartTNode = cartT;

      for (const s of SL) {
        const a = { x: String(s.x), y: String(s.y), width: String(s.w), height: String(s.h),
                    preserveAspectRatio: 'xMidYMid meet', href: `/heroglyph/dogtrix/hek/${s.k}.svg` };
        const base = mk('image', a);
        const tint = mk('image', a); tint.setAttribute('class', 'tint');
        (tint as unknown as HTMLElement).style.filter = `url(#dgx-t-${s.g})`;
        gGlyph.append(base, tint);
        tints[s.g].push(tint);
        pieces.push({ node: base, g: s.g }, { node: tint, g: s.g });
        tintOf[s.k] = tint;

        const hit = mk('rect', { class: 'hit', x: String(s.x), y: String(s.y), width: String(s.w), height: String(s.h) });
        gGlyph.append(hit);
        hitOf[s.k] = hit;
        hit.addEventListener('pointerenter', () => { hoverKey = s.k; dgxApiRef.current?.draw(lastDp); });
        hit.addEventListener('pointerleave', () => { hoverKey = null; dgxApiRef.current?.draw(lastDp); });
        hit.addEventListener('click', () => { hoverKey = hoverKey === s.k ? null : s.k; dgxApiRef.current?.draw(lastDp); });
      }

      buildKoty(vertical);

      let pend = gGlyph.querySelectorAll('image').length;
      gGlyph.querySelectorAll('image').forEach((im) => {
        im.addEventListener('load', () => {
          if (--pend === 0) { fitKotaScale(window.innerWidth <= NARROW_MAX, curVertical as boolean); dgxApiRef.current?.draw(lastDp); }
        }, { once: true });
      });
    };

    const bub = document.createElement('div');
    bub.className = 'bub';
    bubHost.appendChild(bub);

    // ── DÁŽĎ: vlastný rAF, čas v sekundách — scroll mu riadi len krytie ─────
    const imgs: HTMLImageElement[] = DGX_RAIN_IMGS.map((s) => { const im = new Image(); im.src = s; return im; });
    type Drop = { x: number; w: number; h: number; v: number; a: number; span: number; y0: number; seed: number; gap: number };
    let drops: Drop[] = [];
    let rainT = 0, lastT = 0, rafId = 0;

    // 🔴 STĹPCE MAJÚ VÝHRADNÉ PRUHY — prekryv nie je zmenšený, je vylúčený.
    const spriteCache = new Map<string, { c: HTMLCanvasElement; pad: number; cw: number; ch: number }>();
    const buildDrops = (W: number, H: number, narrow: boolean) => {
      drops = [];
      spriteCache.clear();
      if (!W || !H) return;
      const k = narrow ? DGX.narrowK / 100 : 1;

      let cols: { ci: number; seed: number; w: number; rk?: number }[] = [];
      DGX_RCLS.forEach((c, ci) => {
        const n = (DGX as Record<string, number>)[c.k + 'N'] | 0;
        const w0 = (DGX as Record<string, number>)[c.k + 'W'] * k;
        for (let i = 0; i < n; i++) {
          const seed = ci * 977 + i * 31;
          const w = w0 * (0.86 + dgxRnd(seed, 9) * 0.28);
          cols.push({ ci, seed, w });
        }
      });
      cols.forEach((c, i) => { c.rk = dgxRnd(i, 71); });
      cols.sort((p, q) => (p.rk as number) - (q.rk as number));

      let total = cols.reduce((t, c) => t + c.w, 0);
      if (total > W) {
        // 'cols' (fitMode): odoberá stĺpce z konca premiešaného poradia —
        // zachová šírky, zriedi dážď.
        const kept: typeof cols = [];
        let acc = 0;
        for (const c of cols) { if (acc + c.w > W) break; kept.push(c); acc += c.w; }
        cols = kept;
        total = acc;
      }
      const used = cols.length;
      const slack = used > 0 ? Math.max(0, W - total) / used : 0;
      let cursor = 0;
      for (const c of cols) {
        const laneW = c.w + slack;
        const x = cursor + laneW / 2 + (dgxRnd(c.seed, 5) - 0.5) * slack;
        cursor += laneW;
        const cc = DGX_RCLS[c.ci];
        const w = c.w, h = w / DGX_GA;
        const gap = h * DGX.rainGap / 100;
        const cnt = Math.ceil((H + h * 2) / gap) + 1;
        const span = cnt * gap;
        const v = (24 + dgxRnd(c.seed, 4) * 74) * cc.v;
        const a = cc.a * (0.82 + dgxRnd(c.seed, 11) * 0.36);
        const ph = dgxRnd(c.seed, 6) * span;
        for (let j = 0; j < cnt; j++) {
          drops.push({ x, w, h, v, a, span, y0: j * gap - ph, seed: c.seed * 13 + j, gap });
        }
      }
      // Kreslí sa vzostupne podľa veľkosti — najväčšie (predné) navrch.
      drops.sort((p, q) => p.w - q.w);
    };

    const goldCache = new Map<HTMLImageElement, HTMLCanvasElement>();
    const goldOf = (im: HTMLImageElement) => {
      const hit2 = goldCache.get(im);
      if (hit2) return hit2;
      const k = 256 / Math.max(im.naturalWidth, im.naturalHeight, 1);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(im.naturalWidth * k));
      c.height = Math.max(1, Math.round(im.naturalHeight * k));
      const g = c.getContext('2d')!;
      g.drawImage(im, 0, 0, c.width, c.height);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = '#B8871F';
      g.fillRect(0, 0, c.width, c.height);
      goldCache.set(im, c);
      return c;
    };

    // 🔴 HALO SA PEČIE DO SPRITU, NEKRESLÍ SA PRI KAŽDOM KUSE — `shadowBlur`
    // na hlavnom plátne pri ~200 kusoch zrazilo dážď na 19,6 fps.
    const spriteOf = (im: HTMLImageElement, gold: boolean, hq: number) => {
      const key = im.src + '|' + (gold ? 1 : 0) + '|' + hq;
      const hit2 = spriteCache.get(key);
      if (hit2) return hit2;
      const k = 256 / Math.max(im.naturalWidth, im.naturalHeight, 1);
      const cw = Math.max(1, Math.round(im.naturalWidth * k));
      const ch = Math.max(1, Math.round(im.naturalHeight * k));
      const pad = Math.ceil(hq * 1.6);
      const c = document.createElement('canvas');
      c.width = cw + pad * 2; c.height = ch + pad * 2;
      const g = c.getContext('2d')!;
      g.shadowColor = '#FBF5E6'; g.shadowBlur = hq;
      g.drawImage(gold ? goldOf(im) : im, pad, pad, cw, ch);
      g.shadowBlur = 0;
      const spr = { c, pad, cw, ch };
      spriteCache.set(key, spr);
      return spr;
    };

    const paintRain = (amp: number) => {
      const W = cv.clientWidth, H = cv.clientHeight;
      cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      cx.clearRect(0, 0, W, H);
      if (amp <= 0.002) return;
      const isGold = DGX.goldPct / 100;
      for (const d of drops) {
        const raw = d.y0 + rainT * d.v * (DGX.speed / 100);
        const cyc = Math.floor(raw / d.span);
        const sd = d.seed * 7919 + cyc;
        const y = raw - cyc * d.span - d.h + (dgxRnd(sd, 17) - 0.5) * d.gap * 0.3;
        if (y > H || y + d.h < 0) continue;
        const im = imgs[Math.floor(dgxRnd(sd, 31) * imgs.length)];
        if (!im || !im.complete || !im.naturalWidth) continue;
        const f = 0.88 + dgxRnd(sd, 23) * 0.24;
        const w = d.w * f, h = d.h * f;
        const prog = (y + h) / (H + h);
        const vn = DGX.rainVanish / 100;
        const life = Math.min(1, prog / 0.10) * (vn > 0 ? clamp01((1 - prog) / vn) : 1);
        cx.globalAlpha = d.a * amp * life;
        const gold = dgxRnd(sd, 41) < isGold;
        if (DGX.rainHalo > 0) {
          const hq = Math.round(DGX.rainHalo * (w / 60) / 2) * 2;
          const spr = spriteOf(im, gold, hq);
          const sc = w / spr.cw, padS = spr.pad * sc;
          cx.drawImage(spr.c, d.x - w / 2 - padS, y - padS, w + padS * 2, h + padS * 2);
        } else {
          cx.drawImage(gold ? goldOf(im) : im, d.x - w / 2, y, w, h);
        }
      }
      cx.globalAlpha = 1;
    };

    const sizeCanvas = () => {
      const W = sec.clientWidth, H = sec.clientHeight;
      cv.width = Math.round(W * devicePixelRatio);
      cv.height = Math.round(H * devicePixelRatio);
    };

    let lastDp = 0;
    let rainAmpNow = 0;
    const rainAmp = (dp: number) => {
      const pc = dp * 100;
      const up = seg(pc, 0, DGX.rainFull * 0.5);
      const down = seg(pc, DGX.rainFull, DGX.rainFull + DGX.rainFadeD);
      return (DGX.rainA / 100) * up * mix(1, DGX.rainBg / 100, down);
    };
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const loop = (t: number) => {
      rafId = requestAnimationFrame(loop);
      const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
      lastT = t;
      if (!reducedMotion) rainT += dt;
      paintRain(rainAmpNow);
    };

    // ── NADPIS: veľkosť sa POČÍTA, nemeria po nastavení ─────────────────────
    let perLine = 1;
    const measureHead = () => {
      const prev = h2.style.getPropertyValue('--hs');
      h2.style.cssText += ';visibility:hidden;width:max-content;';
      h2.style.setProperty('--hs', '100px');
      perLine = Math.max(1, line.getBoundingClientRect().width) / 100;
      h2.style.visibility = ''; h2.style.width = '';
      h2.style.setProperty('--hs', prev || '100px');
    };
    const bigSize = (narrow: boolean) => {
      const cs = getComputedStyle(sec), r = sec.getBoundingClientRect();
      const fw = narrow ? DGX.fillPctM : DGX.fillPct, fh = narrow ? DGX.headVhM : DGX.headVh;
      const availW = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * (fw / 100);
      const availH = (r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) * (fh / 100);
      return Math.min(availW / perLine, availH / 0.98);
    };
    const paintGold = () => {
      const hb = h2.getBoundingClientRect(); if (!hb.width) return;
      line.style.setProperty('--bgw', hb.width.toFixed(1) + 'px');
      line.style.setProperty('--bgx', (hb.left - line.getBoundingClientRect().left).toFixed(1) + 'px');
    };

    // ── ROZLOŽENIE KÓT — pozri nákres pre plné odôvodnenie každého kroku ────
    let pad = { up: 0, down: 0, left: 0, right: 0 };
    // 🔴 ŠIRKA GLYFU NIE JE JEDINÝ GOMBÍK NA VÝŠKU — Matejovo zadanie:
    // „musí obraz zmenšiť glyf AJ KÓTY". Na PC (`over:false`) stoja kóty NAD
    // a POD glyfom ako rezervovaný priestor (`pad.up`/`pad.down`) v pevnej
    // veľkosti písma — na nízkom okne táto rezerva sama osebe (dve úrovne
    // „down" strany — BREED + AND YOU pod sebou) zožerie viac miesta, než
    // ostáva na čokoľvek iné, a `fitGw` nižšie by musela stláčať glyf na
    // nulu. `kotaScale` (0–1) zmenší PÍSMO kót, takže sa zmenší aj `pad`,
    // ktorý po ňom počíta — dvojkolová `layoutKoty` (viď `fitKotaScale`).
    let kotaScale = 1;
    const layoutKoty = (narrow: boolean, vertical: boolean) => {
      const px = (narrow ? DGX.kPxM : DGX.kPx) * kotaScale;
      const px2 = (narrow ? DGX.kPx2M : DGX.kPx2) * kotaScale;
      const npx = (narrow ? DGX.kNamePxM : DGX.kNamePx) * kotaScale;
      const scs = getComputedStyle(sec), sr = sec.getBoundingClientRect();
      const limX = { left: sr.left + parseFloat(scs.paddingLeft), right: sr.right - parseFloat(scs.paddingRight) };
      const limY = { top: sr.top + parseFloat(scs.paddingTop), bottom: sr.bottom - parseFloat(scs.paddingBottom) };
      for (const k of K) {
        k.lab.style.setProperty('--ks1', npx + 'px');
        k.lab.style.setProperty('--ks2', px + 'px');
        k.lab.style.setProperty('--ks3', px2 + 'px');
      }

      // `kotaPlace:'auto'` = na mobile cez glyf, na PC vedľa.
      const over = narrow;
      dgxOver = over;

      for (const k of K) {
        k.lab.style.top = k.lab.style.bottom = k.lab.style.left = k.lab.style.right = '';
        k.lab.style.width = 'max-content';
        k.lab.classList.remove('klab--over', 'klab--halo', 'klab--tint', 'klab--solid');
        k.lab.style.background = k.lab.style.borderColor = '';
        k.lab.style.color = DGX_COL[k.id];
        if (over) {
          k.lab.classList.add('klab--over', 'klab--tint');
          k.lab.style.background = `color-mix(in srgb, ${DGX_COL[k.id]} 14%, #FBF5E6)`;
          k.lab.style.borderColor = DGX_COL[k.id];
        }
        if (vertical) {
          k.lab.style.top = k.ay + '%';
          if (over) {
            k.lab.style.alignItems = k.side === 'left' ? 'flex-start' : 'flex-end';
            k.nameEl.style.textAlign = k.descEl.style.textAlign = k.side === 'left' ? 'left' : 'right';
            k.nameEl.style.whiteSpace = k.descEl.style.whiteSpace = '';
            k.nameEl.style.overflowWrap = k.descEl.style.overflowWrap = '';
            k.nameEl.style.maxWidth = k.descEl.style.maxWidth = '';
          } else {
            k.lab.style.alignItems = k.side === 'left' ? 'flex-end' : 'flex-start';
            k.nameEl.style.whiteSpace = 'normal'; k.nameEl.style.overflowWrap = 'anywhere'; k.nameEl.style.maxWidth = '65px';
            k.descEl.style.whiteSpace = 'normal'; k.descEl.style.overflowWrap = 'anywhere'; k.descEl.style.maxWidth = '65px';
            k.nameEl.style.textAlign = k.descEl.style.textAlign = k.side === 'left' ? 'right' : 'left';
          }
        } else {
          k.lab.style.left = k.ax + '%';
          k.lab.style.alignItems = 'center';
          k.nameEl.style.whiteSpace = k.descEl.style.whiteSpace = '';
          k.nameEl.style.overflowWrap = k.descEl.style.overflowWrap = '';
          k.nameEl.style.maxWidth = k.descEl.style.maxWidth = '';
          k.nameEl.style.textAlign = k.descEl.style.textAlign = '';
        }
      }

      if (over) {
        const edge = DGX.kotaEdge;
        const gr = gbox.getBoundingClientRect();
        for (const k of K) {
          if (vertical) {
            if (k.side === 'left') k.lab.style.left = ((limX.left + edge) - gr.left).toFixed(1) + 'px';
            else k.lab.style.right = (gr.right - (limX.right - edge)).toFixed(1) + 'px';
            k.lab.style.transform = 'translate(0,-50%)';
          } else {
            if (k.side === 'up') k.lab.style.top = ((limY.top + edge) - gr.top).toFixed(1) + 'px';
            else k.lab.style.bottom = (gr.bottom - (limY.bottom - edge)).toFixed(1) + 'px';
            k.lab.style.transform = 'translate(-50%,0)';
          }
          k.lab.style.setProperty('--kdx', '0px');
          k.lab.style.setProperty('--kdy', '0px');
        }
        for (const k of K) {
          const r = k.lab.getBoundingClientRect();
          let dx = 0, dy = 0;
          if (limX.right > limX.left) {
            if (r.left < limX.left) dx = limX.left - r.left;
            else if (r.right > limX.right) dx = limX.right - r.right;
          }
          if (limY.bottom > limY.top) {
            if (r.top < limY.top) dy = limY.top - r.top;
            else if (r.bottom > limY.bottom) dy = limY.bottom - r.bottom;
          }
          k.lab.style.setProperty('--kdx', dx.toFixed(1) + 'px');
          k.lab.style.setProperty('--kdy', dy.toFixed(1) + 'px');
        }
        pad = { up: 0, down: 0, left: 0, right: 0 };
        return;
      }

      // Cast: `vertical` rozhoduje, ktoré dve z týchto štyroch polí sa
      // reálne čítajú (limX.left/right vs limY.top/bottom) — to isté ako
      // v nákrese, len TS nevie zúžiť úniu podľa vonkajšej premennej.
      const lim = (vertical ? limY : limX) as { left: number; right: number; top: number; bottom: number };
      const sideA = vertical ? 'left' : 'up', sideB = vertical ? 'right' : 'down';
      const base = DGX.lead + 4;

      const runPass = () => {
        const gb = gbox.getBoundingClientRect();
        const gDim = vertical ? (gb.width || 0) : (gb.height || 0);
        const rowH: Record<string, number> = {};
        const place = (k: KLine, off: number) => {
          if (vertical) {
            (k.lab.style as unknown as Record<string, string>)[k.side === 'left' ? 'right' : 'left'] = `calc(100% + ${off}px)`;
            const over2 = k.side === 'left' ? (k.edgeL as number) : (100 - (k.edgeR as number));
            k.lineFull = gDim * over2 / 100 + off - 4;
            k.lab.style.transform = 'translate(0,-50%)';
          } else {
            (k.lab.style as unknown as Record<string, string>)[k.side === 'up' ? 'bottom' : 'top'] = `calc(100% + ${off}px)`;
            const over2 = k.side === 'up' ? (k.edgeT as number) : (100 - (k.edgeB as number));
            k.lineFull = gDim * over2 / 100 + off - 4;
            k.lab.style.transform = 'translate(-50%,0)';
          }
          const r = k.lab.getBoundingClientRect();
          let d = 0;
          if (vertical) {
            if (lim.bottom > lim.top) {
              if (r.top < lim.top) d = lim.top - r.top;
              else if (r.bottom > lim.bottom) d = lim.bottom - r.bottom;
            }
            k.lab.style.setProperty('--kdy', d.toFixed(1) + 'px');
            return r.width;
          }
          if (lim.right > lim.left) {
            if (r.left < lim.left) d = lim.left - r.left;
            else if (r.right > lim.right) d = lim.right - r.right;
          }
          k.lab.style.setProperty('--kdx', d.toFixed(1) + 'px');
          return r.height;
        };
        for (const k of K) { k.lab.style.setProperty('--kdx', '0px'); k.lab.style.setProperty('--kdy', '0px'); }
        let a1 = 0, b1 = 0;
        for (const k of K) { if (k.row) continue;
          const h = place(k, base); rowH[k.side] = Math.max(rowH[k.side] || 0, h);
          if (k.side === sideA) a1 = Math.max(a1, h + base); else b1 = Math.max(b1, h + base); }
        for (const k of K) { if (!k.row) continue;
          const off = base + (rowH[k.side] + DGX_ROW_GAP) * k.row;
          const h = place(k, off);
          if (k.side === sideA) a1 = Math.max(a1, h + off); else b1 = Math.max(b1, h + off); }
        void sideB;
        return { a1, b1 };
      };

      let { a1, b1 } = runPass();
      if (vertical) {
        gwrap.style.setProperty('--pl', a1.toFixed(1) + 'px');
        gwrap.style.setProperty('--pr', b1.toFixed(1) + 'px');
        ({ a1, b1 } = runPass());

        for (const side of ['left', 'right']) {
          const ks = K.filter((k) => k.side === side).sort((p, q) => (p.ay as number) - (q.ay as number));
          for (let i = 1; i < ks.length; i++) {
            const prevR = ks[i - 1].lab.getBoundingClientRect();
            const curR = ks[i].lab.getBoundingClientRect();
            if (curR.top < prevR.bottom + 4) {
              const push = prevR.bottom + 4 - curR.top;
              const prevKdy = parseFloat(ks[i].lab.style.getPropertyValue('--kdy')) || 0;
              ks[i].lab.style.setProperty('--kdy', (prevKdy + push).toFixed(1) + 'px');
            }
          }
        }
      }
      pad = vertical ? { up: 0, down: 0, left: a1, right: b1 } : { up: a1, down: b1, left: 0, right: 0 };
    };

    // ── FIT ŠÍRKY GLYFU CEZ VÝŠKU ────────────────────────────────────────
    // 🔴 Matejovo okno je ŠIROKÉ A NÍZKE (~1000×490 CSS px, odmerané zo
    // screenshotu 2. 9. 2026: „obraz sa nezmestil na stránku, zmenši to").
    // Doteraz mal glyf LEN šírkový strop (`gw`/`gwV`/`gwM`, % šírky) — presne
    // ten istý bug, aký mal nadpis WE NEED YOU pred svojím `bigSize()`
    // (viď komentár tam: „mobil nie je zmenšené PC… VÝŠKA okna, nie šírka").
    // Na širokom okne šírka nikdy nechýba, takže percento dovolí obrovský
    // glyf — jeho VÝŠKA (pevný pomer strán viewBoxu) spolu s kótami nad/pod
    // ním pretiekla cez spodný okraj (BREED odrezaná, štvrtá kóta AND YOU
    // mimo okna úplne — odmerané, nie odhadnuté).
    // Rovnaký recept ako `bigSize()`/`glfBigSize()` (WE NEED YOU, ALBA):
    // `Math.min(šírkový strop, výškový strop)`.
    // ⚠️ VÝŠKOVÝ STROP MÁ DVE NEZÁVISLÉ SCÉNY, NIE JEDEN SÚČET. Kóty (pad
    // nad/pod glyfom) a podpis+pilulka NIKDY nie sú vidieť naraz — réžia ich
    // strieda (kóty zhasnú `DGX.holdGap`+`offD` PRED tým, než sa podpis
    // vôbec začne písať, `DGX.sig` > posledná kóta). Sčítať oba nároky do
    // jedného rozpočtu (prvý pokus) preto glyf zbytočne stláčalo — obe scény
    // musia SAMOSTATNE zmestiť rovnaký `gboxH`, nie ich súčet naraz.
    // ⚠️ Výšky eyebrow/podnadpisu/pilulky sa POČÍTAJÚ z font-size (riadkovanie
    // je súčasť CSS), nie merajú z DOM — v okamihu, keď glyf potrebuje svoju
    // veľkosť (33 % dp), tieto beaty ešte nemusia byť odhalené (grid 0fr) a
    // merať by znamenalo merať nulu. Podpis (fotka + meno) je výnimka: kruh
    // fotky (`fp`) takmer vždy prerastie dvojriadkový textový stĺpec vedľa
    // seba, takže jej priemer je bezpečný horný odhad celého bloku.
    const fitGw = (narrow: boolean, vertical: boolean, headPx: number, rulePxV: number) => {
      const fixedPct = vertical ? DGX.gwV : (narrow ? DGX.gwM : DGX.gw);
      const cs = getComputedStyle(sec), r = sec.getBoundingClientRect();
      const availW = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (availW <= 0 || availH <= 0) return fixedPct;
      const gapPx = (vh: number) => (window.innerHeight * vh) / 100;
      const eyeH = (narrow ? DGX.eyePxM : DGX.eyePx) * 1.2;
      const ruleH = rulePxV * 1.4;
      const sigH = narrow ? DGX.fpM : DGX.fp;
      const hintPxV = narrow ? DGX.hintPxM : DGX.hintPx;
      const pillH = hintPxV * (1 + 2 * 0.72) + 2;
      // Spoločný základ oboch scén: eyebrow + nadpis + podnadpis + medzera
      // PRED glyfom (glf beat vlastný gapTop, ešte pred pad/gbox).
      const usedShared =
        gapPx(1.8) + eyeH +
        gapPx(1.8) + headPx * 0.98 +
        gapPx(DGX.subGap) + ruleH +
        gapPx(1.8);
      // Scéna A: kóty svietia (pad.up/pad.down reálne zaberajú miesto).
      const budgetA = availH - usedShared - pad.up - pad.down;
      // Scéna B: kóty už dohasli, podpis + pilulka sa práve píšu.
      const budgetB = availH - usedShared - (gapPx(1.8) + sigH) - (gapPx(1.8) + pillH);
      const budget = Math.max(0, Math.min(budgetA, budgetB));
      const aspect = vertical ? (DGX_VB_V.h / DGX_VB_V.w) : (DGX_VB.h / DGX_VB.w);
      const gwFromH = (budget / aspect / availW) * 100;
      // Spodný strop je len poistka proti úplne zmiznutému glyfu na
      // patologicky nízkom okne — nie nástroj na vynútenie zhody so
      // šírkovým stropom (ten prehráva `Math.min` vyššie).
      // Desatina dole podla `gwK` — az z VYSLEDKU, aby platila aj ked
      // vyhra vyskovy strop. Mobil (narrow/vertical) ostava nedotknuty.
      const k = (narrow || vertical) ? 1 : DGX.gwK;
      return Math.max(14, Math.min(fixedPct, gwFromH) * k);
    };

    // ── FIT KÓT CEZ VÝŠKU ─────────────────────────────────────────────────
    // Druhý gombík z toho istého zadania („zmenší glyf AJ KÓTY"). Kóty na PC
    // rezervujú miesto NAD/POD glyfom v pevnej veľkosti písma — na nízkom
    // okne (a najmä pri dvoch riadkoch na „down" strane: BREED + AND YOU pod
    // sebou) táto rezerva sama osebe zožerie väčšinu výšky a `fitGw` vyššie
    // by musela stláčať glyf takmer na nulu, len aby sa kóty zmestili.
    // Postup: 1. kolo `layoutKoty` pri `kotaScale=1` (základná mierka) —
    // z neho vyjde SKUTOČNÝ `pad.up/pad.down` pri plnom písme. 2. z rozpočtu
    // (rovnaký ako scéna A vo `fitGw`, len s CIEĽOVÝM `gboxH` = tým, čo dá
    // scéna B — teda kóty nesmú byť HORŠIE obmedzenie než podpis+pilulka)
    // sa dopočíta mierka písma. 3. druhé kolo `layoutKoty` UŽ s touto
    // mierkou — a TOTO je hodnota, ktorú neskôr číta `fitGw`.
    const fitKotaScale = (narrow: boolean, vertical: boolean) => {
      kotaScale = 1;
      layoutKoty(narrow, vertical);
      if (vertical) return; // "over" mód (mobil): pad je vždy {0,0,0,0}, nič na škálovanie
      const cs = getComputedStyle(sec), r = sec.getBoundingClientRect();
      const availH = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (availH <= 0) return;
      const gapPx = (vh: number) => (window.innerHeight * vh) / 100;
      const big = bigSize(narrow);
      const fin = Math.min(big, (narrow ? DGX.finSizeM : DGX.finSize) / 100 * window.innerWidth);
      const headH = fin * 0.98; // po ustálení (mix big→fin) — kóty aj tak prídu až potom
      const rulePxV = narrow ? DGX.rulePxM : DGX.rulePx;
      const usedShared =
        gapPx(1.8) + (narrow ? DGX.eyePxM : DGX.eyePx) * 1.2 +
        gapPx(1.8) + headH +
        gapPx(DGX.subGap) + rulePxV * 1.4 +
        gapPx(1.8);
      const sigH = narrow ? DGX.fpM : DGX.fp;
      const pillH = (narrow ? DGX.hintPxM : DGX.hintPx) * (1 + 2 * 0.72) + 2;
      const budgetB = availH - usedShared - (gapPx(1.8) + sigH) - (gapPx(1.8) + pillH);
      const padSum = pad.up + pad.down;
      if (padSum <= 0) return;
      // Koľko z (availH − usedShared) smú kóty zabrať, aby scéna A dala
      // aspoň taký gboxH, aký beztak dovolí scéna B (inak sú kóty zbytočne
      // to najprísnejšie miesto rozpočtu).
      const padBudget = availH - usedShared - Math.max(0, budgetB);
      const scale = padBudget / padSum;
      // 0.5 je spodná hranica čitateľnosti (kNamePx 34px → 17px) — pod ňou
      // sa z nadpisu skupiny stáva nečitateľný riadok, čo porušuje vlastný
      // zmysel kóty („veľký názov, nie údaj").
      kotaScale = Math.max(0.5, Math.min(1, scale));
      if (kotaScale < 1) layoutKoty(narrow, vertical); // druhé kolo so zmenšeným písmom
    };

    const put2 = (nd: HTMLElement | null | undefined, v: number) => {
      if (!nd) return;
      nd.style.setProperty('--o', v.toFixed(3));
      nd.style.gridTemplateRows = v.toFixed(3) + 'fr';
    };

    // ── DRAW: časová os JEDNÉHO snímku, volaná z hlavného choreografického
    // efektu s aktuálnym `dp` (0–1, progres tejto obrazovky). ────────────────
    const draw = (dp: number) => {
      lastDp = dp;
      const narrow = window.innerWidth <= NARROW_MAX;
      // 🔴 REZERVA SA PREPOČÍTA LEN PRI ZMENE ORIENTÁCIE (curVertical guard v
      // buildGlyph) — narrow≤768px = zvislý (mobil), inak vodorovný (PC).
      const vertical = narrow;
      if (curVertical !== vertical) { buildGlyph(vertical); fitKotaScale(narrow, vertical); measureHead(); paintGold(); }
      const pc = dp * 100;
      rainAmpNow = rainAmp(dp);
      sec.dataset.narrow = narrow ? '1' : '0';

      put2(el.eye, seg(pc, DGX.eye, DGX.eye + DGX.dur));
      eyeEl.style.setProperty('--es', (narrow ? DGX.eyePxM : DGX.eyePx) + 'px');

      const hv = seg(pc, DGX.head, DGX.head + DGX.dur);
      put2(el.head, hv); line.style.setProperty('--o', hv.toFixed(3));
      const big = bigSize(narrow);
      const fin = Math.min(big, (narrow ? DGX.finSizeM : DGX.finSize) / 100 * window.innerWidth);
      const headFixed = narrow; // headFixM:'1' — na mobile je nadpis od začiatku v konečnej veľkosti
      const headPx = headFixed ? fin : mix(big, fin, seg(pc, DGX.shrink, DGX.shrink + DGX.shrinkD));
      h2.style.setProperty('--hs', headPx.toFixed(1) + 'px');
      paintGold();

      put2(el.rule, seg(pc, DGX.rule, DGX.rule + DGX.dur));
      const rulePxV = narrow ? DGX.rulePxM : DGX.rulePx;
      ruleEl.style.setProperty('--rs', rulePxV + 'px');

      const gv = seg(pc, DGX.glyph, DGX.glyph + DGX.glyphD);
      svg.style.opacity = gv.toFixed(3);
      svg.style.transform = `scale(${mix(DGX.gZoom / 100, 1, gv).toFixed(3)})`;
      gbox.style.setProperty('--gw', fitGw(narrow, vertical, headPx, rulePxV).toFixed(2) + '%');

      const hiv = seg(pc, DGX.hint, DGX.hint + DGX.hintD);
      put2(el.hint, hiv);
      hint.style.setProperty('--ho', hiv.toFixed(3));
      hint.style.setProperty('--hy', mix(14, 0, hiv).toFixed(1) + 'px');
      setLive(sec, pc >= (DGX.hint + DGX.hintD));

      const fv = 0; // fall:'none' — koncový stav je čierny a klikateľný, nie rozpad
      const gone = 1 - fv;

      let kMax = 0;
      const pw = Math.max(0, DGX.pulseW);
      const lastEnd = DGX.kota + (K.length - 1) * DGX.kotaStag + pw + DGX.kotaD;
      const offAt = lastEnd + DGX.holdGap;
      const dark = seg(pc, offAt, offAt + DGX.offD); // hold:'acc' — zostanú svietiť, po poslednej NARAZ zhasnú
      K.forEach((k, i) => {
        const a = DGX.kota + i * DGX.kotaStag;
        const fadeIn = Math.max(1.2, pw * 0.35);
        const lit = seg(pc, a, a + fadeIn);
        const on = seg(pc, a + pw, a + pw + DGX.kotaD);
        const sv = Math.max(0, Math.max(lit, on)) * dgxPulseAt(pc, a, pw, DGX.pulseN) * (1 - dark);
        const kv = Math.max(0, on) * (1 - dark);
        kMax = Math.max(kMax, on);
        for (const nd of tints[k.id]) {
          (nd as unknown as HTMLElement).style.opacity = (sv * gone).toFixed(3);
          (nd as unknown as HTMLElement).style.filter = (nd === cartTNode ? '' : `url(#dgx-t-${k.id}) `) +
            (DGX.glow > 0 ? `drop-shadow(0 0 ${(DGX.glow * sv).toFixed(1)}px ${DGX_COL[k.id]})` : '');
        }
        const over = dgxOver;
        k.li.style.setProperty('--ko', over ? '0' : kv.toFixed(3));
        k.lab.style.setProperty('--ko', kv.toFixed(3));
        if (over) {
          k.lab.style.transform = vertical
            ? `translate(calc(var(--kdx,0px)),calc(-50% + var(--kdy,0px)))`
            : `translate(calc(-50% + var(--kdx,0px)),calc(var(--kdy,0px)))`;
        } else if (vertical) {
          k.li.style.width = ((k.lineFull || 0) * kv).toFixed(1) + 'px';
          const dx = mix(k.side === 'left' ? 7 : -7, 0, kv);
          k.lab.style.transform = `translate(${dx.toFixed(1)}px,calc(-50% + var(--kdy,0px)))`;
        } else {
          k.li.style.height = ((k.lineFull || 0) * kv).toFixed(1) + 'px';
          const dy = mix(k.side === 'up' ? 7 : -7, 0, kv);
          k.lab.style.transform = `translate(calc(-50% + var(--kdx,0px)),${dy.toFixed(1)}px)`;
        }
      });

      // Podržaný symbol (hover/klik) prebíja vypočítané krytie — koncový
      // stav je čierny glyf, svetlo je odpoveď na dotyk.
      if (sec.dataset.live === '1' && hoverKey && tintOf[hoverKey]) {
        const g = vertical ? SLOT_G_V(hoverKey) : SLOT_G_H(hoverKey);
        const nd = tintOf[hoverKey];
        (nd as unknown as HTMLElement).style.opacity = '1';
        (nd as unknown as HTMLElement).style.filter = `url(#dgx-t-${g}) drop-shadow(0 0 ${DGX.glow}px ${DGX_COL[g]})`;
        const slot = (vertical ? DGX_SLOTS_V : DGX_SLOTS).find((s) => s.k === hoverKey)!;
        bub.style.color = DGX_COL[g];
        const [label, val, name] = DGX_BUB[hoverKey] || ['', '', ''];
        bub.innerHTML = `<b>${label}</b><i>${val}</i><em>${name}</em>`;
        bub.classList.add('on');
        const gr = gbox.getBoundingClientRect(), sr = sec.getBoundingClientRect();
        bub.style.removeProperty('transform');
        const ax = vertical ? dgxPctXV(slot.x + slot.w / 2) : dgxPctX(slot.x + slot.w / 2);
        const ay = vertical ? dgxPctYV(slot.y) : dgxPctY(slot.y);
        bub.style.left = (gr.left + (ax / 100) * gr.width - sr.left).toFixed(1) + 'px';
        bub.style.top = (gr.top + (ay / 100) * gr.height - sr.top).toFixed(1) + 'px';
        bub.style.setProperty('--bdx', '0px');
        bub.style.setProperty('--bdy', '0px');
        const scs = getComputedStyle(sec);
        const limL = sr.left + parseFloat(scs.paddingLeft), limR = sr.right - parseFloat(scs.paddingRight);
        const limT = sr.top + parseFloat(scs.paddingTop), limB = sr.bottom - parseFloat(scs.paddingBottom);
        const br = bub.getBoundingClientRect();
        let bdx = 0, bdy = 0;
        if (limR > limL) { if (br.left < limL) bdx = limL - br.left; else if (br.right > limR) bdx = limR - br.right; }
        if (limB > limT) { if (br.top < limT) bdy = limT - br.top; else if (br.bottom > limB) bdy = limB - br.bottom; }
        bub.style.setProperty('--bdx', bdx.toFixed(1) + 'px');
        bub.style.setProperty('--bdy', bdy.toFixed(1) + 'px');
      } else {
        bub.classList.remove('on');
      }

      put2(el.glf, gv);
      const res = Math.max(gv, kMax) * (1 - dark);
      gwrap.style.setProperty('--pu', (pad.up * res).toFixed(1) + 'px');
      gwrap.style.setProperty('--pd', (pad.down * res).toFixed(1) + 'px');
      gwrap.style.setProperty('--pl', (pad.left * res).toFixed(1) + 'px');
      gwrap.style.setProperty('--pr', (pad.right * res).toFixed(1) + 'px');

      // 🔴 Rozpad je natrvalo VYPNUTÝ (`fall:'none'`) — koncový stav obrazu
      // je čierny, klikateľný glyf, nie rozsypaná kresba. `pieces` preto
      // nikdy nedostane `transform`/menené `opacity` a netreba ich resetovať
      // v každom snímku (zapísaná lekcia z nákresu — bolo by to zbytočná
      // práca navyše na desiatkach SVG uzlov, 60× za sekundu).
      K.forEach((k) => {
        k.li.style.opacity = (parseFloat(k.li.style.getPropertyValue('--ko') || '0') * gone).toFixed(3);
        k.lab.style.opacity = (parseFloat(k.lab.style.getPropertyValue('--ko') || '0') * gone).toFixed(3);
      });

      put2(el.sig, seg(pc, DGX.sig, DGX.sig + DGX.sigD));
      sigWrap.style.setProperty('--fp', (narrow ? DGX.fpM : DGX.fp) + 'px');
      sigNm.style.setProperty('--ns', (narrow ? DGX.nsM : DGX.ns) + 'px');
      sigRl.style.setProperty('--rls', (narrow ? DGX.rlsM : DGX.rls) + 'px');
    };

    const setLive = (elx: HTMLElement, v: boolean) => { elx.dataset.live = v ? '1' : '0'; };
    const SLOT_G_H = (k: string) => DGX_SLOTS.find((s) => s.k === k)?.g ?? 'basics';
    const SLOT_G_V = (k: string) => DGX_SLOTS_V.find((s) => s.k === k)?.g ?? 'basics';

    // ── ŠTART ────────────────────────────────────────────────────────────
    // glyphMode je vždy 'auto' v produkcii — vodorovný na PC, zvislý na
    // mobile, TO ISTÉ `narrow` ako všade v tomto súbore (NARROW_MAX).
    const narrow0 = window.innerWidth <= NARROW_MAX;
    hint.textContent = narrow0 ? DGX_HINT.touch : DGX_HINT.hover;
    buildGlyph(narrow0);
    fitKotaScale(narrow0, narrow0);
    K.forEach((k, i) => { k.nameEl.textContent = DGX_KNAME[i]; k.descEl.textContent = DGX_KTEXT[i]; });
    sec.dataset.narrow = narrow0 ? '1' : '0';
    sizeCanvas();
    buildDrops(sec.clientWidth, sec.clientHeight, narrow0);
    measureHead();
    dgxApiRef.current = { draw };
    draw(0);

    const onResize = () => {
      const narrow = window.innerWidth <= NARROW_MAX;
      hint.textContent = narrow ? DGX_HINT.touch : DGX_HINT.hover;
      const vertical = narrow;
      buildGlyph(vertical);
      K.forEach((k, i) => { k.nameEl.textContent = DGX_KNAME[i]; k.descEl.textContent = DGX_KTEXT[i]; });
      sizeCanvas();
      buildDrops(sec.clientWidth, sec.clientHeight, narrow);
      measureHead(); fitKotaScale(narrow, vertical); draw(lastDp);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(sec);
    if (document.fonts) document.fonts.ready.then(() => { measureHead(); paintGold(); draw(lastDp); });

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dgxApiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      vhero?: HTMLElement | null;
      vstage?: HTMLElement | null; vblocks?: HTMLElement | null;
      vinner?: HTMLElement | null;
      veil?: HTMLElement | null; night?: HTMLElement | null;
      nav?: HTMLElement | null; crawl?: HTMLElement | null; keep?: HTMLElement | null;
      // Oblúk za príbehom (recenzie → next step).
      arc?: HTMLElement | null;
      // WE NEED YOU — beaty, ktoré si berú miesto, až keď prichádzajú.
      nxSec?: HTMLElement | null; nxPhar?: HTMLElement | null;
      nxBeats?: Record<string, HTMLElement | null>;
      nxH2?: HTMLElement | null; nxWords?: HTMLElement[];
      nxLine?: HTMLElement | null;
      nxPlot?: HTMLElement | null; nxAx?: HTMLElement | null;
      nxGoal?: HTMLElement | null;
      nxAnchor?: HTMLElement | null; nxHead?: HTMLElement | null;
      nxHeadImg?: HTMLImageElement | null;
      nxHeadName?: HTMLElement | null; nxHeadNum?: HTMLElement | null;
      nxMids?: NodeListOf<HTMLElement>;
      nxArrow?: HTMLElement | null; nxCta?: HTMLElement | null;
      /** Pomer šírka : veľkosť písma, zmeraný RAZ. Viac pri `measureHead()`. */
      perRow?: number; perWord?: number; perSub?: number; perSubPart?: number;
      perGlfLine?: number;
      perMostHead?: number; perMostQ?: number;
      // Štyri obrazovky oblúka — krytie nesú ONE, nie ich obsah.
      nxt?: HTMLElement | null; dgx?: HTMLElement | null; glf?: HTMLElement | null;
      most?: HTMLElement | null;
      // HEROGLYF / ALBA — nadpis (dva riadky), eyebrow, tri stĺpce, veta.
      glfHead?: HTMLElement | null; glfLines?: HTMLElement[];
      glfHeadBeat?: HTMLElement | null;
      glfEye?: HTMLElement | null; glfEyeBeat?: HTMLElement | null;
      glfTrio?: HTMLElement | null; glfTrioBeat?: HTMLElement | null;
      glfPhs?: NodeListOf<HTMLElement>; glfNms?: NodeListOf<HTMLElement>;
      glfGws?: NodeListOf<HTMLElement>; glfGins?: NodeListOf<HTMLElement>;
      glfSame?: HTMLElement | null; glfSameBeat?: HTMLElement | null;
      glfSays?: HTMLElement | null; glfSaysBeat?: HTMLElement | null;
      glfCntEl?: HTMLElement | null; glfCntBeat?: HTMLElement | null;
      // MOST — brána (eyebrow + veta) a otázka, ktorá po nej ostane sama.
      mostEye?: HTMLElement | null; mostEyeBeat?: HTMLElement | null;
      mostHead?: HTMLElement | null; mostHeadBeat?: HTMLElement | null;
      mostQ?: HTMLElement | null; mostQBeat?: HTMLElement | null;
      // Recenzie.
      quo?: HTMLElement | null; quoHead?: HTMLElement | null;
      quoCols?: NodeListOf<HTMLElement>; quoCredits?: HTMLElement | null;
      quoCreditsSum?: HTMLElement | null;
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
        vhero: q<HTMLElement>('#op-vision .vision-video-hero'),
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
        // Vyzva skroluj dalej na ciernej sale - vid KEEP_IN / KEEP_OUT.
        keep: q<HTMLElement>('.op-keep'),
        // ── NEXT STEP ────────────────────────────────────────────────────
        // Dráhu meria SEKCIA — je vyššia než okno a jej obsah v nej stojí
        // prilepený, takže vznikne úsek scrollu, počas ktorého sa nič
        // neposúva a mení sa len to, čo je vidieť.
        arc: q<HTMLElement>('.op-arc'),
        // ── WE NEED YOU ──────────────────────────────────────────────────
        // Sekcia sa meria (z nej sa počíta, koľko miesta má nadpis), faraón sa
        // hýbe a beaty sa otvárajú. Beaty sú v mape, lebo réžia s nimi robí
        // to isté — otvorí riadok a nastaví krytie jedným číslom.
        nxSec: q<HTMLElement>('.op-nxt'),
        nxPhar: q<HTMLElement>('.op-nxt-phar'),
        nxBeats: {
          head: q<HTMLElement>('.op-b-head'), sub: q<HTMLElement>('.op-b-sub'),
          bar: q<HTMLElement>('.op-b-bar'), arrow: q<HTMLElement>('.op-b-arrow'),
          step: q<HTMLElement>('.op-b-step'), cta: q<HTMLElement>('.op-b-cta'),
          tail: q<HTMLElement>('.op-b-tail'),
        },
        nxH2: q<HTMLElement>('.op-nxt-h2'),
        // Slová nadpisu nesú krytie SAMY — gradient na rodičovi by zabil
        // potomka s vlastným krytím, a krytie je tu to, čo ich privádza po
        // jednom.
        nxWords: Array.from(document.querySelectorAll<HTMLElement>('.op-nxt-h2 span')),
        nxLine: q<HTMLElement>('.op-nxt-line'),
        nxPlot: q<HTMLElement>('.op-nxt-plot'),
        nxAx: q<HTMLElement>('.op-nxt-ax'),
        nxGoal: q<HTMLElement>('.op-nxt-goal'),
        nxAnchor: q<HTMLElement>('.op-nxt-dog--anchor'),
        nxHead: q<HTMLElement>('.op-nxt-dog--head'),
        nxHeadImg: q<HTMLImageElement>('.op-nxt-head-img'),
        nxHeadName: q<HTMLElement>('.op-nxt-head-name'),
        nxHeadNum: q<HTMLElement>('.op-nxt-head-num'),
        nxMids: document.querySelectorAll<HTMLElement>('.op-nxt-dog--mid'),
        nxArrow: q<HTMLElement>('.op-nxt-arrow'),
        nxCta: q<HTMLElement>('.op-nxt-cta'),
        // Tri obrazovky oblúka. Stoja v jednom javisku nad sebou a prepínajú
        // ich prelínačky — preto sa hasia CELÉ, nie po prvkoch.
        nxt: q<HTMLElement>('.op-nxt'),
        dgx: q<HTMLElement>('.op-dgx'),
        glf: q<HTMLElement>('.op-glf'),
        // ── HEROGLYF / ALBA ──────────────────────────────────────────────
        glfHead: q<HTMLElement>('.op-glf-h2'),
        glfLines: Array.from(document.querySelectorAll<HTMLElement>('.op-glf-h2 .ln')),
        glfHeadBeat: q<HTMLElement>('.op-b-glfhead'),
        glfEye: q<HTMLElement>('.op-glf-eye'),
        glfEyeBeat: q<HTMLElement>('.op-b-glfeye'),
        glfTrio: q<HTMLElement>('.op-glf-trio'),
        glfTrioBeat: q<HTMLElement>('.op-b-glftrio'),
        glfPhs: document.querySelectorAll<HTMLElement>('.op-glf-ph'),
        glfNms: document.querySelectorAll<HTMLElement>('.op-glf-nm'),
        glfGws: document.querySelectorAll<HTMLElement>('.op-glf-gw'),
        glfGins: document.querySelectorAll<HTMLElement>('.op-glf-gin'),
        glfSame: q<HTMLElement>('.op-glf-same'),
        glfSameBeat: q<HTMLElement>('.op-b-glfsame'),
        glfSays: q<HTMLElement>('.op-glf-says'),
        glfSaysBeat: q<HTMLElement>('.op-b-glfsays'),
        glfCntEl: q<HTMLElement>('.op-glf-cnt b'),
        glfCntBeat: q<HTMLElement>('.op-b-glfcnt'),
        // ── MOST ─────────────────────────────────────────────────────────
        most: q<HTMLElement>('.op-most'),
        mostEye: q<HTMLElement>('.op-most-eye'),
        mostEyeBeat: q<HTMLElement>('.op-b-mosteye'),
        mostHead: q<HTMLElement>('.op-most-h2'),
        mostHeadBeat: q<HTMLElement>('.op-b-mosthead'),
        mostQ: q<HTMLElement>('.op-most-q'),
        mostQBeat: q<HTMLElement>('.op-b-mostq'),
        // ── RECENZIE ─────────────────────────────────────────────────────
        // Dráhu meria SEKCIA (je vyššia než okno), obsah v nej stojí prilepený.
        quo: q<HTMLElement>('.op-quo'),
        quoHead: q<HTMLElement>('.op-quo .tst-head'),
        // ⚠️ Stĺpce sa berú ako PRIAME DETI obalu, nie cez vlastnú triedu:
        // `TestimonialsColumn` je zdieľaný s ostrou /about a trieda na jeho
        // koreni by si vypýtala ďalší prop v komponente, ktorý o filme nemá
        // čo vedieť. Prvý stĺpec navyše žiadny className nedostáva.
        quoCols: document.querySelectorAll<HTMLElement>('.op-quo .tst-cols > div'),
        quoCredits: q<HTMLElement>('.op-quo .tst-credits'),
        quoCreditsSum: q<HTMLElement>('.op-quo .tst-credits > summary'),
      };
    };
    resolve();

    /* ── MERANIE NADPISU ────────────────────────────────────────────────────
       🔑 VEĽKOSŤ SA POČÍTA, NEMERIA SA PO NASTAVENÍ.
       Text má pri danom písme pevný pomer šírka : veľkosť písma. Zmeria sa RAZ
       pri referenčných 100 px (`perRow` = šírka celého nadpisu na jeden riadok,
       `perWord` = šírka najširšieho slova) a odvtedy je veľkosť obyčajný
       podiel. Meranie PO nastavení by bolo kruh — veľkosť mení šírku, šírka
       mení veľkosť; presne to je príčina historického „nejak divne sa to
       správa" pri psom bloku na /pack/dogs.
       ⚠️ MERAJ AŽ PO `document.fonts.ready`: pri systémovom náhradnom písme má
       nadpis iný pomer a veľkosť by po dosadnutí Cinzelu skočila. */
    const measureHead = () => {
      const h2 = n.nxH2;
      const words = n.nxWords ?? [];
      if (!h2 || !words.length) return;
      const prevHs = h2.style.getPropertyValue('--hs');
      const prevCss = h2.style.cssText;
      h2.style.cssText += ';visibility:hidden;flex-wrap:nowrap;width:max-content;flex-direction:row;';
      h2.style.setProperty('--hs', '100px');
      n.perRow = Math.max(1, h2.getBoundingClientRect().width) / 100;
      n.perWord = Math.max(1, ...words.map((w) => w.getBoundingClientRect().width)) / 100;
      h2.style.cssText = prevCss;
      if (prevHs) h2.style.setProperty('--hs', prevHs);

      // Ten istý recept pre podtitul: pomer šírka : veľkosť písma pre CELÝ
      // riadok (PC) a pre najširší z dvoch kusov (mobil).
      const line = n.nxLine;
      if (!line) return;
      const prevLine = line.style.cssText;
      line.style.cssText += ';visibility:hidden;position:absolute;white-space:nowrap;';
      line.style.setProperty('--ss', '100px');
      const parts = Array.from(line.children) as HTMLElement[];
      parts.forEach((c) => { c.style.display = 'inline'; });
      n.perSub = Math.max(1, line.getBoundingClientRect().width) / 100;
      n.perSubPart = Math.max(1, ...parts.map((c) => c.getBoundingClientRect().width)) / 100;
      parts.forEach((c) => { c.style.display = ''; });
      line.style.cssText = prevLine;
    };

    /** To isté pre obraz HEROGLYF/ALBA — nadpis je VŽDY dvojriadkový (aj na
     *  PC), takže stačí jedna sada: max šírka z DVOCH riadkov pri
     *  referenčných 100 px. */
    const measureGlfHead = () => {
      const h2 = n.glfHead;
      const lines = n.glfLines ?? [];
      if (!h2 || !lines.length) return;
      const prevHs = h2.style.getPropertyValue('--ghs');
      const prevCss = h2.style.cssText;
      h2.style.cssText += ';visibility:hidden;width:max-content;';
      h2.style.setProperty('--ghs', '100px');
      n.perGlfLine = Math.max(1, ...lines.map((l) => l.getBoundingClientRect().width)) / 100;
      h2.style.cssText = prevCss;
      if (prevHs) h2.style.setProperty('--ghs', prevHs);
    };

    /** Koľko px písma sa do obrazu zmestí.
     *  ⚠️ ROZMERY SÚ DVA, NIE JEDEN: na mobile stoja tri veľké slová POD SEBOU,
     *  takže ich neobmedzuje šírka, ale VÝŠKA okna — pri 500 px vyšla zo šírky
     *  veľkosť, ktorá pretiekla o 7 px na výšku. Berie sa menšie z oboch,
     *  presne ako pri psom bloku na /pack/dogs. */
    const bigSize = (narrow: boolean) => {
      const sec = n.nxSec;
      if (!sec || !n.perRow || !n.perWord) return 16;
      const cs = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      const fillQ = narrow ? ARC.nxt.fillPctM : ARC.nxt.fillPct;
      const vhQ = narrow ? ARC.nxt.headVhM : ARC.nxt.headVh;
      const availW = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * (fillQ / 100);
      const availH = (r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) * (vhQ / 100);
      const lines = narrow ? (n.nxWords?.length ?? 3) : 1;
      // Zhodné s CSS `.op-nxt-h2` — riadkovanie je súčasť rovnice, nie kozmetika.
      const lh = narrow ? 0.92 : 0.94;
      return Math.min(availW / (narrow ? n.perWord : n.perRow), availH / (lines * lh));
    };

    /** Koľko px písma sa do obrazu ALBA zmestí. Dva rozmery ako pri WE NEED
     *  YOU — obmedzuje ho šírka AJ výška.
     *  ⚠️ POČET RIADKOV SA ČÍTA Z DOM-U, NIE Z ČÍSLA. Do 2. 9. 2026 tu stála
     *  dvojka natvrdo („nadpis je dvojriadkový vždy"); odkedy je nadpis
     *  jednoriadkový („MEET ALBA"), by tá dvojka na nízkom okne dala presne
     *  polovičnú veľkosť — teda opak zadania. */
    const glfBigSize = (narrow: boolean) => {
      const sec = n.glf;
      if (!sec || !n.perGlfLine) return 16;
      const cs = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      const fw = narrow ? ARC.glf.fillPctM : ARC.glf.fillPct;
      const fh = narrow ? ARC.glf.headVhM : ARC.glf.headVh;
      const availW = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * (fw / 100);
      const availH = (r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) * (fh / 100);
      const lines = Math.max(1, n.glfLines?.length ?? 1);
      return Math.min(availW / n.perGlfLine, availH / (lines * 0.98));
    };

    /* ── MOST: MERANIE A VEĽKOSŤ ───────────────────────────────────────────
       Ten istý recept ako pri ALBE, len pre dva NEZÁVISLÉ jednoriadkové
       nadpisy (veta brány a otázka), ktoré na obrazovke nikdy nestoja naraz.
       🔑 MERIA SA RAZ a rovnica dopočíta veľkosť — NEMERIA sa po tom, čo sa
       veľkosť nastavila. To je tá istá slepá ulička, akú má zapísanú psí blok
       na `/pack/dogs`: meranie po nastavení je kruh. */
    const measureMost = () => {
      const one = (el: HTMLElement | null | undefined) => {
        if (!el) return undefined;
        const prevCss = el.style.cssText;
        el.style.cssText += ';visibility:hidden;width:max-content;font-size:100px;';
        const w = Math.max(1, el.getBoundingClientRect().width) / 100;
        el.style.cssText = prevCss;
        return w;
      };
      n.perMostHead = one(n.mostHead);
      n.perMostQ = one(n.mostQ);
    };

    /** Koľko px písma sa do MOSTA zmestí — zo šírky AJ z výšky, menšie z nich.
     *  Riadok je vždy jeden, takže deliteľ výšky je konštanta, nie počet
     *  riadkov (na rozdiel od `glfBigSize`, kde sa počet riadkov mení). */
    const mostSize = (perPx: number | undefined, fillPct: number, vhPct: number, capVw: number) => {
      const sec = n.most;
      if (!sec || !perPx) return 16;
      const cs = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      const availW = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * (fillPct / 100);
      const availH = (r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) * (vhPct / 100);
      // Strop vo `vw` drží obraz v mierke filmu na veľmi širokom okne — bez
      // neho by jedna krátka veta na 2560 px vyrástla do plagátu.
      return Math.min(availW / perPx, availH / 0.98, (capVw / 100) * window.innerWidth);
    };

    /** 🔴 ŠÍRKA JEDNÉHO STĹPCA TROJICE — Z DOSTUPNEJ VÝŠKY, NIE ZO ŠÍRKY.
     *  Matej 2. 9. 2026: *„obsah musí byť centrovaný ako pri prvej stránke =
     *  musí sa zmestiť, ak to nejde treba zmenšiť fotky alebo mená psov."*
     *  Ten istý recept ako `fitGw()` v DOGTRIXe: obrazu nechýba šírka (okno je
     *  široké a nízke), chýba mu výška — na 1000 × 490 px si nadpis, eyebrow,
     *  veta a tri medzery medzi beatmi vezmú toľko, že na stĺpec ostane 170 px.
     *
     *  Rovnica, nie meranie po vykreslení (výška glyfu závisí od šírky stĺpca,
     *  takže meranie by bol kruh):
     *      stĺpec = fotka (1 : 1) + medzera + meno + medzera + glyf (1 : AR)
     *      výška  = colW · (1 + nameK/100 · 1,05 + 1/AR) + 2 · medzera
     *  Vracia PERCENTO šírky trojice, lebo `.op-glf-al` je v percentách a
     *  medzera medzi stĺpcami (4 %) je tiež percentuálna.
     *
     *  Jediné, čo sa MERIA, je výška vety pod trojicou — tá sa láme podľa
     *  šírky okna a od šírky stĺpca nezávisí, takže kruh nevzniká. */
    const glfColPct = (narrow: boolean, headFinPx: number) => {
      const sec = n.glf;
      const trio = n.glfTrio;
      const cap = narrow ? ARC.glf.colM : ARC.glf.col;
      if (!sec || !trio) return cap;
      const cs = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      const trioW = trio.getBoundingClientRect().width;
      if (!trioW) return cap;
      const availH = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      // Medzera medzi beatmi platí aj pre ZBALENÉ beaty (sú to stále flex
      // položky) — preto sa počíta zo VŠETKÝCH vykreslených, nie z otvorených.
      const gapPx = parseFloat(cs.rowGap) || 0;
      const beats = 4 + (ALBA_SAME ? 1 : 0) + (ALBA_CNT ? 1 : 0);   // nadpis, eyebrow, trojica, veta
      const vh1 = window.innerHeight / 100;
      const binPad = 1.8 * vh1;   // `.op-beat > .op-bin` padding-top
      const colGap = 0.9 * vh1;   // `.op-glf-al` gap
      // Nadpis sa počíta z KONEČNEJ veľkosti, nie z tej, ktorú má práve teraz:
      // rozpočet musí platiť pre stav, v ktorom trojica stojí, nie pre okamih,
      // keď nad ňou ešte visí veľký nadpis.
      const headH = headFinPx * 0.98 + binPad;
      const eyeH = (narrow ? ARC.glf.eyePxM : ARC.glf.eyePx) * 1.2 + binPad;
      const saysBin = n.glfSays?.parentElement;
      const saysH = Math.max(saysBin?.scrollHeight ?? 0,
                             (narrow ? ARC.glf.saysPxM : ARC.glf.saysPx) * 1.5 + binPad);
      // 2 px rezerva na zaokrúhľovanie: bez nej sa stĺpec trafí presne na
      // hranicu a pol pixela navyše rozhoduje o tom, či prehliadač beaty ticho
      // stlačí (nemajú `flex-shrink: 0` — tú má scoped len DOGTRIX).
      const room = availH - gapPx * (beats - 1) - headH - eyeH - saysH - binPad - 2 * colGap - 2;
      // 1.09, nie riadkovanie mena (1.05): riadok mena nesie aj lapisovú
      // pilulku s číslom, ktorá je o kúsok vyššia než samotné písmo. Odmerané
      // na hotovom riadku (25,28 px pri písme 23,4 px), nie odhadnuté.
      const colPx = room / (1 + (ARC.glf.nameK / 100) * 1.09 + 1 / GLF_GLYPH_AR);
      return Math.max(6, Math.min(cap, (colPx / trioW) * 100));
    };

    /** Podtitul: PC celý riadok, mobil najširší z dvoch kusov — so stropom,
     *  nech na 1440 px nezmohutnie. */
    const subSize = (narrow: boolean) => {
      const sec = n.nxSec;
      if (!sec || !n.perSub || !n.perSubPart) return 16;
      const cs = getComputedStyle(sec);
      const r = sec.getBoundingClientRect();
      const availW = (r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * (ARC.nxt.subFill / 100);
      return Math.min(ARC.nxt.subMax, availW / (narrow ? n.perSubPart : n.perSub));
    };

    /** Zlato musí niesť KAŽDÉ SLOVO SAMO, ale v súradniciach CELÉHO nadpisu —
     *  inak by mal každý svoj vlastný gradient a prechod by sa na medzerách
     *  lámal. Gradient na rodičovi to nevyrieši: zabil by potomka s vlastným
     *  krytím, a krytie je tu to, čo slová privádza po jednom. */
    const paintGold = () => {
      const h2 = n.nxH2;
      const hb = h2?.getBoundingClientRect();
      if (!h2 || !hb?.width) return;
      n.nxWords?.forEach((w, i) => {
        put(w, 'agw' + i, '--bgw', hb.width.toFixed(1) + 'px');
        put(w, 'agx' + i, '--bgx', (hb.left - w.getBoundingClientRect().left).toFixed(1) + 'px');
      });
    };

    /** Zlato na oboch riadkoch nadpisu ALBA — v súradniciach CELÉHO nadpisu,
     *  inak sa prechod na medzere medzi riadkami láme (tá istá lekcia ako
     *  pri `paintGold`). */
    const paintGlfGold = () => {
      const h2 = n.glfHead;
      const hb = h2?.getBoundingClientRect();
      if (!h2 || !hb?.width) return;
      n.glfLines?.forEach((l, i) => {
        put(l, 'ggw' + i, '--gbgw', hb.width.toFixed(1) + 'px');
        put(l, 'ggx' + i, '--gbgx', (hb.left - l.getBoundingClientRect().left).toFixed(1) + 'px');
      });
    };

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
      const vid = seg(r, VID_IN[0], VID_IN[1]);
      put(n.vstage, 'vd', '--op-vid', vid.toFixed(3));
      // 🔴 PRÁZDNA SEKCIA VÍZIE KRADLA KLIK CTA DO ÚSTAVY (3. 9. 2026).
      // Odmerané: pri scrollY 3495 svieti READ THE BIBLE naplno (krytie 1,
      // pointer-events auto), ale `elementsFromPoint` v jeho strede vracia
      // SECTION.vision-video-hero — z NASLEDUJÚCEHO obrazu, s z-index 2,
      // krytím 1 a prstom `auto`, hoci --op-vid aj --op-vb sú vtedy 0.000,
      // teda vidieť z nej nie je nič. Je to tá istá porucha, akú má výjav
      // krava/pes o obraz vyššie, len o poschodie vyššie: sekcia, ktorá ešte
      // nezačala, leží v DOM-e neskôr, takže bez z-indexu vyhráva.
      // ⚠️ Vnútro (`.vhero-inner`) prst nemá — preto to nikoho nechytilo.
      //    Berie ho SÁM OBAL, čo je prázdny box cez celú obrazovku.
      // ⚠️ Prah je príchod VIDEA, nie blokov: video je prvá vec vízie, ktorú
      //    vidieť, a je zároveň jediná klikateľná (spustenie introfilmu).
      put(n.vhero, 'vhpe', 'pointerEvents', vid > 0.01 ? '' : 'none');
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
      // Výzva „skroluj ďalej" — odchod sa meria TÝM ISTÝM obdĺžnikom, aby sa
      // v tomto snímku nečítalo rozloženie druhýkrát. Noc sleduje jeho SPODNÚ
      // hranu (koniec príbehu), výzva HORNÚ (jeho začiatok).
      let keepOut = 0;
      if (n.crawl) {
        const cr = n.crawl.getBoundingClientRect();
        nightOut = seg(clamp01((vh - cr.bottom) / vh), NIGHT_OUT[0], NIGHT_OUT[1]);
        // Prílet príbehu: 0 = jeho horná hrana je ešte celú obrazovku pod
        // ohybom, 1 = dosadla na horný okraj okna (= prvý modrý riadok).
        keepOut = seg(clamp01((vh - cr.top) / vh), KEEP_OUT[0], KEEP_OUT[1]);
      }
      const night = seg(s5, WALL_IN[0], WALL_IN[1]) * (1 - nightOut);
      put(n.night, 'wl', 'opacity', night.toFixed(3));
      // Lišta a video hasnú TOU ISTOU hodnotou ako nastupuje noc — je to jeden
      // dej (*„celá obrazovka vrátane headru sčerná"*), nie tri zhody náhod.
      // Deje sa to pod závojom, takže samotné hasnutie nikto nevidí; keby ho
      // nebolo, po odchode závoja by na čiernej svietila lišta a pás videa.
      put(n.nav, 'nvo', 'opacity', (1 - night).toFixed(3));
      put(n.nav, 'nvpe', 'pointerEvents', night > 0.5 ? 'none' : '');
      // Výzva „skroluj ďalej" svieti presne na tej prázdnej čiernej: príde
      // v okamihu, keď obrazovka zhasla, a je preč skôr, než sa rozsvieti
      // prvý modrý riadok príbehu.
      // 🔴 KAŽDÝ KONIEC MERIA NIEČO INÉ A JE TO PODMIENKA, NIE NEDÔSLEDNOSŤ:
      // nábeh patrí piatej dráhe (tam obrazovka černie), odchod príletu crawlu
      // (tam sa rozsvecuje príbeh) — a medzi nimi leží ≈ 0,94 obrazovky, kde
      // je `s5` zaseknuté na 1. Zviazať oba konce jednou dráhou sa skúsilo
      // a nefunguje ani jedným smerom (viď KEEP_IN a KEEP_OUT).
      // ⚠️ `visibility` je tu nutná, nie úspora: prvok je fixed a natiahnutý
      // cez celú obrazovku, takže by pri nulovom krytí naďalej bral kliky.
      const keep = seg(s5, KEEP_IN[0], KEEP_IN[1]) * (1 - keepOut);
      put(n.keep, 'kpo', 'opacity', keep.toFixed(3));
      put(n.keep, 'kpv', 'visibility', keep <= 0.01 ? 'hidden' : 'visible');
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

      // ── 6. NEXT STEP: ZÁPIS ──────────────────────────────────────────
      // Jedna prilepená obrazovka. Čierna sa tu NEHASÍ — to robí `nightOut`
      // vyššie a meria to koncom príbehu; na čiernu nadväzuje pás recenzií,
      // ktorý je normálna sekcia a nič od tejto réžie nepotrebuje.
      if (n.arc) {
        const rect = n.arc.getBoundingClientRect();
        // Dráha = výška sekcie mínus prilepené okno. Meria sa z prvku, nie
        // z konštanty ARC_VH: tú istú hodnotu drží CSS a dve miesta s tým
        // istým číslom sa pri prvej zmene rozídu.
        const npAll = clamp01(-rect.top / Math.max(1, rect.height - vh));
        // Dráha PRVEJ obrazovky — vlastná 0–1 vnútri svojho úseku. Tým si NEXT
        // STEP drží tempo, na ktorom ho Matej doladil, aj keď sa za neho pridali
        // ďalšie dve obrazovky a celá sekcia narástla.
        const np = clamp01(npAll / ARC_SPLIT);
        // Kde sa prvá obrazovka (WE NEED YOU) prestáva hasiť a DOGTRIX začína
        // písať. Až ZA výdržou — prvá musí byť chvíľu hotová a vidieť ju celú.
        const handover1 = ARC_SPLIT + ARC_DWELL;
        // Dráha DRUHEJ obrazovky (DOGTRIX). Beží od odovzdania, takže jej
        // prvé prvky (dážď, eyebrow) sa píšu UŽ POČAS prelínačky a medzi
        // obrazovkami nevznikne prázdno — tá istá deľba ako predtým mala
        // ALBA, len o jednu obrazovku skôr.
        const dp = clamp01((npAll - handover1) / Math.max(0.001, ARC_XFADE + ARC_DGX_F));
        // Kde DOGTRIX odovzdáva ALBE — koniec jeho vlastnej dráhy AŽ ZA
        // JEHO VÝDRŽOU (ARC_DWELL2), rovnaký princíp ako handover1 vyššie:
        // DOGTRIX musí chvíľu stáť hotový (čierny klikateľný glyf), kým sa
        // začne hasiť. `dp` samo o sebe netreba meniť — jeho menovateľ
        // (ARC_XFADE + ARC_DGX_F) je nezávislý od výdrže, takže raz keď
        // dosiahne 1, ostáva na 1 (clamp01) presne tak dlho, ako trvá táto
        // výdrž — to isté správanie, aké má `np` počas ARC_DWELL pri NXT.
        const handover2 = handover1 + ARC_XFADE + ARC_DGX_F + ARC_DWELL2;
        // Dráha TRETEJ obrazovky (ALBA) — rovnaký princíp o obrazovku ďalej.
        const gp = clamp01((npAll - handover2) / Math.max(0.001, ARC_XFADE2 + ARC_GLF_F));
        // Odovzdanie 3 (alba → most) — až ZA ALBINOU VÝDRŽOU, tá istá stavba
        // ako handover1/2. `gp` medzitým sedí na 1 (clamp01), takže ALBA počas
        // výdrže stojí dopísaná a nič sa v nej nehýbe.
        const handover3 = handover2 + ARC_XFADE2 + ARC_GLF_F + ARC_DWELL3;
        // Dráha ŠTVRTEJ obrazovky (MOST).
        const mp = clamp01((npAll - handover3) / Math.max(0.001, ARC_XFADE3 + ARC_MOST_F));
        // Odovzdanie 1 (nxt → dogtrix): prvá zhasne v prvej polovici prechodu,
        // druhá nabehne v druhej — prekryv je zámerne len pár percent, aby
        // medzi nimi nevznikol strih, ale ani dva texty na sebe.
        const xfOut1 = seg(npAll, handover1, handover1 + ARC_XFADE * 0.5);
        const xfIn1 = seg(npAll, handover1 + ARC_XFADE * 0.44, handover1 + ARC_XFADE);
        // Odovzdanie 2 (dogtrix → alba) — dvojča odovzdania 1, o obrazovku ďalej.
        // 🔴 ODOVZDANIE 2 NIE JE PRELÍNAČKA, ALE POSUN (2. 9. 2026). Matej:
        // *„ALBA nabehne tak že dogtrix stále beží bez zmeny… obsah heroglyfu
        // sa posunie doľava — na stred obrazovky príde veľkým meet Alba"*.
        // Jedna hodnota, jeden dej: DOGTRIX neuberá krytie, len odchádza
        // vodorovne. Preto tu nie sú dva segmenty (out/in) ako pri odovzdaní 1
        // — druhý mechanizmus popri tomto by sa s ním bil.
        const slide2 = seg(npAll, handover2, handover2 + ARC_XFADE2);
        // Odovzdanie 3 je DVOJČA odovzdania 2, nie nový nápad: obsah ALBY
        // odchádza vodorovne doľava, dážď pod ním beží ďalej. Jedna hodnota,
        // jeden dej — preto ani tu nie sú dva segmenty (out/in).
        const slide3 = seg(npAll, handover3, handover3 + ARC_XFADE3);

        const W = ARC.nxt;
        // Fázy sú v PERCENTÁCH dráhy (tak, ako ich píše nákres) — réžia si ich
        // delí stom tu, na jedinom mieste.
        const ph = (from: number, dd?: number) =>
          seg(np, from / 100, (from + (dd === undefined ? W.dur : dd)) / 100);
        // 🔴 MOBIL NIE JE ZMENŠENÉ PC. Päť rozmerov pásu a tri rozmery nadpisu
        // majú vlastnú mobilnú sadu — bez nich sa mobil doladí len na úkor PC.
        // Hranicu drží JEDNO číslo, to isté, aké má CSS (NARROW_MAX).
        const narrow = window.innerWidth <= NARROW_MAX;
        // Pomer písma sa meria RAZ. Prvý beh réžie však môže prísť skôr, než
        // je nadpis v DOM-e — potom sa zmeria pri prvom snímku, keď je.
        if (!n.perRow) measureHead();
        // 🔴 PSY V ÚSEKU PRICHÁDZAJÚ AŽ SO SIEŤOU. `resolve()` beží raz na
        // začiatku, keď v DOM-e ešte žiadny nie je — bez tohto by ostali
        // navždy na krytí z CSS (nula) a pás by bol prázdny, hoci dáta dávno
        // dorazili. To isté pravidlo ako pri glyfoch na druhej obrazovke.
        if (!n.nxMids?.length) n.nxMids = document.querySelectorAll<HTMLElement>('.op-nxt-dog--mid');

        // ── 1–3 · FARAÓN ─────────────────────────────────────────────────
        // Jedna dráha nesie výšku, posun aj krytie.
        const rise = ph(0, W.rise);
        const grow = seg(np, W.rise / 100, W.grow / 100);
        const back = ph(W.fade, W.fadeD);
        // Výška je v % PRIESTORU POD LIŠTOU, nie vo `vh` okna — inak by „na
        // celú obrazovku" znamenalo na každom okne inú časť figúry.
        const room = '(100vh - var(--op-nav-h))';
        const hPct = mix(mix(W.h0, (W.h0 * W.gmax) / 100, grow), W.h1, back);
        put(n.nxPhar, 'aph', '--ph', `calc(${room} * ${(hPct / 100).toFixed(4)})`);
        // Kotva sa počas ústupu presúva zo spodku do STREDU okna (Matej 1. 9.
        // 2026). Nástup musí byť od spodku, inak by mu pri plnej výške hlava
        // zaliezla za lištu.
        put(n.nxPhar, 'aphb', '--pb', `calc((100vh - var(--ph)) / 2 * ${back.toFixed(3)})`);
        put(n.nxPhar, 'aphy', '--pyy', `${mix(70, 0, rise).toFixed(1)}vh`);
        // 🔴 NEZMIZNE — koniec je `o1` (14 %), nie nula: ostáva za textom.
        put(n.nxPhar, 'apho', '--po', (rise * mix(1, W.o1 / 100, back)).toFixed(3));

        // ── 4–5 · NADPIS ─────────────────────────────────────────────────
        // Obal nadpisu má krytie 1 NASTÁLO a riadok otvorený od začiatku —
        // krytie nesie každé slovo samo, inak by ich rodič privádzal naraz.
        put(n.nxBeats?.head, 'abh', 'opacity', '1');
        put(n.nxBeats?.head, 'abhr', 'gridTemplateRows', '1fr');
        n.nxWords?.forEach((w, i) => {
          put(w, 'awo' + i, '--o', ph(W.head + i * W.stag).toFixed(3));
        });
        const shr = ph(W.shrink, W.shrinkD);
        // Konečná veľkosť je vo `vw` (Matejov posuvník), nábehová sa POČÍTA.
        const finPx = ((narrow ? W.finSizeM : W.finSize) / 100) * window.innerWidth;
        put(n.nxH2, 'ahs', '--hs', `${mix(bigSize(narrow), finPx, shr).toFixed(1)}px`);
        // 🔴 VYSTÚPENIE = HUSTOTA, NIE DOSAH. Na papyruse (svetlé na svetlom)
        // sa široké rozostrenie rozriedi do neviditeľna — preto sú to tri
        // BLÍZKE vrstvy, ktoré sa sčítajú: tvrdý tmavý reliéf, mäkký hnedý
        // tieň (odlepenie od podkladu) a teplé zlaté halo.
        // A `filter`, nie `text-shadow`: písmo má `background-clip:text`, takže
        // by sa tieň kreslil podľa glyfu, nie podľa toho, čo je naozaj vidno.
        const g = W.glow / 100;
        put(n.nxH2, 'ahg', 'filter', g <= 0.001 ? 'none'
          : `drop-shadow(0 ${(1.5 * g).toFixed(2)}px 0 rgba(74,48,10,${(0.55 * g).toFixed(3)}))`
          + ` drop-shadow(0 ${(4 * g).toFixed(1)}px ${(7 * g).toFixed(1)}px rgba(74,48,10,${(0.34 * g).toFixed(3)}))`
          + ` drop-shadow(0 0 ${(10 * g).toFixed(1)}px rgba(245,199,61,${(0.5 * g).toFixed(3)}))`);
        paintGold();

        // 🔑 KRYTIE AJ VÝŠKA RIADKU Z JEDNÉHO ČÍSLA. Dva samostatné deje by sa
        // pri prvom ladení rozišli a beat by buď blikol pred svojím miestom,
        // alebo si miesto vzal skôr, než ho vidieť.
        const show = (el: HTMLElement | null | undefined, key: string, o: number) => {
          put(el, key + 'o', 'opacity', o.toFixed(3));
          put(el, key + 'r', 'gridTemplateRows', `${o.toFixed(3)}fr`);
        };

        // ── 6 · PODTITUL ─────────────────────────────────────────────────
        show(n.nxBeats?.sub, 'abs', ph(W.sub));
        put(n.nxLine, 'ass', '--ss', `${subSize(narrow).toFixed(1)}px`);

        // ── 7–8 · PÁS ────────────────────────────────────────────────────
        const bIn = ph(W.zin);
        const cnt = ph(W.count, W.countD);
        const out = ph(W.zout, W.zoutD);
        show(n.nxBeats?.bar, 'abb', bIn);

        const hekEnd = narrow ? W.hekEndM : W.hekEnd;
        const headEnd = narrow ? W.headEndM : W.headEnd;
        const midD = narrow ? W.midDM : W.midD;
        const pillS = narrow ? W.pillSM : W.pillS;
        const minFillPct = narrow ? W.minFillPctM : W.minFillPct;
        put(n.nxPlot, 'aps', '--pillS', `${pillS}px`);

        // 🔑 MIERKA OSI, NIE `scale`. `dom` = koľko psov je na os vidno.
        // Interpolácia je LOGARITMICKÁ: lineárna by strávila prvú polovicu
        // odchodu na prvých päťsto psoch a zvyšok by preletela.
        const dom = W.dom0 * Math.pow(GOAL_TARGET / W.dom0, out);
        // Cieľ počítadla je POČET PSOV VO FEEDE, nie natvrdo zapísané číslo —
        // to by po prvom novom psovi klamalo. Kým počet nedorazí, počítadlo
        // nemá kam bežať a pás ostane na svojom začiatku (Hekthor + drážka),
        // teda vyzerá rozumne aj bez dát.
        const target = dogCountRef.current ?? 0;
        const cur = Math.max(1, Math.round(mix(1, Math.max(1, target), cnt)));
        const axW = n.nxAx?.getBoundingClientRect().width || 1;
        const truePx = Math.min(axW, (cur / dom) * axW);
        // 🚩 VEDOMÁ NEPRESNOSŤ — podlaha výplne. Podiel pásu, nie pixely; celé
        // odôvodnenie aj s Matejovým citátom je pri GOAL_TARGET hore v súbore.
        const fwPx = Math.max(truePx, axW * (minFillPct / 100) * out);
        put(n.nxPlot, 'afw', '--fwpx', `${fwPx.toFixed(1)}px`);
        put(n.nxGoal, 'ago', '--go', out.toFixed(3));

        // Dve veľkosti, nie jedna: zakladateľ pri oddialení RASTIE (odchádza
        // vedľa osi a má tam byť vidno, kto to je), hlava pásu sa zmenšuje
        // s kamerou.
        put(n.nxPlot, 'apd', '--d', `${mix(54, headEnd, out).toFixed(1)}px`);
        put(n.nxAnchor, 'aad', '--d', `${mix(54, hekEnd, out).toFixed(1)}px`);
        // Na mobile ustupuje zakladateľ menej — vedľa osi tam nie je toľko
        // miesta a pás je dôležitejší než odstup.
        const anchX = mix(0, -(hekEnd / 2 + (narrow ? 4 : 20)), out);
        put(n.nxAnchor, 'aax', '--anx', `${anchX.toFixed(1)}px`);
        put(n.nxAnchor, 'aao', 'opacity', bIn.toFixed(3));

        // 🔴 MENOVKA SA MUSÍ ZMESTIŤ DO OKNA. Je vycentrovaná pod fotkou, ale
        // fotka stojí na kraji pásu — na 390 px preto polovica mena vytiekla
        // von. Zarážka ju posunie späť dovnútra: posúva sa POPISKA vlastným
        // offsetom, NIKDY značka (poloha značky je údaj). Práve preto má každá
        // menovka kotvu, ktorá stojí na X fotky.
        // ⚠️ Šírka menovky sa SMIE merať: závisí od textu, nie od niečoho, čo
        //    sama ovplyvňuje. To je rozdiel oproti veľkosti nadpisu.
        const csPlot = n.nxPlot ? getComputedStyle(n.nxPlot) : null;
        const padL = csPlot ? parseFloat(csPlot.paddingLeft) : 0;
        const padR = csPlot ? parseFloat(csPlot.paddingRight) : 0;
        const clampPill = (node: HTMLElement | null | undefined, key: string, x: number) => {
          const pill = node?.querySelector<HTMLElement>('.op-nxt-pill');
          const half = (pill?.getBoundingClientRect().width ?? 0) / 2;
          if (!pill || !half) return;
          const lo = -padL + half + 2;
          const hi = axW + padR - half - 2;
          put(pill, key, '--pdx', `${(Math.min(hi, Math.max(lo, x)) - x).toFixed(1)}px`);
        };
        clampPill(n.nxAnchor, 'aapx', anchX);
        clampPill(n.nxHead, 'ahpx', fwPx);

        // Posledný pes na páse je SKUTOČNÝ pes z feedu steny — číslo aj meno
        // patria tomu, kto na tom mieste naozaj stojí, a pri ďalšom sa prepíšu
        // samy. Text píše réžia, nie React: počas počítadla sa mení
        // sedemdesiatkrát a prekresľovať kvôli tomu celý film je zbytočné.
        const packNow = packRef.current;
        const dog = packNow.length ? packNow[Math.min(packNow.length - 1, cur - 1)] : null;
        // ⚠️ KÝM FEED NEDOBEHNE, HLAVA PÁSU SA NEKRESLÍ. Prázdny zlatý krúžok
        // na konci výplne nie je „načítava sa" — vyzerá ako pes bez fotky.
        // Obraz aj tak dáva zmysel: drážka, zakladateľ a cieľ stoja, len sa
        // nič nepočíta.
        put(n.nxHead, 'aho', 'opacity', dog ? bIn.toFixed(3) : '0');
        if (dog) {
          putText(n.nxHeadName, 'ahn', dog.name);
          putText(n.nxHeadNum, 'ahx', '#' + dog.n);
          if (n.nxHeadImg && n.nxHeadImg.getAttribute('src') !== dog.u) {
            n.nxHeadImg.setAttribute('src', dog.u);
          }
        }
        // Menovka hlavy sa píše, až keď sa počítadlo ZASTAVÍ — počas behu by
        // sa meno menilo sedemdesiatkrát a čítalo by sa ako blikanie, nie ako
        // predstavenie psa.
        put(n.nxHead?.querySelector<HTMLElement>('.op-nxt-pill'), 'ahpl', '--pl',
            cnt >= 0.999 && dog ? '1' : '0');

        // 🔴 PREKRYV, NIE ROZOSTUP (Matej 1. 9. 2026: *„nedávaj ich vedľa seba
        // s medzerou, ale s prekryvom na kope, aby sa nedali spočítať — lebo
        // teraz vidím, že ich je 5"*). Oddelené kruhy oko OKAMŽITE spočíta
        // a päť tvárí povie „je nás päť", čo je presný opak zámeru. Zhluk
        // hovorí „je nás more" a zaberie menej miesta.
        const from = anchX + mix(54, hekEnd, out) / 2;
        const to = fwPx - mix(54, headEnd, out) / 2;
        const midSpan = Math.max(0, to - from);
        const fit = Math.min(
          n.nxMids?.length ?? 0,
          Math.floor(midSpan / Math.max(3, (midD * W.overlap) / 100)),
        );
        n.nxMids?.forEach((el, i) => {
          const on = i < fit;
          put(el, 'amo' + i, 'opacity', on ? bIn.toFixed(3) : '0');
          if (!on) return;
          put(el, 'amd' + i, '--d', `${midD}px`);
          put(el, 'aml' + i, 'left', `${(from + (midSpan / fit) * (i + 0.5)).toFixed(1)}px`);
          // Prekryv potrebuje poradie vrstiev, inak je z toho kaša: bližší pes
          // je vpredu, takže zhluk „ide" zľava doprava.
          put(el, 'amz' + i, 'zIndex', String((n.nxMids?.length ?? 0) - i));
        });

        // ── 9 · ŠÍPKA → NEXT STEP → CTA ──────────────────────────────────
        const arr = ph(W.arrow, W.arrowD);
        show(n.nxBeats?.arrow, 'aba', arr);
        put(n.nxArrow, 'aad2', '--draw', arr.toFixed(3));
        show(n.nxBeats?.step, 'abt', ph(W.step));
        const ctaP = ph(W.cta, W.ctaD);
        show(n.nxBeats?.cta, 'abc', ctaP);
        // CTA neprichádza posunom, ale RASTOM — je to najväčšia vec na
        // obrazovke a posun by z nej spravil ďalší riadok, ktorý priletel.
        put(n.nxCta, 'acs', '--cs', mix(0.86, 1, ctaP).toFixed(3));
        show(n.nxBeats?.tail, 'abx', ph(W.cta + W.ctaD));

        // ── PRELÍNAČKY MEDZI TROMA OBRAZOVKAMI ────────────────────────────
        // Krytie NESIE OBRAZOVKA, nie jej prvky. Keby sa hasil každý prvok
        // sám, bolo by to päť stmievačov jedného deja — a tie sa pri prvom
        // ladení rozídu (to isté pravidlo drží `--nx-swap` na spoločnom
        // rodičovi nadpisov).
        put(n.nxt, 'ax1', 'opacity', (1 - xfOut1).toFixed(3));
        put(n.nxt, 'ax1v', 'visibility', xfOut1 >= 0.998 ? 'hidden' : 'visible');
        // 🔴 DOGTRIX UŽ NEZHASÍNA. Nabehne (xfIn1) a ostáva na plátne do konca
        // oblúka — jeho dážď je od 2. 9. 2026 pozadím aj pre obraz ALBA (na
        // konci vlastnej dráhy je stlmený na pätinu, viď `rainAmp`). Odchádza
        // len jeho OBSAH, a to bokom: `--dgx-x` posúva beaty aj bubliny doľava,
        // dažďové plátno nie. Preto je posun vo `vw`, nie v `%` — percentá by
        // každý prvok posunuli o jeho vlastnú šírku a bublina (úzka) by ostala
        // stáť na obrazovke.
        put(n.dgx, 'axd', 'opacity', xfIn1.toFixed(3));
        put(n.dgx, 'axdv', 'visibility', xfIn1 <= 0.002 ? 'hidden' : 'visible');
        put(n.dgx, 'axdx', '--dgx-x', `${(slide2 * -DGX_SLIDE_VW).toFixed(2)}vw`);
        // ALBA má krytie len ako vypínač — čo je z nej vidieť, riadia jej
        // vlastné beaty (`gp`). Druhý stmievač nad nimi by robil to isté dvakrát.
        const glfOn = gp > 0 ? 1 : 0;
        put(n.glf, 'ax2', 'opacity', glfOn.toFixed(3));
        put(n.glf, 'ax2v', 'visibility', glfOn ? 'visible' : 'hidden');
        // A ALBA odchádza rovnako, ako prišla DOGTRIXU — bokom, nie hasnutím
        // (viď `slide3`). Posun je vo `vw` z toho istého dôvodu ako `--dgx-x`:
        // v percentách by každý prvok prešiel svoju vlastnú šírku a úzke prvky
        // (eyebrow, veta) by ostali stáť na obrazovke.
        put(n.glf, 'ax2x', '--glf-x', `${(slide3 * -DGX_SLIDE_VW).toFixed(2)}vw`);
        // MOST — krytie len ako vypínač, obsah riadia jeho vlastné beaty (`mp`).
        const mostOn = mp > 0 ? 1 : 0;
        put(n.most, 'ax3', 'opacity', mostOn.toFixed(3));
        put(n.most, 'ax3v', 'visibility', mostOn ? 'visible' : 'hidden');

        // ── OBRAZOVKA 2: DOGTRIX ─────────────────────────────────────────
        // Štruktúru (dážď, glyf, kóty, bubliny) postavil samostatný mount-once
        // efekt (`dgxApiRef`) — tu sa mu len pošle aktuálny progres `dp`.
        dgxApiRef.current?.draw(dp);

        // ── OBRAZOVKA 2: HEROGLYF — TRI ALBY ─────────────────────────────
        // Prepis .op-glf (predtým tri náhodné glyfy) na dôkaz „same name,
        // different dog, different heroglyph" — nákres HGL, obraz 7.
        const G = ARC.glf;
        const pg = (from: number, dd?: number) => seg(gp, from / 100, (from + (dd ?? G.dur)) / 100);
        if (!n.perGlfLine) measureGlfHead();

        // 1–2 · nadpis (dva riadky) + klesanie na konečnú veľkosť
        const glfHeadV = Math.max(pg(G.head), pg(G.head + G.stag));
        show(n.glfHeadBeat, 'ghb', glfHeadV);
        n.glfLines?.forEach((l, i) => {
          put(l, 'gho' + i, 'opacity', pg(G.head + i * G.stag).toFixed(3));
        });
        const glfShrunk = pg(G.shrink, G.shrinkD);
        const glfBig = glfBigSize(narrow);
        const glfFin = Math.min(glfBig, ((narrow ? G.finSizeM : G.finSize) / 100) * window.innerWidth);
        put(n.glfHead, 'ghs', '--ghs', `${mix(glfBig, glfFin, glfShrunk).toFixed(1)}px`);
        paintGlfGold();

        // 3 · eyebrow „This is Alba."
        show(n.glfEyeBeat, 'geb', pg(G.eye));
        put(n.glfEye, 'ges', '--ges', `${narrow ? G.eyePxM : G.eyePx}px`);

        // 4–6 · tri stĺpce: fotka → meno (+ číslo) → glyf spod mena
        const glfPhArr = n.glfPhs ? Array.from(n.glfPhs) : [];
        const trioV = glfPhArr.length ? Math.max(...glfPhArr.map((_, i) => pg(G.photo + i * G.photoStag))) : 0;
        show(n.glfTrioBeat, 'gtb', trioV);
        glfPhArr.forEach((el, i) => {
          const v = pg(G.photo + i * G.photoStag);
          put(el, 'gpho' + i, '--gpho', v.toFixed(3));
          put(el, 'gphs' + i, '--gphs', mix(G.phZoom / 100, 1, v).toFixed(3));
        });
        // 🔴 ŠÍRKA STĹPCA UŽ NIE JE STATICKÁ V CSS (2. 9. 2026) — počíta ju
        // `glfColPct()` z dostupnej výšky a je to JEDNA hodnota pre CSS aj pre
        // veľkosť mena. Dve miesta s tým istým číslom sa pri prvej zmene
        // rozídu; tu by sa to prejavilo menom širším než fotka pod ním.
        const colPct = glfColPct(narrow, glfFin);
        put(n.glfTrio, 'gcw', '--gcol', `${colPct.toFixed(2)}%`);
        const colW = (n.glfTrio?.getBoundingClientRect().width ?? 0) * (colPct / 100);
        n.glfNms?.forEach((el, i) => {
          put(el, 'gno' + i, '--gno', pg(G.name + i * G.photoStag).toFixed(3));
          put(el, 'gns' + i, '--gns', `${Math.max(9, (colW * G.nameK) / 100).toFixed(1)}px`);
        });
        // 🔴 LEN KRYTIE (Matej 2. 9. 2026: „nacitanie heroglyphov pod obrazkom daj
        //    fade in nedeformuj ho tym nacitanim ako je to teraz"). Do 2. 9. tu boli
        //    DVA deje naraz — obal rastol 0fr→1fr a vnutro sa posuvalo v oreze, takze
        //    glyf pocas nabehu MENIL VYSKU pri nezmenenej sirke, teda sa krcil.
        //    Postupne zapalovanie (glyphStag) ostava, deformacia nie.
        n.glfGws?.forEach((el, i) => {
          const v = pg(G.glyph + i * G.glyphStag, G.glyphD);
          put(el, 'ggo' + i, '--ggo', v.toFixed(3));
        });

        // 7 · voliteľný riadok „Same name. Different dog." — VYPNUTÝ
        // (ALBA_SAME, Matej 1. 9. 2026: tri rovnaké mená nad tromi rôznymi
        // psami to už povedali).
        if (ALBA_SAME) {
          show(n.glfSameBeat, 'gsb', pg(G.same2));
          put(n.glfSame, 'gss', '--gms', `${((narrow ? G.eyePxM : G.eyePx) * 1.15).toFixed(1)}px`);
        }

        // 8 · veta o dizajne
        show(n.glfSaysBeat, 'gyb', pg(G.says));
        put(n.glfSays, 'gys', '--gys', `${narrow ? G.saysPxM : G.saysPx}px`);
        put(n.glfSays, 'gyw', '--gsw', `${G.saysW}px`);

        // 9 · číslo kombinácií — VYPNUTÉ (ALBA_CNT). Beat sa nemaže, len sa
        // nekreslí (Matej 1. 9. 2026: „určite uchovajme údaj").
        if (ALBA_CNT) {
          show(n.glfCntBeat, 'gcb', pg(G.cnt2));
          put(n.glfCntEl?.parentElement, 'gcs', '--gcs', `${narrow ? G.cntPxM : G.cntPx}px`);
        }

        // ── OBRAZOVKA 4: MOST — BRÁNA, POTOM JEDINÁ OTÁZKA ───────────────
        const M = ARC.most;
        const pm = (from: number, dd?: number) => seg(mp, from / 100, (from + (dd ?? M.dur)) / 100);
        if (!n.perMostHead) measureMost();

        // 1–2 · brána. Eyebrow a veta prichádzajú po sebe, ale ZHASÍNAJÚ
        // spoločne: je to jeden dej („brána sa zavrie"), nie dva.
        const gateOut = pm(M.out, M.outD);
        show(n.mostEyeBeat, 'meb', pm(M.eye) * (1 - gateOut));
        show(n.mostHeadBeat, 'mhb', pm(M.head) * (1 - gateOut));
        put(n.mostEye, 'mes', '--mes', `${narrow ? M.eyePxM : M.eyePx}px`);
        put(n.mostHead, 'mhs', '--mhs', `${mostSize(
          n.perMostHead,
          narrow ? M.fillPctM : M.fillPct,
          narrow ? M.headVhM : M.headVh,
          narrow ? M.capVwM : M.capVw,
        ).toFixed(1)}px`);

        // 3 · otázka. Nastupuje AŽ po zhasnutí brány (M.q = 60 > M.out + M.outD
        // = 56) a už nezhasína — obraz na nej končí a odovzdáva ju búrke
        // otázok v nasledujúcom obraze.
        show(n.mostQBeat, 'mqb', pm(M.q, M.qD));
        put(n.mostQ, 'mqs', '--mqs', `${mostSize(
          n.perMostQ,
          narrow ? M.qFillPctM : M.qFillPct,
          narrow ? M.qVhM : M.qVh,
          narrow ? M.qCapVwM : M.qCapVw,
        ).toFixed(1)}px`);
      }

      // ── RECENZIE: NADPIS V STREDE → ROZPLYNIE SA → CITÁTY V STREDE ────
      if (n.quo) {
        const rect = n.quo.getBoundingClientRect();
        const qp = clamp01(-rect.top / Math.max(1, rect.height - vh));
        // Príchod aj odchod nadpisu je JEDNA hodnota, nie dve nezávislé —
        // inak by sa pri ladení dal nastaviť stav, v ktorom nadpis odchádza
        // skôr, než dorazil.
        const qh = clamp01(seg(qp, QUO.headIn[0], QUO.headIn[1]) - seg(qp, QUO.headOut[0], QUO.headOut[1]));
        const qout = seg(qp, QUO.headOut[0], QUO.headOut[1]);
        put(n.quoHead, 'qh', 'opacity', qh.toFixed(3));
        // Nadpis pri odchode RASTIE — text, ktorý sa zväčšuje, čítame ako
        // „prešiel okolo nás". Pri zmenšovaní by to vyzeralo, že cúvol.
        put(n.quoHead, 'qht', 'transform',
            `translate(-50%, -50%) scale(${(0.96 + seg(qp, QUO.headIn[0], QUO.headIn[1]) * 0.04 + qout * 0.10).toFixed(3)})`);
        n.quoCols?.forEach((el, i) => {
          const cp = seg(qp, QUO.colsIn[0] + i * QUO.colStagger, QUO.colsIn[1] + i * QUO.colStagger);
          put(el, 'qc' + i, 'opacity', cp.toFixed(3));
          put(el, 'qct' + i, 'transform', `translateY(${((1 - cp) * 26).toFixed(1)}px)`);
        });
        // Zdroje fotiek (CC) sú právna podmienka, nie ozdoba — držia sa krytia
        // citátov, aby sa neobjavili skôr než to, k čomu patria.
        const qcr = seg(qp, QUO.colsIn[0], QUO.colsIn[1]).toFixed(3);
        put(n.quoCredits, 'qcr', 'opacity', qcr);
        // 🔴 ZDROJE SA MUSIA DAŤ ZAVRIEŤ (Matej 3. 9. 2026: *„otvorím popisok
        // ale nejde mi zavrieť — bug"*). Odmerané: panel je ABSOLÚTNY vnútri
        // prilepeného javiska, takže na konci dráhy javisko odopne a panel
        // odchádza HORE — pri scrollY 25 360 stálo jeho zhrnutie na y=55, teda
        // POD horným navom, a `elementsFromPoint` tam vrátil medailón (z-index 9),
        // nie <summary>. Klik teda dopadol na logo.
        // Druhá polovica toho istého: kým je krytie 0, panel je NEVIDITEĽNÝ,
        // ale prst berie ďalej — leží nad stĺpcami citátov, takže kradol kliky
        // niečomu, čo tam človek ani nevidí.
        // ⚠️ Nedá sa to spraviť zdvihnutím z-indexu: nad navom nesmie byť nič.
        // Preto panel v tom úseku ODÍDE z cesty — zhasne, prestane brať prst
        // a ak je otvorený, zatvorí sa sám.
        // ⚠️ PRAH JE GEOMETRICKÝ, NIE PODIEL DRÁHY. Prvý pokus vypínal panel
        // pri qp >= 0.995 — lenže javisko sa odopne o CELÚ obrazovku skôr, než
        // panel dorazí k lište, takže sa vypol na mieste, kde bol ešte celý
        // vidieť a normálne sa otváral (odmerané: pri y=25 164 stálo zhrnutie
        // na y=445, teda 320 px pod lištou, a bolo už inertné).
        // Kým je javisko PRILEPENÉ, panel stojí, kde má — vtedy sa nič nemeria.
        // Merať treba až v chvoste dráhy, a len jeden prvok.
        // 🔴 MERIA SA <summary>, NIE CELÝ <details>. Otvorený panel rastie
        // NAHOR (je ukotvený spodkom), takže jeho vlastný horný okraj zaliezol
        // pod lištu v tej istej chvíli, ako sa otvoril — a pravidlo ho hneď
        // zase zavrelo. Rozhoduje poloha toho, na čo sa klikne.
        const qcrOff = qcr === '0.000' || (rect.bottom < vh && (() => {
          const cr = n.quoCreditsSum?.getBoundingClientRect();
          return !cr || cr.top < NAV_H;
        })());
        put(n.quoCredits, 'qcrpe', 'pointerEvents', qcrOff ? 'none' : '');
        const qcrEl = n.quoCredits as HTMLDetailsElement | null | undefined;
        if (qcrOff && qcrEl?.open) qcrEl.open = false;
      }

      // Tieto tri sa menia DVAKRÁT za celý film, tak smú ostať premennými.
      const gone = o <= 0.002;
      put(n.planet, 'vis', '--op-vis', gone ? 'hidden' : 'visible');
      put(n.planet, 'pe', '--op-pe', gone ? 'none' : 'auto');
      put(n.planet, 'cv', '--op-cv', gone ? 'hidden' : 'visible');
      // Film leží nad guľou, takže kým guľa svieti, musí byť pre prst priehľadný.
      put(n.film, 'fpe', '--op-film-pe', o <= 0.02 ? 'auto' : 'none');

      setPast(p >= CTA_AT);

      // ── KTORÝ OBRAZ PRÁVE BEŽÍ (meno v pilulke + podsvietenie v menu) ────
      // 🔴 POZOROVATEĽ PRIESEČNÍKOV TU ZANIKOL (2. 9. 2026) a nie je to úspora:
      // stál na predpoklade *dve susedné sekcie nemôžu pretínať stred okna
      // naraz*, a ten vo filme neplatí ani raz. `#op-vision` je vtiahnutá
      // o obrazovku hore, `#op-religion` začína na tom istom mieste ako guľa,
      // a `#op-about` v DOM-e od 28. 8. vôbec nie je. Skončilo to sadou
      // výnimiek (`preVision`, `p < 0.55`, `sceneRef.current < 2`), ktoré len
      // opravovali jeho hlásenia — a štvrtý obraz nesvietil ani raz.
      //
      // Odkedy má každý obraz zapísanú vlastnú výšku (`FILM_SLIDES`), je to
      // jedno porovnanie: beží posledný obraz, ktorý má stred okna ZA sebou.
      // Tie isté čísla nesú aj skok z navigácie, takže sa meno a cieľ nemôžu
      // rozísť.
      const mid = window.scrollY + vh * 0.5;
      const froms = slideFromRef.current;
      let cur = 0;
      for (let i = 0; i < froms.length; i++) if (mid >= froms[i]) cur = i;
      setScene(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    applyRef.current = apply;
    apply();
    // ⚠️ Nadpis WE NEED YOU si veľkosť POČÍTA z pomeru šírka : veľkosť písma,
    // a ten je pri systémovom náhradnom písme iný. Bez tohto by po dosadnutí
    // Cinzelu skočil na inú veľkosť — a keby človek v tom momente stál,
    // vyzeralo by to ako chyba vykreslenia.
    if (document.fonts) {
      // ⚠️ Meria sa AJ nadpis ALBY. Jeho pomer je od 2. 9. 2026 zmiešaný
      // (Cinzel + Cinzel Decorative), takže odhad z náhradného písma je ďalej
      // od pravdy než predtým — a `apply()` si ho sám neprepočíta, meria len
      // raz (`if (!n.perGlfLine)`).
      document.fonts.ready.then(() => { measureHead(); measureGlfHead(); apply(); }).catch(() => { /* meranie sa opraví pri prvom scrolle */ });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── VÝŠKY OBRAZOV — jedna tabuľka pre pilulku aj pre skok ────────────────
  // Nahradilo `IntersectionObserver` nad `#op-*` (viď dôvod v scroll handleri
  // vyššie). Meria sa MIMO scrollového snímku a len keď sa niečo naozaj zmenilo:
  //  · `resize` — okno,
  //  · `ResizeObserver` nad <body> — výška obsahu (dosadnutie písma, doťahané
  //    fotky pásu, otvorená stena). Bez neho by kotvy za crawlom ostali na
  //    číslach z prvého snímku, keď ešte polovica obrázkov nemala rozmer.
  useEffect(() => {
    const measure = () => {
      slideAtRef.current = FILM_SLIDES.map((sl) => sl.at() ?? Number.POSITIVE_INFINITY);
      slideFromRef.current = FILM_SLIDES.map((sl) => sl.from() ?? Number.POSITIVE_INFINITY);
      // Nové čísla musia hneď prepočítať aj meno v pilulke — inak by na nich
      // stránka čakala do najbližšieho ťahu kolieskom.
      applyRef.current();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure).catch(() => { /* opraví to prvý resize */ });
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  // ── ZATVORENIE NAVIGÁCIE OBRAZOV ─────────────────────────────────────────
  // Klik mimo alebo Esc — ten istý odchod, aký má jazykový panel vedľa a aký
  // je v CLAUDE.md zapísaný pre plávajúce bloky (žiadny krížik).
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!sceneNavRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);


  // ── Počet psov — to isté číslo, aké kreslí stenu ─────────────────────────
  // Zámerne cez existujúci `get-grid-dogs`, nie cez nový počítací endpoint:
  // číslo pod CTA a počet kariet na stene sa nesmú rozísť.
  useEffect(() => {
    let alive = true;
    fetch(`${LIVE_EDGE_BASE}/get-grid-dogs`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d: unknown[]) => {
        if (!alive || !Array.isArray(d)) return;
        setDogCount(d.length);
        type Row = {
          pack_number?: number; dog_name?: string; cloudinary_main_url?: string | null;
        };
        // Pás: psy s fotkou, v poradí, aké dáva feed (podľa pack_number).
        // Číslo si každý nesie svoje — keby niekomu chýbala fotka, poradie
        // ostane pravdivé, len ho na páse nevidno.
        setPack((d as Row[])
          .filter((r) => typeof r.cloudinary_main_url === 'string' && r.cloudinary_main_url)
          .map((r) => ({
            n: r.pack_number ?? 0,
            name: r.dog_name ?? '',
            u: cldThumb(r.cloudinary_main_url as string),
          })));
      })
      .catch(() => { /* číslo je ozdoba, nie podmienka — sekcia funguje aj bez neho */ });
    return () => { alive = false; };
  }, []);

  // Číslo dorazilo → značka na mierke sa musí prekresliť aj bez scrollu.
  useEffect(() => {
    dogCountRef.current = dogCount;
    applyRef.current();
  }, [dogCount]);

  // Svorka dorazila → v páse pribudlo dvadsaťšesť uzlov, ktoré réžia ešte
  // nevidela, a menovka posledného psa má konečne čo napísať. To isté pravidlo
  // ako pri glyfoch vyššie: bez tohto by pás ostal prázdny až do najbližšieho
  // scrollu — a keby človek dovtedy stál, vyzeralo by to ako chyba.
  useEffect(() => { packRef.current = pack; applyRef.current(); }, [pack]);

  /** Dvadsaťšesť psov ROVNOMERNE z celej svorky — nie prvých dvadsaťšesť.
   *  Pás inak ukazuje len najstarších členov a „je nás more" sa zmení na
   *  „je nás presne toľkoto, koľko vidíš, a všetci sú z júna".
   *  ⚠️ Bazén sa stavia RAZ (`useMemo`): koľko psov sa do modrého úseku
   *  zmestí, závisí od jeho šírky, a tá sa mení každý snímok. Prestavovať DOM
   *  by znamenalo sťahovať tie isté obrázky dookola — réžia im mení len
   *  polohu, veľkosť a krytie. */
  const midDogs = useMemo(() => {
    if (pack.length < 3) return [];
    const out: string[] = [];
    for (let i = 0; i < MID_POOL; i++) {
      const idx = Math.round(1 + ((i + 1) * (pack.length - 2)) / (MID_POOL + 1));
      out.push(pack[Math.min(pack.length - 1, Math.max(0, idx))].u);
    }
    return out;
  }, [pack]);

  /**
   * KLIK NA „JOIN THE MISSION" POSUNIE FILM NA ĎALŠÍ OBRAZ.
   *
   * Matej 1. 9. 2026 (po piatich kolách otázky): tlačidlo NEVEDIE na
   * `/heroglyph`. Odchod na predajnú stránku by preskočil obrazy 7–9
   * (heroglyf + €11 · čo dostaneš · it's not a joke), teda celý pitch.
   *
   * 🔑 CIEĽ SA POČÍTA Z DRÁHY, NIE Z PEVNÉHO PIXELA. Obraz heroglyfu stojí
   * v tom istom prilepenom javisku ako WE NEED YOU, takže „ďalší obraz" je
   * poloha na scrollovacej dráhe sekcie — presne tam, kde prelínačka dobehne
   * a heroglyf je celý vidieť. Opísané číslo by sa rozišlo pri prvej zmene
   * `ARC.nxt.vh`.
   */
  const goToGlyph = useCallback(() => {
    const arc = document.querySelector<HTMLElement>('.op-arc');
    if (!arc) return;
    const vh = window.innerHeight;
    const span = Math.max(1, arc.offsetHeight - vh);
    const at = ARC_SPLIT + ARC_DWELL + ARC_XFADE;
    window.scrollTo({ top: arc.offsetTop + span * at, behavior: 'smooth' });
  }, []);

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

  /**
   * SKOK NA OBRAZ Z NAVIGÁCIE.
   *
   * 🔑 NEPOUŽÍVA `scrollIntoView` a je to dôvod, prečo tu tabuľka výšok vôbec
   * je: väčšina obrazov nemá v DOM-e vlastnú kotvu. Krava a pes, preambula
   * a vízia stoja na JEDNEJ prilepenej sekcii jeden cez druhý; WE NEED YOU,
   * DOGTRIX a ALBA takisto (`.op-arc`). `scrollIntoView` by na všetky tri
   * doletel na to isté miesto — na začiatok sekcie.
   *
   * ⚠️ Kotva je vždy DOBEHNUTÝ obraz, nie jeho začiatok (`at()`, nie `from()`).
   * Matejovo zadanie znie *„aby sme mohli rýchlo prejsť na stránku"* — teda
   * pozrieť sa na hotový obraz, nie prísť k nemu a doscrollovať si ho.
   */
  const goSlide = useCallback((i: number) => {
    setMenuOpen(false);
    // Prednosť má čerstvo zmeraná hodnota; tabuľka je poistka pre prípad, že
    // sa medzitým zmenila výška obsahu a merací efekt ešte nedobehol.
    const at = FILM_SLIDES[i].at() ?? slideAtRef.current[i];
    if (at == null || !Number.isFinite(at)) return;
    window.scrollTo({ top: Math.max(0, Math.round(at)), behavior: 'smooth' });
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
        /* ── VÝZVA „SKROLUJ ĎALEJ" ────────────────────────────────────────
           Leží nad nocou (1), nad zhasnutou lištou (60) aj NAD ZÁVOJOM (70).
           🔴 To posledné je réžia, nie vrstvenie: závoj je plná čierna, takže
           „obrazovka zhasla" nastáva UŽ POD NÍM (s5 = 0.46) — a výzva má prísť
           presne vtedy. Pod závojom by sa musela čakať na jeho odchod (0.82)
           a na čiernu by jej ostalo 250 px dráhy namiesto celej obrazovky.
           Nič sa tým neodhalí: kým závoj drží, je pod ním aj nad ním čierna.
           ⚠️ Nie je to tlačidlo a nesmie brať kliky: prvok je fixed cez celé
           okno a scroll pod ním musí prejsť. */
        .op-keep {
          position: fixed;
          left: 0; right: 0;
          /* Pod stredom zámerne — pokyn ukazuje NADOL, takže na optickom strede
             by mu chýbala cesta, kam ísť. */
          top: 58%;
          z-index: 75;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        /* Pokyn je POPISOK, nie nadpis — Space Grotesk, vzor .religion-eyebrow.
           Váha 500: načítané sú 300–600, sedemstovka by bola falošný tučný rez. */
        .op-keep-txt {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: clamp(0.74rem, 1.3vw, 0.92rem);
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(201,154,63,0.82);
          text-align: center;
          padding: 0 18px;
        }
        .op-keep-arrows {
          display: flex;
          flex-direction: column;
          align-items: center;
          /* ⚠️ Prekryv robí záporný margin, NIE gap — ten záporný byť nesmie
             (neplatná hodnota, prehliadač celú deklaráciu zahodí). */
          color: #C99A3F;
        }
        .op-keep-arrows svg { display: block; margin-top: -4px; }
        .op-keep-arrows svg:first-child { margin-top: 0; }
        /* „Zasvieti" = vlna zhora nadol, nie tri blikajúce ikonky. Preto majú
           odstup fázy a nie vlastnú, rýchlejšiu animáciu. */
        .op-keep-arrows svg { animation: opKeepGlow 1.7s ease-in-out infinite; }
        .op-keep-arrows svg:nth-child(2) { animation-delay: 0.18s; }
        .op-keep-arrows svg:nth-child(3) { animation-delay: 0.36s; }
        @keyframes opKeepGlow {
          0%, 100% { opacity: 0.20; }
          38%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .op-keep-arrows svg { animation: none; opacity: 0.75; }
        }
        @media (max-width: 768px) {
          .op-keep { top: 62%; gap: 12px; }
          .op-keep-txt { letter-spacing: 0.2em; }
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
          .op-root #op-join,
          /* 🔵 ODPOČÍVADLO NA HOTOVOM OBRAZE (Matej 1. 9. 2026: *„preletím cez
             túto sekciu a nestihnem CTA prečítať… aby som neodišiel celkom"*).
             Značka stojí presne tam, kde obraz WE NEED YOU dobehol celý —
             teda na začiatku jeho výdrže. V proximity režime to znamená, že ťah
             kolieskom, ktorý skončí niekde blízko, na hotovom obraze ODPOČINIE
             namiesto toho, aby doplával do prelínačky.
             ⚠️ NIE scroll-snap-stop: always — ten je vo filme zapísaný ako
             zamietnutý (28. 8. 2026: schodisko „1-2-2-3"). Odpočívadlo nikoho
             nezastaví, len mu dá kde zastať.
             ⚠️ Je to poistka NAD výdržou, nie namiesto nej: snap je len na
             desktope (na mobile mení lišta prehliadača 100dvh počas scrollu),
             takže na telefóne musí stačiť samotných ARC_HOLD_VH. */
          .op-root .op-arc-rest,
          /* Dvojča vyššie, o obraz ďalej — DOGTRIX dobieha svoje vlastné
             písanie (kóty, čierny klikateľný glyf) presne tak, ako WE NEED
             YOU dobieha CTA, a potrebuje to isté odpočívadlo (2. 9. 2026,
             viď ARC_HOLD2_VH). */
          .op-root .op-arc-rest2,
          /* A tretie — ALBA (2. 9. 2026, viď ARC_HOLD3_VH). */
          .op-root .op-arc-rest3 {
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
        /* Obal pilulky. Nesie kotvu rozbaľovacieho panela a preberá polohu
           v gride — pilulka sama je odteraz <button> vnútri neho.
           ⚠️ ŽIADNE width: max-content — a je to oprava, nie zjednodušenie.
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
        .main-nav .scene-nav {
          position: relative;
          justify-self: start;
          min-width: 0;
          display: flex;
        }
        .main-nav .scene-pill {
          display: flex; align-items: center; gap: 7px;
          min-width: 0;
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: 0.78rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: ${NAV_GOLD.ink};
          padding: 5px 12px 5px 14px; border-radius: 999px;
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          background: ${NAV_GOLD.activeFill};
          box-shadow: ${NAV_PILL_SHADOW};
          user-select: none;
          cursor: pointer;
        }
        /* ⚠️ Dvojtriedny selektor je nutnosť — inak pilulku trafí pravidlo
           pravidlo .main-nav button:hover (opacity 0.55) a pri prejdení myšou
           zbledne celá aj s rámom. Stmavnutie je tu vhodnejšie: pilulka je
           plocha, nie text. */
        .main-nav .scene-pill:hover { opacity: 1; filter: brightness(1.05); }
        .main-nav .scene-pill-names {
          display: grid; align-items: center; justify-items: center;
          min-width: 0;
          /* Bez tohto sa mená scvrknú na nulu: orezanie textom robí z ich
             min-content šírky 0 a flex ich v úzkej lište stlačí na doraz. */
          flex: 0 1 auto;
        }
        .main-nav .scene-pill-names > span {
          grid-area: 1 / 1;
          transition: opacity 0.22s ease;
          /* Strop je nutnosť, nie ozdoba: pilulka drží šírku NAJDLHŠIEHO názvu a ten
             sa v 18 jazykoch líši (SK „Náboženstvo" je dvojnásobok EN „Religion").
             Bez orezania lišta na telefóne pretiekla a vlajka jazyka vyšla z obrazovky. */
          min-width: 0; width: 100%; text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .main-nav .scene-pill-names > span[data-off='1'] { opacity: 0; }
        .main-nav .scene-pill-chev {
          flex-shrink: 0;
          color: rgba(42,22,8,0.55);
          transition: transform 0.18s ease;
        }
        .main-nav .scene-pill[aria-expanded='true'] .scene-pill-chev { transform: rotate(180deg); }

        /* ── ROZBAĽOVACIA NAVIGÁCIA OBRAZOV ───────────────────────────────
           Vzhľad je dvojička .lang-panel z components/LanguagePicker.tsx —
           v tej istej lište visia dva panely a dva rôzne papyrusy vedľa seba
           by sa čítali ako dva materiály.
           ⚠️ Kotva je ĽAVÁ hrana (jazyk má pravú): pilulka stojí vľavo, panel
           padajúci doprava by pri užšom okne prešiel cez medailón. */
        .main-nav .scene-menu {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          z-index: 110;
          margin: 0;
          padding: 6px;
          list-style: none;
          width: max-content;
          min-width: 100%;
          max-width: min(78vw, 300px);
          max-height: calc(100dvh - 140px);
          overflow-y: auto;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 12px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.35);
          animation: sceneMenuFade 180ms ease-out;
        }
        @keyframes sceneMenuFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .main-nav .scene-menu li { display: block; }
        /* ⚠️ Trojtriedny selektor prebíja .main-nav button (padding 5/12,
           priehľadný rám, radius 999) — bez neho by z položiek boli pilulky. */
        .main-nav .scene-menu .scene-menu-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%;
          padding: 7px 10px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: ${LAB.ink};
          font-family: 'Cinzel', serif; font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          text-align: left;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .main-nav .scene-menu .scene-menu-item:hover {
          opacity: 1;
          background: rgba(201,154,63,0.18);
          border-color: rgba(201,154,63,0.45);
        }
        .main-nav .scene-menu .scene-menu-item.on {
          opacity: 1;
          background: rgba(201,154,63,0.28);
          border-color: rgba(201,154,63,0.65);
        }
        /* Poradové číslo je ÚDAJ, nie meno — Space Grotesk, strop váhy 600. */
        .main-nav .scene-menu-no {
          flex-shrink: 0;
          min-width: 13px;
          font-family: 'Space Grotesk', sans-serif; font-weight: 600;
          font-size: 0.62rem; letter-spacing: 0.04em;
          color: rgba(110,74,20,0.7);
        }
        .main-nav .scene-menu-nm {
          min-width: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
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
          .main-nav .scene-nav { max-width: 36vw; }
          .main-nav .scene-pill { font-size: 0.64rem; letter-spacing: 0.06em; padding: 4px 8px 4px 10px; gap: 5px; }
          .main-nav .scene-menu { max-width: min(72vw, 260px); }
          .main-nav .scene-menu .scene-menu-item { font-size: 0.66rem; padding: 8px 10px; }
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
        /* ── RECENZIE VO FILME NEMAJÚ VLASTNÉ POZADIE ─────────────────────
           Matej 31. 8. 2026: *„recenzie-next step = ine pozadie! oprav to!
           cela stranka ma mat to isté bledé pozadie"*.
           TestimonialsSection si v papyrusovom variante maľuje gradient
           končiaci na #EFDEBB — to je HORNÝ ODTIEŇ PÄTIČKY a na /about má
           zmysel, lebo tam je pás poslednou vecou pred ňou a koniec stránky
           má byť jeden povrch. Vo filme stojí uprostred, takže z toho istého
           gradientu je tmavý pruh cez celú šírku.
           Prepisuje sa TU a nie v komponente: /about je ostrá a jej diff
           musí ostať prázdny. Dôležitosť je nutnosť — pozadie je inline
           style a bežné pravidlo by ho neprebilo.
           ⚠️ Karty a stĺpce si svoje pozadie NECHÁVAJÚ; ruší sa len povrch
           SEKCIE, ktorý má byť stránka. */
        .op-root #testimonials { background: transparent !important; }

        /* ── RECENZIE: PRILEPENÝ OBRAZ ────────────────────────────────────
           Nadpis stojí v strede okna, rozplynie sa a na jeho miesto dosadnú
           citáty. Réžia je v QUO (hore v súbore), tu je len geometria.
           ⚠️ NADPIS JE ABSOLÚTNY A JE TO NUTNOSŤ, nie vkus: keby ostal v toku,
           pri jeho zmiznutí by citáty poskočili o jeho výšku. Obraz WE NEED YOU
           rieši to isté inak — beat, ktorý ešte neprišiel, tam miesto nedrží
           (grid-template-rows 0fr) a pri odchode ho zase pustí. */
        .op-quo { position: relative; height: ${QUO_VH * 100}vh; }
        .op-quo-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        /* Rezerva na lištu na OBOCH koncoch: obsah sa centruje v tom, čo
           z výšky ostane, takže nesúmerná rezerva posadí celý obraz nízko.
           ⚠️ .op-nxt to od 1. 9. 2026 NEROBÍ — jeho obsah si veľkosť počíta
           z priestoru, ktorý mu odsadenie nechá, a čísla sú odmerané v nákrese. */
        .op-root .op-quo #testimonials {
          position: absolute;
          inset: 0;
          padding: var(--op-nav-h) 0;
          display: grid;
          place-items: center;
        }
        .op-root .op-quo #testimonials > div { width: 100%; }
        .op-root .op-quo .tst-head {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(90vw, 760px);
          /* Prebíja utilitu mb-12 md:mb-16 — v absolútnom prvku by odsadenie
             posunulo jeho optický stred. Vyššia špecifickosť, nie !important. */
          margin: 0;
          opacity: 0;
          pointer-events: none;
        }
        /* Inline maxHeight 640px drží komponent (na /about je to správne — tam
           pás stojí v toku). Vo filme musí zmiznúť pod lištu, preto !important:
           inline zápis sa inak prebiť nedá. */
        .op-root .op-quo .tst-cols {
          max-height: min(640px, calc(100dvh - 2 * var(--op-nav-h) - 96px)) !important;
        }
        .op-root .op-quo .tst-cols > div { opacity: 0; }
        /* Zdroje fotiek (CC) sú právna podmienka vrstvy, nie ozdoba — musia byť
           vidieť. Sedia ABSOLÚTNE pri spodnej hrane, aby citáty ostali presne
           v strede okna; v toku by ich o svoju výšku vytlačili hore. */
        /* ── ZDROJE FOTIEK: MENŠIE A NENÁPADNEJŠIE (Matej 3. 9. 2026) ─────
           Matej: *„zdroje na fotky treba zmenšiť a dať ešte nenápadnejším
           písmom."* Je to právna podmienka licencií CC, takže zmiznúť nesmú —
           ale nemajú súperiť s citátmi, kvôli ktorým tam človek je.
           ⚠️ PREPISUJE SA TU, NIE V KOMPONENTE: ten istý pás beží aj na ostrej
           /about, kde stojí ako posledná vec pred pätičkou a väčšie písmo tam
           je správne. Diff /about musí ostať prázdny.
           ⚠️ Text sa zmenšuje, ale CIEĽ PRSTA nie — odsadenie na zhrnutí drží
           výšku na 24 px. Inak by z toho bol 9 px vysoký prúžok, do ktorého sa
           na telefóne nedá trafiť. */
        .op-root .op-quo .tst-credits > summary {
          font-size: 9.5px;
          letter-spacing: .08em;
          padding: 4px 8px;
          opacity: .72;
        }
        .op-root .op-quo .tst-credits > summary:hover { opacity: 1; }
        .op-root .op-quo .tst-credits > p {
          font-size: 9px;
          line-height: 1.7;
          opacity: .82;
        }
        .op-root .op-quo .tst-credits {
          position: absolute;
          left: 50%;
          bottom: calc(var(--op-nav-h) * 0.34);
          transform: translateX(-50%);
          width: min(90vw, 640px);
          margin: 0;
          /* ⚠️ STROP NIE JE VKUS. Panel je ukotvený SPODKOM, takže otvorený
             rastie nahor — a bez stropu si vyzobal miesto až pod hornú lištu,
             kde je jeho text nečitateľný a zhrnutie sa nedá kliknúť.
             --op-nav-h je jediné miesto s výškou lišty (rezerva 2× je na
             spodné ukotvenie aj na lištu samu). */
          max-height: min(30vh, calc(100dvh - 2 * var(--op-nav-h)));
          overflow: auto;
          opacity: 0;
        }

        /* ── OBLÚK: DVE OBRAZOVKY V JEDNOM JAVISKU ────────────────────────
           Obe sú ABSOLÚTNE a ležia na sebe; prepína ich prelínačka v réžii.
           Kým boli v toku, prechod medzi nimi bol scroll — a ten sem
           nepatrí (Matej 31. 8. 2026: *„ďalšia obrazovka sa fadne, tu nebude
           scrol"*). */
        .op-arc { position: relative; height: ${ARC_VH * 100}vh; }
        /* Odpočívadlo — nula obsahu, jediná úloha je byť súradnicou pre snap.
           Odsadenie je presne dráha prvej obrazovky, teda okamih, keď je
           WE NEED YOU celé vidieť aj s CTA. */
        .op-arc-rest {
          position: absolute;
          left: 0;
          top: ${ARC.nxt.vh}vh;
          width: 1px;
          height: 1px;
          pointer-events: none;
        }
        /* Dvojča vyššie, o obraz ďalej — sedí presne tam, kde DOGTRIX
           dobehne svoje vlastné písanie a začína jeho výdrž (ARC_REST2_VH,
           2. 9. 2026). */
        .op-arc-rest2 {
          position: absolute;
          left: 0;
          top: ${ARC_REST2_VH}vh;
          width: 1px;
          height: 1px;
          pointer-events: none;
        }
        /* Tretie odpočívadlo — ALBA dopísala tri glyfy aj výzvu a začína jej
           výdrž (ARC_REST3_VH, 2. 9. 2026). Ten istý dôvod ako pri dvoch
           vyššie: obraz, ktorý dobehol, musí mať kde odpočinúť. */
        .op-arc-rest3 {
          position: absolute;
          left: 0;
          top: ${ARC_REST3_VH}vh;
          width: 1px;
          height: 1px;
          pointer-events: none;
        }
        .op-arc-stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .op-arc-scr {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        /* ── OBRAZ 6 — WE NEED YOU ───────────────────────────────────────
           Rezervu pod hornou lištou drží PREMENNÁ, nie vlastné číslo — inak sa
           pri zmene MEDAL.lift rozíde s preambulou aj s hero vízie.
           ⚠️ ZRKADLENÁ REZERVA TU UŽ NIE JE (bola tu do 1. 9. 2026 kvôli tomu,
           že obraz opticky sedel nízko). Dôvod zanikol spolu s obsahom: dnes je
           najvyššou vecou obrazu faraón kotvený na SPODOK okna, ktorého výška
           sa počíta z priestoru pod lištou — a hodnoty odsadenia sú súčasťou
           rovnice, ktorou si nadpis počíta veľkosť. Sú odmerané v nákrese na
           pásme 390/500/860/1440 px. */
        .op-nxt {
          gap: 0;
          padding: calc(var(--op-nav-h) + 8px) 5vw 4vh;
        }

        /* 🔴 FARAÓN SA KOTVÍ NA SPODOK, NIE NA STRED (Matej 1. 9. 2026:
           *„nástup faraóna bude zdola a bude veľký cez celú obrazovku — pod
           lištu, aby mu bola vidno hlava"*). Pri strede sa výška rozdelí na obe
           strany, takže „na celú výšku" znamená, že mu hlava zalezie za lištu.
           Od spodku je 100 % presne priestor POD lištou.
           A počas ústupu sa kotva PRESÚVA do stredu okna (*„daj faraóna do
           stredu viewportu"*) — nástup musí byť od spodku, ale zvyšok obrazu už
           figúru nesie ako pozadie, a to patrí do stredu. Jedna premenná
           (--pb), jeden dej.
           ⚠️ z-index 0: text obrazu leží NAD ním. */
        .op-nxt-phar {
          position: absolute;
          left: 50%;
          bottom: var(--pb, 0px);
          height: var(--ph, 60vh);
          transform: translateX(-50%) translateY(var(--pyy, 0px));
          opacity: var(--po, 0);
          object-fit: contain;
          pointer-events: none;
          z-index: 0;
          filter: drop-shadow(0 22px 40px rgba(60,40,10,0.28));
        }

        /* 🔴 BEAT, KTORÝ EŠTE NEPRIŠIEL, NESMIE DRŽAŤ MIESTO.
           Kým boli všetky beaty v toku, „obrovský nadpis cez celú stranu" nebol
           veľký na celú stranu — bol veľký na to, čo ostalo po rezervácii
           miesta pre päť vecí, ktoré na obrazovke ešte nie sú (pri 1440 px to
           pretieklo o 108 px, hoci nadpis sám zaberal sotva polovicu). Riadok
           rastie z 0fr na 1fr spolu s krytím, takže si beat miesto vezme, až
           keď prichádza — a odsadenie zmizne s ním.
           ⚠️ ODSADENIE PATRÍ DOVNÚTRA OBALU, nie ako vlastnost gap na kontajneri: gap
           medzi zbalenými riadkami ostane a nasčíta sa (preto má .op-nxt gap 0). */
        .op-beat {
          opacity: var(--o, 0);
          width: 100%;
          display: grid;
          grid-template-rows: 0fr;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }
        .op-beat > .op-bin {
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2vh;
          padding-top: 1.8vh;
        }

        /* ── NADPIS ──────────────────────────────────────────────────────
           Veľkosť (--hs) POČÍTA RÉŽIA zo šírky AJ z výšky — tu je len sadzba.
           Zlato nesie každé slovo samo, ale v súradniciach celého nadpisu
           (--bgw / --bgx), inak sa gradient na medzerách láme. */
        .op-nxt-h2 {
          margin: 0;
          font: 700 var(--hs, 15vw)/0.94 'Cinzel', serif;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          column-gap: 0.22em;
          row-gap: 0;
          max-width: 100%;
        }
        .op-nxt-h2 span {
          opacity: var(--o, 0);
          background: linear-gradient(96deg, #6E4A12 0%, #C99A3F 34%, #F5C73D 58%, #A3782B 100%);
          background-size: var(--bgw, 100%) 100%;
          background-position: var(--bgx, 0) 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .op-nxt-h2 i { font-style: normal; margin-left: -0.06em; }

        /* 🔴 POČET RIADKOV SA NEZARIAĎUJE ZALOMENÍM (Matej 1. 9. 2026: *„na pc
           jeden riadok, na mobile 2"*). Zalomenie hovorí KDE sa zlomí, nie koľko
           riadkov vznikne — pri užšom okne sa zlomí aj inde. Preto sú to dva
           kusy, každý s nowrap, a veľkosť sa dopočíta tak, aby sa najširší
           z nich zmestil.
           DOGYPT je značka, nie slovo vety — Cinzel a zlato. */
        .op-nxt-line {
          margin: 0;
          max-width: 100%;
          font: 400 var(--ss, 16px)/1.45 'Space Grotesk', sans-serif;
          color: ${LAB.inkSoft};
        }
        .op-nxt-line span { white-space: nowrap; }
        .op-nxt-line span + span { margin-left: 0.34em; }
        .op-nxt-line b {
          font: 700 1.04em/1 'Cinzel', serif;
          color: ${LAB.goldSolid};
          letter-spacing: 0.02em;
        }

        /* ── PÁS ─────────────────────────────────────────────────────────
           Os je hlavný dej obrazu — dostáva takmer celú šírku. Bočné odsadenia
           nesú menovky (vľavo zakladateľ VEDĽA osi, vpravo cieľ), preto nie sú
           rovnaké.
           ⚠️ Spodná rezerva je v PIXELOCH: menovka visí pevných 30 px pod
           čiarou a má pevnú veľkosť písma. Vo vh sa pri nižšom okne zmenšila
           a beat (ktorý má overflow:hidden kvôli rastu z 0fr) jej odrezal spodok.
           ⚠️ Bočná rezerva NIE JE estetika: kotva stojí na začiatku pásu a jej
           menovka je širšia než fotka, takže vycentrovaná na nule vytekala
           z okna. Rezervu drží PLOT — inak by ju musela poznať každá menovka. */
        .op-nxt-plot {
          position: relative;
          width: min(1180px, 97%);
          padding: 70px 58px 62px 92px;
        }
        .op-nxt-ax { position: relative; height: 14px; display: flex; align-items: center; }

        /* ŽLIABOK VYRYTÝ DO PAPYRUSU, nie priesvitná čiarka (Matej 31. 8. 2026:
           *„progres bar zatraktívni"*). Plochý pásik v priehľadnej modrej
           vyzeral ako nedokreslený prvok; drážka s tieňom dovnútra a svetlou
           spodnou hranou je predmet, ktorý na papyruse leží. */
        .op-nxt-groove {
          position: absolute;
          left: 0; right: 0;
          height: 9px;
          border-radius: 999px;
          background: rgba(122,90,42,0.16);
          border: 1px solid ${LAB.edge};
          overflow: hidden;
          box-shadow:
            inset 0 2px 5px rgba(90,58,12,0.42),
            inset 0 -1.5px 0 rgba(255,255,255,0.70);
        }
        /* Výplň = koľko psov už je. Šírku (--fwpx) počíta réžia z mierky osi. */
        .op-nxt-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: var(--fwpx, 0px);
          background: linear-gradient(180deg, ${LAPIS.lite}, ${LAPIS.deep});
        }

        /* Cieľ stojí NAD pásom, v jednom riadku s menovkou posledného psa
           (Matej 1. 9. 2026: *„ten goal daj hore pri progresbar"*), a BEZ
           zvislej značky — tá ukazovala na koniec pásu, čiže hovorila to, čo
           už bolo vidieť. Pod pásom tak ostal sám zakladateľ: dolné pole nesie
           ZAČIATOK, horné to, čo sa hýbe, a koniec. */
        .op-nxt-goal {
          position: absolute;
          top: 50%; left: 100%;
          transform: translate(-100%, calc(-100% - var(--goalY, 14px)));
          opacity: var(--go, 0);
          display: flex;
          align-items: baseline;
          gap: 7px;
          white-space: nowrap;
        }
        .op-nxt-goal b { font: 700 15px/1 'Cinzel', serif; color: ${LAB.ink}; }
        .op-nxt-goal em {
          font: 500 9.5px/1 'Space Grotesk', sans-serif;
          font-style: normal;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
        }

        /* 🔴 MENOVKA NIE JE ČASŤ FOTKY (Matej 1. 9. 2026: *„Hektorova pils musí
           byť čitateľná aj po shrinku"*). Kým visela na --d, zmenšila sa spolu
           s fotkou na 13 px a meno zaniklo. Fotka sedí NA čiare a mení veľkosť
           s kamerou; menovka stojí v pevnej vzdialenosti od čiary a má vlastnú
           veľkosť písma. */
        .op-nxt-dog { position: absolute; top: 50%; transform: translateX(-50%); pointer-events: none; }
        .op-nxt-dog img {
          position: absolute;
          left: 50%; top: 0;
          transform: translate(-50%, -50%);
          width: var(--d, 54px);
          height: var(--d, 54px);
          /* 🔴 ZRUŠENÝ STROP ŠÍRKY NIE JE KOZMETIKA. Globálny reset dáva
             každému obrázku strop 100 %, a percento sa počíta z OBAĽUJÚCEHO
             BLOKU — tým je tu .op-nxt-dog, ktorý má šírku NULA (všetky jeho
             deti sú absolútne). Fotka sa preto zrezala na 0 px a z pásu ostal
             rad zlatých čiarok: výška sedela, šírka nie. V nákrese sa to
             neprejavilo, lebo ten žiadny reset nemá. */
          max-width: none;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid ${LAB.goldSolid};
          box-shadow: 0 4px 14px rgba(60,40,10,0.35);
          background: #EFE3C8;
        }
        /* 🔵 MENOVKA JE PRIESVITNÝ TINT, NIE PLNÁ FARBA (Matej 1. 9. 2026:
           *„mená skúsme dať do väčších, ale priesvitných pils, nie plných"*).
           Sedí to s brandom: plná farebná plocha je rezervovaná pre JEDINÉ
           hlavné CTA na obrazovke — a tým je JOIN THE MISSION dole.
           ⚠️ Čitateľnosť nesie TMAVÝ inkoust a plný farebný rám, nie krytie
           výplne (tá istá lekcia ako pri chipoch 26. 8. 2026). */
        .op-nxt-pill {
          position: absolute;
          left: 50%;
          top: var(--pillY, 32px);
          transform: translateX(calc(-50% + var(--pdx, 0px)));
          display: inline-flex;
          align-items: baseline;
          gap: 7px;
          white-space: nowrap;
          padding: 4px 12px;
          border-radius: 999px;
          background: ${tintRGBA(LAPIS.edge, 0.13)};
          border: 1.5px solid ${tintRGBA(LAPIS.edge, 0.62)};
          opacity: var(--pl, 1);
        }
        /* Meno psa = Cinzel Decorative. Film je REPREZENTÁCIA PSA NAVONOK, teda
           ten istý povrch ako WALL — nie bežná prevádzka, kde smie byť meno
           v obyčajnom Cinzeli. ⚠️ Načítané váhy sú len 700 a 900. */
        .op-nxt-pill em {
          font: 700 var(--pillS, 17px)/1 'Cinzel Decorative', 'Cinzel', serif;
          font-style: normal;
          color: ${LAPIS.deep};
        }
        /* Číslo je VÄČŠIE než meno — je to poradie vo svorke, teda to, čo si
           človek premietne na seba („ja budem 73"). */
        .op-nxt-pill b {
          font: 700 calc(var(--pillS, 17px) * 1.12)/1 'Cinzel', serif;
          color: ${LAPIS.edge};
        }
        /* 🔴 KOTVA — zvislá čiarka od fotky k menovke. Stojí na X FOTKY, nie
           menovky: menovka sa pri okraji okna posúva (--pdx), takže bez kotvy
           sa nedá povedať, ku ktorému psovi patrí. */
        .op-nxt-tie {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          border-radius: 1px;
          background: ${tintRGBA(LAPIS.edge, 0.5)};
          top: calc(var(--d, 54px) / 2 - 2px);
          height: calc(var(--pillY, 32px) - var(--d, 54px) / 2 + 2px);
        }
        /* Zakladateľ ustúpi VEDĽA osi (--anx) a prestane byť prvým dielikom
           mierky; hlava pásu sa drží konca výplne. */
        .op-nxt-dog--anchor { left: var(--anx, 0px); z-index: 39; }
        .op-nxt-dog--head { left: var(--fwpx, 0px); z-index: 40; }
        /* Posledný pes má menovku NAD pásom (Matej 1. 9. 2026). */
        .op-nxt-dog--head .op-nxt-pill { top: auto; bottom: var(--pillY, 32px); }
        .op-nxt-dog--head .op-nxt-tie { top: auto; bottom: calc(var(--d, 54px) / 2 - 2px); }
        /* Psy medzi nimi sú MENŠIE zámerne — Matej: *„len Hektor a konečný pes
           budú väčšie"*. Vyplnený úsek tak nie je farebná plocha, ale zhluk
           tvárí, z ktorého dva konce vystupujú. */
        .op-nxt-dog--mid img { border-width: 2px; box-shadow: 0 2px 8px rgba(60,40,10,0.3); }

        /* ŠÍPKA — kreslí sa (stroke-dasharray) a ukazuje na NEXT STEP. */
        .op-nxt-arrow { width: 34px; height: 52px; overflow: visible; }
        .op-nxt-arrow path {
          fill: none;
          stroke: ${LAB.goldSolid};
          stroke-width: 2.4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 120;
          stroke-dashoffset: calc(120 * (1 - var(--draw, 0)));
        }

        /* 🔴 NEXT STEP JE POPISKA, NIE NADPIS (Matej 1. 9. 2026: *„next step
           musí byť groteskom a malým"*). Nadpis obrazu je WE NEED YOU — dva
           veľké Cinzel nápisy na jednej obrazovke si konkurujú, a tá veľká vec
           dole má byť CTA.
           ⚠️ Space Grotesk je načítaný len 300–600 → 500, nie 700 (fake bold). */
        .op-nxt-ns {
          margin: 0;
          font: 500 11px/1 'Space Grotesk', sans-serif;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: ${LAB.goldInk};
          white-space: nowrap;
        }

        /* ── CTA ─────────────────────────────────────────────────────────
           🔵 LAPIS je hlavné CTA (brandový kánon 28. 8. 2026), geometriu
           (radius 8, NIE pilulka) preberá od .btn-gold — mení sa výplň, nie
           tvar. Zlaté písmo na modrom nie je ozdoba: lapis + zlato je pôvodná
           egyptská dvojica a bez nej je to len tmavé tlačidlo bez brandu. */
        .op-nxt-cta {
          display: inline-block;
          border: 1.5px solid rgba(250,244,236,0.30);
          border-radius: 8px;
          padding: clamp(11px, 1.5vh, 18px) clamp(20px, 3.4vw, 42px);
          background: ${LAPIS.grad};
          box-shadow: ${LAPIS_BTN_SHADOW};
          font: 700 clamp(15px, 2.3vw, 30px)/1 'Cinzel', serif;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: ${LAPIS.ink};
          transform: scale(var(--cs, 1));
          cursor: pointer;
        }
        .op-nxt-cta:hover { background: ${LAPIS.gradHover}; }
        /* Riadok pod tlačidlom je jeho POPISKA, nie druhé CTA: Space Grotesk,
           bez rámu, bez farebnej plochy. */
        .op-nxt-ctasub {
          margin: 10px 0 0;
          font: 500 clamp(12px, 1.35vw, 17px)/1.35 'Space Grotesk', sans-serif;
          letter-spacing: 0.02em;
          color: ${LAB.inkSoft};
          min-height: 1.35em;
        }
        .op-nxt-ctasub b { font: 700 1.12em/1 'Cinzel', serif; color: ${LAPIS.edge}; }

        /* 🔴 MOBIL NIE JE ZMENŠENÉ PC — je to iná sadzba (Matej 1. 9. 2026:
           *„na mobile môže byť we-need-you pod sebou 3 veľké slová"*): na úzkom
           okne stoja tri slová pod sebou a KAŽDÉ je veľké, nie tri malé v rade.
           ⚠️ HRANICA JE NARROW_MAX — to isté číslo číta réžia. Dve rôzne
           hranice vyrobia pásmo šírok bez pravidiel. */
        @media (max-width: ${NARROW_MAX}px) {
          .op-nxt-h2 { flex-direction: column; column-gap: 0; line-height: 0.92; }
          .op-nxt-line span { display: block; margin-left: 0; }
          /* Na mobile je každý pixel šírky vzácny: menovky klesnú nižšie, aby
             si nekonkurovali s cieľom, a os dostane skoro celý riadok. */
          .op-nxt-plot { width: 100%; padding: 62px 16px 62px 50px; }
          .op-nxt-goal { transform: translate(-100%, calc(-100% - var(--goalY, 64px))); }
        }

        /* ── CHVOST OBRAZU (ARC_TAIL) ────────────────────────────────────
           🚩 DNES VYPNUTÝ. Štýly ostávajú, aby sa dal vrátiť jedným prepnutím
           konštanty — je to Matejov vlastný variant z 31. 8. 2026 a zamietnuté
           kolá sa nemažú.
           NÁPAD: kartuš je NEVYPLNENÝ a čaká. Hovorí o naliehavosti bez
           jediného slova o naliehavosti — žiadne „hurry up", žiadny odpočet.
           Prerušovaný rám je v tomto brande jediný spôsob, ako nakresliť „ešte
           to nie je": plný zlatý rám znamená hotový doklad. */
        /* Veta „All you can do is —" (chvost obrazu WE NEED YOU, ARC_TAIL).
           Cinzel, nie Space Grotesk: je to výzva, nie popis.
           ⚠️ Obraz HEROGLYF (ALBA) túto vetu už nepreberá — začína vlastným
           nadpisom (.op-glf-h2), nie dopovedaním. */
        .op-nxt-lead {
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 2.2vw, 1.6rem);
          line-height: 1.35;
          letter-spacing: 0.01em;
          color: ${LAB.ink};
        }
        .op-nxt-be {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(7px, 1vh, 12px);
        }
        .op-nxt-be-slot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(10px, 1.4vh, 16px) clamp(24px, 3.2vw, 40px);
          /* ⚠️ Radius 8 je ten istý ako na .btn-gold a na heroglyfovom kartuši.
             Pilulka (999px) by z dokladu spravila štítok. */
          border-radius: 8px;
          background: linear-gradient(180deg, rgba(253,248,236,0.75), rgba(240,226,196,0.60));
          border: 2px dashed rgba(201,154,63,0.90);
          /* Vnútorný tieň = miesto je VYHĹBENÉ, teda prázdne. Bez neho je to
             len obrys a číslo v ňom vyzerá zapísané. */
          box-shadow: inset 0 2px 8px rgba(110,71,16,0.16);
        }
        .op-nxt-be-num {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2rem, 4.4vw, 3.2rem);
          line-height: 0.9;
          letter-spacing: 0.01em;
          /* Bledý lapis: číslo ešte NIE JE pridelené. V plnej farbe by vyzeralo
             obsadené a celý nápad „toto miesto je voľné" by padol. */
          color: ${tintRGBA(LAPIS.edge, 0.42)};
          white-space: nowrap;
        }
        /* Mriežka je MENŠIA a POLOVYSADENÁ — je to značka poradia, nie číslica.
           V rovnakej veľkosti by z „#73" boli tri rovnocenné znaky. */
        .op-nxt-be-num i {
          font-style: normal;
          font-size: 0.52em;
          vertical-align: 0.42em;
          letter-spacing: 0;
          margin-right: 0.06em;
          opacity: 0.78;
        }
        .op-nxt-be-free {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: clamp(0.6rem, 1.1vw, 0.68rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: ${LAB.goldInk};
        }

        /* ── OBRAZOVKA — DOGTRIX (dážď + dekodér heroglyfu) ────────────────
           Matej 1. 9. 2026: „v dogtrixe budú iba heroglyfy… nadpis heroglyf
           nesmie zostať taký malý… pred každým kótovaním musia zasvietiť,
           zapulzovať… cieľom je aby na konci bol heroglyf čierny a
           klikateľný." Krytie CELEJ obrazovky (crossfade z/na susedné
           obrazy) nesie réžia — tu je len geometria a materiál. */
        /* ⚠️ position ostáva na .op-arc-scr (absolute; inset:0) — DOGTRIX je
           tretia obrazovka toho istého prelínajúceho javiska ako WE NEED YOU
           a ALBA a nesmie si prepísať vlastnú polohu v stacku. */
        /* 🔴 OBSAH V STREDE PRIESTORU POD LISTOU (Matej 2. 9. 2026, s nakresom:
           „skratka chcem aby to bolo v strede… hore je vacsi priestor ako dolu").
           justify-content:center na .op-arc-scr tu bolo uz predtym a MATEMATICKY
           centrovalo spravne — lenze centrovalo SKATULU, nie to, co je vidiet.
           Dve nesymetrie posuvali obraz nadol:
             1. KAZDY beat ma padding-top: 1.8vh (.op-beat > .op-bin), takze NAD
                prvym beatom je medzera a POD poslednym ziadna;
             2. rezerva --op-nav-h (124px) je o 12px vacsia nez spodok medailonu
                (112px) — ten rozdiel je dychacia medzera listy, nie obsahu.
           Spolu teda 1.8vh + 12px navyse hore. Posuvame o POLOVICU: tolko dole
           z horneho odsadenia, tolko hore do spodneho.
           ⚠️ SUCET ODSADENI SA NEMENI, a to je zamer — fitGw() cita
           availH = height − paddingTop − paddingBottom, takze vyskovy rozpocet
           aj velkost glyfu ostavaju presne take, ake boli. Toto je posun, nie
           zmensenie. Kto zmeni 1.8vh v .op-bin alebo MEDAL.lift, meni aj toto. */
        /* 🔴 JEDNO MIESTO PRE OBE OBRAZOVKY (2. 9. 2026). ALBA ma ROVNAKU
           stavbu beatov a teda aj rovnaku chybu; kym mala vlastne odsadenie
           (nav + 8px hore, 4vh dole), sedela nizsie nez DOGTRIX a Matejova
           podmienka „obsah musi byt centrovany ako pri prvej stranke" by
           platila len na jednej z nich. Dva recepty na to iste sa pri prvej
           zmene rozidu — preto spolocny selektor, nie kopia hodnot. */
        .op-dgx, .op-glf {
          --arc-center-fix: calc((1.8vh + 12px) / 2);
          padding:
            calc(var(--op-nav-h) + 18px - var(--arc-center-fix))
            5vw
            calc(18px + var(--arc-center-fix));
        }
        /* 🔴 ODCHOD DOGTRIXU JE POSUN, NIE ZHASNUTIE (2. 9. 2026). Posuva sa
           OBSAH — beaty a bubliny — a dazdove platno (.dgx-rain) zamerne nie:
           to bezi dalej pod obrazom ALBA. Hodnotu pise rezia (--dgx-x vo vw). */
        .op-dgx > .op-beat, .op-dgx > .bub { transform: translateX(var(--dgx-x, 0px)); }
        /* To isté o obraz ďalej: obsah ALBY odchádza doľava a uvoľní stred
           MOSTU, kým dážď pod ním beží ďalej. Hodnotu píše réžia (--glf-x). */
        .op-glf > .op-beat { transform: translateX(var(--glf-x, 0px)); }
        /* 🔴 BEATY SA NESMÚ TICHO STLÁČAŤ (2. 9. 2026 — príčina, prečo štvrtá
           kóta AND YOU zmizla aj PO oprave šírky glyfu). Beat je flex item
           op-dgx-u (stĺpec) BEZ vlastného flex-shrink, takže default (1)
           necháva prehliadač PROPORCIONÁLNE STLAČIŤ VŠETKY OTVORENÉ beaty,
           keď ich súčet nesedí do pevnej výšky op-dgx-u (100vh) — odmerané:
           glyfový beat mal natvrdo vypočítanú výšku 265,5px (padding + glyf
           + rezerva na kóty), no dostal len 208,2px, a min-height:0 na
           op-bin dovolilo obsahu (kóta AND YOU na druhom riadku) TICHO
           PRETIECŤ von z tejto stlačenej škatule — kóta bola v DOM-e, mala
           nenulovú opacitu, a napriek tomu úplne neviditeľná. Bez tejto
           poistky je fitGw() nižšie len odhad, o ktorom si prehliadač môže
           urobiť, čo chce; s ňou je jediný, kto o výške glyfu rozhoduje.
           Scoped na op-dgx — WE NEED YOU aj ALBA zdieľajú tú istú triedu
           op-beat a nesmú sa tým zmeniť. */
        .op-dgx .op-beat { flex-shrink: 0; }
        .dgx-rain { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

        /* Text stojí NAD pohyblivým dažďom — papyrusový „bazén" pod ním
           (::before) nie je ozdoba, je to jediné, čo drží čitateľnosť, keď
           pod písmenom práve prechádza čierny symbol. */
        .dgx-eye {
          margin: 0; position: relative; z-index: 1;
          font: 500 var(--es, 15px)/1.2 'Space Grotesk', sans-serif;
          letter-spacing: 0.26em; text-transform: uppercase; color: ${LAB.inkSoft}; white-space: nowrap;
        }
        .dgx-h2 {
          margin: 0; position: relative; z-index: 1;
          font: 700 var(--hs, 12vw)/0.98 'Cinzel', serif;
          letter-spacing: -0.005em; text-transform: uppercase;
          display: flex; flex-direction: column; align-items: center; max-width: 100%;
        }
        .dgx-h2 .ln {
          display: block; white-space: nowrap; opacity: var(--o, 0);
          background: linear-gradient(96deg, #6E4A12 0%, #C99A3F 34%, #F5C73D 58%, #A3782B 100%);
          background-size: var(--bgw, 100%) 100%; background-position: var(--bgx, 0) 0;
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        /* Podnadpis = Space Grotesk (Matej 1. 9. 2026: „podnadpis je
           grotesk" — v Cinzeli súťažil s nadpisom a čítal sa ako druhý
           nadpis). Strop váhy 600, vyššie nie je načítané. */
        .dgx-rule {
          margin: 0; position: relative; z-index: 1;
          font: 500 var(--rs, 18px)/1.4 'Space Grotesk', sans-serif;
          color: ${LAB.inkSoft}; letter-spacing: 0.14em; text-transform: uppercase; max-width: 700px;
        }
        .dgx-eye::before, .dgx-h2::before, .dgx-rule::before {
          content: ''; position: absolute; inset: -0.35em -0.9em; z-index: -1; border-radius: 999px;
          background: radial-gradient(closest-side, rgba(251,245,230,0.88) 0%, rgba(251,245,230,0) 100%);
        }

        /* ── GLYF ────────────────────────────────────────────────────────
           🔴 SKLADÁ SA ZO SVG, NIE JE TO PNG — rozsvietiť jeden slot znamená
           mať ho ako samostatný prvok. Sústava súradníc je zhodná s
           HeroglyphFrame.tsx, takže kóty a sloty nemôžu ísť od seba. */
        .dgx-gwrap {
          position: relative; z-index: 1; width: 100%; display: flex; justify-content: center;
          padding-top: var(--pu, 0px); padding-bottom: var(--pd, 0px);
          padding-left: var(--pl, 0px); padding-right: var(--pr, 0px);
        }
        .dgx-gbox { position: relative; width: var(--gw, 86%); }
        .dgx-gsvg { width: 100%; height: auto; display: block; overflow: visible; }
        .dgx-gsvg .tint { opacity: 0; }
        .dgx-gsvg .hit { fill: transparent; cursor: pointer; pointer-events: none; }
        .op-dgx[data-live="1"] .dgx-gsvg .hit { pointer-events: auto; }

        /* ── KÓTY: ČIARA + POPISOK, ŽIADNY RÁMIK ────────────────────────
           Matej 1. 9. 2026: „nedával by som kóty a rámik, iba kótu a
           vysvietil symbol." Značkou je SVETLO, nie obkreslenie. */
        .dgx-gbox .kline { position: absolute; width: 1.8px; transform: translateX(-50%); opacity: var(--ko, 0); pointer-events: none; }
        .dgx-gbox .kline--h { width: 0; height: 1.8px; transform: translateY(-50%); }
        /* Kóta = VEĽKÝ NÁZOV sekcie (Cinzel — je to nadpis, nie údaj) +
           malý popisok (Grotesk). */
        .dgx-gbox .klab { position: absolute; margin: 0; opacity: var(--ko, 0); pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 0.3em; }
        .dgx-gbox .klab .kname { position: relative; font: 700 var(--ks1, 34px)/0.98 'Cinzel', serif; letter-spacing: 0.005em; text-transform: uppercase; white-space: nowrap; }
        .dgx-gbox .klab .kdesc { font: 500 var(--ks2, 12px)/1.3 'Space Grotesk', sans-serif; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }
        .dgx-gbox .klab .kdesc:empty { display: none; }
        /* Štvrtá kóta nesie DOGMU — jej popisok je VETA, nie štítok (rozdiel
           drží register, nie ďalšia farba). */
        .dgx-gbox .klab.dogma .kdesc { font-size: var(--ks3, 13px); letter-spacing: 0.06em; text-transform: none; white-space: normal; max-width: min(52vw, 380px); }
        .dgx-gbox .klab .kname::before {
          content: ''; position: absolute; inset: -0.2em -0.55em; z-index: -1; border-radius: 999px;
          background: radial-gradient(closest-side, rgba(251,245,230,0.88) 0%, rgba(251,245,230,0) 100%);
        }
        /* Kóta CEZ GLYF (mobil): pool-halo nestačí, čitateľnosť nesie
           HUSTOTA vrstiev text-shadow (blízke polomery sa sčítavajú) +
           priesvitná pilulka (tint — plný farebný rám, tmavý inkoust). */
        .dgx-gbox .klab--over .kname::before { display: none; }
        .dgx-gbox .klab--tint { padding: 0.5em 0.8em; border-radius: 8px; border: 1.5px solid transparent; box-shadow: 0 2px 8px rgba(60,40,10,0.14); }

        /* Pilulka „symboly sa dajú prečítať" — vlastný posledný beat,
           vystredený svojím .op-bin (flex column), vysúva sa zdola. */
        .dgx-khint {
          position: relative; z-index: 1;
          white-space: nowrap; pointer-events: none;
          opacity: var(--ho, 0); transform: translateY(var(--hy, 14px));
          font: 500 var(--hs2, 13px)/1 'Space Grotesk', sans-serif; letter-spacing: 0.06em;
          border-radius: 999px; padding: 0.72em 1.3em;
          background: #FBF5E6; color: ${LAB.ink}; border: 1px solid rgba(179,130,45,0.55); box-shadow: 0 4px 14px rgba(60,40,10,0.16);
        }

        /* ── BUBLINA: odpoveď na dotyk symbolu ──────────────────────────
           Koncový stav obrazu (Matej 1. 9. 2026): glyf je čierny a
           klikateľný, hover/ťuknutie ho rozsvieti a bublina povie, čo
           znamená. Kotví PRIAMO K SLOTU (smie ležať aj na kresbe) —
           poloha sa počíta v pixeloch voči .op-dgx, nie v % voči .dgx-gbox
           (to je vnútri beatu s overflow:hidden). */
        .op-dgx > .bub {
          position: absolute; z-index: 2;
          transform: translate(calc(-50% + var(--bdx, 0px)), calc(-100% + var(--bdy, 0px))); opacity: 0;
          pointer-events: none; background: #FBF5E6; border: 1.5px solid ${LAB.goldSolid}; border-radius: 10px;
          padding: 7px 11px; box-shadow: 0 10px 26px rgba(60,40,10,0.22); white-space: nowrap; transition: opacity 0.12s;
        }
        .op-dgx > .bub.on { opacity: 1; }
        .op-dgx > .bub b { display: block; font: 500 9.5px/1 'Space Grotesk'; letter-spacing: 0.22em; text-transform: uppercase; color: ${LAB.inkSoft}; margin-bottom: 3px; }
        .op-dgx > .bub i { font: 700 15px/1.15 'Cinzel', serif; font-style: normal; text-transform: uppercase; }
        .op-dgx > .bub em { display: block; margin-top: 4px; font: 500 9.5px/1.2 'Space Grotesk'; font-style: normal; letter-spacing: 0.1em; text-transform: uppercase; color: ${LAB.inkSoft}; opacity: 0.85; }
        .op-dgx[data-narrow="1"] > .bub { max-width: 86%; white-space: normal; }
        .op-dgx[data-narrow="1"] > .bub i { font-size: 13px; }
        .op-dgx[data-narrow="1"] > .bub b { font-size: 9px; }

        /* ── PODPIS ──────────────────────────────────────────────────────*/
        .dgx-sig { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 14px; }
        .dgx-sigph { flex: none; width: var(--fp, 72px); height: var(--fp, 72px); border-radius: 50%; overflow: hidden; border: 1.5px solid ${LAB.goldSolid}; background: #EDE0C4; box-shadow: 0 8px 22px rgba(60,40,10,0.22); }
        .dgx-sigph img { width: 100%; height: 100%; object-fit: cover; display: block; max-width: none; }
        .dgx-sigtx { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35em; }
        .dgx-signm { display: flex; align-items: baseline; gap: 0.42em; font: 700 var(--ns, 26px)/1.05 'Cinzel Decorative', 'Cinzel', serif; color: ${LAB.ink}; letter-spacing: 0.01em; white-space: nowrap; }
        .dgx-signum { flex: none; font: 500 0.40em/1 'Space Grotesk'; letter-spacing: 0.06em; color: ${LAPIS.ink}; background: ${LAPIS.edge}; border-radius: 999px; padding: 0.42em 0.72em; transform: translateY(-0.28em); box-shadow: 0 2px 8px rgba(10,26,74,0.28); }
        .dgx-sigrole { margin: 0; font: 500 var(--rls, 11px)/1.2 'Space Grotesk', sans-serif; letter-spacing: 0.24em; text-transform: uppercase; color: ${LAB.inkSoft}; }

        /* Podnadpis medzera k nadpisu — jediný beat, ktorý nedrží
           spoločných 1.8vh (viď .op-beat > .op-bin). Číslo je v DGX.subGap
           (hore v súbore), nie tu — CSS ho len číta.
           🔴 OTOČENÉ 2. 9. 2026 (Matej, po prvom naživo pozretí: „podnadpis
           je moc prilepený na nadpis, daj mu trošku priestor") oproti
           PÔVODNÉMU zámeru z 1. 9. 2026 („podnadpis bližšie k nadpisu",
           vtedy 0.4vh). Oba citáty ostávajú vedľa seba schválne — nie je to
           omyl, je to druhé kolo tej istej voľby s opačným výsledkom. */
        .dgx-b-rule > .op-bin { padding-top: ${DGX.subGap}vh; }

        @media (max-width: ${NARROW_MAX}px) {
          .op-dgx { padding-left: 4vw; padding-right: 4vw; }
        }

        /* ── OBRAZOVKA 3: HEROGLYF — TRI ALBY ─────────────────────────────
           Matej 1. 9. 2026: *„fade in 3 alby a info o tom že vstupenka je
           unikatnosť."* Krytie celej obrazovky nesie réžia (prelínačka), tu
           je len geometria. Rezerva na lištu je na oboch koncoch — to isté
           pravidlo ako pri .op-nxt. */
        /* ⚠️ ODSADENIE MA SPOLOCNE S DOGTRIXOM (viď .op-dgx, .op-glf vyssie) —
           je to recept centrovania, nie kozmetika tejto obrazovky. */
        .op-glf {
          opacity: 0;
          gap: clamp(20px, 3.6vh, 44px);
        }

        /* ── NADPIS „DOG NAME ISN'T UNIQUE. HEROGLYPH IS!" ─────────────────
           Rovnaká sadzba ako .op-nxt-h2 (Cinzel, zlatý gradient na KAŽDOM
           riadku samom, nie na rodičovi), ale je to VŽDY dvojriadkový nadpis,
           na PC aj na mobile (nákres HGL: „nadpis je vždy dvojriadkový") —
           preto len jedna sada rozmerov, nie dve ako pri WE NEED YOU. */
        .op-glf-h2 {
          margin: 0;
          font: 700 var(--ghs, 8vw)/0.98 'Cinzel', serif;
          letter-spacing: -0.005em;
          text-transform: uppercase;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 100%;
        }
        /* 🔴 HNEDY INKOUST, NIE ZLATY PRECHOD (Matej 2. 9. 2026: „meet alba daj
           tmavym pismom (ako pri /homepage - hnedym)"). Zlaty prechod tu bol do
           2. 9. — cely recept aj s premennymi --gbgw/--gbgx je nizsie v komentari,
           keby sa mal vratit. LAB.ink je ten isty inkoust, akym pise homepage.
           ⚠️ Rezia tie dve premenne stale nastavuje (put(...) v draw) — su neskodne,
           len ich uz nikto necita; mazat ich znamena siahnut aj do reZie. */
        /* povodne: background: linear-gradient(96deg,#6E4A12 0%,#C99A3F 34%,#F5C73D 58%,#A3782B 100%);
           background-size: var(--gbgw,100%) 100%; background-position: var(--gbgx,0) 0;
           -webkit-background-clip: text; background-clip: text; color: transparent; */
        .op-glf-h2 .ln {
          display: block;
          white-space: nowrap;
          opacity: var(--gho, 0);
          color: ${LAB.ink};
        }
        /* MENO PSA AJ V NADPISE = Cinzel Decorative (nacitane vahy 700 a 900).
           Film je reprezentacia psa navonok, teda oficialny povrch — to iste
           pravidlo, ake uz nesie meno pod fotkou (.op-glf-nm). Zlaty prechod
           ostava na rodicovi (.ln): jeden gradient cez cely riadok, inak by sa
           na medzere medzi slovami zlomil. */
        .op-glf-h2 .nm {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
        }

        /* ── EYEBROW „THIS IS ALBA." ────────────────────────────────────────
           Space Grotesk 500 + rozpal (vzor .religion-eyebrow). Tlmená hnedá,
           nie zlatá (Matej 1. 9. 2026: „this is alba daj inej farby" — zlatá
           by stála pod zlatým nadpisom, dve zlaté veci nad sebou). */
        /* 🔴 PODNADPIS BLIZSIE K NADPISU (Matej 2. 9. 2026) — beat ma inak
           spolocnych 1.8vh (.op-beat > .op-bin). Usetrena vyska nejde nikam do
           stratena: glfColPct() pocita sirku stlpca z DOSTUPNEJ vysky, takze
           z tejto medzery rovno narastu fotky („vytvor vacsi priestor pre obrazky").
           Rovnaky zasah, aky ma DOGTRIX cez DGX.subGap. */
        .op-b-glfeye > .op-bin { padding-top: 0.4vh; }
        .op-glf-eye {
          margin: 0;
          font: 500 var(--ges, 15px)/1.2 'Space Grotesk', sans-serif;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
          white-space: nowrap;
        }

        /* ── TRI STĹPCE — TRI SKUTOČNÉ ALBY ZO STENY ───────────────────────
           Fotka, meno a glyf sú v jednom stĺpci TRI NEZÁVISLÉ deje (preto
           jeden beat, nie tri) — dôkaz je „same name, different dog,
           different heroglyph". Šírka stĺpca a medzera sú STATICKÁ geometria
           → @media nižšie, nie réžia; réžia mení len krytie/mierku/veľkosť. */
        .op-glf-trio {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 4%;
          width: 100%;
        }
        /* Sirku pise rezia (glfColPct) — pocita sa z DOSTUPNEJ VYSKY, cislo
           v CSS je uz len zaloha pre prvy snimok. */
        .op-glf-al {
          margin: 0;
          width: var(--gcol, 15%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.9vh;
        }
        .op-glf-ph {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 14px;
          overflow: hidden;
          border: 1.5px solid ${LAB.goldSolid};
          background: #EDE0C4;
          box-shadow: 0 10px 26px rgba(60,40,10,0.22);
          opacity: var(--gpho, 0);
          transform: scale(var(--gphs, 1));
        }
        .op-glf-ph img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Meno psa = Cinzel Decorative — film je REPREZENTÁCIA PSA NAVONOK
           (ten istý povrch ako WALL), nie bežná prevádzka /packu. Načítané sú
           len váhy 700 a 900. */
        .op-glf-nm {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.42em;
          font: 700 var(--gns, 20px)/1.05 'Cinzel Decorative', 'Cinzel', serif;
          color: ${LAB.ink};
          letter-spacing: 0.01em;
          opacity: var(--gno, 0);
          white-space: nowrap;
          max-width: 100%;
        }
        /* ČÍSLO PSA = LAPISOVÁ PILULKA VEDĽA MENA (Matej 1. 9. 2026 večer).
           🔵 Zlaté písmo na modrom nie je ozdoba — lapis + zlato je pôvodná
           egyptská dvojica. Plná farebná plocha je inak vyhradená JEDINÉMU
           hlavnému CTA na obrazovke — sem sa smie, lebo platí výnimka pre
           NEINTERAKTÍVNY ŠTÍTOK (28. 8. 2026, precedens chipy vízie): nedá sa
           naň kliknúť · nemá stav · je to pilulka · na tomto obraze nie je
           žiadne iné plné CTA. ⚠️ Veľkosť je v em, nie v px — chip rastie
           s menom, nezamrzne pri troch šírkach okna zakaždým inak. */
        .op-glf-gnum {
          flex: none;
          font: 500 0.40em/1 'Space Grotesk', sans-serif;
          letter-spacing: 0.06em;
          color: ${LAPIS.ink};
          background: ${LAPIS.edge};
          border-radius: 999px;
          padding: 0.42em 0.72em;
          transform: translateY(-0.28em);
          box-shadow: 0 2px 8px rgba(10,26,74,0.28);
        }

        /* 🔴 GLYF SA LEN VFADUJE (Matej 2. 9. 2026). Do 2. 9. tu stali dva pohyby
           naraz — obal rastol 0fr→1fr a vnutro sa posuvalo v oreze (glyf „vyliezal
           spod mena", Matej 1. 9.). Lenze rast v jednej osi pri nezmenenej sirke
           glyf KRCI, a to je presne to, co zamietol.
           ⚠️ Miesto pre glyf je teraz rezervovane OD ZACIATKU (ziadne 0fr) — vyska
           obsahu sa pocas nabehu uz nemeni, takze trojica pod nim nepodskakuje.
           Rozpocet to unesie: glfColPct() ma glyf v rovnici (clen 1/AR) od zaciatku,
           takze rezervacia nic nepridava, len prestala byt odlozena. */
        .op-glf-gw { width: 100%; display: block; opacity: var(--ggo, 0); }
        .op-glf-gin {
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5vh;
        }
        .op-glf-gl { width: 100%; height: auto; display: block; }

        /* ── VETY POD DÔKAZOM ───────────────────────────────────────────── */
        .op-glf-same {
          margin: 0;
          font: 700 var(--gms, 17px)/1.35 'Cinzel', serif;
          color: ${LAB.ink};
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .op-glf-says {
          margin: 0;
          font: 400 var(--gys, 17px)/1.5 'Space Grotesk', sans-serif;
          color: ${LAB.inkSoft};
          max-width: var(--gsw, 760px);
        }
        .op-glf-says b { color: ${LAB.ink}; font-weight: 500; }

        /* Číslo kombinácií — VYPNUTÉ (ALBA_CNT), štýl ostáva pre návrat. */
        .op-glf-cnt { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.4vh; }
        .op-glf-cnt b {
          font: 700 var(--gcs, 44px)/1 'Cinzel', serif;
          letter-spacing: 0.01em;
          background: ${LAB.goldText};
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-bottom: 0.06em;
        }
        .op-glf-cnt span {
          font: 500 12px/1.3 'Space Grotesk', sans-serif;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
        }

        /* ⚠️ TENTO BLOK PATRÍ UŽ LEN OBRAZU HEROGLYFU/ALBA. Hranica je
           NARROW_MAX (768 px), rovnaká, akú číta réžia (innerWidth) —
           jedno číslo pre CSS aj JS. */
        @media (max-width: ${NARROW_MAX}px) {
          .op-glf { padding-left: 4vw; padding-right: 4vw; }
          .op-glf-al { width: var(--gcol, 27%); }
        }

        /* ── OBRAZOVKA 4 — MOST: BRÁNA, POTOM JEDINÁ OTÁZKA ────────────────
           Rezervu pod hornou lištou drží PREMENNÁ (--op-nav-h), nie vlastné
           číslo — inak sa pri zmene MEDAL.lift rozíde so zvyškom filmu.
           Zrkadlená rezerva dole tu JE, na rozdiel od ALBY: obrazovka nesie
           jediný riadok a bez nej by opticky sedel nízko. */
        .op-most {
          gap: 0;
          padding: calc(var(--op-nav-h) + 2vh) 6vw calc(var(--op-nav-h) + 2vh);
        }
        .op-most > .op-beat > .op-bin { padding-top: 0; }
        /* Popisok, nie nadpis — vzor .religion-eyebrow (Space Grotesk 500).
           Váha 500 zámerne: načítané sú 300–600, sedemstovka by bola falošný
           tučný rez. */
        .op-most-eye {
          margin: 0;
          font: 500 var(--mes, 15px)/1.2 'Space Grotesk', sans-serif;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: ${LAB.inkSoft};
          white-space: nowrap;
        }
        /* Veľkosť (--mhs / --mqs) POČÍTA RÉŽIA zo šírky AJ z výšky — tu je len
           sadzba. Vlastnost white-space: nowrap je podmienka tej rovnice: zalomenie by
           zmenilo počet riadkov, z ktorých je veľkosť dopočítaná. */
        .op-most-h2 {
          margin: 0.8vh 0 0;
          font: 700 var(--mhs, 40px)/1.06 'Cinzel', serif;
          letter-spacing: -0.005em;
          color: ${LAB.ink};
          white-space: nowrap;
        }
        /* 🔴 OTÁZKA NIE JE NADPIS, HOCI JE VEĽKÁ. Je to veta, ktorú si divák
           hovorí sám — preto NIE uppercase a NIE zlato: obyčajná veta veľkým
           písmom číta ako myšlienka, kapitálky ako slogan. Mäkší inkoust než
           brána nad ňou je zámer: je to vnútorný hlas, nie nápis na dverách. */
        .op-most-q {
          margin: 0;
          font: 700 var(--mqs, 46px)/1.1 'Cinzel', serif;
          letter-spacing: -0.005em;
          color: ${LAB.ink};
          white-space: nowrap;
        }
        @media (max-width: ${NARROW_MAX}px) {
          .op-most { padding-left: 4vw; padding-right: 4vw; }
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
          {/* ── ĽAVÁ PILULKA = UKAZOVATEĽ POLOHY **AJ** NAVIGÁCIA ────────────
              Matej 2. 9. 2026: *„do laveho nav panelu kde sa mení názov stránky
              vytvoríš navigáciu na každý slajd ktorý máme = tlačítko bude
              dropdown aby sme mohli rýchlo prejsť na stránku"*.
              🔴 TÝM SA MENÍ ZÁPIS Z 27. 8. („lišta nie je menu, je ukazovateľ
              polohy") — je to jeho novší pokyn, nie obídený lock. Pilulka
              ukazovateľom BYŤ NEPRESTALA, len sa dá aj otvoriť.
              ⚠️ Menu NESMIE byť vnútri `<button>` (neplatné HTML aj klik).
              Preto obal `.scene-nav`, ktorý zároveň nesie kotvu panela.
              ⚠️ Všetky názvy ležia v DOM-e naraz a neaktívne majú nulové
              krytie — šírku drží najdlhší z nich, inak by lišta pri každom
              prepnutí obrazu uhla a medailón by odskočil od stredu. */}
          <div className="scene-nav" ref={sceneNavRef}>
            <button
              type="button"
              className="scene-pill"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              aria-label={t('film.slide.menu')}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="scene-pill-names" aria-live="polite">
                {FILM_SLIDES.map((sl, i) => (
                  <span key={sl.id} data-off={i === scene ? undefined : '1'} aria-hidden={i === scene ? undefined : true}>
                    {t(sl.navKey)}
                  </span>
                ))}
              </span>
              <ChevronDown className="scene-pill-chev" size={13} aria-hidden />
            </button>
            {menuOpen && (
              <ul className="scene-menu" role="listbox" aria-label={t('film.slide.menu')}>
                {FILM_SLIDES.map((sl, i) => (
                  <li key={sl.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === scene}
                      className={`scene-menu-item${i === scene ? ' on' : ''}`}
                      onClick={() => goSlide(i)}
                    >
                      <span className="scene-menu-no">{i + 1}</span>
                      <span className="scene-menu-nm">{t(sl.navKey)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className="nav-medal-slot" aria-hidden="true">
            <NavMedallion onClick={() => goSlide(0)} />
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

        {/* ── OBRAZ — NEXT STEP: ZÁPIS ───────────────────────────────────
            Matej 31. 8. 2026: *„nebolo by lepšie dať 6. namiesto 3 = že next
            stepp je zápis, a potom ukázať čo je zápis?"* Tento obraz dej
            POMENÚVA; obrazy za ním (čo je zápis · čo dostaneš) ho vysvetlia
            a nesú výzvu.
            Recenzie mu predchádzajú ako samostatný pás (`TestimonialsSection`
            vo filme AboutLabu) — čierna sa rozplýva na ne.
            ⚠️ ID ostáva `op-join` — visí na ňom snap aj pozorovateľ obrazov
            v nave. Zmena mena by ticho zabila oboje. */}
        <section className="op-scene op-arc" id="op-join" aria-label="Join">
          {/* Odpočívadlo na hotovom obraze — viď .op-arc-rest v štýloch. */}
          <i className="op-arc-rest" aria-hidden="true" />
          {/* Dvojča o obraz ďalej — DOGTRIX dobehol, viď .op-arc-rest2. */}
          <i className="op-arc-rest2" aria-hidden="true" />
          {/* A tretie — ALBA dopísala tri glyfy aj výzvu, viď .op-arc-rest3. */}
          <i className="op-arc-rest3" aria-hidden="true" />
          <div className="op-arc-stage">
            {/* ── OBRAZ 6 — WE NEED YOU ──────────────────────────────────
                Postavené 1. 9. 2026 z nákresu
                `plany/nakres-weneedyou-film-2026-09-01.html` (osem kôl réžie).
                Matejovo zadanie: *„potrebujeme z toho urobiť film"* a
                *„potrebujeme to celé rozsekať a nechať čitateľa prečítať si to
                celé, nie vychrliť všetok obsah naraz."*

                Jedenásť beatov: faraón zdola → drží → ustupuje (nezmizne) →
                WE · NEED · YOU! po slovách → nadpis klesá → podtitul → pás
                zblízka s bežiacim počítadlom → odchod kamery na milión →
                šípka → NEXT STEP → lapisové CTA.

                ČO TU ZANIKLO: veľký NEXT STEP, ktorý sa zmenšoval na eyebrow
                (`.op-nxt-eyebrow`, `--nx-swap`), nadpis „Join the mission",
                zvislá značka pri zastávke 1M, holé číslo nad čiarou (nahradila
                ho menovka posledného psa) a veta „It seems impossible…". */}
            <section className="op-arc-scr op-nxt">
                {/* 🔴 FARAÓN SA KOTVÍ NA SPODOK, ALE USTUPUJE DO STREDU.
                    Matej 1. 9. 2026: *„nástup faraóna bude zdola a bude veľký
                    cez celú obrazovku (pod lištu, aby mu bola vidno hlava)"* a
                    o kolo neskôr *„daj faraóna do stredu viewportu"*. Sú to dve
                    rôzne veci a obe platia: výška je % PRIESTORU POD LIŠTOU
                    (pri strede by sa delila na obe strany a hlava by mu zaliezla
                    za lištu), a počas ústupu sa kotva presunie zo spodku do
                    stredu okna. Jedna premenná, jeden dej.
                    ⚠️ NEZMIZNE — ostáva za textom na 14 % krytia (Matej:
                    *„ide do fade, ale nestratí sa celkom"*). */}
                <img className="op-nxt-phar" src="/images/council-pharaoh.png" alt="" aria-hidden="true" />

                {/* 🔴 BEAT, KTORÝ EŠTE NEPRIŠIEL, NEDRŽÍ MIESTO.
                    Kým boli všetky beaty v toku, „obrovský nadpis cez celú
                    stranu" nebol veľký na celú stranu — bol veľký na to, čo
                    ostalo po rezervácii miesta pre päť vecí, ktoré na obrazovke
                    ešte nie sú (pri 1440 px pretiekol o 108 px). Riadok rastie
                    z 0fr na 1fr spolu s krytím, takže si beat miesto vezme, až
                    keď prichádza — a odsadenie zmizne s ním.
                    ⚠️ Odsadenie patrí DOVNÚTRA obalu, nie ako `gap` na
                    kontajner: gap medzi zbalenými riadkami ostane a nasčíta sa. */}
                <div className="op-beat op-b-head"><div className="op-bin">
                  {/* Zlato musí niesť KAŽDÉ SLOVO SAMO (v súradniciach celého
                      nadpisu) — gradient na rodičovi by zabil potomka s vlastným
                      krytím, a krytie je tu to, čo slová privádza po jednom. */}
                  <h2 className="op-nxt-h2">
                    <span>We</span><span>need</span><span>you<i>!</i></span>
                  </h2>
                </div></div>

                {/* 🔴 POČET RIADKOV SA NEZARIAĎUJE ZALOMENÍM (Matej 1. 9. 2026:
                    *„na pc jeden riadok, na mobile 2"*). `<br>` hovorí KDE sa
                    zlomí, nie koľko riadkov vznikne — pri užšom okne sa zlomí aj
                    inde. Preto sú to dva kusy, každý `nowrap`, a veľkosť sa
                    dopočíta tak, aby sa najširší z nich zmestil.
                    DOGYPT je značka, nie slovo vety — Cinzel a zlato. */}
                <div className="op-beat op-b-sub"><div className="op-bin">
                  <p className="op-nxt-line">
                    <span>Our goal is to unite one million dog lovers</span>
                    <span>in one place &mdash; <b>DOGYPT.</b></span>
                  </p>
                </div></div>

                {/* ── PÁS ────────────────────────────────────────────────────
                    🔑 KAMERA JE ZMENA MIERKY OSI, NIE `transform: scale`.
                    `dom` = koľko psov je na osi vidno: zblízka ~100 (dnešných
                    72 je skoro plná os, číta sa ako „načítava sa"), zďaleka
                    milión (72 padne na nulu). Geometrickým zväčšením by sa
                    rozmazal lem, fotka aj písmo — a číslo by muselo klamať, aby
                    bolo čo vidieť. Takto neklame ani raz, mení sa len mierka.
                    To je celý dej obrazu. */}
                <div className="op-beat op-b-bar"><div className="op-bin">
                  <div className="op-nxt-plot">
                    <div className="op-nxt-ax">
                      <div className="op-nxt-groove"><span className="op-nxt-fill" /></div>
                      {/* Cieľ stojí NAD pásom, v jednom riadku s menovkou
                          posledného psa (Matej 1. 9. 2026: *„ten goal daj hore
                          pri progresbar"*), a bez zvislej značky — tá ukazovala
                          na koniec pásu, čiže hovorila to, čo už bolo vidieť. */}
                      <span className="op-nxt-goal"><b>1M</b><em>Our goal</em></span>

                      {/* Psy MEDZI zakladateľom a posledným. Vypĺňajú modrý
                          úsek TVÁRAMI, nie farbou; sú menšie zámerne (väčšie sú
                          len dva konce). Uzly stoja v DOM-e RAZ ako bazén —
                          koľko sa ich do úseku zmestí, sa rieši polohou a
                          krytím, nie prestavbou (tá by sťahovala tie isté
                          obrázky dookola).
                          🔴 Psy sú vybrané ROVNOMERNE z celej svorky, nie
                          prvých N — inak by pás ukazoval len najstarších psov. */}
                      {midDogs.map((u, i) => (
                        <span className="op-nxt-dog op-nxt-dog--mid" key={i}>
                          <img src={u} alt="" />
                        </span>
                      ))}

                      {/* ZAKLADATEĽ. Pri oddialení ustúpi VEDĽA osi a ZVÄČŠÍ sa
                          (Matej 1. 9. 2026: *„na konci musí mať Hekthor väčšiu
                          fotku aj meno a dal by som to pred začiatok, teda ako
                          keby vedľa osi fotka a pod ňou meno"*) — prestane byť
                          prvým dielikom mierky a stane sa tým, od koho sa
                          počíta.
                          🔴 MENOVKA NIE JE ČASŤ FOTKY. Kým visela na tej istej
                          premennej, zmenšila sa spolu s fotkou na 13 px a meno
                          zaniklo. Fotka sedí NA čiare a mení veľkosť s kamerou;
                          menovka stojí v pevnej vzdialenosti od čiary a má
                          vlastnú veľkosť písma.
                          🔴 KOTVA (zvislá čiarka) stojí na X FOTKY, nie menovky:
                          menovka sa pri okraji okna posúva, takže bez kotvy sa
                          nedá povedať, ku ktorému psovi patrí. */}
                      <span className="op-nxt-dog op-nxt-dog--anchor">
                        <img src="/images/hektor-grid.webp" alt="" />
                        <i className="op-nxt-tie" />
                        <span className="op-nxt-pill"><em>Hekthor</em><b>#1</b></span>
                      </span>

                      {/* POSLEDNÝ PES — hlava pásu. Fotku, meno aj číslo píše
                          RÉŽIA (React by pri sedemdesiatich prepisoch počas
                          počítadla prekresľoval celý film). Je to skutočný pes
                          z feedu steny: `#72` patrí tomu, kto na tom mieste
                          naozaj stojí, a pri ďalšom sa prepíše sám.
                          Menovka je NAD pásom (Matej 1. 9. 2026) — dolné pole
                          nesie začiatok, horné to, čo sa hýbe, a koniec. */}
                      <span className="op-nxt-dog op-nxt-dog--head">
                        <img className="op-nxt-head-img" src="" alt="" />
                        <i className="op-nxt-tie" />
                        <span className="op-nxt-pill">
                          <em className="op-nxt-head-name" /><b className="op-nxt-head-num" />
                        </span>
                      </span>
                    </div>
                  </div>
                </div></div>

                {/* Šípka sa KRESLÍ (stroke-dasharray) a ukazuje na NEXT STEP —
                    Matej 1. 9. 2026: *„pod progresbarom sa animuje šípka, ktorá
                    sa načíta a ukáže na veľký nápis NEXT STEP"*. */}
                <div className="op-beat op-b-arrow"><div className="op-bin">
                  <svg className="op-nxt-arrow" viewBox="0 0 34 52" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M17 2 V44 M6 33 L17 45 L28 33" />
                  </svg>
                </div></div>

                {/* 🔴 NEXT STEP JE POPISKA, NIE NADPIS (Matej 1. 9. 2026:
                    *„next step musí byť groteskom a malým"*). Tým padol jeho
                    vlastný skorší beat „veľký NEXT STEP, ktorý sa zmenší" — a
                    dáva to zmysel: nadpis obrazu je WE NEED YOU, dva veľké
                    Cinzel nápisy na jednej obrazovke si konkurujú. Tá veľká vec
                    dole má byť CTA. */}
                <div className="op-beat op-b-step"><div className="op-bin">
                  <p className="op-nxt-ns">Next step</p>
                </div></div>

                {/* ── CTA ────────────────────────────────────────────────────
                    🔵 LAPIS = jediné hlavné CTA na obrazovke (brandový kánon
                    28. 8. 2026). Geometriu preberá od `.btn-gold` — radius 8,
                    NIE pilulka; mení sa výplň, nie tvar. Zlaté písmo na modrom
                    nie je ozdoba: bez neho je to len tmavé tlačidlo bez brandu.
                    Preto sú menovky psov nad ním len priesvitný tint — dve plné
                    farebné plochy na obrazovke a ani jedna nevedie.

                    🔴 KLIK POSUNIE FILM NA ĎALŠÍ OBRAZ (Matej 1. 9. 2026, po
                    piatich kolách otázky). NIE `navigate('/heroglyph')`: to by
                    preskočilo obrazy 7–9, teda celý pitch. Tlačidlo teda nevedie
                    von zo stránky, ale doscrolluje na obraz heroglyfu, ktorý
                    stojí v tom istom javisku. */}
                <div className="op-beat op-b-cta"><div className="op-bin">
                  <button type="button" className="op-nxt-cta" onClick={goToGlyph}>
                    Join the mission
                  </button>
                  {/* Riadok pod tlačidlom je jeho popiska, nie druhé CTA —
                      Space Grotesk, bez rámu, bez farebnej plochy.
                      🔴 ČÍSLO JE DOPOČÍTANÉ (počet psov + 1). Natvrdo zapísané
                      by z neho prvý nový pes spravil lož.
                      ⚠️ Kým počet nedorazí, riadok je prázdny — nie nula. */}
                  <p className="op-nxt-ctasub">
                    {dogCount === null ? '' : (
                      <>Get your number &mdash; <b>#{(dogCount + 1).toLocaleString('en-US')}</b>.</>
                    )}
                  </p>
                </div></div>

                {/* 🚩 CHVOST JE VYPNUTÝ (ARC_TAIL). V nákrese je to prepínač
                    `fin` a Matej ho k 1. 9. 2026 nechal na „koniec CTA", takže
                    veta rozdelená cez dve obrazovky („All you can do is —" /
                    „— write your dog into it.") zanikla. Kód tu ostáva, aby sa
                    dala vrátiť jedným prepnutím. */}
                {ARC_TAIL && (
                  <div className="op-beat op-b-tail"><div className="op-bin">
                    <p className="op-nxt-lead">All you can do is &mdash;</p>
                    <p className="op-nxt-be">
                      <span className="op-nxt-be-slot">
                        <b className="op-nxt-be-num"><i>#</i>{dogCount === null ? '' : (dogCount + 1).toLocaleString('en-US')}</b>
                      </span>
                      <span className="op-nxt-be-free">this one is free</span>
                    </p>
                  </div></div>
                )}
            </section>

            {/* ── OBRAZOVKA — DOGTRIX (dážď + dekodér heroglyfu) ───────────
                Matej 1. 9. 2026: „v dogtrixe budú iba heroglyfy nie
                samostatne symboly… nadpis heroglyf nesmie zostať taký malý…
                pred každým kótovaním musia zasvietiť, zapulzovať… cieľom je
                aby na konci bol heroglyf čierny a klikateľný s bublinkami."
                Nákres `plany/nakres-heroglyf-dogtrix-2026-09-01.html`
                (objekt `DGX`, päť kôl ladenia) — TRETIA obrazovka toho
                istého oblúka `.op-arc` (nxt → dogtrix → alba).

                🔴 DÁŽĎ = LEN CELÉ ZVISLÉ HEROGLYFY (žiadne samostatné
                symboly — Matej to zamietol), stĺpce majú VÝHRADNÉ pruhy
                (prekryv vylúčený, nie zmenšený), halo je zapečené do spritu
                (nie shadowBlur na snímok — 19,6 → 60 fps), predné idú
                POMALŠIE ako zadné (opak paralaxy, zámer).
                🔴 GLYF SA SKLADÁ ZO SVG (SLOTS/SLOTS_V), nie z PNG —
                rozsvietiť jeden slot znamená mať ho ako samostatný prvok.
                Mobil = zvislý glyf (`VerticalHeroglyphFrame` sústava),
                kóty naň ležia priesvitnou pilulkou bez rezervy okolo.
                Koncový stav: glyf čierny a klikateľný, dotyk/hover na
                symbole ho rozsvieti a otvorí bublinu s troma riadkami. */}
            <section className="op-arc-scr op-dgx" aria-label="Dogtrix" ref={dgxRootRef}>
              <canvas className="dgx-rain" aria-hidden="true" />

              <div className="op-beat dgx-b-eye"><div className="op-bin">
                <p className="dgx-eye">The ticket to Dogypt</p>
              </div></div>

              <div className="op-beat dgx-b-head"><div className="op-bin">
                <h2 className="dgx-h2"><span className="ln">HEROGLYPH</span></h2>
              </div></div>

              <div className="op-beat dgx-b-rule"><div className="op-bin">
                <p className="dgx-rule">Unique symbol for every dog.</p>
              </div></div>

              <div className="op-beat dgx-b-glf"><div className="op-bin">
                <div className="dgx-gwrap"><div className="dgx-gbox" /></div>
              </div></div>

              <div className="op-beat dgx-b-sig"><div className="op-bin">
                <div className="dgx-sig">
                  <div className="dgx-sigph"><img alt="Hekthor" /></div>
                  <div className="dgx-sigtx">
                    <div className="dgx-signm"><span>Hekthor</span><span className="dgx-signum">#1</span></div>
                    <p className="dgx-sigrole">First Dogyptian</p>
                  </div>
                </div>
              </div></div>

              <div className="op-beat dgx-b-hint"><div className="op-bin">
                <div className="dgx-khint" />
              </div></div>
            </section>

            {/* ── OBRAZOVKA 3 — HEROGLYF: TRI ALBY ────────────────────────
                Matej 1. 9. 2026: *„pri ďalšom scrolle fade in 3 alby a info
                o tom že vstupenka je unikatnosť."* Prepis .op-glf (predtým tri
                náhodné glyfy) na dôkaz „same name, different dog, different
                heroglyph" — meno drží konštantné, rozdiel vyskočí sám. Nákres
                `plany/nakres-heroglyf-alba-2026-09-01.html`, objekt `HGL`.

                🔴 SÚ TO TRI SKUTOČNÉ ALBY ZO STENY (#43 · #59 · #61), nie
                ukážky (`ALBAS` konštanta vyššie) — obraz tvrdí, že tri psy
                s tým istým menom majú tri rôzne glyfy, a vymyslené obrázky by
                ho robili nepravdivým presne v tej veci, o ktorej hovorí. Sú to
                JEDINÉ tri psy s tým istým menom v celej svorke.

                ⚠️ Stojí v TOM ISTOM javisku ako NEXT STEP a je absolútny —
                preto sa obrazovky prelínajú na mieste a medzi nimi sa
                nescrolluje. Dve sekcie pod sebou to nevedia ani so záporným
                okrajom: keď prvá odopne, jej obsah odchádza nahor. */}
            <section className="op-arc-scr op-glf" aria-label="Heroglyph">
              <div className="op-beat op-b-glfhead"><div className="op-bin">
                {/* 🔴 „MEET ALBA" NAHRADILO DVOJRIADKOVY „Dog name isn't
                    unique. Heroglyph is!" (Matej 2. 9. 2026: *„na stred
                    obrazovky pride velkym — meet Alba (bez toho nadpisu co je
                    tam teraz)"*). Jeden riadok, aby na sirokom a nizkom okne
                    zostal naozaj velky; meno psa v Cinzel Decorative. */}
                <h2 className="op-glf-h2">
                  <span className="ln">Meet <span className="nm">Alba</span></span>
                </h2>
              </div></div>

              <div className="op-beat op-b-glfeye"><div className="op-bin">
                <p className="op-glf-eye">The same name &mdash; different dog &mdash; unique symbol</p>
              </div></div>

              <div className="op-beat op-b-glftrio"><div className="op-bin">
                <div className="op-glf-trio">
                  {ALBAS.map((a) => (
                    <figure className="op-glf-al" key={a.n}>
                      <div className="op-glf-ph">
                        <img src={cldPhoto(a.photo)} alt={`ALBA #${a.n}`} loading="lazy" />
                      </div>
                      <div className="op-glf-nm">
                        <span>ALBA</span>
                        <span className="op-glf-gnum">#{a.n}</span>
                      </div>
                      <div className="op-glf-gw"><div className="op-glf-gin">
                        <img className="op-glf-gl" src={cldGlyph(a.glyph)} alt={`heroglyf ALBA #${a.n}`} loading="lazy" />
                      </div></div>
                    </figure>
                  ))}
                </div>
              </div></div>

              {/* 🚩 VYPNUTÉ (ALBA_SAME) — tri rovnaké mená nad tromi rôznymi
                  psami to už povedali. Kód ostáva, Matej: „určite uchovajme
                  údaj, možno niekde využijeme." */}
              {ALBA_SAME && (
                <div className="op-beat op-b-glfsame"><div className="op-bin">
                  <p className="op-glf-same">Same name. Different dog.</p>
                </div></div>
              )}

              <div className="op-beat op-b-glfsays"><div className="op-bin">
                {/* 🔴 VYZVA, NIE VYSVETLENIE (Matej 2. 9. 2026: „text pod obrazkami
                    by mal byt tiez iny lebo sme to uz vysvetlili predtym - mala by to
                    byt vyzva"). Povodne tu stalo „Breed, colour, origin, character —
                    your dog and you, drawn in symbols." — to uz povie obraz HEROGLYPH
                    pred touto obrazovkou, takze sa to tu hovorilo druhy raz. */}
                <p className="op-glf-says">
                  Every dog deserves a <b>HEROGLYPH</b>!
                </p>
              </div></div>

              {/* 🚩 VYPNUTÉ (ALBA_CNT, Matej 1. 9. 2026: „ten spodný riadok
                  s číslom dajme preč"). Číslo je DOPOČÍTANÉ (`glyphCount.ts`),
                  nie napísané — spodná hranica, nie tvrdenie o unikátnosti. */}
              {ALBA_CNT && (
                <div className="op-beat op-b-glfcnt"><div className="op-bin">
                  <p className="op-glf-cnt">
                    <b>{GLYPH_COMBINATIONS.toLocaleString('en-US')}</b>
                    <span>ways to draw one</span>
                  </p>
                </div></div>
              )}
            </section>

            {/* ── OBRAZOVKA 4 — MOST: BRÁNA, POTOM JEDINÁ OTÁZKA ──────────
                Matej 2. 9. 2026: *„musíme urobiť ešte jeden medzikrok z alby,
                niečo v zmysle že heroglyf otvára bránu do dogyptu kde nájdeš…
                asi by stačila len jedna otázka na screene — následne by sa
                vyrojili otázky ktoré si dáva každý psíčkar"*.

                🔑 KONČÍ SA OTÁZKOU BEZ ODPOVEDE A JE TO ZÁMER. Doteraz film
                osem obrazov hovoril o NÁS; tu prvýkrát zaznie veta, ktorú má
                divák v hlave sám. Odpoveď je až za ňou — v obraze EKOSYSTÉM,
                ktorý sa stavia podľa `plany/zadanie-onepage-ekosystem-FRESH-SESSION.md`.

                ⚠️ Znenie je PRVÝ NÁSTREL, nie lock (viď ARC.most). Ladí sa
                v nákrese, alternatívy sú v zadaní.
                ⚠️ Text je natvrdo EN, rovnako ako celý oblúk (DOGTRIX aj ALBA)
                — i18n sa naň nasadí naraz, nie po obrazovkách. */}
            <section className="op-arc-scr op-most" aria-label="What the Heroglyph opens">
              <div className="op-beat op-b-mosteye"><div className="op-bin">
                <p className="op-most-eye">The Heroglyph is the key</p>
              </div></div>

              <div className="op-beat op-b-mosthead"><div className="op-bin">
                <h2 className="op-most-h2">This is the door it opens.</h2>
              </div></div>

              {/* Otázka stojí SAMA — brána nad ňou v tej chvíli už zhasla.
                  Preto je to samostatný beat a nie tretí riadok toho istého:
                  dva beaty na jednej obrazovke sa navzájom nevidia, takže sa
                  prvý smie hasiť, kým druhý nabieha. */}
              <div className="op-beat op-b-mostq"><div className="op-bin">
                {/* Uvodzovky su EN parove (&ldquo; &rdquo;), nie SK/DE dvojica &bdquo;/&ldquo;
                    — text filmu je anglicky. A su tu zamerne: veta je MYSLIENKA
                    divaka, nie otazka, ktoru mu kladie film. */}
                <p className="op-most-q">&ldquo;Am I doing right by him?&rdquo;</p>
              </div></div>
            </section>
          </div>
        </section>

        {/* ── OBRAZ — RECENZIE ───────────────────────────────────────────
            Matej 1. 9. 2026: *„najprv zobraziť nadpis a text na stred obrazovky
            a potom pri scrole sa rozplynie a tie recenzie budú presne na strede
            obrazovky."*
            Pás sem prišiel z AboutLabu, kde stál ako obyčajná sekcia bez réžie.
            Fázy sú v `QUO` hore v súbore.

            🔴 PRESUNUTÝ NA KONIEC FILMU (3. 9. 2026). Matej: *„slajd psov miluje
            každý a recenzie od hviezd presuň na koniec aby nezavadzali, po
            príbehu pôjde slajd we need you."* Do 3. 9. stál MEDZI príbehom na
            čiernej a obrazom WE NEED YOU — teda presne v mieste, kde má film
            vyzvať, a citáty hviezd tam výzvu odsúvali o dve a pol obrazovky.
            ⚠️ „Slajd psov miluje každý" a „recenzie od hviezd" NIE SÚ DVA obrazy:
            *PSOV MILUJE KAŽDÝ* je NADPIS toho istého pásu (`about.legends.titleFilm`,
            EN *EVERYONE LOVES DOGS*), ktorý sa scrollom rozplynie na citáty.
            🔴 TÝM PADLA STARŠIA VETA *„čierna sa rozplýva na ne"* (bola o pár
            riadkov nižšie v pôvodnom komentári): po presune čierna z príbehu
            ústi rovno do WE NEED YOU. Pás teraz nadväzuje na poslednú otázku
            oblúka — *„Am I doing right by him?"*
            ⚠️ Poradie MUSÍ sedieť s poradím v `FILM_SLIDES` hore v súbore:
            polohu si pilulka v nave meria odtiaľto, ale MENO obrazu berie odtiaľ.
            ⚠️ `pinned` vypína v komponente jeho VLASTNÝ nábeh (framer
            whileInView) — dva stmievače na jednom prvku sa prepisujú a nadpis
            bliká. A prepína nadpis na filmový kľúč: ostrá /about si necháva
            svoj vo všetkých 18 jazykoch. */}
        <section className="op-scene op-quo" aria-label={t('about.legends.titleFilm')}>
          <div className="op-quo-stage">
            <TestimonialsSection variant="papyrus" pinned />
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

      {/* ── „SKROLUJ ĎALEJ" NA ČIERNEJ SÁLE ──────────────────────────────
          Matej 2. 9. 2026: *„ukáže sa trojitá šípka zasvieti - s vetou keep
          scrolling… aby človek vedel čo má robiť"*.
          Stojí ZA nocou v DOM-e, aby na nej ležala, a NAD závojom (75 > 70) —
          závoj je čierny, takže obrazovka zhasne už pod ním a výzva má prísť
          s tým okamihom, nie až s jeho odchodom (viď .op-keep v CSS).
          ⚠️ Text je NAD šípkami a šípky sa rozsvecujú zhora nadol: dohromady
          to je jeden pohyb smerom, ktorým má človek ísť. Opačné poradie by
          ukazovalo na vetu. */}
      <div className="op-keep" aria-hidden>
        <span className="op-keep-txt">{t('film.keepScrolling')}</span>
        <span className="op-keep-arrows">
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 26 13" width="32" height="16" fill="none" aria-hidden>
              <path d="M2 2.5 L13 10.5 L24 2.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ))}
        </span>
      </div>

      {/* ── ZÁVOJ ────────────────────────────────────────────────────────
          Prechodová vrstva 5. obrazu. Leží nad VŠETKÝM vrátane hornej lišty,
          takže je posledná v DOM-e a nesie najvyšší z-index vo filme (70).
          Keď pod ňou dosadne noc, sama zhasne — nič nedrží. */}
      <div className="op-veil" aria-hidden />
    </div>
  );
}
