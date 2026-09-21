// VYRAZIŤ NA MIESTO — odkazy z výletu do navigácií a trasa do mobilu.
//
// Matej 2026-09-13: „človek pozrie výlet chce ísť na miesto tak tam bude možnosť vyraziť na
// miesto (parkovisko) a po kliku sa zobrazia možnosti cez akú apku na miesto, a musí tam byť
// aj tá možnosť otvoriť trasu v mapách cz aby človek v teréne išiel podľa tejto mapy".
//
// ── DVE RÔZNE VECI, PRETO DVE SEKCIE ────────────────────────────────────────────────────
//   1. AUTOM NA ŠTART   — jeden cieľ, navigácia po ceste. Google · Apple · Waze · Mapy.com.
//   2. TRASA DO MOBILU  — celá stopa, chôdza v teréne. Mapy.com (odkaz) · GPX (súbor).
// Zliať ich do jedného radu by znamenalo, že „Google Mapy" a „GPX" vyzerajú ako alternatívy
// toho istého — pritom prvé ťa dovezie na parkovisko a druhé ťa vedie po chodníku.
//
// ── CIEĽ MÁ VÝLET VŽDY ──────────────────────────────────────────────────────────────────
// Parkovisko je NEPOVINNÉ (dopĺňa sa v `npm run trip-audit`) a v deň zavedenia ho nemal ani
// jeden zo 72 výletov. Bez záložného cieľa by tlačidlo na 72 výletoch nerobilo nič — preto
// `navTarget()` padá na ŠTART TRASY. Rozdiel je pomenovaný v UI, nie zamlčaný: človek musí
// vedieť, či ho vezie na overené parkovisko, alebo len k prvému bodu stopy.

import type { HeroTrail } from '@/data/heroTrails.generated';
import mapyMeranie from './mapyTrasy.meranie.json';

const MAPY_OFF = new Set<string>(mapyMeranie.mimo.map((x: { id: string }) => x.id));

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
 * TRASA V MAPY.COM — celá stopa v plánovači, režim Turistická.
 *
 * 13. a 15. 9. 2026 sme tu tvrdili, že trasa sa do URL vložiť nedá. Dá — len parameter `rc`
 * NIE SÚ holé súradnice, ale Seznamovo kódovanie (SMap coordsToString). Holé `lon,lat` stránka
 * zahodila, preto všetky tri pokusy padli. Kódovanie rozlúsknuté 21. 9. 2026 zo 14 vzoriek
 * z ich plánovača (zhoda znak po znaku) a Matej overil, že odkaz otvorí trasu v APPKE
 * na telefóne. Zdroj pokusu: `plany/mapy-rc-kodovac-2026-09-21.mjs`.
 *
 *   x = (lon+180)·2^28/360, y = (lat+90)·2^28/180 · prvý bod absolútne (5 znakov),
 *   ďalšie ako delta: 2 znaky do ±1024, 3 znaky do ±32768, inak znova absolútne.
 *   `mrp={"c":132}` = Turistická pešo (111 by bolo auto).
 *
 * ⚠️ BODOV JE 8, NIE CELÁ STOPA. Záruby 1 s 28 kotvami = 28 špendlíkov na mape; s 3 bodmi
 * si Mapy.com vybrali iný chodník (5,0 km), s 5 bodmi 5,5 km, s 8 bodmi 5,6 km = náš GPX.
 * Body sa berú rovnomerne PO DĹŽKE, nie po indexe — prichytená stopa má body nahusto
 * v zákrutách a riedko na rovinke.
 *
 * ⚠️ TAM A SPÄŤ (Matej 21. 9.: „tam aj späť"). Stopa nesie jeden smer; keď sú naše km
 * aspoň 1,6× dĺžka stopy a koniec je ďaleko od štartu, výlet je tam a späť a späť sa ide
 * PO TÝCH ISTÝCH BODOCH v opačnom poradí. Prvá verzia dala na koniec len štart — Mapy.com
 * si potom z vrcholu vybrali vlastnú kratšiu cestu (Záruby 1: späť po modrej cez Havraniu
 * skalu, 10,4 km namiesto 11,3; Matej: „my mame tu istu tam a spať a trasa na mapy cz je
 * ina tam a ina naspat"). Cena: pri každom bode dva špendlíky na tom istom mieste.
 * Okruh (koniec pri štarte) sa nechá, ako je.
 */
const RC_ABC = '0ABCD2EFGH4IJKLMN6OPQRSTU8VWXYZ-1abcd3efgh5ijklmn7opqrst9uvwxyz.';
const MAPY_POINTS = 8;

function rcNum(delta: number, orig: number): string {
  const A = RC_ABC;
  if (delta >= -1024 && delta < 1024) return A[(delta + 1024) >> 6] + A[(delta + 1024) & 63];
  if (delta >= -32768 && delta < 32768) {
    const v = 0x20000 | (delta + 32768);
    return A[(v >> 12) & 63] + A[(v >> 6) & 63] + A[v & 63];
  }
  const v = 0x30000000 | (orig & 0xFFFFFFF);
  return A[(v >> 24) & 63] + A[(v >> 18) & 63] + A[(v >> 12) & 63] + A[(v >> 6) & 63] + A[v & 63];
}

export function mapyRc(pts: Array<[number, number]>): string {
  let ox = 0, oy = 0, s = '';
  for (const [lat, lon] of pts) {
    const x = Math.round((lon + 180) * 2 ** 28 / 360);
    const y = Math.round((lat + 90) * 2 ** 28 / 180);
    s += rcNum(x - ox, x) + rcNum(y - oy, y);
    ox = x; oy = y;
  }
  return s;
}

function kmBetween(a: [number, number], b: [number, number]): number {
  const r = Math.PI / 180;
  const x = (b[1] - a[1]) * r * Math.cos(((a[0] + b[0]) / 2) * r);
  const y = (b[0] - a[0]) * r;
  return 6371 * Math.hypot(x, y);
}

/** `n` bodov rovnomerne po dĺžke stopy; prvý a posledný sú vždy štart a koniec. */
function pickAlong(path: Array<[number, number]>, n: number): Array<[number, number]> {
  if (path.length <= n) return path;
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + kmBetween(path[i - 1], path[i]));
  const total = cum[cum.length - 1];
  const out: Array<[number, number]> = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const want = (total * k) / (n - 1);
    while (j < path.length - 1 && cum[j] < want) j++;
    out.push(path[j]);
  }
  return out;
}

