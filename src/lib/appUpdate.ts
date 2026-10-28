// ── APPKA = TEN ISTÝ WEB, KTORÝ JE NA LIVE (20. 10. 2026) ───────────────────────
// Matej: *„aby sme mali appka a live web 1:1 a následne keď budeme stavať a vyvíjať /pack
// v app bude sa to prenášať aj na web verziu"*.
//
// Každý `go-live` nahrá na dogypt.com aj `app-update.json` (scripts/app-manifest.mjs) =
// verzia + SHA-256 každého súboru dist/. Appka po štarte porovná verziu so svojou
// (`/app-version.json` v jej balíku), stiahne len súbory, ktoré nemá, a novú verziu
// zapne pri najbližšom odchode z appky do pozadia (nie uprostred písania).
//
// Poistky:
//   · notifyAppReady() — nová verzia, ktorá spadne pri štarte, sa do 10 s vráti späť sama
//   · minNative — web, ktorý chce novší natívny plugin, staršia appka z obchodu nestiahne
//   · DOGYPT DEV (`APP_DEV`) sa neaktualizuje z LIVE, beží z toho, čo do nej nahráme
//   · na webe sa nič z tohto nespustí ani nenačíta (IS_APP)
import { IS_APP } from '@/lib/isApp';
import { APP_DEV } from '@/lib/env';

// Odkiaľ sa aktualizuje. Prepísať sa dá len pri skúške buildu (VITE_APP_UPDATE_BASE), nikdy v go-live.
const LIVE = (import.meta.env.VITE_APP_UPDATE_BASE as string) || 'https://dogypt.com';

type Manifest = {
  version: string;
  minNative: string;
  files: { file_name: string; file_hash: string; download_url: string }[];
};

// „1.10" > „1.9" — porovnanie po číslach, nie ako text.
function nativeOk(have: string, need: string): boolean {
  const a = have.split('.').map(Number);
  const b = need.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0, y = b[i] || 0;
    if (x !== y) return x > y;
  }
  return true;
}

async function ownVersion(): Promise<string> {
  try {
    const r = await fetch('/app-version.json', { cache: 'no-store' });
    return ((await r.json()) as { version?: string }).version || '';
  } catch { return ''; }
}

// ── ŠTART NESMIE ČAKAŤ NA AKTUALIZÁCIU (28. 10. 2026) ───────────────────────────
// Matej 27. 10. na mobilných dátach: *„prvé načítanie trvalo 30 sekúnd!"* Kontrola bežala hneď
// pri štarte: jeden testovací build zmení ~240 chunkov (hash sa reťazí cez importy), Capgo ich
// ťahal 12 spojeniami (2,5–4,4 MB) a prihlásenie s dátami /pack čakalo v rade za nimi. A už
// stiahnutú verziu zapínal `set()` uprostred štartu = okamžitý reload, prvé načítanie do koša.
// Teraz: sieť sa dotkne až po SIET_PO_MS, keď je /pack vykreslený; stiahnutá verzia sa zapne
// pri odchode z appky (stránka skrytá) — alebo hneď na začiatku ďalšieho štartu, kým sa
// ešte nič nenačítava (lokálne, bez siete; to pokrýva aj zabitie appky švihom).
const SIET_PO_MS = 15_000;
const PENDING_KEY = 'dogypt_app_next';   // id stiahnutej verzie, ktorá čaká na zapnutie

function rememberPending(id: string) {
  try { localStorage.setItem(PENDING_KEY, id); } catch { /* bez úložiska ostáva next() */ }
}
function readPending(): string {
  try { return localStorage.getItem(PENDING_KEY) || ''; } catch { return ''; }
}
function forgetPending() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* nič */ }
}

type Updater = typeof import('@capgo/capacitor-updater')['CapacitorUpdater'];

/** Zapni čakajúcu verziu, keď človek odíde z appky — reload vtedy nikoho neruší. */
function applyOnHide(updater: Updater, id: string) {
  const onHide = () => {
    if (document.visibilityState !== 'hidden') return;
    document.removeEventListener('visibilitychange', onHide);
    updater.set({ id }).catch(() => {});
  };
  document.addEventListener('visibilitychange', onHide);
}

