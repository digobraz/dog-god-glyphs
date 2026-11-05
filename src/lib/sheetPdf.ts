// Spoločné jadro tlače na PDF: kartička (`emergencyCardPdf.ts`) aj DOG ID (`dogIdPdf.ts`).
// 🔴 WebKit (iPhone) pri prvom kreslení obrázky do SVG často nedokreslí, preto najviac 4 pokusy a kontrola,
// že fotka vo výsledku naozaj je (ako pri letáku SOS). Po štvrtom pokuse bez fotky sa PDF vyrobí a volajúci dostane `photoOk: false`.
// ⚠️ PDF sa nikam nenahráva, je v ňom adresa, telefón a zdravotné údaje.
import { shareFile } from '@/lib/shareFile';

/** Obrázok z adresy ako data URL. Chybná odpoveď (404, 500) je `null`, nie „obrázok“ s textom chyby. */
export async function toDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await blobToDataUrl(await response.blob());
  } catch { return null; }
}

export const blobToDataUrl = (blob: Blob) => new Promise<string>((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(String(fr.result));
  fr.onerror = () => rej(fr.error);
  fr.readAsDataURL(blob);
});

/** Je v strede fotky aspoň nejaký kontrast? Prázdna (nedokreslená) plocha je jednofarebná. */
async function photoDrawn(png: Blob, node: HTMLElement, photoSelector: string): Promise<boolean> {
  const img = node.querySelector<HTMLImageElement>(photoSelector);
  if (!img) return true;
  const box = node.getBoundingClientRect();
  const r = img.getBoundingClientRect();
  const bmp = await createImageBitmap(png);
  const k = bmp.width / box.width;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, (r.left - box.left + r.width * 0.2) * k, (r.top - box.top + r.height * 0.2) * k, r.width * 0.6 * k, r.height * 0.4 * k, 0, 0, 32, 32);
  bmp.close();
  const d = g.getImageData(0, 0, 32, 32).data;
  let lo = 765; let hi = 0;
  for (let i = 0; i < d.length; i += 4) { const v = d[i] + d[i + 1] + d[i + 2]; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  return hi - lo > 6;
}

/** Nakreslí uzol do JPEG/PNG s opakovaním, kým sa fotka nezobrazí. */
export async function drawNode(node: HTMLElement, o: {
  photoSelector?: string; jpeg?: boolean; pixelRatio: number; width?: number; height?: number; style?: Record<string, string>;
}): Promise<{ dataUrl: string; photoOk: boolean }> {
  await document.fonts.ready;
  await Promise.all([...node.querySelectorAll('img')].map((i) => i.decode().catch(() => undefined)));
  const { toBlob, toCanvas } = await import('html-to-image');
  const opts = { pixelRatio: o.pixelRatio, cacheBust: false, backgroundColor: '#FFFFFF', width: o.width, height: o.height, style: o.style };
  let blob: Blob | null = null;
  let photoOk = false;
  for (let pokus = 0; pokus < 4; pokus++) {
    if (o.jpeg) {
      const canvas = await toCanvas(node, opts);
      blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
    } else {
      blob = await toBlob(node, opts);
    }
    photoOk = !!blob && (!o.photoSelector || await photoDrawn(blob, node, o.photoSelector));
    if (photoOk) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!blob) throw new Error('sheet_empty');
  return { dataUrl: await blobToDataUrl(blob), photoOk };
}

/** Bezpečný názov súboru z mena psa. */
export const safeFileName = (base: string, dogName: string) =>
  `${base}-${dogName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')}.pdf`;

/** PDF A4 z hotových obrázkov (jedna strana = jeden obrázok) a jeho odovzdanie. `false` = zariadenie ho nevie odovzdať. */
export async function imagesToPdfAndShare(images: { dataUrl: string; format: 'PNG' | 'JPEG' }[], name: string): Promise<boolean> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  images.forEach((im, i) => {
    if (i) pdf.addPage();
    pdf.addImage(im.dataUrl, im.format, 0, 0, 210, 297, undefined, 'FAST');
  });
  return shareFile(pdf.output('blob'), name);
}
