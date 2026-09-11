// NÁHĽAD KRESLENIA TRASY — "takto si nakreslíš výlet" na karte /pack.
//
// Matej 11. 9. 2026, po tom, čo videl mapu Európy so značkami: "tie emoji musíme zmeniť,
// vyzerá to hrozne :/ daj predsa len tú možnosť - nakresli svoj výlet... daj tam vodu,
// prístrešok, parkovisko, hada, kliešte aj tip."
// A o kolo skôr: "skôr by som tam ocenil nejaký detail klikania trasy, aby človek hneď vedel,
// že tá tvorba je easy... stačí jednoduchý detail obrázku mapy, nemusí byť interaktívny."
//
// Karta teda nehovorí o expanzii, ale o NÁSTROJI. Vedľajší zisk: kus terénu nemá národnosť,
// takže pre členov zo zahraničia netreba druhú verziu — na rozdiel od mapy Európy, ktorá
// tento komponent nahradila a parkuje ako PackAtlas.tsx.
//
// ⚠️ TVARY SÚ Z APPKY, NIE ILUSTRÁCIA. Karta sľubuje presne to, čo človek po kliknutí uvidí:
//   · stopa  = svetelný meč z tripShared.tsx (TRAIL_PAINT: 11 / 7 / 4 / 1,8 px)
//   · kotva  = biely bod na fialovom halo r9 (anchorHalo v addtrip/GeometryPicker.tsx)
//   · značka = emoji v bielom kruhu 28 px, lem 2,5 px (mapnotes/circleMark.ts)
//   · farby lemu z noteTint() — jeden zdroj s mapou, nie prepísané hodnoty
//
// ⚠️ LEM NESIE, KTO ZNAČKU NAPÍSAL (lock z 27. 8.): farebný = svorka, zemitá hnedá = bod
// z OpenStreetMap. Preto má prameň a prístrešok hnedý lem, kým had, kliešť a tip farebný.
// 🅿️ sa kreslí HOLÉ, bez kruhu — Matejov lock z 20. 8. ("biele P v modrom štvorci" tak
// vyzerá samotné emoji na každej platforme).
import { useEffect, useRef, useState } from 'react';
import { PACK_THEME as T } from './packTheme';
import { MARK_EMOJI, POI_EMOJI, WORLD_RIM, FONT_EMOJI } from './mapnotes/markEmoji';
import { noteTint } from './mapnotes/NotePalette';

/* ── GEOMETRIA OKRUHU ───────────────────────────────────────────────────────────────────
   Matej 11. 9. 2026: "trasa musí byť okruh a viac členitý a značky pri trase nie mimo
   + aj okruh pri hadovi".

   Okruh je parametrická krivka okolo stredu, polomer moduluje súčet troch sínusov —
   tým vznikne členitý tvar, ktorý sa vracia do seba. Rovnaké čísla drží aj rozmiestnenie
   značiek, takže značka SEDÍ NA TRASE a nie vedľa nej: obe si polohu počítajú z uhla. */
/* ⚠️ KRESBA ŽIJE LEN VO VOĽNOM PÁSE (Matej 11. 9.: "nie je vidno, zasahuje to do blokov
   a nadpisu, urob to len v priestore mimo obsahu").
   Odmerané na karte 365 x 340 px:
     rang      y 0,065 – 0,130
     nadpis    y 0,157 – 0,443   (prvý riadok siaha až po x 0,93)
     pilulky   od y 0,746 nadol
   Zostáva vodorovný pás y 0,45 – 0,74. Doň sa musí zmestiť okruh AJ so značkami, teda
   aj s ich polomerom (15 px = 0,044 výšky) a odsadením von.
   ⚠️ Polomery rátaj s ČLENITOSŤOU: radiusAt() ide až na 1,39, takže skutočný okruh je
   o tretinu väčší, než hovorí RX/RY. */
/* 🔴 DVE GEOMETRIE, LEBO KARTA MÁ DVE PODOBY. Na širokom okne stojí nadpis vľavo a voľný
   je vodorovný pás nad pilulkami; od 860 px nižšie sa karta zníži (270 px), nadpis odskočí
   DOPRAVA (text-align:right) a voľná je naopak ĽAVÁ polovica. Jedna sada pomerov preto
   nemôže sedieť na oboch — na mobile by kresba ležala pod nadpisom aj pod pilulkami.
   Odmerané na karte 468 x 270: nadpis x 286-443, y 56-146 · pilulky od y 184 · rang po y 45. */
const WIDE = { cx: 0.50, cy: 0.598, rx: 0.225, ry: 0.062 };
const NARROW = { cx: 0.31, cy: 0.42, rx: 0.15, ry: 0.13 };

/** ⚠️ To isté číslo ako media query pre .ts-row v TripSpotlight.tsx. Dva rôzne breakpointy
 *  vyrobia pásmo šírok, v ktorom neplatí ani jedna geometria. */
const NARROW_MAX = 860;

