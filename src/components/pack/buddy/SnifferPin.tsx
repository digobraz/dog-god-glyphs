// SNIFFER — MÔJ RAJÓN ako PIN (kolo 2, Matej 25. 9. 2026: „vybrať obrys krajiny, a umiestniť
// pin na mapu"). Nahrádza výber krajov (`SnifferAreas`) — okolie sa odteraz ráta v km od pinu.
// Nákres: plany/nakres-sniffer-kolo2-2026-09-25.html, obrazovka D.
//
// Kolo 3 (Matej 25. 9. poobede): „zväčši ten target a do stredu daj packu z brandu plnú a možnosť
// zväčšovať plochu targetu a target sa bude dať len na plochu štátu vybraného nie vedľa… a bude
// tam možnosť vybrať inú krajinu (všetky) … bude tam len chip jeden s krajinou".
//   · terč = červené kruhy + plná packa (`/icons/pack/paw-full.svg`) v strede
//   · PLOCHA TERČA = `radius_km` z nastavení — ten istý polomer, ktorým server reže balíček
//     (`20260929_sniffer_kolo2.sql`), takže kruh na mape JE okolie, nie ozdoba
//   · pin mimo obrysu krajiny sa NEZAPÍŠE (bod v mnohouholníku)
//   · krajiny = všetky: podrobný obrys z `COUNTRY_BORDERS` (kde máme výlety), inak hrubý
//     `WORLD_OUTLINE` (Natural Earth 1:110m) — ten sa načíta až keď treba (138 KB)
//
// 🔴 PIN JE SÚKROMNÝ. Ukladá sa zaokrúhlený na 2 desatinné miesta (~1 km) do `human.pin`
//    a server z neho vydáva len vzdialenosť (`distance_km`). `SnifferCountryOutline` (cudzí
//    profil) preto kreslí LEN obrys krajiny, nikdy bod.
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { COUNTRY_BORDERS } from '@/data/countryBorders';
import { saveHuman, type HumanProfile } from '@/components/pack/profile/packProfile';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK } from '@/components/pack/navGoldSkin';
import { countryName, flagUrl } from '@/lib/countryGeo';
import { useLang } from '@/i18n/LanguageContext';
import { SNIFFER_HEART } from './SnifferLogo';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
type Pin = NonNullable<HumanProfile['pin']>;
type Rings = [number, number][][];

const W = 300;
/** Farba terča — tá istá červená ako srdce v logu SNIFFERa (nákres kola 2, token C9 26. 9.). */
const TARGET = SNIFFER_HEART;
/** Zastávky posuvníka plochy terča — OD 50 DO 100 km (Matej 25. 9.: „nesmie ísť menej než xy km,
 *  teraz ide aj na 5 km, síce sa veľkosť nemení, ale vyzerá to blbo = začína sa od 50 km do 100 km"). */
export const RADIUS_STOPS: Array<number | null> = [50, 60, 70, 80, 90, 100];

const CSS = `
.spn-map{width:100%;height:auto;display:block;border-radius:${PACK_R.tile}px;background:${T.tileBg};}
.spn-map.is-edit{cursor:crosshair;}
.spn-land{fill:${T.card};stroke:${T.inkStrong};stroke-width:1.2;stroke-linejoin:round;}
.spn-reach{fill:${TARGET};fill-opacity:.12;stroke:${TARGET};stroke-width:1.5;stroke-dasharray:6 4;}
.spn-ctry{position:relative;display:inline-flex;align-items:center;gap:${PACK_SPACE.sm}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;
  font-weight:600;color:${T.inkStrong};border:1px solid ${T.border};border-radius:${PACK_R.pill}px;background:${T.cardSoft};
  padding:${PACK_SPACE.xs}px ${PACK_SPACE.md}px;cursor:pointer;max-width:100%;white-space:nowrap;}
.spn-ctry img{width:${PACK_SPACE.lg}px;height:${PACK_SPACE.md}px;object-fit:cover;}
.spn-ctry select{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;}
.spn-ctry i{width:${PACK_SPACE.sm}px;height:${PACK_SPACE.sm}px;border-right:1.5px solid ${T.inkWarm};border-bottom:1.5px solid ${T.inkWarm};transform:translateY(-25%) rotate(45deg);}
.spn-reachrow{display:flex;align-items:center;gap:${PACK_SPACE.md}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${T.inkDim};}
.spn-reachrow b{flex:0 0 auto;min-width:${PACK_SPACE.xxxl + PACK_SPACE.lg}px;text-align:right;font-weight:600;color:${T.inkStrong};}
.spn-reachrow input{flex:1 1 auto;accent-color:${LAPIS.edge};}
/* C9 — varovanie ide farbou VAROVANIA (PICK_INK.red), nie koralovou logom (tá je SNIFFER, nie chyba). */
.spn-warn{margin:0;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;color:${PICK_INK.red};}
`;

