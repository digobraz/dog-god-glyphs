// ============================================================================
// PACK feature flags — LIVE (trimmed) vs DEV (full) split.
//
// DEV_FULL=false (default, incl. Lovable production build) → trimmed LIVE pack:
//   only profile + documents + Wall message are interactive; everything else
//   ships as "coming soon". This is what goes out to customers.
//
// DEV_FULL=true → the full backoffice, frozen in its current state. The full
//   code is NEVER deleted — it stays gated behind this flag so post-launch we
//   keep building from where we left off, not from scratch.
//
// Run the full dev version locally:   VITE_PACK_FULL=true npm run web
//
// ── FOUNDER VÝNIMKA NA PRODUKCII (2026-08-05) ───────────────────────────────
// `MapGate.tsx` (4.8.) odomkol founderovi ROUTY mapy, ale nie CHROME okolo nich —
// ten visí na tomto flagu. Dôsledok, na ktorý Matej narazil pri prvom teste na
// dogypt.com: mapa sa načítala, ale správy hlásili „coming soon"
// (`PackNotifications.tsx`) a chýbal avatar (desktopová identita žije v spodnom
// nave `PackLayout`, ktorý je celý za `DEV_FULL`). Testovať flow „ako to uvidí
// reálny člen" sa tak nedalo — polovica obrazovky bola vypnutá.
//
// Preto flag dostal druhú vetvu: prihlásený účet z FULL_PACK_EMAILS vidí plný
// pack aj v produkčnom builde. MapGate tým NEZANIKÁ — pri `DEV_FULL === true`
// vracia rovno `allowed`, takže sa obe brány zhodujú a routy naďalej gatuje on.
//
// ⚠️ Je to VIDITEĽNOSŤ, nie zámok. Kód je v bundli tak či tak (flag gatuje
//    obrazovku, nie chunk) → kto vie čítať JS, odomkne si to aj bez allowlistu.
//    Skutočnú ochranu dát drží RLS v Supabase, nie tento súbor.
//
// ⚠️ Vyhodnocuje sa RAZ pri načítaní modulu, synchronne z localStorage. Async
//    `getSession()` tu nejde: `DEV_FULL` číta 8 konzumentov ako modulovú
//    konštantu (PackLayout, PackNotifications, HeroCard, Pack, PackDogDetail,
//    routy v App.tsx) a prepisovať ich na hook by bola prestavba pol packu.
//    Cena: po ČERSTVOM prihlásení treba tvrdý reload — rieši Login.tsx.
//
// Zrušenie po flipe `DEV_FULL`: zmazať FULL_PACK_EMAILS a vetvu na konci súboru.
// ============================================================================
import { SUPABASE_URL } from '@/lib/env';

/** Účty, ktoré vidia plný `/pack` aj v produkčnom builde. Prázdne pole = výnimka vypnutá. */
export const FULL_PACK_EMAILS = ['hekthorsk@gmail.com'];

export function isFullPackEmail(email?: string | null): boolean {
  if (!email) return false;
  return FULL_PACK_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Prečíta e-mail z uloženej Supabase session SYNCHRONNE (localStorage), bez čakania na
 * `getSession()`. Kľúč aj tvar hodnoty určuje supabase-js: `sb-<projectRef>-auth-token`,
 * obsah je JSON session, od v2.9 môže byť zabalený ako `base64-<payload>`. Ošetrené sú
 * oba tvary a čokoľvek neočakávané padne na `null` — výnimka sa nikdy nesmie zapnúť omylom.
 */
function sessionEmailFromStorage(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    const raw = localStorage.getItem(`sb-${ref}-auth-token`);
    if (!raw) return null;
    const json = raw.startsWith('base64-') ? atob(raw.slice('base64-'.length)) : raw;
    const parsed = JSON.parse(json) as { user?: { email?: string } } | null;
    return parsed?.user?.email ?? null;
  } catch {
    return null; // poškodený/nečitateľný záznam — správame sa ako neprihlásený
  }
}

export const DEV_FULL =
  import.meta.env.VITE_PACK_FULL === 'true' || isFullPackEmail(sessionEmailFromStorage());

// ── PAWMATE — DVERE, KTORÉ ODOMKNE AŽ B8 ────────────────────────────────────
// Zadanie `plany/zadanie-clenovia-svorky-2026-09-12.md` §12.1: každá časť sa
// stavia ZA zamknuté dvere, takže sa dá nasadzovať na produkciu postupne
// a neviditeľne — člen vidí presne to, čo dnes: dvere s pilulkou ČOSKORO.
//
// 🔒 ODOMKNÚŤ SMIE LEN BEH B8, a len keď prejde test na dvoch telefónoch (F7).
// Poloodomknuté dvere sú horšie než zamknuté: člen pošle pozvánku, ktorá nedôjde.
// Odomknutie = prepnúť tu `false` na trvalo zapnuté, nie zásah v HeroCard.
//
// Lokálne zapnutie:  VITE_PAWMATE=true VITE_PACK_FULL=true npm run dev
//
// ⚠️ Ako `DEV_FULL` je to VIDITEĽNOSŤ, nie zámok — kód je v bundli tak či tak.
//    Skutočnú ochranu drží DB: `invite-pawmate` overuje, že volá MAJITEĽ
//    zaplateného psa, a všetky štyri RPC panela stoja na `is_dog_owner()`.
//
// ── DRUHÁ VETVA PRIBUDLA 15. 9. 2026 ────────────────────────────────────────
// Matej: *„publishni to do live ale neviditelne pre klientov a až pri launchi to
// pojde von aj pre klientov — pojdem si preklikať pawmate."*
//
// Samotný `VITE_PAWMATE` to neumožní: v produkčnom builde `.env.development`
// neplatí, takže dvere by boli zamknuté VŠETKÝM — aj Matejovi, ktorý si ich chce
// prejsť. Preto tá istá výnimka, akú má `DEV_FULL` o pár riadkov vyššie:
// prihlásený účet z `FULL_PACK_EMAILS` vidí pawmate aj na ostrej doméne.
//
// 🔴 NIE JE TO ODOMKNUTIE PODĽA B8 a lock tým neplatí za splnený — pre KLIENTA
// sa nemení nič, dvere mu ostávajú zamknuté s pilulkou ČOSKORO. B8 je stále to,
// čo `isFullPackEmail(...)` odtiaľto ODSTRÁNI a nechá zapnuté pre všetkých.
export const PAWMATE_LIVE =
  import.meta.env.VITE_PAWMATE === 'true' || isFullPackEmail(sessionEmailFromStorage());

