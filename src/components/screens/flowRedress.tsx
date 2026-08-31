import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { LAB } from '@/lib/labTheme';
import { goldFrameCSS, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';

// ════════════════════════════════════════════════════════════════════════════
// PREZLEČENIE STARÝCH OBRAZOVIEK VSTUPU (31. 8. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej: *„ok tak to skús len prezliecť (ponechaj v dev menu alebo niekde na
// stránke prepnutie na starý vizuál) aby sme to mohli skontrolovať"* — a pred
// tým *„možno by sme to vedeli zjednodušiť iba zmeniť farbu a pridať multipsov
// a progres… mám pocit že sme sa zacyklili"*.
//
// 🔑 PREČO VRSTVA A NIE 14 PREPISOV. Staré obrazovky sú stavebne ZHODNÉ:
//    koreň `.dark-bg` · karta `.papyrus-bg` v `rounded-2xl border-2` · tmavá
//    bublina na `var(--brand-gradient)` · výber `.is-selected-purple`.
//    Prepísať ich na `.hf-*` triedy zo `flowPaleSkin.ts` by bol 14-súborový diff,
//    ktorý sa nedá jedným klikom vrátiť — a práve vrátiť sa je zmysel tejto úlohy.
//    Táto vrstva prefarbuje tie isté značky zvonku, takže STARÝ vizuál je stále
//    presne ten, čo bol, a prepínač je jeden atribút na `<html>`.
//
// ⚠️ RECEPTY SA NEOPISUJÚ. Farby a tvary sem NEPÍŠEM ručne — berú sa z tých
//    istých zdrojov ako bledý šat nových obrazoviek: `LAB` (papyrus, inkoust),
//    `goldFrameCSS()` (zlatý blok, BEZ parametrov — lock v CLAUDE.md),
//    `pickTintCSS()` (výber je priesvitný tint, nie plná farba) a `LAPIS` (CTA).
//    Druhá kópia čísel = ten istý rozchod, ktorý si vyžiadal `PACK_BOX`.
//
// ⚠️ `.dark-bg` NESIE AJ CUDZIE STRÁNKY (Terms, Vision, Login, About, Religion…).
//    Preto je celá vrstva zapuzdrená v `[data-flow-skin="pale"]` a ten atribút
//    sa vešia na `<html>` LEN na cestách vstupu (`FLOW_PATHS`). Bez toho by
//    prezlečenie vytieklo na polovicu webu.
//
// ⚠️ Bublina ostáva TMAVÁ. Nie je to opomenutie — Matej ju 28. 8. v LABe ručne
//    vrátil na `bubble.mode:'dark'`: na bledej stránke je jediný tmavý prvok a
//    on sa rozhodol, že to nesie. Tu sa preto nefarbí, len zjednocuje rádius.
// ════════════════════════════════════════════════════════════════════════════

/** Cesty, na ktorých sa prezliekanie zapína. Mimo nich atribút na `<html>` nie je. */
const FLOW_PATHS = ['/heroglyph'];

/**
 * PORADIE VSTUPU — zdroj pravdy pre progres (31. 8. 2026).
 *
 * Matej: *„ten progresbar ako jediný pridaj už aj dnes do bledeho ale povodneho flow"* —
 * teda z celého nového návrhu ide von zatiaľ len toto, zvyšok počká.
 *
 * ⚠️ Poradie NIE JE odhad — je vytiahnuté z `navigate()` cieľov jednotlivých obrazoviek,
 *    ktoré tvoria jednu neprerušenú reťaz od fotky po odkaz. Keď sa niektorý krok presunie,
 *    MUSÍ sa presunúť aj tu, inak pruh preskočí alebo cúvne.
 * ⚠️ `/heroglyph` (predajná stránka) v zozname zámerne NIE JE. `FLOW_PATHS` ju zachytáva
 *    prefixom, takže bez tejto kontroly by pruh visel aj nad predajom — a tam človek ešte
 *    nič nezačal, takže by mu ukazoval postup vo veci, do ktorej nevstúpil.
 * ⚠️ `/heroglyph/breed` je JEDNA routa s dvoma podkrokmi (plemeno → patrón). Pruh sa preto
 *    v nej nehýbe; deliť ho na polovice by si vyžiadalo stav z obrazovky a pruh by prestal
 *    byť vecou, ktorá o obrazovkách nič nevie.
 */
const FLOW_ORDER = [
  '/heroglyph/photo',
  '/heroglyph/name',
  '/heroglyph/dogs',
  '/heroglyph/email',
  '/heroglyph/why',
  '/heroglyph/about',
  '/heroglyph/breed',
  '/heroglyph/ranking',
  '/heroglyph/owner-info',
  '/heroglyph/owner-zodiac',
  '/heroglyph/owner-final',
  '/heroglyph/dog-gender',
  '/heroglyph/dog-fate',
  '/heroglyph/dog-colour',
  '/heroglyph/dog-bloodline',
  '/heroglyph/dog-character',
  '/heroglyph/crop',
  '/heroglyph/reveal',
  '/heroglyph/message',
];

const STORAGE_KEY = 'dogypt-flow-skin';
export type FlowSkin = 'pale' | 'dark';

/* ── Prepínač: jedna hodnota, dvaja čitatelia (vrstva + dev menu) ──────────
   `useSyncExternalStore` a nie `useState` v každom z nich — dve nezávislé
   kópie by sa po prepnutí rozišli a menu by ukazovalo iný stav než stránka. */
const listeners = new Set<() => void>();
let current: FlowSkin = readStored();

function readStored(): FlowSkin {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'pale';
  } catch {
    // Súkromné okno / zablokované úložisko — šat má fungovať aj tak.
    return 'pale';
  }
}

