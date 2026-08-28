// ════════════════════════════════════════════════════════════════════════════
// HEKTOROV HOTSPOT — lesk po psovi + bledá pulzujúca bodka + bublina
// ────────────────────────────────────────────────────────────────────────────
// Matej 28. 8. 2026:
//   „po načítaní cta osvietil hektora ako je osvietená dogma = taký lesk
//    a objavil by sa na ňom bledý hotspot ktorý by pulzoval, nič okaté ale
//    viditeľné"
//   „kliknutím na hotspot mohli otvoriť len jednoduchú bublinku nie panel
//    z lava, veď tam nebude vela textu — dať tam len 1-3 vety a jeho vek"
//
// 🔴 PREČO LESK A NIE DRUHÝ ORB: Hektorovi na tretej obrazovke UŽ horí
//    svätožiara (rozsvieti sa na pointe druhého výjavu). Druhé svetlo nad
//    hlavou by ju prebilo a z pointy predošlej obrazovky by ostala ozdoba.
//    Lesk je preto po celom psovi a bodka je malá, bledá a inde.
//
// 🔑 LESK JE PREVZATÝ Z KNIHY, NIE VYMYSLENÝ. ConstitutionBook má na obálke
//    dva efekty (.cb-halo + .cb-shimmer) a prenosné je to preto, že záblesk je
//    MASKOVANÝ OBRÁZKOM (mask: url(...)), takže svetlo ostane v siluete a nie
//    v obdĺžniku. Hektor je rovnaký PNG výrez, takže tá istá maska sadne bez
//    jediného vlastného čísla.
//
// ⚠️ VRSTVA MUSÍ ŽIŤ VNÚTRI .codex-bleed. Rozdelenie tretej obrazovky
//    (naklonenie a zväčšenie psa) je v OnePage zapísané selektorom
//    .op-root .codex-bleed .codex-hektor a --op-split sa nastavuje na bleede.
//    Súrodenec vedľa bleedu by premennú nezdedil a vrstva by sa od psa odlepila
//    presne v okamihu rozdelenia.
//
// ⚠️ ZAROVNANIE NESIE preserveAspectRatio, NIE VLASTNÁ MATEMATIKA — rovnaký
//    trik ako CodexHalo: SVG má ROVNAKÝ viewBox ako fotka (960 x 1080) a nesie
//    TÚ ISTÚ triedu .codex-hektor, takže LOCKED geometria (scale 1.08, origin
//    bottom right, mobilná vetva 1.352) platí naň bez prepočtu.
// ════════════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
import { hekthorAgeYears } from '@/lib/hektor';
import { pluralKey } from '@/lib/plural';
import { LAB } from '@/lib/labTheme';

/** Fotka, ktorou sa maskuje lesk. Musí to byť TÁ ISTÁ, čo kreslí ReligionLab. */
const HEKTOR_IMG = '/images/codex3-hektor-v1.png';

/**
 * Bodka v súradniciach fotky (960 x 1080) — líce za papuľou, pod uchom.
 * Matej 28. 8. 2026 poslal screenshot so šípkou myši: *„daj ten hotspot tam
 * kde mam sipku"*.
 *
 * 🔑 SÚRADNICA JE DOPOČÍTANÁ, NIE ODHADNUTÁ OD OKA. V screenshote sa dajú nájsť
 * dva body, ktoré poznám aj vo fotke — amber dúhovka oka (405, 589) a vtedajšia
 * bodka (500, 900). Z ich posunu vyjde mierka 1.1611 a otočenie -3.80°, čo sedí
 * s rotate(-4deg) v CSS; inverzia tej istej podobnosti položí špičku šípky na
 * (652, 792). Kontrola tretím bodom: ňufák (170, 707) má podľa nej padnúť na
 * (1051, 824) a v screenshote je na (1043, 838).
 */
const SPOT = { x: 652, y: 792 } as const;

/**
 * Veľkosť bodky. Matej 28. 8.: *„zvačši ho o 200% … lebo som si to ani
 * nevšimol"*. Jedno číslo, nie tri prepísané polomery — dolaďovanie má byť
 * zmena konštanty, nie prekreslenie SVG.
 */
const SPOT_K = 3;

/** Id rozostrenia pod bodkou. Konštanta, nie generované — vrstva je na stránke jediná. */
const GLOW_ID = 'codex-spot-glow';
const GRAD_ID = 'codex-spot-grad';

/** Koľko miesta okolo bodky je citlivé na klik (v jednotkách viewBoxu). */
const SPOT_HIT_R = 100;

/** Bublina: šírka a odsadenie od bodky v pixeloch obrazovky. */
const BUBBLE_W = 300;
const BUBBLE_GAP = 18;

