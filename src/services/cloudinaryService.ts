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

export const uploadMainPhoto = (blob: Blob, sessionId: string) =>
  uploadBlob(blob, `tmp/${sessionId}`, 'main');

export const uploadCroppedPhoto = (blob: Blob, sessionId: string) =>
  uploadBlob(blob, `tmp/${sessionId}`, 'main_crop');

export const uploadExtraPhoto = (blob: Blob, sessionId: string, index: number) =>
  uploadBlob(blob, `tmp/${sessionId}/extras`, String(index).padStart(2, '0'));

// Delivery URLs (on-the-fly transformations)
export const certPreviewUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_400,h_400,r_max,f_auto,q_auto/${publicId}`;

export const certPdfUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_1200,h_1200,r_max,f_auto,q_auto/${publicId}`;

export const gridTileUrl = (publicId: string, size = 800) =>
  `${BASE_URL}/c_fill,w_${size},h_${size},f_auto,q_auto/${publicId}`;

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
