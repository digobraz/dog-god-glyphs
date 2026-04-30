import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LandingPage } from "@/components/landing/LandingPage";
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
import { PayWallScreen } from "@/components/screens/PayWallScreen";
import { MessageScreen } from "@/components/screens/MessageScreen";
import { PaymentSummaryScreen } from "@/components/screens/PaymentSummaryScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import { ThankYouScreen } from "@/components/screens/ThankYouScreen";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GodsGrid />} />
          <Route path="/name" element={<NameScreen />} />
          <Route path="/photo" element={<PhotoScreen />} />
          <Route path="/breed" element={<BreedPatronScreen />} />
          <Route path="/ranking" element={<RankingScreen />} />
          <Route path="/owner-info" element={<OwnerInfoScreen />} />
          <Route path="/owner-zodiac" element={<OwnerZodiacScreen />} />
          <Route path="/owner-final" element={<OwnerFinalScreen />} />
          <Route path="/dog-gender" element={<DogGenderScreen />} />
          <Route path="/dog-fate" element={<DogFateScreen />} />
          <Route path="/dog-colour" element={<DogColourScreen />} />
          <Route path="/dog-bloodline" element={<DogBloodlineScreen />} />
          <Route path="/dog-character" element={<DogCharacterScreen />} />
          <Route path="/heroglyph-reveal" element={<HeroglyphRevealScreen />} />
          <Route path="/message" element={<MessageScreen />} />
          <Route path="/pay-wall" element={<PayWallScreen />} />
          <Route path="/payment-summary" element={<PaymentSummaryScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/thank-you" element={<ThankYouScreen />} />
          <Route path="/devhome" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
