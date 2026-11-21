// SOS BEZ SIGNÁLU NA WEBE / PWA (21. 11. 2026). Kto otvorí appku online a potom stratí signál, dostal pri ťuknutí na Prvú pomoc
// či Pohotovosť chybovú stránku: obrazovky sú `lazy` a ich kód sa sťahuje až pri vstupe. Preto sa v POKOJI (idle) po načítaní
// appky stiahne kód obrazoviek, ktoré majú fungovať offline (prvá pomoc, pohotovosť, SOS rozcestník) a obrázky prvej pomoci.
//   · Kód: `import()` ten istý chunk ako `lazyPack` v `App.tsx` — modul ostane v pamäti stránky, ďalšie `import()` ide aj bez siete.
//   · Obrázky: držia sa v pamäti (`held`) a ukladá ich HTTP cache (`_headers`: `/prva-pomoc/*`). Obnovenie stránky offline
//     by potrebovalo service worker; ten tu NEZAKLADÁME (`sw-maptiles.js` drží rozsah `/`, druhý by sa s ním a s aktualizáciou appky pobil).
//   · Natívna appka (Capacitor) balík nesie lokálne, tam sa nič nesťahuje.
//   · Šetrenie dát: pri `saveData` alebo 2G/3G sa obrázky preskočia (kód je malý, obrázky ~5 MB).
import { IS_APP } from '@/lib/isApp';
import { AID_ON, DANGER_ON, SOS_ON, VET_ER_ON } from '@/lib/env';
import { APP_NEW } from '@/lib/packFlags';
import { ensurePackDict } from '@/i18n/LanguageContext';

let started = false;
const held: HTMLImageElement[] = [];   // živé odkazy, aby prehliadač nevyhodil obrázok z pamäte

type Idle = (cb: () => void, o?: { timeout: number }) => number;
const whenIdle = (fn: () => void) => {
  const w = window as Window & { requestIdleCallback?: Idle };
  // timeout 2,5 s: kód a obrázky nesmú čakať 10 s, kým sa „nájde“ voľný čas (prvých ~10 s boli obrázky prvej pomoci offline rozbité)
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2500 });
  else window.setTimeout(fn, 1500);
};

const slowLink = (): boolean => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === 'slow-2g' || c.effectiveType === '2g' || c.effectiveType === '3g');
};

function loadImage(src: string): Promise<void> {
  return new Promise((res) => {
    const img = new Image();
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'low';
    img.decoding = 'async';
    img.onload = () => res();
    img.onerror = () => res();
    img.src = src;
    held.push(img);
  });
}

async function run(): Promise<void> {
  await ensurePackDict().catch(() => {});
  const code: Promise<unknown>[] = [];
  if (AID_ON) code.push(import('./PackSosAid'));
  if (VET_ER_ON) code.push(import('./PackSosVet'));
  if (AID_ON || VET_ER_ON) code.push(import('./PackSosHub'));
  // Len KÓD (žiadne dáta): kartička sa kreslí z lokálnych dát a formuláre sa bez siete aspoň otvoria (rozpísané sa ukladá do sessionStorage).
  if (APP_NEW) code.push(import('@/components/pack/dogCard/PackSosCard'));
  if (SOS_ON) code.push(import('./PackSosNew'));
  if (DANGER_ON) code.push(import('./danger/PackDangerHub'));
  const codeDone = Promise.allSettled(code);
  // Malé JSON pre prvé otvorenie offline (zoznam psov, telefón, údaje kartičky); len pre prihláseného, maže sa pri odhlásení.
  void import('./sosLocal').then((m) => m.warmSosLocal()).catch(() => {});   // kód a obrázky idú súbežne, aby pomalý chunk nezdržal najnaliehavejšie karty
  if (!AID_ON || slowLink()) return;
  const { aidContent, AID_ICON, AID_ICON_DEFAULT } = await import('./aid/aidData');
  // malé ikonky dlaždíc (rozcestník prvej pomoci + SOS rozcestník), potom veľké kresby
  const icons = [...new Set([...Object.values(AID_ICON), AID_ICON_DEFAULT, 'sos-vet', 'sos-strateny', 'sos-karta'])].map((n) => `/icons/sys/${n}.webp`);
  await Promise.all(icons.map(loadImage));
  const cards = aidContent('en').cards;
  // najprv hlavné kresby (ide o minúty ako prvé), potom fotky a pomocné obrázky
  // úplne prvé: najnaliehavejšie karty (nedýcha, dusí, krváca, jed, prehriatie), potom zvyšok skupiny A, potom ostatné
  const URGENT = ['nedycha', 'dusi', 'krvaca', 'jed', 'prehriatie'];
  const byUrgency = [...cards].sort((a, b) => (URGENT.indexOf(a.id) < 0 ? 99 : URGENT.indexOf(a.id)) - (URGENT.indexOf(b.id) < 0 ? 99 : URGENT.indexOf(b.id)) || a.group.localeCompare(b.group));
  const main = byUrgency.map((c) => c.img);
  const rest = cards.flatMap((c) => [
    ...(c.fotky ?? []).map((f) => f.src), c.porovnanie?.img, ...(c.dalsi ?? []).map((d) => d.img), c.posledne?.img,
  ]);
  const urls = [...new Set([...main, ...rest].filter((u): u is string => !!u))];
  for (let i = 0; i < urls.length; i += 3) {
    if (slowLink()) return;
    await Promise.all(urls.slice(i, i + 3).map(loadImage));
    await new Promise<void>((r) => window.setTimeout(r, 150));   // nechaj dýchať ostatné požiadavky
  }
  await codeDone;
}

/** Raz za načítanie stránky; volá `SosButton` (je v hornom páse každej stránky appky). */
export function prefetchSosOffline(): void {
  if (started || typeof window === 'undefined' || IS_APP) return;
  started = true;
  whenIdle(() => { void run().catch(() => {}); });
}
