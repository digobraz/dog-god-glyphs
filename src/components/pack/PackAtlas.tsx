// MAPA NA KARTE — Európa (a pre člena z inej krajiny celý svet) ako kresba, nie dlaždice.
//
// Matej 11. 9. 2026: "dajme zatiaľ európu, dajme tam rôzne emoji - kemping, upozornenia atď.
// (tí čo sa registrujú z iných krajín budú mať svet... a tam tiež musia byť veľké emoji),
// mapa musí byť viac viditeľná, väčší kontrast, teraz zaniká tá bledá."
//
// Nahradilo to cobe guľu (TripGlobe), ktorá bola tá istá ako bledá guľa v GlobePulse o dva
// bloky nižšie — Matej: "je tam teraz planétka ako je aj nižšie".
//
// ── PREČO KRESBA A NIE ŽIVÁ MAPA S DLAŽDICAMI ───────────────────────────────────────────
// Homepage by pri každom načítaní ťahala dlaždice z Mapy.com aj pre členov, ktorí na mapu
// nikdy nekliknú. A živá mapa si pýta vlastné gestá (ťahanie, priblíženie), ktoré sa bijú
// s tým, že celá karta je odkaz: buď mapa nereaguje a vyzerá pokazená, alebo reaguje a klik
// na kartu prestane fungovať. Toto je SVG z dát, ktoré v prehliadači aj tak sú.
//
// ── ČO KRESLÍME Z ČOHO ──────────────────────────────────────────────────────────────────
//   · obrysy krajín       WORLD_OUTLINE (Natural Earth 110m, generované)
//   · územie Dogyptu      krajiny, kde máme aspoň jeden výlet — odvodené z HERO_TRAILS
//   · trasy               HERO_TRAILS.path, preriedené (v tejto mierke je z trasy čiarka)
//   · značky              TRAIL_POI (OSM, hnedý lem) + HeroTrail.customPoi (naše, farebný lem)
//
// ⚠️ KONTRAST NEROBÍ KRYTIE, ALE FARBA. Priesvitná pevnina nad tmavým morom ostane tmavá —
// presne preto mapa "zanikala" a zdvíhanie alfy to nespravilo. More aj zem preto majú vlastnú
// plnú farbu a až na tom podklade je vidieť zlaté územie.
//
// ⚠️ ZNAČKA MÁ NA KARTE LEN STRED A PRAVÚ POLOVICU. Dolný pás držia pilulky s číslami, ľavý
// horný roh trojriadkový nadpis; čokoľvek tam padne, zanikne. Preto SAFE_* nižšie.
//
// ⚠️ Značky sa vyberajú s ODSTUPOM V PIXELOCH, nie rovnomerne z poľa: 1236 bodov leží na
// slovenských trasách, takže výber z poľa ich naukladá na seba. Odstup závisí od mierky,
// teda sa dá vyhodnotiť až po projekcii.
import { useMemo } from 'react';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { TRAIL_POI } from '@/data/trailPoi.generated';
import { WORLD_OUTLINE } from '@/data/worldOutline.generated';
import { POI_EMOJI, MARK_EMOJI, WORLD_RIM, FONT_EMOJI } from './mapnotes/markEmoji';
import { PACK_THEME as T } from './packTheme';
import { trailCountry } from '@/lib/countryGeo';

export type AtlasFrame = 'europe' | 'world' | 'home';

type Mark = { lat: number; lon: number; em: string; rim: string };

/* Lem nesie, KTO značku napísal (lock z 27. 8.): farebný = svorka, hnedý = bod zo sveta. */
const RIM_THREAT = '#C0392B';

/* Zóny, kam značka nesmie — nad ňou leží text karty. Podiely šírky/výšky. */
const SAFE_BOTTOM = 0.70;   // pod tým sú pilulky s číslami
const SAFE_TITLE_X = 0.46;  // vľavo hore stojí trojriadkový nadpis
const SAFE_TITLE_Y = 0.42;

const D2R = Math.PI / 180;
function merc(lat: number, lon: number): [number, number] {
  const x = (lon + 180) / 360;
  const s = Math.sin(Math.max(-85, Math.min(85, lat)) * D2R);
  return [x, 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)];
}

/** Rám v mercatorových jednotkách. Domovská krajina si ho berie z vlastného rozsahu,
 *  takže Slovák vidí Slovensko a Austrálčan Austráliu bez druhej verzie karty.
 *
 *  ⚠️ "Európa" je tu STREDNÁ Európa so širokým okolím (56,5..40,5 s. š. · -3,5..28 v. d.),
 *  nie celý kontinent od Islandu po Cyprus. Pri plnom zábere je Slovensko ~12 px široké,
 *  značky nemajú kde stáť a karta vyzerá prázdna — a to je presne opak toho, čo má hovoriť.
 */
