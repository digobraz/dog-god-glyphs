import { useEffect, useState } from 'react';

// ════════════════════════════════════════════════════════════════════════════
// HEKTHOR V MEDAILÓNE — vstup heroglyfu
// ────────────────────────────────────────────────────────────────────────────
// Matej 23. 9. 2026: „okolo každej fotky dajme rámik aký je aj pri logu
// v /onepage nech to oživíme."
//
// 🔴 OD 24. 9. 2026 JE OBRUČ VLASTNÁ, NIE ČÍTANÁ Z NAVU. Matej nad nákresom
//    šiestich polôh: *„tak ju oddel, riešme ju len v hero flow… a ak sa nám
//    bude páčiť, vymeníme ju aj na /onepage"*. Dovtedy sa `Deco` a `MEDAL`
//    čítali z `lab/NavMedallion` — čo bolo správne, kým bola kresba spoločná,
//    ale upgrade by nepozorovane prekreslil aj horný nav (LOCKED).
//    ⚠️ Sú to teraz DVE kresby a môžu sa rozísť. Je to zámer, nie nedopatrenie:
//       nav ostáva na starej, flow ide dopredu. Keď Matej povie „vymeň aj nav",
//       prenesie sa TENTO súbor tam, nie naopak.
//    🔒 `lab/NavMedallion` sa odtiaľto NEIMPORTUJE. Jediné, čo prežilo, je
//       zlatý conic gradient — ten je brandový kov, nie kresba obruče.
//
// ── ČO JE „D2 — CLOISONNÉ + RYTINA" (Matejov výber z nákresu) ───────────────
// Matej: *„popracujme na tých pásikoch, viac 3D, urobme ich ako naozajstná
// egyptská obruč"*. Skutočná egyptská obruč (pektorál, Horovo oko) je
// **cloisonné**: kamene VSADENÉ V ZLATÝCH PRIEHRADKÁCH. Starý pás bol plochá
// modrá výseč od hrany po hranu — preto pôsobil ako natlačený papier.
// Päť vrstiev, každá rieši jednu vec:
//   1. `rails`  — hladké zlaté lemy hore a dole; bez nich sa kamene rozsypú
//   2. kameň    — telo + kupola (svetlo pri vonkajšej hrane, tieň pri vnútornej)
//   3. `wall`   — zlatá priehradka okolo kameňa, svetlejšia na strane k svetlu
//   4. iskra    — ostrý bod odlesku na kupole
//   5. `rays`   — rytina v zlatých medzipoliach, aby zlato nebolo prázdna plocha
//
// 🔑 SVETLO MÁ JEDEN SMER (`LIGHT`, 59° — ten istý uhol ako conic gradient kovu).
//    Sila lesku každého kameňa sa z neho POČÍTA (`lit`), nie prideľuje po oku;
//    inak by obruč vyzerala ako osvetlená z dvadsiatich strán naraz.
//
// 🔑 LADÍ SA V `plany/nakres-obruc-2026-09-24.html`. Tvary aj čísla nižšie sú
//    prenesené odtiaľ — nákres má tie isté funkcie a dá sa v ňom skúšať bez buildu.
//
// ⚠️ DVE PASCE GEOMETRIE (zdedené z nava, stále platia):
//    1. `<svg>` je nahradený prvok — z `position:absolute; inset:0` si rozmer
//       NEVEZME, drží default 300×150. Preto má `width/height: 100%`.
//    2. Plátno absolútneho potomka je PADDING-box rodiča, a lem je práve padding
//       ⇒ `100%` je celý priemer AJ s lemom. Žiadny záporný inset.
// ════════════════════════════════════════════════════════════════════════════

/** Zlatý kov obruče. Brandový gradient — spoločný s navom, nie je to kresba. */
const goldRing = (angle: number) =>
  `conic-gradient(from ${angle}deg,#FCF0C2,#EDCE7C 8%,#D8B052 22%,#AA8129 34%,#C09636 46%,#F7E4A8 58%,#D8B052 72%,#A97F27 86%,#FCF0C2 100%)`;

