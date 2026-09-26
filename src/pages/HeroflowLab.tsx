import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import hekthorImg from '@/assets/hekthor.png';
import { hasChoice, saveConsent } from '@/lib/consent';
import { FILL_MSG, FILL_BAND, HRANICA_KEY, type FlowFill } from '@/components/screens/flowFill';
import {
  BY_STEP as FACE_BY_STEP,
  DEV_FACES_KEY,
  N as FACE_N,
  face as faceUrl,
} from '@/lib/hekthorFaces';
import {
  DEV_SEED_DEFAULT,
  TEST_PHOTO_SHAPES,
  clearDevSeed,
  makeTestPhoto,
  shrinkForSeed,
  writeDevSeed,
  type DevSeed,
  type DevSeedPopup,
  type TestPhotoShape,
} from '@/lib/devSeed';

// ════════════════════════════════════════════════════════════════════════════
// /lab/heroflow — DIELŇA NOVÉHO VSTUPU (23. 9. 2026)
//
// Matej: *„vytvor mi testovacie prostredie dev menu (popup pri pýtaní fotky,
// popup pri orezávaní aj všetky stepps ktore urobime… chcem to mať na jednom
// mieste aby som to nemusel simulovať po iných stránkach)"*.
//
// Vľavo zoznam povrchov vstupu, vpravo RÁM, v ktorom ten povrch naozaj beží.
// Hore testovacie dáta — fotka, meno, číslo, žije/nežije, koľko psov.
//
// 🔴 PREČO RÁM A NIE PRESKAKOVANIE. Dev menu (`HeroflowDevMenu`) tu je od
//    28. 8. a robí presne to, čo Matejovi nestačí: hodí ho NA INÚ STRÁNKU. Rám
//    necháva zoznam, dáta aj obrazovku na jednej obrazovke naraz — a na tom
//    istom origin, takže popup aj flow bežia ako naozaj, nie ako napodobenina.
//
// 🔴 PREČO SEED A NIE PRIAME NASTAVENIE STORE. Rám je vlastný dokument s
//    vlastným store, a `dogyptStore` nepersistuje (partialize). Dáta preto idú
//    cez `localStorage` (`devSeed.ts`) a v ráme ich vloží `DevSeedBoot`.
//
// 🔴 ZOZNAM NESIE LEN NÁZOV A DVA CHIPY (Matej 25. 9. 2026: *„daj preč messy
//    words nechaj len názov kroku bez vysvetlenia aj tak to nečítam len tam daj
//    chipy či sedí telefon a pc velkostne overene"*). Pole `note` s popisom, čo
//    je na kroku rozostavané, tým zaniklo — také veci patria do `KONTEXT.md`
//    a na nástenku, nie do nástroja, v ktorom sa pozerá na obrazovky.
//
// ⚠️ ZOZNAM `STEPS` JE RUČNÝ A TO JE ZÁMER. Stav („hotové / rozostavané /
//    staré") nevie zmerať skript — je to úsudok o tom, či povrch už zodpovedá
//    rozhodnutiam z 23. 9. Pri každej hotovej obrazovke sa prepíše `state` tu.
//    Druhý zoznam ciest webu žije v `DevNav.tsx`, poradie vstupu v
//    `HeroflowDevMenu.tsx` — keď sa vstup zmení, meň všetky tri.
// ════════════════════════════════════════════════════════════════════════════

type StepState = 'done' | 'wip' | 'todo' | 'old';

type Step = {
  name: string;
  /** Kam ide rám. Pri popupe je to scéna, nad ktorou popup vyskočí. */
  path: string;
  popup?: DevSeedPopup;
  state: StepState;
};

type Group = { label: string; steps: Step[] };

