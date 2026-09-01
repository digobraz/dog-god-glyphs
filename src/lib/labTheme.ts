// ════════════════════════════════════════════════════════════════════════════
// LAB THEME — papyrusové tokeny SVETLÉHO REŽIMU (DEV ONLY)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 8. 2026: *„prechádzame na svetlý režim — WALLLAB sa teda nebude
// týkať len wallu ale aj celého webu (religion/vision/about)… texty ostávajú,
// pozadie bude bledé"* + *„urob to v režime WALLLAB, tá stará zostáva zachovaná"*.
//
// JEDEN ZDROJ ODTIEŇOV pre všetky `*Lab` povrchy. Dôvod je ten istý, pre ktorý
// vznikla matrica `PACK_BOX` v `packTheme.ts` (Matej 13. 8.: *„vytiahni DNA…
// aby to nebolo všade iné, lebo to vyzerá neprofesionálne"*) — tri stránky
// prefarbené od oka = tri rôzne papyrusy.
//
// ⚠️ Hodnoty sú ODPÍSANÉ z `components/gods/GodsGridLab.tsx` (WALL LAB, 25. 8.),
//    kde ich Matej doladil ako prvé. Wall si ich zatiaľ drží inline — schválne
//    sa jej nedotýkame, kým beží ladenie. **Keď Matej svetlý režim odklepne,
//    prepni GodsGridLab na tieto tokeny**, inak vznikne druhý zdroj pravdy.
// ⚠️ Toto NIE JE `packTheme.ts`. `T`/`PACK_BOX` platia ďalej pre `/pack`
//    (papyrusové KARTY na tmavej stránke). `LAB` rieši opačný prípad —
//    papyrusová CELÁ STRÁNKA. Nemiešaj ich.
// ⚠️ Používa sa aj vnútri `<style>{` … `}</style>` blokov cez `${LAB.x}`.
//    Preto sú to holé CSS reťazce, nie objekty.
// ════════════════════════════════════════════════════════════════════════════

export const LAB = {
  /** Základná farba plochy (pod podkladom aj mimo neho). */
  pageBg: '#F3E4C4',

  /** Podklad stránky — čistý papyrus, žiadna heroglyfová textúra, žiadny blur. */
  pageBackdrop:
    'radial-gradient(125% 100% at 50% 38%, #FDF8EC 0%, #F8EDD6 34%, #F1E1BE 64%, #E6D2A6 100%)',

  /** Náhrada za čiernu vinjetu tmavého webu — na papyruse sa tmaví do zlatohneda. */
  pageVeil:
    'radial-gradient(ellipse at center, rgba(255,255,255,0.30) 0%, rgba(201,154,63,0.08) 62%, rgba(138,90,20,0.16) 100%)',

  // ── inkoust ──────────────────────────────────────────────────────────────
  /** Nadpisy a hlavný text. */
  ink: 'rgba(35,22,8,0.90)',
  /** Bežný odstavec. */
  inkBody: 'rgba(35,22,8,0.82)',
  /** Popisky, micro-copy. */
  inkSoft: 'rgba(60,40,12,0.62)',
  /** Najtlmenejšie (poznámky v zátvorke). */
  inkMuted: 'rgba(60,40,12,0.52)',

  // ── zlatá ────────────────────────────────────────────────────────────────
  /** Zlatý gradient DO TEXTU. Na papyruse musí byť tmavší, inak text zmizne. */
  goldText:
    'linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%)',
  /** Plná zlatá na text (tam, kde gradient nedáva zmysel). */
  goldInk: '#8a5a14',
  /** Plná zlatá na plôšky (kosoštvorce, odrážky, linky). */
  goldSolid: '#A3782B',
  /** Rám / hranica na papyruse. */
  edge: 'rgba(140,96,20,0.60)',
  /** Vyblednutá deliaca čiara. */
  hairline: 'rgba(140,96,20,0.30)',
  /** Tieň — na papyruse hnedý, nikdy čierny (čierna tu špiní). */
  shadow: '0 12px 36px rgba(110,71,16,0.26)',
} as const;

/**
 * ⚠️ VÝPLŇ CTA TLAČIDLA SA V SVETLOM REŽIME NEMENÍ — `.btn-gold` je LOCKED
 * (gradient `#F5C73D→#E69E1A`, radius 8px). Na papyruse drží kontrast sám a je
 * to jediný prvok, ktorý má na stránke svietiť. Preto tu zámerne NIE JE token
 * „gold button": kto ho hľadá, má siahnuť po pôvodnej triede.
 */
