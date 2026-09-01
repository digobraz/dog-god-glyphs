// wizAnchors — JEDINÝ register kotiev, na ktoré svieti spotlight prehliadky (AInubis).
//
// Prečo súbor: prehliadka bola do 22. 6. 2026 zaparkovaná s voľnými stringmi
// (`'wiz-steps'` v komponente, `id="wiz-steps"` na bloku homepage). Pri redizajne
// homepage 5. 8. blok „First Steps" zanikol — string ostal, build prešiel a spotlight
// svietil do prázdna. Kotva aj prehliadka odteraz čítajú TEN ISTÝ objekt, takže
// zmiznutý blok zhodí `tsc`, nie človeka pred obrazovkou.
//
// ⚠️ Kotva sa NEPÍŠE ručne do `id=""`. Vždy `id={WIZ.hero}`.
export const WIZ = {
  /** Blok JA + SVORKA na `/pack` (HeroCard wrapper). */
  hero: 'wiz-hero',
  /** Rad avatarov vnútri HeroCard — majiteľ + psy + „+". Odtiaľ sa ide do svorky. */
  dogsRow: 'wiz-dogs-row',
  /** Dvojblok DOGMA · AINUBIS (`Gateways`). Nahradil zaniknuté „First Steps". */
  gateways: 'wiz-gateways',
  /** Planéta + míľniky (`GlobePulse`). */
  globe: 'wiz-globe',
  /** Ikonka MAPA v spodnej plávajúcej lište (`PackBottomNav`). */
  navMap: 'wiz-nav-map',
} as const;

/** Kotvy, ktoré sú OKRÚHLE/pilulkové — spotlight im nesmie dať 18px radius
 *  (Matej 24. 8.: „zasvietiť v navigácii tú ikonku"). */
export const WIZ_ROUND: readonly string[] = [WIZ.navMap];

export type WizAnchor = typeof WIZ[keyof typeof WIZ];

/**
 * Runtime poistka pre prípad, že kotva na stránke nie je (blok za flagom, iná
 * routa, ešte sa nedomountoval). Prehliadka taký krok PRESKOČÍ — do 24. 8. sa
 * namiesto toho ukázala bublina bez spotlightu a človek nevedel, o čom mu AInubis
 * hovorí.
 */
export function anchorExists(id: WizAnchor): boolean {
  if (typeof document === 'undefined') return false;
  return !!document.getElementById(id);
}
