// Núdzová kartička na tlač: uzol A4 (`.ecs`) → obrázok → PDF A4.
// ⚠️ PDF sa nikam nenahráva, je v ňom adresa a telefón. Rovnaký postup ako `dogIdPdf.ts`.
// 🔴 WebKit (iPhone) pri prvom kreslení obrázky do SVG často nedokreslí, preto najviac 4 pokusy ako pri letáku SOS.
import { IS_APP } from '@/lib/isApp';

async function photoDrawn(png: Blob, sheet: HTMLElement): Promise<boolean> {
  const img = sheet.querySelector<HTMLImageElement>('.ec-ph img');
  if (!img) return true;
  const box = sheet.getBoundingClientRect();
  const r = img.parentElement!.getBoundingClientRect();
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

/** Vráti `false`, keď appka PDF nevie odovzdať (WebView bez systémového zdieľania). */
export async function exportEmergencyCardPdf(sheet: HTMLElement, dogName: string): Promise<boolean> {
  await document.fonts.ready;
  await Promise.all([...sheet.querySelectorAll('img')].map((i) => i.decode().catch(() => undefined)));
  const { toBlob } = await import('html-to-image');
  const { jsPDF } = await import('jspdf');
  let png: Blob | null = null;
  for (let pokus = 0; pokus < 4; pokus++) {
    // Hárok stojí mimo obrazovky: bez `style` by sa to posunutie prenieslo aj do obrázka a vyšla by prázdna strana.
    png = await toBlob(sheet, { pixelRatio: 3, cacheBust: false, backgroundColor: '#FFFFFF', style: { position: 'static', left: '0' } });
    if (png && await photoDrawn(png, sheet)) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!png) throw new Error('card_empty');
  const dataUrl = await new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(png!);
  });
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  const name = `DOGYPT-kartička-${dogName.replace(/[^\p{L}\p{N}]+/gu, '-')}.pdf`;
  const blob = pdf.output('blob');
  if (IS_APP) {
    const file = new File([blob], name, { type: 'application/pdf' });
    if (!navigator.canShare?.({ files: [file] })) return false;
    await navigator.share({ files: [file], title: name }).catch((e) => { if (e?.name !== 'AbortError') throw e; });
    return true;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
