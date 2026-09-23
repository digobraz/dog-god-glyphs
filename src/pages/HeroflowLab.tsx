import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import hekthorImg from '@/assets/hekthor.png';
import { hasChoice, saveConsent } from '@/lib/consent';
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
// ⚠️ ZOZNAM `STEPS` JE RUČNÝ A TO JE ZÁMER. Stav („hotové / rozostavané /
//    staré") nevie zmerať skript — je to úsudok o tom, či povrch už zodpovedá
//    rozhodnutiam z 23. 9. Pri každej hotovej obrazovke sa prepíše `state` tu.
//    Druhý zoznam ciest webu žije v `DevNav.tsx`, poradie vstupu v
//    `HeroflowDevMenu.tsx` — keď sa vstup zmení, meň všetky tri.
// ════════════════════════════════════════════════════════════════════════════

type StepState = 'done' | 'wip' | 'old';

type Step = {
  name: string;
  /** Kam ide rám. Pri popupe je to scéna, nad ktorou popup vyskočí. */
  path: string;
  popup?: DevSeedPopup;
  state: StepState;
  /** Čo na ňom ešte nesedí — vypíše sa pod riadkom. */
  note?: string;
};

type Group = { label: string; steps: Step[] };

const GROUPS: Group[] = [
  {
    label: 'Nový vstup',
    steps: [
      {
        name: '1 · Popup fotky + výrez',
        path: '/lab/scena',
        popup: 'photo',
        state: 'done',
        note: 'fotku ťahaj myšou, posuvník pod ňou približuje. Kto sa jej nedotkne, dostane automatický výrez (g_auto). Nad ozajstnou stenou je riadok nižšie.',
      },
      {
        name: '1b · To isté nad stenou',
        path: '/',
        popup: 'photo',
        state: 'done',
        note: 'ozajstná stena, ťahá psov z produkcie (pomalšie)',
      },
      {
        name: '2 · Meno psa',
        path: '/heroglyph/name',
        state: 'wip',
        note: 'blok ZÁKLAD stojí (meno · narodenie · krajina · „žije?"). Otvorené: zamknuté CONTINUE nepovie prečo — dátum je predvyplnený, ale kým sa ho človek nedotkne, tlačidlo je mŕtve.',
      },
      {
        name: '3 · Ďalší psi',
        path: '/heroglyph/dogs',
        state: 'wip',
        note: 'prvý pes má svietiť na zeleno (údaje má z kroku s menom) — zatiaľ nesvieti',
      },
      { name: '4 · E-mail', path: '/heroglyph/email', state: 'done' },
      { name: '5 · Prečo heroglyf', path: '/heroglyph/why', state: 'done' },
    ],
  },
  {
    label: 'Zvyšok flow — zatiaľ staré',
    steps: [
      { name: 'Plemeno / patrón', path: '/heroglyph/breed', state: 'old' },
      { name: 'Poradie', path: '/heroglyph/ranking', state: 'old' },
      { name: 'Majiteľ', path: '/heroglyph/owner-info', state: 'old' },
      { name: 'Horoskopy', path: '/heroglyph/owner-zodiac', state: 'old' },
      { name: 'Medzikrok', path: '/heroglyph/owner-final', state: 'old' },
      { name: 'Pohlavie', path: '/heroglyph/dog-gender', state: 'old' },
      { name: 'Osud', path: '/heroglyph/dog-fate', state: 'old' },
      { name: 'Farba', path: '/heroglyph/dog-colour', state: 'old' },
      { name: 'Pôvod', path: '/heroglyph/dog-bloodline', state: 'old' },
      { name: 'Povaha', path: '/heroglyph/dog-character', state: 'old' },
      {
        name: 'Výrez (stará obrazovka)',
        path: '/heroglyph/crop',
        state: 'old',
        note: 'zaniká — výrez je od 23. 9. v popupe fotky, teda v kroku 1',
      },
      { name: 'Odhalenie', path: '/heroglyph/reveal', state: 'old' },
      { name: 'Odkaz', path: '/heroglyph/message', state: 'old' },
      { name: 'Checkout', path: '/checkout', state: 'old' },
      { name: 'Platba', path: '/payment', state: 'old' },
      { name: 'Welcome', path: '/welcome', state: 'old' },
    ],
  },
  {
    label: 'Na porovnanie',
    steps: [
      {
        name: 'Stará obrazovka fotky',
        path: '/heroglyph/photo',
        state: 'old',
        note: 'v ceste zo steny sa nepoužije — je len pre príchod cez /entry',
      },
      { name: 'Conviction gate /entry', path: '/entry', state: 'old' },
    ],
  },
];

/** Šírky rámu. 500 je Matejovo okno (merané), 390 iPhone, 1280 stolný počítač. */
const WIDTHS = [
  { id: 'phone', label: 'Telefón', w: 390, h: 844 },
  { id: 'small', label: 'Úzke okno', w: 500, h: 880 },
  { id: 'desk', label: 'Počítač', w: 1280, h: 860 },
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

  const size = WIDTHS.find((w) => w.id === width) ?? WIDTHS[1];

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

        {/* ── TESTOVACIE DÁTA ──────────────────────────────────────────── */}
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

        <div className="hfl-sep" />

        {/* ── ZOZNAM POVRCHOV ──────────────────────────────────────────── */}
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
                <span className="txt">
                  {step.name}
                  {step.note && <i>{step.note}</i>}
                </span>
              </button>
            ))}
          </div>
        ))}

        <div className="hfl-sep" />
        <button type="button" className="hfl-ghost" onClick={() => { clearDevSeed(); setActive(null); }}>
          Vyčistiť testovacie dáta
        </button>
        <div className="hfl-legend">
          <span><i className="d done" /> hotové</span>
          <span><i className="d wip" /> rozostavané</span>
          <span><i className="d old" /> staré</span>
        </div>
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
