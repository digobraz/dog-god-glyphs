// SNÍMKA PSOV + ROZMAZANÉ NÁHĽADY PRI BUILDE (perf mobil 7. 10. 2026, plán s Fable 5).
//
// Do `dist/data/` zapíše:
//   grid-dogs.json, grid-dogs-all.json — posledná známa podoba `get-grid-dogs`. Worker
//     (`scripts/cloudflare/worker.js`) ju vydá, keď Supabase nežije a cache Cloudflare je prázdna.
//   grid-lqip.json — { cloudinary_main_url: 16 farieb 4×4 ako hex (96 znakov) }. Worker ho
//     prilepí ku každému psovi ako `lqip`; telefón z neho poskladá 4×4 obrázok (src/lib/lqip.ts),
//     prehliadač ho rozmaže na celú dlaždicu — pri zdvihu opony tak nie je prázdny štvorec.
//     Prečo nie hotový obrázok: najmenší webp/png z Cloudinary má ~500 B (hlavičky), 72 psov
//     = 51 kB navyše v zozname, na ktorý čaká opona. Hex je ~100 B na psa.
//
// Build NIKDY nepadne kvôli sieti — keď sa nedá stiahnuť, zapíše sa čo prišlo (alebo nič)
// a worker si poradí bez toho (lqip chýba ⇒ plochá farba ako doteraz).
import fs from "fs";
import path from "path";

const FEED = "https://lnzurwmdgvzlqhsbhrvi.supabase.co/functions/v1/get-grid-dogs";
const LQIP_T = "c_fill,w_4,h_4,g_auto,f_bmp";

async function getJson(url: string): Promise<unknown[] | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j) && j.length ? j : null;
  } catch {
    return null;
  }
}

function lqipUrl(u: string): string | null {
  if (!u.includes("/image/upload/")) return null;
  const [base, rest] = u.split("/image/upload/");
  // Ak adresa už nesie transformáciu, nahradí sa; inak sa vloží pred verziu/public id.
  const segs = rest.split("/");
  if (/(^|,)(c_|w_|h_|f_auto|q_auto|dpr_)/.test(segs[0])) segs.shift();
  return `${base}/image/upload/${LQIP_T}/${segs.join("/")}`;
}

/** 4×4 BMP (24/32 bit, nekomprimovaný) → 16 farieb `rrggbb` zhora zľava. Inak null. */
function bmpHex(b: Buffer): string | null {
  if (b.length < 54 || b.toString("ascii", 0, 2) !== "BM") return null;
  const off = b.readUInt32LE(10), w = b.readInt32LE(18), hRaw = b.readInt32LE(22), bpp = b.readUInt16LE(28), comp = b.readUInt32LE(30);
  const h = Math.abs(hRaw);
  if (w !== 4 || h !== 4 || (bpp !== 24 && bpp !== 32) || (comp !== 0 && comp !== 3)) return null;
  const px = bpp / 8, row = Math.ceil((w * px) / 4) * 4;
  let hex = "";
  for (let y = 0; y < h; y++) {
    const ry = hRaw > 0 ? h - 1 - y : y; // kladná výška = riadky odspodu
    for (let x = 0; x < w; x++) {
      const i = off + ry * row + x * px;
      if (i + 2 >= b.length) return null;
      hex += [b[i + 2], b[i + 1], b[i]].map((v) => v.toString(16).padStart(2, "0")).join("");
    }
  }
  return hex;
}

export function gridSnapshot() {
  return {
    name: "grid-snapshot",
    apply: "build" as const,
    async closeBundle() {
      const out = path.resolve(__dirname, "dist/data");
      fs.mkdirSync(out, { recursive: true });
      const [members, all] = await Promise.all([getJson(FEED), getJson(`${FEED}?tiers=all`)]);
      if (members) fs.writeFileSync(path.join(out, "grid-dogs.json"), JSON.stringify(members));
      if (all) fs.writeFileSync(path.join(out, "grid-dogs-all.json"), JSON.stringify(all));

      const urls = [...new Set(((all ?? members ?? []) as { cloudinary_main_url?: string | null }[])
        .map((d) => d.cloudinary_main_url || "")
        .filter((u) => u.includes("/image/upload/")))];
      const map: Record<string, string> = {};
      let i = 0;
      const worker = async () => {
        while (i < urls.length) {
          const u = urls[i++];
          const src = lqipUrl(u);
          if (!src) continue;
          try {
            const r = await fetch(src, { signal: AbortSignal.timeout(8000) });
            if (!r.ok) continue;
            const hex = bmpHex(Buffer.from(await r.arrayBuffer()));
            if (hex) map[u] = hex;
          } catch { /* sieť — pes bez náhľadu */ }
        }
      };
      await Promise.all(Array.from({ length: 8 }, worker));
      fs.writeFileSync(path.join(out, "grid-lqip.json"), JSON.stringify(map));
      // eslint-disable-next-line no-console
      console.log(`[grid-snapshot] psy ${members?.length ?? "✗"} / všetci ${all?.length ?? "✗"} · náhľady ${Object.keys(map).length}/${urls.length}`);
    },
  };
}
