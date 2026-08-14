// Pack theme tokens — vlastný modul (NIE v PackLayout.tsx).
// Dôvod: konštanta exportovaná spolu s React komponentmi láme Vite Fast Refresh
// (každý edit PackLayout = full reload → cobe globe sa roztrhne). Oddelené = HMR čisté.
//
// Soft sandy palette — bledé papyrusové bloky (karty) na ČIERNOM pozadí (web-konzistentné).
// POZN: bgTop/bg/bgBottom = svetlé VÝPLNE VNÚTRI kariet (HeroCard/PackTree/skeletony), NIE page bg.

// ── TYPOGRAFICKÝ PORIADOK (Matej 2026-07-26: „prečo sa mi zdá že všetko je cinzelom") ──
// Trips klaster (PackMap 33× / PackTriplist 17× / PackTripArticle 9×) bol jednofontový —
// všetko Cinzel, nula Space Grotesku. To je proti nášmu vlastnému systému:
//   `index.css`  → `body { Space Grotesk }`, `h1–h6 { Cinzel }`
//   `Entry.tsx`  → eyebrow = Space Grotesk 500 / .26em / uppercase, sub = Space Grotesk
//   `.btn-gold`  → LOCKED brand CTA = Cinzel 700 uppercase
// Delenie rolí:
//   FONT_TITLE = identita — nadpisy, názvy výletov/miest, CTA tlačidlá, rang (Pútnik)
//   FONT_UI    = zvyšok — eyebrow popisky, dáta, čísla, chipy, badge, meta, tooltipy
// ⚠️ Space Grotesk je v index.html načítaný len vo váhach 300–600. `font-weight:700` by
//    prehliadač dosyntetizoval (fake bold, rozmazané hrany) — strop je 600.
// ⚠️ NEPOUŽÍVAJ 'DM Sans' — v projekte sa nikde nenačítava, padá to na system-ui.
export const FONT_TITLE = "'Cinzel',serif";
export const FONT_UI = "'Space Grotesk',sans-serif";
export const PACK_THEME = {
  // "Naše tmavé" — #050505 + bg-dark.webp heroglyf textúra (ako GodsGrid / heroglyph flow)
  pageBg: '#050505',
  glass: 'rgba(5, 5, 5, 0.72)',
  glassSoft: 'rgba(5, 5, 5, 0.55)',
  onDark: 'rgba(245, 240, 228, 0.86)',
  onDarkDim: 'rgba(245, 240, 228, 0.46)',
  onDarkHair: 'rgba(245, 240, 228, 0.10)',
  onDarkBorder: 'rgba(245, 240, 228, 0.18)',
  // Light fills INSIDE cards (papyrus) — neslúžia ako page bg
  bgTop: '#F2E5C7',
  bgBottom: '#E5D5B3',
  bg: '#EDDCBD',
  // `card` = PLNÁ farba, nie gradient — používa sa aj ako `color:` (svetlý text na
  // tmavom podklade, napr. hover overlay avatara). Pre pozadie karty ber `cardGrad`.
  card: '#FBF5E6',
  cardSoft: '#FCF4DF',
  ink: '#1F1A0E', // off-black, warm
  inkDim: 'rgba(31, 26, 14, 0.62)',
  inkFaint: 'rgba(31, 26, 14, 0.42)',
  // ── PAPYRUS LOCK (2026-07-26, Matej: „dizajn bledých blokov sme si lockli
  // podľa /entry") — zdroj pravdy = src/pages/Entry.tsx `.religion-card`,
  // `.crit-tile`, `.religion-rule`. Bledý blok NIE je plochá biela so šedým
  // hairlinom; je to papyrusový gradient v zlatom ráme so zlatým halo ringom.
  // Šedé hairliny (rgba(31,26,14,…)) sú preto preložené na tlmenú zlatú.
  hairline: 'rgba(201, 154, 63, 0.30)',
  border: 'rgba(201, 154, 63, 0.45)',
  /** Pozadie bledej KARTY (`.religion-card`). */
  cardGrad: 'linear-gradient(160deg, #FBF5E6 0%, #F3E4C4 55%, #EAD6A6 100%)',
  /** Pozadie menšieho bledého PANELU (tooltip/modal v /entry). */
  panelGrad: 'linear-gradient(135deg, #FBF5E6 0%, #F2E2BD 100%)',
  /** Vonkajší okraj bledej karty — 1.5px solid, plná zlatá. */
  cardEdge: '#C99A3F',
  /** Tieň bledej karty vrátane zlatého halo ringu a horného inner highlightu. */
  cardShadow:
    '0 14px 44px rgba(0,0,0,0.55), 0 0 0 4px rgba(201,154,63,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
  /** Tieň menšieho panelu (užší ring). */
  panelShadow: '0 8px 28px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,154,63,0.15)',
  /** Výplň dlaždice/políčka VNÚTRI bledej karty (`.crit-tile`). */
  tileBg: 'rgba(201, 154, 63, 0.06)',
  /** Deliaca čiara vnútri bledej karty — zlatá, vyblednutá do strán. */
  rule: 'linear-gradient(90deg, transparent, #C99A3F, transparent)',
  /** Tmavý inkoust na papyruse pre nadpisy (Cinzel) — teplejší než `ink`. */
  inkStrong: '#2a1608',
  /** Sekundárny text na papyruse (Space Grotesk sub). */
  inkWarm: '#7a5a2a',
  accentGold: '#C99A3F',
  growGreen: '#3D7A4E',
  // ── Canonical TRANSPARENCY MODEL part colors (LOCKED 2026-06-09) ──────────
  // Jeden zdroj pravdy pre FounderInvite (back of block 5) + TransparentStats
  // (block 3) — farby MUSIA sedieť v oboch. Rozvoj zlatožltá · marketing tyrkys
  // · direct help červená · hektor fialová.
  partDev: '#C99A3F', // rozvoj — zlatožltá (brand gold)
  partMkt: '#1AA39A', // marketing — tyrkysová (brand faience core)
  partHelp: '#C0453A', // direct help — červená
  partHek: '#2E5FD0', // hektor — Egyptian blue accent (bývalá fialová, 2026-06-15)
  growGreenSoft: 'rgba(61, 122, 78, 0.12)',
  alertRed: '#B25640',
  alertRedSoft: 'rgba(178, 86, 64, 0.12)',
};

