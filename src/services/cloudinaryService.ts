const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
const BASE_URL = `https://res.cloudinary.com/${CLOUD}/image/upload`;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;

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

export const uploadExtraPhoto = (blob: Blob, sessionId: string, index: number) =>
  uploadBlob(blob, `tmp/${sessionId}/extras`, String(index).padStart(2, '0'));

// Delivery URLs (on-the-fly transformations)
export const certPreviewUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_400,h_400,r_max,f_auto,q_auto/${publicId}`;

export const certPdfUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_1200,h_1200,r_max,f_auto,q_auto/${publicId}`;

export const gridTileUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_800,h_800,f_auto,q_auto/${publicId}`;

export const lightboxUrl = (publicId: string) =>
  `${BASE_URL}/c_fill,w_1200,h_1200,f_auto,q_auto/${publicId}`;
