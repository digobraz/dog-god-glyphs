import { useEffect, useState } from 'react';
import { useT } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { PackLayout } from '@/components/pack/PackLayout';
import { PACK_THEME } from '@/components/pack/packTheme';
import { HeroCard } from '@/components/pack/HeroCard';
import { PackSettings } from '@/components/pack/PackSettings';
import { GlobePulse } from '@/components/pack/GlobePulse';
import { FounderInvite } from '@/components/pack/FounderInvite';
import { VerseOfTheDay } from '@/components/pack/VerseOfTheDay';
import { PackWizard } from '@/components/pack/PackWizard';
import { WIZ } from '@/components/pack/wizAnchors';
// NextTripCard parkuje (nahradený TripSpotlightom 9.8.2026) — pozri komentár pri bloku nižšie.
import { TripSpotlight } from '@/components/pack/TripSpotlight';
import { PlanAskCard } from '@/components/pack/PlanAskCard';
import { Gateways } from '@/components/pack/Gateways';
import { DEV_FULL } from '@/lib/packFlags';
import { DEV_NOAUTH, DEV_MOCK_DOGS, DEV_MOCK_USER } from '@/lib/devMockDogs';
import { EDGE_BASE } from '@/lib/env';

const T = PACK_THEME;

const STATS_EDGE = `${EDGE_BASE}/get-pack-stats`;

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
//   · PackSettings — NEMÔŽE odísť do `/pack/profile`, kým je profil za `DEV_FULL`:
//     člen by stratil odhlásenie aj zmenu hesla a rozbil by sa post-payment
//     deep-link `/pack?welcome=1`, ktorý tu otvára modál na nastavenie hesla.
// ─────────────────────────────────────────────────────────────────────────────

interface DogRow {
  id: string;
  user_id: string | null;
  dog_name: string | null;
  owner_name: string | null;
  cloudinary_main_url: string | null;
  cloudinary_extras: string[] | null;
  heroglyph_code: string | null;
  heroglyph_png_url: string | null;
  share_card_url: string | null;
  breed: string | null;
  country: string | null;
  grid_message: string | null;
  stripe_session_id: string | null;
  created_at: string;
  pack_number?: number | null;
  selections?: { ownerGender?: string | null } | null;
  // Svorka na homepage (blok 2) ukazuje dni nažive + health status — bez týchto
  // polí by sa oboje muselo dopočítať až na profile psa.
  birth_year?: number | null;
  life_status?: string | null;   // 'alive' | 'deceased'
  death_date?: string | null;
  health_status?: string | null;
}

interface PackStats {
  total: number;
  last24h: number;
  last30d: number;
  topCountries: { country: string; count: number }[];
  topBreeds: { breed: string; count: number }[];
  appVotes: number;
  featureVotes: Record<string, number>;
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
  const [dogs, setDogs] = useState<DogRow[] | null>(null);
  const [stats, setStats] = useState<PackStats | null>(null);
  const [user, setUser] = useState<UserMeta | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // DEV bez prihlásenia (`VITE_PACK_NOAUTH=1`) — zdroj mocka je jeden pre celý
      // pack (`lib/devMockDogs.ts`), tu sa len premapuje na tvar `DogRow`.
      // Bez toho homepage zamrzne na skeletone a prehliadka svieti do prázdna.
      if (DEV_NOAUTH) {
        if (!mounted) return;
        setUser({ ...DEV_MOCK_USER });
        setDogs(DEV_MOCK_DOGS.map((d) => ({
          id: d.id,
          user_id: 'dev-mock-user',
          dog_name: d.dog_name,
          owner_name: DEV_MOCK_USER.fullName,
          cloudinary_main_url: d.cloudinary_main_url,
          cloudinary_extras: null,
          heroglyph_code: null,
          heroglyph_png_url: d.heroglyph_png_url,
          share_card_url: null,
          breed: null,
          country: d.country,
          grid_message: null,
          stripe_session_id: null,
          created_at: new Date().toISOString(),
          pack_number: d.pack_number,
          selections: d.selections as DogRow['selections'],
          birth_year: d.birth_year,
          life_status: d.life_status,
          death_date: d.death_date,
          health_status: null,
        })));
        return;
      }

      const { data: { user: u } } = await supabase.auth.getUser();
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
      supabase
        .rpc('get_or_create_my_affiliate')
        .then(({ data }) => {
          const row = (data as { points?: number }[] | null)?.[0];
          if (!mounted) return;
          setUser((u) => (u ? { ...u, bones: Number(row?.points) || 0 } : u));
        });

