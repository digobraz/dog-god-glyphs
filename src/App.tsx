import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DEV_FULL } from "@/lib/packFlags";
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
const TrailsPreview = lazy(() => import("./pages/__TrailsPreview.tsx")); // DEV TEMP — zmazať pred commitom
const TrailsDrawTest = lazy(() => import("./pages/__TrailsDrawTest.tsx")); // DEV TEMP
const Login = lazy(() => import("./pages/Login.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Vision = lazy(() => import("./pages/Vision.tsx"));
const BetaVision = lazy(() => import("./pages/BetaVision.tsx"));
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
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* LAUNCH SWAP (Matej OK): GRID = homepage. Spirála → /spiral archív. */}
              <Route path="/" element={<GodsGrid />} />
              <Route path="/wall" element={<GodsGrid />} />
              <Route path="/grid" element={<GodsGrid />} />
              <Route path="/spiral" element={<SpiralLanding />} />

              {/* /entry — verejná conviction gate PRED flow (2026-07-12). CTA → /heroglyph/intro. */}
              <Route path="/entry" element={<Entry />} />

              {/* Heroglyph flow — prefix /heroglyph/<step> (14 krokov + nepočítaný intro predkrok).
                  /heroglyph sales page retirovaná → redirect na /entry (pokryje všetky staré CTA/inbound linky). */}
              <Route path="/heroglyph" element={<Heroglyph />} />
              <Route path="/heroglyph/intro" element={<IntroScreen />} />
              <Route path="/heroglyph/name" element={<NameScreen />} />
              <Route path="/heroglyph/photo" element={<PhotoScreen />} />
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
              <Route path="/religion" element={<Religion />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Pack backoffice auth — magic link callback */}
              <Route path="/login" element={<Login />} />

              {/* /pack — buyer backoffice (auth-gated) */}
              <Route path="/pack" element={<Pack />} />
              <Route path="/pack/dogs/:id" element={<PackDogDetail />} />
              {/* Profil zrušený z LIVE — všetko je na homepage. V DEV_FULL ostáva (frozen). */}
              <Route path="/pack/profile" element={DEV_FULL ? <PackProfile /> : <Navigate to="/pack" replace />} />
              {/* Read-profil majiteľa — /pack/u/:id (zadanie-profil-read-dog-2026-07-25 §3). Self +
                  mock členovia (MOCK_MEMBER_POOL) fungujú v1; reálny cudzí user = graceful fallback
                  (localStorage limit, žiaden crash). */}
              <Route path="/pack/u/:id" element={DEV_FULL ? <PublicProfile /> : <Navigate to="/pack" replace />} />
              {/* Map = povrch výletov (mapa + reálne tripy), LIVE schovaný (Matej 2026-07-08). V DEV_FULL ostáva.
                  Statické segmenty (triplist) vyhrávajú nad :slug. */}
              <Route path="/pack/map" element={DEV_FULL ? <PackMap /> : <Navigate to="/pack" replace />} />
              {/* TRIPLIST hub — Slice A (plany/zadanie-triplist-sliceA-2026-07-23.md) */}
              <Route path="/pack/map/triplist" element={DEV_FULL ? <PackTriplist /> : <Navigate to="/pack" replace />} />
              {/* iterácia 12 bod 5: ⤢ expand → SAMOSTATNÁ full-page article route (nie modal
                  v PackMap) — PackMap už nikdy nemountuje so slugom. */}
              <Route path="/pack/map/:slug" element={DEV_FULL ? <PackTripArticle /> : <Navigate to="/pack" replace />} />
              <Route path="/pack/dogs" element={DEV_FULL ? <PackDogs /> : <Navigate to="/pack" replace />} />
              <Route path="/trails-preview" element={<TrailsPreview />} /> {/* DEV TEMP */}
              <Route path="/trails-draw-test" element={<TrailsDrawTest />} /> {/* DEV TEMP */}

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
