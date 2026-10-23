// NÁKRES PRIAMO V APPKE — zápis na disk (23. 10. 2026).
//
// Matej kreslil predstavu obrazovky v Canve a potom ju opisoval slovami. Editor
// (`src/lib/nakres/`, otvorí ho `?nakres=1` na dev serveri) mu dovolí ťahať, prehadzovať,
// prepisovať a komentovať skutočné prvky appky. Do kódu NEZAPISUJE nič — tento endpoint
// odloží len ZÁZNAM zmien do `plany/nakresy/<id>/`:
//   nakres.json — strojový záznam (komponent, súbor:riadok, pred/po)
//   nakres.md   — to isté na čítanie; z neho Claude robí „sprav podľa nákresu"
//   <trasa>-pred.png / -po.png — snímky (best-effort, html-to-image)
//
// Súbor, nie localStorage: druhý PC vidí len to, čo vznikne ako súbor (CLAUDE.md, dva počítače).
// Beží LEN v dev móde, v produkčnom builde neexistuje.
import fs from "fs";
import path from "path";

type Popis = {
  tag: string; text: string; zdroj: string | null; komponenty: string[];
  rect: { x: number; y: number; w: number; h: number };
};
type Poloha = "pred" | "za" | "dnu" | "vedla" | "vedla-vlavo" | "nad" | "pod" | "na" | "volne";
type Zmena = {
  druh: "presun" | "premiestnit" | "velkost" | "text" | "skryt" | "poznamka" | "pridat";
  trasa: string; zariadenie: string; prvok: Popis | null;
  dx?: number; dy?: number; w?: number; h?: number;
  pred?: string; po?: string; poznamka?: string;
  typ?: string; poloha?: Poloha; kotva?: Popis | null; rodic?: Popis | null; original?: Popis | null; x?: number; y?: number;
};
type Nakres = {
  id: string; vytvorene: string; nazov?: string; zmeny: Zmena[];
  snimky?: Record<string, { pred?: string; po?: string }>;
};

const DRUH: Record<Zmena["druh"], string> = {
  presun: "VOĽNÝ POSUN", premiestnit: "PRESUN V TOKU", velkost: "VEĽKOSŤ", text: "TEXT", skryt: "SKRYŤ", poznamka: "POZNÁMKA", pridat: "NOVÝ PRVOK",
};
const TYP: Record<string, string> = {
  pilulka: "PILULKA", text: "TEXT", rozbalovac: "ROZBAĽOVAČ", sekcia: "SEKCIA (podblok s nadpisom)", blok: "BLOK (podblok)",
  karta: "KARTA", "cta-lapis": "CTA LAPIS", "cta-zlate": "CTA ZLATÉ", tvar: "TVAR", kopia: "KÓPIA",
};

const slug = (s: string) => s.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9]+/g, "-") || "domov";

function smer(dx = 0, dy = 0) {
  const c: string[] = [];
  if (dy) c.push(`${dy > 0 ? "dole" : "hore"} ${Math.abs(dy)} px`);
  if (dx) c.push(`${dx > 0 ? "vpravo" : "vľavo"} ${Math.abs(dx)} px`);
  return c.join(", ") || "bez posunu";
}

/** Kto je prvok: súbor:riadok, reťaz komponentov, značka a text. */
function kto(p?: Popis | null) {
  if (!p) return "—";
  return `\`${p.zdroj ?? "nový prvok z nákresu"}\` · ${p.komponenty.join(" ← ") || "—"} · <${p.tag}>${p.text ? ` „${p.text}“` : ""}`;
}

function kam(z: Zmena) {
  const k = kto(z.kotva);
  switch (z.poloha) {
    case "pred": return `v toku PRED ${k}`;
    case "za": return `v toku ZA ${k}`;
    case "dnu": return `DNU do ${k}`;
    case "vedla": return `VPRAVO VEDĽA ${k} (spolu v jednom riadku)`;
    case "vedla-vlavo": return `VĽAVO VEDĽA ${k} (spolu v jednom riadku)`;
    case "nad": return `NAD ${k} (spolu v jednom stĺpci)`;
    case "pod": return `POD ${k} (spolu v jednom stĺpci)`;
    case "na": return `položený voľne NA ${k}, ľavý horný roh ${z.x},${z.y} (mimo toku)`;
    default: return "voľne v strede obrazovky (mimo toku)";
  }
}

