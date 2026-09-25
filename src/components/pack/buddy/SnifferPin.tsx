// SNIFFER — MÔJ RAJÓN ako PIN (kolo 2, Matej 25. 9. 2026: „vybrať obrys krajiny, a umiestniť
// pin na mapu"). Nahrádza výber krajov (`SnifferAreas`) — okolie sa odteraz ráta v km od pinu.
// Nákres: plany/nakres-sniffer-kolo2-2026-09-25.html, obrazovka D.
//
// 🔴 PIN JE SÚKROMNÝ. Ukladá sa zaokrúhlený na 2 desatinné miesta (~1 km) do `human.pin`
//    a server z neho vydáva len vzdialenosť (`distance_km`). `SnifferCountryOutline` (cudzí
//    profil) preto kreslí LEN obrys krajiny, nikdy bod.
// Obrysy = `COUNTRY_BORDERS` (krajiny, kde máme výlety) — tá istá hranica ako na mape `/pack`.
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { COUNTRY_BORDERS } from '@/data/countryBorders';
import { saveHuman, type HumanProfile } from '@/components/pack/profile/packProfile';
import { PACK_THEME as T, PACK_R, PACK_SPACE, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, PICK_INK, pickTintCSS } from '@/components/pack/navGoldSkin';
import { countryName, flagUrl } from '@/lib/countryGeo';
import { useLang } from '@/i18n/LanguageContext';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;
type Pin = NonNullable<HumanProfile['pin']>;

const W = 300;
/** Farba terča — tá istá červená ako srdce v logu SNIFFERa (nákres kola 2). */
const TARGET = '#E8493F';

const CSS = `
.spn-map{width:100%;height:auto;display:block;border-radius:${PACK_R.tile}px;background:${T.tileBg};}
.spn-map.is-edit{cursor:crosshair;}
.spn-land{fill:${T.card};stroke:${T.inkStrong};stroke-width:1.2;}
.spn-ctry{display:flex;flex-wrap:wrap;gap:${PACK_SPACE.sm}px;}
.spn-ctry .pk-pill{display:inline-flex;align-items:center;gap:${PACK_SPACE.xs}px;font-family:${FONT_UI};font-size:${PACK_TEXT.label}px;}
.spn-ctry .pk-pill img{width:${PACK_SPACE.lg}px;height:${PACK_SPACE.md}px;object-fit:cover;}
.spn-ctry .pk-pill.is-on{${pickTintCSS(LAPIS.edge, PICK_INK.lapis, 0.16)}}
`;

/** Premietanie krajiny do SVG: rovnobežky sa skrátia o cos(stredná šírka). */
function useProjection(iso: string) {
  return useMemo(() => {
    const rings = COUNTRY_BORDERS[iso] ?? COUNTRY_BORDERS.sk;
    const pts = rings.flat();
    const lat0 = Math.min(...pts.map((p) => p[0])); const lat1 = Math.max(...pts.map((p) => p[0]));
    const lng0 = Math.min(...pts.map((p) => p[1])); const lng1 = Math.max(...pts.map((p) => p[1]));
    const k = Math.cos(((lat0 + lat1) / 2) * Math.PI / 180);
    const H = W * (lat1 - lat0) / ((lng1 - lng0) * k);
    const xy = (lat: number, lng: number): [number, number] => [((lng - lng0) / (lng1 - lng0)) * W, ((lat1 - lat) / (lat1 - lat0)) * H];
    const back = (x: number, y: number) => ({ lat: lat1 - (y / H) * (lat1 - lat0), lng: lng0 + (x / W) * (lng1 - lng0) });
    const d = rings.map((r) => 'M' + r.map(([a, b]) => xy(a, b).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('');
    return { H, xy, back, d };
  }, [iso]);
}

const known = (iso?: string | null) => (iso && COUNTRY_BORDERS[iso.toLowerCase()] ? iso.toLowerCase() : 'sk');

/** Obrys krajiny BEZ bodu — na cudzom profile (pin je súkromný). */
export function SnifferCountryOutline({ iso }: { iso?: string | null }) {
  const { H, d } = useProjection(known(iso));
  return (
    <>
      <style>{CSS}</style>
      <svg className="spn-map" viewBox={`-12 -12 ${W + 24} ${H + 24}`} aria-hidden>
        <path className="spn-land" d={d} />
      </svg>
    </>
  );
}

/** Editor pinu: výber krajiny + ťuk na mapu. Pin sa zapíše až ťukom — samotná zmena
 *  krajiny neuloží nič, inak by na serveri ležal pin mimo obrysu novej krajiny. */
export function SnifferPinEditor({ tx, pin, fallbackCountry }: { tx: Tx; pin?: Pin; fallbackCountry?: string }) {
  const [iso, setIso] = useState(known(pin?.country ?? fallbackCountry));
  useEffect(() => { if (pin?.country) setIso(known(pin.country)); }, [pin?.country]);
  const { H, xy, back, d } = useProjection(iso);
  const countries = useMemo(() => Object.keys(COUNTRY_BORDERS).sort((a, b) => (a === 'sk' ? -1 : b === 'sk' ? 1 : a.localeCompare(b))), []);
  const { lang } = useLang();
  // Meno krajiny v jazyku appky (`countryName` vracia EN) — ten istý postup ako HĽADAŤ.
  const ctryName = useMemo(() => {
    try { const dn = new Intl.DisplayNames([lang], { type: 'region' }); return (c: string) => dn.of(c.toUpperCase()) ?? countryName(c); }
    catch { return countryName; }
  }, [lang]);

  const place = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    const g = back(p.x, p.y);
    // ~1 km presnosť: viac sa neukladá, aby sa zo vzdialeností nedal dopočítať dom
    void saveHuman({ pin: { country: iso, lat: Math.round(g.lat * 100) / 100, lng: Math.round(g.lng * 100) / 100 } });
  };

  const at = pin && known(pin.country) === iso ? xy(pin.lat, pin.lng) : null;
  return (
    <>
      <style>{CSS}</style>
      <div className="spn-ctry" role="group" aria-label={tx('pack.sniffer.pin.country', 'Country')}>
        {countries.map((c) => (
          <button key={c} type="button" aria-pressed={c === iso} className={`pk-pill pk-pill--tap${c === iso ? ' is-on' : ''}`}
            onClick={() => setIso(c)}>
            <img src={flagUrl(c)} alt="" />{ctryName(c)}
          </button>
        ))}
      </div>
      <svg className="spn-map is-edit" viewBox={`-12 -12 ${W + 24} ${H + 24}`} onClick={place}
        role="img" aria-label={tx('pack.sniffer.pin.tap', 'Tap the map to drop your pin')}>
        <path className="spn-land" d={d} />
        {at && (
          <g transform={`translate(${at[0].toFixed(1)},${at[1].toFixed(1)})`} fill="none" stroke={TARGET} strokeWidth={3}>
            <circle r={16} /><circle r={8} strokeDasharray="5 3" /><circle r={3} fill={TARGET} />
            <path d="M0 -22V-11M0 11V22M-22 0H-11M11 0H22" />
          </g>
        )}
      </svg>
    </>
  );
}