/** Vzhľad obruče. Jediné miesto na ladenie — hodnoty prenesené z nákresu. */
const RING = {
  /** Šírka lemu v % priemeru. 8 z 100 je pomer z nava, aby obruč nebola opticky inak hrubá. */
  ow: 8,
  /**
   * Koľko kameňov (párne — striedajú sa so zlatými medzipoliami).
   *
   * 🔴 `segs / 2` MUSÍ BYŤ NEPÁRNE (22 ⇒ 11). Len vtedy vyjde dole v strede
   *    ZLATÉ MEDZIPOLE, teda rytina kolmo na stred (Matej 24. 9. 2026: *„treba
   *    tu obruč vycentrovať aby bola súmerná, na spodnom okraji by mala byť
   *    rytina kolmo na stred a v strede"*). Pri 24 by dole sedel KAMEŇ a rytiny
   *    by stáli po jeho stranách — obruč by bola súmerná, ale bez kolmej rytiny
   *    v ose. Zmena počtu je preto skok o 4 (18 · 22 · 26), nie o 2.
   */
  segs: 22,
  /** Hrúbka zlatej priehradky vo viewBox jednotkách. */
  wall: 0.9,
  /** Sila kupoly kameňa. 0 = plochý. */
  dome: 1,
  /** Odkiaľ svieti, v stupňoch. Zhodné s natočením kovu. */
  light: 59,
  lapis: '#0A1A4A',
  lapisHi: '#2A4BA8',
  lapisLo: '#050D26',
} as const;

const P = (a: number, r: number): [number, number] => [
  50 + r * Math.cos(((a - 90) * Math.PI) / 180),
  50 + r * Math.sin(((a - 90) * Math.PI) / 180),
];

/** Výseč medzikružia — jeden kameň alebo jedno medzipole. */
const seg = (a0: number, a1: number, rOut: number, rIn: number) => {
  const p1 = P(a0, rOut), p2 = P(a1, rOut), p3 = P(a1, rIn), p4 = P(a0, rIn);
  return `M${p1} A${rOut} ${rOut} 0 0 1 ${p2} L${p3} A${rIn} ${rIn} 0 0 0 ${p4} Z`;
};

/** Ako silno je uhol privrátený k svetlu: 1 = plné svetlo, 0 = odvrátený. */
const lit = (a: number) => (Math.cos(((a - RING.light) * Math.PI) / 180) + 1) / 2;

