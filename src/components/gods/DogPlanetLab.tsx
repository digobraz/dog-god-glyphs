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
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { dogPagePath } from '@/lib/dogSlug';

export interface PlanetDog {
  id: string;
  name: string;
  n: number | null;
  photo: string;
  /** Fotka pre panel detailu — dlaždicových 160 px je v ňom rozmazaných. */
  photoBig: string;
  heroglyph: string;
  message: string;
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

interface Tile { key: string; dog: PlanetDog; lat: number; lon: number }

/**
 * Pole dlaždíc ako VLASTNÝ memo komponent. Bublinka sa prepisuje ~15× za sekundu
 * (guľa sa točí a pod kurzorom sa strieda pes za psom); keby dlaždice viseli
 * priamo v tele planéty, každý taký prepis by zreconcilioval 1000 uzlov.
 * `tiles` chodí z `useMemo`, takže identita poľa sa medzi tými prepismi nemení
 * a `memo` ich preskočí.
 */
const TileField = memo(function TileField({ tiles }: { tiles: Tile[] }) {
  return (
    <>
      {tiles.map(({ key, dog, lat, lon }, i) => (
        <div
          key={key}
          className="planet-tile"
          // Index do `tiles` — z neho si gestá dohľadajú psa. Bez neho by
          // sa muselo hľadať podľa URL fotky, a tá sa na guli opakuje.
          data-i={i}
          style={{ ['--t' as string]: `rotateY(${lon}deg) rotateX(${-lat}deg) translateZ(${R}px)` }}
        >
          <img src={dog.photo} alt="" draggable={false} loading="lazy" />
        </div>
      ))}
    </>
  );
});

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
  // Ťah: okrem poslednej pozície si drží PREJDENÚ DRÁHU a dlaždicu, na ktorej sa
  // prst položil — z toho sa na konci rozhodne, či to bol ťuk alebo otáčanie.
  const dragRef = useRef<{ x: number; y: number; dist: number; tile: HTMLElement | null } | null>(null);
  const autoRef = useRef(true);

  // ── INTERAKCIA (Matej 25. 8.: „nech je tá planéta interaktívna") ────────────
  // Meno pri kurzore. Drží sa v state, lebo sa vykresľuje ako samostatný štítok
  // NAD guľou — dieťaťom dlaždice byť nemôže: tá je otočená v priestore, takže
  // text by bol šikmý a na zadnej pologuli by ho `backface-visibility` zhaslo.
  const [hover, setHover] = useState<{ name: string; n: number | null; photo: string; x: number; y: number } | null>(null);
  // Posledná poloha myši nad guľou. Guľa sa pod kurzorom TOČÍ ĎALEJ (Matej 25. 8.:
  // „nepáči sa mi že myš zastaví planétu… pri prejdení myšou sa zobrazí bublinka
  // so psom a menom aj keď len na okamih"), takže dlaždica pod kurzorom sa mení
  // aj vtedy, keď sa myš nehýbe — a `pointermove` vtedy nepríde. Bublinka sa preto
  // dopočítava z rAF slučky, nie z pohybu myši.
  const ptRef = useRef<{ x: number; y: number } | null>(null);
  const [picked, setPicked] = useState<PlanetDog | null>(null);
  // LAB PREPÍNAČ: kde sa detail otvorí. `side` = panel zboku (na mobile zhora),
  // guľa sa točí ďalej a uhne sa mu · `center` = prekryje stred, logo a CTA na
  // ten čas zmiznú. Vyberie sa jedna, druhá padne.
  const [variant, setVariant] = useState<'side' | 'center'>('side');
  // Zvýraznená dlaždica sa nastavuje PRIAMO na DOM prvku, nie cez state — pri
  // 1000 dlaždiciach by každé prejdenie myšou prekreslilo celý zoznam.
  const hotRef = useRef<HTMLElement | null>(null);
  const setHot = (el: HTMLElement | null) => {
    if (hotRef.current === el) return;
    hotRef.current?.classList.remove('is-hot');
    hotRef.current = el;
    el?.classList.add('is-hot');
  };

