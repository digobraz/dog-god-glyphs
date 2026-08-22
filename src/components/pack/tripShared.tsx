// Shared bits between the Portal trip list (PackMap.tsx) and the full-page trip article
// (PackTripArticle.tsx) — iterácia 12 bod 5/6: expand (⤢) teraz navigates to a SEPARATE
// route/page (article), not a modal, so anything both surfaces render (author fallback,
// difficulty pictogram) lives here once instead of being copy-pasted across two files.
import type { HeroTrail } from '@/data/heroTrails.generated';
import { PACK_THEME } from '@/components/pack/packTheme';
import { iso2ToISO3, trailCountry } from '@/lib/countryGeo';
import {
  packStorage, PACK_KEYS, readStringSet as readSet,
  persistWalked, persistFav, scheduleFounderSeed, queueLocalTripUpload,
} from '@/lib/packStore';

export const ICON = (n: string) => `/icons/pack/${n}.svg`;

// autor fallback (iterácia 11 bod 1) — generovaný dataset (28 done tripov) nemá `author`;
// zdieľané medzi karty/inline detail (PackMap) a článok (PackTripArticle).
export const AUTHOR_FALLBACK = 'Hekthor & Matej';
export const authorOf = (tr: HeroTrail) => tr.author || AUTHOR_FALLBACK;

// macro-región (West/Center/East) pre pohorie (`tr.region`).
//
// ⚠️ OPRAVENÉ 2026-08-06 (Matej: „ked dam filter region a stred nenajde žiadny vylet"). Tabuľka
// niesla LEN Malé + Biele Karpaty s komentárom „jediné pohoria v aktuálnych dátach" — to platilo
// pri jej vzniku, ale dataset medzitým narástol na 12 pohorí. Filter regiónu preto na Stred aj
// Východ vracal prázdno, hoci výlety tam sú. Nebola to chyba filtra, ale ZASTARANÝ ČÍSELNÍK.
//
// Pri pridaní pohoria do `plany/trails-nahadzovac-state.json` sem MUSÍ pribudnúť riadok, inak
// výlet vypadne z regiónového filtra a nikto si toho nevšimne (chýbajúci kľúč = `undefined`,
// čo sa nikdy nerovná zvolenému regiónu → ticho zmizne).
// Kontrola po zmene datasetu:
//   node -e "…heroTrails.generated.ts → unikátne tr.region → porovnaj s kľúčmi nižšie"
//
// Delenie je turistické, nie administratívne: Vysoké Tatry ležia v Prešovskom kraji (teda
// „východ" podľa krajov), ale patria do tatranského oblúka spolu so Západnými a Nízkymi
// Tatrami — rozdeliť Tatry medzi dva regióny by človeka, ktorý ich hľadá, len mýlilo.
export const REGION_OF: Record<string, 'West' | 'Center' | 'East'> = {
  // ZÁPAD
  'Malé Karpaty': 'West',
  'Biele Karpaty': 'West',
  'Považský Inovec': 'West',
  'Strážovské vrchy': 'West',
  // STRED
  'Malá Fatra': 'Center',
  'Veľká Fatra': 'Center',
  'Chočské vrchy': 'Center',
  'Nízke Tatry': 'Center',
  'Západné Tatry': 'Center',
  'Vysoké Tatry': 'Center',
  // VÝCHOD
  'Volovské vrchy': 'East',
};

// gold-tint filter pre čierne SVG ikony na tmavom pozadí — rovnaká hodnota ako BrandIcon.tsx
// `gold` variant (viď src/components/pack/BrandIcon.tsx). Potrebné pre rating packy (bod 4).
export const GOLD_ICON_FILTER =
  'brightness(0) saturate(100%) invert(58%) sepia(56%) saturate(481%) hue-rotate(2deg) brightness(91%) contrast(86%)';

