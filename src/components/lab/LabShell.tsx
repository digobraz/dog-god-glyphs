// ════════════════════════════════════════════════════════════════════════════
// LAB SHELL — JEDEN RÁM PRE CELÝ SVETLÝ WEB (DEV ONLY)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 8. 2026: *„považuj za homepage nie wall ale ten globe — to bude nové
// východisko = homepage · horný nav bude totožný pre každú stránku · klik na
// religion → obsah sa swajpne, horný nav zostáva · spodný nav len pre homepage."*
//
// Rám drží TRI veci a nič iné:
//   1. HORNÝ NAV — namontuje sa RAZ a pri prepínaní sekcií sa neodmountuje.
//      Preto sú v ňom <button>, nie <a href>: `href` = tvrdé načítanie celého
//      webu, pri ktorom sa nav vždy prekreslí (to je presne to, čo zadanie ruší).
//   2. PLOCHU OBSAHU — sekcie ležia vedľa seba a posúvajú sa vodorovne.
//   3. SPODNÚ LIŠTU len na homepage — tú si nesie `GodsGridLab` sám, takže stačí,
//      že wall je namontovaný iba v paneli homepage. Vytrhávať bar z wallu by
//      znamenalo rozobrať kalkulačku aj prepínač stena/planéta.
//
// ⚠️ PANEL JE `position: fixed` A MÁ VLASTNÝ `transform`. To nie je ozdoba:
//    transform robí z panela containing block, takže `position: fixed` DETI
//    (`.gods-root { inset: 0 }`, planéta, spodná lišta) sa kotvia na PANEL,
//    nie na okno — inak by sa wall roztiahol cez všetky sekcie naraz.
// ⚠️ CSS horného navu (`.nav-top`, `.main-nav*`, `.nav-login*`) žije UŽ LEN TU.
//    Z `GodsGridLab` bolo vystrihnuté, aby neexistovali dve kópie toho istého
//    baru — zlatý odliatok si aj tak obe strany ťahajú z `navGoldSkin.ts`.
// ⚠️ Papyrusové odtiene ber z `@/lib/labTheme`, nepíš sem vlastné.
// ⚠️ Celý súbor je DEV-only pieskovisko. Ostré `/`, `/religion`, `/vision`,
//    `/about` sa nesmú pohnúť.
// ════════════════════════════════════════════════════════════════════════════
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useT } from '@/i18n/LanguageContext';
import LanguagePicker from '@/components/LanguagePicker';
import { HandHouseHeart } from '@/components/pack/HandIcons';
import { LAB } from '@/lib/labTheme';
import { GodsGridLab } from '@/components/gods/GodsGridLab';
import ReligionLab from '@/pages/ReligionLab';
import VisionLab from '@/pages/VisionLab';
import AboutLab from '@/pages/AboutLab';
import {
  NAV_R,
  NAV_GOLD,
  NAV_FRAME_BG,
  NAV_FRAME_BLEND,
  NAV_FRAME_SHADOW,
  NAV_PLATE_BG,
  NAV_PLATE_BLEND,
  NAV_PLATE_SHADOW,
  NAV_PILL_SHADOW,
  NAV_GRAIN_SCREEN_CSS,
} from '@/components/pack/navGoldSkin';

// ── Poradie sekcií je NA JEDNOM MIESTE ──────────────────────────────────────
// Zadanie §4.3: poradie drží rám, nie každá stránka zvlášť. Index v tomto poli
// JE pozícia panela na vodorovnej osi.
type SectionId = 'home' | 'vision' | 'religion' | 'about';

const SECTIONS: { id: SectionId; path: string; navKey: string }[] = [
  // HOME je PRVÁ položka navu (Matej 25. 8.: „pridajme položku HOME ako prvú").
  // Guľa tým prestala byť dostupná len cez logo/späť — v rade sekcií má svoje meno.
  { id: 'home', path: '/wall-lab', navKey: 'nav.home' },
  { id: 'vision', path: '/vision-lab', navKey: 'nav.vision' },
  { id: 'religion', path: '/religion-lab', navKey: 'nav.religion' },
  { id: 'about', path: '/about-lab', navKey: 'nav.about' },
];

