import { useSyncExternalStore } from 'react';

// ════════════════════════════════════════════════════════════════════════════
// ŠAT `/pack` — TMAVÝ (východisko) ↔ BLEDÝ, prepínateľný v nastaveniach
// Matej 2026-09-11: „v tejto fázy vráť tmavý šat do nastavenia (bude sa dať
// prepínať) páči sa mi to viac - väčší kontrast... v originály by to mohlo
// ostať tmavé a dať prepnúť na bledé (zatiaľ len pridaj prepínacie tlačítko)".
//
// Zámer prepínača je REVIEW, nie voľba člena: najprv sa prejde a schváli bledá
// verzia stránku po stránke, potom tmavá. Preto je východisko `dark` — to je
// stav, v akom appka bola pred 8. 9. 2026, a ten je zatiaľ ten „ostrý".
//
// ⚠️ PREPÍNAČ NEPOKRÝVA CELÝ `/pack`. Ovláda len povrchy, ktoré tmavú vetvu
//    REÁLNE MAJÚ (homepage, psí blok, DOG ID, profil, cudzí profil) — tam je
//    bledý šat prepnutie shellu a karty ostávajú, ako boli.
//    MAPA, TRIPLIST a ČLÁNOK VÝLETU tmavú verziu UŽ NEMAJÚ: 1. 9. 2026 sa
//    nahradila, nie zdvojila (`.tl-root` a `.pta-root` prišli o vlastné pozadie
//    a `min-height`, oboje nesie `.pk-paper`, ktorý majú v JSX natvrdo).
//    Preto ostávajú bledé v oboch polohách prepínača — nie je to zabudnutý
//    povrch, je to práca, ktorá by sa musela postaviť nanovo.
//    ✅ POTVRDENÉ Matejom 11. 9. 2026: „mapy nemusíš meniť, mapy budú mať len
//    bledý dizajn, nie liquid glass." Takže to NIE JE dlh čakajúci na dokončenie —
//    je to rozhodnutie. Kto bude prepínač rozširovať, mapu doň NEPRIDÁVA.
// ════════════════════════════════════════════════════════════════════════════

export type PackSkin = 'dark' | 'paper';

const KEY = 'dogypt.pack.skin';
const DEFAULT: PackSkin = 'dark';

function read(): PackSkin {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT;
    const v = localStorage.getItem(KEY);
    return v === 'paper' || v === 'dark' ? v : DEFAULT;
  } catch {
    // Privátne okno / zablokované úložisko — šat nie je nič, kvôli čomu by mala
    // stránka spadnúť. Padáme na východisko.
    return DEFAULT;
  }
}

// Hodnota sa číta RAZ pri načítaní modulu a ďalej žije v pamäti. `getSnapshot`
// musí vracať stabilnú referenciu, inak sa `useSyncExternalStore` zacyklí na
// nekonečnom prekresľovaní — čítanie z localStorage pri každom volaní by to
// pri primitívnej hodnote síce prežilo, ale je to zbytočný dotyk na disk pri
// každom renderi každého konzumenta.
let current: PackSkin = read();

const subs = new Set<() => void>();

export function getPackSkin(): PackSkin {
  return current;
}

export function setPackSkin(next: PackSkin): void {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Neuložilo sa — prepnutie aj tak platí do konca relácie.
  }
  subs.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

/** Aktuálny šat, reaktívne. Komponent sa ním prihlási na prepnutie. */
export function usePackSkin(): PackSkin {
  return useSyncExternalStore(subscribe, getPackSkin, () => DEFAULT);
}