// ── LIQUID GLASS primitív (LOCKED design language, 2026-07-23) ───────────────
// JEDEN zdroj pravdy pre „obsahovú časť" na heroglyf pozadí: obsah nesmie plávať
// priamo na čiernej — ide do frosted panelu (.pk-glass) cez ktorý heroglyfy
// presvitajú (backdrop-blur). Bloky vnútra = .pk-glass-block. Reuse: triplist,
// trip článok, walked — všade rovnaká situácia = rovnaký primitív. NEmixovať s
// plnou čiernou. Render `<style>{GLASS_CSS}</style>` v komponente.
// ── MATRICA BLOKOV — 5 ÚROVNÍ, JEDEN ZDROJ (2026-08-13) ─────────────────────
// Matej: „základ a životný štýl majú slabé okraje a potom dolu v druhom bloku sú zas
// iné výraznejšie... vytiahni DNA z nášho projektu /pack aby to nebolo všade iné,
// kludne si vytvorme matricu a pridávajme len podľa toho lebo to vyzerá neprofesionálne".
//
// Matrica NEVZNIKÁ TERAZ — existuje v CLAUDE.md od 26. 7. Chýbalo jej vynútenie: v profile
// bolo naraz 6× `hairline` rám, 3× `1px cardEdge`, 4× radius 12 a dve natvrdo písané rgba.
// Toto je tá istá matrica ako vykonateľný kód, aby sa nová vec nedala pridať „od oka".
//
// ⚠️ ZMENA OPROTI LOCKU Z 26. 7.: úroveň 2 (PODBLOK) mala predpísané `tileBg` + `border`
// + r10 — plochú výplň so slabým rámom. Matej ju zamietol DVAKRÁT („je to suche bez šťavy"
// 26. 7., „je to také plané" 12. 8.), takže kánonom sa stáva recept, ktorý schválil:
// papyrusový gradient + plný zlatý rám + jemný lift. Plochý `tileBg` klesol na úroveň 3,
// kam patrí — na RIADOK v zozname, nie na sekciu.
//
// Použitie: `style={{ ...PACK_BOX.subblock, padding: '15px 16px' }}` — matrica dáva
// výplň/rám/radius/tieň, komponent si dopĺňa len rozostupy.
export const PACK_BOX = {
  /** 1 — KARTA: samostatný blok stránky (profil, sieť, účet). */
  card: {
    background: PACK_THEME.cardGrad,
    border: `1.5px solid ${PACK_THEME.cardEdge}`,
    borderRadius: 16,
    boxShadow: PACK_THEME.cardShadow,
  },
  /** 2 — PODBLOK: sekcia vnútri karty (ZÁKLAD, ŽIVOTNÝ ŠTÝL, kroky 1–3). */
  subblock: {
    background: PACK_THEME.panelGrad,
    border: `1px solid ${PACK_THEME.cardEdge}`,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(122,90,42,0.10), inset 0 1px 0 rgba(255,255,255,0.40)',
  },
  /** 2b — TMAVÝ PODBLOK: tá istá sekcia, ale čierna. VÝNIMKA Z PAPYRUSOVÉHO LOCKU,
   *  a to zámerne úzka — jediný dôvod ju siahnuť je VÝZNAM, nie vkus: ZÁVET na doklade
   *  DOG ID („keby si tu nebol") je jediné miesto, kde sa hovorí o smrti, a papyrus ho
   *  robil rovnakým riadkom ako obľúbené maškrty (Matej 13.8.2026).
   *  GEOMETRIA JE ZHODNÁ s úrovňou 2 — 1px zlatý rám, radius 12 — takže v mriežke blokov
   *  to ostáva SÚRODENEC, len čierny; iný radius alebo iný rám by z toho spravil cudzí
   *  komponent. Mení sa výplň a inkoust, nič iné.
   *  Text na ňom: `onDark` / `onDarkDim`, pilulky `.pk-pill--dark`. NEROZŠIRUJ na písacie
   *  povrchy — vstupy ostávajú `.pf-field--flat` (papyrus), písať sa má do svetla. */
  subblockDark: {
    background: `linear-gradient(135deg, #171009 0%, ${PACK_THEME.pageBg} 100%)`,
    border: `1px solid ${PACK_THEME.cardEdge}`,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.45), inset 0 1px 0 rgba(245,240,228,0.10)',
  },
  /** 3 — RIADOK: položka zoznamu (člen línie, riadok knihy). Plochá, aby ich desať pod
   *  sebou nerobilo z karty schodisko. */
  row: {
    background: PACK_THEME.tileBg,
    border: `1px solid ${PACK_THEME.border}`,
    borderRadius: 10,
  },
  /** 4 — MODAL / plávajúci panel nad stránkou. */
  panel: {
    background: PACK_THEME.panelGrad,
    border: `1.5px solid ${PACK_THEME.cardEdge}`,
    borderRadius: 14,
    boxShadow: PACK_THEME.panelShadow,
  },
} as const;

