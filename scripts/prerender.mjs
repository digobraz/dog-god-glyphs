// SSG head-only prerender — po `vite build` vygeneruje pre vybrané routy
// dist/<route>/index.html = KÓPIA dist/index.html (s SPA bundlom → funguje pre usera)
// s baked <head> meta (title/description/og/canonical/jsonLd).
//
// Prečo head-only: social crawlery (FB/Twitter/WhatsApp/LinkedIn) nespúšťajú JS,
// čítajú len <head> meta. Telo #root ostáva prázdne, SPA ho vyhydratuje pre reálneho usera.
//
// FÁZA 2 PROOF: zatiaľ len /heroglyph. Ak Lovable doručí dist/heroglyph/index.html
// na GET /heroglyph (directory-index pred SPA fallbackom) → rozšíriť ROUTES na všetky.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BASE = 'https://dogypt.com';
const DEFAULT_OG = 'https://storage.googleapis.com/gpt-engineer-file-uploads/r1xjLvSkh4R0qFvw293HZyntcAI2/social-images/social-1778165377850-LOGO_DOGYPT_FINAL_web.webp';

// Route → meta. ZDROJ musí sedieť s <Seo> volaním v príslušnej page komponente.
const ROUTES = [
  {
    path: '/heroglyph',
    title: "HEROGLYPH — Your Dog's Eternal Symbol | DOGYPT",
    description: "Every dog carries a story. Turn your dog's essence into a HEROGLYPH — twelve sacred symbols, one eternal legacy.",
    ogType: 'product',
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "HEROGLYPH",
      "description": "A unique sacred symbol for your dog — twelve symbols encoding its essence, origin and character.",
      "brand": { "@type": "Brand", "name": "DOGYPT" },
      "offers": { "@type": "Offer", "price": "11", "priceCurrency": "EUR", "availability": "https://schema.org/InStock", "url": "https://dogypt.com/heroglyph" },
    },
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function bake(html, r) {
  const url = BASE + r.path;
  // 1) title (jednoznačný)
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`);
  // 2) nahraď existujúce home og/twitter/description (ak sú), inak sa injektnú nižšie
  const repl = (re, tag) => { html = html.replace(re, tag); };
  repl(/<meta name="description" content="[^"]*"\s*\/?>/g, `<meta name="description" content="${esc(r.description)}">`);
  repl(/<meta property="og:title" content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${esc(r.title)}">`);
  repl(/<meta property="og:description" content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${esc(r.description)}">`);
  repl(/<meta property="og:type" content="[^"]*"\s*\/?>/g, `<meta property="og:type" content="${r.ogType || 'website'}">`);
  repl(/<meta name="twitter:title" content="[^"]*"\s*\/?>/g, `<meta name="twitter:title" content="${esc(r.title)}">`);
  repl(/<meta name="twitter:description" content="[^"]*"\s*\/?>/g, `<meta name="twitter:description" content="${esc(r.description)}">`);
  // 3) inject canonical + og:url + jsonLd pred </head> (index.html ich staticky nemá)
  const inject = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
    r.jsonLd ? `<script type="application/ld+json">${JSON.stringify(r.jsonLd)}</script>` : '',
    '<!-- prerendered head-only SSG (scripts/prerender.mjs) -->',
  ].filter(Boolean).join('\n  ');
  html = html.replace('</head>', `  ${inject}\n</head>`);
  return html;
}

const src = join(DIST, 'index.html');
if (!existsSync(src)) {
  console.error(`[prerender] dist/index.html neexistuje — spusti po \`vite build\`. Preskakujem.`);
  process.exit(0); // neblokuj build
}
const base = readFileSync(src, 'utf8');
for (const r of ROUTES) {
  const out = join(DIST, r.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, bake(base, r), 'utf8');
  console.log(`[prerender] ${r.path} → dist${r.path}/index.html`);
}
console.log(`[prerender] hotovo: ${ROUTES.length} route(s)`);
