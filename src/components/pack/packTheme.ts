import { getPackSkin, usePackSkin } from './packSkin';
// LAPIS = hlavná akcia na BLEDOM podklade (viď `.pf-toggle__opt.is-on` nižšie).
// `navGoldSkin.ts` nemá žiadne importy, takže kruh nevzniká.
import { LAPIS, PICK_INK, pickTintCSS } from './navGoldSkin';
// Pack theme tokens — vlastný modul (NIE v PackLayout.tsx).
// Dôvod: konštanta exportovaná spolu s React komponentmi láme Vite Fast Refresh
// (každý edit PackLayout = full reload → cobe globe sa roztrhne). Oddelené = HMR čisté.
//
// Soft sandy palette — bledé papyrusové bloky (karty) na ČIERNOM pozadí (web-konzistentné).
// POZN: bgTop/bg/bgBottom = svetlé VÝPLNE VNÚTRI kariet (HeroCard/PackTree/skeletony), NIE page bg.

// ── TYPOGRAFICKÝ PORIADOK (Matej 2026-07-26: „prečo sa mi zdá že všetko je cinzelom") ──
// Trips klaster (PackMap 33× / PackTriplist 17× / PackTripArticle 9×) bol jednofontový —
// všetko Cinzel, nula Space Grotesku. To je proti nášmu vlastnému systému:
//   `index.css`  → `body { Space Grotesk }`, `h1–h6 { Cinzel }`
//   `Entry.tsx`  → eyebrow = Space Grotesk 500 / .26em / uppercase, sub = Space Grotesk
//   `.btn-gold`  → LOCKED brand CTA = Cinzel 700 uppercase
// Delenie rolí:
//   FONT_TITLE = identita — nadpisy, názvy výletov/miest, CTA tlačidlá, rang (Pútnik)
//   FONT_UI    = zvyšok — eyebrow popisky, dáta, čísla, chipy, badge, meta, tooltipy
// ⚠️ Space Grotesk je v index.html načítaný len vo váhach 300–600. `font-weight:700` by
//    prehliadač dosyntetizoval (fake bold, rozmazané hrany) — strop je 600.
// ⚠️ NEPOUŽÍVAJ 'DM Sans' — v projekte sa nikde nenačítava, padá to na system-ui.
export const FONT_TITLE = "'Cinzel',serif";
export const FONT_UI = "'Space Grotesk',sans-serif";
export const PACK_THEME = {
  // "Naše tmavé" — #050505 + bg-dark.webp heroglyf textúra (ako GodsGrid / heroglyph flow)
  pageBg: '#050505',
  glass: 'rgba(5, 5, 5, 0.72)',
  glassSoft: 'rgba(5, 5, 5, 0.55)',
  onDark: 'rgba(245, 240, 228, 0.86)',
  onDarkDim: 'rgba(245, 240, 228, 0.46)',
  onDarkHair: 'rgba(245, 240, 228, 0.10)',
  onDarkBorder: 'rgba(245, 240, 228, 0.18)',
  // Light fills INSIDE cards (papyrus) — neslúžia ako page bg
  bgTop: '#F2E5C7',
  bgBottom: '#E5D5B3',
  bg: '#EDDCBD',
  // `card` = PLNÁ farba, nie gradient — používa sa aj ako `color:` (svetlý text na
  // tmavom podklade, napr. hover overlay avatara). Pre pozadie karty ber `cardGrad`.
  card: '#FBF5E6',
  cardSoft: '#FCF4DF',
  ink: '#1F1A0E', // off-black, warm
  inkDim: 'rgba(31, 26, 14, 0.62)',
  inkFaint: 'rgba(31, 26, 14, 0.42)',
  // ── PAPYRUS LOCK (2026-07-26, Matej: „dizajn bledých blokov sme si lockli
  // podľa /entry") — zdroj pravdy = src/pages/Entry.tsx `.religion-card`,
  // `.crit-tile`, `.religion-rule`. Bledý blok NIE je plochá biela so šedým
  // hairlinom; je to papyrusový gradient v zlatom ráme so zlatým halo ringom.
  // Šedé hairliny (rgba(31,26,14,…)) sú preto preložené na tlmenú zlatú.
  hairline: 'rgba(201, 154, 63, 0.30)',
  border: 'rgba(201, 154, 63, 0.45)',
  /** Pozadie bledej KARTY (`.religion-card`). */
  cardGrad: 'linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%)',
  /** Pozadie menšieho bledého PANELU (tooltip/modal v /entry). */
  panelGrad: 'linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%)',
  /** Vonkajší okraj bledej karty — 1.5px solid, plná zlatá. */
  cardEdge: '#C99A3F',
  /** Tieň bledej karty vrátane zlatého halo ringu a horného inner highlightu. */
  cardShadow:
    '0 14px 44px rgba(0,0,0,0.55), 0 0 0 4px rgba(201,154,63,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
  /** Tieň menšieho panelu (užší ring). */
  panelShadow: '0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15)',
  /** Výplň dlaždice/políčka VNÚTRI bledej karty (`.crit-tile`). */
  tileBg: 'rgba(201, 154, 63, 0.06)',
  /** Deliaca čiara vnútri bledej karty — zlatá, vyblednutá do strán. */
  rule: 'linear-gradient(90deg, transparent, #C99A3F, transparent)',
  /** Tmavý inkoust na papyruse pre nadpisy (Cinzel) — teplejší než `ink`. */
  inkStrong: '#2a1608',
  /** Sekundárny text na papyruse (Space Grotesk sub). */
  inkWarm: '#7a5a2a',
  accentGold: '#C99A3F',
  // ── EGYPTSKÁ MODRÁ — kánonická sekundárna brandu ──────────────────────────
  // Zdroj: `--brand-blue: #1034A6` v index.css (brand manuál 2026). Sem sa dvíha
  // preto, aby ju `/pack` nemusel písať ako literál — CSS premenná sa v inline
  // štýloch a v JS template literáloch (NQ_CSS, HUB_CSS) používa mizerne.
  // KEDY PO NEJ SIAHNUŤ: keď zlatá na tom istom povrchu už nesie iný význam.
  // Príklad: v kvíze je zlatá VÝBER (vybratá odpoveď, CTA) — progres teda nesmie
  // byť tiež zlatý, inak sa dva rôzne významy nedajú od seba odlíšiť.
  brandBlue: '#1034A6',
  /** Svetlejší koniec modrého gradientu. Tá istá modrá ako `partHek` nižšie. */
  brandBlueLite: '#2E5FD0',
  growGreen: '#3D7A4E',
  // ── FIALOVÁ = VÝLETY. JEDNA, NIE VIAC (LOCKED 2026-08-28) ─────────────────
  // Matej: „použime fialovú ktorá je v brande, resp je pri svetelnom meči.. je to
  // ona (nepoužívajme viac fialových len jednu a tú si definujme)".
  // Toto JE tá jedna — sýte telo svetelného meča, ktorým sa kreslí trasa.
  // Naprieč `/pack` už dovtedy ležala ako literál `#7A2FBF` / `rgba(122,47,191,…)`
  // na desiatkach miest; odteraz má meno a berie sa odtiaľto.
  // KEDY PO NEJ SIAHNUŤ: keď prvok hovorí o VÝLETE (trasa, kotva, výrez náhľadu,
  // odznak prejdenia). Nie na chrome — tam je zlato a lapis.
  // ⚠️ NEZAKLADAJ druhý odtieň fialovej. Svetlá `TRAIL_LINE.light` a tmavá
  // `.edge` NIE SÚ ďalšie farby — sú to vrstvy ŽIARY tej istej čiary (technika
  // kreslenia meča), a mimo neho sa nepoužívajú ako samostatná farba.
  tripPurple: '#7A2FBF',
  /** Tá istá fialová v zložkách — na skladanie rgba() bez druhého literálu. */
  tripPurpleRGB: '122,47,191',
  // ── Canonical TRANSPARENCY MODEL part colors (LOCKED 2026-06-09) ──────────
  // Jeden zdroj pravdy pre FounderInvite (back of block 5) + TransparentStats
  // (block 3) — farby MUSIA sedieť v oboch. Rozvoj zlatožltá · marketing tyrkys
  // · direct help červená · hektor fialová.
  partDev: '#C99A3F', // rozvoj — zlatožltá (brand gold)
  partMkt: '#1AA39A', // marketing — tyrkysová (brand faience core)
  partHelp: '#C0453A', // direct help — červená
  partHek: '#2E5FD0', // hektor — Egyptian blue accent (bývalá fialová, 2026-06-15)
  growGreenSoft: 'rgba(61, 122, 78, 0.12)',
  alertRed: '#B25640',
  alertRedSoft: 'rgba(178, 86, 64, 0.12)',
};

// ── LIQUID GLASS primitív (LOCKED design language, 2026-07-23) ───────────────
// JEDEN zdroj pravdy pre „obsahovú časť" na heroglyf pozadí: obsah nesmie plávať
// priamo na čiernej — ide do frosted panelu (.pk-glass) cez ktorý heroglyfy
// presvitajú (backdrop-blur). Bloky vnútra = .pk-glass-block. Reuse: triplist,
// trip článok, walked — všade rovnaká situácia = rovnaký primitív. NEmixovať s
// plnou čiernou. Render `<style>{GLASS_CSS}</style>` v komponente.
// ── MATRICA BLOKOV — 5 ÚROVNÍ, JEDEN ZDROJ (2026-08-13) ─────────────────────
// Matej: „základ a životný štýl majú slabé okraje a potom dolu v druhom bloku sú zas
// iné výraznejšie... vytiahni DNA z nášho projektu /pack aby to nebolo všade iné,
// kludne si vytvorme matricu a pridávajme len podľa toho lebo to vyzerá neprofesionálne".
//
// Matrica NEVZNIKÁ TERAZ — existuje v CLAUDE.md od 26. 7. Chýbalo jej vynútenie: v profile
// bolo naraz 6× `hairline` rám, 3× `1px cardEdge`, 4× radius 12 a dve natvrdo písané rgba.
// Toto je tá istá matrica ako vykonateľný kód, aby sa nová vec nedala pridať „od oka".
//
// ⚠️ ZMENA OPROTI LOCKU Z 26. 7.: úroveň 2 (PODBLOK) mala predpísané `tileBg` + `border`
// + r10 — plochú výplň so slabým rámom. Matej ju zamietol DVAKRÁT („je to suche bez šťavy"
// 26. 7., „je to také plané" 12. 8.), takže kánonom sa stáva recept, ktorý schválil:
// papyrusový gradient + plný zlatý rám + jemný lift. Plochý `tileBg` klesol na úroveň 3,
// kam patrí — na RIADOK v zozname, nie na sekciu.
//
// Použitie: `style={{ ...PACK_BOX.subblock, padding: '15px 16px' }}` — matrica dáva
// výplň/rám/radius/tieň, komponent si dopĺňa len rozostupy.
// ════════════════════════════════════════════════════════════════════════════
// STUPNICE `/pack` — LOCKED 2026-09-13 (Matejov výber v nákrese, 11/11)
// ────────────────────────────────────────────────────────────────────────────
// Nákres: `plany/nakres-dizajnovy-system-pack-2026-09-13.html`
// Zadanie: `plany/zadanie-dizajnovy-audit-pack-2026-09-13.md`
//
// Matej 13. 9. 2026: „nemôžu byť bloky pri komunite na homepage iné ako v DOG ID
// alebo /dogs, respektíve môžu ale musia byť všetky cheknuté, musíme ich mať
// v našej databáze a vedieť ich pomenovať ako napr. dblok."
//
// 🔴 TOTO NIE JE NÁVRH — je to sada, ktorú vynucuje `scripts/check-pack-scale.mjs`.
//    Číslo mimo nej zhodí build. Nový tvar sa NEPRIDÁVA do komponentu, ale SEM,
//    a musí dostať MENO v `PACK_BLOCKS` nižšie.
// ════════════════════════════════════════════════════════════════════════════

