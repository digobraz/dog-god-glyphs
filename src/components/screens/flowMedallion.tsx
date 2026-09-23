// ════════════════════════════════════════════════════════════════════════════
// HEKTHOR V MEDAILÓNE — vstup heroglyfu (23. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej: „okolo každej fotky dajme rámik aký je aj pri logu v /onepage nech to
// oživíme."
//
// 🔁 Kresba sa NEKOPÍRUJE — `goldRing` aj `Deco` sa čítajú z `lab/NavMedallion`,
//    kde ich ladí nákres `plany/nakres-nav-medailon-2026-08-27.html`. Dve kópie
//    tej istej obruče by sa pri prvej úprave rozišli. Tu sa mení JEDINÉ: vnútro
//    (fotka namiesto loga) a priemer.
//    🔒 Lock `onepage-nav.md`: hodnoty `MEDAL` sa nikde nižšie neprepisujú.
//
// ⚠️ DVE PASCE GEOMETRIE, obe zapísané v locku a v hlavičke `NavMedallion.tsx`:
//    1. `<svg>` je nahradený prvok — z `position:absolute; inset:0` si rozmer
//       NEVEZME, drží default 300×150. Preto má `width/height: 100%`.
//    2. Plátno absolútneho potomka je PADDING-box rodiča, a lem je práve padding
//       ⇒ `100%` je celý priemer AJ s lemom. Žiadny záporný inset.
//
// ⚠️ `Deco` nesie SVG `id="navMedalGem"`. Na jednej obrazovke smie byť jedna
//    inštancia; vo vstupe flow nie je horný nav, takže sa nestretnú. Keby raz
//    mali, gradient treba premenovať v zdroji — nie tu.
// ════════════════════════════════════════════════════════════════════════════
import { Deco, MEDAL, goldRing } from '@/components/lab/NavMedallion';

type Props = {
  /** Adresa fotky (kruh je v súbore orezaný na pixel — `hekthorFaces.ts`). */
  src: string;
  /** Priemer aj s obručou, v px. */
  size?: number;
  alt?: string;
  className?: string;
};

export function FlowMedallion({ src, size = 132, alt = 'HEKTHOR', className }: Props) {
  // Lem drží pomer k priemeru z nákresu (8 z 100), aby obruč pri inej veľkosti
  // nebola opticky tenšia či hrubšia než v nave.
  const rim = Math.max(4, Math.round((MEDAL.ow / MEDAL.d) * size));
  return (
    <span
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        width: size,
        height: size,
        borderRadius: '50%',
        padding: rim,
        background: goldRing(MEDAL.metalAngle),
        boxShadow:
          '0 10px 26px -6px rgba(0,0,0,.55), 0 3px 0 -1px rgba(70,46,12,.55), inset 0 0 0 1px rgba(255,240,200,.35)',
        flex: 'none',
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: MEDAL.blue,
          boxShadow: `inset 0 0 0 ${Math.max(1, Math.round(rim * 0.42))}px ${MEDAL.blue}`,
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </span>
      <Deco />
    </span>
  );
}

/** Ozdoba je `position:absolute` — pozicuje ju trieda z `NAV_MEDALLION_CSS`,
 *  ktorú ale vkladá `OnePage`. Vo flow ju musíme priniesť so sebou. */
export const FLOW_MEDAL_CSS = `
.hf-medal .nav-medal-deco{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}
`;
