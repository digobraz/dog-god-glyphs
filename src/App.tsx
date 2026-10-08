import { lazy, Suspense, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { afterLoad } from "@/lib/afterLoad";
import { PHOTO_INVITE_NEEDED } from "@/lib/photoInvite";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DEV_FULL, BUDDY_LIVE, hasStoredSessionOrAuthReturn } from "@/lib/packFlags";
// Papyrusový podklad + zoznam prezlečených ciest — jeden zdroj, viď RouteFallback nižšie.
import { PAPER_BG, usePaperRoute } from "@/components/pack/packTheme";
import { LanguageProvider, useLang, ensurePackDict } from "@/i18n/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { captureRefFromSearch } from "@/lib/refCapture";
import { trackPageview, setAnalyticsLang } from "@/lib/analytics";
import { maskPath, trackPackRoute } from "@/lib/packAnalytics";
import { captureAttribution } from "@/lib/attribution";
import { NEW_HEROFLOW } from "@/lib/flowMode";

// Route-level code-split (P0 2026-07 perf pass). NotFound je od 7. 10. 2026 tiež lazy; od FLIPu
// 7. 10. 2026 je homepage film (OnePage) — aj /wall, tmavý GodsGrid zanikol; everything else behind /heroglyph, /pack, /admin, legacy /spiral, etc.
// loads on demand. Screens under components/screens/ + SpiralLanding are named
// exports — pages/* are default exports.
// AINUBIS chat widget — lazy, aby nezaťažil homepage bundle (perf je otvorená téma).
// Widget si sám rozhoduje o skrytí na render/heroglyph routách (viď AinubisWidget.tsx).
// 🔴 MIMO HLAVNÉHO BALÍKA (perf fáza 2, 7. 10. 2026, plán s Fable 5): notifikácie (sonner +
// radix toast), cookie lišta a 404 nie sú prvý obraz žiadnej stránky. Ako samostatné kúsky sa
// stiahnu popri stránke a nebrzdia jej vykreslenie. Montujú sa hneď (nie po `load`), takže
// toast ani lišta nečakajú — len neblokujú.
const Sonner = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const ConsentBanner = lazy(() => import("@/components/ConsentBanner").then((m) => ({ default: m.ConsentBanner })));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
// DevNav (celé Radix menu) sa na dogypt.com nikdy neukáže — kúsok sa stiahne len tam, kde sa
// ukázať smie (dev, localhost, *.lovable.app). Rovnaká podmienka ako vnútri DevNav.tsx.
const NOAUTH_DEV = import.meta.env.DEV && import.meta.env.VITE_PACK_NOAUTH === "1";
const DevNav = lazy(() => import("@/components/DevNav").then((m) => ({ default: m.DevNav })));
const SHOW_DEVNAV = import.meta.env.DEV || (typeof window !== "undefined" && /(^localhost$|^127\.0\.0\.1$|lovable\.app$)/.test(window.location.hostname));
// React Query (QueryClientProvider) a TooltipProvider (Radix + floating-ui) zanikli 7. 10. 2026 —
// v appke ich nevolal nikto (0× useQuery, Tooltip len v nepoužitom ui/sidebar.tsx).
const AinubisWidget = lazy(() =>
  import("@/components/ainubis/AinubisWidget").then((m) => ({ default: m.AinubisWidget }))
);
const IntroScreen = lazy(() =>
  import("@/components/screens/IntroScreen").then((m) => ({ default: m.IntroScreen }))
);
const NameScreen = lazy(() =>
  import("@/components/screens/NameScreen").then((m) => ({ default: m.NameScreen }))
);
const PhotoScreen = lazy(() =>
  import("@/components/screens/PhotoScreen").then((m) => ({ default: m.PhotoScreen }))
);
const BreedPatronScreen = lazy(() =>
  import("@/components/screens/BreedPatronScreen").then((m) => ({ default: m.BreedPatronScreen }))
);
const RankingScreen = lazy(() =>
  import("@/components/screens/RankingScreen").then((m) => ({ default: m.RankingScreen }))
);
const OwnerInfoScreen = lazy(() =>
  import("@/components/screens/OwnerInfoScreen").then((m) => ({ default: m.OwnerInfoScreen }))
);
const OwnerZodiacScreen = lazy(() =>
  import("@/components/screens/OwnerZodiacScreen").then((m) => ({ default: m.OwnerZodiacScreen }))
);
const OwnerFinalScreen = lazy(() =>
  import("@/components/screens/OwnerFinalScreen").then((m) => ({ default: m.OwnerFinalScreen }))
);
const DogGenderScreen = lazy(() =>
  import("@/components/screens/DogGenderScreen").then((m) => ({ default: m.DogGenderScreen }))
);
const DogFateScreen = lazy(() =>
  import("@/components/screens/DogFateScreen").then((m) => ({ default: m.DogFateScreen }))
);
const DogColourScreen = lazy(() =>
  import("@/components/screens/DogColourScreen").then((m) => ({ default: m.DogColourScreen }))
);
const DogBloodlineScreen = lazy(() =>
  import("@/components/screens/DogBloodlineScreen").then((m) => ({ default: m.DogBloodlineScreen }))
);
const DogCharacterScreen = lazy(() =>
  import("@/components/screens/DogCharacterScreen").then((m) => ({ default: m.DogCharacterScreen }))
);
const HeroglyphRevealScreen = lazy(() =>
  import("@/components/screens/HeroglyphRevealScreen").then((m) => ({ default: m.HeroglyphRevealScreen }))
);
const MessageScreen = lazy(() =>
  import("@/components/screens/MessageScreen").then((m) => ({ default: m.MessageScreen }))
);
const FlowWelcomeScreen = lazy(() =>
  import("@/components/screens/FlowWelcomeScreen").then((m) => ({ default: m.FlowWelcomeScreen }))
);
const FlowRevealScreen = lazy(() =>
  import("@/components/screens/FlowRevealScreen").then((m) => ({ default: m.FlowRevealScreen }))
);
const FlowCheckoutScreen = lazy(() =>
  import("@/components/screens/FlowCheckoutScreen").then((m) => ({ default: m.FlowCheckoutScreen }))
);
const FlowStayScreen = lazy(() =>
  import("@/components/screens/FlowStayScreen").then((m) => ({ default: m.FlowStayScreen }))
);
// ── NOVÝ VSTUP (28.–31. 8. 2026) — zavesený LEN v DEV, viď `NEW_HEROFLOW` nižšie ──
const DogsScreen = lazy(() =>
  import("@/components/screens/DogsScreen").then((m) => ({ default: m.DogsScreen }))
);
const EmailScreen = lazy(() =>
  import("@/components/screens/EmailScreen").then((m) => ({ default: m.EmailScreen }))
);
const EssenceScreen = lazy(() =>
  import("@/components/screens/EssenceScreen").then((m) => ({ default: m.EssenceScreen }))
);
// PATRÓN (24. 9. 2026) — plemeno + kríženec + patrón na jednej obrazovke.
// Nahrádza dva PODKROKY `BreedPatronScreen` a beží len v DEV (viď routu nižšie).
const PatronScreen = lazy(() =>
  import("@/components/screens/PatronScreen").then((m) => ({ default: m.PatronScreen }))
);
// POVAHA (25. 9. 2026) — Hektorova otázka hore, výber dvoch vlastností v doske.
// Prezlečená `DogCharacterScreen` (tá beží ďalej na LIVE), len v DEV — viď routu nižšie.
const CharacterScreen = lazy(() =>
  import("@/components/screens/CharacterScreen").then((m) => ({ default: m.CharacterScreen }))
);
// MAJITEĽ (25. 9. 2026) — poradie, meno, pohlavie a obidva horoskopy na jednej
// obrazovke. Zliala `OwnerInfoScreen` + `OwnerZodiacScreen` + `OwnerFinalScreen`
// (tie bežia ďalej na LIVE), len v DEV — viď routu nižšie.
const OwnerScreen = lazy(() =>
  import("@/components/screens/OwnerScreen").then((m) => ({ default: m.OwnerScreen }))
);
const CropScreen = lazy(() =>
  import("@/components/screens/CropScreen").then((m) => ({ default: m.CropScreen }))
);
const FlowRedress = lazy(() =>
  import("@/components/screens/flowRedress").then((m) => ({ default: m.FlowRedress }))
);
// HRANICA (25. 9. 2026) — merač výplne obrazovky. Hlási dielni, koľko z miesta
// medzi hranicami obsah zaberá, a na požiadanie tú hranicu aj nakreslí.
const FlowFillProbe = lazy(() =>
  import("@/components/screens/flowFill").then((m) => ({ default: m.FlowFillProbe }))
);
// ── DIELŇA VSTUPU (23. 9. 2026) — `/lab/heroflow`. Zoznam povrchov, testovacie
//    dáta a rám s obrazovkou na jednej obrazovke. DEV-only, ako celý nový vstup.
//    ⚠️ Nie je to `/pack` ani jeho chrbtica — lock architektúry sa jej netýka.
const HeroflowLab = lazy(() => import("@/pages/HeroflowLab"));
const LabScene = lazy(() =>
  import("@/pages/HeroflowLab").then((m) => ({ default: m.LabScene }))
);
// Vloží testovacie dáta do store v KAŽDOM dokumente appky — teda aj v ráme,
// ktorý dielňa otvorí. Bez neho by guard rám odhodil na prvý krok.
const DevSeedBoot = lazy(() =>
  import("@/components/lab/DevSeedBoot").then((m) => ({ default: m.DevSeedBoot }))
);
const CheckoutScreen = lazy(() =>
  import("@/components/screens/CheckoutScreen").then((m) => ({ default: m.CheckoutScreen }))
);
const PaymentScreen = lazy(() =>
  import("@/components/screens/PaymentScreen").then((m) => ({ default: m.PaymentScreen }))
);
const WelcomeScreen = lazy(() =>
  import("@/components/screens/WelcomeScreen").then((m) => ({ default: m.WelcomeScreen }))
);
/** Obrazovka appky čaká aj na TEXTY appky (preklady `pack.*` sú vlastný kus, perf 7. 10. 2026 —
 *  bez toho by na prvý snímok prebleskli holé kľúče). Sťahujú sa súbežne s kódom obrazovky. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyPack = <T extends ComponentType<any>>(f: () => Promise<{ default: T }>) =>
  lazy<T>(() => Promise.all([f(), ensurePackDict()]).then(([m]) => m));
// Brána mapy číta session zo Supabase — lazy, aby klient nesedel v hlavnom balíku (perf 7. 10. 2026).
const MapGate = lazyPack(() => import("@/components/pack/MapGate").then((m) => ({ default: m.MapGate })));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Pack = lazyPack(() => import("./pages/Pack.tsx"));
const PackDogDetail = lazyPack(() => import("./pages/PackDogDetail.tsx"));
const PackProfile = lazyPack(() => import("./pages/PackProfile.tsx"));
const PublicProfile = lazyPack(() => import("./pages/PublicProfile.tsx")); // read-profil /pack/u/:id (zadanie-profil-read-dog-2026-07-25)
const PackJoin = lazyPack(() => import("./pages/PackJoin.tsx")); // /pack/join/:token — prijatie pozvánky pawmata
const PackMap = lazyPack(() => import("./pages/PackMap.tsx"));
const PackTripArticle = lazyPack(() => import("./pages/PackTripArticle.tsx")); // iterácia 12 bod 5 — ⤢ expand full-page article
const PackTriplist = lazyPack(() => import("./pages/PackTriplist.tsx")); // TRIPLIST hub — Slice A (plany/zadanie-triplist-sliceA-2026-07-23.md)
const PackDogs = lazyPack(() => import("./pages/PackDogs.tsx"));
const PackBuddy = lazyPack(() => import("./pages/PackBuddy.tsx")); // SNIFFER (interne BUDDY) — `/pack/sniffer`, krok 3 (zadanie-assnif §10)
const PackAinubis = lazyPack(() => import("./pages/PackAinubis.tsx")); // kostra AINUBISA — `/pack/ainubis` (rozhodnutia 4A+5A, 21. 9. 2026)
const PackDogQuiz = lazyPack(() => import("./pages/PackDogQuiz.tsx")); // fullscreen kvíz (zadanie-mypack-petpas-2026-08-06 §6)
const PackChronicle = lazyPack(() => import("./pages/PackChronicle.tsx")); // KRONIKA = denník + galéria (8. 10. 2026)
const PackDogIdModules = lazyPack(() => import("./pages/PackDogIdModules.tsx")); // DOG ID = moduly (8. 10. 2026)
const PackNatureQuiz = lazyPack(() => import("./pages/PackNatureQuiz.tsx")); // osobnostný kvíz element+úloha (zadanie-osobnostny-kviz-2026-08-06)
const Login = lazyPack(() => import("./pages/Login.tsx"));
const Admin = lazyPack(() => import("./pages/Admin.tsx"));
// DEV-only dielňa hero radu — pyramída svorky pri 1–20 psoch (route nižšie za import.meta.env.DEV)
const HeroLab = lazy(() => import("./pages/HeroLab.tsx"));
// DEV-only pieskovisko homepage — WALL/GLOBE. `/` sa NEMENÍ (CLAUDE.md lock).
// Namontuje ho `LabShell` ako panel homepage, priamu routu už nemá.

// LAB stránky svetlého režimu (DEV ONLY) — pozri src/lib/labTheme.ts
// LAB SHELL — jeden rám pre celý svetlý web: horný nav sa montuje RAZ, obsah sa
// pod ním posúva vodorovne. Všetky štyri *-lab cesty mieria na TEN ISTÝ element,
// takže React rám nechá stáť a prepne sa len panel (žiadne načítanie stránky).
const LabShell = lazy(() => import("./components/lab/LabShell"));
// ONEPAGE — druhý koncept toho istého webu: celý film v jednom zvislom scrolle
// (Matej 26. 8. 2026). Beží VEDĽA LabShellu, nie namiesto neho.
const OnePage = lazy(() => import("./components/lab/OnePage"));
const Entry = lazy(() => import("./pages/Entry.tsx"));
// Výzva „TVÁR TVOJHO PSA" — jeden vstup do nového heroflowu (WE NEED YOU, zrušený výber fotky na portáli).
const PhotoInvite = lazy(() => import("./components/gods/PhotoInvite.tsx"));
// Heroglyph sales page — REVÍZIA 2026-07-13: vraciame do flow /entry → /heroglyph → /heroglyph/intro (redizajn).
// (stará sales stránka pages/Heroglyph.tsx sa od 7. 10. 2026 nenačítava — /heroglyph → /#heroglyph)
const CertRender = lazy(() => import("./pages/CertRender.tsx"));
const InvoiceRender = lazy(() => import("./pages/InvoiceRender.tsx"));
const ShareRender = lazy(() => import("./pages/ShareRender.tsx"));
const DogShare = lazy(() => import("./pages/DogShare.tsx"));

// Fullscreen div — no spinner/text, so nothing brand-foreign flashes while a route
// chunk loads.
//
// ⚠️ FARBU URČUJE CESTA (2026-09-01). Do 1. 9. tu stála natvrdo čierna a platilo to,
// kým bol každý povrch tmavý. Odkedy sa `/pack` prezlieka do papyrusu, znamenala tá
// čierna bliknutie tmy pred každým vstupom do prezlečenej stránky — Matej: „sekunda
// pred načítaním sa stále zobrazuje tmavé pozadie". Naplocho ju prefarbiť nemožno:
// slúži aj WALL, heroglyph flow a /spiral, kde by z nej bolo biele bliknutie.
// Zoznam prezlečených ciest drží `isPaperRoute` v packTheme.ts — pri prezliekaní
// ďalšieho povrchu sa dopĺňa TAM, nie tu.
const RouteFallback = () => {
  const { pathname } = useLocation();
  return <div style={{ position: "fixed", inset: 0, background: usePaperRoute(pathname) ? PAPER_BG : "#000" }} />;
};


// ═══════════════════════════════════════════════════════════════════════════
// NOVÝ HEROFLOW — PREPÍNAČ (23. 9. 2026)
//
// Matej 23. 9.: „nerobíme to na live! robíme to na dev, každý deň urobíme
// 1-2 obrazovky nech to odsýpa."
//
// 🔴 PRETO `import.meta.env.DEV`, A NIE OBYČAJNÉ ZAVESENIE. `npm run go-live`
//    vyváža CELÝ `main`, nie vybraný commit. Presne tak sa 1. 9. 2026 nový
//    vstup neplánovane odviezol na ostrý web v cudzom deploy commite
//    `24382ba` „Nasadenie /pack" a 15 dní tam stál nepreverený. Za touto
//    bránou sa do produkčného buildu nedostane ani vtedy, keď niekto
//    medzitým deployuje z inej session.
//
// 🔴 DO PRODUKCIE SA TO SMIE PUSTIŤ AŽ S MULTI-MÓDOM. `dogyptStore.ts` pri
//    `extraDogs`: „krok 3 NESMIE ísť na produkciu bez [multi-módu] — inak si
//    niekto naklikal troch psov, zaplatil raz a dostal jeden heroglyf."
//    Dnes je cena natvrdo €11 na troch miestach (`dogyptStore.ts:88`,
//    `CheckoutScreen.tsx:169`, `create-checkout/index.ts:122`) a Stripe
//    dostáva `quantity: 1`.
//
// Prepínač má JEDEN zdroj — `src/lib/flowMode.ts`. Pýtajú sa ho aj obrazovky
// (PhotoScreen kvôli guardu), takže tu sa iba importuje.
// ═══════════════════════════════════════════════════════════════════════════

// Capture ?ref=<code> on every navigation (first-touch wins). Must live inside
// BrowserRouter to read the live location.
/** AINUBIS (a s ním Supabase klient) až po načítaní stránky — prvý obraz ho nepotrebuje
 *  a na pomalom mobile mu bral linku (perf 7. 10. 2026). */
