import { create } from 'zustand';

export interface DogyptState {
  dogName: string;
  ownerName: string;
  currentStep: number;
  selections: Record<string, string>;
  selectedTier: string;
  email: string;
  customCharacter: boolean;
  setDogName: (name: string) => void;
  setOwnerName: (name: string) => void;
  setStep: (step: number) => void;
  setSelection: (key: string, value: string) => void;
  setSelectedTier: (tier: string) => void;
  setEmail: (email: string) => void;
  setCustomCharacter: (val: boolean) => void;
  reset: () => void;
}

export const useDogyptStore = create<DogyptState>((set) => ({
  dogName: 'DAISY',
  ownerName: '',
  currentStep: 0,
  selections: {},
  selectedTier: 'silver',
  email: '',
  setDogName: (name) => set({ dogName: name }),
  setOwnerName: (name) => set({ ownerName: name }),
  setStep: (step) => set({ currentStep: step }),
  setSelection: (key, value) => set((state) => ({ selections: { ...state.selections, [key]: value } })),
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setEmail: (email) => set({ email }),
  reset: () => set({ dogName: '', ownerName: '', currentStep: 0, selections: {}, selectedTier: 'silver', email: '' }),
}));
