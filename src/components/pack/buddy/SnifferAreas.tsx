// SNIFFER — MÔJ RAJÓN: mapka Slovenska, ťukom Západ / Stred / Východ („kde chodíte často").
// Zadanie: plany/zadanie-sniffer-stavba-2026-09-26.md §2.4 · nákres obrazovka E.
// V nákrese bol rez po poludníkoch; tu sú to KRAJE (Matej: „v appke podľa krajov") —
// `src/data/svkKraje.generated.ts`, zoskupenie krajov do rajónov je v generátore.
// Zápis: `human.areas` (údaj o človeku, viditeľný aj na profile), nie `assnif_settings`.
import { SVK_KRAJE, SVK_KRAJE_VIEW, type SvkArea } from '@/data/svkKraje.generated';
import { saveHuman } from '@/components/pack/profile/packProfile';
import { PACK_THEME as T, PACK_TEXT, FONT_UI } from '@/components/pack/packTheme';
import { LAPIS, tintRGBA } from '@/components/pack/navGoldSkin';

type Tx = (key: string, fallback: string, vars?: Record<string, string | number>) => string;

export const AREA_EN: Record<SvkArea, string> = { W: 'West', C: 'Centre', E: 'East' };
const AREAS: SvkArea[] = ['W', 'C', 'E'];

const CSS = `
.sa-map{width:100%;height:auto;display:block;}
.sa-map path{cursor:pointer;fill:${T.tileBg};stroke:${T.border};stroke-width:.6;transition:fill .15s ease;}
.sa-map path.is-on{fill:${tintRGBA(LAPIS.edge, 0.32)};stroke:${LAPIS.edge};}
.sa-map path:hover{fill:${LAPIS.fill};}
.sa-map text{font-family:${FONT_UI};font-weight:600;font-size:${PACK_TEXT.label}px;fill:${T.inkStrong};pointer-events:none;}
`;

export function areaLabel(tx: Tx, a: SvkArea) {
  return tx(`pack.sniffer.area.${a}`, AREA_EN[a]);
}

export function SnifferAreas({ tx, selected }: { tx: Tx; selected: SvkArea[] }) {
  const toggle = (a: SvkArea) => void saveHuman({
    areas: selected.includes(a) ? selected.filter((x) => x !== a) : AREAS.filter((x) => x === a || selected.includes(x)),
  });
  // Popis rajónu stojí v ťažisku jeho krajov.
  const centre = (a: SvkArea) => {
    const ks = SVK_KRAJE.filter((k) => k.area === a);
    return { x: ks.reduce((s, k) => s + k.cx, 0) / ks.length, y: ks.reduce((s, k) => s + k.cy, 0) / ks.length };
  };
  return (
    <>
      <style>{CSS}</style>
      <svg className="sa-map" viewBox={`-4 -4 ${SVK_KRAJE_VIEW.w + 8} ${SVK_KRAJE_VIEW.h + 8}`} role="group"
        aria-label={tx('pack.sniffer.areas', 'My patch')}>
        {SVK_KRAJE.map((k) => (
          <path key={k.name} d={k.d} className={selected.includes(k.area) ? 'is-on' : ''}
            role="button" aria-pressed={selected.includes(k.area)} aria-label={`${areaLabel(tx, k.area)} · ${k.name}`}
            onClick={() => toggle(k.area)} />
        ))}
        {AREAS.map((a) => {
          const c = centre(a);
          return <text key={a} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle">{areaLabel(tx, a)}</text>;
        })}
      </svg>
    </>
  );
}
