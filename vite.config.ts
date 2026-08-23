import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".trycloudflare.com", ".ngrok.io", ".loca.lt"],
    // ── DLAŽDICE A NAŠEPKÁVAČ MAPY.COM V DEVE (2026-08-22) ────────────────────────────
    // Kľúč Mapy.com je zamknutý referrerom: povolené je `dogypt.com`, `*.dogypt.com`
    // a `localhost:8080–8083`. Čokoľvek iné dostane 403 — teda AJ mobilný náhľad cez
    // cloudflared tunel (`*.trycloudflare.com`) a AJ telefón na tej istej Wi-Fi
    // (`192.168.x.x:8080`). Prejaví sa to ako prázdna mapa s „Neplatný nebo nezadaný
    // API klíč", čo vyzerá ako chyba našej vrstvy, ale je to zámka tretej strany.
    //
    // Doplniť `*.trycloudflare.com` do whitelistu NESMIEME — quick tunnel si vie
    // vyrobiť ktokoľvek, takže by sme kľúč otvorili celému internetu. Namiesto toho
    // ide dev náhľad na VLASTNÝ pôvod (`/mapyapi/...`) a referrer dosadí server.
    //
    // Platí len pre dev server. Prod build ide priamo na api.mapy.com (`env.ts`).
    proxy: {
      "/mapyapi": {
        target: "https://api.mapy.com",
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/mapyapi/, ""),
        configure: (proxy: { on: (e: string, cb: (req: { setHeader: (k: string, v: string) => void }) => void) => void }) => {
          // `headers:` v configu by prehliadačov Referer len DOPLNIL, nie prepísal —
          // preto sa nastavuje až na odchádzajúcom requeste.
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Referer", "https://dogypt.com/");
            proxyReq.setHeader("Origin", "https://dogypt.com");
          });
        },
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mode === "development" && saveTripPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));

/**
 * DEV-ONLY: VÝLET Z TELEFÓNU ROVNO NA DISK (2026-08-23).
 *
 * Matej testuje sprievodcu na telefóne a nakreslené výlety sú REÁLNE — „ulož ten výlet nech
 * je ready na launch". Lenže žijú len v `localStorage` toho telefónu: do Supabase ich fronta
 * bez prihlásenia neodošle a do datasetu (`plany/trails-nahadzovac-state.json`) sa inak
 * dostanú len tak, že ich niekto ručne prepíše z obrazovky.
 *
 * Endpoint teda prijme JSON výletu a odloží ho do `plany/prijate-vylety/`. Odtiaľ ho preberá
 * `plany/gen-hero-trails.mjs` cesta ako každý iný výlet — TENTO endpoint do datasetu NEZAPISUJE
 * zámerne: `state.json` má vlastný formát a vlastného strážcu (`pyDumps()` v trip-audit-server),
 * a slepý zápis z prehliadača by ho preformátoval celý.
 *
 * Beží LEN v dev móde (`mode === "development"`), takže v produkčnom builde neexistuje.
 */
function saveTripPlugin() {
  return {
    name: "dogypt-save-trip",
    configureServer(server: { middlewares: { use: (path: string, fn: (req: unknown, res: unknown) => void) => void } }) {
      server.middlewares.use("/__save-trip", (req, res) => {
        const request = req as { method?: string; on: (e: string, cb: (c?: unknown) => void) => void };
        const response = res as { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void };
        if (request.method !== "POST") { response.statusCode = 405; response.end("POST only"); return; }
        const chunks: Buffer[] = [];
        request.on("data", (c) => chunks.push(c as Buffer));
        request.on("end", () => {
          try {
            const raw = Buffer.concat(chunks).toString("utf8");
            const trip = JSON.parse(raw) as { id?: string; name?: string };
            const dir = path.resolve(__dirname, "../../plany/prijate-vylety");
            fs.mkdirSync(dir, { recursive: true });
            // Meno súboru z názvu výletu, aby sa dal nájsť okom. `id` je v ňom tiež — dva
            // výlety s rovnakým názvom sa inak prepíšu.
            const slug = String(trip.name ?? "vylet").toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "vylet";
            fs.writeFileSync(path.join(dir, `${slug}--${trip.id ?? "bez-id"}.json`), raw, "utf8");
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ ok: true, file: `${slug}--${trip.id ?? "bez-id"}.json` }));
          } catch (e) {
            response.statusCode = 500;
            response.end(JSON.stringify({ ok: false, error: String(e) }));
          }
        });
      });
    },
  };
}
