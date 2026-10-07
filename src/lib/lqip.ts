// ROZMAZANÝ NÁHĽAD DLAŽDICE (7. 10. 2026, plán s Fable 5).
// Cloudflare `/api/dogs` nesie pri psovi `lqip` = 16 farieb 4×4 ako hex (vite-plugin-grid-snapshot.ts).
// Tu sa z nich poskladá 4×4 BMP (102 B) ako data URI; prehliadač ho pri natiahnutí na dlaždicu
// vyhladí do mäkkého rozmazaného obrazu toho istého psa. Neplatný vstup ⇒ undefined (plochá farba).
const cache = new Map<string, string>();

export function lqipDataUri(hex?: string | null): string | undefined {
  if (!hex || !/^[0-9a-f]{96}$/.test(hex)) return undefined;
  const hit = cache.get(hex);
  if (hit) return hit;
  const b = new Uint8Array(54 + 48);
  const dv = new DataView(b.buffer);
  b[0] = 0x42; b[1] = 0x4d;                 // "BM"
  dv.setUint32(2, b.length, true);
  dv.setUint32(10, 54, true);               // začiatok pixelov
  dv.setUint32(14, 40, true);               // BITMAPINFOHEADER
  dv.setInt32(18, 4, true);
  dv.setInt32(22, -4, true);                // záporná výška = riadky zhora
  dv.setUint16(26, 1, true);
  dv.setUint16(28, 24, true);
  dv.setUint32(34, 48, true);
  for (let p = 0; p < 16; p++) {
    const o = 54 + p * 3, h = p * 6;
    b[o] = parseInt(hex.slice(h + 4, h + 6), 16);     // B
    b[o + 1] = parseInt(hex.slice(h + 2, h + 4), 16); // G
    b[o + 2] = parseInt(hex.slice(h, h + 2), 16);     // R
  }
  let s = '';
  b.forEach((v) => { s += String.fromCharCode(v); });
  const uri = `data:image/bmp;base64,${btoa(s)}`;
  cache.set(hex, uri);
  return uri;
}