  // Rozmiestnenie sa počíta RAZ pre daný zoznam psov — pri každom renderi by sa
  // dlaždice premiešali a guľa by pri otáčaní „blikala" inými psami.
  const { tiles, tile } = useMemo(() => {
    const { tile, lats, spacing } = buildSphere(target);
    if (dogs.length === 0) return { tiles: [], tile };
    const out: Tile[] = [];
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

  /** Dlaždica pod prvkom → pes. `img` má pointer-events:none, takže cieľom je div. */
  const dogAt = (el: Element | null): PlanetDog | null => {
    if (!el) return null;
    const i = Number((el as HTMLElement).dataset.i);
    return Number.isInteger(i) ? tiles[i]?.dog ?? null : null;
  };

  /**
   * Prečíta, čo práve leží pod kurzorom, a prepíše bublinku. Volá sa z rAF
   * slučky (guľa sa točí) aj z pohybu myši (kurzor sa hýbe) — obe strany sa
   * menia nezávisle, takže jedna bez druhej nestačí.
   * Kým je otvorený detail, bublinka mlčí: dvaja psi naraz sú šum.
   */
  const probeHover = () => {
    const pt = ptRef.current;
    if (!pt || dragRef.current || picked) return;
    const el = document.elementFromPoint(pt.x, pt.y);
    const tile = el?.closest?.('.planet-tile') ?? null;
    if (!tile) {
      // MEDZERA MEDZI DLAŽDICAMI (je ich tretina rozostupu) — bublinka DRŽÍ
      // posledného psa. Keby zhasínala, pri točiacej sa guli by nad nehybným
      // kurzorom niekoľkokrát za sekundu bliklo prázdno a vyzeralo by to
      // pokazene. Zhasne až vtedy, keď kurzor guľu naozaj opustí.
      if (!el?.closest?.('.planet-ball')) {
        setHot(null);
        setHover(null);
      }
      return;
    }
    setHot(tile as HTMLElement);
    const dog = dogAt(tile);
    if (!dog) return;
    setHover(prev => {
      // Rovnaký pes na rovnakom mieste → žiadny re-render.
      if (prev && prev.name === dog.name && prev.n === dog.n && prev.x === pt.x && prev.y === pt.y) return prev;
      return { name: dog.name, n: dog.n, photo: dog.photo, x: pt.x, y: pt.y };
    });
  };

  // Automatické otáčanie. Pauzuje počas ťahania a keď je overlay zavretý —
  // rAF slučka bežiaca na skrytej stránke je zbytočný žrút batérie.
  //
  // V tej istej slučke sa PREČÍTAVA aj dlaždica pod kurzorom. Nedá sa to nechať
  // na `pointermove`: guľa sa točí ďalej, takže sa pod nehybnou myšou strieda pes
  // za psom a bublinka by ukazovala toho, ktorý tam bol pred sekundou.
  // ⚠️ Zámerne len ~15× za sekundu (každý 4. snímok). `elementFromPoint` je nad
  // 1000 dlaždicami v 3D reálna práca a na plynulé čítanie mena stačí 15 Hz.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      if (autoRef.current) spinRef.current.y += dt * 0.006;
      const el = ballRef.current;
      if (el) el.style.transform = `rotateX(${spinRef.current.x}deg) rotateY(${spinRef.current.y}deg)`;
      if (++frame % 4 === 0) probeHover();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [open, tiles, picked]);

  // ESC zatvára — rovnaký únik ako z každého overlayu v appke. Keď je otvorený
  // detail psa, prvé ESC zavrie JEHO: inak by človek jedným klávesom zhodil celú
  // planétu a nevedel by, prečo zmizla.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (picked) setPicked(null);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, picked]);

  // Zmena počtu psov prekreslí dlaždice → zvýraznená visí na prvku, ktorý už
  // nie je v dokumente. Zavretá planéta si nedrží nič.
  useEffect(() => {
    setHot(null);
    setHover(null);
  }, [target]);
  useEffect(() => {
    if (open) return;
    setHot(null);
    setHover(null);
    setPicked(null);
  }, [open]);

  const onDown = (e: React.PointerEvent) => {
    const tile = (e.target as HTMLElement).closest('.planet-tile') as HTMLElement | null;
    dragRef.current = { x: e.clientX, y: e.clientY, dist: 0, tile };
    autoRef.current = false;
    // Zámok na GUĽU, nie na dlaždicu: dlaždica má ~30 px a otáčanie by skončilo,
    // len čo z nej prst zíde.
    ballRef.current?.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) {
      // NABEHNUTIE MYŠOU. Dotyk sa sem nedostane zámerne — prst hover nemá a
      // meno prilepené po ťuknutí vyzerá ako zaseknutá appka, nie ako popis.
      // ⚠️ Guľa sa NEZASTAVUJE (Matej 25. 8.). Bublinka je priebežný odpočet
      // toho, čo práve ide popod kurzor — pes sa v nej vymení aj za okamih.
      if (e.pointerType !== 'mouse') return;
      ptRef.current = { x: e.clientX, y: e.clientY };
      probeHover();
      return;
    }
    d.dist += Math.hypot(e.clientX - d.x, e.clientY - d.y);
    const s = spinRef.current;
    // Zvislé otáčanie sa zaráža pri ±62°: za tým sa guľa prevráti a rady
    // dlaždíc sa začnú prekrývať naplocho.
    s.x = Math.max(-62, Math.min(62, s.x - (e.clientY - d.y) * 0.25));
    s.y += (e.clientX - d.x) * 0.25;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    autoRef.current = true;
    if (!d) return;
    // ŤUK vs. ŤAH — prah 12 px prevzatý zo steny (`GodsGridLab`, onTouchEnd).
    // Druhé číslo pre to isté gesto by znamenalo, že sa appka na dvoch
    // povrchoch správa inak bez dôvodu.
    if (d.dist >= 12) return;
    const dog = dogAt(d.tile);
    // Ťuk mimo dlaždice = zavretie. Panel tak nemá jediný únikový bod.
    setPicked(dog);
    if (!dog) {
      setHot(null);
      setHover(null);
    }
  };

