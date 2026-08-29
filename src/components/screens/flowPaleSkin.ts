import { LAB } from '@/lib/labTheme';
import { goldFrameCSS, LAPIS, LAPIS_BTN_SHADOW, pickTintCSS, PICK_INK } from '@/components/pack/navGoldSkin';

// ════════════════════════════════════════════════════════════════════════════
// BLEDÝ ŠAT VSTUPNÉHO FLOW — jediný zdroj (28. 8. 2026)
// ────────────────────────────────────────────────────────────────────────────
// Matej 28. 8.: *„nový šat = pozadie nebude čierne ale béžové ako je aj na
// /onepage"* + *„ved na to sme robili LAB… takto nejak"* (snímok LABu
// s vypísaným objektom `HF`).
//
// Hodnoty NIE SÚ vymyslené — sú to kľúče objektu `HF` z
// `plany/lab-heroflow-2026-08-28.html`, ktorý Matej doladil a odklepol:
//
//   skin:'new' · page:'pale'
//   bubble:{ mode:'dark', hek:144, radius:16, pad:20, title:17 }
//   card:{ fill:'gold', pad:14, gap:10 }        ← `radius`/`edge` sú tu MŔTVE kľúče
//   cta:{ tone:'lapis', h:40, radius:12, size:14 }
//   pick:{ style:'tint' } · field:{ h:48, radius:12 }
//
// ⚠️ **Tmavá bublina je Matejova RUČNÁ zmena oproti presetu.** Prepínač „NOVÝ šat"
//    v LABe nastavuje `bubble.mode:'pale'`; on ho vrátil na `dark`. Na bledej
//    stránke je bublina JEDINÝ tmavý prvok — buď to nesie, alebo trhá, a on
//    sa rozhodol, že to nesie. Preset teda nie je zdroj pravdy, objekt `HF` áno.
//
// ⚠️ **Zlatý blok sa z LABu NEOPISUJE.** LAB má vlastné `--nav-frame`/`--nav-plate`
//    kópie (odliatok spodného navu `/map`); appka volá `goldFrameCSS()` BEZ
//    parametrov — lock v `CLAUDE.md`, tvar drží `BLOCK` (radius 14, rám 6 px).
//    Labový `border-radius:14px` + `padding:6px` na to sedí presne.
//    ⚠️ V appke je to JEDEN element (rám aj doska sú vrstvy pozadia); LAB ich má
//    dva, lebo cez holé CSS premenné sa to jedným nakresliť nedá.
//
// ⚠️ Prečo modul a nie CSS v obrazovke: bledý šat dostane postupne celý vstup
//    (mail je prvý). Tri obrazovky s tromi kópiami tých istých čísel = ten istý
//    rozchod, ktorý si vyžiadal `PACK_BOX` aj `goldFrameCSS`.
// ════════════════════════════════════════════════════════════════════════════

/** Rozmery z objektu `HF`. Ladí sa TU, nie v obrazovkách. */
export const HF = {
  // ⚠️ 144 bolo z LABu; Matej 28. 8.: „foto hektora je enormne veľká" ⇒ 96 na mobile,
  //    112 od 768 px. Je to JEDNO číslo pre celý vstup — obrazovky si veľkosť nepíšu samy.
  bubble: { hek: 96, hekMd: 112, radius: 16, pad: 20, title: 17 },
  card: { pad: 14, gap: 10 },
  gapBlocks: 12,
  cta: { h: 40, radius: 12, size: 14 },
  field: { h: 48, radius: 12 },
} as const;

/** Podnadpis bubliny — LAB ho počíta z nadpisu, nie je to voľné číslo. */
const BUBBLE_SUB = Math.max(11, Math.round(HF.bubble.title * 0.78));

