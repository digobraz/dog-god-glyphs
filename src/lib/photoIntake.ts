import imageCompression from 'browser-image-compression';
import { uploadMainPhoto, withTransform, type CloudinaryResult } from '@/services/cloudinaryService';
import { useDogyptStore } from '@/store/dogyptStore';

/**
 * PRÍCHOD FOTKY DO PRODUKTU — jedno miesto pre všetky vstupy.
 *
 * Fotku dnes prijímajú tri povrchy: dlaždica na stene (`GodsGridLab`), dlaždica
 * na guli (`DogPlanetLab`) a prvý krok flow (`PhotoScreen`). Kým to robil každý
 * po svojom, dva z nich fotku na Cloudinary **vôbec nenahrali** — niesli len
 * `blob:` adresu, ktorá žije len v tom jednom tabe.
 *
 * 🔴 PREČO NA TOM ZÁLEŽÍ: `blob:` prežije prechod medzi obrazovkami, ale nie
 * reload, iné zariadenie ani server. Kto vstúpil cez stenu a odišiel v polovici
 * flow, nemal fotku NIKDE — hoci ju už dal. Do drafta rozrobeného psa sa navyše
 * dostávala ako mŕtvy odkaz (opravené 28. 8. v `checkoutDraft.ts`), takže mail
 * na dokončenie by ukazoval prázdny obdĺžnik.
 *
 * Preto sa nahrávanie spúšťa v tej istej sekunde, ako človek fotku vyberie, a
 * beží na pozadí: kým číta popup a píše meno psa, súbor je hore. `PaymentScreen`
 * má proti blobu 12-sekundovú stráž, ale tá lieči následok, nie príčinu.
 */

/**
 * Zmenšenie pred nahraním. Hodnoty sú pôvodné z `PhotoScreen` (0,4 MB / 1200 px /
 * webp / q 0.85) — sem sa presťahovali, aby všetky vstupy komprimovali rovnako.
 * ⚠️ `exifOrientation: 1` je zámerné: knižnica otočí pixely podľa EXIF a značku
 * zahodí, inak by prehliadač otočil fotku druhýkrát.
 */
export async function compressFile(file: File): Promise<{ url: string; blob: Blob }> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1200,
    fileType: 'image/webp',
    initialQuality: 0.85,
    useWebWorker: true,
    exifOrientation: 1,
  });
  return { url: URL.createObjectURL(compressed), blob: compressed };
}

export type PhotoIntake = {
  /** Adresa na okamžitý náhľad. Do storu je zapísaná už teraz. */
  previewUrl: string;
  /** Dobehne, keď je fotka na Cloudinary. `null` = nahrávanie zlyhalo. */
  uploaded: Promise<string | null>;
};

/**
 * KAM FOTKA PATRÍ (23. 9. 2026).
 *
 * Od kroku 3 má fotku aj KAŽDÝ ĎALŠÍ PES svorky, nielen ten hlavný. Cieľ je
 * preto parameter, nie natvrdo `dogPhotoUrl` — celý zvyšok (kompresia, poradie
 * zápisov, kontrola „leží tam stále TÁTO fotka", výrez) ostáva JEDEN.
 *
 * 🔴 Dve kópie tejto postupnosti by sa rozišli pri prvej úprave — presne to je
 *    dôvod, pre ktorý tento súbor vznikol (tri povrchy, dva z nich nenahrávali).
 */
export type PhotoTarget = {
  /** Čo v cieli leží teraz. Číta sa ZO STORE, nie zo zachyteného stavu. */
  read: () => string | null;
  write: (url: string) => void;
  writePublicId: (id: string) => void;
  upload: (blob: Blob, sessionId: string) => Promise<CloudinaryResult>;
};

/** Cieľ „hlavný pes" — polia, ktoré niesli fotku odjakživa. */
export const mainPhotoTarget = (): PhotoTarget => ({
  read: () => useDogyptStore.getState().dogPhotoUrl || null,
  write: (url) => useDogyptStore.getState().setDogPhotoUrl(url),
  writePublicId: (id) => useDogyptStore.getState().setCloudinaryPublicId(id),
  upload: uploadMainPhoto,
});

/**
 * Prijmi súbor: ukáž HNEĎ → zapíš do storu → skomprimuj a nahraj na pozadí.
 *
 * 🔴 NÁHĽAD JE PÔVODNÝ SÚBOR, NIE VÝSTUP KOMPRESIE — a je to zámer, nie lenivosť.
 * Kompresia telefónnej fotky trvá stovky milisekúnd; keby sa na ňu čakalo, medzi
 * zavretím systémového dialógu a našou kartou by bola tichá diera presne v tom
 * okamihu, keď má človek prvýkrát niečo vidieť. Komprimovaný výstup je navyše
 * DRUHÁ blob adresa — vymieňať ju pod už vykresleným `<img>` znamená buď blikot,
 * alebo uvoľnenie adresy, ktorú niekto ešte drží.
 *
 * ⚠️ Store sa preto prepisuje dvakrát (najprv blob, potom https). Kto si adresu
 * prečíta medzitým, dostane blob — nikde sa nesmie ukladať bez kontroly na `blob:`.
 *
 * ⚠️ Uvoľňuje sa len blob PREDOŠLEJ fotky (výmena). Pri odchode z obrazovky nie:
 * odchod je práve to kliknutie na POKRAČOVAŤ a flow drží tú istú adresu.
 */