const GROUPS: Group[] = [
  {
    label: 'Nový vstup',
    steps: [
      {
        name: '1 · Fotka',
        path: '/lab/scena',
        popup: 'photo',
        state: 'done',
      },
      // 🔴 Krok „1b · To isté nad stenou" a „5 · Prečo heroglyf" ODSTRÁNENÉ
      // z tohto zoznamu (Matej 24. 9.: „toto vymaž ako aj 1b" — odpoveď na
      // otázku, ktorá zahŕňala 1b aj celý krok „PREČO HEROGLYF"). Obrazovka
      // `/heroglyph/why` sa NEMAZALA, len odvesila z poradia — dostupná
      // ostáva cez `HeroflowDevMenu.tsx` a `DevNav.tsx`. Zvyšné kroky sú
      // preto prečíslované tak, aby šli po sebe (podstata je teraz 5, nie 6).
      {
        name: '2 · Meno',
        path: '/heroglyph/name',
        state: 'done',
      },
      {
        name: '3 · Svorka',
        path: '/heroglyph/dogs',
        state: 'done',
      },
      { name: '4 · E-mail', path: '/heroglyph/email', state: 'done' },
      {
        name: '5 · Podstata',
        path: '/heroglyph/essence',
        state: 'done',
      },
      {
        name: '6 · Patrón',
        path: '/heroglyph/breed',
        state: 'done',
      },
      {
        name: '7 · Povaha',
        path: '/heroglyph/dog-character',
        state: 'done',
      },
      {
        name: '8 · Majiteľ',
        path: '/heroglyph/owner-info',
        state: 'done',
      },
      // Chvost flowu (25. 9. 2026, nákres `plany/nakres-chvost-flowu-2026-09-25.html`):
      // ODHALENIE a ODKAZ sú jedna obrazovka, CHECKOUT + PLATBA jedna POKLADŇA,
      // „Nechcem platiť" vedie na ZADRŽANIE.
      { name: '9 · Odhalenie + odkaz', path: '/heroglyph/reveal', state: 'done' },
      { name: '10 · Pokladňa', path: '/checkout', state: 'done' },
      // 26. 9. 2026: zadržanie je POPUP v pokladni (preto 10a, nie 11 — Matej: „nie je to nová obrazovka“), `/heroglyph/stay` bez
      // parametra len presmeruje sem.
      { name: '10a · Zadržanie (popup)', path: '/checkout?stay=1', state: 'done' },
      // FINÁLE (Matej 26. 9. 2026: *„musíme pridať nový reveal aj welcome
      // screen"*). Ešte nepostavené — rám zatiaľ ukáže dnešný `/welcome`.
      { name: '11 · Reveal po platbe', path: '/welcome', state: 'todo' },
      { name: '12 · Welcome', path: '/welcome', state: 'todo' },
    ],
  },
  {
    // 🔴 ZOSTALO LEN TO, ČÍM SA V NOVOM VSTUPE NAOZAJ PRECHÁDZA (Matej 25. 9.:
    //    *„odstrán tie čo tam nemajú čo robiť staré a tie čo sme už zlúčili"*).
    //    Von išlo deväť riadkov: `ranking` · `owner-info` (stará) · `owner-zodiac`
    //    · `owner-final` — tie zliala obrazovka MAJITEĽ; `dog-gender` · `dog-fate`
    //    · `dog-colour` · `dog-bloodline` — tie pýta od 24. 9. PODSTATA; a starý
    //    `crop`, ktorý zanikol s výrezom v popupe fotky.
    // ⚠️ Obrazovky sa NEMAZALI a routy ďalej stoja (LIVE vstup po nich chodí).
    //    Kto ich potrebuje otvoriť, má ich v `DevNav.tsx` a `HeroflowDevMenu.tsx`
    //    — tento zoznam je dielňa NOVÉHO vstupu, nie súpis všetkého, čo existuje.
    label: 'Koniec flow — zatiaľ staré',
    steps: [
      // Odhalenie · Odkaz · Checkout · Platba odišli 25. 9. do nového vstupu (9–11).
      { name: 'Welcome (dnešný)', path: '/welcome', state: 'old' },
    ],
  },
  {
    label: 'Na porovnanie',
    steps: [
      {
        name: 'Fotka (staré)',
        path: '/heroglyph/photo',
        state: 'old',
      },
      { name: '/entry', path: '/entry', state: 'old' },
    ],
  },
];

/**
 * Rozmery rámu. 500 je Matejovo úzke okno (merané), 390 iPhone, 1280 počítač.
 *
 * 🔴 VÝŠKA POČÍTAČA JE 780, NIE 860 (opravené 25. 9. 2026). Matej poslal dva
 *    screenshoty tej istej obrazovky — v dielni vyzerala dobre, v prehliadači
 *    nie — a dôvod bol práve tu: rám dostával o ~90 px viac výšky, než má jeho
 *    skutočné okno. Obrazovky vstupu sa podľa výšky okna zmenšujú (rám má
 *    stupnicu vo FLOW_GLYPH_CSS), takže dielňa ukazovala inú polohu než realita
 *    a merané percento výplne bolo optimistické.
 * ⚠️ Dielňa musí merať to, čo človek naozaj vidí. Keď sa tieto čísla rozídu so
 *    skutočným oknom, celý panel „výplň" klame — a to je horšie, než keby tam
 *    nebol.
 */
const WIDTHS = [
  { id: 'phone', label: 'Telefón', w: 390, h: 844 },
  { id: 'small', label: 'Úzke okno', w: 500, h: 880 },
  { id: 'desk', label: 'Počítač', w: 1280, h: 780 },
] as const;

const NO_PHOTO = { id: 'none' as const, label: 'bez fotky' };

