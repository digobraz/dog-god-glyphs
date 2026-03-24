import { useDogyptStore } from '@/store/dogyptStore';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { DogNameScreen } from '@/components/screens/DogNameScreen';
import { WizardScreen } from '@/components/screens/WizardScreen';
import { RevealScreen } from '@/components/screens/RevealScreen';
import { VisionScreen } from '@/components/screens/VisionScreen';
import { PricingScreen } from '@/components/screens/PricingScreen';
import { ConfirmationScreen } from '@/components/screens/ConfirmationScreen';

const Index = () => {
  const currentStep = useDogyptStore(s => s.currentStep);

  if (currentStep === 0) return <WelcomeScreen />;
  if (currentStep === 1) return <DogNameScreen />;
  if (currentStep >= 2 && currentStep <= 13) return <WizardScreen />;
  if (currentStep === 14) return <RevealScreen />;
  if (currentStep === 15) return <VisionScreen />;
  if (currentStep === 16) return <PricingScreen />;
  if (currentStep === 17) return <ConfirmationScreen />;

  return <WelcomeScreen />;
};

export default Index;
