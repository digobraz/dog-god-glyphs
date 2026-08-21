import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import createGlobe from 'cobe';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PACK_THEME, FONT_TITLE, FONT_UI } from './packTheme';
import { Ranking, RankingBoardsModal } from './Ranking';
import { TransparentStats } from './TransparentStats';
import { countryCentroid, countryISO2 } from '@/lib/countryGeo';
import dogSilhouette from '@/assets/dogypt-logo-mobile.png';
import { useT, useLang } from '@/i18n/LanguageContext';
import { localizeBreed } from '@/lib/breedDisplay';

const T = PACK_THEME;

// Severka pyramída (zdroj: plany/severka.md) — swajpovateľné míľniky pod guľou.
// Veľké číslo členov je fixné, swajp mení len názov + cieľ + % (a prstenec sa sync-ne).
// nameKey → `t('pack.globe.milestone<X>')` (preklad pri renderi). Prahy = kánon, nemenné.
const MILESTONES = [
  { nameKey: 'pack.globe.milestoneFounders', target: 1_000 },
  { nameKey: 'pack.globe.milestonePack', target: 10_000 },
  { nameKey: 'pack.globe.milestoneNation', target: 100_000 },
  { nameKey: 'pack.globe.milestoneDynasty', target: 1_000_000 }, // 1M Heroglyfov otvára II. dynastiu; každý ďalší milión = ďalšia dynastia (kánon: ústava čl. 1.3)
] as const;

const RING_R = 47;
const CIRC = 2 * Math.PI * RING_R;
const ARC_LEN = CIRC * 0.75; // 270° gauge — medzera dole, kde sedí % text
const GOLD: [number, number, number] = [0.85, 0.6, 0.2]; // markerColor fallback (cobe default)
const PURPLE: [number, number, number] = [0.06, 0.20, 0.65]; // owner pin (Egyptian blue #1034A6, pulses)
const PIN: [number, number, number] = [0.16, 0.13, 0.07]; // top-country pins (dark ink on beige)
const OWNER_BASE = 0.13; // owner marker base size; render loop pulses it for visibility

interface CountryRow {
  country: string;
  count: number;
}

interface BreedRow {
  breed: string;
  count: number;
}

interface GlobePulseProps {
  total: number;
  topCountries: CountryRow[];
  topBreeds?: BreedRow[];
  ownerCountry?: string | null;
}

function useCountUp(target: number, duration = 1600): number {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);
  return val;
}

// ─────────────────────────────────────────────────────────────────────────
// cobe globe — dark-warm globe on the beige card with a SLOW idle auto-spin
// (rAF loop). prefers-reduced-motion → single static render, zero idle cost.
// Drag to rotate pauses the spin and resumes from where you left it. Gold pin.
// ─────────────────────────────────────────────────────────────────────────
const INIT_PHI = 4.7; // Europe / Africa faces front (owner region) at rest
const THETA = 0.28;
const SPIN = 0.0016; // rad/frame ≈ one slow rotation per ~65s

