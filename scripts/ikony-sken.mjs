#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════════
// SKEN IKONIEK — jediný merač, dvaja odberatelia
// ────────────────────────────────────────────────────────────────────────────
// Matej 16. 9. 2026: *„tie ktoré nie su z brandu by sme mali odsúhlasiť, mať ich
// v zozname výnimiek, ale vždy viditeľne… nesmú zostať nepovšimnuté, musíme ich
// mať na očiach, kľudne v brande v červenom poli — tieto nemáme v brande."*
//
// Tento súbor NIČ NEROZHODUJE. Meria, čím appka kreslí ikonky, a triedi to na
// brandové kanály a všetko ostatné. Odberatelia sú dvaja:
//   1. `scripts/gen-ikony-data.mjs` (koreň repa) → červené pole v brand manuáli
//   2. `scripts/check-ikony.mjs`    (tu)         → stráž, ktorá zhodí build
//
// ⚠️ PREČO ŽIJE V SUBMODULE `vystupy/web`, a nie v koreni pri ostatných
//    generátoroch: stráž beží z `vystupy/web` (ako `check:pack` a `check:css`)
//    a submodul NEVIDÍ koreň repa. Opačný smer je bezpečný — koreň submodul
//    vidí, takže generátor si tento súbor naimportuje cez cestu. Kópia skenera
//    v oboch stromoch by sa rozišla pri prvej zmene a stráž by merala niečo iné
//    než to, čo je v manuáli.
//
// ⚠️ NEPARSUJE SA TYPESCRIPT — rovnaký dôvod ako v `gen-znacky-data.mjs`: `tsc`
//    by si vypýtal celý graf importov appky kvôli zoznamu mien. Čítame regexom
//    nad zdrojom, ale VŽDY až po odstránení komentárov — v tomto repe je vyše
//    600 šípok `→` a `⚠️` vo vysvetľujúcich vetách a bez toho kroku by register
//    hlásil ako ikonku každý komentár.
// ════════════════════════════════════════════════════════════════════════════
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

// ── Brandové kanály (brand lock, `plany/locky/brand.md` r. 40) ───────────────
// Tri a nezameniteľné: <BrandIcon name> · @/assets/icons/ · HandIcons.tsx
const KANALY = {
  brandIcon: 'public/icons/pack/*.svg cez <BrandIcon>',
  assets: 'src/assets/icons/*.svg',
  hand: 'components/pack/HandIcons.tsx (inline, currentColor)',
};

// ── Náprotivky: lucide meno → brandová kresba, ktorú UŽ MÁME ────────────────
// Toto je jediné miesto v súbore, kde je úsudok, nie meranie. Položka tu
// znamená: „výnimku netreba, treba výmenu." Keď Matej dokreslí novú ikonku,
// pribudne sem riadok a položka sa v registri presunie z červeného poľa medzi
// opraviteľné — bez zásahu do panela aj bez zásahu do stráže.
// ⚠️ Hodnoty idú DO MANUÁLU, teda na anglický povrch — píš ich po anglicky.
//    Komentáre naokolo ostávajú slovenské, tie číta len ten, kto sem príde.
const NAPROTIVOK = {
  ArrowLeft: 'HandArrowLeft — <BackButton> / <BackIcon> already wrap it',
  // Matej 16. 9. 2026 dokreslil fajku (flaticon 35734, CC0) → 19 miest prevedených
  // v ten istý deň. Zvyšných 5 sedí v shadcn primitívoch (checkbox, select,
  // dropdown, context-menu, menubar) — cudzí kód, vlastné rozhodnutie.
  Check: 'HandCheck',
  CheckCircle: 'HandCheck',
  CheckCircle2: 'HandCheck',
  Lock: 'HandLock',
  Plus: 'HandPlus · /icons/pack/plus.svg',
  Trash: 'HandTrash',
  Trash2: 'HandTrash',
  UserPlus: '/icons/pack/add-user.svg',
  Mail: '/icons/pack/envelope.svg',
  Bone: '/icons/pack/bone.svg',
  RefreshCw: '/icons/pack/cycle.svg',
  RotateCcw: '/icons/pack/cycle.svg',
  Eye: '/icons/pack/eye.svg',
  List: '/icons/pack/bars.svg · menu.svg',
  Star: 'HandStar · /icons/pack/star.svg',
  Pencil: 'HandPencil · /icons/pack/pencil.svg',
  Link: 'HandLink · /icons/pack/link.svg',
  Link2: 'HandLink · /icons/pack/link.svg',
  ExternalLink: 'HandLink · /icons/pack/link.svg',
  ClipboardList: 'HandClipboard · /icons/pack/clipboard.svg',
  AlertTriangle: 'HandAlert · /icons/pack/alert.svg',
  LogOut: 'HandExit',
  Home: '/icons/pack/house-heart.svg',
  Globe: '/icons/pack/globe.svg',
  Heart: '/icons/pack/heart.svg',
  Trophy: '/icons/pack/trophy.svg',
  Menu: '/icons/pack/menu.svg · bars.svg',
  HelpCircle: '/icons/pack/question.svg',
  Layers: '/icons/pack/layers.svg',
  MapPin: '/icons/pack/locate.svg',
  Map: '/icons/pack/map.svg',
  Sliders: '/icons/pack/sliders.svg',
  SlidersHorizontal: '/icons/pack/sliders.svg',
  FileText: '/icons/pack/document.svg',
  Users: '/icons/pack/people.svg',
};