// ── ŠÍRKA OBSAHOVÉHO STĹPCA — JEDEN zdroj pre celý /pack (2026-08-13) ────────
// Matej: „vidím že po prekliku na turistický profil je šírka iná ako pri profile...
// možno by bolo fajn to zjednotiť aby tieto bloky boli v /packu jednotné".
// Bolo to rozídené: `PackLayout` mal `max-w-5xl` (1024px), ale `PackTriplist` si drží
// vlastný tmavý root a mal `max-width:860px` — pri prekliku z profilu sa stránka
// viditeľne zúžila. Dve čísla na dvoch miestach sa rozídu vždy, preto sú tu.
// `wide` = stránky s dvojstĺpcom (profil, homepage, psy, triplist), `narrow` = flow
// obrazovky. Kto pridá novú /pack stránku, berie odtiaľto — nie z Tailwind triedy.
export const PACK_COL = { wide: 1024, narrow: 672 } as const;
/** Vodorovný padding stĺpca: mobil / od `sm`. Ten istý na všetkých /pack povrchoch. */
export const PACK_COL_PAD = { mobile: 16, desktop: 24 } as const;

export const GLASS_CSS = `
.pk-glass{
  background:linear-gradient(180deg,rgba(245,240,228,0.075) 0%,rgba(245,240,228,0.028) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(120%);
  backdrop-filter:blur(24px) saturate(120%);
  border:1px solid rgba(245,240,228,0.14);
  border-radius:24px;
  box-shadow:0 30px 70px rgba(0,0,0,0.5),inset 0 1px 0 rgba(245,240,228,0.12);
}
.pk-glass-block{
  background:rgba(245,240,228,0.05);
  border:1px solid rgba(245,240,228,0.10);
  border-radius:16px;
  overflow:hidden;
}
/* Tmavé sklo NA SVETLOM podklade (papyrusová karta). Recept .pk-glass sa sem preniesť
   nedá: backdrop-filter rozmaže to, co je POD prvkom, a pod papyrusom nie je tma —
   vyšla by z toho špinavá bledá plocha. Preto vlastná tmavá podložka a sklo len ako
   povrchová úprava (vnútorný svetelný lem + mäkký tieň).
   Používa PÚTNIK riadok v profile (Matej 2026-08-13: skús ten blok putnika v liquid
   tmavom glasse ... stýl mapy). */
.pk-glass-onlight{
  background:linear-gradient(180deg,rgba(31,26,14,0.95) 0%,rgba(31,26,14,0.88) 100%);
  -webkit-backdrop-filter:blur(18px) saturate(120%);
  backdrop-filter:blur(18px) saturate(120%);
  border:1px solid rgba(245,240,228,0.16);
  border-radius:16px;
  box-shadow:0 12px 30px rgba(31,26,14,0.30), inset 0 1px 0 rgba(245,240,228,0.14);
}
.pk-glass-onlight:hover{ border-color:rgba(201,154,63,0.55); }
`;

