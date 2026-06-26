import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DEV_FULL } from "@/lib/packFlags";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { SpiralLanding } from "@/components/landing/SpiralLanding";
import { GodsGrid } from "@/components/gods/GodsGrid";
import { IntroScreen } from "@/components/screens/IntroScreen";
import { NameScreen } from "@/components/screens/NameScreen";
import { PhotoScreen } from "@/components/screens/PhotoScreen";
import { BreedPatronScreen } from "@/components/screens/BreedPatronScreen";
import { RankingScreen } from "@/components/screens/RankingScreen";
import { OwnerInfoScreen } from "@/components/screens/OwnerInfoScreen";
import { OwnerZodiacScreen } from "@/components/screens/OwnerZodiacScreen";
import { OwnerFinalScreen } from "@/components/screens/OwnerFinalScreen";
import { DogGenderScreen } from "@/components/screens/DogGenderScreen";
import { DogFateScreen } from "@/components/screens/DogFateScreen";
import { DogColourScreen } from "@/components/screens/DogColourScreen";
import { DogBloodlineScreen } from "@/components/screens/DogBloodlineScreen";
import { DogCharacterScreen } from "@/components/screens/DogCharacterScreen";
import { HeroglyphRevealScreen } from "@/components/screens/HeroglyphRevealScreen";
import { MessageScreen } from "@/components/screens/MessageScreen";
import { CheckoutScreen } from "@/components/screens/CheckoutScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import NotFound from "./pages/NotFound.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Pack from "./pages/Pack.tsx";
import PackDogDetail from "./pages/PackDogDetail.tsx";
import PackProfile from "./pages/PackProfile.tsx";
import PackPortal from "./pages/PackPortal.tsx";
import Login from "./pages/Login.tsx";
import Admin from "./pages/Admin.tsx";
import Vision from "./pages/Vision.tsx";
import BetaVision from "./pages/BetaVision.tsx";
import Religion from "./pages/Religion.tsx";
import About from "./pages/About.tsx";
import Heroglyph from "./pages/Heroglyph.tsx";
import CertRender from "./pages/CertRender.tsx";
import InvoiceRender from "./pages/InvoiceRender.tsx";
import { DevNav } from "@/components/DevNav";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureRefFromSearch } from "@/lib/refCapture";
import { trackPageview } from "@/lib/analytics";

const queryClient = new QueryClient();

// Capture ?ref=<code> on every navigation (first-touch wins). Must live inside
// BrowserRouter to read the live location.
function RefCapture() {
  const location = useLocation();
  useEffect(() => {
    captureRefFromSearch(location.search);
  }, [location.search]);
  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RefCapture />
        <DevNav />
        <Routes>
          <Route path="/" element={<SpiralLanding />} />
          <Route path="/spiral" element={<SpiralLanding />} />
          <Route path="/grid" element={<GodsGrid />} />

          {/* Heroglyph flow — prefix /heroglyph/<step> (14 krokov + nepočítaný intro predkrok) */}
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
          <Route path="/pack/portal" element={<PackPortal />} />

          <Route path="/cert-render/:id" element={<CertRender />} />
          <Route path="/invoice-render/:id" element={<InvoiceRender />} />

          {/* /admin — read-only backoffice (admin-email gated) */}
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