async function check() {
  // Dynamicky: web si Capacitor ani plugin nestiahne.
  const [{ CapacitorUpdater }, { CapacitorHttp }] = await Promise.all([
    import('@capgo/capacitor-updater'),
    import('@capacitor/core'),
  ]);
  await CapacitorUpdater.notifyAppReady();
  if (APP_DEV) return;

  // Rýchla cesta, bez siete: verzia stiahnutá minule → zapni ju TERAZ, na úplnom začiatku,
  // keď reload stojí zlomok sekundy. Appka sa sem vráti už s ňou ako `current`.
  const pending = readPending();
  if (pending) {
    const now = await CapacitorUpdater.current();
    if (now.bundle.id !== pending) {
      const { bundles } = await CapacitorUpdater.list();
      const b = bundles.find((x) => x.id === pending);
      if (b && (b.status === 'success' || b.status === 'pending')) {
        await CapacitorUpdater.set({ id: b.id });
        return;
      }
    }
    forgetPending();
  }

  // Sieť až keď beží /pack — prihlásenie a dáta majú prednosť pred aktualizáciou.
  await new Promise((r) => setTimeout(r, SIET_PO_MS));

  // CapacitorHttp ide natívne — fetch z capacitor://localhost by na dogypt.com narazil na CORS.
  const res = await CapacitorHttp.get({ url: `${LIVE}/app-update.json`, headers: { 'Cache-Control': 'no-cache' } });
  if (res.status !== 200) return;
  const m = (typeof res.data === 'string' ? JSON.parse(res.data) : res.data) as Manifest;
  if (!m?.version || !Array.isArray(m.files)) return;

  const [mine, cur] = await Promise.all([ownVersion(), CapacitorUpdater.current()]);
  if (m.version === mine) return;
  if (!nativeOk(cur.native, m.minNative)) return;

  // ⚠️ `next()` sa zapne až pri odchode na plochu a späť. Kto appku ZABIJE švihom
  // z prepínača (Matej 21. 10. 2026), ten prechod nikdy nespraví — preto si id pamätáme
  // (PENDING_KEY) a ďalší štart ho zapne rýchlou cestou hore. Do 28. 10. tu bol `set()`
  // hneď = reload uprostred štartu. Overené v simulátore 21. 10.: kill → štart = stará verzia.
  const { bundles } = await CapacitorUpdater.list();
  const have = bundles.find((b) => b.version === m.version);
  if (have && (have.status === 'success' || have.status === 'pending')) {
    await CapacitorUpdater.next({ id: have.id });
    rememberPending(have.id);
    applyOnHide(CapacitorUpdater, have.id);
    return;
  }
  if (have) await CapacitorUpdater.delete({ id: have.id }).catch(() => {});

  const bundle = await CapacitorUpdater.download({ url: `${LIVE}/app-update.json`, version: m.version, manifest: m.files });
  await CapacitorUpdater.next({ id: bundle.id });
  rememberPending(bundle.id);
  applyOnHide(CapacitorUpdater, bundle.id);

  // Staré stiahnuté verzie (okrem bežiacej a práve naplánovanej) by len zaberali miesto.
  for (const b of bundles) {
    if (b.id !== bundle.id && b.id !== cur.bundle.id && b.id !== 'builtin') {
      await CapacitorUpdater.delete({ id: b.id }).catch(() => {});
    }
  }
}

/** Verzia webu, na ktorej appka práve beží (prvých 8 znakov `/app-version.json`) — na stránke JA,
 *  aby sa pri testovaní dalo VIDIEŤ, či telefón dostal posledný go-live (Matej 21. 10. 2026).
 *  Rovnaké číslo ako `version` v https://dogypt.com/app-update.json. Na webe ''. */
export async function appWebVersion(): Promise<string> {
  if (!IS_APP) return '';
  return (await ownVersion()).slice(0, 8);
}

/** Zavolaj raz pri štarte (main.tsx). Na webe nerobí nič. */
export function startAppUpdate() {
  if (!IS_APP) return;
  check().catch((e) => console.warn('[appUpdate]', e));
}