/** Polomery rohov — 4 stupne + 1 locknutý (výber `r4`). */
export const PACK_R = {
  /** Pilulka, chip, avatar, odznak. */
  pill: 999,
  /** Pole formulára, tlačidlo (`.btn-gold` lock = 8). */
  field: 8,
  /** Riadok zoznamu a dlaždica vnútri karty. */
  tile: 12,
  /** 🔒 D-BLOK — zlatý rám. Číslo je NAV_R.frame zo spodného navu, teda LOCK,
   *  nie voľba. Preto má vlastný stupeň: odchýlka, ktorá je pomenovaná a evidovaná,
   *  nie odchýlka, ktorá sa niekde stratila. */
  frame: 14,
  /** Karta stránky a plávajúci panel. */
  card: 16,
} as const;

/** Rebrík odsadení — násobky štvorky (výber `s5`).
 *  ⚠️ 15. 9. 2026 pribudli `xxl` 32 a `xxxl` 48 (Matej). Dovtedy rebrík končil na
 *  24, no kód reálne používal 26 · 28 · 30 · 32 · 34 · 44 · 46 · 48 — teda si
 *  veľké medzery vymýšľal zakaždým nanovo. Pomer medzi stupňami ostáva ~1,5×.
 *  Medzi 24 a 32 sa neotvára nič ďalšie: 26/28/30 patria na 24 alebo 32. */
export const PACK_SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

// ════════════════════════════════════════════════════════════════════════════
// VZDUCH OD OKRAJA OBRAZOVKY — JEDNO ČÍSLO PRE CELÚ APPKU (LOCK 24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 24. 9. 2026 nad krokom 2 vstupu: *„úvod máme zlý = lockni a nastav to
// konečne pre každú stránku, aby sme mali minimálne rozostupy od okrajov
// a nevzniklo toto"* (deň predtým to isté o rezerve hore a dole).
//
// 🔒 `PAGE_AIR` NIE JE „padding tejto stránky". Je to DNO: rezerva, pod ktorú
//    nesmie klesnúť žiadna obrazovka na žiadnej šírke ani výške. Kto chce viac
//    vzduchu, pridá si ho DNU; kto sa nezmestí, ZMENŠÍ OBSAH — nie rezervu.
//    (Na kroku 2 ustúpil ako prvý medailón: 148 → 118 → 96 px podľa výšky okna.)
// 🔴 Pod tento lock spadá aj pasca `justify-center` + `overflow-y-auto`:
//    pretečenie sa rozdelí na OBE strany a horná časť sa nedá odrolovať (scroll
//    nevie ísť do záporu). Centruje sa preto `margin: auto` na dieťati — recept
//    je vo `FLOW_STAGE_CSS` (`screens/flowPaleSkin.ts`), ktorý si toto číslo
//    berie odtiaľto.
// ⚠️ Hodnoty sú z `PACK_SPACE` (16 · 24), nie zvolené nanovo — vzduch od okraja
//    je tá istá stupnica ako vzduch vnútri.
// ════════════════════════════════════════════════════════════════════════════
export const PAGE_AIR = {
  /** Hore a dole do 767 px šírky. */
  min: PACK_SPACE.lg,
  /** Hore a dole od 768 px. */
  md: PACK_SPACE.xl,
  /** Po stranách vždy. */
  side: PACK_SPACE.lg,
} as const;

/** Typografická stupnica — 6 veľkostí, ŽIADNE desatiny (výber `t6`).
 *  ⚠️ 9,5 / 10,5 / 12,5 sú od 13. 9. 2026 mimo sady. Mikropopisok je 10. */
export const PACK_TEXT = {
  /** Mikropopisok, eyebrow, odznak. */
  micro: 10,
  /** Popisok, chip, meta. */
  label: 12,
  /** Bežný text. */
  body: 14,
  /** Zvýraznený text, lead odsek. */
  lead: 16,
  /** Nadpis sekcie vnútri karty (keď nesie Cinzel). */
  h2: 20,
  /** Nadpis karty. */
  h1: 24,
} as const;

/** Nadpisy — TRI tvary podľa úrovne (výber `h2`, tretí pribudol 15. 9. 2026).
 *
 *  ⚠️ Tretí tvar nie je nový nápad — rozsudzuje ROZPOR, ktorý si brand lock
 *  niesol sám v sebe: `plany/locky/brand.md` r. 36 predpisuje eyebrow
 *  „Space Grotesk 500 / letter-spacing .22em", r. 112 pre ten istý eyebrow na
 *  papyruse „.26em". Dve čísla pre jeden prvok na dvoch riadkoch jedného locku.
 *  Preto sú odteraz DVA prvky s menom: `section` (tichý eyebrow vnútri karty)
 *  a `label` (široký, rozstrelený štítok — pečiatka). Naprieč `/pack` bežalo
 *  20 hodnôt `letterSpacing`; skupina .26–.34em je práve tento druhý prvok. */
