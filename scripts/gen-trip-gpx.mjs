// GPX SÚBORY VÝLETOV DO `public/gpx/` — aby trasa mala VEREJNÝ ODKAZ.
//
// 🛑 ZAPARKOVANÉ 15. 9. 2026 — SKRIPT JE HOTOVÝ, ALE NEPÚŠŤA SA. Pilot na jednom výlete
// (Matej: „vyskušajme to najprv na jednom vylete… a ak hej aplikuješ to na každú") skončil
// na ŠTYROCH stenách za sebou: trasa sa do URL Mapy.com vložiť nedá · import GPX na ich webe
// je za prihlásením („Logging in will give you access to view GPX routes directly on the map")
// · na telefóne sa súbor najprv zobrazil ako XML a po oprave hlavičky sa zastavil na sťahovaní
// („nejde mi to chce niečo stiahnuť") · a aj po dotiahnutí by čakal ich účet. Posielať člena,
// ktorý práve zaplatil za heroglyf, zakladať si účet na Sezname = odbočka z našej appky do
// cudzej. Trasu preto naďalej kreslí NAŠA mapa v /pack; GPX ostáva ako tlačidlo pre toho, kto
// si ju vedome chce odniesť do Locusu či Garminu.
// Oživiť má zmysel LEN vtedy, keď Mapy.com import bez účtu otvoria.
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
  return JSON.parse(s.slice(i, s.lastIndexOf(']') + 1));
}

const esc = (v) => String(v).replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

export function tripGpx(trail) {
  const pts = trail.path ?? [];
  const wpt = trail.parking
    ? `\n  <wpt lat="${trail.parking.lat}" lon="${trail.parking.lon}">` +
      `<name>${esc(trail.parking.note || 'Parking')}</name><sym>Parking Area</sym></wpt>`
    : '';
  const seg = pts.map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"/>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="DOGYPT" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(trail.name)}</name></metadata>${wpt}
  <trk>
    <name>${esc(trail.name)}</name>
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
