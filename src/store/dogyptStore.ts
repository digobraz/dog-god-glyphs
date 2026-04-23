import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DogyptState {
  dogName: string;
  ownerName: string;
  currentStep: number;
  selections: Record<string, string>;
  selectedTier: string;
  email: string;
  customCharacter: boolean;
  selectedAmount: number;
  dogPhotoUrl: string;
  setDogName: (name: string) => void;
  setOwnerName: (name: string) => void;
  setStep: (step: number) => void;
  setSelection: (key: string, value: string) => void;
  setSelectedTier: (tier: string) => void;
  setEmail: (email: string) => void;
  setCustomCharacter: (val: boolean) => void;
  setSelectedAmount: (amount: number) => void;
  setDogPhotoUrl: (url: string) => void;
  reset: () => void;
}

export const useDogyptStore = create<DogyptState>()(
  persist(
    (set) => ({
      dogName: 'DAISY',
      ownerName: '',
      currentStep: 0,
      selections: {},
      selectedTier: 'silver',
      email: '',
      customCharacter: false,
      selectedAmount: 11,
      dogPhotoUrl: '',
      setDogName: (name) => set({ dogName: name }),
      setOwnerName: (name) => set({ ownerName: name }),
      setStep: (step) => set({ currentStep: step }),
      setSelection: (key, value) => set((state) => ({ selections: { ...state.selections, [key]: value } })),
      setSelectedTier: (tier) => set({ selectedTier: tier }),
      setEmail: (email) => set({ email }),
      setCustomCharacter: (val) => set({ customCharacter: val }),
      setSelectedAmount: (amount) => set({ selectedAmount: amount }),
      setDogPhotoUrl: (url) => set({ dogPhotoUrl: url }),
      reset: () => set({
        dogName: '',
        ownerName: '',
        currentStep: 0,
        selections: {},
        selectedTier: 'silver',
        email: '',
        customCharacter: false,
        selectedAmount: 11,
        dogPhotoUrl: '',
      }),
    }),
    { name: 'dogypt-store' }
  )
);