// ── Ovládanie na mobile — Matej to má vybrať NA ŽIVOM (zadanie §5.1) ─────────
// Tri možnosti zo zadania ako prepínač, nie ako rozhodnutie od stola:
//   edge  — vodorovný swipe chytá len pri okraji obrazovky (uprostred kreslí prst)
//   free  — voľný swipe v obsahu; v náboženstve sa pritom VYPÍNA zvislý snap,
//           inak si oba pohyby lezú do cesty
//   click — bez swipu, sekcie sa prepínajú len klikom v nave
// Nad guľou platí VŽDY pravidlo okraja: uprostred sa guľa otáča prstom, takže
// voľný swipe by ju umŕtvil.
type SwipeMode = 'edge' | 'free' | 'click';
const MODE_KEY = 'lab-swipe-mode';
const EDGE_PX = 34;       // šírka citlivého pásu pri okraji
const START_SLOP = 10;    // kým prst neprejde toľko, gesto ešte nemá smer
const COMMIT_RATIO = 0.22; // koľko šírky treba pretiahnuť, aby sekcia preskočila
const COMMIT_MAX = 110;

export default function LabShell() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const idx = Math.max(
    0,
    SECTIONS.findIndex((s) => s.path === location.pathname)
  );

  const [mode, setMode] = useState<SwipeMode>(() => {
    try {
      const v = localStorage.getItem(MODE_KEY);
      if (v === 'edge' || v === 'free' || v === 'click') return v;
    } catch { /* private mode */ }
    return 'edge';
  });
  const setModeSticky = (m: SwipeMode) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* private mode */ }
  };

  // Ťah prsta: `drag` je posun v px, `dragging` vypína prechod (inak by animácia
  // dobiehala za prstom). Držané v state, lebo transform ide cez React.
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ id: number; x: number; y: number; live: boolean; armed: boolean } | null>(null);

  const goTo = useCallback(
    (i: number) => {
      const next = Math.min(SECTIONS.length - 1, Math.max(0, i));
      if (next === idx) return;
      navigate(SECTIONS[next].path);
    },
    [idx, navigate]
  );

  // Šípky na klávesnici — na PC sa tým dá prejsť celý rad bez myši.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && el.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') goTo(idx + 1);
      if (e.key === 'ArrowLeft') goTo(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, idx]);

  // ── Gesto ────────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (mode === 'click') return;
    // Myš swipuje len v režime OKRAJ — ťah myšou uprostred patrí guli a stene.
    if (e.pointerType === 'mouse' && mode !== 'edge') return;
    const el = e.target as HTMLElement;
    // Ovládacie prvky si držia vlastné gestá (kalkulačka, lišty, jazyk, prepínač).
    if (el.closest('.main-nav, .nav-login, .gods-bottom-bar, .numpad-overlay, .lang-modal-root, .lsh-modeswitch')) return;

    // Nad guľou/stenou vždy pravidlo okraja — uprostred kreslí prst.
    const onCanvas = idx === 0 || !!el.closest('.gods-root, .planet-ball');
    const edgeOnly = mode === 'edge' || onCanvas;
    if (edgeOnly && e.clientX > EDGE_PX && e.clientX < window.innerWidth - EDGE_PX) return;

    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, live: false, armed: true };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId || !g.armed) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.live) {
      if (Math.abs(dx) < START_SLOP && Math.abs(dy) < START_SLOP) return;
      // Zvislý úmysel gesto zruší — inak by swipe kradol listovanie v texte.
      if (Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
      g.live = true;
      setDragging(true);
    }
    // Na krajoch radu ťah gumuje, aby bolo cítiť, že za tým už nič nie je.
    const atEdge = (dx > 0 && idx === 0) || (dx < 0 && idx === SECTIONS.length - 1);
    setDrag(atEdge ? dx * 0.28 : dx);
  };

  const endGesture = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || !g.live) { setDrag(0); setDragging(false); return; }
    const dx = e.clientX - g.x;
    const need = Math.min(COMMIT_MAX, window.innerWidth * COMMIT_RATIO);
    setDrag(0);
    setDragging(false);
    if (dx <= -need) goTo(idx + 1);
    else if (dx >= need) goTo(idx - 1);
  };

  return (
    <div
      className={`lsh-root${dragging ? ' is-dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      <style>{`
        /* ── PLOCHA ────────────────────────────────────────────────────────
           Papyrus kreslí rám, nie stránka — medzi panelmi tak pri swipe nikdy
           neprebliskne čierna. */
        .lsh-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background-color: ${LAB.pageBg};
          --lsh-nav-h: 68px;
        }
        .lsh-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${LAB.pageBackdrop};
          pointer-events: none;
        }

        /* ── PANEL SEKCIE ──────────────────────────────────────────────────
           fixed + vlastný transform = containing block pre fixed deti (wall,
           planéta, spodná lišta). Bez toho by .gods-root { inset: 0 } sadol
           na okno a bol by vidieť aj v náboženstve. */
        .lsh-pane {
          position: fixed;
          inset: 0;
          will-change: transform;
          transition: transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
          overflow: hidden;
          z-index: 1;
        }
        .lsh-root.is-dragging .lsh-pane { transition: none; }
        .lsh-pane.is-active { z-index: 2; }
        /* Neaktívny panel nesmie brať kliky ani fokus — leží mimo obrazovky,
           ale je stále v DOM. */
        .lsh-pane:not(.is-active) { pointer-events: none; }

        /* ── HORNÝ NAV — jediná kópia v projekte ───────────────────────────
           Skladba zlatého odliatku: RÁM (leštené zlato) → DOSKA (pieskovec,
           zapustená) → ZRNO → OBSAH. Tokeny z navGoldSkin.ts, neopisuj ich. */
        /* Lišta stojí v STREDE hornej hrany (Matej 25. 8.: „presuňme horný nav do
           stredu obrazovky"). Trieda sa volala .nav-left, kým sedela v ľavom rohu —
           premenovaná, aby názov neklamal. Ľavý roh je odteraz voľný.
           translateX(-50%) je jediný spôsob, ako vycentrovať prvok neznámej šírky:
           left:50% posadí jeho ĽAVÚ hranu do stredu, posun ju vráti o polovicu. */
        .nav-top {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .main-nav {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          padding: ${NAV_R.rim + 5}px ${NAV_R.rim + 15}px;
          background: ${NAV_FRAME_BG};
          background-blend-mode: ${NAV_FRAME_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          border-radius: ${NAV_R.frame}px;
          box-shadow: ${NAV_FRAME_SHADOW};
        }
        /* DOSKA a ZRNO idú na z-index -1 (nie 0) — obsah pilulky býva holý
           textový uzol, ten sa nedá zdvihnúť, tak sa musí podliezť. */
        .main-nav::before {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          background: ${NAV_PLATE_BG};
          background-blend-mode: ${NAV_PLATE_BLEND};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PLATE_SHADOW};
          pointer-events: none;
          z-index: -1;
        }
        .main-nav::after {
          content: '';
          position: absolute;
          inset: ${NAV_R.rim}px;
          border-radius: ${NAV_R.plate}px;
          ${NAV_GRAIN_SCREEN_CSS}
          opacity: 0.28;
          pointer-events: none;
          z-index: -1;
        }
        .main-nav > * { position: relative; z-index: 1; }
        .main-nav-sep {
          display: inline-block;
          width: 1px;
          height: 12px;
          background: rgba(110,74,20,0.45);
          flex-shrink: 0;
        }
        .main-nav a, .main-nav button {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          color: ${NAV_GOLD.ink};
          text-decoration: none;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .main-nav a:hover, .main-nav button:hover { opacity: 0.55; }
        /* AKTÍVNA SEKCIA = CHIP, ten istý ako ikonky v spodnej lište
           (Matej 25. 8.: „dolu je to super v kružku s inou farbou tak to chcem aj
           hore, označená stránka bude v takom chipe ako je dolu ikonka").
           Predtým tu bola bodka/kosoštvorec — zanikla: stav sa značí VYSTÚPENOU
           PLÔŠKOU, nie prívesom pod textom, a hore aj dole tak platí jeden jazyk.
           ⚠️ Výplň má LEN aktívna položka, ale ROZMERY musia mať všetky — rám aj
           odsadenie sú preto na .main-nav button a neaktívnym sa len zprieh-
           ľadní rám. Inak by sa lišta pri každom prepnutí sekcie rozšírila. */
        .main-nav button {
          position: relative;
          padding: 5px 12px;
          border: ${NAV_R.line}px solid transparent;
          border-radius: 999px;
        }
        .main-nav button.is-on {
          opacity: 1;
          background: ${NAV_GOLD.activeFill};
          border-color: ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
        }
        .main-nav button.is-on:hover { opacity: 1; }
        .main-nav .lang-trigger { color: ${NAV_GOLD.ink}; }
        .main-nav .lang-trigger__chev { color: rgba(42,22,8,0.55); }

        /* PRIHLÁSENIE — domček, posledná vec pred vlajkou. Vystúpená pilulka
           (activeFill), aby sa medzi slovami čítal ako TLAČIDLO, nie ako ďalšia
           položka menu. Menší priemer než pilulky v spodnej lište: musí sa zmestiť
           do výšky dosky navu, nie ju rozťahovať. */
        /* Kruh je ZHODNÝ s ikonkami v spodnej lište — tie isté tokeny, ten istý
           priemer 40 px. Ikonka je INLINE SVG s currentColor, nie <img>:
           <img> sa ofarbiť nedá a filter: brightness(0) z nej robí ČISTÚ
           ČIERNU, kým dolné ikonky nesú teplý inkoust NAV_GOLD.ink. Presne v tom
           bol rozdiel, ktorý bolo vidieť. */
        /* ⚠️ SELEKTOR MUSÍ BYŤ DVOJTRIEDNY. Domček je <a> vnútri .main-nav, takže
           ho trafí aj pravidlo .main-nav a (0,1,1) vyššie — a to nastavuje
           background: none a border: none. Holá .nav-login (0,1,0) ho NEPREBIJE:
           z kruhu prejde len tieň, teda ostane 3D odtlačok bez výplne a bez rámu.
           Presne tak to aj vyzeralo. */
        .main-nav .nav-login {
          width: 40px; height: 40px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          background: ${NAV_GOLD.activeFill};
          border: ${NAV_R.line}px solid ${NAV_GOLD.edge};
          box-shadow: ${NAV_PILL_SHADOW};
          color: ${NAV_GOLD.ink};
        }
        .main-nav .nav-login:hover { opacity: 0.75; }

        @media (max-width: 768px) {
          .lsh-root { --lsh-nav-h: 58px; }
          .nav-top { top: 10px; }
          /* Vlajka je na mobile v SPODNEJ lište (kreslí ju wall), tu by bola druhá. */
          .nav-lang-desktop { display: none; }
          .main-nav { gap: 7px; padding: ${NAV_R.rim + 3}px ${NAV_R.rim + 7}px; }
          .main-nav a, .main-nav button { font-size: 0.64rem; letter-spacing: 0.04em; }
          .main-nav button { padding: 4px 8px; }
          .main-nav .nav-login { width: 32px; height: 32px; }
        }

        /* ── OBSAH SEKCIE ──────────────────────────────────────────────────
           Stránka dostane CELÚ výšku panela a nav sa nad ňou vznáša — rovnako
           ako nad guľou. Odsadenie o výšku navu tu BOLO a zlyhalo dvakrát:
           (a) nad obsahom vznikol pás inej farby (podklad stránky sa drží okna,
           odsadenie ho odstrihne) a (b) zvislý scroll-snap v náboženstve prišiel
           o ~60 px z každej obrazovky, čo je presne to, čoho sa bál zadanie §5.1.
           Kto sem odsadenie vráti, musí vyriešiť oboje. */
        .lsh-page {
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        /* Nav sa vznáša, takže si miesto musí spraviť OBSAH SEKCIE — nie panel.
           Odsadenie je vnútri stránky, takže podklad ostáva celistvý (pás inej
           farby nad obsahom) a scroll-snap si drží celú obrazovku (výška sekcie
           sa nemení, len sa v nej obsah posunie nižšie).
           Bez toho lezie nav do nadpisu: na 2. obrazovke prekryl V PSA
           z V PSA VERÍME — presne strata výšky, ktorej sa bálo zadanie §5.1. */
        .lsh-page .codex-section { padding-top: var(--lsh-nav-h); }
        /* Voľný swipe a zvislý snap v náboženstve si lezú do cesty — v režime
           FREE preto snap padá (jedna z možností zo zadania §5.1). */
        .lsh-nosnap .codex-scroll { scroll-snap-type: none; }

        /* ── SEKCIA, KTORÁ SA DLHO SCROLLUJE (vízia) ───────────────────────
           Náboženstvo si scroll rieši samo (vlastný snap kontajner vnútri
           stránky), vízia nie — je to jedna dlhá stránka. Panel jej preto musí
           dať vlastný scroll, inak sa spodok stránky nedá dosiahnuť vôbec.
           overscroll-behavior drží ťah prsta v paneli: bez neho sa na konci
           stránky rozhýbe okno pod rámom a nav sa odlepí.
           Miesto pre plávajúci nav si berie EXISTUJÚCA .topbar-wrap (v ráme
           je prázdna, lebo hlavičku dodáva rám) — je sticky a nesie papyrusový
           fade, takže nav má pod sebou plochu vlastnej farby. Odsadenie inde by
           odstrihlo podklad a nad obsahom by vznikol pás inej farby. */
        .lsh-scroll {
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          position: relative;
          -webkit-overflow-scrolling: touch;
        }
        .lsh-scroll .topbar-wrap { height: var(--lsh-nav-h); padding-bottom: 0; }

        /* ── DEV prepínač ovládania ────────────────────────────────────────
           Ostáva v labe, na živý web sa nikdy nedostane. Voľba prežije reload,
           inak by sa pri každom uložení súboru vrátila na začiatok. */
        .lsh-modeswitch {
          position: fixed;
          left: 12px;
          bottom: 12px;
          z-index: 70;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px;
          border-radius: 999px;
          background: ${NAV_GOLD.surface};
          border: 1px solid ${NAV_GOLD.edge};
          box-shadow: 0 4px 14px rgba(70,45,10,0.35);
        }
        .lsh-modeswitch button {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: rgba(42,22,8,0.55);
          background: none;
          border: none;
          border-radius: 999px;
          padding: 4px 9px;
          cursor: pointer;
        }
        .lsh-modeswitch button.is-on {
          color: ${NAV_GOLD.ink};
          background: ${NAV_GOLD.activeFill};
          box-shadow: ${NAV_PILL_SHADOW};
        }
        @media (max-width: 768px) {
          /* Spodná lišta homepage stojí v strede — prepínač sa nad ňu zdvihne,
             aby si na úzkom mobile nestáli palcom v ceste. */
          .lsh-modeswitch { bottom: 72px; left: 8px; }
          .lsh-modeswitch button { font-size: 0.54rem; padding: 4px 7px; }
          /* Karta rozhodnutia musí skončiť NAD prepínačom — inak jej prekryje
             posledný riadok (odkaz na ostrú stránku). */
          .lsh-decision { padding-bottom: 118px; }
        }
      `}</style>

      {/* ── HORNÝ NAV — namontovaný RAZ, prežije každé prepnutie sekcie ──
          Poradie je pevné: sekcie · domček (prihlásenie) · vlajka.
          Domček stál v rohu obrazovky samostatne; od 25. 8. je súčasťou pilulky
          (Matej: „pred vlajky dajme domček - prihlásenie"), takže hore už nie sú
          dva plávajúce prvky, ale jeden. */}
      <div className="nav-top">
        <nav className="main-nav" data-lab-nav="1">
          {SECTIONS.map((s, i) => (
            <Fragment key={s.id}>
              <button
                type="button"
                className={SECTIONS[idx].id === s.id ? 'is-on' : ''}
                onClick={() => goTo(i)}
              >
                {t(s.navKey)}
              </button>
              <span className="main-nav-sep" aria-hidden="true" />
            </Fragment>
          ))}
          <a href="/login" className="nav-login" aria-label={t('nav.login')}>
            <HandHouseHeart size={20} />
          </a>
          <span className="nav-lang-desktop"><LanguagePicker /></span>
        </nav>
      </div>

      {/* ── PANELY ────────────────────────────────────────────────────────── */}
      {SECTIONS.map((s, i) => (
        <div
          key={s.id}
          className={`lsh-pane${i === idx ? ' is-active' : ''}`}
          aria-hidden={i !== idx}
          style={{ transform: `translate3d(calc(${(i - idx) * 100}% + ${drag}px), 0, 0)` }}
        >
          {s.id === 'home' && <GodsGridLab embedded />}
          {s.id === 'religion' && (
            <div className={`lsh-page${mode === 'free' ? ' lsh-nosnap' : ''}`}>
              <ReligionLab embedded />
            </div>
          )}
          {s.id === 'vision' && (
            <div className="lsh-page lsh-scroll">
              <VisionLab embedded />
            </div>
          )}
          {s.id === 'about' && (
            <div className="lsh-page lsh-scroll">
              <AboutLab embedded />
            </div>
          )}
        </div>
      ))}

      {/* ── DEV prepínač ovládania (zadanie §5.1 — Matej vyberie na živom) ── */}
      <div className="lsh-modeswitch" role="group" aria-label="Ovládanie na mobile">
        <button type="button" className={mode === 'edge' ? 'is-on' : ''} onClick={() => setModeSticky('edge')}>Okraj</button>
        <button type="button" className={mode === 'free' ? 'is-on' : ''} onClick={() => setModeSticky('free')}>Voľný</button>
        <button type="button" className={mode === 'click' ? 'is-on' : ''} onClick={() => setModeSticky('click')}>Len klik</button>
      </div>

      {/* Spodnú lištu si homepage nesie sama (je vnútri `GodsGridLab`), takže na
          ostatných sekciách nemá ako vzniknúť — žiadna podmienka netreba. */}
    </div>
  );
}
