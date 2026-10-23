import { lazy, Suspense, useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME, PACK_BOX } from '@/components/pack/packTheme';
import { applyDogOrder, readDogOrder } from '@/lib/dogOrder';
import { Navigate, useLocation } from 'react-router-dom';
import { GlobePulse } from '@/components/pack/GlobePulse';
import { WIZ } from '@/components/pack/wizAnchors';
// NextTripCard parkuje (nahradený TripSpotlightom 9.8.2026) — pozri komentár pri bloku nižšie.
// LAZY (audit 26. 9. 2026): obe karty sú za `DEV_FULL`, ale statický import ťahal do
// homepage celú databázu výletov (`heroTrails.generated`, ~280 KB gzip) — aj členovi na LIVE,
// ktorý ich nikdy neuvidí. Teraz sa stiahnu, až keď sa karta naozaj vykreslí.
const TripSpotlight = lazy(() => import('@/components/pack/TripSpotlight').then((m) => ({ default: m.TripSpotlight })));
// Verš nesie 365 citátov v EN aj SK (~100 KB zdroja) a stojí pod ohybom — stačí ho doniesť neskôr.
const VerseOfTheDay = lazy(() => import('@/components/pack/VerseOfTheDay').then((m) => ({ default: m.VerseOfTheDay })));
const PlanAskCard = lazy(() => import('@/components/pack/PlanAskCard').then((m) => ({ default: m.PlanAskCard })));
import { Gateways } from '@/components/pack/Gateways';
import { useProfile } from '@/components/pack/profile/packProfile';
import { DEV_FULL, PLANNING_LIVE } from '@/lib/packFlags';
import { DEV_NOAUTH, DEV_MOCK_DOGS, DEV_MOCK_USER } from '@/lib/devMockDogs';
import { getAccessibleDogIds } from '@/lib/dogRights';
import { getMyAffiliate, getPackStats } from '@/lib/sharedFetch';

const T = PACK_THEME;


// ─────────────────────────────────────────────────────────────────────────────
// HOMEPAGE /pack — prestavba 2026-08-05 (Matej: „juicy ale nie preplnený…
// menej je viac"). Oblúk stránky: JA → DNES → KAM IDEM → KTO SME → ŠÍR TO.
//
// ČO ODIŠLO A PREČO (nemazať späť bez Mateja):
//   · OnboardingProgress („First Steps")  → preberá AINUBIS v úvodnom wizarde.
//     S ním odišiel aj jednorazový `grant-devotion { kind: 'first_steps' }` (+10 ☥)
//     — bez zoznamu krokov nemá čo odmeňovať. Edge funkcia zostáva nedotknutá.
//   · BuildNotice („thank you for patience") → Matej: „je vlastne ai nubis".
//   · FeatureSurveyCard („shape the app")   → odložené, nie zmazané; komponent žije.
//   · ConstitutionCard (veľká karta DOGMY)  → zmenšená do dlaždice v `QuickTiles`
//     (rovnaká obálka knihy, rovnaký `markConstitutionOpened` zápis).
//
// ČO ZOSTALO ZÁMERNE:
//   · GlobePulse — TransparentStats (pokladnica €11) žije VNÚTRI neho; vyhodiť
//     planétu = vyhodiť transparentnosť financií, čo je pilier misie.
//   · PackSettings — ODIŠIEL do `/pack/profile` 5. 10. 2026 (po FLIPe). Do toho platilo,
//     že nemôže odísť, kým je profil za `DEV_FULL`:
//     člen by stratil odhlásenie aj zmenu hesla a rozbil by sa post-payment
//     deep-link `/pack?welcome=1`, ktorý tu otvára modál na nastavenie hesla.
// ─────────────────────────────────────────────────────────────────────────────

// Len stĺpce, ktoré homepage naozaj číta (audit 26. 9. 2026 — predtým 20, z toho 11 nepoužitých).
// `owner_gender` je jedno pole z JSONu `selections` (PostgREST `->>`), nie celý výber heroglyfu.
interface DogRow {
  id: string;
  dog_name: string | null;
  owner_name: string | null;
  cloudinary_main_url: string | null;
  share_card_url: string | null;
  country: string | null;
  created_at: string;
  pack_number?: number | null;
  owner_gender?: string | null;
}

interface PackStats {
  total: number;
  /** Všetky psy s číslom (členovia + schválení hostia, 17. 10. 2026); `total` = len členovia. */
  dogs?: number;
  last24h: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  topBreeds: { breed: string; count: number }[];
}

interface UserMeta {
  name: string;
  /** Surové `full_name` z účtu, alebo null. `name` padá na meno odvodené z e-mailu,
      takže sa z neho nedá zistiť, či člen meno naozaj vyplnil. */
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  devotion: number;
  bones: number;
}

