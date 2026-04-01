import { useDogyptStore } from '@/store/dogyptStore';

// Reuse all the same asset maps from HeroglyphFrame
import dogKingSvg from '@/assets/gender/GENDER-MALE.svg';
import dogQueenSvg from '@/assets/gender/GENDER-FEMALE.svg';
import fateRaisedSvg from '@/assets/fate/FATE-RAISED.svg';
import fateRescuedSvg from '@/assets/fate/FATE-RESCUED.svg';
import bloodlineAristocratImg from '@/assets/bloodline/BLOODLINE-ARISTOCRAT.svg';
import bloodlineMuttImg from '@/assets/bloodline/BLOODLINE-MUTT.svg';
import colourBrightSvg from '@/assets/colour/COLOUR-BRIGHT.svg';
import colourDarkSvg from '@/assets/colour/COLOUR-DARK.svg';
import colourMixSvg from '@/assets/colour/COLOUR-MIX.svg';
import manSvg from '@/assets/gender/OWNER_GENDER-MAN.svg';
import womanSvg from '@/assets/gender/OWNER_GENDER-WOMAN.svg';
import ariesSvg from '@/assets/zodiac/ZODIAC-ARIES.svg';
import taurusSvg from '@/assets/zodiac/ZODIAC-TAURUS.svg';
import geminiSvg from '@/assets/zodiac/ZODIAC-GEMINI.svg';
import cancerSvg from '@/assets/zodiac/ZODIAC-CANCER.svg';
import leoSvg from '@/assets/zodiac/ZODIAC-LEO.svg';
import virgoSvg from '@/assets/zodiac/ZODIAC-VIRGO.svg';
import libraSvg from '@/assets/zodiac/ZODIAC-LIBRA.svg';
import scorpioSvg from '@/assets/zodiac/ZODIAC-SCORPIO.svg';
import sagittariusSvg from '@/assets/zodiac/ZODIAC-SAGITTARIUS.svg';
import capricornSvg from '@/assets/zodiac/ZODIAC-CAPRICORN.svg';
import aquariusSvg from '@/assets/zodiac/ZODIAC-AQUARIUS.svg';
import piscesSvg from '@/assets/zodiac/ZODIAC-PISCES.svg';
import chineseSnakeSvg from '@/assets/chinese/CHINESE_SIGN-SNAKE.svg';
import chineseDogSvg from '@/assets/chinese/CHINESE_SIGN-DOG.svg';
import chineseTigerSvg from '@/assets/chinese/CHINESE_SIGN-TIGER.svg';
import chineseHornSvg from '@/assets/chinese/CHINESE_SIGN-HORN.svg';
import chineseDragonSvg from '@/assets/chinese/CHINESE_SIGN-DRAGON.svg';
import chineseRoasterSvg from '@/assets/chinese/CHINESE_SIGN-ROASTER.svg';
import chinesePigSvg from '@/assets/chinese/CHINESE_SIGN-PIG.svg';
import chineseHorseSvg from '@/assets/chinese/CHINESE_SIGN-HORSE.svg';
import chineseRatSvg from '@/assets/chinese/CHINESE_SIGN-RAT.svg';
import chineseRabbitSvg from '@/assets/chinese/CHINESE_SIGN-RABBIT.svg';
import chineseApeSvg from '@/assets/chinese/CHINESE_SIGN-APE.svg';
import chineseGoatSvg from '@/assets/chinese/CHINESE_SIGN-GOAT.svg';
import letterA from '@/assets/letters/NAME_-A.svg';
import letterB from '@/assets/letters/NAME_-B.svg';
import letterC from '@/assets/letters/NAME_-C.svg';
import letterD from '@/assets/letters/NAME_-D.svg';
import letterE from '@/assets/letters/NAME_-E.svg';
import letterF from '@/assets/letters/NAME_-F.svg';
import letterG from '@/assets/letters/NAME_-G.svg';
import letterH from '@/assets/letters/NAME_-H.svg';
import letterI from '@/assets/letters/NAME_-I.svg';
import letterJ from '@/assets/letters/NAME_-J.svg';
import letterK from '@/assets/letters/NAME_-K.svg';
import letterL from '@/assets/letters/NAME_-L.svg';
import letterM from '@/assets/letters/NAME_-M.svg';
import letterN from '@/assets/letters/NAME_-N.svg';
import letterO from '@/assets/letters/NAME_-O.svg';
import letterP from '@/assets/letters/NAME_-P.svg';
import letterQ from '@/assets/letters/NAME-Q.svg';
import letterR from '@/assets/letters/NAME_-R.svg';
import letterS from '@/assets/letters/NAME-S.svg';
import letterT from '@/assets/letters/NAME-T.svg';
import letterU from '@/assets/letters/NAME-U.svg';
import letterV from '@/assets/letters/NAME-V.svg';
import letterW from '@/assets/letters/NAME-W.svg';
import letterX from '@/assets/letters/NAME-X.svg';
import letterY from '@/assets/letters/NAME-Y.svg';
import letterZ from '@/assets/letters/NAME-Z.svg';
import num1 from '@/assets/numbers/NUMBER-1.svg';
import num2 from '@/assets/numbers/NUMBER-2.svg';
import num3 from '@/assets/numbers/NUMBER-3.svg';
import num4 from '@/assets/numbers/NUMBER-4.svg';
import num5 from '@/assets/numbers/NUMBER-5.svg';
import num6 from '@/assets/numbers/NUMBER-6.svg';
import num7 from '@/assets/numbers/NUMBER-7.svg';
import num8 from '@/assets/numbers/NUMBER-8.svg';
import num9 from '@/assets/numbers/NUMBER-9.svg';
import num10 from '@/assets/numbers/NUMBER-10.svg';
import num11 from '@/assets/numbers/NUMBER-11.svg';

