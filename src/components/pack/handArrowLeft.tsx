// Šípka vľavo — VLASTNÝ MODUL (perf 7. 10. 2026). Používa ju hlavný balík (ConsentBanner,
// PageTopBar); keby ju bral z HandIcons.tsx, Rollup by do hlavného balíka pribalil CELÝ HandIcons
// (74 kB — všetky ikonky appky), lebo modul patrí do jedného kusu so všetkým, čo z neho chce
// ktokoľvek. HandIcons.tsx ju ďalej exportuje (`export function HandArrowLeft` = register ikon).
import type { HandIconProps } from './HandIcons';

/**
 * Iba VONKAJŠIA kontúra kresby — plná silueta namiesto obrysovej.
 *
 * Kresby z kitu sú „outline": majú DVE kontúry (vonkajšiu a vnútornú) a pri
 * `fill-rule: nonzero` sa opačne vinutá vnútorná odčíta, takže ikonka je dutá.
 * Keď má byť plná (Matej 24. 9. 2026 o šípkach výberu patróna: *„najlepšie ak
 * by si ich vyplnil bledou farbou, nie len obrys ako sú teraz"*), zoberie sa
 * prvá kontúra po prvé `z`.
 *
 * ⚠️ NIE JE TO EDITÁCIA `d` — tú generuje zdroj v `vstupy/vizualna-identita/`
 *    a ručne sa nesmie meniť. Toto je jeho orezanie za behu, takže výmena
 *    kresby v zdroji ostáva plne funkčná.
 * ⚠️ Keď kresba druhú kontúru nemá, vráti sa NEZMENENÁ — plná poloha teda nikdy
 *    nemôže ikonku „odseknúť" na niečo, čo nikto nenakreslil.
 */
function outerOnly(d: string): string {
  const end = d.indexOf('z');
  if (end < 0) return d;
  return d.slice(end + 1).includes('M') ? d.slice(0, end + 1) : d;
}

function svgProps(size: number) {
  return { width: size, height: size, fill: 'currentColor', focusable: false as const, 'aria-hidden': true as const };
}

/** šípka vľavo — krok späť · zdroj: left-arrow-hand-drawn-outline-svgrepo-com.svg */
/** Kresba šípky — `d` je generované zo zdroja, needituj ho tu. */
const ARROW_LEFT_D = `M380.44,70.332c-0.376-4.936-3.362-9.46-7.663-12.781c-20.216-15.615-39.745-32.078-58.676-49.234
			c-4.764-7.814-15.884-12.126-24.359-3.79C222.106,71.022,162.894,145.963,88.677,205.589c-2.034,1.632-3.405,3.427-4.258,5.278
			c-4.248,5.583-5.319,13.649,0.794,20.251c69.221,74.753,133.554,153.913,204.528,227.062c4.809,4.961,10.547,5.561,15.463,3.702
			c2.828-0.36,5.682-1.488,8.333-3.702c21.018-17.61,41.223-36.125,60.666-55.467c8.363-8.322,4.22-19.296-3.488-24.136
			c-40.654-48.362-87.067-96.258-127.666-144.666c46.053-46.261,90.439-98.67,134.623-146.655
			C382.628,81.869,382.816,75.526,380.44,70.332z M215.21,217.72c-2.356,2.311-3.656,4.837-4.248,7.373
			c-3.786,5.578-4.674,13.348,0.78,19.883c41.018,49.13,87.979,97.63,129.222,146.561c-12.446,11.999-25.288,23.572-38.364,34.901
			c-63.521-66.445-122.15-137.318-184.153-205.15C184.958,166.153,239.8,99.116,300.466,37.898
			c14.833,13.089,30.042,25.692,45.564,37.948C303.879,122.922,260.412,173.422,215.21,217.72z`;

export function HandArrowLeftIcon({ size = 16, className, style, title, solid }: HandIconProps & {
  /** Plná silueta namiesto obrysu (`outerOnly`). Predvolene obrys, ako v kite. */
  solid?: boolean;
}) {
  return (
    <svg viewBox="0 0 462.85 462.851" className={className} style={style} {...svgProps(size)} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d={solid ? outerOnly(ARROW_LEFT_D) : ARROW_LEFT_D} />
    </svg>
  );
}

