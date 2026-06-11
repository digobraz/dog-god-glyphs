// Heroglyph attribute symbols (dog) — pure data module, NO component (Vite Fast
// Refresh safe). Mirrors the maps in components/HeroglyphFrame.tsx so the profile
// can show the same hand-drawn symbol next to each basic-info fact.
// Keys match selections.* values from the flow.

// Gender
import genderMale from '@/assets/gender/GENDER-MALE.svg';
import genderFemale from '@/assets/gender/GENDER-FEMALE.svg';
// Fate (destiny)
import fateRaised from '@/assets/fate/FATE-RAISED.svg';
import fateRescued from '@/assets/fate/FATE-RESCUED.svg';
// Colour
import colourBright from '@/assets/colour/COLOUR-BRIGHT.svg';
import colourDark from '@/assets/colour/COLOUR-DARK.svg';
import colourMix from '@/assets/colour/COLOUR-MIX.svg';
// Bloodline (mutt / purebred)
import bloodlineAristocrat from '@/assets/bloodline/BLOODLINE-ARISTOCRAT.svg';
import bloodlineMutt from '@/assets/bloodline/BLOODLINE-MUTT.svg';
// Shape (breed silhouette)
import shapeChiuaua from '@/assets/shapes/SIZE-CHIUAUA_1.svg';
import shapeYork from '@/assets/shapes/SIZE-YORK_2.svg';
import shapeBichon from '@/assets/shapes/SIZE-BICHON_3.svg';
import shapeDachshund from '@/assets/shapes/SIZE-DACHSHUND_4.svg';
import shapeFrenchie from '@/assets/shapes/SIZE-FRENCHIE_5.svg';
import shapeJRusell from '@/assets/shapes/SIZE-J.RUSELL_6.svg';
import shapeBeagle from '@/assets/shapes/SIZE-BEAGLE_7.svg';
import shapeCoker from '@/assets/shapes/SIZE-COKER_8.svg';
import shapeBorder from '@/assets/shapes/SIZE-BORDER_9.svg';
import shapeStaford from '@/assets/shapes/SIZE-STAFORD_10.svg';
import shapeHound from '@/assets/shapes/SIZE-HOUND_11.svg';
import shapeOtterhound from '@/assets/shapes/SIZE-OTTERHOUND_12.svg';
import shapeSchnauzer from '@/assets/shapes/SIZE-SCHNAUZER_13.svg';
import shapeBloodhound from '@/assets/shapes/SIZE-BLOODHOUND_14.svg';
import shapeSetter from '@/assets/shapes/SIZE-SETTER_15.svg';
import shapeGreyhound from '@/assets/shapes/SIZE_16-GREYHOUND.svg';
import shapeLabrador from '@/assets/shapes/SIZE_17-LABRADOR.svg';
import shapeGerman from '@/assets/shapes/SIZE_18-GERMAN.svg';
import shapePoodle from '@/assets/shapes/SIZE_19-POODLE.svg';
import shapeBoxer from '@/assets/shapes/SIZE_20-BOXER.svg';
import shapeBarbet from '@/assets/shapes/SIZE_21-BARBET.svg';
import shapeMalamute from '@/assets/shapes/SIZE_22-MALAMUTE.svg';
import shapeGreatDane from '@/assets/shapes/SIZE_23-GREAT_DANE.svg';
import shapeChuvach from '@/assets/shapes/SIZE_24-CHUVACH.svg';
import shapeAssian from '@/assets/shapes/SIZE_25-ASSIAN.svg';
import shapeBull from '@/assets/shapes/SIZE_26-BULL_3.svg';
import shapeRottweiler from '@/assets/shapes/SIZE_-_ROTTWEILER.svg';
import shapeDobermann from '@/assets/shapes/SIZE_-_DOBERMANN.svg';
import shapeMaltese from '@/assets/shapes/SIZE_-_MALTESE.svg';
import shapeSamoyed from '@/assets/shapes/SIZE018_-_SAMOYED.svg';

export const dogGenderMap: Record<string, string> = { king: genderMale, queen: genderFemale };
export const dogFateMap: Record<string, string> = { raised: fateRaised, rescued: fateRescued };
export const dogColourMap: Record<string, string> = { bright: colourBright, dark: colourDark, mix: colourMix };
export const dogBloodlineMap: Record<string, string> = { aristocrat: bloodlineAristocrat, mutt: bloodlineMutt };
export const dogShapeMap: Record<string, string> = {
  chiuaua: shapeChiuaua, york: shapeYork, bichon: shapeBichon, dachshund: shapeDachshund,
  frenchie: shapeFrenchie, j_rusell: shapeJRusell, beagle: shapeBeagle, coker: shapeCoker,
  border: shapeBorder, staford: shapeStaford, hound: shapeHound, otterhound: shapeOtterhound,
  schnauzer: shapeSchnauzer, bloodhound: shapeBloodhound, setter: shapeSetter,
  greyhound: shapeGreyhound, labrador: shapeLabrador, german: shapeGerman, poodle: shapePoodle,
  boxer: shapeBoxer, barbet: shapeBarbet, malamute: shapeMalamute, great_dane: shapeGreatDane,
  chuvach: shapeChuvach, assian: shapeAssian, bull: shapeBull, rottweiler: shapeRottweiler,
  dobermann: shapeDobermann, maltese: shapeMaltese, samoyed: shapeSamoyed,
};

// Readable labels for the flow's coded values.
export const GENDER_LABEL: Record<string, string> = { king: 'Male', queen: 'Female' };
export const COLOUR_LABEL: Record<string, string> = { bright: 'Light', dark: 'Dark', mix: 'Mixed' };
export const BLOODLINE_LABEL: Record<string, string> = { aristocrat: 'Purebred', mutt: 'Mutt' };
export const FATE_LABEL: Record<string, string> = { raised: 'Raised', rescued: 'Rescued' };
