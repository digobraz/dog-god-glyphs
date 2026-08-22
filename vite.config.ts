import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
