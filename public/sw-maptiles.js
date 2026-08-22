// DOGYPT — cache pre Mapy.com dlaždice (outdoor/aerial/names-overlay).
//
// Bez tejto vrstvy: (a) DOGYPT "clean" štýl mapy kreslí tie isté dlaždice
// DVAKRÁT (základná TileLayer + invertovaná fx vrstva v PackMap.tsx), lebo
// Mapy.com neposiela Cache-Control/ETag na tile endpointe (overené 22.8.2026
// curlom — žiadna cache hlavička v odpovedi) → default browser cache sa naň
// nedá spoľahnúť; (b) žiadna dlaždica sa neopakuje ani medzi session — každé
// otvorenie mapy sťahuje všetko odznova z platenej API kvóty.
//
// Mapy.com nemá CORS (žiadny access-control-allow-origin) → fetch() na jej
// dlaždice je vždy "opaque" (nedá sa čítať status/veľkosť). TTL preto nedržíme
// v samotnej cache dlaždíc (rekonštrukcia opaque Response je krehká a
// nepotvrdená), ale v samostatnej "index" cache s vlastnými JSON záznamami,
// ktoré si píšeme a čítame sami.
//
// Známy kompromis: keďže opaque response neprezradí status, prípadná chybová
// odpoveď (403/429) sa môže na TTL okno vydávať za platnú dlaždicu. V praxi:
// referrer-lock 403 nastane len pri zlom deploy doméne (nie pri prevádzke),
// 429 sa TTL-om samo vylieči do 21 dní a cache verziu (TILES_CACHE) vieme
// v núdzi zvýšiť pre okamžitý cache-bust.

const TILES_CACHE = 'dogypt-maptiles-v1';
const INDEX_CACHE = 'dogypt-maptiles-index-v1';
const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000; // 21 dní — terénny podklad sa nemení

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('dogypt-maptiles') && k !== TILES_CACHE && k !== INDEX_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isTileRequest(url) {
  return url.hostname === 'api.mapy.com' && url.pathname.includes('/v1/maptiles/');
}

async function getStamp(indexCache, key) {
  const res = await indexCache.match(key);
  if (!res) return 0;
  try {
    const data = await res.json();
    return data.at || 0;
  } catch {
    return 0;
  }
}

async function setStamp(indexCache, key) {
  await indexCache.put(
    key,
    new Response(JSON.stringify({ at: Date.now() }), {
      headers: { 'content-type': 'application/json' },
    }),
  );
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!isTileRequest(url)) return; // /v1/suggest a všetko ostatné ide bez zásahu

  event.respondWith(
    (async () => {
      const [tiles, index] = await Promise.all([caches.open(TILES_CACHE), caches.open(INDEX_CACHE)]);
      const key = event.request.url;
      const cached = await tiles.match(event.request);
      const age = Date.now() - (await getStamp(index, key));

      if (cached && age < MAX_AGE_MS) return cached;

      try {
        const fresh = await fetch(event.request);
        tiles.put(event.request, fresh.clone()).catch(() => {});
        setStamp(index, key).catch(() => {});
        return fresh;
      } catch (err) {
        if (cached) return cached; // výpadok siete → radšej stará dlaždica než diera
        throw err;
      }
    })(),
  );
});
