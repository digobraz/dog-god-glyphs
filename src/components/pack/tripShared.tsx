// Shared bits between the Portal trip list (PackPortal.tsx) and the full-page trip article
// (PackTripArticle.tsx) — iterácia 12 bod 5/6: expand (⤢) teraz navigates to a SEPARATE
// route/page (article), not a modal, so anything both surfaces render (author fallback,
// difficulty pictogram) lives here once instead of being copy-pasted across two files.
import type { HeroTrail } from '@/data/heroTrails.generated';

export const ICON = (n: string) => `/icons/pack/${n}.svg`;

// autor fallback (iterácia 11 bod 1) — generovaný dataset (28 done tripov) nemá `author`;
// zdieľané medzi karty/inline detail (PackPortal) a článok (PackTripArticle).
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
// stránok (PackPortal aj PackTripArticle), nech je tvar/farba na JEDNOM mieste (bod 6, i12).
// Iterácia 16 bod 3: Moderate #E0A020 (žltá) → #2E6FD6 (modrá). Easy/Hard nezmenené.
export const DIFF_MARK_CSS = `
.trp-diffmark{display:inline-block;flex-shrink:0;width:9px;height:9px;}
.trp-diffmark--circle{border-radius:50%;background:#3FA34D;}
.trp-diffmark--square{background:#2E6FD6;}
.trp-diffmark--triangle{width:0;height:0;background:none;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #CE4B3C;}
.trp-diffmark--triangle.trp-diffmark--odyssey{border-bottom-color:#FFFFFF;}
`;

// ── Rating packy (iterácia 16 bod 2) — jednotný 5-pack widget, zdieľaný medzi kartami/inline
// detailom (PackPortal.tsx) a článkom (PackTripArticle.tsx), nech "5 paciek všade" je na
// JEDNOM mieste (rovnaký vzor ako <DiffMark>). paw.svg zdrojový tvar je už plný/solid (5
// zvarených blobov — palma + 4 prsty, žiadny stroke-outline), takže "rozsvietené"/"tlmené"
// rieši len GOLD_ICON_FILTER vs. tlmená biela + opacity — tvar sa nemení, len tón (bod 2 ask
// "plné packy, nie obrysy" je už splnené zdrojovým SVG, viď report). size/gap = px, voliteľné
// pre rôzne kontexty (karta kompaktná vs. inline detail/článok priestrannejšie). *
export function RatingPaws({ stars, size = 15, gap = 4 }: { stars: number; size?: number; gap?: number }) {
  const rounded = Math.round(stars);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <img
          key={n}
          src={ICON('paw-solid')}
          alt=""
          style={{
            width: size, height: size, flexShrink: 0,
            filter: n <= rounded ? GOLD_ICON_FILTER : 'brightness(0) invert(1)',
            opacity: n <= rounded ? 1 : 0.28,
          }}
        />
      ))}
    </span>
  );
}

// ── client-side mirror (iterácia 12 bod 5 side-effect) ─────────────────────────────────
// ⤢ expand teraz navigate()-uje na SAMOSTATNÚ route (PackTripArticle), ktorá unmountne
// PackPortal — ale ADD-flow tripy (bod 6, iterácia 11) aj wishlist/walked toggle žili len v
// PackPortal component state. Bez mirroru by expand na čerstvo pridaný trip / práve
// wishlistnutý trip skončil "not found"/reset. Toto NIE JE Supabase perzistencia (tá je mimo
// rozsahu, viď PackPortal submitAdd komentár) — len client-side draft mirror.
// 2026-07-24: sessionStorage → localStorage. sessionStorage sa mazal pri zatvorení tabu, takže
// naklikané ADD-flow trasy (napr. CH) miznú medzi testami. localStorage prežije zatvorenie tabu
// (fallback na sessionStorage v private mode / keď localStorage nie je dostupný).
const trpStore: Storage = (() => {
  try { const k = '__trp_probe'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
  catch { return sessionStorage; }
})();
const LOCAL_TRAILS_KEY = 'trp-local-trails';
const FAV_IDS_KEY = 'trp-fav-ids';
const WALKED_IDS_KEY = 'trp-walked-ids';

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

function readStringSet(key: string): Set<string> {
  try {
    const raw = trpStore.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}
function writeStringSet(key: string, set: Set<string>): void {
  try { trpStore.setItem(key, JSON.stringify(Array.from(set))); } catch { /* non-fatal */ }
}
export const readFavIds = () => readStringSet(FAV_IDS_KEY);
export const writeFavIds = (s: Set<string>) => writeStringSet(FAV_IDS_KEY, s);
export const readWalkedIds = () => readStringSet(WALKED_IDS_KEY);
export const writeWalkedIds = (s: Set<string>) => writeStringSet(WALKED_IDS_KEY, s);

// Founder walked logika (Matej 2026-07-24, LOCKED): „čo nahodím, to som aj prešiel".
// Každá nahodená (čierna, non-journey) trasa = walked. Z červených journeys sú reálne prejdené
// len tieto. Štefánikova magistrála = prejdená CEZ SNP (geo-audit: SNP⊇Štefánikova 90 %,
// hrebeň Malé/Biele Karpaty–Javorníky sa prekrýva) — Matej 2026-07-24. Ostatné magistrály neprejdené.
export const FOUNDER_WALKED_JOURNEY_IDS = ['snp-cesta-hrdinov', 'poloniny', 'stefanikova-magistrala'];
// v2 (Matej 2026-07-24): re-seed po pridaní Štefánikovej do default walked setu (merge, netlačí toggly).
const WALKED_SEEDED_KEY = 'trp-walked-seeded-v2';
// Seedne default walked set raz za session (ak ho user ešte nezmenil). Merguje, netlačí cez
// existujúce toggly. defaultWalkedIds = zoznam id trás čo majú byť walked z founder logiky.
export function ensureWalkedSeeded(defaultWalkedIds: string[]): void {
  try {
    if (trpStore.getItem(WALKED_SEEDED_KEY)) return;
    const merged = readStringSet(WALKED_IDS_KEY);
    defaultWalkedIds.forEach((id) => merged.add(id));
    writeStringSet(WALKED_IDS_KEY, merged);
    trpStore.setItem(WALKED_SEEDED_KEY, '1');
  } catch { /* non-fatal */ }
}