function PackGlobe({
  topCountries,
  ownerCountry,
}: {
  topCountries: CountryRow[];
  ownerCountry?: string | null;
}) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null);
  const pointerStart = useRef<number | null>(null);
  const phiRef = useRef(INIT_PHI);
  const dragPhi = useRef(0);

  // Markers: top countries (warm) + owner (bright gold, bigger, drawn last).
  const ownerISO = countryISO2(ownerCountry);
  const markers = useMemo(() => {
    const max = Math.max(1, ...topCountries.map((r) => r.count));
    const out: { location: [number, number]; size: number; color: [number, number, number]; owner?: boolean }[] = [];
    for (const r of topCountries) {
      if (ownerISO && countryISO2(r.country) === ownerISO) continue; // owner drawn separately
      const c = countryCentroid(r.country);
      if (!c) continue;
      out.push({ location: c, size: 0.04 + (r.count / max) * 0.05, color: PIN });
    }
    const oc = countryCentroid(ownerCountry);
    if (oc) out.push({ location: oc, size: OWNER_BASE, color: PURPLE, owner: true });
    return out;
  }, [topCountries, ownerCountry, ownerISO]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = e.clientX;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  }, []);
  const onPointerUp = useCallback(() => {
    if (pointerStart.current !== null) {
      phiRef.current += dragPhi.current;
      dragPhi.current = 0;
    }
    pointerStart.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerStart.current !== null) {
      dragPhi.current = (e.clientX - pointerStart.current) / 120;
      // no manual draw — the rAF loop picks up dragPhi every frame
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function init() {
      const w = canvas.offsetWidth;
      if (w === 0 || globe) return;
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: w * 2,
        height: w * 2,
        phi: phiRef.current,
        theta: THETA,
        dark: 0, // dark:0 → beige ocean (baseColor) + DARK continents + soft shadow
        diffuse: 1.3,
        mapSamples: 16000,
        mapBrightness: 9, // crisp black continents
        mapBaseBrightness: 0, // keep the shadow side dark
        baseColor: [0.99, 0.96, 0.88], // ≈ card beige → sphere looks transparent
        markerColor: GOLD,
        glowColor: [0.12, 0.1, 0.06], // dark, subtle aura
        markerElevation: 0,
        markers,
      });
      globeRef.current = globe;

      const ownerMarker = markers.find((m) => m.owner);

      if (reduceMotion) {
        globe.update({ phi: phiRef.current, theta: THETA }); // single static render
      } else {
        let t = 0;
        const render = () => {
          if (pointerStart.current === null) phiRef.current += SPIN; // idle slow spin; paused while dragging
          // Pulse the owner pin (size + subtle) so it reads as "you are here".
          if (ownerMarker) {
            t += 1;
            ownerMarker.size = OWNER_BASE + 0.045 * (0.5 + 0.5 * Math.sin(t * 0.07));
          }
          globe!.update({ phi: phiRef.current + dragPhi.current, theta: THETA, markers });
          raf = requestAnimationFrame(render);
        };
        raf = requestAnimationFrame(render);
      }

      requestAnimationFrame(() => {
        if (canvas) canvas.style.opacity = '1';
      });
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (globe) globe.destroy();
      globeRef.current = null;
    };
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerMove={onPointerMove}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'grab',
        opacity: 0,
        transition: 'opacity 1.1s ease',
        contain: 'layout paint size',
        touchAction: 'pan-y',
      }}
      aria-label={t('pack.globe.ariaGlobe')}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Swajpovateľný míľnik pod guľou. Veľké číslo členov ostáva fixné hore; tu sa
