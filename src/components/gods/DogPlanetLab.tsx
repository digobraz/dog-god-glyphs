// ════════════════════════════════════════════════════════════════════════════
// DOGYPT — PLANÉTA PSOV (LAB, dev-only)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 8. 2026: „nebolo by vidno kontinenty ale celá guľa by bola pokrytá
// miniatúrami psov… niekde v strede by bolo veľké logo dogypt a CTA… fotky by
// boli krásne zoradené symetricky na mriežke."
//
// ⚠️ NIE JE to zemeguľa. Žiadne kontinenty, žiadna mapa — guľa JE z fotiek.
// Preto tu nie je `cobe` (tá vie bodkovanú Zem + značky NAD ňou, nie povrch
// z dlaždíc) ani three.js: 100–150 malých obrázkov utiahnu CSS 3D transformy
// bez jediného kilobajtu navyše.
//
// Rozmiestnenie: rady po zemepisných šírkach, počet dlaždíc v rade škáluje
// s `cos(lat)` — inak sa pri póloch prekrývajú. Zaokrúhľuje sa na NÁSOBOK 4,
// aby dlaždice stáli na spoločných poludníkoch (0/90/180/270) a oko to čítalo
// ako mriežku, nie ako náhodný posyp. Rady sú zrkadlené okolo rovníka.
//
// Prázdne miesta neexistujú: keď je psov menej než dlaždíc, opakujú sa (rovnako
// ako `fillerDogsRef` v stene). Pri 71 psoch a ~120 dlaždiciach ide každý pes
// na guľu ~2×.
// ════════════════════════════════════════════════════════════════════════════
import { memo, useEffect, useMemo, useRef, useState } from 'react';
// ⚠️ lucide, nie hand-drawn kit. Je to VEDOMÁ zhoda s /pack homepage: ten istý
// riadok života tam nesie tú istú iskru. Keď Sparkles dostane kresbu od Mateja,
// vymení sa na oboch miestach naraz, nie tu samostatne.
import { Sparkles } from 'lucide-react';
import { useT } from '@/i18n/LanguageContext';
import {
  NAV_GRAIN, NAV_MOTTLE, NAV_GRAIN_SCREEN_CSS,
} from '@/components/pack/navGoldSkin';
// ⚠️ Plus MUSÍ byť z hand-drawn kitu, nie dve kreslené čiary (Matej 26. 8.:
// „+ by malo byť brandove hand drawn"). HandIcons je jediný kanál, ktorý zdedí
// farbu textu — v lapisovom štvorci potrebujeme zlatý plus, nie čierny.
import { dogPagePath } from '@/lib/dogSlug';
import { useNavigate } from 'react-router-dom';
import { LAB } from '@/lib/labTheme';
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PORTAL_CSS, PORTAL_REDUCE_MOTION, buildPortal, createSparks } from './dogPortal';
import { openPhotoConfirm } from './photoConfirm';
import { intakePhoto } from '@/lib/photoIntake';
import type { PortalHandle } from './dogPortal';

/** Odliatok lapisovej pilulky: vrhnutý tieň + zlatá horná hrana, ako na hlavnom CTA. */
const LAPIS_CHIP_SHADOW = '0 2px 6px -2px rgba(5,15,48,0.55), inset 0 1px 0 rgba(201,154,63,0.30)';

import { track } from '@/lib/analytics';

export interface PlanetDog {
  id: string;
  name: string;
  n: number | null;
  photo: string;
  /** Fotka pre panel detailu — dlaždicových 160 px je v ňom rozmazaných. */
  photoBig: string;
  heroglyph: string;
  message: string;
  /** Zdroj pilulky s počtom dní — tá istá informácia ako na stránke psa. */
  birthDate: string | null;
}

/**
 * Prežité dni z dátumu narodenia. Zámerne to isté, čo počíta stránka psa
 * (`computeAge().totalDays` v pages/DogShare.tsx) — dve rôzne čísla pre ten istý
 * údaj na dvoch povrchoch je chyba, ktorá sa nájde až keď si ich niekto porovná.
 */
function dniZivota(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const dni = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  return dni >= 0 ? dni : null;
}

/** Polomer gule v px pri mierke 1. Skutočná veľkosť sa dolaďuje cez CSS scale. */
const R = 320;
/**
 * Aká časť rozostupu je samotná dlaždica (Matej 25. 8.: „fotky sa niekde križujú
 * a kolidujú, zmenši ich, nech je medzi nimi priestor").
 * ⚠️ VEĽKOSŤ DLAŽDICE SA NEZADÁVA RUČNE — počíta sa z rozostupu. Predtým tu bolo
 * pevných 92 px pri rozostupe 94 px, takže sa dlaždice dotýkali a v miestach, kde
 * ich perspektíva nakláňa, zajedali do seba.
 */
const TILE_FILL = 0.68;

/**
 * Podoby detailu psa. Matej 25. 8. uzavrel prvé kolo: *„dizajn sa mi páči skôr
 * karta, ale musíme to doladiť viac kontrastovať, nech to nie je ako pozadie
 * a musí to byť o niečo iné"* → tabuľa, doska a zvitok ZANIKLI aj s prepínačom,
 * ostáva karta a varianty postavené z nej.
 *
 * ⚠️ PRÍČINA SLABÉHO KONTRASTU BOLA VÝPLŇ, NIE RÁM ANI TIEŇ. Pozadie planéty je
 * `#FDF8EC → #F6EAD0 → #EBD9B4`, pôvodná karta `#FDF8EC → #F7ECD3 → #F0DFB8` —
 * teda doslova ten istý papyrus. Preto sa varianty nelíšia zdobením, ale tým,
 * KTORÝM SMEROM od steny odbočia: svetlejšia · tmavšia · čierna. Tvar (radius 16,
 * zlatý rám, papyrusový jazyk `/pack`) drží všetky štyri rovnaký.
 */
const DESIGNS = [
  { id: 'karta', label: 'karta' },       // pôvodná — referencia, s ktorou sa porovnáva
  { id: 'svetla', label: 'svetlá' },     // svetlejšia než stena + zlaté halo
  { id: 'piesok', label: 'piesok' },     // tmavšia než stena, ten istý tón
  { id: 'papyrus', label: 'papyrus' },   // jediná so ŠTRUKTÚROU — zrno + mramorovanie
  { id: 'noc', label: 'noc' },           // čierna — najväčší možný kontrast
] as const;
type Design = (typeof DESIGNS)[number]['id'];

/**
 * Podoby POZADIA scény (Matej 25. 8.: „vytvor prepínač aj na pozadie, lebo planéta
 * a pozadie má tu istú farbu, vyskúšajme to vizuálne oddeliť").
 *
 * ⚠️ Guľa nemá vlastný obrys — jej okraj tvoria dlaždice natočené takmer bokom,
 * teda ragged silueta, a `.planet-shade` ho ešte stmaví. Oddeliť ju od pozadia sa
 * preto NEDÁ rámom ani tieňom, len POĽOM ZA ŇOU. Každá podoba to skúša inou cestou:
 * svetlom (hĺbka), materiálom (papyrus) alebo tónom (noc).
 */
const BACKGROUNDS = [
  { id: 'blede', label: 'bledé' },     // pôvodné — referencia
  { id: 'hlbka', label: 'hĺbka' },     // guľa stojí vo svetle, rohy sú pripečené
  { id: 'papyrus', label: 'papyrus' }, // stena má materiál, fotky ležia NA niečom
  { id: 'noc', label: 'noc' },         // tmavé pole — najväčšie oddelenie
] as const;
type Bg = (typeof BACKGROUNDS)[number]['id'];

/**
 * ══ VYBRATÉ 25. 8. — DEV PULT ZMAZANÝ ═══════════════════════════════════════
 * Matej: „ok dizajn: karty daj svetlý, pozadie hĺbka a psov 200 — zmaž tie
 * prepínače zatiaľ."
 *
 * Zoznamy DESIGNS/BACKGROUNDS a ich CSS ostávajú NEDOTKNUTÉ zámerne: ďalšie kolo
 * ladenia je zmena týchto troch konštánt, nie prepisovanie štýlov. Prepínač sa
 * vráti tak, že sa nad ne opäť postavia pilulky.
 */
const DESIGN: Design = 'svetla';
const BG: Bg = 'hlbka';
/** Koľko dlaždíc guľa nesie. 71 = dnešná svorka; 200 je Matejov výber pre ladenie. */
const TARGET = 200;

/* 🔴 NÁSOBOK 2, NIE 4 — TU BOLI TIE „CHÝBAJÚCE DLAŽDICE" (28. 8. 2026).
 *  Matej dvakrát: „posvieť si na chybajuce dlazdice na mobile" a po prvej oprave
 *  (guľa sa krájala o hranu okna) „stále mi chýbajú dlaždice na mobile".
 *  Nechýbali ani teraz — bola nepravidelná mriežka. Zaokrúhlenie na násobok 4
 *  posúvalo počet v rade až o 1,5 dlaždice od ideálu, a keďže obvod prstenca je
 *  daný, celý rozdiel sa prejavil na medzerách. Odmerané (spacing 80,2 · dlaždica 55):
 *
 *      lat    ideál | násobok 4          | násobok 2
 *      0,00   25,07 | 24 → medzera 28,8  | 26 → 22,3
 *     28,72   21,98 | 20 → medzera 33,2  | 22 → 25,1
 *     43,09   18,31 | 20 → medzera 18,4  | 18 → 26,6
 *     57,45   13,49 | 12 → medzera 35,2  | 14 → 22,3
 *
 *  Rad na 57° mal teda DVOJNÁSOBNÚ medzeru než rad hneď pod ním (35,2 vs 18,4) —
 *  a to oko neprečíta ako „redší prstenec", ale ako vypadnuté dlaždice.
 *  Pri násobku 2 je rozptyl 22,3–26,6 px, teda tesne okolo ZVISLEJ medzery 25,2 px:
 *  mriežka má konečne rovnaké oká vo všetkých smeroch. Guľa má 200 dlaždíc
 *  namiesto 194, čo je presne TARGET (dovtedy sa 6 stratilo na zaokrúhľovaní).
 *  ⚠️ Cena je vedomá: pri násobku 4 zdieľali rady poludníky 0/90/180/270°, teraz
 *  len 0 a 180°. Zvislé stĺpce boli ale aj tak čitateľné nanajvýš pri rovníku —
 *  rady sa líšia počtom, takže sa aj tak rozchádzajú. Rovnomernosť váži viac.
 *  ⚠️ Vetva pre malé prstence ostáva (Matej 25. 8.: „tá posledná rada… sú spojené
 *  rohmi (8), dajme len 7"): pri póloch leží horná hrana dlaždice na MENŠOM kruhu
 *  než jej stred, takže sa rohy stretnú skôr než steny. Násobok 2 to rieši sám —
 *  7,83 dá 8 rovnako ako predtým, a pri ešte menšom prstenci klesne na 6, nie na 8. */
function rowCount(latDeg: number, spacing: number): number {
  const raw = (2 * Math.PI * R * Math.cos((latDeg * Math.PI) / 180)) / spacing;
  return Math.max(4, Math.round(raw / 2) * 2);
}

/**
 * Rozloží `target` dlaždíc rovnomerne po guli.
 * Rozostup vychádza z plochy: guľa má 4πR², na jednu dlaždicu teda pripadá
 * 4πR²/N a strana toho štvorčeka je rozostup. Z neho sa odvodí VŠETKO ostatné —
 * veľkosť dlaždice, výška radu aj počet dlaždíc v rade. Preto sa dá počet psov
 * meniť jedným číslom a mriežka ostane mriežkou (žiadne magické konštanty).
 */
function buildSphere(target: number) {
  const spacing = Math.sqrt((4 * Math.PI * R * R) / Math.max(8, target));
  const tile = Math.max(8, Math.round(spacing * TILE_FILL));
  const latStep = (spacing / R) * (180 / Math.PI);
  const lats: number[] = [];
  const m = Math.floor(90 / latStep);
  for (let k = -m; k <= m; k++) {
    const lat = k * latStep;
    // Rad príliš blízko pólu vynechávame — dlaždica by tam ležala naplocho
    // a prekryla by pólovú.
    if (Math.abs(lat) <= 90 - latStep * 0.6) lats.push(lat);
  }
  return { spacing, tile, lats };
}

interface Tile { key: string; dog: PlanetDog; lat: number; lon: number }

interface Note {
  id: number;
  dog: PlanetDog;
  /**
   * Na ktorej strane gule bublinka stojí — podľa toho, kde bol pes V OKAMIHU
   * VZNIKU (Matej 25. 8.: „netreba to dávať na striedačku ale na stranu kde sa
   * to práve hodí"). Striedanie sme skúsili predtým a posielalo čiaru cez celú
   * guľu k psovi na opačnej strane.
   */
  side: 'l' | 'r';
  el: HTMLElement;
  /**
   * Stred dlaždice v rovine obrazovky — pohyblivý koniec kóty. Toto JEDINÉ sa
   * priebežne prepočítava: pes sa točí ďalej, takže kóta mení dĺžku a sklon.
   */
  x: number;
  y: number;
  /**
   * Slot v pevnej mriežke (0–3 zhora nadol). Bublinka NEMÁ vlastnú súradnicu —
   * má číslo priehradky (Matej 25. 8.: „musia byť vždy na tých istých miestach
   * aby sa vošli 4 pod seba"). Poloha sa dopočíta z mriežky až pri vykreslení,
   * takže zmena okna presunie kóty samu od seba; uložená súradnica by po
   * zmenšení okna ostala visieť pod spodným navom.
   */
  slot: number;
  /** Kedy kurzor z fotky zišiel. `null` = ešte na nej stojí. */
  leftAt: number | null;
}

/** Ako dlho kóta prežije po tom, čo z fotky zídeš (Matej: „zmizne až po 3 sekundách"). */
const NOTE_TTL = 3000;
/* ── MRIEŽKA KÓT (Matej 25. 8.: „upratať kotovanie a dať tomu systém — kóty
   a obrázky, ktoré sú na nich, musia mať svoj priestor (PC), nesmú ísť za nav
   panely a musia byť vždy na tých istých miestach, aby sa vošli 4 pod seba") ──

   Predtým si každá kóta hľadala voľnú výšku pri psovi a odtiaľ sa odsúvala hore
   či dole. Výsledok: bublinky stáli zakaždým inde, susedné sa lepili na seba a
   krajné zajazdili pod horné menu aj pod spodný bar steny — tie sú pri otvorenej
   planéte na z-index 90, teda NAD celým overlayom, takže kóta pod nimi jednoducho
   zmizne.

   Teraz sú na každej strane ŠTYRI pevné priehradky. Bublinka nemá súradnicu, má
   číslo priehradky; kam priehradka padne, počíta jediná funkcia `kotovaMriezka()`
   z rozmerov okna. Pás pre kóty je ohraničený tak, aby sa navu steny ani nedotkol. */

/** Vrch pásu: horné menu aj prepínač/LOGIN sedia na `top: 12px` a merajú 40 px. */
const NOTE_TOP = 72;
/** Spodok pásu: bar steny sedí na `bottom: 16px` a v bledej téme meria ~60 px. */
const NOTE_BOTTOM = 96;
/** Štyri pod seba — zadanie, nie odhad. Strop na počet kót je z toho odvodený. */
const NOTE_SLOTS = 4;
const NOTE_MAX = NOTE_SLOTS * 2;
/** Odsadenie stĺpca od okraja okna a od gule. Stĺpec sa lepí na OKRAJ, nie na guľu. */
const NOTE_EDGE = 24;
const NOTE_BALL = 40;
/**
 * Bublinka vyplní pás vedľa gule, ale nerastie donekonečna — na širokom monitore
 * by z nej bol plagát. Spodná hranica je bod, pod ktorým sa meno a odkaz už nedajú
 * prečítať; pod ňou kóty radšej nie sú vôbec. Guľa má 640 px, takže pás dá 200 px
 * až pri okne širokom ~1170 px — na užšom PC okne kóty nevzniknú.
 */
const NOTE_W_MIN = 200;
const NOTE_W_MAX = 330;
/**
 * Výška vychádza z priehradky. 76 px = meno + DVA riadky odkazu + výplň; od 110 px
 * sa odkaz pustí na tri. Bez toho by na nižšom okne nevznikla ani jedna kóta —
 * štyri priehradky po 92 px si pýtajú okno vysoké 592 px, po 76 px stačí 528.
 */