export function mapyRouteUrl(trail: Pick<HeroTrail, 'path' | 'km'>): string | null {
  const path = (trail.path ?? []) as Array<[number, number]>;
  if (path.length < 2) return null;
  let len = 0;
  for (let i = 1; i < path.length; i++) len += kmBetween(path[i - 1], path[i]);
  const gap = kmBetween(path[0], path[path.length - 1]);
  const km = parseFloat(String(trail.km).replace(',', '.'));
  const thereBack = gap > 0.3 && len > 0 && km / len > 1.6;
  const pts = pickAlong(path, MAPY_POINTS);
  if (thereBack) pts.push(...pts.slice(0, -1).reverse());
  const each = (p: string) => pts.map(() => p).join('&');
  return `https://mapy.com/turisticka?planovani-trasy&rc=${mapyRc(pts)}&${each('rs=coor')}&${each('ri=')}`
    + `&mrp=${encodeURIComponent('{"c":132}')}`;
}

/**
 * ⚠️ ODKAZ SA PONÚKA LEN VÝLETU, KTORÉMU MAPY.COM NAKRESLIA NAŠU TRASU.
 *
 * Plánovač vedie trasu len po chodníkoch, ktoré pozná. Kde naša stopa ide terénom mimo nich
 * (Sokolie v Malej Fatre, Sivý vrch, Tatry), obchádza body po cestách: namerané 21. 9. 2026
 * 7,3 km → 14,9 km, 23,1 → 34,9 km. Človeka so psom by tak poslal na dvojnásobnú trasu.
 * Viac bodov to nezlepší, skôr naopak (12 bodov = 54 zo 63 výletov v norme, 8 bodov = 56).
 * Takým výletom ostáva GPX, ktorý nesie presne našu stopu.
 *
 * Zoznam NIE JE ručný: zapisuje ho `node scripts/mapy-trasy-over.mjs`, ktorý otvorí každý
 * výlet v Mapy.com a porovná ich km s našimi. Nový výlet, ktorý ešte nikto nezmeral, odkaz
 * dostane. Po pridaní výletov preto skript spusti znova.
 */
export function mapyTrailUrl(trail: Pick<HeroTrail, 'id' | 'path' | 'km'>): string | null {
  if (MAPY_OFF.has(trail.id)) return null;
  return mapyRouteUrl(trail);
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
