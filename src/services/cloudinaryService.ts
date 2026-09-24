import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
const BASE_URL = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;
const RAW_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD}/raw/upload`;

export type CloudinaryResult = { publicId: string; secureUrl: string };

async function uploadBlob(blob: Blob, folder: string, publicId: string): Promise<CloudinaryResult> {
  const fd = new FormData();
  fd.append('file', blob, `${publicId}.webp`);
  fd.append('upload_preset', PRESET);
  fd.append('folder', folder);
  fd.append('public_id', publicId);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary ${res.status}: ${err}`);
  }
  const json = await res.json();
  return { publicId: json.public_id, secureUrl: json.secure_url };
}

// 🔴 `tmp/` KLAME — pre platiacich členov je to TRVALÉ ÚLOŽISKO. Fotka sa nahráva pred
//    platbou (vtedy ešte niet `dogId`, len session id) a po platbe ju NIKTO nepresúva:
//    premerané 23. 9. 2026 má **71 zo 72 platiacich psov** `cloudinary_main_url` v `tmp/`
//    (zvyšných 78 riadkov z celkových 149 sú nedokončené koncepty). Všetky dnes vracajú 200.
// 🔴 **NIKDY nenapíš „upratovanie" priečinka `tmp/`** — zmazalo by hlavné fotky platiacich
//    členov na WALL, v DOG ID aj v share kartách. Kým sa platené fotky neodsťahujú
//    (Cloudinary `rename` pri platbe + PATCH `cloudinary_main_url`), sú koncept a člen
//    v jednom vreci a od seba sa podľa cesty rozoznať NEDAJÚ.
export const uploadMainPhoto = (blob: Blob, sessionId: string) =>
  uploadBlob(blob, `tmp/${sessionId}`, 'main');

export const uploadCroppedPhoto = (blob: Blob, sessionId: string) =>
  uploadBlob(blob, `tmp/${sessionId}`, 'main_crop');

export const uploadExtraPhoto = (blob: Blob, sessionId: string, index: number) =>
  uploadBlob(blob, `tmp/${sessionId}/extras`, String(index).padStart(2, '0'));

// Fotka ĎALŠIEHO PSA zo svorky (krok 3 vstupu, 23. 9. 2026).
// 🔴 VLASTNÝ PRIEČINOK A ID PSA V NÁZVE, nie poradové číslo. `extras/` už nesie
//    galériu hlavného psa (`uploadExtraPhoto`, indexuje od 1) — to isté číslo by
//    jednu z fotiek ticho prepísalo, lebo `public_id` je ADRESA, nie meno súboru.
//    A poradie sa v zozname ťahá myšou: dvaja psi, ktorí si vymenia miesto, by si
//    pri ďalšom nahratí vymenili aj fotky.
export const uploadPackDogPhoto = (blob: Blob, sessionId: string, dogId: string) =>
  uploadBlob(blob, `tmp/${sessionId}/pack`, dogId);

// Member-submitted trip photos (issue #32 fáza F5, packStore.ts `pack_trips` write-through).
// `payload.photos` v DB nesmie niesť base64 — sem idú predtým, než sa riadok upsertne.
// Cesta zámerne `pack-trips/<slug>/...`, NIE `trails/<slug>/...` — ten priečinok už nesie fotky
// 77 kurátorovaných tripov (slug tam nemožno premenovať, viď CLAUDE.md), kolízia by ich prepísala.
export const uploadPackTripPhoto = (blob: Blob, slug: string, index: number) =>
  uploadBlob(blob, `pack-trips/${slug}`, String(index).padStart(2, '0'));

// Fotka priložená k zápisu do denníka psa (KROK 5, `components/pack/diary/`).
// ⚠️ Priečinok je `dog-diary/<dogId>`, NIE `dogs/<...>` — `dogs/` nesie profilové fotky
//    z heroflow (`cloudinary_main_url`) a zhoda `public_id` by ich prepísala. Fotka denníka
//    je príloha udalosti, nie nová profilovka; jej adresa žije v `dog_events.value.photo`.
// ⚠️ `public_id` nesie ČAS zápisu, nie index: denník nemá „fotku č. 3", má fotku z konkrétnej
//    sekundy, a dva zápisy v tom istom dni sa tak nemôžu prepísať.
export const uploadDogDiaryPhoto = (blob: Blob, dogId: string, stamp: string) =>
  uploadBlob(blob, `dog-diary/${dogId}`, stamp);

// Fotka priložená k PRÍBEHU Z CESTY (kronika trasy, 22. 9. 2026).
// ⚠️ Priečinok je `trip-stories/<slug>`, NIE `pack-trips/<slug>` — ten nesie fotky
//    SAMOTNÉHO výletu (`payload.photos`) a zhoda `public_id` by ich prepísala.
//    Príbeh je cudzí obsah k tej istej trase, nie jej ďalšia fotka.
// ⚠️ `public_id` nesie ČAS, nie index — rovnaký dôvod ako v denníku psa: dvaja ľudia
//    píšu k tej istej trase a „fotka č. 0" by bola pre oboch tá istá adresa.
export const uploadTripStoryPhoto = (blob: Blob, slug: string, stamp: string) =>
  uploadBlob(blob, `trip-stories/${slug}`, stamp);

