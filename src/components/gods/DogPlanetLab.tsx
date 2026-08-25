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
import { useT } from '@/i18n/LanguageContext';
import {
  NAV_R, NAV_GOLD, NAV_FRAME_BG, NAV_FRAME_BLEND, NAV_PLATE_BG, NAV_PLATE_BLEND,
  NAV_GRAIN_SCREEN_CSS, NAV_FRAME_SHADOW, NAV_PLATE_SHADOW,
} from '@/components/pack/navGoldSkin';
import { dogPagePath } from '@/lib/dogSlug';

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
 * Podoby detailu psa. Matej 25. 8. o prvej (tabuľa): „vyzerá ako náhrobný kameň"
 * → *„daj mi viacero možností"*. Rozdiel nie je len vo výplni: monumentálny dojem
 * robil hlavne ZVISLÝ stĺpec (portrét hore, nápis pod ním) v úzkom paneli, takže
 * široké podoby majú fotku VEDĽA mena. Zvitok ostáva zvislý — kresba zvitku iný
 * tvar neunesie.
 * Nič sa nemaže: zamietnutá podoba ostáva voľbou, Matej sa k nim vracia.
 */
const DESIGNS = [
  { id: 'tabula', label: 'tabuľa' },
  { id: 'doska', label: 'doska' },
  { id: 'karta', label: 'karta' },
  { id: 'zvitok', label: 'zvitok' },
] as const;
type Design = (typeof DESIGNS)[number]['id'];

/** Skúšobné veľkosti svorky (Matej 25. 8.: „zaujíma ma ako by to vyzeralo pri 500–1000 psoch"). */
const PRESETS = [71, 200, 500, 1000];

function rowCount(latDeg: number, spacing: number): number {
  const raw = (2 * Math.PI * R * Math.cos((latDeg * Math.PI) / 180)) / spacing;
  // MALÉ PRSTENCE (≤8 dlaždíc) sa na násobok 4 NEZAOKRÚHĽUJÚ (Matej 25. 8.:
  // „tá posledná rada… sú spojené rohmi (8), dajme len 7"). Dôvod je fyzický:
  // horná hrana dlaždice leží na MENŠOM kruhu než jej stred, takže pri póloch
  // sa rohy stretnú skôr než steny — a zaokrúhlenie 6,7 → 8 ich do seba dotlačí.
  // Pri takom malom prstenci zarovnanie na poludníky aj tak nikto neprečíta.
  if (raw <= 8) return Math.max(4, Math.round(raw));
  return Math.round(raw / 4) * 4; // násobok 4 → spoločné poludníky
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
          <img src={dog.photo} alt="" draggable={false} loading="lazy" />
        </div>
      ))}
    </>
  );
});

