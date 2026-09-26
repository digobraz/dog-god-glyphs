// GPX SÚBORY VÝLETOV DO `public/gpx/` — aby trasa mala VEREJNÝ ODKAZ.
//
// ✅ OŽIVENÉ 15. 9. 2026 — APPKA MAPY.COM TRASU OTVORÍ A NAKRESLÍ, BEZ ÚČTU.
// Cesta pilotu: trasa sa do URL vložiť nedá · import na ICH WEBE je za prihlásením
// („Logging in will give you access to view GPX routes directly on the map") · odkaz cez
// prehliadač na telefóne skončil pri sťahovaní. Vyhlásil som to za slepú uličku PRIVČAS —
// Matej sa k samotnej appke ešte nedostal. Keď súbor dostal do telefónu cez **iCloud Drive**
// (Súbory → ťuknúť → Otvoriť v…), Mapy.com trasu vykreslili a účet NEPÝTALI.
// ⚠️ Prihlásenie teda platí LEN pre ich web, nie pre appku. Neopisuj starý záver.
// Otvorené: appka pridelila trase ČERVENÚ, ktorá splýva s červenou KČT značkou pod ňou
// (Matej: „nie je ich farbou ale červenou ktorá zaniká…") — preto sú v súbore obe farebné
// rozšírenia nižšie. Či ich Mapy.com čítajú, sa práve testuje.
//
// Prečo vôbec: Mapy.com **nevedia prijať trasu v URL** (overené 13. aj 15. 9. 2026 na troch
// tvaroch — viď hlavičku `components/pack/tripNav.ts`). Import GPX majú len tri cesty:
// pretiahnutie do mapy, Nástroje → Import GPX, a na telefóne OTVORENIE SÚBORU v aplikácii.
// Tá tretia je jediná, ktorá sa dá spustiť odkazom — a odkaz potrebuje súbor, ktorý niekde
// leží. Doteraz GPX vznikal až v prehliadači ako `blob:` (`downloadGpx` v tripNav.ts), teda
// adresu, ktorú by šlo poslať alebo ťuknúť, nemal.
//
// ⚠️ TVAR SÚBORU SA TU NEVYMÝŠĽA — je to tá istá skladba ako `tripGpx()` v `tripNav.ts`
// (parkovisko ako `<wpt>`, stopa ako jeden `<trkseg>`, `trail.path` už prichytená). Keď sa
// mení jedna strana, musí sa aj druhá; kontrola je v `npm run check:gpx`.
//
// Spustenie: `node scripts/gen-trip-gpx.mjs [slug …]` (bez argumentu = všetky výlety).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, '..');
const SRC = path.join(WEB, 'src/data/heroTrails.generated.ts');
const OUT = path.join(WEB, 'public/gpx');

/** `heroTrails.generated.ts` je TypeScript, ale telo poľa je čistý JSON — vyrežeme ho. */
function readTrails() {
  const s = fs.readFileSync(SRC, 'utf8');
  const i = s.indexOf('= [', s.indexOf('export const HERO_TRAILS')) + 2;
  const trails = JSON.parse(s.slice(i, s.lastIndexOf(']') + 1));
  // ⚠️ PLNÁ STOPA (26. 9. 2026): `heroTrails.generated.ts` nesie čiaru zriedenú na kreslenie,
  // GPX musí ísť z presnej — tá je v `heroTrailPaths.generated.ts` (id → body).
  const p = fs.readFileSync(path.join(WEB, 'src/data/heroTrailPaths.generated.ts'), 'utf8');
  const full = JSON.parse(p.slice(p.indexOf('= {') + 2, p.lastIndexOf('}') + 1).replace(/,\n}$/, '\n}'));
  return trails.map((t) => (full[t.id] ? { ...t, path: full[t.id] } : t));
}

const esc = (v) => String(v).replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

/**
 * FARBA STOPY (15. 9. 2026). Matej po prvom úspešnom otvorení v appke Mapy.com:
 * „Nakresli ale nejak divne nie je dobre vidno nie je ich farbou ale červenou ktorá zaniká…"
 * — appka importovanej trase pridelila červenú, a tá na turistickej mape splýva s červenou
 * KČT značkou, po ktorej trasa ide.
 *
 * GPX farbu v základnej schéme nemá, nesú ju dve rozšírenia a každá appka číta iné, preto
 * sú v súbore OBE:
 *   · Garmin `gpxx:DisplayColor` — číselník mien, nie hex (najbližšie našej fialovej je
 *     `Magenta`);
 *   · `gpx_style:line` — hex bez mriežky, tu presne brandová `PACK_THEME.tripPurple` #7A2FBF.
 * Keď ich appka nečíta, nič sa nerozbije — sú to voliteľné vetvy, nie povinný obsah.
 */
const TRIP_PURPLE = '7A2FBF';

export function tripGpx(trail) {
  const pts = trail.path ?? [];
  const wpt = trail.parking
    ? `\n  <wpt lat="${trail.parking.lat}" lon="${trail.parking.lon}">` +
      `<name>${esc(trail.parking.note || 'Parking')}</name><sym>Parking Area</sym></wpt>`
    : '';
  const seg = pts.map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"/>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="DOGYPT" xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
     xmlns:gpx_style="http://www.topografix.com/GPX/gpx_style/0/2">
  <metadata><name>${esc(trail.name)}</name><time>${new Date().toISOString()}</time></metadata>${wpt}
  <trk>
    <name>${esc(trail.name)}</name>
    <extensions>
      <gpxx:TrackExtension><gpxx:DisplayColor>Magenta</gpxx:DisplayColor></gpxx:TrackExtension>
      <gpx_style:line><gpx_style:color>${TRIP_PURPLE}</gpx_style:color><gpx_style:width>4</gpx_style:width></gpx_style:line>
    </extensions>
    <trkseg>
${seg}
    </trkseg>
  </trk>
</gpx>
`;
}

const want = process.argv.slice(2);
const trails = readTrails().filter((t) => (want.length ? want.includes(t.id) : true));
if (want.length && trails.length !== want.length) {
  const found = new Set(trails.map((t) => t.id));
  console.error('❌ nenájdené:', want.filter((w) => !found.has(w)).join(', '));
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
let bytes = 0;
for (const t of trails) {
  // Výlet bez stopy (návšteva = jeden bod) by dal GPX s jediným `trkpt` a Mapy.com
  // by ukázali prázdno — taký súbor radšej nevzniká, než aby klamal odkaz na neho.
  if ((t.path?.length ?? 0) < 2) continue;
  const gpx = tripGpx(t);
  fs.writeFileSync(path.join(OUT, `${t.id}.gpx`), gpx);
  bytes += Buffer.byteLength(gpx);
}
const written = trails.filter((t) => (t.path?.length ?? 0) >= 2).length;
console.log(`✅ ${written} GPX → public/gpx/ (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
if (written < trails.length) console.log(`   preskočené (menej než 2 body): ${trails.length - written}`);
