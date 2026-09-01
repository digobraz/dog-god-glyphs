// ════════════════════════════════════════════════════════════════════════════
// MEDAILÓN V HORNOM NAVE (/onepage)
// ────────────────────────────────────────────────────────────────────────────
// Matej 27. 8. 2026: *„do stredu dáme kruh lemovaný na štýl celého bloku a možno
// lemovaný zlato modrou farbou ako egyptský faraón a vnútri bude logo.. to bude
// vystúpené nad navom"* + predloha (Horovo oko: zdobená obruč s rytinami a modrými
// kabošonmi) a *„taký dizajn ako má hektor v hero flow = striedanie farieb po obvode"*.
//
// 🔑 LADÍ SA V `plany/nakres-nav-medailon-2026-08-27.html`, NIE TU.
//    Nákres má rovnaké kľúče ako `MEDAL` nižšie a tlačidlo „Skopíruj nastavenia"
//    vypľuje JSON — prenos je prepis jedného objektu, nie prekresľovanie kódu.
//
// ⚠️ DVE PASCE GEOMETRIE (obe stáli kolo ladenia v nákrese, nezopakuj ich):
//    1. `<svg>` je NAHRADENÝ prvok — z `position:absolute; inset:…` si rozmer
//       NEVEZME, drží default 300×150 a obsah zväčší. Šírka/výška musia byť napísané.
//    2. Plátno absolútneho potomka = PADDING-box rodiča. Lem medailónu je `padding`
//       (nie `border`), takže `100%` JE priemer aj s lemom — polomer 50 vo viewBoxe
//       je hrana obruče. Záporný inset „aby vrstva pokryla lem" ozdoby vyhodí von.
// ════════════════════════════════════════════════════════════════════════════
import { NAV_GRAIN } from '@/components/pack/navGoldSkin';
import logoSilhouette from '@/assets/dogypt-logo-mobile.png';

/** Celé logo (silueta + kartuša DOGYPT) leží v `public`, netreba import. */
const LOGO_FULL_BLACK = '/images/dogypt-logo-black-i.png';

type Ring = 'smooth' | 'alt' | 'engraved' | 'hiero' | 'beads';
type Face = 'black' | 'plate' | 'lapis' | 'gold' | 'clear';
/** Zhodné s prepínačom „Farba loga" v nákrese (kľúč `tint`). */
type Tint = 'none' | 'gold' | 'dark' | 'lapis' | 'lapisDeep' | 'white';

type MedalSpec = {
  d: number; lift: number; slot: number; ow: number; iw: number;
  blue: string; face: Face; ring: Ring;
  /** Natočenie leštenia zlata (v nákrese „uhol svetla na kove"). */
  metalAngle: number;
  logo: 'silhouette' | 'fullBlack';
  segs: number; deco: number; rot: number;
  gems: number; gemSize: number; gemRot: number; gemShape: 'almond' | 'round' | 'drop';
  logoW: number; logoY: number; logoTint: Tint;
  gloss: number; glossX: number; glossY: number; shadow: number; grain: number;
};

/** Jediné miesto na ladenie vzhľadu. Kľúče sú zhodné s exportom z nákresu.
 *  ⚠️ Zámerne BEZ `as const` — inak by z čísel boli literálové typy a porovnania
 *  ako `gems === 2` by TypeScript hlásil ako nemožné. */
export const MEDAL: MedalSpec = {
  // ⚠️ HODNOTY SÚ MATEJOV VÝBER Z NÁKRESU (27. 8. 2026, „variant 5" + lapisové logo).
  //    Needituj ich odhadom — nalaď v nákrese a prenes celý objekt.
  d: 100,
  lift: 28,
  slot: 112,
  ow: 8,
  iw: 5,
  blue: '#0A1A4A',
  face: 'plate',
  ring: 'alt',
  metalAngle: 59,
  logo: 'fullBlack',
  segs: 22,
  deco: 0.95,
  rot: 0,
  gems: 0,
  gemSize: 9,
  gemRot: 0,
  gemShape: 'drop',
  // ⚠️ `logoW` NIE JE VEC VKUSU — je odmeraná. Kartuša DOGYPT má rohy v najväčšej
  //    vzdialenosti od stredu (najzazší bod PNG = ľavý dolný roh, r = 0.694 × šírky
  //    obrázka), takže pri lw 71 sa ink dotýkal obruče s vôľou 0,6 px. Pri lw 67 +
  //    ly −2 je vôľa 4,1 px. Prepočet: `r_ink = 0.694 × (74 × lw/100)`, polomer
  //    vnútra = (d − 2·ow − 2·iw)/2 = 37. Meň ow/iw alebo d → prepočítaj aj toto.
  logoW: 67,
  logoY: -2,
  logoTint: 'lapisDeep',
  gloss: 0.6,
  glossX: 34,
  glossY: 18,
  shadow: 0.6,
  grain: 0.18,
};

