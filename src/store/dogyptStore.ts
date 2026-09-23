import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Ďalší pes z kroku 3. `country: null` = berie spoločnú národnosť zo vstupu. */
export interface ExtraDog {
  /**
   * Stále id riadka. Vzniká pri pridaní psa a NIKDY sa nemení.
   * 🔴 Potrebné odkedy sa zoznam ťahá myšou (23. 9. 2026): poradie je index,
   *    a index sa pri presune zmení. Podľa indexu by si dvaja psi, ktorí si
   *    vymenia miesto, vymenili aj fotku na Cloudinary (`public_id` je adresa).
   */
  id: string;
  name: string;
  lifeStatus: 'alive' | 'deceased';
  /** yyyy-mm-dd, len pri `deceased`. */
  deathDate: string | null;
  /** yyyy-mm-dd; prázdne, kým sa nevyplní. */
  birthday: string;
  country: string | null;
  /**
   * Fotka psa — `blob:` hneď po výbere, https po nahratí na Cloudinary.
   * 🔴 Matej 23. 9. 2026: *„fotku pýtaj hneď"* ⇒ pes bez fotky NIE JE hotový.
   * Dovtedy mal každý ďalší pes namiesto tváre iniciálu a celá slučka s ňou
   * pracovala ako s fotkou (`ExtraDog nemá fotku` bol blokátor multi-módu).
   */
  photoUrl: string | null;
  /** `public_id` na Cloudinary — bez neho sa fotka nedostane na certifikát. */
  publicId: string | null;
}

/** Prázdny riadok ďalšieho psa. Jedno miesto, kde vzniká `id`. */
export const newExtraDog = (): ExtraDog => ({
  id: crypto.randomUUID(),
  name: '',
  lifeStatus: 'alive',
  deathDate: null,
  birthday: '',
  country: null,
  photoUrl: null,
  publicId: null,
});

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
  /** id rozrobeného psa v DB — drží ho e-mailový krok aj checkout, aby nevznikli dva riadky */
  draftId: string | null;
  lifeStatus: 'alive' | 'deceased';
  deathDate: string | null; // yyyy-mm-dd — len keď lifeStatus==='deceased'; zapíše sa do DB pri checkoute
  /**
   * ĎALŠÍ PSI z kroku 3 (`/heroglyph/dogs`, 28. 8. 2026). Pes #1 tu NIE JE —
   * ten žije v `dogName` / `lifeStatus` / `deathDate` / `selections.*` ako vždy.
   *
   * 🔴 ZATIAĽ SA IBA ZBIERAJÚ. Flow, platba aj certifikát ďalej bežia s prvým psom.
   * Matej 28. 8.: každý pes prejde celým flow a platí sa €11 za každého ⇒ plný
   * multi-mód (platba × N, N poradových čísel, N certifikátov) je samostatná práca
   * a krok 3 NESMIE ísť na produkciu bez nej — inak si niekto naklikal troch psov,
   * zaplatil raz a dostal jeden heroglyf.
   */
  extraDogs: ExtraDog[];
  /**
   * PORADIE V ŽIVOTE (23. 9. 2026) — dve čísla, nie jedno.
   *
   * `mainDogPos` = kde v zozname stojí pes z kroku 2 (ostatní sú `extraDogs`
   * v ich vlastnom poradí). Ťahanie ⋮⋮ mení práve toto.
   * `dogOrderStart` = koľký pes v živote je PRVÝ riadok zoznamu. Kto mal psov
   * aj predtým, ťukne na číslo a celá skupina sa posunie za ním.
   *
   * 🔴 Matej 31. 8.: *„musíme uviesť na pravú mieru poradie v živote = všetkých
   *    psov nie len aktuálnych"*. Poradie tohto zoznamu preto NIE JE poradie
   *    medzi zadanými — je to poradie v živote a ide do heroglyfu
   *    (`selections.ranking`, 12. segment kódu). Tým zaniká otázka
   *    `RankingScreen` („je to tvoj prvý pes?"), ktorá by pri troch psoch prišla
   *    trikrát a odpovedala na to, čo appka už vie zo zoznamu.
   */
  mainDogPos: number;
  dogOrderStart: number;
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
  setDraftId: (v: string | null) => void;
  setLifeStatus: (v: 'alive' | 'deceased') => void;
  setDeathDate: (v: string | null) => void;
  setExtraDogs: (v: ExtraDog[]) => void;
  setMainDogPos: (v: number) => void;
  setDogOrderStart: (v: number) => void;
  reset: () => void;
}

const freshState = () => ({
  sessionId: crypto.randomUUID(),
  dogName: '',
  extraDogs: [] as ExtraDog[],
  mainDogPos: 0,
  dogOrderStart: 1,
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
  draftId: null as string | null,
  lifeStatus: 'alive' as 'alive' | 'deceased',
  deathDate: null as string | null,
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
      setDraftId: (v) => set({ draftId: v }),
      setLifeStatus: (v) => set({ lifeStatus: v }),
      setDeathDate: (v) => set({ deathDate: v }),
      setExtraDogs: (v) => set({ extraDogs: v }),
      setMainDogPos: (v) => set({ mainDogPos: v }),
      setDogOrderStart: (v) => set({ dogOrderStart: v }),
      reset: () => set(freshState()),
    }),
    {
      name: 'dogypt-store',
      version: 4,
      // NEPERSISTOVAŤ buyer-špecifické dáta (foto, meno, email, selections, patron…).
      // Flow beží v pamäti (React Router nereloaduje medzi krokmi), /welcome ťahá
      // dáta zo servera (get-session-data). Persistencia týchto polí spôsobovala
      // leak medzi testami / kupcami na zdieľanom zariadení (stale foto + stale meno).
      // Ukladáme len neidentifikujúce preferencie.
      partialize: (state) => ({
        selectedTier: state.selectedTier,
        selectedAmount: state.selectedAmount,
      }),
      // v4: zahodiť starý plný persistovaný stav (vrátane stale foto/mena) z v≤3.
      migrate: () => ({ ...freshState() }),
    }
  )
);
