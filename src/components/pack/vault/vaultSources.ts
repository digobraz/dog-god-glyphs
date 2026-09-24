// ════════════════════════════════════════════════════════════════════════════
// ODKIAĽ TO VIEM — register zdrojov mozgu (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Voľba **E2** (Matej 24. 9. nad `plany/nakres-nastenka-zdroje-2026-09-24.html`):
// zoznam má VLASTNÚ ADRESU `/pack/ainubis/sources` a tri vchody — riadok „from"
// pod odpoveďou v chate, riadok pod mojimi príspevkami na nástenke a päta VAULTu.
// Karta zdroja je **F1 — skromná**: meno · autor, rok, rozsah, druh · počet
// zvitkov · dva štítky. Bez háčika a bez rozpadu stavov.
//
// 🔴 ČÍSLA SÚ PREMERANÉ, NIE ODHADNUTÉ (24. 9. 2026). Zdroj merania:
//    `vystupy/dashboard/embeds/ainubis/kb-data.js` (generuje `plany/ainubis/
//    gen-kb-data.mjs` z `plany/ainubis/kb/*.md`). Chunk sa priradil dokumentu
//    podľa PRVEJ značky vo svojom poli `source` (`FD` · `HD` · `4PFD` · `TCM
//    slides` · `longevity` · `keto` · `free-guide` · `FT1` · `FT2` · `own`):
//      node -e "…kb.chunks → počty podľa prefixu…"   → 675 spolu, 10 dokumentov
//
// ⚠️ TOTO JE KÓPIA, NIE MERANIE. Kým je to maketa, čísla sú tu odpísané. Keď
//    obrazovka pôjde naostro, MUSÍ sa pýtať korpusu (dnes `ainubis_kb_*` v DB),
//    inak bude po prvom pribudnutom zvitku klamať — a bude to klamstvo práve na
//    tom povrchu, ktorý má dokazovať, že neklameme.
//    [[feedback_generovanim_sa_sonda_meni_na_tautologiu]]
//
// ⚠️ ROK SA NEDOPĹŇA ODHADOM. *Feeding Dogs* a *The Herbal Dog* rok vydania
//    v repe nikde nemajú (PDF nesú len dátum skenu, resp. konverzie z calibre),
//    tak ho karta nemá. Vymyslený rok by bol presne to, čo tento zoznam popiera.
//
// 🔴 DVA KORPUSY, JEDNO SLOVO „ZVITOK". Tu ide o **675 chunkov mozgu, ktorý
//    odpovedá** (`plany/ainubis/kb/`). VAULT má cieľových 569 zvitkov
//    (`plany/znalosti/svety/`) — iný rozpad tých istých podkladov. Preto to
//    hlavička obrazovky povie hneď v prvej vete; inak by si dve čísla na dvoch
//    obrazovkách protirečili a nikto by nevedel ktoré platí.
// ════════════════════════════════════════════════════════════════════════════