// mení len názov fázy + cieľ + %. Swipe (pointer dx) + chevrony + bodky.
// ─────────────────────────────────────────────────────────────────────────
function MilestoneSwiper({
  total,
  idx,
  pct,
  onGo,
}: {
  total: number;
  idx: number;
  pct: number;
  onGo: (i: number) => void;
}) {
  const t = useT();
  const startX = useRef<number | null>(null);
  const wheelLock = useRef(0);
  const m = MILESTONES[idx];
  const achieved = total >= m.target;
  const last = MILESTONES.length - 1;

  const chevStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 999,
    background: 'rgba(0,0,0,0.30)',
    border: '1.5px solid rgba(245,199,61,0.45)',
    color: 'hsl(45 95% 92%)',
  };

  const onDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (dx > 30) onGo(idx - 1);
    else if (dx < -30) onGo(idx + 1);
  };
  // Touchpad — horizontálny two-finger swipe = wheel deltaX (debounced 1 krok)
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 16) return;
    const now = Date.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 420;
    onGo(idx + (e.deltaX > 0 ? 1 : -1));
  };

  return (
    <div className="w-full" style={{ maxWidth: 360, marginTop: -18 }}>
      {/* Label — nad bodkami */}
      <div
        style={{
          fontFamily: FONT_UI,
          fontWeight: 500,
          fontSize: 9.5,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: T.inkWarm,
          textAlign: 'center',
          marginBottom: 9,
        }}
      >
        {t('pack.globe.roadToMillion')}
      </div>

      {/* Bodky — NAD rámikom (na béžovej).
          ⚠️ Klikací cieľ je BUTTON s paddingom (12 × 32 px), vizuálna bodka je SPAN vnútri.
          Samotných 6 px sa na dotyk netrafí. Padding je vykompenzovaný negatívnym marginom
          kontajnera (13 hore, 13 dole z pôvodných 10), takže bodky sedia opticky tam, kde
          sedeli — layout sa nehýbe.
          ⚠️ `gap` je NULA zámerne: 3 px padding z každej strany dá medzi bodkami presne tých
          6 px, ktoré tam boli s `gap-1.5`. Ponechať triedu aj padding = dvojnásobný rozostup. */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 0, marginTop: -13, marginBottom: -3, position: 'relative', zIndex: 2 }}
      >
        {MILESTONES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={t('pack.globe.ariaMilestone', { n: i + 1 })}
            onClick={() => onGo(i)}
            style={{
              display: 'block',
              border: 'none',
              padding: '13px 3px',
              background: 'transparent',
              cursor: 'pointer',
              lineHeight: 0,
            }}
          >
            <span
              style={{
                display: 'block',
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: i === idx ? T.accentGold : 'rgba(31,26,14,0.22)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          </button>
        ))}
      </div>

      {/* Rámik — tmavý modro-čierno-zlatý `--brand-gradient` (ako blok ROZŠÍR SVORKU),
          kompaktný; celý swipovateľný.
          ⚠️ NIE fialová — `--brand-gradient` je od 2026-06-15 `#1034A6` (egyptská modrá)
          → `#0a0805` → `#C99A3F`. Komentáre, ktoré tu hovorili „fialovo-zlatá", boli
          zdedené z pôvodnej palety a zavádzali. */}
      <div
        onPointerDown={onDown}
        onPointerUp={onUp}
        onWheel={onWheel}
        className="select-none"
        style={{
          borderRadius: 16,
          padding: '11px 12px',
          background: 'var(--brand-gradient)',
          border: '1.5px solid rgba(201,154,63,0.34)',
          // Tieň bol fialový (124,58,237) z pôvodnej palety — gradient je pritom modro-zlatý,
          // takže žiaril inou farbou než plocha, na ktorej ležal.
          boxShadow: '0 16px 36px -20px rgba(16,52,166,0.6)',
          touchAction: 'pan-y',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label={t('pack.globe.ariaPrev')}
            onClick={() => onGo(idx - 1)}
            disabled={idx === 0}
            className="inline-flex items-center justify-center shrink-0"
            style={{ ...chevStyle, opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? 'default' : 'pointer' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 text-center" style={{ cursor: 'grab' }}>
            <div
              style={{
                fontFamily: FONT_UI,
                fontWeight: 500,
                fontSize: 10.5,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: 'hsl(45 90% 84%)',
                marginBottom: 4,
              }}
            >
              {t(m.nameKey)}
            </div>

            <div key={idx} style={{ animation: 'ms-fade 0.35s ease' }}>
              {achieved ? (
                <div
                  className="inline-flex items-center justify-center gap-1.5"
                  style={{
                    fontFamily: FONT_TITLE,
                    fontSize: 'clamp(19px, 4.6vw, 24px)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'hsl(45 96% 90%)',
                  }}
                >
                  <Check className="h-5 w-5" style={{ color: 'hsl(45 96% 88%)' }} />
                  {t('pack.globe.achieved')}
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 'clamp(26px, 5.6vw, 33px)',
                    fontWeight: 600,
                    lineHeight: 1,
                    color: 'hsl(45 97% 92%)',
                    textShadow: '0 2px 12px rgba(16,52,166,0.5)',
                  }}
                >
                  {pct < 0.1 ? pct.toFixed(2) : pct.toFixed(1)}%
                </div>
              )}
              <div
                style={{
                  // JetBrains Mono odišiel 12.8.2026: je to hlas AINUBISA (stroj) a tu bol
                  // štvrtým fontom na jednej stránke. Číslo = dáta → Space Grotesk.
                  fontFamily: FONT_UI,
                  fontSize: 10.5,
                  letterSpacing: '0.04em',
                  color: 'hsl(45 40% 90% / 0.8)',
                  marginTop: 4,
                }}
              >
                {total.toLocaleString('en-US')} / {m.target.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label={t('pack.globe.ariaNext')}
            onClick={() => onGo(idx + 1)}
            disabled={idx === last}
            className="inline-flex items-center justify-center shrink-0"
            style={{ ...chevStyle, opacity: idx === last ? 0.3 : 1, cursor: idx === last ? 'default' : 'pointer' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GlobePulse({ total, topCountries, topBreeds = [], ownerCountry }: GlobePulseProps) {
  const t = useT();
  const { lang } = useLang();
  const animated = useCountUp(total);

  // Modál s OBOMA rebríčkami — otvárajú ho obe tlačidlá „Zobraziť všetko".
  const [boardsOpen, setBoardsOpen] = useState(false);
  const countryRows = useMemo(
    () => topCountries.map((r) => ({ label: r.country, count: r.count })),
    [topCountries],
  );
  const breedRows = useMemo(
    () => topBreeds.map((r) => ({ label: localizeBreed(r.breed, lang), count: r.count })),
    [topBreeds, lang],
  );

  // Swajpovateľný míľnik — default = prvý nesplnený. Sync-uje prstenec aj % dole.
  const activeIdx = (() => {
    const i = MILESTONES.findIndex((m) => total < m.target);
    return i === -1 ? MILESTONES.length - 1 : i;
  })();
  const [msIdx, setMsIdx] = useState(activeIdx);
  const userMoved = useRef(false);
  useEffect(() => {
    if (!userMoved.current) setMsIdx(activeIdx); // jump na aktívny míľnik keď dorátajú staty
  }, [activeIdx]);
  const goMs = useCallback((i: number) => {
    userMoved.current = true;
    setMsIdx(Math.max(0, Math.min(MILESTONES.length - 1, i)));
  }, []);

  const active = MILESTONES[msIdx];
  const msPct = Math.min(100, (total / active.target) * 100); // progress k vybranému míľniku
  const arcPct = total > 0 ? Math.max(msPct, 1.2) : 0; // viditeľný náznak aj pri pár členoch

  return (
    <section
      className="pack-card-hover w-full"
      style={{
        background: T.cardGrad,
        borderRadius: 16,
        padding: '26px 24px',
        border: `1.5px solid ${T.cardEdge}`,
        boxShadow: T.cardShadow,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 18% 0%, rgba(201, 154, 63, 0.12) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Nadpis bloku = jedno slovo KOMUNITA (Matej 12.8.2026: „namiesto DOGYPT národ daj
          len KOMUNITA"). Predtým tu bolo lockup [čierne logo DOGYPT] + kurzívou „národ" —
          jediný nadpis na homepage, ktorý bol obrázok a kurzíva; ostatné bloky majú Cinzel
          700 uppercase. Zmena teda zároveň sedí do zjednotenia DNA.
          ⚠️ Slovo „Národ" NEZANIKLO — ostáva ako názov 100k fázy pyramídy v páse míľnikov
          nižšie (`pack.globe.milestoneNation`, kánon `plany/severka.md`). */}
      <div className="relative w-full flex flex-col items-center" style={{ marginBottom: 22 }}>
        <h2
          style={{
            margin: 0,
            lineHeight: 1,
            fontFamily: FONT_TITLE,
            fontWeight: 700,
            fontSize: 'clamp(18px, 3.8vw, 26px)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.inkStrong,
          }}
        >
          {t('pack.globe.communityTitle')}
        </h2>
        <div
          aria-hidden
          style={{
            width: 54,
            height: 1,
            background: T.accentGold,
            opacity: 0.5,
            margin: '12px auto 0',
          }}
        />
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        {/* LEFT — rotujúca planéta + counter cez ňu */}
        <div className="flex flex-col items-center">
          <div
            className="relative mx-auto"
            style={{ width: '100%', maxWidth: 360, aspectRatio: '1 / 1' }}
          >
            {/* globe — zmenšený dovnútra, aby progress prstenec sedel okolo neho */}
            <div style={{ position: 'absolute', inset: '8%' }}>
              <PackGlobe topCountries={topCountries} ownerCountry={ownerCountry} />
            </div>

            {/* Progress prstenec — modro-zlatý (`--brand-gradient`), 270° gauge s medzerou dole */}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              className="absolute inset-0"
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <defs>
                <linearGradient id="packArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  {/* Egyptská modrá → zlatá, teda tá istá dvojica ako `--brand-gradient`.
                      Do 12.8.2026 tu začínala fialová #7c3aed — jediná fialová plocha,
                      ktorá na homepage ešte svietila po tom, čo brand fialovú opustil
                      15.6.2026 (`T.partHek` = #2E5FD0). */}
                  <stop offset="0%" stopColor="#1034A6" />
                  <stop offset="100%" stopColor="#C99A3F" />
                </linearGradient>
              </defs>
              <g transform={`rotate(135 50 50)`}>
                <circle
                  cx="50"
                  cy="50"
                  r={RING_R}
                  fill="none"
                  stroke={T.hairline}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeDasharray={`${ARC_LEN} ${CIRC}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_R}
                  fill="none"
                  stroke="url(#packArcGrad)"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeDasharray={`${(ARC_LEN * arcPct) / 100} ${CIRC}`}
                  style={{ transition: 'stroke-dasharray 1.5s ease' }}
                />
              </g>
            </svg>

            {/* Counter overlay — cez planétu (zvýraznené pre čitateľnosť) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              style={{ pointerEvents: 'none' }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  width: '76%',
                  height: '76%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(252,245,226,0.96) 0%, rgba(252,245,226,0.74) 42%, rgba(252,245,226,0.20) 64%, transparent 77%)',
                }}
              />
              {/* Dog silhouette watermark — za číslom, priehľadný vodoznak */}
              <img
                aria-hidden
                src={dogSilhouette}
                alt=""
                style={{
                  position: 'absolute',
                  width: '46%',
                  height: 'auto',
                  opacity: 0.1,
                  filter: 'grayscale(1) brightness(0)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative">
                <div
                  style={{
                    fontFamily: FONT_UI,
                    fontWeight: 500,
                    fontSize: 9.5,
                    letterSpacing: '0.34em',
                    textTransform: 'uppercase',
                    color: T.ink,
                    marginBottom: 5,
                    lineHeight: 1.35,
                    textShadow: '0 1px 6px rgba(252,245,226,0.95)',
                  }}
                >
                  {t('pack.globe.counterDogyptians')}
                  <br />
                  {t('pack.globe.counterWorldwide')}
                </div>
                <div
                  style={{
                    // Číslo = DÁTA → Space Grotesk 600 (strop). Do 12.8.2026 to bol Cinzel
                    // 700, takže v jednom bloku stálo serifové 58px číslo nad bezserifovým
                    // percentom v páse míľnikov. Späť na Cinzel = jeden riadok, ak sa
                    // Matejovi rytina zdá lepšia než dáta.
                    fontFamily: FONT_UI,
                    fontSize: 'clamp(40px, 9.4vw, 58px)',
                    fontWeight: 600,
                    color: T.ink,
                    lineHeight: 1,
                    textShadow:
                      '0 2px 16px rgba(252,245,226,0.98), 0 0 3px rgba(252,245,226,0.95)',
                  }}
                >
                  {animated.toLocaleString('en-US')}
                </div>
              </div>
            </div>
          </div>

          {/* Swajpovateľný míľnik — pod planétou (sync s prstencom) */}
          <MilestoneSwiper total={total} idx={msIdx} pct={msPct} onGo={goMs} />

        </div>

        {/* RIGHT — dva rebríčky: krajiny (5) + plemená (3) → výška ≈ ľavý stĺpec.
            Obe „Zobraziť všetko" otvárajú TEN ISTÝ modál s oboma tabuľkami (Matej 13.8.) —
            preto stav sedí tu, nie v jednotlivých kartách. */}
        <div className="flex flex-col gap-6">
          <Ranking
            title={t('pack.globe.topCountries')}
            rows={countryRows}
            slots={5}
            kind="country"
            onViewAll={() => setBoardsOpen(true)}
          />
          <Ranking
            title={t('pack.globe.topBreeds')}
            rows={breedRows}
            slots={3}
            kind="breed"
            onViewAll={() => setBoardsOpen(true)}
          />
        </div>
      </div>

      {boardsOpen && (
        <RankingBoardsModal
          title={t('pack.rank.allBoards')}
          boards={[
            { title: t('pack.globe.topCountries'), rows: countryRows, kind: 'country' },
            { title: t('pack.globe.topBreeds'), rows: breedRows, kind: 'breed' },
          ]}
          onClose={() => setBoardsOpen(false)}
        />
      )}

      {/* Transparent Stats — the money in the open (current month) */}
      <TransparentStats />
    </section>
  );
}