export function intakePhoto(file: File, target: PhotoTarget = mainPhotoTarget()): PhotoIntake {
  const sessionId = useDogyptStore.getState().sessionId;
  const prev = target.read();

  const previewUrl = URL.createObjectURL(file);
  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
  target.write(previewUrl);

  const uploaded = compressFile(file)
    .then(({ url, blob }) => {
      // Komprimovaný náhľad nikto nezobrazuje — potrebujeme z neho len dáta.
      URL.revokeObjectURL(url);
      return target.upload(blob, sessionId);
    })
    .then(({ publicId, secureUrl }) => {
      target.writePublicId(publicId);
      // ⚠️ Prepíš len vtedy, keď v cieli stále leží TÁTO fotka. Kto medzitým
      // vybral inú, nesmie dostať späť adresu tej starej.
      if (target.read() === previewUrl) target.write(secureUrl);
      return secureUrl;
    })
    .catch(() => null);

  return { previewUrl, uploaded };
}

// ═══════════════════════════════════════════════════════════════════════════
// VÝREZ Z POPUPU (23. 9. 2026)
//
// Popup (`photoConfirm.ts`) vráti pri CONTINUE buď obdĺžnik, alebo `null`.
// `null` znamená „človek sa fotky nedotkol" — a to NIE JE to isté ako stredový
// výrez. Vtedy orezáva Cloudinary gravitáciou `g_auto`, ktorá nájde psa;
// dnešné `c_fill` je bez nej, takže ležatej fotke ukrojí hlavu.
//
// ⚠️ ORIGINÁL SA NEPREPISUJE. Nahráva sa druhý súbor a store dostane jeho
//    adresu — pôvodná fotka ostáva na Cloudinary nedotknutá, takže sa dá
//    k výrezu vrátiť (dnes to nikto nerobí, ale zahodiť originál je nevratné).
// ═══════════════════════════════════════════════════════════════════════════

/** Štvorcový výrez v pixeloch pôvodného obrázka (zhodný s `PhotoCropRect`). */
export type CropRect = { sx: number; sy: number; size: number };

/** Hrana orezanej fotky. 1200 je tá istá hodnota, akou zmenšuje `compressFile`. */
const CROP_SIDE = 1200;

/**
 * Dokonči voľbu fotky po zavretí popupu.
 *
 * `rect === null` → počká na nahranie originálu a nasadí automatický výrez.
 * Inak oreže lokálne na štvorec a nahrá výsledok. Oboje beží na pozadí: človek
 * medzitým píše meno psa a fotku znova uvidí až o niekoľko krokov ďalej.
 */
export async function finishPhotoChoice(
  rect: CropRect | null,
  uploaded?: Promise<string | null>,
  target: PhotoTarget = mainPhotoTarget(),
): Promise<void> {
  const sessionId = useDogyptStore.getState().sessionId;

  if (!rect) {
    const url = (await uploaded) ?? null;
    if (!url) return;
    if (target.read() === url) target.write(autoSquareUrl(url));
    return;
  }

  try {
    const src = target.read();
    if (!src) return;
    const blob = await cropToSquare(src, rect);
    if (!blob) return;
    const preview = URL.createObjectURL(blob);
    const prev = target.read();
    target.write(preview);
    if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);

    const { publicId, secureUrl } = await target.upload(blob, sessionId);
    target.writePublicId(publicId);
    if (target.read() === preview) target.write(secureUrl);
  } catch (err) {
    // Nepodarený výrez nesmie zastaviť vstup — pôvodná fotka je použiteľná.
    console.error('[photo] výrez z popupu zlyhal, ostáva pôvodná fotka:', err);
  }
}

/** Automatický štvorcový výrez, ktorý na rozdiel od `c_fill` pozná psa. */
export const autoSquareUrl = (url: string): string =>
  withTransform(url, `c_fill,g_auto,w_${CROP_SIDE},h_${CROP_SIDE},f_auto,q_auto`);

/** Oreže obrázok na štvorec podľa obdĺžnika v pixeloch originálu. */
export async function cropToSquare(src: string, rect: CropRect): Promise<Blob | null> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    // Zdrojom je blob aj https (Cloudinary) — bez `crossOrigin` by bolo plátno
    // znečistené a `toBlob` by ticho vrátil chybu. Tá istá poznámka je v
    // `photoCrop.ts` a je to jediná pasca, na ktorej tu ide zlyhať všetko.
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });

  const side = Math.min(CROP_SIDE, Math.round(rect.size));
  const cv = document.createElement('canvas');
  cv.width = side;
  cv.height = side;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, rect.sx, rect.sy, rect.size, rect.size, 0, 0, side, side);
  return new Promise((resolve) => cv.toBlob((b) => resolve(b), 'image/webp', 0.85));
}