export interface VaultSource {
  key: string;
  title: string;
  /** Autor, ak ho zdroj má. Vlastný text ho nemá. */
  author?: string;
  /** Len keď ho vieme doložiť — viď poznámka v hlavičke. */
  year?: string;
  /**
   * Počet strán DOKUMENTU, KTORÝ DRŽÍME — premerané `pdfinfo` nad
   * `vstupy/AINUBIS/` 24. 9. 2026 (Matej: „dal by som aj strany pri knihách").
   * ⚠️ NIE JE TO ROZSAH TLAČENÉHO VYDANIA. *Feeding Dogs* je sken z iScanneru,
   *    *The Herbal Dog* konverzia z calibre — 488 strán e-knihy nie je 488 strán
   *    knihy. Preto karta píše „488 pp" a nie „strán v knihe": hovoríme o tom,
   *    čo sme naozaj prečítali.
   */
  pages?: number;
  /** Rozsah slovom, keď z dokumentu berieme len časť (kapitoly). */
  extent?: string;
  /**
   * 🔴 O ČOM TO JE — jedna veta, ktorú človek prečíta bez rozklikávania
   * (Matej 24. 9.: „krátky popis o čom je kniha").
   */
  about: string;
  /**
   * HÁČIK — ukáže sa až po rozkliknutí (Matej: „prípadne rozklik by ukázal
   * autora, knihu a pár slov"). 🔴 Tu konečne žije to, čo bolo doteraz len
   * v `plany/ainubis/kb/00-SPEC.md` §2 a na obrazovke nikde: čo z toho zdroja
   * NEBERIEME a prečo. Zdroj bez háčika ho nemá.
   */
  caveat?: string;
  /** Kategória zoznamu (Matej 24. 9.: „knihy, iné publikácie, videá"). */
  group: 'books' | 'other' | 'video' | 'own';
  /**
   * NEUVÁDZA SA V ZOZNAME (Matej 24. 9.: „free guide nemusíme uvádzať").
   * ⚠️ Zvitky z neho sú v mozgu ďalej — preto o ňom zoznam povie jednou vetou
   *    v päte. Ticho ho zamlčať by bolo klamstvo práve na tej obrazovke, ktorá
   *    má dokazovať, že neklameme.
   */
  hidden?: boolean;
  /** Druh: book · guide · e-book · slides · in-house. */
  kind: string;
  /** Premerané počty chunkov (24. 9. 2026). */
  scrolls: number;
  /** Dva štítky — o čom ten zdroj v korpuse naozaj je (najčastejšie tagy). */
  tags: string[];
  /**
   * 🔴 „% RELEVANTNOSTI A ODBORNOSTI" JE TOTO — A JE TO MERANÉ, NIE VYMYSLENÉ.
   *
   * Matej 24. 9. 2026: *„môžme tam dať aj % relevantnosti a odbornosti (naše
   * hodnotenie)"*. Jedno vycucané číslo by bolo presne to, čo tento zoznam
   * popiera, tak sa berie z toho, čo korpus naozaj vie: KAŽDÝ chunk má pole
   * `status` (`consensus` · `traditional` · `author-position`) a to je náš
   * rozsudok nad tvrdením, zapísaný pri destilácii.
   *
   *   konsenzus       = zhoda odboru, dá sa oprieť
   *   tradícia        = tradičný systém (TČM, bylinky) — platí vo svojom ráme
   *   autorský postoj = autor si to myslí a nesie k tomu protiváhu
   *
   * Hlavičkové číslo karty je **% konsenzu**. Feeding Dogs má 61 %, Herbal Dog
   * 21 % — a to je presne tá informácia, ktorú chce človek pred kúpou knihy.
   * ⚠️ ODBORNOSŤ AUTORA SA NEVYMÝŠĽA. Titul má len ten, kto ho má doložený
   *    v `plany/ainubis/kb/00-SPEC.md` §2 (DVM). Skóre „odbornosti" nezakladám.
   */
  split: { consensus: number; traditional: number; author: number };
  /** Kto zdroj priniesol. Prázdne = priniesol ho projekt (prvá a druhá vlna). */
  addedBy?: string;
  /** Čaká na posúdenie — v zozname je bledo a do mozgu ešte neprispel. */
  pending?: boolean;
  /** Dní v poradí (len pri `pending`). */
  waiting?: number;
  /** Sľúbená DEVOTION, keď prejde (len pri `pending`). */
  devotion?: number;
}