function firstNameFrom(email: string, fullName?: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(' ')[0];
  if (!email) return 'Dogyptian';
  const local = email.split('@')[0] || '';
  const base = local.split('+')[0].replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
  if (!base) return 'Dogyptian';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export default function Pack() {
  const t = useT();
  // Uvítací mail po platbe (`send-certificate`, aj tie už odoslané) vedie na `/pack?welcome=1`.
  // Účet (heslo, odhlásenie) žije od FLIPu 5. 10. 2026 len v JA — tam ide aj odkaz.
  const { search } = useLocation();
  const welcome = new URLSearchParams(search).get('welcome') === '1';
  const [dogs, setDogs] = useState<DogRow[] | null>(null);
  const [stats, setStats] = useState<PackStats | null>(null);
  const [user, setUser] = useState<UserMeta | null>(null);
  // Meno svorky na zlatom ráme v bloku 1. Profil sa aj tak číta z vyrovnávacej pamäte,
  // takže prvé vykreslenie nečaká na sieť a bez session (DEV_NOAUTH) beží ďalej.
  const { profile } = useProfile();

  useEffect(() => {
    let mounted = true;

    async function load() {
      // DEV bez prihlásenia (`VITE_PACK_NOAUTH=1`) — zdroj mocka je jeden pre celý
      // pack (`lib/devMockDogs.ts`), tu sa len premapuje na tvar `DogRow`.
      // Bez toho homepage zamrzne na skeletone a prehliadka svieti do prázdna.
      if (DEV_NOAUTH) {
        if (!mounted) return;
        setUser({ ...DEV_MOCK_USER });
        const devOrder = await readDogOrder();
        if (!mounted) return;
        setDogs(applyDogOrder(DEV_MOCK_DOGS.map((d) => ({
          id: d.id,
          dog_name: d.dog_name,
          owner_name: DEV_MOCK_USER.fullName,
          cloudinary_main_url: d.cloudinary_main_url,
          share_card_url: null,
          country: d.country,
          created_at: new Date().toISOString(),
          pack_number: d.pack_number,
          owner_gender: (d.selections as { ownerGender?: string } | null)?.ownerGender ?? null,
        })), devOrder));
        return;
      }

      // `getSession()` číta session z prehliadača; `getUser()` bol sieťový dotaz navyše
      // len kvôli menu a e-mailu, ktoré session nesie tiež (audit 26. 9. 2026).
      const { data: { session: sess } } = await supabase.auth.getSession();
      const u = sess?.user;
      if (!u) return;

      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const fullName = (meta.full_name || meta.name) as string | undefined;
      const avatarUrl = (meta.avatar_url || meta.avatar || null) as string | null;
      // DEVOTION per-user (user_metadata, set adminom/service). Nový člen = 100 (Stray).
      // BONES = affiliate currency (affiliates.points) — fetched below, not metadata.
      const devotion = Number(meta.devotion) || 100;
      const display = firstNameFrom(u.email ?? '', fullName);
      if (mounted) setUser({ name: display, fullName: fullName?.trim() || null, email: u.email ?? '', avatarUrl: avatarUrl ?? null, devotion, bones: 0 });

      // BONES balance (affiliates.points) — zdroj čísla v HeroCard. Referral count
      // sa tu už nečíta: živil len „Invite a dog lover" krok vo First Steps.
      getMyAffiliate()
        .then(({ data }) => {
          const row = (data as { points?: number }[] | null)?.[0];
          if (!mounted) return;
          setUser((u) => (u ? { ...u, bones: Number(row?.points) || 0 } : u));
        });

      // payment_status filter: abandoned-cart capture (2026-07-10) writes
      // 'draft' rows that share the buyer's user_id — without the filter the
      // pack shows the same dog twice (draft + paid duplicate avatars).
      // ── B3c: ZDROJOM ZOZNAMU SÚ PRÁVA, NIE VLASTNÍCTVO ────────────────────
      // Majiteľovi vráti `getAccessibleDogIds()` tú istú množinu ako doterajšie
      // `.eq('user_id', …)` — `my_dog_rights()` má v prvej vetve tú istú podmienku
      // vrátane `paid`. Pri `null` (RPC zlyhala) sa vedome vraciame k dnešnému
      // filtru: prázdna homepage je horšia než homepage bez pawmata.
      //
      // ⚠️ Pôvodný inline cast tu predpisoval presnú reťaz `.eq().eq().order()`,
      // takže vetvenie na `.in()` ním neprejde. Nahradený `any` + cast výsledku,
      // rovnako ako v `usePackUser.ts`.
      const accessIds = await getAccessibleDogIds();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let dogsQuery = (supabase as any)
        .from('dogs')
        .select('id, dog_name, owner_name, cloudinary_main_url, share_card_url, country, pack_number, created_at, owner_gender:selections->>ownerGender')
        .eq('payment_status', 'paid');
      dogsQuery = accessIds ? dogsQuery.in('id', accessIds) : dogsQuery.eq('user_id', u.id);
      // Poradie = psie číslo vzostupne (13. 10. 2026, Danka #42: „pri mojom profile
      // nech je Belga“ — mala pri sebe Adu #45, lebo sa radilo podľa pridania).
      // Sedí s identitou majiteľa: nesieš svoje NAJNIŽŠIE psie číslo, takže pes
      // vedľa človeka je ten, ktorého číslo človek nesie.
      // Vlastné poradie (pilulka PORADIE na `/pack/dogs`, 13. 10. 2026) ho prebije —
      // `lib/dogOrder.ts`, to isté, čo číta `/pack/dogs` aj KRONIKA.
      const [{ data }, order] = await Promise.all([
        dogsQuery
          .order('pack_number', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true }) as Promise<{ data: DogRow[] | null }>,
        readDogOrder(),
      ]);

      if (!mounted) return;
      // pack_number is stored directly on dogs row (seal_pack_number at payment time).
      // No pack_members lookup needed.
      setDogs(applyDogOrder((data ?? []) as DogRow[], order));
    }

    async function loadStats() {
      try {
        const j = await getPackStats<PackStats>();
        if (!mounted) return;
        setStats(j);
      } catch {
        // best-effort
      }
    }

    load();
    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  // Krajina majiteľa = country z prvého psa s vyplnenou krajinou → pin na globe.
  const ownerCountry = (dogs ?? [])
    .map((d) => (d.country ?? '').trim())
    .find((c) => c.length > 0) ?? null;

  if (welcome) return <Navigate to="/pack/profile?welcome=1" replace />;

  return (
    <PackLayout>
      <PackAnimations />
      {/* PREHLIADKA sa odtiaľto presťahovala do spodnej lišty (`PackBottomNav`, 6. 10. 2026) —
          ukazuje sa na každej obrazovke s lištou podľa registra `wizSteps.ts`, nie len tu. */}

      <div className="relative flex flex-col gap-6">
        {/* Ambient drifting orbs */}
        <AmbientOrbs />

        {/* ── JA + SVORKA (`HeroCard`) z DOMOVA ODIŠLO 23. 10. 2026 — Matej: „1blok je už teraz
            aplikovaný v /profile = vymaž ho z homepage". Meno, psy, DEVOTION a BONES nesie
            profil JA. `HeroCard.tsx` NEMAZAŤ — parkuje ako `PackTree`/`DailyPrayers`.
            Kroky prehliadky `home.hero` a `home.dogs` odišli s ním (`wizSteps.ts`). */}

        {/* MODLITBY (denný rituál) — ZATIAĽ CELKOM PREČ (Matej 6.8.2026: „tieto motlitby
            sme si povedali že sa rušia (zatial celkom preč)"). Z karty psa odišli a na homepage
            sa NEMOUNTUJÚ. Kód nie je zmazaný — parkuje v `components/pack/DailyPrayers.tsx`,
            aby sa dal vrátiť, až keď bude denný rituál naozaj na rade. NEMOUNTOVAŤ bez Mateja. */}

        {/* ── DNES — plagát výletu (70 %) + planéta s mapou (30 %) ──
            ⚠️ Za DEV_FULL zámerne: `/pack` je LIVE, ale `/pack/map` ešte nie. Bez tejto
            podmienky by každý platiaci člen videl kartu, ktorej jediné tlačidlo („Explore
            the map") vedie na routu, čo ho hodí späť na `/pack` — slepá ulička. Blok sa
            objaví v ten istý moment ako mapa, keď flag padne.
            ⚠️ `NextTripCard` tu bol do 9.8.2026 a robil ten istý odpočet — `TripSpotlight`
            ho NAHRADIL, nie doplnil. Nemountovať oba naraz (odpočet dvakrát). Starý
            komponent parkuje ako `PackTree`/`DailyPrayers`. */}
        {/* ── BOL SI TAM? — karta v deň výletu (Matej 2026-08-25, postavená 26. 8.) ──
            Objaví sa LEN keď je na čo odpovedať: vlastný plán, ktorého termín už uplynul
            (7-dňové okno, `planReminder.planPhase`). Zámerne NAD plagátom a ako vlastný blok
            — Matej si to tak vybral, keď dostal na výber oproti prepnutiu plagátu na otázku:
            plagát tak ostane plagátom a otázka zmizne v momente odpovede.
            ⚠️ Za `DEV_FULL` z toho istého dôvodu ako `TripSpotlight` nižšie — všetky tri
            odpovede vedú do `/pack/map`, ktorá zatiaľ nie je pre členov živá. */}
        {DEV_FULL && PLANNING_LIVE && <Suspense fallback={null}><PlanAskCard /></Suspense>}

        {DEV_FULL && <Suspense fallback={null}><TripSpotlight email={user?.email} ownerName={user?.name} /></Suspense>}

        {/* ── KAM IDEM — dva zrkadlové bloky: DOGMA · AINUBIS (Matej 9.8.) ──
            Obrázky sedia na vonkajších okrajoch riadku, texty vnútri; na mobile bloky
            NEZALAMUJÚ pod seba, obrázok sa stane výrezom na pozadí karty.
            ⚠️ `QuickTiles` (pás MAPA · DOGMA · AINUBIS) tým skončil — súbor NEMAZAŤ,
            parkuje ako `PackTree`/`DailyPrayers`. Dlaždica MAPA nie je diera: na mapu
            vedie celá pravá karta bloku 2 vyššie. */}
        <div id={WIZ.gateways}>
          <Gateways />
        </div>

        {/* Sacred interlude — verš dňa z ústavy (rotuje denne) */}
        <Suspense fallback={null}><VerseOfTheDay /></Suspense>

        {/* ── KTO SME — planéta + míľniky + TOP krajiny + POKLADNICA ── */}
        <div id={WIZ.globe}>
          <GlobePulse total={stats?.dogs ?? stats?.total ?? 0} topCountries={stats?.topCountries ?? []} topBreeds={stats?.topBreeds ?? []} ownerCountry={ownerCountry} />
        </div>

        {/* ── ŠÍR TO ĎALEJ (`FounderInvite`) z DOMOVA ODIŠLO 23. 10. 2026 — pravá polovica (BONES, línia,
            odkaz) žije v šuplíku BONES na profile, ľavá (karta psa) je okno ZDIEĽAJ KARTU PSA
            (POZVI na profile + ZDIEĽAJ ODKAZ v BONES). `FounderInvite.tsx` NEMAZAŤ — parkuje. */}

        {/* Účet / nastavenia (PackSettings) ODIŠLI do JA 5. 10. 2026 (test po FLIPe: duplikát
            + SIGN OUT na DOMOVE). `?welcome=1` z uvítacieho mailu presmeruje hore na
            `/pack/profile?welcome=1`, kde PackSettings modál na heslo otvorí sám. */}

        <div style={{ height: 32 }} />
      </div>
    </PackLayout>
  );
}

// Bez `filter: blur` (audit 26. 9. 2026): radiálny gradient do priehľadna je mäkký sám,
// rozostrenie nad ním len nútilo prehliadač prekresľovať 2 veľké vrstvy v nekonečnej animácii.
function AmbientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <span
        className="absolute"
        style={{
          top: '8%',
          left: '-6%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.16) 0%, transparent 70%)',
          animation: 'pack-drift-a 22s ease-in-out infinite',
        }}
      />
      <span
        className="absolute"
        style={{
          top: '35%',
          right: '-8%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 154, 63, 0.10) 0%, transparent 70%)',
          animation: 'pack-drift-b 28s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function PackAnimations() {
  return (
    <style>{`
      @keyframes pack-breathe {
        0%, 100% { transform: scale(1); opacity: 0.85; }
        50% { transform: scale(1.06); opacity: 1; }
      }
      @keyframes pack-drift-a {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(40px, 30px); }
      }
      @keyframes pack-drift-b {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-50px, -40px); }
      }
      @keyframes ms-fade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pack-card-hover {
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        will-change: transform;
      }
      .pack-card-hover:hover {
        transform: translateY(-3px);
      }
      /* ⚠️ TIEŇ PRI DOTYKU NEDOSTANE BLOK V ZLATOM RÁME (2026-09-11). Matej: „pri dotyku
         1.bloku a komunity sa stratí 3d vykreslenie a vyzerá to blbo — pri dotyku sa dizajn
         nemení, len sa pohne, štruktúra sa nemení."
         PREČO: box-shadow je jedna vlastnosť, nie zoznam, do ktorého sa dá prispieť.
         goldFrameCSS() má v nej NAHUSTENÝ celý odliatok — 1px zlatý obrys, vrhnutý tieň
         rámu a inset, ktorým je doska zapustená do lemu. Hover ju prepísal jedným mäkkým
         tieňom, takže blok na dotyk stratil rám aj hĺbku a vyzeral ako plochá nálepka.
         Riešenie je NEDOTKNÚŤ SA JEJ — nadvihnutie nesie transform, ten stačí. */
      .pack-card-hover:not(.pk-goldblock):hover {
        box-shadow: 0 28px 60px -25px rgba(31, 26, 14, 0.28);
      }
    `}</style>
  );
}