/**
 * Hranica, pod ktorou bublina stojí v strede obrazovky. Zhodná s breakpointom
 * rozdelenia obrazovky v OnePage (min-width: 768px) — pod ním zvieratá nestoja
 * vedľa textu, ale pod ním, a pri bodke už nie je miesto na nič.
 */
const MOBILE_MAX = 768;

export const HEKTOR_SPOT_CSS = `
/* Obal má rovnaký rám ako .codex-bleed (v ňom bývajú obe zvieratá), ale leží
   NAD obsahom filmu — inak sa na bodku nedá kliknúť. Priepustný pre myš je
   celý; citlivý je len terč okolo bodky. */
.codex-flow .codex-spotlayer {
  /* Geometria je ZHODNÁ s .codex-flow .codex-bleed a musí ňou ostať — je to
     druhý rám tých istých zvierat. Sticky (nie absolute) preto, že vo filme sa
     scrolluje a absolútnemu rámu by spodná hrana odscrollovala do obrazu;
     záporný spodný okraj mu ruší miesto v toku.
     ⚠️ position sa opakuje aj kvôli tomu, že .lab-papyrus > * z vízie a príbehu
     prebíja slabšie selektory — rovnaký dôvod, aký má pri sebe zapísaný bleed.
     z-index 6 je jediný rozdiel: vrstva leží NAD obsahom filmu, inak sa na
     bodku nedá kliknúť. */
  position: sticky;
  top: 0;
  left: 0;
  height: 100dvh;
  margin-bottom: -100dvh;
  pointer-events: none;
  z-index: 6;
}
/* Lesk prejde po psovi raz za ~9.5 s. Pomalšie a slabšie než na obálke knihy:
   Hektor je na obrazovke oveľa väčší, takže rovnaký čas pôsobí rýchlejšie. */
.codex-shine {
  opacity: var(--op-spot, 0);
  pointer-events: none;
  z-index: 2;
  -webkit-mask: url(${HEKTOR_IMG}) bottom right / contain no-repeat;
  mask: url(${HEKTOR_IMG}) bottom right / contain no-repeat;
  transition: opacity 700ms ease 320ms;
}
.codex-shine::before {
  content: '';
  position: absolute;
  top: -25%;
  left: 0;
  width: 58%;
  height: 150%;
  /* 🔴 SMER GRADIENTU MUSÍ BYŤ CEZ ŠÍRKU PRUHU, NIE 105deg. Kniha má obálku
     takmer štvorcovú, takže jej 105deg vyzerá ako lesk. Tu je pruh 58 % šírky
     a 150 % výšky psa, čiže vysoký a úzky — pri 105deg vedie os gradientu
     takmer zvisle, prechod sa minie na výšku a po šírke ostane plocha bez
     zmeny. Odmerané: cez psa prešiel priehľadný obdĺžnik s ostrými zvislými
     hranami, nie svetlo. Sklon drží rotate() na transforme, nie uhol gradientu. */
  background: linear-gradient(to right, rgba(255,249,224,0) 0%, rgba(255,249,224,0.22) 50%, rgba(255,249,224,0) 100%);
  transform: translateX(-170%) rotate(6deg);
  animation: codexShineSweep 9.5s ease-in-out 1.2s infinite;
  will-change: transform;
}
@keyframes codexShineSweep {
  0% { transform: translateX(-170%) rotate(6deg); }
  40%, 100% { transform: translateX(330%) rotate(6deg); }
}

/* Bodka. Vrstva je priepustná pre myš, citlivý je len terč okolo bodky —
   inak by neviditeľný obdĺžnik cez pol obrazovky zožral kliky na CTA. */
.codex-spot {
  opacity: var(--op-spot, 0);
  pointer-events: none;
  z-index: 3;
  transition: opacity 700ms ease 480ms;
}
.codex-spot-hit { pointer-events: auto; cursor: pointer; }
.codex-spot-pulse {
  animation: codexSpotPulse 3.1s ease-in-out infinite;
  /* fill-box, inak by percentuálny stred rátal z celého viewBoxu fotky. */
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes codexSpotPulse {
  0%, 100% { opacity: 0.55; transform: scale(0.92); }
  50%      { opacity: 1;    transform: scale(1.12); }
}
/* PING — prstenec, ktorý sa rozbieha a zaniká. Samotné dýchanie bodky Matej
   prehliadol (*„urob mu aj pulz lebo som si to ani nevšimol"*): zmena krytia
   na jednom kruhu je pohyb, ktorý oko periférne nezachytí, rozbiehajúci sa
   kruh áno. */
.codex-spot-ping {
  transform-box: fill-box;
  transform-origin: center;
  animation: codexSpotPing 2.6s cubic-bezier(0.16, 0.7, 0.3, 1) infinite;
}
@keyframes codexSpotPing {
  0%   { transform: scale(0.6); opacity: 0; }
  18%  { opacity: 0.75; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* ── ZÁBLESK: LESK NEODÍDE, KÝM NEROZSVIETI BODKU ─────────────────────────
   Matej 28. 8.: *„posledný pulz ktorý by mal ísť už preč — tak osvieti ten
   hotspot a až potom pôjde ďalej, lebo mám pocit že sa to dá prehliadnuť
   a preletieť."* Bodka teda nesvieti vlastným tempom vedľa lesku — rozžiari
   sa presne vtedy, keď cez ňu pruh prechádza.

   🔑 FÁZA SA POČÍTA, NEHÁDA. Obe animácie majú rovnakú dĺžku aj odklad, takže
   držia krok navždy. Pruh je 58 % šírky rámu a jeho stred prejde od -501 do
   1587 px (rám 720 px) počas prvých 40 % cyklu; bodka leží na 652/960 fotky,
   teda na 489 px rámu ⇒ pruh je nad ňou po (489 + 501) / 2088 = 47 % svojej
   dráhy, čiže v 19 % cyklu. Preto je vrchol zábleskul práve tam.
   ⚠️ Kto zmení SPOT.x, šírku pruhu alebo dĺžku sweepu, prepočíta aj toto. */
.codex-spot-flare {
  transform-box: fill-box;
  transform-origin: center;
  animation: codexSpotFlare 9.5s ease-in-out 1.2s infinite;
}
@keyframes codexSpotFlare {
  0%, 12%   { opacity: 0;   transform: scale(0.8); }
  19%       { opacity: 0.9; transform: scale(1.35); }
  30%, 100% { opacity: 0;   transform: scale(1.6); }
}
/* Prehliadač kreslí okolo <circle> s tabindex pravouhlý modrý rám — na
   fotke psa vyzerá ako chyba. Vypína sa pre KAŽDÝ fokus (aj myšou), ale
   klávesnica dostane vlastný prstenec v našej farbe. */
.codex-spot-hit:focus { outline: none; }
.codex-spot-hit:focus-visible + .codex-spot-ring { opacity: 0.85; }

/* Bublina stojí na obrazovke (position: fixed), nie vo viewBoxe fotky —
   text vo viewBoxe by sa škáloval spolu s psom a pri rozdelení narástol. */
.codex-spot-bubble {
  position: fixed;
  z-index: 60;
  width: ${BUBBLE_W}px;
  max-width: calc(100vw - 32px);
  padding: 14px 16px 15px;
  border-radius: 14px;
  border: 1px solid ${LAB.edge};
  background: linear-gradient(160deg, #FDF6E6 0%, #F6E8CB 100%);
  box-shadow: ${LAB.shadow};
  color: ${LAB.inkBody};
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  animation: codexSpotIn 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes codexSpotIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.codex-spot-bubble--center {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: codexSpotInCenter 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes codexSpotInCenter {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 6px)); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}
.codex-spot-claim {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${LAB.goldInk};
  margin: 0 0 7px;
}
.codex-spot-body { margin: 0; }
.codex-spot-age { margin: 7px 0 0; color: ${LAB.inkSoft}; }

@media (prefers-reduced-motion: reduce) {
  .codex-shine::before { display: none; }
  .codex-spot-pulse { animation: none; opacity: 0.9; }
  .codex-spot-ping, .codex-spot-flare { display: none; }
  .codex-spot-bubble { animation: none; }
}
`;