export const VAULT_SOURCES: VaultSource[] = [
  {
    key: 'fd', title: 'Feeding Dogs: Dry or Raw?', author: 'Dr. Conor Brady',
    kind: 'book', extent: '24 chapters', scrolls: 270,
    tags: ['nutrition', 'raw vs kibble'],
    split: { consensus: 164, traditional: 1, author: 105 },
    pages: 267,
    group: 'books',
    about:
      'The industrial dog bowl taken apart: what kibble is made of, how it is made, and what the dog’s body does with it.',
    caveat:
      'Brady argues for raw and against the processed pet food industry. The chemistry and the physiology are standard; the conclusions are his own, and every scroll that carries one says so and brings a counterweight.',
  },
  {
    key: 'hd', title: 'The Herbal Dog', author: 'Rita Hogan',
    kind: 'book', extent: '8 chapters', scrolls: 184,
    tags: ['herbs', 'body systems'],
    split: { consensus: 39, traditional: 135, author: 10 },
    pages: 488,
    group: 'books',
    about:
      'Herbs organ by organ: what a plant does in the body, and when it is the wrong idea.',
    caveat:
      'A herbalist’s book, not a clinical one — most of what we take from it is tradition rather than trial evidence, and the scrolls say which is which.',
  },
  {
    key: 'own', title: 'AINUBIS SEED — written here, not taken from a book',
    kind: 'in-house', scrolls: 88,
    tags: ['safety', 'consensus'],
    split: { consensus: 86, traditional: 1, author: 1 },
    group: 'own',
    about:
      'The safety gate and everything the books do not answer: what is an emergency, what is poison, and where explaining stops and a vet begins.',
  },
  {
    key: '4pfd', title: 'Four Paws, Five Directions', author: 'Cheryl Schwartz, DVM',
    year: '1996', kind: 'book', scrolls: 54,
    tags: ['five elements', 'food energetics'],
    split: { consensus: 1, traditional: 50, author: 3 },
    pages: 111,
    group: 'books',
    about:
      'Chinese medicine written for dogs and cats by a vet: the five elements, organ pairs, the eight principles, and how to read a dog by looking at it.',
    caveat:
      'Chapter 7 puts grains at the centre of the bowl and allows a vegetarian dog. We do not take that — Feeding Dogs has precedence — and the exclusion is written into the corpus as its own scrolls, not as a footnote. Supplement doses and brand formulas are not carried over either.',
  },
  {
    key: 'free', title: 'Free Homemade Dog Food Guide', author: '“the dog nutritionist”',
    year: '2023', kind: 'guide', scrolls: 23,
    tags: ['home cooking', 'balancing meals'],
    split: { consensus: 11, traditional: 0, author: 12 },
    pages: 47,
    group: 'other',
    hidden: true,
    about:
      'A home-cooking guide: food groups, balancing a cooked meal, and how to switch.',
    caveat:
      'A funnel for a paid course, with uncited claims. We take only the cooked-feeding part, which the corpus otherwise lacks; its raw claims go in as the author’s position with a counterweight.',
  },
  {
    key: 'tcm', title: 'Konštitučná dietetika', author: 'Norbert Synčák',
    kind: 'slides', scrolls: 17,
    tags: ['thermal nature', 'food tables'],
    split: { consensus: 0, traditional: 17, author: 0 },
    pages: 116,
    group: 'other',
    about:
      'A five-step thermal scale for food: what warms, what cools, and where each ingredient sits.',
    caveat:
      'A system for humans, not for dogs. Only the scale and the food tables are taken; the canine layer comes from The Herbal Dog, and anything toxic to dogs is overridden.',
  },
  {
    key: 'long', title: 'Pro více šťastných společných let', author: 'MVDr. Jiří Urbánek',
    kind: 'e-book', scrolls: 13,
    tags: ['longevity', 'cell biology'],
    split: { consensus: 8, traditional: 1, author: 4 },
    pages: 51,
    group: 'other',
    about:
      'What the longevity idea actually claims — cells, oxidative stress, and how much of it holds for a dog.',
    caveat:
      'A marketing e-book for supplements. Not one product name comes out of it.',
  },
  {
    key: 'ft1', title: 'Flea, Tick & Heartworm Guide', author: 'Dr. Karen Becker, Dr. Judy Morgan',
    kind: 'guide', scrolls: 10,
    tags: ['preventives', 'deterrents'],
    split: { consensus: 3, traditional: 0, author: 7 },
    pages: 13,
    group: 'other',
    about:
      'Chemical preventives and natural deterrents against fleas, ticks and heartworm, side by side.',
    caveat:
      'Paid “Inside Scoop” content that mixes three things: chemical preventives, natural deterrents and detox protocols. The first two are substance; the third is ideology and is not taken.',
  },
  {
    key: 'keto', title: 'A Pet Parent’s Guide to the Ketogenic Diet', author: 'KetoPet Sanctuary',
    year: '2019', kind: 'guide', scrolls: 10,
    tags: ['ketogenic diet', 'canine cancer'],
    split: { consensus: 8, traditional: 0, author: 2 },
    pages: 15,
    group: 'other',
    about:
      'The ketogenic diet in canine cancer: the claim, the mechanism, and where the evidence actually stands.',
    caveat:
      'Several of its claims are contradicted on purpose — the counterweight scrolls are ours, not the book’s.',
  },
  {
    key: 'ft2', title: 'Flea & Tick Guide', author: 'Dr. Zac, Rachel Fusaro',
    kind: 'guide', scrolls: 6,
    tags: ['preventives', 'fleas'],
    split: { consensus: 5, traditional: 0, author: 1 },
    pages: 12,
    group: 'other',
    about:
      'A short owner’s guide to fleas and ticks.',
    caveat:
      'Affiliate links in the footer; no product is named in the corpus.',
  },
  /**
   * 🟡 ČERSTVO PRIDANÉ ČLOVEKOM — v zozname je HNEĎ, ale bledo a so stavom.
   * Do mozgu neprispelo ani jedným zvitkom, takže `scrolls: 0` a `split` nuly.
   * ⚠️ Nesčítava sa do súčtov — `VAULT_SOURCE_TOTALS` berie len prijaté.
   */
  {
    key: 'pending-1', title: 'Canine Nutrigenomics', author: 'W. Jean Dodds, DVM',
    kind: 'book', scrolls: 0,
    tags: ['nutrition', 'immunity'],
    split: { consensus: 0, traditional: 0, author: 0 },
    pages: 380, group: 'books',
    about: 'How food switches genes on and off — immunity, inflammation and the breeds that pay for it.',
    addedBy: 'Peter M.', pending: true, waiting: 2, devotion: 100,
  },
];

