// Snímka obrazovky pre nákres — beží VO VNÚTRI iframu (main.tsx ju vystaví ako
// `window.__nakresSnap`), lebo html-to-image potrebuje štýly a písma toho istého okna.
// Best-effort: obrázok z cudzieho servera bez CORS dostane namiesto seba prázdny pixel
// a písma sa pri neúspechu vynechajú — snímka je pomôcka k záznamu, nie jeho jadro.
import { toPng } from 'html-to-image';

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export async function snimka(pixelRatio: number): Promise<string> {
  const opts = { pixelRatio, imagePlaceholder: PIXEL, cacheBust: false, backgroundColor: getComputedStyle(document.body).backgroundColor };
  const s = (o: typeof opts & { skipFonts?: boolean }) =>
    Promise.race([
      toPng(document.documentElement, o),
      new Promise<never>((_, r) => setTimeout(() => r(new Error('snímka trvala príliš dlho')), 12000)),
    ]);
  try {
    return await s(opts);
  } catch {
    return await s({ ...opts, skipFonts: true });
  }
}