// ── Difficulty pictogram (iterácia 12 bod 6) — CSS tvary, žiadne emoji/lucide. Použité
// všade: karty, inline detail, článok (React <DiffMark>) aj mapové markery (raw Leaflet
// divIcon html string cez diffMarkShape, ktoré len skladá tú istú .trp-diffmark-- triedu). ──
// Odyssey (viacdňová journey, 4. stupeň) = trojuholník ako Hard, ale BIELY (viď DIFF_MARK_CSS).
// ── Vodná plocha (jazero/priehrada) ─────────────────────────────────────────────────────────
// Matejovo pravidlo: „JAZERA všeobecne budú označené klikom ako územie, jedine ak by sa jednalo
// o splav rieky alebo trasa paddleboardom to bude výnimka = bude sa môcť aj kresliť ale iba ako
// alternatíva k označeniu vodnej plochy — bez náročnosti." Vodná plocha teda NIKDY nemá
// náročnosť, aj keby ju dáta niesli (viď použitie nižšie a v PackMap/PackTripArticle).
// Dva signály, lebo ani jeden sám nestačí: aktivita 'paddleboard' (SUP) ALEBO tag 'Lake'/'Water'
// (voda bez SUP aktivity — Bled dostal len 'explore' pri migrácii 2026-07-29, keď ešte nemal
// nakreslenú trasu, a predtým prepadával cez isWaterTrail ako bežný hike). Jedno miesto,
// používa sa všade (predtým lokálna kópia len v PackMap.tsx).
// ⚠️ 2026-08-20 — SAMOTNÝ ŠTÍTOK `Lake` NESTAČI. Predtým stačil a robil z každej pešej trasy,
// ktorá ide okolo jazera, VODNÚ PLOCHU: Záruby 3, Budmerice, Seealpsee a Havrania skala tak na
// mape dostali modrú pilulku s názvom namiesto km a ich trasa sa NEVYKRESLILA VÔBEC
// (`PackMap` vodné plochy z kreslenia čiar zámerne vylučuje). Vidno ju bolo až v článku, kde
// sa kreslí bez tejto podmienky. Matej 2026-08-20: „Záruby 3 sú označené na modro a na mape
// nie je vidno trasa! až po rozkliknutí na blog je vidno trasa".
//
// Rozhodujúce je Matejovo pôvodné pravidlo hore: vodná plocha sa označuje ako ÚZEMIE, teda
// KLIKOM, nie kreslením. Výlet s nakreslenou stopou preto vodná plocha NIE JE — štítok `Lake`
// na ňom znamená len „ide sa popri jazere". Výnimka ostáva presne tá, ktorú Matej vymenoval:
// paddleboard (splav/SUP) SA kresliť smie a vodou zostáva aj so stopou.
// Kontrola po zmene: 8 skutočných plôch (0 bodov) ostalo vodou, 4 pešie trasy sa vrátili medzi trasy.
const WATER_TAGS = new Set(['lake', 'water']);
export const isWaterTrail = (tr: { acts?: string[]; tags?: string[]; path?: unknown[] }): boolean => {
  if (tr.acts?.includes('journey')) return false;
  if (tr.acts?.includes('paddleboard')) return true;
  const hasRoute = (tr.path?.length ?? 0) > 1;
  return !hasRoute && !!tr.tags?.some((tag) => WATER_TAGS.has(tag.toLowerCase()));
};

// SLOVENSKÉ SKLOŇOVANIE POČTU — 1 výlet · 2–4 výlety · 5+ výletov.
// Prečo tu a nie v každom komponente zvlášť: kópia tejto funkcie žila v `TripSpotlight.tsx`
// a mapa ju nemala vôbec, takže sa na nej písalo „1 výletov" (Matej 2026-08-20).
// Používa sa ako SUFIX kľúča: `t('kluc' + pluralKey(n))` → `klucOne|Few|Many`.
// Jazyky, ktoré tri tvary nemajú (EN), majú Few a Many rovnaké — netreba pre ne vetvu v kóde.
// ⚠️ Kľúče musia existovať vo VŠETKÝCH troch tvaroch, inak sa pri konkrétnom počte zobrazí
// holý kľúč. Jazyky bez vlastného prekladu padajú na EN, čo je správne aj pre CS (rovnaké
// pravidlá ako SK, ale vlastné texty zatiaľ nemá).
export function pluralKey(n: number): 'One' | 'Few' | 'Many' {
  if (n === 1) return 'One';
  return n >= 2 && n <= 4 ? 'Few' : 'Many';
}

