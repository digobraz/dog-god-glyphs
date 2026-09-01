import imageCompression from 'browser-image-compression';
import { uploadMainPhoto } from '@/services/cloudinaryService';
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
export function intakePhoto(file: File): PhotoIntake {
  const s = useDogyptStore.getState();
  const prev = s.dogPhotoUrl;

  const previewUrl = URL.createObjectURL(file);
  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
  s.setDogPhotoUrl(previewUrl);

  const uploaded = compressFile(file)
    .then(({ url, blob }) => {
      // Komprimovaný náhľad nikto nezobrazuje — potrebujeme z neho len dáta.
      URL.revokeObjectURL(url);
      return uploadMainPhoto(blob, s.sessionId);
    })
    .then(({ publicId, secureUrl }) => {
      const st = useDogyptStore.getState();
      st.setCloudinaryPublicId(publicId);
      // ⚠️ Prepíš len vtedy, keď v store stále leží TÁTO fotka. Kto medzitým
      // vybral inú, nesmie dostať späť adresu tej starej.
      if (st.dogPhotoUrl === previewUrl) st.setDogPhotoUrl(secureUrl);
      return secureUrl;
    })
    .catch(() => null);

  return { previewUrl, uploaded };
}