export function DogPlanetLab({
  dogs,
  open,
  onClose,
}: {
  dogs: PlanetDog[];
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
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
  // Skúšobný počet psov na guli — nie je to nastavenie appky, je to LABORATÓRNY
  // gombík: ukazuje, ako bude planéta vyzerať, keď svorka narastie.
  const [target, setTarget] = useState(200);
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
  const [picked, setPicked] = useState<PlanetDog | null>(null);
  // LAB PREPÍNAČ: kde sa detail otvorí. `side` = panel zboku (na mobile zhora),
  // guľa sa točí ďalej a uhne sa mu · `center` = prekryje stred, logo a CTA na
  // ten čas zmiznú. Vyberie sa jedna, druhá padne.
  const [variant, setVariant] = useState<'side' | 'center'>('side');
  // DRUHÝ LAB PREPÍNAČ — z čoho je detail urobený (Matej 25. 8.: „potrebujeme
  // vyrobiť nový blok zvetlý, nie papyrus lebo tam nesedi obsah = postav mi
  // další prepínač… detail psa dizajn navrhujem urobiť ho ako tabuľu dizajn ako
  // pri NAV = tmavšie okraje"). Zvitok sa NEMAŽE — Matej sa k zamietnutým
  // podobám vracia, tak ostáva ako voľba, nie ako mŕtvy kód.
  const [design, setDesign] = useState<Design>('tabula');
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
    let best: number | null = null;
    let bestD = Infinity;
    for (let i = 0; i < NOTE_SLOTS; i++) {
      if (obsadene.has(i)) continue;
      const d = Math.abs(g.ys[i] - chcem);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const tickNotes = () => {
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

  // Automatické otáčanie. Pauzuje počas ťahania a keď je overlay zavretý —
  // rAF slučka bežiaca na skrytej stránke je zbytočný žrút batérie.
  //
  // V tej istej slučke sa PREČÍTAVA aj dlaždica pod kurzorom. Nedá sa to nechať
  // na `pointermove`: guľa sa točí ďalej, takže sa pod nehybnou myšou strieda pes
  // za psom a bublinka by ukazovala toho, ktorý tam bol pred sekundou.
  // ⚠️ Zámerne len ~15× za sekundu (každý 4. snímok). `elementFromPoint` je nad
  // 1000 dlaždicami v 3D reálna práca a na plynulé čítanie mena stačí 15 Hz.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      if (autoRef.current) spinRef.current.y += dt * 0.006;
      const el = ballRef.current;
      if (el) el.style.transform = `rotateX(${spinRef.current.x}deg) rotateY(${spinRef.current.y}deg)`;
      if (++frame % 4 === 0) tickNotes();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [open, tiles, picked]);

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

  return (
    <div
      className={`planet-root v-${variant} d-${design}${open ? ' open' : ''}${picked ? ' pop' : ''}`}
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
        .planet-root.open .planet-stage { transform: scale(1); opacity: 1; }

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
          gap: 14px;
          text-align: center;
          pointer-events: none;
        }
        .planet-hero::before {
          content: '';
          position: absolute;
          inset: -110px -150px;
          z-index: -1;
          background: radial-gradient(ellipse at center, rgba(253,248,236,0.92) 26%, transparent 70%);
          pointer-events: none;
        }
        .planet-hero img { width: 132px; height: auto; filter: brightness(0); }
        .planet-hero .ph-tag {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.74rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.62);
          line-height: 1.7;
        }
        .planet-hero .ph-tag b { color: #8C6014; font-weight: 700; }
        .planet-hero .join-btn { pointer-events: auto; }

        /* DEV PULT — ľavý bok, drobný (Matej 25. 8.: „tie prepínacie testovacie
           chipy daj na lavy bok stranky a zmenši, je to len DEV pomocka…
           namiesto toho sem prehoď spodný nav aj vrchné"). Spodok obrazovky
           patrí navu steny, nie ladiacim gombíkom. */
        /* ⚠️ Dev pult stojí v ľavom stĺpci kót — je to LAB pomôcka, ktorá
           v produkcii nebude, tak si miesto neberie: leží POD kótami (tie majú 6/7),
           ale NAD guľou. Bublinka pointer-events nemá, takže sa pult dá
           preklikať aj vtedy, keď cez neho práve prebehne kóta. */
        .planet-dock {
          position: fixed;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          opacity: 0.72;
          transition: opacity 180ms ease;
        }
        .planet-dock:hover { opacity: 1; }

        /* Skupina prepínačov — popisok nad radom pilulek, nie vedľa neho:
           na úzkom bočnom páse by sa vedľa seba nezmestili. */
        .planet-scale {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          align-items: center;
          padding: 5px 7px 6px;
          border-radius: 12px;
          background: linear-gradient(135deg, #FDF8EC 0%, #F0DFB8 100%);
          border: 1px solid rgba(201,154,63,0.7);
          box-shadow: 0 6px 16px -8px rgba(70,46,12,0.45);
        }
        .planet-scale .ps-row { display: flex; align-items: center; gap: 3px; }
        .planet-scale .ps-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.48rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7a5a2a;
          padding: 0 3px;
          white-space: nowrap;
        }
        .planet-scale .ps-pill {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.56rem;
          letter-spacing: 0.05em;
          color: #2a1608;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 3px 7px;
          cursor: pointer;
          white-space: nowrap;
        }
        .planet-scale .ps-pill.on {
          background: linear-gradient(180deg, #F4DC97 0%, #D9AC46 70%, #C99A33 100%);
          border-color: #6E4E18;
          box-shadow: inset 0 2px 0 rgba(255,250,222,0.85), 0 2px 5px -1px rgba(70,45,10,0.5);
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
          align-items: baseline;
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
        /* Poradové číslo = dáta, teda Space Grotesk. */
        .pnote-n {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.6rem;
          letter-spacing: 0.06em;
          color: #8C6014;
          font-style: normal;
          flex-shrink: 0;
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
        .pp-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1a1a1a;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 999px;
          padding: 3px 15px;
          flex-shrink: 0;
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
        .pp-x {
          position: absolute;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: none;
          background: transparent;
          color: rgba(58,36,8,0.5);
          cursor: pointer;
        }
        .pp-x:hover { color: #6E4E18; }

        /* Hlavička: pri širokých podobách fotka VEDĽA identity, pri zvitku pod
           sebou. Zvislý stĺpec v úzkom paneli bol hlavný dôvod, prečo prvá tabuľa
           vyzerala ako náhrobný kameň — nie farba, ale tvar. */
        .pp-head {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .pp-ident {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          min-width: 0;
        }
        .d-zvitok .pp-head {
          flex-direction: column;
          gap: 10px;
        }
        .d-zvitok .pp-ident { align-items: center; }

        /* Pilulka s dňami — LOCKED vizuál z PackTree.tsx: zvislý gradient
           #F5C73D→#E69E1A, atrament #3d1f00, Cinzel 700 BEZ verzálok, bez rámu.
           Neprekresľuj ju, prenes zmenu z PackTree. */
        .pp-days-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: flex-start;
        }
        .d-zvitok .pp-days-wrap { align-items: center; }
        .pp-days-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.56rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C99A3F;
        }
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

        /* Široké podoby rastú spolu s panelom. Zvitok sa nezväčšuje — jeho
           veľkosť drží kresba, nie obsah. */
        .planet-root:not(.d-zvitok) .pp-panel {
          gap: 14px;
          /* Matejov náčrt bol vyšší než čo dal obsah — panel má teda vlastnú
             výšku a obsah v nej stojí na stred. Bez justify-content by sa nalepil
             hore a spodok by zíval. */
          min-height: min(600px, 68vh);
          justify-content: center;
        }
        .planet-root:not(.d-zvitok) .pp-head { gap: 22px; }
        .planet-root:not(.d-zvitok) .pp-photo { width: 132px; height: 132px; }
        .planet-root:not(.d-zvitok) .pp-name { font-size: 2rem; }
        .planet-root:not(.d-zvitok) .pp-rank { font-size: 0.92rem; padding: 4px 17px; }
        .planet-root:not(.d-zvitok) .pp-days { font-size: 1rem; padding: 5px 15px; }
        .planet-root:not(.d-zvitok) .pp-days-eyebrow { font-size: 0.62rem; }
        .planet-root:not(.d-zvitok) .pp-glyph { width: 74%; max-width: 320px; }
        .planet-root:not(.d-zvitok) .pp-msg { font-size: 0.88rem; line-height: 1.65; }
        .planet-root:not(.d-zvitok) .pp-link { font-size: 0.68rem; padding: 9px 22px; }

        /* ── PODOBA A: TABUĽA ────────────────────────────────────────────────
           Ten istý odliatok ako nav (Matej 25. 8.: „ako tabuľu dizajn ako pri NAV
           = tmavšie okraje"). Tokeny sa NEOPISUJÚ — idú z pack/navGoldSkin.ts,
           inak sa tabuľa a bar pri prvej úprave rozídu.
           Stavba je 1:1 ako bar na stene: rám je samotný panel, DOSKA je ::before
           a svetlé zrno ::after, obe na z-index -1. Preto nosič potrebuje
           isolation: isolate (bez neho by záporná vrstva padla až za rám) a obsah
           position: relative — inak by doska prekryla text. */
        .d-tabula .pp-panel {
          isolation: isolate;
          padding: ${NAV_R.rim + 26}px ${NAV_R.rim + 30}px ${NAV_R.rim + 28}px;
          color: ${NAV_GOLD.ink};
          background: ${NAV_FRAME_BG};
          background-blend-mode: ${NAV_FRAME_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          border-radius: ${NAV_R.frame}px;
          box-shadow: ${NAV_FRAME_SHADOW};
        }
        .d-tabula .pp-panel::before {
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
        .d-tabula .pp-panel::after {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          ${NAV_GRAIN_SCREEN_CSS}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .d-tabula .pp-panel > * { position: relative; z-index: 1; }
        /* ⚠️ Pravidlo vyššie je silnejšie než .pp-x, takže krížiku prepísalo
           position na relative a ten spadol do toku ako prvá položka. Musí sa
           vrátiť s rovnakou váhou, nie nižšou. */
        .d-tabula .pp-panel > .pp-x { position: absolute; }
        .d-tabula .pp-name { color: ${NAV_GOLD.ink}; }
        .d-tabula .pp-msg { color: rgba(42,22,8,0.72); -webkit-line-clamp: 10; }
        .d-tabula .pp-rule { background: rgba(110,78,24,0.35); }
        .d-tabula .pp-photo { border-color: ${NAV_GOLD.edge}; }
        .d-tabula .pp-x { top: ${NAV_R.rim + 6}px; right: ${NAV_R.rim + 6}px; }

        /* ── PODOBA B: DOSKA ─────────────────────────────────────────────────
           Tá istá pieskovcová doska ako v tabuli, ale BEZ vonkajšieho zlatého
           rámu. Práve ten ťažký rám s tmavým obrysom robil z panela pomník;
           doska sama je plocha na písanie, nie monument. */
        .d-doska .pp-panel {
          padding: 34px 38px 36px;
          color: ${NAV_GOLD.ink};
          background: ${NAV_PLATE_BG};
          background-blend-mode: ${NAV_PLATE_BLEND};
          border: ${NAV_R.line}px solid rgba(110,78,24,0.55);
          border-radius: ${NAV_R.plate + 4}px;
          box-shadow: ${NAV_PLATE_SHADOW}, 0 16px 36px -14px rgba(70,46,12,0.5);
        }
        .d-doska .pp-name { color: ${NAV_GOLD.ink}; }
        .d-doska .pp-msg { color: rgba(42,22,8,0.72); -webkit-line-clamp: 10; }
        .d-doska .pp-rule { background: rgba(110,78,24,0.3); }
        .d-doska .pp-x { top: 12px; right: 12px; }

        /* ── PODOBA C: KARTA ─────────────────────────────────────────────────
           Papyrusový blok z /pack — jazyk, ktorým hovorí zvyšok appky
           (PACK_BOX.card: papyrusový gradient, zlatý rám 1.5 px, radius 16).
           Najsvetlejšia z troch a najmenej ceremoniálna. */
        .d-karta .pp-panel {
          padding: 34px 38px 36px;
          color: #2a1608;
          background: linear-gradient(160deg, #FDF8EC 0%, #F7ECD3 46%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 16px;
          box-shadow: 0 18px 44px -16px rgba(70,46,12,0.45), inset 0 1px 0 rgba(255,253,246,0.9);
        }
        .d-karta .pp-msg { -webkit-line-clamp: 10; }
        .d-karta .pp-x { top: 12px; right: 12px; }

        /* ── PODOBA D: ZVITOK (papyrus zo stránky psa) ───────────────────────
           ⚠️ papyrus-vision.webp NIE JE plocha, je to ZVITOK s navinutými koncami
           hore a dole. Preto tu NIE JE rám ani box-shadow (obdĺžnik okolo zvitku
           je vidno ako škatuľu — tieň robí drop-shadow po obryse), preto je také
           odsadenie (obsah musí sadnúť MEDZI konce) a preto drží pomer okolo 0.8
           (pri plochejšom tvare sa konce roztiahnu). Rolovať vnútri kresby sa
           nedá, konce ostanú stáť, takže sa text OREZÁVA.
           Zdroj: .dogshare-info-card v pages/DogShare.tsx. */
        .d-zvitok .pp-panel {
          padding: 50px 34px 62px;
          color: #3a2408;
          background-image: url('/images/vision/papyrus-vision.webp');
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          filter: drop-shadow(0 20px 44px rgba(70,46,12,0.45));
        }
        .d-zvitok .pp-msg { -webkit-line-clamp: 6; }
        .d-zvitok .pp-x { top: 52px; right: 26px; }
        /* Pomer blízky 0.8 ako karta na stránke psa. */
        .d-zvitok.v-side .pp-panel { width: 330px; min-height: 400px; }
        .d-zvitok.v-center .pp-panel { width: 360px; min-height: 440px; }

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
          transform: translateX(calc(-1 * (var(--pw) / 2 + 40px))) scale(1);
        }

        /* ── MOŽNOSŤ B: STRED ────────────────────────────────────────────────
           Panel sadne na stred; logo a CTA na ten čas zhasnú, inak by si dve
           veci pýtali to isté miesto. */
        .v-center .pp-panel {
          position: fixed;
          left: 50%;
          top: 50%;
          width: min(680px, 62vw);
          max-height: 86vh;
          transform: translate(-50%, -50%) scale(0.9);
          transition: transform 340ms cubic-bezier(.22,.9,.28,1), opacity 260ms ease;
        }
        .planet-root.pop.v-center .pp-panel { transform: translate(-50%, -50%) scale(1); }
        .planet-root.pop.v-center .planet-hero { opacity: 0; pointer-events: none; }
        .planet-hero { transition: opacity 240ms ease; }

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
        body.planet-open .theme-toggle,
        body.planet-open .gods-bottom-bar { z-index: 90; }

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
        .pp-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1a1a1a;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 999px;
          padding: 3px 15px;
          flex-shrink: 0;
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
        .pp-x {
          position: absolute;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: none;
          background: transparent;
          color: rgba(58,36,8,0.5);
          cursor: pointer;
        }
        .pp-x:hover { color: #6E4E18; }

        /* Hlavička: pri širokých podobách fotka VEDĽA identity, pri zvitku pod
           sebou. Zvislý stĺpec v úzkom paneli bol hlavný dôvod, prečo prvá tabuľa
           vyzerala ako náhrobný kameň — nie farba, ale tvar. */
        .pp-head {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .pp-ident {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          min-width: 0;
        }
        .d-zvitok .pp-head {
          flex-direction: column;
          gap: 10px;
        }
        .d-zvitok .pp-ident { align-items: center; }

        /* Pilulka s dňami — LOCKED vizuál z PackTree.tsx: zvislý gradient
           #F5C73D→#E69E1A, atrament #3d1f00, Cinzel 700 BEZ verzálok, bez rámu.
           Neprekresľuj ju, prenes zmenu z PackTree. */
        .pp-days-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
          align-items: flex-start;
        }
        .d-zvitok .pp-days-wrap { align-items: center; }
        .pp-days-eyebrow {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.56rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #C99A3F;
        }
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


        @media (max-width: 760px) {
          .planet-stage { transform: scale(1.75) translateZ(0); }
          .planet-root.open .planet-stage { transform: scale(0.62); }
          .planet-hero img { width: 104px; }

          /* BOK sa na mobile mení na ZHORA (Matej 25. 8.: „na mobile z vrchu").
             Zboku by pri 390 px ostal z gule pásik. */
          .v-side .pp-panel {
            top: 0; right: 0; left: 0;
            width: auto;
            max-height: 62vh;
            transform: translateY(-102%);
          }
          .planet-root.pop.v-side .pp-panel { transform: translateY(0); }
          .planet-root.open.pop.v-side .planet-stage { transform: translateY(124px) scale(0.62); }

          .v-center .pp-panel { width: calc(100vw - 32px); }
          .planet-root:not(.d-zvitok) .pp-panel { min-height: 0; }

          /* Na mobile je bočný pás úzky — pult sa stiahne k hornej hrane. */
          .planet-dock { top: 64px; transform: none; gap: 4px; }
        }
      `}</style>

      {/* LAB pult. Horný riadok = ktorá z dvoch možností detailu sa skúša,
          dolný = koľko psov guľa nesie. Ani jedno nie je nastavenie appky. */}
      <div className="planet-dock">
        <div className="planet-scale" role="group" aria-label="Kde sa otvorí detail psa">
          <span className="ps-label">kde</span>
          <div className="ps-row">
            <button className={`ps-pill${variant === 'side' ? ' on' : ''}`} onClick={() => setVariant('side')}>bok</button>
            <button className={`ps-pill${variant === 'center' ? ' on' : ''}`} onClick={() => setVariant('center')}>stred</button>
          </div>
        </div>

        <div className="planet-scale" role="group" aria-label="Z čoho je detail psa">
          <span className="ps-label">dizajn</span>
          <div className="ps-row">
            {DESIGNS.map(d => (
              <button
                key={d.id}
                className={`ps-pill${design === d.id ? ' on' : ''}`}
                onClick={() => setDesign(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="planet-scale" role="group" aria-label="Počet psov">
          <span className="ps-label">psov</span>
          <div className="ps-row">
            {PRESETS.map(n => (
              <button
                key={n}
                className={`ps-pill${target === n ? ' on' : ''}`}
                onClick={() => setTarget(n)}
              >
                {n === 71 ? '71' : n}
              </button>
            ))}
          </div>
        </div>
      </div>

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

        <div className="planet-hero">
          <img src="/images/dogypt-gold-logo.webp" alt="DOGYPT" />
          <p className="ph-tag">
            {t('wall.hero.taglineLead')}
            <br />
            <b>{t('wall.hero.taglineGod')}</b>
          </p>
          <a href="/entry" className="join-btn">{t('wall.hero.cta')}</a>
        </div>
      </div>

      {/* KÓTY. Vodiace čiary sú JEDNO svg cez celú obrazovku, nie čiara pripnutá
          k bublinke — bublinky sa navzájom rozostrkujú, takže čiara nikdy nevedie
          rovno a musí sa kresliť v spoločnej sústave. Zhasnú, len čo sa otvorí
          detail: dva popisky toho istého psa naraz sú šum, nie informácia. */}
      {notes.length > 0 && !picked && mriezka && (
        <svg className="pn-leads" width="100%" height="100%" aria-hidden="true">
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
            </div>
            <p className="pnote-msg">{n.dog.message || (n.dog.n === 1 ? t('wall.hektor.msg') : '')}</p>
          </div>
        </div>
      ))}

      {/* Detail psa. Ten istý obsah pre obe možnosti — líši sa iba tým, KAM
          sadne (CSS `.v-side` / `.v-center`). Dva panely s tým istým vnútrom by
          sa pri prvej úprave rozišli. */}
      {picked && (
        <div className="pp-panel" role="dialog" aria-label={picked.name}>
          <button className="pp-x" onClick={() => setPicked(null)} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {/* Hlavička. Pri širokých podobách stojí fotka VEDĽA mena (rieši sa
              v CSS), pri zvitku pod sebou — obsah je ten istý. */}
          <div className="pp-head">
            <img className="pp-photo" src={picked.photoBig || picked.photo} alt="" draggable={false} />
            <div className="pp-ident">
              {picked.n != null && <span className="pp-rank">#{picked.n}</span>}
              <div className="pp-name">{picked.name}</div>
              {/* Počet dní ako na stránke psa (Matej 25. 8.). Pilulka je LOCKED
                  vizuál (PackTree.tsx): zvislý gradient, Cinzel 700 bez verzálok,
                  bez rámu. Bez dátumu narodenia sa nezobrazí — vymyslené číslo by
                  sa tu tvárilo ako údaj. */}
              {dniZivota(picked.birthDate) !== null && (
                <div className="pp-days-wrap">
                  <span className="pp-days-eyebrow">{t('pack.dog.livingBestLife')}</span>
                  <span className="pp-days">
                    {t('dogPage.daysCount', {
                      days: dniZivota(picked.birthDate)!.toLocaleString('en-US'),
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
          {picked.heroglyph && (
            <img className="pp-glyph" src={picked.heroglyph} alt="" draggable={false} />
          )}
          {/* Hektor #1 má odkaz v preklade, nie v DB — rovnako ako jeho karta na stene. */}
          {(picked.message || picked.n === 1) && (
            <>
              {/* Vlásočnica oddeľuje doklad psa od odkazu majiteľa — to isté
                  delenie ako karta na stránke psa. */}
              <div className="pp-rule" />
              <p className="pp-msg">{picked.message || t('wall.hektor.msg')}</p>
            </>
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
