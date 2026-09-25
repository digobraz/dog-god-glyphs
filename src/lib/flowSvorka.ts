import { useDogyptStore, MAIN_DOG_ID } from '@/store/dogyptStore';
import { buildHeroglyphCode, countryISO3 } from '@/lib/heroglyphCode';

// ════════════════════════════════════════════════════════════════════════════
// SVORKA NA PLATBU — jeden pes = jeden riadok `dogs` (25. 9. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 25. 9. 2026: *„musíme implementovať"* (platba za N psov). Dovtedy
// `PaymentScreen` posielal JEDNÉHO psa zo `selections` a `create-checkout` mal
// `quantity: 1` — kto si v kroku 3 nahodil troch psov, zaplatil raz a dostal
// jeden heroglyf.
//
// 🔑 CENA JE NA PSA, NIE NA NÁKUP: €11 člen · €1 psí anjel (Matej 25. 9.:
//    *„v pokladni stojí €11 a dá sa prepnúť na €1"* + anjel dostane PLNÉ
//    členstvo). Server cenu overí sám — €1 pustí len psovi so stavom
//    `deceased`, inak ju zdvihne na €11.
//
// 🐕 ÚDAJE PSA. Prvý pes má odpovede v `selections`, ostatní v `dogEssence`.
//    Zlievajú sa rovnako ako na ODHALENÍ (`FlowRevealScreen.verticalData`):
//    `{ ...selections, ...essence }` — teda presne to, čo človek videl v ráme.
//    ⚠️ Kľúč, ktorý ďalší pes v `dogEssence` nemá, preto zdedí od prvého psa.
//       Kým flow pýta všetko na psa (kroky 5–7), nič také nenastane.
// ════════════════════════════════════════════════════════════════════════════

export const PRICE_MEMBER = 11;
export const PRICE_ANGEL = 1;
/** €3 = príspevok ZA PSA (Matej 25. 9. 2026), nie za nákup. Server ho drží sám. */
export const PRICE_SUPPORT = 3;
const PHOTO_TIMEOUT_MS = 12_000;

export interface SvorkaDog {
  /** Id v obchode (`MAIN_DOG_ID` alebo `ExtraDog.id`) — nie id riadka v DB. */
  flowId: string;
  dogName: string;
  photo: string | null;
  lifeStatus: 'alive' | 'deceased';
  deathDate: string | null;
  selections: Record<string, string>;
  patronSvg: string;
}

/** Psi v poradí z kroku 3 (ten istý výpočet ako `useFlowDogs`), s dátami na platbu. */
export function readSvorka(): SvorkaDog[] {
  const s = useDogyptStore.getState();
  const main: SvorkaDog = {
    flowId: MAIN_DOG_ID,
    dogName: s.dogName,
    photo: s.dogPhotoUrl || null,
    lifeStatus: s.lifeStatus,
    deathDate: s.deathDate,
    selections: { ...s.selections, ...(s.dogEssence[MAIN_DOG_ID] || {}) },
    patronSvg: s.dogEssence[MAIN_DOG_ID]?.patronSvg || s.patronSvg,
  };
  const rest: SvorkaDog[] = s.extraDogs.map((d) => {
    const ess = s.dogEssence[d.id] || {};
    const [y, m, day] = (d.birthday || '').split('-');
    return {
      flowId: d.id,
      dogName: d.name,
      photo: d.photoUrl,
      lifeStatus: d.lifeStatus,
      deathDate: d.deathDate,
      selections: {
        ...s.selections,
        ...ess,
        ...(y ? { birthdayYear: y, birthdayMonth: m || '01', birthdayDay: day || '01' } : {}),
        ...(d.country ? { country: d.country } : {}),
      },
      patronSvg: ess.patronSvg || '',
    };
  });
  const at = Math.max(0, Math.min(s.mainDogPos, rest.length));
  return [...rest.slice(0, at), main, ...rest.slice(at)];
}

/** Telo jedného psa pre `create-checkout` (pole `dogs`). */
export function svorkaDogPayload(d: SvorkaDog, ownerName: string, amount: number) {
  const iso3 = countryISO3(d.selections.country);
  return {
    dogName: d.dogName,
    selections: d.selections,
    dogPhotoUrl: d.photo && !d.photo.startsWith('blob:') ? d.photo : null,
    patronSvg: d.patronSvg || null,
    breed: d.selections.breed || undefined,
    country: iso3 !== 'XXX' ? iso3 : undefined,
    heroglyphCode: buildHeroglyphCode({
      dogName: d.dogName,
      ownerName,
      patronSvg: d.patronSvg,
      breed: d.selections.breed,
      patronCategory: d.selections.patronCategory,
      country: d.selections.country,
      selections: d.selections,
    }),
    lifeStatus: d.lifeStatus,
    deathDate: d.deathDate,
    amount,
  };
}

/** Fotky sa na Cloudinary nahrávajú na pozadí; `blob:` v DB je mŕtvy obrázok na stene. */
export async function waitForStablePhotos(): Promise<SvorkaDog[]> {
  const start = Date.now();
  while (Date.now() - start < PHOTO_TIMEOUT_MS) {
    const dogs = readSvorka();
    if (!dogs.some((d) => d.photo?.startsWith('blob:'))) return dogs;
    await new Promise((r) => setTimeout(r, 200));
  }
  return readSvorka();
}
