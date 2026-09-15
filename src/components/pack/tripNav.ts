// VYRAZIŤ NA MIESTO — odkazy z výletu do navigácií a trasa do mobilu.
//
// Matej 2026-09-13: „človek pozrie výlet chce ísť na miesto tak tam bude možnosť vyraziť na
// miesto (parkovisko) a po kliku sa zobrazia možnosti cez akú apku na miesto, a musí tam byť
// aj tá možnosť otvoriť trasu v mapách cz aby človek v teréne išiel podľa tejto mapy".
//
// ── DVE RÔZNE VECI, PRETO DVE SEKCIE ────────────────────────────────────────────────────
//   1. AUTOM NA ŠTART   — jeden cieľ, navigácia po ceste. Google · Apple · Waze · Mapy.com.
//   2. TRASA DO MOBILU  — celá stopa, chôdza v teréne. GPX · Mapy.com turistická.
// Zliať ich do jedného radu by znamenalo, že „Google Mapy" a „GPX" vyzerajú ako alternatívy
// toho istého — pritom prvé ťa dovezie na parkovisko a druhé ťa vedie po chodníku.
//
// ── CIEĽ MÁ VÝLET VŽDY ──────────────────────────────────────────────────────────────────
// Parkovisko je NEPOVINNÉ (dopĺňa sa v `npm run trip-audit`) a v deň zavedenia ho nemal ani
// jeden zo 72 výletov. Bez záložného cieľa by tlačidlo na 72 výletoch nerobilo nič — preto
// `navTarget()` padá na ŠTART TRASY. Rozdiel je pomenovaný v UI, nie zamlčaný: človek musí
// vedieť, či ho vezie na overené parkovisko, alebo len k prvému bodu stopy.

import type { HeroTrail } from '@/data/heroTrails.generated';

export type NavApp = 'google' | 'apple' | 'waze' | 'mapy';

/** Kam sa vyráža + či je to overené parkovisko, alebo len štart stopy. */
export type NavTarget = { lat: number; lon: number; parking: boolean; note?: string };

export function navTarget(trail: Pick<HeroTrail, 'parking' | 'path'>): NavTarget | null {
  if (trail.parking) {
    const { lat, lon, note } = trail.parking;
    return { lat, lon, parking: true, ...(note ? { note } : {}) };
  }
  const start = trail.path?.[0];
  if (!start) return null;
  return { lat: start[0], lon: start[1], parking: false };
}

/**
 * ⚠️ APPLE MAPS SA PONÚKA LEN NA APPLE ZARIADENÍ. `maps.apple.com` na Androide ani na
 * Windows neotvorí nič použiteľné — je to odkaz, ktorý časti ľudí zaručene nefunguje,
 * a taký do ponuky nepatrí. Zvyšné tri fungujú všade (Waze aj bez appky, cez web).
 */
export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
}

/**
 * ⚠️ MAPY.COM CHCE PORADIE `lon,lat` (a `x`=dĺžka, `y`=šírka) — opačne než Google, Apple
 * aj Waze. Overené 13. 9. 2026 na živej stránke: pin sadne a panel rovno ponúkne „Trasa".
 * Prehodené poradie nespadne, len ťa pošle o pol sveta inam.
 */
export function navUrl(app: NavApp, t: NavTarget): string {
  const ll = `${t.lat},${t.lon}`;
  switch (app) {
    // `api=1` je Googlom dokumentovaný univerzálny tvar: na mobile otvorí appku, na počítači web.
    case 'google': return `https://www.google.com/maps/dir/?api=1&destination=${ll}`;
    case 'apple':  return `https://maps.apple.com/?daddr=${ll}&dirflg=d`;
    case 'waze':   return `https://waze.com/ul?ll=${ll}&navigate=yes`;
    case 'mapy':   return `https://mapy.com/turisticka?source=coor&id=${t.lon},${t.lat}&x=${t.lon}&y=${t.lat}&z=16`;
  }
}

