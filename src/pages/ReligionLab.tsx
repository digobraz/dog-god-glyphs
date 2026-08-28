// ════════════════════════════════════════════════════════════════════════════
// RELIGION LAB — papyrusová /religion (DEV ONLY, route /religion-lab)
// ────────────────────────────────────────────────────────────────────────────
// 1:1 kópia `Religion.tsx` z 25. 8. 2026, prefarbená do svetlého režimu. Ten istý
// model ako WALL LAB (`GodsGridLab.tsx`): ostrá stránka sa NEDOTKNE, experiment
// beží vedľa nej. Texty ostávajú (Matej: „texty ostávajú, pozadie bude bledé").
//
// ⚠️ Papyrusové tokeny sú spoločné pre celý svetlý web → `@/lib/labTheme`.
//    Nepíš sem vlastné odtiene, inak bude každá stránka iná.
// ⚠️ Chrome je lab-ový (`PageTopBarLab` → `PageNavLab`) a odkazuje na *-lab routy.
// ⚠️ CTA stále mieria na ostré `/entry` — tá zatiaľ svetlú verziu nemá, takže
//    klik vypadne do tmavého webu. Zámer, nie chyba: /entry sa rieši samostatne
//    (téma predsiení).
// ⚠️ Trieda `.dark-bg` je nahradená `.lab-papyrus` — `.dark-bg` v `index.css`
//    ťahá `bg-dark.webp` a núti zlatý inkoust cez `> *`, čo by papyrus prebilo.
// ⚠️ CSS triedy `.codex-*` sú globálne a zhodné s originálom; naraz je namontovaná
//    vždy len jedna z dvoch stránok, takže kolízia nehrozí.
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/LanguageContext';
// LAPIS = brandová farba akcie (od 28. 8. 2026 kánon, viď CLAUDE.md). Tokeny
// žijú v navGoldSkin.ts — ber ICH, nepíš sem vlastnú modrú.
import { LAPIS, LAPIS_BTN_SHADOW } from '@/components/pack/navGoldSkin';
import { PageTopBarLab } from '@/components/PageTopBarLab';
import { LAB } from '@/lib/labTheme';
import ConstitutionBook from '@/components/religion/ConstitutionBook';
import CodexHalo from '@/components/lab/CodexHalo';
import { Seo } from '@/components/Seo';

/**
 * PREPÍNAČ TEXT 1 / TEXT 2 — vypnutý (Matej 27. 8. 2026: „odstráň pomocné dev menu
 * aj TEXT1/2“). Ladí sa už hotový web vrátane telefónu cez tunel a vývojárske
 * ovládanie v rohu kazí dojem z návrhu.
 * ⚠️ Zapína sa TÝMTO JEDNÝM SLOVOM — variant 1 aj jeho CSS ostávajú v súbore
 * (Matej ich sám odložil ako „variant 1 je ULOŽENÝ, nie zmazaný“), takže
 * porovnanie sa spustí prepísaním na `true`, nie písaním kódu odznova.
 */
const SHOW_VARIANT_SWITCH = false;

const TEXT_VARIANT_KEY = 'dogypt.religionLab.textVariant';

/**
 * PÍSANIE PO ZNAKOCH — rozloží riadok na jednotlivé znaky a každému dá poradové
 * číslo `--i`. Odhaľovanie potom robí CSS z tohto čísla; JS nič neanimuje, takže
 * to funguje rovnako na časovači (samostatná stránka) aj na scrolle (film).
 *
 * `**takto**` označený úsek dostane zlatý dôraz — tú istú veľkosť aj váhu, len
 * inú farbu. Je to celý dôvod, prečo variant 2 vyzerá pokojnejšie než variant 1:
 * hierarchiu nesie FARBA, nie päť rôznych veľkostí písma.
 *
 * ⚠️ `start` je posun v poradí znakov naprieč VŠETKÝMI riadkami — písanie musí
 * plynúť z riadku na riadok, nie sa v každom reštartovať.
 */
function typeLine(text: string, start: number): { nodes: JSX.Element[]; next: number } {
  const nodes: JSX.Element[] = [];
  let i = start;
  for (const [si, seg] of text.split('**').entries()) {
    const gold = si % 2 === 1;
    for (const ch of seg) {
      nodes.push(
        <span
          key={i}
          className={gold ? 'v2-ch v2-gold' : 'v2-ch'}
          style={{ ['--i' as string]: i }}
        >
          {ch}
        </span>
      );
      i += 1;
    }
  }
  return { nodes, next: i };
}

interface ReligionLabProps {
  /**
   * Stránka beží ako SEKCIA vnútri `components/lab/LabShell.tsx`:
   *   • hlavičku dodáva rám → `PageTopBarLab` sa tu nevykresľuje (inak by boli
   *     na obrazovke dva navy nad sebou);
   *   • výška je 100 % PANELA, nie okna — panel je fixed a už si odsadil nav
   *     (`--lsh-nav-h`), takže `h-[100dvh]` by pretiekla o výšku lišty;
   *   • `<Seo>` patrí rámu — dve Helmet hlavičky naraz si prepisujú titulok.
   */
  embedded?: boolean;
  /**
   * REŽIM FILMU — stránka beží ako SEKCIA jedného zvislého scrollu
   * (`components/lab/OnePage.tsx`, Matej 26. 8.: „skúsme onepage stránku").
   *
   * Rozdiel oproti `embedded`: tam je stránka stále samostatná obrazovka
   * s VLASTNÝM scroll kontajnerom (`.codex-scroll`, snap y mandatory) — tu
   * scrolluje OKNO a stránka je len kus dlhého plátna. Preto sa vypína:
   *   • vlastný scroll a snap (dva scrolly nad sebou si lezú do cesty),
   *   • `root` IntersectionObservera (`.codex-scroll` už nescrolluje, takže
   *     ako root by hlásil všetky tri sekcie naraz — reveal kravy a psa by
   *     odpálil hneď a bleed by ostal aktívny na všetkých),
   *   • plávajúca šípka „scrolluj" (v onepage nemá kam viesť a visela by
   *     na obrazovke celý film).
   * `embedded` sa tým NEMENÍ — LabShell (vodorovný swipe) ostáva ako bol.
   */
  flow?: boolean;
  /**
   * ČO UROBÍ CTA POD ÚRYVKOM ÚSTAVY (len v režime filmu).
   * Matej 28. 8. 2026: *„pod tým bude CTA… read BIBLE for doglovers (pages)…
   * kniha nebude vidno (kniha bude v pätičke úplne nakonci)."*
   * Kniha teda z filmu ako obraz zanikla a ostal po nej JEDEN vstup — toto
   * tlačidlo. Otvorenie si rieši rám (`OnePage`), lebo knihu montuje on:
   * ReligionLab v režime filmu ju už nevykresľuje vôbec.
   */
  onOpenBook?: () => void;
}

