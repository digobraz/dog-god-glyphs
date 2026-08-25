// ════════════════════════════════════════════════════════════════════════════
// DOGYPT — PLANÉTA PSOV (LAB, dev-only)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 8. 2026: „nebolo by vidno kontinenty ale celá guľa by bola pokrytá
// miniatúrami psov… niekde v strede by bolo veľké logo dogypt a CTA… fotky by
// boli krásne zoradené symetricky na mriežke."
//
// ⚠️ NIE JE to zemeguľa. Žiadne kontinenty, žiadna mapa — guľa JE z fotiek.
// Preto tu nie je `cobe` (tá vie bodkovanú Zem + značky NAD ňou, nie povrch
// z dlaždíc) ani three.js: 100–150 malých obrázkov utiahnu CSS 3D transformy
// bez jediného kilobajtu navyše.
//
// Rozmiestnenie: rady po zemepisných šírkach, počet dlaždíc v rade škáluje
// s `cos(lat)` — inak sa pri póloch prekrývajú. Zaokrúhľuje sa na NÁSOBOK 4,
// aby dlaždice stáli na spoločných poludníkoch (0/90/180/270) a oko to čítalo
// ako mriežku, nie ako náhodný posyp. Rady sú zrkadlené okolo rovníka.
//
// Prázdne miesta neexistujú: keď je psov menej než dlaždíc, opakujú sa (rovnako
// ako `fillerDogsRef` v stene). Pri 71 psoch a ~120 dlaždiciach ide každý pes
// na guľu ~2×.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';

export interface PlanetDog {
  id: string;
  name: string;
  n: number | null;
  photo: string;
}

/** Polomer gule v px pri mierke 1. Skutočná veľkosť sa dolaďuje cez CSS scale. */
const R = 320;
/**
 * Aká časť rozostupu je samotná dlaždica (Matej 25. 8.: „fotky sa niekde križujú
 * a kolidujú, zmenši ich, nech je medzi nimi priestor").
 * ⚠️ VEĽKOSŤ DLAŽDICE SA NEZADÁVA RUČNE — počíta sa z rozostupu. Predtým tu bolo
 * pevných 92 px pri rozostupe 94 px, takže sa dlaždice dotýkali a v miestach, kde
 * ich perspektíva nakláňa, zajedali do seba.
 */
const TILE_FILL = 0.68;

/** Skúšobné veľkosti svorky (Matej 25. 8.: „zaujíma ma ako by to vyzeralo pri 500–1000 psoch"). */
const PRESETS = [71, 200, 500, 1000];

function rowCount(latDeg: number, spacing: number): number {
  const raw = (2 * Math.PI * R * Math.cos((latDeg * Math.PI) / 180)) / spacing;
  // MALÉ PRSTENCE (≤8 dlaždíc) sa na násobok 4 NEZAOKRÚHĽUJÚ (Matej 25. 8.:
  // „tá posledná rada… sú spojené rohmi (8), dajme len 7"). Dôvod je fyzický:
  // horná hrana dlaždice leží na MENŠOM kruhu než jej stred, takže pri póloch
  // sa rohy stretnú skôr než steny — a zaokrúhlenie 6,7 → 8 ich do seba dotlačí.
  // Pri takom malom prstenci zarovnanie na poludníky aj tak nikto neprečíta.
  if (raw <= 8) return Math.max(4, Math.round(raw));
  return Math.round(raw / 4) * 4; // násobok 4 → spoločné poludníky
}

/**
 * Rozloží `target` dlaždíc rovnomerne po guli.
 * Rozostup vychádza z plochy: guľa má 4πR², na jednu dlaždicu teda pripadá
 * 4πR²/N a strana toho štvorčeka je rozostup. Z neho sa odvodí VŠETKO ostatné —
 * veľkosť dlaždice, výška radu aj počet dlaždíc v rade. Preto sa dá počet psov
 * meniť jedným číslom a mriežka ostane mriežkou (žiadne magické konštanty).
 */
function buildSphere(target: number) {
  const spacing = Math.sqrt((4 * Math.PI * R * R) / Math.max(8, target));
  const tile = Math.max(8, Math.round(spacing * TILE_FILL));
  const latStep = (spacing / R) * (180 / Math.PI);
  const lats: number[] = [];
  const m = Math.floor(90 / latStep);
  for (let k = -m; k <= m; k++) {
    const lat = k * latStep;
    // Rad príliš blízko pólu vynechávame — dlaždica by tam ležala naplocho
    // a prekryla by pólovú.
    if (Math.abs(lat) <= 90 - latStep * 0.6) lats.push(lat);
  }
  return { spacing, tile, lats };
}

