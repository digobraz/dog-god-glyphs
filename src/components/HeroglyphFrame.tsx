import { useDogyptStore } from '@/store/dogyptStore';

// Dog gender assets
import dogKingSvg from '@/assets/gender/GENDER-MALE.svg';
import dogQueenSvg from '@/assets/gender/GENDER-FEMALE.svg';

// Dog fate assets
import fateRaisedSvg from '@/assets/fate/FATE-RAISED.svg';
import fateRescuedSvg from '@/assets/fate/FATE-RESCUED.svg';

// Dog bloodline assets
import bloodlineAristocratImg from '@/assets/bloodline/BLOODLINE-ARISTOCRAT.svg';
import bloodlineMuttImg from '@/assets/bloodline/BLOODLINE-MUTT.svg';

// Dog colour assets
import colourBrightSvg from '@/assets/colour/COLOUR-BRIGHT.svg';
import colourDarkSvg from '@/assets/colour/COLOUR-DARK.svg';
import colourMixSvg from '@/assets/colour/COLOUR-MIX.svg';

// Owner gender assets
import manSvg from '@/assets/gender/OWNER_GENDER-MAN.svg';
import womanSvg from '@/assets/gender/OWNER_GENDER-WOMAN.svg';

// Zodiac assets
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

// Chinese zodiac assets
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

// Letter assets
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

// Number assets
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

// Dog shape assets - dynamic import map
const shapeModules = import.meta.glob('@/assets/shapes/*.svg', { eager: true, import: 'default' }) as Record<string, string>;
const dogShapeMap: Record<string, string> = {};
for (const [path, src] of Object.entries(shapeModules)) {
  const filename = path.split('/').pop()?.replace('.svg', '') || '';
  const key = filename.toLowerCase().replace(/^size[-_]/, '').replace(/[-_]\d+$/, '').replace(/^\d+[-_]/, '');
  dogShapeMap[key] = src as string;
}

// Character assets - dynamic import map
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

// Padding inside each slot (percentage of slot size)
const PAD = 0.08;