/** Členitosť. Prvý člen robí veľké zálivy, ďalšie dva zuby — samotná elipsa vyzerá ako
 *  logo, nie ako chodník. */
function radiusAt(a: number): number {
  return 1 + 0.20 * Math.sin(a * 3 + 0.5) + 0.12 * Math.sin(a * 5 - 1.1) + 0.07 * Math.sin(a * 8 + 2.2);
}

type Geo = typeof WIDE;

/** Bod na okruhu pre uhol (radiány), voliteľne odsadený von o podiel polomeru. */
function ringPt(a: number, g: Geo, W: number, H: number, out = 0): [number, number] {
  const r = radiusAt(a) * (1 + out);
  return [
    (g.cx + Math.cos(a) * g.rx * r) * W,
    (g.cy + Math.sin(a) * g.ry * r) * H,
  ];
}

const DEG = Math.PI / 180;

/* Značky sedia NA okruhu — uhol určuje miesto, malé odsadenie von ich odlepí od čiary.
   ⚠️ Ľavý horný oblúk (uhly okolo 200–260°) je pod trojriadkovým nadpisom, vpravo hore
   (okolo 300°) sedí rang. Tam značka nepatrí, aj keď je na trase. */
const MARK_ANGLES: { em: string; rim: string | null; a: number; out: number }[] = [
  { em: MARK_EMOJI.ticks, rim: noteTint('ticks'), a: 342 * DEG, out: 0.13 },  // 🩸 kliešte
  { em: POI_EMOJI.shelter, rim: WORLD_RIM, a: 22 * DEG, out: 0.14 },          // 🛖 prístrešok
  { em: MARK_EMOJI.note, rim: noteTint('note'), a: 66 * DEG, out: 0.13 },     // 🐶 tip svorky
  { em: MARK_EMOJI.water, rim: WORLD_RIM, a: 112 * DEG, out: 0.13 },          // 💧 prameň
  { em: MARK_EMOJI.viper, rim: noteTint('viper'), a: 158 * DEG, out: 0.14 },  // 🐍 had
  { em: MARK_EMOJI.parking, rim: null, a: 202 * DEG, out: 0.16 },             // 🅿️ holé, bez kruhu
];

/** Kde na okruhu sedia kotvy. Nie rovnomerne — v appke ich človek kladie tam, kde trasa
 *  zabáča, nie po metre. */
const ANCHOR_ANGLES = [320, 355, 35, 75, 115, 160, 205, 250].map((d) => d * DEG);

/** Kde sa okruh prestane kresliť plnou čiarou: posledný úsek je ten, ktorý človek práve
 *  dokresľuje, preto je prerušovaný a končí pri kurzore.
 *  ⚠️ MEDZERA MUSÍ VYJSŤ VPRAVO HORE. Kurzor je jediný prvok kresby, ktorý si pýta voľné
 *  miesto — a ľavé dve tretiny hornej polovice karty zaberá trojriadkový nadpis. Pri prvom
 *  pokuse skončil presne na slove VÝLET. */
const DRAWN_TO = 320 * DEG;

