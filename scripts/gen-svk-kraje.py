#!/usr/bin/env python3
# Generátor `src/data/svkKraje.generated.ts` — 8 krajov SR ako SVG cesty, zoskupené do rajónov
# Západ / Stred / Východ (SNIFFER „Môj rajón", zadanie-sniffer-stavba §2.4: „v appke podľa krajov").
# Zdroj: geoBoundaries gbOpen SVK ADM1 (simplified) = OpenStreetMap, licencia ODbL 1.0.
#   curl -sL -o kraje.geojson https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/SVK/ADM1/geoBoundaries-SVK-ADM1_simplified.geojson
#   python3 scripts/gen-svk-kraje.py kraje.geojson
import json, math, sys

MACRO = {  # kraj → rajón; tri rajóny = MACRO_REGIONS z PackMap.tsx (West/Center/East)
  'Bratislava': 'W', 'Trnava': 'W', 'Trenčín': 'W', 'Nitra': 'W',
  'Žilina': 'C', 'Banská Bystrica': 'C',
  'Prešov': 'E', 'Košice': 'E',
}
W = 300
d = json.load(open(sys.argv[1]))
rings = []
for f in d['features']:
    name = f['properties']['shapeName'].replace('Region of ', '')
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    rings.append((name, [p[0] for p in polys]))
lngs = [c[0] for _, rs in rings for r in rs for c in r]
lats = [c[1] for _, rs in rings for r in rs for c in r]
lng0, lng1, lat0, lat1 = min(lngs), max(lngs), min(lats), max(lats)
k = math.cos(math.radians((lat0 + lat1) / 2))
H = W * (lat1 - lat0) / ((lng1 - lng0) * k)
xy = lambda c: ((c[0] - lng0) / (lng1 - lng0) * W, (lat1 - c[1]) / (lat1 - lat0) * H)

out = []
for name, rs in rings:
    path = ''
    for r in rs:
        pts, last = [], None
        for c in r:
            x, y = xy(c)
            p = (round(x, 1), round(y, 1))
            if last is None or abs(p[0] - last[0]) + abs(p[1] - last[1]) >= 0.8:
                pts.append(p); last = p
        path += 'M' + 'L'.join(f'{x},{y}' for x, y in pts) + 'Z'
    cx = sum(xy(c)[0] for c in rs[0]) / len(rs[0]); cy = sum(xy(c)[1] for c in rs[0]) / len(rs[0])
    out.append(f"  {{ name: {json.dumps(name, ensure_ascii=False)}, area: '{MACRO[name]}', cx: {cx:.0f}, cy: {cy:.0f}, d: '{path}' }},")

ts = f"""// ⚙️ GENEROVANÉ — needituj ručne. Generátor: scripts/gen-svk-kraje.py (hlavička = odkiaľ dáta).
// Hranice krajov SR © OpenStreetMap prispievatelia (ODbL 1.0), cez geoBoundaries gbOpen SVK ADM1.
export type SvkArea = 'W' | 'C' | 'E';
export const SVK_KRAJE_VIEW = {{ w: {W}, h: {H:.0f} }};
export const SVK_KRAJE: Array<{{ name: string; area: SvkArea; cx: number; cy: number; d: string }}> = [
{chr(10).join(out)}
];
"""
open('src/data/svkKraje.generated.ts', 'w').write(ts)
print('ok', len(ts), 'B, H =', round(H))
