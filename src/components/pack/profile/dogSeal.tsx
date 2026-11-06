// PEČAŤ PSA — os DOGYPŤAN (LOCK 6. 11. 2026, nákres `plany/nakresy/pecat-odznaky-2026-11-06/`).
// Matej: *„odznak dostane PES, aj zakladateľský“* · *„dajme 11 [vĺn], ale s našou brand packou“* · v3 *„zatiaľ ok“*.
// Stojí hneď za menom psa ako IG verified. Úroveň = farba, prémiovosť (tieň, lesk, iskra) rastie s úrovňou.
//   VERIACI €0 = prerušovaný obrys, VIDÍ HO LEN MAJITEĽ (ponuka podpory) · AKOLYTA papyrus · KŇAZ lapis ·
//   VEZÍR zlato · ZAKLADATEĽ čierna + zlato-oranžová žiara (mimo osi, navždy).
// SVG je presný prevod generátora z nákresu — tvar a packa sa NEKRESLIA nanovo.
import { useId, type CSSProperties } from 'react';

export type SealTier = 'veriaci' | 'akolyta' | 'knaz' | 'vezir' | 'zakladatel';

type T = { p: number; g: string[] | null; stroke: string; paw: string; ring?: boolean; glow?: string };
const TIERS: Record<SealTier, T> = {
  veriaci:    { p: 0, g: null, stroke: '#7a5a2a', paw: 'rgba(31,26,14,.35)' },
  akolyta:    { p: 1, g: ['#FFFBF0', '#F2E5C7', '#D9C59C'], stroke: '#7a5a2a', paw: '#7a5a2a' },
  knaz:       { p: 2, g: ['#2A4CA8', '#16307A', '#0A1A4A'], stroke: '#C99A3F', paw: '#E2BC6A' },
  vezir:      { p: 3, g: ['#F6D98E', '#C99A3F', '#8E6420'], stroke: '#7A5418', paw: '#2a1608' },
  zakladatel: { p: 4, g: ['#2a2a2a', '#0b0b0b', '#000'], stroke: 'url(#O)', paw: 'url(#O)', ring: true, glow: '#F0A81E' },
};

/** Kto akú pečať nesie. 🔴 DNES: zaplatený pes = ZAKLADATEĽ (88 psov, ktorí platili €11 — „zakladatelia navždy“),
 *  ostatní VERIACI. AKOLYTA/KŇAZ/VEZÍR prídu s dobrovoľným vstupným (tabuľka úrovne, Stripe + Apple/Google).
 *  ⚠️ Keď sa vypne predaj €11, zakladateľ sa musí zamknúť dátumom — inak by ďalšia platba vyrobila zakladateľa. */
export function sealOf(dog: { payment_status?: string | null } | null | undefined): SealTier {
  return dog?.payment_status === 'paid' ? 'zakladatel' : 'veriaci';
}

/** Pes, ktorého appka ukazuje v svorke, na profile, cudzom profile a SNIFFERi, je dnes VŽDY zaplatený —
 *  `usePackUser`, `get_member_profiles` aj `sniffer_card` filtrujú `payment_status='paid'`. Preto ZAKLADATEĽ.
 *  🔴 Keď pribudnú free psy alebo vstupné, toto sa nahradí skutočnou úrovňou psa z DB. */
export const SEAL_OF_LISTED_DOG: SealTier = 'zakladatel';

/** PEČAŤ PRI MENE ČLOVEKA (Matej 6. 11. 2026: „a)“) — človek nesie pečať svojho NAJVYŠŠIEHO psa, tak ako nesie
 *  jeho číslo. Pečať ostáva vlastnosťou psa. Má psa v appke (= číslo člena) → pečať psa; inak VERIACI (len sám sebe). */
export const sealOfHuman = (hasDog: boolean): SealTier => (hasDog ? SEAL_OF_LISTED_DOG : 'veriaci');

