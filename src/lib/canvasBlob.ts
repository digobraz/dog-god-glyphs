// Hotový obrázok z plátna, aj keď telefón `toBlob` nezvládne.
// Danka 10. 11.: náhľad sa nakreslil, ale `toBlob` nikdy nedal obrázok a ZDIEĽAŤ ostalo navždy sivé.
// `toBlob` vie vrátiť `null`, vyhodiť chybu, alebo sa neozvať vôbec, preto má každý pokus strop.
// JPEG je menší a ľahší než PNG; `toDataURL` beží synchrónne a nezávisí od plánovača prehliadača.

const viaToBlob = (c: HTMLCanvasElement, type: string, waitMs: number, quality?: number) =>
  new Promise<Blob | null>((res) => {
    const timer = setTimeout(() => res(null), waitMs);
    try {
      c.toBlob((b) => { clearTimeout(timer); res(b); }, type, quality);
    } catch {
      clearTimeout(timer);
      res(null);
    }
  });

const viaDataUrl = (c: HTMLCanvasElement): Blob | null => {
  try {
    // prázdne plátno dá „data:,“ — bez dát za čiarkou
    const body = c.toDataURL('image/jpeg', 0.92).split(',')[1];
    if (!body) return null;
    const bin = atob(body);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: 'image/jpeg' });
  } catch {
    return null;
  }
};

/** PNG → JPEG → synchrónny JPEG. `null` až vtedy, keď zlyhalo všetko. */
export async function canvasToBlob(c: HTMLCanvasElement): Promise<Blob | null> {
  return (await viaToBlob(c, 'image/png', 5000))
    ?? (await viaToBlob(c, 'image/jpeg', 3000, 0.92))
    ?? viaDataUrl(c);
}