export default function HeroflowLab() {
  const [seed, setSeed] = useState<DevSeed>({ ...DEV_SEED_DEFAULT });
  const [photoPick, setPhotoPick] = useState<TestPhotoShape | 'none' | 'custom'>('portrait');
  const [width, setWidth] = useState<(typeof WIDTHS)[number]['id']>('small');
  const [active, setActive] = useState<Step | null>(null);
  const [frameKey, setFrameKey] = useState(0);
  const [busy, setBusy] = useState(false);
  /** Má lišta vyskočiť v ráme? Predvolene nie — ladí sa obrazovka, nie súhlas. */
  const [cookies, setCookies] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── HRANICA: koľko z obrazovky obsah zaberá (25. 9. 2026) ────────────────
  // Matej: *„mali by sme mať každú obrazovku cca rovnako vyplnenú… do labu by
  // sme mohli mať aj tento údaj, aby sme to vedeli namodelovať a stránky boli
  // podobné."* Čísla NEPÍŠE človek — hlási ich `FlowFillProbe` z bežiacej
  // obrazovky (`postMessage`), takže tabuľka nemôže zostarnúť.
  const [fills, setFills] = useState<Record<string, FlowFill>>({});
  /**
   * Fronta meraní: cesta + ŠÍRKA, na ktorej sa má premerať.
   * 🔑 Matej 25. 9.: *„daj tam chipy či sedí telefon a pc velkostne overene"* —
   *    stav sa teda nedá vziať z práve nastaveného rámu, musia sa premerať OBE
   *    veľkosti. Preto je vo fronte dvojica, nie len cesta.
   */
  const [queue, setQueue] = useState<{ path: string; w: number; h: number }[]>([]);
  const [hranica, setHranica] = useState(() => {
    try { return localStorage.getItem(HRANICA_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(HRANICA_KEY, hranica ? '1' : '0'); } catch { /* prázdne úložisko */ }
    // `storage` udalosť do VLASTNÉHO dokumentu nechodí, len do ostatných — a
    // presne tie (rám) ju potrebujú. Dielňa si stav drží v `useState`.
  }, [hranica]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== FILL_MSG || !e.data.fill) return;
      const fill = e.data.fill as FlowFill;
      setFills((f) => ({ ...f, [`${fill.path}|${fill.sirka}`]: fill }));
      // Krok sa ozval ⇒ fronta ide ďalej. Meria sa po jednom: dva rámy naraz
      // by si na slabšom stroji navzájom skreslili čas prvého vykreslenia.
      setQueue((q) => (q[0]?.path === fill.path ? q.slice(1) : q));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const size = WIDTHS.find((w) => w.id === width) ?? WIDTHS[1];

  /** Kroky, ktoré sa dajú merať — nové (bledé) obrazovky vstupu. Staré javisko
   *  `.hf-stage` nemajú, takže by sa neozvali a fronta by na nich čakala. */
  const merateľne = useMemo(
    () => GROUPS[0].steps.filter((s) => (s.path.startsWith('/heroglyph/') || s.path === '/checkout')),
    [],
  );

  /**
   * Premerať KAŽDÝ krok na telefóne AJ na počítači. Fronta, nie paralelný beh.
   * ⚠️ Úzke okno (500) sa nemeria — chipy hovoria o dvoch krajoch, a keby bol
   *    tretí, prestali by sa dať prečítať jedným pohľadom. Kto potrebuje 500,
   *    prepne rám a pozrie sa naň.
   */
  const CHIP_SIZES = useMemo(
    () => WIDTHS.filter((w) => w.id === 'phone' || w.id === 'desk'),
    [],
  );
  const zmeraj = () => {
    writeDevSeed({ ...seed, popup: null });
    setQueue(merateľne.flatMap((st) => CHIP_SIZES.map((w) => ({ path: st.path, w: w.w, h: w.h }))));
  };

  // Keď fronta stojí dlhšie na tom istom kroku, nepočkáme navždy: krok, ktorý
  // sa do 6 s neozve, sa preskočí (stará obrazovka, chyba v ráme).
  useEffect(() => {
    if (queue.length === 0) return;
    const id = setTimeout(() => setQueue((q) => q.slice(1)), 6000);
    return () => clearTimeout(id);
  }, [queue]);

  // ── FOTKY HEKTORA (26. 9. 2026) ───────────────────────────────────────────
  // Matej: *„pridaj do labu možnosť kde budem môcť naklikať fotky aj si
  // pozrieť náhľad"*. Override ide presne ako `devSeed.ts` — cez
  // `localStorage` (`DEV_FACES_KEY` z `hekthorFaces.ts`), lebo rám je iný
  // dokument než dielňa a treba mu dáta odovzdať cez kanál, ktorý prežije
  // nové načítanie stránky.
  const [faceOverrides, setFaceOverrides] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(DEV_FACES_KEY);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch { return {}; }
  });

  const writeFaces = (next: Record<string, number>) => {
    setFaceOverrides(next);
    try { localStorage.setItem(DEV_FACES_KEY, JSON.stringify(next)); } catch { /* prázdne úložisko */ }
  };

  /**
   * Kľúč ksichtu pre otvorený krok. Obrazovky ho volajú NAPRIAMO literálom
   * (`hekthorFace('stay')` v `FlowStayScreen.tsx`), nie odvodene z cesty —
   * táto funkcia teda len napodobňuje, čo si ktorá obrazovka pýta. `null` =
   * na kroku fotka Hektora nie je (napr. samotná pokladňa bez zadržania).
   */
  const faceKeyForPath = (path: string): string | null => {
    const m = path.match(/^\/heroglyph\/([^/?#]+)/);
    if (m) return m[1];
    if (path.startsWith('/checkout') && path.includes('stay=1')) return 'stay';
    return null;
  };

  const activeFaceKey = active ? faceKeyForPath(active.path) : null;
  const activeFaceDefault = activeFaceKey ? FACE_BY_STEP[activeFaceKey] ?? 1 : 1;
  const activeFaceNow = activeFaceKey ? faceOverrides[activeFaceKey] ?? activeFaceDefault : activeFaceDefault;

  /** Klik na náhľad = zapíš override a hneď prenačítaj rám, nech je vidno. */
  const pickFace = (n: number) => {
    if (!activeFaceKey) return;
    writeFaces({ ...faceOverrides, [activeFaceKey]: n });
    setFrameKey((k) => k + 1);
  };

  const resetFace = () => {
    if (!activeFaceKey) return;
    const next = { ...faceOverrides };
    delete next[activeFaceKey];
    writeFaces(next);
    setFrameKey((k) => k + 1);
  };

  /** Matej vloží výstup do chatu a Claude ním prepíše `BY_STEP`. */
  const copyFacesForClaude = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(faceOverrides, null, 2));
    } catch { /* schránka odmietla — zoznam nižšie je vidno aj bez nej */ }
  };

  // ── COOKIE LIŠTA (23. 9. 2026) ────────────────────────────────────────────
  // Bez tohto sa kreslí DVAKRÁT — raz v dielni, raz v ráme — a v ráme si berie
  // spodok obrazovky, ktorý sa práve ladí (na 390 px je vysoká 296 px, viď
  // `ConsentBanner.tsx`). Voľba je uložená v `localStorage`, ktorý rám s dielňou
  // zdieľa, takže jeden prepínač mlčí na oboch stranách.
  //
  // ⚠️ ZAPNÚŤ SA MUSÍ DAŤ SPÄŤ. „Cookie lišta leží cez spodnú lištu `/pack`" je
  //    otvorený dlh — nástroj, ktorý ju natrvalo schová, by ho skryl aj pred okom.
  useEffect(() => {
    if (cookies) {
      try { localStorage.removeItem('dogypt_consent'); } catch { /* prázdne úložisko */ }
    } else if (!hasChoice()) {
      saveConsent({ analytics: false, marketing: false });
    }
  }, [cookies]);

  // Testovacia fotka sa kreslí na plátne — v repe žiadna ležatá nie je a práve
  // tá je dôvod, prečo výrez zostal v popupe.
  useEffect(() => {
    if (photoPick === 'custom') return; // vlastnú drží seed, neprekresľovať
    if (photoPick === 'none') {
      setSeed((s) => ({ ...s, photoUrl: '', photoLabel: 'bez fotky' }));
      return;
    }
    let live = true;
    setBusy(true);
    makeTestPhoto(photoPick, hekthorImg)
      .then((url) => {
        if (!live) return;
        const label = TEST_PHOTO_SHAPES.find((s) => s.id === photoPick)?.label ?? '';
        setSeed((s) => ({ ...s, photoUrl: url, photoLabel: label }));
      })
      .finally(() => live && setBusy(false));
    return () => { live = false; };
  }, [photoPick]);

  /** Jeden zápis seedu + načítanie rámu. Všetko v labe ide cezeň. */
  const open = (step: Step) => {
    writeDevSeed({ ...seed, popup: step.popup ?? null });
    setActive(step);
    setFrameKey((k) => k + 1);
  };

  /** Zmena dát pri otvorenom ráme = prepíš seed a načítaj rám znova. */
  const reload = () => {
    if (!active) return;
    writeDevSeed({ ...seed, popup: active.popup ?? null });
    setFrameKey((k) => k + 1);
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await shrinkForSeed(file);
      setPhotoPick('custom');
      setSeed((s) => ({ ...s, photoUrl: url, photoLabel: `vlastná · ${file.name}` }));
    } finally {
      setBusy(false);
    }
  };

  const total = useMemo(() => {
    const entry = GROUPS[0].steps;
    return { done: entry.filter((s) => s.state === 'done').length, all: entry.length };
  }, []);

  return (
    <div className="hfl-root">
      <style>{CSS}</style>

      <aside className="hfl-side">
        <div className="hfl-brand">
          <b>HEROFLOW</b>
          <span>dielňa nového vstupu · {total.done}/{total.all} hotových</span>
        </div>

        {/* ── ZOZNAM POVRCHOV ──────────────────────────────────────────── */}
        {/* Matej 24. 9.: „v labe chcem mať len responzivitu… nie cookie lišta
            ani stav psa, resp. to schovaj a vypni za dropdown, nech mám ľavú
            stranu prehľadnejšiu" — zoznam krokov je preto NAD ohybom, testovacie
            dáta idú do zabaleného <details> nižšie. */}
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="hfl-head">{g.label}</div>
            {g.steps.map((step) => (
              <button
                key={step.name}
                type="button"
                className={`hfl-step is-${step.state}${active?.name === step.name ? ' is-here' : ''}`}
                onClick={() => open(step)}
              >
                <span className="dot" />
                <span className="txt">{step.name}</span>
                {/* Sedí to veľkostne na telefóne aj na počítači? Dva chipy,
                    zelený = zmestí sa a nie je poloprázdny. Prázdno = ešte
                    nemerané (alebo stará obrazovka bez javiska `.hf-stage`). */}
                <span className="hfl-chips2">
                  {CHIP_SIZES.map((w) => {
                    const f = fills[`${step.path}|${w.w}`];
                    const st = !f ? 'none' : f.pretecie > 0 ? 'over' : f.vyplnPct < FILL_BAND.min ? 'thin' : 'ok';
                    return (
                      <span
                        key={w.id}
                        className={`hfl-fill ${st}`}
                        title={f ? `${w.label} ${w.w}×${w.h} — výplň ${f.vyplnPct} %${f.pretecie > 0 ? `, preteká o ${f.pretecie} px` : ''}` : `${w.label} — nemerané`}
                      >
                        {w.id === 'phone' ? 'TEL' : 'PC'}
                      </span>
                    );
                  })}
                </span>
              </button>
            ))}
          </div>
        ))}

        <div className="hfl-legend">
          <span><i className="d done" /> hotové</span>
          <span><i className="d wip" /> rozostavané</span>
          <span><i className="d old" /> staré</span>
        </div>

        {/* ── VÝPLŇ OBRAZOVIEK ────────────────────────────────────────────
            Matej 25. 9.: *„mali by sme mať každú obrazovku cca rovnako
            vyplnenú… aby sme to vedeli namodelovať a stránky boli podobné."*
            🔑 Výplň = obsah / MIESTO MEDZI HRANICAMI (javisko mínus vzduch
               `PAGE_AIR`), nie z celého okna — inak by číslo hovorilo o okne,
               nie o obrazovke.
            🔴 Čísla sa NEPÍŠU: hlási ich bežiaca obrazovka. Tabuľka preto nemá
               ako zostarnúť — na rozdiel od rozpočtov výšky v hlavičkách
               obrazoviek, ktoré sú ručné súčty. */}
        <div className="hfl-head">Výplň · {size.label} {size.w}×{size.h}</div>
        <div className="hfl-fills">
          {merateľne.map((st) => {
            const f = fills[`${st.path}|${size.w}`];
            const pct = f?.vyplnPct ?? 0;
            const stav = !f ? 'none' : f.pretecie > 0 ? 'over' : pct < FILL_BAND.min ? 'thin' : 'ok';
            return (
              <div key={st.path} className={`hfl-fillrow is-${stav}`}>
                <span className="nm">{st.name}</span>
                <span className="bar"><i style={{ width: `${Math.min(100, pct)}%` }} /></span>
                <span className="pc">{f ? `${pct}%` : '—'}</span>
              </div>
            );
          })}
          <div className="hfl-note">
            Pásmo {FILL_BAND.min}–{FILL_BAND.max} %. Nad 100 % sa obrazovka roluje,
            pod {FILL_BAND.min} % je poloprázdna vedľa susedov.
          </div>
        </div>

        <div className="hfl-sep" />

        {/* ── TESTOVACIE DÁTA — zbalené, Matej ich potrebuje zriedka ──────
            (fotka, meno/mail/číslo, žije/nežije, cookie lišta v ráme, koľko
            psov). Nemažú sa, len sa neukazujú stále — preto <details>, nie
            samostatná stránka. */}
        <details className="hfl-testdata">
          <summary>Testovacie dáta</summary>

          <div className="hfl-head">Fotka</div>
          <div className="hfl-chips">
            {TEST_PHOTO_SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`hfl-chip${photoPick === s.id ? ' on' : ''}`}
                onClick={() => setPhotoPick(s.id)}
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              className={`hfl-chip${photoPick === 'none' ? ' on' : ''}`}
              onClick={() => setPhotoPick('none')}
            >
              {NO_PHOTO.label}
            </button>
            <button type="button" className={`hfl-chip${photoPick === 'custom' ? ' on' : ''}`} onClick={() => fileRef.current?.click()}>
              vlastná…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          {seed.photoUrl ? (
            <div className="hfl-photo">
              <img src={seed.photoUrl} alt="" />
              <span>{seed.photoLabel}<br />pes je zámerne vľavo — stredový výrez ho odreže</span>
            </div>
          ) : (
            <div className="hfl-note">Bez fotky — tak vyzerá človek, ktorý ju preskočil.</div>
          )}

          <div className="hfl-head">Pes a človek</div>
          <label className="hfl-field">
            <span>Meno psa</span>
            <input value={seed.dogName} onChange={(e) => setSeed((s) => ({ ...s, dogName: e.target.value }))} />
          </label>
          <label className="hfl-field">
            <span>E-mail</span>
            <input value={seed.email} onChange={(e) => setSeed((s) => ({ ...s, email: e.target.value }))} />
          </label>
          <label className="hfl-field">
            <span>Poradové číslo</span>
            <input
              type="number"
              value={seed.packNumber}
              onChange={(e) => setSeed((s) => ({ ...s, packNumber: Number(e.target.value) || 0 }))}
            />
          </label>

          <div className="hfl-head">Stav psa</div>
          <div className="hfl-chips">
            <button
              type="button"
              className={`hfl-chip${seed.lifeStatus === 'alive' ? ' on' : ''}`}
              onClick={() => setSeed((s) => ({ ...s, lifeStatus: 'alive' }))}
            >
              žije
            </button>
            <button
              type="button"
              className={`hfl-chip${seed.lifeStatus === 'deceased' ? ' on' : ''}`}
              onClick={() => setSeed((s) => ({ ...s, lifeStatus: 'deceased' }))}
            >
              zosnulý
            </button>
          </div>

          <div className="hfl-head">Cookie lišta v ráme</div>
          <div className="hfl-chips">
            <button type="button" className={`hfl-chip${!cookies ? ' on' : ''}`} onClick={() => setCookies(false)}>
              skrytá
            </button>
            <button type="button" className={`hfl-chip${cookies ? ' on' : ''}`} onClick={() => setCookies(true)}>
              vyskočí
            </button>
          </div>

          <div className="hfl-head">Koľko psov</div>
          <div className="hfl-chips">
            {[0, 1, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={`hfl-chip${seed.extraDogs === n ? ' on' : ''}`}
                onClick={() => setSeed((s) => ({ ...s, extraDogs: n }))}
              >
                {n === 0 ? 'jeden' : `+${n} ďalší`}
              </button>
            ))}
          </div>

          <button type="button" className="hfl-ghost" onClick={() => { clearDevSeed(); setActive(null); }}>
            Vyčistiť testovacie dáta
          </button>
        </details>

      </aside>

      <main className="hfl-stage">
        <div className="hfl-bar">
          <div className="hfl-widths">
            {WIDTHS.map((w) => (
              <button
                key={w.id}
                type="button"
                className={`hfl-chip${width === w.id ? ' on' : ''}`}
                onClick={() => setWidth(w.id)}
              >
                {w.label} · {w.w}
              </button>
            ))}
          </div>
          <div className="hfl-barright">
            {busy && <span className="hfl-busy">kreslím fotku…</span>}
            {/* HRANICA = dno vzduchu (`PAGE_AIR`) nakreslené do rámu + štítok
                s výplňou. Prepínač píše do `localStorage`, rám si ho vypočuje
                cez `storage` — ten istý kanál ako cookie lišta. */}
            <button
              type="button"
              className={`hfl-chip${hranica ? ' on' : ''}`}
              onClick={() => setHranica((h) => !h)}
              title="Nakreslí hranicu vzduchu a výplň priamo do rámu"
            >
              HRANICA
            </button>
            <button type="button" className="hfl-chip" onClick={zmeraj} disabled={queue.length > 0}>
              {queue.length > 0 ? `meriam… ${merateľne.length - queue.length + 1}/${merateľne.length}` : 'Zmerať výplň'}
            </button>
            {active && (
              <>
                <code>{active.path}</code>
                <button type="button" className="hfl-chip" onClick={reload}>
                  Načítať znova s dátami
                </button>
                <button
                  type="button"
                  className="hfl-chip"
                  onClick={() => { writeDevSeed({ ...seed, popup: active.popup ?? null }); window.open(active.path, '_blank'); }}
                >
                  Vo vlastnom okne
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── FOTKY HEKTORA — pás nad rámom (26. 9. 2026 večer) ─────────────
            Matej: *„v herolab potrebujem vedieť meniť fotky hektora v
            jednotlivých krokoch"* — výber existoval, ale ležal na DNE ľavého
            panelu pod meraním výplne, teda mimo obrazovky. Pás je teraz priamo
            nad krokom, ktorý mení: klik = override + nové načítanie rámu. */}
        {active && (
          <div className="hfl-facebar">
            {!activeFaceKey ? (
              <span className="hfl-facenote">Na kroku „{active.name}" fotka Hektora nie je.</span>
            ) : (
              <>
                <span className="hfl-facenote">
                  <b>Fotka Hektora</b> · {active.name}
                  <br />#{String(activeFaceNow).padStart(2, '0')}{activeFaceNow === activeFaceDefault ? ' (predvolená)' : ` · predvolená #${String(activeFaceDefault).padStart(2, '0')}`}
                </span>
                <div className="hfl-faces">
                  {Array.from({ length: FACE_N }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`hfl-faceit${n === activeFaceNow ? ' on' : ''}`}
                      onClick={() => pickFace(n)}
                      title={`#${String(n).padStart(2, '0')}${n === activeFaceDefault ? ' · predvolená' : ''}`}
                    >
                      <img src={faceUrl(n)} alt={`ksicht #${n}`} />
                      {n === activeFaceDefault && <i className="df">P</i>}
                    </button>
                  ))}
                </div>
                <div className="hfl-faceacts">
                  {activeFaceNow !== activeFaceDefault && (
                    <button type="button" className="hfl-chip" onClick={resetFace}>Predvolená</button>
                  )}
                  {Object.keys(faceOverrides).length > 0 && (
                    <button
                      type="button"
                      className="hfl-chip on"
                      onClick={copyFacesForClaude}
                      title={Object.entries(faceOverrides).map(([k, n]) => `${k} → #${n}`).join('\n')}
                    >
                      KOPÍROVAŤ PRE CLAUDA ({Object.keys(faceOverrides).length})
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Skrytý rám fronty. Meria sa v ňom jeden krok po druhom; je NAOZAJ
            vykreslený (mimo záberu), lebo `display:none` by mu dalo nulovú
            výšku a výplň by vyšla nezmyselne. */}
        {queue.length > 0 && (
          <iframe
            title="meranie"
            key={`${queue[0].path}|${queue[0].w}`}
            src={queue[0].path}
            className="hfl-probe"
            style={{ width: queue[0].w, height: queue[0].h }}
          />
        )}

        <div className="hfl-frame-wrap">
          {active ? (
            <Frame key={frameKey} src={active.path} w={size.w} h={size.h} />
          ) : (
            <div className="hfl-empty">
              Vyber vľavo povrch. Dáta hore platia pre ten, ktorý otvoríš —
              po ich zmene daj <b>Načítať znova</b>.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Rám s obrazovkou. Šírka je SKUTOČNÁ (iframe naozaj dostane 390 px), zmenšuje
 * sa až obraz — inak by sa merala iná šírka, než akú vidí telefón, a zalomenia
 * by klamali.
 */
function Frame({ src, w, h }: { src: string; w: number; h: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(1, (r.width - 24) / w, (r.height - 24) / h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  return (
    <div className="hfl-box" ref={box}>
      <div style={{ width: w * scale, height: h * scale }}>
        <iframe
          title="heroflow"
          src={src}
          style={{
            width: w,
            height: h,
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            borderRadius: 14,
            background: '#000',
          }}
        />
      </div>
    </div>
  );
}

/**
 * Ľahká scéna pre popupy. Popup fotky patrí na stenu, ale stena ťahá psov z
 * produkcie (fetch `get-grid-dogs` ~4,7 s) — na ladenie KARTY je to zbytočné
 * čakanie. Tapeta a atrapy dlaždíc stačia; nad ozajstnou stenou má lab vlastný
 * riadok.
 */
export function LabScene() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: "#0B0906 url('/images/bg-light.webp') center/cover",
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 10,
        padding: 14,
        alignContent: 'start',
      }}
    >
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '1',
            borderRadius: 8,
            background: 'rgba(0,0,0,.28)',
            border: '1px solid rgba(201,154,63,.18)',
          }}
        />
      ))}
    </div>
  );
}

