// Shared bits between the Portal trip list (PackMap.tsx) and the full-page trip article
// (PackTripArticle.tsx) — iterácia 12 bod 5/6: expand (⤢) teraz navigates to a SEPARATE
// route/page (article), not a modal, so anything both surfaces render (author fallback,
// difficulty pictogram) lives here once instead of being copy-pasted across two files.
import type { HeroTrail } from '@/data/heroTrails.generated';
import { PACK_THEME } from '@/components/pack/packTheme';
import {
  packStorage, PACK_KEYS, readStringSet as readSet,
  persistWalked, persistFav, scheduleFounderSeed,
} from '@/lib/packStore';

export const ICON = (n: string) => `/icons/pack/${n}.svg`;

// autor fallback (iterácia 11 bod 1) — generovaný dataset (28 done tripov) nemá `author`;
// zdieľané medzi karty/inline detail (PackMap) a článok (PackTripArticle).
export const AUTHOR_FALLBACK = 'Hekthor & Matej';
export const authorOf = (tr: HeroTrail) => tr.author || AUTHOR_FALLBACK;

// macro-región (West/Center/East) pre pohorie (tr.region) — zatiaľ len Malé/Biele Karpaty
// namapované (jediné pohoria v aktuálnych dátach), Center/East čakajú na budúce tripy.
export const REGION_OF: Record<string, 'West' | 'Center' | 'East'> = { 'Malé Karpaty': 'West', 'Biele Karpaty': 'West' };

// gold-tint filter pre čierne SVG ikony na tmavom pozadí — rovnaká hodnota ako BrandIcon.tsx
// `gold` variant (viď src/components/pack/BrandIcon.tsx). Potrebné pre rating packy (bod 4).
export const GOLD_ICON_FILTER =
  'brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)';

// ── Difficulty pictogram (iterácia 12 bod 6) — CSS tvary, žiadne emoji/lucide. Použité
// všade: karty, inline detail, článok (React <DiffMark>) aj mapové markery (raw Leaflet
// divIcon html string cez diffMarkShape, ktoré len skladá tú istú .trp-diffmark-- triedu). ──
// Odyssey (viacdňová journey, 4. stupeň) = trojuholník ako Hard, ale BIELY (viď DIFF_MARK_CSS).
export const diffMarkShape = (diff: string): 'circle' | 'square' | 'triangle' =>
  diff === 'Easy' ? 'circle' : (diff === 'Hard' || diff === 'Odyssey') ? 'triangle' : 'square';

export function DiffMark({ diff }: { diff: string }) {
  return <span className={`trp-diffmark trp-diffmark--${diffMarkShape(diff)}${diff === 'Odyssey' ? ' trp-diffmark--odyssey' : ''}`} aria-hidden="true" />;
}

// CSS pre .trp-diffmark — jeden string, interpolovaný do vlastného scoped <style> oboch
// stránok (PackMap aj PackTripArticle), nech je tvar/farba na JEDNOM mieste (bod 6, i12).
// 2026-07-27: Moderate bola modrá, teraz žltá (#E0A020) — modrá sa uvoľnila pre vodu (kolízia
// významu: dnes bola naraz "stredná náročnosť" aj "vodná plocha"), viď WATER_COLOR nižšie.
export const DIFF_MARK_CSS = `
.trp-diffmark{display:inline-block;flex-shrink:0;width:9px;height:9px;}
.trp-diffmark--circle{border-radius:50%;background:#3FA34D;}
.trp-diffmark--square{background:#E0A020;}
.trp-diffmark--triangle{width:0;height:0;background:none;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #CE4B3C;}
.trp-diffmark--triangle.trp-diffmark--odyssey{border-bottom-color:#FFFFFF;}
`;