export function setFlowSkin(next: FlowSkin) {
  current = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* pozri readStored */ }
  listeners.forEach((fn) => fn());
}

export function useFlowSkin(): FlowSkin {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => current,
    () => 'pale',
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VRSTVA. Každé pravidlo je zapuzdrené v `[data-flow-skin="pale"]`.
   ══════════════════════════════════════════════════════════════════════════ */
const REDRESS_CSS = `
/* ── STRÁNKA: čierna tabuľa → papyrus ──────────────────────────────────── */
[data-flow-skin="pale"] .dark-bg { background-color: ${LAB.pageBg}; }
[data-flow-skin="pale"] .dark-bg::before {
  background-image: none;
  background: ${LAB.pageBackdrop};
  filter: none;
}
/* Základ dával potomkom zlatý inkoust pre čierne pozadie — na papyruse svieti. */
[data-flow-skin="pale"] .dark-bg > * { color: ${LAB.ink}; }

/* ── HORNÁ LIŠTA ──────────────────────────────────────────────────────────
   Ten istý filter ako v 'flowPaleSkin.ts': logo je zlatá kresba na priehľadnom
   pozadí a na papyruse by sa stratila. 'PageTopBar' ostáva nedotknutý. */
[data-flow-skin="pale"] .dark-bg img[alt="DOGYPT"] {
  filter: brightness(.34) sepia(1) saturate(2.2) hue-rotate(-12deg);
}

/* ── KARTA S HEROGLYFOM: plochý papyrus → zlatý blok ──────────────────────
   'goldFrameCSS()' kreslí rám aj dosku ako vrstvy pozadia JEDNÉHO elementu,
   takže prepisuje 'background' aj 'border' z Tailwindu.

   🔴 LEM JE 'border', NIE 'padding' (oprava 31. 8. 2026 — Matej: „veď tie
   okraje nie sú aké máme v novom šate"). 'goldFrameCSS()' posiela
   'border: 6px solid transparent' a vrstvy zlata kreslí do 'border-box',
   kým dosku do 'padding-box'. Rám teda ŽIJE V LEME. Predošlé
   'border: none; padding: 6px' ten lem zrušilo, takže zlato nemalo kde byť
   vidieť a z rámu ostala len 1px linka z 'box-shadow' — blok vyzeral inak
   než spodný nav v '/map', z ktorého je predloha.

   Vlastný 'padding' komponentu ('px-6 pt-6 pb-6') sa preto ruší na NULU;
   vnútorný priestor dáva doska nižšie. */
[data-flow-skin="pale"] .dark-bg .papyrus-bg {
  ${goldFrameCSS()}
  padding: 0;
}
/* Obsah karty dostane vzduch dosky (zhodné s '.hf-plate'). */
[data-flow-skin="pale"] .dark-bg .papyrus-bg > * { padding-inline: 16px; }
[data-flow-skin="pale"] .dark-bg .papyrus-bg > *:first-child { padding-top: 12px; }
[data-flow-skin="pale"] .dark-bg .papyrus-bg > *:last-child { padding-bottom: 12px; }
/* Nadpis karty — na papyruse je 'text-primary' príliš svetlý. */
[data-flow-skin="pale"] .dark-bg .papyrus-bg h2,
[data-flow-skin="pale"] .dark-bg .papyrus-bg h3 { color: ${LAB.goldInk}; }

/* Heroglyf v karte je kresba 'currentColor' — na papyruse musí byť tmavý. */
[data-flow-skin="pale"] .dark-bg .papyrus-bg svg[viewBox="800 1100 13100 3500"] {
  color: ${LAB.ink};
}

/* ── VÝBER: fialová výplň → priesvitný lapisový tint ──────────────────────
   Lock 26. 8.: plná farebná plocha patrí JEDINÉMU hlavnému CTA na obrazovke,
   výber je tint. '.is-selected-purple' navyše nesie modrú, ktorá si s lapisom
   konkuruje. */
[data-flow-skin="pale"] .dark-bg .is-selected-purple {
  ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)}
  box-shadow: none;
}
[data-flow-skin="pale"] .dark-bg .is-selected-purple span,
[data-flow-skin="pale"] .dark-bg .is-selected-purple p { color: ${PICK_INK.lapis}; }
/* Nevybrané dlaždice: rám z papyrusovej rodiny, nie šedý hairline. */
[data-flow-skin="pale"] .dark-bg button[class*="border-border"] {
  border-color: rgba(201,154,63,.4);
  color: ${LAB.ink};
}
[data-flow-skin="pale"] .dark-bg button[class*="border-border"]:hover {
  border-color: rgba(201,154,63,.75);
}

/* Kresby volieb (pohlavie, osud, farba…) sú čierne siluety — na papyruse
   ostávajú, na tmavom ich obracal filter. Tu ho vypíname. */
[data-flow-skin="pale"] .dark-bg button img { filter: none; }

/* ── SPODNÉ „SPÄŤ" ────────────────────────────────────────────────────── */
[data-flow-skin="pale"] .dark-bg .text-muted-foreground { color: ${LAB.inkMuted}; }

/* ── HLAVNÉ CTA → LAPIS (brandový kánon od 28. 8.) ────────────────────────
   Staré obrazovky nepoužívajú '.btn-gold' ale shadcn 'bg-primary' (zlatý gradient
   z témy) — preto sú tu obe značky. Mení sa VÝPLŇ, nie tvar.
   ⚠️ Overené na živých obrazovkách: 'bg-primary' tlačidlo je na každej NAJVIAC
   JEDNO (about · breed · owner-info · owner-zodiac · owner-final · reveal ·
   message = 1; ranking a dog-character = 0), takže lock „plná farebná plocha
   patrí jedinému hlavnému CTA" drží. Keby na jednej obrazovke pribudlo druhé,
   toto pravidlo ho zafarbí tiež a lock padne — vtedy treba užší háčik.
   ⚠️ ''!important'' TU JE NUTNÉ, nie lenivosť: zlatý gradient, čierny inkoust aj
   tieň sedia na tlačidle ako INLINE ''style'' (''background: linear-gradient(135deg,
   hsl(var(--gold)), hsl(var(--gold-dark)))''), a inline prebije akýkoľvek selektor
   z hárka. Prefarbiť ''--gold'' by nešlo — tú premennú nesie aj logo a rámy.
   Preto sú prebité všetky tri vlastnosti naraz; keby ostal len ''background'',
   na lapise by ostal čierny text a zlatý tieň. */
[data-flow-skin="pale"] .dark-bg .btn-gold,
[data-flow-skin="pale"] .dark-bg button.bg-primary {
  background: ${LAPIS.grad} !important;
  color: ${LAPIS.ink} !important;
  box-shadow: ${LAPIS_BTN_SHADOW} !important;
  border-color: rgba(250,244,236,.30);
}
[data-flow-skin="pale"] .dark-bg button.bg-primary:hover:not(:disabled) {
  background: ${LAPIS.gradHover} !important;
}

/* ── BUBLINA ostáva tmavá (Matejova ručná voľba z LABu), len zladený rádius. */
[data-flow-skin="pale"] .dark-bg [style*="brand-gradient"] { border-radius: 16px; }
`;

/**
 * Vešia `data-flow-skin` na `<html>` na cestách vstupu a vkladá vrstvu.
 * Mimo vstupu atribút zmizne, takže `.dark-bg` na Terms/Vision/Login ostáva čierny.
 */
export function FlowRedress() {
  const { pathname } = useLocation();
  const skin = useFlowSkin();
  const onFlow = FLOW_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const root = document.documentElement;
    if (onFlow && skin === 'pale') root.dataset.flowSkin = 'pale';
    else delete root.dataset.flowSkin;
    // Odchod z routy MUSÍ atribút zložiť — inak prezlečenie ostane visieť
    // na ďalšej stránke, ktorá `.dark-bg` používa na niečo iné.
    return () => { delete root.dataset.flowSkin; };
  }, [onFlow, skin]);

  if (!onFlow) return null;
  return (
    <>
      <style>{REDRESS_CSS}</style>
      {skin === 'pale' && <FlowProgress pathname={pathname} />}
    </>
  );
}

