// ════════════════════════════════════════════════════════════════════════════
// WALL LAB — pieskovisko homepage (DEV ONLY, route /wall-lab)
// ────────────────────────────────────────────────────────────────────────────
// 1:1 kópia `GodsGrid.tsx` z 25. 8. 2026, zámerne SAMOSTATNÝ SÚBOR: tu sa
// experimentuje s bledým (papyrusovým) vzhľadom steny bez toho, aby sa čokoľvek
// dotklo `/` na produkcii. Divergencia od originálu je ÚČEL, nie dlh — kým sa
// Matej nerozhodne, späť do `GodsGrid.tsx` sa nič nekopíruje.
//
// ⚠️ Route je za `import.meta.env.DEV` → v produkčnom builde je nedosiahnuteľná.
// ⚠️ Vlastný localStorage kľúč (`dogypt.wall.theme.lab`) — hranie v labe nesmie
//    prepnúť tému na skutočnej homepage a naopak.
// ⚠️ CSS triedy sú globálne a zhodné s originálom; naraz je namontovaná vždy len
//    jedna z dvoch stien, takže kolízia nehrozí.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { useT, useLang } from '@/i18n/LanguageContext';
import { useDogyptStore } from '@/store/dogyptStore';
import LanguagePicker from '../LanguagePicker';
import { photoPositions, photos } from './godsData';
import { LIVE_EDGE_BASE } from '@/lib/env';
import {
  NAV_R, NAV_GOLD, NAV_FRAME_BG, NAV_FRAME_BLEND, NAV_PLATE_BG, NAV_PLATE_BLEND,
  NAV_GRAIN_SCREEN_CSS, NAV_FRAME_SHADOW, NAV_PLATE_SHADOW, NAV_PILL_SHADOW,
} from '@/components/pack/navGoldSkin';
import { flagUrl, countryISO2, iso2ToISO3, countryFlag } from '@/lib/countryGeo';
import { track } from '@/lib/analytics';
import { gridTileUrl } from '@/services/cloudinaryService';
import { Seo } from '@/components/Seo';
import { DogPlanetLab, type PlanetDog } from './DogPlanetLab';
import { PORTAL_CSS, PORTAL_REDUCE_MOTION, buildPortal, createSparks } from './dogPortal';
import { useToast } from '@/hooks/use-toast';
import { shareDog, downloadCard, facebookShare, whatsappShare, copyDogLink } from '@/lib/useShareCard';
import { dogPagePath } from '@/lib/dogSlug';
import { BrandIcon } from '../pack/BrandIcon';
// Lapis = „moja voľba a moja akcia" (navGoldSkin.ts). Berie sa TOKEN, nie literál —
// stena je vanilla DOM, ale farba je tá istá ako všade inde.
import { LAPIS } from '../pack/navGoldSkin';
import './WhatNextPopup.css';

// LAB: stena ťahá SKUTOČNÝCH členov z produkcie (read-only, verejný endpoint) —
// na DEV projekte sú len testovací psi s jednou fotkou a papyrus sa na tom posúdiť nedá.
const GRID_DOGS_URL = `${LIVE_EDGE_BASE}/get-grid-dogs`;

interface RealDog {
  id: string;
  dog_name: string | null;
  pack_number: number | null;
  cloudinary_main_url: string | null;
  patron_svg: string | null;
  heroglyph_png_url: string | null;
  share_card_url?: string | null;
  country: string | null;
  owner_message: string | null;
  /** Na dopočet dní v detaile na planéte — endpoint ho vracia, len sa nečítal. */
  birth_date?: string | null;
}

// Hekthor (0,-1) + hero/CTA karta (0,0) tvoria spolu 1×2 "core" blok. Špirála
// obieha tento core ako rastúci obdĺžnikový prstenec (pravá hrana dole → spodná
// hrana doľava → ľavá hrana hore → horná hrana doprava), takže KAŽDÉ ďalšie
// číslo je vždy presne o 1 bunku vedľa predošlého — nikdy neskočí cez core na
// druhú stranu. #2 pristane hneď vpravo od Hekthora, #3 hneď pod #2, atď.
// (Predošlá verzia mala jednoduchú point-špirálu s Hero ako preskočenou dierou
// uprostred — to spôsobovalo skok #3→#4 cez CTA kartu.)
function generatePackPositions(count: number, coreBottom = 0): Array<{col: number, row: number}> {
  const result: Array<{col: number, row: number}> = [];
  // coreBottom = 1 vo variante B: core je o bunku vyšší (Hekthor + hero +
  // dlaždica na zápis), inak by špirála psa na (0,1) prekryla.
  let left = 0, right = 0, top = -1, bottom = coreBottom; // core: Hekthor + hero
  while (result.length < count) {
    const newLeft = left - 1, newRight = right + 1, newTop = top - 1, newBottom = bottom + 1;
    for (let r = newTop + 1; r <= newBottom; r++) result.push({ col: newRight, row: r });   // pravá hrana, dole
    for (let c = newRight - 1; c >= newLeft; c--) result.push({ col: c, row: newBottom });   // spodná hrana, doľava
    for (let r = newBottom - 1; r >= newTop; r--) result.push({ col: newLeft, row: r });     // ľavá hrana, hore
    for (let c = newLeft + 1; c <= newRight; c++) result.push({ col: c, row: newTop });      // horná hrana, doprava
    left = newLeft; right = newRight; top = newTop; bottom = newBottom;
  }
  return result.slice(0, count);
}

// LAB: karty o 15 % menšie, nech je hneď v úvode vidno viac psov (Matej 25. 8.).
// Násobí sa aj MEDZERA, nie len fotka — inak by sa pri menšej karte roztiahol
// vzduch medzi nimi a stena by zredla presne tam, kde má zhustnúť. Rovnaký
// princíp drží mobilné `MScale 0.67`. Ladí sa TOUTO konštantou, nie prepisom
// rovnice nižšie.
const LAB_CARD_SCALE = 0.85 * 0.85;   // dve kolá po −15 % (25. 8.)
// Mobil (<768px) = karty psov -33% (menšie karty, vyššia hustota grid steny). Desktop nedotknutý.
const MScale = ((typeof window !== 'undefined' && window.innerWidth < 768) ? 0.67 : 1) * LAB_CARD_SCALE;
const W  = Math.round(360 * MScale);
const H  = Math.round(360 * MScale);
const GX = W + Math.round(64 * MScale);
const GY = H + Math.round(64 * MScale);

// Cloudinary tile veľkosť podľa reálne zobrazenej karty × DPR (cap 2x — 3x displeje
// nepotrebujú plnú hustotu na fotke v pozadí karty). Predtým pevných 800px pre všetkých,
// aj mobil s kartou 241px CSS — zbytočne ťažké dlaždice (PageSpeed audit 2026-07-08).
const TILE_SIZE = Math.min(800, Math.max(320, Math.round(
  W * Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
)));

const REVEAL_COL = 3;
const REVEAL_ROW = 1;

const REVEAL_SYMBOL = '/images/dogypt-logo-black-i.png';

// ═════════════════════════════════════════════════════════════════════════
//  A/B — ZÁPIS PSA (Matej 25. 8. 2026, prepínač v ľavom dolnom rohu, DEV)
//
//  Matej: „nedávať CTA tlačítko ale veľký štvorec s pluskom a meniace sa tváre
//  psov vyblednuté a nad tým nápis v zmysle že zapíš psa" + „chcel by som to
//  skôr na prepínač na wall labe než na druhú stránku, nech si to viem rýchlo
//  prepnúť". Preto JEDEN súbor a prepínač, nie druhá routa.
//
//  PRAVIDLO, KTORÉ TO DRŽÍ: sľub musí byť splnený v NASLEDUJÚCEJ sekunde.
//  „Zapíš psa" → napíšeš meno → meno je na stene. Žiadna predsieň medzi tým.
//  Reťaz štyroch tlačidiel (stena → /entry → /heroglyph → intro) stojí dnes
//  313 zo 413 ľudí — merania v `plany/ladenie-konverzie.md`.
//
//  VARIANT A = presne dnešná stena (zlaté CTA v hero).
//  VARIANT B = hero bez CTA + prázdna dlaždica na bunke (0,1).
//  ⚠️ Štvorec je VLASTNÁ BUNKA mriežky, NIE prvok vnútri hera. Prvý pokus ho
//  dal do hera, to narástlo o kartu a keďže je centrované na bunku (0,0),
//  rástlo hore aj dole — logo zaliezlo pod Hekthora. Matej to zamietol slovami
//  „zaniklo logo aj všetko okolo". Ako bunka sa nebije s ničím.
// ═════════════════════════════════════════════════════════════════════════
type EnrollCopy = { label: string; ask: string; go: string };
const ENROLL_COPY: Record<string, EnrollCopy> = {
  sk: { label: 'ZAPÍŠ SVOJHO PSA', ask: 'Ako sa volá?',      go: 'POKRAČOVAŤ' },
  cs: { label: 'ZAPIŠ SVÉHO PSA',  ask: 'Jak se jmenuje?',   go: 'POKRAČOVAT' },
  en: { label: 'ADD YOUR DOG',     ask: "What's their name?", go: 'CONTINUE'   },
};
const enrollCopy = (lang: string): EnrollCopy => ENROLL_COPY[lang] || ENROLL_COPY.en;

/** Koľko vyblednutých tvárí sa strieda v prázdnej dlaždici. Cyklus = počet × 3 s. */
const ENROLL_FACES = 5;

/** Voľba variantu prežije reload — inak sa pri každom uložení súboru vráti na A. */
// ⚠️ `-v2` je zámerný bump (27. 8. 2026): pri prepnutí východzieho variantu na PORTÁL by
// stará uložená '0' (klik na A z pieskoviska) ticho vyhrala nad novým defaultom a stena by
// niekomu naďalej ukazovala tlačidlo. Bump zahodí každú starú voľbu, nová sa ukladá znova.
const ENROLL_KEY = 'wall-lab-enroll-v2';

/**
 * Variant B posúva východiskový pohľad o pol bunky hore, aby boli v zábere
 * hero (0,0) AJ dlaždica (0,1). Bez toho vidno z dlaždice pri načítaní len
 * horný okraj — teda to jediné, čo tam má človek urobiť, je pod ohybom.
 * ⚠️ Rovnaká hodnota musí ísť aj do onCenter(), inak tlačidlo „na stred"
 * skočí inam než počiatočný pohľad.
 */
const enrollViewShift = (on: boolean) => (on ? GY / 2 : 0);

/**
 * O KOĽKO HERO KLESNE POD HORNÝ NAV (Matej 27. 8. 2026: *„pils s naším targetom
 * a motto treba posunúť dolu, aby bolo vidno celé"*).
 *
 * Prečo vôbec: východiskový pohľad je kvôli portálu posunutý o pol bunky HORE
 * (`enrollViewShift`), takže hero vyliezlo pod nav — a vo filme (`/onepage`)
 * pod ním visí ešte medailón, ktorý siaha nižšie než samotná lišta. Vrch
 * nadpisu tak ležal presne za ním.
 *
 * ⚠️ NEDÁ SA to spraviť posunutím CELÉHO pohľadu — dolu je priestor vyčerpaný:
 * portál končí tesne nad spodnou lištou. Klesá preto len hero vo svojej bunke;
 * ukrajuje si z medzery k portálu (65 → 23 px), ktorá bola jediná voľná plocha
 * na obrazovke.
 *
 * ⚠️ ČÍSLO URČUJE MEDZERU K PORTÁLU, NIE VZDUCH POD NAVOM. Hero aj portál sú
 * bunky toho istého plátna, takže ich odstup je konštantný; koľko z toho ostane
 * na vzduch pod navom, rozhoduje VÝŠKA OKNA (pohľad sa centruje na okno).
 * Kalibrované na Matejov Mac: viewport ~668 px je jeho MAXIMUM (obrazovka má
 * availHeight 845). Pri ňom ostáva hero ~34 px pod medailónom — tesné zámerne,
 * lebo hero (222) + portál (260) je skoro celý priestor medzi medailónom a
 * spodnou lištou. Kto pridá čokoľvek do hera, oberie ten vzduch, nie medzeru.
 *
 * 🔴 NA MOBILE JE NULA A MUSÍ NÍM OSTAŤ. Bunky sú tam o tretinu menšie
 * (`MScale 0.67`), takže medzera hero↔portál je 39 px, nie 65 — desktopových
 * 42 px by hero POLOŽILO NA PORTÁL (odmerané: −3 px prekryv pri šírke 386).
 * A netreba ho: nav je nižší a hero tam stojí 97 px pod medailónom.
 */
/** Mobilná vetva steny. JEDNO miesto — `MScale` používa tú istú hranicu 768 px
 *  a dve rôzne hranice by vyrobili pásmo šírok bez pravidiel. */
const MOBILE_WALL = typeof window !== 'undefined' && window.innerWidth < 768;
const HERO_DROP = MOBILE_WALL ? 0 : 42;

// 'dark' = pôvodná tmavá so žiarami, 'darkcalm' = to isté bez žiar, 'light' = papyrus.
type WallTheme = 'dark' | 'darkcalm' | 'light';
/**
 * PODOBA STENY — jedno miesto, žiadny prepínač (Matej 25. 8.: „hore vpravo
 * vymaž prepínač"). Pilulka GOLD/CALM/PAPYRUS vedľa LOGIN zanikla aj s uloženou
 * voľbou v localStorage; papyrus je vybratý (*„bledá sa mi páči asi viac"*).
 * ⚠️ CSS ostatných dvoch podôb sa NEMAŽE — porovnanie sa spustí prepísaním
 * tejto jedinej konštanty, nie klikaním na stránke.
 */
const WALL_THEME: WallTheme = 'light';

const FLAG_NAMES: Record<string, string> = {
  sk: 'Slovakia',
  cz: 'Czechia',
  pl: 'Poland',
  hu: 'Hungary',
  at: 'Austria',
  de: 'Germany',
  us: 'USA',
  gb: 'United Kingdom',
  fr: 'France',
  it: 'Italy',
};

