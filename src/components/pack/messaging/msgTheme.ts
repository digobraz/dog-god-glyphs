// ════════════════════════════════════════════════════════════════════════════
// SPRÁVY — SVETLÝ A TMAVÝ ŠAT (2026-09-01)
// ────────────────────────────────────────────────────────────────────────────
// Matej: „správy daj možnosť aj prepnúť do tmavej = to isté ale v čiernej
// s oranžovozlatou a bledou farbou bubliniek."
//
// 🔑 DVE PALETY, JEDNA SADA PRAVIDIEL. Farby sú CSS premenné; `Inbox.tsx`
//    a `Thread.tsx` píšu `var(--msg-…)` a NEVEDIA, ktorý šat práve beží.
//    ⚠️ Vedomá odchýlka od vzoru na WALL (`GodsGridLab` má `.theme-light X {…}`,
//       teda každé pravidlo dvakrát). Pri ~45 pravidlách správ by to znamenalo
//       dve sady tých istých čísel — a tie sa rozídu pri prvej úprave. Tu sa
//       mení iba blok tokenov dole; kto pridá pravidlo, dostane oba šaty zadarmo.
//
// 🔑 ČO SA V TMAVEJ MENÍ OPROTI SVETLEJ (nie je to len prevrátenie):
//    · MOJA bublina je ORANŽOVOZLATÁ (#F5C73D→#E69E1A), nie lapisová. Lapis je
//      tmavá modrá — na čiernom by zanikol.
//    · CUDZIA bublina je BLEDÁ (papyrus #FBF5E6 s tmavým inkoustom), nie tmavá
//      doska. Obe bubliny sú teda svetlé na čiernom a líšia sa farbou, presne
//      ako to Matej zadal.
//    · Odosielacie tlačidlo drží farbu MOJEJ bubliny (v svetlej lapis, v tmavej
//      oranžovozlatá) — je to tá istá rodina „ja", nie druhá hlavná vec.
//
// ⚠️ ORANŽOVOZLATÁ NA PLOCHE: lock z 28. 8. („zlatá plocha ≠ zlaté tlačidlo",
//    Matej: „tato zlata oranžová je ainubisova") hovorí o KARTE, BLOKU a PÁSE.
//    Bublina je malá zaoblená plôška s textom, teda bližšie k tlačidlu — a Matej
//    si ju sem vypýtal menovite. Nerozširuj tú farbu na väčšie plochy správ.
// ════════════════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { PACK_THEME, PAPER_BG } from '@/components/pack/packTheme';
import { goldFrameCSS } from '@/components/pack/navGoldSkin';

const T = PACK_THEME;

export type MsgSkin = 'light' | 'dark';

const KEY = 'dogypt.messages.skin.v1';

// Inbox a Thread sú dva komponenty, ale jeden povrch — bez spoločného kanála by
// si po prepnutí v inboxe vlákno ďalej svietilo po starom. Rovnaký pub/sub vzor
// ako `openBridge.ts`, žiadny globálny store.
type Listener = (s: MsgSkin) => void;
const listeners = new Set<Listener>();

function read(): MsgSkin {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light'; // private mode / zakázané úložisko — nesmie to zhodiť správy
  }
}

let current: MsgSkin = read();

export function setMsgSkin(s: MsgSkin): void {
  current = s;
  try { localStorage.setItem(KEY, s); } catch { /* quota / private mode */ }
  listeners.forEach((l) => l(s));
}

