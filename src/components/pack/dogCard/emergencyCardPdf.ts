// Núdzová kartička na tlač a na zdieľanie. Kreslenie s opakovaním a kontrolou fotky a odovzdanie PDF sú spoločné s DOG ID v `lib/sheetPdf.ts`.
import { drawNode, imagesToPdfAndShare, safeFileName } from '@/lib/sheetPdf';
import { shareFile } from '@/lib/shareFile';

/** `handed: false` = zariadenie PDF nevie odovzdať · `photoOk: false` = fotka sa ani na štvrtý pokus nenakreslila. */
export async function exportEmergencyCardPdf(sheet: HTMLElement, dogName: string, baseName: string): Promise<{ handed: boolean; photoOk: boolean }> {
  // Hárok stojí mimo obrazovky: bez `style` by sa to posunutie prenieslo aj do obrázka a vyšla by prázdna strana.
  const { dataUrl, photoOk } = await drawNode(sheet, { photoSelector: '.ec-ph img', pixelRatio: 3, style: { position: 'static', left: '0' } });
  const handed = await imagesToPdfAndShare([{ dataUrl, format: 'PNG' }], safeFileName(baseName, dogName));
  return { handed, photoOk };
}

/** Obe strany pod sebou ako jeden obrázok: systémový hárok ponúkne WhatsApp a ostatné. Nikam sa nenahráva. */
export async function shareEmergencyCardImage(node: HTMLElement, dogName: string, baseName: string): Promise<{ handed: boolean; photoOk: boolean }> {
  const { dataUrl, photoOk } = await drawNode(node, { photoSelector: '.ec-ph img', pixelRatio: 2, style: { position: 'static', left: '0' } });
  const blob = await (await fetch(dataUrl)).blob();
  const handed = await shareFile(blob, `${safeFileName(baseName, dogName).replace(/\.pdf$/i, '')}.png`);
  return { handed, photoOk };
}