// ── Textové znaky, ktoré appka kreslí namiesto ikonky ────────────────────────
// Nie sú ani lucide, ani brand — je to systémový font. `BackButton.tsx` presne
// toto raz už riešil pre `←`: *„textový znak vykreslí každý systém inou hrúbkou
// a inou výškou"*. Zvyšok sady zostal nepovšimnutý, a to je celý dôvod merania.
const ZNAKY = ['×', '✕', '✖', '✓', '✔', '‹', '›', '«', '»', '←', '→', '↑', '↓', '↗', '⤢', '▲', '▼', '◀', '▶', '⌃', '⌄'];

// ── Povrchy so SCHVÁLENOU emoji výnimkou (brand lock r. 42–54) ───────────────
// „CELÁ MAPA HOVORÍ EMOJI" + „chipy aktivít a tagov na mape sú EMOJI a ostávajú
// nimi" (Matej 14. 8.: *„nie emoji nechaj tak!"*, téma zavretá). Emoji na týchto
// povrchoch NIE JE nález — je to rozhodnutie. Mimo nich áno.
const MAPOVE = [
  'components/pack/mapnotes/',
  'components/pack/events/',
  'components/pack/addtrip/',
  'components/pack/trip/',
  'components/geo/',
  'pages/PackMap.tsx',
  'pages/PackTripArticle.tsx',
  'pages/PackTriplist.tsx',
  'components/pack/tripShared.tsx',
  'components/pack/tripCategories.ts',
  'components/pack/TrailMarks.tsx',
];

// shadcn primitívy — cudzí kód, nie náš dizajn. Meria sa zvlášť.
const SHADCN = 'components/ui/';

// ⚠️ Blokový komentár sa nahrádza ROVNAKÝM POČTOM prázdnych riadkov, nie
//    prázdnym reťazcom. Inak sa číslovanie posunie a stráž pošle človeka na zlý
//    riadok — odskúšané: `⤢` v `PackMap.tsx` je na 5754, po zmazaní komentárov
//    hlásila 4501. Pri riadkových `//` sa nič nestráca, tam `$` koniec riadku
//    nechá.
const bezKomentarov = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .replace(/^[ \t]*\/\/.*$/gm, '');

function subory(koren) {
  const out = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx|ts)$/.test(e.name)) out.push(p);
    }
  })(koren);
  return out;
}

/**
 * @param {string} webKoren absolútna cesta k `vystupy/web`
 * @returns register — brandové kanály, nálezy mimo brandu, súhrn
 */