/**
 * Vrstva stojí VEDĽA .codex-bleed (obal .codex-spotlayer) a rendruje sa iba
 * vo filme. Viditeľnosť riadi --op-spot, ktoré OnePage zapisuje až za
 * príchodom CTA.
 */
export default function HektorSpot() {
  const t = useT();
  const hitRef = useRef<SVGCircleElement | null>(null);
  const [at, setAt] = useState<{ left: number; top: number } | 'center' | null>(null);

  const close = useCallback(() => setAt(null), []);

  const open = useCallback(() => {
    const r = hitRef.current?.getBoundingClientRect();
    if (!r) return;
    // 🔴 NA MOBILE STOJÍ BUBLINA V STREDE OBRAZOVKY, NIE PRI BODKE. Zo psa je
    // tam pri rozdelení len pruh pri dolnej hrane, takže bublina prilepená
    // k bodke sadne rovno na hlavné CTA — odskúšané pri 390 px. Stred je
    // zároveň vzor, ktorý Matej vybral pre popup psa na guli.
    if (window.innerWidth < MOBILE_MAX) { setAt('center'); return; }
    // Jednorazové odčítanie pri KLIKU, nie meranie počas choreografie: bublina
    // sa nepodieľa na layoute psa, takže tu nevzniká slučka „nastav a zmeraj".
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const left = Math.max(16, Math.min(cx - BUBBLE_W - BUBBLE_GAP, window.innerWidth - BUBBLE_W - 16));
    const top = Math.max(16, Math.min(cy - 40, window.innerHeight - 190));
    setAt({ left, top });
  }, []);

  // Film sa hýbe, bublina stojí — pri scrolle by sa od psa odlepila, takže sa
  // zavrie. Je to zároveň cesta von bez krížika (ako popup psa na guli).
  useEffect(() => {
    if (!at) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [at, close]);

  const age = hekthorAgeYears();
  const hint = t('religion.spot.hint');

  return (
    <>
      <div className="codex-hektor codex-shine" aria-hidden />
      <svg
        className="codex-hektor codex-spot"
        viewBox="0 0 960 1080"
        preserveAspectRatio="xMaxYMax meet"
        focusable="false"
      >
        <defs>
          {/* Oblasť filtra musí byť veľkorysá, inak sa mäkký okraj odreže
              rovnou hranou (tá istá pasca ako v CodexHalo). */}
          <filter id={GLOW_ID} x="-120%" y="-120%" width="340%" height="340%">
            {/* ⚠️ ROZOSTRENIE MUSÍ RÁSŤ S BODKOU. Pevných 14 pri trojnásobnom
                polomere = takmer ostrý kruh, a plochá výplň s ostrou hranou sa
                na srsti číta ako ŠPINA, nie ako svetlo. Presne to zabilo
                zapečené halo kravy (viď CodexHalo). */}
            <feGaussianBlur stdDeviation={10 * SPOT_K} />
          </filter>
          {/* Vonkajšia žiara je RADIÁLNY PRECHOD, nie plochý kruh s rozostrením:
              prechod má skutočný dobeh do priehľadna, plochá výplň má hranicu
              vždy — pri veľkých polomeroch ju rozostrenie neschová. */}
          <radialGradient id={GRAD_ID}>
            <stop offset="0%" stopColor="#FFF6E2" stopOpacity="0.50" />
            <stop offset="42%" stopColor="#FFE9BE" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#FFE9BE" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${SPOT.x} ${SPOT.y})`}>
          <g className="codex-spot-pulse">
            {/* Žiara + jadro. Farba je teplá krémová z brandu, nie #fff —
                rovnaký dôvod, aký má pri sebe zapísaná svätožiara: studená
                biela na papyruse aj na srsti vyzerá ako škvrna. */}
            <circle r={46 * SPOT_K} fill={`url(#${GRAD_ID})`} />
            <circle r={8.5 * SPOT_K} fill="#FFF6E2" />
          </g>
          <circle className="codex-spot-ping" r={19 * SPOT_K} fill="none"
                  stroke="rgba(255,240,205,0.7)" strokeWidth={2.5 * SPOT_K} />
          <circle className="codex-spot-flare" r={34 * SPOT_K} fill={`url(#${GRAD_ID})`} />
          <circle
            ref={hitRef}
            className="codex-spot-hit"
            r={SPOT_HIT_R}
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-label={hint}
            onClick={() => { if (at) close(); else open(); }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              if (at) close(); else open();
            }}
          >
            <title>{hint}</title>
          </circle>
          <circle className="codex-spot-ring" r={SPOT_HIT_R - 8} fill="none" stroke="#FFF3D6" strokeWidth="3" opacity="0" />
        </g>
      </svg>

      {/* BUBLINA IDE PORTÁLOM DO <body>, nie do bleedu. Bleed má z-index
          a pointer-events: none, takže vnútri by bublina (a) ležala v cudzom
          stohovacom kontexte pod filmom a (b) zdedila nepriepustnosť pre myš.
          Rovnaký dôvod, pre ktorý ide portálom aj spodná lišta v OnePage. */}
      {at && createPortal(
        <div
          className={`codex-spot-bubble${at === 'center' ? ' codex-spot-bubble--center' : ''}`}
          style={at === 'center' ? undefined : { left: at.left, top: at.top }}
          role="dialog"
          aria-label={hint}
        >
          <p className="codex-spot-claim">{hint}</p>
          <p className="codex-spot-body">{t('religion.spot.body')}</p>
          <p className="codex-spot-age">{t(`religion.spot.age${pluralKey(age)}`, { n: age })}</p>
        </div>,
        document.body,
      )}
    </>
  );
}
