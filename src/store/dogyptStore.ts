import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DogyptState {
  sessionId: string;
  dogName: string;
  ownerName: string;
  currentStep: number;
  selections: Record<string, string>;
  selectedTier: string;
  email: string;
  selectedAmount: number;
  dogPhotoUrl: string;
  cloudinaryPublicId: string;
  cloudinaryExtraPublicIds: string[];
  patronCategory: string;
  patronSvg: string;
  breed: string;
  isMix: boolean;
  patronCategory2: string;
  patronSvg2: string;
  certCropData: { x: number; y: number; zoom: number } | null;
  gridCropData: { x: number; y: number; zoom: number } | null;
  extraPhotos: string[];
  gdprConsent: boolean;
  setDogName: (name: string) => void;
  setOwnerName: (name: string) => void;
  setStep: (step: number) => void;
  setSelection: (key: string, value: string) => void;
  setSelectedTier: (tier: string) => void;
  setEmail: (email: string) => void;
  setSelectedAmount: (amount: number) => void;
  setDogPhotoUrl: (url: string) => void;
  setCloudinaryPublicId: (id: string) => void;
  setCloudinaryExtraPublicIds: (ids: string[]) => void;
  setPatronCategory: (v: string) => void;
  setPatronSvg: (v: string) => void;
  setBreed: (v: string) => void;
  setIsMix: (v: boolean) => void;
  setPatronCategory2: (v: string) => void;
  setPatronSvg2: (v: string) => void;
  setCertCropData: (v: { x: number; y: number; zoom: number } | null) => void;
  setGridCropData: (v: { x: number; y: number; zoom: number } | null) => void;
  setExtraPhotos: (v: string[]) => void;
  setGdprConsent: (v: boolean) => void;
  reset: () => void;
}

const freshState = () => ({
  sessionId: crypto.randomUUID(),
  dogName: '',
  ownerName: '',
  currentStep: 0,
  selections: {} as Record<string, string>,
  selectedTier: 'silver',
  email: '',
  selectedAmount: 11,
  dogPhotoUrl: '',
  cloudinaryPublicId: '',
  cloudinaryExtraPublicIds: [] as string[],
  patronCategory: '',
  patronSvg: '',
  breed: '',
  isMix: false,
  patronCategory2: '',
  patronSvg2: '',
  certCropData: null,
  gridCropData: null,
  extraPhotos: [] as string[],
  gdprConsent: false,
});

export const useDogyptStore = create<DogyptState>()(
  persist(
    (set) => ({
      ...freshState(),
      setDogName: (name) => set({ dogName: name }),
      setOwnerName: (name) => set({ ownerName: name }),
      setStep: (step) => set({ currentStep: step }),
      setSelection: (key, value) => set((state) => ({ selections: { ...state.selections, [key]: value } })),
      setSelectedTier: (tier) => set({ selectedTier: tier }),
      setEmail: (email) => set({ email }),
      setSelectedAmount: (amount) => set({ selectedAmount: amount }),
      setDogPhotoUrl: (url) => set({ dogPhotoUrl: url }),
      setCloudinaryPublicId: (id) => set({ cloudinaryPublicId: id }),
      setCloudinaryExtraPublicIds: (ids) => set({ cloudinaryExtraPublicIds: ids }),
      setPatronCategory: (v) => set({ patronCategory: v }),
      setPatronSvg: (v) => set({ patronSvg: v }),
      setBreed: (v) => set({ breed: v }),
      setIsMix: (v) => set({ isMix: v }),
      setPatronCategory2: (v) => set({ patronCategory2: v }),
      setPatronSvg2: (v) => set({ patronSvg2: v }),
      setCertCropData: (v) => set({ certCropData: v }),
      setGridCropData: (v) => set({ gridCropData: v }),
      setExtraPhotos: (v) => set({ extraPhotos: v }),
      setGdprConsent: (v) => set({ gdprConsent: v }),
      reset: () => set(freshState()),
    }),
    {
      name: 'dogypt-store',
      version: 3,
      migrate: () => freshState(),
    }
  )
);