/**
 * PROGRES VSTUPU — jeden pruh, bez popisov, na spodnej hrane.
 *
 * Matej 31. 8. 2026: *„dal by som iba progresbar bez textingu… nerozdeloval by som to
 * na 5 časti… a dal by som to úplne dolu"*. Tým zaniká pomenovaný pás fáz
 * (`FlowPhases`, `PES · TY · SYMBOL · HOTOVO`) — súbor sa nemaže, len ho nikto nevolá.
 *
 * 🔑 Kreslí sa TU, nie v obrazovkách. Vrstva prezliekania už vie, kde človek stojí,
 *    takže pruh nestojí ani jednu zmenu v devätnástich komponentoch — a keď sa šat
 *    prepne na tmavý (dev prepínač), zmizne s ním, takže „pred" ostane naozaj „pred".
 *
 * ⚠️ `pointer-events: none` — pruh leží nad obsahom a bez toho by ukradol ťuknutie
 *    tlačidlu, ktoré býva presne pod ním.
 * ⚠️ Spodná rezerva je `env(safe-area-inset-bottom)`, nie nula: na iPhone by pruh
 *    inak ležal pod domovským indikátorom.
 */
function FlowProgress({ pathname }: { pathname: string }) {
  const idx = FLOW_ORDER.indexOf(pathname);
  if (idx < 0) return null;
  const pct = Math.round(((idx + 1) / FLOW_ORDER.length) * 100);
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
        pointerEvents: 'none',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ height: 4, background: 'rgba(201,154,63,0.22)' }}>
        <div
          style={{
            height: '100%', width: `${pct}%`,
            background: LAPIS.grad,
            transition: 'width .28s ease',
          }}
        />
      </div>
    </div>
  );
}