/** Meno úrovne pre aria-label / tooltip. */
export const sealLabel = (tier: SealTier, tx: (k: string, f: string) => string) =>
  tx(`pack.seal.${tier}`, { veriaci: 'Believer', akolyta: 'Acolyte', knaz: 'Priest', vezir: 'Vizier', zakladatel: 'Founder' }[tier]);

function wave(n: number, a: number, R: number) {
  let d = '';
  for (let i = 0; i <= 360; i++) {
    const t = (i / 360) * 2 * Math.PI, r = R + a * Math.cos(n * t);
    d += (i ? 'L' : 'M') + (50 + r * Math.sin(t)).toFixed(2) + ' ' + (50 - r * Math.cos(t)).toFixed(2);
  }
  return d + 'Z';
}
const D11 = wave(11, 3.6, 40);
const D11_IN = wave(11, 2.6, 33);
/** Brand packa `vstupy/vizualna-identita/Icons hand drawn/Hekypaw full.svg` (10 ciest, evenodd). */
const PAW = '<path d="M924.388,9.167c40.92,-13.488 111.383,-11.188 141.975,4.604c78.82,40.854 135.729,127.7 151.845,231.779c7.763,49.871 3.621,145.463 -8.42,195.204c-12.038,49.538 -45.463,114.867 -76.58,149.542c-94.279,105.262 -230.991,112.237 -330.862,16.971c-46.25,-44.146 -80,-118.684 -91.054,-201.45c-9.738,-72.371 8.42,-171.779 44.408,-243.359c39.804,-79.212 94.279,-128.754 168.688,-153.291Z"/><path d="M950.571,92.454c-71.446,26.254 -120.725,95.334 -142.829,200.334c-15.659,74.675 -5,149.279 30.066,209.875c46.513,80.395 148.884,95.133 219.213,31.579c27.042,-24.409 57.7,-85.463 68.292,-136.054c11.645,-55.463 7.5,-154.938 -8.421,-200.4c-32.042,-91.45 -95.2,-131.45 -166.321,-105.334Z"/><path d="M427.338,190.154c73.687,-18.946 161.716,34.609 210.004,127.634c40.396,77.833 50.925,146.779 32.962,215.533c-13.883,53.225 -29.475,79.804 -67.041,114.079c-90.2,82.438 -235.859,42.108 -294.938,-81.646c-74.017,-155.067 -15.067,-341.125 119.013,-375.6Z"/><path d="M433.129,281.471c-42.7,20.725 -69.279,83.821 -65.2,154.675c1.975,34.279 5.859,48.425 22.171,81.45c21.383,43.354 40.333,61.512 77.767,74.737c26.116,9.213 49.012,4.605 75.921,-15.262c21.645,-15.988 41.845,-61.188 44.937,-100.396c5.921,-75.858 -39.017,-172.371 -91.321,-196.125c-27.037,-12.3 -37.433,-12.104 -64.275,0.921Z"/><path d="M1328.08,494.371c29.542,-6.975 39.146,-6.646 69.542,2.371c57.896,17.237 112.829,93.683 131.779,183.487c24.408,115.529 -30.329,234.217 -129.412,280.663c-25.788,12.108 -37.763,14.346 -75.855,14.279c-38.425,-0.067 -49.675,-2.238 -75.2,-14.738c-57.37,-28.029 -96.645,-86.908 -107.304,-160.791c-4.604,-32.042 -3.95,-46.255 4.079,-84.475c24.013,-114.48 94.805,-200.138 182.371,-220.796Z"/><path d="M1324.07,590.954c-72.963,36.971 -116.646,165.529 -80.463,236.584c41.779,81.908 146.188,65.329 188.359,-29.805c36.975,-83.358 -7.367,-218.687 -71.58,-218.687c-6.975,-0 -23.358,5.329 -36.316,11.908Z"/><path d="M140.754,591.742c90.004,-22.434 197.767,61.712 234.217,182.962c31.708,105.4 -8.225,208.888 -99.146,257.179c-19.146,10.13 -31.517,12.367 -68.554,12.434c-56.975,0.066 -93.425,-15.33 -132.108,-55.859c-32.109,-33.683 -50.53,-69.145 -64.609,-124.408c-13.354,-52.304 -13.421,-70.792 -0.458,-121.517c12.567,-48.946 26.512,-77.37 52.037,-105.591c22.5,-24.938 41.78,-35.988 78.621,-45.2Z"/><path d="M140.558,684.638c-60.858,37.108 -66.516,162.504 -10.329,228.095c48.946,57.238 121.25,51.121 151.25,-12.696c10.267,-21.841 11.713,-31.975 9.738,-68.291c-2.763,-49.079 -18.946,-87.567 -51.317,-121.517c-34.737,-36.512 -67.567,-45 -99.342,-25.591Z"/><path d="M709.846,731.154c46.05,-9.475 71.512,-10.133 112.042,-2.896c95.133,16.975 147.7,51.842 228.95,151.779c27.962,34.475 51.975,57.367 80.791,77.171c132.5,90.988 203.754,210.334 204.413,342.246c0.658,142.5 -85.725,236.054 -233.163,252.633c-55.329,6.184 -86.121,0.134 -162.241,-31.975c-33.946,-14.341 -74.475,-28.812 -90.134,-32.17c-59.475,-12.763 -127.766,3.42 -229.412,54.345c-95,47.5 -165.988,58.159 -240.4,36.05c-74.342,-22.104 -108.817,-48.75 -138.092,-106.774c-52.042,-103.23 -43.95,-213.034 23.55,-318.167c15.792,-24.538 51.517,-65.396 93.029,-106.317c50.921,-50.262 77.175,-81.383 107.438,-127.437c72.7,-110.463 148.225,-169.017 243.229,-188.488Z"/><path d="M732.279,816.021c-73.816,17.896 -128.358,59.541 -177.437,135.462c-51.713,80.071 -78.621,113.292 -129.609,160.004c-102.437,93.817 -141.187,189.084 -114.016,280.663c9.541,31.908 37.371,65.662 66.45,80.529c10.791,5.463 34.871,12.763 53.554,16.25c44.737,8.158 80.592,-0.854 169.608,-42.696c79.542,-37.371 124.542,-51.779 176.713,-56.516c52.041,-4.738 86.712,3.025 176.979,39.341c68.75,27.634 77.7,29.938 116.975,30.004c103.554,0.13 165.133,-55.395 171.712,-154.808c6.384,-96.779 -46.383,-194.017 -139.475,-257.108c-53.554,-36.25 -84.279,-64.871 -119.87,-111.646c-35.263,-46.317 -77.7,-86.517 -107.371,-101.65c-22.5,-11.513 -79.934,-26.183 -100.134,-25.592c-7.366,0.2 -27.17,3.684 -44.079,7.763Z"/>';