export function skenIkoniek(webKoren) {
  const SRC = join(webKoren, 'src');
  const chyby = [];
  const rel = (p) => relative(SRC, p).split('\\').join('/');

  // ── čo brand MÁ ───────────────────────────────────────────────────────────
  const packSvg = existsSync(join(webKoren, 'public/icons/pack'))
    ? readdirSync(join(webKoren, 'public/icons/pack')).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', '')).sort()
    : [];
  const assetSvg = existsSync(join(SRC, 'assets/icons'))
    ? readdirSync(join(SRC, 'assets/icons')).filter((f) => f.endsWith('.svg')).map((f) => f.replace('.svg', '')).sort()
    : [];
  const handSrc = existsSync(join(SRC, 'components/pack/HandIcons.tsx'))
    ? readFileSync(join(SRC, 'components/pack/HandIcons.tsx'), 'utf8')
    : '';
  const handMena = [...handSrc.matchAll(/export function (Hand[A-Za-z0-9]+)\s*\(/g)].map((m) => m[1]).sort();

  if (!packSvg.length) chyby.push('public/icons/pack/ je prázdny — zmenila sa cesta brandového setu?');
  if (!handMena.length) chyby.push('HandIcons.tsx nevrátil ani jeden export — zmenil sa tvar súboru?');

  // ── sken zdroja ───────────────────────────────────────────────────────────
  const lucide = new Map();   // meno -> Set(súbor)
  const hand = new Map();
  const brandIcon = new Map();
  const znaky = new Map();    // znak -> [{ subor, riadok, uryvok }]
  const emojiMimo = new Map();

  const reLucide = /import\s*(?:type\s*)?\{([^{}]*)\}\s*from\s*['"]lucide-react['"]/g;
  const reHand = /<(Hand[A-Za-z0-9]+)[\s/>]/g;
  const reBrandIcon = /<BrandIcon[^>]*?name=(?:"([a-z0-9-]+)"|\{\s*['"]([a-z0-9-]+)['"]\s*\})/g;
  // ⚠️ `<BrandIcon name>` NIE JE jediná cesta k tej istej kresbe — `tripShared.tsx`
  //    si ju berie ako `maskImage: url(ICON('paw'))`, `PackMap.tsx` ako pozadie.
  //    Bez tohto druhého regexu register tvrdí, že kresba leží nepoužitá, hoci
  //    ju appka kreslí — a „28 nepoužitých" by bola výzva mazať živé assety.
  const rePriamaCesta = /\/icons\/pack\/([a-z0-9-]+)\.svg/g;
  const PIKTO = /(?:\p{Extended_Pictographic}[\uFE0F\u200D\p{Extended_Pictographic}]*)+/gu;

  const pridaj = (mapa, kluc, hodnota) => {
    if (!mapa.has(kluc)) mapa.set(kluc, new Set());
    mapa.get(kluc).add(hodnota);
  };

  for (const abs of subory(SRC)) {
    const f = rel(abs);
    if (f === 'components/pack/HandIcons.tsx') continue; // definícia, nie použitie
    const surovy = readFileSync(abs, 'utf8');
    const t = bezKomentarov(surovy);

    for (const m of t.matchAll(reLucide)) {
      for (let raw of m[1].split(',')) {
        const meno = raw.trim().split(/\s+as\s+/)[0].trim();
        if (/^[A-Za-z][A-Za-z0-9_]*$/.test(meno)) pridaj(lucide, meno, f);
      }
    }
    for (const m of t.matchAll(reHand)) pridaj(hand, m[1], f);
    for (const m of t.matchAll(reBrandIcon)) pridaj(brandIcon, m[1] || m[2], f);
    for (const m of t.matchAll(rePriamaCesta)) pridaj(brandIcon, m[1], f);

    // textové znaky — len tam, kde znak stojí SÁM ako obsah prvku alebo ako
    // celý reťazec. `→` uprostred vety je text, nie ikonka.
    const riadky = t.split('\n');
    riadky.forEach((r, i) => {
      for (const z of ZNAKY) {
        if (!r.includes(z)) continue;
        const sam = new RegExp(`(>\\s*${z}\\s*<)|(>\\s*\\{\\s*['"\`]${z}['"\`]\\s*\\})|(['"\`]${z}['"\`])`, 'u');
        if (!sam.test(r)) continue;
        if (!znaky.has(z)) znaky.set(z, []);
        znaky.get(z).push({ subor: f, riadok: i + 1, uryvok: r.trim().slice(0, 120) });
      }
    });

    // emoji mimo schválených mapových povrchov
    if (!MAPOVE.some((p) => f.startsWith(p) || f === p) && !f.startsWith('i18n/')) {
      for (const m of t.matchAll(PIKTO)) {
        const e = m[0];
        if (/^[\u0023-\u0039\u00A9\u00AE\u2122\u2B50]$/.test(e)) continue;
        pridaj(emojiMimo, e, f);
      }
    }
  }

  // ── triedenie lucide na koše ──────────────────────────────────────────────
  const polozky = [...lucide.entries()]
    .map(([meno, sub]) => {
      const s = [...sub].sort();
      const mimoUi = s.filter((f) => !f.startsWith(SHADCN));
      return {
        meno,
        pocet: s.length,
        subory: s,
        lenShadcn: mimoUi.length === 0,
        naprotivok: NAPROTIVOK[meno] || null,
      };
    })
    .sort((a, b) => b.pocet - a.pocet || a.meno.localeCompare(b.meno));

  const nepouzite = packSvg.filter((n) => !brandIcon.has(n));

  return {
    kanaly: KANALY,
    brand: {
      packSvg,
      packPouzite: [...brandIcon.keys()].sort(),
      packNepouzite: nepouzite,
      assetSvg,
      handMena,
      handPouzite: [...hand.keys()].sort(),
      handNepouzite: handMena.filter((n) => !hand.has(n)),
    },
    lucide: polozky,
    znaky: [...znaky.entries()]
      .map(([znak, vyskyty]) => ({ znak, pocet: vyskyty.length, vyskyty }))
      .sort((a, b) => b.pocet - a.pocet),
    // ⚠️ Emoji sa NEVYPISUJÚ po jednom, ale po POVRCHOCH. Po jednom ich je 135
    //    a register by sa nedal prečítať — a hlavne: rozhodnutie sa nerobí nad
    //    jedným emoji, ale nad obrazovkou („smie DOG ID hovoriť emoji?"). Tomu
    //    zodpovedá aj hlásenie stráže: pribudla emoji SADA v novom súbore.
    emojiMimoMapy: [...emojiMimo.entries()]
      .map(([emoji, sub]) => ({ emoji, subory: [...sub].sort() }))
      .sort((a, b) => b.subory.length - a.subory.length),
    emojiPovrchy: (() => {
      const podla = new Map();
      for (const [emoji, sub] of emojiMimo) {
        for (const s of sub) {
          if (!podla.has(s)) podla.set(s, []);
          podla.get(s).push(emoji);
        }
      }
      return [...podla.entries()]
        .map(([subor, emoji]) => ({ subor, emoji: emoji.sort(), pocet: emoji.length }))
        .sort((a, b) => b.pocet - a.pocet);
    })(),
    suhrn: {
      lucideMien: polozky.length,
      lucideMienMimoShadcn: polozky.filter((p) => !p.lenShadcn).length,
      lucideSuborov: new Set(polozky.flatMap((p) => p.subory)).size,
      lucideSuborovMimoShadcn: new Set(polozky.flatMap((p) => p.subory).filter((f) => !f.startsWith(SHADCN))).size,
      maNaprotivok: polozky.filter((p) => p.naprotivok && !p.lenShadcn).length,
      bezNaprotivku: polozky.filter((p) => !p.naprotivok && !p.lenShadcn).length,
      znakov: znaky.size,
      emojiPovrchov: new Set([...emojiMimo.values()].flatMap((s) => [...s])).size,
      emojiSpolu: emojiMimo.size,
      brandPackSpolu: packSvg.length,
      brandPackNepouzitych: nepouzite.length,
      brandHandSpolu: handMena.length,
    },
    chyby,
  };
}

/** Kľúč položky pre baseline — stabilný naprieč presunmi súborov. */
export const kluc = {
  lucide: (p) => `lucide:${p.meno}`,
  znak: (z) => `znak:${z.znak}`,
  emoji: (p) => `emoji@${p.subor}`,
};

export { NAPROTIVOK, ZNAKY, MAPOVE, SHADCN };