export const FLOW_PALE_CSS = `
.hf-pale {
  position: relative;
  background: ${LAB.pageBg};
}
.hf-pale::before {
  content: '';
  position: fixed;
  inset: 0;
  background: ${LAB.pageBackdrop};
  z-index: 0;
  pointer-events: none;
}
.hf-pale > * { position: relative; z-index: 1; }

/* ── HORNÁ LIŠTA ──────────────────────────────────────────────────────────
   \`PageTopBar\` je LOCKED a bledý variant nemá. Logo je zlatá kresba na
   priehľadnom pozadí — na papyruse svieti a stráca sa, preto ten istý filter,
   ktorým si ju sfarbuje LAB. Zásah je zvonku, komponent ostáva nedotknutý.
   ⚠️ Háčik je vlastný obal \`.hf-topbar\`, NIE tailwindová trieda z komponentu —
   tá sa pri prvej úprave \`PageTopBar\` zmení a šat ticho odpadne. */
.hf-topbar img[alt="DOGYPT"] {
  filter: brightness(.34) sepia(1) saturate(2.2) hue-rotate(-12deg);
}
.hf-topbar button { color: ${LAB.goldInk}; }

/* ── BUBLINA (tmavá, jediný tmavý prvok obrazovky) ────────────────────── */
.hf-bubble {
  width: 100%;
  border-radius: ${HF.bubble.radius}px;
  background: var(--brand-gradient);
  padding: ${HF.bubble.pad}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${Math.round(HF.bubble.pad * 0.6)}px;
  text-align: center;
}
.hf-bubble h2 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: ${HF.bubble.title}px;
  line-height: 1.3;
  color: #FAF4EC;
}
.hf-bubble p {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: ${BUBBLE_SUB}px;
  line-height: 1.5;
  color: rgba(250, 244, 236, 0.72);
}
.hf-hek {
  width: ${HF.bubble.hek}px;
  height: ${HF.bubble.hek}px;
  object-fit: contain;
}
@media (min-width: 768px) {
  .hf-hek { width: ${HF.bubble.hekMd}px; height: ${HF.bubble.hekMd}px; }
}

/* ── ZLATÝ BLOK ───────────────────────────────────────────────────────── */
.hf-block {
  width: 100%;
  margin-top: ${HF.gapBlocks}px;
  ${goldFrameCSS()}
}
.hf-plate {
  display: flex;
  flex-direction: column;
  gap: ${HF.card.gap}px;
  padding: ${HF.card.pad}px;
}

/* ── NAPÄTIE A SĽUB OKOLO TLAČIDLA (krok 2) ───────────────────────────────
   Červená hovorí, čo je zlé (meno samo nestačí), zelená čo z toho bude.
   Sú to brandové tokeny \`alertRed\` / \`growGreen\` z \`packTheme.ts\`, nie voľná
   červená a zelená — obe sú kalibrované na papyrus, takže tu držia bez úpravy.
   ⚠️ Zelená je VETA POD tlačidlom, nie tlačidlo: lapisový kánon CTA platí. */
.hf-alert   { margin: 0; text-align: center; font-size: 12px; line-height: 1.4; font-weight: 500;
              font-family: 'Space Grotesk', sans-serif; color: #B25640; }
.hf-promise { margin: 0; text-align: center; font-size: 12px; line-height: 1.4; font-weight: 500;
              font-family: 'Space Grotesk', sans-serif; color: #3D7A4E; }

.hf-qlabel {
  margin: 0; text-align: center; font-family: 'Cinzel', serif; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em; font-size: 11.5px; color: ${LAB.ink};
}

/* ── ZOZNAM PSOV (krok 3) ─────────────────────────────────────────────────
   Matej 28. 8.: *„tu tie bloky takmer neviditeľné ((psy) žiadne rozlíšenie…)"* —
   riadok mal 8 % zlatý nádych a vyblednutý 1px rám, čo je na papyrusovej doske
   to isté, ako keby tam nebol.
   🔑 **Recept nie je vymyslený — je to PODBLOK z matrice** (\`PACK_BOX.subblock\`
   v \`packTheme.ts\`): papyrusový gradient + PLNÝ zlatý rám + lift a inset
   highlight. Presne ten, ktorý Matej dvakrát vypýtal namiesto plochého
   \`tileBg\` (*„je to suché bez šťavy"*, *„majú slabé okraje"*). Polomer drží
   \`PLATE_TILE_R\` (12) — dlaždica na doske, nie tretí polomer.
   ⚠️ Hodnoty sú opísané a nie importované zámerne: \`PACK_BOX\` je objekt pre
   \`style={{}}\`, toto je CSS reťazec. Keď sa matrica zmení, mení sa aj tu. */
.hf-dogrow {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
  padding: 9px 11px; border-radius: 12px; cursor: pointer;
  background: linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);
  border: 1px solid ${LAB.goldSolid};
  box-shadow: 0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40);
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.hf-dogrow:hover {
  transform: translateY(-1px); border-color: #C99A3F;
  box-shadow: 0 4px 10px rgba(122,90,42,0.20), inset 0 1px 0 rgba(255,255,255,0.55);
}
.hf-dogrow .pic {
  width: 42px; height: 42px; border-radius: 50%; flex: 0 0 auto; overflow: hidden;
  border: 2px solid ${LAB.goldSolid}; background: rgba(201,154,63,.14);
  display: grid; place-items: center;
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 17px; color: ${LAB.goldInk};
}
.hf-dogrow .pic img { width: 100%; height: 100%; object-fit: cover; }
/* Dva riadky textu sú to, čo psov ROZLIŠUJE — samotné meno nestačí, kým ho pes nemá. */
.hf-dogrow .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.hf-dogrow .nm {
  min-width: 0; font-family: 'Cinzel', serif; font-weight: 700; font-size: 14.5px;
  letter-spacing: .05em; color: ${LAB.ink};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hf-dogrow.is-empty .nm { color: ${LAB.inkMuted}; }
.hf-dogrow .meta {
  min-width: 0; font-family: 'Space Grotesk', sans-serif; font-size: 11.5px;
  line-height: 1.3; color: ${LAB.inkSoft};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.hf-dogrow.is-empty .meta { color: ${LAB.goldInk}; }
/* Ikonka stavu je ZNAČKA, nie tlačidlo — klikateľný je CELÝ riadok (Matej 28. 8.:
   „pri kliknutí na MENO psa je možnosť živúca legenda / psí anjel"). Tlačidlo
   vnorené v tlačidle je navyše neplatné HTML. */
.hf-dogrow .st {
  flex: 0 0 auto; width: 32px; height: 32px; border-radius: 50%;
  display: grid; place-items: center;
  border: 1.5px solid rgba(201,154,63,.5); background: rgba(255,255,255,.55);
}
/* Ikonky sú čierne kresby na priehľadnom — na papyruse ostávajú čierne. */
.hf-dogrow .st img { width: 19px; height: 19px; object-fit: contain; filter: brightness(0); }

.hf-addrow {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 9px; border-radius: 12px; cursor: pointer; background: none;
  border: 2px dashed rgba(201,154,63,.45);
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 12px;
  letter-spacing: .08em; text-transform: uppercase; color: ${LAB.inkSoft};
}
.hf-addrow b { font-size: 17px; line-height: 1; color: ${LAB.goldInk}; }

/* ── NÁRODNOSŤ — JEDEN RIADOK ─────────────────────────────────────────────
   Matej 28. 8.: *„národnosť v úvode zmenši a daj do jedného riadku aj výber aj
   checkmark, nerozťahujme to"*. Boli to štyri prvky pod sebou (nadpis · výber ·
   veta o IP · políčko) — štyri riadky na jednu odpoveď.
   ⚠️ Zanikla aj veta „Vyplnené podľa tvojho pripojenia": predvyplnenie podľa IP
   NIE JE zapojené (hosting krajinu v hlavičke nedáva), takže riadok tvrdil niečo,
   čo sa nedeje. Vráti sa v deň, keď predvyplnenie naozaj bude. */
.hf-natline { display: flex; align-items: center; gap: 8px; width: 100%; }
.hf-natline .hf-field, .hf-natline .hf-natrow { height: 40px; flex: 1 1 auto; min-width: 0; }
.hf-natrow { display: flex; align-items: center; gap: 8px; padding: 0 10px; }
.hf-natrow .flag { font-size: 17px; line-height: 1; flex: 0 0 auto; }
.hf-natrow .val {
  flex: 1; min-width: 0; font-family: 'Space Grotesk', sans-serif; font-size: 14px;
  color: ${LAB.ink}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── VÝBER KRAJINY S HĽADANÍM (\`CountryPick.tsx\`) ─────────────────────────
   Pole vyzerá ako \`.hf-field\`, ale je to obal: vlajka + vstup. Ponuka visí POD
   ním v toku bloku — \`position: absolute\`, aby netlačila obsah dosky nadol.
   ⚠️ Obal má \`position: relative\` a vyššie \`z-index\`, inak ponuku prekryje CTA
   pod ňou (obe sú v tom istom stacking contexte dosky). */
.hf-cpick { position: relative; flex: 1 1 auto; min-width: 0; z-index: 3; }
.hf-cpick-field { display: flex; align-items: center; gap: 8px; padding: 0 10px; }
.hf-cpick-field .flag { font-size: 17px; line-height: 1; flex: 0 0 auto; }
.hf-cpick-field input {
  flex: 1; min-width: 0; height: 100%; border: none; background: none; outline: none;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.ink};
}
.hf-cpick-field input::placeholder { color: ${LAB.inkMuted}; }
.hf-cpick-menu {
  position: absolute; left: 0; right: 0; top: calc(100% + 5px); z-index: 5;
  overflow-y: auto; padding: 5px;
  display: flex; flex-direction: column; gap: 2px;
  background: linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);
  border: 1.5px solid ${LAB.goldSolid}; border-radius: 12px;
  box-shadow: 0 12px 30px rgba(60,40,10,.28);
}
/* Nahor, keď pod poľom nie je miesto — výšku doplní komponent podľa merania. */
.hf-cpick-menu.up { top: auto; bottom: calc(100% + 5px); }
.hf-cpick-item {
  display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
  padding: 8px 9px; border: none; border-radius: 8px; background: none; cursor: pointer;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: ${LAB.ink};
}
.hf-cpick-item:hover { background: rgba(201,154,63,.16); }
.hf-cpick-item.on { ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.hf-cpick-item .flag { font-size: 17px; line-height: 1; flex: 0 0 auto; }
.hf-cpick-item .lbl { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hf-cpick-empty {
  margin: 0; padding: 10px; text-align: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 12.5px; color: ${LAB.inkMuted};
}

/* Zaškrtnuté políčko je PRIESVITNÝ TINT + plný lapisový rám (lock 26. 8.) —
   plná farebná plocha ostáva jedinému CTA na obrazovke. */
.hf-chk {
  display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
  padding: 8px 10px; border-radius: 10px; cursor: pointer;
  border: 1px solid rgba(201,154,63,.45); background: rgba(201,154,63,.05);
}
.hf-chk .box {
  flex: 0 0 auto; width: 19px; height: 19px; border-radius: 5px;
  border: 2px solid rgba(179,130,45,.55); background: rgba(255,255,255,.5);
  display: grid; place-items: center; transition: .15s;
}
.hf-chk.on .box { border-color: ${LAPIS.edge}; background: ${LAPIS.fill}; }
.hf-chk .box svg { width: 12px; height: 12px; opacity: 0; transition: .15s; }
.hf-chk.on .box svg { opacity: 1; }
.hf-chk .lbl { flex: 1; min-width: 0; font-family: 'Space Grotesk', sans-serif;
               font-size: 12px; line-height: 1.35; color: ${LAB.ink}; }
/* Variant do riadku s výberom krajiny — nerastie, drží výšku poľa, text nezalamuje. */
.hf-chk--inline { width: auto; flex: 0 0 auto; height: 40px; padding: 0 11px; white-space: nowrap; }
.hf-chk--inline .lbl { flex: 0 0 auto; font-size: 11.5px; }

/* ── VÝBER ŽIVÝ / ZA MOSTOM ─────────────────────────────────────────────
   Matej 28. 8.: „zmenši a daj do jedného riadku… nerozťahujme to." Dlaždica
   preto NEJE stĺpec (ikona nad textom), ale riadok vysoký ako pole formulára —
   panel tým prestal byť dvoma plagátmi a zmestí sa doň aj národnosť. */
.hf-picks { display: flex; gap: 8px; width: 100%; }
.hf-pick {
  flex: 1; min-width: 0; display: flex; flex-direction: row; align-items: center;
  justify-content: center; gap: 7px; height: ${HF.field.h}px; padding: 0 8px;
  border-radius: ${HF.field.radius}px; cursor: pointer;
  border: 2px solid rgba(201,154,63,.4); background: transparent; transition: .15s;
}
.hf-pick img { height: 20px; width: 20px; flex: 0 0 auto; object-fit: contain; filter: brightness(0); }
.hf-pick span {
  font-family: 'Cinzel', serif; font-weight: 700; font-size: 9.5px;
  letter-spacing: .04em; text-transform: uppercase; line-height: 1.15;
  text-align: left; color: ${LAB.ink};
}
.hf-pick.on { ${pickTintCSS(LAPIS.edge, PICK_INK.lapis)} }
.hf-pick.on span { color: ${PICK_INK.lapis}; }

/* ── PANEL LEGENDY — bez krížika (lock 28. 8.), von klikom mimo alebo Esc ── */
/* ⚠️ ROLUJE OBAL, NIE PANEL. Ponuka krajín v paneli je absolútna (\`.hf-cpick-menu\`)
   a \`overflow-y\` na paneli by ju odrezal na jeho hrane — pritom \`place()\` v
   \`CountryPick\` meria miesto voči OKNU, nie voči panelu. Obal je cez celé okno,
   takže odrezať nemá čo; \`margin:auto\` centruje a pri vysokom obsahu (anjel + dva
   dátumy + vlastná krajina) nechá panel odrolovať, nie vypadnúť hore z okna. */
.hf-legwrap {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: flex-start; justify-content: center; padding: 18px;
  overflow-y: auto;
}
.hf-legveil { position: absolute; inset: 0; background: rgba(10,26,74,.55); backdrop-filter: blur(2px); }
.hf-legpanel {
  position: relative; width: 100%; max-width: 330px; padding: 16px;
  display: flex; flex-direction: column; gap: 11px;
  background: linear-gradient(135deg,#FBF5E6 0%,#F2E2BD 100%);
  border: 1.5px solid ${LAB.goldSolid}; border-radius: 14px;
  box-shadow: 0 8px 28px rgba(0,0,0,.45), 0 0 0 3px rgba(201,154,63,.15);
  margin: auto 0;
}
.hf-legpanel .who {
  margin: 0; text-align: center; font-family: 'Cinzel', serif; font-weight: 700;
  font-size: 15px; letter-spacing: .06em; color: ${LAB.ink};
}

/* ── UKÁŽKA HEROGLYFU ─────────────────────────────────────────────────────
   Heroglyf je ZLATÁ kresba. Na zlatej doske zaniká — potrebuje tmu pod sebou,
   presne ako v LABe (\`.glyphdemo\`). Je to jediný tmavý prvok vnútri bloku
   a nesie ho význam: je to ten predmet, o ktorom obrazovka hovorí. */
.hf-glyphdemo {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #0b0805;
  display: grid;
  place-items: center;
  padding: 10px;
}
.hf-glyphdemo img { width: 78%; max-width: 280px; }

/* ── POLE NA PÍSANIE ──────────────────────────────────────────────────────
   Zaostrené a vyplnené berie LAPIS — ale ako TINT s plným rámom, nie plnú
   výplň: tá patrí CTA.
   ⚠️ **BIELE, nie papyrusové** (Matej 28. 8.: „text area ktorá bude biela —
   výrazná"). Papyrusové pole (\`.pf-field--flat\`, #FBF5E6) je kánon vnútri
   TMAVEJ karty \`/pack\`; tu stojí na papyrusovej doske v zlatom bloku, teda
   papyrus na papyruse — na snímku sa pole strácalo v doske. Biela je jediná
   plocha obrazovky, ktorá pýta zásah, a musí to byť vidno. */
.hf-field {
  width: 100%;
  height: ${HF.field.h}px;
  border-radius: ${HF.field.radius}px;
  border: 2px solid rgba(179, 130, 45, 0.55);
  background: #FFFDF7;
  padding: 0 14px;
  text-align: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  color: ${LAB.ink};
  outline: none;
  transition: border-color .18s, background .18s, box-shadow .18s;
}
.hf-field::placeholder { color: ${LAB.inkMuted}; }
.hf-field:focus {
  border-color: ${LAPIS.edge};
  box-shadow: 0 0 0 3px ${LAPIS.halo};
}
/* Vyplnené pole ostáva BIELE — lapis je len tint NAD bielou, nie namiesto nej.
   Samotný \`LAPIS.fill\` je 12 % priehľadná modrá, takže cez ňu presvitala zlatá
   doska a z bieleho poľa bolo zrazu sivé. */
.hf-field.is-valid {
  border-color: ${LAPIS.edge};
  background: linear-gradient(${LAPIS.fill}, ${LAPIS.fill}), #FFFDF7;
}

/* ── OBIEHAJÚCE MODRÉ SVETLO OKOLO POĽA ───────────────────────────────────
   Matej 28. 8.: *„okolo bude prúdiť modrá čiara ako je to v pôvodnom flowe
   alebo aj pri zadávaní miesta na mape"* a po prvom kole *„tá utekajúca modrá
   žiara okolo text area vôbec nie je vidno a výrazná - nepúta pozornosť čo by
   mala!"*.
   ⚠️ **Prečo prvé kolo nebolo vidno:** hodnoty prebraté 1:1 z \`.trp-ps.is-attn\`
   (\`addtrip/PlaceSearch.tsx\`) sú kalibrované na TMAVÝ dok — 2 px stopa a 1 px
   rozostrenie. Tu to isté svetlo beží po ZLATEJ doske v bledom šate, kde má
   proti sebe svetlý podklad, takže sa stratilo. Zosilnené je preto trojako:
   hrubšia stopa (3 px), jasnejší vrchol oblúka (takmer biela) a **modrý rám
   a halo na samotnom prázdnom poli**, ktoré pulzuje — pohyb tak nesie celé
   pole, nie len vlas okolo neho.
   → [[feedback_svetlo_na_svetlom_zosilnis_farbou_nie_polomerom]]
   ⚠️ Svetlo beží, KÝM je pole prázdne. Po vyplnení zhasne a rám drží statické
   lapisové zvýraznenie (\`.hf-field.is-valid\`) — pole už nič nepýta. */
@property --hf-ring-ang { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.hf-ring { position: relative; border-radius: ${HF.field.radius}px;
           animation: hfRingPulse 2.6s ease-in-out infinite; }
.hf-ring > * { position: relative; z-index: 1; }
/* Prázdne pole samo drží modrý rám — bez neho by svetlo obiehalo okolo zlatého
   poľa a bolo by to svetlo „na ničom". */
.hf-ring .hf-field { border-color: rgba(47, 107, 255, 0.55); }
.hf-ring::before {
  content: ''; position: absolute; inset: -3px; z-index: 0;
  border-radius: ${HF.field.radius + 3}px; pointer-events: none; padding: 3px;
  background: conic-gradient(from var(--hf-ring-ang),
    rgba(47,107,255,0.10) 0deg, rgba(47,107,255,0.10) 200deg,
    rgba(47,107,255,0.75) 280deg, rgba(214,232,255,1) 330deg,
    rgba(47,107,255,0.75) 350deg, rgba(47,107,255,0.10) 360deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  filter: blur(1.5px);
  animation: hfRingSpin 2.6s linear infinite;
}
@keyframes hfRingSpin { to { --hf-ring-ang: 360deg; } }
@keyframes hfRingPulse {
  0%, 100% { box-shadow: 0 0 10px 1px rgba(47, 107, 255, 0.28); }
  50%      { box-shadow: 0 0 22px 5px rgba(47, 107, 255, 0.50); }
}
@media (prefers-reduced-motion: reduce) {
  .hf-ring::before { animation: none; }
  .hf-ring { animation: none; box-shadow: 0 0 14px 2px rgba(47, 107, 255, 0.35); }
}
.hf-ring.is-filled { animation: none; box-shadow: none; }
.hf-ring.is-filled::before { animation: none; opacity: 0; }

/* ── ČERVENÁ A ZELENÁ SA OBJAVIA AŽ PO DOPÍSANÍ ───────────────────────────
   Matej 28. 8.: *„až po dopísaní mena sa zjaví červený text nie pri začiatku
   písania…ak človek dopíše!"* — preto \`hfPop\`, aby to naozaj VYBEHLO a nebolo
   to len ticho pribudnutý riadok. Kedy je meno „dopísané", rieši obrazovka
   (\`settled\` v \`NameScreen.tsx\`), nie CSS. */
@keyframes hfPop {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: none; }
}
.hf-alert, .hf-promise { animation: hfPop .26s ease-out both; }
@media (prefers-reduced-motion: reduce) { .hf-alert, .hf-promise { animation: none; } }

/* ── HLAVNÉ CTA ───────────────────────────────────────────────────────── */
.hf-cta {
  width: 100%;
  height: ${HF.cta.h}px;
  border-radius: ${HF.cta.radius}px;
  border: none;
  background: ${LAPIS.grad};
  color: ${LAPIS.ink};
  box-shadow: ${LAPIS_BTN_SHADOW};
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: ${HF.cta.size}px;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background .18s, transform .18s, opacity .18s;
}
.hf-cta:hover:not(:disabled) { background: ${LAPIS.gradHover}; transform: scale(1.02); }
.hf-cta:disabled { opacity: .4; cursor: default; }

/* ── PRESKOČENIE — dostupné, nie ponúkané ─────────────────────────────── */
.hf-skip {
  align-self: center;
  background: none;
  border: none;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: .04em;
  color: ${LAB.goldInk};
  text-decoration: underline;
  text-decoration-style: dotted;
  cursor: pointer;
}
.hf-note {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  color: ${LAB.inkSoft};
}
.hf-hint {
  background: none;
  border: none;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  color: ${LAB.goldInk};
  text-decoration: underline;
  text-decoration-style: dotted;
  cursor: pointer;
}
`;
