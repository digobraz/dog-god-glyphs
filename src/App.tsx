import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DEV_FULL } from "@/lib/packFlags";
import { ONEPAGE_PREVIEW } from "@/lib/onepagePreview";
import { MapGate } from "@/components/pack/MapGate";
// Papyrusový podklad + zoznam prezlečených ciest — jeden zdroj, viď RouteFallback nižšie.
import { PAPER_BG, usePaperRoute } from "@/components/pack/packTheme";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLang } from "@/i18n/LanguageContext";
import { GodsGrid } from "@/components/gods/GodsGrid";
import NotFound from "./pages/NotFound.tsx";
import { DevNav } from "@/components/DevNav";
import { ConsentBanner } from "@/components/ConsentBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { captureRefFromSearch } from "@/lib/refCapture";
import { trackPageview, setAnalyticsLang } from "@/lib/analytics";
import { maskPath, trackPackRoute } from "@/lib/packAnalytics";
import { captureAttribution } from "@/lib/attribution";
import { NEW_HEROFLOW } from "@/lib/flowMode";

// Route-level code-split (P0 2026-07 perf pass). GodsGrid (homepage/LCP) + NotFound
// stay eager; everything else behind /heroglyph, /pack, /admin, legacy /spiral, etc.
// loads on demand. Screens under components/screens/ + SpiralLanding are named
// exports — pages/* are default exports.
const SpiralLanding = lazy(() =>
  import("@/components/landing/SpiralLanding").then((m) => ({ default: m.SpiralLanding }))
);
// AINUBIS chat widget — lazy, aby nezaťažil homepage bundle (perf je otvorená téma).
// Widget si sám rozhoduje o skrytí na render/heroglyph routách (viď AinubisWidget.tsx).
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
// ── NOVÝ VSTUP (28.–31. 8. 2026) — zavesený LEN v DEV, viď `NEW_HEROFLOW` nižšie ──
const DogsScreen = lazy(() =>
  import("@/components/screens/DogsScreen").then((m) => ({ default: m.DogsScreen }))
);
const EmailScreen = lazy(() =>
  import("@/components/screens/EmailScreen").then((m) => ({ default: m.EmailScreen }))
);
const WhyScreen = lazy(() =>
  import("@/components/screens/WhyScreen").then((m) => ({ default: m.WhyScreen }))
);
const CropScreen = lazy(() =>
  import("@/components/screens/CropScreen").then((m) => ({ default: m.CropScreen }))
);
const FlowRedress = lazy(() =>
  import("@/components/screens/flowRedress").then((m) => ({ default: m.FlowRedress }))
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
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Pack = lazy(() => import("./pages/Pack.tsx"));
const PackDogDetail = lazy(() => import("./pages/PackDogDetail.tsx"));
const PackProfile = lazy(() => import("./pages/PackProfile.tsx"));
const PublicProfile = lazy(() => import("./pages/PublicProfile.tsx")); // read-profil /pack/u/:id (zadanie-profil-read-dog-2026-07-25)
const PackJoin = lazy(() => import("./pages/PackJoin.tsx")); // /pack/join/:token — prijatie pozvánky pawmata
const PackMap = lazy(() => import("./pages/PackMap.tsx"));
const PackTripArticle = lazy(() => import("./pages/PackTripArticle.tsx")); // iterácia 12 bod 5 — ⤢ expand full-page article
const PackTriplist = lazy(() => import("./pages/PackTriplist.tsx")); // TRIPLIST hub — Slice A (plany/zadanie-triplist-sliceA-2026-07-23.md)
const PackDogs = lazy(() => import("./pages/PackDogs.tsx"));
const PackAinubis = lazy(() => import("./pages/PackAinubis.tsx")); // kostra AINUBISA — `/pack/ainubis` (rozhodnutia 4A+5A, 21. 9. 2026)
const PackAinubisSources = lazy(() => import("./pages/PackAinubisSources.tsx")); // ODKIAĽ TO VIEM — `/pack/ainubis/sources` (voľba E2, 24. 9. 2026)
const PackDogQuiz = lazy(() => import("./pages/PackDogQuiz.tsx")); // fullscreen kvíz (zadanie-mypack-petpas-2026-08-06 §6)
const PackNatureQuiz = lazy(() => import("./pages/PackNatureQuiz.tsx")); // osobnostný kvíz element+úloha (zadanie-osobnostny-kviz-2026-08-06)
const Login = lazy(() => import("./pages/Login.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Vision = lazy(() => import("./pages/Vision.tsx"));
const BetaVision = lazy(() => import("./pages/BetaVision.tsx"));
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
const Religion = lazy(() => import("./pages/Religion.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Entry = lazy(() => import("./pages/Entry.tsx"));
// Heroglyph sales page — REVÍZIA 2026-07-13: vraciame do flow /entry → /heroglyph → /heroglyph/intro (redizajn).
const Heroglyph = lazy(() => import("./pages/Heroglyph.tsx"));
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

const queryClient = new QueryClient();

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
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RefCapture />
        <ConsentBanner />
        <Suspense fallback={null}>
          <AinubisWidget />
        </Suspense>
        <DevNav />
        {/* Bledý šat + progresbar pre STARÉ obrazovky flow. Bez neho by nové
            obrazovky (dogs, email, why) boli papyrusové a zvyšok čierny.
            Vrstva je zapuzdrená v `[data-flow-skin="pale"]`, takže netečie
            na Terms/Vision/Login. Prepnúť späť na tmavý: dev menu. */}
        {NEW_HEROFLOW && (
          <Suspense fallback={null}>
            <FlowRedress />
          </Suspense>
        )}
        {/* Testovacie dáta z dielne. Visí NAD routami, aby bežal aj v ráme,
            ktorý dielňa otvorí — rám je vlastný dokument s prázdnym store. */}
        {NEW_HEROFLOW && (
          <Suspense fallback={null}>
            <DevSeedBoot />
          </Suspense>
        )}
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* LAUNCH SWAP (Matej OK): GRID = homepage. Spirála → /spiral archív. */}
              <Route path="/" element={<GodsGrid />} />
              <Route path="/wall" element={<GodsGrid />} />
              <Route path="/grid" element={<GodsGrid />} />
              <Route path="/spiral" element={<SpiralLanding />} />
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

              {/* /onepage — film je od 4. 9. 2026 aj na OSTROM webe, ale len pre toho,
                  kto ma token (`dogypt.com/onepage?preview=...`). Dovod: pod
                  `import.meta.env.DEV` sa rychlost filmu nedala zmerat — produkcny build
                  routu vobec nemal a nacitala sa prazdna stranka. Cely recept aj postup
                  zrusenia je v `src/lib/onepagePreview.ts`. */}
              {(import.meta.env.DEV || ONEPAGE_PREVIEW) && (
                <Route path="/onepage" element={<OnePage />} />
              )}

              {/* /entry — verejná conviction gate PRED flow (2026-07-12). CTA → /heroglyph/intro. */}
              <Route path="/entry" element={<Entry />} />

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
              <Route path="/heroglyph" element={<Heroglyph />} />
              {/* ── NOVÝ VSTUP (DEV) — poradie z `cdb9df2` (31. 8. 2026) ──
                  fotka → meno → ĎALŠÍ PSI → e-mail → prečo heroglyf → plemeno → …
                  → povaha → VÝREZ → odhalenie → odkaz.
                  `intro` a `about` sú redirecty, nie mŕtve routy: staré odkazy
                  a záložky musia niekam dôjsť. */}
              {NEW_HEROFLOW ? (
                <>
                  <Route path="/heroglyph/intro" element={<Navigate to="/heroglyph/photo" replace />} />
                  <Route path="/heroglyph/photo" element={<PhotoScreen />} />
                  <Route path="/heroglyph/name" element={<NameScreen />} />
                  <Route path="/heroglyph/dogs" element={<DogsScreen />} />
                  <Route path="/heroglyph/email" element={<EmailScreen />} />
                  <Route path="/heroglyph/why" element={<WhyScreen />} />
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
              <Route path="/heroglyph/breed" element={<BreedPatronScreen />} />
              <Route path="/heroglyph/ranking" element={<RankingScreen />} />
              <Route path="/heroglyph/owner-info" element={<OwnerInfoScreen />} />
              <Route path="/heroglyph/owner-zodiac" element={<OwnerZodiacScreen />} />
              <Route path="/heroglyph/owner-final" element={<OwnerFinalScreen />} />
              <Route path="/heroglyph/dog-gender" element={<DogGenderScreen />} />
              <Route path="/heroglyph/dog-fate" element={<DogFateScreen />} />
              <Route path="/heroglyph/dog-colour" element={<DogColourScreen />} />
              <Route path="/heroglyph/dog-bloodline" element={<DogBloodlineScreen />} />
              <Route path="/heroglyph/dog-character" element={<DogCharacterScreen />} />
              <Route path="/heroglyph/reveal" element={<HeroglyphRevealScreen />} />
              <Route path="/heroglyph/message" element={<MessageScreen />} />

              {/* Checkout — Stripe (flat, success_url je /welcome) */}
              <Route path="/checkout" element={<CheckoutScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/vision" element={<Vision />} />
              {import.meta.env.DEV && (
                <Route path="/betavision" element={<BetaVision />} />
              )}
              {import.meta.env.DEV && (
                <Route path="/pack/_herolab" element={<HeroLab />} />
              )}
              <Route path="/religion" element={<Religion />} />
              <Route path="/about" element={<About />} />
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
              <Route path="/pack" element={<Pack />} />
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
              <Route path="/pack/dogs/quiz/:key" element={DEV_FULL ? <PackDogQuiz /> : <Navigate to="/pack" replace />} />
              {/* Osobnostný kvíz (element + úloha v svorke). Cesta je `/pack/nature` zámerne:
                  `/pack/dogs/quiz/nature` by zachytil `:key` vyššie a `/pack/dogs/nature` zjedol `:id`. */}
              <Route path="/pack/nature" element={DEV_FULL ? <PackNatureQuiz /> : <Navigate to="/pack" replace />} />
              {/* KOSTRA AINUBISA — miesto chrbtice, kôš 1 „SOM DOMA" (lock architektura-pack §3).
                  Za `DEV_FULL` z toho istého dôvodu ako `/pack/dogs`: obrazovka ide von
                  s 1. vlnou, nie skôr. Chat sa z nej otvára cez `ainubisBus`, takže widget
                  ostáva tam, kde je — root-level singleton mimo `/pack` stromu. */}
              <Route path="/pack/ainubis" element={DEV_FULL ? <PackAinubis /> : <Navigate to="/pack" replace />} />
              {/* ODKIAĽ TO VIEM — zoznam zdrojov mozgu, kôš 2 „POZERÁM SA" (lock §3):
                  dole lišta, hore šípka späť. Voľba E2 (Matej 24. 9. 2026): vlastná
                  adresa, nie tretia záložka nástenky — kniha je objekt a má jednu kartu.
                  🔴 `import.meta.env.DEV` NAVYŠE k `DEV_FULL`: je to MAKETA (čísla sú
                     odpísané z korpusu, nie merané), a `DEV_FULL` je na produkcii pravda
                     pre founderské účty. Rovnaký zámok ako maketa chatu a nástenky. */}
              <Route path="/pack/ainubis/sources"
                element={DEV_FULL && import.meta.env.DEV ? <PackAinubisSources /> : <Navigate to="/pack/ainubis" replace />} />

              <Route path="/cert-render/:id" element={<CertRender />} />
              <Route path="/invoice-render/:id" element={<InvoiceRender />} />
              <Route path="/share-render/:id" element={<ShareRender />} />

              {/* Public per-dog share landing — the OG image target for shared links (/d/<pack_number>) */}
              <Route path="/d/:pack" element={<DogShare />} />
              {/* Canonical public dog page — /dog/<name>-<pack_number> (falls back to /dog/<pack_number>) */}
              <Route path="/dog/:slug" element={<DogShare />} />

              {/* /admin — read-only backoffice (admin-email gated) */}
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