const NOTE_H_MIN = 76;
const NOTE_H_MAX = 124;
const NOTE_H_3LINE = 110;
/** Medzera medzi priehradkami — bez nej by sa štyri bublinky dotýkali. */
const NOTE_VGAP = 14;

interface Mriezka {
  /** Rozmer bublinky. Rovnaký pre všetky štyri — priehradky sú zhodné. */
  w: number;
  h: number;
  /** Priemer fotky v bublinke — obrázok má tiež svoj priestor, nie zvyšok po texte. */
  photo: number;
  /** Koľko riadkov odkazu sa do priehradky zmestí. */
  lines: number;
  /** Ľavá hrana stĺpca na tej-ktorej strane. */
  lx: number;
  rx: number;
  /** Stredy štyroch priehradiek zhora nadol. */
  ys: number[];
}

/**
 * Pevná mriežka kót pre aktuálne okno. `null` = okno je na kóty primalé (guľa má
 * 640 px a nav si drží svoje pásy) — vtedy kóta nevznikne vôbec. To je zámer:
 * lepšie žiadna kóta než kóta schovaná pod barom.
 */
function kotovaMriezka(): Mriezka | null {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W / 2;
  // Voľný pás vedľa gule. Guľa je vodorovne v strede a má známy polomer, takže
  // sa to dá dopočítať — čítať to zo živého obdĺžnika sa nesmie, pri otváraní
  // sa scéna ešte škáluje (1.75 → 1).
  const pas = cx - R - NOTE_BALL - NOTE_EDGE;
  const w = Math.min(NOTE_W_MAX, Math.floor(pas));
  if (w < NOTE_W_MIN) return null;
  const rad = (H - NOTE_TOP - NOTE_BOTTOM) / NOTE_SLOTS;
  const h = Math.min(NOTE_H_MAX, Math.floor(rad - NOTE_VGAP));
  if (h < NOTE_H_MIN) return null;
  const ys: number[] = [];
  for (let i = 0; i < NOTE_SLOTS; i++) ys.push(Math.round(NOTE_TOP + rad * (i + 0.5)));
  return {
    w,
    h,
    photo: Math.min(62, h - 30),
    lines: h >= NOTE_H_3LINE ? 3 : 2,
    lx: NOTE_EDGE,
    rx: W - NOTE_EDGE - w,
    ys,
  };
}

/** Hrana bublinky otočená ku guli — odtiaľ vychádza vodiaca čiara. */
const kotaKotva = (side: 'l' | 'r', g: Mriezka) => (side === 'l' ? g.lx + g.w : g.rx);

/**
 * Pole dlaždíc ako VLASTNÝ memo komponent. Bublinka sa prepisuje ~15× za sekundu
 * (guľa sa točí a pod kurzorom sa strieda pes za psom); keby dlaždice viseli
 * priamo v tele planéty, každý taký prepis by zreconcilioval 1000 uzlov.
 * `tiles` chodí z `useMemo`, takže identita poľa sa medzi tými prepismi nemení
 * a `memo` ich preskočí.
 */
const TileField = memo(function TileField({ tiles }: { tiles: Tile[] }) {
  return (
    <>
      {tiles.map(({ key, dog, lat, lon }, i) => (
        <div
          key={key}
          className="planet-tile"
          // Index do `tiles` — z neho si gestá dohľadajú psa. Bez neho by
          // sa muselo hľadať podľa URL fotky, a tá sa na guli opakuje.
          data-i={i}
          style={{ ['--t' as string]: `rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${R}px)` }}
        >
          {/* 🔴 BEZ loading="lazy" (4. 9. 2026). Matej: „na planétke sú voľné
              sloty = nenačítajú sa všetky obrázky, vyzerá to ako chyba."
              Dlaždíc je 200, ale ADRIES len toľko, koľko má svorka psov (dnes
              72) — každá sa na guli opakuje. Lazy dlaždice na odvrátenej strane
              sa nenačítali nikdy, a keď ich otáčanie prinieslo dopredu, boli
              prázdne. Prehliadač teda sťahuje 72 súborov po 160 px, nie 200 —
              to je lacnejšie než diery v guli. */}
          <img src={dog.photo} alt="" draggable={false} decoding="async" />
        </div>
      ))}
    </>
  );
});