// ── PILULKA NA PAPYRUSE — JEDEN primitív pre celý `/pack` (2026-08-12) ───────
// Matej: *„nesedí DNA na homepage, vidím rôzne pils, hrúbky okrajov aj štýly."*
// Homepage mala tri rôzne pilulky naraz: priehľadný ghost s 1px okrajom (HeroCard
// badge), gradientovú zlatú (dni nažive) a čiarkovanú (locked). Tu je ich jediná
// definícia; DNA je prevzatá z `.pf-pill` nižšie (tú Matej schválil 2026-07-26 pri
// profile: *„su nevyrazne blede ani sa mi tam nechce kliknúť… je to suche bez šťavy"*)
// — takže homepage, profil aj psia karta majú od teraz TÚ ISTÚ pilulku.
//   .pk-pill            → neutrálna (papyrusový gradient, 1.5px tlmená zlatá)
//   .pk-pill--gold      → aktívna / hodnotná (brand gradient `.btn-gold`)
//   .pk-pill--locked    → zamknuté / „čoskoro" (čiarkovaný okraj, bez výplne)
//   .pk-pill--tap       → klikateľná (hover lift). Neklikateľnej ho NEDÁVAJ.
// ⚠️ Text v pilulke: názov/identita = Cinzel 700, ČÍSLO = Space Grotesk **600**
//    (strop, Grotesk je načítaný 300–600). Túto dvojicu pilulka nediktuje — nesie ju
//    obsah, aby sa typografický lock nerozdvojil.
// ⚠️ Toto je pilulka NA PAPYRUSE. Na fotke/tmavom paneli (plagát výletu, `pk-glass`)
//    platí tmavá vrstva — nemixovať, papyrusová pilulka by na fotke zmizla.
export const PILL_CSS = `
.pk-pill{
  display:inline-flex; align-items:center; justify-content:center; gap:6px;
  padding:7px 12px; border-radius:999px; white-space:nowrap;
  background:linear-gradient(180deg,#FFFDF7 0%,#EFDDAE 100%);
  border:1.5px solid rgba(179,130,45,0.42);
  color:#5c4318; cursor:default;
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pk-pill--tap{ cursor:pointer; }
.pk-pill--tap:hover{
  border-color:rgba(179,130,45,0.85);
  transform:translateY(-1px);
  box-shadow:0 3px 10px rgba(122,90,42,0.22);
}
.pk-pill--gold{
  background:linear-gradient(135deg,#F5C73D 0%,#E69E1A 100%);
  border-color:#E69E1A; color:#241a06;
  box-shadow:0 3px 12px rgba(230,158,26,0.5);
}
.pk-pill--gold.pk-pill--tap:hover{ box-shadow:0 4px 16px rgba(230,158,26,0.62); }
.pk-pill--locked{
  background:transparent; border:1px dashed rgba(179,130,45,0.6); color:#7a5a2a;
}
/* Tmavá plocha (blok ROZŠÍR SVORKU, pás míľnikov) — Matej 12.8.2026 ich nechal tmavé,
   takže pilulka potrebuje druhú kožu. Hrúbka okraja aj radius ostávajú TIE ISTÉ ako na
   papyruse; mení sa len výplň a farba textu. */
.pk-pill--dark{
  background:rgba(0,0,0,0.30);
  border-color:rgba(245,199,61,0.45);
  color:hsl(45 95% 90%);
}
.pk-pill--dark.pk-pill--tap:hover{
  background:rgba(245,199,61,0.16);
  border-color:hsl(45 80% 60%);
  box-shadow:none;
}
`;