/**
 * TURISTICKÁ MAPA NA ŠTARTE TRASY.
 *
 * 🔴 TRASA SA DO URL MAPY.COM VLOŽIŤ NEDÁ (overené 13. 9. 2026, ZNOVA 15. 9. 2026 po Matejovej
 * reklamácii „otvoriť v mapach cz neukáže trasu"). Odskúšané tri tvary naživo v prehliadači:
 * `?planovani-trasy&rs=coor&ri=<lon>,<lat>&rs=coor&ri=…` a `?planovani-trasy&rc=<lon>,<lat>;…`
 * stránka pri načítaní ZAHODÍ a prehodí na východiskový výrez (Nemecko, z=7);
 * `?routeStart=…&routeEnd=…` si v adrese nechá, ale ignoruje ich. Preto sa odkaz 15. 9.
 * PREMENOVAL na „Otvoriť okolie v Mapy.com" — sľubovať trasu a ukázať výrez je horšie než
 * pomenovať, čo odkaz naozaj robí. NAŠU stopu nesie GPX o riadok vyššie.
 *
 * Starý tvar mapy.cz
 * (`&rs=coor&ri=<lon>,<lat>`) nová stránka pri načítaní ZAHODÍ — presmeruje na prázdny
 * plánovač. Preto sa odtiaľto otvára turistická vrstva vycentrovaná na štart (človek má
 * KČT značenie a vie sa zorientovať) a NAŠA stopa ide do mobilu cez GPX nižšie.
 * Keby Seznam raz zverejnil tvar pre trasu, mení sa jediný riadok tu.
 */
export function mapyTrailUrl(trail: Pick<HeroTrail, 'path'>): string | null {
  const s = trail.path?.[0];
  if (!s) return null;
  return `https://mapy.com/turisticka?x=${s[1]}&y=${s[0]}&z=14`;
}

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) =>
  ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));

/**
 * GPX — jediný formát, ktorý vezme Mapy.com, Locus, Garmin aj Organic Maps, a jediná cesta,
 * ako dostať NAŠU stopu do mobilu na cestu bez signálu.
 *
 * ⚠️ Parkovisko ide ako `<wpt>`, nie ako prvý bod trasy: je to samostatné miesto, nie začiatok
 * chôdze, a keby stálo v stope, predĺžilo by nameranú dĺžku o cestu z parkoviska.
 * ⚠️ `trail.path` je UŽ prichytená stopa (generátor zapisuje `snapPath ?? anchors`), takže sa
 * tu nič neprepočítava — do súboru ide presne to, čo appka kreslí.
 */
/**
 * FARBA A DÁTUM STOPY (doplnené 15. 9. 2026 po teste v teréne).
 *
 * Matej otvoril náš GPX v appke Mapy.com na telefóne — trasa sa vykreslila, účet appka
 * nepýtala (na rozdiel od ich webu). Dve veci ale vyzerali cudzo:
 *  · stopa dostala ČERVENÚ, ktorá splýva s červenou KČT značkou, po ktorej trasa vedie
 *    („nie je ich farbou ale červenou ktorá zaniká…"),
 *  · po uložení sa pri nej ukázal dátum **1. 1. 1970** — Unixová nula, lebo súbor nemal
 *    v `<metadata>` žiadny čas a appka si dosadila prázdnu hodnotu.
 *
 * Farbu GPX v základnej schéme nemá, nesú ju rozšírenia a každá appka číta iné — preto sú
 * v súbore OBE: Garmin `gpxx:DisplayColor` (číselník MIEN, nie hex; najbližšie našej
 * fialovej je `Magenta`) a `gpx_style:line` s presnou brandovou `PACK_THEME.tripPurple`.
 * Keď ich appka nečíta, nič sa nerozbije — sú voliteľné.
 *
 * ⚠️ TEN ISTÝ TVAR MÁ `scripts/gen-trip-gpx.mjs`. Keď meníš jednu stranu, meň aj druhú.
 */
const GPX_TRIP_PURPLE = '7A2FBF';

export function tripGpx(trail: Pick<HeroTrail, 'id' | 'name' | 'path' | 'parking'>): string {
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
      <gpx_style:line><gpx_style:color>${GPX_TRIP_PURPLE}</gpx_style:color><gpx_style:width>4</gpx_style:width></gpx_style:line>
    </extensions>
    <trkseg>
${seg}
    </trkseg>
  </trk>
</gpx>
`;
}

/** Stiahne GPX pod slugom výletu. Blob, nie data: URI — trasa má stovky bodov a dlhé
 *  `data:` URL časť prehliadačov odmieta. */
export function downloadGpx(trail: Pick<HeroTrail, 'id' | 'name' | 'path' | 'parking'>): void {
  const url = URL.createObjectURL(new Blob([tripGpx(trail)], { type: 'application/gpx+xml' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trail.id}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Uvoľniť hneď by stiahnutie v Safari stihlo zrušiť — odklad je lacnejší než nestiahnutý súbor.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