export function DogPlanetLab({
  dogs,
  open,
  paused = false,
  onClose,
  pick,
}: {
  dogs: PlanetDog[];
  open: boolean;
  /**
   * Gula je na obrazovke, ale uz ju nikto nevidi (film /onepage ju ma prilepenu
   * na cely scroll). Zastavi rAF slucku — nie kvoli batérii, ale kvoli SCROLLU:
   * slucka cita 15x za sekundu dlazdicu pod kurzorom cez elementFromPoint nad
   * ~1000 prvkami v 3D a berie snimky prave prebiehajucemu scrollu.
   */
  paused?: boolean;
  onClose: () => void;
  /**
   * Žiadosť z kalkulačky v spodnom nave: „ukáž psa s týmto číslom".
   * ⚠️ Nesie `seq`, nie iba `n`, ZÁMERNE — človek smie natukať to isté číslo
   * dvakrát po sebe (napr. po zavretí karty). Keby sa efekt viazal len na `n`,
   * druhý pokus by React považoval za tú istú hodnotu a nič by sa nestalo.
   */
  pick?: { n: number; seq: number } | null;
}) {
  const t = useT();
  const navigate = useNavigate();

  // ── FOTKA PSA ROVNO Z PRVEJ OBRAZOVKY (Matej 26. 8. 2026) ────────────────
  // *„CTA bude pridaj svojho psa — nebude klasické tlačítko ale štvorec s +
  //   Pridaj FOTO svojho psa. Pod tým malým písmom (fotku môžeš neskôr zmeniť)."*
  //
  // Fotka sa tu NENAHRÁVA na Cloudinary — ide len o náhľad v prehliadači
  // (`URL.createObjectURL`). Na server ide až vo flow, spolu s platbou; dovtedy
  // nemáme kam ju uložiť a nahrávať súbor človeku, ktorý za dve sekundy odíde,
  // je platený prenos za nič. Do storu ju odovzdávame preto, aby ju flow
  // našiel — `dogPhotoUrl` sa NEpersistuje (`partialize` v `dogyptStore.ts`),
  // takže blob nemá ako prežiť reload a zostať visieť.
  const [photo, setPhoto] = useState<string | null>(null);

  // ── NAJPRV PLANÉTKA, AŽ POTOM VÝZVA (Matej 3. 9. 2026) ───────────────────
  // Matej: *„úvodné načítanie musí byť najprv planétka a až potom portál (CTA),
  // teraz som si všimol že to robí naopak."*
  //
  // 🔑 PRÍČINA NIE JE V PORADÍ KÓDU, ALE V ČASE NAČÍTANIA. Hero (nadpis, veta,
  // portál) je hotový v prvom snímku — je to text a jedna dlaždica. Guľa je
  // ~1000 dlaždíc s fotkami z Cloudinary, takže dobieha ešte sekundy potom.
  // Vidieť je preto CTA nad prázdnou guľou, čiže presne opačné poradie, než
  // aké má obraz rozprávať: *toto je svorka → pridaj sa*.
  //
  // ⚠️ NEDÁ SA TO RIEŠIŤ KRYTÍM NA `.planet-hero`. Film (/onepage) mu zapisuje
  // `style.opacity` priamo (`put(n.pHero, 'pho', …)` v OnePage.tsx), a inline
  // zápis prebije každé CSS pravidlo. Preto nábeh nesú DETI hera — ich krytie
  // sa s tým filmovým prirodzene násobí a nebijú sa.
  //
  // ⚠️ STROP JE PODMIENKA, NIE POISTKA. Čakať na „všetky hotové" nemá zmysel
  // ani teraz, keď dlaždice nie sú lazy: guľa má 200 dlaždíc a stačí, aby sa
  // jedna adresa nedala stiahnuť, a výzva by neprišla nikdy. Preto sa čaká na
  // PRVÝCH pár a strop dorazí aj tak.
  // ⚠️ Strop je 1200 ms, nie 1800 (Matej 4. 9. 2026: „zrýchli to maximálne
  // možné, web musí byť rýchly a pružný"). Poradie *guľa → výzva* ostáva, len
  // sa naň nečaká dlhšie, než trvá prvá pologuľa.
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => {
    if (heroIn) return;
    let done = false;
    const arrive = () => { if (!done) { done = true; setHeroIn(true); } };
    // Strop: výzva príde aj keby sa nenačítala ani jedna fotka (offline, 404).
    const cap = window.setTimeout(arrive, 1200);
    const poll = window.setInterval(() => {
      const imgs = document.querySelectorAll<HTMLImageElement>('.planet-ball img');
      if (!imgs.length) return;
      let ok = 0;
      imgs.forEach((im) => { if (im.complete && im.naturalWidth > 0) ok++; });
      // Prah je počet, nie podiel: podiel by sa pri lazy dlaždiciach nikdy
      // nenaplnil. 24 je zhruba predná pologuľa — teda to, čo je vidieť.
      if (ok >= Math.min(24, imgs.length)) arrive();
    }, 90);
    return () => { window.clearTimeout(cap); window.clearInterval(poll); };
  }, [heroIn]);
  // Tváre, ktoré sa v prázdnej dlaždici striedajú. Berú sa z psov NA GULI, nie
  // z pevného zoznamu — dlaždica má ukazovať, kam sa človek pridáva.
  const cycPhotos = dogs.slice(0, 12).map(d => d.photo).filter(Boolean);
  const fileRef = useRef<HTMLInputElement | null>(null);
  // ── PORTÁL A JEHO ISKRY ──────────────────────────────────────────────────
  // Tvar aj iskry stavia components/gods/dogPortal.ts — tú istú dlaždicu kreslí
  // aj stena, ktorá je vanilla DOM, takže tvar nesmie žiť v JSX.
  // ⚠️ Slučku si drží TENTO komponent (frame(dt) sa volá zo step() nižšie).
  // Druhá rAF slučka by si s otáčaním gule konkurovala o snímok.
  const portalMountRef = useRef<HTMLSpanElement | null>(null);
  const portalRef = useRef<HTMLElement | null>(null);
  const portalApi = useRef<PortalHandle | null>(null);
  const sparksRef = useRef<{ frame(dt: number): void } | null>(null);

  // Portál sa stavia RAZ (a znova len keď sa vymení sada tvárí). Prestavba pri
  // každom vykreslení by zahodila plátno aj s vyrovnávacou pamäťou iskier.
  const facesKey = cycPhotos.join('|');
  useEffect(() => {
    const host = portalMountRef.current;
    if (!host) return;
    const p = buildPortal({
      faces: cycPhotos,
      // ⚠️ Cez REF, nie cez `photo` zo stavu — portál sa stavia raz (deps
      // `facesKey`) a uzáver by navždy držal prvú hodnotu, teda `null`.
      onPick: () => (photoRef.current ? showConfirm(photoRef.current) : openPicker()),
    });
    host.appendChild(p.el);
    portalApi.current = p;
    portalRef.current = p.el;
    sparksRef.current = createSparks(p.canvas);
    return () => {
      p.el.remove();
      portalApi.current = null;
      portalRef.current = null;
      sparksRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facesKey]);

  // Fotka sa prepisuje IMPERATÍVNE — jadro sa prekreslí, plátno iskier ostáva.
  useEffect(() => { portalApi.current?.setPhoto(photo); }, [photo]);

  // ⚠️ Blob sa pri odchode z komponentu ZÁMERNE NEUVOĽŇUJE. Odchod je práve to
  // kliknutie na POKRAČOVAŤ — flow drží tú istú adresu v store a `revokeObjectURL`
  // by mu ju v tej istej sekunde zabil. Pustí sa len starý blob pri výmene fotky.

  // ── PO VYBRATÍ FOTKY VYSKOČÍ KARTA (28. 8. 2026) ─────────────────────────
  // Matej: *„toto nevyzerá vôbec dobre, ako to že stále používaš oranžovú CTA?
  // a tlačítko je pod tým"*. Guľa mala do 28. 8. vlastný tvar — fotka v dlaždici
  // a POD ŇOU samostatné zlaté `join-btn`. Je to tá istá dlaždica ako na stene
  // a v tom istom filme, takže dva rôzne pokračovania boli rozpor, nie voľba.
  // Zlaté tlačidlo tým zaniklo: hlavné CTA je od 28. 8. LAPIS (CLAUDE.md) a to
  // jediné na obrazovke nesie karta.
  const photoRef = useRef<string | null>(null);
  useEffect(() => { photoRef.current = photo; }, [photo]);

  const openPicker = () => {
    if (fileRef.current) fileRef.current.value = '';
    fileRef.current?.click();
  };

  const showConfirm = (url: string) => {
    track('planet_photo_confirm_shown');
    openPhotoConfirm({
      photoUrl: url,
      packNumber: dogs.reduce((m, d) => Math.max(m, d.n ?? 0), 1) + 1,
      onContinue: () => {
        track('cta_become_dogyptian_click', { location: 'planet' });
        navigate('/heroglyph/name');
      },
      onPickAnother: () => { track('planet_photo_confirm_another'); openPicker(); },
      onClose: () => track('planet_photo_confirm_dismissed'),
    });
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';   // ten istý súbor sa musí dať vybrať druhýkrát
    // `intakePhoto` zapíše adresu do storu a na pozadí spustí nahrávanie na
    // Cloudinary. Dovtedy sa fotka z gule niesla len ako `blob:` — kto odišiel
    // v polovici flow, nemal ju nikde, hoci ju už dal.
    const { previewUrl } = intakePhoto(file);
    setPhoto(previewUrl);
    showConfirm(previewUrl);
  };
  // Naklonenie DOLE na severný pól: Hektorova dlaždica leží na vrchole vodorovne,
  // takže pri pohľade spredu je iba čiara. Kladné rotateX = pozeráme sa na guľu
  // zhora a vrchol je vidno. (Predtým tu bolo −14, teda pohľad zdola.)
  // Naklonenie na SEVERNÝ pól (Hektor). ⚠️ ZÁPORNÉ rotateX = pozeráme sa zhora;
  // pri kladnom sa vrchol odkláňa od diváka a jeho dlaždica zmizne ako zadná
  // strana (backface). Overené meraním, nie odhadom.
  //
  // ⚠️ Otáčanie NEJDE cez React state. Pri 1000 dlaždiciach by `setSpin` v každom
  // snímku prekreslil celý zoznam — guľa sa sekala. Uhol žije v ref-e a zapisuje
  // sa priamo do `style.transform` gule; React sa o rotáciu vôbec nestará.
  const spinRef = useRef({ x: -24, y: 0 });
  const ballRef = useRef<HTMLDivElement>(null);
  // Počet dlaždíc, podoba karty a pole za guľou sú VYBRATÉ — viď TARGET / DESIGN / BG
  // hore v súbore. Prepínače zanikli 25. 8.
  const target = TARGET;
  // Ťah: okrem poslednej pozície si drží PREJDENÚ DRÁHU a dlaždicu, na ktorej sa
  // prst položil — z toho sa na konci rozhodne, či to bol ťuk alebo otáčanie.
  const dragRef = useRef<{ x: number; y: number; dist: number; tile: HTMLElement | null } | null>(null);
  const autoRef = useRef(true);

  // ── INTERAKCIA (Matej 25. 8.: „nech je tá planéta interaktívna") ────────────
  // Meno pri kurzore. Drží sa v state, lebo sa vykresľuje ako samostatný štítok
  // NAD guľou — dieťaťom dlaždice byť nemôže: tá je otočená v priestore, takže
  // text by bol šikmý a na zadnej pologuli by ho `backface-visibility` zhaslo.
  // KÓTY (Matej 25. 8.: „na jemnej kóte sa zobrazí väčšia bublinka psa s menom
  // a textom; keď šípka zíde z fotky, bublinka s kótou zostane a zmizne až po
  // 3 sekundách, tak môže byť viacero bubliniek otvorených po obidvoch stranách,
  // raz tam raz tam"). Bublinka pri kurzore týmto zanikla — dve rôzne bublinky
  // o tom istom psovi naraz sú šum.
  // `el` = dlaždica, na ktorej kóta visí; jej polohu si kóta prečíta v každom
  // ťuku slučky, takže vodiaca čiara ide za psom, aj keď sa guľa točí ďalej.
  const [notes, setNotes] = useState<Note[]>([]);
  const noteSeq = useRef(0);
  /**
   * Mriežka kót. Je v stave (kreslí sa z nej) aj v refe (číta ju rAF slučka —
   * tá si drží closure z posledného behu efektu a stav v nej vie byť o snímok
   * pozadu). Prepočítava sa pri zmene okna, takže kóty sa presunú s ním.
   */
  const [mriezka, setMriezka] = useState<Mriezka | null>(null);
  const mriezkaRef = useRef<Mriezka | null>(null);
  /**
   * Kóta, na ktorej práve stojí kurzor. Kým na nej stojí, NEODPOČÍTAVA sa jej
   * čas — bez toho by zmizla pod rukou, ktorá na ňu ide kliknúť: odchodom z gule
   * sa trojsekundový odpočet spustí všetkým naraz.
   */
  const hoverNoteRef = useRef<number | null>(null);
  // Posledná poloha myši nad guľou. Guľa sa pod kurzorom TOČÍ ĎALEJ (Matej 25. 8.:
  // „nepáči sa mi že myš zastaví planétu… pri prejdení myšou sa zobrazí bublinka
  // so psom a menom aj keď len na okamih"), takže dlaždica pod kurzorom sa mení
  // aj vtedy, keď sa myš nehýbe — a `pointermove` vtedy nepríde. Bublinka sa preto
  // dopočítava z rAF slučky, nie z pohybu myši.
  const ptRef = useRef<{ x: number; y: number } | null>(null);
  /**
   * BEZI PRAVE SCROLL? (Matej 26. 8. 2026: *„v momente ako zacne scrol musia sa
   * vypnut koty aj bublinky, aby to bolo plynule."*)
   * Kota je najdrahsia vec na guli: `tickNotes` robi `elementFromPoint` nad 1000
   * dlazdicami v 3D a potom `getBoundingClientRect` kazdej zivej kote — teda
   * vynuteny prepocet rozlozenia 15x za sekundu, presne kym scroll potrebuje
   * kazdy snimok. Preto kota pocas scrollu nevznika ani sa neposuva; zive sa
   * zmazu hned na prvom ticku.
   */
  /**
   * Koľko stupňov otočenia dá jeden pixel scrollu. 0.08 ⇒ bežný ťah prstom
   * (~300 px) pootočí guľu o zhruba štvrť otáčky — cítiť to, ale nekrúti sa
   * to divoko. Prechod filmu má tri obrazovky, teda za celý odchod gule to je
   * necelá polovica otáčky.
   */
  const SCROLL_SPIN = 0.08;
  const scrollingRef = useRef(false);
  /**
   * ⚠️ NIE JE TO LEN „PRÁVE SA SCROLLUJE". Znamená to „guľa nie je v pokoji",
   * teda buď sa hýbe scroll, ALEBO stránka nestojí na vrchu.
   * Prvá verzia stíšila len samotný ťah a Matej to 26. 8. 2026 vrátil so
   * screenshotom odlietajúcej gule a živou bublinkou: *„pri scrole stale
   * funguju koty aj bublinky… povedali sme si že nebudú."* Príčina bola v tom,
   * že trackpad pri zastavení pošle drobný `pointermove` — a keďže sa kóty
   * púšťali hneď, ako ťah dobehol, naskočili na guli, ktorá už odlietala.
   * Guľa v prechode je odchádzajúca dekorácia; hoverovať sa na nej nemá čo.
   * ⚠️ Väzba na `window.scrollY` je cielená na film (`/onepage`): na stene aj
   * v LabShell scrolluje panel, nie okno, takže tam je scrollY vždy 0 a toto
   * pravidlo nič nemení.
   */
  const [picked, setPicked] = useState<PlanetDog | null>(null);
  // KDE sa detail otvorí — VYBRATÉ 25. 8. (Matej: „môžeš vymazať KDE, lebo
  // necháme bok na PC"). Prepínač aj možnosť `center` zanikli; trieda ostáva
  // v className natvrdo, aby `.v-side` pravidlá nemuseli meniť tvar.
  // Na mobile sa bok sám mení na „zhora" (media query nižšie).
  //
  const design = DESIGN;
  const bg = BG;
  // Zvýraznená dlaždica sa nastavuje PRIAMO na DOM prvku, nie cez state — pri
  // 1000 dlaždiciach by každé prejdenie myšou prekreslilo celý zoznam.
  const hotRef = useRef<HTMLElement | null>(null);
  const setHot = (el: HTMLElement | null) => {
    if (hotRef.current === el) return;
    hotRef.current?.classList.remove('is-hot');
    hotRef.current = el;
    el?.classList.add('is-hot');
  };

  // Rozmiestnenie sa počíta RAZ pre daný zoznam psov — pri každom renderi by sa
  // dlaždice premiešali a guľa by pri otáčaní „blikala" inými psami.
  const { tiles, tile } = useMemo(() => {
    const { tile, lats, spacing } = buildSphere(target);
    if (dogs.length === 0) return { tiles: [], tile };
    const out: Tile[] = [];
    let i = 0;
    // SEVERNÝ PÓL = HEKTHOR (Matej 25. 8.: „horná dlaždica (póly) tam dajme
    // Hektora"). Vrchol gule je jediné miesto, ktoré sa pri otáčaní nehýbe —
    // rovnaká logika ako jeho pevná karta nad hero na stene.
    // Južný pól dostane bežného psa: nechať tam dieru vyzerá ako chyba, nie ako
    // zámer, a pri naklonení gule je jama vidno.
    // ⚠️ ZNAMIENKO: v CSS rastie os Y SMEROM DOLE, takže `rotateX(-lat)` posiela
    // lat +90 na SPODOK gule. Vrchol je preto lat −90 — overené meraním, nie
    // odhadom (prvý pokus mal Hektora na dne a bol z neho 13 px pásik).
    const hektor = dogs.find(d => d.n === 1) ?? dogs[0];
    out.push({ key: 'pole-top', dog: hektor, lat: -90, lon: 0 });
    for (const lat of lats) {
      const count = rowCount(lat, spacing);
      for (let c = 0; c < count; c++) {
        out.push({
          key: `${lat}:${c}`,
          dog: dogs[i % dogs.length],
          lat,
          lon: (360 / count) * c,
        });
        i++;
      }
    }
    out.push({ key: 'pole-bottom', dog: dogs[i % dogs.length], lat: 90, lon: 0 });
    return { tiles: out, tile };
  }, [dogs, target]);

  /** Dlaždica pod prvkom → pes. `img` má pointer-events:none, takže cieľom je div. */
  // KALKULAČKA OTVÁRA KARTU (Matej 25. 8.: „natukanie čísla — otvorenie karty
  // s detailom psa… človek môže klikať ďalšie čísla a napravo sa bude meniť
  // karta"). Guľa sa pritom NEZASTAVUJE ani nepretáča — panel je bočný a číslo
  // hovorí, KOHO ukázať, nie kam sa pozerať.
  // ⚠️ Hľadá sa v `dogs` (reálna svorka: Hektor #1 + zákazníci), NIE v `tiles` —
  // tam je ten istý pes viackrát ako výplň a pri 200 dlaždiciach by číslo mimo
  // svorky ticho trafilo duplikát.
  useEffect(() => {
    if (!open || !pick) return;
    const dog = dogs.find(d => d.n === pick.n);
    if (dog) setPicked(dog);
  }, [pick?.seq, open, dogs]);   // eslint-disable-line react-hooks/exhaustive-deps

  const dogAt = (el: Element | null): PlanetDog | null => {
    if (!el) return null;
    const i = Number((el as HTMLElement).dataset.i);
    return Number.isInteger(i) ? tiles[i]?.dog ?? null : null;
  };

  /**
   * Prečíta, čo práve leží pod kurzorom, a prepíše bublinku. Volá sa z rAF
   * slučky (guľa sa točí) aj z pohybu myši (kurzor sa hýbe) — obe strany sa
   * menia nezávisle, takže jedna bez druhej nestačí.
   * Kým je otvorený detail, bublinka mlčí: dvaja psi naraz sú šum.
   */
  /**
   * Jeden ťuk sledovania: prečíta, čo leží pod kurzorom, založí novú kótu,
   * prepočíta polohy vodiacich čiar a nechá dobehnúť tie, ktorým vypršal čas.
   * Volá sa z rAF slučky, NIE z pohybu myši — guľa aj kurzor sa menia nezávisle
   * a pri nehybnej ruke by pointermove nikdy neprišiel.
   */
  /**
   * Vyberie priehradku pre nového psa: z voľných tú, ktorá je jeho výške najbližšie.
   * `null` = strana je plná (štyri kóty) a kóta nevznikne — do troch sekúnd sa
   * priehradka uvoľní sama.
   * ⚠️ Nič sa neodsúva ani nedopočítava od suseda. Priehradky sú dané mriežkou,
   * takže tá istá kóta padne pri každom prejdení na to isté miesto.
   */
  const volnySlot = (side: 'l' | 'r', chcem: number, zive: Note[], g: Mriezka): number | null => {
    const obsadene = new Set(zive.filter(n => n.side === side).map(n => n.slot));
    // PRIEHRADKA POD KALKULAČKOU NEEXISTUJE. Kým kalkulačka zo spodného navu stojí
    // nad guľou, bublinka pod ňou by bola neviditeľná (kalkulačka je na z-index 200)
    // a vyzeralo by to, že kóta nenabehla. Preskočí sa presne ako obsadená
    // priehradka — kóta padne inam, alebo nevznikne. Preskok na DRUHÚ stranu je
    // zakázaný inde a platí aj tu.
    // ⚠️ Rozmer sa ČÍTA zo živého DOM, nie zapisuje ako konštanta: kalkulačka je
    // cudzí komponent (GodsGridLab) a jej výška závisí od obsahu. Dve čísla pre
    // jednu vec by sa rozišli pri prvej úprave. Merať sa tu smie — nič sa podľa
    // toho nenastavuje, iba sa vylučujú priehradky.
    const kalk = side === 'l'
      ? document.querySelector('.numpad-overlay--planet.open .numpad')?.getBoundingClientRect() ?? null
      : null;
    let best: number | null = null;
    let bestD = Infinity;
    for (let i = 0; i < NOTE_SLOTS; i++) {
      if (obsadene.has(i)) continue;
      if (kalk && kalk.left < g.lx + g.w
          && Math.abs(g.ys[i] - (kalk.top + kalk.height / 2)) < (g.h + kalk.height) / 2) continue;
      const d = Math.abs(g.ys[i] - chcem);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const tickNotes = () => {
    // Jedine miesto, kde sa scroll zohladnuje — volaju to rAF slucka aj
    // pointermove, takze guard patri sem, nie do oboch volajucich.
    if (scrollingRef.current) return;
    const now = performance.now();
    const pt = ptRef.current;
    let hoveredEl: HTMLElement | null = null;

    if (pt && !dragRef.current && !picked) {
      const el = document.elementFromPoint(pt.x, pt.y);
      const tile = (el?.closest?.('.planet-tile') ?? null) as HTMLElement | null;
      if (tile) hoveredEl = tile;
      // MEDZERA MEDZI DLAŽDICAMI (je ich tretina rozostupu) nie je odchod z gule —
      // keby sa v nej kóta hneď rozbehla dohasínať, nad nehybným kurzorom by
      // bliknutie striedalo bliknutie. Odchod je až opustenie celej gule.
      else if (el?.closest?.('.planet-ball')) hoveredEl = hotRef.current;
    }
    setHot(hoveredEl);

    setNotes(prev => {
      let next = prev;
      // NOVÁ KÓTA — vystrelí na tú stranu, kde pes práve je, a bublinka tam
      // ostane stáť. Poloha sa počíta RAZ, tu; ďalej sa mení iba koniec kóty.
      if (hoveredEl && !prev.some(n => n.el === hoveredEl)) {
        const dog = dogAt(hoveredEl);
        const r = hoveredEl.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const g = mriezkaRef.current;
        if (dog && g) {
          // ⚠️ KÓTA NIKDY NEPRECHÁDZA NA DRUHÚ STRANU (Matej 25. 8.: „tam kde je
          // šípka, na tú stranu má ísť aj kóta, aby nešla cez celú stranu ale len
          // na svoju"). Keď je strana plná, kóta nevznikne — do troch sekúnd sa
          // miesto uvoľní samo. Preskok na druhú stranu tu bol a robil presne to,
          // čomu sa má predísť: čiaru cez celú guľu.
          // Odsúvanie „vždy nižšie" tu bolo ešte predtým a končilo kopou
          // bubliniek nalepených na spodnú hranu.
          // Strana sa berie z KURZORA, nie zo stredu dlaždice — dlaždica pri
          // deliacej čiare vie byť o pár pixelov za ňou a čiara by sa vrátila.
          const side: 'l' | 'r' = (pt ? pt.x : x) < window.innerWidth / 2 ? 'l' : 'r';
          const slot = volnySlot(side, y, prev, g);
          if (slot !== null) {
            next = [...prev, { id: noteSeq.current++, dog, side, el: hoveredEl, x, y, slot, leftAt: null }];
            if (next.length > NOTE_MAX) next = next.slice(next.length - NOTE_MAX);
          }
        }
      }

      let zmena = next !== prev;
      const out: Note[] = [];
      for (const n of next) {
        // Dlaždica zmizla (zmenil sa počet psov) → kóta nemá na čom visieť.
        if (!n.el.isConnected) { zmena = true; continue; }
        // Kótu drží pri živote OBOJE: pes pod kurzorom aj kurzor na samotnej
        // bublinke. Bublinka je klikateľná, takže musí prežiť cestu myši k nej.
        const drzi = n.el === hoveredEl || hoverNoteRef.current === n.id;
        const leftAt = drzi ? null : (n.leftAt ?? now);
        if (leftAt !== null && now - leftAt > NOTE_TTL) { zmena = true; continue; }
        const r = n.el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        if (leftAt !== n.leftAt || Math.abs(x - n.x) > 0.5 || Math.abs(y - n.y) > 0.5) {
          out.push({ ...n, x, y, leftAt });
          zmena = true;
        } else {
          out.push(n);
        }
      }
      return zmena ? out : prev;
    });
  };

  // ── POČAS SCROLLU KOTY A BUBLINKY MLČIA ─────────────────────────
  // Zive koty sa zmazu hned prvym tickom scrollu a nove nevznikaju, kym sa scroll
  // nezastavi. Dovod je vykon (viz `scrollingRef`), ale je aj obsahovy: pri
  // scrolle kurzor stoji a gula sa pod nim hybe, takze by z nej vyskakovali
  // bublinky psov, ktorych si nikto nevybral.
  //
  // ⚠️ `capture: true` NIE JE ozdoba: scroll event NEBUBLA. V LabShell scrolluje
  // panel `.lsh-scroll`, nie okno — bez zachytavania by tam listener nikdy
  // nedostal ani jeden event a kota by sekala dalej.
  //
  // ⚠️ `ptRef` sa nuluje zamerne. Bez toho by v okamihu zastavenia scrollu
  // vyskocila kota pod nehybnym kurzorom — teda tam, kam sa nikto nepozeral.
  // Vrati sa az prvym pohybom ruky (`onMove` si `ptRef` nastavi sam).
  useEffect(() => {
    if (!open) return;
    let t = 0;
    /** Ticho platí, kým stránka nestojí na vrchu — nielen počas samotného ťahu. */
    const TOP = 4;
    scrollingRef.current = window.scrollY > TOP;
    let lastY = window.scrollY;
    const onScroll = () => {
      // ── SCROLL TOČÍ GUĽU (Matej 26. 8. 2026) ─────────────────────────────
      // *„pri scrole sa planéta netočí len sa zasekne a ide dozadu — každý
      // scrol rukou by mala točiť planétu."*
      // Nie sú to dve animácie naraz: automatické otáčanie je počas ťahu
      // vypnuté a otočenie preberá PRIAMO posun scrollu. Za snímok tak vzniká
      // jedno prekreslenie, nie dve nezávislé (predtým bežal časovač na 60 fps
      // a scroll popri ňom). Uhol sa NEVRACIA — pripočítava sa do toho istého
      // `spinRef`, z ktorého potom pokračuje aj automatické otáčanie.
      const y = window.scrollY;
      spinRef.current.y += (y - lastY) * SCROLL_SPIN;
      lastY = y;
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        ptRef.current = null;
        setHot(null);
        setNotes(prev => (prev.length ? [] : prev));
      }
      clearTimeout(t);
      // 160 ms po poslednom pohybe — a aj potom len vtedy, ak si späť na vrchu.
      // Kratsie a koty sa rozblikaju medzi ticmi kolieska; dlhsie a po zastaveni
      // to vyzera, ze gula prestala reagovat.
      t = window.setTimeout(() => { scrollingRef.current = window.scrollY > TOP; }, 160);
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      clearTimeout(t);
      scrollingRef.current = false;
    };
  }, [open]);

  // Automatické otáčanie. Pauzuje počas ťahania a keď je overlay zavretý —
  // rAF slučka bežiaca na skrytej stránke je zbytočný žrút batérie.
  //
  // V tej istej slučke sa PREČÍTAVA aj dlaždica pod kurzorom. Nedá sa to nechať
  // na `pointermove`: guľa sa točí ďalej, takže sa pod nehybnou myšou strieda pes
  // za psom a bublinka by ukazovala toho, ktorý tam bol pred sekundou.
  // ⚠️ Zámerne len ~15× za sekundu (každý 4. snímok). `elementFromPoint` je nad
  // 1000 dlaždicami v 3D reálna práca a na plynulé čítanie mena stačí 15 Hz.
  useEffect(() => {
    if (!open || paused) return;
    let raf = 0;
    let frame = 0;
    let last = performance.now();
    let lastTf = '';
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      // ⚠️ POČAS SCROLLU SA GUĽA NEHÝBE — a je to VÝKONOVÁ PODMIENKA, nie vkus.
      // Kým sa gule mení otočenie, prehliadač musí celý 3D strom (stovky dlaždíc
      // s fotkami) prekresliť nanovo v KAŽDOM snímku. Len čo otáčanie stojí,
      // nakreslí si guľu RAZ a ďalej s ňou narába ako s jedným hotovým obrázkom:
      // zmenšovanie aj miznutie potom robí grafická karta a scroll je zadarmo.
      // Presne o to Matej žiadal (26. 8. 2026): *„z planétky sa stane jeden
      // obrázok? proste musí to byť plynulé."*
      // `last` sa aktualizuje aj tak, takže po zastavení sa guľa nerozbehne
      // skokom o nazbieraný čas.
      // Automatický pohyb sa počas ťahu NEPRIPOČÍTAVA — inak by sa sčítali dva
      // zdroje otáčania a guľa by pod prstom uháňala.
      if (!scrollingRef.current && autoRef.current) spinRef.current.y += dt * 0.006;
      const el = ballRef.current;
      const tf = `rotateX(${spinRef.current.x}deg) rotateY(${spinRef.current.y}deg)`;
      // ⚠️ Zápis LEN PRI ZMENE. Keď guľa stojí (odletela a scroll sa nehýbe),
      // opakovaný zápis tej istej hodnoty by ju držal v prekresľovaní zadarmo.
      if (el && tf !== lastTf) { el.style.transform = tf; lastTf = tf; }
      if (!scrollingRef.current && ++frame % 4 === 0) tickNotes();
      // ⚠️ ISKRY IDÚ Z TEJ ISTEJ SLUČKY, ktorá otáča guľu — vlastný
      // `requestAnimationFrame` by si s ňou konkuroval o ten istý snímok.
      // A počas scrollu sa nekreslia z rovnakého dôvodu, pre ktorý vtedy stojí
      // aj guľa: len čo sa prestane prekresľovať, prehliadač s prvou obrazovkou
      // narába ako s hotovým obrázkom a scroll je zadarmo. Portál je vtedy aj
      // tak zhasnutý (`HERO_OUT`), takže sa nemá čo stratiť.
      if (!scrollingRef.current && !PORTAL_REDUCE_MOTION) sparksRef.current?.frame(Math.min(0.05, dt / 1000));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [open, paused, tiles, picked]);

  /** Kóta v poslednej pol sekunde života — nech nezmizne skokom. */
  const noteGoing = (n: Note) => n.leftAt !== null && performance.now() - n.leftAt > NOTE_TTL - 500;

  // MRIEŽKA KÓT sa prepočíta pri otvorení a pri každej zmene okna. Kóty si držia
  // len číslo priehradky, takže po zmene okna sadnú na nové miesta samy — uložená
  // súradnica by po zmenšení okna zostala visieť pod spodným barom steny.
  // Keď sa okno zmenší tak, že sa mriežka nezmestí, živé kóty zhasnú: bublinka
  // pod navom je horšia než žiadna.
  useEffect(() => {
    const prepocitaj = () => {
      const g = kotovaMriezka();
      mriezkaRef.current = g;
      setMriezka(g);
      if (!g) setNotes([]);
    };
    prepocitaj();
    window.addEventListener('resize', prepocitaj);
    return () => window.removeEventListener('resize', prepocitaj);
  }, []);

  /* ── ŠÍRKA GULE JE V PIXELOCH, TAKŽE SA MUSÍ DOPOČÍTAŤ ─────────────────────
   *  Guľa je 3D útvar poskladaný z translateZ(R) v pixeloch — jej rozmer sa
   *  s oknom nemení, mení sa iba mierka scény. Kým bola mierka pevná (0,62),
   *  guľa mala na 390 px obrazovke 410 px a hrana okna jej krájala 16 dlaždíc
   *  (Matej 28. 8. 2026: „posvieť si na chýbajúce dlaždice na mobile").
   *  --ball-fit je pomer, pri ktorom sa guľa akurát zmestí; CSS z neho a zo
   *  stropu 0,57 vyberie menšie číslo, takže na širšom telefóne sa už
   *  nezväčšuje a na užšom sa zmestí.
   *  ⚠️ BALL_SPAN nie je 2R. Krajné dlaždice ležia NA povrchu a sú natočené,
   *  takže guľa je v priemete širšia než 640 px — 662 px je odmerané
   *  (410,5 px pri mierke 0,62 aj 377,1 px pri 0,57 dávajú to isté číslo).
   *  ⚠️ Zapisuje sa na <html>, nie na .planet-root: rovnaké číslo potrebuje aj
   *  hero, ktoré vo výške filmu žije v inej vetve DOM-u.
   *  ⚠️ Premennú číta LEN mobilné pravidlo; nad 760 px zostáva mierka 1. */
  useEffect(() => {
    const BALL_SPAN = 662;
    const MARGIN = 12;
    const nastav = () => {
      document.documentElement.style.setProperty(
        '--ball-fit',
        String(Math.max(0.3, (window.innerWidth - MARGIN) / BALL_SPAN)),
      );
    };
    nastav();
    window.addEventListener('resize', nastav);
    return () => {
      window.removeEventListener('resize', nastav);
      document.documentElement.style.removeProperty('--ball-fit');
    };
  }, []);

  // Trieda na <body> dvíha nav steny nad overlay planéty (CSS nižšie).
  // Vešia sa tu, lebo tie prvky vlastní stena — planéta ich len prepustí dopredu.
  useEffect(() => {
    document.body.classList.toggle('planet-open', open);
    return () => document.body.classList.remove('planet-open');
  }, [open]);

  // ESC zatvára — rovnaký únik ako z každého overlayu v appke. Keď je otvorený
  // detail psa, prvé ESC zavrie JEHO: inak by človek jedným klávesom zhodil celú
  // planétu a nevedel by, prečo zmizla.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (picked) setPicked(null);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, picked]);

  // Zmena počtu psov prekreslí dlaždice → kóty aj zvýraznenie visia na prvkoch,
  // ktoré už nie sú v dokumente. Zavretá planéta si nedrží nič.
  useEffect(() => {
    setHot(null);
    setNotes([]);
  }, [target]);
  useEffect(() => {
    if (open) return;
    setHot(null);
    setNotes([]);
    setPicked(null);
  }, [open]);

  const onDown = (e: React.PointerEvent) => {
    const tile = (e.target as HTMLElement).closest('.planet-tile') as HTMLElement | null;
    dragRef.current = { x: e.clientX, y: e.clientY, dist: 0, tile };
    autoRef.current = false;
    // Zámok na GUĽU, nie na dlaždicu: dlaždica má ~30 px a otáčanie by skončilo,
    // len čo z nej prst zíde.
    ballRef.current?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) {
      // NABEHNUTIE MYŠOU. Dotyk sa sem nedostane zámerne — prst hover nemá a
      // meno prilepené po ťuknutí vyzerá ako zaseknutá appka, nie ako popis.
      // ⚠️ Guľa sa NEZASTAVUJE (Matej 25. 8.). Nová fotka pod kurzorom = nová
      // kóta; tá, z ktorej si zišiel, dobehne svoje tri sekundy sama.
      if (e.pointerType !== 'mouse') return;
      ptRef.current = { x: e.clientX, y: e.clientY };
      tickNotes();
      return;
    }
    d.dist += Math.hypot(e.clientX - d.x, e.clientY - d.y);
    const s = spinRef.current;
    // Zvislé otáčanie sa zaráža pri ±62°: za tým sa guľa prevráti a rady
    // dlaždíc sa začnú prekrývať naplocho.
    s.x = Math.max(-62, Math.min(62, s.x - (e.clientY - d.y) * 0.25));
    s.y += (e.clientX - d.x) * 0.25;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    autoRef.current = true;
    if (!d) return;
    // ŤUK vs. ŤAH — prah 12 px prevzatý zo steny (`GodsGridLab`, onTouchEnd).
    // Druhé číslo pre to isté gesto by znamenalo, že sa appka na dvoch
    // povrchoch správa inak bez dôvodu.
    if (d.dist >= 12) return;
    const dog = dogAt(d.tile);
    // Ťuk mimo dlaždice = zavretie. Panel tak nemá jediný únikový bod.
    setPicked(dog);
    if (!dog) setHot(null);
  };

  /* ── PREPÍNANIE PSA ŠÍPKAMI (mobil) ────────────────────────────────────────
   *  Chodí sa po `dogs`, nie po `tiles`: dlaždíc je 194 a psov býva menej,
   *  takže po dlaždiciach by sa ten istý pes vracal niekoľkokrát za sebou.
   *  Poradie v `dogs` je poradie svorky, teda „ďalší" znamená ďalšie číslo,
   *  nie náhodný sused na guli.
   *  ⚠️ Hľadá sa identitou prvku, nie podľa `n`: výplňové karty (Hektorova
   *  dvojička na južnom póle) môžu mať `n` prázdne a `findIndex` by na nich
   *  vrátil prvého takého psa v zozname, nie toho vybraného. */
  const stepPicked = (dir: 1 | -1) => {
    if (!picked || dogs.length < 2) return;
    const i = dogs.indexOf(picked);
    if (i < 0) return;
    setPicked(dogs[(i + dir + dogs.length) % dogs.length]);
  };

  /**
   * Obdĺžnik CTA v súradniciach obrazovky — diera, ktorou vodiace čiary kót
   * NEPREJDÚ (Matej 27. 8. 2026: *„kótové čiary a guličky... musia ísť popod
   * a nenarušovať CTA"*).
   * ⚠️ Číta sa pri KAŽDOM vykreslení kót, nie raz: portál mení šírku s oknom
   * (`clamp`) a celá scéna má vlastnú mierku, takže zapamätaný obdĺžnik by sa
   * s ním pri prvej zmene okna rozišiel a čiara by zase preťala lem.
   * ⚠️ Presah lemu sa BERIE Z CSS (`--ph-rimin` + `--ph-rimw`), neopisuje sa —
   * inak by hrúbka lemu a diera pre čiary boli dve nezávislé čísla.
   * `offsetWidth` je nezmenšená šírka podľa rozloženia, `rect.width` už
   * zmenšená — ich podiel je mierka scény.
   */
  const ctaMask = (() => {
    const el = portalRef.current;
    if (!el || !notes.length) return null;
    const r = el.getBoundingClientRect();
    if (!r.width) return null;
    const cs = getComputedStyle(el);
    const sc = r.width / (el.offsetWidth || r.width);
    const px = (v: string) => parseFloat(cs.getPropertyValue(v)) || 0;
    const out = (px('--ph-rimin') + px('--ph-rimw')) * sc;
    const w = r.width + out * 2;
    const h = r.height + out * 2;
    return { x: r.x - out, y: r.y - out, w, h, r: w * ((px('--ph-r') || 24) / 100) };
  })();

  return (
    <div
      className={`planet-root v-side d-${design} b-${bg}${open ? ' open' : ''}${picked ? ' pop' : ''}`}
      // KLIK HOCIKDE MIMO KARTY JU ZAVRIE (Matej 25. 8.: „pri otvorenom detaile
      // psa klik hocikde mimo zavrie kartu, nie len krížik").
      // ⚠️ Guľa je z toho VYNATÁ zámerne — má vlastné rozlíšenie ťuk vs. ťah
      // (prah 12 px v `onUp`). Bez tejto výnimky by sa karta zavrela hneď pri
      // začiatku otáčania, teda pri geste, ktoré ju zavrieť nemá.
      // Kalkulačka sem klik nepustí vôbec: leží vo vlastnom overlayi nad koreňom.
      onClick={(e) => {
        if (!picked) return;
        const el = e.target as HTMLElement;
        if (el.closest('.pp-panel') || el.closest('.planet-ball') || el.closest('.pnote')) return;
        setPicked(null);
      }}
      aria-hidden={!open}
    >
      <style>{`
        .planet-root {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 420ms ease;
          background:
            radial-gradient(120% 100% at 50% 42%, #FDF8EC 0%, #F6EAD0 46%, #EBD9B4 100%);
          overflow: hidden;
        }
        .planet-root.open { opacity: 1; pointer-events: auto; }

        /* Scéna: guľa sa pri otvorení „odďaľuje" — nabehne zväčšená a sadne na 1.
           To je celý vtip prechodu zo steny (stena = maximálne priblíženie). */
        .planet-stage {
          position: relative;
          width: ${R * 2}px;
          height: ${R * 2}px;
          perspective: 1400px;
          transform: scale(1.75);
          opacity: 0;
          transition: transform 620ms cubic-bezier(.22,.9,.28,1), opacity 420ms ease;
          touch-action: none;
        }
        /* ⚠️ --op-sc je NÁSOBIČ, nie hotová mierka. Film (/onepage) ním guľu
           posiela do diaľky; keby si zapisoval celý transform priamo na prvok,
           prebil by KAŽDÉ pravidlo nižšie — vrátane toho, ktoré guľu odsúva
           pri otvorení karty psa. Matej 26. 8. 2026: *„pri kliku na psa
           planétu neodsunie dolava… prečo?"* Presne preto.
           Mimo filmu je nenastavená a fallback 1 nechá pôvodné hodnoty. */
        .planet-root.open .planet-stage { transform: scale(var(--op-sc, 1)); opacity: 1; }

        /* Šírka panela detailu má JEDEN zdroj — guľa sa podľa nej uhýba, takže
           dve nezávislé čísla by sa pri prvej zmene rozišli a panel by buď
           prekryl psov, alebo nechal medzeru. */
        .planet-root { --pw: clamp(380px, 43vw, 640px); }

        .planet-ball {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          cursor: grab;
        }
        .planet-ball:active { cursor: grabbing; }

        /* Dlaždica psa. backface-visibility skryje zadnú pologuľu — bez toho by
           sa fotky zozadu prekresľovali cez predné a guľa by bola kaša. */
        .planet-tile {
          position: absolute;
          left: 50%;
          top: 50%;
          /* Veľkosť je dynamická (mení sa s počtom psov) → ide cez premennú
             nastavenú na guli, nie cez konštantu v tomto reťazci. */
          width: var(--tile);
          height: var(--tile);
          margin: calc(var(--tile) / -2) 0 0 calc(var(--tile) / -2);
          border-radius: calc(var(--tile) * 0.17);
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border: 1.5px solid rgba(201,154,63,0.85);
          box-shadow: 0 6px 16px -6px rgba(70,46,12,0.55);
          background: #EADCBB;
          /* Poloha na guli je v premennej, nie priamo v transform — zvýraznenie
             tak vie pridať scale bez toho, aby React prekresľoval dlaždice. */
          transform: var(--t);
          transition: box-shadow 160ms ease, border-color 160ms ease;
        }
        /* Dlaždica pod kurzorom: vystúpi a orámuje sa. Rovnaká úloha ako bledý
           závoj na stene — povedať „táto, nie tá vedľa". */
        .planet-tile.is-hot {
          transform: var(--t) scale(1.18);
          border-color: #F4DC97;
          box-shadow: 0 0 0 2px rgba(244,220,151,0.55), 0 10px 26px -8px rgba(70,46,12,0.8);
          z-index: 4;
        }
        .planet-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        /* Svetlo: guľa musí mať objem, inak je to plochý koláž-kruh.
           Vrstva NAD dlaždicami — stmaví okraje, presvetlí ľavý horný kvadrant. */
        .planet-shade {
          position: absolute;
          inset: -2%;
          border-radius: 50%;
          pointer-events: none;
          background:
            radial-gradient(65% 65% at 32% 26%, rgba(255,248,228,0.42), transparent 58%),
            radial-gradient(100% 100% at 50% 50%, transparent 52%, rgba(74,48,10,0.42) 100%);
        }

        /* Stred: logo + CTA. Nie je „vnútri" gule — leží pred ňou, aby ostalo
           čitateľné pri každom otočení. */
        .planet-hero {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: min(1320px, 94vw);
          text-align: center;
          pointer-events: none;
        }
        /* ⚠️ ŽIADNA HMLA POD TEXTOM. Tu bol mliečny radial rgba(253,248,236,0.92)
           s dosahom 110×150 px, ktorý mal udržať logo čitateľné nad otáčajúcimi
           sa fotkami — Matej 26. 8.: *„prečo je logo aj CTA ako keby zahmlené
           a nevýrazné?"*. Mal pravdu: na papyruse je to fľak, nie podklad.
           Čitateľnosť teraz drží HALO OKOLO PÍSMEN (text-shadow), ktoré kopíruje
           tvar textu namiesto toho, aby prekrylo kus gule. */
        /* ⚠️ JEDEN RIADOK (Matej 26. 8.: „dajme to do jedného riadku a tagline
           druhý riadok"). Veľkosť preto riadi ŠÍRKA OKNA, nie pevný strop —
           pri nowrap by pevný rem na úzkom okne vystrčil text von z obrazovky.
           Inkoust je plná farba, nie 0.90 alfa: cez fotky gule sa každé percento
           priehľadnosti prejaví ako vyblednutie. */
        .ph-h1 {
          margin: 0;
          white-space: nowrap;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          /* +10 % (Matej 27. 8. 2026: „zvači motto o 10% aj tagline - o 10%“ —
             a po prvom pokuse: *„ja som myslel ale na globe a nie na wall“*).
             Všetky tri body clampu naraz, inak by sa zväčšenie prejavilo len
             v jednom pásme šírok a pri inej šírke okna by zmizlo. */
          font-size: clamp(1.364rem, 5.5vw, 5.28rem);
          line-height: 1.06;
          letter-spacing: 0.005em;
          text-transform: uppercase;
          color: #23150a;
          /* ⚠️ Dosah AJ HUSTOTA. Vrstvy už boli na alfe 1, takže „väčšie halo"
             (Matej 26. 8.) sa dalo spraviť jedine širším rozostrením — a to je
             presne to, čo prestalo stačiť: rozostrené svetlo je pri veľkom
             polomere riedke a fotky gule cezeň presvitajú.
             ⚠️ Preto sa 27. 8. (Matej: *„urob za písmenami výraznejšie halo nech
             sa to lepšie číta"*) pridali BLÍZKE vrstvy, nie ďalšie ďaleké.
             Vrstvy text-shadow sa SČÍTAVAJÚ: dve rozostrenia na 10 a 22 px
             s alfou 1 dajú okolo písmen takmer nepriehľadné jadro, ktoré ďaleké
             vrstvy nikdy nedosiahnu, nech sú akokoľvek široké. Ďaleké ostávajú
             na to, aby halo nemalo viditeľnú hranu. */
          /* ⚠️ 27. 8. druhé pritvrdenie (Matej: *„pridaj ešte halo nech je to
             viac viditeľné"*). Pribudli ďalšie BLÍZKE vrstvy a alfa 1 sa
             posunula až na 96 px — jadro je tým prakticky nepriehľadné. */
          text-shadow:
            0 0 6px rgba(253,248,236,1),
            0 0 14px rgba(253,248,236,1),
            0 0 28px rgba(253,248,236,1),
            0 0 56px rgba(253,248,236,1),
            0 0 96px rgba(253,248,236,1),
            0 0 160px rgba(253,248,236,0.98),
            0 0 240px rgba(253,248,236,0.85);
        }
        /* ⚠️ background shorthand resetuje background-clip — pri gradientovom
           texte sa obe vlastnosti píšu spolu, inak z písmen vznikne plná plocha. */
        /* ⚠️ ŽIADNY ZLATÝ GRADIENT DO PÍSMEN. LAB.goldText má strednú zarážku
           #D8A93F — svetlejšiu než guľa pod textom, takže slovo v strede zmizne.
           Nad fotkami drží jedine plná tmavá zlatá. Gradient si nechaj na povrchy,
           kde je pod textom istá tmavá plocha. */
        /* Riadok nadpisu = blok, ktorý sa NESMIE zalomiť. Toto je jediná
           poistka proti tretiemu riadku — veľkosť písma ju len dopĺňa. */
        .ph-h1 .ph-l { display: block; white-space: nowrap; }
        /* ⚠️ .g, nie „každý span": riadky sú tiež spany a zozlatli by celé. */
        /* 🔶 ODCHÝLKA OD BRAND MANUÁLU, VEDOMÁ (Matej 27. 8. 2026: *„v hero
           nadpise skúsme dať dog a god decoratívom a hrubším"*). Brand v3.2
           vyhradzuje Cinzel Decorative pre MENÁ PSOV na oficiálnych povrchoch
           (DOG ID, certifikát, share karta, GodsGrid, PackTree). Tu ho nesú dve
           slová v nadpise, teda sa signál „toto je meno psa" riedi. Povrch je
           zatiaľ LAB, takže je to vratné jedným riadkom.
           ⚠️ Váha 900 — Cinzel Decorative je načítaný LEN v 700 a 900, čokoľvek
           iné by prehliadač dopočítal falošne. */
        .ph-h1 .g {
          color: #6E4A12;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 900;
          /* ⚠️ O 50 % SILNEJŠIE HALO NEŽ ZVYŠOK NADPISU (Matej 27. 8. 2026:
             *„pridaj o 50% halo viac pri slove dog a god, aby sme to
             zvýraznili"*). Každý polomer je 1,5× oproti .ph-h1 a jadro s alfou 1
             siaha 144 px namiesto 96 — teda +50 % v dosahu aj v hustote.
             ⚠️ PÍŠE SA CELÝ ZOZNAM, NIE PRÍDAVOK. text-shadow sa dedí, ale
             nesčítava: deklarácia na .g nahradí zdedenú, takže vynechať vrstvu
             znamená ju zmazať.
             ⚠️ Tieň sa kreslí za písmenami TOHTO prvku, ale prekrýva glyfy
             susedov vykreslené skôr (Your, IS). Preto sú blízke vrstvy len
             1,5× a nie viac — nad tým začne zlaté slovo vybieľovať čierne
             písmená vedľa seba. */
          /* ⚠️ BIELE HALO, NIE ŽLTÉ (Matej 27. 8. 2026: *„chcem biele halo a
             žiaru nie žltú, aby vyniklo to zlaté písmo, žiara pod nie cez"*).
             Zlatý zážeh z predchádzajúceho pokusu ležal PRI písmenách a farbil
             im okraje — zlato na zlate, takže písmo strácalo hranu namiesto
             toho, aby vyniklo. */
          text-shadow:
            0 0 9px rgba(255,255,255,1),
            0 0 21px rgba(255,255,255,1),
            0 0 42px rgba(255,255,255,0.98),
            0 0 84px rgba(253,248,236,0.9),
            0 0 150px rgba(253,248,236,0.7);
        }
        /* ── ŽIARA POD SLOVOM, NIE CEZ NEHO ──────────────────────────────────
           🔴 TOTO NIE JE text-shadow, A JE TO CELÝ ROZDIEL. Tieň textu sa
           kreslí za vlastnými glyfmi, ale PRES glyfy susedov vykreslené skôr —
           preto pôsobil „cez". Táto vrstva je samostatný prvok so záporným
           z-indexom, teda sa vykreslí PRED celým obsahom hera: leží pod
           písmenami DOG/GOD aj pod tými vedľa a ani jedno nezafarbí.
           ⚠️ Prečo je čisto biela a nie papyrusová: základné halo nadpisu je
           krémové (253,248,236). Pri čisto bielej sa mení ODTIEŇ, nie len jas —
           a to je jediné, čo je na svetlom podklade vidieť (rozšíriť krémovú
           krémovou nezaberá, odmerané: rozdiel 29 z 765 na pixel).
           ⚠️ Rozmery v em — pool musí rásť so slovom, nie s oknom. */
        .ph-h1 .g {
          position: relative;
        }
        .ph-h1 .g::before {
          content: '';
          position: absolute;
          left: -0.44em; right: -0.44em;
          top: -0.60em; bottom: -0.52em;
          z-index: -1;
          pointer-events: none;
          border-radius: 50%;
          background: radial-gradient(closest-side,
            rgba(255,255,255,0.98) 0%,
            rgba(255,255,255,0.93) 36%,
            rgba(255,255,255,0.64) 58%,
            rgba(255,254,250,0.28) 76%,
            rgba(255,254,250,0) 92%);
        }
        .planet-hero .ph-lead {
          margin: 0;
          /* Nad žiarou portálu. Žiara sa rozprestiera cez celé pole iskier,
             teda aj pod tento riadok — a keďže portál je POZICOVANÝ a tagline
             nie, portál by ho inak prekryl a slovo „missing" by vybledlo.
             Iskry tak lietajú ZA písmom, čo je aj tak čitateľnejšie. */
          position: relative;
          z-index: 1;
          /* Druhý riadok bloku — takisto bez zalomenia, inak by z dvojriadku
             vznikol štvorriadok a rozloženie by sa vrátilo tam, odkiaľ išlo preč.
             ⚠️ Space Grotesk je načítaný len do váhy 600 — vyššie je fake bold. */
          white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          /* +10 %, tá istá požiadavka aj to isté pravidlo — celý clamp, nie jeden bod. */
          font-size: clamp(0.682rem, 1.815vw, 1.65rem);
          line-height: 1.4;
          color: ${LAB.ink};
          /* To isté zhustenie ako pri nadpise — tagline stojí nad tými istými
             fotkami a je o polovicu menší, takže riedke halo tu chýba ešte viac. */
          text-shadow:
            0 0 5px rgba(253,248,236,1),
            0 0 12px rgba(253,248,236,1),
            0 0 26px rgba(253,248,236,1),
            0 0 52px rgba(253,248,236,1),
            0 0 92px rgba(253,248,236,1),
            0 0 150px rgba(253,248,236,0.9);
        }

        /* ── PORTÁL = CTA ────────────────────────────────────────────────────
           Tvar aj iskry žijú v components/gods/dogPortal.ts — TÚ ISTÚ dlaždicu
           kreslí aj stena (GodsGridLab), ktorá je vanilla DOM. Dve kópie by sa
           rozišli pri prvej úprave, preto je tu len vloženie. */
        ${PORTAL_CSS}
        .planet-hero .join-btn { pointer-events: auto; }

        /* ── TELEFÓN: NADPIS RASTIE ─────────────────────────────────────────
           Pôvodne tu stálo, že „jeden riadok ustupuje veľkosti" — pri 390 px by
           jednoriadkový nadpis mal ~19 px, teda opak toho, že má byť výrazný.
           Od 27. 8. 2026 je nadpis dvojriadkový už aj na PC (tvrdý zlom v JSX),
           takže tento blok rieši už len VEĽKOSŤ.
           ⚠️ +50 % (Matej 27. 8.: *„a na mobile to zvačši o 50%"*) — násobia sa
           všetky tri čísla clampu, nie len strop: na telefóne vyhráva stredný vw
           člen, takže zmena samotného stropu by nebola vidieť.
           ⚠️ VÝSLEDOK JE +44 %, NIE +50 %, A JE TO STROP DANÝ ŠÍRKOU TELEFÓNU.
           Dlhší riadok „YOUR DOG IS" má v Cinzeli 700 šírku 7,17 em, takže pri
           1,5× (12,9vw) potrebuje 92,5vw z 96vw, ktoré má k dispozícii — a to
           je menej než rozdiel medzi tým, ako písmo vysadzuje prehliadač na
           stole a na telefóne. Presne tam vznikol Matejov tretí riadok.
           12,4vw necháva ~8vw vzduchu; nad ním už riadok nemá kam rásť bez
           toho, aby vytiekol z obrazovky (zalomiť sa nemôže, je nowrap).
           ⚠️ white-space na .ph-h1 tu už nič nerieši — o zalomení rozhodujú
           riadkové bloky .ph-l, ktoré majú nowrap samy. */
        /* ── 🔴 NA MOBILE SA PÍŠU VIDITEĽNÉ VEĽKOSTI, DELENÉ MIERKOU GULE ────
           .planet-hero LEŽÍ VNÚTRI .planet-stage, ktorá je na telefóne zmenšená
           na --ball-k. Číslo napísané v CSS teda NIE JE to, čo človek vidí:
           pri mierke 0,57 má nadpis so 48 px písmom na obrazovke 27 px. Kým sa
           tu písali „layoutové" čísla, každá zmena mierky ticho prepísala aj
           veľkosť písma a naopak (Matej 28. 8. 2026 chcel naraz „NADPIS o 15 %,
           CTA blok o 25 %, tagline o 10 %" A menšiu guľu — dva protichodné
           pohyby na jednom prvku).
           Preto sa clampy píšu v tom, čo je vidno, a delia sa mierkou. Číslo
           v zátvorke je odteraz to, čo si odmeriaš na obrazovke.
           ⚠️ Fallback 0,57 nie je ozdoba — pred prvým behom efektu (--ball-fit)
           by inak delenie prázdnou premennou celé pravidlo zahodilo.
           ⚠️ BREAKPOINT ZJEDNOTENÝ NA 760 px. Text mal 720 a mierka gule 760,
           takže v pásme 721–760 px stálo desktopové písmo v zmenšenej guli —
           nadpis tam mal 25 viditeľných px. Teraz sa oboje prepína naraz. */
        @media (max-width: 760px) {
          /* Menšie z dvoch: strop, ktorý si Matej odsúhlasil, a mierka, pri
             ktorej sa guľa ešte zmestí do okna (viď --ball-fit v efekte). */
          .planet-root { --ball-k: min(0.57, var(--ball-fit, 0.57)); }

          .ph-h1 {
            white-space: normal;
            /* VIDITEĽNE clamp(1.711rem, 8.841vw, 3.103rem) — pôvodok × 1,15 */
            font-size: calc(clamp(1.711rem, 8.841vw, 3.103rem) / var(--ball-k, 0.57));
            line-height: 1.04;
          }
          .planet-hero .ph-lead {
            white-space: normal;
            max-width: 24ch;
            /* VIDITEĽNE clamp(0.627rem, 2.523vw, 0.75rem) — pôvodok × 1,10 */
            font-size: calc(clamp(0.627rem, 2.523vw, 0.75rem) / var(--ball-k, 0.57));
          }
          /* ⚠️ ŠÍRKA MUSÍ RÁSŤ S PÍSMOM, INAK SA REZERVA ZJE. Nadpis je nowrap,
             takže jediné, čo ho drží v obrazovke, je rezerva medzi šírkou riadka
             a šírkou tejto priehradky (~7 %). Preto je aj tu VIDITEĽNÉ číslo
             delené tou istou mierkou — pri pevnej šírke a väčšom písme by riadok
             priehradku prerástol a vytiekol.
             69,9vw = pôvodných 98vw (layout) × 0,62 (vtedajšia mierka) × 1,2509.
             (Historicky: 98vw, nie 92vw, lebo Cinzel Decorative pri DOG a GOD
             je o ~2,8 % širšia než Cinzel a pri 96vw zožrala tretinu rezervy.) */
          .planet-hero {
            gap: calc(10px / var(--ball-k, 0.57));
            width: calc(69.9vw / var(--ball-k, 0.57));
          }
        }

        /* ── KÓTY ────────────────────────────────────────────────────────────
           Bublinka odsadená od gule, spojená s fotkou tenkou vodiacou čiarou.
           Na dlaždici visieť nemôže (je otočená v priestore) — polohuje sa
           v rovine obrazovky z jej getBoundingClientRect. */
        .pn-leads {
          position: fixed;
          inset: 0;
          z-index: 6;
          pointer-events: none;
          overflow: visible;
        }
        .pn-leads polyline {
          fill: none;
          stroke: rgba(140,96,20,0.55);
          stroke-width: 1;
        }
        .pn-leads circle {
          fill: #8C6014;
          stroke: rgba(253,248,236,0.9);
          stroke-width: 1.5;
        }
        /* KÓTA VYSTRELÍ (Matej 25. 8.) — čiara sa vykreslí od psa k bublinke. */
        .pn-leads polyline {
          stroke-dasharray: 1;
          animation: pnShoot 300ms cubic-bezier(.3,.9,.35,1) both;
        }
        .pn-leads circle { animation: pnIn 200ms ease both; }
        .pn-leads g.is-going { opacity: 0; transition: opacity 480ms ease; }
        @keyframes pnShoot {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }

        /* Rozmer aj poloha idú z mriežky (kotovaMriezka) cez premenné —
           v CSS nesmie byť druhé číslo, inak sa mu bublinka a priehradka rozídu. */
        .pnote {
          position: fixed;
          z-index: 7;
          /* Bublinka je cieľ kliku, takže myš CHYTÁ. ⚠️ Dev pult leží pod ňou —
             kým kóta žije, pult sa cez ňu preklikať nedá. Je to dev pomôcka,
             ktorá v produkcii nebude, a kóta zmizne do troch sekúnd. */
          pointer-events: auto;
          cursor: pointer;
          box-sizing: border-box;
          width: var(--pnw);
          height: var(--pnh);
          /* Bublinka je vždy vycentrovaná na strede svojej priehradky. Strana
             určuje LEN stĺpec — ten prichádza hotový v left, nie posunom. */
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 13px;
          border-radius: 16px;
          background: linear-gradient(135deg, #FDF8EC 0%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow: 0 14px 30px -12px rgba(70,46,12,0.6);
          /* Bublinka nabehne AŽ keď kóta dorazí — inak by vyskočila skôr než
             čiara, ktorá ju má priniesť. */
          animation: pnIn 240ms cubic-bezier(.22,.9,.28,1) 240ms both;
        }
        /* Zdvihnutie pri nabehnutí — to jediné povie, že sa dá kliknúť.
           translateY(-50%) musí ostať, nesie centrovanie na priehradku. */
        .pnote:hover {
          transform: translateY(-50%) scale(1.025);
          border-color: #F4DC97;
          box-shadow: 0 18px 38px -12px rgba(70,46,12,0.7);
        }
        .pnote { transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
        /* Dohasínajúca kóta sa už chytať nedá — klik do ducha otvorí kartu psa,
           ktorý na obrazovke o pol sekundy nebude. */
        .pnote.is-going { opacity: 0; pointer-events: none; transition: opacity 480ms ease; }

        @keyframes pnIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Fotka má vlastný rozmer z mriežky — nie zvyšok, čo ostane po texte. */
        .pnote-photo {
          width: var(--pnp);
          height: var(--pnp);
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid rgba(201,154,63,0.9);
          box-shadow: 0 0 16px -6px rgba(140,96,20,0.7);
        }
        .pnote-body { min-width: 0; }
        .pnote-head {
          display: flex;
          /* Bolo baseline — s pilulkou a heroglyfom v rade nemá účaru na čom
             stáť a rad sa rozsype. */
          align-items: center;
          gap: 7px;
          margin-bottom: 3px;
        }
        /* Meno psa = Cinzel Decorative (oficiálny povrch, ako na stene). */
        .pnote-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.04em;
          color: #2a1608;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        /* Poradové číslo = dáta, teda Space Grotesk. Od 27. 8. 2026 v LAPISOVEJ
           pilulke (Matej: *„ten hashtag dajme do lapisového chipu"*). Zlatý inkoust
           na lapise nie je ozdoba — lapis + zlato je pôvodná egyptská dvojica a bez
           písma je z pilulky len tmavá škvrna. Zdroj farieb: LAPIS v navGoldSkin,
           neopisuj hodnoty. */
        .pnote-n {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.58rem;
          letter-spacing: 0.06em;
          font-style: normal;
          flex-shrink: 0;
          padding: 2px 7px 3px;
          border-radius: 999px;
          color: ${LAPIS.ink};
          background: ${LAPIS.grad};
          border: 1px solid ${LAPIS.edge};
          box-shadow: ${LAPIS_CHIP_SHADOW};
          line-height: 1;
        }
        /* Heroglyf psa vedľa čísla (Matej 27. 8. 2026: *„do blokov, ktoré sa
           otvárajú po bokoch, by sme mohli pridať aj heroglyf vedľa #"*).
           ⚠️ Výška je pevná a šírka auto — heroglyfy nemajú jednotný pomer strán
           a pevná šírka by ich deformovala. brightness(0) je ten istý trik ako
           na paneli detailu (.pp-glyph): glyf príde v ľubovoľnej farbe a na
           papyruse musí byť čierny. */
        .pnote-glyph {
          height: 15px;
          width: auto;
          max-width: 40px;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter: brightness(0);
          opacity: 0.85;
        }
        /* Odkaz majiteľa. Počet riadkov je z mriežky — bublinka má výšku svojej
           priehradky a text, ktorý by z nej vytiekol, by ju roztrhol. */
        .pnote-msg {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: 0.66rem;
          line-height: 1.45;
          font-style: italic;
          color: #7a5a2a;
          display: -webkit-box;
          -webkit-line-clamp: var(--pnl, 3);
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* MOBIL kóty nemá — vznikajú výhradne z pohybu myši a vedľa gule tam
           nie je miesto. Toto je len poistka, keby sa niekam prepašovali. */
        @media (max-width: 760px) {
          .pnote, .pn-leads { display: none; }
        }

        /* ── DETAIL PSA — SPOLOČNÉ ─────────────────────────────────────────
           Rozloženie je pre obe podoby to isté; líši sa iba materiál. */
        .pp-panel {
          z-index: 9;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          pointer-events: none;
        }
        .planet-root.pop .pp-panel { opacity: 1; pointer-events: auto; }

        .pp-photo {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid rgba(201,154,63,0.85);
          box-shadow: 0 6px 18px -6px rgba(70,46,12,0.5);
        }
        .pp-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.01em;
          text-align: center;
          line-height: 1.2;
        }
        .pp-rule {
          height: 1px;
          width: 100%;
          background: rgba(201,154,63,0.35);
          flex-shrink: 0;
        }
        /* HEROGLYF NA SVETLOM JE ČIERNY, nie zlatý so žiarou. Ten istý recept ako
           .theme-light .dog-heroglyph na bledej stene: brightness(0) drží alfa
           kanál, takže z bieleho glyfu spraví čistý atrament. Zlatá žiara je pre
           tmavé pozadie a tu nemá kde svietiť. */
        .pp-glyph {
          width: 62%;
          max-width: 190px;
          height: auto;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter: brightness(0) drop-shadow(0 2px 8px rgba(80,55,15,0.18));
        }
        .pp-msg {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: 0.75rem;
          color: rgba(26,26,26,0.7);
          text-align: center;
          line-height: 1.6;
          font-style: italic;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Odkaz na stránku psa. Nie .btn-gold — ten je hlavné CTA a na tomto
           paneli by prekričal meno psa. */
        .pp-link {
          display: inline-block;
          flex-shrink: 0;
          margin-top: 2px;
          padding: 7px 18px;
          font-family: 'Cinzel', serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6E4E18;
          background: rgba(255,250,236,0.45);
          border: 1px solid rgba(201,154,63,0.65);
          border-radius: 8px;
          text-decoration: none;
          transition: box-shadow 200ms ease, background 200ms ease;
        }
        .pp-link:hover { background: rgba(255,250,236,0.85); box-shadow: 0 0 12px rgba(201,154,63,0.4); }
        /* ── ŠÍPKY PREPÍNANIA (mobil) ────────────────────────────────────────
           Visia cez hranu karty, zvisle na jej strede. Vzhľad je odliatok pečate
           s poradovým číslom (.pp-seal) — tá istá zlatá pilulka s krémovým lemom,
           aby to na karte bola jedna rodina, nie druhý jazyk tlačidiel.
           ⚠️ Základ je display:none — zapína ich až mobilný blok na konci súboru.
           ⚠️ Karta nesmie mať overflow, inak ich odreže (viď tam). */
        .pp-nav {
          display: none;
          position: absolute;
          top: 50%;
          margin-top: -17px;
          width: 34px; height: 34px;
          align-items: center; justify-content: center;
          padding: 0;
          border-radius: 50%;
          /* LAPIS (Matej 28. 8. 2026: „zmeň posuvníky na detaile psa na lapis").
             Sedí to s pravidlom z navGoldSkin.ts — zlato je konštrukcia („kde
             som"), lapis je akcia („čo urobím"), a šípka je jediná akcia na tejto
             karte okrem odkazu na stránku psa. Zlatý inkoust NA lapise nie je
             ozdoba: lapis + zlato je pôvodná egyptská dvojica, bez nej je z toho
             len tmavý krúžok bez príslušnosti k brandu.
             ⚠️ Predtým bola šípka odliatok zlatej pečate .pp-seal — a práve preto
             sa strácala: na papyruse boli pečať, pilulka dní aj šípka tá istá
             zlatá, teda tri rovnako dôležité veci, z ktorých ani jedna neviedla. */
          background: ${LAPIS.grad};
          border: 1.5px solid ${LAPIS.edge};
          box-shadow: ${LAPIS_BTN_SHADOW};
          color: ${LAPIS.ink};
          cursor: pointer;
          z-index: 2;
        }
        .pp-nav:hover { background: ${LAPIS.gradHover}; }
        .pp-nav:active { transform: scale(0.94); }
        .pp-nav--prev { left: -13px; }
        .pp-nav--next { right: -13px; }

        /* FOTKA S PEČAŤOU. Číslo sedí na SPODNEJ HRANE fotky, vodorovne v strede —
           na centrovanej karte je stred jediná os, ktorú oko sleduje, a pečať
           vpravo dole by ju rozbila. Nosič musí byť inline-block, inak by sa
           roztiahol na šírku karty a „stred" by prestal byť stredom fotky. */
        .pp-photo-wrap {
          position: relative;
          display: inline-block;
          flex-shrink: 0;
          line-height: 0;
        }
        .pp-seal {
          position: absolute;
          left: 50%;
          bottom: -10px;
          transform: translateX(-50%);
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.86rem;
          line-height: 1.1;
          letter-spacing: 0.02em;
          color: #3d1f00;
          background: linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%);
          border: 1.5px solid #FFF8E4;
          border-radius: 999px;
          padding: 3px 12px;
          white-space: nowrap;
          box-shadow: 0 4px 12px -3px rgba(70,46,12,0.6);
        }

        /* ŽIVOT PSA — JEDEN RIADOK, prevzatý z LifeLine na /pack homepage.
           Text je VEDĽA pilulky, nie v nej: pilulka nesie výhradne číslo.
           flex-wrap je poistka pre dlhé preklady (nemčina, ukrajinčina) —
           riadok sa radšej zalomí, než by pretiekol z karty. */
        .pp-life {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 4px 8px;
        }
        .pp-life-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.62rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8C6014;
        }
        .pp-life-spark { width: 13px; height: 13px; color: #C99A3F; flex-shrink: 0; }
        /* Pilulka s dňami — LOCKED vizuál z PackTree.tsx: zvislý gradient
           #F5C73D→#E69E1A, atrament #3d1f00, Cinzel 700 BEZ verzálok, bez rámu.
           Neprekresľuj ju, prenes zmenu z PackTree. */
        .pp-days {
          padding: 4px 13px;
          border-radius: 999px;
          background: linear-gradient(180deg, #F5C73D 0%, #E69E1A 100%);
          color: #3d1f00;
          font-family: 'Cinzel', serif;
          font-size: 0.86rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          line-height: 1.1;
          white-space: nowrap;
          border: none;
          box-shadow: 0 6px 16px -6px rgba(201,154,63,0.6);
        }

        /* Karta rastie spolu s panelom — obsah sa neškáluje sám, veľkosti sú
           tu. (Podmienka :not(.d-zvitok) odtiaľto zanikla spolu so zvitkom;
           keby pribudla podoba s pevnou kresbou, výnimku si pýta ONA, nie tieto
           riadky.) */
        .planet-root .pp-panel {
          gap: 14px;
          /* Matejov náčrt bol vyšší než čo dal obsah — panel má teda vlastnú
             výšku a obsah v nej stojí na stred. Bez justify-content by sa nalepil
             hore a spodok by zíval. */
          min-height: min(600px, 68vh);
          justify-content: center;
        }
        .planet-root .pp-photo { width: 132px; height: 132px; }
        .planet-root .pp-name { font-size: 2rem; }
        .planet-root .pp-days { font-size: 1rem; padding: 5px 15px; }
        .planet-root .pp-glyph { width: 74%; max-width: 320px; }
        .planet-root .pp-msg { font-size: 0.88rem; line-height: 1.65; }
        .planet-root .pp-link { font-size: 0.68rem; padding: 9px 22px; }

        /* ── KARTY: SPOLOČNÝ TVAR ────────────────────────────────────────────
           Všetky štyri podoby sú tá istá karta z /pack (PACK_BOX.card: radius 16,
           zlatý rám 1.5 px, papyrusový jazyk zvyšku appky). Tvar sa NEROZCHÁDZA —
           tu je zapísaný RAZ a podoby menia iba materiál. Kto pridá piatu, píše
           len výplň, rám a tieň. */
        .pp-panel {
          padding: 34px 38px 36px;
          border-radius: 16px;
        }
        .pp-msg { -webkit-line-clamp: 10; }

        /* ── PODOBA A: KARTA (pôvodná — referencia) ───────────────────────────
           Tá, ktorá sa Matejovi páči tvarom a prepadla kontrastom: jej gradient
           je prakticky zhodný s pozadím planéty. Ostáva vo výbere, aby bolo
           s čím porovnávať. */
        .d-karta .pp-panel {
          color: #2a1608;
          background: linear-gradient(160deg, #FDF8EC 0%, #F7ECD3 46%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow: 0 18px 44px -16px rgba(70,46,12,0.45), inset 0 1px 0 rgba(255,253,246,0.9);
        }

        /* ── PODOBA B: SVETLÁ ─────────────────────────────────────────────────
           Karta odbočí NAHOR: takmer biela slonovina, teda svetlejšia než
           najsvetlejšie miesto steny, a zlaté halo (box-shadow s nulovým
           rozostrením) — ten istý prstenec, ktorým sa v /pack odlepuje bledý
           blok od papyrusu (Entry.tsx). Kontrast robí SVETLO, nie iný tón:
           papyrusová rodina ostáva nedotknutá. */
        .d-svetla .pp-panel {
          color: #2a1608;
          background: linear-gradient(160deg, #FFFEFA 0%, #FFF9EC 52%, #FBF0D8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow:
            0 0 0 5px rgba(201,154,63,0.16),
            0 28px 62px -18px rgba(70,46,12,0.55),
            inset 0 1px 0 #FFFFFF;
        }
        .d-svetla .pp-rule { background: rgba(201,154,63,0.45); }

        /* ── PODOBA C: PIESOK ─────────────────────────────────────────────────
           Opačný smer: karta odbočí NADOL — pripečený pieskovec tmavší než
           stena, s tmavohnedým zlatým obrysom. Atrament ostáva čierny, takže sa
           neprevracia nič okrem výplne a rámu. */
        .d-piesok .pp-panel {
          color: #2a1608;
          background: linear-gradient(160deg, #EBD5A6 0%, #E0C68E 48%, #D2B375 100%);
          border: 1.5px solid #8C6014;
          box-shadow:
            0 26px 56px -18px rgba(58,38,8,0.6),
            inset 0 1px 0 rgba(255,250,232,0.75);
        }
        .d-piesok .pp-photo { border-color: #8C6014; }
        .d-piesok .pp-rule { background: rgba(110,78,24,0.40); }
        .d-piesok .pp-msg { color: rgba(42,22,8,0.78); }
        .d-piesok .pp-link {
          background: rgba(255,250,236,0.62);
          border-color: rgba(110,78,24,0.60);
        }

        /* ── PODOBA D: PAPYRUS (jediná so ŠTRUKTÚROU) ────────────────────────
           Matej 25. 8.: „pridaj ku dizajnu detailu aj papyrus štruktúru."
           Doteraz sa podoby líšili len FARBOU výplne — plocha ostávala v každej
           hladká. Táto je prvá, ktorá má MATERIÁL: zrno + mramorovanie, presne to,
           čím sa v nave pieskovcová doska odlišuje od plochej zlatej.
           Zdroj je pack/navGoldSkin.ts (NAV_GRAIN + NAV_MOTTLE) — hodnoty sa
           NEOPISUJÚ, inak sa doska v nave a karta tu pri prvej úprave rozídu.
           ⚠️ ZRNO POTREBUJE DVE VRSTVY, nie jednu. Tmavé body idú ako vrstva
           pozadia s blend multiply, svetlé sa dokresľujú cez ::after so screen.
           Jedna vrstva s overlay je NEVIDITEĽNÁ — odskúšané pri nave.
           Preto isolation na paneli, pseudovrstva na z-index -1 a obsah na
           relative; bez isolation by záporná vrstva padla až za rám.
           ⚠️ Počet položiek v background-blend-mode MUSÍ sedieť s počtom vrstiev
           pozadia (zrno + 3 gradienty mramoru + výplň = 5). Pri nezhode prehliadač
           blend ticho zahodí a zo štruktúry ostane špinavý flek. */
        .d-papyrus .pp-panel {
          isolation: isolate;
          color: #2a1608;
          background:
            ${NAV_GRAIN} 0 0 / 180px 180px,
            ${NAV_MOTTLE},
            linear-gradient(160deg, #F7E9CD 0%, #EFDCB4 52%, #E3CA97 100%);
          background-blend-mode: multiply, normal, normal, normal, normal;
          border: 1.5px solid #B3822D;
          box-shadow:
            0 24px 54px -18px rgba(58,38,8,0.55),
            inset 0 1px 0 rgba(255,250,232,0.8);
        }
        .d-papyrus .pp-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          ${NAV_GRAIN_SCREEN_CSS}
          opacity: 0.30;
          pointer-events: none;
          z-index: -1;
        }
        /* ⚠️ Toto pravidlo je silnejšie než trieda samotného prvku, takže
           absolútne pozicovaným deťom karty prepíše position na relative a tie
           spadnú do toku ako prvá položka. Šípky (.pp-nav) sa mu vyhnú tým, že
           majú vlastnú deklaráciu position s rovnakou váhou nižšie. */
        .d-papyrus .pp-panel > * { position: relative; z-index: 1; }
        .d-papyrus .pp-panel > .pp-nav { position: absolute; }
        .d-papyrus .pp-rule { background: rgba(110,78,24,0.38); }
        .d-papyrus .pp-msg { color: rgba(42,22,8,0.78); }
        .d-papyrus .pp-photo { border-color: #B3822D; }
        .d-papyrus .pp-link {
          background: rgba(255,250,236,0.62);
          border-color: rgba(110,78,24,0.60);
        }

        /* ── PODOBA E: NOC ────────────────────────────────────────────────────
           Najväčší možný kontrast — čierna karta na bledej stene. Materiál je
           TMAVÝ PODBLOK z /pack (PACK_BOX.subblockDark), teda jediná povolená
           výnimka z papyrusového locku; siaha sa po nej za význam: karta psa je
           doklad, nie plocha na písanie.
           ⚠️ Prevracia sa CELÝ atrament vrátane HEROGLYFU. Zdrojový obrázok je
           biely: brightness(0) z neho na svetlom robí čistú čerň, na čiernej
           by ostala neviditeľná škvrna. Recept na zlatý glyf sa NEVYMÝŠĽA —
           je to ten istý reťazec filtrov ako .dog-heroglyph na tmavej stene. */
        .d-noc .pp-panel {
          color: #F6ECD4;
          background: linear-gradient(135deg, #1B1209 0%, #0C0805 100%);
          border: 1.5px solid #C99A3F;
          box-shadow:
            0 28px 64px -16px rgba(0,0,0,0.72),
            inset 0 1px 0 rgba(201,154,63,0.25);
        }
        .d-noc .pp-name { color: #F6ECD4; }
        .d-noc .pp-life-label { color: #E8D29C; }
        .d-noc .pp-rule { background: rgba(201,154,63,0.40); }
        .d-noc .pp-msg { color: rgba(246,236,212,0.72); }
        .d-noc .pp-glyph {
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.55))
            drop-shadow(0 0 32px rgba(201,154,63,0.30));
        }
        .d-noc .pp-photo { border-color: rgba(201,154,63,0.9); }
        .d-noc .pp-link {
          color: #F0DFB8;
          background: rgba(201,154,63,0.12);
          border-color: rgba(201,154,63,0.55);
        }
        .d-noc .pp-link:hover { background: rgba(201,154,63,0.26); box-shadow: 0 0 14px rgba(201,154,63,0.35); }


        /* ══ POZADIE SCÉNY ═══════════════════════════════════════════════════
           Matej 25. 8.: „vytvor prepínač aj na pozadie, lebo planéta a pozadie má
           tu istú farbu, vyskúšajme to vizuálne oddeliť."
           ⚠️ Guľa NEMÁ vlastný obrys — okraj tvoria dlaždice natočené takmer
           bokom (ragged silueta) a .planet-shade ho ešte stmaví. Oddeliť ju sa
           preto nedá rámom ani tieňom, LEN POĽOM ZA ŇOU. */

        /* ── A: BLEDÉ (pôvodné — referencia) ─────────────────────────────────
           Presne ten gradient, ktorý má guľa pod sebou dnes. Ostáva vo výbere,
           aby bolo s čím porovnávať. */
        .planet-root.b-blede {
          background:
            radial-gradient(120% 100% at 50% 42%, #FDF8EC 0%, #F6EAD0 46%, #EBD9B4 100%);
        }

        /* ── B: HĹBKA (oddelenie SVETLOM) ────────────────────────────────────
           Ten istý papyrus, ale guľa stojí v svetle a rohy sú pripečené. Svetlý
           kotúč je zámerne o niečo väčší než guľa (640 px) — keby sedel presne
           na nej, čítal by sa ako svätožiara, nie ako osvetlená plocha. */
        .planet-root.b-hlbka {
          background:
            radial-gradient(34% 52% at 50% 44%, rgba(255,253,246,0.92) 0%, rgba(253,246,229,0.42) 58%, transparent 82%),
            radial-gradient(118% 102% at 50% 44%, #EFE2C2 0%, #DFCB9E 44%, #C2A469 100%);
        }

        /* ── C: PAPYRUS (oddelenie MATERIÁLOM) ───────────────────────────────
           Stena dostane štruktúru, takže fotky prestanú plávať a začnú ležať NA
           niečom. Ten istý zdroj ako podoba karty — NAV_GRAIN + NAV_MOTTLE.
           Zrno je tu jemnejšie než na karte (dlaždica 260 px, opacity 0.5):
           na ploche celého okna by rovnaká hustota robila šum, nie papier. */
        .planet-root.b-papyrus {
          isolation: isolate;
          background:
            ${NAV_GRAIN} 0 0 / 260px 260px,
            ${NAV_MOTTLE},
            radial-gradient(120% 100% at 50% 42%, #F4E7CB 0%, #EADBB6 46%, #DCC79B 100%);
          background-blend-mode: multiply, normal, normal, normal, normal;
        }
        .planet-root.b-papyrus::before {
          content: '';
          position: absolute;
          inset: 0;
          ${NAV_GRAIN_SCREEN_CSS}
          background-size: 260px 260px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        /* ── D: NOC (oddelenie TÓNOM — najsilnejšie) ─────────────────────────
           ⚠️ Tmavé pozadie NIE JE zmena jednej vlastnosti. Stred scény je čierny
           atrament na svetlom: logo ide cez brightness(0), popisok je tmavohnedý
           a .planet-hero::before je SVETLÝ závoj, ktorý by na tmavom ostal ako
           biela škvrna. Všetko štyri sa musia prevrátiť naraz, inak to nevyzerá
           ako podoba, ale ako rozbitá stránka. */
        .planet-root.b-noc {
          background:
            radial-gradient(120% 100% at 50% 42%, #211609 0%, #150E06 48%, #0A0704 100%);
        }
        .planet-root.b-noc .planet-hero::before {
          background: radial-gradient(ellipse at center, rgba(12,8,4,0.94) 26%, transparent 70%);
        }
        .planet-root.b-noc .planet-hero img {
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.25)
            drop-shadow(0 0 18px rgba(201,154,63,0.4));
        }
        .planet-root.b-noc .planet-hero .ph-tag { color: rgba(246,236,212,0.66); }
        .planet-root.b-noc .planet-hero .ph-tag b { color: #F5C73D; }
        /* Vodiaca čiara kóty je na tmavom o triedu slabšia — bublinka ostáva
           papyrusová, takže sa mení iba niť medzi ňou a psom. */
        .planet-root.b-noc .pn-leads polyline { stroke: rgba(201,154,63,0.75); }
        .planet-root.b-noc .pn-leads circle { fill: #F5C73D; stroke: rgba(12,8,4,0.9); }

        /* ── MOŽNOSŤ A: BOK ──────────────────────────────────────────────────
           Panel príde sprava, guľa sa točí ďalej A UHNE SA MU — bez toho by
           polovica psov skončila pod panelom. */
        .v-side .pp-panel {
          position: fixed;
          top: 50%;
          right: 22px;
          /* Na PC je vedľa gule veľa voľného miesta (Matej 25. 8.: „na PC tu
             tabulu kludne zvačši priestor tam je velky", potom znova „ten detail
             ešte zvačši" s načrtnutým rámom ≈ 44 % šírky okna). Zvitok ostáva
             užší — kresba navinutých koncov sa pri šírke roztiahne. */
          width: var(--pw);
          max-height: 86vh;
          transform: translate(calc(100% + 46px), -50%);
          transition: transform 460ms cubic-bezier(.22,.9,.28,1), opacity 300ms ease;
        }
        .planet-root.pop.v-side .pp-panel { transform: translate(0, -50%); }
        /* Guľa sa uhýba PODĽA ŠÍRKY PANELA, nie o pevný počet pixelov —
           panel rastie s oknom a pevný posun by ho pri širokom okne nechal
           ležať na psoch. */
        .planet-root.open.pop.v-side .planet-stage {
          transform: translateX(calc(-1 * (var(--pw) / 2 + 40px))) scale(var(--op-sc, 1));
        }
        /* NAV STENY IDE NAD PLANÉTU (Matej 25. 8.: „namiesto toho sem prehoď
           spodný nav aj vrchné"). Bar aj horné menu sú fixované na z-index 50,
           overlay planéty má 80 — kým je otvorená, dvíhajú sa nad ňu.
           Trieda sa vešia na <body>, lebo tie prvky patria stene, nie planéte.
           ⚠️ Vlastný krížik planéty tu BOL a zanikol: tretia ikonka v bare sa pri
           otvorenej planéte mení na mozaiku, takže cesta späť je na tom istom
           mieste ako cesta tam. Druhý únikový bod v pravom hornom rohu by sa
           navyše kryl s ikonkou LOGIN. */
        body.planet-open .nav-left,
        body.planet-open .nav-login,
        body.planet-open .gods-bottom-bar { z-index: 90; }
        /* TERČ (vycentrovanie mriežky) NA GULI NEEXISTUJE (Matej 25. 8.: „centrácia
           zmizne pri tomto globe zobrazení celkom — je tam zbytočný, budú len dve
           ikonky"). Guľa sa centruje sama tým, že sa vráti do pokojnej rotácie;
           tlačidlo by ukazovalo na akciu, ktorá tu nemá čo vykonať.
           Ostáva v DOM, len sa skryje — patrí stene a tá je pod planétou živá. */
        body.planet-open .center-btn-mobile { display: none; }


        @media (max-width: 760px) {
          .planet-stage { transform: scale(1.75) translateZ(0); }
          /* ── 🔴 GUĽA SA NEZMESTILA DO OBRAZOVKY ─────────────────────────────
             Matej 28. 8. 2026: „posvieť si na chýbajúce dlaždice na mobile."
             Odmerané na 390 px okne pri pôvodnej mierke 0,62: krajné dlaždice
             ležali od −10,3 px do 400,2 px, teda guľa bola 410 px široká na
             390 px obrazovke a 16 zo 194 dlaždíc jej krájala hrana okna.
             Nechýbali — boli useknuté.
             ⚠️ Strop 0,57 sám nestačí: je to pevné číslo a guľa je pevná v px,
             takže na 360 px telefóne by krájalo znova (odskúšané: 13 dlaždíc).
             Preto min() s dopočítaným --ball-fit.
             ⚠️ --op-sc je násobič filmu, nie hotová mierka (viď hlavné pravidlo). */
          .planet-root.open .planet-stage { transform: scale(calc(var(--ball-k, 0.57) * var(--op-sc, 1))); }
          .planet-hero img { width: 104px; }

          /* CTA BLOK: −25 % (Matej 27. 8.) a teraz +25 % (Matej 28. 8. 2026:
             „CTA blok o 25 %"). Škáluje sa JEDNA premenná — lem, ikonka, popisok
             aj poznámka sú jej násobky, takže sa stiahnu s ňou a nič ďalšie sa
             neladí. VIDITEĽNE clamp(99.7px, 9.36vw, 120px).
             🔴 TRI KOLÁ ZVÄČŠOVANIA V JEDEN DEŇ (27. 8. bol portál na mobile −25 %):
             +25 % → +25 % → +40 %, spolu 2,19× oproti včerajšku. Posledné kolo je
             Matejovo *„stále sa mi zdá malý CTA blok na mobile"*, teda tretie po
             sebe idúce „ešte väčší" — preto je krok výrazný a nie ďalších 25 %.
             Referencia, ktorá tú veľkosť drží: dlaždica psa má na obrazovke 31 px,
             portál teda 3,2× dlaždicu (na PC je pomer 2,15× a tam Matej výhrady nemal).
             ⚠️ Aj tu celý clamp, nie jeden bod: pri zmene len stropu by portál
             na úzkom telefóne ostal v pôvodnej veľkosti. */
          .planet-hero .ph-portal { --ph-w: calc(clamp(99.7px, 9.36vw, 120px) / var(--ball-k, 0.57)); }

          /* ── 🔴 DETAIL PSA = STRED OBRAZOVKY, NIE ZÁSUVKA ZHORA ─────────────
             Matej 28. 8. 2026: „treba opraviť otváranie psov na mobile
             z planétky — zarovnať popup do stredu obrazovky a zmenšiť to, aby
             to celé vošlo, + vytvoriť tam šípky doprava a doľava."
             Zásuvka zhora (25. 8.: „na mobile z vrchu") mala dve chyby, ktoré sa
             ukázali až po tom, čo nad ňu prišiel horný nav: karta začínala na
             y = 0, takže jej fotku aj krížik prekryla lišta, a guľa sa jej musela
             uhýbať o 124 px dole, čím sa z filmu vysunula. Vycentrovaná karta
             nepotrebuje ani jedno.
             ⚠️ ŽIADNY overflow NA PANELI. Šípky visia cez jeho hranu (left/right
             záporné) a scrollovací kontajner by ich odrezal — preto sa výška rieši
             zmenšením obsahu nižšie, nie posúvaním. */
          .v-side .pp-panel {
            top: 50%; left: 50%; right: auto; bottom: auto;
            width: min(320px, 84vw);
            max-height: none;
            transform: translate(-50%, -50%) scale(0.92);
            transition: transform 380ms cubic-bezier(.22,.9,.28,1), opacity 260ms ease;
          }
          .planet-root.pop.v-side .pp-panel { transform: translate(-50%, -50%) scale(1); }
          /* Guľa sa NEUHÝBA — karta jej stojí na strede a cesta späť je ťuknutie
             vedľa nej (obsluha je na .planet-root, guľa je z nej vyňatá). */
          .planet-root.open.pop.v-side .planet-stage { transform: scale(calc(var(--ball-k, 0.57) * var(--op-sc, 1))); }

          /* ── 🔴 JEDNOTNÝ BLOK, DIMENZOVANÝ NA NAJDLHŠÍ TEXT ─────────────────
             Matej 28. 8. 2026: „ujasni jednotný blok na detail psa napr podľa
             hektora ktorý ma najdlhší text… zmenši písmo aj obsah ak je treba
             aby sa to zmestilo."
             Karta mala min-height: 0, takže jej výšku určoval pes — pri prepínaní
             šípkami sa pri každom ďalšom preskladala. Dnes má PEVNÚ výšku a obsah
             v nej stojí na stred (justify-content: center dedí z pravidla pre PC);
             kratší text nechá vzduch, nie iný tvar.
             ROZPOČET (odmerané na 390 px, Hektorov text 340 znakov = najdlhší):
               výplň 38 · 6 medzier 60 · fotka 92 · meno 26 · život 19 · čiara 1 ·
               heroglyf 54 · text 7 riadkov 118 · odkaz 30  = 441 px
             Pri pôvodných veľkostiach mal ten istý text 519 px, teda −15 % na obsahu.
             ⚠️ line-clamp 9 a min-height 473 sú DVE STRANY JEDNEJ HODNOTY a sú
             ZÁMERNE zosúladené: pri strope clampu (9 riadkov) meria karta 475 px,
             teda to isté, čo jej dáva min-height. Hektor tak nechá 2 riadky rezervy
             pre dlhší text a nikto nevidí ani pretečenie, ani prázdno pod odkazom.
             Kto zmení jedno číslo, prepočíta druhé (riadok = 16,8 px).
             ⚠️ Strop 80vh je poistka pre nízke okno; pri bežnom telefóne (780 px)
             je karta 473 px, teda 61 %. */
          .planet-root .pp-panel {
            min-height: min(473px, 80vh);
            gap: 10px; padding: 20px 20px 18px;
          }
          .planet-root .pp-photo { width: 92px; height: 92px; }
          .planet-root .pp-seal { font-size: 0.76rem; padding: 2px 10px; bottom: -9px; }
          .planet-root .pp-name { font-size: 1.35rem; }
          .planet-root .pp-life-label { font-size: 0.56rem; }
          .planet-root .pp-days { font-size: 0.76rem; padding: 3px 11px; }
          .planet-root .pp-glyph { width: 74%; max-width: 200px; }
          .planet-root .pp-msg { font-size: 0.7rem; line-height: 1.5; -webkit-line-clamp: 9; }
          .planet-root .pp-link { font-size: 0.58rem; padding: 7px 15px; }

          /* ── ŠÍPKY: PREPÍNANIE PSA BEZ NÁVRATU NA GUĽU ──────────────────────
             Existujú LEN na mobile, a je to úmysel, nie nedorobok: na PC stojí
             karta bokom a guľa ostáva celá klikateľná, takže ďalší pes je na
             dosah priamo. Na telefóne karta guľu prekryje, takže bez šípok by
             cesta k ďalšiemu psovi viedla vždy cez zavretie karty. */
          .pp-nav { display: inline-flex; }
        }

        /* ── VÝZVA PRICHÁDZA ZA GUĽOU (Matej 3. 9. 2026) ───────────────────
           Nábeh nesú DETI .planet-hero, nie ona sama — dôvod je pri stave
           heroIn v tomto súbore (film jej zapisuje inline opacity, ktorá by
           pravidlo na ňu prebila).
           Rozostupy čítajú vetu v poradí, v akom má znieť: guľa → *tvoj pes je
           tu boh* → *a stále nám chýba jeho tvár* → dlaždica, kam ho pridať.
           ⚠️ Žiadny transform — pod portálom je plátno s iskrami a vlastná
           vrstva by mu zmenila rasterizáciu. Nábeh je čisté krytie. */
        .planet-hero > * {
          opacity: 0;
          transition: opacity 560ms ease;
        }
        .planet-hero.hero-in > * { opacity: 1; }
        .planet-hero.hero-in .ph-lead { transition-delay: 110ms; }
        .planet-hero.hero-in .ph-mount { transition-delay: 240ms; }
        @media (prefers-reduced-motion: reduce) {
          .planet-hero > * { transition: none; }
        }
      `}</style>

      {/* DEV PULT (dizajn · pozadie · psov) tu STÁL a 25. 8. zanikol — voľby sú
          hore v konštantách DESIGN / BG / TARGET. */}

      <div className="planet-stage">
        <div
          className="planet-ball"
          ref={ballRef}
          style={{
            transform: `rotateX(${spinRef.current.x}deg) rotateY(${spinRef.current.y}deg)`,
            ['--tile' as string]: `${tile}px`,
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          // Odchod z gule kóty NERUŠÍ — dobehnú svoje tri sekundy. Len sa
          // prestane zakladať nová.
          onPointerLeave={() => { ptRef.current = null; setHot(null); }}
        >
          <TileField tiles={tiles} />
        </div>

        <div className="planet-shade" />

        <div className={`planet-hero${heroIn ? ' hero-in' : ''}`}>
          {/* Logo a tagline sa odtiaľto odsťahovali do pätičky filmu
              (Matej 26. 8.: „Logo aj tagline preč — dáme to úplne dolu").
              Prvá obrazovka teraz hovorí jedinú vec: pridaj svojho psa. */}
          {/* Matej 27. 8. 2026: *„zmeň nadpis na hero (1 sekcia) aj tagline
              YOUR DOG IS A GOD HERE. And we're still missing his face."*
              Nahradilo „Dogs of the world, unite." + „We are building a world
              of dogs…". Veta hovorí to isté v poradí, v akom to človek potrebuje:
              najprv čo tu jeho pes JE, až potom čo od neho chceme.
              ⚠️ Veľké písmená robí CSS (text-transform), nie tento zápis —
              v zdroji ostáva veta čitateľná. */}
          <h1 className="ph-h1">
            {/* Matej 27. 8. 2026: *„nadpis daj do 2 riadkoch your dog is-"*,
                po prvom pokuse *„na mobile to je v 3 riadkoch! (musí to byť na
                2 max)"*.
                🔴 PRETO SÚ RIADKY BLOKY S NOWRAP, NIE BR. Tvrdý zlom hovorí, KDE
                sa riadok láme — nezakazuje ďalšie zalomenie. Na telefóne stačilo,
                aby „YOUR DOG IS" bolo o pár pixelov širšie než okno (iné metriky
                písma, iná šírka, systémová veľkosť textu) a vznikol tretí riadok.
                Dva bloky s nowrap robia tretí riadok NEMOŽNÝM, nech je písmo
                akokoľvek veľké. Delí sa po „is" — druhý riadok nesie celé
                tvrdenie „a god here". */}
            <span className="ph-l">Your <span className="g">dog</span> is</span>
            <span className="ph-l">a <span className="g">god</span> here.</span>
          </h1>
          <p className="ph-lead">
            And we&rsquo;re still missing his face.
          </p>

          {/* ── PORTÁL ───────────────────────────────────────────────────
              Matej 27. 8. 2026: *„chcem aby sme ten portál rozanimovali, niečo
              v duchu doktora Strangeho… toto musí byť silný prvok, klikateľný"*.
              Tvar vyladený v `plany/portal-lab.html` — tam sa aj ďalej ladí.

              🔴 LEM A ISKRY MUSIA BYŤ MIMO TLAČIDLA. Jadro má `overflow: hidden`
              (drží v sebe cyklujúce tváre), takže čokoľvek, čo má presahovať von,
              by v ňom bolo orezané.
              🔴 ISKRY KRESLÍ PLÁTNO, NIE DOM. Pod portálom sa točí guľa s ~1000
              dlaždicami v 3D; 500 DOM prvkov navyše by ju zabilo. A plátno sa
              prekresľuje z TEJ ISTEJ slučky, ktorá otáča guľu — druhý
              `requestAnimationFrame` by si s ňou konkuroval o snímok. */}
          <span className="ph-mount" ref={portalMountRef} />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="ph-add-file"
            onChange={onPickPhoto}
          />

        </div>
      </div>

      {/* KÓTY. Vodiace čiary sú JEDNO svg cez celú obrazovku, nie čiara pripnutá
          k bublinke — bublinky sa navzájom rozostrkujú, takže čiara nikdy nevedie
          rovno a musí sa kresliť v spoločnej sústave. Zhasnú, len čo sa otvorí
          detail: dva popisky toho istého psa naraz sú šum, nie informácia. */}
      {notes.length > 0 && !picked && mriezka && (
        <svg className="pn-leads" width="100%" height="100%" aria-hidden="true">
          {/* 🔴 DIERA V TVARE CTA. Matej 27. 8. 2026: *„kótové čiary a guličky idú
              cez ten tmavý blok (CTA), musia ísť popod a nenarušovať CTA"*.
              Prečo maska a nie z-index: svg je `position: fixed` v koreni scény,
              kým portál sedí v `.planet-stage`, ktorá je vlastný stackingový
              kontext (má transform). Portál sa teda nad svg nemá ako dostať —
              zdvihnúť by sa musela CELÁ guľa aj s dlaždicami, a tie by potom
              zakryli kóty. Maska je jediné miesto, kde sa to dá povedať presne.
              ⚠️ Rozmery sa čítajú AŽ TU, nie pri vzniku kóty: portál mení šírku
              s oknom (`clamp`) a scéna má vlastnú mierku. */}
          {ctaMask && (
            <defs>
              <mask id="pn-cta-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
                <rect
                  x={ctaMask.x} y={ctaMask.y}
                  width={ctaMask.w} height={ctaMask.h}
                  rx={ctaMask.r} ry={ctaMask.r}
                  fill="#000"
                />
              </mask>
            </defs>
          )}
          <g mask={ctaMask ? 'url(#pn-cta-hole)' : undefined}>
          {notes.map(n => {
            // Čiara končí na hrane priehradky otočenej ku guli, nie na súradnici
            // uloženej pri vzniku — bublinka sa po zmene okna presunie a čiara
            // musí ísť s ňou.
            const kx = kotaKotva(n.side, mriezka);
            const ky = mriezka.ys[n.slot];
            return (
              <g key={n.id} className={noteGoing(n) ? 'is-going' : undefined}>
                {/* pathLength=1 normalizuje dĺžku, takže sa kóta vystrelí rovnako
                    rýchlo pri psovi pri okraji aj v strede — a keď sa pes otočí
                    ďalej a čiara sa predĺži, animácia sa tým nerozhodí. */}
                <polyline
                  pathLength={1}
                  points={`${n.x},${n.y} ${n.side === 'l' ? kx + 18 : kx - 18},${ky} ${kx},${ky}`}
                />
                <circle cx={n.x} cy={n.y} r={3.5} />
              </g>
            );
          })}
          </g>
        </svg>
      )}

      {!picked && mriezka && notes.map(n => (
        <div
          key={n.id}
          className={`pnote${noteGoing(n) ? ' is-going' : ''}`}
          // KLIK NA BUBLINKU OTVORÍ KARTU (Matej 25. 8.: „klik na bublinku otvorí
          // kartu, nie len klik priamo na planétku"). Bublinka je väčší a nehybný
          // cieľ než dlaždica na točiacej sa guli — na trafenie psa je to tá
          // ľahšia cesta, nie náhradná.
          role="button"
          tabIndex={-1}
          aria-label={n.dog.name}
          onClick={() => setPicked(n.dog)}
          onPointerEnter={() => { hoverNoteRef.current = n.id; }}
          onPointerLeave={() => { if (hoverNoteRef.current === n.id) hoverNoteRef.current = null; }}
          style={{
            left: n.side === 'l' ? mriezka.lx : mriezka.rx,
            top: mriezka.ys[n.slot],
            ['--pnw' as string]: `${mriezka.w}px`,
            ['--pnh' as string]: `${mriezka.h}px`,
            ['--pnp' as string]: `${mriezka.photo}px`,
            ['--pnl' as string]: mriezka.lines,
          }}
        >
          <img className="pnote-photo" src={n.dog.photoBig || n.dog.photo} alt="" draggable={false} />
          <div className="pnote-body">
            <div className="pnote-head">
              <span className="pnote-name">{n.dog.name}</span>
              {n.dog.n != null && <i className="pnote-n">#{n.dog.n}</i>}
              {n.dog.heroglyph && (
                <img className="pnote-glyph" src={n.dog.heroglyph} alt="" draggable={false} />
              )}
            </div>
            <p className="pnote-msg">{n.dog.message || (n.dog.n === 1 ? t('wall.hektor.msg') : '')}</p>
          </div>
        </div>
      ))}

      {/* Detail psa. Ten istý obsah pre obe možnosti — líši sa iba tým, KAM
          sadne (CSS `.v-side`). Dva panely s tým istým vnútrom by
          sa pri prvej úprave rozišli. */}
      {picked && (
        <div className="pp-panel" role="dialog" aria-label={picked.name}>
          {/* 🔴 KRÍŽIK TU BOL A ZANIKOL (Matej 28. 8. 2026: „pri bloku detail psa
              daj preč krížik = klik vedla stačí"). Cesta von je dvojitá a obe
              existovali už predtým, takže sa nič nestratilo: klik kamkoľvek mimo
              karty (obsluha na .planet-root, guľa je z nej vyňatá kvôli ťahu)
              a Escape (useEffect s `if (picked) setPicked(null)`).
              ⚠️ Kto by ho chcel vrátiť, vracia aj CSS — pravidlá .pp-x sú zmazané,
              vrátane výnimky pre .d-papyrus, kde mu `.pp-panel > *` prepisovalo
              position na relative a krížik padal do toku ako prvá položka. */}
          {/* Šípky sú SÚRODENCI obsahu karty, nie samostatná vrstva nad ňou —
              tak sa hýbu spolu s ňou pri príchode aj odchode. Na PC sú skryté
              (viď .pp-nav), takže sa tam nič nemení. */}
          {dogs.length > 1 && (
            <>
              <button className="pp-nav pp-nav--prev" onClick={() => stepPicked(-1)} aria-label="Previous dog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button className="pp-nav pp-nav--next" onClick={() => stepPicked(1)} aria-label="Next dog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          {/* JEDNA OS ZHORA NADOL (Matej 25. 8.: „teraz je to nelogické rozmiestnenie
              — skúsme to centrovať = fotka, pod ňou meno, za menom číslo a pod menom
              žijem si naplno / dní, pod tým heroglyf", potom výber varianty C).
              ⚠️ Predtým tu bola hlavička .pp-head s fotkou VEDĽA identity. Bol to
              pozostatok po podobách tabuľa/doska, kde zvislý stĺpec robil z panela
              pomník — a robil z karty DVE OSI naraz: hlavička zľava doprava, všetko
              pod ňou na stred. Práve to bolo to „nelogické". */}
          <div className="pp-photo-wrap">
            <img className="pp-photo" src={picked.photoBig || picked.photo} alt="" draggable={false} />
            {/* Poradové číslo ako PEČAŤ na spodnej hrane fotky, v strede. Je to tá
                istá dvojica fotka+číslo, akú človek pozná z dlaždice v stene, takže
                ho hľadá na tom istom mieste. Na vlastnom riadku vedľa mena sa pri
                dlhom mene zalamovalo a vyzeralo ako preklep. */}
            {picked.n != null && <span className="pp-seal">#{picked.n}</span>}
          </div>
          <div className="pp-name">{picked.name}</div>
          {/* ŽIVOT PSA V JEDNOM RIADKU — prevzaté z `LifeLine` na /pack homepage
              (Matej 25. 8.: „daj to do jedného riadku ale v chipe bude len číslo
              nie aj text"). Text stojí VEDĽA pilulky, nie v nej; pilulka nesie
              výhradne číslo a drží LOCKED vizuál z PackTree.tsx (zvislý gradient,
              Cinzel 700 bez verzálok, bez rámu).
              ⚠️ Bez dátumu narodenia sa riadok nezobrazí — vymyslené číslo by sa
              tu tvárilo ako údaj (týka sa Hektorovej výplňovej karty). */}
          {dniZivota(picked.birthDate) !== null && (
            <div className="pp-life">
              <span className="pp-life-label">
                <Sparkles className="pp-life-spark" aria-hidden />
                {t('pack.dog.livingBestLife')}
              </span>
              <span className="pp-days">
                {t('dogPage.daysCount', {
                  days: dniZivota(picked.birthDate)!.toLocaleString('en-US'),
                })}
              </span>
            </div>
          )}
          <div className="pp-rule" />
          {picked.heroglyph && (
            <img className="pp-glyph" src={picked.heroglyph} alt="" draggable={false} />
          )}
          {/* Hektor #1 má odkaz v preklade, nie v DB — rovnako ako jeho karta na stene.
              ⚠️ Vlásočnica sa sem UŽ NEKRESLÍ. Po prestavbe na jednu os stojí čiara
              nad heroglyfom a delí kartu na „kto to je" a „čo o ňom hovorí symbol";
              druhá čiara pod glyfom by z troch blokov spravila tabuľku. */}
          {(picked.message || picked.n === 1) && (
            <p className="pp-msg">{picked.message || t('wall.hektor.msg')}</p>
          )}
          {picked.n != null && picked.name && (
            <a className="pp-link" href={dogPagePath(picked.name, picked.n)}>
              {t('wall.dogPage')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