/** `const [skin, toggle] = useMsgSkin()` — vráti šat a prepínač. */
export function useMsgSkin(): [MsgSkin, () => void] {
  const [skin, setSkin] = useState<MsgSkin>(current);
  useEffect(() => {
    setSkin(current); // iná inštancia mohla prepnúť skôr, než sa táto pripojila
    const l: Listener = (s) => setSkin(s);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return [skin, () => setMsgSkin(current === 'dark' ? 'light' : 'dark')];
}

// ── Doska pod zoznamom ──────────────────────────────────────────────────────
// Zlatý rám drží v OBOCH šatoch (je to konštrukcia), mení sa iba povrch dosky.
// Px-zastávky sú zámerné: gradient v percentách sa roztiahne na výšku prvku a na
// vysokom paneli by ukazoval prvé promile — to je tá istá príčina, pre ktorú má
// `PANEL_SURFACE` zastávky v px (referenčná výška dosky = 44 px).
const PLATE_DARK = 'linear-gradient(180deg, #1E140A 0px, #150E07 18px, #0F0A05 32px, #0A0704 44px)';

export const MSG_SKIN_CSS = `
/* ── ŠAT: SVETLÝ (východiskový) ─────────────────────────────────────────── */
.msg-skin{
  --msg-page:${PAPER_BG};
  --msg-wall:url('/images/bg-light.webp');
  --msg-veil:radial-gradient(ellipse at 52% 58%, rgba(223,196,144,0.62) 0%, rgba(238,221,186,0.34) 52%, rgba(255,252,244,0.10) 100%),
             linear-gradient(135deg, rgba(250,243,225,0.35) 0%, rgba(244,231,199,0.40) 50%, rgba(236,218,175,0.45) 100%);
  --msg-bar:${T.panelGrad};
  --msg-bar-edge:rgba(179,130,45,0.55);
  --msg-bar-shadow:0 2px 10px rgba(122,90,42,0.10);
  --msg-title:#8A5F1E;
  --msg-ink:#2a1608;
  --msg-dim:#7a5a2a;
  --msg-faint:rgba(42,22,8,0.42);
  --msg-block:${T.panelGrad};
  --msg-block-edge:${T.cardEdge};
  --msg-block-ink:#2a1608;
  --msg-block-shadow:0 2px 6px rgba(122,90,42,0.16), inset 0 1px 0 rgba(255,255,255,0.45);
  --msg-block-hover:0 0 0 3px rgba(201,154,63,0.28), 0 3px 9px rgba(122,90,42,0.20);
  /* MOJA bublina + odosielacie tlačidlo = jedna rodina „ja". */
  --msg-mine:linear-gradient(180deg,#16307A,#0A1A4A);
  --msg-mine-hover:linear-gradient(180deg,#1E3C90,#0F2560);
  --msg-mine-edge:#0A1A4A;
  --msg-mine-ink:#EFD79A;
  --msg-mine-shadow:0 4px 13px -3px rgba(5,15,48,0.6), inset 0 1px 0 rgba(201,154,63,0.30);
  --msg-focus:#16307A;
  --msg-focus-halo:rgba(22,48,122,0.22);
  --msg-btn:rgba(255,251,240,0.55);
  --msg-btn-edge:rgba(179,130,45,0.55);
  --msg-btn-ink:#2a1608;
  --msg-btn-hot:#FFFDF6;
  --msg-field:#FBF5E6;
  --msg-field-ink:#2a1608;
  --msg-chip:rgba(201,154,63,0.20);
  --msg-chip-hot:rgba(201,154,63,0.32);
  --msg-chip-ink:#8A5F1E;
  --msg-dot-ring:#FBF5E6;
  --msg-err:#8E2A20;
  --msg-off:rgba(201,154,63,0.20);
  /* Filter ikonky v tlacidle odoslania. Na lapise biela, na oranzovozlatej tmava.
     Su to DOSLOVNE retazce z FILTERS v BrandIcon.tsx — ten ich sype inline, takze sa
     z CSS prebijaju len s !important (precedens .trp-header-notif v PackMap.tsx). */
  --msg-icon:brightness(0) invert(1);
  /* Značka prepínača je čierna cesta — v svetlom šate ju stmavíme do inkoustu,
     v tmavom zosvetlíme. Zhodné filtre s FILTERS v BrandIcon.tsx. */
  --msg-glyph:brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%);
}
.msg-skin .msg-plate{${goldFrameCSS()}}

/* ── ŠAT: TMAVÝ ────────────────────────────────────────────────────────────
   Matej: „to isté ale v čiernej s oranžovozlatou a bledou farbou bubliniek."
   Nie je to prevrátenie svetlého: OBE bubliny sú tu svetlé na čiernom a líšia sa
   FARBOU (moja oranžovozlatá, cudzia papyrusová), nie svetlosťou. Preto má cudzia
   bublina tmavý inkoust aj v tmavom šate — je to bledá plôška, nie tmavá doska. */
.msg-skin--dark{
  --msg-page:${T.pageBg};
  --msg-wall:url('/images/bg-dark.webp');
  --msg-veil:radial-gradient(ellipse at 52% 58%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.62) 58%, rgba(0,0,0,0.86) 100%);
  --msg-bar:linear-gradient(135deg,#171009 0%,${T.pageBg} 100%);
  --msg-bar-edge:rgba(201,154,63,0.45);
  --msg-bar-shadow:0 2px 12px rgba(0,0,0,0.55);
  --msg-title:#E0B457;
  --msg-ink:rgba(245,240,228,0.86);
  --msg-dim:rgba(245,240,228,0.52);
  --msg-faint:rgba(245,240,228,0.34);
  /* CUDZIA bublina a riadok inboxu = BLEDÁ plôška s tmavým inkoustom. */
  --msg-block:linear-gradient(160deg,#FBF5E6 0%,#F1E2C0 100%);
  --msg-block-edge:${T.cardEdge};
  --msg-block-ink:#2a1608;
  --msg-block-shadow:0 3px 12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55);
  --msg-block-hover:0 0 0 3px rgba(201,154,63,0.42), 0 4px 14px rgba(0,0,0,0.6);
  /* MOJA bublina = oranžovozlatá; tlačidlo odoslania ju nasleduje. */
  --msg-mine:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  --msg-mine-hover:linear-gradient(135deg,#FFD65A 0%,#F0A81E 100%);
  --msg-mine-edge:rgba(250,244,236,0.30);
  --msg-mine-ink:#2a1608;
  --msg-mine-shadow:0 4px 14px -4px rgba(230,158,26,0.55), inset 0 1px 0 rgba(255,255,255,0.30);
  --msg-focus:${T.cardEdge};
  --msg-focus-halo:rgba(201,154,63,0.28);
  --msg-btn:rgba(245,240,228,0.07);
  --msg-btn-edge:rgba(245,240,228,0.18);
  --msg-btn-ink:rgba(245,240,228,0.86);
  --msg-btn-hot:rgba(245,240,228,0.14);
  --msg-field:rgba(245,240,228,0.06);
  --msg-field-ink:rgba(245,240,228,0.86);
  --msg-chip:rgba(201,154,63,0.16);
  --msg-chip-hot:rgba(201,154,63,0.30);
  --msg-chip-ink:#E0B457;
  --msg-dot-ring:${T.pageBg};
  --msg-err:#E8A79A;
  --msg-off:rgba(245,240,228,0.10);
  --msg-icon:brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(800%) hue-rotate(2deg) brightness(75%) contrast(90%);
  --msg-glyph:brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%);
}
/* ⚠️ V TMAVOM ŠATE NIE JE DOSKA ZLATO-RÁMOVANÝ BLOK, ALE LIQUID GLASS
   (Matej 1. 9. 2026: „pri dark mode nedávaj blok s okrajom ale liquid glass").
   Recept NEVYMÝŠĽAM — je to .pk-glass z packTheme.ts, teda tmavé sklo, ktoré appka
   používa všade inde; mení sa len polomer, aby sedel s ostatnými blokmi správ (14, nie 24).
   Tenká svetlá hrana NIE JE „okraj" v tom zmysle, čo Matej zamietol — je to odlesk skla;
   zamietnutý bol ťažký zlatý rám. Bez nej sklo nemá hranu a rozteká sa do pozadia.
   ⚠️ backdrop-filter rozmazáva to, čo je POD prvkom. Funguje tu preto, že tapeta .msg-skin
      leží na pseudoprvkoch so z-index:-1, teda v tom istom vrstviacom kontexte — keby sa
      tapeta presunula mimo neho, sklo by zostalo prázdne. */
.msg-skin--dark .msg-plate{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border:1px solid rgba(245,240,228,0.14);
  border-radius:14px;
  box-shadow:0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(245,240,228,0.12);
}
/* Lepiaca hlavička je nad scrollujúcim obsahom, teda ten istý prípad — v tmavom šate
   ide tiež do skla, nech na jednej obrazovke nestoja dva rôzne materiály. */
.msg-skin--dark .msg-inbox-head,
.msg-skin--dark .msg-thread-head,
.msg-skin--dark .msg-thread-send,
.msg-skin--dark .msg-thread-join,
.msg-skin--dark .msg-blocked{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border-color:rgba(245,240,228,0.14);
}

/* ── PODKLAD STRÁNKY ────────────────────────────────────────────────────────
   Rovnaký recept ako .pk-paper v packTheme.ts, len s premennými, aby ho vedeli
   niesť oba šaty. Preto sa sem .pk-paper NEPRIDÁVA a <HieroglyphBg /> sa
   NEVOLÁ — boli by dve tapety cez seba (a HieroglyphBg žije v PackLayout.tsx,
   ktorý si Inbox a Thread lazy importuje, takže by to bol kruh).
   ⚠️ "isolation:isolate" JE NOSNÉ: vrstvy stoja na "z-index:-1" a bez vrstviaceho
   kontextu prepadnú pod nepriehľadné pozadie rodiča. Nemeň to na transform ani
   filter — tie by prepísali obklopujúci blok pre "position:fixed" potomkov. */
.msg-skin{position:relative;isolation:isolate;background-color:var(--msg-page);color:var(--msg-ink);}
.msg-skin::before{content:'';position:fixed;top:0;left:0;width:100vw;height:100lvh;
  background-image:var(--msg-wall);background-size:cover;background-position:center;
  background-repeat:no-repeat;filter:blur(4px);pointer-events:none;}
.msg-skin::after{content:'';position:fixed;top:0;left:0;width:100vw;height:100lvh;
  pointer-events:none;background:var(--msg-veil);}
.msg-skin::before,.msg-skin::after{z-index:-1;}

/* Prepínač šatu. Kit MOON nemá, tak sa v oboch stavoch kreslí SLNKO a mení sa
   jeho stav: v svetlom šate svieti (zapnuté svetlo), v tmavom je stlmené.
   ⚠️ Mesiac si treba vypýtať od Mateja — „v kite to nie je" je dôvod ho vypýtať,
      nie siahnuť po lucide. Potom sa tu vymení ikonka podľa stavu. */
.msg-skinbtn{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:var(--msg-btn);border:1px solid var(--msg-btn-edge);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,background .15s;}
.msg-skinbtn:hover{border-color:${T.cardEdge};background:var(--msg-btn-hot);}
.msg-skinbtn img{width:17px;height:17px;object-fit:contain;filter:var(--msg-glyph) !important;}
`;