// ── obrysy ────────────────────────────────────────────────────────────────
let world: Record<string, Rings> | null = null;
let worldLoad: Promise<Record<string, Rings>> | null = null;
function loadWorld() {
  worldLoad ??= import('@/data/worldOutline.generated').then((m) => (world = m.WORLD_OUTLINE as Record<string, Rings>));
  return worldLoad;
}

/** Hrubý obrys môže niesť zámorie (Francúzsko + Guyana) — nechaj len prstence pri pevnine,
 *  inak sa krajina zmenší na bodku v rohu mapy. */
function mainland(rings: Rings): Rings {
  if (rings.length < 2) return rings;
  const c = (r: [number, number][]) => [r.reduce((a, p) => a + p[0], 0) / r.length, r.reduce((a, p) => a + p[1], 0) / r.length];
  const big = rings.reduce((a, r) => (r.length > a.length ? r : a));
  const [la, lo] = c(big);
  return rings.filter((r) => { const [a, b] = c(r); return Math.abs(a - la) < 12 && Math.abs(b - lo) < 18; });
}

/** Prstence krajiny: podrobné, keď ich máme, inak svetový obrys (načíta sa raz). */
function useRings(iso: string): Rings | null {
  const detail = COUNTRY_BORDERS[iso] as Rings | undefined;
  const [, bump] = useState(0);
  useEffect(() => { if (!detail && !world) void loadWorld().then(() => bump((n) => n + 1)); }, [detail]);
  if (detail) return detail;
  const w = world?.[iso];
  // D8 (audit 26. 9. 2026) — krajina bez obrysu sa NESMIE nakresliť ako Slovensko (zlé
  // súradnice pri uložení pinu). `null` necháva volajúceho zobraziť prázdny/nabíjajúci stav.
  return w ? mainland(w) : null;
}

/** Zoznam VŠETKÝCH krajín, ktoré vieme nakresliť. */
function useCountries(): string[] {
  const [list, setList] = useState<string[]>(() => Object.keys(world ?? COUNTRY_BORDERS));
  useEffect(() => { void loadWorld().then((w) => setList(Array.from(new Set([...Object.keys(w), ...Object.keys(COUNTRY_BORDERS)])))); }, []);
  return list;
}

function inside(rings: Rings, lat: number, lng: number): boolean {
  let hit = false;
  for (const r of rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [ai, bi] = r[i]; const [aj, bj] = r[j];
      if ((ai > lat) !== (aj > lat) && lng < ((bj - bi) * (lat - ai)) / (aj - ai) + bi) hit = !hit;
    }
  }
  return hit;
}