/** Cloisonné pás + rytina. Kreslí sa do SVG — priehradka a kupola potrebujú TVAR. */
function Deco() {
  const { ow, segs, wall, dome, lapis, lapisHi, lapisLo } = RING;
  const kOut = 50, rIn = kOut - ow, step = 360 / segs;
  /**
   * 🔑 FÁZA — PREČO SA CELÝ PÁS TOČÍ O POL DIELU (24. 9. 2026).
   *
   * Dosiaľ začínal prvý kameň NA 12. hodine a jeho stred bol o pol dielu vedľa
   * (8,2°). Celá obruč tým stála mimo osi: dole vyšla rytina 8° od stredu a pri
   * pohľade to bolo „nakoso". `-step/2` posúva pás tak, že
   *   · stred KAMEŇA sedí presne hore (0°),
   *   · stred ZLATÉHO MEDZIPOLIA presne dole (11 × 16,36° = 180,0°),
   * takže spodná rytina je kolmá a v ose, a obruč je zrkadlovo súmerná podľa
   * svislej osi. (Lesk a iskra súmerné nie sú — svetlo má jeden smer, `LIGHT`.)
   */
  const phase = -step / 2;
  /** Kameň leží POD hranou lemov, inak by priehradka splynula s lemom. */
  const inset = 1.15;
  const nodes: JSX.Element[] = [];

  for (let i = 0; i < segs; i += 2) {
    const a0 = i * step + phase, a1 = a0 + step, mid = (a0 + a1) / 2;
    const L = lit(mid);
    const d = seg(a0 + wall / 2, a1 - wall / 2, kOut - inset, rIn + inset);
    const band = (ow - 2 * inset) * 0.42;

    nodes.push(<path key={`s${i}`} d={d} fill={lapis} />);
    nodes.push(
      <path
        key={`hi${i}`}
        d={seg(a0 + wall / 2, a1 - wall / 2, kOut - inset, kOut - inset - band)}
        fill={lapisHi}
        opacity={(0.18 + 0.55 * L) * dome}
      />,
    );
    nodes.push(
      <path
        key={`lo${i}`}
        d={seg(a0 + wall / 2, a1 - wall / 2, rIn + inset + band, rIn + inset)}
        fill={lapisLo}
        opacity={(0.55 - 0.22 * L) * dome}
      />,
    );
    nodes.push(
      <path key={`w${i}`} d={d} fill="none" stroke="url(#fmWall)" strokeWidth={wall} opacity={0.55 + 0.45 * L} />,
    );
    const sp = P(mid - step * 0.22, kOut - inset - (ow - 2 * inset) * 0.26);
    nodes.push(
      <ellipse
        key={`sp${i}`}
        cx={sp[0]}
        cy={sp[1]}
        rx={0.55 * dome}
        ry={0.34 * dome}
        transform={`rotate(${mid} 50 50)`}
        fill="#FFFFFF"
        opacity={0.1 + 0.3 * L}
      />,
    );
  }

  // Rytina v zlatých medzipoliach — dve čiary vedľa seba (tmavá rytina + jej lesklá hrana).
  for (let i = 1; i < segs; i += 2) {
    const mid = i * step + step / 2 + phase;
    const p1 = P(mid, kOut - 1.8), p2 = P(mid, rIn + 1.8);
    nodes.push(
      <line key={`r${i}`} x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
        stroke="rgba(72,44,4,.55)" strokeWidth={0.5} strokeLinecap="round" />,
    );
    nodes.push(
      <line key={`rh${i}`} x1={p1[0] + 0.35} y1={p1[1]} x2={p2[0] + 0.35} y2={p2[1]}
        stroke="rgba(255,244,205,.6)" strokeWidth={0.35} strokeLinecap="round" />,
    );
  }

  return (
    <svg className="fm-deco" viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <linearGradient id="fmWall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCF0C2" />
          <stop offset="55%" stopColor="#D8B052" />
          <stop offset="100%" stopColor="#8A6318" />
        </linearGradient>
        <linearGradient id="fmRail" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FFF7DA" />
          <stop offset="50%" stopColor="#C79A35" />
          <stop offset="100%" stopColor="#7A5613" />
        </linearGradient>
      </defs>
      {/* Lemy kreslíme PRVÉ, kamene ich prekryjú na svojich miestach. */}
      <circle cx={50} cy={50} r={kOut - 0.55} fill="none" stroke="url(#fmRail)" strokeWidth={1.1} />
      <circle cx={50} cy={50} r={rIn + 0.55} fill="none" stroke="url(#fmRail)" strokeWidth={1.1} />
      {nodes}
    </svg>
  );
}

type Props = {
  /** Adresa fotky (kruh je v súbore orezaný na pixel — `hekthorFaces.ts`). */
  src: string;
  /** Priemer aj s obručou, v px. */
  size?: number;
  alt?: string;
  className?: string;
};

/**
 * Priemer medailónu v páse „Hektor sa pýta" (`.hf-speak`) — **na telefóne väčší**.
 *
 * Matej 24. 9. 2026 nad obrazovkou PATRÓN: *„na mobile môžme zväčšiť prvý blok aj
 * foto aj písmo"*. Na PC stojí pás vedľa širokej dosky a 80 px v ňom sedí; na
 * telefóne je pás cez celú šírku a tá istá tvár v ňom pôsobí ako ikonka.
 *
 * 🔴 **NIE JE TO STUPŇOVANIE PODĽA VÝŠKY OKNA** (to Matej 24. 9. ráno zamietol:
 *    *„nič sa tu nemení veľkosťou"*). Sú to DVE polohy podľa ŠÍRKY — mobil a PC —
 *    a obe sú pevné. 104 px je veľkosť z kroku SVORKA, ktorú si Matej vybral,
 *    nie nové číslo.
 * ⚠️ Berú si ho VŠETKY obrazovky s týmto pásom (podstata aj patrón). Dva susedné
 *    kroky s rôzne veľkým Hektorom vyzerajú ako dva návrhy, nie ako jeden vstup.
 * ⚠️ Rozmer je inline `style` na komponente, takže sa z hárku prepísať NEDÁ —
 *    preto hook, a nie `@media`.
 */