// Rovnaká paleta ako DIFF_MARK_CSS vyššie, ale ako JS hodnoty — pre miesta, ktoré farbu
// potrebujú mimo CSS triedy (2026-07-26: idle stav trasy na mape v PackMap.tsx, farba
// podľa náročnosti namiesto plochej čiernej). Odyssey nemá vlastný odtieň na mape (žurnálové
// trasy idú cez samostatnú červeno-bielu vetvu), fallbackuje na Hard červenú.
export const DIFF_COLOR: Record<string, string> = {
  Easy: '#3FA34D', Moderate: '#E0A020', Hard: '#CE4B3C', Odyssey: '#CE4B3C',
};

// Voda (mapové bodky/legenda) — 2026-07-27: predtým zdieľala hodnotu s Moderate náročnosťou,
// teraz vlastný token nech nikde nie je ako holý literál (Matej: "modrá farba bude voda").
export const WATER_COLOR = '#2E6FD6';

// ── Farba čiary trasy na mape (issue #49, Matej 2026-07-31) ────────────────────────────────
// Matej: „skúsme tú fialovú ale urobme ju takú pkenú ako keby neónovú zvnútra stred biely po
// kraji tmavá - ako svetelný meč". Vybral z klikacieho porovnania na reálnej mape
// (`plany/farba-trasy.html`, 4 farby): FIALOVÁ.
// Prečo fialová a nie tyrkysová/modrá/zelená: je to jediná VOĽNÁ os. Egyptian blue #2E5FD0 je
// prakticky voda (WATER_COLOR), tmavozelená splýva s Easy #3FA34D aj so zelenými KČT chodníkmi
// na dlaždiciach, a tyrkysová (faience) má v DOGME D67 pridelený význam — ceremoniálna farba
// sviatkov, minula by sa na najbežnejší prvok mapy.
// POZOR: toto je farba ČIARY = samostatná os. Náročnosť ostáva na markeroch/pilulkách
// (DIFF_COLOR) a nesmie sa s ňou zliať — presne to sme rozpletali 2026-07-27.
export const TRAIL_LINE = { edge: '#170424', mid: '#7A2FBF', light: '#B36BFF', core: '#FFFFFF' } as const;

// Dosvit sa NEDÁ spraviť hrúbkou čiary — robí ho SVG filter na strednej vrstve (Leaflet
// renderuje <path>, filter naň sadne). Trieda sa podáva cez pathOptions.className.
export const TRAIL_LINE_CSS = `
.trp-saber-glow{filter:drop-shadow(0 0 3px rgba(179,107,255,0.95)) drop-shadow(0 0 9px rgba(155,60,255,0.55));}
`;

// Štyri vrstvy na tých istých bodoch, zdola nahor: tmavý okraj → sýta (nesie dosvit) → svetlá
// → biele jadro. Poradie v poli = poradie kreslenia.
export const TRAIL_SABER_LAYERS = [
  { key: 'edge', color: TRAIL_LINE.edge, weight: 11, opacity: 0.8 },
  { key: 'mid', color: TRAIL_LINE.mid, weight: 7, opacity: 0.92, glow: true },
  { key: 'light', color: TRAIL_LINE.light, weight: 4, opacity: 1 },
  { key: 'core', color: TRAIL_LINE.core, weight: 1.8, opacity: 0.97 },
] as const;

// PackMap si `TRAIL_LINE_CSS` vlieva do svojho <style> bloku, ale meč kreslí aj ADD TRIP
// (GeometryPicker), ktorý žije na vlastnej route — bez tejto poistky by mu dosvit ticho chýbal.
// Idempotentné: štýl sa vloží raz na dokument.
export function ensureTrailLineCss() {
  if (typeof document === 'undefined' || document.getElementById('trp-trail-line-css')) return;
  const el = document.createElement('style');
  el.id = 'trp-trail-line-css';
  el.textContent = TRAIL_LINE_CSS;
  document.head.appendChild(el);
}

// Viacvrstvová čiara sa pri odzoomovaní zlieva do kaše (77 trás = fialové fľaky), preto hrúbka
// chudne so zoomom. Bucketované zámerne — prepočet len pri zmene stupňa, nie pri každom pixeli.
export const trailSaberScale = (zoom: number) =>
  zoom <= 10 ? 0.45 : zoom === 11 ? 0.55 : zoom === 12 ? 0.7 : zoom === 13 ? 0.85 : 1;