const genderMap: Record<string, string> = { man: manSvg, woman: womanSvg };
const dogGenderMap: Record<string, string> = { king: dogKingSvg, queen: dogQueenSvg };
const dogFateMap: Record<string, string> = { raised: fateRaisedSvg, rescued: fateRescuedSvg };
const dogColourMap: Record<string, string> = { bright: colourBrightSvg, dark: colourDarkSvg, mix: colourMixSvg };
const dogBloodlineMap: Record<string, string> = { aristocrat: bloodlineAristocratImg, mutt: bloodlineMuttImg };

const shapeModules = import.meta.glob('@/assets/shapes/*.svg', { eager: true, import: 'default' }) as Record<string, string>;
const dogShapeMap: Record<string, string> = {};
for (const [path, src] of Object.entries(shapeModules)) {
  const filename = path.split('/').pop()?.replace('.svg', '') || '';
  const key = filename.toLowerCase().replace(/^size[-_]/, '').replace(/[-_]\d+$/, '').replace(/^\d+[-_]/, '');
  dogShapeMap[key] = src as string;
}

const characterModules = import.meta.glob('@/assets/character/*.svg', { eager: true, import: 'default' }) as Record<string, string>;
const dogCharacterMap: Record<string, string> = {};
for (const [path, src] of Object.entries(characterModules)) {
  const filename = path.split('/').pop()?.replace('.svg', '') || '';
  const key = filename.toLowerCase().replace('character-', '');
  dogCharacterMap[key] = src as string;
}

const zodiacMap: Record<string, string> = {
  Aries: ariesSvg, Taurus: taurusSvg, Gemini: geminiSvg, Cancer: cancerSvg,
  Leo: leoSvg, Virgo: virgoSvg, Libra: libraSvg, Scorpio: scorpioSvg,
  Sagittarius: sagittariusSvg, Capricorn: capricornSvg, Aquarius: aquariusSvg, Pisces: piscesSvg,
};

const chineseMap: Record<string, string> = {
  Monkey: chineseApeSvg, Rooster: chineseRoasterSvg, Dog: chineseDogSvg,
  Pig: chinesePigSvg, Rat: chineseRatSvg, Ox: chineseHornSvg,
  Tiger: chineseTigerSvg, Rabbit: chineseRabbitSvg, Dragon: chineseDragonSvg,
  Snake: chineseSnakeSvg, Horse: chineseHorseSvg, Goat: chineseGoatSvg,
};

const letterMap: Record<string, string> = {
  A: letterA, B: letterB, C: letterC, D: letterD, E: letterE,
  F: letterF, G: letterG, H: letterH, I: letterI, J: letterJ,
  K: letterK, L: letterL, M: letterM, N: letterN, O: letterO,
  P: letterP, Q: letterQ, R: letterR, S: letterS, T: letterT,
  U: letterU, V: letterV, W: letterW, X: letterX, Y: letterY,
  Z: letterZ,
};

const numberMap: Record<string, string> = {
  '1': num1, '2': num2, '3': num3, '4': num4, '5': num5,
  '6': num6, '7': num7, '8': num8, '9': num9, '10': num10, '11': num11,
};

