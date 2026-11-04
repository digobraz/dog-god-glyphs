// Export letáku: DOM (`SosFlyer`) → PNG 2480×3508 (A4 pri 300 dpi) → PDF A4 / Cloudinary.
// Uzol sa kreslí v pevnej šírke 1240 CSS px a `pixelRatio: 2` — letáku to stačí, lebo je v `cqw` a nezávisí od obrazovky.
// 🔴 Pred exportom sa čaká na fonty a na `data-ready="1"` (fotka aj mapa dohraté); cudzie obrázky idú ako `blob:`
//    (CORS ošetrené v `SosFlyer`), inak by canvas padol.
import { uploadSosFlyer } from '@/services/cloudinaryService';

export const FLYER_W = 2480;
export const FLYER_H = 3508;
/** Šírka uzla v CSS px; pixelRatio 2 ⇒ presne 2480 px. */
export const FLYER_CSS_W = FLYER_W / 2;

const FONT_PROBES = ["800 40px 'Cinzel'", "900 40px 'Cinzel Decorative'", "700 40px 'Cinzel Decorative'", "400 40px 'Space Grotesk'", "600 40px 'Space Grotesk'", "800 40px 'Space Grotesk'"];

async function waitReady(node: HTMLElement, ms = 12000): Promise<void> {
  const t0 = Date.now();
  while (node.querySelector('[data-ready]')?.getAttribute('data-ready') !== '1') {
    if (Date.now() - t0 > ms) throw new Error('flyer_not_ready');
    await new Promise((r) => setTimeout(r, 80));
  }
  await Promise.all(FONT_PROBES.map((f) => document.fonts.load(f, 'ŠčľŽ').catch(() => [])));
  await document.fonts.ready;
  // dva snímky: prehliadač dokončí rozloženie po načítaní písma
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
}

/** Presne 2480×3508 PNG. */
export async function flyerToPng(node: HTMLElement): Promise<Blob> {
  await waitReady(node);
  const { toBlob } = await import('html-to-image');
  const flyer = node.querySelector<HTMLElement>('.sfl') ?? node;
  const h = Math.round((FLYER_CSS_W * 297) / 210);
  const blob = await toBlob(flyer, { pixelRatio: 2, width: FLYER_CSS_W, height: h, cacheBust: false, skipFonts: false });
  if (!blob) throw new Error('flyer_empty');
  const bmp = await createImageBitmap(blob);
  if (bmp.width === FLYER_W && bmp.height === FLYER_H) { bmp.close(); return blob; }
  // zaokrúhlenie výšky: dorovnáme na presný rozmer
  const c = document.createElement('canvas');
  c.width = FLYER_W; c.height = FLYER_H;
  c.getContext('2d')!.drawImage(bmp, 0, 0, FLYER_W, FLYER_H);
  bmp.close();
  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('flyer_empty'))), 'image/png'));
}

/** Uloží PNG na Cloudinary (PNG; nad 9 MB JPEG — strop bezplatného účtu 10 MB) a vráti https URL. */
export async function flyerUpload(png: Blob, slug: string): Promise<string> {
  let body = png;
  if (png.size > 9 * 1024 * 1024) {
    const bmp = await createImageBitmap(png);
    const c = document.createElement('canvas');
    c.width = bmp.width; c.height = bmp.height;
    c.getContext('2d')!.drawImage(bmp, 0, 0);
    bmp.close();
    body = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('flyer_empty'))), 'image/jpeg', 0.92));
  }
  const r = await uploadSosFlyer(body, slug);
  return r.secureUrl;
}

const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

/** SŤAHOVAŤ: PDF A4 + PNG. */
export async function flyerDownload(png: Blob, slug: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const dataUrl = await new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(png);
  });
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  saveBlob(pdf.output('blob'), `dogypt-sos-${slug}.pdf`);
  saveBlob(png, `dogypt-sos-${slug}.png`);
}