function LateAinubis() {
  const [on, setOn] = useState(false);
  useEffect(() => { void afterLoad().then(() => setOn(true)); }, []);
  return on ? <AinubisWidget /> : null;
}

/** Toastery (~35 kB: sonner, radix, toast) až po vykreslení stránky — na /dog sa ťahali pred
 *  fotkou psa (perf fáza 3, 7. 10. 2026). V appke a admine hneď: tam toast prichádza po akcii
 *  a sonner toast vyslaný pred montážou Toastera zahodí. */
function LateToasters() {
  const [on, setOn] = useState(() => /^\/(pack|admin)(\/|$)/.test(window.location.pathname));
  useEffect(() => { if (!on) void afterLoad().then(() => setOn(true)); }, [on]);
  return on ? <><Toaster /><Sonner /></> : null;
}

/** Výzva „TVÁR TVOJHO PSA" (+ HandIcons, framer-motion, flowPanel) až po vykreslení stránky —
 *  alebo hneď, keď ju niekto zavolá skôr (`PHOTO_INVITE_NEEDED`; požiadavka počká v lib/photoInvite). */
function LatePhotoInvite() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (on) return;
    const go = () => setOn(true);
    void afterLoad().then(go);
    window.addEventListener(PHOTO_INVITE_NEEDED, go);
    return () => window.removeEventListener(PHOTO_INVITE_NEEDED, go);
  }, [on]);
  return on ? <PhotoInvite /> : null;
}