const goldRing = (angle: number) =>
  `conic-gradient(from ${angle}deg,#FCF0C2,#EDCE7C 8%,#D8B052 22%,#AA8129 34%,#C09636 46%,#F7E4A8 58%,#D8B052 72%,#A97F27 86%,#FCF0C2 100%)`;

const FACE_BG: Record<Face, string> = {
  black: 'radial-gradient(72% 72% at 34% 24%, #241a10, #0c0906 70%)',
  plate: 'linear-gradient(180deg,#F1DFB6,#D6BC85)',
  lapis: 'linear-gradient(180deg,#16307A,#0A1A4A)',
  gold: 'linear-gradient(180deg,#F4DC97,#C99A33)',
  /* Priehľadné vnútro — film pod navom presvitá cez medailón. */
  clear: 'transparent',
};

/** Zafarbenie čierneho loga — tie isté reťazce ako `TINT` v nákrese.
 *  ⚠️ Filtre sú DOPOČÍTANÉ na cieľovú farbu, nie odhadnuté po oku: `lapis` trafí
 *  presne rgb(22,48,122) = `LAPIS.edge`. Pri zmene brandovej farby ich prepočítaj,
 *  ručná úprava jedného čísla v reťazci pošle odtieň úplne inam. */
const LOGO_TINT: Record<Tint, string | undefined> = {
  none: undefined,
  gold: 'brightness(0) saturate(100%) invert(78%) sepia(38%) saturate(660%) hue-rotate(357deg) brightness(94%) contrast(90%)',
  dark: 'brightness(0) saturate(100%) invert(9%) sepia(38%) saturate(1200%) hue-rotate(346deg) brightness(96%) contrast(95%)',
  lapis: 'brightness(0) saturate(100%) invert(41%) sepia(94%) saturate(708%) hue-rotate(198deg) brightness(48%) contrast(123%)',
  lapisDeep: 'brightness(0) saturate(100%) invert(40%) sepia(95%) saturate(541%) hue-rotate(191deg) brightness(32%) contrast(116%)',
  white: 'brightness(0) invert(1)',
};

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, v + amt)));
  return `rgb(${c.join(',')})`;
}

/** Ozdoby obruče. Kreslia sa do SVG, nie conic gradientom — rytiny a kamene
 *  potrebujú TVAR, conic vie len klin. */
