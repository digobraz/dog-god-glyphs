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
}

export const VAULT_SOURCES: VaultSource[] = [
  {
    key: 'fd', title: 'Feeding Dogs: Dry or Raw?', author: 'Dr. Conor Brady',
    kind: 'book', extent: '24 chapters', scrolls: 270,
    tags: ['nutrition', 'raw vs kibble'],
  },
  {
    key: 'hd', title: 'The Herbal Dog', author: 'Rita Hogan',
    kind: 'book', extent: '8 chapters', scrolls: 184,
    tags: ['herbs', 'body systems'],
  },
  {
    key: 'own', title: 'Written here, not taken from a book',
    kind: 'in-house', scrolls: 88,
    tags: ['safety', 'consensus'],
  },
  {
    key: '4pfd', title: 'Four Paws, Five Directions', author: 'Cheryl Schwartz, DVM',
    year: '1996', kind: 'book', extent: 'ch. 1–7, 111 pp', scrolls: 54,
    tags: ['five elements', 'food energetics'],
  },
  {
    key: 'free', title: 'Free Homemade Dog Food Guide', author: '“the dog nutritionist”',
    year: '2023', kind: 'guide', extent: '47 pp', scrolls: 23,
    tags: ['home cooking', 'balancing meals'],
  },
  {
    key: 'tcm', title: 'Konštitučná dietetika', author: 'Norbert Synčák',
    kind: 'slides', scrolls: 17,
    tags: ['thermal nature', 'food tables'],
  },
  {
    key: 'long', title: 'Pro více šťastných společných let', author: 'MVDr. Jiří Urbánek',
    kind: 'e-book', scrolls: 13,
    tags: ['longevity', 'cell biology'],
  },
  {
    key: 'ft1', title: 'Flea, Tick & Heartworm Guide', author: 'Dr. Karen Becker, Dr. Judy Morgan',
    kind: 'guide', extent: '13 pp', scrolls: 10,
    tags: ['preventives', 'deterrents'],
  },
  {
    key: 'keto', title: 'A Pet Parent’s Guide to the Ketogenic Diet', author: 'KetoPet Sanctuary',
    year: '2019', kind: 'guide', extent: '15 pp', scrolls: 10,
    tags: ['ketogenic diet', 'canine cancer'],
  },
  {
    key: 'ft2', title: 'Flea & Tick Guide', author: 'Dr. Zac, Rachel Fusaro',
    kind: 'guide', extent: '12 pp', scrolls: 6,
    tags: ['preventives', 'fleas'],
  },
];

export const VAULT_SOURCE_TOTALS = {
  scrolls: VAULT_SOURCES.reduce((s, d) => s + d.scrolls, 0),
  documents: VAULT_SOURCES.length,
  /** Písané nami — nie prepis knihy, ale bezpečnostná brána a konsenzus. */
  inHouse: 88,
};

/**
 * 🔴 WEB RESEARCH ZATIAĽ NEEXISTUJE. AINUBIS nemá nástroj na vyhľadávanie na
 * internete (`vystupy/supabase/functions/ainubis-chat` žiadny taký nástroj
 * nedeklaruje) — do zoznamu preto ide ako PRÁZDNY RIADOK, nie ako číslo nula
 * medzi ostatnými. Nula v rade s 270 a 184 vyzerá ako zdroj, ktorý sa zatiaľ
 * nepoužil; toto je zdroj, ktorý neexistuje.
 */
export const WEB_RESEARCH_EXISTS = false;