function frameBox(frame: AtlasFrame, homeISO: string | null) {
  if (frame === 'world') return { x0: 0.02, x1: 0.98, y0: 0.10, y1: 0.82 };
  if (frame === 'europe') {
    const a = merc(56.5, -3.5), b = merc(40.5, 28.0);
    return { x0: a[0], x1: b[0], y0: a[1], y1: b[1] };
  }
  const rings = (homeISO && WORLD_OUTLINE[homeISO]) || [];
  let la0 = 90, la1 = -90, lo0 = 180, lo1 = -180;
  for (const r of rings) for (const p of r) {
    if (p[0] < la0) la0 = p[0];
    if (p[0] > la1) la1 = p[0];
    if (p[1] < lo0) lo0 = p[1];
    if (p[1] > lo1) lo1 = p[1];
  }
  if (la0 > la1) { const a = merc(56.5, -3.5), b = merc(40.5, 28.0); return { x0: a[0], x1: b[0], y0: a[1], y1: b[1] }; }
  const A = merc(la1, lo0), B = merc(la0, lo1);
  const mx = (B[0] - A[0]) * 0.30, my = (B[1] - A[1]) * 0.30;
  return { x0: A[0] - mx, x1: B[0] + mx, y0: A[1] - my, y1: B[1] + my };
}