/** Prijaté zdroje — z nich mozog naozaj žije (aj tie neuvedené). */
export const ACCEPTED_SOURCES = VAULT_SOURCES.filter((d) => !d.pending);
/** Čo sa v knižnici naozaj ukáže. */
export const LISTED_SOURCES = ACCEPTED_SOURCES.filter((d) => !d.hidden);

/**
 * 🔴 HLAVIČKA RÁTA Z TOHO, ČO JE VIDNO. Keby brala všetko a zoznam ukazoval
 * o jeden menej, čísla by na obrazovke nesedeli so zoznamom pod nimi — a to je
 * presne ten druh tichého rozporu, ktorý má táto obrazovka vylučovať.
 * Rozdiel nesie veta v päte (`HIDDEN_NOTE`), nie mlčanie.
 */
export const VAULT_SOURCE_TOTALS = {
  scrolls: LISTED_SOURCES.reduce((s, d) => s + d.scrolls, 0),
  documents: LISTED_SOURCES.length,
  /** Písané nami — nie prepis knihy, ale bezpečnostná brána a konsenzus. */
  inHouse: 88,
};

/**
 * Čo sa v knižnici vykresľuje, vrátane čakajúcich. Čakajúca kniha patrí medzi
 * KNIHY — je to kniha aj kým čaká na posúdenie; osamotená pod zoznamom vyzerala
 * ako iný druh objektu.
 */
export const LIBRARY_SOURCES = VAULT_SOURCES.filter((d) => !d.hidden);

/** Zdroje v mozgu, ktoré zoznam neuvádza — do päty, jednou vetou. */
export const HIDDEN_SOURCES = ACCEPTED_SOURCES.filter((d) => d.hidden);

