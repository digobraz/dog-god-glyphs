import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { LAB } from '@/lib/labTheme';
import { goldFrameCSS, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';
import { PACK_THEME as T } from '@/components/pack/packTheme';

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

/**
 * Cesty, na ktorých sa prezliekanie zapína. Mimo nich atribút na `<html>` nie je.
 *
 * ⚠️ Vstup NEKONČÍ na `/heroglyph` (doplnené 31. 8. 2026 — Matej: „od checkoutu si
 *    nemenil bloky"). Checkout, platba aj `/welcome` používajú tie isté háčiky
 *    `.dark-bg` a `.papyrus-bg`, takže bez nich zostal koniec cesty čierny, hoci
 *    celý vstup pred ním je papyrusový.
 * ⚠️ `/cert-render` sa sem NESMIE dostať: certifikát sa z nej screenshotuje a šat by
 *    sa zapiekol do obrázka. Overené — tá routa `.dark-bg` ani `.papyrus-bg` nemá.
 */
const FLOW_PATHS = ['/heroglyph', '/checkout', '/payment', '/welcome'];

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

  /* 🔴 VZDUCH PATRÍ KARTE, NIE DEŤOM (oprava 31. 8. 2026 — Matej: „tlačítko sa
     dotýka okrajov… tieň tlačítka presvitá z blok").
     Pôvodne tu bolo 'padding: 0' a odsadenie sa dávalo deťom cez
     '.papyrus-bg > * { padding-inline: 16px }'. Na 'div' to vyzeralo správne,
     lebo padding odsunul jeho OBSAH — ale BOX dieťaťa ostal na hranici dosky.
     Pri '<button>', ktorý je na väčšine obrazoviek priame dieťa, sa tým odsadenie
     nedostalo VON: padding mu len zväčšil vnútro, výplň aj tieň ostali opreté
     o zlatý rám a tieň spod neho vytekal. Premerané na 19 cestách — netýkalo sa
     to jednej obrazovky, ale každej, ktorá kartu má. */
  padding: 12px 16px;
}
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
/* Nevybrané dlaždice = PODBLOK z matrice (úroveň 2), nie šedý hairline.
   🔴 Malo tu 'border-color: rgba(201,154,63,.4)' na priesvitnom podklade —
   presne ten „plochý blok so slabým okrajom", ktorý Matej zamietol už trikrát
   ('je to suché bez šťavy' 26. 7. · 'je to také plané' 12. 8. · 'majú slabé
   okraje' 13. 8.) a naposledy 31. 8. na siluete. Kánon úrovne 2 je papyrusový
   gradient + PLNÝ zlatý rám + lift a inset highlight.
   Výplň sa neopisuje ručne — berie sa 'T.panelGrad' z matrice; rám je 'LAB.edge',
   teda zlatá z papyrusovej sady, nie z tmavej (tie dve sa nemiešajú). */
/* ⚠️ ''[class*="absolute"]'' JE VYLÚČENÉ, a nie je to detail (oprava 31. 8. 2026 —
   Matej: „výber patróna na bokoch pri kategóriách presvitá iná farba… aj pri povahe si
   zrušil tie prechody mimo záber").
   Okrúhle šípky posunu (''absolute … rounded-full border border-border bg-background/90'')
   tento háčik tiež chytili a dostali NEPRIEHĽADNÚ dlaždicovú výplň. Tým prekryli pilulky
   pod sebou a zabili jediné, čo hovorí „pokračuje to ďalej". Prekryv nie je dlaždica:
   dlaždica je plocha, po ktorej sa vyberá, prekryv je sklo, cez ktoré musí byť vidno. */