export function DogPlanetLab({
  dogs,
  open,
  onClose,
}: {
  dogs: PlanetDog[];
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  // Naklonenie DOLE na severný pól: Hektorova dlaždica leží na vrchole vodorovne,
  // takže pri pohľade spredu je iba čiara. Kladné rotateX = pozeráme sa na guľu
  // zhora a vrchol je vidno. (Predtým tu bolo −14, teda pohľad zdola.)
  // Naklonenie na SEVERNÝ pól (Hektor). ⚠️ ZÁPORNÉ rotateX = pozeráme sa zhora;
  // pri kladnom sa vrchol odkláňa od diváka a jeho dlaždica zmizne ako zadná
  // strana (backface). Overené meraním, nie odhadom.
  //
  // ⚠️ Otáčanie NEJDE cez React state. Pri 1000 dlaždiciach by `setSpin` v každom
  // snímku prekreslil celý zoznam — guľa sa sekala. Uhol žije v ref-e a zapisuje
  // sa priamo do `style.transform` gule; React sa o rotáciu vôbec nestará.
  const spinRef = useRef({ x: -24, y: 0 });
  const ballRef = useRef<HTMLDivElement>(null);
  // Skúšobný počet psov na guli — nie je to nastavenie appky, je to LABORATÓRNY
  // gombík: ukazuje, ako bude planéta vyzerať, keď svorka narastie.
  const [target, setTarget] = useState(200);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const autoRef = useRef(true);

  // Rozmiestnenie sa počíta RAZ pre daný zoznam psov — pri každom renderi by sa
  // dlaždice premiešali a guľa by pri otáčaní „blikala" inými psami.
  const { tiles, tile } = useMemo(() => {
    const { tile, lats, spacing } = buildSphere(target);
    if (dogs.length === 0) return { tiles: [], tile };
    const out: { key: string; dog: PlanetDog; lat: number; lon: number }[] = [];
    let i = 0;
    // SEVERNÝ PÓL = HEKTHOR (Matej 25. 8.: „horná dlaždica (póly) tam dajme
    // Hektora"). Vrchol gule je jediné miesto, ktoré sa pri otáčaní nehýbe —
    // rovnaká logika ako jeho pevná karta nad hero na stene.
    // Južný pól dostane bežného psa: nechať tam dieru vyzerá ako chyba, nie ako
    // zámer, a pri naklonení gule je jama vidno.
    // ⚠️ ZNAMIENKO: v CSS rastie os Y SMEROM DOLE, takže `rotateX(-lat)` posiela
    // lat +90 na SPODOK gule. Vrchol je preto lat −90 — overené meraním, nie
    // odhadom (prvý pokus mal Hektora na dne a bol z neho 13 px pásik).
    const hektor = dogs.find(d => d.n === 1) ?? dogs[0];
    out.push({ key: 'pole-top', dog: hektor, lat: -90, lon: 0 });
    for (const lat of lats) {
      const count = rowCount(lat, spacing);
      for (let c = 0; c < count; c++) {
        out.push({
          key: `${lat}:${c}`,
          dog: dogs[i % dogs.length],
          lat,
          lon: (360 / count) * c,
        });
        i++;
      }
    }
    out.push({ key: 'pole-bottom', dog: dogs[i % dogs.length], lat: 90, lon: 0 });
    return { tiles: out, tile };
  }, [dogs, target]);

  // Automatické otáčanie. Pauzuje počas ťahania a keď je overlay zavretý —
  // rAF slučka bežiaca na skrytej stránke je zbytočný žrút batérie.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      if (autoRef.current) spinRef.current.y += dt * 0.006;
      const el = ballRef.current;
      if (el) el.style.transform = `rotateX(${spinRef.current.x}deg) rotateY(${spinRef.current.y}deg)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // ESC zatvára — rovnaký únik ako z každého overlayu v appke.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    autoRef.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const s = spinRef.current;
    // Zvislé otáčanie sa zaráža pri ±62°: za tým sa guľa prevráti a rady
    // dlaždíc sa začnú prekrývať naplocho.
    s.x = Math.max(-62, Math.min(62, s.x - (e.clientY - d.y) * 0.25));
    s.y += (e.clientX - d.x) * 0.25;
    dragRef.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => {
    dragRef.current = null;
    autoRef.current = true;
  };

  return (
    <div className={`planet-root${open ? ' open' : ''}`} aria-hidden={!open}>
      <style>{`
        .planet-root {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 420ms ease;
          background:
            radial-gradient(120% 100% at 50% 42%, #FDF8EC 0%, #F6EAD0 46%, #EBD9B4 100%);
          overflow: hidden;
        }
        .planet-root.open { opacity: 1; pointer-events: auto; }

        /* Scéna: guľa sa pri otvorení „odďaľuje" — nabehne zväčšená a sadne na 1.
           To je celý vtip prechodu zo steny (stena = maximálne priblíženie). */
        .planet-stage {
          position: relative;
          width: ${R * 2}px;
          height: ${R * 2}px;
          perspective: 1400px;
          transform: scale(1.75);
          opacity: 0;
          transition: transform 620ms cubic-bezier(.22,.9,.28,1), opacity 420ms ease;
          touch-action: none;
        }
        .planet-root.open .planet-stage { transform: scale(1); opacity: 1; }

        .planet-ball {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          cursor: grab;
        }
        .planet-ball:active { cursor: grabbing; }

        /* Dlaždica psa. backface-visibility skryje zadnú pologuľu — bez toho by
           sa fotky zozadu prekresľovali cez predné a guľa by bola kaša. */
        .planet-tile {
          position: absolute;
          left: 50%;
          top: 50%;
          /* Veľkosť je dynamická (mení sa s počtom psov) → ide cez premennú
             nastavenú na guli, nie cez konštantu v tomto reťazci. */
          width: var(--tile);
          height: var(--tile);
          margin: calc(var(--tile) / -2) 0 0 calc(var(--tile) / -2);
          border-radius: calc(var(--tile) * 0.17);
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border: 1.5px solid rgba(201,154,63,0.85);
          box-shadow: 0 6px 16px -6px rgba(70,46,12,0.55);
          background: #EADCBB;
        }
        .planet-tile img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        /* Svetlo: guľa musí mať objem, inak je to plochý koláž-kruh.
           Vrstva NAD dlaždicami — stmaví okraje, presvetlí ľavý horný kvadrant. */
        .planet-shade {
          position: absolute;
          inset: -2%;
          border-radius: 50%;
          pointer-events: none;
          background:
            radial-gradient(65% 65% at 32% 26%, rgba(255,248,228,0.42), transparent 58%),
            radial-gradient(100% 100% at 50% 50%, transparent 52%, rgba(74,48,10,0.42) 100%);
        }

        /* Stred: logo + CTA. Nie je „vnútri" gule — leží pred ňou, aby ostalo
           čitateľné pri každom otočení. */
        .planet-hero {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
          pointer-events: none;
        }
        .planet-hero::before {
          content: '';
          position: absolute;
          inset: -110px -150px;
          z-index: -1;
          background: radial-gradient(ellipse at center, rgba(253,248,236,0.92) 26%, transparent 70%);
          pointer-events: none;
        }
        .planet-hero img { width: 132px; height: auto; filter: brightness(0); }
        .planet-hero .ph-tag {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.74rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.62);
          line-height: 1.7;
        }
        .planet-hero .ph-tag b { color: #8C6014; font-weight: 700; }
        .planet-hero .join-btn { pointer-events: auto; }

        /* Prepínač veľkosti svorky — papyrusové pilulky, dev nástroj. */
        .planet-scale {
          position: fixed;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          z-index: 6;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #FDF8EC 0%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow: 0 8px 22px -8px rgba(70,46,12,0.5);
        }
        .planet-scale .ps-label {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7a5a2a;
          padding: 0 6px;
        }
        .planet-scale .ps-pill {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          color: #2a1608;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 5px 11px;
          cursor: pointer;
        }
        .planet-scale .ps-pill.on {
          background: linear-gradient(180deg, #F4DC97 0%, #D9AC46 70%, #C99A33 100%);
          border-color: #6E4E18;
          box-shadow: inset 0 2px 0 rgba(255,250,222,0.85), 0 2px 5px -1px rgba(70,45,10,0.5);
        }

        .planet-close {
          position: fixed;
          top: 14px;
          right: 16px;
          z-index: 6;
          width: 40px; height: 40px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #FDF8EC 0%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          color: #2a1608;
          cursor: pointer;
        }

        @media (max-width: 760px) {
          .planet-stage { transform: scale(1.75) translateZ(0); }
          .planet-root.open .planet-stage { transform: scale(0.62); }
          .planet-hero img { width: 104px; }
        }
      `}</style>

      <button className="planet-close" onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* LAB gombík — koľko psov guľa nesie. Nie je to nastavenie appky, je to
          náhľad do budúcnosti svorky. */}
      <div className="planet-scale" role="group" aria-label="Počet psov">
        <span className="ps-label">psov na planéte</span>
        {PRESETS.map(n => (
          <button
            key={n}
            className={`ps-pill${target === n ? ' on' : ''}`}
            onClick={() => setTarget(n)}
          >
            {n === 71 ? '71 dnes' : n}
          </button>
        ))}
      </div>

      <div className="planet-stage">
        <div
          className="planet-ball"
          ref={ballRef}
          style={{
            transform: `rotateX(${spinRef.current.x}deg) rotateY(${spinRef.current.y}deg)`,
            ['--tile' as string]: `${tile}px`,
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {tiles.map(({ key, dog, lat, lon }) => (
            <div
              key={key}
              className="planet-tile"
              style={{ transform: `rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${R}px)` }}
              title={dog.name}
            >
              <img src={dog.photo} alt="" draggable={false} loading="lazy" />
            </div>
          ))}
        </div>
        <div className="planet-shade" />

        <div className="planet-hero">
          <img src="/images/dogypt-gold-logo.webp" alt="DOGYPT" />
          <p className="ph-tag">
            {t('wall.hero.taglineLead')}
            <br />
            <b>{t('wall.hero.taglineGod')}</b>
          </p>
          <a href="/entry" className="join-btn">{t('wall.hero.cta')}</a>
        </div>
      </div>
    </div>
  );
}