// Vlajka karty — deleguje na zdieľaný countryGeo helper (pozná Čínu, Áziu, ISO3/ISO2
// aj SK/EN názvy). Neznámu/prázdnu krajinu vráti '' → vlajka sa NEVYKRESLÍ (radšej žiadna
// než falošná SK). NIKDY nesmie mať vlastnú duplikovanú mapu — tá bola príčinou #18/#19
// (Čína) aj #14 (Česko) padajúcich na slovenskú vlajku.
function countryToISO2(country?: string | null): string {
  return countryISO2(country) || '';
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Only http(s) URLs and same-origin relative paths. Blocks javascript:/data: and
// any value that could break out of a CSS url()/HTML attribute. Returns '' if unsafe.
function safeUrl(u: string): string {
  if (!u) return '';
  try {
    const url = new URL(u, window.location.origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : '';
  } catch {
    return '';
  }
}

// Vytiahne Cloudinary public_id z uloženej secure_url (`.../image/upload/v123/tmp/<session>/main.jpg`
// → `tmp/<session>/main`) — potrebné aby sme mohli znova zavolať gridTileUrl() a dostať
// dlaždicovú transformáciu namiesto ťahania celého originálu (aj 1MB+ na WALL bunku).
// Vráti null pre neCloudinary assety (napr. lokálne /images/... filler fotky) — vtedy sa
// použije pôvodná URL bez zmeny.
function cloudinaryPublicId(url: string): string | null {
  const marker = '/image/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  let rest = url.slice(idx + marker.length);
  rest = rest.replace(/^v\d+\//, ''); // verzia (voliteľná)
  rest = rest.replace(/\.[a-zA-Z0-9]+$/, ''); // prípona
  return rest || null;
}

// LAB: dlaždica pre PLANÉTU — 160 px stačí, na guli je fotka ~53 px (×2 DPR).
// Ťahať sem TILE_SIZE (až 800) by znamenalo ~200 veľkých obrázkov naraz.
function planetTileUrl(rawUrl: string | null): string {
  const url = safeUrl(rawUrl || '');
  if (!url) return '';
  const publicId = cloudinaryPublicId(url);
  return publicId ? gridTileUrl(publicId, 160) : url;
}

// Fotka do panela detailu na guli. Dlaždicových 160 px je v ňom viditeľne
// rozmazaných (kruh 92 px na displeji s dvojnásobnou hustotou).
function planetDetailUrl(rawUrl: string | null): string {
  const url = safeUrl(rawUrl || '');
  if (!url) return '';
  const publicId = cloudinaryPublicId(url);
  return publicId ? gridTileUrl(publicId, 320) : url;
}

// Dlaždicová URL pre WALL kartu — sanitizovaná (safeUrl) + Cloudinary transform (w/h/q auto)
// namiesto surového originálu. Detail/reveal overlay zostáva na plnom obrázku zámerne.
function tileImageUrl(rawUrl: string | null): string {
  const url = safeUrl(rawUrl || '');
  if (!url) return '';
  const publicId = cloudinaryPublicId(url);
  return publicId ? gridTileUrl(publicId, TILE_SIZE) : url;
}

function getPos(filename: string): string {
  const key = decodeURIComponent(filename).normalize('NFC');
  return photoPositions[key] || '50% 50%';
}

function cellHash(col: number, row: number): number {
  const c = col + 500;
  const r = row + 500;
  let h = (c * 374761393 + r * 1013904223 + (c ^ r) * 2246822519) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

// Deterministická bijekcia (col,row) → index v `photos`. Primes coprime
// k photos.length zaručujú, že žiadne dve bunky v rovnakom rade ani stĺpci
// (v rozsahu jedného full cyklu) nemajú rovnakú fotku. Diagonály tiež OK.
function photoIndex(col: number, row: number): number {
  const len = photos.length;
  const n = ((col % len) + len) % len;
  const m = ((row % len) + len) % len;
  return (n * 7 + m * 11 + 31) % len;
}

function photoFor(col: number, row: number) {
  return photos[photoIndex(col, row)];
}

// Hektor (#1) ako filler pes — rozmnožený v nekonečnej stene popri zákazníkoch.
// Founder karta na (0,-1) ostáva špeciálna (makeHektorCard); toto je len pre výplň.
const HEKTHOR_FILL: RealDog = {
  id: 'hektor-fill',
  dog_name: 'HEKTHOR',
  pack_number: 1,
  cloudinary_main_url: '/images/hektor-grid.webp',
  patron_svg: null,
  heroglyph_png_url: '/images/hekthor-heroglyph.webp',
  country: 'SVK',
  owner_message: null,
  // Dátum narodenia Hektora tu NEVYPĹŇAM — filler karta ho nemá odkiaľ vedieť
  // a vymyslené číslo by sa v detaile tvárilo ako údaj. Pilulka s dňami sa
  // jednoducho nezobrazí.
  birth_date: null,
};

const NEIGHBORS8: ReadonlyArray<[number, number]> = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
];

// Bázový index psa do `fillers` pre danú bunku. Lineárne koeficienty (1·c + 3·r)
// zaručujú, že KAŽDÝ z 8 susedov (vrátane diagonál) má iný index — žiadne dva
// rovnaké fillery vedľa seba. (Δ susedov = 1,3,4,7 mod 9 — všetky ≠ 0.)
function gIndex(col: number, row: number, len: number): number {
  if (len <= 0) return 0;
  return (((col + 3 * row) % len) + len) % len;
}

// pack_number psa zobrazeného v bunke (bázovo, bez konfliktovej korekcie) — na
// kontrolu susedov pri výbere fillera. Zrkadlí poradie vetiev v makeCard.
function basePackAt(col: number, row: number, map: Map<string, RealDog>, fillers: RealDog[], enrollOn = false): number | null {
  if (col === 0 && row === 0) return null;       // hero
  if (enrollOn && col === 0 && row === 1) return null;  // variant B: dlaždica na zápis
  if (col === 0 && row === -1) return 1;          // Hektor founder
  const canon = map.get(`${col},${row}`);
  if (canon) return canon.pack_number ?? null;
  if (fillers.length === 0) return null;
  return fillers[gIndex(col, row, fillers.length)].pack_number ?? null;
}


interface GodsGridLabProps {
  /**
   * Wall beží vnútri `LabShell` (`components/lab/LabShell.tsx`):
   *   • horný nav a login kreslí RÁM (wall ich už nevykresľuje vôbec);
   *   • východiskový stav je GUĽA, nie stena (Matej 25. 8.: „považuj za homepage
   *     nie wall ale ten globe"). Planéta ostáva REŽIMOM vnútri wallu — vytrhnúť
   *     `DogPlanetLab` do vlastnej stránky by rozbilo čerstvo doladenú podobu.
   * Spodná lišta ostáva TU: nesie kalkulačku aj prepínač stena⇄planéta a je len
   * na homepage práve preto, že wall je namontovaný len v paneli homepage.
   */
  embedded?: boolean;
  /**
   * FILM (`components/lab/OnePage.tsx`) — Matej 26. 8. 2026: *„dolny nav zostava
   * ale namiesto dvoch ikoniek tam bude chip ako je v hornom menu s textom CTA
   * JOIN US = cta v 2 sekcii tym padom nebude, bude priamo v nave po cely cas
   * scrolingu."*
   * Je to VYMENA OBSAHU JEDNEJ LISTY, nie druha lista: kompas, terc aj prepinac
   * steny sa zbalia do nuly a na ich mieste sa rozvinie chip. Ram sa pritom
   * nehne — preto sa neprepina `display`, ale sirka a priehladnost.
   * `ctaLabel` sa vykresli VZDY, ked je zadany (aj ked `ctaMode` este nebezi) —
   * bez toho by chip nemal z coho prejst a len by vyskocil.
   */
  ctaMode?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  /**
   * Vykresli spodnu listu PORTALOM do <body>, nie na jej miesto v strome.
   * ⚠️ Nie je to kozmetika. Vo filme (OnePage) lezi wall v prilepenom obale
   * POD sekciami — inak Chrome cely film pod nim prestane kreslit (obsah je
   * v DOM, klikatelny, len neviditelny). Lista vsak musi byt NAD obsahom,
   * lebo ostava na obrazovke po cely scroll. Jedine riesenie, ktore drzi oboje,
   * je vytiahnut ju zo stacking contextu obalu.
   * Portal si nesie obal s triedou theme-light — bez neho by lista stratila
   * zlaty odliatok (.theme-light .gods-bottom-bar) a ostal by z nej holy riadok.
   */
  portalDock?: boolean;
  /**
   * Zastavi bezuce slucky gule (automaticke otacanie + citanie dlazdice pod
   * kurzorom). Vo filme je gula prilepena na cely scroll, takze bez tohto by
   * `elementFromPoint` nad ~1000 dlazdicami v 3D bezal 15x za sekundu aj vtedy,
   * ked je gula davno zhasnuta — a berie to snimky prave scrollu.
   */
  paused?: boolean;
  /**
   * Ohlasi, ci je prave otvorena STENA (mozaika), nie gula. Tretia ikonka
   * v spodnej liste prepina medzi nimi a stav si drzi tento komponent sam.
   *
   * ⚠️ Vo filme (OnePage) to nie je informacia, ale PODMIENKA: stena je podla
   * Mateja SAMOSTATNA STRANKA (27. 8. 2026: *„kliknutim na spodny nav 4 stvorce
   * (grid) otvori wall — to je samostatna stranka a teda scrolovanie dolu nema
   * pokracovat v one page"*). Bez tohto callbacku by sa pod otvorenou stenou
   * dal odscrollovat cely film.
   */
  onWallChange?: (wallOpen: boolean) => void;
}

export function GodsGridLab({ embedded = false, ctaMode = false, ctaLabel, ctaHref = '/entry', portalDock = false, paused = false, onWallChange }: GodsGridLabProps = {}) {
  const navigate = useNavigate();
  const t = useT();
  const appRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [showWhatNext, setShowWhatNext] = useState(false);
  const whatNextShownRef = useRef(false);
  const { toast } = useToast();
  // Share Card (WhatNext 5. slide) — null kým sa pipeline (post-payment, ~pár sekúnd)
  // nedopracuje k share_card_url; slide dovtedy zobrazí "preparing" fallback.
  const [revealShareCardUrl, setRevealShareCardUrl] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState<'share' | 'download' | null>(null);
  const [revealStep, setRevealStep] = useState<0|1|2|3|4>(0);
  const [revealSymbol, setRevealSymbol] = useState(() => new URLSearchParams(window.location.search).get('heroglyphUrl') || REVEAL_SYMBOL);
  const [dogsReady, setDogsReady] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  // LAB: planéta psov — overlay nad stenou, otvára ju tretia ikonka v spodnom nave.
  // V ráme (`embedded`) je guľa VÝCHODISKOVÝ stav = homepage; samostatný wall
  // (bez rámu) sa stále otvára stenou.
  const [planetOpen, setPlanetOpen] = useState(embedded);
  const [planetDogs, setPlanetDogs] = useState<PlanetDog[]>([]);
  // Žiadosť z kalkulačky pre planétu. `seq` sa zvyšuje pri každom potvrdení, aby
  // sa dalo to isté číslo natukať dvakrát po sebe (viď prop `pick` v DogPlanetLab).
  const [planetPick, setPlanetPick] = useState<{ n: number; seq: number } | null>(null);
  const [filterValue, setFilterValue] = useState('');
  // WALL téma je pevná — viď WALL_THEME hore. Ostáva premennou, lebo ju číta
  // className koreňa aj podmienky nižšie; meniť sa dá len v kóde.
  const theme = WALL_THEME;
  // Štatistika krajín pre filter popup: [{ iso2, iso3, count }], zoradené od najviac.
  const [countryStats, setCountryStats] = useState<{ iso2: string; iso3: string; count: number }[]>([]);
  const realDogMapRef = useRef<Map<string, RealDog>>(new Map());
  // Reálni psi (zákazníci, bez Hektora) opakovaní cez prázdne bunky → nekonečný WALL.
  const fillerDogsRef = useRef<RealDog[]>([]);
  const navigateToRef = useRef<((n: number) => void) | null>(null);
  // t() drží aktuálnu funkciu bez toho, aby bola v deps hlavného build efektu (ten je
  // najťažší v komponente — teardown pri každom prepnutí jazyka by zbúral celý grid,
  // resetol scroll pozíciu a zavrel otvorenú kartu). Preklady vnútri efektu čítaj cez
  // tRef.current(...), nie priamo cez `t`.
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);

  // A/B prepínač variantu zápisu psa (DEV pieskovisko). Grid je vanilla DOM
  // a stavia sa v efekte, takže hodnoty číta cez ref, nie zo closure.
  //
  // 🔴 VÝCHODZÍ JE **B — PORTÁL** (Matej 27. 8. 2026: *„cta tam nebolo tlačítko ale celý
  // blok ako je teraz na globe, nájdi to a vráť to tak"*). Predtým bol default A (zlaté
  // tlačidlo BECOME DOGYPTIAN) a portál sa musel zapnúť klikom.
  // ⚠️ PREČO TO VYZERALO AKO ZMAZANÝ BLOK: voľba žije v `localStorage`, a ten je
  // **per-origin, teda aj per-PORT**. Na `localhost:8080` bolo uložené B, na `:8081`
  // nebolo nič ⇒ default A ⇒ na jednom porte portál, na druhom tlačidlo. Dve session,
  // dva porty, dve rôzne steny. Preto sa default nesmie spoliehať na uloženú hodnotu:
  // `!== '0'` znamená, že bez uloženej voľby vyhráva portál a klik na A ostáva platný.
  const [enrollOn, setEnrollOn] = useState<boolean>(() => {
    try { return localStorage.getItem(ENROLL_KEY) !== '0'; } catch { return true; }
  });
  // Iskry portálu na stene. Kartu zahadzuje a znova stavia virtualizácia pri
  // scrolle, takže slučka nesmie visieť na karte — drží ju stena a plátno si
  // hľadá cez tento ref.
  const wallSparksRef = useRef<{ canvas: HTMLCanvasElement; sparks: { frame(dt: number): void } } | null>(null);
  const enrollRef = useRef(enrollOn);
  useEffect(() => { enrollRef.current = enrollOn; }, [enrollOn]);

  // ⚠️ VLASTNÁ rAF SLUČKA JE TU V PORIADKU, na guli by nebola. Nad stenou nebeží
  // nič iné, čo by si s ňou konkurovalo o snímok; nad guľou áno, preto tam iskry
  // kreslí slučka, ktorá guľu otáča. Slučka existuje len kým stojí dlaždica.
  useEffect(() => {
    // 🔴 A LEN KÝM JE STENA NA OBRAZOVKE. Stena sa pri prepnutí na guľu
    // NEODMOUNTUJE, len schová — bez tejto podmienky by slučka bežala ďalej
    // a kreslila iskry do neviditeľnej dlaždice práve vtedy, keď sa točí guľa.
    // To je presne tá druhá rAF slučka, ktorú zakazuje pravidlo 3 v dogPortal.ts.
    if (!enrollOn || planetOpen || PORTAL_REDUCE_MOTION) return;
    let raf = 0;
    let last = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const w = wallSparksRef.current;
      // Odpojené plátno = kartu odniesla virtualizácia. Kresliť doň je práca
      // navyše, ktorú nikto neuvidí.
      if (dt && w && w.canvas.isConnected) w.sparks.frame(dt);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [enrollOn, planetOpen]);
  const { lang } = useLang();
  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const revealData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('reveal');
    const isDemo = mode === 'demo';
    const active = mode === 'true' || isDemo;
    return {
      active,
      dogName: isDemo ? 'Toby' : (params.get('dogName') || 'Your Dog'),
      photoUrl: isDemo ? '/dogs/toby.jpg' : (params.get('photoUrl') || ''),
      packNumber: isDemo ? String(photos.length) : (params.get('packNumber') || String(photos.length + 1)),
      heroglyphUrl: params.get('heroglyphUrl') || '',
    };
  }, []);

  // "VIEW ON WALL #N" (PackDogDetail.tsx) linkuje na `/?focus=N` — zaostri kameru na
  // psa #N po naloadovaní gridu. Neplatné/chýbajúce N (NaN, <1) → ticho ignoruj,
  // žiadna console chyba.
  const focusPackNumber = useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get('focus');
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }, []);

  // Load real dogs for the grid
  useEffect(() => {
    let alive = true; // unmount guard — nesetuj state po odmountovaní (StrictMode dvojfetch, rýchla navigácia preč)
    fetch(GRID_DOGS_URL)
      .then(r => r.ok ? r.json() : [])
      .then((dogs: RealDog[]) => {
        if (!alive) return;
        if (dogs.length > 0) {
          const maxN = dogs.reduce((m, d) => Math.max(m, d.pack_number ?? 0), 0);
          const positions = generatePackPositions(maxN + 5, enrollRef.current ? 1 : 0);
          const map = new Map<string, RealDog>();
          for (const dog of dogs) {
            const n = dog.pack_number;
            if (!n || n < 2) continue; // #1 = Hektor founder, mimo špirály na (0,-1)
            // #2 = prvá špirálová pozícia positions[0], #3 → [1], … #n → [n-2].
            const idx = n - 2;
            if (idx < positions.length) {
              map.set(`${positions[idx].col},${positions[idx].row}`, dog);
            }
          }
          realDogMapRef.current = map;
          // Filler set = Hektor + všetci zákazníci (#2+); každý sa rozmnožuje v stene.
          fillerDogsRef.current = [HEKTHOR_FILL, ...dogs.filter(d => (d.pack_number ?? 0) >= 2)];
          // LAB: ten istý zoznam ide na planétu (Hektor #1 + zákazníci), len s menšou dlaždicou.
          setPlanetDogs(
            fillerDogsRef.current
              .map(d => ({
                id: d.id,
                name: d.dog_name || '',
                n: d.pack_number,
                photo: planetTileUrl(d.cloudinary_main_url),
                // Detail psa na guli nesie to isté, čo otvorená karta na stene:
                // väčšiu fotku, heroglyf a odkaz majiteľa.
                photoBig: planetDetailUrl(d.cloudinary_main_url),
                heroglyph: safeUrl(d.heroglyph_png_url || ''),
                message: d.owner_message || '',
                birthDate: d.birth_date || null,
              }))
              .filter(d => d.photo)
          );
          // Štatistika krajín (vrátane Hektora #1) pre filter popup.
          const cc = new Map<string, number>();
          for (const d of fillerDogsRef.current) {
            const iso2 = countryISO2(d.country);
            if (!iso2) continue;
            cc.set(iso2, (cc.get(iso2) ?? 0) + 1);
          }
          setCountryStats(
            [...cc.entries()]
              .map(([iso2, count]) => ({ iso2, iso3: iso2ToISO3(iso2), count }))
              .sort((a, b) => b.count - a.count)
          );
          if (revealData.active) {
            const packNum = parseInt(revealData.packNumber, 10);
            const revealDog = dogs.find(d => d.pack_number === packNum);
            if (!revealData.heroglyphUrl && revealDog?.heroglyph_png_url) {
              setRevealSymbol(revealDog.heroglyph_png_url);
            }
            if (revealDog?.share_card_url) {
              setRevealShareCardUrl(revealDog.share_card_url);
            }
          }
        }
        setDogsReady(true);
      })
      .catch(() => { if (alive) setDogsReady(true); });
    return () => { alive = false; };
  }, [revealData.active, revealData.packNumber]);

  // Reveal sequence timing
  // step 1: black screen + symbol burns in
  // step 2: only dog photo visible on black (symbol fades, grid still hidden)
  // step 3: grid appears around dog (+2s after photo)
  // step 4: done, overlay removed
  // If heroglyphUrl is in URL params we start immediately; otherwise wait for DB load.
  useEffect(() => {
    if (!revealData.active) return;
    if (!revealData.heroglyphUrl && !dogsReady) return;
    setRevealStep(1);
    const t1 = setTimeout(() => setRevealStep(2), 2000);
    const t2 = setTimeout(() => setRevealStep(3), 4200);
    const t3 = setTimeout(() => {
      setRevealStep(4);
      window.history.replaceState(null, '', '/');
    }, 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [revealData.active, revealData.heroglyphUrl, dogsReady]);

  // Prepnutie gula ⇄ stena ohlas von. Vo filme je stena samostatna stranka a
  // scroll sa pod nou musi zamknut — dovod je pri prope `onWallChange`.
  // ⚠️ Cez ref, nie priamo v onClick: stav prepinaju aj ine cesty (vychodiskovy
  // stav podla `embedded`), a tie by sa do handlera nedostali.
  const wallCbRef = useRef(onWallChange);
  wallCbRef.current = onWallChange;
  useEffect(() => { wallCbRef.current?.(!planetOpen); }, [planetOpen]);

  const submitFilter = () => {
    const n = parseInt(filterValue, 10);
    // DVA CIELE PRE JEDNO ČÍSLO. Na stene číslo znamená „prejdi tam" — kalkulačka
    // splnila úlohu a zavrie sa. Na guli znamená „ukáž mi ho" a kalkulačka
    // ZOSTÁVA (Matej 25. 8.: „človek môže klikať ďalšie čísla a napravo sa bude
    // meniť karta"), takže sa maže len natukaná hodnota. Zatvorí ju až kompas.
    if (!isNaN(n) && n >= 1) {
      if (planetOpen) setPlanetPick(p => ({ n, seq: (p?.seq ?? 0) + 1 }));
      else navigateToRef.current?.(n);
    }
    if (!planetOpen) setFilterOpen(false);
    setFilterValue('');
  };

  // KALKULAČKA SA RUŠÍ AJ KLIKOM VEDĽA (Matej 25. 8.: „otvorená kalkulačka sa ruší
  // klikom vedľa, nie len na ikonku kompasu"). Nad stenou to robí závoj overlayu —
  // ten klik chytí sám. Nad guľou závoj nie je (inak by nebolo vidno kartu, ktorá
  // sa vpravo mení), takže sa musí odchytiť na dokumente.
  // ⚠️ GUĽA NIE JE „VEDĽA". Má vlastné rozlíšenie ťuk vs. ťah, takže by sa
  // kalkulačka zatvárala pri KAŽDOM otočení planéty; a klik na psa je práca
  // s obsahom, nie odchod z nástroja. Tú istú výnimku má zatváranie karty psa.
  // ⚠️ Spodný bar je vyňatý tiež — kompas si otvorenie prepína sám a zavretie
  // zvonku by ho v tom istom kliku otvorilo naspäť.
  useEffect(() => {
    if (!filterOpen || !planetOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('.numpad') || el.closest('.planet-ball') || el.closest('.gods-bottom-bar')) return;
      setFilterOpen(false);
      setFilterValue('');
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [filterOpen, planetOpen]);

  // Desktop hardware-keyboard support for the numpad overlay
  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        setFilterValue(v => (v + e.key).slice(0, 6));
      } else if (e.key === 'Backspace') {
        setFilterValue(v => v.slice(0, -1));
      } else if (e.key === 'Enter') {
        submitFilter();
      } else if (e.key === 'Escape') {
        setFilterOpen(false);
        setFilterValue('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filterOpen, filterValue]);

  useEffect(() => {
    if (revealStep === 2) {
      const card = document.querySelector('.reveal-card');
      card?.classList.add('reveal-active');
    }
  }, [revealStep]);

  // WHAT NEXT? popup — len pre nového člena (revealData.active), raz, po dobehnutí
  // reveal animácie (step 4). Spustí sa 2s po dokončení, ALEBO hneď pri prvom
  // pohybe myšou / dotyku po reveale — podľa toho čo nastane skôr.
  useEffect(() => {
    if (revealStep !== 4 || !revealData.active) return;
    if (whatNextShownRef.current) return;

    const open = () => {
      if (whatNextShownRef.current) return;
      whatNextShownRef.current = true;
      setShowWhatNext(true);
    };
    const t = setTimeout(open, 2000);
    window.addEventListener('mousemove', open, { once: true, passive: true });
    window.addEventListener('touchstart', open, { once: true, passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', open);
      window.removeEventListener('touchstart', open);
    };
  }, [revealStep, revealData.active]);

  // Share Card race: pipeline generuje share_card_url ~pár sekúnd po platbe, takže
  // v momente prvého get-grid-dogs fetchu (spustí sa hneď pri reveale) často ešte
  // nie je hotová. Kým je WhatNext popup otvorený a URL stále chýba, dopytuj znova
  // (max 20×, každé 4s ≈ 80s) — nový pes: share karta sa generuje v pipeline
  // ~30-60s po platbe (heroglyph → toPng → upload → PATCH), 32s okno to tesne
  // minulo. Prvý poll skoro (1.5s) nech hotová karta naskočí hneď.
  useEffect(() => {
    if (!revealData.active || revealShareCardUrl || !showWhatNext) return;
    let alive = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const MAX = 20;
    const packNum = parseInt(revealData.packNumber, 10);
    const poll = () => {
      attempts += 1;
      fetch(GRID_DOGS_URL)
        .then(r => r.ok ? r.json() : [])
        .then((dogs: RealDog[]) => {
          if (!alive) return;
          const found = dogs.find(d => d.pack_number === packNum);
          if (found?.share_card_url) {
            setRevealShareCardUrl(found.share_card_url);
          } else if (attempts < MAX) {
            timer = setTimeout(poll, 4000);
          }
        })
        .catch(() => { if (alive && attempts < MAX) timer = setTimeout(poll, 4000); });
    };
    timer = setTimeout(poll, 1500);
    return () => { alive = false; clearTimeout(timer); };
  }, [revealData.active, revealData.packNumber, revealShareCardUrl, showWhatNext]);

  // Share / Download handlers pre WhatNext 5. slide (self-contained — nezávislé
  // od /pack, hoci volajú rovnaké fetch→File utility ako PackShareCard.tsx).
  const handleWnShare = async () => {
    if (!revealShareCardUrl || shareBusy) return;
    setShareBusy('share');
    try {
      const pack = parseInt(revealData.packNumber, 10);
      const shareText = t('share.dogVoice', { dog: revealData.dogName.toUpperCase() });
      const result = await shareDog({
        pack,
        dogName: revealData.dogName,
        imageUrl: revealShareCardUrl,
        channel: 'native',
        shareText,
      });
      track('share_clicked', { channel: result, type: 'sharecard', location: 'whatnext' });
      if (result === 'copied') toast({ title: t('sharecard.linkCopied') });
    } catch (err) {
      toast({
        title: t('sharecard.saved'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setShareBusy(null);
    }
  };

  const handleWnFacebook = () => {
    const shareText = t('share.dogVoice', { dog: revealData.dogName.toUpperCase() });
    facebookShare(parseInt(revealData.packNumber, 10), revealData.dogName, shareText);
    track('share_clicked', { channel: 'facebook', type: 'sharecard', location: 'whatnext' });
  };

  const handleWnWhatsapp = () => {
    const shareText = t('share.dogVoice', { dog: revealData.dogName.toUpperCase() });
    whatsappShare(parseInt(revealData.packNumber, 10), revealData.dogName, shareText);
    track('share_clicked', { channel: 'whatsapp', type: 'sharecard', location: 'whatnext' });
  };

  const handleWnCopyLink = async () => {
    await copyDogLink(parseInt(revealData.packNumber, 10), revealData.dogName);
    track('share_clicked', { channel: 'copy', type: 'sharecard', location: 'whatnext' });
    toast({ title: t('sharecard.linkCopied') });
  };

  const handleWnDownload = async () => {
    if (!revealShareCardUrl || shareBusy) return;
    setShareBusy('download');
    try {
      await downloadCard({ imageUrl: revealShareCardUrl, dogName: revealData.dogName });
      track('share_clicked', { channel: 'download', type: 'sharecard', location: 'whatnext' });
      toast({ title: t('sharecard.saved') });
    } catch (err) {
      toast({
        title: t('sharecard.saved'),
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setShareBusy(null);
    }
  };

  // Carousel pre WHAT NEXT? popup (vanilla DOM, port z prototypu 1:1).
  useEffect(() => {
    if (!showWhatNext) return;
    const root = document.querySelector('.wn-card');
    if (!root) return;
    const track = root.querySelector('.wn-track') as HTMLElement | null;
    const slides = root.querySelectorAll('.wn-slide');
    const cur = root.querySelector('.wn-counter .wn-cur') as HTMLElement | null;
    if (!track || !cur || slides.length === 0) return;
    const N = slides.length;
    let i = 0;
    // Postupný nábeh obsahu aktívnej karty (stagger). Re-trigger cez reflow.
    const animateIn = (idx: number) => {
      slides.forEach(s => s.classList.remove('wn-in'));
      const el = slides[idx] as HTMLElement;
      void el.offsetWidth;
      el.classList.add('wn-in');
    };
    const go = (n: number) => {
      i = (n + N) % N;
      track.style.transform = `translateX(-${i * 100}%)`;
      cur.textContent = String(i + 1);
      animateIn(i);
      // Share slide (posledný) = image-first: skryť pečiatku/nadpis/counter, obrázok dominantný
      (root as HTMLElement).classList.toggle('wn-card--share', i === N - 1);
    };
    // prvá karta má .wn-in už z prvého renderu (žiadny flash)
    const prev = root.querySelector('.wn-arrow.wn-prev');
    const next = root.querySelector('.wn-arrow.wn-next');
    const onPrev = () => go(i - 1);
    const onNext = () => go(i + 1);
    prev?.addEventListener('click', onPrev);
    next?.addEventListener('click', onNext);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'Escape') setShowWhatNext(false);
    };
    window.addEventListener('keydown', onKey);
    let x0: number | null = null;
    const sl = root.querySelector('.wn-slider') as HTMLElement | null;
    const onTouchStart = (e: TouchEvent) => { x0 = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    };
    sl?.addEventListener('touchstart', onTouchStart, { passive: true });
    sl?.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      window.removeEventListener('keydown', onKey);
      sl?.removeEventListener('touchstart', onTouchStart);
      sl?.removeEventListener('touchend', onTouchEnd);
    };
  }, [showWhatNext]);

  useEffect(() => {
    if (!dogsReady) return;
    const app = appRef.current;
    const canvas = canvasRef.current;
    if (!app || !canvas) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let ox = revealData.active
      ? vw / 2 - REVEAL_COL * GX - W / 2
      : vw / 2 - W / 2;
    let oy = revealData.active
      ? vh / 2 - REVEAL_ROW * GY - H / 2
      : vh / 2 - H / 2 - enrollViewShift(enrollRef.current);
    let dragging = false;
    let startX = 0, startY = 0;
    let prevX = 0, prevY = 0, prevT = 0;
    let vx = 0, vy = 0;
    let raf: number | null = null;
    const cells = new Map<string, HTMLElement>();

    // Click/tap tracking
    let downX = 0, downY = 0;
    let touchDownX = 0, touchDownY = 0;
    let openCardEl: HTMLElement | null = null;

    function toggleCard(card: HTMLElement) {
      const opening = !card.classList.contains('is-open');
      if (openCardEl && openCardEl !== card) openCardEl.classList.remove('is-open');
      if (opening) {
        card.classList.add('is-open');
        openCardEl = card;
        const rankText = card.querySelector('.card-open-rank')?.textContent?.replace('#', '').trim();
        track('wall_dog_click', rankText ? { pack_number: rankText } : {});
      } else {
        card.classList.remove('is-open');
        openCardEl = null;
      }
    }

    /** Poradové číslo, ktoré pes dostane, keď vstúpi teraz. Jedna funkcia, lebo
     *  číslo dnes hovorí PORTÁL a zajtra ho môže chcieť aj niekto iný — dve kópie
     *  toho istého `reduce` sa rozídu pri prvej zmene pravidla. */
    function nextPackNo() {
      return [...realDogMapRef.current.values()]
        .reduce((m, d) => Math.max(m, d.pack_number ?? 0), 1) + 1;
    }

    function makeHeroCard() {
      const el = document.createElement('div');
      el.className = 'center-hero';
      el.style.left = (W / 2) + 'px';
      el.style.top  = (H / 2 + HERO_DROP) + 'px';
      // LAB: hero sa zmenšuje V ROVNAKOM POMERE ako karty. Bunka pod ním sa
      // zmenšovaním steny uťahuje, ale logo + CTA + počítadlo si držali pôvodnú
      // veľkosť — pri druhom kole −15 % už logo miznulo za Hekthorom a pilulka
      // s počtom ležala na fotke pod ním. A fotiek sa nesmie dotýkať nič.
      // scale() za translate(): transform-origin je stred, takže ukotvenie drží.
      el.style.transform = `translate(-50%, -50%) scale(${LAB_CARD_SCALE})`;
      // ── OBSAH HERA = NADPIS + TAGLINE, NIČ INÉ (Matej 27. 8. 2026) ──────
      // *„tá voľná plocha nad blokom — tam musí byť náš nový headline YOUR DOG
      // IS A GOD HERE + tagline, bez loga, bez motta, bez pilulky s počtom…
      // údaj o počte dáme do toho portálu"*.
      //
      // 🔴 ZANIKLO TÝM: logo (.hero-logo-icon), motto „THE PLACE WHERE DOG IS
      // GOD." (.hero-tagline) aj pilulka „71 / 1,000,000 DOGS" (.hero-count).
      // Počet nezmizol — presťahoval sa DO PORTÁLU (viď makeEnrollCard).
      // Ich CSS zatiaľ v súbore ostáva: stena je lab, ktorý sa denne ladí,
      // a vrátiť ktorýkoľvek z tých troch prvkov je potom jeden riadok.
      //
      // ⚠️ ZNENIE JE TO ISTÉ AKO NA GULI (DogPlanetLab.tsx, .ph-h1 + .ph-lead)
      // a je zámerne po anglicky natvrdo, presne ako tam — nie cez slovník.
      // Keď sa mení veta, mení sa na OBOCH povrchoch naraz.
      //
      // 🔴 RIADKY SÚ BLOKY S NOWRAP, NIE <br>. Tvrdý zlom hovorí, KDE sa riadok
      // láme — nezakazuje ďalšie zalomenie. To isté zistenie ako na guli:
      // stačilo, aby „YOUR DOG IS" bolo o pár pixelov širšie než miesto, a
      // vznikol tretí riadok.
      // ── POČET = MODRÁ PILULKA VO VOĽNOM PRIESTORE (Matej 27. 8. 2026) ───
      // *„je to také plané = ten údaj o počte by sme mohli dať hore do volneho
      // priestoru a v bloku kde je foto dame len add photo a info že sa to tá
      // zmeniť… údaj o počte by sme mohli dať do modrého pils = OUR TARGET 1M
      // DOGS - your will be #xy… nejak pekne dizajnovo."*
      //
      // 🔁 DRUHÉ KOLO (Matej, o pár minút neskôr): *„nie je to vôbec pekné je to
      // suché… potrebujem aby to bolo juicy = najprv bude our tarbet výrazné
      // v pils alebo v niečom, osobne by som zvolil outline nie full colour pil
      // a pod tým iba text o tom aký pes v poradí bude."*
      //
      // 🔴 PRETO NIE DVA DIELY V JEDNOM TVARE, ALE PILULKA + RIADOK POD ŇOU.
      // Cieľ je NÁŠ a je to vyhlásenie — dostal rám. Číslo je TVOJE a je to
      // veta — rám nedostalo, dostalo veľkosť a zlato. Dva rámy vedľa seba
      // robili z toho tabuľku, a to bolo to „suché".
      //
      // 🔶 LAPIS JE ZATIAĽ PRACOVNÝ NÁVRH (navGoldSkin.ts) — odklepnutý pre
      // redizajn /map, do brand manuálu sa nezapisuje. Sem sa smie, lebo na
      // stene NIE JE žiadne iné lapisové CTA, s ktorým by si konkuroval:
      // hlavná akcia je tmavý portál so zlatým lemom.
      // ⚠️ A práve preto je pilulka OUTLINE: plná farebná plocha je v tomto
      // jazyku vyhradená hlavnému CTA. Matejova voľba („osobne by som zvolil
      // outline") sedí s pravidlom, ktoré si sám zapísal 26. 8. pri /map.
      el.innerHTML = `
        <h2 class="hero-h1">
          <span class="hero-hl">Your <span class="g">dog</span> is</span>
          <span class="hero-hl">a <span class="g">god</span> here.</span>
        </h2>
        <p class="hero-lead">And we&rsquo;re still missing his face.</p>
        <span class="hero-goal">
          <span class="hero-goal-pill">
            <svg class="hero-goal-globe" viewBox="0 0 341 306" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M229.593,2.193c14.195,-3.253 35.164,-1.784 51.885,3.616c7.674,2.463 16.974,6.505 20.685,8.953c8.384,5.574 23.511,21.584 27.174,28.8c4.153,8.164 8.637,25.627 10.595,41.196c1.611,12.742 1.469,15.442 -1.563,31.706c-8.542,45.837 -22.8,71.922 -60.601,110.923c-19.864,20.495 -35.496,33.569 -70.896,59.306c-19.88,14.448 -25.99,18.158 -31.169,18.932c-5.085,0.758 -7.185,0.395 -9.948,-1.737c-14.226,-11.053 -45.711,-34.248 -60.522,-44.606c-20.321,-14.226 -51.285,-40.943 -61.675,-53.243c-17.795,-21.063 -29.163,-41.274 -36.648,-65.227c-6.189,-19.769 -7.832,-47.086 -3.789,-63.112c5.747,-22.848 17.447,-38.796 41.621,-56.701c14.148,-10.485 27.901,-14.906 50.007,-16.074c24.9,-1.327 44.732,6.647 64.738,26.006l11.495,11.116l4.137,-4.548c2.289,-2.51 4.168,-4.989 4.2,-5.526c0.015,-0.537 5.116,-5.085 11.337,-10.09c12.426,-10.027 25.453,-16.611 38.937,-19.69Zm9.221,13.974c-18.71,2.4 -39.095,14.448 -51.79,30.616c-15.963,20.369 -17.006,20.575 -28.801,5.969c-13.673,-16.911 -29.795,-27.316 -48.064,-30.98c-10.042,-2.021 -30.237,0.158 -41.637,4.485c-13.816,5.258 -35.069,23.274 -42.127,35.716c-6.727,11.843 -8.858,21.364 -8.858,39.554c-0,35.479 14.889,69.98 42.948,99.586c13.09,13.8 38.511,35.148 62.748,52.659c10.422,7.531 24.522,17.747 31.343,22.689c20.953,15.222 18.743,14.48 27.064,9.206c25.705,-16.295 58.343,-42.633 80.859,-65.259c37.39,-37.58 50.717,-60.459 58.991,-101.307c4.358,-21.538 4.452,-26.654 0.837,-44.228c-3.727,-18.063 -8.322,-27.49 -18.174,-37.342c-16.043,-16.043 -41.607,-24.396 -65.339,-21.364Zm-113.386,65.259c4.8,-4.816 6.332,-5.479 12.458,-5.479c6.316,0 7.548,0.584 12.964,6.253c7.073,7.374 9.552,14.605 9.552,27.869c0,11.653 -3.647,19.99 -10.626,24.237c-5.7,3.49 -8.574,3.569 -15.095,0.49c-6.411,-3.048 -12.711,-12.206 -15.885,-23.101c-3.458,-11.921 -1.136,-22.5 6.632,-30.269Zm114.429,34.453c13.989,-6.142 25.516,1.816 25.516,17.622c-0,21.427 -24.253,41.653 -38.653,32.227c-8.448,-5.542 -10.943,-17.258 -6.095,-28.832c2.858,-6.853 13.547,-18.522 19.232,-21.017Zm-77.844,28.09c3.569,-1.815 7.626,-2.384 14.59,-2.068c11.337,0.521 16.8,3.632 24.616,14.006c2.811,3.726 9.142,11.1 14.069,16.389c11.51,12.379 14.163,17.527 14.274,27.664c0.11,10.042 -4.39,17.527 -13.122,21.79c-7.642,3.726 -16.121,3.663 -26.558,-0.205c-17.085,-6.332 -20.258,-6.522 -34.327,-2.053c-18.711,5.968 -27.458,4.011 -35.606,-7.958c-4.295,-6.316 -4.263,-16.106 0.063,-24.332c4.027,-7.611 35.322,-39.838 42.001,-43.233Zm31.801,-70.532c10.8,-7.279 24.537,-2.353 27.869,9.979c4.073,15.142 -6.19,39.932 -19.296,46.627c-7.594,3.868 -11.937,3.442 -17.795,-1.69c-7.31,-6.426 -9.458,-16.721 -6.221,-29.858c2.748,-11.116 8.416,-20.337 15.443,-25.058Zm-107.039,52.532c3.568,-3.584 6.11,-4.832 9.789,-4.832c9.348,0 19.975,10.864 23.922,24.443c6.332,21.727 -11.132,37.264 -27.68,24.632c-5.068,-3.868 -11.7,-15.063 -13.247,-22.342c-1.437,-6.837 1.721,-16.406 7.216,-21.901Z"/></svg>
            Help us reach <b>1M</b> dogs
          </span>
        </span>
        ${enrollRef.current ? '' : `<a href="/entry" class="join-btn" data-join>${tRef.current('wall.hero.cta')}</a>`}
      `;
      // ── VEĽKOSŤ NADPISU SA POČÍTA, NEMERIA ──────────────────────────────
      // Nadpis stojí v bunke mriežky medzi dvoma fotkami a *„fotiek sa to
      // nesmie dotýkať"*. Voľná šírka na obrazovke je teda GX (rozstup stĺpcov);
      // hero je navyše celé zmenšené o LAB_CARD_SCALE, takže NEZMENŠENÝ obsah
      // smie byť GX / LAB_CARD_SCALE široký. Z toho ide 6 % na vzduch.
      // Dlhší riadok „YOUR DOG IS" má v Cinzeli 700 šírku ~7,25 em (odmerané
      // na guli: 529 px pri 73,5 px písme), takže veľkosť písma vychádza delením.
      // ⚠️ Preto TU a nie v CSS: GX závisí od MScale (mobil −33 %), kým hero
      // sa zmenšuje len o LAB_CARD_SCALE — dve rôzne mierky, ktoré by v jednom
      // clamp() nešli vyjadriť a na telefóne by nadpis vytiekol na susedné psy.
      // ⚠️ +10 % tu BOLO a je VRÁTENÉ (Matej 27. 8.: „ja som myslel ale na globe
      // a nie na wall, vráť to a urob to kde máš“) — zväčšenie motta aj taglinu
      // patrí GULI (DogPlanetLab.tsx), stena ostáva na 0.94. Nechávam to zapísané,
      // lebo meranie platí: pri 1.034 klesol vzduch k susednej fotke z 30 na 15 px
      // (PC) a zo 17 na 7 px (mobil), teda strop je tu, nie vyššie.
      el.style.setProperty('--hero-fs', ((GX / LAB_CARD_SCALE) * 0.94 / 7.25).toFixed(2) + 'px');
      const btn = el.querySelector('[data-join]');
      btn?.addEventListener('click', (e) => {
        e.preventDefault();  // keep SPA nav; href="/entry" exists purely so Googlebot can crawl to it
        track('cta_become_dogyptian_click', { location: 'wall' });
        navigate('/entry');
      });
      return el;
    }

    function makeHektorCard() {
      const el = document.createElement('article');
      el.className = 'dog-card hektor-card';
      el.style.left = '0px';
      el.style.top  = (-1 * GY) + 'px';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('/images/hektor-grid.webp');background-position:50% 35%"></div>
        <div class="card-open-overlay">
          <div class="card-open-titlerow">
            <span class="card-open-rank">#1</span>
            <span class="card-open-name">HEKTHOR</span>
          </div>
          <img class="card-open-heroglyph" src="/images/hekthor-heroglyph.webp" alt="HEKTHOR heroglyph" draggable="false">
          <div class="card-open-msg">${tRef.current('wall.hektor.msg')}</div>
          <a class="card-open-dogpage-link" href="${dogPagePath('Hekthor', 1)}">${tRef.current('wall.dogPage')}</a>
        </div>
        <div class="card-rank-top">#1</div>
        <img class="card-flag" src="${flagUrl('sk')}" alt="Slovakia" title="Slovakia" loading="lazy" draggable="false">
        <div class="hektor-heroglyph-wrap">
          <img class="hektor-heroglyph" src="/images/hekthor-heroglyph.webp" alt="Hekthor heroglyph" draggable="false">
        </div>
        <div class="card-name-block">
          <div class="card-label hektor-label">HEKTHOR</div>
        </div>
      `;
      return el;
    }

    function makeRevealCard() {
      const el = document.createElement('article');
      el.className = 'dog-card reveal-card';
      el.style.left = (REVEAL_COL * GX) + 'px';
      el.style.top  = (REVEAL_ROW * GY) + 'px';
      const safeName = (revealData.dogName || 'DOGYPTIAN')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const packNumInt = parseInt(revealData.packNumber, 10);
      let cc = '';
      let revealOwnerMessage = '';
      for (const dog of realDogMapRef.current.values()) {
        if (dog.pack_number === packNumInt) {
          cc = countryToISO2(dog.country);
          revealOwnerMessage = dog.owner_message ? esc(dog.owner_message) : '';
          break;
        }
      }
      const flagName = FLAG_NAMES[cc] || cc;
      const overlayHeroSrc = esc(revealSymbol);
      // photoUrl + packNumber come from the URL query string — never interpolate raw.
      const photo = safeUrl(revealData.photoUrl);
      const safePack = esc(revealData.packNumber);
      const inner = photo
        ? `<div class="reveal-card-inner"></div>`
        : `<div class="reveal-card-inner reveal-card-fallback"><span class="cartouche">${safeName}</span></div>`;
      el.innerHTML = `
        ${inner}
        <div class="card-open-overlay">
          <div class="card-open-rank">#${safePack}</div>
          <div class="card-open-name">${safeName}</div>
          <img class="card-open-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">
          ${revealOwnerMessage ? `<div class="card-open-msg">${revealOwnerMessage}</div>` : ''}
        </div>
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">
        </div>
        <div class="card-rank-top">#${safePack}</div>
        ${cc ? `<img class="card-flag" src="${flagUrl(cc)}" alt="${flagName}" title="${flagName}" loading="lazy" draggable="false">` : ''}
        <div class="card-name-block">
          <div class="card-label">${safeName}</div>
        </div>
      `;
      if (photo) {
        // Set background via DOM API (no HTML parsing) — safe from CSS/HTML injection.
        const innerNode = el.querySelector('.reveal-card-inner') as HTMLElement | null;
        if (innerNode) innerNode.style.backgroundImage = `url("${photo}")`;
        const probe = new Image();
        probe.src = photo;
        probe.onerror = () => {
          const node = el.querySelector('.reveal-card-inner') as HTMLElement | null;
          if (!node) return;
          node.style.backgroundImage = '';
          node.classList.add('reveal-card-fallback');
          node.innerHTML = `<span class="cartouche">${safeName}</span>`;
        };
      }
      return el;
    }

    // fill=true → duplikát reálneho psa vo výplni nekonečného WALL. Vyzerá identicky
    // ako originál (vrátane #čísla + správy) — slúži len nato aby WALL nebola prázdna.
    // Nových psov pribúda od stredu (špirála) a postupne tieto duplikáty prepisujú.
    function makeRealDogCard(dog: RealDog, col: number, row: number, fill = false) {
      const cc = countryToISO2(dog.country);
      const flagName = FLAG_NAMES[cc] || cc;
      const safeName = esc((dog.dog_name || 'DOGYPTIAN').toUpperCase());
      const packNum = dog.pack_number ?? '?';

      const el = document.createElement('article');
      el.className = fill ? 'dog-card dog-card--fill' : 'dog-card';
      el.style.left = (col * GX) + 'px';
      el.style.top  = (row * GY) + 'px';
      const overlayHeroSrc = dog.heroglyph_png_url ? esc(dog.heroglyph_png_url) : '';
      const tileSrc = esc(tileImageUrl(dog.cloudinary_main_url));
      // Verejná stránka psa — len keď máme reálne dáta (pack_number + meno) z DB.
      // Fillery bez čísla (edge/transitional stav) tlačidlo nedostanú.
      const dogPageHref = (dog.pack_number != null && dog.dog_name)
        ? esc(dogPagePath(dog.dog_name, dog.pack_number))
        : '';
      el.innerHTML = `
        <div class="card-img" style="background-image:url('${tileSrc}');background-position:50% 30%"></div>
        <div class="card-open-overlay">
          <div class="card-open-rank">#${packNum}</div>
          <div class="card-open-name">${safeName}</div>
          ${overlayHeroSrc ? `<img class="card-open-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">` : ''}
          ${dog.owner_message ? `<div class="card-open-msg">${esc(dog.owner_message)}</div>` : ''}
          ${dogPageHref ? `<a class="card-open-dogpage-link" href="${dogPageHref}">${tRef.current('wall.dogPage')}</a>` : ''}
        </div>
        <div class="card-rank-top">#${packNum}</div>
        ${cc ? `<img class="card-flag" src="${flagUrl(cc)}" alt="${flagName}" title="${flagName}" loading="lazy" draggable="false">` : ''}
        ${overlayHeroSrc ? `
        <div class="dog-heroglyph-wrap">
          <img class="dog-heroglyph" src="${overlayHeroSrc}" alt="${safeName} heroglyph" draggable="false">
        </div>` : ''}
        <div class="card-name-block">
          <div class="card-label">${safeName}</div>
        </div>
      `;
      return el;
    }

    // ── VARIANT B: DLAŽDICA NA VSTUP (bunka 0,1) ─────────────────────────
    // Plnohodnotná bunka mriežky, nie prvok vnútri hera — preto sa nebije
    // s logom ani taglinom (prvý pokus ich obetoval a Matej to zamietol).
    //
    // 🔴 OD 27. 8. 2026 JE TO TEN ISTÝ PORTÁL AKO NA GULI (Matej: *„to CTA nahraď
    // tým, čo už máme na globe = wall bude mať tú istú CTA, teda dlaždicu
    // s iskrami namiesto tej, čo tam je teraz"*). Tvar stavia `buildPortal()`
    // z dogPortal.ts — stena je vanilla DOM, guľa React, a dve kópie tej istej
    // dlaždice by sa rozišli pri prvej úprave.
    //
    // ZANIKOL TÝM ZÁPIS MENA (`enroll-input`, `enroll-name`, `enroll-go`,
    // `is-typing`, `is-named`, udalosti `wall_enroll_open`/`wall_enroll_named`).
    // Matej to rozhodol pri výbere: *„to isté čo na guli — fotka"*, teda jedna
    // CTA v celom produkte. Meno sa pýta až flow za ňou.
    //
    // ⚠️ Karta MUSÍ mať overflow: visible a byť nad susedmi — iskry lietajú ďaleko
    // za jej hranu a orezané v polovici vyzerajú ako chyba vykreslenia.
    function makeEnrollCard() {
      const el = document.createElement('article');
      el.className = 'dog-card enroll-card enroll-card--portal';
      el.style.left = '0px';
      el.style.top  = (1 * GY) + 'px';

      // Tváre sa striedajú CSS animáciou, nie intervalom — kartu odstraňuje
      // virtualizácia pri scrolle a JS časovač by po nej ostal bežať.
      const faces = [...realDogMapRef.current.values()]
        .map(d => planetTileUrl(d.cloudinary_main_url))
        .filter(Boolean) as string[];

      // Skrytý výber súboru žije V KARTE, nie v dokumente — s kartou aj zanikne.
      const file = document.createElement('input');
      file.type = 'file';
      file.accept = 'image/*';
      file.className = 'ph-add-file';

      // ── ČÍSLO SA VRÁTILO DO PORTÁLU (Matej 27. 8. 2026) ─────────────────
      // *„tá správa o počte psov by som dal predsa len do toho CTA bloku
      //  = v prazdnom priestore bude motto + info (ktoru doladíme o milione
      //  psov) a v CTA bloku bude info o pridaní photo a kolky v poradí bude pes"*.
      // Hero tým hovorí len NÁŠ cieľ (výzva v pilulke), portál len TVOJ vstup.
      // ⚠️ Vracia sa tým stav, ktorý Matej ráno zamietol slovami, že dva riadky
      // pod ADD PHOTO robia z dlaždice odsek — teraz to chce vedome.
      // 🔴 A PRETO JE ČÍSLO PILULKA, NIE TRETÍ RIADOK TEXTU (Matej, o pár minút
      // neskôr: *„tá info o počte daj ju naspodok toho bloku do pilsu ale
      // outline nie plného"*). Tvar je to, čo ho odlíši od odseku: veta o fotke
      // ostáva textom, číslo dostane rám a klesne naspodok.
      const portal = buildPortal({
        faces,
        onPick: () => file.click(),
        note: '(you can change the photo later)',
        subnote: `<span class="ph-nopill">Yours will be <b>#${nextPackNo()}</b></span>`,
      });
      // Jadro portálu vypĺňa bunku mriežky — šírku preto nediktuje CSS clamp
      // z gule, ale rozmer karty.
      portal.el.style.setProperty('--ph-w', W + 'px');
      // ── STENA MÁ VLASTNÉ POMERY VNÚTRA (Matej 27. 8. 2026) ──────────────
      // *„menšia hrúbka toho obrysu okolo bloku"* + *„menšie + menší text"*.
      // Dlaždica má 260 px proti 118 px na guli, takže tie isté NÁSOBKY šírky
      // tu vysadia dvakrát väčšie plus aj popisok. Lem je naopak PEVNÝ počet
      // pixelov, takže sa veľkosťou dlaždice neriedi a pri 260 px pôsobil
      // ako rám.
      // ⚠️ Prepisuje sa TU, na prvku, nie v PORTAL_CSS — guľa je vyladená
      // a odklepnutá (27. 8., lab), mení sa výhradne stena.
      portal.el.style.setProperty('--ph-rimw', '6px');
      portal.el.style.setProperty('--ph-icok', '0.185');
      portal.el.style.setProperty('--ph-lblk', '0.072');
      // ── VETA O FOTKE = JEDEN RIADOK (Matej 27. 8. 2026: „you can change photo
      //    daj do jedného riadku"). Odmerané: pri 13 px písme potrebuje 217 px,
      //    strop `.ph-mark` je 0,86 × 260 = 224 px — vošla by, ale s 3 % rezervou.
      //    Preto sa písmo stiahne na 12,2 px (potreba 204 px, rezerva 9 %):
      //    iné metriky písma na inom stroji tak riadok nezlomia.
      //    ⚠️ Nowrap sám osebe druhý riadok NEZAKÁŽE bezpečne — bez rezervy len
      //    presunie problém z lámania na pretečenie orezaného jadra.
      portal.el.style.setProperty('--ph-notek', '0.047');
      portal.el.style.setProperty('--ph-note-ws', 'nowrap');
      // ⚠️ Podradený riadok nesie PILULKU s číslom, nie drobný dovetok — musí
      // teda byť o kúsok VÄČŠÍ než veta o fotke (`--ph-notek` 0.05), nie menší.
      // Východzích 0.052 by tu bolo náhodou takmer rovnakých; 0.056 dalo pilulke
      // váhu, ktorú tvar sľubuje — a −10 % (Matej: „tu pils v cta zmenši o 10%“)
      // z toho robí 0.0504. Mení sa JEDEN násobok: výplň aj medzery sú v em.
      portal.el.style.setProperty('--ph-subk', '0.0504');

      file.addEventListener('change', () => {
        const f = file.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        portal.setPhoto(url);
        // ⚠️ Blob sa ZÁMERNE neuvoľňuje — tú istú adresu drží store pre ďalší krok
        // flow a revokeObjectURL by mu ju v tej istej sekunde zabil.
        useDogyptStore.getState().setDogPhotoUrl(url);
        track('cta_become_dogyptian_click', { location: 'wall_enroll_b' });
        navigate('/heroglyph/name');
      });

      el.append(portal.el, file);

      // Plátno sa ohlási slučke steny. Slučka si ho hľadá cez tento ref, lebo
      // kartu virtualizácia pri scrolle zahodí a postaví znova.
      // ⚠️ JEMNEJŠIA KORÓNA NEŽ NA GULI (Matej 27. 8. 2026: *„na WALLE treba
      // razantne upraviť zo žiari aj celkovo iskrenia, je to predsa len väčšia
      // dlaždica… prispôsobiť to okoliu"*). Dlaždica má 260 px proti 118 px na
      // guli, takže tá istá sadzba by tu bola dvakrát hustejšia clona.
      wallSparksRef.current = { canvas: portal.canvas, sparks: createSparks(portal.canvas, { density: 0.42 }) };
      return el;
    }

    function makeCard(col: number, row: number) {
      if (col === 0 && row === 0) return makeHeroCard();
      if (enrollRef.current && col === 0 && row === 1) return makeEnrollCard();
      if (col === 0 && row === -1) return makeHektorCard();
      if (revealData.active && col === REVEAL_COL && row === REVEAL_ROW) return makeRevealCard();

      const realDog = realDogMapRef.current.get(`${col},${row}`);
      if (realDog) return makeRealDogCard(realDog, col, row);

      // Nekonečná stena: prázdne bunky vypĺňame reálnymi psami (Hektor + zákazníci),
      // plný duplikát s #číslom. Vyberáme tak, aby sa pes NIKDY neopakoval v žiadnom
      // z 8 susedov (ani diagonálne) — inak to vyzerá divne.
      const fillers = fillerDogsRef.current;
      if (fillers.length === 0) return null;
      const map = realDogMapRef.current;
      const forbidden = new Set<number>();
      for (const [dc, dr] of NEIGHBORS8) {
        const p = basePackAt(col + dc, row + dr, map, fillers, enrollRef.current);
        if (p != null) forbidden.add(p);
      }
      const start = gIndex(col, row, fillers.length);
      for (let k = 0; k < fillers.length; k++) {
        const cand = fillers[(start + k) % fillers.length];
        if (!forbidden.has(cand.pack_number ?? -1)) {
          return makeRealDogCard(cand, col, row, true);
        }
      }
      return makeRealDogCard(fillers[start], col, row, true); // fallback (nemalo nastať)
    }

    function updateTransform() {
      canvas!.style.transform = `translate(${ox}px,${oy}px)`;
    }

    function updateCells() {
      const c0 = Math.floor(-ox / GX) - 2;
      const c1 = c0 + Math.ceil(vw / GX) + 4;
      const r0 = Math.floor(-oy / GY) - 2;
      const r1 = r0 + Math.ceil(vh / GY) + 4;

      for (const [key, el] of cells) {
        const [c, r] = key.split(',').map(Number);
        if (c < c0 || c > c1 || r < r0 || r > r1) {
          el.remove();
          cells.delete(key);
        }
      }

      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const key = `${c},${r}`;
          if (cells.has(key)) continue;
          const el = makeCard(c, r);
          if (!el) continue;
          canvas!.appendChild(el);
          cells.set(key, el as HTMLElement);
        }
      }
    }

    function render() {
      updateTransform();
      updateCells();
    }

    // mousemove/touchmove/wheel môžu fírovať oveľa častejšie než 1×/frame (vysokofrekvenčné
    // trackpady/myši) — bez throttlu by render() (transform + cells diff) bežal viackrát
    // za frame zbytočne. scheduleRender() zbatchuje viacero volaní do jedného rAF; ox/oy
    // sú do frame update-nuté synchrónne v handleroch, takže sa nič nestratí.
    let renderRafId: number | null = null;
    function scheduleRender() {
      if (renderRafId !== null) return;
      renderRafId = requestAnimationFrame(() => {
        renderRafId = null;
        render();
      });
    }

    function inertia() {
      vx *= 0.95;
      vy *= 0.95;
      if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
      ox += vx;
      oy += vy;
      render();
      raf = requestAnimationFrame(inertia);
    }

    const onMouseDown = (e: MouseEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const target = e.target as HTMLElement;
      // Close open card if clicking outside it
      if (openCardEl && !openCardEl.contains(target)) {
        openCardEl.classList.remove('is-open');
        openCardEl = null;
      }
      if (target.closest('.center-hero') || target.closest('.enroll-card') || target.closest('.center-btn') || target.closest('.main-nav') || target.closest('.nav-login') || target.closest('.lang-panel') || target.closest('.center-btn-mobile') || target.closest('.filter-btn') || target.closest('.gods-bottom-bar') || target.closest('.lang-btn-mobile') || target.closest('.lang-modal-root') || target.closest('.numpad-overlay') || target.closest('.card-open-dogpage-link')) return;
      dragging = true;
      downX = e.clientX;
      downY = e.clientY;
      startX = e.clientX - ox;
      startY = e.clientY - oy;
      prevX = e.clientX; prevY = e.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
      document.body.style.cursor = 'pointer';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - prevT || 1;
      vx = (e.clientX - prevX) / dt * 16;
      vy = (e.clientY - prevY) / dt * 16;
      prevX = e.clientX; prevY = e.clientY; prevT = now;
      ox = e.clientX - startX;
      oy = e.clientY - startY;
      scheduleRender();
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragging) return;
      dragging = false;
      app!.classList.remove('is-dragging');
      document.body.style.cursor = 'default';

      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist < 6) {
        // Click: find dog card (not hero widget, not card-info which has its own handler)
        const target = e.target as HTMLElement;
        if (!target.closest('.card-info')) {
          const card = target.closest('.dog-card:not(.center-hero):not(.enroll-card)') as HTMLElement | null;
          if (card) { toggleCard(card); return; }
        }
        return; // don't start inertia on click
      }
      raf = requestAnimationFrame(inertia);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (raf) cancelAnimationFrame(raf);
      const t = e.touches[0];
      dragging = true;
      touchDownX = t.clientX;
      touchDownY = t.clientY;
      startX = t.clientX - ox;
      startY = t.clientY - oy;
      prevX = t.clientX; prevY = t.clientY; prevT = performance.now();
      vx = vy = 0;
      app!.classList.add('is-dragging');
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const t = e.touches[0];
      const now = performance.now();
      const dt = now - prevT || 1;
      vx = (t.clientX - prevX) / dt * 16;
      vy = (t.clientY - prevY) / dt * 16;
      prevX = t.clientX; prevY = t.clientY; prevT = now;
      ox = t.clientX - startX;
      oy = t.clientY - startY;
      scheduleRender();
    };
    const onTouchEnd = (e: TouchEvent) => {
      dragging = false;
      app!.classList.remove('is-dragging');

      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - touchDownX, t.clientY - touchDownY);
        if (dist < 12) {
          // Interactive UI controls (join CTA, nav, lang, filter, numpad…) need their
          // native click — don't preventDefault, or the synthetic click never fires.
          const tapped = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
          if (tapped?.closest('.enroll-card, .center-hero, .center-btn, .main-nav, .nav-login, .lang-panel, .center-btn-mobile, .filter-btn, .gods-bottom-bar, .lang-btn-mobile, .lang-modal-root, .numpad-overlay, .card-open-dogpage-link')) {
            return;
          }
          // Prevent the browser from firing synthetic mouse events (mousedown/mouseup/click)
          // after this touch tap — those would re-open a card we just closed.
          e.preventDefault();
          // Tap: close open card if tapping outside, or toggle tapped card
          if (openCardEl) {
            const el = document.elementFromPoint(t.clientX, t.clientY);
            if (el && openCardEl.contains(el)) {
              // tap inside open card → close it
              openCardEl.classList.remove('is-open');
              openCardEl = null;
              return;
            }
            openCardEl.classList.remove('is-open');
            openCardEl = null;
          }
          const el = document.elementFromPoint(t.clientX, t.clientY);
          const card = (el as HTMLElement | null)?.closest?.('.dog-card:not(.center-hero):not(.enroll-card)') as HTMLElement | null;
          if (card) { toggleCard(card); return; }
          return;
        }
      }
      raf = requestAnimationFrame(inertia);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let dx = e.deltaX, dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 24; dy *= 24; }
      if (e.deltaMode === 2) { dx *= vh; dy *= vh; }
      ox -= dx;
      oy -= dy;
      scheduleRender();
    };

    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      render();
    };

    // Klik na terč vždy dá viditeľnú odozvu: pulz na center hero + haptika.
    const heroAnchorPulse = () => {
      const hero = canvas?.querySelector('.center-hero') as HTMLElement | null;
      if (hero) {
        hero.classList.remove('hero-anchor-pulse');
        void hero.offsetWidth; // reštart CSS animácie
        hero.classList.add('hero-anchor-pulse');
      }
      navigator.vibrate?.(15);
    };

    const onCenter = () => {
      if (raf) cancelAnimationFrame(raf);
      const tx = vw / 2 - W / 2;
      const ty = vh / 2 - H / 2 - enrollViewShift(enrollRef.current);
      if (Math.hypot(tx - ox, ty - oy) < 4) {
        // Už ukotvené — rubber-band bounce namiesto „nič sa nedeje"
        heroAnchorPulse();
        const t0 = performance.now();
        const dur = 480;
        const A = 13;
        function bounce(now: number) {
          const p = Math.min((now - t0) / dur, 1);
          oy = ty + A * Math.sin(p * Math.PI * 2.5) * (1 - p) * (1 - p);
          render();
          if (p < 1) raf = requestAnimationFrame(bounce);
          else { oy = ty; render(); }
        }
        raf = requestAnimationFrame(bounce);
        return;
      }
      const sx = ox, sy = oy;
      const t0 = performance.now();
      const dur = 600;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = ease(p);
        ox = sx + (tx - sx) * e;
        oy = sy + (ty - sy) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
        else heroAnchorPulse();
      }
      raf = requestAnimationFrame(step);
    };

    app.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    app.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    app.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    function navigateTo(n: number) {
      if (n < 1) return;
      if (raf) cancelAnimationFrame(raf);
      let col: number, row: number;
      if (n === 1) {
        // #1 = Hekthor, the founder card. Hardcoded at (0,-1), NOT in the spiral.
        col = 0; row = -1;
      } else {
        // #2 = positions[0] (prvá špirálová pozícia) … #n → positions[n-2].
        const positions = generatePackPositions(n + 5, enrollRef.current ? 1 : 0);
        const idx = n - 2;
        if (idx < 0 || idx >= positions.length) return;
        ({ col, row } = positions[idx]);
      }
      const tx = vw / 2 - col * GX - W / 2;
      const ty = vh / 2 - row * GY - H / 2;
      const sx = ox, sy = oy;
      const t0 = performance.now();
      const dur = 800;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      function step(now: number) {
        const p = Math.min((now - t0) / dur, 1);
        const e = ease(p);
        ox = sx + (tx - sx) * e;
        oy = sy + (ty - sy) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    navigateToRef.current = navigateTo;

    const centerBtnMobile = document.getElementById('gods-center-btn-mobile');
    centerBtnMobile?.addEventListener('click', onCenter);

    render();

    // Kamera skočí na hero (0,0)/reveal pozíciu pri initial render() vyššie — ak URL
    // nesie `?focus=N`, dožeň animovaný pan na cieľovú kartu (Hekthor #1 je fixný na
    // (0,-1), nič v navigateTo tú pozíciu nemení ani nerotuje).
    if (focusPackNumber !== null && !revealData.active) {
      navigateTo(focusPackNumber);
    }

    return () => {
      app.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      app.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      app.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      centerBtnMobile?.removeEventListener('click', onCenter);
      if (raf) cancelAnimationFrame(raf);
      if (renderRafId !== null) cancelAnimationFrame(renderRafId);
      cells.forEach(el => el.remove());
      cells.clear();
    };
  }, [navigate, dogsReady, focusPackNumber, revealData.active, enrollOn]);

  // Zmena jazyka → NEBÚRAME grid (rebuild by zrušil scroll pozíciu, otvorenú kartu aj
  // virtualizované bunky — je to najťažší efekt v komponente). Jediné miesta kde grid
  // pri builde kreslí i18n text sú hero karta (0,0) a Hektor karta (0,-1) — ak práve
  // existujú v DOM (mohli byť odstránené virtualizáciou pri scrolle ďaleko od stredu),
  // len im prepíšeme text priamo. Ak neexistujú, nič sa nedeje — pri návrate do zorného
  // poľa ich makeHeroCard/makeHektorCard postaví znova s aktuálnym tRef.current().
  useEffect(() => {
    if (!dogsReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // ⚠️ Nadpis ani tagline hera sa tu NEPREPISUJÚ — od 27. 8. 2026 sú to dve
    // anglické vety natvrdo, presne ako na guli (viď makeHeroCard). Zanikli tým
    // aj prepisy .hero-tagline, .hero-count-total a .hero-count-dogs; motto,
    // logo a pilulka s počtom už v hero karte nie sú.
    const joinBtn = canvas.querySelector('.join-btn');
    if (joinBtn) joinBtn.textContent = t('wall.hero.cta');
    const hektorMsg = canvas.querySelector('.hektor-card .card-open-msg');
    if (hektorMsg) hektorMsg.textContent = t('wall.hektor.msg');
  }, [t, dogsReady]);

  return (
    <>
      <Seo
        path="/"
        title="DOGYPT — The Place Where DOG is GOD"
        description="Transform your dog's essence into a timeless HEROGLYPH. 12 Symbols, 1 Eternal Legacy."
      />
      <style>{`
        body { overflow: hidden; }

        .gods-root {
          position: fixed;
          inset: 0;
          background-color: #050505;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: -0.02em;
          user-select: none;
          overflow: hidden;
        }
        .gods-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/images/bg-dark.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(3px);
          z-index: 0;
          pointer-events: none;
        }
        #gods-canvas { z-index: 1; }

        /* HORNÝ NAV + LOGIN: CSS odišlo do components/lab/LabShell.tsx
           (jedna kópia baru v projekte). Zlatý odliatok si aj tak obe strany
           ťahajú z components/pack/navGoldSkin.ts. */

        .info-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(8,8,8,0.96);
          backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }
        .info-overlay.open { opacity: 1; pointer-events: all; }
        .info-close {
          position: absolute;
          top: 20px; right: 20px;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          cursor: pointer;
          color: white;
          font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: background 150ms;
        }
        .info-close:hover { background: rgba(255,255,255,0.2); }
        .info-content {
          max-width: 680px;
          width: 90%;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .info-content h2 {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 700;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .info-content p {
          font-size: 1rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.55);
          max-width: 520px;
        }

        .center-btn {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(163,163,163,0.8);
          backdrop-filter: blur(12px);
          color: white;
          display: flex; align-items: center; gap: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          font-size: 0.875rem;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .center-btn:hover { opacity: 0.85; }

        #gods-canvas {
          position: absolute;
          top: 0; left: 0;
          will-change: transform;
        }

        /* ── Dog card base ── */
        .dog-card {
          position: absolute;
          width: ${W}px;
          height: ${H}px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .is-dragging .dog-card { cursor: pointer; transition: none; }

        /* 🔒 LOCKED — kánon aktualizovaný 2026-06-25 (Matej: „nechaj plnú farbu aj na live"):
           Placeholder dogs = PLNÁ FARBA (opacity 1, bez filtra). Predtým priesvitné (opacity 0.6 +
           brightness(0.92) contrast(0.97)) — vzhľad „ZEUS" z 2026-06-02, nahradený.
           NEMENIŤ brightness/opacity/grayscale bez výslovného OK. */
        .dog-card--placeholder { cursor: default; }
        .dog-card--placeholder .card-img {
          filter: none;
          opacity: 1;
        }
        .dog-card--placeholder .card-label {
          font-size: 0.7rem !important;
          letter-spacing: 0.22em !important;
        }
        .dog-card--placeholder:hover {
          transform: none !important;
          box-shadow: none !important;
        }
        .dog-card--placeholder .card-open-overlay { display: none; }

        /* Hover: scale + gradient darkening (suppressed on open card & during drag) */
        .dog-card:not(.is-open):hover {
          transform: scale(1.08);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          z-index: 5;
        }
        .is-dragging .dog-card:hover { transform: none; box-shadow: none; }

        /* Overlay — appears on hover, uniform dark */
        .dog-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.62);
          opacity: 0;
          will-change: opacity;
          transition: opacity 220ms ease;
          pointer-events: none;
          z-index: 1;
        }
        .dog-card:not(.is-open):hover::after { opacity: 1; }
        .is-dragging .dog-card::after { opacity: 0 !important; }

        /* Elements that hide on hover (and on open) */
        .card-rank-top, .card-flag, .card-name-block {
          will-change: opacity;
          transition: opacity 160ms ease;
        }
        .dog-card:not(.is-open):hover .card-rank-top,
        .dog-card:not(.is-open):hover .card-flag,
        .dog-card:not(.is-open):hover .card-name-block { opacity: 0; }
        .is-dragging .dog-card .card-rank-top,
        .is-dragging .dog-card .card-flag,
        .is-dragging .dog-card .card-name-block { opacity: 1 !important; }

        .card-img {
          width: 100%; height: 100%;
          background-size: cover;
          background-color: #1a1a1a;
        }

        /* Name block (default state, bottom-left) */
        .card-name-block {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          z-index: 2;
        }
        .card-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          color: #C99A3F;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 6px rgba(0,0,0,0.9);
          line-height: 1;
        }
        .card-rank-gold { color: #C99A3F; }
        .card-label {
          height: 28px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: flex; align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }



        /* Click (open) overlay */
        .card-open-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.88);
          border-radius: inherit;
          z-index: 6;
          opacity: 0;
          pointer-events: none;
          will-change: opacity;
          transition: opacity 220ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          overflow-y: auto;
        }
        .dog-card.is-open .card-open-overlay { opacity: 1; pointer-events: auto; }
        .dog-card.is-open { z-index: 8; }
        .dog-card.is-open .card-rank-top,
        .dog-card.is-open .card-flag,
        .dog-card.is-open .card-name-block { opacity: 0; }

        .card-open-titlerow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .card-open-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.08em;
          text-align: center;
        }
        .card-open-rank {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #3a2c10;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 999px;
          padding: 2px 11px;
        }
        .card-open-msg {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.6);
          text-align: center;
          line-height: 1.55;
          max-width: 280px;
          font-style: italic;
          margin-top: 2px;
        }
        .card-open-heroglyph {
          width: 48%;
          height: auto;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
          margin-bottom: 4px;
        }
        .card-open-dogpage-link {
          display: inline-block;
          flex-shrink: 0;
          margin-top: 4px;
          padding: 6px 16px;
          font-family: 'Cinzel', serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C99A3F;
          background: transparent;
          border: 1px solid rgba(201,154,63,0.65);
          border-radius: 8px;
          text-decoration: none;
          /* pointer-events až v otvorenom stave — explicitné auto tu by prerazilo
             pointer-events:none zatvoreného overlay a neviditeľný link by žral kliky */
          pointer-events: none;
          cursor: pointer;
          transition: box-shadow 200ms ease, background 200ms ease;
        }
        .dog-card.is-open .card-open-dogpage-link { pointer-events: auto; }
        .card-open-dogpage-link:hover {
          background: rgba(201,154,63,0.08);
          box-shadow: 0 0 12px rgba(201,154,63,0.45);
        }

        .card-flag {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 2px 8px rgba(0,0,0,0.45);
          pointer-events: auto;
          cursor: help;
          background: #1a1a1a;
          z-index: 2;
        }
        .card-rank-top {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          height: 24px;
          padding: 0 10px;
          background: rgba(30,30,30,0.35);
          color: white;
          border-radius: 999px;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: inline-flex;
          align-items: center;
          backdrop-filter: blur(6px);
          white-space: nowrap;
          line-height: 1;
          pointer-events: none;
        }

        /* ── Center hero ── */
        .center-hero {
          position: absolute;
          z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          gap: 16px;
          text-align: center;
          pointer-events: auto;
          width: max-content;
        }
        .center-hero::before {
          content: '';
          position: absolute;
          inset: -200px -320px;
          background: radial-gradient(ellipse at center, rgba(8,8,8,0.92) 20%, transparent 68%);
          z-index: -1;
          pointer-events: none;
        }
        /* Zlatý pulz ring — feedback kliku na terč (ukotvenie na stred) */
        .center-hero::after {
          content: '';
          position: absolute;
          left: 50%; top: 50%;
          width: 200px; height: 200px;
          margin: -100px 0 0 -100px;
          border-radius: 50%;
          border: 2px solid rgba(201,154,63,0.9);
          box-shadow: 0 0 24px rgba(201,154,63,0.35);
          opacity: 0;
          pointer-events: none;
        }
        .center-hero.hero-anchor-pulse::after {
          animation: heroAnchorPulse 0.9s ease-out;
        }
        @keyframes heroAnchorPulse {
          0%   { opacity: 0;    transform: scale(0.35); }
          15%  { opacity: 0.95; }
          100% { opacity: 0;    transform: scale(1.7); }
        }
        .hero-logo-icon {
          width: 120px; height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 0 32px rgba(196,155,66,0.5));
        }
        .hero-tagline {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.78rem, 1.4vw, 0.9rem);
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.2em;
          line-height: 1.8;
          text-transform: uppercase;
          text-align: center;
          white-space: nowrap;
        }
        .hero-tagline .gold {
          display: inline;
          white-space: nowrap;
          font-weight: 700;
          background: linear-gradient(100deg, #A3782B 0%, #C49B42 30%, #FFF4C2 50%, #C49B42 70%, #A3782B 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shimmer 6s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(196,155,66,0.5));
        }
        @keyframes gold-shimmer {
          0%   { background-position: -100% 0; }
          60%  { background-position: 200% 0; }
          100% { background-position: 200% 0; }
        }
        /* ── NADPIS HERA ────────────────────────────────────────────────
           Tá istá veta a ten istý rez ako na guli (DogPlanetLab.tsx, .ph-h1).
           Rozdiel je len v MIERKE a v PODKLADE: guľa má nadpis cez celú
           obrazovku nad fotkami, stena ho má v bunke mriežky medzi dvoma psami.
           ⚠️ Veľkosť NEURČUJE clamp() — počíta ju makeHeroCard do --hero-fs
           (viď rovnicu tam). Tu je len poistka, keby premenná chýbala. */
        .hero-h1 {
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: var(--hero-fs, 40px);
          line-height: 1.06;
          letter-spacing: 0.005em;
          text-transform: uppercase;
          color: #FFF6DA;
        }
        /* Riadok = blok s nowrap. Jediná poistka proti tretiemu riadku. */
        .hero-h1 .hero-hl { display: block; white-space: nowrap; }
        /* 🔶 ODCHÝLKA OD BRAND MANUÁLU, VEDOMÁ — tá istá ako na guli (Matej
           27. 8.: „v hero nadpise skúsme dať dog a god decoratívom a hrubším").
           Cinzel Decorative je inak vyhradený pre MENÁ PSOV na oficiálnych
           povrchoch; tu ho nesú dve slová v nadpise. Povrch je lab, teda vratné.
           ⚠️ Váha 900 — Decorative je načítaný LEN v 700 a 900. */
        .hero-h1 .g {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 900;
          color: #F5C73D;
        }
        .hero-lead {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          /* ⚠️ Space Grotesk je načítaný len do váhy 600 — vyššie je fake bold. */
          font-weight: 600;
          font-size: calc(var(--hero-fs, 40px) * 0.33);
          line-height: 1.35;
          color: rgba(255,246,218,0.78);
          /* Jeden riadok, rovnako ako na guli. Bezpečné aj na telefóne: veľkosť
             je násobok --hero-fs, ktorá sa počíta z voľnej šírky bunky — takže
             riadok sa zmenšuje spolu s miestom, ktoré má. */
          white-space: nowrap;
        }

        /* ── CIEĽ + TVOJE ČÍSLO ─────────────────────────────────────────
           Matej 27. 8. 2026, druhé kolo: *„nie je to vôbec pekné je to suché…
           potrebujem aby to bolo juicy = najprv bude our tarbet výrazné v pils
           alebo v niečom, osobne by som zvolil outline nie full colour pil
           a pod tým iba text o tom aký pes v poradí bude."*

           🔴 DVE VRSTVY, NIE DVE POLIČKY. Cieľ je NÁŠ a je to vyhlásenie —
           dostal rám. Číslo je TVOJE a je to veta — rám nedostalo, dostalo
           veľkosť a zlato. Dva orámované diely vedľa seba robili tabuľku,
           a to bolo to „suché".
           ⚠️ OUTLINE, NIE PLNÁ VÝPLŇ — Matejova voľba sedí s pravidlom, ktoré
           si sám zapísal 26. 8. pri /map: plná farebná plocha je vyhradená
           hlavnému CTA (tu tmavý portál), všetko ostatné je priesvitný tint.
           A čitateľnosť tintu nesie TMAVÝ INKOUST a PLNÝ farebný rám, nie
           krytie výplne — to je tá istá lekcia z rána 26. 8.
           ⚠️ Veľkosti sú NÁSOBKY --hero-fs: nadpis sa počíta z voľnej šírky
           bunky, takže sa s ním musí zmenšovať aj toto, inak na telefóne
           prerastie to, pod čím stojí. */
        .hero-goal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: calc(var(--hero-fs, 40px) * 0.155);
          /* ── ODSTUP OD MOTTA (Matej 27. 8. 2026) ────────────────────────
             *„motto a chip pôsobí že to je všetko spojene, treba to opticky
             rozdeliť mierne."* Nadpis a tagline sú JEDNA myšlienka, chip
             s číslom je DRUHÁ — pri rovnomernej medzere .center-hero (16 px)
             sa čítali ako štvorriadkový odsek.
             ⚠️ Násobok --hero-fs, nie pixely: medzera musí ustúpiť spolu
             s písmom, inak na telefóne odtlačí chip na susednú fotku. */
          margin-top: calc(var(--hero-fs, 40px) * 0.5);
        }

        /* Chip — PAPYRUS V ZLATOM RÁME, LAPISOVÝ INKOUST.
           Matej 27. 8. 2026: *„nie je to pekné je to divné, skús ten chip
           urobiť krajší."*

           🔴 MODRÝ LEM BOL CHYBA PROTI VLASTNÉMU PRAVIDLU. navGoldSkin.ts:
           *„ZLATO = konštrukcia a poloha — rám, doska, čiary… LAPIS = moja
           voľba a moja akcia."* Rám je konštrukcia, teda zlatý; lapis nesie
           odkaz, teda písmo. S modrým lemom stál na teplej stene studený
           obdĺžnik, ktorý vyzeral ako formulárové pole — odtiaľ to „divné".
           ⚠️ Výplň je LOCKNUTÝ bledý blok z /entry (papyrusový gradient,
           zlatý rám 1,5 px, zlatý halo prstenec, teplý tieň, biela horná
           hrana), nie plochá biela so šedým vlasom.
           ⚠️ Zlatý rám sa nebije s btn-gold pod ním: CTA je PLNÁ zlatá
           plocha, toto je bledá plocha so zlatým VLASOM. */
        /* ── 4. KOLO: CELÁ LAPISOVÁ, TMAVÁ (Matej 27. 8. 2026) ──────────────
           *„pils daj celu lapisom nech je tmavá a namiesto tej planétky daj
           iconu labky v srdiečku"*.

           🔴 VEDOMÁ VÝNIMKA Z VLASTNÉHO PRAVIDLA. 26. 8. si Matej pri /map
           zapísal, že plná farebná plocha patrí JEDINÉMU prvku na doske —
           hlavnému CTA. Tu je hlavné CTA tmavý portál so zlatým lemom, teda
           lapisová plocha mu farbou nekonkuruje; flagnuté pred ním a potvrdené.
           ⚠️ Zlaté písmo NA lapise nie je ozdoba (navGoldSkin.ts): bez neho je
           z lapisu len tmavý obdĺžnik bez príslušnosti k brandu — lapis + zlato
           je pôvodná egyptská dvojica.
           ⚠️ Rám je LAPIS.edge, nie zlato: zlatý vlas okolo tmavej plochy by
           z pilulky spravil druhé tlačidlo vedľa portálu. */
        .hero-goal-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          padding: 0.8em 1.55em;
          border-radius: 999px;
          background: ${LAPIS.grad};
          border: 1.5px solid ${LAPIS.edge};
          box-shadow:
            0 0 0 3.5px rgba(22,48,122,0.14),
            0 10px 26px -10px rgba(5,15,48,0.55),
            inset 0 1px 0 rgba(201,154,63,0.30);
          color: ${LAPIS.ink};
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          /* −10 % (Matej 27. 8.: „ok lepšie ale zmenši to o 10%“). Mení sa JEDEN
             násobok — výplň, ikonka aj medzery sú v em, takže sa stiahnu s ním.
             ⚠️ Kto siahne na rovnicu nadpisu, musí siahnuť aj sem: pilulka je
             odklepnutá vo svojej veľkosti, takže rast nadpisu treba kompenzovať
             delením (0.324 / pomer rastu). */
          font-size: calc(var(--hero-fs, 40px) * 0.324);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1;
        }
        /* Milión je to jediné číslo v pilulke — na tmavom ho nesie ČISTÉ zlato
           (jasnejšie než okolitý text), aby oko vedelo, čo si má odniesť.
           Na papyruse to isté robil najtmavší lapis; princíp je rovnaký —
           dôraz robí kontrast voči podkladu, nie iná farba. */
        .hero-goal-pill b {
          font-weight: 600;
          font-size: 1.14em;
          color: #F5C73D;
          letter-spacing: 0.05em;
        }
        /* Labka v srdiečku z hand-drawn kitu (heartpaw.svg, viewBox 341×306,
           preto NIE je štvorcová — výška sa dopočíta z pomeru strán).
           ⚠️ fill: currentColor na path, aby ikonka dedila inkoust
           pilulky; kit má tvary plné, nie obrysové. */
        .hero-goal-globe {
          width: 1.62em;
          height: calc(1.62em * 306 / 341);
          flex: 0 0 auto;
          color: rgba(239,215,154,0.78);
        }

        /* Riadok pod pilulkou — VETA, nie údaj. Bez rámu, bez pozadia.
           🔴 ČÍSLO JE LAPIS, NIE ZLATO (Matej 27. 8. 2026: *„urob to lapisom
           a výrazné, to číslo # je zlaté a je skoro neviditeľné, to musí byť
           výraznejšie"*).
           ⚠️ A NIE JE TO VKUS, JE TO PRAVIDLO, KTORÉ TU UŽ STOJÍ ZAPÍSANÉ:
           „ŽIADNY ZLATÝ GRADIENT DO PÍSMEN" (DogPlanetLab.tsx, .ph-h1). Zlatý
           prebeh má strednú zarážku svetlejšiu než papyrus, takže presne stred
           slova — pri dvojcifernom čísle prakticky celé — splynie s podkladom.
           Prebeh gold-shimmer tým pádom zanikol aj tu: hýbal niečím, čo nebolo
           vidieť. Zlato na stene ostáva na TMAVOM (portál, nav), na papyruse
           nesie kontrast lapis. */
        .hero-goal-you {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: calc(var(--hero-fs, 40px) * 0.245);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1;
          color: rgba(10,26,74,0.62);
        }
        .hero-goal-you b {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 2.55em;
          letter-spacing: 0.01em;
          margin-left: 0.26em;
          vertical-align: -0.17em;
          color: #16307A;
          /* Halo je BIELE a tesné — dvíha hranu čísla nad papyrusom bez toho,
             aby ho zafarbilo. Nie je to tieň pod textom, je to svetlo za ním. */
          text-shadow:
            0 0 8px rgba(255,255,255,0.95),
            0 0 20px rgba(255,255,255,0.75),
            0 1px 0 rgba(255,255,255,0.9);
        }

        /* ── TELEFÓN ────────────────────────────────────────────────────
           🔴 ČITATEĽNOSŤ, NIE KOZMETIKA. Karty sú pod 768 px menšie o ďalšiu
           tretinu (MScale), takže voľná šírka bunky spadne z 306 na 205 px —
           a s ňou celý hero, ktorý sa z nej počíta. Pri pôvodnom násobku tam
           z pilulky ostalo 6,5 px vysadeného textu.
           Riešenie je pustiť pilulku do DVOCH RIADKOV: berie polovičnú šírku,
           takže písmo môže NARÁSŤ namiesto toho, aby sa zmenšovalo.
           ⚠️ 767.98px, nie 720: hranica MUSÍ sedieť s MScale, ktorá sa v tomto
           súbore počíta z window.innerWidth pod 768. */
        @media (max-width: 767.98px) {
          .hero-goal-pill {
            white-space: normal;
            text-align: center;
            font-size: calc(var(--hero-fs, 40px) * 0.45);
            padding: 0.7em 1.1em;
            letter-spacing: 0.11em;
          }
          .hero-goal-globe { display: none; }
          .hero-goal-you {
            font-size: calc(var(--hero-fs, 40px) * 0.315);
            letter-spacing: 0.11em;
          }
        }

        .join-btn {
          display: inline-block;
          text-decoration: none;
          margin-top: 6px;
          padding: 16px 40px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250, 244, 236, 0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.98rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow:
            0 0 24px rgba(255, 200, 90, 0.65),
            0 0 60px rgba(230, 158, 26, 0.50),
            0 0 110px rgba(230, 158, 26, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 240, 200, 0.45);
          transition: transform 0.2s, box-shadow 0.25s, opacity 0.22s;
          animation: joinBtnPulse 3.2s ease-in-out infinite;
        }
        .join-btn:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px rgba(255, 215, 110, 0.85),
            0 0 90px rgba(230, 158, 26, 0.70),
            0 0 150px rgba(230, 158, 26, 0.40),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }
        .join-btn:active { transform: scale(0.98); }

        ${PORTAL_CSS}

        /* ── VARIANT B: PRÁZDNA DLAŽDICA NA ZÁPIS PSA ──────────────────────
           Dedí .dog-card (rozmer + pozícia v mriežke), mení len výplň a obsah.
           Rozmery preto NIE SÚ zapísané znova — to je celý dôvod, prečo je to
           bunka mriežky a nie prvok v hero. */
        .enroll-card {
          overflow: hidden;
          background: linear-gradient(160deg, #2a2014, #12100c);
          border: 2px dashed rgba(201,154,63,0.6);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.45), 0 10px 34px rgba(0,0,0,0.4);
          transition: border-color 0.25s, box-shadow 0.25s;
          cursor: pointer;
        }
        .enroll-card:hover {
          border-color: rgba(245,199,61,0.95);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.45), 0 0 44px rgba(230,158,26,0.35), 0 10px 34px rgba(0,0,0,0.4);
        }

        /* PORTÁL V MRIEŽKE. Bunka prestáva byť kartou a stáva sa len držiakom —
           vlastný rám, výplň aj tieň má portál. Prerušovaný zlatý rám variantu B
           tým zanikol.
           ⚠️ overflow: visible je PODMIENKA, nie preferencia: plátno iskier je
           2,35× širšie než jadro a orezané v polovici vyzerá ako chyba.
           ⚠️ z-index dvíha dlaždicu nad susedov, aby iskry lietali PRES ne —
           bez toho by ich prekryla ktorákoľvek karta vykreslená neskôr. */
        .enroll-card--portal {
          overflow: visible;
          background: none;
          border: 0;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        /* 🔴 PREMENNÉ PATRIA NA .ph-portal, NIE NA KARTU. Portál si ich definuje
           SÁM NA SEBE, a vlastná deklarácia prvku prebije hodnotu zdedenú od
           rodiča — prepis na karte sa teda ticho zahodil a žiara ostala na 2,45×
           (637 px), teda presne to, čo Matej videl: *„nie je vôbec stiahnuté…
           žiara osvetľuje okolité fotky, stlm to."*
           PREČO menej než na guli: na guli má žiara za sebou otáčajúce sa fotky
           a musí ich prekryť; na stene sú susedia nepriehľadné karty, takže cezeň
           nič nepresvitá — a pri 260 px jadre siahala cez pol mriežky. */
        .enroll-card--portal .ph-portal {
          --ph-halok: 1.15;
          --ph-haloa: 0.35;
        }

        /* 🔴 KARTA NEMÁ VLASTNÝ HOVER. Matej 27. 8. 2026: *„pri dotyku myšou je bug"* —
           celá dlaždica zbelela. Nebol to portál: dog-card::after je bledý závoj
           rgba(251,245,230,0.82), ktorý na karte PSA odkrýva heroglyf, a
           dog-card:hover ju zväčšuje na 1,08. Na dlaždici, ktorá sama JE výzvou,
           je závoj cudzí a mierka by ťahala aj plátno iskier.
           Portál má vlastnú, jemnú odozvu (.ph-portal:hover .ph-add, 1,035). */
        .enroll-card--portal::after { content: none; }
        .enroll-card--portal:not(.is-open):hover {
          transform: none;
          box-shadow: none;
        }

        /* Tváre už zapísaných psov — čo tu pribudne, keď to naplníš. */
        .enroll-faces { position: absolute; inset: 0; }
        .enroll-face {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: 50% 40%;
          opacity: 0;
          filter: grayscale(1) contrast(0.85);
          animation: enrollFace ${ENROLL_FACES * 3}s ease-in-out infinite;
        }
        @keyframes enrollFace {
          0%   { opacity: 0;    transform: scale(1.07); }
          4%   { opacity: 0.22; }
          16%  { opacity: 0.22; }
          20%  { opacity: 0;    transform: scale(1); }
          100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .enroll-face { animation: none; opacity: 0.15; }
        }

        .enroll-body {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          padding: 14px;
          text-align: center;
        }
        .enroll-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.98rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #F5C73D;
          text-shadow: 0 2px 12px rgba(0,0,0,0.8);
          margin: 0;
          transition: opacity 0.2s;
        }

        /* Plus — kreslený, nie znak z fontu (Cinzel má „+" úzke a nízke). */
        .enroll-plus {
          position: relative;
          width: 30%; aspect-ratio: 1;
          transition: opacity 0.2s, transform 0.25s;
        }
        .enroll-plus::before, .enroll-plus::after {
          content: '';
          position: absolute; left: 50%; top: 50%;
          background: #F5C73D;
          border-radius: 3px;
          box-shadow: 0 0 18px rgba(230,158,26,0.6);
        }
        .enroll-plus::before { width: 6px; height: 100%; margin: -50% 0 0 -3px; }
        .enroll-plus::after  { height: 6px; width: 100%; margin: -3px 0 0 -50%; }
        /* :not() je nutné — .enroll-card:hover .enroll-plus má vyššiu špecificitu
           než .is-named .enroll-plus a plus by po zápise svietil CEZ meno psa. */
        .enroll-card:not(.is-named):not(.is-typing):hover .enroll-plus {
          transform: scale(1.08);
        }

        /* Pole leží NA dlaždici — žiadna medzistránka medzi sľubom a splnením. */
        .enroll-input {
          position: absolute;
          left: 10%; width: 80%;
          top: 50%; transform: translateY(-50%);
          padding: 10px 4px;
          background: transparent;
          border: none;
          border-bottom: 2px solid rgba(245,199,61,0.75);
          outline: none;
          text-align: center;
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.45rem;
          color: #FFF4C2;
          opacity: 0; pointer-events: none;
          transition: opacity 0.22s;
        }
        .enroll-input::placeholder {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-size: 0.9rem;
          letter-spacing: 0.06em;
          color: rgba(255,244,194,0.5);
          text-transform: none;
        }
        .is-typing .enroll-plus, .is-typing .enroll-label, .is-typing .enroll-num { opacity: 0; }
        .is-typing .enroll-input { opacity: 1; pointer-events: auto; }

        /* Meno psa = Cinzel Decorative (brand lock: meno PSA na oficiálnom povrchu). */
        .enroll-name {
          position: absolute;
          left: 8%; width: 84%;
          top: 46%; transform: translateY(-50%);
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.6rem;
          line-height: 1.15;
          color: #FFF4C2;
          text-shadow: 0 0 26px rgba(230,158,26,0.55);
          opacity: 0;
          transition: opacity 0.3s;
          word-break: break-word;
        }
        .enroll-num {
          position: absolute;
          left: 50%; bottom: 10%;
          transform: translateX(-50%);
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.12em;
          color: rgba(245,199,61,0.85);
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
          transition: opacity 0.3s;
        }
        .enroll-go {
          position: absolute;
          left: 50%; bottom: 8%;
          transform: translateX(-50%);
          padding: 12px 26px;
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          border: 1px solid rgba(250,244,236,0.40);
          border-radius: 8px;
          color: #000;
          font-family: 'Cinzel', serif;
          font-size: 0.84rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 0 24px rgba(255,200,90,0.55), inset 0 1px 0 rgba(255,255,255,0.45);
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s;
        }

        /* Meno je na stene — sľub „zapíš psa" splnený. Až TERAZ sa ide ďalej. */
        .enroll-card.is-named {
          border-style: solid;
          border-color: rgba(245,199,61,0.95);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.45), 0 0 52px rgba(230,158,26,0.45), 0 10px 34px rgba(0,0,0,0.4);
          cursor: default;
        }
        .is-named .enroll-plus, .is-named .enroll-label, .is-named .enroll-num { opacity: 0; }
        .is-named .enroll-name { opacity: 1; }
        .is-named .enroll-face { animation-play-state: paused; opacity: 0.12; }
        .is-named .enroll-go { opacity: 1; pointer-events: auto; }

        /* A/B prepínač (DEV) */
        /* ⚠️ Vľavo DOLE nefunguje — cez celú spodnú hranu leží .consent-banner
           a prepínač sa cezeň nedá kliknúť, kým človek neodklepne cookies
           (chytené Playwrightom: „consent-banner intercepts pointer events"). */
        .ab-switch {
          position: fixed;
          left: 20px; top: 62px;
          z-index: 60;
          display: flex;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(201,154,63,0.55);
          background: rgba(10,8,5,0.88);
          box-shadow: 0 6px 22px rgba(0,0,0,0.45);
        }
        .ab-switch button {
          padding: 7px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: rgba(255,244,220,0.6);
          transition: background 0.2s, color 0.2s;
        }
        .ab-switch button.is-on {
          background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
          color: #1a1206;
        }
        @keyframes joinBtnPulse {
          0%, 100% {
            box-shadow:
              0 0 24px rgba(255, 200, 90, 0.55),
              0 0 60px rgba(230, 158, 26, 0.42),
              0 0 110px rgba(230, 158, 26, 0.22),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 34px rgba(255, 215, 110, 0.85),
              0 0 84px rgba(230, 158, 26, 0.62),
              0 0 140px rgba(230, 158, 26, 0.38),
              inset 0 1px 0 rgba(255, 255, 255, 0.55);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .join-btn { animation: none; }
        }
        .hero-count {
          display: inline-flex;
          align-items: center;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.16em;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          text-transform: uppercase;
          text-shadow: 0 0 14px rgba(0,0,0,0.85);
          padding: 6px 16px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 999px;
          background: rgba(8,8,8,0.55);
          box-shadow: 0 0 16px rgba(201,154,63,0.2), 0 0 12px rgba(0,0,0,0.85);
          backdrop-filter: blur(6px);
        }
        .hero-count-num {
          background: linear-gradient(180deg, #F4C75A 0%, #D8821F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }
        .hero-count-sep { color: rgba(255,255,255,0.55); margin: 0 4px; }
        .hero-count-total { color: rgba(255,255,255,0.7); }
        /* inline-flex oseká holú medzeru pred „DOGS" → vlastná medzera cez margin */
        .hero-count-dogs { margin-left: 0.45em; }

        /* ── Hektor — fixed founder card, gold frame + glow ── */
        .hektor-card {
          box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28);
          animation: hektor-glow-loop 4.5s ease-in-out infinite;
          z-index: 4;
        }
        .hektor-card:not(.is-open):hover {
          transform: scale(1.06);
          box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 90px rgba(216,130,31,0.85),
            0 0 200px rgba(216,130,31,0.45);
        }
        @keyframes hektor-glow-loop {
          0%, 100% { box-shadow:
            0 0 0 3px rgba(196,155,66,0.95),
            0 0 60px rgba(216,130,31,0.55),
            0 0 130px rgba(216,130,31,0.28); }
          50%      { box-shadow:
            0 0 0 3px rgba(244,199,90,1),
            0 0 80px rgba(216,130,31,0.75),
            0 0 170px rgba(216,130,31,0.38); }
        }
        .hektor-label {
          background: linear-gradient(180deg, rgba(196,155,66,0.92) 0%, rgba(154,114,40,0.92) 100%);
          color: #15080a;
          font-weight: 900;
          letter-spacing: 0.12em;
          box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* ── Hektor heroglyph — hover only, centered ── */
        .hektor-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 1; }
        .is-dragging .hektor-heroglyph-wrap { opacity: 0 !important; }
        .hektor-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Real dog heroglyph — hover only, centered ── */
        .dog-heroglyph-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 32px);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 220ms ease;
        }
        .dog-card:not(.is-open):hover .dog-heroglyph-wrap { opacity: 1; }
        .is-dragging .dog-heroglyph-wrap { opacity: 0 !important; }
        .dog-heroglyph {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }

        /* ── Reveal card (in grid) ── */
        .reveal-card-inner {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: 50% 30%;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0ms;
        }
        .reveal-card.reveal-active .reveal-card-inner {
          opacity: 1;
          transition: opacity 800ms ease;
        }
        .reveal-card-fallback {
          background: linear-gradient(135deg, hsl(224 40% 18%), hsl(45 60% 30%));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .reveal-card-fallback .cartouche {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 6vw, 2rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: hsl(45 90% 60%);
        }

        /* Card gold glow on reveal */
        @keyframes card-entrance {
          0%   { box-shadow: none; transform: scale(0.9); }
          40%  { transform: scale(1.07);
                 box-shadow: 0 0 0 3px rgba(196,155,66,0.9),
                             0 0 100px rgba(196,155,66,0.95),
                             0 0 200px rgba(196,155,66,0.5); }
          70%  { transform: scale(0.98); }
          100% { transform: scale(1);
                 box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                             0 0 50px rgba(196,155,66,0.45),
                             0 0 100px rgba(196,155,66,0.2); }
        }
        @keyframes card-glow-loop {
          0%,100% { box-shadow: 0 0 0 2px rgba(196,155,66,0.55),
                                0 0 50px rgba(196,155,66,0.45),
                                0 0 100px rgba(196,155,66,0.2); }
          50%     { box-shadow: 0 0 0 3px rgba(196,155,66,0.75),
                                0 0 70px rgba(196,155,66,0.65),
                                0 0 140px rgba(196,155,66,0.3); }
        }
        .reveal-card.reveal-active {
          animation: card-entrance 1.4s cubic-bezier(0.34,1.3,0.64,1) forwards,
                     card-glow-loop 4s ease-in-out 1.4s infinite;
          z-index: 10;
        }

        /* ── Reveal sequence overlay ── */
        .rev-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080808;
          pointer-events: none;
          transition: none;
        }
        .rev-overlay.step-2 { background: transparent; }
        .rev-overlay.step-3 { background: transparent; }

        .rev-spotlight {
          position: absolute;
          top: 50%; left: 50%;
          width: 360px; height: 360px;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 0 9999px #080808;
          pointer-events: none;
          opacity: 0;
          border-radius: 12px;
        }
        .rev-overlay.step-2 .rev-spotlight {
          opacity: 1;
          transition: none;
        }
        .rev-overlay.step-3 .rev-spotlight {
          opacity: 0;
          transition: opacity 1400ms ease;
        }

        .rev-big-symbol {
          width: 420px;
          height: auto;
          object-fit: contain;
          pointer-events: none;
          animation: symbol-burn 2s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
          will-change: transform, opacity, filter;
        }
        .rev-overlay.step-2 .rev-big-symbol,
        .rev-overlay.step-3 .rev-big-symbol {
          opacity: 0 !important;
          transition: opacity 400ms ease;
          animation: none;
        }

        /* ── Filter / find dog by number ── */
        .filter-btn {
          z-index: 50;
          width: 40px; height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          color: rgba(0,0,0,0.7);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: border-color 150ms, opacity 150ms;
        }
        .filter-btn:hover { opacity: 0.75; }
        .filter-btn.active { border-color: rgba(0,0,0,0.35); }

        /* Numpad overlay — dims the screen, centered beige keypad (no native keyboard) */
        .numpad-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease;
        }
        .numpad-overlay.open { opacity: 1; pointer-events: auto; }
        .numpad {
          width: min(80vw, 290px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 16px 56px rgba(0,0,0,0.55);
          transform: scale(0.92);
          transition: transform 200ms ease;
        }
        .numpad-overlay.open .numpad { transform: scale(1); }
        .numpad-display {
          height: 54px;
          margin-bottom: 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(201,154,63,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.7rem;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.82);
        }
        .numpad-display .ph {
          color: rgba(0,0,0,0.3);
          font-size: 1rem;
          letter-spacing: 0.08em;
        }
        .numpad-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .numpad-key {
          height: 52px;
          border-radius: 10px;
          border: 1px solid rgba(201,154,63,0.4);
          background: rgba(255,255,255,0.38);
          color: rgba(0,0,0,0.8);
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.3rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition: background 120ms, transform 80ms;
        }
        .numpad-key:active {
          transform: scale(0.95);
          background: rgba(201,154,63,0.28);
        }
        .numpad-key--cancel {
          color: #CF3A2E;
          border-color: rgba(207,58,46,0.45);
          background: rgba(207,58,46,0.08);
        }
        .numpad-key--enter {
          color: #2E9E4F;
          border-color: rgba(46,158,79,0.5);
          background: rgba(46,158,79,0.10);
        }

        /* ── Wide numpad: search (numpad) + country stats side by side ── */
        .numpad--wide { width: min(92vw, 560px); }

        .numpad-body {
          display: grid;
          grid-template-columns: 258px 1fr;
          gap: 18px;
          align-items: stretch;
        }
        .numpad-search { min-width: 0; }
        .numpad-countries {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border-left: 1px solid rgba(201,154,63,0.3);
          padding-left: 18px;
        }
        .numpad-countries-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.55);
          margin-bottom: 12px;
        }
        .numpad-countries-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          max-height: 300px;
        }
        .ncountry-row {
          display: grid;
          grid-template-columns: 26px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 9px;
          background: rgba(255,255,255,0.34);
          border: 1px solid rgba(201,154,63,0.28);
        }
        .ncountry-flag { font-size: 1.15rem; line-height: 1; }
        .ncountry-code {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          color: rgba(0,0,0,0.8);
        }
        .ncountry-count {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: rgba(201,154,63,1);
          min-width: 1.4em;
          text-align: right;
        }
        /* Mobile: countries on TOP, numpad below (palec dosiahne numpad → ľahšie písanie) */
        @media (max-width: 520px) {
          .numpad--wide { width: min(88vw, 320px); }
          .numpad-body { grid-template-columns: 1fr; gap: 14px; }
          .numpad-countries {
            order: -1;
            border-left: none;
            padding-left: 0;
          }
          .numpad-countries-list { max-height: 264px; } /* ~5 krajín viditeľných */
          .numpad-search {
            border-top: 1px solid rgba(201,154,63,0.3);
            padding-top: 14px;
          }
        }

        /* ── KALKULAČKA NAD GUĽOU — TEN ISTÝ PANEL, INÉ UKOTVENIE ───────────
           ⚠️ Panel sa NEPREKRESĽUJE (Matej 25. 8.: „kalkulačku si nemal meniť,
           mala ostať taká aká je aj v gride"). Prvé kolo ju tu zúžilo, zmenšilo
           displej a schovalo zoznam krajín — to bola úprava, ktorú nikto nepýtal.
           Mení sa VÝHRADNE ukotvenie: zmizne závoj (inak by nebolo vidno kartu,
           ktorá sa vpravo mení) a panel ide k ľavému okraju, kde má stáť.
           🔴 pointer-events:none na obale je NUTNOSŤ, nie kozmetika: overlay kryje
           celé okno, takže by inak zožral každý klik do gule a psa by sa nedalo
           vybrať myšou. Chytá len samotný panel. */
        /* ⚠️ DVOJITÁ TRIEDA NIE JE OZDOBA. Pravidlo .numpad-overlay.open zapína
           pointer-events: auto a má vyššiu váhu než samotné --planet, takže
           obal ďalej chytal KAŽDÝ klik do gule a psa sa nedalo vybrať myšou
           (dispatch v konzole to nechytí — ten cieľ obchádza). */
        .numpad-overlay.numpad-overlay--planet {
          background: transparent;
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
          justify-content: flex-start;
          padding-left: 16px;
          pointer-events: none;
        }
        /* ⚠️ IBA V OTVORENOM STAVE (Matej 27. 8. 2026: *„ak kliknem na fotku v globe,
           posunie ju doľava a blok s detailom psa doprava, avšak v tomto momente
           nejde kliknúť na CTA"*). Bez triedy .open chytal klik aj ZAVRETÝ pult —
           je priehľadný (opacity 0), ale ako plocha 515 × 336 px stále existuje
           a leží pri ľavom okraji. Kým guľa stojí v strede, nikoho neruší; len čo
           sa pri otvorení detailu psa odsunie doľava, CTA vojde presne pod neho
           a prestane sa dať kliknúť. Zavretý pult si pointer-events none
           zdedí od obalu, takže tu netreba nič dopisovať. */
        .numpad-overlay.numpad-overlay--planet.open .numpad { pointer-events: auto; }
        /* Na mobile príde karta psa ZHORA, takže pult ide dole — inak by si
           stáli na tom istom mieste. */
        @media (max-width: 760px) {
          .numpad-overlay--planet { align-items: flex-end; padding-bottom: 84px; }
        }

        /* ── Bottom bar: filter + center (+ flag on mobile), centered as a row ── */
        .gods-bottom-bar {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .center-btn-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          color: rgba(0,0,0,0.7);
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          padding: 0;
        }
        .center-btn-mobile:hover { opacity: 0.85; }

        /* Flag pill — bottom bar, mobile only (desktop keeps it in the top nav) */
        .lang-btn-mobile {
          display: none;
          align-items: center;
          justify-content: center;
          height: 40px;
          padding: 0 10px;
          border-radius: 999px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.45);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .lang-btn-mobile .lang-picker--flow .lang-trigger { color: rgba(0,0,0,0.72); padding: 0; }
        .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(0,0,0,0.5); }

        @media (max-width: 768px) {
          /* Horný nav má mobilné pravidlá v ráme (LabShell). Tu ostáva len to,
             čo patrí spodnej lište. */
          .lang-btn-mobile { display: flex; }

          /* Mobil center hero: zmenšené logo + CTA, zvýraznený počet psov */
          .center-hero { gap: 13px; }
          .hero-logo-icon { width: 108px; height: 108px; } /* -10% */
          .join-btn {
            padding: 11px 28px;       /* -30% */
            font-size: 0.69rem;       /* -30% */
            letter-spacing: 0.12em;
          }
          /* počet psov: badge je globálny, mobil len zmenší (menší než CTA) */
          .hero-count {
            font-size: 0.92rem;
            padding: 5px 14px;
          }
          .hero-count-num { font-size: 1.05rem; }

          /* Hekthor open overlay: menšia karta → menší heroglyf + tesnejší text,
             aby sa dlhá osobná správa zmestila bez orezania. */
          .card-open-overlay { padding: 12px; gap: 6px; }
          .card-open-heroglyph { width: 34%; }
          .card-open-name { font-size: 0.82rem; }
          .card-open-msg { font-size: 0.62rem; line-height: 1.45; }
        }
        .hero-count-globe {
          width: 15px; height: 15px;
          color: #E2B45C;
          margin-right: 7px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 5px rgba(201,154,63,0.45));
        }

        /* ── Touch devices: skip hover preview → tap goes straight to info ── */
        @media (hover: none) {
          .dog-card:not(.is-open):hover {
            transform: none !important;
            box-shadow: none !important;
          }
          .dog-card:not(.is-open):hover::after { opacity: 0 !important; }
          .dog-card:not(.is-open):hover .card-rank-top,
          .dog-card:not(.is-open):hover .card-flag,
          .dog-card:not(.is-open):hover .card-name-block { opacity: 1 !important; }
          .dog-card:not(.is-open):hover .dog-heroglyph-wrap,
          .hektor-card:not(.is-open):hover .hektor-heroglyph-wrap { opacity: 0 !important; }
          .hektor-card:not(.is-open):hover { transform: none !important; }
        }

        @keyframes symbol-burn {
          0%   { opacity: 0;
                 filter: invert(1) brightness(0.2) blur(20px);
                 transform: scale(0.15); }
          12%  { opacity: 0.4;
                 filter: invert(1) brightness(0.6) blur(6px);
                 transform: scale(0.55); }
          28%  { opacity: 1;
                 filter: invert(1) brightness(4)
                   drop-shadow(0 0 50px #FFF)
                   drop-shadow(0 0 100px #FFD700)
                   drop-shadow(0 0 200px rgba(196,155,66,0.9));
                 transform: scale(1.25); }
          48%  { filter: invert(1) brightness(2.5)
                   drop-shadow(0 0 35px rgba(255,210,60,0.9))
                   drop-shadow(0 0 90px rgba(196,155,66,0.6));
                 transform: scale(0.9); }
          70%  { transform: scale(1.05); }
          85%  { transform: scale(0.98); }
          100% { opacity: 1;
                 filter: invert(1) brightness(1.4)
                   drop-shadow(0 0 25px rgba(196,155,66,0.8))
                   drop-shadow(0 0 70px rgba(196,155,66,0.4));
                 transform: scale(1); }
        }

        /* ════════════════════════════════════════════════════════════════
           TMAVÁ BEZ ŽIARY ('darkcalm') — kontrolná vzorka k feedbacku
           „vyzerá to ako podvod" (Matej 2026-08-09: povedal PODVOD, nie tmavé).
           Hypotéza: dojem crypto/NFT mintu nerobí čierne pozadie, ale
           čierna + zlatá + PULZUJÚCA ŽIARA + veľký číselník. Tu ostáva
           všetko ako dnes, zhasnú sa len vždy-zapnuté žiary a pulzy.
           Hover žiara heroglyfov ostáva — tá nie je súčasťou prvého dojmu.
           ════════════════════════════════════════════════════════════════ */
        .theme-darkcalm .join-btn {
          box-shadow:
            0 8px 24px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.35);
          text-shadow: none;
          animation: none;
        }
        .theme-darkcalm .join-btn:hover {
          box-shadow:
            0 10px 30px rgba(0,0,0,0.62),
            inset 0 1px 0 rgba(255,255,255,0.45);
        }
        /* Hektor si nechá zlatý rám (jediný signál že je founder), stratí len žiaru a pulz */
        .theme-darkcalm .hektor-card {
          box-shadow: 0 0 0 2px rgba(196,155,66,0.85);
          animation: none;
        }
        .theme-darkcalm .hektor-card:not(.is-open):hover {
          box-shadow: 0 0 0 2px rgba(244,199,90,1);
        }
        .theme-darkcalm .hero-logo-icon { filter: none; }
        .theme-darkcalm .hero-tagline .gold {
          animation: none;
          background-position: 50% 0;
          filter: none;
        }
        .theme-darkcalm .hero-count {
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
        }

        /* ════════════════════════════════════════════════════════════════
           LAB — PAPYRUSOVÁ WALL (25. 8. 2026)
           Beh 1: (a) čisté papyrusové pozadie — žiadna heroglyfová textúra,
           žiadny multiply tint, len náš papyrus; (b) horná aj dolná lišta
           BLEDÁ so zlatým okrajom (tmavé sklo z augustového experimentu je
           preč — Matej: „nie tmavé ale bledé s okrajom").
           Karty psov sú fotky → tie sa nemenia, mení sa iba „chrome".
           ════════════════════════════════════════════════════════════════ */
        .gods-root.theme-light { background-color: #F3E4C4; }
        /* Čistý papyrus: prepisujeme obrázok steny gradientom (background shorthand
           zároveň zruší size/position/repeat zo základu) a vypíname blur. */
        .gods-root.theme-light::before {
          inset: 0;
          background:
            radial-gradient(125% 100% at 50% 38%,
              #FDF8EC 0%,
              #F8EDD6 34%,
              #F1E1BE 64%,
              #E6D2A6 100%);
          filter: none;
        }
        /* ::after (multiply tint nad textúrou) v labe NEEXISTUJE — nie je čo tónovať. */

        /* Hero — BEZ oparu. center-hero::before je elipsa s inset -200px -320px,
           ktorá leží NAD kartami (hero má z-index 2) — v tmavej verzii je čierna a
           splynie s pozadím, v bledej by susedné fotky vybielila (Matej 25. 8.:
           „fotiek sa to nesmie dotýkať"). Susedná karta je od stredu 244 px, závoj
           dosahoval ~465 px. Zmenšovať ho netreba: na čistom papyruse nemá čo
           prekrývať a polomer by sa musel dopočítavať voči MScale na mobile.
           Presvit zo stredu ostáva — ale ako gradient POZADIA, teda pod kartami. */
        .theme-light .center-hero::before { display: none; }
        .theme-light .center-hero::after {
          border-color: rgba(140,96,20,0.9);
          box-shadow: 0 0 24px rgba(140,96,20,0.30);
        }
        /* Logo čierne namiesto zlatého (rovnaký súbor, len odfarbený) */
        .theme-light .hero-logo-icon {
          filter: brightness(0) drop-shadow(0 2px 10px rgba(80,55,15,0.22));
        }
        .theme-light .hero-tagline { color: rgba(35,22,8,0.62); }
        /* ⚠️ background shorthand resetuje background-clip → musí sa zopakovať,
           inak sa z gradientového textu stane plná zlatá plocha. */
        .theme-light .hero-tagline .gold {
          background: linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: none;
        }

        /* ── NADPIS HERA NA PAPYRUSE ────────────────────────────────────
           Rovnaký inkoust ako na guli: plná tmavá, nie alfa — cez fotky
           susedných kariet sa každé percento priehľadnosti prejaví ako
           vyblednutie. Halo je krémové a hlavne HUSTÉ (blízke vrstvy s alfou
           1), nie široké: rozostrené svetlo je pri veľkom polomere riedke.
           ⚠️ Polomery sú menšie než na guli úmerne k písmu — nadpis tu má
           ~55 px proti ~74 px a ďaleké vrstvy by inak siahali na fotky.
           ⚠️ ŽIADNY ZLATÝ GRADIENT DO PÍSMEN: LAB.goldText má strednú zarážku
           svetlejšiu než papyrus, takže slovo v strede zmizne. */
        .theme-light .hero-h1 {
          color: #23150a;
          text-shadow:
            0 0 5px rgba(253,248,236,1),
            0 0 11px rgba(253,248,236,1),
            0 0 22px rgba(253,248,236,1),
            0 0 44px rgba(253,248,236,1),
            0 0 76px rgba(253,248,236,0.96),
            0 0 130px rgba(253,248,236,0.8);
        }
        /* Zlaté slová držia o 50 % silnejšie halo — to isté pravidlo ako na
           guli (Matej 27. 8.: „pridaj o 50% halo viac pri slove dog a god").
           ⚠️ Píše sa CELÝ zoznam, nie prídavok: text-shadow sa dedí, ale
           nesčítava — deklarácia tu nahradí zdedenú. */
        .theme-light .hero-h1 .g {
          color: #6E4A12;
          text-shadow:
            0 0 8px rgba(255,255,255,1),
            0 0 17px rgba(255,255,255,1),
            0 0 34px rgba(255,255,255,0.98),
            0 0 66px rgba(253,248,236,0.9),
            0 0 120px rgba(253,248,236,0.7);
        }
        .theme-light .hero-lead {
          color: rgba(35,22,8,0.82);
          text-shadow:
            0 0 4px rgba(253,248,236,1),
            0 0 10px rgba(253,248,236,1),
            0 0 22px rgba(253,248,236,1),
            0 0 44px rgba(253,248,236,0.95);
        }

        /* ── BLEDÉ LIŠTY (horná aj dolná) ────────────────────────────────
           Základná (tmavá) wall má pilulky už papyrusové — na papyrusovom
           podklade by ale splynuli, takže sa dvíha kontrast RÁMOM a TIEŇOM,
           nie prefarbením: výplň o odtieň svetlejšia než pozadie, okraj plná
           zlatá 1.5px + zlatý halo ring (jazyk bledých blokov z /entry),
           tieň teplo-hnedý, nie čierny. */
        /* Bledá pilulka — po nasadení zlatého navu ju nesie už len počítadlo
           pod CTA (nav prvky si berú zlatý odliatok nižšie). */
        .theme-light .hero-count {
          background: linear-gradient(135deg, #FDF8EC 0%, #F7EBD2 55%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow:
            0 6px 20px rgba(96,66,18,0.16),
            0 0 0 3px rgba(201,154,63,0.13),
            inset 0 1px 0 rgba(255,255,255,0.65);
          color: rgba(42,22,8,0.86);
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
        .theme-light .filter-btn,
        .theme-light .center-btn-mobile,
        .theme-light .filter-btn.active { border-color: #8C6014; }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger { color: #2a1608; }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(42,22,8,0.55); }

        /* Počet psov pod CTA — tá istá bledá pilulka, len čísla držia zlatý gradient */
        .theme-light .hero-count { text-shadow: none; }
        .theme-light .hero-count-num {
          background: linear-gradient(180deg, #C9871F 0%, #8C5A11 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .theme-light .hero-count-sep { color: rgba(42,22,8,0.35); }
        .theme-light .hero-count-total { color: rgba(42,22,8,0.62); }
        .theme-light .hero-count-globe { color: #A3782B; }

        /* ══════════════════════════════════════════════════════════════
           ZLATÝ NAV — ten istý, čo má /pack (Matej 25. 8.: „prerob horný nav
           aj spodný na ten čo máme v deve, ten nový druh").
           Tokeny sa NEOPISUJÚ — idú z components/pack/navGoldSkin.ts, aby bar
           na stene a bar v appke ostali JEDEN bar. Skladba je z predlohy:
             RÁM (leštené zlato + tmavý obrys) → DOSKA (pieskovec, vlastný obrys,
             zapustená) → ZRNO (tmavé v pozadí, svetlé cez ::after) → OBSAH.
           V Reacte to sú tri vnorené divy; tu sú to ::before/::after, preto musí
           mať každý nosič position:relative a obsah z-index:1.
           ══════════════════════════════════════════════════════════════ */
        /* ⚠️ position do tejto skupiny NEPATRÍ — spodný bar aj prepínač sú
           fixed (a tým samy tvoria kotvu pre ::before/::after). Keď som im sem
           napísal relative, vypadli z fixovania: bar sa vysypal hore a roztiahol
           na celú šírku. Kotvu potrebuje dorobiť len horný nav (je static). */
        /* ⚠️ Doska aj zrno idú na z-index -1, NIE 0. Text v prepínači tém je HOLÝ
           TEXTOVÝ UZOL (nie element), takže sa nedá zdvihnúť cez z-index a doska
           s kladným indexom ho prekryla — z pilulky ostala prázdna zlatá plocha.
           Záporná vrstva sa kreslí nad pozadím prvku, ale pod jeho textom.
           Podmienka: nosič musí byť vlastný stacking context (isolation), inak
           by záporná vrstva padla až za rám. */
        .theme-light .gods-bottom-bar { isolation: isolate; }
        .theme-light .gods-bottom-bar {
          background: ${NAV_FRAME_BG};
          background-blend-mode: ${NAV_FRAME_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          border-radius: ${NAV_R.frame}px;
          box-shadow: ${NAV_FRAME_SHADOW};
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
        /* DOSKA */
        .theme-light .gods-bottom-bar::before {
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
        /* SVETLÉ ZRNO nad doskou */
        .theme-light .gods-bottom-bar::after {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          ${NAV_GRAIN_SCREEN_CSS}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .theme-light .gods-bottom-bar > * { position: relative; z-index: 1; }

        /* Spodný bar — jeden odliatok, tlačidlá v ňom sú pilulky na doske
           (v predlohe kruh „G"), preto strácajú vlastný rám. */
        .theme-light .gods-bottom-bar { padding: ${NAV_R.rim + 4}px ${NAV_R.rim + 6}px; gap: 10px; }
        .theme-light .gods-bottom-bar .filter-btn,
        .theme-light .gods-bottom-bar .center-btn-mobile,
        .theme-light .gods-bottom-bar .lang-btn-mobile {
          background: ${NAV_GOLD.activeFill};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
        }
        .theme-light .gods-bottom-bar .filter-btn.active { border-color: ${NAV_GOLD.edge}; }

        /* ── LISTA V REZIME FILMU: NASTROJE ⇄ CTA CHIP ────────────────────
           Ikonky sa NEVYPINAJU cez display — zbalia sa na nulovu sirku a chip
           sa na ich mieste rozvinie. Rozdiel je vidiet: pri display: none by
           lista skocila z jednej sirky na druhu, takto sa preleje a ram pod
           navom posobi ako jediny, ktory tam stal cely cas.
           Chip je odliatok aktivnej pilulky z HORNEHO navu (.main-nav
           button.is-on) — tie iste tokeny, aby to bola jedna rodina. */
        /* Portál lišty (viď prop portalDock) — obal len nesie theme-light,
           sám nesmie nič chytať ani kresliť. */
        .gods-dock-portal { position: relative; z-index: 58; pointer-events: none; }
        .gods-dock-portal .gods-bottom-bar { pointer-events: auto; }
        .gods-bottom-bar { transition: gap 380ms cubic-bezier(.22,.61,.36,1); }
        .gods-bottom-bar.has-cta { gap: 0; }
        .gods-bottom-bar .filter-btn,
        .gods-bottom-bar .center-btn-mobile,
        .gods-bottom-bar .lang-btn-mobile {
          transition: opacity 220ms ease, width 380ms cubic-bezier(.22,.61,.36,1),
                      padding 380ms cubic-bezier(.22,.61,.36,1);
        }
        .gods-bottom-bar.has-cta .filter-btn,
        .gods-bottom-bar.has-cta .center-btn-mobile,
        .gods-bottom-bar.has-cta .lang-btn-mobile {
          opacity: 0;
          width: 0;
          min-width: 0;
          padding-left: 0;
          padding-right: 0;
          border-width: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .gods-bottom-bar .gbb-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          flex-shrink: 0;
          border-radius: 999px;
          white-space: nowrap;
          text-decoration: none;
          cursor: pointer;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: ${NAV_GOLD.activeFill};
          border: 0 solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
          opacity: 0;
          max-width: 0;
          padding: 0;
          overflow: hidden;
          pointer-events: none;
          transition: opacity 240ms ease, max-width 420ms cubic-bezier(.22,.61,.36,1),
                      padding 420ms cubic-bezier(.22,.61,.36,1);
        }
        .gods-bottom-bar.has-cta .gbb-cta {
          opacity: 1;
          max-width: 360px;
          padding: 0 24px;
          border-width: ${NAV_R.line}px;
          pointer-events: auto;
        }
        .gods-bottom-bar.has-cta .gbb-cta:hover { opacity: 0.82; }
        @media (max-width: 768px) {
          .gods-bottom-bar .gbb-cta { font-size: 0.68rem; letter-spacing: 0.1em; }
          .gods-bottom-bar.has-cta .gbb-cta { padding: 0 18px; }
        }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger { color: ${NAV_GOLD.ink}; }
        .theme-light .lang-btn-mobile .lang-picker--flow .lang-trigger__chev { color: rgba(42,22,8,0.6); }

        /* ── HOVER na karte psa: bledý závoj + ČIERNY heroglyf (Matej 25. 8.) ──
           Tmavá stena mala opak: čierny závoj rgba(0,0,0,0.62) a glyf prefarbený
           na zlatú so žiarou. Na papyruse je čierny závoj cudzí prvok a zlatá žiara
           nemá kde svietiť. Alfa 0.82 je ladiaci gombík: nižšia = viac vidno fotku,
           vyššia = glyf čitateľnejší na tmavých fotkách.
           brightness(0) drží alfa kanál, takže z bieleho glyfu spraví čistý atrament. */
        .theme-light .dog-card::after { background: rgba(251,245,230,0.82); }
        .theme-light .dog-heroglyph,
        .theme-light .hektor-heroglyph {
          filter: brightness(0) drop-shadow(0 2px 8px rgba(80,55,15,0.18));
        }
        /* tieň zdvihnutej karty na papyruse — teplý, nie čierny.
           ⚠️ VÝNIMKA PRE PORTÁL: dlaždica CTA je priehľadná (vlastný rám a tieň
           nesie portál vnútri), takže tieň karty by okolo nej nakreslil obdĺžnik
           okolo ničoho. Vyňatie musí byť TU — pravidlo o triedu vyššie
           (.theme-light .dog-card) prebíja každý zápis pri .enroll-card--portal,
           nech je v súbore akokoľvek nižšie. */
        .theme-light .dog-card:not(.is-open):not(.enroll-card--portal):hover {
          box-shadow: 0 10px 34px rgba(96,66,18,0.22);
        }

        /* CTA SVIETI AJ NA PAPYRUSE (Matej 25. 8.: „nechaj gold svietenie na CTA").
           Papyrusová verzia tu mala žiaru stlmenú na obyčajný tieň a pulz vypnutý
           — tlačidlo tým splynulo so stenou rovnako ako predtým karta detailu.
           Override je preto zrušený: platí základná .join-btn so zlatou žiarou
           aj joinBtnPulse. Nič sa nekopíruje, len sa nič neprebíja. */
        /* Info overlay — papyrus namiesto čiernej */
        .theme-light .info-overlay { background: rgba(250,243,225,0.96); }
        .theme-light .info-content h2 { color: #2a1608; }
        .theme-light .info-content p { color: rgba(42,22,8,0.68); }
        .theme-light .info-close { background: rgba(42,22,8,0.10); color: #2a1608; }
        .theme-light .info-close:hover { background: rgba(42,22,8,0.20); }

      `}</style>

      <div className={`gods-root theme-${theme}`}>
        {/* A/B prepínač — DEV pieskovisko, Matej: „nech si to viem rýchlo prepnúť".
            Voľba prežije reload (localStorage), inak by sa pri každom uložení
            súboru vrátila na A. Sedí POD navom — dole ho zakrýva cookie lišta. */}
        <div className="ab-switch" role="group" aria-label="Variant steny">
          <button
            type="button"
            className={enrollOn ? '' : 'is-on'}
            onClick={() => { setEnrollOn(false); try { localStorage.setItem(ENROLL_KEY, '0'); } catch { /* private mode */ } }}
          >A · CTA</button>
          <button
            type="button"
            className={enrollOn ? 'is-on' : ''}
            onClick={() => { setEnrollOn(true); try { localStorage.setItem(ENROLL_KEY, '1'); } catch { /* private mode */ } }}
          >B · ZÁPIS PSA</button>
        </div>
        {/* HORNÝ NAV TU UŽ NIE JE — kreslí ho RÁM `components/lab/LabShell.tsx`.
            Stáli tu holé <a href="/vision|/religion|/about">, teda tvrdé načítanie
            celého webu pri každom kliku: nav sa vždy prekreslil a „nav zostáva,
            obsah sa swipne" bolo v tomto tvare nedosiahnuteľné. V ráme sú z nich
            tlačidlá a nav sa pri prepnutí sekcie neodmountuje.
            CSS navu (`.nav-top`, `.main-nav*`, `.nav-login*`) odišlo s ním —
            v projekte je JEDNA kópia, v ráme. Nepíš ju sem späť.
            ⚠️ Stráže `closest('.main-nav' | '.nav-login')` v `onMouseDown`
            a `onTouchEnd` nižšie ostávajú platné: pozerajú sa na triedu cieľa,
            nie na to, kto ju vykreslil. */}
        {/* Prepínač WALL tém (GOLD/CALM/PAPYRUS) tu STÁL a 25. 8. zanikol
            (Matej: „hore vpravo vymaž prepínač"). Podoba steny je teraz jedna
            konštanta `WALL_THEME` hore v súbore. */}

        {/* LOGIN — kruh vpravo hore. Tiež odišiel do rámu: patrí k chrome, ktoré
            je na každej stránke rovnaké, nie k stene. */}

        <div className={`info-overlay ${infoOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setInfoOpen(false); }}>
          <button className="info-close" onClick={() => setInfoOpen(false)}>✕</button>
          <div className="info-content">
            <h2 dangerouslySetInnerHTML={{ __html: t('wall.info.title') }} />
            <p>{t('wall.info.body')}</p>
          </div>
        </div>

        {/* Spodná lišta. `portalDock` ju posiela do <body> — dôvod v props. */}
        {portalDock
          ? createPortal(
              <div className="theme-light gods-dock-portal">
              <div className={`gods-bottom-bar${ctaMode ? ' has-cta' : ''}`}>
                <button
                  className={`filter-btn${filterOpen ? ' active' : ''}`}
                  onClick={() => setFilterOpen(f => !f)}
                  aria-label={t('wall.filter.find')}
                >
                  {/* Brand hand-drawn compass (vstupy/vizualna-identita/Icons hand drawn) */}
                  <svg width="20" height="20" viewBox="0 0 473.514 473.514" fill="currentColor" aria-hidden>
                    <path d="M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"/>
                    <path d="M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"/>
                  </svg>
                </button>

                <button className="center-btn-mobile" id="gods-center-btn-mobile" aria-label={t('wall.filter.center')}>
                  {/* Brand hand-drawn target circle (vstupy/vizualna-identita/Icons hand drawn) */}
                  <svg width="22" height="22" viewBox="0 0 503.168 503.168" fill="currentColor" aria-hidden>
                    <path d="M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"/>
                  </svg>
                </button>

                {/* LAB: tretia ikonka — prepínač STENA ⇄ PLANÉTA.
                    Ikonka sa mení podľa toho, KAM klik vedie, nie čo je práve na
                    obrazovke: pri zavretej planéte planétka, pri otvorenej MOZAIKA
                    (Matej 25. 8.: „ikonka dole v nave je planétka a druhú daj mosaic of
                    four squares tiles aby sme nemuseli dávať ten krížik hore vpravo").
                    Krížik planéty tým zanikol — cesta späť je tam, kde je cesta tam.
                    Mozaika je z hand-drawn kitu (`mosaic-of-four-hand-drawn-squares-tiles`),
                    vložená inline, aby dedila farbu textu ako zvyšok ovládania v bare. */}
                <button
                  className={`filter-btn${planetOpen ? ' active' : ''}`}
                  onClick={() => setPlanetOpen(o => !o)}
                  aria-label={planetOpen ? t('nav.wall') : 'DOGYPT'}
                >
                  {planetOpen ? (
                    <svg width="20" height="20" viewBox="0 0 439.164 439.165" fill="currentColor" aria-hidden>
                      <path d="M182.466,29.83c0.213-4.174-0.726-7.751-2.79-10.633c-3.199-6.282-8.623-9.76-15.485-10.138 C117.546,6.519,70.951,6.306,23.348,6.295c-5.264,0-9.704,1.856-12.845,5.368l-0.655,0.531 c-7.503,4.253-11.05,11.745-9.473,20.027c6.832,35.975,10.123,73.902,10.361,119.363c0.01,1.65,0.256,3.298,0.774,5.185 l0.089,0.525c0.546,8.465,6.147,17.311,17.42,17.976c49.478,2.917,94.039,5.756,138.377,11.07 c3.479,0.417,6.485-0.066,9.153-1.419l0.541-0.203c3.727-0.93,12.256-4.372,10.907-16.234 C182.182,117.115,180.366,71.769,182.466,29.83z M146.603,147.852c-34.827-3.608-68.829-5.88-97.497-7.622l-2.392-0.147 l-0.051-2.392c-0.688-32.479-3.156-62.606-7.556-92.1l-0.442-2.991l3.021,0.005c41.053,0.083,72.366,0.64,101.537,1.82l2.56,0.104 l-0.063,2.559c-0.744,31.052,0.48,63.089,3.74,97.939l0.294,3.15L146.603,147.852z" />
                      <path d="M182.466,276.21c0.213-4.174-0.726-7.754-2.79-10.634c-3.199-6.286-8.623-9.77-15.485-10.135 c-46.68-2.539-93.26-2.753-140.848-2.763c-5.263,0-9.704,1.854-12.845,5.362l-0.655,0.528c-7.503,4.26-11.05,11.75-9.476,20.042 c6.835,35.968,10.125,73.896,10.364,119.358c0.01,1.646,0.254,3.29,0.774,5.18l0.089,0.522c0.546,8.476,6.146,17.316,17.42,17.977 c49.477,2.92,94.039,5.764,138.377,11.075c3.484,0.416,6.49-0.071,9.153-1.422l0.541-0.198c3.727-0.93,12.255-4.372,10.907-16.234 C182.182,363.491,180.366,318.144,182.466,276.21z M146.603,394.233c-34.776-3.605-68.799-5.881-97.497-7.627l-2.392-0.152 l-0.051-2.387c-0.688-32.479-3.156-62.602-7.556-92.095l-0.442-2.99l3.021,0.005c41.058,0.081,72.376,0.64,101.537,1.817 l2.56,0.112l-0.063,2.549c-0.744,31.062,0.48,63.099,3.74,97.944l0.294,3.153L146.603,394.233z" />
                      <path d="M433.483,29.83c0.208-4.174-0.731-7.751-2.793-10.633c-3.199-6.282-8.623-9.76-15.488-10.138 c-46.641-2.539-93.236-2.752-140.843-2.763c-5.261,0-9.704,1.856-12.842,5.368l-0.655,0.531 c-7.506,4.253-11.045,11.745-9.471,20.027c6.83,35.975,10.126,73.902,10.364,119.363c0.011,1.65,0.254,3.298,0.771,5.185 l0.092,0.525c0.543,8.465,6.145,17.311,17.417,17.976c49.48,2.917,94.039,5.756,138.381,11.07 c3.483,0.411,6.484-0.066,9.155-1.419l0.543-0.203c3.728-0.93,12.248-4.372,10.907-16.234 C433.193,117.1,431.381,71.75,433.483,29.83z M397.612,147.852c-34.83-3.608-68.832-5.88-97.497-7.622l-2.392-0.147l-0.051-2.392 c-0.686-32.479-3.159-62.606-7.557-92.1l-0.441-2.991l3.021,0.005c41.05,0.083,72.366,0.64,101.534,1.82l2.559,0.104l-0.061,2.559 c-0.746,31.052,0.478,63.089,3.737,97.939l0.295,3.15L397.612,147.852z" />
                      <path d="M433.483,276.21c0.208-4.174-0.731-7.754-2.793-10.634c-3.199-6.286-8.623-9.77-15.488-10.135 c-46.677-2.539-93.257-2.753-140.848-2.763c-5.261,0-9.704,1.854-12.842,5.362l-0.655,0.528 c-7.506,4.26-11.045,11.75-9.471,20.037c6.83,35.973,10.126,73.905,10.364,119.363c0.01,1.646,0.254,3.29,0.771,5.18l0.092,0.522 c0.543,8.476,6.145,17.316,17.417,17.977c49.48,2.92,94.039,5.764,138.38,11.075c3.489,0.416,6.49-0.071,9.156-1.422l0.543-0.198 c3.728-0.93,12.248-4.372,10.907-16.234C433.193,363.481,431.381,318.124,433.483,276.21z M397.612,394.233 c-34.779-3.605-68.802-5.881-97.497-7.627l-2.392-0.152l-0.051-2.387c-0.686-32.479-3.159-62.602-7.557-92.095l-0.441-2.99 l3.021,0.005c41.061,0.081,72.376,0.64,101.534,1.817l2.559,0.112l-0.061,2.549c-0.746,31.062,0.478,63.099,3.737,97.944 l0.295,3.153L397.612,394.233z" />
                    </svg>
                  ) : (
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="9.5" />
                      <line x1="12" y1="2.5" x2="12" y2="21.5" />
                      <line x1="2.5" y1="12" x2="21.5" y2="12" />
                      <ellipse cx="12" cy="12" rx="4" ry="9.5" />
                      <ellipse cx="12" cy="12" rx="9.5" ry="4" />
                    </svg>
                  )}
                </button>

                {/* Mobile-only: language flag pill, next to the center button */}
                <div className="lang-btn-mobile"><LanguagePicker variant="flow" /></div>

                {/* FILM: chip, ktory po odchode planety nahradi nastroje (viz props). */}
                {ctaLabel ? <a className="gbb-cta" href={ctaHref}>{ctaLabel}</a> : null}
              </div>
              </div>,
              document.body
            )
          : (
            <div className={`gods-bottom-bar${ctaMode ? ' has-cta' : ''}`}>
              <button
                className={`filter-btn${filterOpen ? ' active' : ''}`}
                onClick={() => setFilterOpen(f => !f)}
                aria-label={t('wall.filter.find')}
              >
                {/* Brand hand-drawn compass (vstupy/vizualna-identita/Icons hand drawn) */}
                <svg width="20" height="20" viewBox="0 0 473.514 473.514" fill="currentColor" aria-hidden>
                  <path d="M115.494,425.082c37.303,19.865,77.041,29.935,118.109,29.935c0.005,0,0.005,0,0.01,0c68.776,0,133.881-28.406,183.32-79.983c76.129-79.414,75.342-203.429-1.793-282.333c-53.512-54.738-117.321-79.366-190.022-73.303c-1.341-0.31-2.689-0.462-4.253-0.462c-0.015,0-0.033,0-0.043,0C116.721,21.146,32.744,85.898,6.874,183.905C-18.105,278.561,26.556,377.729,115.494,425.082z M35.369,221.891c6.236-90.779,80.1-161.264,175.807-167.934c2.471,0.731,4.957,0.944,7.64,0.581c8.886-1.226,18.032-1.846,27.178-1.846c62.87,0,123.15,28.625,157.315,74.712c21.602,29.137,42.822,78.813,21.216,149.953c-26.146,86.046-102.307,141.65-194.024,141.65c-11.035,0-22.209-0.854-33.218-2.539C96.779,401.087,28.689,319.256,35.369,221.891z"/>
                  <path d="M159.096,289.154c0.66,8.801,7.211,13.573,13.716,14.574c54.936,25.842,115.917,31.899,168.81,35.546c0.391,0.03,0.776,0.046,1.147,0.046c1.549,0,3.052-0.219,4.484-0.655c7.891-1.158,12.862-7.435,12.141-15.438c-4.29-47.591-18.732-96.474-46.839-158.488c-1.401-3.088-3.55-5.469-6.235-6.927c-1.529-1.186-3.291-2.079-5.241-2.666c-16.544-4.986-33.896-9.127-50.668-13.126c-35.192-8.386-71.586-17.064-103.037-34.167c-2.412-1.31-4.933-1.975-7.482-1.975c-6.484,0-12.509,4.55-14.771,11.105c-1.478,3.272-1.597,6.937-0.348,10.623C143.958,184.362,155.184,237.207,159.096,289.154z M257.835,222.661c4.92,9.214,2.224,20.151-6.566,26.611c-7.932,5.829-18.753,5.017-24.902-2.036c-6.289-7.217-4.682-16.875,0.224-23.11c0.701-0.587,1.335-1.257,1.901-2.006c3.821-5.045,10.115-8.305,16.034-8.305C250.228,213.815,254.707,216.791,257.835,222.661z M219.168,272.508c6.033,3.352,12.944,5.189,20.249,5.189c4.25,0,8.485-0.63,12.588-1.879c20.495-6.256,33.957-25.029,33.5-46.722c-0.122-5.606-1.382-10.892-3.54-15.688c4.672-3.618,9.009-7.254,13.102-10.946c15.559,37.505,25.766,71.915,30.94,104.428c-40.197-3.204-81.918-8.606-120.519-23.12C210.059,279.648,214.593,275.916,219.168,272.508z M258.526,192.106c-3.981-1.363-8.237-2.158-12.69-2.206h-0.645c-13.855,0-25.319,5.055-34.096,15.028c-0.267,0.233-0.526,0.479-0.777,0.739c-11.23,11.715-14.871,27.835-10.445,42.488c-4.395,3.32-8.638,6.759-12.718,10.298c-4.426-35.563-11.972-71.823-22.584-108.202c24.387,9.564,50.648,15.678,76.152,21.612c10.831,2.521,21.896,5.111,32.753,7.95C268.636,184.187,263.674,188.356,258.526,192.106z"/>
                </svg>
              </button>

              <button className="center-btn-mobile" id="gods-center-btn-mobile" aria-label={t('wall.filter.center')}>
                {/* Brand hand-drawn target circle (vstupy/vizualna-identita/Icons hand drawn) */}
                <svg width="22" height="22" viewBox="0 0 503.168 503.168" fill="currentColor" aria-hidden>
                  <path d="M486.353,226.804l-1.005,0.028c-10.126,0.516-20.257,0.93-30.393,1.3c-17.452-96.405-92.647-167.758-189.113-178.526c-0.097-0.01-0.193-0.02-0.29-0.028c-0.467-0.19-0.949-0.358-1.432-0.513l0.01-8.94c0-9.945-7.637-17.445-17.77-17.445c-10.13,0-17.773,7.5-17.773,17.445l-0.005,7.655C141.307,55.341,63.091,134.46,46.196,203.592c-3.639,14.884-5.721,30.097-6.213,45.339c-7.993-0.287-15.1-0.714-21.935-1.305c-10.143-0.869-17.605,6.142-18.032,16.043c-0.374,8.694,5.345,18.464,16.686,19.449c7.8,0.681,15.907,1.138,25.111,1.417c7.825,54.512,37.968,100.208,85.421,129.198c30.722,18.769,70.569,29.407,112.67,30.153c0.787,6.754,1.617,13.508,2.46,20.271c1.343,10.72,10.544,16.33,18.946,16.33c5.088,0,9.754-1.99,12.816-5.463c2.976-3.362,4.275-7.912,3.661-12.808c-0.838-6.672-1.65-13.34-2.433-20.007c90.805-10.217,184.844-67.578,183.539-172.804c-0.021-1.889-0.071-3.823-0.152-5.859c9.13-0.351,18.265-0.731,27.396-1.188c9.963-0.508,17.28-8.572,17.021-18.758C502.912,233.873,495.849,226.804,486.353,226.804z M271.818,407.133c-1.899-23.304-2.356-43.041-1.457-61.586c0.233-4.829-1.336-9.283-4.434-12.533c-3.194-3.351-7.876-5.271-12.84-5.271c-8.658,0-17.704,5.854-18.25,17.047c-0.942,19.316-0.465,39.816,1.508,63.941c-89.21-3.153-143.064-57.314-157.121-111.009c-1.086-4.145-1.906-8.547-2.452-13.152c29.195-0.858,60.915-3.859,98.962-9.338c8.798-1.27,14.508-8.283,13.878-17.053c-0.68-9.49-8.952-19.39-21.406-17.625c-34.111,4.913-63.126,7.642-90.446,8.485c12.053-75.373,81.07-152.914,149.349-165.71c0.459-0.084,0.921-0.165,1.394-0.239c-0.14,32.763-0.502,58.564-1.165,82.746c-0.13,4.804,1.518,9.219,4.649,12.431c3.229,3.319,7.909,5.223,12.85,5.223c10.016,0,17.77-7.406,18.044-17.227c0.65-23.895,1.011-49.284,1.158-81.321c0.021,0,0.046,0.005,0.065,0.005c79.074,8.828,144.276,68.878,158.199,144.321c-25.252,0.868-51.165,1.861-76.799,3.806c-11.35,0.858-17.118,10.552-16.793,19.24c0.376,9.958,7.79,17.032,17.966,16.266c25.989-1.966,52.491-2.961,78.297-3.845c-0.381,12.563-2.127,25.126-5.209,37.445C404.206,364.376,335.572,399.166,271.818,407.133z"/>
                </svg>
              </button>

              {/* LAB: tretia ikonka — prepínač STENA ⇄ PLANÉTA.
                  Ikonka sa mení podľa toho, KAM klik vedie, nie čo je práve na
                  obrazovke: pri zavretej planéte planétka, pri otvorenej MOZAIKA
                  (Matej 25. 8.: „ikonka dole v nave je planétka a druhú daj mosaic of
                  four squares tiles aby sme nemuseli dávať ten krížik hore vpravo").
                  Krížik planéty tým zanikol — cesta späť je tam, kde je cesta tam.
                  Mozaika je z hand-drawn kitu (`mosaic-of-four-hand-drawn-squares-tiles`),
                  vložená inline, aby dedila farbu textu ako zvyšok ovládania v bare. */}
              <button
                className={`filter-btn${planetOpen ? ' active' : ''}`}
                onClick={() => setPlanetOpen(o => !o)}
                aria-label={planetOpen ? t('nav.wall') : 'DOGYPT'}
              >
                {planetOpen ? (
                  <svg width="20" height="20" viewBox="0 0 439.164 439.165" fill="currentColor" aria-hidden>
                    <path d="M182.466,29.83c0.213-4.174-0.726-7.751-2.79-10.633c-3.199-6.282-8.623-9.76-15.485-10.138 C117.546,6.519,70.951,6.306,23.348,6.295c-5.264,0-9.704,1.856-12.845,5.368l-0.655,0.531 c-7.503,4.253-11.05,11.745-9.473,20.027c6.832,35.975,10.123,73.902,10.361,119.363c0.01,1.65,0.256,3.298,0.774,5.185 l0.089,0.525c0.546,8.465,6.147,17.311,17.42,17.976c49.478,2.917,94.039,5.756,138.377,11.07 c3.479,0.417,6.485-0.066,9.153-1.419l0.541-0.203c3.727-0.93,12.256-4.372,10.907-16.234 C182.182,117.115,180.366,71.769,182.466,29.83z M146.603,147.852c-34.827-3.608-68.829-5.88-97.497-7.622l-2.392-0.147 l-0.051-2.392c-0.688-32.479-3.156-62.606-7.556-92.1l-0.442-2.991l3.021,0.005c41.053,0.083,72.366,0.64,101.537,1.82l2.56,0.104 l-0.063,2.559c-0.744,31.052,0.48,63.089,3.74,97.939l0.294,3.15L146.603,147.852z" />
                    <path d="M182.466,276.21c0.213-4.174-0.726-7.754-2.79-10.634c-3.199-6.286-8.623-9.77-15.485-10.135 c-46.68-2.539-93.26-2.753-140.848-2.763c-5.263,0-9.704,1.854-12.845,5.362l-0.655,0.528c-7.503,4.26-11.05,11.75-9.476,20.042 c6.835,35.968,10.125,73.896,10.364,119.358c0.01,1.646,0.254,3.29,0.774,5.18l0.089,0.522c0.546,8.476,6.146,17.316,17.42,17.977 c49.477,2.92,94.039,5.764,138.377,11.075c3.484,0.416,6.49-0.071,9.153-1.422l0.541-0.198c3.727-0.93,12.255-4.372,10.907-16.234 C182.182,363.491,180.366,318.144,182.466,276.21z M146.603,394.233c-34.776-3.605-68.799-5.881-97.497-7.627l-2.392-0.152 l-0.051-2.387c-0.688-32.479-3.156-62.602-7.556-92.095l-0.442-2.99l3.021,0.005c41.058,0.081,72.376,0.64,101.537,1.817 l2.56,0.112l-0.063,2.549c-0.744,31.062,0.48,63.099,3.74,97.944l0.294,3.153L146.603,394.233z" />
                    <path d="M433.483,29.83c0.208-4.174-0.731-7.751-2.793-10.633c-3.199-6.282-8.623-9.76-15.488-10.138 c-46.641-2.539-93.236-2.752-140.843-2.763c-5.261,0-9.704,1.856-12.842,5.368l-0.655,0.531 c-7.506,4.253-11.045,11.745-9.471,20.027c6.83,35.975,10.126,73.902,10.364,119.363c0.011,1.65,0.254,3.298,0.771,5.185 l0.092,0.525c0.543,8.465,6.145,17.311,17.417,17.976c49.48,2.917,94.039,5.756,138.381,11.07 c3.483,0.411,6.484-0.066,9.155-1.419l0.543-0.203c3.728-0.93,12.248-4.372,10.907-16.234 C433.193,117.1,431.381,71.75,433.483,29.83z M397.612,147.852c-34.83-3.608-68.832-5.88-97.497-7.622l-2.392-0.147l-0.051-2.392 c-0.686-32.479-3.159-62.606-7.557-92.1l-0.441-2.991l3.021,0.005c41.05,0.083,72.366,0.64,101.534,1.82l2.559,0.104l-0.061,2.559 c-0.746,31.052,0.478,63.089,3.737,97.939l0.295,3.15L397.612,147.852z" />
                    <path d="M433.483,276.21c0.208-4.174-0.731-7.754-2.793-10.634c-3.199-6.286-8.623-9.77-15.488-10.135 c-46.677-2.539-93.257-2.753-140.848-2.763c-5.261,0-9.704,1.854-12.842,5.362l-0.655,0.528 c-7.506,4.26-11.045,11.75-9.471,20.037c6.83,35.973,10.126,73.905,10.364,119.363c0.01,1.646,0.254,3.29,0.771,5.18l0.092,0.522 c0.543,8.476,6.145,17.316,17.417,17.977c49.48,2.92,94.039,5.764,138.38,11.075c3.489,0.416,6.49-0.071,9.156-1.422l0.543-0.198 c3.728-0.93,12.248-4.372,10.907-16.234C433.193,363.481,431.381,318.124,433.483,276.21z M397.612,394.233 c-34.779-3.605-68.802-5.881-97.497-7.627l-2.392-0.152l-0.051-2.387c-0.686-32.479-3.159-62.602-7.557-92.095l-0.441-2.99 l3.021,0.005c41.061,0.081,72.376,0.64,101.534,1.817l2.559,0.112l-0.061,2.549c-0.746,31.062,0.478,63.099,3.737,97.944 l0.295,3.153L397.612,394.233z" />
                  </svg>
                ) : (
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="9.5" />
                    <line x1="12" y1="2.5" x2="12" y2="21.5" />
                    <line x1="2.5" y1="12" x2="21.5" y2="12" />
                    <ellipse cx="12" cy="12" rx="4" ry="9.5" />
                    <ellipse cx="12" cy="12" rx="9.5" ry="4" />
                  </svg>
                )}
              </button>

              {/* Mobile-only: language flag pill, next to the center button */}
              <div className="lang-btn-mobile"><LanguagePicker variant="flow" /></div>

              {/* FILM: chip, ktory po odchode planety nahradi nastroje (viz props). */}
              {ctaLabel ? <a className="gbb-cta" href={ctaHref}>{ctaLabel}</a> : null}
            </div>
            )}

        <DogPlanetLab dogs={planetDogs} open={planetOpen} paused={paused} onClose={() => setPlanetOpen(false)} pick={planetPick} />

        {/* KALKULAČKA MÁ DVE PODOBY. Nad stenou je to modál so závojom — vyberáš
            číslo a stránka pod ním počká. Nad guľou je to PULT NA ĽAVOM BOKU
            (Matej 25. 8.: „kalkulačka zostáva na ľavej strane nad planétou"):
            závoj zmizne, guľa ostane živá a klikateľná, panel s kartou stojí
            vpravo. Je to tá istá kalkulačka, len inak ukotvená — druhá kópia by
            sa pri prvej úprave rozišla. */}
        <div
          className={`numpad-overlay${filterOpen ? ' open' : ''}${planetOpen ? ' numpad-overlay--planet' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) { setFilterOpen(false); setFilterValue(''); } }}
        >
          <div className="numpad numpad--wide" role="dialog" aria-label={t('wall.filter.find')}>
            <div className="numpad-body">
              <div className="numpad-search">
                <div className="numpad-display">
                  {filterValue ? `#${filterValue}` : <span className="ph">{t('wall.filter.placeholder')}</span>}
                </div>
                <div className="numpad-grid">
                  {['1','2','3','4','5','6','7','8','9'].map(d => (
                    <button
                      key={d}
                      className="numpad-key"
                      onClick={() => setFilterValue(v => (v + d).slice(0, 6))}
                    >{d}</button>
                  ))}
                  <button
                    className="numpad-key numpad-key--cancel"
                    onClick={() => setFilterValue('')}
                    aria-label={t('wall.filter.clear')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 5 H14.5 L20.5 12 L14.5 19 H7 A2 2 0 0 1 5 17 V7 A2 2 0 0 1 7 5 Z"/>
                      <path d="M8.4 9.4 L12.6 14.6 M12.6 9.4 L8.4 14.6"/>
                    </svg>
                  </button>
                  <button
                    className="numpad-key"
                    onClick={() => setFilterValue(v => (v + '0').slice(0, 6))}
                  >0</button>
                  <button
                    className="numpad-key numpad-key--enter"
                    onClick={submitFilter}
                    aria-label={t('wall.filter.confirm')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M8 12.5 L11 15.5 L16.5 9"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="numpad-countries">
                <div className="numpad-countries-title">{t('wall.filter.countries')}</div>
                <div className="numpad-countries-list">
                  {countryStats.map(c => (
                    <div className="ncountry-row" key={c.iso2}>
                      <span className="ncountry-flag">{countryFlag(c.iso2)}</span>
                      <span className="ncountry-code">{c.iso3}</span>
                      <span className="ncountry-count">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={appRef} role="application" style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
          <div ref={canvasRef} id="gods-canvas" />
        </div>

        {revealData.active && revealStep > 0 && revealStep < 4 && (
          <div className={`rev-overlay step-${revealStep}`}>
            <div className="rev-spotlight" />
            <img className="rev-big-symbol" src={revealSymbol} alt={revealData.dogName} />
          </div>
        )}

        {showWhatNext && (
          <div className="wn-root">
            <div className="wn-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowWhatNext(false); }}>
              <div className="wn-card" role="dialog" aria-label={t('whatNext.title')}>
                <button className="wn-close" aria-label={t('whatNext.close')} onClick={() => setShowWhatNext(false)}>&times;</button>
                <div className="wn-stamp">{t('whatNext.stamp')}</div>

                <div className="wn-main">
                  <div className="wn-head-row">
                    <h1>{t('whatNext.title')}</h1>
                    <span className="wn-counter"><span className="wn-cur">1</span>/5</span>
                  </div>
                  <div className="wn-divider" />

                  <div className="wn-slider">
                    <button className="wn-arrow wn-prev" aria-label={t('whatNext.prev')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button className="wn-arrow wn-next" aria-label={t('whatNext.next')}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>

                    <div className="wn-track">
                      <div className="wn-slide wn-in">
                        <span className="wn-ic wn-ic-paw" />
                        <h2>{t('whatNext.s1.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s1.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s1.body') }} />
                      </div>
                      <div className="wn-slide">
                        <span className="wn-ic wn-ic-sphinx" />
                        <h2>{t('whatNext.s2.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s2.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s2.body') }} />
                      </div>
                      <div className="wn-slide">
                        <span className="wn-ic wn-ic-people" />
                        <h2>{t('whatNext.s3.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s3.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s3.body') }} />
                      </div>
                      <div className="wn-slide">
                        <span className="wn-ic wn-ic-chat" />
                        <h2>{t('whatNext.s4.title')}</h2>
                        <p className="wn-ital">{t('whatNext.s4.hook')}</p>
                        <p className="wn-lead" dangerouslySetInnerHTML={{ __html: t('whatNext.s4.body') }} />
                      </div>
                      <div className="wn-slide wn-slide-share">
                        <h2>{t('sharecard.shareTitle', { name: revealData.dogName })}</h2>
                        {revealShareCardUrl ? (
                          <>
                            <img className="wn-share-preview" src={revealShareCardUrl} alt={t('sharecard.shareTitle', { name: revealData.dogName })} />
                            <div className="wn-share-actions">
                              <button
                                type="button"
                                className="wn-cta wn-cta-share"
                                onClick={handleWnShare}
                                disabled={shareBusy !== null}
                              >
                                <BrandIcon name="link" size={13} tint="dark" />
                                {t('sharecard.shareButton')}
                              </button>
                              <button
                                type="button"
                                className="wn-cta wn-cta-outline"
                                onClick={handleWnDownload}
                                disabled={shareBusy !== null}
                              >
                                <BrandIcon name="document" size={13} tint="gold" />
                                {t('sharecard.download')}
                              </button>
                            </div>
                            <div className="wn-share-links">
                              <button
                                type="button"
                                className="wn-share-link-btn"
                                onClick={handleWnFacebook}
                                aria-label={t('sharecard.facebook')}
                                title={t('sharecard.facebook')}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                                  <path d="M13.5 21v-8.2h2.75l.41-3.2h-3.16V7.6c0-.93.26-1.56 1.59-1.56h1.7V3.18C15.98 3.12 15.06 3 13.98 3c-2.24 0-3.78 1.37-3.78 3.88v2.72H7.44v3.2h2.76V21h3.3z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="wn-share-link-btn"
                                onClick={handleWnWhatsapp}
                                aria-label={t('sharecard.whatsapp')}
                                title={t('sharecard.whatsapp')}
                              >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                                  <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
                                  <path d="M12.02 2C6.5 2 2.04 6.46 2.04 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.94 9.94 0 0 0 12.02 22C17.53 22 22 17.54 22 12S17.53 2 12.02 2zm0 18.1c-1.63 0-3.15-.45-4.45-1.23l-.32-.19-3.02.79.8-2.94-.21-.3A8.09 8.09 0 0 1 3.93 12c0-4.47 3.63-8.1 8.09-8.1 4.46 0 8.08 3.63 8.08 8.1 0 4.47-3.62 8.1-8.08 8.1z"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="wn-share-link-btn"
                                onClick={handleWnCopyLink}
                                aria-label={t('sharecard.copyLink')}
                                title={t('sharecard.copyLink')}
                              >
                                <BrandIcon name="link" size={14} tint="gold" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="wn-lead wn-share-preparing">{t('sharecard.preparing')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wn-footer">
                  <img className="wn-seal" src="/images/peciat-dogypt.png" alt="DOGYPT seal" />
                  <span className="wn-motto-side">{t('whatNext.motto')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
