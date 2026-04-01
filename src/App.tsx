import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NameScreen } from "@/components/screens/NameScreen";
import { PhotoScreen } from "@/components/screens/PhotoScreen";
import { BreedScreen } from "@/components/screens/BreedScreen";
import { BirthdayDogScreen } from "@/components/screens/BirthdayDogScreen";
import { RankingScreen } from "@/components/screens/RankingScreen";
import { OwnerInfoScreen } from "@/components/screens/OwnerInfoScreen";
import { OwnerGenderScreen } from "@/components/screens/OwnerGenderScreen";
import { OwnerZodiacScreen } from "@/components/screens/OwnerZodiacScreen";
import { OwnerFinalScreen } from "@/components/screens/OwnerFinalScreen";
import { DogGenderScreen } from "@/components/screens/DogGenderScreen";
import { DogFateScreen } from "@/components/screens/DogFateScreen";
import { DogColourScreen } from "@/components/screens/DogColourScreen";
import { DogBloodlineScreen } from "@/components/screens/DogBloodlineScreen";
import { DogShapeScreen } from "@/components/screens/DogShapeScreen";
import { DogCharacterScreen } from "@/components/screens/DogCharacterScreen";
import { HeroglyphRevealScreen } from "@/components/screens/HeroglyphRevealScreen";
import { PayWallScreen } from "@/components/screens/PayWallScreen";
import { PaymentScreen } from "@/components/screens/PaymentScreen";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NameScreen />} />
          <Route path="/name" element={<NameScreen />} />
          <Route path="/photo" element={<PhotoScreen />} />
          <Route path="/breed" element={<BreedScreen />} />
          <Route path="/birthday-dog" element={<BirthdayDogScreen />} />
          <Route path="/ranking" element={<RankingScreen />} />
          <Route path="/owner-name" element={<OwnerInfoScreen />} />
          <Route path="/owner-gender" element={<OwnerGenderScreen />} />
          <Route path="/owner-zodiac" element={<OwnerZodiacScreen />} />
          <Route path="/owner-final" element={<OwnerFinalScreen />} />
          <Route path="/dog-gender" element={<DogGenderScreen />} />
          <Route path="/dog-fate" element={<DogFateScreen />} />
          <Route path="/dog-colour" element={<DogColourScreen />} />
          <Route path="/dog-bloodline" element={<DogBloodlineScreen />} />
          <Route path="/dog-shape" element={<DogShapeScreen />} />
          <Route path="/dog-character" element={<DogCharacterScreen />} />
          <Route path="/heroglyph-reveal" element={<HeroglyphRevealScreen />} />
          <Route path="/pay-wall" element={<PayWallScreen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