/** Premietanie krajiny do SVG: rovnobežky sa skrátia o cos(stredná šírka). */
function project(rings: Rings) {
  const pts = rings.flat();
  const lat0 = Math.min(...pts.map((p) => p[0])); const lat1 = Math.max(...pts.map((p) => p[0]));
  const lng0 = Math.min(...pts.map((p) => p[1])); const lng1 = Math.max(...pts.map((p) => p[1]));
  const k = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
  const H = W * (lat1 - lat0) / ((lng1 - lng0) * k);
  const xy = (lat: number, lng: number): [number, number] => [((lng - lng0) / (lng1 - lng0)) * W, ((lat1 - lat) / (lat1 - lat0)) * H];
  const back = (x: number, y: number) => ({ lat: lat1 - (y / H) * (lat1 - lat0), lng: lng0 + (x / W) * (lng1 - lng0) });
  const d = rings.map((r) => 'M' + r.map(([a, b]) => xy(a, b).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('');
  /** 1 km na mape (poludník ≈ 110,6 km na stupeň). */
  const pxKm = H / ((lat1 - lat0) * 110.6);
  return { H, xy, back, d, pxKm };
}

/** Východisková krajina: pin → krajina z heroflow (2. krok, `dogs.country`) → národnosť →
 *  jazyk prehliadača (sk-SK) → jazyk appky → SK.
 *  ⚠️ IP sa zatiaľ nepýtame — appka na to nemá koncový bod (Cloudflare `cf.country` by ho dal). */
export function defaultCountry(pin?: Pin, nationality?: string, lang?: string, heroCountry?: string | null): string {
  const norm = (c?: string | null) => { const v = (c ?? '').toLowerCase(); return v === 'uk' ? 'gb' : v; };
  if (pin?.country) return norm(pin.country);
  if (heroCountry) return norm(heroCountry);
  if (nationality && nationality !== 'OTHER') return norm(nationality);
  const nav = typeof navigator !== 'undefined' ? navigator.language.split('-')[1] : undefined;
  if (nav) return norm(nav);
  return ({ sk: 'sk', cs: 'cz', de: 'de', pl: 'pl', hu: 'hu' } as Record<string, string>)[lang ?? ''] ?? 'sk';
}

/** Meno krajiny v jazyku appky (`countryName` vracia EN). */
export function useCountryName() {
  const { lang } = useLang();
  return useMemo(() => {
    try { const dn = new Intl.DisplayNames([lang], { type: 'region' }); return (c: string) => dn.of(c.toUpperCase()) ?? countryName(c); }
    catch { return countryName; }
  }, [lang]);
}

/** Jeden chip s krajinou; ťuk otvorí výber zo všetkých (natívny select leží pod chipom). */
export function SnifferCountryChip({ iso, onPick, tx }: { iso: string; onPick: (c: string) => void; tx: Tx }) {
  const countries = useCountries();
  const name = useCountryName();
  const sorted = useMemo(() => countries.map((c) => [c, name(c)] as const).sort((a, b) => a[1].localeCompare(b[1])), [countries, name]);
  return (
    <>
      <style>{CSS}</style>
      <label className="spn-ctry">
        <img src={flagUrl(iso, 80)} alt="" />{name(iso)}<i aria-hidden />
        <select value={iso} aria-label={tx('pack.sniffer.pin.country', 'Country')} onChange={(e) => onPick(e.target.value)}>
          {sorted.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
        </select>
      </label>
    </>
  );
}

/** Obrys krajiny BEZ bodu — na cudzom profile (pin je súkromný). */
export function SnifferCountryOutline({ iso }: { iso?: string | null }) {
  const rings = useRings((iso ?? 'sk').toLowerCase());
  const g = useMemo(() => (rings ? project(rings) : null), [rings]);
  if (!g) return null;
  return (
    <>
      <style>{CSS}</style>
      <svg className="spn-map" viewBox={`-12 -12 ${W + 24} ${g.H + 24}`} aria-hidden>
        <path className="spn-land" d={g.d} />
      </svg>
    </>
  );
}

/** Editor pinu: ťuk do mapy (len dnu v krajine) + posuvník plochy terča. Krajinu vyberá
 *  `SnifferCountryChip` v hlavičke karty; pin sa zapíše až ťukom — samotná zmena krajiny
 *  neuloží nič, inak by na serveri ležal pin mimo obrysu novej krajiny. */
export function SnifferPinEditor({ tx, pin, iso, radiusKm, onRadius }: {
  tx: Tx; pin?: Pin; iso: string; radiusKm: number | null; onRadius: (km: number | null) => void;
}) {
  const rings = useRings(iso);
  const g = useMemo(() => (rings ? project(rings) : null), [rings]);
  const [miss, setMiss] = useState(false);
  const stopOf = (km: number | null) => {
    if (km === null || km > 100) return RADIUS_STOPS.length - 1;
    let best = 0;
    RADIUS_STOPS.forEach((r, n) => { if (r !== null && Math.abs(r - km) < Math.abs((RADIUS_STOPS[best] as number) - km)) best = n; });
    return best;
  };
  const [stop, setStop] = useState(stopOf(radiusKm));
  useEffect(() => setStop(stopOf(radiusKm)), [radiusKm]); // eslint-disable-line react-hooks/exhaustive-deps
  const km = RADIUS_STOPS[stop];

  if (!g || !rings) return <div className="spn-map" style={{ aspectRatio: '2 / 1' }} aria-busy />;

  const place = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    const ll = g.back(p.x, p.y);
    if (!inside(rings, ll.lat, ll.lng)) { setMiss(true); return; }
    setMiss(false);
    // ~1 km presnosť: viac sa neukladá, aby sa zo vzdialeností nedal dopočítať dom
    void saveHuman({ pin: { country: iso, lat: Math.round(ll.lat * 100) / 100, lng: Math.round(ll.lng * 100) / 100 } });
  };
  const commit = () => { if (km !== radiusKm) onRadius(km); };

  const at = pin && pin.country.toLowerCase() === iso ? g.xy(pin.lat, pin.lng) : null;
  // TERČ = PLOCHA (Matej: „možnosť zväčšovať plochu targetu"). Vonkajší kruh je `radius_km`
  // v mierke mapy, takže rastie s posuvníkom; menší ako 26 px nebýva, aby ho bolo vidno aj na
  // veľkej krajine. Výplň je orezaná obrysom krajiny. Packa v strede má stálu veľkosť.
  const R = km === null ? Math.max(g.H, W) : Math.max(26, km * g.pxKm);
  const P = 13;
  return (
    <>
      <style>{CSS}</style>
      <svg className="spn-map is-edit" viewBox={`-12 -12 ${W + 24} ${g.H + 24}`} onClick={place}
        role="img" aria-label={tx('pack.sniffer.pin.tap', 'Tap the map to drop your pin')}>
        <defs><clipPath id="spn-clip"><path d={g.d} /></clipPath></defs>
        <path className="spn-land" d={g.d} />
        {at && (
          <g style={{ pointerEvents: 'none' }}>
            <g clipPath="url(#spn-clip)">
              <circle className="spn-reach" cx={at[0]} cy={at[1]} r={R} />
              {km !== null && <circle cx={at[0]} cy={at[1]} r={R * 0.62} fill="none" stroke={TARGET} strokeWidth={2} strokeDasharray="6 4" />}
            </g>
            <g transform={`translate(${at[0].toFixed(1)},${at[1].toFixed(1)})`}>
              {km !== null && (
                <g fill="none" stroke={TARGET} strokeWidth={3}>
                  <circle r={R} />
                  <path d={`M0 ${-R - 8}V${-R + 6}M0 ${R - 6}V${R + 8}M${-R - 8} 0H${-R + 6}M${R - 6} 0H${R + 8}`} />
                </g>
              )}
              <circle r={P} fill={TARGET} stroke={T.card} strokeWidth={2} />
              <image href="/icons/pack/paw-full.svg" x={-P + 4} y={-P + 4} width={(P - 4) * 2} height={(P - 4) * 2}
                style={{ filter: 'brightness(0) invert(1)' }} />
            </g>
          </g>
        )}
      </svg>
      {miss && <p className="spn-warn">{tx('pack.sniffer.pin.outside', 'Drop the pin inside the country')}</p>}
      <label className="spn-reachrow">
        <span>{tx('pack.sniffer.pin.reach', 'Area')}</span>
        <input type="range" min={0} max={RADIUS_STOPS.length - 1} step={1} value={stop}
          onChange={(e) => setStop(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} onTouchEnd={commit} />
        <b>{km === null ? tx('pack.sniffer.pin.whole', 'no limit') : tx('pack.buddy.km', 'up to {n} km', { n: km })}</b>
      </label>
    </>
  );
}
