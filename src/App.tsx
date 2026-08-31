import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DEV_FULL } from "@/lib/packFlags";
import { MapGate } from "@/components/pack/MapGate";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLang } from "@/i18n/LanguageContext";
import { GodsGrid } from "@/components/gods/GodsGrid";
import NotFound from "./pages/NotFound.tsx";
import { DevNav } from "@/components/DevNav";
import { HeroflowDevMenu } from "@/components/lab/HeroflowDevMenu";
import { FlowRedress } from "@/components/screens/flowRedress";
import { ConsentBanner } from "@/components/ConsentBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { captureRefFromSearch } from "@/lib/refCapture";
import { trackPageview, setAnalyticsLang } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

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
const NameScreen = lazy(() =>
  import("@/components/screens/NameScreen").then((m) => ({ default: m.NameScreen }))
);
const PhotoScreen = lazy(() =>
  import("@/components/screens/PhotoScreen").then((m) => ({ default: m.PhotoScreen }))
);
const EmailScreen = lazy(() =>
  import("@/components/screens/EmailScreen").then((m) => ({ default: m.EmailScreen }))
);
const DogsScreen = lazy(() =>
  import("@/components/screens/DogsScreen").then((m) => ({ default: m.DogsScreen }))
);
const WhyScreen = lazy(() =>
  import("@/components/screens/WhyScreen").then((m) => ({ default: m.WhyScreen }))
);
const CropScreen = lazy(() =>
  import("@/components/screens/CropScreen").then((m) => ({ default: m.CropScreen }))
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
const PackMap = lazy(() => import("./pages/PackMap.tsx"));
const PackTripArticle = lazy(() => import("./pages/PackTripArticle.tsx")); // iterácia 12 bod 5 — ⤢ expand full-page article
const PackTriplist = lazy(() => import("./pages/PackTriplist.tsx")); // TRIPLIST hub — Slice A (plany/zadanie-triplist-sliceA-2026-07-23.md)
const PackDogs = lazy(() => import("./pages/PackDogs.tsx"));
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

// Fullscreen black div — no spinner/text, so nothing brand-foreign flashes
// while a route chunk loads.
const RouteFallback = () => <div style={{ position: "fixed", inset: 0, background: "#000" }} />;

const queryClient = new QueryClient();

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
    trackPageview(location.pathname);
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
        {/* Úzke dev menu vstupu — beží aj POČAS flow (Matej 28. 8.:
            „pri flow zostáva ten dev menu aby som vedel prepínať vždy"). */}
        <FlowRedress />
        <HeroflowDevMenu />
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
                  <Route path="/onepage" element={<OnePage />} />
                </>
              )}

              {/* /entry — verejná conviction gate PRED flow (2026-07-12). CTA → /heroglyph/intro. */}
              <Route path="/entry" element={<Entry />} />

              {/* Heroglyph flow — prefix /heroglyph/<step>.
                  PORADIE OD 28. 8. 2026: fotka → meno → e-mail → papierovačky → plemeno → …
                  → povaha → výrez → odhalenie. Fotka je prvá otázka, e-mail padá skoro
                  (predtým až 17. krok z 19), výrez sa odsunul za skladanie heroglyfu.
                  /heroglyph/intro zanikol — jeho jediná otázka (žije pes?) je pri mene.
                  /heroglyph sales page retirovaná → redirect na /entry (staré CTA a inbound linky). */}
              <Route path="/heroglyph" element={<Heroglyph />} />
              <Route path="/heroglyph/intro" element={<Navigate to="/heroglyph/photo" replace />} />
              <Route path="/heroglyph/photo" element={<PhotoScreen />} />
              <Route path="/heroglyph/name" element={<NameScreen />} />
              <Route path="/heroglyph/dogs" element={<DogsScreen />} />
              <Route path="/heroglyph/email" element={<EmailScreen />} />
              <Route path="/heroglyph/why" element={<WhyScreen />} />
              {/* 🔴 PAPIEROVAČKY ZRUŠENÉ 31. 8. 2026 (Matej: „papierovačky krok zruš").
                  Krajinu aj dátum narodenia zbiera UŽ krok 3 (`/heroglyph/dogs`) — a to pre
                  KAŽDÉHO psa vrátane prvého, do tých istých polí store (`selections.country`,
                  `birthdayDay/Month/Year`). Navyše bez nich `allDone` ďalej nepustí, takže sa
                  nedali obísť. Obrazovka teda nič nenesie; ostáva presmerovanie, aby staré
                  odkazy a história prehliadača nekončili na prázdnej ceste. */}
              <Route path="/heroglyph/about" element={<Navigate to="/heroglyph/breed" replace />} />
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
              <Route path="/heroglyph/crop" element={<CropScreen />} />
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
