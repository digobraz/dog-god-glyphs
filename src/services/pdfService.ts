import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const A4_W_MM = 210;
const A4_H_MM = 297;

type Orientation = 'portrait' | 'landscape';

interface RenderOpts {
  orientation: Orientation;
  marginMm?: number;
  bgColor?: string;
  pixelRatio?: number;
  fileName: string;
}

async function elementToPng(element: HTMLElement, pixelRatio: number): Promise<string> {
  const rect = element.getBoundingClientRect();
  return toPng(element, {
    cacheBust: true,
    pixelRatio,
    width: rect.width,
    height: rect.height,
    backgroundColor: 'transparent',
  });
}

function pageDims(orientation: Orientation): { w: number; h: number } {
  return orientation === 'portrait' ? { w: A4_W_MM, h: A4_H_MM } : { w: A4_H_MM, h: A4_W_MM };
}

export async function renderElementToPdfBlob(
  element: HTMLElement,
  opts: RenderOpts,
): Promise<Blob> {
  const { orientation, marginMm = 0, bgColor, pixelRatio = 2.5 } = opts;
  const png = await elementToPng(element, pixelRatio);
  const { w: pageW, h: pageH } = pageDims(orientation);

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });

  if (bgColor) {
    const [r, g, b] = hexToRgb(bgColor);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageW, pageH, 'F');
  }

  const innerW = pageW - 2 * marginMm;
  const innerH = pageH - 2 * marginMm;

  const rect = element.getBoundingClientRect();
  const aspect = rect.width / rect.height;
  let drawW = innerW;
  let drawH = drawW / aspect;
  if (drawH > innerH) {
    drawH = innerH;
    drawW = drawH * aspect;
  }
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  doc.addImage(png, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
  return doc.output('blob');
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export type PdfRenderTask = {
  element: HTMLElement;
  orientation: Orientation;
  marginMm?: number;
  bgColor?: string;
  fileName: string;
};

export async function renderPdfsSequential(tasks: PdfRenderTask[]): Promise<Blob[]> {
  const out: Blob[] = [];
  for (const t of tasks) {
    out.push(await renderElementToPdfBlob(t.element, {
      orientation: t.orientation,
      marginMm: t.marginMm,
      bgColor: t.bgColor,
      fileName: t.fileName,
    }));
  }
  return out;
}