function svg(t: T, id: string, dark: boolean) {
  const shadow = `<feDropShadow in="SourceGraphic" dx="0" dy="${[0, 1.5, 2.5, 3.5, 4][t.p]}" stdDeviation="${[0, 1.5, 2.5, 3, 3.5][t.p]}" flood-color="#000" flood-opacity="${[0, .25, .4, .5, .6][t.p]}" result="sh"/>`;
  const glow = t.glow ? `<feGaussianBlur in="SourceAlpha" stdDeviation="5"/><feFlood flood-color="${t.glow}" flood-opacity=".75"/><feComposite operator="in" in2="SourceAlpha"/><feGaussianBlur stdDeviation="4" result="gw"/>` : '';
  const defs = `<defs>
<radialGradient id="b${id}" cx="38%" cy="30%" r="80%">${t.g ? t.g.map((c, i) => `<stop offset="${[0, .55, 1][i]}" stop-color="${c}"/>`).join('') : ''}</radialGradient>
<linearGradient id="O${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD65A"/><stop offset=".5" stop-color="#F5C73D"/><stop offset="1" stop-color="#E69E1A"/></linearGradient>
<linearGradient id="gl${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="s${id}" x="-40%" y="-40%" width="180%" height="180%">${glow}${shadow}${t.glow ? '<feMerge><feMergeNode in="gw"/><feMergeNode in="sh"/></feMerge>' : ''}</filter>
<filter id="e${id}"><feDropShadow dx="0" dy="-1.2" stdDeviation=".4" flood-color="#fff" flood-opacity="${t.p >= 2 ? .35 : .2}"/><feDropShadow dx="0" dy="1.6" stdDeviation=".6" flood-color="#000" flood-opacity=".45"/></filter>
<clipPath id="c${id}"><path d="${D11}"/></clipPath></defs>`;
  const O = (c: string) => c.replace('url(#O)', `url(#O${id})`);
  const base = t.p === 0
    ? `<path d="${D11}" fill="none" stroke="${dark ? 'rgba(245,240,228,.55)' : t.stroke}" stroke-width="4" stroke-dasharray="7 6" stroke-linejoin="round" opacity=".7"/>`
    : `<g filter="url(#s${id})"><path d="${D11}" fill="url(#b${id})" stroke="${O(t.stroke)}" stroke-width="${t.p >= 3 ? 3.5 : 3}" stroke-linejoin="round"/></g>`
      + (t.p >= 2 ? `<path d="${D11_IN}" fill="none" stroke="${t.p === 2 ? '#C99A3F' : 'rgba(255,255,255,.45)'}" stroke-width="1.2" opacity=".8"/>` : '')
      + (t.ring ? `<circle cx="50" cy="50" r="30" fill="none" stroke="url(#O${id})" stroke-width="2.5"/>` : '')
      + (t.p >= 2 ? `<g clip-path="url(#c${id})"><ellipse cx="44" cy="22" rx="34" ry="18" fill="url(#gl${id})" opacity="${[0, 0, .35, .55, .3][t.p]}"/></g>` : '')
      + (t.p >= 3 ? '<path d="M76 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" opacity=".9"/>' : '');
  const pawFill = dark && t.p === 0 ? 'rgba(245,240,228,.4)' : O(t.paw);
  const paw = `<svg x="29" y="29" width="42" height="42" viewBox="0 0 1538 1592" fill="${pawFill}" fill-rule="evenodd" ${t.p >= 1 ? `filter="url(#e${id})"` : ''} overflow="visible">${PAW}</svg>`;
  return `<svg width="100%" height="100%" viewBox="0 0 100 100" overflow="visible" aria-hidden="true">${defs}${base}${paw}</svg>`;
}

/** Pečať za menom psa. `own` = môj pes — VERIACI (prerušovaný) sa ukáže len majiteľovi, cudzím nič.
 *  `size` = px alebo em (predvolene 0.95em = rastie s písmom mena, ako IG verified). `dark` = tmavý podklad (prerušovaný obrys svetlý). */
export function DogSeal({ tier, size = '0.95em', own = false, dark = false, label, style }: {
  tier: SealTier; size?: number | string; own?: boolean; dark?: boolean; label?: string; style?: CSSProperties;
}) {
  const id = useId().replace(/:/g, '');
  if (tier === 'veriaci' && !own) return null;
  return (
    <span className="dog-seal" role="img" aria-label={label ?? tier}
      style={{ display: 'inline-block', width: size, height: size, flex: 'none', verticalAlign: '-0.14em', marginLeft: '0.28em', lineHeight: 0, ...style }}
      // Statický SVG z vlastných konštánt (žiadny vstup od používateľa).
      dangerouslySetInnerHTML={{ __html: svg(TIERS[tier], id, dark) }} />
  );
}