// ── Rating packy (iterácia 16 bod 2, doplnené 2026-07-27 o desatinný fill) — jednotný
// 5-pack widget, zdieľaný medzi kartami/inline detailom (PackMap.tsx) a článkom
// (PackTripArticle.tsx). Priemer viacerých hlasov (na rozdiel od jedného hlasu v
// addtrip/PawRating.tsx) môže byť zlomkový, napr. 4,5 — Matej: "pri hviezdičkách to tak
// funguje že je vyfarbená iba na X% ked je 4,5 tak je vyfarbenej aj 50% piatej hviezdy ako
// to urobíme my?". Rovnaký princíp ako hviezdičky, len cez `clip-path` na obrázok namiesto
// `width` na fontovú glyph. Zaokrúhlené na najbližších 10 % (Matejova voľba cez
// AskUserQuestion) — 4,53 aj 4,47 vyzerajú rovnako, netreba nekonečnú presnosť.
// Každá packa = 2 vrstvy NA SEBE, brand Hekypaw (rovnaké assety ako addtrip/PawRating.tsx,
// NIE generický `paw-solid`): spodná = `paw.svg` (obrys, tlmený, nevyplnená časť), vrchná =
// `paw-full.svg` (plná) orezaná `clip-path: inset()` sprava na presne fillPct % danej packy.
// Obe kresby majú takmer identický pomer strán (369×382 vs 1538×1592, rozdiel 0,06 %), takže
// pri rovnakom `width`/`height` sadnú presne na seba a prechod obrys→plná neposkočí.
export function RatingPaws({ stars, size = 15, gap = 4 }: { stars: number; size?: number; gap?: number }) {
  const rounded = Math.round(stars * 10) / 10;
  return (
    <span
      role="img"
      aria-label={`${stars.toFixed(1)} out of 5 packs`}
      style={{ display: 'inline-flex', alignItems: 'center', gap }}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const fillPct = Math.round(Math.max(0, Math.min(1, rounded - (n - 1))) * 100);
        return (
          <span key={n} style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <img
              src={ICON('paw')}
              alt=""
              style={{
                position: 'absolute', inset: 0, width: size, height: size,
                filter: 'brightness(0) invert(1)', opacity: 0.28,
              }}
            />
            {fillPct > 0 && (
              <img
                src={ICON('paw-full')}
                alt=""
                style={{
                  position: 'absolute', inset: 0, width: size, height: size,
                  filter: GOLD_ICON_FILTER, clipPath: `inset(0 ${100 - fillPct}% 0 0)`,
                }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

// ── ElevationProfile (2026-07-26) — výškový profil trasy, zdieľaný medzi inline detailom
// (PackMap.tsx) a článkom (PackTripArticle.tsx). `elev` = downsamplovaná krivka z DEM,
// zapečená v heroTrails.generated.ts generátorom (plany/gen-hero-trails.mjs, zdroj surových
// dát plany/.ascent-elev-cache.json). Body sú rovnomerne rozložené po deklarovanej dĺžke `km`
// (rovnaký predpoklad ako compute-ascent.py: ~100 m rozostup pozdĺž KRESLENEJ trasy).
// 🔴 Krivka je taká presná ako geometria trasy — pri kľukatých/skracujúcich trasách (viď
// pamäť trasy_geometria) môže vyhladiť serpentíny; presnosť sa zlepší až po snap-to-trail.
// Menej než 2 body → nezmysel na vykreslenie, vráti null (caller sekciu vôbec nezobrazí).
export function ElevationProfile({ elev, km }: { elev: number[] | undefined; km: number }) {
  if (!elev || elev.length < 2 || !(km > 0)) return null;
  const W = 300, H = 84, P = { t: 8, r: 4, b: 16, l: 28 };
  const minY = Math.min(...elev), maxY = Math.max(...elev);
  const sx = (i: number) => P.l + (i / (elev.length - 1)) * (W - P.l - P.r);
  const sy = (v: number) => H - P.b - ((v - minY) / Math.max(maxY - minY, 1)) * (H - P.t - P.b);
  const d = elev.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ');
  const area = `${d} L${sx(elev.length - 1).toFixed(1)} ${H - P.b} L${sx(0).toFixed(1)} ${H - P.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden="true">
      <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke={PACK_THEME.onDarkBorder} />
      <path d={area} fill="url(#elevFill)" />
      <path d={d} fill="none" stroke="#F5C73D" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <defs>
        <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C73D" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#F5C73D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x={2} y={sy(maxY) + 4} fill={PACK_THEME.onDarkDim} fontSize="9">{Math.round(maxY)} m</text>
      <text x={2} y={sy(minY) + 4} fill={PACK_THEME.onDarkDim} fontSize="9">{Math.round(minY)} m</text>
      <text x={W - P.r} y={H - 4} fill={PACK_THEME.onDarkDim} fontSize="9" textAnchor="end">{km.toFixed(1)} km</text>
    </svg>
  );
}

// ── client-side mirror (iterácia 12 bod 5 side-effect) ─────────────────────────────────
// ⤢ expand teraz navigate()-uje na SAMOSTATNÚ route (PackTripArticle), ktorá unmountne
// PackMap — ale ADD-flow tripy (bod 6, iterácia 11) aj wishlist/walked toggle žili len v
// PackMap component state. Bez mirroru by expand na čerstvo pridaný trip / práve
// wishlistnutý trip skončil "not found"/reset. Toto NIE JE Supabase perzistencia (tá je mimo
// rozsahu, viď PackMap submitAdd komentár) — len client-side draft mirror.
// 2026-07-24: sessionStorage → localStorage. sessionStorage sa mazal pri zatvorení tabu, takže
// naklikané ADD-flow trasy (napr. CH) miznú medzi testami. localStorage prežije zatvorenie tabu
// (fallback na sessionStorage v private mode / keď localStorage nie je dostupný).
// 2026-07-30 (issue #32): úložisko sa presunulo do `@/lib/packStore` — čítanie ostáva
// synchrónne a lokálne, ale zápis ide write-through aj do Supabase (`trip_walked`,
// `trip_fav`), takže prejdené a wishlist prežijú prehliadač aj zariadenie.
const trpStore = packStorage;
const LOCAL_TRAILS_KEY = PACK_KEYS.localTrails;
const FAV_IDS_KEY = PACK_KEYS.fav;
const WALKED_IDS_KEY = PACK_KEYS.walked;

// ── Premenované trip id (slug) ────────────────────────────────────────────────────────────────
// `id` výletu = slug a používa sa ako kľúč VŠADE: v URL `/pack/map/:slug`, v uloženom
// walked/fav/votes/plans/events/triplist a v cache súboroch generátora. Keď sa slug opraví,
// musia sa ošetriť obe strany: staré ODKAZY (redirect) aj staré ULOŽENÉ dáta (migrácia nižšie),
// inak si človek príde o „prejdené" a zdieľaný link vráti „trip not found".
// Pozn.: Cloudinary priečinok fotiek zámerne NEPREMENOVANÝ — assety tam reálne ležia pod
// pôvodným názvom, premenovanie URL by ich rozbilo.
export const RENAMED_TRIP_IDS: Record<string, string> = {
  // preklep v názve obce (2026-07-25) — obec je Chtelnica, nie Chtalnica
  'male-karpaty-chtalnica-klenova': 'male-karpaty-chtelnica-klenova',
};
export const currentTripId = (id: string): string => RENAMED_TRIP_IDS[id] ?? id;

// Jednorazová migrácia uloženého stavu. Prepíše staré id vo VŠETKÝCH úložiskách, ktoré kľúčujú
// podľa trip id. Guard flag = beží raz; keby pribudol ďalší prepis, stačí zvýšiť verziu kľúča.
const RENAME_MIGRATED_KEY = 'trp-id-rename-v1';
export function migrateRenamedTripIds(): void {
  try {
    if (trpStore.getItem(RENAME_MIGRATED_KEY)) return;
    const pairs = Object.entries(RENAMED_TRIP_IDS);
    if (pairs.length) {
      // Všetky dotknuté úložiská držia id ako holý string v JSON-e (pole, kľúč objektu alebo
      // pole `tripId`), takže textová zámena nad celým blobom je bezpečná a nezávisí od tvaru.
      for (const key of [
        LOCAL_TRAILS_KEY, FAV_IDS_KEY, WALKED_IDS_KEY,
        'trp-votes-v2', 'trp-plans', 'trp-events-v2', 'dogypt.triplist.v1',
      ]) {
        const raw = trpStore.getItem(key);
        if (!raw) continue;
        let next = raw;
        for (const [oldId, newId] of pairs) next = next.split(`"${oldId}"`).join(`"${newId}"`);
        if (next !== raw) trpStore.setItem(key, next);
      }
    }
    trpStore.setItem(RENAME_MIGRATED_KEY, '1');
  } catch { /* private mode / quota — non-fatal, appka beží aj bez migrácie */ }
}
// Beží pri načítaní modulu, teda PRED prvým readWalkedIds/readFavIds/readVotes — inak by prvý
// render prečítal ešte staré id a migrácia by dobehla až po ňom (blikanie / stratené „prejdené").
// Modul už na tejto úrovni siaha na storage (trpStore probe vyššie), takže to nič nemení navyše.
migrateRenamedTripIds();

export function readLocalTrails(): HeroTrail[] {
  try {
    const raw = trpStore.getItem(LOCAL_TRAILS_KEY);
    return raw ? (JSON.parse(raw) as HeroTrail[]) : [];
  } catch { return []; }
}
// Vracia true/false — volajúci (submitAdd) vie zistiť, či zápis prešiel, a nahlásiť
// QuotaExceededError namiesto tichej straty tripu (fotky base64 vedia naplniť localStorage).
export function writeLocalTrails(trails: HeroTrail[]): boolean {
  try { trpStore.setItem(LOCAL_TRAILS_KEY, JSON.stringify(trails)); return true; }
  catch { return false; /* private mode / quota — volajúci nech to ošetrí */ }
}

const readStringSet = readSet;
export const readFavIds = () => readStringSet(FAV_IDS_KEY);
// Zápis ide cez packStore: lokálne hneď + do Supabase (fronta, ak nie je sieť).
export const writeFavIds = (s: Set<string>) => persistFav(s);
export const readWalkedIds = () => readStringSet(WALKED_IDS_KEY);
export const writeWalkedIds = (s: Set<string>) => persistWalked(s);

// Founder walked logika (Matej 2026-07-24, LOCKED): „čo nahodím, to som aj prešiel".
// Každá nahodená (čierna, non-journey) trasa = walked. Z červených journeys sú reálne prejdené
// len tieto. Štefánikova magistrála = prejdená CEZ SNP (geo-audit: SNP⊇Štefánikova 90 %,
// hrebeň Malé/Biele Karpaty–Javorníky sa prekrýva) — Matej 2026-07-24. Ostatné magistrály neprejdené.
export const FOUNDER_WALKED_JOURNEY_IDS = ['snp-cesta-hrdinov', 'poloniny', 'stefanikova-magistrala'];

// Seed sa od 2026-07-30 (issue #32) NEROBÍ per-prehliadač na slepo — rozhoduje o ňom packStore
// PO hydratácii z DB: dostane ho iba founder účet a iba keď v DB nemá ani jednu prejdenú trasu.
// Dôvod: (a) nový člen si inak naseedoval 64 cudzích prejdených trás, (b) ručné odškrtnutie sa
// na druhom zariadení vzkriesilo. Volajúci sa nemení — stále len povie, čo by sa seedovať malo.
export const ensureWalkedSeeded = scheduleFounderSeed;
