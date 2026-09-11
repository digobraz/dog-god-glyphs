// NÁHĽAD SKUTOČNÉHO VÝLETU — "takto si nakreslíš výlet" na karte /pack.
//
// Matej 11. 9. 2026: "nepáči sa mi to, je to generický AI slop... použi reálny nákres aj
// s mapovým podkladom (bez slov, len farebnosť, bez názvov) - Vršatecké Podhradie
// a daj tam rôzne emoji."
// Predtým: "trasa musí byť okruh a viac členitý" · "značky pri trase, nie mimo" ·
// "nie je vidno, zasahuje to do blokov a nadpisu, urob to len v priestore mimo obsahu".
//
// ⚠️ NIČ TU NIE JE VYMYSLENÉ. Stopa je skutočná trasa z datasetu (Vršatecké Podhradie —
// Cheľová, 6,7 km, zhodou okolností okruh), podklad sú skutočné plochy a chodníky
// z OpenStreetMap. Prvá verzia kreslila vymyslené vrstevnice a hladký oblúk — a presne to
// Matej pomenoval ako slop. Kreslená ilustrácia mapy sa sem nevracia.
//
// ⚠️ © OpenStreetMap prispievatelia (ODbL) — atribúcia na karte je PODMIENKA použitia dát,
// nie ozdoba. Nemazať ju ani pri ladení miesta.
//
// ⚠️ TVARY SÚ Z APPKY, NIE ILUSTRÁCIA — karta sľubuje presne to, čo človek po kliknutí uvidí:
//   · stopa  = svetelný meč z tripShared.tsx (TRAIL_PAINT: 11 / 7 / 4 / 1,8 px)
//   · kotva  = biely bod na fialovom halo r9 (anchorHalo v addtrip/GeometryPicker.tsx)
//   · značka = emoji v bielom kruhu, lem podľa noteTint() — farebný = svorka, hnedý = OSM
//   · 🅿️ sa kreslí HOLÉ, bez kruhu (Matejov lock z 20. 8.)
import { useEffect, useMemo, useRef, useState } from 'react';
import { HERO_TRAILS } from '@/data/heroTrails.generated';
import { TRAIL_BASE, BASE_TRAIL_ID, type BaseKind } from '@/data/trailBase.generated';
import { PACK_THEME as T, FONT_UI } from './packTheme';
import { MARK_EMOJI, POI_EMOJI, WORLD_RIM, FONT_EMOJI } from './mapnotes/markEmoji';
import { noteTint } from './mapnotes/NotePalette';

/* ── FARBY PODKLADU ────────────────────────────────────────────────────────────────────
   Papyrusová mapa, nie turistická: podklad musí ostať kartou DOGYPTu, nie výrezom z Mapy.com.
   Bez popiskov — tie v dátach ani nie sú, takže "bez slov, len farebnosť" vychádza samo. */
const FILL: Record<BaseKind, string | null> = {
  wood: '#CBD9B4',
  scrub: '#D9E0BE',
  meadow: '#E8E6C4',
  field: '#EFE5C6',
  rock: '#DCD2C1',
  water: '#A9C6DF',
  building: '#CFBEA2',
  stream: null,
  path: null,
  road: null,
};
const STROKE: Record<BaseKind, [string, number, string?] | null> = {
  wood: ['rgba(96,120,72,0.35)', 0.6],
  scrub: ['rgba(110,126,80,0.30)', 0.5],
  meadow: ['rgba(140,130,80,0.28)', 0.5],
  field: ['rgba(150,132,84,0.28)', 0.5],
  rock: ['rgba(120,102,80,0.55)', 0.8],
  water: ['rgba(70,110,150,0.45)', 0.6],
  building: ['rgba(120,96,66,0.55)', 0.5],
  stream: ['#7FA8C9', 1.4],
  path: ['rgba(140,104,60,0.65)', 0.9, '3 2.5'],
  road: ['rgba(150,118,70,0.75)', 1.6],
};
/** Poradie kreslenia — plochy, potom čiary. Bez neho leží chodník pod lesom. */
const Z: BaseKind[] = ['field', 'meadow', 'scrub', 'wood', 'rock', 'water', 'building', 'stream', 'road', 'path'];

