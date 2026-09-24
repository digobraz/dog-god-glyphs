import { supabase } from '@/integrations/supabase/client';
import { track, identifyById, resetIdentity } from './analytics';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// MERANIE `/pack` (v1-posthog, 21. 9. 2026)
//
// Do 21. 9. z `/pack` neodchádzala ani jedna udalosť — všetkých 53 volaní `track()` v repe
// sedelo na verejnom webe, v heroflow a na checkoute. Po flipe by sme teda videli, kto si
// kúpil heroglyf, a už nie, či appku vôbec otvoril.
//
// 🔴 PREFIX `pack_` JE POVINNÝ — dôkaz položky `v1-posthog` na nástenke hľadá doslova
// `track('pack_`. Udalosť bez neho je pre stráž neviditeľná.
//
// Rozsah je ROZHODNUTÝ (Matej 21. 9.): štrnásť udalostí, celý reťazec člena po flipe.
// Pätnásta sa nezakladá bez jeho slova — pri 72 členoch má väčšina udalostí aj tak málo
// dát na záver a šum stojí viac než chýbajúci detail.
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** Štrnásť mien. Udalosť mimo tejto sady v `/pack` neexistuje. */
export type PackEvent =
  | 'pack_open'            // prvé otvorenie /pack v tejto session
  | 'pack_dogid_open'      // otvorené DOG ID
  | 'pack_dogid_field'     // vyplnené pole psa (prop: field)
  | 'pack_quiz_done'       // dokončený kvíz (prop: quiz)
  | 'pack_map_open'        // otvorená mapa
  | 'pack_trip_open'       // otvorený výlet (prop: slug)
  | 'pack_trip_walked'     // ✓ prešiel som to
  | 'pack_trip_rated'      // hodnotenie packami
  | 'pack_trip_add_start'  // začal zapisovať výlet
  | 'pack_trip_add_done'   // výlet zapísaný
  | 'pack_note_add'        // značka na mape
  | 'pack_wish_add'        // prianie na mape (BUDDY)
  | 'pack_wish_metoo'      // chcem tiež = kópia prania
  | 'pack_wish_done'       // splnené prianie (D1 s LOGom / D3 bez)
  | 'pack_message_sent'    // odoslaná správa
  | 'pack_ainubis_open'    // otvorený AINUBIS
  | 'pack_lock_click';     // klik na zamknutú vec (prop: lock)

export const trackPack = (event: PackEvent, props?: Record<string, unknown>) => track(event, props);

// ── Cesta v pageview sa MASKUJE ───────────────────────────────────────────────────────────────
// `/pack/map/slovensko/zaruby-1-kostol-certov-zlab-zaruby-male-karpaty` je pre PostHog vlastná
// stránka. Pri 400 výletoch × 2 tvary URL sa heatmapa rozdrobí na stovky ciest, z ktorých každá
// má dva kliky — a heatmapa je presne to, čo si Matej pýtal. Maskou sa všetky zlejú do
// `/pack/map/:country/:slug` a konkrétny výlet nesie `pack_trip_open` ako property.
//
// ⚠️ Maskujú sa LEN cesty pod `/pack` — verejný web meria od januára a prepísaný tvar `path`
// by rozťal historické porovnania vo dvoje.
// ⚠️ `/pack/join/:token` je pozvánkový token, teda tajomstvo. Do analytiky nesmie ani omylom.
export function maskPath(path: string): string {
  if (!path.startsWith('/pack')) return path;
  const seg = path.split('/').filter(Boolean); // ['pack', ...]
  if (seg.length <= 1) return '/pack';
  const rest = seg.slice(1);
  const masked = rest.map((s, i) => {
    // `/pack/map` a `/pack/dogs` majú pevné podstránky, ktoré chceme vidieť menom
    if (i === 0) return s;
    if (rest[0] === 'dogs' && s === 'quiz') return s;
    if (rest[0] === 'map' && (s === 'triplist' || s === 'plan')) return s;
    if (rest[0] === 'add') return s;
    return ':id';
  });
  // dva segmenty za `map` = krajina + slug; jeden = starý tvar bez krajiny
  if (rest[0] === 'map' && masked.length === 3) { masked[1] = ':country'; masked[2] = ':slug'; }
  else if (rest[0] === 'map' && masked.length === 2 && masked[1] === ':id') masked[1] = ':slug';
  if (rest[0] === 'join') masked[1] = ':token';
  return '/pack/' + masked.join('/');
}

// ── Routa → udalosť ───────────────────────────────────────────────────────────────────────────
// Päť z chrbtice sa meria z navigácie, nie z obrazoviek. Dôvod je prevádzkový: obrazovky
// prestavuje rámec (blok 2) a každá prestavba by inak odniesla aj meranie. Navigácia prestavbu
// prežije, lebo routy sa nemenia.
function eventForPath(path: string): { event: PackEvent; props?: Record<string, unknown> } | null {
  const m = maskPath(path);
  if (m === '/pack') return { event: 'pack_open' };
  if (m === '/pack/dogs' || m === '/pack/dogs/:id') return { event: 'pack_dogid_open' };
  if (m === '/pack/map') return { event: 'pack_map_open' };
  if (m === '/pack/map/:country/:slug' || m === '/pack/map/:slug') {
    const seg = path.split('/').filter(Boolean);
    return { event: 'pack_trip_open', props: { slug: seg[seg.length - 1] } };
  }
  if (m === '/pack/ainubis') return { event: 'pack_ainubis_open' };
  return null;
}

// `pack_open` je „prišiel do appky", nie „prekliknutím sa vrátil na domov". Bez tejto pamäte
// by jeden člen za večer vyrobil pätnásť príchodov a denné počty by nič neznamenali.
let openedThisSession = false;

export function trackPackRoute(path: string): void {
  const hit = eventForPath(path);
  if (!hit) return;
  if (hit.event === 'pack_open') {
    if (openedThisSession) return;
    openedThisSession = true;
  }
  trackPack(hit.event, hit.props);
}

// ── Identita člena ────────────────────────────────────────────────────────────────────────────
// Rozhodnutie Mateja 21. 9.: identifikovať UUID účtu, email NEPOSIELAŤ. PostHog tak vie spojiť
// „zaplatil" s „po týždni sa nevrátil", ale nikto v ňom nečíta mená ani adresy.
//
// ⚠️ `person_profiles: 'identified_only'` (main.tsx) znamená, že profil vznikne až týmto
// volaním — anonymný návštevník webu ostáva bez profilu, ako doteraz.
// ⚠️ Na checkoute sa identifikuje EMAILOM (`identifyUser`, kvôli záchrannému mailu), takže
// kupec a člen sú dva profily. Zlučovať ich cez `alias` by znamenalo poslať email aj sem —
// presne to, čo rozhodnutie zakazuje. Spojka je vedomý dlh, nie prehliadnutie.
supabase.auth.onAuthStateChange((event, session) => {
  const uid = session?.user?.id;
  if (event === 'SIGNED_OUT') { openedThisSession = false; resetIdentity(); return; }
  if (uid) identifyById(uid);
});