function riadok(z: Zmena, i: number) {
  const p = z.prvok;
  let co = "";
  let kde = p ? `${kto(p)} · pôvodne ${p.rect.w}x${p.rect.h} na ${p.rect.x},${p.rect.y}` : "celá obrazovka";
  if (z.druh === "presun") co = `${smer(z.dx, z.dy)} (voľne, ostatné neuhli)`;
  if (z.druh === "premiestnit") co = `${kam(z)}${z.rodic ? ` · nový rodič ${kto(z.rodic)}` : ""}`;
  if (z.druh === "velkost") co = `${p?.rect.w}x${p?.rect.h} → ${z.w}x${z.h}`;
  if (z.druh === "text") co = `„${z.pred}“ → „${z.po}“`;
  if (z.druh === "skryt") co = "preč z obrazovky";
  if (z.druh === "poznamka") co = `„${z.poznamka}“`;
  if (z.druh === "pridat") {
    co = `${TYP[z.typ ?? ""] ?? z.typ}${z.original ? ` — kópia ${kto(z.original)}` : " z katalógu brandu (PACK_BLOCKS)"}, ${z.w}x${z.h}`
      + `${z.po ? `, text „${z.po.replace(/\s+/g, " ")}“` : ""}${z.dx || z.dy ? `, potom posunutý ${smer(z.dx, z.dy)}` : ""}`;
    kde = `${kam(z)}${z.rodic ? `\n   rodič: ${kto(z.rodic)}` : ""}`;
  }
  return `${i + 1}. **${DRUH[z.druh]}** \`${z.trasa}\` (${z.zariadenie}) — ${co}\n   ${kde}`;
}

function zapis(root: string, n: Nakres) {
  const id = n.id.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80);
  if (!id) throw new Error("chýba id nákresu");
  const dir = path.join(root, id);
  fs.mkdirSync(dir, { recursive: true });
  const obrazky: string[] = [];
  for (const [trasa, s] of Object.entries(n.snimky ?? {})) {
    for (const k of ["pred", "po"] as const) {
      const d = s[k];
      if (!d?.startsWith("data:image/png;base64,")) continue;
      const f = `${slug(trasa)}-${k}.png`;
      fs.writeFileSync(path.join(dir, f), Buffer.from(d.split(",")[1], "base64"));
      obrazky.push(f);
    }
  }
  const { snimky: _s, ...bezSnimok } = n;
  fs.writeFileSync(path.join(dir, "nakres.json"), JSON.stringify({ ...bezSnimok, obrazky }, null, 2));
  const trasy = [...new Set(n.zmeny.map((z) => z.trasa))];
  const md = [
    `# Nákres ${id}${n.nazov ? ` — ${n.nazov}` : ""}`,
    "",
    `Vytvorené ${n.vytvorene} · obrazovky: ${trasy.map((t) => `\`${t}\``).join(", ") || "—"} · ${n.zmeny.length} zmien`,
    "",
    "Do kódu sa nezapísalo nič. Posuny sú v px na šírke zariadenia — prekladaj ich do stupnice `PACK_SPACE`, nie doslovne.",
    "",
    "## Zmeny",
    "",
    ...n.zmeny.map(riadok),
    "",
    obrazky.length ? "## Snímky\n\n" + obrazky.map((f) => `- \`${f}\``).join("\n") : "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, "nakres.md"), md);
  return path.relative(path.resolve(root, "../.."), dir);
}

export function nakresPlugin() {
  return {
    name: "dogypt-nakres",
    apply: "serve" as const,
    configureServer(server: { middlewares: { use: (path: string, fn: (req: unknown, res: unknown) => void) => void } }) {
      const root = path.resolve(__dirname, "../../plany/nakresy");
      server.middlewares.use("/__nakres", (req, res) => {
        const request = req as { method?: string; on: (e: string, cb: (c?: unknown) => void) => void };
        const response = res as { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void };
        if (request.method !== "POST") { response.statusCode = 405; response.end("POST only"); return; }
        const chunks: Buffer[] = [];
        request.on("data", (c) => chunks.push(c as Buffer));
        request.on("end", () => {
          response.setHeader("Content-Type", "application/json");
          try {
            const kam = zapis(root, JSON.parse(Buffer.concat(chunks).toString("utf8")) as Nakres);
            response.end(JSON.stringify({ ok: true, kam }));
          } catch (e) {
            response.statusCode = 500;
            response.end(JSON.stringify({ ok: false, error: String(e) }));
          }
        });
      });
    },
  };
}