/* ── ZNAČKY ────────────────────────────────────────────────────────────────────────────
   Matejova sada + dve navyše, aby bolo "rôznych emoji" dosť. `at` je podiel dĺžky trasy,
   `side` odsadenie kolmo na ňu (kladné = vpravo v smere chôdze).
   ⚠️ `side` drž tesne nad polovicou: pri 1,0 (teda o celý priemer značky) sa značka odlepí
   od stopy a Matej to hlásil ako "voda nie je na trase ani psí tip ani parkovisko". Značka
   sa má stopy skoro dotýkať — v appke stojí presne na svojom mieste pri chodníku.
   ⚠️ Lem nesie, KTO značku napísal (lock z 27. 8.): farebný = svorka, zemitá hnedá = bod
   z OpenStreetMap. Preto má prameň a prístrešok hnedý lem a had, kliešť aj tip farebný. */
const MARKS: {
  em: string;
  rim: string | null;
  at: number;
  side: number;
  /** Polomer oblasti v metroch. Značka potom nie je bod, ale územie — presne ako `radiusM`
   *  zápisu na mape (`MapNotesLayer` ho kreslí ako Circle s výplňou 0,12 a lemom 0,55). */
  areaM?: number;
  /** Hľadaj miesto od najpravejšieho bodu trasy, nie od `at`. */
  right?: boolean;
}[] = [
  { em: MARK_EMOJI.parking, rim: null, at: 0.005, side: -0.62 },          // 🅿️ štart pri aute
  { em: MARK_EMOJI.ticks, rim: noteTint('ticks'), at: 0.14, side: 0.6 }, // 🩸 kliešte
  { em: POI_EMOJI.cliff, rim: WORLD_RIM, at: 0.30, side: -0.6 },         // ⛰️ vršatecké bralá
  { em: POI_EMOJI.viewpoint, rim: WORLD_RIM, at: 0.42, side: 0.6 },      // 👁️ vyhliadka
  { em: MARK_EMOJI.note, rim: noteTint('note'), at: 0.56, side: -0.58 },  // 🐶 tip svorky
  { em: POI_EMOJI.shelter, rim: WORLD_RIM, at: 0.68, side: 0.62 },       // 🛖 prístrešok
  { em: MARK_EMOJI.water, rim: WORLD_RIM, at: 0.80, side: -0.6 },       // 💧 prameň
  /* 🐍 Matej 11. 9.: "hada daj do pravej časti a okolo neho urob okruh, ako to máme reálne
     v mape (oblasť)". Výskyt vretenice sa v appke značí ÚZEMÍM, nie bodom — je to riziko
     úseku, nie miesto. */
  { em: MARK_EMOJI.viper, rim: noteTint('viper'), at: 0.92, side: 0.6, areaM: 260, right: true },
];

/** Podiely dĺžky, kde sedia kotvy. Nie rovnomerne — človek klikne tam, kde trasa zabáča. */
const ANCHORS_AT = [0, 0.11, 0.26, 0.38, 0.52, 0.63, 0.75, 0.88];
/** Koľko z konca okruhu ostane prerušované = "toto práve dokresľuješ". */
const DRAFT_FROM = 0.9;

/* ── VOĽNÝ PRIESTOR NA KARTE ───────────────────────────────────────────────────────────
   Podklad vyplní celú kartu (je to mapa, smie ísť pod text), ale STOPA a ZNAČKY musia
   ostať tam, kde nie je obsah. Odmerané:
     široká karta 365 x 340 — nadpis vľavo hore po y 0,44 · pilulky od y 0,746
     úzka karta  468 x 270 — nadpis odskočí DOPRAVA (x 0,61+) · pilulky od y 0,68
   Preto dva rámy, nie jeden. */
/* ⚠️ Pás musí byť ŠTVORCOVEJŠÍ, nie len "kdekoľvek mimo textu". Vodorovný pruh 318 x 94 px
   pod nadpisom síce bol voľný, ale trasa je vyššia než širšia (2 x 1,6 km), takže sa doň
   zmestila ako 74 px zhluk — a značky boli väčšie než jej úseky. Voľné miesto v tvare,
   ktorý sedí obsahu, je PRAVÁ ČASŤ karty: nadpis siaha doprava len prvým riadkom. */
/* ⚠️ Od 11. 9. 2026 už na karte NIE SÚ tri bloky s číslami, takže spodná tretina je voľná
   a pás siaha skoro po dolný okraj (Matej: "je to moc malé, roztiahni to"). Hore ho drží
   nadpis: trasa začína pod jeho druhým riadkom, halo nadpisu zvyšok prekryje. */
