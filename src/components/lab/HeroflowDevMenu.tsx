import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDogyptStore } from '@/store/dogyptStore';
import { openPhotoConfirm } from '@/components/gods/photoConfirm';
import hekthorImg from '@/assets/hekthor.png';
import { useFlowSkin, setFlowSkin } from '@/components/screens/flowRedress';

// ════════════════════════════════════════════════════════════════════════════
// DEV MENU NA PREKLIKANIE NOVÉHO HEROFLOW (28. 8. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej: *„vytvor mi na /onepage — dev menu na preklikanie heroflowu nového
// (to čo je tam teraz zmaž a ukladaj mi tam dokončené obrazovky)"* a hneď nato
// *„ved otvára starý flow — po kliku má byť vidno popup s fotkou -meno psa
// multi pes email…. a pri flow zostáva ten dev menu aby som vedel prepínať vždy"*.
//
// 🔴 PRVÝ KROK NIE JE `/heroglyph/photo`. To je STARÁ samostatná obrazovka na
//    nahranie fotky. Nový vstup začína NA STENE: dlaždica ADD PHOTO otvorí
//    systémový výber, a po načítaní fotky vyskočí NAŠA karta (`photoConfirm.ts`),
//    ktorej CTA ide rovno na `/heroglyph/name` (`GodsGridLab.tsx`, `showConfirm`).
//    Preto prvý riadok menu tú kartu OTVORÍ, nenaviguje na starú obrazovku.
//    Fotka je v ňom Hektorova — je to dev náhľad, nie výber súboru.
//
// ⚠️ Toto NIE JE `DevNav`. Ten je zoznam všetkých ciest webu (vpravo dole) a na
//    `/onepage` je od 27. 8. skrytý. Tento je úzky na vstup do heroglyfu a beží
//    a j POČAS flow, aby sa dalo prepínať bez návratu na `/onepage`.
//
// 🔑 SEED. `useFlowGuard` stojí na `dogName`, takže bez neho každý skok doprostred
//    flow skončí na fotke a menu vyzerá pokazené. Pred skokom sa meno (a mail)
//    doplní, ak v store nie je. Vlastné zadané sa NEPREPISUJE.
//
// Odchod: klik mimo alebo Esc — bez krížika, ako všetky bloky (lock 28. 8.).
// ════════════════════════════════════════════════════════════════════════════

type Row =
  | { kind: 'popup'; name: string; done?: boolean }
  | { kind: 'route'; path: string; name: string; done?: boolean }
  | { kind: 'todo'; name: string; note: string };

type Group = { label: string; rows: Row[] };

// Nový vstup tak, ako ho Matej vymenoval: popup s fotkou → meno → multi pes → e-mail.
// `done` = obrazovka je už v BLEDOM ŠATE z LABu, nie „existuje".
const GROUPS: Group[] = [
  {
    label: 'Nový vstup',
    rows: [
      { kind: 'popup', name: '1 · Fotka (popup na stene)', done: true },
      { kind: 'route', path: '/heroglyph/name', name: '2 · Meno psa', done: true },
      { kind: 'route', path: '/heroglyph/dogs', name: '3 · Multi pes', done: true },
      { kind: 'route', path: '/heroglyph/email', name: '4 · E-mail', done: true },
      { kind: 'route', path: '/heroglyph/why', name: '5 · Prečo heroglyf', done: true },
    ],
  },
  {
    label: 'Zvyšok flow — zatiaľ staré',
    rows: [
      { kind: 'route', path: '/heroglyph/about', name: 'Papierovačky' },
      { kind: 'route', path: '/heroglyph/breed', name: 'Plemeno / patrón' },
      { kind: 'route', path: '/heroglyph/ranking', name: 'Poradie' },
      { kind: 'route', path: '/heroglyph/owner-info', name: 'Majiteľ' },
      { kind: 'route', path: '/heroglyph/owner-zodiac', name: 'Horoskopy' },
      { kind: 'route', path: '/heroglyph/owner-final', name: 'Medzikrok' },
      { kind: 'route', path: '/heroglyph/dog-gender', name: 'Pohlavie' },
      { kind: 'route', path: '/heroglyph/dog-fate', name: 'Osud' },
      { kind: 'route', path: '/heroglyph/dog-colour', name: 'Farba' },
      { kind: 'route', path: '/heroglyph/dog-bloodline', name: 'Pôvod' },
      { kind: 'route', path: '/heroglyph/dog-character', name: 'Povaha' },
      { kind: 'route', path: '/heroglyph/crop', name: 'Výrez' },
      { kind: 'route', path: '/heroglyph/reveal', name: 'Odhalenie' },
      { kind: 'route', path: '/heroglyph/message', name: 'Odkaz' },
      { kind: 'route', path: '/checkout', name: 'Checkout' },
      { kind: 'route', path: '/payment', name: 'Platba' },
      { kind: 'route', path: '/welcome', name: 'Welcome' },
    ],
  },
];