export const PACK_HEAD = {
  /** Názov KARTY — veľký Cinzel. Orientačný bod stránky. */
  card: {
    fontFamily: FONT_TITLE,
    fontWeight: 700,
    fontSize: PACK_TEXT.h1,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  /** Názov SEKCIE vnútri karty — tichý eyebrow. */
  section: {
    fontFamily: FONT_UI,
    fontWeight: 500,
    fontSize: PACK_TEXT.micro,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  /** ŠTÍTOK — široký rozstrelený popisok, číta sa ako pečiatka.
   *  Zlatý inkoust na papyruse (`T.cardEdge`) je brandový vzor z r. 112 locku. */
  label: {
    fontFamily: FONT_UI,
    fontWeight: 500,
    fontSize: PACK_TEXT.micro,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
  },
} as const;

export const PACK_BOX = {
  /** 1 — KARTA: samostatný blok stránky (profil, sieť, účet). */
  card: {
    background: PACK_THEME.cardGrad,
    border: `1.5px solid ${PACK_THEME.cardEdge}`,
    borderRadius: PACK_R.card,
    boxShadow: PACK_THEME.cardShadow,
  },
  /** 2 — PODBLOK: sekcia vnútri karty (ZÁKLAD, ŽIVOTNÝ ŠTÝL, kroky 1–3). */
  subblock: {
    background: PACK_THEME.panelGrad,
    border: `1px solid ${PACK_THEME.cardEdge}`,
    borderRadius: PACK_R.tile,
    boxShadow: '0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40)',
  },
  /** 2b — TMAVÝ PODBLOK: tá istá sekcia, ale čierna. VÝNIMKA Z PAPYRUSOVÉHO LOCKU,
   *  a to zámerne úzka — jediný dôvod ju siahnuť je VÝZNAM, nie vkus: ZÁVET na doklade
   *  DOG ID („keby si tu nebol") je jediné miesto, kde sa hovorí o smrti, a papyrus ho
   *  robil rovnakým riadkom ako obľúbené maškrty (Matej 13.8.2026).
   *  GEOMETRIA JE ZHODNÁ s úrovňou 2 — 1px zlatý rám, radius 12 — takže v mriežke blokov
   *  to ostáva SÚRODENEC, len čierny; iný radius alebo iný rám by z toho spravil cudzí
   *  komponent. Mení sa výplň a inkoust, nič iné.
   *  Text na ňom: `onDark` / `onDarkDim`, pilulky `.pk-pill--dark`. NEROZŠIRUJ na písacie
   *  povrchy — vstupy ostávajú `.pf-field--flat` (papyrus), písať sa má do svetla. */
  subblockDark: {
    background: `linear-gradient(135deg, #171009 0%, ${PACK_THEME.pageBg} 100%)`,
    border: `1px solid ${PACK_THEME.cardEdge}`,
    borderRadius: PACK_R.tile,
    boxShadow: '0 1px 3px rgba(0,0,0,0.45), inset 0 1px 0 rgba(245,240,228,0.10)',
  },
  /** 3 — RIADOK: položka zoznamu (člen línie, riadok knihy). Plochá, aby ich desať pod
   *  sebou nerobilo z karty schodisko. */
  row: {
    background: PACK_THEME.tileBg,
    border: `1px solid ${PACK_THEME.border}`,
    borderRadius: PACK_R.tile,
  },
  /** 4 — MODAL / plávajúci panel nad stránkou. */
  panel: {
    background: PACK_THEME.panelGrad,
    border: `1.5px solid ${PACK_THEME.cardEdge}`,
    borderRadius: PACK_R.card,
    boxShadow: PACK_THEME.panelShadow,
  },
} as const;

// ════════════════════════════════════════════════════════════════════════════
// KATALÓG BLOKOV — „naša databáza blokov" (Matej 2026-09-13)
// ────────────────────────────────────────────────────────────────────────────
// Každý tvar bloku, ktorý sa v `/pack` smie objaviť, má MENO a je tu.
// Blok, ktorý tu nie je, v appke neexistuje — buď použi jeden z týchto, alebo
// si vypýtaj nový a zapíš ho SEM (aj do sekcie BLOCKS v brand manuáli).
//
// Prečo katalóg a nie len matrica: matrica hovorí, ako blok VYZERÁ. Katalóg
// hovorí, ako sa VOLÁ a KEDY sa používa — bez toho vzniká šiesty tvar zakaždým,
// keď niekto nevie, či to, čo stavia, je karta alebo panel.
// ════════════════════════════════════════════════════════════════════════════

export const PACK_BLOCKS = {
  'D-BLOK': {
    recept: 'goldFrameCSS() — navGoldSkin.ts',
    polomer: PACK_R.frame,
    kedy: 'Blok v zlatom odliatku so zapustenou doskou. Nesie NAJVYŠŠIU úroveň — '
      + 'spodný nav, dok mapy, a na homepage PRESNE DVA bloky (JA+SVORKA, KOMUNITA).',
    lock: 'Hover mení iba transform — box-shadow nesie celý odliatok (11. 9. 2026).',
  },
  KARTA: {
    recept: 'PACK_BOX.card',
    polomer: PACK_R.card,
    kedy: 'Samostatný blok stránky: DOG ID, profil, kalendár, sieť, účet.',
  },
  PODBLOK: {
    recept: 'PACK_BOX.subblock',
    polomer: PACK_R.tile,
    kedy: 'Sekcia vnútri KARTY — ZÁKLAD, ŽIVOTNÝ ŠTÝL, kroky 1–3, dlaždice polí.',
  },
  'PODBLOK TMAVÝ': {
    recept: 'PACK_BOX.subblockDark',
    polomer: PACK_R.tile,
    kedy: 'Tá istá sekcia, ale čierna. Siaha sa po nej za VÝZNAM, nie za vkus — '
      + 'zatiaľ jediný držiteľ je ZÁVET na DOG ID. Nie na písacie povrchy.',
  },
  RIADOK: {
    recept: 'PACK_BOX.row',
    polomer: PACK_R.tile,
    kedy: 'Položka zoznamu — člen línie, riadok knihy, správa v inboxe. Plochá, '
      + 'aby ich desať pod sebou nerobilo z karty schodisko.',
  },
  PANEL: {
    recept: 'PACK_BOX.panel',
    polomer: PACK_R.card,
    kedy: 'Plávajúci modal nad stránkou. BEZ KRÍŽIKA — von sa ide klikom mimo alebo Esc.',
  },
  'CTA ZLATÉ': {
    recept: 'DVE POLOHY — GOLD_BTN (tmavý podklad) · BRAND_GOLD_BTN (papyrus)',
    polomer: PACK_R.field,
    kedy: 'Zlaté tlačidlo. Na NAOZAJ TMAVOM podklade (tmavý panel, pk-glass, fotka) '
      + 'je to zlato-oranžový GOLD_BTN; na PAPYRUSE brandová zlatá BRAND_GOLD_BTN '
      + '(Matej 15. 9.: „oranžovo-žltá sa používa najmä na dark téme"). Hlavná akcia '
      + 'na bledom je stále LAPIS — zlaté je až druhá či tretia akcia na obrazovke.',
    lock: 'Tvar je locknutý: radius 8, NIE pilulka. Hodnoty opísané z `.btn-gold` '
      + 'v SpiralLanding.css (brand lock), brandová rampa z locku „ZLATÁ PLOCHA ≠ '
      + 'ZLATÉ TLAČIDLO". ⚠️ Povolenie platí pre TLAČIDLO — tá istá zmes na karte '
      + 'alebo páse je žltá plocha a patrí AINUBISOVI, nie nám.',
  },
  'AI-PALUBA': {
    recept: 'ainubisSkin.ts — AINUBIS.*',
    polomer: PACK_R.card,
    kedy: 'Povrch, kde hovorí AINUBIS: chat, koučovanie mapy, a KAŽDÉ hlásenie '
      + 'či otázka o bezpečnosti. Vlastná paleta (tmavá modrá + cyan, CTA zlato-oranžové) — '
      + 'je to jeho brand, nie odchýlka od nášho.',
  },

  // ── PRIBUDLO 14. 9. 2026 ────────────────────────────────────────────────
  // Matej po nákrese `plany/nakres-pet-nepomenovanych-2026-09-14.html`:
  // „dávam na tvoj návrh ale pozor treba rozlišovať, pri mapách sú kruhové
  //  značky s obrysmi rôznej farby aj veľkosti oprávnene ... aby boli text
  //  area, bloky, pils, fotky nadpisy progresbary atď vždy rovnaké bez toho
  //  aby bolo milion verzii a nesurodych dizajnov na každej stránke."
  //
  // Meranie, z ktorého to vzišlo (živý sken 9 obrazoviek x 2 šírky):
  // pilulka 1050 výskytov / 59 verzií · medailón 855 / 71 · lišta 79 / 21 ·
  // pole 32 (v kóde 132) / 6 · závoj 17 (v kóde 216x backdrop-filter) / 7.
  // Recepty na POLE a PILULKU v tomto súbore UŽ BOLI — chýbalo im meno,
  // takže sa ich nikto nedržal. Zvyšok meno nemal vôbec.
  // ────────────────────────────────────────────────────────────────────────

  POLE: {
    recept: 'PF_FIELD_CSS — .pf-field',
    polomer: PACK_R.field,
    kedy: 'Miesto, kam človek PÍŠE alebo vyberá: input, textarea, select. '
      + 'Popisok vedľa poľa = .pf-inline-grid (jedna mriežka na všetky riadky).',
    lock: 'Zaostrené pole má lapisové halo, rám ostáva zlatý (12. 9. 2026). '
      + 'Písať sa má do svetla — na PODBLOK TMAVÝ sa pole nedáva.',
  },
  PILULKA: {
    recept: 'PILL_CSS — .pk-pill',
    polomer: PACK_R.pill,
    kedy: 'Krátky údaj alebo voľba v oblom tvare. DVE POLOHY, ktoré sa nemiešajú: '
      + 'ŠTÍTOK (needá sa kliknúť, bez .pk-pill--tap) a VOĽBA (klikateľná, --tap). '
      + 'Na tmavom podklade --dark, aktívna/hodnotná --gold, zamknutá --locked.',
    lock: 'Plná farebná plocha patrí jedinému hlavnému CTA na obrazovke. Výnimka je '
      + 'NEINTERAKTÍVNY štítok (pilulka dní na psom bloku, lapis od 12. 9. 2026). '
      + 'Text: názov/identita Cinzel 700, ČÍSLO Space Grotesk 600.',
  },
  NADPIS: {
    recept: 'PACK_HEAD.card / PACK_HEAD.section',
    polomer: null,
    kedy: 'DVA tvary a nič medzi nimi: názov KARTY (Cinzel 700/24/.14em) a názov '
      + 'SEKCIE vnútri karty (Space Grotesk 500/10/.22em). Tretí tvar nadpisu '
      + 'znamená, že blok je zle zaradený — nie že potrebuje nové písmo.',
  },
  MEDAILÓN: {
    recept: 'MEDALLION_CSS — .pk-medallion + PACK_AVATAR',
    polomer: PACK_R.pill,
    kedy: 'Kruh, ktorý drží FOTKU ALEBO IDENTITU — avatar psa a človeka, vlajka, '
      + 'heroglyf, odznak poradového čísla.',
    lock: 'LEN fotka a identita. Počítadlo v kruhu je PILULKA, okrúhle tlačidlo je '
      + 'tlačidlo — v skene z 14. 9. bolo 71 verzií kruhu práve preto, že tri rôzne '
      + 'veci nosili jeden tvar a nikto nevedel, ktorú z nich kopíruje.',
  },
  FOTKA: {
    recept: 'PHOTO_CSS — .pk-photo',
    polomer: PACK_R.tile,
    kedy: 'Obdĺžnikový držiak obrázka — galéria psa, plagát výletu, náhľad v karte. '
      + 'Kruhová fotka nie je FOTKA, je to MEDAILÓN.',
  },
  PROGRES: {
    recept: 'PROGRESS_CSS — .pk-progress',
    polomer: PACK_R.pill,
    kedy: 'Vodorovný pruh, ktorý hovorí KOĽKO Z CELKU je hotové. Výška 6 px, '
      + 'koľajnica + výplň, číslo vedľa neho (nie v ňom).',
    lock: 'Percento vyplnenia DOG ID má VLASTNÉ DVE FARBY (lock 12. 9. 2026): '
      + 'pod 100 % červená #B25640, na 100 % zelená #3D7A4E. Inde je výplň zlatá.',
  },
  ZÁVOJ: {
    recept: 'VEIL_CSS — .pk-veil--modal / --photo / --plate',
    polomer: null,
    kedy: 'Priesvitná plocha, ktorá stmaví to, čo je POD ňou, aby bol nad ňou '
      + 'čitateľný text alebo aby vystúpil panel. TRI POLOHY a nič medzi nimi: '
      + 'MODAL (za plávajúcim panelom) · FOTO (spád pod textom na obrázku) · '
      + 'DOŠTIČKA (malá plocha pod pilulkou alebo ikonou na fotke).',
    lock: 'Tmavosť si NEVOLÍ komponent. V kóde bolo 14. 9. 2026 dvestošestnásť miest '
      + 'so sklom a tmavosti 0,28 / 0,32 / 0,55 vedľa seba. Doštička má zámerne '
      + 'tú istú výplň ako .pk-pill--dark — je to tá istá vrstva nad fotkou.',
  },
  // ── PRIBUDLO 15. 9. 2026 ────────────────────────────────────────────────
  // Matej: „potrebujeme tam panel bud priesvitný alebo liquid glass" (plocha správ,
  // kde bubliny splývali s hieroglyfovou tapetou).
  'SKLENENÁ DOSKA': {
    recept: 'STAGE_CSS — .pk-stage',
    polomer: PACK_R.card,
    kedy: 'Plocha, na ktorej stojí OBSAH nad vlastnou tapetou appky — dnes telo '
      + 'konverzácie. Tapetu nechá presvitať a len ju rozmaže, takže text nad ňou drží.',
    lock: '⚠️ NIE JE TO ZÁVOJ: ten ZAKRÝVA to, čo je pod ním, a je to prekrytie — '
      + 'doska je podklad obsahu. Ani `.pk-glass`, to je sklo pre TMAVÝ povrch a na '
      + 'papyruse zmizne. Farbu nesie povrch (`--pk-stage` / `--pk-stage-edge`), '
      + 'rozmery volajúci; tvar a rozostrenie tento recept.',
  },
} as const;

// ════════════════════════════════════════════════════════════════════════════
// ČO MENO NEDOSTALO — A PREČO (14. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// LIŠTA (vodorovný pás cez celú šírku — nav, hlavička, pätka) meno NEDOSTALA.
//   Sken našiel 21 verzií, ale NAJČASTEJŠIA z nich (342x64, radius 14) už meno MÁ:
//   je to D-BLOK. Ôsme meno by mu konkurovalo. Pás je teda vždy jeden z blokov
//   vyššie — D-BLOK, PODBLOK alebo RIADOK — podľa toho, akú úroveň nesie.
//
// ZNAČKA NA MAPE meno nedostala, lebo NIE JE NÁBYTOK — je to ÚDAJ.
//   Matej 14. 9. 2026: „pozor treba rozlišovať, pri mapách sú kruhové značky
//   s obrysmi rôznej farby aj veľkosti oprávnene."
//   Farba obrysu nesie DRUH značky a veľkosť nesie dôležitosť alebo zhluk —
//   zjednotiť ich znamená zmazať informáciu. Geometria má vlastný lock
//   (`mapnotes/circleMark.ts` 28/2.5 px, `mapDockShape.ts`, `markEmoji.ts`)
//   a stráž `check:pack` tie súbory zámerne nekontroluje.
//   ⚠️ To isté platí o EMOJI na mape — celá mapa hovorí emoji, hoci inde
//   v appke platí hand-drawn set. Je to evidovaná výnimka, nie neporiadok.
// ════════════════════════════════════════════════════════════════════════════

/** Tiene — 3 výšky (výber `sh3`). Tieň nesie JEDINÚ informáciu: ako vysoko prvok stojí. */
export const PACK_SHADOW = {
  /** Leží na stránke. */
  card: PACK_THEME.cardShadow,
  /** Pláva nad ňou. */
  panel: PACK_THEME.panelShadow,
  /** Reakcia na dotyk. ⚠️ Na D-BLOKU sa nepoužíva — ten sa dvíha transformom. */
  lift: '0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40)',
} as const;

// ── CTA ZLATÉ — recept zlatého tlačidla (2026-09-15, Matejov výber) ──────────
// Prečo vzniká: `.btn-gold` je locknuté brandové CTA od začiatku, ale v `/pack`
// nemalo ANI JEDNU definíciu — bolo RUČNE PREPÍSANÉ v 39 súboroch. Inventúra
// 15. 9.: gradient v deviatich zápisoch (`135deg,#F5C73D 0%,#E69E1A 100%` 24×
// a ten istý bez stopiek 16×), lem v šiestich (`0.30` 21× · `0.3` 5× · `0.55`),
// žiara v siedmich veľkostiach. Z 215 ručných rámov celého `/pack` patrí tomuto
// tlačidlu 28 a z 26 žiar dvadsať — teda najväčší jediný vinník toho, čo Matej
// 13. 9. videl ako „každý blok vyzerá inak".
//
// 🔴 HODNOTY SÚ OPÍSANÉ, NIE VYBRANÉ. Zdroj je ten, ktorý menuje brand lock
//    (`plany/locky/brand.md`, „CTA button — TVAR (LOCKED)"): `.btn-gold`
//    v `components/landing/SpiralLanding.css` r. 228–248 — gradient, lem, radius,
//    žiara v pokoji aj pri dotyku sedia znak po znaku. Tento recept nič nemení,
//    len konečne dáva `/pack` miesto, odkiaľ si to má brať.
//
// Je to DVOJIČKA `LAPIS` + `LAPIS_BTN_SHADOW` v `navGoldSkin.ts` — tam ten istý
// tvar pre lapisové CTA existuje od 26. 8. a drží. Zlaté ho dostáva teraz.
//
// ⚠️ ZLATÉ CTA NIE JE HLAVNÉ CTA. Kánon od 28. 8. 2026: hlavná akcia je LAPIS
//    na BLEDOM podklade, zlatý gradient patrí na NAOZAJ TMAVÝ. Tento recept
//    existujúce tlačidlá ZJEDNOCUJE, nepovyšuje ich — ktoré z nich majú prejsť
//    na lapis, je samostatná úloha (brand lock: „Plošné prepnutie zvyšku appky").
// ⚠️ ZLATÁ PLOCHA ≠ ZLATÉ TLAČIDLO (lock 28. 8.). Tá istá zmes natretá na KARTU
//    alebo PÁS je žltá a Matej si ju spája s AINUBISOM. Na plochu ber rampu
//    okolo `#C99A3F`. Tento recept je povolenie pre TLAČIDLO, nič viac.
// ⚠️ Smery 90deg a 180deg sem NEPATRIA — to nie sú tlačidlá, ale pruhy a čiary
//    (progres, koľajnica), kde smer nesie význam.
export const GOLD_BTN = {
  /** Výplň tlačidla. Jediný povolený zápis — stopky sú v ňom zámerne, aby sa
   *  dva tvary toho istého gradientu už nedali napísať vedľa seba. */
  grad: 'linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%)',
  /** Krémový lem. NIE `T.border` — tá je zlatá a na zlatej ploche zmizne. */
  edge: 'rgba(250,244,236,0.30)',
  /** Pokoj: žiara okolo tlačidla + horný svetelný lem vo výplni. */
  glow: '0 0 40px rgba(230,158,26,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
  /** Dotyk: tá istá žiara, širšia a sýtejšia. Lem sa nemení. */
  glowHover: '0 0 56px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
} as const;

// ── CTA ZLATÉ, DRUHÁ POLOHA: BRANDOVÁ ZLATÁ NA PAPYRUSE (2026-09-15 večer) ───
// Matej: „na bledom papyruse sú CTA farby lapis a gold a tá oranžovo-žltá sa
// používa najmä na dark téme."
//
// Tým sa `GOLD_BTN` vyššie ZÚŽIL na tmavý podklad — presne ako hovorí jeho vlastné
// varovanie — a papyrus dostal vlastnú zlatú. Nie je to nová farba ani nový tvar:
//  · zastávky `#C99A3F → #A3782B` a rám `#8C6014` sú TÁ ISTÁ brandová rampa, akú
//    lock „ZLATÁ PLOCHA ≠ ZLATÉ TLAČIDLO" (28. 8. 2026) menuje pre plochy, a aké
//    má `TITLE_GRAD` nadpisov — Matejova „zlatá tmavá brand", nie AINUBISOVA;
//  · geometria je locknutá `.btn-gold` (radius 8, Cinzel 700 uppercase) a NEMENÍ sa.
//
// ⚠️ PREČO NIE `GOLD_BTN` NA PAPYRUSE: `#F5C73D→#E69E1A` je svetlejšia ako samotný
//    papyrus, takže tlačidlo na ňom svieti ako lampa a Matej si tú zmes spája
//    s AINUBISOM. Brandová zlatá je od papyrusu TMAVŠIA — číta sa ako tlačidlo.
// ⚠️ INKOUST JE TMAVÝ, nie krémový. Brandová zlatá má jas ~0,36; krémové písmo na nej
//    padá pod 3:1, tmavý inkoust drží nad 5:1. (Na lapise je to naopak — preto tam
//    zlaté písmo ostáva.)
// ⚠️ TOTO STÁLE NIE JE HLAVNÉ CTA. Hlavná akcia na bledom je LAPIS (kánon 28. 8.).
//    Brandová zlatá je TRETIA farba pre tretiu akciu na tej istej obrazovke —
//    precedens: PRIDAŤ HODNOTENIE pod článkom výletu, kde nad ním stoja lapis
//    (parkovisko) a zelená Mapy.com (trasa).
export const BRAND_GOLD_BTN = {
  /** Výplň — brandová rampa, ten istý smer ako `.btn-gold`. */
  grad: 'linear-gradient(135deg,#C99A3F 0%,#A3782B 100%)',
  /** Rám — tmavá zlatá, aby tlačidlo na papyruse malo hranu. NIE krémový lem. */
  edge: '#8C6014',
  /** Inkoust — tmavý papyrusový, `PACK_THEME.inkStrong`. */
  ink: PACK_THEME.inkStrong,
  /** Pokoj: odliatok ako lapisové CTA (vrhnutý tieň + svetlá horná hrana), nie žiara. */
  glow: '0 4px 13px -3px rgba(90,62,16,0.45), inset 0 1px 0 rgba(255,255,255,0.28)',
  /** Dotyk: ten istý odliatok, o kúsok hlbší. */
  glowHover: '0 6px 18px -4px rgba(90,62,16,0.55), inset 0 1px 0 rgba(255,255,255,0.28)',
  /** Dotyk: výplň o odtieň svetlejšia — nie iný gradient. */
  gradHover: 'linear-gradient(135deg,#D9AD55 0%,#B58A34 100%)',
} as const;

// ════════════════════════════════════════════════════════════════════════════
// PAPYRUSOVÁ STRÁNKA — podklad celého povrchu (DRAK → BRIGHT, 2026-09-01)
// ────────────────────────────────────────────────────────────────────────────
// Matej 1. 9. 2026 vybral variant **B**: pri prezliekaní `/pack` do bledého šatu
// nezostáva pod papyrusovými blokmi čierna stránka — papyrus ide aj na POZADIE
// a heroglyfová tapeta sa preladí do zlata na piesku.
//
// ⚠️ TOTO NIE JE `PACK_THEME.pageBg`. Ten (#050505) ostáva platný pre povrchy,
//    ktoré ešte prezlečené NIE SÚ — a je ich väčšina. Čierna na neprezlečenej
//    stránke NIE JE bug, len ešte nevykonaná práca; zoznam čo kedy ide je
//    v `plany/zadanie-drak-bright-pack-2026-09-01.md`.
//
// ⚠️ Prečo tu a nie v `lib/labTheme.ts` (`LAB`): LAB je označený DEV ONLY a slúži
//    labom (`VisionLab`, `AboutLab`, `OnePage`). `/pack` je produkt a berie svoje
//    tokeny odtiaľto. Odtiene sú ZLADENÉ s LAB aj so svetlou WALL (`GodsGrid`
//    `.theme-light`, kde ich Matej doladil ako prvé 9. 8.) — keby sa niekedy
//    LAB a PACK rozišli, rozíde sa aj film od produktu, takže sa menia SPOLU.
//
// Použitie: `<div className="pk-paper">` + jeden `<style>{PAPER_PAGE_CSS}</style>`.
// Tapeta je súčasť receptu — NEVOLAJ k tomu `<HieroglyphBg />` (tá je tmavá).
// ════════════════════════════════════════════════════════════════════════════

/** Základná farba plochy pod tapetou. Zhodné s `LAB.pageBg`. */
export const PAPER_BG = '#F3E4C4';

export const PAPER_PAGE_CSS = `
/* ⚠️ "isolation:isolate" JE NOSNÉ, NIE KOZMETIKA — bez neho tapeta ZMIZNE.
   Vrstvy nižšie stoja na "z-index:-1". Taký potomok sa kreslí v NAJBLIŽŠOM vrstviacom
   kontexte, a keď ho rodič netvorí, prepadne až pod jeho vlastné pozadie — teda pod
   nepriehľadné "background-color" tejto triedy (a ďalej pod čierne pozadie stránky).
   Presne to sa stalo 1. 9. 2026: Matej „prečo si vymazal to pozadie na blogu? bolo tam
   to s heroglyfmi a dal si len čisté". Odmerané: po vypnutí farby rodiča bola plocha
   ČIERNA, nie s glyfmi — vrstva teda ležala pod všetkým.
   "isolation" vrstviaci kontext vytvorí, ale (na rozdiel od "transform"/"filter")
   NEMENÍ obklopujúci blok pre "position:fixed" potomkov, takže spodná navigácia ostáva
   ukotvená k oknu. */
.pk-paper{position:relative;isolation:isolate;min-height:100dvh;background-color:${PAPER_BG};color:${PACK_THEME.inkStrong};}
/* Tapeta a papyrusový odtieň sú DVE vrstvy, nie jedna: obrázok nesie kresbu glyfov,
   gradient nad ním ich zjednotí do teplej plochy. Zlúčené do jedného pravidla by sa
   odtieň nedal stlmiť bez toho, aby zbledli aj glyfy.
   position:fixed (nie absolute): pri scrollovaní článku má tapeta stáť, inak pláva s obsahom. */
.pk-paper::before{content:'';position:fixed;top:0;left:0;width:100vw;height:100lvh;
  background-image:url('/images/bg-light.webp');background-size:cover;background-position:center;
  background-repeat:no-repeat;filter:blur(4px);pointer-events:none;}
/* Multiply-ová logika bledej vinjety z WALL: v strede sýty papyrus, na okrajoch takmer
   čistý — aby sa okraje strácali do SVETLA, nie do tmy. Na tmavom webe to robila čierna
   vinjeta; jej doslovné prefarbenie na bielu by plochu vyžralo do mliečna. */
.pk-paper::after{content:'';position:fixed;top:0;left:0;width:100vw;height:100lvh;
  pointer-events:none;background:
    radial-gradient(ellipse at 52% 58%, rgba(223,196,144,0.62) 0%, rgba(238,221,186,0.34) 52%, rgba(255,252,244,0.10) 100%),
    linear-gradient(135deg, rgba(250,243,225,0.35) 0%, rgba(244,231,199,0.40) 50%, rgba(236,218,175,0.45) 100%);}
/* ⚠️ VRSTVY IDÚ POD OBSAH ZÁPORNÝM z-indexom, NIE dvíhaním obsahu (opravené 2026-09-01).
   Pôvodne tu stálo ".pk-paper > *{position:relative;z-index:1}" — a to je plošný hák,
   ktorý prepíše "position" KAŽDÉMU priamemu potomkovi. Spodná navigácia je "position:fixed";
   prepnutá na "relative" spadla do toku a roztiahla sa cez celú šírku okna (Matej 1. 9.:
   „opäť je zlý spodný nav"). → [[feedback_plosny_hacik_najprv_vypis_co_chyti]]
   "z-index:-1" na pseudoprvkoch ich položí nad pozadie rodiča, ale pod jeho obsah —
   presne to, čo tapeta potrebuje, a obsahu sa nedotýka vôbec.
   ⚠️ PODMIENKA: ".pk-paper" NESMIE byť vrstviaci kontext (žiadny vlastný "z-index",
   "transform", "filter" ani "opacity"), inak by sa doň záporná vrstva uzavrela a zmizla
   pod pozadím. Preto má len "position:relative". */
.pk-paper::before,.pk-paper::after{z-index:-1;}
`;

/**
 * ── KTORÉ POVRCHY SÚ UŽ PREZLEČENÉ DO PAPYRUSU ──────────────────────────────
 * Matej 1. 9. 2026: *„sekunda pred načítaním sa stále zobrazuje tmavé pozadie
 * a slovo načítavam... to treba fixnúť"*.
 *
 * Príčina nebola v stránke, ale v `RouteFallback` v `App.tsx` — celoobrazovkovej
 * ČIERNEJ ploche, ktorá stojí, kým sa donačíta lazy chunk routy. Prefarbiť ju
 * naplocho sa NEDÁ: slúži aj tmavým povrchom (WALL, heroglyph flow, /spiral),
 * kde by z nej bolo biele bliknutie — presne ten istý problém, len naopak.
 *
 * Fallback si preto pýta farbu podľa cesty. Zoznam je TU, vedľa `PAPER_PAGE_CSS`,
 * a nie v `App.tsx`: prezliekanie povrchu a jeho zápis do tohto zoznamu je JEDNA
 * práca a majú byť na dosah. **Kto prezlečie ďalšiu stránku, pridá sem riadok** —
 * inak mu ostane blikať čierna, hoci stránka samotná je papyrusová.
 *
 * ⚠️ `/pack` samotný sem NEPATRÍ — homepage prezlečená ešte nie je a chytila by
 *    prefixom všetko pod sebou.
 */
// ── DVE SKUPINY, LEBO PREPÍNAČ ŠATU NEPOKRÝVA VŠETKO (2026-09-11) ───────────
// `PAPER_ROUTES_LOCKED` = povrchy, ktoré tmavú verziu UŽ NEMAJÚ. Prepínač ich
// preto neovláda a ostávajú bledé v oboch polohách. Nie je to opomenutie:
// 1. 9. 2026 sa ich tmavý šat NAHRADIL, nie zdvojil — `.tl-root` (TRIPLIST) aj
// `.pta-root` (článok výletu) prišli o vlastné pozadie a `min-height` a oboje
// nesie `.pk-paper`, ktorý majú v JSX natvrdo. Vrátiť ich do tmavej znamená
// postaviť tmavú vetvu nanovo, nie prehodiť príznak.
// ✅ A nepostaví sa — Matej 11. 9. 2026: „mapy nemusíš meniť, mapy budú mať len
// bledý dizajn, nie liquid glass." Tento zoznam je teda cieľový stav, nie dočasný.
// ⚠️ Musia ostať aj tu, nielen v JSX: `RouteFallback` v `App.tsx` číta TENTO
//    zoznam, a keby v ňom neboli, bliklo by pred mapou ČIERNE.
export const PAPER_ROUTES_LOCKED: readonly RegExp[] = [
  // CELÁ vetva mapy — `/pack/map` samotná, `/pack/map/triplist` (TRIPLIST + TRIPSTATS)
  // aj článok výletu `/pack/map/<ISO3>/<slug>` a jeho starý tvar `/pack/map/<slug>`.
  //
  // ⚠️ Vzor, nie zoznam krajín: ten by sa musel dopĺňať pri každej novej krajine
  //    a chýbajúci riadok by sa prejavil len bliknutím, teda by si ho nikto nevšimol.
  //
  // ⚠️ KONIEC VZORU MUSÍ BYŤ `(\/|$)`, NIE `\/[^/]*` (opravené 2026-09-02).
  //    Do dneška tu stálo `/^\/pack\/map\/[^/]+/`, čo si pýtalo lomku A ZA ŇOU aspoň
  //    jeden znak — teda `/pack/map/triplist` prešlo, ale SAMOTNÁ MAPA `/pack/map` nie,
  //    hoci je referenciou celého bledého šatu. Pred najčastejšie otváranou stránkou
  //    appky tak blikala čierna. Ani `\/[^/]*` to nerieši: prepustí `/pack/map/`
  //    s lomkou na konci, ale React Router taký tvar nedáva. Odmerané na deviatich
  //    cestách — `(\/|$)` je jediný z troch vzorov, ktorý chytí `/pack/map`.
  /^\/pack\/map(\/|$)/,
  // Tok pridávania — `/pack/add` (redirect) aj `/pack/add/trip`. Obe routy renderujú
  // `PackMap`, teda ten istý papyrusový povrch, len s otvoreným dokom pridávania.
  /^\/pack\/add(\/|$)/,
];

// `PAPER_ROUTES_PAGES` = povrchy prezlečené 8. 9. 2026, ktoré tmavú vetvu MAJÚ
// (ich karty boli papyrusové už predtým, bledý šat je len prepnutie shellu).
// TIETO prepínač ovláda — pri `dark` sa vrátia do stavu spred 8. 9.
//
// ⚠️ Vzory sú PRESNÉ, nie prefixové. `/^\/pack/` by chytilo aj podstránky, ktoré
//    bledú verziu nemajú, a pred nimi by bliklo BIELE — ten istý problém, naopak.
export const PAPER_ROUTES_PAGES: readonly RegExp[] = [
  // Homepage `/pack`.
  /^\/pack$/,
  // Zoznam psov `/pack/dogs` — `/pack/dogs/:id` je DOG ID, samostatný povrch nižšie.
  /^\/pack\/dogs$/,
  // DOG ID `/pack/dogs/<uuid>`.
  // ⚠️ Lookahead na `quiz` OSTÁVA, ale už len preto, aby holé `/pack/dogs/quiz`
  //    (bez kľúča) nespadlo do vzoru pre DOG ID — kvíz má vlastný riadok nižšie.
  /^\/pack\/dogs\/(?!quiz(?:\/|$))[^/]+$/,
  // Kvízy — `/pack/dogs/quiz/<key>` a osobnostný `/pack/nature` (16. 9. 2026).
  //
  // ⚠️ Pôvodná výnimka tvrdila, že kvíz „bledú verziu nemá". To PRESTALO PLATIŤ:
  //    panel kvízu je papyrusový v oboch šatoch (odfotené 16. 9.) — tmavý ostal len
  //    SHELL za ním. Pri zapnutom bledom šate si tak z papyrusového `/pack/dogs`
  //    preklikol do čiernej tapety a späť. Papyrusová karta na čiernej tapete NIE JE
  //    „tmavá vetva", je to nedorobený prevod.
  // ⚠️ `PAPER_ROUTES_PAGES` sa číta LEN pri `skin === 'paper'`, takže tmavý šat
  //    tieto dva riadky nevidí a vyzerá presne ako doteraz.
  /^\/pack\/dogs\/quiz\/[^/]+$/,
  /^\/pack\/nature$/,
  // Profil POUŽÍVATEĽA (s DOG ID nesúvisí) a cudzí profil.
  /^\/pack\/profile(\/|$)/,
  /^\/pack\/u(\/|$)/,
];

/** Spolu — na výpis/diagnostiku. Rozhoduje `isPaperRoute`, nie tento zoznam. */
export const PAPER_ROUTES: readonly RegExp[] = [...PAPER_ROUTES_LOCKED, ...PAPER_ROUTES_PAGES];

/**
 * Má daná cesta stáť na papyruse PRÁVE TERAZ?
 *
 * Vrstvy sú dve: `PAPER_ROUTES_LOCKED` platí vždy, `PAPER_ROUTES_PAGES` len keď je
 * v nastaveniach zapnutý bledý šat (`packSkin.ts`, východisko `dark`).
 *
 * ⚠️ Táto funkcia NIE JE reaktívna — číta šat v okamihu volania. Komponent, ktorý sa
 *    má prekresliť pri prepnutí prepínača, volá `usePaperRoute()` nižšie. Priame
 *    volanie `isPaperRoute` v rendere by po prepnutí nechalo starý šat až do ďalšej
 *    navigácie, a vyzeralo by to, že prepínač nefunguje.
 */
export const isPaperRoute = (pathname: string): boolean =>
  PAPER_ROUTES_LOCKED.some((r) => r.test(pathname)) ||
  (getPackSkin() === 'paper' && PAPER_ROUTES_PAGES.some((r) => r.test(pathname)));

/** To isté, ale prihlásené na prepnutie šatu — pre komponenty. */
export function usePaperRoute(pathname: string): boolean {
  const skin = usePackSkin();
  return (
    PAPER_ROUTES_LOCKED.some((r) => r.test(pathname)) ||
    (skin === 'paper' && PAPER_ROUTES_PAGES.some((r) => r.test(pathname)))
  );
}

// ── ŠÍRKA OBSAHOVÉHO STĹPCA — JEDEN zdroj pre celý /pack (2026-08-13) ────────
// Matej: „vidím že po prekliku na turistický profil je šírka iná ako pri profile...
// možno by bolo fajn to zjednotiť aby tieto bloky boli v /packu jednotné".
// Bolo to rozídené: `PackLayout` mal `max-w-5xl` (1024px), ale `PackTriplist` si drží
// vlastný tmavý root a mal `max-width:860px` — pri prekliku z profilu sa stránka
// viditeľne zúžila. Dve čísla na dvoch miestach sa rozídu vždy, preto sú tu.
// Kto pridá novú /pack stránku, berie odtiaľto — nie z Tailwind triedy.
// 🔴 JEDNA šírka od 21. 9. 2026 (Matej: „tieto center strany v /pack by mali byť jednotné").
// Dovtedy boli TRI: domov/psy/profil 976, AINUBIS 624 (`narrow`), správy 640 natvrdo —
// pri prekliku sa stránka pod lištou zúžila. `narrow` zanikol; užší smie byť len TEXT
// na čítanie vnútri stĺpca (bublina 82 %, odsek 62ch, telo článku 760), nie obrazovka.
//
// 🔴 OBSAH = 832 px od 22. 9. 2026 (Matej nad porovnávačom 976/896/832/760:
// „832 daj a zapečat’ ako pravidlo pri vytváraní stránok s centrovaným obsahom (na PC)").
// ⚠️ Zjednotenie 21. 9. riešilo SKÁKANIE okraja pri prekliku, nie voľbu hodnoty — 976 vyhralo
// len tým, že bolo väčšina. Na okne 1440 px bol taký stĺpec pre oko príliš široký.
// ⚠️ `wide` je RÁM (obsah + 2× `PACK_COL_PAD.desktop`), preto 880, nie 832. Číslo, ktoré
// vidí oko, je `PACK_COL_INNER`. Kto mení jedno, nech sa pozrie na druhé.
export const PACK_COL = { wide: 880 } as const;
/** Vodorovný padding stĺpca: mobil / od `sm`. Ten istý na všetkých /pack povrchoch. */
export const PACK_COL_PAD = { mobile: 16, desktop: 24 } as const;
/** Šírka OBSAHU stĺpca (rám mínus padding) = 832. Pre povrchy, ktoré si stĺpec kreslia
 *  samy bez paddingu rodiča (správy, článok výletu) — okraj musí sedieť s domovom. */
export const PACK_COL_INNER = PACK_COL.wide - 2 * PACK_COL_PAD.desktop;
/** Rovnica vlastného stĺpca: mobil 100 % − 32, od 640 px 100 % − 48, strop 832.
 *  Druhá polovica je `packColCSS(selektory)` — bez nej sa medzi 640 a 1024 px rozídu o 8 px. */
export const PACK_COL_FIT = `max-width:${PACK_COL_INNER}px;width:calc(100% - ${2 * PACK_COL_PAD.mobile}px);`;
export const packColCSS = (sel: string) =>
  `@media (min-width:640px){${sel}{width:calc(100% - ${2 * PACK_COL_PAD.desktop}px);}}`;

export const GLASS_CSS = `
.pk-glass{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border:1px solid rgba(245,240,228,0.14);
  border-radius:24px;
  box-shadow:0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(245,240,228,0.12);
}
.pk-glass-block{
  background:rgba(245,240,228,0.05);
  border:1px solid rgba(245,240,228,0.10);
  border-radius:16px;
  overflow:hidden;
}
/* Tmavé sklo NA SVETLOM podklade (papyrusová karta). Recept .pk-glass sa sem preniesť
   nedá: backdrop-filter rozmaže to, co je POD prvkom, a pod papyrusom nie je tma —
   vyšla by z toho špinavá bledá plocha. Preto vlastná tmavá podložka a sklo len ako
   povrchová úprava (vnútorný svetelný lem + mäkký tieň).
   Používa PÚTNIK riadok v profile (Matej 2026-08-13: skús ten blok putnika v liquid
   tmavom glasse ... stýl mapy). */
.pk-glass-onlight{
  background:linear-gradient(180deg,rgba(31,26,14,0.95) 0%,rgba(31,26,14,0.88) 100%);
  -webkit-backdrop-filter:blur(18px) saturate(120%);
  backdrop-filter:blur(18px) saturate(120%);
  border:1px solid rgba(245,240,228,0.16);
  border-radius:16px;
  box-shadow:0 12px 30px rgba(31,26,14,0.30), inset 0 1px 0 rgba(245,240,228,0.14);
}
.pk-glass-onlight:hover{ border-color:rgba(201,154,63,0.55); }
`;

// ── PILULKA NA PAPYRUSE — JEDEN primitív pre celý `/pack` (2026-08-12) ───────
// Matej: *„nesedí DNA na homepage, vidím rôzne pils, hrúbky okrajov aj štýly."*
// Homepage mala tri rôzne pilulky naraz: priehľadný ghost s 1px okrajom (HeroCard
// badge), gradientovú zlatú (dni nažive) a čiarkovanú (locked). Tu je ich jediná
// definícia; DNA je prevzatá z `.pf-pill` nižšie (tú Matej schválil 2026-07-26 pri
// profile: *„su nevyrazne blede ani sa mi tam nechce kliknúť… je to suche bez šťavy"*)
// — takže homepage, profil aj psia karta majú od teraz TÚ ISTÚ pilulku.
//   .pk-pill            → neutrálna (papyrusový gradient, 1.5px tlmená zlatá)
//   .pk-pill--gold      → aktívna / hodnotná (brand gradient `.btn-gold`)
//   .pk-pill--locked    → zamknuté / „čoskoro" (čiarkovaný okraj, bez výplne)
//   .pk-pill--tap       → klikateľná (hover lift). Neklikateľnej ho NEDÁVAJ.
// ⚠️ Text v pilulke: názov/identita = Cinzel 700, ČÍSLO = Space Grotesk **600**
//    (strop, Grotesk je načítaný 300–600). Túto dvojicu pilulka nediktuje — nesie ju
//    obsah, aby sa typografický lock nerozdvojil.
// ⚠️ Toto je pilulka NA PAPYRUSE. Na fotke/tmavom paneli (plagát výletu, `pk-glass`)
//    platí tmavá vrstva — nemixovať, papyrusová pilulka by na fotke zmizla.
export const PILL_CSS = `
.pk-pill{
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  padding:7px 12px; border-radius:999px; white-space:nowrap;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid rgba(179,130,45,0.42);
  color:#5c4318; cursor:default;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pk-pill--tap{ cursor:pointer; }
.pk-pill--tap:hover{
  border-color:rgba(179,130,45,0.85);
  transform:translateY(-1px);
  box-shadow:0 3px 10px rgba(122,90,42,0.22);
}
.pk-pill--gold{
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border-color:#E69E1A; color:#241a06;
  box-shadow:0 3px 12px rgba(230,158,26,0.5);
}
.pk-pill--gold.pk-pill--tap:hover{ box-shadow:0 4px 16px rgba(230,158,26,0.62); }
.pk-pill--locked{
  background:transparent; border:1px dashed rgba(179,130,45,0.6); color:#7a5a2a;
}
/* Tmavá plocha (blok ROZŠÍR SVORKU, pás míľnikov) — Matej 12.8.2026 ich nechal tmavé,
   takže pilulka potrebuje druhú kožu. Hrúbka okraja aj radius ostávajú TIE ISTÉ ako na
   papyruse; mení sa len výplň a farba textu. */
.pk-pill--dark{
  background:rgba(0,0,0,0.30);
  border-color:rgba(245,199,61,0.45);
  color:hsl(45 95% 90%);
}
.pk-pill--dark.pk-pill--tap:hover{
  background:rgba(245,199,61,0.16);
  border-color:hsl(45 80% 60%);
  box-shadow:none;
}
`;

// ── PAPYRUS „ŠŤAVA" primitív (2026-07-26, Matej: „tie políčka text area aj
// pils su nevyrazne blede ani sa mi tam nechce kliknúť… je to suche bez
// šťavy"). DNA prevzatá z `/pack/map` (PackTriplist) — gradient výplň + farebný
// glow tieň namiesto plochej výplne — v papyrusovej palete, nie v čiernom skle.
// Zdieľané medzi PackProfile.tsx (blok 1 polia) A DogGallery.tsx/DogCardFields.tsx
// (psia karta, editor AJ read-profil) — render `<style>{PF_FIELD_CSS}</style>`
// raz na stránke, presne ako `GLASS_CSS` vyššie.
export const PF_FIELD_CSS = `
.pf-field{
  background: linear-gradient(180deg, #FFFDF7 0%, #F1DFB3 100%);
  border: 1.5px solid rgba(179,130,45,0.55);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.pf-field::placeholder{ color: rgba(122,90,42,0.5); }
.pf-field:hover{ border-color: rgba(179,130,45,0.8); }
/* ZAOSTRENÉ POLE = LAPIS (2026-09-12). Matej: „výbery na stránke = nie zlatožlté ale
   lapis (meno/prezývka, výber pilsov)". Sedí to na deliacu čiaru brandu — zlato je
   konštrukcia (rám poľa), lapis je „čo robím JA" (pole, do ktorého práve píšem).
   Rám ostáva zlatý, mení sa halo a jeho farba pri zaostrení. */
.pf-field:focus{
  outline: none;
  border-color: ${LAPIS.edge};
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px ${LAPIS.halo};
}

/* Riadok „popisok VEDĽA poľa" (Matej 2026-08-12). Popisok má pevnú šírku, aby
   polia pod sebou začínali na jednej zvislej osi; na mobile sa zúži, inak by
   z 390px zjedol pole. min-width:0 na dieťati — bez neho flex položka odmietne
   zmenšiť input a riadok pretečie z karty.
   POZOR: tento súbor je JS template literal — spätný apostrof v CSS komentári
   ho ukončí a build padne. */
/* ── JEDNA MRIEŽKA NA VŠETKY TRI RIADKY (2026-09-12) ──────────────────────────
   Matej: „na PC je zobraziť (pod prezývka) dobre pod seba ale na mobile to tak nie je
   + nie je to zarovnané dobre na mobile = polia by mali byť rovnake - textarea ale
   nadpisy by mali byť zarovnané napravo."
   PREČO SA TO ROZCHÁDZALO: každý riadok bol samostatný flex a popisok mal
   flex-basis 52px pri mobile — lenže flex-shrink je 0 a min-width auto, takže dlhší
   popisok (PREZÝVKA 63px) svoju bunku ROZTIAHOL a pole vedľa neho sa o tých 11px
   zúžilo. Tri riadky mali tri rôzne šírky polí a tri rôzne zvislé osi.
   Riešenie je jedna mriežka pre všetky riadky: prvý stĺpec max-content (teda šírka
   NAJDLHŠIEHO popisku, nech je jazyk aký chce), druhý 1fr. Riadky sú
   display:contents, takže do mriežky prispievajú priamo svojím popiskom a poľom.
   Pevné číslo v px by sa rozišlo pri prvom preklade (DE SPITZNAME, PL PSEUDONIM). */
.pf-inline-grid{
  display:grid;
  grid-template-columns:minmax(0,max-content) minmax(0,1fr);
  column-gap:10px;
  row-gap:8px;
  align-items:center;
}
.pf-inline-grid > .pf-inline{ display:contents; }
/* Prepínač má nad sebou o kúsok viac vzduchu než majú polia medzi sebou — je to iný
   druh ovládača, nie tretie pole. Robí sa to na jeho DVOCH bunkách, nie na riadku:
   display:contents žiadny box nemá, takze margin na nom by sa zahodil. */
.pf-inline-grid > .pf-inline--toggle > *{ margin-top:4px; }

/* Mimo mriežky (zdieľané povrchy, ktoré ju ešte nemajú) ostáva riadok flexom. */
.pf-inline{ display:flex; align-items:center; gap:10px; }
.pf-inline > :not(.pf-inline-lbl){ flex:1 1 auto; min-width:0; }
.pf-inline-lbl{
  flex:0 0 72px;
  font-family:'Cinzel',serif;
  font-size:10px;
  letter-spacing:0.22em;
  text-transform:uppercase;
  color:rgba(31,26,14,0.62);
  text-align:right;
}
@media (max-width:640px){
  .pf-inline{ gap:8px; }
  .pf-inline-lbl{ flex-basis:52px; letter-spacing:0.14em; }
  .pf-inline-grid{ column-gap:8px; }
}

/* Pole, ktoré svorka reálne vidí (Matej 2026-08-12: „zvýraznil by som rámik
   výberu v tomto prípade nickname"). Prepínač „Show as" sám o sebe nepovie,
   ktorý z dvoch riadkov je ten živý — zvýraznené pole to ukáže bez čítania. */
/* Pole, ktoré svorka vidí. Prvé dve verzie (halo, potom podfarbený riadok so
   štítkom „shown") Matej zamietol — 2026-08-12: „to zvýraznenie v 1. bloku je
   otrasné to shown ako aj rámik cez nick name daj preč zvýrazni viac farebne
   obrys text area". Ostáva teda JEDINÁ vec: sýtejší farebný obrys samotného
   poľa. Žiadny štítok, žiadne podfarbenie riadku. */
/* ⚠️ 13. 8. 2026: zvýraznenie „toto pole svorka vidí" už NEMENÍ VÝPLŇ. Matej žiada,
   aby meno a prezývka vyzerali totožne ako bio, takže rozdiel nesie len obrys — a hlavne
   samotný prepínač nižšie, ktorý je odteraz výrazný. Podfarbenie by rozdiel vrátilo. */
/* ⚠️ 12. 9. 2026: obrys je LAPIS, nie zlatooranžový (Matej: „výbery na stránke = nie
   zlatožlté ale lapis — meno/prezývka"). Je to VOĽBA ktoré pole svorka vidí, a voľba
   má v brande modrú; zlatá tu navyše splývala s rámom karty aj s pilulkou levelu. */
.pf-inline.is-shown .pf-field{
  border-color:${LAPIS.edge};
  border-width:2px;
  box-shadow:inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px ${LAPIS.halo};
}

/* Plochá papyrusová výplň — TEN ISTÝ tón, aký nesie BIO textarea (Matej 2026-08-13:
   „text area urob totožné = aj meno a prezývka bude rovnaká ako bio"). Polia MENO
   a PREZÝVKA teda prestali byť zlatý gradient; .pf-field okraj a focus glow ostávajú,
   mení sa len výplň. Kto zmení tento odtieň, musí zmeniť aj WordLimitTextarea
   v PackProfile.tsx a bio psa v profile/DogGallery.tsx — sú to tri miesta
   jednej farby. */
.pf-field--flat{ background: #FBF5E6; }

/* Prepínač MENO / PREZÝVKA (Matej 2026-08-13: „zobraziť meno/prezývky urob o trošku
   výraznejšie je to takmer neviditeľné a tá pils okolo tú nezarovnaj až po koniec
   textarea nad ňou"). Dve veci naraz:
   1. width:max-content — dráha sa NEROZŤAHUJE na šírku poľa nad sebou. Bez toho ju
      naťahuje .pf-inline > :not(.pf-inline-lbl){flex:1 1 auto} až po pravý okraj.
   2. neaktívna možnosť dostala čitateľnú farbu a dráha vlastný rám — predtým to bol
      priehľadný text v inkFaint na papyruse a nevyzeralo to ako prepínač. */
/* Selektor MUSÍ byť potomkovský, nie holá trieda: .pf-inline > :not(.pf-inline-lbl)
   má špecificitu 0,2,0 a holú .pf-toggle (0,1,0) prebije — dráha by sa naťahovala
   ďalej. Toto je tá istá váha a stojí nižšie, takže vyhráva. */
/* VZHĽAD dráhy je na HOLEJ triede (rozdelené 2026-09-11) — prepínač sa používa aj
   mimo .pf-inline (šat v nastaveniach) a tam by inak ostal bez pozadia aj rámu,
   teda ako dva holé texty vedľa seba. Potomkovský selektor nižšie si necháva len to,
   čo kvôli špecificite naozaj potrebuje: rozmer. */
.pf-toggle{
  background: #FBF5E6;
  border: 1.5px solid rgba(179,130,45,0.55);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16);
  /* GEOMETRIA DRÁHY PATRÍ SEM, nie do volajúcich (2026-09-16). Dovtedy si ju každý
     niesol inline a rozišli sa: nastavenia mali 3 px, kalendár 4 px — a 3 nie je
     v PACK_SPACE, takže každý ďalší prepínač zhodil stráž check:pack. */
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
}
.pf-inline > .pf-toggle{
  flex: 0 1 auto;
  width: max-content;
  max-width: 100%;
}
/* V mriežke to isté pravidlo inak: bunka je 1fr, takže bez justify-self by sa dráha
   natiahla až po koniec poľa nad sebou — a to Matej 13. 8. výslovne zamietol
   („tú pils okolo tú nezarovnaj až po koniec textarea nad ňou"). */
.pf-inline-grid > .pf-inline > .pf-toggle{ width:max-content; max-width:100%; justify-self:start; }
/* Možnosti prepínača sú v CSS, NIE inline — inline štýl by media query nižšie prebil
   a na mobile by sa nedalo zmenšiť to, čo je zapísané v style={{}}. */
.pf-toggle__opt{
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-family: 'Cinzel', serif;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  color: #7a5a2a;
  background: transparent;
  cursor: pointer;
}
/* ── VYBRANÁ MOŽNOSŤ JE LAPIS (2026-09-11) ──────────────────────────────────────
   Matej: „vzhlad - tmavý/bledý prepínač v lapise a nie v zlatej!"
   Rozhoduje PODKLAD POD PRVKOM, nie poloha prepínača šatu — a prepínač sedí na
   papyrusovej karte, ktorá je papyrusová aj v tmavom šate. Zlatý gradient by sa
   vrátil len na naozaj TMAVOM povrche (tam zase zaniká lapis); taký povrch dnes
   prepínač nemá, preto tu druhá vetva nie je. Zlaté písmo na modrom nie je ozdoba:
   lapis + zlato je pôvodná egyptská dvojica. */
.pf-toggle__opt.is-on{
  background: ${LAPIS.grad};
  color: ${LAPIS.ink};
  font-weight: 700;
}

@media (max-width:720px){
  /* min-height drží klikací cieľ (audit B1) — prepínač bol 22px, čo je polovica prsta.
     38px na možnosti + 3px padding dráhy = celý prepínač má 44px. */
  .pf-toggle__opt{ padding: 6px 12px; font-size: 10.5px; letter-spacing: 0.08em; min-height: 38px; }
}
/* ⚠️ PRAH ZALOMENIA JE 459px, NIE 720px (opravené 2026-09-12).
   Prepínač je 160px široký a popisok si berie ~63px; vedľa avatara (clamp 88–148px)
   sa dvojica zmestí do stĺpca s menami až od ~455px šírky okna. Pôvodných 720px bolo
   o 260px príliš veľa, takže sa riadok lámal aj tam, kde na to nebol dôvod — vrátane
   Matejovho ~500px okna, kde to práve vyzeralo „nie ako na PC".
   Popisok pritom ostáva ZAROVNANÝ VPRAVO (Matej 2026-09-12) — vľavo bol jediný
   popisok v hlavičke, ktorý nestál na zvislej osi tých ostatných, a presne to
   z riadku robilo cudzí prvok. Pod prahom ide popisok aj prepínač na plnú šírku
   a oba k pravému okraju, teda k tej istej hrane, na ktorej končia polia nad nimi. */
@media (max-width:459px){
  .pf-inline-grid > .pf-inline--toggle > .pf-inline-lbl{ grid-column:1 / -1; text-align:right; }
  .pf-inline-grid > .pf-inline--toggle > .pf-toggle{ grid-column:1 / -1; justify-self:end; margin-top:0; }
}

/* ── VÝBER KRAJINY: ÚZKY CHIP + NATÍVNY ZOZNAM (2026-09-12) ───────────────────
   Matej: „krajina je velmi široká a dropdown šípka nalepená na kraji… vždy musí byť
   kúsok od kraja, nie nalepená."
   Natívny <select> zobrazuje TEXT vybranej položky, takže odkedy zoznam nesie celé
   názvy krajín (13. 8., „potrebujeme všetky vlajky sveta"), sa chip roztiahol na
   „max-width" a šípka sa oprela o oblúk pilulky. Vrátiť krátke názvy do zoznamu sa
   nedá — 249 položiek „SVK / CZE / DEU" nikto neprečíta.
   Riešenie: viditeľný chip je NÁŠ (vlajka + ISO3 + šípka), natívny <select> nad ním
   leží priehľadný cez celú plochu. Zoznam teda ostáva natívny (na mobile je to
   systémový picker), šírku a odsadenie šípky si určujeme sami.
   ⚠️ Zaostrenie nesadne na obal, ale na <select> vnútri — preto sa berie focus-within, inak by chip pri otvorení nedal žiadnu odozvu. */
.pf-selchip{ position: relative; }
.pf-selchip > select{
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0; cursor: pointer; border: none; padding: 0; margin: 0;
}
.pf-selchip:focus-within{
  border-color: ${LAPIS.edge};
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px ${LAPIS.halo};
}

/* Šípka natívneho <select> sa kreslí tesne pri vnútornej hrane. V pilulke (radius 999)
   ju oblúk „zožerie" a vyzerá nalepená — preto majú selecty väčší pravý padding než
   ľavý. Platí na oba zvyšné natívne selecty (stav, životný štýl). */
.pf-selpad{ padding: 4px 14px 4px 10px; }

.pf-pill{
  background: linear-gradient(180deg, #FFFDF7 0%, #EFDDAE 100%);
  /* 0.42 zjednotené na 0.55 (13. 8.) — chipy a selecty stoja v tom istom rade a mali
     rôzne silné rámy. Rozdiel bol príliš malý na to, aby niečo znamenal, a dosť veľký
     na to, aby rad vyzeral nedbalo. */
  border: 1.5px solid rgba(179,130,45,0.55);
  color: #5c4318;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pf-pill:hover:not(:disabled){
  border-color: rgba(179,130,45,0.85);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(122,90,42,0.22);
}
/* ── VYBRANÝ CHIP = LAPIS TINT (2026-09-12) ────────────────────────────────────
   Matej: „výbery na stránke = nie zlatožlté ale lapis (… výber pilsov — aký si)".
   Recept NIE JE plná modrá, ale pickTintCSS() — lock z 26. 8.: plná farebná plocha
   patrí JEDINÉMU hlavnému CTA na obrazovke, a chipov povahy je na karte 24.
   Čitateľnosť nesie TMAVÝ inkoust (PICK_INK.lapis) a plný farebný rám, nie krytie
   výplne — svetlý inkoust na papyruse bol presne ten dôvod, prečo sa vtedy siahlo
   po plnej farbe.
   ⚠️ PF_FIELD_CSS je zdieľaná s psou kartou (DogGallery / DogCardFields) a
   read-profilom — výber je odteraz lapisový AJ tam. Je to zámer: jedna appka, jedna
   farba výberu. */
.pf-pill.is-selected{
  ${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}
  font-weight: 600;
}
.pf-pill.is-selected:hover{
  border-color: ${LAPIS.edge};
  box-shadow: inset 0 0 0 1px rgba(22,48,122,0.6), 0 3px 12px rgba(22,48,122,0.22);
}
.pf-pill:disabled{ opacity: 0.4; cursor: default; transform: none; box-shadow: none; }

/* MOBILNÉ KLIKACIE CIELE (audit 12. 8., B1) — pri 390px malo 24 prvkov výšku pod
   36px: prepínač NAME/NICKNAME 22px, chipy povahy 25px, selecty 26px, oko 24px.
   Prst má ~9mm, čo je zhruba 44px; 22px je polovica.
   Prečo dve čísla: chipov povahy je na stránke 24 a lámu sa do radov, takže 44px
   by kartu natiahlo o stovky pixelov — dostávajú spodnú hranicu rozsahu (40px),
   ojedinelé prvky (selecty, prepínač, oko) plných 44px.
   Robí sa to cez min-height, nie paddingom: padding by rozbil desktop, kde sú
   rozmery odsúhlasené. */
@media (max-width:720px){
  .pf-pill{ min-height:40px; }
  /* Platí na CELÝ .pf-field, nie len na select: polia VEK a MESTO sú holý input
     zabalený v span.pf-field — klikací je ten obal, nie input, takže výška musí
     sadnúť naň. Textarea má vlastnú min-height 48px, tá je vyššia a nemení sa. */
  .pf-field{ min-height:44px; }
  .pf-tap{ min-height:44px; }
  /* Jazykový prepínač je zdieľaný komponent — dvíha sa LEN jeho settings varianta,
     nie pill-nav na GodsGride. */
  .lang-picker--settings .lang-trigger{ min-height:44px; }
  /* Ikonové ovládače (kruhové „i", kopírovanie odkazu, oko pri identite) sa NEDVÍHAJÚ
     výškou — z 26px kruhu by bol ovál. Namiesto toho neviditeľná plocha navyše cez
     ::after, takže prst má 44px, oko vidí pôvodných 26px.
     Meranie cez getBoundingClientRect ukáže ďalej 26px — klikaciu plochu nesie
     pseudo-prvok, nie samotný button. */
  .pf-hit{ position:relative; }
  .pf-hit::after{ content:''; position:absolute; inset:-9px; }
}

/* Sub-section accordion header (BASICS / HOW THEY WORK / …) — bola plochý
   text riadok s hairlinom, nikto ho nevnímal ako klikateľný (Matej 2026-07-29:
   „je to nevýrazné slabo viditeľné a mozog to prehliada"). Rovnaká DNA ako
   .pf-field/.pf-pill vyššie — gradient výplň + hover lift + glow, nie plochá farba. */
.pf-subsection{
  background: linear-gradient(180deg, #FFFDF7 0%, #F1DFB3 100%);
  border: 1.5px solid rgba(179,130,45,0.4);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.10);
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pf-subsection:hover{
  border-color: rgba(179,130,45,0.85);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(122,90,42,0.26), inset 0 1px 2px rgba(122,90,42,0.10);
}
.pf-subsection.is-open{
  border-color: #C99A3F;
  box-shadow: 0 2px 10px rgba(201,154,63,0.28), inset 0 1px 2px rgba(122,90,42,0.10);
}
.pf-subsection-badge{
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.pf-subsection-badge.is-empty{
  border: 1px dashed rgba(179,130,45,0.6);
  color: #7a5a2a;
}
.pf-subsection-badge.is-filled{
  background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
  border: 1px solid #E69E1A;
  color: #241a06;
  box-shadow: 0 2px 8px rgba(230,158,26,0.45);
}
.pf-subsection-chevron{
  width: 22px; height: 22px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(201,154,63,0.14);
  transition: background .15s ease;
}
.pf-subsection:hover .pf-subsection-chevron{ background: rgba(201,154,63,0.26); }
`;


// ════════════════════════════════════════════════════════════════════════════
// RECEPTY K NOVÝM MENÁM V KATALÓGU (14. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej: „aby boli text area, bloky, pils, fotky nadpisy progresbary atď vždy
// rovnaké bez toho aby bolo milion verzii a nesurodych dizajnov na každej
// stránke." POLE a PILULKA recept už mali (PF_FIELD_CSS a PILL_CSS vyššie) —
// chýbalo im len meno. Tieto štyri ho nemali ani jedno.
//
// ⚠️ PRIDANIE RECEPTU NEHÝBE ANI JEDNÝM PIXELOM. Existujúce povrchy ostávajú,
//    kým sa prevedú po vrstvách a pozrú v prehliadači (postup v locku
//    `plany/locky/pack-dizajn-system.md`). Recept je tu preto, aby NOVÁ stránka
//    nemusela nič vymýšľať.
// ════════════════════════════════════════════════════════════════════════════

/** MEDAILÓN — priemery kruhu. Štyri stupne, násobky ôsmich.
 *  Dnešné veľkosti v appke (24 · 26 · 30 · 36 · 54 · 64 · 74) sa na ne prichytia
 *  AŽ pri prevode — samotné zavedenie stupnice nič neposúva. */
export const PACK_AVATAR = {
  /** Vlajka, malý odznak v rohu karty. */
  xs: 24,
  /** Avatar v riadku zoznamu, člen svorky. */
  sm: 32,
  /** Avatar v hlavičke, autor výletu. */
  md: 48,
  /** Hlavná fotka psa na karte, medaila. */
  lg: 64,
} as const;

/** ZÁVOJ — tri polohy, tri hodnoty. Štvrtú si komponent nevymýšľa.
 *  Odtieň `24,14,4` je brandový inkoust (prevzatý z mapového prebitia
 *  `.trp-root .att-entry-backdrop`), nie čierna — čierna nad papyrusom šedne.
 *  Sila 0,72 je pôvodná sila základného backdropu. Jedna hodnota nahrádza dve,
 *  ktoré v appke od 26. 8. bežali vedľa seba (0,72 čierna vs. 0,55 hnedá). */
export const PACK_VEIL = {
  /** Za plávajúcim PANELOM. */
  modal: 'rgba(24,14,4,0.72)',
  /** Spád pod textom na FOTKE — zhora nič, dole plná sila. */
  photo: 'linear-gradient(180deg, rgba(24,14,4,0) 0%, rgba(24,14,4,0.72) 100%)',
  /** Doštička pod pilulkou alebo ikonou na fotke. Zhodná s .pk-pill--dark
   *  zámerne: je to tá istá vrstva nad tým istým obrázkom. */
  plate: 'rgba(0,0,0,0.30)',
  /** Rozostrenie podkladu pod závojom MODAL. Sklo inde v appke (GLASS_CSS)
   *  má 18–24 px — to je materiál panelu, nie závoj pod ním. */
  blur: '4px',
} as const;

export const VEIL_CSS = `
.pk-veil{ position:fixed; inset:0; z-index:200; }
/* ⚠️ FARBU SMIE PREBIŤ POVRCH, TMAVOSŤ NIE (doplnené 24. 9. 2026).
   PACK_VEIL.modal je TEPLÁ hneď (rgba(24,14,4,…)) — namiešaná na papyrus.
   Na AINUBISOVOM studenom displeji by to bol hnedý film cez modrý prístroj.
   Preto ten istý recept, tá istá tmavosť aj rozmazanie, a povrch mení už len
   ODTIEŇ cez --pk-veil — rovnako, ako SKLENENÁ DOSKA berie --pk-stage.
   🔴 Nie je to povolenie zvoliť si vlastnú tmavosť: krytie 0,72 je v oboch. */
.pk-veil--modal{
  background:var(--pk-veil, ${PACK_VEIL.modal});
  -webkit-backdrop-filter:blur(${PACK_VEIL.blur});
  backdrop-filter:blur(${PACK_VEIL.blur});
  display:flex; align-items:center; justify-content:center; padding:20px;
}
/* FOTO a DOŠTIČKA ležia VNÚTRI prvku, nie cez okno — preto absolute. */
.pk-veil--photo{ position:absolute; inset:0; background:${PACK_VEIL.photo}; pointer-events:none; }
.pk-veil--plate{ position:static; background:${PACK_VEIL.plate}; border-radius:${PACK_R.pill}px; }
`;

// ── SKLENENÁ DOSKA (2026-09-15, Matej) ──────────────────────────────────────
// „potrebujeme tam panel bud priesvitný alebo liquid glass" — plocha, na ktorej stojí
// OBSAH nad vlastnou tapetou appky. Vznikla v konverzácii, kde bubliny ležali priamo na
// hieroglyfoch a splývali s nimi.
//
// ⚠️ NIE JE TO ZÁVOJ. Závoj (`.pk-veil`) ZAKRÝVA to, čo je pod ním, a je to prekrytie —
//    doska tapetu nechá presvitať a len ju rozmaže, aby text nad ňou držal. Iný význam,
//    iný recept; závoj svoje tri polohy nerozširuje.
// ⚠️ NIE JE TO ANI `.pk-glass`. To je sklo pre TMAVÝ povrch (svetlé rgba, čierny tieň
//    70 px) a na papyruse zmizne.
//
// FARBU NESIE POVRCH, TVAR TENTO RECEPT: `--pk-stage` / `--pk-stage-edge` si nastaví
// povrch podľa svojho šatu (správy to robia v `msgTheme.ts` pre svetlý aj tmavý).
// Bez nich platí papyrusové východisko. Rozmery (šírka, odsadenie) patria volajúcemu —
// tá istá deliaca čiara ako pri `BackButton` a `mapDockShape`.
export const STAGE_CSS = `
.pk-stage{
  background:var(--pk-stage, linear-gradient(180deg,rgba(251,245,230,0.58) 0%,rgba(242,229,197,0.42) 100%));
  border:1px solid var(--pk-stage-edge, rgba(179,130,45,0.34));
  border-radius:${PACK_R.card}px;
  -webkit-backdrop-filter:blur(10px) saturate(115%);
  backdrop-filter:blur(10px) saturate(115%);
}
`;

export const MEDALLION_CSS = `
.pk-medallion{
  display:inline-flex; align-items:center; justify-content:center;
  flex:0 0 auto; overflow:hidden;
  width:${PACK_AVATAR.sm}px; height:${PACK_AVATAR.sm}px;
  border-radius:${PACK_R.pill}px;
  background:${PACK_THEME.tileBg};
  border:1.5px solid rgba(179,130,45,0.55);
  box-shadow:${PACK_SHADOW.card};
}
.pk-medallion > img{ width:100%; height:100%; object-fit:cover; display:block; }
.pk-medallion--xs{ width:${PACK_AVATAR.xs}px; height:${PACK_AVATAR.xs}px; }
.pk-medallion--md{ width:${PACK_AVATAR.md}px; height:${PACK_AVATAR.md}px; }
.pk-medallion--lg{ width:${PACK_AVATAR.lg}px; height:${PACK_AVATAR.lg}px; }
/* Zlatý prstenec = TOTO JE ON (prihlásený človek, zakladateľ). Nie ozdoba. */
.pk-medallion--gold{ border-color:#E69E1A; box-shadow:0 3px 12px rgba(230,158,26,0.45); }
/* Na tmavom podklade sa mení iba lem a výplň, priemer ani polomer nie. */
.pk-medallion--dark{ background:rgba(0,0,0,0.30); border-color:rgba(245,199,61,0.45); }
`;

export const PHOTO_CSS = `
.pk-photo{
  position:relative; display:block; overflow:hidden;
  border-radius:${PACK_R.tile}px;
  background:${PACK_THEME.tileBg};
  border:1px solid ${PACK_THEME.border};
}
.pk-photo > img{ width:100%; height:100%; object-fit:cover; display:block; }
/* Text na fotke potrebuje ZÁVOJ — .pk-veil--photo ako posledné dieťa. */
.pk-photo--card{ border-radius:${PACK_R.card}px; }
`;

export const PROGRESS_CSS = `
.pk-progress{
  position:relative; width:100%; height:6px; overflow:hidden;
  border-radius:${PACK_R.pill}px;
  background:rgba(122,90,42,0.18);
}
.pk-progress__fill{
  height:100%; border-radius:${PACK_R.pill}px;
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  transition:width .3s ease;
}
/* DOG ID má na percento vyplnenia vlastný lock (12. 9. 2026): pod 100 percent
   červená, na 100 percent zelená. Inde ostáva výplň zlatá. */
.pk-progress__fill--low{ background:#B25640; }
.pk-progress__fill--done{ background:#3D7A4E; }
.pk-progress--dark{ background:rgba(245,240,228,0.14); }
`;
