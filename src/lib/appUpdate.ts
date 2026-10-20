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

async function check() {
  // Dynamicky: web si Capacitor ani plugin nestiahne.
  const [{ CapacitorUpdater }, { CapacitorHttp }] = await Promise.all([
    import('@capgo/capacitor-updater'),
    import('@capacitor/core'),
  ]);
  await CapacitorUpdater.notifyAppReady();
  if (APP_DEV) return;

  // CapacitorHttp ide natívne — fetch z capacitor://localhost by na dogypt.com narazil na CORS.
  const res = await CapacitorHttp.get({ url: `${LIVE}/app-update.json`, headers: { 'Cache-Control': 'no-cache' } });
  if (res.status !== 200) return;
  const m = (typeof res.data === 'string' ? JSON.parse(res.data) : res.data) as Manifest;
  if (!m?.version || !Array.isArray(m.files)) return;

  const [mine, cur] = await Promise.all([ownVersion(), CapacitorUpdater.current()]);
  if (m.version === mine) return;
  if (!nativeOk(cur.native, m.minNative)) return;

  // Už stiahnutá (napr. minulý štart) — len ju naplánuj; chybnú zahoď a skús znova.
  const { bundles } = await CapacitorUpdater.list();
  const have = bundles.find((b) => b.version === m.version);
  if (have && have.status === 'success') { await CapacitorUpdater.next({ id: have.id }); return; }
  if (have) await CapacitorUpdater.delete({ id: have.id }).catch(() => {});

  const bundle = await CapacitorUpdater.download({ url: `${LIVE}/app-update.json`, version: m.version, manifest: m.files });
  await CapacitorUpdater.next({ id: bundle.id });

  // Staré stiahnuté verzie (okrem bežiacej a práve naplánovanej) by len zaberali miesto.
  for (const b of bundles) {
    if (b.id !== bundle.id && b.id !== cur.bundle.id && b.id !== 'builtin') {
      await CapacitorUpdater.delete({ id: b.id }).catch(() => {});
    }
  }
}

/** Zavolaj raz pri štarte (main.tsx). Na webe nerobí nič. */
export function startAppUpdate() {
  if (!IS_APP) return;
  check().catch((e) => console.warn('[appUpdate]', e));
}