[data-flow-skin="pale"] .dark-bg button[class*="border-border"]:not([class*="absolute"]) {
  border-color: ${LAB.edge};
  background: ${T.panelGrad};
  color: ${LAB.ink};
  box-shadow: 0 6px 16px -10px rgba(110,71,16,.45), inset 0 1px 0 rgba(255,255,255,.55);
}
[data-flow-skin="pale"] .dark-bg button[class*="border-border"]:not([class*="absolute"]):hover {
  border-color: ${LAB.goldSolid};
  box-shadow: 0 8px 20px -10px rgba(110,71,16,.55), inset 0 1px 0 rgba(255,255,255,.7);
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

/* Nedostupné CTA — NIE stlmený lapis (oprava 31. 8. 2026).
   shadcn dáva zakázanému tlačidlu 'opacity: .4'. Na tmavom webe to fungovalo,
   na papyruse sa 40 % lapisu číta ako ŠEDÁ PLOCHA a jeho stlmený tieň sa spod
   nej rozotiera — Matej to videl na siluete ako „šedé tlačítko a tieň presvitá".
   Nedostupnosť tu preto nesie MATERIÁL, nie priesvitnosť: plochý papyrus,
   tlmený inkoust, žiadny tieň. Tvar ostáva, takže je vidieť, čo pribudne. */
[data-flow-skin="pale"] .dark-bg .btn-gold:disabled,
[data-flow-skin="pale"] .dark-bg button.bg-primary:disabled {
  background: ${T.tileBg} !important;
  color: ${LAB.inkMuted} !important;
  box-shadow: none !important;
  border-color: ${LAB.hairline};
  opacity: 1;
}

/* ── KOLIESKO ROKOV (čínsky horoskop) ────────────────────────────────────
   Tri prekryvy s natvrdo zapísanými farbami, ktoré sa na tmavom webe strácali
   a na papyruse kričia (Matej 31. 8.: „veľa chýb v každom kroku"):
     · pás výberu   'rgba(46,83,184,…)' — modrá, ale NIE naša lapisová
     · dve blednutia 'rgb(240,234,224)' — skoro biela, robí z kolieska
       biely panel položený na papyrusovej doske
   Pás výberu je „moja voľba", takže patrí do LAPISU a ako TINT, nie plná
   farba (lock 26. 8.). Blednutia musia miznúť DO DOSKY — a doska nie je
   najsvetlejší papyrus: prvý pokus vzal ''T.card'' (#FBF5E6), čo je SVETLEJŠIE
   než plocha pod kolieskom, takže z troch prekryvov (28+28+28 px, spolu celá
   výška) ostal biely pás. Správny odtieň je papyrusový stred ''LAB.pageBg''.
   ⚠️ Háčik ide cez ''background-image'', lebo prekryvy nemajú vlastnú triedu —
   sú to ''absolute'' vrstvy odlíšené len smerom gradientu. */
[data-flow-skin="pale"] .dark-bg [class*="absolute"][class*="left-0"][class*="right-0"][style*="height"] {
  /* ⚠️ BEZ VÝPLNE. Lapisový tint (12 %) sa na teplom papyruse odfarbí do šedej
     a veľká plocha z toho spraví šedý pás — čitateľnosť tintu nesie tmavý
     inkoust a plný rám, nie krytie výplne (lock 26. 8.). Výber tu preto nesú
     DVE LINKY, čo je aj zaužívaný tvar kolieska. */
  background-image: none !important;
  border-top-color: ${LAPIS.edge} !important;
  border-bottom-color: ${LAPIS.edge} !important;
}
/* Blednutie hore a dole: NIE prekryv vo farbe podkladu, ale MASKA na samotnom
   koliesku. Farebný prekryv musí trafiť odtieň dosky presne — a doska je gradient
   s mramorovaním, takže žiadna plná farba ho netrafí: prvý pokus bol svetlejší
   (biely pás), druhý tmavší (viditeľná obruba). Maska mizne do PRIEHĽADNA, takže
   funguje nad akýmkoľvek podkladom a nemá čo netrafiť. Prekryvy sa preto vypnú. */
[data-flow-skin="pale"] .dark-bg .inset-x-0.top-0[class*="pointer-events-none"],
[data-flow-skin="pale"] .dark-bg .inset-x-0.bottom-0[class*="pointer-events-none"] {
  background-image: none !important;
}
[data-flow-skin="pale"] .dark-bg [class*="overflow-y-scroll"][class*="snap-y"] {
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%);
}

/* ── ZADNÁ STRANA BLOKU (vysvetlivky pod ⓘ) ───────────────────────────────
   Matej 31. 8.: „vôbec si neupravil zadné časti blokov kde sú vysvetlivky."
   Bublina sa po ťuknutí na ⓘ preklopí a jej DRUHÁ STRANA je prekryv
   ''absolute inset-0'' s ''background-color: hsl(var(--papyrus))''. Na čiernom webe
   to bol kontrast (tmavá → svetlá), na papyruse je to plochý svetlý obdĺžnik BEZ
   RÁMU medzi dvoma zlato rámovanými blokmi — jediný prvok obrazovky mimo sústavy.
   Dostáva preto ten istý blok z matrice ako jeho susedia. */
[data-flow-skin="pale"] .dark-bg .absolute.inset-0[style*="papyrus"] {
  ${goldFrameCSS()}
  background-color: transparent !important;
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