// ── SKUPINY (Matej 24. 9.: „knihy, iné publikácie, videá") ───────────────────
// 🚩 ŠTVRTÁ SKUPINA JE MOJE ROZHODNUTIE, NIE TVOJE ZADANIE. Vlastný text nie je
//    „iná publikácia" — nič sme nevydali, napísali sme to sem. Je to 88 zvitkov,
//    tretí najväčší zdroj v mozgu, a v koši „iné" by klamal o tom, čo je.
//    Keď to chceš do troch, zmaž skupinu 'own' a polož ju do 'other'.
// 🏷️ „Written here" MENO STRATILO — Matej 24. 9. 2026: *„stále to nechápem čo to
//    je"*, potom *„AINUBIS SEED alebo niečo podobné"*. Staré meno hovorilo KDE to
//    vzniklo, nie ČO to je, a v knižnici plnej kníh to znelo ako poznámka.
//    SEED = korpus, s ktorým sa narodil: bezpečnostná brána, hranica vet/rada
//    a rozsúdené spory medzi knihami.
// ⚠️ NEHOVORÍ, ŽE TO PÍSAL ON. Napísali sme to my; veta v `about` pod policou to
//    drží na mieste a pri zmene mena sa nesmie stratiť.
export const SOURCE_GROUPS: {
  key: VaultSource['group']; label: string; empty: string;
  /** Meno obsahuje AINUBISA ⇒ prvé dve písmená sa vykresľujú jeho cyanom. */
  mark?: boolean;
}[] = [
  { key: 'books', label: 'Books', empty: 'No books yet.' },
  { key: 'other', label: 'Other publications', empty: 'Nothing here yet.' },
  // Videá zatiaľ v mozgu nie sú ANI JEDNO — skupina je vidno preto, že sa dá
  // pridať (10 devotion), a prázdno to povie nahlas.
  { key: 'video', label: 'Videos', empty: 'None yet. A lecture with timestamps is worth 10 devotion.' },
  /* ⚠️ MENO NESIE JEHO TVAR — `AI` sa píše zvlášť, lebo farbu vie uniesť len
     markup, nie holý reťazec (brand lock, meno vždy `<span>AI</span>NUBIS`).
     Preto `mark`, a nie `label: 'AINUBIS SEED'` napísané jedným kusom. */
  { key: 'own', label: 'AINUBIS SEED', mark: true, empty: '' },
];

// ── ČO JE POLICA A ČO JE DETAIL (Matej 24. 9. 2026) ─────────────────────────
// AINUBIS SEED prestal byť policou so zoznamom — je to DETAIL, v ktorom sa
// vysvetlí, ako AINUBIS pracuje a ako držíme knižnicu. Zoznam v lište preto
// obsahuje len skupiny, ktoré naozaj nesú karty.
// ⚠️ Skupina `own` sa NEMAŽE — zdroj s 88 zvitkami žije ďalej a vykreslí sa
//    na konci detailu ako DÔKAZ. Zmazaním by sme zatajili tretí najväčší
//    zdroj v mozgu.
export const SEED_GROUP = SOURCE_GROUPS.find((g) => g.key === 'own')!;
export const SHELF_GROUPS = SOURCE_GROUPS.filter((g) => g.key !== 'own');
export const SEED_SOURCES = LIBRARY_SOURCES.filter((d) => d.group === 'own');

/** Podiel konsenzu v jednom zdroji — hlavičkové číslo karty (viď `split`). */
export const consensusPct = (d: VaultSource): number | null => {
  const all = d.split.consensus + d.split.traditional + d.split.author;
  return all > 0 ? Math.round((d.split.consensus / all) * 100) : null;
};

// ════════════════════════════════════════════════════════════════════════════
// KLAUZULA NAD ZOZNAMOM (Matej 24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// *„pri tomto musíme byť opatrný a dáme hore klauzulu že zdroje pochádzajú
//  z týchto kníh a príspevkov autorov… resp majú v tom základ"*.
//
// 🔴 NIE JE TO PRÁVNA DOLOŽKA, JE TO POPIS TOHO, ČO SA NAOZAJ DEJE — a preto
//    obstojí. Korpus je parafráza, nie prepis (pravidlo `plany/ainubis/kb/
//    00-SPEC.md` §5), skeny ležia v gitignorovanom `vstupy/AINUBIS/.extracted/`
//    a von nejde ani strana. Text to hovorí presne tak; keby sa raz začal
//    zverejňovať súbor, táto veta prestane platiť a musí sa zmeniť SPOLU s ním.
// ════════════════════════════════════════════════════════════════════════════
export const SOURCES_CLAUSE = 'AINUBIS does not reproduce any of these works. '
  + 'What he knows is written here in our own words, built on them — and every '
  + 'answer names the book it stands on, so you can go to the original. '
  + 'The authors did the work; we point at it.';