const CSS = `
.hfl-root {
  position: fixed; inset: 0; display: flex;
  background: #0B0906; color: #FAF4EC;
  font-family: 'Space Grotesk', sans-serif;
}
/* Cookie lišta sa v dielni kreslila DRUHÝKRÁT (raz dielňa, raz rám) a sadala si
   presne na spodok práve ladenej obrazovky. Štýl žije len kým je dielňa
   namontovaná, takže v RÁME lišta ostáva — podľa prepínača vľavo.
   (Zoznam ciest DevNav sa vypína routou, priamo v ňom.) */
body:has(.hfl-root) .consent-banner { display: none !important; }
.hfl-side {
  width: 292px; flex: none; overflow-y: auto; padding: 14px 12px 24px;
  background: rgba(12,10,7,.96); border-right: 1px solid rgba(201,154,63,.2);
}
.hfl-brand { padding: 2px 4px 12px; }
.hfl-brand b {
  display: block; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 16px; letter-spacing: .14em; color: #C99A3F;
}
.hfl-brand span { font-size: 11px; color: rgba(250,244,236,.5); }
.hfl-head {
  padding: 12px 4px 6px; font-size: 10px; letter-spacing: .22em;
  text-transform: uppercase; color: rgba(201,154,63,.75);
}
.hfl-chips { display: flex; flex-wrap: wrap; gap: 5px; padding: 0 2px; }
.hfl-chip {
  border: 1px solid rgba(201,154,63,.3); border-radius: 999px;
  background: transparent; color: rgba(250,244,236,.66);
  font: inherit; font-size: 11px; padding: 4px 9px; cursor: pointer;
}
.hfl-chip:hover { border-color: rgba(201,154,63,.6); color: #FAF4EC; }
.hfl-chip.on { background: rgba(38,97,156,.28); border-color: #26619C; color: #FAF4EC; }
.hfl-photo { display: flex; gap: 8px; align-items: center; padding: 8px 4px 0; }
.hfl-photo img {
  width: 62px; height: 62px; object-fit: cover; border-radius: 8px; flex: none;
  border: 1px solid rgba(201,154,63,.3);
}
.hfl-photo span { font-size: 10px; line-height: 1.45; color: rgba(250,244,236,.5); }
.hfl-note { padding: 8px 4px 0; font-size: 10px; color: rgba(250,244,236,.45); }
.hfl-field { display: block; padding: 7px 2px 0; }
.hfl-field span {
  display: block; font-size: 10px; letter-spacing: .08em;
  color: rgba(250,244,236,.45); padding-bottom: 3px;
}
.hfl-field input {
  width: 100%; border: 1px solid rgba(201,154,63,.25); border-radius: 8px;
  background: rgba(0,0,0,.35); color: #FAF4EC; font: inherit; font-size: 12px;
  padding: 6px 8px;
}
.hfl-field input:focus { outline: none; border-color: #26619C; }
.hfl-sep { height: 1px; margin: 14px 4px 2px; background: rgba(201,154,63,.22); }
.hfl-step {
  display: flex; gap: 8px; width: 100%; text-align: left; align-items: flex-start;
  background: none; border: none; border-radius: 7px; padding: 7px 8px;
  cursor: pointer; font: inherit; font-size: 12px; color: rgba(250,244,236,.62);
}
.hfl-step:hover { background: rgba(255,255,255,.06); color: #FAF4EC; }
.hfl-step.is-here { background: rgba(201,154,63,.16); color: #FAF4EC; }
.hfl-step .txt i {
  display: block; font-style: normal; font-size: 10px; line-height: 1.45;
  color: rgba(250,244,236,.42); padding-top: 2px;
}
.hfl-step .dot {
  width: 7px; height: 7px; border-radius: 50%; flex: none; margin-top: 5px;
  border: 1px solid rgba(201,154,63,.5); background: transparent;
}
.hfl-step.is-done .dot { background: #C99A3F; border-color: #C99A3F; }
.hfl-step.is-wip .dot { background: #B25640; border-color: #B25640; }
.hfl-step.is-todo .dot { background: transparent; border-color: #B25640; }
.hfl-step.is-old .dot { border-style: dashed; border-color: rgba(250,244,236,.3); }
.hfl-ghost {
  width: 100%; margin-top: 10px; border: 1px solid rgba(201,154,63,.25);
  border-radius: 8px; background: transparent; color: rgba(250,244,236,.6);
  font: inherit; font-size: 11px; padding: 7px; cursor: pointer;
}
.hfl-ghost:hover { color: #FAF4EC; border-color: rgba(201,154,63,.55); }
.hfl-legend {
  display: flex; gap: 10px; padding: 12px 4px 0; font-size: 10px;
  color: rgba(250,244,236,.42);
}
.hfl-legend .d {
  display: inline-block; width: 7px; height: 7px; border-radius: 50%;
  margin-right: 4px; border: 1px solid rgba(201,154,63,.5);
}
.hfl-legend .d.done { background: #C99A3F; border-color: #C99A3F; }
.hfl-legend .d.wip { background: #B25640; border-color: #B25640; }
.hfl-legend .d.old { border-style: dashed; border-color: rgba(250,244,236,.3); }

/* ── VÝPLŇ OBRAZOVIEK (25. 9. 2026) ───────────────────────────────────────
   Tri stavy a každý má DÔVOD, nie len farbu: zelená = v pásme · jantárová =
   poloprázdna (pridaj) · červená = preteká (uber). Šedá = nemerané. */
.hfl-fills { display: flex; flex-direction: column; gap: 4px; padding: 2px 4px 0; }
.hfl-fillrow { display: flex; align-items: center; gap: 7px; font-size: 10px; }
.hfl-fillrow .nm {
  flex: 0 0 74px; min-width: 0; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; color: rgba(250,244,236,.62);
}
.hfl-fillrow .bar {
  flex: 1 1 auto; height: 6px; border-radius: 999px; overflow: hidden;
  background: rgba(250,244,236,.10);
}
.hfl-fillrow .bar i { display: block; height: 100%; background: rgba(250,244,236,.3); }
.hfl-fillrow .pc { flex: 0 0 30px; text-align: right; color: rgba(250,244,236,.62); }
.hfl-fillrow.is-ok .bar i { background: #3D7A4E; }
.hfl-fillrow.is-thin .bar i { background: #C99A3F; }
.hfl-fillrow.is-over .bar i { background: #B25640; }
.hfl-fillrow.is-over .pc, .hfl-fillrow.is-over .nm { color: #E08A72; }
/* ── DVA CHIPY PRI KROKU: TELEFÓN a POČÍTAČ (25. 9. 2026) ────────────────────
   Matej: *„daj preč messy words nechaj len názov kroku bez vysvetlenia aj tak
   to nečítam len tam daj chipy či sedí telefon a pc velkostne overene"*.
   Zoznam teda nehovorí, ČO je na kroku rozostavané (to patrí do KONTEXT.md),
   ale jedinú vec, ktorú z neho vidno na prvý pohľad: zmestí sa to?
   Zelený = zmestí sa a nie je poloprázdny · žltý = poloprázdny · červený =
   preteká · sivý = ešte nemerané. Presné číslo je v tooltipe. */
.hfl-chips2 { flex: none; display: flex; gap: 4px; margin-left: 6px; }
.hfl-fill {
  flex: none; padding: 1px 5px; border-radius: 999px;
  font-size: 9px; letter-spacing: .06em;
  border: 1px solid rgba(250,244,236,.18); color: rgba(250,244,236,.55);
}
/* Nemerané nesmie vyzerať ako v poriadku — je to otázka, nie odpoveď. */
.hfl-fill.none { opacity: .45; }
.hfl-fill.ok { border-color: rgba(61,122,78,.7); color: #7FBF95; }
.hfl-fill.thin { border-color: rgba(201,154,63,.7); color: #E0BC72; }
.hfl-fill.over { border-color: rgba(178,86,64,.8); color: #E08A72; }
/* Rám fronty stojí mimo záberu, ale VYKRESLENÝ — display:none by mu dalo
   nulovú výšku a merač by hlásil nezmysel. */
.hfl-probe { position: fixed; left: -10000px; top: 0; border: 0; visibility: hidden; }
/* Zbalený rozbaľovač testovacích dát (24. 9.) — rovnaké tóny a polomer, aké
   už panel má (border rgba(201,154,63,.2) z .hfl-side, radius 8px z .hfl-ghost),
   žiadny nový token. */
.hfl-testdata {
  margin-top: 10px; border: 1px solid rgba(201,154,63,.2); border-radius: 8px;
  padding: 2px 6px 8px;
}
.hfl-testdata summary {
  cursor: pointer; list-style: none; padding: 9px 4px;
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
  color: rgba(201,154,63,.75);
}
.hfl-testdata summary::-webkit-details-marker { display: none; }
.hfl-testdata[open] summary { color: #FAF4EC; }
/* ── FOTKY HEKTORA — mriežka náhľadov (26. 9. 2026) ──────────────────────
   48 px kruhy, presne toľko, aby sa 26 kusov zmestilo do 292 px bočnej lišty
   v šiestich riadkoch. „P" = predvolená z BY_STEP, zlatý rám = aktuálna
   voľba (override alebo predvolená, keď override nie je). */
.hfl-facebar {
  display: flex; align-items: center; gap: 12px; padding: 8px 14px;
  border-bottom: 1px solid rgba(201,154,63,.16); background: rgba(0,0,0,.25);
}
.hfl-facenote { flex: 0 0 auto; font-size: 11px; line-height: 1.5; color: rgba(250,244,236,.55); min-width: 120px; }
.hfl-facenote b { color: #C99A3F; font-weight: 600; }
.hfl-faces {
  flex: 1; min-width: 0; display: flex; gap: 6px; overflow-x: auto; padding: 2px;
  scrollbar-width: thin;
}
.hfl-faceit {
  position: relative; flex: 0 0 48px; width: 48px; height: 48px; padding: 0;
  border-radius: 50%; border: 2px solid rgba(201,154,63,.25);
  background: transparent; cursor: pointer; overflow: hidden;
}
.hfl-faceit img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hfl-faceit:hover { border-color: rgba(201,154,63,.6); }
.hfl-faceit.on { border-color: #C99A3F; box-shadow: 0 0 0 2px rgba(201,154,63,.35); }
.hfl-faceit .df {
  position: absolute; right: -1px; bottom: -1px; width: 14px; height: 14px;
  border-radius: 50%; background: #26619C; color: #FAF4EC; font-size: 8px;
  font-style: normal; font-weight: 600; display: flex; align-items: center;
  justify-content: center; border: 1px solid rgba(250,244,236,.4);
}
.hfl-faceacts { flex: 0 0 auto; display: flex; flex-direction: column; gap: 4px; }

.hfl-stage { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.hfl-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 14px; border-bottom: 1px solid rgba(201,154,63,.16);
  flex-wrap: wrap;
}
.hfl-widths, .hfl-barright { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.hfl-barright code {
  font-size: 11px; color: rgba(201,154,63,.8);
  background: rgba(0,0,0,.4); padding: 3px 7px; border-radius: 6px;
}
.hfl-busy { font-size: 11px; color: rgba(250,244,236,.45); }
.hfl-frame-wrap { flex: 1; min-height: 0; display: flex; }
.hfl-box { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; }
.hfl-empty {
  margin: auto; max-width: 340px; text-align: center; font-size: 13px;
  line-height: 1.6; color: rgba(250,244,236,.45);
}
.hfl-empty b { color: rgba(250,244,236,.8); font-weight: 500; }
`;