// Fotka PODUJATIA (vlna 2, 25. 9. 2026) — `pack-events/<edition_id>/<stamp>`.
// ⚠️ id ročníka vzniká v prehliadači PRED zápisom (`crypto.randomUUID()`), lebo fotka sa
//    nahráva skôr než riadok — inak by bol priečinok neznámy. Recap „uskutočnilo sa" ide
//    do toho istého priečinka s predponou `recap-`, aby sa neprepísala úvodná fotka.
// ⚠️ Unsigned cez preset ako výlety, NIE signovane — `check:tok` má na to lekciu.
export const uploadEventPhoto = (blob: Blob, editionId: string, stamp: string) =>
  uploadBlob(blob, `pack-events/${editionId}`, stamp);

// Delivery URLs (on-the-fly transformations)
export const certPreviewUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_400,h_400,r_max,f_auto,q_auto/${publicId}`;

export const certPdfUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_1200,h_1200,r_max,f_auto,q_auto/${publicId}`;

export const gridTileUrl = (publicId: string, size = 800) =>
  `${BASE_URL}/c_fill,w_${size},h_${size},f_auto,q_auto/${publicId}`;

// Heroglyf na WALL karte — surové PNG z heroflow má 2400 px na šírku a ~90 kB, pritom sa
// kreslí do rámca ~330 CSS px (hover) resp. 48 % karty (otvorený prekryv). Merané na LIVE
// 18. 9. 2026: 63 netransformovaných heroglyfov = 5,62 MB zo 7,14 MB celej homepage, teda
// 79 % prenosu — to zložilo free kvótu Cloudinary. `c_fit` drží pomer strán (3,74:1),
// `f_auto` dá webp/avif aj s alfou, `q_auto` je bezpečné, lebo CSS filter z obrázka aj tak
// robí jednofarebnú zlatú siluetu.
export const heroglyphTileUrl = (publicId: string, size = 720) =>
  `${BASE_URL}/c_fit,w_${size},f_auto,q_auto/${publicId}`;

// Transformácia pre URL, ktorú už máme hotovú v DB (`share_card_url`, `cloudinary_main_url`),
// teda bez publicId po ruke. Vloží segment hneď za `/image/upload/`.
//
// ⚠️ Cudziu URL vracia NEZMENENÚ. Share karta padá na `DEFAULT_OG` hostovaný mimo
// Cloudinary a slepý prepis by z neho vyrobil 404 — teda z plytvania poruchu.
// ⚠️ Už transformovanú URL nechá tiež na pokoji: dva segmenty za sebou Cloudinary
// prijme, ale výsledok je reťazená transformácia, nie tá žiadaná.
export const withTransform = (url: string | null | undefined, transform: string): string => {
  if (!url || !url.includes('/image/upload/')) return url ?? '';
  const [pred, za] = url.split('/image/upload/');
  const prvy = za.split('/')[0];
  if (/(^|,)(c_|w_|h_|f_auto|q_auto|dpr_)/.test(prvy)) return url;
  return `${pred}/image/upload/${transform}/${za}`;
};

export const lightboxUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_1200,h_1200,f_auto,q_auto/${publicId}`;

// PDF storage moved to Supabase Storage (Cloudinary free tier blocks PDF delivery, returns 401).
const PDF_BUCKET = 'pdfs';

async function uploadPdfBlob(blob: Blob, folder: string, publicId: string): Promise<CloudinaryResult> {
  const path = `${folder}/${publicId}.pdf`;
  const url = `${SUPABASE_URL}/storage/v1/object/${PDF_BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: blob,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase pdf ${res.status}: ${err}`);
  }
  return {
    publicId: path,
    secureUrl: `${SUPABASE_URL}/storage/v1/object/public/${PDF_BUCKET}/${path}`,
  };
}

export const uploadCertPdf = (blob: Blob, sessionId: string) =>
  uploadPdfBlob(blob, `tmp/${sessionId}/pdf`, 'certificate');

export const uploadVerticalPdf = (blob: Blob, sessionId: string) =>
  uploadPdfBlob(blob, `tmp/${sessionId}/pdf`, 'heroglyph-vertical');

export const uploadHorizontalPdf = (blob: Blob, sessionId: string) =>
  uploadPdfBlob(blob, `tmp/${sessionId}/pdf`, 'heroglyph-horizontal');

async function uploadPngBlob(blob: Blob, folder: string, publicId: string): Promise<CloudinaryResult> {
  const fd = new FormData();
  fd.append('file', blob, `${publicId}.png`);
  fd.append('upload_preset', PRESET);
  fd.append('folder', folder);
  fd.append('public_id', publicId);

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary png ${res.status}: ${err}`);
  }
  const json = await res.json();
  return { publicId: json.public_id, secureUrl: json.secure_url };
}

export const uploadHeroglyphPng = (blob: Blob, sessionId: string) =>
  uploadPngBlob(blob, 'heroglyphs', sessionId);

export const uploadShareCardPng = (blob: Blob, sessionId: string) =>
  uploadPngBlob(blob, 'sharecards', sessionId);

// Pack feedback "proof" photo — raw file, auto public_id, parked in feedback/.
export async function uploadFeedbackPhoto(file: File): Promise<CloudinaryResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  fd.append('folder', 'feedback');
  const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary feedback ${res.status}: ${err}`);
  }
  const json = await res.json();
  return { publicId: json.public_id, secureUrl: json.secure_url };
}
