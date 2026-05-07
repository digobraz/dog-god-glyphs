import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LandingPage } from "@/components/landing/LandingPage";
import { SpiralLanding } from "@/components/landing/SpiralLanding";
import { GodsGrid } from "@/components/gods/GodsGrid";
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
import { ThankYouScreen } from "@/components/screens/ThankYouScreen";
import NotFound from "./pages/NotFound.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Pack from "./pages/Pack.tsx";
import PackDogDetail from "./pages/PackDogDetail.tsx";
import PackEternal from "./pages/PackEternal.tsx";
import PackProfile from "./pages/PackProfile.tsx";
import Login from "./pages/Login.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SpiralLanding />} />
          <Route path="/spiral" element={<SpiralLanding />} />
          <Route path="/grid" element={<GodsGrid />} />
          <Route path="/gods" element={<GodsGrid />} />

          {/* Heroglyph flow — prefix /heroglyph/<step> (14 krokov) */}
          <Route path="/heroglyph" element={<Navigate to="/heroglyph/name" replace />} />
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
          <Route path="/pay-wall" element={<CheckoutScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/welcome" element={<ThankYouScreen />} />
          <Route path="/thank-you" element={<ThankYouScreen />} />{/* legacy alias for in-flight Stripe sessions */}
          <Route path="/devhome" element={<LandingPage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Pack backoffice auth — magic link callback */}
          <Route path="/login" element={<Login />} />

          {/* /pack — buyer backoffice (auth-gated) */}
          <Route path="/pack" element={<Pack />} />
          <Route path="/pack/dogs/:id" element={<PackDogDetail />} />
          <Route path="/pack/eternal" element={<PackEternal />} />
          <Route path="/pack/profile" element={<PackProfile />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
