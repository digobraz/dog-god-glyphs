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
  /** Rozsah, ako ho eviduje `plany/ainubis/kb/00-SPEC.md` §2. */
  extent?: string;
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
    split: { consensus: 164, traditional: 1, author: 105 }
  },
  {
    key: 'hd', title: 'The Herbal Dog', author: 'Rita Hogan',
    kind: 'book', extent: '8 chapters', scrolls: 184,
    tags: ['herbs', 'body systems'],
    split: { consensus: 39, traditional: 135, author: 10 }
  },
  {
    key: 'own', title: 'Written here, not taken from a book',
    kind: 'in-house', scrolls: 88,
    tags: ['safety', 'consensus'],
    split: { consensus: 86, traditional: 1, author: 1 }
  },
  {
    key: '4pfd', title: 'Four Paws, Five Directions', author: 'Cheryl Schwartz, DVM',
    year: '1996', kind: 'book', extent: 'ch. 1–7, 111 pp', scrolls: 54,
    tags: ['five elements', 'food energetics'],
    split: { consensus: 1, traditional: 50, author: 3 }
  },
  {
    key: 'free', title: 'Free Homemade Dog Food Guide', author: '“the dog nutritionist”',
    year: '2023', kind: 'guide', extent: '47 pp', scrolls: 23,
    tags: ['home cooking', 'balancing meals'],
    split: { consensus: 11, traditional: 0, author: 12 }
  },
  {
    key: 'tcm', title: 'Konštitučná dietetika', author: 'Norbert Synčák',
    kind: 'slides', scrolls: 17,
    tags: ['thermal nature', 'food tables'],
    split: { consensus: 0, traditional: 17, author: 0 }
  },
  {
    key: 'long', title: 'Pro více šťastných společných let', author: 'MVDr. Jiří Urbánek',
    kind: 'e-book', scrolls: 13,
    tags: ['longevity', 'cell biology'],
    split: { consensus: 8, traditional: 1, author: 4 }
  },
  {
    key: 'ft1', title: 'Flea, Tick & Heartworm Guide', author: 'Dr. Karen Becker, Dr. Judy Morgan',
    kind: 'guide', extent: '13 pp', scrolls: 10,
    tags: ['preventives', 'deterrents'],
    split: { consensus: 3, traditional: 0, author: 7 }
  },
  {
    key: 'keto', title: 'A Pet Parent’s Guide to the Ketogenic Diet', author: 'KetoPet Sanctuary',
    year: '2019', kind: 'guide', extent: '15 pp', scrolls: 10,
    tags: ['ketogenic diet', 'canine cancer'],
    split: { consensus: 8, traditional: 0, author: 2 }
  },
  {
    key: 'ft2', title: 'Flea & Tick Guide', author: 'Dr. Zac, Rachel Fusaro',
    kind: 'guide', extent: '12 pp', scrolls: 6,
    tags: ['preventives', 'fleas'],
    split: { consensus: 5, traditional: 0, author: 1 }
  },
  /**
   * 🟡 ČERSTVO PRIDANÉ ČLOVEKOM — v zozname je HNEĎ, ale bledo a so stavom.
   * Do mozgu neprispelo ani jedným zvitkom, takže `scrolls: 0` a `split` nuly.
   * ⚠️ Nesčítava sa do súčtov — `VAULT_SOURCE_TOTALS` berie len prijaté.
   */
  {
    key: 'pending-1', title: 'Canine Nutrigenomics', author: 'W. Jean Dodds, DVM',
    kind: 'book', extent: 'PDF, 380 pp', scrolls: 0,
    tags: ['nutrition', 'immunity'],
    split: { consensus: 0, traditional: 0, author: 0 },
    addedBy: 'Peter M.', pending: true, waiting: 2, devotion: 100,
  },
];

/** Prijaté zdroje — z nich mozog naozaj žije. */
export const ACCEPTED_SOURCES = VAULT_SOURCES.filter((d) => !d.pending);

export const VAULT_SOURCE_TOTALS = {
  scrolls: ACCEPTED_SOURCES.reduce((s, d) => s + d.scrolls, 0),
  documents: ACCEPTED_SOURCES.length,
  /** Písané nami — nie prepis knihy, ale bezpečnostná brána a konsenzus. */
  inHouse: 88,
};

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
  /** Sľúbená DEVOTION. `null` = číslo ešte nepadlo. */
  devotion: number | null;
}

export const SOURCE_KINDS: SourceKind[] = [
  { key: 'pdf', label: 'PDF', hint: 'a scan or an e-book, 50+ pages', devotion: 100 },
  { key: 'book', label: 'Book', hint: 'title and author — we find it ourselves', devotion: null },
  { key: 'video', label: 'Video', hint: 'a lecture or a breakdown, with timestamps', devotion: 10 },
  { key: 'link', label: 'Link', hint: 'an article, a study, an organisation', devotion: null },
  { key: 'text', label: 'Just text', hint: 'what you know and where it comes from', devotion: null },
];

/**
 * 🔴 WEB RESEARCH ZATIAĽ NEEXISTUJE. AINUBIS nemá nástroj na vyhľadávanie na
 * internete (`vystupy/supabase/functions/ainubis-chat` žiadny taký nástroj
 * nedeklaruje) — do zoznamu preto ide ako PRÁZDNY RIADOK, nie ako číslo nula
 * medzi ostatnými. Nula v rade s 270 a 184 vyzerá ako zdroj, ktorý sa zatiaľ
 * nepoužil; toto je zdroj, ktorý neexistuje.
 */
export const WEB_RESEARCH_EXISTS = false;