function Deco() {
  const m = MEDAL;
  const kOut = 50;
  const owPct = (m.ow / m.d) * 100;
  const rMid = kOut - owPct / 2;
  const gold = '#F3DFA4';
  const deep = 'rgba(58,34,4,.75)';
  const nodes: JSX.Element[] = [];

  if (m.ring === 'alt') {
    const n = Math.max(4, m.segs);
    const step = 360 / n;
    const rIn = kOut - owPct;
    const P = (a: number, r: number) => [
      50 + r * Math.cos(((a - 90) * Math.PI) / 180),
      50 + r * Math.sin(((a - 90) * Math.PI) / 180),
    ];
    for (let i = 0; i < n; i += 2) {
      const a0 = i * step + m.rot;
      const a1 = a0 + step;
      const p1 = P(a0, kOut), p2 = P(a1, kOut), p3 = P(a1, rIn), p4 = P(a0, rIn);
      nodes.push(
        <path
          key={`alt${i}`}
          d={`M${p1} A${kOut} ${kOut} 0 0 1 ${p2} L${p3} A${rIn} ${rIn} 0 0 0 ${p4} Z`}
          fill={m.blue}
          opacity={m.deco}
        />,
      );
    }
  }

  if (m.ring === 'engraved' || m.ring === 'hiero') {
    const n = Math.max(6, m.segs);
    const h = owPct * 0.52;
    const w = owPct * 0.16;
    for (let i = 0; i < n; i++) {
      const a = i * (360 / n) + m.rot;
      const kind = m.ring === 'hiero' ? i % 3 : 0;
      const t = `rotate(${a} 50 50)`;
      if (kind === 0) {
        nodes.push(<rect key={`e${i}`} x={50 - w / 2} y={50 - rMid - h / 2} width={w} height={h} rx={w * 0.3} fill={deep} opacity={m.deco} transform={t} />);
      } else if (kind === 1) {
        nodes.push(<rect key={`e${i}`} x={50 - w * 0.9} y={50 - rMid - w * 0.9} width={w * 1.8} height={w * 1.8} fill={deep} opacity={m.deco} transform={t} />);
      } else {
        nodes.push(<circle key={`e${i}`} cx={50} cy={50 - rMid} r={w * 0.75} fill={deep} opacity={m.deco} transform={t} />);
      }
    }
    if (m.ring === 'hiero') {
      // Dva hladké prstence, medzi ktorými pás znakov leží — bez nich to vyzerá
      // ako poškriabaný kov, nie ako ozdoba.
      nodes.push(<circle key="hr1" cx={50} cy={50} r={kOut - owPct * 0.06} fill="none" stroke={gold} strokeWidth={owPct * 0.1} opacity={m.deco} />);
      nodes.push(<circle key="hr2" cx={50} cy={50} r={kOut - owPct * 0.94} fill="none" stroke={gold} strokeWidth={owPct * 0.1} opacity={m.deco} />);
    }
  }

  if (m.ring === 'beads') {
    const n = Math.max(6, m.segs);
    const r = owPct * 0.34;
    for (let i = 0; i < n; i++) {
      const a = i * (360 / n) + m.rot;
      const t = `rotate(${a} 50 50)`;
      nodes.push(<circle key={`b${i}`} cx={50} cy={50 - rMid} r={r} fill={gold} opacity={m.deco} transform={t} />);
      nodes.push(<circle key={`bs${i}`} cx={50} cy={50 - rMid + r * 0.28} r={r * 0.62} fill={deep} opacity={m.deco * 0.5} transform={t} />);
    }
  }

  if (m.gems > 0) {
    const g = m.gemSize;
    const shapes: Record<string, string | null> = {
      almond: `M0,${-g} C${g * 0.62},${-g * 0.34} ${g * 0.62},${g * 0.34} 0,${g} C${-g * 0.62},${g * 0.34} ${-g * 0.62},${-g * 0.34} 0,${-g} Z`,
      round: null,
      drop: `M0,${-g} C${g * 0.75},${-g * 0.3} ${g * 0.6},${g * 0.9} 0,${g} C${-g * 0.6},${g * 0.9} ${-g * 0.75},${-g * 0.3} 0,${-g} Z`,
    };
    const shape = shapes[m.gemShape];
    for (let i = 0; i < m.gems; i++) {
      const a = i * (360 / m.gems) + m.gemRot + (m.gems === 2 ? 90 : 0);
      nodes.push(
        <g key={`g${i}`} transform={`rotate(${a} 50 50) translate(50 ${50 - kOut})`}>
          {shape ? (
            <path d={shape} fill="url(#navMedalGem)" stroke={gold} strokeWidth={g * 0.22} />
          ) : (
            <circle r={g * 0.8} fill="url(#navMedalGem)" stroke={gold} strokeWidth={g * 0.22} />
          )}
        </g>,
      );
    }
  }

  return (
    <svg className="nav-medal-deco" viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <radialGradient id="navMedalGem" cx="35%" cy="28%">
          <stop offset="0%" stopColor={shade(MEDAL.blue, 90)} />
          <stop offset="55%" stopColor={MEDAL.blue} />
          <stop offset="100%" stopColor={shade(MEDAL.blue, -45)} />
        </radialGradient>
      </defs>
      {nodes}
    </svg>
  );
}

export default function NavMedallion({ onClick }: { onClick?: () => void }) {
  const m = MEDAL;
  return (
    <a
      href="/"
      className="nav-medal"
      aria-label="DOGYPT"
      onClick={(e) => {
        if (!onClick) return;
        e.preventDefault();
        onClick();
      }}
    >
      <span className="nav-medal-rim">
        <span className="nav-medal-face">
          <img
            src={m.logo === 'fullBlack' ? LOGO_FULL_BLACK : logoSilhouette}
            alt=""
            style={{
              width: `${m.logoW}%`,
              transform: m.logoY ? `translateY(${m.logoY}px)` : undefined,
              filter: LOGO_TINT[m.logoTint],
            }}
          />
          <span className="nav-medal-grain" />
          <span className="nav-medal-gloss" />
        </span>
      </span>
      <Deco />
    </a>
  );
}

