import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { useFlowDogs, FlowDogHeader, FLOW_DOG_CSS } from '@/components/screens/flowDogPicker';
import { useT, useLang } from '@/i18n/LanguageContext';
import { useFlowGuard } from '@/hooks/useFlowGuard';
import { NEW_HEROFLOW } from '@/lib/flowMode';
import { PageTopBar } from '@/components/PageTopBar';
import { HeroglyphFrame } from '@/components/HeroglyphFrame';
import { FLOW_PALE_CSS, FLOW_CARVE_CSS } from '@/components/screens/flowPaleSkin';
import { FlowMedallion, FLOW_MEDAL_CSS, useSpeakMedal } from '@/components/screens/flowMedallion';
import { Scroller, FLOW_SCROLL_CSS } from '@/components/screens/flowScroller';
import { LAPIS, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { PACK_R, PACK_THEME as T, BRAND_GOLD_BTN } from '@/components/pack/packTheme';
import { LAB } from '@/lib/labTheme';
import { hekthorFace } from '@/lib/hekthorFaces';
import { HEKTHOR_GLYPH } from '@/lib/hektor';
import { localizeBreed } from '@/lib/breedDisplay';
import { HandSearch, HandCheck } from '@/components/pack/HandIcons';
import breedsData from '@/data/breeds.json';

// ════════════════════════════════════════════════════════════════════════════
// PATRÓN — plemeno, kríženec a výber patróna na JEDNEJ obrazovke (24. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 24. 9. 2026: *„skúsme to dať do jednej obrazovky výber plemena/kríženec
// + patroni aj zápis do heroglyfu — treba dodržať mantinely obsah aj veľkosť
// heroglyfu"* + *„ikonku psa = hektor, opäť menší blok ako predchádzajúci blok"*
// + nadpis *„… potrebuje patróna"* a podtext *„vyhľadávanie podľa plemena ti vie
// pomôcť, no výber je na tebe"*.
//
// 🔑 ČO SA TÝMTO RUŠÍ: dva PODKROKY starej obrazovky `BreedPatronScreen`
//    (plemeno → NEXT → patrón). Boli to dva posuvy v jednej routе, teda dve
//    čakania na to isté rozhodnutie — a pruh postupu sa medzi nimi nehýbal,
//    takže človek nevedel, či ide dopredu. Obe polovice sa zmestia pod seba.
//    ⚠️ `BreedPatronScreen.tsx` sa NEMAŽE — LIVE vstup ide ďalej cez ňu (lock
//       „do FLIPu sa LIVE nedotýkame"). Túto routu dostane len DEV.
//
// 🔑 PLEMENO JE POMOCNÍK, NIE ZÁMOK. Odomkýna CTA výhradne patrón: vybrané
//    plemeno len predvyplní kanonickú siluetu (`breeds.json`) a prepne
//    kategóriu. Vyplýva to z Matejovej vety — *„výber je na tebe"* — a ruší to
//    starý zámok `canNext` (plemeno bolo povinné) aj políčko „nie som si istý":
//    kto plemeno nevie, nechá pole prázdne a ide na patróna. Jedno pravidlo
//    namiesto troch stavov.
//
// 🔑 ZÁPIS DO HEROGLYFU JE OKAMŽITÝ. Patrón ide do store v momente ťuknutia
//    (`setPatronSvg`), nie na CTA — `HeroglyphFrame` číta veľký stredný slot
//    práve zo store, takže silueta sa v ráme nad výberom zjaví hneď. To je celý
//    zmysel zliatia dvoch krokov do jedného: voľba a jej následok sú na jednej
//    obrazovke.
//
// ⚠️ MANTINELY (lock `PAGE_AIR` + *„nič sa tu nemení veľkosťou"*): obrazovka
//    nemá stupňovanie podľa výšky okna a rám drží tú istú šírku ako na PODSTATE
//    (78 % od 560 px, 100 % pod tým). Premerané čísla sú pri `PATRON_CSS`.
// ════════════════════════════════════════════════════════════════════════════

type Breed = { id: number; en: string; sk: string; patron: string; group: string };
type BreedsFile = { version: string; breeds: Breed[] };
const BREEDS = (breedsData as BreedsFile).breeds;

/** Desať kategórií patrónov. Názvy hovorí i18n (`heroglyph.flow.breed.cat.NN`),
 *  tu je len poradie — je to poradie súborov v `public/patrons/`. */
const CAT_IDS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const;

/**
 * Koľko siluet má ktorá kategória.
 *
 * 🔴 ČÍSLO JE MERANÉ, NIE OPÍSANÉ. Stará obrazovka mala `'08': 6` — a v
 *    `public/patrons/` leží `08-07.svg` od **27. 4. 2026** (commit `d6ccf47`
 *    „Add 08-07.svg — Splashers 7th patron icon"). Sedem siluet, šesť
 *    zobrazených: patrón bol päť mesiacov neviditeľný, hoci NA NEHO UKAZUJE
 *    kanonická silueta niektorého plemena z `breeds.json` — kto to plemeno
 *    zadal, dostal predvyplnenú siluetu, ktorá v rade nebola.
 *    Premerané 24. 9. 2026: `ls public/patrons | wc -l` = **82** kusov
 *    (9 · 11 · 7 · 8 · 7 · 8 · 10 · 7 · 6 · 9).
 * ⚠️ Ručný zoznam o obsahu priečinka zostarne ticho, preto je pod ním poistka
 *    `maxUsedIndex`: keď niekto pridá siluetu a napíše na ňu plemeno, rad ju
 *    ukáže aj bez zásahu tu. Nová silueta, na ktorú neukazuje žiadne plemeno,
 *    sa musí dopísať sem — to je jediné, čo z priečinka nevyčítame.
 */
const SVG_COUNTS: Record<string, number> = {
  '01': 9, '02': 11, '03': 7, '04': 8, '05': 7,
  '06': 8, '07': 10, '08': 7, '09': 6, '10': 9,
};

/** Najvyššie poradové číslo siluety, na ktoré v danej kategórii ukazuje plemeno. */
const maxUsedIndex: Record<string, number> = {};
for (const b of BREEDS) {
  const [cat, idx] = b.patron.split('-');
  const n = parseInt(idx, 10);
  if (cat && Number.isFinite(n)) maxUsedIndex[cat] = Math.max(maxUsedIndex[cat] ?? 0, n);
}

const svgsFor = (cat: string): string[] => {
  const n = Math.max(SVG_COUNTS[cat] ?? 0, maxUsedIndex[cat] ?? 0);
  return Array.from({ length: n }, (_, i) => `${cat}-${String(i + 1).padStart(2, '0')}.svg`);
};

const patronUrl = (svg: string) => `/patrons/${svg}`;

/** Plemená na hľadanie. Kanonické meno je EN — do store ide ono, nie preklad. */
const ALL_BREEDS: { name: string; cat: string; patron: string }[] = BREEDS
  .map((b) => ({ name: b.en, cat: b.group, patron: `${b.patron}.svg` }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Koľko návrhov ukázať. Šesť je z pôvodnej obrazovky — viac sa do ponuky na
 *  telefóne nezmestí bez rolovania a rolujúca ponuka nad klávesnicou je pasca. */
const MATCH_LIMIT = 6;

// ── POLE NA HĽADANIE PLEMENA ────────────────────────────────────────────────
/**
 * Pole + ponuka pod ním. Ponuka ide **portálom do `<body>` a je `fixed`** —
 * javisko kroku (`.hf-stage`) roluje a zlatý blok má vlastný stacking context,
 * takže ponuka v toku by sa orezala o hranu dosky.
 *
 * ⚠️ Poloha ponuky sa počíta voči `visualViewport`, nie voči oknu: na telefóne
 *    zaberá klávesnica spodnú polovicu a `window.innerHeight` o nej nevie.
 *    Keď je pod poľom menej miesta než nad ním, ponuka sa otvorí NAHOR.
 * ⚠️ Stará obrazovka na to mala celoobrazovkový modál (`BreedSearchModal`).
 *    Tu netreba: pole stojí v hornej tretine dosky (merané na 390×844: horná
 *    hrana poľa 225 px, klávesnica začína ~514 px), takže ho klávesnica
 *    neprekryje. Modál ostáva v starej obrazovke, kým beží na LIVE.
 */
function BreedField({
  value, onPick, onClear, placeholder,
}: {
  value: string;
  onPick: (name: string, cat: string) => void;
  onClear: () => void;
  placeholder: string;
}) {
  const t = useT();
  const { lang } = useLang();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (value || q.trim().length < 2) return [];
    const needle = q.trim().toLowerCase();
    // Hľadá sa v EN kánone AJ v preklade — kto po slovensky napíše „pudel",
    // musí nájsť „Toy Poodle". Do store ide vždy EN meno.
    return ALL_BREEDS
      .filter((b) => b.name.toLowerCase().includes(needle)
        || localizeBreed(b.name, lang).toLowerCase().includes(needle))
      .slice(0, MATCH_LIMIT);
  }, [q, value, lang]);

  const [box, setBox] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);
  useEffect(() => {
    if (!open || matches.length === 0) { setBox(null); return; }
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vv = window.visualViewport;
      const vTop = vv ? vv.offsetTop : 0;
      const vBottom = vTop + (vv ? vv.height : window.innerHeight);
      const gap = 5;
      const margin = 10;
      const wanted = matches.length * 42 + 10;
      const below = vBottom - r.bottom - gap - margin;
      const above = r.top - vTop - gap - margin;
      const up = below < wanted && above > below;
      const maxHeight = Math.max(84, Math.min(wanted, up ? above : below));
      setBox({
        left: r.left,
        width: r.width,
        maxHeight,
        top: up ? r.top - gap - maxHeight : r.bottom + gap,
      });
    };
    place();
    const vv = window.visualViewport;
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    vv?.addEventListener('resize', place);
    vv?.addEventListener('scroll', place);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      vv?.removeEventListener('resize', place);
      vv?.removeEventListener('scroll', place);
    };
  }, [open, matches.length]);

  // Klik mimo zavrie ponuku. `mousedown` a nie `click`: voľba v ponuke beží na
  // `mousedown`, aby ju nepredbehol blur poľa.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (!wrapRef.current?.contains(tgt) && !menuRef.current?.contains(tgt)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  const pick = (name: string, cat: string) => {
    onPick(name, cat);
    setQ(localizeBreed(name, lang));
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="pt-fieldwrap" ref={wrapRef}>
      <div className={`pt-field${value ? ' is-set' : ''}`}>
        <HandSearch size={15} className="ic" />
        <input
          ref={inputRef}
          value={value ? localizeBreed(value, lang) : q}
          onChange={(e) => {
            // Písanie ruší potvrdené plemeno — ale NIE vybraného patróna.
            // Patrón je od prvého ťuknutia človekova voľba (*„výber je na
            // tebe"*), takže sa mu nesmie prepísať zmenou textu v hľadaní.
            if (value) onClear();
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          aria-label={placeholder}
        />
        {value
          // Fajka je KRESBA z brandového setu, nie znak `✓` ani lucide `Check`
          // (lock: „tu zjednoťme, nech nie sú zbytočne aj znak aj kresba").
          ? <HandCheck size={15} className="ok" />
          : null}
      </div>

      {open && matches.length > 0 && box && createPortal(
        <div
          ref={menuRef}
          className="pt-menu"
          style={{ left: box.left, top: box.top, width: box.width, maxHeight: box.maxHeight }}
        >
          {matches.map((m) => (
            <button
              key={`${m.cat}-${m.name}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(m.name, m.cat); }}
              onTouchStart={() => pick(m.name, m.cat)}
            >
              <span className="nm">{localizeBreed(m.name, lang)}</span>
              <img src={patronUrl(m.patron)} alt="" />
            </button>
          ))}
        </div>,
        document.body,
      )}
      {/* Nápoveda pre jazyky, kde zoznam plemien preložený nie je (`enHint` je
          v EN prázdny, takže riadok tam ani nevznikne). */}
      {!value && q.trim().length >= 2 && matches.length === 0 && t('heroglyph.flow.breed.enHint')
        ? <p className="pt-hint">{t('heroglyph.flow.breed.enHint')}</p>
        : null}
    </div>
  );
}

// ── OBRAZOVKA ───────────────────────────────────────────────────────────────

export function PatronScreen() {
  const navigate = useNavigate();
  const t = useT();
  const flowOk = useFlowGuard();

  const dogName = useDogyptStore((s) => s.dogName);
  const setPatronSvg = useDogyptStore((s) => s.setPatronSvg);
  const setPatronCategory = useDogyptStore((s) => s.setPatronCategory);
  const setPatronSvg2 = useDogyptStore((s) => s.setPatronSvg2);
  const setPatronCategory2 = useDogyptStore((s) => s.setPatronCategory2);
  const setBreed = useDogyptStore((s) => s.setBreed);
  const setIsMix = useDogyptStore((s) => s.setIsMix);
  const setSelection = useDogyptStore((s) => s.setSelection);
  const dogEssence = useDogyptStore((s) => s.dogEssence);
  const setDogEssence = useDogyptStore((s) => s.setDogEssence);

  // ── KTORÉMU PSOVI VYBERÁM (25. 9. 2026) ───────────────────────────────────
  // Matej: *„v hero labe od kroku 6 neriešime multipsov! musíme to opraviť!"*.
  // Dovtedy sa patrón zapisoval do globálneho `patronSvg`, teda VŽDY prvému
  // psovi — kto mal troch, vybral podstatu trikrát a patróna raz.
  // 🔴 Pravda o psovi žije v `dogEssence[idPsa]`, rovnako ako podstata. Prvý pes
  //    ide NAVYŠE do globálneho store, lebo heroglyf, certifikát a platba čítajú
  //    ďalej odtiaľ (ten istý kompromis, aký má PODSTATA).
  const dogs = useFlowDogs();
  const [cur, setCur] = useState(0);
  const dog = dogs[Math.min(cur, Math.max(0, dogs.length - 1))];
  const dogId = dog?.id ?? MAIN_DOG_ID;
  const ess = dogEssence[dogId] || {};

  const patronSvg = ess.patronSvg || '';
  const mix = ess.breedType === 'mix';
  const breed1 = ess.breed === 'Mixed' ? (ess.mixBreed1 || '') : (ess.breed || '');
  const breed2 = ess.mixBreed2 || '';

  /** Zápis o psovi na rade. Prvému psovi sa to isté píše aj do globálneho store. */
  const put = (key: string, value: string) => {
    setDogEssence(dogId, key, value);
    if (dogId !== MAIN_DOG_ID) return;
    if (key === 'patronSvg') setPatronSvg(value);
    if (key === 'patronCategory') setPatronCategory(value);
    if (key === 'breed') { setBreed(value); setIsMix(value === 'Mixed'); }
    setSelection(key, value);
  };

  const heroName = dogName?.trim() || t('heroglyph.flow.breed.fallbackHero');
  /** Hektor je na telefóne väčší (104), na PC 80 — Matej 24. 9. Jedno miesto
   *  pre obe obrazovky s týmto pásom, aby sa podstata a patrón nerozišli. */
  const medal = useSpeakMedal();

  /** Otvorená kategória. Po návrate do kroku sa otvorí tá, z ktorej je vybraný
   *  patrón — nie prvá. Kto sa vráti, musí vidieť, čo si vybral. */
  // ⚠️ Otvorená kategória je jediný čisto ZOBRAZOVACÍ stav — drží sa PER PSA,
  //    inak by prepnutie psa nechalo otvorený rad, z ktorého jeho patrón nie je.
  const [catOpen, setCatOpen] = useState<Record<string, string>>({});
  const cat = catOpen[dogId] || ess.patronCategory || CAT_IDS[0];
  const setCat = (c: string) => setCatOpen((m) => ({ ...m, [dogId]: c }));

  /** Ťuknutie na siluetu = zápis do heroglyfu. Store, nie lokálny stav — rám
   *  číta veľký stredný slot z `patronSvg`. */
  const choose = (svg: string, inCat: string) => {
    put('patronCategory', inCat);
    put('patronSvg', svg);
  };

  /** Plemeno predvyplní kanonickú siluetu a prepne kategóriu. Je to NÁVRH:
   *  človek ho môže hneď preklikať, a keď už siluetu vybral sám, návrh ju
   *  neprepíše — inak by hľadanie prebilo jeho rozhodnutie. */
  const pickBreed = (name: string, group: string) => {
    put(mix ? 'mixBreed1' : 'breed', name);
    if (mix) put('breed', 'Mixed');
    const found = ALL_BREEDS.find((b) => b.name === name && b.cat === group);
    setCat(group);
    if (found && !patronSvg) choose(found.patron, group);
  };

  const canGo = !!patronSvg;
  /** Prvý pes bez patróna. -1 = hotoví sú všetci. */
  const missing = dogs.findIndex((d) => !(dogEssence[d.id] || {}).patronSvg);
  /**
   * 🔴 CTA MÁ DVE POLOHY, NIE AUTOMATICKÝ SKOK. Kým nemá patróna každý pes,
   * tlačidlo znie ĎALŠÍ PES a prepne na prvého nehotového; keď majú všetci,
   * je to POKRAČOVAŤ.
   * ⚠️ Zámerne sa NEPREPÍNA samo po ťuknutí na siluetu (to robí PODSTATA, kde
   *    je pes hotový až po ŠTYROCH odpovediach). Tu je voľba jediné ťuknutie a
   *    človek si ju často hneď preklikne — samopohyb by mu ju vzal spod ruky.
   */
  const handover = canGo && missing >= 0;

  const go = () => {
    if (!canGo) return;
    if (handover) { setCur(missing); return; }
    // Do globálneho store ide PRVÝ pes — ostatní žijú v `dogEssence`, kým
    // nebude platba za N psov (bez nej sa aj tak vystaví jeden heroglyf).
    const mainEss = dogEssence[MAIN_DOG_ID] || {};
    const mainMix = mainEss.breedType === 'mix';
    setIsMix(mainMix);
    setBreed(mainMix ? 'Mixed' : (mainEss.breed || ''));
    setSelection('breed', mainMix ? 'Mixed' : (mainEss.breed || ''));
    setSelection('breedType', mainMix ? 'mix' : 'purebred');
    if (mainMix) {
      setSelection('mixBreed1', mainEss.mixBreed1 || '');
      setSelection('mixBreed2', mainEss.mixBreed2 || '');
    }
    // Druhý patrón je spiaci (heroglyf preň nemá slot) — drží sa prázdny, aby
    // sa cez store nevliekla hodnota, ktorú nikto nekreslí.
    setPatronCategory2('');
    setPatronSvg2('');
    navigate(NEW_HEROFLOW ? '/heroglyph/dog-character' : '/heroglyph/ranking');
  };

  if (!flowOk) return null;

  const svgs = svgsFor(cat);

  return (
    <div className="hf-pale flex flex-col h-[100dvh] overflow-hidden">
      <style>{FLOW_PALE_CSS}{FLOW_MEDAL_CSS}{FLOW_CARVE_CSS}{FLOW_SCROLL_CSS}{FLOW_DOG_CSS}{PATRON_CSS}</style>

      <div className="hf-topbar flex-shrink-0">
        <PageTopBar onBack={() => navigate('/heroglyph/essence')} />
      </div>

      <div className="hf-stage">
        <div className="w-full max-w-xl flex flex-col items-center pt-col">

          {/* ── 1. BLOK: HEKTHOR SA PÝTA ────────────────────────────────────
              Ten istý pás ako na PODSTATE — medailón 80 px a veta vedľa neho.
              Matej: *„ikonku psa = hektor, opäť menší blok ako predchádzajúci
              blok"*: hlavou obrazovky je doska s výberom, bublina je jej úvod,
              takže nesmie byť väčšia než ona. Veľkosť sa NEMENÍ oproti
              predchádzajúcemu kroku — dva susedné kroky majú vyzerať ako
              súrodenci, nie ako dva návrhy. */}
          <motion.div
            className="hf-speak pt-speak"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <FlowMedallion src={hekthorFace('breed')} size={medal} />
            <span className="say">
              <h2>{t('heroglyph.flow.breed.needs', { name: heroName })}</h2>
              <p>{t('heroglyph.flow.breed.subtitle')}</p>
            </span>
          </motion.div>

          {/* ── 2. BLOK: PLEMENO → RÁM → PATRÓN ────────────────────────────*/}
          <motion.div
            className={`hf-block hf-carved pt-stack${dogs.length > 1 ? ' is-multi' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="hf-carved-rim" aria-hidden />
            <div className="hf-plate">

              {/* KOMU VYBERÁM — pri jedinom psovi len fotka a meno, pri viacerých
                  aj šípky. Ten istý riadok ako na PODSTATE (`flowDogPicker.tsx`),
                  aby prepínanie psov vyzeralo v celom vstupe rovnako. */}
              {dogs.length > 1 && (
                <>
                  <FlowDogHeader
                    className="pt-who"
                    dogs={dogs}
                    cur={cur}
                    onGo={setCur}
                    done={!!(dogEssence[dogId] || {}).patronSvg}
                  />
                  <span className="fdh-rule" aria-hidden />
                </>
              )}

              {/* Hľadanie a kríženec v JEDNOM riadku. Pri krížencovi pribudne
                  druhé pole — na šírke dosky sa zmestí do toho istého riadka
                  (`flex-wrap`), na telefóne sa zalomí pod prvé. Zámok CTA sa
                  tým nemení, takže doska nemá dôvod poskočiť inde než tam, kde
                  je na to miesto. */}
              <div className="pt-breedrow">
                <BreedField
                  value={breed1}
                  onPick={pickBreed}
                  onClear={() => put(mix ? 'mixBreed1' : 'breed', '')}
                  placeholder={mix
                    ? t('heroglyph.flow.breed.mix.placeholder1')
                    : t('heroglyph.flow.breed.one.placeholder')}
                />
                {/* Pilulka, nie dvojica dlaždíc „jedno plemeno / kríženec".
                    Východiskový stav je jedno plemeno, takže druhá dlaždica
                    nepýtala rozhodnutie — len zaberala riadok.
                    ⚠️ STOJÍ MEDZI POĽAMI, nie za nimi. Na 390 px má doska 302 px,
                       takže dve polia po 150 sa do riadka nezmestia (308) —
                       v pôvodnom poradí sa zalomilo DRUHÉ pole k pilulke a
                       zostalo mu 154 px, teda „Second breed (opt…". Takto ide
                       do druhého radu celé a placeholder sa doň vojde. Na doske
                       520 px stoja všetky tri prvky v jednom rade tak či tak. */}
                <button
                  type="button"
                  className={`pt-mix${mix ? ' on' : ''}`}
                  aria-pressed={mix}
                  onClick={() => {
                    const next = !mix;
                    put('breedType', next ? 'mix' : 'purebred');
                    // Pri prepnutí na kríženca sa doterajšie plemeno stáva prvou
                    // polovicou; pri návrate späť sa vracia ako jediné plemeno.
                    if (next) { put('mixBreed1', breed1); put('breed', 'Mixed'); }
                    else { put('breed', breed1); put('mixBreed2', ''); }
                  }}
                >
                  {t('heroglyph.flow.breed.type.mix')}
                </button>
                {mix && (
                  <BreedField
                    value={breed2}
                    onPick={(name) => put('mixBreed2', name)}
                    onClear={() => put('mixBreed2', '')}
                    placeholder={t('heroglyph.flow.breed.mix.second')}
                  />
                )}
              </div>

              {/* RÁM NAD VÝBEROM: odpoveď má pristáť tam, kam sa človek práve
                  pozerá. Kým patrón nie je, veľký stredný slot pulzuje a nesie
                  Hektorovu podmalbu — rám teda nikdy nevyzerá prázdny. */}
              <HeroglyphFrame
                showOwner
                // Rám ukazuje psa NA RADE (podstata + patrón z `dogEssence`),
                // nie vždy prvého.
                dogValues={ess}
                ghostValues={HEKTHOR_GLYPH}
                pulseSlot={patronSvg ? undefined : 'dogShape'}
                className="pt-glyph"
                // 🔴 Šírka ide cez `style`, nie cez triedu — `HeroglyphFrame` si
                // píše `width: '100%'` INLINE a pravidlo z hárku by prehralo
                // (tá istá pasca stála 24. 9. celý deň na PODSTATE).
                style={{ width: 'var(--pt-glyph-w)' }}
              />

              <p className="hf-legend">{t('heroglyph.flow.breed.legend')}</p>

              {/* Kategórie. Bez poradového čísla — „01 Furballs" je náš
                  identifikátor súborov, nie informácia pre človeka. */}
              <Scroller rowClass="pt-cats" measureKey={cat} centerSel=".pt-chip.on">
                {CAT_IDS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    data-cat={c}
                    className={`pt-chip${c === cat ? ' on' : ''}`}
                    onClick={() => setCat(c)}
                  >
                    {t(`heroglyph.flow.breed.cat.${c}`)}
                  </button>
                ))}
              </Scroller>

              {/* Siluety. Dlaždica je TEN ISTÝ materiál ako voľba inde vo vstupe
                  (`.hf-pick` z `FLOW_CARVE_CSS`) — mení sa len geometria na
                  štvorec. Vybraná preto svieti lapisom bez jediného nového
                  pravidla o farbe. */}
              <Scroller rowClass="pt-sils" measureKey={`${cat}|${patronSvg}`} centerSel=".pt-sil.on">
                {svgs.map((svg) => (
                  <button
                    key={svg}
                    type="button"
                    className={`hf-pick pt-sil${svg === patronSvg ? ' on' : ''}`}
                    aria-pressed={svg === patronSvg}
                    onClick={() => choose(svg, cat)}
                  >
                    <img src={patronUrl(svg)} alt="" />
                  </button>
                ))}
              </Scroller>

              {/* Veta NAD CTA a POD výberom (Matej 24. 9.: *„pridal by som text aj na
                  mobile aj na PC pod výberom ikon a nad CTA… malým písmom"*).
                  Stojí tu, lebo je to NÁVOD K VÝBERU, nie podnadpis obrazovky —
                  v bubline hore by ju človek čítal skôr, než uvidí, z čoho vyberá.
                  ⚠️ Trieda je `.hf-note` zo spoločného šatu, nie nová — je to ten
                     istý tichý riadok, aký nesie poznámky inde vo vstupe. */}
              <p className="hf-note pt-hintline">{t('heroglyph.flow.breed.pickHint')}</p>

              <button type="button" className="hf-cta" disabled={!canGo} onClick={go}>
                {handover ? t('heroglyph.flow.multi.nextDog') : t('heroglyph.flow.breed.continue')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * Šat obrazovky. Materiál (rytina, jamka, voľba, doska) si berie z
 * `FLOW_CARVE_CSS` a `FLOW_PALE_CSS` — tu je len to, čo má iba táto obrazovka.
 *
 * 📏 ROZPOČET VÝŠKY (mantinel `PAGE_AIR`, Matejovo okno 1477×724):
 *    javisko 724 − lišta 81 − vzduch 2×24 = **595 px**.
 *    bublina 104 + medzera 12 + doska (pole 40 · rám 108 · vlys 16 · kategórie
 *    32 · siluety 76 · CTA 40 + 5 medzier po 10 + 2×18 výplň) = **512 px**,
 *    teda rezerva 83 px. Kto pridá ďalší prvok, ju vyčerpá — a vtedy sa
 *    ZMENŠUJE OBSAH, nie rezerva od okraja (lock 24. 9.).
 */
const PATRON_CSS = `
/* Bublina: stupeň písma viazaný na ŠÍRKU BUBLINY (cqw), nie na okno — inak
   nadpis pri zmene šírky ticho pretečie. Tá istá dvojica hodnôt ako PODSTATA,
   aby dva susedné kroky mali to isté písmo. */
.pt-speak { container-type: inline-size; margin-bottom: 8px; }
/* ⚠️ DOLNÁ HRANICA JE 18, NIE 16 (Matej 24. 9.: *„na mobile môžme zväčšiť prvý blok
   aj foto aj písmo"*). Na telefóne má bublina ~302 px, takže 4,6cqw dá 13,9 a clamp
   spadne na spodnú hranicu — tá je teda JEDINÉ číslo, ktoré na mobile platí.
   Na PC sa nemení nič: 4,6cqw je tam nad 20 a clamp drží strop. */
.pt-speak h2 { font-size: clamp(18px, 4.6cqw, 20px); }
.pt-stack .hf-plate { gap: 10px; }
/* ── 🐕 PREPÍNAČ PSOV STOJÍ VÝŠKU (25. 9. 2026) ──────────────────────────────
   Riadok „komu vyberám" + rytina = 64 px. Na iPhone SE ostali po ňom 2 px
   rezervy, čo je hranica, za ktorou stačí dlhšie meno psa a doska pretečie.
   Ustupuje RÁM (lock PAGE_AIR), a len pri dvoch a viac psoch. */
.pt-stack.is-multi .pt-glyph { --pt-glyph-w: 64%; }
.pt-stack.is-multi .hf-plate { gap: 8px; }

/* ── PLEMENO ──────────────────────────────────────────────────────────────
   Riadok sa zalamuje SÁM (\`flex-wrap\`): na doske širokej 520 px stoja dve polia
   aj pilulka v jednom rade (180 + 180 + ~112), na 302 px sa druhé pole zalomí
   pod prvé. Žiadny \`@media\` — zalomenie určuje miesto, nie šírka okna. */
.pt-breedrow { display: flex; flex-wrap: wrap; gap: 8px; width: 100%; }
/* ⚠️ ZÁKLAD 150, NIE 180 px. Pri 180 sa na iPhone SE (375 px, doska 287) nezmestilo
   do riadka ani JEDNO pole s pilulkou (180 + 8 + 112 = 300) a riadok mal 88 px
   ešte pred zapnutím kríženca — teda obrazovka bola o 48 px vyššia zbytočne.
   Merané 24. 9. 2026: pri 150 stojí pole s pilulkou na SE v jednom rade (258 z 287)
   a na doske 520 px sa do jedného radu vojdú OBE polia aj pilulka. */
.pt-fieldwrap { flex: 1 1 150px; min-width: 0; position: relative; }
/* Pole je BIELE — jediná plocha, ktorá pýta zásah (ten istý dôvod aj recept ako
   \`.hf-field\`: papyrus na papyruse sa v doske stratí). Výška 40 = výška pilulky
   vedľa neho, aby riadok nemal dve rôzne vysoké veci. */
.pt-field {
  display: flex; align-items: center; gap: 8px; height: 40px;
  border-radius: ${PACK_R.tile}px; padding: 0 12px;
  background: #FFFDF7; border: 2px solid rgba(179, 130, 45, 0.55);
  transition: border-color .18s, box-shadow .18s, background .18s;
}
.pt-field:focus-within { border-color: ${LAPIS.edge}; box-shadow: 0 0 0 3px ${LAPIS.halo}; }
/* Potvrdené plemeno: lapisový tint NAD bielou, nie namiesto nej — samotný
   \`LAPIS.fill\` je priehľadný a zlatá doska by cez neho zošedivela. */
.pt-field.is-set {
  border-color: ${LAPIS.edge};
  background: linear-gradient(${LAPIS.fill}, ${LAPIS.fill}), #FFFDF7;
}
.pt-field input {
  flex: 1; min-width: 0; border: none; background: none; outline: none;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.ink};
}
/* 16 px na telefóne, inak si iOS pri zaostrení priblíži celú stránku a z kroku
   sa stane výrez. Je to jediné miesto, kde sa stupeň líši podľa šírky. */
@media (max-width: 559px) { .pt-field input { font-size: 16px; } }
.pt-field input::placeholder { color: ${LAB.inkMuted}; }
.pt-field .ic { flex: none; color: ${LAB.inkMuted}; }
.pt-field .ok { flex: none; color: #2E5C3B; }
.pt-hint {
  margin: 4px 2px 0; font-family: 'Space Grotesk', sans-serif; font-size: 12px;
  line-height: 1.35; color: ${LAB.inkSoft};
}

/* Kríženec = pilulka, nie dlaždica. Nevybraná je papyrus, vybraná lapisový TINT
   (lock 26. 8.: plná farebná plocha patrí jedinému CTA obrazovky). */
.pt-mix {
  flex: 0 0 auto; height: 40px; padding: 0 14px; border-radius: ${PACK_R.pill}px;
  cursor: pointer; white-space: nowrap;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: ${LAB.inkSoft}; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 252, 240, 0.85), 0 1px 2px rgba(60, 40, 10, 0.10);
  transition: border-color .16s, box-shadow .16s, background .16s, color .16s;
}
.pt-mix:hover { border-color: rgba(179, 130, 45, 0.85); }
.pt-mix.on { ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
/* Na najužších telefónoch ustupuje VÝPLŇ pilulky, nie stupeň písma — slovo
   KRÍŽENEC musí ostať čitateľné rovnako ako na PC. */
@media (max-width: 559px) { .pt-mix { padding: 0 11px; letter-spacing: 0.06em; } }

/* Ponuka plemien — portál do \`<body>\`, poloha z komponentu (meria
   \`visualViewport\`). Papyrusová karta so zlatým rámom, ten istý materiál ako
   ponuka krajín (\`.hf-cpick-menu\`). */
.pt-menu {
  position: fixed; z-index: 2100; overflow-y: auto; padding: 5px;
  display: flex; flex-direction: column; gap: 2px;
  background: linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%);
  border: 1.5px solid ${LAB.goldSolid}; border-radius: ${PACK_R.tile}px;
  box-shadow: 0 12px 30px rgba(60, 40, 10, .28);
}
.pt-menu button {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; text-align: left; padding: 8px 9px; border: none; border-radius: 8px;
  background: none; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.ink};
}
.pt-menu button:hover { background: rgba(201, 154, 63, .16); }
.pt-menu button .nm { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pt-menu button img { flex: none; width: 24px; height: 24px; object-fit: contain; opacity: .9; }

/* ── RÁM ──────────────────────────────────────────────────────────────────
   Tá istá šírka ako na PODSTATE: 78 % od 560 px, 100 % pod tým. Na telefóne je
   doska sama úzka a sťahovanie na 78 % zrazilo symboly v malých slotoch na
   nečitateľné (merané 24. 9.: 63 px výšky proti 80 px na LIVE).
   ⚠️ Číslo je premenná, lebo šírku zapisuje INLINE \`style\` na komponente. */
.pt-glyph {
  --pt-glyph-w: 78%;
  max-width: 100%; margin-inline: auto; display: block;
  /* Inkoust papyrusu, nie \`--foreground\` z tmavého šatu: rám kreslí
     \`currentColor\` a čierna by na bledej doske pôsobila ako tlač, nie rytina. */
  color: rgba(35, 22, 8, 0.88);
}
@media (max-width: 559px) { .pt-glyph { --pt-glyph-w: 100%; } }

/* ── VODOROVNÉ RADY ───────────────────────────────────────────────────────
   🔑 PRESUNUTÉ 25. 9. 2026 DO \`flowScroller.tsx\` (\`.hf-scroll\` / \`.hf-srow\` /
      \`.hf-snav\`) — ten istý rad dostala aj POVAHA a dve kópie merania a šípok by
      sa raz rozišli. Text pravidiel je nezmenený, len sa presťahoval.
   ⚠️ Geometria dlaždíc (\`.pt-cats\`, \`.pt-sils\`) ostáva TU: to je vec obsahu
      tejto obrazovky, nie ovládača. */

/* ── KATEGÓRIA = ZLATÁ, SILUETA = LAPIS (Matej 24. 9.) ────────────────────
   *„chipy by som nedával modré, ale možno nejak odlíšil farebne od spodných
   blokov, nech to nie je jednotvárne"* — a to je presne to, čo predpisuje brand
   lock: **ZLATO = konštrukcia a poloha** („kde som", menovite *aktívna pilulka*)
   · **LAPIS = moja voľba a akcia** („čo urobím").
   🔑 Kategória hovorí, ktorú POLICU mám otvorenú — nič si ňou nevyberám, patrón
      sa ňou nemení. Silueta POD ňou je odpoveď, ktorá ide do heroglyfu. Dva rady
      nad sebou tak prestali byť dvakrát to isté modré.
   ⚠️ Pilulka KRÍŽENEC ostáva LAPISOVÁ zámerne — to je voľba, nie poloha. */
.pt-chip {
  flex: 0 0 auto; height: 28px; padding: 0 11px; border-radius: ${PACK_R.pill}px;
  cursor: pointer; white-space: nowrap;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em;
  color: ${LAB.inkSoft}; text-shadow: 0 1px 0 rgba(255, 252, 240, 0.70);
  background: rgba(255, 253, 247, 0.55);
  border: 1.5px solid rgba(179, 130, 45, 0.55);
  transition: border-color .16s, background .16s, color .16s, box-shadow .16s;
}
.pt-chip:hover { border-color: rgba(179, 130, 45, 0.85); }
.pt-chip.on {
  background: ${BRAND_GOLD_BTN.grad};
  border-color: ${BRAND_GOLD_BTN.edge};
  color: ${BRAND_GOLD_BTN.ink};
  box-shadow: ${BRAND_GOLD_BTN.glow};
  text-shadow: 0 1px 0 rgba(255, 252, 240, 0.28);
}

/* Návod k výberu — najtichší riadok obrazovky. Menší než popisky v doske a bez
   rozstrelenia: je to poznámka pod čiarou, nie druhý nadpis. */
.pt-hintline { font-size: 12px; margin-top: -2px; }

/* ── SILUETA ──────────────────────────────────────────────────────────────
   🔴 DLAŽDICA JE \`.hf-pick\` — mení sa LEN GEOMETRIA. Materiál (papyrusový
      gradient, vypuklá hrana, lapisový tint pri výbere) sa neopisuje, inak by
      voľba na tejto obrazovke vyzerala inak než voľba na PODSTATE.
   ⚠️ NEDOSTÁVA PLNÚ ZLATÚ VÝPLŇ, akú Matej 24. 9. vybral pre dlaždice PODSTATY
      (\`.es-picks .hf-pick\` = \`BRAND_GOLD_BTN\`). Tam sú dve až tri dlaždice a
      zlato ich odlíšilo od chipov nad nimi; tu ich je v rade 6–11 a plná zlatá
      by z radu urobila zlatý pás, v ktorom čierna kresba patróna prestane byť
      tým, na čo sa oko pozerá. Kresba je tu odpoveď, nie ozdoba.
      🚩 Je to jediné miesto, kde som jeho rozhodnutie z predchádzajúceho kroku
         NEPRENIESOL — čaká na jeho slovo. */
.pt-sil {
  flex: 0 0 auto; width: 68px; height: 68px; padding: 0;
  justify-content: center; border-radius: ${PACK_R.tile}px;
}
.pt-sil img { width: 48px; height: 48px; object-fit: contain; }
/* ── ZAMKNUTÉ CTA NESIE MATERIÁL, NIE PRIESVITNOSŤ ────────────────────────
   🔴 \`.hf-cta:disabled\` má \`opacity: .4\` — a 40 % lapisu je na papyruse ŠEDÁ
      PLOCHA cez celú šírku dosky. Presne to Matej zamietol 31. 8. 2026 na
      siluete (*„šedé tlačítko a tieň presvitá"*) a kvôli tomu má prezliekacia
      vrstva \`flowRedress.tsx\` vlastné pravidlo pre staré obrazovky. Nová
      obrazovka ho nededí (to pravidlo visí na \`.dark-bg\`), takže si ho berie
      sama — ten istý recept: plochý papyrus, tlmený inkoust, žiadny tieň.
      Tvar ostáva, takže je vidno, čo pribudne, keď patrón pribudne. */
.pt-stack .hf-cta:disabled {
  opacity: 1; cursor: default;
  background: ${T.tileBg};
  color: ${LAB.inkMuted};
  box-shadow: none;
  border: 1.5px solid ${LAB.hairline};
}
/* ── KRÁTKE OKNO: USTUPUJE OBSAH, NIE REZERVA ─────────────────────────────
   Lock \`PAGE_AIR\`: *kto sa nezmestí, ZMENŠÍ OBSAH — nie vzduch od okraja.*
   Po zväčšení prvého bloku (24. 9.) pretekala jediná zostava: **iPhone SE
   (375×667) so zapnutým krížencom** — o 29 px. Ustupujú preto tri najmenej
   dôležité miery naraz: rozstupy v doske, dlaždica siluety a výška polí.
   ⚠️ Hektor sa NEZMENŠUJE — je to prvé, čo Matej na mobile zväčšoval.
   ⚠️ Nie je to stupňovanie „podľa výšky okna" v zmysle, aký zamietol na
      PODSTATE (tam sa obrazovka menila PRI ODPOVEDANÍ). Tu je to jedna pevná
      poloha pre nízke okná a v nej sa už nič nehýbe. */
@media (max-height: 700px) {
  .pt-stack .hf-plate { gap: 8px; }
  /* ⚠️ SILUETA TU NIE JE, hoci tu do 24. 9. večera stála (54/38). Bolo to MŔTVE
     pravidlo: mobilný blok nižšie má rovnakú špecificitu a stojí ZA týmto, takže
     na iPhone SE (375×667 — spĺňa obe podmienky) vyhrával on. Zmenšenie siluety
     na krátkom okne rieši až spoločná podmienka na konci hárku. */
  .pt-field, .pt-mix { height: 36px; }
  .pt-chip { height: 26px; }
  /* Tlačidlo ustupuje ako POSLEDNÉ a len o 4 px — musí ostať zjavne tlačidlom.
     Rám heroglyfu neustupuje vôbec: pod 78 % sa symboly v malých slotoch
     zlievajú (premerané 24. 9. na 390 px), a to je celý zmysel tejto obrazovky. */
  .pt-stack .hf-cta { height: 36px; }
  /* Posledné 4 px: medzera medzi bublinou a doskou. Nula by ich zlepila. */
  .pt-speak { margin-bottom: 4px; }
}
/* Kresby patrónov sú ČIERNE (kánon počas života psa, DOGMA 8.3) a na papyruse
   ostávajú čierne — žiadny filter. */
/* ── 📱 NA TELEFÓNE SÚ SILUETY VÄČŠIE A JE ICH V ZÁBERE MENEJ ──────────────
   Matej 24. 9. 2026: *„na mobile to má rezervy = zväčši siluety psov, kľudne
   môžu byť len 5 viditeľných, nie ako teraz 6; hore aj dolu je dostatok
   priestoru = využime ho"*.
   🔑 ČÍSLO NIE JE ODHAD. Matej pozerá rám 500 px (dielňa aj jeho okno): doska
      v ňom má 412 px, takže PÄŤ dlaždíc s rozstupom 8 vyjde na
      (412 − 4×8) / 5 = **76 px**. Pri 62 ich tam bolo presne šesť — to, čo videl.
   🔑 REZERVU MINIEME NA KRESBU, nie na vzduch: dlaždica rastie 62 → 76 a kresba
      44 → 56, takže silueta psa je o štvrtinu väčšia. Rad tým vyrastie o 14 px;
      na 390×844 ostáva vzduch okolo 110 px na každej strane.
   ⚠️ Na 390 px je v zábere ~3,5 dlaždice. Je to Matejova voľba (*„kľudne môžu
      byť len 5"*) a odrezaná dlaždica na okraji je zároveň to jediné, čo na
      dotyku hovorí „rad pokračuje" — šípky sú tam skryté. */
@media (max-width: 559px) {
  .pt-sil { width: 80px; height: 80px; }
  /* Kresba zaberá 75 % dlaždice (na PC 70 %) — Matej pýtal väčšie SILUETY, nie
     väčšie rámčeky, a osem pixelov vzduchu okolo kresby na to stačí. */
  .pt-sil img { width: 60px; height: 60px; }
}
/* 🔴 KRÁTKE OKNO + TELEFÓN NARAZ — a MUSÍ to stáť AŽ TU. Obe podmienky majú
   rovnakú špecificitu, takže rozhoduje poradie; keď to pravidlo stálo vyššie,
   iPhone SE si bral mobilnú veľkosť a zmenšenie sa ticho nedialo.
   66 px je strop, ktorý sa na SE ešte zmestí aj so zapnutým krížencom
   (premerané: vzduch ostáva nad 16 px, teda nad dnom \`PAGE_AIR\`). */
@media (max-width: 559px) and (max-height: 700px) {
  .pt-sil { width: 70px; height: 70px; }
  .pt-sil img { width: 52px; height: 52px; }
}

/* ── 📱 VYSOKÝ TELEFÓN: VIAC VZDUCHU V BLOKOCH (25. 9. 2026) ──────────────────
   Matej: *„patrón a povaha na tel kľudne daj na 85 = pridaj väčšie okraje 1.
   alebo druhému bloku, aby si to viac vyplnil."* Na 390×844 mal patrón výplň
   74 % — najprázdnejšia zostava z celého vstupu (merač HRANICA).
   🔑 RASTIE VZDUCH V BLOKOCH, NIE OBSAH. Dlaždice, rám ani písmo sa nedotýkajú:
      na telefóne sú už zväčšené a ďalší rast by ich priblížil k okrajom dosky.
   ⚠️ LEN VYSOKÝ TELEFÓN (min-height 701). iPhone SE má 667 a tam je patrón na
      91 % — pridať vzduch by ho poslalo cez hranicu. */
@media (max-width: 559px) and (min-height: 701px) {
  .pt-speak { padding: 16px; margin-bottom: 12px; }
  .pt-stack .hf-plate { padding: 32px 22px; gap: 16px; }
}
`;