export function PackAtlas({
  frame = 'europe',
  homeISO = null,
  width = 365,
  height = 340,
  pale = true,
  markSize = 30,
  maxMarks = 14,
}: {
  frame?: AtlasFrame;
  homeISO?: string | null;
  width?: number;
  height?: number;
  pale?: boolean;
  markSize?: number;
  maxMarks?: number;
}) {
  const view = useMemo(() => {
    const W = width, H = height;
    const f = frameBox(frame, homeISO);
    /* "cover" — rám sa zmestí do karty a prebytok sa oreže; inak by mapa mala prázdne pásy. */
    const spanX = Math.max(f.x1 - f.x0, (f.y1 - f.y0) * W / H);
    const spanY = spanX * H / W;
    const cx = (f.x0 + f.x1) / 2, cy = (f.y0 + f.y1) / 2;
    const P = (lat: number, lon: number): [number, number] => {
      const [x, y] = merc(lat, lon);
      return [(x - cx) / spanX * W + W / 2, (y - cy) / spanY * H + H / 2];
    };

    const occupied = new Set(HERO_TRAILS.map((t) => trailCountry(t)));

    /* Územie a susedia. Detailnejšie obrysy krajín s výletmi nechávame na /pack/map — tu by
       sa v tejto mierke aj tak nestihli prejaviť. */
    const land: string[] = [];
    const territory: string[] = [];
    for (const iso in WORLD_OUTLINE) {
      for (const ring of WORLD_OUTLINE[iso]) {
        let d = '';
        for (let i = 0; i < ring.length; i++) {
          const [x, y] = P(ring[i][0], ring[i][1]);
          d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        d += 'Z';
        (occupied.has(iso) ? territory : land).push(d);
      }
    }

    /* TRASY — len v ráme vlastnej krajiny.
       ⚠️ Odmerané: pri zábere strednej Európy má 6-kilometrová stopa na karte necelý pixel
       (celá trasa sa zmestí medzi súradnice 242,5 a 242,1) — do DOM-u sa tak sype 9 kB cesty,
       ktorú nikto neuvidí. Že tu svorka chodí, povie zlaté územie a labka, nie čiara. */
    let trails = '';
    if (frame === 'home') {
      for (const t of HERO_TRAILS) {
        const path = t.path;
        if (!path || path.length < 2) continue;
        const step = Math.max(1, Math.ceil(path.length / 12));
        let seg = '';
        for (let i = 0; i < path.length; i += step) {
          const [x, y] = P(path[i][0] as number, path[i][1] as number);
          seg += (seg ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        trails += seg;
      }
    }

    /* ZNAČKY — sada sa skladá STRIEDANÍM TYPOV, nie zoradením podľa zdroja.
       ⚠️ Bez toho ide do výberu najprv deväť vyhliadok z customPoi a na karte skončia dve
       rovnaké 👁️ vedľa seba — to sa nečíta ako mapa, ale ako chyba. Na tak malej ploche
       nesie informáciu ROZMANITOSŤ značiek, nie ich reálny počet. */
    const buckets = new Map<string, Mark[]>();
    const push = (m: Mark) => {
      const b = buckets.get(m.em);
      if (b) b.push(m); else buckets.set(m.em, [m]);
    };
    for (const t of HERO_TRAILS) {
      for (const p of t.customPoi || []) {
        const em = p.t === 'wildlife' ? MARK_EMOJI.wildlife
          : p.t === 'ticks' ? MARK_EMOJI.ticks
            : p.t === 'shelter' ? POI_EMOJI.shelter
              : POI_EMOJI.viewpoint;
        const rim = (p.t === 'wildlife' || p.t === 'ticks') ? RIM_THREAT : T.cardEdge;
        push({ lat: p.lat, lon: p.lon, em, rim });
      }
    }
    for (const p of TRAIL_POI) push({ lat: p.lat, lon: p.lon, em: POI_EMOJI[p.t], rim: WORLD_RIM });

    /* Vzácnejší typ ide prvý — vodopád povie o kraji viac než tristo-osemdesiata lavička. */
    const lists = [...buckets.values()].sort((a, b) => a.length - b.length);

    /* ⚠️ Body z OSM sú SVET, nie svorka (lem to hovorí, ale iba tomu, kto pravidlo pozná).
       Preto ide do každej obsadenej krajiny jedna LABKA so zlatým lemom — inak by karta
       ukazovala prístrešky a pramene a o svorke nepovedala nič. */
    const pool: Mark[] = [];
    const byCountry = new Map<string, [number, number][]>();
    for (const t of HERO_TRAILS) {
      const p0 = t.path?.[0];
      if (!p0) continue;
      const iso = trailCountry(t);
      const arr = byCountry.get(iso);
      if (arr) arr.push([p0[0] as number, p0[1] as number]); else byCountry.set(iso, [[p0[0] as number, p0[1] as number]]);
    }
    for (const [, pts] of byCountry) {
      const lat = pts.reduce((a, q) => a + q[0], 0) / pts.length;
      const lon = pts.reduce((a, q) => a + q[1], 0) / pts.length;
      pool.push({ lat, lon, em: MARK_EMOJI.note, rim: T.cardEdge });
    }
    for (let i = 0; pool.length < 600; i++) {
      let added = false;
      for (const arr of lists) {
        const m = arr[(i * 37) % arr.length];
        if (m) { pool.push(m); added = true; }
      }
      if (!added) break;
    }

    const R = markSize / 2;
    const marks: { x: number; y: number; em: string; rim: string }[] = [];
    for (const m of pool) {
      if (marks.length >= maxMarks) break;
      const [x, y] = P(m.lat, m.lon);
      if (x < R || y < R || x > W - R || y > H * SAFE_BOTTOM) continue;
      if (x < W * SAFE_TITLE_X && y < H * SAFE_TITLE_Y) continue;
      /* ⚠️ Striedanie typov v poole nestačí — väčšina bodov vypadne na kolízii alebo mimo
         bezpečnej zóny, takže sa dôjde do druhého kola a to isté emoji sa objaví dvakrát
         vedľa seba. Kým je z čoho vyberať, každá značka je iná. */
      if (marks.some((q) => q.em === m.em) && marks.length < 10) continue;
      let clash = false;
      for (const q of marks) {
        if ((q.x - x) ** 2 + (q.y - y) ** 2 < (markSize * 0.80) ** 2) { clash = true; break; }
      }
      if (clash) continue;
      marks.push({ x, y, em: m.em, rim: m.rim });
    }

    return { W, H, land, territory, trails, marks };
  }, [frame, homeISO, width, height, markSize, maxMarks]);

  const { W, H, land, territory, trails, marks } = view;
  /* ⚠️ Modrá musí byť na papyruse SÝTA. Bledomodrá vedľa papyrusovej zeme dá dve takmer
     zhodné svetlé plochy a mapa sa rozpustí — to bol pôvodný stav, ktorý Matej hlásil. */
  const sea = pale ? 'rgb(150,186,216)' : 'rgb(8,24,44)';
  const landFill = pale ? 'rgb(238,226,194)' : 'rgb(74,60,36)';
  const rimEm = Math.max(2, markSize * 0.089);
  const emPx = markSize * 0.57;

  return (
    <svg
      className="ts-atlas"
      viewBox={'0 0 ' + W + ' ' + H}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <filter id="atlas-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={sea} />
      {land.map((d, i) => (
        <path key={'l' + i} d={d} fill={landFill} stroke="rgba(106,76,32,0.75)" strokeWidth={1.1} strokeLinejoin="round" />
      ))}
      {territory.map((d, i) => (
        <g key={'t' + i}>
          <path d={d} fill="none" stroke="rgba(245,199,61,0.75)" strokeWidth={4.5} filter="url(#atlas-glow)" />
          <path d={d} fill="rgba(201,154,63,0.92)" stroke="#6E4E14" strokeWidth={1.6} strokeLinejoin="round" />
        </g>
      ))}
      {/* ⚠️ Fialová na zlatom území zaniká — je to farba podobnej sýtosti. Preto pod ňu ide
          tmavý podklad (to isté robí svetelný meč na mape cez TRAIL_LINE.edge) a navrch
          svetlý hrot; bez tej trojice je stopa v tejto mierke neviditeľná. */}
      {trails && (
        <>
          <path d={trails} fill="none" stroke="#170424" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
          <path d={trails} fill="none" stroke={T.tripPurple} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          <path d={trails} fill="none" stroke="#B36BFF" strokeWidth={1.2} strokeLinecap="round" opacity={0.9} />
        </>
      )}
      {marks.map((m, i) => (
        <g key={'m' + i}>
          <circle cx={m.x} cy={m.y} r={markSize / 2} fill="#FFFFFF" stroke={m.rim} strokeWidth={rimEm} />
          <text
            x={m.x}
            y={m.y + emPx * 0.36}
            textAnchor="middle"
            fontSize={emPx}
            fontFamily={FONT_EMOJI}
          >
            {m.em}
          </text>
        </g>
      ))}
    </svg>
  );
}