/* ⚠️ Od 11. 9. 2026 je karta rozdelená na MAPKU HORE a CTA DOLE — trojriadkový nadpis
   z nej odišiel. Hore drží miesto už len rang v pravom rohu, dole lapisové tlačidlo.
   Mapa teda dostala takmer celú kartu. */
const WIDE_BAND = { x0: 0.06, x1: 0.96, y0: 0.14, y1: 0.80 };
const NARROW_BAND = { x0: 0.05, x1: 0.95, y0: 0.12, y1: 0.72 };
/** ⚠️ To isté číslo ako media query pre .ts-row v TripSpotlight.tsx. */
const NARROW_MAX = 860;

const D2R = Math.PI / 180;

export function PackTrailSketch({ markSize = 23 }: { markSize?: number }) {
  /* ⚠️ ROZMERY SA MERAJÚ, NEPREDPOKLADAJÚ. Karta je raz 365 x 340, inokedy 468 x 270; pri
     pevnom viewBoxe by preserveAspectRatio kresbu orezal a pás by prestal sedieť. Slučku to
     nespôsobí — SVG je absolútne pozicované cez celú kartu, jeho obsah na rodiča nevplýva. */
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

  const view = useMemo(() => {
    const trail = HERO_TRAILS.find((t) => t.id === BASE_TRAIL_ID);
    const path = (trail?.path ?? []) as [number, number][];
    if (path.length < 2) return null;

    const band = W <= NARROW_MAX && H < 320 ? NARROW_BAND : WIDE_BAND;

    /* Projekcia: trasa sa zmestí do voľného pásu, podklad ide tou istou mierkou ďalej pod text.
       Zemepisná dĺžka sa kráti ako cos(lat) — bez toho je trasa vodorovne roztiahnutá. */
    let la0 = 90, la1 = -90, lo0 = 180, lo1 = -180;
    for (const [la, lo] of path) {
      if (la < la0) la0 = la;
      if (la > la1) la1 = la;
      if (lo < lo0) lo0 = lo;
      if (lo > lo1) lo1 = lo;
    }
    const kx = Math.cos(((la0 + la1) / 2) * D2R);
    /* Od pásu si odhryzne rezervu na značky: sedia mimo stopy a bez nej by z pásu vytiekli
       práve tie, ktoré sú na kraji trasy. */
    const pad = markSize * 0.9;
    const bw = Math.max(40, (band.x1 - band.x0) * W - pad * 2);
    const bh = Math.max(40, (band.y1 - band.y0) * H - pad * 2);
    const scale = Math.min(bw / ((lo1 - lo0) * kx), bh / (la1 - la0));
    const cxDeg = (lo0 + lo1) / 2, cyDeg = (la0 + la1) / 2;
    const cxPx = (band.x0 + band.x1) / 2 * W, cyPx = (band.y0 + band.y1) / 2 * H;
    const P = (la: number, lo: number): [number, number] => [
      cxPx + (lo - cxDeg) * kx * scale,
      cyPx - (la - cyDeg) * scale,
    ];

    /* Podklad — zoskupený podľa druhu, aby sa dal kresliť v poradí Z. */
    const base = new Map<BaseKind, string[]>();
    for (const [kind, ring] of TRAIL_BASE) {
      let d = '';
      let visible = false;
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = P(ring[i][0], ring[i][1]);
        if (x > -60 && x < W + 60 && y > -60 && y < H + 60) visible = true;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      if (!visible) continue;
      if (FILL[kind]) d += 'Z';
      const arr = base.get(kind);
      if (arr) arr.push(d); else base.set(kind, [d]);
    }

    /* Stopa — rozdelená na hotovú časť a rozkreslený koniec. */
    const cut = Math.floor(path.length * DRAFT_FROM);
    const toD = (from: number, to: number) => {
      let d = '';
      for (let i = from; i < to; i++) {
        const [x, y] = P(path[i][0], path[i][1]);
        d += (i === from ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      return d;
    };
    const done = toD(0, cut);
    const draft = toD(cut - 1, path.length);

    const at = (f: number): [number, number] => {
      const i = Math.min(path.length - 1, Math.max(0, Math.round(f * (path.length - 1))));
      return P(path[i][0], path[i][1]);
    };
    /* Smer trasy v danom bode — značka sa odsadí KOLMO naň, takže sedí pri chodníku
       a neleží na ňom. */
    const normalAt = (f: number): [number, number] => {
      const i = Math.min(path.length - 2, Math.max(0, Math.round(f * (path.length - 1))));
      const [x1, y1] = P(path[i][0], path[i][1]);
      const [x2, y2] = P(path[i + 1][0], path[i + 1][1]);
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      return [-dy / len, dx / len];
    };

    const anchors = ANCHORS_AT.map(at);
    const cursor = at(1);

    /* ⚠️ Podiel dĺžky NIE JE vzdialenosť na obrazovke. Okruh sa vracia popri sebe, takže dve
       značky vzdialené 16 % trasy môžu skončiť na sebe (stalo sa kliešťu a bralám). Preto sa
       pri kolízii značka posunie ĎALEJ PO TRASE, nie ručne v konštantách — tie by sa pri
       prvej zmene trasy rozišli. */
    /* ⚠️ Kurzor ide do zoznamu PRVÝ a s väčším polomerom: šípka je väčšia než značka a stojí
       na konci trasy, takže bez toho na ňu sadne posledná značka (stalo sa hadovi). */
    const placed: { x: number; y: number; r: number }[] = [
      { x: cursor[0], y: cursor[1] + markSize * 0.5, r: markSize * 1.35 },
    ];
    const marks = MARKS.map((m) => {
      /* Hľadaj voľné miesto po CELEJ trase a v oboch stranách. Pri 24 krokoch sa stalo, že
         hadovi došli skôr, než našiel dieru, a ostal ležať na bralách (4 px od seba). */
      let best: { x: number; y: number } | null = null;
      let fallback = { x: 0, y: 0 };
      /* Značka označená `right` štartuje od najpravejšieho bodu trasy — inak by "vpravo"
         záviselo od toho, kde má trasa práve svoj `at`. */
      let from = m.at;
      if (m.right) {
        let bestX = -Infinity;
        for (let i = 0; i < path.length; i += 4) {
          const [px] = P(path[i][0], path[i][1]);
          if (px > bestX) { bestX = px; from = i / (path.length - 1); }
        }
      }
      outer: for (const side of [m.side, -m.side]) {
        for (let step = 0; step < 67; step++) {
          const f = (from + step * 0.015) % 1;
          const [px, py] = at(f);
          const [nx, ny] = normalAt(f);
          const x = px + nx * markSize * side;
          const y = py + ny * markSize * side;
          if (step === 0 && side === m.side) fallback = { x, y };
          const clash = placed.some((q) => (q.x - x) ** 2 + (q.y - y) ** 2 < (q.r + markSize * 0.55) ** 2);
          if (!clash) { best = { x, y }; break outer; }
        }
      }
      const pos = best ?? fallback;
      placed.push({ ...pos, r: markSize * 0.55 });
      /* Meter na pixel: jeden stupeň zemepisnej šírky je 111 320 m, `scale` je px na stupeň. */
      const areaR = m.areaM ? (m.areaM / 111320) * scale : 0;
      return { ...m, ...pos, areaR };
    });

    return { base, done, draft, anchors, cursor, marks };
  }, [W, H, markSize]);

  const R = markSize / 2;
  const rimW = Math.max(2, markSize * 0.089);
  const emPx = markSize * 0.57;

  return (
    <svg ref={ref} className="ts-atlas" viewBox={'0 0 ' + W + ' ' + H} aria-hidden>
      <defs>
        <filter id="sketch-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id="sketch-clip">
          <rect x="0" y="0" width={W} height={H} />
        </clipPath>
      </defs>

      <rect width={W} height={H} fill="#F3EAD3" />

      {view && (
        <g clipPath="url(#sketch-clip)">
          {/* PODKLAD — skutočné plochy a cesty z OSM, kreslené vo vlastných farbách. */}
          {Z.map((kind) => {
            const items = view.base.get(kind);
            if (!items) return null;
            const st = STROKE[kind];
            return (
              <g key={kind}>
                {items.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill={FILL[kind] ?? 'none'}
                    stroke={st ? st[0] : 'none'}
                    strokeWidth={st ? st[1] : 0}
                    strokeDasharray={st && st[2] ? st[2] : undefined}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            );
          })}

          {/* STOPA = svetelný meč, tie isté štyri vrstvy ako na mape. */}
          <path d={view.done} fill="none" stroke="#170424" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
          <path d={view.done} fill="none" stroke={T.tripPurple} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} filter="url(#sketch-glow)" />
          <path d={view.done} fill="none" stroke="#B36BFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <path d={view.done} fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={0.97} />

          {/* ROZKRESLENÝ KONIEC — bez neho je to hotová trasa a karta hovorí "pozri, čo tu je";
              s ním hovorí "toto práve dokresľuješ, ostáva jeden klik". */}
          <path d={view.draft} fill="none" stroke="#7A2FBF" strokeWidth={2.4} strokeDasharray="6 6" strokeLinecap="round" opacity={0.9} />

          {view.anchors.map(([x, y], i) => (
            <g key={'a' + i}>
              <circle cx={x} cy={y} r={9} fill={T.tripPurple} opacity={0.55} />
              <circle cx={x} cy={y} r={4.2} fill="#FFFFFF" stroke={T.tripPurple} strokeWidth={1.6} />
            </g>
          ))}

          {/* ⚠️ KURZOR MUSÍ BYŤ VIDIEŤ NAD MAPOU (Matej 11. 9.: "šípka teraz splýva a zaniká").
              Biela šípka s tenkou linkou zaniká na svetlom podklade aj na fialovej stope —
              preto je väčšia, má tmavú výplň a pod ňou svetlé halo, ktoré ju odlepí od
              čohokoľvek, na čom práve stojí. */}
          <g>
            <circle cx={view.cursor[0]} cy={view.cursor[1]} r={15} fill="none" stroke="#7A2FBF" strokeWidth={1.6} opacity={0.6} />
            <circle cx={view.cursor[0]} cy={view.cursor[1]} r={5} fill="#FFFFFF" stroke={T.tripPurple} strokeWidth={2} />
            <path
              d={'M' + (view.cursor[0] + 7) + ' ' + (view.cursor[1] + 7) + ' l0 27 l7 -7 l6 13 l6 -3 l-6 -13 l10 0 Z'}
              fill="none" stroke="#FBF5E6" strokeWidth={5.5} strokeLinejoin="round" opacity={0.95}
            />
            <path
              d={'M' + (view.cursor[0] + 7) + ' ' + (view.cursor[1] + 7) + ' l0 27 l7 -7 l6 13 l6 -3 l-6 -13 l10 0 Z'}
              fill="#2a1608" stroke="#2a1608" strokeWidth={1} strokeLinejoin="round"
            />
          </g>

          {/* OBLASTI — kreslia sa pod značkami, rovnakým receptom ako `MapNotesLayer`:
              farba z noteTint, výplň 0,12, lem 0,55 pri hrúbke 1,5. */}
          {view.marks.map((m, i) =>
            m.areaR > 0 && m.rim ? (
              <circle
                key={'ar' + i}
                cx={m.x}
                cy={m.y}
                r={m.areaR}
                fill={m.rim}
                fillOpacity={0.12}
                stroke={m.rim}
                strokeOpacity={0.55}
                strokeWidth={1.5}
              />
            ) : null,
          )}

          {view.marks.map((m, i) =>
            m.rim ? (
              <g key={'m' + i}>
                <circle cx={m.x} cy={m.y} r={R} fill="#FFFFFF" stroke={m.rim} strokeWidth={rimW} />
                <text x={m.x} y={m.y + emPx * 0.36} textAnchor="middle" fontSize={emPx} fontFamily={FONT_EMOJI}>
                  {m.em}
                </text>
              </g>
            ) : (
              <text key={'m' + i} x={m.x} y={m.y + emPx * 0.42} textAnchor="middle" fontSize={markSize * 0.72} fontFamily={FONT_EMOJI}>
                {m.em}
              </text>
            ),
          )}
        </g>
      )}

      {/* ⚠️ ATRIBÚCIA JE PODMIENKA POUŽITIA DÁT (ODbL), nie ozdoba. Nemazať. */}
      <text
        x={W - 8}
        y={H - 6}
        textAnchor="end"
        fontSize={7.5}
        fontFamily={FONT_UI}
        fill="rgba(90,70,40,0.55)"
        letterSpacing="0.04em"
      >
        © OpenStreetMap
      </text>
    </svg>
  );
}
