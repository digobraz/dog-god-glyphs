// Export plagátu nebezpečenstva do PNG (`w`×`h`). Rovnaký postup ako `nodeToPng` v `sosFlyerExport.ts`, ale s písmami LEN z brandu
// (`brandFontEmbedCSS`, ako núdzová kartička a leták): `html-to-image` bez toho prejde všetky štýly stránky vrátane Google Fonts,
// hlási „Error inlining remote css file fonts.googleapis.com“ a písmo plagátu sa v obrázku rozjde (medzera medzi nadpisom a podnadpisom).
import { brandFontEmbedCSS } from '@/lib/brandFontEmbed';
import { waitReady } from '../sosFlyerExport';

export async function posterToPng(node: HTMLElement, w: number, h: number): Promise<Blob> {
  await waitReady(node);
  const { toBlob } = await import('html-to-image');
  const cssW = node.offsetWidth || 1;
  const cssH = Math.round((cssW * h) / w);
  await Promise.all([...node.querySelectorAll('img')].map((i) => i.decode().catch(() => undefined)));
  const fontEmbedCSS = await brandFontEmbedCSS(node);
  let blob: Blob | null = null;
  for (let pokus = 0; pokus < 2; pokus++) {   // WebKit pri prvom kreslení obrázky nedokreslí
    blob = await toBlob(node, { pixelRatio: w / cssW, width: cssW, height: cssH, cacheBust: false, skipFonts: false, ...(fontEmbedCSS ? { fontEmbedCSS } : {}) });
    if (blob) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!blob) throw new Error('poster_empty');
  const bmp = await createImageBitmap(blob);
  if (bmp.width === w && bmp.height === h) { bmp.close(); return blob; }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('poster_empty'))), 'image/png'));
}