/** Šat a sonda vstupu (flowRedress, flowFill) sa sťahujú LEN na cestách vstupu a v dielni —
 *  mimo nich vracajú `null`, no ich kód (+ HandIcons, flowPaleSkin…) sa ťahal na každej stránke
 *  (perf fáza 2, 7. 10. 2026). Zoznam = FLOW_PATHS v flowRedress.tsx + /lab (pri zmene meň oba). */
function OnFlowPaths({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return /^\/(heroglyph|checkout|payment|welcome|lab)(\/|$)/.test(pathname) ? <>{children}</> : null;
}

function RefCapture() {
  const location = useLocation();
  const { lang } = useLang();
  useEffect(() => {
    captureRefFromSearch(location.search);
  }, [location.search]);
  useEffect(() => {
    captureAttribution();
  }, []);
  useEffect(() => {
    setAnalyticsLang(lang);
  }, [lang]);
  useEffect(() => {
    // Cesty pod /pack idú do PostHogu maskované (`/pack/map/:country/:slug`) — inak sa
    // heatmapa rozdrobí na stovky jednorazových URL. Viď `lib/packAnalytics.ts`.
    trackPageview(maskPath(location.pathname));
    trackPackRoute(location.pathname);
  }, [location.pathname]);
  return null;
}

const App = () => (
  <HelmetProvider>
    <LanguageProvider>
      <Suspense fallback={null}>
        <LateToasters />
      </Suspense>
      <BrowserRouter>
        <RefCapture />
        <Suspense fallback={null}>
          <ConsentBanner />
        </Suspense>
        <Suspense fallback={null}>
          <LateAinubis />
        </Suspense>
        {SHOW_DEVNAV && <Suspense fallback={null}><DevNav /></Suspense>}
        <Suspense fallback={null}>
          <LatePhotoInvite />
        </Suspense>
        {/* Bledý šat + progresbar pre STARÉ obrazovky flow. Bez neho by nové
            obrazovky (dogs, email, why) boli papyrusové a zvyšok čierny.
            Vrstva je zapuzdrená v `[data-flow-skin="pale"]`, takže netečie
            na Terms/Vision/Login. Prepnúť späť na tmavý: dev menu. */}
        {NEW_HEROFLOW && (
          <OnFlowPaths>
            <Suspense fallback={null}>
              <FlowRedress />
            </Suspense>
            <Suspense fallback={null}>
              <FlowFillProbe />
            </Suspense>
          </OnFlowPaths>
        )}
        {/* Testovacie dáta z dielne. Visí NAD routami, aby bežal aj v ráme,
            ktorý dielňa otvorí — rám je vlastný dokument s prázdnym store. */}
        {NEW_HEROFLOW && import.meta.env.DEV && (
          <Suspense fallback={null}>
            <DevSeedBoot />
          </Suspense>
        )}
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* FLIP 7. 10. 2026 (Matej): hlavný web = scrollovací FILM (začína planétkou),
                  nie grid. „/wall je grid, na ktorý sa človek dostane zo spodného navu."
                  Staré verejné stránky (/vision, /religion, /about, /spiral) sú dnes
                  súčasťou filmu — presmerované, aby žil každý odkaz v rozoslaných mailoch. */}
              <Route path="/" element={<OnePage />} />
              <Route path="/onepage" element={<Navigate to="/" replace />} />
              {/* /wall = ten istý film, otvorený rovno na BLEDEJ stene (Matej 7. 10.:
                  „tmavá aktuálna stena zaniká… pracujeme len s tým novým bledým dizajnom"). */}
              <Route path="/wall" element={<OnePage />} />
              <Route path="/grid" element={<Navigate to="/wall" replace />} />
              <Route path="/spiral" element={<Navigate to="/" replace />} />
              <Route path="/vision" element={<Navigate to="/#vision" replace />} />
              <Route path="/religion" element={<Navigate to="/#religion" replace />} />
              <Route path="/about" element={<Navigate to="/#founder" replace />} />
              <Route path="/betavision" element={<Navigate to="/" replace />} />
              {/* LAB — svetlý (papyrusový) web, dev-only pieskovisko.
                  `/wall-lab` = homepage (GLOBE + spodná lišta), ostatné cesty sú
                  sekcie toho istého rámu. Ostré `/`, `/religion`, `/vision`,
                  `/about` ostávajú nedotknuté. */}
              {import.meta.env.DEV && (
                <>
                  <Route path="/wall-lab" element={<LabShell />} />
                  <Route path="/vision-lab" element={<LabShell />} />
                  <Route path="/religion-lab" element={<LabShell />} />
                  <Route path="/about-lab" element={<LabShell />} />
                </>
              )}


              {/* /entry — verejná conviction gate PRED flow (2026-07-12). CTA → /heroglyph/intro. */}
              {/* Nový vstup nemá `/entry` ani predajnú `/heroglyph` (Matej 6. 10. 2026) —
                  všetky staré odkazy idú na meno. Starý flow (LIVE) ostáva nezmenený. */}
              <Route path="/entry" element={NEW_HEROFLOW ? <Navigate to="/heroglyph/name" replace /> : <Entry />} />

              {/* Heroglyph flow — prefix /heroglyph/<step> (14 krokov + nepočítaný intro predkrok).
                  /heroglyph sales page retirovaná → redirect na /entry (pokryje všetky staré CTA/inbound linky).

                  🔴 VRÁTENÉ 15. 9. 2026 DO STAVU Z 24. 8. (Matej: „ja chcem IBA HEROFLOW do
                  pôvodnej podoby pred tým ako sme ho zmenili … IBA HEROFLOW od /entry - po welcome").
                  Prepísaný vstup z 28.–31. 8. (fotka prvá, krok MULTI PES, e-mail, „prečo heroglyf",
                  zrušené papierovačky, bledý šat) sa 1. 9. NEPLÁNOVANE odviezol na ostrý web
                  v deploy commite `24382ba` „Nasadenie /pack" a 15 dní tam stál nepreverený.
                  Kód si to pýtal sám — `dogyptStore.ts` pri `extraDogs` hovorí:
                  „krok 3 NESMIE ísť na produkciu bez [multi-módu] — inak si niekto naklikal
                  troch psov, zaplatil raz a dostal jeden heroglyf."

                  Obrazovky nového vstupu sa NEMAZALI, len sa sem nevešajú: `DogsScreen`,
                  `EmailScreen`, `WhyScreen`, `CropScreen`, `CountryPick`, `AboutScreen`,
                  `FlowPhases`, `flowPaleSkin.ts`, `flowRedress.tsx` ležia ďalej v `screens/`.
                  Pri veľkom launchi sa vráti späť tento blok + `<FlowRedress />` v strome vyššie. */}
              {/* Stránka /heroglyph NEEXISTUJE (Matej 7. 10. 2026: „Heroglyph stránka nemá existovať … presmeruj ju na heroglyph sekciu“).
                Vstup do flow = FLOW_FIRST_STEP (/heroglyph/name), nie /heroglyph. */}
              <Route path="/heroglyph" element={<Navigate to="/#heroglyph" replace />} />
              {/* ── NOVÝ VSTUP (DEV) — poradie z `cdb9df2` (31. 8. 2026) ──
                  fotka → meno → ĎALŠÍ PSI → e-mail → prečo heroglyf → plemeno → …
                  → povaha → VÝREZ → odhalenie → odkaz.
                  `intro` a `about` sú redirecty, nie mŕtve routy: staré odkazy
                  a záložky musia niekam dôjsť. */}
              {NEW_HEROFLOW ? (
                <>
                  <Route path="/heroglyph/intro" element={<Navigate to="/heroglyph/name" replace />} />
                  <Route path="/heroglyph/photo" element={<PhotoScreen />} />
                  <Route path="/heroglyph/name" element={<NameScreen />} />
                  <Route path="/heroglyph/dogs" element={<DogsScreen />} />
                  <Route path="/heroglyph/email" element={<EmailScreen />} />
                  {/* 🔴 PREČO HEROGLYF JE ODVESENÉ (Matej 24. 9. 2026: *„zmaž to,
                      to je neaktuálna obrazovka"*). Nie je to mŕtva routa, ale
                      REDIRECT — rovnako ako `intro` a `about`: staré odkazy,
                      záložky a šípka späť musia niekam dôjsť, a to niekam je
                      krok, ktorý ho v reťazi nahradil.
                      ⚠️ Komponent `WhyScreen.tsx` sa NEMAŽE, len ho nikto nevolá;
                         vrátiť ho je jeden riadok. */}
                  <Route path="/heroglyph/why" element={<Navigate to="/heroglyph/essence" replace />} />
                  {/* PODSTATA (24. 9. 2026) — pohltila štyri routy `dog-gender`,
                      `dog-fate`, `dog-colour`, `dog-bloodline`. Tie sa NEMAŽÚ:
                      starý (LIVE) vstup ide ďalej cez ne, tento rez je zatiaľ
                      len v DEV. */}
                  <Route path="/heroglyph/essence" element={<EssenceScreen />} />
                  <Route path="/heroglyph/about" element={<Navigate to="/heroglyph/breed" replace />} />
                  <Route path="/heroglyph/crop" element={<CropScreen />} />
                  {/* Dielňa vstupu — zoznam povrchov + rám. `/lab/scena` je
                      ľahká tapeta pre popupy (stena ťahá psov z produkcie). */}
                  <Route path="/lab/heroflow" element={<HeroflowLab />} />
                  <Route path="/lab/scena" element={<LabScene />} />
                </>
              ) : (
                <>
                  <Route path="/heroglyph/intro" element={<IntroScreen />} />
                  <Route path="/heroglyph/name" element={<NameScreen />} />
                  <Route path="/heroglyph/photo" element={<PhotoScreen />} />
                </>
              )}
              {/* 🔴 JEDNA ROUTA, DVE OBRAZOVKY podľa režimu vstupu (24. 9. 2026).
                  Nový vstup dostáva zliatu obrazovku PATRÓN (plemeno + kríženec +
                  patrón + zápis do heroglyfu naraz), LIVE ide ďalej cez pôvodnú
                  `BreedPatronScreen` s dvoma podkrokmi.
                  ⚠️ Cesta sa NEMENÍ zámerne: `EssenceScreen`, pruh postupu
                     (`flowRedress.tsx`), ksichty (`hekthorFaces.ts`) aj dielňa na
                     ňu už ukazujú, a druhá routa pre to isté miesto v reťazi by
                     znamenala dve poradia vstupu.
                  ⚠️ Vetvenie je TU, nie v komponente: obrazovka, ktorá si sama
                     rozhoduje, či je stará alebo nová, sa nikdy nedá zmazať. */}
              <Route
                path="/heroglyph/breed"
                element={NEW_HEROFLOW ? <PatronScreen /> : <BreedPatronScreen />}
              />
              <Route path="/heroglyph/ranking" element={<RankingScreen />} />
              {/* 🔴 JEDNA ROUTA, DVE OBRAZOVKY podľa režimu vstupu (25. 9. 2026) —
                  ten istý recept ako `/heroglyph/breed` a `/heroglyph/dog-character`.
                  Nový vstup dostáva MAJITEĽA (poradie z kroku 2 + meno + pohlavie +
                  jeden dátum, z ktorého sa dopočítajú obidva horoskopy), LIVE ide
                  ďalej cez pôvodnú trojicu `owner-info` → `owner-zodiac` →
                  `owner-final`.
                  ⚠️ Tie tri routy sa NEMAŽÚ a ostávajú zavesené — LIVE vstup po nich
                     chodí. Z reťaze NOVÉHO vstupu sú odvesené (`flowRedress.tsx`),
                     takže sa do nich ťuknutím nedá dostať; priamy odkaz áno. */}
              <Route
                path="/heroglyph/owner-info"
                element={NEW_HEROFLOW ? <OwnerScreen /> : <OwnerInfoScreen />}
              />
              <Route path="/heroglyph/owner-zodiac" element={<OwnerZodiacScreen />} />
              <Route path="/heroglyph/owner-final" element={<OwnerFinalScreen />} />
              <Route path="/heroglyph/dog-gender" element={<DogGenderScreen />} />
              <Route path="/heroglyph/dog-fate" element={<DogFateScreen />} />
              <Route path="/heroglyph/dog-colour" element={<DogColourScreen />} />
              <Route path="/heroglyph/dog-bloodline" element={<DogBloodlineScreen />} />
              {/* 🔴 JEDNA ROUTA, DVE OBRAZOVKY podľa režimu vstupu (25. 9. 2026) —
                  ten istý recept ako `/heroglyph/breed`. Nový vstup dostáva POVAHU
                  (Hektor hore, rám a výber v jednej doske), LIVE ide ďalej cez
                  pôvodnú `DogCharacterScreen`.
                  ⚠️ Cesta sa NEMENÍ zámerne: pruh postupu (`flowRedress.tsx`),
                     ksichty (`hekthorFaces.ts`), `CropScreen` aj dielňa na ňu už
                     ukazujú. */}
              <Route
                path="/heroglyph/dog-character"
                element={NEW_HEROFLOW ? <CharacterScreen /> : <DogCharacterScreen />}
              />
              {/* Nový vstup: ODHALENIE + ODKAZ na jednej obrazovke (25. 9. 2026,
                  nákres `plany/nakres-chvost-flowu-2026-09-25.html`). LIVE ide
                  ďalej cez `HeroglyphRevealScreen` → `/heroglyph/message`. */}
              <Route
                path="/heroglyph/reveal"
                element={NEW_HEROFLOW ? <FlowRevealScreen /> : <HeroglyphRevealScreen />}
              />
              <Route path="/heroglyph/message" element={<MessageScreen />} />
              {/* Finále po platbe nového vstupu (svorka): Hektor → poradie → NA STENU
                  (26. 9. 2026). Starý tok ostáva na /welcome. */}
              <Route path="/heroglyph/welcome" element={<FlowWelcomeScreen />} />

              {/* Checkout — Stripe (flat, success_url je /welcome) */}
              {/* Nový vstup: POKLADŇA = checkout + platba na jednej obrazovke,
                  platí celú svorku (25. 9. 2026). LIVE ide ďalej dvojicou
                  `CheckoutScreen` → `PaymentScreen`. */}
              <Route path="/checkout" element={NEW_HEROFLOW ? <FlowCheckoutScreen /> : <CheckoutScreen />} />
              {/* C · ZADRŽANIE — „Nechcem platiť" z pokladne (len nový vstup). */}
              {NEW_HEROFLOW && <Route path="/heroglyph/stay" element={<FlowStayScreen />} />}
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              {import.meta.env.DEV && (
                <Route path="/pack/_herolab" element={<HeroLab />} />
              )}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Pack backoffice auth — magic link callback */}
              <Route path="/login" element={<Login />} />

              {/* Pozvánka pawmata — /pack/join/:token. ⚠️ ZÁMERNE BEZ `DEV_FULL` A BEZ
                  ČLENSTVA: prichádza sem človek, ktorý ešte nemá účet ani psa, takže
                  brána `/pack` by ho odmietla z definície. Statický segment `join`
                  vyhráva nad `/pack/dogs/:id` aj ostatnými, lebo je celý doslovný.
                  (plany/zadanie-clenovia-svorky-2026-09-12.md §5b) */}
              <Route path="/pack/join/:token" element={<PackJoin />} />

              {/* /pack — buyer backoffice (auth-gated) */}
              {/* Bez session rovno na prihlásenie — nie cez 1,4 MB appky (perf fáza 2, 7. 10. 2026). */}
              <Route path="/pack" element={NOAUTH_DEV || hasStoredSessionOrAuthReturn() ? <Pack /> : <Navigate to={`/login?return=${encodeURIComponent("/pack" + window.location.search)}`} replace />} />
              <Route path="/pack/dogs/:id" element={<PackDogDetail />} />
              {/* Profil je na LIVE od 2026-08-06 (Matej: „profil sa bude upravovať v /profile").
                  Podmienka pre ceruzku v HeroCard — homepage je odteraz read-only a JEDINÉ miesto,
                  kde sa mení fotka a meno, je tu. Gate sa vrátiť nesmie bez vrátenia editácie
                  do HeroCard, inak si člen fotku nezmení vôbec. */}
              <Route path="/pack/profile" element={<PackProfile />} />
              {/* Read-profil majiteľa — /pack/u/:id (zadanie-profil-read-dog-2026-07-25 §3). Funguje
                  self; cudzí člen = graceful fallback („profile isn't public yet"), žiaden crash.
                  Fabrikovaní členovia zmazaní 2026-08-03. */}
              <Route path="/pack/u/:id" element={DEV_FULL ? <PublicProfile /> : <Navigate to="/pack" replace />} />
              {/* Map = povrch výletov (mapa + reálne tripy), LIVE schovaný (Matej 2026-07-08). V DEV_FULL ostáva.
                  Statické segmenty (triplist) vyhrávajú nad :slug. */}
              <Route path="/pack/map" element={<MapGate><PackMap /></MapGate>} />
              {/* TRIPLIST hub — Slice A (plany/zadanie-triplist-sliceA-2026-07-23.md) */}
              <Route path="/pack/map/triplist" element={<MapGate><PackTriplist /></MapGate>} />
              {/* iterácia 12 bod 5: ⤢ expand → SAMOSTATNÁ full-page article route (nie modal
                  v PackMap) — PackMap už nikdy nemountuje so slugom.
                  Krajina je vlastný segment (Matej 2026-08-03): `/pack/map/svk/:slug`. ISO3, lebo
                  ISO2 `sk` by sa v ceste čítalo ako jazyková mutácia. Stavať výhradne cez
                  tripPath() / tripPathById() z tripShared. */}
              <Route path="/pack/map/:country/:slug" element={<MapGate><PackTripArticle /></MapGate>} />
              {/* PRIBEH Z CESTY = `modal-as-route` (architektura v0, 22. 9. 2026): vrstva nad
                  clankom, ale s VLASTNOU adresou — da sa zdielat aj indexovat a prezije
                  obnovenie stranky. NIE `#hash`. Mountuje sa TA ISTA stranka, ktora si
                  z `:n` vyberie pribeh a vykresli ho ako vrstvu; keby to bola samostatna
                  stranka, navrat spat by pristal na vrchu clanku a stratil by kontext. */}
              <Route path="/pack/map/:country/:slug/pribeh/:n" element={<MapGate><PackTripArticle /></MapGate>} />
              {/* Starý tvar bez krajiny — drží staré odkazy nažive, PackTripArticle si sám
                  doplní krajinu a prepíše URL (replace). Statické segmenty vyššie vyhrávajú. */}
              <Route path="/pack/map/:slug" element={<MapGate><PackTripArticle /></MapGate>} />
              {/* ADD flow má vlastnú URL od začiatku (issue #35): `/pack/add/trip`, NIE `/pack/add`.
                  Medzikrok ADD → (trip · event · place · service) sa teraz nestavia, ale keď pribudne,
                  zasunie sa na `/pack/add` bez lámania uložených odkazov. Render = PackMap (ADD je
                  overlay nad živou leaflet mapou — GeometryPicker kreslí priamo do nej), stránka si
                  z pathname otvorí log formulár. */}
              <Route path="/pack/add/trip" element={<MapGate><PackMap /></MapGate>} />
              <Route path="/pack/add" element={<Navigate to="/pack/add/trip" replace />} />
              <Route path="/pack/dogs" element={DEV_FULL ? <PackDogs /> : <Navigate to="/pack" replace />} />
              {/* Kvíz = fullscreen route, nie modal (zadanie-mypack-petpas-2026-08-06 §6). `?dog=<id>`
                  predfiltruje na jedného psa (deep-link „✎" z karty psa), `?field=` skočí na krok.
                  Štyri segmenty → nekoliduje s `/pack/dogs/:id` vyššie. */}
              {/* KRONIKA — kôš 2 (čítanie, lišta ostáva). Statický segment vyhráva nad `/pack/dogs/:id`. */}
              <Route path="/pack/dogs/chronicle" element={DEV_FULL ? <PackChronicle /> : <Navigate to="/pack" replace />} />
              {/* DOG ID · MODULY — kôš 2, rozcestník ZÁKLAD · OSOBNOSŤ · ZÁVET (lock dogs-dogid §REVÍZIA 8. 10.).
                  `dogid`, nie `id`: segment `id` by sa čítal ako identifikátor psa. */}
              <Route path="/pack/dogs/dogid" element={DEV_FULL ? <PackDogIdModules /> : <Navigate to="/pack" replace />} />
              <Route path="/pack/dogs/quiz/:key" element={DEV_FULL ? <PackDogQuiz /> : <Navigate to="/pack" replace />} />
              {/* Osobnostný kvíz (element + úloha v svorke). Cesta je `/pack/nature` zámerne:
                  `/pack/dogs/quiz/nature` by zachytil `:key` vyššie a `/pack/dogs/nature` zjedol `:id`. */}
              <Route path="/pack/nature" element={DEV_FULL ? <PackNatureQuiz /> : <Navigate to="/pack" replace />} />
              {/* KOSTRA AINUBISA — miesto chrbtice, kôš 1 „SOM DOMA" (lock architektura-pack §3).
                  Za `DEV_FULL` z toho istého dôvodu ako `/pack/dogs`: obrazovka ide von
                  s 1. vlnou, nie skôr. Chat sa z nej otvára cez `ainubisBus`, takže widget
                  ostáva tam, kde je — root-level singleton mimo `/pack` stromu. */}
              {/* `/*` — aj článok zvitku `/pack/ainubis/zvitok/:id` (modal-as-route, kôš 2, 3. 10. 2026)
                  beží v TEJ ISTEJ inštancii: dve routy by VAULT pri otvorení zvitku postavili
                  nanovo a návrat by stratil zoznam, pohľad aj mozog. */}
              <Route path="/pack/ainubis/*" element={DEV_FULL ? <PackAinubis /> : <Navigate to="/pack" replace />} />
              {/* SNIFFER (interne BUDDY; Matej 24. 9.: „premenujem to na SNIFFER") = kôš 3 (bez spodnej lišty), rovina vo VON — lock architektura-pack §8/§8.1. */}
              <Route path="/pack/sniffer" element={DEV_FULL && BUDDY_LIVE ? <PackBuddy /> : <Navigate to="/pack/map" replace />} />
              {/* ODKIAĽ TO VIEM — od 24. 9. 2026 (Matej, voľba E1) to NIE JE vlastná
                  stránka, ale TRETIA ZÁLOŽKA NÁSTENKY (`?plane=wall&tab=lib`).
                  Ranná verzia mala vlastnú adresu (E2) a stránka `PackAinubisSources.tsx`
                  je preto zmazaná. Adresa ostáva ako presmerovanie — odkaz na ňu mohol
                  medzitým niekam odísť a tichý 404 je horší než skok na to isté miesto. */}
              <Route path="/pack/ainubis/sources"
                element={<Navigate to="/pack/ainubis?plane=wall&tab=lib" replace />} />

              <Route path="/cert-render/:id" element={<CertRender />} />
              <Route path="/invoice-render/:id" element={<InvoiceRender />} />
              <Route path="/share-render/:id" element={<ShareRender />} />

              {/* Public per-dog share landing — the OG image target for shared links (/d/<pack_number>) */}
              <Route path="/d/:pack" element={<DogShare />} />
              {/* Canonical public dog page — /dog/<name>-<pack_number> (falls back to /dog/<pack_number>) */}
              <Route path="/dog/:slug" element={<DogShare />} />

              {/* /admin — read-only backoffice (admin-email gated) */}
              <Route path="/admin" element={<Admin />} />
              {/* Neznáma cesta v /pack NEVYPADNE z appky (test po FLIPe 5. 10. 2026: verejná 404
                  bez spodnej lišty s návratom na stenu `/`). `buddy` je staré meno SNIFFERu. */}
              <Route path="/pack/buddy" element={<Navigate to="/pack/sniffer" replace />} />
              <Route path="/pack/*" element={<Navigate to="/pack" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </LanguageProvider>
  </HelmetProvider>
);

export default App;