function SlotImage({ x, y, w, h, src, rotate }: { x: number; y: number; w: number; h: number; src?: string; rotate?: boolean }) {
  if (!src) return null;
  const px = w * PAD;
  const py = h * PAD;
  
  if (rotate) {
    // Rotate 90° around slot center
    const cx = x + w / 2;
    const cy = y + h / 2;
    return (
      <image
        href={src}
        x={x + px}
        y={y + py}
        width={w - px * 2}
        height={h - py * 2}
        preserveAspectRatio="xMidYMid meet"
        transform={`rotate(90 ${cx} ${cy})`}
      />
    );
  }
  
  return (
    <image
      href={src}
      x={x + px}
      y={y + py}
      width={w - px * 2}
      height={h - py * 2}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}

interface HeroglyphFrameProps {
  showOwner?: boolean;
  className?: string;
  pulseSlot?: string;
}

export function HeroglyphFrame({ showOwner = false, className = '', pulseSlot }: HeroglyphFrameProps) {
  const { selections, ownerName } = useDogyptStore();

  const ownerGenderSrc = showOwner ? genderMap[selections.ownerGender] : undefined;
  const chineseZodiacSrc = showOwner ? chineseMap[selections.ownerChineseZodiac] : undefined;
  const westernZodiacSrc = showOwner ? zodiacMap[selections.ownerZodiac] : undefined;
  const ownerInitial = ownerName?.charAt(0)?.toUpperCase();
  const ownerInitialSrc = showOwner && ownerInitial ? letterMap[ownerInitial] : undefined;
  const rankingSrc = showOwner ? numberMap[selections.ranking] : undefined;

  const dogGenderSrc = dogGenderMap[selections.dogGender];
  const dogFateSrc = dogFateMap[selections.dogFate];
  const dogColourSrc = dogColourMap[selections.dogColour];
  const dogBloodlineSrc = dogBloodlineMap[selections.dogBloodline];
  const dogShapeSrc = dogShapeMap[selections.dogShape];
  const dogChar1Src = dogCharacterMap[selections.dogCharacter1];
  const dogChar2Src = dogCharacterMap[selections.dogCharacter2];

  return (
    <svg
      viewBox="0 0 14692 5696"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto' }}
    >
      {/* Inner frame (owner cartouche) */}
      <path
        d="M10870.8,3739.26c-0,104.218 -85.92,188.593 -192.014,188.593l-2610.03,0c-106.146,0 -192.014,-84.375 -192.014,-188.593l0,-1782.66c0,-104.027 85.868,-188.576 192.014,-188.576l2610.03,0c106.094,0 192.014,84.549 192.014,188.576l-0,1782.66Zm-63.542,-2118.37l-2866.96,-0c-116.406,-0 -210.955,95.885 -210.955,214.149l0,2025.78c0,118.264 94.549,214.184 210.955,214.184l2866.96,0c116.354,0 210.747,-95.92 210.747,-214.184l-0,-2025.78c-0,-118.264 -94.393,-214.149 -210.747,-214.149Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="4.17"
      />
      {/* Outer frame */}
      <path
        d="M13628.1,4142.36l-0,-2589.06c-0,-83.629 -67.778,-151.389 -151.424,-151.389l-12261.6,-0c-83.75,-0 -151.545,67.76 -151.545,151.389l-0,2589.06c-0,83.611 67.795,151.406 151.545,151.406l12261.6,0c83.646,0 151.424,-67.795 151.424,-151.406m209.687,-2772.55l0,2956.22c0,98.091 -79.479,177.604 -177.569,177.604l-12628.8,0c-98.125,0 -177.604,-79.513 -177.604,-177.604l-0,-2956.22c-0,-98.16 79.479,-177.604 177.604,-177.604l12628.8,-0c98.09,-0 177.569,79.444 177.569,177.604"
        fill="currentColor"
      />

      {/* Empty slot indicators (dashed borders for unfilled dog slots) */}
      {/* Top-left slot - Dog Gender */}
      <SlotImage x={1282} y={1620} w={1348} h={935} src={dogGenderSrc} />
      {!dogGenderSrc && <rect x="1282" y="1620" width="1348" height="935" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}
      {/* Top-middle slot - Dog Colour */}
      <SlotImage x={3034} y={1620} w={933} h={935} src={dogColourSrc} />
      {!dogColourSrc && <rect x="3034" y="1620" width="933" height="935" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}
      {/* Big center slot (patron/dog shape) */}
      <SlotImage x={4375} y={1621} w={3134} h={2453} src={dogShapeSrc} />
      {!dogShapeSrc && <rect x="4375" y="1621" width="3134" height="2453" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}
      {/* Bottom-left - Dog Fate */}
      <SlotImage x={1282} y={2764} w={1348} h={1309} src={dogFateSrc} />
      {!dogFateSrc && <rect x="1282" y="2764" width="1348" height="1309" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}
      {/* Bottom-middle - Dog Bloodline */}
      <SlotImage x={2849} y={2764} w={1307} h={1309} src={dogBloodlineSrc} />
      {!dogBloodlineSrc && <rect x="2849" y="2764" width="1307" height="1309" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}
      {/* Far right top - Character 1 */}
      <SlotImage x={11236} y={1620} w={2172} h={1117} src={dogChar1Src} />
      {!dogChar1Src && <rect x="11236" y="1620" width="2172" height="1117" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}
      {/* Far right bottom - Character 2 */}
      <SlotImage x={11236} y={2957} w={2172} h={1116} src={dogChar2Src} />
      {!dogChar2Src && <rect x="11236" y="2957" width="2172" height="1116" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}

      {/* Owner slots - filled when showOwner is true */}
      {/* Owner gender (tall left in inner frame) */}
      <SlotImage x={7974} y={1863} w={905} h={1968} src={ownerGenderSrc} />
      {!ownerGenderSrc && <rect x="7974" y="1863" width="905" height="1968" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}

      {/* Chinese zodiac (top middle in inner frame) */}
      <SlotImage x={8978} y={1866} w={971} h={931} src={chineseZodiacSrc} />
      {!chineseZodiacSrc && <rect x="8978" y="1866" width="971" height="931" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}

      {/* Western zodiac (top right in inner frame) */}
      <SlotImage x={10049} y={1866} w={723} h={931} src={westernZodiacSrc} />
      {!westernZodiacSrc && <rect x="10049" y="1866" width="723" height="931" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}

      {/* Owner initial (bottom middle in inner frame) - rotated 90° */}
      <SlotImage x={8977} y={2895} w={975} h={936} src={ownerInitialSrc} rotate />
      {!ownerInitialSrc && <rect x="8977" y="2895" width="975" height="936" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}

      {/* Ranking (bottom right in inner frame) */}
      <SlotImage x={10049} y={2898} w={723} h={933} src={rankingSrc} />
      {!rankingSrc && <rect x="10049" y="2898" width="723" height="933" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="40,20" opacity="0.2" />}

      {/* Pulsing slot indicators - only show when slot not filled */}
      {pulseSlot === 'dogGender' && !dogGenderSrc && (
        <g>
          <rect x="1282" y="1620" width="1348" height="935" fill="none" stroke="hsl(var(--primary))" strokeWidth="40" rx="30">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <text
            x={1282 + 1348 / 2}
            y={1620 + 935 / 2 + 120}
            textAnchor="middle"
            fontSize="500"
            fontFamily="'Cinzel', serif"
            fontWeight="bold"
            fill="hsl(var(--primary))"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            ?
          </text>
        </g>
      )}
      {pulseSlot === 'dogFate' && !dogFateSrc && (
        <g>
          <rect x="1282" y="2764" width="1348" height="1309" fill="none" stroke="hsl(var(--primary))" strokeWidth="40" rx="30">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <text
            x={1282 + 1348 / 2}
            y={2764 + 1309 / 2 + 120}
            textAnchor="middle"
            fontSize="500"
            fontFamily="'Cinzel', serif"
            fontWeight="bold"
            fill="hsl(var(--primary))"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            ?
          </text>
        </g>
      )}
      {pulseSlot === 'dogColour' && !dogColourSrc && (
        <g>
          <rect x="3034" y="1620" width="933" height="935" fill="none" stroke="hsl(var(--primary))" strokeWidth="40" rx="30">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <text
            x={3034 + 933 / 2}
            y={1620 + 935 / 2 + 120}
            textAnchor="middle"
            fontSize="500"
            fontFamily="'Cinzel', serif"
            fontWeight="bold"
            fill="hsl(var(--primary))"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            ?
          </text>
        </g>
      )}
      {pulseSlot === 'dogBloodline' && !dogBloodlineSrc && (
        <g>
          <rect x="2849" y="2764" width="1307" height="1309" fill="none" stroke="hsl(var(--primary))" strokeWidth="40" rx="30">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <text
            x={2849 + 1307 / 2}
            y={2764 + 1309 / 2 + 120}
            textAnchor="middle"
            fontSize="500"
            fontFamily="'Cinzel', serif"
            fontWeight="bold"
            fill="hsl(var(--primary))"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            ?
          </text>
        </g>
      )}
      {pulseSlot === 'dogShape' && !dogShapeSrc && (
        <g>
          <rect x="4375" y="1621" width="3134" height="2453" fill="none" stroke="hsl(var(--primary))" strokeWidth="40" rx="30">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </rect>
          <text
            x={4375 + 3134 / 2}
            y={1621 + 2453 / 2 + 180}
            textAnchor="middle"
            fontSize="800"
            fontFamily="'Cinzel', serif"
            fontWeight="bold"
            fill="hsl(var(--primary))"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            ?
          </text>
        </g>
      )}
    </svg>
  );
}