export function PackTrailSketch({
  markSize = 30,
  showCursor = true,
}: {
  markSize?: number;
  showCursor?: boolean;
}) {
  /* ⚠️ ROZMERY SA MERAJÚ, NEPREDPOKLADAJÚ. Karta je raz 365 x 340, inokedy 468 x 270 —
     pri pevnom viewBoxe by preserveAspectRatio kresbu orezal a pomery, v ktorých je pás
     spočítaný, by prestali platiť. Meranie tu slučku nespôsobí: SVG je absolútne
     pozicované cez celú kartu, takže jeho obsah na rozmer rodiča nevplýva. */
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 365, h: 340 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      if (r.width > 0 && r.height > 0) setBox({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = box.w, H = box.h;
  const g = W <= NARROW_MAX && H < 320 ? NARROW : WIDE;

  /* Stopa — hustý polygón po okruhu. Kreslí sa od -58° (prvá kotva) po DRAWN_TO;
     zvyšok do plného kruhu je prerušovaný, teda "toto práve dokresľuješ". */
  const START = 320 * DEG;
  const ringPath = (from: number, to: number) => {
    let out = '';
    const steps = Math.max(8, Math.round((to - from) / DEG / 3));
    for (let i = 0; i <= steps; i++) {
      const [x, y] = ringPt(from + (to - from) * (i / steps), g, W, H);
      out += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return out;
  };
  const d = ringPath(START, START + DRAWN_TO);
  const dRest = ringPath(START + DRAWN_TO, START + 360 * DEG);

  const anchors = ANCHOR_ANGLES.map((a) => ringPt(a, g, W, H));
  const R = markSize / 2;
  const rim = Math.max(2, markSize * 0.089);
  const emPx = markSize * 0.57;
  const [nx, ny] = ringPt(START + DRAWN_TO, g, W, H);

  /* Vrstevnice sú SÚSTREDNÉ a majú spoločný tvar — s vlastnou fázou šumu na každej hladine
     z toho je čmáranica, nie terén (odskúšané). */
  const contours: string[] = [];
  for (let k = 0; k < 6; k++) {
    let c = '';
    for (let i = 0; i <= 56; i++) {
      const a = i / 56 * Math.PI * 2;
      const wob = 1 + (0.18 * Math.sin(a * 3 + 0.6) + 0.09 * Math.sin(a * 5 - 1.2)) * (1 - k * 0.09);
      const r = (30 + k * 21) * wob;
      const x = W * 0.50 + Math.cos(a) * r * 1.22;
      const y = H * 0.44 + Math.sin(a) * r * 0.72;
      c += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    contours.push(c + 'Z');
  }

  return (
    <svg ref={ref} className="ts-atlas" viewBox={'0 0 ' + W + ' ' + H} aria-hidden>
      <defs>
        <filter id="sketch-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* podklad mapy — papyrusový, aby karta ostala v bledom šate */}
      <rect width={W} height={H} fill="#F6EDD8" />

      {/* lesný pás */}
      <path
        d={'M-10 ' + (H * 0.62) + ' Q' + (W * 0.22) + ' ' + (H * 0.46) + ' ' + (W * 0.44) + ' ' + (H * 0.60) +
          ' T' + (W + 10) + ' ' + (H * 0.54) + ' L' + (W + 10) + ' ' + (H + 10) + ' L-10 ' + (H + 10) + 'Z'}
        fill="rgba(61,122,78,0.13)"
      />

      {contours.map((c, i) => (
        <path key={'c' + i} d={c} fill="none" stroke="rgba(122,90,42,0.20)" strokeWidth={i === 2 ? 1.3 : 0.8} />
      ))}

      {/* potok */}
      <path
        d={'M' + (W * 0.02) + ' ' + (H * 0.88) + ' C' + (W * 0.28) + ' ' + (H * 0.80) + ' ' + (W * 0.34) + ' ' +
          (H * 0.62) + ' ' + (W * 0.62) + ' ' + (H * 0.58) + ' S' + (W * 0.92) + ' ' + (H * 0.44) + ' ' +
          (W * 1.02) + ' ' + (H * 0.40)}
        fill="none"
        stroke="rgba(40,90,160,0.34)"
        strokeWidth={2.2}
      />

      {/* stopa = svetelný meč (tie isté štyri vrstvy ako na mape) */}
      <path d={d} fill="none" stroke="#170424" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
      <path d={d} fill="none" stroke={T.tripPurple} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} filter="url(#sketch-glow)" />
      <path d={d} fill="none" stroke="#B36BFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.97} />

      {/* POSLEDNÝ ÚSEK OKRUHU — prerušovaný. Bez neho je to hotová trasa a karta hovorí
          "pozri, čo tu je"; s ním hovorí "toto práve dokresľuješ, ostáva jeden klik". */}
      {showCursor && (
        <path d={dRest} fill="none" stroke="#7A2FBF" strokeWidth={2.2} strokeDasharray="6 6" strokeLinecap="round" opacity={0.85} />
      )}

      {/* kotvy */}
      {anchors.map(([x, y], i) => (
        <g key={'a' + i}>
          <circle cx={x} cy={y} r={9} fill={T.tripPurple} opacity={0.55} />
          <circle cx={x} cy={y} r={4.2} fill="#FFFFFF" stroke={T.tripPurple} strokeWidth={1.6} />
        </g>
      ))}

      {/* kurzor na konci prerušovaného úseku */}
      {showCursor && (
        <g>
          <circle cx={nx} cy={ny} r={13} fill="none" stroke="#7A2FBF" strokeWidth={1.2} opacity={0.55} />
          <circle cx={nx} cy={ny} r={4.2} fill="#FFFFFF" stroke={T.tripPurple} strokeWidth={1.6} />
          <path
            d={'M' + (nx + 6) + ' ' + (ny + 6) + ' l0 19 l5 -5 l4 9 l4 -2 l-4 -9 l7 0 Z'}
            fill="#FFFFFF" stroke="#2a1608" strokeWidth={1} strokeLinejoin="round"
          />
        </g>
      )}

      {/* značky — sedia na okruhu, mierne odsadené von, aby neležali na čiare */}
      {MARK_ANGLES.map((m, i) => {
        const [x, y] = ringPt(m.a, g, W, H, m.out);
        if (!m.rim) {
          return (
            <text key={'m' + i} x={x} y={y + emPx * 0.42} textAnchor="middle" fontSize={markSize * 0.72} fontFamily={FONT_EMOJI}>
              {m.em}
            </text>
          );
        }
        return (
          <g key={'m' + i}>
            <circle cx={x} cy={y} r={R} fill="#FFFFFF" stroke={m.rim} strokeWidth={rim} />
            <text x={x} y={y + emPx * 0.36} textAnchor="middle" fontSize={emPx} fontFamily={FONT_EMOJI}>
              {m.em}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