const ENTRY = GROUPS[0].rows;
const DONE_COUNT = ENTRY.filter((r) => r.kind !== 'todo' && r.done).length;

/** Kde menu beží: film + celý vstup + doplatková časť. */
function showsOn(pathname: string): boolean {
  return (
    pathname.startsWith('/onepage') ||
    pathname.startsWith('/heroglyph') ||
    pathname === '/checkout' ||
    pathname === '/payment' ||
    pathname === '/welcome'
  );
}

function isDevHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    import.meta.env.DEV ||
    host.endsWith('lovable.app') ||
    host === 'localhost' ||
    host === '127.0.0.1'
  );
}

export function HeroflowDevMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dogName = useDogyptStore((s) => s.dogName);
  const setDogName = useDogyptStore((s) => s.setDogName);
  const email = useDogyptStore((s) => s.email);
  const setEmail = useDogyptStore((s) => s.setEmail);
  const panelRef = useRef<HTMLDivElement>(null);
  const skin = useFlowSkin();

  // Odchod klikom mimo a Esc. Oboje visí na okne len keď je panel otvorený —
  // zavretý dev nástroj nemá počúvať klávesnicu filmu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    // `capture`, aby klik do filmu (guľa si drží vlastné handlery) panel zavrel skôr,
    // než ho stránka zhltne.
    window.addEventListener('mousedown', onDown, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown, true);
    };
  }, [open]);

  if (!isDevHost() || !showsOn(pathname)) return null;

  const seed = () => {
    if (!dogName) setDogName('HEKTHOR');
    if (!email) setEmail('matej@dogypt.com');
  };

  const goRoute = (path: string) => {
    if (path.startsWith('/heroglyph/')) seed();
    setOpen(false);
    navigate(path);
  };

  // Tá istá karta, akú človek dostane na stene po načítaní fotky — vrátane CTA
  // na `/heroglyph/name`. Fotka je dev náhľad, výber súboru sa tu neotvára.
  const goPopup = () => {
    setOpen(false);
    openPhotoConfirm({
      photoUrl: hekthorImg,
      packNumber: 72,
      onContinue: () => { seed(); navigate('/heroglyph/name'); },
      onPickAnother: () => {},
    });
  };

  return (
    <div ref={panelRef} style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 9999 }}>
      <style>{`
        .hfd-pill {
          display: flex; align-items: center; gap: 6px;
          border: none; border-radius: 8px;
          background: rgba(0,0,0,.72); color: #EFD79A;
          font-family: 'Space Grotesk', sans-serif; font-size: 11px;
          letter-spacing: .06em; text-transform: uppercase;
          padding: 7px 11px; cursor: pointer;
          backdrop-filter: blur(6px);
          box-shadow: 0 6px 18px rgba(0,0,0,.4);
        }
        .hfd-pill b { font-weight: 500; opacity: .6; }
        .hfd-panel {
          position: absolute; left: 0; bottom: 40px;
          width: 236px; max-height: 66vh; overflow-y: auto;
          border-radius: 10px; padding: 6px;
          background: rgba(12,10,7,.94); backdrop-filter: blur(10px);
          box-shadow: 0 18px 44px rgba(0,0,0,.55);
        }
        .hfd-row {
          display: flex; align-items: center; gap: 8px; width: 100%;
          background: none; border: none; border-radius: 7px;
          padding: 7px 9px; cursor: pointer; text-align: left;
          font-family: 'Space Grotesk', sans-serif; font-size: 12px;
          color: rgba(250,244,236,.62);
        }
        .hfd-row:hover { background: rgba(255,255,255,.07); color: #FAF4EC; }
        .hfd-row.is-done { color: #FAF4EC; }
        .hfd-row.is-here { background: rgba(201,154,63,.16); color: #FAF4EC; }
        /* Nepostavený krok sa NESMIE dať kliknúť — inak vyzerá menu pokazené. */
        .hfd-row.is-todo { cursor: default; color: rgba(250,244,236,.34); }
        .hfd-row.is-todo:hover { background: none; color: rgba(250,244,236,.34); }
        .hfd-row .tag {
          margin-left: auto; font-size: 9px; letter-spacing: .1em;
          text-transform: uppercase; color: rgba(201,154,63,.65);
        }
        /* Bodka nesie STAV: plná zlatá = prerobené do nového šatu, prázdna = ešte staré. */
        .hfd-dot {
          width: 7px; height: 7px; border-radius: 50%; flex: none;
          border: 1px solid rgba(201,154,63,.55); background: transparent;
        }
        .hfd-row.is-done .hfd-dot { background: #C99A3F; border-color: #C99A3F; }
        .hfd-row.is-todo .hfd-dot { border-style: dashed; border-color: rgba(250,244,236,.28); }
        .hfd-head {
          padding: 8px 9px 6px; font-family: 'Space Grotesk', sans-serif;
          font-size: 10px; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(201,154,63,.75);
        }
        .hfd-sep { height: 1px; margin: 5px 9px; background: rgba(201,154,63,.22); }
      `}</style>

      {open && (
        <div className="hfd-panel">
          {/* Prezlečenie starých obrazoviek (31. 8. 2026). Stojí navrchu, lebo ako
              jediné mení CELÝ vstup naraz — ostatné riadky menia len, kde stojíš.
              Text hovorí, čo je ZAPNUTÉ; klik prepne na druhý. */}
          <div className="hfd-head">Šat vstupu</div>
          <button
            type="button"
            className={`hfd-row${skin === 'pale' ? ' is-done' : ''}`}
            onClick={() => setFlowSkin(skin === 'pale' ? 'dark' : 'pale')}
          >
            <span className="hfd-dot" />
            <span>{skin === 'pale' ? 'NOVÝ — bledý' : 'STARÝ — tmavý'}</span>
            <span className="tag">{skin === 'pale' ? 'na starý' : 'na nový'}</span>
          </button>
          <div className="hfd-sep" />

          {GROUPS.map((g, gi) => (
            <div key={g.label}>
              {gi > 0 && <div className="hfd-sep" />}
              <div className="hfd-head">
                {g.label}
                {gi === 0 ? ` · ${DONE_COUNT}/${ENTRY.length} v novom šate` : ''}
              </div>
              {g.rows.map((r) => {
                if (r.kind === 'todo') {
                  return (
                    <div key={r.name} className="hfd-row is-todo">
                      <span className="hfd-dot" />
                      <span>{r.name}</span>
                      <span className="tag">{r.note}</span>
                    </div>
                  );
                }
                const here = r.kind === 'route' && pathname === r.path;
                return (
                  <button
                    key={r.name}
                    type="button"
                    className={`hfd-row${r.done ? ' is-done' : ''}${here ? ' is-here' : ''}`}
                    onClick={() => (r.kind === 'popup' ? goPopup() : goRoute(r.path))}
                  >
                    <span className="hfd-dot" />
                    <span>{r.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <button type="button" className="hfd-pill" onClick={() => setOpen((v) => !v)}>
        Heroflow <b>{DONE_COUNT}/{ENTRY.length}</b>
      </button>
    </div>
  );
}
