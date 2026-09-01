// ════════════════════════════════════════════════════════════════════════════
// SVÄTOŽIARA nad zvieraťom v prvom výjave (/onepage aj /religion-lab)
// ────────────────────────────────────────────────────────────────────────────
// Matej 27. 8. 2026: *„krava má halo s čiernou, lebo je to vystrihnuté
// z čierneho webu"*. Halo bolo zapečené v `codex3-cow.png` aj s glow, ktorý bol
// nasvietený na čierno — na papyruse z neho ostala špinavá škvrna. Nahradila ho
// táto vrstva a fotka kravy je odvtedy `codex3-cow-nohalo.png`.
//
// 🔴 PREČO VRSTVA A NIE NOVÁ FOTKA: pointa druhého výjavu je, že Hektorovi sa
//    svätožiara ROZSVIETI, keď scroll dopíše „AND NOT ONE OF THEM BOWS.".
//    Zapečené halo sa rozsvietiť nedá — ani na novej fotke. Navyše geometria
//    zvierat je LOCKED (ReligionLab.tsx) a zamknutá na presné orezanie týchto
//    PNG; nová fotka by to ladenie začala odznova.
//
// ⚠️ ZAROVNANIE NESIE `preserveAspectRatio`, NIE VLASTNÁ MATEMATIKA.
//    Zvieratá sú `<img>` v ráme 50vw × 100vh s `object-fit: contain` +
//    `object-position: bottom left|right`. Tento SVG má ROVNAKÝ viewBox ako PNG
//    (960 × 1080) a nesie TIE ISTÉ triedy `.codex-cow` / `.codex-hektor`, takže
//    `xMinYMax meet` (= contain + bottom left) ho položí na fotku pixel na pixel
//    pri KAŽDEJ šírke okna, vrátane mobilnej vetvy s vlastnou mierkou. Žiadne
//    prepočítavanie polohy hlavy — a teda ani nič, čo by sa rozišlo.
//    ⚠️ `object-fit` na inline `<svg>` NEPLATÍ (nie je to nahradený prvok);
//    zarovnanie robí výhradne `preserveAspectRatio`. Meniť ho spolu s triedou.
//
// ⚠️ VRSTVA PATRÍ POD ZVIERA. V DOM-e stojí PRED `<img>`, aby hlava prekryla
//    spodný oblúk prstenca — presne ako to mala zapečená verzia. Nad fotkou by
//    prstenec ležal na srsti a vyzeral ako nálepka.
// ════════════════════════════════════════════════════════════════════════════

/** Poloha prstenca v súradniciach PNG (960 × 1080). Odmerané z fotiek, nie odhad. */
const RINGS = {
  /** Kopíruje pôvodné zapečené halo kravy — aby swap fotky nikto nezbadal. */
  cow: { cx: 450, cy: 168, rx: 166, ry: 34, tilt: 7 },
  /** Hektor halo nikdy nemal; prstenec sedí nad temenom (jeho vrchol je y≈392). */
  hektor: { cx: 590, cy: 330, rx: 150, ry: 31, tilt: -6 },
} as const;

/**
 * Zlatá rodina brand v3.2. ⚠️ Žiadna biela a nič studené — celé toto zadanie
 * vzniklo preto, že glow bol tmavý. Jadro je teplá krémová, nie `#fff`.
 */
const GOLD = {
  glow: '#C99A3F',
  mid: '#E8B24A',
  core: '#F7DFA0',
  hot: '#FFF0C8',
} as const;

type Who = keyof typeof RINGS;

export default function CodexHalo({ who }: { who: Who }) {
  const r = RINGS[who];
  // Rozostrenie sa počíta z bboxu prvku, takže oblasť filtra musí byť veľkorysá —
  // pri predvolených -10 %/120 % by sa mäkký prstenec orezal rovnou hranou.
  const region = { x: '-40%', y: '-160%', width: '180%', height: '420%' };
  const f = (id: string) => `codex-halo-${who}-${id}`;

  return (
    <svg
      className={`codex-${who} codex-halo codex-halo-${who}`}
      viewBox="0 0 960 1080"
      preserveAspectRatio={who === 'cow' ? 'xMinYMax meet' : 'xMaxYMax meet'}
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id={f('soft')} {...region}><feGaussianBlur stdDeviation="20" /></filter>
        <filter id={f('mid')} {...region}><feGaussianBlur stdDeviation="7" /></filter>
        <filter id={f('core')} {...region}><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      {/* Vonkajšia skupina drží polohu a náklon (atribút), vnútorná mierku
          rozsvietenia (CSS) — zapísať oboje na jeden prvok sa nedá, CSS
          `transform` by atribút `transform` ticho prebilo. */}
      <g transform={`translate(${r.cx} ${r.cy}) rotate(${r.tilt})`}>
        <g className="codex-halo-scale">
          {/* Štyri prstence na sebe = glow je vnútri AJ vonku. `box-shadow` na
              elipse to nedá, preto SVG s rozostrením. */}
          <ellipse rx={r.rx} ry={r.ry} fill="none" stroke={GOLD.glow} strokeWidth="42" opacity="0.58" filter={`url(#${f('soft')})`} />
          <ellipse rx={r.rx} ry={r.ry} fill="none" stroke={GOLD.mid} strokeWidth="17" opacity="0.9" filter={`url(#${f('mid')})`} />
          <ellipse rx={r.rx} ry={r.ry} fill="none" stroke={GOLD.core} strokeWidth="5.5" filter={`url(#${f('core')})`} />
          <ellipse rx={r.rx} ry={r.ry} fill="none" stroke={GOLD.hot} strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}