export const diffMarkShape = (diff: string): 'circle' | 'square' | 'triangle' =>
  diff === 'Easy' ? 'circle' : (diff === 'Hard' || diff === 'Odyssey') ? 'triangle' : 'square';

// Zdieľaný share text (native share sheet aj clipboard fallback) — PackMap inline detail aj
// PackTripArticle (predtým dve identické kópie `${tr.name} — ${tr.km} km, ${tr.diff}`).
// Vodná plocha nemá km ani diff (viď isWaterTrail vyššie) — chýbajúce časti sa vynechajú, nie
// fabrikuje sa „undefined" ani holé „ km".
export function tripShareText(tr: { name: string; km: string; diff?: string }): string {
  const parts: string[] = [];
  if (tr.km && tr.km.trim()) parts.push(`${tr.km} km`);
  if (tr.diff) parts.push(tr.diff);
  return parts.length ? `${tr.name} — ${parts.join(', ')}` : tr.name;
}

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
.trp-anchor-live{filter:drop-shadow(0 0 4px rgba(179,107,255,0.9));}
.trp-anchor-halo{animation:trp-anchor-pulse 1.7s ease-in-out infinite;}
@keyframes trp-anchor-pulse{0%{opacity:.55;r:9;}50%{opacity:.06;r:19;}100%{opacity:.55;r:9;}}
@media (prefers-reduced-motion: reduce){.trp-anchor-halo{animation:none;opacity:.3;}}
`;

// Štyri vrstvy na tých istých bodoch, zdola nahor: tmavý okraj → sýta (nesie dosvit) → svetlá
// → biele jadro. Poradie v poli = poradie kreslenia.
export const TRAIL_SABER_LAYERS = [
  { key: 'edge', color: TRAIL_LINE.edge, weight: 11, opacity: 0.8 },
  { key: 'mid', color: TRAIL_LINE.mid, weight: 7, opacity: 0.92, glow: true },
  { key: 'light', color: TRAIL_LINE.light, weight: 4, opacity: 1 },
  { key: 'core', color: TRAIL_LINE.core, weight: 1.8, opacity: 0.97 },
] as const;

// POKOJNÁ TRASA JE PRIEHĽADNÁ, SVIETI AŽ POD MYŠOU (Matej 2026-08-20: „trasy nebudú tak žiariť,
// svetelný meč bude žiariť len pri kliknutí alebo prejdení myšou"). Násobí sa LEN priehľadnosť,
// nie farby ani hrúbky — meč tak ostáva ten istý predmet, len stlmený, a pri rozsvietení
// nepreskočí do iného tvaru.
// Vedľajší efekt, ktorý ruší staršie pravidlo: turistické značenie je pod trasami vidno TRVALE,
// takže „myš na čiare → trasa vybledne" (Matej 2026-07-31) stratilo dôvod a je odstránené.
// Rovnaké číslo si berie mapa aj GeometryPicker — inak by tá istá trasa mala dva pokojné stavy.
export const SABER_REST_OPACITY = 0.42;

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
  // Prehodené poradie v slugu (2026-08-03, Matej): bolo `<pohorie>-<lokalita>`, teraz
  // `<lokalita>-<pohorie>` — lokalita je to, čo človek hľadá, a pohorie ako PREFIX navyše
  // klamalo, keď bol výlet zaradený zle (Havrania skala bola v `male-karpaty`, hoci leží
  // v Slovenskom raji). Krajina do slugu NEIDE — je samostatný segment cesty.
  // Migrácia bola bezpečná: mapa je za DEV_FULL, slugy nikdy neboli verejné. Tento zoznam
  // je poistka pre uložený lokálny stav (Matejov testovací prehliadač) + staré rozpracované
  // odkazy; po pár týždňoch v prevádzke sa dá zmazať.
  'male-karpaty-zaruby-1-kostol-certov-zlab-zaruby': 'zaruby-1-kostol-certov-zlab-zaruby-male-karpaty',
  'male-karpaty-zaruby-2-smolenice-stanica-havranica-zaruby': 'zaruby-2-smolenice-stanica-havranica-zaruby-male-karpaty',
  'male-karpaty-zaruby-3-bukova-ostry-kamen-zaruby': 'zaruby-3-bukova-ostry-kamen-zaruby-male-karpaty',
  'male-karpaty-zaruby-4-jahodnik-certov-zlab-zaruby': 'zaruby-4-jahodnik-certov-zlab-zaruby-male-karpaty',
  'male-karpaty-zaruby-5-kostol-kaluza-zaruby': 'zaruby-5-kostol-kaluza-zaruby-male-karpaty',
  'male-karpaty-vapenna-rostun': 'vapenna-rostun-male-karpaty',
  'male-karpaty-slepy-vrch': 'slepy-vrch-male-karpaty',
  'male-karpaty-kukla': 'kukla-male-karpaty',
  'male-karpaty-chtelnica-klenova': 'chtelnica-vyhlad-klenova-male-karpaty',
  'male-karpaty-celo-veterlin': 'celo-veterlin-male-karpaty',
  'male-karpaty-amonova-luka': 'amonova-luka-male-karpaty',
  'male-karpaty-cierna-skala': 'cierna-skala-male-karpaty',
  'male-karpaty-plavecky-hrad': 'plavecky-hrad-male-karpaty',
  'male-karpaty-jelenec-a-keltek': 'jelenec-a-keltek-male-karpaty',
  'male-karpaty-majdan-klasicky-okruh': 'majdan-klasicky-okruh-male-karpaty',
  'male-karpaty-vysoka-na-steroidoch-tajne-skaly': 'vysoka-na-steroidoch-tajne-skaly-male-karpaty',
  'male-karpaty-casta-pila': 'casta-pila-male-karpaty',
  'male-karpaty-egres': 'egres-male-karpaty',
  'male-karpaty-budmerice': 'budmerice-kastiel-park-male-karpaty',
  'male-karpaty-chtelnica-rajska-zahrada': 'dobra-voda-vyhlad-male-karpaty',
  'male-karpaty-chtelnica-rajska-zahrada-2': 'chtelnica-rajska-zahrada-male-karpaty',
  'male-karpaty-dechtice': 'dechtice-male-karpaty',
  'male-karpaty-chtelnica-priehrada': 'chtelnica-priehrada-male-karpaty',
  'male-karpaty-chtelnica-plesiva-nadrz': 'chtelnica-plesiva-male-karpaty',
  'chtelnica-nadrz': 'chtelnica-nadrz-male-karpaty',
  'male-karpaty-lancarska-luka': 'lancarska-luka-male-karpaty',
  'male-karpaty-cachticky-hrad-plesivce': 'cachticky-hrad-plesivce-male-karpaty',
  'male-karpaty-orlie-skaly': 'orlie-skaly-male-karpaty',
  'male-karpaty-medvedie-udolie-limbach': 'medvedie-udolie-limbach-male-karpaty',
  'male-karpaty-bukova-priehrada': 'bukova-priehrada-male-karpaty',
  'male-karpaty-jelenia-hora': 'jelenia-hora-male-karpaty',
  'male-karpaty-stary-plast': 'stary-plast-male-karpaty',
  'biele-karpaty-vrsatecke-podhradie-chelova-okruh': 'vrsatecke-podhradie-chelova-okruh-biele-karpaty',
  'biele-karpaty-velky-lopenik-rozhladna': 'velky-lopenik-rozhladna-biele-karpaty',
  'biele-karpaty-haluzicka-tiesnava': 'haluzicka-tiesnava-biele-karpaty',
  'biele-karpaty-dracia-studna-biely-vrch': 'dracia-studna-biely-vrch-biele-karpaty',
  'biele-karpaty-zlatnicka-dolina': 'zlatnicka-dolina-biele-karpaty',
  'povazsky-inovec-inovec': 'inovec-povazsky-inovec',
  'povazsky-inovec-hradok-bezovec': 'hradok-bezovec-povazsky-inovec',
  'povazsky-inovec-sokolie-skaly-marhat': 'sokolie-skaly-marhat-povazsky-inovec',
  'povazsky-inovec-tesare': 'tesare-povazsky-inovec',
  'strazovske-vrchy-strazov': 'strazov-strazovske-vrchy',
  'strazovske-vrchy-rokos': 'rokos-strazovske-vrchy',
  'strazovske-vrchy-vapec': 'vapec-strazovske-vrchy',
  'strazovske-vrchy-sulovske-skaly': 'sulovske-skaly-strazovske-vrchy',
  'strazovske-vrchy-zbynovsky-budzogan': 'zbynovsky-budzogan-strazovske-vrchy',
  'tribec-zobor': 'zobor-tribec',
  'mala-fatra-velky-krivan': 'velky-krivan-mala-fatra',
  'mala-fatra-maly-rozsutec': 'maly-rozsutec-mala-fatra',
  'mala-fatra-janosikove-diery-stefanova': 'janosikove-diery-stefanova-mala-fatra',
  'mala-fatra-sokolie': 'sokolie-mala-fatra',
  'mala-fatra-klak': 'klak-mala-fatra',
  'mala-fatra-sutovsky-vodopad-buchta': 'sutovsky-vodopad-buchta-mala-fatra',
  'mala-fatra-mincol': 'mincol-mala-fatra',
  'velka-fatra-ostredok': 'ostredok-velka-fatra',
  'velka-fatra-tlsta-ostra': 'tlsta-ostra-velka-fatra',
  'velka-fatra-gaderska-dolina': 'gaderska-dolina-velka-fatra',
  'chocske-vrchy-velky-choc': 'velky-choc-chocske-vrchy',
  'chocske-vrchy-sip': 'sip',
  'chocske-vrchy-kvacianska-dolina': 'kvacianska-dolina-chocske-vrchy',
  'nizke-tatry-chopok-dumbier': 'chopok-dumbier-nizke-tatry',
  'nizke-tatry-ohniste': 'ohniste-nizke-tatry',
  'zapadne-tatry-sivy-vrch': 'sivy-vrch-zapadne-tatry',
  'vysoke-tatry-bielovodska-dolina': 'bielovodska-dolina-vysoke-tatry',
  'vysoke-tatry-zelene-pleso': 'zelene-pleso-vysoke-tatry',
  'slovensky-raj-tomasovsky-vyhlad': 'tomasovsky-vyhlad-slovensky-raj',
  'poloniny-poloniny-5-dni': 'poloniny-5-dni',
  'vodne-diela-liptovska-mara': 'liptovska-mara',
  'vodne-diela-kralova': 'kralova',
  'vodne-diela-slnava': 'slnava',
  'vodne-diela-oresianska-priehrada': 'oresianska-priehrada',
  'vodne-diela-palcmanska-masa': 'palcmanska-masa',
  'zahranicie-bled': 'bled',
  'zahranicie-vintgar-radovna-tiesnava': 'vintgar-radovna-tiesnava',
  'zahranicie-bibione': 'bibione',
  'zahranicie-balkan': 'balkan',
  'zahranicie-srbsko': 'srbsko',
  'slovensky-raj-slovensky-raj-gacovska-skala': 'gacovska-skala-slovensky-raj',
  'male-karpaty-havrania-skala-slovensky-raj': 'havrania-skala-slovensky-raj',
};
export const currentTripId = (id: string): string => RENAMED_TRIP_IDS[id] ?? id;

// ── URL výletu ────────────────────────────────────────────────────────────────────────────────
// `/pack/map/:country/:slug` — krajina je SEGMENT CESTY, nie časť slugu (Matej 2026-08-03).
// Dôvod: pri globálnom rozšírení sa dá `/pack/map/svk/` linkovať a filtrovať ako rozcestník,
// a slug ostane krátky. V ceste je ISO3 (`svk`), lebo ISO2 `sk` sa v URL číta ako jazyk.
// Dataset drží krajinu v ISO2 — preklad robí iso2ToISO3(), aby konvencia žila na jednom mieste.
// VŽDY stavať URL cez tento helper; ručne skladané `/pack/map/${id}` stratí krajinu.
export function tripPath(t: { id: string; country?: string | null; path?: readonly (readonly number[])[] }): string {
  return `/pack/map/${iso2ToISO3(trailCountry(t)).toLowerCase()}/${t.id}`;
}

// Verzia pre miesta, kde je po ruke len id (callbacky typu `onOpenTrip(tid)`). Zoznam trás sa
// podáva ZVONKU zámerne — hodnotový import HERO_TRAILS by vtiahol celý dataset trás do každého
// chunku, ktorý siahne na tripShared. Keď sa trip nenájde (lokálny ADD-flow výlet), padá na
// `svk`; appka je SK-first a zlá krajina v ceste je kozmetika — routa sa matchuje podľa slugu.
export function tripPathById(id: string, trails: readonly HeroTrail[]): string {
  const t = trails.find((x) => x.id === id);
  return t ? tripPath(t) : `/pack/map/svk/${id}`;
}

// Jednorazová migrácia uloženého stavu. Prepíše staré id vo VŠETKÝCH úložiskách, ktoré kľúčujú
// podľa trip id. Guard flag = beží raz; keby pribudol ďalší prepis, stačí zvýšiť verziu kľúča.
const RENAME_MIGRATED_KEY = 'trp-id-rename-v2';
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
// 2026-08 (issue #32 fáza F5): diff proti PREDOŠLÉMU zápisu zistí NOVÉ id (submitAddTripDraft
// v PackMap.tsx sem posiela celé pole `[newTrail, ...localTrails]`) a zaradí ich do packStore
// fronty fotky→Cloudinary→`pack_trips` — bez prihlásenia (DEV_NOAUTH) fronta len čaká, nič sa
// neodošle (packStore `processTripUploadQueue` to rieši samo).
export function writeLocalTrails(trails: HeroTrail[]): boolean {
  const prevIds = new Set(readLocalTrails().map((t) => t.id));
  try {
    trpStore.setItem(LOCAL_TRAILS_KEY, JSON.stringify(trails));
  } catch { return false; /* private mode / quota — volajúci nech to ošetrí */ }
  const added = trails.filter((t) => !prevIds.has(t.id)).map((t) => t.id);
  if (added.length) queueLocalTripUpload(added);
  return true;
}

const readStringSet = readSet;
export const readFavIds = () => readStringSet(FAV_IDS_KEY);
// Zápis ide cez packStore: lokálne hneď + do Supabase (fronta, ak nie je sieť).
export const writeFavIds = (s: Set<string>) => persistFav(s);
export const readWalkedIds = () => readStringSet(WALKED_IDS_KEY);
export const writeWalkedIds = (s: Set<string>) => persistWalked(s);

// Founder walked logika (Matej 2026-07-24, LOCKED): „čo nahodím, to som aj prešiel".
// Každá nahodená (čierna, non-journey) trasa = walked. Z červených journeys sú reálne prejdené
// len tieto dve. 2026-08-03 (Matej, explicitne): s Hektorom prešli LEN SNP + Poloniny —
// `'stefanikova-magistrala'` tu bola nesprávne (geo-odvodenie cez prekryv s SNP, nie reálna
// prejdená trasa). Ostatné magistrály neprejdené.
// POZOR: `packCommunity.ts` má DRUHÚ kópiu tohto zoznamu (`FOUNDER_WALKED_JOURNEY_IDS`) — obe
// musia byť ručne držané v zhode.
export const FOUNDER_WALKED_JOURNEY_IDS = ['snp-cesta-hrdinov', 'poloniny'];

// ── Jednorazové odstránenie nesprávne naseedovanej Štefánikovej (2026-08-03) ────────────────
// FOUNDER_WALKED_JOURNEY_IDS vyššie donedávna obsahovala 'stefanikova-magistrala'. Kto sa stihol
// naseedovať (scheduleFounderSeed nižšie, PRED touto opravou) má ju už zapísanú v localStorage
// (WALKED_IDS_KEY) aj v DB (`trip_walked`, source `founder_seed`). `writeWalkedIds` je
// write-through (persistWalked → persistSetDiff), takže jeden lokálny zápis tu zároveň zaradí
// DB delete do sync frontu — netreba druhú migráciu v packStore.ts.
// Bez founder-gate: bezpečné, lebo Mapa (`/pack/map*`) je zatiaľ za DEV_FULL — v produkcii
// walked dáta zatiaľ nemá nikto okrem foundera (viď KONTEXT.md). Ak sa Mapa pustí členom PRED
// týmto guardom, treba tu doplniť rovnaký founder-only check ako v packStore.ts scheduleFounderSeed.
const STEFANIKOVA_UNSEED_KEY = 'trp-stefanikova-unseed-v1';
function unseedStefanikovaMigration(): void {
  try {
    if (trpStore.getItem(STEFANIKOVA_UNSEED_KEY)) return;
    trpStore.setItem(STEFANIKOVA_UNSEED_KEY, '1');
    const walked = readWalkedIds();
    if (walked.has('stefanikova-magistrala')) {
      walked.delete('stefanikova-magistrala');
      writeWalkedIds(walked);
    }
  } catch { /* private mode / quota — non-fatal */ }
}
unseedStefanikovaMigration();

// Seed sa od 2026-07-30 (issue #32) NEROBÍ per-prehliadač na slepo — rozhoduje o ňom packStore
// PO hydratácii z DB: dostane ho iba founder účet a iba keď v DB nemá ani jednu prejdenú trasu.
// Dôvod: (a) nový člen si inak naseedoval 64 cudzích prejdených trás, (b) ručné odškrtnutie sa
// na druhom zariadení vzkriesilo. Volajúci sa nemení — stále len povie, čo by sa seedovať malo.
export const ensureWalkedSeeded = scheduleFounderSeed;

// ── POPISY VÝLETOV: SK je zdroj, EN je preklad (2026-08-14) ─────────────────────────────────
//
// Matejove popisy a psie poznámky vznikajú po slovensky (`plany/trails-nahadzovac-state.json`)
// a do 14. 8. sa v anglickom rozhraní zobrazovali tak, ako boli — po slovensky. Nie je to chyba
// i18n vrstvy: text nesú DÁTA, nie prekladové kľúče, takže parita kľúčov ho nikdy nepokryla.
//
// Zdroj pravdy ostáva SK. `descEN`/`dogNoteEN` sú preklady vedené v tom istom state.json
// a generátor ich prenáša do datasetu. Ostatných 16 jazykov padá na EN — presne tak, ako to
// robí `t()` pri chýbajúcom kľúči (viď LanguageContext.tsx), nech je správanie jednotné.
//
// ⚠️ Keď pribudne nový výlet, EN preklad NEVZNIKNE sám — dovtedy sa Slovákom aj cudzincom
//    ukáže SK originál (lepšie než prázdno). Vo `npm run trip-audit` sa preklad needituje.
export function tripText(
  trail: { desc?: string; dogNote?: string; descEN?: string; dogNoteEN?: string },
  field: 'desc' | 'dogNote',
  lang: string,
): string {
  const sk = (trail[field] ?? '').trim();
  if (lang === 'sk' || lang === 'cs') return sk;   // čeština rozumie originálu lepšie než prekladu
  const en = (trail[field === 'desc' ? 'descEN' : 'dogNoteEN'] ?? '').trim();
  return en || sk;
}