export function useSpeakMedal(): number {
  const [box, setBox] = useState(() => (typeof window === 'undefined'
    ? { w: 1024, h: 768 }
    : { w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setBox({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  // ⚠️ VÝŠKA JE PODMIENKA, NIE STUPNICA. Sú stále len DVE polohy (104 a 80);
  //    krátke okno (iPhone SE, 667) len nedostane tú väčšiu, lebo PODSTATA sa
  //    doň už dnes nezmestí a zväčšený Hektor by jej pretečenie prehĺbil.
  //    Premerané 24. 9.: PODSTATA na 375×667 preteká aj s 80 px medailónom.
  return box.w < 560 && box.h >= 700 ? 104 : 80;
}

export function FlowMedallion({ src, size = 132, alt = 'HEKTHOR', className }: Props) {
  const rim = Math.max(4, Math.round((RING.ow / 100) * size));
  return (
    <span className={`fm${className ? ` ${className}` : ''}`} style={{ width: size, height: size }}>
      <span className="fm-ring" style={{ background: goldRing(RING.light) }} />
      <Deco />
      <span className="fm-bevel" />
      <span className="fm-gloss" />
      <span className="fm-face" style={{ inset: rim }}>
        {/* ⚠️ `fm-img` NIE JE ozdoba — je to ŠTÍT. `index.css` od 26. 6. 2026
            zmenšuje na nízkych oknách KAŽDÝ `img[alt="HEKTHOR"]` v `.dark-bg`
            (`clamp(56px, 11vh, 100px)`) a to pravidlo je silnejšie než
            `.fm-face img`: fotka v medailóne sa preto na okne vysokom 724 px
            scvrkla na 80 px a v kruhu ostal ŠTVOREC na modrom podklade.
            Pravidlo z júna teraz `fm-img` vynecháva. */}
        <img className="fm-img" src={src} alt={alt} />
      </span>
      <span className="fm-well" style={{ inset: rim }} />
    </span>
  );
}

/** Vrstvy medailónu. Vkladá ju obrazovka, ktorá `FlowMedallion` používa.
 *  ⚠️ Poradie vrstiev NIE JE ľubovoľné: kov → kresba → fazeta → lesk → fotka →
 *     zapustenie. Fazeta a lesk musia byť NAD kresbou (osvetľujú aj kamene)
 *     a zapustenie NAD fotkou (je to tieň, ktorý obruč hádže dovnútra). */
export const FLOW_MEDAL_CSS = `
.fm { position: relative; display: block; border-radius: 50%; flex: none; }
.fm-ring {
  position: absolute; inset: 0; border-radius: 50%;
  box-shadow: 0 10px 26px -6px rgba(0,0,0,.55), 0 3px 0 -1px rgba(70,46,12,.55),
              inset 0 0 0 1px rgba(255,240,200,.35);
}
.fm-deco { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
/* Fazeta — vypuklý kov: svetlo zhora, tieň zdola po celom obvode. */
.fm-bevel {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: linear-gradient(170deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 34%,
              rgba(0,0,0,0) 62%, rgba(40,22,0,.45) 100%);
  mix-blend-mode: soft-light;
}
.fm-bevel::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  box-shadow: inset 0 2px 2px rgba(255,248,222,.85), inset 0 -2px 3px rgba(52,30,2,.6);
}
/* Lesk — úzky svetelný pás cez ľavý horný kvadrant a teplý dosvit zospodu. */
.fm-gloss { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; overflow: hidden; }
.fm-gloss::before {
  content: ''; position: absolute; left: -18%; top: -34%; width: 78%; height: 120%;
  transform: rotate(24deg); filter: blur(3px);
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.52) 46%, rgba(255,255,255,0) 100%);
}
.fm-gloss::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  box-shadow: inset 0 -6px 12px -4px rgba(255,226,150,.65);
}
.fm-face {
  position: absolute; border-radius: 50%; overflow: hidden; background: ${RING.lapis};
}
.fm-face img.fm-img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* Zapustenie — tieň, ktorý obruč hádže DO stredu. Bez neho fotka leží NA obruči. */
.fm-well {
  position: absolute; border-radius: 50%; pointer-events: none;
  box-shadow: inset 0 5px 10px rgba(0,0,0,.62), inset 0 -2px 6px rgba(0,0,0,.35),
              0 0 0 1px rgba(255,240,200,.30);
}
`;