function SlotImage({ x, y, w, h, src }: { x: number; y: number; w: number; h: number; src?: string }) {
  if (!src) return null;
  return (
    <image
      href={src}
      x={x}
      y={y}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

interface VerticalHeroglyphFrameProps {
  className?: string;
}

export function VerticalHeroglyphFrame({ className = '' }: VerticalHeroglyphFrameProps) {
  const { selections, ownerName } = useDogyptStore();

  const ownerGenderSrc = genderMap[selections.ownerGender];
  const chineseZodiacSrc = chineseMap[selections.ownerChineseZodiac];
  const westernZodiacSrc = zodiacMap[selections.ownerZodiac];
  const ownerInitial = ownerName?.charAt(0)?.toUpperCase();
  const ownerInitialSrc = ownerInitial ? letterMap[ownerInitial] : undefined;
  const rankingSrc = numberMap[selections.ranking];

  const dogGenderSrc = dogGenderMap[selections.dogGender];
  const dogFateSrc = dogFateMap[selections.dogFate];
  const dogColourSrc = dogColourMap[selections.dogColour];
  const dogBloodlineSrc = dogBloodlineMap[selections.dogBloodline];
  const dogShapeSrc = dogShapeMap[selections.dogShape];
  const dogChar1Src = dogCharacterMap[selections.dogCharacter1];
  const dogChar2Src = dogCharacterMap[selections.dogCharacter2];

  return (
    <svg
      viewBox="0 0 2480 3504"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto' }}
    >
      {/* Inner frame (owner cartouche) */}
      <path
        d="M1551.35,2145.5c0,21.678 -17.872,39.229 -39.94,39.229l-542.91,-0c-22.08,-0 -39.941,-17.551 -39.941,-39.229l0,-370.809c0,-21.638 17.861,-39.225 39.941,-39.225l542.91,-0c22.068,-0 39.94,17.587 39.94,39.225l0,370.809Zm-13.217,-440.64l-596.353,0c-24.214,0 -43.881,19.945 -43.881,44.545l0,421.381c0,24.6 19.667,44.552 43.881,44.552l596.353,-0c24.203,-0 43.837,-19.952 43.837,-44.552l0,-421.381c0,-24.6 -19.634,-44.545 -43.837,-44.545Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Outer frame */}
      <path
        d="M1597.58,421.985l-715.32,-0c-20.346,-0 -36.85,16.492 -36.85,36.842l0.075,2586.18c-0,20.392 16.504,36.887 36.845,36.887l715.325,0c20.355,0 36.846,-16.495 36.846,-36.887l-0.075,-2586.18c0,-20.35 -16.491,-36.842 -36.846,-36.842m-759.983,-51.042l804.683,0c23.88,0 43.221,19.338 43.221,43.225l0.075,2675.54c0,23.879 -19.341,43.221 -43.221,43.221l-804.683,-0c-23.879,-0 -43.221,-19.342 -43.221,-43.221l-0.075,-2675.54c0,-23.887 19.346,-43.225 43.221,-43.225"
        fill="currentColor"
      />

      {/* Dog slots mapped to vertical layout */}
      {/* Dog Gender - top left */}
      <SlotImage x={898.453} y={475} w={323.19} h={224.091} src={dogGenderSrc} />
      {/* Dog Colour - top right */}
      <SlotImage x={1313.13} y={475} w={224.039} h={224.091} src={dogColourSrc} />
      {/* Dog Fate - middle left */}
      <SlotImage x={898.767} y={751.933} w={322.889} h={313.596} src={dogFateSrc} />
      {/* Dog Bloodline - middle right */}
      <SlotImage x={1268.43} y={751.933} w={313.561} h={312.991} src={dogBloodlineSrc} />
      {/* Dog Shape - big center */}
      <SlotImage x={898.807} y={1116.58} w={682.7} h={534.378} src={dogShapeSrc} />

      {/* Owner slots in inner cartouche */}
      {/* Owner gender - tall left */}
      <SlotImage x={948.932} y={1755.42} w={188.442} h={409.417} src={ownerGenderSrc} />
      {/* Chinese zodiac - top middle */}
      <SlotImage x={1157.84} y={1756.02} w={202.167} h={193.755} src={chineseZodiacSrc} />
      {/* Western zodiac - top right */}
      <SlotImage x={1380.51} y={1756.02} w={150.407} h={193.81} src={westernZodiacSrc} />
      {/* Owner initial - bottom middle */}
      <SlotImage x={1157.51} y={1970.04} w={202.91} h={194.803} src={ownerInitialSrc} />
      {/* Ranking - bottom right */}
      <SlotImage x={1380.51} y={1970.62} w={150.407} h={193.055} src={rankingSrc} />

      {/* Character 1 - bottom area */}
      <SlotImage x={898.459} y={2268.7} w={683.547} h={353.512} src={dogChar1Src} />
      {/* Character 2 - bottom area */}
      <SlotImage x={898.459} y={2675.15} w={683.777} h={353.396} src={dogChar2Src} />
    </svg>
  );
}