export default function ReligionLab({ embedded = false, flow = false, onOpenBook }: ReligionLabProps = {}) {
  const t = useT();
  const [active, setActive] = useState(0);
  /** Ktoré sekcie už boli odhalené. Jednosmerné — odhalené ostáva odhalené. */
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Vertikálny scroll-snap (klasický scroll; každá sekcia = fix obrazovka).
  // IntersectionObserver na scroll kontajneri sleduje centrovanú sekciu →
  //   • .in-view reveal animácia · • aktívna bodka · • cow/Hektor bleed iba na sekcii 0.
  useEffect(() => {
    // V režime filmu scrolluje OKNO — root musí byť viewport (null), inak by
    // observer meral voči neposúvajúcemu sa `.codex-scroll` a všetky tri sekcie
    // by boli „v obraze" hneď od začiatku.
    const root = flow ? null : scrollRef.current;
    if (!flow && !root) return;
    const sections = sectionRefs.current.filter(Boolean) as HTMLElement[];

    // ── ODHALENIE OBSAHU ─────────────────────────────────────────────────
    // 🔴 DRŽÍ HO REACT, NIE `classList.add`. Pôvodne observer vešal triedu
    // priamo na prvok — a keďže `className` toho istého prvku píše React,
    // najbližší prerender (spúšťa ho `setActive` z TOHO ISTÉHO observera)
    // ju zmazal. Na pevnej obrazovke so snapom sa to stratilo v šume, vo filme
    // z toho ostali natrvalo neviditeľné odseky. Predtým sa to riešilo tak, že
    // sa reveal vo filme vypol natvrdo — a Matej to 26. 8. 2026 vrátil:
    // *„to písmo v 2. sekcii príde mi to také suché a nezaujímavé… tá citácia
    // z ústavy sa zasekne… nech je to plynulé ako na ostrom webe."*
    // Odhalené ostáva odhalené (jednosmerné) — pri scrollovaní hore-dole by
    // sa inak odseky prepínali a to je presne ten „sek".
    //
    // ⚠️ PRAH SA NEDÁ MERAŤ PODIELOM SEKCIE. Vo filme je prvý výjav vysoký
    // štyri obrazovky (nesie celú dráhu prechodu z gule), takže „55 % sekcie
    // v obraze" nenastane NIKDY — okno má jednu obrazovku. Preto sa vo filme
    // pýtame inak: zasahuje sekcia do stredných 70 % okna? To platí pre
    // ľubovoľne vysokú sekciu.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number((entry.target as HTMLElement).dataset.idx);
          setSeen((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
          if (!flow && entry.intersectionRatio >= 0.55) setActive(i);
        }
      },
      flow
        ? { root: null, threshold: 0, rootMargin: '-15% 0px -15% 0px' }
        : { root, threshold: [0.55] }
    );
    sections.forEach((s) => io.observe(s));

    // Aktívna sekcia (bodka + rám kravy a psa) vo filme potrebuje vlastné
    // meranie: `seen` je jednosmerné, takže by po prvom prejdení ostalo na
    // poslednej sekcii a rám by sa už nikdy nevrátil na prvý výjav.
    let io2: IntersectionObserver | null = null;
    if (flow) {
      io2 = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.idx));
          }
        },
        { root: null, threshold: 0, rootMargin: '-45% 0px -45% 0px' }
      );
      sections.forEach((s) => io2!.observe(s));
    }
    return () => { io.disconnect(); io2?.disconnect(); };
  }, [flow]);

  const go = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── VARIANT TEXTINGU DRUHEJ SEKCIE (Matej 27. 8. 2026) ────────────────────
  // 1 = pôvodný rozpis (veľké číslo, podčiarknuté sub, obvinenie, CTA veta)
  // 2 = súvislý odsek jednej veľkosti, ktorý sa pod scrollom píše po znakoch
  // Východisko je 2 — je to nová vec na posúdenie. Jednotka ostáva dostupná
  // prepínačom a je ULOŽENÁ, nie zmazaná (Matej: „toto berme ako variant 1
  // a ulož to"). localStorage, aby voľba prežila reload pri porovnávaní.
  const [textVariant, setTextVariant] = useState<1 | 2>(2);
  useEffect(() => {
    try {
      const v = localStorage.getItem(TEXT_VARIANT_KEY);
      if (v === '1' || v === '2') setTextVariant(Number(v) as 1 | 2);
    } catch { /* private mode — ostáva východisko */ }
  }, []);
  const pickVariant = (v: 1 | 2) => {
    setTextVariant(v);
    try { localStorage.setItem(TEXT_VARIANT_KEY, String(v)); } catch { /* ignoruj */ }
  };

  // Zloženie variantu 2. Poradie znakov beží NAPRIEČ riadkami (`next` sa
  // prenáša ďalej) — inak by sa písanie v každom riadku reštartovalo a všetky
  // štyri by nabiehali naraz. Posledný riadok je oddelený: je to výzva, nie
  // ďalší fakt, a musí prísť až keď argument dosedne.
  const v2 = (() => {
    const keys = ['religion.v2.l1', 'religion.v2.l2', 'religion.v2.l3', 'religion.v2.l4'];
    let at = 0;
    const lines = keys.map((k) => {
      const r = typeLine(t(k), at);
      at = r.next;
      // Medzera navyše medzi vetami, aby písanie malo nádych na konci riadku.
      at += 4;
      return r.nodes;
    });
    return { lines, total: at };
  })();
  const v2Total = v2.total;
  const v2Body = (
    <>
      <p className="codex-v2">
        {v2.lines.slice(0, 3).map((nodes, i) => (
          <span className="v2-line" key={i}>{nodes}</span>
        ))}
      </p>
      <div className="codex-cta-cluster codex-v2-cta">
        <p className="codex-v2-close">
          <span className="v2-line">{v2.lines[3]}</span>
        </p>
        <Link to="/entry" className="codex-cta">
          {t('religion.cta')}
        </Link>
      </div>
    </>
  );

  return (
    <div className={`lab-papyrus codex-page flex flex-col relative ${flow ? 'codex-flow h-auto' : `overflow-hidden ${embedded ? 'h-full' : 'h-[100dvh]'}`}`}>
      {!embedded && (
        <Seo
          path="/religion-lab"
          title="Dogyptism — The Dog Religion | DOGYPT"
          description="Dogyptism: a syncretic faith where every dog is sacred. Read the constitution — five layers, twelve chapters. In Dog We Trust."
        />
      )}
      {/* Radial vignette — drží sa 1 obrazovky (page = 100dvh), pozadie sa nezväčšuje */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            LAB.pageVeil,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Cow/Hektor bleed PNGs — page-level (presahujú sekcie), aktívne iba na hero sekcii 0.
          Svätožiary sú SAMOSTATNÁ vrstva (CodexHalo) a stoja PRED fotkou zámerne —
          hlava musí prekryť spodný oblúk prstenca. Krave halo svieti od začiatku
          (je to jej stav), Hektorovi sa rozsvieti až na pointe — viď .codex-halo nižšie.
          ⚠️ Krava ide z `-nohalo` fotky: v pôvodnej bolo halo zapečené aj s tmavým
          glow, ktorý na papyruse vyzeral ako špina. Pôvodné PNG ostáva v repe. */}
      <div
        className={`codex-bleed ${active === 0 ? 'active' : ''}`}
        style={{ ['--halo-delay' as string]: `${textVariant === 1 ? 2700 : v2Total * 18 + 500}ms` }}
        aria-hidden
      >
        <CodexHalo who="cow" />
        <img src="/images/codex3-cow-nohalo.png" alt="" className="codex-cow" />
        <CodexHalo who="hektor" />
        <img src="/images/codex3-hektor-v1.png" alt="" className="codex-hektor" />
      </div>

      <style>{`
        /* ── LAB: papyrusový podklad (tokeny = @/lib/labTheme, zhodné s WALL LABom).
           position:fixed na podklade je zámer prevzatý z .dark-bg::before —
           tabuľa sa drží OKNA, nie výšky obsahu.
           (Bez spätných apostrofov: celý blok je JS template literal.) */
        .lab-papyrus { position: relative; background-color: ${LAB.pageBg}; }
        .lab-papyrus::before {
          content: '';
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100lvh;
          background: ${LAB.pageBackdrop};
          z-index: 0;
          pointer-events: none;
        }
        .lab-papyrus > * { position: relative; z-index: 1; }

        /* Vertikálny scroll-snap kontajner — klasický scroll, fix obrazovka per sekcia.
           Stránka ostáva 100dvh + overflow-hidden → pozadie sa NEzväčšuje; scrolluje len toto. */
        .codex-scroll {
          flex: 1 1 auto;
          min-height: 0;
          width: 100%;
          overflow-y: scroll;
          overflow-x: hidden;
          /* Bez scroll-anchoringu — keď sa na 3. dvojstrane zjavia CTA tlačidlá pod knihou,
             zmena výšky obsahu nesmie skokom presunúť scroll (predtým „vrátilo na hero"). */
          overflow-anchor: none;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          position: relative;
          z-index: 2;
        }
        .codex-scroll::-webkit-scrollbar { display: none; }
        .codex-section {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
        }
        .codex-slider {
          position: relative;
          width: 100%;
          max-width: 880px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          padding: 0 clamp(12px, 2vw, 24px);
        }
        .codex-slide {
          flex: 0 0 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(20px, 3vh, 40px) clamp(8px, 2vw, 24px);
          text-align: center;
        }
        .codex-slider .codex-slide > * + * {
          margin-top: clamp(28px, 4.5vh, 48px);
        }
        /* Sacred Index slide = Constitution kniha (flipbook) → širší priestor, menší padding */
        .codex-slider-book { max-width: 1120px; }
        .codex-slider-book .codex-slide { padding: clamp(8px, 1.6vh, 18px) clamp(6px, 1.5vw, 16px); }
        /* Nadpis nad knihou (2026-06-03, PC + mobile) — absolútne hore v sekcii, mimo
           layout knihy → knihu neposúva. */
        .codex-book-title {
          position: absolute;
          top: clamp(12px, 3vh, 34px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 7;
          margin: 0;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1rem, 2.28vw, 1.8rem);
          /* headroom pre diakritiku (Biblia/Bible/psíčkarov) — background-clip:text inak oseká accent */
          line-height: 1.18; padding-top: 0.14em;
          letter-spacing: 0.05em;
          text-align: center;
          white-space: nowrap;
          pointer-events: none;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 1px 1px rgba(110,71,16,0.20));
        }
        @media (max-width: 767px) {
          .codex-book-title { top: 14px; font-size: 1.05rem; letter-spacing: 0.04em; }
        }

        /* ── Scroll-reveal animácie (rešpektuje prefers-reduced-motion) ──
           Pokojový stav = identity transform → locked layout zostáva nedotknutý. */
        @media (prefers-reduced-motion: no-preference) {
          .codex-section .codex-slide:not(.codex-slide-3) {
            opacity: 0;
            transform: translateY(34px);
            transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 720ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          .codex-section.in-view .codex-slide:not(.codex-slide-3) {
            opacity: 1;
            transform: none;
          }
          /* Hero (cow vs dog): staggered reveal jednotlivých riadkov overlayu */
          .codex-3-overlay > * {
            opacity: 0;
            transform: translateY(26px);
            transition: opacity 760ms cubic-bezier(0.22, 1, 0.36, 1),
                        transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform;
          }
          .codex-section.in-view .codex-3-overlay > * { opacity: 1; transform: none; }
          /* Rytmus je dramaturgia, nie ozdoba (Matej 27. 8. 2026: „nech je to
             zaujímavejšie = postupné odhaľovanie/čítanie textu"). Odstupy kopírujú
             stavbu argumentu, nie rovnomerný stagger:
               1–2 krava · 3–4 pes (pauza pred druhou stranou)
               5 obvinenie (najväčšia pauza — má doraziť do ticha) · 6 CTA
             ⚠️ Vo filme (/onepage) TOTO NEPLATÍ: tam odhaľovanie riadi scroll cez
             --op-txt, viď .codex-flow nižšie. Dva časovače na tom istom texte by
             sa bili. */
          /* VARIANT 1 — štyri bloky: krava · pes · YET. · CTA.
             Pauza pred „YET." je najväčšia zámerne — obrat má doraziť do ticha,
             nie v rade s faktami. CTA ide až za ním. */
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(1) { transition-delay: 80ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(2) { transition-delay: 520ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(3) { transition-delay: 1180ms; }
          .codex-section.in-view .codex-3-overlay:not(.is-v2) > *:nth-child(4) { transition-delay: 1760ms; }
          /* Variant 2 (odsek, ktorý sa píše) má dva bloky a vlastné tempo — jeho
             odstupy sa zmenou variantu 1 nesmú pohnúť. */
          .codex-section.in-view .codex-3-overlay.is-v2 > *:nth-child(1) { transition-delay: 80ms; }
          .codex-section.in-view .codex-3-overlay.is-v2 > *:nth-child(2) { transition-delay: 300ms; }
        }

        /* Landscape-short fallback: dark-bg ide na height:auto (index.css) → necháme
           prirodzený scroll bez snapu, aby sa obsah dal prečítať. */
        @media (orientation: landscape) and (max-height: 600px) {
          .codex-scroll { overflow: visible; height: auto; scroll-snap-type: none; }
          .codex-section { height: auto; min-height: 100dvh; }
        }

        /* ── Slide 1 ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 1 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-headline {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.71rem, 6.5vw, 5.05rem);
          letter-spacing: 0.04em;
          line-height: 1.02;
          margin: 0;
          text-transform: uppercase;
          color: rgba(35,22,8,0.90);
        }
        .codex-headline .grad {
          display: block;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        .codex-headline .line {
          display: block;
        }
        .codex-preamble-wrap {
          position: relative;
          width: 100%;
          max-width: 820px;
          padding: clamp(26px, 3.6vh, 44px) clamp(34px, 5vw, 60px);
        }
        /* Sacred frame — 4 double-line L corners + diamond accent */
        .codex-frame {
          position: absolute;
          width: clamp(32px, 4.6vw, 48px);
          height: clamp(32px, 4.6vw, 48px);
          pointer-events: none;
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.22));
        }
        .codex-frame.tl { top: 0; left: 0;
          border-top: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.tr { top: 0; right: 0;
          border-top: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        .codex-frame.bl { bottom: 0; left: 0;
          border-bottom: 1.5px solid #C99A3F; border-left: 1.5px solid #C99A3F;
        }
        .codex-frame.br { bottom: 0; right: 0;
          border-bottom: 1.5px solid #C99A3F; border-right: 1.5px solid #C99A3F;
        }
        /* inner offset L — second parallel line */
        .codex-frame::before {
          content: '';
          position: absolute;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          border-style: solid;
          border-color: rgba(201,154,63,0.72);
          border-width: 0;
        }
        .codex-frame.tl::before { top: 5px; left: 5px;
          border-top-width: 1px; border-left-width: 1px;
        }
        .codex-frame.tr::before { top: 5px; right: 5px;
          border-top-width: 1px; border-right-width: 1px;
        }
        .codex-frame.bl::before { bottom: 5px; left: 5px;
          border-bottom-width: 1px; border-left-width: 1px;
        }
        .codex-frame.br::before { bottom: 5px; right: 5px;
          border-bottom-width: 1px; border-right-width: 1px;
        }
        /* outer diamond accent at the corner vertex */
        .codex-frame::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: #A3782B;
          transform: rotate(45deg);
          box-shadow: 0 1px 3px rgba(110,71,16,0.35);
        }
        .codex-frame.tl::after { top: -3.5px; left: -3.5px; }
        .codex-frame.tr::after { top: -3.5px; right: -3.5px; }
        .codex-frame.bl::after { bottom: -3.5px; left: -3.5px; }
        .codex-frame.br::after { bottom: -3.5px; right: -3.5px; }
        @media (max-width: 767px) {
          /* Mobile (2026-06-03): zúžiť rámik znenia ústavy */
          .codex-preamble-wrap { padding: 18px 20px; max-width: 320px; margin: 0 auto; }
          .codex-frame { width: 24px; height: 24px; }
          .codex-frame::before { width: calc(100% - 10px); height: calc(100% - 10px); }
          .codex-frame.tl::before { top: 4px; left: 4px; }
          .codex-frame.tr::before { top: 4px; right: 4px; }
          .codex-frame.bl::before { bottom: 4px; left: 4px; }
          .codex-frame.br::before { bottom: 4px; right: 4px; }
        }
        .codex-preamble-text {
          font-family: 'Cinzel', serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.09rem, 1.66vw, 1.47rem);
          line-height: 1.55;
          letter-spacing: 0.02em;
          color: rgba(35,22,8,0.82);
          margin: 0;
          text-wrap: balance;
        }
        .codex-preamble-text strong {
          font-weight: 700;
          font-style: italic;
          color: #8a5a14;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        .codex-oath-label {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.59rem, 0.9vw, 0.72rem);
          letter-spacing: 0.36em;
          color: rgba(201,154,63,0.7);
          text-transform: uppercase;
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: clamp(10px, 1.6vw, 16px);
        }
        .codex-oath-label::before,
        .codex-oath-label::after {
          content: '';
          height: 1px;
          width: clamp(22px, 3.4vw, 40px);
          background: rgba(201,154,63,0.5);
        }
        .codex-slider .codex-slide > .codex-oath-label {
          margin-top: clamp(14px, 2vh, 22px);
        }
        /* ── RIADOK NAD MOTTOM (len režim filmu) ─────────────────────────
           Vzor je .religion-eyebrow z pages/Entry.tsx: Space Grotesk 500,
           veľké písmená, široké preloženie. Zámerne NIE Cinzel — Cinzel je
           v tejto sekcii identita (motto, prísaha) a keby ho mala aj táto veta,
           čítala by sa ako ďalší nadpis, nie ako poznámka o čitateľovi.
           ⚠️ Space Grotesk je načítaný len vo váhach 300–600; 700 by bol
           falošný tučný (pravidlo v CLAUDE.md). */
        .codex-eyebrow {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(0.62rem, 0.86vw, 0.78rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(122,90,42,0.78);
          margin: 0;
          /* JEDEN RIADOK (Matej 28. 8. 2026: „v jednom riadku a čo najkratší").
             nowrap je tu poistka, nie náhrada za krátky text — keby veta
             narástla, radšej nech pretečie viditeľne, než aby sa ticho zalomila
             a rozbila rytmus troch prvkov nad sebou. */
          white-space: nowrap;
          line-height: 1.4;
          /* ODDELENÝ HORIZONTÁLKOU (to isté zadanie). Čiara je ::after, nie
             samostatný prvok: patrí k riadku, takže s ním má aj nabiehať —
             ako vlastný súrodenec by potrebovala vlastnú premennú a rozišla by
             sa s ním pri prvom ladení. Vybledá do strán rovnako ako .codex-rule
             na papyruse, aby nekončila ostrým rezom. */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(9px, 1.5vh, 14px);
        }
        .codex-eyebrow::after {
          content: '';
          display: block;
          width: clamp(58px, 8vw, 104px);
          height: 1px;
          background: linear-gradient(90deg,
            rgba(201,154,63,0) 0%, rgba(201,154,63,0.72) 50%, rgba(201,154,63,0) 100%);
        }
        @media (max-width: 767px) {
          .codex-eyebrow { font-size: 0.58rem; letter-spacing: 0.16em; }
        }
        /* ── CTA JE LAPIS, NIE ZLATÉ ──────────────────────────────────────
           Matej 28. 8. 2026: *„CTA má byť v lapise (náš nový brand — poznač si
           to už)."* Tým sa zrušil dovtedajší hold z 26. 8. („zatiaľ to
           nezapisuj") a lapis prešiel z pracovného návrhu do kánonu.
           Farby sa NEOPISUJÚ — sú v LAPIS v navGoldSkin.ts.
           Zlaté písmo na modrom nie je ozdoba: lapis + zlato je pôvodná
           egyptská dvojica a bez nej je z toho len tmavé tlačidlo.
           Tvar (radius 8, nie pilulka) ostáva z locku .btn-gold — menila sa
           výplň, nie geometria. */
        .codex-book-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.72rem, 1.05vw, 0.86rem);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: clamp(9px, 1.5vh, 13px) clamp(18px, 2.4vw, 28px);
          white-space: nowrap;
          border: 1px solid ${LAPIS.edge};
          border-radius: 8px;
          background: ${LAPIS.grad};
          color: ${LAPIS.ink};
          box-shadow: ${LAPIS_BTN_SHADOW};
          cursor: pointer;
          transition: background 220ms ease, transform 220ms ease;
        }
        .codex-book-cta:hover { background: ${LAPIS.gradHover}; transform: translateY(-1px); }
        @media (max-width: 767px) {
          .codex-preamble-text { font-size: 14px; line-height: 1.4; }
          .codex-headline { font-size: 2.8rem; letter-spacing: 0.03em; line-height: 1.04; }
          .codex-slider { padding: 0 clamp(8px, 2vw, 16px); }
          .codex-slide { padding: clamp(12px, 2vh, 24px) clamp(4px, 1.5vw, 12px); }
          /* Mobile (2026-06-03): preamble (znenie ústavy + rámik) — zúžiť + posunúť hore.
             Scoped na preamble slide = .codex-slider (nie -book) + .codex-slide (nie -3). */
          .codex-slider:not(.codex-slider-book) .codex-slide:not(.codex-slide-3) {
            justify-content: flex-start;
            padding-top: clamp(24px, 6vh, 56px);
          }
          /* Zúžiť vertikálny odstup medzi headline / rámikom / oath (len preamble má >1 child) */
          .codex-slider:not(.codex-slider-book) .codex-slide:not(.codex-slide-3) > * + * {
            margin-top: clamp(18px, 3vh, 28px);
          }
        }

        /* ── Slide 2: papyrus + index ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 2 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-paper {
          position: relative;
          width: 100%;
          max-width: 980px;
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 14px;
          padding: clamp(22px, 3vh, 34px) clamp(26px, 4.5vw, 48px) clamp(20px, 2.6vh, 28px);
          box-shadow:
            0 12px 36px rgba(110,71,16,0.26),
            0 0 0 3px rgba(201,154,63,0.20);
          display: flex;
          flex-direction: column;
        }
        /* Inner double-border cert frame */
        .codex-paper::after {
          content: '';
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(201,154,63,0.5);
          border-radius: 9px;
          pointer-events: none;
        }
        .codex-paper-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 2.6vw, 28px);
          padding-bottom: clamp(14px, 1.8vh, 22px);
          margin-bottom: clamp(12px, 1.6vh, 18px);
          border-bottom: 1px solid rgba(138,90,20,0.28);
          position: relative;
        }
        /* Decorative diamond on the divider line */
        .codex-paper-header::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 7px;
          height: 7px;
          background: #C99A3F;
          transform: translateX(-50%) rotate(45deg);
          box-shadow:
            0 0 8px rgba(201,154,63,0.6),
            inset 0 0 0 1px rgba(255,236,200,0.5);
        }
        .codex-seal-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        /* Radial gold aura behind seal */
        .codex-seal-wrap::before {
          content: '';
          position: absolute;
          inset: -18%;
          background:
            radial-gradient(closest-side,
              rgba(245,199,61,0.32) 0%,
              rgba(245,199,61,0.18) 38%,
              rgba(245,199,61,0) 72%);
          z-index: 0;
          pointer-events: none;
        }
        .codex-seal {
          position: relative;
          z-index: 1;
          width: clamp(108px, 13vw, 144px);
          height: auto;
          filter: drop-shadow(0 2px 5px rgba(110,71,16,0.45));
        }
        .codex-paper-titles {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .codex-paper-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(1.95rem, 3.6vw, 2.95rem);
          letter-spacing: 0.04em;
          line-height: 0.98;
          color: #5a3a0c;
          margin: 0;
        }
        .codex-paper-title span {
          display: block;
          white-space: nowrap;
        }
        .codex-paper-title .title-decor {
          font-family: 'Cinzel Decorative', 'Cinzel', serif;
          font-style: normal;
          font-weight: 700;
        }
        .codex-paper-subtitle {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-size: clamp(0.7rem, 0.92vw, 0.82rem);
          letter-spacing: 0.02em;
          line-height: 1.35;
          color: rgba(110,71,16,0.78);
          margin: clamp(8px, 1vh, 12px) 0 0;
          text-align: left;
          white-space: nowrap;
        }
        @media (max-width: 767px) {
          .codex-paper {
            padding: 18px 14px 28px;
            max-width: 100%;
            box-sizing: border-box;
          }
          .codex-paper::after { inset: 5px; border-radius: 8px; }
          .codex-paper-header {
            gap: 12px;
            padding-bottom: 12px;
            margin-bottom: 12px;
            flex-wrap: nowrap;
          }
          .codex-paper-titles { min-width: 0; flex: 1 1 auto; }
          .codex-seal { width: 92px; }
          .codex-paper-title { font-size: 1.45rem; letter-spacing: 0.02em; }
          .codex-paper-title span { white-space: normal; }
          /* Mobile: title v 3 riadkoch — The / Dogyptian / Constitution */
          .codex-paper-title .title-decor { display: block; }
          .codex-paper-subtitle {
            font-size: 0.6rem;
            margin-top: 6px;
            letter-spacing: 0.01em;
            white-space: normal;
          }
        }

        .codex-index {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: clamp(20px, 3vw, 40px);
          font-family: 'Cinzel', serif;
          font-size: clamp(0.74rem, 1vw, 0.86rem);
          letter-spacing: 0.04em;
          text-align: left;
          /* Index — natural height, no overflow clipping (bubbles musia presahovať) */
        }
        .codex-index .col {
          display: flex;
          flex-direction: column;
        }
        .codex-row {
          border-bottom: 1px solid rgba(138,90,20,0.20);
          position: relative;
        }
        .codex-row.open {
          z-index: 30;
        }
        .codex-index .col .codex-row:last-child { border-bottom: none; }
        .codex-row-head {
          appearance: none;
          background: transparent;
          border: none;
          padding: 5px 6px;
          width: 100%;
          cursor: pointer;
          display: grid;
          grid-template-columns: 2.4em 1fr;
          align-items: baseline;
          column-gap: 0.4em;
          text-align: left;
          font: inherit;
          color: inherit;
          border-radius: 4px;
          transition: background 160ms ease;
          white-space: nowrap;
        }
        .codex-row-head:hover {
          background: rgba(201,154,63,0.10);
        }
        /* .open highlight len pre touch devices — na PC sa .open class síce nastaví
           cez onClick, ale ZIADNE visual side-effecty (bublina + highlight) */
        @media (hover: none) {
          .codex-row.open .codex-row-head {
            background: rgba(201,154,63,0.14);
          }
        }
        .codex-index .num {
          color: rgba(138,90,20,0.62);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .codex-index .item {
          display: inline;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .codex-index .item .name {
          color: #6e4710;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .codex-index .item .desc {
          color: rgba(38,22,4,0.62);
          font-weight: 400;
          font-style: italic;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .codex-index .item .dash {
          color: rgba(38,22,4,0.34);
          margin: 0 0.32em;
        }
        /* ── PC: bubble tooltip pattern (like /vision pills) ──
           Floating papyrus card with arrow pointing to row.
           Smart flip: rows 1-3 = bubble BELOW (arrow up), rows 4-6 = bubble ABOVE (arrow down). */
        .codex-row-body {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: calc(100% + 10px);
          width: max-content;
          min-width: 180px;
          max-width: clamp(220px, 22vw, 300px);
          background: linear-gradient(135deg, #FAF3E1 0%, #F2E2BD 50%, #E8D29C 100%);
          border: 1.5px solid #C99A3F;
          border-radius: 10px;
          padding: 10px 14px;
          box-shadow:
            0 8px 28px rgba(110,71,16,0.24),
            0 0 0 3px rgba(201,154,63,0.18);
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 180ms ease;
          text-align: left;
        }
        /* Arrow — default: pointing UP (bubble below row) */
        .codex-row-body::after {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-bottom-color: #C99A3F;
        }
        /* Bottom rows (4, 5, 6) — flip bubble ABOVE row, arrow points DOWN */
        .codex-index .col .codex-row:nth-child(n+4) .codex-row-body {
          top: auto;
          bottom: calc(100% + 10px);
        }
        .codex-index .col .codex-row:nth-child(n+4) .codex-row-body::after {
          bottom: auto;
          top: 100%;
          border-bottom-color: transparent;
          border-top-color: #C99A3F;
        }
        .codex-row.open,
        .codex-row:hover,
        .codex-row:focus-within {
          z-index: 50;
        }
        /* PC (hover-capable): trigger LEN cez hover — žiadny focus/click effect */
        @media (hover: hover) and (pointer: fine) {
          .codex-row:hover .codex-row-body {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
        }
        /* Touch devices (mobile): tap-toggle cez .open class */
        @media (hover: none) {
          .codex-row.open .codex-row-body {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
        }
        .codex-row-body-inner {
          /* no overflow:hidden in bubble mode */
        }
        .codex-row-body ul {
          list-style: none;
          margin: 0;
          padding: 0 0 0 12px;
        }
        .codex-row-body li {
          font-family: 'Cinzel', serif;
          font-size: 0.85em;
          font-weight: 500;
          letter-spacing: 0.03em;
          color: #5a3a0c;
          padding: 3px 0;
          position: relative;
        }
        .codex-row-body li::before {
          content: '·';
          color: #C99A3F;
          position: absolute;
          left: -10px;
          font-weight: 700;
          font-size: 1.1em;
        }
        @media (max-width: 767px) {
          .codex-index {
            grid-template-columns: 1fr 1fr;
            font-size: 11px;
            column-gap: 10px;
          }
          .codex-index .col .codex-row:last-child { border-bottom: 1px solid rgba(138,90,20,0.20); }
          .codex-index .col:last-child .codex-row:last-child { border-bottom: none; }
          .codex-row-head {
            grid-template-columns: 1.8em minmax(0, 1fr);
            padding: 6px 3px;
            column-gap: 0.3em;
            white-space: nowrap;
          }
          /* Mobile: len nadpisy */
          .codex-index .item .desc,
          .codex-index .item .dash { display: none; }
          /* Mobile bubble — per-col anchoring aby NEPRESVITALA do druhých slajdov.
             Left col → anchor LEFT to row left, right col → anchor RIGHT to row right.
             Width capped na 80vw / 300px aby zostala v slide viewporte.
             Arrow off na mobile (per-col anchoring misaligns arrow vs row center). */
          .codex-row-body {
            width: min(80vw, 300px);
            min-width: 0;
            max-width: none;
            padding: 11px 14px;
          }
          .codex-index .col:first-child .codex-row-body {
            left: 0;
            right: auto;
            transform: none;
          }
          .codex-index .col:last-child .codex-row-body {
            left: auto;
            right: 0;
            transform: none;
          }
          .codex-row-body::after {
            display: none;
          }
        }

        /* CTA button — Read Full Constitution */
        .codex-cta-wrap {
          display: flex;
          justify-content: center;
          margin-top: clamp(16px, 2.2vh, 24px);
        }
        .codex-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: clamp(11px, 1.5vh, 15px) clamp(26px, 4.5vw, 42px);
          background: linear-gradient(135deg, #F5C73D 0%, #FFB840 35%, #E69E1A 65%, #F5C73D 100%);
          color: #3a2204;
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-size: clamp(0.74rem, 1vw, 0.9rem);
          letter-spacing: 0.24em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 8px;
          border: 1.5px solid rgba(110,71,16,0.45);
          box-shadow:
            0 5px 16px rgba(110,71,16,0.4),
            inset 0 1px 0 rgba(255,255,255,0.45),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          transition: transform 200ms ease, box-shadow 200ms ease, filter 200ms ease;
          cursor: pointer;
          white-space: nowrap;
        }
        /* ── HLAVNÉ CTA NA BLEDOM POVRCHU = LAPIS, NIE ZLATO ──────────────
           Matej 27. 8. 2026: *„čerpáš CTA zo starého brandu, už máme lapis
           tlačítko na bledom pozadí."*
           Dôvod je ten istý, pre ktorý lapis vznikol pri redizajne /map: na
           papyruse je zlatá naraz rámom, dlaždicou AJ tlačidlom, takže hlavné
           CTA je najsvetlejší prvok obrazovky a splýva s tým, čo ho drží. Zlatá
           ostáva konštrukcii („kde som"), lapis berie akciu („čo urobím").
           Recept je ZHODNÝ s tým, čo už drží /pack (.trp-addtrip-btn,
           .trp-dbar-done, .mna-submit, .atl-editor .btn-gold) — vrátane zlatého
           písma, bez ktorého je z lapisu len tmavé tlačidlo bez brandu.
           ⚠️ SCOPED NA .lab-papyrus ZÁMERNE: tú istú triedu .codex-cta nesie aj
           živá /religion, ktorá sa dnes nemenila. Až lab nahradí produkciu,
           scope padne. */
        .lab-papyrus .codex-cta {
          background: ${LAPIS.grad};
          border-color: ${LAPIS.deep};
          color: ${LAPIS.ink};
          box-shadow: ${LAPIS_BTN_SHADOW};
        }
        .lab-papyrus .codex-cta:hover {
          background: ${LAPIS.gradHover};
          box-shadow: ${LAPIS_BTN_SHADOW};
          filter: none;
        }
        .codex-cta:hover {
          transform: translateY(-1px);
          box-shadow:
            0 8px 22px rgba(110,71,16,0.55),
            inset 0 1px 0 rgba(255,255,255,0.6),
            inset 0 -1px 0 rgba(110,71,16,0.2);
          filter: brightness(1.06);
        }
        .codex-cta:active {
          transform: translateY(0);
        }
        @media (max-width: 767px) {
          .codex-cta-wrap { margin-top: 14px; }
          .codex-cta {
            padding: 10px 22px;
            font-size: 0.72rem;
            letter-spacing: 0.2em;
          }
        }

        /* ── Slide 3: the question (cow vs dog visual) ── */
        /* 🔒🔒 LOCK PC HARD (2026-05-24): Slide 3 PC HOTOVÝ. NEDOTÝKAŤ SA.
           Default = MOBILE only (@media max-width:767px).
           PC úpravy LEN na explicit "na PC" / "zruš lock". */
        .codex-slide-3 {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0 !important;
          overflow: visible;
        }
        /* PNGs rendered at page level (outside viewport's overflow:hidden).
           Vždy viditeľné — mimo hero sa odsunú do strán (nie fade-out), ostávajú ako rámovanie. */
        .codex-bleed {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 1;
          z-index: 1;
        }
        /* ╔══════════════════════════════════════════════════════════════════╗
           ║  🔒 LOCKED 2026-05-24 (hektor posunutý o 50px nižšie na PC)       ║
           ║  PC NESMIE byť dotknutý bez výslovného povolenia — Matej hrozí    ║
           ║  právnymi krokmi. Pri akomkoľvek edite v tomto súbore overiť že   ║
           ║  values nižšie ostávajú nedotknuté:                                ║
           ║    cow:    left:-50, bottom:-80, scale(1.14) origin bottom left   ║
           ║    hektor: right:0, bottom:0,  scale(1.08) origin bottom right    ║
           ║  Mobile (@media max-width:767px) môže byť ladený samostatne.      ║
           ╚══════════════════════════════════════════════════════════════════╝ */
        .codex-cow,
        .codex-hektor {
          position: absolute;
          bottom: 0;
          width: 50vw;
          height: 100vh;
          object-fit: contain;
          transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .codex-cow {
          left: -50px;
          bottom: -80px;
          object-position: bottom left;
          transform: scale(1.14);
          transform-origin: bottom left;
        }
        .codex-hektor {
          right: 0;
          bottom: 0;
          object-position: bottom right;
          transform: scale(1.08);
          transform-origin: bottom right;
        }
        /* ── END LOCK ────────────────────────────────────────────────────── */

        /* ── SVÄTOŽIARY ───────────────────────────────────────────────────
           Prstenec je SVG s rovnakým viewBoxom ako fotka a nesie TIE ISTÉ
           triedy (.codex-cow / .codex-hektor), takže LOCKED geometria hore
           platí naň bez jediného vlastného čísla — aj v mobilnej vetve.
           Podrobnosti a poloha prstencov: components/lab/CodexHalo.tsx.

           KRAVA svieti od začiatku (je to jej stav, nie udalosť).
           HEKTOR sa rozsvieti až na pointe — Matej 27. 8. 2026: halo prichádza
           ZA vetou „AND NOT ONE OF THEM BOWS." a je to celá pointa výjavu;
           žiadny text ho nekomentuje a pri scrolle späť zhasne.
           Tu (samostatná /religion-lab) ho spúšťa ČASOVAČ, rovnako ako reveal
           textu; --halo-delay dodáva React, lebo variant 2 sa píše po znakoch
           a jeho dĺžka závisí od počtu znakov. Vo filme /onepage to preberá
           scroll — viď --op-halo v components/lab/OnePage.tsx.

           ⚠️ transition-delay MUSÍ byť dvojhodnotový (0s pre transform).
           Jedna hodnota by odložila aj posun zvieraťa do strán a prstenec by
           za fotkou dobiehal 2,7 sekundy.
           ⚠️ Trvanie transformu je 650 ms ZÁMERNE — je to tá istá hodnota ako
           v LOCKED bloku vyššie. Iné číslo znamená, že sa halo pri odsune
           zvierat vlečie za hlavou. */
        .codex-halo {
          --halo: 1;
          opacity: var(--halo);
          pointer-events: none;
          transition-property: transform, opacity;
          transition-duration: 650ms, 820ms;
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* Mierka rozsvietenia patrí VNÚTORNEJ skupine. Na <svg> by ju prebil
           locknutý scale(1.14)/scale(1.08) — a halo by odletelo od hlavy. */
        .codex-halo-scale {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          transform: scale(calc(0.86 + 0.14 * var(--halo)));
          transition: transform 820ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .codex-halo-hektor { --halo: 0; }
        .codex-bleed.active .codex-halo-hektor {
          --halo: 1;
          transition-delay: 0s, var(--halo-delay, 2700ms);
        }
        .codex-bleed.active .codex-halo-hektor .codex-halo-scale {
          transition-delay: var(--halo-delay, 2700ms);
        }
        @media (prefers-reduced-motion: reduce) {
          .codex-halo-hektor { --halo: 1; }
          .codex-halo,
          .codex-halo-scale { transition: none; }
        }
        /* Scroll posun (2026-06-02): mimo hero (bleed nemá .active) sa krava odsunie
           doľava, Hektor doprava → stred sa uvoľní pre obsah, okraje ostanú ako
           rámovanie. Locked scale + origin zachované, pridaný len translateX. */
        /* ── LAB: mimo hero sekcie sa krava/Hektor STLMIA.
           Na tmavej stránke sú čierne fotky nad čiernym pozadím prakticky
           neviditeľné, takže cez ne biely text pokojne prejde. Na papyruse je to
           opačne: tmavý inkoust padne na tmavého psa a posledné slová riadkov
           (KAŽDÉHO, PSOV, OSUD) sa stratia. Preto tu obrázky mimo sekcie 0
           ustupujú — nie posunom (ten je LOCKED nižšie), ale priehľadnosťou. */
        /* ── LAB: pilulka „klikni na knihu" pod knihou. Zdroj je zdieľaný
           ConstitutionBook (tmavé sklo rgba(0,0,0,.32) — na papyruse sa v nej
           zlatý text stratí). Prefarbujeme ju TU, cez .lab-papyrus, aby ostrá
           /religion ostala presne taká, aká je. */
        .lab-papyrus .cb-hint {
          background: rgba(255,252,244,0.78);
          border-color: rgba(140,96,20,0.45);
          color: #6E4A12;
        }
        .lab-papyrus .cb-hint-dot { background: #A3782B; box-shadow: none; }

        .codex-bleed:not(.active) { opacity: 0.26; }
        .codex-bleed { transition: opacity 420ms ease; }

        .codex-bleed:not(.active) .codex-cow {
          transform: translateX(-25%) scale(1.14);
        }
        .codex-bleed:not(.active) .codex-hektor {
          transform: translateX(25%) scale(1.08);
        }
        /* 🔒 PC/DESKTOP SLIDE-3 HERO LOCKED 2026-06-03 (Matej „super religion hotovo na PC lock"):
           overlay padding-top clamp(64px,9vh,96px) [1.2 BILLION vyššie] · .q-call 1.7em [DOGLOVERS]
           · .codex-question-big margin-top clamp(12px,1.8vh,24px) v @media(min-width:768px) [BOW→DOGLOVERS odstup]
           · "ARE YOU READY?" odstránené. NEMENIŤ PC bez Matejovho OK. Mobil = vlastný HARD LOCK nižšie. */
        .codex-3-overlay {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          /* Premenná, nie holá hodnota — deliaca čiara pod kravou z nej počíta
             svoju polohu, aby ležala PRESNE v strede medzery. */
          --ov-gap: clamp(18px, 2.8vh, 32px);
          gap: var(--ov-gap);
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          /* Asymetrický padding: top > bottom posúva text ~50px nižšie
             (justify-content:center centruje medzi padding edges). Kompenzuje
             priestor pod viewportom obsadený dots-mi, aby text sedel približne
             na strede obrazovky. */
          padding: clamp(64px, 9vh, 96px) clamp(12px, 2vw, 20px) clamp(20px, 4vh, 40px);
          height: 100%;
        }
        /* ── TEXTY 2. OBRAZU SÚ ZMENŠENÉ (−5 % → a znova −15 %) ────────────
           Matej 27. 8. 2026: *„zmenši texty o 5% všetky."*, o hodinu neskôr
           *„texty su moc velke a nezmestia sa = zmenši ich všetky o 15%"* (vtedy
           už horný nav prekrýval riadok „1.2 BILLION"). Prepočítané v ZDROJI,
           nie prebité vo filme: /onepage aj /religion-lab čítajú tento istý blok,
           druhá sada čísel by sa rozišla pri prvej ďalšej úprave.
           ⚠️ Druhé kolo škáluje od TOHO, ČO MATEJ VIDEL — teda × 0.85 na aktuálne
           čísla, nie na pôvodné. Prvé kolo (5 %) sa netýkalo .codex-microcopy,
           .codex-cta-sub, .codex-turn ani .codex-cta-line, takže niektoré
           riadky sú dnes −19 % a niektoré −15 % oproti originálu. Zámerne:
           zachovať treba POMERY, ktoré si odklepol, nie pôvodné číslo.
           ⚠️ Tlačidlo .codex-cta (BECOME DOGYPTIAN) sa NEZMENŠUJE — je zdieľané
           so slajdami 1–2 a je to CTA lock, nie text obrazu.
           ⚠️ Násobia sa VŠETKY tri čísla clampu — meniť len strop znamená, že
           sa zmena na Matejovom ~500 px okne vôbec neprejaví (tam vyhráva vw).
           ⚠️ Mobil (@media max-width: 767px) ostal NEDOTKNUTÝ — slide 3 mobil
           je HARD LOCKED od 24. 5. 2026, mení sa len na výslovné „zruš lock".
           Hodnoty v em (.q-call 1.7em, .q-action 0.65em) sa zmenšili samy —
           dediť sa nesmie dvakrát. */
        /* ══ NOVÝ TEXTING 2. OBRAZU — „YET." (27. 8. 2026) ══════════════════
           Matej: *„skúsme navrhnúť nový texting, virálny ale menej slovný
           vystihujúci podstatu čo chceme obrázkom povedať"* + *„spracuj to tak
           aby to bolo profesionalne a zaujimave nie fadne"*.

             A COW HAS / 1.2 BILLION / BELIEVERS
             A DOG HAS / NONE
             YET.

           STAVBA JE ÚČTOVNÁ, NIE BÁSNICKÁ: dva riadky s tou istou kostrou
           (lead → číslo → jednotka) pod sebou, aby oko porovnávalo ČÍSLA a nie
           vety. Preto majú obe tvrdenia tie isté triedy — rozdiel je jediný a je
           to celý vtip: číslo psa je PRÁZDNE.

           🎨 PALETA = TÁ ISTÁ AKO ÚVODNÉ MOTTO (Matej 28. 8. 2026: *„nepáči sa mi
              to je to prehnané — použi lapisovú čiernu a zlatú resp farby aké sú
              aj v úvodnom motte… rob plné písma nie prázdne — 1.2 bilion zlata
              none lapis?"*). Zdroj hodnôt = .ph-h1 v DogPlanetLab.tsx:
              čierna #23150a · plná tmavá zlatá #6E4A12. Lapis #0A1A4A je tá istá
              modrá ako obruč medailónu v nave.
              JEDEN PRVOK = JEDNA FARBA, každá z tých troch má svoju úlohu:
                zlatá = bohatstvo cudzieho boha (1.2 BILLION)
                lapis = naša strana (NONE)
                čierna = verdikt (YET.)
           🔴 ŽIADNE GRADIENTY DO PÍSMEN A ŽIADNA ŽIARA — obe verzie padli naraz.
              DogPlanetLab to má zapísané pri motte: LAB.goldText má strednú
              zarážku #D8A93F, svetlejšiu než podklad, takže slovo v STREDE zmizne
              („1.2 BILLION" aj „YET." tak boli najbledšie práve v ťažisku).
              Na papyruse drží jedine PLNÁ TMAVÁ farba.
           🔴 PLNÉ PÍSMO, NIE OBRYS. Prvá verzia kreslila „NONE" obrysom
              (-webkit-text-stroke + priehľadná výplň) ako „dieru na mieste, kde
              má krava zlato". Nápad znel dobre, na obrazovke bol nečitateľný
              (Matej: *„to none je otrasné"*). Absenciu nesie SLOVO, farba ju
              nemá čím zosilniť.
           ⚠️ Písmo je väčšie než pri starom textingu: sedem blokov sa nezmestilo,
              tri sa zmestia. Zmenšenie o 15 % z 23:38 riešilo TAMTEN problém.

           Staré triedy .codex-stat-* / .codex-turn / .codex-cta-line nižšie už
           NIKTO NEVYKRESĽUJE (markup nahradený, v gite je). Nechávam ich, kým
           Matej výber neuzavrie — vrátiť starý texting je potom len markup. */
        .codex-claim {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(2px, 0.5vh, 6px);
          margin: 0;
          position: relative;
          text-align: center;
        }
        /* Deliaca čiara je ::after KRAVY, nie samostatný prvok — každý priamy
           potomok overlayu má vlastný prah odhaľovania (--tx-at / nth-child),
           takže čiara ako súrodenec by posunula číslovanie celej sekvencie.

           ⚠️ POLOHA SA POČÍTA, NEODHADUJE (Matej 28. 8. 2026: *„čiara musí byť
           v strede a horne a dolne slovo musí byť rovnako od seba"*). Predtým
           visela na pevnom odsadení od kravy, takže pri každej inej výške okna
           sedela inde v medzere — a keďže medzera rástla s vh, klesala k „A DOG
           HAS". Dnes je to polovica SKUTOČNEJ medzery: --ov-gap (rozostup
           overlayu) + --rule-gap (prídavok tejto dvojice).
           translateY(50%) posunie čiaru o pol jej výšky, takže na vypočítanom
           mieste leží jej STRED, nie spodná hrana. */
        .codex-claim-cow {
          --rule-gap: clamp(24px, 4vh, 48px);
          margin-bottom: var(--rule-gap);
        }
        .codex-claim-cow::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: calc((var(--ov-gap) + var(--rule-gap)) / -2);
          transform: translate(-50%, 50%);
          width: min(300px, 62%);
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(110,74,18,0.42), transparent);
        }
        .cl-lead {
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-weight: 500;
          font-size: clamp(0.64rem, 0.9vw, 0.86rem);
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(35,21,10,0.52);
          margin-bottom: clamp(2px, 0.6vh, 7px);
        }
        /* ČÍSLO KRAVY — PLNÁ TMAVÁ ZLATÁ (#6E4A12 = slová „dog"/„god" v motte). */
        .cl-figure {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(2.3rem, 6.4vw, 4.6rem);
          line-height: 0.96;
          letter-spacing: 0.02em;
          white-space: nowrap;
          color: #6E4A12;
        }
        /* ČÍSLO PSA — PLNÝ LAPIS. Tá istá modrá ako obruč medailónu v nave. */
        .cl-figure-void {
          color: #0A1A4A;
        }
        /* JEDNA DEKLARÁCIA PRE „BELIEVERS" AJ „YET..." (Matej 28. 8. 2026:
           *„YET daj veľkosti ako je believers aj váha — skratka totožné nech to
           má fazónu"*). Zámerne JEDEN selektor, nie dve zhodné kópie: dve kópie
           sa rozídu pri prvej úprave a „fazóna" je práve tá zhoda. */
        .cl-unit,
        .codex-yet {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.92rem, 1.55vw, 1.4rem);
          line-height: 1;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(35,21,10,0.88);
        }
        .codex-yet {
          margin: clamp(4px, 1vh, 12px) 0 0;
          /* Preloženie pridáva medzeru AJ ZA posledný znak, takže vycentrovaný
             text sedí o pol medzery vľavo. Záporný pravý okraj to presne ruší. */
          margin-right: -0.2em;
        }

        .codex-stat-number {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(2px, 0.4vh, 6px);
        }
        /* Riadok 1: "1.2 BILLION" — hero veľkosť + gold gradient, inline row */
        .codex-stat-row {
          display: flex;
          align-items: baseline;
          gap: clamp(0.5em, 1.3vw, 0.75em);
        }
        .codex-stat-row-bottom {
          gap: clamp(0.3em, 0.8vw, 0.45em);
          white-space: nowrap;
          flex-wrap: nowrap;
        }
        /* Parenthetical: "(15% worldwide)" — rovnaká veľkosť ako PEOPLE, len tlmená farba + italic.
           Hierarchy: row 1 (BILLION) > row 2 (PEOPLE) > row 3 (bow to the cow).
           Row 2 šírka ≈ row 1 šírka, font o niečo menší. */
        .codex-stat-note {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-style: italic;
          font-size: clamp(0.93rem, 1.78vw, 1.7rem);
          color: rgba(60,40,12,0.52);
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .codex-stat-l1,
        .codex-stat-l2 {
          font-size: clamp(1.94rem, 5.17vw, 3.88rem);
          line-height: 1;
          background:
            linear-gradient(100deg, #6E4A12 0%, #A3782B 30%, #D8A93F 50%, #A3782B 70%, #6E4A12 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: none;
        }
        /* Riadok 2: "PEOPLE" — rovnaká veľkosť ako parenthetical.
           Hierarchy: row 1 (BILLION) > row 2 (PEOPLE) > row 3 (bow to the cow).
           Row 2 šírka ≈ row 1 šírka, font o niečo menší. */
        .codex-stat-l3 {
          font-size: clamp(0.93rem, 1.78vw, 1.7rem);
          line-height: 1;
          color: rgba(35,22,8,0.90);
          font-weight: 400;
          filter: none;
        }
        .codex-stat-sub {
          font-family: 'Cinzel', serif;
          font-weight: 900;
          font-style: italic;
          font-size: clamp(1.09rem, 1.61vw, 1.5rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #A3782B;
          text-decoration: underline;
          text-decoration-color: #A3782B;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
          margin: -8px 0 0;
          filter: none;
        }

        /* ══ VARIANT 2 — SÚVISLÝ ODSEK, KTORÝ SA PÍŠE ═══════════════════════
           Matej 27. 8. 2026: *„ten text taký kostrbatý, rôzne velkosti a vela,
           vyzerá to amatérsky… zosúladiť do riadkov ako obyčajný text, ktorý je
           vopred napísaný, ale scrolingom dostáva život, ako keby sa písal."*

           Rozdiel oproti variantu 1 je JEDEN a nesie celý ten „amatérsky" pocit:
           variant 1 stavia hierarchiu na PIATICH veľkostiach písma (4.56rem číslo,
           2rem PEOPLE, 1.76rem podčiarknuté, 1.38rem obvinenie, 0.93rem výzva),
           variant 2 na JEDNEJ veľkosti a farbe. Zlaté sú len čísla — sú to jediné
           slová, ktoré nesú argument, takže jediné, ktoré smú z riadku vystúpiť. */
        .codex-v2 {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.81rem, 1.1vw, 1.02rem);
          /* Riadkovanie je väčšie než pri bežnom odseku zámerne: riadky sú tu
             VETY a každá má dosadnúť samostatne, nie splynúť do bloku textu. */
          line-height: 1.9;
          letter-spacing: 0.03em;
          color: rgba(35,22,8,0.88);
          margin: 0;
          /* Šírka je odmeraná z výjavu, nie zvolená — viď .codex-turn nižšie.
             Toto je ŠIROKÁ hodnota a smie byť: odsek stojí VYSOKO vo výjave (viď
             .is-v2 nižšie), kde je pás medzi zvieratami ~430 px. Nižšie by sa
             nezmestila — tam sa zužuje na ~225 px. */
          max-width: clamp(236px, 26vw, 372px);
          filter: none;
        }
        /* Vyvážené zalomenie je tu to, čo z troch viet robí ODSEK a nie zoznam:
           bez neho vypadne posledný riadok vety ako ohryzok („THE COW." samo na
           riadku) a text vyzerá nedbalo — presne ten pocit, ktorý mal variant 2
           odstrániť. Balance vyrovná riadky v rámci jednej vety, nie naprieč. */
        /* pretty, NIE balance. Balance vyrovnáva riadky do rovnakej dĺžky, takže
           ich robí KRATŠIE než dovolená šírka — z dvojriadkovej vety spraví
           trojriadkovú a odsek narastie o tretinu. pretty rieši to, čo tu naozaj
           vadilo (osamotené slovo na poslednom riadku), a šírku využije. */
        .v2-line { display: block; text-wrap: pretty; }
        /* ⚠️ MEDZERY MUSIA PREŽIŤ, ALE RIADOK SA MUSÍ ZALOMIŤ. Znak v samostatnom
           <span> stráca medzeru pri bežnom normal (HTML ju zbalí medzi značkami),
           pre ju zachová, ale zakáže zalomenie — potom text vyjde z výjavu a
           prejde cez psa. pre-wrap na KONTAJNERI robí oboje; na znaku nič. */
        .codex-v2, .codex-v2-close { white-space: pre-wrap; }
        /* Dôraz nesie FARBA a váha, NIE veľkosť — inak sa vrátia „rôzne velkosti". */
        .v2-gold {
          color: #A3782B;
          font-weight: 700;
        }
        .codex-v2-cta {
          margin-top: clamp(16px, 2.6vh, 34px);
          gap: clamp(14px, 2vh, 22px);
          /* ⚠️ Bez tohto je zhluk široký ako TLAČIDLO (najširšie dieťa flexu),
             takže percentuálna max-width vety sa počíta z ~230 px a veta sa
             zalomí, hoci na obrazovke je miesta dosť. */
          width: 100%;
        }
        .codex-v2-close {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.81rem, 1.1vw, 1.02rem);
          line-height: 1.75;
          letter-spacing: 0.03em;
          color: rgba(35,22,8,0.88);
          margin: 0;
          /* Užšia než odsek nad ňou a posunutá doľava: leží nižšie, kde sa pás
             medzi zvieratami zužuje a Hektorova papuľa vyčnieva doľava. */
          max-width: clamp(214px, 23vw, 332px);
          margin-right: 2.2vw;
          filter: none;
        }
        /* PÍSANIE — samostatná stránka (/religion-lab) beží na časovači.
           Vo filme (/onepage) sa toto VYPÍNA a poradie znakov číta scroll —
           viď .op-root #op-religion .v2-ch v OnePage.tsx. */
        /* ODSEK STOJÍ VYSOKO, NIE V STREDE. Variant 1 má šesť krátkych blokov
           a znesie centrovanie; variant 2 je súvislý text, ktorý pri centrovaní
           spadne do najužšieho miesta výjavu a rozpadne sa na deväť útržkov —
           presne to „vela riadkov", ktoré mal odstrániť. Hore je pás o dve
           tretiny širší, takže tie isté vety zaberú menej riadkov a text sa dá
           čítať ako odsek. */
        .codex-3-overlay.is-v2 {
          justify-content: flex-start;
          /* Dosť vysoko, aby bol pás široký, ale nie nalepené na nav — medzi
             navom a prvým riadkom má ostať dych. */
          padding-top: clamp(128px, 21vh, 250px);
        }

        .v2-ch { opacity: 0; }
        .codex-section.in-view .v2-ch {
          animation: v2type 180ms linear forwards;
          animation-delay: calc(var(--i, 0) * 18ms);
        }
        @keyframes v2type { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .v2-ch { opacity: 1; }
          .codex-section.in-view .v2-ch { animation: none; }
        }
        /* Prepínač variantov — LEN pre lab, nikdy sa nedostane na ostrý web. */
        .v2-switch {
          position: fixed;
          right: 12px;
          bottom: 58px;
          z-index: 60;
          display: flex;
          gap: 2px;
          padding: 3px;
          border-radius: 8px;
          background: rgba(20,12,4,0.82);
          border: 1px solid rgba(201,154,63,0.42);
        }
        .v2-switch button {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          padding: 4px 9px;
          border-radius: 6px;
          border: 0;
          background: transparent;
          color: rgba(245,236,220,0.72);
          cursor: pointer;
        }
        .v2-switch button.is-on {
          background: rgba(201,154,63,0.9);
          color: #241606;
        }

        /* ── PSIA STRANA + OTOČNÝ BOD (Matej 27. 8. 2026) ──────────────────
           Sekcia mala symetrický obrázok a nesymetrický text. Zrkadlo kravy
           používa ZÁMERNE tie isté triedy (.codex-stat-*), aby sa oba fakty
           čítali ako jeden pár; mení sa len mierka. */
        .codex-stat-dog {
          margin-top: clamp(7px, 1.2vh, 17px);
        }
        /* „30%" sú dva znaky, „1.2 BILLION" dve slová — pri rovnakej veľkosti
           písma by psia strana opticky pôsobila drobnejšie, hoci hovorí
           DVOJNÁSOBOK. Zmenšenie je preto mierne: má ostať druhým hlasom páru,
           nie poznámkou pod čiarou. */
        .codex-stat-dog .codex-stat-l1 {
          font-size: clamp(1.58rem, 3.82vw, 2.86rem);
        }
        .codex-stat-dog .codex-stat-l3 {
          font-size: clamp(0.83rem, 1.51vw, 1.43rem);
        }
        .codex-stat-sub-dog {
          margin-top: -4px;
        }
        /* OTOČNÝ BOD — jediná veta sekcie, ktorá netvrdí fakt, ale obviňuje.
           Preto tmavý inkoust namiesto zlatej: obe štatistiky nad ňou sú zlaté,
           takže tretia zlatá by splynula do zoznamu a pointa by zanikla. */
        .codex-turn {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: clamp(0.83rem, 1.23vw, 1.17rem);
          line-height: 1.24;
          letter-spacing: 0.045em;
          text-transform: uppercase;
          color: rgba(35,22,8,0.92);
          /* ZÁMERNE NIE balance. Vyvážené zalomenie dá dva rovnako dlhé riadky
             („AND NOT ONE / OF THEM BOWS.") a ten druhý si posledné slovo položí
             na Hektorovu papuľu — pás je dole užší, nie symetrický. Prirodzené
             zalomenie pri tejto šírke drží obidva riadky pod hranicou psa.
             ⚠️ ŠÍRKA JE ODMERANÁ, NIE ODHADNUTÁ: voľný pás medzi kravou
             a Hektorom má pri y≈570 na 1440px zhruba 225 px (krava končí ~600,
             Hektorova papuľa začína ~825). Preto ~220 px, nie viac. */
          text-wrap: normal;
          /* ⚠️ ŠÍRKA JE TU OBMEDZENIE VÝJAVU, NIE VKUS. Voľný pás medzi kravou
             a Hektorom sa smerom nadol ZUŽUJE (pri y≈600 na 1440px má ~230 px),
             takže jednoriadková veta cez 470 px si posledné dve slová položí na
             tmavého psa a tam zmiznú. Dvojriadkové zalomenie je zároveň lepšia
             dramaturgia — pauza padne presne pred slovo BOWS. */
          max-width: clamp(178px, 15.4vw, 220px);
          /* Pauza pred obvinením je väčšia než rozostupy medzi faktami — je to
             zlom v argumente, nie ďalšia položka zoznamu. */
          margin: clamp(14px, 2.5vh, 32px) 0 0;
          /* Posun DOĽAVA o polovicu tejto hodnoty (centrovaný flex item).
             Voľný pás medzi zvieratami nie je symetrický voči stredu overlayu:
             Hektorova papuľa vyčnieva doľava viac, než krava doprava, takže
             stred pásu leží asi 15 px vľavo od stredu textu. Bez posunu sedí
             „F" v slove OF presne na psom nose. Jednotka je vw zámerne — pes je
             škálovaný k šírke okna, takže posun sa musí hýbať s ním. */
          margin-right: 2.2vw;
          filter: none;
        }
        /* Veta nad tlačidlom. „only" robí z milióna malé číslo vedľa 1,2
           miliardy — pointa je v tom slove, nie vo veľkosti písma, takže
           ostáva tlmená a tlačidlu neuberá. */
        .codex-cta-line {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-size: clamp(0.68rem, 0.83vw, 0.79rem);
          line-height: 1.38;
          letter-spacing: 0.015em;
          color: rgba(35,22,8,0.72);
          /* JEDEN RIADOK (Matej 28. 8. 2026: *„toto daj do jedneho riadku pod CTA"*).
             ⚠️ Strop šírky sa MUSEL zrušiť, nie zväčšiť: pôvodných ~212 px lámalo
             vetu na tri riadky a akýkoľvek strop len posúva, na ktorom slove sa
             zlomí. Jediné, čo počet riadkov naozaj zaručí, je nowrap.
             ⚠️ Riadok stojí POD tlačidlom, takže je najužším prvkom výjavu —
             na mobile má vlastný strop nižšie. */
          white-space: nowrap;
          margin: 0;
          filter: none;
        }
        .codex-question-big {
          font-family: 'Cinzel', serif;
          font-weight: 400;
          font-style: normal;
          /* PC: variant A copy zväčšená pre punch (mobile má vlastný override 15px) */
          font-size: clamp(1.01rem, 1.45vw, 1.41rem);
          line-height: 1.35;
          letter-spacing: 0.015em;
          margin: 0;
          max-width: clamp(280px, 32vw, 480px);
          text-wrap: balance;
          color: rgba(35,22,8,0.82);
        }
        .codex-question-big .accent {
          display: block;
          margin-top: 0.4em;
          color: rgba(35,22,8,0.90);
          filter: none;
        }
        /* PC: DOGLOVERS? = bold, zväčšené (hero call) */
        .codex-question-big .q-call {
          display: inline-block;
          font-weight: 700;
          font-size: 1.7em;
          letter-spacing: 0.025em;
        }
        /* PC-only: väčší odstup medzi "bow to the cow" a DOGLOVERS
           (scoped na min-width:768px — mobil je HARD LOCKED, nededí) */
        @media (min-width: 768px) {
          .codex-question-big {
            margin-top: clamp(12px, 1.8vh, 24px);
          }
        }
        /* PC: LET'S WORSHIP OUR DOGS = šírka < tlačítka pod (menšie ako button) */
        .codex-question-big .q-action {
          display: inline-block;
          font-size: 0.65em;
          letter-spacing: 0.1em;
          margin-top: 0.5em;
        }
        /* Micro-copy pod CTA — body font (Inter), zúžená na šírku tlačítka */
        .codex-microcopy {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 400;
          font-style: normal;
          font-size: clamp(0.58rem, 0.7vw, 0.66rem);
          line-height: 1.4;
          letter-spacing: 0.01em;
          color: rgba(60,40,12,0.62);
          margin: 0;
          max-width: clamp(240px, 22vw, 320px);
          text-wrap: balance;
          text-align: center;
        }
        /* Sub-link pod CTA — sekundárny destination signal */
        .codex-cta-sub {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: clamp(0.59rem, 0.78vw, 0.7rem);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(201,154,63,0.8);
          text-decoration: none;
          border-bottom: 1px solid rgba(201,154,63,0.35);
          padding-bottom: 2px;
          transition: color 180ms ease, border-color 180ms ease;
        }
        .codex-cta-sub:hover {
          color: #8a5a14;
          border-color: rgba(140,96,20,0.6);
        }
        /* CTA cluster: micro-copy + button + sub-link as a single tight block */
        .codex-cta-cluster {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(10px, 1.4vh, 16px);
        }
        /* ── MOBIL: obmedzenie šírky z PC tu NEPLATÍ ──────────────────────
           Na mobile stoja krava a Hektor POD textom, nie vedľa neho, takže úzky
           pás medzi nimi neexistuje a stiahnutá pointa by tu bola menšia než
           fakty nad ňou — presne to, čo mala oprava odstrániť.
           Nové triedy z 27. 8. 2026; mobilného HARD LOCKu nižšie sa netýkajú. */
        @media (max-width: 767px) {
          .codex-turn {
            font-size: clamp(1.14rem, 5.2vw, 1.42rem);
            max-width: 92%;
            margin-right: 0;
          }
          /* Strop šírky je preč aj tu: pri nowrap nevie zalomiť, len by vetu
             pretlačil von z rámu. Počet riadkov drží nowrap, veľkosť drží clamp
             — pri 320 px vychádza veta na ~223 px, teda sa zmestí. */
          .codex-cta-line {
            font-size: clamp(0.82rem, 3.4vw, 0.95rem);
          }
          /* Na mobile stoja zvieratá POD textom, takže úzky pás neexistuje a
             odsek smie využiť šírku. Centrovanie sa sem tiež vracia — hore
             netreba uhýbať ničomu. */
          .codex-3-overlay.is-v2 {
            justify-content: center;
            padding-top: clamp(48px, 8vh, 92px);
          }
          /* ⚠️ Písmo je na mobile MENŠIE než na PC zámerne. Celý zmysel variantu 2
             je, že jedna veta = jeden riadok; pri väčšom písme sa na 390 px
             odlomí posledné slovo („THE COW.", „A DOG.") a vráti sa presne ten
             rozdrobený vzhľad, kvôli ktorému variant 2 vznikol. */
          .codex-v2 { max-width: 97%; font-size: clamp(0.84rem, 3.66vw, 1.08rem); }
          .codex-v2-close { max-width: 97%; margin-right: 0; font-size: clamp(0.84rem, 3.66vw, 1.08rem); }
          .codex-stat-dog { margin-top: clamp(8px, 1.4vh, 16px); }
        }

        @media (max-width: 767px) {
          /* 🔒🔒 LOCK MOBILE HARD (2026-05-24): Slide 3 mobile HOTOVÝ. NEDOTÝKAŤ SA.
             Cow + Hektor scale/position, padding-top, BOW size, copy variant A,
             microcopy hide — všetko finálne. Úpravy LEN na explicit "zruš lock". */
          .codex-cow {
            height: clamp(72vh, 90vh, 106vh);
            /* Mobile: posun o 20px doprava (left: -14vw + 20px) */
            left: calc(-14vw + 20px);
            /* Mobile: posun o 50px nadol (top: 0 → top: 50px) */
            top: 50px;
            /* Mobile: +5% +15% nad PC scale (1.14 × 1.05 × 1.15 ≈ 1.377) */
            transform: scale(1.377);
            transform-origin: bottom left;
          }
          .codex-hektor {
            height: clamp(72vh, 90vh, 106vh);
            /* Mobile: posun o 30px doľava, potom o 15px doprava (2026-05-31) → -14vw + 15px */
            right: calc(-14vw + 15px);
            /* Mobile: posun o 50px nadol (2026-05-31) */
            top: 50px;
            /* Mobile: +10% +15% −10% nad PC scale, +10% (2026-05-31) → 1.08 × 1.10 × 1.15 × 0.90 × 1.10 ≈ 1.352 */
            transform: scale(1.352);
            transform-origin: bottom right;
          }
          /* Scroll posun (mobile): jemný odsun 25% — okraje ostanú ako rámovanie */
          .codex-bleed:not(.active) .codex-cow {
            transform: translateX(-25%) scale(1.377);
          }
          .codex-bleed:not(.active) .codex-hektor {
            transform: translateX(25%) scale(1.352);
          }
          .codex-3-overlay {
            max-width: 320px;
            gap: 14px;
            /* Mobile: anchor top — match slide 1 headline Y position.
               flex-start + minimal padding-top → content ide čo najvyššie. */
            justify-content: flex-start;
            /* Mobile (2026-06-03, Matej OK): overlay obsah posunutý o +75px nadol */
            padding-top: calc(clamp(10px, 2vh, 24px) + 75px);
            padding-bottom: clamp(20px, 4vh, 40px);
          }
          .codex-stat-number { font-size: clamp(2rem, 12vw, 3rem); }
          .codex-stat-sub {
            /* Mobile: BOW TO THE COW šírkovo ≈ horný riadok „1.2 BILLION" */
            font-size: 1.35rem;
            letter-spacing: 0.08em;
          }
          .codex-question-big { font-size: 15px; line-height: 1.35; }
          /* Mobile: DOGLOVERS + ARE YOU READY = veľký biely bold call.
             LET'S WORSHIP OUR DOGS = jeden riadok normal weight. */
          .codex-question-big .q-call {
            display: inline-block;
            font-size: 1.7rem;
            font-weight: 700;
            /* LAB: na papyruse #fff = neviditeľné. Komentár nad blokom hovorí
               „veľký biely bold call" — v svetlom režime je to veľký ČIERNY. */
            color: rgba(35,22,8,0.90);
            letter-spacing: 0.04em;
            line-height: 1.15;
          }
          .codex-question-big .q-action {
            display: inline-block;
            white-space: nowrap;
            margin-top: 6px;
          }
        }

        /* ── Scroll hint ── */
        .codex-scrollhint {
          position: fixed;
          left: 50%;
          bottom: clamp(14px, 3vh, 28px);
          transform: translateX(-50%);
          appearance: none;
          background: transparent;
          border: none;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 26px;
          line-height: 1;
          color: rgba(201,154,63,0.85);
          filter: drop-shadow(0 1px 2px rgba(110,71,16,0.25));
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms ease;
          z-index: 6;
        }
        .codex-scrollhint.show {
          opacity: 1;
          pointer-events: auto;
        }
        @media (prefers-reduced-motion: no-preference) {
          .codex-scrollhint.show span {
            display: inline-block;
            animation: codexBounce 1.8s ease-in-out infinite;
          }
        }
        @keyframes codexBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        /* ══ REŽIM FILMU (onepage) ═══════════════════════════════════════════
           Prepnutie z „obrazovka s vlastným scrollom" na „kus dlhého plátna".
           Mení sa VÝHRADNE scroll a výška — rozostupy, typografia a LOCKED
           geometria kravy/Hektora ostávajú netknuté. Všetko je pod .codex-flow,
           takže samostatná /religion-lab aj LabShell ostávajú presne ako boli. */
        /* clip, nie hidden: hidden by z prvku spravil scroll kontajner na OBOCH
           osiach a zvislý scroll filmu by sa oň zasekol. clip oreže a nescrolluje.
           Orezanie tu byť MUSÍ — nesie ho pôvodná stránka cez overflow-hidden
           a drží ním kravu (50vw, left -50px, scale 1.14) a Hektora vnútri.
           Bez neho preteká stránka vodorovne (pri 500 px o 55 px) a telo webu
           dostane bočný scroll, ktorý tam nemá čo robiť. */
        .codex-flow.codex-page { height: auto; overflow-x: clip; overflow-y: visible; }
        .codex-flow .codex-scroll {
          flex: none;
          overflow-x: clip;
          overflow-y: visible;
          height: auto;
          scroll-snap-type: none;
        }
        .codex-flow .codex-section {
          height: auto;
          min-height: 100dvh;
          scroll-snap-align: none;
          scroll-snap-stop: normal;
        }
        .codex-flow .codex-slider { height: auto; min-height: 100dvh; }
        .codex-flow .codex-slide-3 { height: auto; min-height: 100dvh; }
        /* Bleed (krava + Hektor) je absolute voči STRÁNKE. Tá je v filme vysoká
           tri obrazovky, takže bez výšky by obe zvieratá sadli na spodok
           posledného výjavu — o dve obrazovky nižšie, než majú stáť.
           ⚠️ position sa tu opakuje ZÁMERNE, hoci ho .codex-bleed už má.
           V onepage sú náboženstvo, vízia aj príbeh namontované NARAZ a každý
           z tých súborov nesie vlastný globálny blok s .lab-papyrus > *
           { position: relative }. Tie sa vkladajú neskôr, majú rovnakú
           špecificitu (0,1,0) a pravidlo teda prebijú — z bleedu sa stane prvok
           V TOKU, zaberie celú obrazovku a odsunie výjav o 702 px nadol.
           Dvojtriedny zápis (0,2,0) to prebije späť bez ohľadu na poradie. */
        .codex-flow .codex-bleed {
          /* STICKY, nie absolute — a záporný spodný okraj mu zruší miesto v toku.
             Na pôvodnej stránke je obrazovka pevná, takže krava a Hektor stoja
             samy od seba. Vo filme sa scrolluje: ako absolute im odscrolluje
             spodná hrana do obrazu a pes sa zreže vodorovným rezom v polovici
             tela. Prilepené držia rám výjavu presne ako predtým a vlastnú
             choreografiu (odsun do strán + stlmenie na 0.26, keď sekcia stratí
             .active) si robia ďalej samy.
             ⚠️ position sa tu opakuje zámerne aj kvôli tomu, že .lab-papyrus > *
             z vízie a príbehu prebíja .codex-bleed pri zhodnej špecificite —
             viď komentár v hlavičke tohto bloku. */
          position: sticky;
          top: 0;
          left: 0;
          height: 100dvh;
          margin-bottom: -100dvh;
        }

        /* ── REVEAL PLATÍ AJ VO FILME — okrem PRVÉHO výjavu ────────────────
           🔴 Tu predtým stálo plošné opacity:1 pre celé náboženstvo, teda reveal
           vypnutý natvrdo. Bola to náhrada za chybu, ktorá je odvtedy opravená
           v koreni (triedu .in-view drží React, nie classList — viď observer
           hore). Matej 26. 8. 2026 to vrátil: *„to písmo v 2. sekcii príde mi to
           také suché a nezaujímavé… tá citácia z ústavy sa zasekne… nech je to
           plynulé ako na ostrom webe."*
           PRVÝ výjav (krava a pes) výnimku má a musí ju mať: jeho text nastupuje
           podľa polohy vo filme (--op-txt z OnePage), nie podľa toho, kedy sa
           sekcia objaví. Dve animácie na tom istom texte by sa bili. */
        .codex-flow .codex-section[data-idx="0"] .codex-slide,
        .codex-flow .codex-section[data-idx="0"] .codex-3-overlay > * {
          opacity: 1;
          transform: none;
        }

        /* 🔴 VO FILME BLEDNE UŽ LEN KRAVA (Matej 28. 8. 2026: *„krava začne
           blednúť hneď pri 3. sekcii… zostane viditeľná, ale bude vyblednutá"*
           + *„pes zostane vo farbe"*). Predtým tu viselo spoločné stlmenie
           OBOCH zvierat (--op-bleed) a bývalo na štvrtom obraze — ten zanikol,
           takže by nemalo kde nastať. Hodnota je tá istá 0.26 ako v pôvodnom
           .codex-bleed:not(.active), len ju neurčuje trieda od Reactu, ale
           poloha scrollu, a nesie ju už len jedno z dvoch zvierat.
           ⚠️ Selektor chytá DVA prvky a je to tak správne: CodexHalo who=cow
           si triedu .codex-cow nesie tiez (sklada si ju z propu who),
           takže svätožiara bledne spolu s kravou. Bez toho by nad vyblednutou
           kravou ostal svietiť ostrý prstenec. Hektorova dvojica má
           .codex-hektor a tejto premennej sa teda nedotkne. */
        /* 🔴 A NAJPRV SA MUSÍ ZRUŠIŤ STLMENIE OD TRIEDY. Pôvodná stránka
           stlmuje CELÝ bleed na 0.26, len čo sekcia stratí .active
           (.codex-bleed:not(.active) nižšie) — a vo filme ju stratí hneď na
           druhej obrazovke. Doteraz to prebíjalo spoločné --op-bleed; keď to
           odtiaľ zmizlo, vybledli OBE zvieratá naraz a psovi to zobralo farbu,
           ktorú má podľa zadania mať. Vo filme teda rozhoduje výlučne scroll. */
        .codex-flow .codex-bleed { opacity: 1; transition: none; }
        .codex-flow .codex-bleed .codex-cow {
          opacity: var(--op-cow, 1);
          /* ⚠️ TRANSITION MUSÍ BYŤ PREČ. Pôvodná stránka prepína stlmenie
             triedou, takže jej 420 ms zmäkčenie je na mieste. Vo filme hodnotu
             mení SCROLL v každom snímku — a s prechodom sa zvieratá vlečú
             takmer pol sekundy za prstom. Matej to videl presne takto:
             *„pri návrate zostávajú zvieratá na mieste — zasekne sa to."*
             Je to tá istá pasca, akú už má vypnutú posun kravy a Hektora. */
          transition: none;
        }
      `}</style>

      {/* Hlavičku dodáva rám (LabShell) — vlastnú si stránka nesie len keď beží
          sama, mimo rámu. */}
      {!embedded && <PageTopBarLab withNav />}

      {/* Prepínač textingu druhej sekcie. Lab-only pomôcka na porovnanie —
          variant 1 je ULOŽENÝ, nie zmazaný.
          ⚠️ PORTÁL DO BODY, nie obyčajný div: position:fixed sa počíta voči
          najbližšiemu predkovi s transformom, a rám aj film ich majú viac —
          prepínač potom sadne doprostred obsahu namiesto do rohu okna.
          ⚠️ ZÁMERNE MIMO !embedded: v /onepage beží táto stránka ako embedded
          sekcia filmu, a práve tam sa varianty porovnávajú. Pod !embedded by
          prepínač existoval len na /religion-lab, teda nikde, kde ho treba. */}
      {SHOW_VARIANT_SWITCH && createPortal(
        <div className="v2-switch" role="group" aria-label="Texting sekcie">
          <button type="button" className={textVariant === 1 ? 'is-on' : ''} onClick={() => pickVariant(1)}>TEXT 1</button>
          <button type="button" className={textVariant === 2 ? 'is-on' : ''} onClick={() => pickVariant(2)}>TEXT 2</button>
        </div>,
        document.body
      )}

      {/* Vertikálny scroll-snap: 3 sekcie pod sebou, každá = fix obrazovka */}
      <div className="codex-scroll" ref={scrollRef}>
        {/* Sekcia 1 — The Question (cow vs dog). Bleed PNGs sa renderujú page-level vyššie. */}
        <section
          className={`codex-section ${seen.has(0) ? 'in-view' : ''}`}
          data-idx={0}
          aria-label={t('religion.aria.question')}
          ref={(el) => { sectionRefs.current[0] = el; }}
        >
          <div className="codex-slider">
            <div className="codex-slide codex-slide-3">
              <div
                className={`codex-3-overlay ${textVariant === 2 ? 'is-v2' : ''}`}
                style={textVariant === 2 ? ({ ['--n' as string]: v2Total } as React.CSSProperties) : undefined}
              >
                {textVariant === 2 ? v2Body : null}
                {textVariant === 1 && (<>
                {/* ── DVE TVRDENIA S TOU ISTOU KOSTROU ────────────────────────
                    Matej 27. 8. 2026: *„skúsme navrhnúť nový texting, virálny ale
                    menej slovný vystihujúci podstatu čo chceme obrázkom povedať"*
                    → vybral variant „YET" (9 slov namiesto 27).
                    Obe tvrdenia majú ZÁMERNE tie isté triedy a to isté poradie
                    (lead → číslo → jednotka), aby oko porovnávalo ČÍSLA, nie vety.
                    Jediný rozdiel je, že číslo psa je prázdne — a to nesie celý
                    výjav. Rozísť tie dve kostry = zabiť pointu. */}
                <div className="codex-claim codex-claim-cow">
                  <span className="cl-lead">{t('religion.hook.claim.cowLead')}</span>
                  <span className="cl-figure">{t('religion.hook.claim.cowFigure')}</span>
                  <span className="cl-unit">{t('religion.hook.claim.cowUnit')}</span>
                </div>
                {/* PSIA STRANA — tá istá veta, prázdne číslo. */}
                <div className="codex-claim codex-claim-dog">
                  <span className="cl-lead">{t('religion.hook.claim.dogLead')}</span>
                  <span className="cl-figure cl-figure-void">{t('religion.hook.claim.dogFigure')}</span>
                </div>
                {/* OTOČNÝ BOD — jedno slovo. Je to jediný prvok výjavu s vlastnou
                    žiarou: typografická ozvena svätožiary, ktorá sa Hektorovi
                    rozsvieti hneď za ním. */}
                <p className="codex-yet">{t('religion.hook.claim.yet')}</p>
                {/* Riadok POD tlačidlom hovorí, čo klik urobí — bez neho je
                    „Become Dogyptian" identita bez následku a človek nevidí, že
                    tým niečomu pomáha. Label tlačidla ostáva, je LOCKED
                    v CLAUDE.md; vysvetlenie preto nesie tento riadok. */}
                <div className="codex-cta-cluster">
                  <Link to="/entry" className="codex-cta">
                    {t('religion.cta')}
                  </Link>
                  <p className="codex-cta-line">{t('religion.hook.claim.close')}</p>
                </div>
                </>)}
              </div>
            </div>
          </div>
        </section>

        {/* Sekcia 2 — Preamble (In Dog We Trust) */}
        <section
          className={`codex-section ${seen.has(1) ? 'in-view' : ''}`}
          data-idx={1}
          aria-label={t('religion.aria.preamble')}
          ref={(el) => { sectionRefs.current[1] = el; }}
        >
          <div className="codex-slider">
            <div className="codex-slide">
              {/* ── RIADOK NAD MOTTOM — LEN VO FILME ────────────────────────
                  Matej 28. 8. 2026: *„chcelo by to pár detailov nad IN DOG WE
                  TRUST, možno malým písmenom, že «you are here because:»…
                  miniatúrny text alebo nejaký hec a ubezpečenie, že človek sa
                  stotožňuje s výrokom, ktorý je pod ním (motto)."*
                  Nie je to nadpis sekcie — je to VETA O ČITATEĽOVI, ktorá dáva
                  mottu pod sebou zmysel: nečítaš cudzie vyznanie, čítaš svoje
                  vlastné, len napísané. Preto stojí NAD mottom a nie pod ním.
                  Samostatná /religion-lab a živá /religion ho nemajú — je to
                  prvok filmu, kde motto prichádza bez akéhokoľvek úvodu. */}
              {flow && <p className="codex-eyebrow">{t('religion.preamble.eyebrow')}</p>}
              {/* Poradie polovíc motta určuje lokalizácia (viď
                  religion.preamble.headlineVerbFirst v en.ts). Zlato drží
                  vždy .grad, teda PSA — mení sa len to, či stojí prvý. */}
              <h1 className="codex-headline">
                {t('religion.preamble.headlineVerbFirst') === '1' ? (<>
                  <span className="line">{t('religion.preamble.headlineLine')}</span>
                  <span className="grad">{t('religion.preamble.headlineGrad')}</span>
                </>) : (<>
                  <span className="grad">{t('religion.preamble.headlineGrad')}</span>
                  <span className="line">{t('religion.preamble.headlineLine')}</span>
                </>)}
              </h1>
              <div className="codex-preamble-wrap">
                <span className="codex-frame tl" aria-hidden />
                <span className="codex-frame tr" aria-hidden />
                <span className="codex-frame bl" aria-hidden />
                <span className="codex-frame br" aria-hidden />
                <p className="codex-preamble-text" dangerouslySetInnerHTML={{ __html: t('religion.preamble.text') }} />
              </div>
              <p className="codex-oath-label">{t('religion.preamble.oath')}</p>
              {/* JEDINÝ VSTUP DO ÚSTAVY VO FILME. Kniha ako samostatný obraz
                  zanikla (Matej 28. 8.: *„celá 4. sekcia by zanikla… aby sa
                  neopakovali slajdy"*), takže toto tlačidlo nie je ozdoba —
                  je to jediná cesta k textu, ktorý celá sekcia cituje.
                  ⚠️ Label NIE JE `wall.hero.cta` (BECOME DOGYPTIAN, LOCKED
                  v CLAUDE.md) — to je iná akcia a je na prvom výjave. */}
              {flow && onOpenBook && (
                <button type="button" className="codex-book-cta" onClick={onOpenBook}>
                  {t('religion.preamble.readCta')}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── SEKCIA 3 — KNIHA. VO FILME NEEXISTUJE ────────────────────────
            Matej 28. 8. 2026: *„celá 4. sekcia by zanikla, obrázok dogmy by sa
            presunul… (aby sa neopakovali slajdy)"* + *„kniha nebude vidno
            (kniha bude v pätičke úplne nakonci)."*
            Vo filme ju montuje `OnePage` — raz v pätičke a raz ako prekrytie
            po kliku na CTA vyššie. Tu by bola tretia kópia toho istého.
            ⚠️ Samostatná /religion-lab a LabShell ju majú ĎALEJ — je to ich
            posledný obraz a bez neho by z nich ostal koniec bez ústavy. */}
        {!flow && <section
          className={`codex-section ${seen.has(2) ? 'in-view' : ''}`}
          data-idx={2}
          aria-label={t('religion.aria.sacredIndex')}
          ref={(el) => { sectionRefs.current[2] = el; }}
        >
          {/* Nadpis knihy má DVE polohy a je to zámer, nie duplikát:
              • samostatná /religion-lab — absolútne NAD knihou (pôvodné miesto);
              • film /onepage — POD knihou, nad chipom (Matej 28. 8. 2026:
                „musíme dať nadpis (biblia…) pod knihu a pod nadpis mini chip
                s infom o otvorení knihy"). Nad knihou ho tam zožerie horná lišta.
              V DOM-e je vždy len jeden. */}
          {!flow && <h2 className="codex-book-title">{t('religion.bookTitle')}</h2>}
          <div className="codex-slider codex-slider-book">
            <div className="codex-slide">
              <ConstitutionBook />
            </div>
          </div>
        </section>}
      </div>

      {/* Scroll hint — iba na hero (cow vs dog). V režime filmu nie je: scroll
          vedie plynulo ďalej sám a šípka by visela nad celou stránkou. */}
      {!flow && <button
        type="button"
        className={`codex-scrollhint ${active === 0 ? 'show' : ''}`}
        onClick={() => go(1)}
        aria-label={t('religion.aria.scrollDown')}
      >
        <span aria-hidden>▾</span>
      </button>}
    </div>
  );
}