  return (
    <div
      className={`planet-root v-${variant}${open ? ' open' : ''}${picked ? ' pop' : ''}`}
      aria-hidden={!open}
    >
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
          /* Poloha na guli je v premennej, nie priamo v transform — zvýraznenie
             tak vie pridať scale bez toho, aby React prekresľoval dlaždice. */
          transform: var(--t);
          transition: box-shadow 160ms ease, border-color 160ms ease;
        }
        /* Dlaždica pod kurzorom: vystúpi a orámuje sa. Rovnaká úloha ako bledý
           závoj na stene — povedať „táto, nie tá vedľa". */
        .planet-tile.is-hot {
          transform: var(--t) scale(1.18);
          border-color: #F4DC97;
          box-shadow: 0 0 0 2px rgba(244,220,151,0.55), 0 10px 26px -8px rgba(70,46,12,0.8);
          z-index: 4;
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

        /* Dev pult dole: dva riadky pilulek pod sebou (kde sa detail otvorí +
           koľko psov guľa nesie). Jeden riadok by sa na mobile nezmestil. */
        .planet-dock {
          position: fixed;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        /* Prepínač veľkosti svorky — papyrusové pilulky, dev nástroj. */
        .planet-scale {
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
          white-space: nowrap;
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
          white-space: nowrap;
        }
        .planet-scale .ps-pill.on {
          background: linear-gradient(180deg, #F4DC97 0%, #D9AC46 70%, #C99A33 100%);
          border-color: #6E4E18;
          box-shadow: inset 0 2px 0 rgba(255,250,222,0.85), 0 2px 5px -1px rgba(70,45,10,0.5);
        }

        /* ── MENO PRI KURZORE ────────────────────────────────────────────────
           Plávajúci štítok v rovine obrazovky. Na dlaždici visieť nemôže (je
           otočená v priestore), preto sa polohuje z clientX/clientY. */
        .planet-name {
          position: fixed;
          z-index: 7;
          pointer-events: none;
          transform: translate(-50%, -165%);
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 13px 4px 5px;
          border-radius: 999px;
          white-space: nowrap;
          background: linear-gradient(135deg, #FDF8EC 0%, #F0DFB8 100%);
          border: 1.5px solid #C99A3F;
          box-shadow: 0 8px 20px -8px rgba(70,46,12,0.6);
        }
        /* Pes v bublinke. Kým sa meno prečíta, tvár je rozoznaná — a práve o to
           ide pri guli, ktorá sa točí ďalej. */
        .planet-name .pn-photo {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 1.5px solid rgba(201,154,63,0.9);
        }
        /* Meno psa = Cinzel Decorative (oficiálny povrch, ako na stene). */
        .planet-name .pn-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.74rem;
          letter-spacing: 0.05em;
          color: #2a1608;
        }
        /* Poradové číslo = dáta, teda Space Grotesk. */
        .planet-name .pn-n {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          color: #8C6014;
          font-style: normal;
        }

        /* ── DETAIL PSA ──────────────────────────────────────────────────────
           Obsah je pre obe možnosti ten istý a v tom istom poradí ako otvorená
           karta na stene (číslo → meno → heroglyf → odkaz majiteľa → DOG PAGE).
           Tmavý panel nie je odchýlka od papyrusu: heroglyf má zlatú žiaru
           navrhnutú na čierne pozadie a na stene sa karta otvára presne takto. */
        .pp-panel {
          z-index: 9;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          padding: 18px 20px 20px;
          overflow-y: auto;
          background: rgba(18,11,3,0.95);
          border: 1.5px solid rgba(201,154,63,0.8);
          box-shadow: 0 24px 64px -20px rgba(40,26,6,0.85);
          opacity: 0;
          pointer-events: none;
        }
        .planet-root.pop .pp-panel { opacity: 1; pointer-events: auto; }

        .pp-photo {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 2px solid rgba(201,154,63,0.85);
          box-shadow: 0 0 22px -6px rgba(201,154,63,0.65);
        }
        .pp-rank {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: #3a2c10;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1px solid rgba(201,154,63,0.55);
          border-radius: 999px;
          padding: 2px 11px;
          flex-shrink: 0;
        }
        .pp-name {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-size: 1.02rem;
          font-weight: 700;
          color: rgba(255,255,255,0.94);
          letter-spacing: 0.07em;
          text-align: center;
          line-height: 1.3;
        }
        .pp-glyph {
          width: 46%;
          max-width: 150px;
          height: auto;
          display: block;
          flex-shrink: 0;
          pointer-events: none;
          filter:
            brightness(0) invert(1)
            sepia(1) saturate(8) hue-rotate(-12deg) brightness(1.3)
            drop-shadow(0 0 14px rgba(201,154,63,0.95))
            drop-shadow(0 0 32px rgba(201,154,63,0.55));
        }
        .pp-msg {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 300;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.62);
          text-align: center;
          line-height: 1.6;
          font-style: italic;
          margin: 0;
        }
        .pp-link {
          display: inline-block;
          flex-shrink: 0;
          margin-top: 2px;
          padding: 6px 16px;
          font-family: 'Cinzel', serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C99A3F;
          border: 1px solid rgba(201,154,63,0.65);
          border-radius: 8px;
          text-decoration: none;
          transition: box-shadow 200ms ease, background 200ms ease;
        }
        .pp-link:hover { background: rgba(201,154,63,0.08); box-shadow: 0 0 12px rgba(201,154,63,0.45); }
        .pp-x {
          position: absolute;
          top: 8px;
          right: 10px;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.55);
          cursor: pointer;
        }
        .pp-x:hover { color: #F4DC97; }

        /* ── MOŽNOSŤ A: BOK ──────────────────────────────────────────────────
           Panel príde sprava, guľa sa točí ďalej A UHNE SA MU — bez toho by
           polovica psov skončila pod panelom. */
        .v-side .pp-panel {
          position: fixed;
          top: 50%;
          right: 22px;
          width: 330px;
          max-height: 80vh;
          border-radius: 18px;
          transform: translate(calc(100% + 46px), -50%);
          transition: transform 460ms cubic-bezier(.22,.9,.28,1), opacity 300ms ease;
        }
        .planet-root.pop.v-side .pp-panel { transform: translate(0, -50%); }
        .planet-root.open.pop.v-side .planet-stage { transform: translateX(-176px) scale(1); }

        /* ── MOŽNOSŤ B: STRED ────────────────────────────────────────────────
           Panel sadne na stred; logo a CTA na ten čas zhasnú, inak by si dve
           veci pýtali to isté miesto. */
        .v-center .pp-panel {
          position: fixed;
          left: 50%;
          top: 50%;
          width: 360px;
          max-height: 82vh;
          border-radius: 20px;
          transform: translate(-50%, -50%) scale(0.9);
          transition: transform 340ms cubic-bezier(.22,.9,.28,1), opacity 260ms ease;
        }
        .planet-root.pop.v-center .pp-panel { transform: translate(-50%, -50%) scale(1); }
        .planet-root.pop.v-center .planet-hero { opacity: 0; pointer-events: none; }
        .planet-hero { transition: opacity 240ms ease; }

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
          transition: opacity 200ms ease;
        }

        @media (max-width: 760px) {
          .planet-stage { transform: scale(1.75) translateZ(0); }
          .planet-root.open .planet-stage { transform: scale(0.62); }
          .planet-hero img { width: 104px; }

          /* BOK sa na mobile mení na ZHORA (Matej 25. 8.: „na mobile z vrchu").
             Zboku by pri 390 px ostal z gule pásik. */
          .v-side .pp-panel {
            top: 0; right: 0; left: 0;
            width: auto;
            max-height: 62vh;
            border-radius: 0 0 20px 20px;
            border-width: 0 0 1.5px;
            transform: translateY(-102%);
          }
          .planet-root.pop.v-side .pp-panel { transform: translateY(0); }
          /* Krížik planéty a krížik listu by sedeli na sebe. Kým je list hore,
             planétu zatvoriť netreba — najprv sa zatvára to, čo je navrchu. */
          .planet-root.pop.v-side .planet-close { opacity: 0; pointer-events: none; }
          .planet-root.open.pop.v-side .planet-stage { transform: translateY(124px) scale(0.62); }

          .v-center .pp-panel { width: calc(100vw - 32px); }

          .planet-scale .ps-label { font-size: 0.55rem; letter-spacing: 0.12em; padding: 0 4px; }
          .planet-scale .ps-pill { padding: 5px 8px; }
        }
      `}</style>

      <button className="planet-close" onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {/* LAB pult. Horný riadok = ktorá z dvoch možností detailu sa skúša,
          dolný = koľko psov guľa nesie. Ani jedno nie je nastavenie appky. */}
      <div className="planet-dock">
        <div className="planet-scale" role="group" aria-label="Kde sa otvorí detail psa">
          <span className="ps-label">detail psa</span>
          <button
            className={`ps-pill${variant === 'side' ? ' on' : ''}`}
            onClick={() => setVariant('side')}
          >
            bok
          </button>
          <button
            className={`ps-pill${variant === 'center' ? ' on' : ''}`}
            onClick={() => setVariant('center')}
          >
            stred
          </button>
        </div>

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
          onPointerLeave={() => { ptRef.current = null; setHot(null); setHover(null); }}
        >
          <TileField tiles={tiles} />
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

      {/* Meno pri kurzore. Zhasne, len čo sa otvorí detail — dva popisky toho
          istého psa naraz sú šum, nie informácia. */}
      {hover && !picked && (
        <div className="planet-name" style={{ left: hover.x, top: hover.y }}>
          <img className="pn-photo" src={hover.photo} alt="" draggable={false} />
          <span className="pn-name">{hover.name}</span>
          {hover.n != null && <i className="pn-n">#{hover.n}</i>}
        </div>
      )}

      {/* Detail psa. Ten istý obsah pre obe možnosti — líši sa iba tým, KAM
          sadne (CSS `.v-side` / `.v-center`). Dva panely s tým istým vnútrom by
          sa pri prvej úprave rozišli. */}
      {picked && (
        <div className="pp-panel" role="dialog" aria-label={picked.name}>
          <button className="pp-x" onClick={() => setPicked(null)} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <img className="pp-photo" src={picked.photoBig || picked.photo} alt="" draggable={false} />
          {picked.n != null && <span className="pp-rank">#{picked.n}</span>}
          <div className="pp-name">{picked.name}</div>
          {picked.heroglyph && (
            <img className="pp-glyph" src={picked.heroglyph} alt="" draggable={false} />
          )}
          {/* Hektor #1 má odkaz v preklade, nie v DB — rovnako ako jeho karta na stene. */}
          {(picked.message || picked.n === 1) && (
            <p className="pp-msg">{picked.message || t('wall.hektor.msg')}</p>
          )}
          {picked.n != null && picked.name && (
            <a className="pp-link" href={dogPagePath(picked.name, picked.n)}>
              {t('wall.dogPage')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