// ── PRIDANIE ZDROJA ─────────────────────────────────────────────────────────
// Matej 24. 9.: *„na výber bude pdf, kniha, url adresa článku, výskumu,
// organizácie… alebo link na video alebo len text, tipy názov knihy prípadne url"*.
// 🔴 DEVOTION SA PRIPÍŠE AŽ KEĎ TO PREJDE, nie za nahratie — inak sa nahrá hocičo.
// ⚠️ ČÍSLA SÚ MATEJOVE Z 24. 9. (kniha PDF 50+ strán = 100 · video = 10). Zvyšok
//    rebríčka a kalkulačka sú VLASTNÁ SESSION („rozoberieme"), takže druhy bez
//    dohodnutého čísla ho tu nemajú a povedia to nahlas.
export interface SourceKind {
  key: string;
  label: string;
  hint: string;
  /** Hand-drawn ikonka z `public/icons/pack/<ic>.svg`. */
  ic: string;
  /** Sľúbená DEVOTION. `null` = číslo ešte nepadlo. */
  devotion: number | null;
}

// 🔴 ŠTYRI DRUHY, NIE PÄŤ (Matej 24. 9. 2026: *„add source daj len 4 pdf / text
//    advice / video / link (blog, research)“*). **BOOK zanikol** — „názov a autor,
//    nájdeme ju sami" nie je druh zdroja, je to želanie. Kto má knihu, pošle PDF;
//    kto má len názov, pošle odkaz. Piaty riadok len rátal s tým, že niekto iný
//    spísaný súbor zoženie — a to sa nikdy nestalo.
// ⚠️ „Just text“ → „Text advice“: starý názov znel ako úľava („len text“),
//    pritom je to rada, ktorú AINUBIS môže prijať do korpusu.
// 🔴 IKONKA VIDEA = `play.svg` (Matej 24. 9. 2026). Pôvodná poznámka tvrdila, že
//    „kit kresbu prehrávania nemá" — NEBOLA TO PRAVDA a stálo to jedno kolo návrhov:
//    `public/icons/pack/` je len VÝSEK kitu. Celý hand-drawn kit (138 kresieb) žije
//    v `vystupy/dashboard/embeds/brand/icons-handdrawn/` a trojuholník v ňom bol
//    (`arrow-point-hand-drawn-outline-pointing-to-right-direction-svgrepo-com.svg`).
//    ⚠️ KEĎ CHÝBA IKONKA, HĽADAJ NAJPRV TAM — a až potom hovor, že v kite nie je.
//    Všetky štyri druhy sú tým pádom z jedného kitu a sedia bez výhrad.
export const SOURCE_KINDS: SourceKind[] = [
  { key: 'pdf', label: 'PDF', ic: 'document', hint: 'a scan or an e-book, 50+ pages', devotion: 100 },
  { key: 'text', label: 'Text advice', ic: 'pencil', hint: 'what you know and where it comes from', devotion: null },
  { key: 'video', label: 'Video', ic: 'play', hint: 'a lecture or a breakdown, with timestamps', devotion: 10 },
  { key: 'link', label: 'Link', ic: 'link', hint: 'a blog, a study, an organisation', devotion: null },
];

/**
 * 🔴 WEB RESEARCH ZATIAĽ NEEXISTUJE. AINUBIS nemá nástroj na vyhľadávanie na
 * internete (`vystupy/supabase/functions/ainubis-chat` žiadny taký nástroj
 * nedeklaruje) — do zoznamu preto ide ako PRÁZDNY RIADOK, nie ako číslo nula
 * medzi ostatnými. Nula v rade s 270 a 184 vyzerá ako zdroj, ktorý sa zatiaľ
 * nepoužil; toto je zdroj, ktorý neexistuje.
 */
export const WEB_RESEARCH_EXISTS = false;

/** Veta o neuvedených zdrojoch. Skladá sa z dát, aby nezostarla. */
export const hiddenNote = (): string | null => {
  if (HIDDEN_SOURCES.length === 0) return null;
  const n = HIDDEN_SOURCES.reduce((s, d) => s + d.scrolls, 0);
  return `${HIDDEN_SOURCES.length} more document (${n} scrolls) is in the brain but not listed here `
    + '— a marketing guide we take one narrow thing from.';
};