// ── PODUJATIA — DVERE ZAMKNUTÉ, KÝM NA LIVE NIE JE SCHÉMA (2026-09-15) ──────
// Audit funkčnosti pred launchom (plany/audit-launch-2026-09-15/2-podujatia.md)
// našiel toto: formulár aj zoznam podujatí existujú a fungujú bezchybne, backend
// (event_series, event_editions, event_rsvps, event_comments + RLS + 2 RPC) je
// nasadený — ale LEN NA DEV. Frontend ho navyše nikdy nevolá: podujatie sa uloží
// do localStorage jedného prehliadača a tam skončí.
//
// Zmerané naživo, nie odhadnuté: pri odoslaní formulára odišlo 0 requestov na
// Supabase, event_series aj event_editions mali 0 riadkov pred aj po, a druhý účet
// v samostatnom prehliadači videl prázdny stav. Nefunguje teda ani zápis, ani
// nájdenie druhou stranou, ani RSVP, ani odhlásenie, ani zrušenie, ani notifikácia.
//
// 🔴 PREČO SA TO NEDÁ „RÝCHLO DOPOJIŤ": na produkcii pre podujatia NEEXISTUJE ANI
//    SCHÉMA — information_schema.tables vráti na lnzurwmdgvzlqhsbhrvi prázdno, kým
//    na DEV sú všetky štyri tabuľky. Migrácia 20260806_events.sql teda na LIVE nikdy
//    nebežala. Dopojenie frontendu bez nej by písalo do tabuliek, ktoré tam nie sú.
//
// ⚠️ Doteraz to nevadilo, lebo podujatia žijú vnútri /pack/map, a mapa je na LIVE
//    schovaná za DEV_FULL. Lenže LAUNCH = flip DEV_FULL na true, takže by sa odomkli
//    naraz s mapou — a člen by zakladal podujatia, ktoré nikto nikdy neuvidí. Presne
//    to sú tie „poloodomknuté dvere", pred ktorými varuje blok PAWMATE vyššie.
//
// Lokálne zapnutie:  VITE_EVENTS=true VITE_PACK_FULL=true npm run dev
// Odomknutie natrvalo = až keď (1) migrácia beží na LIVE a (2) frontend naozaj
// zapisuje do DB a druhá strana to vidí. Dovtedy false.
export const EVENTS_LIVE = import.meta.env.VITE_EVENTS === 'true';

// ── PLÁNOVANIE VÝLETOV — V SKLADE (Matej 24. 9. 2026) ───────────────────────
// „funkcia plánovania aktivít aj tripov je fajn ALE je to pre začínajúcu apku až moc
//  konkrétne — odložme to ako hotové riešenie do budúcna, teraz by som nechal iba LOG"
//
// Zadanie: `plany/zadanie-assnif-2026-09-24.md` §1. Namiesto plánu prídu PRIANIA na mape
// a BUDDY (interne ASSNIF). Podujatia sa NETÝKA — tie žijú ďalej.
//
// Čo tento prepínač skrýva: vidlicu „prešli sme to / ideme" pri pridaní výletu, výzvu
// k plánu a kartu plánovaného výletu na DOMOVE, pilulku „plánované" a partiu na mape,
// panel „idem" a partiu v článku výletu, žiadosti a OPEN TRIPS v tripliste.
//
// ⚠️ SKLAD, NIE ZMAZANIE. Kód, typy, i18n kľúče aj tabuľky (`user_trips`, `trip_requests`)
//    ostávajú — rovnaký precedens ako SERVICE dlaždica v `AddTripEntry.tsx`. Návrat = true.
// ⚠️ Už zapísané plány sa NEMAŽÚ ani neprepisujú; len sa prestanú ukazovať.
export const PLANNING_LIVE = false;

// PRIANIA 🍑 (BUDDY krok 2, 24.–26. 9. 2026). Migrácie `20260925_wish_pins.sql` +
// `20260926_wish_life.sql` bežia len na DEV — bez prepínača by `go-live` vyviezol dlaždicu,
// vrstvu aj upozornenia na LIVE, kde RPC neexistujú (404 na každej stránke /packu).
// Dev server ich má vždy (`.env.development` je mimo gitu — druhý PC by ich inak nevidel);
// produkčný build len s `VITE_WISHES=true`. Odomknutie = až s FLIPom.
export const WISHES_LIVE = import.meta.env.DEV || import.meta.env.VITE_WISHES === 'true';

// SNIFFER (interne BUDDY, krok 3, 24. 9. 2026) — `/pack/sniffer`, brána do 100 % a nastavenia.
// Migrácia `20260927_buddy_settings.sql` beží len na DEV; ten istý dôvod ako pri prianiach.
// Produkčný build len s `VITE_BUDDY=true`. Odomknutie = až s FLIPom.
export const BUDDY_LIVE = import.meta.env.DEV || import.meta.env.VITE_BUDDY === 'true';