// ── PAPYRUS „ŠŤAVA" primitív (2026-07-26, Matej: „tie políčka text area aj
// pils su nevyrazne blede ani sa mi tam nechce kliknúť… je to suche bez
// šťavy"). DNA prevzatá z `/pack/map` (PackTriplist) — gradient výplň + farebný
// glow tieň namiesto plochej výplne — v papyrusovej palete, nie v čiernom skle.
// Zdieľané medzi PackProfile.tsx (blok 1 polia) A DogGallery.tsx/DogCardFields.tsx
// (psia karta, editor AJ read-profil) — render `<style>{PF_FIELD_CSS}</style>`
// raz na stránke, presne ako `GLASS_CSS` vyššie.
export const PF_FIELD_CSS = `
.pf-field{
  background: linear-gradient(180deg, #FFFDF7 0%, #F1DFB3 100%);
  border: 1.5px solid rgba(179,130,45,0.55);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.pf-field::placeholder{ color: rgba(122,90,42,0.5); }
.pf-field:hover{ border-color: rgba(179,130,45,0.8); }
.pf-field:focus{
  outline: none;
  border-color: #C99A3F;
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px rgba(201,154,63,0.28);
}

/* Riadok „popisok VEDĽA poľa" (Matej 2026-08-12). Popisok má pevnú šírku, aby
   polia pod sebou začínali na jednej zvislej osi; na mobile sa zúži, inak by
   z 390px zjedol pole. min-width:0 na dieťati — bez neho flex položka odmietne
   zmenšiť input a riadok pretečie z karty.
   POZOR: tento súbor je JS template literal — spätný apostrof v CSS komentári
   ho ukončí a build padne. */
.pf-inline{ display:flex; align-items:center; gap:10px; }
.pf-inline > :not(.pf-inline-lbl){ flex:1 1 auto; min-width:0; }
.pf-inline-lbl{
  flex:0 0 72px;
  font-family:'Cinzel',serif;
  font-size:10px;
  letter-spacing:0.22em;
  text-transform:uppercase;
  color:rgba(31,26,14,0.62);
  text-align:right;
}
@media (max-width:640px){
  .pf-inline{ gap:8px; }
  .pf-inline-lbl{ flex-basis:52px; letter-spacing:0.14em; }
}

/* Pole, ktoré svorka reálne vidí (Matej 2026-08-12: „zvýraznil by som rámik
   výberu v tomto prípade nickname"). Prepínač „Show as" sám o sebe nepovie,
   ktorý z dvoch riadkov je ten živý — zvýraznené pole to ukáže bez čítania. */
/* Pole, ktoré svorka vidí. Prvé dve verzie (halo, potom podfarbený riadok so
   štítkom „shown") Matej zamietol — 2026-08-12: „to zvýraznenie v 1. bloku je
   otrasné to shown ako aj rámik cez nick name daj preč zvýrazni viac farebne
   obrys text area". Ostáva teda JEDINÁ vec: sýtejší farebný obrys samotného
   poľa. Žiadny štítok, žiadne podfarbenie riadku. */
/* ⚠️ 13. 8. 2026: zvýraznenie „toto pole svorka vidí" už NEMENÍ VÝPLŇ. Matej žiada,
   aby meno a prezývka vyzerali totožne ako bio, takže rozdiel nesie len obrys — a hlavne
   samotný prepínač nižšie, ktorý je odteraz výrazný. Podfarbenie by rozdiel vrátilo. */
.pf-inline.is-shown .pf-field{
  border-color:#E69E1A;
  border-width:2px;
  box-shadow:inset 0 1px 2px rgba(122,90,42,0.16), 0 0 0 3px rgba(230,158,26,0.22);
}

/* Plochá papyrusová výplň — TEN ISTÝ tón, aký nesie BIO textarea (Matej 2026-08-13:
   „text area urob totožné = aj meno a prezývka bude rovnaká ako bio"). Polia MENO
   a PREZÝVKA teda prestali byť zlatý gradient; .pf-field okraj a focus glow ostávajú,
   mení sa len výplň. Kto zmení tento odtieň, musí zmeniť aj WordLimitTextarea
   v PackProfile.tsx a bio psa v profile/DogGallery.tsx — sú to tri miesta
   jednej farby. */
.pf-field--flat{ background: #FBF5E6; }

/* Prepínač MENO / PREZÝVKA (Matej 2026-08-13: „zobraziť meno/prezývky urob o trošku
   výraznejšie je to takmer neviditeľné a tá pils okolo tú nezarovnaj až po koniec
   textarea nad ňou"). Dve veci naraz:
   1. width:max-content — dráha sa NEROZŤAHUJE na šírku poľa nad sebou. Bez toho ju
      naťahuje .pf-inline > :not(.pf-inline-lbl){flex:1 1 auto} až po pravý okraj.
   2. neaktívna možnosť dostala čitateľnú farbu a dráha vlastný rám — predtým to bol
      priehľadný text v inkFaint na papyruse a nevyzeralo to ako prepínač. */
/* Selektor MUSÍ byť potomkovský, nie holá trieda: .pf-inline > :not(.pf-inline-lbl)
   má špecificitu 0,2,0 a holú .pf-toggle (0,1,0) prebije — dráha by sa naťahovala
   ďalej. Toto je tá istá váha a stojí nižšie, takže vyhráva. */
.pf-inline > .pf-toggle{
  flex: 0 1 auto;
  width: max-content;
  max-width: 100%;
  background: #FBF5E6;
  border: 1.5px solid rgba(179,130,45,0.55);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.16);
}
/* Možnosti prepínača sú v CSS, NIE inline — inline štýl by media query nižšie prebil
   a na mobile by sa nedalo zmenšiť to, čo je zapísané v style={{}}. */
.pf-toggle__opt{
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-family: 'Cinzel', serif;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  color: #7a5a2a;
  background: transparent;
  cursor: pointer;
}
.pf-toggle__opt.is-on{
  background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
  color: #241a06;
  font-weight: 700;
}
@media (max-width:720px){
  /* min-height drží klikací cieľ (audit B1) — prepínač bol 22px, čo je polovica prsta.
     38px na možnosti + 3px padding dráhy = celý prepínač má 44px. */
  .pf-toggle__opt{ padding: 6px 12px; font-size: 10.5px; letter-spacing: 0.08em; min-height: 38px; }
  /* Popisok ide NAD prepínač. Pri 360px sa „ZOBRAZIŤ" a obe možnosti do jedného riadku
     nezmestia a max-width:100% dráhu oreže — text PREZÝVKA potom trčí von z rámu
     (možnosti majú nowrap, takže sa nezmenšia). Zalomením dostane prepínač celý
     riadok a orezávať netreba. Týka sa LEN riadku s prepínačom, ostatné polia
     zostávajú vedľa popisku. */
  .pf-inline--toggle{ flex-wrap: wrap; row-gap: 6px; }
  .pf-inline--toggle > .pf-inline-lbl{ flex: 0 0 100%; text-align: left; }
}

.pf-pill{
  background: linear-gradient(180deg, #FFFDF7 0%, #EFDDAE 100%);
  /* 0.42 zjednotené na 0.55 (13. 8.) — chipy a selecty stoja v tom istom rade a mali
     rôzne silné rámy. Rozdiel bol príliš malý na to, aby niečo znamenal, a dosť veľký
     na to, aby rad vyzeral nedbalo. */
  border: 1.5px solid rgba(179,130,45,0.55);
  color: #5c4318;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pf-pill:hover:not(:disabled){
  border-color: rgba(179,130,45,0.85);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(122,90,42,0.22);
}
.pf-pill.is-selected{
  background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
  border-color: #E69E1A;
  color: #241a06;
  box-shadow: 0 3px 12px rgba(230,158,26,0.5);
}
.pf-pill.is-selected:hover{ box-shadow: 0 4px 16px rgba(230,158,26,0.62); }
.pf-pill:disabled{ opacity: 0.4; cursor: default; transform: none; box-shadow: none; }

/* MOBILNÉ KLIKACIE CIELE (audit 12. 8., B1) — pri 390px malo 24 prvkov výšku pod
   36px: prepínač NAME/NICKNAME 22px, chipy povahy 25px, selecty 26px, oko 24px.
   Prst má ~9mm, čo je zhruba 44px; 22px je polovica.
   Prečo dve čísla: chipov povahy je na stránke 24 a lámu sa do radov, takže 44px
   by kartu natiahlo o stovky pixelov — dostávajú spodnú hranicu rozsahu (40px),
   ojedinelé prvky (selecty, prepínač, oko) plných 44px.
   Robí sa to cez min-height, nie paddingom: padding by rozbil desktop, kde sú
   rozmery odsúhlasené. */
@media (max-width:720px){
  .pf-pill{ min-height:40px; }
  /* Platí na CELÝ .pf-field, nie len na select: polia VEK a MESTO sú holý input
     zabalený v span.pf-field — klikací je ten obal, nie input, takže výška musí
     sadnúť naň. Textarea má vlastnú min-height 48px, tá je vyššia a nemení sa. */
  .pf-field{ min-height:44px; }
  .pf-tap{ min-height:44px; }
  /* Jazykový prepínač je zdieľaný komponent — dvíha sa LEN jeho settings varianta,
     nie pill-nav na GodsGride. */
  .lang-picker--settings .lang-trigger{ min-height:44px; }
  /* Ikonové ovládače (kruhové „i", kopírovanie odkazu, oko pri identite) sa NEDVÍHAJÚ
     výškou — z 26px kruhu by bol ovál. Namiesto toho neviditeľná plocha navyše cez
     ::after, takže prst má 44px, oko vidí pôvodných 26px.
     Meranie cez getBoundingClientRect ukáže ďalej 26px — klikaciu plochu nesie
     pseudo-prvok, nie samotný button. */
  .pf-hit{ position:relative; }
  .pf-hit::after{ content:''; position:absolute; inset:-9px; }
}

/* Sub-section accordion header (BASICS / HOW THEY WORK / …) — bola plochý
   text riadok s hairlinom, nikto ho nevnímal ako klikateľný (Matej 2026-07-29:
   „je to nevýrazné slabo viditeľné a mozog to prehliada"). Rovnaká DNA ako
   .pf-field/.pf-pill vyššie — gradient výplň + hover lift + glow, nie plochá farba. */
.pf-subsection{
  background: linear-gradient(180deg, #FFFDF7 0%, #F1DFB3 100%);
  border: 1.5px solid rgba(179,130,45,0.4);
  box-shadow: inset 0 1px 2px rgba(122,90,42,0.10);
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.pf-subsection:hover{
  border-color: rgba(179,130,45,0.85);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(122,90,42,0.26), inset 0 1px 2px rgba(122,90,42,0.10);
}
.pf-subsection.is-open{
  border-color: #C99A3F;
  box-shadow: 0 2px 10px rgba(201,154,63,0.28), inset 0 1px 2px rgba(122,90,42,0.10);
}
.pf-subsection-badge{
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.pf-subsection-badge.is-empty{
  border: 1px dashed rgba(179,130,45,0.6);
  color: #7a5a2a;
}
.pf-subsection-badge.is-filled{
  background: linear-gradient(135deg, #F5C73D 0%, #E69E1A 100%);
  border: 1px solid #E69E1A;
  color: #241a06;
  box-shadow: 0 2px 8px rgba(230,158,26,0.45);
}
.pf-subsection-chevron{
  width: 22px; height: 22px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(201,154,63,0.14);
  transition: background .15s ease;
}
.pf-subsection:hover .pf-subsection-chevron{ background: rgba(201,154,63,0.26); }
`;