      // payment_status filter: abandoned-cart capture (2026-07-10) writes
      // 'draft' rows that share the buyer's user_id — without the filter the
      // pack shows the same dog twice (draft + paid duplicate avatars).
      const { data } = await (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => {
                order: (col: string, opts: { ascending: boolean }) => Promise<{ data: DogRow[] | null }>;
              };
            };
          };
        };
      })
        .from('dogs')
        .select('id, user_id, dog_name, owner_name, cloudinary_main_url, cloudinary_extras, heroglyph_code, heroglyph_png_url, share_card_url, breed, country, grid_message, stripe_session_id, pack_number, created_at, selections, birth_year, life_status, death_date, health_status')
        .eq('user_id', u.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (!mounted) return;
      // pack_number is stored directly on dogs row (seal_pack_number at payment time).
      // No pack_members lookup needed.
      setDogs((data ?? []) as DogRow[]);
    }

    async function loadStats() {
      try {
        const res = await fetch(STATS_EDGE);
        const j = (await res.json()) as PackStats;
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

  const treeDogs = (dogs ?? []).map((d) => ({
    id: d.id,
    dog_name: d.dog_name,
    cloudinary_main_url: d.cloudinary_main_url,
    heroglyph_code: d.heroglyph_code,
    heroglyph_png_url: d.heroglyph_png_url,
    breed: d.breed,
    pack_number: d.pack_number ?? null,
    country: d.country,
    selections: (d.selections ?? null) as Record<string, string> | null,
    birth_year: d.birth_year ?? null,
    life_status: d.life_status ?? null,
    death_date: d.death_date ?? null,
    health_status: d.health_status ?? null,
  }));

  // Meno majiteľa — ZDROJ PRAVDY = `full_name` z účtu (mení sa v /pack/profile).
  // Predtým vyhrával `dogs.owner_name` (kartuša z checkoutu) a prebíjal ho, takže
  // zmena mena sa po reloade vrátila späť = editácia bola fakticky mŕtva.
  // `owner_name` ostáva nedotknuté — je to kartuša na certifikáte a faktúre (doklad),
  // slúži tu už len ako fallback pre účet bez vyplneného mena.
  const firstName = (raw: string) =>
    raw.split(' ')[0].charAt(0).toUpperCase() + raw.split(' ')[0].slice(1).toLowerCase();
  const cartoucheName = (dogs ?? [])
    .map((d) => (d.owner_name ?? '').trim())
    .find((n) => n.length > 0);
  // Poradie: účet (/pack/profile) → kartuša z checkoutu → meno odvodené z e-mailu.
  const displayName = user?.fullName
    ? firstName(user.fullName)
    : cartoucheName
      ? firstName(cartoucheName)
      : (user?.name ?? 'Dogyptian');

  // Faraón placeholder podľa pohlavia majiteľa (z heroglyph selections), keď chýba reálna fotka
  const ownerGender = (dogs ?? [])
    .map((d) => d.selections?.ownerGender)
    .find((g): g is 'man' | 'woman' => g === 'man' || g === 'woman') ?? null;

  // Krajina majiteľa = country z prvého psa s vyplnenou krajinou → pin na globe.
  const ownerCountry = (dogs ?? [])
    .map((d) => (d.country ?? '').trim())
    .find((c) => c.length > 0) ?? null;

  // Primary dog for wizard navigation (lowest pack_number, else first loaded).
  const primaryDog = (dogs ?? []).reduce<DogRow | null>((best, d) => {
    if (!best) return d;
    return (d.pack_number ?? Infinity) < (best.pack_number ?? Infinity) ? d : best;
  }, null);

  return (
    <PackLayout wide>
      <PackAnimations />
      {/* PREHLIADKA (AInubis) — prestavaná 24. 8. 2026 podľa `plany/wizard-ainubis.md`.
          Stále DEV-only: scenár vedie do svorky a na mapu, obe sú na LIVE za `DEV_FULL`,
          a spodná lišta tiež — pustiť ju skôr = viesť členov do zamknutých dverí.
          Ide von s vlnou, ktorá pack odomkne (+ mail o novinke, uvidia ju VŠETCI členovia).
          Kotvy spotlightu čítaj z `components/pack/wizAnchors.ts`, nie ako voľný string. */}
      {import.meta.env.DEV && (
        <PackWizard primaryDogId={primaryDog?.id ?? null} primaryDogName={primaryDog?.dog_name ?? null} />
      )}

      <div className="relative flex flex-col gap-6">
        {/* Ambient drifting orbs */}
        <AmbientOrbs />

        {/* ── JA + SVORKA — JEDEN blok (konsolidácia 2026-08-08, Matej: „ideme
            zjednodušiť, 1 blok nie dva v riadku… nakoniec tie veci sú aj v /dogs").
            Fialový `PackTree` sa tu už nemountuje; rad [majiteľ] [psy] [+] je vnútri
            HeroCard. `PackTree.tsx` NEMAZAŤ — parkuje, tak ako DailyPrayers.
            Kotva `WIZ.hero` = prvý krok prehliadky. Druhý krok svieti na rad psov
            VNÚTRI HeroCard (`WIZ.dogsRow`) — dve kotvy na tom istom bloku by boli
            dva kroky s tým istým spotlightom. */}
        <div id={WIZ.hero} className="relative">
          <div>
            {!user ? (
              <TreeSkeleton />
            ) : (
              <HeroCard
                name={displayName}
                email={user.email}
                avatarUrl={user.avatarUrl}
                genderPlaceholder={ownerGender}
                devotion={user.devotion}
                bones={user.bones}
                stats={stats ? { last24h: stats.last24h, last30d: stats.last30d, total: stats.total } : null}
                dogs={dogs === null ? null : treeDogs}
              />
            )}

          </div>
        </div>

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
        {DEV_FULL && <PlanAskCard />}

        {DEV_FULL && <TripSpotlight email={user?.email} ownerName={user?.name} />}

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
        <VerseOfTheDay />

        {/* ── KTO SME — planéta + míľniky + TOP krajiny + POKLADNICA ── */}
        <div id={WIZ.globe}>
          <GlobePulse total={stats?.total ?? 0} topCountries={stats?.topCountries ?? []} topBreeds={stats?.topBreeds ?? []} ownerCountry={ownerCountry} />
        </div>

        {/* ── ŠÍR TO ĎALEJ — JEDEN blok o dvoch poloviciach (Matej 12.8.: „rozdel tento
            gradient blok na 2 časti… týmto krokom zlúčime blok 7-8 do jedného").
            Vľavo share karta psa + zdieľanie + odkaz na WALL, vpravo affiliate a rozpad
            milodaru. Zámerne až tu (Matej 5.8.): najprv nech člen vidí, čo dostal a prečo
            to existuje, až potom ho žiadame, aby pozval kamaráta.
            ⚠️ `PackShareCard` sa tu UŽ NEMOUNTUJE — jeho obsah je v ľavej polovici. Súbor
            parkuje (ako `PackTree`/`DailyPrayers`); vrátiť ho sem = zdieľanie dvakrát. */}
        <FounderInvite
          dogName={primaryDog?.dog_name ?? null}
          packNumber={primaryDog?.pack_number ?? null}
          shareCardUrl={primaryDog?.share_card_url ?? null}
        />

        {/* Účet / nastavenia — ostáva na homepage AJ po odomknutí `/pack/profile` (2026-08-06).
            ⚠️ NEODSTRAŇOVAŤ bez zmeny edge fn `send-certificate`: welcome e-mail po platbe
            linkuje na `/pack?welcome=1` (`profileNext`) a práve PackSettings ten parameter
            číta a otvára modál na nastavenie hesla. Bez neho by nový platiaci člen nemal
            kde nastaviť heslo. PackProfile vie `?welcome=1` tiež — až keď sa prepíše link
            v edge funkcii, môže tento blok z homepage odísť. */}
        <PackSettings />

        <div style={{ height: 32 }} />
      </div>
    </PackLayout>
  );
}

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
          filter: 'blur(8px)',
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
          filter: 'blur(10px)',
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
      @keyframes pack-shimmer {
        0% { transform: translateX(-120%); }
        100% { transform: translateX(120%); }
      }
      @keyframes pack-live-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        80% { transform: scale(2.4); opacity: 0; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes pack-bond-pulse {
        0%, 100% { transform: translate(-50%, 0) scale(1); box-shadow: 0 6px 18px -6px rgba(201, 154, 63, 0.35), 0 0 0 0 rgba(201, 154, 63, 0.4); }
        50% { transform: translate(-50%, 0) scale(1.08); box-shadow: 0 6px 22px -4px rgba(201, 154, 63, 0.55), 0 0 0 8px rgba(201, 154, 63, 0); }
      }
      @keyframes pack-bond-flow {
        0% { background-position: 0 0; }
        100% { background-position: 18px 0; }
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
        box-shadow: 0 28px 60px -25px rgba(31, 26, 14, 0.28);
      }
    `}</style>
  );
}


function TreeSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: T.cardGrad,
        border: `1.5px solid ${T.cardEdge}`,
        borderRadius: 16,
        boxShadow: T.cardShadow,
        padding: 26,
      }}
    >
      <div
        className="mx-auto"
        style={{ width: 72, height: 72, borderRadius: '50%', background: T.bg }}
      />
      <div className="mx-auto mt-3" style={{ width: 2, height: 22, background: T.border }} />
      <div className="mt-3" style={{ height: 76, background: T.bg, borderRadius: 18 }} />
    </div>
  );
}