/** CSS medailónu. Vkladá ho `OnePage` do svojho `<style>` — celý nav tam žije
 *  v jednom literáli a druhá cesta (LabShell) sa s ním nikdy nemountuje naraz. */
export const NAV_MEDALLION_CSS = `
/* Medailón visí V MEDZERE (trieda nav-medal-slot), nie v lište ako celku: stred lišty
   je stredom medzery len vtedy, keď sú obe strany rovnako široké, a to sa mení
   s jazykom. Zvisle je centrovaný na lištu, takže vystupuje rovnako hore aj dole. */
/* ⚠️ DVOJTRIEDNY SELEKTOR JE NUTNOSŤ, NIE ŠTÝL. Medailón je <a> a odkedy visí
   v medzere, stojí VNÚTRI .main-nav — kde platí pravidlo
   ".main-nav a, .main-nav button { background: none; border: none; padding: 0 }".
   To mu zmazalo zlatú obruč aj lem (zostal len modrý vnútrajšok) a vyzeralo to ako
   chyba farieb, nie ako prebitý selektor. Tú istú daň platí .nav-login v OnePage.tsx. */
.nav-medal.nav-medal {
  position: absolute; left: 50%; top: 50%; z-index: 9;
  width: ${MEDAL.d}px; height: ${MEDAL.d}px;
  transform: translate(-50%, -50%) scale(var(--medal-k, 1));
  border-radius: 50%;
  padding: ${MEDAL.ow}px;
  background: ${goldRing(MEDAL.metalAngle)};
  box-shadow:
    0 ${(6 + MEDAL.shadow * 14).toFixed(0)}px ${(14 + MEDAL.shadow * 30).toFixed(0)}px -6px rgba(0,0,0,${(MEDAL.shadow * 0.95).toFixed(2)}),
    0 3px 0 -1px rgba(70,46,12,${(MEDAL.shadow * 0.6).toFixed(2)}),
    inset 0 1.5px 0 rgba(255,250,228,0.9),
    inset 0 -2px 3px rgba(84,56,14,0.55);
}
.nav-medal.nav-medal:hover { opacity: 1; }
.nav-medal-rim {
  display: block; width: 100%; height: 100%; border-radius: 50%;
  padding: ${MEDAL.iw}px;
  background: linear-gradient(180deg, ${shade(MEDAL.blue, 26)}, ${MEDAL.blue} 45%, ${shade(MEDAL.blue, -30)});
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.35);
}
.nav-medal-face {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
  background: ${FACE_BG[MEDAL.face]};
  box-shadow:
    inset 0 2px 4px rgba(255,250,228,0.55),
    inset 0 -8px 14px -6px rgba(0,0,0,0.65),
    inset 0 0 0 1px rgba(0,0,0,0.4);
}
.nav-medal-face img { display: block; height: auto; }
.nav-medal-gloss {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  mix-blend-mode: screen;
  background:
    radial-gradient(60% 45% at ${MEDAL.glossX}% ${MEDAL.glossY}%, rgba(255,255,255,${MEDAL.gloss}), transparent 70%),
    linear-gradient(150deg, rgba(255,255,255,${(MEDAL.gloss * 0.35).toFixed(2)}) 0%, transparent 42%);
}
.nav-medal-grain {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: ${NAV_GRAIN}; background-size: 120px 120px;
  mix-blend-mode: multiply; opacity: ${MEDAL.grain};
}
/* ⚠️ Rozmer napísaný výslovne — SVG si ho z insetov nevezme (viď hlavička súboru). */
.nav-medal-deco {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50%; overflow: visible; pointer-events: none; z-index: 3;
}
/* Miesto, ktoré si medailón drží v lište. Škáluje sa spolu s ním. */
.nav-medal-slot {
  position: relative; align-self: stretch; flex-shrink: 0;
  width: calc(${MEDAL.slot}px * var(--medal-k, 1));
}
`;
